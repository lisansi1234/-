import { CaseStudy, SiteMapNode } from "./types";

export const PORTFOLIO_CASE_STUDIES: CaseStudy[] = [
  {
    id: "delta-ion",
    title: "DELTA-ION PRO // 德尔塔-离子航天级移动电源",
    category: "Hardcore Tech / Solar Power [硬核科技 / 太阳能储能]",
    tagline: "Industrializing wattage output for the digital nomad | 为全球数字游民工业化重构电能输出。",
    description: "An elite visual re-engineering for high-capacity battery packs. We replaced uninspired plastics with structural sandblasted aluminum and glowing custom venting pipelines to solve consumer thermal safety doubts. / 高容量电池组的视觉重构。我们用磨砂氧化铝结构和发光散热管道替代了平庸的塑料外壳，瞬间打消消费者对安全性疑虑，奠定科技质感。",
    stats: [
      { label: "Click-Through Rate (CTR) 点击率", value: "+94% CTR Gain [点击率增幅]", detail: "A/B tested against original listing / 相比普通首图A/B测试" },
      { label: "Amazon Conversion Rate 转化率", value: "34.2% Peak [极限转化率]", detail: "Significant boost in conversion category / 同品类转化率巅峰指标" },
      { label: "Delivered Brand Assets 设计交付", value: "14.2k High-Res [万张高分辨率图]", detail: "A+ content, listings, and packaging / A+详情页、首图及全球化包装" }
    ],
    technicalTerm: "Thermal Backlight / 逆光环形框",
    materials: ["CNC-6061 Anodized Aluminum 阳极氧化铝", "Optic Glass Enclosure 光学钢化玻璃", "V-0 Flame-Retardant Polymer V0防爆高聚物"],
    imageUrl: "/src/assets/images/regenerated_image_1779358129423.jpg"
  },
  {
    id: "aero-capsule",
    title: "VIRTUS ACOUSTIC-1 // 维特斯极简智能声学耳机",
    category: "Apple Minimal / Smart Audio [苹果式极简 / 智能音频]",
    tagline: "A delicate vacuum of absolute acoustic silence | 提取至纯极简的声学真空。",
    description: "A clinic in minimal physical scale. Visualizing dynamic audio flows utilizing translucent acoustic diaphragms, gold-alloy charging conduits, and custom-sputtered beryllium-coated dome renders. Every shot respects physical scale and premium visual purity. / 极简几何比例的典范。通过半透明声学振膜、金合金导电路径及定制溅射铍振膜渲染，完美呈现微观物理质感、严密装配逻辑与极高视觉纯净度。",
    stats: [
      { label: "CTR Improvement 点击率拉动", value: "+114% Boost [点击率飙升]", detail: "Amazon luxury audio tier average / 亚马逊奢侈音频品类均值" },
      { label: "Return Rates Drop 退货率拉平", value: "-46% Reduced [退货率骤降]", detail: "Due to hyper-detailed material charts / 归功于高精度三维材质拆解图" },
      { label: "Storefront Revenue 店铺新增营收", value: "$4.8M Added [增加约合480万美元]", detail: "Within 60 days post-launch / 上线后首个双月销售增额" }
    ],
    technicalTerm: "Macro Depth / 宏观景深分离",
    materials: ["Translucent Toughened Silica 钢化透明硅胶", "Beryllium-Coated Film 高附着铍涂层", "Sputtered Aurum Contacts 溅射金触点"],
    imageUrl: "/src/assets/images/regenerated_image_1779358241231.jpg"
  },
  {
    id: "titan-rig",
    title: "KINETIC-BASE COMPACT // 动能客制化机械键盘",
    category: "Tactile Mechanical Industrial [硬核机械工业美学]",
    tagline: "Uncompromising input weight designed for creators | 为极客创作者而生的无妥协机械输入重器。",
    description: "Emphasizing physical density and technical feedback. Highlights include high-mass iron frame backboards, isolated gasket suspension columns, and individual switches catching laser light sweeps. We targeted high-end software developers and mechanical layout purists. / 强物理量感与触觉阻尼。采用高配重钢制定位板、硅胶隔离垫片悬吊及定制磨砂PBT键帽。专为精细创作者与代码极客打造，营造顶级客制化细节体验。",
    stats: [
      { label: "Page Views Time 停留时长", value: "+180 sec [页面驻留多3分钟]", detail: "Customers spent longer gazing at A+ / 消费者在详情页的黄金视区平均多停留" },
      { label: "Conversion Lift 转化倍数", value: "4.8x Higher [转化增幅达4.8倍]", detail: "Compared to default brand layout / 相比出厂默认基础白底图" },
      { label: "Cart Add Rate 加购留存", value: "28% Rise [加购比率拉升]", detail: "Directly attributed to high-fidelity videos / 得益于视频渲染与动态材料解析" }
    ],
    technicalTerm: "Cinematic Laser Scan / 激光扫掠",
    materials: ["Laser-Welded Spring Steel 激光焊接绷钢", "Poron Polyurethane Compound 进口Poron发泡消音棉", "High-Density PBT Keycaps 高克重PBT热升华键帽"],
    imageUrl: "/src/assets/images/regenerated_image_1779358272739.jpg"
  }
];

export const TECHNICAL_SITE_MAP: SiteMapNode[] = [
  {
    name: "01 / HERO SYNTHESIZER [AI 视觉智造舱]",
    description: "Interact with Gemini in real time to generate product designs, custom exploded layers, and rendering blueprints. / 实时交互设计沙盒，生成顶奢产品设计、精密部件拆解图层及视觉灯光指令。",
    path: "#hero-generator",
    techKeywords: ["React.useState", "Express API Proxy", "Gemini-3.5-Flash Schema"]
  },
  {
    name: "02 / 3D DISASSEMBLY CANVAS [3D 交互拆解画布]",
    description: "An interactive, multi-layer physical exploded view simulator with dynamic spacing state controller. / 支持微米级间距控制的多层级 3D 物理拆解透视模拟舱，营造硬核工业操纵感。",
    path: "#exploded-view",
    techKeywords: ["CSS 3D Transforms", "Framer Motion", "Hover-State Highlight"]
  },
  {
    name: "03 / AMAZON CONVERSION SHOWCASE [转化率案例库]",
    description: "Elite case studies emphasizing brand narrative, visual click-through success metrics, and physical-materials lists. / 深度解析硬核硬件、美学风格与转化率跃升的实战案例阵地。",
    path: "#case-studies",
    techKeywords: ["Grid Layouts", "Scale Transformations", "Lucide Icons"]
  },
  {
    name: "04 / A+ CONTENT TRANSFORMER [A+ 细节比对室]",
    description: "Interactive wireframe layout simulation demonstrating e-commerce product listings transformation from basic to premium. / 交互式视察仪，一键切换沙盒排版，还原普通Listing到 AEROCORE 顶级视觉的神奇蜕变。",
    path: "#aplus-transformer",
    techKeywords: ["Dynamic Templates", "Visual Comparison Rails"]
  },
  {
    name: "05 / CORE SPECS & CONSOLIDATED STACK [技术栈地图]",
    description: "A complete diagnostic technical overview detailing our high-end frontend layout technologies. / 详解驱动极致流畅动画与极致响应速度的前端技术架构体系。",
    path: "#tech-stack",
    techKeywords: ["Tailwind CSS v4", "Lucide-React", "Vite Bundler"]
  }
];
