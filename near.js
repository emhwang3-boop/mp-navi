/* 머니퍼즐 내비 — 「🏪 편의시설」·「🚑 긴급」 빠른 찾기 (사장님 2026-10-16)
 *  편의시설: 편의점(CS2)·마트(MT1) / 긴급: 병원(HP8)·약국(PM9) — 가까운 순 10곳. 한 곳 누르면 기존 검색 핀(spinShow) 그대로:
 *  약도(또는 자세한 지도)에 핀 + 카드(전화·길찾기·K.Ride·「나에게서 N km」) + 거리 재기. 핀은 카드 ✕ 로 지운다(기존 규칙)
 *  · 기준 위치: 「나」 위치 → 없으면 지금 보는 약도(자세한 지도) 가운데 → 그것도 없으면 위치 권한 요청
 *  · 자료: 허브 GET /kplace?cat=CS2&x=&y=&radius= (카카오 카테고리, navi 만, 좌표는 허브에서 100m 로 깎음). 거리는 화면에서 계산(위치는 안 남김)
 *  · 응급실 여부는 카카오가 안 줘서 표시 안 함 · 영업중 여부도 카카오가 안 줘서 생략
 *  · 긴급 맨 위: 119(응급) · 1330(한국관광공사 관광통역안내, 24시간 한·영·일·중 — 휴대폰은 지역번호+1330, 서울 02-1330 이라 +82-2-1330 으로 건다)
 *  · 누름 집계: ntap(cs2|mt1|hp8|pm9, "amenity"|"emergency") — 가게 이름은 안 보낸다
 *  index.html 은 <script src="near.js"> 한 줄뿐 — 전역(ME·DET·_nm·VIEW·CITY·ZM·ASP·meGeoInv·myPos·meSet·kmLL·spinShow·spinCard·telLine·ntap·T·esc·HUB)을 부른다
 */
