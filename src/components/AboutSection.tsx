import { useState, FormEvent, useEffect } from "react";
import { Cpu, TrendingUp, CheckCircle, Trash2, Plus } from "lucide-react";
import { TECHNICAL_SITE_MAP } from "../data";
import { DesignBrief, SiteMapNode } from "../types";
import DeletableText from "./DeletableText";
import persistedDefaults from "../data/persisted_defaults.json";

interface AboutSectionProps {
  currentBrief: DesignBrief | null;
  isEditMode: boolean;
  visibleSections?: string[];
  toggleSection?: (id: string) => void;
}

interface TechStackItem {
  id: string;
  name: string;
  reason: string;
}

const DEFAULT_TECH_STACKS: TechStackItem[] = [
  { id: "stack-1", name: "React / Next.js", reason: "Static pre-rendering for sub-second FCP loading, crucial for SEO ranking parameters on elite storefront platforms. / 【极致性能】静态及服务端首屏渲染，缩短页面到首绘的物理开销，对于全球搜索引擎自然引流与高速购买至关重要。" },
  { id: "stack-2", name: "Tailwind CSS v4", reason: "Utility-first constraints ensuring tiny style footprint payloads and responsive precision across all mobile viewports. / 【轻盈版式】实用程序优先的极致轻量级框架，杜绝冗余样式包载，且可在移动和宽显示器间享有毫厘不差的栅格精配。" },
  { id: "stack-3", name: "Framer Motion", reason: "Bespoke physics-driven state transitions, stagger delays, dynamic drag controllers, and seamless route interpolations. / 【骨骼动画】量身定制的三维弹簧物理缓动计算，提供流式淡入、滑动多维拖拽以及无感平滑状态突变。" },
  { id: "stack-4", name: "Three.js / WebGL", reason: "Enabling high-FPS fluid product disassemblies, metallic reflectivity shaders, and interactive material zoom buffers. / 【3D感官】实现极速高帧的3D零部件爆发拆解、各向异性金属反射着色器以及超强宏观放大材质无损缩放。" }
];

