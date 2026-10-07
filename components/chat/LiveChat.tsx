"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useViewer } from "@/components/layout/Providers";
import { Linkify } from "@/components/ui/Linkify";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { Notice } from "@/components/ui/States";
import { useToast } from "@/components/ui/PixelToast";
import { sendChatMessage } from "@/lib/db/chat-actions";
import { formatCountdown } from "@/lib/moderation/sanctions";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { CHAT_MAX_LENGTH, type ChatMessage, type ChatSanction } from "@/types/forum";
import { CHAT_COLUMNS, muteRemaining, toChatMessage, type ChatRow } from "./chat-utils";

const PAGE = 50;
const KEEP = 300;

const sendTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function mergeMessages(cur: ChatMessage[], add: ChatMessage[]): ChatMessage[] {
  const seen = new Set(cur.map((m) => m.id));
  const fresh = add.filter((m) => !seen.has(m.id));
  if (!fresh.length) return cur;
  return [...cur, ...fresh].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Global live chat room: realtime inserts, presence-based ONLINE counter, server-enforced mutes. */
export function LiveChat({ initial, initialSanction }: { initial: ChatMessage[]; initialSanction: ChatSanction | null }) {
  const { viewer } = useViewer();
  const toast = useToast();
  const [messages, setMessages] = useState(initial);
  const [hasMore, setHasMore] = useState(initial.length >= PAGE);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [online, setOnline] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sanction, setSanction] = useState<ChatSanction | null>(initialSanction);
  const [now, setNow] = useState(() => Date.now());
  const [unseen, setUnseen] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const stick = useRef(true);
  const viewerId = viewer?.id;

  const remaining = muteRemaining(sanction, now);
  const muted = remaining > 0;
  const permanent = !!sanction?.permanent;

  // Tick once a second while a timed mute is running; lift it locally when it ends.
  useEffect(() => {
    if (!muted || permanent) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [muted, permanent]);

  const scrollToEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setUnseen(0);
  }, []);

  useLayoutEffect(() => {
    if (stick.current) scrollToEnd();
  }, [messages, scrollToEnd]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (stick.current) setUnseen(0);
  };

  const receive = useCallback((incoming: ChatMessage[], fromOthers: boolean) => {
    if (fromOthers && !stick.current) setUnseen((n) => n + incoming.length);
    setMessages((cur) => mergeMessages(cur, incoming).slice(-KEEP));
  }, []);

  // Realtime: new rows + presence on one channel.
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const key = viewerId ?? `guest-${crypto.randomUUID()}`;
    const channel = sb.channel("forum-live-chat", { config: { presence: { key } } });
    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const m = toChatMessage(payload.new as ChatRow);
        receive([m], m.userId !== viewerId);
      })
      .on("presence", { event: "sync" }, () => setOnline(Object.keys(channel.presenceState()).length))
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") void channel.track({ at: new Date().toISOString() });
      });
    return () => {
      void sb.removeChannel(channel);
    };
  }, [viewerId, receive]);

  async function loadOlder() {
    const sb = getBrowserSupabase();
    const first = messages[0];
    if (!sb || !first || loadingOlder) return;
    setLoadingOlder(true);
    const { data } = await sb.from("chat_messages").select(CHAT_COLUMNS).lt("created_at", first.createdAt).order("created_at", { ascending: false }).limit(PAGE);
    const rows = ((data ?? []) as ChatRow[]).map(toChatMessage);
    const el = listRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    stick.current = false;
    setMessages((cur) => mergeMessages(cur, rows));
    setHasMore(rows.length >= PAGE);
    setLoadingOlder(false);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || busy || muted) return;
    setBusy(true);
    setError(null);
    const res = await sendChatMessage(body);
    setBusy(false);
    setNow(Date.now());
    if (res.sanction) setSanction(res.sanction);
    if (!res.ok) return setError(res.error);
    play("click");
    setText("");
    stick.current = true;
    receive([res.message], false);
    if (res.notice) {
      setNotice(res.notice);
      toast({ tone: "error", title: "MESSAGE CENSORED", message: res.notice.replace(/^MESSAGE CENSORED · /, "") });
    } else setNotice(null);
  }

  return (
    <RetroWindow
      id="chat"
      title="LIVE_CHAT.EXE"
      tag="LIVE"
      bodyClassName="p-3 sm:p-4"
      footerLeft={`Max ${CHAT_MAX_LENGTH} chars · 1 msg / 2s`}
      footerRight={
        <span className="flex items-center gap-1.5">
          <span className={cn("inline-block h-2 w-2", connected ? "animate-blink bg-mint" : "bg-gold")} />
          {connected ? "CONNECTED" : "CONNECTING"}
        </span>
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="h-display text-2xl">LIVE CHAT</h3>
        <span className="flex items-center gap-2 border border-line-strong bg-navy-950 px-2.5 py-1.5 font-label text-[0.62rem] tracking-widest text-mint" aria-live="polite">
          <PixelIcon name="user" size={10} />
          ONLINE <b data-testid="chat-online" className="text-sm text-cream">{online ?? "–"}</b>
        </span>
      </div>

      <div className="relative">
        <ol ref={listRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="Chat messages" className="flex h-[26rem] flex-col gap-2.5 overflow-y-auto border border-line bg-navy-950/70 p-3 sm:h-[30rem]">
          {hasMore ? (
            <li className="self-center">
              <button type="button" onClick={loadOlder} disabled={loadingOlder} className="px-btn px-btn-ghost px-btn-sm">
                {loadingOlder ? "LOADING..." : "[ LOAD OLDER ]"}
              </button>
            </li>
          ) : null}
          {messages.length ? (
            messages.map((m) => {
              const mine = m.userId === viewerId;
              return (
                <li key={m.id} data-testid="chat-message" className={cn("flex gap-2", mine && "flex-row-reverse")}>
                  <PixelAvatar id={m.avatar} size={28} className="mt-0.5" />
                  <div className={cn("max-w-[85%] min-w-0 border px-2.5 py-1.5", mine ? "border-mint/60 bg-mint/10" : "border-line bg-navy-900/80")}>
                    <div className="flex items-center gap-2 text-xs">
                      <Link href={`/u/${m.username}`} className={mine ? "text-mint" : "text-lilac"}>@{m.username}</Link>
                      <time dateTime={m.createdAt} suppressHydrationWarning className="text-faint">{sendTime(m.createdAt)}</time>
                      {m.censored ? <span className="font-label text-[0.5rem] tracking-widest text-gold">CENSORED</span> : null}
                    </div>
                    <p className="read mt-0.5 whitespace-pre-line break-words text-sm">
                      <Linkify text={m.body} />
                    </p>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="m-auto text-center text-sm text-dim">NO MESSAGES YET. Say hi to the lab!</li>
          )}
        </ol>
        {unseen > 0 ? (
          <button type="button" onClick={() => { stick.current = true; scrollToEnd(); }} className="px-btn px-btn-mint px-btn-sm absolute bottom-2 left-1/2 -translate-x-1/2">
            ▼ {unseen} NEW
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {notice ? <Notice tone="error" title="CENSORED">{notice}</Notice> : null}
        {!viewer ? (
          <div className="px-dashed flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-dim">
            <span>Guests can read. Log in to join the chat.</span>
            <PixelButton href="/login?next=/forum" variant="mint" size="sm">[ LOG IN ]</PixelButton>
          </div>
        ) : permanent ? (
          <div role="status" className="border-2 border-red bg-red/10 px-4 py-3 text-center font-label text-xs tracking-widest text-red">
            <PixelIcon name="lock" size={12} className="mr-2 inline" />
            PERMANENT CHAT BAN
            <div className="mt-1 font-sans text-[0.7rem] tracking-normal text-dim">The rest of the site still works.</div>
          </div>
        ) : muted ? (
          <div role="status" className="border-2 border-red bg-red/10 px-4 py-3 text-center font-label text-xs tracking-widest text-red">
            <PixelIcon name="lock" size={12} className="mr-2 inline" />
            CHAT DISABLED · unmutes in <b data-testid="chat-countdown" suppressHydrationWarning className="text-sm text-cream">{formatCountdown(remaining)}</b>
          </div>
        ) : (
          <form onSubmit={send} className="flex flex-col gap-1.5">
            {error ? <div role="alert" className="text-xs text-red">{error}</div> : null}
            <div className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">Chat message</label>
              <input
                id="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={CHAT_MAX_LENGTH}
                autoComplete="off"
                placeholder="Say something nice to the lab…"
                className="px-input min-w-0 flex-1"
              />
              <PixelButton type="submit" variant="mint" disabled={busy || !text.trim()}>
                {busy ? "..." : "[ SEND ]"}
              </PixelButton>
            </div>
            <div className="text-right text-xs text-faint">{text.length}/{CHAT_MAX_LENGTH} · Enter to send</div>
          </form>
        )}
      </div>
    </RetroWindow>
  );
}
