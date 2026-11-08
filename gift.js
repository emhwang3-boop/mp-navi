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
var WICON={near:"mi_pin",bme:"mi_pin",bmap:"mi_map",r3:"mi_star",r10:"mi_star",r30:"mi_star",useme:"mi_pin",local:"mi_pin"};   // 앞 이모지를 떼고 그림 아이콘을 붙인다 (6개 언어 한 번에, 사장님 10-24)
function WI(k){ return WICON[k]?MPICO(WICON[k],W(k),MIS):W(k); }
// 누구에게·종류·특산물 이모지 → 그림 아이콘 (나노바나나, 사장님 10-28) — gifts.json 의 i(이모지)는 그대로 두고 코드(c)로 그림을 고른다. 없으면 이모지
var GIC={family:"mi_g_family",friend:"mi_g_friend",coworker:"mi_g_coworker",kid:"mi_g_kid",self:"mi_g_self",
  cosme:"mi_g_cosme",ginseng:"mi_g_ginseng",snack:"mi_g_snack",craft:"mi_g_craft",muds:"mi_g_muds",kpop:"mi_g_kpop",hanbok:"mi_g_hanbok",tea:"mi_g_tea",chara:"mi_g_chara",stationery:"mi_g_stationery",
  l_jeju_gyul:"mi_g_gyul",l_jeju_omegi:"mi_g_omegi",l_jeju_choco:"mi_g_jejuchoco",l_gj_bread:"mi_g_gjbread",l_bs_eomuk:"mi_g_eomuk",l_gn_coffee:"mi_g_coffee",l_ca_hodu:"mi_g_hodu",l_jj_choco:"mi_g_chocopie",l_ty_kkul:"mi_g_kkulppang",l_ad_fish:"mi_g_mackerel",l_ys_gat:"mi_g_gatkimchi"};
function GI(o){ var n=GIC[o.c]; return n?MPIMG(n,MIS):(o.i?o.i+" ":""); }
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
  return '<div class="gfsl">'+W("seoul")+'</div>'+k.stores.map(function(s,j){ return '<button type="button" class="gfs" data-gf="s" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b>'+MPICO("mi_pin",nm(s),MIS)+'</b><i>'+esc(s.area?t2(s.area):"")+'</i><span class="go">'+W("map")+' ›</span></button>'; }).join(""); }
