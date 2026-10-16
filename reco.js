/* 머니퍼즐 내비 — 조회창 「추천받기 / Get ideas」 AI 명소 추천 (사장님 2026-10-16)
 *  · 검색 단추 옆 「추천받기」: 손님 문장 → 허브 POST /nreco → ① 우리 지도 명소(목록 안 key 만, 서버가 대조) 0~5곳 + 한 줄 이유
 *    ② 목록에 맞는 곳이 적거나 바다·스키처럼 흔한 종류면 AI 가 준 카카오 검색어(kw) → 기존 /kplace(near=1)로 실제 장소를 가까운 순
 *       (기준: 폰에 「나」 위치가 있으면 그 위치 — 기존 검색처럼 ux/uy 만, 없으면 서울시청) ③ 계절 안내(note)
 *  · 지도: 고른 명소에 반짝이는 동그라미(번호) — 약도를 옮겨 다녀도 다시 그린다. ✕·새 검색이면 지운다
 *  · 「다시 짜줘 / Try again」: 이미 보여준 명소 key·검색어·카카오 장소는 빼고 새로. 횟수 제한 없음(허브 남용 막기만)
 *  · 이용권: hasPass() 로 막는 자리 — 지금은 trip.js 의 hasPass()=true 라 누구나. 결제 붙일 때 그 한 곳만 바꾸면 유료
 *  · 손님 문장은 이 기기에도 서버에도 남기지 않는다 · 위치는 서버로 안 보냄(카카오 결과 거리 계산은 화면에서)
 *  index.html 은 <script src="reco.js"> 한 줄뿐 — 전역(PLACES·CITY·VIEW·DET·_nm·ME·HUB·T·esc·LANG·viewSet·placeShow·spinGo·meBest·meGeoFrac·
 *  mapLoad·kmLL·kmTxt·telLine·linksTo·go·resClear·TRIP·hasPass·openPricing)을 부른다
 */
(function(){
"use strict";
var SEOUL=[37.5665,126.978];
var R={q:"",ex:[],exk:[],kseen:{},picks:[],kits:[],note:"",on:false,busy:false,back:false};
function $(id){ return document.getElementById(id); }
function css(){ if($("rcCss")) return; var s=document.createElement("style"); s.id="rcCss";
  s.textContent=".sbox #recob{order:0;background:var(--blue)}"
  +".sbox{flex-direction:row;flex-wrap:wrap;justify-content:center}.sbox .qw,.sbox .desc{flex:0 0 100%}"   /* 폰 세로: 검색·추천받기 한 줄에 반씩 */
  +".sbox #gob,.sbox #recob{width:calc(min(260px,70%) / 2 - 5px)!important;box-sizing:border-box;text-align:center;margin:0!important;white-space:nowrap;padding-left:6px!important;padding-right:6px!important}"
  +".sbox #gfchips>button{flex:0 0 auto}"
  +"@media (orientation:landscape) and (max-height:560px),(min-width:900px) and (min-height:561px){.sbox{flex-wrap:nowrap}.sbox .qw{flex:1 1 200px}.sbox .desc{flex:none}"
  +".sbox #gob,.sbox #recob{width:auto!important;font-size:14px!important;padding:7px 14px!important;line-height:1.2}}"
  +".rchd{display:flex;align-items:baseline;gap:8px;margin:2px 44px 4px 4px;font-weight:800;font-size:15px}.rchd .d{font-weight:400;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
  +".rcnote{background:#fff9db;border:1px solid #ffe066;color:#5c4400;border-radius:12px;padding:8px 12px;font-size:13.5px;margin:6px 0}"
  +":root[data-theme=dark] .rcnote{background:#3b3212;border-color:#8a6d00;color:#ffe8a3}"
  +".rcit{cursor:pointer;position:relative;padding-left:46px!important}.rcno{position:absolute;left:12px;top:12px;width:24px;height:24px;border-radius:50%;background:#f08c00;color:#fff;font-weight:900;font-size:13px;line-height:24px;text-align:center}"
  +".rcwhy{color:var(--ink);font-size:14px;margin:3px 0 6px}.rcsec{font-size:13px;font-weight:800;color:var(--sub);margin:12px 4px 2px}"
  +".rcbar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0 2px}.rcbar button{border:1.5px solid var(--blue);background:var(--card);color:var(--blue);font-weight:800;font-size:14px;border-radius:999px;padding:8px 16px;cursor:pointer}"
  +".rcbar button.pri{background:var(--blue);color:#fff}.rcmsg{text-align:center;color:var(--sub);font-size:14px;margin:10px 4px}"
  +".rcring{position:absolute;z-index:4;pointer-events:none;transform:translate(-50%,-50%);border-radius:50%;border:3px solid #f08c00;box-shadow:0 0 0 3px rgba(255,255,255,.85),0 0 14px 4px rgba(240,140,0,.75);animation:rcPulse 1.3s ease-in-out infinite}"
  +".rcring b{position:absolute;right:-6px;top:-6px;min-width:18px;height:18px;border-radius:9px;background:#f08c00;color:#fff;font-size:11px;line-height:18px;text-align:center;font-weight:900;padding:0 3px;box-shadow:0 0 0 2px #fff}"
  +"@keyframes rcPulse{0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%{opacity:.55;transform:translate(-50%,-50%) scale(1.18)}}"
  +"@media (prefers-reduced-motion:reduce){.rcring{animation:none}}"
  +".rcback{border:0;background:none;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:4px 2px;margin:0 0 2px}";
  document.head.appendChild(s); }
function L(){ return LANG==="en"; }
function pass(){ try{ return (window.TRIP&&TRIP.hasPass)?TRIP.hasPass():(typeof window.hasPass==="function"?window.hasPass():true); }catch(e){ return true; } }
function btn(){ css(); var b=$("recob"); if(!b){ var g=$("gob"); if(!g) return; g.insertAdjacentHTML("afterend",'<button type="button" id="recob"></button>'); b=$("recob"); b.onclick=function(){ recoGo(); }; }
  b.textContent=T("추천받기","Get ideas"); }
function allMaps(){ return Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })); }
function origin(){ return (ME&&ME.pos)?ME.pos:SEOUL; }

