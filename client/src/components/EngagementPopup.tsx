import { useState, useEffect } from "react";
import { X, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function EngagementPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Don't show if already dismissed this session or user is logged in
    const alreadyDismissed = sessionStorage.getItem("popup_dismissed");
    if (alreadyDismissed || user) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("popup_dismissed", "1");
  };

  if (!visible || dismissed || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-[#0d1220] border border-[#c9a84c]/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          <Zap className="w-3 h-3" /> Early Access Open
        </div>

        {/* Headline */}
        <h2 className="font-['Barlow_Condensed'] font-black text-3xl text-white uppercase leading-tight mb-2">
          See How We Found<br />
          <span className="text-[#c9a84c]">$4,832 in 30 Seconds</span>
        </h2>

        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Upload your estimate and photos. AI finds every missed Xactimate line item and writes the adjuster email — free on your first job.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href={getLoginUrl()} onClick={handleDismiss}>
            <Button className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-black font-black text-base py-3">
              Try It Free — First Job On Us <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <button
            onClick={handleDismiss}
            className="text-white/30 text-xs hover:text-white/50 transition-colors text-center"
          >
            No thanks, I'll leave money on the table
          </button>
        </div>
      </div>
    </div>
  );
}