function nbItem(k,x,i){ var fl=L()&&x.name_l, n=fl?x.name_l:x.name, ad=fl?(x.addr_l||x.addr):x.addr, ct=fl?(x.cat_l||""):String(x.cat||"").split(">").pop().trim();
  return '<button type="button" class="gfn" data-gf="n" data-kc="'+esc(k.c)+'" data-j="'+i+'"><div class="h"><span class="gfnr">'+(i+1)+'</span><b>'+esc(n)+'</b><i>'+kmT(x.dist)+'</i></div>'
    +(fl&&x.name_l!==x.name?'<div class="ko">'+esc(x.name)+'</div>':'')
    +(x.rating?'<div class="d"><b class="st">★ '+(+x.rating).toFixed(1)+'</b> ('+(x.n||0)+')</div>':'')
    +'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+'</div><div class="d"><span class="go">'+W("map")+' ›</span></div></button>'; }
function nbHtml(k){ if(!OPEN[k.c]) return '<button type="button" class="gfnb xtrow" data-gf="nb" data-kc="'+esc(k.c)+'" aria-expanded="false"><span>'+WI("near")+'</span>'+XTG.html(false,'',1)+'</button>';
  var h='<button type="button" class="gfnb xtrow" data-gf="nbx" data-kc="'+esc(k.c)+'" aria-expanded="true"><span>'+WI("near")+'</span>'+XTG.html(true,'',1)+'</button><div class="gfnbox">';   // 11-07 「접기 ▴」 → 같은 줄(글씨 그대로) 오른쪽 공통 — 단추로 접기
  if(S.bst!=="ok"&&S.bst!=="no") return h+'<div class="msg">'+W("srch")+'</div></div>';
  if(S.bst==="no") return h+'<div class="msg">'+W("loc")+'</div><div class="gfbase"><button type="button" class="gfme" data-gf="me">'+WI("useme")+'</button></div>'+seoulHtml(k)+'</div>';
  var d=NB[nbKey(k)]; if(!d){ nbLoad(k); d=NB[nbKey(k)]; }
  if(d.st==="ld") return h+'<div class="msg">'+W("srch")+'</div></div>';
  if(d.st==="err") return h+'<div class="msg">'+W("err")+'</div>'+seoulHtml(k)+'</div>';
  var it=nbList(k), rr=S.ord==="r";
  if(!it.length) return h+'<div class="msg">'+W("none")+'</div>'+seoulHtml(k)+'</div>';
  h+='<div class="gford"><button type="button" data-gf="ord" data-o="d" class="'+(rr?'':'on')+'">'+W("dist")+'</button><button type="button" data-gf="ord" data-o="r" class="'+(rr?'on':'')+'">'+W("rate")+'</button></div>';
  h+='<div class="gfbase">'+(rr?WI(d.r>10000?"r30":d.r>3000?"r10":"r3"):WI(S.src==="me"?"bme":"bmap"))+(S.src!=="me"?' <button type="button" class="gfme" data-gf="me">'+WI("useme")+'</button>':'')+'</div>'+(d.r>10000?'<div class="gfbase">'+W("far")+'</div>':'');
  return h+it.map(function(x,i){ return nbItem(k,x,i); }).join("")+'</div>'; }
function nbPick(k,j){ var x=nbList(k)[j]; if(!x) return; try{ ntap(k.c,"gift"); }catch(e){} close();
  var fl=x.name_l&&L();
  spinShow({name:x.name,name_en:fl?x.name_l:x.name,addr:x.addr||"",addr_en:fl?(x.addr_l||x.addr||""):(x.addr||""),y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:fl?(x.cat_l||""):"",_l:fl?LANG:"ko",oh:x.oh,gt:x.gt}); }   // oh·gt = 구글 영업시간·종류 (11-06)

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
  +"@media (min-width:700px){#gfBox{overflow:hidden}#gfBox .gfin{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:var(--sub,#8a94a6) var(--line,#e6e9ef);padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}}"   // 넓은 화면 — 가운데 칸 자체가 스크롤, 스크롤바가 칸 가장자리에 (사장님 11-06) · 폰은 그대로
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
  +".gfnb.xtrow{display:flex;padding-left:44px}.gfnb.xtrow>span:first-child{flex:1;text-align:center}.gfnb>.xtg{margin:-4px -4px -4px 0}"   // 근처 가게 보기 — 글씨는 가운데, 오른쪽 끝 ▼/— (11-07)
  +".gford{display:flex;gap:6px;margin:8px 0 2px;clear:both}.gford button{flex:1;border:1px solid #c5d3e8;background:#fff;color:#1c5fb8;border-radius:999px;padding:7px 0;font-weight:800;font-size:14px;cursor:pointer}.gford button.on{background:#1c5fb8;color:#fff;border-color:#1c5fb8}"
  +".gfbase{color:var(--sub);font-size:12.5px;margin:6px 2px;clear:both}.gfme{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:3px 10px;font-size:12.5px;font-weight:800;cursor:pointer;margin-left:4px}"
  +".gfn{display:block;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:9px 2px;cursor:pointer;font-size:14.5px}.gfn .h{display:flex;align-items:center;gap:6px}.gfn .h b{flex:1}.gfn .h i{font-style:normal;color:var(--sub);font-size:12.5px;white-space:nowrap}"
  +".gfn .ko{color:var(--sub);font-size:12.5px;margin:1px 0 0 26px}.gfn .d{color:var(--sub);font-size:12.5px;margin:2px 0 0 26px;line-height:1.45}.gfn .st{color:#e8590c}.gfn .go{color:#1a73e8;font-weight:800;font-size:13px}"
  +".gfnr{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#1971c2;color:#fff;font-size:12px;text-align:center}.gfsl{font-weight:900;font-size:13px;color:var(--sub);margin:8px 2px 0}"
  +".gflh{font-weight:900;font-size:15px;margin:14px 2px 4px;color:#c2410c}.gfk.gfl{border-color:#f3c99b}"
  // 11-08 명품 고르기 — 글자만 황금색, 제목처럼 왼쪽(사장님 「황금 네모 칸을 없애고 글자만」 「위의 다른 제목과 왼쪽 정렬」) · 로고 칸은 바탕 투명(사장님 「로고는 배경을 투명으로」) · 로고는 모두 검은색 한 가지(밝은 로고도 보이게)·다크 모드는 흰색
  +".gflux{display:block;width:auto;margin:14px 2px 4px;padding:2px 0;border:0;background:none;text-align:left;font-size:15px;font-weight:900;letter-spacing:.2px;cursor:pointer;box-shadow:none;background-image:linear-gradient(90deg,#a8780a,#d9a520 40%,#b8860b 70%,#e0b84a);-webkit-background-clip:text;background-clip:text;color:#b8860b;-webkit-text-fill-color:transparent}"
  +".gflxt{font-size:20px;font-weight:900;margin:12px 2px 2px;color:#a8780a}.gflxd{color:var(--sub);font-size:13.5px;line-height:1.5;margin:2px 2px 10px}"
  +".gflcat{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 10px}.gflcat button{border:1.5px solid #c9971c;background:var(--card);color:#8a6100;border-radius:999px;padding:7px 0;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;min-width:0}.gflcat button.on{background:#c9971c;color:#fff}"
  +".gflg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}@media (min-width:700px){.gflg{grid-template-columns:repeat(4,1fr)}}"
  +".gflb{background:transparent;border:1.5px solid #e2c98a;border-radius:12px;height:86px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer;padding:6px;min-width:0}"
  +".gflb img{max-width:86%;max-height:34px;object-fit:contain}.gflb span{font-size:11.5px;color:#8a6100;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}"
  +".gflt{font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:1px;color:var(--ink);text-align:center;line-height:1.2}"
  +".gflbig{display:flex;flex-direction:column;align-items:center;gap:8px;background:transparent;border:1.5px solid #e2c98a;border-radius:14px;padding:16px;margin:8px 0 4px}.gflbig img{max-width:60%;max-height:56px;object-fit:contain}.gflbig b{color:#8a6100}.gflimg{filter:brightness(0)}[data-theme=dark] .gflimg{filter:brightness(0) invert(1)}[data-theme=dark] .gflb span,[data-theme=dark] .gflbig b{color:#e2c98a}.gflbig .gflt{font-size:20px}";
  document.head.appendChild(s); }
