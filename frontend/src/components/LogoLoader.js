import { cn } from "@/lib/utils";

export default function LogoLoader({ text = "Analyzing your data...", size = "md", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-14 h-14",
    lg: "w-24 h-24"
  };

  const loaderContent = (
    <div className={cn("flex flex-col items-center justify-center space-y-4", fullScreen ? "" : "w-full")}>
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        {size !== "sm" && (
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" style={{ boxShadow: '0 0 20px var(--glow-cyan)' }}></div>
        )}
        {/* Rotating Logo */}
        <div className={cn(
          "relative flex items-center justify-center z-10",
          sizeClasses[size]
        )}>
          <div className="loader-ring"></div>
          <img 
            src="/loader-logo.png" 
            alt="Loading..." 
            className="w-full h-auto object-contain loader-logo" 
          />
        </div>
      </div>
      {text && size !== "sm" && (
        <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
