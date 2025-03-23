
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BriefcaseBusiness, 
  CreditCard, 
  Home,
  Key, 
  Laptop, 
  Lock, 
  PenTool, 
  Plus, 
  Smartphone, 
  Trash, 
  User 
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([
    { id: "1", name: "Personal", icon: <User className="h-5 w-5" />, count: 8 },
    { id: "2", name: "Work", icon: <BriefcaseBusiness className="h-5 w-5" />, count: 5 },
    { id: "3", name: "Finance", icon: <CreditCard className="h-5 w-5" />, count: 4 },
    { id: "4", name: "Social", icon: <Smartphone className="h-5 w-5" />, count: 7 },
    { id: "5", name: "Entertainment", icon: <Laptop className="h-5 w-5" />, count: 3 },
    { id: "6", name: "Home", icon: <Home className="h-5 w-5" />, count: 2 },
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
    
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategory,
        icon: icons[selectedIcon],
        count: 0,
      },
    ]);
    
    toast.success("Category added successfully");
    setNewCategory("");
    setSelectedIcon(null);
    setShowAddDialog(false);
  };
  
  const handleDeleteCategory = (id: string) => {
    // In a real app, you would need to check if the category has passwords
    // and either move them to a default category or prevent deletion
    setCategories(categories.filter((category) => category.id !== id));
    toast.success("Category deleted successfully");
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize your passwords into categories
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>
                      {category.count} {category.count === 1 ? "password" : "passwords"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <PenTool className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2"></CardContent>
            </Card>
          </motion.div>
        ))}
        
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
          }}
        >
          <Card 
            className="border-dashed bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setShowAddDialog(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[150px] text-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Add New Category</p>
              <p className="text-sm text-muted-foreground">
                Create a custom category
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
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
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
              <Button className="gap-2" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
