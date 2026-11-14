(function () {
  "use strict";

  const DATA = window.ARELITA_DATA || { characters: [], attributeCategories: [] };
  const REL_DATA = window.ARELITA_RELATIONS_DATA || window.ARELITA_RELATIONS || { nodes: [] };
  const rawCharacters = Array.isArray(DATA.characters) ? DATA.characters : [];
  const relNodes = Array.isArray(REL_DATA.nodes) ? REL_DATA.nodes : [];

  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toArray(val) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  function cleanName(name) {
    if (!name) return "";
    return String(name).replace(/~~/g, "").trim();
  }

  function formatDisplayName(name) {
    if (!name) return "";
    return esc(name).replace(/~~([^~]+)~~/g, '<del class="strikethrough-text">$1</del>');
  }

  function normalizeName(name) {
    if (!name) return "";
    let s = String(name).replace(/[~"'“”「」『』\s・•·]/g, "").trim();
    if (s === "烈火阿斯拉修羅") return "烈火艾克斯修羅";
    return s;
  }

  function getPortraitUrl(imgPath) {
    if (!imgPath) return "";
    return String(imgPath).replace(/^亞雷利塔角色形象[\/\\]/, "assets/portraits/");
  }

  function parseAttributeTokens(rawAttr) {
    const s = String(rawAttr || "").trim();
    if (!s || s === "無" || s === "不明" || s === "未知") return [];
    return s
      .split(/[,、，\n\s]+/)
      .map((t) => t.trim())
      .filter((t) => t && t !== "無" && t !== "不明" && t !== "未知");
  }

  function getAttrBadgeStyle(attrName) {
    const n = String(attrName || "").trim();
    if (/真實|理|始源|萬物|無限|創生|時空/.test(n)) return "background:linear-gradient(135deg,#0f172a,#0284c7,#ca8a04);border-color:#fef08a;color:#ffffff;";
    if (/火|炎|焰|煉獄|岩漿|灰燼|太陽/.test(n)) return "background:linear-gradient(135deg,#9a3412,#dc2626);border-color:#fb923c;color:#fff7ed;";
    if (/冰|雪|霜/.test(n)) return "background:linear-gradient(135deg,#155e75,#0284c7);border-color:#67e8f9;color:#ecfeff;";
    if (/水|海|霧/.test(n)) return "background:linear-gradient(135deg,#1e3a8a,#2563eb);border-color:#60a5fa;color:#eff6ff;";
    if (/雷|電/.test(n)) return "background:linear-gradient(135deg,#072540,#0284c7,#eab308);border-color:#facc15;color:#fefce8;";
    if (/風|嵐|氣|妖翠/.test(n)) return "background:linear-gradient(135deg,#065f46,#059669);border-color:#34d399;color:#ecfdf5;";
    if (/草|木|樹|植物|葉|花|櫻|紫羅蘭|玫瑰|自然|生命/.test(n)) return "background:linear-gradient(135deg,#14532d,#16a34a);border-color:#86efac;color:#f0fdf4;";
    if (/光|聖|白|黎明|晨光|極光/.test(n)) return "background:linear-gradient(135deg,#854d0e,#ca8a04);border-color:#fef08a;color:#fefce8;";
    if (/暗|影|冥|夜|深淵|至淵|空洞|虛空|淵蝕|邪|死|災厄/.test(n)) return "background:linear-gradient(135deg,#1e1b4b,#581c87,#881337);border-color:#c084fc;color:#f3e8ff;";
    if (/血|猩紅|肉體|狂|殺|戰爭|破壞|毀滅|滅世/.test(n)) return "background:linear-gradient(135deg,#450a0a,#991b1b);border-color:#f87171;color:#fef2f2;";
    if (/精神|靈魂|魂|認知|幻|夢|音|言靈/.test(n)) return "background:linear-gradient(135deg,#3b0764,#701a75);border-color:#e879f9;color:#fae8ff;";
    return "background:#334155;border-color:#94a3b8;color:#f8fafc;";
  }

  // ==================== 6 SOUL AXES DEFINITIONS ====================
  // 1. benevolence (善意共情)
  // 2. order       (秩序紀律)
  // 3. social      (社交溫度)
  // 4. passion     (熱血狂氣)
  // 5. intellect   (智略洞察)
  // 6. devotion    (羈絆執著)
  const AXIS_KEYS = ["benevolence", "order", "social", "passion", "intellect", "devotion"];
  const AXIS_LABELS = {
    benevolence: "善意共情",
    order: "秩序紀律",
    social: "社交溫度",
    passion: "熱血狂氣",
    intellect: "智略洞察",
    devotion: "羈絆重情"
  };

  // ==================== TRAIT & HOBBY TAG DEFINITIONS FOR EXPLORER & MATCHING ====================
  const PERSONALITY_TAGS = [
    { id: "tsundere_gap", label: "😳 外冷內熱／反差萌／傲嬌", regex: /反差|傲嬌|口嫌體正直|外人面前.*熟人面前|私底下其實非常溫柔|看起來.*實際上|毒舌/ },
    { id: "social_master", label: "🥂 社交達人／開朗健談", regex: /社交|開朗|熱情|好聊天|和事佬|風趣|灑脫|外向|自來熟/ },
    { id: "lazy_chill", label: "☕ 隨性摸魚／慵懶大叔感", regex: /隨性|隨和|懶|摸魚|散漫|發呆|討厭麻煩|大叔|睡覺/ },
    { id: "calm_strategist", label: "♟️ 沉穩智囊／理性冷靜", regex: /沉穩|冷靜|理性|智商|智囊|謹慎|聰明|研究|萬事通|完美主義/ },
    { id: "battle_maniac", label: "⚔️ 戰鬥狂熱／武道執著", regex: /戰鬥狂|好戰|喜歡戰鬥|廝殺|劍術|習武|狂躁|不顧一切/ },
    { id: "gentle_healer", label: "🌿 溫柔包容／慈悲守護", regex: /溫柔|善良|包容|救治|救人|幫助弱小|同理心|聖母|和平|照顧/ },
    { id: "loyal_protector", label: "🛡️ 護短同伴／忠誠重義", regex: /忠誠|重情重義|保護同伴|珍惜家人|重視同伴|重視友情|忠犬|為了.*獻出一切|責任感/ },
    { id: "family_con", label: "💞 兄控／姐控／妹控／弟控", regex: /姐控|妹控|弟控|兄控|哥哥|妹妹|姐姐|弟弟/ },
    { id: "noble_supreme", label: "👑 孤高王者／霸道自信", regex: /高貴|傲慢|王的氣質|領袖|自信|野心|威嚴|殘暴|自我中心|狂妄/ },
    { id: "shy_introvert", label: "🌙 怕生內向／沉默神祕", regex: /怕生|內向|沉默寡言|話少|話特別少|神秘|謎語人|孤獨|怯懦/ }
  ];

  const HOBBY_TAGS = [
    { id: "sweets", label: "🍰 甜食與點心控", regex: /甜食|甜點|甜品|布丁|巧克力|糖|蛋糕|下午茶|奶茶|三彩糰子/ },
    { id: "tea_coffee", label: "🍵 品茶與咖啡派", regex: /茶|綠茶|紅茶|抹茶|熱可可|咖啡/ },
    { id: "alcohol", label: "🍷 美酒與微醺調酒", regex: /酒|紅酒|調酒|伏特加|威士忌/ },
    { id: "spicy_gourmet", label: "🍜 重辣／拉麵／燒肉美食家", regex: /辣|燒肉|拉麵|小籠包|烏龍麵|玉子燒|吃東西|美食|做菜|料理/ },
    { id: "reading_lore", label: "📚 閱讀與學術研究", regex: /書|閱讀|讀書|小說|研究|歷史|古董/ },
    { id: "music_art", label: "🎵 音樂／繪畫／藝術創作", regex: /音樂|歌|小提琴|吉他|繪畫|畫|藝術|舞蹈|攝影/ },
    { id: "sword_fitness", label: "🥋 練劍／健身／武藝鍛鍊", regex: /劍|練劍|習武|鍛煉|健身|運動|柔道/ },
    { id: "animals_nature", label: "🐾 貓咪／小動物／大自然", regex: /貓|小動物|兔子|魚|狗|大自然|森林|花|玫瑰|紫羅蘭|星空|觀月|下雪|下雨/ },
    { id: "games_chess", label: "🎮 下棋與打遊戲", regex: /棋|將棋|打遊戲|遊戲/ }
  ];

  // ==================== ANALYZE & VECTORIZE ALL 176 CHARACTERS ====================
  const relNodeById = new Map();
  const relNodeByNorm = new Map();
  relNodes.forEach((rn) => {
    relNodeById.set(rn.id, rn);
    relNodeByNorm.set(normalizeName(rn.name), rn);
  });

  const characters = rawCharacters.map((raw) => {
    const c = Object.assign({}, raw);
    c.cleanName = cleanName(c.name);
    c.normName = normalizeName(c.name);
    c.profile = c.profile || {};
    c.attrTokens = parseAttributeTokens(c.profile["屬性"]);

    const relNode = relNodeByNorm.get(c.normName);
    const personalityText = String(c.profile["個性"] || "");
    const likesText = String(c.profile["喜歡"] || (relNode && relNode.likes) || "");
    const dislikesText = String(c.profile["討厭"] || (relNode && relNode.dislikes) || "");
    const storyText = String(c.story || (relNode && relNode.story) || "");
    const alignText = String(c.profile["善惡"] || (relNode && relNode.alignment) || "中立");
    const attrText = c.attrTokens.join(" ");
    const combinedCorpus = `${personalityText} ${likesText} ${dislikesText} ${storyText} ${attrText}`;

    c.personalityText = personalityText;
    c.likesText = likesText;
    c.dislikesText = dislikesText;
    c.storyText = storyText;
    c.alignText = alignText;

    // Compute 6 Soul Axes (default 50)
    let benevolence = 52;
    let order = 52;
    let social = 50;
    let passion = 50;
    let intellect = 52;
    let devotion = 55;

    // 1. Benevolence from 善惡 + keywords
    if (/絕對善|極善|大善/.test(alignText)) benevolence = 90;
    else if (/中立-善|中善|小善|善/.test(alignText)) benevolence = 74;
    else if (/絕對惡|極惡|大惡/.test(alignText)) benevolence = 24;
    else if (/中立-惡|中惡|小惡|惡/.test(alignText)) benevolence = 38;
    else benevolence = 56;

    if (/溫柔|善良|救人|救治|保護弱小|幫助|同理心|和平|聖母/.test(combinedCorpus)) benevolence += 14;
    if (/殘忍|虐待|殺光|復仇|冷酷無情|邪惡/.test(combinedCorpus)) benevolence -= 16;

    // 2. Order (紀律嚴謹 vs 隨性自由)
    if (/認真|負責|完美主義|嚴肅|沉穩|紀律|果斷|領袖|公平公正|雷厲風行|謹慎/.test(combinedCorpus)) order += 24;
    if (/隨性|隨和|懶|摸魚|散漫|我行我素|狂躁|搞事|天然|自由|叛逆/.test(combinedCorpus)) order -= 22;

    // 3. Social (熱情外向 vs 內斂高冷)
    if (/社交|開朗|熱情|外向|聊天|風趣|灑脫|愛撒嬌|和事佬|搞笑/.test(combinedCorpus)) social += 28;
    if (/沉默|寡言|話少|話特別少|冷漠|冷淡|內向|怕生|孤獨|獨自|不苟言笑|面癱/.test(combinedCorpus)) social -= 24;

    // 4. Passion (熱血狂戰 vs 靜謐平和)
    if (/戰鬥狂|好戰|廝殺|狂|火|炎|煉獄|雷|劍|破壞|毀滅|戰爭|直接了當|熱血/.test(combinedCorpus)) passion += 26;
    if (/不喜爭鬥|討厭戰爭|與世無爭|安靜|文靜|看書|閱讀|睡覺|研究/.test(combinedCorpus)) passion -= 20;

    // 5. Intellect (智略洞察 vs 純真直覺)
    if (/聰明|智商|智囊|頭腦很好|研究|知識|萬事通|詭計|戰略|看書|閱讀|下棋|時空|真實|理|精神|認知/.test(combinedCorpus)) intellect += 24;
    if (/天然呆|笨|傻|單純|呆呆的|盲目/.test(combinedCorpus)) intellect -= 18;

    // 6. Devotion (重情羈絆 vs 孤高自我)
    if (/忠誠|重情|同伴|家人|朋友|主人|姐姐|妹妹|哥哥|弟弟|保護|珍惜|愛|責任/.test(combinedCorpus)) devotion += 25;
    if (/不在乎任何人|絕對的自我|個人主義|誰都不信/.test(combinedCorpus)) devotion -= 22;

    const clamp = (v) => Math.max(12, Math.min(98, Math.round(v)));
    c.soulAxes = {
      benevolence: clamp(benevolence),
      order: clamp(order),
      social: clamp(social),
      passion: clamp(passion),
      intellect: clamp(intellect),
      devotion: clamp(devotion)
    };

    // Match trait & hobby tags
    c.matchedPersonalityTags = PERSONALITY_TAGS.filter((t) => t.regex.test(combinedCorpus)).map((t) => t.id);
    c.matchedHobbyTags = HOBBY_TAGS.filter((t) => t.regex.test(combinedCorpus)).map((t) => t.id);

    return c;
  });

  // ==================== 14 LORE-IMMERSIVE QUIZ QUESTIONS ====================
  const QUIZ_QUESTIONS = [
    {
      id: "q1",
      category: "【第一章・五界處世哲學】",
      scene: "你踏入亞雷利塔的世界，面對各大勢力錯綜複雜的秩序與紛爭，你內心最認同的生存準則是什麼？",
      question: "當你擁有足以改變局勢的力量時，你會如何使用它？",
      options: [
        {
          text: "守護弱小與身邊珍視之人，只要不違背良知，願意挺身而出成為他人的盾牌。",
          axes: { benevolence: 22, order: 8, social: 6, passion: 6, intellect: 0, devotion: 18 },
          pTags: ["gentle_healer", "loyal_protector"],
          elemRegex: /光|聖|守護|生命|自然/
        },
        {
          text: "建立絕對的秩序與效率！混亂只會帶來無謂的犧牲，唯有鐵腕與規則能統御全局。",
          axes: { benevolence: -4, order: 24, social: -4, passion: 10, intellect: 14, devotion: 8 },
          pTags: ["calm_strategist", "noble_supreme"],
          elemRegex: /王|月|太陽|世界金屬|鋼|空間/
        },
        {
          text: "隨心所欲、看心情行事！只要沒人惹到我的底線或同伴，平常能摸魚悠閒度日最好。",
          axes: { benevolence: 6, order: -22, social: 4, passion: -10, intellect: 6, devotion: 10 },
          pTags: ["lazy_chill"],
          hTags: ["tea_coffee"],
          elemRegex: /風|水|霧|空間|時間/
        },
        {
          text: "強者為尊、唯我獨尊！世俗的道德與束縛與我無關，我只追尋極致的巔峰與真實自我。",
          axes: { benevolence: -18, order: -8, social: -10, passion: 22, intellect: 6, devotion: -8 },
          pTags: ["noble_supreme", "battle_maniac"],
          elemRegex: /深淵|至淵|暗|霸王|原罪|滅世|破壞/
        }
      ]
    },
    {
      id: "q2",
      category: "【第二章・社交面具與內心反差】",
      scene: "在月星國立大學的紫羅蘭步道，或是魔風聯邦的宴會廳裡，初次見面的陌生人與熟識的摯友對你的評價往往不同。",
      question: "在人際交往中，你真實的性格狀態最接近哪一種？",
      options: [
        {
          text: "八面玲瓏的社交高手！無論面對皇室貴族還是街頭混混都能迅速聊開，讓人覺得親切好相處。",
          axes: { benevolence: 10, order: 2, social: 26, passion: 4, intellect: 12, devotion: 8 },
          pTags: ["social_master"],
          elemRegex: /光|風|音|音樂|火/
        },
        {
          text: "外冷內熱的反差派！在外人面前保持高冷、嚴肅或完美形象，只有在熟人面前才會卸下防備、吐槽或撒嬌。",
          axes: { benevolence: 6, order: 12, social: -10, passion: 2, intellect: 10, devotion: 20 },
          pTags: ["tsundere_gap", "loyal_protector"],
          elemRegex: /暗|影|冰|雪|白玫瑰|紫羅蘭/
        },
        {
          text: "安靜內斂的獨行者，話不多甚至有點怕生，但只要認定了朋友或家人，就會用行動默默付出一切。",
          axes: { benevolence: 12, order: 6, social: -22, passion: -6, intellect: 8, devotion: 22 },
          pTags: ["shy_introvert", "loyal_protector"],
          elemRegex: /夜|月|月水|影|魂|靈魂/
        },
        {
          text: "直來直往、毫不掩飾！喜歡就是喜歡、討厭就直接嗆回去，帶點毒舌或傲氣，從不虛偽做作。",
          axes: { benevolence: 0, order: -6, social: 6, passion: 18, intellect: 4, devotion: 6 },
          pTags: ["tsundere_gap", "battle_maniac"],
          elemRegex: /火|炎|雷|劍|銳利|色彩/
        }
      ]
    },
    {
      id: "q3",
      category: "【第三章・衝突與戰鬥本能】",
      scene: "強敵突襲據點，空氣中瀰漫著靈力與殺氣，戰端一觸即發！",
      question: "面對無法避免的正面交鋒，你的第一反應與戰鬥風格是？",
      options: [
        {
          text: "熱血沸騰、正面硬撼！享受腎上腺素飆升的快感，以最純粹的劍技、武道或毀滅火力碾碎對手！",
          axes: { benevolence: 0, order: -6, social: 4, passion: 26, intellect: -4, devotion: 6 },
          pTags: ["battle_maniac"],
          hTags: ["sword_fitness"],
          elemRegex: /火|爆炎|煉獄|戰爭|狂|劍|武|力量|神龍/
        },
        {
          text: "冷靜洞悉全局，先看穿對手的術式破綻與心理弱點，再以最精準、最優雅的手段一擊必殺。",
          axes: { benevolence: 0, order: 18, social: -6, passion: -4, intellect: 24, devotion: 4 },
          pTags: ["calm_strategist"],
          elemRegex: /空間|時間|時空|真實|理|認知|冰|靜默影焰/
        },
        {
          text: "優先確保同伴與後方的安全，張開結界或支援戰線；但若有人敢重傷我的夥伴，將迎來最恐怖的報復。",
          axes: { benevolence: 18, order: 8, social: 8, passion: 8, intellect: 6, devotion: 24 },
          pTags: ["gentle_healer", "loyal_protector"],
          elemRegex: /守護|光|聖|晨光|樹|生命|水/
        },
        {
          text: "能不出手就交給部下或隊友處理，但到了非我不可的關鍵時刻，才會認真起來瞬間終結戰局。",
          axes: { benevolence: 4, order: -14, social: 2, passion: -12, intellect: 14, devotion: 8 },
          pTags: ["lazy_chill", "calm_strategist"],
          elemRegex: /空間|風|嵐|雷|天體|星穹/
        }
      ]
    },
    {
      id: "q4",
      category: "【第四章・午茶與味蕾偏好】",
      scene: "結束了一整天的任務與訓練，你走進現界與魔界交界處最知名的餐館放鬆身心。",
      question: "在餐桌上，最能瞬間治癒你靈魂的飲食組合是什麼？",
      options: [
        {
          text: "精緻的甜點下午茶！布丁、草莓蛋糕、巧克力或三彩糰子，配上一杯香濃奶茶。",
          axes: { benevolence: 10, order: 0, social: 10, passion: -2, intellect: 2, devotion: 8 },
          hTags: ["sweets"],
          likeKeywords: ["甜食", "甜點", "甜品", "布丁", "巧克力", "下午茶", "奶茶", "糰子"]
        },
        {
          text: "清幽的熱茶或黑咖啡！無論是抹茶、綠茶、大吉嶺紅茶還是苦醇咖啡，享受寧靜的品味時光。",
          axes: { benevolence: 4, order: 12, social: -8, passion: -10, intellect: 14, devotion: 4 },
          hTags: ["tea_coffee"],
          likeKeywords: ["茶", "綠茶", "紅茶", "抹茶", "咖啡", "熱可可"]
        },
        {
          text: "大口吃肉與重口味美食！激辛重辣料理、炭火燒肉、豚骨拉麵或小籠包，吃飽才有力氣幹活！",
          axes: { benevolence: 6, order: -6, social: 14, passion: 18, intellect: -2, devotion: 10 },
          hTags: ["spicy_gourmet"],
          likeKeywords: ["辣", "燒肉", "拉麵", "小籠包", "烏龍麵", "吃東西", "美食"]
        },
        {
          text: "微醺的美酒之夜！紅酒、威士忌、伏特加或特調雞尾酒，在夜色中獨酌或與知己對飲。",
          axes: { benevolence: -4, order: -4, social: 4, passion: 10, intellect: 8, devotion: 8 },
          hTags: ["alcohol"],
          likeKeywords: ["酒", "紅酒", "調酒", "伏特加", "威士忌"]
        }
      ]
    },
    {
      id: "q5",
      category: "【第五章・閒暇時光的靈魂棲所】",
      scene: "難得沒有任何公務與戰鬥的休假日，陽光或月色正美。",
      question: "你最想把這段不受打擾的私人時間花在哪件事上？",
      options: [
        {
          text: "沉浸在書海與知識中——閱讀歷史典籍、研究未知的魔法術式，或是偷看幾本言情小說。",
          axes: { benevolence: 4, order: 10, social: -10, passion: -12, intellect: 22, devotion: 2 },
          hTags: ["reading_lore"],
          likeKeywords: ["書", "閱讀", "讀書", "小說", "研究", "古董"]
        },
        {
          text: "拉小提琴、彈吉他寫歌、繪畫創作，或是在星空、雨天與森林花海中散步放空。",
          axes: { benevolence: 12, order: 0, social: 2, passion: -6, intellect: 10, devotion: 8 },
          hTags: ["music_art", "animals_nature"],
          likeKeywords: ["音樂", "歌", "小提琴", "吉他", "繪畫", "花", "玫瑰", "紫羅蘭", "大自然", "星空", "觀月"]
        },
        {
          text: "泡在訓練場或健身房磨練劍術與體能，或者找實力相當的對手痛快切磋一場！",
          axes: { benevolence: 2, order: 12, social: 2, passion: 22, intellect: 0, devotion: 6 },
          hTags: ["sword_fitness"],
          likeKeywords: ["劍", "練劍", "習武", "鍛煉", "健身", "運動", "戰鬥"]
        },
        {
          text: "抱著抱枕或毛茸茸的貓咪睡到自然醒，或是找朋友下棋、打遊戲、聊天講幹話！",
          axes: { benevolence: 8, order: -16, social: 12, passion: -8, intellect: 4, devotion: 10 },
          pTags: ["lazy_chill"],
          hTags: ["animals_nature", "games_chess"],
          likeKeywords: ["睡覺", "摸魚", "貓", "小動物", "棋", "將棋", "遊戲", "聊天"]
        }
      ]
    },
    {
      id: "q6",
      category: "【第六章・尋真千卷的屬性共鳴】",
      scene: "《尋真千卷》在你面前展開，書頁上流轉著亞雷利塔 17 大體系的璀璨元素光輝。",
      question: "憑直覺觸碰書頁，哪一股力量最讓你產生靈魂深處的悸動？",
      options: [
        {
          text: "【熾焰與雷霆】燃盡萬物的紅蓮爆炎、薪火，或是貫穿天際的紫電與滅邪神雷。",
          axes: { benevolence: 2, order: 0, social: 8, passion: 20, intellect: 0, devotion: 6 },
          elemRegex: /火|炎|爆炎|薪火|紅蓮|煉獄|雷|紫電|白雷|神雷/
        },
        {
          text: "【滄海與凜冬】包容萬物的深海源水、月水，或是純淨凜冽的凍魂寒霜與冰雪。",
          axes: { benevolence: 10, order: 8, social: -4, passion: -6, intellect: 10, devotion: 10 },
          elemRegex: /水|海|源水|月水|霧|冰|雪|霜|寒霜/
        },
        {
          text: "【聖光與自然】破除黑暗的黎明晨光、世界樹的生命綠意，或是綻放的白玫瑰與紫羅蘭。",
          axes: { benevolence: 20, order: 8, social: 8, passion: -4, intellect: 6, devotion: 14 },
          elemRegex: /光|聖|純白|黎明|晨光|草|木|樹|自然|生命|花|玫瑰|紫羅蘭|櫻|風|嵐/
        },
        {
          text: "【幽暗、時空與真實】深邃的暗影夜色、至淵，或是操縱時間、空間、靈魂與「真實/理」的法則。",
          axes: { benevolence: -6, order: 10, social: -12, passion: 6, intellect: 22, devotion: 4 },
          elemRegex: /暗|影|夜|冥|深淵|至淵|時間|空間|時空|真實|理|靈魂|魂|認知|言靈|星穹|月/
        }
      ]
    },
    {
      id: "q7",
      category: "【第七章・情感羈絆與軟肋】",
      scene: "在漫長的歲月裡，即便是神明或魔王，心中也往往藏著一塊絕不容許他人觸碰的柔軟之地。",
      question: "對你而言，人際與情感關係中最核心的執念是什麼？",
      options: [
        {
          text: "「家人與手足高於一切！」無論是兄長、姊姊、弟弟、妹妹還是生死與共的夥伴，誰敢傷他們分毫，我必百倍奉還。",
          axes: { benevolence: 8, order: 2, social: 4, passion: 14, intellect: 0, devotion: 28 },
          pTags: ["loyal_protector", "family_con"],
          likeKeywords: ["家人", "同伴", "夥伴", "妹妹", "姐姐", "哥哥", "弟弟", "朋友"]
        },
        {
          text: "「絕對的忠誠與信諾！」一旦認同了值得追隨的領袖、摯愛或理想，就算賠上性命也絕不背棄承諾。",
          axes: { benevolence: 8, order: 20, social: -2, passion: 10, intellect: 6, devotion: 26 },
          pTags: ["loyal_protector", "calm_strategist"],
          likeKeywords: ["主人", "忠誠", "信守諾言"]
        },
        {
          text: "「尋找能並肩對等的知己！」不喜歡無謂的束縛與討好，只渴望一個能真正理解自己、甚至能與自己全力切磋的靈魂伴侶。",
          axes: { benevolence: 0, order: 4, social: -8, passion: 14, intellect: 14, devotion: 12 },
          pTags: ["noble_supreme", "tsundere_gap"],
          likeKeywords: ["理解自己", "強者", "真誠"]
        },
        {
          text: "「博愛或隨緣自在！」喜歡照顧後輩與小朋友，看大家熱熱鬧鬧就很開心，不喜歡沉重的佔有欲。",
          axes: { benevolence: 20, order: -4, social: 18, passion: -4, intellect: 4, devotion: 14 },
          pTags: ["gentle_healer", "social_master"],
          likeKeywords: ["小孩", "小朋友", "學生", "和平"]
        }
      ]
    },
    {
      id: "q8",
      category: "【第八章・團隊中的戰術定位】",
      scene: "當你所在的組織（如極真圃、魔風聯邦或世界賢者館）執行一項極機密的大型跨界任務時：",
      question: "你在團隊中最自然會擔任哪一種角色？",
      options: [
        {
          text: "運籌帷幄的統帥或軍師——負責制定計畫、分析情報，並在同伴迷茫時給出最關鍵的決斷。",
          axes: { benevolence: 4, order: 20, social: 6, passion: 2, intellect: 24, devotion: 10 },
          pTags: ["calm_strategist", "noble_supreme"]
        },
        {
          text: "一馬當先的王牌先鋒——不需要複雜的廢話，最危險的強敵交給我來正面突破！",
          axes: { benevolence: 2, order: 0, social: 4, passion: 24, intellect: -4, devotion: 12 },
          pTags: ["battle_maniac", "loyal_protector"]
        },
        {
          text: "潛伏暗處的奇兵或全能特務——擅長偽裝、交涉、空間轉移或奇襲，以最快速度完美達成任務。",
          axes: { benevolence: 0, order: 12, social: 8, passion: 6, intellect: 18, devotion: 8 },
          pTags: ["social_master", "tsundere_gap"]
        },
        {
          text: "穩定軍心的後盾與氣氛製造者——平時負責吐槽、做料理或照顧大家，危急時刻絕不讓任何一人倒下。",
          axes: { benevolence: 22, order: 2, social: 14, passion: -4, intellect: 6, devotion: 20 },
          pTags: ["gentle_healer", "lazy_chill"]
        }
      ]
    },
    {
      id: "q9",
      category: "【第九章・最厭惡的禁忌底線】",
      scene: "每個人都有絕對無法容忍的事物，一旦觸犯就會讓你徹底收起笑容。",
      question: "下列哪種人或行為最讓你感到厭惡？",
      options: [
        {
          text: "虛偽善變、滿口謊言的騙子，或是仗勢欺人、踐踏弱者尊嚴的卑劣之徒。",
          axes: { benevolence: 16, order: 12, social: 0, passion: 10, intellect: 6, devotion: 12 },
          dislikeKeywords: ["謊言", "虛偽", "欺騙", "十惡不赦", "尊嚴", "邪惡"]
        },
        {
          text: "傷害我所愛之人、觸碰我家人與同伴安危的任何傢伙——無論對方是神還是魔都絕不原諒。",
          axes: { benevolence: 6, order: 0, social: 0, passion: 18, intellect: 0, devotion: 26 },
          pTags: ["loyal_protector", "family_con"],
          dislikeKeywords: ["傷害", "所愛之人", "家人", "同伴"]
        },
        {
          text: "沒有自知之明卻愛大聲嚷嚷的蠢貨、不講理的野人，或是打擾我清靜與休息的麻煩事。",
          axes: { benevolence: -6, order: 4, social: -14, passion: 4, intellect: 14, devotion: -2 },
          pTags: ["lazy_chill", "noble_supreme", "calm_strategist"],
          dislikeKeywords: ["麻煩", "野人", "嚷嚷", "電燈泡", "吵"]
        },
        {
          text: "毫無意義的殘酷戰爭，或是被迫受人束縛、失去自由與自我的無力感。",
          axes: { benevolence: 18, order: -10, social: 4, passion: -8, intellect: 6, devotion: 10 },
          pTags: ["gentle_healer"],
          dislikeKeywords: ["戰爭", "束縛", "苦"]
        }
      ]
    },
    {
      id: "q10",
      category: "【第十章・五界歸屬的命定勢力】",
      scene: "跨越現界、魔界與天界的漫長旅途後，你終於找到一處能讓靈魂安放的歸宿。",
      question: "你最嚮往加入哪一種氛圍的組織或國度？",
      options: [
        {
          text: "【極真圃／東方滅魔館】表面上各自擁有現代日常身分（大學教授、歌手、藝術家），私下則是追尋世界真相、溫暖如家的精銳夥伴。",
          axes: { benevolence: 14, order: 6, social: 14, passion: 4, intellect: 14, devotion: 18 },
          preferredFactions: ["極真圃", "東方滅魔館", "月星民國", "日天聯邦"]
        },
        {
          text: "【魔風聯邦・最高層／冥府神傑】強者雲集、紀律嚴明卻極度護短的霸權聯邦，與生死與共的同袍並肩立於世界之巔。",
          axes: { benevolence: 0, order: 16, social: 2, passion: 16, intellect: 10, devotion: 22 },
          preferredFactions: ["魔風聯邦", "凱撒家族"]
        },
        {
          text: "【世界賢者館／魔法之根協會／影風之巔】遠離俗世喧囂，專注於真理研究、星穹魔法或暗影特務行動的神秘殿堂。",
          axes: { benevolence: 6, order: 8, social: -8, passion: 0, intellect: 22, devotion: 8 },
          preferredFactions: ["世界賢者館", "亞雷利塔魔法之根協會", "影風之巔", "寂靜之音"]
        },
        {
          text: "【神明／傳奇／流浪者／龍族帝國】不受任何凡間國度拘束，以神格、古龍或傳奇浪人之姿自由漫步於天地之間。",
          axes: { benevolence: 2, order: -10, social: -4, passion: 14, intellect: 10, devotion: 4 },
          preferredFactions: ["神明", "傳奇", "流浪者", "天界", "哈維德恩龍族帝國", "卡姆利亞獸人聯邦"]
        }
      ]
    },
    // Extra 4 Deep-Dive Questions for 14-Question Complete Mode
    {
      id: "q11",
      category: "【第十一章・反差與隱藏怪癖】",
      scene: "在《尋真千卷》的側頁批註裡，記錄著每位強者不為人知的小怪癖。",
      question: "若熟人偷偷爆料你私底下的反差一面，最可能是哪一項？",
      options: [
        {
          text: "看起來成熟穩重或高冷，其實私底下超愛吃甜食、喜歡可愛的小動物，或者偶爾會天然呆迷路。",
          axes: { benevolence: 10, order: -4, social: 4, passion: -4, intellect: -4, devotion: 12 },
          pTags: ["tsundere_gap"],
          hTags: ["sweets", "animals_nature"]
        },
        {
          text: "平時一副懶洋洋、愛講幹話或想摸魚的樣子，但其實心裡比誰都清楚局勢，關鍵時刻無比可靠。",
          axes: { benevolence: 8, order: -12, social: 10, passion: 4, intellect: 18, devotion: 14 },
          pTags: ["lazy_chill", "calm_strategist"]
        },
        {
          text: "表面上溫和有禮、笑容滿面，但其實內心戲超多、喜歡默默吐槽，或是帶點微腹黑的小心機。",
          axes: { benevolence: 4, order: 6, social: 12, passion: 2, intellect: 18, devotion: 6 },
          pTags: ["social_master", "tsundere_gap"]
        },
        {
          text: "有嚴重的完美主義或收集癖（如收集名劍、古董、漂亮的事物），對自己在乎的領域有著近乎偏執的堅持。",
          axes: { benevolence: 0, order: 20, social: -4, passion: 12, intellect: 12, devotion: 10 },
          pTags: ["calm_strategist", "noble_supreme"],
          hTags: ["sword_fitness", "music_art"]
        }
      ]
    },
    {
      id: "q12",
      category: "【第十二章・面對迷茫與過去】",
      scene: "夜深人靜時，過往的經歷或遺憾偶爾會浮現在腦海。",
      question: "當你面對人生的低谷或迷茫時，你會如何消化這份情緒？",
      options: [
        {
          text: "獨自一人去吹風、看海、看雪或練劍，把所有情緒化為前進的動力，不輕易向人示弱訴苦。",
          axes: { benevolence: 4, order: 12, social: -16, passion: 10, intellect: 10, devotion: 10 },
          pTags: ["shy_introvert", "loyal_protector"],
          hTags: ["sword_fitness", "animals_nature"]
        },
        {
          text: "只要看到身邊重視的家人與夥伴還在，就能重新振作起來——他們就是我存在的意義。",
          axes: { benevolence: 16, order: 6, social: 10, passion: 6, intellect: 2, devotion: 24 },
          pTags: ["loyal_protector", "gentle_healer"]
        },
        {
          text: "大吃一頓美食、睡個好覺，或者找信任的朋友小酌聊天，天塌下來明天再說！",
          axes: { benevolence: 8, order: -14, social: 16, passion: 4, intellect: 2, devotion: 8 },
          pTags: ["lazy_chill", "social_master"],
          hTags: ["spicy_gourmet", "alcohol"]
        },
        {
          text: "從不迷茫！我只相信自己定下的目標與真理，任何阻礙都只會讓我變得更加強大。",
          axes: { benevolence: -8, order: 14, social: -8, passion: 22, intellect: 14, devotion: 0 },
          pTags: ["noble_supreme", "battle_maniac"]
        }
      ]
    },
    {
      id: "q13",
      category: "【第十三章・戰鬥兵裝與術式美學】",
      scene: "若能在亞雷利塔鍛造一件專屬於你的本命武裝或神權術式：",
      question: "你最青睞哪一種戰鬥美學？",
      options: [
        {
          text: "【名刀與古劍】如「斷厄」、「天破」或緋紅刀刃，以極致的劍技與刀光斬斷宿命。",
          axes: { benevolence: 4, order: 10, social: -2, passion: 18, intellect: 6, devotion: 10 },
          hTags: ["sword_fitness"],
          elemRegex: /劍|銳利|武|火|雷|猩紅|冰/
        },
        {
          text: "【言靈、魔眼與精神法則】無須揮動刀劍，僅憑一句古言靈術、真實之眼或空間法則便能改寫現實。",
          axes: { benevolence: 2, order: 12, social: -6, passion: -4, intellect: 26, devotion: 4 },
          pTags: ["calm_strategist", "noble_supreme"],
          elemRegex: /言靈|真實|理|認知|精神|靈魂|空間|時間|時空|幻/
        },
        {
          text: "【華麗的藝術與元素洪流】將音樂、色彩、繁花或漫天星穹化為領域，兼具優雅美感與壓倒性威力。",
          axes: { benevolence: 12, order: 6, social: 10, passion: 6, intellect: 14, devotion: 10 },
          hTags: ["music_art"],
          elemRegex: /音|音樂|色彩|花|白玫瑰|紫羅蘭|櫻|星穹|極光|月|水/
        },
        {
          text: "【狂暴龍印與肉體極限】解放九紋龍印、神龍之炎或純粹的霸王武力，以無可匹敵的姿態正面粉碎一切。",
          axes: { benevolence: -2, order: -6, social: 4, passion: 26, intellect: -2, devotion: 8 },
          pTags: ["battle_maniac"],
          elemRegex: /神龍|狂|力量|肉體|破壞|毀滅|煉獄|霸王/
        }
      ]
    },
    {
      id: "q14",
      category: "【最終章・尋真千卷的終極提問】",
      scene: "合上《尋真千卷》前，書頁浮現出最後一行金色的古文字：",
      question: "「當一切傳奇落幕，你希望世人如何記住你的名字？」",
      options: [
        {
          text: "「無須世人銘記，只要在乎我的人能笑著迎來紫羅蘭盛開的季節，便已足夠。」",
          axes: { benevolence: 18, order: 4, social: 8, passion: -2, intellect: 8, devotion: 24 },
          pTags: ["gentle_healer", "loyal_protector"]
        },
        {
          text: "「立於萬人之上的不朽君王／統帥，開創了一個前所未有的強盛時代。」",
          axes: { benevolence: 2, order: 24, social: 6, passion: 14, intellect: 18, devotion: 10 },
          pTags: ["noble_supreme", "calm_strategist"]
        },
        {
          text: "「世間最自由、最瀟灑的傳奇，沒有任何法則與命運能束縛我的腳步。」",
          axes: { benevolence: 6, order: -18, social: 10, passion: 14, intellect: 8, devotion: 4 },
          pTags: ["lazy_chill", "social_master"]
        },
        {
          text: "「令諸神與深淵都為之戰慄的至強巔峰，唯有最強的宿敵才配與我並肩留名。」",
          axes: { benevolence: -10, order: 0, social: -8, passion: 26, intellect: 8, devotion: 2 },
          pTags: ["battle_maniac", "noble_supreme"]
        }
      ]
    }
  ];

  // ==================== QUIZ STATE & SFX ====================
  let audioCtx = null;
  const quizState = {
    sfxEnabled: true,
    questionCount: 10, // 10 or 14
    currentIdx: 0,
    answers: [], // array of option objects chosen
    travelerName: "",
    activeExplorerTag: "",
    activeExplorerSearch: "",
    lastResult: null,
    activeDisplayCharId: null
  };

  function playQuizSfx(type) {
    if (!quizState.sfxEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      if (audioCtx.state !== "running") return;

      const now = audioCtx.currentTime;
      const master = audioCtx.createGain();
      master.connect(audioCtx.destination);

      if (type === "select") {
        master.gain.setValueAtTime(0.09, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
        osc.connect(master);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === "reveal") {
        master.gain.setValueAtTime(0.15, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        [440, 554.37, 659.25, 880, 1108.73].forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          g.gain.setValueAtTime(0.08, now + idx * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);
          osc.connect(g);
          g.connect(master);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.48);
        });
      }
    } catch (e) {}
  }

  // ==================== COMPUTE USER VECTOR & MATCH ALL 176 CHARACTERS ====================
  function computeSoulResonanceResult() {
    const userAxes = {
      benevolence: 52,
      order: 52,
      social: 50,
      passion: 50,
      intellect: 52,
      devotion: 55
    };

    const pTagCounts = new Map();
    const hTagCounts = new Map();
    const likeKeywords = new Set();
    const dislikeKeywords = new Set();
    const preferredFactions = new Set();
    const elemRegexes = [];

    quizState.answers.forEach((ans) => {
      if (!ans) return;
      if (ans.axes) {
        AXIS_KEYS.forEach((k) => {
          userAxes[k] += (ans.axes[k] || 0) * 0.52;
        });
      }
      toArray(ans.pTags).forEach((t) => pTagCounts.set(t, (pTagCounts.get(t) || 0) + 1));
      toArray(ans.hTags).forEach((t) => hTagCounts.set(t, (hTagCounts.get(t) || 0) + 1));
      toArray(ans.likeKeywords).forEach((kw) => likeKeywords.add(kw));
      toArray(ans.dislikeKeywords).forEach((kw) => dislikeKeywords.add(kw));
      toArray(ans.preferredFactions).forEach((fac) => preferredFactions.add(fac));
      if (ans.elemRegex) elemRegexes.push(ans.elemRegex);
    });

    AXIS_KEYS.forEach((k) => {
      userAxes[k] = Math.max(12, Math.min(98, Math.round(userAxes[k])));
    });

    // Score every character
    const scoredList = characters.map((c) => {
      // 1. 6-Axis Euclidean distance similarity (0..100)
      let sqSum = 0;
      AXIS_KEYS.forEach((k) => {
        const diff = userAxes[k] - c.soulAxes[k];
        sqSum += diff * diff;
      });
      const rmse = Math.sqrt(sqSum / AXIS_KEYS.length); // 0..85
      let score = Math.max(0, 100 - rmse * 1.15);

      const matchReasons = [];

      // 2. Personality Tag Overlap Bonus
      let pBonus = 0;
      c.matchedPersonalityTags.forEach((tagId) => {
        if (pTagCounts.has(tagId)) {
          pBonus += pTagCounts.get(tagId) * 4.2;
          const tagObj = PERSONALITY_TAGS.find((t) => t.id === tagId);
          if (tagObj) {
            matchReasons.push(`性格特質共鳴：你們同樣具備「${tagObj.label.replace(/^[^\s]+\s/, "")}」的鮮明特質。`);
          }
        }
      });
      score += Math.min(18, pBonus);

      // 3. Hobby & Food Keyword Overlap Bonus
      let hBonus = 0;
      c.matchedHobbyTags.forEach((tagId) => {
        if (hTagCounts.has(tagId)) {
          hBonus += hTagCounts.get(tagId) * 4.5;
          const tagObj = HOBBY_TAGS.find((t) => t.id === tagId);
          if (tagObj) {
            matchReasons.push(`日常品味契合：在飲食與閒暇愛好上，你們都對「${tagObj.label.replace(/^[^\s]+\s/, "")}」情有獨鍾。`);
          }
        }
      });
      likeKeywords.forEach((kw) => {
        if (c.likesText && c.likesText.includes(kw)) {
          hBonus += 3.5;
        }
      });
      dislikeKeywords.forEach((kw) => {
        if (c.dislikesText && c.dislikesText.includes(kw)) {
          hBonus += 3.0;
          matchReasons.push(`底線與價值觀一致：你們同樣厭惡「${kw}」相關的事物。`);
        }
      });
      score += Math.min(16, hBonus);

      // 4. Elemental Wavelength Resonance
      const joinedAttrs = c.attrTokens.join(" ");
      let elemHits = 0;
      elemRegexes.forEach((rx) => {
        if (rx.test(joinedAttrs)) elemHits += 1;
      });
      if (elemHits > 0) {
        score += elemHits * 3.8;
        matchReasons.push(`屬性波長共鳴：你的靈魂頻率與其持有的【${c.attrTokens.join("、")}】屬性高度契合。`);
      }

      // 5. Faction Affinity Bonus
      if (preferredFactions.has(c.faction)) {
        score += 5.5;
        matchReasons.push(`陣營歸屬感：你所嚮往的【${c.faction}】正是其活躍的核心舞台。`);
      }

      // 6. Rich Profile Completeness Bonus (prefer characters with rich personality descriptions)
      if (c.personalityText.length > 15) score += 4.5;
      if (c.likesText.length > 2 && c.likesText !== "無" && c.likesText !== "不明") score += 2.5;

      // Ensure at least 3 descriptive reasons
      if (matchReasons.length < 3) {
        if (Math.abs(userAxes.benevolence - c.soulAxes.benevolence) <= 16) {
          matchReasons.push(`善惡道德座標吻合：你們面對世間紛爭時，抱持著相近的「${c.alignText || "中立"}」處世哲學。`);
        }
        if (Math.abs(userAxes.devotion - c.soulAxes.devotion) <= 18) {
          matchReasons.push(`情感羈絆頻率一致：對待認定的夥伴與契約，有著相同的執著與溫度。`);
        }
        if (Math.abs(userAxes.intellect - c.soulAxes.intellect) <= 18) {
          matchReasons.push(`思維與決策模式相近：無論面對日常還是突發危機，你們總能做出相似的判斷。`);
        }
      }

      return {
        char: c,
        rawScore: score,
        reasons: Array.from(new Set(matchReasons)).slice(0, 4)
      };
    });

    scoredList.sort((a, b) => b.rawScore - a.rawScore);

    // Normalize top match percentage into 91% ~ 99% range for satisfying presentation
    const topRaw = scoredList[0] ? scoredList[0].rawScore : 100;
    scoredList.forEach((item, idx) => {
      const ratio = item.rawScore / Math.max(1, topRaw);
      const pct = Math.max(72, Math.min(99, Math.round(98 * ratio - idx * 0.8)));
      item.resonancePct = pct;
    });

    // Determine Soul Archetype Title
    const topAxes = [...AXIS_KEYS].sort((a, b) => userAxes[b] - userAxes[a]);
    const titleMap = {
      benevolence: "破曉聖光・慈悲守護者",
      order: "星冕法則・秩序裁決者",
      social: "紫羅蘭微風・尋真交涉家",
      passion: "紅蓮狂雷・破界武道家",
      intellect: "萬象千卷・真理觀測者",
      devotion: "永恆誓約・重情護短者"
    };
    const soulTitle = titleMap[topAxes[0]] || "五界巡禮・靈魂共鳴者";

    return {
      userAxes,
      soulTitle,
      topMatches: scoredList.slice(0, 6)
    };
  }

  // ==================== FIND COMPANIONS & RIVALS FROM RELATIONS_DATA ====================
  function getCharacterCompanionsAndRivals(c) {
    const rn = relNodeByNorm.get(c.normName);
    const allies = [];
    const rivals = [];

    if (rn && Array.isArray(rn.relations)) {
      rn.relations.forEach((rel) => {
        let targetChar = null;
        if (rel.targetId && relNodeById.has(rel.targetId)) {
          const tNorm = normalizeName(relNodeById.get(rel.targetId).name);
          targetChar = characters.find((ch) => ch.normName === tNorm);
        }
        if (!targetChar && rel.targetName) {
          const tNorm = normalizeName(rel.targetName);
          targetChar = characters.find((ch) => ch.normName === tNorm);
        }

        const item = {
          char: targetChar,
          name: targetChar ? targetChar.cleanName : cleanName(rel.targetName),
          type: rel.type || "other",
          label: rel.label || "關係",
          desc: rel.desc || ""
        };

        if (rel.type === "rival") {
          rivals.push(item);
        } else {
          allies.push(item);
        }
      });
    }

    return {
      allies: allies.slice(0, 4),
      rivals: rivals.slice(0, 3)
    };
  }

  // ==================== RENDER QUIZ QUESTION FLOW ====================
  function showQuizStage(stageId) {
    ["quizStageIntro", "quizStageQuestions", "quizStageAnalyzing", "quizStageResult"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", id !== stageId);
    });
  }

  function startQuizFlow() {
    const nameInput = document.getElementById("travelerNameInput");
    quizState.travelerName = (nameInput ? nameInput.value : "").trim() || "尋真旅者";
    quizState.currentIdx = 0;
    quizState.answers = new Array(quizState.questionCount).fill(null);
    playQuizSfx("select");
    showQuizStage("quizStageQuestions");
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    const total = quizState.questionCount;
    const idx = quizState.currentIdx;
    const qObj = QUIZ_QUESTIONS[idx];
    if (!qObj) return;

    const stepBadge = document.getElementById("qStepBadge");
    const catTag = document.getElementById("qCategoryTag");
    const barFill = document.getElementById("qProgressBarFill");
    const sceneEl = document.getElementById("qLoreScene");
    const titleEl = document.getElementById("qTitleText");
    const gridEl = document.getElementById("qOptionsGrid");
    const prevBtn = document.getElementById("btnPrevQuestion");
    const bodyEl = document.getElementById("qCardBody");

    if (stepBadge) stepBadge.textContent = `QUESTION ${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    if (catTag) catTag.textContent = qObj.category;
    if (barFill) barFill.style.width = `${Math.round(((idx + 1) / total) * 100)}%`;
    if (sceneEl) sceneEl.textContent = qObj.scene;
    if (titleEl) titleEl.textContent = qObj.question;
    if (prevBtn) prevBtn.disabled = idx === 0;

    if (bodyEl) {
      bodyEl.style.animation = "none";
      void bodyEl.offsetWidth;
      bodyEl.style.animation = "";
    }

    const letters = ["A", "B", "C", "D"];
    const currentAns = quizState.answers[idx];

    if (gridEl) {
      gridEl.innerHTML = qObj.options
        .map((opt, oIdx) => {
          const isSel = currentAns === opt;
          return `
            <button type="button" class="q-option-btn ${isSel ? "is-selected" : ""}" data-opt-idx="${oIdx}">
              <span class="q-opt-letter">${letters[oIdx] || "•"}</span>
              <span class="q-opt-text">${esc(opt.text)}</span>
            </button>
          `;
        })
        .join("");

      gridEl.querySelectorAll("[data-opt-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const oIdx = Number(btn.getAttribute("data-opt-idx"));
          quizState.answers[idx] = qObj.options[oIdx];
          playQuizSfx("select");

          if (idx + 1 < total) {
            quizState.currentIdx += 1;
            renderCurrentQuestion();
          } else {
            runAnalyzingTransition();
          }
        });
      });
    }
  }

  function runAnalyzingTransition() {
    showQuizStage("quizStageAnalyzing");
    const statusEl = document.getElementById("analyzingStatusText");
    const messages = [
      "正在解析六維靈魂波長（善意・秩序・社交・狂氣・智略・羈絆）...",
      "正在比對 176 位角色的個性檔案與日常飲食喜好...",
      "正在檢索 998 條人際關係圖譜，配對命定夥伴與宿敵..."
    ];
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (statusEl && messages[step]) {
        statusEl.textContent = messages[step];
      }
    }, 340);

    setTimeout(() => {
      clearInterval(interval);
      quizState.lastResult = computeSoulResonanceResult();
      quizState.activeDisplayCharId = quizState.lastResult.topMatches[0].char.id;
      playQuizSfx("reveal");
      showQuizStage("quizStageResult");
      renderQuizResultView();
    }, 1050);
  }

  // ==================== RENDER QUIZ RESULT REPORT ====================
  function renderQuizResultView() {
    const container = document.getElementById("quizStageResult");
    if (!container || !quizState.lastResult) return;

    const res = quizState.lastResult;
    const activeMatch =
      res.topMatches.find((m) => m.char.id === quizState.activeDisplayCharId) || res.topMatches[0];
    const c = activeMatch.char;
    const pSrc = getPortraitUrl(c.image);
    const epithet = c.profile["稱號"] || "";
    const relInfo = getCharacterCompanionsAndRivals(c);

    const attrBadges =
      c.attrTokens.length > 0
        ? c.attrTokens
            .map((t) => `<span class="attr-color-badge" style="${getAttrBadgeStyle(t)}">${esc(t)}</span>`)
            .join("")
        : `<span class="sm-pill">無特定屬性</span>`;

    const runnerUps = res.topMatches.slice(0, 4);

    container.innerHTML = `
      <div class="result-hero-card">
        <div class="result-top-ribbon">
          <div class="ribbon-left">
            <span class="resonance-badge">🔮 靈魂共鳴率 ${activeMatch.resonancePct}%</span>
            <span class="soul-title-pill">✨ ${esc(quizState.travelerName)} 的靈魂稱號：【${esc(res.soulTitle)}】</span>
          </div>
          <div class="ribbon-actions">
            <button type="button" class="res-action-btn is-primary" id="btnDownloadPassCard">
              <span>🖼️ 下載靈魂共鳴通行證 (PNG)</span>
            </button>
            <button type="button" class="res-action-btn" id="btnCopyQuizShare">
              <span>📋 複製診斷結果</span>
            </button>
            <button type="button" class="res-action-btn" id="btnRetakeQuiz">
              <span>🔄 重新測驗</span>
            </button>
          </div>
        </div>

        <div class="result-main-grid">
          <!-- Left: Matched Character Full Soul Dossier -->
          <div class="soulmate-profile-box">
            <div class="soulmate-header">
              <div class="soulmate-portrait">
                ${
                  pSrc
                    ? `<img src="${esc(pSrc)}" alt="${esc(c.cleanName)}" />`
                    : `<span class="soulmate-placeholder">${esc(c.cleanName.charAt(0))}</span>`
                }
              </div>
              <div class="soulmate-title-area">
                <div class="soulmate-kicker">DESTINED SOUL RESONANCE // 命定靈魂共鳴角色</div>
                <h2 class="soulmate-name">
                  <span>${formatDisplayName(c.name)}</span>
                  ${epithet ? `<span class="soulmate-epithet">${formatDisplayName(epithet)}</span>` : ""}
                </h2>
                <div class="soulmate-meta-pills">
                  <span class="sm-pill">🌍 ${esc(c.realm)} · ${esc(c.faction)}${c.subFaction ? ` › ${esc(c.subFaction)}` : ""}</span>
                  ${c.power ? `<span class="sm-pill">⚡ 強度：${esc(c.power)}</span>` : ""}
                  <span class="sm-pill">🧬 種族：${esc(c.profile["種族"] || "不明")}</span>
                  <span class="sm-pill">⚖️ 善惡：${esc(c.alignText || "中立")}</span>
                </div>
                <div style="margin-top:0.55rem;display:flex;flex-wrap:wrap;gap:0.35rem;">
                  ${attrBadges}
                </div>
              </div>
            </div>

            <div class="match-reasons-box">
              <h3>✨ 尋真千卷・靈魂波長共鳴解析</h3>
              <ul class="reasons-list">
                ${activeMatch.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}
              </ul>
            </div>

            <div class="lore-personality-card">
              <div class="lore-row">
                <strong>🎭 角色原作個性：</strong>
                <span>${esc(c.personalityText || "神秘莫測，檔案庫尚未完全記載其性格全貌。")}</span>
              </div>
              <div class="lore-row">
                <strong>💖 喜歡的事物：</strong>
                <span>${esc(c.likesText || "無特別記載")}</span>
              </div>
              <div class="lore-row">
                <strong>⚡ 討厭的事物：</strong>
                <span>${esc(c.dislikesText || "無特別記載")}</span>
              </div>
              ${
                c.storyText
                  ? `<div class="lore-row">
                      <strong>📖 傳記背景摘錄：</strong>
                      <span>${esc(c.storyText.slice(0, 190))}${c.storyText.length > 190 ? "..." : ""}</span>
                    </div>`
                  : ""
              }
              <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.3rem;">
                <a href="relations.html" target="_blank" class="res-action-btn">🧬 前往關係圖譜檢視人際網 ↗</a>
                <a href="compare.html?left=${encodeURIComponent(c.id)}" target="_blank" class="res-action-btn">⚖️ 在能力對比中檢視全術式 ↗</a>
              </div>
            </div>
          </div>

          <!-- Right: 6-Axis Soul Radar & Affinity Summary -->
          <div class="soul-radar-card">
            <h3 class="radar-title">📊 六維靈魂波長共鳴雷達</h3>
            <canvas id="soulRadarCanvas" width="300" height="270"></canvas>
            <div style="font-size:0.75rem;color:var(--text-secondary,#94a3b8);display:flex;gap:1rem;">
              <span>🟦 你的靈魂波長</span>
              <span>🟨 ${esc(c.cleanName)} 的波長</span>
            </div>

            <div class="soul-affinity-summary">
              <div class="affinity-item">
                <span>🏛️ 最契合歸屬陣營</span>
                <strong>${esc(c.faction)}${c.subFaction ? `（${esc(c.subFaction)}）` : ""}</strong>
              </div>
              <div class="affinity-item">
                <span>✦ 本命共鳴屬性</span>
                <strong>${esc(c.attrTokens.join("、") || "純粹靈力")}</strong>
              </div>
              <div class="affinity-item">
                <span>⚔️ 本命武裝／權能</span>
                <strong>${esc(c.profile["武器"] ? c.profile["武器"].split(/[\n(（]/)[0].replace(/-/g, "") : "天賦術式")}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Grid: Best Companions / Rivals & Runner-Up Soulmates -->
      <div class="result-secondary-grid">
        <!-- Panel 1: Best Companions & Fate Rivals from relations_data.js -->
        <div class="sub-panel-card">
          <h3>💞 當你身為【${esc(c.cleanName)}】時的命定羈絆與宿敵</h3>
          <div class="companion-list">
            ${
              relInfo.allies.length > 0
                ? relInfo.allies
                    .map((al) => {
                      const img = al.char ? getPortraitUrl(al.char.image) : "";
                      return `
                        <div class="companion-item">
                          <div class="comp-avatar">
                            ${img ? `<img src="${esc(img)}" alt="${esc(al.name)}" />` : `<span>${esc(al.name.charAt(0))}</span>`}
                          </div>
                          <div class="comp-info">
                            <div class="comp-name-line">
                              <span class="comp-name">${esc(al.name)}</span>
                              <span class="comp-badge">💖 ${esc(al.label)}</span>
                            </div>
                            <div class="comp-desc">${esc(al.desc || "生死與共的重要羈絆夥伴")}</div>
                          </div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="comp-desc">此角色習慣獨來獨往，或羈絆深藏於心。</div>`
            }
            ${relInfo.rivals
              .map((rv) => {
                const img = rv.char ? getPortraitUrl(rv.char.image) : "";
                return `
                  <div class="companion-item">
                    <div class="comp-avatar">
                      ${img ? `<img src="${esc(img)}" alt="${esc(rv.name)}" />` : `<span>${esc(rv.name.charAt(0))}</span>`}
                    </div>
                    <div class="comp-info">
                      <div class="comp-name-line">
                        <span class="comp-name">${esc(rv.name)}</span>
                        <span class="comp-badge is-rival">⚔️ 宿命對立・${esc(rv.label)}</span>
                      </div>
                      <div class="comp-desc">${esc(rv.desc)}</div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <!-- Panel 2: Top 4 Resonance Candidates (Click to switch view!) -->
        <div class="sub-panel-card">
          <h3>🥈 你的前四位高契合度靈魂共鳴候補（點擊可切換檢視）</h3>
          <div class="companion-list">
            ${runnerUps
              .map((item, idx) => {
                const ch = item.char;
                const img = getPortraitUrl(ch.image);
                const isCurrent = ch.id === c.id;
                return `
                  <div class="companion-item is-clickable" data-switch-match="${esc(ch.id)}" style="${isCurrent ? "border-color:#fde047;background:rgba(250,204,21,0.12);" : ""}">
                    <div class="comp-avatar">
                      ${img ? `<img src="${esc(img)}" alt="${esc(ch.cleanName)}" />` : `<span>${esc(ch.cleanName.charAt(0))}</span>`}
                    </div>
                    <div class="comp-info">
                      <div class="comp-name-line">
                        <span class="comp-name">#${idx + 1} ${formatDisplayName(ch.name)}</span>
                        <span class="comp-badge is-runnerup">共鳴率 ${item.resonancePct}%</span>
                      </div>
                      <div class="comp-desc">${esc(ch.faction)} ｜ 屬性：${esc(ch.attrTokens.slice(0, 3).join("、") || "無")} ｜ ${esc((ch.personalityText || "").slice(0, 28))}...</div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    drawSoulRadarChart("soulRadarCanvas", res.userAxes, c.soulAxes);

    // Bind Result Actions
    const btnRetake = document.getElementById("btnRetakeQuiz");
    if (btnRetake) {
      btnRetake.addEventListener("click", () => {
        showQuizStage("quizStageIntro");
      });
    }

    const btnCopy = document.getElementById("btnCopyQuizShare");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        const shareText = [
          `🔮【亞雷利塔・靈魂共鳴診斷報告】`,
          `👤 旅者：${quizState.travelerName}（${res.soulTitle}）`,
          `👑 命定共鳴角色：${c.cleanName}（共鳴率 ${activeMatch.resonancePct}%）`,
          `🌍 所屬勢力：${c.realm} · ${c.faction}${c.subFaction ? " › " + c.subFaction : ""}`,
          `✦ 本命屬性：${c.attrTokens.join("、") || "無"}`,
          `✨ 共鳴解析：${activeMatch.reasons[0] || ""}`
        ].join("\n");
        navigator.clipboard?.writeText(shareText).then(() => {
          btnCopy.innerHTML = "<span>✅ 已複製診斷報告！</span>";
          setTimeout(() => {
            btnCopy.innerHTML = "<span>📋 複製診斷結果</span>";
          }, 1600);
        });
      });
    }

    const btnDownload = document.getElementById("btnDownloadPassCard");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        exportSoulPassCardPng(res, activeMatch);
      });
    }

    container.querySelectorAll("[data-switch-match]").forEach((card) => {
      card.addEventListener("click", () => {
        quizState.activeDisplayCharId = card.getAttribute("data-switch-match");
        playQuizSfx("select");
        renderQuizResultView();
      });
    });
  }

  // ==================== DRAW 6-AXIS SOUL RADAR ON CANVAS ====================
  function drawSoulRadarChart(canvasId, userAxes, charAxes) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 4;
    const maxR = 92;
    const n = AXIS_KEYS.length;

    // Draw concentric web hexagons
    [0.25, 0.5, 0.75, 1.0].forEach((level) => {
      const r = maxR * level;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw spokes & labels
    ctx.font = "700 12px 'Noto Sans TC', sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + maxR * Math.cos(angle);
      const y = cy + maxR * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.stroke();

      const lx = cx + (maxR + 26) * Math.cos(angle);
      const ly = cy + (maxR + 20) * Math.sin(angle);
      const key = AXIS_KEYS[i];
      ctx.fillText(AXIS_LABELS[key], lx, ly);
    }

    const drawPolygon = (axesObj, strokeColor, fillColor) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const key = AXIS_KEYS[i];
        const val = Math.max(10, Math.min(100, axesObj[key] || 50)) / 100;
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + maxR * val * Math.cos(angle);
        const y = cy + maxR * val * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    };

    if (charAxes) {
      drawPolygon(charAxes, "#facc15", "rgba(250, 204, 21, 0.22)");
    }
    if (userAxes) {
      drawPolygon(userAxes, "#38bdf8", "rgba(56, 189, 248, 0.28)");
    }
  }

  // ==================== EXPORT SOUL PASS CARD PNG ====================
  function exportSoulPassCardPng(res, activeMatch) {
    const c = activeMatch.char;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    const finishDrawAndDownload = (imgObj) => {
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 600);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(0.5, "#111c33");
      bgGrad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 600);

      // Gold border frame
      ctx.strokeStyle = "rgba(250, 204, 21, 0.65)";
      ctx.lineWidth = 3;
      ctx.strokeRect(22, 22, 1036, 556);

      // Header Kicker
      ctx.fillStyle = "#fbbf24";
      ctx.font = "900 15px 'Noto Sans TC', sans-serif";
      ctx.fillText("ARELITA OFFICIAL SOUL RESONANCE PASS // 亞雷利塔靈魂共鳴通行證", 54, 66);

      // Traveler Name & Soul Title
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(`旅者簽署：${quizState.travelerName}  ｜  靈魂稱號：【${res.soulTitle}】`, 54, 104);

      // Portrait Box
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(54, 134, 210, 260, 18);
      ctx.clip();
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(54, 134, 210, 260);
      if (imgObj) {
        ctx.drawImage(imgObj, 54, 134, 210, 260);
      } else {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 72px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(c.cleanName.charAt(0), 159, 285);
        ctx.textAlign = "left";
      }
      ctx.restore();
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 3;
      ctx.strokeRect(54, 134, 210, 260);

      // Character Name & Resonance %
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px 'Noto Sans TC', sans-serif";
      ctx.fillText(c.cleanName, 294, 180);

      ctx.fillStyle = "#fde047";
      ctx.font = "900 22px 'Noto Sans TC', sans-serif";
      ctx.fillText(`🔮 靈魂共鳴契合度：${activeMatch.resonancePct}%`, 294, 220);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "700 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(
        `勢力：${c.realm} · ${c.faction}${c.subFaction ? " › " + c.subFaction : ""}  ｜  強度：${c.power || "未知"}`,
        294,
        258
      );
      ctx.fillText(
        `屬性：${c.attrTokens.join("、") || "無"}  ｜  善惡：${c.alignText || "中立"}`,
        294,
        290
      );

      // Match Reasons
      ctx.fillStyle = "#38bdf8";
      ctx.font = "800 18px 'Noto Sans TC', sans-serif";
      ctx.fillText("✨ 尋真千卷・靈魂共鳴解析：", 294, 336);

      ctx.fillStyle = "#f1f5f9";
      ctx.font = "600 16px 'Noto Sans TC', sans-serif";
      activeMatch.reasons.slice(0, 3).forEach((r, idx) => {
        ctx.fillText(`• ${r.slice(0, 44)}`, 294, 368 + idx * 30);
      });

      // Personality & Likes footer
      ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
      ctx.fillRect(54, 430, 972, 118);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(54, 430, 972, 118);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "800 16px 'Noto Sans TC', sans-serif";
      ctx.fillText(`🎭 原作個性：${(c.personalityText || "").replace(/\r?\n/g, " ").slice(0, 52)}`, 74, 466);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(`💖 喜歡的事物：${(c.likesText || "無").replace(/\r?\n/g, " ").slice(0, 52)}`, 74, 500);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 14px 'Noto Sans TC', sans-serif";
      ctx.fillText("ARELITA OFFICIAL WORLD & CHARACTER ARCHIVE // 尋真千卷靈魂觀測認證", 74, 532);

      const link = document.createElement("a");
      link.download = `亞雷利塔靈魂通行證_${c.cleanName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const pSrc = getPortraitUrl(c.image);
    if (pSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => finishDrawAndDownload(img);
      img.onerror = () => finishDrawAndDownload(null);
      img.src = pSrc;
    } else {
      finishDrawAndDownload(null);
    }
  }

  // ==================== VIEW 2: PERSONALITY & HOBBY EXPLORER ====================
  function initExplorerView() {
    const pWrap = document.getElementById("personalityTagPills");
    const hWrap = document.getElementById("hobbyTagPills");
    const searchInput = document.getElementById("explorerSearchInput");

    if (pWrap) {
      pWrap.innerHTML =
        `<button type="button" class="trait-filter-pill active" data-trait-id="">全部角色 (${characters.length})</button>` +
        PERSONALITY_TAGS.map((t) => {
          const cnt = characters.filter((c) => c.matchedPersonalityTags.includes(t.id)).length;
          return `<button type="button" class="trait-filter-pill" data-trait-id="${esc(t.id)}">${esc(t.label)} (${cnt})</button>`;
        }).join("");
    }

    if (hWrap) {
      hWrap.innerHTML = HOBBY_TAGS.map((t) => {
        const cnt = characters.filter((c) => c.matchedHobbyTags.includes(t.id)).length;
        return `<button type="button" class="trait-filter-pill" data-trait-id="${esc(t.id)}">${esc(t.label)} (${cnt})</button>`;
      }).join("");
    }

    document.querySelectorAll(".trait-filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizState.activeExplorerTag = btn.getAttribute("data-trait-id") || "";
        document.querySelectorAll(".trait-filter-pill").forEach((b) => b.classList.toggle("active", b === btn));
        renderExplorerGrid();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        quizState.activeExplorerSearch = searchInput.value.trim().toLowerCase();
        renderExplorerGrid();
      });
    }

    renderExplorerGrid();
  }

  function renderExplorerGrid() {
    const grid = document.getElementById("explorerCharGrid");
    const meta = document.getElementById("explorerResultsMeta");
    if (!grid) return;

    const tag = quizState.activeExplorerTag;
    const q = quizState.activeExplorerSearch;

    const list = characters.filter((c) => {
      if (tag) {
        const hasP = c.matchedPersonalityTags.includes(tag);
        const hasH = c.matchedHobbyTags.includes(tag);
        if (!hasP && !hasH) return false;
      }
      if (q) {
        const hay = `${c.cleanName} ${c.faction} ${c.subFaction} ${c.personalityText} ${c.likesText} ${c.dislikesText} ${c.attrTokens.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (meta) meta.textContent = `符合條件：共 ${list.length} 位角色`;

    grid.innerHTML = list
      .map((c) => {
        const pSrc = getPortraitUrl(c.image);
        return `
          <article class="exp-char-card">
            <div class="exp-c-top">
              <div class="comp-avatar">
                ${pSrc ? `<img src="${esc(pSrc)}" alt="${esc(c.cleanName)}" loading="lazy" />` : `<span>${esc(c.cleanName.charAt(0))}</span>`}
              </div>
              <div class="comp-info">
                <div class="comp-name-line">
                  <span class="comp-name">${formatDisplayName(c.name)}</span>
                  <span class="slot-power-pill" style="font-size:0.68rem;padding:0.1rem 0.45rem;border-radius:999px;background:rgba(250,204,21,0.16);border:1px solid rgba(250,204,21,0.4);color:#fde047;">${esc(c.alignText || "中立")}</span>
                </div>
                <div class="comp-desc">${esc(c.realm)} · ${esc(c.faction)}${c.subFaction ? ` › ${esc(c.subFaction)}` : ""} ｜ 屬性：${esc(c.attrTokens.slice(0, 3).join("、") || "無")}</div>
              </div>
            </div>
            <div class="exp-c-body">
              <div><strong>🎭 個性：</strong>${esc(c.personalityText ? c.personalityText.slice(0, 95) + (c.personalityText.length > 95 ? "..." : "") : "未詳載")}</div>
              ${c.likesText ? `<div><strong>💖 喜歡：</strong>${esc(c.likesText.slice(0, 65))}</div>` : ""}
              ${c.dislikesText ? `<div><strong>⚡ 討厭：</strong>${esc(c.dislikesText.slice(0, 65))}</div>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  // ==================== THEME & TOP NAVIGATION INIT ====================
  const THEME_META = {
    ocean: { icon: "🌊", name: "夏日海洋" },
    beach: { icon: "🏖️", name: "假日海灘" },
    bubble: { icon: "🌸", name: "粉紅櫻花" },
    worldtree: { icon: "🌳", name: "世界樹版" },
    starry: { icon: "🌌", name: "星空版本" },
    dark: { icon: "🌙", name: "黑色版本" },
    light: { icon: "☀️", name: "白色版本" }
  };

  function initThemeSelector() {
    const wrap = document.getElementById("quizThemeSelectWrap");
    const toggleBtn = document.getElementById("quizThemeToggleBtn");
    const dropdown = document.getElementById("quizThemeDropdown");
    const iconEl = document.getElementById("quizThemeIcon");
    const textEl = document.getElementById("quizThemeText");

    const applyTheme = (theme) => {
      const valid = THEME_META[theme] ? theme : "ocean";
      document.documentElement.setAttribute("data-theme", valid);
      try {
        localStorage.setItem("arelita_theme", valid);
      } catch (e) {}
      if (iconEl) iconEl.textContent = THEME_META[valid].icon;
      if (textEl) textEl.textContent = THEME_META[valid].name;
      document.querySelectorAll("#quizThemeDropdown .theme-option-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-theme-val") === valid);
      });
    };

    applyTheme(document.documentElement.getAttribute("data-theme") || "ocean");

    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
      });
      document.addEventListener("click", (e) => {
        if (wrap && !wrap.contains(e.target)) dropdown.classList.add("hidden");
      });
    }

    document.querySelectorAll("#quizThemeDropdown .theme-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(btn.getAttribute("data-theme-val"));
        if (dropdown) dropdown.classList.add("hidden");
      });
    });
  }

  function initEvents() {
    // View Switcher (Quiz vs Explorer)
    document.querySelectorAll("[data-quizview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-quizview");
        document.querySelectorAll("[data-quizview]").forEach((b) => b.classList.toggle("is-active", b === btn));
        document.getElementById("quizViewTest")?.classList.toggle("active", target === "test");
        document.getElementById("quizViewExplorer")?.classList.toggle("active", target === "explorer");
      });
    });

    // SFX Toggle
    const sfxBtn = document.getElementById("btnToggleQuizSfx");
    if (sfxBtn) {
      sfxBtn.addEventListener("click", () => {
        quizState.sfxEnabled = !quizState.sfxEnabled;
        sfxBtn.classList.toggle("is-active", quizState.sfxEnabled);
        const icon = document.getElementById("quizSfxIcon");
        const txt = document.getElementById("quizSfxText");
        if (icon) icon.textContent = quizState.sfxEnabled ? "🔊" : "🔇";
        if (txt) txt.textContent = quizState.sfxEnabled ? "音效：ON" : "音效：OFF";
      });
    }

    // Quiz Length Selection (10 vs 14)
    document.querySelectorAll("#quizLengthPills .length-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        quizState.questionCount = Number(pill.getAttribute("data-qcount") || 10);
        document.querySelectorAll("#quizLengthPills .length-pill").forEach((p) => p.classList.toggle("active", p === pill));
      });
    });

    // Start Quiz Button
    const startBtn = document.getElementById("btnStartQuiz");
    if (startBtn) {
      startBtn.addEventListener("click", startQuizFlow);
    }

    // Prev & Restart inside Question Flow
    const prevBtn = document.getElementById("btnPrevQuestion");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (quizState.currentIdx > 0) {
          quizState.currentIdx -= 1;
          renderCurrentQuestion();
        }
      });
    }

    const restartBtn = document.getElementById("btnRestartDuringQuiz");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        showQuizStage("quizStageIntro");
      });
    }
  }

  function init() {
    initThemeSelector();
    initEvents();
    initExplorerView();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
