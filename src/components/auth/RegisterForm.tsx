import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Calculate password strength whenever password changes
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20; // Has uppercase
    if (/[0-9]/.test(password)) strength += 20; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Has special char
    if (/[a-z]/.test(password)) strength += 10; // Has lowercase
    
    setPasswordStrength(Math.min(strength, 100));
  }, [password]);
  
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "Enter password";
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Fair";
    if (passwordStrength < 90) return "Good";
    return "Strong";
  };
  
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-amber-500";
    if (passwordStrength < 90) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (passwordStrength < 50) {
      toast.error("Please use a stronger password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(name, email, password);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Master Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        
        {/* Password strength meter */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Password strength: {getStrengthLabel()}</span>
            </div>
            <span className={passwordStrength >= 70 ? "text-green-500" : "text-muted-foreground"}>
              {passwordStrength}%
            </span>
          </div>
          <Progress 
            value={passwordStrength} 
            className="h-1.5"
            indicatorClassName={getStrengthColor()}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Master Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showConfirmPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-3 rounded-md border border-amber-200 dark:border-amber-900 flex gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
        <p className="text-sm">
          <strong>Important:</strong> If you lose your master password, your account cannot be recovered. 
          Please store it securely.
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 rounded-md bg-primary hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
      
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Button
          type="button"
          variant="link"
          className="px-0 text-primary"
          onClick={() => navigate("/login")}
        >
          Log in
        </Button>
      </div>
    </form>
  );
}
