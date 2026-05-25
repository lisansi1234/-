import React, { useEffect, useRef } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function FadingVideo({ src, className, style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  const fadeTo = (targetOpacity: number, duration: number) => {
    const video = videoRef.current;
    if (!video) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Read current opacity or default to 0
    const currentOpacityStr = video.style.opacity;
    const startOpacity = currentOpacityStr === "" ? 0 : parseFloat(currentOpacityStr);
    const startTime = performance.now();

    const animateFade = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Interpolate opacity
      const opacity = startOpacity + (targetOpacity - startOpacity) * progress;
      video.style.opacity = opacity.toString();

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animateFade);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animateFade);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initial state
    video.style.opacity = "0";
    fadingOutRef.current = false;

    const handleLoadedData = () => {
      if (!video) return;
      video.style.opacity = "0";
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Auto-play prevented by browser:", err);
        });
      }
      fadeTo(1, 500);
    };

    const handleTimeUpdate = () => {
      if (!video) return;
      const duration = video.duration;
      const currentTime = video.currentTime;
      if (isNaN(duration) || isNaN(currentTime) || duration === 0) return;

      const leadTime = 0.55; // FADE_OUT_LEAD = 0.55s
      if (!fadingOutRef.current && (duration - currentTime <= leadTime) && (duration - currentTime > 0)) {
        fadingOutRef.current = true;
        fadeTo(0, 500); // FADE_MS = 500
      }
    };

    const handleEnded = () => {
      if (!video) return;
      video.style.opacity = "0";
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log(err));
        }
        fadingOutRef.current = false;
        fadeTo(1, 500);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // If video is already loaded or playing
    if (video.readyState >= 2) {
      handleLoadedData();
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (video) {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style }}
      muted
      playsInline
      preload="auto"
    />
  );
}
