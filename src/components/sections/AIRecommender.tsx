"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RotateCcw, CheckCircle2 } from "lucide-react";
import { aiStyleRecommender, type AiStyleRecommenderOutput } from "@/ai/flows/ai-style-recommender-flow";

export function AIRecommender() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiStyleRecommenderOutput | null>(null);
  const [formData, setFormData] = useState({
    faceShape: "",
    hairType: "",
    desiredAesthetic: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await aiStyleRecommender(formData);
      setResult(response);
    } catch (error) {
      console.error("AI Stylist Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      faceShape: "",
      hairType: "",
      desiredAesthetic: ""
    });
  };

  return (
    <section id="ai-stylist" className="py-24 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-primary mb-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto w-fit">
            <Sparkles className="w-3 h-3" />
            Next-Gen Barbering
          </Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-black">AI <span className="text-secondary">Style</span> Concierge</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">Not sure what look suits you? Let our AI consultant analyze your features and suggest the perfect cut and groom.</p>
        </div>

        {!result ? (
          <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-secondary p-8 text-white">
              <CardTitle className="text-2xl font-headline">Tell us about yourself</CardTitle>
              <CardDescription className="text-white/80">Input your details for a personalized recommendation.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Face Shape</Label>
                  <Select onValueChange={(val) => setFormData({ ...formData, faceShape: val })} required>
                    <SelectTrigger className="h-12 border-2 focus:ring-primary rounded-xl">
                      <SelectValue placeholder="Select your face shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="heart">Heart</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Hair Type</Label>
                  <Select onValueChange={(val) => setFormData({ ...formData, hairType: val })} required>
                    <SelectTrigger className="h-12 border-2 focus:ring-primary rounded-xl">
                      <SelectValue placeholder="Select your hair type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="wavy">Wavy</SelectItem>
                      <SelectItem value="curly">Curly</SelectItem>
                      <SelectItem value="coily">Coily</SelectItem>
                      <SelectItem value="thin">Fine / Thin</SelectItem>
                      <SelectItem value="thick">Coarse / Thick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Desired Aesthetic</Label>
                  <Input 
                    placeholder="e.g. Professional, Modern Edgy, Classic Gentleman, Low Maintenance" 
                    className="h-12 border-2 focus:ring-primary rounded-xl"
                    value={formData.desiredAesthetic}
                    onChange={(e) => setFormData({ ...formData, desiredAesthetic: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Features...</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> Generate My Look</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden mb-8">
              <div className="p-8 border-b border-border bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-headline font-bold">Your Style Recommendation</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mt-1">Curated by Barber shop AI</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} className="hover:bg-primary/10 hover:text-primary rounded-full">
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-4">
                        <CheckCircle2 className="w-4 h-4" />
                        Recommended Hairstyles
                      </h4>
                      <ul className="space-y-3">
                        {result.hairstyleSuggestions.map((style, idx) => (
                          <li key={idx} className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 font-bold text-secondary flex items-center justify-between group hover:bg-secondary hover:text-white transition-all cursor-default">
                            {style}
                            <div className="w-2 h-2 rounded-full bg-secondary group-hover:bg-white" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-4">
                        <CheckCircle2 className="w-4 h-4" />
                        Beard & Facial Hair
                      </h4>
                      <ul className="space-y-3">
                        {result.beardStyleSuggestions.map((style, idx) => (
                          <li key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 flex items-center justify-between group hover:bg-primary hover:text-white hover:border-primary transition-all cursor-default">
                            {style}
                            <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-white" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200">
                    <h4 className="text-lg font-headline font-bold mb-4 text-secondary">Artisan's Rationale</h4>
                    <p className="text-slate-600 leading-relaxed italic">
                      "{result.recommendationRationale}"
                    </p>
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <Button className="w-full bg-secondary hover:bg-secondary/90 h-14 font-bold uppercase tracking-widest" asChild>
                        <Link href="/book">Book These Styles Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
