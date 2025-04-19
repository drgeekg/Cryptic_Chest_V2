import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ui/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, EyeOff, UploadCloud, DownloadCloud, RefreshCcw, Trash2 } from "lucide-react";
import axios from 'axios';
import { clearPasswordCache } from "@/lib/db";
import { 
  generateRecoveryPhrase, 
  createBackup, 
  restoreFromBackup 
} from "@/lib/backupUtils";
import { RecoveryPhraseDialog } from "@/components/settings/RecoveryPhraseDialog";
import { BackupPasswordDialog } from "@/components/settings/BackupPasswordDialog";
import { RecoveryPhraseInputDialog } from "@/components/settings/RecoveryPhraseInputDialog";
import { useNavigate } from "react-router-dom";

// API URL
const API_URL = 'http://localhost:5000/api';

export default function Settings() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const { user, updateUserProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showBackupPasswordDialog, setShowBackupPasswordDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRecoveryPhraseInputDialog, setShowRecoveryPhraseInputDialog] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create an axios instance with Authorization header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const handleResetData = async () => {
    if (!user) return;
    
    if (resetPassword.length < 4) {
      toast.error("Please enter a valid password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In the MongoDB implementation, we need to delete all passwords via API
      const response = await api.delete(`/passwords/user/${user.id}`, {
        data: { password: resetPassword }
      });
      
      setResetPassword("");
      toast.success("All account data has been reset successfully");
      
      // Clear the password cache
      clearPasswordCache();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset account data. Please check your password.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateBackup = () => {
    if (!user) return;
    setShowBackupPasswordDialog(true);
  };
  
  const processBackupCreation = async (password: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const phrase = generateRecoveryPhrase();
      setRecoveryPhrase(phrase);
      
      // Create backup using our updated MongoDB-compatible backup function
      const backupBlob = await createBackup(user.id, password, phrase);
      
      const url = URL.createObjectURL(backupBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptic-chest-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setShowRecoveryDialog(true);
      setShowBackupPasswordDialog(false);
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);
    
    setShowRecoveryPhraseInputDialog(true);
    
    e.target.value = '';
  };
  
  const processBackupRestore = async (recoveryPhrase: string) => {
    if (!selectedFile || !user) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error("Failed to read file");
        }
        
        // Use our updated MongoDB compatible restore function
        await restoreFromBackup(event.target.result, recoveryPhrase, user.id);
        
        toast.success("Backup restored successfully");
        setShowRecoveryPhraseInputDialog(false);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error restoring backup:", error);
        toast.error("Failed to restore backup. Check your recovery phrase.");
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(selectedFile);
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteAccountPassword.length < 4) {
      toast.error("Please enter a valid password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the deleteAccount function from AuthProvider
      await deleteAccount(deleteAccountPassword);
      
      // Additional cleanup if needed
      clearPasswordCache();
      
      toast.success("Your account has been deleted");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please check your password.");
    } finally {
      setIsLoading(false);
      setDeleteAccountPassword("");
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </motion.div>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="appearance" className="h-9">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="backup" className="h-9">
            Backup & Restore
          </TabsTrigger>
          <TabsTrigger value="account" className="h-9">
            Account
          </TabsTrigger>
          <TabsTrigger value="advanced" className="h-9">
            Advanced
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred theme for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={theme} 
                onValueChange={(value) => setTheme(value as "light" | "dark" | "oled" | "system")}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="light" 
                    id="theme-light" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-muted/50 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-16 w-full rounded-md bg-[#f8fafc] border mb-2 flex items-center justify-center">
                      <div className="h-4 w-12 rounded-md bg-[#0284c7]" />
                    </div>
                    <p className="text-sm font-medium">Light</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="dark" 
                    id="theme-dark" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-muted/50 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-16 w-full rounded-md bg-[#1e293b] border mb-2 flex items-center justify-center">
                      <div className="h-4 w-12 rounded-md bg-[#38bdf8]" />
                    </div>
                    <p className="text-sm font-medium">Dark</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="oled" 
                    id="theme-oled" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-oled"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-muted/50 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-16 w-full rounded-md bg-black border mb-2 flex items-center justify-center">
                      <div className="h-4 w-12 rounded-md bg-[#38bdf8]" />
                    </div>
                    <p className="text-sm font-medium">OLED</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="system" 
                    id="theme-system" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-muted/50 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-16 w-full rounded-md bg-gradient-to-r from-[#f8fafc] to-[#1e293b] border mb-2 flex items-center justify-center">
                      <div className="h-4 w-6 rounded-l-md bg-[#0284c7]" />
                      <div className="h-4 w-6 rounded-r-md bg-[#38bdf8]" />
                    </div>
                    <p className="text-sm font-medium">System</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Accent Color</CardTitle>
              <CardDescription>
                Choose your preferred accent color
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={colorScheme} 
                onValueChange={(value) => setColorScheme(value as "blue" | "cyan" | "purple" | "amber" | "pink" | "green" | "teal" | "orange" | "red")}
                className="grid grid-cols-3 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="blue" 
                    id="color-blue" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-blue"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500 mb-2" />
                    <p className="text-sm font-medium">Blue</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="cyan" 
                    id="color-cyan" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-cyan"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-cyan-500 mb-2" />
                    <p className="text-sm font-medium">Cyan</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="purple" 
                    id="color-purple" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-purple"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-purple-600 mb-2" />
                    <p className="text-sm font-medium">Purple</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="amber" 
                    id="color-amber" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-amber"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-500 mb-2" />
                    <p className="text-sm font-medium">Amber</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="pink" 
                    id="color-pink" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-pink"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-pink-500 mb-2" />
                    <p className="text-sm font-medium">Pink</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="green" 
                    id="color-green" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-green"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-500 mb-2" />
                    <p className="text-sm font-medium">Green</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="teal" 
                    id="color-teal" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-teal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-teal-500 mb-2" />
                    <p className="text-sm font-medium">Teal</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="orange" 
                    id="color-orange" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-orange"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-500 mb-2" />
                    <p className="text-sm font-medium">Orange</p>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="red" 
                    id="color-red" 
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="color-red"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary/20 cursor-pointer peer-data-[state=checked]:border-primary"
                  >
                    <div className="h-10 w-10 rounded-full bg-red-500 mb-2" />
                    <p className="text-sm font-medium">Red</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Local Backup</CardTitle>
              <CardDescription>
                Export and restore your encrypted passwords as a backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create an encrypted backup of all your passwords from MongoDB. You can restore from this backup if you need to recover your data.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  id="backup-file"
                  className="hidden"
                  accept=".json"
                  onChange={handleRestoreFileSelect}
                  disabled={isLoading}
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('backup-file')?.click()}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <UploadCloud className="h-4 w-4" />
                  Restore Backup
                </Button>
                
                <Button 
                  onClick={handleCreateBackup}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="h-4 w-4" />
                  )}
                  Create Backup
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Warning: This action will permanently delete your account and all your data.
                This cannot be undone. Please enter your password to confirm.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="delete-account-password">Your Password</Label>
                <div className="relative">
                  <Input
                    id="delete-account-password"
                    type={showDeletePassword ? "text" : "password"}
                    value={deleteAccountPassword}
                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    disabled={isLoading}
                  >
                    {showDeletePassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showDeletePassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    disabled={isLoading || deleteAccountPassword.length < 4}
                  >
                    {isLoading ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and remove all your data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Data</CardTitle>
              <CardDescription>
                Manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reset application data by deleting all stored passwords.
                This action is permanent and cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Account Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Account Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your passwords and cannot be undone.
                      Please enter your password to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="space-y-2 py-4">
                    <Label htmlFor="reset-password">Your Password</Label>
                    <div className="relative">
                      <Input
                        id="reset-password"
                        type={showResetPassword ? "text" : "password"}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        disabled={isLoading}
                      >
                        {showResetPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showResetPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetData}
                      disabled={isLoading || resetPassword.length < 4}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Data'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <RecoveryPhraseDialog 
        isOpen={showRecoveryDialog} 
        onClose={() => {
          setShowRecoveryDialog(false);
          setRecoveryPhrase("");
        }}
        recoveryPhrase={recoveryPhrase}
      />
      
      <BackupPasswordDialog
        isOpen={showBackupPasswordDialog}
        onClose={() => setShowBackupPasswordDialog(false)}
        onConfirm={processBackupCreation}
        title="Enter Master Password"
        description="Enter your master password to create an encrypted backup"
        confirmText="Create Backup"
      />
      
      <RecoveryPhraseInputDialog
        isOpen={showRecoveryPhraseInputDialog}
        onClose={() => {
          setShowRecoveryPhraseInputDialog(false);
          setSelectedFile(null);
        }}
        onConfirm={processBackupRestore}
        title="Enter Recovery Phrase"
        description="Enter the recovery phrase you saved when creating the backup"
      />
    </div>
  );
}
