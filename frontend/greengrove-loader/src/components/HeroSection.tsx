import { Leaf, BarChart3, CloudSun, Smartphone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BarChart3, title: "Market Insights", desc: "Real-time mandi prices & demand forecasts" },
  { icon: CloudSun, title: "Weather Intel", desc: "Hyperlocal weather alerts for your fields" },
  { icon: Leaf, title: "Crop Advisory", desc: "AI-driven recommendations for better yield" },
  { icon: Smartphone, title: "Mobile First", desc: "Built for every farmer, every device" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="hero-enter hero-enter-delay-1 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-accent-foreground" />
          <span className="font-mono font-bold text-lg tracking-wider text-foreground">
            GRAMIN_INTEL
          </span>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate("/auth")}>
          Get Started <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </nav>

      {/* Hero */}
      <section className="hero-enter hero-enter-delay-2 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6">
          <Leaf className="w-4 h-4" />
          Intelligence for Rural India
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-foreground leading-tight mb-6">
          Smart Farming
          <br />
          <span className="text-accent-foreground">Starts Here.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Data-driven insights for crop planning, market prices, and weather — designed for the hands that feed the nation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="text-base" onClick={() => navigate("/auth")}>
            Explore Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="text-base">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="hero-enter hero-enter-delay-3 px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-accent-foreground/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/40 transition-colors">
                <f.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-enter hero-enter-delay-4 px-6 py-8 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2026 GRAMIN_INTEL — Empowering Rural Intelligence
        </p>
      </footer>
    </div>
  );
};

export default HeroSection;
