export const FORUM_CATEGORIES = ["news", "builds", "help", "offtopic"] as const;
export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export const FORUM_LABELS: Record<ForumCategory, string> = { news: "NEWS", builds: "BUILDS", help: "HELP", offtopic: "OFF-TOPIC" };
export const FORUM_COLORS: Record<ForumCategory, string> = { news: "#3ce6b0", builds: "#b48cff", help: "#f7d58b", offtopic: "#ff7eb6" };

export interface Author {
  id: string;
  username: string;
  avatar: string;
}

export interface ThreadView {
  id: string;
  category: ForumCategory;
  title: string;
  body: string;
  xUrl: string | null;
  buildId: string | null;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  author: Author;
}

export interface ReplyView {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
}

export const CHAT_MAX_LENGTH = 500;

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  body: string;
  censored: boolean;
  createdAt: string;
}

/** A user's chat standing. `mutedUntil` is an ISO time; permanent bans ignore it. */
export interface ChatSanction {
  violationCount: number;
  mutedUntil: string | null;
  permanent: boolean;
}

export type ChatSendResult =
  | { ok: true; message: ChatMessage; notice?: string; sanction?: ChatSanction }
  | { ok: false; error: string; sanction?: ChatSanction };
