export interface XMedia {
  type: "photo" | "video" | "animated_gif";
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface XPost {
  id: string;
  username: string;
  text: string;
  postedAt: string;
  media: XMedia[];
  metrics: { likes?: number; reposts?: number; replies?: number };
}

export interface XFeedResponse {
  /** "api": posts mirrored via the X API. "embed": no API key, use X's official widget. */
  mode: "api" | "embed";
  username: string;
  posts: XPost[];
  updatedAt: string;
  stale?: boolean;
}

export const xPostUrl = (username: string, id: string) => `https://x.com/${username}/status/${id}`;

export const X_STATUS_RE = /^https:\/\/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{1,25})$/;
