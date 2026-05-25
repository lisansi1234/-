import React, { useState, useEffect, useRef } from "react";
import { 
  Layers, 
  Cpu, 
  Activity, 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Image as ImageIcon, 
  ImageOff, 
  PlusCircle, 
  Sliders, 
  ChevronsDown, 
  Camera,
  Sparkles,
  ChevronRight,
  DownloadCloud,
  ChevronUp,
  ChevronDown,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DeletableText from "./DeletableText";
import DeletableWrapper from "./DeletableWrapper";

// --- INDEXEDDB HELPER FOR HIGH-RES LOSSLESS IMAGES ---
const DB_NAME = "AerocorePortfolioDB";
const STORE_NAME = "images";

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => {
      resolve((e.target as IDBOpenDBRequest).result);
    };
    request.onerror = (e) => {
      reject((e.target as IDBOpenDBRequest).error);
    };
  });
}

export function saveToIndexedDB(key: string, data: string): Promise<void> {
  return initIndexedDB()
    .then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    })
    .catch((err) => {
      console.error("Failed to save to IndexedDB:", err);
    });
}

export function getFromIndexedDB(key: string): Promise<string | null> {
  return initIndexedDB()
    .then((db) => {
      return new Promise<string | null>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    })
    .catch((err) => {
      console.error("Failed to get from IndexedDB:", err);
      return null;
    });
}

interface SafeImageProps {
  src?: string;
  fallback?: string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onDoubleClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLImageElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLImageElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLImageElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLImageElement>) => void;
  [key: string]: any;
}

export function SafeImage({ src, fallback, ...props }: SafeImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>("");

  useEffect(() => {
    if (!src) {
      setResolvedSrc(fallback || "");
      return;
    }

    if (src.startsWith("db_img_")) {
      getFromIndexedDB(src).then((resolved) => {
        if (resolved) {
          setResolvedSrc(resolved);
        } else {
          setResolvedSrc(fallback || "");
        }
      }).catch(() => {
        setResolvedSrc(fallback || "");
      });
    } else {
      setResolvedSrc(src);
    }
  }, [src, fallback]);

  const currentSrc = resolvedSrc || (src && !src.startsWith("db_img_") ? src : fallback) || undefined;

  return (
    <img 
      src={currentSrc} 
      {...props} 
      referrerPolicy="no-referrer"
    />
  );
}

interface AnkerBlueListingSystemProps {
  isEditMode: boolean;
  setIsEditMode?: (mode: boolean) => void;
  visibleSections?: string[];
  toggleSection?: (id: string) => void;
  productName?: string;
  setProductName?: (name: string) => void;
  designStyle?: string;
  setDesignStyle?: (style: string) => void;
  extraRequirements?: string;
  setExtraRequirements?: (text: string) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  loaderLogs?: string[];
  activeLogIndex?: number;
  currentBrief?: any;
  disassemblyFactor?: number;
  setDisassemblyFactor?: (factor: number) => void;
  hoveredLayerIndex?: number | null;
  setHoveredLayerIndex?: (index: number | null) => void;
  aplusLayoutType?: "basic" | "premium";
  setAplusLayoutType?: (type: "basic" | "premium") => void;
  handleGenerateDesign?: (e: any) => void;
  loadPresetProduct?: (key: "power" | "earbuds" | "keyboard") => void;
  isVerified?: boolean;
  onOpenLoginModal?: () => void;
}

interface ProjectSpec {
  tag: string;
}

interface ProjectMetric {
  label: string;
  val: string;
  remark: string;
}

interface MainImageItem {
  id: number;
  img: string;
  label: string;
}

interface AplusCompareRow {
  feature: string;
  thisVal: string;
  comp1: string;
  comp2: string;
}

interface AplusHotspot {
  title: string;
  desc: string;
  x: string;
  y: string;
}

interface AplusSlide {
  title: string;
  desc: string;
  img?: string;
  tabTitle?: string;
}

interface AplusGridCard {
  id: number;
  title: string;
  desc: string;
  img: string;
}

interface AplusBlockItem {
  id: number;
  title: string;
  desc: string;
  premiumImg: string;
  competitorImg: string;
  competitorTitle: string;
  competitorDesc: string;
  isComparing: boolean;
  layoutStyle?: "banner" | "comparison" | "hotspots" | "carousel" | "grid" | "longImage";
  compareRows?: AplusCompareRow[];
  hotspots?: AplusHotspot[];
  carouselSlides?: AplusSlide[];
  gridCards?: AplusGridCard[];
  activeSlideIndex?: number;
  imgFit?: "cover" | "contain" | "auto";
  carouselNavOpacity?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  layout: "asymmetrical" | "bento" | "grid3";
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "storage", name: "⚡️ 智能储能", layout: "asymmetrical" },
  { id: "home", name: "🏠 智能家居", layout: "bento" },
  { id: "pets", name: "🐱 智能宠物", layout: "grid3" },
  { id: "aicg", name: "🤖 AICG 概念", layout: "bento" }
];

