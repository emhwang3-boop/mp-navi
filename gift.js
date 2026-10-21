/* 머니퍼즐 내비 — 「🎁 선물 고르기 / Gift finder」 (사장님 2026-10-16) · 무료 기능(유입용)
 *  누구에게 → 예산 → 종류 카드(누구·예산에 맞춰 순서·한 줄 설명) → 매장 2~4곳 → 누르면 검색 핀 카드(전화·길찾기·「＋ 내 여행에 담기」는 trip.js 가 붙임)
 *  · 근처 가게 (사장님 10-21 「카카오와 구글 둘 다」): 손님 기준 위치(near.js 와 같은 규칙 — 「나」, 없으면 지금 보는 지도 가운데)에서 종류별 찾는 말(gifts.json q)로
 *    허브 GET /gshop (카카오 키워드 + 구글 Text Search 를 허브가 합침, 3km → 모자라면 10km → 30km, 10km 넘으면 「약 25 km」) → 거리순 | 별점순 (구글) · 10곳 · 「★ 4.5 (361)」
 *    근처에 하나도 없으면 「근처에 없습니다」 + 고정 매장(stores)을 「서울 대표 매장」으로. 구글은 종류 카드의 「근처 가게 보기」를 누를 때만 부른다(비용)
 *  · 이 지역 특산물 (사장님 10-21): gifts.json local — at.reg(regions.json 약도 bb 안) 또는 at.ll(둘레 km) 에 손님 기준 위치가 들면 종류 맨 위에. 사서 가져가는 것만
 *  · 자료는 data/gifts.json (원본 navi_build\src\gifts.json, build_navi.py 가 검사·배포). 매장은 카카오 로컬(허브 /kplace)로 확인한 곳만
 *  · 팁 줄은 공식 안내로 확인한 문장만 (출처는 gifts.json tips[].src)
 *  · 제휴 가게 광고: 허브 GET /npartner?x=&y=&r= (공개, 광고 기간 안의 것만) 에서 종류별 업종 코드(cosme.* / shop.*)만 골라 맨 위에 「광고 / Ad」
 *  · 누름 집계: ntap(키, "gift") — 키는 종류 코드·매장 키·제휴 id 뿐 (개인정보 없음)
 *  index.html 은 <script src="gift.js"> 한 줄뿐 — 전역 함수(spinShow·placeShow·spinGo·meBest·mapLoad·setLang·ntap·T·esc)를 부른다
 */
(function(){
"use strict";
var G=null, GP=null, S={who:"",bud:"",base:null,src:"",bst:"",ord:"d"}, ADS={}, NB={}, OPEN={};
function L(){ return window.LANG!=="ko"; }   // 외국어 화면 (10-18)
function t2(a){ return LP(a); }   // [한, 영, 일, 简, 繁]
function nm(o){ return LN(o); }
function load(){ return GP||(GP=fetch("data/gifts.json?v="+(window.NAVI_V||"")).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){ G=j; return j; },function(e){ GP=null; throw e; })); }

// ── 순서: 누구 점수 + 예산 점수 (어느 쪽이든 0 이면 뺀다) ──
function ranked(){ if(!G) return []; var w=S.who, b=S.bud;
  return G.kinds.map(function(k,i){ return {k:k,i:i,s:(k.w[w]||0)+(k.b[b]||0),z:!(k.w[w]>0&&k.b[b]>0)}; })
    .filter(function(x){ return !x.z; }).sort(function(a,b2){ return b2.s-a.s||a.i-b2.i; }).map(function(x){ return x.k; }); }

