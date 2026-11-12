$dataPath = "assets/data.js"
$content = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)
$prefix = "window.ARELITA_DATA = "
$json = $content.Substring($prefix.Length).TrimEnd(";", "`r", "`n", " ")
$rawObj = $json | ConvertFrom-Json
$chars = $rawObj.characters

Write-Output "Generating rich relations graph for 175 characters..."

# Build character map
$charMap = @{}
foreach ($c in $chars) {
    $charMap[$c.name] = $c
}

# Define Nodes
$nodes = @()
foreach ($c in $chars) {
    $clan = "其他/獨立"
    $name = $c.name
    
    if ($name -match "^赤夜") { $clan = "赤夜家族" }
    elseif ($name -match "凱撒|阿斯拉 凱撒|阿斯拉 克里|卡洛伊") { $clan = "凱撒家族" }
    elseif ($name -match "修羅|烈火|雷風") { $clan = "修羅一族" }
    elseif ($name -match "加拉爾") { $clan = "加拉爾王族" }
    elseif ($name -match "撒旦|索亞德|黑帝斯") { $clan = "撒旦魔神系" }
    elseif ($name -match "尼達羅斯") { $clan = "尼達羅斯龍族" }
    elseif ($name -match "^星野") { $clan = "星野家族" }
    elseif ($name -match "^凌音") { $clan = "凌音家族" }
    elseif ($name -match "^白雪") { $clan = "白雪家族" }
    elseif ($name -match "歐斯拉") { $clan = "歐斯拉一族" }
    elseif ($name -match "克斯拉") { $clan = "克斯拉神裔" }
    elseif ($name -match "贊恩斯") { $clan = "贊恩斯一族" }
    elseif ($name -match "貝西卡") { $clan = "貝西卡一族" }
    elseif ($name -match "^淺野") { $clan = "淺野家族" }
    elseif ($name -match "^十乃") { $clan = "十乃家族" }
    elseif ($name -match "^櫻上") { $clan = "櫻上家族" }
    elseif ($name -match "^祈奈") { $clan = "祈奈妖狐族" }
    elseif ($c.faction -eq "極真圃" -or $name -in @("約阿希姆 克羅斯", "趙 望月")) { $clan = "極真圃尋真羈絆" }
    elseif ($c.faction -eq "銀狼傭兵公會") { $clan = "銀狼公會" }
    elseif ($c.faction -eq "寂靜之音") { $clan = "寂靜之音" }
    elseif ($c.faction -eq "影風之巔") { $clan = "影風之巔" }
    elseif ($c.faction -eq "世界賢者館") { $clan = "世界賢者館" }

    $nodes += [PSCustomObject]@{
        id = $c.id
        name = $c.name
        realm = $c.realm
        faction = $c.faction
        subFaction = $c.subFaction
        title = $c.profile.稱號
        power = $c.power
        race = $c.profile.種族
        gender = $c.profile.性別
        alignment = $c.profile.善惡
        clan = $clan
        image = $c.image
        story = $c.story
        likes = $c.profile.喜歡
        dislikes = $c.profile.討厭
    }
}

Write-Output "Created $($nodes.Count) nodes."

# We will collect edges into a list
$edges = [System.Collections.Generic.List[PSCustomObject]]::new()
$edgeSet = [System.Collections.Generic.HashSet[string]]::new()

function Add-Edge($sName, $tName, $type, $label, $desc) {
    if (-not $charMap.ContainsKey($sName) -or -not $charMap.ContainsKey($tName)) { return }
    $key = "$sName -> $tName ($type)"
    $revKey = "$tName -> $sName ($type)"
    if ($edgeSet.Contains($key) -or $edgeSet.Contains($revKey)) { return }
    $edgeSet.Add($key) | Out-Null

    $sChar = $charMap[$sName]
    $tChar = $charMap[$tName]
    $script:edges.Add([PSCustomObject]@{
        source = $sChar.id
        sourceName = $sName
        target = $tChar.id
        targetName = $tName
        type = $type      # family, superior, comrade, ally, rival, romance, master
        label = $label
        desc = $desc
    })
}

