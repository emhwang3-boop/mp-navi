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
  am:{e:"amenity", t:["🏪 편의시설","🏪 Convenience"], tabs:[{c:"CS2",ko:"편의점",en:"Convenience store",i:"🏪",r:1000},{c:"MT1",ko:"마트",en:"Mart",i:"🛒",r:5000},{c:"FX",ko:"환전소",en:"Currency Exchange",i:"",r:2000}]},   // 편의시설은 풀다운 하나 (10-16) · 환전소 = 허브 키워드 검색, 은행 뺌
  em:{e:"emergency", t:["🚑 긴급","🚑 Emergency"], tabs:[{c:"HP8",ko:"병원",en:"Hospital",i:"🏥",r:2000},{c:"PM9",ko:"약국",en:"Pharmacy",i:"💊",r:2000}]},
  // 숙소 (사장님 10-16) — 카카오 숙박(AD5)을 허브가 종류로 나눔 + 관광공사 관광정보에 실린 숙소는 kto=1 (「관광공사」 표시)
  st:{e:"stay", t:["🏨 숙소","🏨 Stay"], tabs:[{c:"AD5",kind:"hotel",ko:"호텔",en:"Hotel",i:"🏨",r:3000},{c:"AD5",kind:"motel",ko:"모텔",en:"Motel",i:"🛏",r:3000},{c:"AD5",kind:"gh",ko:"게스트하우스",en:"Guesthouse",i:"🎒",r:3000},{c:"AD5",kind:"hanok",ko:"한옥스테이",en:"Hanok stay",i:"🏯",r:3000}]}
};
// 칩 글자 (아이콘 없이, 사장님 10-16) · ⋮ 메뉴 글자
var CHIP={am:["편의시설","Convenience"],em:["긴급","Emergency"],st:["숙소","Stay"]};
var MENU={am:["🏪 편의시설 (편의점·마트·환전소)","🏪 Convenience (stores · marts · exchange)"],em:["🚑 긴급 (병원·약국)","🚑 Emergency (hospital · pharmacy)"],st:["🏨 숙소 (호텔·모텔·게스트하우스·한옥)","🏨 Stay (hotel · motel · guesthouse · hanok)"]};
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
  +".nrkto{display:inline-block;border:1px solid #2f9e44;color:#2b8a3e;border-radius:6px;font-size:11px;font-weight:900;padding:0 5px;margin-left:5px;vertical-align:2px;white-space:nowrap}"
  +".nrst .nrtab.on{border-color:#7048e8;background:#f3f0ff;color:#5f3dc4}.nrst .nrrank{background:#7048e8}#gfchips .nrchip.st{border-color:#7048e8;background:#f3f0ff;color:#5f3dc4}.sbox #gfchips>.nrchip.st{order:4}"
  +".nrtabs{flex-wrap:wrap}.nrst .nrtab{flex:1 1 40%}"
  +".nrbook,.item a.nrbook{display:inline-block!important;background:#7048e8!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:7px 16px!important;font-size:14px!important;font-weight:900!important;margin:2px 0 8px!important;cursor:pointer}"
  +"#nrBk{position:fixed;inset:0;z-index:1040;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center}#nrBk .in{background:var(--card);color:var(--ink);width:100%;max-width:480px;border-radius:16px 16px 0 0;padding:14px 16px 22px;box-sizing:border-box}"
  +"#nrBk .h{font-weight:900;font-size:16px;margin:0 0 4px}#nrBk .s{color:var(--sub);font-size:12.5px;margin:0 0 10px}#nrBk a{display:block;text-align:center;text-decoration:none;border:1.5px solid var(--line);border-radius:12px;padding:12px;margin:8px 0;font-weight:900;font-size:15.5px;color:var(--ink);background:var(--bg)}"
  +"#nrBk button{width:100%;border:0;background:none;color:var(--sub);font-size:14px;padding:10px;cursor:pointer}"
  +".nrrank{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#1971c2;color:#fff;font-size:12px;text-align:center;vertical-align:1px}.nrem .nrrank{background:#e03131}"
  +".nrsel{display:block;width:100%;margin:0 0 8px;border:1.5px solid #1971c2;background:#e7f5ff;color:#1864ab;border-radius:12px;padding:10px 12px;font-size:16px;font-weight:800;cursor:pointer;min-height:44px}"
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
function fetchKind(t,p){ var en=L()?"&lang=en":"", key=t.c+(t.kind||"")+"|"+p[0].toFixed(3)+","+p[1].toFixed(3)+en, need=t.c==="HP8"||t.c==="PM9"?10:3;
  var cnt=function(j){ return ((j&&j.items)||[]).filter(function(x){ return !t.kind||x.kind===t.kind; }).length; };
  if(CACHE[key]) return CACHE[key];
  var one=function(r){ return fetch(HUB+"/kplace?cat="+t.c+"&x="+p[1].toFixed(5)+"&y="+p[0].toFixed(5)+"&radius="+r+en).then(function(x){ return x.json(); }); };
  return CACHE[key]=one(t.r).then(function(j){ if(j&&j.ok&&cnt(j)>=need) return j; return one(10000); }).then(function(j){
    if(!j||!j.ok) throw new Error((j&&j.err)||"fail"); return (j.items||[]).filter(function(x){ return !t.kind||x.kind===t.kind; }); },function(e){ delete CACHE[key]; throw e; }).catch(function(e){ delete CACHE[key]; throw e; }); }
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
  return '<div class="nrit" data-nr="pick" data-i="'+i+'"><div class="h"><span class="nrrank">'+(i+1)+'</span><b>'+esc(nm)+(x.kto?'<span class="nrkto" title="'+T("한국관광공사 관광정보에 실린 숙소","Listed by the Korea Tourism Organization")+'">'+T("관광공사","KTO")+'</span>':'')+'</b><i>'+km(x.dist)+'</i></div>'
    +(en?'<div class="ko">'+esc(x.name)+'</div>':'')+'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+'</div>'
    +'<div class="row">'+tel+'<span class="go">'+T("지도에 핀","Pin on map")+' ›</span></div></div>'; }
