/* 🧩 전국 지도 퍼즐 조각 (사장님 2026-11-06 가안 「퍼즐 조각처럼」)
 *  전국 지도에서 지역(이름표, 또는 그 지역 대표 그림 두 번)을 누르면 — 그 지역 모양대로 지금 지도 그림을 오려 낸 조각이
 *  그림자와 함께 툭 떠오르고 살짝 커졌다가(0.6초) 지금과 똑같이 그 지역 약도로 넘어간다.
 *   · 전국 지도 그림·배치·이름표·아이콘·누름 칸은 안 건드린다. 조각은 #mz 위에 잠깐 얹는 캔버스 — 새 그림 없음(지도 그림을 경계로 오려 씀)
 *   · 경계 = data/krpop.json (시도: Natural Earth / 경주시: geoBoundaries · 해안선은 지도 그림 그대로 · 전국 지도 투영 kr.geo 로 맞춤)
 *   · index.html 은 안 고친다 — 전역 viewSet·ctGo·hitClick 을 바깥에서 감싼다(이름표·그림 누름일 때만 연출)
 *   · 동작 줄이기(prefers-reduced-motion)·지도가 화면 밖·자료 못 받음·지도 그림 판이 다름 → 연출 없이 지금처럼 바로 넘어간다
 *   · 연출 중 또 누르면 = 바로 넘어감 · 뒤로가기 = 연출 취소(전국 지도 그대로, 종료 안내 안 뜸) · 다른 곳에서 viewSet = 연출 접고 그대로
 *   · 가볍게: transform·opacity 만 움직이고, 조각 캔버스는 지역마다 한 번 만들어 다시 씀(최근 3개만 보관) · 연출 중엔 다른 받기·계산을 안 붙인다(약도 그림은 지금처럼 넘어갈 때 받음)
 */
