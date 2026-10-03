import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ResumeExample } from "@/lib/resume-examples";

type Props = {
  example: ResumeExample;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
};

/** Downloads a resume example as an ATS-safe PDF, built in the browser. */
export function ResumeExampleDownload({
  example,
  className,
  size = "default",
  variant = "outline",
  label = "Download PDF",
}: Props) {
  const [busy, setBusy] = useState(false);

  async function download(event: React.MouseEvent) {
    // Cards wrap this button in a link — never navigate on download.
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const { buildExampleResumePdf } = await import("@/lib/resume-pdf");
      const doc = await buildExampleResumePdf(example);
      doc.save(`${example.slug}-resume-example.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={download}
      disabled={busy}
      aria-label={`Download the ${example.role} resume example as a PDF`}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  );
}
