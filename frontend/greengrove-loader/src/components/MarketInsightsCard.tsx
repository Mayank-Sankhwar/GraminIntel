import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
    BarChart3,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Globe,
    Newspaper,
    Info,
    ArrowRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig
} from "./ui/chart";

const marketData = {
    bestSellers: [
        { month: "Jan", mustard: 5100, wheat: 2100, rice: 3200 },
        { month: "Feb", mustard: 5800, wheat: 1950, rice: 3800 },
        { month: "Mar", mustard: 4200, wheat: 2400, rice: 2900 },
        { month: "Apr", mustard: 6100, wheat: 2050, rice: 3500 },
        { month: "May", mustard: 4900, wheat: 2600, rice: 3100 },
        { month: "Jun", mustard: 6800, wheat: 2200, rice: 4200 },
    ],
    topIncreasers: [
        { month: "Jan", mustard: 3000, wheat: 1800, rice: 2500 },
        { month: "Feb", mustard: 4500, wheat: 1200, rice: 3600 },
        { month: "Mar", mustard: 2800, wheat: 2200, rice: 2100 },
        { month: "Apr", mustard: 5600, wheat: 1600, rice: 3800 },
        { month: "May", mustard: 3900, wheat: 2800, rice: 2900 },
        { month: "Jun", mustard: 7200, wheat: 1900, rice: 4500 },
    ],
    regional: [
        { month: "Jan", mustard: 4500, wheat: 2000, rice: 3000 },
        { month: "Feb", mustard: 5200, wheat: 1850, rice: 3400 },
        { month: "Mar", mustard: 4100, wheat: 2300, rice: 2800 },
        { month: "Apr", mustard: 5800, wheat: 1950, rice: 3600 },
        { month: "May", mustard: 4400, wheat: 2500, rice: 3100 },
        { month: "Jun", mustard: 6300, wheat: 2100, rice: 3900 },
    ]
};

const chartConfig = {
    mustard: {
        label: "Mustard",
        color: "hsl(var(--accent))",
    },
    wheat: {
        label: "Wheat",
        color: "hsl(210, 80%, 50%)",
    },
    rice: {
        label: "Rice",
        color: "hsl(150, 80%, 40%)",
    },
} satisfies ChartConfig;

interface MarketInsightsCardProps {
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const MarketInsightsCard: React.FC<MarketInsightsCardProps> = ({
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("bestSellers");

    // Localize chart config
    const localizedChartConfig = {
        mustard: {
            label: language === "hi" ? "सरसों" : "Mustard",
            color: "hsl(var(--accent))",
        },
        wheat: {
            label: language === "hi" ? "गेहूं" : "Wheat",
            color: "hsl(210, 80%, 50%)",
        },
        rice: {
            label: language === "hi" ? "चावल" : "Rice",
            color: "hsl(150, 80%, 40%)",
        },
    } satisfies ChartConfig;

    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            transition={transition}
            className={`rounded-3xl border border-border bg-card/40 backdrop-blur-md p-7 min-h-[450px] flex flex-col ${!isZoomed ? 'cursor-pointer hover:shadow-xl' : 'w-full h-full shadow-2xl'}`}
        >
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isZoomed ? 'mb-12' : 'mb-8'}`}>
                <div>
                    <h3 className={`${isZoomed ? 'text-4xl' : 'text-2xl'} font-black text-foreground tracking-tight flex items-center gap-2 transition-all`}>
                        {t("market.analysis")} <BarChart3 className="text-accent w-6 h-6" />
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{t("market.subtitle")}</p>
                </div>

                <Tabs defaultValue="bestSellers" onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="bg-secondary/50 p-1 rounded-2xl h-11 border border-border/50">
                        <TabsTrigger value="bestSellers" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            {t("market.bestSellers")}
                        </TabsTrigger>
                        <TabsTrigger value="topIncreasers" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            {t("market.topIncreasers")}
                        </TabsTrigger>
                        <TabsTrigger value="regional" className="rounded-xl px-4 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            {t("market.regional")}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className={`flex-grow relative ${isZoomed ? 'min-h-[400px]' : 'min-h-[300px]'}`}>
                <ChartContainer config={localizedChartConfig} className="h-full w-full">
                    <AreaChart
                        data={marketData[activeTab as keyof typeof marketData]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorMustard" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-mustard)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--color-mustard)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-wheat)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--color-wheat)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-rice)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--color-rice)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Area
                            type="monotone"
                            dataKey="mustard"
                            stroke="var(--color-mustard)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMustard)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="wheat"
                            stroke="var(--color-wheat)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWheat)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="rice"
                            stroke="var(--color-rice)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRice)"
                            animationDuration={1500}
                        />
                        <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                    </AreaChart>
                </ChartContainer>
            </div>

            {isZoomed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pb-8 border-b border-border/50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-accent" />
                            <h4 className="font-bold text-foreground">{t("market.globe")}</h4>
                        </div>
                        <div className="bg-secondary/10 p-4 rounded-2xl border border-border/40">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                Mustard prices are projected to rise further due to limited supply from Ukraine. Local demand in Rajasthan markets is up by <span className="text-emerald-500 font-bold">18% YoY</span>.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-accent" />
                            <h4 className="font-bold text-foreground">{t("market.arrivals")}</h4>
                        </div>
                        <div className="space-y-2">
                            {[
                                { mandi: "Alwar Mandi", arrival: "2,400 Qtl", price: "₹5,450" },
                                { mandi: "Bharatpur Mandi", arrival: "1,800 Qtl", price: "₹5,380" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-border/30">
                                    <span className="text-sm font-semibold">{item.mandi}</span>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">{item.arrival}</p>
                                        <p className="text-sm font-black text-accent">{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={`${isZoomed ? 'mt-8' : 'mt-8'} grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border/50`}>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("market.volume")}</span>
                    <span className="text-sm font-black text-foreground">12.4k Tons</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("market.demand")}</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-foreground">{language === "hi" ? "उच्च" : "High"}</span>
                        <ArrowUpRight size={14} className="text-emerald-500" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("market.return")}</span>
                    <span className="text-sm font-black text-foreground">24.5%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("market.volatility")}</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-foreground">{language === "hi" ? "उच्च" : "High"}</span>
                        <Activity size={14} className="text-destructive animate-pulse" />
                    </div>
                </div>
            </div>

            {isZoomed && (
                <div className="mt-8 flex justify-end">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-border/50">
                        <Info size={14} />
                        {t("market.nextAnalysis")} 2h 45m
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MarketInsightsCard;