(function(){
"use strict";
var KINDS={
  am:{e:"amenity", t:["🏪 편의시설","🏪 Convenience"], tabs:[{c:"CS2",ko:"편의점",en:"Convenience store",i:"🏪",r:1000},{c:"MT1",ko:"마트",en:"Supermarket",i:"🛒",r:5000}]},
  em:{e:"emergency", t:["🚑 긴급","🚑 Emergency"], tabs:[{c:"HP8",ko:"병원",en:"Hospital",i:"🏥",r:2000},{c:"PM9",ko:"약국",en:"Pharmacy",i:"💊",r:2000}]}
};
var S={k:"",tab:0,base:null,src:"",items:null,err:""}, CACHE={}, PICK=null;
function L(){ return window.LANG==="en"; }
// 빨간·파란 단추 안 전화기 — 흰 선 그림(글자색 그대로, 사장님 10-16: 이모지는 분홍빛이라)
var PH='<svg class="nrph" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function km(m){ return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"; }

function css(){ if(document.getElementById("nrCss")) return; var s=document.createElement("style"); s.id="nrCss";
  s.textContent="#gfchips .nrchip{display:inline-block;width:auto;margin:0;border:1.5px solid #1971c2;background:#e7f5ff;color:#1864ab;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:none}"
  +"#gfchips .nrchip.em{border-color:#e03131;background:#fff5f5;color:#c92a2a}"
  +".nrlock,.nrlock body{overflow:hidden}#nrBox{position:fixed;inset:0;z-index:1036;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}"
  +"#nrBox .nrin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px;box-sizing:border-box}"
  +".nrtop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin-bottom:8px}.nrx{width:34px;height:34px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}"
  +".nrsos{display:flex;gap:8px;margin:0 0 10px}.nrsos a{flex:1;display:block;text-align:center;text-decoration:none;border-radius:12px;padding:10px 6px;font-weight:900;font-size:15px;line-height:1.25}"
  +".nrsos a small{display:block;font-size:11.5px;font-weight:700;opacity:.85}.nrsos .s119{background:#e03131;color:#fff}.nrsos .s1330{background:#1971c2;color:#fff}"
  +".nrtabs{display:flex;gap:8px;margin:0 0 8px}.nrtab{flex:1;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:9px 6px;font-size:15px;font-weight:800;cursor:pointer}"
  +".nrtab.on{border-color:#1971c2;background:#e7f5ff;color:#1864ab}.nrem .nrtab.on{border-color:#e03131;background:#fff5f5;color:#c92a2a}"
  +".nrbase{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--sub);font-size:12.5px;margin:2px 2px 6px}.nrme{border:1px solid #1a73e8;background:none;color:#1a73e8;border-radius:999px;padding:3px 10px;font-size:12.5px;font-weight:800;cursor:pointer}"
  +".nrit{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0;cursor:pointer}"
  +".nrit .h{display:flex;align-items:baseline;gap:6px}.nrit .h b{flex:1;font-size:15.5px}.nrit .h i{font-style:normal;color:#1a73e8;font-weight:900;font-size:14px;white-space:nowrap}"
  +".nrit .ko{color:var(--sub);font-size:12.5px;margin-top:1px}.nrit .d{color:var(--sub);font-size:12.5px;margin-top:2px;line-height:1.45}"
  +".nrit .row{display:flex;align-items:center;gap:8px;margin-top:6px}.nrit .row .go{margin-left:auto;color:#1a73e8;font-weight:800;font-size:13px;white-space:nowrap}"
  +".nrtel{color:var(--ink);font-weight:800;font-size:14px;text-decoration:none}"
  +".nrcall{display:inline-block;background:#e03131;color:#fff!important;border-radius:10px;padding:8px 16px;font-size:16px;font-weight:900;text-decoration:none}"
  +".nrcall.am{background:#1971c2}"
  +".nrrank{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#1971c2;color:#fff;font-size:12px;text-align:center;vertical-align:1px}.nrem .nrrank{background:#e03131}"
  +".nrph{display:inline-block;width:1em;height:1em;vertical-align:-0.14em;margin-right:5px;color:inherit}"
  +".nrbig,.item a.nrbig{display:block!important;text-align:center;background:#e03131!important;color:#fff!important;border:0!important;border-radius:12px!important;padding:12px 8px!important;font-size:18px!important;font-weight:900!important;text-decoration:none;margin:4px 0 10px!important}";
  document.head.appendChild(s); }

// ── 기준 위치 ──
function mapCenter(){ try{
    if(window.DET&&window._nm){ var c=_nm.getCenter(); return [c.lat(),c.lng()]; }
    if(VIEW&&VIEW!=="kr"&&CITY[VIEW]){ var m=document.getElementById("map"), w=m.clientWidth, h=w, as=ASP(), iw=w*as*ZM.s, ih=w*ZM.s; return meGeoInv(VIEW,(w/2-ZM.tx)/iw,(h/2-ZM.ty)/ih); }
  }catch(e){} return null; }
function pickBase(force){
  if(ME.pos&&!force) return Promise.resolve({p:ME.pos,src:"me"});
  var c=force?null:mapCenter(); if(c) return Promise.resolve({p:c,src:"map"});
  return myPos().then(function(p){ if(p){ try{ if(!ME.pos) meSet(p); }catch(e){} return {p:p,src:"me"}; } return null; }); }

// ── 자료 ──
function fetchKind(t,p){ var en=L()?"&lang=en":"", key=t.c+"|"+p[0].toFixed(3)+","+p[1].toFixed(3)+en;
  if(CACHE[key]) return CACHE[key];
  var one=function(r){ return fetch(HUB+"/kplace?cat="+t.c+"&x="+p[1].toFixed(5)+"&y="+p[0].toFixed(5)+"&radius="+r+en).then(function(x){ return x.json(); }); };
  return CACHE[key]=one(t.r).then(function(j){ if(j&&j.ok&&(j.items||[]).length>=(t.c==="HP8"||t.c==="PM9"?10:3)) return j; return one(10000); }).then(function(j){
    if(!j||!j.ok) throw new Error((j&&j.err)||"fail"); return j.items||[]; },function(e){ delete CACHE[key]; throw e; }).catch(function(e){ delete CACHE[key]; throw e; }); }
function load(){ var k=KINDS[S.k], t=k.tabs[S.tab]; S.items=null; S.err=""; paint();
  var my=S.k+S.tab+(L()?"en":"ko");
  pickBase(false).then(function(b){ if(!b){ S.base=null; S.err="loc"; paint(); return; }
    S.base=b.p; S.src=b.src; paint();
    return fetchKind(t,b.p).then(function(it){ if(S.k+S.tab+(L()?"en":"ko")!==my) return;
      it=it.map(function(x){ var o=Object.assign({},x); o.dist=Math.round(kmLL(b.p,[+x.y,+x.x])*1000); return o; }).sort(function(a,c){ return a.dist-c.dist; }).slice(0,10);
      S.items=it; paint(); }); }).catch(function(){ S.err="net"; paint(); }); }

// ── 화면 ──
function open(k){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  if(S.k!==k){ S.tab=0; } S.k=k;
  var o=document.getElementById("nrBox"); if(!o){ o=document.createElement("div"); o.id="nrBox"; o.innerHTML='<div class="nrin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("nrlock"); o.scrollTop=0; load(); }
function close(){ var o=document.getElementById("nrBox"); if(o) o.remove(); document.documentElement.classList.remove("nrlock"); }
function sos(){ return '<div class="nrsos"><a class="s119" href="tel:119">'+PH+T("응급 119","Emergency 119")+'<small>'+T("구급·화재","Ambulance · Fire")+'</small></a>'
  +'<a class="s1330" href="tel:+82-2-1330">'+PH+'1330<small>'+T("관광통역안내 (24시간)","Travel helpline · English 24h")+'</small></a></div>'; }
function itemHtml(x,i,em){ var en=L()&&x.name_en, nm=en?x.name_en:x.name, ad=en?(x.addr_en||x.addr):x.addr, ct=en?(x.cat_en||""):String(x.cat||"").split(">").pop().trim();
  var tel=""; if(x.tel){ var shown=L()?(/^0/.test(x.tel)?"+82 "+x.tel.slice(1):"+82 "+x.tel):x.tel;
    tel=em?'<a class="nrcall" href="tel:'+esc(telIntl(x.tel))+'">'+PH+T("전화","Call")+'</a> <span class="d">'+esc(shown)+'</span>':'<a class="nrcall am" href="tel:'+esc(telIntl(x.tel))+'">'+PH+T("전화","Call")+'</a> <span class="d">'+esc(shown)+'</span>'; }   // 편의점·마트도 같은 흰 전화기 단추 (파랑)
  return '<div class="nrit" data-nr="pick" data-i="'+i+'"><div class="h"><span class="nrrank">'+(i+1)+'</span><b>'+esc(nm)+'</b><i>'+km(x.dist)+'</i></div>'
    +(en?'<div class="ko">'+esc(x.name)+'</div>':'')+'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+'</div>'
    +'<div class="row">'+tel+'<span class="go">'+T("지도에 핀","Pin on map")+' ›</span></div></div>'; }
function paint(){ var b=document.querySelector("#nrBox .nrin"); if(!b||!S.k) return; var k=KINDS[S.k], em=S.k==="em";
  b.className="nrin"+(em?" nrem":"");
  var h='<div class="nrtop"><b>'+T(k.t[0],k.t[1])+'</b><button type="button" class="nrx" data-nr="x" aria-label="close">✕</button></div>';
  if(em) h+=sos();
  h+='<div class="nrtabs">'+k.tabs.map(function(t,i){ return '<button type="button" class="nrtab'+(i===S.tab?' on':'')+'" data-nr="tab" data-i="'+i+'">'+t.i+' '+esc(L()?t.en:t.ko)+'</button>'; }).join("")+'</div>';
  if(S.err==="loc") h+='<div class="msg">'+T("위치를 받을 수 없습니다 — 폰 설정에서 위치 권한을 켜 주세요. 또는 지도를 보고 싶은 동네로 옮긴 뒤 다시 눌러 주세요.","Could not get your location — please allow location access, or move the map to the area you want and try again.")+'</div><div class="nrbase"><button type="button" class="nrme" data-nr="me">📍 '+T("내 위치 다시 받기","Try my location again")+'</button></div>';
  else if(S.err) h+='<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>';
  else { if(S.base) h+='<div class="nrbase">'+(S.src==="me"?T("📍 내 위치에서 가까운 순","📍 Nearest to you"):T("🗺 지금 보는 지도 가운데에서 가까운 순","🗺 Nearest to the center of the map"))
      +(S.src!=="me"?' <button type="button" class="nrme" data-nr="me">📍 '+T("내 위치로","Use my location")+'</button>':'')+'</div>';
    if(!S.items) h+='<div class="msg">'+T("찾는 중…","Searching…")+'</div>';
    else if(!S.items.length) h+='<div class="msg">'+T("가까운 곳에 없습니다.","None found nearby.")+'</div>';
    else h+=S.items.map(function(x,i){ return itemHtml(x,i,em); }).join(""); }
  b.innerHTML=h; }

// ── 한 곳 고르기 → 기존 검색 핀 ──
function pick(x){ var t=KINDS[S.k].tabs[S.tab]; try{ ntap(t.c.toLowerCase(),KINDS[S.k].e); }catch(e){}
  PICK={lat:+x.y,lng:+x.x,em:S.k==="em"}; close();
  spinShow({name:x.name,name_en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||""}); }
// 긴급으로 고른 곳은 카드 맨 위에 큰 「전화」 단추
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._nr){ var sc1=function(){ var r=sc0.apply(this,arguments);
    try{ var p=PLACES.__pin; if(PICK&&PICK.em&&p&&p.tel&&Math.abs(+p.lat-PICK.lat)<1e-6&&Math.abs(+p.lng-PICK.lng)<1e-6){ var it=document.querySelector("#res .item");
      if(it&&!it.querySelector(".nrbig")){ css(); var t=it.querySelector(".t"); var a='<a class="nrbig tel" href="tel:'+esc(telIntl(p.tel))+'">'+PH+T("전화 걸기","Call now")+'</a>'; if(t) t.insertAdjacentHTML("afterend",a); else it.insertAdjacentHTML("afterbegin",a); } } }catch(e){}
    return r; }; sc1._nr=1; sc1._gf=sc0._gf; sc1._tr=sc0._tr; window.spinCard=sc1; }

document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-nr]"); if(!t||!t.closest("#nrBox,#gfchips,#mm")) return;
  if(e.target.closest("a[href^='tel:']")) return;   // 전화는 그대로 건다
  e.preventDefault(); var g=t.dataset.nr;
  if(g==="am"||g==="em") return open(g);
  if(g==="x") return close();
  if(g==="tab"){ S.tab=+t.dataset.i; load(); return; }
  if(g==="me"){ S.items=null; S.err=""; paint(); myPos().then(function(p){ if(p){ try{ meSet(p); }catch(z){} } load(); }); return; }
  if(g==="pick"){ var x=S.items&&S.items[+t.dataset.i]; if(x) pick(x); } });