# 1. 赤夜家族
Add-Edge "赤夜 風竹" "赤夜 花幽" "family" "親兄妹" "赤夜家族長兄與妹妹。幼年時家族遭襲花幽被擄走洗腦，多年後在希爾瓦倫戰役相逢，風竹不顧傷勢深情擁抱並喚醒其童年記憶，將她接回家中視為至寶守護。"
Add-Edge "赤夜 終焉龍" "赤夜 風竹" "family" "始祖與家主" "赤夜家族的無上始祖、超越眾神之人，與當代本家第一繼承人家主赤夜風竹傳承血脈意志。"
Add-Edge "赤夜 終焉龍" "赤夜 花幽" "family" "始祖與後裔" "終焉龍始祖血脈傳承至魔斬女武神赤夜花幽。"

# 2. 凱撒家族
Add-Edge "阿撒托斯 阿斯拉 凱撒" "艾娜托斯 阿斯拉 凱撒" "family" "親兄妹" "魔界最古老名門凱撒家族的長子與次女。妹妹因天生排魔體質遭家族歧視，阿撒托斯誓死守護妹妹，艾娜托斯對哥哥極為敬重與依賴。"
Add-Edge "阿撒托斯 阿斯拉 凱撒" "格赫羅 阿斯拉 凱撒" "family" "堂兄弟" "格赫羅為凱撒家族分支之子、薪火傳承者，阿撒托斯以真心接納他，兩人情同手足。"
Add-Edge "艾娜托斯 阿斯拉 凱撒" "格赫羅 阿斯拉 凱撒" "family" "堂兄妹" "同屬凱撒家族，格赫羅亦非常照顧受家族排擠的堂妹艾娜托斯。"
Add-Edge "安丁夏坦 阿斯拉 凱撒" "阿撒托斯 阿斯拉 凱撒" "family" "遠祖與長子" "3000年前極寒暴君魔王與當代凱撒長子阿撒托斯之跨時代血脈。"
Add-Edge "阿撒托斯 阿斯拉 凱撒" "姵莉絲 阿斯拉 克里" "family" "同族魔裔" "魔界古老阿斯拉血族分支族裔。"
Add-Edge "阿撒托斯 阿斯拉 凱撒" "奎札爾 阿斯拉 密涅瓦" "family" "同宗魔裔" "阿斯拉古族名門血系同胞。"

# 3. 修羅一族
Add-Edge "雷風 克斯拉 修羅" "烈火 艾克斯 修羅" "family" "雙胞胎兄弟" "聖魔領域誕生的同胞雙生子。12011年雙雙加入赤夜風竹的魔風冒險團，並肩經歷第一次、第二次惡魔之戰與無數生死試煉，為魔風聯邦兩大王牌將軍。"
Add-Edge "雷風 克斯拉 修羅" "蒂雅 歐斯拉 特蘿" "romance" "夫妻伴侶" "雷風在第二次惡魔之戰後外出修行結識蒂雅，兩人相知相戀，修行歸來後雷風攜蒂雅一同加入魔風聯邦安家立業。"
Add-Edge "烈火 艾克斯 修羅" "烈心 艾克斯 修羅" "family" "同族兄弟" "修羅一族同胞兄弟，隸屬紅蓮組。"

# 4. 加拉爾王族
Add-Edge "炎火 加拉爾" "憂娜 加拉爾" "family" "親兄妹" "火之帝國加拉爾公國毀滅後，年幼的王子炎火（12歲）與公主憂娜（8歲）被赤夜風竹捨命救出，長大後雙雙投身魔風聯邦獄炎監察部隊守護法紀。"
Add-Edge "伊格那利昂 加拉爾" "炎火 加拉爾" "family" "火神祖與後裔" "加拉爾王國所信仰與傳承的原初火元素神神祖。"
Add-Edge "伊格那利昂 加拉爾" "憂娜 加拉爾" "family" "火神祖與後裔" "火元素神神脈與聖火魔女憂娜。"
Add-Edge "凱 加拉爾" "炎火 加拉爾" "family" "同脈死神" "加拉爾同脈之中司掌死亡的神明。"

