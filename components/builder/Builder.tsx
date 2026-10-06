"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useViewer } from "@/components/layout/Providers";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { useToast } from "@/components/ui/PixelToast";
import { saveBuild, type SaveBuildInput } from "@/lib/db/actions";
import { canFinish, checkCandidate, componentsFor, encodeSelection } from "@/lib/pc-engine";
import { clearPendingSave } from "@/lib/pending-save";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_LABELS, type GameComponent } from "@/types/game";
import { BootSequence } from "./BootSequence";
import { LivePanel } from "./LivePanel";
import { PartCard } from "./PartCard";
import { RevealScreen } from "./RevealScreen";
import { SaveModal } from "./SaveModal";
import { ShareModal } from "./ShareModal";
import { StepStrip } from "./StepStrip";
import { useBuilder, type BuilderState } from "./useBuilder";

export function Builder({ initial, fromUrl }: { initial: Partial<BuilderState>; fromUrl: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const { viewer, authEnabled } = useViewer();
  const { state, dispatch, summary, clearDraft, buildTimeSeconds } = useBuilder(initial, fromUrl);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const category = CATEGORIES[state.step];
  const options = useMemo(() => componentsFor(category), [category]);
  const finish = canFinish(summary.parts, summary.conflicts, state.chaos);
  const doneCount = CATEGORIES.filter((c) => state.selection[c]).length;

  const goStep = (n: number) => {
    dispatch({ type: "step", step: n });
    // Keep the new step's heading in view when the user has scrolled down the list.
    const el = document.getElementById("step-title");
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const select = (c: GameComponent) => {
    const wasEmpty = !state.selection[c.category];
    dispatch({ type: "select", component: c });
    play("select");
    // First pick in a step auto-advances, like a game menu.
    if (wasEmpty && state.step < CATEGORIES.length - 1) setTimeout(() => goStep(state.step + 1), 260);
  };

  const boot = () => {
    if (!finish.ok) {
      play("error");
      toast({ tone: "error", title: "BUILD FAILED", message: finish.reason });
      return;
    }
    dispatch({ type: "finish" });
    window.scrollTo({ top: 0 });
  };

  const saveInput: SaveBuildInput = {
    name: state.name,
    selection: state.selection,
    rgb: state.rgb,
    chaos: state.chaos,
    buildTimeSeconds,
    isPublic: true,
  };

  async function performSave() {
    setSaving(true);
    const res = await saveBuild(saveInput);
    setSaving(false);
    if (!res.ok) {
      play("error");
      toast({ tone: "error", title: "SAVE FAILED", message: res.error });
      return;
    }
    play("success");
    clearDraft();
    clearPendingSave();
    setSaveOpen(false);
    toast({ tone: "success", title: "BUILD SAVED", message: "Your rig has a public page now." });
    res.unlocked.forEach((a, i) => setTimeout(() => toast({ tone: "achievement", title: `UNLOCKED: ${a}` }), 400 + i * 600));
    router.push(`/build/${res.id}?new=1`);
    router.refresh();
  }

  const onSave = () => (viewer ? performSave() : setSaveOpen(true));

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const enc = encodeSelection(state.selection);
  const shareUrl = `${origin}/share?parts=${enc}&rgb=${state.rgb}&name=${encodeURIComponent(state.name)}${viewer ? `&by=${viewer.username}` : ""}`;
  const cardUrl = `/api/card?parts=${enc}&rgb=${state.rgb}&name=${encodeURIComponent(state.name)}${viewer ? `&by=${viewer.username}` : ""}`;

  if (state.phase === "boot") {
    return <BootSequence summary={summary} chaos={state.chaos} onDone={() => { play("success"); dispatch({ type: "phase", phase: "reveal" }); }} />;
  }

  if (state.phase === "reveal") {
    return (
      <div className="page-enter mx-auto max-w-5xl">
        <RevealScreen
          summary={summary}
          rgb={state.rgb}
          name={state.name}
          onName={(name) => dispatch({ type: "name", name })}
          chaos={state.chaos}
          buildTimeSeconds={buildTimeSeconds}
          saving={saving}
          onSave={onSave}
          onShare={() => setShareOpen(true)}
          onAgain={() => { clearDraft(); dispatch({ type: "reset" }); router.replace("/builder"); }}
          onEdit={() => dispatch({ type: "phase", phase: "build" })}
        />
        <SaveModal open={saveOpen} onClose={() => setSaveOpen(false)} input={saveInput} authEnabled={authEnabled} onAuthed={performSave} />
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} cardUrl={cardUrl} shareUrl={shareUrl} score={summary.score.total} fileName={`rh-pc-lab-${summary.score.total}.png`} saved={false} />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-6xl">
      <RetroWindow
        title="BUILDER.EXE"
        tag={state.chaos ? <span className="text-hot">CHAOS</span> : "RH"}
        bodyClassName="p-3 sm:p-5 lg:p-6"
        footerLeft={`${doneCount}/11 parts installed`}
        footerRight={<><span className={cn("inline-block h-2 w-2", state.chaos ? "bg-hot" : "bg-mint")} /> {state.chaos ? "RULES DISABLED" : "COMPATIBILITY ENGINE ON"}</>}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="kicker">✧ STEP {String(state.step + 1).padStart(2, "0")} / 11</div>
            <h1 className="h-display mt-1 text-3xl sm:text-4xl">BUILD YOUR RIG</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={state.chaos}
              onClick={() => { dispatch({ type: "chaos", on: !state.chaos }); play(state.chaos ? "click" : "error"); }}
              className={cn("flex items-center gap-2 border px-3 py-2 text-sm tracking-wider", state.chaos ? "border-hot bg-hot/15 text-hot" : "border-line-strong text-dim hover:text-ink")}
            >
              <span className={cn("relative h-4 w-8 border", state.chaos ? "border-hot" : "border-line-strong")}>
                <span className={cn("absolute top-0.5 h-2.5 w-3 transition-[left] duration-100", state.chaos ? "left-[17px] bg-hot" : "left-0.5 bg-faint")} />
              </span>
              CHAOS MODE
            </button>
            <button type="button" onClick={() => { if (confirm("Clear all parts and start over?")) { clearDraft(); dispatch({ type: "reset" }); } }} className="px-btn px-btn-ghost px-btn-sm" disabled={!doneCount}>
              RESET
            </button>
          </div>
        </div>

        {state.chaos ? (
          <div className="mt-3 border border-hot/60 bg-hot/10 px-3 py-2 text-sm text-hot">
            <b>CHAOS MODE</b> — Rules are disabled. Anything goes. <span className="text-hot/80">(Conflicts cost score points.)</span>
          </div>
        ) : null}

        <div className="mt-4">
          <StepStrip step={state.step} selection={state.selection} conflicts={summary.conflicts} onStep={(n) => { goStep(n); play("click"); }} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <LivePanel summary={summary} rgb={state.rgb} onRgb={(rgb) => { dispatch({ type: "rgb", rgb }); play("click"); }} chaos={state.chaos} />
          </aside>

          <section aria-labelledby="step-title">
            <div className="flex items-end justify-between gap-3">
              <h2 id="step-title" className="text-2xl font-bold tracking-wide">
                SELECT YOUR <span className="text-mint">{CATEGORY_LABELS[category]}</span>
              </h2>
              {state.selection[category] ? (
                <button type="button" onClick={() => dispatch({ type: "clear", category })} className="text-xs text-dim underline-offset-4 hover:text-red hover:underline">
                  remove
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2" key={category}>
              {options.map((c, i) => (
                <div key={c.id} className="animate-rise" style={{ animationDelay: `${i * 35}ms` }}>
                  <PartCard component={c} selected={state.selection[category] === c.id} conflicts={checkCandidate(summary.parts, c)} chaos={state.chaos} onSelect={() => select(c)} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Step navigation — sticky on mobile so it's always in reach */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-5 border-t border-line bg-navy-800/95 px-3 py-3 backdrop-blur-sm sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border lg:px-4">
          <PixelProgressBar value={doneCount} max={11} label="Build progress" className="mb-3" />
          <div className="flex items-center gap-3">
            <button type="button" className="px-btn px-btn-ghost" onClick={() => { goStep(state.step - 1); play("click"); }} disabled={state.step === 0}>
              <PixelIcon name="arrow" size={10} flip /> BACK
            </button>
            <div className="flex-1 text-center text-xs text-dim">
              <span className="hidden sm:inline">{finish.ok ? "Ready to boot!" : finish.reason}</span>
              <span className="sm:hidden">{String(state.step + 1).padStart(2, "0")}/11 · {summary.score.total} PTS</span>
            </div>
            {state.step < CATEGORIES.length - 1 ? (
              <>
                {finish.ok ? (
                  <button type="button" className="px-btn px-btn-mint hidden sm:inline-flex" onClick={boot}>BOOT ▶</button>
                ) : null}
                <button type="button" className="px-btn" onClick={() => { goStep(state.step + 1); play("click"); }}>
                  NEXT <PixelIcon name="arrow" size={10} />
                </button>
              </>
            ) : (
              <button type="button" className="px-btn px-btn-mint" onClick={boot} aria-disabled={!finish.ok}>
                BOOT RIG ▶
              </button>
            )}
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}