// ── 들어가는 곳: 검색창 아래 칩(선물 고르기 옆) · ⋮ 메뉴 ──
function entries(){ css(); var box=document.getElementById("gfchips");
  if(!box){ var h=document.getElementById("gob")||document.getElementById("hint"); if(!h) return; h.insertAdjacentHTML("afterend",'<div id="gfchips" style="display:flex;justify-content:center;gap:6px;margin:10px 0 0;flex-wrap:wrap"></div>'); box=document.getElementById("gfchips"); }
  ["am","em"].forEach(function(k){ var c=box.querySelector('.nrchip[data-nr="'+k+'"]'); if(!c){ box.insertAdjacentHTML("beforeend",'<button type="button" class="nrchip'+(k==="em"?' em':'')+'" data-nr="'+k+'"></button>'); c=box.querySelector('.nrchip[data-nr="'+k+'"]'); }
    c.textContent=k==="am"?T("🏪 편의시설","🏪 Convenience"):T("🚑 긴급","🚑 Emergency"); });
  var mm=document.getElementById("mm"); if(mm) ["am","em"].forEach(function(k){ var id="mnear_"+k, a=document.getElementById(id);
    if(!a){ a=document.createElement("a"); a.id=id; a.href="#"; a.className="mi"; a.dataset.nr=k; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
    a.textContent=k==="am"?T("🏪 편의시설 (편의점·마트)","🏪 Convenience (stores · marts)"):T("🚑 긴급 (병원·약국)","🚑 Emergency (hospital · pharmacy)"); }); }
var f=window.setLang; if(typeof f==="function"&&!f._nr){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); if(document.getElementById("nrBox")) load(); }catch(e){} return r; }; g._nr=1; g._gf=f._gf; g._tr=f._tr; window.setLang=g; }
entries();
window.NEAR={open:open,close:close,state:function(){ return S; }};
var qm=location.search.match(/[?&]near=(am|em)/); if(qm) setTimeout(function(){ open(qm[1]); },300);
})();
