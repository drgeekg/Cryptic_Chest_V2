
import { PasswordGenerator } from "@/components/password/PasswordGenerator";
import { motion } from "framer-motion";

export default function Generator() {
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Password Generator</h1>
        <p className="text-muted-foreground">
          Create strong, unique passwords for your accounts
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card border shadow-sm rounded-xl p-6"
      >
        <PasswordGenerator />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-muted/30 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-medium">Tips for Strong Passwords</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground">1.</span>
            <span>Use a minimum of 12 characters, ideally 16 or more</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground">2.</span>
            <span>Include a mix of uppercase, lowercase, numbers, and symbols</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground">3.</span>
            <span>Avoid using personal information like birthdays or names</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground">4.</span>
            <span>Use a unique password for each account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground">5.</span>
            <span>Consider using passphrases (multiple random words) for better memorability</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
