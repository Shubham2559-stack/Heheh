/* ---------- 51 UNIQUE POSTS DATA ---------- */

const YT_IDS = [
  "aqz-KE-bpKQ","dQw4w9WgXcQ","V-_O7nl0Ii0","Zi_XLOBDo_Y","Sagg08DrO5U","K5zm1w7sOYU","iik25wqIuFo",
  "LXb3EKWsInQ","kXYi_JCYtU","hTWKbfoikeg","fJ9rUzIMcZQ","hY7m5jjJ9mM","M7FIvfx5J10","gEPmA3USJdI",
  "ktvTqknDobU","2vjPBrBU-TM","e-ORhEE9VVg","RgKAFK5djSk","tAGnKpE4NCI","JGwWNGJdvx8","hLQl3WQQoQ0",
  "LW5Yk1G10hY","uxpDa-c-4Mc","CFWX0hWCbng","UceaB4D0jpo","nYh-n7EOtMA","oHg5SJYRHA0","pXRviuL6vMY",
  "3JWTaaS7LdU","2Vv-BfVoq4g","OpQFFLBMEPI","4NRXx6U8ABQ","ScNNfyq3d_w","TCQwZ6CPN3Y","6Ejga4kJUts",
  "uelHwf8o7_U","ktYekrBxo1o","lp-EO5I60KA","hsm4poTWjMs","kTJczUoc26U","NOubzHCUt48","mWRsgZuwf_8",
  "e-2xg2TSAQc","vbwy6B5Fa0M","VY1eFxgRR-k","TyHvyGVs42U","e80BbX05D7Y","9bZkp7q19f0","l9nh1l8ZIJQ",
  "7wtfhZwyrcc","2vjPBrBU-TM"
];

const TITLES = [
  "Epic Travel Vlog","City Street Walk","Morning Nature River","Cinematic Clouds Clip",
  "Food Making Clip","Cute Animal Moment","Amazing Waterfall","Village Road Ride",
  "Guitar Melody Clip","Dance Performance","Cooking Lesson","DIY Life Hack Idea",
  "Train Window View","Rainy Ambience","Highway Road Trip","Night Sky Stars",
  "Mountain Sunrise","Slow Motion Water","Birds Flying Shot","Temple Bells Sound",
  "Ocean Waves HD","Forest Wind Relax","Coffee Shop Ambience","Study Music Clip",
  "Sunset Aesthetic","Cute Dog Clip","Funny Cat Clip","Evening Tree Shadows",
  "Calm River Flow","Street Photography","Bike Riding POV","Drone City View",
  "Beach Walk Travel","Bird Nest Shot","Bridge Time-lapse","Foggy Morning",
  "Temple Stairs","Lake Reflection","Flower Garden Tour","Hill Walk Path",
  "Boat Floating Clip","Street Vendor Food","Friends Fun Moment","Night Drive POV",
  "Relaxing Nature Sound","Rain on Window","Photography BTS","Village Market Walk",
  "Tea Making Slow Motion","Roadside Snack","Library Study Ambience"
];

const DATA=[];
const CAT=["Trending","Vlogs","Tutorials","Music"];

for(let i=0;i<51;i++){
  DATA.push({
    id:"clip-"+String(i+1).padStart(2,"0"),
    title:TITLES[i],
    dur:["00:59","01:14","02:08","03:27","04:12","05:44","06:10","07:39"][i%8],
    cat:CAT[i%4],
    thumb:`https://picsum.photos/seed/clip${i}/400/225`,
    yt:`https://www.youtube.com/embed/${YT_IDS[i]}`,
    desc:"Description: "+TITLES[i]
  });
}

/* Helper */
const $=id=>document.getElementById(id);
function shuffle(a){return a.slice().sort(()=>Math.random()-0.5);}

/* Render Cards */
function renderCards(grid,list){
  const box=$(grid),tpl=$("cardTpl");
  if(!box || !tpl) return;
  box.innerHTML="";
  list.forEach(v=>{
    const n=tpl.content.cloneNode(true);
    const img=n.querySelector("img");
    img.src=v.thumb;
    img.onload=()=>img.classList.add("loaded");
    n.querySelector(".dur").textContent=v.dur;
    n.querySelector(".title").textContent=v.title;
    n.querySelector(".title").href=`watch.html?id=${v.id}`;
    n.querySelector(".thumb a").href=`watch.html?id=${v.id}`;
    box.appendChild(n);
  });
}

/* Home */
if($("latestGrid")) renderCards("latestGrid", DATA.slice(0,12));
if($("randomGrid") && !location.pathname.includes("watch"))
  renderCards("randomGrid", shuffle(DATA).slice(0,12));

/* Category */
if(location.pathname.includes("category.html")){
  const c=(new URLSearchParams(location.search)).get("cat");
  $("catName").textContent=c;
  renderCards("catGrid", DATA.filter(v=>v.cat===c));
}

/* Watch Page */
if(location.pathname.includes("watch.html")){
  const id=new URLSearchParams(location.search).get("id");
  const v=DATA.find(x=>x.id===id);

  $("videoTitle").textContent=v.title;
  $("videoDesc").textContent=v.desc;

  $("mainFrame").src=v.yt.replace("www.youtube.com","www.youtube-nocookie.com");

  renderCards("relatedGrid", shuffle(DATA.filter(x=>x.cat===v.cat && x.id!==v.id)).slice(0,12));
  renderCards("randomGrid", shuffle(DATA).slice(0,12));
}

/* Search */
function applySearch(){
  const q=$("searchInput")?.value?.toLowerCase().trim();
  if(!q){renderCards("latestGrid",DATA.slice(0,12));return;}
  renderCards("latestGrid",DATA.filter(v=>v.title.toLowerCase().includes(q)));
}
$("searchBtn")?.addEventListener("click",applySearch);
$("searchInput")?.addEventListener("keyup",e=>{if(e.key==="Enter")applySearch();});

/* To Top */
document.querySelector(".to-top")?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
