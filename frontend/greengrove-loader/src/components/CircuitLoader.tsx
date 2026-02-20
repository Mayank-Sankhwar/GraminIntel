const CircuitLoader = () => (
  <svg
    className="circuit-loader w-10 h-10"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="25" cy="25" r="20" stroke="hsl(42 100% 50% / 0.3)" strokeWidth="2" />
    <path
      d="M25 5 A20 20 0 0 1 45 25"
      stroke="hsl(42 100% 50%)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="25" cy="5" r="2.5" fill="hsl(42 100% 50%)" />
    <circle cx="45" cy="25" r="2.5" fill="hsl(42 100% 50% / 0.5)" />
    <circle cx="25" cy="25" r="3" fill="hsl(42 100% 50% / 0.2)" />
    <rect x="23.5" y="23.5" width="3" height="3" rx="0.5" fill="hsl(42 100% 50% / 0.6)" />
  </svg>
);

export default CircuitLoader;
