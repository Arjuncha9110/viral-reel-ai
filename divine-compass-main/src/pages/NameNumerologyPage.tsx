import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Sparkles, Heart, User, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateNameNumberDetails,
  NumberBreakdown,
  getCompoundMeaning
} from "@/lib/calculators/numerology/name";
import {
  nameInterpretations,
  NameInterpretation
} from "@/lib/data/nameNumerology";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { detectNameSoundVibration } from "@/lib/sound/detectNameSound";
import SoundVibrationPanel from "@/components/numerology/SoundVibrationPanel";

const NameNumerologyPage = () => {
  const [name, setName] = useState("");
  const [useChaldean, setUseChaldean] = useState(false);
  const [results, setResults] = useState<{
    expression: NumberBreakdown & { meaning: NameInterpretation };
    soul: NumberBreakdown & { meaning: NameInterpretation };
    personality: NumberBreakdown & { meaning: NameInterpretation };
    sound: ReturnType<typeof detectNameSoundVibration>;
  } | null>(null);

  const handleCalculate = () => {
    if (!name.trim()) return;

    const expression = calculateNameNumberDetails(name, 'expression', useChaldean);
    const soul = calculateNameNumberDetails(name, 'soul', useChaldean);
    const personality = calculateNameNumberDetails(name, 'personality', useChaldean);

    const getInterpretation = (num: number) => {
      const n = num % 9 || 9;
      return nameInterpretations[num] || nameInterpretations[n];
    };

    const sound = detectNameSoundVibration(name);

    setResults({
      expression: { ...expression, meaning: getInterpretation(expression.reduced) },
      soul: { ...soul, meaning: getInterpretation(soul.reduced) },
      personality: { ...personality, meaning: getInterpretation(personality.reduced) },
      sound,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Name Numerology"
          subtitle={useChaldean
            ? "Discover the hidden vibrations within your name using the ancient Chaldean numerology system"
            : "Discover the hidden vibrations within your name using the ancient Pythagorean numerology system"
          }
          icon={<Hash className="h-8 w-8" />}
        />

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-12 space-y-4"
        >
          <SpiritualCard hover={false}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Enter Your Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="First Middle Last"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg bg-background border-2 border-primary/20 focus:border-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                />
                <p className="text-xs text-muted-foreground">
                  Includes middle names, initials, and hyphenated names
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Chaldean Numerology</Label>
                  <p className="text-xs text-muted-foreground">Switch to ancient Chaldean letter mapping</p>
                </div>
                <Switch
                  checked={useChaldean}
                  onCheckedChange={setUseChaldean}
                />
              </div>

              <Button
                onClick={handleCalculate}
                variant="saffron"
                size="lg"
                className="w-full"
                disabled={!name.trim()}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Name Vibration
              </Button>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Core Numbers Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { data: results.expression, color: "from-primary to-sacred-amber", shadow: "shadow-glow-saffron" },
                  { data: results.soul, color: "from-gold to-gold-light", shadow: "shadow-glow-gold" },
                  { data: results.personality, color: "from-secondary to-maroon-light", shadow: "shadow-card" }
                ].map((item, idx) => (
                  <SpiritualCard key={idx} delay={0.1 + idx * 0.05}>
                    <div className="text-center space-y-4">
                      <div className={cn(
                        "inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br",
                        item.color,
                        item.shadow
                      )}>
                        <span className="font-display text-4xl font-bold">
                          {item.data.reduced}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                          {item.data.label}
                        </div>
                        <div className="font-display text-xl font-bold text-foreground">
                          {item.data.meaning.summary.split(' - ')[0]}
                        </div>
                      </div>
                      <div className="pt-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                          Sum: {item.data.sum}
                        </span>
                        {item.data.isMaster && (
                          <span className="bg-primary/20 text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                            MASTER NUMBER
                          </span>
                        )}
                      </div>
                    </div>
                  </SpiritualCard>
                ))}
              </div>

              {/* Detailed Plane Analysis */}
              <div className="space-y-8">
                {[
                  { data: results.expression, icon: <User className="h-5 w-5" />, meaning: results.expression.meaning.expression, title: "Expression / Destiny Analysis" },
                  { data: results.soul, icon: <Heart className="h-5 w-5" />, meaning: results.soul.meaning.soul, title: "Soul Urge / Heart's Desire" },
                  { data: results.personality, icon: <Users className="h-5 w-5" />, meaning: results.personality.meaning.personality, title: "Personality / Outer Persona" }
                ].map((section, sIdx) => (
                  <SpiritualCard key={sIdx} delay={0.25 + sIdx * 0.05} hover={false}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          {section.icon}
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-semibold text-foreground leading-none mb-1">
                            {section.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono break-all">
                            Breakdown: {section.data.breakdown} = {section.data.sum}
                            {section.data.sum > 9 && !section.data.isMaster && (
                              <> → {String(section.data.sum).split('').join('+')} = {section.data.reduced}</>
                            )}
                            {section.data.isMaster && section.data.sum !== section.data.reduced && (
                              <> → {section.data.reduced} (Master)</>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            {section.meaning}
                          </p>

                          {useChaldean && section.data.sum > 9 && (
                            <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                              <h4 className="text-sm font-bold text-gold mb-1">Compound Vibration ({section.data.sum})</h4>
                              <p className="text-xs text-muted-foreground italic">
                                {getCompoundMeaning(section.data.sum)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="font-semibold text-sm mb-2">Strengths</h4>
                            <div className="flex flex-wrap gap-1">
                              {section.data.meaning.strengths.map(s => (
                                <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                            <h4 className="font-semibold text-sm mb-1">Themes</h4>
                            <p className="text-xs text-muted-foreground italic">
                              {section.data.meaning.themes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpiritualCard>
                ))}
              </div>

              {/* Master Vibration / Summary Section */}
              {results.expression.isMaster && (
                <SpiritualCard delay={0.5} className="border-primary/30 bg-primary/5">
                  <div className="flex flex-col items-center text-center space-y-2 py-4">
                    <Sparkles className="h-8 w-8 text-primary animate-bounce" />
                    <h3 className="font-display text-2xl font-bold text-primary">Master Vibration Master {results.expression.reduced}</h3>
                    <p className="text-muted-foreground max-w-2xl">
                      Your name carries one of the most powerful vibrations in numerology. A Master Number indicates high spiritual potential and a mission that extends beyond personal gain.
                    </p>
                  </div>
                </SpiritualCard>
              )}

              {/* Sound Vibration Analysis */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <SoundVibrationPanel result={results.sound} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default NameNumerologyPage;
