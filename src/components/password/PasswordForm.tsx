
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Clipboard, Eye, EyeOff, Globe, Key, Loader2, RefreshCw, X } from "lucide-react";
import { generatePassword } from "@/lib/encryption";
import { addPassword, updatePassword, StoredPassword } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Title is required"),
  url: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface PasswordFormProps {
  onClose: () => void;
  selectedCategoryId?: string | null;
  passwordToEdit?: StoredPassword | null;
}

export function PasswordForm({ onClose, selectedCategoryId, passwordToEdit }: PasswordFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isEditMode = !!passwordToEdit;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: passwordToEdit?.name || "",
      url: passwordToEdit?.url || "",
      username: passwordToEdit?.username || "",
      password: passwordToEdit?.password || "",
      category: (passwordToEdit?.category || (selectedCategoryId && selectedCategoryId !== "all" ? selectedCategoryId : "")) || "",
      notes: passwordToEdit?.notes || "",
      favorite: passwordToEdit?.favorite || false,
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode && passwordToEdit) {
        updatePassword(passwordToEdit.id, {
          url: values.url || "",
          username: values.username,
          password: values.password,
          name: values.name,
          category: values.category,
          notes: values.notes,
          favorite: values.favorite,
        });
        
        toast.success("Password updated successfully");
      } else {
        addPassword({
          userId: user.id,
          url: values.url || "",
          username: values.username,
          password: values.password,
          name: values.name,
          category: values.category,
          notes: values.notes,
          favorite: values.favorite,
        });
        
        toast.success("Password saved successfully");
      }
      onClose();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update password" : "Failed to save password");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
      
      setGeneratedPassword(newPassword);
      form.setValue("password", newPassword);
      setCopied(false);
    } catch (error) {
      toast.error("Failed to generate password");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!generatedPassword) {
      toast.error("Generate a password first");
      return;
    }
    
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast.success("Password copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 30000);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input className="border-primary/20 focus:border-primary" placeholder="E.g., Gmail, Facebook, Bank Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="your_username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      {...field} 
                      className="pr-10"
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
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className="whitespace-nowrap text-primary border-primary/30"
                  onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                >
                  <Key className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showPasswordGenerator && (
          <div className="bg-primary/5 p-4 rounded-lg space-y-4 mt-2 border border-primary/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <Key className="h-4 w-4 mr-1 text-primary" />
                Password Generator
              </h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setShowPasswordGenerator(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-uppercase"
                  checked={includeUppercase}
                  onCheckedChange={setIncludeUppercase}
                />
                <label htmlFor="include-uppercase" className="text-sm cursor-pointer">
                  Uppercase (A-Z)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-lowercase"
                  checked={includeLowercase}
                  onCheckedChange={setIncludeLowercase}
                />
                <label htmlFor="include-lowercase" className="text-sm cursor-pointer">
                  Lowercase (a-z)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-numbers"
                  checked={includeNumbers}
                  onCheckedChange={setIncludeNumbers}
                />
                <label htmlFor="include-numbers" className="text-sm cursor-pointer">
                  Numbers (0-9)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-symbols"
                  checked={includeSymbols}
                  onCheckedChange={setIncludeSymbols}
                />
                <label htmlFor="include-symbols" className="text-sm cursor-pointer">
                  Symbols (!@#$%^&*)
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Length: {length}</span>
              </div>
              <input
                type="range"
                min={8}
                max={32}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-primary/30 text-primary"
                onClick={generateNewPassword}
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
                    Generate
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={copyToClipboard}
                disabled={!generatedPassword}
                className="border-primary/30"
              >
                <Clipboard className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="https://example.com" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information or notes"
                  className="min-h-[100px] border-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="favorite"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Favorite</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="favorite-switch"
                    />
                    <label htmlFor="favorite-switch" className="text-sm text-muted-foreground cursor-pointer">
                      Mark as favorite
                    </label>
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? "Update Password" : "Save Password"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