function paint(){ var b=document.querySelector("#nrBox .nrin"); if(!b||!S.k) return; var k=KINDS[S.k], em=S.k==="em";
  b.className="nrin"+(em?" nrem":"")+(S.k==="st"?" nrst":"");
  var h='<div class="nrtop"><b>'+T(k.t[0],k.t[1])+'</b><button type="button" class="nrx" data-nr="x" aria-label="close">✕</button></div>';
  if(em) h+=sos();
  if(S.k==="am") h+='<select class="nrsel" id="nrSel" aria-label="'+T("종류","Type")+'">'+k.tabs.map(function(t,i){ return '<option value="'+i+'"'+(i===S.tab?' selected':'')+'>'+esc(L()?t.en:t.ko)+'</option>'; }).join("")+'</select>';   // 편의시설 = 풀다운 (사장님 10-16, 이모지 없이)
  else h+='<div class="nrtabs">'+k.tabs.map(function(t,i){ return '<button type="button" class="nrtab'+(i===S.tab?' on':'')+'" data-nr="tab" data-i="'+i+'">'+t.i+' '+esc(L()?t.en:t.ko)+'</button>'; }).join("")+'</div>';
  if(S.err==="loc") h+='<div class="msg">'+T("위치를 받을 수 없습니다 — 폰 설정에서 위치 권한을 켜 주세요. 또는 지도를 보고 싶은 동네로 옮긴 뒤 다시 눌러 주세요.","Could not get your location — please allow location access, or move the map to the area you want and try again.")+'</div><div class="nrbase"><button type="button" class="nrme" data-nr="me">📍 '+T("내 위치 다시 받기","Try my location again")+'</button></div>';
  else if(S.err) h+='<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>';
  else { if(S.base) h+='<div class="nrbase">'+(S.src==="me"?T("📍 내 위치에서 가까운 순","📍 Nearest to you"):T("🗺 지금 보는 지도 가운데에서 가까운 순","🗺 Nearest to the center of the map"))
      +(S.src!=="me"?' <button type="button" class="nrme" data-nr="me">📍 '+T("내 위치로","Use my location")+'</button>':'')+'</div>';
    if(!S.items) h+='<div class="msg">'+T("찾는 중…","Searching…")+'</div>';
    else if(!S.items.length) h+='<div class="msg">'+T("가까운 곳에 없습니다.","None found nearby.")+'</div>';
    else h+=S.items.map(function(x,i){ return itemHtml(x,i,em); }).join(""); }
  b.innerHTML=h; }

// ── 한 곳 고르기 → 기존 검색 핀 ──
function pick(x){ var t=KINDS[S.k].tabs[S.tab]; try{ ntap(t.kind||t.c.toLowerCase(),KINDS[S.k].e); }catch(e){}
  PICK={lat:+x.y,lng:+x.x,em:S.k==="em"}; close();
  spinShow({name:x.name,name_en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||""}); }