function open(){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  var o=document.getElementById("gfBox"); if(!o){ o=document.createElement("div"); o.id="gfBox"; o.innerHTML='<div class="gfin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("gflock"); try{ ntap("_gift","gift"); }catch(e){}
  OPEN={}; S.bst="";
  paint(); load().then(paint,function(){ var b=o.querySelector(".gfin"); if(b) b.insertAdjacentHTML("beforeend",'<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>'); }); }
function close(){ var o=document.getElementById("gfBox"); if(o) o.remove(); document.documentElement.classList.remove("gflock"); }
function opt(kind,c,label,on){ return '<button type="button" class="gfopt'+(on?' on':'')+'" data-gf="'+kind+'" data-c="'+esc(c)+'">'+label+'</button>'; }
function paint(){ var b=document.querySelector("#gfBox .gfin"); if(!b) return;
  var h='<div class="gftop"><b>'+MPICO("mi_gift",T("🎁 선물 고르기","🎁 Gift finder"),MIS)+'</b><button type="button" class="gfx" data-gf="x" aria-label="close">✕</button></div>';
  if(S.lux){ b.innerHTML=luxHtml(h); return; }   // 11-08 명품 고르기
  if(!G){ b.innerHTML=h+'<div class="msg">'+T("불러오는 중…","Loading…")+'</div>'; return; }
  if(S.who) h+='<button type="button" class="gfrs" data-gf="rs">'+T("↺ 처음부터 다시","↺ Start over")+'</button>';
  h+='<div class="gfq">1. '+T("누구에게 주나요?","Who is it for?")+'</div><div class="gfopts">'+G.who.map(function(x){ return opt("w",x.c,GI(x)+esc(nm(x)),S.who===x.c); }).join("")+'</div>';
  h+='<div class="gfq">2. '+T("예산은요? (1개 기준)","Budget? (per gift)")+'</div><div class="gfopts">'+G.budget.map(function(x){ return opt("b",x.c,esc(nm(x)),S.bud===x.c); }).join("")+'</div>';   // 11-08 처음부터 보임 — 3번 명품 고르기가 1번 바로 밑에 붙지 않게
  h+='<button type="button" class="gflux" data-gf="lux">3. '+esc(LP(LX6.t))+' ›</button>';   // 11-08 사장님 「앱에서도 명품 고르기를 3번으로」 — 글자만 황금색
  if(S.who&&S.bud){ var R=ranked();
    if(!S.bst) setTimeout(function(){ baseGo(false); },0);
    h+='<div class="gfq">4. '+T("이런 선물을 추천해요","Our picks for you")+'</div>'+dfsHtml();
    var LK=localKinds(); if(LK.length) h+='<div class="gflh">'+WI("local")+'</div>'+LK.map(function(k){ return '<div class="gfk gfl" data-kc="'+esc(k.c)+'"><div class="h">'+GI(k)+esc(nm(k))+'</div><div class="d">'+esc(LD(k))+'</div>'+nbHtml(k)+'</div>'; }).join("");
    h+=R.map(function(k,i){ var n=[k.note&&k.note[S.who],k.note&&k.note[S.bud]].filter(Boolean).map(function(a){ return '<div class="n">'+MPIMG("mi_g_point",MIS)+esc(t2(a))+'</div>'; }).join("");
      return '<div class="gfk" data-kc="'+esc(k.c)+'"><div class="h"><span class="gfrank">'+(i+1)+'</span>'+GI(k)+esc(nm(k))+'</div><div class="d">'+esc(LD(k))+'</div>'+n
        +'<div class="gfads"></div>'+nbHtml(k)+'</div>'; }).join("");
    h+=tips(); }
  b.innerHTML=h;
  if(S.who&&S.bud) ranked().forEach(function(k){ adsFor(k).then(function(ads){ var box=b.querySelector('.gfk[data-kc="'+k.c+'"] .gfads'); if(!box||!ads.length) return;
    box.innerHTML=ads.map(function(a,j){ return '<button type="button" class="gfs" data-gf="a" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b><span class="gfad">'+T("광고","Ad")+'</span>'+esc(L()?(a.en||a.ko):a.ko)+'</b><i>'+(a.dist!=null?(a.dist<1000?a.dist+" m":(a.dist/1000).toFixed(1)+" km"):"")+'</i><span class="go">'+T("지도","Map")+' ›</span></button>'; }).join(""); box._ads=ads; }); }); }
// ── 명품 고르기 (사장님 11-08 「황금색으로 명품 고르기를 넣어줘 · 명품 브랜드의 로고 · 어디에 매장이 있는지」 「이건 앱에서도」) ──
//   브랜드 = data/lux.json (갤러리아·롯데·현대·신세계 백화점, 롯데·신세계·현대·신라 면세점의 해외명품·명품 시계·명품 주얼리 — 사장님 「가」) · 로고 = img/lux/ (위키미디어 공용의 공식 로고 파일)
//   로고를 누르면 가까운 매장 = 허브 /kplace(카카오, 가까운 순) 가운데 백화점·면세점 안 매장만(사장님 「백화점 면세점에 있는 매장만 골라」) — 아울렛·회사·중고·수선·딴 업종 뺌 · 카카오라 비용 없음
var LX=null, LXP=null, LXS={};
function luxLoad(){ return LXP||(LXP=fetch("data/lux.json?v="+(window.NAVI_V||"")).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){ LX=j; return j; },function(e){ LXP=null; throw e; })); }
var LX6={t:["명품 고르기","Luxury Brands","高級ブランド","奢侈品牌","精品品牌","Marcas de lujo"],
 d:["백화점·면세점에 매장이 있는 명품 브랜드예요. 로고를 누르면 가까운 매장을 알려 드려요.","Luxury brands with boutiques in Korean department stores and duty-free shops. Tap a logo to see the nearest ones.","百貨店・免税店に店舗がある高級ブランドです。ロゴを押すと近くの店舗をご案内します。","在韩国百货店和免税店设有门店的奢侈品牌。点击标志即可查看附近门店。","在韓國百貨公司和免稅店設有門市的精品品牌。點選標誌即可查看附近門市。","Marcas de lujo con tiendas en grandes almacenes y tiendas libres de impuestos de Corea. Toca un logotipo para ver las más cercanas."],
 back:["‹ 선물 고르기","‹ Gift finder","‹ ギフト選び","‹ 选礼物","‹ 選禮物","‹ Buscador de regalos"],
 all:["‹ 브랜드 목록","‹ All brands","‹ ブランド一覧","‹ 品牌列表","‹ 品牌列表","‹ Todas las marcas"],
 c_all:["전체","All","すべて","全部","全部","Todas"],
 c_fashion:["패션·가방","Fashion & bags","ファッション・バッグ","时装·箱包","時裝·包款","Moda y bolsos"],
 c_watch:["시계","Watches","時計","腕表","腕錶","Relojes"],
 c_jewelry:["주얼리","Jewelry","ジュエリー","珠宝","珠寶","Joyería"],
 near:["가까운 백화점·면세점 매장","Nearest boutiques in department stores & duty-free shops","近くの百貨店・免税店の店舗","附近百货店·免税店的门店","附近百貨公司·免稅店的門市","Tiendas más cercanas en grandes almacenes y duty free"],
 bme:["내 위치에서 가까운 순","Nearest to you","現在地から近い順","离我最近","離我最近","Más cercanas a ti"],
 far:["60km 안에는 매장이 없어, 더 먼 곳을 보여 드려요.","No boutique within 60 km — showing ones farther away.","60km以内に店舗がないため、遠くの店舗を表示しています。","60公里内没有门店，显示较远的门店。","60公里內沒有門市，顯示較遠的門市。","No hay tiendas a menos de 60 km; te mostramos otras más lejanas."],
 none:["가까운 백화점·면세점에서 이 브랜드 매장을 찾지 못했어요.","No boutique of this brand found in nearby department stores or duty-free shops.","近くの百貨店・免税店でこのブランドの店舗が見つかりませんでした。","附近的百货店和免税店没有找到该品牌门店。","附近的百貨公司和免稅店沒有找到該品牌門市。","No encontramos tiendas de esta marca en grandes almacenes ni duty free cercanos."]};
