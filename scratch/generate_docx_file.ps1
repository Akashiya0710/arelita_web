Add-Type -AssemblyName System.IO.Compression.FileSystem

# 1. Load data
$content = [System.IO.File]::ReadAllText("assets/data.js", [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$data = $json | ConvertFrom-Json
$chars = $data.characters

# Map characters
$charMap = @{}
foreach ($c in $chars) {
    $charMap[$c.name] = $c
}

# Helper to escape XML
function Escape-Xml([string]$str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return $str.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

# Generate rich relationships mapping
$relBook = @{}
foreach ($c in $chars) {
    $relBook[$c.name] = [System.Collections.Generic.List[string]]::new()
}

function Add-Rel($charA, $typeLabel, $charB, $note) {
    if ($relBook.ContainsKey($charA)) {
        $relBook[$charA].Add("【$typeLabel】$charB —— $note")
    }
}
function Add-MutualRel($charA, $typeLabelA, $charB, $typeLabelB, $note) {
    Add-Rel $charA $typeLabelA $charB $note
    Add-Rel $charB $typeLabelB $charA $note
}

# === 影風之巔核心羈絆 ===
Add-MutualRel "德菈 貝西卡" "救命恩人 / 養育長輩 / 依賴至親" "卡德 貝利索" "養女 / 守護對象 / 公會會長" "德菈原本是廢棄實驗室培養皿中的實驗體E-8004，德叔在經歷家庭變故後遇見沉睡的她，每天前來聊天陪伴五年。當星座神追殺德叔時，德菈破壁而出弒神斬殺雙魚座、傳送孔雀座。德叔賜予她全新姓氏「貝西卡」並帶她遊歷大陸，兩人共同建立影風之巔。德菈極愛對德叔撒嬌，最愛德叔準備的抹茶布丁。"
Add-MutualRel "德菈 貝西卡" "親自招募 / 公會庇護" "十乃 零惠" "公會會長 / 庇護者" "德菈與德叔親自登門拜訪流浪的十乃雙子，德菈輕易擋下零惠拔刀術橫斬，並許諾『只要我還活著，你妹妹便不會死』，深深打動零惠加入公會。"
Add-MutualRel "德菈 貝西卡" "親自招募 / 公會庇護" "十乃 千穗" "公會會長 / 庇護者" "德菈給予千穗極大安全感與庇護，千穗感受到德菈是真心想幫助兄妹兩人，勸哥哥一同加入影風之巔。"
Add-MutualRel "德菈 貝西卡" "親自招募 / 戰友信任" "蕾娜 琪 白娜婭" "公會會長 / 追隨者" "影魔族戰鬼蕾娜沉睡甦醒後，被德菈『天真又有正義感』的性格所打動而加入影風之巔，德菈得知蕾娜加入後興奮地要德叔做新品抹茶布丁慶祝。"
Add-MutualRel "十乃 零惠" "同胞親妹妹" "十乃 千穗" "同胞親哥哥" "十乃家族雙子兄妹，因詛咒無法完全發揮拔刀術遭家族冷落後一同出逃當僱傭兵。千穗為零惠不願拔刀，零惠為保護妹妹研發冥狐拔刀術・改，兩人是公會知名的最強雙人組。"
Add-MutualRel "卡德 貝利索" "親自引薦" "十乃 零惠" "公會長輩 / 德叔" "隨德菈一同登門招募雙子加入影風之巔。"
Add-MutualRel "卡德 貝利索" "親自引薦" "十乃 千穗" "公會長輩 / 德叔" "隨德菈一同登門招募雙子加入影風之巔。"
Add-MutualRel "卡德 貝利索" "公會長輩 / 德叔" "蕾娜 琪 白娜婭" "公會後輩 / 戰友" "蕾娜加入影風之巔後常請德叔準備特製抹茶布丁。"

# 影風之巔內部七影同僚
$yfMembers = @("德菈 貝西卡", "卡德 貝利索", "十乃 千穗", "十乃 零惠", "蕾娜 琪 白娜婭", "普彌爾 德萊", "希德恩 阿斯拉 加拉爾", "輝星 月", "盧克斯")
foreach ($m1 in $yfMembers) {
    foreach ($m2 in $yfMembers) {
        if ($m1 -ne $m2 -and -not ($relBook[$m1] | Where-Object { $_ -match [regex]::Escape($m2) })) {
            Add-Rel $m1 "公會核心成員 / 七影" $m2 "同屬影風之巔核心成員，共同承接世界級情報、防衛與護衛委託。"
        }
    }
}

# 影風之巔 vs 寂靜之音
$jjMembers = @("賽西斯 詹納瓦茲", "雅希棋 艾比斯", "維璐緹雅")
foreach ($yf in $yfMembers) {
    foreach ($jj in $jjMembers) {
        Add-Rel $yf "世界級宿命死敵" $jj "寂靜之音接單暗殺，影風之巔接單防衛護衛，委託任務時常交鋒廝殺，不死不休。"
        Add-Rel $jj "世界級宿命死敵" $yf "暗殺任務與影風之巔護衛長年正面撞車，不死不休。"
    }
}

# === 赤夜家族 ===
Add-MutualRel "赤夜 風竹" "親妹妹" "赤夜 花幽" "親哥哥" "赤夜家族宗家長兄與妹妹。幼年時家族遭襲花幽被擄走洗腦，多年後在希爾瓦倫戰役相逢，風竹捨身喚醒其童年記憶並將她接回家中視為至寶守護。"
Add-MutualRel "赤夜 終焉龍" "始祖與家主" "赤夜 風竹" "赤夜始祖" "赤夜家族始祖、超越眾神之人，傳承宗家血脈與不屈意志。"
Add-MutualRel "赤夜 終焉龍" "始祖與族裔" "赤夜 花幽" "赤夜始祖" "赤夜始祖傳承至魔斬女武神花幽。"

# === 凱撒家族 ===
Add-MutualRel "阿撒托斯 阿斯拉 凱撒" "親妹妹" "艾娜托斯 阿斯拉 凱撒" "親哥哥" "魔界凱撒家族長子與次女。妹妹因天生排魔體質遭家族歧視，阿撒托斯誓死守護妹妹，艾娜托斯對哥哥極為敬重與依賴。"
Add-MutualRel "阿撒托斯 阿斯拉 凱撒" "堂兄弟" "格赫羅 阿斯拉 凱撒" "堂兄弟" "格赫羅為凱撒家族分支薪火傳承者，阿撒托斯以真心接納他，兩人情同手足。"
Add-MutualRel "艾娜托斯 阿斯拉 凱撒" "堂兄妹" "格赫羅 阿斯拉 凱撒" "堂兄妹" "同屬凱撒家族，格赫羅亦非常照顧受家族排擠的堂妹艾娜托斯。"
Add-MutualRel "安丁夏坦 阿斯拉 凱撒" "遠祖與長子" "阿撒托斯 阿斯拉 凱撒" "遠祖魔王" "3000年前極寒暴君魔王與當代凱撒長子阿撒托斯之跨時代血脈。"
Add-MutualRel "阿撒托斯 阿斯拉 凱撒" "同族魔裔" "姵莉絲 阿斯拉 克里" "同族魔裔" "魔界古老阿斯拉血族分支族裔。"
Add-MutualRel "阿撒托斯 阿斯拉 凱撒" "同宗戰將" "奎札爾 阿斯拉 密涅瓦" "同宗魔裔" "阿斯拉古族名門血系同胞。"

# === 修羅一族 ===
Add-MutualRel "雷風 克斯拉 修羅" "同胞雙胞胎兄弟" "烈火 艾克斯 修羅" "同胞雙胞胎兄弟" "聖魔領域誕生的同胞雙生子。12011年雙雙加入赤夜風竹的魔風冒險團，並肩經歷惡魔之戰與無數生死試煉，為魔風聯邦兩大王牌將軍。"
Add-MutualRel "雷風 克斯拉 修羅" "夫妻伴侶" "蒂雅 歐斯拉 特蘿" "丈夫" "雷風在第二次惡魔之戰後外出修行結識蒂雅，兩人相知相戀，修行歸來後雷風攜蒂雅一同加入魔風聯邦安家立業。"

# === 加拉爾王族 ===
Add-MutualRel "炎火 加拉爾" "親妹妹" "憂娜 加拉爾" "親哥哥" "火之帝國加拉爾公國毀滅後，年幼的王子炎火（12歲）與公主憂娜（8歲）被赤夜風竹捨命救出，長大後雙雙投身魔風聯邦獄炎監察部隊守護法紀。"
Add-MutualRel "伊格那利昂 加拉爾" "火神祖與後裔" "炎火 加拉爾" "火元素神祖" "加拉爾王國所信仰與傳承的原初火元素神神祖。"
Add-MutualRel "伊格那利昂 加拉爾" "火神祖與後裔" "憂娜 加拉爾" "火元素神祖" "火元素神神脈與聖火魔女憂娜。"
Add-MutualRel "凱 加拉爾" "同脈死神" "炎火 加拉爾" "加拉爾神裔" "加拉爾同脈之中司掌死亡的神明。"
Add-MutualRel "凱 加拉爾" "同脈死神" "憂娜 加拉爾" "加拉爾神裔" "加拉爾同脈之中司掌死亡的神明。"

# === 撒旦魔神系 ===
Add-MutualRel "別西卜 阿斯拉 撒旦" "魔神姐弟" "路西法 阿斯拉 撒旦" "魔神姐弟" "原初三魔神之大姐與二哥。別西卜實力最強卻身材嬌小、性喜和平；路西法為魔族首席大腦，常出面調解三神與全魔界事務。"
Add-MutualRel "路西法 阿斯拉 撒旦" "魔神兄弟" "貝利爾 阿斯拉 撒旦" "魔神兄弟" "路西法二哥與防禦最強的三弟貝利爾。"
Add-MutualRel "別西卜 阿斯拉 撒旦" "魔神姐弟" "貝利爾 阿斯拉 撒旦" "魔神姐弟" "別西卜經常惡整防禦力極高卻單純的三弟貝利爾。"
Add-MutualRel "路西法 阿斯拉 撒旦" "造主與化身" "索亞德 托斯卡 撒旦" "神權造主" "路西法以自身神權塑造索亞德，使其與智慧魔神神格完美吻合，繼承智者位格後前往魔風擔任總參謀長。"
Add-MutualRel "索亞德 托斯卡 撒旦" "魔神同盟" "別西卜 阿斯拉 撒旦" "當代智慧魔神" "索亞德身為當代智慧魔神，受原初魔神認可與信任。"
Add-MutualRel "索亞德 托斯卡 撒旦" "魔神同盟" "貝利爾 阿斯拉 撒旦" "當代智慧魔神" "索亞德身為當代智慧魔神，受原初魔神認可與信任。"
Add-MutualRel "黑帝斯 阿斯拉 洛斯提亞" "魔界同脈" "路西法 阿斯拉 撒旦" "冥府魔神" "魔界阿斯拉洛斯提亞冥府魔神族裔。"

# === 尼達羅斯龍神族 ===
Add-MutualRel "蘿希加勒美 尼達羅斯" "龍神神祖" "雷格納 尼達羅斯" "煌龍將軍" "尼達羅斯一族的龍神神祖，與魔風戰龍將軍雷格納流淌相同的煌龍神血。"
Add-MutualRel "雷格納 尼達羅斯" "同族將兵" "西格德 尼達羅斯" "煌龍長官" "戰龍部隊中的尼達羅斯同宗族人。"

# === 星野與凌音家族 ===
Add-MutualRel "星野 蒼空" "親妹妹" "星野 晴奈" "親哥哥" "星野一族兄妹。哥哥為掌控星辰的魔風獨立特級，妹妹為陰暗幽鬼絕影將軍，彼此照應深厚。"
Add-MutualRel "凌音 凜" "親妹妹" "凌音 澪" "親姐姐" "血魔之影司令守淵將軍凌音凜與妹妹凌音澪，姐妹共同鎮守聯邦最凶險的丹格深淵之口。"

# === 白雪與淺野家族 ===
Add-MutualRel "白雪 奏" "家族前輩" "白雪 悠" "白雪魔劍士" "古老白雪術式與魔劍傳承者。"
Add-MutualRel "白雪 零" "冰神神祖" "白雪 悠" "白雪後裔" "冰神之王白雪零與白雪族裔悠。"
Add-MutualRel "赤夜 風竹" "養父子 / 師徒" "白雪 悠" "養父 / 總司令" "赤夜風竹曾在白雪家修習黑魔法，後收養白雪悠為養子，傳授並庇護之。"
Add-MutualRel "淺野 歆音" "同族兄妹" "淺野 修司" "同族兄妹" "戰龍部隊核心淺野歆音與潔白協奏部隊淺野修司。"

# === 克斯拉神族 ===
Add-MutualRel "米迦勒 克斯拉 戴因" "天使神祖" "潘朵拉 克斯拉 神創" "神祖創生 / 天神王" "潘朵拉誕生於天使神祖米迦勒的天使神創結晶，並完全繼承神性登上天神王之位。"
Add-MutualRel "米迦勒 克斯拉 戴因" "聖魔共鳴" "雷風 克斯拉 修羅" "天神神祖" "共享克斯拉神聖名號與天界試煉同源之力。"

# === 魔風聯邦最高指揮樞紐 ===
Add-MutualRel "赤夜 風竹" "生死莫逆 / 副司令" "阿撒托斯 阿斯拉 凱撒" "生死莫逆 / 總司令" "魔風聯邦最高決策雙壁。風竹雷厲風行、阿撒托斯霸道勇猛，兩人為多年生死莫逆、共掌魔風大權。"
Add-MutualRel "赤夜 風竹" "總參謀長 / 首席智囊" "索亞德 托斯卡 撒旦" "最高統帥" "風竹掌軍、索亞德運籌帷幄，極致智謀與鐵血決斷相得益彰。"
Add-MutualRel "赤夜 風竹" "貼身秘書" "銀 塵夜" "最高統帥" "銀塵夜為風竹貼身心腹秘書，掌理魔風行政中樞與機密文書。"
Add-MutualRel "阿撒托斯 阿斯拉 凱撒" "魔神聯邦同僚" "索亞德 托斯卡 撒旦" "魔神聯邦同僚" "同為惡魔神位執掌者，在魔風最高層協同指揮海陸空軍勢。"

# === 赤夜風竹直屬冥府神傑 (9傑) ===
$minfuMembers = @("黑卡蒂 拉普拉斯", "克蘭努克 歐塔", "艾琳絲塔希 康多拉", "福玻斯 里拉 阿斯克勒", "涅米蘿伊 贊恩斯", "莎布西絲 貝西卡", "格赫羅 阿斯拉 凱撒", "凜子 歐斯拉 時空", "青 黎")
for ($i=0; $i -lt $minfuMembers.Count; $i++) {
    $mName = $minfuMembers[$i]
    $seat = "第 $($i+1) 傑"
    Add-MutualRel "赤夜 風竹" "冥府神傑 ($seat)" $mName "直屬最高統帥" "赤夜風竹親自設立之直屬極密特種部隊，戰力抵過全軍團總和，成員只聽令於最高司令一人。"
}
Add-MutualRel "赤夜 風竹" "神明與唯一眷屬" "涅米蘿伊 贊恩斯" "主神 (亡靈神)" "涅米蘿伊為當世唯一的亡靈神赤夜風竹神明眷屬，對風竹懷有極端崇敬與執念。"
Add-MutualRel "赤夜 風竹" "家族管家 / 戰友" "艾琳絲塔希 康多拉" "家主 / 總司令" "劍之女神艾琳同時兼任赤夜家族最高管家，照料赤夜家府邸與風竹日常生活。"
Add-MutualRel "赤夜 風竹" "百年至交摯友" "張 琦" "百年知己" "12013年結識的死神（234歲），被風竹視為至交，張琦立誓為風竹與魔風尋訪拉攏天下潛力奇才。"
Add-MutualRel "赤夜 風竹" "至高盟友" "潘朵拉 克斯拉 神創" "至高盟友" "天神王潘朵拉探索現界時與赤夜風竹結盟，在兩界大戰中全力馳援魔風聯邦。"
Add-MutualRel "赤夜 風竹" "親密戰友" "\"毒牙\"" "親密戰友" "天真強大的毒神，與風竹私交甚篤，經常出現在魔風重要戰役支援。"
Add-MutualRel "赤夜 風竹" "國家盟友" "趙 望月" "國家盟友" "月星民國月星龍皇趙望月與魔風聯邦締結互保軍事盟約。"
Add-MutualRel "赤夜 風竹" "國家盟約" "德貢 阿茲拉格" "國家盟約" "魔風建國初期赤夜風竹親赴龍島與哈維德恩帝國締結盟約。"
Add-MutualRel "赤夜 風竹" "封印死敵" "賽特 伊斐爾" "封印仇敵" "12013年風竹率隊誤入邪神封印地，為救同伴動用禁術將賽特重新封印，代價是自身喪失一半快樂情緒。"

# === 軍團八部隊將軍 ===
$generals = @(
    @{ name="雷風 克斯拉 修羅"; dept="雷霆殿"; title="神雷將軍" },
    @{ name="烈火 艾克斯 修羅"; dept="紅蓮組"; title="不破將軍" },
    @{ name="雷格納 尼達羅斯"; dept="戰龍"; title="煌龍將軍" },
    @{ name="蘿雅絲 瑟 阿爾法"; dept="潔白協奏"; title="神曲將軍" },
    @{ name="水無月 夜風"; dept="夜妖"; title="玄狐將軍" },
    @{ name="倷德 歐斯拉 卡迦"; dept="墮天光輝"; title="灼炎將軍" },
    @{ name="凌音 凜"; dept="血魔之影"; title="守淵將軍" },
    @{ name="星野 晴奈"; dept="陰暗幽鬼"; title="絕影將軍" }
)
foreach ($g in $generals) {
    Add-MutualRel "赤夜 風竹" "軍團將軍 ($($g.title))" $g.name "最高總司令" "統帥直轄八大正規軍團將軍，各率三十餘萬精銳鎮守一國直轄市。"
}

$legions = @{
    "雷風 克斯拉 修羅" = @("田也 嵐心", "沈 憾", "阿爾希亞 斯諦 羅修斯", "蒂雅 歐斯拉 特蘿", "羅 彌生")
    "烈火 艾克斯 修羅" = @("不明~~（清水 若雨）~~", "村宮 早乙女", "趙 清夏", "織田 野寺", "櫻上 千夏")
    "雷格納 尼達羅斯" = @("伊絲波 伽德", "西格德 尼達羅斯", "忻天 艾姆雷朵 薩恩", "李 榮", "芬里斯 白以格西", "雨宮 紗莉奈", "納多流士 格尼爾森", "淺野 歆音")
    "蘿雅絲 瑟 阿爾法" = @("白川 咲", "奎札爾 阿斯拉 密涅瓦", "淺野 修司")
    "水無月 夜風" = @("月影 伊萊", "白雪 悠", "旭翼", "百夜 奈", "祈奈 魁", "修莉雅", "鬼龍院 赫羿", "斯卡特 提拉", "黑羽 曉夜", "闇淤 加美羽", "櫻上 尹二")
    "倷德 歐斯拉 卡迦" = @("天桐 艾", "天霞 克斯拉 寒光", "伏黑 夜", "影之")
    "凌音 凜" = @("千 維斯特利亞", "血羽 佛拉德", "凌音 澪", "蕾涅莉亞 妃葉斯")
    "星野 晴奈" = @("星野 蒼空", "冥藏 七翔")
}
foreach ($gen in $legions.Keys) {
    foreach ($mem in $legions[$gen]) {
        Add-MutualRel $gen "部隊隊員" $mem "部隊將軍" "所屬軍團正規隊員，接受將軍指揮調派。"
    }
}

# 獄炎監察部隊
$yuyanMembers = @("憂娜 加拉爾", "有栖 櫻雪", "姵莉絲 阿斯拉 克里", "哲也 和人", "納克 狄姆")
foreach ($ym in $yuyanMembers) {
    Add-MutualRel "炎火 加拉爾" "獄炎隊員" $ym "大隊長" "獄炎監察部隊同僚，負責監察聯邦防貪反叛。"
}

# SECT 特殊事件對策組
$sectMembers = @("中野 繪里", "矢野 海翔", "狙櫻", "柳霧", "蒼", "蒼風 貓音", "賴 亭瑋")
foreach ($sm in $sectMembers) {
    Add-MutualRel "鹿苑寺 照寺" "SECT組員" $sm "組長" "SECT特殊事件對策組成員，處理反恐與重大突發事件。"
}

# 獨立特級
foreach ($spec in @("月夜", "寺山 夜明", "艾娜托斯 阿斯拉 凱撒", "赤夜 花幽", "傑瑞 吳 阿爾法")) {
    Add-MutualRel "赤夜 風竹" "獨立特級" $spec "最高統帥直屬" "特許享有獨立行動權，除最高司令與副司令外無人能下令。"
}

# 極真圃尋真之花
Add-MutualRel "伊森塔爾" "三百年患難摯友" "約阿希姆 克羅斯" "三百年患難摯友" "伊森塔爾甦醒後與約阿希姆結識，兩人在冥界遊蕩探索三百年，出生入死尋找艾維麗娜並勘破世界真相。"
Add-MutualRel "伊森塔爾" "苦尋之至交" "艾維麗娜" "重聚友人" "伊森塔爾與約阿希姆執著三百年的心結，後艾維麗娜平安歸來加入極真圃。"
Add-MutualRel "約阿希姆 克羅斯" "尋回之友人" "艾維麗娜" "尋回之友人" "三百年追尋終得重聚。"
Add-MutualRel "伊森塔爾" "情報站長 / 食辣盟友" "柔 芸" "金木樨領導者" "柔芸為極真圃火鶴花，於魔風島開設理髮廳蒐集各界情報，能吃與伊森塔爾同階超辣食物。"
Add-MutualRel "伊森塔爾" "識真之花核心" "塞西莉雅 瑪德萊特" "金木樨領導者" "極真圃骨幹核心。"
Add-MutualRel "伊森塔爾" "識真之花核心" "夜川 海月" "金木樨領導者" "極真圃骨幹核心。"
Add-MutualRel "伊森塔爾" "識真之花核心" "蘿克莉絲 菲爾德 慕夏" "金木樨領導者" "白玫瑰蘿克莉絲，極真圃核心交際大師。"
Add-MutualRel "伊森塔爾" "戰略盟友" "趙 望月" "盟友" "12026年極真圃總部設於月星民國黑月市，與趙望月正式結盟。"
Add-MutualRel "萊夫維芙" "神明後盾" "伊森塔爾" "尋真者" "原初生命神萊夫維芙暗中支持極真圃探求世界重置之真相。"

# 銀狼傭兵公會
Add-MutualRel "白川 咲" "公會雙巨頭" "傑瑞 吳 阿爾法" "公會雙巨頭" "銀狼傭兵公會最高決策核心。"
$sevenSilver = @("千葉 涼子", "李 書豪", "貝雷 尼古拉", "欣夜 月雪", "奎恩 格里芬", "茉羽 凛音", "萊恩 希爾法")
foreach ($sev in $sevenSilver) {
    Add-MutualRel "白川 咲" "七銀主力" $sev "公會長" "銀狼公會七銀主力戰將。"
}

# 寂靜之音內部三大福音
Add-MutualRel "賽西斯 詹納瓦茲" "三大福音同袍" "雅希棋 艾比斯" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"
Add-MutualRel "雅希棋 艾比斯" "三大福音同袍" "維璐緹雅" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"
Add-MutualRel "賽西斯 詹納瓦茲" "三大福音同袍" "維璐緹雅" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"

# 世界賢者館
Add-MutualRel "亞卓欣德 依娜" "大賢者與魔女" "安媞 娜德亞" "全知魔女" "世界賢者館全知魔女與五魔女核心。"
Add-MutualRel "亞卓欣德 依娜" "大賢者與魔女" "克勞蒂亞 法馮 莰蒂絲" "全知魔女" "世界賢者館湮滅魔女。"
Add-MutualRel "札維爾 斯戴拉" "學術與權力對立" "亞卓欣德 依娜" "魔法之根協會對手" "魔法之根協會試圖監管全大陸魔法，遭世界賢者館強力抵制抗衡。"

# 日月神系與死神系
Add-MutualRel "尤諾拉 倪克斯" "日月交輝雙神" "迪米諾拉 赫墨拉" "日月交輝雙神" "星月女神與日耀女神，執掌宇宙晝夜交替的神座級神明。"
Add-MutualRel "張 琦" "冥界死神同盟" "莉琪雅 神隱" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"
Add-MutualRel "莉琪雅 神隱" "冥界死神同盟" "凱 加拉爾" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"
Add-MutualRel "張 琦" "冥界死神同盟" "凱 加拉爾" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"

# 歷史死決
Add-MutualRel "赤夜 終焉龍" "救世理念死決" "賽菲爾" "反抗重置者" "終焉龍痛斥賽菲爾以「救世」之名不斷將整個亞雷利塔重置輪迴，誓言粉碎其偽神救世計畫。"
Add-MutualRel "賽特 伊斐爾" "弒神之仇" "奧伯龍" "被弒妖精神" "邪神賽特曾親手斬殺原初精靈神奧伯龍。"
Add-MutualRel "賽特 伊斐爾" "弒神之仇" "多拉格" "被弒龍皇" "邪神賽特曾親手斬殺原初龍神新龍皇多拉格。"
Add-MutualRel "雷風 克斯拉 修羅" "惡魔之戰宿敵" "貝利爾 阿斯拉 撒旦" "斬殺之敵" "第一次惡魔之戰中雷風手刃復活的原初魔王貝利爾。"
Add-MutualRel "米迦勒 克斯拉 戴因" "天魔神祖死決" "別西卜 阿斯拉 撒旦" "天魔神祖死決" "天界與魔界最高神祖的萬年對立。"
Add-MutualRel "暗 斯卡奇" "冥界鎮壓之仇" "黑卡蒂 拉普拉斯" "鎮壓者" "暗元素神在冥界暴走，被黑卡蒂施以神威無情鎮壓收押牢獄。"

Write-Output "Generating WordML document.xml..."

# 2. Build WordprocessingML
$xml = [System.Text.StringBuilder]::new()
[void]$xml.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$xml.Append('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">')
[void]$xml.Append('<w:body>')

# Helper for paragraph
function Write-P($text, $size=22, $bold=$false, $color="333333", $align="left", $spaceAfter=120) {
    $eText = Escape-Xml $text
    $bTag = if ($bold) { "<w:b/><w:bCs/>" } else { "" }
    return "<w:p><w:pPr><w:jc w:val=""$align""/><w:spacing w:after=""$spaceAfter""/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=""Microsoft JhengHei"" w:eastAsia=""Microsoft JhengHei"" w:hAnsi=""Microsoft JhengHei""/><w:color w:val=""$color""/><w:sz w:val=""$size""/><w:szCs w:val=""$size""/>$bTag</w:rPr><w:t>$eText</w:t></w:r></w:p>"
}

function Write-Heading1($text) {
    return Write-P $text 36 $true "0F172A" "left" 240
}

function Write-Heading2($text, $color="0284C7") {
    return Write-P $text 28 $true $color "left" 180
}

function Write-Bullet($prefix, $text, $color="334155") {
    $ePre = Escape-Xml $prefix
    $eTxt = Escape-Xml $text
    return "<w:p><w:pPr><w:ind w:left=""360"" w:hanging=""240""/><w:spacing w:after=""80""/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=""Microsoft JhengHei"" w:eastAsia=""Microsoft JhengHei"" w:hAnsi=""Microsoft JhengHei""/><w:b/><w:color w:val=""0284C7""/><w:sz w:val=""21""/><w:szCs w:val=""21""/></w:rPr><w:t>$ePre </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii=""Microsoft JhengHei"" w:eastAsia=""Microsoft JhengHei"" w:hAnsi=""Microsoft JhengHei""/><w:color w:val=""$color""/><w:sz w:val=""21""/><w:szCs w:val=""21""/></w:rPr><w:t>$eTxt</w:t></w:r></w:p>"
}

# Document Title
[void]$xml.Append((Write-P "亞雷利塔 ARELITA" 48 $true "0369A1" "center" 100))
[void]$xml.Append((Write-P "全角色關係詳細條列手冊（手動審校與修改版）" 32 $true "1E293B" "center" 240))
[void]$xml.Append((Write-P "包含全五界 175 位角色・主從統御・名門血脈・戰友盟約・宿命死仇・自訂補充填寫欄" 22 $false "64748B" "center" 400))
[void]$xml.Append((Write-P "────────────────────────────────────────────────────────────" 18 $false "CBD5E1" "center" 300))

[void]$xml.Append((Write-P "【本手冊使用指南】" 24 $true "0F172A" "left" 120))
[void]$xml.Append((Write-P "1. 本手冊完整收錄《亞雷利塔》世界觀現有全 175 位角色，依據各大陣營與組織章節清晰分類。" 20 $false "475569" "left" 80))
[void]$xml.Append((Write-P "2. 每個角色區塊包含【基本資訊】、【核心人際關係條列】以及【原著重要喜惡情報】。" 20 $false "475569" "left" 80))
[void]$xml.Append((Write-P "3. 每個角色最下方均專門設置【手動修改與補充關係】底線欄位，方便您直接在 Word 中打字調整、修改或新增人物連繫！" 20 $false "475569" "left" 300))

# Group characters by Faction
$factionGroups = $chars | Group-Object { "$($_.realm) / $($_.faction)" } | Sort-Object Count -Descending

$charCounter = 1

foreach ($fg in $factionGroups) {
    [void]$xml.Append((Write-Heading1 "■ 陣營專題：$($fg.Name)（共 $($fg.Count) 位角色）"))
    
    # Subgroup by subFaction
    $subGroups = $fg.Group | Group-Object subFaction
    foreach ($sg in $subGroups) {
        $subTitle = if ($sg.Name) { "【$($sg.Name)】" } else { "【本部 / 直轄】" }
        [void]$xml.Append((Write-Heading2 "▼ $subTitle ($($sg.Count) 位)" "0D9488"))

        foreach ($c in $sg.Group) {
            $numStr = "{0:D3}" -f $charCounter
            $charCounter++

            # Character Title & Header
            $headerLine = "No.$numStr　$($c.name)"
            if ($c.profile.稱號) { $headerLine += "（$($c.profile.稱號)）" }
            [void]$xml.Append((Write-P $headerLine 24 $true "0F172A" "left" 100))

            # Basic Info
            $deptStr = "$($c.realm) / $($c.faction)"
            if ($c.subFaction) { $deptStr += " / $($c.subFaction)" }
            [void]$xml.Append((Write-Bullet "•" "所屬定位：$deptStr"))
            [void]$xml.Append((Write-Bullet "•" "戰力階級：$($c.power)　｜　種族：$($c.profile.種族)　｜　善惡判定：$($c.profile.善惡)"))
            if ($c.profile.屬性) {
                [void]$xml.Append((Write-Bullet "•" "執掌屬性：$($c.profile.屬性)"))
            }
            if ($c.profile.群體) {
                [void]$xml.Append((Write-Bullet "•" "所屬群體：$($c.profile.群體)"))
            }

            # Relationships
            [void]$xml.Append((Write-P "  【已確認之人際連繫網絡】" 21 $true "0369A1" "left" 60))
            $rels = $relBook[$c.name]
            if ($rels -and $rels.Count -gt 0) {
                foreach ($r in $rels) {
                    [void]$xml.Append((Write-Bullet "  ▶" $r "1E293B"))
                }
            } else {
                [void]$xml.Append((Write-Bullet "  ▶" "同陣營軍團同袍共事，暫無特殊歷史恩怨登記。" "64748B"))
            }

            # Likes & Dislikes
            if ($c.profile.喜歡) {
                [void]$xml.Append((Write-Bullet "  ★" "喜歡的人事物：$($c.profile.喜歡)" "047857"))
            }
            if ($c.profile.討厭) {
                [void]$xml.Append((Write-Bullet "  ✖" "厭惡或敵對：$($c.profile.討厭)" "B91C1C"))
            }

            # Editable Blank Box for User Manual Modification
            [void]$xml.Append((Write-P "  ［手動修改與補充關係］：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿" 19 $false "64748B" "left" 60))
            [void]$xml.Append((Write-P "  ［個人備註／設定微調］：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿" 19 $false "64748B" "left" 180))
            [void]$xml.Append((Write-P "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈" 16 $false "E2E8F0" "left" 200))
        }
    }
}

# End body
[void]$xml.Append('<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>')
[void]$xml.Append('</w:body></w:document>')

# Write document.xml into extracted template
$docXmlPath = "scratch\build_docx_temp\word\document.xml"
[System.IO.File]::WriteAllText($docXmlPath, $xml.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Successfully wrote document.xml ($($xml.Length) chars)!"

# Pack into target docx with forward slashes
function Pack-Docx($sourceDir, $targetDocx) {
    if (Test-Path $targetDocx) { Remove-Item $targetDocx -Force }
    $zip = [System.IO.Compression.ZipFile]::Open($targetDocx, [System.IO.Compression.ZipArchiveMode]::Create)
    $files = Get-ChildItem -Path $sourceDir -Recurse -File
    foreach ($f in $files) {
        if ($f.Name -eq "desktop.ini") { continue }
        $relPath = $f.FullName.Substring($sourceDir.Length).TrimStart("\", "/").Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $relPath) | Out-Null
    }
    $zip.Dispose()
}

$outDocx = "G:\我的雲端硬碟\亞雷利塔相關\亞雷利塔全角色關係條列手冊.docx"
$fullSrcDir = (Convert-Path "scratch\build_docx_temp")
Pack-Docx $fullSrcDir $outDocx

Write-Output "Successfully generated docx at $outDocx"
Write-Output "File Size: $((Get-Item $outDocx).Length) bytes!"

# Clean up temp
Remove-Item "scratch\build_docx_temp" -Recurse -Force