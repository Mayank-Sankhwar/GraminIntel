import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Tractor,
    Layers,
    ArrowRight,
    Sparkles,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface OnboardingModalProps {
    userId: string;
    onComplete: () => void;
}

const OnboardingModal = ({ userId, onComplete }: OnboardingModalProps) => {
    const [step, setStep] = useState(1);
    const [location, setLocation] = useState("");
    const [landSize, setLandSize] = useState("");
    const [soilType, setSoilType] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleSubmit = async () => {
        if (!location || !landSize || !soilType) {
            toast({
                title: t("onboarding.almostThere"),
                description: t("onboarding.fillDetails"),
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await authApi.saveFarmerInfo({
                userId,
                location,
                soilType,
                landSize: parseFloat(landSize)
            });

            toast({
                title: t("onboarding.complete"),
                description: t("onboarding.customized"),
            });
            onComplete();
        } catch (error) {
            toast({
                title: t("onboarding.error"),
                description: t("onboarding.wrong"),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/40 backdrop-blur-2xl"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-card/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative space-y-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                            <Sparkles size={12} /> {t("onboarding.personalize")}
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">{t("onboarding.title")}</h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            {t("onboarding.subtitle")}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <MapPin size={14} className="text-accent" /> {t("onboarding.location")}
                            </Label>
                            <Input
                                placeholder="e.g. Raipur, Chhattisgarh"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-accent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Tractor size={14} className="text-accent" /> {t("onboarding.landSize")}
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={landSize}
                                    onChange={(e) => setLandSize(e.target.value)}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Layers size={14} className="text-accent" /> {t("onboarding.soilType")}
                                </Label>
                                <Select value={soilType} onValueChange={setSoilType}>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-muted-foreground font-medium">
                                        <SelectValue placeholder={t("onboarding.selectType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Alluvial">{t("onboarding.alluvial")}</SelectItem>
                                        <SelectItem value="Black">{t("onboarding.black")}</SelectItem>
                                        <SelectItem value="Red">{t("onboarding.red")}</SelectItem>
                                        <SelectItem value="Laterite">{t("onboarding.laterite")}</SelectItem>
                                        <SelectItem value="Desert">{t("onboarding.desert")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-2xl text-lg shadow-xl shadow-accent/20 group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 animate-pulse">{t("onboarding.saving")}</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                {t("onboarding.finish")} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-primary/5 p-3 rounded-xl border border-white/5">
                        <Info size={14} className="flex-shrink-0" />
                        {t("onboarding.info")}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;
