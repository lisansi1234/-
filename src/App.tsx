import { useState, useEffect, FormEvent } from "react";
import { 
  Cpu, 
  Layers, 
  Activity, 
  Menu, 
  X,
  Sliders,
  RefreshCw,
  Eye,
  Settings,
  Lock,
  Unlock,
  ShieldAlert
} from "lucide-react";
import WorksSection from "./components/WorksSection";
import AboutSection from "./components/AboutSection";
import HeroSection from "./components/HeroSection";
import CapabilitiesSection from "./components/CapabilitiesSection";
import { DesignBrief } from "./types";
import DeletableText from "./components/DeletableText";
import DeletableWrapper from "./components/DeletableWrapper";
import persistedDefaults from "./data/persisted_defaults.json";
import { setGlobalDynamicDefaults } from "./components/AnkerBlueListingSystem";

interface SiteBlock {
  id: string;
  label: string;
  badge: string;
}

const SITE_BLOCKS: SiteBlock[] = [
  { id: "hero", label: "首屏品牌引流与3D星云 / Hero Section", badge: "3D Hero" },
  { id: "capabilities", label: "顶奢出海视觉赋能舱卡 / Capabilities Grid", badge: "Capabilities" },
  { id: "works_banner", label: "作品首要极极奢磨砂 Banner / Highlight Banner", badge: "Spotlight Banner" },
  { id: "works_showcase", label: "主力实战大师经典案例 / Case Studies Database", badge: "Case Showcase" },
  { id: "works_sandbox", label: "3D 精密零部件拆解室 / 3D Exploded Engine", badge: "3D Exploder" },
  { id: "works_aplus", label: "亚马逊定制 A+ 版式对比分析 / Amazon A+ Listing", badge: "A+ Lab" },
  { id: "about_bio", label: "主设计师履历与自主诊断系统 / Profile & Diagnosis", badge: "Bio Dossier" },
  { id: "about_sitemap", label: "技术全站拓扑导航拓扑 Site Map / Technical Site Map", badge: "Site Map" },
  { id: "about_stack", label: "推荐跨境大牌高性能开发底层 / Recommended Architecture", badge: "Tech Stack" }
];

const DEFAULT_VISIBLE_SECTIONS = [
  "hero", 
  "capabilities", 
  "works_banner", 
  "works_showcase", 
  "works_sandbox", 
  "works_aplus", 
  "about_bio", 
  "about_sitemap", 
  "about_stack"
];

interface AccentColor {
  id: string;
  name: string;
  hex: string;
  primaryClass: string;
  hoverBgClass: string;
  bgClass: string;
  bgLowOpacity: string;
  borderClass: string;
  borderLowOpacity: string;
  gradientClass: string;
  pingBg: string;
  textLight: string;
  textDark: string;
  shadowClass: string;
}

const ACCENT_PRESETS: Record<string, AccentColor> = {
  blue: {
    id: "blue",
    name: "安克科技蓝 (Anker Blue)",
    hex: "#0066ff",
    primaryClass: "text-[#0066ff]",
    hoverBgClass: "hover:bg-[#0066ff]/20",
    bgClass: "bg-[#0066ff]",
    bgLowOpacity: "bg-[#0066ff]/10",
    borderClass: "border-[#0066ff]",
    borderLowOpacity: "border-[#0066ff]/20",
    gradientClass: "from-[#0066ff] to-[#00d2ff]",
    pingBg: "bg-[#0066ff]",
    textLight: "text-[#00d2ff]",
    textDark: "text-blue-500",
    shadowClass: "shadow-[0_0_15px_rgba(0,102,255,0.4)]"
  },
  orange: {
    id: "orange",
    name: "正浩极奢橙 (AeroCore Orange)",
    hex: "#FF6B00",
    primaryClass: "text-[#FF6B00]",
    hoverBgClass: "hover:bg-[#FF6B00]/20",
    bgClass: "bg-[#FF6B00]",
    bgLowOpacity: "bg-[#FF6B00]/10",
    borderClass: "border-[#FF6B00]",
    borderLowOpacity: "border-[#FF6B00]/20",
    gradientClass: "from-[#FF6B00] to-[#FF9E00]",
    pingBg: "bg-[#FF6B00]",
    textLight: "text-[#FF6B00]",
    textDark: "text-orange-500",
    shadowClass: "shadow-[0_0_15px_rgba(255,107,0,0.4)]"
  },
  teal: {
    id: "teal",
    name: "生态大牌绿 (EcoFlow Teal)",
    hex: "#00E5FF",
    primaryClass: "text-[#00E5FF]",
    hoverBgClass: "hover:bg-[#00E5FF]/20",
    bgClass: "bg-[#00E5FF]",
    bgLowOpacity: "bg-[#00E5FF]/10",
    borderClass: "border-[#00E5FF]",
    borderLowOpacity: "border-[#00E5FF]/20",
    gradientClass: "from-[#00E5FF] to-emerald-400",
    pingBg: "bg-[#00E5FF]",
    textLight: "text-[#00E5FF]",
    textDark: "text-teal-400",
    shadowClass: "shadow-[0_0_15px_rgba(0,229,255,0.4)]"
  },
  purple: {
    id: "purple",
    name: "智造未来紫 (Cyber Purple)",
    hex: "#9e33ff",
    primaryClass: "text-[#9e33ff]",
    hoverBgClass: "hover:bg-[#9e33ff]/20",
    bgClass: "bg-[#9e33ff]",
    bgLowOpacity: "bg-[#9e33ff]/10",
    borderClass: "border-[#9e33ff]",
    borderLowOpacity: "border-[#9e33ff]/20",
    gradientClass: "from-[#9e33ff] to-pink-500",
    pingBg: "bg-[#9e33ff]",
    textLight: "text-[#d946ef]",
    textDark: "text-purple-500",
    shadowClass: "shadow-[0_0_15px_rgba(158,51,255,0.4)]"
  }
};