// ── 부르기 ──
function recoGo(more){
  var q=more?R.q:$("q").value.trim(), out=$("res");
  if(!q){ $("q").focus(); out.innerHTML='<div class="msg">'+esc(T("가고 싶은 여행을 문장으로 적고 「추천받기」를 눌러 주세요. 예: 한옥 구경하고 싶어","Type what you’d like to do, then tap “Get ideas”. e.g. I want to see traditional houses"))+'</div>'; return; }
  if(!pass()){ try{ openPricing(); }catch(e){} return; }   // 이용권 자리 — 지금은 hasPass()=true
  if(R.busy) return;
  if(!more){ R={q:q,ex:[],exk:[],kseen:{},picks:[],kits:[],note:"",on:false,busy:false,back:false}; ringClear(); }
  R.busy=true; R.back=false;
  try{ spinClear(); }catch(e){}
  out.innerHTML='<div class="msg">'+esc(T("AI가 고르는 중…","AI is picking places…"))+'</div>';
  try{ ntap("_reco","reco"); }catch(e){}
  var body=JSON.stringify({q:q,lang:LANG,ex:R.ex,exk:R.exk});
  Promise.all([fetch(HUB+"/nreco",{method:"POST",headers:{"Content-Type":"application/json"},body:body}).then(function(r){ return r.json(); }),allMaps()]).then(function(a){
    var j=a[0]||{};
    if(!j.ok){ R.busy=false; out.innerHTML='<div class="msg">'+esc(j.err==="rate"?T("잠시 뒤 다시 해 주세요 (요청이 많아요).","Too many requests — please try again shortly."):T("잠시 뒤 다시 해 주세요.","Please try again shortly."))+'</div>'+bar(false); return; }
    var picks=(j.picks||[]).filter(function(p){ return PLACES[p.k]&&R.ex.indexOf(p.k)<0; });
    picks.forEach(function(p){ R.ex.push(p.k); });
    var kws=(j.kw||[]).filter(function(k){ return k&&R.exk.indexOf(k)<0; }).slice(0,2);
    if(!kws.length&&(j.kw||[]).length) kws=(j.kw||[]).slice(0,1);   // 같은 검색어여도 다음 장소를 보여 준다
    kws.forEach(function(k){ if(R.exk.indexOf(k)<0) R.exk.push(k); });
    return kGet(kws,picks.length).then(function(kits){ R.busy=false; R.picks=picks; R.kits=kits; R.note=j.note||""; R.on=true; paint(); });
  }).catch(function(){ R.busy=false; out.innerHTML='<div class="msg">'+esc(T("잠시 뒤 다시 해 주세요.","Please try again shortly."))+'</div>'; });
}
// 카카오 실제 장소 — 기존 /kplace(near=1). 위치는 기존 검색처럼 ux/uy(있을 때만), 거리는 화면에서
var KBAD=/편의점|주차장|부동산|주유소|은행|ATM|세탁|미용|학원|병원|약국/, KFOOD=/카페|커피|맛집|음식|식당|호텔|숙소|펜션|숙박/;
function kGet(kws,np){ if(!kws.length) return Promise.resolve([]); var o=origin(), ps=ME&&ME.pos;
  return Promise.all(kws.map(function(kw){ return fetch(HUB+"/kplace?q="+encodeURIComponent(kw)+"&near=1"+(L()?"&lang=en":"")+(ps?"&ux="+ps[1].toFixed(5)+"&uy="+ps[0].toFixed(5):"")).then(function(r){ return r.json(); }).then(function(j){
      var it=(j&&j.ok&&j.items)||[], keep=/약국|병원|은행|ATM|편의점/.test(kw);   // 손님이 그걸 찾으면 남긴다
      return it.filter(function(x){ var c=String(x.cat||""); return keep||!(KBAD.test(c)||(!KFOOD.test(kw)&&/음식점|카페|숙박/.test(c))); }); }).catch(function(){ return []; }); }))
  .then(function(ls){ var all=[], seen={};
    ls.forEach(function(l){ l.forEach(function(x){ var k=x.name+"|"+(+x.x).toFixed(4)+"|"+(+x.y).toFixed(4); if(seen[k]||R.kseen[k]) return; seen[k]=1; x._k=k; x.dist=Math.round(kmLL(o,[+x.y,+x.x])*1000); all.push(x); }); });
    all.sort(function(a,b){ return a.dist-b.dist; });
    var n=Math.max(3,5-Math.min(np,2)), r=all.slice(0,n); r.forEach(function(x){ R.kseen[x._k]=1; }); return r; }); }