// ── 근처 가게 (사장님 10-21) ──
// 다섯 언어 글자 [한, 영, 일, 简, 繁]
var W5={
  near:["📍 근처 가게 보기","📍 Shops near you","📍 近くのお店を見る","📍 查看附近店铺","📍 查看附近店家","📍 Tiendas cerca de ti"],
  hide:["접기","Hide","閉じる","收起","收起","Ocultar"],
  dist:["거리순","Nearest","近い順","距离优先","距離優先","Más cercanas"],
  rate:["별점순 (구글)","Top rated (Google)","評価順（Google）","评分优先（Google）","評分優先（Google）","Mejor valoradas (Google)"],
  bme:["📍 내 위치에서 가까운 순 (비슷한 거리는 별점순)","📍 Nearest to you (similar distance: higher rating first)","📍 現在地から近い順（同じくらいの距離なら評価順）","📍 离我最近（距离相近时按评分）","📍 離我最近（距離相近時依評分）","📍 Más cerca de ti (a distancia similar, primero las mejor valoradas)"],
  bmap:["🗺 지금 보는 지도 가운데에서 가까운 순","🗺 Nearest to the center of the map","🗺 表示中の地図の中心から近い順","🗺 离当前地图中心最近","🗺 離目前地圖中心最近","🗺 Más cerca del centro del mapa"],
  r3:["⭐ 3km 안 구글 별점 높은 순","⭐ Highest Google rating within 3 km","⭐ 3km以内でGoogle評価が高い順","⭐ 3公里内 Google 评分最高","⭐ 3公里內 Google 評分最高","⭐ Mejor valoración en Google a menos de 3 km"],
  r10:["⭐ 10km 안 구글 별점 높은 순","⭐ Highest Google rating within 10 km","⭐ 10km以内でGoogle評価が高い順","⭐ 10公里内 Google 评分最高","⭐ 10公里內 Google 評分最高","⭐ Mejor valoración en Google a menos de 10 km"],
  r30:["⭐ 30km 안 구글 별점 높은 순","⭐ Highest Google rating within 30 km","⭐ 30km以内でGoogle評価が高い順","⭐ 30公里内 Google 评分最高","⭐ 30公里內 Google 評分最高","⭐ Mejor valoración en Google a menos de 30 km"],
  far:["가까운 곳(10km 안)에 없어 30km 안에서 찾았습니다.","None within 10 km — showing shops within 30 km.","10km以内にないため、30km以内で探しました。","10公里内没有，已在30公里内查找。","10公里內沒有，已在30公里內搜尋。","No hay ninguna a menos de 10 km — se muestran tiendas a menos de 30 km."],
  abt:["약 "," about ","約","约","約"," unos "],
  useme:["📍 내 위치로","📍 Use my location","📍 現在地にする","📍 用我的位置","📍 用我的位置","📍 Usar mi ubicación"],
  srch:["찾는 중…","Searching…","検索中…","正在查找…","正在搜尋…","Buscando…"],
  none:["근처에 없습니다.","None found nearby.","近くにありません。","附近没有。","附近沒有。","No se encontró nada cerca."],
  err:["잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Vuelve a intentarlo en un momento."],
  loc:["위치를 받을 수 없습니다 — 위치 권한을 켜거나, 지도를 보고 싶은 동네로 옮긴 뒤 다시 눌러 주세요.","Could not get your location — allow location access, or move the map to the area you want and try again.","現在地を取得できません — 位置情報を許可するか、地図を見たい地域に動かしてからもう一度押してください。","无法获取位置 — 请开启定位权限，或把地图移到想看的地区后再点一次。","無法取得位置 — 請開啟定位權限，或把地圖移到想看的地區後再按一次。","No se pudo obtener tu ubicación — permite el acceso a la ubicación o mueve el mapa a la zona que quieras e inténtalo de nuevo."],
  seoul:["서울 대표 매장","Seoul flagship stores","ソウルの代表店","首尔代表门店","首爾代表門市","Tiendas principales en Seúl"],
  local:["📍 이 지역 특산물","📍 Local specialties here","📍 この地域の特産品","📍 本地特产","📍 本地特產","📍 Productos típicos de esta zona"],
  map:["지도","Map","地図","地图","地圖","Mapa"]
};
function W(k){ return LP(W5[k]); }
// 기준 위치 — near.js pickBase 와 같은 규칙 (그 코드를 옮겨 씀, near.js 는 그대로)
function mapCenter(){ try{
    if(window.DET&&window._nm){ var c=_nm.getCenter(); return [c.lat(),c.lng()]; }
    if(VIEW&&VIEW!=="kr"&&CITY[VIEW]){ var m=document.getElementById("map"), w=m.clientWidth, h=m.clientHeight||w, as=ASP(), iw=w*as*ZM.s, ih=w*ZM.s; return meGeoInv(VIEW,(w/2-ZM.tx)/iw,(h/2-ZM.ty)/ih); }
  }catch(e){} return null; }
function pickBase(force){
  if(ME.pos&&!force) return Promise.resolve({p:ME.pos,src:"me"});
  var c=force?null:mapCenter(); if(c) return Promise.resolve({p:c,src:"map"});
  return myPos().then(function(p){ if(p){ try{ if(!ME.pos) meSet(p); }catch(e){} return {p:p,src:"me"}; } return null; }); }
