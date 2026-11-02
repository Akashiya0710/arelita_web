(function () {
  "use strict";

  const DATA = window.ARELITA_DATA || { characters: [], lore: [], stories: [], attributeCategories: [] };
  const characters = DATA.characters || [];
  const loreDocs = DATA.lore || [];
  const stories = DATA.stories || [];
  const attributeCategories = toArray(DATA.attributeCategories);

  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  // Canonical World-Setting Races (現存 12 族 + 已消失 9 族 + 不明種族)
  const CANONICAL_RACES = [
    // 現存 12 族
    "人類", "惡魔", "天使", "墮天使", "元素族", "獸人族",
    "龍族", "亡靈族", "不死族", "血魔族", "妖精族", "幻想種",
    // 已消失 9 族
    "吸血鬼", "妖怪", "妖魔", "精靈", "史萊姆妖",
    "巨人族", "矮人族", "哥布林族", "影魔族",
    // 獨立拆分不明種族
    "不明種族"
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

    if (matched.size === 0) {
      matched.add("不明種族");
    }
    return CANONICAL_RACES.filter((r) => matched.has(r));
  }

  function parseAttributeTokens(rawAttr) {
    const s = String(rawAttr || "").trim();
    if (!s) return [];
    return s
      .split(/[,、，\n\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  characters.forEach((c) => {
    c.identities = toArray(c.identities);
    c.abilities = toArray(c.abilities);
    c.profile = c.profile || {};
    c.subFaction = c.subFaction || "";
    c.power = c.power || "";
    c.story = c.story || "";
    c.raceCategories = extractCharacterRaces(c.profile["種族"]);
    c.attrTokens = parseAttributeTokens(c.profile["屬性"]);
  });

  loreDocs.forEach((d) => {
    d.blocks = toArray(d.blocks);
  });

  stories.forEach((s) => {
    s.paragraphs = toArray(s.paragraphs);
  });

  // Build Attribute Lookup Map across all 17 Categories
  const attributeLookupMap = new Map();
  let totalAttributeItemsCount = 0;
  attributeCategories.forEach((cat) => {
    cat.items = toArray(cat.items);
    cat.items.forEach((item) => {
      totalAttributeItemsCount++;
      attributeLookupMap.set(item.name, item);
      // Support slash-separated aliases like "破壞 / 毀滅"
      if (item.name.includes("/")) {
        item.name.split("/").forEach((part) => {
          const clean = part.trim();
          if (clean && !attributeLookupMap.has(clean)) {
            attributeLookupMap.set(clean, item);
          }
        });
      }
    });
  });
  // Explicit common aliases (e.g. 黑神之火 -> 黑神之炎)
  if (attributeLookupMap.has("黑神之炎") && !attributeLookupMap.has("黑神之火")) {
    attributeLookupMap.set("黑神之火", attributeLookupMap.get("黑神之炎"));
  }

  function findAttributeRecord(attrToken) {
    const clean = String(attrToken || "").trim();
    if (!clean) return null;
    if (attributeLookupMap.has(clean)) return attributeLookupMap.get(clean);
    if (clean.includes("/")) {
      for (const p of clean.split("/")) {
        const sub = p.trim();
        if (attributeLookupMap.has(sub)) return attributeLookupMap.get(sub);
      }
    }
    return null;
  }

  // Attribute Individual Visual & Color-Block Design System (155 種屬性個別配色、漸層、金邊與裝飾紋章)
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

    // 二、水與冰雪屬性（17 種）
    "水": { style: "background:#1d4ed8;border-color:#60a5fa;color:#eff6ff;" },
    "海洋": { style: "background:linear-gradient(135deg,#0c4a6e,#1e3a8a 58%,#0369a1);border-color:#38bdf8;color:#e0f2fe;", icon: "🌊" },
    "源水": { style: "background:linear-gradient(135deg,#082f49 0%,#1d4ed8 52%,#0d9488 100%);border-color:#fde047;color:#fef9c3;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "👑", isSupreme: true },
    "月水": { style: "background:linear-gradient(135deg,#1e1b4b,#1d4ed8 55%,#0284c7);border-color:#fef08a;color:#e0f2fe;", icon: "🌙" },
    "水銀": { style: "background:linear-gradient(135deg,#334155,#475569 52%,#0369a1);border-color:#cbd5e1;color:#f8fafc;" },
    "鹽": { style: "background:linear-gradient(135deg,#334155,#0284c7);border-color:#f8fafc;color:#f8fafc;" },
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
    "雷": { style: "background:#5b21b6;border-color:#c084fc;color:#f5f3ff;" },
    "紫電": { style: "background:linear-gradient(135deg,#4c1d95,#7e22ce 55%,#a21caf);border-color:#e879f9;color:#fae8ff;", icon: "⚡" },
    "白雷": { style: "background:linear-gradient(135deg,#475569,#ca8a04 55%,#eab308);border-color:#ffffff;color:#fefce8;box-shadow:0 0 8px rgba(254,240,138,0.32);", icon: "⚡", isSupreme: true },
    "銀雷": { style: "background:linear-gradient(135deg,#334155,#6d28d9);border-color:#e2e8f0;color:#f8fafc;" },
    "灰黯之雷": { style: "background:linear-gradient(135deg,#18181b,#3f3f46 55%,#4c1d95);border-color:#a855f7;color:#e9d5ff;", icon: "⚡" },
    "滅邪神雷": { style: "background:linear-gradient(135deg,#4c1d95 0%,#854d0e 55%,#b45309 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.36);", icon: "⚡", isSupreme: true },
    "神龍狂雷": { style: "background:linear-gradient(135deg,#3b0764 0%,#6d28d9 52%,#b45309 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🐉", isSupreme: true },

    // 五、土石、金屬與礦物屬性（12 種）
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
    "銳利": { style: "background:linear-gradient(135deg,#1e293b,#991b1b);border-color:#f8fafc;color:#ffe4e6;", icon: "⚔️" },

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

    // 八、天體星空與日月屬性（9 種）
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

    // 十二、戰鬥相關屬性（6 種）
    "力量": { style: "background:linear-gradient(135deg,#7c2d12,#b45309);border-color:#facc15;color:#fef9c3;" },
    "武": { style: "background:linear-gradient(135deg,#451a03,#9a3412 55%,#991b1b);border-color:#fbbf24;color:#fef3c7;", icon: "🥋" },
    "守護": { style: "background:linear-gradient(135deg,#1e3a8a,#065f46);border-color:#fde047;color:#fef9c3;", icon: "🛡️" },
    "劍": { style: "background:linear-gradient(135deg,#1e293b,#0284c7 55%,#475569);border-color:#f8fafc;color:#f0f9ff;", icon: "⚔️" },
    "狂": { style: "background:linear-gradient(135deg,#18181b,#991b1b 60%,#c2410c);border-color:#ef4444;color:#fecaca;", icon: "🔥" },
    "掠奪": { style: "background:linear-gradient(135deg,#18181b 0%,#881337 55%,#4c1d95 100%);border-color:#fbbf24;color:#fef08a;box-shadow:0 0 9px rgba(251,191,36,0.34);", icon: "⛓️", isSupreme: true },

    // 十三、時空法則屬性（4 種）
    "時間": { style: "background:linear-gradient(135deg,#134e4a,#0f766e 55%,#78350f);border-color:#fde047;color:#fef9c3;box-shadow:0 0 8px rgba(253,224,71,0.3);", icon: "⏳", isSupreme: true },
    "空間": { style: "background:linear-gradient(135deg,#0f172a,#1e1b4b 50%,#0e7490);border-color:#38bdf8;color:#e0f2fe;box-shadow:0 0 8px rgba(56,189,248,0.3);", icon: "💠", isSupreme: true },
    "時空": { style: "background:linear-gradient(135deg,#0f172a 0%,#0f766e 45%,#4c1d95 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 11px rgba(253,224,71,0.42);", icon: "✦", isSupreme: true },

    // 十四、精神、靈魂、感知、幻象與心智（14 種）
    "精神": { style: "background:#581c87;border-color:#e879f9;color:#fae8ff;" },
    "靈魂": { style: "background:linear-gradient(135deg,#1e1b4b,#0f766e 55%,#581c87);border-color:#5eead4;color:#ccfbf1;", icon: "🔮", isSupreme: true },
    "魂": { style: "background:#3b0764;border-color:#c084fc;color:#f3e8ff;" },
    "認知": { style: "background:linear-gradient(135deg,#312e81,#701a75);border-color:#f472b6;color:#fce7f3;", icon: "👁️", isSupreme: true },
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

    // 十七、特殊屬性、法則概念與始源（16 種）
    "自然": { style: "background:linear-gradient(135deg,#064e3b 0%,#047857 50%,#a16207 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.38);", icon: "🌿", isSupreme: true },
    "生命": { style: "background:linear-gradient(135deg,#065f46,#10b981 50%,#ca8a04);border-color:#fef08a;color:#fefce8;", icon: "🌱", isSupreme: true },
    "死": { style: "background:linear-gradient(135deg,#09090b 0%,#18181b 55%,#3b0764 100%);border-color:#e11d48;color:#fda4af;box-shadow:0 0 9px rgba(225,29,72,0.35);", icon: "💀", isSupreme: true },
    "真實": { style: "background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 38%,#38bdf8 72%,#ffffff 100%);border-color:#e0f2fe;color:#ffffff;box-shadow:0 0 12px rgba(186,230,253,0.55);", icon: "✦", isSupreme: true },
    "理": { style: "background:linear-gradient(135deg,#1e1b4b 0%,#1d4ed8 50%,#78350f 100%);border-color:#fde047;color:#fef08a;box-shadow:0 0 9px rgba(253,224,71,0.34);", icon: "❖", isSupreme: true },
    "真實/理": { style: "background:linear-gradient(135deg,#0f172a 0%,#1e40af 40%,#38bdf8 75%,#ffffff 100%);border-color:#bae6fd;color:#ffffff;box-shadow:0 0 12px rgba(186,230,253,0.55);", icon: "✦", isSupreme: true },
    "母": { style: "background:linear-gradient(135deg,#065f46,#b45309 55%,#be185d);border-color:#fde047;color:#fef08a;box-shadow:0 0 10px rgba(253,224,71,0.35);", icon: "👑", isSupreme: true },
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
    if (/雷|電/.test(name)) return { style: "background:linear-gradient(135deg,#4c1d95,#7e22ce);border-color:#c084fc;color:#f5f3ff;" };
    if (/光|聖/.test(name)) return { style: "background:linear-gradient(135deg,#854d0e,#ca8a04);border-color:#fde047;color:#fefce8;" };
    if (/暗|影|冥|夜/.test(name)) return { style: "background:linear-gradient(135deg,#18122b,#3b0764);border-color:#9333ea;color:#f3e8ff;" };
    if (/血/.test(name)) return { style: "background:linear-gradient(135deg,#450a0a,#991b1b);border-color:#ef4444;color:#fef2f2;" };
    return { style: "background:#334155;border-color:#94a3b8;color:#f1f5f9;" };
  }

  function getAttributeBadgeStyle(attrName) {
    return getAttributeVisual(attrName).style;
  }

  function renderAttributeBadgeInner(attrName) {
    return `<span>${esc(attrName)}</span>`;
  }

  function renderAttributeBadgesHtml(rawAttrStr, compact = false) {
    const tokens = parseAttributeTokens(rawAttrStr);
    if (tokens.length === 0) return `<span class="meta-val">無</span>`;
    return `<div class="attr-badges-wrap ${compact ? "compact" : ""}">
      ${tokens
        .map((t) => {
          const v = getAttributeVisual(t);
          const rec = findAttributeRecord(t);
          const titleHint = rec
            ? `點擊查看「${rec.name}」屬性介紹（${rec.categoryTitle}）`
            : `點擊前往全屬性圖鑑檢視「${t}」`;
          return `<button type="button" class="attr-color-badge ${compact ? "sm" : ""} ${v.isSupreme ? "is-supreme" : ""}" style="${v.style}" data-jump-attr="${esc(t)}" title="${esc(titleHint)}">${renderAttributeBadgeInner(t)}</button>`;
        })
        .join("")}
    </div>`;
  }

  // Application State
  const state = {
    theme: localStorage.getItem("arelita_theme") || "worldtree", // 'worldtree' | 'starry' | 'dark' | 'light'
    activeTab: "home",
    selectedRealm: "",
    selectedFaction: "",
    selectedSubFaction: "",
    filterHasImage: false,
    filterPowerTier: "",
    filterRace: "",
    searchQuery: "",
    viewMode: "showcase", // 'showcase' | 'grid'
    selectedLoreMode: "doc", // 'doc' | 'org' | 'org-overview'
    selectedLoreOrg: "",
    selectedLoreId: loreDocs.length > 0 ? loreDocs[0].id : "",
    selectedStoryId: stories.length > 0 ? stories[0].id : "",
    // Attribute Handbook State
    selectedAttrCatId: "", // '' = all 17 categories
    selectedAttrName: "",
    attrSearchQuery: "",
    expandedStories: new Set(),
    // Collapsible Sidebar Tree State
    expandedRealms: new Set(["現界"]),
    expandedFactions: new Set(),
    expandedSubGroups: new Set(),
    expandedLoreCats: new Set(["主要設定", "組織與國家設定", "其他設定"]),
    collapsedMainGroups: new Set(),
    // Gallery Categorized State
    galleryRealm: "",
    galleryFaction: "",
    gallerySubFaction: "",
    galleryExpandedRealms: new Set(["現界", "其他"]),
    galleryExpandedFactions: new Set(),
    galleryExpandedSubGroups: new Set(),
    collapsedGalleryGroups: new Set(),
    expandedStorySeries: new Set(["魔風傳記—銀狼復仇篇", "入秋初盛綻，秋去罈留香", "外傳"])
  };

  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatAbilityText(text) {
    let safe = esc(text);
    // Support markdown style ~~text~~ or word-extracted struck-through text
    safe = safe.replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
    // Support inline or multi-line -技能或武器名- so each item starts on a clean line
    safe = safe.replace(/(^|\n|[。！？）)\s])\s*-([^-\n]{1,36})-/g, (match, prefix, name) => {
      const br = prefix === "" || prefix === "\n" ? prefix : `${prefix}\n`;
      return `${br}<span class="skill-subname">❖ ${name.trim()}</span>`;
    });
    safe = safe.replace(/「“([^”]+)”」/g, '<span class="skill-subname">「$1」</span>');
    return safe;
  }

  function getAbilityStyleClass(type) {
    if (type === "武器") return "type-weapon";
    if (["神權", "神言", "神器", "眷屬權能"].includes(type)) return "type-divine";
    if (["古言靈術", "虛能", "魔眼", "九紋龍印"].includes(type)) return "type-ancient";
    if (["最高等術式", "共鳴", "世界共鳴", "亞雷利塔光環"].includes(type)) return "type-supreme";
    return "";
  }

  function formatCharacterDisplayName(name) {
    if (!name) return "";
    let safe = esc(name);
    return safe.replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
  }

  function getCharacterPlainName(name) {
    return String(name || "").replace(/~~([^~]+)~~/g, "$1").trim();
  }

  function formatStoryHtml(storyText) {
    if (!storyText) return '<span style="color:var(--text-muted)">（尚無背景故事紀錄）</span>';
    const blocks = String(storyText).split(/—{4,}|-{3,}/);
    return blocks
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        let safe = esc(trimmed);
        safe = safe.replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
        return `<div>${safe}</div>`;
      })
      .filter(Boolean)
      .join('<hr class="story-divider" />');
  }

  const REALM_ORDER = ["現界", "魔界", "天界", "其他"];
  const FACTION_ORDER = [
    "魔風聯邦",
    "極真圃",
    "影風之巔",
    "寂靜之音",
    "銀狼傭兵公會",
    "世界賢者館",
    "東方滅魔館",
    "亞雷利塔魔法之根協會",
    "月星民國",
    "日天聯邦",
    "卡姆利亞獸人聯邦",
    "新世生命教",
    "天災",
    "凱撒家族",
    "天界",
    "神明",
    "傳奇",
    "流浪者",
    "邪神"
  ];
  const SUBFACTION_ORDER = [
    "最高層",
    "冥府神傑",
    "獨立特級",
    "魔風軍團",
    "魔風軍團 / 雷霆殿",
    "魔風軍團 / 紅蓮組",
    "魔風軍團 / 戰龍",
    "魔風軍團 / 潔白協奏",
    "魔風軍團 / 夜妖",
    "魔風軍團 / 墮天光輝",
    "魔風軍團 / 血魔之影",
    "魔風軍團 / 陰暗幽鬼",
    "SECT「特殊事件對策組」",
    "獄炎監察部隊",
    "魔風審判庭",
    "公安局"
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

  // ==================== INITIALIZE FILTERS & COUNTS ====================
  function initHeaderAndFilters() {
    const withImages = characters.filter((c) => c.image);
    document.getElementById("navCharCount").textContent = characters.length;
    document.getElementById("navWorldCount").textContent = loreDocs.length;
    const navAttrEl = document.getElementById("navAttrCount");
    if (navAttrEl) navAttrEl.textContent = totalAttributeItemsCount;
    document.getElementById("navStoryCount").textContent = stories.length;
    document.getElementById("navGalleryCount").textContent = withImages.length;
    document.getElementById("hasImageCountBadge").textContent = withImages.length;

    const hChars = document.getElementById("heroStatChars");
    const hImgs = document.getElementById("heroStatImgs");
    const hLore = document.getElementById("heroStatLore");
    const hAttrs = document.getElementById("heroStatAttrs");
    const hStories = document.getElementById("heroStatStories");
    if (hChars) hChars.textContent = characters.length;
    if (hImgs) hImgs.textContent = withImages.length;
    if (hLore) hLore.textContent = loreDocs.length;
    if (hAttrs) hAttrs.textContent = totalAttributeItemsCount;
    if (hStories) hStories.textContent = stories.length;

    // 現象級移到最上面
    const tierOrder = [
      "現象級", "終世級", "降臨級", "神座級",
      "神王", "古神", "神明", "準神", "魔王",
      "英雄", "龍獸", "天罰", "猛鬼", "精靈", "魔導", "騎士", "魔獸", "猛獸", "凡人"
    ];
    const powerSelect = document.getElementById("filterPowerTier");
    tierOrder.forEach((tier) => {
      const count = characters.filter((c) => c.power.includes(tier)).length;
      if (count > 0) {
        const opt = document.createElement("option");
        opt.value = tier;
        opt.textContent = `${tier} (${count})`;
        powerSelect.appendChild(opt);
      }
    });

    // 以世界觀標準種族分類（支援雙種族以上角色於各該種族皆可檢索，並將不明種族獨立拆分）
    const raceSelect = document.getElementById("filterRace");
    CANONICAL_RACES.forEach((race) => {
      const count = characters.filter((c) => c.raceCategories && c.raceCategories.includes(race)).length;
      if (count > 0) {
        const opt = document.createElement("option");
        opt.value = race;
        opt.textContent = `${race} (${count})`;
        opt.title = `${race} (${count})`;
        raceSelect.appendChild(opt);
      }
    });
  }

  // ==================== BUILD COLLAPSIBLE FACTION SIDEBAR TREE ====================
  function renderFactionTree() {
    const container = document.getElementById("factionTreeContainer");
    const isAllActive = !state.selectedRealm && !state.selectedFaction && !state.selectedSubFaction;
    const totalWithImg = characters.filter((c) => c.image).length;

    let html = `
      <div class="tree-quick-actions">
        <button class="tree-action-btn" id="btnExpandAllTree" title="展開所有目錄層級">➕ 全部展開</button>
        <button class="tree-action-btn" id="btnCollapseAllTree" title="收合所有目錄層級">➖ 全部折疊</button>
      </div>

      <div style="margin-bottom:0.5rem;">
        <button class="tree-item ${isAllActive ? "active" : ""}" data-select-realm="" data-select-faction="" data-select-sub="">
          <span class="tree-item-label">🌟 全部陣營角色</span>
          <span class="tree-item-badges">
            <span class="tree-img-dot" title="含 ${totalWithImg} 張形象圖">🖼️${totalWithImg}</span>
            <span class="tree-count">${characters.length}</span>
          </span>
        </button>
      </div>
    `;

    REALM_ORDER.forEach((realm) => {
      const realmChars = characters.filter((c) => c.realm === realm);
      if (realmChars.length === 0) return;

      const isRealmOpen = state.expandedRealms.has(realm);
      const isRealmActive = state.selectedRealm === realm && !state.selectedFaction;
      const factions = Array.from(new Set(realmChars.map((c) => c.faction))).sort(sortFactions);

      html += `
        <div class="tree-realm-group">
          <button class="tree-realm-header-btn ${isRealmOpen ? "expanded" : ""}" data-toggle-realm="${esc(realm)}">
            <span class="tree-realm-left">
              <span class="tree-chevron ${isRealmOpen ? "open" : ""}">▶</span>
              <span>【${esc(realm)}】勢力陣營</span>
            </span>
            <span class="tree-count">${realmChars.length}</span>
          </button>

          <div class="tree-children-box ${isRealmOpen ? "" : "collapsed"}">
            <div class="tree-row">
              <span class="tree-expand-spacer"></span>
              <button class="tree-item ${isRealmActive ? "active" : ""}" data-select-realm="${esc(realm)}" data-select-faction="" data-select-sub="">
                <span class="tree-item-label">📂 ${esc(realm)}全部 (${realmChars.length})</span>
              </button>
            </div>
      `;

      factions.forEach((faction) => {
        const facKey = `${realm}::${faction}`;
        const facChars = realmChars.filter((c) => c.faction === faction);
        const facImgs = facChars.filter((c) => c.image).length;
        const isFacActive =
          state.selectedRealm === realm &&
          state.selectedFaction === faction &&
          !state.selectedSubFaction;

        const rawSubs = Array.from(
          new Set(facChars.map((c) => c.subFaction).filter(Boolean))
        ).sort(sortSubFactions);

        const hasSubs = rawSubs.length > 0;
        const isFacOpen = state.expandedFactions.has(facKey);

        html += `
          <div class="tree-row">
            ${
              hasSubs
                ? `<button class="tree-expand-btn" data-toggle-faction="${esc(facKey)}" title="${isFacOpen ? "收合子分類" : "展開子分類"}">
                    <span class="tree-chevron ${isFacOpen ? "open" : ""}">▶</span>
                  </button>`
                : `<span class="tree-expand-spacer"></span>`
            }
            <button class="tree-item ${isFacActive ? "active" : ""}" data-select-realm="${esc(realm)}" data-select-faction="${esc(faction)}" data-select-sub="" data-auto-toggle-faction="${hasSubs ? esc(facKey) : ""}">
              <span class="tree-item-label">🛡️ ${esc(faction)}</span>
              <span class="tree-item-badges">
                ${facImgs > 0 ? `<span class="tree-img-dot" title="含 ${facImgs} 張形象圖">🖼️${facImgs}</span>` : ""}
                <span class="tree-count">${facChars.length}</span>
              </span>
            </button>
          </div>
        `;

        if (hasSubs) {
          // Group nested 2-level subFactions like "魔風軍團 / 夜妖" under a collapsible "魔風軍團" node
          const topSubOrder = [];
          const topSubMap = new Map();

          rawSubs.forEach((sub) => {
            if (sub.includes(" / ")) {
              const [parentSub, childSub] = sub.split(" / ");
              if (!topSubMap.has(parentSub)) {
                topSubMap.set(parentSub, { children: [], directExists: false });
                topSubOrder.push(parentSub);
              }
              topSubMap.get(parentSub).children.push({ full: sub, label: childSub });
            } else {
              if (!topSubMap.has(sub)) {
                topSubMap.set(sub, { children: [], directExists: true });
                topSubOrder.push(sub);
              } else {
                topSubMap.get(sub).directExists = true;
              }
            }
          });

          topSubOrder.sort(sortSubFactions);

          html += `<div class="tree-sub-children ${isFacOpen ? "" : "collapsed"}">`;

          topSubOrder.forEach((topSub) => {
            const info = topSubMap.get(topSub);
            if (info.children.length > 0) {
              // Collapsible sub-group (e.g., 魔風軍團 with 8 divisions, or 法則神 with 十死神)
              const subGroupKey = `${facKey}::${topSub}`;
              const isSubGroupOpen = state.expandedSubGroups.has(subGroupKey);
              const groupChars = facChars.filter(
                (c) => c.subFaction === topSub || c.subFaction.startsWith(topSub + " / ")
              );
              const groupImgs = groupChars.filter((c) => c.image).length;
              const isGroupActive =
                state.selectedRealm === realm &&
                state.selectedFaction === faction &&
                state.selectedSubFaction === topSub;

              html += `
                <div class="tree-row">
                  <button class="tree-expand-btn" data-toggle-subgroup="${esc(subGroupKey)}" title="${isSubGroupOpen ? "收合部隊" : "展開部隊"}">
                    <span class="tree-chevron ${isSubGroupOpen ? "open" : ""}">▶</span>
                  </button>
                  <button class="tree-item tree-item-sub ${isGroupActive ? "active" : ""}" data-select-realm="${esc(realm)}" data-select-faction="${esc(faction)}" data-select-sub="${esc(topSub)}" data-auto-toggle-subgroup="${esc(subGroupKey)}">
                    <span class="tree-item-label">⚔️ ${esc(topSub)}</span>
                    <span class="tree-item-badges">
                      ${groupImgs > 0 ? `<span class="tree-img-dot">🖼️${groupImgs}</span>` : ""}
                      <span class="tree-count">${groupChars.length}</span>
                    </span>
                  </button>
                </div>
                <div class="tree-sub-children ${isSubGroupOpen ? "" : "collapsed"}">
              `;

              info.children.forEach((ch) => {
                const chChars = facChars.filter((c) => c.subFaction === ch.full);
                const chImgs = chChars.filter((c) => c.image).length;
                const isChActive =
                  state.selectedRealm === realm &&
                  state.selectedFaction === faction &&
                  state.selectedSubFaction === ch.full;

                html += `
                  <div class="tree-row">
                    <span class="tree-expand-spacer"></span>
                    <button class="tree-item tree-item-sub ${isChActive ? "active" : ""}" data-select-realm="${esc(realm)}" data-select-faction="${esc(faction)}" data-select-sub="${esc(ch.full)}">
                      <span class="tree-item-label">• ${esc(ch.label)}</span>
                      <span class="tree-item-badges">
                        ${chImgs > 0 ? `<span class="tree-img-dot">🖼️${chImgs}</span>` : ""}
                        <span class="tree-count">${chChars.length}</span>
                      </span>
                    </button>
                  </div>
                `;
              });

              html += `</div>`;
            } else {
              // Leaf sub-faction (e.g., 最高層, 冥府神傑, 獨立特級, 龍神, etc.)
              const subChars = facChars.filter((c) => c.subFaction === topSub);
              const subImgs = subChars.filter((c) => c.image).length;
              const isSubActive =
                state.selectedRealm === realm &&
                state.selectedFaction === faction &&
                state.selectedSubFaction === topSub;

              html += `
                <div class="tree-row">
                  <span class="tree-expand-spacer"></span>
                  <button class="tree-item tree-item-sub ${isSubActive ? "active" : ""}" data-select-realm="${esc(realm)}" data-select-faction="${esc(faction)}" data-select-sub="${esc(topSub)}">
                    <span class="tree-item-label">• ${esc(topSub)}</span>
                    <span class="tree-item-badges">
                      ${subImgs > 0 ? `<span class="tree-img-dot">🖼️${subImgs}</span>` : ""}
                      <span class="tree-count">${subChars.length}</span>
                    </span>
                  </button>
                </div>
              `;
            }
          });

          html += `</div>`;
        }
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Bind Expand All / Collapse All
    const btnExpandAll = document.getElementById("btnExpandAllTree");
    const btnCollapseAll = document.getElementById("btnCollapseAllTree");
    if (btnExpandAll) {
      btnExpandAll.addEventListener("click", () => {
        REALM_ORDER.forEach((r) => state.expandedRealms.add(r));
        characters.forEach((c) => {
          if (c.subFaction) {
            const fk = `${c.realm}::${c.faction}`;
            state.expandedFactions.add(fk);
            if (c.subFaction.includes(" / ")) {
              const parentSub = c.subFaction.split(" / ")[0];
              state.expandedSubGroups.add(`${fk}::${parentSub}`);
            }
          }
        });
        renderFactionTree();
      });
    }
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener("click", () => {
        state.expandedRealms.clear();
        state.expandedFactions.clear();
        state.expandedSubGroups.clear();
        renderFactionTree();
      });
    }

    // Bind Realm header toggle
    container.querySelectorAll("[data-toggle-realm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.getAttribute("data-toggle-realm");
        if (state.expandedRealms.has(r)) {
          state.expandedRealms.delete(r);
        } else {
          state.expandedRealms.add(r);
        }
        renderFactionTree();
      });
    });

    // Bind Faction arrow toggle
    container.querySelectorAll("[data-toggle-faction]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fk = btn.getAttribute("data-toggle-faction");
        if (state.expandedFactions.has(fk)) {
          state.expandedFactions.delete(fk);
        } else {
          state.expandedFactions.add(fk);
        }
        renderFactionTree();
      });
    });

    // Bind SubGroup arrow toggle
    container.querySelectorAll("[data-toggle-subgroup]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sgk = btn.getAttribute("data-toggle-subgroup");
        if (state.expandedSubGroups.has(sgk)) {
          state.expandedSubGroups.delete(sgk);
        } else {
          state.expandedSubGroups.add(sgk);
        }
        renderFactionTree();
      });
    });

    // Bind Selection items
    container.querySelectorAll("[data-select-realm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.getAttribute("data-select-realm") || "";
        const f = btn.getAttribute("data-select-faction") || "";
        const s = btn.getAttribute("data-select-sub") || "";
        const autoFac = btn.getAttribute("data-auto-toggle-faction") || "";
        const autoSub = btn.getAttribute("data-auto-toggle-subgroup") || "";

        // If clicking the already-selected parent faction/subgroup, toggle its collapse state; otherwise ensure it's open
        if (autoFac) {
          if (state.selectedRealm === r && state.selectedFaction === f && !state.selectedSubFaction) {
            if (state.expandedFactions.has(autoFac)) state.expandedFactions.delete(autoFac);
            else state.expandedFactions.add(autoFac);
          } else {
            state.expandedFactions.add(autoFac);
          }
        }
        if (autoSub) {
          if (state.selectedRealm === r && state.selectedFaction === f && state.selectedSubFaction === s) {
            if (state.expandedSubGroups.has(autoSub)) state.expandedSubGroups.delete(autoSub);
            else state.expandedSubGroups.add(autoSub);
          } else {
            state.expandedSubGroups.add(autoSub);
          }
        }

        state.selectedRealm = r;
        state.selectedFaction = f;
        state.selectedSubFaction = s;
        renderFactionTree();
        renderCharacters();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // ==================== FILTER & RENDER CHARACTERS ====================
  function getFilteredCharacters() {
    const q = state.searchQuery.trim().toLowerCase();
    return characters.filter((c) => {
      if (state.selectedRealm && c.realm !== state.selectedRealm) return false;
      if (state.selectedFaction && c.faction !== state.selectedFaction) return false;
      if (state.selectedSubFaction) {
        const exactMatch = c.subFaction === state.selectedSubFaction;
        const prefixMatch = c.subFaction.startsWith(state.selectedSubFaction + " / ");
        if (!exactMatch && !prefixMatch) return false;
      }
      if (state.filterHasImage && !c.image) return false;
      if (state.filterPowerTier && !c.power.includes(state.filterPowerTier)) return false;
      if (state.filterRace && (!c.raceCategories || !c.raceCategories.includes(state.filterRace))) return false;

      if (q) {
        const hay = [
          c.name,
          c.fileName,
          c.realm,
          c.faction,
          c.subFaction,
          c.power,
          c.identities.join(" "),
          Object.values(c.profile).join(" "),
          c.abilities.map((a) => `${a.type} ${a.content}`).join(" "),
          c.story
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function getPortraitUrl(imgPath) {
    if (!imgPath) return "";
    return String(imgPath).replace(/^亞雷利塔角色形象[\/\\]/, "assets/portraits/");
  }

  function renderCharacterShowcaseCard(c, isModal = false) {
    const hasImg = Boolean(c.image);
    const portraitSrc = getPortraitUrl(c.image);
    const epithet = c.profile["稱號"] || "";
    const isStoryExpanded = isModal || state.expandedStories.has(c.id);

    const metaFields = [
      ["種族", c.profile["種族"]],
      ["性別", c.profile["性別"]],
      ["屬性", c.profile["屬性"]],
      ["善惡", c.profile["善惡"]],
      ["年齡", c.profile["年齡"]],
      ["生日", c.profile["生日"]],
      ["身高", c.profile["身高"]],
      ["體重", c.profile["體重"]],
      ["所屬群體", c.profile["群體"], true]
    ].filter(([, val]) => val && String(val).trim() !== "");

    // 將「武器」移至下方與加護、神器等相同的能力區域，traitFields 僅保留外表、個性、喜歡、討厭
    const traitFields = [
      ["外表", c.profile["外表"]],
      ["個性", c.profile["個性"]],
      ["喜歡", c.profile["喜歡"]],
      ["討厭", c.profile["討厭"]]
    ].filter(([, val]) => val && String(val).trim() !== "");

    const displayAbilities = [];
    const weaponVal = (c.profile["武器"] || "").trim();
    if (weaponVal) {
      displayAbilities.push({ type: "武器", content: weaponVal });
    }
    c.abilities.forEach((ab) => displayAbilities.push(ab));

    const serialIdx = characters.indexOf(c) + 1;
    const serialCode = `ARL-${String(serialIdx > 0 ? serialIdx : 1).padStart(3, "0")}`;

    return `
      <article class="char-showcase-card ${hasImg ? "has-portrait" : ""}" id="card-${esc(c.id)}">
        <div class="card-graphic-watermark" aria-hidden="true">${esc(serialCode)}</div>
        <div class="char-main-body">
          <div class="char-header-row">
            <div class="char-title-block">
              <div class="char-dossier-kicker">DOSSIER // ${esc(serialCode)} ・ ${esc(c.realm)} ARCHIVE</div>
              <div class="char-name-line">
                <h4 class="char-name">${formatCharacterDisplayName(c.name)}</h4>
                ${epithet ? `<span class="char-epithet">${formatCharacterDisplayName(epithet)}</span>` : ""}
              </div>
              <div class="char-faction-path">
                <span class="badge-realm">${esc(c.realm)}</span>
                <span>${esc(c.faction)}</span>
                ${c.subFaction ? `<span>› ${esc(c.subFaction)}</span>` : ""}
              </div>
            </div>
            ${c.power ? `<div class="badge-power" title="世界樹強度分級">⚡ 強度：${esc(c.power)}</div>` : ""}
          </div>

          ${
            c.identities.length > 0
              ? `<div class="char-identities">
                  ${c.identities.map((id) => `<span class="identity-pill">${esc(id)}</span>`).join("")}
                </div>`
              : ""
          }

          ${
            metaFields.length > 0
              ? `<div class="char-meta-grid">
                  ${metaFields
                    .map(
                      ([label, val, wide]) => `
                    <div class="meta-cell ${wide ? "wide" : ""}">
                      <span class="meta-label">${esc(label)}</span>
                      ${
                        label === "屬性"
                          ? renderAttributeBadgesHtml(val, false)
                          : `<span class="meta-val">${esc(val)}</span>`
                      }
                    </div>
                  `
                    )
                    .join("")}
                </div>`
              : ""
          }

          ${
            traitFields.length > 0
              ? `<div class="char-traits-box">
                  ${traitFields
                    .map(
                      ([label, val]) => `
                    <div class="trait-item">
                      <strong>${esc(label)}：</strong><span>${esc(val)}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>`
              : ""
          }

          ${
            displayAbilities.length > 0
              ? `<div class="char-abilities-section">
                  ${displayAbilities
                    .map(
                      (ab) => `
                    <div class="ability-card ${getAbilityStyleClass(ab.type)}">
                      <div class="ability-type-header">${ab.type === "武器" ? "⚔️" : "✦"} ${esc(ab.type)}</div>
                      <div class="ability-content">${formatAbilityText(ab.content)}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>`
              : ""
          }

          ${
            c.story
              ? `<div class="char-story-box">
                  <div class="story-toggle-bar">
                    <button class="btn-story-toggle" data-story-char="${esc(c.id)}">
                      ${isStoryExpanded ? "🔼 收合故事背景與相遇過程" : "📖 展開故事背景與相遇過程"}
                    </button>
                    ${
                      !isModal
                        ? `<button class="btn-open-modal" data-modal-char="${esc(c.id)}">🗖 獨立視窗閱覽</button>`
                        : ""
                    }
                  </div>
                  <div class="char-story-content ${isStoryExpanded ? "" : "hidden"}" id="story-box-${esc(c.id)}">
                    ${formatStoryHtml(c.story)}
                  </div>
                </div>`
              : ""
          }
        </div>

        ${
          hasImg
            ? `<aside class="char-portrait-aside">
                <div class="portrait-sticky-box">
                  <div class="portrait-img-frame" data-lightbox-src="${esc(c.image)}" data-lightbox-caption="${esc(c.name)}${epithet ? " — " + esc(epithet) : ""}" title="點擊於新分頁開啟立繪細節檢視器">
                    <img src="${esc(portraitSrc)}" alt="${esc(c.name)} 角色形象圖" loading="lazy" decoding="async" />
                    <span class="portrait-zoom-hint">🔍 新分頁放大檢視細節 ↗</span>
                  </div>
                  <div class="portrait-caption-bar">
                    <strong>${formatCharacterDisplayName(c.name)}</strong>
                    <div>${esc(c.faction)}${c.subFaction ? `・${esc(c.subFaction)}` : ""}</div>
                  </div>
                </div>
              </aside>`
            : ""
        }
      </article>
    `;
  }

  function renderCharacterGridCard(c) {
    const hasImg = Boolean(c.image);
    const portraitSrc = getPortraitUrl(c.image);
    const epithet = c.profile["稱號"] || "";
    const race = c.profile["種族"] || "未知";
    const attr = c.profile["屬性"] || "無";
    const align = c.profile["善惡"] || "未知";

    return `
      <div class="char-grid-card ${hasImg ? "has-portrait" : ""}" data-modal-char="${esc(c.id)}">
        ${
          hasImg
            ? `<div class="grid-card-thumb">
                <img src="${esc(portraitSrc)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />
              </div>`
            : ""
        }
        <div class="grid-card-info">
          <div class="grid-card-title">
            <span>${formatCharacterDisplayName(c.name)}</span>
            ${c.power ? `<span class="badge-power" style="font-size:0.72rem;padding:0.12rem 0.45rem;">${esc(c.power)}</span>` : ""}
          </div>
          ${epithet ? `<div class="grid-card-sub">${formatCharacterDisplayName(epithet)}</div>` : ""}
          <div class="grid-card-meta">
            <span>種族：${esc(race)}</span>
            <span>善惡：${esc(align)}</span>
          </div>
          <div class="grid-card-attrs" style="margin-top:0.25rem;">
            ${renderAttributeBadgesHtml(attr, true)}
          </div>
          <div style="margin-top:auto;padding-top:0.4rem;display:flex;flex-wrap:wrap;gap:0.25rem;">
            ${c.profile["武器"] ? `<span class="identity-pill" style="font-size:0.7rem;padding:0.05rem 0.4rem;">⚔️ 武器</span>` : ""}
            ${c.abilities
              .slice(0, 4)
              .map((a) => `<span class="identity-pill" style="font-size:0.7rem;padding:0.05rem 0.4rem;">${esc(a.type)}</span>`)
              .join("")}
            ${hasImg ? `<span class="identity-pill" style="color:var(--accent-gold);border-color:var(--border-gold);font-size:0.7rem;">🖼️ 立繪</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderCharacters() {
    const filtered = getFilteredCharacters();
    const container = document.getElementById("characterListContainer");
    container.className = `character-list-container view-${state.viewMode}`;

    const crumbEl = document.getElementById("factionBreadcrumb");
    const descEl = document.getElementById("factionDescription");
    const crumbs = ["全部陣營"];
    if (state.selectedRealm) crumbs.push(state.selectedRealm);
    if (state.selectedFaction) crumbs.push(state.selectedFaction);
    if (state.selectedSubFaction) crumbs.push(state.selectedSubFaction);

    crumbEl.innerHTML = crumbs
      .map((t, idx) =>
        idx === crumbs.length - 1
          ? `<span class="crumb-highlight">${esc(t)}</span>`
          : `<span>${esc(t)}</span>`
      )
      .join('<span class="crumb-sep">/</span>');

    const withImgCount = filtered.filter((c) => c.image).length;
    descEl.textContent = `符合條件共 ${filtered.length} 名角色（其中 ${withImgCount} 名附帶角色立繪形象圖・點擊各陣營橫幅亦可折疊區塊）`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:3rem;text-align:center;color:var(--text-secondary);">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🔍</div>
          <div>找不到符合篩選條件的角色檔案，請嘗試清除搜尋字詞或切換左側陣營分類。</div>
        </div>
      `;
      return;
    }

    const groupsMap = new Map();
    filtered.forEach((c) => {
      const groupKey = [c.realm, c.faction, c.subFaction].filter(Boolean).join(" › ");
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          realm: c.realm,
          faction: c.faction,
          subFaction: c.subFaction,
          label: groupKey,
          items: []
        });
      }
      groupsMap.get(groupKey).items.push(c);
    });

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
      const ra = REALM_ORDER.indexOf(a.realm);
      const rb = REALM_ORDER.indexOf(b.realm);
      if (ra !== rb) return ra - rb;
      const fa = sortFactions(a.faction, b.faction);
      if (fa !== 0) return fa;
      return sortSubFactions(a.subFaction, b.subFaction);
    });

    let html = "";
    sortedGroups.forEach((grp) => {
      const isCollapsed = state.collapsedMainGroups.has(grp.label);
      const itemsHtml = grp.items
        .map((c) =>
          state.viewMode === "showcase" ? renderCharacterShowcaseCard(c) : renderCharacterGridCard(c)
        )
        .join("");

      html += `
        <section class="faction-section-group">
          <div class="faction-group-banner" data-toggle-main-group="${esc(grp.label)}" title="點擊收合／展開此陣營區塊">
            <h3>
              <span class="tree-chevron ${isCollapsed ? "" : "open"}">▶</span>
              <span>⚜️ ${esc(grp.label)}</span>
            </h3>
            <span class="group-count-tag">
              <span>${grp.items.length} 名成員</span>
              <span style="font-size:0.72rem;color:var(--text-muted)">(${isCollapsed ? "已折疊" : "點擊可折疊"})</span>
            </span>
          </div>
          <div class="faction-cards-wrap ${isCollapsed ? "collapsed" : ""}">
            ${itemsHtml}
          </div>
        </section>
      `;
    });

    container.innerHTML = html;

    // Bind main group banner collapse
    container.querySelectorAll("[data-toggle-main-group]").forEach((banner) => {
      banner.addEventListener("click", () => {
        const key = banner.getAttribute("data-toggle-main-group");
        if (state.collapsedMainGroups.has(key)) {
          state.collapsedMainGroups.delete(key);
        } else {
          state.collapsedMainGroups.add(key);
        }
        renderCharacters();
      });
    });

    bindCharacterCardInteractions(container);
  }

  function bindCharacterCardInteractions(rootEl) {
    rootEl.querySelectorAll("[data-story-char]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const charId = btn.getAttribute("data-story-char");
        const box = rootEl.querySelector(`#story-box-${CSS.escape(charId)}`);
        if (!box) return;
        if (state.expandedStories.has(charId)) {
          state.expandedStories.delete(charId);
          box.classList.add("hidden");
          btn.textContent = "📖 展開故事背景與相遇過程";
        } else {
          state.expandedStories.add(charId);
          box.classList.remove("hidden");
          btn.textContent = "🔼 收合故事背景與相遇過程";
        }
      });
    });

    rootEl.querySelectorAll("[data-modal-char]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const charId = el.getAttribute("data-modal-char");
        openCharacterModal(charId);
      });
    });

    rootEl.querySelectorAll("[data-lightbox-src]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const src = el.getAttribute("data-lightbox-src");
        const cap = el.getAttribute("data-lightbox-caption") || "";
        openLightbox(src, cap);
      });
    });

    rootEl.querySelectorAll("[data-jump-attr]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const attrToken = btn.getAttribute("data-jump-attr");
        if (!attrToken) return;
        openAttributeDetail(attrToken);
      });
    });
  }

  // ==================== HOME CAROUSEL & PORTAL GUIDE ====================
  function initHomeCarousel() {
    const carouselEl = document.getElementById("homeCarousel");
    if (!carouselEl) return;

    const slides = Array.from(carouselEl.querySelectorAll(".carousel-slide"));
    const dots = Array.from(carouselEl.querySelectorAll(".carousel-dot"));
    const prevBtn = document.getElementById("carouselPrevBtn");
    const nextBtn = document.getElementById("carouselNextBtn");
    if (slides.length === 0) return;

    let currentIdx = 0;
    let autoTimer = null;

    function goToSlide(idx) {
      currentIdx = (idx + slides.length) % slides.length;
      slides.forEach((sl, i) => sl.classList.toggle("active", i === currentIdx));
      dots.forEach((dt, i) => dt.classList.toggle("active", i === currentIdx));
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoTimer = setInterval(() => {
        if (state.activeTab === "home") {
          goToSlide(currentIdx + 1);
        }
      }, 5200);
    }

    function stopAutoPlay() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentIdx - 1);
        startAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentIdx + 1);
        startAutoPlay();
      });
    }
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = Number(dot.getAttribute("data-slide-to") || 0);
        goToSlide(idx);
        startAutoPlay();
      });
    });

    carouselEl.addEventListener("mouseenter", stopAutoPlay);
    carouselEl.addEventListener("mouseleave", startAutoPlay);

    // Bind all [data-goto-tab] buttons/cards on Home Page
    document.querySelectorAll("[data-goto-tab]").forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.getAttribute("data-goto-tab");
        if (target) {
          switchTab(target);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });

    startAutoPlay();
  }

  // ==================== ATTRIBUTE HANDBOOK & ELEMENTAL ENCYCLOPEDIA ====================
  const ATTR_CAT_ICONS = [
    "🔥", "❄️", "🌪️", "⚡", "⛰️", "🌿", "✨", "🪐",
    "🌑", "🕳️", "🩸", "⚔️", "⏳", "🔮", "💥", "☠️", "👑"
  ];

  function getCharactersWithAttribute(attrName) {
    const clean = String(attrName || "").trim();
    if (!clean) return [];
    const aliases = new Set([clean]);
    if (clean === "黑神之炎") aliases.add("黑神之火");
    if (clean === "黑神之火") aliases.add("黑神之炎");
    if (clean.includes("/")) {
      clean.split("/").forEach((p) => {
        if (p.trim()) aliases.add(p.trim());
      });
    }
    return characters.filter((c) => {
      if (!c.attrTokens || c.attrTokens.length === 0) return false;
      return c.attrTokens.some((tok) => {
        if (aliases.has(tok)) return true;
        if (tok.includes("/")) {
          return tok.split("/").some((sub) => aliases.has(sub.trim()));
        }
        return false;
      });
    });
  }

  function renderAttributeNav() {
    const navContainer = document.getElementById("attrCategoryNavContainer");
    if (!navContainer) return;

    const isAllActive = !state.selectedAttrCatId;
    let html = `
      <div style="margin-bottom:0.55rem;">
        <button class="tree-item ${isAllActive ? "active" : ""}" data-select-attr-cat="">
          <span class="tree-item-label">🌟 全部 ${attributeCategories.length} 大屬性分類</span>
          <span class="tree-count">${totalAttributeItemsCount}</span>
        </button>
      </div>
    `;

    attributeCategories.forEach((cat, idx) => {
      const icon = ATTR_CAT_ICONS[idx] || "✦";
      const isActive = state.selectedAttrCatId === cat.id;
      const shortTitle = cat.title.replace(/（共\s*\d+\s*種）.*$/, "").trim();
      html += `
        <div class="tree-row" style="margin-bottom:0.2rem;">
          <button class="tree-item ${isActive ? "active" : ""}" data-select-attr-cat="${esc(cat.id)}" title="${esc(cat.title)}">
            <span class="tree-item-label">${icon} ${esc(shortTitle)}</span>
            <span class="tree-count">${cat.items.length}</span>
          </button>
        </div>
      `;
    });

    navContainer.innerHTML = html;

    navContainer.querySelectorAll("[data-select-attr-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedAttrCatId = btn.getAttribute("data-select-attr-cat") || "";
        renderAttributeNav();
        renderAttributeCatalog();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderAttributeSpotlight() {
    const spotEl = document.getElementById("attrSpotlightContainer");
    if (!spotEl) return;

    if (!state.selectedAttrName) {
      spotEl.classList.add("hidden");
      spotEl.innerHTML = "";
      return;
    }

    const rec = findAttributeRecord(state.selectedAttrName);
    const displayName = rec ? rec.name : state.selectedAttrName;
    const vSpot = getAttributeVisual(displayName);
    const badgeStyle = getAttributeBadgeStyle(displayName);
    const holders = getCharactersWithAttribute(displayName);

    const description =
      rec && rec.description
        ? rec.description
        : "此屬性為角色特定衍生或複合形態，詳見下方持有角色之個人設定與能力說明。";
    const catTitle = rec && rec.categoryTitle ? rec.categoryTitle : "特殊／複合屬性紀錄";

    spotEl.classList.remove("hidden");
    spotEl.innerHTML = `
      <div class="attr-spotlight-card">
        <div class="attr-spot-header">
          <div class="attr-spot-title-wrap">
            <span class="attr-color-badge lg ${vSpot.isSupreme ? "is-supreme" : ""}" style="${badgeStyle}">${renderAttributeBadgeInner(displayName)}</span>
            <div>
              <div class="attr-spot-kicker">SELECTED ATTRIBUTE // ${esc(catTitle)}</div>
              <h3 class="attr-spot-name">【${esc(displayName)}】屬性詳細設定</h3>
            </div>
          </div>
          <button type="button" class="attr-spot-close-btn" id="closeAttrSpotBtn" title="關閉詳細檢視">✕ 關閉</button>
        </div>

        <div class="attr-spot-grid">
          <div class="attr-spot-box wide">
            <span class="meta-label">個別介紹（設定手冊內容）</span>
            <div class="attr-spot-desc">${esc(description)}</div>
          </div>
        </div>

        <div class="attr-spot-holders">
          <div class="attr-holders-title">⚔️ 具備「${esc(displayName)}」屬性的角色（共 ${holders.length} 名，點擊可開啟角色檔案）：</div>
          ${
            holders.length > 0
              ? `<div class="attr-holders-list">
                  ${holders
                    .map(
                      (ch) => `
                    <button type="button" class="attr-holder-chip" data-modal-char="${esc(ch.id)}">
                      <span class="holder-name">${formatCharacterDisplayName(ch.name)}</span>
                      <span class="holder-fac">${esc(ch.faction)}</span>
                    </button>
                  `
                    )
                    .join("")}
                </div>`
              : `<div style="font-size:0.84rem;color:var(--text-muted);">目前尚無登錄直接標記此單一屬性名稱的角色檔案。</div>`
          }
        </div>
      </div>
    `;

    const closeBtn = document.getElementById("closeAttrSpotBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        state.selectedAttrName = "";
        renderAttributeSpotlight();
        renderAttributeCatalog();
      });
    }

    spotEl.querySelectorAll("[data-modal-char]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openCharacterModal(btn.getAttribute("data-modal-char"));
      });
    });
  }

  function renderAttributeCatalog() {
    const container = document.getElementById("attrCatalogContainer");
    if (!container) return;

    const crumbEl = document.getElementById("attrBreadcrumb");
    const descEl = document.getElementById("attrDescription");
    const q = state.attrSearchQuery.trim().toLowerCase();

    const filteredCats = attributeCategories
      .filter((cat) => !state.selectedAttrCatId || cat.id === state.selectedAttrCatId)
      .map((cat) => {
        const items = cat.items.filter((item) => {
          if (!q) return true;
          const hay = `${item.name} ${item.formType} ${item.description} ${cat.title}`.toLowerCase();
          return hay.includes(q);
        });
        return { ...cat, filteredItems: items };
      })
      .filter((cat) => cat.filteredItems.length > 0);

    if (crumbEl) {
      if (state.selectedAttrCatId) {
        const activeCat = attributeCategories.find((c) => c.id === state.selectedAttrCatId);
        crumbEl.textContent = activeCat ? activeCat.title : "全屬性分類";
        if (descEl && activeCat) descEl.textContent = activeCat.description;
      } else {
        crumbEl.textContent = `全部 ${attributeCategories.length} 大屬性分類（共 ${totalAttributeItemsCount} 種）`;
        if (descEl) {
          descEl.textContent =
            "點擊下方任意屬性卡片，即可檢視該屬性的作者設定介紹與持有角色名單";
        }
      }
    }

    if (filteredCats.length === 0) {
      container.innerHTML = `
        <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:2.5rem;text-align:center;color:var(--text-secondary);">
          找不到符合「${esc(state.attrSearchQuery)}」的屬性項目。
        </div>
      `;
      return;
    }

    const activeRec = findAttributeRecord(state.selectedAttrName);
    const activeCanonicalName = activeRec ? activeRec.name : state.selectedAttrName;

    let html = "";
    filteredCats.forEach((cat) => {
      const icon = ATTR_CAT_ICONS[(cat.index || 1) - 1] || "✦";
      const cardsHtml = cat.filteredItems
        .map((item) => {
          const vCard = getAttributeVisual(item.name);
          const style = getAttributeBadgeStyle(item.name);
          const holdersCount = getCharactersWithAttribute(item.name).length;
          const isSelected = activeCanonicalName === item.name;
          const descText = item.description || "設定手冊收錄條目";
          return `
            <article class="attr-item-card ${isSelected ? "selected" : ""}" data-select-attr-item="${esc(item.name)}" id="attr-card-${esc(item.name)}" title="${esc(item.name + (item.description ? '：' + item.description : ''))}">
              <div class="attr-card-main">
                <span class="attr-color-badge ${vCard.isSupreme ? "is-supreme" : ""}" style="${style}">${renderAttributeBadgeInner(item.name)}</span>
                <span class="attr-card-desc">${esc(descText)}</span>
              </div>
              <div class="attr-card-meta">
                ${holdersCount > 0 ? `<span class="attr-holder-count" title="${holdersCount} 名角色持有">⚡ ${holdersCount}</span>` : ""}
                <span class="attr-view-arrow">➔</span>
              </div>
            </article>
          `;
        })
        .join("");

      html += `
        <section class="faction-section-group attr-category-section">
          <div class="faction-group-banner" style="cursor:default;">
            <div>
              <h3><span>${icon} ${esc(cat.title)}</span></h3>
              ${cat.description ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.2rem;">${esc(cat.description)}</div>` : ""}
            </div>
            <span class="group-count-tag">${cat.filteredItems.length} 種屬性</span>
          </div>
          <div class="attr-cards-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll("[data-select-attr-item]").forEach((card) => {
      card.addEventListener("click", () => {
        const attrName = card.getAttribute("data-select-attr-item");
        if (!attrName) return;
        state.selectedAttrName = attrName;
        renderAttributeSpotlight();
        renderAttributeCatalog();
        const spotEl = document.getElementById("attrSpotlightContainer");
        if (spotEl) {
          spotEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
  }

  function openAttributeDetail(attrToken) {
    closeCharacterModal();
    const rec = findAttributeRecord(attrToken);
    state.selectedAttrName = rec ? rec.name : attrToken;
    state.selectedAttrCatId = rec ? rec.categoryId : "";
    state.attrSearchQuery = "";
    const attrSearchInput = document.getElementById("attrSearchInput");
    if (attrSearchInput) attrSearchInput.value = "";

    switchTab("attributes");
    renderAttributeNav();
    renderAttributeSpotlight();
    renderAttributeCatalog();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==================== WORLD LORE & SETTINGS RENDERER ====================
  const ORG_META = {
    "魔風聯邦": {
      icon: "🦅",
      en: "MAFENG FEDERATION",
      desc: "亞雷利塔現界強權之一，涵蓋魔風聯邦核心制度、魔風軍團編制與建國歷史脈絡。",
      factionLink: { realm: "現界", faction: "魔風聯邦" }
    },
    "哈維德恩龍族帝國": {
      icon: "🐉",
      en: "HAVIDN DRAGON EMPIRE",
      desc: "由龍族統御的古老強盛帝國，記載帝國歷史演進、龍皇傳承與完整軍隊編制體系。",
      factionLink: null
    },
    "極真圃": {
      icon: "🏵️",
      en: "JIZHEN GARDEN",
      desc: "歷史悠久的神秘組織，收錄自遠古紀元以來的重大事件與時間線紀錄。",
      factionLink: { realm: "現界", faction: "極真圃" }
    }
  };

  function getOrgOrganizations() {
    const orgDocs = loreDocs.filter((d) => d.category === "組織與國家設定" && d.orgName);
    const orgNames = Array.from(new Set(orgDocs.map((d) => d.orgName)));
    return orgNames.map((name) => {
      const docs = orgDocs.filter((d) => d.orgName === name);
      const meta = ORG_META[name] || {
        icon: docs[0]?.icon || "🏛️",
        en: "ORGANIZATION ARCHIVE",
        desc: `收錄「${name}」相關之國家與組織設定文獻。`,
        factionLink: null
      };
      return {
        name,
        icon: meta.icon,
        en: meta.en,
        desc: meta.desc,
        factionLink: meta.factionLink,
        docs
      };
    });
  }

  function renderLoreNav() {
    const navContainer = document.getElementById("loreNavContainer");
    const categories = Array.from(new Set(loreDocs.map((d) => d.category)));
    const orgList = getOrgOrganizations();

    let html = "";
    categories.forEach((cat) => {
      const docs = loreDocs.filter((d) => d.category === cat);
      const isCatOpen = state.expandedLoreCats.has(cat);

      if (cat === "組織與國家設定") {
        const isOverviewActive = state.selectedLoreMode === "org-overview";
        html += `
          <div class="tree-realm-group">
            <button class="tree-realm-header-btn ${isCatOpen ? "expanded" : ""}" data-toggle-lore-cat="${esc(cat)}">
              <span class="tree-realm-left">
                <span class="tree-chevron ${isCatOpen ? "open" : ""}">▶</span>
                <span>🏛️ ${esc(cat)}（依組織分類）</span>
              </span>
              <span class="tree-count">${orgList.length} 組織</span>
            </button>
            <div class="tree-children-box ${isCatOpen ? "" : "collapsed"}">
              <button class="tree-item ${isOverviewActive ? "active" : ""}" data-lore-org-overview="true">
                <span class="tree-item-label">🌐 全部國家與組織總覽</span>
                <span class="tree-count">${orgList.length}</span>
              </button>
              ${orgList
                .map((org) => {
                  const activeDoc = loreDocs.find((d) => d.id === state.selectedLoreId);
                  const isOrgSelected =
                    (state.selectedLoreMode === "org" && state.selectedLoreOrg === org.name) ||
                    (state.selectedLoreMode === "doc" && activeDoc && activeDoc.orgName === org.name);
                  return `
                    <button class="tree-item ${isOrgSelected ? "active" : ""}" data-lore-org="${esc(org.name)}">
                      <span class="tree-item-label">${esc(org.icon)} ${esc(org.name)}</span>
                      <span class="tree-count">${org.docs.length} 篇</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="tree-realm-group">
            <button class="tree-realm-header-btn ${isCatOpen ? "expanded" : ""}" data-toggle-lore-cat="${esc(cat)}">
              <span class="tree-realm-left">
                <span class="tree-chevron ${isCatOpen ? "open" : ""}">▶</span>
                <span>${esc(cat)}</span>
              </span>
              <span class="tree-count">${docs.length}</span>
            </button>
            <div class="tree-children-box ${isCatOpen ? "" : "collapsed"}">
              ${docs
                .map(
                  (doc) => `
                <button class="tree-item ${state.selectedLoreMode === "doc" && state.selectedLoreId === doc.id ? "active" : ""}" data-lore-id="${esc(doc.id)}">
                  <span class="tree-item-label">${esc(doc.icon)} ${esc(doc.title)}</span>
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }
    });

    navContainer.innerHTML = html;

    navContainer.querySelectorAll("[data-toggle-lore-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-toggle-lore-cat");
        if (state.expandedLoreCats.has(cat)) state.expandedLoreCats.delete(cat);
        else state.expandedLoreCats.add(cat);
        renderLoreNav();
      });
    });

    navContainer.querySelectorAll("[data-lore-org-overview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedLoreMode = "org-overview";
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    navContainer.querySelectorAll("[data-lore-org]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orgName = btn.getAttribute("data-lore-org");
        state.selectedLoreMode = "org";
        state.selectedLoreOrg = orgName;
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    navContainer.querySelectorAll("[data-lore-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedLoreMode = "doc";
        state.selectedLoreId = btn.getAttribute("data-lore-id");
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function findCharacterByFuzzyName(rawLine) {
    const parts = rawLine.split("-");
    const namePart = (parts.length > 1 ? parts.slice(1).join("-") : rawLine).trim();
    const firstWord = namePart.split(/\s+/)[0];
    if (!firstWord || firstWord.length < 2) return null;

    return (
      characters.find((c) => c.name.replace(/\s+/g, "") === namePart.replace(/\s+/g, "")) ||
      characters.find((c) => c.name.startsWith(firstWord))
    );
  }

  function renderWorldOrganizationsCustom(doc) {
    const rawText = doc.blocks.map((b) => b.text || "").join("\n");
    const matches = Array.from(
      rawText.matchAll(/「([^」]+)」\s*立場：([^\n]+)\n規模：([^\n]+)\n人數：([^\n]+)\n(?:主領導人|領導者)：([^\n]+)\n簡介：\s*([\s\S]*?)(?=「[^」]+」\s*立場：|$)/g)
    );

    if (matches.length === 0) return null;

    return `
      <div class="org-cards-grid">
        ${matches
          .map((m) => {
            const [, name, stance, scale, pop, leader, desc] = m;
            return `
              <div class="org-card">
                <h3>「${esc(name.trim())}」</h3>
                <div class="org-meta-pills">
                  <span class="org-pill">立場：${esc(stance.trim())}</span>
                  <span class="org-pill">規模：${esc(scale.trim())}</span>
                  <span class="org-pill">人數：${esc(pop.trim())}</span>
                  <span class="org-pill" style="color:var(--accent-gold)">領導者：${esc(leader.trim())}</span>
                </div>
                <p class="lore-p" style="margin:0;font-size:0.9rem;">${esc(desc.trim())}</p>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderStrongestCustom(doc) {
    const rawText = doc.blocks.map((b) => b.text || "").join("\n");
    const sections = rawText.split(/======［([^］]+)］======/);
    if (sections.length < 3) return null;

    let html = "";
    for (let i = 1; i < sections.length; i += 2) {
      const tierName = sections[i];
      const lines = sections[i + 1]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      html += `
        <div class="tier-board">
          <div class="tier-board-header">👑 ［${esc(tierName)}］強者名錄</div>
          <div class="tier-list-grid">
            ${lines
              .map((line) => {
                const matchedChar = findCharacterByFuzzyName(line);
                if (matchedChar) {
                  return `
                    <div class="tier-entry clickable" data-modal-char="${esc(matchedChar.id)}" title="點擊查看 ${esc(matchedChar.name)} 人設檔案">
                      <span>${esc(line)}</span>
                      <span style="font-size:0.75rem;color:var(--accent-gold)">檔案 ↗</span>
                    </div>
                  `;
                }
                return `<div class="tier-entry"><span>${esc(line)}</span></div>`;
              })
              .join("")}
          </div>
        </div>
      `;
    }
    return html;
  }

  function getDocPreviewSummary(doc) {
    const firstParas = doc.blocks
      .filter((b) => b.type === "p" && b.text && b.text.trim() !== doc.title)
      .slice(0, 2)
      .map((b) => b.text.trim())
      .join(" ");
    if (!firstParas) return doc.subtitle || "點擊進入檢視完整設定與表格資料。";
    return firstParas.length > 110 ? firstParas.slice(0, 110) + "…" : firstParas;
  }

  function bindLoreHubInteractions(container) {
    container.querySelectorAll("[data-open-org]").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedLoreMode = "org";
        state.selectedLoreOrg = el.getAttribute("data-open-org");
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    container.querySelectorAll("[data-open-org-overview]").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedLoreMode = "org-overview";
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    container.querySelectorAll("[data-open-lore-doc]").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedLoreMode = "doc";
        state.selectedLoreId = el.getAttribute("data-open-lore-doc");
        renderLoreNav();
        renderLoreDocument();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    container.querySelectorAll("[data-jump-faction]").forEach((el) => {
      el.addEventListener("click", () => {
        const realm = el.getAttribute("data-jump-realm") || "";
        const faction = el.getAttribute("data-jump-faction") || "";
        state.selectedRealm = realm;
        state.selectedFaction = faction;
        state.selectedSubFaction = "";
        if (realm) state.expandedRealms.add(realm);
        switchTab("characters");
        renderFactionTree();
        renderCharacters();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderLoreDocument() {
    const container = document.getElementById("loreContentContainer");
    const orgList = getOrgOrganizations();

    // Mode 1: All Organizations Overview
    if (state.selectedLoreMode === "org-overview") {
      container.innerHTML = `
        <div class="lore-doc-header">
          <div class="lore-doc-cat">ORGANIZATIONS &amp; NATIONS ARCHIVE</div>
          <h2 class="lore-doc-title">🏛️ 組織與國家設定總覽</h2>
          <div class="lore-doc-subtitle">每個國家與組織皆獨立分類，請點擊下方組織卡片進入該組織專區，再選擇欲閱讀的文獻檔案。</div>
        </div>
        <div class="org-hub-grid">
          ${orgList
            .map(
              (org) => `
            <div class="org-hub-card" data-open-org="${esc(org.name)}">
              <div class="org-hub-card-top">
                <span class="org-hub-icon">${esc(org.icon)}</span>
                <span class="org-hub-badge">共 ${org.docs.length} 篇設定文獻</span>
              </div>
              <div style="font-family:var(--font-tech);font-size:0.7rem;letter-spacing:0.14em;color:var(--text-muted);">${esc(org.en)}</div>
              <div class="org-hub-title">${esc(org.name)}</div>
              <div class="org-hub-desc">${esc(org.desc)}</div>
              <div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.35rem;">
                ${org.docs
                  .map(
                    (d) =>
                      `<span class="identity-pill" style="font-size:0.75rem;">${esc(d.icon)} ${esc(d.title)}</span>`
                  )
                  .join("")}
              </div>
              <div class="org-hub-Enter">點擊進入「${esc(org.name)}」選擇閱讀文獻 ➔</div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      bindLoreHubInteractions(container);
      return;
    }

    // Mode 2: Specific Organization Hub ("每個組織都單獨一個分類 然後點進去再看要閱讀哪個")
    if (state.selectedLoreMode === "org") {
      const org = orgList.find((o) => o.name === state.selectedLoreOrg) || orgList[0];
      if (!org) return;

      container.innerHTML = `
        <div class="org-switcher-bar">
          <button class="btn-back-org" data-open-org-overview="true">← 返回全部國家與組織總覽</button>
          <div class="org-doc-pills">
            ${orgList
              .map(
                (o) => `
              <button class="org-doc-pill-btn ${o.name === org.name ? "active" : ""}" data-open-org="${esc(o.name)}">
                ${esc(o.icon)} ${esc(o.name)} (${o.docs.length})
              </button>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="lore-doc-header">
          <div class="lore-doc-cat">${esc(org.en)} ・ 組織與國家設定專區</div>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
            <h2 class="lore-doc-title">${esc(org.icon)} ${esc(org.name)}</h2>
            ${
              org.factionLink
                ? `<button class="btn-story-toggle" data-jump-realm="${esc(org.factionLink.realm)}" data-jump-faction="${esc(org.factionLink.faction)}">
                    ⚔️ 前往查看「${esc(org.name)}」陣營角色圖鑑 ↗
                  </button>`
                : ""
            }
          </div>
          <div class="lore-doc-subtitle">${esc(org.desc)}</div>
        </div>

        <div style="margin-bottom:0.9rem;font-weight:700;color:var(--accent-gold);font-size:0.95rem;display:flex;align-items:center;gap:0.5rem;">
          <span>📂 請選擇要閱讀的「${esc(org.name)}」文獻（共 ${org.docs.length} 篇）：</span>
        </div>

        <div class="org-hub-grid">
          ${org.docs
            .map((d, idx) => {
              const tableCount = d.blocks.filter((b) => b.type === "table").length;
              const paraCount = d.blocks.filter((b) => b.type === "p").length;
              return `
                <div class="org-doc-selector-card" data-open-lore-doc="${esc(d.id)}">
                  <div class="org-hub-card-top">
                    <span class="org-hub-icon">${esc(d.icon)}</span>
                    <span class="org-hub-badge">ARCHIVE #0${idx + 1}</span>
                  </div>
                  <div class="org-doc-selector-title">${esc(d.title)}</div>
                  <div class="org-doc-selector-sub">${esc(d.subtitle)}</div>
                  <p style="color:var(--text-secondary);font-size:0.86rem;line-height:1.65;margin:0.25rem 0 0.5rem;">
                    ${esc(getDocPreviewSummary(d))}
                  </p>
                  <div style="margin-top:auto;padding-top:0.65rem;border-top:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);">
                    <span>📄 ${paraCount} 段落${tableCount > 0 ? ` ・ 📊 ${tableCount} 表格` : ""}</span>
                    <span style="color:var(--accent-gold);font-weight:700;">開始閱讀 ➔</span>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      bindLoreHubInteractions(container);
      return;
    }

    // Mode 3: Reading a Specific Document
    const doc = loreDocs.find((d) => d.id === state.selectedLoreId) || loreDocs[0];
    if (!doc) return;

    const tocItems = [];
    let secIdx = 0;
    let bodyHtml = "";

    if (doc.title.includes("世界級組織")) {
      const customOrgs = renderWorldOrganizationsCustom(doc);
      if (customOrgs) bodyHtml = customOrgs;
    } else if (doc.title.includes("亞雷利塔最強者")) {
      const customTier = renderStrongestCustom(doc);
      if (customTier) bodyHtml = customTier;
    }

    if (!bodyHtml) {
      doc.blocks.forEach((block) => {
        if (block.type === "image") {
          bodyHtml += `
            <div class="lore-Diagram-box">
              <img src="${esc(block.src)}" alt="${esc(block.alt)}" data-lightbox-src="${esc(block.src)}" data-lightbox-caption="${esc(block.alt)}" />
              <div style="color:#333;font-size:0.84rem;margin-top:0.5rem;font-weight:600;">▲ ${esc(block.alt)}（點擊放大檢視）</div>
            </div>
          `;
        } else if (block.type === "table") {
          const rows = toArray(block.rows);
          if (rows.length > 0) {
            bodyHtml += `<div class="lore-table-wrap"><table class="lore-table">`;
            rows.forEach((r, rIdx) => {
              const cells = toArray(r);
              const tag = rIdx === 0 ? "th" : "td";
              bodyHtml += `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join("")}</tr>`;
            });
            bodyHtml += `</table></div>`;
          }
        } else if (block.type === "p") {
          const txt = block.text.trim();
          if (txt === doc.title || txt === "亞雷利塔-基本設定") return;

          if (/^[一二三四五六七八九十]+、/.test(txt) || /^#\d{4}/.test(txt)) {
            secIdx++;
            const anchorId = `lore-sec-${secIdx}`;
            tocItems.push({ id: anchorId, text: txt });
            bodyHtml += `<h3 class="lore-h2" id="${anchorId}">${esc(txt)}</h3>`;
          } else if (/^\d+\.\s+/.test(txt) && txt.length < 40) {
            bodyHtml += `<h4 class="lore-h3">${esc(txt)}</h4>`;
          } else {
            const cleanTxt = txt.replace(/—{4,}/g, "");
            if (cleanTxt.trim()) {
              bodyHtml += `<p class="lore-p">${esc(cleanTxt.trim())}</p>`;
            }
          }
        }
      });
    }

    const tocHtml =
      tocItems.length > 1
        ? `<div class="lore-toc-bar">
            <span class="lore-toc-label">📑 章節快速跳轉：</span>
            ${tocItems
              .map((item) => `<a class="lore-toc-chip" href="#${item.id}">${esc(item.text)}</a>`)
              .join("")}
          </div>`
        : "";

    // If this document belongs to an organization, render the organization navigation bar at the top
    let orgSwitcherHtml = "";
    if (doc.orgName) {
      const parentOrg = orgList.find((o) => o.name === doc.orgName);
      const siblingDocs = parentOrg ? parentOrg.docs : [];
      orgSwitcherHtml = `
        <div class="org-switcher-bar">
          <button class="btn-back-org" data-open-org="${esc(doc.orgName)}">
            ← 返回「${esc(doc.orgName)}」文獻選擇列表
          </button>
          <div class="org-doc-pills">
            ${siblingDocs
              .map(
                (sd) => `
              <button class="org-doc-pill-btn ${sd.id === doc.id ? "active" : ""}" data-open-lore-doc="${esc(sd.id)}">
                ${esc(sd.icon)} ${esc(sd.title)}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      ${orgSwitcherHtml}
      <div class="lore-doc-header">
        <div class="lore-doc-cat">${esc(doc.category)}${doc.orgName ? ` ／ ${esc(doc.orgName)}` : ""}</div>
        <h2 class="lore-doc-title">${esc(doc.icon)} ${esc(doc.title)}</h2>
        <div class="lore-doc-subtitle">${esc(doc.subtitle)}</div>
      </div>
      ${tocHtml}
      <div class="lore-doc-body">
        ${bodyHtml}
      </div>
    `;

    bindLoreHubInteractions(container);
    bindCharacterCardInteractions(container);
  }

  // ==================== STORY ARCHIVE RENDERER ====================
  function renderStoryNav() {
    const navContainer = document.getElementById("storyNavContainer");
    const seriesList = Array.from(new Set(stories.map((s) => s.series || "其他篇章")));

    let html = `
      <div class="tree-quick-actions">
        <button class="tree-action-btn" id="btnExpandAllStoryTree" title="展開所有劇情系列">➕ 全部展開</button>
        <button class="tree-action-btn" id="btnCollapseAllStoryTree" title="收合所有劇情系列">➖ 全部折疊</button>
      </div>
    `;

    seriesList.forEach((seriesName) => {
      const seriesStories = stories.filter((s) => (s.series || "其他篇章") === seriesName);
      const isOpen = state.expandedStorySeries.has(seriesName);

      html += `
        <div class="tree-realm-group">
          <button class="tree-realm-header-btn ${isOpen ? "expanded" : ""}" data-toggle-story-series="${esc(seriesName)}">
            <span class="tree-realm-left">
              <span class="tree-chevron ${isOpen ? "open" : ""}">▶</span>
              <span>📚 ${esc(seriesName)}</span>
            </span>
            <span class="tree-count">${seriesStories.length}</span>
          </button>
          <div class="tree-children-box ${isOpen ? "" : "collapsed"}">
            ${seriesStories
              .map(
                (st, idx) => `
              <button class="tree-item ${state.selectedStoryId === st.id ? "active" : ""}" data-story-id="${esc(st.id)}">
                <span class="tree-item-label">📖 ${esc(st.title)}</span>
                <span class="tree-count">${seriesStories.length > 1 ? `#${idx}` : "單篇"}</span>
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    navContainer.innerHTML = html;

    const btnExp = document.getElementById("btnExpandAllStoryTree");
    const btnCol = document.getElementById("btnCollapseAllStoryTree");
    if (btnExp) {
      btnExp.addEventListener("click", () => {
        seriesList.forEach((s) => state.expandedStorySeries.add(s));
        renderStoryNav();
      });
    }
    if (btnCol) {
      btnCol.addEventListener("click", () => {
        state.expandedStorySeries.clear();
        renderStoryNav();
      });
    }

    navContainer.querySelectorAll("[data-toggle-story-series]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = btn.getAttribute("data-toggle-story-series");
        if (state.expandedStorySeries.has(s)) state.expandedStorySeries.delete(s);
        else state.expandedStorySeries.add(s);
        renderStoryNav();
      });
    });

    navContainer.querySelectorAll("[data-story-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedStoryId = btn.getAttribute("data-story-id");
        renderStoryNav();
        renderStoryContent();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderStoryContent() {
    const idx = stories.findIndex((s) => s.id === state.selectedStoryId);
    const story = idx !== -1 ? stories[idx] : stories[0];
    if (!story) return;

    document.getElementById("storyCurrentMeta").textContent = `${story.series}｜${story.title}`;
    const container = document.getElementById("storyContentContainer");

    // Check if there is user-saved text in localStorage for .gdoc stories
    const savedCustomText = localStorage.getItem(`arelita_story_text_${story.id}`) || "";
    const activeParagraphs =
      story.paragraphs && story.paragraphs.length > 0
        ? story.paragraphs
        : savedCustomText
        ? savedCustomText.split(/\r?\n/).filter((l) => l.trim() !== "")
        : [];

    let bodyHtml = "";
    if (activeParagraphs.length > 0) {
      bodyHtml = activeParagraphs
        .map((p) => {
          const t = p.trim();
          if (t === "---" || /^—{3,}$/.test(t)) {
            return `<hr class="story-divider" style="margin:1.75rem 0;" />`;
          }
          return `<p class="story-para">${esc(t)}</p>`;
        })
        .join("");

      if (story.isGdoc && savedCustomText) {
        bodyHtml += `
          <div style="margin-top:2rem;padding-top:1rem;border-top:1px dashed var(--border-subtle);display:flex;justify-content:flex-end;">
            <button class="btn-story-toggle" id="btnEditGdocStory">✏️ 重新編輯／更新《${esc(story.title)}》內文</button>
          </div>
        `;
      }
    } else {
      bodyHtml = `
        <div style="background:rgba(226,184,107,0.08);border:1px solid var(--border-gold);border-radius:var(--radius-md);padding:1.5rem;margin-bottom:1.5rem;">
          <div style="font-weight:700;color:var(--accent-gold);font-size:1.05rem;margin-bottom:0.5rem;">
            📌 此篇章原始檔（${esc(story.filePath)}）為 Google Docs 雲端捷徑檔（.gdoc）
          </div>
          <p style="color:var(--text-secondary);font-size:0.92rem;margin-bottom:1rem;">
            由於 Google 雲端硬碟桌面版的 <code>.gdoc</code> 檔僅包含雲端連結且受系統保護，您可以直接將《${esc(story.title)}》的全文貼在下方輸入框並點擊儲存（將自動排版並保存在瀏覽器中），或將該雲端文件下載為 <code>.docx</code> 放入 <code>劇情/${esc(story.series)}/</code> 資料夾後執行 <code>assets/build_data.ps1</code>。
          </p>
          <textarea id="gdocStoryTextarea" rows="14" placeholder="請在此貼上《${esc(story.title)}》的故事內文..." style="width:100%;background:var(--bg-base);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:var(--radius-sm);padding:1rem;font-family:inherit;font-size:0.95rem;line-height:1.7;resize:vertical;"></textarea>
          <div style="margin-top:0.85rem;display:flex;gap:0.75rem;justify-content:flex-end;">
            <button class="btn-story-toggle" id="btnSaveGdocStory" style="border-color:var(--accent-gold);color:var(--accent-gold);font-weight:700;">💾 儲存並排版顯示內文</button>
          </div>
        </div>
      `;
    }

    const prevStory = idx > 0 ? stories[idx - 1] : null;
    const nextStory = idx < stories.length - 1 ? stories[idx + 1] : null;

    container.innerHTML = `
      <div style="font-size:0.8rem;color:var(--accent-gold);font-weight:700;margin-bottom:0.25rem;">${esc(story.series)}</div>
      <h2 class="story-chapter-heading">${esc(story.title)}</h2>
      <div class="story-body-text">${bodyHtml}</div>
      <div class="story-nav-footer">
        ${
          prevStory
            ? `<button class="btn-story-toggle" data-goto-story="${esc(prevStory.id)}">← 上一篇：${esc(prevStory.title)}</button>`
            : `<span></span>`
        }
        ${
          nextStory
            ? `<button class="btn-story-toggle" data-goto-story="${esc(nextStory.id)}">下一篇：${esc(nextStory.title)} →</button>`
            : `<span></span>`
        }
      </div>
    `;

    const btnSave = document.getElementById("btnSaveGdocStory");
    if (btnSave) {
      btnSave.addEventListener("click", () => {
        const val = document.getElementById("gdocStoryTextarea").value.trim();
        if (val) {
          localStorage.setItem(`arelita_story_text_${story.id}`, val);
          renderStoryContent();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    const btnEdit = document.getElementById("btnEditGdocStory");
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        const current = localStorage.getItem(`arelita_story_text_${story.id}`) || "";
        localStorage.removeItem(`arelita_story_text_${story.id}`);
        renderStoryContent();
        const ta = document.getElementById("gdocStoryTextarea");
        if (ta) ta.value = current;
      });
    }

    container.querySelectorAll("[data-goto-story]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedStoryId = btn.getAttribute("data-goto-story");
        renderStoryNav();
        renderStoryContent();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // ==================== GALLERY RENDERER ====================
  function renderGalleryNav() {
    const container = document.getElementById("galleryNavContainer");
    if (!container) return;
    const charsWithImg = characters.filter((c) => c.image);
    const isAllActive = !state.galleryRealm && !state.galleryFaction && !state.gallerySubFaction;

    let html = `
      <div class="tree-quick-actions">
        <button class="tree-action-btn" id="btnExpandAllGalleryTree" title="展開所有立繪分類">➕ 全部展開</button>
        <button class="tree-action-btn" id="btnCollapseAllGalleryTree" title="收合所有立繪分類">➖ 全部折疊</button>
      </div>

      <div style="margin-bottom:0.5rem;">
        <button class="tree-item ${isAllActive ? "active" : ""}" data-g-realm="" data-g-faction="" data-g-sub="">
          <span class="tree-item-label">🖼️ 全部角色立繪</span>
          <span class="tree-count">${charsWithImg.length}</span>
        </button>
      </div>
    `;

    REALM_ORDER.forEach((realm) => {
      const realmChars = charsWithImg.filter((c) => c.realm === realm);
      if (realmChars.length === 0) return;

      const isRealmOpen = state.galleryExpandedRealms.has(realm);
      const isRealmActive = state.galleryRealm === realm && !state.galleryFaction;
      const factions = Array.from(new Set(realmChars.map((c) => c.faction))).sort(sortFactions);

      html += `
        <div class="tree-realm-group">
          <button class="tree-realm-header-btn ${isRealmOpen ? "expanded" : ""}" data-g-toggle-realm="${esc(realm)}">
            <span class="tree-realm-left">
              <span class="tree-chevron ${isRealmOpen ? "open" : ""}">▶</span>
              <span>【${esc(realm)}】立繪</span>
            </span>
            <span class="tree-count">${realmChars.length}</span>
          </button>

          <div class="tree-children-box ${isRealmOpen ? "" : "collapsed"}">
            <div class="tree-row">
              <span class="tree-expand-spacer"></span>
              <button class="tree-item ${isRealmActive ? "active" : ""}" data-g-realm="${esc(realm)}" data-g-faction="" data-g-sub="">
                <span class="tree-item-label">📂 ${esc(realm)}全部 (${realmChars.length})</span>
              </button>
            </div>
      `;

      factions.forEach((faction) => {
        const facKey = `${realm}::${faction}`;
        const facChars = realmChars.filter((c) => c.faction === faction);
        const isFacActive =
          state.galleryRealm === realm &&
          state.galleryFaction === faction &&
          !state.gallerySubFaction;

        const rawSubs = Array.from(
          new Set(facChars.map((c) => c.subFaction).filter(Boolean))
        ).sort(sortSubFactions);

        const hasSubs = rawSubs.length > 0;
        const isFacOpen = state.galleryExpandedFactions.has(facKey);

        html += `
          <div class="tree-row">
            ${
              hasSubs
                ? `<button class="tree-expand-btn" data-g-toggle-faction="${esc(facKey)}" title="${isFacOpen ? "收合子分類" : "展開子分類"}">
                    <span class="tree-chevron ${isFacOpen ? "open" : ""}">▶</span>
                  </button>`
                : `<span class="tree-expand-spacer"></span>`
            }
            <button class="tree-item ${isFacActive ? "active" : ""}" data-g-realm="${esc(realm)}" data-g-faction="${esc(faction)}" data-g-sub="" data-g-auto-fac="${hasSubs ? esc(facKey) : ""}">
              <span class="tree-item-label">🛡️ ${esc(faction)}</span>
              <span class="tree-count">${facChars.length}</span>
            </button>
          </div>
        `;

        if (hasSubs) {
          const topSubOrder = [];
          const topSubMap = new Map();

          rawSubs.forEach((sub) => {
            if (sub.includes(" / ")) {
              const [parentSub, childSub] = sub.split(" / ");
              if (!topSubMap.has(parentSub)) {
                topSubMap.set(parentSub, { children: [] });
                topSubOrder.push(parentSub);
              }
              topSubMap.get(parentSub).children.push({ full: sub, label: childSub });
            } else {
              if (!topSubMap.has(sub)) {
                topSubMap.set(sub, { children: [] });
                topSubOrder.push(sub);
              }
            }
          });

          topSubOrder.sort(sortSubFactions);

          html += `<div class="tree-sub-children ${isFacOpen ? "" : "collapsed"}">`;

          topSubOrder.forEach((topSub) => {
            const info = topSubMap.get(topSub);
            if (info.children.length > 0) {
              const subGroupKey = `${facKey}::${topSub}`;
              const isSubGroupOpen = state.galleryExpandedSubGroups.has(subGroupKey);
              const groupChars = facChars.filter(
                (c) => c.subFaction === topSub || c.subFaction.startsWith(topSub + " / ")
              );
              const isGroupActive =
                state.galleryRealm === realm &&
                state.galleryFaction === faction &&
                state.gallerySubFaction === topSub;

              html += `
                <div class="tree-row">
                  <button class="tree-expand-btn" data-g-toggle-subgroup="${esc(subGroupKey)}">
                    <span class="tree-chevron ${isSubGroupOpen ? "open" : ""}">▶</span>
                  </button>
                  <button class="tree-item tree-item-sub ${isGroupActive ? "active" : ""}" data-g-realm="${esc(realm)}" data-g-faction="${esc(faction)}" data-g-sub="${esc(topSub)}" data-g-auto-sub="${esc(subGroupKey)}">
                    <span class="tree-item-label">⚔️ ${esc(topSub)}</span>
                    <span class="tree-count">${groupChars.length}</span>
                  </button>
                </div>
                <div class="tree-sub-children ${isSubGroupOpen ? "" : "collapsed"}">
              `;

              info.children.forEach((ch) => {
                const chChars = facChars.filter((c) => c.subFaction === ch.full);
                const isChActive =
                  state.galleryRealm === realm &&
                  state.galleryFaction === faction &&
                  state.gallerySubFaction === ch.full;

                html += `
                  <div class="tree-row">
                    <span class="tree-expand-spacer"></span>
                    <button class="tree-item tree-item-sub ${isChActive ? "active" : ""}" data-g-realm="${esc(realm)}" data-g-faction="${esc(faction)}" data-g-sub="${esc(ch.full)}">
                      <span class="tree-item-label">• ${esc(ch.label)}</span>
                      <span class="tree-count">${chChars.length}</span>
                    </button>
                  </div>
                `;
              });

              html += `</div>`;
            } else {
              const subChars = facChars.filter((c) => c.subFaction === topSub);
              const isSubActive =
                state.galleryRealm === realm &&
                state.galleryFaction === faction &&
                state.gallerySubFaction === topSub;

              html += `
                <div class="tree-row">
                  <span class="tree-expand-spacer"></span>
                  <button class="tree-item tree-item-sub ${isSubActive ? "active" : ""}" data-g-realm="${esc(realm)}" data-g-faction="${esc(faction)}" data-g-sub="${esc(topSub)}">
                    <span class="tree-item-label">• ${esc(topSub)}</span>
                    <span class="tree-count">${subChars.length}</span>
                  </button>
                </div>
              `;
            }
          });

          html += `</div>`;
        }
      });

      html += `</div></div>`;
    });

    container.innerHTML = html;

    // Expand / Collapse all gallery tree
    const btnExp = document.getElementById("btnExpandAllGalleryTree");
    const btnCol = document.getElementById("btnCollapseAllGalleryTree");
    if (btnExp) {
      btnExp.addEventListener("click", () => {
        REALM_ORDER.forEach((r) => state.galleryExpandedRealms.add(r));
        charsWithImg.forEach((c) => {
          if (c.subFaction) {
            const fk = `${c.realm}::${c.faction}`;
            state.galleryExpandedFactions.add(fk);
            if (c.subFaction.includes(" / ")) {
              state.galleryExpandedSubGroups.add(`${fk}::${c.subFaction.split(" / ")[0]}`);
            }
          }
        });
        renderGalleryNav();
      });
    }
    if (btnCol) {
      btnCol.addEventListener("click", () => {
        state.galleryExpandedRealms.clear();
        state.galleryExpandedFactions.clear();
        state.galleryExpandedSubGroups.clear();
        renderGalleryNav();
      });
    }

    container.querySelectorAll("[data-g-toggle-realm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.getAttribute("data-g-toggle-realm");
        if (state.galleryExpandedRealms.has(r)) state.galleryExpandedRealms.delete(r);
        else state.galleryExpandedRealms.add(r);
        renderGalleryNav();
      });
    });

    container.querySelectorAll("[data-g-toggle-faction]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fk = btn.getAttribute("data-g-toggle-faction");
        if (state.galleryExpandedFactions.has(fk)) state.galleryExpandedFactions.delete(fk);
        else state.galleryExpandedFactions.add(fk);
        renderGalleryNav();
      });
    });

    container.querySelectorAll("[data-g-toggle-subgroup]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sgk = btn.getAttribute("data-g-toggle-subgroup");
        if (state.galleryExpandedSubGroups.has(sgk)) state.galleryExpandedSubGroups.delete(sgk);
        else state.galleryExpandedSubGroups.add(sgk);
        renderGalleryNav();
      });
    });

    container.querySelectorAll("[data-g-realm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.getAttribute("data-g-realm") || "";
        const f = btn.getAttribute("data-g-faction") || "";
        const s = btn.getAttribute("data-g-sub") || "";
        const autoFac = btn.getAttribute("data-g-auto-fac") || "";
        const autoSub = btn.getAttribute("data-g-auto-sub") || "";

        if (autoFac) {
          if (state.galleryRealm === r && state.galleryFaction === f && !state.gallerySubFaction) {
            if (state.galleryExpandedFactions.has(autoFac)) state.galleryExpandedFactions.delete(autoFac);
            else state.galleryExpandedFactions.add(autoFac);
          } else {
            state.galleryExpandedFactions.add(autoFac);
          }
        }
        if (autoSub) {
          if (state.galleryRealm === r && state.galleryFaction === f && state.gallerySubFaction === s) {
            if (state.galleryExpandedSubGroups.has(autoSub)) state.galleryExpandedSubGroups.delete(autoSub);
            else state.galleryExpandedSubGroups.add(autoSub);
          } else {
            state.galleryExpandedSubGroups.add(autoSub);
          }
        }

        state.galleryRealm = r;
        state.galleryFaction = f;
        state.gallerySubFaction = s;
        renderGalleryNav();
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderGallery() {
    const container = document.getElementById("galleryGridContainer");
    const charsWithImg = characters.filter((c) => {
      if (!c.image) return false;
      if (state.galleryRealm && c.realm !== state.galleryRealm) return false;
      if (state.galleryFaction && c.faction !== state.galleryFaction) return false;
      if (state.gallerySubFaction) {
        const exact = c.subFaction === state.gallerySubFaction;
        const prefix = c.subFaction.startsWith(state.gallerySubFaction + " / ");
        if (!exact && !prefix) return false;
      }
      return true;
    });

    const crumbEl = document.getElementById("galleryBreadcrumb");
    const descEl = document.getElementById("galleryDescription");
    if (crumbEl) {
      const crumbs = ["全部立繪"];
      if (state.galleryRealm) crumbs.push(state.galleryRealm);
      if (state.galleryFaction) crumbs.push(state.galleryFaction);
      if (state.gallerySubFaction) crumbs.push(state.gallerySubFaction);
      crumbEl.innerHTML = crumbs
        .map((t, idx) =>
          idx === crumbs.length - 1
            ? `<span class="crumb-highlight">${esc(t)}</span>`
            : `<span>${esc(t)}</span>`
        )
        .join('<span class="crumb-sep">/</span>');
    }
    if (descEl) {
      descEl.textContent = `目前顯示 ${charsWithImg.length} 幅角色形象立繪（點擊卡片可檢視角色完整設定，點擊右上角「🔍 原圖」可放大立繪）`;
    }

    // Group by Realm › Faction › SubFaction
    const groupsMap = new Map();
    charsWithImg.forEach((c) => {
      const groupKey = [c.realm, c.faction, c.subFaction].filter(Boolean).join(" › ");
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          realm: c.realm,
          faction: c.faction,
          subFaction: c.subFaction,
          label: groupKey,
          items: []
        });
      }
      groupsMap.get(groupKey).items.push(c);
    });

    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
      const ra = REALM_ORDER.indexOf(a.realm);
      const rb = REALM_ORDER.indexOf(b.realm);
      if (ra !== rb) return ra - rb;
      const fa = sortFactions(a.faction, b.faction);
      if (fa !== 0) return fa;
      return sortSubFactions(a.subFaction, b.subFaction);
    });

    let html = "";
    sortedGroups.forEach((grp) => {
      const isCollapsed = state.collapsedGalleryGroups.has(grp.label);
      const cardsHtml = grp.items
        .map((c) => {
          const epithet = c.profile["稱號"] || "";
          const portraitSrc = getPortraitUrl(c.image);
          return `
            <div class="gallery-card" data-modal-char="${esc(c.id)}">
              <div class="gallery-img-box">
                <button class="gallery-zoom-btn" data-lightbox-src="${esc(c.image)}" data-lightbox-caption="${esc(c.name)}${epithet ? " — " + esc(epithet) : ""}" title="於新分頁開啟高解析度立繪檢視器">🔍 原圖 ↗</button>
                <img src="${esc(portraitSrc)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />
              </div>
              <div class="gallery-card-meta">
                <div class="gallery-char-header">
                  <span class="gallery-char-name">${formatCharacterDisplayName(c.name)}</span>
                  ${c.power ? `<span class="badge-power" style="font-size:0.68rem;padding:0.08rem 0.42rem;">${esc(c.power)}</span>` : ""}
                </div>
                ${epithet ? `<div class="gallery-char-epithet">${esc(epithet)}</div>` : ""}
                <div class="gallery-char-faction">${esc(c.faction)}${c.subFaction ? `・${esc(c.subFaction)}` : ""}</div>
              </div>
            </div>
          `;
        })
        .join("");

      html += `
        <section class="faction-section-group">
          <div class="faction-group-banner" data-toggle-gallery-group="${esc(grp.label)}" title="點擊收合／展開此立繪分類">
            <h3>
              <span class="tree-chevron ${isCollapsed ? "" : "open"}">▶</span>
              <span>🖼️ ${esc(grp.label)}</span>
            </h3>
            <span class="group-count-tag">
              <span>${grp.items.length} 幅立繪</span>
              <span style="font-size:0.72rem;color:var(--text-muted)">(${isCollapsed ? "已折疊" : "點擊可折疊"})</span>
            </span>
          </div>
          <div class="gallery-grid faction-cards-wrap ${isCollapsed ? "collapsed" : ""}">
            ${cardsHtml}
          </div>
        </section>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll("[data-toggle-gallery-group]").forEach((banner) => {
      banner.addEventListener("click", () => {
        const key = banner.getAttribute("data-toggle-gallery-group");
        if (state.collapsedGalleryGroups.has(key)) state.collapsedGalleryGroups.delete(key);
        else state.collapsedGalleryGroups.add(key);
        renderGallery();
      });
    });

    bindCharacterCardInteractions(container);
  }

  // ==================== MODALS & NEW-TAB PORTRAIT VIEWER ====================
  function updateBodyModalState() {
    const charModalOpen = !document.getElementById("characterModal").classList.contains("hidden");
    const lbOpen = !document.getElementById("imageLightbox").classList.contains("hidden");
    document.body.classList.toggle("modal-open", charModalOpen || lbOpen);
  }

  function openCharacterModal(charId) {
    const c = characters.find((item) => item.id === charId);
    if (!c) return;
    const modal = document.getElementById("characterModal");
    const body = document.getElementById("modalBodyContent");
    body.innerHTML = renderCharacterShowcaseCard(c, true);
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    updateBodyModalState();
    bindCharacterCardInteractions(body);
  }

  function closeCharacterModal() {
    const modal = document.getElementById("characterModal");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("modalBodyContent").innerHTML = "";
    updateBodyModalState();
  }

  function openLightbox(src, caption) {
    if (!src) return;
    const viewerUrl = `portrait.html?src=${encodeURIComponent(src)}&caption=${encodeURIComponent(caption || "")}`;
    window.open(viewerUrl, "_blank");
  }

  function closeLightbox() {
    const lb = document.getElementById("imageLightbox");
    if (!lb) return;
    lb.classList.add("hidden");
    lb.setAttribute("aria-hidden", "true");
    document.getElementById("lightboxImg").src = "";
    updateBodyModalState();
  }

  // ==================== BGM SYNTHESIZER & CUSTOM AUDIO ENGINE ====================
  const bgmSystem = {
    isPlaying: false,
    track: localStorage.getItem("arelita_bgm_track") || "harp", // 'harp' | 'astral' | 'custom'
    volume: Number(localStorage.getItem("arelita_bgm_vol") || 45) / 100,
    ctx: null,
    masterGain: null,
    schedulerTimer: null,
    stepIdx: 0,
    customObjectUrl: ""
  };

  function ensureAudioContext() {
    if (!bgmSystem.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);

      // Stereo Ping-Pong Delay / Warm Hall Echo
      const delayL = ctx.createDelay(2.0);
      const delayR = ctx.createDelay(2.0);
      delayL.delayTime.value = 0.36;
      delayR.delayTime.value = 0.54;

      const fbL = ctx.createGain();
      const fbR = ctx.createGain();
      fbL.gain.value = 0.32;
      fbR.gain.value = 0.32;

      const wetFilter = ctx.createBiquadFilter();
      wetFilter.type = "lowpass";
      wetFilter.frequency.value = 1800;

      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.38;

      delayL.connect(fbL);
      fbL.connect(delayR);
      delayR.connect(fbR);
      fbR.connect(delayL);

      delayL.connect(wetFilter);
      delayR.connect(wetFilter);
      wetFilter.connect(wetGain);

      master.connect(ctx.destination);
      master.connect(delayL);
      wetGain.connect(ctx.destination);

      bgmSystem.ctx = ctx;
      bgmSystem.masterGain = master;
    }
    if (bgmSystem.ctx.state === "suspended") {
      bgmSystem.ctx.resume();
    }
    return bgmSystem.ctx;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playHarpPluck(ctx, outNode, midi, duration, vel = 0.14) {
    const now = ctx.currentTime;
    const freq = midiToFreq(midi);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "triangle";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(280, freq * 0.9), now + duration * 0.85);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(vel, now + 0.025);
    env.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.18;

    osc1.connect(filter);
    osc2.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(env);
    env.connect(outNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  function playWarmPadChord(ctx, outNode, midiNotes, duration, vel = 0.045) {
    const now = ctx.currentTime;
    midiNotes.forEach((midi, i) => {
      const freq = midiToFreq(midi);
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * 4, now);

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(680, now);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(vel, now + duration * 0.3);
      env.gain.exponentialRampToValueAtTime(0.0004, now + duration);

      osc.connect(lp);
      lp.connect(env);
      env.connect(outNode);

      osc.start(now);
      osc.stop(now + duration + 0.08);
    });
  }

  // Track 1: 《世界樹之息》 (A Aeolian Fantasy RPG Harp Progression)
  const HARP_PROGRESSION = [
    { pad: [45, 52, 57, 60], arp: [69, 72, 76, 79, 76, 72, 69, 64] }, // Am7
    { pad: [41, 48, 53, 57], arp: [65, 69, 72, 76, 74, 72, 69, 65] }, // Fmaj7
    { pad: [48, 55, 60, 64], arp: [67, 72, 76, 79, 81, 79, 76, 72] }, // Cmaj7
    { pad: [43, 50, 55, 59], arp: [67, 71, 74, 79, 76, 74, 71, 67] }, // G6
    { pad: [50, 57, 62, 65], arp: [69, 74, 77, 81, 77, 74, 69, 65] }, // Dm7
    { pad: [40, 47, 52, 55], arp: [64, 67, 71, 76, 74, 71, 67, 64] }  // Em7
  ];

  // Track 2: 《星界檔案庫》 (D Dorian Ethereal Crystal Ambient)
  const ASTRAL_PROGRESSION = [
    { pad: [38, 45, 50, 57, 60], arp: [74, null, 81, 79, null, 76, 72, null] }, // Dm9
    { pad: [43, 50, 57, 59, 64], arp: [76, null, 79, 83, null, 79, 74, null] }, // G13
    { pad: [36, 43, 52, 55, 59], arp: [72, null, 76, 79, null, 83, 79, null] }, // Cmaj9
    { pad: [45, 52, 55, 60, 64], arp: [69, null, 76, 79, null, 76, 72, null] }  // Am7
  ];

  function startBgmScheduler() {
    stopBgmScheduler();
    const audioEl = document.getElementById("bgmCustomAudio");

    if (bgmSystem.track === "custom" && audioEl && audioEl.src) {
      audioEl.volume = Math.max(0, Math.min(1, bgmSystem.volume));
      audioEl.play().catch(() => {});
      return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) return;

    const targetGain = Math.max(0.001, bgmSystem.volume * 0.9);
    bgmSystem.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    bgmSystem.masterGain.gain.setValueAtTime(Math.max(0.001, bgmSystem.masterGain.gain.value), ctx.currentTime);
    bgmSystem.masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.5);

    const stepMs = bgmSystem.track === "astral" ? 560 : 410;

    function step() {
      if (!bgmSystem.isPlaying) return;
      const list = bgmSystem.track === "astral" ? ASTRAL_PROGRESSION : HARP_PROGRESSION;
      const barIdx = Math.floor(bgmSystem.stepIdx / 8) % list.length;
      const noteIdx = bgmSystem.stepIdx % 8;
      const bar = list[barIdx];

      if (noteIdx === 0) {
        playWarmPadChord(ctx, bgmSystem.masterGain, bar.pad, (stepMs * 8) / 1000 + 0.6, bgmSystem.track === "astral" ? 0.055 : 0.042);
      }

      const noteMidi = bar.arp[noteIdx];
      if (noteMidi) {
        playHarpPluck(
          ctx,
          bgmSystem.masterGain,
          noteMidi,
          bgmSystem.track === "astral" ? 2.4 : 1.65,
          bgmSystem.track === "astral" ? 0.1 : 0.13
        );
      }

      bgmSystem.stepIdx++;
    }

    step();
    bgmSystem.schedulerTimer = setInterval(step, stepMs);
  }

  function stopBgmScheduler() {
    if (bgmSystem.schedulerTimer) {
      clearInterval(bgmSystem.schedulerTimer);
      bgmSystem.schedulerTimer = null;
    }
    const audioEl = document.getElementById("bgmCustomAudio");
    if (audioEl) {
      audioEl.pause();
    }
    if (bgmSystem.ctx && bgmSystem.masterGain) {
      const now = bgmSystem.ctx.currentTime;
      bgmSystem.masterGain.gain.cancelScheduledValues(now);
      bgmSystem.masterGain.gain.setValueAtTime(bgmSystem.masterGain.gain.value, now);
      bgmSystem.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    }
  }

  function updateBgmUI() {
    const toggleBtn = document.getElementById("bgmToggleBtn");
    const statusText = document.getElementById("bgmStatusText");
    const volSlider = document.getElementById("bgmVolumeSlider");
    const volValue = document.getElementById("bgmVolValue");

    if (toggleBtn && statusText) {
      toggleBtn.classList.toggle("playing", bgmSystem.isPlaying);
      statusText.textContent = bgmSystem.isPlaying ? "BGM ON" : "BGM OFF";
    }
    if (volSlider && volValue) {
      const pct = Math.round(bgmSystem.volume * 100);
      volSlider.value = pct;
      volValue.textContent = `${pct}%`;
    }
    document.querySelectorAll(".bgm-track-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-bgm-track") === bgmSystem.track);
    });
  }

  function setBgmPlaying(playState) {
    bgmSystem.isPlaying = Boolean(playState);
    localStorage.setItem("arelita_bgm_on", bgmSystem.isPlaying ? "1" : "0");
    if (bgmSystem.isPlaying) {
      startBgmScheduler();
    } else {
      stopBgmScheduler();
    }
    updateBgmUI();
  }

  function initBgmControls() {
    const toggleBtn = document.getElementById("bgmToggleBtn");
    const menuBtn = document.getElementById("bgmMenuBtn");
    const popover = document.getElementById("bgmPopover");
    const volSlider = document.getElementById("bgmVolumeSlider");
    const fileInput = document.getElementById("bgmFileInput");
    const customTrackBtn = document.getElementById("bgmCustomTrackBtn");
    const audioEl = document.getElementById("bgmCustomAudio");

    if (bgmSystem.track === "custom" && (!audioEl || !audioEl.src)) {
      bgmSystem.track = "harp";
    }
    updateBgmUI();

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        setBgmPlaying(!bgmSystem.isPlaying);
      });
    }

    if (menuBtn && popover) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        popover.classList.toggle("hidden");
      });
      popover.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      document.addEventListener("click", () => {
        popover.classList.add("hidden");
      });
    }

    if (volSlider) {
      volSlider.addEventListener("input", () => {
        const pct = Number(volSlider.value);
        bgmSystem.volume = pct / 100;
        localStorage.setItem("arelita_bgm_vol", String(pct));
        document.getElementById("bgmVolValue").textContent = `${pct}%`;

        if (audioEl) {
          audioEl.volume = bgmSystem.volume;
        }
        if (bgmSystem.ctx && bgmSystem.masterGain && bgmSystem.isPlaying && bgmSystem.track !== "custom") {
          bgmSystem.masterGain.gain.setTargetAtTime(Math.max(0.001, bgmSystem.volume * 0.9), bgmSystem.ctx.currentTime, 0.08);
        }
      });
    }

    document.querySelectorAll(".bgm-track-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        bgmSystem.track = btn.getAttribute("data-bgm-track");
        localStorage.setItem("arelita_bgm_track", bgmSystem.track);
        bgmSystem.stepIdx = 0;
        setBgmPlaying(true);
      });
    });

    if (fileInput && audioEl && customTrackBtn) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (bgmSystem.customObjectUrl) {
          URL.revokeObjectURL(bgmSystem.customObjectUrl);
        }
        bgmSystem.customObjectUrl = URL.createObjectURL(file);
        audioEl.src = bgmSystem.customObjectUrl;
        customTrackBtn.textContent = `💿 自訂：${file.name.slice(0, 14)}`;
        customTrackBtn.classList.remove("hidden");
        bgmSystem.track = "custom";
        setBgmPlaying(true);
      });
    }
  }

  // ==================== THEME & SCROLL CONTROLS ====================
  function applyTheme(theme) {
    const validThemes = ["worldtree", "starry", "dark", "light"];
    state.theme = validThemes.includes(theme) ? theme : "worldtree";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("arelita_theme", state.theme);

    const iconEl = document.getElementById("themeToggleIcon");
    const textEl = document.getElementById("themeToggleText");
    if (iconEl && textEl) {
      if (state.theme === "worldtree") {
        iconEl.textContent = "🌳";
        textEl.textContent = "世界樹版";
      } else if (state.theme === "starry") {
        iconEl.textContent = "🌌";
        textEl.textContent = "星空版本";
      } else if (state.theme === "dark") {
        iconEl.textContent = "🌙";
        textEl.textContent = "黑色版本";
      } else {
        iconEl.textContent = "☀️";
        textEl.textContent = "白色版本";
      }
    }
  }

  // ==================== EVENT LISTENERS ====================
  function initEventListeners() {
    // Theme toggle button (World Tree / Starry / Dark / Light mode cycle)
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const nextMap = {
          worldtree: "starry",
          starry: "dark",
          dark: "light",
          light: "worldtree",
        };
        applyTheme(nextMap[state.theme] || "worldtree");
      });
    }

    // Floating header shadow & Back-to-top button visibility on scroll
    const siteHeader = document.getElementById("siteHeader");
    const backToTopBtn = document.getElementById("backToTopBtn");

    function handleWindowScroll() {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (siteHeader) {
        siteHeader.classList.toggle("scrolled", y > 12);
      }
      if (backToTopBtn) {
        backToTopBtn.classList.toggle("visible", y > 240);
      }
    }

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    document.querySelectorAll(".nav-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const target = tabBtn.getAttribute("data-tab");
        switchTab(target);
      });
    });

    document.querySelectorAll("[data-quick-tab]").forEach((card) => {
      card.addEventListener("click", () => {
        const target = card.getAttribute("data-quick-tab");
        switchTab(target);
      });
    });

    document.getElementById("brandHome").addEventListener("click", () => {
      switchTab("home");
    });

    const attrSearchInput = document.getElementById("attrSearchInput");
    if (attrSearchInput) {
      attrSearchInput.addEventListener("input", () => {
        state.attrSearchQuery = attrSearchInput.value;
        renderAttributeCatalog();
      });
    }

    document.querySelectorAll(".view-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-mode-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.viewMode = btn.getAttribute("data-view");
        renderCharacters();
      });
    });

    document.getElementById("filterHasImage").addEventListener("change", (e) => {
      state.filterHasImage = e.target.checked;
      renderCharacters();
    });

    document.getElementById("filterPowerTier").addEventListener("change", (e) => {
      state.filterPowerTier = e.target.value;
      renderCharacters();
    });

    document.getElementById("filterRace").addEventListener("change", (e) => {
      state.filterRace = e.target.value;
      renderCharacters();
    });

    const searchInput = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    searchInput.addEventListener("input", () => {
      state.searchQuery = searchInput.value;
      clearBtn.classList.toggle("hidden", !state.searchQuery);
      if (state.activeTab !== "characters") {
        switchTab("characters");
      } else {
        renderCharacters();
      }
    });

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      clearBtn.classList.add("hidden");
      renderCharacters();
    });

    document.querySelectorAll(".font-size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".font-size-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const sz = btn.getAttribute("data-size");
        const card = document.getElementById("storyContentContainer");
        card.className = `story-reader-card font-${sz}`;
      });
    });

    document.getElementById("closeModalBtn").addEventListener("click", closeCharacterModal);
    document.getElementById("characterModal").addEventListener("click", (e) => {
      if (e.target.id === "characterModal") closeCharacterModal();
    });

    document.getElementById("closeLightboxBtn").addEventListener("click", closeLightbox);
    document.getElementById("imageLightbox").addEventListener("click", (e) => {
      if (e.target.id === "imageLightbox") closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLightbox();
        closeCharacterModal();
      }
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll(".nav-tab").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabName);
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `tab-${tabName}`);
    });
  }

  // ==================== OPENING INTRO SPLASH ANIMATION ====================
  function runIntroSplash() {
    const splash = document.getElementById("introSplash");
    const bar = document.getElementById("introProgressBar");
    const pctEl = document.getElementById("introPercentText");
    const statusEl = document.getElementById("introStatusText");

    if (!splash) {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");
      return;
    }

    let finished = false;
    let rafId = null;
    const duration = 1150; // 1.15s crisp ceremonial intro
    const startTime = performance.now();

    function finishIntro() {
      if (finished) return;
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);

      if (bar) bar.style.width = "100%";
      if (pctEl) pctEl.textContent = "100%";
      if (statusEl) statusEl.textContent = "ARCHIVE ONLINE // 歡迎進入亞雷利塔";

      splash.classList.add("is-exiting");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");

      setTimeout(() => {
        splash.classList.add("is-removed");
      }, 850);
    }

    function tick(now) {
      if (finished) return;
      const elapsed = now - startTime;
      const rawProgress = Math.min(1, elapsed / duration);
      // Ease-out cubic curve for smooth progress bar
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      const pct = Math.round(eased * 100);

      if (bar) bar.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (statusEl) {
        if (pct < 40) {
          statusEl.textContent = `SYNCING ${characters.length} CHARACTER DOSSIERS...`;
        } else if (pct < 80) {
          statusEl.textContent = `LOADING WORLD TREE & ${stories.length} CHRONICLES...`;
        } else {
          statusEl.textContent = "ARCHIVE ONLINE // 歡迎進入亞雷利塔";
        }
      }

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(finishIntro, 140);
      }
    }

    splash.addEventListener("click", finishIntro, { once: true });
    rafId = requestAnimationFrame(tick);
  }

  // Boot
  applyTheme(state.theme);
  initHeaderAndFilters();
  initHomeCarousel();
  renderFactionTree();
  renderCharacters();
  renderLoreNav();
  renderLoreDocument();
  renderAttributeNav();
  renderAttributeSpotlight();
  renderAttributeCatalog();
  renderStoryNav();
  renderStoryContent();
  renderGalleryNav();
  renderGallery();
  initEventListeners();
  initBgmControls();
  runIntroSplash();
})();
