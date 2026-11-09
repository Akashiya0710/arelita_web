(() => {
    // 1. Check all tiers in SUMMON_TIERS
    // 2. Count characters per tier
    // 3. Check calculated weight sum per tier
    // 4. Check if rate matches user requirements
    const chars = window.ARELITA_DATA ? window.ARELITA_DATA.characters : [];
    
    // Check tier breakdown element
    const poolEl = document.getElementById("poolTierBreakdown");
    const pills = poolEl ? Array.from(poolEl.querySelectorAll(".pool-tier-pill")).map(p => ({
        code: p.querySelector("b")?.textContent,
        pct: p.querySelector("em")?.textContent,
        title: p.getAttribute("title")
    })) : [];

    // Let us inspect characters in each tier
    const tierMap = {};
    for (let i = 1; i <= 8; i++) {
        tierMap[i] = [];
    }

    // Characters enriched in summon.js
    // We can evaluate directly from summonState or characters
    return {
        pills,
        totalCharsInDataset: chars.length
    };
})()
