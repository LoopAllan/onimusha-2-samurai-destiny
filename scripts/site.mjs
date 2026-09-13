const navigation = [
  { key: "home", file: "index.html", label: "01　首頁／新手" },
  { key: "walkthrough", file: "walkthrough.html", label: "02　主線流程" },
  { key: "companions", file: "companions.html", label: "03　角色／送禮" },
  { key: "collectibles", file: "collectibles.html", label: "04　道具收集" },
  { key: "equipment", file: "equipment.html", label: "05　裝備／道具" },
  { key: "maps", file: "maps.html", label: "06　地圖／解謎" },
  { key: "combat", file: "combat.html", label: "07　戰鬥／頭目" },
  { key: "postgame", file: "postgame.html", label: "08　通關後" },
];

const home = `
<section class="hero">
  <p class="eyebrow">SAMURAI'S DESTINY · FIELD NOTES</p>
  <h1>從旅途入口，選擇要查的手帖。</h1>
  <p>本站按攻略類別分頁整理；目前已發布柳生之庄開場流程與角色送禮交換手帖，其餘頁面保留清楚的研究邊界。</p>
  <div class="badges"><span>繁體中文</span><span>PS4 Remaster／PS2 原版分開核對</span><span>來源文字核對 · 未實機驗證</span></div>
</section>
<section class="entry-panel panel" aria-labelledby="available-now">
  <p class="eyebrow">AVAILABLE NOW</p>
  <h2 id="available-now">目前可讀：開場流程與角色送禮</h2>
  <p>先走完柳生之庄開場，或進入白墨起始交換鏈；兩者都能依版本查看名稱狀態與逐項來源。</p>
  <p><a class="button-link" href="./walkthrough.html">開啟柳生之庄流程</a> <a class="button-link" href="./companions.html">開啟角色送禮手帖</a></p>
</section>`;

function researchPage({ section, heading, intro, panelHeading, panelBody, extra = "" }) {
  return `
<section class="hero" data-status="research-in-progress">
  <p class="eyebrow">${section} · RESEARCH IN PROGRESS</p>
  <h1>${heading}</h1>
  <p>${intro}</p>
</section>
<section class="panel"><h2>${panelHeading}</h2><p>${panelBody}</p>${extra}</section>`;
}

const walkthrough = `
<section class="hero" data-status="published-slice">
  <p class="eyebrow">WALKTHROUGH · OPENING SLICE</p>
  <h1>從柳生之庄走到今庄。</h1>
  <p>第一批主線攻略涵蓋開場、湖邊、洞窟、柳生陣屋與舞雷刀。流程與名稱按 PS2／2025 Remaster 分開投影；待核語言不跨版本補值。</p>
  <div class="status-row"><span class="badge verified">來源逐項核對</span><span class="badge unknown">非官方／非完整攻略</span></div>
</section>
<section class="panel walkthrough-intro"><h2>本批次界線</h2><p>起點為柳生之庄開場，終點為取得舞雷刀並前往今庄。啟動祠堂前的陣屋清單是本切片唯一標示的離區檢查點；後續今庄流程仍維持研究中。</p></section>
<div id="walkthrough-root" aria-live="polite">正在載入流程資料……</div>
<section class="panel"><h2>名稱狀態怎麼看</h2><p><strong>實機畫面核對</strong>只表示來源頁的目標版本畫面直接顯示該名稱；<strong>來源列名</strong>表示攻略文字使用此名稱但沒有同頁 UI 畫面；<strong>本站暫譯</strong>與<strong>待核</strong>都不是遊戲內正式譯名。</p></section>
<section class="panel"><h2>本切片來源</h2><div id="walkthrough-sources"></div></section>`;

const collectibles = researchPage({
  section: "COLLECTIBLES",
  heading: "全收集清單仍在逐項核對。",
  intro:
    "本頁將區分固定取得、交換取得與可能錯過的收集物。目前的交換持有物只在角色送禮手帖呈現，不冒充完整收藏表。",
  panelHeading: "發布條件",
  panelBody:
    "每筆收集物需要名稱、版本範圍、取得條件與來源；未查證的數量及位置不先填入。",
});