interface PortfolioProject {
  id: number;
  categoryId?: string;
  title: string;
  subtitle: string;
  category: string;
  img: string;
  desc: string;
  specs: ProjectSpec[];
  metrics: ProjectMetric[];
  mainImages: MainImageItem[];
  aplusBlocks: AplusBlockItem[];
  imgFit?: "cover" | "contain" | "auto";
}

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 1,
    categoryId: "storage",
    title: "DELTA-ION PRO // 德尔塔-离子航天级移动电源",
    subtitle: "FLAGSHIP POWER MATRIX // 主力高容量电池案",
    category: "HARDCORE TECH / SOLAR POWER 【硬核科技 / 太阳能储能】",
    img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000",
    desc: "为全球数字游民工业化重构电能输出。我们用磨砂氧化铝结构和发光散热管道替代了平庸的塑料外壳，瞬间打消消费者对安全性的疑虑，奠定科技质感。",
    specs: [
      { tag: "CNC-6061 Anodized Aluminum 阳极氧化铝" },
      { tag: "Optic Glass Enclosure 光学钢化玻璃" },
      { tag: "V-0 Flame-Retardant Polymer V0防爆高聚物" }
    ],
    metrics: [
      { label: "CTR Improvement 点击率拉动", val: "+114% Boost [点击率飙升]", remark: "Amazon luxury audio tier average / 亚马逊奢修音频品类均值" },
      { label: "Return Rates Drop 退货率拉平", val: "-46% Reduced [退货率骤降]", remark: "Due to hyper-detailed material charts / 归功于高精度三维材质拆解图" }
    ],
    mainImages: [
      { id: 101, img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000", label: "01 / 亚马逊首图" },
      { id: 102, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", label: "02 / 核心闪充卖点图" },
      { id: 103, img: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000", label: "03 / 电池电芯3D拆解" },
      { id: 104, img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1000", label: "04 / 适配场景应用图" }
    ],
    aplusBlocks: [
      {
        id: 201,
        title: "01 / Premium A+ 1464x600 Full-Width Hero",
        desc: "适合放 3D 整机视觉大渲染。可以点击下方切换对标竞品，凸显本产品的高级感溢价层级。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1464&h=600",
        competitorTitle: "!!! POWERFUL STATIONS DELTA !!!",
        competitorDesc: "同质化白底无亮点图，拼凑冗余描述，导致无法支撑高定价，拉低转化率（CVR）。",
        isComparing: false
      }
    ]
  },
  {
    id: 2,
    categoryId: "storage",
    title: "VIRTUS ACOUSTIC-1 // 维特斯极简智能声学耳机",
    subtitle: "PREMIUM COMPOSITION CORE // 声学声腔重配极简案",
    category: "APPLE MINIMAL / SMART AUDIO 【苹果式极简 / 智能音频】",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000",
    desc: "提取至纯极简的声学真空。通过半透明声学振膜、金合金融路径及定制溅射镀振膜渲染，完美呈现微观物理质感，严密装配逻辑与极高视觉纯净度。",
    specs: [
      { tag: "Translucent Toughened Silica 钢化透明硅胶" },
      { tag: "Beryllium-Coated Film 极高附着镀铍涂层" },
      { tag: "Sputtered Aurum Contacts 溅射金触点" }
    ],
    metrics: [
      { label: "CTR Improvement 点击率提升", val: "+94% CTR Gain [点击率升幅]", remark: "A/B tested against original listing / 相比普通首图A/B测试" },
      { label: "Return Rates Drop 退货率力保", val: "-34.2% Peak [极限转化率]", remark: "精细拆解图极力扫除消费者决策疑虑" }
    ],
    mainImages: [
      { id: 301, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000", label: "01 / 苹果极简主图" },
      { id: 302, img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000", label: "02 / 声腔学拆解附图" }
    ],
    aplusBlocks: [
      {
        id: 401,
        title: "01 / Chapter 1: Acoustic Chamber Renders",
        desc: "普通同行仅靠大字号 and 白底图硬砸性能，缺乏声学腔体剖析与微观材料的高级感背书。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1464&h=600",
        competitorTitle: "!!! BASIC SOUND WIRELESS !!!",
        competitorDesc: "普通同行仅靠大字号和白底图硬砸性能，缺乏声学腔体剖析与微观材料的高级感背书。",
        isComparing: false
      }
    ]
  },
  {
    id: 3,
    categoryId: "home",
    title: "AERO-BREATHE // 智能负离子空气净化器",
    subtitle: "AIR PURIFICATION MATRIX // 3D高端净化设备",
    category: "SMART HOME / LIVING TECH 【智能家居 / 舒适生活】",
    img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1000",
    desc: "极简磨砂白色工艺与极窄LED发光交互。通过三维渲染还原活性炭吸附路径，为高端家居品牌提供卓越的转化率提升效果，展示微观粒子净化效率。 [1]",
    specs: [
      { tag: "HEPA True Filtration 极细复合过滤" },
      { tag: "Active Ionic Generator 智能离子发生器" }
    ],
    metrics: [
      { label: "CVR Boost 转化率攀升", val: "+42% Growth [转化率冲高]", remark: "Due to premium filter breakdown CGI / 归功于极其纯净的结构渲染与留白" }
    ],
    mainImages: [
      { id: 501, img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1000", label: "01 / 智能净化器主图" }
    ],
    aplusBlocks: [
      {
        id: 502,
        title: "01 / Clean Filtration Aesthetics",
        desc: "三维空气微粒流动路径图，展现前所未见的微米净化精度。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1464&h=600",
        competitorTitle: "!!! DUMMY HEPA PURIFIER !!!",
        competitorDesc: "平庸的白底图无法让消费者领悟内部负离子发生的真正作用，决策犹豫导致流失率增高。",
        isComparing: false
      }
    ]
  },
  {
    id: 4,
    categoryId: "home",
    title: "KITCHEN-CORE // 3D极简多功能智能料理机",
    subtitle: "KITCHEN ROBOT CONCEPT // 极简声学厨房硬件",
    category: "SMART KITCHEN / HIGH END OVEN 【智联厨房 / 顶奢厨电】",
    img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000",
    desc: "苹果级极简铝制机身配合圆润全触控黑晶玻璃屏。极致打磨金属底座高光，彻底提升搜索页面的点击转化，树立厨房烹饪美学地标。",
    specs: [
      { tag: "Anodized Aluminum Finish 阳极氧化铝拉丝" },
      { tag: "Solid Tempered Glass 物理钢化黑晶" }
    ],
    metrics: [
      { label: "CTR Improvement 点击率拉动", val: "+28% Boost [点击率增长]", remark: "High-contrast render outperforms photography / 高度打磨渲染大图大幅超越日常摄影" }
    ],
    mainImages: [
      { id: 601, img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000", label: "01 /料理机主图" }
    ],
    aplusBlocks: [
      {
        id: 602,
        title: "01 / Luxury Cooking Reinvented",
        desc: "极深黑色背景烘托拉丝阳极氧化铝的细腻颗粒感，凸显德系工艺。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1464&h=600",
        competitorTitle: "!!! BASIC ELECTRIC POT !!!",
        competitorDesc: "红红绿绿的塑料配色以及复杂的白底说明书图，大幅拉低品牌溢价和消费者付费自信。",
        isComparing: false
      }
    ]
  },
  {
    id: 5,
    categoryId: "pets",
    title: "PET-FEEDER PRO // 星联宠物自动喂食器",
    subtitle: "AUTOMATIC NUTRI-DISPENSER // 宠物智能补给系统",
    category: "SMART PETS / NUTRI LOGISTICS 【智能宠物 / 膳食托管】",
    img: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1000",
    desc: "专为猫咪和小狗打造防卡粮、防潮、密封出粮的一体化智能膳食管理系统。精细刻画食品级ABS树脂和抗菌不锈钢碗工艺微观细节，完全打消安全忧虑。",
    specs: [
      { tag: "Food-Grade ABS Resin 食品级安全树脂" },
      { tag: "Anti-Clog Silicone Paddle 防卡粮硅胶叶轮" }
    ],
    metrics: [
      { label: "CVR Boost 转化率攀升", val: "+48% Growth [转化高企]", remark: "Proving material safety through CGI renders / 借助三维剖析有力背书食品级健康用材" }
    ],
    mainImages: [
      { id: 701, img: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1000", label: "01 / 喂食器首图" }
    ],
    aplusBlocks: [
      {
        id: 702,
        title: "01 / Zero Clogging Architecture",
        desc: "拆解全密封物理硅胶密封片与抗菌内胆结构，树立绝对洁净体验。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1464&h=600",
        competitorTitle: "!!! PLASTIC FEEDER CAT !!!",
        competitorDesc: "死板塑料白碗易导致黑下巴，塑料管道长期受潮发霉极不卫生，缺乏精细渲染讲解决策流失。",
        isComparing: false
      }
    ]
  },
  {
    id: 6,
    categoryId: "aicg",
    title: "MJ-CONCEPT 01 // 赛博朋克概念透明固态硬盘",
    subtitle: "FUTURE CYBER STORAGE // 未来的透明数据装甲",
    category: "AICG DESIGN / CONCEPT HARDWARE 【概念硬件 / AI创想】",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
    desc: "借助 AI 拓扑优化，完全剔除工业杂音的半透明机甲，突显硬件极客硬核电路。科幻量子蓝色自发光，为未来数字存储打通前瞻美学路径。",
    specs: [
      { tag: "Generative AI Topology AI拓扑算法优化" },
      { tag: "Futuristic Visual Language 赛博朋克透明美学" }
    ],
    metrics: [
      { label: "Conceptual Rating 概念好评度", val: "98.4% Peak [狂热好评]", remark: "High-level concept tested by communities / 全站概念发帖引发狂热社群围观与点击" }
    ],
    mainImages: [
      { id: 801, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", label: "01 / 概念渲染大图" }
    ],
    aplusBlocks: [
      {
        id: 802,
        title: "01 / Cyber Tech Avant-Garde",
        desc: "将极客向的科幻自发光元器件以晶化材质透射展示，呈现强视觉震撼性。",
        premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
        competitorImg: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1464&h=600",
        competitorTitle: "!!! NORMAL SSD CASING !!!",
        competitorDesc: "沉闷单调的银灰色小铁盒，没有灯效也无法洞穿内部极速工艺，缺乏极客发烧友溢价阶梯。",
        isComparing: false
      }
    ]
  }
];

const getBlockCompareRows = (block: any): AplusCompareRow[] => {
  if (block.compareRows && block.compareRows.length > 0) return block.compareRows;
  return [
    { feature: "中轴阻尼转轴 / Dual Hinge Friction", thisVal: "物理高阻尼双凸轮切面 (超凡稳固)", comp1: "廉价铆接双塑料套管", comp2: "高回弹裸露压簧结构" },
    { feature: "整机降噪腔体 / Spatial Sonic Armor", thisVal: "航空级钢化流体力学闭式声阻腔", comp1: "薄壁非密闭注塑低阻腔", comp2: "金属滤布直通泄物理网" },
    { feature: "主控材料与保护 / Control Core Protection", thisVal: "V-0 太空级不透片阻燃不发热高敏芯片", comp1: "无屏蔽易热单面单层芯片", comp2: "一般二级温度保险热熔" },
    { feature: "点击效率反馈 / Page Conversion Rate", thisVal: "⭐ 突破性高奢质感 +114% 驻留飙升", comp1: "普通套模板图, CVR 增长停滞", comp2: "略有文字编排, 购买自信不足" }
  ];
};

const getBlockHotspots = (block: any): AplusHotspot[] => {
  if (block.hotspots && block.hotspots.length > 0) return block.hotspots;
  return [
    { title: "太空隔离舱架构 / Isolation Chamber", desc: "自研超密物理不漏片隔热壳体，极佳电极稳定，强韧防爆。", x: "28%", y: "35%" },
    { title: "高阻尼精磨转轮 / Tactical Kinetic Finish", desc: "微米级雕刻喷砂工艺与顺滑尼龙齿带，享受极奢操作阻尼手感。", x: "55%", y: "52%" },
    { title: "闪充主控安全芯 / Active Safety Gate", desc: "内置太空配方隔离微芯，全链路瞬发快充，极限温控不发烫。", x: "78%", y: "45%" }
  ];
};

const getBlockSlides = (block: any): AplusSlide[] => {
  if (block.carouselSlides && block.carouselSlides.length > 0) {
    return block.carouselSlides;
  }
  return [
    { 
      title: "01 高奢极境黑 / Space Charcoal", 
      desc: "采用 5 号航空用高强度阳极氧化铝，深度磨砂质感，展现出色的科技沉稳感与顶级纯净流光。",
      img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1464&h=600"
    },
    { 
      title: "02 智慧量子蓝 / Deep Quantum", 
      desc: "量子喷砂着色工艺，随光线角度律动，深邃如晶体，勾勒神秘硬核工业线条。",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1464&h=600"
    },
    { 
      title: "03 超冷光温控 / active cool", 
      desc: "内置低温液态导爆凝胶，搭载全自研温控大排量鳍片，不热不烫，全速守护安全。",
      img: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1464&h=600"
    },
    { 
      title: "04 微创晶析屏 / crystal panel", 
      desc: "太空蓝微晶高透防眩面板，LED 流体阵点背光，呈现灵动的能源呼吸流美学。",
      img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1464&h=600"
    },
    { 
      title: "05 航天能密度 / core force", 
      desc: "特斯拉同源 4680 航天电芯矩阵，密度飙升 +140%，无惧严寒与高热极限。",
      img: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=1464&h=600"
    }
  ];
};

const getBlockGridCards = (block: any): AplusGridCard[] => {
  if (block.gridCards && block.gridCards.length > 0) {
    const current = block.gridCards;
    if (current.length === 4) return current;
    const padded = [...current];
    while (padded.length < 4) {
      padded.push({
        id: padded.length + 1,
        title: `特色卡片 ${padded.length + 1}`,
        desc: "卡片微观工艺指标与核心溢价卖点描述",
        img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=300&h=300"
      });
    }
    return padded.slice(0, 4);
  }
  return [
    { 
      id: 1, 
      title: "CNC精密切削阳极氧化 / CNC Metal", 
      desc: "6061 系防爆航空级整料铝板五轴联动精细雕琢工艺", 
      img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=300&h=300" 
    },
    { 
      id: 2, 
      title: "高分子 V0 阻燃不烫手 / Smart Shell", 
      desc: "双层防火防冲聚合物铠甲隔离保护，卓越抗热冲击表现", 
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&h=300" 
    },
    { 
      id: 3, 
      title: "超高质感量子感应屏 / Quantum LED", 
      desc: "零延迟智能芯片驱动，全息透光数字阵点交互设计", 
      img: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=300&h=300" 
    },
    { 
      id: 4, 
      title: "240W超级双向氮化镓 / Dual GaN Core", 
      desc: "第三代半导体功率芯片全速度双通路反向安全注入", 
      img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&h=300" 
    }
  ];
};

export default function AnkerBlueListingSystem({ 
  isEditMode, 
  setIsEditMode = () => {},
  visibleSections = [], 
  toggleSection,
  productName,
  setProductName,
  designStyle,
  setDesignStyle,
  extraRequirements,
  setExtraRequirements,
  isLoading,
  setIsLoading,
  loaderLogs,
  activeLogIndex,
  currentBrief,
  disassemblyFactor,
  setDisassemblyFactor,
  hoveredLayerIndex,
  setHoveredLayerIndex,
  aplusLayoutType,
  setAplusLayoutType,
  handleGenerateDesign,
  loadPresetProduct,
  isVerified = false,
  onOpenLoginModal = () => {}
}: AnkerBlueListingSystemProps) {
  
  // --- STATE PERSISTENCE IN LOCALSTORAGE ---
  const [projectsList, setProjectsList] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem("anker_blue_projects_v2");
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem("anker_blue_categories_v2");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [currentCategory, setCurrentCategory] = useState<string>(() => {
    const saved = localStorage.getItem("anker_current_category_v2");
    return saved || "storage";
  });

  useEffect(() => {
    try {
      localStorage.setItem("anker_blue_categories_v2", JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to localStorage:", e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem("anker_current_category_v2", currentCategory);
    } catch (e) {
      console.error("Failed to save currentCategory to localStorage:", e);
    }
  }, [currentCategory]);

  const [activeProjectId, setActiveProjectId] = useState<number>(() => {
    const savedActive = localStorage.getItem("anker_active_project_id_v2");
    return savedActive ? parseInt(savedActive, 10) : 1;
  });

  // Tabs View: lobby (大师案例库), detail (深度故事页), sandbox (A+ 互动沙盒)
  const [subView, setSubView] = useState<"lobby" | "detail" | "sandbox">("lobby");

  const [filterQuery, setFilterQuery] = useState("");

  const [isAnkerPanelOpen, setIsAnkerPanelOpen] = useState(false);

  // For image upload triggers
  const [activeUpload, setActiveUpload] = useState<{ 
    type: string; 
    indexOrId: number 
  } | null>(null);

  const activeUploadRef = useRef<{ 
    type: string; 
    indexOrId: number 
  } | null>(null);

  // Layout mode for A+ content: seamless (zero gap like live Amazon detailed info) or studio (modular cards)
  const [aplusLayoutMode, setAplusLayoutMode] = useState<"seamless" | "studio">("seamless");

  // Auto play settings for carousels
  const [isAutoCarousel, setIsAutoCarousel] = useState(true);
  
  // Slide trackers both local and persistent
  const [carouselSlideIndices, setCarouselSlideIndices] = useState<Record<number, number>>({});
  
  // Track whether to hide/remove carousel text overlay per-block
  const [hideCarouselText, setHideCarouselText] = useState<Record<number, boolean>>({});

  // --- SYNC, IMPORT, BACKUP FUNCTIONS ---
  const handleExportWorkspaceJson = () => {
    const backupData = {
      version: "2.0-full-sync",
      projectsList,
      categories,
      currentCategory,
      activeProjectId,
      aplusLayoutMode
    };
    
    try {
      const dataStr = JSON.stringify(backupData);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', 'anker_custom_portfolio_backup.json');
      linkElement.click();
      URL.revokeObjectURL(url);
      
      addToast(
        "success", 
        "📤 备份导出成功 / Export Succeeded", 
        "全站自定案例、排版和 Base64 图片已打包导出为本地 JSON 备份文件。您可以导入 Vercel 等新部署网址中同步恢复！"
      );
    } catch (e) {
      console.error(e);
      addToast("error", "导出失败 / Export Failed", "导出数据时发生错误，请重试。");
    }
  };

  const handleImportWorkspaceJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const backupData = JSON.parse(result);
        
        if (backupData && backupData.projectsList && backupData.categories) {
          setProjectsList(backupData.projectsList);
          setCategories(backupData.categories);
          
          if (backupData.currentCategory) {
            setCurrentCategory(backupData.currentCategory);
          }
          if (backupData.activeProjectId) {
            setActiveProjectId(backupData.activeProjectId);
          }
          if (backupData.aplusLayoutMode) {
            setAplusLayoutMode(backupData.aplusLayoutMode);
          }
          
          localStorage.setItem("anker_blue_projects_v2", JSON.stringify(backupData.projectsList));
          localStorage.setItem("anker_blue_categories_v2", JSON.stringify(backupData.categories));
          if (backupData.currentCategory) {
            localStorage.setItem("anker_current_category_v2", backupData.currentCategory);
          }
          if (backupData.activeProjectId) {
            localStorage.setItem("anker_active_project_id_v2", String(backupData.activeProjectId));
          }
          
          addToast(
            "success", 
            "📥 备份还原成功 / Sync Success", 
            "恭喜！所有已上传的作品、自定义排版布局与图片素材已完美导入并即时刷新同步！"
          );
        } else {
          addToast("error", "导入失败 / Import Failed", "导入的文件格式不匹配，无法读取项目及排版数据。");
        }
      } catch (err) {
        console.error(err);
        addToast("error", "解析校验错误", "导入的 JSON 文件可能已损坏或格式有误。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Non-blocking dual-click confirmation states to bypass iframe window.confirm restrictions
  const [confirmDeleteSlide, setConfirmDeleteSlide] = useState<string | null>(null);
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);

  // States for custom Sector addition modal (to bypass iframe prompt blocking)
  const [isAddSectorOpen, setIsAddSectorOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [newSectorLayout, setNewSectorLayout] = useState<"asymmetrical" | "bento" | "grid3">("grid3");

  // --- SELECTION TRACKING FOR MEDIUM-STYLE FLOATING TYPOGRAPHY TOOLBAR ---
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0, visible: false });

  useEffect(() => {
    if (!isEditMode) {
      setToolbarPos(prev => ({ ...prev, visible: false }));
      setActiveTextId(null);
      return;
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        let parent: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
        if (parent.nodeType === Node.TEXT_NODE) {
          parent = parent.parentElement;
        }

        let textId: string | null = null;
        let editableEl: HTMLElement | null = null;
        let current = parent;
        while (current) {
          if (current.hasAttribute && current.hasAttribute("data-text-id")) {
            textId = current.getAttribute("data-text-id");
            editableEl = current;
            break;
          }
          current = current.parentElement;
        }

        if (textId && editableEl) {
          const rect = editableEl.getBoundingClientRect();
          setToolbarPos({
            top: window.scrollY + rect.top - 55,
            left: window.scrollX + rect.left + (rect.width / 2) - 140,
            visible: true
          });
          setActiveTextId(textId);
          return;
        }
      }
    };

    const handleDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#formatToolbar")) {
        return;
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isEditMode]);

  const formatActiveText = (action: string) => {
    if (!activeTextId) return;
    window.dispatchEvent(new CustomEvent(`ae_apply_style_${activeTextId}`, {
      detail: { action }
    }));
    
    if (action === "add-sibling-p") {
      addToast("success", "已追加新子段落 / Sibling Line Added", "你可以直接对其进行富文本级文字编写或删除。");
    } else if (action === "delete-node") {
      addToast("info", "文本节点已物理移除", "你刚才选择的文字标签已成功隐藏或从该视界大厅完全擦除。");
    } else {
      addToast("success", "精排字效已更新", "文字样式已经成功刷新并且保存为离线预设值。");
    }
  };

  // Auto-carousel timer
  useEffect(() => {
    if (!isAutoCarousel) return;
    
    const interval = setInterval(() => {
      const activeProj = projectsList.find(p => p.id === activeProjectId);
      if (!activeProj) return;

      activeProj.aplusBlocks.forEach(block => {
        const blockStyle = block.layoutStyle || "banner";
        if (blockStyle === "carousel") {
          const slides = getBlockSlides(block);
          setCarouselSlideIndices(prev => {
            const currentIndex = prev[block.id] !== undefined ? prev[block.id] : (block.activeSlideIndex || 0);
            const nextIndex = (currentIndex + 1) % slides.length;
            return { ...prev, [block.id]: nextIndex };
          });
        }
      });
    }, 3000); // Advanced advances slides every 3 seconds limit
    
    return () => clearInterval(interval);
  }, [isAutoCarousel, projectsList, activeProjectId]);

  // Save projectsList IMMEDIATELY when it changes to ensure absolutely zero data loss
  useEffect(() => {
    try {
      localStorage.setItem("anker_blue_projects_v2", JSON.stringify(projectsList));
    } catch (e: any) {
      console.error("Failed to save projectsList to localStorage:", e);
      if (e.name === "QuotaExceededError" || e.code === 22) {
        addToast(
          "warning",
          "💾 浏览器存储空间已满 / Local Storage Limit",
          "虽然当前页已更新，但由于图片原图体积过大，超出浏览器 5MB 的本地限制（暂无法在刷新后保存）。建议改用更小（如小于 1MB）的图片或直接导入/导出设计。"
        );
      }
    }
  }, [projectsList]);

  // Save projectsList ONLY when commit save event is received
  useEffect(() => {
    const handleCommit = () => {
      try {
        localStorage.setItem("anker_blue_projects_v2", JSON.stringify(projectsList));
      } catch (e: any) {
        console.error("Failed to save projectsList on commit:", e);
      }
    };
    window.addEventListener("ae_commit_save", handleCommit);
    return () => {
      window.removeEventListener("ae_commit_save", handleCommit);
    };
  }, [projectsList]);

  useEffect(() => {
    try {
      localStorage.setItem("anker_active_project_id_v2", activeProjectId.toString());
    } catch (e) {
      console.error("Failed to save activeProjectId:", e);
    }
  }, [activeProjectId]);

  useEffect(() => {
    document.body.classList.toggle("edit-mode-active", isEditMode);
    return () => {
      document.body.classList.remove("edit-mode-active");
    };
  }, [isEditMode]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      setProjectsList(DEFAULT_PROJECTS);
      setActiveProjectId(1);
      setSubView("lobby");
      addToast("info", "重置成功 / Settings Reset", "已初始化恢复默认的顶级出海实战硬质案例与设计排版参数。");
    };
    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, []);

  const activeProject = projectsList.find(p => p.id === activeProjectId) || projectsList[0];

  // Synchronize activeProjectId with actual displayed activeProject.id to prevent fallback mismatch bugs
  useEffect(() => {
    if (activeProject && activeProject.id !== activeProjectId) {
      setActiveProjectId(activeProject.id);
    }
  }, [activeProject, activeProjectId]);

  // --- Modern Toast System ---
  interface ToastMessage {
    id: string;
    type: "success" | "info" | "warning" | "error" | "uploading";
    title: string;
    desc: string;
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "info" | "warning" | "error" | "uploading", title: string, desc: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, desc }]);
    if (type !== "uploading") {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    }
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Listen to custom "ae_save_success" event
  useEffect(() => {
    const handleSaveSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; desc: string }>;
      if (customEvent.detail) {
        addToast("success", customEvent.detail.title, customEvent.detail.desc);
      }
    };
    window.addEventListener("ae_save_success", handleSaveSuccess);
    return () => {
      window.removeEventListener("ae_save_success", handleSaveSuccess);
    };
  }, []);

  // Modify active project spec text or values helper
  const updateProjectField = (field: keyof PortfolioProject, value: any, silent = true, toastTitle?: string, toastDesc?: string) => {
    setProjectsList(prev => prev.map(p => p.id === activeProject.id ? { ...p, [field]: value } : p));
    if (!silent && toastTitle && toastDesc) {
      addToast("success", toastTitle, toastDesc);
    }
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  // Modify any project field by ID
  const updateProjectFieldById = (id: number, field: keyof PortfolioProject, value: any, silent = true, toastTitle?: string, toastDesc?: string) => {
    setProjectsList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    if (!silent && toastTitle && toastDesc) {
      addToast("success", toastTitle, toastDesc);
    }
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  const promptAddCategory = () => {
    if (!isEditMode) return;
    setNewSectorName("");
    setNewSectorLayout("grid3");
    setIsAddSectorOpen(true);
  };

  const handleCreateSectorConfirm = () => {
    if (!newSectorName.trim()) {
      addToast("warning", "请输入板块名称", "板块名称不能为空！");
      return;
    }
    const name = newSectorName.trim();
    const layout = newSectorLayout;
    
    const newCatId = "cat_" + Date.now();
    const newCategories = [...categories, { id: newCatId, name, layout }];
    setCategories(newCategories);

    // Initial project for this category
    const newProjId = Date.now();
    const newProj: PortfolioProject = {
      id: newProjId,
      categoryId: newCatId,
      title: "全新类别代表性设计项目 // " + name,
      subtitle: "BRAND DESIGN MATRIX // 产品视觉重塑",
      category: name + " 【精修设计案例】",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
      desc: "在开启编辑状态后，直接双击此大字模块修改说明，更换图片。让客户感受极致产品逻辑。",
      specs: [{ tag: "Premium Shell Process 顶奢工艺质地" }],
      metrics: [{ label: "A/B CVR Boost 转化增长", val: "+24.5%", remark: "Based on final visual optimization" }],
      mainImages: [{ id: Date.now() + 1, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", label: "01 / 亚马逊主图" }],
      aplusBlocks: []
    };

    setProjectsList([...projectsList, newProj]);
    setCurrentCategory(newCatId);
    setActiveProjectId(newProjId);
    setIsAddSectorOpen(false);
    
    addToast("success", "➕ 全新大类别创建成功", `已成功智造《${name}》子模块并加载缺省三维展页。`);
  };

  const addNewLobbyImageCard = () => {
    if (!isEditMode) return;
    
    const newProjId = Date.now();
    const newProj: PortfolioProject = {
      id: newProjId,
      categoryId: currentCategory,
      title: "点击修改此图片卡片名称 // Custom Item",
      subtitle: "VISUAL SHOWCASE // 自由添加画幅",
      category: "CUSTOM CASE 【自定义画格】",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
      desc: "双击此处添加描述，或在编辑状态下点击更图按钮上传高精细度 3D 渲染图 or Listing切图。",
      specs: [{ tag: "Custom Shell 极奢精雕工艺" }],
      metrics: [{ label: "CVR Boost 点击倍增", val: "+22%", remark: "A/B test proven" }],
      mainImages: [{ id: Date.now() + 1, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", label: "01 / 亚马逊主图" }],
      aplusBlocks: []
    };
    
    setProjectsList(prev => [...prev, newProj]);
    setActiveProjectId(newProjId);
    addToast("success", "➕ 全新产品卡片智造成功", "已成功向当前类别加入专有设计子项目，可在编辑状态下自由定制或更图。");
  };

  const deleteProjectCard = (projId: number) => {
    if (!isEditMode) return;
    const project = projectsList.find(p => p.id === projId);
    if (!project) return;
    
    // Unlocked free delete is active as requested by user
    setProjectsList(prev => prev.filter(p => p.id !== projId));
    
    if (activeProjectId === projId) {
      const remaining = projectsList.filter(p => p.id !== projId && p.categoryId === project.categoryId);
      if (remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      } else {
        const anyRemaining = projectsList.filter(p => p.id !== projId);
        if (anyRemaining.length > 0) {
          setActiveProjectId(anyRemaining[0].id);
        }
      }
    }
    
    addToast("success", "🗑️ 设计案例已删除", `已成功移除案例《${project.title.split(" // ")[0]}》。`);
  };

  const deleteCategory = (catId: string) => {
    if (!isEditMode) return;
    if (categories.length <= 1) {
      addToast("warning", "无法完成删除", "必须保留至少一个主要板块分类！");
      return;
    }
    
    if (confirmDeleteCatId !== catId) {
      setConfirmDeleteCatId(catId);
      addToast("info", "⚠️ 请再次点击 ✕ 确认删除板块", "该大分类以及其项下的所有设计子项目将会被一并清除，再次点击即可执行。");
      // Auto-reset confirmation state after 4 seconds
      setTimeout(() => {
        setConfirmDeleteCatId(prev => prev === catId ? null : prev);
      }, 4000);
      return;
    }

    setConfirmDeleteCatId(null);
    const nextCategories = categories.filter(c => c.id !== catId);
    const nextProjects = projectsList.filter(p => p.categoryId !== catId);
    setCategories(nextCategories);
    setProjectsList(nextProjects);

    const fallbackCat = nextCategories[0].id;
    setCurrentCategory(fallbackCat);
    
    const firstProj = nextProjects.filter(p => p.categoryId === fallbackCat);
    if (firstProj.length > 0) {
      setActiveProjectId(firstProj[0].id);
    }
    addToast("info", "✕ 板块删除成功", "已完美移除该板块分类及对应其项下所有设计。");
  };

  const handleAnkerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const currentUpload = activeUploadRef.current || activeUpload;
    if (!file || !currentUpload) return;

    // Toast immediate processing notification
    const toastId = addToast(
      "uploading", 
      "原画无损大图读取中 / Loading Lossless Image", 
      "符合极致清晰度要求，已取消一切智能压缩，直接加载本地高阶视网膜素材底图..."
    );

    const { type, indexOrId } = currentUpload;

    const reader = new FileReader();
    reader.onload = (event) => {
      // By direct user instruction: absolutely NO canvas scaling/compression! Uses 100% exact raw binary base64
      const rawBase64 = event.target?.result as string;
      const dbKey = "db_img_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      saveToIndexedDB(dbKey, rawBase64)
        .then(() => {
          applyCompressedImage(dbKey);
        })
        .catch((err) => {
          console.error("IndexedDB storage failed, using raw base64 as fallback", err);
          applyCompressedImage(rawBase64);
        });
    };
    reader.onerror = () => {
      removeToast(toastId);
      addToast("error", "文件读取失败 / Read Failed", "本地图片媒介载入失败，请检查文件可用度。");
    };
    reader.readAsDataURL(file);

    const applyCompressedImage = (base64Url: string) => {
      setProjectsList(prev => prev.map(p => {
        if (type === 'projectThumbnail') {
          if (p.id === indexOrId) {
            return { ...p, img: base64Url };
          }
          return p;
        }

        if (p.id !== activeProjectId) return p;
        
        if (type === 'mainImage') {
          const updatedImages = p.mainImages.map(imgItem => 
            imgItem.id === indexOrId ? { ...imgItem, img: base64Url } : imgItem
          );
          return { ...p, mainImages: updatedImages };
        } else if (type.startsWith('aplusSlide_')) {
          const slideIdx = parseInt(type.split('_')[1], 10);
          const updatedAplus = p.aplusBlocks.map(block => {
            if (block.id === indexOrId) {
              const currentSlides = getBlockSlides(block);
              const updatedSlides = currentSlides.map((slide, sIdx) => 
                sIdx === slideIdx ? { ...slide, img: base64Url } : slide
              );
              return { ...block, carouselSlides: updatedSlides };
            }
            return block;
          });
          return { ...p, aplusBlocks: updatedAplus };
        } else if (type.startsWith('aplusGridCard_')) {
          const cardIdx = parseInt(type.split('_')[1], 10);
          const updatedAplus = p.aplusBlocks.map(block => {
            if (block.id === indexOrId) {
              const currentCards = getBlockGridCards(block);
              const updatedCards = currentCards.map((card, cIdx) => 
                cIdx === cardIdx ? { ...card, img: base64Url } : card
              );
              return { ...block, gridCards: updatedCards };
            }
            return block;
          });
          return { ...p, aplusBlocks: updatedAplus };
        } else {
          const updatedAplus = p.aplusBlocks.map(block => 
            block.id === indexOrId ? {
              ...block,
              premiumImg: type === 'aplusPremium' ? base64Url : block.premiumImg,
              competitorImg: type === 'aplusCompetitor' ? base64Url : block.competitorImg,
              isComparing: type === 'aplusCompetitor' ? true : false
            } : block
          );
          return { ...p, aplusBlocks: updatedAplus };
        }
      }));

      removeToast(toastId);
      addToast(
        "success", 
        "素材大图上传并自动保存成功 / Image Saved", 
        "图片素材已成功载入，且已为您实时自动持久化保存！刷新或关闭页面也绝不丢失。"
      );
      window.dispatchEvent(new Event("ae_unsaved_change"));
      
      // Clear file field value to allow re-upload of same file
      e.target.value = "";
      activeUploadRef.current = null;
      setActiveUpload(null);
    };
  };

  const triggerUploadField = (type: string, id: number) => {
    const uploadData = { type, indexOrId: id };
    activeUploadRef.current = uploadData;
    setActiveUpload(uploadData);
    const uploader = document.getElementById('hiddenAnkerImageFileField') as HTMLInputElement;
    if (uploader) {
      uploader.value = "";
      uploader.click();
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLElement>, type: string, indexOrId: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-[#00d2ff]");
    e.currentTarget.classList.remove("border-rose-500");
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      addToast("error", "文件格式不符 / Bad Format", "拖入的文件不是有效的图片媒体资源。");
      return;
    }

    const uploadData = { type, indexOrId };
    activeUploadRef.current = uploadData;
    setActiveUpload(uploadData);

    const toastId = addToast(
      "uploading", 
      "拖入原画无损大图读取中 / Dragged Image Loading", 
      "已实时捕捉拖拽图像，直接加载本地高阶视网膜底图..."
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const dbKey = "db_img_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      
      saveToIndexedDB(dbKey, rawBase64)
        .then(() => {
          setProjectsList(prev => prev.map(p => {
            if (type === 'projectThumbnail') {
              if (p.id === indexOrId) {
                return { ...p, img: dbKey };
              }
              return p;
            }

            if (p.id !== activeProjectId) return p;
            
            if (type === 'mainImage') {
              const updatedImages = p.mainImages.map(imgItem => 
                imgItem.id === indexOrId ? { ...imgItem, img: dbKey } : imgItem
              );
              return { ...p, mainImages: updatedImages };
            } else if (type.startsWith('aplusSlide_')) {
              const slideIdx = parseInt(type.split('_')[1], 10);
              const updatedAplus = p.aplusBlocks.map(block => {
                if (block.id === indexOrId) {
                  const currentSlides = getBlockSlides(block);
                  const updatedSlides = currentSlides.map((slide, sIdx) => 
                    sIdx === slideIdx ? { ...slide, img: dbKey } : slide
                  );
                  return { ...block, carouselSlides: updatedSlides };
                }
                return block;
              });
              return { ...p, aplusBlocks: updatedAplus };
            } else if (type.startsWith('aplusGridCard_')) {
              const cardIdx = parseInt(type.split('_')[1], 10);
              const updatedAplus = p.aplusBlocks.map(block => {
                if (block.id === indexOrId) {
                  const currentCards = getBlockGridCards(block);
                  const updatedCards = currentCards.map((card, cIdx) => 
                    cIdx === cardIdx ? { ...card, img: dbKey } : card
                  );
                  return { ...block, gridCards: updatedCards };
                }
                return block;
              });
              return { ...p, aplusBlocks: updatedAplus };
            } else {
              const updatedAplus = p.aplusBlocks.map(block => 
                block.id === indexOrId ? {
                  ...block,
                  premiumImg: type === 'aplusPremium' ? dbKey : block.premiumImg,
                  competitorImg: type === 'aplusCompetitor' ? dbKey : block.competitorImg,
                  isComparing: type === 'aplusCompetitor' ? true : false
                } : block
              );
              return { ...p, aplusBlocks: updatedAplus };
            }
          }));

          removeToast(toastId);
          addToast(
            "success", 
            "拖拽图片配置成功 / Drag Drop Success", 
            "拖入的核心大画幅素材已无缝转换为高阶数据源并持久化写入系统！"
          );
          activeUploadRef.current = null;
          setActiveUpload(null);
        })
        .catch((err) => {
          console.error("IndexedDB storage failed on drop, fallback to raw base64:", err);
          setProjectsList(prev => prev.map(p => {
            if (type === 'projectThumbnail') {
              if (p.id === indexOrId) {
                return { ...p, img: rawBase64 };
              }
              return p;
            }

            if (p.id !== activeProjectId) return p;
            
            if (type === 'mainImage') {
              const updatedImages = p.mainImages.map(imgItem => 
                imgItem.id === indexOrId ? { ...imgItem, img: rawBase64 } : imgItem
              );
              return { ...p, mainImages: updatedImages };
            } else if (type.startsWith('aplusSlide_')) {
              const slideIdx = parseInt(type.split('_')[1], 10);
              const updatedAplus = p.aplusBlocks.map(block => {
                if (block.id === indexOrId) {
                  const currentSlides = getBlockSlides(block);
                  const updatedSlides = currentSlides.map((slide, sIdx) => 
                    sIdx === slideIdx ? { ...slide, img: rawBase64 } : slide
                  );
                  return { ...block, carouselSlides: updatedSlides };
                }
                return block;
              });
              return { ...p, aplusBlocks: updatedAplus };
            } else if (type.startsWith('aplusGridCard_')) {
              const cardIdx = parseInt(type.split('_')[1], 10);
              const updatedAplus = p.aplusBlocks.map(block => {
                if (block.id === indexOrId) {
                  const currentCards = getBlockGridCards(block);
                  const updatedCards = currentCards.map((card, cIdx) => 
                    cIdx === cardIdx ? { ...card, img: rawBase64 } : card
                  );
                  return { ...block, gridCards: updatedCards };
                }
                return block;
              });
              return { ...p, aplusBlocks: updatedAplus };
            } else {
              const updatedAplus = p.aplusBlocks.map(block => 
                block.id === indexOrId ? {
                  ...block,
                  premiumImg: type === 'aplusPremium' ? rawBase64 : block.premiumImg,
                  competitorImg: type === 'aplusCompetitor' ? rawBase64 : block.competitorImg,
                  isComparing: type === 'aplusCompetitor' ? true : false
                } : block
              );
              return { ...p, aplusBlocks: updatedAplus };
            }
          }));

          removeToast(toastId);
          addToast(
            "success", 
            "拖拽图片配置成功 / Drag Drop Success", 
            "拖入的核心大画幅素材已无缝转换为高阶数据源并持久化写入系统！"
          );
          activeUploadRef.current = null;
          setActiveUpload(null);
        });
    };

    reader.onerror = () => {
      removeToast(toastId);
      addToast("error", "拖入图片读取失败 / Read Failed", "读取拖拽图片文件失败。");
    };
    reader.readAsDataURL(file);
  };

  const handleAddMainImage = () => {
    if (!isEditMode) return;
    const newImage: MainImageItem = {
      id: Date.now(),
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
      label: `0${activeProject.mainImages.length + 1} / 自定义附图卖点`
    };
    updateProjectField(
      "mainImages", 
      [...activeProject.mainImages, newImage],
      false,
      "成功添加附图卖点 / Card Added",
      "已追加自定附图，可双击更换文本或点击相机重新上传专属特写。"
    );
  };

  const handleDeleteMainImage = (id: number) => {
    if (!isEditMode) return;
    updateProjectField(
      "mainImages", 
      activeProject.mainImages.filter(imgItem => imgItem.id !== id),
      false,
      "成功删除附图卖点 / Card Removed",
      "该自定义图片与对应的卖点配置已成功移除。"
    );
  };

  const handleAddAplusBlock = (force = false) => {
    if (!isEditMode && !force) return;
    const newAplus: AplusBlockItem = {
      id: Date.now(),
      title: `0${activeProject.aplusBlocks.length + 1} / Chapter: Custom Long Sea Brand-Banner (1464x600)`,
      desc: "点击相应文本直接修改，悬滑点击上传按钮替换高品质精绘本地渲染资源，并可随时设定对标同行对比版版式。",
      premiumImg: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=1464&h=600",
      competitorImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1464&h=600",
      competitorTitle: "!!! COMPETITOR RAW UNPLANNED GRAPHIC !!!",
      competitorDesc: "在这里自定义该块区中劣质品牌对手平庸白底设计弱点与材质叙事空白点。",
      isComparing: false,
      imgFit: "cover"
    };
    updateProjectField(
      "aplusBlocks", 
      [...activeProject.aplusBlocks, newAplus],
      false,
      "成功添加 A+ 巨幕版式 / Block Added",
      "已在底部追加了全新 1464x600 像素的高阶 A+ Banner 板块。"
    );
  };

  const handleDeleteAplusBlock = (id: number) => {
    if (!isEditMode) return;
    updateProjectField(
      "aplusBlocks", 
      activeProject.aplusBlocks.filter(block => block.id !== id),
      false,
      "成功移除 A+ 板块 / Block Removed",
      "对应的 A+ 对标与卖点巨幕板块已被成功移除。"
    );
  };

  const handleMoveBlock = (id: number, direction: "up" | "down") => {
    if (!isEditMode) return;
    const blocks = [...activeProject.aplusBlocks];
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    
    // Swap
    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;
    
    updateProjectField(
      "aplusBlocks",
      blocks,
      false,
      "重排 A+ 图像流 / Reordered Flow",
      `已成功将本板块${direction === "up" ? "向上" : "向下"}微移，长图视觉顺畅度已刷新。`
    );
  };

  const toggleAplusCompareLocal = (blockId: number, isComparing: boolean) => {
    const updated = activeProject.aplusBlocks.map(b => 
      b.id === blockId ? { ...b, isComparing } : b
    );
    updateProjectField(
      "aplusBlocks", 
      updated,
      false,
      isComparing ? "对标同行模式开启 / Comparison Active" : "经典单图模式开启 / Standard Active",
      isComparing ? "已开启高阶 Amazon Premium A+ 上下对标画廊布局" : "已还原为经典高溢价工业长图宽屏美学视觉"
    );
  };

  const updateCompareRowCell = (blockId: number, rowIndex: number, key: keyof AplusCompareRow, newVal: string) => {
    const updated = activeProject.aplusBlocks.map(b => {
      if (b.id !== blockId) return b;
      const currentRows = getBlockCompareRows(b);
      const newRows = currentRows.map((row, rIdx) => 
        rIdx === rowIndex ? { ...row, [key]: newVal } : row
      );
      return { ...b, compareRows: newRows };
    });
    updateProjectField("aplusBlocks", updated, false);
  };

  const updateHotspotCell = (blockId: number, hotspotIndex: number, key: keyof AplusHotspot, newVal: string) => {
    const updated = activeProject.aplusBlocks.map(b => {
      if (b.id !== blockId) return b;
      const currentHotspots = getBlockHotspots(b);
      const newHotspots = currentHotspots.map((h, hIdx) => 
        hIdx === hotspotIndex ? { ...h, [key]: newVal } : h
      );
      return { ...b, hotspots: newHotspots };
    });
    updateProjectField("aplusBlocks", updated, false);
  };

  const updateSlideCell = (blockId: number, slideIndex: number, key: keyof AplusSlide, newVal: string) => {
    const updated = activeProject.aplusBlocks.map(b => {
      if (b.id !== blockId) return b;
      const currentSlides = getBlockSlides(b);
      const newSlides = currentSlides.map((s, sIdx) => 
        sIdx === slideIndex ? { ...s, [key]: newVal } : s
      );
      return { ...b, carouselSlides: newSlides };
    });
    updateProjectField("aplusBlocks", updated, false);
  };

  const updateGridCardCell = (blockId: number, cardIndex: number, key: keyof AplusGridCard, newVal: string) => {
    const updated = activeProject.aplusBlocks.map(b => {
      if (b.id !== blockId) return b;
      const currentCards = getBlockGridCards(b);
      const newCards = currentCards.map((c, cIdx) => 
        cIdx === cardIndex ? { ...c, [key]: newVal } : c
      );
      return { ...b, gridCards: newCards };
    });
    updateProjectField("aplusBlocks", updated, false);
  };

  const handleExportSpecifications = () => {
    const specStr = `=========================================
AMAZON PREMIUM PORTFOLIO SPECIFICATION SHEET
-----------------------------------------
Selected Series Line: ${activeProject.title}
Subtitle Concept: ${activeProject.subtitle}
Core Category: ${activeProject.category}
Brief Intro Text: ${activeProject.desc}

[ Custom 1:1 Listing Images Flow ]
${activeProject.mainImages.map((m, i) => `${i + 1}. Label: ${m.label} -> Source Image: ${m.img}`).join('\n')}

[ Premium A+ Wide Banner Chapters (1464x600) ]
${activeProject.aplusBlocks.map((b, i) => `
Module #${i + 1}: ${b.title}
- Brief Desc: ${b.desc}
- Premium Display Image: ${b.premiumImg}
- Competitor Drawbacks Comparison Note [Title]: ${b.competitorTitle}
- Competitor Drawbacks Description: ${b.competitorDesc}
- Competitor Low-tier Image Link: ${b.competitorImg}
`).join('\n')}
=========================================`;

    navigator.clipboard.writeText(specStr).then(() => {
      alert("🎉 顶级出海视觉智造文案与画册规格（SPEC）已完美复制至系统剪贴板！\n\nAll brand copy specifications, material descriptors, design links, and comparisons have been successfully saved to your deviceclipboard.");
    }).catch(err => {
      console.error(err);
      alert("Specs 已为您输出至控制台，复制失败原因: " + err);
    });
  };

  // Filter project cards helper
  const filteredProjects = projectsList.filter(p => {
    const isCategoryMatch = p.categoryId === currentCategory || (!p.categoryId && currentCategory === "storage");
    const q = filterQuery.toLowerCase();
    const isSearchMatch = p.title.toLowerCase().includes(q) || 
                          p.category.toLowerCase().includes(q) || 
                          p.desc.toLowerCase().includes(q);
    return isCategoryMatch && isSearchMatch;
  });

  const activeCategoryObj = categories.find(c => c.id === currentCategory);
  const currentLayout = activeCategoryObj ? activeCategoryObj.layout : "asymmetrical";

  // Class styling overrides for each layout
  const gridContainerClass = currentLayout === "bento"
    ? "grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-auto"
    : currentLayout === "grid3"
    ? "grid grid-cols-1 md:grid-cols-3 gap-8"
    : "grid grid-cols-1 lg:grid-cols-12 gap-8";

  const getWideSpanClass = () => {
    if (currentLayout === "bento") return "md:col-span-2";
    return "lg:col-span-8";
  };

  const getStdSpanClass = () => {
    if (currentLayout === "bento") return "md:col-span-1";
    if (currentLayout === "grid3") return "md:col-span-1";
    return "lg:col-span-4";
  };

  return (
    <div className="relative space-y-8 text-left bg-[#06080d] text-zinc-100 p-4 sm:p-6 md:p-10 rounded-3xl border border-white/5 overflow-hidden min-h-[700px]">
      
      {/* Dynamic ambient back glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0066ff]/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#00d2ff]/5 blur-[155px] pointer-events-none z-0"></div>

      {/* Embedded Navigation Header */}
      <header className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center space-x-3">
          <DeletableWrapper id="labs_header_shield_logo" isEditMode={isEditMode} label="安全盾牌Logo / Shield Logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] flex items-center justify-center shadow-lg shadow-[#0066ff]/20">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
          </DeletableWrapper>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-widest text-xs text-white block uppercase font-mono">
              <DeletableText
                id="labs_header_title_v2"
                defaultText="AEROCORE LABS // EXTREME PLATFORM"
                isEditMode={isEditMode}
              />
            </span>
            <div className="text-[9px] text-zinc-500 font-mono">
              <DeletableText
                id="labs_header_subtitle_v2"
                defaultText="Amazon A+ Content Simulator & Listing Audit Engine"
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </div>

        {/* 导航切页 (Exact implementation of tabs based on user spec - optimized for mobile horizontal scroll) */}
        <nav className="flex overflow-x-auto scrollbar-none whitespace-nowrap space-x-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold self-stretch md:self-center max-w-full">
          <button 
            type="button"
            onClick={() => setSubView("lobby")} 
            className={`px-4 py-2 rounded-lg smooth-transition uppercase tracking-wider font-mono text-[10px] cursor-pointer flex-shrink-0 ${subView === "lobby" ? "bg-white/5 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            大师实战案例库 / Lobby
          </button>
          <button 
            type="button"
            onClick={() => setSubView("detail")} 
            className={`px-4 py-2 rounded-lg smooth-transition uppercase tracking-wider font-mono text-[10px] cursor-pointer flex-shrink-0 ${subView === "detail" ? "bg-white/5 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            参数故事解析页 / Story Detail
          </button>
          <button 
            type="button"
            onClick={() => setSubView("sandbox")} 
            className={`px-4 py-2 rounded-lg smooth-transition uppercase tracking-wider font-mono text-[10px] cursor-pointer flex-shrink-0 ${subView === "sandbox" ? "bg-white/5 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            A+ 互动沙盒 / Custom Sandbox
          </button>
        </nav>
      </header>

      {/* MAIN VIEWPORT DYNAMIC CONTENT PANEL */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ================= 视图 1：大师实战案例库 (LOBBY VIEW) ================= */}
          {subView === "lobby" && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              {/* Slogan Banner */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-white/[0.01] to-transparent border border-white/5 text-left space-y-3">
                <span className="text-[10px] text-zinc-500 tracking-widest font-bold uppercase block font-mono">// OUTBOUND LEADERBOARD BRANDING / 亚马逊高端品牌视觉研制</span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-none font-sans">
                  SCULPTING METRICS IN <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">HARDCORE GLASS.</span>
                </h1>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-3xl font-sans">
                  结合苹果极简留白叙事与正浩硬核3D结构渲染。我们为出海高溢价产品量身定制从 Listing 主图至 Premium A+ 的全套转化率视觉系统。
                </p>
              </div>

              {/* 分类板块导航栏（Anker风格） */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-white/5 pb-4 gap-4" id="categoryNavSection">
                <div className="flex space-x-2 overflow-x-auto scrollbar-none py-1" id="categoryTabs">
                  {categories.map(cat => {
                    const isSelected = cat.id === currentCategory;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setCurrentCategory(cat.id);
                          // Default select first product under this category
                          const catProjs = projectsList.filter(p => p.categoryId === cat.id || (!p.categoryId && cat.id === "storage"));
                          if (catProjs.length > 0) {
                            setActiveProjectId(catProjs[0].id);
                          }
                        }}
                        className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? "border-[#0066ff] bg-[#0066ff]/10 text-[#00d2ff] shadow-lg shadow-[#0066ff]/10 font-bold" 
                            : "border-white/5 bg-white/[0.01] text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isEditMode && categories.length > 1 && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(cat.id);
                            }}
                            className={`pl-1.5 font-mono transition-all duration-300 ${
                              confirmDeleteCatId === cat.id 
                                ? "text-white bg-red-600 px-1.5 py-0.5 rounded text-[10px] animate-pulse font-bold" 
                                : "text-red-500 hover:text-red-400"
                            }`}
                            title="删除此分类板块 / Delete Category"
                          >
                            {confirmDeleteCatId === cat.id ? "✕ 确认删除?" : "✕"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {isEditMode && (
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={promptAddCategory} 
                      className="px-4 py-2 rounded-xl bg-[#0066ff]/10 hover:bg-[#0066ff]/20 border border-[#0066ff]/30 text-xs font-semibold text-[#00d2ff] flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#00d2ff]" />
                      <span>新增板块 / Add Sector</span>
                    </button>
                    <button 
                      type="button"
                      onClick={addNewLobbyImageCard} 
                      className="px-4 py-2 rounded-xl bg-[#0066ff]/10 hover:bg-[#0066ff]/20 border border-[#0066ff]/30 text-xs font-semibold text-[#00d2ff] flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-[#00d2ff]" />
                      <span>添加卡片板块 / Add Card</span>
                    </button>
                  </div>
                )}
              </div>



              {/* Dynamic Project Grid */}
              <div className={gridContainerClass}>
                {filteredProjects.map((p, index) => {
                  const isWide = (currentLayout !== "grid3") && index === 0 && filteredProjects.length > 1;
                  return isWide ? (
                    <div 
                      key={p.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[contenteditable="true"]') || target.closest('.edit-control') || target.closest('button') || target.closest('input')) {
                          return;
                        }
                        setActiveProjectId(p.id);
                        setSubView("detail");
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (isEditMode) {
                          triggerUploadField('projectThumbnail', p.id);
                        }
                      }}
                      onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                      onDragEnter={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                      onDragLeave={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                      onDrop={(e) => { 
                        if (isEditMode) {
                          e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                          handleImageDrop(e, 'projectThumbnail', p.id);
                        }
                      }}
                      className={`group relative rounded-3xl bg-[#0f111a]/50 border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#0066ff]/40 hover:shadow-[0_0_35px_rgba(0,102,255,0.08)] cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-6 p-8 font-sans text-left ${getWideSpanClass()}`}
                    >
                      {/* Left Side: 7/12 columns - Description & Telemetric Performance Table */}
                      <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                        <div>
                          <span 
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateProjectFieldById(p.id, "subtitle", e.currentTarget.innerText)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-orange-500 tracking-widest font-extrabold block mb-1 uppercase font-mono outline-none"
                          >
                            // {p.subtitle}
                          </span>
                          <h3 
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateProjectFieldById(p.id, "title", e.currentTarget.innerText)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xl font-black text-white hover:text-[#00d2ff] transition-colors outline-none leading-tight mb-3"
                          >
                            {p.title}
                          </h3>
                          <p 
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateProjectFieldById(p.id, "desc", e.currentTarget.innerText)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-400 text-xs leading-relaxed font-light outline-none"
                          >
                            {p.desc}
                          </p>
                          
                          {/* Precision Materials */}
                          <div className="mt-4 flex flex-wrap gap-1.5 pt-1 text-left">
                            {p.specs.map((spec, i) => (
                              <span 
                                key={i} 
                                contentEditable={isEditMode}
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const val = e.currentTarget.innerText;
                                  const nextSpecs = [...p.specs];
                                  nextSpecs[i] = { tag: val };
                                  updateProjectFieldById(p.id, "specs", nextSpecs);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-[9px] text-zinc-400 font-bold outline-none"
                              >
                                {spec.tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Metric Performance Data Table */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                          <span className="text-[8.5px] text-zinc-500 tracking-wider font-extrabold block uppercase font-mono">
                            // TELEMETRIC PERFORMANCE / 核心出海能效参数
                          </span>
                          <div className="space-y-2">
                            {p.metrics.map((m, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                                <span className="font-bold text-zinc-400">{m.label}</span>
                                <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 font-extrabold text-[10.5px]">
                                  {m.val}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive guidance tip */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono tracking-wider text-zinc-500">
                          <span className="uppercase font-bold">
                            💡 单击深度故事 / CLICK DETAIL
                          </span>
                          <span className="text-[#00d2ff] font-extrabold animate-pulse">
                            ⚡ 双击直达 A+ 沙盒 重构 ➜
                          </span>
                        </div>
                      </div>

                      {/* Right Side: 5/12 columns - aspect square photo view */}
                      <div className="md:col-span-5 relative aspect-square bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-6 peer">
                        <SafeImage 
                          src={p.img} 
                          className={`max-w-[90%] max-h-[90%] object-contain transition-transform duration-700 group-hover:scale-102 ${
                            p.imgFit === "contain" 
                              ? "object-contain" 
                              : p.imgFit === "auto"
                              ? "object-contain max-h-full mx-auto"
                              : "object-contain"
                          }`} 
                          alt={p.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* Edit commands on image overlay */}
                        {isEditMode && (
                          <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerUploadField('projectThumbnail', p.id);
                              }}
                              className="p-1.5 px-3 bg-[#0066ff] hover:bg-[#00d2ff] border border-white/15 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-black/50 active:scale-95"
                              title="更换此案例主图 / Upload Custom Main Image"
                            >
                              <Camera className="w-3" />
                              <span>更图 / Edit Img</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextFit = p.imgFit === "contain" ? "auto" : p.imgFit === "auto" ? "cover" : "contain";
                                updateProjectFieldById(p.id, "imgFit", nextFit);
                                addToast(
                                  "info", 
                                  "图片自适应等比切换 / Ratio Adapt Changed", 
                                  `已自适应切换该案例主图为：【${nextFit === "contain" ? "包含等比 / Contain" : nextFit === "auto" ? "全自适应 / Auto" : "裁剪填充 / Cover"}】`
                                );
                                window.dispatchEvent(new Event("ae_unsaved_change"));
                              }}
                              className="p-1.5 px-2.5 bg-black/80 hover:bg-zinc-800 border border-white/10 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="图片上传自适应等比切换 / Toggle Image Contain, Auto, or Cover"
                            >
                              <Sliders className="w-3" />
                              <span>{p.imgFit === "contain" ? "等比 / Contain" : p.imgFit === "auto" ? "自适应 / Auto" : "裁剪 / Cover"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProjectCard(p.id);
                              }}
                              className="p-1.5 px-2.5 bg-red-650/40 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="物理删除设计案例 / Delete Project Card"
                            >
                              <Trash2 className="w-3" />
                              <span>删除 / Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Standard Card (compact code block col-span-4)
                    <div 
                      key={p.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[contenteditable="true"]') || target.closest('.edit-control') || target.closest('button') || target.closest('input')) {
                          return;
                        }
                        setActiveProjectId(p.id);
                        setSubView("detail");
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (isEditMode) {
                          triggerUploadField('projectThumbnail', p.id);
                        }
                      }}
                      onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                      onDragEnter={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                      onDragLeave={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                      onDrop={(e) => { 
                        if (isEditMode) {
                          e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                          handleImageDrop(e, 'projectThumbnail', p.id);
                        }
                      }}
                      className={`group relative rounded-2xl bg-[#0f111a]/50 border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#0066ff]/40 hover:shadow-[0_0_35px_rgba(0,102,255,0.08)] cursor-pointer flex flex-col justify-between font-sans ${getStdSpanClass()}`}
                    >
                      {/* Image Box */}
                      <div className="relative z-50 aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5 overflow-hidden flex items-center justify-center p-6 peer">
                        <SafeImage 
                          src={p.img} 
                          className={`max-w-[85%] max-h-[85%] object-contain transition-transform duration-700 group-hover:scale-102 ${
                            p.imgFit === "contain" 
                              ? "object-contain" 
                              : p.imgFit === "auto"
                              ? "object-contain max-h-full mx-auto"
                              : "object-contain"
                          }`} 
                          alt={p.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* Immediate Float Actions inside the card image only when editing */}
                        {isEditMode && (
                          <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerUploadField('projectThumbnail', p.id);
                              }}
                              className="p-1.5 px-3 bg-[#0066ff] hover:bg-[#00d2ff] border border-white/15 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-black/50 active:scale-95"
                              title="更换此案例主图 / Upload Custom Main Image"
                            >
                              <Camera className="w-3" />
                              <span>更图 / Edit Img</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextFit = p.imgFit === "contain" ? "auto" : p.imgFit === "auto" ? "cover" : "contain";
                                updateProjectFieldById(p.id, "imgFit", nextFit);
                                addToast(
                                  "info", 
                                  "图片自适应等比切换 / Ratio Adapt Changed", 
                                  `已自适应切换该案例主图为：【${nextFit === "contain" ? "包含等比 / Contain" : nextFit === "auto" ? "全自适应 / Auto" : "裁剪填充 / Cover"}】`
                                );
                                window.dispatchEvent(new Event("ae_unsaved_change"));
                              }}
                              className="p-1.5 px-2.5 bg-black/80 hover:bg-zinc-800 border border-white/10 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="图片上传自适应等比切换 / Toggle Image Contain, Auto, or Cover"
                            >
                              <Sliders className="w-3" />
                              <span>{p.imgFit === "contain" ? "等比 / Contain" : p.imgFit === "auto" ? "自适应 / Auto" : "裁剪 / Cover"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProjectCard(p.id);
                              }}
                              className="p-1.5 px-2.5 bg-red-650/40 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-white rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="物理删除设计案例 / Delete Project Card"
                            >
                              <Trash2 className="w-3" />
                              <span>删除 / Delete</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Standard static card details */}
                      <div className="p-6 space-y-2 text-left">
                        <span className="text-[10px] text-[#00d2ff] font-bold tracking-widest uppercase font-mono block">
                          {p.category}
                        </span>
                        <h3 className="text-base font-extrabold text-white group-hover:text-[#00d2ff] transition-colors duration-300 font-sans">
                          {p.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {p.desc}
                        </p>
                      </div>

                      {/* DYNAMIC HOVER OVERLAY */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-[65%] bg-[#070b14]/98 border-t border-[#0066ff]/20 rounded-b-2xl backdrop-blur-xl p-5 z-[60] flex flex-col justify-between transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0 select-text overflow-y-auto cursor-pointer"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('[contenteditable="true"]') || target.closest('.edit-control') || target.closest('button') || target.closest('input')) {
                            e.stopPropagation();
                            return;
                          }
                          setActiveProjectId(p.id);
                          setSubView("detail");
                        }}
                      >
                        <div className="space-y-3.5 text-left">
                          <div className="flex items-center justify-between">
                            <span 
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              onBlur={(e) => updateProjectFieldById(p.id, "subtitle", e.currentTarget.innerText)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[9px] text-orange-500 tracking-widest font-extrabold block uppercase font-mono outline-none"
                            >
                              // {p.subtitle}
                            </span>
                            <span className="text-[8px] bg-[#0066ff]/15 text-[#00d2ff] border border-[#0066ff]/35 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                              参数解析 / SPECS LIVE
                            </span>
                          </div>

                          {/* Title & Desc */}
                          <div className="space-y-1">
                            <h4 
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              onBlur={(e) => updateProjectFieldById(p.id, "title", e.currentTarget.innerText)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[14px] font-black text-white hover:text-[#00d2ff] transition-colors outline-none leading-tight"
                            >
                              {p.title}
                            </h4>
                            <p 
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              onBlur={(e) => updateProjectFieldById(p.id, "desc", e.currentTarget.innerText)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10.5px] text-zinc-400 leading-relaxed font-light line-clamp-3 outline-none"
                            >
                              {p.desc}
                            </p>
                          </div>

                          {/* Precision Materials */}
                          <div className="space-y-1.5 pt-1.5 text-left">
                            <span className="text-[8.5px] text-zinc-500 tracking-wider font-extrabold block uppercase font-mono">
                              // PRECISION MATERIALS MODELED
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.specs.map((spec, i) => (
                                <span 
                                  key={i} 
                                  contentEditable={isEditMode}
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    const val = e.currentTarget.innerText;
                                    const nextSpecs = [...p.specs];
                                    nextSpecs[i] = { tag: val };
                                    updateProjectFieldById(p.id, "specs", nextSpecs);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md text-[9px] text-zinc-300 font-bold outline-none font-sans hover:border-[#0066ff]/30"
                                >
                                  {spec.tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Metrics Table */}
                          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                            <span className="text-[8.5px] text-zinc-500 tracking-wider font-extrabold block uppercase font-mono">
                              // TELEMETRIC PERFORMANCE / 核心出海能效参数
                            </span>
                            <div className="space-y-2">
                              {p.metrics.map((m, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                                  <span className="font-bold text-[#00d2ff]">{m.label}</span>
                                  <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 font-extrabold text-[10.5px]">
                                    {m.val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Guidance bar */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono tracking-wider text-zinc-400">
                          <span className="uppercase text-zinc-500 font-bold">
                            💡 单击深度故事 / CLICK DETAIL
                          </span>
                          <span className="text-[#00d2ff] font-extrabold animate-pulse">
                            ⚡ 双击直达 A+ 沙盒 重构 ➜
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <div className="col-span-full border border-dashed border-white/10 rounded-2xl bg-zinc-950/20 py-16 px-6 text-center space-y-4">
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                      此板块暂无设计案例产品 / This category section has no items. 
                      <br />
                      单击顶部 【添加卡片板块 / Add Card】 按钮即可直接自由定制智造全新产品卡片！
                    </p>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={addNewLobbyImageCard}
                        className="px-4 py-2 rounded-xl bg-[#0066ff]/20 hover:bg-[#0066ff]/35 border border-[#0066ff]/50 text-[11px] font-semibold text-[#00d2ff] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>➕ 立即添加产品卡片 / Add Card</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= 视图 2：案例故事解析页 (DETAIL VIEW) ================= */}
          {subView === "detail" && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Visual Highlight Cards with double-click transfer shortcut */}
              <div className="lg:col-span-7 space-y-4">
                <div 
                  onDoubleClick={(e) => {
                    if (isEditMode) {
                      e.stopPropagation();
                      triggerUploadField('projectThumbnail', activeProject.id);
                    }
                  }}
                  onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                  onDragEnter={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                  onDragLeave={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                  onDrop={(e) => { 
                    if (isEditMode) {
                      e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                      handleImageDrop(e, 'projectThumbnail', activeProject.id);
                    }
                  }}
                  className="relative aspect-square rounded-3xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center group shadow-2xl transition-all font-sans"
                >
                  <SafeImage 
                    src={activeProject.img} 
                    className={`w-full transition-transform duration-700 group-hover:scale-103 ${
                      activeProject.imgFit === "contain" 
                        ? "h-full object-contain bg-zinc-950/85 p-6" 
                        : activeProject.imgFit === "auto"
                        ? "h-auto max-h-full object-contain mx-auto"
                        : "h-full object-cover"
                    }`} 
                    alt={activeProject.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 group-hover:via-black/50 transition-all duration-300 pointer-events-none"></div>
                  
                  {/* Immediate Float Actions inside detail big image container */}
                  {isEditMode && (
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity peer">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerUploadField('projectThumbnail', activeProject.id);
                        }}
                        className="p-2 px-4 bg-[#0066ff] hover:bg-[#00d2ff] border border-white/15 text-white rounded-lg text-[10px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-black/50 active:scale-95"
                        title="上传自定义原图（自适应宽高）"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>换图 / Custom Img</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextFit = activeProject.imgFit === "contain" ? "auto" : activeProject.imgFit === "auto" ? "cover" : "contain";
                          updateProjectFieldById(activeProject.id, "imgFit", nextFit);
                          addToast(
                            "info", 
                            "大图自适应 / Ratio Fit Changed", 
                            `当前大图自适应模式已更改为：【${nextFit === "contain" ? "整图等比缩放 / Contain" : nextFit === "auto" ? "全自适应 / Auto" : "满框裁剪填充 / Cover"}】`
                          );
                          window.dispatchEvent(new Event("ae_unsaved_change"));
                        }}
                        className="p-2 px-3 bg-black/80 hover:bg-zinc-800 border border-white/10 text-white rounded-lg text-[10px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="切换等比缩放、全自适应、包含自适应适配"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>{activeProject.imgFit === "contain" ? "等比 / Contain" : activeProject.imgFit === "auto" ? "自适应 / Auto" : "裁切 / Cover"}</span>
                      </button>
                    </div>
                  )}

                  {/* Absolute Center Trigger Actions Console */}
                  <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-305 bg-black/60 backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto peer-hover:!opacity-0 peer-hover:!pointer-events-none">
                    <span className="text-white font-mono text-[10px] tracking-widest uppercase font-bold text-center px-4">
                      ⚡ 极奢数智引擎 / Teleport Workspace
                    </span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSubView("sandbox");
                          addToast(
                            "success", 
                            "一键直达沙盒 / Custom Sandbox Active", 
                            `已传送至《${activeProject.title}》的仿真重绘面板！`
                          );
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#00d2ff] hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase shadow-lg shadow-[#0066ff]/25 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" /> A+ 精修排版改造 & 互动沙盒
                      </button>
                    </div>
                  </div>

                  {/* Dynamic pulse footer overlay */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/30 backdrop-blur-xl flex items-center justify-between text-xs text-white shadow-lg shadow-[#0066ff]/10 group-hover:opacity-0 transition-opacity">
                    <span className="font-bold flex items-center text-[10.5px]">
                      <Sparkles className="w-4 h-4 mr-2 text-[#00d2ff] animate-pulse" />
                      💡 鼠标放上来/双击，一键飞渡 A+ 重构互动沙盒工作台
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#00d2ff]" />
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest font-mono">
                    {activeProject.category}
                  </span>
                  <span className="text-[9px] text-[#00d2ff] font-bold tracking-widest uppercase font-mono">
                    Double-click Image to Customize
                  </span>
                </div>

                {/* On mobile: Quick transition button to A+ Sandbox */}
                <div className="lg:hidden w-full pt-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSubView("sandbox");
                      addToast(
                        "success", 
                        "已进入沙盒 / Custom Sandbox Active", 
                        `已成功进入《${activeProject.title}》的排版重构沙盒面板！`
                      );
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#0066ff] to-[#00d2ff] hover:opacity-95 active:scale-95 text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase shadow-lg shadow-[#0066ff]/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/5"
                  >
                    <Layers className="w-4 h-4 text-white" />
                    <span>进入 A+ 互动沙盒（手机特快通道）</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Case narratives, specs, and metrics lists */}
              <div className="lg:col-span-5 flex flex-col justify-between py-2 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] text-orange-500 tracking-widest font-extrabold block uppercase font-mono">
                    // {activeProject.subtitle}
                  </span>
                  
                  <h2 
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => updateProjectField("title", e.currentTarget.innerText)}
                    className="text-2xl md:text-3.5xl font-black text-white leading-tight outline-none"
                  >
                    {activeProject.title}
                  </h2>
                  
                  <p 
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => updateProjectField("desc", e.currentTarget.innerText)}
                    className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light outline-none"
                  >
                    {activeProject.desc}
                  </p>

                  {/* Render design-precise materials lists tags */}
                  <div className="space-y-3 pt-4">
                    <span className="text-[10px] text-zinc-500 tracking-wider font-extrabold block uppercase font-mono">// PRECISION MATERIALS MODELED</span>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.specs.map((spec, i) => (
                        <span 
                          key={i} 
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.innerText;
                            const nextSpecs = [...activeProject.specs];
                            nextSpecs[i] = { tag: val };
                            updateProjectField("specs", nextSpecs);
                          }}
                          className="px-2.5 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] text-zinc-350 font-bold outline-none font-sans"
                        >
                          {spec.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance indexes charts dashboard (Telemetric Specs) */}
                <div className="p-6 bg-[#0f111a]/40 border border-white/5 rounded-2xl space-y-4 shadow-xl">
                  <span className="text-[10px] text-zinc-500 tracking-wider font-extrabold block uppercase font-mono">
                    // TELEMETRIC PERFORMANCE / 核心出海能效参数
                  </span>
                  <div className="space-y-4">
                    {activeProject.metrics.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-white/5 last:border-0 pb-3 last:pb-0">
                        <div className="space-y-1 text-left">
                          <span className="font-bold text-zinc-300 block">{m.label}</span>
                          <span className="text-[9px] text-zinc-500 leading-none block">{m.remark}</span>
                        </div>
                        <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 font-mono">
                          {m.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= 视图 3：A+ 与主图互动编辑沙盒 (SANDBOX VIEW) ================= */}
          {subView === "sandbox" && (
            <motion.div 
              key="sandbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-12"
            >
              {/* Sandbox info panel */}
              <div className="bg-[#0f111a]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0066ff]/5 blur-[120px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20 text-[10px] text-[#00d2ff] uppercase font-bold tracking-widest font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse"></span>
                      <span>Anker Blue Listing Workspace</span>
                    </div>
                    <h2 
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => updateProjectField("title", e.currentTarget.innerText)}
                      className="text-2xl md:text-3.5xl font-extrabold text-white outline-none leading-none"
                    >
                      {activeProject.title}
                    </h2>
                    <p 
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => updateProjectField("desc", e.currentTarget.innerText)}
                      className="text-xs text-zinc-400 leading-relaxed max-w-4xl outline-none"
                    >
                      {activeProject.desc}
                    </p>
                  </div>
                  
                  {/* Export Specs Button */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={handleExportSpecifications}
                      className="px-4 py-2 bg-gradient-to-r from-[#0066ff] to-[#00d2ff] hover:opacity-95 active:scale-95 text-[11px] text-white uppercase font-black tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center shadow-lg shadow-[#0066ff]/20 font-mono"
                    >
                      <DownloadCloud className="w-4 h-4 mr-1.5" />
                      导出视觉文案 Spec
                    </button>
                    <span className="text-[8px] text-zinc-500 text-center font-mono">EXPORT SPEC VALUE</span>
                  </div>
                </div>
              </div>

              {/* PLATE 01: Amazon Listing Main/Sub Images System (主图附图系统) */}
              <section className="bg-[#0a0c12]/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center">
                      <ImageIcon className="w-4.5 h-4.5 text-[#0066ff]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-white tracking-widest uppercase font-mono">PLATE 01: LISTING MAIN & SUB IMAGES SYSTEM / 亚马逊主图附图大盘</h3>
                      <p className="text-[10px] text-zinc-500 font-sans">1:1 大画幅附图排版，支持自定义编辑标签，可配合设计模式实时上传全新渲染图资产。</p>
                    </div>
                  </div>

                  {/* Add Slot Button (Edit Mode only) */}
                  {isEditMode && (
                    <button 
                      type="button"
                      onClick={handleAddMainImage}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-zinc-300 cursor-pointer transition-all flex items-center space-x-1 font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加主图槽位</span>
                    </button>
                  )}
                </div>

                {/* 1:1 Images grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {activeProject.mainImages.map((item, index) => (
                    <div 
                      key={item.id} 
                      onDoubleClick={(e) => {
                        if (isEditMode) {
                          e.stopPropagation();
                          triggerUploadField('mainImage', item.id);
                        }
                      }}
                      onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                      onDragEnter={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                      onDragLeave={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                      onDrop={(e) => { 
                        if (isEditMode) {
                          e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                          handleImageDrop(e, 'mainImage', item.id);
                        }
                      }}
                      className="group relative aspect-square rounded-2xl bg-[#0f111a]/50 border border-white/5 overflow-hidden flex flex-col justify-end transition-all duration-500 hover:border-[#00d2ff]/50 hover:shadow-[0_0_35px_rgba(0,210,255,0.15)] font-sans cursor-pointer"
                    >
                      <SafeImage 
                        src={item.img} 
                        className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500 ease-out transform group-hover:scale-115" 
                        alt="Main list item" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                      
                      <div className="relative z-10 p-4">
                        <span 
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newLabel = e.currentTarget.innerText;
                            const updated = activeProject.mainImages.map(imgItem => 
                              imgItem.id === item.id ? { ...imgItem, label: newLabel } : imgItem
                            );
                            updateProjectField("mainImages", updated);
                          }}
                          className="text-[10px] font-bold text-zinc-400 tracking-wider block outline-none"
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Edit controls overlays */}
                      {isEditMode && (
                        <>
                          {/* Sync Easy Trigger Button at top corner for easy touch access */}
                          <button
                            type="button"
                            onClick={() => triggerUploadField('mainImage', item.id)}
                            className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-lg bg-[#0066ff]/90 border border-white/10 flex items-center justify-center text-white hover:bg-[#00ddff] transition-all cursor-pointer shadow-md"
                            title="更换本张主图"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute inset-0 bg-black/65 flex items-center justify-center space-x-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20">
                            <button 
                              type="button"
                              onClick={() => triggerUploadField('mainImage', item.id)} 
                              className="w-9 h-9 rounded-full bg-[#0066ff] border border-white/10 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-lg"
                              title="上传电脑渲染素材"
                            >
                              <Camera className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteMainImage(item.id)} 
                              className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-450 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                              title="从展示盘中删除"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* PLATE 02: Premium A+ Wide Banner flow (A+ 宽幅大图组) */}
              <section className="bg-[#0a0c12]/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center">
                      <Layers className="w-4.5 h-4.5 text-[#00d2ff]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-white tracking-widest uppercase font-mono">PLATE 02: PREMIUM A+ WIDE BANNER FLOW / 顶级 Premium A+ 详情大海报流</h3>
                      <p className="text-[10px] text-zinc-500 font-sans">1464x600 px 视网膜宽幅比例，一键切换对标同行，用视觉落差形成绝对说服力。</p>
                    </div>
                  </div>

                  {/* Config consolidated to bottom-right cockpit */}
                </div>

                {/* Modules Array */}
                <div 
                  className={
                    aplusLayoutMode === "seamless" 
                      ? "w-full max-w-[1464px] mx-auto bg-black border border-white/5 rounded-3xl overflow-hidden shadow-3xl flex flex-col gap-0 select-text animate-fade-in divide-y divide-white/5"
                      : "space-y-12 animate-fade-in"
                  }
                >
                  {activeProject.aplusBlocks.map((block, index) => {
                    const currentStyle = block.layoutStyle || "banner";
                    const activeBannerImg = block.premiumImg; // Exclusively premium visual display as requested by deleting twin comparative versions
                    const compareRows = getBlockCompareRows(block);
                    const hotspots = getBlockHotspots(block);
                    const slides = getBlockSlides(block);
                    const currentSlideIndex = carouselSlideIndices[block.id] !== undefined 
                      ? carouselSlideIndices[block.id] 
                      : (block.activeSlideIndex || 0);

                    return (
                      <div 
                        key={block.id}
                        className={
                          aplusLayoutMode === "seamless"
                            ? "relative w-full group/aplus text-left transition-all overflow-hidden"
                            : "bg-[#0f111a]/40 border border-white/5 rounded-3xl p-5 md:p-6 space-y-6 hover:border-white/10 transition-all duration-300 shadow-2xl relative group/aplus text-left"
                        }
                      >
                        {/* Block settings header: Conditional based on Layout Mode */}
                        {aplusLayoutMode === "seamless" ? (
                          /* Floating HUD Overlay in Seamless Edit Mode */
                          isEditMode ? (
                            <div className="absolute top-3 inset-x-3 z-[150] flex flex-wrap items-center justify-between gap-2 p-2 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl transition-all opacity-0 group-hover/aplus:opacity-100 group-hover/aplus:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto shadow-xl pointer-events-none">
                              {/* Left: Info & Swapping */}
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] bg-[#0066ff] text-white font-black font-mono tracking-widest px-2 py-0.5 rounded uppercase">
                                  MODULE {index + 1} / {currentStyle.toUpperCase()}
                                </span>
                                <div className="flex items-center space-x-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlock(block.id, "up")}
                                    disabled={index === 0}
                                    className={`p-1 rounded bg-white/5 text-zinc-350 hover:text-white transition-all ${index === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"}`}
                                    title="向上移 (Rearrange Up)"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlock(block.id, "down")}
                                    disabled={index === activeProject.aplusBlocks.length - 1}
                                    className={`p-1 rounded bg-white/5 text-zinc-350 hover:text-white transition-all ${index === activeProject.aplusBlocks.length - 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"}`}
                                    title="向下移 (Rearrange Down)"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Center: Layout togglers */}
                              <div className="flex flex-wrap items-center gap-1">
                                {[
                                  { style: "banner", label: "巨幕单图" },
                                  { style: "longImage", label: "自适应长图" },
                                  { style: "carousel", label: "导航轮播" },
                                  { style: "grid", label: "特色网格" },
                                  { style: "comparison", label: "多维对比" },
                                  { style: "hotspots", label: "交互热点" }
                                ].map((option) => (
                                  <button
                                    type="button"
                                    key={option.style}
                                    onClick={() => {
                                      const updated = activeProject.aplusBlocks.map(b => 
                                        b.id === block.id ? { ...b, layoutStyle: option.style as any } : b
                                      );
                                      updateProjectField("aplusBlocks", updated);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                                      currentStyle === option.style 
                                        ? "bg-[#00d2ff]/20 border border-[#00d2ff]/40 text-[#00d2ff]" 
                                        : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                                <div className="w-[1px] h-3.5 bg-white/20 mx-1"></div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextFit = block.imgFit === "contain" ? "auto" : block.imgFit === "auto" ? "cover" : "contain";
                                    const updated = activeProject.aplusBlocks.map(b => 
                                      b.id === block.id ? { ...b, imgFit: nextFit } : b
                                    );
                                    updateProjectField("aplusBlocks", updated);
                                    addToast(
                                      "info", 
                                      "自适应排版变更 / Object Fit Altered", 
                                      `当前大图自适应格式已转换为：【${nextFit === "contain" ? "等比包含居中" : nextFit === "auto" ? "全高完整自适应" : "裁剪填充铺满"}】`
                                    );
                                  }}
                                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 hover:bg-[#00d2ff]/10 border border-white/15 text-[#00d2ff] hover:text-white cursor-pointer transition-all"
                                  title="切换当前图片自适应展示填充格式 (Cover/Contain/Auto-Aspect)"
                                >
                                  🖼️ {block.imgFit === "contain" ? "包含居中" : block.imgFit === "auto" ? "完整自适应" : "裁剪铺满"}
                                </button>
                                {block.hideCarouselText && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setHideCarouselText(prev => ({ ...prev, [block.id]: false }));
                                      const updated = activeProject.aplusBlocks.map(b => 
                                        b.id === block.id ? { ...b, hideCarouselText: false } : b
                                      );
                                      updateProjectField("aplusBlocks", updated);
                                      addToast(
                                        "success",
                                        "文案已恢复 / Overlay Restored",
                                        "当前模块的悬浮 HUD 视觉大字及参数叠加已成功恢复！"
                                      );
                                      window.dispatchEvent(new Event("ae_unsaved_change"));
                                    }}
                                    className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 border border-[#FF6B00]/40 text-[#FF6B00] cursor-pointer transition-all shrink-0 animate-bounce"
                                    title="恢复原本被隐藏并删除的悬浮图幅参数大字"
                                  >
                                    👁️ 恢复悬浮文本
                                  </button>
                                )}
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {(currentStyle === "banner" || currentStyle === "longImage") && (
                                  <button
                                    type="button"
                                    onClick={() => triggerUploadField('aplusPremium', block.id)}
                                    className="p-1.5 rounded bg-[#0066ff]/20 hover:bg-[#00d2ff]/20 text-[#00d2ff] border border-[#0066ff]/35 hover:border-[#00d2ff]/50 cursor-pointer transition-all flex items-center space-x-1 shrink-0"
                                    title={currentStyle === "longImage" ? "更换自适应长图 (Change Long Image)" : "更换大图底图 (Change Banner)"}
                                  >
                                    <Camera className="w-3.5 h-3.5 text-[#00d2ff]" />
                                    <span className="text-[8.5px] font-mono font-bold">
                                      {currentStyle === "longImage" ? "更换长图 (自适应)" : "更换大图 (1464x600)"}
                                    </span>
                                  </button>
                                )}
                                {currentStyle === "carousel" && (
                                  <button
                                    type="button"
                                    onClick={() => triggerUploadField(`aplusSlide_${currentSlideIndex}` as any, block.id)}
                                    className="p-1.5 rounded bg-[#0066ff]/20 hover:bg-[#00d2ff]/20 text-[#00d2ff] border border-[#0066ff]/35 hover:border-[#00d2ff]/50 cursor-pointer transition-all flex items-center space-x-1 shrink-0"
                                    title="更换本页海报 (Change Carousel Slide)"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-[#00d2ff]" />
                                    <span className="text-[8.5px] font-mono font-bold">更换本页 (1464x600)</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAplusBlock(block.id)}
                                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 hover:border-rose-500/30 cursor-pointer transition-all flex items-center space-x-1 shrink-0"
                                  title="移除该条 A+ 模块"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-[8.5px] font-mono">删除模块</span>
                                </button>
                              </div>
                            </div>
                          ) : null
                        ) : (
                          /* Original Cardinal Header Bar (Studio Mode) */
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
                            <div className="space-y-2 text-left max-w-2xl">
                              {/* Option tags to select Amazon Premium A+ Layout style */}
                              {isEditMode && (
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <span className="text-[9px] bg-[#0066ff]/20 border border-[#0066ff]/30 text-[#00d2ff] tracking-widest font-black uppercase font-mono px-2 py-0.5 rounded-md">
                                    AMZ PREMIUM A+ MODULE / 亚马逊高级 A+ 模块规范
                                  </span>
                                  {[
                                    { style: "banner", label: "巨幕单图 (Banner)" },
                                    { style: "longImage", label: "自适应长图 (Long Image)" },
                                    { style: "carousel", label: "导航轮播 (Carousel)" },
                                    { style: "grid", label: "特色网格 (Grid)" },
                                    { style: "comparison", label: "多维对比 (Compare)" },
                                    { style: "hotspots", label: "交互热点 (Hotspots)" }
                                  ].map((option) => (
                                    <button
                                      type="button"
                                      key={option.style}
                                      onClick={() => {
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, layoutStyle: option.style as any } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                        addToast(
                                          "info",
                                          "高级 A+ 格式转换 / Layout Format Altered",
                                          `排版格式已变更为最新【${option.label}】高转化模块规范！`
                                        );
                                      }}
                                      className={`px-2 py-0.5 border rounded-[6px] text-[9px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
                                        currentStyle === option.style
                                          ? "bg-[#00d2ff]/25 border-[#00d2ff]/40 text-white"
                                          : "bg-white/[0.02] border-white/5 text-zinc-450 hover:bg-white/5 hover:text-white"
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                  <div className="h-4 w-px bg-white/15 mx-1"></div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextFit = block.imgFit === "contain" ? "auto" : block.imgFit === "auto" ? "cover" : "contain";
                                      const updated = activeProject.aplusBlocks.map(b => 
                                        b.id === block.id ? { ...b, imgFit: nextFit } : b
                                      );
                                      updateProjectField("aplusBlocks", updated);
                                      addToast(
                                        "info", 
                                        "自适应排版变更 / Object Fit Altered", 
                                        `当前大图自适应格式已转换为：【${nextFit === "contain" ? "等比包含居中" : nextFit === "auto" ? "全高完整自适应" : "裁剪填充铺满"}】`
                                      );
                                    }}
                                    className="px-2 py-0.5 border rounded-[6px] text-[9px] font-mono tracking-wider font-bold bg-white/5 hover:bg-[#00d2ff]/10 border-white/10 text-[#00d2ff] hover:text-white cursor-pointer transition-all"
                                    title="切换当前图片自适应展示填充格式 (Cover/Contain/Auto-Aspect)"
                                  >
                                    🖼️ {block.imgFit === "contain" ? "包含居中" : block.imgFit === "auto" ? "完整自适应" : "裁剪铺满"}
                                  </button>
                                </div>
                              )}

                              <h4 
                                contentEditable={isEditMode}
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const val = e.currentTarget.innerText;
                                  const updated = activeProject.aplusBlocks.map(b => 
                                    b.id === block.id ? { ...b, title: val } : b
                                  );
                                  updateProjectField("aplusBlocks", updated);
                                }}
                                className="text-sm font-black text-white tracking-wider outline-none font-mono"
                              >
                                {block.title}
                              </h4>
                              <p 
                                contentEditable={isEditMode}
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const val = e.currentTarget.innerText;
                                  const updated = activeProject.aplusBlocks.map(b => 
                                    b.id === block.id ? { ...b, desc: val } : b
                                  );
                                  updateProjectField("aplusBlocks", updated);
                                }}
                                className="text-[10px] text-zinc-400 leading-relaxed outline-none"
                              >
                                {block.desc}
                              </p>
                            </div>

                            {/* Controls Panel of block: Delete button only */}
                            <div className="flex items-center space-x-3 self-start xl:self-center">
                              {/* Delete block button (Edit Mode only) */}
                              {isEditMode && (
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteAplusBlock(block.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 hover:border-rose-500/25 text-[#ff4b4b] transition-all cursor-pointer flex items-center space-x-1 font-mono text-xs font-bold"
                                  title="删除此 A+ 模块"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>删除模块</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interactive Main Wide Canvas ratio 1464x600 px */}
                        <div 
                          onDoubleClick={(e) => {
                            if (isEditMode) {
                              e.stopPropagation();
                              if (currentStyle === "banner" || currentStyle === "longImage") {
                                triggerUploadField('aplusPremium', block.id);
                              } else if (currentStyle === "carousel") {
                                triggerUploadField(`aplusSlide_${currentSlideIndex}`, block.id);
                              }
                            }
                          }}
                          onDragOver={(e) => { if (isEditMode && (currentStyle === "banner" || currentStyle === "longImage" || currentStyle === "carousel")) e.preventDefault(); }}
                          onDragEnter={(e) => { if (isEditMode && (currentStyle === "banner" || currentStyle === "longImage" || currentStyle === "carousel")) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                          onDragLeave={(e) => { if (isEditMode && (currentStyle === "banner" || currentStyle === "longImage" || currentStyle === "carousel")) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                          onDrop={(e) => { 
                            if (isEditMode) {
                              e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                              if (currentStyle === "banner" || currentStyle === "longImage") {
                                handleImageDrop(e, 'aplusPremium', block.id);
                              } else if (currentStyle === "carousel") {
                                handleImageDrop(e, `aplusSlide_${currentSlideIndex}`, block.id);
                              }
                            }
                          }}
                          className={
                            aplusLayoutMode === "seamless"
                              ? `relative w-full bg-black overflow-hidden group/img transition-all border border-transparent ${block.imgFit === "auto" || currentStyle === "longImage" ? "aspect-auto h-auto" : "aspect-[1464/600]"}`
                              : `relative w-full rounded-2xl bg-black/50 border border-white/5 overflow-hidden group/img shadow-2xl transition-all ${block.imgFit === "auto" || currentStyle === "longImage" ? "aspect-auto h-auto" : "aspect-[1464/600]"}`
                          }
                        >
                          
                          {/* 1. HERO BANNER MODE */}
                          {currentStyle === "banner" && (
                            <div className="w-full h-full relative">
                              <SafeImage 
                                src={activeBannerImg} 
                                className={`w-full transition-transform duration-700 hover:scale-[1.01] ${
                                  block.imgFit === "contain" 
                                    ? "h-full object-contain bg-zinc-950/60 p-4 mx-auto" 
                                    : block.imgFit === "auto"
                                    ? "h-auto max-h-[1464px] object-contain mx-auto"
                                    : "h-full object-cover"
                                }`} 
                                alt="Aplus Chapter Banner" 
                              />
                              
                              {/* HUD Overlay inside banner (Only in pure Refinement style) */}
                              {!block.isComparing && (
                                (!hideCarouselText[block.id] && (!block.hideCarouselText)) ? (
                                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:max-w-xl bg-black/75 border border-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 text-left text-white shadow-2xl space-y-2 pointer-events-auto group/text">
                                    {isEditMode && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setHideCarouselText(prev => ({ ...prev, [block.id]: true }));
                                          const updated = activeProject.aplusBlocks.map(b => 
                                            b.id === block.id ? { ...b, hideCarouselText: true } : b
                                          );
                                          updateProjectField("aplusBlocks", updated);
                                          addToast("info", "已隐藏左侧浮托文案并已自动保存 / Overlay Hidden", "当前图幅文案已隐藏且已为您实时自动保存！");
                                          window.dispatchEvent(new Event("ae_unsaved_change"));
                                        }}
                                        className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/35 text-rose-300 rounded text-[8.5px] font-mono select-none pointer-events-auto cursor-pointer"
                                        title="隐藏并删除当前文案信息"
                                      >
                                        隐藏并删除文案
                                      </button>
                                    )}
                                    <div className="flex items-center space-x-1.5 text-[8.5px] text-[#00d2ff] tracking-widest font-mono font-bold uppercase">
                                      <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00d2ff] shrink-0" />
                                      <span>DIGITAL HUD SPEC OVERLAY // 工业级参数叠加罩</span>
                                    </div>
                                    <h4 
                                      contentEditable={isEditMode}
                                      suppressContentEditableWarning
                                      onBlur={(e) => {
                                        const val = e.currentTarget.innerText;
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, title: val } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                      }}
                                      className="text-white text-xs md:text-sm font-black tracking-wide font-sans outline-none hover:bg-white/5 rounded px-0.5 transition-colors"
                                    >
                                      {block.title}
                                    </h4>
                                    <p 
                                      contentEditable={isEditMode}
                                      suppressContentEditableWarning
                                      onBlur={(e) => {
                                        const val = e.currentTarget.innerText;
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, desc: val } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                      }}
                                      className="text-[9.5px] md:text-[10.5px] text-zinc-300 leading-relaxed font-sans outline-none hover:bg-white/5 rounded px-0.5 transition-colors"
                                    >
                                      {block.desc}
                                    </p>
                                  </div>
                                ) : (
                                  isEditMode && (
                                    <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setHideCarouselText(prev => ({ ...prev, [block.id]: false }));
                                          addToast("success", "已恢复精修贴字 / Overlay Restored", "模块浮层文案已成功恢复展示。");
                                        }}
                                        className="px-2.5 py-1 bg-[#00d2ff]/20 hover:bg-[#00d2ff]/40 border border-[#00d2ff]/40 text-[#00d2ff] rounded-lg text-[9px] font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer animate-pulse"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>添加/恢复浮层文案</span>
                                      </button>
                                    </div>
                                  )
                                )
                              )}
                              
                              {/* Low Contrast Amateur overlay notes */}
                              {block.isComparing && (
                                <div className="absolute inset-0 bg-red-950/20 flex flex-col justify-center items-center p-4 md:p-8 z-10 backdrop-blur-[1.5px]">
                                  <div className="max-w-md w-full p-5 bg-white rounded-2xl border border-red-500/40 text-center shadow-2xl space-y-3 relative mx-auto my-auto transition-transform duration-500 scale-100">
                                    <div className="inline-flex items-center space-x-1 text-[9px] text-zinc-400 tracking-widest uppercase font-mono font-bold">
                                      <span>LOW POWER DENSITY RIVAL / 竞品针对性痛点过滤</span>
                                    </div>
                                    <h5 
                                      contentEditable={isEditMode}
                                      suppressContentEditableWarning
                                      onBlur={(e) => {
                                        const val = e.currentTarget.innerText;
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, competitorTitle: val } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                      }}
                                      className="text-sm md:text-base font-black text-red-600 outline-none font-sans"
                                    >
                                      {block.competitorTitle}
                                    </h5>
                                    <p 
                                      contentEditable={isEditMode}
                                      suppressContentEditableWarning
                                      onBlur={(e) => {
                                        const val = e.currentTarget.innerText;
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, competitorDesc: val } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                      }}
                                      className="text-[10px] md:text-[11px] text-zinc-500 leading-relaxed outline-none font-sans"
                                    >
                                      {block.competitorDesc}
                                    </p>
                                    
                                    <div className="flex flex-wrap justify-center gap-1 mt-1.5 text-[8.5px] font-black tracking-wider uppercase font-mono">
                                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md"># 拥挤不均排拼凑</span>
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md"># 劣质机身塑料</span>
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md"># 堆砌无主次营销</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 1.5 ADAPTIVE LONG STRIP MODE */}
                          {currentStyle === "longImage" && (
                            <div className="w-full relative h-auto">
                              <SafeImage 
                                src={activeBannerImg} 
                                className="w-full h-auto block object-contain select-text" 
                                alt="Aplus Long Banner" 
                              />
                              
                              {/* Overlay for HUD info similar to banner, fully optional */}
                              {(!hideCarouselText[block.id] && (!block.hideCarouselText)) ? (
                                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:max-w-xl bg-black/75 border border-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 text-left text-white shadow-2xl space-y-2 pointer-events-auto group/text">
                                  {isEditMode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHideCarouselText(prev => ({ ...prev, [block.id]: true }));
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, hideCarouselText: true } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                        addToast("info", "已隐藏左侧浮托文案并已自动保存 / Overlay Hidden", "当前图幅文案已隐藏且已为您实时自动保存！");
                                        window.dispatchEvent(new Event("ae_unsaved_change"));
                                      }}
                                      className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/35 text-rose-300 rounded text-[8.5px] font-mono select-none pointer-events-auto cursor-pointer"
                                      title="隐藏并删除当前文案信息"
                                    >
                                      隐藏并删除文案
                                    </button>
                                  )}
                                  <div className="flex items-center space-x-1.5 text-[8.5px] text-[#00d2ff] tracking-widest font-mono font-bold uppercase">
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00d2ff] shrink-0" />
                                    <span>LONG STRIP INFO OVERLAY // 品牌自适应长图</span>
                                  </div>
                                  <h4 
                                    contentEditable={isEditMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const val = e.currentTarget.innerText;
                                      const updated = activeProject.aplusBlocks.map(b => 
                                        b.id === block.id ? { ...b, title: val } : b
                                      );
                                      updateProjectField("aplusBlocks", updated);
                                    }}
                                    className="text-white text-xs md:text-sm font-black tracking-wide font-sans outline-none hover:bg-white/5 rounded px-0.5 transition-colors"
                                  >
                                    {block.title}
                                  </h4>
                                  <div 
                                    contentEditable={isEditMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const val = e.currentTarget.innerText;
                                      const updated = activeProject.aplusBlocks.map(b => 
                                        b.id === block.id ? { ...b, desc: val } : b
                                      );
                                      updateProjectField("aplusBlocks", updated);
                                    }}
                                    className="text-[9.5px] md:text-[10.5px] text-zinc-350 leading-relaxed font-sans outline-none hover:bg-white/5 rounded px-0.5 transition-colors"
                                  >
                                    {block.desc}
                                  </div>
                                </div>
                              ) : (
                                isEditMode && (
                                  <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHideCarouselText(prev => ({ ...prev, [block.id]: false }));
                                        addToast("success", "已恢复精修贴字 / Overlay Restored", "模块浮层文案已成功恢复展示。");
                                      }}
                                      className="px-2.5 py-1 bg-[#00d2ff]/20 hover:bg-[#00d2ff]/40 border border-[#00d2ff]/40 text-[#00d2ff] rounded-lg text-[9px] font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer animate-pulse"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>添加/恢复浮层文案</span>
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* 2. DYNAMIC COMPARISON MATRIX MODE */}
                          {currentStyle === "comparison" && (
                            <div className="w-full h-full bg-[#07090f] p-4 md:p-6 overflow-y-auto flex flex-col justify-between">
                              <div className="text-left space-y-1 mb-2">
                                <span className="text-[9px] text-[#00d2ff] tracking-widest uppercase font-mono font-bold block">
                                  ⚡ COMPARISON CHART MODULE // 旗舰款参数对标防拆保护墙
                                </span>
                                <p className="text-[10px] text-zinc-400">
                                  直接双击单元格内直接编辑修改比对属性数值。高增高亮区域聚焦本品优越指标，构建无死角成交心理暗示。
                                </p>
                              </div>
                              <div className="flex-1 overflow-x-auto">
                                <table className="w-full border-collapse text-[10px] text-zinc-300 min-w-[500px]">
                                  <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02]">
                                      <th className="p-2 py-3 text-left font-mono font-bold text-zinc-400">比对参量特征 (Specs)</th>
                                      <th className="p-2 py-3 text-center text-[#00d2ff] font-bold bg-[#0066ff]/20 border-x border-t border-[#0066ff]/40 relative max-w-[200px]">
                                        <div className="absolute top-0 inset-x-0 mx-auto text-[7px] bg-[#00d2ff] text-black font-black font-mono tracking-widest py-0.5 uppercase">⭐ THIS PRODUCT (本品旗舰)</div>
                                        <div className="pt-2">{activeProject.title.split(" // ")[0]}</div>
                                      </th>
                                      <th className="p-2 py-3 text-center text-zinc-500 font-medium font-mono">普通同行常规款 (Competitor A)</th>
                                      <th className="p-2 py-3 text-center text-zinc-500 font-medium font-mono">通用白牌走量款 (Competitor B)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {compareRows.map((row: any, rIdx: number) => (
                                      <tr key={rIdx} className="border-b border-white/5 hover:bg-white/[0.01]">
                                        {/* Compare Property */}
                                        <td 
                                          contentEditable={isEditMode}
                                          suppressContentEditableWarning
                                          onBlur={(e) => {
                                            updateCompareRowCell(block.id, rIdx, "feature", e.currentTarget.innerText);
                                          }}
                                          className="p-3 text-zinc-400 font-mono font-medium text-left outline-none"
                                        >
                                          {row.feature}
                                        </td>
                                        {/* Our Product (Highlighted) */}
                                        <td 
                                          contentEditable={isEditMode}
                                          suppressContentEditableWarning
                                          onBlur={(e) => {
                                            updateCompareRowCell(block.id, rIdx, "thisVal", e.currentTarget.innerText);
                                          }}
                                          className="p-3 text-center text-white font-extrabold bg-[#0066ff]/10 border-x border-[#0066ff]/20 outline-none"
                                        >
                                          {row.thisVal}
                                        </td>
                                        {/* Comp 1 */}
                                        <td 
                                          contentEditable={isEditMode}
                                          suppressContentEditableWarning
                                          onBlur={(e) => {
                                            updateCompareRowCell(block.id, rIdx, "comp1", e.currentTarget.innerText);
                                          }}
                                          className="p-3 text-center text-zinc-500 outline-none"
                                        >
                                          {row.comp1}
                                        </td>
                                        {/* Comp 2 */}
                                        <td 
                                          contentEditable={isEditMode}
                                          suppressContentEditableWarning
                                          onBlur={(e) => {
                                            updateCompareRowCell(block.id, rIdx, "comp2", e.currentTarget.innerText);
                                          }}
                                          className="p-3 text-center text-zinc-500 outline-none"
                                        >
                                          {row.comp2}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 3. HARDCOR INTERACTIVE HOTSPOTS MODE */}
                          {/* 4. PREMIUM SLIDE SHOW CAROUSEL MODE */}
                          {currentStyle === "carousel" && (
                            <div className="w-full relative bg-black flex flex-col justify-end">
                              
                              {/* In-flow ghost image to preserve layout height under imgFit === auto */}
                              <SafeImage 
                                src={
                                  slides[currentSlideIndex]?.img || activeBannerImg
                                } 
                                className={`w-full pointer-events-none opacity-0 select-none block ${
                                  block.imgFit === "contain" 
                                    ? "h-full min-h-[300px] object-contain bg-zinc-950/60 p-4 mx-auto" 
                                    : block.imgFit === "auto"
                                    ? "h-auto max-h-[1464px] object-contain mx-auto"
                                    : "h-auto aspect-[1464/600] object-cover"
                                }`}
                                alt="aspect-ghost"
                              />

                              {/* Slide Image rendering */}
                              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                                <SafeImage 
                                  src={
                                    slides[currentSlideIndex]?.img || activeBannerImg
                                  } 
                                  className={`w-full h-full opacity-85 transition-all duration-500 ${
                                    block.imgFit === "contain" 
                                      ? "object-contain bg-zinc-950/60 p-2 md:p-4 mx-auto" 
                                      : block.imgFit === "auto"
                                      ? "object-contain mx-auto"
                                      : "object-cover"
                                  }`}
                                  alt="Aplus Carousel" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>
                              </div>

                              {/* Information overlay */}
                              {(!hideCarouselText[block.id] && (!block.hideCarouselText)) ? (
                                <div className="absolute bottom-16 md:bottom-20 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-20 p-4 md:p-6 text-left text-white space-y-2 pointer-events-auto bg-black/45 rounded-xl backdrop-blur-md border border-white/5 group/text">
                                  {isEditMode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHideCarouselText(prev => ({ ...prev, [block.id]: true }));
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, hideCarouselText: true } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                        addToast("info", "已隐藏当前 A+ 模块文案并已自动保存 / Overlay Hidden", "精修图浮动大字已隐藏并已为您实时自动保存！");
                                        window.dispatchEvent(new Event("ae_unsaved_change"));
                                      }}
                                      className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/35 text-rose-300 rounded text-[8.5px] font-mono select-none pointer-events-auto cursor-pointer"
                                      title="隐藏/删除当前文案信息"
                                    >
                                      隐藏并删除文案
                                    </button>
                                  )}
                                  <div className="inline-flex items-center space-x-1 text-[8px] bg-[#00d2ff]/20 text-[#00d2ff] px-2 py-0.5 rounded font-mono font-bold uppercase mb-1">
                                    <span>SLIDE MODE CHAPTER 0{currentSlideIndex + 1}</span>
                                  </div>
                                  <h4 
                                    contentEditable={isEditMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      updateSlideCell(block.id, currentSlideIndex, "title", e.currentTarget.innerText);
                                    }}
                                    className="text-white text-xs md:text-sm font-black outline-none tracking-widest uppercase font-mono"
                                  >
                                    {slides[currentSlideIndex]?.title}
                                  </h4>
                                  <p 
                                    contentEditable={isEditMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      updateSlideCell(block.id, currentSlideIndex, "desc", e.currentTarget.innerText);
                                    }}
                                    className="text-[9.5px] md:text-[10.5px] text-zinc-300 leading-relaxed outline-none"
                                  >
                                    {slides[currentSlideIndex]?.desc}
                                  </p>
                                </div>
                              ) : (
                                isEditMode && (
                                  <div className="absolute bottom-16 md:bottom-20 left-4 z-20 p-4 text-left pointer-events-auto">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHideCarouselText(prev => ({ ...prev, [block.id]: false }));
                                        addToast("success", "已重新载入并添加专属文案 / Overlay Restored", "轮播文案图层已成功回复展示。");
                                      }}
                                      className="px-2.5 py-1 bg-[#00d2ff]/20 hover:bg-[#00d2ff]/40 border border-[#00d2ff]/40 text-[#00d2ff] rounded-lg text-[9px] font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer animate-pulse"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>添加/恢复浮层文案</span>
                                    </button>
                                  </div>
                                )
                              )}

                              {/* Carousel Bottom Tab selection bar */}
                              <div 
                                style={{ backgroundColor: `rgba(0, 0, 0, ${(block.carouselNavOpacity !== undefined ? block.carouselNavOpacity : 60) / 100})` }}
                                className="absolute bottom-0 inset-x-0 z-20 border-t border-white/5 p-2 flex flex-wrap items-center justify-center gap-1.5 pointer-events-auto transition-all"
                              >
                                {slides.map((slide: any, sIdx: number) => {
                                  const isSelected = currentSlideIndex === sIdx;
                                  return (
                                    <button
                                      type="button"
                                      key={sIdx}
                                      onClick={() => {
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, activeSlideIndex: sIdx } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                        setCarouselSlideIndices(prev => ({ ...prev, [block.id]: sIdx }));
                                      }}
                                      className={`px-2.5 py-1.5 rounded-lg text-[8.5px] font-mono tracking-wider font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                                        isSelected 
                                          ? "bg-[#00d2ff]/20 border border-[#00d2ff]/45 text-[#00d2ff]" 
                                          : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      <span>TAB {sIdx + 1}: </span>
                                      <span
                                        contentEditable={isEditMode}
                                        suppressContentEditableWarning
                                        onClick={(e) => {
                                          if (isEditMode) {
                                            e.stopPropagation();
                                          }
                                        }}
                                        onBlur={(e) => {
                                          e.stopPropagation();
                                          const textVal = e.currentTarget.innerText.trim();
                                          updateSlideCell(block.id, sIdx, "tabTitle", textVal);
                                          window.dispatchEvent(new Event("ae_unsaved_change"));
                                        }}
                                        className={`outline-none min-w-[20px] ${isEditMode ? "border-b border-dashed border-[#00d2ff]/50 px-1 focus:border-solid focus:border-[#00d2ff] bg-black/40" : ""}`}
                                      >
                                        {slide.tabTitle || slide.title.split(" / ")[0]}
                                      </span>
                                    </button>
                                  );
                                })}

                                {isEditMode && (
                                  <div className="flex flex-wrap items-center gap-2.5 ml-2 pl-2 border-l border-white/10" id="carouselSlideActions">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentSlides = getBlockSlides(block);
                                        const nextNum = currentSlides.length + 1;
                                        const nextTabTitle = `0${nextNum} 新增选项`;
                                        const nextSlideTitle = `${nextNum < 10 ? '0' + nextNum : nextNum} 自定义选项卡 / Custom Tab ${nextNum}`;
                                        const nextSlide: AplusSlide = {
                                          title: nextSlideTitle,
                                          desc: "请输入此选项卡的卖点说明及工艺描述。每一个选项卡都支持独立上传 1464x600 px 高清大图。",
                                          img: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=1464&h=600",
                                          tabTitle: nextTabTitle
                                        };
                                        const updatedSlides = [...currentSlides, nextSlide];
                                        
                                        const updated = activeProject.aplusBlocks.map(b => 
                                          b.id === block.id ? { ...b, carouselSlides: updatedSlides, activeSlideIndex: currentSlides.length } : b
                                        );
                                        updateProjectField("aplusBlocks", updated);
                                        setCarouselSlideIndices(prev => ({ ...prev, [block.id]: currentSlides.length }));
                                        addToast("success", "➕ 轮播选项卡添加成功", `已为您成功追加了 Tab ${nextNum} 轮播版页并自动跳转。`);
                                      }}
                                      className="px-2 py-1 bg-[#0066ff]/20 hover:bg-[#00d2ff]/20 border border-[#0066ff]/35 hover:border-[#00d2ff]/50 text-[#00d2ff] font-mono text-[8.5px] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                                      title="新增一个轮播页面 (Add Slide Tab)"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>添加 Tab</span>
                                    </button>
                                    {slides.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const slideKey = `${block.id}_${currentSlideIndex}`;
                                          if (confirmDeleteSlide !== slideKey) {
                                            setConfirmDeleteSlide(slideKey);
                                            addToast("info", "⚠️ 请再次点击 确认删除", `您即将移除第 ${currentSlideIndex + 1} 个轮播页面。再次点击该按钮即刻执行移除。`);
                                            setTimeout(() => {
                                              setConfirmDeleteSlide(prev => prev === slideKey ? null : prev);
                                            }, 4000);
                                            return;
                                          }
                                          
                                          setConfirmDeleteSlide(null);
                                          const currentSlides = getBlockSlides(block);
                                          const activeIndex = currentSlideIndex;
                                          const updatedSlides = currentSlides.filter((_, sIdx) => sIdx !== activeIndex);
                                          const nextIndex = Math.max(0, activeIndex - 1);
                                          
                                          const updated = activeProject.aplusBlocks.map(b => 
                                            b.id === block.id ? { ...b, carouselSlides: updatedSlides, activeSlideIndex: nextIndex } : b
                                          );
                                          updateProjectField("aplusBlocks", updated);
                                          setCarouselSlideIndices(prev => ({ ...prev, [block.id]: nextIndex }));
                                          addToast("info", "✕ 轮播选项卡已被移除", `成功挪除去除了原本的第 ${activeIndex + 1} 幅轮播位设计槽。`);
                                        }}
                                        className={
                                          confirmDeleteSlide === `${block.id}_${currentSlideIndex}`
                                            ? "px-2 py-1 bg-red-600 hover:bg-red-700 border border-red-500 text-white font-mono text-[8.5px] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer animate-pulse font-black"
                                            : "px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 hover:border-rose-500/25 text-rose-400 font-mono text-[8.5px] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                                        }
                                        title="删除当前选中的轮播大图页 (Delete Slide)"
                                      >
                                        <Minus className="w-3 h-3" />
                                        <span>
                                          {confirmDeleteSlide === `${block.id}_${currentSlideIndex}`
                                            ? "🔴 确认删除此 Tab"
                                            : "删除当前 Tab"
                                          }
                                        </span>
                                      </button>
                                    )}

                                    <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>

                                    {/* Opacity slider tool with feedback */}
                                    <div className="flex items-center gap-1.5 text-zinc-400 select-none bg-black/45 px-2 py-1 rounded-lg border border-white/5 shadow-inner">
                                      <Sliders className="w-3 h-3 text-[#00d2ff]" />
                                      <span className="text-[8.5px] font-mono whitespace-nowrap text-zinc-300">导航不透明度: {block.carouselNavOpacity !== undefined ? block.carouselNavOpacity : 60}%</span>
                                      <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={block.carouselNavOpacity !== undefined ? block.carouselNavOpacity : 60}
                                        onChange={(e) => {
                                          const newVal = parseInt(e.target.value);
                                          const updated = activeProject.aplusBlocks.map(b => 
                                            b.id === block.id ? { ...b, carouselNavOpacity: newVal } : b
                                          );
                                          updateProjectField("aplusBlocks", updated);
                                        }}
                                        className="w-16 md:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-[#00d2ff]"
                                        title="自定义底部导航模块的背景不透明度 (Adjust Nav Opacity)"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 5. PREMIUM 4-CARD FEATURE GRID (300 x 300 px * 4) */}
                          {currentStyle === "grid" && (
                            <div className="w-full h-full bg-[#07090f]/95 p-4 md:p-6 flex flex-col justify-between overflow-hidden">
                              {/* Header info */}
                              <div className="flex justify-between items-center mb-2 text-left">
                                <div className="space-y-0.5">
                                  <span className="text-[8.5px] bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/30 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase inline-block">
                                    Module 3: Premium 4-Card Specialty Grid (300x300 px)
                                  </span>
                                  <p className="text-[10px] text-zinc-400">横排 4 张硬核正方形设计，呈献工艺溢价。双击文本即刻编辑，悬浮小卡独立传图。</p>
                                </div>
                              </div>

                              {/* Horizontal 4-card grid layout */}
                              <div className="grid grid-cols-4 gap-3 md:gap-4 w-full flex-1 mt-1">
                                {getBlockGridCards(block).map((card, cIdx) => (
                                  <div 
                                    key={card.id || cIdx} 
                                    onDoubleClick={(e) => {
                                      if (isEditMode) {
                                        e.stopPropagation();
                                        triggerUploadField(`aplusGridCard_${cIdx}`, block.id);
                                      }
                                    }}
                                    onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                                    onDragEnter={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.add("border-[#00d2ff]", "border-2"); } }}
                                    onDragLeave={(e) => { if (isEditMode) { e.preventDefault(); e.currentTarget.classList.remove("border-[#00d2ff]", "border-2"); } }}
                                    onDrop={(e) => { 
                                      if (isEditMode) {
                                        e.currentTarget.classList.remove("border-[#00d2ff]", "border-2");
                                        handleImageDrop(e, `aplusGridCard_${cIdx}`, block.id);
                                      }
                                    }}
                                    className="relative aspect-square rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group/card text-left flex flex-col justify-end shadow-xl transition-all font-sans"
                                  >
                                    {/* Card image container */}
                                    <SafeImage 
                                      src={card.img} 
                                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-500" 
                                      alt={card.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none"></div>

                                    {/* Editable headings and descriptions */}
                                    <div className="relative z-10 p-3 space-y-1">
                                      <h5 
                                        contentEditable={isEditMode}
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                          updateGridCardCell(block.id, cIdx, "title", e.currentTarget.innerText);
                                        }}
                                        className="text-white text-[10.5px] md:text-xs font-black outline-none tracking-wide font-mono leading-snug uppercase hover:bg-white/10 px-0.5 rounded transition-colors"
                                      >
                                        {card.title}
                                      </h5>
                                      <p 
                                        contentEditable={isEditMode}
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                          updateGridCardCell(block.id, cIdx, "desc", e.currentTarget.innerText);
                                        }}
                                        className="text-[9.2px] text-zinc-350 outline-none leading-relaxed line-clamp-2 hover:bg-white/10 px-0.5 rounded transition-colors"
                                      >
                                        {card.desc}
                                      </p>
                                    </div>

                                    {/* Upload trigger overlay */}
                                    {isEditMode && (
                                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-20">
                                        <button
                                          type="button"
                                          onClick={() => triggerUploadField(`aplusGridCard_${cIdx}` as any, block.id)}
                                          className="px-2.5 py-1.5 bg-[#0066ff] hover:bg-[#00d2ff] text-white rounded-lg active:scale-95 transition-all text-[9px] font-bold flex items-center gap-1 cursor-pointer pointer-events-auto shadow-md"
                                        >
                                          <Camera className="w-3.5 h-3.5" />
                                          <span>更换 300x300 正方形图</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sleek Floating Upload Action Bar for Edit Mode - Never blocks text editing or hide triggers */}
                          {isEditMode && aplusLayoutMode !== "seamless" && currentStyle !== "comparison" && (
                            <div className="absolute top-4 right-4 z-40 p-1 flex items-center space-x-1.5 transition-all">
                              {currentStyle === "carousel" ? (
                                <button 
                                  type="button"
                                  onClick={() => triggerUploadField(`aplusSlide_${currentSlideIndex}` as any, block.id)}
                                  className="px-3 py-1.5 bg-black/75 hover:bg-[#0066ff] border border-white/10 text-white rounded-lg active:scale-95 transition-all text-[9.5px] font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-lg tracking-wide hover:shadow-[#0066ff]/20"
                                  title="上传本轮播页专属精修海报"
                                >
                                  <Camera className="w-3.5 h-3.5 text-white animate-pulse" />
                                  <span>更换本页图 (1464x600)</span>
                                </button>
                              ) : currentStyle === "grid" ? (
                                <div className="text-[8px] font-mono bg-black/85 border border-white/10 px-2 py-1 rounded-md text-zinc-400 select-none shadow-md">
                                  💡 悬停下方各小卡片可更换 300x300 图
                                </div>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => triggerUploadField('aplusPremium', block.id)}
                                  className="px-3 py-1.5 bg-black/75 hover:bg-[#00a8ff] border border-white/10 text-white rounded-lg active:scale-95 transition-all text-[9.5px] font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-lg tracking-wide hover:shadow-[#00a8ff]/20 animate-pulse"
                                  title="上传精修大图底图"
                                >
                                  <Camera className="w-3.5 h-3.5 text-white" />
                                  <span>更换大图底图 (1464x600)</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isEditMode && (
                    <div className="pt-6 pb-2 text-center border-t border-white/5 mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleAddAplusBlock(true);
                          if (!isEditMode && setIsEditMode) {
                            setIsEditMode(true);
                          }
                          addToast("success", "新模块插入成功 / Module Appended", "已在 Plate 02 详情长图底端动态智能载入一条新的 A+ 精修大图，编辑模式并已自动激活！");
                        }}
                        className="mx-auto px-6 py-3 bg-zinc-950/90 hover:bg-[#0066ff]/10 border border-white/10 hover:border-[#00d2ff]/30 text-zinc-350 hover:text-[#00d2ff] rounded-2xl text-[11px] font-black font-mono tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-2xl hover:shadow-[#00d2ff]/5"
                      >
                        <Plus className="w-4 h-4 text-[#00d2ff] shrink-0" />
                        <span>➕ 智造添加新 A+ 巨幕排版板块 (Add new A+ block)</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Float Control Panel anchored bottom right */}
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end space-y-3">
        <div className={`w-80 bg-[#0c0e17]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 transition-all duration-300 ${isAnkerPanelOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-4 scale-95'}`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-black tracking-wider text-white flex items-center font-mono">
              <Sliders className="w-4 h-4 mr-1.5 text-[#00d2ff]" />
              <span>网站功能智造修改合集</span>
            </span>
            <button 
              type="button"
              onClick={() => setIsAnkerPanelOpen(false)} 
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Global Core Mode Switches (Edit Mode Toggle integrated) */}
          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">// REAL-TIME CUSTOMIZATION / 实时微调修改模式</span>
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-350 font-sans">网站全局在线编辑模态</span>
              <button
                type="button"
                onClick={() => {
                  if (setIsEditMode) {
                    setIsEditMode(!isEditMode);
                    addToast(
                      isEditMode ? "info" : "success",
                      isEditMode ? "预览模式已激活 / Preview Active" : "编辑修改状态已开启 / Edit Active",
                      isEditMode 
                        ? "微调标记框已全部隐藏，呈现完美生产就绪官网视觉效果。" 
                        : "内容点击即可即时修改编辑，支持轮播内容、双击传送、板块上下重排等高级交互！"
                    );
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold tracking-wider transition-all cursor-pointer ${
                  isEditMode 
                    ? "bg-[#ff4b4b] text-white shadow-lg shadow-rose-500/10" 
                    : "bg-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                {isEditMode ? "🟢 正在编辑" : "🔴 极速微调"}
              </button>
            </div>
          </div>

          {/* 2. Premium A+ Layout Space Swapper (Consequential Layout Switcher integrated!) */}
          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">// A+ DETAILS LAYOUT THEME / 海报拼合美学模式</span>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 border border-white/5 rounded-xl text-[9px]">
              <button
                type="button"
                onClick={() => {
                  setAplusLayoutMode("seamless");
                  addToast(
                    "success",
                    "已启用亚马逊原生长图排版 / Seamless Enabled",
                    "已成功切换为亚马逊高级A+无缝极奢长图！所有模块间距回归 0px，呈现极致工业美学流。"
                  );
                }}
                className={`py-1.5 px-2 rounded-lg font-bold text-center tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                  aplusLayoutMode === "seamless" 
                    ? "bg-gradient-to-r from-[#0066ff] to-[#00d2ff] text-white shadow-lg shadow-cyan-500/10" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate">极奢无缝排版</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAplusLayoutMode("studio");
                  addToast(
                    "info",
                    "已切换至模块卡片工作台 / Studio Workspace",
                    "已切换为独立的模块卡片陈列模式，方便进行细节微调和参数录入。"
                  );
                }}
                className={`py-1.5 px-2 rounded-lg font-bold text-center tracking-wider transition-all cursor-pointer ${
                  aplusLayoutMode === "studio" 
                    ? "bg-white/10 text-white" 
                    : "text-zinc-500 hover:text-zinc-350"
                }`}
              >
                <span className="truncate">卡片分离陈列</span>
              </button>
            </div>
          </div>

          {/* 3. Automatic Carousel Multi-option Slider (Auto Play Switcher integrated!) */}
          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">// SLIDES RHYTHM CONTROLLER / 海报轮播切换控制</span>
            <div className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="text-left">
                <span className="text-[10px] text-zinc-350 block">智能自动轮播</span>
                <span className="text-[8px] text-zinc-500 block">激活后每过 3 秒自动平滑滚页</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAutoCarousel(!isAutoCarousel);
                  addToast(
                    !isAutoCarousel ? "success" : "info",
                    !isAutoCarousel ? "自动轮播已开启 / Auto Carousel ON" : "手动控制已激活 / Manual Slide ON",
                    !isAutoCarousel 
                      ? "轮播图层现在将开始以每 3 秒的最优转化率进行自动平滑切换。" 
                      : "由于需要精准阅读或微调文本，轮播已更换为纯手动点击标签查看。"
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold font-mono transition-colors cursor-pointer ${
                  isAutoCarousel 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35" 
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {isAutoCarousel ? "⏰ ON:自动滚动" : "🖐 OFF:手动切换"}
              </button>
            </div>
          </div>

          {/* 4. Append Premium Module (Card addition integrated!) */}
          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">// DYNAMIC POSTER MODULE FACTORY / A+ 模块智造生成</span>
            <button 
              type="button"
              onClick={() => {
                handleAddAplusBlock(true);
                if (!isEditMode && setIsEditMode) {
                  setIsEditMode(true);
                }
                addToast("success", "新模块插入成功 / Module Appended", "已在 Plate 02 详情长图底端动态智能载入一条新的 A+ 精修大图，编辑模式并已自动激活！");
              }}
              className="w-full py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 rounded-xl text-[10px] font-bold text-white cursor-pointer transition-all flex items-center justify-center space-x-1.5 font-mono shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>添加一条新 A+ 海报模块条</span>
            </button>
          </div>

          {/* 5. Quick switcher case studies */}
          <div className="space-y-1.5 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">// ACTIVE PORTFOLIO CARRIER / 案例载体更换:</span>
            <div className="grid grid-cols-2 gap-2">
              {projectsList.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    addToast("info", `活跃案例对调为: ${p.title.split(" // ")[0]}`, "本站的主图及 Premium A+ 板块布局已自适应完成重组装配。");
                  }}
                  className={`py-1 bg-white/[0.02] hover:bg-white/[0.05] border rounded text-[9.5px] font-mono uppercase font-bold text-center truncate cursor-pointer ${activeProjectId === p.id ? "border-[#0066ff] text-[#00d2ff] bg-[#0066ff]/10" : "border-white/5 text-zinc-400"}`}
                >
                  {p.title.split(" // ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Cloud Sync and Backup (Vercel deployment state solution!) */}
          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">// CLOUD BACKUP & SYNC / 全站已上传作品同步</span>
            <div className="space-y-1.5">
              <button 
                type="button"
                onClick={handleExportWorkspaceJson}
                className="w-full py-1.5 bg-[#0066ff]/10 hover:bg-[#0066ff]/20 border border-[#0066ff]/30 hover:border-[#00d2ff]/40 text-[#00d2ff] rounded-lg text-[9.5px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                title="导出本站所有作品、素材及微调数据成 JSON 备份文件"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>📥 备份导出全站作品数据 (.json)</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  const uploader = document.getElementById('importGlobalBackupJsonField');
                  if (uploader) uploader.click();
                }}
                className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-400/30 text-emerald-400 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                title="导入之前备份好的作品 JSON 文件，一键恢复到 Vercel 网址上！"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400 font-bold" />
                <span>📤 导入恢复/同步至新站点 (.json)</span>
              </button>
              <p className="text-[8.2px] text-zinc-500 leading-normal text-left bg-white/[0.01] p-1.5 rounded-md border border-white/5 font-sans scale-95 origin-center">
                💡 <b>Vercel同步说明</b>：Vercel是纯静态托管，其本地存储由您的浏览器域名独立隔离。您只需在此处点击<b>“备份导出”</b>，然后登录您的 Vercel 站点打开相同的面板点击<b>“导入恢复”</b>，即可 1 毫秒完美克隆所有上传的作品、高清长图和自定义参数！
              </p>
            </div>
          </div>

          <div className="text-[8.5px] text-zinc-500 leading-relaxed font-sans space-y-1 text-left">
            <div className="flex items-start">
              <span className="text-[#00d2ff] mr-1">▶</span>
              <span>三类子页动态无缝流转，体验完整智造链路。</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#0066ff] mr-1">▶</span>
              <span>主图和 A+ 板块随活跃案例动态更换。</span>
            </div>
          </div>
        </div>

         {/* Website Function Collection Button / 呼出控制大台 - Optimized as a floating round circle dot (小圆点) */}
        <button 
          type="button"
          onClick={() => {
            if (isVerified) {
              setIsAnkerPanelOpen(!isAnkerPanelOpen);
            } else {
              onOpenLoginModal();
            }
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center ${
            isVerified 
              ? "bg-[#0066ff] hover:bg-[#00d2ff] hover:shadow-[0_0_20px_rgba(0,102,255,0.4)] text-white" 
              : "bg-amber-600 hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] text-white"
          } active:scale-95 shadow-xl transition-all cursor-pointer border border-white/10 group/ankertrigger relative shrink-0`}
          title={isVerified ? "网站功能修改中心 (Website Cockpit)" : "请登录管理员账号解锁此修改中心 (Login to Unlock)"}
        >
          {isVerified ? (
            <Settings className={`w-4.5 h-4.5 transition-transform duration-500 ${isAnkerPanelOpen ? 'rotate-90 text-[#00d2ff]' : 'text-white'}`} />
          ) : (
            <Lock className="w-4.5 h-4.5 text-white animate-pulse" />
          )}

          {/* Elegant floating tooltip matching the controller tooltips */}
          <span className="absolute right-0 bottom-14 scale-0 group-hover/ankertrigger:scale-100 transition-all origin-bottom-right whitespace-nowrap bg-zinc-950 border border-white/10 text-white font-mono font-bold text-[8.5px] py-1.5 px-3 rounded-lg shadow-xl z-[9999] pointer-events-none tracking-widest leading-none">
            {isVerified ? "⚙️ 网站功能修改合集 / COCKPIT" : "🔒 修改网站功能合集 [未授权]"}
          </span>
        </button>
      </div>

      {/* Workspace Real-time Toast Verification Panel */}
      <div className="fixed bottom-20 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-[90vw]">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.18 } }}
              className="pointer-events-auto bg-[#070b13]/95 border border-white/10 p-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl flex gap-3.5 items-start select-none relative group/toast"
            >
              {toast.type === "success" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-lg shrink-0">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                </div>
              )}
              {toast.type === "uploading" && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg shrink-0">
                  <span className="relative flex h-4.5 w-4.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-amber-500 flex items-center justify-center">
                      <Camera className="w-2.5 h-2.5 text-white animate-pulse" />
                    </span>
                  </span>
                </div>
              )}
              {toast.type === "error" && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg shrink-0">
                  <X className="w-4.5 h-4.5 text-rose-450" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="bg-[#0066ff]/15 border border-[#00d2ff]/20 p-1.5 rounded-lg shrink-0">
                  <Sparkles className="w-4.5 h-4.5 text-[#00d2ff]" />
                </div>
              )}

              <div className="flex-1 text-left">
                <h4 className="text-xs font-black text-white font-mono tracking-wider uppercase">{toast.title}</h4>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-1 font-sans font-medium">{toast.desc}</p>
                
                {/* Manual close trigger */}
                <div className="absolute top-2 right-2 opacity-0 group-hover/toast:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-zinc-500 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* General secret uploader input fields */}
      <input 
        type="file" 
        id="hiddenAnkerImageFileField" 
        accept="image/*" 
        className="hidden" 
        onChange={handleAnkerImageUpload} 
      />

      <input 
        type="file" 
        id="importGlobalBackupJsonField" 
        accept=".json" 
        className="hidden" 
        onChange={handleImportWorkspaceJson} 
      />

      {/* 浮动文字高级样式调色盘 (Notion / Medium 风格，完全无代码随意调节文字大小、粗细、颜色) */}
      {isEditMode && toolbarPos.visible && (
        <div 
          id="formatToolbar"
          style={{ 
            top: `${toolbarPos.top}px`, 
            left: `${toolbarPos.left}px`,
            position: 'absolute'
          }}
          className="z-[9999] bg-[#0c0e17]/95 border border-white/10 rounded-full px-3 py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-2.5 backdrop-blur-md"
        >
          {/* 调整大小 */}
          <button 
            type="button"
            onClick={() => formatActiveText("size-down")} 
            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all cursor-pointer" 
            title="减小字号"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => formatActiveText("size-up")} 
            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all cursor-pointer" 
            title="增大字号"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          
          {/* 调整粗细/样式 */}
          <button 
            type="button"
            onClick={() => formatActiveText("bold")} 
            className="p-1 hover:bg-white/10 rounded text-[#00d2ff] hover:text-white transition-all cursor-pointer font-extrabold text-xs" 
            title="加粗/变细"
          >
            B
          </button>
          <button 
            type="button"
            onClick={() => formatActiveText("italic")} 
            className="p-1 hover:bg-white/10 rounded text-zinc-450 hover:text-white transition-all cursor-pointer italic text-xs font-serif" 
            title="斜体"
          >
            I
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          
          {/* 配色修改 */}
          <button 
            type="button"
            onClick={() => formatActiveText("color-white")} 
            className="w-3.5 h-3.5 rounded-full bg-white border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
            title="纯白" 
          />
          <button 
            type="button"
            onClick={() => formatActiveText("color-cyan")} 
            className="w-3.5 h-3.5 rounded-full bg-[#00d2ff] border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
            title="科技青" 
          />
          <button 
            type="button"
            onClick={() => formatActiveText("color-blue")} 
            className="w-3.5 h-3.5 rounded-full bg-[#0066ff] border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
            title="电气蓝" 
          />
          <button 
            type="button"
            onClick={() => formatActiveText("color-orange")} 
            className="w-3.5 h-3.5 rounded-full bg-[#ff6b00] border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
            title="活力橙" 
          />
          <button 
            type="button"
            onClick={() => formatActiveText("color-zinc")} 
            className="w-3.5 h-3.5 rounded-full bg-zinc-500 border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
            title="极简灰" 
          />
          <div className="h-4 w-[1px] bg-white/10" />
          
          {/* 自由添加文本段与物理删除文本 */}
          <button 
            type="button"
            onClick={() => formatActiveText("add-sibling-p")} 
            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all cursor-pointer" 
            title="在当前文字下方增加新文本块"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00d2ff]" />
          </button>
          <button 
            type="button"
            onClick={() => formatActiveText("delete-node")} 
            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-all cursor-pointer" 
            title="直接物理删除此文本块"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Custom Add Sector Modal Dialogue to bypass iframe sandbox limits */}
      {isAddSectorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0c0e17] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-left animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00d2ff]" />
                <span>智造新增板块 / Add Sector</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                CREATE NEW CATEGORY FOR YOUR BRAND VISUAL PORTFOLIO
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest block">
                  板块名称 / Sector Name
                </label>
                <input
                  type="text"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  placeholder="例如: 🧴 美妆个护, 🚗 智能出行, 🎧 运动音视频"
                  className="w-full bg-zinc-950/80 border border-white/10 hover:border-white/20 focus:border-[#0066ff]/50 rounded-xl px-4 py-3 text-xs text-white outline-none font-sans"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest block">
                  排版风格 / Design Layout
                </label>
                <select
                  value={newSectorLayout}
                  onChange={(e) => setNewSectorLayout(e.target.value as any)}
                  className="w-full bg-zinc-950/80 border border-white/10 hover:border-white/20 focus:border-[#0066ff]/50 rounded-xl px-4 py-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="grid3">等宽三栏布局 (Grid 3 Columns)</option>
                  <option value="asymmetrical">非对称极简美学布局 (Asymmetrical)</option>
                  <option value="bento">前沿九宫格布局 (Bento Matrix)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsAddSectorOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all text-[11px] cursor-pointer"
              >
                取消 / Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSectorConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#0066ff] hover:bg-blue-600 border border-white/10 text-white transition-all text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>➕ 确认智造 / Create</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