(function(){
  "use strict";
  var V="1106kp", DATA=null, LOADING=false, TAP=0, CUR=null, CACHE={}, CORDER=[], ORIG=null, LAST=null;
  var LIFT_MS=300, TOTAL_MS=600;
  var RM=window.matchMedia?window.matchMedia("(prefers-reduced-motion: reduce)"):null;

  function load(){ if(DATA||LOADING) return; LOADING=true;
    try{ fetch("data/krpop.json?v="+V).then(function(r){ return r.ok?r.json():null; }).then(function(j){ if(j&&j.p&&j.u) DATA=j; }).catch(function(){}).then(function(){ LOADING=false; }); }catch(e){ LOADING=false; } }

  function css(){ if(document.getElementById("kpCss")) return; var s=document.createElement("style"); s.id="kpCss";
    s.textContent=".kpW{position:absolute;z-index:6;pointer-events:none}.kpW canvas{position:absolute;display:block;pointer-events:none}"
      +".kpH{left:0;top:0;width:100%;height:100%;opacity:0}.kpS{opacity:0}.kpP{left:0;top:0;width:100%;height:100%;transform-origin:50% 50%;will-change:transform}";
    document.head.appendChild(s); }

  function root(){ return window.NAVI_ROOT||"kr"; }
  function mapImg(){ return document.getElementById("mapimg"); }
  function imgOk(im){ return !!(im&&DATA&&im.getAttribute("src")===DATA.img&&im.complete&&im.naturalWidth>0); }
  function reduced(){ return !!(RM&&RM.matches); }
  function onScreen(el){ var r=el.getBoundingClientRect(), vh=window.innerHeight||document.documentElement.clientHeight, vw=window.innerWidth||document.documentElement.clientWidth;
    return r.width>0&&r.bottom>0&&r.top<vh&&r.right>0&&r.left<vw; }

  function ringPath(ctx,rings,sc,ox,oy){ ctx.beginPath(); for(var i=0;i<rings.length;i++){ var r=rings[i]; if(r.length<6) continue;
      ctx.moveTo(r[0]*sc-ox,r[1]*sc-oy); for(var j=2;j<r.length;j+=2) ctx.lineTo(r[j]*sc-ox,r[j+1]*sc-oy); ctx.closePath(); } }

  // 조각 캔버스 3장: 구멍(제자리 어둡게) · 그림자(흐림) · 조각(지도 그림 오림). res = 그림 1px 당 캔버스 px
  function build(id,im,res){ var P=DATA.p[id], NW=im.naturalWidth, f=NW/DATA.u, b=P.b;
    var bx=b[0]*f, by=b[1]*f, bw=Math.max(1,(b[2]-b[0])*f), bh=Math.max(1,(b[3]-b[1])*f);
    var cw=Math.max(1,Math.round(bw*res)), ch=Math.max(1,Math.round(bh*res)), sc=f*res;
    var pc=document.createElement("canvas"); pc.className="kpP"; pc.width=cw; pc.height=ch;
    var x=pc.getContext("2d"); x.save(); ringPath(x,P.r,sc,bx*res,by*res); x.clip("evenodd");
    x.drawImage(im,bx,by,bw,bh,0,0,cw,ch); x.restore();
    var hc=document.createElement("canvas"); hc.className="kpH"; hc.width=cw; hc.height=ch;
    x=hc.getContext("2d"); ringPath(x,P.r,sc,bx*res,by*res); x.fillStyle="#0e1822"; x.fill("evenodd");
    var sr=res*0.5, padI=Math.ceil(26/Math.max(sr,0.05)*0.5), sw=Math.max(1,Math.round((bw+padI*2)*sr)), sh=Math.max(1,Math.round((bh+padI*2)*sr));   // 그림자는 절반 해상도(흐려서 티 안 남)
    var sc2=document.createElement("canvas"); sc2.className="kpS"; sc2.width=sw; sc2.height=sh;
    x=sc2.getContext("2d"); var off=sw+40; x.shadowColor="rgba(0,0,0,.6)"; x.shadowBlur=Math.max(4,Math.round(10*Math.max(sr*2,0.5))); x.shadowOffsetX=off;
    ringPath(x,P.r,f*sr,(bx-padI)*sr+off,(by-padI)*sr); x.fillStyle="#000"; x.fill("evenodd");   // 모양은 캔버스 밖, 그림자만 제자리에
    sc2.style.left=(-padI/bw*100)+"%"; sc2.style.top=(-padI/bh*100)+"%"; sc2.style.width=((bw+padI*2)/bw*100)+"%"; sc2.style.height=((bh+padI*2)/bh*100)+"%";
    return {res:res,src:im.getAttribute("src"),bx:bx,by:by,bw:bw,bh:bh,NW:NW,p:pc,h:hc,s:sc2}; }
  function piece(id,im,res){ var c=CACHE[id];
    if(!c||c.src!==im.getAttribute("src")||c.res<res*0.85){ if(c) drop(id); c=CACHE[id]=build(id,im,res); }
    var k=CORDER.indexOf(id); if(k>=0) CORDER.splice(k,1); CORDER.push(id);
    while(CORDER.length>3) drop(CORDER.shift());
    return c; }
  function drop(id){ var c=CACHE[id]; if(!c) return; delete CACHE[id]; [c.p,c.h,c.s].forEach(function(e){ try{ if(e.parentNode) e.parentNode.removeChild(e); e.width=e.height=0; }catch(x){} }); var k=CORDER.indexOf(id); if(k>=0) CORDER.splice(k,1); }

  function anim(el,frames,ms,ease){ if(el.animate){ try{ return el.animate(frames,{duration:ms,easing:ease,fill:"forwards"}); }catch(e){} }
    var last=frames[frames.length-1]; el.style.transition="transform "+ms+"ms "+ease+",opacity "+ms+"ms "+ease;   // 옛 브라우저: CSS 전환
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ for(var k in last) if(k!=="offset") el.style[k]=last[k]; }); }); return null; }

  function start(v){ var im=mapImg(), z=document.getElementById("mz"), m=document.getElementById("map"); if(!z||!m) return false;
    var zr=z.getBoundingClientRect(), lw=z.offsetWidth||1, zs=zr.width/lw||1, dpr=Math.min(3,window.devicePixelRatio||1);
    var P=DATA.p[v], NW=im.naturalWidth, f=NW/DATA.u, bw=(P.b[2]-P.b[0])*f, bh=(P.b[3]-P.b[1])*f, perImg=lw/NW*zs;   // 그림 1px = 화면 perImg px
    var minD=Math.max(1,Math.min(bw,bh)*perImg), S=1+Math.max(0.06,Math.min(0.25,16/minD)), L=Math.max(7,Math.min(16,minD*0.1));   // 작은 조각일수록 더 커지게
    var res=Math.min(1,perImg*dpr*S); if(bw*bh*res*res>1.6e6) res=Math.sqrt(1.6e6/(bw*bh));
    var t0=performance.now(), c=piece(v,im,res), bms=Math.round(performance.now()-t0);
    css(); var w=document.createElement("div"); w.className="kpW"; w.setAttribute("aria-hidden","true");
    w.style.left=(c.bx/c.NW*100)+"%"; w.style.top=(c.by/c.NW*100)+"%"; w.style.width=(c.bw/c.NW*100)+"%"; w.style.height=(c.bh/c.NW*100)+"%";
    c.h.style.opacity="0"; c.s.style.opacity="0"; c.p.style.transform=""; c.s.style.transform=""; c.h.style.transition=c.s.style.transition=c.p.style.transition="";
    w.appendChild(c.h); w.appendChild(c.s); w.appendChild(c.p); z.appendChild(w);
    var Ll=L/zs, ease="cubic-bezier(.2,.9,.3,1.25)";   // 화면 px → #mz 안쪽 px (지도 확대 배율만큼 나눔)
    var A=[anim(c.p,[{transform:"translate(0,0) scale(1)"},{transform:"translate(0,"+(-Ll)+"px) scale("+S+")"}],LIFT_MS,ease),
           anim(c.s,[{opacity:0,transform:"translate(0,0) scale(1)"},{opacity:1,transform:"translate("+(Ll*0.35)+"px,"+(Ll*0.6)+"px) scale("+(1+(S-1)*0.6)+")"}],LIFT_MS,"ease-out"),
           anim(c.h,[{opacity:0},{opacity:0.42}],LIFT_MS,"ease-out")];
    var rb=document.getElementById("krRibbon"), rbo=rb?rb.style.opacity:null; if(rb) rb.style.opacity="0";   // 「Treasure Map of Korea」 리본이 떠 있으면 미리 흐리게(넘어갈 때 원래 코드가 지움) · 취소하면 되돌림
    CUR={v:v,w:w,a:A,t:setTimeout(finish,TOTAL_MS),ms:bms,rb:rb,rbo:rbo};
    LAST={v:v,build:bms,res:Math.round(res*1000)/1000,S:Math.round(S*1000)/1000,L:Math.round(L*10)/10};
    return true; }
  function clear(){ var c=CUR; if(!c) return null; CUR=null; clearTimeout(c.t);
    (c.a||[]).forEach(function(a){ try{ if(a) a.cancel(); }catch(e){} });
    try{ if(c.w.parentNode) c.w.parentNode.removeChild(c.w); }catch(e){}
    return c; }
  function finish(){ var c=clear(); if(c) ORIG.call(window,c.v); }
  function cancel(){ var c=clear(); try{ if(c&&c.rb&&c.rb.parentNode) c.rb.style.opacity=c.rbo; }catch(e){} }

  function wrapTap(name){ var f=window[name]; if(typeof f!=="function"||f.__kp) return; var g=function(){ TAP++; try{ return f.apply(this,arguments); } finally{ TAP--; } }; g.__kp=1; window[name]=g; }
  function wrapView(){ var f=window.viewSet; if(typeof f!=="function"||f.__kp) return; ORIG=f;
    var g=function(v){
      if(CUR){ if(TAP&&v===CUR.v){ finish(); return; } cancel(); }   // 연출 중 다른 viewSet = 연출 접고 그 호출대로
      try{
        if(TAP&&DATA&&DATA.p&&DATA.p[v]&&window.VIEW===root()&&!window.DET&&!reduced()&&document.visibilityState!=="hidden"){
          var im=mapImg(), m=document.getElementById("map");
          if(imgOk(im)&&m&&onScreen(m)&&start(v)) return; }
      }catch(e){ cancel(); try{ [].forEach.call(document.querySelectorAll(".kpW"),function(n){ n.parentNode.removeChild(n); }); }catch(x){} }   // 무슨 일이 있어도 조각이 남지 않게
      if(!DATA) load();
      return f.apply(this,arguments); };
    g.__kp=1; window.viewSet=g; }

  function init(){ if(typeof window.viewSet!=="function") return false;
    wrapTap("ctGo"); wrapTap("hitClick"); wrapView();
    // 연출 중 누름 = 바로 넘어감 (다른 이름표·그림이 또 눌리지 않게 그 누름은 먹는다)
    window.addEventListener("click",function(e){ if(!CUR) return; e.stopPropagation(); e.preventDefault(); finish(); },true);
    // 연출 중 뒤로가기 = 연출 취소 · 전국 지도 그대로 — 「한 번 더 누르면 종료」 안내가 뜨지 않게:
    //   ① 앱 뒤로가기 처리(index.html backClose)가 guBack() 을 묻는 자리에서 「취소로 처리함」을 돌려준다 → 앱이 지킴 칸을 다시 깐다
    //   ② 우리 것이 먼저 불리는 브라우저면 여기서 취소하고 앱 처리는 건너뛴 뒤 지킴 칸만 다시 깐다
    var gb=window.guBack; window.guBack=function(){ if(CUR){ cancel(); return true; } return typeof gb==="function"?gb.apply(this,arguments):false; };
    window.addEventListener("popstate",function(e){ if(!CUR) return; if(e.state&&e.state.nvg) return; cancel(); e.stopImmediatePropagation();
      try{ if(!(history.state&&history.state.nvg)) history.pushState({nvg:1},""); }catch(x){} },true);
    document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden"&&CUR) finish(); });
    var t=function(){ load(); }; if(window.requestIdleCallback) requestIdleCallback(t,{timeout:2500}); else setTimeout(t,1500);
    return true; }
  if(!init()) document.addEventListener("DOMContentLoaded",init);
  window.KRPOP={busy:function(){ return !!CUR; },ready:function(){ return !!DATA; },last:function(){ return LAST; },v:V};
})();