# 5. 撒旦魔神族
Add-Edge "別西卜 阿斯拉 撒旦" "路西法 阿斯拉 撒旦" "family" "魔神姐弟" "原初三魔神之大姐與二哥。別西卜實力最強卻身材嬌小、性喜和平；路西法為魔族首席大腦，常出面調解三神與全魔界事務。"
Add-Edge "路西法 阿斯拉 撒旦" "貝利爾 阿斯拉 撒旦" "family" "魔神兄弟" "路西法二哥與防禦最強的三弟貝利爾。"
Add-Edge "別西卜 阿斯拉 撒旦" "貝利爾 阿斯拉 撒旦" "family" "魔神姐弟" "別西卜經常惡整防禦力極高卻單純的三弟貝利爾。"
Add-Edge "路西法 阿斯拉 撒旦" "索亞德 托斯卡 撒旦" "master" "造主與化身" "路西法以自身神權塑造索亞德，使其與智慧魔神神格完美吻合，繼承智者位格後前往魔風擔任總參謀長。"
Add-Edge "索亞德 托斯卡 撒旦" "別西卜 阿斯拉 撒旦" "ally" "魔神同盟" "索亞德身為當代智慧魔神，受原初魔神認可與信任。"
Add-Edge "黑帝斯 阿斯拉 洛斯提亞" "路西法 阿斯拉 撒旦" "family" "魔界同脈" "魔界阿斯拉洛斯提亞冥府魔神族裔。"

# 6. 尼達羅斯龍神族
Add-Edge "蘿希加勒美 尼達羅斯" "雷格納 尼達羅斯" "family" "龍神與將軍" "尼達羅斯一族的龍神神祖，與魔風戰龍將軍雷格納流淌相同的煌龍神血。"
Add-Edge "雷格納 尼達羅斯" "西格德 尼達羅斯" "family" "同族將兵" "戰龍部隊中的尼達羅斯同宗族人。"

# 7. 星野家族
Add-Edge "星野 蒼空" "星野 晴奈" "family" "親兄妹" "星野一族兄妹。哥哥為掌控星辰的魔風獨立特級，妹妹為陰暗幽鬼絕影將軍，彼此照應深厚。"

# 8. 凌音家族
Add-Edge "凌音 凜" "凌音 澪" "family" "親姐妹" "血魔之影司令守淵將軍凌音凜與妹妹凌音澪，姐妹共同鎮守聯邦最凶險的丹格深淵之口。"

# 9. 白雪家族
Add-Edge "白雪 奏" "白雪 悠" "family" "家族傳承" "古老白雪術式與魔劍傳承者。"
Add-Edge "白雪 零" "白雪 悠" "family" "神祖與裔族" "冰神之王白雪零與白雪族裔悠。"
Add-Edge "赤夜 風竹" "白雪 悠" "master" "養父子/師承" "赤夜風竹曾在白雪家修習，後收養白雪悠為養子，傳授並庇護之。"

# 10. 淺野家族
Add-Edge "淺野 歆音" "淺野 修司" "family" "同族兄妹" "戰龍部隊核心淺野歆音與潔白協奏部隊淺野修司。"

# 11. 十乃家族
Add-Edge "十乃 千穗" "十乃 零惠" "family" "雙子姐妹" "影風之巔情報雙子搭檔。"

# 12. 櫻上家族
Add-Edge "櫻上 千夏" "櫻上 尹二" "family" "兄妹/同族" "分屬紅蓮組與夜妖部隊的櫻上一族。"

# 13. 祈奈妖狐族
Add-Edge "祈奈 天妖" "祈奈 魁" "family" "天狐始祖與妖狐後裔" "卡姆利亞獸人聯邦天狐神祖與魔風夜妖部隊祈奈魁。"

# 14. 克斯拉神族
Add-Edge "米迦勒 克斯拉 戴因" "潘朵拉 克斯拉 神創" "master" "神祖創生" "潘朵拉誕生於天使神祖米迦勒的天使神創結晶，並完全繼承神性登上天神王之位。"
Add-Edge "米迦勒 克斯拉 戴因" "雷風 克斯拉 修羅" "ally" "聖魔神聖共鳴" "共享克斯拉神聖名號與天界試煉同源之力。"

