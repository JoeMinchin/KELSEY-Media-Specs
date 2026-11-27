let DATA;
const $=id=>document.getElementById(id);
fetch("./data.json?v=7").then(r=>{if(!r.ok)throw Error("data");return r.json();}).then(data=>{DATA=data;init();}).catch(()=>{$("printList").textContent="We couldn't load the specifications. Please refresh the page or contact Kelsey Media Production.";});
function init(){
 renderPrint(DATA.publications);
 renderDigital();
 $("printSearch").addEventListener("input",e=>renderPrint(DATA.publications.filter(p=>p.name.toLowerCase().includes(e.target.value.trim().toLowerCase()))));
 $("skinNote").textContent="Page skins are only available for: "+DATA.pageSkinTitles.join(", ")+".";
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
 $("backButton").addEventListener("click",()=>showView("home"));
 document.querySelector("[data-home]").addEventListener("click",e=>{e.preventDefault();showView("home");});
 showView("home");
}
function showView(view){
 $("landing").hidden=view!=="home";$("printPage").hidden=view!=="print";$("digitalPage").hidden=view!=="digital";$("backButton").hidden=view==="home";
 document.body.classList.toggle("spec-open",view!=="home");window.scrollTo({top:0,behavior:"instant"});
 if(view==="print")$("printSearch").focus({preventScroll:true});
}
function renderPrint(publications){
 $("printCount").textContent=publications.length+" TITLES";
 $("printList").innerHTML=publications.length?publications.map((p,i)=>{
  const specs=DATA.printSpecs[p.trim];
  return `<article class="accordion-item"><button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="print-content-${i}"><span class="plus">+</span><span class="item-name">${esc(p.name)}</span><span class="item-meta">${esc(p.trim)} mm trim</span></button><div class="accordion-content" id="print-content-${i}" hidden>${specs?formatCards(specs,p.trim):'<div class="missing-note">The supplied print source gives this publication's trim size but does not include a matching advert-format specification. Please contact Kelsey Media Production to confirm the required dimensions before supplying artwork.</div>'}</div></article>`;
 }).join(""):'<div class="empty-list">No publications found. Try another search.</div>';
 bindAccordions($("printList"));
}
function formatCards(specs,trim){
 const [tw,th]=trim.split("x").map(Number);
 return `<div class="format-grid">${Object.entries(specs).map(([name,values])=>{
  const size=values.find(v=>v[0]==="Size")?.[1]||values.find(v=>v[0]==="Bleed")?.[1]||values.find(v=>v[0]==="Trim")?.[1]||"";
  const nums=size.match(/[\d.]+/g)||[];const w=Number(nums[0])||tw;const h=Number(nums[1])||th;
  const wp=Math.min(100,w/tw*100),hp=Math.min(100,h/th*100);
  const detail=values.map(v=>`<span><b>${esc(v[0])}:</b> ${esc(v[1])}</span>`).join("");
  return `<div class="format-card"><div class="print-preview-wrap"><div class="print-preview-page" style="aspect-ratio:${tw}/${th}"><div class="print-preview-ad" style="width:${wp}%;height:${hp}%"></div><div class="print-preview-safe"></div></div><span class="preview-caption">PAGE LAYOUT PREVIEW · PROPORTIONAL</span></div><div class="format-info"><h4>${esc(name)}</h4><p>${esc(size)}</p><div class="format-details">${detail}</div><small class="client-note">Use these dimensions when preparing your artwork. The diagram is illustrative; the measurements are authoritative.</small></div></div>`;
 }).join("")}</div>`;
}
function renderDigital(){
 const categories=[...new Set(DATA.digitalSpecs.map(x=>x.category))];
 $("digitalList").innerHTML=categories.map((category,i)=>{
  const items=DATA.digitalSpecs.filter(x=>x.category===category);
  return `<article class="accordion-item"><button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="digital-category-${i}"><span class="plus">+</span><span class="category-name">${esc(category)}</span><span class="category-count">${items.length} ${items.length===1?"FORMAT":"FORMATS"}</span></button><div class="accordion-content" id="digital-category-${i}" hidden><div class="digital-items">${items.map((item,j)=>`<article class="digital-format"><button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="digital-item-${i}-${j}"><span class="plus">+</span><span class="item-name">${esc(item.name)}</span></button><div class="accordion-content digital-detail" id="digital-item-${i}-${j}" hidden>${digitalPreview(item)}<div class="digital-copy">${formatText(item.spec)}</div>${item.note?`<div class="digital-copy digital-note"><strong>${esc(item.note)}</strong></div>`:""}<p class="client-note">Preview shows the advert's proportions, not its physical display size. The pixel dimensions above are the required artwork size.</p></div></article>`).join("")}</div></div></article>`;
 }).join("");
 bindAccordions($("digitalList"));
}
function digitalPreview(item){
 const m=item.spec.match(/Dimensions?\s*:\s*(\d+)\s*px?\s*[Ww×x]\s*(\d+)\s*px?/i)||item.spec.match(/(\d+)\s*[×x]\s*(\d+)\s*px/i);
 if(!m)return '<div class="digital-preview-placeholder"><span>CREATIVE PREVIEW</span></div>';
 const w=+m[1],h=+m[2],ratio=w/h;
 const isMobile=/mobile/i.test(item.name);
 if(isMobile){
  return `<div class="digital-preview-area phone-stage"><div class="phone-frame"><div class="phone-screen"><div class="phone-banner" style="aspect-ratio:${w}/${h}"><span class="phone-placeholder">${esc(item.name)}</span></div></div></div><span class="preview-caption">MOBILE SCREEN PREVIEW · ${w} × ${h} PX BANNER</span></div>`;
 }
 const boxW=Math.min(250,Math.max(64,Math.sqrt(ratio)*75)),boxH=boxW/ratio;
 return `<div class="digital-preview-area"><div class="digital-preview" style="width:${boxW}px;height:${boxH}px"><span>${esc(item.name)}</span><i>ADVERT</i></div><span class="preview-caption">SCREEN PROPORTION PREVIEW · ${w} × ${h} PX</span></div>`;
}
function bindAccordions(root){
 root.querySelectorAll(":scope > .accordion-item > .accordion-trigger, .digital-format > .accordion-trigger").forEach(button=>button.addEventListener("click",()=>{const open=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!open));document.getElementById(button.getAttribute("aria-controls")).hidden=open;}));
}
function formatText(text){return esc(text).replace(/(^|\n\n)([^:\n]{2,45}:)/g,(m,start,label)=>start+"<strong>"+label+"</strong>");}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