function gfTop(){ var bx=document.getElementById("gfBox"); if(bx){ bx.scrollTop=0; var bi=bx.querySelector(".gfin"); if(bi) bi.scrollTop=0; } }
function lxBrand(id){ return ((LX&&LX.brands)||[]).filter(function(x){ return x.id===id; })[0]; }
function lxName(x){ return LANG==="ko"?x.ko:x.en; }
function lxLogo(x){ return x.logo?'<img class="gflimg" src="img/lux/'+esc(x.logo)+'" alt="'+esc(x.en)+'" loading="lazy">':'<b class="gflt">'+esc(x.en)+'</b>'; }
document.addEventListener("error",function(e){ var im=e.target; if(!im||im.tagName!=="IMG"||!im.classList||!im.classList.contains("gflimg")) return; var t=document.createElement("b"); t.className="gflt"; t.textContent=im.alt; im.replaceWith(t); },true);   // 로고 파일이 없으면 영문 이름 글자로
function lxKey(x){ return x.id+"|"+LANG+"|"+S.base[0].toFixed(3)+","+S.base[1].toFixed(3); }
var LXOK=/백화점|면세점|에비뉴엘|더\s?현대|갤러리아|명품관|헤리티지|(롯데|신세계|현대)\s?본점/, LXNO=/아울렛|코리아|본사|지사|서비스센터|수선|중고|리페어/, LXCAT=/음식|카페|제과|베이커리|숙박|부동산|여행|노래방|미용실|피부관리|이발|섬유|제조|기업|전자|음향|안경|주거|술집|스포츠|아웃도어|인쇄|침구|생활용품/;
function lxFit(x,it){ var n=String(it.name||""), k=String(x.kq||x.ko).replace(/\s/g,""); return n.replace(/\s/g,"").indexOf(k)>=0&&LXOK.test(n)&&!LXNO.test(n)&&!LXCAT.test(String(it.cat||"")); }
function lxLoad(x){ var key=lxKey(x); if(LXS[key]) return; LXS[key]={st:"ld"}; var b=S.base;
  fetch(HUB+"/kplace?q="+encodeURIComponent(x.kq||x.ko)+"&near=1&ux="+b[1].toFixed(4)+"&uy="+b[0].toFixed(4)+kpL()).then(function(r){ return r.json(); }).then(function(j){ if(!j||!j.ok) throw new Error("fail"); var seen={};
      LXS[key]={st:"ok",items:(j.items||[]).filter(function(it){ return lxFit(x,it); }).map(function(it){ var o=Object.assign({},it); o.dist=Math.round(KM(b,[+it.y,+it.x])*1000); return o; })
        .filter(function(o){ var q=o.name+"|"+o.addr; if(seen[q]) return false; seen[q]=1; return true; }).sort(function(a,c){ return a.dist-c.dist; })}; var A=LXS[key].items, nr=A.filter(function(o){ return o.dist<=60000; });   // 60km 안만 · 없으면 먼 곳 3곳에 안내 한 줄
      if(nr.length) LXS[key].items=nr.slice(0,10); else { LXS[key].items=A.slice(0,3); LXS[key].far=A.length?1:0; } paint(); })
    .catch(function(){ LXS[key]={st:"err"}; paint(); }); }
