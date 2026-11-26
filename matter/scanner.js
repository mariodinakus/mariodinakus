/* Image inference and label OCR run on the device. No endpoint receives image bytes. */
(() => {
  'use strict';
  const models = {
    library:'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js',
    name:'Xenova/clip-vit-base-patch32',
    ocr:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
  };
  const objects = [
    ['phone','Κινητό','a smartphone'],['laptop','Laptop','a laptop computer'],
    ['bicycle','Ποδήλατο','a bicycle'],['headphones','Ακουστικά','headphones or earbuds'],
    ['bottle','Πλαστικό μπουκάλι ποτού','a plastic drink bottle'],
    ['ev','Ηλεκτρικό αυτοκίνητο','a passenger car'],['wind','Ανεμογεννήτρια','a wind turbine']
  ];
  const competingLabels=['a glass bottle','a metal flask or can','food','a person',
    'a building or a landscape','a printed product label or cardboard box',
    'a television or a desktop monitor','a motorcycle','a book','furniture',
    'an unrelated household object','an animal','an item of clothing','an empty or blurry scene'];
  const scriptURL = typeof document !== 'undefined' ? document.currentScript?.src : null;
  if(typeof document==='undefined'){
    let pipe;
    self.onmessage=async({data})=>{
      try{
        if(!pipe){
          const lib=await import(models.library);
          lib.env.allowLocalModels=false;
          lib.env.backends.onnx.wasm.numThreads=1;
          const progress_callback=event=>{
            if(event.status==='progress'&&event.total>3000000)
              self.postMessage({progress:Math.min(100,Math.round(100*event.loaded/event.total))});
          };
          pipe={lib,run:await lib.pipeline('zero-shot-image-classification',models.name,{quantized:true,progress_callback})};
        }
        self.postMessage({evaluating:true});
        const raw=new pipe.lib.RawImage(new Uint8ClampedArray(data.pixels),data.w,data.h,4);
        const alternatives=[...objects.map(o=>o[2]),...competingLabels];
        const hits=await pipe.run(raw,alternatives);
        self.postMessage({hits:hits.slice(0,2)});
      }catch{self.postMessage({failed:true});}
    };
    return;
  }

  const options=objects.map(([id,name])=>'<option value="'+id+'">'+name+'</option>').join('');
  let ocrLibrary;
  function getOCR(){
    if(window.Tesseract)return Promise.resolve(window.Tesseract);
    if(!ocrLibrary)ocrLibrary=new Promise((resolve,reject)=>{
      const tag=document.createElement('script');
      tag.src=models.ocr;
      tag.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(new Error('OCR unavailable'));
      tag.onerror=()=>{tag.remove();reject(new Error('OCR unavailable'));};
      document.head.appendChild(tag);
    }).catch(e=>{ocrLibrary=null;throw e;});
    return ocrLibrary;
  }
  function inspectLabel(text){
    // Retain the actual printed phrase, including its verb; packaging and assembly differ.
    const pattern=/\b(?:made\s+in|assembled\s+in|manufactured\s+in|produced\s+in|country\s+of\s+origin\s*[:–-]?|product\s+of)\s*[:–-]?\s*\S/i;
    return text.split(/\r?\n/).map(line=>line.trim()).filter(line=>pattern.test(line)).slice(0,3).join('\n');
  }
  window.mountMatterScanner=function mountMatterScanner(container,onConfirm){
    container.innerHTML=`<div class="section-heading"><div><p class="eyebrow">ΣΑΡΩΤΗΣ ΑΝΤΙΚΕΙΜΕΝΩΝ</p><h2>Τι κρατάς στο χέρι σου<span>;</span></h2></div></div>
    <div class="ms-panel"><div class="ms-view">
      <div class="ms-idle"><svg viewBox="0 0 80 80" aria-hidden="true" width="58" height="58" fill="none"><g stroke="currentColor" stroke-width="2"><path d="M9 28V12h17m28 0h17v16M9 52v16h17m28 0h17V52"/><rect x="20" y="25" width="40" height="30" rx="5"/><circle cx="40" cy="40" r="9"/></g></svg><span>Φωτογράφισε ένα αντικείμενο</span></div>
      <video class="ms-video" autoplay playsinline muted hidden aria-label="Προεπισκόπηση κάμερας"></video><canvas class="ms-photo" hidden aria-label="Η φωτογραφία σου"></canvas>
      <div class="ms-tools"><button type="button" data-do="camera">Άνοιξε κάμερα</button><button type="button" data-do="capture" hidden>Λήψη</button><button type="button" data-do="upload">Επιλογή εικόνας</button><button type="button" data-do="clear" hidden>Καθαρισμός</button></div>
      <input type="file" accept="image/*" hidden aria-label="Επιλογή αρχείου φωτογραφίας">
    </div><div class="ms-controls">
      <p class="ms-help">Σάρωσε το αντικείμενο για αναγνώριση ή την ετικέτα του για ανάγνωση κειμένου. Η φωτογραφία επεξεργάζεται στη συσκευή σου.</p>
      <div class="ms-actions"><button type="button" data-do="recognize" disabled>Αναγνώριση αντικειμένου</button><button type="button" data-do="ocr" disabled>Διάβασε ετικέτα</button><button type="button" data-do="cancel" hidden>Ακύρωση</button></div>
      <p class="ms-note">Η πρώτη αναγνώριση κατεβάζει μοντέλο περίπου 154 MB. Η ανάγνωση ετικέτας κατεβάζει ξεχωριστό αγγλικό λεξικό.</p>
      <p class="ms-status" role="status" aria-live="polite"></p>
      <button type="button" class="ms-manual" data-do="manual">Καταχώριση ένδειξης ετικέτας</button>
      <div class="ms-label" hidden><label class="ms-transcript">Κείμενο που διαβάστηκε<textarea rows="3" readonly></textarea></label><div class="ms-evidence" hidden><label>Ένδειξη όπως αναγράφεται στην ετικέτα <input type="text" maxlength="200" placeholder="π.χ. Assembled in…"></label><button type="button" data-do="verify">Το επαλήθευσα στην ετικέτα</button></div></div>
      <label class="ms-select">Κατηγορία αντικειμένου<select><option value="">Διάλεξε κατηγορία</option>${options}<option value="other">Άλλο αντικείμενο</option></select></label>
      <label class="ms-check" hidden><input type="checkbox"><span></span></label>
      <button type="button" class="ms-primary" data-do="confirm" disabled>Επιβεβαίωση και προβολή υλικών</button>
    </div></div>`;
    const q=s=>container.querySelector(s),btn=name=>q('[data-do="'+name+'"]');
    const canvas=q('canvas'),video=q('video'),file=q('input[type=file]'),select=q('select'),status=q('.ms-status');
    const verify=q('.ms-check input'),verifyBox=q('.ms-check'),labelBox=q('.ms-label'),evidence=q('.ms-evidence');
    const media=container.querySelector('.ms-idle');
    let stream=null,worker=null,ocr=null,request=0,captureTicket=0,hasImage=false,busy=false,verifiedLabel=null;
    const setStatus=value=>status.textContent=value;
    const resetResult=()=>container.dispatchEvent(new CustomEvent('matter:scanreset',{bubbles:true}));
    function stopCamera(){
      captureTicket++;
      stream?.getTracks().forEach(t=>t.stop());
      stream=null;video.srcObject=null;video.hidden=true;btn('capture').hidden=true;
      btn('camera').hidden=false;media.hidden=hasImage;
      btn('clear').hidden=!hasImage;
    }
    function stopWork(){
      request++;
      if(worker){worker.terminate();worker=null;}
      if(ocr){ocr.terminate().catch(()=>{});ocr=null;}
      busy=false;buttons();
    }
    function buttons(){
      btn('recognize').disabled=busy||!hasImage;
      btn('ocr').disabled=busy||!hasImage;
      btn('cancel').hidden=!busy;
      btn('confirm').disabled=busy||!objects.some(o=>o[0]===select.value)||(!verifyBox.hidden&&!verify.checked);
    }
    function changeCategory(){
      verify.checked=false;verifyBox.hidden=!['ev','bottle'].includes(select.value);
      q('.ms-check span').textContent=select.value==='ev'?'Επιβεβαιώνω ότι το όχημα είναι αμιγώς ηλεκτρικό.':'Επιβεβαιώνω ότι είναι πλαστικό μπουκάλι ποτού.';
      if(select.value==='other')setStatus('Δεν υπάρχει ακόμη διαδρομή υλικών για αυτό το αντικείμενο.');
      buttons();
    }
    function eraseEvidence(){
      resetResult();verifiedLabel=null;select.value='';changeCategory();labelBox.hidden=true;evidence.hidden=true;
      q('textarea').value='';q('.ms-evidence input').value='';
      btn('verify').disabled=false;q('.ms-evidence input').readOnly=false;
    }
    function dimensions(w,h,max){
      const f=Math.min(1,max/Math.max(w,h));
      return [Math.max(1,Math.round(w*f)),Math.max(1,Math.round(h*f))];
    }
    function saveFrame(source,w,h){
      if(!w||!h)throw new Error('Image unavailable');
      const [width,height]=dimensions(w,h,2200);
      canvas.width=width;canvas.height=height;
      canvas.getContext('2d').drawImage(source,0,0,width,height);
      hasImage=true;canvas.hidden=false;media.hidden=true;stopCamera();stopWork();eraseEvidence();
      setStatus('Η εικόνα είναι έτοιμη. Διάλεξε αναγνώριση ή ανάγνωση ετικέτας.');
    }
    btn('camera').onclick=async()=>{
      stopCamera();stopWork();const ticket=captureTicket;
      if(!navigator.mediaDevices?.getUserMedia){setStatus('Η κάμερα δεν είναι διαθέσιμη εδώ. Χρησιμοποίησε «Επιλογή εικόνας».');return;}
      btn('clear').hidden=false;setStatus('Παραχώρησε πρόσβαση στην κάμερα για προεπισκόπηση.');
      try{
        const opened=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
        if(ticket!==captureTicket){opened.getTracks().forEach(t=>t.stop());return;}
        stream=opened;video.srcObject=stream;video.hidden=false;media.hidden=true;canvas.hidden=true;
        btn('camera').hidden=true;btn('clear').hidden=false;
        await video.play();
        if(ticket!==captureTicket)return;
        btn('capture').hidden=false;setStatus('Κράτησε σταθερή την κάμερα και πάτησε «Λήψη».');
      }catch(e){
        if(ticket!==captureTicket)return;
        stopCamera();canvas.hidden=!hasImage;
        setStatus(e.name==='NotAllowedError'?'Δεν δόθηκε άδεια κάμερας. Μπορείς να επιλέξεις αποθηκευμένη εικόνα.':'Δεν άνοιξε η κάμερα. Μπορείς να επιλέξεις αποθηκευμένη εικόνα.');
      }
    };
    btn('capture').onclick=()=>{try{saveFrame(video,video.videoWidth,video.videoHeight);}catch{setStatus('Η κάμερα δεν έχει έτοιμο καρέ. Δοκίμασε ξανά.');}};
    btn('upload').onclick=()=>{stopCamera();canvas.hidden=!hasImage;file.click();};
    file.onchange=async()=>{
      const selected=file.files?.[0];file.value='';if(!selected)return;
      stopCamera();stopWork();const ticket=captureTicket;
      if(selected.size>25*1024*1024){setStatus('Διάλεξε εικόνα μικρότερη από 25 MB.');return;}
      const tmp=URL.createObjectURL(selected);
      try{
        const img=new Image();img.src=tmp;await img.decode();
        if(ticket===captureTicket)saveFrame(img,img.naturalWidth,img.naturalHeight);
      }catch{if(ticket===captureTicket)setStatus('Δεν διαβάστηκε η εικόνα. Δοκίμασε JPEG, PNG ή WebP.');}
      finally{URL.revokeObjectURL(tmp);}
    };
    btn('clear').onclick=()=>{
      hasImage=false;stopCamera();stopWork();canvas.width=canvas.height=1;canvas.hidden=true;eraseEvidence();setStatus('');
    };
    btn('cancel').onclick=()=>{stopWork();setStatus('Η επεξεργασία ακυρώθηκε.');};
    select.onchange=()=>{resetResult();if(busy)stopWork();changeCategory();};
    verify.onchange=buttons;
    btn('confirm').onclick=()=>{if(!btn('confirm').disabled&&typeof onConfirm==='function')onConfirm(select.value,verifiedLabel);};
    btn('manual').onclick=()=>{
      if(busy)stopWork();
      resetResult();verifiedLabel=null;
      labelBox.hidden=false;evidence.hidden=false;q('.ms-transcript').hidden=!q('textarea').value;
      btn('verify').disabled=false;q('.ms-evidence input').readOnly=false;
      setStatus('Αντέγραψε τη διατύπωση ακριβώς όπως εμφανίζεται στην ετικέτα.');q('.ms-evidence input').focus();
    };
    btn('verify').onclick=()=>{
      const entry=q('.ms-evidence input');if(!entry.value.trim()){setStatus('Συμπλήρωσε την ένδειξη όπως τυπώνεται στην ετικέτα.');return;}
      resetResult();verifiedLabel=entry.value.trim();entry.readOnly=true;btn('verify').disabled=true;setStatus('Επαλήθευσες την αναγραφόμενη ένδειξη στην ετικέτα. Μπορείς να τη συμπεριλάβεις στην προβολή υλικών.');
    };
    btn('recognize').onclick=()=>{
      stopWork();resetResult();select.value='';changeCategory();busy=true;buttons();setStatus('Φόρτωση μοντέλου αναγνώρισης…');
      const ticket=request;
      const fail=()=>{if(ticket!==request)return;stopWork();setStatus('Το μοντέλο δεν εκτελέστηκε σε αυτή τη συσκευή ή σύνδεση. Μπορείς να επιλέξεις κατηγορία χειροκίνητα.');};
      try{
        worker=new Worker(scriptURL||new URL('scanner.js',document.baseURI),{type:'module'});
        worker.onerror=fail;
        worker.onmessage=({data})=>{
          if(ticket!==request)return;
          if(data.failed){fail();return;}
          if(data.progress!==undefined){setStatus('Λήψη αρχείου μοντέλου · '+data.progress+'%');return;}
          if(data.evaluating){setStatus('Αναγνώριση στη συσκευή…');return;}
          const [first,second]=data.hits||[],suggested=objects.find(o=>o[2]===first?.label);
          stopWork();
          if(!suggested||first.score<.45||first.score-(second?.score||0)<.12){
            setStatus('Το αποτέλεσμα είναι αβέβαιο ή εκτός συλλογής. Επιβεβαίωσε το αντικείμενο χειροκίνητα.');return;
          }
          select.value=suggested[0];changeCategory();
          setStatus(suggested[0]==='ev'?'Η εικόνα μοιάζει με αυτοκίνητο. Επιβεβαίωσε τον τύπο κίνησης.':
            suggested[0]==='bottle'?'Η εικόνα μοιάζει με μπουκάλι. Επιβεβαίωσε το υλικό του.':'Πιθανή κατηγορία · '+suggested[1]+'. Έλεγξέ τη πριν συνεχίσεις.');
        };
        const reduced=document.createElement('canvas');
        [reduced.width,reduced.height]=dimensions(canvas.width,canvas.height,448);
        const ctx=reduced.getContext('2d');ctx.drawImage(canvas,0,0,reduced.width,reduced.height);
        const pixels=ctx.getImageData(0,0,reduced.width,reduced.height).data.buffer;
        worker.postMessage({w:reduced.width,h:reduced.height,pixels},[pixels]);
      }catch{fail();}
    };
    btn('ocr').onclick=async()=>{
      stopWork();busy=true;buttons();const ticket=request;
      resetResult();verifiedLabel=null;labelBox.hidden=true;evidence.hidden=true;q('textarea').value='';q('.ms-evidence input').value='';setStatus('Φόρτωση ανάγνωσης ετικέτας…');
      try{
        const api=await getOCR();
        if(ticket!==request)return;
        const engine=await api.createWorker('eng',1,{
          workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
          corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0',
          logger:event=>{if(ticket===request&&event.status==='recognizing text')setStatus('Ανάγνωση κειμένου · '+Math.round(event.progress*100)+'%');}
        });
        if(ticket!==request){await engine.terminate();return;}
        ocr=engine;const {data}=await engine.recognize(canvas);
        if(ticket!==request)return;
        const text=data.text.trim(),origin=inspectLabel(text);
        labelBox.hidden=!text;q('.ms-transcript').hidden=!text;q('textarea').value=text;
        evidence.hidden=!origin;q('.ms-evidence input').value=origin.replace(/\n/g,' · ');
        q('.ms-evidence input').readOnly=false;btn('verify').disabled=false;
        setStatus(origin?'Βρέθηκε πιθανή ένδειξη προέλευσης. Σύγκρινέ τη με την ετικέτα και διόρθωσέ τη αν χρειάζεται.':
          text?'Διαβάστηκε κείμενο χωρίς σαφή αγγλική ένδειξη προέλευσης.':'Δεν διαβάστηκε κείμενο. Φωτογράφισε πιο κοντά και με ομοιόμορφο φως.');
      }catch{if(ticket===request)setStatus('Η ανάγνωση δεν ολοκληρώθηκε. Έλεγξε τη σύνδεση για την πρώτη λήψη και δοκίμασε ξανά.');}
      finally{if(ticket===request)stopWork();}
    };
    const close=()=>{stopCamera();stopWork();canvas.hidden=!hasImage;};
    const hide=()=>{if(document.hidden&&stream){stopCamera();canvas.hidden=!hasImage;}};
    window.addEventListener('pagehide',close);document.addEventListener('visibilitychange',hide);
    return {destroy(){close();window.removeEventListener('pagehide',close);document.removeEventListener('visibilitychange',hide);}};
  };
})();
