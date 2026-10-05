import { useEffect, useRef, useState } from "react";

const canUseOrb = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Decorative cursor follower for mouse users. */
const MouseOrb = (): React.ReactElement | null => {
  const orbRef = useRef<HTMLDivElement | null>(null);
  const [enabled] = useState(canUseOrb);

  useEffect(() => {
    const orb = orbRef.current;
    if (!enabled || !orb) return;

    const mouse = { x: -100, y: -100 };
    const position = { x: -100, y: -100 };
    let frame = 0;
    let visible = false;
    let scale = 1;

    const animate = () => {
      position.x += (mouse.x - position.x) * 0.25;
      position.y += (mouse.y - position.y) * 0.25;
      orb.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`;
      scale += (1 - scale) * 0.2;
      frame = requestAnimationFrame(animate);
    };

    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if (!visible) {
        visible = true;
        position.x = mouse.x;
        position.y = mouse.y;
        orb.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      orb.style.opacity = "0";
    };
    const onClick = () => {
      scale = 1.6;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick);
    frame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={orbRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[1000] -ml-[9px] -mt-[9px] h-[18px] w-[18px] rounded-full bg-[#ccc] opacity-0 mix-blend-difference transition-opacity duration-200"
      style={{ willChange: "transform" }}
    />
  );
};

export default MouseOrb;
