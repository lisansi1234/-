import React, { useState, useEffect } from "react";
import FadingVideo from "./FadingVideo";
import DeletableText from "./DeletableText";
import { Trash2, Plus } from "lucide-react";
import persistedDefaults from "../data/persisted_defaults.json";

interface CapabilityItem {
  id: string;
  title: string;
  description: string;
  iconPath: string;
  tags: string[];
}

const DEFAULT_CAPABILITIES: CapabilityItem[] = [
  {
    id: "cap-1",
    title: "AI Scenery",
    description: "AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.",
    iconPath: "M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z",
    tags: ["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"]
  },
  {
    id: "cap-2",
    title: "Batch Production",
    description: "Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.",
    iconPath: "M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z",
    tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"]
  },
  {
    id: "cap-3",
    title: "Smart Lighting",
    description: "Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.",
    iconPath: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z",
    tags: ["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"]
  }
];

interface CapabilitiesSectionProps {
  isEditMode: boolean;
}

export default function CapabilitiesSection({ isEditMode }: CapabilitiesSectionProps) {
  const localStorageKey = "ae_caps_list_v3";
  
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) return JSON.parse(saved);
    const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[localStorageKey];
    if (persisted) return typeof persisted === "string" ? JSON.parse(persisted) : persisted;
    return DEFAULT_CAPABILITIES;
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(capabilities));
  }, [capabilities]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(localStorageKey);
      setCapabilities(DEFAULT_CAPABILITIES);
    };
    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, []);

  const handleDeleteCard = (cardId: string) => {
    setCapabilities(prev => prev.filter(item => item.id !== cardId));
  };

  const handleAddCard = () => {
    const newId = `cap-${Date.now()}`;
    const newCard: CapabilityItem = {
      id: newId,
      title: "New Custom Capability / 自定义新增赋能功能",
      description: "Describe your high-end design capabilities, material workflow details or e-commerce performance parameters here.",
      iconPath: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z",
      tags: ["High Converting", "3D CGI Render", "Custom Premium"]
    };
    setCapabilities(prev => [...prev, newCard]);
  };

  return (
    <div className="relative min-h-screen bg-black rounded-3xl overflow-hidden border border-white/5 my-10 select-none">
      {/* Background looping video with our FadingVideo behavior */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Foreground contents */}
      <div className="relative z-10 px-6 md:px-16 lg:px-20 pt-24 pb-16 flex flex-col justify-between min-h-screen">
        
        {/* Header */}
        <div className="mb-auto text-left">
          <span className="text-sm font-body text-white/80 mb-4 block tracking-[0.25em] font-mono font-medium">
            <DeletableText id="caps_overtitle" defaultText="// CAPABILITIES / 顶奢视觉智能赋能舱" isEditMode={isEditMode} className="text-white/80 font-mono tracking-[0.25em]" />
          </span>
          <h2 className="font-heading italic text-white text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-[-3px]">
            <DeletableText id="caps_maintitle_1" defaultText="Production" isEditMode={isEditMode} className="font-heading italic text-white leading-none block" />
            <DeletableText id="caps_maintitle_2" defaultText="evolved" isEditMode={isEditMode} className="font-heading italic text-[#FF6B00] leading-none block" />
          </h2>
        </div>

        {/* Three Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {capabilities.map((item, index) => (
            <div 
              key={item.id}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 relative group/cap-card"
            >
              {/* Delete Button (visible in edit mode) */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleDeleteCard(item.id)}
                  className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-all z-20 cursor-pointer flex items-center justify-center"
                  title="Delete this capability / 删除此能力卡片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                {/* Nested liquid-glass square */}
                <div className="w-11 h-11 bg-white/5 shadow-inner border border-white/10 rounded-[0.75rem] flex items-center justify-center text-white shrink-0">
                  <svg 
                    className="w-6 h-6 currentColor" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d={item.iconPath} />
                  </svg>
                </div>

                {/* Right tag pills */}
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {item.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 text-[10px] text-white/80 font-body font-light whitespace-nowrap"
                    >
                      <DeletableText 
                        id={`cap_tag_${item.id}_${tagIndex}`} 
                        defaultText={tag} 
                        isEditMode={isEditMode} 
                        className="text-[10px] text-white/80 font-body font-light" 
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-8 text-left">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">
                  <DeletableText 
                    id={`cap_title_${item.id}`} 
                    defaultText={item.title} 
                    isEditMode={isEditMode} 
                    className="font-heading italic text-white" 
                  />
                </h3>
                <div className="text-sm text-white/80 font-body font-light leading-snug max-w-[32ch]">
                  <DeletableText 
                    id={`cap_desc_${item.id}`} 
                    defaultText={item.description} 
                    isEditMode={isEditMode} 
                    className="text-sm text-white/80 font-body font-light" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Capability Card (visible in edit mode) */}
        {isEditMode && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleAddCard}
              className="bg-white hover:bg-[#FF6B00] text-black font-semibold text-xs py-3 px-6 rounded-full flex items-center gap-2 cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-mono"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>ADD CAPABILITY CARD / 增加出海赋能卡片</span>
            </button>
          </div>
        )}

      </div>

      {/* Bottom border status tracker */}
      <div className="absolute bottom-4 left-6 right-6 flex justify-between font-mono text-[9px] text-white/35 z-10">
        <div>
          <span>AERO_LOG: CAPABILITIES_SYNCED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 to-full h-1 bg-green-400 rounded-full animate-pulse"></span>
          <span>CAPSULE LANDER ONLINE</span>
        </div>
      </div>
    </div>
  );
}
