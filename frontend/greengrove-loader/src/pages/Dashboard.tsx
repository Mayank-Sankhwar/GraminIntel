import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Transition } from "framer-motion";
import {
  Leaf,
  CloudSun,
  Droplets,
  Phone,
  MessageCircle,
  User,
  Thermometer,
  CloudRain,
  ArrowRight,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import WeatherCard, { WeatherType } from "@/components/WeatherCard";
import SoilHealthCard from "@/components/SoilHealthCard";
import MarketPriceCard from "@/components/MarketPriceCard";
import TaskAlertCard from "@/components/TaskAlertCard";
import AICropSuggestionCard from "@/components/AICropSuggestionCard";
import MarketInsightsCard from "@/components/MarketInsightsCard";
import OnboardingModal from "@/components/OnboardingModal";
import LoaderScreen from "@/components/LoaderScreen";
import { authApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const Dashboard = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<{
    type: WeatherType;
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    pressure: number;
    visibility: number;
  }>({
    type: "Sunny",
    temp: 32,
    feelsLike: 35,
    humidity: 45,
    wind: 12,
    pressure: 1012,
    visibility: 10
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authApi.getProfile(userId);
        if (!response.farmerInfo) {
          setShowOnboarding(true);
        } else {
          setFarmerProfile(response.farmerInfo);
        }

        // Fetch weather data
        const weather = await authApi.getWeather(userId);
        setCurrentWeather({
          type: weather.type,
          temp: weather.temp,
          feelsLike: weather.feels_like,
          humidity: weather.humidity,
          wind: weather.wind,
          pressure: weather.pressure,
          visibility: weather.visibility
        });

        if (weather.isDemo) {
          console.log("Weather is in Demo Mode. Add OPENWEATHER_API_KEY to backend/.env for real data.");
        }
      } catch (error) {
        console.error("Error checking profile or weather:", error);
      } finally {
        // Smooth transition for loader
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 600); // Match fade-out-loader animation duration
        }, 2000); // Ensure loader shows for a minimum time for premium feel
      }
    };
    checkProfile();
  }, [userId]);

  const tasks = [
    { id: "1", text: "Irrigate Wheat Field Section B", priority: "High" as const, time: "2h remaining" },
    { id: "2", text: "Apply NPK Fertilizer to Mustard", priority: "Medium" as const, time: "Tomorrow" },
    { id: "3", text: "Check Soil Moisture in South Zone", priority: "Low" as const, time: "3 days ago" }
  ];

  const soilData = {
    moisture: 68,
    phLevel: 6.8,
    nitrogen: "High",
    phosphorus: "Med",
    potassium: "Med",
    condition: "Optimal" as const,
  };

  const zoomTransition: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 120,
    mass: 1,
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoaderScreen isExiting={isExiting} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background pb-20 relative">
        <AnimatePresence>
          {activeCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCard(null)}
              className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-center justify-center p-6 py-20">
                <div
                  className={`relative w-full ${activeCard === 'market-insights' ? 'max-w-6xl' : 'max-w-4xl'} pointer-events-auto`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setActiveCard(null)}
                    className="absolute -top-12 right-0 text-white hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                    <X size={24} />
                  </button>

                  {activeCard === "weather" && (
                    <WeatherCard
                      type={currentWeather.type}
                      temperature={currentWeather.temp}
                      feelsLike={currentWeather.feelsLike}
                      humidity={currentWeather.humidity}
                      windSpeed={currentWeather.wind}
                      pressure={currentWeather.pressure}
                      visibility={currentWeather.visibility}
                      location={farmerProfile?.location || "Local Area"}
                      layoutId="weather-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "soil" && (
                    <SoilHealthCard
                      moisture={68}
                      phLevel={6.5}
                      nitrogen="High"
                      phosphorus="Med"
                      potassium="High"
                      condition="Optimal"
                      layoutId="soil-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "ai-suggestion" && (
                    <AICropSuggestionCard
                      cropName="Premium Mustard"
                      description="Optimal weather patterns and soil nutrient levels indicate a high-yield window for mustard planting in Section B."
                      confidence={94}
                      expectedYield="2.4 Tons/Acre"
                      suitabilityScore={9.2}
                      layoutId="ai-suggestion-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "market-insights" && (
                    <MarketInsightsCard
                      layoutId="market-insights-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "market-price" && (
                    <MarketPriceCard
                      commodity="Mustard"
                      price={5400}
                      currency="₹"
                      unit="Quintal"
                      trend="up"
                      changePercentage={12}
                      layoutId="market-price-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "market-price-wheat" && (
                    <MarketPriceCard
                      commodity="Wheat"
                      price={2125}
                      currency="₹"
                      unit="Quintal"
                      trend="stable"
                      changePercentage={0}
                      layoutId="market-price-card-wheat"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}

                  {activeCard === "task-alerts" && (
                    <TaskAlertCard
                      tasks={[
                        { id: "1", text: "Irrigation required for Section B", priority: "High", time: "2h ago" },
                        { id: "2", text: "Check pest infestation in Wheat blocks", priority: "Medium", time: "5h ago" },
                        { id: "3", text: "Harvesting window starting soon", priority: "Low", time: "1d ago" },
                      ]}
                      layoutId="task-alerts-card"
                      transition={zoomTransition}
                      isZoomed
                    />
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-accent" />
              <span className="font-mono font-bold text-lg tracking-wider">GRAMIN_INTEL</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Language Toggle */}
              <div className="flex bg-white/10 rounded-lg p-0.5 border border-white/5 backdrop-blur-md">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === "en" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 hover:text-primary-foreground"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === "hi" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 hover:text-primary-foreground"}`}
                >
                  हिं
                </button>
              </div>

              <Link to="/profile" className="flex items-center gap-3 group/profile hover:bg-white/5 p-1 px-2 rounded-xl transition-all">
                <Avatar className="h-9 w-9 border-2 border-accent transition-transform group-hover/profile:scale-110">
                  <AvatarFallback className="bg-primary text-accent font-bold text-sm">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs text-primary-foreground/60 leading-none">{t("welcome")}</p>
                  <p className="text-sm font-semibold text-accent leading-tight">
                    {localStorage.getItem("username") || "Rajesh Kumar"}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{t("dashboard")}</h2>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Quick Weather Toggle for Demonstration */}
            <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg border border-border">
              {(["Sunny", "Rainy", "Cloudy", "Stormy"] as WeatherType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCurrentWeather({ ...currentWeather, type: t })}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currentWeather.type === t
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Row: Weather and Soil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <WeatherCard
              {...currentWeather}
              windSpeed={currentWeather.wind}
              temperature={currentWeather.temp}
              location={farmerProfile?.location || "Local Area"}
              layoutId="weather-card"
              transition={zoomTransition}
              onClick={() => setActiveCard("weather")}
            />
            <SoilHealthCard
              {...soilData}
              layoutId="soil-card"
              transition={zoomTransition}
              onClick={() => setActiveCard("soil")}
            />
          </div>

          {/* Advanced Row: AI Suggestion (1/3) and Market Insights (2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <AICropSuggestionCard
                cropName={language === "hi" ? "पीली सरसों (Premium)" : "Premium Yellow Mustard"}
                description={language === "hi" ? "खेत की नमी और क्षेत्रीय मांग के आधार पर यह वर्तमान में सबसे अच्छा विकल्प है।" : "Optimal soil moisture and rising regional demand make this the best choice."}
                confidence={94}
                expectedYield={language === "hi" ? "2.4 टन/हेक्टेयर" : "2.4 Tons/ha"}
                suitabilityScore={9.2}
                layoutId="ai-suggestion-card"
                onClick={() => setActiveCard("ai-suggestion")}
                transition={zoomTransition}
              />
            </div>
            <div className="lg:col-span-2">
              <MarketInsightsCard
                layoutId="market-insights-card"
                onClick={() => setActiveCard("market-insights")}
                transition={zoomTransition}
              />
            </div>
          </div>

          {/* Tertiary Row: Market Prices and Task Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MarketPriceCard
              commodity={language === "hi" ? "सरसों" : "Mustard"}
              price={5420}
              currency="₹"
              unit={language === "hi" ? "क्विंटल" : "Quintal"}
              trend="up"
              changePercentage={2.4}
              layoutId="market-price-card"
              onClick={() => setActiveCard("market-price")}
              transition={zoomTransition}
            />
            <MarketPriceCard
              commodity={language === "hi" ? "गेहूं" : "Wheat"}
              price={2125}
              currency="₹"
              unit={language === "hi" ? "क्विंटल" : "Quintal"}
              trend="stable"
              changePercentage={0}
              layoutId="market-price-card-wheat"
              onClick={() => setActiveCard("market-price-wheat")}
              transition={zoomTransition}
            />
            <TaskAlertCard
              tasks={tasks.map(t => ({
                ...t,
                text: language === "hi" ? `कार्य: ${t.text}` : t.text // Simplified hi fallback for now
              }))}
              layoutId="task-alerts-card"
              onClick={() => setActiveCard("task-alerts")}
              transition={zoomTransition}
            />
          </div>

          {/* Support Options */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card/40 flex items-center justify-between hover:border-accent/40 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t("common.call")}</h4>
                  <p className="text-sm text-muted-foreground">{t("common.expert_support")}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl border border-border bg-card/40 flex items-center justify-between hover:border-accent/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t("common.whatsapp")}</h4>
                  <p className="text-sm text-muted-foreground">{t("common.instant_chat")}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </a>
          </div>
        </main>

        {/* Onboarding Modal */}
        <AnimatePresence>
          {showOnboarding && userId && (
            <OnboardingModal
              userId={userId}
              onComplete={() => {
                setShowOnboarding(false);
                // Refresh profile data locally
                authApi.getProfile(userId).then(res => setFarmerProfile(res.farmerInfo));
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Dashboard;
