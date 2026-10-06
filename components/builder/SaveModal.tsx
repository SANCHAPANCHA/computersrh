"use client";

import { useState } from "react";
import { AuthForm, type AuthMode } from "@/components/auth/AuthForm";
import { PixelModal } from "@/components/ui/PixelModal";
import { Notice } from "@/components/ui/States";
import { storePendingSave } from "@/lib/pending-save";
import type { SaveBuildInput } from "@/lib/db/actions";

interface Props {
  open: boolean;
  onClose: () => void;
  input: SaveBuildInput;
  authEnabled: boolean;
  /** Runs the actual save once the user has a session. */
  onAuthed: () => Promise<void>;
}

export function SaveModal({ open, onClose, input, authEnabled, onAuthed }: Props) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  return (
    <PixelModal open={open} onClose={onClose} title={pendingEmail ? "CHECK_INBOX.EXE" : "SAVE_BUILD.EXE"} footerLeft="Email only · no wallet needed">
      {!authEnabled ? (
        <Notice tone="warn" title="SAVE FAILED: ACCOUNTS OFFLINE">
          This lab isn&apos;t connected to Supabase yet, so builds can&apos;t be saved. You can still share your rig with a link and card.
        </Notice>
      ) : pendingEmail ? (
        <div className="flex flex-col gap-4">
          <h3 className="h-display text-3xl">ALMOST THERE</h3>
          <Notice tone="success" title="VERIFY YOUR EMAIL">
            We sent a link to <span className="text-ink">{pendingEmail}</span>. Open it on this device and your rig <b className="text-ink">&quot;{input.name}&quot;</b> will be saved automatically.
          </Notice>
          <p className="text-xs text-faint">Your build is stored safely in this browser until then.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="h-display text-3xl">{mode === "register" ? "SAVE YOUR BUILD" : "WELCOME BACK"}</h3>
            <p className="mt-2 text-sm text-dim">
              {mode === "register" ? "Create a free RH PC LAB account to save your PC and share it." : "Log in to save this rig to your profile."}
            </p>
          </div>
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            next="/save"
            onAuthed={onAuthed}
            onNeedsVerification={(email) => {
              storePendingSave(input);
              setPendingEmail(email);
            }}
          />
        </div>
      )}
    </PixelModal>
  );
}