// 선물 고르기를 열 때마다 기준 위치를 한 번 정한다 (보는 동안은 그대로)
function baseGo(force){ S.bst="ld"; NB={}; return pickBase(force).then(function(b){ if(b){ S.base=b.p; S.src=b.src; S.bst="ok"; } else { S.base=null; S.bst="no"; } paint(); },function(){ S.base=null; S.bst="no"; paint(); }); }
function kmT(m){ return m<1000?m+" m":m<10000?(m/1000).toFixed(1)+" km":W("abt").trim()+(LANG==="ko"||LANG==="en"||LANG==="es"?" ":"")+Math.round(m/1000)+" km"; }   // 10km 넘으면 「약 25 km」 (10-21 2차)
function KM(a,b){ var R=6371, rd=Math.PI/180, x=(b[0]-a[0])*rd, y=(b[1]-a[1])*rd, h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a[0]*rd)*Math.cos(b[0]*rd)*Math.sin(y/2)*Math.sin(y/2); return 2*R*Math.asin(Math.sqrt(h)); }
// 이 지역 특산물 — at.reg: regions.json 약도 bb 안 · at.ll: [위도, 경도, km] 둘레 안. 가까운 것 먼저 3개까지
function localKinds(){ if(!G||!G.local||!S.base) return []; var p=S.base;
  return G.local.map(function(k,i){ var a=k.at||{}, ok=false, d=0;
      (a.reg||[]).forEach(function(id){ var b=CITY[id]&&CITY[id].bb; if(b&&p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3]) ok=true; });
      if(a.ll){ d=KM(p,a.ll); if(d<=a.ll[2]) ok=true; }
      return ok?{k:k,d:d,i:i}:null; }).filter(Boolean).sort(function(x,y){ return x.d-y.d||x.i-y.i; }).slice(0,3).map(function(x){ return x.k; }); }
function findK(c){ return ((G&&G.kinds)||[]).concat((G&&G.local)||[]).filter(function(x){ return x.c===c; })[0]; }
function nbKey(k){ return k.c+"|"+LANG+"|"+S.base[0].toFixed(3)+","+S.base[1].toFixed(3); }
function nbLoad(k){ if(!S.base) return; var key=nbKey(k); if(NB[key]) return; var q=k.q||{}, b=S.base, my=key;
  NB[key]={st:"ld"};
  var u=HUB+"/gshop?lat="+b[0].toFixed(5)+"&lng="+b[1].toFixed(5)+"&lang="+encodeURIComponent(LANG)+"&kq="+encodeURIComponent((q.kq||[]).join("|"))
    +(q.kc?"&kc="+q.kc:"")+(q.kk?"&kk="+encodeURIComponent(q.kk):"")+(q.kx?"&kx="+encodeURIComponent(q.kx):"")+(q.gq?"&gq="+encodeURIComponent(q.gq):"")+(q.gt?"&gt="+q.gt:"");
  fetch(u).then(function(r){ return r.json(); }).then(function(j){ if(!j||!j.ok) throw new Error((j&&j.err)||"fail");
      NB[my]={st:"ok",r:j.r||3000,items:(j.items||[]).map(function(x){ var o=Object.assign({},x); o.dist=Math.round(KM(b,[+x.y,+x.x])*1000); return o; })}; paint(); })
    .catch(function(){ NB[my]={st:"err"}; paint(); }); }
// 차례 — 음식점 목록(near.js sortIt)과 같은 규칙: 거리순 = 200m 칸 → 리뷰 10개↑ 먼저 → 별점 → 리뷰 수 · 별점순 = 리뷰 10개↑ 먼저 → 별점 → 리뷰 수
function nbSort(it){ it=it.slice();
  if(S.ord==="r") return it.sort(function(a,c){ var ta=(a.n||0)>=10?1:0, tc=(c.n||0)>=10?1:0; if(ta!==tc) return tc-ta; if((c.rating||0)!==(a.rating||0)) return (c.rating||0)-(a.rating||0); if((c.n||0)!==(a.n||0)) return (c.n||0)-(a.n||0); return a.dist-c.dist; });
  return it.sort(function(a,c){ var ba=Math.floor(a.dist/200), bc=Math.floor(c.dist/200); if(ba!==bc) return ba-bc; var ta=(a.n||0)>=10?1:0, tc=(c.n||0)>=10?1:0; if(ta!==tc) return tc-ta; if((c.rating||0)!==(a.rating||0)) return (c.rating||0)-(a.rating||0); if((c.n||0)!==(a.n||0)) return (c.n||0)-(a.n||0); return a.dist-c.dist; }); }