const equipment = researchPage({
  section: "EQUIPMENT",
  heading: "裝備與一般道具資料尚待建檔。",
  intro:
    "本頁將說明武器、防具與消耗道具的用途及取得方式。交換鏈中的道具關聯留在角色送禮手帖，避免把局部資料誤標為全道具攻略。",
  panelHeading: "版本核對",
  panelBody:
    "PS2 原版與 Remaster 的名稱、操作便利性及取得條件會分開引用；沒有來源時維持待查。",
});

const maps = researchPage({
  section: "MAPS & PUZZLES",
  heading: "地圖與解謎頁面尚未發布路線。",
  intro:
    "本頁預留給原創位置示意、區域動線與謎題步驟。目前沒有可驗證的完整區域資料，也不轉載遊戲地圖或截圖。",
  panelHeading: "素材原則",
  panelBody:
    "日後只加入有等價文字說明的原創圖示，並清楚標示其不是官方地圖。",
});

const combat = researchPage({
  section: "COMBAT & BOSSES",
  heading: "戰鬥與頭目策略正在分版本查證。",
  intro:
    "本頁將整理操作差異、敵人行為與可重現的應對方式。目前不發布未經實機確認的招式、傷害數字或必勝說法。",
  panelHeading: "目前可確認的範圍",
  panelBody:
    "官方版本介紹可作為介面與功能差異的來源，但不能單獨證明所有戰鬥細節相同。",
  extra:
    '<a href="https://www.capcom-games.com/onimusha/2/en-uk/" target="_blank" rel="noopener noreferrer">CAPCOM 官方版本介紹 ↗</a>',
});

const postgame = researchPage({
  section: "POSTGAME",
  heading: "通關後內容尚未完成查證。",
  intro:
    "本頁將區分解鎖條件、額外模式、小遊戲與獎盃需求。目前不列出來源不足的解鎖清單，也不以宣傳素材代替通關條件。",
  panelHeading: "避免劇透的整理方式",
  panelBody:
    "日後會先顯示內容類型與查證狀態，涉及結局或隱藏條件的資訊另行揭露。",
});

const companions = `
<div data-content="companions-notebook">
<section class="hero">
  <p class="eyebrow">COMPANIONS · ONE THREAD, SIX STEPS</p>
  <h1>角色與送禮交換手帖。</h1>
  <p>從白墨到橙色首飾：把已查到來源的取得、交換與回訪排成一條可追蹤路線。</p>
  <div class="badges"><span>繁體中文</span><span id="version-badge">PS4 Remaster</span><span>來源文字核對 · 未實機驗證</span></div>
</section>
<aside class="warning" aria-label="重要提醒"><strong>前進前，先保留哈密瓜。</strong><p>取得聖之玉前，將哈密瓜交給道具店男子。交給別人可能中斷這條首飾路線。本站不假設可再取得，也不與遊戲存檔同步。</p></aside>
<section aria-labelledby="progress-heading">
  <h2 id="progress-heading">目前走到哪裡？</h2>
  <p>這是本站依事件劃分的檢查點，不是官方章名。先在遊戲完成事件，再更新本機筆記。</p>
  <div class="controls"><label>目前進度<select id="stage"></select></label><button id="apply-stage">更新階段</button><button id="reset" class="secondary">重設此版本筆記</button></div>
  <p id="storage-status" role="status" aria-live="polite"></p>
  <div class="two-col"><div class="panel"><h3>現在先做</h3><ul id="now"></ul></div><div class="panel"><h3>前進前確認</h3><ul id="before"></ul></div></div>
</section>
<section aria-labelledby="chain-heading">
  <div class="section-heading"><div><p class="eyebrow">SOURCE-BOUNDED ROUTE</p><h2 id="chain-heading">送禮交換鏈</h2></div><span class="pill">必要操作直接顯示</span></div>
  <p>按路線順序記錄已在遊戲中完成的動作。回禮由社群來源記載，並非本站實機保證；角色若不在場，請勿標記完成。</p>
  <div class="filters"><label>搜尋名稱／別名<input id="search" type="search" placeholder="試試「甜瓜」或 Kotaro" /></label><label>階段篩選<select id="stage-filter"><option value="">全部階段</option></select></label><label>交換對象<select id="recipient"><option value="">所有對象</option></select></label></div>
  <label class="disclosure"><input type="checkbox" id="spoilers" /> 顯示劇情結果（本切片未收錄劇情結果）</label>
  <p id="result-count" role="status"></p><div id="chain"></div><div id="characters" class="character-list"></div>
</section>
<section><h2>本機持有物</h2><p>只追蹤這條路線。數量會隨已確認的交換扣除；不是遊戲內的完整背包。</p><div id="inventory" class="inventory"></div></section>
<section><h2>道具上下游</h2><p>點選步驟或本機持有物中的道具名稱，查看這條交換鏈內的取得與後續用途。</p><div id="item-detail" class="panel" tabindex="-1">尚未選擇道具。</div></section>
<section><h2>交換關聯示意</h2><figure><img src="./assets/chain.svg" alt="原創交換關聯示意：白墨交給惠瓊，平家物語交給孫市，徽章交給小太郎，哈密瓜交給道具店男子；取得聖之玉後向父親領取橙色首飾。" width="900" height="180" /><figcaption>本站原創關聯示意，非遊戲位置地圖、截圖或官方素材。等價文字步驟見本頁交換鏈。</figcaption></figure></section>
<section><h2>版本筆記</h2><p id="version-note"></p><p>來源：<a href="https://www.capcom-games.com/onimusha/2/en-uk/" target="_blank" rel="noopener noreferrer">CAPCOM 官方版本介紹</a>。此版本摘要不證明所有交換細節跨版本相同。</p></section>
</div>`;

