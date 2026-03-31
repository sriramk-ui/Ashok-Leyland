import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import UploadModal from "@/components/UploadModal";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-500">
        <UploadModal />
        <Sidebar />
        <main className="flex-1 ml-72 p-8 pt-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