function nbList(k){ var d=S.base&&NB[nbKey(k)]; return d&&d.st==="ok"?nbSort(d.items).slice(0,10):[]; }
function seoulHtml(k){ if(!k.stores||!k.stores.length) return "";
  return '<div class="gfsl">'+W("seoul")+'</div>'+k.stores.map(function(s,j){ return '<button type="button" class="gfs" data-gf="s" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b>📍 '+esc(nm(s))+'</b><i>'+esc(s.area?t2(s.area):"")+'</i><span class="go">'+W("map")+' ›</span></button>'; }).join(""); }
function nbItem(k,x,i){ var fl=L()&&x.name_l, n=fl?x.name_l:x.name, ad=fl?(x.addr_l||x.addr):x.addr, ct=fl?(x.cat_l||""):String(x.cat||"").split(">").pop().trim();
  return '<button type="button" class="gfn" data-gf="n" data-kc="'+esc(k.c)+'" data-j="'+i+'"><div class="h"><span class="gfnr">'+(i+1)+'</span><b>'+esc(n)+'</b><i>'+kmT(x.dist)+'</i></div>'
    +(fl&&x.name_l!==x.name?'<div class="ko">'+esc(x.name)+'</div>':'')
    +(x.rating?'<div class="d"><b class="st">★ '+(+x.rating).toFixed(1)+'</b> ('+(x.n||0)+')</div>':'')
    +'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+'</div><div class="d"><span class="go">'+W("map")+' ›</span></div></button>'; }
function nbHtml(k){ if(!OPEN[k.c]) return '<button type="button" class="gfnb" data-gf="nb" data-kc="'+esc(k.c)+'">'+W("near")+'</button>';
  var h='<div class="gfnbox"><button type="button" class="gfnx" data-gf="nbx" data-kc="'+esc(k.c)+'">'+W("hide")+' ▴</button>';
  if(S.bst!=="ok"&&S.bst!=="no") return h+'<div class="msg">'+W("srch")+'</div></div>';
  if(S.bst==="no") return h+'<div class="msg">'+W("loc")+'</div><div class="gfbase"><button type="button" class="gfme" data-gf="me">'+W("useme")+'</button></div>'+seoulHtml(k)+'</div>';
  var d=NB[nbKey(k)]; if(!d){ nbLoad(k); d=NB[nbKey(k)]; }
  if(d.st==="ld") return h+'<div class="msg">'+W("srch")+'</div></div>';
  if(d.st==="err") return h+'<div class="msg">'+W("err")+'</div>'+seoulHtml(k)+'</div>';
  var it=nbList(k), rr=S.ord==="r";
  if(!it.length) return h+'<div class="msg">'+W("none")+'</div>'+seoulHtml(k)+'</div>';
  h+='<div class="gford"><button type="button" data-gf="ord" data-o="d" class="'+(rr?'':'on')+'">'+W("dist")+'</button><button type="button" data-gf="ord" data-o="r" class="'+(rr?'on':'')+'">'+W("rate")+'</button></div>';
  h+='<div class="gfbase">'+(rr?W(d.r>10000?"r30":d.r>3000?"r10":"r3"):W(S.src==="me"?"bme":"bmap"))+(S.src!=="me"?' <button type="button" class="gfme" data-gf="me">'+W("useme")+'</button>':'')+'</div>'+(d.r>10000?'<div class="gfbase">'+W("far")+'</div>':'');
  return h+it.map(function(x,i){ return nbItem(k,x,i); }).join("")+'</div>'; }
function nbPick(k,j){ var x=nbList(k)[j]; if(!x) return; try{ ntap(k.c,"gift"); }catch(e){} close();
  var fl=x.name_l&&L();
  spinShow({name:x.name,name_en:fl?x.name_l:x.name,addr:x.addr||"",addr_en:fl?(x.addr_l||x.addr||""):(x.addr||""),y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:fl?(x.cat_l||""):"",_l:fl?LANG:"ko"}); }

// ── 제휴 가게 (광고) — 허브 「npartner」 공개 조회. 없거나 실패하면 그냥 빈칸 ──
function adsFor(k){ if(ADS[k.c]) return ADS[k.c];
  var st=k.stores, x=st.reduce(function(s,a){ return s+a.lng; },0)/st.length, y=st.reduce(function(s,a){ return s+a.lat; },0)/st.length, pre=k.ad||[];
  return ADS[k.c]=fetch(HUB+"/npartner?x="+x.toFixed(5)+"&y="+y.toFixed(5)+"&r=2000").then(function(r){ return r.json(); }).then(function(j){
    return ((j&&j.ok&&j.items)||[]).filter(function(it){ var c=String(it.cat||""); return pre.some(function(p){ return c===p||c.indexOf(p+".")===0; }); }).slice(0,2); })
    .catch(function(){ return []; }); }
window.giftAds=adsFor;   // 자리 함수 (10-16): 제휴 가게 칸이 비어 있으면 [] — 광고가 들어오면 그대로 뜬다

// ── 화면 ──
function css(){ if(document.getElementById("gfCss")) return; var s=document.createElement("style"); s.id="gfCss";
  s.textContent="#gfchips{display:flex;justify-content:center;gap:6px;margin:10px 0 0;flex-wrap:wrap}"
  +"#gfchips .gfchip{display:inline-block;width:auto;margin:0;border:1.5px solid #f08c00;background:#fff9db;color:#c2410c;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:none}"
  +".gflock,.gflock body{overflow:hidden}#gfBox{position:fixed;inset:0;z-index:1036;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}"
  +"#gfBox .gfin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px;box-sizing:border-box}"
  +".gftop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin-bottom:6px}.gfq{font-weight:900;margin:14px 2px 8px;font-size:15px}"
  +".gfopts{display:flex;flex-wrap:wrap;gap:8px}.gfopt{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:9px 13px;font-size:14.5px;font-weight:800;cursor:pointer}"
  +".gfopt.on{border-color:#e8590c;background:#fff4e6;color:#c2410c}"
  +".gfk{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0}.gfk .h{font-weight:900;font-size:16.5px}.gfk .d{color:var(--sub);font-size:13.5px;margin:3px 0 4px;line-height:1.5}"
  +".gfk .n{font-size:13px;color:#c2410c;font-weight:800;margin:2px 0 6px}.gfrank{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#e8590c;color:#fff;font-size:12px;text-align:center;margin-right:6px;vertical-align:2px}"
  +".gfs{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:9px 2px;font-size:14.5px;cursor:pointer}"
  +".gfs b{flex:1}.gfs i{font-style:normal;color:var(--sub);font-size:12.5px;white-space:nowrap}.gfs .go{color:#1a73e8;font-weight:800;font-size:13px;white-space:nowrap}"
  +".gfad{display:inline-block;border:1px solid #f59f00;color:#e67700;border-radius:6px;font-size:11px;font-weight:900;padding:0 5px;margin-right:4px}"
  +".gftips{margin-top:18px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 14px}.gftips .h{font-weight:900;margin:2px 0 4px}"
  +".gftip{font-size:13.5px;line-height:1.55;padding:6px 0;border-top:1px solid var(--line)}.gftip:first-of-type{border-top:0}.gftip a{color:var(--sub);font-size:11.5px;margin-left:4px}"
  +".gfdfs{margin:0 2px 4px}.gfrs{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:6px 13px;font-size:13.5px;font-weight:800;cursor:pointer;margin:2px 0 0}"
  +".gfdb{border:1px solid #1a73e8;background:#fff;color:#1a73e8;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}[data-theme=dark] .gfdb{background:transparent}"
  +".gfx{width:34px;height:34px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}"
  +".gfnb{display:block;width:100%;margin:6px 0 0;border:1.5px solid #1c5fb8;background:#fff;color:#1c5fb8;border-radius:12px;padding:9px 12px;font-size:14.5px;font-weight:800;cursor:pointer}[data-theme=dark] .gfnb{background:transparent}"
  +".gfnbox{border-top:1px solid var(--line);margin-top:6px;padding-top:4px}.gfnx{float:right;border:0;background:none;color:var(--sub);font-size:13px;font-weight:800;cursor:pointer;padding:4px 2px}"
  +".gford{display:flex;gap:6px;margin:8px 0 2px;clear:both}.gford button{flex:1;border:1px solid #c5d3e8;background:#fff;color:#1c5fb8;border-radius:999px;padding:7px 0;font-weight:800;font-size:14px;cursor:pointer}.gford button.on{background:#1c5fb8;color:#fff;border-color:#1c5fb8}"
  +".gfbase{color:var(--sub);font-size:12.5px;margin:6px 2px;clear:both}.gfme{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:3px 10px;font-size:12.5px;font-weight:800;cursor:pointer;margin-left:4px}"
  +".gfn{display:block;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:9px 2px;cursor:pointer;font-size:14.5px}.gfn .h{display:flex;align-items:center;gap:6px}.gfn .h b{flex:1}.gfn .h i{font-style:normal;color:var(--sub);font-size:12.5px;white-space:nowrap}"
  +".gfn .ko{color:var(--sub);font-size:12.5px;margin:1px 0 0 26px}.gfn .d{color:var(--sub);font-size:12.5px;margin:2px 0 0 26px;line-height:1.45}.gfn .st{color:#e8590c}.gfn .go{color:#1a73e8;font-weight:800;font-size:13px}"
  +".gfnr{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#1971c2;color:#fff;font-size:12px;text-align:center}.gfsl{font-weight:900;font-size:13px;color:var(--sub);margin:8px 2px 0}"
  +".gflh{font-weight:900;font-size:15px;margin:14px 2px 4px;color:#c2410c}.gfk.gfl{border-color:#f3c99b}";
  document.head.appendChild(s); }
function open(){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  var o=document.getElementById("gfBox"); if(!o){ o=document.createElement("div"); o.id="gfBox"; o.innerHTML='<div class="gfin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("gflock"); try{ ntap("_gift","gift"); }catch(e){}
  OPEN={}; S.bst="";
  paint(); load().then(paint,function(){ var b=o.querySelector(".gfin"); if(b) b.insertAdjacentHTML("beforeend",'<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>'); }); }
function close(){ var o=document.getElementById("gfBox"); if(o) o.remove(); document.documentElement.classList.remove("gflock"); }
function opt(kind,c,label,on){ return '<button type="button" class="gfopt'+(on?' on':'')+'" data-gf="'+kind+'" data-c="'+esc(c)+'">'+label+'</button>'; }
function paint(){ var b=document.querySelector("#gfBox .gfin"); if(!b) return;
  var h='<div class="gftop"><b>'+T("🎁 선물 고르기","🎁 Gift finder")+'</b><button type="button" class="gfx" data-gf="x" aria-label="close">✕</button></div>';
  if(!G){ b.innerHTML=h+'<div class="msg">'+T("불러오는 중…","Loading…")+'</div>'; return; }
  if(S.who) h+='<button type="button" class="gfrs" data-gf="rs">'+T("↺ 처음부터 다시","↺ Start over")+'</button>';
  h+='<div class="gfq">1. '+T("누구에게 주나요?","Who is it for?")+'</div><div class="gfopts">'+G.who.map(function(x){ return opt("w",x.c,(x.i?x.i+" ":"")+esc(nm(x)),S.who===x.c); }).join("")+'</div>';
  if(S.who) h+='<div class="gfq">2. '+T("예산은요? (1개 기준)","Budget? (per gift)")+'</div><div class="gfopts">'+G.budget.map(function(x){ return opt("b",x.c,esc(nm(x)),S.bud===x.c); }).join("")+'</div>';
  if(S.who&&S.bud){ var R=ranked();
    if(!S.bst) setTimeout(function(){ baseGo(false); },0);
    h+='<div class="gfq">3. '+T("이런 선물을 추천해요","Our picks for you")+'</div>'+dfsHtml();
    var LK=localKinds(); if(LK.length) h+='<div class="gflh">'+W("local")+'</div>'+LK.map(function(k){ return '<div class="gfk gfl" data-kc="'+esc(k.c)+'"><div class="h">'+k.i+' '+esc(nm(k))+'</div><div class="d">'+esc(LD(k))+'</div>'+nbHtml(k)+'</div>'; }).join("");
    h+=R.map(function(k,i){ var n=[k.note&&k.note[S.who],k.note&&k.note[S.bud]].filter(Boolean).map(function(a){ return '<div class="n">👉 '+esc(t2(a))+'</div>'; }).join("");
      return '<div class="gfk" data-kc="'+esc(k.c)+'"><div class="h"><span class="gfrank">'+(i+1)+'</span>'+k.i+' '+esc(nm(k))+'</div><div class="d">'+esc(LD(k))+'</div>'+n
        +'<div class="gfads"></div>'+nbHtml(k)+'</div>'; }).join("");
    h+=tips(); }
  b.innerHTML=h;
  if(S.who&&S.bud) ranked().forEach(function(k){ adsFor(k).then(function(ads){ var box=b.querySelector('.gfk[data-kc="'+k.c+'"] .gfads'); if(!box||!ads.length) return;
    box.innerHTML=ads.map(function(a,j){ return '<button type="button" class="gfs" data-gf="a" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b><span class="gfad">'+T("광고","Ad")+'</span>'+esc(L()?(a.en||a.ko):a.ko)+'</b><i>'+(a.dist!=null?(a.dist<1000?a.dist+" m":(a.dist/1000).toFixed(1)+" km"):"")+'</i><span class="go">'+T("지도","Map")+' ›</span></button>'; }).join(""); box._ads=ads; }); }); }
// 면세점은 목록 대신 검색으로 (사장님 10-16) — 기존 검색 흐름(go) 그대로, 결과를 누르면 검색 핀
function dfsHtml(){ return '<div class="gfdfs"><button type="button" class="gfdb" data-gf="dfs">'+T("🔎 면세점","🔎 Duty-free shops")+'</button></div>'; }
function dfsGo(){ close(); var q=document.getElementById("q"); if(q){ q.value=T("면세점","duty free"); try{ qxSync(); }catch(e){} } try{ ntap("_dfs","gift"); }catch(e){}
  go("면세점"); var r=document.getElementById("res"); if(r) setTimeout(function(){ window.scrollTo({top:r.getBoundingClientRect().top+scrollY-80,behavior:"smooth"}); },100); }
function tips(){ if(!G.tips||!G.tips.length) return "";
  return '<div class="gftips"><div class="h">'+T("💡 사기 전에","💡 Before you buy")+'</div>'+G.tips.map(function(x){ var u=String(x.src||"").split(" · ")[0];
    return '<div class="gftip">'+esc(nm(x))+(/^https:\/\//.test(u)?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+T("출처","source")+'</a>':'')+'</div>'; }).join("")+'</div>'; }

// 매장 이름을 다섯 언어 모두 핀에 넘긴다 — 핀 카드에서 언어를 바꿔도 그 자리에서 그 언어 이름 (lang.js, 10-18)
function gLL(s,ad){ var o={}; ["en","ja","zhs","zht","es"].forEach(function(l){ var n=l==="en"?s.en:(s[l]||s.en); if(!n) return; o[l]={n:n,a:s.addr_en||s.addr||"",c:ad?TEL(l,"Shop (Ad)"):((l!=="en"&&s["cat_"+l])||s.cat_en||"")}; }); return o; }
function TEL(l,e){ if(l==="en") return e; var t=(window.I18N&&I18N[l])||{}; return t[e]||e; }
// ── 매장 누르기 → 약도 핀 + 카드 ──
function showStore(s){ close();
  if(s.place){ Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){ var p=PLACES[s.place];
      if(!p) return spinShow({name:s.ko,name_en:(LANG!=="en"&&s[LANG])||s.en,addr:s.addr,addr_en:s.addr_en,y:s.lat,x:s.lng,tel:s.tel||"",cat:s.cat||"",cat_en:(LANG!=="en"&&s["cat_"+LANG])||s.cat_en||"",_l:LANG,LL:gLL(s)});
      var id0=meBest(+p.lat,+p.lng)||NAVI_ROOT; if(DET){ try{ _nm.setCenter(new naver.maps.LatLng(+p.lat,+p.lng)); }catch(e){} } else spinGo(id0===NAVI_ROOT?"kr":id0,+p.lat,+p.lng,null);
      placeShow(s.place); var m=document.getElementById("map"); if(m) window.scrollTo({top:m.getBoundingClientRect().top+scrollY-70,behavior:"smooth"}); }); return; }
  spinShow({name:s.ko,name_en:(LANG!=="en"&&s[LANG])||s.en,addr:s.addr,addr_en:s.addr_en||s.addr,y:s.lat,x:s.lng,tel:s.tel||"",cat:s.cat||"",cat_en:(LANG!=="en"&&s["cat_"+LANG])||s.cat_en||"",_l:LANG,LL:gLL(s)}); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-gf]"); if(!t||!t.closest("#gfBox,#gfchips,#mm")) return; e.preventDefault();
  var g=t.dataset.gf, k;
  if(g==="open") return open();
  if(g==="x") return close();
  if(g==="dfs") return dfsGo();
  if(g==="rs"){ S.who=""; S.bud=""; OPEN={}; paint(); var bx=document.getElementById("gfBox"); if(bx) bx.scrollTop=0; return; }
  if(g==="w"){ S.who=t.dataset.c; S.bud=S.bud||""; paint(); return; }
  if(g==="b"){ S.bud=t.dataset.c; paint(); var q=document.querySelectorAll("#gfBox .gfq"); if(q[2]) q[2].scrollIntoView({behavior:"smooth",block:"start"}); return; }
  if(g==="nb"){ OPEN[t.dataset.kc]=1; paint(); return; }
  if(g==="nbx"){ delete OPEN[t.dataset.kc]; paint(); return; }
  if(g==="ord"){ S.ord=t.dataset.o==="r"?"r":"d"; paint(); return; }
  if(g==="me"){ baseGo(true); paint(); return; }
  if(g==="n"){ k=findK(t.dataset.kc); if(k) nbPick(k,+t.dataset.j); return; }
  if(g==="s"||g==="a"){ k=G.kinds.filter(function(x){ return x.c===t.dataset.kc; })[0]; if(!k) return; try{ ntap(k.c,"gift"); }catch(z){}
    if(g==="s"){ var s=k.stores[+t.dataset.j]; if(!s) return; try{ ntap(s.k,"gift"); }catch(z){} showStore(s); return; }
    var box=t.closest(".gfads"), a=box&&box._ads&&box._ads[+t.dataset.j]; if(!a) return; try{ ntap(a.id,"gift"); }catch(z){}
    close(); spinShow({name:a.ko,name_en:(LANG!=="en"&&a[LANG])||a.en||a.ko,addr:a.addr||"",addr_en:a.addr||"",y:a.lat,x:a.lng,tel:a.tel||"",cat:"쇼핑",cat_en:T("쇼핑 (광고)","Shop (Ad)"),_l:LANG,LL:gLL(a,1)}); } });

// ── 들어가는 곳: 검색창 아래 칩 · ⋮ 메뉴 ──
function entries(){ var h=document.getElementById("gob")||document.getElementById("hint");
  if(h&&!document.getElementById("gfchips")){ css(); h.insertAdjacentHTML("afterend",'<div id="gfchips"><button type="button" class="gfchip" data-gf="open"></button></div>'); }
  var c=document.querySelector("#gfchips .gfchip"); if(c) c.textContent=T("선물 고르기","Gift finder");   // 칩은 글자만 (사장님 10-16), ⋮ 메뉴는 아이콘 그대로
  var mm=document.getElementById("mm"); if(mm){ var a=document.getElementById("mgift"); if(!a){ a=document.createElement("a"); a.id="mgift"; a.href="#"; a.className="mi"; a.dataset.gf="open"; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); } a.textContent=T("🎁 선물 고르기","🎁 Gift finder"); } }
var DFS_TEL=[[/신라아이파크|HDC\s*신라/,"1688-8800"],[/롯데면세점/,"1688-3000"],[/신라면세점/,"1688-1110"],[/신세계면세점/,"1661-8778"],[/현대(백화점)?면세점/,"1811-6688"],[/동화면세점/,"02-399-3000"]];
function dfsTel(ko){ for(var i=0;i<DFS_TEL.length;i++) if(DFS_TEL[i][0].test(ko||"")) return DFS_TEL[i][1]; return ""; }
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._gf){ var sc1=function(){ try{ var p=PLACES.__pin; if(p&&!p.tel){ var t=dfsTel(p.ko); if(t) p.tel=t; } }catch(e){} return sc0.apply(this,arguments); }; sc1._gf=1; sc1._tr=sc0._tr; window.spinCard=sc1; }
var f=window.setLang; if(typeof f==="function"&&!f._gf){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); paint(); }catch(e){} return r; }; g._gf=1; g._tr=f._tr; window.setLang=g; }
entries();
window.GIFT={open:open,close:close,state:function(){ return S; },data:function(){ return G; },nb:function(){ return NB; }};
if(/[?&]gift=1/.test(location.search)) setTimeout(open,300);
})();
