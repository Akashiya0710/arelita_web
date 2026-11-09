(() => {
    const chars = window.ARELITA_DATA ? window.ARELITA_DATA.characters : [];

    const getMatches = (predicate) => chars.filter(predicate).map(c => ({ id: c.id, name: c.name, power: c.power }));

    return {
        totalCharacters: chars.length,
        // Check keywords
        gjallarChars: getMatches(c => (c.name || '').includes('加拉爾')),
        ignalionChars: getMatches(c => (c.name || '').includes('伊格那利昂')),
        warriorChars: getMatches(c => (c.name || '').includes('沃利爾')),
        demaChars: getMatches(c => (c.name || '').includes('德瑪')),
        skadiChars: getMatches(c => (c.name || '').includes('斯卡奇')),
        beelzebubChars: getMatches(c => (c.name || '').includes('別西卜')),
        asuraChars: getMatches(c => (c.name || '').includes('阿斯拉')),
        satanChars: getMatches(c => (c.name || '').includes('撒旦')),
        nyxChars: getMatches(c => (c.name || '').includes('倪克斯')),
        eunoraChars: getMatches(c => (c.name || '').includes('尤諾拉')),
        hemeraChars: getMatches(c => (c.name || '').includes('赫墨拉')),
        diminoraChars: getMatches(c => (c.name || '').includes('迪米諾拉')),
        hecateChars: getMatches(c => (c.name || '').includes('黑卡蒂')),
        sethChars: getMatches(c => (c.name || '').includes('賽特')),
        lyciaChars: getMatches(c => /莉琪雅|利棋雅|神隱/.test(c.name || '')),
        dragonChars: getMatches(c => (c.name || '').includes('終焉龍')),
    };
})()
