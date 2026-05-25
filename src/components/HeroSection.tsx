import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import FadingVideo from "./FadingVideo";
import DeletableText from "./DeletableText";
import { Trash2, Plus } from "lucide-react";

interface HeroSectionProps {
  onExploreClick: () => void;
  isEditMode: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  baseSize: number;
  angle: number;
  orbitRadius: number;
  speed: number;
}

const DEFAULT_PARTNERS = ["Aeon", "Vela", "Apex", "Orbit", "Zeno"];

export default function HeroSection({ onExploreClick, isEditMode }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, currentX: 0, currentY: 0 });

  const partnersLocalStorageKey = "ae_hero_partners_v3";
  const [partners, setPartners] = useState<string[]>(() => {
    const saved = localStorage.getItem(partnersLocalStorageKey);
    return saved ? JSON.parse(saved) : DEFAULT_PARTNERS;
  });

  // Save partners ONLY when commit save event is received
  useEffect(() => {
    const handleCommit = () => {
      localStorage.setItem(partnersLocalStorageKey, JSON.stringify(partners));
    };
    window.addEventListener("ae_commit_save", handleCommit);
    return () => {
      window.removeEventListener("ae_commit_save", handleCommit);
    };
  }, [partners]);

  // Dispatch an unsaved changes event if partners differ from persistent storage
  useEffect(() => {
    const saved = localStorage.getItem(partnersLocalStorageKey);
    let changed = false;
    if (saved) {
      if (JSON.stringify(partners) !== saved) {
        changed = true;
      }
    } else {
      if (JSON.stringify(partners) !== JSON.stringify(DEFAULT_PARTNERS)) {
        changed = true;
      }
    }
    if (changed) {
      window.dispatchEvent(new Event("ae_unsaved_change"));
    }
  }, [partners]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(partnersLocalStorageKey);
      setPartners(DEFAULT_PARTNERS);
    };
    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, []);

  const handleDeletePartner = (index: number) => {
    setPartners(prev => prev.filter((_, i) => i !== index));
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  const handleAddPartner = () => {
    const brandsList = ["Anker", "EcoFlow", "Bose", "Sony", "Dji", "Ecoflow", "Zendure", "Bluetti"];
    const randomName = `${brandsList[Math.floor(Math.random() * brandsList.length)]}_${Math.floor(Math.random() * 90) + 10}`;
    setPartners(prev => [...prev, randomName]);
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = ((e.clientY - rect.top) / height) * 2 - 1;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const stars: Star[] = [];
    const count = 120; // Starfield particles count
    const colorPresets = [
      "rgba(255, 255, 255, 0.85)",   
      "rgba(255, 107, 0, 0.75)",     // AeroCore orange accent
      "rgba(0, 229, 255, 0.65)"      // Cosmic cyan accent
    ];

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * Math.max(width, height) * 0.65 + 10;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 1,
        color: colorPresets[Math.floor(Math.random() * colorPresets.length)],
        size: Math.random() * 1.5 + 0.4,
        baseSize: Math.random() * 1.2 + 0.4,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: radius,
        speed: (Math.random() * 0.0008 + 0.0002) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const speedOffset = 0.05;
      mouseRef.current.currentX += (mouseRef.current.x - mouseRef.current.currentX) * speedOffset;
      mouseRef.current.currentY += (mouseRef.current.y - mouseRef.current.currentY) * speedOffset;

      const parallaxX = mouseRef.current.currentX * 30;
      const parallaxY = mouseRef.current.currentY * 30;

      const centerX = width / 2 + parallaxX;
      const centerY = height / 2 + parallaxY;

      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width * 0.5);
      gradient.addColorStop(0, "rgba(255, 107, 0, 0.03)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.angle += star.speed;
        const targetX = centerX + Math.cos(star.angle) * star.orbitRadius;
        const targetY = centerY + Math.sin(star.angle) * star.orbitRadius * 0.65;
        const waveOffset = Math.sin(star.angle * 3 + star.orbitRadius * 0.015) * 5;
        const finalX = targetX + waveOffset * (1 / star.z);
        const finalY = targetY + waveOffset * 0.5 * (1 / star.z);

        ctx.beginPath();
        ctx.arc(finalX, finalY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
        star.size = star.baseSize + Math.sin(star.angle * 6) * 0.25;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-center min-h-[720px] lg:min-h-[820px] select-none text-center px-4 overflow-hidden rounded-[2rem] border border-white/5 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] mb-8"
      id="hero-ambient-container"
    >
      {/* Background looping spaceflight video (120% scale, top-aligned) */}
      <div 
        className="absolute left-1/2 top-0 -translate-x-1/2 z-0 pointer-events-none"
        style={{ width: "120%", height: "120%" }}
      >
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Layer 2: Star Particle Canvas Hover Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Central typography, subtitle, and CTA button with absolute crisp layers */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-4xl mx-auto flex flex-col items-center pt-16 pb-12 px-4"
      >
        
        {/* Tech Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-8 shadow-sm">
          <span className="bg-[#FF6B00] text-black px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full tracking-wider uppercase">
            SOLVER_CORE v4.0
          </span>
          <span className="text-[11px] font-body tracking-wide text-white/95">
            <DeletableText id="hero_badge_txt" defaultText="Maiden Crewed Voyage to Mars Arrives 2026 // 顶尖航天级视觉智能重构引擎" isEditMode={isEditMode} className="text-white/90 text-[11.5px]" />
          </span>
        </div>

        {/* Master Heading */}
        <div className="max-w-3xl mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading font-normal italic text-white tracking-[-4px] leading-[0.8] justify-center text-center">
            <DeletableText 
              id="hero_heading_1" 
              defaultText="Designing High-Converting" 
              isEditMode={isEditMode} 
              className="text-5xl md:text-7xl lg:text-[4.8rem] font-heading font-normal italic text-white tracking-[-3px] leading-tight block" 
            />
            <DeletableText 
              id="hero_heading_2" 
              defaultText="Visuals for Amazon Brands." 
              isEditMode={isEditMode} 
              className="text-5xl md:text-7xl lg:text-[4.8rem] font-heading font-normal italic text-[#FF6B00] tracking-[-3px] leading-none block mt-1" 
            />
          </h1>
        </div>

        {/* Subtitle */}
        <div className="max-w-2xl text-xs sm:text-sm md:text-base text-white/90 font-body font-light leading-relaxed text-center mb-8">
          <DeletableText 
            id="hero_subtitle" 
            defaultText="结合 3D 渲染、AI 视觉生成与深度电商逻辑，助力头部品牌（如正浩风科技、3C数码、户外智能）提升 Listing 点击率（CTR）与转化率（CVR）。" 
            isEditMode={isEditMode} 
            className="text-xs sm:text-sm md:text-base text-white/90 font-body font-light max-w-2xl text-center leading-relaxed" 
            as="span"
          />
          <span className="block text-[10px] text-white/40 font-mono mt-3.5 uppercase tracking-widest leading-none">
            <DeletableText id="hero_footer_micro" defaultText="PRECISE METRICS // ABSOLUTE MINIMALIST COMPOSITION // HIGH-HERO DISASSEMBLY BLUEPRINTS" isEditMode={isEditMode} className="text-[10px] font-mono tracking-widest" />
          </span>
        </div>

        {/* Floating Glow CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
          {/* Primary liquid-glass-strong */}
          <button 
            type="button"
            onClick={onExploreClick}
            className="liquid-glass-strong rounded-full px-6 py-2.5 text-sm font-body font-medium text-white inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] cursor-pointer"
          >
            <span>
              <DeletableText id="hero_btn_1" defaultText="Explore Cases / 查看案例" isEditMode={isEditMode} className="text-white bg-transparent outline-none border-none font-medium text-xs font-mono" />
            </span>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </button>

          {/* Secondary Play bare text */}
          <button 
            type="button"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 text-sm font-body text-white hover:text-[#FF6B00] transition-colors cursor-pointer group"
          >
            <span>
              <DeletableText id="hero_btn_2" defaultText="Get in Touch / 在线咨询" isEditMode={isEditMode} className="text-white text-xs font-mono" />
            </span>
            <svg className="w-4 h-4 text-white fill-white group-hover:text-[#FF6B00] group-hover:fill-[#FF6B00] transition-colors" viewBox="0 0 24 24">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          </button>
        </div>

        {/* Dual Liquid-Glass Stats Cards */}
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          {/* Stat 1 */}
          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between min-h-[140px]">
            <div>
              <svg className="w-7 h-7 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="mt-4">
              <div className="font-heading italic text-3xl text-white tracking-[-1px] leading-none">
                <DeletableText id="hero_stat1_val" defaultText="34.5 Min" isEditMode={isEditMode} className="font-heading italic text-3xl text-white" />
              </div>
               <span className="text-[11px] text-white/50 font-body font-light mt-1.5 leading-tight block">
                <DeletableText id="hero_stat1_lbl" defaultText="Average Videos Watch Time / 详情页平均超级留存时长" isEditMode={isEditMode} className="text-[11px] text-white/50" />
              </span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between min-h-[140px]">
            <div>
              <svg className="w-7 h-7 text-[#FF6B00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12,2 a15,3 0 0,0 0,20 a15,3 0 0,0 0,-20" />
                <path d="M2,12 a15,3 0 0,0 20,0 a15,3 0 0,0 -20,0" />
              </svg>
            </div>
            <div className="mt-4">
              <div className="font-heading italic text-3xl text-white tracking-[-1px] leading-none">
                <DeletableText id="hero_stat2_val" defaultText="2.8B+" isEditMode={isEditMode} className="font-heading italic text-3xl text-white" />
              </div>
              <span className="text-[11px] text-white/50 font-body font-light mt-1.5 leading-tight block">
                <DeletableText id="hero_stat2_lbl" defaultText="Users Across the Globe / 跨出海国家覆盖主流消费群体" isEditMode={isEditMode} className="text-[11px] text-white/50" />
              </span>
            </div>
          </div>
        </div>

        {/* Partners section / Brand Trust Bar */}
        <div className="flex flex-col items-center gap-4 mt-16 pt-8 border-t border-white/5 w-full">
          <span className="liquid-glass rounded-full px-3.5 py-1 text-[11px] font-body text-white/80 whitespace-nowrap">
            <DeletableText id="hero_partners_label" defaultText="Collaborating with top aerospace pioneers globally / 与全球顶尖智能硬件及出海先锋协同协作" isEditMode={isEditMode} className="text-[11] font-body text-white/80 whitespace-nowrap" />
          </span>
          
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 mt-2">
            {partners.map((p, i) => (
              <span key={i} className="font-heading italic text-white text-2xl md:text-3xl tracking-tight transition-colors relative group/sponsor flex items-center gap-1.5">
                <DeletableText id={`partner_name_${i}`} defaultText={p} isEditMode={isEditMode} className="font-heading italic text-white text-2xl md:text-3xl tracking-tight hover:text-[#FF6B00] transition-colors" />
                
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(i)}
                    className="bg-red-600/90 hover:bg-red-500 text-white p-0.5 rounded-full shadow cursor-pointer opacity-0 group-hover/sponsor:opacity-100 transition-opacity"
                    style={{ width: "14px", height: "14px", marginLeft: "2px" }}
                    title="Delete partner logo / 删除此背书品牌"
                  >
                    <Trash2 style={{ width: "9px", height: "9px" }} />
                  </button>
                )}
              </span>
            ))}

            {/* Add Brand Logo Sponsor button */}
            {isEditMode && (
              <button
                type="button"
                onClick={handleAddPartner}
                className="bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[10px] uppercase font-mono px-2.5 py-1 rounded cursor-pointer flex items-center gap-1 hover:text-[#FF6B00] transition-all"
                title="Add brand sponsor / 增加背书品牌"
              >
                <Plus className="w-3 h-3 text-[#FF6B00]" />
                <span>Add Sponsor Logo</span>
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
