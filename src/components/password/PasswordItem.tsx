
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoredPassword } from "@/lib/db";
import { Clipboard, Copy, Eye, EyeOff, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PasswordItemProps {
  password: StoredPassword;
  onEdit: (password: StoredPassword) => void;
  onDelete: (id: string) => void;
}

export function PasswordItem({ password, onEdit, onDelete }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);
  
  useEffect(() => {
    if (password.url) {
      try {
        // Extract the hostname from the URL
        const url = new URL(password.url.startsWith('http') ? password.url : `https://${password.url}`);
        const hostname = url.hostname;
        
        // Set the favicon using Google's favicon service
        setFavicon(`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`);
      } catch (error) {
        // If URL parsing fails, try a simpler approach
        const domain = password.url.replace(/^https?:\/\//, '').split('/')[0];
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
    }
  }, [password.url]);
  
  const copyToClipboard = (text: string, type: "username" | "password") => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    
    toast.success(`${type === "username" ? "Username" : "Password"} copied to clipboard`);
    
    // Auto-clear after 30 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 30000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {favicon ? (
                  <img 
                    src={favicon} 
                    alt={password.name} 
                    className="h-6 w-6 object-contain"
                    onError={() => setFavicon(null)} 
                  />
                ) : (
                  <span className="text-primary text-lg font-semibold">
                    {password.name.substring(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">{password.name}</h3>
                <p className="text-sm text-muted-foreground">{password.url}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-slideIn">
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => onEdit(password)}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                  onClick={() => onDelete(password.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{password.username}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(password.username, "username")}
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy username</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Password</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {showPassword ? password.password : "••••••••"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(password.password, "password")}
                >
                  <Clipboard className="h-3 w-3" />
                  <span className="sr-only">Copy password</span>
                </Button>
              </div>
            </div>
            
            {password.category && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Category</div>
                <div className="text-sm font-medium">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {password.category}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
