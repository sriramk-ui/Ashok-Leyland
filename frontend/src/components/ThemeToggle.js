"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-sidebar-accent transition-all duration-300 w-full group"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={false}
          animate={{
            y: theme === "light" ? 0 : -40,
            opacity: theme === "light" ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Sun className="w-4 h-4 text-primary" />
        </motion.div>
        <motion.div
           initial={false}
           animate={{
             y: theme === "dark" ? 0 : 40,
             opacity: theme === "dark" ? 1 : 0
           }}
           transition={{ duration: 0.3 }}
           className="absolute"
        >
          <Moon className="w-4 h-4 text-primary" />
        </motion.div>
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors">
        {theme === "light" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
