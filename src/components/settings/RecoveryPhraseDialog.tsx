
import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";

interface RecoveryPhraseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryPhrase: string;
}

export function RecoveryPhraseDialog({
  isOpen,
  onClose,
  recoveryPhrase,
}: RecoveryPhraseDialogProps) {
  const phraseRef = useRef<HTMLPreElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      toast.success("Recovery phrase copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadPhrase = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryPhrase], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cryptic-chest-recovery-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery phrase downloaded");
  };

  // Focus trap within the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Recovery Phrase</DialogTitle>
          <DialogDescription>
            This phrase will be required to decrypt your backup. Store it securely and don't share it
            with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="rounded-md bg-muted p-4 mb-4">
            <pre
              ref={phraseRef}
              className="text-sm font-mono whitespace-pre-wrap break-all overflow-x-auto"
            >
              {recoveryPhrase}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex gap-1 items-center"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex gap-1 items-center"
              onClick={downloadPhrase}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="bg-primary hover:bg-primary/90"
          >
            I've saved my recovery phrase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
