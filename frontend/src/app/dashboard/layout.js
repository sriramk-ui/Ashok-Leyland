"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import UploadModal from "@/components/UploadModal";
import TopHeader from "@/components/TopHeader";
import WorkflowBanner from "@/components/WorkflowBanner";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-500 overflow-x-hidden">
        <UploadModal />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className={cn(
          "flex flex-col min-h-screen transition-all duration-300 w-full",
          sidebarOpen ? "lg:ml-72 lg:w-[calc(100%-18rem)]" : "lg:ml-20 lg:w-[calc(100%-5rem)]"
        )}>
          <TopHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <WorkflowBanner />
          <div className="flex-1 p-4 lg:p-8 pt-8 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
