/* 서울 구(區) 묶음 (사장님 2026-10-20) — 서울 약도(seoulall)에서 구마다 대표 그림 1개 + 「+N」(대표를 뺀 나머지 명소 수) · 명소 없는 구는 이름표
   누르면 그 구 화면: 그 구 약도(서울 전체 좌표에서 잘라 그린 바탕, img/gu/maps/<id>.jpg) 위에 기존 하위 약도(광화문·인사동·경복궁·명동…)를
   제자리·제 크기로 얹는다. 명소는 약도에 그려진 실제 자리 그대로 — 손가락으로 끌고 두 손가락으로 확대(기존 약도 방식 그대로)
   구 밖은 하얗게 가리고 경계는 주황 선. 돌아가기 = ← · 「✕」 · 뒤로가기 → 서울 묶음 화면
   자료는 tour_icons\navi_build\gu_build.py (data/gu_seoul.json · img/gu/*.webp · img/gu/maps/*.jpg), 구 약도 바탕은 seoul_map\gu\render_gu.py */
(function(){
  var V=""; try{ V=((document.currentScript&&document.currentScript.src||"").match(/[?&]v=([0-9a-f]+)/)||[])[1]||""; }catch(e){}
  var GU=window.GU={d:null,g:null,p:null,key:null,zmax:0};
  var st=document.createElement("style");
  st.textContent="#gul{position:absolute;inset:0;pointer-events:none;z-index:2}#gul>*{position:absolute;pointer-events:auto;cursor:pointer;box-sizing:border-box}"+
    "#gul img{object-fit:contain;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35));-webkit-user-drag:none;user-select:none}"+
    "#gul img.gm{pointer-events:none;filter:none;object-fit:fill}#gul .gcl>img{position:absolute;display:block;max-width:none}#gul svg.gv{left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}"+
    "#gul .gb{background:#e8590c;color:#fff;font-weight:900;border:solid #fff;border-radius:999px;line-height:1;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center}"+
    "#gul .gn{background:rgba(255,255,255,.9);color:#7c2d12;font-weight:900;border:solid #e8590c;border-radius:999px;line-height:1;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%)}"+
    "#map.gumode #lod{display:none!important}"+
    "#guX{position:absolute;top:10px;left:50%;transform:translateX(-50%);white-space:nowrap;z-index:30;border:0;border-radius:999px;background:rgba(20,24,32,.88);color:#fff;font-weight:900;font-size:15px;padding:7px 14px;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer}#guX[hidden]{display:none}";
  document.head.appendChild(st);
  function load(){ if(GU.p) return GU.p; return GU.p=fetch("data/gu_seoul.json?v="+V).then(function(r){ if(!r.ok) throw new Error("gu "+r.status); return r.json(); }).then(function(d){ GU.d=d; return d; },function(e){ GU.p=null; throw e; }); }
  function on(){ return !!(GU.d&&typeof VIEW==="string"&&VIEW===GU.d.map&&!window.DET); }
  function gObj(g){ var L=GU.d.gus; for(var i=0;i<L.length;i++) if(L[i].g===g) return L[i]; return null; }
  function layer(){ var L=document.getElementById("gul"); if(!L){ L=document.createElement("div"); L.id="gul"; document.getElementById("mz").appendChild(L); } return L; }
  function chip(){ var b=document.getElementById("guX"); if(!b){ b=document.createElement("button"); b.type="button"; b.id="guX"; b.hidden=true; document.getElementById("map").appendChild(b);
      b.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); exit(); }); } return b; }
  function title(){ var tt=document.getElementById("vttl"), c=CITY[GU.d.map], o=GU.g&&gObj(GU.g); if(tt&&c) tt.textContent=LN(c)+(o?" · "+LP(o.n):""); var b=chip(); b.hidden=!o||!on(); if(o) b.textContent=LP(o.n)+"  ✕"; }
  function put(e,x,y,w,h){ e.style.left=x+"px"; e.style.top=y+"px"; e.style.width=w+"px"; e.style.height=h+"px"; }
  function img(k){ var q=GU.d.P[k], e=document.createElement("img"); e.src=q.i; e.alt=""; e.draggable=false; e.dataset.k=k; try{ e.title=pName(k)||""; }catch(x){} return e; }
  // 하위 약도 자리(서울 약도 비율) — 빨간 네모(areas)를 따라 내려간다. 부모 먼저(그 위에 아이 약도를 얹는다)
  function subs(){ var out=[]; (function walk(id,R){ var c=CITY[id]; if(!c||!c.areas) return; for(var a in c.areas){ var b=c.areas[a], r=[R[0]+b[0]*(R[2]-R[0]),R[1]+b[1]*(R[3]-R[1]),R[0]+b[2]*(R[2]-R[0]),R[1]+b[3]*(R[3]-R[1])]; out.push({id:a,r:r}); walk(a,r); } })(GU.d.map,[0,0,1,1]); return out; }
  function shown(o){ var b=GU.pb||[0,0,1,1]; return subs().filter(function(s){ var r=s.r; return CITY[s.id]&&CITY[s.id].img&&r[0]<b[2]&&r[2]>b[0]&&r[1]<b[3]&&r[3]>b[1]; }); }
  function pbOf(o){ var x0=9,y0=9,x1=-9,y1=-9; (o.poly||[]).forEach(function(r){ r.forEach(function(f){ x0=Math.min(x0,f[0]); y0=Math.min(y0,f[1]); x1=Math.max(x1,f[0]); y1=Math.max(y1,f[1]); }); }); return [x0,y0,x1,y1]; }
  // 구 화면 누르기 자리 = 아이콘 상자(실제 자리)
  function hits(){ var o=gObj(GU.g); return (o&&o.ic)||{}; }
  // 전역 약도 조각 — 보이는 곳만 붙이고(위·아래·옆 한 조각 여유) 벗어난 것은 뗀다. 멀리 볼 땐 4배 줄인 판
  function chunks(){ var L=document.getElementById("gul"), cl=GU.cl; if(!L||!cl||!GU.d.ch) return; var ch=GU.d.ch, G2=ch.G2, C=ch.C, m=document.getElementById("map"), w=m.clientWidth, h=MH(), W=w*ASP(), H=w;
    var lv=(ZM.s*w/G2<0.12)?1:0, sz=lv?C*4:C, set=lv?GU.l1:GU.l0, fx0=(-ZM.tx)/(w*ZM.s), fy0=(-ZM.ty)/(w*ZM.s), fx1=(w-ZM.tx)/(w*ZM.s), fy1=(h-ZM.ty)/(w*ZM.s);
    var x0=Math.floor(fx0*G2/sz)-1, x1=Math.floor(fx1*G2/sz)+1, y0=Math.floor(fy0*G2/sz)-1, y1=Math.floor(fy1*G2/sz)+1, want={};
    for(var x=x0;x<=x1;x++) for(var y=y0;y<=y1;y++){ var id=lv+":"+x+"_"+y; if(!set[x+"_"+y]) continue; want[id]=1;
      if(!GU.cel[id]){ var e=document.createElement("img"); e.className="gm gc"; e.alt=""; e.draggable=false; e.src="img/gu/c"+(lv?"1":"")+"/"+x+"_"+y+".jpg?v="+ch.v; put(e,x*sz/G2*W,y*sz/G2*H,sz/G2*W+0.6,sz/G2*H+0.6); cl.appendChild(e); GU.cel[id]=e; } }
    for(var id2 in GU.cel){ if(!want[id2]&&!(GU.cel[id2].dataset.keep)){ var lv2=+id2.charAt(0); if(lv2!==lv||Object.keys(GU.cel).length>60){ GU.cel[id2].remove(); delete GU.cel[id2]; } } } }
  function draw(){ var m=document.getElementById("map"); if(!m) return; var L=document.getElementById("gul");
    if(!on()){ if(L) L.hidden=true; m.classList.remove("gumode"); if(GU.d) chip().hidden=true; GU.key=null; return; }
    m.classList.add("gumode"); L=layer(); L.hidden=false; var w=m.clientWidth, as=ASP(), W=w*as, H=w, key=LANG+"|"+w+"|"+(GU.g||"");
    title(); if(GU.key===key){ if(GU.g){ try{ chunks(); }catch(e){} var sw=String(3/ZM.s); [].forEach.call(L.querySelectorAll("path.gs"),function(p){ p.setAttribute("stroke-width",sw); }); } return; }
    GU.key=key; L.innerHTML=""; var P=GU.d.P;
    if(!GU.g){   // 묶음: 구마다 대표 1개 + 배지 · 명소 없는 구는 이름표 · 서울 밖(북한산·남한산성)은 그림 그대로
      var fs=Math.max(4,w*0.019);
      GU.d.gus.forEach(function(o){
        if(!o.rep){ var t0=document.createElement("div"); t0.className="gn"; t0.dataset.g=o.g; t0.textContent=LP(o.n); t0.style.fontSize=(fs*0.8)+"px"; t0.style.height=(fs*1.5)+"px"; t0.style.padding="0 "+(fs*0.45)+"px"; t0.style.borderWidth=Math.max(0.4,fs*0.08)+"px";
          t0.style.left=(o.c[0]*W)+"px"; t0.style.top=(o.c[1]*H)+"px"; L.appendChild(t0); return; }
        var b=P[o.rep].b, x=b[0]*W, y=b[1]*H, bw=(b[2]-b[0])*W, bh=(b[3]-b[1])*H, e=img(o.rep); e.dataset.g=o.g; e.removeAttribute("data-k"); e.title=LP(o.n); put(e,x,y,bw,bh); L.appendChild(e);
        var n=o.keys.length-1; if(n>0){ var t=document.createElement("div"); t.className="gb"; t.dataset.g=o.g; t.textContent="+"+n; t.title=LP(o.n); t.style.fontSize=fs+"px"; t.style.height=(fs*1.55)+"px"; t.style.padding="0 "+(fs*0.45)+"px"; t.style.borderWidth=Math.max(0.5,fs*0.12)+"px";
          L.appendChild(t); var tw=t.offsetWidth||fs*2.4; t.style.left=(x+bw-tw*0.55)+"px"; t.style.top=(y-fs*0.6)+"px"; } });
      GU.d.out.forEach(function(k){ var b=P[k].b, e=img(k); put(e,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); L.appendChild(e); });
      return; }
    // 구 화면: 서울 전역 약도(조각) → 구 밖 가림 + 경계선 → 아이콘(실제 자리, 가림 위라 경계에 걸쳐도 잘리지 않음)
    var o=gObj(GU.g); if(!o) return; var PG=o.poly||[];
    if(o.b){ var bi=document.createElement("img"); bi.className="gm"; bi.src=o.b.i; bi.alt=""; bi.draggable=false; put(bi,o.b.r[0]*W,o.b.r[1]*H,(o.b.r[2]-o.b.r[0])*W,(o.b.r[3]-o.b.r[1])*H); L.appendChild(bi); }   // 조각 오기 전 밑그림
    var cl=document.createElement("div"); cl.className="gcl"; cl.style.cssText="position:absolute;inset:0;pointer-events:none"; L.appendChild(cl); GU.cl=cl; GU.cel={}; chunks();
    var NS="http://www.w3.org/2000/svg", sv=document.createElementNS(NS,"svg"); sv.setAttribute("viewBox","0 0 1 1"); sv.setAttribute("preserveAspectRatio","none"); sv.setAttribute("class","gv");
    var dd="M-1 -1H2V2H-1Z"; PG.forEach(function(r){ dd+="M"+r.map(function(p){ return p[0]+" "+p[1]; }).join("L")+"Z"; });
    var vp=document.createElementNS(NS,"path"); vp.setAttribute("d",dd); vp.setAttribute("fill-rule","evenodd"); vp.setAttribute("fill","rgba(248,246,240,.82)"); sv.appendChild(vp);
    PG.forEach(function(r){ var e=document.createElementNS(NS,"path"); e.setAttribute("class","gs"); e.setAttribute("d","M"+r.map(function(p){ return p[0]+" "+p[1]; }).join("L")+"Z"); e.setAttribute("fill","none"); e.setAttribute("stroke","#e8590c"); e.setAttribute("stroke-width",String(3/ZM.s)); e.setAttribute("vector-effect","non-scaling-stroke"); e.setAttribute("stroke-linejoin","round"); sv.appendChild(e); });
    L.appendChild(sv);
    var ic=o.ic||{}, ho=o.ho||[]; for(var k in ic){ var b=ic[k], q=P[k]; if(!q||ho.indexOf(k)>=0) continue;   /* ho = 궁 전체 그림 안에 이미 그려진 명소 — 누름 자리만 */ var e=img(k); e.className="gm"; put(e,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); L.appendChild(e); } }
  // 들어갈 때 배율 — 대표 명소가 있는 하위 약도를 그 약도 화면과 같은 크기로(없으면 구 약도를 「광화문 일대」 약도와 같은 크기로), 대표를 가운데
  // 들어갈 때 — 대표 명소(없으면 구 한가운데)를 가운데, 전역 약도 1 px ≈ 화면 0.3 px (하위 약도 화면과 같은 크기)
  function enter(g){ var o=gObj(g); if(!o||!on()) return; try{ ntap("gu:"+g,"open_area"); }catch(e){} try{ inBlur(); }catch(e){} try{ resClear(); }catch(e){}
    GU.g=g; GU.key=null; GU.pb=pbOf(o); var ch=GU.d.ch; GU.l0={}; GU.l1={}; (ch.l0||[]).forEach(function(c){ GU.l0[c[0]+"_"+c[1]]=1; }); (ch.l1||[]).forEach(function(c){ GU.l1[c[0]+"_"+c[1]]=1; });
    var m=document.getElementById("map"), w=m.clientWidth, h=MH(), as=ASP(), b=o.rep&&o.ic&&o.ic[o.rep], s=0.3*ch.G2/w, cx=b?(b[0]+b[2])/2:o.c[0], cy=b?(b[1]+b[3])/2:o.c[1];
    GU.zmax=s*4; ZM={s:s,tx:w/2-cx*w*as*s,ty:h/2-cy*w*s}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} draw(); }
  function exit(){ if(!GU.g) return false; GU.g=null; GU.key=null; GU.zmax=0; var m=document.getElementById("map"), w=m.clientWidth, c=CITY[VIEW], s0=ZB(); ZM={s:s0,tx:w/2-((c&&c.fx)||0.5)*w*((c&&c.aspect)||1)*s0,ty:0}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} draw(); return true; }
  window.guEnter=enter; window.guBack=function(){ return on()&&exit(); };
  function kidsLoad(){ (GU.d.kids||[]).forEach(function(id){ try{ mapLoad(id).catch(function(){}); }catch(e){} }); }
  function apply(){ if(!on()){ draw(); return; } var im=document.getElementById("mapimg"); if(im.getAttribute("src")!==GU.d.img) im.src=GU.d.img; kidsLoad(); draw(); }
  var _vs=window.viewSet; window.viewSet=function(v){ GU.g=null; GU.key=null; GU.zmax=0; var r=_vs.apply(this,arguments); if(CITY[v]&&v==="seoulall") load().then(apply).catch(function(){}); else draw(); return r; };
  var _ds=window.detSet; window.detSet=function(){ var r=_ds.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _ld=window.lodDraw; window.lodDraw=function(){ var r=_ld.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _zm=window.ZMAX; window.ZMAX=function(){ var r=_zm.apply(this,arguments); return (GU.g&&on())?Math.max(r,GU.zmax||0):r; };   // 구 화면은 하위 약도 크기까지 당길 수 있게
  var _at=window.areaTap; window.areaTap=function(){ if(on()) return 0; return _at.apply(this,arguments); };   // 묶음·구 화면엔 빨간 네모·명찰이 없다
  var _ha=window.hitAt; window.hitAt=function(cx,cy){ var r=_ha.apply(this,arguments); if(!on()) return r; if(r==="__me"||r==="__pin") return r;
    if(!GU.g) return (r&&GU.d.P[r])?null:r;   // 묶음: 바탕에서 뺀 그림 자리는 안 눌린다(그림은 #gul 이 받는다)
    var im=document.getElementById("mapimg").getBoundingClientRect(), fx=(cx-im.left)/im.width, fy=(cy-im.top)/im.height, H=hits(), best=null, ba=1e9, pad=0.0004;
    for(var k in H){ var b=H[k]; if(fx>=b[0]-pad&&fx<=b[2]+pad&&fy>=b[1]-pad&&fy<=b[3]+pad){ var a=Math.hypot((b[0]+b[2])/2-fx,(b[1]+b[3])/2-fy)/Math.max(1e-6,b[2]-b[0]); if(a<ba){ ba=a; best=k; } } }   /* 겹치면 그림 가운데가 가까운 쪽 */
    return best?best.split("#")[0].split("@")[0]:null; };
  // 누르기 — 묶음 화면의 대표 그림·배지·이름표. 끈 것(드래그)은 원래 처리에 맡긴다
  var dn=null; document.addEventListener("pointerdown",function(e){ dn={x:e.clientX,y:e.clientY}; },true);
  document.addEventListener("click",function(e){ if(!on()) return; var sel="#gul [data-g],#gul img[data-k]:not(.gm)", t=e.target.closest&&e.target.closest(sel+",#vback");
    if(!t&&document.elementsFromPoint&&(e.target.id==="map"||(e.target.closest&&e.target.closest("#mz")))){ var L=document.elementsFromPoint(e.clientX,e.clientY); for(var i=0;i<L.length;i++){ var q=L[i].closest&&L[i].closest(sel); if(q){ t=q; break; } } } if(!t) return;
    if(t.id==="vback"){ if(GU.g){ e.stopImmediatePropagation(); e.preventDefault(); exit(); } return; }
    if(dn&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>8) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if(t.dataset.g) enter(t.dataset.g); else if(t.dataset.k) hitClick(t.dataset.k); },true);
  if(typeof VIEW==="string"&&VIEW==="seoulall") load().then(apply).catch(function(){});
})();
