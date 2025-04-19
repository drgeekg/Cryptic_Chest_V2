import { useState, useEffect } from "react";
import { StoredPassword, getPasswords, deletePassword } from "@/lib/db";
import { PasswordItem } from "./PasswordItem";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordForm } from "./PasswordForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PasswordListProps {
  categoryId: string | null;
  categoryName: string;
}

export function PasswordList({ categoryId, categoryName }: PasswordListProps) {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<StoredPassword[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPassword, setSelectedPassword] = useState<StoredPassword | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const loadPasswords = async () => {
    if (user) {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        console.log("Fetching passwords for user:", user.id);
        const userPasswords = await getPasswords(user.id);
        console.log("Passwords fetched:", userPasswords);
        setPasswords(userPasswords);
      } catch (error) {
        console.error("Failed to load passwords:", error);
        setLoadError("Failed to load passwords. Please try again later.");
        toast.error("Failed to load passwords");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    loadPasswords();
  }, [user]);
  
  // Filter passwords by category and search query
  useEffect(() => {
    let filtered = passwords;
    
    // First filter by category if specified
    if (categoryId && categoryId !== "all") {
      filtered = filtered.filter(
        (password) => password.category === categoryId
      );
    }
    
    // Then filter by search query if present
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (password) =>
          password.name.toLowerCase().includes(lowerCaseQuery) ||
          password.url.toLowerCase().includes(lowerCaseQuery) ||
          password.username.toLowerCase().includes(lowerCaseQuery) ||
          (password.category && password.category.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    setFilteredPasswords(filtered);
  }, [searchQuery, passwords, categoryId]);
  
  const handleEdit = (password: StoredPassword) => {
    setSelectedPassword(password);
    setShowEditDialog(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deletePassword(id);
      setPasswords(passwords.filter((p) => p.id !== id));
      toast.success("Password deleted successfully");
    } catch (error) {
      console.error("Failed to delete password:", error);
      toast.error("Failed to delete password");
    }
  };
  
  const handleAddPasswordComplete = () => {
    setShowAddDialog(false);
    loadPasswords(); // Refresh the password list
  };
  
  const handleEditPasswordComplete = () => {
    setShowEditDialog(false);
    loadPasswords(); // Refresh the password list
  };

  // Handle API error state
  if (loadError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {loadError}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => loadPasswords()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>

        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Password
        </Button>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
              <DialogDescription>
                Securely store your login credentials
              </DialogDescription>
            </DialogHeader>
            <PasswordForm 
              onClose={handleAddPasswordComplete} 
              selectedCategoryId={categoryId}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading passwords...</p>
        </div>
      </div>
    );
  }
  
  const noPasswordsMessage = categoryId 
    ? `No passwords in the "${categoryName}" category` 
    : "No passwords yet";
  
  if (passwords.length === 0 || filteredPasswords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/30 mx-auto rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{noPasswordsMessage}</h3>
        <p className="text-muted-foreground mb-4">
          {passwords.length === 0 
            ? "Add your first password to get started" 
            : "Try a different search or category"}
        </p>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Password
        </Button>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
              <DialogDescription>
                Securely store your login credentials
              </DialogDescription>
            </DialogHeader>
            <PasswordForm 
              onClose={handleAddPasswordComplete} 
              selectedCategoryId={categoryId}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search passwords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredPasswords.length} {filteredPasswords.length === 1 ? "password" : "passwords"}
          {categoryId && categoryId !== "all" ? ` in ${categoryName}` : ""}
        </p>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      
      <motion.div layout className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {filteredPasswords.map((password) => (
            <PasswordItem
              key={password.id}
              password={password}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
            <DialogDescription>
              Update your saved password
            </DialogDescription>
          </DialogHeader>
          <PasswordForm 
            onClose={handleEditPasswordComplete}
            selectedCategoryId={categoryId}
            passwordToEdit={selectedPassword}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Password</DialogTitle>
            <DialogDescription>
              Securely store your login credentials
            </DialogDescription>
          </DialogHeader>
          <PasswordForm 
            onClose={handleAddPasswordComplete}
            selectedCategoryId={categoryId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
