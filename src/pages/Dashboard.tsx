import { useState } from "react";
import { PasswordList } from "@/components/password/PasswordList";
import { PasswordForm } from "@/components/password/PasswordForm";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryPanel, Category } from "@/components/categories/CategoryPanel";

export default function Dashboard() {
  const [addPasswordOpen, setAddPasswordOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-semibold tracking-tight">Cryptic Chest</h1>
          <p className="text-muted-foreground">
            Securely store and manage your passwords
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Button className="gap-2" onClick={() => setAddPasswordOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Password
          </Button>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar - Categories */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-1"
        >
          <div className="space-y-4">
            <CategoryPanel 
              onSelectCategory={setSelectedCategory}
              selectedCategoryId={selectedCategory?.id || "all"}
            />
          </div>
        </motion.div>
        
        {/* Main Content - Passwords */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-3"
        >
          <div className="space-y-6">
            <div className="rounded-lg">
              <PasswordList 
                categoryId={selectedCategory?.id !== "all" ? selectedCategory?.id : null}
                categoryName={selectedCategory?.name || "All Passwords"}
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      <Dialog open={addPasswordOpen} onOpenChange={setAddPasswordOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Password</DialogTitle>
            <DialogDescription>
              Securely store your login credentials
            </DialogDescription>
          </DialogHeader>
          <PasswordForm 
            onClose={() => setAddPasswordOpen(false)}
            selectedCategoryId={selectedCategory?.id !== "all" ? selectedCategory?.id : null}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