// 긴급으로 고른 곳은 카드 맨 위에 큰 「전화」 단추
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._nr){ var sc1=function(){ var r=sc0.apply(this,arguments);
    try{ var p=PLACES.__pin; if(PICK&&PICK.em&&p&&p.tel&&Math.abs(+p.lat-PICK.lat)<1e-6&&Math.abs(+p.lng-PICK.lng)<1e-6){ var it=document.querySelector("#res .item");
      if(it&&!it.querySelector(".nrbig")){ css(); var t=it.querySelector(".t"); var a='<a class="nrbig tel" href="tel:'+esc(telIntl(p.tel))+'">'+PH+T("전화 걸기","Call now")+'</a>'; if(t) t.insertAdjacentHTML("afterend",a); else it.insertAdjacentHTML("afterbegin",a); } } }catch(e){}
    return r; }; sc1._nr=1; sc1._gf=sc0._gf; sc1._tr=sc0._tr; window.spinCard=sc1; }

// ── 「예약하기 / Book」 (사장님 10-16) — 숙소 카드(검색 핀 중 카카오 분류 「숙박」·숙소 칩에서 고른 곳·그림 있는 호텔)에만.
//    누르면 아고다·부킹닷컴·트립닷컴의 그 숙소 이름 검색 화면으로 (새 창). 제휴 코드는 BOOK_AID 한 곳에서 (지금은 없음)
//    검색 주소는 헤드리스로 열어 확인(10-16): 부킹닷컴 searchresults?ss= · 트립닷컴 global-search?keyword= 는 이름만으로 그 호텔이 나옴.
//    아고다는 도시 번호(city)가 있어야 이름 검색이 됨 — 확인한 도시(서울 14690·부산 17172·제주 16901)만 아고다 검색, 그 밖은 구글 「이름 agoda」
var BOOK_AID={agoda:"",booking:"",trip:""};
var AGODA_CITY=[[37.5665,126.978,14690,45],[35.1796,129.0756,17172,40],[33.38,126.55,16901,70]];
function bookUrls(nm,lat,lng){ var q=encodeURIComponent(nm), ag=null;
  AGODA_CITY.forEach(function(c){ if(!ag&&kmLL([lat,lng],[c[0],c[1]])<=c[3]) ag=c[2]; });
  return {agoda:ag?"https://www.agoda.com/search?city="+ag+"&textToSearch="+q+BOOK_AID.agoda:"https://www.google.com/search?q="+encodeURIComponent(nm+" agoda"),
    booking:"https://www.booking.com/searchresults.html?ss="+q+BOOK_AID.booking,
    trip:"https://www.trip.com/global-search/searchlist/search?keyword="+q+BOOK_AID.trip}; }
var BK=null;   // 지금 카드의 숙소 {nm, lat, lng, key}
function isHotelKey(k){ var p=PLACES[k]; return !!p&&(/^h_/.test(k)||k==="shilla"||/호텔/.test(p.ko||"")); }
function bookBtn(info){ var it=document.querySelector("#res .item"); if(!it||it.querySelector(".nrbook")) return; css(); BK=info;
  var a='<a class="nrbook" href="#" data-nrbk="1">🛏 '+T("예약하기","Book")+'</a>', t=it.querySelector(".nrbig")||it.querySelector(".t");
  if(t) t.insertAdjacentHTML("afterend",'<div>'+a+'</div>'); else it.insertAdjacentHTML("afterbegin",a); }
function bookOpen(){ if(!BK) return; var u=bookUrls(BK.nm,BK.lat,BK.lng), o=document.getElementById("nrBk"); if(o) o.remove();
  o=document.createElement("div"); o.id="nrBk";
  o.innerHTML='<div class="in"><div class="h">🛏 '+T("예약하기","Book")+' · '+esc(BK.nm)+'</div><div class="s">'+T("예약 사이트에서 이 숙소 이름으로 찾아 드려요 (새 창)","Opens a search for this place on the booking site (new tab)")+'</div>'
    +'<a href="'+esc(u.agoda)+'" target="_blank" rel="noopener" data-site="agoda">Agoda</a><a href="'+esc(u.booking)+'" target="_blank" rel="noopener" data-site="booking">Booking.com</a><a href="'+esc(u.trip)+'" target="_blank" rel="noopener" data-site="trip">Trip.com</a>'
    +'<button type="button">'+T("닫기","Close")+'</button></div>';
  o.addEventListener("click",function(e){ var a=e.target.closest("a[data-site]");
    if(a){ try{ ntap(a.dataset.site,"book"); ntap(BK.key||"sp_stay","book"); }catch(z){} setTimeout(function(){ o.remove(); },50); return; }
    if(e.target===o||e.target.tagName==="BUTTON") o.remove(); });
  document.body.appendChild(o); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("a[data-nrbk]"); if(!a) return; e.preventDefault(); e.stopPropagation(); bookOpen(); },true);