function lxStores(x){ var h='<button type="button" class="gfrs" data-gf="lxa">'+esc(LP(LX6.all))+'</button><div class="gflbig">'+lxLogo(x)+'<b>'+esc(lxName(x))+'</b></div><div class="gfq">'+esc(LP(LX6.near))+'</div>';
  if(S.bst!=="ok"&&S.bst!=="no"){ if(!S.bst) setTimeout(function(){ baseGo(false); },0); return h+'<div class="msg">'+W("srch")+'</div>'; }
  if(S.bst==="no") return h+'<div class="msg">'+W("loc")+'</div><div class="gfbase"><button type="button" class="gfme" data-gf="me">'+WI("useme")+'</button></div>';
  var d=LXS[lxKey(x)]; if(!d){ lxLoad(x); d=LXS[lxKey(x)]; }
  h+='<div class="gfbase">'+(S.src==="me"?MPICO("mi_pin",LP(LX6.bme),MIS):WI("bmap"))+(S.src!=="me"?' <button type="button" class="gfme" data-gf="me">'+WI("useme")+'</button>':'')+'</div>';
  if(d.st==="ld") return h+'<div class="msg">'+W("srch")+'</div>';
  if(d.st==="err") return h+'<div class="msg">'+W("err")+'</div>';
  if(!d.items.length) return h+'<div class="msg">'+esc(LP(LX6.none))+'</div>';
  return h+(d.far?'<div class="gfbase">'+esc(LP(LX6.far))+'</div>':'')+d.items.map(function(it,i){ var fl=L()&&it.name_en&&it.name_en!==it.name, ct=String(it.cat||"").split(">").pop().trim();
    return '<button type="button" class="gfn" data-gf="lxs" data-j="'+i+'"><div class="h"><span class="gfnr">'+(i+1)+'</span><b>'+esc(fl?it.name_en:it.name)+'</b><i>'+kmT(it.dist)+'</i></div>'+(fl?'<div class="ko">'+esc(it.name)+'</div>':'')
      +'<div class="d">'+esc((L()&&it.addr_en)||it.addr||"")+(ct&&!L()?' · '+esc(ct):'')+'</div><div class="d"><span class="go">'+W("map")+' ›</span></div></button>'; }).join(""); }
