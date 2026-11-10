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
  // 8 個稀有度等級（N / R / SR / SSR / UR / EX / Legend / ？），越強的角色抽取機率越低
  const SUMMON_TIERS = {
    1: {
      level: 1,
      code: "N",
      stars: "★☆☆☆☆",
      name: "一般",
      fullTitle: "N（一般稀有度）",
      tierTargetRate: 0.356, // 35.6% 基礎池綜合機率
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
      powerRangeText: "神王二級 ／ 神王一級（除黑卡蒂） ／ 古神三級 ／ 特例收錄：阿撒托斯、赤夜風竹、索亞德",
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
      powerRangeText: "神座級 ／ 降臨級 ／ 神王三級 ／ 黑卡蒂",
      colorPrimary: "#fde047",
      colorSecondary: "#38bdf8",
      colorGlow: "rgba(254, 240, 138, 1)",
      coreSymbol: "EX",
      finaleMs: 3400,
      chargeKicker: "SUPREME GENESIS // EX",
      chargeHeadline: "EX 規格外降臨！神聖創世奇點與諸神共鳴",
      chargeSub: "神座級／降臨級／神王三級／黑卡蒂確認",
      animDesc: "神座級／降臨級／神王三級／黑卡蒂展開【神聖創世白金虹彩奇點】，金光與天青交織之神聖宏大召喚！"
    },
    7: {
      level: 7,
      code: "Legend",
      stars: "★★★★★★", // 六顆星（黑色）
      name: "傳奇",
      fullTitle: "Legend（傳奇稀有度）",
      tierTargetRate: 0.004, // 0.4% 基礎池綜合機率（比 ？ 的 0.2% 高，但比 EX 的 0.8% 更稀有）
      powerRangeText: "終世級（赤夜終焉龍具備專屬【滅世龍吼】特殊動畫）",
      colorPrimary: "#ef4444",
      colorSecondary: "#fbbf24",
      colorGlow: "rgba(239, 68, 68, 1)",
      coreSymbol: "LEGEND",
      finaleMs: 3500,
      chargeKicker: "APOCALYPSE DRAGON // LEGEND",
      chargeHeadline: "Legend 傳奇階級降臨！漫天煉獄與滅世終焉龍威",
      chargeSub: "終世級【赤夜 終焉龍】真名解鎖",
      animDesc: "終世級【赤夜 終焉龍】專屬【滅世龍皇特殊動畫】：漫天煉獄隕石火雨、巨大金紅龍瞳與滅世龍息洪流，並伴隨震撼巨龍咆哮聲！"
    },
    8: {
      level: 8,
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

  function isHecateCharacter(c) {
    if (!c) return false;
    if (c.id === "char-106") return true;
    const nm = String(c.name || "");
    return /黑卡蒂/.test(nm);
  }

  function isExTierCharacter(score, c) {
    if (!c) return false;
    if (isHecateCharacter(c)) return true;
    // 降臨級(2)、神座級(3)、神王三級(4)
    if (score >= 2 && score <= 4) return true;
    const p = String(c.power || "");
    if (/降臨|神座|神王三/.test(p)) return true;
    return false;
  }

  function getSpecialAnimVariant(c) {
    if (!c) return "";
    const nm = String(c.name || "");
    if (c.id === "char-2" || /賽特/.test(nm)) return "phenom-seth-evil";
    if (c.id === "char-19" || /Abyss/i.test(nm)) return "phenom-the-abyss";
    if (c.id === "char-15" || /莉琪雅|利棋雅|神隱/.test(nm)) return "phenom-lycia-void";
    if (c.id === "char-37" || /終焉龍/.test(nm)) return "apocalypse-dragon";
    if (c.id === "char-106" || /黑卡蒂/.test(nm)) return "hecate-death";
    if (c.id === "char-10" || /斯卡奇/.test(nm)) return "skadi-darkness";
    if (c.id === "char-7" || /伊格那利昂/.test(nm)) return "ignalion-holyfire";
    if (c.id === "char-25" || /沃利爾/.test(nm)) return "warrior-arena";
    if (c.id === "char-32" || /別西卜/.test(nm)) return "beelzebub-swarm";
    if (c.id === "char-12" || /倪克斯/.test(nm)) return "nyx-moon-stars";
    if (c.id === "char-13" || /赫墨拉/.test(nm)) return "hemera-sun";
    if (c.id === "char-21" || /萊夫維芙/.test(nm)) return "lifeweaver-verdant";
    if (c.id === "char-38" || /拉格\s*提斯|拉格提斯/.test(nm)) return "ragtis-dragonslayer";
    return "";
  }

  // 依據指定規則精準對應 8 個稀有度等級：
  // ？ (lvl 8): 現象級 (score === 0)
  // Legend (lvl 7): 終世級 (score === 1: 赤夜 終焉龍)
  // EX (lvl 6): 神座級(3)、降臨級(2)、神王三級(4)、黑卡蒂
  // UR (lvl 5): 神王二級(5)、神王一級(6，除黑卡蒂)、古神三級(7)，以及特例指定之【阿撒托斯、赤夜風竹、索亞德】
  // SSR (lvl 4): 古神二級(8)、古神一級(9)、神明三～一級(10..12)
  // SR (lvl 3): 準神三～一級(13..15)、魔王三～一級(16..18)、英雄三～一級(19..21)
  // R (lvl 2): 龍獸三～一級(22..24)、天罰三～一級(25..27)、猛鬼三～一級(28..30)
  // N (lvl 1): 精靈(31..33)、魔導(34..36)、騎士(37..39)、魔獸(40..42)、猛獸(43..45)、凡人(46)、未標註(-1)
  function getSummonTierByScore(score, c) {
    if (score === 0) return SUMMON_TIERS[8]; // ？ (現象級)
    if (score === 1) return SUMMON_TIERS[7]; // Legend (終世級: 赤夜 終焉龍)
    if (isExTierCharacter(score, c)) return SUMMON_TIERS[6]; // EX (神座級、降臨級、神王三級、黑卡蒂)
    if (c && isSpecialUrCharacter(c)) return SUMMON_TIERS[5]; // UR (阿撒托斯、赤夜風竹、索亞德)
    if (score >= 5 && score <= 7) return SUMMON_TIERS[5]; // UR (神王二、神王一、古神三)
    if (score >= 8 && score <= 12) return SUMMON_TIERS[4]; // SSR
    if (score >= 13 && score <= 21) return SUMMON_TIERS[3]; // SR
    if (score >= 22 && score <= 30) return SUMMON_TIERS[2]; // R
    return SUMMON_TIERS[1]; // N
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
    const tierGroups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
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
  let masterGainNode = null;

  function getAudioCtx() {
    if (!summonState.sfxEnabled || summonState.sfxVolume <= 0) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) {
        audioCtx = new AC();
      }
      if (!masterGainNode && audioCtx) {
        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.setValueAtTime(summonState.sfxVolume, audioCtx.currentTime);
        masterGainNode.connect(audioCtx.destination);
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function getMasterAudioOutput(ctx) {
    if (!ctx) return null;
    if (!masterGainNode) {
      try {
        masterGainNode = ctx.createGain();
        masterGainNode.gain.setValueAtTime(summonState.sfxVolume, ctx.currentTime);
        masterGainNode.connect(ctx.destination);
      } catch (e) {
        return ctx.destination;
      }
    }
    return masterGainNode;
  }

  // Dedicated Audio Bus for Summon Sequence (allows instant silence on SKIP)
  let summonAudioBusNode = null;
  function getSummonAudioBus(ctx) {
    if (!ctx) return null;
    const master = getMasterAudioOutput(ctx);
    if (!master) return null;
    if (!summonAudioBusNode) {
      try {
        summonAudioBusNode = ctx.createGain();
        summonAudioBusNode.gain.setValueAtTime(1.0, ctx.currentTime);
        summonAudioBusNode.connect(master);
      } catch (e) {
        return master;
      }
    }
    return summonAudioBusNode;
  }

  function stopAllSummonAudio() {
    if (summonAudioBusNode) {
      try {
        const ctx = getAudioCtx();
        if (ctx) {
          const now = ctx.currentTime;
          summonAudioBusNode.gain.cancelScheduledValues(now);
          summonAudioBusNode.gain.setValueAtTime(0, now);
        }
        summonAudioBusNode.disconnect();
      } catch (e) {}
      summonAudioBusNode = null;
    }
  }

  // Play a soft pleasant tone when player adjusts the volume slider
  let previewToneTimeout = null;
  function playVolumePreviewTone() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(getMasterAudioOutput(ctx));
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
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
      // Legend: Apocalyptic Dragon Roar & Volcanic War Symphony (Heavy Sawtooth + Brass)
      wave: "sawtooth",
      subWave: "sawtooth",
      scale: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0, 523.25, 587.33],
      chord: [146.83, 220.0, 293.66, 440.0, 587.33, 880.0]
    },
    8: {
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
      master.connect(getSummonAudioBus(ctx));

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
  // ==================== 黑卡蒂 專屬音效：邪惡詭異的死亡搖籃曲 ====================
  let hecateNoiseBuf = null;
  function getHecateNoiseBuffer(ctx) {
    if (hecateNoiseBuf && hecateNoiseBuf.sampleRate === ctx.sampleRate) return hecateNoiseBuf;
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    hecateNoiseBuf = buf;
    return buf;
  }

  // 低語：帶通濾波噪音掃頻，模擬「嘶——哈——」的耳邊細語
  function hecateWhisper(ctx, out, start, dur, vol) {
    const src = ctx.createBufferSource();
    src.buffer = getHecateNoiseBuffer(ctx);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 9;
    bp.frequency.setValueAtTime(2400 + Math.random() * 1200, start);
    bp.frequency.linearRampToValueAtTime(700 + Math.random() * 500, start + dur * 0.6);
    bp.frequency.linearRampToValueAtTime(1800 + Math.random() * 1500, start + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + dur * 0.3);
    g.gain.linearRampToValueAtTime(vol * 0.4, start + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, start + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(out);
    src.start(start, Math.random() * 1.5);
    src.stop(start + dur + 0.05);
  }

  // 絲線撥動：緊繃的命運絲線被撥響（兩條略為走音的弦 → 詭異感）
  function hecateThreadPluck(ctx, out, start, freq, vol) {
    [1, 1.013].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq * det, start);
      o.frequency.exponentialRampToValueAtTime(freq * det * 0.985, start + 1.2);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(freq * 14, start);
      lp.frequency.exponentialRampToValueAtTime(freq * 1.2, start + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.3);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(start);
      o.stop(start + 1.35);
    });
  }

  // 走音音樂盒音色
  function hecateMusicBox(ctx, out, start, freq, vol) {
    [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([ratio, amp]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq * ratio, start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * amp, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.6 / ratio + 0.2);
      o.connect(g);
      g.connect(out);
      o.start(start);
      o.stop(start + 1.9);
    });
  }

  // 喪鐘：非諧波鐘聲泛音
  function hecateDeathBell(ctx, out, start, freq, vol, dur) {
    [[0.5, 0.6], [1, 1], [1.183, 0.5], [1.506, 0.45], [2.0, 0.35], [2.514, 0.25], [3.011, 0.15]].forEach(([r, a]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq * r, start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * a, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur / (0.6 + r * 0.4));
      o.connect(g);
      g.connect(out);
      o.start(start);
      o.stop(start + dur + 0.1);
    });
  }

  // 冥焰燃燒的低沉轟鳴（低通噪音）
  function hecateFlameNoise(ctx, out, start, dur, vol, fFrom, fTo, swell) {
    const src = ctx.createBufferSource();
    src.buffer = getHecateNoiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(fFrom, start);
    lp.frequency.exponentialRampToValueAtTime(fTo, start + dur * 0.85);
    const g = ctx.createGain();
    if (swell) {
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol, start + dur * 0.75);
    } else {
      g.gain.setValueAtTime(vol, start);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(lp);
    lp.connect(g);
    g.connect(out);
    src.start(start);
    src.stop(start + dur + 0.05);
  }

  function playHecateChargeSfx(ctx, out, now, dur) {
    // 1. 低沉拍頻的恐懼持續音（A1 + 三全音 D#2）
    [[55, "sawtooth", 0.16], [55.7, "sawtooth", 0.16], [77.78, "triangle", 0.12]].forEach(([f, type, v]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, now);
      o.frequency.linearRampToValueAtTime(f * 0.94, now + dur);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(220, now);
      lp.frequency.linearRampToValueAtTime(520, now + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(v, now + 1.2);
      g.gain.setValueAtTime(v, Math.max(now + 1.3, now + dur - 0.6));
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + dur + 0.05);
    });

    // 2. 扭曲的音樂盒搖籃曲（小調 + 降二級 / 三全音），發條越轉越慢、越來越走音
    const melody = [880, 1046.5, 987.77, 932.33, 880, 659.25, 622.25, 880, 1244.5, 1174.66, 880, 466.16];
    const step = 0.42;
    const n = Math.max(0, Math.floor((dur - 0.5) / step));
    for (let i = 0; i < n; i++) {
      const detune = 1 - (i / Math.max(1, n)) * 0.035;
      const swing = i % 3 === 2 ? 0.08 : 0;
      hecateMusicBox(ctx, out, now + 0.3 + i * step + swing, melody[i % melody.length] * detune, 0.12);
    }

    // 3. 耳邊低語
    for (let t = 0.6; t < dur - 0.8; t += 1.3 + Math.random() * 0.8) {
      hecateWhisper(ctx, out, now + t, 0.9 + Math.random() * 0.6, 0.22);
    }

    // 4. 絲線被拉緊的吱嘎聲
    for (let t = 1.0; t < dur - 0.5; t += 2.1) {
      const st = now + t;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(1900, st);
      o.frequency.exponentialRampToValueAtTime(2600, st + 0.5);
      o.frequency.exponentialRampToValueAtTime(1500, st + 0.9);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, st);
      g.gain.linearRampToValueAtTime(0.035, st + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.95);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 1);
    }
  }

  function playHecateImpactSfx(ctx, out, now, stepIdx) {
    // 沉重的低頻撞擊
    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(70, now);
    sub.frequency.exponentialRampToValueAtTime(22, now + 0.42);
    sg.gain.setValueAtTime(0.5, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    sub.connect(sg);
    sg.connect(out);
    sub.start(now);
    sub.stop(now + 0.47);

    // 不協和小二度 + 三全音刺擊
    [110, 116.54, 155.56].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, now);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(1400, now);
      lp.frequency.exponentialRampToValueAtTime(260, now + 0.8);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.13, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 0.95);
    });

    // 每一步撥響的絲線音高逐步下沉
    const pluckFreqs = [392, 349.23, 311.13, 293.66];
    hecateThreadPluck(ctx, out, now, pluckFreqs[(Math.max(1, stepIdx) - 1) % 4], 0.12);
    hecateWhisper(ctx, out, now + 0.05, 0.7, 0.18);
  }

  function playHecateClimaxSfx(ctx, out, now, dur) {
    // 下沉的黑暗合唱（減和弦，雙重走音鋸齒波 + 「啊」母音共振峰）
    [110, 130.81, 155.56, 185.0, 220].forEach((f) => {
      [0.996, 1.004].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f * det, now);
        o.frequency.linearRampToValueAtTime(f * det * 0.89, now + dur);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 760;
        bp.Q.value = 3.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.075, now + dur * 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(bp);
        bp.connect(g);
        g.connect(out);
        o.start(now);
        o.stop(now + dur + 0.05);
      });
    });

    // 逐漸變慢、即將停止的心跳
    let t = 0.1;
    let gap = 0.42;
    while (t < dur - 0.2) {
      [0, 0.16].forEach((off, k) => {
        const st = now + t + off;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(62, st);
        o.frequency.exponentialRampToValueAtTime(30, st + 0.22);
        g.gain.setValueAtTime(k === 0 ? 0.42 : 0.26, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
        o.connect(g);
        g.connect(out);
        o.start(st);
        o.stop(st + 0.27);
      });
      t += gap;
      gap *= 1.2;
    }

    // 冥焰逐漸升騰的轟鳴
    hecateFlameNoise(ctx, out, now, dur, 0.32, 240, 900, true);

    // 多重低語合聲
    for (let i = 0; i < 5; i++) {
      hecateWhisper(ctx, out, now + (i * dur) / 6, dur * 0.45, 0.16);
    }

    // 揭曉前絲線越拉越緊的尖鳴
    const scr = ctx.createOscillator();
    const scg = ctx.createGain();
    scr.type = "triangle";
    scr.frequency.setValueAtTime(600, now);
    scr.frequency.exponentialRampToValueAtTime(2400, now + dur);
    scg.gain.setValueAtTime(0.0001, now);
    scg.gain.linearRampToValueAtTime(0.04, now + dur * 0.9);
    scg.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    scr.connect(scg);
    scg.connect(out);
    scr.start(now);
    scr.stop(now + dur + 0.05);
  }

  function playHecateRevealSfx(ctx, out, now) {
    // 兩聲喪鐘（第二聲略為走低）
    hecateDeathBell(ctx, out, now, 196, 0.32, 4.2);
    hecateDeathBell(ctx, out, now + 1.4, 185, 0.18, 3.5);

    // 邪惡的減和弦（含降九音）
    [55, 110, 130.81, 155.56, 185.0, 233.08].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 === 0 ? "sawtooth" : "triangle";
      o.frequency.setValueAtTime(f, now);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(1800, now);
      lp.frequency.exponentialRampToValueAtTime(400, now + 2.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 2.7);
    });

    // 黑焰爆燃
    hecateFlameNoise(ctx, out, now, 1.3, 0.45, 1400, 180, false);

    // 斷續的低語「笑聲」
    for (let i = 0; i < 4; i++) {
      hecateWhisper(ctx, out, now + 0.9 + i * 0.17, 0.14, 0.26);
    }

    // 尾聲：音樂盒最後兩個走音的音
    hecateMusicBox(ctx, out, now + 2.2, 1244.5 * 0.97, 0.1);
    hecateMusicBox(ctx, out, now + 2.65, 880 * 0.95, 0.08);
  }

  // ==================== 暗 斯卡奇 專屬音效：霸王之暗・黑色暴君・萬鈞重槌 ====================
  function playSkadiChargeSfx(ctx, out, now, dur) {
    // 1. 霸王重力低頻蜂鳴（38.89Hz Eb1 + 58.27Hz Bb1 + 116.54Hz Bb2）
    [[38.89, "sawtooth", 0.22], [58.27, "triangle", 0.28], [116.54, "sawtooth", 0.15]].forEach(([f, type, v]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, now);
      o.frequency.linearRampToValueAtTime(f * 0.92, now + dur);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 4.5;
      lp.frequency.setValueAtTime(140, now);
      lp.frequency.linearRampToValueAtTime(320, now + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(v, now + 1.2);
      g.gain.setValueAtTime(v, Math.max(now + 1.3, now + dur - 0.5));
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + dur + 0.05);
    });

    // 2. 空間抽吸真空脈衝（每 1.4 秒一次霸者吞噬脈動）
    const suckCount = Math.floor(dur / 1.4);
    for (let i = 0; i < suckCount; i++) {
      const st = now + i * 1.4 + 0.2;
      const o = ctx.createOscillator();
      const bp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(45, st);
      o.frequency.exponentialRampToValueAtTime(120, st + 0.35);
      o.frequency.exponentialRampToValueAtTime(35, st + 0.85);
      bp.type = "bandpass";
      bp.Q.value = 5.0;
      bp.frequency.setValueAtTime(600, st);
      bp.frequency.exponentialRampToValueAtTime(140, st + 0.85);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.18, st + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.9);
      o.connect(bp);
      bp.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 0.95);
    }

    // 3. 霸王黑雷電弧炸響（隨機高壓雷火裂隙）
    for (let t = 0.5; t < dur - 0.4; t += 1.1 + Math.random() * 0.9) {
      const st = now + t;
      const lOsc = ctx.createOscillator();
      const lGain = ctx.createGain();
      lOsc.type = "sawtooth";
      lOsc.frequency.setValueAtTime(800 + Math.random() * 600, st);
      lOsc.frequency.exponentialRampToValueAtTime(60, st + 0.16);
      lGain.gain.setValueAtTime(0.2, st);
      lGain.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
      lOsc.connect(lGain);
      lGain.connect(out);
      lOsc.start(st);
      lOsc.stop(st + 0.2);
    }
  }

  function playSkadiImpactSfx(ctx, out, now, stepIdx) {
    // 1. 暗王之錘・索狄亞洛 萬鈞重擊（145Hz 下滑至 18Hz）
    const hammer = ctx.createOscillator();
    const hGain = ctx.createGain();
    hammer.type = "sawtooth";
    hammer.frequency.setValueAtTime(145, now);
    hammer.frequency.exponentialRampToValueAtTime(18, now + 0.48);
    hGain.gain.setValueAtTime(0.55, now);
    hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    hammer.connect(hGain);
    hGain.connect(out);
    hammer.start(now);
    hammer.stop(now + 0.55);

    // 2. 重槌金屬暗曜鏗鏘與黑雷炸裂
    [220, 311.13, 440].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.35);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(900, now);
      lp.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(lp);
      lp.connect(g);
      g.connect(out);
      osc.start(now);
      osc.stop(now + 0.45);
    });

    // 3. 空間行動延遲顫音（模擬暗王之錘的重力延遲效果）
    const flutter = ctx.createOscillator();
    const fGain = ctx.createGain();
    flutter.type = "triangle";
    flutter.frequency.setValueAtTime(85, now + 0.08);
    flutter.frequency.linearRampToValueAtTime(35, now + 0.7);
    fGain.gain.setValueAtTime(0.001, now + 0.08);
    fGain.gain.linearRampToValueAtTime(0.14, now + 0.2);
    fGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    flutter.connect(fGain);
    fGain.connect(out);
    flutter.start(now + 0.08);
    flutter.stop(now + 0.8);
  }

  function playSkadiClimaxSfx(ctx, out, now, dur) {
    // 1. 萬影臣服朝拜嘯鳴（深沉暴虐和弦升騰）
    [58.27, 87.31, 116.54, 155.56, 233.08].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, now);
      o.frequency.exponentialRampToValueAtTime(f * 1.35, now + dur * 0.8);
      o.frequency.linearRampToValueAtTime(f * 0.85, now + dur);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(320, now);
      lp.frequency.linearRampToValueAtTime(1200, now + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.12, now + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(lp);
      lp.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + dur + 0.05);
    });

    // 2. 加速度重槌心跳衝擊（暴君王權降臨步步逼近）
    let t = 0.1;
    let gap = 0.55;
    while (t < dur - 0.2) {
      const st = now + t;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(95, st);
      o.frequency.exponentialRampToValueAtTime(24, st + 0.28);
      g.gain.setValueAtTime(0.42, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 0.32);
      t += gap;
      gap = Math.max(0.18, gap * 0.82);
    }

    // 3. 連續霸王黑雷狂暴轟擊
    for (let i = 0; i < 7; i++) {
      const st = now + (dur * 0.3) + (i * dur * 0.6) / 7;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(720 - i * 40, st);
      o.frequency.exponentialRampToValueAtTime(45, st + 0.22);
      g.gain.setValueAtTime(0.24, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.24);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 0.26);
    }
  }

  function playSkadiRevealSfx(ctx, out, now) {
    // 1. 暴君破滅重槌砸定與黑雷巨爆
    const boom = ctx.createOscillator();
    const bg = ctx.createGain();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(165, now);
    boom.frequency.exponentialRampToValueAtTime(20, now + 1.2);
    bg.gain.setValueAtTime(0.65, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
    boom.connect(bg);
    bg.connect(out);
    boom.start(now);
    boom.stop(now + 1.3);

    // 2. 霸王神座莊嚴巨鐘（帶超低頻王權共振）
    [[58.27, 0.45], [116.54, 0.35], [174.81, 0.25], [233.08, 0.2], [349.62, 0.15]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      o.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 3.9);
    });

    // 3. 威嚴深紫黑曜霸主和弦（D小調霸主和弦）
    [146.83, 174.61, 220.0, 293.66, 349.23, 440.0].forEach((f, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = idx % 2 === 0 ? "sawtooth" : "sine";
      const st = now + idx * 0.035;
      o.frequency.setValueAtTime(f, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.18, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.5);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.6);
    });
  }

  // ==================== 伊格那利昂 加拉爾 專屬音效合成器：熊熊聖火與帝國王道 ====================
  function playIgnalionChargeSfx(ctx, out, now, dur) {
    // 1. 加拉爾帝國聖火熔爐巨響（雙振盪器低頻共振）
    const furnace1 = ctx.createOscillator();
    const furnace2 = ctx.createOscillator();
    const fg = ctx.createGain();
    const fFilter = ctx.createBiquadFilter();
    furnace1.type = "sawtooth";
    furnace2.type = "triangle";
    furnace1.frequency.setValueAtTime(65.41, now); // C2
    furnace2.frequency.setValueAtTime(98.0, now);  // G2
    furnace1.frequency.exponentialRampToValueAtTime(73.42, now + dur); // D2
    furnace2.frequency.exponentialRampToValueAtTime(110.0, now + dur); // A2

    fFilter.type = "lowpass";
    fFilter.frequency.setValueAtTime(180, now);
    fFilter.frequency.exponentialRampToValueAtTime(420, now + dur);
    fFilter.Q.setValueAtTime(3.5, now);

    fg.gain.setValueAtTime(0.001, now);
    fg.gain.linearRampToValueAtTime(0.35, now + 0.6);
    fg.gain.linearRampToValueAtTime(0.42, now + dur - 0.4);
    fg.gain.exponentialRampToValueAtTime(0.001, now + dur);

    furnace1.connect(fFilter);
    furnace2.connect(fFilter);
    fFilter.connect(fg);
    fg.connect(out);
    furnace1.start(now);
    furnace2.start(now);
    furnace1.stop(now + dur);
    furnace2.stop(now + dur);

    // 2. 熊熊聖火翻騰與餘燼爆裂（帶通濾波燃燒噪聲）
    const bufLen = Math.floor(ctx.sampleRate * Math.min(dur, 10));
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      data[i] = last * 2.8;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = "bandpass";
    nFilter.frequency.setValueAtTime(380, now);
    nFilter.frequency.linearRampToValueAtTime(650, now + dur * 0.7);
    nFilter.Q.setValueAtTime(2.2, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.01, now);
    ng.gain.linearRampToValueAtTime(0.24, now + 0.8);
    ng.gain.linearRampToValueAtTime(0.28, now + dur - 0.5);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noiseSrc.connect(nFilter);
    nFilter.connect(ng);
    ng.connect(out);
    noiseSrc.start(now);
    noiseSrc.stop(now + dur);

    // 3. 帝國軍團莊嚴號角三度音（每隔 1.8 秒湧現一次王道意志）
    const chordNotes = [130.81, 196.0, 261.63, 329.63]; // C3, G3, C4, E4
    const pulseCount = Math.floor(dur / 1.8);
    for (let p = 0; p < pulseCount; p++) {
      const pt = now + p * 1.8 + 0.2;
      chordNotes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, pt);
        g.gain.setValueAtTime(0.0001, pt);
        g.gain.linearRampToValueAtTime(0.07 / (idx + 1), pt + 0.25);
        g.gain.exponentialRampToValueAtTime(0.0001, pt + 1.4);
        osc.connect(g);
        g.connect(out);
        osc.start(pt);
        osc.stop(pt + 1.45);
      });
    }
  }

  function playIgnalionImpactSfx(ctx, out, now, stepIdx) {
    // 1. 火神之罰・帝國戰鼓踏陣（140Hz -> 28Hz 雄渾重擊）
    const thud = ctx.createOscillator();
    const tg = ctx.createGain();
    thud.type = "triangle";
    thud.frequency.setValueAtTime(140 + stepIdx * 15, now);
    thud.frequency.exponentialRampToValueAtTime(28, now + 0.65);
    tg.gain.setValueAtTime(0.72, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    thud.connect(tg);
    tg.connect(out);
    thud.start(now);
    thud.stop(now + 0.72);

    // 2. 聖火白焰烈斬破空呼嘯
    const whooshLen = Math.floor(ctx.sampleRate * 0.45);
    const wBuf = ctx.createBuffer(1, whooshLen, ctx.sampleRate);
    const wData = wBuf.getChannelData(0);
    for (let i = 0; i < whooshLen; i++) wData[i] = (Math.random() * 2 - 1) * Math.sin((i / whooshLen) * Math.PI);
    const wSrc = ctx.createBufferSource();
    wSrc.buffer = wBuf;
    const wFilt = ctx.createBiquadFilter();
    wFilt.type = "highpass";
    wFilt.frequency.setValueAtTime(800, now);
    wFilt.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0.38, now);
    wg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    wSrc.connect(wFilt);
    wFilt.connect(wg);
    wg.connect(out);
    wSrc.start(now);

    // 3. 帝國神火金屬拔劍與戰鎧鏗鏘響聲（880Hz / 1760Hz）
    [880, 1760].forEach((freq) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, now + 0.02);
      g.gain.setValueAtTime(0.18, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      o.connect(g);
      g.connect(out);
      o.start(now + 0.02);
      o.stop(now + 0.58);
    });
  }

  function playIgnalionClimaxSfx(ctx, out, now, dur) {
    // 1. 聖火王道燎原與萬火共主暴鳴（連續四重爆裂火球轟鳴）
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.45;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.55);
      g.gain.setValueAtTime(0.48, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + 0.62);
    }

    // 2. 加拉爾帝國輝煌進行曲（D大調高昂軍樂三和弦）
    const imperialChords = [146.83, 185.0, 220.0, 293.66, 369.99, 440.0, 587.33]; // D3, F#3, A3, D4, F#4, A4, D5
    imperialChords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      const startT = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, startT);
      g.gain.setValueAtTime(0.001, startT);
      g.gain.linearRampToValueAtTime(0.24, startT + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, startT + dur * 0.88);
      osc.connect(g);
      g.connect(out);
      osc.start(startT);
      osc.stop(startT + dur * 0.9);
    });
  }

  function playIgnalionRevealSfx(ctx, out, now) {
    // 1. 火神王降世帝國加冕大爆鳴
    const boom = ctx.createOscillator();
    const bg = ctx.createGain();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(180, now);
    boom.frequency.exponentialRampToValueAtTime(25, now + 1.4);
    bg.gain.setValueAtTime(0.72, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
    boom.connect(bg);
    bg.connect(out);
    boom.start(now);
    boom.stop(now + 1.5);

    // 2. 凱旋號角三重音（D4 -> F#4 -> A4 -> D5）
    [293.66, 369.99, 440.0, 587.33].forEach((f, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + idx * 0.08;
      o.frequency.setValueAtTime(f, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.32, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.8);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.9);
    });

    // 3. 聖火淨化餘韻鐘鳴
    [[220.0, 0.3], [440.0, 0.22], [880.0, 0.14]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, now + 0.2);
      g.gain.setValueAtTime(0.001, now + 0.2);
      g.gain.linearRampToValueAtTime(vol, now + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
      o.connect(g);
      g.connect(out);
      o.start(now + 0.2);
      o.stop(now + 3.7);
    });
  }

  // ==================== 沃利爾 德瑪 專屬音效合成器：戰爭與古羅馬競技場 ====================
  function playWarriorChargeSfx(ctx, out, now, dur) {
    // 1. 競技場千軍萬馬呼嘯與低頻戰神戰鼓脈動（55Hz / 82.4Hz）
    const drum1 = ctx.createOscillator();
    const drum2 = ctx.createOscillator();
    const dg = ctx.createGain();
    const dFilter = ctx.createBiquadFilter();
    drum1.type = "sawtooth";
    drum2.type = "triangle";
    drum1.frequency.setValueAtTime(55.0, now);
    drum2.frequency.setValueAtTime(82.41, now);
    drum1.frequency.exponentialRampToValueAtTime(65.41, now + dur);
    drum2.frequency.exponentialRampToValueAtTime(98.0, now + dur);

    dFilter.type = "lowpass";
    dFilter.frequency.setValueAtTime(160, now);
    dFilter.frequency.exponentialRampToValueAtTime(380, now + dur);
    dFilter.Q.setValueAtTime(4.0, now);

    dg.gain.setValueAtTime(0.001, now);
    dg.gain.linearRampToValueAtTime(0.36, now + 0.5);
    dg.gain.linearRampToValueAtTime(0.44, now + dur - 0.4);
    dg.gain.exponentialRampToValueAtTime(0.001, now + dur);

    drum1.connect(dFilter);
    drum2.connect(dFilter);
    dFilter.connect(dg);
    dg.connect(out);
    drum1.start(now);
    drum2.start(now);
    drum1.stop(now + dur);
    drum2.stop(now + dur);

    // 2. 競技場角鬥士狂暴戰吼與萬眾呼喊（帶通噪聲模擬海嘯戰意）
    const bufLen = Math.floor(ctx.sampleRate * Math.min(dur, 10));
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.05 * white) / 1.05;
      data[i] = last * 3.0;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = "bandpass";
    nFilter.frequency.setValueAtTime(320, now);
    nFilter.frequency.linearRampToValueAtTime(580, now + dur * 0.75);
    nFilter.Q.setValueAtTime(2.0, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.01, now);
    ng.gain.linearRampToValueAtTime(0.25, now + 0.8);
    ng.gain.linearRampToValueAtTime(0.30, now + dur - 0.5);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noiseSrc.connect(nFilter);
    nFilter.connect(ng);
    ng.connect(out);
    noiseSrc.start(now);
    noiseSrc.stop(now + dur);

    // 3. 戰神阿瑞斯古銅號角（E小調肅殺戰樂：82.41, 123.47, 164.81, 246.94Hz）
    const warHornNotes = [82.41, 123.47, 164.81, 246.94];
    const hornCount = Math.floor(dur / 1.6);
    for (let p = 0; p < hornCount; p++) {
      const pt = now + p * 1.6 + 0.15;
      warHornNotes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(f, pt);
        g.gain.setValueAtTime(0.0001, pt);
        g.gain.linearRampToValueAtTime(0.08 / (idx + 1), pt + 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, pt + 1.3);
        osc.connect(g);
        g.connect(out);
        osc.start(pt);
        osc.stop(pt + 1.35);
      });
    }
  }

  function playWarriorImpactSfx(ctx, out, now, stepIdx) {
    // 1. 戰神之器・盾牌戰槌重撼（170Hz -> 26Hz 沉重金屬鈍擊）
    const thud = ctx.createOscillator();
    const tg = ctx.createGain();
    thud.type = "triangle";
    thud.frequency.setValueAtTime(170 + stepIdx * 18, now);
    thud.frequency.exponentialRampToValueAtTime(26, now + 0.65);
    tg.gain.setValueAtTime(0.75, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    thud.connect(tg);
    tg.connect(out);
    thud.start(now);
    thud.stop(now + 0.72);

    // 2. 阿瑞斯角鬥長刃劇烈格擋鏗鏘火星音（1200Hz / 2400Hz 銳利刀劍火花）
    [1200, 2400].forEach((freq) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, now + 0.01);
      g.gain.setValueAtTime(0.24, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      o.connect(g);
      g.connect(out);
      o.start(now + 0.01);
      o.stop(now + 0.48);
    });
  }

  function playWarriorClimaxSfx(ctx, out, now, dur) {
    // 1. 競技場萬眾狂熱沸騰（連續金屬撞擊戰陣）
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.38;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.48);
      g.gain.setValueAtTime(0.52, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + 0.55);
    }

    // 2. 戰神王勝者為王進行曲（E小調剛勁銅管和弦）
    const battleChords = [82.41, 123.47, 164.81, 196.0, 246.94, 329.63, 392.0, 493.88];
    battleChords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      const startT = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, startT);
      g.gain.setValueAtTime(0.001, startT);
      g.gain.linearRampToValueAtTime(0.26, startT + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, startT + dur * 0.88);
      osc.connect(g);
      g.connect(out);
      osc.start(startT);
      osc.stop(startT + dur * 0.9);
    });
  }

  function playWarriorRevealSfx(ctx, out, now) {
    // 1. 競技場角鬥霸主登頂大重擊
    const boom = ctx.createOscillator();
    const bg = ctx.createGain();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(190, now);
    boom.frequency.exponentialRampToValueAtTime(22, now + 1.35);
    bg.gain.setValueAtTime(0.74, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    boom.connect(bg);
    bg.connect(out);
    boom.start(now);
    boom.stop(now + 1.45);

    // 2. 戰神凱旋戰號四重奏（E4 -> G4 -> B4 -> E5）
    [329.63, 392.0, 493.88, 659.25].forEach((f, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + idx * 0.075;
      o.frequency.setValueAtTime(f, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.35, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.7);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.8);
    });

    // 3. 角鬥場青銅鐘鳴
    [[164.81, 0.32], [329.63, 0.22], [659.25, 0.12]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, now + 0.2);
      g.gain.setValueAtTime(0.001, now + 0.2);
      g.gain.linearRampToValueAtTime(vol, now + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
      o.connect(g);
      g.connect(out);
      o.start(now + 0.2);
      o.stop(now + 3.6);
    });
  }

  // ==================== 別西卜 阿斯拉 撒旦 專屬音效合成：群蠅狂鳴與暴虐血戮 ====================
  function playBeelzebubChargeSfx(ctx, out, now, dur) {
    // 1. 群蠅之王萬千蒼蠅高頻震翅嗡鳴（4 聲道非和諧失諧鋸齒波 + 55~85Hz AM 翅膀振頻）
    const flyFreqs = [135, 162, 198, 235];
    flyFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const amOsc = ctx.createOscillator();
      const amGain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.15, now + dur * 0.5);
      osc.frequency.linearRampToValueAtTime(freq * 0.95, now + dur);

      amOsc.type = "sine";
      amOsc.frequency.setValueAtTime(58 + idx * 9, now);
      amOsc.frequency.linearRampToValueAtTime(75 + idx * 9, now + dur);

      amGain.gain.setValueAtTime(0.55, now);
      amOsc.connect(amGain.gain);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.22, now + 0.6);
      g.gain.linearRampToValueAtTime(0.32, now + dur * 0.85);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(g);
      g.connect(out);

      osc.start(now);
      amOsc.start(now);
      osc.stop(now + dur);
      amOsc.stop(now + dur);
    });

    // 2. 原初屠掠魔神暴虐深淵低鳴（38Hz 極低頻殘暴鋸齒波震顫）
    const drone = ctx.createOscillator();
    const dg = ctx.createGain();
    drone.type = "sawtooth";
    drone.frequency.setValueAtTime(42, now);
    drone.frequency.linearRampToValueAtTime(36, now + dur);
    dg.gain.setValueAtTime(0.001, now);
    dg.gain.linearRampToValueAtTime(0.48, now + 0.4);
    dg.gain.linearRampToValueAtTime(0.58, now + dur * 0.8);
    dg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    drone.connect(dg);
    dg.connect(out);
    drone.start(now);
    drone.stop(now + dur);

    // 3. 猩紅撕裂血腥氣流噪音脈衝
    const bufSize = Math.floor(ctx.sampleRate * Math.min(dur, 4.5));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 1.8));
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(3.8, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.linearRampToValueAtTime(0.18, now + 0.5);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    nSrc.connect(filter);
    filter.connect(ng);
    ng.connect(out);
    nSrc.start(now);
  }

  function playBeelzebubImpactSfx(ctx, out, now, stepIdx) {
    // 1. 暴力骨肉碎裂血戮重擊（130Hz -> 18Hz 殘暴下潛重擊）
    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = "sawtooth";
    sub.frequency.setValueAtTime(140 + stepIdx * 20, now);
    sub.frequency.exponentialRampToValueAtTime(18, now + 0.65);
    sg.gain.setValueAtTime(0.85, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sub.connect(sg);
    sg.connect(out);
    sub.start(now);
    sub.stop(now + 0.72);

    // 2. 「惡魔的屠掠」巨劍暴力割裂金屬撕扯聲
    const rip = ctx.createOscillator();
    const rg = ctx.createGain();
    rip.type = "triangle";
    rip.frequency.setValueAtTime(1200 + stepIdx * 250, now);
    rip.frequency.exponentialRampToValueAtTime(180, now + 0.38);
    rg.gain.setValueAtTime(0.48, now);
    rg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    rip.connect(rg);
    rg.connect(out);
    rip.start(now);
    rip.stop(now + 0.42);

    // 3. 蒼蠅群驚飛狂暴嗡聲爆衝
    const flyBurst = ctx.createOscillator();
    const fbg = ctx.createGain();
    flyBurst.type = "sawtooth";
    flyBurst.frequency.setValueAtTime(260 + (stepIdx % 3) * 60, now);
    flyBurst.frequency.linearRampToValueAtTime(340, now + 0.25);
    fbg.gain.setValueAtTime(0.35, now);
    fbg.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    flyBurst.connect(fbg);
    fbg.connect(out);
    flyBurst.start(now);
    flyBurst.stop(now + 0.38);
  }

  function playBeelzebubClimaxSfx(ctx, out, now, dur) {
    // 1. 萬千蒼蠅暴風圈黑血龍捲
    [155, 185, 220, 280, 340].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const am = ctx.createOscillator();
      const amG = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.3, now + dur * 0.85);

      am.type = "sine";
      am.frequency.setValueAtTime(70 + idx * 12, now);
      amG.gain.setValueAtTime(0.7, now);
      am.connect(amG.gain);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.28, now + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(g);
      g.connect(out);

      osc.start(now);
      am.start(now);
      osc.stop(now + dur);
      am.stop(now + dur);
    });

    // 2. 暴虐原初屠掠魔神毀滅不協和弦群（極度暴力、血腥壓迫）
    [55.0, 77.78, 92.5, 110.0, 155.56, 185.0].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = idx % 2 === 0 ? "sawtooth" : "square";
      const startT = now + idx * 0.05;
      o.frequency.setValueAtTime(freq, startT);
      g.gain.setValueAtTime(0.001, startT);
      g.gain.linearRampToValueAtTime(0.32, startT + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, startT + dur * 0.9);
      o.connect(g);
      g.connect(out);
      o.start(startT);
      o.stop(startT + dur * 0.92);
    });
  }

  function playBeelzebubRevealSfx(ctx, out, now) {
    // 1. 暴虐魔神之刃終焉立地重響
    const boom = ctx.createOscillator();
    const bg = ctx.createGain();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(210, now);
    boom.frequency.exponentialRampToValueAtTime(20, now + 1.4);
    bg.gain.setValueAtTime(0.85, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
    boom.connect(bg);
    bg.connect(out);
    boom.start(now);
    boom.stop(now + 1.5);

    // 2. 蒼蠅群四散狂舞長鳴
    [260, 330, 415, 520].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + idx * 0.06;
      o.frequency.setValueAtTime(freq, st);
      o.frequency.exponentialRampToValueAtTime(freq * 1.8, st + 2.4);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.3, st + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.6);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.7);
    });
  }

  // ==================== 降臨級 尤諾拉 倪克斯 專屬音效合成：月夜空靈與星辰交響 ====================
  function playNyxChargeSfx(ctx, out, now, dur) {
    // 1. 星辰琶音水滴風鈴群（Lydian 璀璨星鈴：D5, F#5, A5, C#6, E6, A6）
    const starNotes = [587.33, 739.99, 880.0, 1108.73, 1318.51, 1760.0];
    const chimeCount = Math.floor(dur / 0.32);
    for (let i = 0; i < chimeCount; i++) {
      const st = now + i * 0.32 + Math.random() * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      const f = starNotes[i % starNotes.length] * (Math.random() < 0.3 ? 2 : 1);
      osc.frequency.setValueAtTime(f, st);
      osc.frequency.exponentialRampToValueAtTime(f * 1.02, st + 0.38);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.22, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.42);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + 0.45);
    }

    // 2. 黑夜女神深邃月華以太長音（110Hz / 164.81Hz 柔和深邃正弦長音）
    [110.0, 164.81, 220.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + dur);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.8);
      g.gain.linearRampToValueAtTime(0.3, now + dur * 0.85);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(g);
      g.connect(out);
      osc.start(now);
      osc.stop(now + dur);
    });

    // 3. 銀河星塵微風光暈（高通濾波星粉流動）
    const bufSize = Math.floor(ctx.sampleRate * Math.min(dur, 4.5));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.linearRampToValueAtTime(3600, now + dur);
    filter.Q.setValueAtTime(6.0, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.linearRampToValueAtTime(0.12, now + 0.6);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    nSrc.connect(filter);
    filter.connect(ng);
    ng.connect(out);
    nSrc.start(now);
  }

  function playNyxImpactSfx(ctx, out, now, stepIdx) {
    // 1. -星輝浮光－月之劍- 靈空斬擊與星辰光屑音
    const rip = ctx.createOscillator();
    const rg = ctx.createGain();
    rip.type = "triangle";
    rip.frequency.setValueAtTime(1400 + stepIdx * 220, now);
    rip.frequency.exponentialRampToValueAtTime(320, now + 0.35);
    rg.gain.setValueAtTime(0.42, now);
    rg.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    rip.connect(rg);
    rg.connect(out);
    rip.start(now);
    rip.stop(now + 0.4);

    // 2. 皎潔月宮水晶編鐘雙和弦
    const moonChords = [
      [880.0, 1318.51],
      [1046.5, 1567.98],
      [1174.66, 1760.0],
      [1318.51, 1975.53]
    ];
    const pair = moonChords[stepIdx % moonChords.length];
    pair.forEach((f, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      const t = now + idx * 0.035;
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.98, t + 0.65);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g);
      g.connect(out);
      o.start(t);
      o.stop(t + 0.72);
    });

    // 3. 夜之低沉空靈重響（深邃幽夜震撼）
    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(95 + stepIdx * 10, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.55);
    sg.gain.setValueAtTime(0.65, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    sub.connect(sg);
    sg.connect(out);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  function playNyxClimaxSfx(ctx, out, now, dur) {
    // 1. 滿月生輝聖潔星詠和弦（Dmaj9 夢幻空靈天籟）
    [293.66, 369.99, 440.0, 554.37, 659.25, 880.0, 1108.73].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      const st = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.linearRampToValueAtTime(freq * 1.01, st + dur * 0.8);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.28, st + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur * 0.95);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + dur);
    });

    // 2. 銀河群星閃爍百鳥朝鳳般璀璨瀑布
    const sparkleCount = 20;
    const interval = (dur * 0.85) / sparkleCount;
    for (let i = 0; i < sparkleCount; i++) {
      const st = now + i * interval;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      const f = 1174.66 + ((i * 137) % 1800);
      osc.frequency.setValueAtTime(f, st);
      osc.frequency.exponentialRampToValueAtTime(f * 1.25, st + 0.22);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.2, st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + 0.26);
    }
  }

  function playNyxRevealSfx(ctx, out, now) {
    // 1. 滿月月華如瀑深幽長鐘（月之王宣告）
    [[110.0, 0.45], [220.0, 0.38], [440.0, 0.3], [880.0, 0.25], [1760.0, 0.15]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 3.8);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      o.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 3.9);
    });

    // 2. 星華飄墜水晶琶音
    [880.0, 1108.73, 1318.51, 1661.22, 1760.0, 2217.46].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + 0.1 + idx * 0.08;
      o.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.24, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.2);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.3);
    });
  }

  // ==================== 降臨級 迪米諾拉 赫墨拉 專屬音效合成：烈陽風暴與終焉日冕 ====================
  function playHemeraChargeSfx(ctx, out, now, dur) {
    // 1. 烈陽電漿太陽風暴呼嘯（高頻帶通濾波高溫耀斑氣流）
    const bufSize = Math.floor(ctx.sampleRate * Math.min(dur, 4.5));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.28;
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + dur);
    filter.Q.setValueAtTime(5.5, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.linearRampToValueAtTime(0.24, now + 0.6);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    nSrc.connect(filter);
    filter.connect(ng);
    ng.connect(out);
    nSrc.start(now);

    // 2. 日耀女神聖潔金陽銅管和弦群（Gmaj9 燦爛烈陽：G4, B4, D5, F#5, A5, D6）
    const sunNotes = [392.0, 493.88, 587.33, 739.99, 880.0, 1174.66];
    const chimeCount = Math.floor(dur / 0.36);
    for (let i = 0; i < chimeCount; i++) {
      const st = now + i * 0.36 + Math.random() * 0.05;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      const f = sunNotes[i % sunNotes.length];
      osc.frequency.setValueAtTime(f, st);
      osc.frequency.exponentialRampToValueAtTime(f * 1.05, st + 0.4);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.18, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.44);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + 0.46);
    }

    // 3. 太陽核聚變灼熱低頻脈動（52Hz 熾熱深核脈衝）
    const drone = ctx.createOscillator();
    const dg = ctx.createGain();
    drone.type = "triangle";
    drone.frequency.setValueAtTime(52, now);
    drone.frequency.linearRampToValueAtTime(58, now + dur);
    dg.gain.setValueAtTime(0.001, now);
    dg.gain.linearRampToValueAtTime(0.35, now + 0.6);
    dg.gain.linearRampToValueAtTime(0.42, now + dur * 0.85);
    dg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    drone.connect(dg);
    dg.connect(out);
    drone.start(now);
    drone.stop(now + dur);
  }

  function playHemeraImpactSfx(ctx, out, now, stepIdx) {
    // 1. -天輝浮光－日之矛- 金陽貫穿烈焰重擊
    const spear = ctx.createOscillator();
    const spg = ctx.createGain();
    spear.type = "sawtooth";
    spear.frequency.setValueAtTime(1750 + stepIdx * 250, now);
    spear.frequency.exponentialRampToValueAtTime(260, now + 0.38);
    spg.gain.setValueAtTime(0.48, now);
    spg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    spear.connect(spg);
    spg.connect(out);
    spear.start(now);
    spear.stop(now + 0.42);

    // 2. 烈陽耀斑熱浪超重低音重響（110Hz -> 20Hz 灼耀爆破）
    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(115 + stepIdx * 15, now);
    sub.frequency.exponentialRampToValueAtTime(20, now + 0.55);
    sg.gain.setValueAtTime(0.72, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    sub.connect(sg);
    sg.connect(out);
    sub.start(now);
    sub.stop(now + 0.6);

    // 3. 耀斑晶燦金光共鳴鐘
    const ch = ctx.createOscillator();
    const cg = ctx.createGain();
    ch.type = "triangle";
    ch.frequency.setValueAtTime(987.77 + stepIdx * 120, now);
    ch.frequency.exponentialRampToValueAtTime(783.99, now + 0.5);
    cg.gain.setValueAtTime(0.32, now);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    ch.connect(cg);
    cg.connect(out);
    ch.start(now);
    ch.stop(now + 0.58);
  }

  function playHemeraClimaxSfx(ctx, out, now, dur) {
    // 1. 「終焉日冕」灼耀之日超新星引爆！輝煌太陽交響銅管高潮
    [196.0, 246.94, 293.66, 392.0, 493.88, 587.33, 783.99, 987.77].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      const st = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.linearRampToValueAtTime(freq * 1.03, st + dur * 0.85);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.26, st + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur * 0.95);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + dur);
    });

    // 2. 日冕耀斑連續熱核能量浪湧
    const pulseCount = 7;
    const interval = (dur * 0.82) / pulseCount;
    for (let p = 0; p < pulseCount; p++) {
      const st = now + p * interval;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(800 + p * 150, st);
      o.frequency.exponentialRampToValueAtTime(140, st + 0.28);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.3, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 0.32);
    }
  }

  function playHemeraRevealSfx(ctx, out, now) {
    // 1. 太陽之主天耀長鐘（G大調金光萬道神聖和音，餘音繚繞 4 秒）
    [[98.0, 0.45], [196.0, 0.4], [293.66, 0.32], [493.88, 0.28], [783.99, 0.22], [1174.66, 0.14]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 3.8);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      o.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 3.9);
    });

    // 2. 萬道金芒日耀光屑晶燦琶音
    [587.33, 739.99, 880.0, 987.77, 1174.66, 1479.98, 1760.0].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      const st = now + 0.08 + idx * 0.075;
      o.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.24, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.3);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.4);
    });
  }

  // ==================== 降臨級 萊夫維芙 專屬音效合成：生意盎然・原初生命交響 ====================
  function playLifeweaverChargeSfx(ctx, out, now, dur) {
    // 1. 神聖林間微風與萬物生長沙沙聲（柔和帶通濾波森林風吟）
    const bufSize = Math.floor(ctx.sampleRate * Math.min(dur, 4.5));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + dur);
    filter.Q.setValueAtTime(4.0, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.linearRampToValueAtTime(0.2, now + 0.6);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    nSrc.connect(filter);
    filter.connect(ng);
    ng.connect(out);
    nSrc.start(now);

    // 2. 翡翠露珠甘霖晶鈴風鈴群（E大調五聲音階：E4, G#4, A4, B4, E5, G#5, B5, E6）
    const lifeNotes = [329.63, 415.3, 440.0, 493.88, 659.25, 830.61, 987.77, 1318.51];
    const chimeCount = Math.floor(dur / 0.28);
    for (let i = 0; i < chimeCount; i++) {
      const st = now + i * 0.28 + Math.random() * 0.06;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      const f = lifeNotes[i % lifeNotes.length] * (Math.random() < 0.25 ? 2 : 1);
      osc.frequency.setValueAtTime(f, st);
      osc.frequency.exponentialRampToValueAtTime(f * 1.02, st + 0.5);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.19, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.5);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + 0.52);
    }

    // 3. 原初生命之種萌芽大地長鳴（65Hz 豐饒大地之根溫潤共振）
    const drone = ctx.createOscillator();
    const dg = ctx.createGain();
    drone.type = "triangle";
    drone.frequency.setValueAtTime(65.41, now);
    drone.frequency.linearRampToValueAtTime(82.41, now + dur);
    dg.gain.setValueAtTime(0.001, now);
    dg.gain.linearRampToValueAtTime(0.28, now + 0.6);
    dg.gain.linearRampToValueAtTime(0.35, now + dur * 0.85);
    dg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    drone.connect(dg);
    dg.connect(out);
    drone.start(now);
    drone.stop(now + dur + 0.1);
  }

  function playLifeweaverImpactSfx(ctx, out, now, stepIdx) {
    // 1. 神聖生命萌芽甘霖重擊（水晶靈音與甘霖散落）
    const fBase = 659.25;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(fBase * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(fBase, now + 0.35);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.32, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(g);
    g.connect(out);
    osc.start(now);
    osc.stop(now + 0.7);

    // 2. 蔓生藤蔓舒展琶音
    [659.25, 830.61, 987.77, 1318.51].forEach((f, idx) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "sine";
      const st = now + 0.04 + idx * 0.045;
      o.frequency.setValueAtTime(f, st);
      og.gain.setValueAtTime(0.001, st);
      og.gain.linearRampToValueAtTime(0.2, st + 0.02);
      og.gain.exponentialRampToValueAtTime(0.001, st + 0.45);
      o.connect(og);
      og.connect(out);
      o.start(st);
      o.stop(st + 0.48);
    });

    // 3. 綠野生機低頻沉響
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(98, now);
    sub.frequency.exponentialRampToValueAtTime(45, now + 0.42);
    subG.gain.setValueAtTime(0.001, now);
    subG.gain.linearRampToValueAtTime(0.38, now + 0.015);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    sub.connect(subG);
    subG.connect(out);
    sub.start(now);
    sub.stop(now + 0.55);
  }

  function playLifeweaverClimaxSfx(ctx, out, now, dur) {
    // 1. 「生命創造・生者亦能永恆」萬物盛綻天籟和弦（Emaj9: E3, B3, E4, G#4, B4, D#5, E5, G#5, B5）
    const chord = [164.81, 246.94, 329.63, 415.3, 493.88, 622.25, 659.25, 830.61, 987.77, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      const st = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.22, st + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      osc.connect(g);
      g.connect(out);
      osc.start(st);
      osc.stop(st + dur);
    });

    // 2. 萬象初生・甘霖花雨連續天籟水鈴浪湧
    const pulseCount = 8;
    const interval = (dur * 0.85) / pulseCount;
    for (let p = 0; p < pulseCount; p++) {
      const st = now + p * interval;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(520 + p * 110, st);
      o.frequency.exponentialRampToValueAtTime(1040 + p * 80, st + 0.32);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.24, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 0.38);
    }
  }

  function playLifeweaverRevealSfx(ctx, out, now) {
    // 1. 原初生命女神神聖甘露長鐘（E大調翡翠長鳴，餘音繚繞 4 秒）
    [[82.41, 0.42], [164.81, 0.38], [246.94, 0.32], [415.3, 0.28], [659.25, 0.22], [987.77, 0.16]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 3.8);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      o.connect(g);
      g.connect(out);
      o.start(now);
      o.stop(now + 3.9);
    });

    // 2. 盛綻落花晶瑩微光琶音
    [659.25, 830.61, 987.77, 1174.66, 1318.51, 1661.22, 1975.53].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + 0.08 + idx * 0.07;
      o.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.22, st + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 2.3);
      o.connect(g);
      g.connect(out);
      o.start(st);
      o.stop(st + 2.4);
    });
  }

  // ==================== 降臨級 拉格提斯 專屬音效合成：沉穩深邃巨龍低吼與電影級弒神重擊 (ragtis-dragonslayer) ====================
  // 全面消除尖銳刺耳白雜訊與高頻失真，採用電影預告級溫暖重低音（Low-pass < 360Hz）、胸腔調頻轟鳴與厚重打擊
  function playRagtisDragonRoar(ctx, out, now, dur, volume = 0.24) {
    // 1. 溫暖厚重的龍族胸腔共振喉音（Triangle + Sine 調頻，無刺耳高頻）
    const throat = ctx.createOscillator();
    const tMod = ctx.createOscillator();
    const tModGain = ctx.createGain();
    const tGain = ctx.createGain();
    const tFilter = ctx.createBiquadFilter();

    throat.type = "triangle";
    throat.frequency.setValueAtTime(80, now);
    throat.frequency.exponentialRampToValueAtTime(36, now + dur);

    tMod.type = "sine";
    tMod.frequency.setValueAtTime(16, now);
    tModGain.gain.setValueAtTime(22, now);
    tMod.connect(tModGain);
    tModGain.connect(throat.frequency);

    tFilter.type = "lowpass";
    tFilter.frequency.setValueAtTime(220, now);
    tFilter.frequency.linearRampToValueAtTime(130, now + dur);

    tGain.gain.setValueAtTime(0.001, now);
    tGain.gain.linearRampToValueAtTime(volume * 0.72, now + 0.15);
    tGain.gain.linearRampToValueAtTime(volume * 0.52, now + dur * 0.6);
    tGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    throat.connect(tFilter);
    tFilter.connect(tGain);
    tGain.connect(out);

    throat.start(now);
    tMod.start(now);
    throat.stop(now + dur);
    tMod.stop(now + dur);

    // 2. 洞穴級深邃氣流轟鳴（嚴格低通濾波 < 260Hz，徹底消除所有高頻沙沙雜訊）
    const bufSize = Math.floor(ctx.sampleRate * Math.min(dur, 2.5));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = noiseBuf;

    const lpNoise = ctx.createBiquadFilter();
    lpNoise.type = "lowpass";
    lpNoise.frequency.setValueAtTime(240, now);
    lpNoise.frequency.exponentialRampToValueAtTime(110, now + dur);

    const roarG = ctx.createGain();
    roarG.gain.setValueAtTime(0.001, now);
    roarG.gain.linearRampToValueAtTime(volume * 0.55, now + 0.18);
    roarG.gain.linearRampToValueAtTime(volume * 0.4, now + dur * 0.55);
    roarG.gain.exponentialRampToValueAtTime(0.001, now + dur);

    nSrc.connect(lpNoise);
    lpNoise.connect(roarG);
    roarG.connect(out);

    nSrc.start(now);
  }

  function playRagtisChargeSfx(ctx, out, now, dur) {
    // 1. 低沉雄渾的遠方龍吟（音量舒適柔和，去除高頻雜音）
    playRagtisDragonRoar(ctx, out, now + 0.2, Math.min(2.0, dur * 0.65), 0.2);

    // 2. 沉穩深邃的低音雷鳴 (Cinematic Thunder Rumble - 嚴格低通 140Hz)
    const rumble = ctx.createOscillator();
    const rFilter = ctx.createBiquadFilter();
    const rg = ctx.createGain();

    rumble.type = "sine";
    rumble.frequency.setValueAtTime(48, now);
    rumble.frequency.linearRampToValueAtTime(32, now + dur);

    rFilter.type = "lowpass";
    rFilter.frequency.setValueAtTime(140, now);

    rg.gain.setValueAtTime(0.001, now);
    rg.gain.linearRampToValueAtTime(0.18, now + 0.6);
    rg.gain.exponentialRampToValueAtTime(0.001, now + dur);

    rumble.connect(rFilter);
    rFilter.connect(rg);
    rg.connect(out);
    rumble.start(now);
    rumble.stop(now + dur + 0.1);
  }

  function playRagtisImpactSfx(ctx, out, now, stepIdx) {
    // 電影預告級重低音打擊（Trailer Drum / Sub-bass Impact，無刺耳金屬摩擦與高頻雜訊）
    const sub = ctx.createOscillator();
    const sf = ctx.createBiquadFilter();
    const sg = ctx.createGain();

    sub.type = "sine";
    sub.frequency.setValueAtTime(75, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.38);

    sf.type = "lowpass";
    sf.frequency.setValueAtTime(170, now);

    sg.gain.setValueAtTime(0.001, now);
    sg.gain.linearRampToValueAtTime(0.32, now + 0.015);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    sub.connect(sf);
    sf.connect(sg);
    sg.connect(out);
    sub.start(now);
    sub.stop(now + 0.5);

    // 圓潤悠揚的重劍低頻共鳴 (Warm Low-Gong Ring: 196Hz G3, 293.66Hz D4，低通 350Hz)
    const ringFilter = ctx.createBiquadFilter();
    ringFilter.type = "lowpass";
    ringFilter.frequency.setValueAtTime(350, now);
    ringFilter.connect(out);

    [196.0, 293.66].forEach((f, idx) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, now);
      og.gain.setValueAtTime(0.001, now);
      og.gain.linearRampToValueAtTime(0.1 - idx * 0.03, now + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      o.connect(og);
      og.connect(ringFilter);
      o.start(now);
      o.stop(now + 0.45);
    });
  }

  function playRagtisClimaxSfx(ctx, out, now, dur) {
    // 1. 震撼而圓潤的巨龍長嘯（去除一切高頻刺耳雜訊）
    playRagtisDragonRoar(ctx, out, now + 0.1, Math.min(2.5, dur * 0.9), 0.3);

    // 2. 電影級泰坦重低音下潛 (Trailer Braam Sub Drop，低通 200Hz)
    const subDrop = ctx.createOscillator();
    const subF = ctx.createBiquadFilter();
    const subG = ctx.createGain();

    subDrop.type = "triangle";
    subDrop.frequency.setValueAtTime(70, now);
    subDrop.frequency.exponentialRampToValueAtTime(24, now + 1.2);

    subF.type = "lowpass";
    subF.frequency.setValueAtTime(200, now);
    subF.frequency.linearRampToValueAtTime(80, now + 1.2);

    subG.gain.setValueAtTime(0.001, now);
    subG.gain.linearRampToValueAtTime(0.35, now + 0.03);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    subDrop.connect(subF);
    subF.connect(subG);
    subG.connect(out);
    subDrop.start(now);
    subDrop.stop(now + 1.35);

    // 3. 沉穩莊嚴的弒神銅管和弦 (D小調溫暖和聲：D2 73.4Hz, A2 110Hz, D3 146.8Hz, F3 174.6Hz, A3 220Hz - 嚴格低通 320Hz)
    const chordFreqs = [73.42, 110.0, 146.83, 174.61, 220.0];
    const chordF = ctx.createBiquadFilter();
    chordF.type = "lowpass";
    chordF.frequency.setValueAtTime(320, now);
    chordF.connect(out);

    chordFreqs.forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      const st = now + idx * 0.035;
      o.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(0.1, st + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur * 0.9);
      o.connect(g);
      g.connect(chordF);
      o.start(st);
      o.stop(st + dur);
    });
  }

  function playRagtisRevealSfx(ctx, out, now) {
    // 沉穩悠揚的凱歌鐘聲（低音溫暖三角波，低通 550Hz，消除刺耳鋸齒）
    const bellFilter = ctx.createBiquadFilter();
    bellFilter.type = "lowpass";
    bellFilter.frequency.setValueAtTime(550, now);
    bellFilter.connect(out);

    [[73.42, 0.25], [146.83, 0.2], [220.0, 0.16], [293.66, 0.12], [440.0, 0.07]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 3.0);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      o.connect(g);
      g.connect(bellFilter);
      o.start(now);
      o.stop(now + 3.1);
    });
  }

  function playSummonChargeSfx(tierLevel, durationSec, specialVariant = null) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const sig = TIER_AUDIO_SIGNATURES[tierLevel] || TIER_AUDIO_SIGNATURES[1];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.15, now);
      master.connect(getSummonAudioBus(ctx));

      if (specialVariant === "hecate-death") {
        master.gain.setValueAtTime(0.34, now);
        playHecateChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "skadi-darkness") {
        master.gain.setValueAtTime(0.35, now);
        playSkadiChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "ignalion-holyfire") {
        master.gain.setValueAtTime(0.35, now);
        playIgnalionChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "warrior-arena") {
        master.gain.setValueAtTime(0.36, now);
        playWarriorChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "beelzebub-swarm") {
        master.gain.setValueAtTime(0.38, now);
        playBeelzebubChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "nyx-moon-stars") {
        master.gain.setValueAtTime(0.36, now);
        playNyxChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "hemera-sun") {
        master.gain.setValueAtTime(0.38, now);
        playHemeraChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "lifeweaver-verdant") {
        master.gain.setValueAtTime(0.36, now);
        playLifeweaverChargeSfx(ctx, master, now, durationSec);
        return;
      }

      if (specialVariant === "ragtis-dragonslayer") {
        master.gain.setValueAtTime(0.38, now);
        playRagtisChargeSfx(ctx, master, now, durationSec);
        return;
      }

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

      if (tierLevel === 8 || specialVariant === "phenom-seth-evil") {
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
      master.connect(getSummonAudioBus(ctx));

      if (specialVariant === "hecate-death") {
        playHecateImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "skadi-darkness") {
        playSkadiImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "ignalion-holyfire") {
        playIgnalionImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "warrior-arena") {
        playWarriorImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "beelzebub-swarm") {
        playBeelzebubImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "nyx-moon-stars") {
        playNyxImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "hemera-sun") {
        playHemeraImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "lifeweaver-verdant") {
        playLifeweaverImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      if (specialVariant === "ragtis-dragonslayer") {
        playRagtisImpactSfx(ctx, master, now, stepIdx);
        return;
      }

      // Heavy Sub-Bass Impact Thud on every big text slam
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = tierLevel >= 7 || specialVariant === "apocalypse-dragon" ? "sawtooth" : "sine";
      const impactStartFreq =
        specialVariant === "phenom-the-abyss"
          ? 72
          : tierLevel === 8 || specialVariant === "phenom-seth-evil"
          ? 92
          : tierLevel === 7 || specialVariant === "apocalypse-dragon"
          ? 110
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

      if (tierLevel === 8 || specialVariant === "phenom-seth-evil") {
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
      master.connect(getSummonAudioBus(ctx));

      if (specialVariant === "hecate-death") {
        playHecateClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "skadi-darkness") {
        playSkadiClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "ignalion-holyfire") {
        playIgnalionClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "warrior-arena") {
        playWarriorClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "beelzebub-swarm") {
        playBeelzebubClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "nyx-moon-stars") {
        playNyxClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "hemera-sun") {
        playHemeraClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "lifeweaver-verdant") {
        playLifeweaverClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

      if (specialVariant === "ragtis-dragonslayer") {
        playRagtisClimaxSfx(ctx, master, now, finaleSec);
        return;
      }

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

      if (tierLevel === 8 || specialVariant === "phenom-seth-evil") {
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
      master.connect(getSummonAudioBus(ctx));

      if (specialVariant === "hecate-death") {
        playHecateRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "skadi-darkness") {
        playSkadiRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "ignalion-holyfire") {
        playIgnalionRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "warrior-arena") {
        playWarriorRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "beelzebub-swarm") {
        playBeelzebubRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "nyx-moon-stars") {
        playNyxRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "hemera-sun") {
        playHemeraRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "lifeweaver-verdant") {
        playLifeweaverRevealSfx(ctx, master, now);
        return;
      }

      if (specialVariant === "ragtis-dragonslayer") {
        playRagtisRevealSfx(ctx, master, now);
        return;
      }

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

      if (tierLevel === 8 || specialVariant === "phenom-seth-evil") {
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

  // ==================== 黑卡蒂 專屬畫面：死亡・橘黑冥焰・命運絲線 ====================
  let hecateSprites = null;

  function makeHecateFlameSprite(isBlack) {
    const s = document.createElement("canvas");
    s.width = 64;
    s.height = 64;
    const g = s.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (isBlack) {
      // 黑焰：漆黑焰心 + 橘色焰緣
      grad.addColorStop(0, "rgba(0, 0, 0, 1)");
      grad.addColorStop(0.42, "rgba(10, 3, 0, 0.96)");
      grad.addColorStop(0.68, "rgba(194, 65, 12, 0.6)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      // 橘焰：淡金白焰心 → 橘 → 暗紅
      grad.addColorStop(0, "rgba(255, 237, 190, 1)");
      grad.addColorStop(0.28, "rgba(251, 146, 60, 0.92)");
      grad.addColorStop(0.62, "rgba(194, 65, 12, 0.45)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  }

  function spawnHecateFlame(w, h, scatter) {
    return {
      x: Math.random() * w,
      y: scatter ? h * (0.35 + Math.random() * 0.75) : h + 20 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.8 + Math.random() * 1.8,
      size: 18 + Math.random() * 34,
      life: scatter ? 0.3 + Math.random() * 0.7 : 1,
      decay: 0.004 + Math.random() * 0.006,
      black: Math.random() < 0.45,
      phase: Math.random() * Math.PI * 2
    };
  }

  function createHecateFxState(w, h) {
    if (!hecateSprites) {
      hecateSprites = { orange: makeHecateFlameSprite(false), black: makeHecateFlameSprite(true) };
    }
    const threads = [];
    const threadCount = 28;
    for (let i = 0; i < threadCount; i++) {
      threads.push({
        angle: (i / threadCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        freq: 0.0015 + Math.random() * 0.002,
        sag: 20 + Math.random() * 40,
        width: 0.6 + Math.random() * 1.0
      });
    }
    const puppets = [];
    for (let i = 0; i < 5; i++) {
      puppets.push({
        xr: 0.12 + i * 0.19,
        len: 0.2 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        swing: 0.12 + Math.random() * 0.08,
        size: 18 + Math.random() * 8,
        jawDrop: 0.25 + Math.random() * 0.35
      });
    }
    const flames = [];
    for (let i = 0; i < 90; i++) flames.push(spawnHecateFlame(w, h, true));
    const souls = [];
    for (let i = 0; i < 16; i++) {
      souls.push({
        x: Math.random() * w,
        y: h * 0.3 + Math.random() * h * 0.7,
        vy: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        size: 22 + Math.random() * 18,
        tailLength: 38 + Math.random() * 32,
        mouthOpen: 0.35 + Math.random() * 0.5,
        alpha: 0.45 + Math.random() * 0.35
      });
    }
    return { threads, puppets, flames, souls, twang: 0 };
  }

  // 寫實恐怖死神骷髏頭：解剖學顱骨結構、頭骨骨縫裂紋、深陷空洞眼窩、齶骨與尖銳殘缺獠牙、開合下顎
  function drawRealisticTerrifyingSkull(c, x, y, s, alpha, eyeGlow = 1, jawDrop = 0.25, isGiant = false) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(x, y);
    c.globalAlpha = alpha;

    // 1. 巨大死靈暗影氣場 (Giant Aura)
    if (isGiant) {
      const aura = c.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 1.6);
      aura.addColorStop(0, "rgba(234, 88, 12, 0.45)");
      aura.addColorStop(0.5, "rgba(28, 10, 4, 0.7)");
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      c.fillStyle = aura;
      c.fillRect(-s * 1.7, -s * 1.7, s * 3.4, s * 3.4);
    }

    // 2. 顱骨輪廓 (Neurocranium & Zygomatic Arches)
    c.fillStyle = isGiant ? "#d6d3d1" : "#e7e5e4";
    c.beginPath();
    c.moveTo(-s * 0.72, -s * 0.2);
    c.bezierCurveTo(-s * 0.78, -s * 0.95, s * 0.78, -s * 0.95, s * 0.72, -s * 0.2);
    c.bezierCurveTo(s * 0.88, s * 0.05, s * 0.85, s * 0.35, s * 0.58, s * 0.48);
    c.bezierCurveTo(s * 0.48, s * 0.65, s * 0.35, s * 0.75, 0, s * 0.75);
    c.bezierCurveTo(-s * 0.35, s * 0.75, -s * 0.48, s * 0.65, -s * 0.58, s * 0.48);
    c.bezierCurveTo(-s * 0.85, s * 0.35, -s * 0.88, s * 0.05, -s * 0.72, -s * 0.2);
    c.closePath();
    c.shadowColor = isGiant ? "#ea580c" : "rgba(0,0,0,0.85)";
    c.shadowBlur = isGiant ? 35 : 12;
    c.fill();
    c.shadowBlur = 0;

    // 3. 顱骨骨質老化漸層與陰影 (Bone Shading & Decay)
    const boneShade = c.createRadialGradient(0, -s * 0.2, s * 0.1, 0, s * 0.2, s * 0.85);
    boneShade.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    boneShade.addColorStop(0.55, "rgba(168, 162, 158, 0.2)");
    boneShade.addColorStop(0.85, "rgba(68, 64, 60, 0.75)");
    boneShade.addColorStop(1, "rgba(28, 25, 23, 0.95)");
    c.fillStyle = boneShade;
    c.fill();

    // 4. 頭骨骨縫裂痕 (Cranial Sutures & Fractures)
    c.strokeStyle = "rgba(41, 37, 36, 0.75)";
    c.lineWidth = Math.max(1, s * 0.025);
    c.beginPath();
    c.moveTo(0, -s * 0.88);
    c.lineTo(-s * 0.06, -s * 0.72);
    c.lineTo(s * 0.05, -s * 0.58);
    c.lineTo(-s * 0.04, -s * 0.44);
    c.lineTo(s * 0.02, -s * 0.3);
    c.stroke();
    c.beginPath();
    c.moveTo(-s * 0.32, -s * 0.65);
    c.lineTo(-s * 0.48, -s * 0.48);
    c.lineTo(-s * 0.42, -s * 0.35);
    c.stroke();

    // 5. 顳骨下凹暗影 (Temporal Cavities)
    c.fillStyle = "rgba(28, 25, 23, 0.85)";
    c.beginPath();
    c.ellipse(-s * 0.62, s * 0.25, s * 0.12, s * 0.22, 0.2, 0, Math.PI * 2);
    c.ellipse(s * 0.62, s * 0.25, s * 0.12, s * 0.22, -0.2, 0, Math.PI * 2);
    c.fill();

    // 6. 深陷恐懼眼窩 (Cavernous Sunken Eye Sockets)
    [-1, 1].forEach((dir) => {
      c.save();
      c.translate(dir * s * 0.28, -s * 0.06);
      c.rotate(dir * 0.12);
      c.fillStyle = "#0c0a09";
      c.beginPath();
      c.moveTo(-s * 0.2, -s * 0.15);
      c.bezierCurveTo(0, -s * 0.24, s * 0.2, -s * 0.18, s * 0.22, 0.05);
      c.bezierCurveTo(s * 0.2, s * 0.26, -s * 0.05, s * 0.28, -s * 0.18, s * 0.18);
      c.closePath();
      c.fill();

      if (eyeGlow > 0.01) {
        c.fillStyle = "#f97316";
        c.shadowColor = "#ea580c";
        c.shadowBlur = 18 * eyeGlow;
        c.beginPath();
        c.arc(dir * -s * 0.02, s * 0.02, s * 0.065 * eyeGlow, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(dir * -s * 0.02, s * 0.02, s * 0.028 * eyeGlow, 0, Math.PI * 2);
        c.fill();
        c.shadowBlur = 0;
      }
      c.restore();
    });

    // 7. 鼻腔空洞 (Pyriform Aperture)
    c.fillStyle = "#0a0908";
    c.beginPath();
    c.moveTo(0, s * 0.14);
    c.lineTo(s * 0.09, s * 0.38);
    c.lineTo(0, s * 0.44);
    c.lineTo(-s * 0.09, s * 0.38);
    c.closePath();
    c.fill();
    c.strokeStyle = "#44403c";
    c.lineWidth = Math.max(1, s * 0.02);
    c.beginPath();
    c.moveTo(0, s * 0.16);
    c.lineTo(0, s * 0.38);
    c.stroke();

    // 8. 上頜牙齒 (Maxillary Teeth)
    const toothCount = 6;
    for (let t = -toothCount / 2; t < toothCount / 2; t++) {
      const tx = (t + 0.5) * (s * 0.09);
      const ty = s * 0.62;
      const th = s * (0.13 + (Math.abs(t) === 1 ? 0.04 : 0));
      c.fillStyle = "#f5f5f4";
      c.strokeStyle = "#292524";
      c.lineWidth = Math.max(0.8, s * 0.016);
      c.beginPath();
      c.rect(tx - s * 0.038, ty, s * 0.076, th);
      c.fill();
      c.stroke();
    }

    // 9. 脫臼大張下顎骨 (Unhinged Gaping Mandible)
    const jawY = s * (0.68 + jawDrop * 0.55);
    if (jawDrop > 0.05) {
      c.fillStyle = "#030202";
      c.beginPath();
      c.rect(-s * 0.34, s * 0.68, s * 0.68, jawY - s * 0.64);
      c.fill();
      if (eyeGlow > 0.2) {
        const throatGlow = c.createRadialGradient(0, (s * 0.68 + jawY) / 2, 2, 0, (s * 0.68 + jawY) / 2, s * 0.32);
        throatGlow.addColorStop(0, "rgba(249, 115, 22, 0.7)");
        throatGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        c.fillStyle = throatGlow;
        c.fillRect(-s * 0.32, s * 0.68, s * 0.64, jawY - s * 0.64);
      }
    }

    c.fillStyle = "#d6d3d1";
    c.strokeStyle = "#44403c";
    c.lineWidth = Math.max(1, s * 0.02);
    c.beginPath();
    c.moveTo(-s * 0.42, jawY - s * 0.06);
    c.lineTo(-s * 0.28, jawY + s * 0.18);
    c.lineTo(s * 0.28, jawY + s * 0.18);
    c.lineTo(s * 0.42, jawY - s * 0.06);
    c.bezierCurveTo(s * 0.26, jawY + s * 0.02, -s * 0.26, jawY + s * 0.02, -s * 0.42, jawY - s * 0.06);
    c.fill();
    c.stroke();

    for (let t = -toothCount / 2; t < toothCount / 2; t++) {
      const tx = (t + 0.5) * (s * 0.085);
      const ty = jawY - s * 0.09;
      const th = s * 0.1;
      c.fillStyle = "#e7e5e4";
      c.strokeStyle = "#292524";
      c.lineWidth = Math.max(0.8, s * 0.016);
      c.beginPath();
      c.rect(tx - s * 0.035, ty, s * 0.07, th);
      c.fill();
      c.stroke();
    }

    c.restore();
  }

  // 寫實恐怖哀嚎怨魂：扭曲長袍幽靈煙霧、絕望尖叫面孔、深陷哀號黑洞雙眼與張大嘶吼黑口、抓扒利爪
  function drawRealisticScreamingWraith(c, w, elapsed, isClimax, alpha) {
    if (!w || alpha <= 0.01) return;
    c.save();
    c.translate(w.x, w.y);
    c.globalAlpha = w.alpha * alpha;

    const tailWave = Math.sin(elapsed * 0.003 + w.phase) * (w.size * 0.4);
    const s = w.size;

    // 1. 幽魂流動拖尾長袍 (Ethereal Flowing Shroud Tail)
    const tailGrad = c.createLinearGradient(0, -s * 0.5, 0, w.tailLength * 1.5);
    tailGrad.addColorStop(0, "rgba(226, 232, 240, 0.75)");
    tailGrad.addColorStop(0.4, "rgba(148, 163, 184, 0.45)");
    tailGrad.addColorStop(0.75, "rgba(234, 88, 12, 0.25)");
    tailGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    c.fillStyle = tailGrad;

    c.beginPath();
    c.moveTo(-s * 0.5, 0);
    c.bezierCurveTo(-s * 0.7, s * 0.8, -s * 0.3 + tailWave, s * 1.8, 0 + tailWave * 1.3, w.tailLength * 1.5);
    c.bezierCurveTo(s * 0.3 + tailWave, s * 1.8, s * 0.7, s * 0.8, s * 0.5, 0);
    c.closePath();
    c.fill();

    // 2. 怨靈頭顱 (Spectral Skull Head)
    c.fillStyle = "rgba(241, 245, 249, 0.9)";
    c.shadowColor = "#ea580c";
    c.shadowBlur = 14;
    c.beginPath();
    c.ellipse(0, -s * 0.45, s * 0.45, s * 0.55, 0, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;

    // 3. 哀嚎空洞黑眼 (Agonized Sunken Eye Voids with Weeping Streams)
    c.fillStyle = "#050203";
    [-1, 1].forEach((dir) => {
      c.beginPath();
      c.ellipse(dir * s * 0.18, -s * 0.52, s * 0.1, s * 0.16, dir * 0.15, 0, Math.PI * 2);
      c.fill();

      c.strokeStyle = "rgba(10, 4, 2, 0.6)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(dir * s * 0.18, -s * 0.4);
      c.lineTo(dir * s * 0.2, -s * 0.22);
      c.stroke();

      c.fillStyle = "#fb923c";
      c.beginPath();
      c.arc(dir * s * 0.18, -s * 0.5, s * 0.035, 0, Math.PI * 2);
      c.fill();
    });

    // 4. 扭曲絕望張大哀嚎之口 (Stretched Screaming Mouth Void)
    const mouthHeight = s * (0.28 + w.mouthOpen * 0.25);
    c.fillStyle = "#000000";
    c.beginPath();
    c.ellipse(0, -s * 0.22 + mouthHeight * 0.35, s * 0.16, mouthHeight * 0.55, 0, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = "rgba(234, 88, 12, 0.5)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -s * 0.22);
    c.lineTo(0, -s * 0.22 + mouthHeight * 0.8);
    c.stroke();

    // 5. 怨靈前伸骨爪 (Reaching Phantom Arms / Skeletal Claws)
    c.strokeStyle = "rgba(226, 232, 240, 0.7)";
    c.lineWidth = 1.4;
    [-1, 1].forEach((dir) => {
      c.beginPath();
      c.moveTo(dir * s * 0.35, -s * 0.15);
      c.quadraticCurveTo(dir * s * 0.7, -s * 0.05, dir * s * 0.85, s * 0.2);
      c.lineTo(dir * s * 0.98, s * 0.18);
      c.moveTo(dir * s * 0.85, s * 0.2);
      c.lineTo(dir * s * 0.95, s * 0.28);
      c.stroke();
    });

    c.restore();
  }

  function drawHecateSkull(c, x, y, s, alpha, eyeGlow) {
    drawRealisticTerrifyingSkull(c, x, y, s, alpha, eyeGlow, 0.22, false);
  }

  function drawHecateCrescentLeft(c, x, m) {
    c.beginPath();
    c.arc(x, 0, m, Math.PI * 0.5, Math.PI * 1.5);
    c.ellipse(x, 0, m * 0.45, m, 0, Math.PI * 1.5, Math.PI * 0.5, true);
    c.closePath();
    c.fill();
  }

  // 黑卡蒂三相月死亡法印
  function drawHecateSigil(c, cx, cy, R, rot, alpha) {
    c.save();
    c.translate(cx, cy);
    c.globalAlpha = alpha;
    c.rotate(rot);
    c.strokeStyle = "#f97316";
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([4, 7]);
    c.beginPath();
    c.arc(0, 0, R * 0.84, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r2 = R * (i % 3 === 0 ? 0.98 : 0.92);
      c.moveTo(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86);
      c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    }
    c.stroke();
    // 倒三角
    c.strokeStyle = "rgba(253, 186, 116, 0.7)";
    c.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      const px = Math.cos(a) * R * 0.8;
      const py = Math.sin(a) * R * 0.8;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.stroke();
    c.rotate(-rot);
    // 三相月 ☽○☾
    const m = R * 0.16;
    c.fillStyle = "#fb923c";
    c.beginPath();
    c.arc(0, 0, m, 0, Math.PI * 2);
    c.fill();
    drawHecateCrescentLeft(c, -m * 2.2, m);
    c.scale(-1, 1);
    drawHecateCrescentLeft(c, -m * 2.2, m);
    c.restore();
  }

  function renderHecateFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const hs = st.hecate;
    const cx = w / 2;
    const cy = h / 2;
    const intensity = isClimax ? 1.6 : isUp ? 1.15 : 0.75;
    hs.twang *= 0.94;

    // 0. 漆黑背景 + 底部冥焰餘燼光
    const bg = c.createRadialGradient(cx, cy * 1.1, 10, cx, cy, Math.max(w, h) * 0.8);
    bg.addColorStop(0, isClimax ? "rgba(67, 20, 7, 0.95)" : "rgba(30, 10, 4, 0.94)");
    bg.addColorStop(0.5, "rgba(10, 4, 2, 0.97)");
    bg.addColorStop(1, "rgba(0, 0, 0, 1)");
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    const eg = c.createLinearGradient(0, h, 0, h * 0.4);
    eg.addColorStop(0, `rgba(234, 88, 12, ${0.32 * intensity})`);
    eg.addColorStop(1, "rgba(0, 0, 0, 0)");
    c.fillStyle = eg;
    c.fillRect(0, 0, w, h);

    // 1. 三相月死亡法印
    drawHecateSigil(
      c,
      cx,
      cy,
      Math.min(w, h) * (isClimax ? 0.37 : 0.32),
      elapsed * 0.00025 * (isClimax ? 3 : 1),
      isUp ? 0.55 : 0.3
    );

    // 2. 由四面八方收束至中心的命運絲線 + 蛛網
    const outerR = Math.hypot(w, h) * 0.55;
    const innerR = isClimax ? Math.max(12, 70 - climaxElapsed * 0.03) : 70;
    c.save();
    c.lineCap = "round";
    for (let i = 0; i < hs.threads.length; i++) {
      const t = hs.threads[i];
      const sway = Math.sin(elapsed * t.freq + t.phase) * t.sag;
      const vib = hs.twang * Math.sin(elapsed * 0.09 + t.phase) * 16;
      const ca = Math.cos(t.angle);
      const sa = Math.sin(t.angle);
      const ox = cx + ca * outerR;
      const oy = cy + sa * outerR;
      const ix = cx + ca * innerR;
      const iy = cy + sa * innerR;
      const off = sway * 0.4 + vib;
      const mx = (ox + ix) / 2 - sa * off;
      const my = (oy + iy) / 2 + ca * off + 16;
      c.strokeStyle = i % 4 === 0 ? "rgba(255, 237, 213, 0.6)" : "rgba(249, 115, 22, 0.42)";
      c.lineWidth = t.width * (isClimax ? 1.5 : 1);
      c.beginPath();
      c.moveTo(ox, oy);
      c.quadraticCurveTo(mx, my, ix, iy);
      c.stroke();
    }
    c.strokeStyle = "rgba(253, 186, 116, 0.22)";
    c.lineWidth = 0.8;
    const n = hs.threads.length;
    for (let k = 0; k < 4; k++) {
      const r = innerR + 26 + k * 36;
      c.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = hs.threads[i % n].angle;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) {
          c.moveTo(px, py);
        } else {
          const pa = hs.threads[(i - 1) % n].angle;
          const ma = (pa + a + (i === n ? Math.PI * 2 : 0)) / 2;
          c.quadraticCurveTo(cx + Math.cos(ma) * r * 0.9, cy + Math.sin(ma) * r * 0.9, px, py);
        }
      }
      c.stroke();
    }
    c.restore();

    // 3. 由天頂絲線懸吊、搖晃的死亡骷髏人偶
    for (let i = 0; i < hs.puppets.length; i++) {
      const p = hs.puppets[i];
      const ax = w * p.xr;
      const len = h * p.len * (isUp ? 1 : 0.8) + (isClimax ? Math.min(60, climaxElapsed * 0.04) : 0);
      const ang =
        Math.sin(elapsed * 0.0016 + p.phase) * p.swing + hs.twang * 0.25 * Math.sin(elapsed * 0.02 + p.phase);
      const sx = ax + Math.sin(ang) * len;
      const sy = Math.cos(ang) * len;
      c.save();
      c.globalAlpha = 0.6;
      c.strokeStyle = "#fed7aa";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(ax, 0);
      c.lineTo(sx, sy - p.size * 1.1);
      c.stroke();
      c.restore();
      drawRealisticTerrifyingSkull(c, sx, sy, p.size, isUp ? 0.95 : 0.65, isUp ? 0.85 : 0.3, p.jawDrop || 0.25, false);
    }

    // 4. 被絲線牽引、淒厲哀號的寫實恐怖怨魂
    for (let i = 0; i < hs.souls.length; i++) {
      const s = hs.souls[i];
      s.y -= s.vy * intensity;
      s.x += Math.sin(elapsed * 0.002 + s.phase) * 0.8;
      if (isClimax) {
        s.x += (cx - s.x) * 0.035;
        s.y += (cy - s.y) * 0.035;
      }
      if (s.y < -40 || (isClimax && Math.abs(s.x - cx) + Math.abs(s.y - cy) < 28)) {
        s.y = h + 15 + Math.random() * 50;
        s.x = Math.random() * w;
      }
      drawRealisticScreamingWraith(c, s, elapsed, isClimax, isUp ? 1 : 0.6);
    }

    // 5. 橘焰與黑焰
    c.save();
    for (let i = 0; i < hs.flames.length; i++) {
      const f = hs.flames[i];
      f.y -= f.vy * intensity;
      f.x += f.vx + Math.sin(elapsed * 0.004 + f.phase) * 0.5;
      f.life -= f.decay * (isClimax ? 1.6 : 1);
      if (isClimax) f.x += (cx - f.x) * 0.004;
      if (f.life <= 0 || f.y < -60) {
        Object.assign(f, spawnHecateFlame(w, h, false));
      }
      const sz = f.size * (0.5 + f.life * 0.7) * (isClimax ? 1.3 : 1);
      c.globalCompositeOperation = f.black ? "source-over" : "lighter";
      c.globalAlpha = Math.max(0, Math.min(1, f.life)) * (f.black ? 0.85 : 0.75);
      c.drawImage(f.black ? hecateSprites.black : hecateSprites.orange, f.x - sz / 2, f.y - sz * 0.65, sz, sz * 1.3);
    }
    c.restore();

    // 6. 終極演出：橘黑冥焰漩渦 + 絲線繭 + 巨大寫實恐怖死靈骷髏真身
    if (isClimax && !st.burstTriggered) {
      const t = climaxElapsed;
      const ringR = 60 + Math.min(1, t / 900) * 120;
      c.save();
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + t * 0.004;
        const r = ringR + Math.sin(t * 0.01 + i) * 12;
        const sz = 34 + (i % 3) * 10;
        const isBlack = i % 2 === 0;
        c.globalCompositeOperation = isBlack ? "source-over" : "lighter";
        c.globalAlpha = 0.85;
        c.drawImage(isBlack ? hecateSprites.black : hecateSprites.orange, cx + Math.cos(a) * r - sz / 2, cy + Math.sin(a) * r - sz / 2, sz, sz);
      }
      c.restore();

      c.save();
      c.strokeStyle = "rgba(255, 237, 213, 0.55)";
      c.lineWidth = 1;
      const tighten = 1 - Math.min(1, t / 2400) * 0.6;
      c.beginPath();
      for (let k = 0; k < 160; k++) {
        const a = k * 0.35 + t * 0.006;
        const r = (30 + k * 0.9) * tighten;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r * 0.85;
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
      c.restore();

      // 震撼巨大寫實死靈骷髏狂暴咆哮
      const sk = Math.min(1, t / 1100);
      const jawAnim = 0.35 + 0.32 * Math.sin(t * 0.006);
      drawRealisticTerrifyingSkull(c, cx, cy - 18, 120 + sk * 25, sk * 0.95, 1.0, jawAnim, true);

      // 高潮暴走環繞的淒厲怨魂狂潮
      for (let wIdx = 0; wIdx < 6; wIdx++) {
        const wAngle = (wIdx / 6) * Math.PI * 2 + t * 0.005;
        const wDist = 180 + Math.sin(t * 0.008 + wIdx) * 35;
        const tempW = {
          x: cx + Math.cos(wAngle) * wDist,
          y: cy + Math.sin(wAngle) * (wDist * 0.7),
          size: 28,
          tailLength: 45,
          mouthOpen: 0.8,
          phase: t * 0.01 + wIdx,
          alpha: 0.75
        };
        drawRealisticScreamingWraith(c, tempW, elapsed, true, sk);
      }
    }

    // 7. 衝擊波與火星（改為橘 / 淡橘白配色）
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy -= 0.04; // 火星向上飄
      sp.alpha *= 0.95;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.globalAlpha = sp.alpha;
      c.fillStyle = i % 3 === 0 ? "#fff7ed" : "#fb923c";
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = st.shockwaves.length - 1; i >= 0; i--) {
      const sw = st.shockwaves[i];
      sw.r += sw.speed;
      sw.alpha *= 0.93;
      if (sw.alpha <= 0.02) {
        st.shockwaves.splice(i, 1);
        continue;
      }
      c.globalAlpha = sw.alpha;
      c.strokeStyle = i % 2 === 0 ? "#f97316" : "#fed7aa";
      c.lineWidth = sw.lineWidth;
      c.beginPath();
      c.arc(cx, cy, sw.r, 0, Math.PI * 2);
      c.stroke();
    }

    // 8. 四角暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.75);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 0, 0, 0.75)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 暗 斯卡奇 專屬畫面：霸王之暗・黑色暴君・萬影臣服 ====================
  function createSkadiFxState(w, h) {
    // 1. 臣服萬影 (Subservient Shadows) — 38 道朝中央王座緩緩爬動、盤旋匯聚的深淵暗影
    const wisps = [];
    for (let i = 0; i < 38; i++) {
      const angle = (i / 38) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      wisps.push({
        angle,
        dist: Math.max(w, h) * (0.35 + Math.random() * 0.35),
        speed: 0.65 + Math.random() * 1.1,
        amp: 14 + Math.random() * 22,
        freq: 0.002 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 12,
        alpha: 0.4 + Math.random() * 0.45,
        history: []
      });
    }

    // 2. 霸王黑雷電弧 (Black Lightning Arcs)
    const lightnings = [];
    for (let i = 0; i < 6; i++) {
      lightnings.push({
        fromAngle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        timer: Math.random() * 100,
        active: false,
        segments: []
      });
    }

    // 3. 萬鈞重力震盪環 (Gravity Shockwaves)
    const gravRings = [];
    for (let r = 0; r < 4; r++) {
      gravRings.push({
        r: r * 80,
        speed: 1.2,
        maxR: 380,
        alpha: 0.6
      });
    }

    return {
      wisps,
      lightnings,
      gravRings,
      hammerImpact: 0,
      shockwaves: []
    };
  }

  // 繪製暴君王冠法印（幾何暗冠 + 8道暗曜刺針）
  function drawSkadiTyrantCrown(c, cx, cy, R, rot, alpha, pulse) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(cx, cy);
    c.rotate(rot);
    c.globalAlpha = alpha;

    // 外環符文暗曜軌道
    c.strokeStyle = "rgba(147, 51, 234, 0.75)";
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.stroke();

    c.setLineDash([6, 8]);
    c.strokeStyle = "rgba(192, 132, 252, 0.45)";
    c.beginPath();
    c.arc(0, 0, R * 0.88, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);

    // 8 道霸王尖刺（王權之冠放射尖稜）
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      const rOuter = R * (i % 2 === 0 ? 1.28 : 1.12) * (1 + pulse * 0.08);
      const rInner = R * 0.76;
      const wSide = 0.12;

      c.fillStyle = i % 2 === 0 ? "rgba(46, 16, 101, 0.85)" : "rgba(10, 0, 20, 0.95)";
      c.strokeStyle = "#a855f7";
      c.lineWidth = 1.5;

      c.beginPath();
      c.moveTo(Math.cos(a - wSide) * rInner, Math.sin(a - wSide) * rInner);
      c.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
      c.lineTo(Math.cos(a + wSide) * rInner, Math.sin(a + wSide) * rInner);
      c.closePath();
      c.fill();
      c.stroke();

      // 尖端暗紫晶芒
      c.fillStyle = "#e9d5ff";
      c.beginPath();
      c.arc(Math.cos(a) * rOuter, Math.sin(a) * rOuter, 2.5, 0, Math.PI * 2);
      c.fill();
    }

    // 核心雙重反向八角星
    c.strokeStyle = "rgba(233, 213, 255, 0.65)";
    c.lineWidth = 1.6;
    for (let k = 0; k < 2; k++) {
      c.beginPath();
      const offset = (k * Math.PI) / 4;
      for (let s = 0; s < 4; s++) {
        const ang = offset + (s * Math.PI) / 2;
        const px = Math.cos(ang) * R * 0.62;
        const py = Math.sin(ang) * R * 0.62;
        if (s === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.stroke();
    }

    c.restore();
  }

  // 繪製霸王黑雷電弧
  function drawSkadiBlackBolt(c, x1, y1, x2, y2, isThick) {
    const segs = 9;
    let lx = x1;
    let ly = y1;
    const pts = [{ x: lx, y: ly }];
    for (let s = 1; s < segs; s++) {
      const t = s / segs;
      const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * (isThick ? 45 : 25);
      const ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * (isThick ? 45 : 25);
      pts.push({ x: nx, y: ny });
    }
    pts.push({ x: x2, y: y2 });

    // 黑雷：黑邊外廓
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";

    c.strokeStyle = "#000000";
    c.lineWidth = isThick ? 7 : 4.5;
    c.globalAlpha = 0.95;
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();

    // 紫電核心
    c.strokeStyle = isThick ? "#e9d5ff" : "#c084fc";
    c.lineWidth = isThick ? 3.2 : 1.8;
    c.globalAlpha = 1;
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();

    c.restore();
  }

  // 繪製巨槌剪影 (暗王之錘・索狄亞洛)
  function drawSkadiHammerSilhouette(c, cx, cy, scale, alpha, glowColor) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(cx, cy);
    c.scale(scale, scale);
    c.globalAlpha = alpha;

    // 槌頭深紫黑金光影
    c.fillStyle = "#0c0214";
    c.strokeStyle = glowColor || "#a855f7";
    c.lineWidth = 4;

    // 巨大槌頭箱體 (兩側帶有倒角與重力法印)
    const hw = 130;
    const hh = 75;
    c.beginPath();
    c.moveTo(-hw, -hh);
    c.lineTo(hw, -hh);
    c.lineTo(hw + 18, -hh + 24);
    c.lineTo(hw + 18, hh - 24);
    c.lineTo(hw, hh);
    c.lineTo(-hw, hh);
    c.lineTo(-hw - 18, hh - 24);
    c.lineTo(-hw - 18, -hh + 24);
    c.closePath();
    c.fill();
    c.stroke();

    // 槌身符文雕刻
    c.strokeStyle = "rgba(233, 213, 255, 0.75)";
    c.lineWidth = 2;
    c.strokeRect(-hw * 0.7, -hh * 0.65, hw * 1.4, hh * 1.3);

    // 槌柄
    c.fillStyle = "#1e082b";
    c.strokeStyle = "#9333ea";
    c.lineWidth = 3;
    c.fillRect(-14, hh, 28, 160);
    c.strokeRect(-14, hh, 28, 160);

    // 槌頂重力寶石
    c.fillStyle = "#c084fc";
    c.beginPath();
    c.arc(0, -hh, 16, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function renderSkadiFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const ss = st.skadi;
    const cx = w / 2;
    const cy = h / 2;
    const intensity = isClimax ? 1.7 : isUp ? 1.2 : 0.85;
    if (ss.hammerImpact > 0.01) ss.hammerImpact *= 0.91;

    // 0. 深邃霸王之暗底色（純黑向中心深紫擴散）
    const bg = c.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.78);
    bg.addColorStop(0, isClimax ? "rgba(59, 7, 100, 0.95)" : "rgba(30, 8, 43, 0.92)");
    bg.addColorStop(0.38, "rgba(15, 2, 24, 0.96)");
    bg.addColorStop(0.75, "rgba(5, 0, 8, 0.99)");
    bg.addColorStop(1, "rgba(0, 0, 0, 1)");
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // 1. 萬鈞重力震盪環（向外擴散的重力脈衝）
    c.save();
    for (let i = 0; i < ss.gravRings.length; i++) {
      const ring = ss.gravRings[i];
      ring.r += ring.speed * (isClimax ? 2.2 : 1.2);
      if (ring.r > ring.maxR) ring.r = 20;
      const ringAlpha = (1 - ring.r / ring.maxR) * 0.45 * (isUp ? 1 : 0.6);
      c.strokeStyle = i % 2 === 0 ? "rgba(147, 51, 234, " + ringAlpha + ")" : "rgba(10, 0, 20, " + ringAlpha * 1.5 + ")";
      c.lineWidth = i % 2 === 0 ? 3.5 : 6;
      c.beginPath();
      c.arc(cx, cy, ring.r, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();

    // 2. 旋轉霸王暗冠神座法印（8角王權尖刺）
    const crownR = Math.min(w, h) * (isClimax ? 0.38 : 0.32);
    const pulseVal = Math.sin(elapsed * 0.003) * 0.5 + 0.5;
    drawSkadiTyrantCrown(c, cx, cy, crownR, elapsed * 0.00032 * (isClimax ? 2.5 : 1), isUp ? 0.7 : 0.4, pulseVal);

    // 3. 臣服萬影（向中央王座爬行盤旋的群臣暗影）
    c.save();
    for (let i = 0; i < ss.wisps.length; i++) {
      const wisp = ss.wisps[i];
      wisp.dist -= wisp.speed * intensity;
      if (wisp.dist < (isClimax ? 15 : 45)) {
        wisp.dist = Math.max(w, h) * (0.35 + Math.random() * 0.35);
        wisp.history = [];
      }
      wisp.angle += (isClimax ? 0.015 : 0.007) * (i % 2 === 0 ? 1 : -1);
      const wave = Math.sin(elapsed * wisp.freq + wisp.phase) * wisp.amp;
      const wx = cx + Math.cos(wisp.angle) * (wisp.dist + wave);
      const wy = cy + Math.sin(wisp.angle) * (wisp.dist * 0.75 + wave);

      wisp.history.push({ x: wx, y: wy });
      if (wisp.history.length > 7) wisp.history.shift();

      // 繪製暗影軌跡
      if (wisp.history.length > 1) {
        c.beginPath();
        c.moveTo(wisp.history[0].x, wisp.history[0].y);
        for (let k = 1; k < wisp.history.length; k++) {
          c.lineTo(wisp.history[k].x, wisp.history[k].y);
        }
        c.strokeStyle = i % 3 === 0 ? "#7e22ce" : "#1a0329";
        c.lineWidth = wisp.size * 0.65;
        c.lineCap = "round";
        c.globalAlpha = wisp.alpha * (isUp ? 0.75 : 0.45);
        c.stroke();
      }

      // 暗影頭部核心
      c.globalAlpha = wisp.alpha * (isUp ? 0.85 : 0.5);
      c.fillStyle = i % 2 === 0 ? "#9333ea" : "#000000";
      c.beginPath();
      c.arc(wx, wy, wisp.size * 0.5, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // 4. 霸王黑雷電弧（空間黑雷裂空轟擊）
    c.save();
    const shouldBolt = Math.random() < (isClimax ? 0.65 : isUp ? 0.35 : 0.15) || ss.hammerImpact > 0.3;
    if (shouldBolt) {
      const bAng = Math.random() * Math.PI * 2;
      const bDist = Math.max(w, h) * 0.48;
      const bx1 = cx + Math.cos(bAng) * bDist;
      const by1 = cy + Math.sin(bAng) * bDist;
      const bx2 = cx + (Math.random() - 0.5) * 80;
      const by2 = cy + (Math.random() - 0.5) * 80;
      drawSkadiBlackBolt(c, bx1, by1, bx2, by2, isClimax || ss.hammerImpact > 0.4);
    }
    c.restore();

    // 5. 終極高潮演出：暗王之錘・索狄亞洛 萬鈞虛影轟臨 + 巨大暴君王冠
    if (isClimax && !st.burstTriggered) {
      const t = climaxElapsed;
      const scaleProg = Math.min(1, t / 1100);
      const hammerY = cy - 24 - (1 - scaleProg) * 120;
      drawSkadiHammerSilhouette(c, cx, hammerY, 0.72 + scaleProg * 0.28, Math.min(0.85, scaleProg * 0.95), "#c084fc");

      // 狂暴黑雷圍繞中央核心狂轟
      for (let i = 0; i < 3; i++) {
        const a1 = (i / 3) * Math.PI * 2 + t * 0.005;
        const a2 = a1 + Math.PI;
        const r = 110 + Math.sin(t * 0.01 + i) * 35;
        drawSkadiBlackBolt(c, cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * (r * 0.4), cy + Math.sin(a2) * (r * 0.4), true);
      }
    }

    // 6. 重槌震波與碎裂紫黑粒子
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.06;
      sp.alpha *= 0.95;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#a855f7";
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = st.shockwaves.length - 1; i >= 0; i--) {
      const sw = st.shockwaves[i];
      sw.r += sw.speed;
      sw.alpha *= 0.93;
      if (sw.alpha <= 0.02) {
        st.shockwaves.splice(i, 1);
        continue;
      }
      c.globalAlpha = sw.alpha;
      c.strokeStyle = sw.color || "#9333ea";
      c.lineWidth = sw.lineWidth || 3;
      c.beginPath();
      c.arc(cx, cy, sw.r, 0, Math.PI * 2);
      c.stroke();
    }

    // 7. 四角極致壓制暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.28, cx, cy, Math.max(w, h) * 0.76);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 0, 0, 0.88)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 伊格那利昂 加拉爾 專屬畫面：熊熊聖火與加拉爾帝國王道 ====================
  function createIgnalionFxState(w, h) {
    // 1. 熊熊聖火粒子與升騰灰燼 (Holy Flames & Ascending Ash Embers)
    const flames = [];
    for (let i = 0; i < 52; i++) {
      flames.push({
        x: w * 0.08 + Math.random() * w * 0.84,
        y: h + Math.random() * 120,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -2.4 - Math.random() * 4.2,
        size: 3.5 + Math.random() * 8.5,
        alpha: 0.55 + Math.random() * 0.45,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.0025 + Math.random() * 0.004,
        isWhiteHoly: i % 3 === 0, // 聖火白焰
        isAsh: i % 5 === 1        // 灰燼加冕
      });
    }

    return {
      flames,
      swordImpact: 0,
      shockwaves: []
    };
  }

  // 繪製加拉爾帝國雙翼火神皇徽（雙翼金鷹 + 12道聖火耀芒 + 帝王月桂冠）
  function drawIgnalionEmpireCrest(c, cx, cy, R, rot, alpha, pulse) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(cx, cy);

    // 1. 12 道帝國聖火太陽神芒
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const ang = (i / rays) * Math.PI * 2 + rot;
      const rayLen = R * (1.18 + (i % 2 === 0 ? 0.35 : 0.15) * pulse);
      c.save();
      c.rotate(ang);
      c.beginPath();
      c.moveTo(0, -rayLen);
      c.lineTo(R * 0.08, -R * 0.25);
      c.lineTo(-R * 0.08, -R * 0.25);
      c.closePath();
      c.fillStyle = i % 2 === 0 ? "rgba(254, 240, 138, " + (alpha * 0.65) + ")" : "rgba(245, 158, 11, " + (alpha * 0.5) + ")";
      c.fill();
      c.restore();
    }

    // 2. 帝國金鷹展翅雙翼（左翼與右翼）
    [-1, 1].forEach((dir) => {
      c.save();
      c.scale(dir, 1);
      // 主翼羽毛
      for (let wIdx = 0; wIdx < 5; wIdx++) {
        const wingScale = 0.75 + wIdx * 0.12;
        const wingAng = -0.32 + wIdx * 0.14 + Math.sin(rot * 2) * 0.05;
        c.save();
        c.translate(R * 0.28, -R * 0.15);
        c.rotate(wingAng);
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(R * 0.7 * wingScale, -R * 0.55 * wingScale, R * 1.25 * wingScale, -R * 0.2 * wingScale);
        c.quadraticCurveTo(R * 0.8 * wingScale, R * 0.15 * wingScale, 0, 0);
        c.closePath();
        c.fillStyle = wIdx % 2 === 0 ? "rgba(251, 191, 36, " + (alpha * 0.7) + ")" : "rgba(220, 38, 38, " + (alpha * 0.55) + ")";
        c.fill();
        c.strokeStyle = "rgba(254, 240, 138, " + (alpha * 0.85) + ")";
        c.lineWidth = 2;
        c.stroke();
        c.restore();
      }
      c.restore();
    });

    // 3. 中央火神王冕（三叉皇冠）
    c.save();
    c.translate(0, -R * 0.55);
    c.beginPath();
    c.moveTo(-R * 0.35, 0);
    c.lineTo(-R * 0.45, -R * 0.45);
    c.lineTo(-R * 0.18, -R * 0.2);
    c.lineTo(0, -R * 0.65 * pulse);
    c.lineTo(R * 0.18, -R * 0.2);
    c.lineTo(R * 0.45, -R * 0.45);
    c.lineTo(R * 0.35, 0);
    c.closePath();
    c.fillStyle = "rgba(254, 240, 138, " + (alpha * 0.85) + ")";
    c.fill();
    c.strokeStyle = "#b45309";
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();

    // 4. 中央萬火同心圓環
    c.beginPath();
    c.arc(0, 0, R * 0.38, 0, Math.PI * 2);
    c.strokeStyle = "rgba(254, 240, 138, " + alpha + ")";
    c.lineWidth = 3;
    c.stroke();

    c.beginPath();
    c.arc(0, 0, R * 0.22, 0, Math.PI * 2);
    c.fillStyle = "rgba(245, 158, 11, " + (alpha * 0.65) + ")";
    c.fill();
    c.restore();
  }

  // 繪製「加拉爾帝國王道」（縱使前路已成灰燼，只要汝仍未言棄——吾便為汝焚出一條王道）
  function drawIgnalionKingRoad(c, cx, cy, w, h, elapsed, isClimax, alpha) {
    if (alpha <= 0.01) return;
    c.save();

    // 梯形透視聖火王道
    const topY = cy + 45;
    const topW = 60;
    const btmY = h + 20;
    const btmW = 340;

    const roadGrad = c.createLinearGradient(0, topY, 0, btmY);
    roadGrad.addColorStop(0, "rgba(255, 255, 255, " + (alpha * 0.95) + ")");
    roadGrad.addColorStop(0.3, "rgba(254, 240, 138, " + (alpha * 0.8) + ")");
    roadGrad.addColorStop(0.7, "rgba(245, 158, 11, " + (alpha * 0.65) + ")");
    roadGrad.addColorStop(1, "rgba(185, 28, 28, " + (alpha * 0.4) + ")");

    c.beginPath();
    c.moveTo(cx - topW / 2, topY);
    c.lineTo(cx + topW / 2, topY);
    c.lineTo(cx + btmW / 2, btmY);
    c.lineTo(cx - btmW / 2, btmY);
    c.closePath();
    c.fillStyle = roadGrad;
    c.fill();

    // 王道兩側熾烈聖火金邊
    c.lineWidth = isClimax ? 4.5 : 3;
    c.strokeStyle = "rgba(255, 255, 255, " + (alpha * 0.95) + ")";
    c.beginPath();
    c.moveTo(cx - topW / 2, topY);
    c.lineTo(cx - btmW / 2, btmY);
    c.moveTo(cx + topW / 2, topY);
    c.lineTo(cx + btmW / 2, btmY);
    c.stroke();

    // 王道中軸向前奔湧的聖火符文光帶
    const dashOffset = (elapsed * 0.18) % 40;
    c.setLineDash([24, 16]);
    c.lineDashOffset = -dashOffset;
    c.lineWidth = 2.5;
    c.strokeStyle = "rgba(255, 255, 255, 0.85)";
    c.beginPath();
    c.moveTo(cx, topY);
    c.lineTo(cx, btmY);
    c.stroke();
    c.setLineDash([]);

    // 兩側燃燒火炬節點 (6 對聖火柱)
    for (let p = 0; p < 6; p++) {
      const t = p / 5;
      const py = topY + (btmY - topY) * t;
      const pw = topW + (btmW - topW) * t;
      const pScale = 0.5 + t * 0.8;
      [-1, 1].forEach((dir) => {
        const px = cx + dir * (pw / 2);
        const fR = (8 + 5 * Math.sin(elapsed * 0.01 + p)) * pScale;
        c.beginPath();
        c.arc(px, py, fR, 0, Math.PI * 2);
        c.fillStyle = "rgba(254, 240, 138, 0.85)";
        c.fill();
        c.beginPath();
        c.arc(px, py - fR * 0.6, fR * 0.7, 0, Math.PI * 2);
        c.fillStyle = "rgba(255, 255, 255, 0.95)";
        c.fill();
      });
    }

    c.restore();
  }

  // 繪製火神之罰巨劍虛影
  function drawIgnalionSwordSilhouette(c, cx, swordY, scale, alpha) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(cx, swordY);
    c.scale(scale, scale);

    // 劍刃發光輪廓
    c.shadowColor = "#f59e0b";
    c.shadowBlur = 32;

    // 雙刃大劍劍身
    c.beginPath();
    c.moveTo(0, 140); // 劍尖朝下
    c.lineTo(16, 110);
    c.lineTo(20, -110);
    c.lineTo(34, -115); // 護手
    c.lineTo(38, -132);
    c.lineTo(8, -132);
    c.lineTo(6, -175);  // 劍柄
    c.lineTo(12, -180); // 劍首
    c.lineTo(0, -192);
    c.lineTo(-12, -180);
    c.lineTo(-6, -175);
    c.lineTo(-8, -132);
    c.lineTo(-38, -132);
    c.lineTo(-34, -115);
    c.lineTo(-20, -110);
    c.lineTo(-16, 110);
    c.closePath();

    c.fillStyle = "rgba(255, 255, 255, " + (alpha * 0.92) + ")";
    c.fill();
    c.strokeStyle = "rgba(245, 158, 11, " + (alpha * 0.95) + ")";
    c.lineWidth = 4;
    c.stroke();

    // 劍身中心燃燒聖火凹槽
    c.beginPath();
    c.moveTo(0, 115);
    c.lineTo(0, -100);
    c.strokeStyle = "#dc2626";
    c.lineWidth = 3;
    c.stroke();

    c.restore();
  }

  // 伊格那利昂 每幀專屬渲染循環
  function renderIgnalionFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const is = st.ignalion;
    if (!is) return;
    const cx = w / 2;
    const cy = h / 2;

    // 1. 帝國聖火深邃金紅背景
    const bgGrad = c.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.78);
    bgGrad.addColorStop(0, "rgba(55, 10, 3, 0.95)");
    bgGrad.addColorStop(0.45, "rgba(28, 5, 2, 0.98)");
    bgGrad.addColorStop(0.85, "rgba(10, 2, 1, 0.99)");
    bgGrad.addColorStop(1, "#020100");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, w, h);

    // 2. 聖火王道（縱使前路已成灰燼，吾便為汝焚出一條王道）
    drawIgnalionKingRoad(c, cx, cy, w, h, elapsed, isClimax, isUp ? 0.92 : 0.65);

    // 3. 帝國雙翼火神皇徽
    const crestPulse = 0.9 + 0.18 * Math.sin(elapsed * 0.005);
    const crestR = 145 * (isClimax ? 1.25 : 1);
    drawIgnalionEmpireCrest(c, cx, cy - 25, crestR, elapsed * 0.0003, isUp ? 0.85 : 0.55, crestPulse);

    // 4. 熊熊聖火與升騰灰燼粒子
    const flameSpeed = isClimax ? 2.2 : isUp ? 1.4 : 1;
    for (let i = 0; i < is.flames.length; i++) {
      const fl = is.flames[i];
      fl.y += fl.vy * flameSpeed;
      fl.x += Math.sin(elapsed * fl.swaySpeed + fl.swayPhase) * 1.8;
      if (fl.y < -30) {
        fl.y = h + Math.random() * 40;
        fl.x = w * 0.08 + Math.random() * w * 0.84;
      }
      c.save();
      c.globalAlpha = fl.alpha * (isClimax ? 1 : 0.85);
      if (fl.isWhiteHoly) {
        c.fillStyle = "#ffffff";
        c.shadowColor = "#fef08a";
        c.shadowBlur = 14;
      } else if (fl.isAsh) {
        c.fillStyle = "#a8a29e"; // 灰燼加冕
      } else {
        c.fillStyle = i % 2 === 0 ? "#f59e0b" : "#ef4444";
        c.shadowColor = "#dc2626";
        c.shadowBlur = 10;
      }
      c.beginPath();
      c.arc(fl.x, fl.y, fl.size * (isClimax ? 1.3 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 5. 火神之罰巨劍虛影
    if (is.swordImpact > 0) {
      is.swordImpact *= 0.93;
      const sScale = 0.85 + is.swordImpact * 0.45;
      const sY = cy - 20 + (1 - is.swordImpact) * 20;
      drawIgnalionSwordSilhouette(c, cx, sY, sScale, Math.min(0.9, is.swordImpact * 1.2));
    }

    // 6. 聖火震波與衝擊碎屑
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.05;
      sp.alpha *= 0.95;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#fde047";
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = st.shockwaves.length - 1; i >= 0; i--) {
      const sw = st.shockwaves[i];
      sw.r += sw.speed;
      sw.alpha *= 0.93;
      if (sw.alpha <= 0.02) {
        st.shockwaves.splice(i, 1);
        continue;
      }
      c.globalAlpha = sw.alpha;
      c.strokeStyle = sw.color || "#f59e0b";
      c.lineWidth = sw.lineWidth || 3.5;
      c.beginPath();
      c.arc(cx, cy, sw.r, 0, Math.PI * 2);
      c.stroke();
    }

    // 7. 帝國聖火四角暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.32, cx, cy, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 0, 0, 0.88)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 沃利爾 德瑪 專屬畫面：戰爭與古羅馬競技場 (warrior-arena) ====================
  function createWarriorFxState(w, h) {
    // 1. 競技場血戰火星與戰意紅蓮 (Colosseum Sparks & War Fury Wisps)
    const sparks = [];
    for (let i = 0; i < 56; i++) {
      sparks.push({
        x: w * 0.05 + Math.random() * w * 0.9,
        y: h + Math.random() * 80,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -2.8 - Math.random() * 4.6,
        size: 3.0 + Math.random() * 6.5,
        alpha: 0.55 + Math.random() * 0.45,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.003 + Math.random() * 0.004,
        isCrimson: i % 3 === 0,
        isSteel: i % 4 === 1
      });
    }

    // 2. 競技場插地戰器剪影 (Weapons of War thrust into the Arena Sand)
    const groundWeapons = [];
    const wepTypes = ["sword", "spear", "axe", "halberd"];
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      const distRatio = 0.22 + Math.floor(i / 2) * 0.16;
      groundWeapons.push({
        type: wepTypes[i % wepTypes.length],
        xRatio: 0.5 + dir * distRatio,
        tilt: dir * (0.12 + (i % 3) * 0.08),
        scale: 0.7 + (i % 3) * 0.15
      });
    }

    return {
      sparks,
      groundWeapons,
      swordImpact: 0,
      shockwaves: []
    };
  }

  // 繪製古羅馬圓形競技場拱門與巨石迴廊
  function drawWarriorColosseum(c, cx, cy, w, h, elapsed, isClimax, alpha) {
    if (alpha <= 0.01) return;
    c.save();

    // 遠景巨石角鬥看台與拱門柱列 (Colosseum Arches)
    const archCount = 14;
    const archY = cy - 25;
    const archSpan = w * 0.92;
    const startX = cx - archSpan / 2;
    const stepX = archSpan / (archCount - 1);

    for (let i = 0; i < archCount; i++) {
      const ax = startX + i * stepX;
      const distFromCenter = Math.abs(ax - cx) / (archSpan / 2);
      const curveY = archY + Math.pow(distFromCenter, 2) * 28;
      const archH = (isClimax ? 150 : 130) * (1 - distFromCenter * 0.25);
      const archW = stepX * 0.72;

      // 巨石柱
      c.fillStyle = "rgba(40, 12, 6, " + (alpha * (0.45 + (1 - distFromCenter) * 0.35)) + ")";
      c.fillRect(ax - archW / 2, curveY - archH, archW, archH);

      // 拱門弧頂
      c.beginPath();
      c.arc(ax, curveY - archH * 0.65, archW * 0.35, Math.PI, 0, false);
      c.lineTo(ax + archW * 0.35, curveY);
      c.lineTo(ax - archW * 0.35, curveY);
      c.closePath();
      c.fillStyle = "rgba(18, 4, 2, " + (alpha * 0.9) + ")";
      c.fill();
      c.strokeStyle = "rgba(234, 88, 12, " + (alpha * 0.45) + ")";
      c.lineWidth = 1.5;
      c.stroke();
    }

    // 競技場血色烽火台鐵盆 (兩側燃燒的火盆)
    [-1, 1].forEach((dir) => {
      const bx = cx + dir * (w * 0.38);
      const by = cy + 18;
      // 鐵架
      c.strokeStyle = "rgba(234, 88, 12, " + alpha + ")";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(bx - 16, by);
      c.lineTo(bx + 16, by);
      c.lineTo(bx + 10, by + 24);
      c.lineTo(bx - 10, by + 24);
      c.closePath();
      c.stroke();

      // 烽火烈焰
      const fFlameR = 14 + 6 * Math.sin(elapsed * 0.01 + dir);
      c.beginPath();
      c.arc(bx, by - 10, fFlameR, 0, Math.PI * 2);
      c.fillStyle = "rgba(234, 88, 12, 0.85)";
      c.fill();
      c.beginPath();
      c.arc(bx, by - 16, fFlameR * 0.65, 0, Math.PI * 2);
      c.fillStyle = "rgba(254, 215, 170, 0.95)";
      c.fill();
    });

    c.restore();
  }

  // 繪製競技場血沙地面與插地戰器（戰爭之器）
  function drawWarriorArenaFloor(c, cx, cy, w, h, elapsed, isClimax, groundWeapons, alpha) {
    if (alpha <= 0.01) return;
    c.save();

    // 橢圓血沙地面
    const floorY = cy + 50;
    const rx = w * 0.46;
    const ry = (h - floorY) * 0.95;

    const floorGrad = c.createRadialGradient(cx, floorY + ry * 0.3, 20, cx, floorY + ry * 0.3, rx);
    floorGrad.addColorStop(0, "rgba(90, 22, 10, " + (alpha * 0.95) + ")");
    floorGrad.addColorStop(0.48, "rgba(55, 14, 6, " + (alpha * 0.9) + ")");
    floorGrad.addColorStop(0.85, "rgba(28, 6, 2, " + (alpha * 0.85) + ")");
    floorGrad.addColorStop(1, "rgba(10, 2, 1, 0)");

    c.beginPath();
    c.ellipse(cx, floorY + ry * 0.5, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = floorGrad;
    c.fill();

    // 圓形角鬥環形標記線（勝者為王）
    c.strokeStyle = "rgba(234, 88, 12, " + (alpha * 0.6) + ")";
    c.lineWidth = 2.5;
    c.beginPath();
    c.ellipse(cx, floorY + ry * 0.5, rx * 0.72, ry * 0.72, 0, 0, Math.PI * 2);
    c.stroke();

    // 插地兵器（闊劍、長槍、戰斧、長戟）
    groundWeapons.forEach((gw) => {
      const wx = w * gw.xRatio;
      const wy = floorY + ry * 0.45 + Math.abs(gw.xRatio - 0.5) * 45;
      c.save();
      c.translate(wx, wy);
      c.rotate(gw.tilt);
      c.scale(gw.scale, gw.scale);

      if (gw.type === "spear") {
        // 長矛／槍
        c.strokeStyle = "rgba(253, 186, 116, 0.9)";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(0, 15);
        c.lineTo(0, -95);
        c.stroke();
        c.fillStyle = "rgba(234, 88, 12, 0.95)";
        c.beginPath();
        c.moveTo(-6, -95);
        c.lineTo(0, -118);
        c.lineTo(6, -95);
        c.closePath();
        c.fill();
      } else if (gw.type === "axe") {
        // 戰斧
        c.strokeStyle = "rgba(253, 186, 116, 0.9)";
        c.lineWidth = 3.5;
        c.beginPath();
        c.moveTo(0, 10);
        c.lineTo(0, -85);
        c.stroke();
        c.fillStyle = "rgba(220, 38, 38, 0.95)";
        c.beginPath();
        c.arc(14, -70, 22, -Math.PI / 2, Math.PI / 2, false);
        c.lineTo(0, -70);
        c.closePath();
        c.fill();
      } else {
        // 闊劍／長劍
        c.fillStyle = "rgba(254, 215, 170, 0.95)";
        c.beginPath();
        c.moveTo(-4, 15);
        c.lineTo(4, 15);
        c.lineTo(6, -75);
        c.lineTo(0, -90);
        c.lineTo(-6, -75);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(234, 88, 12, 0.95)";
        c.lineWidth = 3.5;
        c.beginPath();
        c.moveTo(-16, -72);
        c.lineTo(16, -72);
        c.stroke();
      }
      c.restore();
    });

    c.restore();
  }

  // 繪製戰神之劍－阿瑞斯之魂巨劍虛影
  function drawWarriorAresSwordSilhouette(c, cx, swordY, scale, alpha) {
    if (alpha <= 0.01) return;
    c.save();
    c.translate(cx, swordY);
    c.scale(scale, scale);

    c.shadowColor = "#ea580c";
    c.shadowBlur = 36;

    // 巨型戰神闊劍
    c.beginPath();
    c.moveTo(0, 155); // 劍尖朝下插地
    c.lineTo(24, 120);
    c.lineTo(28, -120);
    c.lineTo(48, -126); // 戰神鋼角護手
    c.lineTo(52, -145);
    c.lineTo(12, -145);
    c.lineTo(8, -195);  // 劍柄
    c.lineTo(18, -202); // 劍首角鬥環
    c.lineTo(0, -215);
    c.lineTo(-18, -202);
    c.lineTo(-8, -195);
    c.lineTo(-12, -145);
    c.lineTo(-52, -145);
    c.lineTo(-48, -126);
    c.lineTo(-28, -120);
    c.lineTo(-24, 120);
    c.closePath();

    c.fillStyle = "rgba(255, 247, 237, " + (alpha * 0.94) + ")";
    c.fill();
    c.strokeStyle = "rgba(234, 88, 12, " + (alpha * 0.95) + ")";
    c.lineWidth = 4.5;
    c.stroke();

    // 劍脊赤紅紅蓮戰痕血槽
    c.beginPath();
    c.moveTo(0, 125);
    c.lineTo(0, -115);
    c.strokeStyle = "#b91c1c";
    c.lineWidth = 4;
    c.stroke();

    c.restore();
  }

  // 沃利爾 德瑪 每幀專屬渲染循環 (warrior-arena)
  function renderWarriorFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const ws = st.warrior;
    if (!ws) return;
    const cx = w / 2;
    const cy = h / 2;

    // 1. 競技場暮色血火天際背景
    const bgGrad = c.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) * 0.8);
    bgGrad.addColorStop(0, "rgba(65, 15, 6, 0.96)");
    bgGrad.addColorStop(0.45, "rgba(35, 8, 3, 0.98)");
    bgGrad.addColorStop(0.85, "rgba(15, 3, 1, 0.99)");
    bgGrad.addColorStop(1, "#050100");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, w, h);

    // 2. 遠景巨石圓形競技場拱門與看台
    drawWarriorColosseum(c, cx, cy, w, h, elapsed, isClimax, isUp ? 0.88 : 0.6);

    // 3. 競技場血沙地面與插地兵器（戰爭之器）
    drawWarriorArenaFloor(c, cx, cy, w, h, elapsed, isClimax, ws.groundWeapons, isUp ? 0.92 : 0.68);

    // 4. 飛濺火星與血霧戰意粒子
    const sparkSpeed = isClimax ? 2.3 : isUp ? 1.45 : 1;
    for (let i = 0; i < ws.sparks.length; i++) {
      const spk = ws.sparks[i];
      spk.y += spk.vy * sparkSpeed;
      spk.x += Math.sin(elapsed * spk.swaySpeed + spk.swayPhase) * 2.0;
      if (spk.y < -30) {
        spk.y = h + Math.random() * 40;
        spk.x = w * 0.05 + Math.random() * w * 0.9;
      }
      c.save();
      c.globalAlpha = spk.alpha * (isClimax ? 1 : 0.85);
      if (spk.isSteel) {
        c.fillStyle = "#ffffff";
        c.shadowColor = "#fed7aa";
        c.shadowBlur = 12;
      } else if (spk.isCrimson) {
        c.fillStyle = "#dc2626";
        c.shadowColor = "#7f1d1d";
        c.shadowBlur = 14;
      } else {
        c.fillStyle = i % 2 === 0 ? "#ea580c" : "#f97316";
        c.shadowColor = "#c2410c";
        c.shadowBlur = 10;
      }
      c.beginPath();
      c.arc(spk.x, spk.y, spk.size * (isClimax ? 1.3 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 5. 戰神之劍－阿瑞斯之魂巨劍插地虛影
    if (ws.swordImpact > 0) {
      ws.swordImpact *= 0.92;
      const sScale = 0.88 + ws.swordImpact * 0.48;
      const sY = cy - 15 + (1 - ws.swordImpact) * 22;
      drawWarriorAresSwordSilhouette(c, cx, sY, sScale, Math.min(0.92, ws.swordImpact * 1.25));
    }

    // 6. 戰神之威震波與重擊碎屑
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.06;
      sp.alpha *= 0.94;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#fdba74";
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = st.shockwaves.length - 1; i >= 0; i--) {
      const sw = st.shockwaves[i];
      sw.r += sw.speed;
      sw.alpha *= 0.92;
      if (sw.alpha <= 0.02) {
        st.shockwaves.splice(i, 1);
        continue;
      }
      c.globalAlpha = sw.alpha;
      c.strokeStyle = sw.color || "#ea580c";
      c.lineWidth = sw.lineWidth || 4.0;
      c.beginPath();
      c.arc(cx, cy, sw.r, 0, Math.PI * 2);
      c.stroke();
    }

    // 7. 競技場四角鐵血暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.max(w, h) * 0.76);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 別西卜 阿斯拉 撒旦 專屬畫面：暴食血紅與群蠅暴虐 (beelzebub-swarm) ====================
  function createBeelzebubFxState(w, h) {
    const flyCount = 76;
    const flies = [];
    for (let i = 0; i < flyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitR = 40 + Math.random() * Math.max(w, h) * 0.46;
      flies.push({
        x: w * 0.5 + Math.cos(angle) * orbitR,
        y: h * 0.5 + Math.sin(angle) * orbitR,
        vx: (Math.random() - 0.5) * 3.5,
        vy: (Math.random() - 0.5) * 3.5,
        orbitR,
        orbitAngle: angle,
        orbitSpeed: (0.015 + Math.random() * 0.035) * (i % 2 === 0 ? 1 : -1),
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.25 + Math.random() * 0.35,
        size: 2.6 + Math.random() * 3.2,
        alpha: 0.65 + Math.random() * 0.35,
        isAggressive: i % 4 === 0,
        swayPhase: Math.random() * Math.PI * 2,
        swoopTimer: Math.random() * 100
      });
    }

    // 猩紅暴力血滴與撕裂血霧
    const bloodMist = [];
    for (let i = 0; i < 48; i++) {
      bloodMist.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        r: 1.5 + Math.random() * 3.5,
        alpha: 0.3 + Math.random() * 0.5,
        color: i % 3 === 0 ? "#ef4444" : i % 2 === 0 ? "#dc2626" : "#7f1d1d"
      });
    }

    return {
      flies,
      bloodMist,
      violentImpact: 0,
      slashLines: [],
      climaxPulse: 0
    };
  }

  function drawBeelzebubFlies(c, cx, cy, w, h, elapsed, isClimax, flies, alpha) {
    const flySpeedMul = isClimax ? 2.4 : 1.0;
    for (let i = 0; i < flies.length; i++) {
      const fly = flies[i];
      fly.orbitAngle += fly.orbitSpeed * flySpeedMul;
      fly.wingPhase += fly.wingSpeed * flySpeedMul;
      fly.swoopTimer += 0.05 * flySpeedMul;

      // 蒼蠅狂暴之字形走位 (Jitter & Swoop)
      const jitterX = Math.sin(fly.wingPhase * 5) * (isClimax ? 4.5 : 2.5);
      const jitterY = Math.cos(fly.wingPhase * 4) * (isClimax ? 4.5 : 2.5);
      const swoop = Math.sin(fly.swoopTimer) * (fly.isAggressive ? 35 : 15);

      const targetR = fly.orbitR + swoop;
      const targetX = cx + Math.cos(fly.orbitAngle) * targetR + jitterX;
      const targetY = cy + Math.sin(fly.orbitAngle) * (targetR * 0.68) + jitterY;

      fly.x += (targetX - fly.x) * 0.12;
      fly.y += (targetY - fly.y) * 0.12;

      c.save();
      c.translate(fly.x, fly.y);
      const moveAngle = fly.orbitAngle + (fly.orbitSpeed > 0 ? Math.PI / 2 : -Math.PI / 2);
      c.rotate(moveAngle);

      c.globalAlpha = fly.alpha * alpha;

      // 1. 蒼蠅翅膀（高頻微振幅半透明暗紅透光）
      const wingW = fly.size * 1.9;
      const wingH = fly.size * 0.85;
      const wingFlap = Math.sin(fly.wingPhase * 8) * 0.7;

      [-1, 1].forEach((dir) => {
        c.save();
        c.rotate(dir * (0.45 + wingFlap));
        c.fillStyle = fly.isAggressive ? "rgba(239, 68, 68, 0.55)" : "rgba(220, 38, 38, 0.4)";
        c.strokeStyle = "rgba(254, 202, 202, 0.75)";
        c.lineWidth = 0.8;
        c.beginPath();
        c.ellipse(dir * wingW * 0.55, -wingH * 0.7, wingW * 0.6, wingH * 0.5, dir * 0.2, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();
      });

      // 2. 蒼蠅軀幹（黑血腹部 + 黑曜胸節）
      c.fillStyle = "#0a0102";
      c.beginPath();
      c.ellipse(0, 0, fly.size * 0.7, fly.size * 1.1, 0, 0, Math.PI * 2);
      c.fill();

      // 3. 腹部血紋
      c.fillStyle = fly.isAggressive ? "#dc2626" : "#7f1d1d";
      c.beginPath();
      c.ellipse(0, fly.size * 0.35, fly.size * 0.55, fly.size * 0.65, 0, 0, Math.PI * 2);
      c.fill();

      // 4. 蒼蠅血紅複眼
      c.fillStyle = "#ef4444";
      c.shadowColor = "#f87171";
      c.shadowBlur = 4;
      c.beginPath();
      c.arc(-fly.size * 0.32, -fly.size * 0.65, fly.size * 0.28, 0, Math.PI * 2);
      c.arc(fly.size * 0.32, -fly.size * 0.65, fly.size * 0.28, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }
  }

  function renderBeelzebubFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const cx = w / 2;
    const cy = h / 2;
    const bz = st.beelzebub;
    if (!bz) return;

    // 1. 暴食血紅暴虐深淵天幕 (Blood-Gore Radial Void)
    const bloodGrad = c.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) * 0.78);
    bloodGrad.addColorStop(0, isClimax ? "#5c080b" : "#3b0507");
    bloodGrad.addColorStop(0.35, "#220305");
    bloodGrad.addColorStop(0.72, "#110102");
    bloodGrad.addColorStop(1, "#030001");
    c.fillStyle = bloodGrad;
    c.fillRect(0, 0, w, h);

    // 2. 原初屠掠魔神之印 (Rotating Visceral Demon Seal on floor)
    c.save();
    c.translate(cx, cy);
    c.rotate(elapsed * 0.0008);
    c.scale(1, 0.42); // 透視地表法陣
    c.strokeStyle = isClimax ? "rgba(239, 68, 68, 0.5)" : "rgba(185, 28, 28, 0.32)";
    c.lineWidth = 2.5;

    // 外圈魔神環
    const sealR = 210 + Math.sin(elapsed * 0.003) * 8;
    c.beginPath();
    c.arc(0, 0, sealR, 0, Math.PI * 2);
    c.stroke();

    // 內環倒五芒屠掠陣
    c.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = (k * 4 * Math.PI) / 5 + Math.PI / 2;
      const x = Math.cos(a) * sealR;
      const y = Math.sin(a) * sealR;
      if (k === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();
    c.restore();

    // 3. 猩紅血霧顆粒漩渦
    for (let i = 0; i < bz.bloodMist.length; i++) {
      const m = bz.bloodMist[i];
      m.x += m.vx;
      m.y += m.vy;
      if (m.x < 0) m.x = w;
      if (m.x > w) m.x = 0;
      if (m.y < 0) m.y = h;
      if (m.y > h) m.y = 0;

      c.save();
      c.globalAlpha = m.alpha * (isClimax ? 0.85 : 0.6);
      c.fillStyle = m.color;
      c.shadowColor = m.color;
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(m.x, m.y, m.r * (isClimax ? 1.4 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 4. 暴力撕裂血痕 (Violent Blood Slashes)
    if (bz.violentImpact > 0.01) {
      bz.violentImpact *= 0.91;
      c.save();
      c.globalAlpha = Math.min(1, bz.violentImpact * 1.5);
      for (let s = 0; s < 4; s++) {
        const offset = (s - 1.5) * 55;
        c.strokeStyle = s % 2 === 0 ? "#ffffff" : "#ef4444";
        c.shadowColor = "#dc2626";
        c.shadowBlur = 24;
        c.lineWidth = (4.5 - s * 0.8) * bz.violentImpact;
        c.beginPath();
        c.moveTo(cx - 320 + offset, cy - 180 - offset * 0.5);
        c.lineTo(cx + 320 + offset, cy + 180 + offset * 0.5);
        c.stroke();
      }
      c.restore();
    }

    // 5. 萬千蒼蠅狂暴群舞 (Flies Swarm)
    drawBeelzebubFlies(c, cx, cy, w, h, elapsed, isClimax, bz.flies, 1);

    // 6. 高潮魔神毀滅血環脈衝 (Climax Blood Pulses)
    if (isClimax) {
      const pulseR = ((elapsed * 0.22) % 360) + 30;
      c.save();
      c.globalAlpha = (1 - pulseR / 390) * 0.65;
      c.strokeStyle = "#dc2626";
      c.lineWidth = 4;
      c.beginPath();
      c.arc(cx, cy, pulseR, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    // 7. 震波碎屑與暗角
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha *= 0.93;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#ef4444";
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
    }

    // 8. 暴虐暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.28, cx, cy, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 0, 0, 0.92)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 降臨級 尤諾拉 倪克斯 專屬畫面：月亮與星空風 (nyx-moon-stars) ====================
  function createNyxFxState(w, h) {
    const starCount = 130;
    const stars = [];
    const colors = ["#ffffff", "#e0f2fe", "#bae6fd", "#c7d2fe", "#fdf4ff"];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.2,
        alpha: 0.35 + Math.random() * 0.65,
        twinkleSpeed: 0.002 + Math.random() * 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
        isMajor: i < 18
      });
    }

    // 5 顆流星群
    const shootingStars = [];
    for (let i = 0; i < 5; i++) {
      shootingStars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.5),
        len: 80 + Math.random() * 120,
        speed: 12 + Math.random() * 10,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.25,
        alpha: 0,
        active: false,
        timer: Math.random() * 120 + i * 40
      });
    }

    // 6 團深邃星雲星塵
    const nebula = [];
    const nebColors = [
      "rgba(30, 27, 75, 0.45)",
      "rgba(15, 23, 42, 0.55)",
      "rgba(56, 189, 248, 0.14)",
      "rgba(99, 102, 241, 0.22)",
      "rgba(147, 51, 234, 0.16)",
      "rgba(2, 6, 23, 0.65)"
    ];
    for (let i = 0; i < 6; i++) {
      nebula.push({
        x: (w * 0.2) + Math.random() * (w * 0.6),
        y: (h * 0.15) + Math.random() * (h * 0.7),
        rx: 120 + Math.random() * 180,
        ry: 80 + Math.random() * 120,
        color: nebColors[i],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.0004
      });
    }

    // 星座連線組（挑選前 16 顆主要星宿組成四條星座線條）
    const constellationEdges = [
      [0, 1], [1, 2], [2, 3], [3, 4], // 仙后星軌
      [5, 6], [6, 7], [7, 8], [8, 5], // 天琴四邊形
      [9, 10], [10, 11], [11, 12],     // 獵戶腰帶弧光
      [13, 14], [14, 15]               // 月華雙子星
    ];

    return {
      stars,
      shootingStars,
      nebula,
      constellationEdges,
      swordImpact: 0,
      moonGlowPulse: 0
    };
  }

  function drawNyxMoon(c, cx, cy, w, h, elapsed, isClimax, alpha) {
    const mx = cx;
    const my = cy - Math.min(h * 0.22, 115);
    const mr = isClimax ? 66 : 52;
    const pulse = 1 + Math.sin(elapsed * 0.0025) * 0.04;

    c.save();
    c.globalAlpha = alpha;

    // 1. 滿月外層巨大幽夜大氣月華光環 (Multi-layered Radial Halo)
    const haloR = mr * (isClimax ? 4.2 : 3.4) * pulse;
    const haloGrad = c.createRadialGradient(mx, my, mr * 0.8, mx, my, haloR);
    haloGrad.addColorStop(0, isClimax ? "rgba(56, 189, 248, 0.5)" : "rgba(56, 189, 248, 0.32)");
    haloGrad.addColorStop(0.35, isClimax ? "rgba(129, 140, 248, 0.28)" : "rgba(99, 102, 241, 0.18)");
    haloGrad.addColorStop(0.7, "rgba(30, 27, 75, 0.12)");
    haloGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
    c.fillStyle = haloGrad;
    c.beginPath();
    c.arc(mx, my, haloR, 0, Math.PI * 2);
    c.fill();

    // 2. 月夜空靈天體銀環 (Celestial Orbital Silver Ring)
    c.save();
    c.translate(mx, my);
    c.rotate(-0.35 + Math.sin(elapsed * 0.0008) * 0.05);
    c.scale(1, 0.32);
    c.strokeStyle = isClimax ? "rgba(224, 242, 254, 0.7)" : "rgba(186, 230, 253, 0.45)";
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(0, 0, mr * 2.3 * pulse, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // 3. 高潮時從明月向下投射的皎潔月光神聖光芒瀑布 (8 Moonlight Beams)
    if (isClimax) {
      for (let b = 0; b < 8; b++) {
        const bAngle = (b - 3.5) * 0.16 + Math.PI / 2;
        const bLen = h * 0.85;
        const bWidth = 24 + (b % 3) * 12;
        c.save();
        c.globalAlpha = 0.28 + Math.sin(elapsed * 0.003 + b) * 0.12;
        const beamGrad = c.createLinearGradient(mx, my, mx + Math.cos(bAngle) * bLen, my + Math.sin(bAngle) * bLen);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        beamGrad.addColorStop(0.35, "rgba(56, 189, 248, 0.35)");
        beamGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
        c.fillStyle = beamGrad;
        c.beginPath();
        c.moveTo(mx - bWidth * 0.2, my);
        c.lineTo(mx + bWidth * 0.2, my);
        c.lineTo(mx + Math.cos(bAngle) * bLen + bWidth, my + Math.sin(bAngle) * bLen);
        c.lineTo(mx + Math.cos(bAngle) * bLen - bWidth, my + Math.sin(bAngle) * bLen);
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    // 4. 明月本體 (皎潔銀白到冰晶天青漸層)
    const moonGrad = c.createRadialGradient(mx - mr * 0.32, my - mr * 0.32, mr * 0.1, mx, my, mr);
    moonGrad.addColorStop(0, "#ffffff");
    moonGrad.addColorStop(0.45, "#f0f9ff");
    moonGrad.addColorStop(0.8, "#bae6fd");
    moonGrad.addColorStop(1, "#7dd3fc");
    c.fillStyle = moonGrad;
    c.shadowColor = "#38bdf8";
    c.shadowBlur = isClimax ? 38 : 24;
    c.beginPath();
    c.arc(mx, my, mr, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;

    // 5. 月海微光紋理 (Subtle Lunar Maria)
    c.fillStyle = "rgba(15, 23, 42, 0.18)";
    [
      [-mr * 0.25, -mr * 0.1, mr * 0.26],
      [mr * 0.18, -mr * 0.22, mr * 0.22],
      [-mr * 0.05, mr * 0.24, mr * 0.3],
      [mr * 0.28, mr * 0.15, mr * 0.2]
    ].forEach(([cxo, cyo, cr]) => {
      c.beginPath();
      c.arc(mx + cxo, my + cyo, cr, 0, Math.PI * 2);
      c.fill();
    });

    // 6. 新月邊緣璀璨反光
    c.strokeStyle = "rgba(255, 255, 255, 0.9)";
    c.lineWidth = 2.2;
    c.beginPath();
    c.arc(mx, my, mr - 1, -Math.PI * 0.6, Math.PI * 0.3);
    c.stroke();

    c.restore();
  }

  function drawNyxConstellations(c, w, h, stars, edges, elapsed, alpha) {
    c.save();
    c.globalAlpha = alpha * 0.55;
    c.strokeStyle = "rgba(186, 230, 253, 0.45)";
    c.lineWidth = 1.0;

    for (let i = 0; i < edges.length; i++) {
      const [idxA, idxB] = edges[i];
      if (idxA < stars.length && idxB < stars.length) {
        const sA = stars[idxA];
        const sB = stars[idxB];
        c.beginPath();
        c.moveTo(sA.x, sA.y);
        c.lineTo(sB.x, sB.y);
        c.stroke();
      }
    }

    // 主要星座節點菱形十字光芒
    for (let i = 0; i < 16 && i < stars.length; i++) {
      const st = stars[i];
      const sparkR = st.r * (1.6 + Math.sin(elapsed * st.twinkleSpeed * 3 + st.twinklePhase) * 0.6);
      c.strokeStyle = "rgba(224, 242, 254, 0.75)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(st.x - sparkR * 2.5, st.y);
      c.lineTo(st.x + sparkR * 2.5, st.y);
      c.moveTo(st.x, st.y - sparkR * 2.5);
      c.lineTo(st.x, st.y + sparkR * 2.5);
      c.stroke();
    }

    c.restore();
  }

  function drawNyxSwordSilhouette(c, cx, cy, scale, alpha) {
    c.save();
    c.translate(cx, cy);
    c.scale(scale, scale);
    c.globalAlpha = alpha;

    // -星輝浮光－月之劍- 晶瑩星藍與純銀劍體
    // 1. 劍身神聖外暈
    c.shadowColor = "#38bdf8";
    c.shadowBlur = 24;

    // 2. 細長晶瑩劍刃
    const swordGrad = c.createLinearGradient(0, -180, 0, 90);
    swordGrad.addColorStop(0, "#ffffff");
    swordGrad.addColorStop(0.4, "#bae6fd");
    swordGrad.addColorStop(0.8, "#38bdf8");
    swordGrad.addColorStop(1, "#1e1b4b");
    c.fillStyle = swordGrad;
    c.beginPath();
    c.moveTo(0, -180);
    c.lineTo(7, -130);
    c.lineTo(5, 70);
    c.lineTo(0, 90);
    c.lineTo(-5, 70);
    c.lineTo(-7, -130);
    c.closePath();
    c.fill();

    // 3. 劍身中央晶藍光紋
    c.strokeStyle = "#ffffff";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, -170);
    c.lineTo(0, 75);
    c.stroke();

    // 4. 新月護手 (Crescent Guard)
    c.strokeStyle = "#e0f2fe";
    c.lineWidth = 3.5;
    c.beginPath();
    c.arc(0, 72, 34, Math.PI * 0.8, Math.PI * 2.2);
    c.stroke();

    // 5. 護手核心月華星辰寶石
    c.fillStyle = "#ffffff";
    c.shadowColor = "#60a5fa";
    c.shadowBlur = 18;
    c.beginPath();
    c.arc(0, 72, 6.5, 0, Math.PI * 2);
    c.fill();

    // 6. 劍柄與星鑽劍首
    c.strokeStyle = "#93c5fd";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(0, 78);
    c.lineTo(0, 125);
    c.stroke();

    c.fillStyle = "#38bdf8";
    c.beginPath();
    c.arc(0, 128, 7, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function renderNyxFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const cx = w / 2;
    const cy = h / 2;
    const nyx = st.nyx;
    if (!nyx) return;

    // 1. 深邃星空幽夜天幕 (Deep Midnight Celestial Void)
    const skyGrad = c.createRadialGradient(cx, cy * 0.65, 30, cx, cy, Math.max(w, h) * 0.85);
    skyGrad.addColorStop(0, isClimax ? "#1e1b4b" : "#0f172a");
    skyGrad.addColorStop(0.42, "#090d24");
    skyGrad.addColorStop(0.78, "#040714");
    skyGrad.addColorStop(1, "#010208");
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, h);

    // 2. 柔和深邃星雲流動 (Flowing Nebula Clouds)
    for (let i = 0; i < nyx.nebula.length; i++) {
      const neb = nyx.nebula[i];
      neb.rot += neb.rotSpeed;
      c.save();
      c.translate(neb.x, neb.y);
      c.rotate(neb.rot);
      const ng = c.createRadialGradient(0, 0, 10, 0, 0, neb.rx);
      ng.addColorStop(0, neb.color);
      ng.addColorStop(1, "rgba(2, 6, 23, 0)");
      c.fillStyle = ng;
      c.beginPath();
      c.ellipse(0, 0, neb.rx, neb.ry, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 3. 流星劃破天際 (Shooting Stars)
    for (let i = 0; i < nyx.shootingStars.length; i++) {
      const ss = nyx.shootingStars[i];
      if (!ss.active) {
        ss.timer--;
        if (ss.timer <= 0) {
          ss.active = true;
          ss.x = Math.random() * (w * 0.75);
          ss.y = Math.random() * (h * 0.45);
          ss.alpha = 0.9;
        }
      } else {
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha *= 0.94;
        if (ss.alpha <= 0.04) {
          ss.active = false;
          ss.timer = 60 + Math.random() * 140;
        } else {
          c.save();
          c.globalAlpha = ss.alpha;
          const tailX = ss.x - Math.cos(ss.angle) * ss.len;
          const tailY = ss.y - Math.sin(ss.angle) * ss.len;
          const ssGrad = c.createLinearGradient(tailX, tailY, ss.x, ss.y);
          ssGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
          ssGrad.addColorStop(0.7, "rgba(186, 230, 253, 0.65)");
          ssGrad.addColorStop(1, "#ffffff");
          c.strokeStyle = ssGrad;
          c.lineWidth = 1.8;
          c.beginPath();
          c.moveTo(tailX, tailY);
          c.lineTo(ss.x, ss.y);
          c.stroke();
          c.restore();
        }
      }
    }

    // 4. 繁星閃爍 (Twinkling Stars)
    for (let i = 0; i < nyx.stars.length; i++) {
      const s = nyx.stars[i];
      const curAlpha = s.alpha * (0.65 + Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase) * 0.35);
      c.save();
      c.globalAlpha = curAlpha * (isClimax ? 1 : 0.85);
      c.fillStyle = s.color;
      if (s.isMajor) {
        c.shadowColor = s.color;
        c.shadowBlur = 8;
      }
      c.beginPath();
      c.arc(s.x, s.y, s.r * (isClimax ? 1.25 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 5. 璀璨星座連線 (Constellation Charts)
    drawNyxConstellations(c, w, h, nyx.stars, nyx.constellationEdges, elapsed, isClimax ? 0.9 : 0.65);

    // 6. 皎潔明月與月華神聖光瀑 (Celestial Moon & Coronas)
    drawNyxMoon(c, cx, cy, w, h, elapsed, isClimax, 1);

    // 7. -星輝浮光－月之劍- 虛影顯現（當文字重擊或高潮時）
    if (nyx.swordImpact > 0.01) {
      nyx.swordImpact *= 0.92;
      const sScale = 0.88 + nyx.swordImpact * 0.45;
      const sY = cy - 10 + (1 - nyx.swordImpact) * 20;
      drawNyxSwordSilhouette(c, cx, sY, sScale, Math.min(0.95, nyx.swordImpact * 1.35));
    } else if (isClimax) {
      const climSwordAlpha = 0.45 + Math.sin(elapsed * 0.003) * 0.2;
      drawNyxSwordSilhouette(c, cx, cy + 15, 0.95, climSwordAlpha);
    }

    // 8. 星塵震波碎屑與水波月華
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha *= 0.94;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.save();
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#bae6fd";
      c.shadowColor = "#38bdf8";
      c.shadowBlur = 6;
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 9. 幽夜星空暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.32, cx, cy, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(1, 2, 8, 0.9)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 降臨級 迪米諾拉 赫墨拉 專屬畫面：烈陽風格 (hemera-sun) ====================
  function createHemeraFxState(w, h) {
    const particleCount = 88;
    const solarParticles = [];
    const colors = ["#ffffff", "#fef08a", "#fde047", "#f59e0b", "#ea580c", "#dc2626"];
    for (let i = 0; i < particleCount; i++) {
      solarParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.8,
        vy: -1.2 - Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 1.8,
        swaySpeed: 0.003 + Math.random() * 0.004,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.6,
        color: colors[i % colors.length]
      });
    }

    // 16 道烈陽耀斑放射光芒
    const solarRays = [];
    for (let i = 0; i < 16; i++) {
      solarRays.push({
        angle: (i / 16) * Math.PI * 2,
        len: 120 + Math.random() * 80,
        width: 14 + (i % 3) * 8,
        speed: 0.0012 * (i % 2 === 0 ? 1 : -1),
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // 8 條日珥電漿噴發環 (Coronal Prominences)
    const prominences = [];
    for (let i = 0; i < 8; i++) {
      prominences.push({
        angle: (i / 8) * Math.PI * 2 + Math.random() * 0.3,
        height: 28 + Math.random() * 38,
        width: 32 + Math.random() * 24,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.002
      });
    }

    return {
      solarParticles,
      solarRays,
      prominences,
      spearImpact: 0,
      coronaPulse: 0
    };
  }

  function drawHemeraProminences(c, sx, sy, sr, prominences, elapsed, isClimax, alpha) {
    c.save();
    c.globalAlpha = alpha * (isClimax ? 0.95 : 0.75);
    for (let i = 0; i < prominences.length; i++) {
      const p = prominences[i];
      const hMul = isClimax ? 1.5 : 1.0;
      const curH = (p.height + Math.sin(elapsed * p.speed + p.phase) * 12) * hMul;
      const midAngle = p.angle + Math.sin(elapsed * 0.001 + i) * 0.1;
      const baseA1 = midAngle - 0.18;
      const baseA2 = midAngle + 0.18;

      const x1 = sx + Math.cos(baseA1) * sr;
      const y1 = sy + Math.sin(baseA1) * sr;
      const x2 = sx + Math.cos(baseA2) * sr;
      const y2 = sy + Math.sin(baseA2) * sr;
      const topX = sx + Math.cos(midAngle) * (sr + curH);
      const topY = sy + Math.sin(midAngle) * (sr + curH);

      c.save();
      c.strokeStyle = i % 2 === 0 ? "rgba(245, 158, 11, 0.85)" : "rgba(234, 88, 12, 0.85)";
      c.lineWidth = 3.5 * (isClimax ? 1.3 : 1);
      c.shadowColor = "#f59e0b";
      c.shadowBlur = 14;
      c.beginPath();
      c.moveTo(x1, y1);
      c.quadraticCurveTo(topX, topY, x2, y2);
      c.stroke();
      c.restore();
    }
    c.restore();
  }

  function drawHemeraSun(c, cx, cy, w, h, elapsed, isClimax, alpha) {
    const sx = cx;
    const sy = cy - Math.min(h * 0.22, 115);
    const sr = isClimax ? 70 : 54;
    const pulse = 1 + Math.sin(elapsed * 0.0035) * 0.05;

    c.save();
    c.globalAlpha = alpha;

    // 1. 巨大烈陽電漿耀斑熱暈 (Colossal Solar Corona)
    const haloR = sr * (isClimax ? 4.5 : 3.6) * pulse;
    const coronaGrad = c.createRadialGradient(sx, sy, sr * 0.8, sx, sy, haloR);
    coronaGrad.addColorStop(0, isClimax ? "rgba(254, 240, 138, 0.65)" : "rgba(245, 158, 11, 0.45)");
    coronaGrad.addColorStop(0.3, isClimax ? "rgba(245, 158, 11, 0.45)" : "rgba(234, 88, 12, 0.32)");
    coronaGrad.addColorStop(0.65, "rgba(124, 45, 18, 0.18)");
    coronaGrad.addColorStop(1, "rgba(26, 5, 0, 0)");
    c.fillStyle = coronaGrad;
    c.beginPath();
    c.arc(sx, sy, haloR, 0, Math.PI * 2);
    c.fill();

    // 2. 旋轉烈陽金芒光刃 (Rotating Solar Sunburst Rays)
    const rayRot = elapsed * 0.0008;
    const rayCount = 16;
    for (let r = 0; r < rayCount; r++) {
      const a = rayRot + (r * Math.PI * 2) / rayCount;
      const rayLen = sr * (isClimax ? 2.8 : 2.2) + Math.sin(elapsed * 0.004 + r) * 14;
      const rayHalfW = 10 + (r % 3) * 6;
      c.save();
      c.translate(sx, sy);
      c.rotate(a);
      c.globalAlpha = (isClimax ? 0.42 : 0.26) + Math.sin(elapsed * 0.003 + r) * 0.1;
      const rg = c.createLinearGradient(0, 0, rayLen, 0);
      rg.addColorStop(0, "#ffffff");
      rg.addColorStop(0.3, "#fef08a");
      rg.addColorStop(0.7, "#f59e0b");
      rg.addColorStop(1, "rgba(234, 88, 12, 0)");
      c.fillStyle = rg;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(rayLen, -rayHalfW);
      c.lineTo(rayLen * 1.08, 0);
      c.lineTo(rayLen, rayHalfW);
      c.closePath();
      c.fill();
      c.restore();
    }

    // 3. 高潮時貫穿全場的「終焉日冕」萬道烈目光瀑 (12 Blinding Solar Cascade Beams)
    if (isClimax) {
      for (let b = 0; b < 12; b++) {
        const bAngle = (b - 5.5) * 0.14 + Math.PI / 2;
        const bLen = h * 0.9;
        const bWidth = 28 + (b % 4) * 14;
        c.save();
        c.globalAlpha = 0.35 + Math.sin(elapsed * 0.004 + b) * 0.15;
        const beamGrad = c.createLinearGradient(sx, sy, sx + Math.cos(bAngle) * bLen, sy + Math.sin(bAngle) * bLen);
        beamGrad.addColorStop(0, "#ffffff");
        beamGrad.addColorStop(0.3, "rgba(254, 240, 138, 0.75)");
        beamGrad.addColorStop(0.65, "rgba(245, 158, 11, 0.45)");
        beamGrad.addColorStop(1, "rgba(69, 26, 3, 0)");
        c.fillStyle = beamGrad;
        c.beginPath();
        c.moveTo(sx - bWidth * 0.25, sy);
        c.lineTo(sx + bWidth * 0.25, sy);
        c.lineTo(sx + Math.cos(bAngle) * bLen + bWidth, sy + Math.sin(bAngle) * bLen);
        c.lineTo(sx + Math.cos(bAngle) * bLen - bWidth, sy + Math.sin(bAngle) * bLen);
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    // 4. 烈陽核聚變核心本體 (Blinding White-Gold Solar Sphere)
    const sunGrad = c.createRadialGradient(sx - sr * 0.28, sy - sr * 0.28, sr * 0.1, sx, sy, sr);
    sunGrad.addColorStop(0, "#ffffff");
    sunGrad.addColorStop(0.35, "#fef9c3");
    sunGrad.addColorStop(0.68, "#fde047");
    sunGrad.addColorStop(0.88, "#f59e0b");
    sunGrad.addColorStop(1, "#ea580c");
    c.fillStyle = sunGrad;
    c.shadowColor = "#f59e0b";
    c.shadowBlur = isClimax ? 46 : 28;
    c.beginPath();
    c.arc(sx, sy, sr, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;

    // 5. 太陽黑子與熾熱日耀紋理 (Solar Granulation & Sunspots)
    c.fillStyle = "rgba(124, 45, 18, 0.22)";
    [
      [-sr * 0.22, -sr * 0.14, sr * 0.18],
      [sr * 0.25, -sr * 0.18, sr * 0.15],
      [-sr * 0.08, sr * 0.25, sr * 0.24],
      [sr * 0.18, sr * 0.18, sr * 0.16]
    ].forEach(([cxo, cyo, cr]) => {
      c.beginPath();
      c.arc(sx + cxo, sy + cyo, cr, 0, Math.PI * 2);
      c.fill();
    });

    // 6. 白熾日緣耀斑光弧
    c.strokeStyle = "rgba(255, 255, 255, 0.95)";
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(sx, sy, sr - 1.2, -Math.PI * 0.8, Math.PI * 0.2);
    c.stroke();

    c.restore();
  }

  function drawHemeraSolarSpear(c, cx, cy, scale, alpha) {
    c.save();
    c.translate(cx, cy);
    c.scale(scale, scale);
    c.globalAlpha = alpha;

    // -天輝浮光－日之矛- 烈陽黃金耀斑神矛
    // 1. 烈陽外暈
    c.shadowColor = "#f59e0b";
    c.shadowBlur = 28;

    // 2. 矛刃本體（熾熱黃金白熾矛頭）
    const spearGrad = c.createLinearGradient(0, -195, 0, 80);
    spearGrad.addColorStop(0, "#ffffff");
    spearGrad.addColorStop(0.35, "#fef08a");
    spearGrad.addColorStop(0.75, "#f59e0b");
    spearGrad.addColorStop(1, "#b45309");
    c.fillStyle = spearGrad;
    c.beginPath();
    c.moveTo(0, -195);
    c.lineTo(11, -135);
    c.lineTo(7, 60);
    c.lineTo(0, 80);
    c.lineTo(-7, 60);
    c.lineTo(-11, -135);
    c.closePath();
    c.fill();

    // 3. 矛頭中央熾熱光脊
    c.strokeStyle = "#ffffff";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(0, -185);
    c.lineTo(0, 65);
    c.stroke();

    // 4. 太陽日輪雙翼護手 (Solar Sunburst Wings Guard)
    c.strokeStyle = "#fde047";
    c.lineWidth = 3.5;
    c.beginPath();
    c.arc(0, 62, 38, -Math.PI * 0.2, Math.PI * 1.2);
    c.stroke();

    // 5. 護手核心日耀紅寶石日冕
    c.fillStyle = "#ffffff";
    c.shadowColor = "#ea580c";
    c.shadowBlur = 22;
    c.beginPath();
    c.arc(0, 62, 7.5, 0, Math.PI * 2);
    c.fill();

    // 6. 矛柄與烈陽金鑽矛尾
    c.strokeStyle = "#f59e0b";
    c.lineWidth = 4.5;
    c.beginPath();
    c.moveTo(0, 70);
    c.lineTo(0, 135);
    c.stroke();

    c.fillStyle = "#dc2626";
    c.beginPath();
    c.arc(0, 138, 7.5, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  function renderHemeraFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const cx = w / 2;
    const cy = h / 2;
    const hemera = st.hemera;
    if (!hemera) return;

    // 1. 烈陽焦灼天幕 (Scorched Amber-Crimson Solar Void)
    const skyGrad = c.createRadialGradient(cx, cy * 0.65, 30, cx, cy, Math.max(w, h) * 0.85);
    skyGrad.addColorStop(0, isClimax ? "#7c2d12" : "#451a03");
    skyGrad.addColorStop(0.42, "#361002");
    skyGrad.addColorStop(0.78, "#1f0701");
    skyGrad.addColorStop(1, "#0a0200");
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, h);

    // 2. 熾熱空氣熱浪波紋 (Heat Waves / Atmospheric Mirage Shimmer)
    for (let i = 0; i < 5; i++) {
      const wy = h * 0.25 + i * (h * 0.14);
      c.save();
      c.globalAlpha = 0.08 + Math.sin(elapsed * 0.003 + i) * 0.04;
      c.fillStyle = i % 2 === 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(234, 88, 12, 0.35)";
      c.beginPath();
      c.moveTo(0, wy);
      for (let x = 0; x <= w; x += 30) {
        const offset = Math.sin(elapsed * 0.004 + x * 0.015 + i) * 8;
        c.lineTo(x, wy + offset);
      }
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();
      c.restore();
    }

    // 3. 烈陽電漿火星粒子向上奔湧 (Upward Solar Plasma Embers)
    const partSpeed = isClimax ? 2.3 : isUp ? 1.4 : 1.0;
    for (let i = 0; i < hemera.solarParticles.length; i++) {
      const sp = hemera.solarParticles[i];
      sp.y += sp.vy * partSpeed;
      sp.x += Math.sin(elapsed * sp.swaySpeed + sp.swayPhase) * 1.5;
      if (sp.y < -30) {
        sp.y = h + Math.random() * 40;
        sp.x = Math.random() * w;
      }
      c.save();
      c.globalAlpha = sp.alpha * (isClimax ? 1 : 0.85);
      c.fillStyle = sp.color;
      c.shadowColor = sp.color;
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(sp.x, sp.y, sp.r * (isClimax ? 1.3 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 4. 日珥電漿噴發拱弧 (Coronal Prominences)
    const sx = cx;
    const sy = cy - Math.min(h * 0.22, 115);
    const sr = isClimax ? 70 : 54;
    drawHemeraProminences(c, sx, sy, sr, hemera.prominences, elapsed, isClimax, 1);

    // 5. 熾熱烈陽本體與日耀金芒 (Blazing Sun Disc & Sunburst Rays)
    drawHemeraSun(c, cx, cy, w, h, elapsed, isClimax, 1);

    // 6. -天輝浮光－日之矛- 烈陽神矛顯現（重擊或高潮時）
    if (hemera.spearImpact > 0.01) {
      hemera.spearImpact *= 0.92;
      const sScale = 0.9 + hemera.spearImpact * 0.45;
      const sY = cy - 10 + (1 - hemera.spearImpact) * 22;
      drawHemeraSolarSpear(c, cx, sY, sScale, Math.min(0.96, hemera.spearImpact * 1.4));
    } else if (isClimax) {
      const climSpearAlpha = 0.5 + Math.sin(elapsed * 0.0035) * 0.22;
      drawHemeraSolarSpear(c, cx, cy + 15, 0.98, climSpearAlpha);
    }

    // 7. 烈陽爆破碎屑與金色衝擊光環
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha *= 0.94;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.save();
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#fef08a";
      c.shadowColor = "#f59e0b";
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 8. 烈陽焦灼暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.32, cx, cy, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(10, 2, 0, 0.92)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 降臨級 萊夫維芙 專屬畫面：生意盎然・原初生命女神 (lifeweaver-verdant) ====================
  function createLifeweaverFxState(w, h) {
    const sporeCount = 96;
    const spores = [];
    const colors = ["#ffffff", "#dcfce7", "#86efac", "#4ade80", "#22c55e", "#fef08a", "#a7f3d0"];
    for (let i = 0; i < sporeCount; i++) {
      spores.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.8,
        vy: -(0.6 + Math.random() * 1.6),
        swaySpeed: 0.0018 + Math.random() * 0.0028,
        swayPhase: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
        alpha: 0.35 + Math.random() * 0.65
      });
    }

    const petalCount = 38;
    const petals = [];
    const petalColors = ["#86efac", "#a7f3d0", "#6ee7b7", "#fbcfe8", "#f472b6", "#fde047", "#ffffff"];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 5 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        orbitRadius: 40 + Math.random() * Math.max(w, h) * 0.45,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (0.006 + Math.random() * 0.012) * (i % 2 === 0 ? 1 : -1),
        color: petalColors[i % petalColors.length],
        alpha: 0.45 + Math.random() * 0.55
      });
    }

    const vines = [];
    const vineCount = 8;
    for (let i = 0; i < vineCount; i++) {
      vines.push({
        baseAngle: (i / vineCount) * Math.PI * 2,
        rotSpeed: (0.0008 + (i % 3) * 0.0004) * (i % 2 === 0 ? 1 : -1),
        maxDist: Math.max(w, h) * 0.52,
        leafCount: 9 + (i % 3) * 2,
        color: i % 2 === 0 ? "#34d399" : "#4ade80",
        veinColor: "#fef08a"
      });
    }

    return {
      spores,
      petals,
      vines,
      sproutPulse: 0,
      bloomProgress: 0
    };
  }

  function drawLifeweaverLeaf(c, x, y, angle, scale, alpha, baseColor, veinColor) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(scale, scale);
    c.globalAlpha = alpha;

    // 葉面本體 (翠綠水滴形曲線)
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(12, -8, 22, 0);
    c.quadraticCurveTo(12, 8, 0, 0);
    c.closePath();
    const lGrad = c.createLinearGradient(0, -6, 22, 6);
    lGrad.addColorStop(0, "#86efac");
    lGrad.addColorStop(0.5, baseColor || "#22c55e");
    lGrad.addColorStop(1, "#065f46");
    c.fillStyle = lGrad;
    c.fill();
    c.strokeStyle = "rgba(255, 255, 255, 0.45)";
    c.lineWidth = 1;
    c.stroke();

    // 金色神聖葉脈 (Golden Sacred Leaf Vein)
    c.beginPath();
    c.moveTo(2, 0);
    c.lineTo(19, 0);
    c.strokeStyle = veinColor || "#fef08a";
    c.lineWidth = 1.2;
    c.stroke();

    c.restore();
  }

  function drawLifeweaverVines(c, cx, cy, vines, elapsed, isClimax, growthProgress) {
    c.save();
    const activeGrowth = isClimax ? 1 : Math.min(1, Math.max(0.15, growthProgress));

    vines.forEach((v, vIdx) => {
      const currentAngle = v.baseAngle + elapsed * v.rotSpeed;
      const points = [];
      const steps = 32;
      const maxLen = v.maxDist * activeGrowth;

      // 螺旋生長曲線 (Archimedean organic growth path)
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const r = t * maxLen;
        const theta = currentAngle + Math.sin(t * Math.PI * 1.5 + elapsed * 0.002 + vIdx) * 0.45 + t * 0.8;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;
        points.push({ x: px, y: py, r, t, theta });
      }

      // 繪製藤蔓主幹
      c.beginPath();
      c.moveTo(points[0].x, points[0].y);
      for (let p = 1; p < points.length; p++) {
        c.lineTo(points[p].x, points[p].y);
      }
      c.strokeStyle = v.color;
      c.lineWidth = Math.max(1.5, 4.5 * (1 - activeGrowth * 0.35));
      c.shadowColor = v.color;
      c.shadowBlur = 10;
      c.stroke();

      // 在藤蔓節點處綻放翠葉 (Unfurling Leaves along the vine)
      const leafStep = Math.max(2, Math.floor(steps / v.leafCount));
      for (let l = leafStep; l < points.length - 1; l += leafStep) {
        const pt = points[l];
        const nextPt = points[l + 1];
        const segAngle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);
        const lScale = (0.7 + (l / steps) * 0.5) * (isClimax ? 1.2 : 1.0);
        // 左右交錯長葉
        const side = (l / leafStep) % 2 === 0 ? 1 : -1;
        const leafAngle = segAngle + (Math.PI / 3) * side;
        drawLifeweaverLeaf(c, pt.x, pt.y, leafAngle, lScale, 0.9, v.color, v.veinColor);
      }

      // 藤蔓尖端嫩芽光球 (Sprouting Tip Bud)
      const tip = points[points.length - 1];
      c.beginPath();
      c.arc(tip.x, tip.y, 4.5 + Math.sin(elapsed * 0.006 + vIdx) * 1.8, 0, Math.PI * 2);
      c.fillStyle = "#fef08a";
      c.shadowColor = "#86efac";
      c.shadowBlur = 14;
      c.fill();
    });

    c.restore();
  }

  function drawLifeweaverMandala(c, cx, cy, elapsed, isClimax, alpha) {
    c.save();
    c.translate(cx, cy);
    c.globalAlpha = alpha;

    const baseR = isClimax ? 90 : 68;
    const pulse = 1 + Math.sin(elapsed * 0.0035) * 0.06;
    const rot = elapsed * 0.0006;

    // 1. 外層神聖生命之輪 12 瓣蓮華法陣 (12-Petaled Sacred Lotus)
    c.save();
    c.rotate(rot);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(18, baseR * 0.6 * pulse, 0, baseR * pulse);
      c.quadraticCurveTo(-18, baseR * 0.6 * pulse, 0, 0);
      c.closePath();
      c.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.18)" : "rgba(254, 240, 138, 0.22)";
      c.fill();
      c.strokeStyle = "rgba(134, 239, 172, 0.75)";
      c.lineWidth = 1.4;
      c.stroke();
      c.restore();
    }
    c.restore();

    // 2. 逆向旋轉內層 8 葉生命幾何環 (Inner 8-Petal Geometry)
    c.save();
    c.rotate(-rot * 1.4);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(14, baseR * 0.35, 0, baseR * 0.6);
      c.quadraticCurveTo(-14, baseR * 0.35, 0, 0);
      c.closePath();
      c.fillStyle = "rgba(254, 240, 138, 0.35)";
      c.fill();
      c.strokeStyle = "#86efac";
      c.lineWidth = 1.2;
      c.stroke();
      c.restore();
    }
    c.restore();

    // 3. 幾何光環同心圓 (Concentric Golden Life Rings)
    [baseR * 0.45, baseR * 0.82, baseR * 1.15].forEach((r, idx) => {
      c.beginPath();
      c.arc(0, 0, r * pulse, 0, Math.PI * 2);
      c.strokeStyle = idx === 1 ? "rgba(254, 240, 138, 0.65)" : "rgba(74, 222, 128, 0.45)";
      c.lineWidth = idx === 1 ? 2.0 : 1.2;
      c.stroke();
    });

    // 4. 原初生命之種核心靈光 (Central Sprouting Seed of Genesis)
    const seedGrad = c.createRadialGradient(0, 0, 2, 0, 0, 28 * pulse);
    seedGrad.addColorStop(0, "#ffffff");
    seedGrad.addColorStop(0.35, "#fef08a");
    seedGrad.addColorStop(0.7, "#4ade80");
    seedGrad.addColorStop(1, "rgba(6, 78, 59, 0)");
    c.beginPath();
    c.arc(0, 0, 28 * pulse, 0, Math.PI * 2);
    c.fillStyle = seedGrad;
    c.shadowColor = "#86efac";
    c.shadowBlur = 24;
    c.fill();

    // 5. 原初神言銘刻光符 (Floating Life Runes: 生命・創造・生機・永恆)
    const runes = ["生", "命", "創", "造", "生", "者", "永", "恆"];
    c.save();
    c.rotate(rot * 0.7);
    c.font = "bold 13px 'Noto Serif TC', serif";
    c.fillStyle = "rgba(254, 240, 138, 0.88)";
    c.shadowColor = "#22c55e";
    c.shadowBlur = 8;
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      const rx = Math.cos(a) * (baseR * 0.98 * pulse);
      const ry = Math.sin(a) * (baseR * 0.98 * pulse);
      c.save();
      c.translate(rx, ry);
      c.rotate(a + Math.PI / 2);
      c.fillText(runes[r], 0, 0);
      c.restore();
    }
    c.restore();

    c.restore();
  }

  function drawLifeweaverKomorebi(c, cx, cy, w, h, elapsed, isClimax, alpha) {
    c.save();
    c.globalAlpha = alpha;
    const rayCount = 12;
    const maxR = Math.max(w, h) * 0.95;
    const rot = elapsed * 0.0003;

    for (let i = 0; i < rayCount; i++) {
      const a = rot + (i / rayCount) * Math.PI * 2;
      const spread = 0.12 + Math.sin(elapsed * 0.002 + i) * 0.03;
      c.beginPath();
      c.moveTo(cx, cy);
      c.arc(cx, cy, maxR, a - spread, a + spread);
      c.closePath();
      const rGrad = c.createRadialGradient(cx, cy, 20, cx, cy, maxR);
      rGrad.addColorStop(0, i % 2 === 0 ? "rgba(254, 240, 138, 0.22)" : "rgba(134, 239, 172, 0.18)");
      rGrad.addColorStop(0.5, i % 2 === 0 ? "rgba(74, 222, 128, 0.1)" : "rgba(254, 240, 138, 0.08)");
      rGrad.addColorStop(1, "rgba(2, 44, 34, 0)");
      c.fillStyle = rGrad;
      c.fill();
    }
    c.restore();
  }

  function renderLifeweaverFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const cx = w / 2;
    const cy = h / 2;
    const lw = st.lifeweaver;
    if (!lw) return;

    // 1. 神聖林冠翡翠深穹天幕 (Sacred Forest Emerald Canopy Void)
    const skyGrad = c.createRadialGradient(cx, cy * 0.65, 30, cx, cy, Math.max(w, h) * 0.88);
    skyGrad.addColorStop(0, isClimax ? "#064e3b" : "#022c22");
    skyGrad.addColorStop(0.42, "#01261d");
    skyGrad.addColorStop(0.78, "#011610");
    skyGrad.addColorStop(1, "#000a06");
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, h);

    // 2. 原初生命之息極光波紋 (Living Green Auroral Waves)
    for (let i = 0; i < 4; i++) {
      const wy = h * 0.22 + i * (h * 0.18);
      c.save();
      c.globalAlpha = 0.07 + Math.sin(elapsed * 0.0025 + i * 1.5) * 0.035;
      c.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.35)" : "rgba(254, 240, 138, 0.28)";
      c.beginPath();
      c.moveTo(0, wy);
      for (let x = 0; x <= w; x += 35) {
        const offset = Math.sin(elapsed * 0.003 + x * 0.012 + i) * 12;
        c.lineTo(x, wy + offset);
      }
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();
      c.restore();
    }

    // 3. 透過樹冠的神聖微光射線 (Komorebi Sacred Beams)
    const komoAlpha = isClimax ? 0.75 : 0.45;
    drawLifeweaverKomorebi(c, cx, cy * 0.85, w, h, elapsed, isClimax, komoAlpha);

    // 4. 生意盎然生命孢子向上奔湧 (Upward Drifting Life Spores)
    const sporeSpeed = isClimax ? 1.8 : isUp ? 1.25 : 1.0;
    for (let i = 0; i < lw.spores.length; i++) {
      const sp = lw.spores[i];
      sp.y += sp.vy * sporeSpeed;
      sp.x += Math.sin(elapsed * sp.swaySpeed + sp.swayPhase) * 1.2;
      if (sp.y < -30) {
        sp.y = h + Math.random() * 40;
        sp.x = Math.random() * w;
      }
      c.save();
      c.globalAlpha = sp.alpha * (isClimax ? 1 : 0.8);
      c.fillStyle = sp.color;
      c.shadowColor = sp.color;
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(sp.x, sp.y, sp.r * (isClimax ? 1.25 : 1), 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 5. 飄舞旋轉的翡翠與櫻粉花瓣 (Swirling Floral Petals)
    for (let i = 0; i < lw.petals.length; i++) {
      const pt = lw.petals[i];
      pt.orbitAngle += pt.orbitSpeed * (isClimax ? 1.6 : 1.0);
      pt.angle += pt.rotSpeed;
      const px = cx + Math.cos(pt.orbitAngle) * pt.orbitRadius;
      const py = cy + Math.sin(pt.orbitAngle) * (pt.orbitRadius * 0.65) + Math.sin(elapsed * 0.002 + i) * 15;

      c.save();
      c.translate(px, py);
      c.rotate(pt.angle);
      c.globalAlpha = pt.alpha * (isClimax ? 0.95 : 0.75);
      c.beginPath();
      c.ellipse(0, 0, pt.size, pt.size * 0.55, 0, 0, Math.PI * 2);
      c.fillStyle = pt.color;
      c.shadowColor = pt.color;
      c.shadowBlur = 6;
      c.fill();
      c.restore();
    }

    // 6. 神聖生命藤蔓螺旋蔓生 (Sprouting Sacred Vines)
    const vineGrowth = Math.min(1.0, elapsed / 5500);
    drawLifeweaverVines(c, cx, cy, lw.vines, elapsed, isClimax, vineGrowth);

    // 7. 神聖生命法陣・原初生命之輪 (Central Life Mandala & Seed)
    const mandalaAlpha = isClimax ? 0.95 : 0.78;
    drawLifeweaverMandala(c, cx, cy, elapsed, isClimax, mandalaAlpha);

    // 8. 衝擊萌芽光震波 (Sprout Pulse Shockwaves)
    if (lw.sproutPulse > 0.02) {
      lw.sproutPulse *= 0.93;
      c.save();
      c.beginPath();
      c.arc(cx, cy, (1 - lw.sproutPulse) * Math.min(w, h) * 0.45, 0, Math.PI * 2);
      c.strokeStyle = `rgba(134, 239, 172, ${lw.sproutPulse * 0.8})`;
      c.lineWidth = 3.5;
      c.shadowColor = "#22c55e";
      c.shadowBlur = 16;
      c.stroke();
      c.restore();
    }

    // 9. 萬物生長甘霖碎屑 (Burst Life Sparks)
    for (let i = st.burstSparks.length - 1; i >= 0; i--) {
      const sp = st.burstSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha *= 0.94;
      if (sp.alpha <= 0.02) {
        st.burstSparks.splice(i, 1);
        continue;
      }
      c.save();
      c.globalAlpha = sp.alpha;
      c.fillStyle = sp.color || "#86efac";
      c.shadowColor = "#22c55e";
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 10. 高潮階段：神聖大字浮現 (Climax Divine Banner)
    if (isClimax) {
      c.save();
      const bAlpha = Math.min(1.0, climaxElapsed / 600);
      c.globalAlpha = bAlpha;
      c.textAlign = "center";
      c.textBaseline = "middle";

      // 上副標：❖ 原初生命之神 ❖
      c.font = "800 16px 'Noto Serif TC', serif";
      c.fillStyle = "#86efac";
      c.shadowColor = "#16a34a";
      c.shadowBlur = 10;
      c.fillText("❖ 原初生命之神 ❖", cx, cy - 145);

      // 主稱號：生命女神・萊夫維芙
      c.font = "900 28px 'Noto Serif TC', serif";
      c.fillStyle = "#ffffff";
      c.shadowColor = "#4ade80";
      c.shadowBlur = 24;
      c.fillText("《 生命女神・萊夫維芙 》", cx, cy - 105);

      // 下標：『 生命創造・生者亦能永恆 』
      c.font = "700 15px 'Noto Serif TC', serif";
      c.fillStyle = "#fef08a";
      c.shadowColor = "#eab308";
      c.shadowBlur = 12;
      c.fillText("『 生命創造・生者亦能永恆 』", cx, cy + 125);

      c.restore();
    }

    // 11. 神聖林海幽深暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.32, cx, cy, Math.max(w, h) * 0.8);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(0, 10, 6, 0.9)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

  // ==================== 降臨級 拉格提斯 專屬畫面：Nano Banana 高精度西方巨龍素材與大劍・弒神風格 (ragtis-dragonslayer) ====================
  const RAGTIS_DRAGON_ASSETS = {
    soar: null,
    breath: null,
    maw: null,
    profile: null,
    sword: null
  };

  function getRagtisDragonImage(key) {
    if (!RAGTIS_DRAGON_ASSETS[key]) {
      const img = new Image();
      if (key === "soar") img.src = "assets/dragons/dragon_flying_soar.jpg";
      else if (key === "breath") img.src = "assets/dragons/dragon_breath_dive.jpg";
      else if (key === "maw") img.src = "assets/dragons/dragon_colossal_maw.jpg";
      else if (key === "profile") img.src = "assets/dragons/dragon_profile_roar.jpg";
      else if (key === "sword") img.src = "assets/dragons/deicide_greatsword.jpg";
      RAGTIS_DRAGON_ASSETS[key] = img;
    }
    return RAGTIS_DRAGON_ASSETS[key];
  }

  // 即刻預載 Nano Banana 西方巨龍與弒神大劍高精素材
  try {
    getRagtisDragonImage("soar");
    getRagtisDragonImage("breath");
    getRagtisDragonImage("maw");
    getRagtisDragonImage("profile");
    getRagtisDragonImage("sword");
  } catch (e) {
    console.warn("Ragtis dragon asset preload:", e);
  }

  function drawRagtisDragonSprite(c, imgKey, x, y, baseSize, angle = 0, alpha = 1, flipH = false, boost = 1.4) {
    const img = getRagtisDragonImage(imgKey);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const aspect = img.naturalHeight / img.naturalWidth;
    const w = baseSize;
    const h = baseSize * aspect;

    c.save();
    c.translate(x, y);
    if (angle) c.rotate(angle);
    if (flipH) c.scale(-1, 1);
    c.globalAlpha = Math.max(0, Math.min(1, alpha));
    c.globalCompositeOperation = "screen";
    c.filter = `brightness(${boost}) contrast(1.15)`;

    c.drawImage(img, -w / 2, -h / 2, w, h);
    c.filter = "none";
    c.restore();
  }

  function drawRagtisDeicideGreatsword(c, x, y, height, angle = 0, alpha = 1, tipDown = true, boost = 1.4) {
    const img = getRagtisDragonImage("sword");
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const aspect = img.naturalWidth / img.naturalHeight; // 768 / 1376 ≈ 0.558
    const w = height * aspect;
    const h = height;

    c.save();
    c.translate(x, y);
    c.rotate(angle + (tipDown ? Math.PI : 0));
    c.globalAlpha = Math.max(0, Math.min(1, alpha));
    c.globalCompositeOperation = "screen";
    c.filter = `brightness(${boost}) contrast(1.18)`;

    c.drawImage(img, -w / 2, -h / 2, w, h);
    c.filter = "none";
    c.restore();
  }

  function createRagtisFxState(w, h) {
    // 1. 各種翱翔展翼的 Nano Banana 高精度西方巨龍 (Various High-Res Western Dragons)
    const dragons = [
      {
        spriteKey: "soar",
        x: -140,
        y: h * 0.26,
        vx: 3.4,
        vy: 0.22,
        size: Math.min(w, h) * 0.58,
        baseAngle: 0.08,
        flipH: false,
        pulseOffset: 0
      },
      {
        spriteKey: "breath",
        x: w + 140,
        y: h * 0.22,
        vx: -3.0,
        vy: 0.35,
        size: Math.min(w, h) * 0.52,
        baseAngle: -0.14,
        flipH: true,
        pulseOffset: 1.8
      },
      {
        spriteKey: "profile",
        x: -200,
        y: h * 0.65,
        vx: 3.6,
        vy: -0.28,
        size: Math.min(w, h) * 0.68,
        baseAngle: 0.05,
        flipH: false,
        pulseOffset: 3.1
      },
      {
        spriteKey: "soar",
        x: w * 0.45,
        y: -160,
        vx: 1.8,
        vy: 2.2,
        size: Math.min(w, h) * 0.44,
        baseAngle: 0.32,
        flipH: false,
        pulseOffset: 4.6
      }
    ];

    // 2. 戰場周遭插立的弒神之大劍群 (Surrounding God-Slayer Greatswords)
    const groundSwords = [
      { x: w * 0.14, y: h * 0.76, angle: -0.22, scale: 0.72, rune: "屠神" },
      { x: w * 0.28, y: h * 0.82, angle: 0.14, scale: 0.85, rune: "破神" },
      { x: w * 0.44, y: h * 0.85, angle: -0.08, scale: 0.78, rune: "拒神" },
      { x: w * 0.58, y: h * 0.84, angle: 0.18, scale: 0.82, rune: "滅神" },
      { x: w * 0.74, y: h * 0.81, angle: -0.16, scale: 0.88, rune: "無神" },
      { x: w * 0.88, y: h * 0.74, angle: 0.25, scale: 0.75, rune: "弒神" }
    ];

    // 3. 碎裂的「囚神之鏈」鐵鏈碎片 (Broken Chains of God-Imprisonment)
    const brokenChains = [];
    for (let i = 0; i < 18; i++) {
      brokenChains.push({
        x: w * 0.2 + Math.random() * w * 0.6,
        y: h * 0.3 + Math.random() * h * 0.45,
        vx: (Math.random() - 0.5) * 2.8,
        vy: (Math.random() - 0.5) * 2.5,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: 9 + Math.random() * 8
      });
    }

    // 4. 弒神狂雷火星粒子 (Deicide Thunder Embers)
    const embers = [];
    for (let i = 0; i < 75; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.6,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -1.2 - Math.random() * 2.5,
        color: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#a855f7" : "#fbbf24",
        alpha: 0.4 + Math.random() * 0.6
      });
    }

    return {
      dragons,
      groundSwords,
      brokenChains,
      embers,
      lightningFlash: 0,
      deicideImpactPulse: 0,
      climaxSwordDrop: 0
    };
  }

  function drawWesternDragon(c, x, y, scale, angle, wingPhase, bodyColor, glowColor, breathAlpha) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(scale, scale);

    const wingSpan = Math.sin(wingPhase);

    // 1. 狂暴龍息或神龍狂雷雷光 (Draconic Breath Beam)
    if (breathAlpha > 0.05) {
      c.save();
      c.globalAlpha = breathAlpha;
      const bGrad = c.createLinearGradient(45, -12, 180, -25);
      bGrad.addColorStop(0, "#ffffff");
      bGrad.addColorStop(0.25, "#fef08a");
      bGrad.addColorStop(0.65, "#ef4444");
      bGrad.addColorStop(1, "rgba(168, 85, 247, 0)");
      c.fillStyle = bGrad;
      c.beginPath();
      c.moveTo(42, -10);
      c.lineTo(190, -45);
      c.lineTo(185, 15);
      c.closePath();
      c.shadowColor = glowColor || "#ef4444";
      c.shadowBlur = 18;
      c.fill();
      c.restore();
    }

    // 2. 西方龍背部巨型蝠翼（左翼 / 遠翼）
    c.save();
    c.beginPath();
    c.moveTo(-5, -12);
    const wyLeft = -45 + wingSpan * 28;
    c.quadraticCurveTo(-20, wyLeft - 30, -55, wyLeft);
    c.quadraticCurveTo(-40, wyLeft + 15, -25, wyLeft + 10);
    c.quadraticCurveTo(-15, wyLeft + 20, 0, -5);
    c.closePath();
    c.fillStyle = "rgba(40, 10, 60, 0.75)";
    c.fill();
    c.restore();

    // 3. 巨龍長尾（S型優美擺動，尾端帶倒刺戰矛）
    c.beginPath();
    c.moveTo(-28, 5);
    c.quadraticCurveTo(-55, 18 + wingSpan * 8, -85, 5);
    c.quadraticCurveTo(-115, -10 - wingSpan * 6, -135, 12);
    c.lineTo(-125, 18);
    c.quadraticCurveTo(-105, 5, -80, 15);
    c.quadraticCurveTo(-50, 26, -24, 12);
    c.closePath();
    c.fillStyle = bodyColor || "#7e22ce";
    c.fill();

    // 尾刺戟刃
    c.beginPath();
    c.moveTo(-135, 12);
    c.lineTo(-148, 8);
    c.lineTo(-140, 22);
    c.closePath();
    c.fillStyle = "#ef4444";
    c.fill();

    // 4. 巨龍軀幹與粗壯後足
    c.beginPath();
    c.ellipse(-10, 5, 24, 14, -0.2, 0, Math.PI * 2);
    c.fillStyle = bodyColor || "#7e22ce";
    c.shadowColor = glowColor || "#a855f7";
    c.shadowBlur = 12;
    c.fill();

    // 5. 巨龍長頸與龍首
    c.beginPath();
    c.moveTo(8, -2);
    c.quadraticCurveTo(24, -14, 38, -12);
    c.lineTo(46, -15);
    c.lineTo(36, -22);
    c.quadraticCurveTo(18, -24, 0, -12);
    c.closePath();
    c.fillStyle = bodyColor || "#7e22ce";
    c.fill();

    // 傲世威嚴龍角（後彎長雙角）
    c.beginPath();
    c.moveTo(34, -20);
    c.quadraticCurveTo(18, -36, 6, -42);
    c.quadraticCurveTo(18, -32, 30, -18);
    c.closePath();
    c.fillStyle = "#facc15";
    c.shadowColor = "#facc15";
    c.shadowBlur = 8;
    c.fill();

    // 猩紅狂怒龍眼 (Glowing Draconic Eye)
    c.beginPath();
    c.arc(36, -17, 2.2, 0, Math.PI * 2);
    c.fillStyle = "#ffffff";
    c.shadowColor = "#ef4444";
    c.shadowBlur = 10;
    c.fill();

    // 6. 前翼（近處主翼，骨骼分明，隨羽翼拍擊舒展）
    c.save();
    c.beginPath();
    c.moveTo(2, -8);
    const wyRight = -70 - wingSpan * 35;
    c.quadraticCurveTo(-15, wyRight - 25, -48, wyRight);
    c.quadraticCurveTo(-38, wyRight + 32, -22, wyRight + 26);
    c.quadraticCurveTo(-14, wyRight + 44, 4, wyRight + 34);
    c.quadraticCurveTo(8, wyRight + 52, 16, -2);
    c.closePath();
    const wingGrad = c.createLinearGradient(0, -10, -40, wyRight);
    wingGrad.addColorStop(0, bodyColor || "#7e22ce");
    wingGrad.addColorStop(0.5, "rgba(220, 38, 38, 0.85)");
    wingGrad.addColorStop(1, "rgba(251, 191, 36, 0.75)");
    c.fillStyle = wingGrad;
    c.shadowColor = glowColor || "#ef4444";
    c.shadowBlur = 15;
    c.fill();
    c.strokeStyle = "#fef08a";
    c.lineWidth = 1.4;
    c.stroke();
    c.restore();

    c.restore();
  }

  function drawDeicideGreatsword(c, x, y, scale, angle, alpha, glowColor, runesText) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(scale, scale);
    c.globalAlpha = alpha;

    c.shadowColor = glowColor || "#a855f7";
    c.shadowBlur = 22;

    // 雙刃厚重大劍刃身 (Giant Deicide Blade)
    c.beginPath();
    c.moveTo(0, -160);
    c.lineTo(16, -135);
    c.lineTo(16, 20);
    c.lineTo(-16, 20);
    c.lineTo(-16, -135);
    c.closePath();
    const bGrad = c.createLinearGradient(-16, 0, 16, 0);
    bGrad.addColorStop(0, "#1e1b4b");
    bGrad.addColorStop(0.3, "#475569");
    bGrad.addColorStop(0.5, "#f8fafc");
    bGrad.addColorStop(0.7, "#475569");
    bGrad.addColorStop(1, "#1e1b4b");
    c.fillStyle = bGrad;
    c.fill();
    c.strokeStyle = "#ef4444";
    c.lineWidth = 1.8;
    c.stroke();

    // 中央弒神血槽與狂雷紫芒
    c.beginPath();
    c.moveTo(0, -135);
    c.lineTo(0, 18);
    c.strokeStyle = "#f43f5e";
    c.lineWidth = 4;
    c.stroke();

    c.beginPath();
    c.moveTo(0, -135);
    c.lineTo(0, 18);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 1.5;
    c.stroke();

    // 劍身刻印弒神符文
    if (runesText) {
      c.save();
      c.rotate(Math.PI / 2);
      c.font = "bold 11px 'Noto Serif TC', serif";
      c.fillStyle = "#fde047";
      c.shadowColor = "#ef4444";
      c.shadowBlur = 8;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(runesText, 60, 0);
      c.restore();
    }

    // 霸氣龍翼棘刺護手
    c.beginPath();
    c.moveTo(0, 20);
    c.lineTo(38, 26);
    c.lineTo(46, 16);
    c.lineTo(24, 34);
    c.lineTo(0, 28);
    c.lineTo(-24, 34);
    c.lineTo(-46, 16);
    c.lineTo(-38, 26);
    c.closePath();
    c.fillStyle = "#0f172a";
    c.fill();
    c.strokeStyle = "#facc15";
    c.lineWidth = 2;
    c.stroke();

    // 雙手纏帶劍柄與巨龍真眼劍首
    c.beginPath();
    c.rect(-4, 28, 8, 42);
    c.fillStyle = "#334155";
    c.fill();
    c.strokeStyle = "#ef4444";
    c.lineWidth = 1.2;
    c.stroke();

    c.beginPath();
    c.arc(0, 76, 7.5, 0, Math.PI * 2);
    c.fillStyle = "#ef4444";
    c.shadowColor = "#f43f5e";
    c.shadowBlur = 14;
    c.fill();

    c.restore();
  }

  function renderRagtisFrame(c, st, w, h, elapsed, isUp, isClimax, climaxElapsed) {
    const cx = w / 2;
    const cy = h / 2;
    const rt = st.ragtis;
    if (!rt) return;

    // 1. 弒神血雷狂暴深穹天幕 (Deicide Crimson & Purple Void)
    const skyGrad = c.createRadialGradient(cx, cy * 0.7, 30, cx, cy, Math.max(w, h) * 0.88);
    skyGrad.addColorStop(0, isClimax ? "#581c87" : "#3b0764");
    skyGrad.addColorStop(0.38, "#2e1065");
    skyGrad.addColorStop(0.72, "#1c0628");
    skyGrad.addColorStop(1, "#090111");
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, h);

    // 2. 神龍狂雷暴風閃電弧 (Crackling Deicide Lightning Bolts)
    if (Math.random() < 0.22 || rt.lightningFlash > 0.05) {
      c.save();
      c.strokeStyle = Math.random() < 0.5 ? "rgba(254, 240, 138, 0.9)" : "rgba(168, 85, 247, 0.95)";
      c.lineWidth = 2.5;
      c.shadowColor = "#ef4444";
      c.shadowBlur = 16;
      c.beginPath();
      let lx = Math.random() * w;
      let ly = 0;
      c.moveTo(lx, ly);
      for (let s = 0; s < 7; s++) {
        lx += (Math.random() - 0.5) * 80;
        ly += h / 7;
        c.lineTo(lx, ly);
      }
      c.stroke();
      c.restore();
    }

    // 3. 戰場周遭插立的 Nano Banana 弒神大劍群與狂雷鏈接光弧 (Perimeter Greatswords with Lightning Arcs)
    rt.groundSwords.forEach((gs, idx) => {
      drawRagtisDeicideGreatsword(c, gs.x, gs.y - 20, 240 * gs.scale, gs.angle, 0.98, true, 1.45);

      // 劍柄龍目血紅魔光與電芒
      c.save();
      c.beginPath();
      c.arc(gs.x, gs.y - 110 * gs.scale, 7 * gs.scale, 0, Math.PI * 2);
      c.fillStyle = "#ef4444";
      c.shadowColor = "#f43f5e";
      c.shadowBlur = 14;
      c.globalCompositeOperation = "lighter";
      c.fill();
      c.restore();

      // 大劍之間的跳躍雷芒
      if (idx < rt.groundSwords.length - 1) {
        const nextGs = rt.groundSwords[idx + 1];
        c.save();
        c.strokeStyle = "rgba(250, 204, 21, 0.45)";
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(gs.x, gs.y - 120 * gs.scale);
        const midX = (gs.x + nextGs.x) / 2 + (Math.random() - 0.5) * 30;
        const midY = (gs.y + nextGs.y) / 2 - 40 + (Math.random() - 0.5) * 20;
        c.quadraticCurveTo(midX, midY, nextGs.x, nextGs.y - 120 * nextGs.scale);
        c.stroke();
        c.restore();
      }
    });

    // 4. 碎裂的「囚神之鏈」殘片飛舞 (Floating Broken Chains)
    rt.brokenChains.forEach((ch) => {
      ch.x += ch.vx;
      ch.y += ch.vy;
      ch.angle += ch.rotSpeed;
      if (ch.x < -40) ch.x = w + 40;
      if (ch.x > w + 40) ch.x = -40;
      if (ch.y < -40) ch.y = h + 40;
      if (ch.y > h + 40) ch.y = -40;

      c.save();
      c.translate(ch.x, ch.y);
      c.rotate(ch.angle);
      c.strokeStyle = "#facc15";
      c.lineWidth = 2.2;
      c.shadowColor = "#ef4444";
      c.shadowBlur = 8;
      c.beginPath();
      c.ellipse(0, 0, ch.size, ch.size * 0.55, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    });

    // 5. 各種 Nano Banana 西方巨龍翱翔飛舞與神龍狂雷 (Flying Western Dragons)
    rt.dragons.forEach((dg, dIdx) => {
      dg.x += dg.vx * (isClimax ? 1.3 : 1.0);
      dg.y += dg.vy + Math.sin(elapsed * 0.0025 + dg.pulseOffset) * 0.7;

      // 循環飛掠
      if (dg.vx > 0 && dg.x > w + 220) {
        dg.x = -220;
        dg.y = h * (0.12 + Math.random() * 0.55);
      } else if (dg.vx < 0 && dg.x < -220) {
        dg.x = w + 220;
        dg.y = h * (0.12 + Math.random() * 0.55);
      }

      // 飛掠俯仰角與羽翼動態
      const dynamicAngle = dg.baseAngle + Math.sin(elapsed * 0.003 + dIdx) * 0.08;
      const dynamicSize = dg.size * (1 + Math.sin(elapsed * 0.004 + dIdx) * 0.06);
      const alpha = 0.92 + Math.sin(elapsed * 0.0035 + dIdx) * 0.08;

      // 巨龍背後的神雷暗紫火環
      c.save();
      const glowGrad = c.createRadialGradient(dg.x, dg.y, 10, dg.x, dg.y, dynamicSize * 0.42);
      glowGrad.addColorStop(0, "rgba(168, 85, 247, 0.32)");
      glowGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.16)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      c.fillStyle = glowGrad;
      c.globalCompositeOperation = "lighter";
      c.beginPath();
      c.arc(dg.x, dg.y, dynamicSize * 0.42, 0, Math.PI * 2);
      c.fill();
      c.restore();

      drawRagtisDragonSprite(c, dg.spriteKey, dg.x, dg.y, dynamicSize, dynamicAngle, alpha, dg.flipH, 1.55);
    });

    // 6. 弒神狂雷火星粒子 (Embers)
    for (let i = 0; i < rt.embers.length; i++) {
      const em = rt.embers[i];
      em.y += em.vy;
      em.x += em.vx;
      if (em.y < -20) {
        em.y = h + 20;
        em.x = Math.random() * w;
      }
      c.save();
      c.globalAlpha = em.alpha;
      c.fillStyle = em.color;
      c.shadowColor = em.color;
      c.shadowBlur = 6;
      c.beginPath();
      c.arc(em.x, em.y, em.r, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 7. 衝擊地裂震波 (Deicide Shockwave Pulses)
    if (rt.deicideImpactPulse > 0.02) {
      rt.deicideImpactPulse *= 0.92;
      c.save();
      c.beginPath();
      c.arc(cx, cy, (1 - rt.deicideImpactPulse) * Math.min(w, h) * 0.5, 0, Math.PI * 2);
      c.strokeStyle = `rgba(239, 68, 68, ${rt.deicideImpactPulse * 0.9})`;
      c.lineWidth = 4;
      c.shadowColor = "#facc15";
      c.shadowBlur = 20;
      c.stroke();
      c.restore();
    }

    // 8. 終極高潮階段：滅神巨劍破天而降 + 震撼 Nano Banana 狂暴巨龍咆哮！
    if (isClimax) {
      c.save();
      const cProgress = Math.min(1.0, climaxElapsed / 650);

      // (1) 背景深淵：中央撼世巨龍首咆哮 (Colossal Frontal Dragon Maw Roaring)
      const mawProgress = Math.min(1.0, climaxElapsed / 750);
      const mawSize = Math.max(w * 0.95, 760) * (0.82 + mawProgress * 0.28 + Math.sin(climaxElapsed * 0.012) * 0.02);
      const mawAlpha = Math.min(1.0, climaxElapsed / 320);
      drawRagtisDragonSprite(c, "maw", cx, cy - 25, mawSize, 0, mawAlpha, false);

      // (2) 左側傲世巨龍展翼咆哮 (Left Flanking Profile Roar)
      const sideAlpha = Math.min(0.92, climaxElapsed / 480);
      const sideSize = Math.min(w, h) * 0.68;
      drawRagtisDragonSprite(c, "profile", cx - w * 0.35, cy + 15, sideSize, 0.08, sideAlpha, false);

      // (3) 右側狂暴俯衝吐息巨龍 (Right Flanking Breath Dive)
      drawRagtisDragonSprite(c, "breath", cx + w * 0.35, cy - 20, sideSize * 0.88, -0.12, sideAlpha, true);

      // (4) 弒神大劍天降破空神雷光柱
      const swordY = cy - 35 + (1 - cProgress) * -260;
      c.save();
      const bladeRay = c.createLinearGradient(cx - 30, swordY - 260, cx + 30, swordY + 260);
      bladeRay.addColorStop(0, "rgba(254, 240, 138, 0)");
      bladeRay.addColorStop(0.3, "rgba(239, 68, 68, 0.45)");
      bladeRay.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
      bladeRay.addColorStop(0.7, "rgba(168, 85, 247, 0.5)");
      bladeRay.addColorStop(1, "rgba(254, 240, 138, 0)");
      c.fillStyle = bladeRay;
      c.globalCompositeOperation = "lighter";
      c.fillRect(cx - 24, swordY - 260, 48, 520);
      c.restore();

      // 中央滅神大劍自九天之上貫穿斬落 (Colossal Falling Nano Banana Deicide Greatsword)
      drawRagtisDeicideGreatsword(c, cx, swordY, Math.min(h * 0.95, 550), 0, cProgress, true, 1.6);

      // (5) 弒神文字橫幅 (Divine Deicide Banner)
      const bAlpha = Math.min(1.0, climaxElapsed / 600);
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = bAlpha;
      c.textAlign = "center";
      c.textBaseline = "middle";

      c.font = "800 16px 'Noto Serif TC', serif";
      c.fillStyle = "#facc15";
      c.shadowColor = "#ef4444";
      c.shadowBlur = 12;
      c.fillText("❖ 傳奇・降臨級 ❖", cx, cy - 145);

      c.font = "900 28px 'Noto Serif TC', serif";
      c.fillStyle = "#ffffff";
      c.shadowColor = "#dc2626";
      c.shadowBlur = 25;
      c.fillText("《 弒神狂龍・拉格提斯 》", cx, cy - 105);

      c.font = "700 16px 'Noto Serif TC', serif";
      c.fillStyle = "#fde047";
      c.shadowColor = "#7e22ce";
      c.shadowBlur = 14;
      c.fillText("『 神將不再輝煌，吾終將諸神 』", cx, cy + 130);

      c.restore();
    }

    // 9. 弒神血色暗角
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.85);
    vg.addColorStop(0, "rgba(0, 0, 0, 0)");
    vg.addColorStop(1, "rgba(15, 2, 20, 0.92)");
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }

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
    if ((lvl === 8 || specialVariant === "phenom-seth-evil") && specialVariant !== "phenom-the-abyss" && specialVariant !== "phenom-lycia-void") {
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
      hecate: specialVariant === "hecate-death" ? createHecateFxState(w, h) : null,
      skadi: specialVariant === "skadi-darkness" ? createSkadiFxState(w, h) : null,
      ignalion: specialVariant === "ignalion-holyfire" ? createIgnalionFxState(w, h) : null,
      warrior: specialVariant === "warrior-arena" ? createWarriorFxState(w, h) : null,
      beelzebub: specialVariant === "beelzebub-swarm" ? createBeelzebubFxState(w, h) : null,
      nyx: specialVariant === "nyx-moon-stars" ? createNyxFxState(w, h) : null,
      hemera: specialVariant === "hemera-sun" ? createHemeraFxState(w, h) : null,
      lifeweaver: specialVariant === "lifeweaver-verdant" ? createLifeweaverFxState(w, h) : null,
      ragtis: specialVariant === "ragtis-dragonslayer" ? createRagtisFxState(w, h) : null,
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

      // 黑卡蒂：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "hecate-death" && activeFxState.hecate) {
        renderHecateFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 暗 斯卡奇〔霸王之暗・黑色暴君〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "skadi-darkness" && activeFxState.skadi) {
        renderSkadiFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 伊格那利昂 加拉爾〔熊熊聖火與帝國王道〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "ignalion-holyfire" && activeFxState.ignalion) {
        renderIgnalionFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 沃利爾 德瑪〔戰爭與古羅馬血沙競技場〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "warrior-arena" && activeFxState.warrior) {
        renderWarriorFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 別西卜 阿斯拉 撒旦〔暴食血紅與萬千群蠅暴虐〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "beelzebub-swarm" && activeFxState.beelzebub) {
        renderBeelzebubFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 尤諾拉 倪克斯〔皎潔明月與深邃星空・黑夜女神〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "nyx-moon-stars" && activeFxState.nyx) {
        renderNyxFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 迪米諾拉 赫墨拉〔熾熱烈陽與終焉日冕・日耀女神〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "hemera-sun" && activeFxState.hemera) {
        renderHemeraFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 萊夫維芙〔生意盎然・原初生命女神〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "lifeweaver-verdant" && activeFxState.lifeweaver) {
        renderLifeweaverFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 拉格提斯〔弒神狂龍・西方巨龍與大劍群〕：完全使用專屬畫面，不繪製任何通用彗星 / 斬擊 / 光束 / 藍黃線條
      if (vMode === "ragtis-dragonslayer" && activeFxState.ragtis) {
        renderRagtisFrame(ctx2d, activeFxState, wCurr, hCurr, elapsed, isUpgradedNow, isClimax, climaxElapsed);
        ctx2d.globalAlpha = 1;
        ctx2d.globalCompositeOperation = "source-over";
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

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
      } else if (isUpgradedNow && (lvl === 8 || vMode === "phenom-seth-evil")) {
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

      // 1. Rotating God-Ray Beams (SSR / UR / EX / Legend / ？ after upgrade, intensified during Climax Finale!)
      if (isUpgradedNow && (lvl >= 4 || isClimax)) {
        const rayCount = vMode === "apocalypse-dragon" ? 20 : lvl === 8 ? 18 : lvl === 7 ? 16 : lvl === 6 ? 14 : lvl === 5 ? 12 : lvl === 4 ? 8 : 6;
        const rotSpeed = (isClimax ? 2.4 : 1) * (lvl === 8 ? -0.0022 : lvl >= 6 ? 0.0024 : 0.0012);
        const baseRot = elapsed * rotSpeed;
        const maxR = Math.max(wCurr, hCurr) * 0.82;
        ctx2d.save();
        ctx2d.translate(cx, cy);

        // Pre-create shared gradients once per frame
        const rayGrads = [];
        const rayPal =
          vMode === "phenom-the-abyss"
            ? ["rgba(147, 51, 234, 0.44)", "rgba(79, 70, 229, 0.38)", "rgba(59, 7, 100, 0.52)", "rgba(192, 132, 252, 0.35)"]
            : vMode === "phenom-lycia-void"
            ? ["rgba(29, 78, 216, 0.52)", "rgba(0, 0, 0, 0.78)", "rgba(30, 58, 138, 0.58)", "rgba(59, 130, 246, 0.42)"]
            : vMode === "apocalypse-dragon" || lvl === 7
            ? ["rgba(239, 68, 68, 0.62)", "rgba(254, 240, 138, 0.58)", "rgba(185, 28, 28, 0.65)", "rgba(249, 115, 22, 0.55)"]
            : lvl === 8
            ? ["rgba(220, 38, 38, 0.42)", "rgba(147, 51, 234, 0.36)", "rgba(127, 29, 29, 0.45)", "rgba(239, 68, 68, 0.38)"]
            : lvl === 6
            ? ["rgba(254, 240, 138, 0.42)", "rgba(56, 189, 248, 0.36)", "rgba(255, 255, 255, 0.4)", "rgba(244, 63, 94, 0.32)"]
            : [`${priColor}44`, `${secColor}33`];
        for (let g = 0; g < rayPal.length; g++) {
          const rg = ctx2d.createLinearGradient(0, 0, maxR, 0);
          rg.addColorStop(0, rayPal[g]);
          rg.addColorStop(1, "rgba(0, 0, 0, 0)");
          rayGrads.push(rg);
        }

        for (let r = 0; r < rayCount; r++) {
          const a = baseRot + (r * Math.PI * 2) / rayCount;
          ctx2d.save();
          ctx2d.rotate(a);
          ctx2d.fillStyle = rayGrads[r % rayGrads.length];
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
        } else if (lvl === 8 || vMode === "phenom-seth-evil") {
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
        c.angle += c.speedRot * speedMult * (lvl === 8 ? -1.2 : 1);
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
        if (c.trail.length > (isClimax ? 5 : 4)) c.trail.shift();

        if (c.trail.length > 1) {
          ctx2d.beginPath();
          ctx2d.moveTo(c.trail[0].x, c.trail[0].y);
          for (let t = 1; t < c.trail.length; t++) {
            ctx2d.lineTo(c.trail[t].x, c.trail[t].y);
          }
          ctx2d.strokeStyle =
            (lvl === 8 || vMode === "phenom-seth-evil") && c.isAccent
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
        ctx2d.fillStyle = (lvl === 8 || vMode === "phenom-seth-evil") && i % 2 === 0 ? "#ef4444" : "#ffffff";
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
              : (lvl === 8 || vMode === "phenom-seth-evil")
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
              : (lvl === 8 || vMode === "phenom-seth-evil")
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
          } else if (lvl === 8 || vMode === "phenom-seth-evil") {
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
    if (activeFxState.hecate) {
      activeFxState.hecate.twang = 1;
    }
    if (activeFxState.skadi) {
      activeFxState.skadi.hammerImpact = 1;
    }
    if (activeFxState.ignalion) {
      activeFxState.ignalion.swordImpact = 1;
    }
    if (activeFxState.warrior) {
      activeFxState.warrior.swordImpact = 1;
    }
    if (activeFxState.beelzebub) {
      activeFxState.beelzebub.violentImpact = 1;
    }
    if (activeFxState.nyx) {
      activeFxState.nyx.swordImpact = 1;
    }
    if (activeFxState.hemera) {
      activeFxState.hemera.spearImpact = 1;
    }
    if (activeFxState.lifeweaver) {
      activeFxState.lifeweaver.sproutPulse = 1;
    }
    if (activeFxState.ragtis) {
      activeFxState.ragtis.deicideImpactPulse = 1;
      activeFxState.ragtis.lightningFlash = 1;
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
      { r: 16, speed: 18, alpha: 1, color: spec.level === 7 ? "#ef4444" : spec.level === 8 ? "#9333ea" : "#ffffff", lineWidth: 5.5 },
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
    sfxVolume: parseFloat(localStorage.getItem("arelita_summon_volume") ?? "0.8"),
    sfxEnabled: localStorage.getItem("arelita_summon_sfx_muted") !== "true",
    lastSfxVolume: parseFloat(localStorage.getItem("arelita_summon_last_volume") ?? "0.8"),
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

  function updateVolumeUI() {
    const sfxBtn = document.getElementById("btnToggleSummonSfx");
    const sfxIcon = document.getElementById("summonSfxIcon");
    const sfxText = document.getElementById("summonSfxText");
    const slider = document.getElementById("summonVolumeSlider");
    const label = document.getElementById("summonVolumeText");

    const volPct = Math.round((summonState.sfxVolume || 0) * 100);
    const isMuted = !summonState.sfxEnabled || volPct === 0;

    if (slider) {
      slider.value = isMuted ? 0 : volPct;
    }
    if (label) {
      label.textContent = `${isMuted ? 0 : volPct}%`;
    }
    if (sfxBtn) {
      sfxBtn.classList.toggle("is-active", !isMuted);
      sfxBtn.setAttribute("aria-pressed", isMuted ? "false" : "true");
    }
    if (sfxIcon) {
      if (isMuted) sfxIcon.textContent = "🔇";
      else if (volPct < 30) sfxIcon.textContent = "🔈";
      else if (volPct < 70) sfxIcon.textContent = "🔉";
      else sfxIcon.textContent = "🔊";
    }
    if (sfxText) {
      sfxText.textContent = isMuted ? "靜音" : "音效";
    }
  }

  function setSummonVolume(volPct, triggerTone = true) {
    const clamped = Math.max(0, Math.min(100, Math.round(volPct)));
    summonState.sfxVolume = clamped / 100;
    if (clamped > 0) {
      summonState.sfxEnabled = true;
      summonState.lastSfxVolume = summonState.sfxVolume;
      try {
        localStorage.setItem("arelita_summon_last_volume", String(summonState.lastSfxVolume));
        localStorage.removeItem("arelita_summon_sfx_muted");
      } catch (e) {}
    } else {
      summonState.sfxEnabled = false;
      try {
        localStorage.setItem("arelita_summon_sfx_muted", "true");
      } catch (e) {}
    }
    try {
      localStorage.setItem("arelita_summon_volume", String(summonState.sfxVolume));
    } catch (e) {}

    if (masterGainNode && audioCtx) {
      try {
        masterGainNode.gain.setValueAtTime(summonState.sfxVolume, audioCtx.currentTime);
      } catch (e) {}
    }

    updateVolumeUI();

    if (triggerTone && summonState.sfxEnabled && clamped > 0) {
      clearTimeout(previewToneTimeout);
      previewToneTimeout = setTimeout(() => {
        playVolumePreviewTone();
      }, 50);
    }
  }

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
      // Migrate: Exclude UR (level 5) from historical highRarityCount (now strictly EX / Legend / ？: level >= 6)
      if (!parsed.v_ex_only) {
        let exCount = 0;
        characters.forEach((c) => {
          if (c.summonTier && c.summonTier.level >= 6 && summonState.unlockedIds.has(c.id)) {
            exCount++;
          }
        });
        summonState.highRarityCount = exCount;
        saveSummonStats();
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
          recentHistory: summonState.recentHistory.slice(0, 30),
          v_ex_only: true
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
      const tierWeightSums = { 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const tierCounts = { 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      weightedList.forEach(({ char, weight }) => {
        const lvl = char.summonTier ? char.summonTier.level : 1;
        tierWeightSums[lvl] += weight;
        tierCounts[lvl] += 1;
        totalW += weight;
      });

      breakdownEl.innerHTML = [8, 7, 6, 5, 4, 3, 2, 1]
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
    stopAllSummonAudio();
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
      specialVariant === "hecate-death"
        ? "#f97316"
        : specialVariant === "skadi-darkness"
        ? "#9333ea"
        : specialVariant === "ignalion-holyfire"
        ? "#f59e0b"
        : specialVariant === "warrior-arena"
        ? "#ea580c"
        : specialVariant === "beelzebub-swarm"
        ? "#dc2626"
        : specialVariant === "nyx-moon-stars"
        ? "#38bdf8"
        : specialVariant === "hemera-sun"
        ? "#f59e0b"
        : specialVariant === "lifeweaver-verdant"
        ? "#22c55e"
        : specialVariant === "ragtis-dragonslayer"
        ? "#a855f7"
        : specialVariant === "phenom-the-abyss"
        ? "#9333ea"
        : specialVariant === "phenom-lycia-void"
        ? "#1d4ed8"
        : specialVariant === "apocalypse-dragon"
        ? "#ef4444"
        : tierSpec.colorPrimary;

    const upgSecondary =
      specialVariant === "hecate-death"
        ? "#1c0702"
        : specialVariant === "skadi-darkness"
        ? "#000000"
        : specialVariant === "ignalion-holyfire"
        ? "#b91c1c"
        : specialVariant === "warrior-arena"
        ? "#7f1d1d"
        : specialVariant === "beelzebub-swarm"
        ? "#450a0a"
        : specialVariant === "nyx-moon-stars"
        ? "#1e1b4b"
        : specialVariant === "hemera-sun"
        ? "#7c2d12"
        : specialVariant === "lifeweaver-verdant"
        ? "#fef08a"
        : specialVariant === "ragtis-dragonslayer"
        ? "#ef4444"
        : specialVariant === "phenom-the-abyss"
        ? "#6366f1"
        : specialVariant === "phenom-lycia-void"
        ? "#3b82f6"
        : specialVariant === "apocalypse-dragon"
        ? "#fbbf24"
        : tierSpec.colorSecondary;

    const upgGlow =
      specialVariant === "hecate-death"
        ? "rgba(249, 115, 22, 0.96)"
        : specialVariant === "skadi-darkness"
        ? "rgba(147, 51, 234, 0.96)"
        : specialVariant === "ignalion-holyfire"
        ? "rgba(245, 158, 11, 0.96)"
        : specialVariant === "warrior-arena"
        ? "rgba(234, 88, 12, 0.96)"
        : specialVariant === "beelzebub-swarm"
        ? "rgba(220, 38, 38, 0.98)"
        : specialVariant === "nyx-moon-stars"
        ? "rgba(56, 189, 248, 0.95)"
        : specialVariant === "hemera-sun"
        ? "rgba(245, 158, 11, 0.96)"
        : specialVariant === "lifeweaver-verdant"
        ? "rgba(34, 197, 94, 0.96)"
        : specialVariant === "ragtis-dragonslayer"
        ? "rgba(168, 85, 247, 0.96)"
        : specialVariant === "phenom-the-abyss"
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

    // Phase 1 (0ms): Start in base blue/cyan state before rarity upgrade at Step 2 (Hecate, Skadi, Ignalion, Warrior & Beelzebub start in bespoke state immediately!)
    const isHecate = specialVariant === "hecate-death";
    const isSkadi = specialVariant === "skadi-darkness";
    const isIgnalion = specialVariant === "ignalion-holyfire";
    const isWarrior = specialVariant === "warrior-arena";
    const isBeelzebub = specialVariant === "beelzebub-swarm";
    const isNyx = specialVariant === "nyx-moon-stars";
    const isHemera = specialVariant === "hemera-sun";
    const isLifeweaver = specialVariant === "lifeweaver-verdant";
    const isRagtis = specialVariant === "ragtis-dragonslayer";
    if (viewport) {
      const initTierAttr = isHecate
        ? "tier-hecate"
        : isSkadi
        ? "tier-skadi"
        : isIgnalion
        ? "tier-ignalion"
        : isWarrior
        ? "tier-warrior"
        : isBeelzebub
        ? "tier-beelzebub"
        : isNyx
        ? "tier-nyx"
        : isHemera
        ? "tier-hemera"
        : isLifeweaver
        ? "tier-lifeweaver"
        : isRagtis
        ? "tier-ragtis"
        : tierSpec.level >= 3
        ? "tier-2"
        : `tier-${tierSpec.level}`;
      viewport.setAttribute("data-tier", initTierAttr);
      viewport.style.setProperty(
        "--summon-primary",
        isHecate
          ? "#f97316"
          : isSkadi
          ? "#9333ea"
          : isIgnalion
          ? "#f59e0b"
          : isWarrior
          ? "#ea580c"
          : isBeelzebub
          ? "#dc2626"
          : isNyx
          ? "#38bdf8"
          : isHemera
          ? "#f59e0b"
          : isLifeweaver
          ? "#22c55e"
          : isRagtis
          ? "#a855f7"
          : tierSpec.level >= 3
          ? "#38bdf8"
          : upgPrimary
      );
      viewport.style.setProperty(
        "--summon-secondary",
        isHecate
          ? "#1c0702"
          : isSkadi
          ? "#000000"
          : isIgnalion
          ? "#b91c1c"
          : isWarrior
          ? "#7f1d1d"
          : isBeelzebub
          ? "#450a0a"
          : isNyx
          ? "#1e1b4b"
          : isHemera
          ? "#7c2d12"
          : isLifeweaver
          ? "#064e3b"
          : isRagtis
          ? "#ef4444"
          : tierSpec.level >= 3
          ? "#60a5fa"
          : upgSecondary
      );
      viewport.style.setProperty(
        "--summon-glow",
        isHecate
          ? "rgba(249, 115, 22, 0.85)"
          : isSkadi
          ? "rgba(147, 51, 234, 0.96)"
          : isIgnalion
          ? "rgba(245, 158, 11, 0.96)"
          : isWarrior
          ? "rgba(234, 88, 12, 0.96)"
          : isBeelzebub
          ? "rgba(220, 38, 38, 0.98)"
          : isNyx
          ? "rgba(56, 189, 248, 0.95)"
          : isHemera
          ? "rgba(245, 158, 11, 0.96)"
          : isLifeweaver
          ? "rgba(34, 197, 94, 0.96)"
          : isRagtis
          ? "rgba(168, 85, 247, 0.96)"
          : tierSpec.level >= 3
          ? "rgba(56, 189, 248, 0.85)"
          : upgGlow
      );
      viewport.classList.remove(
        "is-stage-shaking",
        "is-ex-singularity",
        "is-evil-abyss",
        "is-abyss-depths",
        "is-void-erasure",
        "is-apocalypse-dragon",
        "is-hecate-death",
        "is-skadi-darkness",
        "is-ignalion-holyfire",
        "is-warrior-arena",
        "is-beelzebub-swarm",
        "is-nyx-moon-stars",
        "is-hemera-sun",
        "is-lifeweaver-verdant",
        "is-ragtis-dragonslayer",
        "is-tier-upgraded",
        "is-climax-finale"
      );
      if (isHecate) {
        viewport.classList.add("is-hecate-death");
      } else if (isSkadi) {
        viewport.classList.add("is-skadi-darkness");
      } else if (isIgnalion) {
        viewport.classList.add("is-ignalion-holyfire");
      } else if (isWarrior) {
        viewport.classList.add("is-warrior-arena");
      } else if (isBeelzebub) {
        viewport.classList.add("is-beelzebub-swarm");
      } else if (isNyx) {
        viewport.classList.add("is-nyx-moon-stars");
      } else if (isHemera) {
        viewport.classList.add("is-hemera-sun");
      } else if (isLifeweaver) {
        viewport.classList.add("is-lifeweaver-verdant");
      } else if (isRagtis) {
        viewport.classList.add("is-ragtis-dragonslayer");
      }
    }
    if (card3d) {
      card3d.classList.remove("is-card-flipping", "is-card-upgraded");
      if (isHecate || isSkadi || isIgnalion || isWarrior || isBeelzebub || isNyx || isHemera || isLifeweaver || isRagtis) {
        card3d.classList.add("is-card-upgraded");
      }
    }
    if (coreSymEl) coreSymEl.textContent = isHecate ? "🕸️" : isSkadi ? "👑" : isIgnalion ? "🔥" : isWarrior ? "⚔️" : isBeelzebub ? "🪰" : isNyx ? "🌙" : isHemera ? "☀️" : isLifeweaver ? "🌿" : isRagtis ? "🐉" : "❖";
    if (cardTierTxt) cardTierTxt.textContent = isHecate || isSkadi || isIgnalion || isWarrior || isBeelzebub || isNyx || isHemera || isLifeweaver || isRagtis ? "EX" : "SUMMON";

    // Start 60fps Canvas FX & Background Ritual Charge Audio
    startCanvasSummonFx(tierSpec, totalMs, specialVariant);
    playSummonChargeSfx(tierSpec.level, totalMs / 1000, specialVariant);

    // ==================== BEAT 1: 跳出大字 — 古言靈術／稱號／武器 ====================
    const voiceLine = extractCharacterSummonVoiceLine(featuredChar);
    featuredChar.summonVoiceLine = voiceLine;
    showGiantImpactText(voiceLine.text, "mode-quote");
    triggerCanvasStepImpact(
      isHecate
        ? "#f97316"
        : isSkadi
        ? "#9333ea"
        : isIgnalion
        ? "#f59e0b"
        : isWarrior
        ? "#ea580c"
        : isBeelzebub
        ? "#dc2626"
        : isNyx
        ? "#38bdf8"
        : isHemera
        ? "#f59e0b"
        : isLifeweaver
        ? "#22c55e"
        : isRagtis
        ? "#a855f7"
        : "#38bdf8",
      isHecate || isSkadi || isIgnalion || isWarrior || isBeelzebub || isNyx || isHemera || isLifeweaver || isRagtis
    );
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
        if (specialVariant === "hecate-death") {
          viewport.classList.add("is-hecate-death");
        } else if (specialVariant === "skadi-darkness") {
          viewport.classList.add("is-skadi-darkness");
        } else if (specialVariant === "ignalion-holyfire") {
          viewport.classList.add("is-ignalion-holyfire");
        } else if (specialVariant === "warrior-arena") {
          viewport.classList.add("is-warrior-arena");
        } else if (specialVariant === "beelzebub-swarm") {
          viewport.classList.add("is-beelzebub-swarm");
        } else if (specialVariant === "nyx-moon-stars") {
          viewport.classList.add("is-nyx-moon-stars");
        } else if (specialVariant === "hemera-sun") {
          viewport.classList.add("is-hemera-sun");
        } else if (specialVariant === "lifeweaver-verdant") {
          viewport.classList.add("is-lifeweaver-verdant");
        } else if (specialVariant === "ragtis-dragonslayer") {
          viewport.classList.add("is-ragtis-dragonslayer");
        } else if (specialVariant === "phenom-the-abyss") {
          viewport.classList.add("is-abyss-depths");
        } else if (specialVariant === "phenom-lycia-void") {
          viewport.classList.add("is-void-erasure");
        } else if (specialVariant === "apocalypse-dragon" || tierSpec.level === 7) {
          viewport.classList.add("is-apocalypse-dragon");
        } else if (tierSpec.level === 6) {
          viewport.classList.add("is-ex-singularity");
        } else if (tierSpec.level === 8) {
          viewport.classList.add("is-evil-abyss");
        }
      }
      if (card3d) {
        card3d.classList.add("is-card-upgraded");
      }
      if (coreSymEl) {
        coreSymEl.textContent =
          specialVariant === "hecate-death"
            ? "🕸️"
            : specialVariant === "skadi-darkness"
            ? "👑"
            : specialVariant === "ignalion-holyfire"
            ? "🔥"
            : specialVariant === "warrior-arena"
            ? "⚔️"
            : specialVariant === "beelzebub-swarm"
            ? "🪰"
            : specialVariant === "nyx-moon-stars"
            ? "🌙"
            : specialVariant === "hemera-sun"
            ? "☀️"
            : specialVariant === "lifeweaver-verdant"
            ? "🌿"
            : specialVariant === "ragtis-dragonslayer"
            ? "🐉"
            : specialVariant === "phenom-the-abyss"
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
        stopAllSummonAudio();
        finishSummonAndReveal(featuredChar, batch, isPreviewOnly, true);
      };
    }
  }

  function finishSummonAndReveal(featuredChar, batch, isPreviewOnly = false, isSkipped = false) {
    clearActiveSummonTimers();
    if (isSkipped) {
      stopAllSummonAudio();
    }
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
        "is-hecate-death",
        "is-skadi-darkness",
        "is-ignalion-holyfire",
        "is-warrior-arena",
        "is-beelzebub-swarm",
        "is-nyx-moon-stars",
        "is-hemera-sun",
        "is-lifeweaver-verdant",
        "is-ragtis-dragonslayer",
        "is-climax-finale"
      );
    }

    // Trigger screen flash (bespoke flash colors for Seth / The Abyss / Lycia / Apocalypse Dragon / Hecate / Skadi / Ignalion / Warrior / Beelzebub / Nyx / Hemera / Lifeweaver / Ragtis!)
    if (flashEl) {
      flashEl.classList.remove(
        "is-flashing",
        "is-evil-flash",
        "is-abyss-flash",
        "is-void-flash",
        "is-dragon-flash",
        "is-hecate-flash",
        "is-skadi-flash",
        "is-ignalion-flash",
        "is-warrior-flash",
        "is-beelzebub-flash",
        "is-nyx-flash",
        "is-hemera-flash",
        "is-lifeweaver-flash",
        "is-ragtis-flash"
      );
      void flashEl.offsetWidth;
      if (specialVariant === "hecate-death") {
        flashEl.classList.add("is-hecate-flash");
      } else if (specialVariant === "skadi-darkness") {
        flashEl.classList.add("is-skadi-flash");
      } else if (specialVariant === "ignalion-holyfire") {
        flashEl.classList.add("is-ignalion-flash");
      } else if (specialVariant === "warrior-arena") {
        flashEl.classList.add("is-warrior-flash");
      } else if (specialVariant === "beelzebub-swarm") {
        flashEl.classList.add("is-beelzebub-flash");
      } else if (specialVariant === "nyx-moon-stars") {
        flashEl.classList.add("is-nyx-flash");
      } else if (specialVariant === "hemera-sun") {
        flashEl.classList.add("is-hemera-flash");
      } else if (specialVariant === "lifeweaver-verdant") {
        flashEl.classList.add("is-lifeweaver-flash");
      } else if (specialVariant === "ragtis-dragonslayer") {
        flashEl.classList.add("is-ragtis-flash");
      } else if (specialVariant === "phenom-the-abyss") {
        flashEl.classList.add("is-abyss-flash");
      } else if (specialVariant === "phenom-lycia-void") {
        flashEl.classList.add("is-void-flash");
      } else if (specialVariant === "apocalypse-dragon" || tierSpec.level === 7) {
        flashEl.classList.add("is-dragon-flash");
      } else if (tierSpec.level === 8) {
        flashEl.classList.add("is-evil-flash");
      }
      flashEl.classList.add("is-flashing");
    }
    triggerCanvasRevealBurst(tierSpec);
    if (!isSkipped) {
      playSummonRevealSfx(tierSpec.level, specialVariant);
    }

    // Commit stats & history ONLY NOW after the animation finishes!
    if (!isPreviewOnly && batch && batch.length > 0) {
      summonState.totalPulls += batch.length;
      batch.forEach((c) => {
        summonState.unlockedIds.add(c.id);
        // Exclude UR (level 5): Only count EX / Legend / ？ (level >= 6)
        if (c.summonTier && c.summonTier.level >= 6) {
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
      renderCharacterDexModal();
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
            <span class="scr-stars ${tier.level === 7 ? 'legend-black-stars' : ''}">${esc(tier.stars)}</span>
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
      grid.innerHTML = [8, 7, 6, 5, 4, 3, 2, 1]
        .map((lvl) => {
          const t = SUMMON_TIERS[lvl];
          const sampleChars = characters.filter((c) => c.summonTier && c.summonTier.level === lvl);
          const sampleNames = sampleChars
            .slice(0, 5)
            .map((c) => c.name)
            .join("、");
          const ratePct = (t.tierTargetRate * 100).toFixed(1);

          let specialPreviewHtml = "";
          if (lvl === 8) {
            specialPreviewHtml = `
              <div class="tgc-menu-container">
                <div class="tgc-preview-select-row">
                  <div class="tgc-select-wrap">
                    <select class="tgc-tier-select" data-tier-select="${lvl}">
                      <option value="char-2">👁️ 賽特 伊斐爾〔邪惡風格〕</option>
                      <option value="char-19">🌊 The Abyss〔深淵風格〕</option>
                      <option value="char-15">🌌 莉琪雅 神隱〔虛空風格〕</option>
                    </select>
                    <span class="tgc-select-arrow">▾</span>
                  </div>
                  <button type="button" class="tgc-preview-btn tgc-run-select-btn" data-run-tier-select="${lvl}">
                    <span>🎬 立即試播</span>
                  </button>
                </div>
                <details class="tgc-preview-accordion">
                  <summary class="tgc-preview-accordion-summary">
                    <span>📋 展開/收合所有按鈕選單（共 3 款）</span>
                    <span class="tgc-accordion-chevron">▾</span>
                  </summary>
                  <div class="tgc-special-previews is-grid">
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
                </details>
              </div>
            `;
          } else if (lvl === 7) {
            specialPreviewHtml = `
              <div class="tgc-special-previews">
                <button type="button" class="tgc-preview-btn is-dragon-btn" data-preview-char-id="char-37">
                  <span>🐉 試播：赤夜 終焉龍〔滅世風格＋震天龍吼〕</span>
                </button>
              </div>
            `;
          } else if (lvl === 6) {
            specialPreviewHtml = `
              <div class="tgc-menu-container">
                <div class="tgc-preview-select-row">
                  <div class="tgc-select-wrap">
                    <select class="tgc-tier-select" data-tier-select="${lvl}">
                      <option value="char-38">🐉 拉格提斯〔弒神狂龍・巨龍與大劍〕</option>
                      <option value="char-21">🌿 萊夫維芙〔生意盎然・原初生命女神〕</option>
                      <option value="char-13">☀️ 迪米諾拉 赫墨拉〔烈陽風格・日耀女神〕</option>
                      <option value="char-12">🌙 尤諾拉 倪克斯〔月亮與星空・黑夜女神〕</option>
                      <option value="char-32">🪰 別西卜 阿斯拉 撒旦〔暴食血紅・群蠅暴虐〕</option>
                      <option value="char-25">⚔️ 沃利爾 德瑪〔戰爭・古羅馬競技場〕</option>
                      <option value="char-7">🔥 伊格那利昂 加拉爾〔熊熊聖火・帝國王道〕</option>
                      <option value="char-10">👑 暗 斯卡奇〔霸王之暗・黑色暴君〕</option>
                      <option value="char-106">🕸️ 黑卡蒂 拉普拉斯〔死亡冥焰・命運絲線〕</option>
                      <option value="tier-6">🎬 EX 通用神聖演出</option>
                    </select>
                    <span class="tgc-select-arrow">▾</span>
                  </div>
                  <button type="button" class="tgc-preview-btn tgc-run-select-btn" data-run-tier-select="${lvl}">
                    <span>🎬 立即試播</span>
                  </button>
                </div>
                <details class="tgc-preview-accordion">
                  <summary class="tgc-preview-accordion-summary">
                    <span>📋 展開/收合所有按鈕選單（共 10 款）</span>
                    <span class="tgc-accordion-chevron">▾</span>
                  </summary>
                  <div class="tgc-special-previews is-grid">
                    <button type="button" class="tgc-preview-btn is-ragtis-btn" data-preview-char-id="char-38">
                      <span>🐉 試播：拉格提斯〔弒神狂龍・巨龍與大劍〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-lifeweaver-btn" data-preview-char-id="char-21">
                      <span>🌿 試播：萊夫維芙〔生意盎然・原初生命女神〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-hemera-btn" data-preview-char-id="char-13">
                      <span>☀️ 試播：迪米諾拉 赫墨拉〔烈陽風格・日耀女神〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-nyx-btn" data-preview-char-id="char-12">
                      <span>🌙 試播：尤諾拉 倪克斯〔月亮與星空・黑夜女神〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-beelzebub-btn" data-preview-char-id="char-32">
                      <span>🪰 試播：別西卜 阿斯拉 撒旦〔暴食血紅・群蠅暴虐〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-warrior-btn" data-preview-char-id="char-25">
                      <span>⚔️ 試播：沃利爾 德瑪〔戰爭・古羅馬競技場〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-ignalion-btn" data-preview-char-id="char-7">
                      <span>🔥 試播：伊格那利昂 加拉爾〔熊熊聖火・帝國王道〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-skadi-btn" data-preview-char-id="char-10">
                      <span>👑 試播：暗 斯卡奇〔霸王之暗・黑色暴君〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn is-hecate-btn" data-preview-char-id="char-106">
                      <span>🕸️ 試播：黑卡蒂 拉普拉斯〔死亡冥焰・命運絲線〕</span>
                    </button>
                    <button type="button" class="tgc-preview-btn" data-preview-tier="${lvl}">
                      <span>🎬 試播：EX 通用神聖演出</span>
                    </button>
                  </div>
                </details>
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
              <h3 class="tgc-title">${esc(t.fullTitle)} <span class="tgc-stars-span ${lvl === 7 ? 'legend-black-stars' : ''}">${esc(t.stars)}</span></h3>
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

      grid.querySelectorAll("[data-run-tier-select]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lvl = btn.getAttribute("data-run-tier-select");
          const sel = grid.querySelector(`select[data-tier-select="${lvl}"]`);
          if (!sel) return;
          const val = sel.value;
          if (val.startsWith("char-")) {
            const targetChar = characters.find((c) => c.id === val);
            if (targetChar) {
              if (modal) modal.classList.add("hidden");
              playSummonSequenceForCharacter(targetChar, [targetChar], true);
            }
          } else if (val.startsWith("tier-")) {
            const tLvl = Number(val.replace("tier-", ""));
            const pool = characters.filter(
              (c) =>
                c.summonTier &&
                c.summonTier.level === tLvl &&
                (tLvl !== 6 ||
                  (c.id !== "char-37" &&
                    c.id !== "char-106" &&
                    c.id !== "char-10" &&
                    c.id !== "char-7" &&
                    c.id !== "char-25" &&
                    c.id !== "char-32" &&
                    c.id !== "char-12" &&
                    c.id !== "char-13"))
            );
            if (pool.length > 0) {
              if (modal) modal.classList.add("hidden");
              const sample = pool[Math.floor(Math.random() * pool.length)];
              playSummonSequenceForCharacter(sample, [sample], true);
            }
          }
        });
      });

      grid.querySelectorAll("[data-preview-tier]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lvl = Number(btn.getAttribute("data-preview-tier"));
          const pool = characters.filter(
            (c) =>
              c.summonTier &&
              c.summonTier.level === lvl &&
              (lvl !== 6 ||
                (c.id !== "char-37" &&
                  c.id !== "char-106" &&
                  c.id !== "char-10" &&
                  c.id !== "char-7" &&
                  c.id !== "char-25" &&
                  c.id !== "char-32" &&
                  c.id !== "char-12" &&
                  c.id !== "char-13"))
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

  // ==================== CHARACTER ARCHIVE / DEX MODAL ====================
  let dexFilterStatus = "missing"; // "all" | "missing" | "unlocked"
  let dexFilterTier = null; // null for all, or 1..8
  let dexSearchQuery = "";

  function initCharacterDexModal() {
    const modal = document.getElementById("summonDexModal");
    const openBtnNav = document.getElementById("btnOpenDexModal");
    const openBtnStats = document.getElementById("btnOpenDexFromStats");
    const closeBtn = document.getElementById("btnCloseDexModal");
    const backdrop = document.getElementById("dexModalBackdrop");
    const searchInput = document.getElementById("dexSearchInput");
    const clearSearchBtn = document.getElementById("btnDexClearSearch");

    function openDex(defaultTab) {
      if (defaultTab) {
        dexFilterStatus = defaultTab;
      }
      renderCharacterDexModal();
      if (modal) modal.classList.remove("hidden");
    }

    function closeDex() {
      if (modal) modal.classList.add("hidden");
    }

    if (openBtnNav) openBtnNav.addEventListener("click", () => openDex("all"));
    if (openBtnStats) openBtnStats.addEventListener("click", () => openDex("missing"));
    if (closeBtn) closeBtn.addEventListener("click", closeDex);
    if (backdrop) backdrop.addEventListener("click", closeDex);

    // Escape key closes modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
        closeDex();
      }
    });

    // Status tabs (全部 / 尚未抽到 / 已經抽到)
    document.querySelectorAll(".dex-status-tab[data-dex-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        dexFilterStatus = btn.getAttribute("data-dex-status") || "all";
        renderCharacterDexModal();
      });
    });

    // Search input (debounced for 60fps responsiveness)
    let searchDebounceTimer = null;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          dexSearchQuery = (e.target.value || "").trim().toLowerCase();
          if (clearSearchBtn) {
            clearSearchBtn.classList.toggle("hidden", dexSearchQuery.length === 0);
          }
          renderCharacterDexModal();
        }, 120);
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener("click", () => {
        clearTimeout(searchDebounceTimer);
        dexSearchQuery = "";
        searchInput.value = "";
        clearSearchBtn.classList.add("hidden");
        renderCharacterDexModal();
      });
    }
  }

  function renderCharacterDexModal() {
    const modal = document.getElementById("summonDexModal");
    if (!modal) return;

    const unlockedSet = summonState.unlockedIds;
    const totalCount = characters.length;
    const unlockedCount = unlockedSet.size;
    const missingCount = Math.max(0, totalCount - unlockedCount);
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // Update progress ribbon
    const sumUnlocked = document.getElementById("dexSummaryUnlocked");
    const sumMissing = document.getElementById("dexSummaryMissing");
    const sumPct = document.getElementById("dexSummaryPct");
    const barFill = document.getElementById("dexProgressBarFill");
    const tabMissingCnt = document.getElementById("dexTabMissingCount");
    const tabUnlockedCnt = document.getElementById("dexTabUnlockedCount");

    if (sumUnlocked) sumUnlocked.textContent = unlockedCount;
    if (sumMissing) sumMissing.textContent = missingCount;
    if (sumPct) sumPct.textContent = `${pct}%`;
    if (barFill) barFill.style.width = `${pct}%`;
    if (tabMissingCnt) tabMissingCnt.textContent = missingCount;
    if (tabUnlockedCnt) tabUnlockedCnt.textContent = unlockedCount;

    // Update status tabs active state
    document.querySelectorAll(".dex-status-tab[data-dex-status]").forEach((btn) => {
      const st = btn.getAttribute("data-dex-status");
      btn.classList.toggle("is-active", st === dexFilterStatus);
    });

    // Render tier filter pills row with counts
    const tierRow = document.getElementById("dexTierPillsRow");
    if (tierRow) {
      const tierStats = { 8: { u: 0, t: 0 }, 7: { u: 0, t: 0 }, 6: { u: 0, t: 0 }, 5: { u: 0, t: 0 }, 4: { u: 0, t: 0 }, 3: { u: 0, t: 0 }, 2: { u: 0, t: 0 }, 1: { u: 0, t: 0 } };
      characters.forEach((c) => {
        const lvl = c.summonTier ? c.summonTier.level : 1;
        if (tierStats[lvl]) {
          tierStats[lvl].t++;
          if (unlockedSet.has(c.id)) tierStats[lvl].u++;
        }
      });

      const allActive = dexFilterTier === null;
      let pillsHtml = `
        <button type="button" class="dex-tier-pill ${allActive ? "is-active" : ""}" data-dex-tier="all">
          <span>全部階級</span>
          <small>(${unlockedCount}/${totalCount})</small>
        </button>
      `;

      [8, 7, 6, 5, 4, 3, 2, 1].forEach((lvl) => {
        const t = SUMMON_TIERS[lvl];
        const s = tierStats[lvl];
        const isAct = dexFilterTier === lvl;
        pillsHtml += `
          <button type="button" class="dex-tier-pill ${isAct ? "is-active" : ""}" data-dex-tier="${lvl}">
            <b>${esc(t.code)}</b>
            <small>(${s.u}/${s.t})</small>
          </button>
        `;
      });
      tierRow.innerHTML = pillsHtml;

      tierRow.querySelectorAll("[data-dex-tier]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = btn.getAttribute("data-dex-tier");
          dexFilterTier = val === "all" ? null : Number(val);
          renderCharacterDexModal();
        });
      });
    }

    // Filter characters
    let filtered = characters.filter((c) => {
      const isUnlocked = unlockedSet.has(c.id);

      // Status filter
      if (dexFilterStatus === "missing" && isUnlocked) return false;
      if (dexFilterStatus === "unlocked" && !isUnlocked) return false;

      // Tier filter
      const lvl = c.summonTier ? c.summonTier.level : 1;
      if (dexFilterTier !== null && lvl !== dexFilterTier) return false;

      // Search query
      if (dexSearchQuery) {
        const name = (c.name || "").toLowerCase();
        const epithet = String(c.profile["稱號"] || "").toLowerCase();
        const power = (c.power || "").toLowerCase();
        const race = String(c.profile["種族"] || "").toLowerCase();
        const faction = (c.faction || "").toLowerCase();
        const match =
          name.includes(dexSearchQuery) ||
          epithet.includes(dexSearchQuery) ||
          power.includes(dexSearchQuery) ||
          race.includes(dexSearchQuery) ||
          faction.includes(dexSearchQuery);
        if (!match) return false;
      }
      return true;
    });

    // Sort: highest rarity tier first, then unlocked/missing, then power score
    filtered.sort((a, b) => {
      const lvlA = a.summonTier ? a.summonTier.level : 1;
      const lvlB = b.summonTier ? b.summonTier.level : 1;
      if (lvlB !== lvlA) return lvlB - lvlA;
      return (a.powerScore || 99) - (b.powerScore || 99);
    });

    const grid = document.getElementById("dexCardsGrid");
    const emptyState = document.getElementById("dexEmptyState");
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }
    if (emptyState) emptyState.classList.add("hidden");

    grid.innerHTML = filtered
      .map((c) => {
        const isUnlocked = unlockedSet.has(c.id);
        const tier = c.summonTier || SUMMON_TIERS[1];
        const rawEpithet = String(c.profile["稱號"] || "").trim();
        const epithet = isMeaningfulContent(rawEpithet) ? rawEpithet : "";
        const thumb = getPortraitUrl(c.image);
        const race = String(c.profile["種族"] || "未知種族").trim();

        return `
          <article class="dex-card tier-card-lv-${tier.level} ${isUnlocked ? "is-unlocked" : "is-locked"}" data-char-id="${esc(c.id)}">
            <div class="dex-card-top">
              <span class="scr-tier-badge tier-badge-lv-${tier.level}">
                <span>${esc(tier.code)}</span>
              </span>
              <span class="dex-card-status-badge ${isUnlocked ? "is-unlocked" : "is-missing"}">
                ${isUnlocked ? "✨ 已解鎖" : "🔒 尚未抽到"}
              </span>
            </div>

            <div class="dex-card-avatar-wrap">
              ${
                thumb
                  ? `<img src="${esc(thumb)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />`
                  : `<div class="dex-card-placeholder-sym">${esc(tier.code)}</div>`
              }
              ${
                !isUnlocked
                  ? `<div class="dex-card-lock-overlay"><span>🔒</span><small>尚未抽到</small></div>`
                  : ""
              }
            </div>

            <div class="dex-card-info">
              <h3 class="dex-card-name" title="${esc(c.name)}">${esc(c.name)}</h3>
              <div class="dex-card-subline">
                <span class="dex-card-power">⚡ ${esc(c.power || "未知強度")}</span>
                <span class="dex-card-race">${esc(race)}</span>
              </div>
              ${epithet ? `<div class="dex-card-subline"><small>《${esc(epithet)}》</small></div>` : ""}
            </div>

            <div class="dex-card-actions">
              ${
                isUnlocked
                  ? `<button type="button" class="dex-card-btn is-preview" data-dex-play-anim="${esc(c.id)}" title="試播此角色的召喚抽卡動畫">🎬 試播動畫</button>
                     <a href="compare.html?left=${encodeURIComponent(c.id)}" target="_blank" rel="noopener" class="dex-card-btn is-compare" title="於能力對比系統中檢視">⚔️ 能力對比</a>`
                  : `<span class="dex-card-btn is-locked-hint">可在卡池中抽取獲得</span>`
              }
            </div>
          </article>
        `;
      })
      .join("");

    // Wire up preview animation buttons
    grid.querySelectorAll("[data-dex-play-anim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cId = btn.getAttribute("data-dex-play-anim");
        const target = characters.find((ch) => ch.id === cId);
        if (target) {
          if (modal) modal.classList.add("hidden");
          playSummonSequenceForCharacter(target, [target], true);
        }
      });
    });
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
        if (summonState.sfxEnabled && summonState.sfxVolume > 0) {
          // 靜音
          summonState.lastSfxVolume = summonState.sfxVolume || 0.8;
          try {
            localStorage.setItem("arelita_summon_last_volume", String(summonState.lastSfxVolume));
          } catch (e) {}
          setSummonVolume(0, false);
        } else {
          // 解除靜音，恢復前次音量
          const restoreVol = Math.round((summonState.lastSfxVolume || 0.8) * 100);
          setSummonVolume(restoreVol > 0 ? restoreVol : 80, true);
        }
      });
    }

    const volumeSlider = document.getElementById("summonVolumeSlider");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        setSummonVolume(Number(e.target.value), false);
      });
      volumeSlider.addEventListener("change", (e) => {
        setSummonVolume(Number(e.target.value), true);
      });
    }

    // 初始化時同步音量介面
    updateVolumeUI();

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
        renderCharacterDexModal();
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

    // Global keyboard shortcut: Press Spacebar to skip summon animation immediately!
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
        const tag = document.activeElement ? document.activeElement.tagName : "";
        if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) {
          return;
        }
        if (summonState.isSummoning) {
          e.preventDefault();
          const skipBtn = document.getElementById("btnSkipSummonAnim");
          if (skipBtn && !skipBtn.classList.contains("hidden")) {
            skipBtn.click();
          }
        }
      }
    });
  }

  // Boot Summon Simulator
  applySummonTheme(summonState.theme);
  loadSavedSummonStats();
  initPreferenceControls();
  syncPreferenceUI();
  renderStatsAndHistory();
  initTierGuideModal();
  initCharacterDexModal();
  initSummonHeaderAndActions();
})();
