import { useState, useEffect } from "react";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Contrast,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("a11y-settings");
    return saved ? JSON.parse(saved) : {
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
    };
  });

  useEffect(() => {
    localStorage.setItem("a11y-settings", JSON.stringify(settings));
    
    // Apply font size
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [settings]);

  const increaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 10, 150) }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 10, 80) }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close accessibility menu" : "Open accessibility menu"}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-28 right-4 z-50 w-14 h-14 rounded-full",
          "bg-accent text-accent-foreground shadow-elevated",
          "flex items-center justify-center",
          "transition-all duration-300 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-accent/50",
          isOpen && "bg-foreground text-background"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Accessibility className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className={cn(
            "fixed bottom-44 right-4 z-50 w-72",
            "bg-card rounded-3xl shadow-elevated border border-border",
            "p-5 animate-in slide-in-from-bottom-4 duration-300"
          )}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Accessibility
          </h2>
          
          {/* Font Size Controls */}
          <div className="mb-5" role="group" aria-label="Font size controls">
            <label className="text-sm font-medium text-foreground block mb-3">
              Text Size: {settings.fontSize}%
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={decreaseFontSize}
                disabled={settings.fontSize <= 80}
                aria-label="Decrease text size"
                className={cn(
                  "flex-1 h-14 rounded-2xl bg-muted",
                  "flex items-center justify-center gap-2",
                  "text-foreground font-medium text-base",
                  "transition-all active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <ZoomOut className="w-5 h-5" aria-hidden="true" />
                <span>A-</span>
              </button>
              <button
                onClick={increaseFontSize}
                disabled={settings.fontSize >= 150}
                aria-label="Increase text size"
                className={cn(
                  "flex-1 h-14 rounded-2xl bg-muted",
                  "flex items-center justify-center gap-2",
                  "text-foreground font-medium text-lg",
                  "transition-all active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
                <span>A+</span>
              </button>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <ToggleOption
              icon={Contrast}
              label="High Contrast"
              description="Increase color contrast"
              checked={settings.highContrast}
              onChange={toggleHighContrast}
            />
            <ToggleOption
              icon={Eye}
              label="Reduce Motion"
              description="Minimize animations"
              checked={settings.reducedMotion}
              onChange={toggleReducedMotion}
            />
          </div>
        </div>
      )}
    </>
  );
}

interface ToggleOptionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleOption({ icon: Icon, label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={`${label}: ${checked ? 'enabled' : 'disabled'}`}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl",
        "transition-all active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        checked 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        checked ? "bg-primary-foreground/20" : "bg-background"
      )}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 text-left">
        <span className="font-medium text-sm block">{label}</span>
        <span className={cn(
          "text-xs",
          checked ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>{description}</span>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
        checked 
          ? "border-primary-foreground bg-primary-foreground" 
          : "border-muted-foreground"
      )}>
        {checked && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}