function luxHtml(h){ h+='<button type="button" class="gfrs" data-gf="lxb">'+esc(LP(LX6.back))+'</button><div class="gflxt">'+esc(LP(LX6.t))+'</div>';
  if(!LX){ luxLoad().then(paint,function(){}); return h+'<div class="msg">'+W("srch")+'</div>'; }
  if(S.lb){ var x=lxBrand(S.lb); if(x) return h+lxStores(x); S.lb=""; }
  var c0=S.lc||"all", B=(LX.brands||[]).filter(function(x){ return c0==="all"||x.cat===c0; }).slice().sort(function(a,c){ return String(a.en).toUpperCase().localeCompare(String(c.en).toUpperCase()); });
  return h+'<div class="gflxd">'+esc(LP(LX6.d))+'</div><div class="gflcat">'+["all","fashion","watch","jewelry"].map(function(c){ return '<button type="button" data-gf="lxc" data-c="'+c+'" class="'+(c0===c?'on':'')+'">'+esc(LP(LX6["c_"+c]))+'</button>'; }).join("")+'</div>'
    +'<div class="gflg">'+B.map(function(x){ return '<button type="button" class="gflb" data-gf="lx" data-id="'+esc(x.id)+'">'+lxLogo(x)+'<span>'+esc(lxName(x))+'</span></button>'; }).join("")+'</div>'; }
