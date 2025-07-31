import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const MouseOrb = () => {
  const orbRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateMouse = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const animate = () => {
      position.current.x += (mouse.current.x - position.current.x) * 0.25;
      position.current.y += (mouse.current.y - position.current.y) * 0.25;

      if (orbRef.current) {
        gsap.set(orbRef.current, {
          x: position.current.x,
          y: position.current.y,
        });
      }

      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      const ripple = document.createElement("div");
      Object.assign(ripple.style, {
        position: "fixed",
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.2)",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        zIndex: 999,
        mixBlendMode: "difference",
      });

      document.body.appendChild(ripple);

      gsap.to(ripple, {
        scale: 10,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      });

      // Optional orb pulse
      if (orbRef.current) {
        gsap.fromTo(
          orbRef.current,
          { scale: 1 },
          {
            scale: 1.5,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          }
        );
      }
    };

    document.addEventListener("mousemove", updateMouse);
    document.addEventListener("click", handleClick);
    animate();

    return () => {
      document.removeEventListener("mousemove", updateMouse);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#ccc",
        pointerEvents: "none",
        zIndex: 1000,
        position: "absolute",
        willChange: "transform",
        mixBlendMode: "difference",
      }}
    />
  );
};

export default MouseOrb;
