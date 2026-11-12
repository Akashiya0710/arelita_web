$txt = [System.IO.File]::ReadAllText("assets/relations_data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_RELATIONS = "
$json = $txt.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json

$nodes = $data.nodes
$links = $data.links

$sb = [System.Text.StringBuilder]::new()

[void]$sb.AppendLine('# 亞雷利塔 ARELITA 角色關係全景圖譜與陣營網絡總覽檔案')
[void]$sb.AppendLine('')
[void]$sb.AppendLine("> **記錄時間**：$($data.generatedAt)")
[void]$sb.AppendLine('> **涵蓋範圍**：五界全領域・20 大陣營・14 大傳奇宗族・全 175 位角色・165 條官方正史精煉關係鏈')
[void]$sb.AppendLine('> **互動可視化工具**：已同步建置獨立視覺化圖表系統 [`relations.html`](relations.html)，支援力導向互動星網、家族血脈樹、軍政階層樹與全角色人際雙向檢索。')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('---')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 目錄')
[void]$sb.AppendLine('1. [世界觀架構與五界核心格局](#一世界觀架構與五界核心格局)')
[void]$sb.AppendLine('2. [宏觀陣營關係與外交對立圖譜（Mermaid 圖表）](#二宏觀陣營關係與外交對立圖譜)')
[void]$sb.AppendLine('3. [魔風聯邦軍政最高樞紐與八大軍團部署](#三魔風聯邦軍政最高樞紐與八大軍團部署)')
[void]$sb.AppendLine('4. [十四大名門宗族與傳奇血脈譜系](#十四大名門宗族與傳奇血脈譜系)')
[void]$sb.AppendLine('5. [極真圃六識真之花與跨界同盟網](#五極真圃六識真之花與跨界同盟網)')
[void]$sb.AppendLine('6. [世界級宿敵與歷史封印死結](#六世界級宿敵與歷史封印死結)')
[void]$sb.AppendLine('7. [全 175 位角色人際關係索引總表](#七全-175-位角色人際關係索引總表)')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('---')
[void]$sb.AppendLine('')

# Section 1
[void]$sb.AppendLine('## 一、世界觀架構與五界核心格局')
[void]$sb.AppendLine('亞雷利塔的世界分為**現界、魔界、天界、冥界、幻想界**五大領域，五界並無高低尊卑之分：')
[void]$sb.AppendLine('- **現界**：無限廣闊，以地球為核心文明聚集地，亦是魔風聯邦、月星民國、日天聯邦、卡姆利亞獸人聯邦、哈維德恩龍族帝國等諸國所在地。')
[void]$sb.AppendLine('- **魔界**：垂直有限水平無限（共 9 層），惡魔族的故鄉。由原初三魔神（別西卜、路西法、貝利爾）以及最古老的名門凱撒家族統治。')
[void]$sb.AppendLine('- **天界**：浮空島嶼遍布的無垠聖域，天使與天神所居之地。由天使神祖米迦勒結晶中誕生的天神王潘朵拉統治。')
[void]$sb.AppendLine('- **冥界**：死者歸宿與亡靈之地，層級每 24 小時隨機互換。由亡靈神赤夜風竹、死神三人組（張琦、莉琪雅、凱）、黑神後裔黑卡蒂等坐鎮。')
[void]$sb.AppendLine('- **幻想界**：球型三層世界，約火星大小，幻想種聚居地。')
[void]$sb.AppendLine('- **外界與世界樹**：世界樹支撐萬物資訊，而界外為「虛空」，居住著深不可測的虛界之神（如邪神賽特、救世主賽菲爾引發之世界重置危機）。')
[void]$sb.AppendLine('')

# Section 2
[void]$sb.AppendLine('## 二、宏觀陣營關係與外交對立圖譜')
[void]$sb.AppendLine('```mermaid')
[void]$sb.AppendLine('graph TD')
[void]$sb.AppendLine('    subgraph 國度與軍團盟約')
[void]$sb.AppendLine('        MF["魔風聯邦<br/>(最高總司令 赤夜風竹)"]')
[void]$sb.AppendLine('        TIAN["天界米加百列天國<br/>(天神王 潘朵拉)"]')
[void]$sb.AppendLine('        YX["月星民國<br/>(月星龍皇 趙望月)"]')
[void]$sb.AppendLine('        DRG["哈維德恩龍族帝國<br/>(寂滅龍皇 阿茲拉格)"]')
[void]$sb.AppendLine('        JZP["極真圃 尋真同盟<br/>(金木樨 伊森塔爾)"]')
[void]$sb.AppendLine('        SLV["銀狼傭兵公會<br/>(公會長 白川咲)"]')
[void]$sb.AppendLine('    end')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('    subgraph 世界對立與宿命宿敵')
[void]$sb.AppendLine('        YF["影風之巔<br/>(情報與防衛雇傭)"]')
[void]$sb.AppendLine('        JJ["寂靜之音<br/>(三大福音 暗殺組織)"]')
[void]$sb.AppendLine('        SJ["世界賢者館<br/>(全知魔女 亞卓欣德依娜)"]')
[void]$sb.AppendLine('        MFZ["魔法之根協會<br/>(魔賢者 札維爾)"]')
[void]$sb.AppendLine('        ST["邪神之祖 賽特"]')
[void]$sb.AppendLine('        SVR["救世主 賽菲爾<br/>(世界重置者)"]')
[void]$sb.AppendLine('        AK_DRG["赤夜 終焉龍<br/>(反抗重置者)"]')
[void]$sb.AppendLine('    end')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('    MF <==>|"至高軍事盟友"| TIAN')
[void]$sb.AppendLine('    MF <==>|"互保盟約"| YX')
[void]$sb.AppendLine('    MF <==>|"建國盟約"| DRG')
[void]$sb.AppendLine('    MF <-->|"理髮廳情報據點"| JZP')
[void]$sb.AppendLine('    MF <-->|"特級兼任合作"| SLV')
[void]$sb.AppendLine('    JZP <==>|"總部駐紮同盟"| YX')
[void]$sb.AppendLine('    YF x-.-x|"任務必定廝殺・世界宿敵"| JJ')
[void]$sb.AppendLine('    SJ x-.-x|"魔法管轄權抗衡"| MFZ')
[void]$sb.AppendLine('    MFZ x-.-x|"長期輿論攻擊與制裁"| MF')
[void]$sb.AppendLine('    MF x-.-x|"12013年禁術封印之仇"| ST')
[void]$sb.AppendLine('    AK_DRG x-.-x|"理念死決・粉碎重置偽善"| SVR')
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

# Section 3
[void]$sb.AppendLine('## 三、魔風聯邦軍政最高樞紐與八大軍團部署')
[void]$sb.AppendLine('魔風聯邦是現界乃至全界最強盛的軍事與政治同盟，由赤夜風竹於 12017 年奠基建國：')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('### 1. 聯邦最高指揮樞紐')
[void]$sb.AppendLine('- **魔風聯軍最高總司令**：`赤夜 風竹`（極惡之師、亡靈之神。做事雷厲風行、用軍如鬼，誓死守護親友家人）')
[void]$sb.AppendLine('- **魔風聯軍副總司令**：`阿撒托斯 阿斯拉 凱撒`（屠掠魔神、惡魔劍聖，魔界凱撒長子，風竹生死莫逆之交）')
[void]$sb.AppendLine('- **魔風聯軍總參謀長**：`索亞德 托斯卡 撒旦`（智慧魔神，路西法以神權創造之智者，掌管國家大腦）')
[void]$sb.AppendLine('- **司令秘書**：`銀 塵夜`（銀色的秘書，掌理核心文件、政務統籌與總司令貼身隨侍）')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('### 2. 赤夜風竹直屬專屬隱密部隊【冥府神傑】（共 9 席）')
[void]$sb.AppendLine('> 成立於 12023 年，知情者極少。專門執行非公開之超高難度滅世級任務，合力戰力可抵軍團總和。')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('| 席次 | 姓名 | 稱號 / 職能 | 核心關係與備註 |')
[void]$sb.AppendLine('| :--- | :--- | :--- | :--- |')
[void]$sb.AppendLine('| **第一傑** | 黑卡蒂 拉普拉斯 | 黑神後裔、亡靈美女神 | 神王級戰力，冥界秩序守護者，曾親手鎮壓暴走暗元素神 |')
[void]$sb.AppendLine('| **第二傑** | 克蘭努克 歐塔 | 暗神王的召使、重責哥 | 暗元素族極致古神，魔風深沉基石 |')
[void]$sb.AppendLine('| **第三傑** | 艾琳絲塔希 康多拉 | 希爾瓦倫的劍之女神、真斬始祖 | 赤夜家總管家，照料風竹日常生活與家邸，劍術通神 |')
[void]$sb.AppendLine('| **第四傑** | 福玻斯 里拉 阿斯克勒 | 聖絕的醫傑 | 龍族與血魔雙混血，聯邦最高醫術神匠 |')
[void]$sb.AppendLine('| **第五傑** | 涅米蘿伊 贊恩斯 | 強慾之女、全能天才 | 當今世上唯一的亡靈神赤夜風竹神明眷屬，對風竹極度崇拜 |')
[void]$sb.AppendLine('| **第六傑** | 莎布西絲 貝西卡 | 母神、戀愛怪人 | 妖精與龍混血古神，孕育守護萬物之生命奇蹟 |')
[void]$sb.AppendLine('| **第七傑** | 格赫羅 阿斯拉 凱撒 | 薪炎之魔、暴亂狂徒、鏈魔 | 阿撒托斯堂弟，凱撒家族分支薪火繼承人，豪邁重義 |')
[void]$sb.AppendLine('| **第八傑** | 凜子 歐斯拉 時空 | 時空之王、保姆凜 | 墮天使，執掌時空究極法則，深受神傑同袍信任 |')
[void]$sb.AppendLine('| **第九傑** | 青 黎 | 黑影獵殺者、小黎 | 獸人黑豹與人類混血，極致潛行刺殺王牌 |')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('### 3. 魔風正規軍團八大部隊與守護都市')
[void]$sb.AppendLine('| 部隊名稱 | 將軍稱號 | 將軍姓名 | 守護直轄市 | 都市特色與戰略定位 | 核心部隊成員 |')
[void]$sb.AppendLine('| :--- | :--- | :--- | :--- | :--- | :--- |')
[void]$sb.AppendLine('| **雷霆殿** | 神雷將軍 | 雷風 克斯拉 修羅 | 霍普市 (首都) | 商業與最高科技中樞，人口 482 萬 | 蒂雅(妻)、田也嵐心、沈憾、阿爾希亞、羅彌生 |')
[void]$sb.AppendLine('| **紅蓮組** | 不破將軍 | 烈火 艾克斯 修羅 | 赤羽市 | 日式文化安逸慢活都市，治安最佳 | 烈心、村宮早乙女、趙清夏、織田野寺、櫻上千夏 |')
[void]$sb.AppendLine('| **戰龍** | 煌龍將軍 | 雷格納 尼達羅斯 | 亞美特市 | 重工業與軍事基地，兵器博物館 | 淺野歆音、伊絲波伽德、西格德、忻天、李榮、芬里斯 |')
[void]$sb.AppendLine('| **潔白協奏** | 神曲將軍 | 蘿雅絲 瑟 阿爾法 | 瑪捷塔市 | 地中海風最大港口，音樂藝術之都 | 白川咲、奎札爾、淺野修司 |')
[void]$sb.AppendLine('| **夜妖** | 玄狐將軍 | 水無月 夜風 | 天御市 | 中華風格大市集，商業與商會繁盛 | 月影伊萊、白雪悠、旭翼、百夜奈、祈奈魁、修莉雅 |')
[void]$sb.AppendLine('| **墮天光輝** | 灼炎將軍 | 倷德 歐斯拉 卡迦 | 巴越爾市 | 機械化高科技農田與最大國家公園 | 天桐艾、天霞、伏黑夜、影之 |')
[void]$sb.AppendLine('| **血魔之影** | 守淵將軍 | 凌音 凜 | 丹格市 | 直面深淵之口，最凶險險峻之要塞 | 凌音澪(妹)、千、血羽佛拉德、蕾涅莉亞 |')
[void]$sb.AppendLine('| **陰暗幽鬼** | 絕影將軍 | 星野 晴奈 | 阿瑞納市 | 哥德風山城，每年魔風祭競技場 | 星野蒼空(兄/特級)、冥藏七翔 |')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('### 4. 聯邦獨立特級、特種機關與司法體系')
[void]$sb.AppendLine('- **獨立特級（特許獨立行動，僅聽令總司令與副司令）**：')
[void]$sb.AppendLine('  - `赤夜 花幽`：魔斬女武神，赤夜風竹親妹妹，被救回喚醒記憶後守衛家族。')
[void]$sb.AppendLine('  - `艾娜托斯 阿斯拉 凱撒`：阿撒托斯親妹妹，深淵眷顧者。')
[void]$sb.AppendLine('  - `白雪 悠`：白雪家族傳承魔劍士，赤夜風竹養子。')
[void]$sb.AppendLine('  - `寺山 夜明`：日天巾幗武神，享譽大陸的超強女劍聖。')
[void]$sb.AppendLine('  - `傑瑞 吳 阿爾法`：碎時者，兼任銀狼傭兵公會最高層。')
[void]$sb.AppendLine('  - `月夜`：魔偶使役者、紫魔劍士。')
[void]$sb.AppendLine('  - `星野 蒼空`：星之掌控，星野晴奈之兄。')
[void]$sb.AppendLine('- **獄炎監察部隊**：大隊長 `炎火 加拉爾`（王子）、`憂娜 加拉爾`（公主妹）、`有栖 櫻雪`、`哲也 和人`、`納克 狄姆`、`姵莉絲 阿斯拉 克里`。專職監督魔風各機關，防止貪腐叛變。')
[void]$sb.AppendLine('- **特殊事件對策組（SECT）**：組長 `鹿苑寺 照寺`，隊員 `矢野 海翔`、`中野 繪里`、`狙櫻`、`柳霧`、`蒼`、`蒼風 貓音`、`賴 亭瑋`。處理緊急重大突發與反恐情資。')
[void]$sb.AppendLine('- **魔風國家公共安全局**：總局長 `秦 雲平`（黑空之龍），負責八市巡邏與學院島治安防衛。')
[void]$sb.AppendLine('- **魔風審判庭**：最高審判官 `芙拉達 莎德琺`，獨立執掌聯邦律法與裁決。')
[void]$sb.AppendLine('')

# Section 4
[void]$sb.AppendLine('## 四、十四大名門宗族與傳奇血脈譜系')
[void]$sb.AppendLine('在亞雷利塔的歷史中，特定的血脈與氏族承載著核心命運與超凡力量：')
[void]$sb.AppendLine('')

$clanData = @(
    @{
        name = "1. 赤夜家族（亡靈宗家・冥界秩序守望者）"
        desc = "橫跨鍛造、情報、術法領域的冥界最古老宗家。九歲時家族遭逢大難，風竹護住弟弟卻失落妹妹，終在希爾瓦倫戰役重新相聚。"
        members = @("赤夜 終焉龍 (始祖/終世級)", "赤夜 風竹 (長兄/家主/亡靈神/最高總司令)", "赤夜 花幽 (妹妹/魔斬女武神/獨立特級)", "赤夜 千夜 (弟弟/宗族族裔)")
    },
    @{
        name = "2. 阿斯拉 凱撒家族（魔界古老名門・魔神血統）"
        desc = "魔界傳承數千年的名門望族，長年主導魔界軍政。當代由長子阿撒托斯與魔風結盟共掌天下。"
        members = @("安丁夏坦 阿斯拉 凱撒 (3000年前長子魔王)", "阿撒托斯 阿斯拉 凱撒 (當代長子/副司令)", "艾娜托斯 阿斯拉 凱撒 (次女/阿撒托斯妹妹)", "格赫羅 阿斯拉 凱撒 (堂弟/薪火傳承者/第七傑)", "姵莉絲 阿斯拉 克里 (同族惡魔女皇)", "奎札爾 阿斯拉 密涅瓦 (同宗戰將)")
    },
    @{
        name = "3. 修羅一族（聖魔神裔・雷火雙子）"
        desc = "誕生自聖魔領域的超凡戰士。雷風與烈火為同胞雙胞胎兄弟，自 12011 年追隨赤夜風竹創團，為軍團無可撼動的兩大頂樑柱。"
        members = @("雷風 克斯拉 修羅 (神雷將軍/兄)", "烈火 艾克斯 修羅 (不破將軍/弟)", "蒂雅 歐斯拉 特蘿 (雷風妻子)", "烈心 艾克斯 修羅 (修羅族裔)", "烈魂", "烈陽")
    },
    @{
        name = "4. 加拉爾王族（火之帝國遺孤・獄炎正義）"
        desc = "曾盛極一時的火之帝國——加拉爾公國。亡國之際年幼的王子與公主被赤夜風竹救出，現雙雙擔任獄炎監察官。"
        members = @("伊格那利昂 加拉爾 (火之元素神神祖)", "炎火 加拉爾 (王子/監察大隊長)", "憂娜 加拉爾 (公主/聖火魔女)", "凱 加拉爾 (同脈冥界死神)")
    },
    @{
        name = "5. 撒旦魔神系（原初三魔神與智慧智囊）"
        desc = "魔界的真正原初神柱。別西卜大姐戰力蓋世，路西法二哥智冠魔界，貝利爾防禦無雙。路西法更以神權造出索亞德作為智慧魔神。"
        members = @("別西卜 阿斯拉 撒旦 (原初大姐/最強魔神)", "路西法 阿斯拉 撒旦 (原初二哥/魔族大腦)", "貝利爾 阿斯拉 撒旦 (原初三弟/最強防禦)", "索亞德 托斯卡 撒旦 (路西法化身智者/魔風總參謀長)", "黑帝斯 阿斯拉 洛斯提亞 (冥府魔神)")
    },
    @{
        name = "6. 尼達羅斯龍神族（煌龍戰魂・龍族將門）"
        desc = "與龍神蘿希加勒美流淌同源神血的崇高龍族，將軍雷格納統帥戰龍部隊，驍勇善戰。"
        members = @("蘿希加勒美 尼達羅斯 (龍神)", "雷格納 尼達羅斯 (煌龍將軍/戰龍司令)", "西格德 尼達羅斯 (戰龍部隊精銳)", "諾亞 尼達羅斯 (龍裔)")
    },
    @{
        name = "7. 星野家族（星空掌握・影之守護）"
        desc = "兄妹雙人均為魔風頂級棟樑。哥哥掌控星辰宏觀偉力，妹妹化身陰暗幽鬼統領競技之都。"
        members = @("星野 蒼空 (兄/星之掌控/獨立特級)", "星野 晴奈 (妹/絕影將軍/陰暗幽鬼司令)")
    },
    @{
        name = "8. 凌音家族（深淵凝視・血魔姐妹）"
        desc = "血魔一族之純血姐妹，長年鎮守全大陸最險峻危殆的丹格深淵裂口。"
        members = @("凌音 凜 (姐/守淵將軍/血魔之影司令)", "凌音 澪 (妹/血魔之影主力戰將)")
    },
    @{
        name = "9. 歐斯拉一族（天災化身與各方命脈）"
        desc = "八位代表毀滅概念的天災均冠以歐斯拉之名。而蒂雅、倷德、凜子亦帶有此古老神魔姓氏，牽動世界命運走勢。"
        members = @("伊斯里、吉希雅達、米歐、西克塔夫納爾、克羅、克羅雷亞、亞佩利德、莉亞佩蘿 (天災八實體)", "蒂雅 歐斯拉 特蘿 (雷風之妻)", "倷德 歐斯拉 卡迦 (灼炎將軍)", "凜子 歐斯拉 時空 (冥府第八傑)")
    },
    @{
        name = "10. 克斯拉神裔（天界創生之光）"
        desc = "天使神祖米迦勒的神聖結晶造就了天神王潘朵拉，雷風與天霞亦共享此神性名號。"
        members = @("米迦勒 克斯拉 戴因 (天使神祖)", "潘朵拉 克斯拉 神創 (當代天神王)", "雷風 克斯拉 修羅 (神雷將軍)", "天霞 克斯拉 寒光 (墮天光輝精銳)")
    },
    @{
        name = "11. 白雪家族（極寒術法名門）"
        desc = "白雪家族以冰寒術式與黑魔法聞名於世。風竹曾在此研習黑魔法，並將族裔悠收為養子。"
        members = @("白雪 奏 (傳奇弒魔者/無屬者)", "白雪 零 (冰神之王)", "白雪 悠 (魔劍士/赤夜風竹養子)")
    },
    @{
        name = "12. 淺野家族（文武雙璧）"
        desc = "分屬魔風戰龍部隊與潔白協奏部隊的淺野同胞。"
        members = @("淺野 歆音 (戰龍部隊核心骨幹)", "淺野 修司 (潔白協奏精銳戰士)")
    },
    @{
        name = "13. 贊恩斯一族（死境全能）"
        desc = "擁有不可思議的全能天賦與對生死之理的領悟。"
        members = @("涅米蘿伊 贊恩斯 (冥府第五傑/赤夜風竹唯一眷屬)", "塞西莉雅 瑪德萊特 (極真圃識真之花核心)")
    },
    @{
        name = "14. 貝西卡一族（生命與守護）"
        desc = "擁有妖精與神龍交融的強大防護力。"
        members = @("莎布西絲 貝西卡 (冥府第六傑 母神)", "德菈 貝西卡 (影風之巔情報防衛官)")
    }
)

foreach ($c in $clanData) {
    [void]$sb.AppendLine("### $($c.name)")
    [void]$sb.AppendLine("$($c.desc)")
    [void]$sb.AppendLine("- **族人成員**：$($c.members -join '、')")
    [void]$sb.AppendLine('')
}

# Section 5
[void]$sb.AppendLine('## 五、極真圃六識真之花與跨界同盟網')
[void]$sb.AppendLine('極真圃是少數知曉「亞雷利塔曾被多次重置」真相的超然隱密情報組織，目標為探尋重置前的終極因果：')
[void]$sb.AppendLine('- **領導者**：`伊森塔爾`（首席、金木樨）。於 11611 年遭殺害化為不死族，與流浪傭兵 `約阿希姆 克羅斯` 在冥界跋涉 300 年尋求摯友 `艾維麗娜`，終於相逢並勘破世界秘密。')
[void]$sb.AppendLine('- **六朵識真之花**：')
[void]$sb.AppendLine('  1. 「金木樨」：伊森塔爾（交際手腕通達四界，名下酒館遍布天現魔三界）')
[void]$sb.AppendLine('  2. 「火鶴花」：柔芸（於魔風島開設理髮廳暗中蒐羅天下風聲，能承受與伊森塔爾同等級之終極特辣食物）')
[void]$sb.AppendLine('  3. 「白玫瑰」：蘿克莉絲 菲爾德 慕夏（藝術家與社交名家）')
[void]$sb.AppendLine('  4. 塞西莉雅 瑪德萊特（贊恩斯宗系智囊）')
[void]$sb.AppendLine('  5. 夜川 海月（深海之靈，情報網支柱）')
[void]$sb.AppendLine('  6. 艾維麗娜（重聚之核心尋真者）')
[void]$sb.AppendLine('- **背後神明支持**：原初生命神 `萊夫維芙`、原初妖狐神暗中庇佑。')
[void]$sb.AppendLine('- **國家同盟**：12026 年極真圃於月星民國黑月市設立總部，與月星龍皇 `趙 望月` 正式結盟。')
[void]$sb.AppendLine('')

# Section 6
[void]$sb.AppendLine('## 六、世界級宿敵與歷史封印死結')
[void]$sb.AppendLine('亞雷利塔的歷史中存在著無可化解的死結與信念衝撞：')
[void]$sb.AppendLine('1. **影風之巔 vs 寂靜之音（雇傭保鏢 vs 世界暗殺者）**：')
[void]$sb.AppendLine('   - 寂靜之音三大福音（`賽西斯`、`雅希棋`、`維璐緹雅`）只要接單必行暗殺，而委託人常雇請影風之巔（`卡德 貝利索`、`十乃姐妹` 等）貼身保護，兩派成員凡相遇必有一死。')
[void]$sb.AppendLine('2. **世界賢者館 vs 亞雷利塔魔法之根協會（魔法自由研究 vs 強制世界管控）**：')
[void]$sb.AppendLine('   - 魔法之根協會（`札維爾 斯戴拉` 等五大魔賢者）試圖審查全大陸禁術，並長期向魔風軍團與獄炎帝國施加輿論惡意施壓；全知魔女 `亞卓欣德 依娜` 領導的世界賢者館則與之全面對立。')
[void]$sb.AppendLine('3. **赤夜 終焉龍 vs 賽菲爾（反抗重置者 vs 救世之名執行者）**：')
[void]$sb.AppendLine('   - 賽菲爾自詡為「救世主」，試圖以抹除萬物的世界重置來消除苦難；赤夜家族始祖終焉龍怒斥其為偽神謊言，誓以肉身斬斷輪迴。')
[void]$sb.AppendLine('4. **赤夜 風竹 vs 邪神 賽特 伊斐爾（快樂代價之封印宿怨）**：')
[void]$sb.AppendLine('   - 12013 年加拉爾地下邪神封印鬆脫，風竹為救眾人發動禁術將其封印，代價是自身喪失一半快樂情感；而賽特過往亦曾親手斬殺原初妖精王奧伯龍與龍皇多拉格。')
[void]$sb.AppendLine('')

# Section 7
[void]$sb.AppendLine('## 七、全 175 位角色人際關係索引總表')
[void]$sb.AppendLine('本表完整收錄全 175 位角色的陣營、位階、所屬宗族與其所有的雙向人際網絡：')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('| 角色名稱 | 界域 / 陣營 / 子部隊 | 強度階級 | 宗族血脈 | 核心人際關係網絡與角色連繫 |')
[void]$sb.AppendLine('| :--- | :--- | :--- | :--- | :--- |')

$charLinksMap = @{}
foreach ($l in $links) {
    if (-not $charLinksMap.ContainsKey($l.sourceName)) { $charLinksMap[$l.sourceName] = @() }
    if (-not $charLinksMap.ContainsKey($l.targetName)) { $charLinksMap[$l.targetName] = @() }
    $charLinksMap[$l.sourceName] += "$($l.targetName)（$($l.label)）"
    $charLinksMap[$l.targetName] += "$($l.sourceName)（$($l.label)）"
}

foreach ($n in $nodes) {
    $factionStr = "$($n.realm) / $($n.faction)"
    if ($n.subFaction) { $factionStr += " / $($n.subFaction)" }
    $rels = if ($charLinksMap.ContainsKey($n.name)) {
        ($charLinksMap[$n.name] | Select-Object -Unique) -join "；"
    } else {
        "所屬部隊同袍；同陣營共事"
    }
    [void]$sb.AppendLine("| **$($n.name)** | $factionStr | $($n.power) | $($n.clan) | $rels |")
}

[void]$sb.AppendLine('')
[void]$sb.AppendLine('---')
[void]$sb.AppendLine('*本檔案由亞雷利塔檔案庫自動同步生成，可搭配 `relations.html` 進行全動態星圖縮放與節點高亮檢視。*')

[System.IO.File]::WriteAllText("角色關係全圖譜.md", $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Successfully wrote 角色關係全圖譜.md ($($sb.Length) characters)!"
