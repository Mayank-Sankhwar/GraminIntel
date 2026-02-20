import CircuitLoader from "./CircuitLoader";

interface LoaderScreenProps {
  isExiting: boolean;
}

const LoaderScreen = ({ isExiting }: LoaderScreenProps) => (
  <div
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary ${isExiting ? "loader-exit" : ""}`}
  >
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl sm:text-5xl font-bold tracking-[0.2em] text-primary-foreground">
        <span className="typewriter-text font-mono">GRAMIN_INTEL</span>
      </h1>

      <div className="flex flex-col items-center gap-4">
        <CircuitLoader />
        <div className="w-48 h-1 rounded-full bg-primary-foreground/20 overflow-hidden">
          <div className="h-full rounded-full bg-primary-foreground/80 progress-bar-fill w-0" />
        </div>
      </div>

      <p className="text-primary-foreground/50 text-xs tracking-widest uppercase">
        Empowering Rural Intelligence
      </p>
    </div>
  </div>
);

export default LoaderScreen;
