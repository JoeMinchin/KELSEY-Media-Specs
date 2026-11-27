let DATA;
let selectedPublication = null;
let activeDigitalCategory = "All";
const $ = (id) => document.getElementById(id);
fetch("data.json").then(r => r.json()).then(data => { DATA=data; init(); }).catch(() => {
  $("publicationList").innerHTML = '<div class="no-results">Unable to load the specifications data. Please refresh the page.</div>';
});
function init(){
  $("publicationCount").textContent = DATA.publications.length;
  const trims = [...new Set(DATA.publications.map(p=>p.trim))].sort();
  const printers = [...new Set(DATA.publications.map(p=>p.printer))].sort();
  trims.forEach(v => $("trimFilter").add(new Option(v+" mm",v)));
  printers.forEach(v => $("printerFilter").add(new Option(v,v)));
  $("skinNote").textContent = "The source spreadsheet lists page skins as valid only for: " + DATA.pageSkinTitles.join(", ") + ". Check the title and booking before accepting page-skin artwork.";
  renderPublications();
  renderDigitalTabs();
  renderDigital();
  $("publicationSearch").addEventListener("input",renderPublications);
  $("trimFilter").addEventListener("change",renderPublications);
  $("printerFilter").addEventListener("change",renderPublications);
  $("digitalSearch").addEventListener("input",renderDigital);
  document.querySelectorAll("[data-view]").forEach(a=>a.addEventListener("click",()=>setActiveNav(a.dataset.view)));
  document.querySelectorAll("[data-jump]").forEach(a=>a.addEventListener("click",()=>setActiveNav(a.dataset.jump)));
  document.querySelectorAll("[data-open-view]").forEach(el=>el.addEventListener("click",()=>openView(el.dataset.openView)));
  openView("home");

  document.querySelector(".mobile-menu").addEventListener("click",()=>document.querySelector(".top-nav").classList.toggle("open"));
  document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("publicationSearch").focus();}});
}
function openView(view){
  document.body.classList.toggle("show-print",view==="print");
  document.body.classList.toggle("show-digital",view==="digital");
  document.body.classList.toggle("show-home",view==="home");
  setActiveNav(view);
  window.scrollTo({top:0,behavior:"smooth"});
}
function setActiveNav(view){
  document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.view===view));
  document.querySelector(".top-nav").classList.remove("open");
}
function renderPublications(){
  const q=$("publicationSearch").value.trim().toLowerCase(), trim=$("trimFilter").value, printer=$("printerFilter").value;
  const list=DATA.publications.filter(p=>p.name.toLowerCase().includes(q)&&(!trim||p.trim===trim)&&(!printer||p.printer===printer));
  $("publicationList").innerHTML=list.length?list.map(p=>`<button class="publication-item ${selectedPublication===p.name?"selected":""}" data-name="${escapeAttr(p.name)}"><span><span class="pub-name">${escapeHtml(p.name)}</span><span class="pub-meta">${escapeHtml(p.trim)} mm · ${escapeHtml(p.printer)}</span></span><span class="pub-arrow">→</span></button>`).join(""):'<div class="no-results">No publications match your search.</div>';
  $("publicationList").querySelectorAll("[data-name]").forEach(b=>b.addEventListener("click",()=>selectPublication(b.dataset.name)));
}
function selectPublication(name){
  selectedPublication=name; const p=DATA.publications.find(x=>x.name===name); renderPublications();
  const specs=DATA.printSpecs[p.trim];
  let content=`<div class="detail-top"><div><div class="eyebrow">PUBLICATION / PRINT</div><h3>${escapeHtml(p.name)}</h3><p>Printer: ${escapeHtml(p.printer)}</p></div><div class="trim-badge">${escapeHtml(p.trim)} mm</div></div>`;
  if(specs){
    content+=`<div class="detail-label">AVAILABLE ADVERT FORMATS · DIMENSIONS IN MM</div><div class="format-grid">`;
    Object.entries(specs).forEach(([name,values])=>{
      const primary=values.find(v=>v[0]==="Size")?.[1] || values[0][1];
      content+=`<div class="format-card"><div class="format-name">${escapeHtml(name)}</div><div class="format-size">${escapeHtml(primary)}</div><div class="format-kind">${values.map(v=>`${escapeHtml(v[0])}: ${escapeHtml(v[1])}`).join(" · ")}</div></div>`;
    });
    content+="</div>";
  }else{
    content+=`<div class="detail-warning">The supplied 2026 PDF lists this publication's trim size, but does not include a matching advert-format panel. Please confirm the advert dimensions with Production before artwork is prepared.</div>`;
  }
  $("printDetail").innerHTML=content;
}
function renderDigitalTabs(){
  const cats=["All",...new Set(DATA.digitalSpecs.map(x=>x.category))];
  $("digitalTabs").innerHTML=cats.map(c=>`<button class="tab-button ${c===activeDigitalCategory?"active":""}" data-category="${escapeAttr(c)}">${escapeHtml(c)}</button>`).join("");
  $("digitalTabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeDigitalCategory=b.dataset.category;renderDigitalTabs();renderDigital();}));
}
function renderDigital(){
  const q=$("digitalSearch").value.toLowerCase().trim();
  const rows=DATA.digitalSpecs.filter(x=>(activeDigitalCategory==="All"||x.category===activeDigitalCategory)&&[x.category,x.type,x.dimensions,x.details].join(" ").toLowerCase().includes(q));
  $("digitalGrid").innerHTML=rows.length?rows.map(x=>`<article class="digital-card"><div class="digital-card-top"><span class="digital-category">${escapeHtml(x.category.toUpperCase())}</span><span class="file-size">${escapeHtml(x.maxFileSize==="—"?"BESPOKE":x.maxFileSize+" MAX")}</span></div><h3>${escapeHtml(x.type)}</h3><div class="digital-dim">${escapeHtml(x.dimensions)}</div><div class="digital-format">${escapeHtml(x.format)}</div><p class="digital-detail">${escapeHtml(x.details)}</p></article>`).join(""):'<div class="no-results">No digital formats match your search.</div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}
