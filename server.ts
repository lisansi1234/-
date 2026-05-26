import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// Helper function to lazy-initialize GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Fallback high-end briefs if Gemini API is not configured.
const PRE_CRAFTED_BRIEFS: Record<string, any> = {
  "power_station": {
    conceptName: "AEROCORE DELTA-X",
    tagline: "Uncompromising Power, Sculpted in Dark Glass. / 极致电能爆发，精雕于装甲双层暗色玻璃。",
    heroSpecification: "2400W Monolithic Rugged Power Terminal / 2400W一体式高刚硬核储能终端",
    stylingPhilosophy: "Matte anodized carbon casing, layered with glowing battery cell conduits and a floating CNC-etched aluminum top handle. Designed to project sheer performance density. / 哑光阳极氧化碳纤维机身，层叠排布璀璨电芯流光通道与CNC浮雕精铣铝制悬浮提手。为硬核电商Listing量身打造，传递澎湃性能感。",
    metrics: {
      ctrBoost: "+112% CTR Increase [点击率提升]",
      conversionIncrease: "+34.2% Sales Conversion [销售转化拉升]",
      impressionBoost: "4.8M Impressions [月均曝光]"
    },
    explodedViews: [
      { zIndex: 1, title: "01 / ARMOR CASING / 强化装甲外壳", description: "V-0 fire-retardant polycarbonate structure with active air intakes. / V-0级最高阻燃航空防火复合聚碳酸酯，配有双侧主动制冷格栅和抗静电抗磨蚀磁吸屏蔽密封舱。", material: "Monolithic Cyber Polycarbonate / 一体式防爆高聚物", color: "#1A1A1A", highlightColor: "#FF6B00" },
      { zIndex: 2, title: "02 / IONIC THERMAL SINK / 离子真空散热器", description: "Dual-fin active cooling configuration coupled with micro-vacuum liquid heat pipes. / 流体力学双鳍主动散热片配以微米真空相变液态导热铜管，散热倍速拉升400%。", material: "Raw CNC-milled 6061 Aluminum / 航空级6061精铣铝合金", color: "#444444", highlightColor: "#00E5FF" },
      { zIndex: 3, title: "03 / FLUID CORES / 动能高密电芯群", description: "Heavy-density battery columns stacked in parallel highways for ultra-fast wattage dissipation. / 高能量密度磷酸铁鲤(LFP)蜂巢矩阵模组，专为大功率瞬时充放平顺输出设计。", material: "Lithium Iron Phosphate (LFP) Array / 极限高密磷酸铁锂矩阵", color: "#222222", highlightColor: "#FF9E00" },
      { zIndex: 4, title: "04 / CORE BMS CONTROLLER / 智能电控母板", description: "State-of-the-art battery monitor chipset processing 200 checks per millisecond. / 搭载新一代双硅控制保护芯片，每毫秒执行200次极限高安全负载与热态环路监测。", material: "Silicon Solder Gold-Plated PCB / 极厚多层沉金双贴片主板", color: "#0B192C", highlightColor: "#10B981" }
    ],
    renderDirectives: [
      { phase: "A-ROLL / BACKLIT HERO / 逆光英雄场景", description: "Position high-contrast point light source at 135 degrees behind the chassis, creating a sharp orange outline reflecting off the matte finish. / 将135度轮廓聚光置于机身后侧，塑造一缕极富张力的橙色冷光雕刻边缘线，充分凸显磨砂磨蚀质感。", hardwareTerm: "Backlit Halo Framing / 轮廓逆光框架" },
      { phase: "B-ROLL / EXPLODED LAYER / 部件高精度拆解", description: "Use narrow 85mm lens with shallow depth of field. Stagger component highlights so individual circuit elements catch the micro-lens flare. / 借助85mm肖像压缩端焦距，浅景深分离前景层级。让微小的精密电解电容反射出柔和绚烂的镜头光晕。", hardwareTerm: "Macro Depth Separation / 微距景深分离" }
    ],
    brandNarrative: "Engineered for explorers who command absolute power. This design turns a utility appliance into a high-technology talisman. / 专为那些执着于纯粹实力的科技买家研发。拆解式视觉语言瞬间击碎虚浮的品质疑虑，将一款普通的户外工具跃升为让人极欲据为己有的科技图腾。"
  },
  "earbuds": {
    conceptName: "NEXUS SILENCE-9",
    tagline: "Sound Extracted into Pure Minimalism. / 声音，已淬炼至极致极简之境。",
    heroSpecification: "Beryllium-Coated Acoustic Capsule with Zero Static / 绝无杂音的溅射镀铍轻质声学胶囊",
    stylingPhilosophy: "Frosted acoustic chambers, translucent stems showcasing gold-plated micro-inductors, and a monolithic geometric induction case. / 搭配半透明雾面亚克力机身，内部金合金微型螺线电感完全显露，静立于一体几何磁吸电极底座之上。",
    metrics: {
      ctrBoost: "+114% CTR Gain [点击率飙升]",
      conversionIncrease: "+28.5% Sales CR [销售转化提升]",
      impressionBoost: "2.1M Impressions [月均触达]"
    },
    explodedViews: [
      { zIndex: 1, title: "01 / ACOUSTIC DOME / 纯净声学顶罩", description: "Ultralight beryllium dome with bespoke high-tension gaskets eliminating housing resonance. / 轻质抗拉伸覆铍金属球顶，辅以定制硅酮声学垫圈，从物理源头彻底过滤腔体共振杂音。", material: "Sputtered Beryllium-Coated Polymer / 高附着镀铍溅射高聚物", color: "#111111", highlightColor: "#FF6B00" },
      { zIndex: 2, title: "02 / INTEGRATED CHIPSET / 混合主动降噪芯片", description: "Ultra-low power processor with active neutral sound stage processing and dynamic driver feedback. / 顶级超低功耗主动消噪ASIC核心，智能匹配外部频谱并提供微秒级实时频率反馈修正频率曲线。", material: "Silicon Shield Layer / 微型高集成硅负荷屏蔽层", color: "#1A1B20", highlightColor: "#00E5FF" },
      { zIndex: 3, title: "03 / INDUCTOR GASKETS / 触屏感应腔体", description: "Tactile outer shell with integrated copper charging loops, protected by high-tolerance silica. / 集成电敏铜圈的极紧凑壳体结构，表面附着亲肤防划硬质耐磨透明氟橡胶层。", material: "Translucent Tempered Silica / 顶奢高透抗划氟胶", color: "#333333", highlightColor: "#FFB800" }
    ],
    renderDirectives: [
      { phase: "LIGHTING / SILHOUETTE / 轮廓雕刻光", description: "High-contrast rim lighting showcasing the translucent acrylic skin. Muted shadows to emphasize weightless geometry. / 精巧勾勒透明腔体外侧肌理的切线光。压低反射调性，以此衬托耳机的空气感悬浮形态与轻盈量感。", hardwareTerm: "Rim Light Silhouette / 倒影边缘轮廓光" }
    ],
    brandNarrative: "An uncompromised acoustic sculpture. It represents the quiet space between chaotic soundwaves. / 绝无妥协妥协意图的声学雕塑。它不仅是个工业品，更是混沌电磁波里的一方纯粹幽静，专为攻占亚马逊高端高精耳机Listing首屏设计。"
  },
  "keyboard": {
    conceptName: "KINETIC BASE-1",
    tagline: "Industrial Geometry for High-Speed Inputs. / 为光速飞驰的设计输入而重塑机械工业几何。",
    heroSpecification: "Open-Frame Hot-Swappable Input Rig / 开放式无锁孔热插拔重装备极客键盘",
    stylingPhilosophy: "Laser-welded cold-rolled steel baseboard, floating magnetic switch matrices, and thick injection-molded absolute gray legend caps. / 全冷轧碳钢淬火底盘结构，配合全悬浮磁吸微尘轴座、以及双色温热化学工艺凝结而成的重工业冷灰磨砂键帽。",
    metrics: {
      ctrBoost: "+98% CTR Increase [点击率跃升]",
      conversionIncrease: "+41% Sales CR [转化倍率暴涨]",
      impressionBoost: "3.5M Impressions [品牌覆盖]"
    },
    explodedViews: [
      { zIndex: 1, title: "01 / SOLID STEEL FRAME / 坦克级钢制底刚", description: "High-mass solid structural chassis preventing structural flex and enhancing acoustic register. / 高刚性炭钢一体定位底框，完美吸收并抵消高频打字回弹空鼓音，输出干净脆生声响。", material: "Cold-Rolled Carbon Steel / 重离子冷轧防锈高刚性钢", color: "#222222", highlightColor: "#FF6B00" },
      { zIndex: 2, title: "02 / TRANSLUCENT MATRICES / 透色发光轴盘", description: "Individual floating PCB sectors stacked above silicone rubber shock absorbers. / 分立式独立柔性印制线路块，在极高压键程下能给予无段落敏锐触发和绝佳缓冲反馈。", material: "Frosted Organic Polycarbonate / 磨砂高耐温热塑性纤维板", color: "#111111", highlightColor: "#00E5FF" },
      { zIndex: 3, title: "03 / GASKET CORE SYSTEM / 阻尼消音中腔", description: "Poron shock vibration dampeners designed to trap high frequencies and produce an acoustic deep pop sound. / 采用进口级多气孔Poron减震胶垫，锁止冗余机械摩擦，敲击时呈现致密扎实的绝妙麻将音。", material: "High-Density Poron Compound / 进口密闭孔发泡Poron减震泡沫", color: "#333333", highlightColor: "#FFB800" }
    ],
    renderDirectives: [
      { phase: "CINEMATIC DRIFT / 电影级幽蓝掠影", description: "Slow 24fps horizontal panning highlight, capturing the dynamic mechanical spring actions inside keycaps. / 采用微量电影级烟雾烘托氛围，让水平滑轨24帧主副摄影机柔美扫过琴键，留下精密轴心复位的绝妙一瞬。", hardwareTerm: "Dynamic Dust Particles / 动态极细微粒悬浮" }
    ],
    brandNarrative: "For creators who feel the mechanical weight of absolute precision. / 让追求绝对精准感的创作者指尖尽享微观机械分量。粗犷生钢的刚猛质地夹杂精密电路芯片，是高级黑桌搭玩家永恒的心头好物。"
  }
};

