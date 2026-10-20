/* 서울 구(區) 묶음 (사장님 2026-10-20) — 서울 약도(seoulall)에서 구마다 대표 그림 1개 + 「+N」(대표를 뺀 나머지 명소 수)
   대표 그림·배지를 누르면 그 구 화면: 지도를 그 구 범위로 당기고 그 구 명소만 보인다(누르면 지금처럼 장소 카드·상영관은 앱 열기)
   돌아가기 = ← · 「✕」 · 뒤로가기 → 서울 묶음 화면. 바탕은 그림을 뺀 판(img/maps/seoulall_gu.jpg), 그림은 #gul 층(지도와 같이 움직임)
   자료는 tour_icons\navi_build\gu_build.py 가 만든다(data/gu_seoul.json · img/gu/*.webp). 빨간 네모 이름표(하위 약도 들어가기)는 그대로 */
(function(){
  var V=""; try{ V=((document.currentScript&&document.currentScript.src||"").match(/[?&]v=([0-9a-f]+)/)||[])[1]||""; }catch(e){}
  var GU=window.GU={d:null,g:null,p:null,key:null};
  var st=document.createElement("style");
  st.textContent="#gul{position:absolute;inset:0;pointer-events:none;z-index:2}#gul>*{position:absolute;pointer-events:auto;cursor:pointer;box-sizing:border-box}"+
    "#gul img{object-fit:contain;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35));-webkit-user-drag:none;user-select:none}"+
    "#gul .gb{background:#e8590c;color:#fff;font-weight:900;border:solid #fff;border-radius:999px;line-height:1;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center}"+
    "#map.gumode #lod .lp{display:none}#map.guin #lod{display:none!important}"+
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
  function draw(){ var m=document.getElementById("map"); if(!m) return; var L=document.getElementById("gul");
    if(!on()){ if(L) L.hidden=true; m.classList.remove("gumode"); m.classList.remove("guin"); if(GU.d) chip().hidden=true; GU.key=null; return; }
    m.classList.add("gumode"); m.classList.toggle("guin",!!GU.g); L=layer(); L.hidden=false; var w=m.clientWidth, as=ASP(), W=w*as, H=w, key=LANG+"|"+w+"|"+(GU.g||"");
    title(); if(GU.key===key) return; GU.key=key; L.innerHTML=""; var P=GU.d.P;
    if(!GU.g){   // 묶음: 구마다 대표 1개 + 배지 · 서울 밖(북한산·남한산성)은 그림 그대로
      var fs=Math.max(4,w*0.019);
      GU.d.gus.forEach(function(o){ var b=P[o.rep].b, x=b[0]*W, y=b[1]*H, bw=(b[2]-b[0])*W, bh=(b[3]-b[1])*H, e=img(o.rep); e.dataset.g=o.g; e.removeAttribute("data-k"); e.title=LP(o.n); put(e,x,y,bw,bh); L.appendChild(e);
        var n=o.keys.length-1; if(n>0){ var t=document.createElement("div"); t.className="gb"; t.dataset.g=o.g; t.textContent="+"+n; t.title=LP(o.n); t.style.fontSize=fs+"px"; t.style.height=(fs*1.55)+"px"; t.style.padding="0 "+(fs*0.45)+"px"; t.style.borderWidth=Math.max(0.5,fs*0.12)+"px";
          L.appendChild(t); var tw=t.offsetWidth||fs*2.4; t.style.left=(x+bw-tw*0.55)+"px"; t.style.top=(y-fs*0.6)+"px"; } });
      GU.d.out.forEach(function(k){ var b=P[k].b, e=img(k); put(e,b[0]*W,b[1]*H,(b[2]-b[0])*W,(b[3]-b[1])*H); L.appendChild(e); });
      return; }
    // 구 화면: 그 구 명소 전부 — 실제 자리(좌표)에서 가장 가까운 빈 칸에 하나씩(칸 = 그림 하나) — 서로 덮지 않는다
    var o=gObj(GU.g); if(!o) return; var s=ZM.s, hc=MH(), ks=o.keys, n=ks.length;
    var px=Math.max(40,Math.min(86,Math.sqrt(w*hc*0.30/n))), z=px/s, cs=z*1.06, used={}, bb=[1e9,1e9,-1e9,-1e9];
    var R=ks.map(function(k){ var q=P[k]; return {k:k,x:q.f[0]*W,y:q.f[1]*H,a:q.ar||1}; }).sort(function(a,b){ return a.y-b.y||a.x-b.x; });
    R.forEach(function(r){ var gx=Math.round(r.x/cs), gy=Math.round(r.y/cs), best=null, bd=1e18;
      for(var rad=0;rad<40&&!best;rad++){ for(var dx=-rad;dx<=rad;dx++) for(var dy=-rad;dy<=rad;dy++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==rad) continue; var cx=gx+dx, cy=gy+dy; if(used[cx+","+cy]) continue;
          var dd=Math.pow(cx*cs-r.x,2)+Math.pow(cy*cs-r.y,2); if(dd<bd){ bd=dd; best=[cx,cy]; } } }
      used[best[0]+","+best[1]]=1; var ww=r.a>=1?z:z*r.a, hh=r.a>=1?z/r.a:z, x=best[0]*cs, y=best[1]*cs, e=img(r.k); put(e,x-ww/2,y-hh/2,ww,hh); L.appendChild(e);
      bb=[Math.min(bb[0],x-cs/2),Math.min(bb[1],y-cs/2),Math.max(bb[2],x+cs/2),Math.max(bb[3],y+cs/2)]; });
    GU.bb=[bb[0]/W,bb[1]/H,bb[2]/W,bb[3]/H]; }
  function fit(o){ var m=document.getElementById("map"), w=m.clientWidth, h=MH(), as=ASP(), P=GU.d.P, x0=9,y0=9,x1=-9,y1=-9;
    o.keys.forEach(function(k){ var f=P[k].f; x0=Math.min(x0,f[0]); y0=Math.min(y0,f[1]); x1=Math.max(x1,f[0]); y1=Math.max(y1,f[1]); });
    var bw=Math.max(0.05,x1-x0), bh=Math.max(0.05,y1-y0), cx=(x0+x1)/2, cy=(y0+y1)/2;
    var s=Math.min(w*0.62/(bw*w*as),h*0.62/(bh*w)); s=Math.max(ZB(),Math.min(ZMAX(),s));
    ZM={s:s,tx:w/2-cx*w*as*s,ty:h/2-cy*w*s}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} }
  function enter(g){ var o=gObj(g); if(!o||!on()) return; try{ ntap("gu:"+g,"open_area"); }catch(e){} try{ inBlur(); }catch(e){} try{ resClear(); }catch(e){} GU.g=g; GU.key=null; fit(o); draw(); refit(); }
  function refit(){ var b=GU.bb; if(!b) return; var m=document.getElementById("map"), w=m.clientWidth, h=MH(), as=ASP(), bw=b[2]-b[0], bh=b[3]-b[1], cx=(b[0]+b[2])/2, cy=(b[1]+b[3])/2;
    var s=Math.min(ZM.s,w*0.94/(bw*w*as),h*0.86/(bh*w)); s=Math.max(ZMN(),s); ZM={s:s,tx:w/2-cx*w*as*s,ty:h/2-cy*w*s}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} }
  function exit(){ if(!GU.g) return false; GU.g=null; GU.key=null; var m=document.getElementById("map"), w=m.clientWidth, c=CITY[VIEW], s0=ZB(); ZM={s:s0,tx:w/2-((c&&c.fx)||0.5)*w*((c&&c.aspect)||1)*s0,ty:0}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} draw(); return true; }
  window.guEnter=enter; window.guBack=function(){ return on()&&exit(); };
  function kidsLoad(){ (GU.d.kids||[]).forEach(function(id){ try{ mapLoad(id).catch(function(){}); }catch(e){} }); }
  function apply(){ if(!on()){ draw(); return; } var im=document.getElementById("mapimg"); if(im.getAttribute("src")!==GU.d.img) im.src=GU.d.img; kidsLoad(); draw(); }
  var _vs=window.viewSet; window.viewSet=function(v){ GU.g=null; GU.key=null; var r=_vs.apply(this,arguments); if(CITY[v]&&v==="seoulall") load().then(apply).catch(function(){}); else draw(); return r; };
  var _ds=window.detSet; window.detSet=function(){ var r=_ds.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _ld=window.lodDraw; window.lodDraw=function(){ var r=_ld.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _ha=window.hitAt; window.hitAt=function(cx,cy){ var r=_ha.apply(this,arguments); if(r&&on()&&GU.d.P[r]) return null; return r; };   // 바탕에서 뺀 그림 자리는 안 눌린다(그림은 #gul 이 받는다)
  // 누르기 — 끈 것(드래그)은 원래 처리에 맡긴다
  var dn=null; document.addEventListener("pointerdown",function(e){ dn={x:e.clientX,y:e.clientY}; },true);
  document.addEventListener("click",function(e){ if(!on()) return; var t=e.target.closest&&e.target.closest("#gul [data-g],#gul [data-k],#vback"); if(!t&&document.elementsFromPoint&&(e.target.id==="map"||(e.target.closest&&e.target.closest("#mz")))){ var L=document.elementsFromPoint(e.clientX,e.clientY); for(var i=0;i<L.length;i++){ if(L[i].closest&&L[i].closest("#gul [data-g],#gul [data-k]")){ t=L[i].closest("#gul [data-g],#gul [data-k]"); break; } } } if(!t) return;
    if(t.id==="vback"){ if(GU.g){ e.stopImmediatePropagation(); e.preventDefault(); exit(); } return; }
    if(dn&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>8) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if(t.dataset.g) enter(t.dataset.g); else if(t.dataset.k) hitClick(t.dataset.k); },true);
  if(typeof VIEW==="string"&&VIEW==="seoulall") load().then(apply).catch(function(){});
})();