// ── 그리기 ──
function bar(retry){ return '<div class="rcbar">'+(retry?'<button type="button" class="pri" data-rc="again">'+esc(T("다시 짜줘","Try again"))+'</button>':'')+'<button type="button" data-rc="search">'+esc(T("일반 검색으로 찾기","Regular search"))+'</button></div>'; }
function has(k){ try{ return TRIP.state().items.some(function(x){ return x.k===k; }); }catch(e){ return false; } }
function addBtn(k){ var on=has(k); return '<div class="trbw"><button type="button" class="tradd'+(on?' on':'')+'" data-k="'+esc(k)+'" data-src="'+esc(k)+'">'+(on?T("✓ 담김 · 빼기","✓ Added · Remove"):T("＋ 일정에 담기","＋ Add to my trip"))+'</button></div>'; }
function paint(){ var out=$("res"), en=L(), h='', n=0;
  h+='<div class="rcwrap"><div class="rchd">'+esc(T("AI 추천","AI picks"))+'<span class="d">“'+esc(R.q)+'”</span></div>';
  if(R.note) h+='<div class="rcnote">'+esc(R.note)+'</div>';
  R.picks.forEach(function(p,i){ var P=PLACES[p.k], nm=en?P.en:P.ko, sub=en?P.ko:"";
    h+='<div class="item rcit" data-rk="'+esc(p.k)+'"><span class="rcno">'+(i+1)+'</span><div class="t">'+esc(nm)+'</div>'+(sub?'<div class="d" style="margin:1px 0 0">'+esc(sub)+'</div>':'')
      +'<div class="rcwhy">'+esc(p.why||(en?P.den:P.dko)||"")+'</div>'+addBtn(p.k)+'</div>'; n++; });
  if(R.kits.length){ var fs=!(ME&&ME.pos);
    h+='<div class="rcsec">'+esc(fs?T("가까운 곳 (서울에서 가까운 순)","More places nearby (closest to Seoul)"):T("가까운 곳 (나에게서 가까운 순)","More places nearby (closest to you)"))+'</div>';
    window._sres=R.kits;
    R.kits.forEach(function(x,i){ var e2=en&&x.name_en, ttl=e2?x.name_en:x.name, ad=e2?(x.addr_en||x.addr):x.addr, ct=e2?(x.cat_en||""):String(x.cat||"").split(">").pop().trim();
      h+='<div class="item sres rck" data-i="'+i+'" style="cursor:pointer"><div class="t">📍 '+esc(ttl)+'</div>'+(e2?'<div class="d" style="margin:1px 0 0">'+esc(x.name)+'</div>':'')+'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+(x.dist!=null?' · <b>'+kmTxt(x.dist)+'</b>':'')+'</div>'
        +telLine(x.tel)+linksTo(x.name,x.y,x.x,x.name,x.addr)+'</div>'; n++; }); }
  if(!n) h+='<div class="rcmsg">'+esc(R.ex.length||R.exk.length?T("더 알맞은 곳이 적어요. 일반 검색으로도 찾아 보세요.","Few more places match. Try a regular search too."):T("알맞은 곳이 적어요. 일반 검색으로 찾아 보세요.","Few places match this. Try a regular search."))+'</div>';
  else if(R.picks.length+R.kits.length<3) h+='<div class="rcmsg">'+esc(T("알맞은 곳이 적어요 — 일반 검색도 해 보세요.","Only a few places match — try a regular search too."))+'</div>';
  h+=bar(n>0)+'</div>';
  out.innerHTML=h; showMap();
  clearTimeout(window._scT); window._scT=setTimeout(function(){ window.scrollTo({top:out.getBoundingClientRect().top+scrollY-70,behavior:"smooth"}); },120); }

