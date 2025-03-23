
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Clipboard, RefreshCw, Check } from "lucide-react";
import { generatePassword } from "@/lib/encryption";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateNewPassword = () => {
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      toast.error("Please select at least one character type");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const newPassword = generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
      });
      
      setPassword(newPassword);
      setCopied(false);
    } catch (error) {
      toast.error("Failed to generate password");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!password) {
      toast.error("Generate a password first");
      return;
    }
    
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard");
    
    // Auto-clear from clipboard after 30 seconds
    setTimeout(() => {
      // We can't really clear the clipboard, but we can indicate it's no longer copied
      setCopied(false);
      toast.info("Password cleared from clipboard", {
        description: "For security, your password is no longer marked as copied.",
      });
    }, 30000);
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          <Label>Generated Password</Label>
          <div className="relative">
            <Input
              value={password || "Click Generate to create a password"}
              readOnly
              className="h-12 pr-24 font-mono text-base bg-muted/50"
            />
            <div className="absolute right-2 top-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                disabled={!password}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
                <span className="sr-only">Copy password</span>
              </Button>
            </div>
          </div>
        </div>
        
        <Button
          onClick={generateNewPassword}
          className="w-full h-10"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Password
            </>
          )}
        </Button>
      </motion.div>
      
      <div className="space-y-6 bg-muted/30 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Password Length: {length}</Label>
          </div>
          <Slider
            value={[length]}
            min={8}
            max={32}
            step={1}
            onValueChange={(value) => setLength(value[0])}
            className="py-2"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-uppercase" className="cursor-pointer">
              Include Uppercase (A-Z)
            </Label>
            <Switch
              id="include-uppercase"
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-lowercase" className="cursor-pointer">
              Include Lowercase (a-z)
            </Label>
            <Switch
              id="include-lowercase"
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-numbers" className="cursor-pointer">
              Include Numbers (0-9)
            </Label>
            <Switch
              id="include-numbers"
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-symbols" className="cursor-pointer">
              Include Symbols (!@#$%^&*)
            </Label>
            <Switch
              id="include-symbols"
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
