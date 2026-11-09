(() => {
    // 1. Inspect all 175 characters and their actual specialAnimVariant assigned by summon.js
    const chars = window.ARELITA_DATA.characters;
    
    // Check characters with 加拉爾
    const gjallarChars = chars.filter(c => (c.name || '').includes('加拉爾')).map(c => ({
        id: c.id,
        name: c.name,
        power: c.power,
        tier: c.summonTier ? c.summonTier.code : 'UNKNOWN',
        specialVariant: c.specialAnimVariant || ''
    }));

    // Collect all characters with a specialAnimVariant
    const bespokeMap = {};
    chars.forEach(c => {
        const v = c.specialAnimVariant || '';
        if (v) {
            if (!bespokeMap[v]) bespokeMap[v] = [];
            bespokeMap[v].push({ id: c.id, name: c.name, power: c.power, tier: c.summonTier ? c.summonTier.code : '' });
        }
    });

    // 2. Check probabilities and perform 100,000 draws
    const pullsCount = 100000;
    const tierDrawCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    
    // Build candidate weight list exactly as summon.js does
    let totalWeight = 0;
    for (const c of chars) {
        totalWeight += (c.baseGachaWeight || 1);
    }

    for (let p = 0; p < pullsCount; p++) {
        let roll = Math.random() * totalWeight;
        for (let i = 0; i < chars.length; i++) {
            roll -= (chars[i].baseGachaWeight || 1);
            if (roll <= 0) {
                const lvl = chars[i].summonTier ? chars[i].summonTier.level : 1;
                tierDrawCounts[lvl]++;
                break;
            }
        }
    }

    const empiricalRates = {};
    for (let l = 1; l <= 8; l++) {
        empiricalRates[l] = {
            count: tierDrawCounts[l],
            empiricalPct: ((tierDrawCounts[l] / pullsCount) * 100).toFixed(2) + '%'
        };
    }

    // Breakdown pills
    const breakdownPills = Array.from(document.querySelectorAll("#poolTierBreakdown .pool-tier-pill")).map(p => ({
        code: p.querySelector("b")?.textContent,
        pct: p.querySelector("em")?.textContent,
        title: p.getAttribute("title")
    }));

    return {
        totalCharacters: chars.length,
        gjallarChars,
        bespokeMap,
        empiricalRates,
        breakdownPills
    };
})()
