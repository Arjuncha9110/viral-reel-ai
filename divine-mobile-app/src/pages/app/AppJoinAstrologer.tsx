import React, { useState } from "react";
import AppShell from "./AppShell";
import { astrologerApplicationService } from "../../services/astrologerApplicationService";
import { useToast } from "../../hooks/use-toast";
import { Loader2, CheckCircle2, Star, Users, MessageCircle } from "lucide-react";

const inputCls =
  "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-[14px] text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all";

const labelCls = "text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1.5 block";

const AppJoinAstrologer: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    city: "",
    languages: "",
    specialties: "",
    experienceYears: "",
    chatRatePerMin: "",
    callRatePerMin: "",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await astrologerApplicationService.submitApplication({
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        email: formData.email,
        city: formData.city,
        languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
        specialties: formData.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(formData.experienceYears) || 0,
        chatRatePerMin: Number(formData.chatRatePerMin) || 0,
        callRatePerMin: Number(formData.callRatePerMin) || 0,
        bio: formData.bio,
      });
      setIsSuccess(true);
    } catch {
      toast({
        title: "Submission failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AppShell title="Join as Astrologer" eyebrow="Partner With Us" showBack>
        <div className="flex flex-col items-center justify-center text-center space-y-5 py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="font-display text-[24px] font-bold text-stone-900 mb-2">Application Received</h2>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
              Thank you for joining us. Our onboarding team will review your profile and reach out via WhatsApp or Email shortly.
            </p>
          </div>
          <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left space-y-1">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">What's next?</p>
            <p className="text-[12px] text-stone-600">• Profile review within 48 hours</p>
            <p className="text-[12px] text-stone-600">• WhatsApp confirmation from our team</p>
            <p className="text-[12px] text-stone-600">• Onboarding call to set up your profile</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Join as Astrologer" eyebrow="Partner With Us" showBack>
      <div className="space-y-5">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400/80 mb-2">✦ Become a Guide</p>
          <h2 className="font-display text-[22px] font-bold text-white leading-snug mb-2">
            Share Your Wisdom
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-4">
            Reach thousands of seekers. Set your own rates and schedule. Build your spiritual practice on Divine Panchang.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "10k+ Seekers" },
              { icon: Star, label: "Top Astrologers" },
              { icon: MessageCircle, label: "Chat & Calls" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
                <Icon size={16} className="text-amber-400 mx-auto mb-1" />
                <p className="text-[10px] text-white/70 font-semibold leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Section: Personal */}
          <div className="rounded-2xl border border-stone-100 bg-white p-4 space-y-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 border-b border-stone-100 pb-2">Personal Info</p>

            <div>
              <label className={labelCls}>Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputCls} placeholder="Ramesh Kumar" />
            </div>

            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputCls} placeholder="+91 9876543210" />
            </div>

            <div>
              <label className={labelCls}>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="ramesh@example.com" />
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className={inputCls} placeholder="Varanasi, UP" />
            </div>
          </div>

          {/* Section: Expertise */}
          <div className="rounded-2xl border border-stone-100 bg-white p-4 space-y-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 border-b border-stone-100 pb-2">Expertise</p>

            <div>
              <label className={labelCls}>Languages <span className="normal-case text-stone-400 font-normal">(comma separated)</span></label>
              <input required type="text" name="languages" value={formData.languages} onChange={handleChange} className={inputCls} placeholder="English, Hindi, Sanskrit" />
            </div>

            <div>
              <label className={labelCls}>Specialties <span className="normal-case text-stone-400 font-normal">(comma separated)</span></label>
              <input required type="text" name="specialties" value={formData.specialties} onChange={handleChange} className={inputCls} placeholder="Vedic Astrology, Tarot, Numerology" />
            </div>

            <div>
              <label className={labelCls}>Years of Experience</label>
              <input required type="number" min="0" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className={inputCls} placeholder="5" />
            </div>
          </div>

          {/* Section: Rates */}
          <div className="rounded-2xl border border-stone-100 bg-white p-4 space-y-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 border-b border-stone-100 pb-2">Your Rates</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Chat Rate <span className="normal-case font-normal text-stone-400">(₹/min)</span></label>
                <input required type="number" min="0" name="chatRatePerMin" value={formData.chatRatePerMin} onChange={handleChange} className={inputCls} placeholder="15" />
              </div>
              <div>
                <label className={labelCls}>Call Rate <span className="normal-case font-normal text-stone-400">(₹/min)</span></label>
                <input required type="number" min="0" name="callRatePerMin" value={formData.callRatePerMin} onChange={handleChange} className={inputCls} placeholder="20" />
              </div>
            </div>
          </div>

          {/* Section: Bio */}
          <div className="rounded-2xl border border-stone-100 bg-white p-4 space-y-4">
            <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 border-b border-stone-100 pb-2">Short Bio</p>
            <div>
              <label className={labelCls}>Tell seekers about yourself</label>
              <textarea
                required name="bio" value={formData.bio} onChange={handleChange} rows={5}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-[14px] text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                placeholder="Describe your background, approach, and what seekers can expect from a session with you..."
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            ) : (
              "Submit Application →"
            )}
          </button>

          <p className="text-[10px] text-center text-stone-400 pb-4">
            By submitting, you agree to our Partner Guidelines. We review all applications manually.
          </p>
        </form>
      </div>
    </AppShell>
  );
};

export default AppJoinAstrologer;
