import React from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Leaf,
    ChevronRight,
    TrendingUp,
    Zap,
    MapPin,
    Calendar,
    Target,
    Droplets,
    Sprout
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";

interface AICropSuggestionCardProps {
    cropName: string;
    description: string;
    confidence: number;
    expectedYield: string;
    suitabilityScore: number;
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const AICropSuggestionCard: React.FC<AICropSuggestionCardProps> = ({
    cropName,
    description,
    confidence,
    expectedYield,
    suitabilityScore,
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    const { t } = useLanguage();
    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            transition={transition}
            className={`relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-card/40 backdrop-blur-md ${!isZoomed ? "hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer" : "shadow-3xl shadow-emerald-500/20"} group ${isZoomed ? 'w-full h-full min-h-[500px]' : ''}`}
        >
            {/* Animated Glow Effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-all duration-700" />

            <div className="relative p-7 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t("ai.suggestion")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase font-bold tracking-tight">South Field Zone</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                    <div className={`rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transition-all duration-500 ${isZoomed ? 'w-24 h-24' : 'w-16 h-16'}`}>
                        <Leaf size={isZoomed ? 48 : 32} />
                    </div>
                    <div>
                        <h3 className={`${isZoomed ? 'text-5xl' : 'text-2xl'} font-black text-foreground tracking-tight transition-all`}>{cropName}</h3>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <TrendingUp size={14} />
                            <span>{confidence}% {t("ai.match")}</span>
                        </div>
                    </div>
                </div>

                <p className={`text-muted-foreground leading-relaxed mb-6 flex-grow italic tracking-tight font-medium ${isZoomed ? 'text-xl' : 'text-sm'}`}>
                    "{description}"
                </p>

                <div className={`grid gap-3 mb-6 transition-all ${isZoomed ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                    <div className="bg-white/5 p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={12} className="text-accent" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("ai.yieldEst")}</span>
                        </div>
                        <p className="text-sm font-black text-foreground">{expectedYield}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("ai.soilScore")}</span>
                        </div>
                        <p className="text-sm font-black text-foreground">{suitabilityScore}/10</p>
                    </div>
                    {isZoomed && (
                        <>
                            <div className="bg-white/5 p-3 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Droplets size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("ai.waterReq")}</span>
                                </div>
                                <p className="text-sm font-black text-foreground">{t("soil.optimal")}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sprout size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("ai.growthCycle")}</span>
                                </div>
                                <p className="text-sm font-black text-foreground">110 Days</p>
                            </div>
                        </>
                    )}
                </div>

                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 space-y-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-accent" />
                            <h4 className="font-bold text-foreground">{t("ai.calendar")}</h4>
                        </div>
                        <div className="bg-secondary/10 rounded-2xl p-6 border border-border/40">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase">{t("ai.window")}</span>
                                <span className="text-xs font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{t("ai.recommended")}</span>
                            </div>
                            <div className="relative h-4 bg-secondary/30 rounded-full overflow-hidden">
                                <div className="absolute left-[20%] right-[30%] h-full bg-emerald-500" />
                                <div className="absolute left-[20%] h-full w-1 bg-white/50" />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase">
                                <span>Sept</span>
                                <span>Oct (Best)</span>
                                <span>Nov</span>
                                <span>Dec</span>
                            </div>
                        </div>

                        <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20 flex gap-4">
                            <div className="shrink-0 p-3 rounded-xl bg-accent/10 text-accent">
                                <Target size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-1">{t("ai.strategy")}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    To maximize yield for this variety, we suggest a seed rate of 4.5kg/ha and early sowing to avoid aphid infestation during the flowering stage.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isZoomed && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl border-none h-12 shadow-lg shadow-emerald-600/20 group/btn">
                        {t("ai.plan")} <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default AICropSuggestionCard;
