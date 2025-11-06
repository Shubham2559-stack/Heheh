/* ====== CONFIG: Google Sheet (public CSV) ====== */
const SHEET_KEY = "1o99o63xiUYuUcziIVb75tQBaNUXp3os-Q8FqBQdqbVQ";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_KEY}/gviz/tq?tqx=out:csv`;

/* ====== State ====== */
let DATA = [];

/* ====== Helpers ====== */
const $ = id => document.getElementById(id);
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

/* Tiny CSV parser that respects quoted fields (commas/newlines inside quotes) */
function parseCSV(text){
  const rows = [];
  let i = 0, cur = [], val = "", inQ = false;

  const push = () => { cur.push(val); val = ""; };
  const endRow = () => { cur.push(val); rows.push(cur); cur = []; val = ""; };

  while(i < text.length){
    const ch = text[i];

    if(inQ){
      if(ch === '"'){
        if(text[i+1] === '"'){ val += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      val += ch; i++; continue;
    }

    if(ch === '"'){ inQ = true; i++; continue; }
    if(ch === ','){ push(); i++; continue; }
    if(ch === '\r'){ i++; continue; }
    if(ch === '\n'){ endRow(); i++; continue; }

    val += ch; i++;
  }
  if(val.length || cur.length) endRow();
  return rows;
}

/* ====== Load from Google Sheet ====== */
function loadSheet(){
  fetch(SHEET_URL)
    .then(r => r.text())
    .then(csv => {
      const rows = parseCSV(csv);
      if(!rows.length) return;

      const hdr = rows[0].map(h => (h||"").trim().toLowerCase());
      const idx = name => hdr.indexOf(name);

      const ititle = idx("title");
      const ithumb = idx("thumb");
      const iyt    = idx("yt");
      const idur   = idx("dur");
      const icat   = idx("cat");
      const idesc  = idx("desc");

      DATA = rows.slice(1).map((r, i) => {
        const title = (r[ititle] || `Video ${i+1}`).trim();
        const thumb = (r[ithumb] || "").trim();
        const yt    = (r[iyt]    || "").trim();
        const dur   = (r[idur]   || "00:00").trim();
        const cat   = (r[icat]   || "Trending").trim();
        const desc  = (r[idesc]  || "").trim();
        const id    = title.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,"");

        return { id, title, thumb, yt, dur, cat, desc };
      }).filter(v => v.yt);

      initializeSite();
    })
    .catch(err => {
      console.error("Sheet load error:", err);
      initializeSite();
    });
}
loadSheet();

/* ====== Card Renderer with interval Ads ====== */
function renderCards(grid, list){
  const box = $(grid), tpl = $("cardTpl");
  if(!box || !tpl) return;

  box.innerHTML = "";

  const isMobile = window.innerWidth < 768;
  const interval = isMobile ? 6 : 8;

  list.forEach((v, i) => {
    const node = tpl.content.cloneNode(true);

    const img = node.querySelector("img");
    if(img){
      img.referrerPolicy = "no-referrer";
      img.src = v.thumb || `https://picsum.photos/seed/${encodeURIComponent(v.title||("v"+i))}/400/225`;
      img.onerror = () => {
        img.src = `https://picsum.photos/seed/${encodeURIComponent(v.title||("v"+i))}/400/225`;
      };
    }

    node.querySelector(".dur").textContent = v.dur || "00:00";
    node.querySelector(".title").textContent = v.title || "Untitled";
    node.querySelector(".title").href = `watch.html?id=${encodeURIComponent(v.id)}`;
    node.querySelector(".thumb a").href  = `watch.html?id=${encodeURIComponent(v.id)}`;

    box.appendChild(node);

    /* ✅ Insert Adsterra Banner */
    if((i+1) % interval === 0){
      const ad = document.createElement("div");
      ad.className = "ad-wide";
      ad.innerHTML = `
<script type="text/javascript">
	atOptions = {
		'key' : 'f11a5a4eeee49e0a2e20cba1d958ddb9',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="https://revealedcarry.com/f11a5a4eeee49e0a2e20cba1d958ddb9/invoke.js"></script>
      `;
      box.appendChild(ad);
    }
  });
}

/* ====== Page Init ====== */
function initializeSite(){

  if($("latestGrid")) renderCards("latestGrid", DATA.slice(0, 12));
  if($("randomGrid") && !location.pathname.includes("watch"))
    renderCards("randomGrid", shuffle(DATA).slice(0, 12));

  if(location.pathname.includes("category.html")){
    const c = new URLSearchParams(location.search).get("cat") || "";
    $("catName").textContent = c;
    renderCards("catGrid", DATA.filter(v => (v.cat || "").toLowerCase() === c.toLowerCase()));
  }

  if(location.pathname.includes("watch.html")){
    const id = new URLSearchParams(location.search).get("id");
    const v  = DATA.find(x => x.id === id);

    if(!v){
      $("playerBox").innerHTML = "Not Found";
      return;
    }

    $("videoTitle").textContent = v.title;
    $("videoDesc").textContent  = v.desc;

    const box = $("playerBox");
    const src = v.yt.trim();
    const safe = encodeURI(src);

    if(/\.(mp4|webm|ogg)(\?.*)?$/i.test(safe)){
      box.innerHTML = `
        <video controls playsinline preload="metadata"
               poster="${v.thumb ? encodeURI(v.thumb) : ""}"
               style="width:100%;height:100%;display:block;object-fit:contain;background:#000;border:0">
          <source src="${safe}" type="video/mp4">
        </video>
      `;
    } else {
      const iframeSrc = safe.replace("www.youtube.com","www.youtube-nocookie.com");
      box.innerHTML = `
        <iframe src="${iframeSrc}" allowfullscreen style="width:100%;height:100%;border:0;background:#000"></iframe>
      `;
    }

    renderCards("relatedGrid", shuffle(DATA.filter(x => x.cat === v.cat && x.id !== v.id)).slice(0, 12));
    renderCards("randomGrid", shuffle(DATA).slice(0, 12));
  }

  const initialQ = new URLSearchParams(location.search).get("search");
  if(initialQ){
    $("searchInput").value = initialQ;
    applySearch();
  }
}

/* ====== SEARCH ====== */
function applySearch(){
  const q = $("searchInput")?.value?.toLowerCase().trim() || "";
  const url = new URL(location);
  q ? url.searchParams.set("search", q) : url.searchParams.delete("search");
  history.replaceState({}, "", url);
  const results = q ? DATA.filter(v => (v.title || "").toLowerCase().includes(q)) : DATA.slice(0, 12);
  if($("latestGrid")) renderCards("latestGrid", results);
  if($("catGrid")){
    const c = new URLSearchParams(location.search).get("cat") || "";
    renderCards("catGrid", results.filter(v => (v.cat || "").toLowerCase() === c.toLowerCase()));
  }
}

$("searchBtn")?.addEventListener("click", applySearch);
$("searchInput")?.addEventListener("keyup", e => { if(e.key === "Enter") applySearch(); });

document.querySelector(".to-top")?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);