# 15. 魔風聯邦最高領導樞紐
Add-Edge "赤夜 風竹" "阿撒托斯 阿斯拉 凱撒" "superior" "最高總司令與副司令" "魔風聯邦最高決策雙壁。風竹雷厲風行、阿撒托斯霸道勇猛，兩人為多年生死莫逆、共掌魔風大權。"
Add-Edge "赤夜 風竹" "索亞德 托斯卡 撒旦" "superior" "最高總司令與總參謀長" "風竹掌軍、索亞德運籌帷幄，極致智謀與鐵血決斷相得益彰。"
Add-Edge "赤夜 風竹" "銀 塵夜" "superior" "最高總司令與秘書" "銀塵夜為風竹貼身心腹秘書，掌理魔風行政中樞與機密文書。"
Add-Edge "阿撒托斯 阿斯拉 凱撒" "索亞德 托斯卡 撒旦" "comrade" "魔神聯邦同僚" "同為惡魔神位執掌者，在魔風最高層協同指揮海陸空軍勢。"

# 16. 赤夜風竹直屬冥府神傑 (9傑)
$minfuMembers = @(
    "黑卡蒂 拉普拉斯", "克蘭努克 歐塔", "艾琳絲塔希 康多拉",
    "福玻斯 里拉 阿斯克勒", "涅米蘿伊 贊恩斯", "莎布西絲 貝西卡",
    "格赫羅 阿斯拉 凱撒", "凜子 歐斯拉 時空", "青 黎"
)
for ($i=0; $i -lt $minfuMembers.Count; $i++) {
    $mName = $minfuMembers[$i]
    $seat = "第$($i+1)傑"
    Add-Edge "赤夜 風竹" $mName "superior" "冥府君臣 ($seat)" "赤夜風竹親自設立之直屬極密特種部隊，戰力抵過全軍團總和，成員只聽令於最高司令一人。"
}
Add-Edge "赤夜 風竹" "涅米蘿伊 贊恩斯" "master" "神明與唯一眷屬" "涅米蘿伊為當世唯一的亡靈神赤夜風竹眷屬，對風竹懷有極端崇敬與執念。"
Add-Edge "赤夜 風竹" "艾琳絲塔希 康多拉" "superior" "主僕管家" "劍之女神艾琳同時兼任赤夜家族最高管家，照料赤夜家府邸與風竹日常生活。"

# 17. 冥府神傑內部互動
Add-Edge "格赫羅 阿斯拉 凱撒" "赤夜 風竹" "ally" "生死相惜" "格赫羅性格狂放，唯敬重風竹之胸襟與阿撒托斯之豪情。"
Add-Edge "凜子 歐斯拉 時空" "黑卡蒂 拉普拉斯" "comrade" "神傑同袍" "冥府神傑核心同僚。"

# 18. 軍團八部隊將軍與總司令
$generals = @(
    @{ name="雷風 克斯拉 修羅"; dept="雷霆殿"; city="霍普市"; title="神雷將軍" },
    @{ name="烈火 艾克斯 修羅"; dept="紅蓮組"; city="赤羽市"; title="不破將軍" },
    @{ name="雷格納 尼達羅斯"; dept="戰龍"; city="亞美特市"; title="煌龍將軍" },
    @{ name="蘿雅絲 瑟 阿爾法"; dept="潔白協奏"; city="瑪捷塔市"; title="神曲將軍" },
    @{ name="水無月 夜風"; dept="夜妖"; city="天御市"; title="玄狐將軍" },
    @{ name="倷德 歐斯拉 卡迦"; dept="墮天光輝"; city="巴越爾市"; title="灼炎將軍" },
    @{ name="凌音 凜"; dept="血魔之影"; city="丹格市"; title="守淵將軍" },
    @{ name="星野 晴奈"; dept="陰暗幽鬼"; city="阿瑞納市"; title="絕影將軍" }
)
foreach ($g in $generals) {
    Add-Edge "赤夜 風竹" $g.name "superior" "統帥與將軍 ($($g.title))" "統帥直轄八大正規軍團將軍，各率三十餘萬精銳鎮守一國直轄市。"
}

