import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Star, Sparkles, Calendar, Heart, Compass, Award, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateMaturityNumber
} from "@/lib/calculators/numerology/birth";
import {
  generateLoShuGrid,
  detectMissingNumbers,
  detectRepeatingNumbers,
  detectArrows,
  LoShuCell,
  LoShuArrow
} from "@/lib/calculators/numerology/loshu";
import {
  numerologyInterpretations,
  karmicLessons,
  NumerologyResult
} from "@/lib/data/numerology";
import { cn } from "@/lib/utils";
import { SeoHead } from "@/components/shared/SeoHead";

const BirthNumerologyPage = () => {
  const [birthDate, setBirthDate] = useState("");
  const [results, setResults] = useState<{
    lifePath: NumerologyResult | null;
    destiny: NumerologyResult | null;
    maturity: NumerologyResult | null;
    loshu: {
      cells: LoShuCell[];
      missing: { number: number; meaning: string }[];
      repeating: { number: number; count: number; intensity: string }[];
      arrows: LoShuArrow[];
    } | null;
  } | null>(null);

  const handleCalculate = () => {
    if (!birthDate) return;

    const dateObj = new Date(birthDate);
    const lifePathNum = calculateLifePathNumber(dateObj);
    const destinyNum = calculateDestinyNumber(dateObj);
    const maturityNum = calculateMaturityNumber(lifePathNum, destinyNum);

    const { cells, counts } = generateLoShuGrid(dateObj);
    const missing = detectMissingNumbers(counts);
    const repeating = detectRepeatingNumbers(counts);
    const arrows = detectArrows(counts);

    setResults({
      lifePath: numerologyInterpretations[lifePathNum] || numerologyInterpretations[lifePathNum % 9 || 9],
      destiny: numerologyInterpretations[destinyNum] || numerologyInterpretations[destinyNum % 9 || 9],
      maturity: numerologyInterpretations[maturityNum] || numerologyInterpretations[maturityNum % 9 || 9],
      loshu: {
        cells,
        missing,
        repeating,
        arrows
      }
    });
  };

  return (
    <Layout>
        <SeoHead
            title="Birth Date Numerology Calculator - Life Path Number"
            description="Find your Life Path, Destiny, and Maturity numbers from your date of birth, with practical interpretations for everyday decisions."
            path="/numerology/birth"
            type="website"
            keywords="birth numerology, life path number calculator, destiny number by date of birth"
        />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Birth Date Numerology"
          subtitle="Uncover your Life Path, Destiny, and Maturity numbers to understand your soul's journey"
          icon={<Star className="h-8 w-8" />}
        />

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-12"
        >
          <SpiritualCard hover={false}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Select Your Date of Birth
                </Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-11 bg-card border-2 border-primary/20 focus:border-primary/50 rounded-xl text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Your birth date contains the blueprint of your life's purpose
                </p>
              </div>
              <Button
                onClick={handleCalculate}
                variant="saffron"
                size="lg"
                className="w-full"
                disabled={!birthDate}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Reveal My Numbers
              </Button>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {results && results.loshu && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Section 1: Lo Shu Grid */}
              <div className="grid gap-8 lg:grid-cols-2">
                <SpiritualCard delay={0.1} hover={false}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Compass className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">
                        Lo Shu 3×3 Grid
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 aspect-square max-w-[400px] mx-auto p-4 bg-primary/5 rounded-2xl border-2 border-primary/20">
                      {[0, 1, 2].map(row => (
                        [0, 1, 2].map(col => {
                          const cell = results.loshu?.cells.find(c => c.position.row === row && c.position.col === col);
                          const isMissing = !cell || cell.count === 0;
                          return (
                            <div
                              key={`${row}-${col}`}
                              className={cn(
                                "relative flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-300 border-2",
                                isMissing
                                  ? "bg-muted/30 border-dashed border-muted-foreground/30 opacity-40"
                                  : "bg-card border-primary shadow-glow-saffron sm:hover:scale-105"
                              )}
                            >
                              <span className={cn(
                                "font-display text-3xl font-bold",
                                isMissing ? "text-muted-foreground" : "text-foreground"
                              )}>
                                {cell?.digit}
                              </span>
                              {!isMissing && cell.count > 1 && (
                                <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shadow-soft">
                                  {cell.count}x
                                </span>
                              )}
                            </div>
                          );
                        })
                      ))}
                    </div>
                  </div>
                </SpiritualCard>

                {/* Section 2: Number Strength & Weakness Summary */}
                <SpiritualCard delay={0.15} hover={false}>
                  <div className="space-y-6 h-full">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-gold" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">
                        Strength Summary
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {results.loshu.repeating.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {results.loshu.repeating.map((item) => (
                            <div key={item.number} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-display">
                                  {item.number}
                                </span>
                                <span className={cn(
                                  "text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold",
                                  item.intensity === 'Dominant' ? "bg-orange-500/20 text-orange-600" : "bg-blue-500/20 text-blue-600"
                                )}>
                                  {item.intensity}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Appears {item.count} times. This frequency indicates {item.intensity.toLowerCase()} influence in your life.
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-center py-10">No repeated numbers found in your date of birth.</p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 mt-auto">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Dominant Numbers</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.loshu.repeating.filter(r => r.intensity === 'Dominant').map(r => (
                          <span key={r.number} className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-bold">
                            Number {r.number}
                          </span>
                        ))}
                        {results.loshu.repeating.filter(r => r.intensity === 'Dominant').length === 0 && (
                          <span className="text-xs text-muted-foreground">No dominant numbers (3x or more).</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SpiritualCard>
              </div>

              {/* Section 3: Missing Number Interpretation */}
              <SpiritualCard delay={0.2} hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      Missing Number Interpretation
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.loshu.missing.map((item) => (
                      <div
                        key={item.number}
                        className="p-4 rounded-xl bg-muted/30 border border-border/50 group hover:border-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-display font-bold group-hover:bg-secondary/20 group-hover:text-secondary">
                            {item.number}
                          </span>
                          <span className="font-medium text-foreground">Missing {item.number}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </SpiritualCard>

              {/* Section 4: Arrow Analysis Section */}
              <SpiritualCard delay={0.25} hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      Arrow Analysis (Planes of Existence)
                    </h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {results.loshu.arrows.length > 0 ? (
                      results.loshu.arrows.map((arrow) => (
                        <div
                          key={`${arrow.name}-${arrow.type}`}
                          className={cn(
                            "p-5 rounded-2xl border-2 transition-all duration-300",
                            arrow.type === 'strength'
                              ? "bg-green-500/5 border-green-500/20 shadow-glow-gold"
                              : "bg-destructive/5 border-destructive/20"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-display text-xl font-bold flex items-center gap-2">
                              {arrow.type === 'strength' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              )}
                              Arrow of {arrow.name} {arrow.type === 'weakness' && '(Missing)'}
                            </h4>
                            <div className="flex gap-1">
                              {arrow.numbers.map(n => (
                                <span key={n} className={cn(
                                  "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                                  arrow.type === 'strength' ? "bg-green-500/20" : "bg-destructive/20"
                                )}>
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {arrow.meaning}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-muted/50 rounded-2xl">
                        <p className="text-muted-foreground italic">No primary Arrows of Strength or Weakness detected in your birth grid.</p>
                      </div>
                    )}
                  </div>
                </div>
              </SpiritualCard>

              {/* Original Core Numbers (Simplified and moved to bottom) */}
              <div className="pt-12 border-t border-border/50">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-8 text-center italic opacity-70">
                  Your Core Soul Blueprint
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Life Path Number */}
                  <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="font-display text-3xl font-bold text-primary mb-1">{results.lifePath?.number}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Life Path</div>
                    <div className="mt-2 text-sm font-medium">{results.lifePath?.title}</div>
                  </div>

                  {/* Destiny Number */}
                  <div className="text-center p-6 rounded-2xl bg-gold/5 border border-gold/10">
                    <div className="font-display text-3xl font-bold text-gold mb-1">{results.destiny?.number}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Destiny</div>
                    <div className="mt-2 text-sm font-medium">{results.destiny?.title}</div>
                  </div>

                  {/* Maturity Number */}
                  <div className="text-center p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <div className="font-display text-3xl font-bold text-secondary mb-1">{results.maturity?.number}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Maturity</div>
                    <div className="mt-2 text-sm font-medium">{results.maturity?.title}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BirthNumerologyPage;
