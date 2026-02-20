import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    BadgeCheck,
    Calendar,
    Hash,
    Languages,
    Accessibility,
    Mic,
    MessageCircle,
    Sprout,
    Wheat,
    Tractor,
    Award,
    Layers
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [userData, setUserData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/auth");
                return;
            }

            try {
                const response = await authApi.getProfile(userId);
                setUserData(response.user);
            } catch (error) {
                console.error("Profile fetch error:", error);
                toast({
                    title: "Error",
                    description: "Could not load profile data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!userData) return null;

    // Enhanced stats and farm identity (using real farmerInfo from DB)
    const displayData = {
        ...userData,
        farm_identity: {
            id: userData.farmerInfo?._id ? `FARM-${userData.farmerInfo._id.slice(-5).toUpperCase()}` : `FARM-${userData._id.slice(-5).toUpperCase()}`,
            location: userData.farmerInfo?.location || "Location not set",
            total_area: userData.farmerInfo?.landSize ? `${userData.farmerInfo.landSize} Acres` : "Size not set",
            primary_crops: ["Mustard", "Wheat"], // These could be dynamic later
            soil_type: userData.farmerInfo?.soilType || "Not specified"
        },
        stats: [
            { label: "Season Yield", value: "48 Tons", icon: Award },
            { label: "Tasks Done", value: "152", icon: Sprout },
            { label: "Expert Consults", value: "12", icon: Mic },
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Nav */}
            <div className="bg-primary text-primary-foreground sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 gap-2">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <span className="font-mono font-bold tracking-widest text-accent">USER_PROFILE</span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Hero Section */}
                    <motion.section variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8 bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                        <div className="relative">
                            <Avatar className="h-32 w-32 border-4 border-accent shadow-2xl shadow-accent/20">
                                <AvatarFallback className="bg-primary text-accent text-4xl font-black">RK</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-card shadow-lg">
                                <BadgeCheck size={20} />
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-black text-foreground tracking-tight">{displayData.username}</h1>
                                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-1 rounded-full uppercase tracking-widest">Premium Farmer</span>
                            </div>
                            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                                <Mail size={16} /> {displayData.email}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                {displayData.stats.map((stat: any, i: number) => (
                                    <div key={i} className="text-center md:text-left pr-4 border-r border-border last:border-none">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                                        <p className="text-lg font-black text-foreground">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Farm Identity */}
                        <motion.section variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2rem] space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Tractor className="text-accent w-5 h-5" />
                                <h2 className="text-xl font-bold">Farm Identity</h2>
                            </div>
                            <div className="space-y-4">
                                <DetailItem icon={Hash} label="Farm ID" value={displayData.farm_identity.id} />
                                <DetailItem icon={MapPin} label="Location" value={displayData.farm_identity.location} />
                                <DetailItem icon={MapPin} label="Total Area" value={displayData.farm_identity.total_area} />
                                <DetailItem icon={Layers} label="Soil Type" value={displayData.farm_identity.soil_type} />
                                <div className="pt-4 flex gap-2">
                                    {displayData.farm_identity.primary_crops.map((crop: string, i: number) => (
                                        <span key={i} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                                            <Wheat size={12} /> {crop}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                        {/* Accessibility & Options */}
                        <motion.section variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2rem] space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Accessibility className="text-accent w-5 h-5" />
                                <h2 className="text-xl font-bold">Accessibility</h2>
                            </div>
                            <div className="space-y-4">
                                <DetailItem icon={Languages} label="Preference" value={displayData.language_preference || "Hindi (हिन्दी)"} />
                                <DetailItem
                                    icon={displayData.answer_preference === 'voice' ? Mic : MessageCircle}
                                    label="Mode"
                                    value={(displayData.answer_preference || "CHAT").toUpperCase()}
                                    highlight
                                />
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Condition Status</p>
                                    <p className="text-sm font-bold text-foreground">{displayData.disability_type || "No specific condition"}</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Contact Information */}
                        <motion.section variants={itemVariants} className="md:col-span-2 bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2rem] grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Phone className="text-accent w-5 h-5" />
                                    <h2 className="text-xl font-bold">Communication</h2>
                                </div>
                                <DetailItem icon={Phone} label="Primary Mobile" value={displayData.phone_number} />
                                <DetailItem icon={Calendar} label="Join Date" value="October 12, 2024" />
                            </div>
                            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center">
                                <h4 className="font-bold mb-2">Security Verification</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                    Your profile is verified with Mandi Access Code ending in <span className="text-foreground font-bold">***{displayData.code.toString().slice(-3)}</span>.
                                </p>
                                <Button size="sm" variant="outline" className="w-full rounded-xl border-accent/20 text-accent hover:bg-accent/5">Update Security Code</Button>
                            </div>
                        </motion.section>
                    </div>

                    <motion.div variants={itemVariants} className="flex justify-center gap-4">
                        <Button className="rounded-2xl px-8 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20">Edit Profile</Button>
                        <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold" onClick={() => {
                            localStorage.clear();
                            navigate("/auth");
                        }}>Sign Out</Button>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, highlight }: any) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-accent transition-colors">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{label}</p>
                <p className={`text-sm font-black transition-all ${highlight ? 'text-accent' : 'text-foreground'}`}>{value}</p>
            </div>
        </div>
    </div>
);

export default Profile;
