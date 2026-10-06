"use client";

import { useRouter } from "next/navigation";
import { AuthForm, type AuthMode } from "./AuthForm";
import { readPendingSave } from "@/lib/pending-save";

/** Auth form for standalone pages: resumes a pending build save if there is one. */
export function AuthPageForm({ mode, next }: { mode: AuthMode; next: string }) {
  const router = useRouter();
  return (
    <AuthForm
      mode={mode}
      next={next}
      showUsername={mode === "register"}
      onAuthed={() => {
        router.push(readPendingSave() ? "/save" : next);
        router.refresh();
      }}
    />
  );
}
