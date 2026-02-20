import { useState, useEffect } from "react";
import LoaderScreen from "@/components/LoaderScreen";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 3000);
    const removeTimer = setTimeout(() => setLoading(false), 3600);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {loading && <LoaderScreen isExiting={exiting} />}
      {!loading && <HeroSection />}
    </>
  );
};

export default Index;
