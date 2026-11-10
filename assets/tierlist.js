/**
 * 亞雷利塔 ARELITA // 角色戰力 Tier List 排行榜自訂系統
 * Character Power Tier List Maker (SS ~ F 8-Tier Architecture)
 */

(function () {
  "use strict";

  // ==================== CANONICAL POWER LADDER ====================
  const POWER_LADDER = [
    "現象級", // 0
    "終世級", // 1
    "降臨級", // 2
    "神座級", // 3
    "神王三級", // 4
    "神王二級", // 5
    "神王一級", // 6
    "古神三級", // 7
    "古神二級", // 8
    "古神一級", // 9
    "神明三級", // 10
    "神明二級", // 11
    "神明一級", // 12
    "準神三級", // 13
    "準神二級", // 14
    "準神一級", // 15
    "魔王三級", // 16
    "魔王二級", // 17
    "魔王一級", // 18
    "英雄三級", // 19
    "英雄二級", // 20
    "英雄一級", // 21
    "龍獸三級", // 22
    "龍獸二級", // 23
    "龍獸一級", // 24
    "天罰三級", // 25
    "天罰二級", // 26
    "天罰一級", // 27
    "猛鬼三級", // 28
    "猛鬼二級", // 29
    "猛鬼一級", // 30
    "精靈三級", // 31
    "精靈二級", // 32
    "精靈一級", // 33
    "魔導三級", // 34
    "魔導二級", // 35
    "魔導一級", // 36
    "騎士三級", // 37
    "騎士二級", // 38
    "騎士一級", // 39
    "魔獸三級", // 40
    "魔獸二級", // 41
    "魔獸一級", // 42
    "猛獸三級", // 43
    "猛獸二級", // 44
    "猛獸一級", // 45
    "凡人" // 46
  ];

  // ==================== TIER DEFINITIONS (8 TIERS) ====================
  const TIER_ORDER = ["SS", "S", "A", "B", "C", "D", "E", "F"];

  const DEFAULT_TITLE = "亞雷利塔全角色 Tier list";

  // Two selectable tier nomenclature presets
  const TIER_SCHEMES = {
    standard: {
      id: "standard",
      name: "標準英文字母 (SS ～ F)",
      labels: {
        SS: "SS",
        S: "S",
        A: "A",
        B: "B",
        C: "C",
        D: "D",
        E: "E",
        F: "F"
      },
      modalLabels: {
        SS: "SS 級",
        S: "S 級",
        A: "A 級",
        B: "B 級",
        C: "C 級",
        D: "D 級",
        E: "E 級",
        F: "F 級"
      }
    },
    slang: {
      id: "slang",
      name: "狂野稱號 (屌炸天 ～ 拉完了)",
      labels: {
        SS: "屌炸天",
        S: "夯爆了",
        A: "夯",
        B: "頂級",
        C: "人上人",
        D: "NPC",
        E: "拉",
        F: "拉完了"
      },
      modalLabels: {
        SS: "屌炸天",
        S: "夯爆了",
        A: "夯",
        B: "頂級",
        C: "人上人",
        D: "NPC",
        E: "拉",
        F: "拉完了"
      }
    }
  };

  const TIER_META = {
    SS: {
      name: "SS",
      label: "SS 級",
      subtitle: "頂點・現象級／終世級",
      color: "#ef4444",
      bgGrad: "linear-gradient(135deg, #ef4444, #991b1b)",
      border: "rgba(239, 68, 68, 0.4)"
    },
    S: {
      name: "S",
      label: "S 級",
      subtitle: "神座級／降臨級／神王三級",
      color: "#f97316",
      bgGrad: "linear-gradient(135deg, #f97316, #c2410c)",
      border: "rgba(249, 115, 22, 0.4)"
    },
    A: {
      name: "A",
      label: "A 級",
      subtitle: "神王二~一／古神三~二級",
      color: "#a855f7",
      bgGrad: "linear-gradient(135deg, #a855f7, #6b21a8)",
      border: "rgba(168, 85, 247, 0.4)"
    },
    B: {
      name: "B",
      label: "B 級",
      subtitle: "古神一／神明／準神三級",
      color: "#3b82f6",
      bgGrad: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      border: "rgba(59, 130, 246, 0.4)"
    },
    C: {
      name: "C",
      label: "C 級",
      subtitle: "準神二~一／魔王三~一級",
      color: "#10b981",
      bgGrad: "linear-gradient(135deg, #10b981, #047857)",
      border: "rgba(16, 185, 129, 0.4)"
    },
    D: {
      name: "D",
      label: "D 級",
      subtitle: "英雄三~一／龍獸三~一級",
      color: "#f59e0b",
      bgGrad: "linear-gradient(135deg, #f59e0b, #b45309)",
      border: "rgba(245, 158, 11, 0.4)"
    },
    E: {
      name: "E",
      label: "E 級",
      subtitle: "天罰／猛鬼／精靈二~三級",
      color: "#64748b",
      bgGrad: "linear-gradient(135deg, #64748b, #334155)",
      border: "rgba(100, 116, 139, 0.4)"
    },
    F: {
      name: "F",
      label: "F 級",
      subtitle: "魔導／猛獸／凡人及其他",
      color: "#475569",
      bgGrad: "linear-gradient(135deg, #334155, #0f172a)",
      border: "rgba(71, 85, 105, 0.4)"
    }
  };

  const REALM_COLORS = {
    現界: "#3b82f6",
    天界: "#eab308",
    魔界: "#ef4444",
    冥界: "#8b5cf6",
    幻想界: "#10b981",
    虛空: "#ec4899"
  };

  // ==================== UTILITY FUNCTIONS ====================
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPortraitUrl(imgPath) {
    if (!imgPath) return "";
    return String(imgPath).replace(/^亞雷利塔角色立繪[\/\\]/, "assets/portraits/");
  }

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

  // Determine official canonical tier (SS ~ F)
  function getCanonicalTier(c) {
    const score = c.powerScore;
    const name = String(c.name || "");
    const power = String(c.power || "");

    // SS: 現象級 (0), 終世級 (1)
    if (score === 0 || score === 1 || /現象|終世/.test(power)) {
      return "SS";
    }

    // S: 降臨級 (2), 神座級 (3), 神王三級 (4), 黑卡蒂
    if (/黑卡蒂/.test(name)) return "S";
    if (score >= 2 && score <= 4) return "S";
    if (/降臨|神座|神王三/.test(power)) return "S";

    // A: 神王二級 (5), 神王一級 (6), 古神三級 (7), 古神二級 (8)
    // plus special designations: 阿撒托斯, 赤夜風竹, 索亞德
    if (/阿撒托斯|赤夜風竹|索亞德/.test(name)) return "A";
    if (score >= 5 && score <= 8) return "A";
    if (/神王二|神王一|古神三|古神二/.test(power)) return "A";

    // B: 古神一級 (9), 神明級 (10..12), 準神三級 (13)
    if (score >= 9 && score <= 13) return "B";
    if (/古神一|神明|準神三/.test(power)) return "B";

    // C: 準神二~一級 (14..15), 魔王級 (16..18)
    if (score >= 14 && score <= 18) return "C";
    if (/準神二|準神一|魔王/.test(power)) return "C";

    // D: 英雄級 (19..21), 龍獸級 (22..24)
    if (score >= 19 && score <= 24) return "D";
    if (/英雄|龍獸/.test(power)) return "D";

    // E: 天罰級 (25..27), 猛鬼級 (28..30), 精靈三~二級 (31..32)
    if (score >= 25 && score <= 32) return "E";
    if (/天罰|猛鬼|精靈三|精靈二/.test(power)) return "E";

    // F: 精靈一級 (33), 魔導, 騎士, 魔獸, 猛獸, 凡人, 其他
    return "F";
  }

  // ==================== STATE MANAGEMENT ====================
  const LOCAL_STORAGE_KEY = "arelita_power_tier_list_state_v2";

  const state = {
    characters: [],
    charMap: new Map(),
    scheme: "standard", // "standard" or "slang"
    customTitle: DEFAULT_TITLE,
    // Map of tier -> Array of character IDs
    tiers: {
      SS: [],
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: []
    },
    // Array of character IDs currently unranked
    unranked: [],
    // Filters for pool
    filter: {
      search: "",
      realm: "all",
      power: "all",
      portraitOnly: false
    },
    // Active character in modal
    activeModalCharId: null,
    // Drag state
    draggedCharId: null,
    dragSourceTier: null // 'SS'..'F' or 'unranked'
  };

  function getTierLabel(tierKey) {
    const curScheme = TIER_SCHEMES[state.scheme] || TIER_SCHEMES.standard;
    return curScheme.labels[tierKey] || tierKey;
  }

  function getModalTierLabel(tierKey) {
    const curScheme = TIER_SCHEMES[state.scheme] || TIER_SCHEMES.standard;
    return curScheme.modalLabels[tierKey] || `${tierKey} 級`;
  }

  // Pre-cached image elements for canvas snapshot
  const imageElementCache = new Map();

  function preloadImages() {
    state.characters.forEach((c) => {
      if (c.image) {
        const url = getPortraitUrl(c.image);
        if (!imageElementCache.has(url)) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          imageElementCache.set(url, img);
        }
      }
    });
  }

  // ==================== INITIALIZATION ====================
  function initData() {
    if (!window.ARELITA_DATA || !Array.isArray(window.ARELITA_DATA.characters)) {
      console.error("ARELITA_DATA.characters not found!");
      return;
    }

    state.characters = window.ARELITA_DATA.characters.map((raw) => {
      const c = Object.assign({}, raw);
      c.profile = c.profile || {};
      c.power = c.power || "";
      const pRank = computePowerRank(c.power);
      c.powerTierIdx = pRank.tierIdx;
      c.powerScore = pRank.score;
      c.canonicalTier = getCanonicalTier(c);
      return c;
    });

    state.characters.forEach((c) => {
      state.charMap.set(c.id, c);
    });

    preloadImages();

    // Check if user has saved state
    const saved = loadSavedState();
    if (saved) {
      applyStateFromObject(saved);
    } else {
      // Default: All 175 characters in unranked pool
      resetToUnrankedPool();
    }
  }

  function resetToUnrankedPool() {
    TIER_ORDER.forEach((t) => {
      state.tiers[t] = [];
    });
    // Default sorted by canonical power rank so pool looks neat
    const sorted = [...state.characters].sort((a, b) => {
      const sa = a.powerScore === -1 ? 999 : a.powerScore;
      const sb = b.powerScore === -1 ? 999 : b.powerScore;
      return sa - sb;
    });
    state.unranked = sorted.map((c) => c.id);
  }

  function autoRankAllCharacters() {
    TIER_ORDER.forEach((t) => {
      state.tiers[t] = [];
    });
    state.unranked = [];

    // Sort all characters by canonical score, then assign
    const sorted = [...state.characters].sort((a, b) => {
      const sa = a.powerScore === -1 ? 999 : a.powerScore;
      const sb = b.powerScore === -1 ? 999 : b.powerScore;
      return sa - sb;
    });

    sorted.forEach((c) => {
      const targetTier = c.canonicalTier || "F";
      if (state.tiers[targetTier]) {
        state.tiers[targetTier].push(c.id);
      } else {
        state.tiers.F.push(c.id);
      }
    });

    saveCurrentStateToLocalStorage();
    renderAll();
    showToast("⚡ 已成功一鍵套用官方 8 大戰力梯隊設定！");
  }

  function autoRankRemainingPool() {
    if (state.unranked.length === 0) {
      showToast("未分配池中已無剩餘角色。");
      return;
    }

    const remaining = [...state.unranked];
    state.unranked = [];

    remaining.forEach((id) => {
      const c = state.charMap.get(id);
      if (!c) return;
      const targetTier = c.canonicalTier || "F";
      if (state.tiers[targetTier]) {
        state.tiers[targetTier].push(c.id);
      } else {
        state.tiers.F.push(c.id);
      }
    });

    saveCurrentStateToLocalStorage();
    renderAll();
    showToast(`⚡ 已將剩餘 ${remaining.length} 位角色自動套用官方戰力分派！`);
  }

  function clearAllToPool() {
    resetToUnrankedPool();
    saveCurrentStateToLocalStorage();
    renderAll();
    showToast("🧹 已將所有 175 位角色清空並移回未分配池！");
  }

  function randomRankAll() {
    TIER_ORDER.forEach((t) => {
      state.tiers[t] = [];
    });
    state.unranked = [];

    const shuffled = [...state.characters].sort(() => Math.random() - 0.5);
    shuffled.forEach((c) => {
      const randomTier = TIER_ORDER[Math.floor(Math.random() * TIER_ORDER.length)];
      state.tiers[randomTier].push(c.id);
    });

    saveCurrentStateToLocalStorage();
    renderAll();
    showToast("🎲 已隨機分派全體角色至各戰力梯隊！");
  }

  // ==================== LOCAL STORAGE SAVE / LOAD ====================
  function saveCurrentStateToLocalStorage() {
    try {
      const payload = {
        version: 2,
        timestamp: Date.now(),
        tiers: state.tiers,
        unranked: state.unranked,
        scheme: state.scheme,
        customTitle: state.customTitle
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn("Failed to save tier list state to localStorage", e);
      return false;
    }
  }

  function loadSavedState() {
    try {
      let raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem("arelita_power_tier_list_state_v1");
      }
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.tiers) return data;
      return null;
    } catch (e) {
      console.warn("Failed to load tier list state", e);
      return null;
    }
  }

  function applyStateFromObject(saved) {
    if (saved.scheme && TIER_SCHEMES[saved.scheme]) {
      state.scheme = saved.scheme;
    }
    if (saved.customTitle && typeof saved.customTitle === "string") {
      state.customTitle = saved.customTitle;
      const titleEl = document.getElementById("tlCustomTitle");
      if (titleEl) titleEl.textContent = saved.customTitle;
    }

    const validIds = new Set(state.characters.map((c) => c.id));
    const seen = new Set();

    TIER_ORDER.forEach((t) => {
      state.tiers[t] = [];
      const list = saved.tiers && Array.isArray(saved.tiers[t]) ? saved.tiers[t] : [];
      list.forEach((id) => {
        if (validIds.has(id) && !seen.has(id)) {
          state.tiers[t].push(id);
          seen.add(id);
        }
      });
    });

    state.unranked = [];
    // Any characters not placed in tiers go to unranked
    state.characters.forEach((c) => {
      if (!seen.has(c.id)) {
        state.unranked.push(c.id);
        seen.add(c.id);
      }
    });

    updateSchemeButtonStates();
  }

  // ==================== RENDERING ====================
  function renderAll() {
    renderStats();
    renderBoard();
    renderPool();
  }

  function renderStats() {
    let rankedCount = 0;
    TIER_ORDER.forEach((t) => {
      rankedCount += state.tiers[t].length;
    });
    const unrankedCount = state.unranked.length;

    const elRanked = document.getElementById("tlStatRanked");
    const elUnranked = document.getElementById("tlStatUnranked");
    const elPoolCount = document.getElementById("tlPoolCount");

    if (elRanked) elRanked.textContent = String(rankedCount);
    if (elUnranked) elUnranked.textContent = String(unrankedCount);
    if (elPoolCount) elPoolCount.textContent = String(unrankedCount);
  }

  // Render the 8 Tier Rows on the Board
  function renderBoard() {
    const board = document.getElementById("tierBoard");
    if (!board) return;

    if (state.scheme === "slang") {
      board.classList.add("is-slang-scheme");
    } else {
      board.classList.remove("is-slang-scheme");
    }

    let html = "";
    TIER_ORDER.forEach((tierKey) => {
      const meta = TIER_META[tierKey];
      const charIds = state.tiers[tierKey];
      const count = charIds.length;
      const displayLabel = getTierLabel(tierKey);

      html += `
        <div class="tl-row" data-tier="${esc(tierKey)}">
          <div class="tl-label-cell" style="background: ${meta.bgGrad}; border-color: ${meta.border};">
            <div class="tl-tier-name ${displayLabel.length > 2 ? "is-long-name" : ""}">${esc(displayLabel)}</div>
            <div class="tl-tier-count">${count} 人</div>
            <div class="tl-label-quick-actions">
              <button type="button" class="tl-row-btn-clear" data-clear-tier="${esc(tierKey)}" title="清空本列，將角色移回未分配池">
                清空列
              </button>
            </div>
          </div>
          <div class="tl-dropzone" data-tier="${esc(tierKey)}" role="region" aria-label="${esc(displayLabel)} 放置區">
      `;

      if (count === 0) {
        html += `
          <div class="tl-dropzone-placeholder" data-tier="${esc(tierKey)}">
            拖曳角色至此，或點擊角色卡快速分派至 ${esc(displayLabel)}
          </div>
        `;
      } else {
        charIds.forEach((charId, idx) => {
          const c = state.charMap.get(charId);
          if (c) {
            html += renderCharacterCard(c, tierKey, idx);
          }
        });
      }

      html += `
          </div>
        </div>
      `;
    });

    board.innerHTML = html;
    bindBoardEvents();
  }

  // Render Character Cards inside Unranked Pool
  function renderPool() {
    const grid = document.getElementById("unrankedCardsGrid");
    const empty = document.getElementById("tlPoolEmpty");
    if (!grid) return;

    const filtered = filterCharacters(state.unranked);

    if (state.unranked.length === 0) {
      grid.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="tl-no-match">
          <span class="no-match-icon">🔍</span>
          <p>無符合當前篩選條件的角色，請嘗試清除關鍵字或切換界域篩選標籤。</p>
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach((c) => {
      html += renderCharacterCard(c, "unranked", -1);
    });
    grid.innerHTML = html;
    bindPoolCardEvents();
  }

  // Filter unranked pool characters
  function filterCharacters(idList) {
    const q = state.filter.search.trim().toLowerCase();
    const realm = state.filter.realm;
    const power = state.filter.power;
    const portraitOnly = state.filter.portraitOnly;

    return idList
      .map((id) => state.charMap.get(id))
      .filter((c) => {
        if (!c) return false;

        // Portrait only filter
        if (portraitOnly && !c.image) return false;

        // Realm filter
        if (realm !== "all" && c.realm !== realm) return false;

        // Power dropdown filter
        if (power !== "all") {
          const p = String(c.power || "");
          if (!p.includes(power)) return false;
        }

        // Search query
        if (q) {
          const matchName = String(c.name || "").toLowerCase().includes(q);
          const matchTitle = String(c.title || "").toLowerCase().includes(q);
          const matchEpithet = String(c.profile["稱號"] || "").toLowerCase().includes(q);
          const matchRace = String(c.profile["種族"] || "").toLowerCase().includes(q);
          const matchPower = String(c.power || "").toLowerCase().includes(q);
          const matchRealm = String(c.realm || "").toLowerCase().includes(q);
          if (!matchName && !matchTitle && !matchEpithet && !matchRace && !matchPower && !matchRealm) {
            return false;
          }
        }

        return true;
      });
  }

  // Character Card Markup
  function renderCharacterCard(c, currentTier, indexInTier) {
    const portraitUrl = getPortraitUrl(c.image);
    const realmColor = REALM_COLORS[c.realm] || "#64748b";
    const initial = (c.name || "?").substring(0, 1);
    const epithet = c.profile["稱號"] || "";
    const shortPower = (c.power || "").split("／")[0].split("(")[0].trim() || "未知";

    return `
      <div
        class="tl-char-card ${c.image ? "has-portrait" : "no-portrait"}"
        data-char-id="${esc(c.id)}"
        data-current-tier="${esc(currentTier)}"
        data-tier-index="${indexInTier}"
        draggable="true"
        role="button"
        tabindex="0"
        title="${esc(c.name)} (${esc(epithet || c.realm)}・${esc(shortPower)}) - 點擊快速分派"
      >
        <div class="tl-card-avatar" style="border-color: ${realmColor};">
          ${
            c.image
              ? `<img src="${esc(portraitUrl)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />`
              : `<div class="tl-avatar-fallback" style="background: ${realmColor}22; color: ${realmColor};">
                   <span class="fallback-char">${esc(initial)}</span>
                 </div>`
          }
          <span class="tl-card-realm-tag" style="background: ${realmColor};">${esc(c.realm)}</span>
          ${
            currentTier !== "unranked"
              ? `<button type="button" class="tl-card-quick-remove" data-remove-id="${esc(c.id)}" title="移回未分配池">✕</button>`
              : ""
          }
        </div>
        <div class="tl-card-name" title="${esc(c.name)}">${esc(c.name)}</div>
      </div>
    `;
  }

  // ==================== EVENT BINDING & DRAG-AND-DROP ====================
  function bindBoardEvents() {
    const board = document.getElementById("tierBoard");
    if (!board) return;

    // Clear single tier button clicks
    board.querySelectorAll("[data-clear-tier]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tierKey = btn.getAttribute("data-clear-tier");
        clearSingleTier(tierKey);
      });
    });

    // Dropzones drag & drop
    board.querySelectorAll(".tl-dropzone").forEach((dropzone) => {
      const tierKey = dropzone.getAttribute("data-tier");

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", (e) => {
        if (!dropzone.contains(e.relatedTarget)) {
          dropzone.classList.remove("drag-over");
        }
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");

        const charId = state.draggedCharId || e.dataTransfer.getData("text/plain");
        if (!charId) return;

        // Determine drop position (before which card)
        const targetCard = e.target.closest(".tl-char-card");
        let targetIndex = -1;
        if (targetCard && targetCard.parentNode === dropzone) {
          const cardId = targetCard.getAttribute("data-char-id");
          targetIndex = state.tiers[tierKey].indexOf(cardId);
        }

        moveCharacterToTier(charId, tierKey, targetIndex);
      });
    });

    // Card click & drag events on board
    board.querySelectorAll(".tl-char-card").forEach((card) => {
      setupCardDragAndClick(card);
    });
  }

  function bindPoolCardEvents() {
    const grid = document.getElementById("unrankedCardsGrid");
    if (!grid) return;

    grid.querySelectorAll(".tl-char-card").forEach((card) => {
      setupCardDragAndClick(card);
    });
  }

  function setupCardDragAndClick(card) {
    const charId = card.getAttribute("data-char-id");
    const currentTier = card.getAttribute("data-current-tier");

    // Quick remove button
    const removeBtn = card.querySelector(".tl-card-quick-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveCharacterToUnranked(charId);
      });
    }

    // Drag start
    card.addEventListener("dragstart", (e) => {
      state.draggedCharId = charId;
      state.dragSourceTier = currentTier;
      card.classList.add("is-dragging");
      e.dataTransfer.setData("text/plain", charId);
      e.dataTransfer.effectAllowed = "move";
    });

    // Drag end
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      state.draggedCharId = null;
      state.dragSourceTier = null;
      document.querySelectorAll(".tl-dropzone.drag-over").forEach((el) => {
        el.classList.remove("drag-over");
      });
    });

    // Click / Enter key opens quick modal
    card.addEventListener("click", (e) => {
      if (e.target.closest(".tl-card-quick-remove")) return;
      openCharAssignModal(charId);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCharAssignModal(charId);
      }
    });
  }

  // Clear single tier
  function clearSingleTier(tierKey) {
    if (!state.tiers[tierKey] || state.tiers[tierKey].length === 0) return;
    const removedCount = state.tiers[tierKey].length;
    state.tiers[tierKey].forEach((id) => {
      state.unranked.push(id);
    });
    state.tiers[tierKey] = [];
    saveCurrentStateToLocalStorage();
    renderAll();
    showToast(`已清空 ${tierKey} 級，${removedCount} 位角色已回未分配池。`);
  }

  // Move character to a tier
  function moveCharacterToTier(charId, targetTier, insertIndex = -1) {
    if (!state.tiers[targetTier]) return;

    // Remove from previous location
    TIER_ORDER.forEach((t) => {
      const idx = state.tiers[t].indexOf(charId);
      if (idx !== -1) {
        state.tiers[t].splice(idx, 1);
      }
    });

    const unrankedIdx = state.unranked.indexOf(charId);
    if (unrankedIdx !== -1) {
      state.unranked.splice(unrankedIdx, 1);
    }

    // Insert into target tier
    if (insertIndex >= 0 && insertIndex < state.tiers[targetTier].length) {
      state.tiers[targetTier].splice(insertIndex, 0, charId);
    } else {
      state.tiers[targetTier].push(charId);
    }

    saveCurrentStateToLocalStorage();
    renderAll();
  }

  // Move character back to unranked pool
  function moveCharacterToUnranked(charId) {
    TIER_ORDER.forEach((t) => {
      const idx = state.tiers[t].indexOf(charId);
      if (idx !== -1) {
        state.tiers[t].splice(idx, 1);
      }
    });

    if (!state.unranked.includes(charId)) {
      state.unranked.unshift(charId);
    }

    saveCurrentStateToLocalStorage();
    renderAll();
  }

  // ==================== MODAL QUICK ASSIGN ====================
  function openCharAssignModal(charId) {
    const c = state.charMap.get(charId);
    if (!c) return;

    state.activeModalCharId = charId;
    const modal = document.getElementById("charAssignModal");
    if (!modal) return;

    // Populate character preview
    const epithetEl = document.getElementById("modalCharEpithet");
    const nameEl = document.getElementById("modalCharName");
    const tagsEl = document.getElementById("modalCharTags");
    const avatarBox = document.getElementById("modalAvatarBox");
    const tierBadge = document.getElementById("modalCurrentTierBadge");
    const compareLink = document.getElementById("btnModalOpenCompare");

    const epithet = c.profile["稱號"] || "";
    if (epithetEl) epithetEl.textContent = epithet ? `《${epithet}》` : "";
    if (nameEl) nameEl.textContent = c.name;

    const realmColor = REALM_COLORS[c.realm] || "#64748b";
    if (tagsEl) {
      tagsEl.innerHTML = `
        <span class="modal-tag" style="background: ${realmColor}22; color: ${realmColor}; border: 1px solid ${realmColor}44;">
          ${esc(c.realm)}
        </span>
        <span class="modal-tag modal-power-tag">
          ${esc(c.power || "力量未明")}
        </span>
        <span class="modal-tag modal-race-tag">
          ${esc(c.profile["種族"] || "未知種族")}
        </span>
      `;
    }

    // Avatar
    const portraitUrl = getPortraitUrl(c.image);
    const initial = (c.name || "?").substring(0, 1);
    if (avatarBox) {
      if (c.image) {
        avatarBox.innerHTML = `<img src="${esc(portraitUrl)}" alt="${esc(c.name)}" />`;
      } else {
        avatarBox.innerHTML = `
          <div class="modal-avatar-fallback" style="background: ${realmColor}22; color: ${realmColor};">
            ${esc(initial)}
          </div>
        `;
      }
    }

    // Find current tier
    let currentTier = "unranked";
    for (const t of TIER_ORDER) {
      if (state.tiers[t].includes(charId)) {
        currentTier = t;
        break;
      }
    }

    if (tierBadge) {
      if (currentTier === "unranked") {
        tierBadge.textContent = "未分配池";
        tierBadge.style.color = "var(--text-secondary)";
      } else {
        const meta = TIER_META[currentTier];
        tierBadge.textContent = getModalTierLabel(currentTier);
        tierBadge.style.color = meta.color;
      }
    }

    // Compare link
    if (compareLink) {
      compareLink.href = `compare.html?id1=${encodeURIComponent(c.id)}`;
    }

    // Update modal tier buttons text & active state
    document.querySelectorAll(".tl-btn-tier-select").forEach((btn) => {
      const target = btn.getAttribute("data-target-tier");
      const nameSpan = btn.querySelector(".btn-tier-name");
      if (nameSpan && target) {
        nameSpan.textContent = getModalTierLabel(target);
      }
      if (target === currentTier) {
        btn.classList.add("is-current");
      } else {
        btn.classList.remove("is-current");
      }
    });

    modal.classList.remove("hidden");
  }

  function closeCharAssignModal() {
    const modal = document.getElementById("charAssignModal");
    if (modal) modal.classList.add("hidden");
    state.activeModalCharId = null;
  }

  function bindModalEvents() {
    const modal = document.getElementById("charAssignModal");
    const closeBtn = document.getElementById("btnModalClose");
    const unrankedBtn = document.getElementById("btnModalToUnranked");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeCharAssignModal);
    }

    if (unrankedBtn) {
      unrankedBtn.addEventListener("click", () => {
        if (state.activeModalCharId) {
          moveCharacterToUnranked(state.activeModalCharId);
          closeCharAssignModal();
          showToast("已移回未分配角色池！");
        }
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeCharAssignModal();
        }
      });
    }

    // Tier buttons inside modal
    document.querySelectorAll(".tl-btn-tier-select").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTier = btn.getAttribute("data-target-tier");
        if (state.activeModalCharId && targetTier) {
          moveCharacterToTier(state.activeModalCharId, targetTier);
          closeCharAssignModal();
          showToast(`已移動至 ${targetTier} 級！`);
        }
      });
    });

    // Esc key close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCharAssignModal();
      }
    });
  }

  // ==================== TOAST NOTIFICATION ====================
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById("tlToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    toast.classList.add("is-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2800);
  }

  // ==================== IMAGE EXPORT (CANVAS RENDERING) ====================
  function exportTierListImage() {
    showToast("📷 正在繪製高畫質排行榜圖片...");

    const canvas = document.getElementById("tlExportCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = 1440;
    const paddingX = 40;
    const headerHeight = 140;
    const footerHeight = 60;
    const rowGap = 16;
    const labelWidth = 180;
    const cardSize = 76;
    const cardGap = 8;
    const cardsPerRow = Math.floor((width - paddingX * 2 - labelWidth - 30) / (cardSize + cardGap));

    // Calculate dynamic height based on row card counts
    let totalHeight = headerHeight + paddingX + footerHeight;
    const rowHeights = {};

    TIER_ORDER.forEach((tierKey) => {
      const count = state.tiers[tierKey].length;
      const numLines = Math.max(1, Math.ceil(count / cardsPerRow));
      const rHeight = Math.max(100, numLines * (cardSize + cardGap + 18) + 20);
      rowHeights[tierKey] = rHeight;
      totalHeight += rHeight + rowGap;
    });

    canvas.width = width;
    canvas.height = totalHeight;

    // 1. Background dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight);
    bgGrad.addColorStop(0, "#080c14");
    bgGrad.addColorStop(0.5, "#0b1324");
    bgGrad.addColorStop(1, "#070a10");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, totalHeight);

    // Decorative grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight);
      ctx.stroke();
    }
    for (let y = 0; y < totalHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Header
    ctx.fillStyle = "rgba(10, 18, 36, 0.9)";
    ctx.fillRect(0, 0, width, headerHeight);
    ctx.strokeStyle = "rgba(230, 180, 80, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(width, headerHeight);
    ctx.stroke();

    // Header Title
    const titleToDraw = (state.customTitle || DEFAULT_TITLE).trim();
    ctx.font = "bold 32px 'Noto Serif TC', 'Cinzel', serif";
    ctx.fillStyle = "#e6b450";
    ctx.textAlign = "left";
    ctx.fillText(titleToDraw, paddingX, 55);

    // Header Subtitle
    ctx.font = "500 15px 'Noto Sans TC', sans-serif";
    ctx.fillStyle = "#94a3b8";
    const dateStr = new Date().toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const curScheme = TIER_SCHEMES[state.scheme] || TIER_SCHEMES.standard;
    ctx.fillText(
      `ARELITA OFFICIAL ARCHIVE // TIER LIST MAKER ・ 版本風格：${curScheme.name} ・ 產出日期：${dateStr}`,
      paddingX,
      90
    );

    // 3. Render Tier Rows
    let currentY = headerHeight + 24;

    TIER_ORDER.forEach((tierKey) => {
      const meta = TIER_META[tierKey];
      const rHeight = rowHeights[tierKey];
      const charIds = state.tiers[tierKey];
      const count = charIds.length;

      // Row background
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fillRect(paddingX, currentY, width - paddingX * 2, rHeight);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(paddingX, currentY, width - paddingX * 2, rHeight);

      // Left Tier Label Cell
      const labelGrad = ctx.createLinearGradient(
        paddingX,
        currentY,
        paddingX + labelWidth,
        currentY + rHeight
      );
      labelGrad.addColorStop(0, meta.color);
      labelGrad.addColorStop(1, "#111827");
      ctx.fillStyle = labelGrad;
      ctx.fillRect(paddingX, currentY, labelWidth, rHeight);

      // Label Text: Tier Name (slang or standard)
      const tierDisplayName = getTierLabel(tierKey);
      ctx.fillStyle = "#ffffff";
      if (tierDisplayName.length > 2) {
        ctx.font = "900 28px 'Noto Sans TC', sans-serif";
      } else if (tierDisplayName.length === 2) {
        ctx.font = "900 38px 'Noto Sans TC', 'Cinzel', sans-serif";
      } else {
        ctx.font = "900 46px 'Cinzel', 'Noto Sans TC', sans-serif";
      }
      ctx.textAlign = "center";
      ctx.fillText(tierDisplayName, paddingX + labelWidth / 2, currentY + rHeight / 2 - 2);

      // Label Text: Count
      ctx.font = "bold 13px 'Noto Sans TC', sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(`${count} 人`, paddingX + labelWidth / 2, currentY + rHeight / 2 + 22);

      // Cards inside Dropzone area
      const cardsStartX = paddingX + labelWidth + 18;
      const cardsStartY = currentY + 12;

      if (count === 0) {
        ctx.font = "italic 14px 'Noto Sans TC', sans-serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.textAlign = "left";
        ctx.fillText("（本梯隊目前無指派角色）", cardsStartX, currentY + rHeight / 2 + 5);
      } else {
        charIds.forEach((charId, idx) => {
          const c = state.charMap.get(charId);
          if (!c) return;

          const col = idx % cardsPerRow;
          const row = Math.floor(idx / cardsPerRow);
          const cx = cardsStartX + col * (cardSize + cardGap);
          const cy = cardsStartY + row * (cardSize + cardGap + 18);

          // Card Avatar Box
          const realmColor = REALM_COLORS[c.realm] || "#64748b";

          ctx.save();
          // Clip rounded rectangle for avatar
          ctx.beginPath();
          ctx.rect(cx, cy, cardSize, cardSize);
          ctx.clip();

          const url = getPortraitUrl(c.image);
          const cachedImg = imageElementCache.get(url);

          if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
            ctx.drawImage(cachedImg, cx, cy, cardSize, cardSize);
          } else {
            // Fallback initial badge
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(cx, cy, cardSize, cardSize);
            ctx.font = "bold 24px 'Noto Sans TC', sans-serif";
            ctx.fillStyle = realmColor;
            ctx.textAlign = "center";
            ctx.fillText((c.name || "?").substring(0, 1), cx + cardSize / 2, cy + cardSize / 2 + 9);
          }
          ctx.restore();

          // Border around avatar
          ctx.strokeStyle = realmColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx, cy, cardSize, cardSize);

          // Character Name text
          ctx.font = "500 11px 'Noto Sans TC', sans-serif";
          ctx.fillStyle = "#e2e8f0";
          ctx.textAlign = "center";
          let displayName = c.name || "";
          if (displayName.length > 5) displayName = displayName.substring(0, 4) + "..";
          ctx.fillText(displayName, cx + cardSize / 2, cy + cardSize + 14);
        });
      }

      currentY += rHeight + rowGap;
    });

    // 4. Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "500 12px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "亞雷利塔 ARELITA OFFICIAL ARCHIVE // POWER TIER LIST MAKER ・ HTTPS://ARELITA.ARCHIVE",
      width / 2,
      totalHeight - 24
    );

    // Trigger PNG Download
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast("匯出失敗，請重試。");
          return;
        }
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dlUrl;
        a.download = `arelita_power_tier_list_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dlUrl);
        showToast("🎉 高畫質排行榜圖片匯出完成！");
      }, "image/png");
    } catch (err) {
      console.error(err);
      showToast("圖片產生過程發生異常。");
    }
  }

  // ==================== SCHEME & CUSTOM TITLE CONTROLS ====================
  function updateSchemeButtonStates() {
    const btnStd = document.getElementById("btnSchemeStandard");
    const btnSlang = document.getElementById("btnSchemeSlang");
    if (btnStd) btnStd.classList.toggle("is-active", state.scheme === "standard");
    if (btnSlang) btnSlang.classList.toggle("is-active", state.scheme === "slang");
  }

  function initSchemeButtons() {
    const btnStd = document.getElementById("btnSchemeStandard");
    const btnSlang = document.getElementById("btnSchemeSlang");

    if (btnStd) {
      btnStd.addEventListener("click", () => {
        if (state.scheme !== "standard") {
          state.scheme = "standard";
          updateSchemeButtonStates();
          renderBoard();
          saveCurrentStateToLocalStorage();
          showToast("🅰️ 已切換為「標準英文字母 (SS ～ F)」版本！");
        }
      });
    }

    if (btnSlang) {
      btnSlang.addEventListener("click", () => {
        if (state.scheme !== "slang") {
          state.scheme = "slang";
          updateSchemeButtonStates();
          renderBoard();
          saveCurrentStateToLocalStorage();
          showToast("🔥 已切換為「狂野稱號 (屌炸天 ～ 拉完了)」版本！");
        }
      });
    }

    updateSchemeButtonStates();
  }

  function initCustomTitle() {
    const titleEl = document.getElementById("tlCustomTitle");
    const resetBtn = document.getElementById("btnResetTitle");
    if (!titleEl) return;

    if (state.customTitle) {
      titleEl.textContent = state.customTitle;
    }

    function checkResetBtn() {
      if (resetBtn) {
        const isModified = (state.customTitle || "").trim() !== DEFAULT_TITLE;
        resetBtn.classList.toggle("hidden", !isModified);
      }
    }

    checkResetBtn();

    titleEl.addEventListener("input", () => {
      const val = titleEl.textContent.trim();
      state.customTitle = val || DEFAULT_TITLE;
      checkResetBtn();
      saveCurrentStateToLocalStorage();
    });

    titleEl.addEventListener("blur", () => {
      if (!titleEl.textContent.trim()) {
        titleEl.textContent = DEFAULT_TITLE;
        state.customTitle = DEFAULT_TITLE;
      }
      checkResetBtn();
      saveCurrentStateToLocalStorage();
    });

    titleEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleEl.blur();
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.customTitle = DEFAULT_TITLE;
        titleEl.textContent = DEFAULT_TITLE;
        checkResetBtn();
        saveCurrentStateToLocalStorage();
        showToast("↺ 已恢復為預設排行榜名稱！");
      });
    }
  }

  // ==================== TOOLBAR & CONTROLS BINDING ====================
  function bindToolbarControls() {
    // ⚡ 一鍵官方戰力
    const btnAutoRank = document.getElementById("btnAutoRank");
    if (btnAutoRank) {
      btnAutoRank.addEventListener("click", autoRankAllCharacters);
    }

    const btnAutoRankPool = document.getElementById("btnAutoRankPool");
    if (btnAutoRankPool) {
      btnAutoRankPool.addEventListener("click", autoRankRemainingPool);
    }

    // 🎲 隨機排位
    const btnRandomRank = document.getElementById("btnRandomRank");
    if (btnRandomRank) {
      btnRandomRank.addEventListener("click", randomRankAll);
    }

    // 🧹 全部回池清空
    const btnClearAll = document.getElementById("btnClearAll");
    if (btnClearAll) {
      btnClearAll.addEventListener("click", clearAllToPool);
    }

    // 💾 儲存排位
    const btnSave = document.getElementById("btnSaveTierList");
    if (btnSave) {
      btnSave.addEventListener("click", () => {
        if (saveCurrentStateToLocalStorage()) {
          showToast("💾 當前自訂排位已成功儲存至本機！");
        } else {
          showToast("儲存失敗。");
        }
      });
    }

    // 📂 讀取排位
    const btnLoad = document.getElementById("btnLoadTierList");
    if (btnLoad) {
      btnLoad.addEventListener("click", () => {
        const saved = loadSavedState();
        if (saved) {
          applyStateFromObject(saved);
          renderAll();
          showToast("📂 已成功載入先前儲存的自訂排位！");
        } else {
          showToast("尚無本機儲存的排位紀錄。");
        }
      });
    }

    // 📷 匯出為圖片
    const btnExport = document.getElementById("btnExportImage");
    if (btnExport) {
      btnExport.addEventListener("click", exportTierListImage);
    }

    // Search Input
    const searchInput = document.getElementById("tlSearchInput");
    const clearSearchBtn = document.getElementById("btnTlClearSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.filter.search = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle("hidden", !e.target.value);
        }
        renderPool();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        state.filter.search = "";
        clearSearchBtn.classList.add("hidden");
        renderPool();
      });
    }

    // Realm Pills
    const realmPills = document.getElementById("tlRealmPills");
    if (realmPills) {
      realmPills.querySelectorAll(".tl-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          realmPills.querySelectorAll(".tl-pill").forEach((p) => p.classList.remove("is-active"));
          pill.classList.add("is-active");
          state.filter.realm = pill.getAttribute("data-realm") || "all";
          renderPool();
        });
      });
    }

    // Power Select Dropdown
    const powerSelect = document.getElementById("tlPowerSelect");
    if (powerSelect) {
      powerSelect.addEventListener("change", (e) => {
        state.filter.power = e.target.value;
        renderPool();
      });
    }

    // Portrait Only Checkbox
    const portraitCheck = document.getElementById("tlPortraitOnlyCheck");
    if (portraitCheck) {
      portraitCheck.addEventListener("change", (e) => {
        state.filter.portraitOnly = e.target.checked;
        renderPool();
      });
    }

    // Scheme Buttons
    initSchemeButtons();

    // Custom Editable Title
    initCustomTitle();

    // Pool section dropzone (allow dragging characters back to pool)
    const poolSection = document.getElementById("unrankedPoolSection");
    if (poolSection) {
      poolSection.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        poolSection.classList.add("pool-drag-over");
      });

      poolSection.addEventListener("dragleave", (e) => {
        if (!poolSection.contains(e.relatedTarget)) {
          poolSection.classList.remove("pool-drag-over");
        }
      });

      poolSection.addEventListener("drop", (e) => {
        e.preventDefault();
        poolSection.classList.remove("pool-drag-over");
        const charId = state.draggedCharId || e.dataTransfer.getData("text/plain");
        if (charId) {
          moveCharacterToUnranked(charId);
        }
      });
    }
  }

  // ==================== DOM READY ====================
  document.addEventListener("DOMContentLoaded", () => {
    initData();
    bindToolbarControls();
    bindModalEvents();
    renderAll();
  });
})();
