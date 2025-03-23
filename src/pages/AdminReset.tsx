import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { resetAllData, resetUserData } from "@/lib/resetDatabase";
import { motion } from "framer-motion";

export default function AdminReset() {
  const [confirmResetAll, setConfirmResetAll] = useState("");
  const [confirmResetUsers, setConfirmResetUsers] = useState("");
  const navigate = useNavigate();

  const handleResetAll = () => {
    if (confirmResetAll !== "RESET ALL DATA") {
      toast.error("Please type the confirmation text exactly as shown");
      return;
    }

    try {
      resetAllData();
      toast.success("All application data has been reset successfully");
      setConfirmResetAll("");
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data");
    }
  };

  const handleResetUsers = () => {
    if (confirmResetUsers !== "RESET USERS") {
      toast.error("Please type the confirmation text exactly as shown");
      return;
    }

    try {
      resetUserData();
      toast.success("All user data has been reset successfully");
      setConfirmResetUsers("");
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error resetting user data:", error);
      toast.error("Failed to reset user data");
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
        <h1 className="text-3xl font-semibold tracking-tight">Admin Data Reset</h1>
        <p className="text-muted-foreground">
          Dangerous operations to reset application data
        </p>
      </motion.div>

      <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          The operations on this page will permanently delete data without the possibility of recovery.
          These actions should only be performed by administrators.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Reset All Application Data
            </CardTitle>
            <CardDescription>
              This will completely reset the entire application, removing all user accounts, passwords, and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-reset-all">Type "RESET ALL DATA" to confirm</Label>
              <Input
                id="confirm-reset-all"
                value={confirmResetAll}
                onChange={(e) => setConfirmResetAll(e.target.value)}
                className="border-destructive/30 focus-visible:ring-destructive/30"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              onClick={handleResetAll}
              className="w-full"
              disabled={confirmResetAll !== "RESET ALL DATA"}
            >
              Reset All Data
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-orange-500/40">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reset User Data Only
            </CardTitle>
            <CardDescription>
              This will remove all user accounts and passwords, but preserve application settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-reset-users">Type "RESET USERS" to confirm</Label>
              <Input
                id="confirm-reset-users"
                value={confirmResetUsers}
                onChange={(e) => setConfirmResetUsers(e.target.value)}
                className="border-orange-500/30 focus-visible:ring-orange-500/30"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleResetUsers}
              disabled={confirmResetUsers !== "RESET USERS"}
            >
              Reset User Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 