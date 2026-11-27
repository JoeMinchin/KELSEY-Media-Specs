let DATA;
const $=id=>document.getElementById(id);
fetch("data.json").then(r=>r.json()).then(data=>{DATA=data;init();}).catch(()=>{$("printList").textContent="Unable to load specifications. Please refresh the page.";});
function init(){
 renderPrint(DATA.publications);
 renderDigital();
 $("printSearch").addEventListener("input",e=>{
  const q=e.target.value.trim().toLowerCase();
  renderPrint(DATA.publications.filter(p=>p.name.toLowerCase().includes(q)));
 });
 $("skinNote").textContent="Page skins are only valid for the following titles, as stated in the supplied Digital Specs spreadsheet: "+DATA.pageSkinTitles.join(", ")+".";
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
 $("backButton").addEventListener("click",()=>showView("home"));
 document.querySelector("[data-home]").addEventListener("click",e=>{e.preventDefault();showView("home");});
 showView("home");
}
function showView(view){
 $("landing").hidden=view!=="home";
 $("printPage").hidden=view!=="print";
 $("digitalPage").hidden=view!=="digital";
 $("backButton").hidden=view==="home";
 document.body.classList.toggle("spec-open",view!=="home");
 window.scrollTo({top:0,behavior:"instant"});
 if(view==="print") $("printSearch").focus({preventScroll:true});
}
function renderPrint(publications){
 $("printCount").textContent=publications.length+" TITLES";
 $("printList").innerHTML=publications.length?publications.map((p,i)=>{
  const specs=DATA.printSpecs[p.trim];
  return `<article class="accordion-item">
   <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="print-content-${i}">
    <span class="plus">+</span><span class="item-name">${esc(p.name)}</span><span class="item-meta">${esc(p.trim)} mm</span>
   </button>
   <div class="accordion-content" id="print-content-${i}" hidden>${specs?formatCards(specs):'<div class="missing-note">The supplied 2026 print PDF lists this publication as '+esc(p.trim)+' mm but does not provide a matching advert-format panel. Please confirm the advert dimensions with Production before preparing artwork.</div>'}</div>
  </article>`;
 }).join(""):'<div class="empty-list">No publications found. Try another search.</div>';
 bindAccordions($("printList"));
}
function formatCards(specs){
 return `<div class="format-grid">${Object.entries(specs).map(([name,values])=>{
  const main=values.find(v=>v[0]==="Size")?.[1]||values[0][1];
  const detail=values.map(v=>`${esc(v[0])}: ${esc(v[1])}`).join(" · ");
  return `<div class="format-card"><h4>${esc(name)}</h4><p>${esc(main)}</p><small>${detail}</small></div>`;
 }).join("")}</div>`;
}
function renderDigital(){
 const categories=[...new Set(DATA.digitalSpecs.map(x=>x.category))];
 $("digitalList").innerHTML=categories.map((category,i)=>{
  const items=DATA.digitalSpecs.filter(x=>x.category===category);
  return `<article class="accordion-item">
   <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="digital-category-${i}">
    <span class="plus">+</span><span class="category-name">${esc(category)}</span><span class="category-count">${items.length} ${items.length===1?"FORMAT":"FORMATS"}</span>
   </button>
   <div class="accordion-content" id="digital-category-${i}" hidden>
    <div class="digital-items">${items.map((item,j)=>`<article class="digital-format">
     <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="digital-item-${i}-${j}">
      <span class="plus">+</span><span class="item-name">${esc(item.name)}</span>
     </button>
     <div class="accordion-content" id="digital-item-${i}-${j}" hidden><div class="digital-copy">${formatText(item.spec)}</div>${item.note?`<div class="digital-copy"><strong>${esc(item.note)}</strong></div>`:""}</div>
    </article>`).join("")}</div>
   </div>
  </article>`;
 }).join("");
 bindAccordions($("digitalList"));
}
function bindAccordions(root){
 root.querySelectorAll(":scope > .accordion-item > .accordion-trigger, .digital-format > .accordion-trigger").forEach(button=>{
  button.addEventListener("click",()=>{
   const open=button.getAttribute("aria-expanded")==="true";
   button.setAttribute("aria-expanded",String(!open));
   const panel=document.getElementById(button.getAttribute("aria-controls"));
   panel.hidden=open;
  });
 });
}
function formatText(text){
 return esc(text).replace(/(^|\n\n)([^:\n]{2,45}:)/g,(m,start,label)=>start+"<strong>"+label+"</strong>");
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