// 검색 핀 카드 — 카카오 분류에 「숙박」이면
var sc2=window.spinCard; if(typeof sc2==="function"&&!sc2._nrb){ var sc3=function(){ var r=sc2.apply(this,arguments);
    try{ var p=PLACES.__pin; if(p&&/숙박/.test(p.cat||"")) bookBtn({nm:(p.en&&p.en!==p.ko)?p.en:p.ko,lat:+p.lat,lng:+p.lng,key:""}); }catch(e){} return r; };
  for(var _k in sc2) sc3[_k]=sc2[_k]; sc3._nrb=1; window.spinCard=sc3; }
// 그림 있는 호텔 카드
var ps0=window.placeShow; if(typeof ps0==="function"&&!ps0._nrb){ var ps1=function(k){ var r=ps0.apply(this,arguments);
    try{ if(isHotelKey(k)){ var p=PLACES[k]; bookBtn({nm:p.en||p.ko,lat:+p.lat,lng:+p.lng,key:k}); } }catch(e){} return r; };
  for(var _j in ps0) ps1[_j]=ps0[_j]; ps1._nrb=1; window.placeShow=ps1; }
document.addEventListener("change",function(e){ if(e.target&&e.target.id==="nrSel"){ S.tab=+e.target.value; load(); } });
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-nr]"); if(!t||!t.closest("#nrBox,#gfchips,#mm")) return;
  if(e.target.closest("a[href^='tel:']")) return;   // 전화는 그대로 건다
  e.preventDefault(); var g=t.dataset.nr;
  if(g==="am"||g==="em"||g==="st") return open(g);
  if(g==="x") return close();
  if(g==="tab"){ S.tab=+t.dataset.i; load(); return; }
  if(g==="me"){ S.items=null; S.err=""; paint(); myPos().then(function(p){ if(p){ try{ meSet(p); }catch(z){} } load(); }); return; }
  if(g==="pick"){ var x=S.items&&S.items[+t.dataset.i]; if(x) pick(x); } });

// ── 들어가는 곳: 검색창 아래 칩(선물 고르기 옆) · ⋮ 메뉴 ──
function entries(){ css(); var box=document.getElementById("gfchips");
  if(!box){ var h=document.getElementById("gob")||document.getElementById("hint"); if(!h) return; h.insertAdjacentHTML("afterend",'<div id="gfchips" style="display:flex;justify-content:center;gap:6px;margin:10px 0 0;flex-wrap:wrap"></div>'); box=document.getElementById("gfchips"); }
  ["am","em","st"].forEach(function(k){ var c=box.querySelector('.nrchip[data-nr="'+k+'"]'); if(!c){ box.insertAdjacentHTML("beforeend",'<button type="button" class="nrchip'+(k!=="am"?' '+k:'')+'" data-nr="'+k+'"></button>'); c=box.querySelector('.nrchip[data-nr="'+k+'"]'); }
    c.textContent=T(CHIP[k][0],CHIP[k][1]); });
  var mm=document.getElementById("mm"); if(mm) ["am","em","st"].forEach(function(k){ var id="mnear_"+k, a=document.getElementById(id);
    if(!a){ a=document.createElement("a"); a.id=id; a.href="#"; a.className="mi"; a.dataset.nr=k; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
    a.textContent=T(MENU[k][0],MENU[k][1]); }); }
var f=window.setLang; if(typeof f==="function"&&!f._nr){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); if(document.getElementById("nrBox")) load(); }catch(e){} return r; }; g._nr=1; g._gf=f._gf; g._tr=f._tr; window.setLang=g; }
entries();
window.NEAR={open:open,close:close,state:function(){ return S; }};
var qm=location.search.match(/[?&]near=(am|em)/); if(qm) setTimeout(function(){ open(qm[1]); },300);
})();
