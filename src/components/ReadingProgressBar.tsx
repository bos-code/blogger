import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ReadingProgressBar(): React.ReactElement {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const updateProgress = (): void => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollProgress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-base-300">
      <motion.div
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}



