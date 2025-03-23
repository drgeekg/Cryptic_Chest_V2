
import { useTheme } from "@/components/ui/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Laptop, CircleDot, Palette } from "lucide-react";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

  // Apply the color scheme to the root element
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    
    // Set CSS variable
    document.documentElement.style.setProperty('--theme-color', getColorValue(colorScheme));
    
    // Force UI update
    document.body.classList.remove('theme-updated');
    setTimeout(() => {
      document.body.classList.add('theme-updated');
    }, 10);
  }, [colorScheme]);
  
  const getColorValue = (scheme: string): string => {
    switch (scheme) {
      case 'blue': return '#0070f3';
      case 'cyan': return '#00bcd4';
      case 'purple': return '#6200ee';
      case 'amber': return '#ff8f00';
      case 'pink': return '#e91e63';
      case 'green': return '#10b981';
      case 'teal': return '#14b8a6';
      case 'orange': return '#f97316';
      case 'red': return '#ef4444';
      default: return '#0070f3';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fadeIn animate-duration-300">
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <CircleDot className="h-4 w-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <CircleDot className="h-4 w-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setTheme("oled")}
        >
          <Moon className="h-4 w-4 fill-current" />
          <span>OLED</span>
          {theme === "oled" && <CircleDot className="h-4 w-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setTheme("system")}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && <CircleDot className="h-4 w-4 ml-auto" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Accent Color</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("blue")}
            >
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              <span>Blue</span>
              {colorScheme === "blue" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("cyan")}
            >
              <div className="h-4 w-4 rounded-full bg-cyan-500" />
              <span>Cyan</span>
              {colorScheme === "cyan" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("purple")}
            >
              <div className="h-4 w-4 rounded-full bg-purple-600" />
              <span>Purple</span>
              {colorScheme === "purple" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("amber")}
            >
              <div className="h-4 w-4 rounded-full bg-amber-500" />
              <span>Amber</span>
              {colorScheme === "amber" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("pink")}
            >
              <div className="h-4 w-4 rounded-full bg-pink-500" />
              <span>Pink</span>
              {colorScheme === "pink" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("green")}
            >
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <span>Green</span>
              {colorScheme === "green" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("teal")}
            >
              <div className="h-4 w-4 rounded-full bg-teal-500" />
              <span>Teal</span>
              {colorScheme === "teal" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("orange")}
            >
              <div className="h-4 w-4 rounded-full bg-orange-500" />
              <span>Orange</span>
              {colorScheme === "orange" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setColorScheme("red")}
            >
              <div className="h-4 w-4 rounded-full bg-red-500" />
              <span>Red</span>
              {colorScheme === "red" && <CircleDot className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
