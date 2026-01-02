import { motion } from "framer-motion";

export interface PremiumSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "neutral";
  className?: string;
  text?: string;
  fullScreen?: boolean;
  showParticles?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

const variantColors = {
  primary: {
    main: "text-primary",
    glow: "text-primary/50",
    bg: "bg-primary/10",
  },
  secondary: {
    main: "text-secondary",
    glow: "text-secondary/50",
    bg: "bg-secondary/10",
  },
  accent: {
    main: "text-accent",
    glow: "text-accent/50",
    bg: "bg-accent/10",
  },
  neutral: {
    main: "text-base-content",
    glow: "text-base-content/50",
    bg: "bg-base-content/10",
  },
};

/**
 * Premium Spinner Component
 * A sophisticated loading spinner with multiple animation layers
 * Perfectly matches the project's design aesthetic
 */
export default function PremiumSpinner({
  size = "md",
  variant = "primary",
  className,
  text,
  fullScreen = false,
  showParticles = true,
}: PremiumSpinnerProps): React.ReactElement {
  const sizeClass = sizeClasses[size];
  const colors = variantColors[variant];

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className || ""}`}>
      {/* Main Spinner Container */}
      <div className={`relative ${sizeClass}`}>
        {/* Outer Glow Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border-4 ${colors.glow} border-t-transparent`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ filter: "blur(2px)" }}
        />

        {/* Main Rotating Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border-4 ${colors.main} border-t-transparent`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner Counter-Rotating Ring */}
        <motion.div
          className={`absolute inset-2 rounded-full border-3 ${colors.main} border-r-transparent opacity-60`}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center Pulsing Dot */}
        <motion.div
          className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${colors.bg}`}
          style={{ width: "30%", height: "30%" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className={`w-full h-full rounded-full ${colors.main} opacity-50`} />
        </motion.div>

        {/* Orbiting Particles */}
        {showParticles && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${colors.main} opacity-40`}
                style={{
                  width: "12%",
                  height: "12%",
                  top: "50%",
                  left: "50%",
                  transformOrigin: `0 ${size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px"} 0`,
                }}
                animate={{
                  rotate: 360,
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Optional Text with Fade Animation */}
      {text && (
        <motion.p
          className={`text-sm font-medium ${colors.main} tracking-wide`}
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/90 backdrop-blur-md"
      >
        {spinnerContent}
      </motion.div>
    );
  }

  return spinnerContent;
}

/**
 * Compact Premium Spinner - Minimal version for inline use
 */
export function CompactSpinner({
  size = "sm",
  variant = "primary",
  className,
}: Omit<PremiumSpinnerProps, "text" | "fullScreen" | "showParticles">): React.ReactElement {
  const sizeClass = sizeClasses[size];
  const colors = variantColors[variant];

  return (
    <div className={`inline-flex items-center justify-center ${className || ""}`}>
      <div className={`relative ${sizeClass}`}>
        <motion.div
          className={`absolute inset-0 rounded-full border-2 ${colors.main} border-t-transparent`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${colors.main}`}
          style={{ width: "25%", height: "25%" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}


