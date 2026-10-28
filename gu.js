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
    "#gul .gn{background:#808080;color:#fff;font-weight:900;line-height:1;display:flex;align-items:center;white-space:nowrap;border:0;box-shadow:0 0 2px rgba(0,0,0,.35)}"+   /* 전국 지도 「서울」「경기」 이름표와 같은 모양 (10-20) */
    "@keyframes bbBlink{0%,100%{opacity:1;filter:brightness(1.15)}45%{opacity:.78;filter:brightness(.9)}50%{opacity:.62}55%{opacity:.85}}#gul .gbb{pointer-events:none!important}"+
    "#map.gumode #lod{display:none!important}#map.gumode #dl{z-index:3}#map.gumode #dlb{z-index:5}"+   /* 거리선·거리 글자는 구 화면 조각·흐림 위로 (10-20) */
    "#gul .glb{pointer-events:none;transform-origin:0 0;background:rgba(20,24,32,.88);color:#fff;font:800 12px/1.2 system-ui,sans-serif;padding:3px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.35)}"+
    "#guX{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#808080!important;color:#fff!important;white-space:nowrap;z-index:30;border:0;border-radius:999px;background:rgba(20,24,32,.88);color:#fff;font-weight:900;font-size:15px;padding:7px 14px;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer}#guX[hidden]{display:none}";
  document.head.appendChild(st);
  function load(){ if(GU.p) return GU.p; return GU.p=fetch("data/gu_seoul.json?v="+V).then(function(r){ if(!r.ok) throw new Error("gu "+r.status); return r.json(); }).then(function(d){ GU.d=d; return d; },function(e){ GU.p=null; throw e; }); }
  function on(){ return !!(GU.d&&typeof VIEW==="string"&&VIEW===GU.d.map&&!window.DET); }
  function gObj(g){ var L=GU.d.gus; for(var i=0;i<L.length;i++) if(L[i].g===g) return L[i]; return null; }
  function layer(){ var L=document.getElementById("gul"); if(!L){ L=document.createElement("div"); L.id="gul"; document.getElementById("mz").appendChild(L); } return L; }
  function chip(){ var b=document.getElementById("guX"); if(!b){ b=document.createElement("button"); b.type="button"; b.id="guX"; b.hidden=true; document.getElementById("map").appendChild(b);
      b.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); exit(); }); } return b; }
  function title(){ var tt=document.getElementById("vttl"), c=CITY[GU.d.map], o=GU.g&&gObj(GU.g); if(tt&&c) tt.textContent=LN(c)+(o?" · "+LP(o.n):""); var b=chip(); b.hidden=!o||!on(); if(o){ b.textContent=LP(o.n)+"  ✕"; chipFit(b); } }
  // 구 칩 자리 (사장님 10-20) — 회색 바탕·흰 글자. 「◎ 현재 위치」 등 지도 위 단추와 띄워서, 남는 칸 가운데. 모자라면 글자를 줄이고, 그래도 안 되면 한 줄 아래
  function chipFit(b){ var m=document.getElementById("map"); if(!m||b.hidden) return; var W=m.clientWidth, key=b.textContent+"|"+W+"|"+MH(); if(b._fk===key) return; b._fk=key;
    var mr=m.getBoundingClientRect(), obs=[];
    [].forEach.call(document.querySelectorAll("#map *, body > *"),function(e){ if(e===b||e.id==="ctX"||e.closest("#mz")||b.contains(e)) return; var cs=getComputedStyle(e); if(cs.position!=="absolute"&&cs.position!=="fixed") return; if(cs.display==="none"||cs.visibility==="hidden"||e.hidden) return;
      var r=e.getBoundingClientRect(); if(r.width<10||r.height<10||r.width>W*0.8||r.height>160) return; var q=[r.left-mr.left,r.top-mr.top,r.right-mr.left,r.bottom-mr.top]; if(q[3]<0||q[1]>130||q[2]<0||q[0]>W) return; obs.push(q); });
    b.style.transform="none"; var G=8, put=function(top,fs){ b.style.fontSize=fs+"px"; var bw=b.offsetWidth, bh=b.offsetHeight, L=G, R=W-G;
      obs.forEach(function(q){ if(q[1]<top+bh+4&&q[3]>top-4){ if((q[0]+q[2])/2<W/2) L=Math.max(L,q[2]+G); else R=Math.min(R,q[0]-G); } });
      if(R-L<bw) return false; b.style.left=Math.max(L,Math.min(R-bw,W/2-bw/2))+"px"; b.style.top=top+"px"; return true; };
    for(var fs=15;fs>=12;fs--) if(put(10,fs)) return;
    var low=10; obs.forEach(function(q){ if(q[1]<60) low=Math.max(low,q[3]+6); }); for(var f2=15;f2>=11;f2--) if(put(low,f2)) return; b.style.left=G+"px"; b.style.top=low+"px"; }
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
  // 거리선 굵기·끝 동그라미 — 구 화면은 배율이 25~30배라 그대로 두면 동그라미·선이 화면을 덮는다(10-20 「깨진다」). 서울 묶음·다른 약도는 원래 크기
  function dlFix(){ var s=document.getElementById("dl"); if(!s||!s.firstChild) return; var k=(on()&&ZM.s>4)?4/ZM.s:1;
    [].forEach.call(s.querySelectorAll("circle"),function(c){ c.setAttribute("r",String(9*k)); });
    [].forEach.call(s.querySelectorAll("line"),function(l){ l.style.strokeWidth=(2*Math.max(k,0.5/Math.max(1,ZM.s/4)))+"px"; l.setAttribute("stroke-dasharray",(6*k)+" "+(5*k)); }); }
  function draw(){ try{ dlFix(); }catch(e){} var m=document.getElementById("map"); if(!m) return; var L=document.getElementById("gul");
    if(!on()){ if(L) L.hidden=true; m.classList.remove("gumode"); if(GU.d) chip().hidden=true; GU.key=null; return; }
    m.classList.add("gumode"); L=layer(); L.hidden=false; var w=m.clientWidth, as=ASP(), W=w*as, H=w, key=LANG+"|"+w+"|"+(GU.g||"");
    title(); if(GU.key===key){ if(GU.g){ try{ chunks(); }catch(e){} var sw=String(3/ZM.s); [].forEach.call(L.querySelectorAll("path.gs"),function(p){ p.setAttribute("stroke-width",sw); }); try{ cabLines(); labScale(); }catch(e){} } return; }
    GU.key=key; L.innerHTML=""; var P=GU.d.P;
    if(!GU.g){   // 묶음: 구마다 대표 1개 + 배지 · 명소 없는 구는 이름표 · 서울 밖(북한산·남한산성)은 그림 그대로
      var fs=Math.max(4,w*0.019), labs=[];
      GU.d.gus.forEach(function(o){
        if(!o.rep){ labs.push(o); return; }
        var b=P[o.rep].b, x=b[0]*W, y=b[1]*H, bw=(b[2]-b[0])*W, bh=(b[3]-b[1])*H, e=img(o.rep); e.dataset.g=o.g; e.removeAttribute("data-k"); e.title=LP(o.n); put(e,x,y,bw,bh); L.appendChild(e);
        var n=o.keys.length-1; if(n>0){ var t=document.createElement("div"); t.className="gb"; t.dataset.g=o.g; t.textContent="+"+n; t.title=LP(o.n); t.style.fontSize=fs+"px"; t.style.height=(fs*1.55)+"px"; t.style.padding="0 "+(fs*0.45)+"px"; t.style.borderWidth=Math.max(0.5,fs*0.12)+"px";
          L.appendChild(t); var tw=t.offsetWidth||fs*2.4; t.style.left=(x+bw-tw*0.55)+"px"; t.style.top=(y-fs*0.6)+"px"; } });
      GU.d.out.forEach(function(k){ var b=P[k].b, e=img(k); put(e,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); L.appendChild(e); });
      fxPlace(L,W,H); gnPlace(L,labs,w,W,H);
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
    (o.ln||[]).forEach(function(i){ var l=(GU.d.ln||[])[i]; if(!l) return; var cs=document.createElementNS(NS,"svg"); cs.setAttribute("viewBox","0 0 1 1"); cs.setAttribute("preserveAspectRatio","none"); cs.setAttribute("class","gv gcab"); cs.dataset.ln=i;   /* 케이블카 줄 두 가닥 (10-20) */
      [0,1].forEach(function(j){ var e=document.createElementNS(NS,"path"); e.setAttribute("fill","none"); e.setAttribute("stroke","#3a3f47"); e.setAttribute("stroke-width","1.6"); e.setAttribute("vector-effect","non-scaling-stroke"); e.setAttribute("stroke-linecap","round"); e.dataset.j=j; cs.appendChild(e); }); L.appendChild(cs); });
    cabLines();
    var ic=o.ic||{}, ho=o.ho||[]; for(var k in ic){ var b=ic[k], q=P[k]; if(!q||ho.indexOf(k)>=0) continue;   /* ho = 궁 전체 그림 안에 이미 그려진 명소 — 누름 자리만 */ var e=img(k); e.className="gm"; put(e,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); if(+b[4]) e.style.transform="rotate("+(+b[4])+"deg)"; /* 5번째 값 = 배치기에서 돌린 각도(°) */ L.appendChild(e); if(q.bd&&!+b[4]) bbOn(L,k,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); }
    var LB=GU.d.lab||{}; for(var k2 in LB){ var b2=ic[k2]; if(!b2) continue; var t2=document.createElement("div"); t2.className="glb"; t2.dataset.k=k2; t2.textContent=LP(LB[k2]); t2.style.left=((b2[0]+b2[2])/2*W)+"px"; t2.style.top=(b2[3]*H)+"px"; L.appendChild(t2); }   /* 이름표 (시티투어버스 출발점) — 화면 크기 고정 */
    labScale(); }
  // 케이블카 줄 — 화면에서 두 가닥 사이 3px 가 되게 배율마다 다시 (10-20)
  function cabLines(){ var L=document.getElementById("gul"); if(!L) return; var m=document.getElementById("map"), w=m.clientWidth, as=ASP(), off=1.6/(ZM.s*w);
    [].forEach.call(L.querySelectorAll("svg.gcab"),function(cs){ var l=GU.d.ln[+cs.dataset.ln], p=l.p; [].forEach.call(cs.querySelectorAll("path"),function(e){ var sg=e.dataset.j==="0"?-1:1, d=""; e.setAttribute("stroke-width",String(1.6/ZM.s));   /* 경계선처럼 화면 1.6px */
      for(var i=0;i<p.length;i++){ var a=p[Math.max(0,i-1)], b=p[Math.min(p.length-1,i+1)], dx=(b[0]-a[0])*as, dy=b[1]-a[1], n=Math.hypot(dx,dy)||1, nx=-dy/n, ny=dx/n;
        d+=(i?"L":"M")+(p[i][0]+sg*off*nx/as)+" "+(p[i][1]+sg*off*ny); } e.setAttribute("d",d); }); }); }
  function labScale(){ var L=document.getElementById("gul"); if(!L) return; var sc=1/ZM.s; [].forEach.call(L.querySelectorAll(".glb"),function(t){ t.style.transform=t.dataset.tx?"scale("+(sc*(+t.dataset.sc||1))+") translate("+t.dataset.tx+",2px)":"scale("+sc+") translate(-50%,3px)"; }); }
  // 입점 문의 빌딩 광고판 글자 (index.html bbDraw 와 같은 모양) — 아이콘 상자 안 비율 P[k].bd 자리에 (10-20 되살림)
  function bbOn(L,k,x,y,bw,bh){ var q=GU.d.P[k], b=q&&q.bd; if(!b) return; var e=document.createElement("div"), en=LANG==="en"; e.className="gbb"; e.innerHTML=k==="adinq"?(en?"Advertise<br>here":LANG==="ko"?"입점 문의":esc(TE("Advertise here (sign)"))):"";
    var S=60, w=(b[2]-b[0])*bw*S, h=b[4]*bh*S, ang=Math.atan2((b[3]-b[1])*bh*S,w)*180/Math.PI;   /* 지도 단위로는 글자가 1px 도 안 돼 안 그려진다 → 60배로 쓰고 1/60 로 줄인다 */
    e.style.cssText="position:absolute;left:"+(x+b[0]*bw)+"px;top:"+(y+b[1]*bh)+"px;width:"+w+"px;height:"+h+"px;transform-origin:0 0;transform:scale("+(1/S)+") skewY("+ang+"deg);display:flex;align-items:center;justify-content:center;"
      +"pointer-events:none;white-space:nowrap;overflow:hidden;text-align:center;line-height:1.02;font-weight:900;color:#ffd84a;letter-spacing:.03em;background:none;border:0;box-shadow:none;"
      +"text-shadow:0 0 "+(h*0.05)+"px #fff3b0,0 0 "+(h*0.14)+"px #ffa200,0 0 "+(h*0.3)+"px rgba(255,120,0,.75);"
      +"font-size:"+(en?Math.min(h*0.43,w/5.3):Math.min(h*0.66,w/4.4))+"px;animation:bbBlink 2.6s ease-in-out infinite";
    L.appendChild(e); }
  // 묶음 화면 — 통계청·입점 문의 빌딩(명소 아님)을 실제 자리 가까이, 대표 그림·「+N」과 안 겹치게 (10-20 되살림)
  function fxPlace(L,W,H){ var occ=[]; [].forEach.call(L.children,function(e){ var x=parseFloat(e.style.left), y=parseFloat(e.style.top); if(isNaN(x)) return; occ.push([x,y,x+e.offsetWidth,y+e.offsetHeight]); });
    (GU.d.fx||[]).forEach(function(k){ var q=GU.d.P[k]; if(!q) return;
      if(k==="adinq"){ var ib=null; GU.d.gus.forEach(function(o){ if(!ib&&o.ic&&o.ic[k]) ib=o.ic[k]; });   /* 입점 문의 빌딩 = 배치기(서울 전체)에서 놓은 자리·크기 그대로 (사장님 10-21) */
        if(ib){ var e0=img(k), x=ib[0]*W, y=ib[1]*H, w0=(ib[2]-ib[0])*W, h0=(ib[3]-ib[1])*H; put(e0,x,y,w0,h0); if(+ib[4]) e0.style.transform="rotate("+(+ib[4])+"deg)"; L.appendChild(e0); occ.push([x,y,x+w0,y+h0]); if(!+ib[4]) bbOn(L,k,x,y,w0,h0); return; } }
      var bw=W*0.018, bh=bw/q.ar; if(bh>W*0.03){ bh=W*0.03; bw=bh*q.ar; } var cx=q.f[0]*W, cy=q.f[1]*H, g=W*0.002, best=null, bd=1e18, st=W*0.002;
      for(var dy=-W*0.06;dy<=W*0.06;dy+=st) for(var dx=-W*0.06;dx<=W*0.06;dx+=st){ var d=dx*dx+dy*dy; if(d>=bd) continue; var x0=cx+dx-bw/2, y0=cy+dy-bh/2, ok=true;
        for(var i=0;i<occ.length;i++){ var o=occ[i]; if(x0-g<o[2]&&x0+bw+g>o[0]&&y0-g<o[3]&&y0+bh+g>o[1]){ ok=false; break; } } if(ok){ bd=d; best=[x0,y0]; } }
      if(!best) best=[cx-bw/2,cy-bh/2]; var e=img(k); put(e,best[0],best[1],bw,bh); L.appendChild(e); occ.push([best[0],best[1],best[0]+bw,best[1]+bh]); bbOn(L,k,best[0],best[1],bw,bh); });
    // 관악산 북쪽 기슭에 노래방·PC방 (사장님 10-28 「나」 — 구 화면 건물은 그대로 두고 서울 전체 지도에 하나씩 더) · 누르면 관악구 노래방·PC방과 같은 화면
    [["karaoke@gwanak",37.4668,126.9425],["pcbang@gwanak",37.4668,126.9555]].forEach(function(m){ var k=m[0], q=GU.d.P[k], f=null; try{ f=meGeoFrac("seoulall",m[1],m[2]); }catch(x){} if(!q||!f) return; f=[f[0]+0.16+(k==="pcbang@gwanak"?0.06:0),f[1]];   /* 사장님 10-28 「오른쪽으로 5센티」→「2센티만 왼쪽」(PC 화면 지도 폭 기준, 5cm=0.27) */
      var bh=W*0.06, bw=bh*(q.ar||1), cx=f[0]*W, cy=f[1]*H, g=W*0.002, best=null, bd=1e18, st=W*0.002;
      for(var dy=-W*0.04;dy<=W*0.04;dy+=st) for(var dx=-W*0.04;dx<=W*0.04;dx+=st){ var d=dx*dx+dy*dy; if(d>=bd) continue; var x0=cx+dx-bw/2, y0=cy+dy-bh, ok=true;
        for(var i=0;i<occ.length;i++){ var o=occ[i]; if(x0-g<o[2]&&x0+bw+g>o[0]&&y0-g<o[3]&&y0+bh+g>o[1]){ ok=false; break; } } if(ok){ bd=d; best=[x0,y0]; } }
      if(!best) best=[cx-bw/2,cy-bh]; var e=img(k); e.dataset.k=(GU.d.act&&GU.d.act[k])||k; put(e,best[0],best[1],bw,bh); L.appendChild(e); occ.push([best[0],best[1],best[0]+bw,best[1]+bh]);
      var lb={"karaoke@gwanak":["노래방","Karaoke","カラオケ","KTV","KTV","Karaoke"],"pcbang@gwanak":["PC방","PC Bang","PC房","网吧","網咖","PC Bang"]}[k];   /* 사장님 10-28 「간단하게, 설명 달지 마」 — 괄호 설명 없이 */ if(lb){ var t=document.createElement("div"); t.className="glb"; t.textContent=LP(lb); var kr=k==="karaoke@gwanak"; t.dataset.tx=kr?"-100%":"0"; t.dataset.sc="0.85"; t.style.left=(kr?best[0]+bw:best[0])+"px"; t.style.top=(best[1]+bh)+"px"; t.style.transform="scale("+(0.85/ZM.s)+") translate("+t.dataset.tx+",2px)"; L.appendChild(t); }   /* 두 명찰이 서로 반대쪽으로 펼쳐져 안 겹치게 (10-28 폰 영어 화면 겹침) */ }); }   /* 명찰 (사장님 10-28) — 구 화면과 같은 「노래방」「PC방」 6개 언어 */
  // 묶음 화면 구 이름표 자리 (사장님 10-20) — 전국 지도 이름표 크기. 대표 그림·「+N」·다른 이름표·「나」와 띄워서, 구 한가운데에서 가장 가까운 빈 자리.
  //   빈 자리가 없으면 글자를 조금씩 줄여 다시(긴 영어·일본어·중국어 이름)
  function meBox(){   // 「나」 그림 자리(지도 단위) — 화면 크기 고정 그림이라 묶음 처음 배율(ZB) 기준으로 잡는다(확대해도 이름표가 안 흔들리게)
    if(!window.ME||!ME.pos) return null; var f=meGeoFrac(VIEW,ME.pos[0],ME.pos[1]); if(!f||f[0]<0||f[0]>1||f[1]<0||f[1]>1) return null;
    var m=document.getElementById("map"), w=m.clientWidth, as=ASP(), sr=ZB(), im=document.querySelector("#me img"), r=(im&&im.naturalWidth)?im.naturalHeight/im.naturalWidth:1.72, iw=w*(window.ME_W||0.06)/sr, ih=iw*r, x=f[0]*w*as, y=f[1]*w;
    return [x-iw/2,y-ih,x+iw/2,y+10/sr]; }
  function inPoly(x,y,P){ for(var k=0;k<P.length;k++){ var r=P[k], c=false; for(var i=0,j=r.length-1;i<r.length;j=i++){ var a=r[i], b=r[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } if(c) return true; } return false; }
  function gnPlace(L,labs,w,W,H){ var occ=[], me=meBox(); GU.meK=me?me.map(Math.round).join(","):"";
    [].forEach.call(L.children,function(e){ var x=parseFloat(e.style.left), y=parseFloat(e.style.top); if(isNaN(x)) return; occ.push([x,y,x+e.offsetWidth,y+e.offsetHeight]); });
    if(me) occ.push(me);
    var f0=Math.max(3,w*0.0118);
    labs.forEach(function(o){ var e=document.createElement("div"); e.className="gn"; e.dataset.g=o.g; e.textContent=LP(o.n); e.style.visibility="hidden"; L.appendChild(e);
      var cx=o.c[0]*W, cy=o.c[1]*H, done=null;
      for(var t=0;t<8&&!done;t++){ var fs=f0*Math.pow(0.87,t>>1), g=fs*0.5, inside=!(t&1);   /* 같은 크기로 구 안 → 구 밖 조금(넓게) → 그래도 없으면 글자 줄임 */ e.style.fontSize=fs+"px"; e.style.height=(fs*2)+"px"; e.style.padding="0 "+(fs*0.7)+"px"; e.style.borderRadius=(fs*0.6)+"px";
        var tw=e.offsetWidth, th=e.offsetHeight, R=W*(inside?0.05:0.08), st=fs*0.5, best=null, bd=1e18;
        for(var dy=-R;dy<=R;dy+=st) for(var dx=-R;dx<=R;dx+=st){ var d=dx*dx+dy*dy*1.5; if(d>=bd) continue; var x0=cx+dx-tw/2, y0=cy+dy-th/2;
          if(inside&&!inPoly((x0+tw/2)/W,(y0+th/2)/H,o.poly||[])) continue;
          var ok=true; for(var i=0;i<occ.length;i++){ var q=occ[i]; if(x0-g<q[2]&&x0+tw+g>q[0]&&y0-g<q[3]&&y0+th+g>q[1]){ ok=false; break; } } if(ok){ bd=d; best=[x0,y0,tw,th]; } }
        if(best) done=best; }
      if(!done){ var tw2=e.offsetWidth, th2=e.offsetHeight; done=[cx-tw2/2,cy-th2/2,tw2,th2]; }
      e.style.left=done[0]+"px"; e.style.top=done[1]+"px"; e.style.visibility=""; occ.push([done[0],done[1],done[0]+done[2],done[1]+done[3]]);
      var n=(o.keys||[]).length; if(n>0){ var fb=Math.max(4,w*0.019), t=document.createElement("div"); t.className="gb"; t.dataset.g=o.g; t.textContent="+"+n; t.title=LP(o.n);   /* 대표 그림 없는 구도 그림 수 배지 (사장님 10-26) */
        t.style.fontSize=fb+"px"; t.style.height=(fb*1.55)+"px"; t.style.padding="0 "+(fb*0.45)+"px"; t.style.borderWidth=Math.max(0.5,fb*0.12)+"px"; L.appendChild(t);
        var bw2=t.offsetWidth||fb*2.4; t.style.left=(done[0]+done[2]-bw2*0.2)+"px"; t.style.top=(done[1]-fb*1.35)+"px"; t.style.zIndex="3"; occ.push([done[0]+done[2]-bw2*0.2,done[1]-fb*1.35,done[0]+done[2]+bw2*0.8,done[1]+fb*0.2]); } }); }
  // 「나」 누르기로 내 자리 가기 (10-20) — 서울이면 내가 있는 구 화면으로 들어가 나를 가운데
  function underSeoul(v){ var x=v, d=0; while(x&&CITY[x]&&d<20){ if(x==="seoulall") return true; x=CITY[x].parent; d++; } return false; }
  var _mg=window.meGo; if(_mg) window.meGo=function(){ var r=_mg.apply(this,arguments); try{ if(r&&window.ME&&ME.pos&&VIEW!=="seoulall"&&underSeoul(VIEW)){ viewSet("seoulall"); load().then(function(){ apply(); window.meGo2(); }).catch(function(){}); return r; } }catch(e){} window.meGo2(); return r; };   /* 서울 안 옛 하위 약도(명동 등) 대신 구 화면으로 */
  window.meGo2=function(){ try{ if(GU.d&&on()&&window.ME&&ME.pos){ var f=meGeoFrac(VIEW,ME.pos[0],ME.pos[1]); if(f){ var g=null; GU.d.gus.forEach(function(o){ if(!g&&inPoly(f[0],f[1],o.poly||[])) g=o.g; });
      if(g){ if(GU.g!==g) enter(g); var m=document.getElementById("map"), w=m.clientWidth, as=ASP(), s=ZM.s; ZM={s:s,tx:w/2-f[0]*w*as*s,ty:MH()/2-f[1]*w*s}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} meDraw(); if(ME.sel) try{ meSelCard(); }catch(e){} } } } }catch(e){} };
  // 옛 도심 약도 4개(광화문·인사동·경복궁·명동)로 가는 이동은 서울 지도 → 그 좌표가 든 구 화면으로 (사장님 10-25)
  //   공연관람 고르기·검색·☆·추천 등 spinGo 를 쓰는 모든 길. 다른 약도(홍대·용산·성수·올림픽공원 등)는 그대로. 카드는 구 화면에 들어간 뒤 다시 띄운다
  var OLD4={seoul:1,insadong:1,gyeongbok:1,myeongdong:1};
  var _sg=window.spinGo; if(_sg) window.spinGo=function(id,lat,lng,sc){ if(!(OLD4[id]||id==="seoulall")||lat==null||lng==null||window.DET) return _sg.apply(this,arguments);
    var run=function(re){ try{ if(VIEW!=="seoulall") viewSet("seoulall"); if(!on()) return false; var f=meGeoFrac("seoulall",+lat,+lng); if(!f) return false;
        var g=null; GU.d.gus.forEach(function(o){ if(!g&&inPoly(f[0],f[1],o.poly||[])) g=o.g; }); if(!g) return false;
        var k=window._cardK, sp=document.getElementById("spin"), spP=sp&&sp.parentNode, pin=window.PLACES&&PLACES.__pin; enter(g); if(sp&&spP&&!sp.isConnected){ spP.appendChild(sp); if(pin) PLACES.__pin=pin; }   /* 구에 들어가도 빨간 핀은 그대로 (10-26) */ var m=document.getElementById("map"), w=m.clientWidth, as=ASP(), z=ZM.s; ZM={s:z,tx:w/2-f[0]*w*as*z,ty:MH()/2-f[1]*w*z}; zApply(); try{ LOD.s0=ZM.s; }catch(e){}
        pinFit();
        if(re&&k){ if(k==="__pin"){ try{ window.spinCard(); }catch(e){} } else { try{ placeShow(k); }catch(e){} } } return true; }catch(e){ return false; } };
    if(GU.d){ if(!run(false)) _sg(id,lat,lng,sc); return; }   // 자료가 있으면 바로 — 부른 쪽이 곧이어 카드를 띄운다
    viewSet("seoulall"); load().then(function(){ if(!run(true)) _sg(id,lat,lng,sc); },function(){ _sg(id,lat,lng,sc); }); };
  // 구 화면의 빨간 핀 크기 — 핀은 서울 전체 지도 배율에 맞춰 만들어지니, 구 화면 배율만큼 줄인다 (핀 끝 = 정확한 자리, 10-26)
  function pinFit(){ try{ var e=document.getElementById("spin"); if(!e||!on()||!GU.g) return; var s0=(ASP()>1?1.5:2)*ZB(), k=Math.min(1,s0/ZM.s); e.style.transformOrigin="50% 100%"; e.style.transform="translate(-50%,-100%) scale("+k+")"; }catch(x){} }
  window.guPinFit=pinFit;
  var _ss0=window.spinShow0; if(_ss0) window.spinShow0=function(){ var r=_ss0.apply(this,arguments); pinFit(); return r; };
  // 「나」가 움직이면 묶음 이름표 자리를 다시 (나와 겹치지 않게)
  var _md=window.meDraw; if(_md) window.meDraw=function(){ var r=_md.apply(this,arguments); try{ if(on()&&!GU.g&&GU.d&&GU.key){ var me=meBox(), k=me?me.map(Math.round).join(","):""; if(k!==(GU.meK||"")){ GU.key=null; draw(); } } }catch(e){} return r; };
  // 들어갈 때 배율 — 대표 명소가 있는 하위 약도를 그 약도 화면과 같은 크기로(없으면 구 약도를 「광화문 일대」 약도와 같은 크기로), 대표를 가운데
  // 들어갈 때 — 대표 명소(없으면 구 한가운데)를 가운데, 전역 약도 1 px ≈ 화면 0.3 px (하위 약도 화면과 같은 크기)
  function enter(g){ var o=gObj(g); if(!o||!on()) return; try{ ntap("gu:"+g,"open_area"); }catch(e){} try{ inBlur(); }catch(e){} try{ resClear(); }catch(e){}
    GU.g=g; GU.key=null; GU.pb=pbOf(o); var ch=GU.d.ch; GU.l0={}; GU.l1={}; (ch.l0||[]).forEach(function(c){ GU.l0[c[0]+"_"+c[1]]=1; }); (ch.l1||[]).forEach(function(c){ GU.l1[c[0]+"_"+c[1]]=1; });
    var m=document.getElementById("map"), w=m.clientWidth, h=MH(), as=ASP(), b=o.rep&&o.ic&&o.ic[o.rep], s=0.3*ch.G2/w, cx=b?(b[0]+b[2])/2:o.c[0], cy=b?(b[1]+b[3])/2:o.c[1];
    GU.zmax=s*4; ZM={s:s,tx:w/2-cx*w*as*s,ty:h/2-cy*w*s}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} draw(); }
  function exit(){ if(!GU.g) return false; GU.g=null; GU.key=null; GU.zmax=0; var m=document.getElementById("map"), w=m.clientWidth, c=CITY[VIEW], s0=ZB(); ZM={s:s0,tx:w/2-((c&&c.fx)||0.5)*w*((c&&c.aspect)||1)*s0,ty:0}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} draw(); return true; }
  window.guEnter=enter; window.guBack=function(){ return on()&&exit(); };
  // 나 ↔ 장소 거리선 (10-20 사장님 「버벅거리며 깨진다」) — 둘 중 하나라도 이 구 화면(경계 상자) 밖이면 구 화면을 나와 서울 한 장 그림에서 긋는다.
  //   구 화면에서 멀리 줄이면 구 밖은 흐림·조각 수십 장을 새로 받아 느리고 깨져 보였다. 둘 다 구 안이면 구 화면 그대로
  var _ml=window.meLineTo; if(_ml) window.meLineTo=function(k){ try{ if(on()&&GU.g&&window.ME&&ME.pos&&PLACES[k]){ var p=PLACES[k], b=GU.pb||[0,0,1,1], m=0.002,
        a1=meGeoFrac(VIEW,ME.pos[0],ME.pos[1]), a2=meGeoFrac(VIEW,+p.lat,+p.lng), inb=function(f){ return f&&f[0]>=b[0]-m&&f[0]<=b[2]+m&&f[1]>=b[1]-m&&f[1]<=b[3]+m; };
      if(!(inb(a1)&&inb(a2))) exit(); } }catch(e){} return _ml.apply(this,arguments); };
  function kidsLoad(){ (GU.d.kids||[]).forEach(function(id){ try{ mapLoad(id).catch(function(){}); }catch(e){} }); }
  function apply(){ if(!on()){ draw(); return; } var im=document.getElementById("mapimg"); if(im.getAttribute("src")!==GU.d.img) im.src=GU.d.img; kidsLoad(); draw(); }
  var _vs=window.viewSet; window.viewSet=function(v){ GU.g=null; GU.key=null; GU.zmax=0; var r=_vs.apply(this,arguments); if(CITY[v]&&v==="seoulall") load().then(apply).catch(function(){}); else draw(); return r; };
  var _ds=window.detSet; window.detSet=function(){ var r=_ds.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _ld=window.lodDraw; window.lodDraw=function(){ var r=_ld.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _zm=window.ZMAX; window.ZMAX=function(){ var r=_zm.apply(this,arguments); return (GU.g&&on())?Math.max(r,GU.zmax||0):r; };   // 구 화면은 하위 약도 크기까지 당길 수 있게
  var _at=window.areaTap; window.areaTap=function(){ if(on()) return 0; return _at.apply(this,arguments); };   // 묶음·구 화면엔 빨간 네모·명찰이 없다
  var _ha=window.hitAt; window.hitAt=function(cx,cy){ var r=_ha.apply(this,arguments); if(!on()) return r; if(r==="__me"||r==="__pin") return r;
    if(!GU.g){ try{ var ef=document.elementsFromPoint(cx,cy); for(var j=0;j<ef.length;j++){ if(ef[j].matches&&ef[j].matches('#gul img[data-k="mpstat"]')) return "mpstat"; } }catch(e){} return (r&&GU.d.P[r])?null:r; }   /* 통계청 길게 누르기 = 관리자 입구 */   // 묶음: 바탕에서 뺀 그림 자리는 안 눌린다(그림은 #gul 이 받는다)
    var im=document.getElementById("mapimg").getBoundingClientRect(), fx=(cx-im.left)/im.width, fy=(cy-im.top)/im.height, H=hits(), best=null, ba=1e9, pad=0.0004;
    for(var k in H){ var b=H[k]; if(fx>=b[0]-pad&&fx<=b[2]+pad&&fy>=b[1]-pad&&fy<=b[3]+pad){ var a=Math.hypot((b[0]+b[2])/2-fx,(b[1]+b[3])/2-fy)/Math.max(1e-6,b[2]-b[0]); if(a<ba){ ba=a; best=k; } } }   /* 겹치면 그림 가운데가 가까운 쪽 */
    if(best&&GU.d.act&&GU.d.act[best]) return GU.d.act[best];   /* 시티투어버스 출발점 → 매표소 카드 */
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
