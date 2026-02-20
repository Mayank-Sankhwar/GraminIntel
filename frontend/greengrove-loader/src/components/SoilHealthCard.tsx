import React from "react";
import { motion } from "framer-motion";
import {
    Droplet,
    Leaf,
    FlaskConical,
    Waves,
    ArrowRight,
    Sprout,
    ClipboardCheck,
    TrendingUp,
    AlertCircle,
    Info
} from "lucide-react";
import { Button } from "./ui/button";

interface SoilHealthCardProps {
    moisture: number;
    phLevel: number;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    condition: "Optimal" | "Suboptimal" | "Critical";
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const conditionConfigs = {
    Optimal: {
        bgGradient: "from-emerald-500/20 via-teal-600/10 to-transparent",
        iconColor: "text-emerald-500",
        label: "Healthy Soil",
        animation: "animate-pulse"
    },
    Suboptimal: {
        bgGradient: "from-amber-500/20 via-orange-600/10 to-transparent",
        iconColor: "text-amber-500",
        label: "Needs Attention",
        animation: ""
    },
    Critical: {
        bgGradient: "from-rose-600/20 via-red-600/10 to-transparent",
        iconColor: "text-rose-500",
        label: "Critical Condition",
        animation: "animate-bounce-subtle"
    }
};

const SoilHealthCard: React.FC<SoilHealthCardProps> = ({
    moisture,
    phLevel,
    nitrogen,
    phosphorus,
    potassium,
    condition,
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    const config = conditionConfigs[condition];

    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            transition={transition}
            className={`relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm ${!isZoomed ? "hover:shadow-xl hover:shadow-accent/5 cursor-pointer" : "shadow-2xl shadow-accent/20 scale-100"} ${isZoomed ? 'w-full h-full min-h-[400px]' : ''}`}
        >
            {/* Background Thematic Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} pointer-events-none`} />

            <div className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className={`${isZoomed ? 'text-5xl' : 'text-2xl'} font-bold text-foreground transition-all duration-500`}>{moisture}%</h3>
                        <p className={`${isZoomed ? 'text-lg' : 'text-sm'} text-muted-foreground font-medium`}>Moisture Content</p>
                    </div>
                    <div className={`${config.iconColor} ${config.animation}`}>
                        <Droplet size={isZoomed ? 80 : 48} strokeWidth={1.5} className="transition-all" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-accent" />
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PH Level</p>
                            <p className="text-sm font-semibold text-foreground">{phLevel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-accent" />
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nutrients</p>
                            <p className="text-[11px] font-semibold text-foreground uppercase">N-P-K: {nitrogen}-{phosphorus}-{potassium}</p>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 space-y-8"
                    >
                        {/* Moisture Trends */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                <h4 className="font-bold text-foreground">24h Moisture Trend</h4>
                            </div>
                            <div className="bg-secondary/10 rounded-xl p-6 border border-border/40 h-32 flex items-end gap-2 justify-between">
                                {[65, 62, 70, 75, 72, 68, 65, 68].map((val, idx) => (
                                    <div key={idx} className="flex-1 group relative">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                                            className={`w-full bg-accent/40 rounded-t-sm group-hover:bg-accent/60 transition-colors`}
                                        />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold text-accent bg-background px-1 rounded shadow-sm">
                                            {val}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 px-1 text-[10px] text-muted-foreground font-bold uppercase">
                                <span>24h ago</span>
                                <span>12h ago</span>
                                <span>Now</span>
                            </div>
                        </div>

                        {/* AI Action Recommendations */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-accent" />
                                <h4 className="font-bold text-foreground">AI Sustainability Actions</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex gap-4">
                                    <div className="shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Fertilizer Timing</p>
                                        <p className="text-xs text-muted-foreground mt-1">Excellent time to apply Nitrogen. Soil moisture is optimal for absorption.</p>
                                    </div>
                                </div>
                                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 flex gap-4">
                                    <div className="shrink-0 p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">PH Balance</p>
                                        <p className="text-xs text-muted-foreground mt-1">PH is slightly alkaline. Consider adding organic mulch to Section C.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-foreground">Full Soil Lab Report</h4>
                                <p className="text-sm text-muted-foreground">Digital twin analysis synchronization active.</p>
                            </div>
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                                View Report
                            </Button>
                        </div>
                    </motion.div>
                )}

                {!isZoomed && (
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.iconColor} animate-pulse`} />
                            <span className="text-sm font-medium text-foreground/80">{config.label}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-accent hover:text-accent hover:bg-accent/10 p-0">
                            Soil Report <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Subtle Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 pointer-events-none">
                <Leaf className="w-full h-full text-emerald-500 rotate-12" />
            </div>
        </motion.div>
    );
};

export default SoilHealthCard;
