
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BriefcaseBusiness, 
  CreditCard, 
  Home,
  Key, 
  Laptop, 
  Lock, 
  Plus, 
  Smartphone, 
  Trash, 
  User 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Category = {
  id: string;
  name: string;
  icon: JSX.Element;
  count: number;
};

interface CategoryPanelProps {
  onSelectCategory: (category: Category | null) => void;
  selectedCategoryId: string | null;
}

export function CategoryPanel({ onSelectCategory, selectedCategoryId }: CategoryPanelProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Passwords", icon: <Key className="h-5 w-5" />, count: 8 },
    { id: "personal", name: "Personal", icon: <User className="h-5 w-5" />, count: 3 },
    { id: "work", name: "Work", icon: <BriefcaseBusiness className="h-5 w-5" />, count: 2 },
    { id: "finance", name: "Finance", icon: <CreditCard className="h-5 w-5" />, count: 1 },
    { id: "social", name: "Social", icon: <Smartphone className="h-5 w-5" />, count: 2 },
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<number | null>(null);
  
  const icons = [
    <User className="h-5 w-5" key="user" />,
    <BriefcaseBusiness className="h-5 w-5" key="briefcase" />,
    <CreditCard className="h-5 w-5" key="creditcard" />,
    <Smartphone className="h-5 w-5" key="smartphone" />,
    <Laptop className="h-5 w-5" key="laptop" />,
    <Home className="h-5 w-5" key="home" />,
    <Lock className="h-5 w-5" key="lock" />,
    <Key className="h-5 w-5" key="key" />,
  ];
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    if (selectedIcon === null) {
      toast.error("Please select an icon");
      return;
    }
    
    const newId = `category_${Date.now()}`;
    
    const newCategoryItem = {
      id: newId,
      name: newCategory,
      icon: icons[selectedIcon],
      count: 0,
    };
    
    setCategories([...categories, newCategoryItem]);
    
    toast.success("Category added successfully");
    setNewCategory("");
    setSelectedIcon(null);
    setShowAddDialog(false);
  };
  
  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't allow deleting the "All Passwords" category
    if (id === "all") {
      toast.error("Cannot delete the default category");
      return;
    }
    
    // If the category being deleted is currently selected, select "All Passwords"
    if (id === selectedCategoryId) {
      onSelectCategory(categories.find(c => c.id === "all") || null);
    }
    
    setCategories(categories.filter((category) => category.id !== id));
    toast.success("Category deleted successfully");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Categories</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      
      <div className="space-y-1">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
              selectedCategoryId === category.id ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full ${selectedCategoryId === category.id ? 'bg-primary/20' : 'bg-muted/60'} flex items-center justify-center`}>
                {category.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            </div>
            
            {category.id !== "all" && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:opacity-100"
                onClick={(e) => handleDeleteCategory(category.id, e)}
              >
                <Trash className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input 
                id="category-name" 
                placeholder="e.g., Travel, Gaming, Education" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {icons.map((icon, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-md border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 ${selectedIcon === i ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setSelectedIcon(i)}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button onClick={handleAddCategory}>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
