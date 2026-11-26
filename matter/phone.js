/* The layers share an orthographic projection and separate along the assembly axis. */
(() => {
  let instance = 0;
  const labels = {
    screen: 'Οθόνη', board: 'Μητρική πλακέτα', battery: 'Μπαταρία',
    camera: 'Κάμερα', frame: 'Πλαίσιο'
  };

  window.mountMatterPhone = function mountMatterPhone(container, onSelect) {
    const key = 'matter-phone-' + (++instance) + '-';
    const url = name => 'url(#' + key + name + ')';
    const rect = (x, y, w, h, r, fill, stroke = 'none', sw = 1) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const circle = (x,y,r,fill,stroke='none',sw=1) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const path = (d, stroke, sw=1, fill='none') =>
      `<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const repeated = (count, draw) => Array.from({length:count}, (_,i)=>draw(i)).join('');
    const screw = (x,y) => circle(x,y,3.1,'#17191b','#a7a6a1',.9) + path(`M${x-1.5} ${y}h3m-1.5 -1.5v3`, '#92928c',.65);
    const tag = (x,y,txt,size=5,fill='#a8aaa7') =>
      `<text x="${x}" y="${y}" fill="${fill}" font-family="ui-monospace,monospace" font-size="${size}" letter-spacing=".58">${txt}</text>`;
    const project = 'matrix(1.13 .47 -.71 .42 0 0)';
    const flat = html => `<g transform="${project}">${html}</g>`;
    const edge = (shape,height) => repeated(height, i => `<g transform="translate(0 ${height-i})">${flat(shape(i,height))}</g>`);
    const rim = (i,h) => rect(0,0,144,278,15,i===0?'#171818':'#434240',i===0?'#84817b':'#575550',.8);
    const fixture = [[10,14],[134,14],[10,263],[134,263],[9,116],[135,116]].map(([x,y])=>screw(x,y)).join('');

    const frameFace = rect(0,0,144,278,15,url('metal'),'#a6a5a0',1.7) +
      rect(4,4,136,270,13,'#222526','#585951') +
      rect(10,10,124,258,10,url('plate'),'#828078',1.15) +
      rect(15,18,113,78,6,'#202524','#a3a098',1) +
      rect(17,101,111,137,7,'#2b2d2c','#827f77',1) +
      rect(18,244,105,17,4,'#343635','#939087',1) +
      repeated(13,i=>path(`M22 ${113+i*9}h96`,'#373a36',.7)) +
      repeated(12,i=>rect(28+i*6,247,3,7,1.5,'#171919','#62645b',.45)) + fixture;
    const frame = edge(rim,7) + flat(frameFace) +
      path('M-129 139l20 -12m-6 4l20 -12','#a5a69c',1.6);

    const boardShape='M11 10Q10 6 16 6H127Q135 6 135 14V101H94L82 112H21Q14 112 14 106V76H8V25H12Z';
    const chip=(x,y,w,h,name) => {
      let s=rect(x,y,w,h,2,url('chip'),'#b3aaa0',.85);
      for(let i=3;i<w-2;i+=4) s+=path(`M${x+i} ${y-2}v2m0 ${h}v2`,'#b1966a',1.2);
      for(let i=3;i<h-2;i+=4) s+=path(`M${x-2} ${y+i}h2m${w} 0h2`,'#b1966a',1.2);
      return s+circle(x+4,y+4,1,'#acaaa2')+(name?tag(x+5,y+h/2+2,name,3.7):'');
    };
    const boardFace=path(boardShape,'#a69c78',1.4,'#27332d')+
      repeated(9,i=>path(`M${20+i*3} 102v-${7+i} l12 -12v-12h${22-i}`,'#a58958',.85))+
      repeated(8,i=>path(`M${106+i*3} 96v-${18+i*2}l-10 -10v-19`,'#927a52',.75))+
      repeated(9,i=>path(`M28 ${18+i*2}h${18-i}l8 8h18`,'#788169',.7))+
      chip(23,17,37,29,'MEM')+chip(70,18,47,45,'SoC')+chip(48,60,34,27,'PMIC')+chip(96,68,20,18,'')+
      repeated(7,i=>rect(17,51+i*3.8,6,2,0.5,'#99856d','#535448',.4))+
      repeated(11,i=>rect(73+i*4.5,10,2.3,4,0.4,'#b59b72'))+
      repeated(15,i=>circle(31+i*5.9,95,1.4,'#b79b65','#766548',.4))+
      screw(16,11)+screw(129,96)+tag(22,107,'MAIN PCB',4);
    const board=edge(()=>path(boardShape,'#65644e',.8,'#292e28'),3)+flat(boardFace);

    const batteryShell=rect(17,100,111,144,6,'#38352f','#877967',.9);
    const batteryFace=rect(17,99,111,144,6,url('cell'),'#d0a283',1.5)+
      rect(20,102,105,138,4,'none','#756557',.95)+
      rect(23,110,99,119,3,url('foil'),'#494641',.75)+
      path('M26 113h92m-92 1h63m-62 111h89','#8a8377',.65)+
      tag(30,138,'Li-ion',12,'#cbc8bc')+tag(30,149,'RECHARGEABLE CELL',4.5)+
      repeated(4,i=>rect(31,166+i*4,[56,65,48,61][i],.7,0,'#777970'))+
      repeated(27,i=>rect(31+i*1.8,202,[.6,1,.8,1.3][i%4],10,0,'#9a9c91'))+
      path('M96 176l8 -14 8 14z M103.9 166.5v4.8m0 2.2v.1','#a0a092',1.1)+
      path('M91 99V84h11V75h8v17h-11v7z','#bc8b60',1,'#8d5b35')+
      repeated(4,i=>path(`M${93+i*1.35} 94v-7h9v-7`,'#d6a776',.55));
    const battery=edge(()=>batteryShell,5)+flat(batteryFace);

    const lens = (x,y,r) => circle(x,y,r+2,'#151819','#9f9b90',1.2)+
      circle(x,y,r,'#4e5251','#b0ada3',.75)+circle(x,y,r-1.9,url('lens'),'#3a3d3d',1)+
      circle(x,y,r*.46,'#121d23','#778c93',.75)+circle(x+1,y-1,r*.2,'#091113')+
      circle(x-r*.25,y-r*.25,1.6,'#c1d5d6')+circle(x+r*.23,y+r*.17,.8,'#829ca2');
    const cameraPlate=rect(14,9,54,63,6,'#393b39','#9f9a8c',1.1);
    const camera=edge(()=>cameraPlate,7)+flat(rect(14,9,54,63,6,url('metal'),'#aaa69a',1.2)+
      rect(16,11,50,59,5,'#303432','#555a56',.8)+lens(32,30,13)+lens(49,52,11)+
      circle(53,23,4,'#c6c3a6','#787970',1)+screw(21,62)+
      path('M66 42h15v6h9v10H76v-7H66Z','#bb9866',.8,'#765d3c'));

    const screenSkin=rect(0,0,144,278,15,url('glass'),'#acada7',1.25)+
      rect(2.8,2.8,138.4,272.4,13,'none','#727a78',.7)+
      rect(6,7,132,263,10,'none','#4e5754',.8)+
      `<g clip-path="${url('screen-clip')}">`+
      path('M-16 215C18 160 55 198 87 137S145 89 163 10','#a9a295',.85)+
      repeated(30,i=>path(`M-24 ${224+i*2.1}C24 ${145+i*2.7} 55 ${202+i*1.3} 90 ${136+i*1.15} S153 ${85+i*1.1} 163 ${9+i*1.5}`,i%5===0?'#6d7975':'#4f5c58',.5))+
      '</g>'+circle(72,13,2.5,'#111617','#65716e',.6)+path('M63 4h18','#747a75',1.1);
    const screen=edge((i,h)=>rect(0,0,144,278,15,i===0?'#252725':'#555854','#7a7d75',.6),4)+flat(screenSkin);

    const gradients=[
      ['metal','#888a83','#484d49','#91918a'],['plate','#74776f','#444944','#62685f'],
      ['cell','#c8ab8f','#5d5146','#a5876f'],['foil','#454641','#303330','#484a43'],
      ['chip','#575a55','#2a2d2c','#383c37'],['glass','#414b48','#192421','#34413d']
    ].map(([n,a,b,c])=>`<linearGradient id="${key+n}" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="${a}"/><stop offset=".57" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`).join('');
    const parts=[
      {id:'frame',dx:34,dy:111,html:frame},
      {id:'battery',dx:1,dy:8,html:battery},
      {id:'board',dx:2,dy:9,html:board},
      {id:'camera',dx:87,dy:-29,html:camera},
      {id:'screen',dx:-44,dy:-105,html:screen}
    ];
    const outlines = {
      screen: rect(0,0,144,278,15,'none','#f4ac74',2.3),
      frame: rect(0,0,144,278,15,'none','#f4ac74',2.3),
      board: path(boardShape,'#f4ac74',2.3),
      camera: rect(14,9,54,63,6,'none','#f4ac74',2.3),
      battery: rect(17,99,111,144,6,'none','#f4ac74',2.3)
    };
    const shapes=parts.map(p=>`<g data-part="${p.id}" role="button" tabindex="0" aria-pressed="false" aria-label="${labels[p.id]}" class="matter-phone-part"><title>${labels[p.id]}</title>${p.html}<g class="matter-phone-outline" pointer-events="none">${flat(outlines[p.id])}</g></g>`).join('');
    const guides=[[0,0],[144,0],[0,278],[144,278]].map(([x,y])=>{
      const px=283+1.13*x-.71*y, py=154+.47*x+.42*y;
      return `<line data-guide-x="${px}" data-guide-y="${py}"/>`;
    }).join('');
    container.innerHTML=`<svg viewBox="0 0 590 490" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="group" aria-label="Διαδραστική ανατομία κινητού" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">
    <defs>${gradients}
      <clipPath id="${key}screen-clip"><rect x="7" y="8" width="130" height="261" rx="10"/></clipPath>
      <radialGradient id="${key}lens" cx=".4" cy=".37"><stop stop-color="#718181"/><stop offset=".38" stop-color="#263237"/><stop offset=".73" stop-color="#0c1519"/><stop offset="1" stop-color="#57656a"/></radialGradient>
      <filter id="${key}shadow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
      <style>
        .matter-phone-part {cursor:pointer;outline:none}
        .matter-phone-part:hover,.matter-phone-part:focus-visible{filter:brightness(1.22)}
        .matter-phone-part[aria-pressed="true"] {filter:brightness(1.11)}
        .matter-phone-outline{opacity:0}
        .matter-phone-part[aria-pressed="true"] .matter-phone-outline,
        .matter-phone-part:focus-visible .matter-phone-outline{opacity:1}
      </style>
    </defs>
    <ellipse cx="300" cy="438" rx="148" ry="15" opacity=".24" fill="#000" filter="${url('shadow')}"/>
    <g fill="none" stroke="#ab9378" opacity=".32" stroke-width="1" stroke-dasharray="2 5" pointer-events="none">${guides}</g>
    ${shapes}
    </svg>`;
    const nodes=Array.from(container.querySelectorAll('[data-part]'));
    function select(id) {
      if(!Object.hasOwn(labels,id))return;
      nodes.forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.part===id)));
    }
    function explode(amount) {
      const f=Number.isFinite(Number(amount))?Math.min(1,Math.max(0,Number(amount))):1;
      parts.forEach((p,i)=>nodes[i].setAttribute('transform',`translate(${283+p.dx*f} ${154+p.dy*f})`));
      container.querySelectorAll('[data-guide-x]').forEach(line=>{
        const x=Number(line.dataset.guideX),y=Number(line.dataset.guideY);
        line.setAttribute('x1',x-44*f);line.setAttribute('y1',y-105*f);
        line.setAttribute('x2',x+34*f);line.setAttribute('y2',y+111*f);
      });
    }
    nodes.forEach(node=>{
      const activate=()=>{select(node.dataset.part); if(typeof onSelect==='function')onSelect(node.dataset.part);};
      node.addEventListener('click',activate);
      node.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}
      });
    });
    select('battery');explode(1);
    return {select,explode};
  };
})();
