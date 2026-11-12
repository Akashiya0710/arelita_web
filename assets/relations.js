/**
 * ARELITA CHARACTER RELATIONSHIP ATLAS APP
 * Ultra-smooth, jitter-free interactive constellation with D3-style damping
 */

(function () {
  "use strict";

  // Check data
  const relData = window.ARELITA_RELATIONS;
  if (!relData || !relData.nodes) {
    console.error("ARELITA_RELATIONS data not found.");
    return;
  }

  const nodes = relData.nodes;
  const links = relData.links;

  // Build lookup maps
  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));
  nodes.forEach((n) => nodeMap.set(n.name, n));

  const linkMap = new Map();
  nodes.forEach((n) => linkMap.set(n.id, []));

  links.forEach((l) => {
    const sId = l.source;
    const tId = l.target;
    if (linkMap.has(sId)) linkMap.get(sId).push(l);
    if (linkMap.has(tId)) linkMap.get(tId).push(l);
  });

  // Sound Synthesizer (Web Audio API) with strict throttling to prevent stuttering
  let audioCtx = null;
  let lastToneTimestamp = 0;

  function playTone(freq, type = "sine", duration = 0.1, vol = 0.05) {
    const now = Date.now();
    if (now - lastToneTimestamp < 110) return; // Debounce audio clicks
    lastToneTimestamp = now;

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function sfxClick() { playTone(540, "sine", 0.07, 0.04); }
  function sfxSelect() { playTone(680, "triangle", 0.12, 0.05); }

  // Color mapping
  const REL_COLORS = {
    family: "#ef4444",
    superior: "#eab308",
    comrade: "#06b6d4",
    ally: "#10b981",
    rival: "#a855f7",
    romance: "#ec4899",
    master: "#f97316",
    default: "#64748b"
  };

  const REALM_COLORS = {
    "現界": "#10b981",
    "魔界": "#8b5cf6",
    "天界": "#eab308",
    "冥界": "#06b6d4",
    "幻想界": "#ec4899",
    "其他": "#f43f5e"
  };

  /* ==================== GRAPH VIEW CONTROLLER ==================== */
  const canvas = document.getElementById("relationsCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = canvas.parentElement.clientWidth || 1200;
  let height = canvas.parentElement.clientHeight || 750;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Physics Nodes Simulation Setup
  const simNodes = nodes.map((n, i) => {
    // Spatial clustering based on Realm & Faction
    let cx = width / 2;
    let cy = height / 2;
    const r = 260 + (i % 6) * 45;
    const angle = (i / nodes.length) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);

    if (n.faction === "魔風聯邦") {
      cx = width * 0.44;
      cy = height * 0.48;
    } else if (n.faction === "神明" || n.realm === "其他") {
      cx = width * 0.74;
      cy = height * 0.35;
    } else if (n.faction === "極真圃" || n.faction === "月星民國") {
      cx = width * 0.25;
      cy = height * 0.72;
    } else if (n.faction === "影風之巔" || n.faction === "寂靜之音") {
      cx = width * 0.76;
      cy = height * 0.74;
    } else if (n.realm === "天界") {
      cx = width * 0.5;
      cy = height * 0.18;
    }

    const isHighTier = n.power && (n.power.includes("終世") || n.power.includes("降臨") || n.power.includes("神王") || n.power.includes("古神"));

    return {
      id: n.id,
      name: n.name,
      raw: n,
      x: cx + Math.cos(angle) * (r * 0.65),
      y: cy + Math.sin(angle) * (r * 0.65),
      vx: 0,
      vy: 0,
      radius: isHighTier ? 12 : 8
    };
  });

  const simNodeMap = new Map();
  simNodes.forEach((sn) => simNodeMap.set(sn.id, sn));

  const simLinks = links.map((l) => ({
    source: simNodeMap.get(l.source),
    target: simNodeMap.get(l.target),
    raw: l
  })).filter((sl) => sl.source && sl.target);

  // Camera State with smooth lerp
  let camera = { x: 0, y: 0, zoom: 0.95 };
  let targetCamera = { x: 0, y: 0, zoom: 0.95 };

  let isDragging = false;
  let dragNode = null;
  let lastMouse = { x: 0, y: 0 };
  let mouseDownScreen = { x: 0, y: 0 };
  let isActualDrag = false;
  let hoveredNode = null;
  let selectedNode = null;

  // D3-style Alpha cooling to guarantee complete stillness once equilibrium is reached
  let simAlpha = 1.0;

  // Resize handler
  function handleResize() {
    if (!canvas || !canvas.parentElement) return;
    const newW = canvas.parentElement.clientWidth;
    const newH = canvas.parentElement.clientHeight;
    if (newW <= 0 || newH <= 0) return;
    width = newW;
    height = newH;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", handleResize);

  // Physics step with force clamping
  function stepPhysics() {
    if (simAlpha < 0.003) return; // Completely still, zero CPU consumption

    const kRepel = 2200;
    const kSpring = 0.035;
    const centerPull = 0.001;

    // Node repulsion
    for (let i = 0; i < simNodes.length; i++) {
      const a = simNodes[i];
      for (let j = i + 1; j < simNodes.length; j++) {
        const b = simNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy + 1;
        if (distSq < 150000) {
          const dist = Math.sqrt(distSq);
          const force = Math.min(kRepel / distSq, 6) * simAlpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }
    }

    // Link spring attraction
    for (let i = 0; i < simLinks.length; i++) {
      const l = simLinks[i];
      const a = l.source;
      const b = l.target;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 95;
      const force = Math.min((dist - targetDist) * kSpring, 6) * simAlpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Centering & Damping
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i];
      if (n === dragNode) continue;
      n.vx += (cx - n.x) * centerPull * simAlpha;
      n.vy += (cy - n.y) * centerPull * simAlpha;
      n.vx = Math.max(-6, Math.min(6, n.vx * 0.86));
      n.vy = Math.max(-6, Math.min(6, n.vy * 0.86));
      n.x += n.vx;
      n.y += n.vy;
    }

    simAlpha *= 0.96;
  }

  // Pre-warm physics simulation 140 iterations so it is already stabilized at page open
  for (let warm = 0; warm < 140; warm++) {
    stepPhysics();
  }

  // Active filter state
  let filterRealm = "all";
  let filterRelType = "all";

  // Draw loop
  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply camera transform
    ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-width / 2, -height / 2);

    // Active highlighted nodes set
    const activeNodeIds = new Set();
    const activeLinkSet = new Set();

    if (selectedNode) {
      activeNodeIds.add(selectedNode.id);
      const connected = linkMap.get(selectedNode.id) || [];
      connected.forEach((l) => {
        activeNodeIds.add(l.source);
        activeNodeIds.add(l.target);
      });
      simLinks.forEach((sl) => {
        if (sl.source.id === selectedNode.id || sl.target.id === selectedNode.id) {
          activeLinkSet.add(sl);
        }
      });
    }

    // Filter by relType if set
    if (filterRelType !== "all") {
      simLinks.forEach((sl) => {
        if (sl.raw.type === filterRelType) {
          activeLinkSet.add(sl);
          activeNodeIds.add(sl.source.id);
          activeNodeIds.add(sl.target.id);
        }
      });
    }

    // Draw Links
    simLinks.forEach((sl) => {
      const matchType = filterRelType === "all" || sl.raw.type === filterRelType;
      const isHighlighted = activeLinkSet.has(sl) || (filterRelType !== "all" && matchType);
      const isDimmed = (selectedNode && !isHighlighted) || (filterRelType !== "all" && !matchType);
      const color = REL_COLORS[sl.raw.type] || REL_COLORS.default;

      ctx.beginPath();
      ctx.moveTo(sl.source.x, sl.source.y);
      ctx.lineTo(sl.target.x, sl.target.y);
      ctx.lineWidth = isHighlighted ? 2.8 : 1;
      ctx.strokeStyle = isDimmed ? "rgba(255,255,255,0.03)" : isHighlighted ? color : "rgba(255,255,255,0.18)";
      ctx.stroke();

      // If highlighted, draw label in the middle
      if (isHighlighted) {
        const mx = (sl.source.x + sl.target.x) / 2;
        const my = (sl.source.y + sl.target.y) / 2;
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.fillText(sl.raw.label || sl.raw.type, mx, my - 4);
      }
    });

    // Draw Nodes
    simNodes.forEach((sn) => {
      const matchRealm = filterRealm === "all" || sn.raw.realm === filterRealm;
      const matchRel = filterRelType === "all" || activeNodeIds.has(sn.id);
      const isSel = selectedNode && selectedNode.id === sn.id;
      const isNeighbor = selectedNode && activeNodeIds.has(sn.id);
      const isDimmed = (!matchRealm) || (!matchRel) || (selectedNode && !isNeighbor && !isSel);
      const isHov = hoveredNode && hoveredNode.id === sn.id;

      const realmColor = REALM_COLORS[sn.raw.realm] || "#38bdf8";

      // Glow effect for selected or hovered
      if (isSel || isHov) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, sn.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? "rgba(234, 179, 8, 0.4)" : "rgba(56, 189, 248, 0.4)";
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(sn.x, sn.y, sn.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? "rgba(30, 41, 59, 0.4)" : realmColor;
      ctx.fill();

      ctx.lineWidth = isSel ? 3 : 1.5;
      ctx.strokeStyle = isSel ? "#fde047" : isDimmed ? "rgba(255,255,255,0.1)" : "#ffffff";
      ctx.stroke();

      // Node Label
      const showLabel = isSel || isNeighbor || isHov || camera.zoom > 0.95 || (sn.radius > 10 && camera.zoom > 0.6);
      if (showLabel) {
        ctx.font = isSel ? "bold 12px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isDimmed ? "rgba(148, 163, 184, 0.3)" : isSel ? "#fde047" : "#e2e8f0";
        ctx.textAlign = "center";
        ctx.fillText(sn.name, sn.x, sn.y + sn.radius + 12);
      }
    });

    ctx.restore();
  }

  // Animation Loop with smooth Camera Lerp
  function loop() {
    stepPhysics();

    // Lerp camera for silky smooth glide
    camera.x += (targetCamera.x - camera.x) * 0.16;
    camera.y += (targetCamera.y - camera.y) * 0.16;
    camera.zoom += (targetCamera.zoom - camera.zoom) * 0.16;

    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ==================== MOUSE / TOUCH EVENTS ==================== */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const worldX = (mx - (width / 2 + camera.x)) / camera.zoom + width / 2;
    const worldY = (my - (height / 2 + camera.y)) / camera.zoom + height / 2;
    return { x: worldX, y: worldY, screenX: mx, screenY: my };
  }

  function findNodeAt(worldX, worldY) {
    for (let i = simNodes.length - 1; i >= 0; i--) {
      const n = simNodes[i];
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      if (dx * dx + dy * dy <= (n.radius + 7) * (n.radius + 7)) {
        return n;
      }
    }
    return null;
  }

  canvas.addEventListener("mousedown", (e) => {
    mouseDownScreen = { x: e.clientX, y: e.clientY };
    isActualDrag = false;
    const pos = getMousePos(e);
    const clickedNode = findNodeAt(pos.x, pos.y);
    if (clickedNode) {
      dragNode = clickedNode;
      simAlpha = 0.15;
    } else {
      isDragging = true;
      lastMouse = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener("mousemove", (e) => {
    const distMoved = Math.hypot(e.clientX - mouseDownScreen.x, e.clientY - mouseDownScreen.y);
    if (distMoved > 4) isActualDrag = true;

    if (dragNode) {
      const pos = getMousePos(e);
      dragNode.x = pos.x;
      dragNode.y = pos.y;
      dragNode.vx = 0;
      dragNode.vy = 0;
      simAlpha = 0.1;
    } else if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      targetCamera.x += dx;
      targetCamera.y += dy;
      camera.x += dx;
      camera.y += dy;
      lastMouse = { x: e.clientX, y: e.clientY };
    } else {
      const pos = getMousePos(e);
      const node = findNodeAt(pos.x, pos.y);
      if (node !== hoveredNode) {
        hoveredNode = node;
        canvas.style.cursor = node ? "pointer" : "grab";
      }
    }
  });

  window.addEventListener("mouseup", () => {
    if (dragNode && !isActualDrag) {
      // It was a crisp click, open dossier & focus
      selectCharacter(dragNode.raw);
      focusOnCharacter(dragNode.raw);
    }
    dragNode = null;
    isDragging = false;
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    targetCamera.zoom = Math.max(0.25, Math.min(3.5, targetCamera.zoom * zoomFactor));
  }, { passive: false });

  // Camera smooth glide to character
  function focusOnCharacter(charObj) {
    const sn = simNodeMap.get(charObj.id);
    if (!sn) return;
    selectedNode = sn;
    targetCamera.zoom = 1.35;
    targetCamera.x = -(sn.x - width / 2) * targetCamera.zoom;
    targetCamera.y = -(sn.y - height / 2) * targetCamera.zoom;
  }

  /* ==================== DOSSIER DRAWER ==================== */
  const drawer = document.getElementById("dossierDrawer");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  function selectCharacter(charObj) {
    if (!charObj) return;
    sfxSelect();
    const sn = simNodeMap.get(charObj.id);
    selectedNode = sn;

    // Fill Dossier Details
    document.getElementById("dossierName").textContent = charObj.name;
    document.getElementById("dossierTitle").textContent = charObj.title || "魔風要員";

    // Avatar
    const avatarBox = document.getElementById("dossierAvatar");
    if (charObj.image) {
      avatarBox.innerHTML = `<img src="${charObj.image}" alt="${charObj.name}">`;
    } else {
      avatarBox.innerHTML = `<span>${charObj.name.charAt(0)}</span>`;
    }

    // Badges (Clan badge removed as requested)
    const badgesBox = document.getElementById("dossierBadges");
    badgesBox.innerHTML = `
      <span class="meta-pill meta-pill-gold">${charObj.power || "未評定"}</span>
      <span class="meta-pill">${charObj.realm || "現界"}</span>
      <span class="meta-pill">${charObj.faction || "無陣營"}${charObj.subFaction ? " / " + charObj.subFaction : ""}</span>
      <span class="meta-pill">${charObj.race || "未知種族"}</span>
    `;

    // Relations list
    const relsBox = document.getElementById("dossierRelationsList");
    const charLinks = linkMap.get(charObj.id) || [];
    if (charLinks.length === 0) {
      relsBox.innerHTML = `<div style="font-size:0.82rem; color:#94a3b8;">暫無登錄之特定羈絆關係（同陣營共事）</div>`;
    } else {
      relsBox.innerHTML = charLinks.map((l) => {
        const isSource = l.source === charObj.id;
        const targetId = isSource ? l.target : l.source;
        const targetName = isSource ? l.targetName : l.sourceName;
        return `
          <div class="rel-item-card type-${l.type}" data-target-id="${targetId}">
            <div class="rel-item-top">
              <span class="rel-item-target">${targetName}</span>
              <span class="rel-item-badge">${l.label || l.type}</span>
            </div>
            <div class="rel-item-desc">${l.desc || "陣營夥伴"}</div>
          </div>
        `;
      }).join("");

      // Clicking related card jumps to that character
      relsBox.querySelectorAll(".rel-item-card").forEach((card) => {
        card.addEventListener("click", () => {
          const tId = card.getAttribute("data-target-id");
          const targetChar = nodeMap.get(tId);
          if (targetChar) {
            selectCharacter(targetChar);
            focusOnCharacter(targetChar);
          }
        });
      });
    }

    // Story / Excerpt
    const storyBox = document.getElementById("dossierStory");
    storyBox.textContent = charObj.story ? charObj.story.slice(0, 320) + (charObj.story.length > 320 ? "..." : "") : "暫無背景故事記錄。";

    drawer.classList.add("open");
  }

  drawerCloseBtn.addEventListener("click", () => {
    sfxClick();
    drawer.classList.remove("open");
    selectedNode = null;
  });

  /* ==================== CONTROLS & FILTERS ==================== */
  const searchInput = document.getElementById("graphSearchInput");
  const realmFilter = document.getElementById("graphRealmFilter");
  const relFilter = document.getElementById("graphRelFilter");
  const btnResetGraph = document.getElementById("btnResetGraph");
  const btnZoomIn = document.getElementById("btnZoomIn");
  const btnZoomOut = document.getElementById("btnZoomOut");

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    const match = nodes.find((n) => n.name.toLowerCase().includes(q) || (n.title && n.title.toLowerCase().includes(q)));
    if (match) {
      selectCharacter(match);
      focusOnCharacter(match);
    }
  });

  if (realmFilter) {
    realmFilter.addEventListener("change", (e) => {
      sfxClick();
      filterRealm = e.target.value;
    });
  }

  if (relFilter) {
    relFilter.addEventListener("change", (e) => {
      sfxClick();
      filterRelType = e.target.value;
    });
  }

  btnResetGraph.addEventListener("click", () => {
    sfxClick();
    targetCamera.x = 0;
    targetCamera.y = 0;
    targetCamera.zoom = 0.95;
    selectedNode = null;
    drawer.classList.remove("open");
  });

  btnZoomIn.addEventListener("click", () => {
    sfxClick();
    targetCamera.zoom = Math.min(3.5, targetCamera.zoom * 1.25);
  });

  btnZoomOut.addEventListener("click", () => {
    sfxClick();
    targetCamera.zoom = Math.max(0.3, targetCamera.zoom * 0.8);
  });

  /* ==================== VIEW TABS SWITCHER (CLANS REMOVED) ==================== */
  const tabBtns = document.querySelectorAll(".rel-tab-btn");
  const viewPanels = document.querySelectorAll(".rel-view-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sfxClick();
      const tabKey = btn.getAttribute("data-view");
      tabBtns.forEach((b) => b.classList.remove("active"));
      viewPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(`view-${tabKey}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
        if (tabKey === "graph") handleResize();
      }
    });
  });

  /* ==================== HIERARCHY TREE BUILDER ==================== */
  function renderHierarchy() {
    const wrap = document.getElementById("treeViewContent");
    if (!wrap) return;

    // Federal Supreme 4
    const supremeNames = ["赤夜 風竹", "阿撒托斯 阿斯拉 凱撒", "索亞德 托斯卡 撒旦", "銀 塵夜"];
    const supremeCards = supremeNames.map((name) => nodeMap.get(name)).filter(Boolean);

    // 9 Minfu
    const minfuNames = [
      "黑卡蒂 拉普拉斯", "克蘭努克 歐塔", "艾琳絲塔希 康多拉",
      "福玻斯 里拉 阿斯克勒", "涅米蘿伊 贊恩斯", "莎布西絲 貝西卡",
      "格赫羅 阿斯拉 凱撒", "凜子 歐斯拉 時空", "青 黎"
    ];
    const minfuCards = minfuNames.map((name) => nodeMap.get(name)).filter(Boolean);

    // 8 Generals
    const generalNames = [
      "雷風 克斯拉 修羅", "烈火 艾克斯 修羅", "雷格納 尼達羅斯", "蘿雅絲 瑟 阿爾法",
      "水無月 夜風", "倷德 歐斯拉 卡迦", "凌音 凜", "星野 晴奈"
    ];
    const generalCards = generalNames.map((name) => nodeMap.get(name)).filter(Boolean);

    // Specials
    const specialNames = ["赤夜 花幽", "艾娜托斯 阿斯拉 凱撒", "白雪 悠", "寺山 夜明", "傑瑞 吳 阿爾法", "月夜", "星野 蒼空"];
    const specialCards = specialNames.map((name) => nodeMap.get(name)).filter(Boolean);

    // Security & Inspection
    const secNames = ["炎火 加拉爾", "憂娜 加拉爾", "鹿苑寺 照寺", "秦 雲平", "芙拉達 莎德琺"];
    const secCards = secNames.map((name) => nodeMap.get(name)).filter(Boolean);

    function createCard(c, subLabel) {
      return `
        <div class="tree-char-card" data-char-id="${c.id}">
          <div class="tree-card-top">
            <div class="tree-card-avatar">
              ${c.image ? `<img src="${c.image}" alt="${c.name}">` : `<span>${c.name.charAt(0)}</span>`}
            </div>
            <div class="tree-card-info">
              <div class="tree-card-name">${c.name}</div>
              <div class="tree-card-role">${subLabel || c.title || "魔風核心"}</div>
            </div>
          </div>
          <div class="tree-card-desc">${c.title || ""}</div>
          <div class="tree-unit-badges">
            <span class="meta-pill meta-pill-gold">${c.power}</span>
            <span class="meta-pill">${c.race || "生靈"}</span>
          </div>
        </div>
      `;
    }

    wrap.innerHTML = `
      <section>
        <div class="tree-section-header">
          <div class="tree-section-title"><span>👑</span> 魔風聯邦最高指揮樞紐（4 位核心執掌者）</div>
        </div>
        <div class="tree-card-grid">
          ${supremeCards.map((c) => createCard(c, c.name.includes("風竹") ? "最高總司令" : c.name.includes("阿撒托斯") ? "副總司令" : c.name.includes("索亞德") ? "總參謀長" : "司令秘書")).join("")}
        </div>
      </section>

      <section>
        <div class="tree-section-header">
          <div class="tree-section-title"><span>🗡️</span> 赤夜風竹專屬直轄部隊【冥府神傑】（9 席次）</div>
        </div>
        <div class="tree-card-grid">
          ${minfuCards.map((c, idx) => createCard(c, `第 ${idx + 1} 傑`)).join("")}
        </div>
      </section>

      <section>
        <div class="tree-section-header">
          <div class="tree-section-title"><span>🛡️</span> 正規軍團八大部隊大將軍（守護八大直轄都市）</div>
        </div>
        <div class="tree-card-grid">
          ${generalCards.map((c) => createCard(c, c.subFaction || "正規軍團將軍")).join("")}
        </div>
      </section>

      <section>
        <div class="tree-section-header">
          <div class="tree-section-title"><span>⚡</span> 獨立特級戰力（特許單獨行動）</div>
        </div>
        <div class="tree-card-grid">
          ${specialCards.map((c) => createCard(c, "獨立特級")).join("")}
        </div>
      </section>

      <section>
        <div class="tree-section-header">
          <div class="tree-section-title"><span>⚖️</span> 監察、對策、公安與審判司長</div>
        </div>
        <div class="tree-card-grid">
          ${secCards.map((c) => createCard(c, c.faction + (c.subFaction ? " / " + c.subFaction : ""))).join("")}
        </div>
      </section>
    `;

    wrap.querySelectorAll(".tree-char-card").forEach((card) => {
      card.addEventListener("click", () => {
        const cId = card.getAttribute("data-char-id");
        const charObj = nodeMap.get(cId);
        if (charObj) selectCharacter(charObj);
      });
    });
  }

  /* ==================== MATRIX TABLE BUILDER ==================== */
  function renderMatrix() {
    const tableBody = document.getElementById("matrixTableBody");
    const searchBox = document.getElementById("matrixSearchInput");
    if (!tableBody) return;

    function buildRows(filterText = "") {
      const q = filterText.toLowerCase();
      const filtered = nodes.filter((n) => {
        if (!q) return true;
        return n.name.toLowerCase().includes(q) ||
               (n.title && n.title.toLowerCase().includes(q)) ||
               (n.faction && n.faction.toLowerCase().includes(q));
      });

      tableBody.innerHTML = filtered.map((n) => {
        const charLinks = linkMap.get(n.id) || [];
        const pills = charLinks.slice(0, 4).map((l) => {
          const targetName = l.source === n.id ? l.targetName : l.sourceName;
          return `<span class="matrix-rel-pill" data-target-name="${targetName}">${targetName} (${l.label})</span>`;
        }).join("");

        return `
          <tr>
            <td>
              <div class="matrix-char-cell" style="cursor:pointer;" data-char-id="${n.id}">
                <span>${n.name}</span>
              </div>
            </td>
            <td>${n.realm} / ${n.faction}${n.subFaction ? " / " + n.subFaction : ""}</td>
            <td><span class="meta-pill meta-pill-gold">${n.power}</span></td>
            <td>${pills || `<span style="color:#64748b; font-size:0.75rem;">同陣營軍袍</span>`}</td>
            <td>
              <button type="button" class="graph-tool-btn" data-locate-id="${n.id}">星圖定位</button>
            </td>
          </tr>
        `;
      }).join("");

      tableBody.querySelectorAll(".matrix-char-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          const cId = cell.getAttribute("data-char-id");
          const cObj = nodeMap.get(cId);
          if (cObj) selectCharacter(cObj);
        });
      });

      tableBody.querySelectorAll("[data-locate-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const cId = btn.getAttribute("data-locate-id");
          const cObj = nodeMap.get(cId);
          if (cObj) {
            // Switch to graph tab
            document.querySelector('[data-view="graph"]').click();
            selectCharacter(cObj);
            focusOnCharacter(cObj);
          }
        });
      });

      tableBody.querySelectorAll(".matrix-rel-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          const tName = pill.getAttribute("data-target-name");
          const cObj = nodeMap.get(tName);
          if (cObj) selectCharacter(cObj);
        });
      });
    }

    buildRows();

    if (searchBox) {
      searchBox.addEventListener("input", (e) => {
        buildRows(e.target.value.trim());
      });
    }
  }

  // Initialize secondary views
  renderHierarchy();
  renderMatrix();

})();
