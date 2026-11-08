(function () {
  "use strict";

  const DATA = window.ARELITA_DATA || { characters: [], attributeCategories: [] };
  const characters = Array.isArray(DATA.characters) ? DATA.characters : [];

  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Canonical World-Setting Races
  const CANONICAL_RACES = [
    "人類", "惡魔", "天使", "墮天使", "元素族", "獸人族",
    "龍族", "亡靈族", "不死族", "血魔族", "妖精族", "幻想種",
    "吸血鬼", "妖怪", "妖魔", "精靈", "史萊姆妖",
    "巨人族", "矮人族", "哥布林族", "影魔族",
    "不明種族"
  ];

  const POPULAR_QUICK_RACES = [
    { label: "全部", value: "" },
    { label: "👤 人類", value: "人類" },
    { label: "😈 惡魔", value: "惡魔" },
    { label: "🪽 天使", value: "天使" },
    { label: "🖤 墮天使", value: "墮天使" },
    { label: "🐉 龍族", value: "龍族" },
    { label: "🐾 獸人族", value: "獸人族" },
    { label: "🔥 元素族", value: "元素族" },
    { label: "💀 亡靈／不死", value: "GROUP_UNDEAD" },
    { label: "🩸 血魔／吸血鬼", value: "GROUP_BLOOD" },
    { label: "🦊 妖怪／妖魔", value: "GROUP_YOKAI" },
    { label: "✨ 幻想種／精靈", value: "GROUP_FANTASY" }
  ];

  function extractCharacterRaces(rawRace) {
    const s = String(rawRace || "").trim();
    if (!s || s === "不明" || s === "未知" || s === "?") {
      return ["不明種族"];
    }
    const matched = new Set();
    if (/人類|人族/.test(s)) matched.add("人類");
    if (/墮天使/.test(s)) matched.add("墮天使");
    if (/(^|[^墮])天使/.test(s)) matched.add("天使");
    if (/惡魔/.test(s)) matched.add("惡魔");
    if (/元素|水族|火族|草族|光族|暗族|風族/.test(s)) matched.add("元素族");
    if (/獸人/.test(s)) matched.add("獸人族");
    if (/龍/.test(s)) matched.add("龍族");
    if (/亡靈/.test(s)) matched.add("亡靈族");
    if (/不死/.test(s)) matched.add("不死族");
    if (/血魔/.test(s)) matched.add("血魔族");
    if (/妖精/.test(s)) matched.add("妖精族");
    if (/幻想種/.test(s)) matched.add("幻想種");
    if (/吸血鬼|吸血種/.test(s)) matched.add("吸血鬼");
    if (/妖怪|妖狐|鬼族/.test(s)) matched.add("妖怪");
    if (/妖魔/.test(s)) matched.add("妖魔");
    if (/精靈/.test(s)) matched.add("精靈");
    if (/史萊姆/.test(s)) matched.add("史萊姆妖");
    if (/巨人/.test(s)) matched.add("巨人族");
    if (/矮人/.test(s)) matched.add("矮人族");
    if (/哥布林/.test(s)) matched.add("哥布林族");
    if (/影魔/.test(s)) matched.add("影魔族");
    if (/不明|未知|機械生命體|虛空種族|靈族/.test(s)) matched.add("不明種族");
    if (matched.size === 0) matched.add("不明種族");
    return CANONICAL_RACES.filter((r) => matched.has(r));
  }

  function parseAttributeTokens(rawAttr) {
    const s = String(rawAttr || "").trim();
    if (!s || s === "無") return [];
    return s
      .split(/[,、，\n\s]+/)
      .map((t) => t.trim())
      .filter((t) => t && t !== "無");
  }

  // Fine-grained power ladder from highest rank (0) to lowest rank (46)
  const POWER_LADDER = [
    "現象級",
    "終世級",
    "降臨級",
    "神座級",
    "神王三級", "神王二級", "神王一級",
    "古神三級", "古神二級", "古神一級",
    "神明三級", "神明二級", "神明一級",
    "準神三級", "準神二級", "準神一級",
    "魔王三級", "魔王二級", "魔王一級",
    "英雄三級", "英雄二級", "英雄一級",
    "龍獸三級", "龍獸二級", "龍獸一級",
    "天罰三級", "天罰二級", "天罰一級",
    "猛鬼三級", "猛鬼二級", "猛鬼一級",
    "精靈三級", "精靈二級", "精靈一級",
    "魔導三級", "魔導二級", "魔導一級",
    "騎士三級", "騎士二級", "騎士一級",
    "魔獸三級", "魔獸二級", "魔獸一級",
    "猛獸三級", "猛獸二級", "猛獸一級",
    "凡人"
  ];

  function computePowerRank(rawPower) {
    const p = String(rawPower || "").trim();
    if (!p || p === "不明" || p === "未知" || p === "?" || p.includes("待補充")) {
      return { tierIdx: -1, subGrade: 0, score: -1 };
    }
    for (let i = 0; i < POWER_LADDER.length; i++) {
      if (p.includes(POWER_LADDER[i])) {
        return { tierIdx: i, subGrade: 0, score: i };
      }
    }
    const majorTiers = [
      { name: "神王", base: 4 },
      { name: "古神", base: 7 },
      { name: "神明", base: 10 },
      { name: "準神", base: 13 },
      { name: "魔王", base: 16 },
      { name: "英雄", base: 19 },
      { name: "龍獸", base: 22 },
      { name: "天罰", base: 25 },
      { name: "猛鬼", base: 28 },
      { name: "精靈", base: 31 },
      { name: "魔導", base: 34 },
      { name: "騎士", base: 37 },
      { name: "魔獸", base: 40 },
      { name: "猛獸", base: 43 }
    ];
    for (const mt of majorTiers) {
      if (p.includes(mt.name)) {
        if (p.includes("三級")) return { tierIdx: mt.base, subGrade: 3, score: mt.base };
        if (p.includes("二級")) return { tierIdx: mt.base + 1, subGrade: 2, score: mt.base + 1 };
        if (p.includes("一級")) return { tierIdx: mt.base + 2, subGrade: 1, score: mt.base + 2 };
        return { tierIdx: mt.base + 1, subGrade: 2, score: mt.base + 1 };
      }
    }
    if (p.includes("現象")) return { tierIdx: 0, subGrade: 0, score: 0 };
    if (p.includes("終世")) return { tierIdx: 1, subGrade: 0, score: 1 };
    if (p.includes("降臨")) return { tierIdx: 2, subGrade: 0, score: 2 };
    if (p.includes("神座")) return { tierIdx: 3, subGrade: 0, score: 3 };
    if (p.includes("凡人")) return { tierIdx: 46, subGrade: 0, score: 46 };
    return { tierIdx: -1, subGrade: 0, score: -1 };
  }

  // ==================== CLEAN RARITY TIERS & PROBABILITY WEIGHT SYSTEM ====================
  // 7 個稀有度等級（N / R / SR / SSR / UR / EX / ？），越強的角色抽取機率越低
  const SUMMON_TIERS = {
    1: {
      level: 1,
      code: "N",
      stars: "★☆☆☆☆",
      name: "一般",
      fullTitle: "N（一般稀有度）",
      tierTargetRate: 0.36, // 36.0% 基礎池綜合機率
      powerRangeText: "精靈（一～三級）／ 魔導（一～三級）／ 騎士（一～三級）／ 魔獸（一～三級）／ 猛獸（一～三級）／ 凡人 ／ 未標註",
      colorPrimary: "#34d399",
      colorSecondary: "#94a3b8",
      colorGlow: "rgba(52, 211, 153, 0.78)",
      coreSymbol: "★",
      finaleMs: 2100,
      chargeKicker: "RARITY // N",
      chargeHeadline: "一般階級召喚陣啟動",
      chargeSub: "基礎魔力光束匯聚中",
      animDesc: "中央巨字依序跳出台詞 ➔ 強度 ➔ 種族 ➔ 陣營，最後展開翠綠星塵聚能光束與清脆風鈴豎琴音效。"
    },
    2: {
      level: 2,
      code: "R",
      stars: "★★☆☆☆",
      name: "精良",
      fullTitle: "R（精良稀有度）",
      tierTargetRate: 0.33, // 33.0% 基礎池綜合機率
      powerRangeText: "猛鬼（一～三級）／ 天罰（一～三級）／ 龍獸（一～三級）",
      colorPrimary: "#38bdf8",
      colorSecondary: "#60a5fa",
      colorGlow: "rgba(56, 189, 248, 0.88)",
      coreSymbol: "★★",
      finaleMs: 2300,
      chargeKicker: "RARITY // R",
      chargeHeadline: "精良階級召喚陣展開",
      chargeSub: "猛鬼／天罰／龍獸階級確認",
      animDesc: "中央巨字依序跳出台詞 ➔ 強度 ➔ 種族 ➔ 陣營，最後展開雙重逆向法陣與蔚藍彗星漩渦共鳴音效。"
    },
    3: {
      level: 3,
      code: "SR",
      stars: "★★★☆☆",
      name: "史詩",
      fullTitle: "SR（史詩稀有度）",
      tierTargetRate: 0.2, // 20.0% 基礎池綜合機率
      powerRangeText: "英雄（一～三級）／ 魔王（一～三級）／ 準神（一～三級）",
      colorPrimary: "#c084fc",
      colorSecondary: "#818cf8",
      colorGlow: "rgba(192, 132, 252, 0.92)",
      coreSymbol: "★★★",
      finaleMs: 2500,
      chargeKicker: "RARITY UPGRADE // SR",
      chargeHeadline: "史詩階級反應！紫電雷暴迸發",
      chargeSub: "英雄／魔王／準神階級確認",
      animDesc: "中央巨字依序跳出台詞 ➔ 強度（觸發藍轉紫升階）➔ 種族 ➔ 陣營，最後展開漫天紫電雷矛風暴與電音合成器音效。"
    },
    4: {
      level: 4,
      code: "SSR",
      stars: "★★★★☆",
      name: "傳說",
      fullTitle: "SSR（傳說稀有度）",
      tierTargetRate: 0.075, // 7.5% 基礎池綜合機率
      powerRangeText: "神明（一～三級）／ 古神一級 ／ 古神二級",
      colorPrimary: "#fbbf24",
      colorSecondary: "#f97316",
      colorGlow: "rgba(251, 191, 36, 0.96)",
      coreSymbol: "★★★★",
      finaleMs: 2800,
      chargeKicker: "HIGH RARITY // SSR",
      chargeHeadline: "傳說階級降臨！黃金流星雨劃破天際",
      chargeSub: "神明／古神一、二級高能反應",
      animDesc: "中央巨字依序跳出古言靈術／台詞 ➔ 強度 ➔ 種族 ➔ 陣營，最後展開耀金烈陽神柱與流星雨交響銅管號角！"
    },
    5: {
      level: 5,
      code: "UR",
      stars: "★★★★★",
      name: "神話",
      fullTitle: "UR（神話稀有度）",
      tierTargetRate: 0.025, // 2.5% 基礎池綜合機率
      powerRangeText: "古神三級 ／ 神王（一～三級）／ 特例收錄：阿撒托斯、赤夜風竹、索亞德",
      colorPrimary: "#f43f5e",
      colorSecondary: "#fde047",
      colorGlow: "rgba(244, 63, 94, 0.98)",
      coreSymbol: "★★★★★",
      finaleMs: 3100,
      chargeKicker: "ULTRA RARE // UR",
      chargeHeadline: "神話階級現世！赤金神雷與次元連斬",
      chargeSub: "古神三級／神王階級（含特例三巨頭）確認",
      animDesc: "中央巨字依序跳出台詞／稱號／武器 ➔ 強度 ➔ 種族 ➔ 陣營，最後展開赤金光翼、全畫面次元空間連斬與戰鼓管風琴音效！"
    },
    6: {
      level: 6,
      code: "EX",
      stars: "✦✦✦✦✦✦",
      name: "規格外",
      fullTitle: "EX（規格外稀有度）",
      tierTargetRate: 0.008, // 0.8% 基礎池綜合機率
      powerRangeText: "神座級 ／ 降臨級 ／ 終世級（赤夜終焉龍具備專屬【滅世龍吼】特殊動畫）",
      colorPrimary: "#fde047",
      colorSecondary: "#38bdf8",
      colorGlow: "rgba(254, 240, 138, 1)",
      coreSymbol: "EX",
      finaleMs: 3400,
      chargeKicker: "SUPREME GENESIS // EX",
      chargeHeadline: "EX 規格外降臨！神聖創世奇點與滅世終焉龍威",
      chargeSub: "神座級／降臨級／終世級確認",
      animDesc: "神座／降臨級展開【神聖創世白金虹彩奇點】；終世級【赤夜 終焉龍】則觸發專屬【滅世龍皇特殊動畫】：漫天煉獄隕石火雨、巨大金紅龍瞳與滅世龍息洪流，並伴隨震撼巨龍咆哮聲！"
    },
    7: {
      level: 7,
      code: "？",
      stars: "？？？",
      name: "現象級",
      fullTitle: "？（現象級專屬稀有度）",
      tierTargetRate: 0.002, // 0.2% 基礎池綜合機率
      powerRangeText: "現象級（賽特：邪惡魔眼風格 ／ The Abyss：始源深淵風格 ／ 莉琪雅神隱：萬寂虛空風格）",
      colorPrimary: "#ef4444",
      colorSecondary: "#9333ea",
      colorGlow: "rgba(220, 38, 38, 1)",
      coreSymbol: "？",
      finaleMs: 3900,
      chargeKicker: "FORBIDDEN PHENOMENON // ？",
      chargeHeadline: "【？】現象級降臨！三大至高存在專屬終極異象",
      chargeSub: "警告：偵測到世界觀頂點「現象級」存在",
      animDesc: "三位現象級角色各具獨立專屬動畫：【賽特 伊斐爾】為邪惡血蝕黑洞與 12 顆魔眼凝視；【The Abyss】為無底深淵黑潮漩渦与觸鬚吞噬；【莉琪雅 神隱】為萬寂無色虛空斷層與死神鐮刀次元斬裂！"
    }
  };

  // 特例升格至 UR 級別之角色名單（阿撒托斯、赤夜風竹、索亞德）
  const SPECIAL_UR_CHAR_IDS = new Set(["char-109", "char-110", "char-111"]);

  function isSpecialUrCharacter(c) {
    if (!c) return false;
    if (SPECIAL_UR_CHAR_IDS.has(c.id)) return true;
    const nm = String(c.name || "").replace(/\s+/g, "");
    return /赤夜風竹|阿撒托斯|索亞德/.test(nm);
  }

  function getSpecialAnimVariant(c) {
    if (!c) return "";
    const nm = String(c.name || "");
    if (c.id === "char-2" || /賽特/.test(nm)) return "phenom-seth-evil";
    if (c.id === "char-19" || /Abyss/i.test(nm)) return "phenom-the-abyss";
    if (c.id === "char-15" || /莉琪雅|利棋雅|神隱/.test(nm)) return "phenom-lycia-void";
    if (c.id === "char-37" || /終焉龍/.test(nm)) return "apocalypse-dragon";
    return "";
  }

  // 依據指定規則精準對應 7 個稀有度等級：
  // ？ (lvl 7): 現象級 (score === 0)
  // EX (lvl 6): 終世級(1)、降臨級(2)、神座級(3)
  // UR (lvl 5): 神王三～一級(4..6)、古神三級(7)，以及特例指定之【阿撒托斯、赤夜風竹、索亞德】
  // SSR (lvl 4): 古神二級(8)、古神一級(9)、神明三～一級(10..12)
  // SR (lvl 3): 準神三～一級(13..15)、魔王三～一級(16..18)、英雄三～一級(19..21)
  // R (lvl 2): 龍獸三～一級(22..24)、天罰三～一級(25..27)、猛鬼三～一級(28..30)
  // N (lvl 1): 精靈(31..33)、魔導(34..36)、騎士(37..39)、魔獸(40..42)、猛獸(43..45)、凡人(46)、未標註(-1)
  function getSummonTierByScore(score, c) {
    if (c && isSpecialUrCharacter(c)) return SUMMON_TIERS[5];
    if (score === 0) return SUMMON_TIERS[7];
    if (score >= 1 && score <= 3) return SUMMON_TIERS[6];
    if (score >= 4 && score <= 7) return SUMMON_TIERS[5];
    if (score >= 8 && score <= 12) return SUMMON_TIERS[4];
    if (score >= 13 && score <= 21) return SUMMON_TIERS[3];
    if (score >= 22 && score <= 30) return SUMMON_TIERS[2];
    return SUMMON_TIERS[1];
  }

  // Enrich all characters
  characters.forEach((c) => {
    c.identities = toArray(c.identities);
    c.abilities = toArray(c.abilities);
    c.profile = c.profile || {};
    c.subFaction = c.subFaction || "";
    c.power = c.power || "";
    c.story = c.story || "";
    const pRank = computePowerRank(c.power);
    c.powerTierIdx = pRank.tierIdx;
    c.powerScore = pRank.score;
    c.summonTier = getSummonTierByScore(c.powerScore, c);
    c.specialAnimVariant = getSpecialAnimVariant(c);
    c.raceCategories = extractCharacterRaces(c.profile["種族"]);
    c.attrTokens = parseAttributeTokens(c.profile["屬性"]);

    const combatList = [];
    const weaponVal = String(c.profile["武器"] || "").trim();
    if (weaponVal && weaponVal !== "無") {
      combatList.push({ type: "武器", content: weaponVal });
    }
    c.abilities.forEach((ab) => {
      if (ab && ab.type && ab.content) {
        combatList.push({ type: ab.type, content: ab.content });
      }
    });
    c.combatAbilities = combatList;
  });

  // Compute individual character base probability weight:
  // 1. Each tier's total weight matches SUMMON_TIERS[lvl].tierTargetRate
  // 2. Within the same tier, stronger characters (smaller powerScore) have lower weight than weaker ones!
  function computeCharacterBaseWeights() {
    const tierGroups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    characters.forEach((c) => {
      const lvl = c.summonTier ? c.summonTier.level : 1;
      tierGroups[lvl].push(c);
    });

    Object.keys(tierGroups).forEach((lvlKey) => {
      const lvl = Number(lvlKey);
      const group = tierGroups[lvl];
      if (group.length === 0) return;
      const tierRate = SUMMON_TIERS[lvl].tierTargetRate;

      // Relative sub-weight inside the tier: weaker (higher score) gets higher sub-weight
      let subWeightSum = 0;
      group.forEach((c) => {
        const effScore = c.powerScore < 0 ? 42 : c.powerScore;
        const subW = Math.pow(1.18, effScore);
        c._rawSubWeight = subW;
        subWeightSum += subW;
      });

      group.forEach((c) => {
        c.baseGachaWeight = (tierRate * (c._rawSubWeight / subWeightSum)) * 10000;
      });
    });
  }
  computeCharacterBaseWeights();

  function formatCharacterDisplayName(rawText) {
    if (!rawText) return "";
    const str = String(rawText).trim();
    const parts = str.split(/\s+/);
    if (parts.length > 1 && str.length >= 6) {
      return parts.map((p) => `<span class="name-word">${esc(p)}</span>`).join(" ");
    }
    return esc(str);
  }

  // Use cropped portrait images from assets/portraits/ so characters are large and centered!
  function getPortraitUrl(rawPath) {
    if (!rawPath) return "";
    return String(rawPath).replace(/^亞雷利塔角色形象[\/\\]/, "assets/portraits/");
  }

  // ==================== ALL-ATTRIBUTES HANDBOOK COLOR SYSTEM (156 ATTRIBUTES) ====================
  const ATTRIBUTE_VISUAL_SPECS = {
    // 一、火屬性（17 種）
    "火": { style: "background:#b91c1c;border-color:#f87171;color:#fff7ed;" },
    "炎": { style: "background:linear-gradient(135deg,#c2410c,#dc2626);border-color:#fb923c;color:#fff7ed;" },
    "爆炎": { style: "background:linear-gradient(135deg,#9a3412,#dc2626 58%,#6b21a8);border-color:#facc15;color:#fef9c3;box-shadow:0 0 8px rgba(250,204,21,0.28);", icon: "💥", isSupreme: true },
    "薪火": { style: "background:linear-gradient(135deg,#78350f,#ea580c);border-color:#fde047;color:#fef9c3;", icon: "🔥" },
    "紅蓮": { style: "background:linear-gradient(135deg,#881337,#e11d48 55%,#d97706);border-color:#fde047;color:#fef08a;box-shadow:0 0 9px rgba(251,191,36,0.32);", icon: "🪷", isSupreme: true },
    "黑神之炎": { style: "background:linear-gradient(135deg,#18181b 0%,#27272a 58%,#450a0a 100%);border-color:#ff4500;color:#ff9e7d;box-shadow:0 0 10px rgba(255,69,0,0.35);", icon: "✦", isSupreme: true },
    "黑神之火": { style: "background:linear-gradient(135deg,#18181b 0%,#27272a 58%,#450a0a 100%);border-color:#ff4500;color:#ff9e7d;box-shadow:0 0 10px rgba(255,69,0,0.35);", icon: "✦", isSupreme: true },
    "煉獄": { style: "background:linear-gradient(135deg,#450a0a,#991b1b 55%,#ea580c);border-color:#fb923c;color:#ffedd5;box-shadow:0 0 8px rgba(234,88,12,0.3);", icon: "🔥", isSupreme: true },
    "地獄火": { style: "background:linear-gradient(135deg,#1f0812,#7f1d1d 60%,#c2410c);border-color:#ef4444;color:#fecaca;", icon: "💀" },
    "靜默影焰": { style: "background:linear-gradient(135deg,#0f172a,#1e1b4b 55%,#7c2d12);border-color:#fb923c;color:#fed7aa;box-shadow:0 0 8px rgba(251,146,60,0.26);", icon: "🌑", isSupreme: true },
    "蒼炎": { style: "background:linear-gradient(135deg,#0c4a6e,#1d4ed8 55%,#0284c7);border-color:#38bdf8;color:#e0f2fe;box-shadow:0 0 8px rgba(56,189,248,0.3);", icon: "💠", isSupreme: true },
    "紫火": { style: "background:linear-gradient(135deg,#3b0764,#6b21a8 55%,#9d174d);border-color:#e879f9;color:#f5d0fe;" },
    "銀火": { style: "background:linear-gradient(135deg,#334155,#64748b 50%,#c2410c);border-color:#e2e8f0;color:#f8fafc;" },
    "月炎": { style: "background:linear-gradient(135deg,#1e1b4b,#4338ca 50%,#c2410c);border-color:#fde047;color:#fef9c3;", icon: "🌙" },
    "聖火": { style: "background:linear-gradient(135deg,#92400e,#ea580c 50%,#ca8a04);border-color:#fef08a;color:#fefce8;box-shadow:0 0 8px rgba(254,240,138,0.3);", icon: "✨", isSupreme: true },
    "岩漿": { style: "background:linear-gradient(135deg,#451a03,#9a3412 55%,#dc2626);border-color:#f97316;color:#ffedd5;" },
    "灰燼": { style: "background:linear-gradient(135deg,#27272a,#52525b 60%,#7c2d12);border-color:#fb923c;color:#e4e4e7;" },
    "神龍之炎": { style: "background:linear-gradient(135deg,#7f1d1d 0%,#c2410c 52%,#b45309 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 二、水與冰雪屬性
    "水": { style: "background:#1d4ed8;border-color:#60a5fa;color:#eff6ff;" },
    "海洋": { style: "background:linear-gradient(135deg,#0c4a6e,#1e3a8a 58%,#0369a1);border-color:#38bdf8;color:#e0f2fe;", icon: "🌊" },
    "源水": { style: "background:linear-gradient(135deg,#082f49 0%,#1d4ed8 52%,#0d9488 100%);border-color:#fde047;color:#fef9c3;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "👑", isSupreme: true },
    "月水": { style: "background:linear-gradient(135deg,#1e1b4b,#1d4ed8 55%,#0284c7);border-color:#fef08a;color:#e0f2fe;", icon: "🌙" },
    "霧": { style: "background:linear-gradient(135deg,#1e293b,#0f766e);border-color:#99f6e4;color:#ccfbf1;" },
    "冰": { style: "background:#0e7490;border-color:#38bdf8;color:#ecfeff;" },
    "雪": { style: "background:#0369a1;border-color:#bae6fd;color:#f0f9ff;" },
    "冰雪": { style: "background:linear-gradient(135deg,#0e7490,#1d4ed8);border-color:#7dd3fc;color:#e0f2fe;", icon: "❄️" },
    "霜": { style: "background:#155e75;border-color:#a5f3fc;color:#ecfeff;" },
    "銀雪": { style: "background:linear-gradient(135deg,#334155,#0891b2);border-color:#e2e8f0;color:#f8fafc;" },
    "冰晶": { style: "background:linear-gradient(135deg,#0891b2,#2563eb);border-color:#cffafe;color:#ecfeff;", icon: "💎" },
    "冰楔": { style: "background:linear-gradient(135deg,#164e63,#0284c7);border-color:#67e8f9;color:#cffafe;" },
    "凍魂寒霜": { style: "background:linear-gradient(135deg,#0f172a,#0e7490 55%,#581c87);border-color:#67e8f9;color:#cffafe;box-shadow:0 0 8px rgba(103,232,249,0.28);", icon: "❄️", isSupreme: true },
    "邪冰": { style: "background:linear-gradient(135deg,#1e1b38,#0e7490);border-color:#c084fc;color:#e9d5ff;" },
    "神龍之水": { style: "background:linear-gradient(135deg,#1e3a8a 0%,#0284c7 52%,#0d9488 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 三、風與空氣屬性（6 種）
    "風": { style: "background:#047857;border-color:#34d399;color:#ecfdf5;" },
    "空氣": { style: "background:linear-gradient(135deg,#0f766e,#0284c7);border-color:#99f6e4;color:#f0fdfa;" },
    "嵐": { style: "background:linear-gradient(135deg,#064e3b,#047857 55%,#0f766e);border-color:#6ee7b7;color:#d1fae5;", icon: "🌪️" },
    "天氣": { style: "background:linear-gradient(135deg,#0369a1,#059669 55%,#ca8a04);border-color:#fde047;color:#fef9c3;", icon: "⛅", isSupreme: true },
    "妖翠": { style: "background:linear-gradient(135deg,#064e3b,#10b981 55%,#6b21a8);border-color:#a7f3d0;color:#ecfdf5;box-shadow:0 0 8px rgba(16,185,129,0.3);", icon: "🦊", isSupreme: true },
    "神龍之風": { style: "background:linear-gradient(135deg,#064e3b 0%,#059669 52%,#0d9488 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 四、雷電屬性（7 種）
    "雷": { style: "background:linear-gradient(135deg,#072540 0%,#0369a1 42%,#0284c7 70%,#ca8a04 90%,#facc15 100%);border-color:#facc15;color:#fefce8;box-shadow:0 0 9px rgba(250,204,21,0.5),0 0 4px rgba(56,189,248,0.45);", icon: "⚡" },
    "紫電": { style: "background:linear-gradient(135deg,#4c1d95,#7e22ce 55%,#a21caf);border-color:#e879f9;color:#fae8ff;", icon: "⚡" },
    "白雷": { style: "background:linear-gradient(135deg,#475569,#ca8a04 55%,#eab308);border-color:#ffffff;color:#fefce8;box-shadow:0 0 8px rgba(254,240,138,0.32);", icon: "⚡", isSupreme: true },
    "銀雷": { style: "background:linear-gradient(135deg,#334155,#6d28d9);border-color:#e2e8f0;color:#f8fafc;" },
    "灰黯之雷": { style: "background:linear-gradient(135deg,#18181b,#3f3f46 55%,#4c1d95);border-color:#a855f7;color:#e9d5ff;", icon: "⚡" },
    "滅邪神雷": { style: "background:linear-gradient(135deg,#4c1d95 0%,#854d0e 55%,#b45309 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "⚡", isSupreme: true },
    "神龍狂雷": { style: "background:linear-gradient(135deg,#3b0764 0%,#6d28d9 52%,#b45309 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 五、土石、金屬與礦物屬性（13 種）
    "土": { style: "background:#78350f;border-color:#d97706;color:#fef3c7;" },
    "大地": { style: "background:linear-gradient(135deg,#451a03,#78350f 55%,#3f6212);border-color:#f59e0b;color:#fef3c7;", icon: "⛰️" },
    "岩石": { style: "background:#57534e;border-color:#a8a29e;color:#f5f5f4;" },
    "沙": { style: "background:linear-gradient(135deg,#78350f,#a16207);border-color:#fcd34d;color:#fef9c3;" },
    "鋼": { style: "background:#334155;border-color:#94a3b8;color:#f8fafc;" },
    "金屬": { style: "background:linear-gradient(135deg,#1e293b,#475569);border-color:#cbd5e1;color:#f8fafc;" },
    "水銀": { style: "background:linear-gradient(135deg,#475569,#94a3b8 50%,#e2e8f0);border-color:#ffffff;color:#0f172a;box-shadow:0 0 8px rgba(255,255,255,0.4);", icon: "⚗️" },
    "世界金屬": { style: "background:linear-gradient(135deg,#064e3b 0%,#334155 50%,#78350f 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "🛡️", isSupreme: true },
    "水晶": { style: "background:linear-gradient(135deg,#0e7490,#6d28d9 55%,#be185d);border-color:#f0abfc;color:#fdf4ff;", icon: "💎" },
    "黃金": { style: "background:linear-gradient(135deg,#713f12,#ca8a04 55%,#eab308);border-color:#fef08a;color:#fefce8;box-shadow:0 0 8px rgba(250,204,21,0.3);", icon: "✦", isSupreme: true },
    "白銀": { style: "background:linear-gradient(135deg,#334155,#64748b);border-color:#f8fafc;color:#ffffff;", icon: "✦" },
    "建築": { style: "background:linear-gradient(135deg,#334155,#57534e 55%,#78350f);border-color:#cbd5e1;color:#f8fafc;", icon: "🏛️" },
    "鹽": { style: "background:linear-gradient(135deg,#334155 0%,#475569 50%,#64748b 100%);border-color:#f8fafc;color:#ffffff;box-shadow:0 0 7px rgba(248,250,252,0.32);", icon: "🧂" },

    // 六、草木、植物與自然花卉屬性（10 種）
    "草": { style: "background:#166534;border-color:#4ade80;color:#f0fdf4;" },
    "木": { style: "background:#3f6212;border-color:#84cc16;color:#f7fee7;" },
    "樹": { style: "background:linear-gradient(135deg,#14532d,#3f6212 60%,#78350f);border-color:#4ade80;color:#dcfce7;", icon: "🌳" },
    "植物": { style: "background:linear-gradient(135deg,#065f46,#15803d);border-color:#6ee7b7;color:#ecfdf5;" },
    "葉": { style: "background:#15803d;border-color:#86efac;color:#f0fdf4;" },
    "神花": { style: "background:linear-gradient(135deg,#831843 0%,#be185d 50%,#ca8a04 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🌺", isSupreme: true },
    "白玫瑰": { style: "background:linear-gradient(135deg,#334155,#0f766e);border-color:#f8fafc;color:#f8fafc;", icon: "🤍" },
    "紫羅蘭": { style: "background:linear-gradient(135deg,#4c1d95,#86198f);border-color:#e879f9;color:#fae8ff;", icon: "💜" },
    "櫻": { style: "background:linear-gradient(135deg,#831843,#db2777);border-color:#fbcfe8;color:#fdf2f8;", icon: "🌸" },
    "銀草": { style: "background:linear-gradient(135deg,#14532d,#475569);border-color:#e2e8f0;color:#f1f5f9;" },

    // 七、光芒與神聖屬性（8 種）
    "光": { style: "background:#a16207;border-color:#fde047;color:#fefce8;" },
    "聖": { style: "background:linear-gradient(135deg,#854d0e,#ca8a04 55%,#b45309);border-color:#fef9c3;color:#fefce8;box-shadow:0 0 9px rgba(254,240,138,0.34);", icon: "✝️", isSupreme: true },
    "純白": { style: "background:linear-gradient(135deg,#475569,#64748b 50%,#a16207);border-color:#ffffff;color:#ffffff;box-shadow:0 0 9px rgba(255,255,255,0.35);", icon: "✦", isSupreme: true },
    "白": { style: "background:#475569;border-color:#e2e8f0;color:#f8fafc;" },
    "黎明": { style: "background:linear-gradient(135deg,#1e1b4b,#9a3412 55%,#ca8a04);border-color:#fde047;color:#fef9c3;", icon: "🌅", isSupreme: true },
    "晨光": { style: "background:linear-gradient(135deg,#0369a1,#ca8a04);border-color:#fef08a;color:#fefce8;" },
    "極光": { style: "background:linear-gradient(135deg,#047857 0%,#0284c7 45%,#7c3aed 100%);border-color:#a7f3d0;color:#ecfdf5;box-shadow:0 0 9px rgba(167,243,208,0.38);", icon: "✨", isSupreme: true },
    "境界": { style: "background:linear-gradient(135deg,#312e81,#854d0e);border-color:#fde047;color:#fef9c3;", icon: "❖", isSupreme: true },

    // 八、天體星空與日月屬性（10 種）
    "天空": { style: "background:linear-gradient(135deg,#0369a1,#2563eb);border-color:#7dd3fc;color:#e0f2fe;" },
    "天體": { style: "background:linear-gradient(135deg,#1e1b4b,#4c1d95 55%,#78350f);border-color:#c084fc;color:#f3e8ff;", icon: "🪐" },
    "太陽": { style: "background:linear-gradient(135deg,#991b1b 0%,#ea580c 50%,#ca8a04 100%);border-color:#fef08a;color:#fefce8;box-shadow:0 0 10px rgba(254,240,138,0.38);", icon: "☀️", isSupreme: true },
    "月": { style: "background:linear-gradient(135deg,#1e1b4b,#312e81);border-color:#fef08a;color:#fef9c3;", icon: "🌙" },
    "星": { style: "background:linear-gradient(135deg,#1e1b4b,#1d4ed8);border-color:#93c5fd;color:#eff6ff;", icon: "⭐" },
    "星穹": { style: "background:linear-gradient(135deg,#0f172a,#312e81 55%,#581c87);border-color:#a5b4fc;color:#e0e7ff;", icon: "🌌", isSupreme: true },
    "行星": { style: "background:linear-gradient(135deg,#1e1b4b,#3b0764 55%,#0369a1);border-color:#a855f7;color:#f3e8ff;box-shadow:0 0 8px rgba(168,85,247,0.3);", icon: "🪐", isSupreme: true },
    "重力": { style: "background:linear-gradient(135deg,#0f172a 0%,#312e81 48%,#7e22ce 100%);border-color:#c084fc;color:#f3e8ff;box-shadow:0 0 9px rgba(192,132,252,0.38);", icon: "🪐", isSupreme: true },
    "銀河": { style: "background:linear-gradient(135deg,#090d16 0%,#312e81 35%,#7e22ce 70%,#0284c7 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.4);", icon: "🌌", isSupreme: true },
    "陰": { style: "background:linear-gradient(135deg,#0f172a,#334155);border-color:#94a3b8;color:#e2e8f0;" },

    // 九、暗影與幽冥屬性（8 種）
    "暗": { style: "background:#1f1235;border-color:#9333ea;color:#f3e8ff;" },
    "影": { style: "background:#18181b;border-color:#7e22ce;color:#e9d5ff;" },
    "夜": { style: "background:linear-gradient(135deg,#090d16,#1e1b4b);border-color:#6366f1;color:#e0e7ff;" },
    "晚霞": { style: "background:linear-gradient(135deg,#3b0764,#9f1239 55%,#c2410c);border-color:#fb7185;color:#ffe4e6;" },
    "冥": { style: "background:linear-gradient(135deg,#090d16,#134e4a 55%,#3b0764);border-color:#2dd4bf;color:#ccfbf1;", icon: "👻" },
    "黑泥": { style: "background:linear-gradient(135deg,#09090b,#27272a 55%,#3b0764);border-color:#a855f7;color:#e9d5ff;" },
    "霸王之暗": { style: "background:linear-gradient(135deg,#16072c 0%,#3b0764 52%,#1a0633 100%);border-color:#fbbf24;color:#fef08a;box-shadow:0 0 11px rgba(251,191,36,0.45),inset 0 0 8px rgba(168,85,247,0.45);", icon: "👑", isSupreme: true },
    "原罪之暗": { style: "background:linear-gradient(135deg,#09030e 0%,#4c0519 55%,#2e1065 100%);border-color:#f43f5e;color:#fda4af;box-shadow:0 0 10px rgba(244,63,94,0.4);", icon: "❖", isSupreme: true },

    // 十、深淵與淵蝕屬性（9 種）
    "深淵": { style: "background:linear-gradient(135deg,#090414,#2e1065);border-color:#e11d48;color:#fda4af;" },
    "至淵": { style: "background:linear-gradient(135deg,#05020a,#3b0764 55%,#881337);border-color:#f43f5e;color:#fecdd3;box-shadow:0 0 9px rgba(244,63,94,0.35);", icon: "🕳️", isSupreme: true },
    "始源深淵": { style: "background:linear-gradient(135deg,#030106 0%,#4c0519 48%,#3b0764 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.42),inset 0 0 8px rgba(225,29,72,0.45);", icon: "👑", isSupreme: true },
    "空洞": { style: "background:linear-gradient(135deg,#000000,#18181b 60%,#311042);border-color:#e879f9;color:#f5d0fe;", icon: "◎", isSupreme: true },
    "淵蝕-火": { style: "background:linear-gradient(135deg,#14051e,#7f1d1d 60%,#c2410c);border-color:#fb7185;color:#ffe4e6;", icon: "🕳️" },
    "淵蝕-冰": { style: "background:linear-gradient(135deg,#14051e,#164e63 60%,#0891b2);border-color:#38bdf8;color:#e0f2fe;", icon: "🕳️" },
    "淵蝕-雷": { style: "background:linear-gradient(135deg,#14051e,#4c1d95 60%,#7e22ce);border-color:#c084fc;color:#f3e8ff;", icon: "🕳️" },
    "淵蝕-光": { style: "background:linear-gradient(135deg,#14051e,#475569 55%,#854d0e);border-color:#fde047;color:#fef9c3;", icon: "🕳️" },
    "淵蝕-血": { style: "background:linear-gradient(135deg,#14051e,#4c0519 55%,#991b1b);border-color:#f43f5e;color:#fecdd3;", icon: "🕳️" },

    // 十一、血腥與肉體屬性（5 種）
    "血": { style: "background:#7f1d1d;border-color:#ef4444;color:#fef2f2;" },
    "猩紅": { style: "background:linear-gradient(135deg,#450a0a,#991b1b 55%,#be123c);border-color:#fb7185;color:#ffe4e6;", icon: "🩸", isSupreme: true },
    "原初之血": { style: "background:linear-gradient(135deg,#2a040d 0%,#881337 52%,#450a0a 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.4);", icon: "👑", isSupreme: true },
    "肉體": { style: "background:#7c2d12;border-color:#fb923c;color:#ffedd5;" },
    "髮": { style: "background:linear-gradient(135deg,#18181b 0%,#27272a 50%,#3f3f46 100%);border-color:#d4d4d8;color:#f4f4f5;box-shadow:0 0 8px rgba(212,212,216,0.35);", icon: "✦" },

    // 十二、戰鬥相關屬性（7 種）
    "力量": { style: "background:linear-gradient(135deg,#7c2d12,#b45309);border-color:#facc15;color:#fef9c3;" },
    "武": { style: "background:linear-gradient(135deg,#451a03,#9a3412 55%,#991b1b);border-color:#fbbf24;color:#fef3c7;", icon: "🥋" },
    "守護": { style: "background:linear-gradient(135deg,#1e3a8a,#065f46);border-color:#fde047;color:#fef9c3;", icon: "🛡️" },
    "劍": { style: "background:linear-gradient(135deg,#1e293b,#0284c7 55%,#475569);border-color:#f8fafc;color:#f0f9ff;", icon: "⚔️" },
    "銳利": { style: "background:linear-gradient(135deg,#1e293b,#991b1b);border-color:#f8fafc;color:#ffe4e6;", icon: "⚔️" },
    "狂": { style: "background:linear-gradient(135deg,#18181b,#991b1b 60%,#c2410c);border-color:#ef4444;color:#fecaca;", icon: "🔥" },
    "掠奪": { style: "background:linear-gradient(135deg,#18181b 0%,#881337 55%,#4c1d95 100%);border-color:#fbbf24;color:#fef08a;box-shadow:0 0 9px rgba(251,191,36,0.34);", icon: "⛓️", isSupreme: true },

    // 十三、時空法則屬性（3 種）
    "時間": { style: "background:linear-gradient(135deg,#134e4a,#0f766e 55%,#78350f);border-color:#fde047;color:#fef9c3;box-shadow:0 0 8px rgba(253,224,71,0.3);", icon: "⏳", isSupreme: true },
    "空間": { style: "background:linear-gradient(135deg,#0f172a,#1e1b4b 50%,#0e7490);border-color:#38bdf8;color:#e0f2fe;box-shadow:0 0 8px rgba(56,189,248,0.3);", icon: "💠", isSupreme: true },
    "時空": { style: "background:linear-gradient(135deg,#0f172a 0%,#0f766e 45%,#4c1d95 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.42);", icon: "✦", isSupreme: true },

    // 十四、精神、靈魂、感知、幻象與心智（16 種）
    "精神": { style: "background:#581c87;border-color:#e879f9;color:#fae8ff;" },
    "靈魂": { style: "background:linear-gradient(135deg,#1e1b4b,#0f766e 55%,#581c87);border-color:#5eead4;color:#ccfbf1;", icon: "🔮", isSupreme: true },
    "魂": { style: "background:#3b0764;border-color:#c084fc;color:#f3e8ff;" },
    "認知": { style: "background:linear-gradient(135deg,#312e81,#701a75);border-color:#f472b6;color:#fce7f3;", icon: "👁️", isSupreme: true },
    "母": { style: "background:linear-gradient(135deg,#065f46,#b45309 55%,#be185d);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.35);", icon: "👑", isSupreme: true },
    "音": { style: "background:#1e3a8a;border-color:#38bdf8;color:#e0f2fe;" },
    "音樂": { style: "background:linear-gradient(135deg,#4c1d95,#be185d);border-color:#f9a8d4;color:#fdf2f8;", icon: "🎵" },
    "色彩": { style: "background:linear-gradient(135deg,#991b1b 0%,#854d0e 35%,#065f46 68%,#1e3a8a 100%);border-color:#fde047;color:#fefce8;", icon: "🎨" },
    "言靈": { style: "background:linear-gradient(135deg,#311042,#78350f);border-color:#fde047;color:#fef08a;box-shadow:0 0 8px rgba(253,224,71,0.3);", icon: "📜", isSupreme: true },
    "咒": { style: "background:linear-gradient(135deg,#18181b,#4c0519 60%,#3b0764);border-color:#f43f5e;color:#fecdd3;" },
    "慾望": { style: "background:linear-gradient(135deg,#4c0519,#831843 55%,#581c87);border-color:#f472b6;color:#fce7f3;" },
    "幻": { style: "background:linear-gradient(135deg,#1e1b4b,#581c87 50%,#0f766e);border-color:#e879f9;color:#fae8ff;box-shadow:0 0 8px rgba(232,121,249,0.3);", icon: "🦋", isSupreme: true },
    "恐懼": { style: "background:linear-gradient(135deg,#09090b,#3b0764 60%,#450a0a);border-color:#ef4444;color:#fecaca;" },
    "忠義": { style: "background:linear-gradient(135deg,#7f1d1d,#9a3412);border-color:#fde047;color:#fef3c7;" },
    "王": { style: "background:linear-gradient(135deg,#2e1065 0%,#78350f 52%,#991b1b 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.45);", icon: "👑", isSupreme: true },
    "夢": { style: "background:linear-gradient(135deg,#1e1b4b,#3b0764 55%,#0f766e);border-color:#c084fc;color:#f3e8ff;", icon: "🌙" },

    // 十五、粉碎、破壞毀滅與戰爭（6 種）
    "粉碎": { style: "background:linear-gradient(135deg,#3b0714,#7f1d1d);border-color:#fb7185;color:#ffe4e6;" },
    "破壞": { style: "background:linear-gradient(135deg,#18181b,#7f1d1d 55%,#4c0519);border-color:#f43f5e;color:#fecdd3;", icon: "💥", isSupreme: true },
    "毀滅": { style: "background:linear-gradient(135deg,#18181b,#7f1d1d 55%,#4c0519);border-color:#f43f5e;color:#fecdd3;", icon: "💥", isSupreme: true },
    "破壞 / 毀滅": { style: "background:linear-gradient(135deg,#18181b,#7f1d1d 55%,#4c0519);border-color:#f43f5e;color:#fecdd3;", icon: "💥", isSupreme: true },
    "滅世": { style: "background:linear-gradient(135deg,#09040a 0%,#7f1d1d 48%,#4c1d95 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.42),inset 0 0 8px rgba(239,68,68,0.45);", icon: "☄️", isSupreme: true },
    "戰爭": { style: "background:linear-gradient(135deg,#450a0a,#7c2d12 55%,#78350f);border-color:#fbbf24;color:#fef08a;box-shadow:0 0 8px rgba(251,191,36,0.3);", icon: "⚔️", isSupreme: true },

    // 十六、毒素、腐蝕、瘟疫與死毒凋零（4 種）
    "毒": { style: "background:linear-gradient(135deg,#2e1065,#14532d);border-color:#a3e635;color:#ecfccb;" },
    "腐蝕": { style: "background:linear-gradient(135deg,#14532d,#3f6212 55%,#3b0764);border-color:#bef264;color:#f7fee7;" },
    "瘟疫": { style: "background:linear-gradient(135deg,#1f2937,#365314 55%,#4c1d95);border-color:#84cc16;color:#ecfccb;", icon: "☣️", isSupreme: true },
    "神龍腐化": { style: "background:linear-gradient(135deg,#1a062b 0%,#365314 52%,#4c0519 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 十七、特殊屬性、法則概念與始源（16 種）
    "自然": { style: "background:linear-gradient(135deg,#064e3b 0%,#047857 50%,#a16207 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🌿", isSupreme: true },
    "生命": { style: "background:linear-gradient(135deg,#065f46,#10b981 50%,#ca8a04);border-color:#fef08a;color:#fefce8;", icon: "🌱", isSupreme: true },
    "死": { style: "background:linear-gradient(135deg,#09090b 0%,#18181b 55%,#3b0764 100%);border-color:#e11d48;color:#fda4af;box-shadow:0 0 9px rgba(225,29,72,0.35);", icon: "💀", isSupreme: true },
    "真實": { style: "background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 38%,#38bdf8 72%,#ffffff 100%);border-color:#e0f2fe;color:#ffffff;box-shadow:0 0 12px rgba(186,230,253,0.55);", icon: "✦", isSupreme: true },
    "理": { style: "background:linear-gradient(135deg,#1e1b4b 0%,#1d4ed8 50%,#78350f 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 9px rgba(253,224,71,0.34);", icon: "❖", isSupreme: true },
    "真實/理": { style: "background:linear-gradient(135deg,#0f172a 0%,#1e40af 40%,#38bdf8 75%,#ffffff 100%);border-color:#bae6fd;color:#ffffff;box-shadow:0 0 12px rgba(186,230,253,0.55);", icon: "✦", isSupreme: true },
    "創生": { style: "background:linear-gradient(135deg,#064e3b 0%,#0284c7 48%,#ca8a04 100%);border-color:#fef08a;color:#fefce8;box-shadow:0 0 10px rgba(254,240,138,0.38);", icon: "✨", isSupreme: true },
    "邪": { style: "background:linear-gradient(135deg,#09090b,#4c0519 55%,#3b0764);border-color:#e11d48;color:#fda4af;" },
    "災厄": { style: "background:linear-gradient(135deg,#18181b 0%,#7f1d1d 52%,#3b0764 100%);border-color:#f97316;color:#fed7aa;box-shadow:0 0 9px rgba(249,115,22,0.34);", icon: "☄️", isSupreme: true },
    "暴食": { style: "background:linear-gradient(135deg,#1a062b 0%,#4c0519 55%,#14532d 100%);border-color:#fbbf24;color:#fef08a;box-shadow:0 0 9px rgba(251,191,36,0.34);", icon: "❖", isSupreme: true },
    "召喚": { style: "background:linear-gradient(135deg,#1e1b4b,#4c1d95 55%,#0f766e);border-color:#a78bfa;color:#ede9fe;", icon: "✡️" },
    "混沌": { style: "background:linear-gradient(135deg,#09090b 0%,#4c1d95 45%,#a16207 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "☯️", isSupreme: true },
    "量子": { style: "background:linear-gradient(135deg,#090d16 0%,#0284c7 48%,#7e22ce 100%);border-color:#67e8f9;color:#ecfeff;box-shadow:0 0 9px rgba(103,232,249,0.34);", icon: "⚛️", isSupreme: true },
    "虛空": { style: "background:linear-gradient(135deg,#030108 0%,#1e1b4b 50%,#581c87 100%);border-color:#c084fc;color:#f3e8ff;box-shadow:0 0 9px rgba(192,132,252,0.34);", icon: "🌌", isSupreme: true },
    "無限": { style: "background:linear-gradient(135deg,#1e1b4b 0%,#7e22ce 38%,#0284c7 72%,#ca8a04 100%);border-color:#fef08a;color:#fefce8;box-shadow:0 0 11px rgba(254,240,138,0.45);", icon: "∞", isSupreme: true },
    "萬物": { style: "background:linear-gradient(135deg,#064e3b 0%,#1e3a8a 35%,#581c87 68%,#b45309 100%);border-color:#fef08a;color:#fefce8;box-shadow:0 0 11px rgba(254,240,138,0.45);", icon: "👑", isSupreme: true }
  };

  function getAttributeVisual(attrName) {
    const name = String(attrName || "").trim();
    if (ATTRIBUTE_VISUAL_SPECS[name]) {
      return ATTRIBUTE_VISUAL_SPECS[name];
    }
    if (/火|炎|焰/.test(name)) return { style: "background:linear-gradient(135deg,#9a3412,#dc2626);border-color:#ef4444;color:#fff7ed;" };
    if (/冰|雪|霜/.test(name)) return { style: "background:linear-gradient(135deg,#155e75,#0284c7);border-color:#38bdf8;color:#ecfeff;" };
    if (/水|海/.test(name)) return { style: "background:linear-gradient(135deg,#1e3a8a,#2563eb);border-color:#60a5fa;color:#eff6ff;" };
    if (/風|嵐|氣/.test(name)) return { style: "background:linear-gradient(135deg,#065f46,#059669);border-color:#34d399;color:#ecfdf5;" };
    if (/雷|電/.test(name)) return { style: "background:linear-gradient(135deg,#072540 0%,#0284c7 65%,#eab308 100%);border-color:#facc15;color:#fefce8;box-shadow:0 0 8px rgba(250,204,21,0.5),0 0 4px rgba(56,189,248,0.4);", icon: "⚡" };
    if (/光|聖/.test(name)) return { style: "background:linear-gradient(135deg,#854d0e,#ca8a04);border-color:#fde047;color:#fefce8;" };
    if (/暗|影|冥|夜/.test(name)) return { style: "background:linear-gradient(135deg,#18122b,#3b0764);border-color:#9333ea;color:#f3e8ff;" };
    if (/血/.test(name)) return { style: "background:linear-gradient(135deg,#450a0a,#991b1b);border-color:#ef4444;color:#fef2f2;" };
    return { style: "background:#334155;border-color:#94a3b8;color:#f1f5f9;" };
  }

  function buildAttrBadgeHtml(attrTokens) {
    if (!attrTokens || attrTokens.length === 0) {
      return `<span class="text-muted">無特殊屬性紀錄</span>`;
    }
    return `<div class="attr-badges-wrap">
      ${attrTokens
        .map((token) => {
          const v = getAttributeVisual(token);
          const supremeClass = v.isSupreme ? "is-supreme" : "";
          return `<span class="attr-color-badge ${supremeClass}" style="${v.style}"><span>${esc(token)}</span></span>`;
        })
        .join("")}
    </div>`;
  }

  // ==================== PROGRESSIVE SUMMON FIRST-STEP TEXT EXTRACTOR ====================
  // Priority Rules (Updated per user specification):
  // 1. 有「古言靈術」的角色 -> 放古言靈術台詞
  // 2. 沒有古言靈術的角色 -> 放一個稱號（profile["稱號"]）
  // 3. 如果連稱號都沒有 -> 放武器名稱（profile["武器"]）
  function isMeaningfulContent(raw) {
    if (!raw) return false;
    const cleaned = String(raw).replace(/[-—─_\s.?？!！()（）「」『』“”]/g, "").trim();
    if (
      !cleaned ||
      cleaned === "無" ||
      cleaned === "沒有" ||
      cleaned === "不明" ||
      cleaned === "未知" ||
      cleaned === "不知" ||
      cleaned.includes("待補充") ||
      cleaned.includes("暫無")
    ) {
      return false;
    }
    return true;
  }

  function extractCharacterSummonVoiceLine(c) {
    const nameTokens = String(c.name || "")
      .replace(/~~/g, "")
      .split(/\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2);

    // 1. 有「古言靈術」的角色 -> 放古言靈術台詞
    if (Array.isArray(c.abilities)) {
      const kotodama = c.abilities.find((ab) => ab && ab.type === "古言靈術" && isMeaningfulContent(ab.content));
      if (kotodama) {
        const raw = String(kotodama.content).trim();
        const quoteMatch =
          raw.match(/-\s*([「『][^」』]{2,90}[」』])\s*-/) ||
          raw.match(/([「『][^」』]{2,90}[」』])/) ||
          raw.match(/-\s*([^-\n()（）]{2,70})\s*-/);
        if (quoteMatch && quoteMatch[1]) {
          let line = quoteMatch[1].trim();
          if (!line.startsWith("「") && !line.startsWith("『")) {
            line = `「${line}」`;
          }
          return {
            tag: "古言靈術 // KOTODAMA",
            text: line
          };
        }
        const firstLine = raw
          .split(/\n/)[0]
          .replace(/[（(][^）)]*[）)]/g, "")
          .replace(/^[-—\s]+|[-—\s]+$/g, "")
          .trim();
        if (firstLine) {
          return {
            tag: "古言靈術 // KOTODAMA",
            text: firstLine.startsWith("「") ? firstLine : `「${firstLine.slice(0, 65)}」`
          };
        }
      }
    }

    // 2. 沒有古言靈術 -> 放一個稱號
    const rawEpithet = String((c.profile && c.profile["稱號"]) || "").trim();
    if (isMeaningfulContent(rawEpithet)) {
      // Remove parenthetical remarks like (自稱) or trailing "-角色名"
      const cleanedEpithetStr = rawEpithet
        .replace(/[（(][^）)]*[）)]/g, "")
        .trim();

      // Split into individual epithets if multiple are listed
      const parts = cleanedEpithetStr
        .split(/[、，,／/；;\n]+|\s{2,}/)
        .map((p) => {
          let item = p.trim().replace(/^[-—《》「」『』]+|[-—《》「」『』]+$/g, "").trim();
          // If formatted like "湮滅魔女-莰蒂絲", strip the "-角色名" suffix
          if (item.includes("-")) {
            const subParts = item.split("-").map((sp) => sp.trim()).filter(Boolean);
            const nonNameSub = subParts.filter((sp) => !nameTokens.some((tok) => sp.includes(tok)));
            if (nonNameSub.length > 0) item = nonNameSub[0];
          }
          return item;
        })
        .filter((p) => isMeaningfulContent(p));

      // Prefer an epithet that doesn't directly contain the character's name
      const nonSpoilerParts = parts.filter((p) => !nameTokens.some((tok) => p.includes(tok)));
      const pool = nonSpoilerParts.length > 0 ? nonSpoilerParts : parts;

      if (pool.length > 0) {
        // If space-separated multiple titles exist in pool[0] (e.g. "天狐 白月狐"), take the first one
        const spaceSplit = pool[0].split(/\s+/).filter((s) => s.length >= 2);
        const singleTitle = spaceSplit.length >= 2 ? spaceSplit[0] : pool[0];
        return {
          tag: "角色稱號 // EPITHET",
          text: `《${singleTitle}》`
        };
      }
    }

    // 3. 如果連稱號都沒有 -> 放武器名稱
    const rawWeapon = String((c.profile && c.profile["武器"]) || "").trim();
    if (isMeaningfulContent(rawWeapon) && !/沒有在用武器|不用武器|不使用武器/.test(rawWeapon)) {
      const dashMatches = [];
      const dashRegex = /-\s*([^-\n()（）]+)\s*-/g;
      let dm;
      while ((dm = dashRegex.exec(rawWeapon)) !== null) {
        const wn = dm[1].trim();
        if (isMeaningfulContent(wn)) dashMatches.push(wn);
      }

      if (dashMatches.length > 0) {
        return {
          tag: "專屬武器 // WEAPON",
          text: `【${dashMatches[0]}】`
        };
      }

      const cleanWeapon = rawWeapon
        .replace(/[（(][^）)]*[）)]/g, "")
        .replace(/^[-—\s]+|[-—\s]+$/g, "")
        .split(/[、，,\n]/)[0]
        .trim();

      if (isMeaningfulContent(cleanWeapon)) {
        return {
          tag: "專屬武器 // WEAPON",
          text: `【${cleanWeapon}】`
        };
      }
    }

    // 保底（若少數角色連古言靈術、稱號、武器都為「無」或不用武器）
    return {
      tag: "角色名諱 // NAME",
      text: `【${c.name || "未知存在"}】`
    };
  }

  // ==================== PROCEDURAL WEB AUDIO SYNTHESIZER (7 TIERS + 4 BESPOKE CHARACTER SOUNDSCAPES) ====================
  let audioCtx = null;
  function getAudioCtx() {
    if (!summonState.sfxEnabled) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Distinct scale & waveform signature per rarity tier (1..7)
  const TIER_AUDIO_SIGNATURES = {
    1: {
      // N: Gentle Emerald Wind-Chime (Pentatonic Sine)
      wave: "sine",
      subWave: "sine",
      scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
      chord: [523.25, 659.25, 783.99]
    },
    2: {
      // R: Sapphire Arcane Crystal Bell (Triangle Lydian)
      wave: "triangle",
      subWave: "sine",
      scale: [293.66, 369.99, 440.0, 493.88, 587.33, 739.99],
      chord: [440.0, 554.37, 659.25, 880.0]
    },
    3: {
      // SR: Violet Thunder-Pulse & Heroic Minor Synth (Sawtooth + Triangle)
      wave: "sawtooth",
      subWave: "triangle",
      scale: [220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25],
      chord: [293.66, 440.0, 554.37, 659.25, 880.0]
    },
    4: {
      // SSR: Golden Celestial Fanfare (Majestic Brass Fifths)
      wave: "sawtooth",
      subWave: "sawtooth",
      scale: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 783.99, 1046.5],
      chord: [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]
    },
    5: {
      // UR: Mythic Crimson-Gold War-Drum & Dimensional Blade Organ
      wave: "sawtooth",
      subWave: "sawtooth",
      scale: [196.0, 246.94, 293.66, 392.0, 493.88, 587.33, 783.99, 987.77, 1174.66],
      chord: [196.0, 293.66, 392.0, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98]
    },
    6: {
      // EX: Sacred Genesis Symphony (Celestial Harmonic Choir + 12-Note Prismatic Harp)
      wave: "triangle",
      subWave: "sine",
      scale: [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66, 1318.5, 1567.98, 2093.0],
      chord: [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5, 1567.98, 2093.0]
    },
    7: {
      // ？: Evil Abyssal Phenomenon (Forbidden Demonic Tritone + Phrygian Dark Organ + Blood-Thunder)
      wave: "sawtooth",
      subWave: "sawtooth",
      scale: [130.81, 138.59, 185.0, 196.0, 261.63, 277.18, 369.99, 392.0, 554.37, 739.99],
      chord: [130.81, 185.0, 261.63, 311.13, 369.99, 523.25, 739.99]
    }
  };

  // Bespoke Multi-Layered Apocalyptic Dragon Roar Synthesizer (Exclusive to 赤夜 終焉龍!)
  function playDragonRoarSfx(durationSec = 2.2, volumeMult = 1.0) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.34 * volumeMult, now);
      master.connect(ctx.destination);

      // Nonlinear distortion waveshaper for ferocious draconic vocal growl
      const shaper = ctx.createWaveShaper();
      const samples = 4096;
      const curve = new Float32Array(samples);
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + 28) * x * 20 * (Math.PI / 180)) / (Math.PI + 28 * Math.abs(x));
      }
      shaper.curve = curve;
      shaper.oversample = "2x";

      // Formant Bandpass Filter simulating giant dragon throat resonance
      const formantFilter = ctx.createBiquadFilter();
      formantFilter.type = "bandpass";
      formantFilter.Q.setValueAtTime(2.4, now);
      formantFilter.frequency.setValueAtTime(260, now);
      formantFilter.frequency.exponentialRampToValueAtTime(780, now + durationSec * 0.25);
      formantFilter.frequency.exponentialRampToValueAtTime(420, now + durationSec * 0.65);
      formantFilter.frequency.exponentialRampToValueAtTime(160, now + durationSec);

      const roarGain = ctx.createGain();
      roarGain.gain.setValueAtTime(0.01, now);
      roarGain.gain.linearRampToValueAtTime(0.65, now + 0.14);
      roarGain.gain.setValueAtTime(0.62, now + durationSec * 0.55);
      roarGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      shaper.connect(formantFilter);
      formantFilter.connect(roarGain);
      roarGain.connect(master);

      // 3 Detuned Growling Sawtooth + Square Vocal Cords with Vibrato
      const baseFreqs = [92.5, 116.5, 146.8];
      baseFreqs.forEach((bf, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 1 ? "square" : "sawtooth";
        osc.frequency.setValueAtTime(bf * 0.85, now);
        // Ferocious upward chest roar then guttural drop
        osc.frequency.exponentialRampToValueAtTime(bf * 1.48, now + durationSec * 0.24);
        osc.frequency.exponentialRampToValueAtTime(bf * 1.15, now + durationSec * 0.58);
        osc.frequency.exponentialRampToValueAtTime(bf * 0.48, now + durationSec);

        // Throat growl flutter (24Hz LFO modulation)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(22 + idx * 4, now);
        lfoGain.gain.setValueAtTime(14 + idx * 5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(shaper);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + durationSec);
        lfo.stop(now + durationSec);
      });

      // White-Noise Dragon Breath Fire Gust Layer
      const bufSize = Math.floor(ctx.sampleRate * durationSec);
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const output = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuf;

      const breathFilter = ctx.createBiquadFilter();
      breathFilter.type = "lowpass";
      breathFilter.frequency.setValueAtTime(450, now);
      breathFilter.frequency.exponentialRampToValueAtTime(1950, now + durationSec * 0.28);
      breathFilter.frequency.exponentialRampToValueAtTime(320, now + durationSec);

      const breathGain = ctx.createGain();
      breathGain.gain.setValueAtTime(0.01, now);
      breathGain.gain.linearRampToValueAtTime(0.48, now + 0.16);
      breathGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      whiteNoise.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(master);
      whiteNoise.start(now);
      whiteNoise.stop(now + durationSec);

      // Earth-Shattering Sub-Bass Tectonic Rumble (58Hz -> 21Hz)
      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(58, now);
      sub.frequency.linearRampToValueAtTime(76, now + durationSec * 0.25);
      sub.frequency.exponentialRampToValueAtTime(21, now + durationSec);
      subG.gain.setValueAtTime(0.55, now);
      subG.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
      sub.connect(subG);
      subG.connect(master);
      sub.start(now);
      sub.stop(now + durationSec);
    } catch (e) {
      // Ignore audio errors
    }
  }

  // 1. Background Ritual Charge SFX (Tailored to each of the 7 tiers + 4 bespoke character variants)
  function playSummonChargeSfx(tierLevel, durationSec, specialVariant = null) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const sig = TIER_AUDIO_SIGNATURES[tierLevel] || TIER_AUDIO_SIGNATURES[1];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.15, now);
      master.connect(ctx.destination);

      if (specialVariant === "phenom-the-abyss") {
        // THE ABYSS (深淵風格): Crushing Deep-Trench Oceanic Sub-Drone + Echoing Abyssal Pressure Pulses
        const deep1 = ctx.createOscillator();
        const deep2 = ctx.createOscillator();
        const dg = ctx.createGain();
        deep1.type = "sine";
        deep2.type = "triangle";
        deep1.frequency.setValueAtTime(38.89, now); // Deep Eb1
        deep2.frequency.setValueAtTime(58.27, now); // Deep Bb1
        deep1.frequency.linearRampToValueAtTime(30.87, now + durationSec);
        deep2.frequency.linearRampToValueAtTime(46.25, now + durationSec);
        dg.gain.setValueAtTime(0.01, now);
        dg.gain.linearRampToValueAtTime(0.32, now + 1.4);
        dg.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
        deep1.connect(dg);
        deep2.connect(dg);
        dg.connect(master);
        deep1.start(now);
        deep2.start(now);
        deep1.stop(now + durationSec);
        deep2.stop(now + durationSec);

        // Deep-Sea Sonar & Abyssal Bubble Echo Pings
        const pingCount = Math.floor(durationSec / 1.1);
        const abyssPingFreqs = [155.56, 233.08, 185.0, 138.59];
        for (let p = 0; p < pingCount; p++) {
          const pt = now + p * 1.1 + 0.2;
          const ping = ctx.createOscillator();
          const pg = ctx.createGain();
          ping.type = "sine";
          const f = abyssPingFreqs[p % abyssPingFreqs.length];
          ping.frequency.setValueAtTime(f, pt);
          ping.frequency.exponentialRampToValueAtTime(f * 0.62, pt + 0.75);
          pg.gain.setValueAtTime(0.22, pt);
          pg.gain.exponentialRampToValueAtTime(0.001, pt + 0.78);
          ping.connect(pg);
          pg.connect(master);
          ping.start(pt);
          ping.stop(pt + 0.8);
        }
        return;
      }

      if (specialVariant === "phenom-lycia-void") {
        // 莉琪雅 神隱 (虛空風格): Eerie Crystalline Zero-Gravity Pad + High-Frequency Spatial Glitch Pulses
        [329.63, 493.88, 739.99].forEach((f, idx) => {
          const pad = ctx.createOscillator();
          const pg = ctx.createGain();
          pad.type = idx === 2 ? "triangle" : "sine";
          pad.frequency.setValueAtTime(f, now);
          pad.frequency.linearRampToValueAtTime(f * (idx % 2 === 0 ? 1.06 : 0.94), now + durationSec);
          pg.gain.setValueAtTime(0.01, now);
          pg.gain.linearRampToValueAtTime(0.14, now + 1.0);
          pg.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
          pad.connect(pg);
          pg.connect(master);
          pad.start(now);
          pad.stop(now + durationSec);
        });

        // Spatial Void Glitch Ticks
        const glitchCount = Math.floor(durationSec / 0.65);
        for (let g = 0; g < glitchCount; g++) {
          const gt = now + g * 0.65 + 0.15;
          const glOsc = ctx.createOscillator();
          const glGain = ctx.createGain();
          glOsc.type = "sawtooth";
          glOsc.frequency.setValueAtTime(1760 + (g % 3) * 440, gt);
          glOsc.frequency.exponentialRampToValueAtTime(220, gt + 0.12);
          glGain.gain.setValueAtTime(0.14, gt);
          glGain.gain.exponentialRampToValueAtTime(0.001, gt + 0.13);
          glOsc.connect(glGain);
          glGain.connect(master);
          glOsc.start(gt);
          glOsc.stop(gt + 0.14);
        }
        return;
      }

      if (specialVariant === "apocalypse-dragon") {
        // 赤夜 終焉龍 (滅世風格): Volcanic Magma Rumble + Distant Dragon Growl Pulse
        const rumble = ctx.createOscillator();
        const rg = ctx.createGain();
        rumble.type = "sawtooth";
        rumble.frequency.setValueAtTime(48.99, now);
        rumble.frequency.linearRampToValueAtTime(65.41, now + durationSec * 0.85);
        rg.gain.setValueAtTime(0.02, now);
        rg.gain.linearRampToValueAtTime(0.24, now + 1.2);
        rg.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
        rumble.connect(rg);
        rg.connect(master);
        rumble.start(now);
        rumble.stop(now + durationSec);
        return;
      }

      if (tierLevel === 7) {
        // 賽特 伊斐爾 / Default ？ Tier (邪惡風格): Evil Abyssal Drone + Sinister Heartbeat Pulse
        const drone1 = ctx.createOscillator();
        const drone2 = ctx.createOscillator();
        const dg = ctx.createGain();
        drone1.type = "sawtooth";
        drone2.type = "triangle";
        drone1.frequency.setValueAtTime(55.0, now); // Low A1
        drone2.frequency.setValueAtTime(77.78, now); // Dissonant Tritone Eb2
        drone1.frequency.linearRampToValueAtTime(41.2, now + durationSec);
        drone2.frequency.linearRampToValueAtTime(58.27, now + durationSec);
        dg.gain.setValueAtTime(0.01, now);
        dg.gain.linearRampToValueAtTime(0.24, now + 1.2);
        dg.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
        drone1.connect(dg);
        drone2.connect(dg);
        dg.connect(master);
        drone1.start(now);
        drone2.start(now);
        drone1.stop(now + durationSec);
        drone2.stop(now + durationSec);

        // Ominous Abyssal Heartbeat Thumps every 0.85s
        const beatCount = Math.floor(durationSec / 0.85);
        for (let b = 0; b < beatCount; b++) {
          const bt = now + b * 0.85;
          [0, 0.18].forEach((offset, idx) => {
            const hb = ctx.createOscillator();
            const hbg = ctx.createGain();
            hb.type = "sine";
            hb.frequency.setValueAtTime(idx === 0 ? 64 : 52, bt + offset);
            hb.frequency.exponentialRampToValueAtTime(24, bt + offset + 0.22);
            hbg.gain.setValueAtTime(idx === 0 ? 0.38 : 0.26, bt + offset);
            hbg.gain.exponentialRampToValueAtTime(0.001, bt + offset + 0.24);
            hb.connect(hbg);
            hbg.connect(master);
            hb.start(bt + offset);
            hb.stop(bt + offset + 0.25);
          });
        }
        return;
      }

      // Standard Tier 1..6 ambient rising sweep
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = sig.subWave;
      const startF = 95 + tierLevel * 18;
      const endF = 220 + tierLevel * 75;
      osc1.frequency.setValueAtTime(startF, now);
      osc1.frequency.exponentialRampToValueAtTime(endF, now + durationSec * 0.9);
      g1.gain.setValueAtTime(0.01, now);
      g1.gain.linearRampToValueAtTime(0.16 + tierLevel * 0.02, now + durationSec * 0.7);
      g1.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
      osc1.connect(g1);
      g1.connect(master);
      osc1.start(now);
      osc1.stop(now + durationSec);
    } catch (e) {
      // Ignore audio errors
    }
  }

  // 2. Giant Center-Screen Text Impact SFX (Played when each of the 4 big texts slams in!)
  // Distinct per stepIdx (1..4), per rarity tier (1..7), AND per bespoke character variant!
  function playBigTextImpactSfx(stepIdx, tierLevel, specialVariant = null) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const sig = TIER_AUDIO_SIGNATURES[tierLevel] || TIER_AUDIO_SIGNATURES[1];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.26, now);
      master.connect(ctx.destination);

      // Heavy Sub-Bass Impact Thud on every big text slam
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = tierLevel === 7 || specialVariant === "apocalypse-dragon" ? "sawtooth" : "sine";
      const impactStartFreq =
        specialVariant === "phenom-the-abyss"
          ? 72
          : tierLevel === 7
          ? 92
          : 110 + stepIdx * 12;
      sub.frequency.setValueAtTime(impactStartFreq, now);
      sub.frequency.exponentialRampToValueAtTime(24, now + 0.36);
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start(now);
      sub.stop(now + 0.4);

      if (specialVariant === "phenom-the-abyss") {
        // THE ABYSS (深淵風格): Deep Trench Sub-Implosion + Resonant Abyssal Choir Bell
        const abyssChord =
          stepIdx === 1
            ? [92.5, 138.59, 185.0]
            : stepIdx === 2
            ? [77.78, 116.54, 155.56, 233.08, 311.13]
            : stepIdx === 3
            ? [87.31, 130.81, 196.0, 261.63]
            : [77.78, 155.56, 233.08, 311.13, 466.16];
        abyssChord.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          const t = now + idx * 0.045;
          osc.frequency.setValueAtTime(f * 1.12, t);
          osc.frequency.exponentialRampToValueAtTime(f * 0.78, t + 0.65);
          g.gain.setValueAtTime(0.28, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.72);
        });
        return;
      }

      if (specialVariant === "phenom-lycia-void") {
        // 莉琪雅 神隱 (虛空風格): Crystalline Glass-Shatter Chime + Dimensional Reaper Slash
        const voidFreqs =
          stepIdx === 1
            ? [523.25, 783.99, 1174.66]
            : stepIdx === 2
            ? [587.33, 880.0, 1318.5, 1760.0, 2637.0]
            : stepIdx === 3
            ? [493.88, 739.99, 1108.73, 1661.22]
            : [659.25, 987.77, 1479.98, 2217.46];
        voidFreqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = idx % 2 === 0 ? "triangle" : "sine";
          const t = now + idx * 0.028;
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.exponentialRampToValueAtTime(f * 1.18, t + 0.48);
          g.gain.setValueAtTime(0.22, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.55);
        });
        return;
      }

      if (specialVariant === "apocalypse-dragon") {
        // 赤夜 終焉龍 (滅世風格): Apocalyptic Brass/Flame Impact + Short Dragon Growl on Step 2 (終世級)!
        if (stepIdx === 2) {
          playDragonRoarSfx(1.15, 0.75);
        }
        const dragonNotes = [110.0, 164.81, 220.0, 277.18, 329.63].slice(0, 2 + stepIdx);
        dragonNotes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sawtooth";
          const t = now + idx * 0.035;
          osc.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.24, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.58);
        });
        return;
      }

      if (tierLevel === 7) {
        // 賽特 伊斐爾 / Default ？ (邪惡風格): Sinister Demonic Bell Toll + Tritone Screech
        const evilFreqs =
          stepIdx === 1
            ? [130.81, 185.0, 277.18]
            : stepIdx === 2
            ? [110.0, 155.56, 233.08, 311.13, 466.16] // Evil Power Reveal!
            : stepIdx === 3
            ? [123.47, 174.61, 261.63, 369.99]
            : [130.81, 185.0, 261.63, 369.99, 554.37];

        evilFreqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
          const t = now + idx * 0.035;
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.linearRampToValueAtTime(f * 0.96, t + 0.55);
          g.gain.setValueAtTime(0.24, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.65);
        });
        return;
      }

      if (tierLevel === 6) {
        // EX (Level 6 - Sacred Genesis): Radiant Celestial Harp & Bell Chord
        const exNotes = sig.scale.slice(stepIdx - 1, stepIdx + 4);
        exNotes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          const t = now + idx * 0.04;
          osc.frequency.setValueAtTime(f * 1.5, t);
          g.gain.setValueAtTime(0.24, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.6);
        });
        return;
      }

      // Tiers 1..5: Distinct melodic interval lock-in based on tier signature
      const baseIdx = Math.min(sig.scale.length - 3, stepIdx - 1);
      const notes = [
        sig.scale[baseIdx],
        sig.scale[baseIdx + 1],
        sig.scale[baseIdx + 2]
      ];
      if (stepIdx === 2 && tierLevel >= 3) {
        notes.push(sig.scale[sig.scale.length - 1]);
      }

      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = sig.wave;
        const t = now + idx * 0.04;
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (tierLevel >= 4 ? 0.5 : 0.35));
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + 0.52);
      });
    } catch (e) {
      // Ignore audio errors
    }
  }

  // 3. Grand Climax Finale SFX ("字都跳完後 跑一個最帥的動畫" — 7 tier soundscapes + 4 bespoke character finales!)
  function playClimaxFinaleSfx(tierLevel, finaleSec, specialVariant = null) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const sig = TIER_AUDIO_SIGNATURES[tierLevel] || TIER_AUDIO_SIGNATURES[1];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.26, now);
      master.connect(ctx.destination);

      if (specialVariant === "apocalypse-dragon") {
        // 赤夜 終焉龍 (滅世風格終極演出): Ferocious Apocalyptic Dragon Roar + World-Ending Magma Bombardment!
        playDragonRoarSfx(Math.min(2.8, finaleSec * 0.92), 1.15);

        const blastCount = 7;
        const interval = (finaleSec * 0.85) / blastCount;
        const brassChord = [110.0, 146.83, 164.81, 220.0, 293.66, 329.63, 440.0];
        for (let i = 0; i < blastCount; i++) {
          const t = now + i * interval;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bOsc.type = "sawtooth";
          bOsc.frequency.setValueAtTime(brassChord[i % brassChord.length] * 1.5, t);
          bOsc.frequency.exponentialRampToValueAtTime(48.0, t + 0.28);
          bGain.gain.setValueAtTime(0.28, t);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          bOsc.connect(bGain);
          bGain.connect(master);
          bOsc.start(t);
          bOsc.stop(t + 0.32);
        }
        return;
      }

      if (specialVariant === "phenom-the-abyss") {
        // THE ABYSS (深淵風格終極演出): Maelstrom Trench Whirlpool Suction + 10 Deep Abyssal Pressure Implosions!
        const vortex = ctx.createOscillator();
        const vg = ctx.createGain();
        vortex.type = "sine";
        vortex.frequency.setValueAtTime(155.56, now);
        vortex.frequency.exponentialRampToValueAtTime(24.5, now + finaleSec * 0.92);
        vg.gain.setValueAtTime(0.08, now);
        vg.gain.linearRampToValueAtTime(0.48, now + finaleSec * 0.72);
        vg.gain.exponentialRampToValueAtTime(0.001, now + finaleSec);
        vortex.connect(vg);
        vg.connect(master);
        vortex.start(now);
        vortex.stop(now + finaleSec);

        const pulseCount = 10;
        const pStep = (finaleSec * 0.86) / pulseCount;
        const trenchNotes = [77.78, 92.5, 116.54, 138.59, 155.56, 185.0, 233.08, 311.13];
        for (let i = 0; i < pulseCount; i++) {
          const t = now + i * pStep;
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = i % 2 === 0 ? "triangle" : "sine";
          const f = trenchNotes[i % trenchNotes.length];
          pOsc.frequency.setValueAtTime(f * 1.4, t);
          pOsc.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.32);
          pGain.gain.setValueAtTime(0.28, t);
          pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
          pOsc.connect(pGain);
          pGain.connect(master);
          pOsc.start(t);
          pOsc.stop(t + 0.35);
        }
        return;
      }

      if (specialVariant === "phenom-lycia-void") {
        // 莉琪雅 神隱 (虛空風格終極演出): 10 Rapid Unknown-Reaper Dimensional Scythe Slashes + Crystalline Void Collapse!
        const slashCount = 10;
        const interval = (finaleSec * 0.84) / slashCount;
        const voidScale = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.5, 1567.98, 1975.53, 2349.32, 2637.02];
        for (let i = 0; i < slashCount; i++) {
          const t = now + i * interval;
          const scythe = ctx.createOscillator();
          const sg = ctx.createGain();
          scythe.type = i % 2 === 0 ? "sawtooth" : "triangle";
          scythe.frequency.setValueAtTime(voidScale[i % voidScale.length] * 1.6, t);
          scythe.frequency.exponentialRampToValueAtTime(140, t + 0.2);
          sg.gain.setValueAtTime(0.25, t);
          sg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          scythe.connect(sg);
          sg.connect(master);
          scythe.start(t);
          scythe.stop(t + 0.23);
        }

        // High Zero-Gravity Void Singularity Whine
        const voidSing = ctx.createOscillator();
        const vsg = ctx.createGain();
        voidSing.type = "sine";
        voidSing.frequency.setValueAtTime(880, now);
        voidSing.frequency.exponentialRampToValueAtTime(1760, now + finaleSec * 0.78);
        voidSing.frequency.exponentialRampToValueAtTime(110, now + finaleSec);
        vsg.gain.setValueAtTime(0.02, now);
        vsg.gain.linearRampToValueAtTime(0.24, now + finaleSec * 0.75);
        vsg.gain.exponentialRampToValueAtTime(0.001, now + finaleSec);
        voidSing.connect(vsg);
        vsg.connect(master);
        voidSing.start(now);
        voidSing.stop(now + finaleSec);
        return;
      }

      if (tierLevel === 7) {
        // 賽特 伊斐爾 / Default ？ (邪惡風格終極演出):
        // Ominous Blood-Eclipse Vacuum Roar + 8 Rapid Blood-Lightning Slashes + Demonic Tritone Climax!
        const abyssSweep = ctx.createOscillator();
        const ag = ctx.createGain();
        abyssSweep.type = "sawtooth";
        abyssSweep.frequency.setValueAtTime(196.0, now);
        abyssSweep.frequency.exponentialRampToValueAtTime(32.7, now + finaleSec * 0.85);
        ag.gain.setValueAtTime(0.05, now);
        ag.gain.linearRampToValueAtTime(0.38, now + finaleSec * 0.7);
        ag.gain.exponentialRampToValueAtTime(0.001, now + finaleSec);
        abyssSweep.connect(ag);
        ag.connect(master);
        abyssSweep.start(now);
        abyssSweep.stop(now + finaleSec);

        // 8 Rapid Evil Spatial Slash & Demonic Toll Hits
        const slashCount = 8;
        const interval = (finaleSec * 0.85) / slashCount;
        const tritoneNotes = [130.81, 185.0, 138.59, 196.0, 261.63, 369.99, 277.18, 554.37];
        for (let i = 0; i < slashCount; i++) {
          const t = now + i * interval;
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.type = "sawtooth";
          sOsc.frequency.setValueAtTime(tritoneNotes[i % tritoneNotes.length] * 2.2, t);
          sOsc.frequency.exponentialRampToValueAtTime(55.0, t + 0.24);
          sGain.gain.setValueAtTime(0.28, t);
          sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
          sOsc.connect(sGain);
          sGain.connect(master);
          sOsc.start(t);
          sOsc.stop(t + 0.27);
        }
        return;
      }

      if (tierLevel === 6) {
        // EX (Level 6 - Sacred Celestial Genesis Finale):
        // 16-Note Ascending Rainbow Harp Glissando + Celestial Choir Shimmer + Supernova Implosion!
        const stepCount = 16;
        const stepDur = (finaleSec * 0.82) / stepCount;
        for (let i = 0; i < stepCount; i++) {
          const t = now + i * stepDur;
          const hOsc = ctx.createOscillator();
          const hGain = ctx.createGain();
          hOsc.type = "triangle";
          const freq = sig.scale[i % sig.scale.length] * (1 + Math.floor(i / sig.scale.length) * 0.5);
          hOsc.frequency.setValueAtTime(freq, t);
          hGain.gain.setValueAtTime(0.22, t);
          hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          hOsc.connect(hGain);
          hGain.connect(master);
          hOsc.start(t);
          hOsc.stop(t + 0.46);
        }

        // High Celestial Choir Pad
        [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
          const pad = ctx.createOscillator();
          const pg = ctx.createGain();
          pad.type = "sine";
          pad.frequency.setValueAtTime(f, now);
          pad.frequency.linearRampToValueAtTime(f * 1.25, now + finaleSec * 0.9);
          pg.gain.setValueAtTime(0.01, now);
          pg.gain.linearRampToValueAtTime(0.18, now + finaleSec * 0.65);
          pg.gain.exponentialRampToValueAtTime(0.001, now + finaleSec);
          pad.connect(pg);
          pg.connect(master);
          pad.start(now);
          pad.stop(now + finaleSec);
        });
        return;
      }

      if (tierLevel === 5) {
        // UR (Level 5 - Mythic Dimensional Cross-Slash Finale):
        // 5 Rapid Metallic Sword-Slash Swishes + Ascending War-Organ Crescendo!
        for (let s = 0; s < 5; s++) {
          const st = now + s * (finaleSec * 0.16);
          const blade = ctx.createOscillator();
          const bg = ctx.createGain();
          blade.type = "sawtooth";
          blade.frequency.setValueAtTime(1400 + s * 220, st);
          blade.frequency.exponentialRampToValueAtTime(180, st + 0.22);
          bg.gain.setValueAtTime(0.26, st);
          bg.gain.exponentialRampToValueAtTime(0.001, st + 0.24);
          blade.connect(bg);
          bg.connect(master);
          blade.start(st);
          blade.stop(st + 0.25);
        }
      }

      // Escalating Finale Arpeggio for Tiers 1..5
      const notesCount = 6 + tierLevel * 2;
      const stepTime = (finaleSec * 0.85) / notesCount;
      for (let i = 0; i < notesCount; i++) {
        const t = now + i * stepTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = sig.wave;
        const f = sig.scale[i % sig.scale.length] * (1 + (i / notesCount) * 0.5);
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 1.4);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + stepTime * 1.45);
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  // 4. Final Character Reveal Fanfare (7 Distinct Tier Reveal Bursts + 4 Bespoke Character Reveal Bursts!)
  function playSummonRevealSfx(tierLevel, specialVariant = null) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const sig = TIER_AUDIO_SIGNATURES[tierLevel] || TIER_AUDIO_SIGNATURES[1];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.26, now);
      master.connect(ctx.destination);

      if (specialVariant === "apocalypse-dragon") {
        // 赤夜 終焉龍登場：震天滅世龍吼 + 赤金毀滅和弦！
        playDragonRoarSfx(2.35, 1.25);
        const dragonChord = [110.0, 164.81, 220.0, 277.18, 329.63, 440.0, 554.37, 659.25];
        dragonChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
          const start = now + i * 0.04;
          osc.frequency.setValueAtTime(freq, start);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.24, start + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, start + 2.2);
          osc.connect(g);
          g.connect(master);
          osc.start(start);
          osc.stop(start + 2.25);
        });
        return;
      }

      if (specialVariant === "phenom-the-abyss") {
        // The Abyss 登場：深淵海溝吞噬重低音轟鳴 + 幽紫深淵共鳴管風琴！
        const trenchSub = ctx.createOscillator();
        const tsg = ctx.createGain();
        trenchSub.type = "sine";
        trenchSub.frequency.setValueAtTime(92.5, now);
        trenchSub.frequency.exponentialRampToValueAtTime(18.5, now + 1.8);
        tsg.gain.setValueAtTime(0.65, now);
        tsg.gain.exponentialRampToValueAtTime(0.001, now + 1.85);
        trenchSub.connect(tsg);
        tsg.connect(master);
        trenchSub.start(now);
        trenchSub.stop(now + 1.9);

        const abyssChord = [77.78, 116.54, 155.56, 185.0, 233.08, 311.13, 466.16];
        abyssChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? "triangle" : "sine";
          const start = now + i * 0.05;
          osc.frequency.setValueAtTime(freq, start);
          osc.frequency.linearRampToValueAtTime(freq * 0.92, start + 2.2);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.26, start + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, start + 2.3);
          osc.connect(g);
          g.connect(master);
          osc.start(start);
          osc.stop(start + 2.35);
        });
        return;
      }

      if (specialVariant === "phenom-lycia-void") {
        // 莉琪雅 神隱登場：次元碎裂冰晶斬擊 + 虛空神隱空靈聖詠！
        const voidSub = ctx.createOscillator();
        const vsg = ctx.createGain();
        voidSub.type = "triangle";
        voidSub.frequency.setValueAtTime(220.0, now);
        voidSub.frequency.exponentialRampToValueAtTime(27.5, now + 1.35);
        vsg.gain.setValueAtTime(0.52, now);
        vsg.gain.exponentialRampToValueAtTime(0.001, now + 1.38);
        voidSub.connect(vsg);
        vsg.connect(master);
        voidSub.start(now);
        voidSub.stop(now + 1.4);

        const voidChord = [329.63, 493.88, 659.25, 739.99, 987.77, 1318.5, 1479.98, 1975.53];
        voidChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? "sine" : "triangle";
          const start = now + i * 0.038;
          osc.frequency.setValueAtTime(freq, start);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.24, start + 0.025);
          g.gain.exponentialRampToValueAtTime(0.001, start + 2.1);
          osc.connect(g);
          g.connect(master);
          osc.start(start);
          osc.stop(start + 2.15);
        });
        return;
      }

      if (tierLevel === 7) {
        // 賽特 伊斐爾 / Default ？ (邪惡風格登場):
        // Reality-Crushing Dark Sub Impact + Forbidden Abyssal Organ & Blood-Bell Chord!
        const darkImpact = ctx.createOscillator();
        const dig = ctx.createGain();
        darkImpact.type = "sawtooth";
        darkImpact.frequency.setValueAtTime(130.81, now);
        darkImpact.frequency.exponentialRampToValueAtTime(21.8, now + 1.45);
        dig.gain.setValueAtTime(0.58, now);
        dig.gain.exponentialRampToValueAtTime(0.001, now + 1.48);
        darkImpact.connect(dig);
        dig.connect(master);
        darkImpact.start(now);
        darkImpact.stop(now + 1.5);

        sig.chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
          const start = now + i * 0.045;
          osc.frequency.setValueAtTime(freq, start);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.26, start + 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, start + 2.1);
          osc.connect(g);
          g.connect(master);
          osc.start(start);
          osc.stop(start + 2.15);
        });
        return;
      }

      if (tierLevel >= 5) {
        // Sub-boom for UR (5) and EX (6)
        const boom = ctx.createOscillator();
        const bg = ctx.createGain();
        boom.type = "sine";
        boom.frequency.setValueAtTime(tierLevel === 6 ? 145 : 115, now);
        boom.frequency.exponentialRampToValueAtTime(26, now + 1.1);
        bg.gain.setValueAtTime(0.5, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 1.12);
        boom.connect(bg);
        bg.connect(master);
        boom.start(now);
        boom.stop(now + 1.15);
      }

      const dur = 0.45 + tierLevel * 0.24;
      sig.chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i < 2 && tierLevel >= 4 ? "sawtooth" : sig.wave;
        const start = now + i * 0.042;
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.22, start + 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(g);
        g.connect(master);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    } catch (e) {
      // Ignore audio errors
    }
  }

  // ==================== FLASHY 60FPS CANVAS GACHA VISUAL ENGINE ====================
  // Supports:
  // - 7 Rarity Tiers (N, R, SR, SSR, UR, EX, ？)
  // - 4 Bespoke Character Animation Variants:
  //   1. "phenom-seth-evil" (賽特 伊斐爾 — 邪惡風格): 12 Glowing Red Slit-Pupil Demon Eyes, Blood-Eclipse Black Hole, Crimson Claw Slashes & Blood Lightning
  //   2. "phenom-the-abyss" (The Abyss — 深淵風格): 14 Writhing Dark-Matter Abyssal Tentacles, Deep Trench Maelstrom Vortex, Rising Corruption Bubbles & Crushing Depth Rings
  //   3. "phenom-lycia-void" (莉琪雅 神隱 — 虛空風格): Pale Cyan-White-Violet Void Erasure, High-Frequency Spatial Glitch Bars, Hollow Geometric Void Cubes & Giant Crescent Unknown-Reaper Scythe Arcs
  //   4. "apocalypse-dragon" (赤夜 終焉龍 — 滅世風格): Scorched Magma-Crimson Sky, Blazing Volcanic Meteors, Fierce Golden-Red Dragon Eyes & Wing Shockwaves, and Apocalyptic Dragon Breath Pillar!
  const canvasEl = document.getElementById("summonFxCanvas");
  const ctx2d = canvasEl ? canvasEl.getContext("2d") : null;
  let animFrameId = null;
  let activeFxState = null;

  function resizeFxCanvas() {
    if (!canvasEl || !canvasEl.parentElement) return;
    const rect = canvasEl.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.max(1, Math.floor(rect.width * dpr));
    canvasEl.height = Math.max(1, Math.floor(rect.height * dpr));
    if (ctx2d) ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeFxCanvas);

  function startCanvasSummonFx(tierSpec, totalDurationMs, specialVariant = null) {
    if (!canvasEl || !ctx2d) return;
    resizeFxCanvas();
    stopCanvasSummonFx();

    const w = canvasEl.clientWidth || 860;
    const h = canvasEl.clientHeight || 560;
    const lvl = tierSpec.level;

    // 1. Spiraling Comet Ribbons
    const cometCount = 24 + lvl * 8;
    const comets = [];
    for (let i = 0; i < cometCount; i++) {
      const angle = (i / cometCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 60 + Math.random() * Math.max(w, h) * 0.55;
      comets.push({
        angle,
        dist,
        speedRot: (0.025 + Math.random() * 0.03) * (i % 2 === 0 ? 1 : -1) * (0.85 + lvl * 0.14),
        speedIn: 1.6 + Math.random() * 2.2 * (0.75 + lvl * 0.18),
        size: 2.2 + Math.random() * (1.8 + lvl * 0.45),
        isAccent: i % 3 === 0,
        trail: []
      });
    }

    // 2. Diagonal Shooting Meteors for SR / SSR / UR / EX / ？
    const meteors = [];
    if (lvl >= 3) {
      const mCount =
        specialVariant === "apocalypse-dragon"
          ? 38
          : lvl === 7
          ? 22
          : lvl === 6
          ? 16
          : lvl === 5
          ? 12
          : lvl === 4
          ? 8
          : 4;
      for (let i = 0; i < mCount; i++) {
        meteors.push({
          x: Math.random() * w * 1.3 - w * 0.2,
          y: -60 - Math.random() * 350,
          vx: specialVariant === "apocalypse-dragon" ? 7.5 + Math.random() * 6.5 : 5.5 + Math.random() * 4.5,
          vy: specialVariant === "apocalypse-dragon" ? 11.0 + Math.random() * 7.5 : 8.5 + Math.random() * 5.5,
          size: specialVariant === "apocalypse-dragon" ? 5.2 + Math.random() * 3.8 : 2.5 + (lvl >= 5 ? 2.2 : 1.2),
          len: specialVariant === "apocalypse-dragon" ? 130 + Math.random() * 110 : 85 + Math.random() * 75
        });
      }
    }

    // 3. Dimensional Cross-Slashes for UR (lvl 5), EX (lvl 6) and ？ (lvl 7)
    const slashes = [];
    if (lvl >= 5) {
      const sCount = specialVariant === "apocalypse-dragon" ? 18 : lvl === 7 ? 14 : lvl === 6 ? 9 : 6;
      for (let i = 0; i < sCount; i++) {
        slashes.push({
          x1: Math.random() * w * 0.18,
          y1: Math.random() * h,
          x2: w * 0.82 + Math.random() * w * 0.18,
          y2: Math.random() * h,
          alpha: 0.45 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // 4A. Evil Abyssal Demon Eyes (For 賽特 伊斐爾 "phenom-seth-evil" or default ？ Tier)
    const abyssEyes = [];
    if (lvl === 7 && specialVariant !== "phenom-the-abyss" && specialVariant !== "phenom-lycia-void") {
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const rad = 165 + (i % 2) * 75 + Math.random() * 35;
        abyssEyes.push({
          angle: ang,
          radius: rad,
          rx: 22 + Math.random() * 16,
          ry: 9 + Math.random() * 6,
          blinkSpeed: 0.003 + Math.random() * 0.003,
          phase: Math.random() * Math.PI * 2,
          tilt: (Math.random() - 0.5) * 0.5
        });
      }
    }

    // 4B. Deep Abyssal Tentacles & Corruption Bubbles (Exclusive to The Abyss "phenom-the-abyss"!)
    const abyssTentacles = [];
    const abyssBubbles = [];
    if (specialVariant === "phenom-the-abyss") {
      const tCount = 14;
      for (let i = 0; i < tCount; i++) {
        abyssTentacles.push({
          baseAngle: (i / tCount) * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          freq: 0.003 + Math.random() * 0.002,
          amp: 0.18 + Math.random() * 0.14,
          thickness: 12 + (i % 3) * 5
        });
      }
      for (let b = 0; b < 38; b++) {
        abyssBubbles.push({
          x: Math.random() * w,
          y: h + Math.random() * h,
          r: 3 + Math.random() * 9,
          vy: 1.4 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 1.2,
          alpha: 0.35 + Math.random() * 0.55
        });
      }
    }

    // 4C. Deep Midnight-Blue & Black Void Cubes, Reaper Scythes & Swarm of Mysterious "?" Marks (Exclusive to 莉琪雅 神隱 "phenom-lycia-void"!)
    const voidCubes = [];
    const voidScytheArcs = [];
    const voidQuestionMarks = [];
    if (specialVariant === "phenom-lycia-void") {
      for (let i = 0; i < 16; i++) {
        voidCubes.push({
          angle: (i / 16) * Math.PI * 2,
          dist: 120 + (i % 3) * 68 + Math.random() * 30,
          size: 14 + (i % 4) * 7,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (0.015 + Math.random() * 0.02) * (i % 2 === 0 ? 1 : -1)
        });
      }
      for (let s = 0; s < 7; s++) {
        voidScytheArcs.push({
          angle: (s / 7) * Math.PI * 2,
          radius: 130 + (s % 2) * 58,
          phase: Math.random() * Math.PI * 2,
          speed: (0.008 + s * 0.002) * (s % 2 === 0 ? 1 : -1)
        });
      }
      // 48 Mysterious Popping & Floating "?" / "？" / "？？？" Symbols across the dark blue/black void!
      const qSymbols = ["?", "？", "?", "？", "??", "？？？", "?"];
      for (let q = 0; q < 48; q++) {
        voidQuestionMarks.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.6 - Math.random() * 1.8,
          fontSize: 18 + Math.floor(Math.random() * 48),
          rot: (Math.random() - 0.5) * 0.7,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          phase: Math.random() * Math.PI * 2,
          popSpeed: 0.004 + Math.random() * 0.006,
          text: qSymbols[q % qSymbols.length],
          isDarkCore: q % 3 === 0
        });
      }
    }

    // 4D. Ultra-Explosive Apocalyptic Dragon Embers & Hellfire Orbs (Exclusive to 赤夜 終焉龍 "apocalypse-dragon"!)
    const dragonEmbers = [];
    if (specialVariant === "apocalypse-dragon") {
      for (let e = 0; e < 72; e++) {
        dragonEmbers.push({
          x: Math.random() * w,
          y: h + Math.random() * h * 0.8,
          vy: 3.2 + Math.random() * 5.8,
          vx: (Math.random() - 0.5) * 3.4,
          size: 2.6 + Math.random() * 5.8,
          isGold: e % 2 === 0
        });
      }
    }

    activeFxState = {
      tierSpec,
      specialVariant,
      totalDurationMs: totalDurationMs || 9000,
      startTime: performance.now(),
      upgraded: lvl <= 2, // SR+ starts blue and upgrades dramatically at Step 2 (Power Reveal)!
      isClimaxFinale: false,
      climaxStartTime: 0,
      comets,
      meteors,
      slashes,
      abyssEyes,
      abyssTentacles,
      abyssBubbles,
      voidCubes,
      voidScytheArcs,
      voidQuestionMarks,
      dragonEmbers,
      burstSparks: [],
      shockwaves: [],
      burstTriggered: false
    };

    function renderLoop(now) {
      if (!activeFxState) return;
      const wCurr = canvasEl.clientWidth || 860;
      const hCurr = canvasEl.clientHeight || 560;
      const cx = wCurr / 2;
      const cy = hCurr / 2;
      const elapsed = now - activeFxState.startTime;
      const isUpgradedNow = activeFxState.upgraded;
      const isClimax = activeFxState.isClimaxFinale;
      const climaxElapsed = isClimax ? now - activeFxState.climaxStartTime : 0;
      const vMode = activeFxState.specialVariant;

      ctx2d.clearRect(0, 0, wCurr, hCurr);

      let priColor = isUpgradedNow ? tierSpec.colorPrimary : "#38bdf8";
      let secColor = isUpgradedNow ? tierSpec.colorSecondary : "#60a5fa";
      if (isUpgradedNow) {
        if (vMode === "phenom-the-abyss") {
          priColor = "#9333ea";
          secColor = "#6366f1";
        } else if (vMode === "phenom-lycia-void") {
          priColor = "#1d4ed8";
          secColor = "#3b82f6";
        } else if (vMode === "apocalypse-dragon") {
          priColor = "#ef4444";
          secColor = "#fbbf24";
        }
      }

      // ==================== 0. BESPOKE CHARACTER BACKGROUND & DOMAIN EFFECTS ====================
      if (isUpgradedNow && vMode === "phenom-the-abyss") {
        // 【THE ABYSS：深淵風格】Deep Oceanic Trench Indigo-Violet-Black Maelstrom + 14 Writhing Tentacles + Bubbles
        const trenchGrad = ctx2d.createRadialGradient(cx, cy, 24, cx, cy, Math.max(wCurr, hCurr) * 0.75);
        trenchGrad.addColorStop(0, "rgba(0, 0, 0, 0.92)");
        trenchGrad.addColorStop(0.38, "rgba(46, 16, 101, 0.68)");
        trenchGrad.addColorStop(0.72, "rgba(15, 23, 42, 0.78)");
        trenchGrad.addColorStop(1, "rgba(2, 1, 10, 0.94)");
        ctx2d.fillStyle = trenchGrad;
        ctx2d.fillRect(0, 0, wCurr, hCurr);

        // Collapsing Concentric Abyssal Depth Rings
        for (let r = 0; r < 5; r++) {
          const ringR = ((elapsed * (isClimax ? 0.16 : 0.08) + r * 90) % 420);
          const invR = 420 - ringR;
          ctx2d.save();
          ctx2d.globalAlpha = (1 - invR / 420) * 0.45;
          ctx2d.strokeStyle = r % 2 === 0 ? "#a855f7" : "#4f46e5";
          ctx2d.lineWidth = 2.2;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, invR, 0, Math.PI * 2);
          ctx2d.stroke();
          ctx2d.restore();
        }

        // 14 Writhing Dark-Matter Abyssal Tentacles undulating toward the center!
        const outerR = Math.max(wCurr, hCurr) * 0.66;
        const innerTargetR = isClimax ? 42 : 95;
        for (let i = 0; i < activeFxState.abyssTentacles.length; i++) {
          const ten = activeFxState.abyssTentacles[i];
          ctx2d.save();
          ctx2d.beginPath();
          const segs = 16;
          for (let s = 0; s <= segs; s++) {
            const tRatio = s / segs;
            const curR = outerR * (1 - tRatio) + innerTargetR * tRatio;
            const wave = Math.sin(elapsed * ten.freq + ten.phase + tRatio * 5.5) * ten.amp * (1 - tRatio * 0.3);
            const a = ten.baseAngle + wave + elapsed * (isClimax ? -0.0008 : -0.0003);
            const tx = cx + Math.cos(a) * curR;
            const ty = cy + Math.sin(a) * curR;
            if (s === 0) ctx2d.moveTo(tx, ty);
            else ctx2d.lineTo(tx, ty);
          }
          ctx2d.strokeStyle = i % 2 === 0 ? "rgba(126, 34, 206, 0.55)" : "rgba(15, 7, 38, 0.85)";
          ctx2d.lineWidth = ten.thickness * (isClimax ? 1.35 : 1);
          ctx2d.lineCap = "round";
          ctx2d.stroke();

          ctx2d.strokeStyle = i % 2 === 0 ? "#c084fc" : "#818cf8";
          ctx2d.lineWidth = 2;
          ctx2d.globalAlpha = 0.65;
          ctx2d.stroke();
          ctx2d.restore();
        }

        // Rising Abyssal Corruption Bubbles
        for (let b = 0; b < activeFxState.abyssBubbles.length; b++) {
          const bub = activeFxState.abyssBubbles[b];
          bub.y -= bub.vy * (isClimax ? 1.8 : 1);
          bub.x += Math.sin(elapsed * 0.004 + b) * 0.9 + (cx - bub.x) * (isClimax ? 0.012 : 0.003);
          if (bub.y < -20) {
            bub.y = hCurr + 20;
            bub.x = Math.random() * wCurr;
          }
          ctx2d.save();
          ctx2d.globalAlpha = bub.alpha;
          ctx2d.strokeStyle = b % 2 === 0 ? "#c084fc" : "#38bdf8";
          ctx2d.fillStyle = "rgba(88, 28, 135, 0.38)";
          ctx2d.lineWidth = 1.5;
          ctx2d.beginPath();
          ctx2d.arc(bub.x, bub.y, bub.r, 0, Math.PI * 2);
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.restore();
        }
      } else if (isUpgradedNow && vMode === "phenom-lycia-void") {
        // 【莉琪雅 神隱：深邃黑藍神秘虛空風格】Deep Midnight Blue & Pitch-Black Void + Mysterious Swarm of "?" Marks!
        const voidGrad = ctx2d.createRadialGradient(cx, cy, 18, cx, cy, Math.max(wCurr, hCurr) * 0.76);
        voidGrad.addColorStop(0, "rgba(0, 0, 0, 0.96)");
        voidGrad.addColorStop(0.38, "rgba(10, 22, 54, 0.88)");
        voidGrad.addColorStop(0.72, "rgba(3, 7, 18, 0.94)");
        voidGrad.addColorStop(1, "rgba(0, 0, 0, 0.98)");
        ctx2d.fillStyle = voidGrad;
        ctx2d.fillRect(0, 0, wCurr, hCurr);

        // Mysterious Concentric Black-Blue Void Ripple Rings
        for (let r = 0; r < 5; r++) {
          const rad = ((elapsed * (isClimax ? 0.14 : 0.07) + r * 85) % 420);
          ctx2d.save();
          ctx2d.globalAlpha = (1 - rad / 420) * 0.55;
          ctx2d.strokeStyle = r % 2 === 0 ? "#1d4ed8" : "#000000";
          ctx2d.lineWidth = r % 2 === 0 ? 2.6 : 4.2;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx2d.stroke();
          ctx2d.restore();
        }

        // Deep-Blue & Pitch-Black Spatial Glitch Tears
        const glitchBars = isClimax ? 18 : 10;
        for (let g = 0; g < glitchBars; g++) {
          if (Math.random() < 0.72) {
            const gy = Math.random() * hCurr;
            const gh = 2 + Math.random() * (isClimax ? 16 : 8);
            const gx = (Math.random() - 0.1) * wCurr * 0.35;
            const gw = 110 + Math.random() * (wCurr * 0.75);
            ctx2d.save();
            ctx2d.globalAlpha = 0.38 + Math.random() * 0.5;
            ctx2d.fillStyle = g % 3 === 0 ? "#000000" : g % 2 === 0 ? "#1e3a8a" : "#2563eb";
            ctx2d.fillRect(gx, gy, gw, gh);
            ctx2d.restore();
          }
        }

        // Rotating Dark-Blue & Black Void Cubes
        for (let i = 0; i < activeFxState.voidCubes.length; i++) {
          const vc = activeFxState.voidCubes[i];
          vc.angle += 0.004 * (isClimax ? 2.2 : 1) * (i % 2 === 0 ? 1 : -1);
          vc.rot += vc.rotSpeed * (isClimax ? 2 : 1);
          const vx = cx + Math.cos(vc.angle) * vc.dist;
          const vy = cy + Math.sin(vc.angle) * (vc.dist * 0.78);
          ctx2d.save();
          ctx2d.translate(vx, vy);
          ctx2d.rotate(vc.rot);
          ctx2d.fillStyle = "rgba(0, 0, 0, 0.78)";
          ctx2d.fillRect(-vc.size / 2, -vc.size / 2, vc.size, vc.size);
          ctx2d.strokeStyle = i % 2 === 0 ? "#2563eb" : "#1e40af";
          ctx2d.lineWidth = 2.0;
          ctx2d.globalAlpha = isClimax ? 0.92 : 0.7;
          ctx2d.strokeRect(-vc.size / 2, -vc.size / 2, vc.size, vc.size);
          ctx2d.restore();
        }

        // Sweeping Crescent "-Unknown Reaper-" Dark-Blue & Black Scythe Blade Arcs
        for (let s = 0; s < activeFxState.voidScytheArcs.length; s++) {
          const sc = activeFxState.voidScytheArcs[s];
          sc.angle += sc.speed * (isClimax ? 2.5 : 1);
          ctx2d.save();
          ctx2d.translate(cx, cy);
          ctx2d.rotate(sc.angle);
          ctx2d.beginPath();
          ctx2d.arc(0, 0, sc.radius, -0.7, 0.7);
          ctx2d.strokeStyle = s % 2 === 0 ? "#3b82f6" : "#000000";
          ctx2d.lineWidth = isClimax ? 6.5 : 3.8;
          ctx2d.globalAlpha = isClimax ? 0.95 : 0.75;
          ctx2d.stroke();
          ctx2d.restore();
        }

        // SWARM OF MYSTERIOUS "?" & "？" SYMBOLS POPPING & GLITCHING OUT OF THE VOID!
        for (let q = 0; q < activeFxState.voidQuestionMarks.length; q++) {
          const qm = activeFxState.voidQuestionMarks[q];
          qm.y += qm.vy * (isClimax ? 2.1 : 1);
          qm.x += qm.vx + Math.sin(elapsed * 0.005 + qm.phase) * 0.85;
          qm.rot += qm.rotSpeed * (isClimax ? 2.2 : 1);

          // Random mysterious teleport / pop-in respawn
          if (qm.y < -40 || Math.random() < (isClimax ? 0.035 : 0.015)) {
            const popRadius = isClimax ? 45 + Math.random() * (Math.max(wCurr, hCurr) * 0.48) : Math.random() * wCurr * 0.48;
            const popAng = Math.random() * Math.PI * 2;
            qm.x = cx + Math.cos(popAng) * popRadius;
            qm.y = cy + Math.sin(popAng) * (popRadius * 0.75);
          }

          const pulseScale = 0.75 + 0.55 * Math.abs(Math.sin(elapsed * qm.popSpeed + qm.phase));
          const glitchX = Math.random() < 0.22 ? (Math.random() - 0.5) * 10 : 0;
          const glitchY = Math.random() < 0.22 ? (Math.random() - 0.5) * 6 : 0;

          ctx2d.save();
          ctx2d.translate(qm.x + glitchX, qm.y + glitchY);
          ctx2d.rotate(qm.rot);
          ctx2d.scale(pulseScale, pulseScale);
          ctx2d.font = `900 ${qm.fontSize}px "Noto Serif TC", "Cinzel", serif`;
          ctx2d.textAlign = "center";
          ctx2d.textBaseline = "middle";
          ctx2d.globalAlpha = Math.min(1, (0.35 + 0.65 * pulseScale) * (isClimax ? 1.15 : 0.9));

          // Deep-blue & pitch-black mysterious aura shadow
          ctx2d.shadowColor = "#1d4ed8";
          ctx2d.shadowBlur = 18;
          ctx2d.lineWidth = 4;
          ctx2d.strokeStyle = qm.isDarkCore ? "#3b82f6" : "#000000";
          ctx2d.strokeText(qm.text, 0, 0);

          ctx2d.fillStyle = qm.isDarkCore ? "#020617" : q % 2 === 0 ? "#60a5fa" : "#2563eb";
          ctx2d.fillText(qm.text, 0, 0);
          ctx2d.restore();
        }
      } else if (isUpgradedNow && vMode === "apocalypse-dragon") {
        // 【赤夜 終焉龍：超炸裂滅世龍皇風格】Scorched Hellfire Sky + Unfurling Blazing Dragon Wings + Jagged Horns + Fierce Dragon Eyes + Supernova Explosions!
        const dragGrad = ctx2d.createRadialGradient(cx, cy, 18, cx, cy, Math.max(wCurr, hCurr) * 0.78);
        dragGrad.addColorStop(0, "rgba(220, 38, 38, 0.72)");
        dragGrad.addColorStop(0.42, "rgba(127, 29, 29, 0.78)");
        dragGrad.addColorStop(0.75, "rgba(45, 5, 5, 0.9)");
        dragGrad.addColorStop(1, "rgba(5, 0, 0, 0.97)");
        ctx2d.fillStyle = dragGrad;
        ctx2d.fillRect(0, 0, wCurr, hCurr);

        const dPulse = 0.9 + 0.22 * Math.sin(elapsed * 0.016);
        const wingBeat = Math.sin(elapsed * (isClimax ? 0.022 : 0.011)) * 0.16;

        // 1. Giant Unfurling Blazing Golden-Crimson Dragon Wings (Left & Right)
        [-1, 1].forEach((dir) => {
          ctx2d.save();
          ctx2d.translate(cx + dir * 48, cy - 10);
          ctx2d.scale(dir, 1);
          ctx2d.rotate(wingBeat);

          for (let wIdx = 0; wIdx < 5; wIdx++) {
            const spanX = (180 + wIdx * 54) * (isClimax ? 1.25 : 1);
            const spanY = -140 + wIdx * 48;
            ctx2d.beginPath();
            ctx2d.moveTo(0, 0);
            ctx2d.quadraticCurveTo(spanX * 0.55, spanY - 65, spanX, spanY);
            ctx2d.quadraticCurveTo(spanX * 0.65, spanY + 38, 0, 24);
            ctx2d.closePath();
            ctx2d.fillStyle = wIdx % 2 === 0 ? "rgba(220, 38, 38, 0.34)" : "rgba(251, 191, 36, 0.26)";
            ctx2d.fill();
            ctx2d.lineWidth = isClimax ? 3.2 : 2.2;
            ctx2d.strokeStyle = wIdx % 2 === 0 ? "#fde047" : "#ef4444";
            ctx2d.stroke();
          }
          ctx2d.restore();
        });

        // 2. Jagged Blazing Golden-Red Dragon Horns & Fierce Slit-Pupil Dragon Eyes above the Core!
        const eyeSpread = 92 * dPulse;
        const eyeY = cy - 76;
        [-1, 1].forEach((dir) => {
          // Blazing Dragon Horn
          ctx2d.save();
          ctx2d.translate(cx + dir * (eyeSpread * 0.65), eyeY - 22);
          ctx2d.scale(dir, 1);
          ctx2d.beginPath();
          ctx2d.moveTo(0, 0);
          ctx2d.quadraticCurveTo(45, -65 * dPulse, 115, -135 * dPulse);
          ctx2d.quadraticCurveTo(55, -25 * dPulse, 18, 12);
          ctx2d.closePath();
          ctx2d.fillStyle = "#dc2626";
          ctx2d.strokeStyle = "#fde047";
          ctx2d.lineWidth = 2.8;
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.restore();

          // Fierce Golden-Crimson Dragon Eye
          ctx2d.save();
          ctx2d.translate(cx + dir * eyeSpread, eyeY);
          ctx2d.rotate(dir * -0.26);
          ctx2d.beginPath();
          ctx2d.moveTo(-44, 0);
          ctx2d.quadraticCurveTo(0, -22 * dPulse, 44, -5);
          ctx2d.quadraticCurveTo(0, 18 * dPulse, -44, 0);
          ctx2d.closePath();
          ctx2d.fillStyle = "#fef08a";
          ctx2d.shadowColor = "#ef4444";
          ctx2d.shadowBlur = 28;
          ctx2d.fill();
          ctx2d.lineWidth = 2.5;
          ctx2d.strokeStyle = "#ef4444";
          ctx2d.stroke();

          // Vertical Slit Dragon Pupil
          ctx2d.beginPath();
          ctx2d.ellipse(0, -1, 5.5, 14 * dPulse, 0, 0, Math.PI * 2);
          ctx2d.fillStyle = "#450a0a";
          ctx2d.fill();
          ctx2d.restore();
        });

        // 3. Continuous Explosive Magma Shockwaves & Hellfire Embers!
        if (!activeFxState.burstTriggered && Math.random() < (isClimax ? 0.38 : 0.16)) {
          activeFxState.shockwaves.push({
            r: 24,
            speed: isClimax ? 22 : 16,
            alpha: 0.92,
            color: Math.random() < 0.5 ? "#fde047" : "#ef4444",
            lineWidth: isClimax ? 5 : 3.5
          });
          for (let sp = 0; sp < (isClimax ? 14 : 7); sp++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 4 + Math.random() * 11;
            activeFxState.burstSparks.push({
              x: cx + (Math.random() - 0.5) * 120,
              y: cy + (Math.random() - 0.5) * 120,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 2,
              size: 2.5 + Math.random() * 4.2,
              alpha: 1,
              color: sp % 2 === 0 ? "#fde047" : "#ef4444"
            });
          }
        }

        // Rising Volcanic Magma Embers
        for (let e = 0; e < activeFxState.dragonEmbers.length; e++) {
          const em = activeFxState.dragonEmbers[e];
          em.y -= em.vy * (isClimax ? 2.4 : 1.2);
          em.x += em.vx + Math.sin(elapsed * 0.006 + e) * 1.5;
          if (em.y < -20) {
            em.y = hCurr + 20;
            em.x = Math.random() * wCurr;
          }
          ctx2d.save();
          ctx2d.globalAlpha = 0.92;
          ctx2d.fillStyle = em.isGold ? "#fde047" : "#ef4444";
          ctx2d.beginPath();
          ctx2d.arc(em.x, em.y, em.size, 0, Math.PI * 2);
          ctx2d.fill();
          ctx2d.restore();
        }
      } else if (isUpgradedNow && lvl === 7) {
        // 【賽特 伊斐爾 / Default ？：邪惡風格】Sinister Abyssal Darkness & 12 Glowing Red Demon Eyes!
        const abyssGrad = ctx2d.createRadialGradient(cx, cy, 40, cx, cy, Math.max(wCurr, hCurr) * 0.7);
        abyssGrad.addColorStop(0, "rgba(2, 0, 8, 0.72)");
        abyssGrad.addColorStop(0.45, "rgba(69, 10, 10, 0.48)");
        abyssGrad.addColorStop(1, "rgba(0, 0, 0, 0.88)");
        ctx2d.fillStyle = abyssGrad;
        ctx2d.fillRect(0, 0, wCurr, hCurr);

        const eyeIntensity = isClimax ? 1 : 0.65;
        for (let i = 0; i < activeFxState.abyssEyes.length; i++) {
          const eye = activeFxState.abyssEyes[i];
          const ex = cx + Math.cos(eye.angle + elapsed * 0.00025) * eye.radius;
          const ey = cy + Math.sin(eye.angle + elapsed * 0.00025) * (eye.radius * 0.72);
          const openRatio = Math.max(0.08, Math.abs(Math.sin(elapsed * eye.blinkSpeed + eye.phase)));

          ctx2d.save();
          ctx2d.translate(ex, ey);
          ctx2d.rotate(eye.tilt);
          ctx2d.globalAlpha = eyeIntensity * (0.45 + 0.55 * openRatio);

          ctx2d.beginPath();
          ctx2d.moveTo(-eye.rx, 0);
          ctx2d.quadraticCurveTo(0, -eye.ry * openRatio * 1.8, eye.rx, 0);
          ctx2d.quadraticCurveTo(0, eye.ry * openRatio * 1.8, -eye.rx, 0);
          ctx2d.closePath();
          ctx2d.fillStyle = "#ef4444";
          ctx2d.fill();
          ctx2d.lineWidth = 1.5;
          ctx2d.strokeStyle = "#fca5a5";
          ctx2d.stroke();

          ctx2d.beginPath();
          ctx2d.ellipse(0, 0, Math.max(2, eye.rx * 0.14), Math.max(2, eye.ry * openRatio * 0.95), 0, 0, Math.PI * 2);
          ctx2d.fillStyle = "#020005";
          ctx2d.fill();
          ctx2d.restore();
        }
      }

      // 1. Rotating God-Ray Beams (SSR / UR / EX / ？ after upgrade, intensified during Climax Finale!)
      if (isUpgradedNow && (lvl >= 4 || isClimax)) {
        const rayCount = vMode === "apocalypse-dragon" ? 22 : lvl === 7 ? 18 : lvl === 6 ? 16 : lvl === 5 ? 12 : lvl === 4 ? 8 : 6;
        const rotSpeed = (isClimax ? 2.4 : 1) * (lvl === 7 ? -0.0022 : lvl >= 6 ? 0.0024 : 0.0012);
        const baseRot = elapsed * rotSpeed;
        const maxR = Math.max(wCurr, hCurr) * 0.82;
        ctx2d.save();
        ctx2d.translate(cx, cy);
        for (let r = 0; r < rayCount; r++) {
          const a = baseRot + (r * Math.PI * 2) / rayCount;
          ctx2d.save();
          ctx2d.rotate(a);
          const grad = ctx2d.createLinearGradient(0, 0, maxR, 0);
          if (vMode === "phenom-the-abyss") {
            const abyssCols = [
              "rgba(147, 51, 234, 0.44)",
              "rgba(79, 70, 229, 0.38)",
              "rgba(59, 7, 100, 0.52)",
              "rgba(192, 132, 252, 0.35)"
            ];
            grad.addColorStop(0, abyssCols[r % abyssCols.length]);
          } else if (vMode === "phenom-lycia-void") {
            // Deep Blue & Pitch-Black Mysterious Void Rays
            const voidCols = [
              "rgba(29, 78, 216, 0.52)",
              "rgba(0, 0, 0, 0.78)",
              "rgba(30, 58, 138, 0.58)",
              "rgba(59, 130, 246, 0.42)"
            ];
            grad.addColorStop(0, voidCols[r % voidCols.length]);
          } else if (vMode === "apocalypse-dragon") {
            const dragCols = [
              "rgba(239, 68, 68, 0.62)",
              "rgba(254, 240, 138, 0.58)",
              "rgba(185, 28, 28, 0.65)",
              "rgba(249, 115, 22, 0.55)"
            ];
            grad.addColorStop(0, dragCols[r % dragCols.length]);
          } else if (lvl === 7) {
            const evilCols = [
              "rgba(220, 38, 38, 0.42)",
              "rgba(147, 51, 234, 0.36)",
              "rgba(127, 29, 29, 0.45)",
              "rgba(239, 68, 68, 0.38)"
            ];
            grad.addColorStop(0, evilCols[r % evilCols.length]);
          } else if (lvl === 6) {
            const exCols = [
              "rgba(254, 240, 138, 0.42)",
              "rgba(56, 189, 248, 0.36)",
              "rgba(255, 255, 255, 0.4)",
              "rgba(244, 63, 94, 0.32)"
            ];
            grad.addColorStop(0, exCols[r % exCols.length]);
          } else {
            grad.addColorStop(0, r % 2 === 0 ? `${priColor}44` : `${secColor}33`);
          }
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx2d.fillStyle = grad;
          const beamHalfW = isClimax ? 38 : 24;
          ctx2d.beginPath();
          ctx2d.moveTo(0, 0);
          ctx2d.lineTo(maxR, -beamHalfW);
          ctx2d.lineTo(maxR, beamHalfW);
          ctx2d.closePath();
          ctx2d.fill();
          ctx2d.restore();
        }
        ctx2d.restore();
      }

      // 2. Climax Finale Core Phenomenon (Distinct per Bespoke Variant & Tier!)
      if (isClimax && !activeFxState.burstTriggered) {
        const pulse = 0.82 + 0.25 * Math.sin(climaxElapsed * 0.015);
        ctx2d.save();
        if (vMode === "phenom-the-abyss") {
          // THE ABYSS CLIMAX: All-Devouring Deep Trench Whirlpool Singularity
          ctx2d.strokeStyle = "#a855f7";
          ctx2d.lineWidth = 6;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 180 * (1.5 - pulse * 0.5), 0, Math.PI * 2);
          ctx2d.stroke();

          ctx2d.strokeStyle = "#38bdf8";
          ctx2d.lineWidth = 3.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 135 * pulse, 0, Math.PI * 2);
          ctx2d.stroke();

          const abGrad = ctx2d.createRadialGradient(cx, cy, 4, cx, cy, 145 * pulse);
          abGrad.addColorStop(0, "#000000");
          abGrad.addColorStop(0.55, "#1e1b4b");
          abGrad.addColorStop(0.85, "#7e22ce");
          abGrad.addColorStop(1, "rgba(126, 34, 206, 0)");
          ctx2d.fillStyle = abGrad;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 145 * pulse, 0, Math.PI * 2);
          ctx2d.fill();
        } else if (vMode === "phenom-lycia-void") {
          // 莉琪雅 神隱 CLIMAX: Pitch-Black & Deep-Blue Void Singularity + Orbiting Giant "？？？" Ring!
          ctx2d.save();
          ctx2d.translate(cx, cy);
          ctx2d.rotate(climaxElapsed * 0.006);
          ctx2d.strokeStyle = "#2563eb";
          ctx2d.lineWidth = 5;
          const boxS = 195 * pulse;
          ctx2d.strokeRect(-boxS / 2, -boxS / 2, boxS, boxS);
          ctx2d.rotate(Math.PI / 4);
          ctx2d.strokeStyle = "#000000";
          ctx2d.lineWidth = 6;
          ctx2d.strokeRect(-boxS / 2, -boxS / 2, boxS, boxS);
          ctx2d.restore();

          const vdGrad = ctx2d.createRadialGradient(cx, cy, 8, cx, cy, 150 * pulse);
          vdGrad.addColorStop(0, "#000000");
          vdGrad.addColorStop(0.52, "#020617");
          vdGrad.addColorStop(0.82, "#1d4ed8");
          vdGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
          ctx2d.fillStyle = vdGrad;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 150 * pulse, 0, Math.PI * 2);
          ctx2d.fill();

          // 12 Giant Orbiting "？" around the Climax Void Core!
          for (let k = 0; k < 12; k++) {
            const ka = (k / 12) * Math.PI * 2 - climaxElapsed * 0.005;
            const kr = 185 * pulse;
            const kx = cx + Math.cos(ka) * kr;
            const ky = cy + Math.sin(ka) * kr;
            ctx2d.save();
            ctx2d.translate(kx, ky);
            ctx2d.font = `900 38px "Noto Serif TC", serif`;
            ctx2d.textAlign = "center";
            ctx2d.textBaseline = "middle";
            ctx2d.shadowColor = "#3b82f6";
            ctx2d.shadowBlur = 20;
            ctx2d.fillStyle = k % 2 === 0 ? "#60a5fa" : "#1e3a8a";
            ctx2d.strokeStyle = "#000000";
            ctx2d.lineWidth = 4;
            ctx2d.strokeText("？", 0, 0);
            ctx2d.fillText("？", 0, 0);
            ctx2d.restore();
          }
        } else if (vMode === "apocalypse-dragon") {
          // 赤夜 終焉龍 CLIMAX: Colossal 320px Apocalyptic Dragon Breath Torrent + Twin Spiraling Hellfire Dragon Helix!
          const pillarW = 165 * pulse;
          const pGrad = ctx2d.createLinearGradient(cx - pillarW, 0, cx + pillarW, 0);
          pGrad.addColorStop(0, "rgba(220, 38, 38, 0)");
          pGrad.addColorStop(0.18, "rgba(185, 28, 28, 0.85)");
          pGrad.addColorStop(0.38, "rgba(249, 115, 22, 0.92)");
          pGrad.addColorStop(0.5, "rgba(254, 249, 195, 1)");
          pGrad.addColorStop(0.62, "rgba(249, 115, 22, 0.92)");
          pGrad.addColorStop(0.82, "rgba(185, 28, 28, 0.85)");
          pGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
          ctx2d.fillStyle = pGrad;
          ctx2d.fillRect(cx - pillarW, 0, pillarW * 2, hCurr);

          // Twin Spiraling Black-Gold & Crimson Hellfire Dragon Helix coiling up the pillar!
          for (let hIdx = 0; hIdx < 2; hIdx++) {
            ctx2d.save();
            ctx2d.beginPath();
            const steps = 28;
            for (let s = 0; s <= steps; s++) {
              const py = (hCurr * s) / steps;
              const phase = s * 0.42 - climaxElapsed * 0.018 + hIdx * Math.PI;
              const px = cx + Math.sin(phase) * (pillarW * 1.15);
              if (s === 0) ctx2d.moveTo(px, py);
              else ctx2d.lineTo(px, py);
            }
            ctx2d.strokeStyle = hIdx === 0 ? "#fde047" : "#000000";
            ctx2d.lineWidth = hIdx === 0 ? 10 : 8;
            ctx2d.shadowColor = "#ef4444";
            ctx2d.shadowBlur = 24;
            ctx2d.stroke();
            ctx2d.restore();
          }

          ctx2d.strokeStyle = "#fde047";
          ctx2d.lineWidth = 7;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 195 * pulse, 0, Math.PI * 2);
          ctx2d.stroke();

          ctx2d.strokeStyle = "#ef4444";
          ctx2d.lineWidth = 4.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 245 * (1.6 - pulse * 0.6), 0, Math.PI * 2);
          ctx2d.stroke();
        } else if (lvl === 7) {
          // 賽特 伊斐爾 CLIMAX: Evil Blood-Eclipse Singularity Black Hole
          ctx2d.strokeStyle = "#ef4444";
          ctx2d.lineWidth = 5.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 165 * pulse, 0, Math.PI * 2);
          ctx2d.stroke();

          ctx2d.strokeStyle = "#9333ea";
          ctx2d.lineWidth = 3.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 215 * (1.7 - pulse * 0.7), 0, Math.PI * 2);
          ctx2d.stroke();

          const bhGrad = ctx2d.createRadialGradient(cx, cy, 8, cx, cy, 125 * pulse);
          bhGrad.addColorStop(0, "#000000");
          bhGrad.addColorStop(0.65, "#05000a");
          bhGrad.addColorStop(0.88, "#dc2626");
          bhGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
          ctx2d.fillStyle = bhGrad;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 125 * pulse, 0, Math.PI * 2);
          ctx2d.fill();
        } else if (lvl === 6) {
          // EX TIER CLIMAX: Sacred White-Gold & Cyan Genesis Supernova Halo
          ctx2d.strokeStyle = "#fde047";
          ctx2d.lineWidth = 5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 175 * pulse, 0, Math.PI * 2);
          ctx2d.stroke();

          ctx2d.strokeStyle = "#38bdf8";
          ctx2d.lineWidth = 3.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 225 * pulse, 0, Math.PI * 2);
          ctx2d.stroke();

          const genGrad = ctx2d.createRadialGradient(cx, cy, 5, cx, cy, 130 * pulse);
          genGrad.addColorStop(0, "#ffffff");
          genGrad.addColorStop(0.5, "rgba(254, 240, 138, 0.85)");
          genGrad.addColorStop(0.85, "rgba(56, 189, 248, 0.45)");
          genGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
          ctx2d.fillStyle = genGrad;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, 130 * pulse, 0, Math.PI * 2);
          ctx2d.fill();
        } else {
          // Tiers 1..5 Climax Energy Core Halo
          ctx2d.strokeStyle = priColor;
          ctx2d.lineWidth = 3.5;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, (110 + lvl * 12) * pulse, 0, Math.PI * 2);
          ctx2d.stroke();
        }
        ctx2d.restore();
      }

      // 3. Spiraling Comet Ribbons with Glowing Tails
      const speedMult = isClimax ? 2.35 : isUpgradedNow ? 1.35 : 1;
      for (let i = 0; i < activeFxState.comets.length; i++) {
        const c = activeFxState.comets[i];
        c.angle += c.speedRot * speedMult * (lvl === 7 ? -1.2 : 1);
        if (!activeFxState.burstTriggered) {
          c.dist -= c.speedIn * (isClimax ? 2.2 : 1);
          if (c.dist < 16) {
            c.dist = Math.max(wCurr, hCurr) * 0.52;
            c.trail = [];
          }
        } else {
          c.dist += c.speedIn * 5.4;
        }

        const px = cx + Math.cos(c.angle) * c.dist;
        const py = cy + Math.sin(c.angle) * c.dist;
        c.trail.push({ x: px, y: py });
        if (c.trail.length > (isClimax ? 10 : 7)) c.trail.shift();

        if (c.trail.length > 1) {
          ctx2d.beginPath();
          ctx2d.moveTo(c.trail[0].x, c.trail[0].y);
          for (let t = 1; t < c.trail.length; t++) {
            ctx2d.lineTo(c.trail[t].x, c.trail[t].y);
          }
          ctx2d.strokeStyle =
            lvl === 7 && c.isAccent
              ? "#000000"
              : c.isAccent
              ? "#ffffff"
              : i % 2 === 0
              ? priColor
              : secColor;
          ctx2d.lineWidth = c.size * (isClimax ? 0.95 : 0.75);
          ctx2d.globalAlpha = isClimax ? 0.8 : 0.55;
          ctx2d.stroke();
        }

        ctx2d.globalAlpha = 0.95;
        ctx2d.fillStyle = lvl === 7 && i % 2 === 0 ? "#ef4444" : "#ffffff";
        ctx2d.beginPath();
        ctx2d.arc(px, py, c.size, 0, Math.PI * 2);
        ctx2d.fill();
      }

      // 4. Shooting Meteors (SR+ after upgrade, super-charged for Apocalypse Dragon!)
      if (isUpgradedNow && activeFxState.meteors.length > 0 && !activeFxState.burstTriggered) {
        const mMult = (isClimax ? 1.85 : 1) * (vMode === "apocalypse-dragon" ? 1.35 : 1);
        for (let i = 0; i < activeFxState.meteors.length; i++) {
          const m = activeFxState.meteors[i];
          m.x += m.vx * mMult;
          m.y += m.vy * mMult;
          if (m.y > hCurr + 90 || m.x > wCurr + 90) {
            m.x = Math.random() * wCurr * 0.95 - wCurr * 0.1;
            m.y = -40 - Math.random() * 140;
          }
          const tailX = m.x - m.vx * (vMode === "apocalypse-dragon" ? 16 : 12);
          const tailY = m.y - m.vy * (vMode === "apocalypse-dragon" ? 16 : 12);
          const grad = ctx2d.createLinearGradient(m.x, m.y, tailX, tailY);
          grad.addColorStop(
            0,
            vMode === "apocalypse-dragon"
              ? "#fef08a"
              : vMode === "phenom-lycia-void"
              ? "#60a5fa"
              : lvl === 7
              ? "#fca5a5"
              : "#ffffff"
          );
          grad.addColorStop(0.28, priColor);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx2d.globalAlpha = 0.94;
          ctx2d.strokeStyle = grad;
          ctx2d.lineWidth = m.size * (isClimax ? 1.45 : 1);
          ctx2d.beginPath();
          ctx2d.moveTo(m.x, m.y);
          ctx2d.lineTo(tailX, tailY);
          ctx2d.stroke();

          ctx2d.fillStyle =
            vMode === "apocalypse-dragon"
              ? "#fde047"
              : vMode === "phenom-lycia-void"
              ? "#1d4ed8"
              : lvl === 7
              ? "#ef4444"
              : "#ffffff";
          ctx2d.beginPath();
          ctx2d.arc(m.x, m.y, m.size * 1.3, 0, Math.PI * 2);
          ctx2d.fill();
        }
      }

      // 5. Dimensional Cross-Slashes (UR, EX, Apocalypse Dragon Claw Slashes, and ？ Tier Rifts)
      if (isUpgradedNow && activeFxState.slashes.length > 0 && !activeFxState.burstTriggered) {
        for (let i = 0; i < activeFxState.slashes.length; i++) {
          const sl = activeFxState.slashes[i];
          const pulse = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * (isClimax ? 0.018 : 0.008) + sl.phase));
          ctx2d.globalAlpha = sl.alpha * pulse * (isClimax ? 1.25 : 0.85);
          if (vMode === "apocalypse-dragon") {
            ctx2d.strokeStyle = i % 2 === 0 ? "#fde047" : "#ef4444";
            ctx2d.lineWidth = isClimax ? 5.2 : 3.4;
          } else if (vMode === "phenom-lycia-void") {
            ctx2d.strokeStyle = i % 2 === 0 ? "#2563eb" : "#000000";
            ctx2d.lineWidth = isClimax ? 4.5 : 2.8;
          } else if (lvl === 7) {
            ctx2d.strokeStyle = i % 2 === 0 ? "#ef4444" : "#9333ea";
            ctx2d.lineWidth = isClimax ? 4.2 : 2.6;
          } else {
            ctx2d.strokeStyle = i % 2 === 0 ? "#ffffff" : priColor;
            ctx2d.lineWidth = isClimax ? 3.4 : 2.2;
          }
          ctx2d.beginPath();
          ctx2d.moveTo(sl.x1, sl.y1);
          ctx2d.lineTo(sl.x2, sl.y2);
          ctx2d.stroke();
        }
      }

      // 6. Procedural Branching Lightning (SR+ after upgrade, super-dense for Apocalypse Dragon & Climax Finale!)
      if (
        isUpgradedNow &&
        (lvl >= 3 || isClimax) &&
        !activeFxState.burstTriggered &&
        Math.random() < (vMode === "apocalypse-dragon" ? 0.88 : isClimax ? 0.78 : 0.32 + lvl * 0.08)
      ) {
        const boltCount =
          vMode === "apocalypse-dragon"
            ? isClimax
              ? 8
              : 5
            : isClimax
            ? Math.max(2, lvl - 1)
            : lvl >= 5
            ? 3
            : lvl >= 4
            ? 2
            : 1;
        for (let b = 0; b < boltCount; b++) {
          ctx2d.strokeStyle =
            vMode === "apocalypse-dragon"
              ? b % 3 === 0
                ? "#fde047"
                : b % 2 === 0
                ? "#ef4444"
                : "#000000"
              : vMode === "phenom-lycia-void"
              ? b % 2 === 0
                ? "#2563eb"
                : "#000000"
              : lvl === 7
              ? b % 2 === 0
                ? "#ef4444"
                : "#000000"
              : b === 0
              ? "#ffffff"
              : priColor;
          ctx2d.lineWidth = vMode === "apocalypse-dragon" ? 3.8 : lvl === 7 ? 3.2 : lvl >= 5 ? 2.6 : 1.8;
          ctx2d.globalAlpha = 0.92;
          ctx2d.beginPath();
          let lx = cx + (Math.random() - 0.5) * 480;
          let ly = 0;
          ctx2d.moveTo(lx, ly);
          const segs = 9;
          for (let s = 1; s <= segs; s++) {
            lx += (cx - lx) * 0.28 + (Math.random() - 0.5) * 95;
            ly = (hCurr * s) / segs;
            ctx2d.lineTo(lx, ly);
          }
          ctx2d.stroke();
        }
      }

      // 7. Step & Reveal Burst Fountain Sparks
      for (let i = activeFxState.burstSparks.length - 1; i >= 0; i--) {
        const sp = activeFxState.burstSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.1;
        sp.alpha *= 0.95;
        if (sp.alpha <= 0.02) {
          activeFxState.burstSparks.splice(i, 1);
          continue;
        }
        ctx2d.globalAlpha = sp.alpha;
        ctx2d.fillStyle = sp.color;
        ctx2d.beginPath();
        ctx2d.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx2d.fill();
      }

      // 8. Expanding Shockwave Rings
      for (let i = activeFxState.shockwaves.length - 1; i >= 0; i--) {
        const sw = activeFxState.shockwaves[i];
        sw.r += sw.speed;
        sw.alpha *= 0.93;
        if (sw.alpha <= 0.02) {
          activeFxState.shockwaves.splice(i, 1);
          continue;
        }
        ctx2d.globalAlpha = sw.alpha;
        ctx2d.strokeStyle = sw.color;
        ctx2d.lineWidth = sw.lineWidth;
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, sw.r, 0, Math.PI * 2);
        ctx2d.stroke();
      }

      ctx2d.globalAlpha = 1;
      animFrameId = requestAnimationFrame(renderLoop);
    }

    animFrameId = requestAnimationFrame(renderLoop);
  }

  // Trigger a shockwave + particle burst whenever one of the 4 giant center texts slams in
  function triggerCanvasStepImpact(colorHex, upgradeNow = false) {
    if (!activeFxState || !canvasEl) return;
    if (upgradeNow) {
      activeFxState.upgraded = true;
    }
    const cx = (canvasEl.clientWidth || 860) / 2;
    const cy = (canvasEl.clientHeight || 560) / 2;
    activeFxState.shockwaves.push(
      { r: 22, speed: 15, alpha: 0.95, color: "#ffffff", lineWidth: 4 },
      { r: 12, speed: 10, alpha: 0.9, color: colorHex || "#38bdf8", lineWidth: 3 }
    );
    for (let i = 0; i < 20; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.5 + Math.random() * 6.5;
      activeFxState.burstSparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.5,
        size: 1.8 + Math.random() * 2.6,
        alpha: 0.95,
        color: i % 2 === 0 ? "#ffffff" : colorHex || "#38bdf8"
      });
    }
  }

  // Activate the Grand Climax Finale Phase ("字都跳完後 跑一個最帥的動畫")
  function triggerCanvasClimaxFinale() {
    if (!activeFxState || !canvasEl) return;
    activeFxState.upgraded = true;
    activeFxState.isClimaxFinale = true;
    activeFxState.climaxStartTime = performance.now();
    const spec = activeFxState.tierSpec;
    activeFxState.shockwaves.push(
      { r: 16, speed: 18, alpha: 1, color: spec.level === 7 ? "#ef4444" : "#ffffff", lineWidth: 5.5 },
      { r: 10, speed: 12, alpha: 0.95, color: spec.colorPrimary, lineWidth: 4 },
      { r: 6, speed: 8, alpha: 0.88, color: spec.colorSecondary, lineWidth: 3 }
    );
  }

  function triggerCanvasRevealBurst(tierSpec) {
    if (!activeFxState || !canvasEl) return;
    activeFxState.burstTriggered = true;
    const cx = (canvasEl.clientWidth || 860) / 2;
    const cy = (canvasEl.clientHeight || 560) / 2;
    const lvl = tierSpec.level;

    // Multi-ring shockwaves
    activeFxState.shockwaves.push(
      { r: 18, speed: 16, alpha: 0.98, color: "#ffffff", lineWidth: 5 },
      { r: 10, speed: 11.5, alpha: 0.9, color: tierSpec.colorPrimary, lineWidth: 3.5 }
    );
    if (lvl >= 3) {
      activeFxState.shockwaves.push({
        r: 6,
        speed: 8,
        alpha: 0.85,
        color: tierSpec.colorSecondary,
        lineWidth: 2.5
      });
    }

    // Explosive fountain of celebration sparks
    const sparkCount = 28 + lvl * 12;
    for (let i = 0; i < sparkCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * (6 + lvl * 1.5);
      activeFxState.burstSparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 2,
        size: 2 + Math.random() * 3.5,
        alpha: 1,
        color: i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? tierSpec.colorPrimary : tierSpec.colorSecondary
      });
    }
  }

  function stopCanvasSummonFx() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    activeFxState = null;
    if (canvasEl && ctx2d) {
      ctx2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  }

  // ==================== SUMMON SIMULATOR STATE & STORAGE ====================
  const STORAGE_KEY_STATS = "arelita_summon_stats_v1";
  const summonState = {
    theme: localStorage.getItem("arelita_theme") || "ocean",
    sfxEnabled: true,
    fastMode: false,
    prefRace: "",
    prefAlign: "",
    matchMode: "strict", // "strict" | "rateup"
    isSummoning: false,
    activeTimers: [],
    currentBatch: [],
    selectedBatchIdx: 0,
    totalPulls: 0,
    highRarityCount: 0,
    unlockedIds: new Set(),
    recentHistory: []
  };

  function loadSavedSummonStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      summonState.totalPulls = Number(parsed.totalPulls) || 0;
      summonState.highRarityCount = Number(parsed.highRarityCount) || 0;
      if (Array.isArray(parsed.unlockedIds)) {
        summonState.unlockedIds = new Set(parsed.unlockedIds);
      }
      if (Array.isArray(parsed.recentHistory)) {
        summonState.recentHistory = parsed.recentHistory.slice(0, 30);
      }
    } catch (e) {
      // Ignore storage error
    }
  }

  function saveSummonStats() {
    try {
      localStorage.setItem(
        STORAGE_KEY_STATS,
        JSON.stringify({
          totalPulls: summonState.totalPulls,
          highRarityCount: summonState.highRarityCount,
          unlockedIds: Array.from(summonState.unlockedIds),
          recentHistory: summonState.recentHistory.slice(0, 30)
        })
      );
    } catch (e) {
      // Ignore storage error
    }
  }

  // ==================== WEIGHTED GACHA PROBABILITY & FILTERING LOGIC ====================
  function matchesRaceFilter(c, raceVal) {
    if (!raceVal) return true;
    if (raceVal === "GROUP_UNDEAD") {
      return c.raceCategories.includes("亡靈族") || c.raceCategories.includes("不死族");
    }
    if (raceVal === "GROUP_BLOOD") {
      return c.raceCategories.includes("血魔族") || c.raceCategories.includes("吸血鬼");
    }
    if (raceVal === "GROUP_YOKAI") {
      return c.raceCategories.includes("妖怪") || c.raceCategories.includes("妖魔");
    }
    if (raceVal === "GROUP_FANTASY") {
      return (
        c.raceCategories.includes("幻想種") ||
        c.raceCategories.includes("精靈") ||
        c.raceCategories.includes("妖精族")
      );
    }
    return c.raceCategories.includes(raceVal);
  }

  function matchesAlignFilter(c, alignVal) {
    if (!alignVal) return true;
    const raw = String(c.profile["善惡"] || "").trim();
    if (alignVal === "GROUP_GOOD") return /善/.test(raw);
    if (alignVal === "GROUP_NEUTRAL") return /中立/.test(raw);
    if (alignVal === "GROUP_EVIL") return /惡/.test(raw);
    return raw.includes(alignVal);
  }

  function getFilteredPool(raceVal, alignVal) {
    return characters.filter(
      (c) => matchesRaceFilter(c, raceVal) && matchesAlignFilter(c, alignVal)
    );
  }

  // Build candidate list with effective weights (stronger characters ALWAYS have lower weight!)
  function getWeightedCandidates(minTierLevel = 1) {
    const exactMatches = getFilteredPool(summonState.prefRace, summonState.prefAlign);
    let candidatePool = characters;

    if (summonState.matchMode === "strict") {
      if (exactMatches.length > 0) {
        candidatePool = exactMatches;
      } else {
        const partial = characters.filter(
          (c) =>
            (summonState.prefRace && matchesRaceFilter(c, summonState.prefRace)) ||
            (summonState.prefAlign && matchesAlignFilter(c, summonState.prefAlign))
        );
        candidatePool = partial.length > 0 ? partial : characters;
      }
    }

    if (minTierLevel > 1) {
      const highPool = candidatePool.filter((c) => c.summonTier && c.summonTier.level >= minTierLevel);
      if (highPool.length > 0) candidatePool = highPool;
    }

    return candidatePool.map((c) => {
      let mult = 1;
      if (summonState.matchMode === "rateup" && (summonState.prefRace || summonState.prefAlign)) {
        const mRace = matchesRaceFilter(c, summonState.prefRace);
        const mAlign = matchesAlignFilter(c, summonState.prefAlign);
        if (mRace && mAlign) mult = 6;
        else if ((summonState.prefRace && mRace) || (summonState.prefAlign && mAlign)) mult = 2.5;
      }
      return {
        char: c,
        weight: (c.baseGachaWeight || 1) * mult
      };
    });
  }

  function drawOneSummonedCharacter(minTierLevel = 1) {
    const weighted = getWeightedCandidates(minTierLevel);
    if (weighted.length === 0) return null;

    let totalWeight = 0;
    for (let i = 0; i < weighted.length; i++) {
      totalWeight += weighted[i].weight;
    }
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < weighted.length; i++) {
      roll -= weighted[i].weight;
      if (roll <= 0) {
        return weighted[i].char;
      }
    }
    return weighted[weighted.length - 1].char;
  }

  // ==================== UI INITIALIZATION & POOL STATUS ====================
  function initPreferenceControls() {
    const raceSel = document.getElementById("prefRaceSelect");
    if (raceSel) {
      let html = `<option value="">🌟 不限種族（全部 ${characters.length} 名角色）</option>`;
      html += `<optgroup label="── 複合種族大類 ──">`;
      html += `<option value="GROUP_UNDEAD">💀 亡靈族／不死族 (${characters.filter((c) => matchesRaceFilter(c, "GROUP_UNDEAD")).length}人)</option>`;
      html += `<option value="GROUP_BLOOD">🩸 血魔族／吸血鬼 (${characters.filter((c) => matchesRaceFilter(c, "GROUP_BLOOD")).length}人)</option>`;
      html += `<option value="GROUP_YOKAI">🦊 妖怪／妖魔 (${characters.filter((c) => matchesRaceFilter(c, "GROUP_YOKAI")).length}人)</option>`;
      html += `<option value="GROUP_FANTASY">✨ 幻想種／精靈／妖精 (${characters.filter((c) => matchesRaceFilter(c, "GROUP_FANTASY")).length}人)</option>`;
      html += `</optgroup>`;
      html += `<optgroup label="── 單一世界觀種族 ──">`;
      CANONICAL_RACES.forEach((r) => {
        const cnt = characters.filter((c) => c.raceCategories.includes(r)).length;
        if (cnt > 0) {
          html += `<option value="${esc(r)}">${esc(r)} (${cnt}人)</option>`;
        }
      });
      html += `</optgroup>`;
      raceSel.innerHTML = html;

      raceSel.addEventListener("change", () => {
        summonState.prefRace = raceSel.value;
        syncPreferenceUI();
      });
    }

    const chipBox = document.getElementById("quickRaceChips");
    if (chipBox) {
      chipBox.innerHTML = POPULAR_QUICK_RACES.map(
        (item) =>
          `<button type="button" class="summon-chip ${item.value === "" ? "active" : ""}" data-race-chip="${esc(item.value)}">${esc(item.label)}</button>`
      ).join("");

      chipBox.querySelectorAll("[data-race-chip]").forEach((btn) => {
        btn.addEventListener("click", () => {
          summonState.prefRace = btn.getAttribute("data-race-chip") || "";
          if (raceSel) raceSel.value = summonState.prefRace;
          syncPreferenceUI();
        });
      });
    }

    const alignSel = document.getElementById("prefAlignSelect");
    if (alignSel) {
      const goodCnt = characters.filter((c) => matchesAlignFilter(c, "GROUP_GOOD")).length;
      const neuCnt = characters.filter((c) => matchesAlignFilter(c, "GROUP_NEUTRAL")).length;
      const evilCnt = characters.filter((c) => matchesAlignFilter(c, "GROUP_EVIL")).length;

      let html = `<option value="">🌟 不限善惡（全部善惡）</option>`;
      html += `<optgroup label="── 善惡陣營大類 ──">`;
      html += `<option value="GROUP_GOOD">✨ 善系陣營（極善／大善／中善／小善） (${goodCnt}人)</option>`;
      html += `<option value="GROUP_NEUTRAL">⚖️ 中立陣營 (${neuCnt}人)</option>`;
      html += `<option value="GROUP_EVIL">💀 惡系陣營（極惡／大惡／中惡／小惡） (${evilCnt}人)</option>`;
      html += `</optgroup>`;
      html += `<optgroup label="── 細部善惡值 ──">`;
      ["極善", "大善", "中善", "小善", "中立", "小惡", "中惡", "大惡", "極惡"].forEach((al) => {
        const cnt = characters.filter((c) => String(c.profile["善惡"] || "").includes(al)).length;
        if (cnt > 0) {
          html += `<option value="${esc(al)}">${esc(al)} (${cnt}人)</option>`;
        }
      });
      html += `</optgroup>`;
      alignSel.innerHTML = html;

      alignSel.addEventListener("change", () => {
        summonState.prefAlign = alignSel.value;
        syncPreferenceUI();
      });
    }

    document.querySelectorAll("#quickAlignPills [data-align-val]").forEach((btn) => {
      btn.addEventListener("click", () => {
        summonState.prefAlign = btn.getAttribute("data-align-val") || "";
        if (alignSel) alignSel.value = summonState.prefAlign;
        syncPreferenceUI();
      });
    });

    const resetRaceBtn = document.getElementById("btnResetRace");
    if (resetRaceBtn) {
      resetRaceBtn.addEventListener("click", () => {
        summonState.prefRace = "";
        if (raceSel) raceSel.value = "";
        syncPreferenceUI();
      });
    }

    const resetAlignBtn = document.getElementById("btnResetAlign");
    if (resetAlignBtn) {
      resetAlignBtn.addEventListener("click", () => {
        summonState.prefAlign = "";
        if (alignSel) alignSel.value = "";
        syncPreferenceUI();
      });
    }

    document.querySelectorAll(".summon-mode-btn[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        summonState.matchMode = btn.getAttribute("data-mode") || "strict";
        syncPreferenceUI();
      });
    });
  }

  function syncPreferenceUI() {
    document.querySelectorAll("#quickRaceChips [data-race-chip]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-race-chip") === summonState.prefRace);
    });

    document.querySelectorAll("#quickAlignPills [data-align-val]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-align-val") === summonState.prefAlign);
    });

    document.querySelectorAll(".summon-mode-btn[data-mode]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-mode") === summonState.matchMode);
    });

    const matched = getFilteredPool(summonState.prefRace, summonState.prefAlign);
    const countEl = document.getElementById("poolMatchCount");
    const breakdownEl = document.getElementById("poolTierBreakdown");
    const subLabelEl = document.getElementById("summonBtnSubLabel");

    if (countEl) {
      if (matched.length === 0) {
        countEl.innerHTML = `<span class="is-warn">⚠️ 完全符合 0 人（自動擴大至符合任一條件）</span>`;
      } else if (!summonState.prefRace && !summonState.prefAlign) {
        countEl.textContent = `全卡池共 ${matched.length} 名角色`;
      } else {
        countEl.textContent = `符合條件共 ${matched.length} 名角色`;
      }
    }

    if (subLabelEl) {
      const raceLabel = summonState.prefRace ? `【${summonState.prefRace.replace("GROUP_", "")}】` : "全種族";
      const alignLabel = summonState.prefAlign
        ? summonState.prefAlign === "GROUP_GOOD"
          ? "【善系】"
          : summonState.prefAlign === "GROUP_NEUTRAL"
          ? "【中立】"
          : summonState.prefAlign === "GROUP_EVIL"
          ? "【惡系】"
          : `【${summonState.prefAlign}】`
        : "全善惡";
      subLabelEl.textContent = `當前偏好：${raceLabel} × ${alignLabel}`;
    }

    if (breakdownEl) {
      const weightedList = getWeightedCandidates(1);
      let totalW = 0;
      const tierWeightSums = { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const tierCounts = { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      weightedList.forEach(({ char, weight }) => {
        const lvl = char.summonTier ? char.summonTier.level : 1;
        tierWeightSums[lvl] += weight;
        tierCounts[lvl] += 1;
        totalW += weight;
      });

      breakdownEl.innerHTML = [7, 6, 5, 4, 3, 2, 1]
        .map((lvl) => {
          const t = SUMMON_TIERS[lvl];
          const cnt = tierCounts[lvl] || 0;
          const pct = totalW > 0 ? ((tierWeightSums[lvl] / totalW) * 100).toFixed(1) : "0.0";
          return `
            <span class="pool-tier-pill tier-lv-${lvl}" title="${esc(t.fullTitle)}（${cnt}人）：涵蓋 ${esc(t.powerRangeText)}">
              <b>${esc(t.code)}</b>
              <em>${pct}%</em>
            </span>
          `;
        })
        .join("");
    }
  }

  // ==================== SUMMON EXECUTION & CINEMATIC ANIMATION ====================
  function clearActiveSummonTimers() {
    summonState.activeTimers.forEach((id) => clearTimeout(id));
    summonState.activeTimers = [];
  }

  function startSummonSession(count) {
    if (summonState.isSummoning) return;

    const batch = [];
    for (let i = 0; i < count; i++) {
      // On 10-pull, if the first 9 pulls had no SR+ (level >= 3), guarantee SR+ on the 10th pull!
      const needGuarantee = count >= 10 && i === count - 1 && !batch.some((c) => c.summonTier.level >= 3);
      const picked = drawOneSummonedCharacter(needGuarantee ? 3 : 1);
      if (picked) batch.push(picked);
    }
    if (batch.length === 0) return;

    // IMPORTANT: Do NOT update history or stats before the animation finishes!
    summonState.currentBatch = batch;

    // Feature the highest rarity character in the batch for the main animation
    let highestIdx = 0;
    for (let i = 1; i < batch.length; i++) {
      const a = batch[i];
      const b = batch[highestIdx];
      if (a.summonTier.level > b.summonTier.level) {
        highestIdx = i;
      } else if (
        a.summonTier.level === b.summonTier.level &&
        a.powerScore >= 0 &&
        (b.powerScore < 0 || a.powerScore < b.powerScore)
      ) {
        highestIdx = i;
      }
    }
    summonState.selectedBatchIdx = highestIdx;
    const featuredChar = batch[highestIdx];

    playSummonSequenceForCharacter(featuredChar, batch, false);
  }

  function playSummonSequenceForCharacter(featuredChar, batch, isPreviewOnly = false) {
    clearActiveSummonTimers();
    summonState.isSummoning = true;

    const tierSpec = featuredChar.summonTier || SUMMON_TIERS[1];
    const specialVariant = featuredChar.specialAnimVariant || getSpecialAnimVariant(featuredChar);
    const viewport = document.getElementById("summonStageViewport");
    const idleEl = document.getElementById("summonIdleState");
    const cineEl = document.getElementById("summonCinematicLayer");
    const resEl = document.getElementById("summonResultContainer");
    const skipBtn = document.getElementById("btnSkipSummonAnim");
    const tenPanel = document.getElementById("summonTenBatchPanel");
    const card3d = document.getElementById("ritualSummonCard3d");
    const cardTierTxt = document.getElementById("ritualCardTierText");
    const coreSymEl = document.getElementById("ritualCoreSymbol");

    // Center-Screen Giant Impact Typography Elements (ONLY the center big text — top/bottom subtitles removed!)
    const impactStageEl = document.getElementById("cinematicImpactStage");
    const impactBigTextEl = document.getElementById("impactBigText");

    if (idleEl) idleEl.classList.add("hidden");
    if (resEl) resEl.classList.add("hidden");
    if (tenPanel) tenPanel.classList.add("hidden");
    if (cineEl) cineEl.classList.remove("hidden");
    if (skipBtn) skipBtn.classList.remove("hidden");

    // Extended durations so each giant center text stays ~1 second longer, followed by a Grand Climax Finale animation!
    const speedFactor = summonState.fastMode ? 0.55 : 1;
    const tBeat1Dur = Math.floor(2300 * speedFactor); // Step 1: 古言靈術 / 稱號 / 武器 (2.3s)
    const tBeat2Dur = Math.floor(1950 * speedFactor); // Step 2: 強度階級 (1.95s)
    const tBeat3Dur = Math.floor(1950 * speedFactor); // Step 3: 種族 (1.95s)
    const tBeat4Dur = Math.floor(1950 * speedFactor); // Step 4: 所屬陣營 (1.95s)
    const baseFinaleMs = specialVariant === "apocalypse-dragon" ? 3100 : tierSpec.finaleMs || 2600;
    const tFinaleDur = Math.floor(baseFinaleMs * speedFactor); // Step 5: 字都跳完後，最帥的終極動畫！

    const tStartBeat2 = tBeat1Dur;
    const tStartBeat3 = tStartBeat2 + tBeat2Dur;
    const tStartBeat4 = tStartBeat3 + tBeat3Dur;
    const tStartFinale = tStartBeat4 + tBeat4Dur;
    const totalMs = tStartFinale + tFinaleDur;

    // Resolve upgraded primary/secondary/glow colors (accounting for bespoke character variants!)
    const upgPrimary =
      specialVariant === "phenom-the-abyss"
        ? "#9333ea"
        : specialVariant === "phenom-lycia-void"
        ? "#1d4ed8"
        : specialVariant === "apocalypse-dragon"
        ? "#ef4444"
        : tierSpec.colorPrimary;

    const upgSecondary =
      specialVariant === "phenom-the-abyss"
        ? "#6366f1"
        : specialVariant === "phenom-lycia-void"
        ? "#3b82f6"
        : specialVariant === "apocalypse-dragon"
        ? "#fbbf24"
        : tierSpec.colorSecondary;

    const upgGlow =
      specialVariant === "phenom-the-abyss"
        ? "rgba(147, 51, 234, 0.96)"
        : specialVariant === "phenom-lycia-void"
        ? "rgba(29, 78, 216, 0.96)"
        : specialVariant === "apocalypse-dragon"
        ? "rgba(239, 68, 68, 0.96)"
        : tierSpec.colorGlow;

    // Helper to slam ONLY the Giant Center-Screen Impact Text onto the stage
    function showGiantImpactText(bigText, modeClass) {
      if (!impactStageEl) return;
      impactStageEl.classList.remove(
        "is-dispersed",
        "is-impact-slamming",
        "mode-quote",
        "mode-power",
        "mode-race",
        "mode-faction"
      );
      void impactStageEl.offsetWidth;
      if (impactBigTextEl) {
        const cleanStr = String(bigText || "").trim();
        impactBigTextEl.textContent = cleanStr;
        impactBigTextEl.classList.toggle("is-long-text", cleanStr.length > 9 && cleanStr.length <= 16);
        impactBigTextEl.classList.toggle("is-very-long-text", cleanStr.length > 16);
      }
      impactStageEl.classList.add("is-impact-slamming", modeClass);
    }

    // Phase 1 (0ms): Start in base blue/cyan state before rarity upgrade at Step 2
    if (viewport) {
      const initTierAttr = tierSpec.level >= 3 ? "tier-2" : `tier-${tierSpec.level}`;
      viewport.setAttribute("data-tier", initTierAttr);
      viewport.style.setProperty("--summon-primary", tierSpec.level >= 3 ? "#38bdf8" : upgPrimary);
      viewport.style.setProperty("--summon-secondary", tierSpec.level >= 3 ? "#60a5fa" : upgSecondary);
      viewport.style.setProperty("--summon-glow", tierSpec.level >= 3 ? "rgba(56, 189, 248, 0.85)" : upgGlow);
      viewport.classList.remove(
        "is-stage-shaking",
        "is-ex-singularity",
        "is-evil-abyss",
        "is-abyss-depths",
        "is-void-erasure",
        "is-apocalypse-dragon",
        "is-tier-upgraded",
        "is-climax-finale"
      );
    }
    if (card3d) {
      card3d.classList.remove("is-card-flipping", "is-card-upgraded");
    }
    if (coreSymEl) coreSymEl.textContent = "❖";
    if (cardTierTxt) cardTierTxt.textContent = "SUMMON";

    // Start 60fps Canvas FX & Background Ritual Charge Audio
    startCanvasSummonFx(tierSpec, totalMs, specialVariant);
    playSummonChargeSfx(tierSpec.level, totalMs / 1000, specialVariant);

    // ==================== BEAT 1: 跳出大字 — 古言靈術／稱號／武器 ====================
    const voiceLine = extractCharacterSummonVoiceLine(featuredChar);
    featuredChar.summonVoiceLine = voiceLine;
    showGiantImpactText(voiceLine.text, "mode-quote");
    triggerCanvasStepImpact("#38bdf8", false);
    playBigTextImpactSfx(1, tierSpec.level, specialVariant);

    // ==================== BEAT 2: 跳出大字 — 強度階級（並觸發稀有度與專屬角色領域變色！） ====================
    const tStep2Power = setTimeout(() => {
      if (viewport) {
        viewport.setAttribute("data-tier", `tier-${tierSpec.level}`);
        viewport.style.setProperty("--summon-primary", upgPrimary);
        viewport.style.setProperty("--summon-secondary", upgSecondary);
        viewport.style.setProperty("--summon-glow", upgGlow);
        viewport.classList.add("is-tier-upgraded");
        if (tierSpec.level >= 4) {
          viewport.classList.add("is-stage-shaking");
        }
        if (specialVariant === "phenom-the-abyss") {
          viewport.classList.add("is-abyss-depths");
        } else if (specialVariant === "phenom-lycia-void") {
          viewport.classList.add("is-void-erasure");
        } else if (specialVariant === "apocalypse-dragon") {
          viewport.classList.add("is-apocalypse-dragon");
        } else if (tierSpec.level === 6) {
          viewport.classList.add("is-ex-singularity");
        } else if (tierSpec.level === 7) {
          viewport.classList.add("is-evil-abyss");
        }
      }
      if (card3d) {
        card3d.classList.add("is-card-upgraded");
      }
      if (coreSymEl) {
        coreSymEl.textContent =
          specialVariant === "phenom-the-abyss"
            ? "◈"
            : specialVariant === "phenom-lycia-void"
            ? "？？？"
            : specialVariant === "apocalypse-dragon"
            ? "🐉"
            : tierSpec.coreSymbol;
      }
      if (cardTierTxt) cardTierTxt.textContent = tierSpec.code;

      const powerText = featuredChar.power || "未標註";
      showGiantImpactText(powerText, "mode-power");
      triggerCanvasStepImpact(upgPrimary, true);
      playBigTextImpactSfx(2, tierSpec.level, specialVariant);
    }, tStartBeat2);
    summonState.activeTimers.push(tStep2Power);

    // ==================== BEAT 3: 跳出大字 — 種族 ====================
    const tStep3Race = setTimeout(() => {
      const raceText = String(featuredChar.profile["種族"] || "").trim() || "不明種族";
      showGiantImpactText(raceText, "mode-race");
      triggerCanvasStepImpact(upgSecondary, true);
      playBigTextImpactSfx(3, tierSpec.level, specialVariant);
    }, tStartBeat3);
    summonState.activeTimers.push(tStep3Race);

    // ==================== BEAT 4: 跳出大字 — 所屬陣營 ====================
    const tStep4Faction = setTimeout(() => {
      const mainFaction = featuredChar.faction || featuredChar.realm || "獨立勢力";
      showGiantImpactText(mainFaction, "mode-faction");
      triggerCanvasStepImpact(upgPrimary, true);
      playBigTextImpactSfx(4, tierSpec.level, specialVariant);
    }, tStartBeat4);
    summonState.activeTimers.push(tStep4Faction);

    // ==================== BEAT 5: 字都跳完後 — 跑最帥的終極降臨動畫 (Climax Finale!) ====================
    const tStep5Finale = setTimeout(() => {
      if (impactStageEl) {
        impactStageEl.classList.remove("is-impact-slamming");
        impactStageEl.classList.add("is-dispersed");
      }
      if (viewport) {
        viewport.classList.add("is-climax-finale");
      }
      if (card3d) {
        card3d.classList.add("is-card-flipping");
      }
      triggerCanvasClimaxFinale();
      playClimaxFinaleSfx(tierSpec.level, tFinaleDur / 1000, specialVariant);
    }, tStartFinale);
    summonState.activeTimers.push(tStep5Finale);

    // ==================== BEAT 6: 最終爆閃與角色揭曉 ====================
    const tReveal = setTimeout(() => {
      finishSummonAndReveal(featuredChar, batch, isPreviewOnly);
    }, totalMs);
    summonState.activeTimers.push(tReveal);

    if (skipBtn) {
      skipBtn.onclick = () => {
        finishSummonAndReveal(featuredChar, batch, isPreviewOnly);
      };
    }
  }

  function finishSummonAndReveal(featuredChar, batch, isPreviewOnly = false) {
    clearActiveSummonTimers();
    summonState.isSummoning = false;

    const tierSpec = featuredChar.summonTier || SUMMON_TIERS[1];
    const specialVariant = featuredChar.specialAnimVariant || getSpecialAnimVariant(featuredChar);
    const viewport = document.getElementById("summonStageViewport");
    const cineEl = document.getElementById("summonCinematicLayer");
    const resEl = document.getElementById("summonResultContainer");
    const skipBtn = document.getElementById("btnSkipSummonAnim");
    const flashEl = document.getElementById("summonScreenFlash");

    if (skipBtn) skipBtn.classList.add("hidden");
    if (cineEl) cineEl.classList.add("hidden");
    if (viewport) {
      viewport.setAttribute("data-tier", `tier-${tierSpec.level}`);
      viewport.style.setProperty("--summon-primary", tierSpec.colorPrimary);
      viewport.style.setProperty("--summon-secondary", tierSpec.colorSecondary);
      viewport.style.setProperty("--summon-glow", tierSpec.colorGlow);
      viewport.classList.remove(
        "is-stage-shaking",
        "is-ex-singularity",
        "is-evil-abyss",
        "is-abyss-depths",
        "is-void-erasure",
        "is-apocalypse-dragon",
        "is-climax-finale"
      );
    }

    // Trigger screen flash (bespoke flash colors for Seth / The Abyss / Lycia / Apocalypse Dragon!)
    if (flashEl) {
      flashEl.classList.remove(
        "is-flashing",
        "is-evil-flash",
        "is-abyss-flash",
        "is-void-flash",
        "is-dragon-flash"
      );
      void flashEl.offsetWidth;
      if (specialVariant === "phenom-the-abyss") {
        flashEl.classList.add("is-abyss-flash");
      } else if (specialVariant === "phenom-lycia-void") {
        flashEl.classList.add("is-void-flash");
      } else if (specialVariant === "apocalypse-dragon") {
        flashEl.classList.add("is-dragon-flash");
      } else if (tierSpec.level === 7) {
        flashEl.classList.add("is-evil-flash");
      }
      flashEl.classList.add("is-flashing");
    }
    triggerCanvasRevealBurst(tierSpec);
    playSummonRevealSfx(tierSpec.level, specialVariant);

    // Commit stats & history ONLY NOW after the animation finishes!
    if (!isPreviewOnly && batch && batch.length > 0) {
      summonState.totalPulls += batch.length;
      batch.forEach((c) => {
        summonState.unlockedIds.add(c.id);
        if (c.summonTier && c.summonTier.level >= 5) {
          summonState.highRarityCount += 1;
        }
        summonState.recentHistory.unshift({
          charId: c.id,
          time: Date.now()
        });
      });
      summonState.recentHistory = summonState.recentHistory.slice(0, 30);
      saveSummonStats();
      renderStatsAndHistory();
    }

    const tStopCanvas = setTimeout(() => {
      if (!summonState.isSummoning) {
        stopCanvasSummonFx();
      }
    }, 1500);
    summonState.activeTimers.push(tStopCanvas);

    if (resEl) {
      resEl.classList.remove("hidden");
      renderSummonedCharacterCard(featuredChar, batch, isPreviewOnly);
    }

    renderTenBatchStrip(batch);
  }

  // ==================== RENDER SUMMONED CHARACTER CARD ====================
  function renderSummonedCharacterCard(c, batch, isPreviewOnly = false) {
    const resEl = document.getElementById("summonResultContainer");
    if (!resEl || !c) return;

    const tier = c.summonTier || SUMMON_TIERS[1];
    const rawEpithet = String(c.profile["稱號"] || "").trim();
    const epithet = isMeaningfulContent(rawEpithet) ? rawEpithet : "";
    const portraitSrc = getPortraitUrl(c.image);

    const inlineSpecs = [
      ["種族", c.profile["種族"]],
      ["善惡", c.profile["善惡"]],
      ["性別", c.profile["性別"]],
      ["年齡", c.profile["年齡"]],
      ["生日", c.profile["生日"]],
      ["身高", c.profile["身高"]],
      ["體重", c.profile["體重"]],
      ["群體", c.profile["群體"]]
    ].filter(([, val]) => val && String(val).trim() !== "");

    const abilities = c.combatAbilities || [];

    resEl.innerHTML = `
      <article class="summon-reveal-card tier-card-lv-${tier.level}">
        <!-- Top Rarity Banner (Clean Rarity Code & Stars) -->
        <div class="summon-card-rarity-bar">
          <div class="scr-left">
            <span class="scr-tier-badge tier-badge-lv-${tier.level}">
              <span>${esc(tier.code)}</span>
            </span>
            <span class="scr-stars">${esc(tier.stars)}</span>
            ${
              isPreviewOnly
                ? `<span class="scr-preview-tag">🎬 動畫預覽</span>`
                : `<span class="scr-pull-tag">✨ 召喚獲得</span>`
            }
          </div>
          <div class="scr-right">
            <span class="scr-power-pill">⚡ 強度階級：<strong>${esc(c.power || "未標註")}</strong></span>
          </div>
        </div>

        <!-- Character Main Body -->
        <div class="summon-card-main">
          <!-- Left Portrait Column -->
          <div class="summon-portrait-col">
            <div class="summon-portrait-frame tier-frame-lv-${tier.level}">
              <div class="holo-foil-sheen" aria-hidden="true"></div>
              ${
                c.image
                  ? `<a href="portrait.html?src=${encodeURIComponent(c.image)}&caption=${encodeURIComponent(c.name)}" target="_blank" title="於新分頁放大檢視立繪">
                      <img src="${esc(portraitSrc)}" alt="${esc(c.name)}" />
                      <span class="portrait-zoom-hint">🔍 放大立繪</span>
                    </a>`
                  : `<div class="summon-portrait-placeholder">
                      <span class="placeholder-emblem">${esc(tier.code)}</span>
                      <span class="placeholder-name">${esc(c.name)}</span>
                      <small>尚無立繪紀錄</small>
                    </div>`
              }
            </div>

            <div class="summon-card-quick-actions">
              <button type="button" class="summon-action-btn is-again" id="btnCardSummonAgain">
                <span>🔄 再抽一次 (×1)</span>
              </button>
              <a href="compare.html?left=${encodeURIComponent(c.id)}" target="_blank" rel="noopener" class="summon-action-btn is-compare" title="將此角色送往能力對比／擂台賽系統">
                <span>⚔️ 派往能力對比 ↗</span>
              </a>
            </div>
          </div>

          <!-- Right Dossier Column -->
          <div class="summon-dossier-col">
            <div class="summon-title-block">
              <div class="summon-faction-line">
                <span class="badge-realm">${esc(c.realm)}</span>
                <span class="faction-main-name">${esc(c.faction)}</span>
                ${c.subFaction ? `<span class="faction-sub-name">› ${esc(c.subFaction)}</span>` : ""}
                ${c.identities.map((id) => `<span class="identity-pill">${esc(id)}</span>`).join("")}
              </div>

              <div class="summon-name-line">
                <h2 class="summon-char-name">${formatCharacterDisplayName(c.name)}</h2>
                ${epithet ? `<span class="summon-char-epithet">《${esc(epithet)}》</span>` : ""}
              </div>
            </div>

            <!-- Basic Specs Strip -->
            <div class="compare-inline-specs">
              ${inlineSpecs
                .map(
                  ([label, val]) =>
                    `<span class="spec-chip"><em>${esc(label)}：</em><strong>${esc(val)}</strong></span>`
                )
                .join("")}
            </div>

            <!-- Attributes Row -->
            <div class="summon-attrs-row">
              <span class="inline-attr-label">屬性：</span>
              <div class="summon-attrs-wrap">${buildAttrBadgeHtml(c.attrTokens)}</div>
            </div>

            <!-- Combat Abilities Scroll Box -->
            <div class="summon-abilities-section">
              <div class="compare-section-title">
                <span>⚔️ 武器・神權・神器與全能力術式 (${abilities.length} 項)</span>
                <span class="section-sub-note">COMBAT ARCHIVE</span>
              </div>
              <div class="summon-abilities-scroll">
                ${
                  abilities.length > 0
                    ? abilities
                        .map(
                          (ab) => `
                        <div class="summon-ability-item">
                          <div class="sab-type">❖ ${esc(ab.type)}</div>
                          <div class="sab-content">${esc(ab.content).replace(/\n/g, "<br/>")}</div>
                        </div>
                      `
                        )
                        .join("")
                    : `<div class="compare-no-abilities">此角色目前無額外登錄之武裝或術式條目。</div>`
                }
              </div>
            </div>
          </div>
        </div>
      </article>
    `;

    const againBtn = document.getElementById("btnCardSummonAgain");
    if (againBtn) {
      againBtn.addEventListener("click", () => {
        startSummonSession(1);
      });
    }
  }

  function renderTenBatchStrip(batch) {
    const panel = document.getElementById("summonTenBatchPanel");
    const grid = document.getElementById("summonTenBatchGrid");
    if (!panel || !grid) return;

    if (!batch || batch.length <= 1) {
      panel.classList.add("hidden");
      return;
    }

    panel.classList.remove("hidden");
    grid.innerHTML = batch
      .map((c, idx) => {
        const tier = c.summonTier || SUMMON_TIERS[1];
        const isSel = idx === summonState.selectedBatchIdx;
        const thumb = getPortraitUrl(c.image);
        return `
          <button type="button" class="ten-mini-card tier-mini-lv-${tier.level} ${isSel ? "is-selected" : ""}" data-batch-idx="${idx}">
            <div class="tmc-top">
              <span class="tmc-code">${esc(tier.code)}</span>
              <span class="tmc-power">${esc(c.power || "未知")}</span>
            </div>
            <div class="tmc-avatar">
              ${
                c.image
                  ? `<img src="${esc(thumb)}" alt="${esc(c.name)}" loading="lazy" />`
                  : `<span class="tmc-sym">${esc(tier.code)}</span>`
              }
            </div>
            <div class="tmc-name">${esc(c.name)}</div>
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-batch-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-batch-idx"));
        if (!Number.isNaN(idx) && batch[idx]) {
          summonState.selectedBatchIdx = idx;
          renderSummonedCharacterCard(batch[idx], batch, false);
          renderTenBatchStrip(batch);
        }
      });
    });
  }

  function renderStatsAndHistory() {
    const totalEl = document.getElementById("statTotalPulls");
    const rateEl = document.getElementById("statCollectionRate");
    const highEl = document.getElementById("statHighRarityCount");
    const histListEl = document.getElementById("summonHistoryList");
    const histCountEl = document.getElementById("summonHistoryCountText");

    if (totalEl) totalEl.textContent = `${summonState.totalPulls} 次`;
    if (rateEl) {
      const unlocked = summonState.unlockedIds.size;
      const pct = characters.length > 0 ? Math.round((unlocked / characters.length) * 100) : 0;
      rateEl.textContent = `${unlocked} / ${characters.length} (${pct}%)`;
    }
    if (highEl) highEl.textContent = `${summonState.highRarityCount} 次`;

    if (!histListEl) return;
    const validHist = summonState.recentHistory
      .map((item) => characters.find((c) => c.id === item.charId))
      .filter(Boolean);

    if (histCountEl) {
      histCountEl.textContent =
        validHist.length > 0 ? `顯示最近 ${validHist.length} 筆召喚紀錄` : "尚無召喚紀錄";
    }

    if (validHist.length === 0) {
      histListEl.innerHTML = `<div class="summon-history-empty">尚未進行召喚，點擊左側「單次召喚」或「十連召喚」開始抽卡！</div>`;
      return;
    }

    histListEl.innerHTML = validHist
      .map((c) => {
        const tier = c.summonTier || SUMMON_TIERS[1];
        return `
          <button type="button" class="history-char-pill tier-pill-lv-${tier.level}" data-hist-char="${esc(c.id)}" title="點擊檢視【${esc(c.name)}（${esc(c.power)}）】">
            <span class="hcp-tier">${esc(tier.code)}</span>
            <span class="hcp-name">${esc(c.name)}</span>
            <span class="hcp-power">${esc(c.power || "未知")}</span>
          </button>
        `;
      })
      .join("");

    histListEl.querySelectorAll("[data-hist-char]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (summonState.isSummoning) return;
        const cId = btn.getAttribute("data-hist-char");
        const found = characters.find((ch) => ch.id === cId);
        if (found) {
          const idleEl = document.getElementById("summonIdleState");
          const resEl = document.getElementById("summonResultContainer");
          if (idleEl) idleEl.classList.add("hidden");
          if (resEl) resEl.classList.remove("hidden");
          renderSummonedCharacterCard(found, [found], false);
        }
      });
    });
  }

  // ==================== TIER GUIDE MODAL & PREVIEW ====================
  function initTierGuideModal() {
    const modal = document.getElementById("summonTierGuideModal");
    const openBtn = document.getElementById("btnOpenTierGuide");
    const closeBtn = document.getElementById("btnCloseTierGuide");
    const backdrop = document.getElementById("tierGuideBackdrop");
    const grid = document.getElementById("tierGuideGrid");

    if (grid) {
      grid.innerHTML = [7, 6, 5, 4, 3, 2, 1]
        .map((lvl) => {
          const t = SUMMON_TIERS[lvl];
          const sampleChars = characters.filter((c) => c.summonTier && c.summonTier.level === lvl);
          const sampleNames = sampleChars
            .slice(0, 5)
            .map((c) => c.name)
            .join("、");
          const ratePct = (t.tierTargetRate * 100).toFixed(1);

          let specialPreviewHtml = "";
          if (lvl === 7) {
            specialPreviewHtml = `
              <div class="tgc-special-previews">
                <button type="button" class="tgc-preview-btn is-evil-btn" data-preview-char-id="char-2">
                  <span>👁️ 試播：賽特 伊斐爾〔邪惡風格〕</span>
                </button>
                <button type="button" class="tgc-preview-btn is-abyss-btn" data-preview-char-id="char-19">
                  <span>🌊 試播：The Abyss〔深淵風格〕</span>
                </button>
                <button type="button" class="tgc-preview-btn is-void-btn" data-preview-char-id="char-15">
                  <span>🌌 試播：莉琪雅 神隱〔虛空風格〕</span>
                </button>
              </div>
            `;
          } else if (lvl === 6) {
            specialPreviewHtml = `
              <div class="tgc-special-previews">
                <button type="button" class="tgc-preview-btn is-dragon-btn" data-preview-char-id="char-37">
                  <span>🐉 試播：赤夜 終焉龍〔滅世風格＋震天龍吼〕</span>
                </button>
                <button type="button" class="tgc-preview-btn" data-preview-tier="${lvl}">
                  <span>🎬 試播：一般 ${esc(t.code)} 神聖創世演出</span>
                </button>
              </div>
            `;
          } else {
            specialPreviewHtml = `
              <button type="button" class="tgc-preview-btn" data-preview-tier="${lvl}">
                <span>🎬 試播 ${esc(t.code)} 召喚特效與音效</span>
              </button>
            `;
          }

          return `
            <div class="tier-guide-card tier-card-lv-${lvl}">
              <div class="tgc-top">
                <span class="scr-tier-badge tier-badge-lv-${lvl}">${esc(t.code)} ‧ ${esc(t.name)}</span>
                <span class="tgc-count">基礎池機率 <strong>${ratePct}%</strong>（共 ${sampleChars.length} 人）</span>
              </div>
              <h3 class="tgc-title">${esc(t.fullTitle)} ${esc(t.stars)}</h3>
              <div class="tgc-range">⚡ 對應強度：<strong>${esc(t.powerRangeText)}</strong></div>
              <p class="tgc-desc">${esc(t.animDesc)}</p>
              <div class="tgc-samples">代表角色：${esc(sampleNames)}${sampleChars.length > 5 ? " 等..." : ""}</div>
              ${specialPreviewHtml}
            </div>
          `;
        })
        .join("");

      grid.querySelectorAll("[data-preview-char-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const charId = btn.getAttribute("data-preview-char-id");
          const targetChar = characters.find((c) => c.id === charId);
          if (targetChar) {
            if (modal) modal.classList.add("hidden");
            playSummonSequenceForCharacter(targetChar, [targetChar], true);
          }
        });
      });

      grid.querySelectorAll("[data-preview-tier]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lvl = Number(btn.getAttribute("data-preview-tier"));
          const pool = characters.filter(
            (c) => c.summonTier && c.summonTier.level === lvl && (lvl !== 6 || c.id !== "char-37")
          );
          if (pool.length > 0) {
            if (modal) modal.classList.add("hidden");
            const sample = pool[Math.floor(Math.random() * pool.length)];
            playSummonSequenceForCharacter(sample, [sample], true);
          }
        });
      });
    }

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
    if (backdrop && modal) {
      backdrop.addEventListener("click", () => modal.classList.add("hidden"));
    }
  }

  // ==================== HEADER & THEME ACTIONS ====================
  function applySummonTheme(theme) {
    const valid = ["ocean", "beach", "worldtree", "starry", "dark", "light"];
    summonState.theme = valid.includes(theme) ? theme : "ocean";
    document.documentElement.setAttribute("data-theme", summonState.theme);
    localStorage.setItem("arelita_theme", summonState.theme);

    const iconEl = document.getElementById("summonThemeIcon");
    const textEl = document.getElementById("summonThemeText");
    if (iconEl && textEl) {
      if (summonState.theme === "ocean") {
        iconEl.textContent = "🌊";
        textEl.textContent = "夏日海洋";
      } else if (summonState.theme === "beach") {
        iconEl.textContent = "🏖️";
        textEl.textContent = "假日海灘";
      } else if (summonState.theme === "worldtree") {
        iconEl.textContent = "🌳";
        textEl.textContent = "世界樹版";
      } else if (summonState.theme === "starry") {
        iconEl.textContent = "🌌";
        textEl.textContent = "星空版本";
      } else if (summonState.theme === "dark") {
        iconEl.textContent = "🌙";
        textEl.textContent = "黑色版本";
      } else {
        iconEl.textContent = "☀️";
        textEl.textContent = "白色版本";
      }
    }
  }

  function initSummonHeaderAndActions() {
    const singleBtn = document.getElementById("btnSummonSingle");
    if (singleBtn) {
      singleBtn.addEventListener("click", () => startSummonSession(1));
    }

    const multiBtn = document.getElementById("btnSummonMulti");
    if (multiBtn) {
      multiBtn.addEventListener("click", () => startSummonSession(10));
    }

    const coreBtn = document.getElementById("idleAltarCoreBtn");
    if (coreBtn) {
      coreBtn.addEventListener("click", () => startSummonSession(1));
      coreBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startSummonSession(1);
        }
      });
    }

    const sfxBtn = document.getElementById("btnToggleSummonSfx");
    if (sfxBtn) {
      sfxBtn.addEventListener("click", () => {
        summonState.sfxEnabled = !summonState.sfxEnabled;
        sfxBtn.classList.toggle("is-active", summonState.sfxEnabled);
        sfxBtn.setAttribute("aria-pressed", summonState.sfxEnabled ? "true" : "false");
        const icon = document.getElementById("summonSfxIcon");
        const txt = document.getElementById("summonSfxText");
        if (icon) icon.textContent = summonState.sfxEnabled ? "🔊" : "🔇";
        if (txt) txt.textContent = summonState.sfxEnabled ? "音效：ON" : "音效：OFF";
      });
    }

    const fastBtn = document.getElementById("btnToggleFastSummon");
    if (fastBtn) {
      fastBtn.addEventListener("click", () => {
        summonState.fastMode = !summonState.fastMode;
        fastBtn.classList.toggle("is-active", summonState.fastMode);
        fastBtn.setAttribute("aria-pressed", summonState.fastMode ? "true" : "false");
        const txt = document.getElementById("fastSummonText");
        if (txt) txt.textContent = summonState.fastMode ? "快速動畫：ON" : "快速動畫：OFF";
      });
    }

    const resetHistBtn = document.getElementById("btnResetSummonHistory");
    if (resetHistBtn) {
      resetHistBtn.addEventListener("click", () => {
        summonState.totalPulls = 0;
        summonState.highRarityCount = 0;
        summonState.unlockedIds.clear();
        summonState.recentHistory = [];
        saveSummonStats();
        renderStatsAndHistory();
      });
    }

    const themeBtn = document.getElementById("summonThemeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const nextMap = {
          ocean: "beach",
          beach: "worldtree",
          worldtree: "starry",
          starry: "dark",
          dark: "light",
          light: "ocean"
        };
        applySummonTheme(nextMap[summonState.theme] || "ocean");
      });
    }
  }

  // Boot Summon Simulator
  applySummonTheme(summonState.theme);
  loadSavedSummonStats();
  initPreferenceControls();
  syncPreferenceUI();
  renderStatsAndHistory();
  initTierGuideModal();
  initSummonHeaderAndActions();
})();
