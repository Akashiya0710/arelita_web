/**
 * 亞雷利塔・單人角色關係圖譜 (CHARACTER RELATIONSHIP VIEWER)
 * - Zero idle CPU/GPU usage: On-demand Canvas rendering (no continuous requestAnimationFrame loop)
 * - Spacious Radial Layout: Clean spoke lines + unified Node Cards with wrapped relationship text
 * - Strict 1-to-1 Manual View by default (Incoming mentions toggleable, off by default)
 */
(function () {
    const RAW_DATA = window.ARELITA_RELATIONS || window.ARELITA_RELATIONS_DATA || window.RELATIONS_DATA;
    if (!RAW_DATA) {
        console.error('ARELITA_RELATIONS not found.');
        return;
    }

    // Relationship Type Config & Color Mapping
    const RELATION_CONFIG = {
        romance: {
            color: '#ec4899',       // 櫻花浪漫粉紅
            label: '戀愛羈絆',
            badgeBg: 'rgba(236, 72, 153, 0.18)',
            badgeText: '#f472b6'
        },
        rival: {
            color: '#ef4444',         // 敵對／死敵血紅
            label: '宿敵對立',
            badgeBg: 'rgba(239, 68, 68, 0.18)',
            badgeText: '#f87171'
        },
        family: {
            color: '#a855f7',        // 親族血脈紫
            label: '血緣親族',
            badgeBg: 'rgba(168, 85, 247, 0.18)',
            badgeText: '#c084fc'
        },
        ally: {
            color: '#38bdf8',          // 盟友／摯友亮藍
            label: '摯友同盟',
            badgeBg: 'rgba(56, 189, 248, 0.18)',
            badgeText: '#7dd3fc'
        },
        master: {
            color: '#10b981',        // 師徒／傳承翠綠
            label: '師恩傳承',
            badgeBg: 'rgba(16, 185, 129, 0.18)',
            badgeText: '#34d399'
        },
        superior: {
            color: '#6366f1',      // 主從／統御深靛藍
            label: '主從統御',
            badgeBg: 'rgba(99, 102, 241, 0.18)',
            badgeText: '#818cf8'
        },
        comrade: {
            color: '#14b8a6',       // 戰友／同袍青綠
            label: '同袍戰友',
            badgeBg: 'rgba(20, 184, 166, 0.18)',
            badgeText: '#2dd4bf'
        },
        other: {
            color: '#94a3b8',         // 中性灰
            label: '人際關聯',
            badgeBg: 'rgba(148, 163, 184, 0.18)',
            badgeText: '#cbd5e1'
        }
    };

    function detectRelationType(type, label, desc) {
        const t = (type || '').toLowerCase();
        if (RELATION_CONFIG[t]) return t;

        const combined = `${label || ''} ${desc || ''}`;
        if (/愛|情|妻|夫|侶|戀|配偶|婚|雙修|喜歡|相愛/.test(combined)) return 'romance';
        if (/敵|殺|仇|恨|對立|背叛|死敵|宿敵|戰鬥狂|獵殺|反派/.test(combined)) return 'rival';
        if (/血|父|母|子|女|兄|弟|姊|妹|祖|親|生|女兒|兒子|族人|家族/.test(combined)) return 'family';
        if (/師|徒|恩|指導|傳承|受教|神言賦予/.test(combined)) return 'master';
        if (/主|從|統帥|上級|下屬|長官|部下|僕|侍|忠誠|隨從|陛下|魔皇|女帝/.test(combined)) return 'superior';
        if (/戰友|同袍|隊友|搭檔|同僚|同事|夥伴/.test(combined)) return 'comrade';
        if (/友|盟|信任|知己|好友|摯友/.test(combined)) return 'ally';
        return 'other';
    }

    function getRelationColor(relType, label, desc) {
        const finalType = detectRelationType(relType, label, desc);
        return RELATION_CONFIG[finalType] ? RELATION_CONFIG[finalType].color : '#38bdf8';
    }

    const FACTION_COLORS = {
        '魔風聯邦': '#38bdf8',
        '魔國聯邦': '#38bdf8',
        '魔風帝國': '#0ea5e9',
        '天界': '#facc15',
        '神界': '#fde047',
        '地獄': '#f87171',
        '冥界': '#a855f7',
        '血族': '#e11d48',
        '精靈': '#34d399',
        '精靈族': '#34d399',
        '龍族': '#f97316',
        '影風之巔': '#818cf8',
        '中立': '#94a3b8',
        '其他': '#64748b'
    };

    function getFactionColor(faction) {
        if (!faction) return '#38bdf8';
        if (FACTION_COLORS[faction]) return FACTION_COLORS[faction];
        for (const [k, v] of Object.entries(FACTION_COLORS)) {
            if (faction.includes(k)) return v;
        }
        return '#38bdf8';
    }

    // Normalize nodes from ARELITA_RELATIONS.nodes
    const rawNodes = RAW_DATA.nodes || RAW_DATA.characters || [];
    const CHARACTERS = rawNodes.map((n) => ({
        id: n.id,
        code: n.num || n.code || '',
        name: n.name || '',
        realm: n.realm || '',
        faction: n.faction || n.realm || '未分類',
        subFaction: n.subFaction || '',
        position: n.title || n.position || (n.subFaction ? n.subFaction : '成員'),
        powerLevel: n.power || n.powerLevel || '未知',
        race: n.race || '未知',
        gender: n.gender || '未知',
        age: n.age || '未知',
        story: n.story || '',
        relations: (n.relations || []).map((r) => ({
            targetId: r.targetId || null,
            target: r.targetName || r.rawTarget || r.target || '未知對象',
            rawTarget: r.rawTarget || r.targetName || r.target || '',
            label: r.label || '',
            type: r.type || '',
            desc: r.desc || ''
        }))
    }));

    // Build fast lookups
    const charById = new Map();
    const charByName = new Map();
    CHARACTERS.forEach((c) => {
        charById.set(c.id, c);
        charByName.set(c.name, c);
        const noSpace = c.name.replace(/\s+/g, '');
        if (!charByName.has(noSpace)) charByName.set(noSpace, c);
    });

    // Build incoming lookup (when another character B lists A in B's manual)
    const incomingByCharId = new Map();
    CHARACTERS.forEach((c) => incomingByCharId.set(c.id, []));

    CHARACTERS.forEach((srcChar) => {
        (srcChar.relations || []).forEach((rel) => {
            if (rel.targetId && incomingByCharId.has(rel.targetId) && rel.targetId !== srcChar.id) {
                incomingByCharId.get(rel.targetId).push({
                    sourceId: srcChar.id,
                    sourceName: srcChar.name,
                    sourceFaction: srcChar.faction,
                    label: rel.label || '',
                    desc: rel.desc
                });
            }
        });
    });

    // State
    let selectedCharId = null;
    let includeIncoming = false; // Default OFF so popular characters like 赤夜 風竹 are never overcrowded
    let searchQuery = '';
    let selectedFaction = 'all';

    // DOM Elements
    const charSelectorList = document.getElementById('charSelectorList');
    const charSelectorCount = document.getElementById('charSelectorCount');
    const charSearchInput = document.getElementById('charSearchInput');
    const charFactionFilter = document.getElementById('charFactionFilter');

    const egoBannerFaction = document.getElementById('egoBannerFaction');
    const egoBannerName = document.getElementById('egoBannerName');
    const egoBannerMeta = document.getElementById('egoBannerMeta');
    const egoDossierDrawer = document.getElementById('egoDossierDrawer');
    const egoDossierContent = document.getElementById('egoDossierContent');
    const egoNodeTooltip = document.getElementById('egoNodeTooltip');

    const btnToggleIncoming = document.getElementById('btnToggleIncoming');
    const btnCenterEgo = document.getElementById('btnCenterEgo');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnToggleDossier = document.getElementById('btnToggleDossier');
    const btnCloseDossier = document.getElementById('btnCloseDossier');

    // Canvas State
    const canvas = document.getElementById('egoCanvas');
    const ctx = canvas.getContext('2d');
    let width = 900;
    let height = 700;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const camera = { x: 0, y: 0, scale: 1 };
    let centerNode = null;
    let spokeNodes = [];
    let hoveredNode = null;
    let draggedNode = null;
    let dragNodeOffset = { x: 0, y: 0 };
    let isDraggingCanvas = false;
    let dragStart = { x: 0, y: 0 };
    let pointerDownPos = { x: 0, y: 0 };
    let renderPending = false;

    function scheduleRender() {
        if (!renderPending) {
            renderPending = true;
            requestAnimationFrame(() => {
                renderPending = false;
                draw();
            });
        }
    }

    // ==================== INITIALIZATION ====================
    function initFactionSelect() {
        const counts = {};
        CHARACTERS.forEach((c) => {
            counts[c.faction] = (counts[c.faction] || 0) + 1;
        });
        const factions = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        let html = `<option value="all">全部陣營 (${CHARACTERS.length})</option>`;
        factions.forEach((f) => {
            html += `<option value="${escapeHtml(f)}">${escapeHtml(f)} (${counts[f]})</option>`;
        });
        charFactionFilter.innerHTML = html;
    }

    function renderCharacterSelectorList() {
        const q = searchQuery.trim().toLowerCase();
        const filtered = CHARACTERS.filter((c) => {
            if (selectedFaction !== 'all' && c.faction !== selectedFaction) return false;
            if (!q) return true;
            return (
                c.name.toLowerCase().includes(q) ||
                (c.code || '').toLowerCase().includes(q) ||
                (c.position || '').toLowerCase().includes(q) ||
                (c.faction || '').toLowerCase().includes(q)
            );
        });

        charSelectorCount.textContent = filtered.length;

        if (filtered.length === 0) {
            charSelectorList.innerHTML = `<div style="padding:20px;text-align:center;color:#64748b;font-size:0.84rem;">找不到符合條件的角色</div>`;
            return;
        }

        charSelectorList.innerHTML = filtered
            .map((c) => {
                const isActive = c.id === selectedCharId;
                const outCount = (c.relations || []).length;
                return `
                <button type="button" class="char-list-item ${isActive ? 'active' : ''}" data-char-id="${c.id}">
                    <div class="char-item-left">
                        <span class="char-item-dot" style="background:#38bdf8;"></span>
                        <div class="char-item-info">
                            <div class="char-item-name">${escapeHtml(c.name)}</div>
                            <div class="char-item-sub">${escapeHtml(c.faction)} · ${escapeHtml(c.position || '成員')}</div>
                        </div>
                    </div>
                    <span class="char-item-badge" title="手冊關係數">${outCount}</span>
                </button>`;
            })
            .join('');
    }

    charSelectorList.addEventListener('click', (e) => {
        const btn = e.target.closest('.char-list-item');
        if (!btn) return;
        selectCharacter(btn.dataset.charId);
    });

    charSearchInput.addEventListener('input', () => {
        searchQuery = charSearchInput.value;
        renderCharacterSelectorList();
    });

    charFactionFilter.addEventListener('change', () => {
        selectedFaction = charFactionFilter.value;
        renderCharacterSelectorList();
    });

    // ==================== SELECT CHARACTER & BUILD RADIAL GRAPH ====================
    function selectCharacter(charId, autoScrollSidebar = false) {
        const charObj = charById.get(charId);
        if (!charObj) return;
        selectedCharId = charId;

        // Update active highlight in sidebar
        document.querySelectorAll('.char-list-item').forEach((el) => {
            const match = el.dataset.charId === charId;
            el.classList.toggle('active', match);
            if (match && autoScrollSidebar) {
                el.scrollIntoView({ block: 'nearest' });
            }
        });

        // Update top banner
        const fColor = getFactionColor(charObj.faction);
        egoBannerFaction.textContent = charObj.faction;
        egoBannerFaction.style.background = hexToRgba(fColor, 0.2);
        egoBannerFaction.style.color = fColor;
        egoBannerName.textContent = charObj.name;

        const ownRels = charObj.relations || [];
        const incRels = incomingByCharId.get(charId) || [];
        egoBannerMeta.textContent = `${charObj.position || '無特定職位'} ｜ 手冊記載 ${ownRels.length} 人` +
            (incRels.length > 0 ? `（另有 ${incRels.length} 人提及）` : '');

        // Build spoke list for this character
        buildEgoGraphData(charObj);

        // Render right dossier drawer content
        renderEgoDossier(charObj);

        // Fit camera and draw once
        fitCameraToGraph();
        scheduleRender();
    }

    function wrapTextLines(text, maxCharsPerLine, maxLines) {
        const clean = (text || '').replace(/\s+/g, ' ').trim();
        if (!clean) return ['—'];
        const lines = [];
        let idx = 0;
        while (idx < clean.length && lines.length < maxLines) {
            if (lines.length === maxLines - 1 && clean.length - idx > maxCharsPerLine) {
                lines.push(clean.slice(idx, idx + maxCharsPerLine - 1) + '…');
                break;
            }
            lines.push(clean.slice(idx, idx + maxCharsPerLine));
            idx += maxCharsPerLine;
        }
        return lines;
    }

    function buildEgoGraphData(charObj) {
        centerNode = {
            id: charObj.id,
            name: charObj.name,
            faction: charObj.faction,
            position: charObj.position || '',
            color: '#38bdf8',
            x: 0,
            y: 0,
            r: 48,
            isCenter: true
        };

        const mergedMap = new Map();
        const ownRels = charObj.relations || [];

        // 1. Direct manual entries (always shown, max 15)
        ownRels.forEach((rel, idx) => {
            const targetChar = rel.targetId ? charById.get(rel.targetId) : null;
            const key = targetChar ? targetChar.id : `ext_${idx}_${rel.target}`;
            const relType = detectRelationType(rel.type, rel.label, rel.desc);
            const lineColor = getRelationColor(relType, rel.label, rel.desc);

            if (mergedMap.has(key)) {
                const ex = mergedMap.get(key);
                if (rel.desc && !ex.ownDesc.includes(rel.desc)) {
                    ex.ownDesc += `；${rel.desc}`;
                }
                return;
            }
            mergedMap.set(key, {
                key,
                targetId: targetChar ? targetChar.id : null,
                name: targetChar ? targetChar.name : rel.target,
                faction: targetChar ? targetChar.faction : '手冊記載角色',
                position: targetChar ? (targetChar.position || '') : '',
                relType,
                relLabel: rel.label || RELATION_CONFIG[relType].label,
                lineColor,
                ownDesc: rel.desc,
                incomingDesc: null,
                direction: 'outgoing'
            });
        });

        // 2. Incoming mentions (only if includeIncoming is true OR character has 0 own relations like 影風之巔)
        const incomingList = incomingByCharId.get(charObj.id) || [];
        const shouldShowIncoming = includeIncoming || ownRels.length === 0;

        if (shouldShowIncoming) {
            incomingList.forEach((inc) => {
                const incRelType = detectRelationType('', inc.label, inc.desc);
                const incLineColor = getRelationColor(incRelType, inc.label, inc.desc);

                if (mergedMap.has(inc.sourceId)) {
                    const existing = mergedMap.get(inc.sourceId);
                    existing.incomingDesc = inc.desc;
                    existing.direction = 'mutual';
                } else {
                    const srcChar = charById.get(inc.sourceId);
                    mergedMap.set(inc.sourceId, {
                        key: inc.sourceId,
                        targetId: inc.sourceId,
                        name: inc.sourceName,
                        faction: inc.sourceFaction,
                        position: srcChar ? (srcChar.position || '') : '',
                        relType: incRelType,
                        relLabel: inc.label || RELATION_CONFIG[incRelType].label,
                        lineColor: incLineColor,
                        ownDesc: null,
                        incomingDesc: inc.desc,
                        direction: 'incoming'
                    });
                }
            });
        }

        const items = Array.from(mergedMap.values());
        const N = items.length;

        // Spacious Multi-Ring Spherical Layout + Collision Relaxation
        let rings = [];
        if (N <= 7) {
            rings = [{ r: 215, count: N, offset: 0 }];
        } else if (N <= 18) {
            const c1 = Math.min(7, Math.ceil(N * 0.4));
            const c2 = N - c1;
            rings = [
                { r: 210, count: c1, offset: 0 },
                { r: 365, count: c2, offset: 0.5 }
            ];
        } else if (N <= 34) {
            const c1 = 7;
            const c2 = Math.min(12, Math.ceil((N - c1) * 0.45));
            const c3 = N - c1 - c2;
            rings = [
                { r: 210, count: c1, offset: 0 },
                { r: 360, count: c2, offset: 0.5 },
                { r: 510, count: c3, offset: 0.25 }
            ];
        } else {
            const c1 = 7;
            const c2 = 12;
            const c3 = 16;
            const c4 = N - c1 - c2 - c3;
            rings = [
                { r: 210, count: c1, offset: 0 },
                { r: 360, count: c2, offset: 0.5 },
                { r: 510, count: c3, offset: 0.25 },
                { r: 660, count: c4, offset: 0.5 }
            ];
        }

        function splitSphereName(name) {
            const clean = (name || '').trim();
            if (clean.length <= 5) return [clean];
            const parts = clean.split(/\s+/);
            if (parts.length >= 2) {
                const line1 = parts[0];
                const rest = parts.slice(1).join(' ');
                const line2 = rest.length > 6 ? rest.slice(0, 5) + '…' : rest;
                return [line1, line2];
            }
            return [clean.slice(0, 5), clean.slice(5, 9) + (clean.length > 9 ? '…' : '')];
        }

        spokeNodes = items.map((item, i) => {
            let remIdx = i;
            let chosenRing = rings[rings.length - 1];
            for (const rg of rings) {
                if (remIdx < rg.count) {
                    chosenRing = rg;
                    break;
                }
                remIdx -= rg.count;
            }

            const radius = chosenRing.r;
            const angle = -Math.PI / 2 + ((remIdx + chosenRing.offset) * 2 * Math.PI) / Math.max(chosenRing.count, 1);

            const primaryDesc = item.ownDesc || `（${item.name}視角）${item.incomingDesc}`;
            const shortDesc = primaryDesc.length > 8 ? primaryDesc.slice(0, 8) + '…' : primaryDesc;

            return {
                ...item,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                r: 38,
                angle,
                radius,
                nameLines: splitSphereName(item.name),
                shortDesc,
                fullDesc: primaryDesc
            };
        });

        // Fast pairwise sphere repulsion so no two spheres or labels ever overlap
        const minNodeDist = 115;
        const minCenterDist = 155;
        for (let iter = 0; iter < 30; iter++) {
            for (let i = 0; i < spokeNodes.length; i++) {
                const a = spokeNodes[i];
                const dc = Math.hypot(a.x - centerNode.x, a.y - centerNode.y) || 1;
                if (dc < minCenterDist) {
                    const push = (minCenterDist - dc) * 0.5;
                    a.x += (a.x / dc) * push;
                    a.y += (a.y / dc) * push;
                }
                for (let j = i + 1; j < spokeNodes.length; j++) {
                    const b = spokeNodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.hypot(dx, dy) || 0.1;
                    if (dist < minNodeDist) {
                        const overlap = (minNodeDist - dist) * 0.5;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        a.x -= nx * overlap;
                        a.y -= ny * overlap;
                        b.x += nx * overlap;
                        b.y += ny * overlap;
                    }
                }
            }
        }
    }

    function fitCameraToGraph() {
        let maxExtent = 300;
        spokeNodes.forEach((n) => {
            const dist = Math.hypot(n.x, n.y) + 85;
            if (dist > maxExtent) maxExtent = dist;
        });
        const minDim = Math.min(width, height);
        camera.scale = Math.max(0.45, Math.min(1.12, (minDim * 0.45) / maxExtent));
        camera.x = 0;
        camera.y = 0;
    }

    // ==================== RENDER RIGHT DOSSIER DRAWER ====================
    function renderEgoDossier(charObj) {
        const fColor = getFactionColor(charObj.faction);
        const ownRels = charObj.relations || [];
        const incomingList = incomingByCharId.get(charObj.id) || [];

        const ownCardsHtml = ownRels.length > 0
            ? ownRels.map((rel) => {
                const targetChar = rel.targetId ? charById.get(rel.targetId) : null;
                const relType = detectRelationType(rel.type, rel.label, rel.desc);
                const rColor = getRelationColor(relType, rel.label, rel.desc);
                const rLabel = rel.label || RELATION_CONFIG[relType].label;
                const tFaction = targetChar ? targetChar.faction : '手冊記載';
                const jumpAttr = targetChar ? `data-jump-id="${targetChar.id}"` : '';
                return `
                <div class="rel-detail-card outgoing" style="border-left:3.5px solid ${rColor};" ${jumpAttr}>
                    <div class="rel-detail-header">
                        <div class="rel-detail-target">
                            <span class="char-item-dot" style="background:${rColor};"></span>
                            ${escapeHtml(rel.target)}
                            ${targetChar ? '<span style="font-size:0.7rem;color:#38bdf8;font-weight:600;">↗ 切換</span>' : ''}
                        </div>
                        <span class="rel-detail-faction" style="background:${hexToRgba(rColor, 0.16)};color:${rColor};">
                            ${escapeHtml(rLabel)} · ${escapeHtml(tFaction)}
                        </span>
                    </div>
                    <div class="rel-detail-desc">${escapeHtml(rel.desc)}</div>
                </div>`;
            }).join('')
            : `<div style="padding:12px;color:#94a3b8;font-size:0.82rem;background:#070d19;border-radius:8px;">此角色在手冊中暫無主動填寫之關係（畫布已自動顯示其他角色對其之提及）。</div>`;

        const incomingCardsHtml = incomingList.length > 0
            ? incomingList.map((inc) => {
                const incRelType = detectRelationType('', inc.label, inc.desc);
                const sColor = getRelationColor(incRelType, inc.label, inc.desc);
                const sLabel = inc.label || RELATION_CONFIG[incRelType].label;
                return `
                <div class="rel-detail-card incoming" style="border-left:3.5px dashed ${sColor};" data-jump-id="${inc.sourceId}">
                    <div class="rel-detail-header">
                        <div class="rel-detail-target">
                            <span class="char-item-dot" style="background:${sColor};"></span>
                            ${escapeHtml(inc.sourceName)}
                            <span style="font-size:0.7rem;color:#f59e0b;font-weight:600;">↗ 提及此角色</span>
                        </div>
                        <span class="rel-detail-faction" style="background:${hexToRgba(sColor, 0.16)};color:${sColor};">
                            ${escapeHtml(sLabel)} · ${escapeHtml(inc.sourceFaction)}
                        </span>
                    </div>
                    <div class="rel-detail-desc">${escapeHtml(inc.desc)}</div>
                </div>`;
            }).join('')
            : '';

        egoDossierContent.innerHTML = `
            <div class="dossier-card">
                <span class="rel-detail-faction" style="background:${hexToRgba(fColor, 0.18)};color:${fColor};">
                    ${escapeHtml(charObj.faction)}
                </span>
                <div class="dossier-char-title">${escapeHtml(charObj.name)}</div>
                <div class="dossier-char-sub">${escapeHtml(charObj.position || '無特定職位')} ｜ 編號 ${escapeHtml(charObj.code || '--')}</div>
                <div class="dossier-meta-grid">
                    <div class="dossier-meta-box">
                        <span>種族 / 性別</span>
                        <strong>${escapeHtml(charObj.race || '未知')} / ${escapeHtml(charObj.gender || '未知')}</strong>
                    </div>
                    <div class="dossier-meta-box">
                        <span>年齡 / 戰力</span>
                        <strong>${escapeHtml(charObj.age || '未知')} / ${escapeHtml(charObj.powerLevel || '未知')}</strong>
                    </div>
                </div>
            </div>

            <div class="dossier-section-title">
                <span>📌 手冊記載之關係 (${ownRels.length})</span>
                <span style="font-size:0.7rem;color:#64748b;font-weight:500;">點擊可跳轉</span>
            </div>
            <div class="rel-detail-list">
                ${ownCardsHtml}
            </div>

            ${incomingList.length > 0 ? `
                <div class="dossier-section-title" style="color:#f59e0b;margin-top:6px;">
                    <span>🔄 其他角色手冊提及 (${incomingList.length})</span>
                </div>
                <div class="rel-detail-list">
                    ${incomingCardsHtml}
                </div>
            ` : ''}

            ${charObj.story ? `
                <div class="dossier-section-title" style="margin-top:6px;">
                    <span>📜 角色背景故事節錄</span>
                </div>
                <div class="dossier-card dossier-story-text">${escapeHtml(charObj.story)}</div>
            ` : ''}
        `;

        egoDossierContent.querySelectorAll('[data-jump-id]').forEach((card) => {
            card.addEventListener('click', () => {
                const targetId = card.dataset.jumpId;
                if (targetId && charById.has(targetId)) {
                    selectCharacter(targetId, true);
                }
            });
        });
    }

    // ==================== ON-DEMAND CANVAS RENDERING ====================
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = Math.max(rect.width, 300);
        height = Math.max(rect.height, 300);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        fitCameraToGraph();
        scheduleRender();
    }

    window.addEventListener('resize', resizeCanvas);

    function screenToWorld(sx, sy) {
        return {
            x: (sx - width / 2 - camera.x) / camera.scale,
            y: (sy - height / 2 - camera.y) / camera.scale
        };
    }

    function draw() {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        if (!centerNode) {
            ctx.restore();
            return;
        }

        ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
        ctx.scale(camera.scale, camera.scale);

        // 1. Subtle radial guide rings around centerNode
        const ringRadii = new Set(spokeNodes.map((n) => n.radius));
        ctx.lineWidth = 1 / camera.scale;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.setLineDash([5, 7]);
        ringRadii.forEach((r) => {
            ctx.beginPath();
            ctx.arc(centerNode.x, centerNode.y, r, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // 2. Clean Spoke Connecting Lines (Center Sphere -> Spoke Sphere) with Relationship Colors
        spokeNodes.forEach((node) => {
            const isHovered = hoveredNode === node || draggedNode === node;
            const lineColor = node.lineColor || '#38bdf8';

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerNode.x, centerNode.y);
            ctx.lineTo(node.x, node.y);

            if (node.direction === 'incoming') {
                ctx.setLineDash([7, 5]);
                ctx.strokeStyle = isHovered ? '#ffffff' : hexToRgba(lineColor, 0.72);
            } else {
                ctx.setLineDash([]);
                ctx.strokeStyle = isHovered ? '#ffffff' : hexToRgba(lineColor, 0.88);
            }
            ctx.lineWidth = isHovered ? 3.5 : 2.2;
            ctx.stroke();
            ctx.restore();
        });

        // 3. Draw Spoke Spherical Nodes (球狀節點)
        spokeNodes.forEach((node) => {
            const isHovered = hoveredNode === node || draggedNode === node;
            const nodeColor = node.lineColor || '#38bdf8';
            const r = node.r || 38;

            // Outer Halo Ring on hover or subtle aura
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + (isHovered ? 6 : 3), 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(nodeColor, isHovered ? 0.28 : 0.12);
            ctx.fill();

            // 3D Sphere Gradient Fill
            const grad = ctx.createRadialGradient(
                node.x - r * 0.3,
                node.y - r * 0.3,
                r * 0.1,
                node.x,
                node.y,
                r
            );
            grad.addColorStop(0, isHovered ? '#233b63' : '#182a47');
            grad.addColorStop(0.7, isHovered ? '#11203a' : '#0c1629');
            grad.addColorStop(1, '#070d19');

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.lineWidth = isHovered ? 3 : 2.2;
            ctx.strokeStyle = isHovered ? '#ffffff' : nodeColor;
            ctx.stroke();

            // Character Name inside the Sphere (1 or 2 centered lines)
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = node.nameLines || [node.name];
            if (lines.length === 1) {
                ctx.font = '700 13px "Noto Sans TC", sans-serif';
                ctx.fillText(lines[0], node.x, node.y - 4);
            } else {
                ctx.font = '700 12px "Noto Sans TC", sans-serif';
                ctx.fillText(lines[0], node.x, node.y - 11);
                ctx.font = '600 10.5px "Noto Sans TC", sans-serif';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(lines[1], node.x, node.y + 4);
            }

            // Relationship Type Badge inside bottom of sphere
            ctx.font = '700 9.5px "Noto Sans TC", sans-serif';
            ctx.fillStyle = nodeColor;
            ctx.fillText(node.relLabel, node.x, node.y + r - 11);

            // Compact Relationship Description Pill directly below the sphere
            const pillW = Math.max(68, Math.min(116, node.shortDesc.length * 11.5 + 16));
            const pillH = 19;
            const px = node.x - pillW / 2;
            const py = node.y + r + 5;

            ctx.fillStyle = isHovered ? '#162847' : 'rgba(11, 19, 36, 0.92)';
            ctx.strokeStyle = hexToRgba(nodeColor, 0.55);
            ctx.lineWidth = 1.1;
            roundRect(ctx, px, py, pillW, pillH, 9);
            ctx.fill();
            ctx.stroke();

            ctx.font = '500 10.5px "Noto Sans TC", sans-serif';
            ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.shortDesc, node.x, py + pillH / 2 + 0.5);
        });

        // 4. Draw Center Hub Sphere (Selected Character)
        const cr = centerNode.r || 50;
        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, cr + 8, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(centerNode.color, 0.2);
        ctx.fill();

        const cGrad = ctx.createRadialGradient(
            centerNode.x - cr * 0.3,
            centerNode.y - cr * 0.3,
            cr * 0.1,
            centerNode.x,
            centerNode.y,
            cr
        );
        cGrad.addColorStop(0, '#1e3a5f');
        cGrad.addColorStop(0.75, '#0f172a');
        cGrad.addColorStop(1, '#080e1a');

        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, cr, 0, Math.PI * 2);
        ctx.fillStyle = cGrad;
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = centerNode.color;
        ctx.stroke();

        ctx.font = '900 14px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerNode.name, centerNode.x, centerNode.y - 7);

        ctx.font = '700 10.5px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(centerNode.faction, centerNode.x, centerNode.y + 13);

        ctx.restore();
    }

    // ==================== CANVAS INTERACTION (DRAGGABLE SPHERES + PAN/ZOOM) ====================
    function getNodeAt(wx, wy) {
        if (!centerNode) return null;
        for (let i = spokeNodes.length - 1; i >= 0; i--) {
            const n = spokeNodes[i];
            const r = n.r || 38;
            if (Math.hypot(wx - n.x, wy - n.y) <= r + 4) {
                return n;
            }
        }
        if (Math.hypot(wx - centerNode.x, wy - centerNode.y) <= (centerNode.r || 50)) {
            return centerNode;
        }
        return null;
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        pointerDownPos = { x: sx, y: sy };

        const world = screenToWorld(sx, sy);
        const hit = getNodeAt(world.x, world.y);

        if (hit) {
            draggedNode = hit;
            dragNodeOffset.x = world.x - hit.x;
            dragNodeOffset.y = world.y - hit.y;
            egoNodeTooltip.classList.add('hidden');
            canvas.style.cursor = 'grabbing';
            scheduleRender();
        } else {
            isDraggingCanvas = true;
            dragStart.x = e.clientX - camera.x;
            dragStart.y = e.clientY - camera.y;
            canvas.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        if (draggedNode) {
            const world = screenToWorld(sx, sy);
            draggedNode.x = world.x - dragNodeOffset.x;
            draggedNode.y = world.y - dragNodeOffset.y;
            scheduleRender();
            return;
        }

        if (isDraggingCanvas) {
            camera.x = e.clientX - dragStart.x;
            camera.y = e.clientY - dragStart.y;
            scheduleRender();
            return;
        }

        if (e.target !== canvas) {
            if (hoveredNode) {
                hoveredNode = null;
                egoNodeTooltip.classList.add('hidden');
                scheduleRender();
            }
            return;
        }

        const world = screenToWorld(sx, sy);
        const hit = getNodeAt(world.x, world.y);

        if (hit !== hoveredNode) {
            hoveredNode = hit;
            canvas.style.cursor = hit ? 'pointer' : 'grab';
            scheduleRender();
        }

        if (hit && !hit.isCenter) {
            const relColor = hit.lineColor || '#38bdf8';
            egoNodeTooltip.classList.remove('hidden');
            egoNodeTooltip.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px;">
                    <strong style="font-size:0.95rem;color:#ffffff;">${escapeHtml(hit.name)}</strong>
                    <span style="font-size:0.72rem;padding:2px 7px;border-radius:999px;background:${hexToRgba(relColor, 0.22)};color:${relColor};font-weight:700;">
                        ${escapeHtml(hit.relLabel || hit.faction)}
                    </span>
                </div>
                <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:6px;">${escapeHtml(hit.faction)} · ${escapeHtml(hit.position || '成員')}</div>
                ${hit.ownDesc ? `<div style="color:#e2e8f0;margin-top:4px;"><span style="color:${relColor};font-weight:700;">【${escapeHtml(centerNode.name)}手冊記載】</span><br/>${escapeHtml(hit.ownDesc)}</div>` : ''}
                ${hit.incomingDesc ? `<div style="color:#fde68a;margin-top:6px;"><span style="color:#f59e0b;font-weight:700;">【${escapeHtml(hit.name)}手冊記載】</span><br/>${escapeHtml(hit.incomingDesc)}</div>` : ''}
                <div style="margin-top:8px;font-size:0.74rem;color:#38bdf8;font-weight:700;">💡 按住可自由拖曳移動位置${hit.targetId ? ` ｜ 點擊放開可切換至「${escapeHtml(hit.name)}」` : ''}</div>
            `;
            const tx = Math.min(sx + 16, width - 350);
            const ty = Math.max(sy - 20, 65);
            egoNodeTooltip.style.left = `${Math.max(12, tx)}px`;
            egoNodeTooltip.style.top = `${ty}px`;
        } else {
            egoNodeTooltip.classList.add('hidden');
        }
    });

    window.addEventListener('mouseup', (e) => {
        const wasDraggingNode = draggedNode;
        draggedNode = null;
        isDraggingCanvas = false;

        if (e.target !== canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const moveDist = Math.hypot(sx - pointerDownPos.x, sy - pointerDownPos.y);

        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';

        if (moveDist < 6 && wasDraggingNode && !wasDraggingNode.isCenter && wasDraggingNode.targetId && charById.has(wasDraggingNode.targetId)) {
            hoveredNode = null;
            egoNodeTooltip.classList.add('hidden');
            selectCharacter(wasDraggingNode.targetId, true);
        } else {
            scheduleRender();
        }
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        camera.scale = Math.max(0.35, Math.min(2.2, camera.scale * factor));
        scheduleRender();
    }, { passive: false });

    // Topbar Controls
    btnToggleIncoming.addEventListener('click', () => {
        includeIncoming = !includeIncoming;
        btnToggleIncoming.classList.toggle('active', includeIncoming);
        btnToggleIncoming.textContent = includeIncoming ? '🔄 納入他角提及：開' : '🔄 納入他角提及：關';
        if (selectedCharId) {
            buildEgoGraphData(charById.get(selectedCharId));
            fitCameraToGraph();
            scheduleRender();
        }
    });

    btnCenterEgo.addEventListener('click', () => {
        fitCameraToGraph();
        scheduleRender();
    });

    btnZoomIn.addEventListener('click', () => {
        camera.scale = Math.min(2.2, camera.scale * 1.2);
        scheduleRender();
    });

    btnZoomOut.addEventListener('click', () => {
        camera.scale = Math.max(0.35, camera.scale / 1.2);
        scheduleRender();
    });

    btnToggleDossier.addEventListener('click', () => {
        egoDossierDrawer.classList.toggle('hidden');
    });

    btnCloseDossier.addEventListener('click', () => {
        egoDossierDrawer.classList.add('hidden');
    });

    // ==================== VIEW 2: HIERARCHY VIEW ====================
    function renderHierarchyView() {
        const container = document.getElementById('hierarchyContent');
        if (!container) return;

        const grouped = {};
        CHARACTERS.forEach((c) => {
            if (!grouped[c.faction]) grouped[c.faction] = [];
            grouped[c.faction].push(c);
        });

        const factionOrder = Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length);

        function classifyTier(c) {
            const pos = c.position || '';
            if (/魔皇|女帝|始祖|女皇|族長|教皇|首領|盟主|最高統帥|神王|主神/.test(pos)) return '👑 最高統治與領袖層';
            if (/元帥|宰相|親王|公爵|大將軍|總管|長老|樞機|聖女|軍團長|師團長|團長|局長|部長/.test(pos)) return '⚔️ 核心軍政高層與將領';
            if (/隊長|統領|分部長|幹部|護衛|祭司|騎士|小隊/.test(pos)) return '🛡️ 中堅骨幹與直屬部隊';
            return '✨ 所屬成員與關係人物';
        }

        const html = factionOrder
            .map((faction) => {
                const color = getFactionColor(faction);
                const chars = grouped[faction];
                const tiers = {
                    '👑 最高統治與領袖層': [],
                    '⚔️ 核心軍政高層與將領': [],
                    '🛡️ 中堅骨幹與直屬部隊': [],
                    '✨ 所屬成員與關係人物': []
                };
                chars.forEach((c) => tiers[classifyTier(c)].push(c));

                const tierRowsHtml = Object.entries(tiers)
                    .filter(([, list]) => list.length > 0)
                    .map(([tierName, list]) => {
                        const chips = list
                            .map((c) => `
                            <button type="button" class="hier-char-chip" data-jump-char="${c.id}">
                                <span class="char-item-dot" style="background:${color};"></span>
                                <div>
                                    <div class="chip-name">${escapeHtml(c.name)}</div>
                                    <div class="chip-pos">${escapeHtml(c.position || '成員')} · ${c.relations.length} 關係</div>
                                </div>
                            </button>`)
                            .join('');
                        return `
                        <div class="tier-row">
                            <div class="tier-label" style="border-left-color:${color};">${tierName} (${list.length})</div>
                            <div class="tier-members">${chips}</div>
                        </div>`;
                    })
                    .join('');

                return `
                <div class="faction-tier-card">
                    <div class="faction-tier-header" style="background:${hexToRgba(color, 0.1)};">
                        <h3 style="color:${color};">🏛️ ${escapeHtml(faction)}</h3>
                        <span class="count-pill">${chars.length} 位角色</span>
                    </div>
                    <div class="tier-rows">${tierRowsHtml}</div>
                </div>`;
            })
            .join('');

        container.innerHTML = html;

        container.querySelectorAll('[data-jump-char]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const cid = btn.dataset.jumpChar;
                switchView('ego');
                selectCharacter(cid, true);
            });
        });
    }

    // ==================== VIEW 3: MATRIX TABLE VIEW ====================
    let matrixFaction = 'all';
    let matrixQuery = '';

    function initMatrixView() {
        const pillsWrap = document.getElementById('matrixFactionPills');
        const searchInput = document.getElementById('matrixSearchInput');
        if (!pillsWrap || !searchInput) return;

        const counts = {};
        CHARACTERS.forEach((c) => { counts[c.faction] = (counts[c.faction] || 0) + 1; });
        const factions = ['all', ...Object.keys(counts).sort((a, b) => counts[b] - counts[a])];

        pillsWrap.innerHTML = factions
            .map((f) => `<button type="button" class="stage-ctrl-btn ${f === 'all' ? 'active' : ''}" data-mf="${escapeHtml(f)}">${f === 'all' ? '全部陣營' : escapeHtml(f)}</button>`)
            .join('');

        pillsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-mf]');
            if (!btn) return;
            matrixFaction = btn.dataset.mf;
            pillsWrap.querySelectorAll('[data-mf]').forEach((b) => b.classList.toggle('active', b === btn));
            renderMatrixTable();
        });

        searchInput.addEventListener('input', () => {
            matrixQuery = searchInput.value.trim().toLowerCase();
            renderMatrixTable();
        });

        renderMatrixTable();
    }

    function renderMatrixTable() {
        const tbody = document.getElementById('matrixTableBody');
        const statsEl = document.getElementById('matrixStatsText');
        if (!tbody) return;

        const rows = [];
        CHARACTERS.forEach((c) => {
            if (matrixFaction !== 'all' && c.faction !== matrixFaction) return;
            (c.relations || []).forEach((r) => {
                if (matrixQuery) {
                    const hay = `${c.name} ${c.faction} ${r.target} ${r.desc}`.toLowerCase();
                    if (!hay.includes(matrixQuery)) return;
                }
                rows.push({ char: c, rel: r });
            });
        });

        if (statsEl) statsEl.textContent = `共顯示 ${rows.length} 條關係紀錄`;

        const displayRows = rows.slice(0, 300);
        tbody.innerHTML = displayRows
            .map(({ char, rel }) => {
                const color = getFactionColor(char.faction);
                const targetChar = rel.targetId ? charById.get(rel.targetId) : null;
                return `
                <tr>
                    <td>
                        <button type="button" class="matrix-char-btn" data-jump-char="${char.id}">
                            ${escapeHtml(char.name)}
                        </button>
                    </td>
                    <td>
                        <span class="rel-detail-faction" style="background:${hexToRgba(color, 0.16)};color:${color};">
                            ${escapeHtml(char.faction)}
                        </span>
                    </td>
                    <td>
                        ${targetChar
                            ? `<button type="button" class="matrix-char-btn" data-jump-char="${targetChar.id}">${escapeHtml(rel.target)}</button>`
                            : `<strong>${escapeHtml(rel.target)}</strong>`}
                    </td>
                    <td>${escapeHtml(rel.desc)}</td>
                    <td>
                        <button type="button" class="action-jump-btn" data-jump-char="${char.id}">查看關係圖</button>
                    </td>
                </tr>`;
            })
            .join('');

        tbody.querySelectorAll('[data-jump-char]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const cid = btn.dataset.jumpChar;
                switchView('ego');
                selectCharacter(cid, true);
            });
        });
    }

    // ==================== VIEW TABS SWITCHING ====================
    function switchView(viewName) {
        document.querySelectorAll('#relViewTabs button').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.view === viewName);
        });
        document.querySelectorAll('.rel-view').forEach((sec) => {
            sec.classList.toggle('active', sec.id === `view-${viewName}`);
        });
        if (viewName === 'ego') {
            resizeCanvas();
        }
    }

    document.querySelectorAll('#relViewTabs button').forEach((btn) => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // ==================== THEME SELECTOR ====================
    function initThemeSelector() {
        const toggleBtn = document.getElementById('relThemeToggleBtn');
        const dropdown = document.getElementById('relThemeDropdown');
        const iconSpan = document.getElementById('relThemeIcon');
        const textSpan = document.getElementById('relThemeText');
        if (!toggleBtn || !dropdown) return;

        const themeMeta = {
            ocean: { icon: '🌊', text: '夏日海洋' },
            beach: { icon: '🏖️', text: '假日海灘' },
            bubble: { icon: '🌸', text: '粉紅櫻花' },
            worldtree: { icon: '🌳', text: '世界樹版' },
            starry: { icon: '🌌', text: '星空版本' },
            dark: { icon: '🌙', text: '黑色版本' },
            light: { icon: '☀️', text: '白色版本' }
        };

        function applyTheme(themeKey) {
            const meta = themeMeta[themeKey] || themeMeta.ocean;
            document.documentElement.setAttribute('data-theme', themeKey);
            localStorage.setItem('arelita_theme', themeKey);
            if (iconSpan) iconSpan.textContent = meta.icon;
            if (textSpan) textSpan.textContent = meta.text;
            dropdown.querySelectorAll('.theme-option-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.themeVal === themeKey);
            });
            scheduleRender();
        }

        const current = document.documentElement.getAttribute('data-theme') || 'ocean';
        applyTheme(current);

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        dropdown.querySelectorAll('.theme-option-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.themeVal;
                if (val) {
                    applyTheme(val);
                    dropdown.classList.add('hidden');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    initThemeSelector();

    // ==================== HELPERS ====================
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function hexToRgba(hex, alpha) {
        const clean = (hex || '#64748b').replace('#', '');
        const num = parseInt(clean, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ==================== BOOTSTRAP ====================
    initFactionSelect();
    renderCharacterSelectorList();
    resizeCanvas();
    renderHierarchyView();
    initMatrixView();

    // Support ?char= URL param or default to 赤夜 風竹 (or first character)
    const params = new URLSearchParams(window.location.search);
    const initialParam = params.get('char');
    let initialChar = charByName.get('赤夜 風竹') || CHARACTERS[0];
    if (initialParam) {
        if (charById.has(initialParam)) initialChar = charById.get(initialParam);
        else if (charByName.has(initialParam)) initialChar = charByName.get(initialParam);
    }
    if (initialChar) {
        selectCharacter(initialChar.id, true);
    }
})();
