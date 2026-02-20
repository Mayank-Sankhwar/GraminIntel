import React from "react";
import { motion } from "framer-motion";
import {
    Sun,
    CloudRain,
    Cloud,
    CloudLightning,
    Thermometer,
    Wind,
    Droplets,
    ArrowRight,
    Calendar,
    CloudRain as RainIcon,
    Wind as WindIcon,
    Lightbulb,
    Eye,
    Gauge,
    Sun as SunIcon
} from "lucide-react";
import { Button } from "./ui/button";

export type WeatherType = "Sunny" | "Rainy" | "Cloudy" | "Stormy";

interface WeatherCardProps {
    type: WeatherType;
    temperature: number;
    feelsLike?: number;
    humidity: number;
    windSpeed: number;
    pressure?: number;
    visibility?: number;
    location: string;
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const weatherConfigs = {
    Sunny: {
        icon: Sun,
        bgGradient: "from-amber-400/20 via-orange-500/10 to-transparent",
        iconColor: "text-amber-500",
        accentColor: "border-amber-500/50",
        label: "Sunny Day",
        animation: "animate-spin-slow"
    },
    Rainy: {
        icon: CloudRain,
        bgGradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
        iconColor: "text-blue-500",
        accentColor: "border-blue-500/50",
        label: "Rainy",
        animation: "animate-bounce-subtle"
    },
    Cloudy: {
        icon: Cloud,
        bgGradient: "from-slate-400/20 via-slate-500/10 to-transparent",
        iconColor: "text-slate-500",
        accentColor: "border-slate-500/50",
        label: "Partly Cloudy",
        animation: "animate-pulse"
    },
    Stormy: {
        icon: CloudLightning,
        bgGradient: "from-purple-600/20 via-gray-900/40 to-transparent",
        iconColor: "text-purple-500",
        accentColor: "border-purple-500/50",
        label: "Thunderstorm",
        animation: "animate-pulse"
    }
};

const WeatherCard: React.FC<WeatherCardProps> = ({
    type,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    pressure,
    visibility,
    location,
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    const config = weatherConfigs[type] || weatherConfigs.Sunny;
    const Icon = config.icon;

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
                        <h3 className={`${isZoomed ? 'text-5xl' : 'text-2xl'} font-bold text-foreground transition-all duration-500`}>{temperature}°C</h3>
                        <p className={`${isZoomed ? 'text-lg' : 'text-sm'} text-muted-foreground font-medium transition-all`}>{location}</p>
                    </div>
                    <div className={`${config.iconColor} ${config.animation}`}>
                        <Icon size={isZoomed ? 80 : 48} strokeWidth={1.5} className="transition-all" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-accent" />
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Humidity</p>
                            <p className="text-sm font-semibold text-foreground">{humidity}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-accent" />
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</p>
                            <p className="text-sm font-semibold text-foreground">{windSpeed} km/h</p>
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
                        {/* 7-Day Forecast */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-accent" />
                                <h4 className="font-bold text-foreground">7-Day Forecast</h4>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                {[
                                    { day: "Mon", temp: 32, icon: SunIcon, color: "text-amber-500" },
                                    { day: "Tue", temp: 30, icon: Cloud, color: "text-slate-400" },
                                    { day: "Wed", temp: 28, icon: RainIcon, color: "text-blue-500" },
                                    { day: "Thu", temp: 31, icon: SunIcon, color: "text-amber-500" },
                                    { day: "Fri", temp: 33, icon: SunIcon, color: "text-orange-500" },
                                    { day: "Sat", temp: 29, icon: CloudLightning, color: "text-purple-500" },
                                    { day: "Sun", temp: 30, icon: Cloud, color: "text-slate-400" },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-secondary/20 rounded-lg p-3 text-center border border-border/50">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">{item.day}</p>
                                        <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                                        <p className="text-sm font-bold text-foreground">{item.temp}°</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Extended Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-secondary/10 rounded-xl p-4 border border-border/40 flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <Thermometer size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Feels Like</p>
                                    <p className="text-base font-bold text-foreground">{feelsLike || temperature + 2}°C</p>
                                </div>
                            </div>
                            <div className="bg-secondary/10 rounded-xl p-4 border border-border/40 flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Visibility</p>
                                    <p className="text-base font-bold text-foreground">{visibility || 14} km</p>
                                </div>
                            </div>
                            <div className="bg-secondary/10 rounded-xl p-4 border border-border/40 flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Gauge size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pressure</p>
                                    <p className="text-base font-bold text-foreground">{pressure || 1012} hPa</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestion Box */}
                        <div className="bg-accent/5 rounded-xl p-6 border border-accent/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Lightbulb size={64} className="text-accent" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                        <Lightbulb size={18} />
                                    </div>
                                    <h4 className="font-bold text-foreground">Agricultural Insight</h4>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed max-w-lg">
                                    Based on the 7-day forecast, we recommend performing irrigation <span className="text-accent font-bold">Tomorrow morning (6:00 AM)</span> before the temperatures peak. High humidity on Wednesday indicates a potential risk for fungal growth in Section B.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isZoomed && (
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground/80">{config.label}</span>
                        <Button variant="ghost" size="sm" className="h-8 text-accent hover:text-accent hover:bg-accent/10 p-0">
                            Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Subtle Visual Decorations based on weather */}
            {type === "Rainy" && (
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-blue-500">
                        <circle cx="20" cy="20" r="2" />
                        <circle cx="50" cy="10" r="2" />
                        <circle cx="80" cy="30" r="2" />
                        <circle cx="30" cy="60" r="2" />
                        <circle cx="70" cy="80" r="2" />
                    </svg>
                </div>
            )}
        </motion.div>
    );
};

export default WeatherCard;