# 19. 軍團將軍與隊員
# 雷霆殿
foreach ($sub in @("田也 嵐心", "沈 憾", "阿爾希亞 斯諦 羅修斯", "蒂雅 歐斯拉 特蘿", "羅 彌生")) {
    Add-Edge "雷風 克斯拉 修羅" $sub "superior" "長官與軍官" "雷霆殿守衛首都霍普市核心幹部。"
}
# 紅蓮組
foreach ($sub in @("村宮 早乙女", "趙 清夏", "織田 野寺", "櫻上 千夏", "不明~~（清水 若雨）~~")) {
    Add-Edge "烈火 艾克斯 修羅" $sub "superior" "長官與組員" "紅蓮組駐守安逸文化之都赤羽市。"
}
# 戰龍
foreach ($sub in @("伊絲波 伽德", "西格德 尼達羅斯", "忻天 艾姆雷朵 薩恩", "李 榮", "芬里斯 白以格西", "雨宮 紗莉奈", "納多流士 格尼爾森", "淺野 歆音")) {
    Add-Edge "雷格納 尼達羅斯" $sub "superior" "軍長與龍騎" "戰龍部隊重兵駐守軍事重鎮亞美特市。"
}
# 潔白協奏
foreach ($sub in @("白川 咲", "奎札爾 阿斯拉 密涅瓦", "淺野 修司")) {
    Add-Edge "蘿雅絲 瑟 阿爾法" $sub "superior" "將軍與樂團戰將" "潔白協奏鎮守藝術海港瑪捷塔市。"
}
# 夜妖
foreach ($sub in @("月影 伊萊", "白雪 悠", "旭翼", "百夜 奈", "祈奈 魁", "修莉雅", "鬼龍院 赫羿", "斯卡特 提拉", "黑羽 曉夜", "闇淤 加美羽", "櫻上 尹二")) {
    Add-Edge "水無月 夜風" $sub "superior" "將軍與妖忍" "夜妖部隊維護商業大邑天御市秩序。"
}
# 墮天光輝
foreach ($sub in @("天桐 艾", "天霞 克斯拉 寒光", "伏黑 夜", "影之")) {
    Add-Edge "倷德 歐斯拉 卡迦" $sub "superior" "將軍與飛空部隊" "墮天光輝駐防農業與國家公園巴越爾市。"
}
# 血魔之影
foreach ($sub in @("千 維斯特利亞", "血羽 佛拉德", "凌音 澪", "蕾涅莉亞 妃葉斯")) {
    Add-Edge "凌音 凜" $sub "superior" "將軍與血影衛隊" "血魔之影前線直面丹格深淵之口。"
}
# 陰暗幽鬼
foreach ($sub in @("星野 蒼空", "冥藏 七翔")) {
    Add-Edge "星野 晴奈" $sub "superior" "將軍與特遣暗部" "陰暗幽鬼駐紮祭典與競技之都阿瑞納市。"
}

# 20. 獄炎監察部隊
Add-Edge "赤夜 風竹" "炎火 加拉爾" "superior" "統帥與監察大隊長" "赤夜風竹賦予監察全聯邦軍政機構、防治叛逆與貪腐之重權。"
foreach ($im in @("憂娜 加拉爾", "有栖 櫻雪", "姵莉絲 阿斯拉 克里", "哲也 和人", "納克 狄姆")) {
    Add-Edge "炎火 加拉爾" $im "superior" "大隊長與監察官" "獄炎監察部隊執法同僚。"
}

# 21. SECT「特殊事件對策組」
Add-Edge "赤夜 風竹" "鹿苑寺 照寺" "superior" "總司令與特策組長" "負責魔風聯邦特種搜查、反恐與機密事件處置。"
foreach ($sm in @("中野 繪里", "矢野 海翔", "狙櫻", "柳霧", "蒼", "蒼風 貓音", "賴 亭瑋")) {
    Add-Edge "鹿苑寺 照寺" $sm "superior" "組長與對策特工" "SECT特殊事件對策小隊同袍。"
}

