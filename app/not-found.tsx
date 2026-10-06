import { RetroWindow } from "@/components/ui/RetroWindow";
import { ErrorPanel } from "@/components/ui/States";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl pt-6">
      <RetroWindow title="ERROR_404.EXE" footerLeft="SYSTEM HALTED">
        <ErrorPanel code="404" title="SYSTEM NOT FOUND" message="Looks like this PC doesn't exist." action={{ href: "/", label: "BACK TO LAB" }} />
      </RetroWindow>
    </div>
  );
}
