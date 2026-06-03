import React from "react";
import { BookOpen, Moon, Sun, AlertCircle, CheckCircle2, XCircle, User, Droplets, Clock, Sparkles } from "lucide-react";

export const EclipseGuidelines = () => {
  return (
    <div className="space-y-12 mt-16 text-[#a69888]">
      
      {/* Introduction Section */}
      <div className="space-y-6">
        <div className="bg-black/20 border border-[#d8bc7a]/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-display text-xl text-[#e4cfa0] flex items-center gap-2 mb-4 font-bold uppercase tracking-widest">
            <BookOpen className="h-5 w-5 text-[#d4651a]" />
            Importance of Eclipses in Vedic Tradition
          </h3>
          <p className="leading-relaxed mb-4">
            In Vedic Jyotish, eclipses (Grahan) are among the most significant cosmic events. They mark powerful moments when the shadow nodes, <strong className="text-[#f7f3eb]">Rahu (ascending node)</strong> and <strong className="text-[#f7f3eb]">Ketu (descending node)</strong>, align with the luminaries — Surya (Sun) and Chandra (Moon). Ancient texts regard eclipses not as omens of fear, but as <strong className="text-[#d8bc7a]">windows of intensified spiritual energy</strong>, where the veil between the material and spiritual worlds grows thin.
          </p>
          <p className="leading-relaxed">
            The Vedic scriptures describe eclipses as cosmic recalibrations. During a <strong className="text-[#f7f3eb]">Surya Grahan</strong> (Solar Eclipse), the life-giving energy of the Sun is temporarily obscured by Rahu, symbolizing the triumph of shadow over light—a reminder to turn inward. During a <strong className="text-[#f7f3eb]">Chandra Grahan</strong> (Lunar Eclipse), Ketu's influence on the Moon amplifies emotional depth and introspection.
          </p>
        </div>

        <div className="bg-black/20 border border-[#d8bc7a]/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-display text-xl text-[#e4cfa0] flex items-center gap-2 mb-4 font-bold uppercase tracking-widest">
            <Moon className="h-5 w-5 text-purple-400" />
            Rahu & Ketu — The Shadow Planets
          </h3>
          <p className="leading-relaxed">
            According to the Samudra Manthan (churning of the cosmic ocean), the asura Swarbhanu secretly drank the nectar of immortality (Amrita). Lord Vishnu's discus severed his body — the head became <strong className="text-[#f7f3eb]">Rahu</strong> and the tail became <strong className="text-[#f7f3eb]">Ketu</strong>. Forever seeking revenge, they periodically swallow the Sun (solar eclipse) and cast a shadow on the Moon (lunar eclipse). This mythological framework animates the astronomical reality of the lunar nodes.
          </p>
        </div>

        <div className="bg-black/20 border border-[#d8bc7a]/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-display text-xl text-[#e4cfa0] flex items-center gap-2 mb-4 font-bold uppercase tracking-widest">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Spiritual Significance of Eclipse Energy
          </h3>
          <p className="leading-relaxed">
            Vedic tradition teaches that during an eclipse, the normal flow of pranic energy is disrupted. The Ida (lunar) and Pingala (solar) nadis undergo a temporary shift, creating a unique condition where <strong className="text-[#f7f3eb]">Sushumna nadi</strong> can be more easily activated. This is why advanced yogis, sadhus, and tantriks consider eclipse time as an extraordinary occult window for:
          </p>
          <ul className="mt-4 space-y-2">
            <li><strong className="text-[#d8bc7a]">Mantra Siddhi</strong> — Mantras recited during an eclipse multiply in power.</li>
            <li><strong className="text-[#d8bc7a]">Dhyana (Meditation)</strong> — Deep states of meditation are more accessible.</li>
            <li><strong className="text-[#d8bc7a]">Japa</strong> — Continuous repetition of sacred syllables yields exponential results.</li>
            <li><strong className="text-[#d8bc7a]">Daan (Charity)</strong> — Acts of giving during an eclipse earn immense spiritual merit.</li>
          </ul>
        </div>
      </div>

      {/* Phase by Phase Practices */}
      <div>
        <h2 className="font-display text-3xl font-bold text-center text-[#f7f3eb] mb-8 mt-12 border-b border-white/10 pb-4">
          Eclipse Practices — Phase by Phase
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1005]/80 border border-[#d4651a]/30 rounded-2xl p-6">
            <div className="h-8 w-8 rounded-full bg-[#d4651a]/20 text-[#d4651a] flex items-center justify-center font-bold mb-4">1</div>
            <h4 className="text-[#f7f3eb] font-bold text-lg mb-3">Before Eclipse (Sutak Kaal)</h4>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-[#d8bc7a]">Stop Eating:</strong> Cease food consumption before Sutak begins.</li>
              <li><strong className="text-[#d8bc7a]">Tulsi Leaves:</strong> Add Tulsi or Kusha grass to stored food and water to prevent negative energy absorption.</li>
              <li><strong className="text-[#d8bc7a]">Clean the house:</strong> Sweep, mop, and purify your living space.</li>
              <li><strong className="text-[#d8bc7a]">Prepare for meditation:</strong> Set up your asana and keep your mantra mala ready.</li>
            </ul>
          </div>
          <div className="bg-[#2a0515]/80 border border-rose-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><AlertCircle className="h-24 w-24" /></div>
            <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-4">2</div>
            <h4 className="text-[#f7f3eb] font-bold text-lg mb-3">During Eclipse</h4>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-rose-400">No Cooking/Eating:</strong> Strictly avoid preparing or consuming food.</li>
              <li><strong className="text-[#d8bc7a]">Mantra Japa:</strong> This is the most powerful time for mantra chanting. Chant the Maha Mrityunjaya or Gayatri Mantra.</li>
              <li><strong className="text-[#d8bc7a]">Meditation:</strong> Keep the mind focused on the divine. Focus on the Ajna Chakra (Third Eye).</li>
              <li><strong className="text-rose-400">No sleeping:</strong> Avoid sleeping; remain alert and conscious.</li>
            </ul>
          </div>
          <div className="bg-[#051a15]/80 border border-emerald-500/30 rounded-2xl p-6">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">3</div>
            <h4 className="text-[#f7f3eb] font-bold text-lg mb-3">After Eclipse (Moksha)</h4>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-[#d8bc7a]">Purification Bath:</strong> Immediately bathe after the eclipse ends.</li>
              <li><strong className="text-[#d8bc7a]">Discard Old Water/Food:</strong> Discard previously cooked food and drawing water.</li>
              <li><strong className="text-emerald-400">Daan (Charity):</strong> Donate grains, clothes, or money to the needy.</li>
              <li><strong className="text-[#d8bc7a]">Fresh Food:</strong> Cook a fresh meal. Treat it as the first food of a new cosmic cycle.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Auspicious vs Inauspicious */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-[#f7f3eb] mb-8 text-center">
          Auspicious & Inauspicious During Eclipses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
            <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Auspicious (शुभ कर्म)
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Mantra Japa</span> — continuous repetition of sacred mantras</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Dhyana</span> — deep meditation, especially during totality</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Pranayama</span> — breathing exercises</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Snana</span> — water bathing at eclipse start and end</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Daan</span> — charity and donations (grains, clothes, gold)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Scripture reading</span> — Bhagavad Gita, Sundarakand, Vishnu Sahasranama</li>
            </ul>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
            <h4 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Inauspicious (अशुभ कर्म)
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Eating or drinking</span> during Sutak period</li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Cooking or food preparation</span></li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Sleeping</span> during eclipse (fall into Tamas)</li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Starting new ventures</span> or entering a new house</li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Marriage, engagement, or sacred ceremonies</span></li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Cutting hair, nails, or shaving</span></li>
              <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500/70 shrink-0" /> <span className="text-[#f7f3eb]">Looking directly</span> at a solar eclipse (harmful to physical and astral eyes)</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Special Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-[#1a1525]/80 border border-purple-500/30 rounded-2xl p-6">
          <h4 className="text-purple-300 font-bold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Special Guidelines for Pregnant Women
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> <span className="text-[#f7f3eb]">Stay indoors throughout the eclipse period — do not go outside.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> <span className="text-[#f7f3eb]">Do not use sharp objects (knives, scissors, needles).</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> <span className="text-[#f7f3eb]">Apply a thin layer of cow dung paste or Turmeric on the stomach as protection.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> <span className="text-[#f7f3eb]">Chant Santana Gopala Mantra for the child's well-being.</span></li>
            <li className="flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span> <span className="text-[#f7f3eb]">After the eclipse, take a purification bath and change clothes completely.</span></li>
          </ul>
        </div>

        <div className="bg-[#152525]/80 border border-cyan-500/30 rounded-2xl p-6">
          <h4 className="text-cyan-300 font-bold mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Food & Water Guidelines
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">•</span> <span><strong className="text-[#f7f3eb]">Before Sutak:</strong> Finish eating at least 1 hour before Sutak starts. Meals should be strictly vegetarian.</span></li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">•</span> <span><strong className="text-[#f7f3eb]">During Sutak:</strong> Complete fasting is recommended.</span></li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">•</span> <span><strong className="text-[#f7f3eb]">Tulsi Protection:</strong> Place Kusha grass or Tulsi leaves in all food containers, milk, and water to prevent the eclipse's impure energy from spoiling them.</span></li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">•</span> <span><strong className="text-[#f7f3eb]">After Eclipse:</strong> Discard all uncovered food and water. Cook fresh meals only after the purification bath.</span></li>
          </ul>
        </div>

      </div>

    </div>
  );
};
