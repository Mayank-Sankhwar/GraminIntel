import React from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowRight,
    Info,
    CheckSquare,
    ListTodo,
    MoreHorizontal
} from "lucide-react";
import { Button } from "./ui/button";

interface TaskItem {
    id: string;
    text: string;
    priority: "High" | "Medium" | "Low";
    time: string;
}

interface TaskAlertCardProps {
    tasks: TaskItem[];
    layoutId?: string;
    onClick?: () => void;
    isZoomed?: boolean;
    transition?: any;
}

const priorityConfigs = {
    High: {
        bgGradient: "from-rose-500/20 via-rose-600/10 to-transparent",
        icon: AlertTriangle,
        iconColor: "text-rose-500",
        label: "Urgent Action Required"
    },
    Medium: {
        bgGradient: "from-amber-400/20 via-orange-500/10 to-transparent",
        icon: Info,
        iconColor: "text-amber-500",
        label: "Maintenance Tasks"
    },
    Low: {
        bgGradient: "from-blue-400/20 via-indigo-500/10 to-transparent",
        icon: Bell,
        iconColor: "text-blue-500",
        label: "Reminders"
    }
};

const TaskAlertCard: React.FC<TaskAlertCardProps> = ({
    tasks,
    layoutId,
    onClick,
    isZoomed,
    transition
}) => {
    // Determine the overall card theme based on the highest priority task
    const topTask = tasks.find(t => t.priority === "High") || tasks[0];
    const config = priorityConfigs[topTask?.priority || "Low"];

    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            transition={transition}
            className={`relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm ${!isZoomed ? "hover:shadow-xl hover:shadow-accent/5 cursor-pointer" : "shadow-3xl shadow-rose-500/10"} ${isZoomed ? 'w-full h-full min-h-[500px]' : ''}`}
        >
            {/* Background Thematic Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} pointer-events-none`} />

            <div className={`relative p-6 ${isZoomed ? 'h-full flex flex-col' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className={`${isZoomed ? 'text-4xl' : 'text-2xl'} font-bold text-foreground transition-all`}>Pending Tasks</h3>
                        <p className="text-sm text-muted-foreground font-medium">{tasks.length} items need attention</p>
                    </div>
                    <div className={`${config.iconColor} bg-white/10 p-2 rounded-lg animate-pulse`}>
                        <Bell size={isZoomed ? 48 : 32} strokeWidth={1.5} />
                    </div>
                </div>

                <div className={`space-y-4 mb-6 ${isZoomed ? 'flex-grow' : ''}`}>
                    {(isZoomed ? tasks : tasks.slice(0, 2)).map((task) => (
                        <div key={task.id} className={`flex gap-3 items-start group p-3 rounded-2xl transition-all ${isZoomed ? 'bg-white/5 border border-border/40 hover:bg-white/10' : ''}`}>
                            <div className={`mt-1 h-5 w-5 rounded-md border border-${priorityConfigs[task.priority].iconColor}/30 flex items-center justify-center shrink-0`}>
                                <CheckCircle2 size={12} className="text-muted-foreground group-hover:text-accent transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold text-foreground leading-tight ${isZoomed ? 'text-base' : 'text-sm'}`}>{task.text}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Clock size={10} className="text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{task.time}</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ml-auto ${priorityConfigs[task.priority].iconColor} bg-white/5`}>{task.priority}</span>
                                </div>
                            </div>
                            {isZoomed && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={14} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div className="bg-accent p-6 rounded-2xl flex items-center justify-between text-accent-foreground shadow-lg shadow-accent/20">
                            <div>
                                <p className="text-xs font-bold uppercase opacity-80 mb-1">Weekly Completion</p>
                                <p className="text-2xl font-black">12/15</p>
                            </div>
                            <CheckSquare size={40} className="opacity-20" />
                        </div>
                        <div className="bg-secondary p-6 rounded-2xl border border-border/50 flex flex-col justify-center">
                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Productivity Score</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-foreground">84%</p>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+4%</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className={`pt-4 border-t border-border/50 flex items-center justify-between ${isZoomed ? 'mt-8' : ''}`}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{config.label}</span>
                    {!isZoomed ? (
                        <Button variant="ghost" size="sm" className="h-8 text-accent hover:text-accent hover:bg-accent/10 p-0">
                            View All Tasks <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-xl font-bold">Manage Scheduler</Button>
                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold">Mark All Complete</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Decoration */}
            <div className="absolute -top-4 -right-4 w-32 h-32 opacity-5 pointer-events-none">
                <Calendar className="w-full h-full text-foreground/20" />
            </div>
        </motion.div>
    );
};

export default TaskAlertCard;
