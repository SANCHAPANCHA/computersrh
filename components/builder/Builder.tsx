"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useViewer } from "@/components/layout/Providers";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { useToast } from "@/components/ui/PixelToast";
import { saveBuild, type SaveBuildInput } from "@/lib/db/actions";
import type { GameConfig } from "@/data/economy";
import { installRig } from "@/lib/game/actions";
import { canFinish, checkCandidate, componentsFor, encodeSelection, hasErrors } from "@/lib/pc-engine";
import { leveled, type Levels } from "@/lib/pc-engine/levels";
import { clearPendingSave } from "@/lib/pending-save";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_LABELS, RARITIES, type GameComponent, type Rarity } from "@/types/game";
import { BootSequence } from "./BootSequence";
import { LivePanel } from "./LivePanel";
import { PartCard } from "./PartCard";
import { DEFAULT_FILTERS, PartFilters, type PartFilterState } from "./PartFilters";
import { RevealScreen } from "./RevealScreen";
import { SaveModal } from "./SaveModal";
import { ShareModal } from "./ShareModal";
import { StepStrip } from "./StepStrip";
import { useBuilder, type BuilderState } from "./useBuilder";

/** "My PC" mode: build/upgrade the player's owned rig with credits. */
export interface RigMode {
  credits: number;
  levels: Levels;
  spares: Record<string, number>;
  unbuyable: Rarity[];
  priceMultiplier: number;
  upgrades: GameConfig["upgrades"];
  hasRig: boolean;
}