// API Endpoint for generating customized high-end product e-commerce briefs using Gemini
app.post("/api/gemini/generate-brief", async (req, res) => {
  const { productName, designStyle, extraRequirements } = req.body;

  if (!productName || productName.trim() === "") {
    return res.status(400).json({ error: "Product name is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // If Gemini is not set up, select appropriate pre-crafted brief based on product query or default
    console.log("GEMINI_API_KEY not set or invalid. Loading premium local fallback generator draft.");
    const query = (productName + " " + designStyle).toLowerCase();
    let responseBrief = PRE_CRAFTED_BRIEFS.power_station;

    if (query.includes("ear") || query.includes("headphone") || query.includes("audio") || query.includes("sound")) {
      responseBrief = { ...PRE_CRAFTED_BRIEFS.earbuds };
    } else if (query.includes("key") || query.includes("board") || query.includes("type") || query.includes("pc")) {
      responseBrief = { ...PRE_CRAFTED_BRIEFS.keyboard };
    } else {
      // Modify fallback name slightly based on user input for dynamic e-commerce experience!
      responseBrief = {
        ...PRE_CRAFTED_BRIEFS.power_station,
        conceptName: `AEROCORE ${productName.toUpperCase().replace(/\s+/g, '-')}`,
        tagline: `Uncompromising e-commerce conceptualization of ${productName}.`,
        stylingPhilosophy: `Specially crafted for the ${designStyle || "Apple Minimal + EcoFlow Hardcore"} aesthetic. Fuses premium material textures, rich backlit highlights, and high-contrast glassmorphism layers tailored for professional Amazon storefront listings.`
      };
    }

    return res.json({
      success: true,
      data: responseBrief,
      isFallback: true
    });
  }

  try {
    const prompt = `
      You are an Elite E-commerce Creative Director and Product Design Strategist specializing in premium Amazon storefront listings (A+ Content, Hero Banners, 3D Renders).
      Create a comprehensive, high-impact product design & visual render specification that blends:
      - Apple-style high-end minimalist elegance (whitespace, typography, subtle gradients, functional honesty)
      - EcoFlow-style hardcore tech hardware (exploded views, structural honesty, high performance details, rugged metal & neon lighting).

      Target Product Name/Category: "${productName}"
      Requested Aesthetic/Design Style: "${designStyle || "Apple Minimalist x EcoFlow High-Hardware"}"
      Additional Parameters/Requirements: "${extraRequirements || "None"}"

      IMPORTANT: You must write ALL output strings (except colors, id keys, or short numbers) in a BILINGUAL format of:
      "English Text / 中文翻译"
      Example taglines: "Uncompromising Power, Sculpted in Dark Glass. / 极致电能爆发，精雕于暗色玻璃装甲。"
      Example titles: "01 / ARMOR CASING / 强化装甲外壳"
      Provide descriptions, styling philosophies, brand narratives, and hardware terms fully detailed in both English and professional Chinese, separated by a "/".

      Provide the complete output in valid JSON matching the schema outlined below. Do not add any backticks or extra text outside the JSON output.

      Schema structure to conform to:
      {
        "conceptName": "A sleek, uppercase brand name",
        "tagline": "Bilingual tagline phrase ('English / 中文')",
        "heroSpecification": "Bilingual high-end technical specification phrase ('English under 6 words / 中文')",
        "stylingPhilosophy": "Bilingual short paragraph describing materials, textures, active lighting, and structural highlights ('English / 中文')",
        "metrics": {
          "ctrBoost": "Bilingual expected click-through rate percentage increase (e.g. '+95% CTR Gain / 点击率提升95%')",
          "conversionIncrease": "Bilingual expected conversion increase (e.g. '+31% Sales / 销售转化提升31%')",
          "impressionBoost": "Bilingual expected monthly reach/impressions (e.g. '3.2M Impressions / 月均曝光320万')"
        },
        "explodedViews": [
          {
            "zIndex": 1,
            "title": "Bilingual layer name (e.g. '01 / REINFORCED CHASSIS / 极稳加固框架')",
            "description": "Bilingual technical description highlighting materials and precision-engineered assembly details ('English / 中文')",
            "material": "Bilingual material name (e.g. 'Aero-grade titanium alloys / 航空级钛合金')",
            "color": "Hex color code matching this component (e.g. '#2A2A2A')",
            "highlightColor": "Hex highlight glowing color code (e.g. '#FF6B00')"
          }
          // provide 3 to 4 modular layers in logical stack order (outer casing, internal heat sink/wiring, cores/main engine, battery/pcb board)
        ],
        "renderDirectives": [
          {
            "phase": "Bilingual high-impact production phase (e.g. 'LIGHTING SETUP / 精准光照制式')",
            "description": "Bilingual dynamic tip for the render artist (e.g. backlit setups, Rim Light Halo / 中文说明)",
            "hardwareTerm": "Bilingual extreme technical studio term (e.g. 'Anamorphic Lens Flare / 变形宽银幕光晕')"
          }
        ],
        "brandNarrative": "Bilingual quick e-commerce pitch explaining how this specific combination hooks Amazon buyers and dominates listings ('English / 中文')"
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            heroSpecification: { type: Type.STRING },
            stylingPhilosophy: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                ctrBoost: { type: Type.STRING },
                conversionIncrease: { type: Type.STRING },
                impressionBoost: { type: Type.STRING }
              },
              required: ["ctrBoost", "conversionIncrease", "impressionBoost"]
            },
            explodedViews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  zIndex: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  material: { type: Type.STRING },
                  color: { type: Type.STRING },
                  highlightColor: { type: Type.STRING }
                },
                required: ["zIndex", "title", "description", "material", "color", "highlightColor"]
              }
            },
            renderDirectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  description: { type: Type.STRING },
                  hardwareTerm: { type: Type.STRING }
                },
                required: ["phase", "description", "hardwareTerm"]
              }
            },
            brandNarrative: { type: Type.STRING }
          },
          required: ["conceptName", "tagline", "heroSpecification", "stylingPhilosophy", "metrics", "explodedViews", "renderDirectives", "brandNarrative"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsedData,
      isFallback: false
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate design specification" });
  }
});

// API Endpoint for the AI Portfolio Designer Assistant
app.post("/api/portfolio/chat", async (req, res) => {
  const message = req.body.message || req.body.prompt;
  if (!message || String(message).trim() === "") {
    return res.status(400).json({ error: "Message is required / 请提供信息" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Return high-quality pre-designed responses based on user keywords
    const lowerMessage = message.toLowerCase();
    let reply = "Hello! I am your AI Design Assistant specializing in elite Amazon e-commerce layouts. / 您好！我是您的 AI 智造设计顾问，专注于亚马逊高端电商视觉优化。";
    
    if (lowerMessage.includes("ctr") || lowerMessage.includes("点击")) {
      reply = "To boost your CTR, optimize your Hero Images using high-contrast 3D materials (anodized metals, illuminated cores) and micro-depth focus. Apple-style whitespace draws attention dynamically. / 为了提高点击率(CTR)，推荐使用高对比度 3D 材质渲染首图（如阳极氧化钛、发光电组电芯）以及精准微距浅景深。苹果级的留白排版能瞬间在平庸白底主图中脱颖而出！";
    } else if (lowerMessage.includes("works") || lowerMessage.includes("作品") || lowerMessage.includes("case")) {
      reply = "Take a look at DELTA-ION PRO (Hardcore Power Station case) and NEXUS SILENCE-9 (Apple Minimal earbuds). These cases generated up to +114% CTR improvement. / 您可以点击Works作品面板查看 DELTA-ION PRO (2400W 户外电源重工业风) 以及 NEXUS SILENCE-9 (苹果风声学降噪耳机)。这些实战案例在出海品牌中创造了高达 +114% 极佳的点击表现。";
    } else if (lowerMessage.includes("about") || lowerMessage.includes("who") || lowerMessage.includes("关于")) {
      reply = "I am a senior Amazon E-Commerce Design Director. I fuse high-tech structural hardware layers (EcoFlow style) with hyper-minimalist elegant layouts (Apple style). / 我是一名资深的亚马逊出海电商视觉创意总监。我擅长将硬核硬件构造细节（EcoFlow工业流派）与极致通透的负留白排版（Apple 艺术流派）进行殿堂级碰撞融合。";
    } else if (lowerMessage.includes("a+") || lowerMessage.includes("layout") || lowerMessage.includes("版式")) {
      reply = "Elite A+ Layouts must be monolithic or sparse in rhythm. Avoid cluttered specifications. Introduce material highlight cards and active exploded structures. / 顶奢级 A+ 排版讲究的是留白节奏与物理拆解的‘结构诚实’。摒弃粗糙杂乱的多字模块，多加指定材质的高清透视卡片，以解答安全性及溢价质感。";
    } else {
      reply = `As an elite Amazon design assistant, I evaluate that "${message}" would benefit from: 1. Deep micro-material rendering, 2. Strict Apple-style bounding boxes, 3. Highlighted thermal parameters to justify high-pricing tiers. / 作为一个亚马逊高端设计专家助理，针对您提到的 "${message}"，建议采用以下三重法门：1. 微观材质逼真打磨，2. 极其克制的苹果风安全视区包裹，3. 用炫酷的结构参数为品牌的高端溢价立论。`;
    }

    return res.json({ success: true, reply });
  }

  try {
    const prompt = `
      You are the elite digital twin AI Assistant of an E-commerce Design Director who specializes in high-end Amazon product imagery, Apple-style minimalist landing design, and EcoFlow-style hardcore hardware 3D exploded render strategy.
      Your goal is to answer queries from potential Amazon sellers, brand managers, and design enthusiasts.
      Acknowledge yourself as the designer's intelligent agent. Speak with authoritative professionalism, high taste, design passion, and structure.

      CRITICAL: You must answer in a BILINGUAL format (English followed by a professional Chinese translation, separated by a slash '/' or structured paragraphs).
      
      User's query: "${message}"
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply = response.text || "Failed to formulate response.";
    return res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return res.status(500).json({ error: error.message || "Failed to communicate with AI Assistant" });
  }
});

// Helper to get image keys from the public/db_images folder
function getExistingDbImageKeys(): Record<string, string> {
  const imagesMap: Record<string, string> = {};
  const dbImagesDir = path.join(process.cwd(), "public", "db_images");
  if (fs.existsSync(dbImagesDir)) {
    try {
      const files = fs.readdirSync(dbImagesDir);
      files.forEach(file => {
        if (file.startsWith("db_img_")) {
          const key = path.basename(file, path.extname(file)); // key = db_img_177969087
          imagesMap[key] = `/db_images/${file}`;
        }
      });
    } catch (err) {
      console.warn("Error reading db_images dir:", err);
    }
  }
  return imagesMap;
}

// API Endpoint to write current client layout and text customizations directly into source code files
app.post("/api/save-defaults", (req, res) => {
  try {
    const { localStorageDump } = req.body;
    if (!localStorageDump) {
      return res.status(400).json({ error: "Missing layout customization payload" });
    }

    const dataDir = path.join(process.cwd(), "src", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "persisted_defaults.json");

    // Prune images that are no longer referenced in the saved projects list to prevent bloating the package
    let projectsList: any[] = [];
    try {
      const projectsRaw = localStorageDump["anker_blue_projects_v2"];
      if (projectsRaw) {
        projectsList = JSON.parse(projectsRaw);
      }
    } catch (e) {
      console.warn("Could not parse target projectsList for image-cleanup:", e);
    }

    if (projectsList && projectsList.length > 0) {
      const activeKeys = new Set<string>();
      projectsList.forEach((p: any) => {
        if (p.img && p.img.startsWith("db_img_")) {
          activeKeys.add(p.img);
        }
        if (p.mainImages) {
          p.mainImages.forEach((item: any) => {
            if (item.img && item.img.startsWith("db_img_")) {
              activeKeys.add(item.img);
            }
          });
        }
        if (p.aplusBlocks) {
          p.aplusBlocks.forEach((block: any) => {
            if (block.premiumImg && block.premiumImg.startsWith("db_img_")) {
              activeKeys.add(block.premiumImg);
            }
            if (block.competitorImg && block.competitorImg.startsWith("db_img_")) {
              activeKeys.add(block.competitorImg);
            }
            if (block.carouselSlides) {
              block.carouselSlides.forEach((slide: any) => {
                if (slide.img && slide.img.startsWith("db_img_")) {
                  activeKeys.add(slide.img);
                }
              });
            }
            if (block.gridCards) {
              block.gridCards.forEach((card: any) => {
                if (card.img && card.img.startsWith("db_img_")) {
                  activeKeys.add(card.img);
                }
              });
            }
          });
        }
      });

      // Filter and delete physical image files no longer referenced
      const dbImagesDir = path.join(process.cwd(), "public", "db_images");
      if (fs.existsSync(dbImagesDir)) {
        try {
          const files = fs.readdirSync(dbImagesDir);
          files.forEach(file => {
            if (file.startsWith("db_img_")) {
              const key = path.basename(file, path.extname(file));
              if (!activeKeys.has(key)) {
                fs.unlinkSync(path.join(dbImagesDir, file));
                console.log(`Pruned physical image: ${file}`);
              }
            }
          });
        } catch (pruneErr) {
          console.warn("Failed to prune physical image files:", pruneErr);
        }
      }
    }

    // Keep dbImagesMap EMPTY inside persisted_defaults.json to keep it extremely lightweight
    const payload = {
      localStorageDump,
      dbImagesMap: {}
    };

    fs.writeFileSync(
      filePath,
      JSON.stringify(payload, null, 2),
      "utf-8"
    );

    console.log(`Successfully persisted active state details to persisted_defaults.json!`);
    return res.json({ 
      success: true, 
      message: "Custom database defaults committed directly to local repository! (成功将最新站存数据永久淬炼进本地仓库代码)" 
    });
  } catch (err: any) {
    console.error("Save defaults error:", err);
    const isReadOnly = err.code === "EROFS" || 
                       (err.message && (err.message.includes("read-only") || err.message.includes("readonly") || err.message.includes("permission denied"))) ||
                       process.env.VERCEL || 
                       process.env.NOW_BUILDER;
    
    if (isReadOnly) {
      return res.status(500).json({ 
        error: "检测到当前运行在只读生产环境 (如 Vercel 部署)。\n\n「永久源码固化 / Persistent Save」必须在 AI Studio 开发平台或本地开发中运行，因为它需要直接写入项目工程的文件。\n\n💡 完美解决方案：\n1. 请在您的 **AI Studio 蓝图开发面板** 中点击此按钮 (永久源码固化)。\n2. 点击后，开发平台会自动将定制图像、分类排版淬炼并编译写入本地代码底座中。此时您再次推送至 GitHub/重新触发 Vercel 部署，生产环境就会一劳永逸加载本套默认站存，全球访问无需手动导入备份！" 
      });
    }
    return res.status(500).json({ error: err.message || "Failed to commit layout changes to repository." });
  }
});

// API Endpoint to write a single custom image directly as a physical file on the server
app.post("/api/save-image", (req, res) => {
  try {
    const { key, base64 } = req.body;
    if (!key || !base64) {
      return res.status(400).json({ error: "Missing image key or base64 data" });
    }

    const publicDir = path.join(process.cwd(), "public");
    const dbImagesDir = path.join(publicDir, "db_images");
    if (!fs.existsSync(dbImagesDir)) {
      fs.mkdirSync(dbImagesDir, { recursive: true });
    }

    // Decode base64 to binary buffer
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const filePath = path.join(dbImagesDir, `${key}.png`);
    fs.writeFileSync(filePath, buffer);

    console.log(`Successfully saved image physically to: /public/db_images/${key}.png`);
    return res.json({ success: true, message: `Image ${key} physically saved successfully.` });
  } catch (err: any) {
    console.error("Save single image error:", err);
    const isReadOnly = err.code === "EROFS" || 
                       (err.message && (err.message.includes("read-only") || err.message.includes("readonly") || err.message.includes("permission denied"))) ||
                       process.env.VERCEL || 
                       process.env.NOW_BUILDER;
    
    if (isReadOnly) {
      return res.status(500).json({ 
        error: "检测到当前运行在只读生产环境 (如 Vercel 部署)。\n\n「永久源码固化 / Persistent Save」必须在 AI Studio 开发平台或本地开发中运行，因为它需要直接写入项目工程文件...\n\n💡 完美解决方案：\n1. 请在您的 **AI Studio 蓝图开发面板** 中点击此按钮 (永久源码固化)。\n2. 点击后，开发平台会自动将定制图像、分类排版淬炼并编译写入本地代码底座中。此时您再次推送至 GitHub/重新触发 Vercel 部署，生产环境就会一劳永逸加载本套默认站存，全球访问无需手动导入备份！" 
      });
    }
    return res.status(500).json({ error: err.message || "Failed to save the image to repository defaults." });
  }
});

// API Endpoint to yield raw persisted defaults directly from server-side files at runtime
app.get("/api/get-defaults", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "persisted_defaults.json");
    let payload: any = { localStorageDump: {}, dbImagesMap: {} };
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      payload = JSON.parse(data);
    }
    // Mix in the existing physical image files so frontend knows what is already saved!
    payload.dbImagesMap = { ...payload.dbImagesMap, ...getExistingDbImageKeys() };
    return res.json(payload);
  } catch (err: any) {
    console.error("Get defaults error:", err);
    return res.status(500).json({ error: "Failed to load up-to-date defaults from storage" });
  }
});

// Configure Vite or Static Asset File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully operating at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV === "production" ? "PROD" : "DEV"} mode.`);
  });
}

startServer();
