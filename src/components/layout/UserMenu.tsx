import { useAuth } from "@/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  
  useEffect(() => {
    if (!user) return;
    
    // Set display name
    setDisplayName(user.name);
    
    // Calculate initials
    const userInitials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    
    setInitials(userInitials);
  }, [user]);
  
  if (!user) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 border border-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <span className="text-sm font-medium hidden sm:inline-block">
            {displayName}
          </span>
          <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-105">
            <AvatarImage src={user.profileImage || undefined} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground text-base">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 animate-fadeIn" align="end">
        <DropdownMenuLabel className="text-sm font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium leading-none">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