# 22. 獨立特級
foreach ($spec in @("月夜", "寺山 夜明", "艾娜托斯 阿斯拉 凱撒", "赤夜 花幽", "傑瑞 吳 阿爾法")) {
    Add-Edge "赤夜 風竹" $spec "superior" "最高總司令直屬特許" "獨立特級享有獨立行動權，除赤夜風竹與阿撒托斯外無人可下令。"
}

# 23. 公安與審判
Add-Edge "赤夜 風竹" "秦 雲平" "superior" "統帥與公安局長" "秦雲平掌管全聯邦八市與學院島之民生治安防衛。"
Add-Edge "赤夜 風竹" "芙拉達 莎德琺" "superior" "統帥與最高審判官" "芙拉達掌管魔風審判庭，獨立裁量司法。"

# 24. 風竹核心摯友與跨界同盟
Add-Edge "赤夜 風竹" "張 琦" "ally" "百年知己摯友" "12013年結識的死神（234歲），被風竹視為至交，張琦立誓為風竹與魔風尋訪拉攏天下潛力奇才。"
Add-Edge "赤夜 風竹" "潘朵拉 克斯拉 神創" "ally" "至高盟友" "天神王潘朵拉探索現界時與赤夜風竹結盟，在兩界大戰中全力馳援魔風聯邦。"
Add-Edge "赤夜 風竹" "\"毒牙\"" "ally" "親密戰友" "天真強大的毒神，與風竹私交甚篤，經常出現在魔風重要戰役支援。"
Add-Edge "赤夜 風竹" "趙 望月" "ally" "國家盟友" "月星民國月星龍皇趙望月與魔風聯邦締結互保軍事盟約。"
Add-Edge "赤夜 風竹" "德貢 阿茲拉格" "ally" "國家盟約" "魔風建國初期赤夜風竹親赴龍島與哈維德恩帝國締結盟約。"

# 25. 極真圃六識真之花
Add-Edge "伊森塔爾" "約阿希姆 克羅斯" "ally" "三百年患難摯友" "伊森塔爾甦醒後與約阿希姆結識，兩人於冥界遊蕩探索三百年，出生入死尋找艾維麗娜並勘破世界真相。"
Add-Edge "伊森塔爾" "艾維麗娜" "ally" "苦尋之至交" "伊森塔爾與約阿希姆執著三百年的心結，後艾維麗娜平安歸來加入極真圃。"
Add-Edge "約阿希姆 克羅斯" "艾維麗娜" "ally" "尋回之友人" "三百年追尋終得重聚。"
Add-Edge "伊森塔爾" "柔 芸" "ally" "同志與食辣盟友" "柔芸為極真圃火鶴花，於魔風島開設理髮廳蒐集各界情報，能吃與伊森塔爾同階超辣食物。"
Add-Edge "伊森塔爾" "塞西莉雅 瑪德萊特" "comrade" "識真之花成員" "極真圃骨幹核心。"
Add-Edge "伊森塔爾" "夜川 海月" "comrade" "識真之花成員" "極真圃骨幹核心。"
Add-Edge "伊森塔爾" "蘿克莉絲 菲爾德 慕夏" "comrade" "識真之花成員" "白玫瑰蘿克莉絲，極真圃核心交際大師。"
Add-Edge "伊森塔爾" "趙 望月" "ally" "戰略盟友" "12026年極真圃總部設於月星民國黑月市，與趙望月正式結盟。"
Add-Edge "萊夫維芙" "伊森塔爾" "ally" "神明後盾" "原初生命神萊夫維芙暗中支持極真圃探求世界重置之真相。"

