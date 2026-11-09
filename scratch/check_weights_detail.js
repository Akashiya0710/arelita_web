(() => {
    // Collect all characters
    const chars = window.ARELITA_DATA ? window.ARELITA_DATA.characters : [];
    
    // Test proposed getSpecialAnimVariant logic
    function testVariant(c) {
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
        return "";
    }

    const variantCounts = {};
    const variantChars = {};
    chars.forEach(c => {
        const v = testVariant(c);
        if (v) {
            variantCounts[v] = (variantCounts[v] || 0) + 1;
            if (!variantChars[v]) variantChars[v] = [];
            variantChars[v].push({ id: c.id, name: c.name, power: c.power });
        }
    });

    // Check gjallar characters specifically with testVariant
    const gjallarResults = chars.filter(c => (c.name || '').includes('加拉爾')).map(c => ({
        id: c.id,
        name: c.name,
        power: c.power,
        variant: testVariant(c)
    }));

    return {
        variantCounts,
        variantChars,
        gjallarResults
    };
})()
