import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function StormTheDoorSuccess() {
  const [location] = useLocation();
  const sessionId = new URLSearchParams(window.location.search).get("session_id") || "";
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getDownload = trpc.stripe.getEbookDownload.useMutation({
    onSuccess: (data) => {
      setPdfUrl(data.pdfUrl);
    },
    onError: (err) => {
      setError(err.message || "Could not retrieve your download. Please contact support.");
    },
  });

  useEffect(() => {
    if (sessionId) {
      getDownload.mutate({ sessionId });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-400 text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-black mb-3">Payment Confirmed!</h1>
        <p className="text-white/60 mb-8">
          Thank you for purchasing <strong className="text-white">Storm the Door</strong>. Your playbook is ready to download.
        </p>

        {getDownload.isPending && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <div className="animate-pulse text-white/40">Preparing your download...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {pdfUrl && (
          <div className="bg-white/5 border border-[#FF6B00]/30 rounded-xl p-6 mb-6">
            <p className="text-white/60 text-sm mb-4">Your PDF is ready:</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="StormTheDoor_SalesPlaybook.pdf"
            >
              <Button className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#0a0f1e] font-bold font-bold py-4 text-lg">
                ⬇ Download Storm the Door PDF
              </Button>
            </a>
            <p className="text-white/30 text-xs mt-3">
              Save this page or bookmark the link — it's always accessible here.
            </p>
          </div>
        )}

        {/* Conscious Claims upsell */}
        <div className="bg-gradient-to-br from-[#FF6B00]/10 to-transparent border border-[#FF6B00]/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-white mb-2">Now automate the supplement side</h3>
          <p className="text-white/50 text-sm mb-4">
            You have the sales system. Let Conscious Claims handle finding missing line items and writing adjuster emails — in under 5 minutes per job.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full">
              Try Conscious Claims Free →
            </Button>
          </Link>
        </div>

        <Link href="/">
          <Button variant="ghost" className="text-white/40 hover:text-white text-sm">
            ← Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