# 26. 銀狼傭兵公會
Add-Edge "白川 咲" "傑瑞 吳 阿爾法" "comrade" "公會雙巨頭" "銀狼傭兵公會最高決策核心。"
Add-Edge "白川 咲" "卡德 貝利索" "superior" "會長與七銀" "白川咲麾下七銀王牌。"
foreach ($sev in @("千葉 涼子", "李 書豪", "貝雷 尼古拉", "欣夜 月雪", "奎恩 格里芬", "茉羽 凛音", "萊恩 希爾法")) {
    Add-Edge "白川 咲" $sev "superior" "會長與七銀" "銀狼公會七銀主力。"
}

# 26.5 影風之巔內部核心絆
Add-Edge "德菈 貝西卡" "卡德 貝利索" "family" "養育長輩 / 德叔" "德菈原本是廢棄實驗室培養皿中的實驗體E-8004，德叔在經歷家庭變故後遇見沉睡的她，每天前來聊天陪伴五年。當星座神追殺德叔時，德菈破壁而出弒神斬殺雙魚座。德叔賜予她全新姓氏「貝西卡」並帶她遊歷大陸，兩人共同建立影風之巔。德菈極愛對德叔撒嬌，最愛德叔準備的抹茶布丁。"
Add-Edge "德菈 貝西卡" "十乃 零惠" "superior" "公會會長 / 庇護者" "德菈與德叔親自登門拜訪流浪雙子，擋下零惠斬擊並以誠心打動兩人，承諾「只要我還活著，你妹妹便不會死」，引薦雙子加入影風之巔。"
Add-Edge "德菈 貝西卡" "十乃 千穗" "superior" "公會會長 / 庇護者" "德菈給予千穗極大安全感與庇護，千穗感受到德菈是真心想幫助兄妹兩人，勸哥哥一同加入影風之巔。"
Add-Edge "德菈 貝西卡" "蕾娜 琪 白娜婭" "comrade" "公會會長 / 戰友" "影魔族戰鬼蕾娜沉睡甦醒後，被德菈天真又有正義感的性格所打動而加入影風之巔，德菈得知蕾娜加入後興奮地要德叔做新品抹茶布丁慶祝。"
Add-Edge "十乃 零惠" "十乃 千穗" "family" "同胞雙子兄妹" "十乃家族雙子兄妹，因詛咒無法完全發揮拔刀術遭家族冷落後一同出逃當僱傭兵。千穗為零惠不願拔刀，零惠為保護妹妹研發冥狐拔刀術・改，兩人是公會知名的最強雙人組。"
Add-Edge "卡德 貝利索" "十乃 零惠" "superior" "公會長輩 / 引薦" "隨德菈一同登門招募雙子加入影風之巔。"
Add-Edge "卡德 貝利索" "十乃 千穗" "superior" "公會長輩 / 引薦" "隨德菈一同登門招募雙子加入影風之巔。"
Add-Edge "卡德 貝利索" "蕾娜 琪 白娜婭" "comrade" "公會長輩 / 戰友" "蕾娜加入影風之巔後常請德叔準備特製抹茶布丁。"
Add-Edge "德菈 貝西卡" "賽西斯 詹納瓦茲" "rival" "公會宿命死敵" "影風之巔會長率隊保護委託目標，與寂靜之音暗殺任務長年針鋒相對。"
# 27. 影風之巔 vs 寂靜之音 (宿命死敵)
Add-Edge "賽西斯 詹納瓦茲" "雅希棋 艾比斯" "comrade" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"
Add-Edge "雅希棋 艾比斯" "維璐緹雅" "comrade" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"
Add-Edge "賽西斯 詹納瓦茲" "維璐緹雅" "comrade" "三大福音同袍" "寂靜之音世界暗殺組織核心三使徒。"
Add-Edge "卡德 貝利索" "賽西斯 詹納瓦茲" "rival" "宿命死敵" "寂靜之音接單暗殺，影風之巔接單保衛，兩大組織每次任務必定短兵相接不死不休。"
Add-Edge "十乃 千穗" "雅希棋 艾比斯" "rival" "組織衝突" "影風防護網與寂靜虛之福音的交鋒。"
Add-Edge "希德恩 阿斯拉 加拉爾" "維璐緹雅" "rival" "組織衝突" "影風之巔高手與死之福音對峙。"

