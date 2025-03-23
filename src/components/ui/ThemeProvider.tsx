
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark" | "oled";
type ColorScheme = "blue" | "cyan" | "purple" | "amber" | "pink" | "green" | "teal" | "orange" | "red";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
};

type ThemeProviderState = {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  colorScheme: "blue",
  setTheme: () => null,
  setColorScheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorScheme = "blue",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );
  
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    () => (localStorage.getItem("color-scheme") as ColorScheme) || defaultColorScheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "oled");
    
    // Add appropriate theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      
      // Apply background gradient based on system theme
      if (systemTheme === "light") {
        document.body.style.background = getGradientForTheme(colorScheme, "light");
      } else {
        document.body.style.background = getGradientForTheme(colorScheme, "dark");
      }
    } else {
      root.classList.add(theme);
      
      // Apply background gradient based on theme
      if (theme === "light") {
        document.body.style.background = getGradientForTheme(colorScheme, "light");
      } else if (theme === "dark") {
        document.body.style.background = getGradientForTheme(colorScheme, "dark");
      } else if (theme === "oled") {
        // OLED mode: solid black background
        document.body.style.background = "#000000";
      }
    }
    
    // Store theme preference
    localStorage.setItem("theme", theme);
  }, [theme, colorScheme]);
  
  // Function to get gradient based on theme and color scheme
  const getGradientForTheme = (color: ColorScheme, themeMode: "light" | "dark") => {
    if (themeMode === "light") {
      switch (color) {
        case "blue":
          return "linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 100%)";
        case "cyan":
          return "linear-gradient(120deg, #cffafe 0%, #ecfeff 100%)";
        case "purple":
          return "linear-gradient(120deg, #f3e8ff 0%, #faf5ff 100%)";
        case "amber":
          return "linear-gradient(120deg, #fef3c7 0%, #fffbeb 100%)";
        case "pink":
          return "linear-gradient(120deg, #fce7f3 0%, #fdf2f8 100%)";
        case "green":
          return "linear-gradient(120deg, #d1fae5 0%, #ecfdf5 100%)";
        case "teal":
          return "linear-gradient(120deg, #ccfbf1 0%, #ecfeff 100%)";
        case "orange":
          return "linear-gradient(120deg, #ffedd5 0%, #fff7ed 100%)";
        case "red":
          return "linear-gradient(120deg, #fee2e2 0%, #fff1f2 100%)";
        default:
          return "linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 100%)";
      }
    } else {
      // More subtle dark mode gradients with deeper shadows
      switch (color) {
        case "blue":
          return "linear-gradient(120deg, #082f49 0%, #0c4a6e 100%)";
        case "cyan":
          return "linear-gradient(120deg, #083344 0%, #0e7490 100%)";
        case "purple":
          return "linear-gradient(120deg, #3b0764 0%, #4c1d95 100%)";
        case "amber":
          return "linear-gradient(120deg, #451a03 0%, #713f12 100%)";
        case "pink":
          return "linear-gradient(120deg, #500724 0%, #831843 100%)";
        case "green":
          return "linear-gradient(120deg, #052e16 0%, #14532d 100%)";
        case "teal":
          return "linear-gradient(120deg, #042f2e 0%, #134e4a 100%)";
        case "orange":
          return "linear-gradient(120deg, #431407 0%, #7c2d12 100%)";
        case "red":
          return "linear-gradient(120deg, #450a0a 0%, #7f1d1d 100%)";
        default:
          return "linear-gradient(120deg, #082f49 0%, #0c4a6e 100%)";
      }
    }
  };
  
  useEffect(() => {
    // Store color scheme preference
    localStorage.setItem("color-scheme", colorScheme);
    
    // Apply color scheme to CSS variables
    const root = window.document.documentElement;
    
    // Clear previous data-color-scheme
    root.removeAttribute('data-color-scheme');
    
    // Set new data-color-scheme attribute
    root.setAttribute('data-color-scheme', colorScheme);
    
    // Get color values based on the scheme and set primary color
    let hslValue: string;
    let colorValue: string;
    
    switch (colorScheme) {
      case 'blue':
        colorValue = '#0070f3';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '217.2 91.2% 59.8%' : '221.2 83% 53.3%';
        break;
      case 'cyan':
        colorValue = '#00bcd4';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '187 100% 42%' : '187 100% 42%';
        break;
      case 'purple':
        colorValue = '#6200ee';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '265.8 100% 70%' : '265.8 100% 46.9%';
        break;
      case 'amber':
        colorValue = '#ff8f00';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '36 100% 65%' : '36 100% 50%';
        break;
      case 'pink':
        colorValue = '#e91e63';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '340 82% 65%' : '340 82% 52%';
        break;
      case 'green':
        colorValue = '#10b981';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '142 70% 45%' : '142 70% 40%';
        break;
      case 'teal':
        colorValue = '#14b8a6';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '173 80% 45%' : '173 80% 40%';
        break;
      case 'orange':
        colorValue = '#f97316';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '24 95% 65%' : '24 95% 53%';
        break;
      case 'red':
        colorValue = '#ef4444';
        hslValue = theme === 'dark' || theme === 'oled' || 
                   (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
                   ? '0 90% 65%' : '0 90% 60%';
        break;
      default:
        colorValue = '#0070f3';
        hslValue = '221.2 83% 53.3%';
    }
    
    // Set both the theme color and primary HSL value
    root.style.setProperty('--theme-color', colorValue);
    root.style.setProperty('--primary', hslValue);
    root.style.setProperty('--ring', colorValue);
    
    // Update background gradient based on theme and color scheme
    if (theme === "light" || (theme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.body.style.background = getGradientForTheme(colorScheme, "light");
    } else if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.body.style.background = getGradientForTheme(colorScheme, "dark");
    } else if (theme === "oled") {
      // OLED mode: completely black background
      document.body.style.background = "#000000";
    }
    
    // Force a repaint to apply the new color scheme
    const body = document.body;
    const currentClass = body.className;
    body.className = currentClass + ' theme-updated';
    setTimeout(() => {
      body.className = currentClass;
    }, 10);
    
  }, [colorScheme, theme]);
  
  const value = {
    theme,
    colorScheme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
    setColorScheme: (colorScheme: ColorScheme) => {
      setColorScheme(colorScheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
    
  return context;
};
