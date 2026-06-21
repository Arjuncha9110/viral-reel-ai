import React, { useState } from "react";
import { Camera, CheckCircle2, X } from "lucide-react";

const PalmScanComingSoon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", consent: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("divine_palm_scan_notify", JSON.stringify(formData));
    }
    setIsSubmitted(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        className="relative rounded-3xl overflow-hidden p-5"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #3b5bdb 100%)" }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />

        <div className="relative z-10 flex items-start gap-4">
          {/* Camera icon in glowing circle */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Camera className="w-7 h-7 text-white" />
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-2xl border border-blue-300/40"
              style={{ animation: "ping 2.5s ease-in-out infinite" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-200">Coming Soon</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
            </div>
            <h3 className="font-display text-[18px] font-bold text-white leading-tight mb-1">
              AI Palm Scan
            </h3>
            <p className="text-[12px] text-blue-100/80 leading-relaxed mb-3">
              Upload your palm photo and receive a guided reflection on major lines and signs. Built with consent, privacy, and safety first.
            </p>

            {!isOpen && !isSubmitted && (
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-900 text-[13px] font-bold shadow-md active:scale-[0.97] transition-transform"
              >
                <span>🔔</span> Notify Me
              </button>
            )}

            {isSubmitted && (
              <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                You're on the list!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Notify modal overlay ── */}
      {isOpen && !isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom sheet */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-[18px] font-bold text-stone-900">Get Early Access</h3>
                <p className="text-[12px] text-stone-400">AI Palm Scan notification</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-[13px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-[13px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              <input
                type="tel"
                placeholder="WhatsApp Number (Optional)"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-[13px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
              <label className="flex items-start gap-3 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-[12px] text-stone-500 leading-snug">
                  I consent to receive updates about AI Palm Scan. No spam, ever.
                </span>
              </label>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-[14px] text-white shadow-md active:scale-[0.98] transition-transform"
                style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b5bdb 100%)" }}
              >
                Notify Me When Ready
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PalmScanComingSoon;