// ── 지도 강조 ── 고른 곳을 모두 담는 가장 자세한 약도로 옮기고 동그라미
function showMap(){ if(!R.picks.length){ ringClear(); return; } if(DET){ ringDraw(); return; }
  var ids=R.picks.map(function(p){ var P=PLACES[p.k]; var id=meBest(+P.lat,+P.lng); return (!id||id===NAVI_ROOT)?"kr":id; });
  var ch=function(id){ var a=[]; while(id&&id!=="kr"&&CITY[id]){ a.unshift(id); id=CITY[id].parent; } a.unshift("kr"); return a; };
  var c=ch(ids[0]); ids.slice(1).forEach(function(id){ var d=ch(id), i=0; while(i<c.length&&i<d.length&&c[i]===d[i]) i++; c=c.slice(0,i); });
  var v=c.length?c[c.length-1]:"kr"; if(v===NAVI_ROOT) v="kr";
  if(VIEW!==v) viewSet(v); else ringDraw(); }
function ringClear(){ [].forEach.call(document.querySelectorAll("#mz .rcring"),function(e){ e.remove(); }); }
function ringDraw(){ ringClear(); if(!R.on||!R.picks.length||DET) return; var z=$("mz"), w=$("map").clientWidth, sz=Math.max(26,w*(VIEW==="kr"?0.05:0.07));
  R.picks.forEach(function(p,i){ var P=PLACES[p.k]; if(!P) return; var f=meGeoFrac(VIEW,+P.lat,+P.lng); if(!f||f[0]<0||f[0]>1||f[1]<0||f[1]>1) return;
    var e=document.createElement("div"); e.className="rcring"; e.style.left=(f[0]*100)+"%"; e.style.top=(f[1]*100)+"%"; e.style.width=e.style.height=sz+"px"; e.innerHTML="<b>"+(i+1)+"</b>"; z.appendChild(e); }); }
function rcOff(){ R.on=false; R.back=false; ringClear(); }

// ── 누르기 ──
document.addEventListener("click",function(e){ var t=e.target;
  var b=t.closest&&t.closest("[data-rc]"); if(b){ e.preventDefault(); if(b.dataset.rc==="again") recoGo(true); else if(b.dataset.rc==="search"){ var q=R.q; rcOff(); $("q").value=q; try{ qxSync(); }catch(x){} go(q); } else if(b.dataset.rc==="back"){ paint(); } return; }
  if(t.closest&&(t.closest("a")||t.closest(".tradd"))) return;
  var c=t.closest&&t.closest("#res .rcit"); if(c){ var k=c.dataset.rk, P=PLACES[k]; if(!P) return; R.back=true;
    var id0=meBest(+P.lat,+P.lng)||NAVI_ROOT; if(DET){ try{ _nm.setCenter(new naver.maps.LatLng(+P.lat,+P.lng)); }catch(x){} } else spinGo(id0===NAVI_ROOT?"kr":id0,+P.lat,+P.lng,null);
    placeShow(k); return; }
  if(t.closest&&t.closest("#res .rck")) R.back=true;   // 카카오 장소 — 기존 검색 핀(spinShow)이 연다
},true);
// 장소 카드를 연 뒤 「← AI 추천으로」
new MutationObserver(function(){ var r=$("res"); if(!R.back||!R.on||r.querySelector(".rcwrap")||r.querySelector(".rcback")||!r.querySelector(".item")) return;
  var it=r.querySelector(".item"); it.insertAdjacentHTML("beforebegin",'<button type="button" class="rcback" data-rc="back">← '+esc(T("AI 추천으로 돌아가기","Back to AI picks"))+'</button>'); }).observe($("res"),{childList:true});

// 전역 감싸기 — 약도를 옮기면 동그라미 다시 · 새 검색·✕·처음으로면 끔
var vs0=window.viewSet; window.viewSet=function(){ var r=vs0.apply(this,arguments); try{ ringDraw(); }catch(e){} return r; };
var go0=window.go; window.go=function(){ rcOff(); return go0.apply(this,arguments); };
var rc0=window.resClear; window.resClear=function(){ rcOff(); return rc0.apply(this,arguments); };
var ra0=window.resetAll; if(typeof ra0==="function") window.resetAll=function(){ rcOff(); return ra0.apply(this,arguments); };
var sl0=window.setLang; window.setLang=function(){ var r=sl0.apply(this,arguments); try{ btn(); }catch(e){} return r; };
var zs=new ResizeObserver(function(){ if(R.on) try{ ringDraw(); }catch(e){} }); try{ zs.observe($("map")); }catch(e){}
btn();
window.RECO={go:recoGo,state:function(){ return R; }};
})();