# 28. 世界賢者館 vs 魔法之根協會
Add-Edge "亞卓欣德 依娜" "安媞 娜德亞" "superior" "大賢者與魔女" "世界賢者館全知魔女與五魔女核心。"
Add-Edge "亞卓欣德 依娜" "克勞蒂亞 法馮 莰蒂絲" "superior" "大賢者與魔女" "世界賢者館湮滅魔女。"
Add-Edge "札維爾 斯戴拉" "亞卓欣德 依娜" "rival" "學術與權力對立" "魔法之根協會試圖監管全大陸魔法，遭世界賢者館強力抵制抗衡。"
Add-Edge "札維爾 斯戴拉" "赤夜 風竹" "rival" "外交施壓" "魔法之根協會對魔風聯邦長期發動輿論攻擊與制裁，風竹嗤之以鼻。"

# 29. 宿命宿敵與歷史封印
Add-Edge "赤夜 終焉龍" "賽菲爾" "rival" "救世理念死決" "終焉龍痛斥賽菲爾以「救世」之名不斷將整個亞雷利塔重置輪迴，誓言粉碎其偽神救世計畫。"
Add-Edge "赤夜 風竹" "賽特 伊斐爾" "rival" "生死封印死敵" "12013年風竹率隊誤入邪神封印地，為救同伴動用禁術將賽特重新封印，代價是自身喪失一半快樂情緒。"
Add-Edge "賽特 伊斐爾" "奧伯龍" "rival" "弒神之仇" "邪神賽特曾親手斬殺原初精靈神奧伯龍。"
Add-Edge "賽特 伊斐爾" "多拉格" "rival" "弒神之仇" "邪神賽特曾親手斬殺原初龍神新龍皇多拉格。"
Add-Edge "雷風 克斯拉 修羅" "貝利爾 阿斯拉 撒旦" "rival" "惡魔之戰宿敵" "第一次惡魔之戰中雷風手刃復活的原初魔王貝利爾。"
Add-Edge "米迦勒 克斯拉 戴因" "別西卜 阿斯拉 撒旦" "rival" "天魔神祖死決" "天界與魔界最高神祖的萬年對立。"
Add-Edge "暗 斯卡奇" "黑卡蒂 拉普拉斯" "rival" "冥界鎮壓之仇" "暗元素神在冥界暴走，被黑卡蒂施以神威無情鎮壓收押牢獄。"

# 30. 日月神系
Add-Edge "尤諾拉 倪克斯" "迪米諾拉 赫墨拉" "ally" "日月交輝雙神" "星月女神與日耀女神，執掌宇宙晝夜交替的神座級神明。"

# 31. 死神三巨頭
Add-Edge "張 琦" "莉琪雅 神隱" "comrade" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"
Add-Edge "莉琪雅 神隱" "凱 加拉爾" "comrade" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"
Add-Edge "張 琦" "凱 加拉爾" "comrade" "冥界死神同盟" "掌管靈魂引渡與冥界生死法規之三大死神。"

# 32. 新世生命教
Add-Edge "艾西 姬拉亞雷" "剋雷希 傑克" "superior" "大教主與狂徒" "新世生命教極端生物改造狂熱者。"
Add-Edge "艾西 姬拉亞雷" "戴斯奇 歐金金" "superior" "大教主與狂熱智者" "新世生命教瘋癲智慧。"

# 33. 東方滅魔館
Add-Edge "久我 道真" "忠情" "comrade" "滅魔同僚" "東方滅魔館四大支柱之核心戰將。"

Write-Output "Total curated edges created: $($edges.Count)"

# Output JS structure
$relationsData = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    totalCharacters = $nodes.Count
    totalRelationships = $edges.Count
    nodes = $nodes
    links = $edges
}

$jsText = "window.ARELITA_RELATIONS = " + ($relationsData | ConvertTo-Json -Depth 10) + ";"
[System.IO.File]::WriteAllText("assets/relations_data.js", $jsText, [System.Text.Encoding]::UTF8)
Write-Output "Successfully saved assets/relations_data.js!"
