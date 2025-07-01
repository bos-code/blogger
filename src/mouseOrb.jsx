import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MouseOrb = () => {
  const orbRef = useRef(null);
  const trailRefs = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  // Add trails (ghosts)
  const TRAIL_COUNT = 6;

  useEffect(() => {
    const updateMouse = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const animate = () => {
      position.current.x += (mouse.current.x - position.current.x) * 0.1;
      position.current.y += (mouse.current.y - position.current.y) * 0.1;

      if (orbRef.current) {
        gsap.set(orbRef.current, {
          x: position.current.x,
          y: position.current.y,
        });
      }

      // Update trail positions with staggered delay
      trailRefs.current.forEach((ref, i) => {
        if (ref) {
          const delay = (i + 1) * 0.05;
          gsap.to(ref, {
            x: position.current.x,
            y: position.current.y,
            opacity: 1 - i / TRAIL_COUNT,
            duration: 0.3 + delay,
            ease: 'power1.out',
          });
        }
      });

      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      // Ripple effect
      const ripple = document.createElement('div');
      Object.assign(ripple.style, {
        position: 'fixed',
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        mixBlendMode: 'difference',
      });
      document.body.appendChild(ripple);
      gsap.to(ripple, {
        scale: 10,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });

      // Pulse/scale effect
      if (orbRef.current) {
        gsap.fromTo(
          orbRef.current,
          { scale: 1 },
          {
            scale: 1.5,
            duration: 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          }
        );
      }
    };

    document.addEventListener('mousemove', updateMouse);
    document.addEventListener('click', handleClick);
    animate();

    return () => {
      document.removeEventListener('mousemove', updateMouse);
      document.removeEventListener('click', handleClick);
    };
  }, []);


  return (
    <>
      <div
        ref={orbRef}
        style={{
          position: 'fixed',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ccc',
          pointerEvents: 'none',
          zIndex: 1000,
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
        }}
      />
   
    </>
  );
};

export default MouseOrb;