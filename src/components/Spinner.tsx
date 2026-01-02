import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "neutral" | "success" | "error" | "warning";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const variantClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  neutral: "text-base-content",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
};

export default function Spinner({
  size = "md",
  variant = "primary",
  className,
  text,
  fullScreen = false,
}: SpinnerProps): React.ReactElement {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];

  const spinnerContent = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Modern Pulsing Ring Spinner */}
      <div className={cn("relative", sizeClass)}>
        {/* Outer rotating ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent",
            variantClass,
            "border-t-current"
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Inner pulsing ring */}
        <motion.div
          className={cn(
            "absolute inset-2 rounded-full border-2 border-transparent",
            variantClass,
            "border-r-current"
          )}
          animate={{ rotate: -360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Center dot */}
        <motion.div
          className={cn(
            "absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            variantClass,
            "bg-current"
          )}
          style={{ width: "20%", height: "20%" }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Optional text */}
      {text && (
        <motion.p
          className={cn("text-sm font-medium", variantClass)}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

// Alternative spinner variant - Dots
export function SpinnerDots({
  size = "md",
  variant = "primary",
  className,
  text,
}: Omit<SpinnerProps, "fullScreen">): React.ReactElement {
  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  }[size];

  const variantClass = variantClasses[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full", dotSize, "bg-current", variantClass)}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-sm font-medium", variantClass)}>{text}</p>
      )}
    </div>
  );
}

// Alternative spinner variant - Bars
export function SpinnerBars({
  size = "md",
  variant = "primary",
  className,
  text,
}: Omit<SpinnerProps, "fullScreen">): React.ReactElement {
  const barSize = {
    sm: "w-1 h-4",
    md: "w-1.5 h-6",
    lg: "w-2 h-8",
    xl: "w-2.5 h-10",
  }[size];

  const variantClass = variantClasses[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full", barSize, "bg-current", variantClass)}
            animate={{
              height: ["25%", "100%", "25%"],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-sm font-medium", variantClass)}>{text}</p>
      )}
    </div>
  );
}

// Alternative spinner variant - Orbit
export function SpinnerOrbit({
  size = "md",
  variant = "primary",
  className,
  text,
}: Omit<SpinnerProps, "fullScreen">): React.ReactElement {
  const orbitSize = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }[size];

  const variantClass = variantClasses[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative", orbitSize)}>
        {/* Center circle */}
        <div
          className={cn(
            "absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            variantClass,
            "bg-current"
          )}
          style={{ width: "30%", height: "30%" }}
        />
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full",
              variantClass,
              "bg-current"
            )}
            style={{
              width: "20%",
              height: "20%",
              top: "50%",
              left: "50%",
            }}
            animate={{
              rotate: 360,
              x: ["-50%", "-50%"],
              y: ["-50%", "-50%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
            style={{
              transformOrigin: `0 ${orbitSize.replace("w-", "").replace("h-", "")} 0`,
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-sm font-medium", variantClass)}>{text}</p>
      )}
    </div>
  );
}



