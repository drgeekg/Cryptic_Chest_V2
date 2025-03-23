
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Create an account</h1>
            <p className="text-muted-foreground">
              Get started with Cryptic Chest
            </p>
          </div>
          
          <div className="bg-card border shadow-sm rounded-xl p-6 sm:p-8">
            <RegisterForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
