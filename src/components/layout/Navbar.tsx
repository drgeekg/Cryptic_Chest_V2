
import { useAuth } from "@/auth";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/90 border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Cryptic Chest</span>
        </Link>
        
        {/* Only show navigation links when authenticated and not on auth pages */}
        {isAuthenticated && !isAuthPage && (
          <nav className="flex-1 ml-8 mr-4">
            <ul className="flex items-center gap-6">
              <li>
                <NavLink to="/dashboard" label="Dashboard" />
              </li>
              <li>
                <NavLink to="/generator" label="Generator" />
              </li>
            </ul>
          </nav>
        )}
        
        <div className="flex-1 flex justify-end items-center gap-4">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            !isAuthPage && (
              <Button 
                asChild
                variant="default"
                className="rounded-full px-4"
              >
                <Link to="/login">Log in</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  label: string;
}

function NavLink({ to, label }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "relative px-1 py-2 text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="navbar-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}