export function Builder({ initial, fromUrl, rig }: { initial: Partial<BuilderState>; fromUrl: boolean; rig?: RigMode }) {
  const router = useRouter();
  const toast = useToast();
  const { viewer, authEnabled } = useViewer();
  const { state, dispatch, summary, clearDraft, buildTimeSeconds } = useBuilder(initial, fromUrl, rig ? { persist: false, levels: rig.levels, upgrades: rig.upgrades } : undefined);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<PartFilterState>(DEFAULT_FILTERS);

  const category = CATEGORIES[state.step];
  const allOptions = useMemo(
    () => componentsFor(category).map((c) => (rig ? leveled(c, rig.levels[c.id] ?? 1, rig.upgrades) : c)) as GameComponent[],
    [category, rig],
  );
  const priceOf = (c: GameComponent) => Math.max(1, Math.round(c.price * (rig?.priceMultiplier ?? 1)));
  const rigInfoFor = (c: GameComponent) => {
    if (!rig) return undefined;
    const owned = Boolean(rig.levels[c.id]);
    const base = componentsFor(c.category).find((x) => x.id === c.id) ?? c;
    return { owned, level: rig.levels[c.id] ?? 1, spare: rig.spares[c.id] ?? 0, price: priceOf(base), locked: !owned && rig.unbuyable.includes(c.rarity) };
  };
  const cartCost = rig
    ? (Object.values(state.selection) as string[]).reduce((sum, id) => {
        if (rig.levels[id]) return sum;
        const c = CATEGORIES.flatMap((cat) => componentsFor(cat)).find((x) => x.id === id);
        return sum + (c ? priceOf(c) : 0);
      }, 0)
    : 0;
  const affordable = !rig || cartCost <= rig.credits;
  const options = useMemo(() => {
    const rank = (c: GameComponent) => RARITIES.indexOf(c.rarity);
    const list = allOptions
      .map((c) => ({ c, conflicts: checkCandidate(summary.parts, c) }))
      .filter(
        ({ c, conflicts }) =>
          (filters.rarity === "ALL" || c.rarity === filters.rarity) &&
          (!filters.compatibleOnly || state.chaos || state.selection[category] === c.id || !hasErrors(conflicts)) &&
          (!filters.ownedOnly || !rig || Boolean(rig.levels[c.id])),
      );
    const by = {
      rarity: (a: GameComponent, b: GameComponent) => rank(a) - rank(b) || a.price - b.price,
      "price-asc": (a: GameComponent, b: GameComponent) => a.price - b.price,
      "price-desc": (a: GameComponent, b: GameComponent) => b.price - a.price,
      perf: (a: GameComponent, b: GameComponent) => b.performance - a.performance || a.price - b.price,
    }[filters.sort];
    return list.sort((x, y) => by(x.c, y.c));
  }, [allOptions, filters, summary.parts, state.chaos, state.selection, category, rig]);
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
    if (rig) return void install();
    dispatch({ type: "finish" });
    window.scrollTo({ top: 0 });
  };

  async function install() {
    if (!affordable) {
      play("error");
      toast({ tone: "error", title: "NOT ENOUGH CREDITS", message: `You need ${cartCost.toLocaleString("en-US")} CR. Check in and spin the roulette to earn more.` });
      return;
    }
    setSaving(true);
    const res = await installRig(state.selection);
    setSaving(false);
    if (!res.ok) {
      play("error");
      toast({ tone: "error", title: "INSTALL FAILED", message: res.error });
      return;
    }
    toast({ tone: "success", title: rig?.hasRig ? "RIG UPGRADED" : "FIRST PC INSTALLED", message: res.spent ? `−${res.spent.toLocaleString("en-US")} CR · balance ${res.balance.toLocaleString("en-US")} CR` : "No credits spent." });
    router.refresh();
    dispatch({ type: "finish" });
    window.scrollTo({ top: 0 });
  }

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
          title={rig ? "YOUR PC IS INSTALLED" : undefined}
          customActions={
            rig ? (
              <>
                <a href="/pc" className="px-btn px-btn-mint px-btn-lg"><PixelIcon name="monitor" size={14} /> MY PC</a>
                <a href="/battles" className="px-btn px-btn-lg"><PixelIcon name="swords" size={14} /> BATTLE</a>
                <a href="/daily" className="px-btn px-btn-ghost px-btn-lg"><PixelIcon name="gift" size={14} /> EARN CREDITS</a>
              </>
            ) : undefined
          }
        />
        <SaveModal open={saveOpen} onClose={() => setSaveOpen(false)} input={saveInput} authEnabled={authEnabled} onAuthed={performSave} />
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} cardUrl={cardUrl} shareUrl={shareUrl} score={summary.score.total} fileName={`rh-pc-lab-${summary.score.total}.png`} saved={false} />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-6xl">
      <RetroWindow
        title={rig ? "MY_PC_BUILDER.EXE" : "BUILDER.EXE"}
        tag={state.chaos ? <span className="text-hot">CHAOS</span> : "RH"}
        bodyClassName="p-3 sm:p-5 lg:p-6"
        footerLeft={`${doneCount}/11 parts installed`}
        footerRight={<><span className={cn("inline-block h-2 w-2", state.chaos ? "bg-hot" : "bg-mint")} /> {state.chaos ? "RULES DISABLED" : "COMPATIBILITY ENGINE ON"}</>}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="kicker">✧ STEP {String(state.step + 1).padStart(2, "0")} / 11</div>
            <h1 className="h-display mt-1 text-3xl sm:text-4xl">{rig ? (rig.hasRig ? "UPGRADE MY PC" : "BUILD YOUR FIRST PC") : "BUILD YOUR RIG"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {rig ? null : (
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
            )}
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

        {rig ? (
          <div className="mt-3 grid grid-cols-3 gap-2" aria-live="polite">
            <div className="px-panel px-3 py-2">
              <div className="px-stat-label">CREDITS</div>
              <div className="text-xl font-bold text-gold tabular-nums">{rig.credits.toLocaleString("en-US")}</div>
            </div>
            <div className="px-panel px-3 py-2">
              <div className="px-stat-label">NEW PARTS</div>
              <div className="text-xl font-bold tabular-nums">{cartCost ? `−${cartCost.toLocaleString("en-US")}` : "0"}</div>
            </div>
            <div className={cn("px-panel px-3 py-2", affordable ? "px-panel-accent" : "!border-red")}>
              <div className="px-stat-label">AFTER INSTALL</div>
              <div className={cn("text-xl font-bold tabular-nums", affordable ? "text-mint" : "text-red")}>{(rig.credits - cartCost).toLocaleString("en-US")}</div>
            </div>
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
            <PartFilters value={filters} onChange={setFilters} shown={options.length} total={allOptions.length} chaos={state.chaos} showOwned={Boolean(rig)} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2" key={category}>
              {options.length === 0 ? (
                <div className="px-dashed col-span-full px-4 py-8 text-center text-sm text-dim">
                  NO PARTS MATCH THESE FILTERS
                  <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="ml-2 text-mint underline-offset-4 hover:underline">reset filters</button>
                </div>
              ) : null}
              {options.map(({ c, conflicts }, i) => (
                <div key={c.id} className="animate-rise" style={{ animationDelay: `${i * 35}ms` }}>
                  <PartCard component={c} selected={state.selection[category] === c.id} conflicts={conflicts} chaos={state.chaos} onSelect={() => select(c)} rigInfo={rigInfoFor(c)} />
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
              <span className="hidden sm:inline">{!finish.ok ? finish.reason : !affordable ? "Not enough credits for the new parts." : rig ? (cartCost ? `Install for ${cartCost.toLocaleString("en-US")} CR` : "Ready to install!") : "Ready to boot!"}</span>
              <span className="sm:hidden">{String(state.step + 1).padStart(2, "0")}/11 · {summary.score.total} PTS</span>
            </div>
            {state.step < CATEGORIES.length - 1 ? (
              <>
                {finish.ok ? (
                  <button type="button" className="px-btn px-btn-mint hidden sm:inline-flex" onClick={boot} disabled={saving}>{rig ? (saving ? "INSTALLING..." : "INSTALL ▶") : "BOOT ▶"}</button>
                ) : null}
                <button type="button" className="px-btn" onClick={() => { goStep(state.step + 1); play("click"); }}>
                  NEXT <PixelIcon name="arrow" size={10} />
                </button>
              </>
            ) : (
              <button type="button" className="px-btn px-btn-mint" onClick={boot} aria-disabled={!finish.ok || !affordable} disabled={saving}>
                {rig ? (saving ? "INSTALLING..." : "INSTALL RIG ▶") : "BOOT RIG ▶"}
              </button>
            )}
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}