export default function AboutSection({ 
  currentBrief, 
  isEditMode,
  visibleSections = ["about_bio", "about_sitemap", "about_stack"],
  toggleSection = () => {}
}: AboutSectionProps) {
  // Local state for the consultation form
  const [brandName, setBrandName] = useState("");
  const [targetAudience, setTargetAudience] = useState("Amazon USA Tier-1 Brands");
  const [budgetRange, setBudgetRange] = useState("Premium Level (1-3k USD)");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any | null>(null);

  // Dynamic Site Map list state
  const sitemapLocalStorageKey = "ae_sitemap_list_v3";
  const [siteMapNodes, setSiteMapNodes] = useState<SiteMapNode[]>(() => {
    try {
      const saved = localStorage.getItem(sitemapLocalStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed parsing saved siteMapNodes", e);
    }
    try {
      const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[sitemapLocalStorageKey];
      if (persisted) return typeof persisted === "string" ? JSON.parse(persisted) : persisted;
    } catch (e) {
      console.warn("Failed parsing persisted siteMapNodes", e);
    }
    return TECHNICAL_SITE_MAP;
  });

  // Dynamic Tech Stack list state
  const techStackLocalStorageKey = "ae_techstack_list_v3";
  const [techStacks, setTechStacks] = useState<TechStackItem[]>(() => {
    try {
      const saved = localStorage.getItem(techStackLocalStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed parsing saved techStacks", e);
    }
    try {
      const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[techStackLocalStorageKey];
      if (persisted) return typeof persisted === "string" ? JSON.parse(persisted) : persisted;
    } catch (e) {
      console.warn("Failed parsing persisted techStacks", e);
    }
    return DEFAULT_TECH_STACKS;
  });

  useEffect(() => {
    localStorage.setItem(sitemapLocalStorageKey, JSON.stringify(siteMapNodes));
  }, [siteMapNodes]);

  useEffect(() => {
    localStorage.setItem(techStackLocalStorageKey, JSON.stringify(techStacks));
  }, [techStacks]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(sitemapLocalStorageKey);
      localStorage.removeItem(techStackLocalStorageKey);
      setSiteMapNodes(TECHNICAL_SITE_MAP);
      setTechStacks(DEFAULT_TECH_STACKS);
    };
    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, []);

  // Synchronize state dynamically when the live server defaults are retrieved/fetched
  useEffect(() => {
    const handleDefaultsLoaded = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const data = customEvent.detail;
      if (data && data.localStorageDump) {
        const savedNodes = localStorage.getItem(sitemapLocalStorageKey);
        if (savedNodes === null) {
          const persisted = data.localStorageDump[sitemapLocalStorageKey];
          if (persisted) {
            setSiteMapNodes(typeof persisted === "string" ? JSON.parse(persisted) : persisted);
          }
        }
        const savedStacks = localStorage.getItem(techStackLocalStorageKey);
        if (savedStacks === null) {
          const persisted = data.localStorageDump[techStackLocalStorageKey];
          if (persisted) {
            setTechStacks(typeof persisted === "string" ? JSON.parse(persisted) : persisted);
          }
        }
      }
    };

    window.addEventListener("ae_dynamic_defaults_loaded", handleDefaultsLoaded);

    // If global defaults already loaded, parse immediately
    const globalWin = (window as any);
    if (globalWin.__loadedDynamicDefaults) {
      const fakeEvent = new CustomEvent("ae_dynamic_defaults_loaded", { detail: globalWin.__loadedDynamicDefaults });
      handleDefaultsLoaded(fakeEvent);
    }

    return () => {
      window.removeEventListener("ae_dynamic_defaults_loaded", handleDefaultsLoaded);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !contactEmail.trim()) return;

    const data = {
      brandName,
      targetAudience,
      budgetRange,
      contactEmail,
      generatedConcept: currentBrief?.conceptName || "AEROCORE CONCEPT V1",
      submittedAt: new Date().toLocaleTimeString(),
      recommendedAplusSystem: budgetRange.includes("3k") ? "Elite Modular 3D Interactive" : "Premium Apple-Minimal Grid",
      estimatedCtIncrease: currentBrief?.metrics?.ctrBoost || "+95% CTR Boost"
    };

    setSubmissionData(data);
    setIsSubmitted(true);
    
    // Save to local storage for persistence
    localStorage.setItem("aerocore_assessment", JSON.stringify(data));
  };

  // Add/Delete Site Map handlers
  const handleAddSiteMapNode = () => {
    const newId = `node-${Date.now()}`;
    const newNode: SiteMapNode = {
      name: "New Node / 新增站内核心拓扑节点",
      description: "Customize your secondary e-commerce landing pages, detailed assembly charts or micro-material interaction specs here.",
      path: `#custom-${Date.now().toString().slice(-4)}`,
      techKeywords: ["React.State", "Dynamic Render"]
    };
    setSiteMapNodes(prev => [...prev, newNode]);
  };

  const handleDeleteSiteMapNode = (index: number) => {
    setSiteMapNodes(prev => prev.filter((_, i) => i !== index));
  };

  // Add/Delete Tech Stack handlers
  const handleAddTechStack = () => {
    const newId = `stack-${Date.now()}`;
    const newStack: TechStackItem = {
      id: newId,
      name: "New Technology / 新增底层核心开发栈",
      reason: "Explain why this hardware or software tier optimizes conversions, cuts asset load speeds, or enables elegant physics animations here."
    };
    setTechStacks(prev => [...prev, newStack]);
  };

  const handleDeleteTechStack = (id: string) => {
    setTechStacks(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-12 animate-fade-in duration-300">
      
      {/* Biography Profile Grid */}
      {visibleSections.includes("about_bio") ? (
        <div className="relative group/sec-wrap space-y-6">
          
          {isEditMode && (
             <div className="bg-orange-600/95 text-white text-[9.5px] font-mono px-4 py-1.5 flex items-center justify-between rounded-xl border border-orange-500/30">
               <span className="font-bold">// SECTION BLOCK: BIOGRAPHY DOSSIER & AUDIT MATRIX (主设计师履历与诊断沙盒)</span>
               <button 
                 onClick={() => toggleSection("about_bio")}
                 className="bg-black/40 hover:bg-red-600 px-2.5 py-0.5 rounded cursor-pointer text-white text-[8px]"
               >
                 Delete Section / 隐藏整体大选项 ❌
               </button>
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Designer Card Profile */}
            <div className="lg:col-span-4 bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between text-left">
              <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-white/30 uppercase">
                <DeletableText id="about_dossier_title" defaultText="DIRECTOR_DOSSIER // 01" isEditMode={isEditMode} className="text-[8px] font-mono leading-none" />
              </div>
              <div className="absolute -top-1/4 -right-1/4 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="space-y-6">
                {/* Avatar graphic representation inside hardware frames */}
                <div className="w-22 h-22 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-purple-600 to-[#FF9E00] p-[1.5px] relative">
                  <div className="w-full h-full bg-black rounded-2xl flex flex-col items-center justify-center font-bold text-base tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 relative overflow-hidden font-mono">
                    <Cpu className="w-6 h-6 text-[#FF6B00] absolute animate-spin-slow pointer-events-none opacity-20" />
                    AERO
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#FF6B00] uppercase tracking-wider block font-bold">
                    <DeletableText id="about_bio_badge" defaultText="SENIOR DESIGN PARTNER" isEditMode={isEditMode} className="text-[#FF6B00] font-mono uppercase text-[10px] font-bold" />
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white mt-1">
                    <DeletableText id="about_bio_title" defaultText="E-Commerce Creative Architect" isEditMode={isEditMode} className="text-2xl font-bold text-white font-display" />
                  </h3>
                  <span className="text-xs text-white/40 font-mono mt-0.5 block">
                    <DeletableText id="about_bio_sub" defaultText="EST. 2018 // HIGH-MEMBER BRAND CHANNELS" isEditMode={isEditMode} className="text-xs text-white/40 font-mono" />
                  </span>
                </div>

                <div className="text-xs text-white/60 leading-normal space-y-2">
                  <DeletableText
                    id="about_bio_desc1"
                    defaultText="We specialize in high-end structural CGI design and minimalist layouts. Our vision is to elevate outbound manufacturing brands to global household icons via honest hardware blueprints."
                    isEditMode={isEditMode}
                    className="text-xs text-white/60 block leading-normal pt-1"
                    as="p"
                  />
                  <DeletableText
                    id="about_bio_desc2"
                    defaultText="“结构至诚，少即是多。”我们专衔通过苹果流派的空间呼吸留白，结合机械物理结构 honest 拆卸，打通全球出海头部高客单品牌的转化链路。"
                    isEditMode={isEditMode}
                    className="text-[#FF9E00]/85 block font-mono text-[9.5px] leading-relaxed pt-1"
                    as="p"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-2 font-mono text-[9px] text-white/40 mt-10">
                <div className="flex justify-between items-center">
                  <span>CURRENT REGION:</span>
                  <span className="text-[#FF6B00] text-right font-medium">
                    <DeletableText id="about_bio_data1" defaultText="SHENZHEN / DESIGN CAPITAL" isEditMode={isEditMode} className="text-right text-[#FF6B00] font-medium" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SECTOR DEPTH:</span>
                  <span className="text-white text-right font-medium">
                    <DeletableText id="about_bio_data2" defaultText="Power/Audio/Keyboards" isEditMode={isEditMode} className="text-right text-white font-medium" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>LATEST AUDIT:</span>
                  <span className="text-green-400 text-right font-medium">
                    <DeletableText id="about_bio_data3" defaultText="+94% Average CTR Rise" isEditMode={isEditMode} className="text-right text-green-400 font-medium" />
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Form: Brand Lead Generator */}
            <div className="lg:col-span-8 bg-zinc-950 border border-white/10 rounded-3xl p-6 lg:p-8 relative text-left">
              <div className="absolute top-0 right-0 p-5 font-mono text-[8px] text-white/20 uppercase">
                <DeletableText id="about_diag_watermark" defaultText="DESIGN AUDIT MATRIX // REQUEST_FORM" isEditMode={isEditMode} className="text-[8px] font-mono leading-none" />
              </div>
              
              <h3 className="text-lg font-display font-medium text-white flex items-center gap-2 border-b border-white/5 pb-4">
                <TrendingUp className="w-5 h-5 text-[#FF6B00]" /> 
                <DeletableText id="about_diag_title" defaultText="Visual Upgrade Diagnosis / 主图与A+升级方案提报评估" isEditMode={isEditMode} className="text-lg font-display font-medium text-white" />
              </h3>

              {isSubmitted && submissionData ? (
                <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-4 animate-fade-in mt-4">
                  <div className="flex items-center gap-2.5 text-green-400 font-mono text-xs">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>ASSESSMENT DOSSIER COMMITTED SUCCESSFULLY // 评估报盘提报成功</span>
                  </div>
                  <div className="text-xs text-white/70 space-y-2 leading-relaxed font-sans">
                    <p>Thank you for submitting <strong>{submissionData.brandName}</strong>. Our director will review your targeted listings against elite benchmark structures and transmit a bespoke rendering roadmap proposal within 24 hours.</p>
                    <hr className="border-white/5" />
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-white/40">
                      <div>AUDIENCE INTENT: {submissionData.targetAudience}</div>
                      <div>PRICE BUDGET: {submissionData.budgetRange}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setBrandName("");
                      setContactEmail("");
                    }}
                    className="py-1.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono uppercase cursor-pointer"
                  >
                    [ Diagnose Another Brand / 自助递交全新评估 ]
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Brand Name / 提报品牌名称:</label>
                      <input 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. EcoCore Technologies"
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]/70 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Main Product Niche / 拟测主力核心品类:</label>
                      <input 
                        type="text" 
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Smart Charging / Bluetooth Audio"
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]/70 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Target Price Budget / 视觉升级预期预算区间:</label>
                      <select 
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]/70 font-mono"
                      >
                        <option value="Premium Level (1-3k USD)">Elite Level / 顶奢多视角爆发图企划 (1-3k USD)</option>
                        <option value="Ultra Tier (3k+ USD)">Cosmopolitan Tier / 出海品牌视觉统筹 (3k+ USD)</option>
                        <option value="Standard Main Renders (under 1k USD)">Core Renders / 极智3D高对比首步首图 (under 1k USD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Contact Email / 评估意见派至邮箱:</label>
                      <input 
                        type="email" 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="partner@yourbrand.com"
                        className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]/70 font-mono animate-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#FF6B00] hover:bg-[#FF9E00] text-black font-mono font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-[0_4px_15px_rgba(255,107,0,0.2)]"
                  >
                    SUBMIT DIAGNOSIS REQUEST / 提交品牌视觉评估申请
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
          <span className="text-xs font-mono text-white/30 uppercase">[ Designer Dossier biography assessment deleted / 主设计师履历与诊断方案评估已被隐藏 ]</span>
          {isEditMode && (
            <button
              onClick={() => toggleSection("about_bio")}
              className="mt-3 block mx-auto text-[10px] text-[#FF6B00] hover:underline font-mono"
            >
              [ ➕ Bring Biography Back / 恢复此大板块 ]
            </button>
          )}
        </div>
      )}

      {/* SITE MAP GRID TREE */}
      {visibleSections.includes("about_sitemap") ? (
        <div className="space-y-4 pt-4 text-left relative">
          
          {isEditMode && (
             <div className="bg-orange-600/95 text-white text-[9.5px] font-mono px-4 py-1.5 flex items-center justify-between rounded-xl border border-orange-500/30">
               <span className="font-bold">// SECTION BLOCK: TECHNICAL TOPO SITE MAP (全站功能部署Site Map拓扑系统)</span>
               <button 
                 onClick={() => toggleSection("about_sitemap")}
                 className="bg-black/40 hover:bg-red-600 px-2 py-0.5 rounded cursor-pointer text-white text-[8px]"
               >
                 Delete Section / 隐藏整体大选项 ❌
               </button>
             </div>
          )}

          <h3 className="text-xs uppercase font-mono tracking-widest text-[#FF6B00] font-bold">
            <DeletableText id="sitemap_title" defaultText="PORTFOLIO SITE MAP // CORE BLUEPRINT TREE / 本站严密功能拓扑（Site Map）" isEditMode={isEditMode} className="text-xs uppercase font-mono tracking-widest text-[#FF6B00] font-bold" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteMapNodes.map((node, i) => (
              <div key={i} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-white/25 transition-colors relative group/node-card">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSiteMapNode(i)}
                    className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-full shadow transition-all z-20 cursor-pointer"
                    title="Delete node / 删除此节点"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40 font-mono font-bold uppercase block">
                      <DeletableText id={`node_ph_${i}`} defaultText={node.name.split(" / ")[0]} isEditMode={isEditMode} className="text-white/40 font-mono font-bold uppercase" />
                    </span>
                    <span className="text-[10px] bg-white/5 text-white/80 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                      <DeletableText id={`node_path_${i}`} defaultText={node.path} isEditMode={isEditMode} className="text-[10px] font-mono uppercase tracking-widest" />
                    </span>
                  </div>
                  <h4 className="text-md font-bold text-white uppercase font-mono">
                    <DeletableText id={`node_title_${i}`} defaultText={node.name.split(" / ")[1]} isEditMode={isEditMode} className="text-md font-bold text-white uppercase font-mono" />
                  </h4>
                  <div className="text-xs text-white/60 leading-relaxed pt-1">
                    <DeletableText id={`node_desc_${i}`} defaultText={node.description} isEditMode={isEditMode} className="text-xs text-white/60 leading-relaxed" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-1.5 mt-auto">
                  <span className="text-[8px] font-mono text-white/30 uppercase block">Implementation Hooks / 技术钩子:</span>
                  <div className="flex flex-wrap gap-1">
                    {node.techKeywords.map((tag, idx) => (
                      <span key={idx} className="text-[8px] bg-[#FF6B00]/10 text-[#FF9E00] border border-[#FF6B00]/10 px-2 py-0.5 rounded font-mono">
                        <DeletableText id={`node_tag_${i}_${idx}`} defaultText={tag} isEditMode={isEditMode} className="text-[8px] font-mono text-[#FF9E00]" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Node (visible in edit mode) */}
          {isEditMode && (
            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={handleAddSiteMapNode}
                className="bg-white hover:bg-[#FF6B00] text-black font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 cursor-pointer shadow transition-all font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>ADD TOPO NODE / 增加拓扑特制节点</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
          <span className="text-xs font-mono text-white/30 uppercase">[ Technical Architecture Site Map has been deleted / 站内功能Site Map已被隐藏 ]</span>
          {isEditMode && (
            <button
              onClick={() => toggleSection("about_sitemap")}
              className="mt-3 block mx-auto text-[10px] text-[#FF6B00] hover:underline font-mono"
            >
              [ ➕ Bring Site Map Back / 恢复此大板块 ]
            </button>
          )}
        </div>
      )}

      {/* RECOMMENDED TECHNOLOGY ARCHITECTURE */}
      {visibleSections.includes("about_stack") ? (
        <div className="bg-[#080808] border border-white/5 p-6 lg:p-8 rounded-3xl space-y-6 text-left relative">
          
          {isEditMode && (
             <div className="bg-orange-600/95 text-white text-[9.5px] font-mono px-4 py-1.5 flex items-center justify-between rounded-xl border border-orange-500/30">
               <span className="font-bold">// SECTION BLOCK: STACK ARCHITECTURE (出海技术底层推荐板块)</span>
               <button 
                 onClick={() => toggleSection("about_stack")}
                 className="bg-black/40 hover:bg-red-600 px-2 py-0.5 rounded cursor-pointer text-white text-[8px]"
               >
                 Delete Section / 隐藏整个大选项 ❌
               </button>
             </div>
          )}

          <h3 className="text-lg font-display font-medium text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Cpu className="w-5 h-5 text-[#FF6B00]" /> 
            <DeletableText id="stack_panel_title" defaultText="Recommended Premium E-commerce Stack (Next.js / Motion) / 出海大牌高动态推荐技术开发底层" isEditMode={isEditMode} className="text-lg font-display font-medium text-white" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {techStacks.map((stack, idx) => (
              <div key={stack.id} className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-2.5 relative group/stack-card flex flex-col justify-between min-h-[180px]">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTechStack(stack.id)}
                    className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-full shadow transition-all z-20 cursor-pointer"
                    title="Delete tech node / 删除此开发卡"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                <div className="space-y-2.5">
                  <span className="text-[#FF6B00] font-mono text-xs font-bold block">// STACK 0{idx+1}</span>
                  <h4 className="text-sm font-bold text-white uppercase">
                    <DeletableText id={`stack_name_${stack.id}`} defaultText={stack.name} isEditMode={isEditMode} className="text-sm font-bold text-white uppercase block" />
                  </h4>
                  <span className="text-xs text-white/55 leading-relaxed font-sans block">
                    <DeletableText id={`stack_reason_${stack.id}`} defaultText={stack.reason} isEditMode={isEditMode} className="text-xs text-white/55 leading-relaxed" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Tech Stack (visible in edit mode) */}
          {isEditMode && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleAddTechStack}
                className="bg-white hover:bg-[#FF6B00] text-black font-semibold text-xs py-2.5 px-5 rounded-full flex items-center gap-1.5 cursor-pointer shadow transition-all font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>ADD TECH CARD / 增加底层推荐卡</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/20">
          <span className="text-xs font-mono text-white/30 uppercase">[ Recommended Technical Stack cards are hidden / 大牌底层高频框架推荐卡阵已被隐藏 ]</span>
          {isEditMode && (
            <button
              onClick={() => toggleSection("about_stack")}
              className="mt-3 block mx-auto text-[10px] text-[#FF6B00] hover:underline font-mono"
            >
              [ ➕ Bring Tech Grid Back / 恢复此大板块 ]
            </button>
          )}
        </div>
      )}

    </div>
  );
}