// 면세점은 목록 대신 검색으로 (사장님 10-16) — 기존 검색 흐름(go) 그대로, 결과를 누르면 검색 핀
function dfsHtml(){ return '<div class="gfdfs"><button type="button" class="gfdb" data-gf="dfs">'+MPICO("mi_search",T("🔎 면세점","🔎 Duty-free shops"),MIS)+'</button></div>'; }
function dfsGo(){ close(); var q=document.getElementById("q"); if(q){ q.value=T("면세점","duty free"); try{ qxSync(); }catch(e){} } try{ ntap("_dfs","gift"); }catch(e){}
  go("면세점"); var r=document.getElementById("res"); if(r) setTimeout(function(){ window.scrollTo({top:r.getBoundingClientRect().top+scrollY-80,behavior:"smooth"}); },100); }
function tips(){ if(!G.tips||!G.tips.length) return "";
  return '<div class="gftips"><div class="h">'+MPICO("mi_tip",T("💡 사기 전에","💡 Before you buy"),MIS)+'</div>'+G.tips.map(function(x){ var u=String(x.src||"").split(" · ")[0];
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
  if(g==="rs"){ S.who=""; S.bud=""; OPEN={}; paint(); var bx=document.getElementById("gfBox"); if(bx){ bx.scrollTop=0; var bi=bx.querySelector(".gfin"); if(bi) bi.scrollTop=0; } return; }
  if(g==="lux"){ S.lux=1; S.lb=""; try{ ntap("_lux","gift"); }catch(z){} paint(); gfTop(); return; }
  if(g==="lxb"){ S.lux=0; S.lb=""; paint(); gfTop(); return; }
  if(g==="lxc"){ S.lc=t.dataset.c; paint(); return; }
  if(g==="lx"){ S.lb=t.dataset.id; try{ ntap("lux_"+S.lb,"gift"); }catch(z){} paint(); gfTop(); return; }
  if(g==="lxa"){ S.lb=""; paint(); gfTop(); return; }
  if(g==="lxs"){ var xb=lxBrand(S.lb), dd=xb&&S.base&&LXS[lxKey(xb)], it=dd&&dd.items&&dd.items[+t.dataset.j]; if(!it) return; close(); var fl=L()&&it.name_en&&it.name_en!==it.name;
    spinShow({name:it.name,name_en:fl?it.name_en:it.name,addr:it.addr||"",addr_en:fl?(it.addr_en||it.addr||""):(it.addr||""),y:it.y,x:it.x,tel:it.tel||"",cat:it.cat||"",cat_en:it.cat_en||"",_l:fl?LANG:"ko"}); return; }
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

// ── 들어가는 곳: ⋮ 메뉴 (첫 화면 칩 자리는 11-07 사장님 「교통」으로 — transit.js. 칩 줄 #gfchips 는 여기서 그대로 만든다) ──
function entries(){ var h=document.getElementById("gob")||document.getElementById("hint");
  if(h&&!document.getElementById("gfchips")){ css(); h.insertAdjacentHTML("afterend",'<div id="gfchips"></div>'); }
  var mm=document.getElementById("mm"); if(mm){ var a=document.getElementById("mgift"); if(!a){ a=document.createElement("a"); a.id="mgift"; a.href="#"; a.className="mi"; a.dataset.gf="open"; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); } a.innerHTML='<img class="miic" src="img/menu/mi_gift.png" alt="">'+esc(T("선물 고르기","Gift finder")); } }
var DFS_TEL=[[/신라아이파크|HDC\s*신라/,"1688-8800"],[/롯데면세점/,"1688-3000"],[/신라면세점/,"1688-1110"],[/신세계면세점/,"1661-8778"],[/현대(백화점)?면세점/,"1811-6688"],[/동화면세점/,"02-399-3000"]];
function dfsTel(ko){ for(var i=0;i<DFS_TEL.length;i++) if(DFS_TEL[i][0].test(ko||"")) return DFS_TEL[i][1]; return ""; }
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._gf){ var sc1=function(){ try{ var p=PLACES.__pin; if(p&&!p.tel){ var t=dfsTel(p.ko); if(t) p.tel=t; } }catch(e){} return sc0.apply(this,arguments); }; sc1._gf=1; sc1._tr=sc0._tr; window.spinCard=sc1; }
var f=window.setLang; if(typeof f==="function"&&!f._gf){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); paint(); }catch(e){} return r; }; g._gf=1; g._tr=f._tr; window.setLang=g; }
entries();
window.GIFT={open:open,close:close,state:function(){ return S; },data:function(){ return G; },nb:function(){ return NB; }};
if(/[?&]gift=1/.test(location.search)) setTimeout(open,300);
})();
