import React from "react";
import { motion } from "framer-motion";
import {
    CircleDollarSign,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    LineChart,
    ChevronRight,
    History,
    Activity,
    Info,
    Calendar
} from "lucide-react";
import { Button } from "./ui/button";

interface MarketPriceCardProps {
    commodity: string;
    price: number;
    currency: string;
    unit: string;
    trend: "up" | "down" | "stable";
    changePercentage: number;
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const trendConfigs = {
    up: {
        bgGradient: "from-emerald-400/20 via-emerald-500/10 to-transparent",
        icon: ArrowUpRight,
        iconColor: "text-emerald-500",
        trendColor: "text-emerald-500",
        label: "Price Rising"
    },
    down: {
        bgGradient: "from-rose-500/20 via-rose-600/10 to-transparent",
        icon: ArrowDownRight,
        iconColor: "text-rose-500",
        trendColor: "text-rose-500",
        label: "Price Falling"
    },
    stable: {
        bgGradient: "from-blue-400/20 via-indigo-500/10 to-transparent",
        icon: TrendingUp,
        iconColor: "text-blue-500",
        trendColor: "text-blue-500",
        label: "Price Stable"
    }
};

const MarketPriceCard: React.FC<MarketPriceCardProps> = ({
    commodity,
    price,
    currency,
    unit,
    trend,
    changePercentage,
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    const config = trendConfigs[trend];
    const TrendIcon = config.icon;

    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            transition={transition}
            className={`relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm ${!isZoomed ? "hover:shadow-xl hover:shadow-accent/5 cursor-pointer" : "shadow-3xl shadow-emerald-500/10"} ${isZoomed ? 'w-full h-full min-h-[450px]' : ''}`}
        >
            {/* Background Thematic Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} pointer-events-none`} />

            <div className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Mandi Bhav</p>
                        <h3 className={`${isZoomed ? 'text-5xl' : 'text-2xl'} font-bold text-foreground transition-all duration-500`}>{commodity}</h3>
                    </div>
                    <div className={`${config.iconColor} bg-white/10 p-2 rounded-lg`}>
                        <CircleDollarSign size={isZoomed ? 64 : 32} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="flex items-end gap-2 mb-6">
                    <span className={`${isZoomed ? 'text-6xl' : 'text-3xl'} font-black text-foreground transition-all`}>{currency}{price}</span>
                    <span className={`${isZoomed ? 'text-lg' : 'text-sm'} text-muted-foreground font-medium mb-1 transition-all`}>/ {unit}</span>
                    <div className={`flex items-center gap-0.5 ml-auto ${config.trendColor} font-bold ${isZoomed ? 'text-base px-4 py-1.5' : 'text-sm px-2 py-0.5'} bg-${config.trendColor}/10 rounded-full transition-all`}>
                        <TrendIcon size={isZoomed ? 20 : 16} />
                        {trend !== "stable" && <span>{changePercentage}%</span>}
                    </div>
                </div>

                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 space-y-8"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-2xl p-6 border border-border/40 space-y-4">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-accent" />
                                    <h4 className="font-bold text-foreground">Recent Highlights</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Highest (30d)</span>
                                        <span className="font-bold text-foreground">₹5,750</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Lowest (30d)</span>
                                        <span className="font-bold text-foreground">₹4,900</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                                        <span className="text-muted-foreground">Volume Change</span>
                                        <span className="font-bold text-emerald-500">+14%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-accent/5 rounded-2xl p-6 border border-accent/20 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-accent" />
                                    <h4 className="font-bold text-foreground">AI Market Sentiment</h4>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed italic">
                                    "Bullish sentiment persists as arrivals remain steady but demand hits record highs for processing units."
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">BULLISH</span>
                                    <span className="text-[10px] font-bold bg-white/5 text-muted-foreground px-2 py-1 rounded">ACCUMULATING</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary/10 rounded-2xl p-6 border border-border/30">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar className="w-5 h-5 text-accent" />
                                <h4 className="font-bold text-foreground">Predicted Next 15 Days</h4>
                            </div>
                            <div className="flex items-end h-24 gap-3 bg-white/5 rounded-xl p-4">
                                {[30, 45, 40, 60, 55, 75, 70, 85].map((h, i) => (
                                    <div key={i} className="flex-1 bg-accent/40 rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isZoomed && (
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{config.label}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-accent hover:text-accent hover:bg-accent/10 p-0">
                            Market Insight <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Subtle Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
                    <path d="M10 80 L30 50 L50 60 L80 20 L90 30 L80 20 L70 10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </motion.div>
    );
};

export default MarketPriceCard;