export default function App() {
  // Theme Color customization defaults to Anker Blue for instant customer satisfaction!
  const [themeAccent, setThemeAccent] = useState<"blue" | "orange" | "teal" | "purple">(() => {
    const val = localStorage.getItem("ae_theme_accent") || (persistedDefaults?.localStorageDump as any)?.ae_theme_accent;
    return (val as any) || "blue";
  });

  const activeAccent = ACCENT_PRESETS[themeAccent] || ACCENT_PRESETS.blue;

  useEffect(() => {
    const handleAccentChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && ACCENT_PRESETS[customEvent.detail]) {
        setThemeAccent(customEvent.detail as any);
      }
    };
    window.addEventListener("ae_theme_accent_changed", handleAccentChange);
    return () => window.removeEventListener("ae_theme_accent_changed", handleAccentChange);
  }, []);
  
  // Navigation & Page routing tabs
  const [activeTab, setActiveTab] = useState("works");
  
  // Works sub-tab layout: showcase, sandbox, aplus
  const [worksSubTab, setWorksSubTab] = useState<"showcase" | "sandbox" | "aplus">("showcase");
  
  // Mobile drawer controls
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for Global Editor Admin Verification
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return localStorage.getItem("ae_admin_verified_v3") === "true";
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ae_is_edit_mode_active_v3");
    const verified = localStorage.getItem("ae_admin_verified_v3") === "true";
    return saved === "true" && verified;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Visual Protection warning trigger
  const [showProtectionToast, setShowProtectionToast] = useState<boolean>(false);

  const [visibleSections, setVisibleSections] = useState<string[]>(() => {
    const saved = localStorage.getItem("ae_visible_sections_v3");
    if (saved) return JSON.parse(saved);
    const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[ "ae_visible_sections_v3" ];
    if (persisted) return typeof persisted === "string" ? JSON.parse(persisted) : persisted;
    return DEFAULT_VISIBLE_SECTIONS;
  });

  // Load dynamic defaults from server-side JSON storage on mount and dispatch to all components
  useEffect(() => {
    fetch("/api/get-defaults")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.localStorageDump) {
          // Store globally so that components loading later can also read it instantly
          (window as any).__loadedDynamicDefaults = data;
          setGlobalDynamicDefaults(data);

          // Dispatch to fast-sync text, widgets, projects & image layers
          window.dispatchEvent(new CustomEvent("ae_dynamic_defaults_loaded", { detail: data }));

          // Update local App theme parameters safely
          const hasLocalSections = localStorage.getItem("ae_visible_sections_v3") !== null;
          if (!hasLocalSections) {
            const serverSections = (data.localStorageDump as any)?.["ae_visible_sections_v3"];
            if (serverSections) {
              const parsed = typeof serverSections === "string" ? JSON.parse(serverSections) : serverSections;
              setVisibleSections(parsed);
            }
          }

          const hasLocalAccent = localStorage.getItem("ae_theme_accent") !== null;
          if (!hasLocalAccent) {
            const serverAccent = (data.localStorageDump as any)?.ae_theme_accent;
            if (serverAccent && ACCENT_PRESETS[serverAccent]) {
              setThemeAccent(serverAccent as any);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("API dynamic defaults fetch bypassed or failed (expected if static):", err);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("ae_is_edit_mode_active_v3", String(isEditMode));
  }, [isEditMode]);

  // Automatic fadeout for original asset protection toast
  useEffect(() => {
    if (showProtectionToast) {
      const timer = setTimeout(() => {
        setShowProtectionToast(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showProtectionToast]);

  // Global image contextmenu and drag protection listeners
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.closest('img') || target.closest('SafeImage') || target.classList.contains('SafeImage'))) {
        e.preventDefault();
        setShowProtectionToast(true);
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (!isEditMode) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'IMG' || target.closest('img'))) {
          e.preventDefault();
          setShowProtectionToast(true);
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [isEditMode]);

  useEffect(() => {
    localStorage.setItem("ae_visible_sections_v3", JSON.stringify(visibleSections));
  }, [visibleSections]);

  // Unsaved changes tracker
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleUnsaved = () => setHasUnsavedChanges(true);
    window.addEventListener("ae_unsaved_change", handleUnsaved);
    return () => {
      window.removeEventListener("ae_unsaved_change", handleUnsaved);
    };
  }, []);

  const handleSaveChanges = () => {
    window.dispatchEvent(new Event("ae_commit_save"));
    setHasUnsavedChanges(false);
    
    // Dispatch save success event to trigger the beautiful toast
    window.dispatchEvent(new CustomEvent("ae_save_success", {
      detail: {
        title: "💾 整站修改保存成功 / All Changes Saved",
        desc: "成功将您对详情页自定义文案、A+悬浮参数、大底图、背书品牌赞助商及排版所做的全部定制，永久写入本地缓存中！即使刷新或重启浏览器，您的精彩创作也依然牢靠留存。"
      }
    }));
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const targetUser = usernameInput.trim();
    const targetPass = passwordInput;

    if (targetUser === "3062884352" && targetPass === "5201314Mm..") {
      localStorage.setItem("ae_admin_verified_v3", "true");
      setIsVerified(true);
      setIsEditMode(true);
      setShowLoginModal(false);
      setUsernameInput("");
      setPasswordInput("");
    } else {
      setLoginError("管理员账号或密码匹配错误，请重新输入！");
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("ae_admin_verified_v3");
    localStorage.removeItem("ae_is_edit_mode_active_v3");
    setIsVerified(false);
    setIsEditMode(false);
    setHasUnsavedChanges(true);
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      if (isVerified) {
        setIsEditMode(true);
      } else {
        setLoginError("");
        setShowLoginModal(true);
      }
    }
  };

  const toggleSection = (id: string) => {
    setVisibleSections(prev => {
      const next = prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id];
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleResetAll = () => {
    localStorage.clear();
    // Dispatch custom event to let all active state-driven children components clear their local storages
    window.dispatchEvent(new Event("ae_reset_all_custom"));
    setVisibleSections(DEFAULT_VISIBLE_SECTIONS);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    window.location.reload();
  };

  // State for AI Design generator input console
  const [productName, setProductName] = useState("AEROCORE DELTA-X PRO");
  const [designStyle, setDesignStyle] = useState("EcoFlow Hardcore Tech x Apple Minimalist");
  const [extraRequirements, setExtraRequirements] = useState("Add high-contrast copper-coiled details and custom active cooling grilles.");
  const [isLoading, setIsLoading] = useState(false);
  const [loaderLogs, setLoaderLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);

  // Active brief loaded on screen
  const [currentBrief, setCurrentBrief] = useState<DesignBrief | null>(null);

  // 3D Exploded disassembly controller state
  const [disassemblyFactor, setDisassemblyFactor] = useState(65); // 0 to 120 (spacing factor)
  const [hoveredLayerIndex, setHoveredLayerIndex] = useState<number | null>(null);

  // Amazon A+ Content toggle layout (Basic vs AeroCore Elite)
  const [aplusLayoutType, setAplusLayoutType] = useState<"basic" | "premium">("premium");

  // Interactive logs checklist to simulate high hardware calculation scanning
  const SCROLLING_LOGS = [
    "INITIATING CORE SPATIAL HARNESS GRID... / 正在启动三维空间抓取辅助格栅...",
    "MEASURING THERMAL CHASSIS RESISTANCE RATIOS... / 正在测算精密机体温控阻抗率...",
    "EXTRACTING APPLE-STYLE VACUUM WHITESPACE CONSTANTS... / 正在提炼苹果设计美学留白比率...",
    "SOLVING ECOFLOW HIGH-HARDWARE GEOMETRIC DYNAMIC CONSTRAINTS... / 正在解算EcoFlow硬核结构动力学排布...",
    "QUERYING GEMINI-3.5-FLASH FOR HIGH-CONVERTING BRAND SPECIFICATIONS... / 正在派遣Gemini智慧寻优高点击表现材料...",
    "SYNTHESIZING DESIGN BRIEF & 3D SYSTEM LAYER HEIGHT CODES... / 正在精密合成设计方案与三维拆卸透视码..."
  ];

  // Default initial brief (Power Station)
  const INITIAL_BRIEF: DesignBrief = {
    conceptName: "AEROCORE BLACK PRO",
    tagline: "Uncompromising Power, Sculpted in Dark Glass and Carbon Armor.",
    heroSpecification: "2400W Monolithic Rugged Power Terminal",
    stylingPhilosophy: "Matte anodized carbon casing layered with glowing battery cell conduits and a floating CNC-etched aluminum top handle. Designed to project sheer performance density and tactile engineering authority for premium e-commerce storefronts.",
    metrics: {
      ctrBoost: "+112% CTR Increase",
      conversionIncrease: "+34.2% Sales Conversion",
      impressionBoost: "4.8M Impressions"
    },
    explodedViews: [
      { zIndex: 1, title: "01 / ARMOR SHIELD CASING", description: "V-0 fire-retardant structural polycarbonate with dual active cooling vents and laser-scored matte carbon plating.", material: "Monolithic Cyber Polycarbonate", color: "#111111", highlightColor: "#FF6B00" },
      { zIndex: 2, title: "02 / INTEGRATED HEATSINK", description: "Dual-fin heavy thermal distribution fins paired with liquid vacuum copper conduction pipelines.", material: "CNC-milled 6061 Aluminum", color: "#333333", highlightColor: "#00E5FF" },
      { zIndex: 3, title: "03 / FLUID CELL CORES", description: "High-voltage lithium iron phosphate batteries lined up in secure, protective honeycomb columns.", material: "LFP High-Density Array", color: "#222222", highlightColor: "#FFB800" },
      { zIndex: 4, title: "04 / CORE CIRCUIT CONTROLLER", description: "Dual silicon monitor chipsets recording thermal metrics 200 times per cycle.", material: "Gold-Plated Solder PCB Layer", color: "#0B192C", highlightColor: "#10B981" }
    ],
    renderDirectives: [
      { phase: "A-ROLL / BACKLIT HALO", description: "Position high-contrast studio spot light directly at 135-degrees behind the chassis, crafting an orange rim outline reflecting off the matte composite surfaces.", hardwareTerm: "Backlit Halo Framing" },
      { phase: "B-ROLL / MACRO COMPRESSION", description: "Aim narrow 85mm lens focused strictly on circuit capacitors, staggering depth to let fine metal contacts capture gorgeous soft blur lens flares.", hardwareTerm: "Macro Depth Compressing" }
    ],
    brandNarrative: "Engineered for professional buyers who command robust visual proof. By putting the intricate structural layers of the battery pack directly in the Amazon hero listing, we answer safety doubts instantly while capturing technical prestige that justifies a premium price tier."
  };

  useEffect(() => {
    setCurrentBrief(INITIAL_BRIEF);
  }, []);

  // Handler to submit customization to "/api/gemini/generate-brief"
  const handleGenerateDesign = async (e: FormEvent) => {
    e.preventDefault();
    setLoaderLogs([]);
    setIsLoading(true);
    setCurrentBrief(null);

    // Stagger progress scanner terms
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < SCROLLING_LOGS.length) {
        setLoaderLogs(prev => [...prev, SCROLLING_LOGS[currentLog]]);
        setActiveLogIndex(currentLog);
        currentLog++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      const response = await fetch("/api/gemini/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          designStyle,
          extraRequirements
        })
      });

      const jsonResult = await response.json();
      
      setTimeout(() => {
        if (jsonResult.success && jsonResult.data) {
          setCurrentBrief(jsonResult.data);
        } else {
          setCurrentBrief(INITIAL_BRIEF);
        }
        setIsLoading(false);
        setActiveLogIndex(-1);
      }, SCROLLING_LOGS.length * 480);

    } catch (err) {
      console.error("Failed to generate design context:", err);
      setTimeout(() => {
        setCurrentBrief(INITIAL_BRIEF);
        setIsLoading(false);
        setActiveLogIndex(-1);
      }, SCROLLING_LOGS.length * 480);
    }
  };

  // Preset product select handler
  const loadPresetProduct = (presetKey: "power" | "earbuds" | "keyboard") => {
    if (presetKey === "power") {
      setProductName("AEROCORE DELTA-X PRO");
      setDesignStyle("EcoFlow Hardcore Tech x Apple Minimalist Casing");
      setExtraRequirements("Include external dual active cooling grids and high-voltage gold copper coils details.");
    } else if (presetKey === "earbuds") {
      setProductName("NEXUS SILENCE-9 PRO");
      setDesignStyle("Apple minimal acoustic casing with light translucent amber shell");
      setExtraRequirements("Show dynamic cross-section of diaphragm drivers and internal gold contact points layout.");
    } else if (presetKey === "keyboard") {
      setProductName("CYBERBOARD X-METALLIC");
      setDesignStyle("Cyberpunk futuristic CNC-Milled brass plating with green LED conduits");
      setExtraRequirements("Highlight key switch mechanics, gasket damping pads layer, and metallic board shine.");
    }
  };

  const handleScrollToWorks = () => {
    const el = document.getElementById("works-navigation-inner-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="aerocore-canvas" className="min-h-screen bg-[#07070a] text-white flex flex-col font-sans relative overflow-x-hidden antialiased">
      
      {/* Decorative High-Contrast Glow Orbs */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 duration-1000 transition-all"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${activeAccent.hex}, transparent)` }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-[#9e33ff]/5 to-transparent rounded-full blur-[140px] opacity-70"></div>
      </div>

      {/* Dynamic Global Action Control Bar */}
      <div className="bg-[#0b0c10] border-b border-white/10 px-6 py-3.5 relative z-40 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span 
            className="w-2.5 h-2.5 rounded-full animate-ping duration-1000 transition-all"
            style={{ backgroundColor: activeAccent.hex }}
          ></span>
          <div className="text-left">
            <span 
              className="text-[10px] uppercase font-mono tracking-widest font-bold block"
              style={{ color: activeAccent.hex }}
            >
              <DeletableText
                id="control_bar_title_v2"
                defaultText="AEROCORE GLOBAL EDITOR // 电商视觉设计师自研画册控制台"
                isEditMode={isEditMode}
              />
            </span>
            <div className="text-[9px] text-white/50 font-mono">
              <DeletableText
                id="control_bar_subtitle_v2"
                defaultText="[SYSTEM ACTIVE] Dual-click any text block to customize. Tap block deletes below or drag items dynamically."
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {/* --- 自由修改全站主色调 / Customize Theme Color --- */}
          {isEditMode && (
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2 py-1.5 rounded-xl shrink-0">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mr-1">🎨 自由定制全色调 / Theme:</span>
              <div className="flex items-center gap-1.5">
                {Object.values(ACCENT_PRESETS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setThemeAccent(p.id as any);
                      localStorage.setItem("ae_theme_accent", p.id);
                      window.dispatchEvent(new CustomEvent("ae_theme_accent_changed", { detail: p.id }));
                    }}
                    className="w-4.5 h-4.5 rounded-full border transition-all cursor-pointer relative group flex items-center justify-center p-0"
                    style={{ backgroundColor: p.hex, borderColor: themeAccent === p.id ? '#ffffff' : 'rgba(255,255,255,0.15)' }}
                    title={p.name}
                  >
                    {themeAccent === p.id && (
                      <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    )}
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all text-[8px] font-mono whitespace-nowrap bg-zinc-950 border border-white/10 px-1.5 py-0.5 rounded text-white z-[90]">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400 font-bold rounded-lg text-[9.5px] font-mono uppercase tracking-widest cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-pulse shrink-0"
              title="Commit and save all of your ongoing changes permanently"
            >
              <span>💾 保存最新修改 / Save Changes</span>
            </button>
          )}

          {/* Admin Logout button if verified */}
          {isVerified && (
            <button
              type="button"
              onClick={handleLogoutAdmin}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 rounded-lg text-[9.5px] font-mono uppercase tracking-widest cursor-pointer flex items-center gap-1.5 transition-all shrink-0"
              title="退出管理员编辑模式，锁定网页为只读 / Log out admin session"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>锁定只读 / Exit Edit</span>
            </button>
          )}

          {/* Mode Switch Button (Shrunk to a sleek round circle dot) */}
          <button
            type="button"
            onClick={handleToggleEditMode}
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border transition-all relative group shrink-0`}
            style={{ 
              backgroundColor: isEditMode ? activeAccent.hex : "rgba(255,255,255,0.05)",
              color: isEditMode ? "#000000" : "rgba(255,255,255,0.8)",
              borderColor: isEditMode ? activeAccent.hex : "rgba(255,255,255,0.15)",
              boxShadow: isEditMode ? `0 0 15px ${activeAccent.hex}66` : "none"
            }}
            title={isEditMode ? "编辑模式已开启 / 双击文字自定义 (Double click text to edit)" : "🛠️ 开启排版增删与微调模式 / Toggle Edit Mode"}
          >
            {isEditMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            
            {/* Elegant tool action hover tooltip */}
            <span className="absolute right-0 top-11 scale-0 group-hover:scale-100 transition-all origin-top-right whitespace-nowrap bg-zinc-950 border border-white/10 text-white font-mono font-bold text-[8.5px] py-1.5 px-3 rounded-lg shadow-xl z-[100] pointer-events-none tracking-widest leading-none">
              {isEditMode ? "● ACTIVE MODE: 正在编辑 / EDITING" : "🛠️ EDIT & DELETE: 开启排版微调与增删"}
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible Section Toggles Grid for perfect visual feedback */}
      {isEditMode && (
        <div className="bg-zinc-950 border-b border-white/5 px-6 py-4 relative z-30 animate-fade-in text-left">
          <div className="flex items-center gap-2 mb-2.5">
            <Settings className="w-4.5 h-4.5" style={{ color: activeAccent.hex }} />
            <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest font-bold">
              // STRUCTURE MAPPING / 精细控制各模块(层)的显示与隐藏 (可随意隐藏、删除或一键恢复):
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {SITE_BLOCKS.map((block) => {
              const isVisible = visibleSections.includes(block.id);
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => toggleSection(block.id)}
                  className={`p-2 rounded-lg border text-left text-[9px] font-mono transition-all cursor-pointer`}
                  style={{
                    backgroundColor: isVisible ? "var(--color-zinc-900)" : "rgba(0,0,0,0.4)",
                    borderColor: isVisible ? `${activeAccent.hex}66` : "rgba(255,255,255,0.05)",
                    color: isVisible ? "#ffffff" : "rgba(255,255,255,0.2)"
                  }}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{block.badge}</span>
                    <span 
                      className={`w-1.5 h-1.5 rounded-full transition-all`}
                      style={{ backgroundColor: isVisible ? activeAccent.hex : "rgba(255,255,255,0.1)" }}
                    ></span>
                  </div>
                  <p className="text-[8px] opacity-60 truncate mt-1 leading-none">{block.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Glassmorphic Tech Header */}
      <header className="sticky top-0 h-16 border-b border-white/5 backdrop-blur-md bg-zinc-950/70 z-30 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DeletableWrapper id="top_logo_icon_badge_v2" isEditMode={isEditMode} label="LOGO图标 / Logo Badge">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-black text-sm tracking-tighter font-mono transition-all duration-300"
              style={{ 
                backgroundImage: `linear-gradient(to bottom right, ${activeAccent.hex}, #ffffff88)`,
                boxShadow: `0 0 15px ${activeAccent.hex}66`
              }}
            >
              <DeletableText id="top_logo_letter" defaultText="A" isEditMode={isEditMode} className="text-black font-extrabold" />
            </div>
          </DeletableWrapper>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-medium text-xs tracking-[0.25em] uppercase opacity-90 block">
                <DeletableText id="top_logo_aerocore" defaultText="AEROCORE" isEditMode={isEditMode} className="text-white" />
              </span>
              <span 
                className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold border transition-all duration-300"
                style={{ 
                  backgroundColor: `${activeAccent.hex}1a`, 
                  color: activeAccent.hex, 
                  borderColor: `${activeAccent.hex}40`
                }}
              >
                <DeletableText id="top_logo_design" defaultText="DESIGN" isEditMode={isEditMode} />
              </span>
            </div>
            <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono hidden md:block">
              <DeletableText id="top_logo_subtitle" defaultText="Amazon E-Commerce Elite Design Portfolio / 亚马逊出海顶奢视觉重构" isEditMode={isEditMode} className="text-white/40" />
            </div>
          </div>
        </div>

        {/* Global Navigation - Desktop Style */}
        <nav className="hidden md:flex gap-6 lg:gap-10 text-[10px] uppercase tracking-[0.2em] font-medium text-white/50">
          <button 
            type="button"
            onClick={() => { setActiveTab("works"); setIsMobileMenuOpen(false); }} 
            className={`cursor-pointer hover:text-white transition-all py-1.5 border-b-2 hover:border-white/20`}
            style={{ 
              color: activeTab === "works" ? "#ffffff" : "rgba(255,255,255,0.5)", 
              borderColor: activeTab === "works" ? activeAccent.hex : "transparent",
              fontWeight: activeTab === "works" ? "bold" : "normal"
            }}
          >
            Works / 作品
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab("about"); setIsMobileMenuOpen(false); }} 
            className={`cursor-pointer hover:text-white transition-all py-1.5 border-b-2 hover:border-white/20`}
            style={{ 
              color: activeTab === "about" ? "#ffffff" : "rgba(255,255,255,0.5)", 
              borderColor: activeTab === "about" ? activeAccent.hex : "transparent",
              fontWeight: activeTab === "about" ? "bold" : "normal"
            }}
          >
            About / 关于我
          </button>
        </nav>

        {/* Global Regional Status Monitor (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/40 font-mono">
          <span 
            className="flex items-center gap-1.5 border rounded-full px-2.5 py-1 transition-all duration-300"
            style={{ 
              backgroundColor: `${activeAccent.hex}1a`, 
              color: activeAccent.hex, 
              borderColor: `${activeAccent.hex}33`
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeAccent.hex }}
            ></span>
            PIPELINE Connected / 创研设计航线已打通
          </span>
        </div>

        {/* Hamburger Menu Icon for Mobile screens */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Glassmorphic Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-black/95 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 animate-fade-in border-b border-white/5 h-[340px]">
          <div className="space-y-6 pt-4">
            <div className="relative">
              <span className="text-[9px] font-mono tracking-widest block mb-1" style={{ color: activeAccent.hex }}>NAVIGATION INDEX // 导航索引</span>
              <hr className="border-white/5" />
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setActiveTab("works"); setIsMobileMenuOpen(false); }}
                className="w-full py-4 px-4 border rounded-xl text-left text-sm uppercase tracking-wider font-semibold transition-all"
                style={{
                  color: activeTab === "works" ? "#ffffff" : "rgba(255,255,255,0.65)",
                  borderColor: activeTab === "works" ? activeAccent.hex : "rgba(255,255,255,0.05)",
                  backgroundColor: activeTab === "works" ? `${activeAccent.hex}15` : "rgba(255,255,255,0.05)"
                }}
              >
                💼 Works / 主力作品智造舱
              </button>
              <button 
                onClick={() => { setActiveTab("about"); setIsMobileMenuOpen(false); }}
                className="w-full py-4 px-4 border rounded-xl text-left text-sm uppercase tracking-wider font-semibold transition-all"
                style={{
                  color: activeTab === "about" ? "#ffffff" : "rgba(255,255,255,0.65)",
                  borderColor: activeTab === "about" ? activeAccent.hex : "rgba(255,255,255,0.05)",
                  backgroundColor: activeTab === "about" ? `${activeAccent.hex}15` : "rgba(255,255,255,0.05)"
                }}
              >
                ℹ️ About Me / 极客理念与蓝图
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>PORTFOLIO TERMINAL STATS</span>
            </div>
            <p className="text-[9px] text-white/40 font-mono">SYSTEM ACTIVE: v4.2 // REGION: GLOBAL BROADCAST</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {activeTab === "works" && (
          <>
            {visibleSections.includes("hero") ? (
              <div className="relative group/sec-wrap">
                {isEditMode && (
                  <div 
                    className="text-white text-[9.5px] font-mono px-3.5 py-1 flex items-center justify-between rounded-t-2xl border-t border-x transition-all duration-300"
                    style={{ backgroundColor: activeAccent.hex, borderColor: `${activeAccent.hex}4d` }}
                  >
                    <span className="font-bold">// SECTION BLOCK: 3D HERO ORASTAR (首屏星空星轨引流区域)</span>
                    <button 
                      onClick={() => toggleSection("hero")}
                      className="bg-black/40 hover:bg-red-600 px-2 py-0.5 rounded cursor-pointer text-white font-mono text-[8px]"
                    >
                      Delete Section / 隐藏大板块 ❌
                    </button>
                  </div>
                )}
                <HeroSection onExploreClick={handleScrollToWorks} isEditMode={isEditMode} />
              </div>
            ) : (
              isEditMode && (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20 mb-8 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-white/30 uppercase">[ 3D Hero Starfield is Hidden / 首屏引流与3D星云模块已被隐藏 ]</span>
                  <button
                    onClick={() => toggleSection("hero")}
                    className="mt-2 text-[9px] hover:underline font-mono"
                    style={{ color: activeAccent.hex }}
                  >
                    [ ➕ Bring 3D Hero Back / 恢复首屏模块 ]
                  </button>
                </div>
              )
            )}

            {visibleSections.includes("capabilities") ? (
              <div className="relative group/sec-wrap">
                {isEditMode && (
                  <div 
                    className="text-white text-[9.5px] font-mono px-3.5 py-1.5 flex items-center justify-between rounded-t-3xl border-t border-x transition-all duration-300"
                    style={{ backgroundColor: activeAccent.hex, borderColor: `${activeAccent.hex}4d` }}
                  >
                    <span className="font-bold">// SECTION BLOCK: TECHNICAL CAPABILITIES GRID (高带宽视觉智能赋能舱)</span>
                    <button 
                      onClick={() => toggleSection("capabilities")}
                      className="bg-black/40 hover:bg-red-600 px-2.5 py-0.5 rounded cursor-pointer text-white font-mono text-[8px]"
                    >
                      Delete Section / 隐藏大板块 ❌
                    </button>
                  </div>
                )}
                <CapabilitiesSection isEditMode={isEditMode} />
              </div>
            ) : (
              isEditMode && (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20 mb-8 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-white/30 uppercase">[ Capabilities Matrix is Hidden / 视觉赋能舱卡模块已被隐藏 ]</span>
                  <button
                    onClick={() => toggleSection("capabilities")}
                    className="mt-2 text-[9px] hover:underline font-mono"
                    style={{ color: activeAccent.hex }}
                  >
                    [ ➕ Bring Capabilities Back / 恢复赋能舱模块 ]
                  </button>
                </div>
              )
            )}

            {/* Works Section controls dynamic works_banner, works_showcase, works_sandbox, works_aplus inside */}
            <WorksSection
              worksSubTab={worksSubTab}
              setWorksSubTab={setWorksSubTab}
              productName={productName}
              setProductName={setProductName}
              designStyle={designStyle}
              setDesignStyle={setDesignStyle}
              extraRequirements={extraRequirements}
              setExtraRequirements={setExtraRequirements}
              isLoading={isLoading}
              loaderLogs={loaderLogs}
              activeLogIndex={activeLogIndex}
              currentBrief={currentBrief}
              disassemblyFactor={disassemblyFactor}
              setDisassemblyFactor={setDisassemblyFactor}
              hoveredLayerIndex={hoveredLayerIndex}
              setHoveredLayerIndex={setHoveredLayerIndex}
              aplusLayoutType={aplusLayoutType}
              setAplusLayoutType={setAplusLayoutType}
              handleGenerateDesign={handleGenerateDesign}
              loadPresetProduct={loadPresetProduct}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              isVerified={isVerified}
              onOpenLoginModal={() => setShowLoginModal(true)}
              visibleSections={visibleSections}
              toggleSection={toggleSection}
            />
          </>
        )}

        {activeTab === "about" && (
          <AboutSection 
            currentBrief={currentBrief} 
            isEditMode={isEditMode} 
            visibleSections={visibleSections}
            toggleSection={toggleSection}
          />
        )}
      </main>

      {/* Glassmorphic Footer */}
      <footer className="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-xl py-8 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 text-left w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1 font-mono font-bold">DESIGN COGNIZANCE / 视觉流派心智</span>
            <span className="text-[11px] text-[#FF6B00] font-mono uppercase tracking-wider">APPLE MINIMAL x ECOFLOW TECH</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1 font-mono font-bold">CLIENT AUDIENCE TIER / 殿堂尊享客群</span>
            <span className="text-[11px] text-white font-mono uppercase tracking-wider">AMAZON BRANDS & OPERATIONS LEADS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1 font-mono font-bold">DESIGN LAB STATUS / 设计室智造状态</span>
            <span className="text-[11px] text-white font-mono uppercase tracking-wider">ONLINE // READY FOR PIPELINE ACTIVE</span>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto justify-end">
          <div className="text-[10px] text-white/40 font-mono flex items-center gap-1">
            <span>DEVELOPED FOR / 专衔定制服务:</span>
            <strong className="text-white font-bold">AMAZON DESIGN ELITE 出海智造</strong>
          </div>
        </div>
      </footer>

      {/* Absolute floating bottom-right corner indicator bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold rounded-full shadow-[0_0_20px_rgba(16,185,129,0.55)] border border-emerald-400 hover:scale-105 hover:from-emerald-400 hover:to-teal-400 font-mono text-xs select-none cursor-pointer duration-200"
          >
            <span className="w-2 h-2 rounded-full bg-black animate-ping shrink-0"></span>
            <span>💾 检测到未保存的更改 - 点击保存 / Save Changes</span>
          </button>
        </div>
      )}

      {/* Admin Login Modal Dialogue */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#020205]/95 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
          <div className="bg-[#0b0c12] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative space-y-6">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              title="Close Panel // 关闭面板"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00] mb-2 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                CONSOLE AUTHENTICATION / 控制台登录
              </h3>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-xs">
                输入管理员账号和密码方可激活全站大版式增删与标签文本、海报微调模式。
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                  Admin Account // 管理员账号:
                </label>
                <input
                  type="text"
                  required
                  placeholder="请输入管理员账号"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#FF6B00]/55 transition-all font-mono"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                  Secret Password // 管理员密码:
                </label>
                <input
                  type="password"
                  required
                  placeholder="请输入密匙密码"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#FF6B00]/55 transition-all font-mono"
                />
              </div>

              {loginError && (
                <div className="text-[9px] font-mono text-rose-450 bg-rose-950/20 border border-rose-950/45 p-2 rounded-lg text-left leading-normal">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF6B00] hover:bg-orange-500 text-black font-extrabold rounded-lg text-xs font-mono uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(255,107,0,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>立即登录验证 / AUTHENTICATE</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Image Protection Floating Warning */}
      {showProtectionToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-[#07090e]/95 border border-[#FF6B00]/30 p-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] max-w-sm flex items-center gap-3.5 backdrop-blur-xl">
          <div className="min-w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-left font-sans select-none">
            <h4 className="text-[10px] uppercase font-mono font-black text-white tracking-widest leading-none">
              COPYRIGHT PROTECTED // 商业素材版权保护
            </h4>
            <p className="text-[9.5px] text-zinc-400 mt-1 leading-normal font-medium">
              本站视觉方案、渲染底图、A+板式均由 AEROCORE 独家渲染授权，受整站图片防保存及防拖拽保护。
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
