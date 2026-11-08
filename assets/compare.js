(function () {
  "use strict";

  const DATA = window.ARELITA_DATA || { characters: [], attributeCategories: [] };
  const characters = Array.isArray(DATA.characters) ? DATA.characters : [];
  const attributeCategories = Array.isArray(DATA.attributeCategories) ? DATA.attributeCategories : [];

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

  const REALM_ORDER = ["現界", "魔界", "天界", "其他"];
  const FACTION_ORDER = [
    "魔風聯邦", "極真圃", "影風之巔", "寂靜之音", "銀狼傭兵公會",
    "世界賢者館", "東方滅魔館", "亞雷利塔魔法之根協會", "月星民國",
    "日天聯邦", "卡姆利亞獸人聯邦", "新世生命教", "天災", "凱撒家族",
    "天界", "神明", "傳奇", "流浪者", "邪神"
  ];
  const SUBFACTION_ORDER = [
    "最高層", "冥府神傑", "獨立特級", "魔風軍團",
    "魔風軍團 / 雷霆殿", "魔風軍團 / 紅蓮組", "魔風軍團 / 戰龍",
    "魔風軍團 / 潔白協奏", "魔風軍團 / 夜妖", "魔風軍團 / 墮天光輝",
    "魔風軍團 / 血魔之影", "魔風軍團 / 陰暗幽鬼",
    "SECT「特殊事件對策組」", "獄炎監察部隊", "魔風審判庭", "公安局"
  ];
  const POWER_TIER_ORDER = [
    "現象級", "終世級", "降臨級", "神座級",
    "神王", "古神", "神明", "準神", "魔王",
    "英雄", "龍獸", "天罰", "猛鬼", "精靈", "魔導", "騎士", "魔獸", "猛獸", "凡人"
  ];

  function sortFactions(a, b) {
    const ia = FACTION_ORDER.indexOf(a);
    const ib = FACTION_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "zh-Hant");
  }

  function sortSubFactions(a, b) {
    const ia = SUBFACTION_ORDER.indexOf(a);
    const ib = SUBFACTION_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "zh-Hant");
  }

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
  // Each index is exactly 1 step / 階級.
  // Rule: 不超過三個階級 (i.e. 差距小於 3 個階級，最大相差 2 個小階級: Math.abs(rankA - rankB) <= 2)
  // User example:
  //   - 神王一級 (idx 6) vs 古神二級 (idx 8) -> 差距 2 (允許)
  //   - 神王一級 (idx 6) vs 古神一級 (idx 9) -> 差距 3 (禁止！)
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
    // 1. Direct match on power ladder
    for (let i = 0; i < POWER_LADDER.length; i++) {
      if (p.includes(POWER_LADDER[i])) {
        return { tierIdx: i, subGrade: 0, score: i };
      }
    }
    // 2. Handle subgrade without the exact string
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

  // Build attribute lookup map (attrName -> category id & record)
  const attrToCategoryMap = new Map();
  attributeCategories.forEach((cat) => {
    const items = toArray(cat.items);
    items.forEach((item) => {
      attrToCategoryMap.set(item.name, cat.id);
      if (item.name.includes("/")) {
        item.name.split("/").forEach((part) => {
          const clean = part.trim();
          if (clean && !attrToCategoryMap.has(clean)) {
            attrToCategoryMap.set(clean, cat.id);
          }
        });
      }
    });
  });
  if (attrToCategoryMap.has("黑神之炎") && !attrToCategoryMap.has("黑神之火")) {
    attrToCategoryMap.set("黑神之火", attrToCategoryMap.get("黑神之炎"));
  }

  // Enrich character objects for fast multi-dimensional filtering
  characters.forEach((c) => {
    c.identities = toArray(c.identities);
    c.abilities = toArray(c.abilities);
    c.profile = c.profile || {};
    c.subFaction = c.subFaction || "";
    c.power = c.power || "";
    const pRank = computePowerRank(c.power);
    c.powerTierIdx = pRank.tierIdx;
    c.powerScore = pRank.score;
    c.raceCategories = extractCharacterRaces(c.profile["種族"]);
    c.attrTokens = parseAttributeTokens(c.profile["屬性"]);

    // Map character's attributes to 17 category IDs
    const catSet = new Set();
    c.attrTokens.forEach((tok) => {
      if (attrToCategoryMap.has(tok)) {
        catSet.add(attrToCategoryMap.get(tok));
      } else if (tok.includes("/")) {
        tok.split("/").forEach((sub) => {
          const clean = sub.trim();
          if (attrToCategoryMap.has(clean)) catSet.add(attrToCategoryMap.get(clean));
        });
      }
    });
    c.attrCatIds = Array.from(catSet);

    // Build all combat abilities list (Weapon + Abilities)
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
    c.abilityTypes = Array.from(new Set(combatList.map((a) => a.type)));
  });

  // Attribute Individual Visual & Color-Block Design System (156 種屬性個別配色，與主頁面 100% 同步)
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

    // 十五、粉碎、破壞毀滅與戰爭（4 種）
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

    // 十七、特殊屬性、法則概念與始源（15 種）
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

  function getAttributeBadgeStyle(attrName) {
    return getAttributeVisual(attrName).style;
  }

  function renderAttributeBadgesHtml(tokens, highlightSet = null) {
    if (!tokens || tokens.length === 0) return `<span class="meta-val">無</span>`;
    return `<div class="attr-badges-wrap">
      ${tokens
        .map((t) => {
          const v = getAttributeVisual(t);
          const isShared = highlightSet && highlightSet.has(t);
          const sharedClass = isShared ? "is-shared-attr" : "";
          const supremeClass = v.isSupreme ? "is-supreme" : "";
          const sharedTag = isShared ? ` title="雙方共同持有屬性：${esc(t)}"` : "";
          return `<span class="attr-color-badge ${supremeClass} ${sharedClass}" style="${v.style}"${sharedTag}><span>${isShared ? "✦ " : ""}${esc(t)}</span></span>`;
        })
        .join("")}
    </div>`;
  }

  function formatCharacterDisplayName(name) {
    if (!name) return "";
    let safe = esc(name);
    return safe.replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
  }

  function formatAbilityText(text) {
    let safe = esc(text);
    safe = safe.replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
    safe = safe.replace(/(^|\n|[。！？）)\s])\s*-([^-\n]{1,120})-/g, (match, prefix, name) => {
      const br = prefix === "" || prefix === "\n" ? prefix : `${prefix}\n`;
      return `${br}<span class="skill-subname">❖ ${name.trim()}</span>`;
    });
    safe = safe.replace(/「“([^”]+)”」/g, '<span class="skill-subname">「$1」</span>');
    return safe;
  }

  function getAbilityStyleClass(type) {
    if (type === "武器") return "type-weapon";
    if (["神權", "神言", "神器", "眷屬權能"].includes(type)) return "type-divine";
    if (["古言靈術", "虛能", "魔眼", "九紋龍印", "深淵能力"].includes(type)) return "type-ancient";
    if (["最高等術式", "共鳴", "世界共鳴", "亞雷利塔光環"].includes(type)) return "type-supreme";
    return "";
  }

  function getPortraitUrl(imgPath) {
    if (!imgPath) return "";
    return String(imgPath).replace(/^亞雷利塔角色形象[\/\\]/, "assets/portraits/");
  }

  // ==================== DUAL-WINDOW COMPARISON STATE ====================
  function createFilterState() {
    return {
      search: "",
      realm: "",
      faction: "",
      subFaction: "",
      power: "",
      race: "",
      align: "",
      attrCat: "",
      attrItem: "",
      abilityType: ""
    };
  }

  const compareState = {
    theme: localStorage.getItem("arelita_theme") || "ocean",
    leftCharId: "",
    rightCharId: "",
    leftPickerOpen: false,
    rightPickerOpen: false,
    filters: {
      left: createFilterState(),
      right: createFilterState()
    }
  };

  // Initialize selected characters from URL query params or sensible defaults
  function initSelectedCharacters() {
    const params = new URLSearchParams(window.location.search);
    const qLeft = params.get("left");
    const qRight = params.get("right");
    const savedLeft = localStorage.getItem("arelita_compare_left");
    const savedRight = localStorage.getItem("arelita_compare_right");

    const findValidId = (candidate) => {
      if (!candidate) return "";
      const found = characters.find((c) => c.id === candidate || c.name === candidate || c.fileName === candidate);
      return found ? found.id : "";
    };

    compareState.leftCharId =
      findValidId(qLeft) ||
      findValidId(savedLeft) ||
      (characters[0] ? characters[0].id : "");

    compareState.rightCharId =
      findValidId(qRight) ||
      findValidId(savedRight) ||
      (characters.length > 1 ? characters[1].id : "");

    if (compareState.leftCharId === compareState.rightCharId && characters.length > 1) {
      const alt = characters.find((c) => c.id !== compareState.leftCharId);
      if (alt) compareState.rightCharId = alt.id;
    }

    // If URL explicitly passed only ?left=..., open the right picker so user can immediately pick the opponent!
    if (qLeft && !qRight) {
      compareState.rightPickerOpen = true;
    }
  }

  function syncUrlAndStorage() {
    try {
      if (compareState.leftCharId) {
        localStorage.setItem("arelita_compare_left", compareState.leftCharId);
      }
      if (compareState.rightCharId) {
        localStorage.setItem("arelita_compare_right", compareState.rightCharId);
      }
      const url = new URL(window.location.href);
      if (compareState.leftCharId) url.searchParams.set("left", compareState.leftCharId);
      else url.searchParams.delete("left");
      if (compareState.rightCharId) url.searchParams.set("right", compareState.rightCharId);
      else url.searchParams.delete("right");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  }

  // ==================== POPULATE FINE-GRAINED FILTER OPTIONS ====================
  const ABILITY_GROUP_FILTERS = [
    { value: "GROUP_WEAPON", label: "⚔️ 武器武裝（持有專屬武器）", match: (c) => c.abilityTypes.includes("武器") },
    { value: "GROUP_DIVINE", label: "👑 神格權能（神權／神器／神言／眷屬權能）", match: (c) => c.abilityTypes.some((t) => ["神權", "神器", "神言", "眷屬權能"].includes(t)) },
    { value: "GROUP_ANCIENT", label: "📜 古言靈術（詠唱言靈法則）", match: (c) => c.abilityTypes.includes("古言靈術") },
    { value: "GROUP_RESONANCE", label: "✨ 世界共鳴与極致術式（世界共鳴／共鳴／最高等術式／光環）", match: (c) => c.abilityTypes.some((t) => ["世界共鳴", "共鳴", "最高等術式", "亞雷利塔光環"].includes(t)) },
    { value: "GROUP_VOID_ABYSS", label: "🌌 虛空與深淵（虛能／深淵能力）", match: (c) => c.abilityTypes.some((t) => ["虛能", "深淵能力"].includes(t)) },
    { value: "GROUP_OCULAR_DRAGON", label: "🐉 特殊血脈刻印（九紋龍印／魔眼）", match: (c) => c.abilityTypes.some((t) => ["九紋龍印", "魔眼"].includes(t)) },
    { value: "GROUP_BLESS_CURSE", label: "🛡️ 加護與詛咒（加護／詛咒／亡靈病／改造）", match: (c) => c.abilityTypes.some((t) => ["加護", "詛咒", "亡靈病", "改造"].includes(t)) },
    { value: "GROUP_MAGIC_SKILL", label: "🔮 常規與獨有體系（魔法／異能／幻能／獨有術式／能力）", match: (c) => c.abilityTypes.some((t) => ["魔法", "異能", "幻能", "獨有術式", "能力", "額外能力"].includes(t)) },
    { value: "HAS_PORTRAIT", label: "🖼️ 附帶角色立繪形象圖", match: (c) => Boolean(c.image) }
  ];

  function matchesAlignmentFilter(charAlign, filterVal) {
    if (!filterVal) return true;
    const raw = String(charAlign || "").trim();
    if (filterVal === "GROUP_GOOD") return /善/.test(raw);
    if (filterVal === "GROUP_NEUTRAL") return /中立/.test(raw);
    if (filterVal === "GROUP_EVIL") return /惡/.test(raw);
    return raw === filterVal || raw.includes(filterVal);
  }

  function matchesAbilityFilter(c, filterVal) {
    if (!filterVal) return true;
    const groupObj = ABILITY_GROUP_FILTERS.find((g) => g.value === filterVal);
    if (groupObj) return groupObj.match(c);
    return c.abilityTypes.includes(filterVal);
  }

  function initStaticFilterSelects(side) {
    const suffix = side === "left" ? "Left" : "Right";

    // Realm
    const realmSel = document.getElementById(`realm${suffix}`);
    if (realmSel) {
      realmSel.innerHTML = `<option value="">全部界域 (${characters.length})</option>`;
      REALM_ORDER.forEach((r) => {
        const cnt = characters.filter((c) => c.realm === r).length;
        if (cnt > 0) {
          realmSel.innerHTML += `<option value="${esc(r)}">【${esc(r)}】 (${cnt})</option>`;
        }
      });
    }

    // Power Tier
    const powerSel = document.getElementById(`power${suffix}`);
    if (powerSel) {
      powerSel.innerHTML = `<option value="">全部強度階級</option>`;
      POWER_TIER_ORDER.forEach((tier) => {
        const cnt = characters.filter((c) => c.power.includes(tier)).length;
        if (cnt > 0) {
          powerSel.innerHTML += `<option value="${esc(tier)}">${esc(tier)} (${cnt})</option>`;
        }
      });
    }

    // Race
    const raceSel = document.getElementById(`race${suffix}`);
    if (raceSel) {
      raceSel.innerHTML = `<option value="">全部種族</option>`;
      CANONICAL_RACES.forEach((race) => {
        const cnt = characters.filter((c) => c.raceCategories.includes(race)).length;
        if (cnt > 0) {
          raceSel.innerHTML += `<option value="${esc(race)}">${esc(race)} (${cnt})</option>`;
        }
      });
    }

    // Alignment
    const alignSel = document.getElementById(`align${suffix}`);
    if (alignSel) {
      const goodCnt = characters.filter((c) => /善/.test(c.profile["善惡"] || "")).length;
      const neuCnt = characters.filter((c) => /中立/.test(c.profile["善惡"] || "")).length;
      const evilCnt = characters.filter((c) => /惡/.test(c.profile["善惡"] || "")).length;
      let html = `<option value="">全部善惡傾向</option>`;
      html += `<optgroup label="── 善惡大類 ──">`;
      html += `<option value="GROUP_GOOD">✨ 善系陣營（極善／大善／中善／小善） (${goodCnt})</option>`;
      html += `<option value="GROUP_NEUTRAL">⚖️ 中立陣營 (${neuCnt})</option>`;
      html += `<option value="GROUP_EVIL">💀 惡系陣營（極惡／大惡／中惡／小惡） (${evilCnt})</option>`;
      html += `</optgroup>`;
      html += `<optgroup label="── 細部善惡值 ──">`;
      ["極善", "大善", "中善", "小善", "中立", "小惡", "中惡", "大惡", "極惡"].forEach((al) => {
        const cnt = characters.filter((c) => String(c.profile["善惡"] || "").includes(al)).length;
        if (cnt > 0) {
          html += `<option value="${esc(al)}">${esc(al)} (${cnt})</option>`;
        }
      });
      html += `</optgroup>`;
      alignSel.innerHTML = html;
    }

    // Attribute Category (17 categories)
    const attrCatSel = document.getElementById(`attrCat${suffix}`);
    if (attrCatSel) {
      let html = `<option value="">全部 17 大屬性分類</option>`;
      attributeCategories.forEach((cat) => {
        const cnt = characters.filter((c) => c.attrCatIds.includes(cat.id)).length;
        html += `<option value="${esc(cat.id)}">${esc(cat.title)} (${cnt}人)</option>`;
      });
      attrCatSel.innerHTML = html;
    }

    // Ability System
    const abilitySel = document.getElementById(`abilityType${suffix}`);
    if (abilitySel) {
      let html = `<option value="">全部能力體系</option>`;
      html += `<optgroup label="── 核心戰力體系分類 ──">`;
      ABILITY_GROUP_FILTERS.forEach((g) => {
        const cnt = characters.filter(g.match).length;
        if (cnt > 0) {
          html += `<option value="${esc(g.value)}">${esc(g.label)} (${cnt})</option>`;
        }
      });
      html += `</optgroup>`;

      const allTypes = [
        "武器", "神權", "神器", "神言", "眷屬權能",
        "古言靈術", "世界共鳴", "共鳴", "最高等術式", "亞雷利塔光環",
        "虛能", "深淵能力", "九紋龍印", "魔眼",
        "加護", "詛咒", "亡靈病", "改造",
        "魔法", "異能", "幻能", "獨有術式", "能力", "額外能力"
      ];
      html += `<optgroup label="── 單一能力／術式欄位 ──">`;
      allTypes.forEach((t) => {
        const cnt = characters.filter((c) => c.abilityTypes.includes(t)).length;
        if (cnt > 0) {
          html += `<option value="${esc(t)}">❖ ${esc(t)} (${cnt})</option>`;
        }
      });
      html += `</optgroup>`;
      abilitySel.innerHTML = html;
    }
  }

  // Dynamically update Faction, SubFaction, and Specific Attribute dropdowns based on parent selections
  function updateCascadingSelects(side) {
    const suffix = side === "left" ? "Left" : "Right";
    const fState = compareState.filters[side];

    // 1. Update Main Faction options based on selected Realm
    const factionSel = document.getElementById(`faction${suffix}`);
    if (factionSel) {
      const poolByRealm = fState.realm
        ? characters.filter((c) => c.realm === fState.realm)
        : characters;
      const factions = Array.from(new Set(poolByRealm.map((c) => c.faction))).sort(sortFactions);

      if (fState.faction && !factions.includes(fState.faction)) {
        fState.faction = "";
        fState.subFaction = "";
      }

      let html = `<option value="">全部主陣營 (${factions.length} 個勢力)</option>`;
      factions.forEach((fac) => {
        const cnt = poolByRealm.filter((c) => c.faction === fac).length;
        const sel = fState.faction === fac ? " selected" : "";
        html += `<option value="${esc(fac)}"${sel}>${esc(fac)} (${cnt})</option>`;
      });
      factionSel.innerHTML = html;
    }

    // 2. Update Sub-Faction options based on selected Realm & Faction
    const subFactionSel = document.getElementById(`subFaction${suffix}`);
    if (subFactionSel) {
      const poolByFac = characters.filter((c) => {
        if (fState.realm && c.realm !== fState.realm) return false;
        if (fState.faction && c.faction !== fState.faction) return false;
        return Boolean(c.subFaction);
      });

      const rawSubs = Array.from(new Set(poolByFac.map((c) => c.subFaction))).sort(sortSubFactions);
      // Also extract parent group prefixes like "魔風軍團"
      const parentPrefixes = new Set();
      rawSubs.forEach((s) => {
        if (s.includes(" / ")) {
          parentPrefixes.add(s.split(" / ")[0].trim());
        }
      });

      const validOptions = new Set([...parentPrefixes, ...rawSubs]);
      if (fState.subFaction && !validOptions.has(fState.subFaction)) {
        fState.subFaction = "";
      }

      let html = `<option value="">全部子陣營／部隊</option>`;
      parentPrefixes.forEach((prefix) => {
        const cnt = poolByFac.filter((c) => c.subFaction === prefix || c.subFaction.startsWith(prefix + " / ")).length;
        const sel = fState.subFaction === prefix ? " selected" : "";
        html += `<option value="${esc(prefix)}"${sel}>📁 ${esc(prefix)}（全體 ${cnt} 人）</option>`;
      });
      rawSubs.forEach((sub) => {
        if (parentPrefixes.has(sub)) return;
        const cnt = poolByFac.filter((c) => c.subFaction === sub).length;
        const sel = fState.subFaction === sub ? " selected" : "";
        html += `<option value="${esc(sub)}"${sel}>${esc(sub)} (${cnt})</option>`;
      });
      subFactionSel.innerHTML = html;
    }

    // 3. Update Specific Attribute options based on selected Attribute Category
    const attrItemSel = document.getElementById(`attrItem${suffix}`);
    if (attrItemSel) {
      const tokenCounts = new Map();
      characters.forEach((c) => {
        c.attrTokens.forEach((tok) => {
          if (fState.attrCat) {
            const catId = attrToCategoryMap.get(tok);
            if (catId !== fState.attrCat) return;
          }
          tokenCounts.set(tok, (tokenCounts.get(tok) || 0) + 1);
        });
      });

      const sortedTokens = Array.from(tokenCounts.keys()).sort((a, b) => a.localeCompare(b, "zh-Hant"));
      if (fState.attrItem && !tokenCounts.has(fState.attrItem)) {
        fState.attrItem = "";
      }

      let html = `<option value="">全部個別屬性 (${sortedTokens.length} 種)</option>`;
      sortedTokens.forEach((tok) => {
        const cnt = tokenCounts.get(tok);
        const sel = fState.attrItem === tok ? " selected" : "";
        html += `<option value="${esc(tok)}"${sel}>${esc(tok)} (${cnt}人)</option>`;
      });
      attrItemSel.innerHTML = html;
    }
  }

  function getFilteredCharactersForSide(side) {
    const f = compareState.filters[side];
    const q = f.search.trim().toLowerCase();

    return characters.filter((c) => {
      if (f.realm && c.realm !== f.realm) return false;
      if (f.faction && c.faction !== f.faction) return false;
      if (f.subFaction) {
        const exact = c.subFaction === f.subFaction;
        const prefix = c.subFaction.startsWith(f.subFaction + " / ");
        if (!exact && !prefix) return false;
      }
      if (f.power && !c.power.includes(f.power)) return false;
      if (f.race && !c.raceCategories.includes(f.race)) return false;
      if (f.align && !matchesAlignmentFilter(c.profile["善惡"], f.align)) return false;
      if (f.attrCat && !c.attrCatIds.includes(f.attrCat)) return false;
      if (f.attrItem && !c.attrTokens.includes(f.attrItem)) return false;
      if (f.abilityType && !matchesAbilityFilter(c, f.abilityType)) return false;

      if (q) {
        const hay = [
          c.name,
          c.fileName,
          c.realm,
          c.faction,
          c.subFaction,
          c.power,
          c.identities.join(" "),
          c.profile["稱號"] || "",
          c.profile["種族"] || "",
          c.profile["屬性"] || "",
          c.profile["群體"] || "",
          c.profile["武器"] || "",
          c.combatAbilities.map((a) => `${a.type} ${a.content}`).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // ==================== RENDER PICKER ROSTER LIST ====================
  function renderPickerRoster(side) {
    const suffix = side === "left" ? "Left" : "Right";
    const listEl = document.getElementById(`rosterList${suffix}`);
    const countEl = document.getElementById(`matchCount${suffix}`);
    if (!listEl) return;

    const filtered = getFilteredCharactersForSide(side);
    const activeCharId = side === "left" ? compareState.leftCharId : compareState.rightCharId;
    const otherCharId = side === "left" ? compareState.rightCharId : compareState.leftCharId;

    if (countEl) {
      countEl.textContent = `${filtered.length} 名`;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="picker-empty-state">
          <div>🔍 找不到符合條件的角色</div>
          <button type="button" class="picker-reset-inline" data-reset-side="${side}">重置篩選</button>
        </div>
      `;
      const resetInline = listEl.querySelector("[data-reset-side]");
      if (resetInline) {
        resetInline.addEventListener("click", () => resetFilters(side));
      }
      return;
    }

    listEl.innerHTML = filtered
      .map((c) => {
        const isSelected = c.id === activeCharId;
        const isOtherSide = c.id === otherCharId;
        const epithet = c.profile["稱號"] || "";
        const race = c.profile["種族"] || "未知";
        const portraitSrc = getPortraitUrl(c.image);

        return `
          <button
            type="button"
            class="picker-char-item ${isSelected ? "is-selected" : ""} ${isOtherSide ? "is-opponent" : ""}"
            data-pick-side="${side}"
            data-pick-id="${esc(c.id)}"
          >
            <div class="picker-char-avatar">
              ${
                c.image
                  ? `<img src="${esc(portraitSrc)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />`
                  : `<span class="avatar-placeholder">❖</span>`
              }
            </div>
            <div class="picker-char-main">
              <div class="picker-char-top">
                <span class="picker-char-name">${formatCharacterDisplayName(c.name)}</span>
                ${c.power ? `<span class="picker-power-pill">${esc(c.power)}</span>` : ""}
              </div>
              ${epithet ? `<div class="picker-char-epithet">${formatCharacterDisplayName(epithet)}</div>` : ""}
              <div class="picker-char-sub">
                <span>${esc(c.faction)}${c.subFaction ? `・${esc(c.subFaction)}` : ""}</span>
                <span>｜${esc(race)}</span>
              </div>
              ${
                c.attrTokens.length > 0
                  ? `<div class="picker-char-abilities-preview">
                      ${c.attrTokens
                        .slice(0, 4)
                        .map((tok) => {
                          const v = getAttributeVisual(tok);
                          return `<span class="attr-color-badge sm ${v.isSupreme ? "is-supreme" : ""}" style="${v.style}"><span>${esc(tok)}</span></span>`;
                        })
                        .join("")}
                    </div>`
                  : ""
              }
            </div>
          </button>
        `;
      })
      .join("");

    listEl.querySelectorAll("[data-pick-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pickedId = btn.getAttribute("data-pick-id");
        if (side === "left") {
          compareState.leftCharId = pickedId;
          compareState.leftPickerOpen = false;
          forceSelectAnim.left = true;
        } else {
          compareState.rightCharId = pickedId;
          compareState.rightPickerOpen = false;
          forceSelectAnim.right = true;
        }
        syncUrlAndStorage();
        updatePickerVisibility();
        renderAllComparisonViews();
      });
    });
  }

  // Track character selection transitions for pop-in animations
  const lastRenderedCharId = { left: "", right: "" };
  const forceSelectAnim = { left: false, right: false };

  let compareSfxCtx = null;
  function playCharSelectSfx(side, soundType) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!compareSfxCtx) {
        compareSfxCtx = new AudioCtx();
      }
      if (compareSfxCtx.state === "suspended") {
        compareSfxCtx.resume().catch(() => {});
      }
      if (compareSfxCtx.state !== "running") return;

      const now = compareSfxCtx.currentTime;
      const master = compareSfxCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.12, now + 0.015);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
      master.connect(compareSfxCtx.destination);

      let freqs = [587.33, 880.0, 1174.66, 1760.0];
      let waveType = "sine";
      let spacing = 0.038;

      if (soundType === "fire" || soundType === "destruction") {
        freqs = [220.0, 329.63, 440.0, 659.25];
        waveType = "triangle";
        spacing = 0.032;
      } else if (soundType === "lightning") {
        freqs = [440.0, 880.0, 1320.0, 2200.0];
        waveType = "sawtooth";
        spacing = 0.024;
      } else if (soundType === "holy" || soundType === "supreme") {
        freqs = [523.25, 659.25, 783.99, 1046.5, 1567.98];
        waveType = "sine";
        spacing = 0.034;
      } else if (soundType === "dark" || soundType === "abyss") {
        freqs = [196.0, 277.18, 392.0, 554.37];
        waveType = "sine";
        spacing = 0.045;
      } else if (soundType === "blood") {
        freqs = [246.94, 349.23, 493.88, 698.46];
        waveType = "triangle";
        spacing = 0.035;
      } else if (soundType === "nature" || soundType === "wind") {
        freqs = [440.0, 587.33, 739.99, 880.0];
        waveType = "sine";
        spacing = 0.04;
      } else if (soundType === "blade" || (!soundType && side === "right")) {
        freqs = [440.0, 659.25, 880.0, 1318.51];
        waveType = "triangle";
        spacing = 0.038;
      }

      freqs.forEach((freq, idx) => {
        const t = now + idx * spacing;
        const osc = compareSfxCtx.createOscillator();
        const g = compareSfxCtx.createGain();
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.03, t + 0.22);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  // Determine dynamic visual flare & particle color theme based on character's attributes
  function getCharacterAttrBurstTheme(attrTokens, side) {
    const tokens = Array.isArray(attrTokens) ? attrTokens.filter(Boolean) : [];
    const joined = tokens.join(" ");

    // Default fallback based on side
    const isLeft = side === "left";
    const defaultTheme = isLeft
      ? {
          primary: "#38bdf8",
          secondary: "#7dd3fc",
          border: "rgba(125, 211, 252, 0.95)",
          glow: "rgba(56, 189, 248, 0.85)",
          glowSubtle: "rgba(14, 165, 233, 0.6)",
          glowInner: "rgba(56, 189, 248, 0.45)",
          ring: "rgba(56, 189, 248, 0.85)",
          sparkBg: "#e0f2fe",
          flare: "radial-gradient(circle, rgba(56, 189, 248, 0.95) 0%, rgba(14, 165, 233, 0.55) 35%, rgba(2, 132, 199, 0) 72%)",
          soundType: "ice"
        }
      : {
          primary: "#facc15",
          secondary: "#fde047",
          border: "rgba(253, 224, 71, 0.95)",
          glow: "rgba(250, 204, 21, 0.85)",
          glowSubtle: "rgba(245, 158, 11, 0.6)",
          glowInner: "rgba(250, 204, 21, 0.45)",
          ring: "rgba(250, 204, 21, 0.9)",
          sparkBg: "#fef08a",
          flare: "radial-gradient(circle, rgba(254, 240, 138, 0.98) 0%, rgba(245, 158, 11, 0.65) 38%, rgba(217, 119, 6, 0) 75%)",
          soundType: "blade"
        };

    if (tokens.length === 0) return defaultTheme;

    // Pattern matching ordered from specific/supreme to elemental
    if (/真實|理|始源|萬物|無限|創生|極光|境界/.test(joined)) {
      return {
        primary: "#38bdf8",
        secondary: "#fde047",
        border: "#fef08a",
        glow: "rgba(56, 189, 248, 0.92)",
        glowSubtle: "rgba(254, 240, 138, 0.75)",
        glowInner: "rgba(56, 189, 248, 0.5)",
        ring: "rgba(254, 240, 138, 0.95)",
        sparkBg: "#ffffff",
        flare: "radial-gradient(circle, #ffffff 0%, rgba(56, 189, 248, 0.9) 32%, rgba(254, 240, 138, 0.65) 60%, transparent 78%)",
        soundType: "supreme"
      };
    }
    if (/深淵|至淵|空洞|虛空|淵蝕/.test(joined)) {
      return {
        primary: "#e11d48",
        secondary: "#c084fc",
        border: "#f43f5e",
        glow: "rgba(225, 29, 72, 0.92)",
        glowSubtle: "rgba(112, 26, 117, 0.8)",
        glowInner: "rgba(225, 29, 72, 0.5)",
        ring: "rgba(244, 63, 94, 0.92)",
        sparkBg: "#ffe4e6",
        flare: "radial-gradient(circle, rgba(254, 205, 211, 0.98) 0%, rgba(225, 29, 72, 0.88) 35%, rgba(59, 7, 100, 0.78) 64%, transparent 80%)",
        soundType: "abyss"
      };
    }
    if (/暗|影|夜|冥|黑泥|霸王之暗|原罪之暗|死|災厄|邪/.test(joined)) {
      return {
        primary: "#a855f7",
        secondary: "#c084fc",
        border: "#c084fc",
        glow: "rgba(168, 85, 247, 0.92)",
        glowSubtle: "rgba(88, 28, 135, 0.75)",
        glowInner: "rgba(168, 85, 247, 0.5)",
        ring: "rgba(192, 132, 252, 0.92)",
        sparkBg: "#f3e8ff",
        flare: "radial-gradient(circle, rgba(243, 232, 255, 0.98) 0%, rgba(192, 132, 252, 0.85) 32%, rgba(88, 28, 135, 0.75) 64%, transparent 80%)",
        soundType: "dark"
      };
    }
    if (/血|猩紅|肉體/.test(joined)) {
      return {
        primary: "#dc2626",
        secondary: "#fb7185",
        border: "#f87171",
        glow: "rgba(220, 38, 38, 0.92)",
        glowSubtle: "rgba(153, 27, 27, 0.75)",
        glowInner: "rgba(220, 38, 38, 0.5)",
        ring: "rgba(248, 113, 113, 0.92)",
        sparkBg: "#fee2e2",
        flare: "radial-gradient(circle, rgba(254, 226, 226, 0.98) 0%, rgba(239, 68, 68, 0.88) 35%, rgba(127, 29, 29, 0.75) 62%, transparent 78%)",
        soundType: "blood"
      };
    }
    if (/火|炎|焰|爆炎|薪火|紅蓮|煉獄|地獄火|岩漿|灰燼/.test(joined)) {
      return {
        primary: "#ef4444",
        secondary: "#fb923c",
        border: "#f97316",
        glow: "rgba(239, 68, 68, 0.9)",
        glowSubtle: "rgba(249, 115, 22, 0.7)",
        glowInner: "rgba(239, 68, 68, 0.45)",
        ring: "rgba(249, 115, 22, 0.92)",
        sparkBg: "#fef2f2",
        flare: "radial-gradient(circle, rgba(254, 215, 170, 0.98) 0%, rgba(249, 115, 22, 0.85) 35%, rgba(220, 38, 38, 0.7) 62%, transparent 78%)",
        soundType: "fire"
      };
    }
    if (/雷|電|紫電|白雷|銀雷|灰黯之雷|神雷/.test(joined)) {
      return {
        primary: "#facc15",
        secondary: "#38bdf8",
        border: "#fef08a",
        glow: "rgba(250, 204, 21, 0.92)",
        glowSubtle: "rgba(56, 189, 248, 0.7)",
        glowInner: "rgba(250, 204, 21, 0.48)",
        ring: "rgba(250, 204, 21, 0.95)",
        sparkBg: "#fefce8",
        flare: "radial-gradient(circle, rgba(254, 240, 138, 0.98) 0%, rgba(250, 204, 21, 0.88) 35%, rgba(2, 132, 199, 0.6) 62%, transparent 78%)",
        soundType: "lightning"
      };
    }
    if (/冰|雪|霜|冰晶|冰楔|凍魂/.test(joined)) {
      return {
        primary: "#06b6d4",
        secondary: "#a5f3fc",
        border: "#67e8f9",
        glow: "rgba(6, 182, 212, 0.88)",
        glowSubtle: "rgba(14, 165, 233, 0.65)",
        glowInner: "rgba(6, 182, 212, 0.45)",
        ring: "rgba(103, 232, 249, 0.92)",
        sparkBg: "#cffafe",
        flare: "radial-gradient(circle, rgba(236, 254, 255, 0.98) 0%, rgba(103, 232, 249, 0.85) 32%, rgba(2, 132, 199, 0.65) 62%, transparent 78%)",
        soundType: "ice"
      };
    }
    if (/水|海|霧|源水|月水/.test(joined)) {
      return {
        primary: "#0284c7",
        secondary: "#60a5fa",
        border: "#38bdf8",
        glow: "rgba(2, 132, 199, 0.88)",
        glowSubtle: "rgba(37, 99, 235, 0.65)",
        glowInner: "rgba(2, 132, 199, 0.45)",
        ring: "rgba(56, 189, 248, 0.92)",
        sparkBg: "#e0f2fe",
        flare: "radial-gradient(circle, rgba(186, 230, 253, 0.98) 0%, rgba(14, 165, 233, 0.8) 35%, rgba(29, 78, 216, 0.65) 62%, transparent 78%)",
        soundType: "water"
      };
    }
    if (/風|嵐|空氣|妖翠|天氣/.test(joined)) {
      return {
        primary: "#10b981",
        secondary: "#6ee7b7",
        border: "#34d399",
        glow: "rgba(16, 185, 129, 0.88)",
        glowSubtle: "rgba(5, 150, 105, 0.65)",
        glowInner: "rgba(16, 185, 129, 0.45)",
        ring: "rgba(52, 211, 153, 0.92)",
        sparkBg: "#ecfdf5",
        flare: "radial-gradient(circle, rgba(209, 250, 229, 0.98) 0%, rgba(52, 211, 153, 0.85) 35%, rgba(4, 120, 87, 0.65) 62%, transparent 78%)",
        soundType: "wind"
      };
    }
    if (/草|木|樹|植物|葉|自然|生命|神花|櫻|紫羅蘭|白玫瑰|銀草/.test(joined)) {
      return {
        primary: "#22c55e",
        secondary: "#fbcfe8",
        border: "#86efac",
        glow: "rgba(34, 197, 94, 0.88)",
        glowSubtle: "rgba(22, 163, 74, 0.65)",
        glowInner: "rgba(34, 197, 94, 0.45)",
        ring: "rgba(74, 222, 128, 0.92)",
        sparkBg: "#f0fdf4",
        flare: "radial-gradient(circle, rgba(220, 252, 231, 0.98) 0%, rgba(74, 222, 128, 0.85) 35%, rgba(21, 128, 61, 0.65) 62%, transparent 78%)",
        soundType: "nature"
      };
    }
    if (/光|聖|黎明|晨光|純白|白|神/.test(joined)) {
      return {
        primary: "#f59e0b",
        secondary: "#fef08a",
        border: "#fde047",
        glow: "rgba(253, 224, 71, 0.95)",
        glowSubtle: "rgba(245, 158, 11, 0.75)",
        glowInner: "rgba(253, 224, 71, 0.52)",
        ring: "rgba(254, 240, 138, 0.95)",
        sparkBg: "#ffffff",
        flare: "radial-gradient(circle, #ffffff 0%, rgba(254, 240, 138, 0.92) 32%, rgba(245, 158, 11, 0.65) 62%, transparent 78%)",
        soundType: "holy"
      };
    }
    if (/破壞|毀滅|粉碎|滅世|戰爭|狂/.test(joined)) {
      return {
        primary: "#ea580c",
        secondary: "#dc2626",
        border: "#f97316",
        glow: "rgba(234, 88, 12, 0.92)",
        glowSubtle: "rgba(185, 28, 28, 0.75)",
        glowInner: "rgba(234, 88, 12, 0.48)",
        ring: "rgba(249, 115, 22, 0.95)",
        sparkBg: "#ffedd5",
        flare: "radial-gradient(circle, rgba(255, 237, 213, 0.98) 0%, rgba(249, 115, 22, 0.88) 35%, rgba(153, 27, 27, 0.75) 62%, transparent 78%)",
        soundType: "destruction"
      };
    }
    if (/毒|腐蝕|瘟疫|腐化/.test(joined)) {
      return {
        primary: "#84cc16",
        secondary: "#a855f7",
        border: "#a3e635",
        glow: "rgba(132, 204, 22, 0.9)",
        glowSubtle: "rgba(34, 197, 94, 0.7)",
        glowInner: "rgba(132, 204, 22, 0.48)",
        ring: "rgba(163, 230, 53, 0.92)",
        sparkBg: "#f7fee7",
        flare: "radial-gradient(circle, rgba(247, 254, 231, 0.98) 0%, rgba(163, 230, 53, 0.88) 35%, rgba(63, 98, 18, 0.65) 62%, transparent 78%)",
        soundType: "poison"
      };
    }
    if (/星|天體|天空|月|行星|重力|銀河/.test(joined)) {
      return {
        primary: "#6366f1",
        secondary: "#c084fc",
        border: "#818cf8",
        glow: "rgba(99, 102, 241, 0.92)",
        glowSubtle: "rgba(139, 92, 246, 0.7)",
        glowInner: "rgba(99, 102, 241, 0.48)",
        ring: "rgba(129, 140, 248, 0.92)",
        sparkBg: "#eff6ff",
        flare: "radial-gradient(circle, rgba(238, 242, 255, 0.98) 0%, rgba(129, 140, 248, 0.88) 32%, rgba(88, 28, 135, 0.65) 62%, transparent 78%)",
        soundType: "cosmos"
      };
    }
    if (/時間|空間|時空|量子|混沌/.test(joined)) {
      return {
        primary: "#0d9488",
        secondary: "#facc15",
        border: "#2dd4bf",
        glow: "rgba(13, 148, 136, 0.92)",
        glowSubtle: "rgba(79, 70, 229, 0.7)",
        glowInner: "rgba(13, 148, 136, 0.48)",
        ring: "rgba(45, 212, 191, 0.92)",
        sparkBg: "#ccfbf1",
        flare: "radial-gradient(circle, rgba(204, 251, 241, 0.98) 0%, rgba(45, 212, 191, 0.85) 32%, rgba(67, 56, 202, 0.65) 62%, transparent 78%)",
        soundType: "spacetime"
      };
    }
    if (/精神|靈魂|魂|認知|幻|夢|音|音樂|言靈|慾望|恐懼/.test(joined)) {
      return {
        primary: "#c084fc",
        secondary: "#f472b6",
        border: "#e879f9",
        glow: "rgba(192, 132, 252, 0.92)",
        glowSubtle: "rgba(232, 121, 249, 0.7)",
        glowInner: "rgba(192, 132, 252, 0.48)",
        ring: "rgba(232, 121, 249, 0.92)",
        sparkBg: "#fae8ff",
        flare: "radial-gradient(circle, rgba(250, 232, 255, 0.98) 0%, rgba(216, 180, 254, 0.88) 32%, rgba(190, 24, 93, 0.6) 62%, transparent 78%)",
        soundType: "psyche"
      };
    }
    if (/土|大地|岩石|沙|鋼|金屬|黃金|白銀|水晶|建築|鹽/.test(joined)) {
      return {
        primary: "#d97706",
        secondary: "#fbbf24",
        border: "#fbbf24",
        glow: "rgba(217, 119, 6, 0.88)",
        glowSubtle: "rgba(180, 83, 9, 0.7)",
        glowInner: "rgba(217, 119, 6, 0.45)",
        ring: "rgba(251, 191, 36, 0.92)",
        sparkBg: "#fef3c7",
        flare: "radial-gradient(circle, rgba(254, 243, 199, 0.98) 0%, rgba(245, 158, 11, 0.85) 35%, rgba(120, 53, 15, 0.65) 62%, transparent 78%)",
        soundType: "earth"
      };
    }
    if (/武|劍|銳利|守護|力量|忠義|王/.test(joined)) {
      return {
        primary: "#f59e0b",
        secondary: "#e2e8f0",
        border: "#fef08a",
        glow: "rgba(245, 158, 11, 0.88)",
        glowSubtle: "rgba(217, 119, 6, 0.65)",
        glowInner: "rgba(245, 158, 11, 0.45)",
        ring: "rgba(254, 240, 138, 0.92)",
        sparkBg: "#fefce8",
        flare: "radial-gradient(circle, rgba(254, 240, 138, 0.98) 0%, rgba(245, 158, 11, 0.85) 35%, rgba(180, 83, 9, 0.65) 62%, transparent 78%)",
        soundType: "blade"
      };
    }

    return defaultTheme;
  }

  function buildAttrThemeCssVars(t) {
    if (!t) return "";
    return [
      `--attr-primary:${t.primary}`,
      `--attr-secondary:${t.secondary}`,
      `--attr-border:${t.border}`,
      `--attr-glow:${t.glow}`,
      `--attr-glow-subtle:${t.glowSubtle}`,
      `--attr-glow-inner:${t.glowInner}`,
      `--attr-ring-color:${t.ring}`,
      `--attr-spark-bg:${t.sparkBg}`,
      `--attr-flare-bg:${t.flare}`
    ].join(";");
  }

  function triggerPaneSelectFlash(side, attrTheme) {
    const paneEl = document.getElementById(side === "left" ? "comparePaneLeft" : "comparePaneRight");
    if (!paneEl) return;
    paneEl.classList.remove("is-pane-selected-flash");
    void paneEl.offsetWidth;
    if (attrTheme) {
      paneEl.style.setProperty("--pane-flash-color", attrTheme.primary);
      paneEl.style.setProperty("--pane-flash-glow", attrTheme.glow);
      paneEl.style.setProperty("--pane-flash-glow-inner", attrTheme.glowInner);
    }
    paneEl.classList.add("is-pane-selected-flash");
    playCharSelectSfx(side, attrTheme ? attrTheme.soundType : null);
  }

  // ==================== GAUNTLET / ARENA TOURNAMENT MODE (擂台賽模式) ====================
  const gauntletState = {
    arenaMode: (function () {
      try {
        const saved = localStorage.getItem("arelita_arena_mode");
        return saved === null ? true : saved === "true";
      } catch (e) {
        return true;
      }
    })(),
    isAnimating: false,
    streaks: {},
    defeatedInRoundIds: new Set(),
    recentDefeatedIds: [],
    championCharId: null,
    championSide: null,
    defeatedFinalBoss: null,
    lastBattleLog: null,
    challengerArrival: { left: null, right: null }
  };

  function syncArenaModeToggleUI() {
    const btn = document.getElementById("btnToggleArenaMode");
    const textEl = document.getElementById("arenaModeToggleText");
    const iconEl = document.getElementById("arenaModeToggleIcon");
    const on = Boolean(gauntletState.arenaMode);
    if (btn) {
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    }
    if (textEl) {
      textEl.textContent = on ? "擂台賽模式：ON" : "擂台賽模式：OFF";
    }
    if (iconEl) {
      iconEl.textContent = on ? "🔥" : "⚔️";
    }
  }

  function setArenaMode(enabled) {
    gauntletState.arenaMode = Boolean(enabled);
    try {
      localStorage.setItem("arelita_arena_mode", String(gauntletState.arenaMode));
    } catch (e) {}
    syncArenaModeToggleUI();
    renderAllComparisonViews();
  }

  function resetArenaRoundState() {
    gauntletState.streaks = {};
    gauntletState.defeatedInRoundIds.clear();
    gauntletState.recentDefeatedIds = [];
    gauntletState.championCharId = null;
    gauntletState.championSide = null;
    gauntletState.defeatedFinalBoss = null;
    gauntletState.lastBattleLog = null;
    gauntletState.challengerArrival = { left: null, right: null };
  }

  function endCurrentArenaRound() {
    const hadEmptySide = !compareState.leftCharId || !compareState.rightCharId;
    resetArenaRoundState();

    const paneL = document.getElementById("comparePaneLeft");
    const paneR = document.getElementById("comparePaneRight");
    if (paneL) paneL.classList.remove("is-five-streak-flame", "is-champion-pane");
    if (paneR) paneR.classList.remove("is-five-streak-flame", "is-champion-pane");

    // If one side was wiped out in the champion finale, pick a fresh opponent so a new round can begin smoothly
    if (hadEmptySide && characters.length >= 2) {
      const activeId = compareState.leftCharId || compareState.rightCharId;
      const activeChar = characters.find((c) => c.id === activeId);
      const others = characters.filter((c) => c.id !== activeId);
      let candidates = others;
      if (activeChar && activeChar.powerScore >= 0) {
        const similar = others.filter(
          (c) => c.powerScore >= 0 && Math.abs(c.powerScore - activeChar.powerScore) <= 2
        );
        if (similar.length > 0) candidates = similar;
      }
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      if (!compareState.leftCharId) {
        compareState.leftCharId = picked.id;
        compareState.leftPickerOpen = false;
        forceSelectAnim.left = true;
      } else if (!compareState.rightCharId) {
        compareState.rightCharId = picked.id;
        compareState.rightPickerOpen = false;
        forceSelectAnim.right = true;
      }
    }

    syncUrlAndStorage();
    updatePickerVisibility();
    renderAllComparisonViews();
  }

  function playKoDefeatSfx() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!compareSfxCtx) {
        compareSfxCtx = new AudioCtx();
      }
      if (compareSfxCtx.state === "suspended") {
        compareSfxCtx.resume().catch(() => {});
      }
      if (compareSfxCtx.state !== "running") return;

      const now = compareSfxCtx.currentTime;
      const master = compareSfxCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.18, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
      master.connect(compareSfxCtx.destination);

      // 1. High-velocity diagonal blade slash (sawtooth sweep)
      const slashOsc = compareSfxCtx.createOscillator();
      const slashGain = compareSfxCtx.createGain();
      slashOsc.type = "sawtooth";
      slashOsc.frequency.setValueAtTime(1180, now);
      slashOsc.frequency.exponentialRampToValueAtTime(95, now + 0.19);
      slashGain.gain.setValueAtTime(0.0001, now);
      slashGain.gain.linearRampToValueAtTime(0.14, now + 0.012);
      slashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);
      slashOsc.connect(slashGain);
      slashGain.connect(master);
      slashOsc.start(now);
      slashOsc.stop(now + 0.22);

      // 2. Second cross-slash echo
      const slashOsc2 = compareSfxCtx.createOscillator();
      const slashGain2 = compareSfxCtx.createGain();
      slashOsc2.type = "triangle";
      slashOsc2.frequency.setValueAtTime(1480, now + 0.09);
      slashOsc2.frequency.exponentialRampToValueAtTime(120, now + 0.26);
      slashGain2.gain.setValueAtTime(0.0001, now + 0.09);
      slashGain2.gain.linearRampToValueAtTime(0.12, now + 0.105);
      slashGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      slashOsc2.connect(slashGain2);
      slashGain2.connect(master);
      slashOsc2.start(now + 0.09);
      slashOsc2.stop(now + 0.29);

      // 3. Heavy K.O. shatter impact boom
      const boomOsc = compareSfxCtx.createOscillator();
      const boomGain = compareSfxCtx.createGain();
      boomOsc.type = "sine";
      boomOsc.frequency.setValueAtTime(165, now + 0.14);
      boomOsc.frequency.exponentialRampToValueAtTime(34, now + 0.52);
      boomGain.gain.setValueAtTime(0.0001, now + 0.14);
      boomGain.gain.linearRampToValueAtTime(0.22, now + 0.16);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.54);
      boomOsc.connect(boomGain);
      boomGain.connect(master);
      boomOsc.start(now + 0.14);
      boomOsc.stop(now + 0.56);
    } catch (e) {}
  }

  function playFlameAwakenSfx() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!compareSfxCtx) compareSfxCtx = new AudioCtx();
      if (compareSfxCtx.state === "suspended") compareSfxCtx.resume().catch(() => {});
      if (compareSfxCtx.state !== "running") return;

      const now = compareSfxCtx.currentTime;
      const master = compareSfxCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.16, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      master.connect(compareSfxCtx.destination);

      [220.0, 277.18, 329.63, 440.0, 659.25, 880.0].forEach((freq, idx) => {
        const t = now + idx * 0.045;
        const osc = compareSfxCtx.createOscillator();
        const g = compareSfxCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq * 0.92, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.06, t + 0.28);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + 0.34);
      });
    } catch (e) {}
  }

  function playChampionFanfareSfx() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!compareSfxCtx) compareSfxCtx = new AudioCtx();
      if (compareSfxCtx.state === "suspended") compareSfxCtx.resume().catch(() => {});
      if (compareSfxCtx.state !== "running") return;

      const now = compareSfxCtx.currentTime;
      const master = compareSfxCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.2, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      master.connect(compareSfxCtx.destination);

      // Triumphant sovereign fanfare notes
      const notes = [
        { f: 523.25, t: 0.0, d: 0.22 },
        { f: 659.25, t: 0.11, d: 0.22 },
        { f: 783.99, t: 0.22, d: 0.24 },
        { f: 1046.5, t: 0.35, d: 0.68 },
        { f: 1318.51, t: 0.35, d: 0.68 },
        { f: 1567.98, t: 0.48, d: 0.62 }
      ];
      notes.forEach((n) => {
        const start = now + n.t;
        const osc = compareSfxCtx.createOscillator();
        const g = compareSfxCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, start);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(0.09, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
        osc.connect(g);
        g.connect(master);
        osc.start(start);
        osc.stop(start + n.d + 0.02);
      });
    } catch (e) {}
  }

  // Build candidate pool for the next challenger that is 1~2 steps stronger than loserChar.
  // Once 現象級 (score 0) is reached and all 現象級 opponents are defeated, returns [] -> Champion "最強"!
  function getStrongerChallengerPool(loserChar, winnerChar) {
    if (!loserChar) return [];
    const excludeIds = new Set([
      loserChar.id,
      winnerChar ? winnerChar.id : "",
      ...Array.from(gauntletState.defeatedInRoundIds)
    ]);
    const basePool = characters.filter((c) => !excludeIds.has(c.id));
    if (basePool.length === 0) return [];

    const loserScore = loserChar.powerScore;

    if (loserScore === 0) {
      // Defeated opponent is 現象級 (score 0)!
      // Check if any undefeated 現象級 opponent remains. If none, return [] -> Champion "最強"!
      return basePool.filter((c) => c.powerScore === 0);
    }

    if (loserScore > 0) {
      // Priority 1: Exactly 1 or 2 steps stronger on POWER_LADDER (e.g. 龍獸二級[23] -> 龍獸三級[22] or 英雄一級[21])
      const stepUpPool = basePool.filter(
        (c) => c.powerScore === loserScore - 1 || c.powerScore === loserScore - 2
      );
      if (stepUpPool.length > 0) return stepUpPool;

      // Priority 2: Closest available stronger tiers (0 <= score < loserScore)
      const allStronger = basePool.filter((c) => c.powerScore >= 0 && c.powerScore < loserScore);
      if (allStronger.length > 0) {
        const closestScore = Math.max(...allStronger.map((c) => c.powerScore));
        return allStronger.filter(
          (c) => c.powerScore === closestScore || c.powerScore === closestScore - 1
        );
      }

      // No stronger undefeated opponent exists (including 現象級)! Return [] -> Champion "最強"!
      return [];
    }

    // Fallback when loser has unranked powerScore (-1)
    if (winnerChar && winnerChar.powerScore >= 0) {
      const nearWinner = basePool.filter(
        (c) => c.powerScore >= 0 && c.powerScore <= winnerChar.powerScore
      );
      if (nearWinner.length > 0) return nearWinner;
    }

    return basePool;
  }

  function getNextChallengerTierLabel(loserChar, winnerChar) {
    if (!loserChar) return "更強挑戰者";
    const pool = getStrongerChallengerPool(loserChar, winnerChar);
    if (pool.length === 0) {
      return "👑 已無對手（擊敗即登頂【最強】）";
    }
    const poolTiers = Array.from(
      new Set(
        pool
          .map((c) => (c.powerScore >= 0 ? POWER_LADDER[c.powerScore] : c.power))
          .filter(Boolean)
      )
    );
    if (poolTiers.length > 0) {
      return poolTiers.slice(0, 2).join(" ／ ");
    }
    return "更高階挑戰者";
  }

  function pickNextStrongerChallenger(loserChar, winnerChar) {
    const pool = getStrongerChallengerPool(loserChar, winnerChar);
    if (pool.length === 0) return null;

    const recentSet = new Set(gauntletState.recentDefeatedIds);
    const freshPool = pool.filter((c) => !recentSet.has(c.id));
    const finalPool = freshPool.length > 0 ? freshPool : pool;

    return finalPool[Math.floor(Math.random() * finalPool.length)];
  }

  function executeDefeatAndReplace(loserSide) {
    if (gauntletState.isAnimating || !gauntletState.arenaMode) return;

    const winnerSide = loserSide === "left" ? "right" : "left";
    const leftChar = characters.find((c) => c.id === compareState.leftCharId) || null;
    const rightChar = characters.find((c) => c.id === compareState.rightCharId) || null;
    const loserChar = loserSide === "left" ? leftChar : rightChar;
    const winnerChar = loserSide === "left" ? rightChar : leftChar;

    if (!loserChar) return;

    gauntletState.isAnimating = true;
    if (loserSide === "left") compareState.leftPickerOpen = false;
    else compareState.rightPickerOpen = false;
    updatePickerVisibility();

    // 1. Trigger K.O. Sound & Slash Shatter Animation on Loser's Pane
    playKoDefeatSfx();

    const loserPane = document.getElementById(
      loserSide === "left" ? "comparePaneLeft" : "comparePaneRight"
    );
    const winnerPane = document.getElementById(
      winnerSide === "left" ? "comparePaneLeft" : "comparePaneRight"
    );
    const loserDossierBody = document.getElementById(
      loserSide === "left" ? "dossierBodyLeft" : "dossierBodyRight"
    );
    const loserCard = loserDossierBody
      ? loserDossierBody.querySelector(".compare-dossier-card")
      : null;

    if (loserPane) {
      loserPane.classList.remove("is-pane-selected-flash");
      loserPane.classList.add("is-pane-ko-shake");
    }
    if (winnerPane && winnerChar) {
      winnerPane.classList.add("is-pane-victory-pulse");
    }

    if (loserCard) {
      loserCard.classList.add("is-ko-eliminating");
      const koOverlay = document.createElement("div");
      koOverlay.className = "ko-execution-fx";
      koOverlay.setAttribute("aria-hidden", "true");
      koOverlay.innerHTML = `
        <div class="ko-crimson-vignette"></div>
        <div class="ko-slash-line slash-1"></div>
        <div class="ko-slash-line slash-2"></div>
        <div class="ko-impact-ring"></div>
        <div class="ko-stamp-box">
          <div class="ko-stamp-main">💥 DEFEATED // 擊敗淘汰</div>
          <div class="ko-stamp-sub">${esc(loserChar.name)}（${esc(loserChar.power || "未知")}）敗陣退場！</div>
        </div>
      `;
      loserCard.appendChild(koOverlay);
    }

    // 2. After K.O. animation completes, check if a stronger challenger exists or if Champion "最強" is crowned!
    setTimeout(() => {
      if (loserPane) loserPane.classList.remove("is-pane-ko-shake");
      if (winnerPane) winnerPane.classList.remove("is-pane-victory-pulse");

      // Record defeated character in round & recent history
      gauntletState.defeatedInRoundIds.add(loserChar.id);
      gauntletState.recentDefeatedIds.push(loserChar.id);
      if (gauntletState.recentDefeatedIds.length > 10) {
        gauntletState.recentDefeatedIds.shift();
      }

      // Update win streak
      let currentStreak = 0;
      if (winnerChar) {
        gauntletState.streaks[winnerChar.id] = (gauntletState.streaks[winnerChar.id] || 0) + 1;
        currentStreak = gauntletState.streaks[winnerChar.id];
      }
      gauntletState.streaks[loserChar.id] = 0;

      const nextChar = pickNextStrongerChallenger(loserChar, winnerChar);

      if (!nextChar) {
        // ALL STRONGER / 現象級 OPPONENTS DEFEATED! Crown winnerChar as "最強"!
        gauntletState.championCharId = winnerChar ? winnerChar.id : loserChar.id;
        gauntletState.championSide = winnerChar ? winnerSide : loserSide;
        gauntletState.defeatedFinalBoss = {
          name: loserChar.name,
          power: loserChar.power || "現象級"
        };
        gauntletState.lastBattleLog = {
          isChampionFinale: true,
          winnerName: winnerChar ? winnerChar.name : "守擂霸主",
          winnerPower: winnerChar ? winnerChar.power || "未標註" : "",
          loserName: loserChar.name,
          loserPower: loserChar.power || "現象級",
          loserSide,
          streak: currentStreak
        };

        if (loserSide === "left") {
          compareState.leftCharId = "";
          compareState.leftPickerOpen = false;
          forceSelectAnim.right = true;
        } else {
          compareState.rightCharId = "";
          compareState.rightPickerOpen = false;
          forceSelectAnim.left = true;
        }

        playChampionFanfareSfx();
      } else {
        // Slot in the stronger challenger
        if (currentStreak === 5) {
          playFlameAwakenSfx();
        }

        gauntletState.challengerArrival[loserSide] = {
          prevName: loserChar.name,
          prevPower: loserChar.power || "未標註",
          newPower: nextChar.power || "未標註"
        };

        gauntletState.lastBattleLog = {
          isChampionFinale: false,
          winnerName: winnerChar ? winnerChar.name : "守擂方",
          winnerPower: winnerChar ? winnerChar.power || "未標註" : "",
          loserName: loserChar.name,
          loserPower: loserChar.power || "未標註",
          nextName: nextChar.name,
          nextPower: nextChar.power || "未標註",
          loserSide,
          streak: currentStreak
        };

        if (loserSide === "left") {
          compareState.leftCharId = nextChar.id;
          forceSelectAnim.left = true;
        } else {
          compareState.rightCharId = nextChar.id;
          forceSelectAnim.right = true;
        }
      }

      gauntletState.isAnimating = false;
      syncUrlAndStorage();
      renderAllComparisonViews();
    }, 640);
  }

  // ==================== RENDER COMBAT & ABILITY DOSSIER (COMPACT, NO REDUNDANT BOXES) ====================
  function renderCharacterCombatDossier(c, side, opponentChar) {
    const container = document.getElementById(side === "left" ? "dossierBodyLeft" : "dossierBodyRight");
    const paneEl = document.getElementById(side === "left" ? "comparePaneLeft" : "comparePaneRight");
    if (!container) return;

    const isPickerOpen = side === "left" ? compareState.leftPickerOpen : compareState.rightPickerOpen;

    if (!c) {
      lastRenderedCharId[side] = "";
      forceSelectAnim[side] = false;
      gauntletState.challengerArrival[side] = null;
      if (paneEl) {
        paneEl.classList.remove("is-five-streak-flame", "is-champion-pane");
      }

      // If this slot was just wiped out in the Champion "最強" Finale, show the Conquered Final Boss screen!
      if (
        gauntletState.arenaMode &&
        gauntletState.championCharId &&
        gauntletState.championSide &&
        gauntletState.championSide !== side &&
        !isPickerOpen
      ) {
        const finalBoss = gauntletState.defeatedFinalBoss || { name: "現象級強敵", power: "現象級" };
        container.classList.remove("is-empty-hidden");
        container.innerHTML = `
          <div class="compare-conquered-slot">
            <div class="conquered-skull-icon">☠️</div>
            <div class="conquered-title">現象級強敵全數潰敗・世間已無對手！</div>
            <p class="conquered-desc">
              最後一位巔峰強敵 <strong>【${esc(finalBoss.name)}（${esc(finalBoss.power)}）】</strong> 已被徹底擊破！<br/>
              對側守擂角色已殺穿整座天梯，正式加冕為亞雷利塔<strong>「天下最強」</strong>！
            </p>
            <div class="conquered-actions">
              <button type="button" class="btn-end-arena-round" data-end-round="true">
                <span>🏁 結束本輪擂台賽（開啟新一輪對決）</span>
              </button>
              <button type="button" class="compare-action-btn" data-open-picker="${side}">
                <span>🔍 手動挑選新對手</span>
              </button>
            </div>
          </div>
        `;
        const endBtn = container.querySelector("[data-end-round]");
        if (endBtn) endBtn.addEventListener("click", () => endCurrentArenaRound());
        const openBtn = container.querySelector("[data-open-picker]");
        if (openBtn) {
          openBtn.addEventListener("click", () => {
            if (side === "left") compareState.leftPickerOpen = true;
            else compareState.rightPickerOpen = true;
            updatePickerVisibility();
            renderAllComparisonViews();
          });
        }
        return;
      }

      if (isPickerOpen) {
        container.innerHTML = "";
        container.classList.add("is-empty-hidden");
        return;
      }
      container.classList.remove("is-empty-hidden");
      container.innerHTML = `
        <div class="compare-empty-slot">
          <p>尚未選取角色，請點擊下方按鈕開啟篩選器挑選角色。</p>
          <button type="button" class="compare-action-btn" data-open-picker="${side}">🔍 展開角色篩選器</button>
        </div>
      `;
      const openBtn = container.querySelector("[data-open-picker]");
      if (openBtn) {
        openBtn.addEventListener("click", () => {
          if (side === "left") compareState.leftPickerOpen = true;
          else compareState.rightPickerOpen = true;
          updatePickerVisibility();
          renderAllComparisonViews();
        });
      }
      return;
    }

    container.classList.remove("is-empty-hidden");

    const attrTheme = getCharacterAttrBurstTheme(c.attrTokens, side);
    const attrCssVars = buildAttrThemeCssVars(attrTheme);

    const shouldAnimate = forceSelectAnim[side] || lastRenderedCharId[side] !== c.id;
    lastRenderedCharId[side] = c.id;
    forceSelectAnim[side] = false;
    if (shouldAnimate) {
      triggerPaneSelectFlash(side, attrTheme);
    }

    const arrivalInfo = shouldAnimate ? gauntletState.challengerArrival[side] : null;
    gauntletState.challengerArrival[side] = null;

    const epithet = c.profile["稱號"] || "";
    const portraitSrc = getPortraitUrl(c.image);

    // Compute shared attributes with opponent for visual highlighting
    const opponentAttrs = new Set(opponentChar ? opponentChar.attrTokens : []);
    const sharedAttrs = new Set(c.attrTokens.filter((t) => opponentAttrs.has(t)));

    // Compact inline basic profile items (only show non-empty fields, no giant boxes!)
    const inlineStats = [
      ["種族", c.profile["種族"]],
      ["性別", c.profile["性別"]],
      ["年齡", c.profile["年齡"]],
      ["生日", c.profile["生日"]],
      ["身高", c.profile["身高"]],
      ["體重", c.profile["體重"]],
      ["善惡", c.profile["善惡"]],
      ["群體", c.profile["群體"]]
    ].filter(([, val]) => val && String(val).trim() !== "");

    const combatAbilities = c.combatAbilities || [];

    // Arena Mode: Streak, 5-Streak Flame Effect, and Champion "最強" Status
    const isArena = Boolean(gauntletState.arenaMode);
    const streakCount = isArena ? gauntletState.streaks[c.id] || 0 : 0;
    const isChampion = isArena && gauntletState.championCharId === c.id;
    const hasFiveStreakFlame = isArena && (streakCount >= 5 || isChampion);

    if (paneEl) {
      paneEl.classList.toggle("is-five-streak-flame", hasFiveStreakFlame);
      paneEl.classList.toggle("is-champion-pane", isChampion);
    }

    let powerStatusHtml = "";
    const nextTierLabel = getNextChallengerTierLabel(c, opponentChar);
    const nextPoolCount = getStrongerChallengerPool(c, opponentChar).length;

    if (isArena && isChampion) {
      powerStatusHtml = `
        <div class="compare-duel-action-row is-champion-row">
          <span class="duel-streak-pill is-blaze-streak">🔥🔥 ${streakCount} 連勝・制霸天梯巔峰</span>
          <span class="duel-champion-pill">👑 已擊破現象級・天下無雙【最強】</span>
          <button type="button" class="btn-end-arena-round sm" data-end-round="true">
            <span>🏁 結束本輪</span>
          </button>
        </div>
      `;
    } else if (isArena && opponentChar) {
      const bothRanked = c.powerScore >= 0 && opponentChar.powerScore >= 0;
      const isWeaker = bothRanked && c.powerScore > opponentChar.powerScore;
      const isStronger = bothRanked && c.powerScore < opponentChar.powerScore;

      powerStatusHtml = `
        <div class="compare-duel-action-row">
          ${
            streakCount >= 5
              ? `<span class="duel-streak-pill is-blaze-streak">🔥🔥 ${streakCount} 連勝・烈焰霸主狀態！</span>`
              : streakCount > 0
              ? `<span class="duel-streak-pill">🔥 ${streakCount} 連勝守擂中</span>`
              : ""
          }
          ${
            isStronger
              ? `<span class="duel-advantage-pill is-stronger">👑 階級優勢（領先 ${opponentChar.powerScore - c.powerScore} 階）</span>`
              : isWeaker
              ? `<span class="duel-advantage-pill is-weaker">⚠️ 階級劣勢（落後 ${c.powerScore - opponentChar.powerScore} 階）</span>`
              : bothRanked
              ? `<span class="duel-advantage-pill is-equal">⚖️ 同階對決</span>`
              : ""
          }
          <button
            type="button"
            class="btn-ko-replace ${isWeaker ? "is-weaker-target" : "is-secondary-target"}"
            data-ko-side="${side}"
            title="擊敗淘汰【${esc(c.name)}】，${nextPoolCount > 0 ? `自動派上（${esc(nextTierLabel)}）登場` : `對側角色將登頂【最強】`}"
          >
            <span class="ko-btn-icon">${nextPoolCount === 0 ? "👑" : isWeaker ? "💥" : "⚔️"}</span>
            <span class="ko-btn-text">${
              nextPoolCount === 0
                ? `幹掉最後強敵 ➜ 對側登頂【最強】！`
                : isWeaker
                ? `幹掉弱方敗者 ➜ 換【${esc(nextTierLabel)}】強敵登場`
                : `擊敗換將 ➜ 換【${esc(nextTierLabel)}】登場`
            }</span>
          </button>
        </div>
      `;
    } else if (isArena && streakCount > 0) {
      powerStatusHtml = `
        <div class="compare-duel-action-row">
          <span class="duel-streak-pill ${streakCount >= 5 ? "is-blaze-streak" : ""}">
            ${streakCount >= 5 ? `🔥🔥 ${streakCount} 連勝・烈焰霸主狀態！` : `🔥 ${streakCount} 連勝守擂中`}
          </span>
        </div>
      `;
    }

    container.innerHTML = `
      <article class="compare-dossier-card ${shouldAnimate ? "is-char-entering side-" + side : ""} ${hasFiveStreakFlame ? "is-five-streak-flame" : ""} ${isChampion ? "is-champion-card" : ""}" style="${attrCssVars}">
        ${
          hasFiveStreakFlame
            ? `
          <div class="five-streak-flame-overlay" aria-hidden="true">
            <div class="flame-bottom-surge"></div>
            <div class="flame-sparks">
              <span class="f-spark s1"></span>
              <span class="f-spark s2"></span>
              <span class="f-spark s3"></span>
              <span class="f-spark s4"></span>
              <span class="f-spark s5"></span>
            </div>
          </div>`
            : ""
        }
        ${
          isChampion
            ? `
          <div class="champion-strongest-banner">
            <div class="csb-left">
              <span class="csb-crown">👑 SUPREME CHAMPION</span>
              <span class="csb-title">殺穿現象級巔峰・世間已無對手！榮登亞雷利塔【最強】寶座！</span>
            </div>
            <button type="button" class="btn-end-arena-round sm" data-end-round="true">
              <span>🏁 結束本輪</span>
            </button>
          </div>
          <div class="champion-strongest-stamp" aria-label="天下無雙・最強印記">
            <div class="strongest-seal-ring"></div>
            <div class="strongest-seal-inner">
              <span class="strongest-sub-top">UNRIVALED</span>
              <span class="strongest-main-kanji">最強</span>
              <span class="strongest-sub-bot">天下無雙</span>
            </div>
          </div>`
            : ""
        }
        ${
          arrivalInfo
            ? `
          <div class="challenger-arrival-banner">
            <span class="challenger-tag">⚡ NEW CHALLENGER // 強敵亂入</span>
            <span class="challenger-step">原【${esc(arrivalInfo.prevName)}（${esc(arrivalInfo.prevPower)}）】敗退 ➔ 階級躍升為 <strong>${esc(arrivalInfo.newPower)}</strong>！</span>
          </div>`
            : ""
        }
        <!-- Unified Compact Character Header + Basic Specs -->
        <div class="compare-char-header">
          ${
            shouldAnimate
              ? `
            <div class="compare-burst-fx side-${side}" style="${attrCssVars}" aria-hidden="true">
              <div class="burst-flare"></div>
              <div class="burst-shockwave"></div>
              <div class="burst-ring"></div>
              <div class="burst-sparks">
                <span class="b-spark sp-1"></span>
                <span class="b-spark sp-2"></span>
                <span class="b-spark sp-3"></span>
                <span class="b-spark sp-4"></span>
                <span class="b-spark sp-5"></span>
                <span class="b-spark sp-6"></span>
                <span class="b-spark sp-7"></span>
                <span class="b-spark sp-8"></span>
              </div>
            </div>`
              : ""
          }
          <div class="compare-char-avatar-lg">
            ${
              c.image
                ? `<a href="portrait.html?src=${encodeURIComponent(c.image)}&caption=${encodeURIComponent(c.name)}" target="_blank" title="於新分頁放大檢視立繪">
                    <img src="${esc(portraitSrc)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />
                  </a>`
                : `<div class="avatar-lg-placeholder">❖</div>`
            }
            ${isChampion ? `<span class="avatar-strongest-mini-seal">最強</span>` : ""}
          </div>

          <div class="compare-char-title-box">
            <div class="compare-name-wrap">
              <div class="compare-name-group">
                <h2 class="compare-char-name">${formatCharacterDisplayName(c.name)}</h2>
                ${epithet ? `<span class="compare-char-epithet">${formatCharacterDisplayName(epithet)}</span>` : ""}
              </div>
              ${c.power ? `<span class="badge-power">⚡ 強度：${esc(c.power)}</span>` : ""}
            </div>

            ${powerStatusHtml}

            <!-- Faction & Identities Inline Row -->
            <div class="compare-faction-inline">
              <span class="badge-realm">${esc(c.realm)}</span>
              <span class="faction-main-name">${esc(c.faction)}</span>
              ${c.subFaction ? `<span class="faction-sub-name">› ${esc(c.subFaction)}</span>` : ""}
              ${c.identities.map((id) => `<span class="identity-pill">${esc(id)}</span>`).join("")}
            </div>

            <!-- Compact Inline Basic Info Tags (No giant empty boxes!) -->
            <div class="compare-inline-specs">
              ${inlineStats
                .map(
                  ([label, val]) =>
                    `<span class="spec-chip"><em>${esc(label)}：</em><strong>${esc(val)}</strong></span>`
                )
                .join("")}
            </div>

            <!-- Attributes Row -->
            <div class="compare-inline-attrs">
              <span class="attr-row-label">屬性：</span>
              ${renderAttributeBadgesHtml(c.attrTokens, sharedAttrs)}
            </div>
          </div>
        </div>

        <!-- Complete Combat Abilities, Weapons, Divine Authorities & Spells -->
        <div class="compare-abilities-list">
          ${
            combatAbilities.length > 0
              ? combatAbilities
                  .map(
                    (ab, idx) => `
                    <div class="ability-card ${getAbilityStyleClass(ab.type)}" style="--ab-idx:${idx}">
                      <div class="ability-type-header">${ab.type === "武器" ? "⚔️" : "✦"} ${esc(ab.type)}</div>
                      <div class="ability-content">${formatAbilityText(ab.content)}</div>
                    </div>
                  `
                  )
                  .join("")
              : `<div class="compare-no-abilities">此角色檔案目前無額外能力或武器欄位紀錄。</div>`
          }
        </div>
      </article>
    `;

    const koBtn = container.querySelector("[data-ko-side]");
    if (koBtn) {
      koBtn.addEventListener("click", () => {
        executeDefeatAndReplace(side);
      });
    }
    container.querySelectorAll("[data-end-round]").forEach((btn) => {
      btn.addEventListener("click", () => {
        endCurrentArenaRound();
      });
    });
  }

  // ==================== RENDER TACTICAL GAUNTLET / ARENA TOURNAMENT BAR ====================
  function renderVersusSummary(leftChar, rightChar) {
    const gauntletBar = document.getElementById("compareGauntletBar");
    if (!gauntletBar) return;

    // When Arena Mode is switched OFF, hide the gauntlet bar completely
    if (!gauntletState.arenaMode) {
      gauntletBar.innerHTML = "";
      gauntletBar.classList.add("is-hidden");
      return;
    }

    // Champion "最強" Finale View in Gauntlet Bar
    if (gauntletState.championCharId) {
      const champChar = characters.find((c) => c.id === gauntletState.championCharId);
      if (champChar) {
        const champStreak = gauntletState.streaks[champChar.id] || 1;
        const finalBoss = gauntletState.defeatedFinalBoss || { name: "現象級強敵", power: "現象級" };
        gauntletBar.classList.remove("is-hidden");
        gauntletBar.innerHTML = `
          <div class="gauntlet-champion-finale-bar">
            <div class="gcf-seal">最強</div>
            <div class="gcf-info">
              <div class="gcf-headline">
                <span class="gcf-tag">👑 擂台賽模式・終極制霸</span>
                <strong>【${formatCharacterDisplayName(champChar.name)}（${esc(champChar.power || "巔峰")}）】達成 ${champStreak} 連勝，連現象級【${esc(finalBoss.name)}】也徹底擊潰！</strong>
              </div>
              <div class="gcf-sub">世間已無任何更高階對手，特此烙印「天下無雙・最強」稱號！</div>
            </div>
            <div class="gcf-actions">
              <button type="button" class="btn-end-arena-round" data-gauntlet-end-round="true">
                <span>🏁 結束本輪（開啟新局）</span>
              </button>
            </div>
          </div>
        `;
        const endBtn = gauntletBar.querySelector("[data-gauntlet-end-round]");
        if (endBtn) endBtn.addEventListener("click", () => endCurrentArenaRound());
        return;
      }
    }

    if (!leftChar || !rightChar) {
      gauntletBar.innerHTML = "";
      gauntletBar.classList.add("is-hidden");
      return;
    }

    gauntletBar.classList.remove("is-hidden");

    const bothRanked = leftChar.powerScore >= 0 && rightChar.powerScore >= 0;
    const leftStronger = bothRanked && leftChar.powerScore < rightChar.powerScore;
    const rightStronger = bothRanked && rightChar.powerScore < leftChar.powerScore;
    const isEqual = bothRanked && leftChar.powerScore === rightChar.powerScore;

    const leftStreak = gauntletState.streaks[leftChar.id] || 0;
    const rightStreak = gauntletState.streaks[rightChar.id] || 0;
    const hasActiveRound = leftStreak > 0 || rightStreak > 0 || gauntletState.defeatedInRoundIds.size > 0;

    const leftNextTier = getNextChallengerTierLabel(leftChar, rightChar);
    const rightNextTier = getNextChallengerTierLabel(rightChar, leftChar);
    const leftPoolLen = getStrongerChallengerPool(leftChar, rightChar).length;
    const rightPoolLen = getStrongerChallengerPool(rightChar, leftChar).length;

    let centerActionHtml = "";
    if (leftStronger) {
      // Left is stronger, Right is weaker -> Primary action knocks out Right
      centerActionHtml = `
        <div class="gauntlet-verdict-tag">
          <span>🏆 擂台賽模式｜左方 <strong>${esc(leftChar.name)}（${esc(leftChar.power)}）</strong> 階級較高！</span>
        </div>
        <div class="gauntlet-cta-group">
          <button type="button" class="gauntlet-ko-btn is-primary-ko" data-gauntlet-ko="right">
            <span class="g-ko-icon">${rightPoolLen === 0 ? "👑" : "💥"}</span>
            <span class="g-ko-body">
              <strong>幹掉弱方【${esc(rightChar.name)}（${esc(rightChar.power)}）】</strong>
              <small>${
                rightPoolLen === 0
                  ? `➜ 已無更高階對手，擊敗即讓【${esc(leftChar.name)}】登頂【最強】！`
                  : `➜ 召喚更強挑戰者（${esc(rightNextTier)}）登場對決`
              }</small>
            </span>
          </button>
          <button type="button" class="gauntlet-ko-btn is-upset-ko" data-gauntlet-ko="left" title="逆轉幹掉強方【${esc(leftChar.name)}】，換上【${esc(leftNextTier)}】">
            <span>⚡ 逆轉淘汰左方</span>
          </button>
          ${
            hasActiveRound
              ? `<button type="button" class="btn-end-arena-round sm" data-gauntlet-end-round="true" title="重置當前連勝與淘汰紀錄，結束本輪擂台賽">🏁 結束本輪</button>`
              : ""
          }
        </div>
      `;
    } else if (rightStronger) {
      // Right is stronger, Left is weaker -> Primary action knocks out Left
      centerActionHtml = `
        <div class="gauntlet-verdict-tag">
          <span>🏆 擂台賽模式｜右方 <strong>${esc(rightChar.name)}（${esc(rightChar.power)}）</strong> 階級較高！</span>
        </div>
        <div class="gauntlet-cta-group">
          <button type="button" class="gauntlet-ko-btn is-primary-ko" data-gauntlet-ko="left">
            <span class="g-ko-icon">${leftPoolLen === 0 ? "👑" : "💥"}</span>
            <span class="g-ko-body">
              <strong>幹掉弱方【${esc(leftChar.name)}（${esc(leftChar.power)}）】</strong>
              <small>${
                leftPoolLen === 0
                  ? `➜ 已無更高階對手，擊敗即讓【${esc(rightChar.name)}】登頂【最強】！`
                  : `➜ 召喚更強挑戰者（${esc(leftNextTier)}）登場對決`
              }</small>
            </span>
          </button>
          <button type="button" class="gauntlet-ko-btn is-upset-ko" data-gauntlet-ko="right" title="逆轉幹掉強方【${esc(rightChar.name)}】，換上【${esc(rightNextTier)}】">
            <span>⚡ 逆轉淘汰右方</span>
          </button>
          ${
            hasActiveRound
              ? `<button type="button" class="btn-end-arena-round sm" data-gauntlet-end-round="true" title="重置當前連勝與淘汰紀錄，結束本輪擂台賽">🏁 結束本輪</button>`
              : ""
          }
        </div>
      `;
    } else {
      // Equal power tier or unranked -> Both can be knocked out equally
      centerActionHtml = `
        <div class="gauntlet-verdict-tag">
          <span>⚖️ 擂台賽模式｜${
            isEqual
              ? `雙方同為 <strong>${esc(leftChar.power)}</strong> 勢均力敵！選擇要幹掉哪一方以召喚更強挑戰者：`
              : `選擇要淘汰哪一方，並召喚更高階挑戰者登場：`
          }</span>
        </div>
        <div class="gauntlet-cta-group is-dual-equal">
          <button type="button" class="gauntlet-ko-btn is-primary-ko" data-gauntlet-ko="left">
            <span class="g-ko-icon">${leftPoolLen === 0 ? "👑" : "💥"}</span>
            <span class="g-ko-body">
              <strong>幹掉左方【${esc(leftChar.name)}】</strong>
              <small>${leftPoolLen === 0 ? "➜ 右方登頂【最強】！" : `➜ 換上（${esc(leftNextTier)}）`}</small>
            </span>
          </button>
          <button type="button" class="gauntlet-ko-btn is-primary-ko" data-gauntlet-ko="right">
            <span class="g-ko-icon">${rightPoolLen === 0 ? "👑" : "💥"}</span>
            <span class="g-ko-body">
              <strong>幹掉右方【${esc(rightChar.name)}】</strong>
              <small>${rightPoolLen === 0 ? "➜ 左方登頂【最強】！" : `➜ 換上（${esc(rightNextTier)}）`}</small>
            </span>
          </button>
          ${
            hasActiveRound
              ? `<button type="button" class="btn-end-arena-round sm" data-gauntlet-end-round="true" title="重置當前連勝與淘汰紀錄，結束本輪擂台賽">🏁 結束本輪</button>`
              : ""
          }
        </div>
      `;
    }

    const log = gauntletState.lastBattleLog;
    const logHtml = log
      ? `
      <div class="gauntlet-battle-log">
        <span class="log-badge">📢 擂台快報</span>
        <span class="log-text">
          <strong>${esc(log.winnerName)}</strong> 擊敗了 <em>${esc(log.loserName)}（${esc(log.loserPower)}）</em>！
          ${
            log.streak >= 5
              ? `<b class="log-streak is-five-fire">🔥🔥 達成 ${log.streak} 連勝（烈焰霸主領域全開）！</b>`
              : log.streak >= 2
              ? `<b class="log-streak">🔥 達成 ${log.streak} 連勝！</b>`
              : ""
          }
          ${
            log.nextName
              ? `全新強敵 <strong>${esc(log.nextName)}（${esc(log.nextPower)}）</strong> 已切入${log.loserSide === "left" ? "左側" : "右側"}戰場！`
              : ""
          }
        </span>
      </div>`
      : "";

    gauntletBar.innerHTML = `
      <div class="gauntlet-bar-inner">
        <div class="gauntlet-fighter fighter-left ${leftStronger ? "is-dominant" : rightStronger ? "is-underdog" : "is-even"} ${leftStreak >= 5 ? "is-fighter-on-fire" : ""}">
          <div class="gf-top">
            <span class="gf-slot">LEFT // 角色 A</span>
            ${
              leftStreak >= 5
                ? `<span class="gf-streak is-fire-five">🔥🔥 ${leftStreak} 連勝・烈焰</span>`
                : leftStreak > 0
                ? `<span class="gf-streak">🔥 ${leftStreak} 連勝</span>`
                : ""
            }
            ${leftStronger ? `<span class="gf-crown">👑 強方</span>` : rightStronger ? `<span class="gf-skull">💀 弱方</span>` : `<span class="gf-even">⚖️ 平手</span>`}
          </div>
          <div class="gf-name">${formatCharacterDisplayName(leftChar.name)}</div>
          <div class="gf-power">⚡ ${esc(leftChar.power || "未標註")}</div>
        </div>

        <div class="gauntlet-center-hub">
          ${centerActionHtml}
        </div>

        <div class="gauntlet-fighter fighter-right ${rightStronger ? "is-dominant" : leftStronger ? "is-underdog" : "is-even"} ${rightStreak >= 5 ? "is-fighter-on-fire" : ""}">
          <div class="gf-top">
            <span class="gf-slot">RIGHT // 角色 B</span>
            ${
              rightStreak >= 5
                ? `<span class="gf-streak is-fire-five">🔥🔥 ${rightStreak} 連勝・烈焰</span>`
                : rightStreak > 0
                ? `<span class="gf-streak">🔥 ${rightStreak} 連勝</span>`
                : ""
            }
            ${rightStronger ? `<span class="gf-crown">👑 強方</span>` : leftStronger ? `<span class="gf-skull">💀 弱方</span>` : `<span class="gf-even">⚖️ 平手</span>`}
          </div>
          <div class="gf-name">${formatCharacterDisplayName(rightChar.name)}</div>
          <div class="gf-power">⚡ ${esc(rightChar.power || "未標註")}</div>
        </div>
      </div>
      ${logHtml}
    `;

    gauntletBar.querySelectorAll("[data-gauntlet-ko]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const koSide = btn.getAttribute("data-gauntlet-ko");
        if (koSide === "left" || koSide === "right") {
          executeDefeatAndReplace(koSide);
        }
      });
    });

    gauntletBar.querySelectorAll("[data-gauntlet-end-round]").forEach((btn) => {
      btn.addEventListener("click", () => {
        endCurrentArenaRound();
      });
    });
  }

  function updatePickerVisibility() {
    const drawerL = document.getElementById("pickerDrawerLeft");
    const drawerR = document.getElementById("pickerDrawerRight");
    const btnL = document.getElementById("btnTogglePickerLeft");
    const btnR = document.getElementById("btnTogglePickerRight");
    const toggleAllLabel = document.getElementById("togglePickersLabel");

    if (drawerL) drawerL.classList.toggle("is-collapsed", !compareState.leftPickerOpen);
    if (drawerR) drawerR.classList.toggle("is-collapsed", !compareState.rightPickerOpen);

    if (btnL) {
      btnL.innerHTML = compareState.leftPickerOpen
        ? `<span>🔼 收合左側選角器</span>`
        : `<span>🔍 篩選／更換左側角色</span>`;
      btnL.classList.toggle("active", compareState.leftPickerOpen);
    }
    if (btnR) {
      btnR.innerHTML = compareState.rightPickerOpen
        ? `<span>🔼 收合右側選角器</span>`
        : `<span>🔍 篩選／更換右側角色</span>`;
      btnR.classList.toggle("active", compareState.rightPickerOpen);
    }
    if (toggleAllLabel) {
      const bothOpen = compareState.leftPickerOpen && compareState.rightPickerOpen;
      toggleAllLabel.textContent = bothOpen ? "收合雙邊選角器" : "展開雙邊選角器";
    }
  }

  function renderAllComparisonViews() {
    const leftChar = characters.find((c) => c.id === compareState.leftCharId) || null;
    const rightChar = characters.find((c) => c.id === compareState.rightCharId) || null;

    renderVersusSummary(leftChar, rightChar);
    renderPickerRoster("left");
    renderPickerRoster("right");
    renderCharacterCombatDossier(leftChar, "left", rightChar);
    renderCharacterCombatDossier(rightChar, "right", leftChar);
  }

  function resetFilters(side) {
    compareState.filters[side] = createFilterState();
    const suffix = side === "left" ? "Left" : "Right";
    ["search", "realm", "faction", "subFaction", "power", "race", "align", "attrCat", "attrItem", "abilityType"].forEach((key) => {
      const el = document.getElementById(`${key}${suffix}`);
      if (el) el.value = "";
    });
    updateCascadingSelects(side);
    renderPickerRoster(side);
  }

  function bindSideFilterEvents(side) {
    const suffix = side === "left" ? "Left" : "Right";

    const searchInput = document.getElementById(`search${suffix}`);
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        compareState.filters[side].search = searchInput.value;
        renderPickerRoster(side);
      });
    }

    const bindSelect = (fieldKey, triggersCascade = false) => {
      const el = document.getElementById(`${fieldKey}${suffix}`);
      if (!el) return;
      el.addEventListener("change", () => {
        compareState.filters[side][fieldKey] = el.value;
        if (triggersCascade) {
          updateCascadingSelects(side);
        }
        renderPickerRoster(side);
      });
    };

    bindSelect("realm", true);
    bindSelect("faction", true);
    bindSelect("subFaction", false);
    bindSelect("power", false);
    bindSelect("race", false);
    bindSelect("align", false);
    bindSelect("attrCat", true);
    bindSelect("attrItem", false);
    bindSelect("abilityType", false);

    const resetBtn = document.getElementById(`btnResetFilters${suffix}`);
    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetFilters(side));
    }

    const togglePickerBtn = document.getElementById(`btnTogglePicker${suffix}`);
    if (togglePickerBtn) {
      togglePickerBtn.addEventListener("click", () => {
        if (side === "left") compareState.leftPickerOpen = !compareState.leftPickerOpen;
        else compareState.rightPickerOpen = !compareState.rightPickerOpen;
        updatePickerVisibility();
        renderAllComparisonViews();
      });
    }

    const clearBtn = document.getElementById(`btnClear${suffix}`);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (side === "left") {
          compareState.leftCharId = "";
          compareState.leftPickerOpen = true;
        } else {
          compareState.rightCharId = "";
          compareState.rightPickerOpen = true;
        }
        if (gauntletState.championSide === side) {
          resetArenaRoundState();
        }
        syncUrlAndStorage();
        updatePickerVisibility();
        renderAllComparisonViews();
      });
    }
  }

  function applyCompareTheme(theme) {
    const valid = ["ocean", "beach", "worldtree", "starry", "dark", "light"];
    compareState.theme = valid.includes(theme) ? theme : "ocean";
    document.documentElement.setAttribute("data-theme", compareState.theme);
    localStorage.setItem("arelita_theme", compareState.theme);

    const iconEl = document.getElementById("compareThemeIcon");
    const textEl = document.getElementById("compareThemeText");
    if (iconEl && textEl) {
      if (compareState.theme === "ocean") {
        iconEl.textContent = "🌊";
        textEl.textContent = "夏日海洋";
      } else if (compareState.theme === "beach") {
        iconEl.textContent = "🏖️";
        textEl.textContent = "假日海灘";
      } else if (compareState.theme === "worldtree") {
        iconEl.textContent = "🌳";
        textEl.textContent = "世界樹版";
      } else if (compareState.theme === "starry") {
        iconEl.textContent = "🌌";
        textEl.textContent = "星空版本";
      } else if (compareState.theme === "dark") {
        iconEl.textContent = "🌙";
        textEl.textContent = "黑色版本";
      } else {
        iconEl.textContent = "☀️";
        textEl.textContent = "白色版本";
      }
    }
  }

  function initHeaderActions() {
    const arenaToggleBtn = document.getElementById("btnToggleArenaMode");
    if (arenaToggleBtn) {
      arenaToggleBtn.addEventListener("click", () => {
        setArenaMode(!gauntletState.arenaMode);
      });
    }

    const swapBtn = document.getElementById("btnSwapChars");
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const tmp = compareState.leftCharId;
        compareState.leftCharId = compareState.rightCharId;
        compareState.rightCharId = tmp;
        if (gauntletState.championSide === "left") {
          gauntletState.championSide = "right";
        } else if (gauntletState.championSide === "right") {
          gauntletState.championSide = "left";
        }
        forceSelectAnim.left = Boolean(compareState.leftCharId);
        forceSelectAnim.right = Boolean(compareState.rightCharId);
        syncUrlAndStorage();
        renderAllComparisonViews();
      });
    }

    const clearBothBtn = document.getElementById("btnClearBothChars");
    if (clearBothBtn) {
      clearBothBtn.addEventListener("click", () => {
        compareState.leftCharId = "";
        compareState.rightCharId = "";
        compareState.leftPickerOpen = true;
        compareState.rightPickerOpen = true;
        resetArenaRoundState();
        syncUrlAndStorage();
        updatePickerVisibility();
        renderAllComparisonViews();
      });
    }

    const applyRandomPair = (leftId, rightId) => {
      compareState.leftCharId = leftId;
      compareState.rightCharId = rightId;
      compareState.leftPickerOpen = false;
      compareState.rightPickerOpen = false;
      forceSelectAnim.left = true;
      forceSelectAnim.right = true;
      resetArenaRoundState();
      syncUrlAndStorage();
      updatePickerVisibility();
      renderAllComparisonViews();
    };

    const randomPureBtn = document.getElementById("btnRandomPure");
    if (randomPureBtn) {
      randomPureBtn.addEventListener("click", () => {
        if (characters.length < 2) return;
        const idx1 = Math.floor(Math.random() * characters.length);
        let idx2 = Math.floor(Math.random() * characters.length);
        if (idx2 === idx1) idx2 = (idx1 + 1) % characters.length;
        applyRandomPair(characters[idx1].id, characters[idx2].id);
      });
    }

    const randomSimilarBtn = document.getElementById("btnRandomSimilar");
    if (randomSimilarBtn) {
      randomSimilarBtn.addEventListener("click", () => {
        if (characters.length < 2) return;
        // 嚴格篩選具備天梯位階、且至少存在 1 位階級差距 <= 2 的對手角色群
        const rankedPool = characters.filter((c) => {
          if (c.powerScore < 0) return false;
          return characters.some(
            (other) =>
              other.id !== c.id &&
              other.powerScore >= 0 &&
              Math.abs(other.powerScore - c.powerScore) <= 2
          );
        });
        const pool = rankedPool.length >= 2 ? rankedPool : characters;

        const charA = pool[Math.floor(Math.random() * pool.length)];
        const others = pool.filter((c) => c.id !== charA.id);

        // 核心規則：實力相近差距「不超過三個階級」（即差距 <= 2 個小階級）
        // 例如：神王一級（score 6）對古神二級（score 8，相差 2 階）允許；神王一級對古神一級（score 9，相差 3 階）嚴格排除！
        let candidates = others.filter(
          (c) =>
            c.powerScore >= 0 &&
            charA.powerScore >= 0 &&
            Math.abs(c.powerScore - charA.powerScore) <= 2
        );

        if (candidates.length === 0) {
          candidates = others;
        }

        const charB = candidates[Math.floor(Math.random() * candidates.length)];
        if (Math.random() < 0.5) {
          applyRandomPair(charA.id, charB.id);
        } else {
          applyRandomPair(charB.id, charA.id);
        }
      });
    }

    const toggleAllBtn = document.getElementById("btnToggleAllPickers");
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const nextState = !(compareState.leftPickerOpen && compareState.rightPickerOpen);
        compareState.leftPickerOpen = nextState;
        compareState.rightPickerOpen = nextState;
        updatePickerVisibility();
        renderAllComparisonViews();
      });
    }

    const copyBtn = document.getElementById("btnCopyCompareUrl");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        syncUrlAndStorage();
        const label = document.getElementById("copyUrlText");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            if (label) {
              label.textContent = "✓ 已複製連結";
              setTimeout(() => {
                label.textContent = "分享對比連結";
              }, 1800);
            }
          });
        }
      });
    }

    const themeBtn = document.getElementById("compareThemeToggleBtn");
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
        applyCompareTheme(nextMap[compareState.theme] || "ocean");
      });
    }

    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          backToTopBtn.classList.toggle("visible", y > 240);
        },
        { passive: true }
      );
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  // Boot Comparison Page
  applyCompareTheme(compareState.theme);
  syncArenaModeToggleUI();
  initSelectedCharacters();
  initStaticFilterSelects("left");
  initStaticFilterSelects("right");
  updateCascadingSelects("left");
  updateCascadingSelects("right");
  bindSideFilterEvents("left");
  bindSideFilterEvents("right");
  initHeaderActions();
  updatePickerVisibility();
  syncUrlAndStorage();
  renderAllComparisonViews();
})();
