"use strict";
const $ = id => document.getElementById(id);
const materials = window.MATTER_DATA;
const parts = {
  screen: {name:"Οθόνη",tag:"Μονάδα απεικόνισης",text:"Η εύκαμπτη καλωδιοταινία μεταφέρει σήματα ανάμεσα στην οθόνη και τη μητρική. Ακολούθησε τον χαλκό των αγώγιμων διαδρομών.",materials:["copper"]},
  board: {name:"Μητρική",tag:"Πλακέτα κυκλωμάτων",text:"Ο χαλκός σχηματίζει τις διαδρομές της πλακέτας. Το πυρίτιο βρίσκεται στα ολοκληρωμένα κυκλώματα και ο χρυσός χρησιμοποιείται σε επιλεγμένες ηλεκτρικές επαφές.",materials:["gold","copper","silicon"]},
  battery: {name:"Μπαταρία",tag:"Αποθήκευση ενέργειας",text:"Τα ιόντα λιθίου μετακινούνται μεταξύ των ηλεκτροδίων. Λεπτά φύλλα χαλκού και αλουμινίου συλλέγουν το ηλεκτρικό ρεύμα.",materials:["lithium","copper","aluminium"]},
  camera: {name:"Κάμερα",tag:"Αισθητήρας εικόνας",text:"Στον αισθητήρα CMOS, φωτοευαίσθητα στοιχεία πάνω σε πυρίτιο μετατρέπουν το φως σε ηλεκτρικό σήμα.",materials:["silicon"]},
  frame: {name:"Πλαίσιο",tag:"Δομή συσκευής",text:"Το αλουμίνιο χρησιμοποιείται σε μεταλλικά πλαίσια κινητών. Η ακριβής σύσταση του πλαισίου του Redmi παραμένει άγνωστη από τις δημοσιευμένες προδιαγραφές.",materials:["aluminium"]}
};
const useCases = {
  copper:[["Καλωδιοταινίες και πλακέτες","Οι λεπτές αγώγιμες διαδρομές συνδέουν τα ηλεκτρονικά."],["Γεννήτρια και καλωδίωση","Τα τυλίγματα και τα καλώδια μεταφέρουν το παραγόμενο ρεύμα."],["Κινητήρας και καλώδια ισχύος","Ο χαλκός χρησιμοποιείται σε τυλίγματα και ηλεκτρικές συνδέσεις."]],
  aluminium:[["Συλλέκτης ρεύματος","Λεπτό φύλλο αλουμινίου στη θετική πλευρά της κυψέλης."],["Αγωγοί ισχύος","Ορισμένες εγκαταστάσεις χρησιμοποιούν καλώδια αλουμινίου."],["Περίβλημα συστοιχίας","Ορισμένοι σχεδιασμοί χρησιμοποιούν αλουμίνιο για δομή και χαμηλότερη μάζα."]],
  lithium:[["Κυψέλη μπαταρίας","Τα ιόντα λιθίου μεταφέρουν φορτίο μεταξύ των ηλεκτροδίων."],["Εκτός της βασικής γεννήτριας","Ξεχωριστή μονάδα αποθήκευσης μπορεί να χρησιμοποιεί μπαταρίες λιθίου."],["Μπαταρία έλξης","Το λίθιο συμμετέχει στην ηλεκτροχημεία των κυψελών ιόντων λιθίου."]],
  silicon:[["Επεξεργαστής και αισθητήρες","Τα μικροκυκλώματα κατασκευάζονται πάνω σε ημιαγώγιμα υποστρώματα."],["Ηλεκτρονικά ισχύος","Οι μετατροπείς περιλαμβάνουν ημιαγωγούς στους οποίους μπορεί να χρησιμοποιείται πυρίτιο."],["Μονάδες ελέγχου","Ο επεξεργαστής και οι μονάδες διαχείρισης περιέχουν ολοκληρωμένα κυκλώματα."]],
  gold:[["Επαφές συνδέσμων","Λεπτή επιχρύσωση προστατεύει επιλεγμένες επαφές από τη διάβρωση."],["Ηλεκτρονικά ελέγχου","Επιλεγμένες επαφές στις πλακέτες μπορούν να φέρουν επιχρύσωση."],["Συνδέσεις ηλεκτρονικών","Ορισμένοι ακροδέκτες σημάτων φέρουν λεπτή επιχρύσωση."]]
};
const objectNames=["Κινητό","Ανεμογεννήτρια","Ηλεκτρικό αυτοκίνητο"];
const scanCatalog={
  phone:["Κινητό","Η μπαταρία συνδέεται με το λίθιο, οι καλωδιοταινίες με τον χαλκό και τα μικροκυκλώματα με το πυρίτιο.",["lithium","copper","silicon","gold"]],
  wind:["Ανεμογεννήτρια","Η γεννήτρια και τα καλώδια μπορούν να περιέχουν χαλκό. Τα πτερύγια συνήθως είναι από σύνθετα υλικά και ο πύργος συχνά από χάλυβα.",["copper","aluminium"]],
  ev:["Ηλεκτρικό αυτοκίνητο","Πιθανές χρήσεις περιλαμβάνουν χαλκό στον κινητήρα, λίθιο σε μπαταρίες ιόντων λιθίου και αλουμίνιο σε δομικά μέρη.",["copper","lithium","aluminium"]],
  laptop:["Φορητός υπολογιστής","Συνήθεις χρήσεις είναι το πυρίτιο στον επεξεργαστή, ο χαλκός στην πλακέτα και το λίθιο στην επαναφορτιζόμενη μπαταρία.",["silicon","copper","lithium"]],
  bicycle:["Ποδήλατο","Το πλαίσιο μπορεί να είναι αλουμίνιο, χάλυβας, ανθρακόνημα ή τιτάνιο. Έλεγξε τη σήμανση του πλαισίου για να διαλέξεις τη σωστή διαδρομή.",["aluminium"]],
  headphones:["Ακουστικά","Τα δυναμικά μεγάφωνα συνήθως έχουν αγώγιμο πηνίο. Στα ασύρματα μοντέλα συναντάται επίσης επαναφορτιζόμενη μπαταρία.",["copper","lithium"]],
  bottle:["Πλαστική φιάλη","Στο κάτω μέρος αναζήτησε τη σήμανση της ρητίνης, όπως 1 / PET ή 2 / HDPE. Το πώμα μπορεί να είναι διαφορετικό πολυμερές. Η προέλευση της ρητίνης χρειάζεται τεκμηρίωση από τον παραγωγό.",[]]
};
const objectIcons=[
  '<rect x="19" y="5" width="26" height="53" rx="5"/><path d="M27 10h10m-8 42h6"/>',
  '<circle cx="32" cy="27" r="3"/><path d="m30 26-3-20 4-2 4 19m0 6 17 12-3 3-17-12m-4-3L9 38l-2-4 20-9m4 9-2 24m5-24 2 24m-13 0h19"/>',
  '<path d="M8 38l4-10 7-2 7-9h14l8 9 7 4 1 10h-5m-9 0H23m-9 0H8zM20 26h25m-13-8v8"/><circle cx="18" cy="40" r="5"/><circle cx="46" cy="40" r="5"/>'
];
const nf=new Intl.NumberFormat("el-GR",{maximumFractionDigits:1});
const state={part:"battery",material:"lithium",stage:0,year:0,iso:"",common:"copper"};
let phone;
function makeButton(label,fn,active=false){const b=document.createElement("button");b.type="button";b.textContent=label;b.setAttribute("aria-pressed",active);b.onclick=fn;return b}
function choices(el,keys,label,onPick,selected){el.replaceChildren(...keys.map(k=>makeButton(label(k),()=>onPick(k),selected===k)))}
function options(el,items){el.replaceChildren(...items.map(([v,t])=>new Option(t,v)))}
function materialLabel(key){return materials[key].name}
function pickMaterial(key){state.material=key;state.stage=0;state.year=materials[key].stages[0].snapshots.length-1;state.iso="";drawPart();drawAtlas()}
function pickPart(key){state.part=key;phone?.select(key);pickMaterial(parts[key].materials[0])}
function drawPart(){
  const p=parts[state.part];
  choices($("parts"),Object.keys(parts),k=>parts[k].name,pickPart,state.part);
  $("partName").textContent=p.name;$("partTag").textContent=p.tag;$("partText").textContent=p.text;
  choices($("partMaterials"),p.materials,materialLabel,pickMaterial,state.material);
}
function measure(row,snap){return row.share!=null?nf.format(row.share)+"%":nf.format(row.value)+" "+snap.unit}
function drawAtlas(){
  const m=materials[state.material],stage=m.stages[state.stage],s=stage.snapshots[state.year];
  $("materialSelect").value=state.material;
  choices($("stages"),m.stages.map((_,i)=>i),i=>m.stages[i].label,i=>{state.stage=i;state.year=m.stages[i].snapshots.length-1;state.iso="";drawAtlas()},state.stage);
  options($("year"),stage.snapshots.map((d,i)=>[i,d.year]));$("year").value=String(state.year);
  const rows=s.countries;
  if(!rows.some(r=>r.iso===state.iso))state.iso=rows[0]?.iso||"";
  function selectCountry(iso){state.iso=iso;drawCountries()}
  function drawCountries(){
    window.renderMatterMap($("world"),rows,selectCountry,state.iso);
    const current=rows.find(x=>x.iso===state.iso);
    $("selectedCountry").textContent=current?current.name+" · "+measure(current,s):"";
    $("rank").replaceChildren(...rows.map(row=>{
      const b=makeButton("",()=>selectCountry(row.iso),row.iso===state.iso);b.className="rankbtn";
      const line=document.createElement("span"),name=document.createElement("b"),val=document.createElement("span"),bar=document.createElement("i");
      name.textContent=row.name;val.textContent=measure(row,s);line.append(name,val);bar.style.width=(row.share??(100*row.value/Math.max(...rows.map(r=>r.value))))+"%";b.append(line,bar);return b
    }));
  }
  drawCountries();
  $("rankTag").textContent=m.symbol+" / "+s.year;$("rankTitle").textContent=stage.label+" · "+m.name;
  const other=stage.snapshots[state.year===0?stage.snapshots.length-1:0],first=rows[0];
  const prior=other.countries.find(r=>r.iso===first?.iso);
  if(other.year!==s.year&&prior?.share!=null&&first?.share!=null){
    const earlier=other.year<s.year?prior:first,later=other.year<s.year?first:prior;
    const change=later.share-earlier.share;
    $("history").textContent=first.name+" · "+Math.min(other.year,s.year)+"–"+Math.max(other.year,s.year)+" · "+(change>0?"+":"")+nf.format(change)+" ποσοστιαίες μονάδες";
  }else{$("history").textContent=other.year===s.year?"Διαθέσιμο στιγμιότυπο "+s.year:"Ιστορικά στιγμιότυπα "+stage.snapshots.map(v=>v.year).join(" / ")}
  $("scope").textContent=s.note||"Παγκόσμια παραγωγή για το έτος αναφοράς.";
  $("source").href=s.source;$("source").textContent=s.sourceName+" ↗";
}
function drawCommon(key){
  state.common=key;choices($("common"),Object.keys(useCases),materialLabel,drawCommon,key);
  $("uses").replaceChildren(...useCases[key].map(([part,descr],i)=>{
    const article=document.createElement("article");article.className="use";
    article.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+objectIcons[i]+'</svg><h3></h3><p class="use-part"></p><p></p>';
    article.querySelector("h3").textContent=objectNames[i];article.children[2].textContent=part;article.children[3].textContent=descr;return article
  }));
}
function showScanned(id,verifiedLabel){
  const entry=scanCatalog[id];if(!entry)return;
  const area=$("scanResult");area.hidden=false;area.replaceChildren();
  const h=document.createElement("h3"),p=document.createElement("p"),links=document.createElement("div");
  h.textContent=entry[0]+" · συνήθη υλικά";p.textContent=entry[1];links.className="chips";
  for(const key of entry[2]){links.append(makeButton(materialLabel(key)+" · άτλας",()=>{pickMaterial(key);location.hash="atlas";$("atlas").scrollIntoView()}))}
  const label=document.createElement("p");label.textContent=verifiedLabel?"Ένδειξη που επιβεβαίωσες στην ετικέτα · "+verifiedLabel:"Χώρα κατασκευής · άγνωστη. Μπορείς να ελέγξεις την ετικέτα ή τη συσκευασία.";
  area.append(h,p,label,links);area.scrollIntoView({block:"center"});
}
options($("materialSelect"),Object.keys(materials).map(k=>[k,materialLabel(k)]));
$("materialSelect").onchange=e=>pickMaterial(e.target.value);
$("year").onchange=e=>{state.year=Number(e.target.value);state.iso="";drawAtlas()};
phone=window.mountMatterPhone($("phone"),pickPart);pickPart("battery");drawCommon("copper");
const slider=$("explode");
phone.explode(Number(slider.value)/100);
let sliderTouched=false;
slider.oninput=()=>{sliderTouched=true;phone.explode(Number(slider.value)/100)};
window.addEventListener("scroll",()=>{if(sliderTouched||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const value=Math.min(100,75+Math.round(window.scrollY/8));if(Number(slider.value)!==value){slider.value=value;phone.explode(value/100)}},{passive:true});
$("scanner").addEventListener("matter:scanreset",()=>{$("scanResult").hidden=true;$("scanResult").replaceChildren()});
window.mountMatterScanner($("scanner"),showScanned);
