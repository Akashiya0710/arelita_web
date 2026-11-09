(() => {
    // Run 100,000 single draws using the real drawOneSummonedCharacter function in summon.js
    // Note: drawOneSummonedCharacter is inside an IIFE, but we can evaluate the baseGachaWeights
    // or test the actual draws if available on window or by reconstructing the exact draw loop.
    
    // Check characters on window
    const chars = window.ARELITA_DATA.characters;
    
    // We can inspect the DOM element #poolTierBreakdown
    const breakdownPills = Array.from(document.querySelectorAll("#poolTierBreakdown .pool-tier-pill")).map(p => ({
        code: p.querySelector("b")?.textContent,
        pct: p.querySelector("em")?.textContent,
        title: p.getAttribute("title")
    }));

    // Check modal rates in #tierGuideGrid
    const modalCards = Array.from(document.querySelectorAll("#tierGuideGrid .tier-guide-card")).map(c => ({
        tierCode: c.querySelector(".tgc-tier-code")?.textContent,
        rateTag: c.querySelector(".tgc-rate-tag")?.textContent,
        stars: c.querySelector(".tgc-stars")?.textContent,
        title: c.querySelector(".tgc-title")?.textContent
    }));

    // Verify rate sums:
    // ? (lvl 8): 0.2%
    // Legend (lvl 7): 0.4%
    // EX (lvl 6): 0.8%
    // UR (lvl 5): 2.5%
    // SSR (lvl 4): 7.5%
    // SR (lvl 3): 20.0%
    // R (lvl 2): 33.0%
    // N (lvl 1): 35.6%
    const expectedRates = {
        8: 0.002, // 0.2%
        7: 0.004, // 0.4%
        6: 0.008, // 0.8%
        5: 0.025, // 2.5%
        4: 0.075, // 7.5%
        3: 0.200, // 20.0%
        2: 0.330, // 33.0%
        1: 0.356  // 35.6%
    };

    let totalExpectedRate = Object.values(expectedRates).reduce((a, b) => a + b, 0);

    return {
        breakdownPills,
        modalCards,
        totalExpectedRate: totalExpectedRate.toFixed(4)
    };
})()