const content = {
  home,
  walkthrough,
  companions,
  collectibles,
  equipment,
  maps,
  combat,
  postgame,
};

const descriptions = {
  home: "鬼武者2 繁中旅途手帖：依攻略類別進入來源可追溯的研究頁面。",
  walkthrough: "鬼武者2 主線流程：柳生之庄開場到舞雷刀的版本分離來源攻略。",
  companions: "鬼武者2 角色送禮手帖：分版本追蹤一條有來源的交換鏈。",
  collectibles: "鬼武者2 道具收集研究頁：逐筆核對版本、位置與來源。",
  equipment: "鬼武者2 裝備與道具研究頁：名稱、用途與取得條件待核。",
  maps: "鬼武者2 地圖與解謎研究頁：預留原創示意與等價文字。",
  combat: "鬼武者2 戰鬥與頭目研究頁：策略與版本差異待核。",
  postgame: "鬼武者2 通關後研究頁：解鎖、模式與獎盃條件待核。",
};

function renderNavigation(activeKey) {
  return navigation
    .map(
      ({ key, file, label }) =>
        `<a class="nav-link" href="./${file}"${key === activeKey ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
}

function renderPage(page) {
  const title = page.label.replace(/^\d+　/, "");
  return `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${descriptions[page.key]}" />
  <title>${title}｜鬼武者2 旅途手帖</title>
  <link rel="stylesheet" href="./assets/style.css" />
</head>
<body data-page="${page.key}">
  <a class="skip" href="#main">跳到攻略正文</a>
  <header>
    <a class="brand" href="./index.html">鬼武者2 <small>ONIMUSHA 2</small><span>旅途手帖</span></a>
    <label>閱讀版本<select id="version"><option value="ps4">PS4 Remaster</option><option value="ps2">PS2 原版</option></select></label>
    <button id="menu" aria-expanded="false" aria-controls="navigation">導覽選單</button>
  </header>
  <div class="layout">
    <nav id="navigation" aria-label="主導覽"><p class="eyebrow">旅途索引</p>${renderNavigation(page.key)}<p class="nav-note">各類別獨立成頁。<br />已發布資料標示來源與版本；其餘維持研究中。</p></nav>
    <main id="main">${content[page.key]}
      <footer><h2>來源與查證界線</h2><p>已核對網頁文字，不等於官方認證或實機驗證。PS2 與 PS4 資料分開判定；繁中名稱為本站編輯譯名，未知內容維持待核。</p>${page.key === "companions" ? '<div id="sources"></div>' : ""}<p>本機手帖 · 非官方攻略 · 持續查證發布</p></footer>
    </main>
  </div>
  <script type="module" src="./src/shell.js"></script>${page.key === "companions" ? '\n  <script type="module" src="./src/app.js"></script>' : page.key === "walkthrough" ? '\n  <script type="module" src="./src/walkthrough-app.js"></script>' : ""}
</body>
</html>
`;
}

export function renderSite() {
  return navigation.map((page) => ({ ...page, html: renderPage(page) }));
}
