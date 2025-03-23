
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface RecoveryPhraseInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phrase: string) => void;
  title: string;
  description: string;
}

export function RecoveryPhraseInputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: RecoveryPhraseInputDialogProps) {
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(phrase);
    setPhrase("");
  };

  const handleClose = () => {
    setPhrase("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-phrase">Recovery Phrase</Label>
              <div className="relative">
                <Input
                  id="recovery-phrase"
                  type={showPhrase ? "text" : "password"}
                  placeholder="Enter recovery phrase"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
                  onClick={() => setShowPhrase(!showPhrase)}
                >
                  {showPhrase ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPhrase ? "Hide phrase" : "Show phrase"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!phrase.trim()} 
              className="bg-primary hover:bg-primary/90"
            >
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
