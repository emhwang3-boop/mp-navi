/* MosaicTrip.com 홈페이지 — 편의시설 화면 + 편의시설·긴급 공통 부품 (11-08 4b단계 · 배치도 tour_site\wireframes\7_편의시설_배치도 · 7b_편의시설_대사관_배치도)
 *  · 주소 #/near/store · #/near/food · #/near/exchange · #/near/embassy  (#/near = 편의점)
 *  · 맨 윗줄 탭 넷(편의점·음식점·환전소·대사관, 같은 크기) · 왼쪽 「어디 근처?」(서울·부산·경주·제주 + 동네·역·명소 검색 + 내 위치 + 내 일정 숙소) · 정렬(음식점만)
 *    가운데 2줄 목록 · 오른쪽 그 동네 그림 지도 + 번호 핀(따라옴) — 목록에 마우스를 올리면 그 핀이 커지고, 핀을 누르면 목록의 그곳으로
 *  · 대사관 = 나라 이름 순 + 「나라 찾기」 · 국기 그림(home/img/flags, PC 만) · EU 회원국은 국기 오른쪽 위 안쪽에 EU 별 고리 · 앱은 이모지 국기 그대로 (사장님 11-08)
 *  · 자료·받기·차례는 앱 near.js 그대로 (window.NEARPC — PC_HOME 일 때만 열림): 카카오 /kplace(편의점 1km·환전소 2km·병원·약국 2km) · 음식점 구글 /gnear(1.5km, 앱과 같은 호출)
 *    동네 검색 = 앱 검색과 같은 카카오 /kplace?q= · 새로 돈 드는 호출 없음
 *  · 「자세히」 = 앱 장소 카드(spinCard — 사진·영업시간·전화·길찾기·후기·＋ 내 여행에 담기)를 화면 가운데 창에 그대로
 *  · 그림 지도 = 앱 「AI와 자유여행」 날짜 지도와 같은 그림(서울·부산은 구 화면 조각 그림, 그 밖은 지역 약도)을 잘라 보여 준다 — 새 그림 없음
 *  · window.PCNEAR = 긴급 화면(home/pc_sos.js)과 같이 쓰는 부품 (어디 근처·목록·지도·자세히)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document, H=D.documentElement;
function N(){ return window.NEARPC||null; }
function LG(){ return window.LANG||"ko"; }
function fg(){ return LG()!=="ko"; }
function L6(o){ return o?(typeof o==="string"?o:(o[LG()]||o.en||o.ko||"")):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function F(o,m){ var s=L6(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function T2(ko,en){ try{ return window.T?window.T(ko,en):(fg()?en:ko); }catch(e){ return fg()?en:ko; } }
function KS0(s){ try{ return window.KS?window.KS(s):s; }catch(e){ return s; } }
function kmt(m){ m=+m||0; return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"; }
function rkm(r){ return ((+r||0)/1000).toFixed(1).replace(/\.0$/,"")+"km"; }
function phone(){ return window.matchMedia&&matchMedia("(max-width:640px)").matches; }
function touch(){ return window.matchMedia&&matchMedia("(hover:none)").matches; }
function hub(){ return window.HUB||"https://brief-live-hub.emhwang3.workers.dev"; }
function ico(n){ return '<img class="pn-ic" src="img/menu/'+n+'.png" alt="">'; }

// ── 글 (6개 언어) — 앱에 있는 이름(편의점·음식점·환전소·대사관)은 앱 것(NEARPC.MENU6)을 그대로 ──
var TX={
 sub:T6("가까운 편의점·음식점·환전소, 그리고 대사관 연락처","Nearby convenience stores, restaurants and currency exchange, plus embassy contacts","近くのコンビニ・飲食店・両替所と、大使館の連絡先","附近的便利店、餐厅、货币兑换处，以及大使馆联系方式","附近的便利商店、餐廳、貨幣兌換處，以及大使館聯絡方式","Tiendas, restaurantes y casas de cambio cercanos, y contactos de embajadas"),
 where:T6("어디 근처?","Near where?","どのあたり？","在哪里附近？","在哪裡附近？","¿Cerca de dónde?"),
 qLb:T6("동네·역·명소 이름으로 찾기","Search by area, station or place","地域・駅・名所の名前で探す","按街区·车站·景点名称查找","按街區·車站·景點名稱查找","Buscar por barrio, estación o lugar"),
 qph:T6("예: 명동역, 해운대","e.g. Myeong-dong, Haeundae","例：明洞駅、海雲台","例：明洞站、海云台","例：明洞站、海雲台","p. ej., Myeongdong, Haeundae"),   // 칸이 좁아 설명은 위 한 줄(qLb), 칸 안은 예만
 qa:T6("찾기","Search","検索","搜索","搜尋","Buscar"),
 qNone:T6("「{q}」 결과가 없어요. 다른 이름으로 찾아 보세요.","No results for “{q}”. Try another name.","「{q}」は見つかりませんでした。別の名前で探してみてください。","没有找到“{q}”，请换个名称试试。","沒有找到「{q}」，請換個名稱試試。","No hay resultados para «{q}». Prueba con otro nombre."),
 me:T6("내 위치로","Use my location","現在地で探す","用我的位置","用我的位置","Usar mi ubicación"),
 meSub:T6("폰·노트북이 위치를 알려 줄 때","When your phone or laptop shares its location","スマホやパソコンが位置情報を共有できるとき","手机或电脑可提供位置时","手機或電腦可提供位置時","Si tu móvil o portátil comparte la ubicación"),
 meIng:T6("위치를 받는 중…","Getting your location…","位置情報を取得中…","正在获取位置…","正在取得位置…","Obteniendo tu ubicación…"),
 meErr:T6("위치를 받을 수 없어요. 브라우저에서 위치 권한을 켜 주세요.","Couldn't get your location. Please allow location access in your browser.","位置情報を取得できません。ブラウザで位置情報の利用を許可してください。","无法获取位置。请在浏览器中允许使用位置信息。","無法取得位置。請在瀏覽器中允許使用位置資訊。","No se pudo obtener tu ubicación. Permite el acceso a la ubicación en el navegador."),
 meNm:T6("내 위치","My location","現在地","我的位置","我的位置","Mi ubicación"),
 htl:T6("내 일정 숙소 근처","Near my trip's lodging","旅程の宿の近く","我行程中的住处附近","我行程中的住處附近","Cerca de mi alojamiento"),
 htlNo:T6("AI와 자유여행에서 숙소를 정하면 쓸 수 있어요","Available once you choose lodging in DIY Trip","DIY旅行で宿を決めると使えます","在自助游中选好住处后即可使用","在自助旅行中選好住處後即可使用","Disponible cuando elijas alojamiento en Viaje a tu aire"),
 diy:T6("AI와 자유여행","DIY Trip","DIY旅行","自助游","自助旅行","Viaje a tu aire"),   // 첫 화면 카드 이름과 같게 (pc.js w3t)
 plan:T6("플랜 {n}","Plan {n}","プラン{n}","方案{n}","方案{n}","Plan {n}"),   // trip.js PL6.nm 과 같은 말
 sort:T6("정렬","Sort by","並べ替え","排序","排序","Ordenar"),
 oNear:T6("거리순","Nearest","近い順","由近到远","由近到遠","Más cercanos"),   // 앱 음식점 「거리순」·「별점순 (구글)」과 같은 말
 oRate:T6("별점순 (구글)","Top rated (Google)","評価順（Google）","评分优先（Google）","評分優先（Google）","Mejor valorados (Google)"),
 oNear2:T6("가까운 순","Nearest first","近い順","由近到远","由近到遠","Más cercanos primero"),
 nearT:T6("{p} 근처 {k}","{k} near {p}","{p}周辺の{k}","{p}附近的{k}","{p}附近的{k}","{k} cerca de {p}"),
 srcG:T6("구글 자료 · {r} 안","Google data · within {r}","Googleのデータ・{r}以内","谷歌数据 · {r}以内","Google 資料 · {r}以內","Datos de Google · a menos de {r}"),
 srcK:T6("카카오 자료 · {r} 안","Kakao data · within {r}","Kakaoのデータ・{r}以内","Kakao 数据 · {r}以内","Kakao 資料 · {r}以內","Datos de Kakao · a menos de {r}"),
 rad:T6("찾는 거리","Search radius","検索範囲","搜索范围","搜尋範圍","Radio de búsqueda"),
 fdNote:T6("음식점은 구글 별점과 리뷰 수를 봐요. 거리순이어도 거리가 비슷하면 별점 높은 곳이 먼저예요.","Restaurants use Google ratings and review counts. Even when sorted by distance, better-rated places at a similar distance come first.","飲食店はGoogleの評価と口コミ数を見ます。近い順でも、距離が近ければ評価の高い店が先に出ます。","餐厅参考谷歌评分和评价数。即使按距离排序，距离相近时评分高的排在前面。","餐廳參考 Google 評分和評價數。即使按距離排序，距離相近時評分高的排在前面。","Los restaurantes usan valoraciones y reseñas de Google. Aunque ordenes por distancia, a distancia similar salen antes los mejor valorados."),
 det:T6("자세히","Details","詳細","详情","詳情","Detalles"),
 dir:T6("길찾기","Directions","経路","路线","路線","Cómo llegar"),
 load:T6("찾는 중…","Searching…","検索中…","搜索中…","搜尋中…","Buscando…"),
 none:T6("가까운 곳에 없어요.","None found nearby.","近くに見つかりませんでした。","附近没有找到。","附近沒有找到。","No se encontró nada cerca."),
 err:T6("잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Inténtalo de nuevo en un momento."),
 far:T6("가까운 곳에 없어 10km 안에서 찾았어요.","Nothing close by, so we searched within 10 km.","近くにないため、10km以内で探しました。","附近没有，已在10公里内查找。","附近沒有，已在10公里內查找。","No había nada cerca; buscamos a menos de 10 km."),
 mapHint:T6("목록에 마우스를 올리면 핀이 커져요 · 핀을 누르면 목록의 그곳으로","Hover over the list to enlarge a pin · click a pin to jump to it in the list","リストにマウスを合わせるとピンが大きくなります・ピンを押すとリストのその場所へ","鼠标移到列表上，图钉会放大 · 点击图钉跳到列表中的该处","滑鼠移到列表上，圖釘會放大 · 點擊圖釘跳到列表中的該處","Pasa el ratón por la lista para agrandar un pin · haz clic en un pin para ir a él en la lista"),
 mapHintT:T6("핀을 누르면 목록의 그곳으로","Tap a pin to jump to it in the list","ピンを押すとリストのその場所へ","点击图钉跳到列表中的该处","點擊圖釘跳到列表中的該處","Toca un pin para ir a él en la lista"),
 mapNo:T6("이 동네는 그림 지도가 없어요","There's no illustrated map for this area","この地域のイラストマップはありません","该地区暂无手绘地图","該地區暫無手繪地圖","No hay mapa ilustrado de esta zona"),
 mapIng:T6("지도를 그리는 중…","Drawing the map…","地図を描いています…","正在绘制地图…","正在繪製地圖…","Dibujando el mapa…"),
 base:T6("찾는 기준","Search center","検索の中心","搜索中心","搜尋中心","Centro de búsqueda"),
 close:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 // 대사관
 ebN:T6("주한 대사관·대표부 {n}곳","{n} embassies and missions in Korea","在韓大使館・代表部 {n}か所","驻韩大使馆·代表处 {n}个","駐韓大使館·代表處 {n}個","{n} embajadas y delegaciones en Corea"),
 ebHow:T6("나라 영문 이름 순으로 보여 드려요. 위 「나라 찾기」로 찾을 수 있어요.","Listed by country name (A–Z). Use “Find a country” above to search.","国名順に並べています。上の「国を探す」で検索できます。","按国家名称排列。可用上方的“查找国家”搜索。","按國家名稱排列。可用上方的「查找國家」搜尋。","Ordenadas por nombre del país. Usa «Buscar país» arriba."),
 ebGo:T6("대사관에 갈 때","Going to an embassy","大使館に行くとき","前往大使馆时","前往大使館時","Si vas a una embajada"),
 ebPass:T6("여권을 잃어버렸을 때는 가까운 경찰서(☎ 112)에 분실 신고를 한 뒤 대사관으로 가세요.","If you lose your passport, report it at the nearest police station (☎ 112) first, then go to your embassy.","パスポートをなくしたときは、近くの警察署（☎ 112）に紛失届を出してから大使館へ行ってください。","护照丢失时，请先到附近的警察局（☎ 112）报失，再前往大使馆。","護照遺失時，請先到附近的警察局（☎ 112）報案，再前往大使館。","Si pierdes el pasaporte, denúncialo primero en la comisaría más cercana (☎ 112) y luego ve a tu embajada."),
 ebQ:T6("나라 찾기 (예: 독일, Germany)","Find a country (e.g. Germany)","国を探す（例：ドイツ、Germany）","查找国家（例：德国、Germany）","查找國家（例：德國、Germany）","Buscar país (p. ej., Alemania, Germany)"),
 ebNone:T6("「{q}」에 맞는 나라가 없어요.","No country matches “{q}”.","「{q}」に合う国はありません。","没有与“{q}”相符的国家。","沒有與「{q}」相符的國家。","Ningún país coincide con «{q}»."),
 ebPick:T6("목록에서 대사관을 누르면 여기에 지도가 나와요","Click an embassy in the list to see it on the map","リストの大使館を押すと、ここに地図が出ます","点击列表中的大使馆，这里会显示地图","點擊列表中的大使館，這裡會顯示地圖","Haz clic en una embajada de la lista para verla en el mapa"),
 ebNoLoc:T6("지도에 위치 정보가 없어 주소로 찾아요","No map position — search by address","地図の位置情報がないため住所で探します","没有地图位置信息，请按地址查找","沒有地圖位置資訊，請按地址查找","Sin ubicación en el mapa: busca por la dirección"),
 call:T6("전화","Call","電話","拨打","撥打","Llamar")
};
// 「어디 근처?」 네 곳 — 그 도시에서 손님이 가장 많이 찾는 자리 (사장님 배치도 「명동역 근처」)
var AREAS=[
 {k:"seoul",t:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),p:T6("명동역","Myeong-dong Station","明洞駅","明洞站","明洞站","Estación de Myeongdong"),lat:37.56098,lng:126.98628},
 {k:"busan",t:T6("부산","Busan","釜山","釜山","釜山","Busan"),p:T6("서면역","Seomyeon Station","西面駅","西面站","西面站","la estación de Seomyeon"),lat:35.1578,lng:129.0592}   /* 11-08 사장님 「서면역」 — 숙소 화면과 같은 부산 기준 */,
 {k:"gyeongju",t:T6("경주","Gyeongju","慶州","庆州","慶州","Gyeongju"),p:T6("황리단길","Hwangnidan-gil","ファンリダンギル","皇理团路","皇理團路","Hwangnidan-gil"),lat:35.83787,lng:129.20975},
 {k:"jeju",t:T6("제주","Jeju","済州","济州","濟州","Jeju"),p:T6("제주시청","Jeju City Hall","済州市庁","济州市厅","濟州市廳","Ayuntamiento de Jeju"),lat:33.49957,lng:126.53119}];
var TABS=[["store","am"],["food","fd"],["exchange","fx"],["embassy","eb"]];   // 주소 이름 → 앱 near.js 종류
var EUM={AT:1,BE:1,BG:1,HR:1,CY:1,CZ:1,DK:1,EE:1,FI:1,FR:1,DE:1,GR:1,HU:1,IE:1,IT:1,LV:1,LT:1,LU:1,MT:1,NL:1,PL:1,PT:1,RO:1,SK:1,SI:1,ES:1,SE:1};   // EU 회원국 27 — 국기 오른쪽 위에 EU 별 (사장님 11-08)

// ── 상태 (편의시설·긴급이 같이 씀) ──
var B={k:"seoul",lat:AREAS[0].lat,lng:AREAS[0].lng,nm:AREAS[0].p};   // 찾는 기준
var ST={q:"",qErr:"",me:"",ord:"",emq:"",emb:"",DATA:{}};
var CUR=null;   // 지금 그린 화면 {box, cfg}
function bName(){ return L6(B.nm); }
function hotel(){ try{ var tr=window.TRIP&&TRIP.state&&TRIP.state(), h=tr&&tr.opt&&tr.opt.hotel; if(h&&h.type!=="here"&&isFinite(+h.lat)&&+h.lat) return {h:h,no:+tr.pno||1}; }catch(e){} return null; }
function hName(h){ return fg()?KS0(h.en||h.ko||""):(h.ko||h.en||""); }
function setBase(b){ B=b; ST.qErr=""; ST.me=""; if(CUR&&CUR.cfg&&CUR.cfg.onBase) CUR.cfg.onBase(); }

// ── 자료 — 앱 near.js 받기 그대로 (같은 기준·같은 언어는 한 번) ──
function dKey(k,ti,ord){ return k+ti+"|"+B.lat.toFixed(4)+","+B.lng.toFixed(4)+"|"+LG()+"|"+(ord||""); }
function data(k,ti,ord,done){ var n=N(); if(!n) return {err:1}; var t=n.K[k].tabs[ti], key=dKey(k,ti,t.g?ord:""), d=ST.DATA[key];
  if(d&&d.err&&!d.busy){ delete ST.DATA[key]; d=null; }   // 실패한 것은 다음에 다시
  if(d) return d; d=ST.DATA[key]={items:null,busy:1}; var p=[B.lat,B.lng];
  n.fetch(t,p).then(function(it){ var raw=(it||[]).map(function(x){ var o=Object.assign({},x); o.dist=Math.round(window.kmLL(p,[+x.y,+x.x])*1000); return o; });
      var a=(it&&it.far)?raw:n.sort(raw,t,t.g?ord:""); d.items=a.slice(0,10); d.r=+(it&&it.r)||t.r; d.busy=0;
      d.wide=!t.g&&d.items.some(function(x){ return x.dist>t.r+50; }); done(); },
    function(){ d.err=1; d.busy=0; done(); });
  return d; }

// ── 왼쪽 「어디 근처?」 ──
function sideBase(){ var ht=hotel(), st=ST.me==="ing"?L6(TX.meIng):ST.me==="err"?L6(TX.meErr):ST.qErr||"";
  return '<h2>'+E(L6(TX.where))+'</h2>'
   +'<div class="pn-chips c4">'+AREAS.map(function(a){ return '<button type="button" data-pn="area" data-a="'+a.k+'" class="'+(B.k===a.k?"on":"")+'">'+E(L6(a.t))+'</button>'; }).join("")+'</div>'
   +'<label class="pn-lb" for="pnQ">'+E(L6(TX.qLb))+'</label><form class="pn-q" data-pn="qf"><input id="pnQ" type="search" maxlength="60" autocomplete="off" placeholder="'+E(L6(TX.qph))+'" value="'+E(ST.q)+'"><button type="submit" aria-label="'+E(L6(TX.qa))+'"><img src="img/menu/mi_search.png" alt=""></button></form>'
   +'<button type="button" class="pn-wide'+(B.k==="me"?" on":"")+'" data-pn="me">'+ico("mi_pin")+'<span><b>'+E(L6(TX.me))+'</b><small>'+E(L6(TX.meSub))+'</small></span></button>'
   +'<button type="button" class="pn-wide'+(B.k==="htl"?" on":"")+'" data-pn="htl"'+(ht?'':' disabled')+'>'+ico("mi_stay")+'<span><b>'+E(L6(TX.htl))+'</b><small>'+E(ht?L6(TX.diy)+" "+F(TX.plan,{n:ht.no})+" · "+hName(ht.h):L6(TX.htlNo))+'</small></span></button>'
   +'<div class="pn-st'+(st?'':' e')+(ST.me==="err"||ST.qErr?' bad':'')+'" id="pnSt" role="status">'+E(st)+'</div>'; }
function locate(){ return new Promise(function(ok){ if(!navigator.geolocation) return ok(null); var t=setTimeout(function(){ ok(null); },20000);   // 위치 동의 창(geoconsent.js)을 지나는 동안 넉넉히
  try{ navigator.geolocation.getCurrentPosition(function(p){ clearTimeout(t); ok([p.coords.latitude,p.coords.longitude]); },function(){ clearTimeout(t); ok(null); },{enableHighAccuracy:false,timeout:15000,maximumAge:120000}); }catch(e){ clearTimeout(t); ok(null); } }); }
function sideAct(c){ var a=c.getAttribute("data-pn");
  if(a==="area"){ var ar=AREAS.filter(function(x){ return x.k===c.getAttribute("data-a"); })[0]; if(ar){ ST.q=""; var qi=D.getElementById("pnQ"); if(qi) qi.value=""; setBase({k:ar.k,lat:ar.lat,lng:ar.lng,nm:ar.p}); } return true; }
  if(a==="me"){ ST.me="ing"; ST.qErr=""; stPaint(); locate().then(function(p){ if(!p){ ST.me="err"; stPaint(); return; } try{ if(window.ME&&!ME.pos&&window.meSet) meSet(p); }catch(e){} setBase({k:"me",lat:p[0],lng:p[1],nm:TX.meNm}); }); return true; }
  if(a==="htl"){ var ht=hotel(); if(ht) setBase({k:"htl",lat:+ht.h.lat,lng:+ht.h.lng,nm:hName(ht.h)}); return true; }
  return false; }
function qGo(){ var i=D.getElementById("pnQ"), q=i?String(i.value||"").trim():""; if(!q) return; ST.q=q; ST.qErr=""; stPaint(L6(TX.load));
  fetch(hub()+"/kplace?q="+encodeURIComponent(q)+(window.kpL?kpL():"")).then(function(r){ return r.json(); }).then(function(j){ var x=j&&j.ok&&(j.items||[])[0];   // 앱 검색칸과 같은 카카오 검색(무료)
    if(!x||!isFinite(+x.y)){ ST.qErr=F(TX.qNone,{q:q}); stPaint(); return; }
    setBase({k:"q",lat:+x.y,lng:+x.x,nm:fg()?KS0(x.name_en||x.name):x.name}); })
  .catch(function(){ ST.qErr=L6(TX.err); stPaint(); }); }
function stPaint(t){ var s=D.getElementById("pnSt"); if(!s) return; var v=t||(ST.me==="ing"?L6(TX.meIng):ST.me==="err"?L6(TX.meErr):ST.qErr||""); s.textContent=v; s.className="pn-st"+(v?"":" e")+((ST.me==="err"||ST.qErr)&&!t?" bad":""); }

// ── 가운데 목록 ──
function dirUrl(nmKo,lat,lng){ var f=window.ME&&ME.pos?{lat:ME.pos[0],lng:ME.pos[1]}:null, ll=lat+","+lng, nm=encodeURIComponent(nmKo||"");   // 앱 길찾기(linksTo)와 같은 주소 — 한국어 화면 카카오맵, 외국어 화면 구글 지도
  if(fg()) return "https://www.google.com/maps/dir/?api=1"+(window.hlG?hlG():"&hl=en")+(f?"&origin="+f.lat+","+f.lng:"")+"&destination="+ll;
  return f?"https://map.kakao.com/link/from/"+encodeURIComponent("내 위치")+","+f.lat+","+f.lng+"/to/"+nm+","+ll:"https://map.kakao.com/link/to/"+nm+","+ll; }
function telShow(t){ return fg()?(/^0/.test(t)?"+82 "+t.slice(1):"+82 "+t):t; }
function telHref(t){ try{ return "tel:"+(window.telIntl?telIntl(t):t); }catch(e){ return "tel:"+t; } }
function itemHtml(x,i,em){ var f=fg(), en=f&&x.name_en, nm=KS0(en?x.name_en:x.name), ad=f?(x.addr_en||x.addr):x.addr, ct=f?(x.cat_en||""):String(x.cat||"").split(">").pop().trim();
  var meta=[]; if(x.rating) meta.push('<b class="pn-star">★ '+(+x.rating).toFixed(1)+'</b> ('+(+x.n||0).toLocaleString("en-US")+')'); if(ct) meta.push(E(ct)); meta.push(E(kmt(x.dist)));
  var tel=x.tel?'<a class="pn-tel" href="'+E(telHref(x.tel))+'">'+ico("mi_phone")+E(telShow(x.tel))+'</a>':'';
  var bt=em?'<button type="button" class="pn-b w" data-pn="spot" data-i="'+i+'">'+E(L6(TX_MAP))+'</button>'+(x.tel?'<a class="pn-b red" href="'+E(telHref(x.tel))+'">'+ico("mi_phone")+E(L6(TX.call))+'</a>':'<span class="pn-b off">'+E(L6(TX.call))+'</span>')
    :'<button type="button" class="pn-b w" data-pn="det" data-i="'+i+'">'+E(L6(TX.det))+'</button><a class="pn-b" data-pn="dir" data-i="'+i+'" href="'+E(dirUrl(x.name,+x.y,+x.x))+'" target="_blank" rel="noopener">'+E(L6(TX.dir))+'</a>';
  return '<div class="pn-it" data-i="'+i+'"><div class="pn-ith"><span class="pn-no">'+(i+1)+'</span><b class="pn-nm"'+(em?' data-pn="det" data-i="'+i+'" role="button" tabindex="0"':'')+'>'+E(nm)+'</b></div>'
   +(en&&x.name_en!==x.name?'<div class="pn-ko">'+E(x.name)+'</div>':'')
   +'<div class="pn-meta">'+meta.join(" · ")+'</div>'
   +'<div class="pn-ad">'+E(ad||"")+(tel&&!em?' · '+tel:'')+'</div>'
   +(em&&x.tel?'<div class="pn-ad">'+tel+'</div>':'')
   +'<div class="pn-bt">'+bt+'</div></div>'; }
var TX_MAP=T6("지도","Map","地図","地图","地圖","Mapa");
function listTitle(kindName,ordName){ return F(TX.nearT,{p:bName(),k:kindName})+(ordName?" · "+ordName:""); }
// cfg = {k, ti, em, kind(이름), ord(정렬 이름)}
function listPaint(){ if(!CUR) return; var c=CUR.cfg, n=N(), L=D.getElementById("pnList"), lt=D.getElementById("pnLt"), ls=D.getElementById("pnLs"); if(!L||!n) return;
  var t=n.K[c.k].tabs[c.ti], d=data(c.k,c.ti,ST.ord,function(){ if(CUR&&CUR.cfg===c) { listPaint(); } });
  lt.textContent=listTitle(c.kind(),c.ordName());
  if(d.items==null&&!d.err){ ls.textContent=""; L.innerHTML='<div class="pn-msg">'+E(L6(TX.load))+'</div>'; mapPaint([]); return; }
  if(d.err){ ls.textContent=""; L.innerHTML='<div class="pn-msg">'+E(L6(TX.err))+'</div>'; mapPaint([]); return; }
  ls.textContent=F(t.g?TX.srcG:TX.srcK,{r:rkm(d.wide?10000:d.r)});
  CUR.items=d.items;
  L.innerHTML=d.items.length?(d.wide?'<div class="pn-note">'+E(L6(TX.far))+'</div>':'')+'<div class="pn-grid">'+d.items.map(function(x,i){ return itemHtml(x,i,c.em); }).join("")+'</div>':'<div class="pn-msg">'+E(L6(TX.none))+'</div>';
  mapPaint(d.items.map(function(x,i){ return {lat:+x.y,lng:+x.x,n:i+1,i:i}; })); }

// ── 오른쪽 그림 지도 — 앱 날짜 지도(trip.js dayMap)와 같은 그림을 잘라 번호 핀 ──
var GUF={seoulall:"seoulall",seoul:"seoulall",insadong:"seoulall",gyeongbok:"seoulall",myeongdong:"seoulall",busan:"busan"}, GUD={}, MSEQ=0;
function guData(f){ if(window.GU&&GU.all&&GU.all[f]) return Promise.resolve(GU.all[f]); if(GUD[f]) return GUD[f];
  var reg=(window.GU&&GU.reg)||{seoulall:"data/gu_seoul.json",busan:"data/gu_busan.json"}; if(!reg[f]) return Promise.resolve(null);
  var s=D.querySelector('script[src*="gu.js"]'), v=((s&&s.getAttribute("src")||"").match(/[?&]v=([0-9a-f]+)/)||[])[1]||"";
  return GUD[f]=fetch(reg[f]+"?v="+v).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
function ready(){ return new Promise(function(ok){ var t=0; (function w(){ if((window.CITY&&Object.keys(CITY).length&&window.meGeoFrac)||++t>60) return ok(); setTimeout(w,200); })(); }); }
function cover(pts){ var C=window.CITY||{}, best=null, bd=-1, ba=1e9; for(var id in C){ var q=C[id].bb; if(!q||!C[id].img||!C[id].geo) continue;
    if(!pts.every(function(p){ return p.lat>=q[0]&&p.lat<=q[2]&&p.lng>=q[1]&&p.lng<=q[3]; })) continue;
    var d=0, x=id; while(C[x]&&d<20){ x=C[x].parent; d++; } var ar=(q[2]-q[0])*(q[3]-q[1]); if(d>bd||(d===bd&&ar<ba)){ bd=d; ba=ar; best=id; } }
  return best; }
// 자를 자리 — F=[[x,y]] 그림 비율, as=그림 가로/세로, mw=가장 작은 폭(as 단위), r=상자 가로/세로
function crop(Fs,as,mw,r){ var x0=1e9, x1=-1e9, y0=1e9, y1=-1e9; Fs.forEach(function(f){ var X=f[0]*as; x0=Math.min(x0,X); x1=Math.max(x1,X); y0=Math.min(y0,f[1]); y1=Math.max(y1,f[1]); });
  var cx=(x0+x1)/2, cy=(y0+y1)/2, wv=Math.max((x1-x0)*1.3,mw,(y1-y0)*1.3*r), hv=wv/r;
  if(wv>as){ wv=as; hv=wv/r; } if(hv>1){ hv=1; wv=Math.min(as,r); }
  return {L0:Math.max(0,Math.min(as-wv,cx-wv/2)),T0:Math.max(0,Math.min(1-hv,cy-hv/2)),wv:wv,hv:hv,as:as}; }
function pc(v){ return (Math.round(v*10000)/100)+"%"; }
function lay(cr,b){ return 'left:'+pc((b[0]*cr.ax-cr.L0)/cr.wv)+';top:'+pc((b[1]-cr.T0)/cr.hv)+';width:'+pc((b[2]-b[0])*cr.ax/cr.wv)+';height:'+pc((b[3]-b[1])/cr.hv); }
function kmWide(id,cr){ try{ var cy=(cr.T0+cr.hv/2), a=meGeoInv(id,cr.L0/cr.as,cy), b=meGeoInv(id,(cr.L0+cr.wv)/cr.as,cy); return a&&b?kmLL(a,b):0; }catch(e){ return 0; } }
// pts=[{lat,lng,n,i}] · o={base:{lat,lng}, one:1(대사관 하나), host}
function mapDraw(host,pts,o){ o=o||{}; var my=++MSEQ; host._seq=my; var w=host.clientWidth||400, r=phone()?1.3:(w>=520?1.6:0.86);   // 상자 가로/세로 — PC 오른쪽 칸은 세로로 길게, 좁은 PC(가운데 위)·폰은 가로로
  if(!pts.length&&!o.base){ host.innerHTML=''; return; }
  host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapIng))+'</div>';
  ready().then(function(){ if(host._seq!==my) return; var all=pts.slice(); if(o.base) all.push(o.base);
    var id=cover(all); if(!id){ host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapNo))+'</div>'; return; }
    var gf=GUF[id];
    if(gf&&CITY[gf]&&CITY[gf].geo) return guData(gf).then(function(G){ if(host._seq!==my) return; if(G&&G.ch&&G.img) mapGu(host,gf,G,pts,o,r); else mapOld(host,id,pts,o,r); });
    mapOld(host,id,pts,o,r); }); }
function pinsHtml(cr,fr,pts,o){ var h='';
  if(o.base){ var fb=fr(o.base); if(fb) h+='<span class="pn-bdot" style="left:'+pc((fb[0]*cr.ax-cr.L0)/cr.wv)+';top:'+pc((fb[1]-cr.T0)/cr.hv)+'" title="'+E(L6(TX.base)+" · "+bName())+'"></span>'; }
  pts.forEach(function(p){ var f=fr(p); if(!f) return; var st='left:'+pc((f[0]*cr.ax-cr.L0)/cr.wv)+';top:'+pc((f[1]-cr.T0)/cr.hv);
    h+=o.one?'<span class="pn-mk" style="'+st+'"><img src="img/menu/mi_pin.png" alt=""></span>':'<button type="button" class="pn-pin" data-pn="pin" data-i="'+p.i+'" style="'+st+'">'+p.n+'</button>'; });
  return h; }
function mapGu(host,f,G,pts,o,r){ var ch=G.ch, G2=ch.G2, C=ch.C, fr=function(p){ return meGeoFrac(f,+p.lat,+p.lng); };
  var Fs=pts.map(fr).concat(o.base?[fr(o.base)]:[]).filter(Boolean); if(!Fs.length){ host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapNo))+'</div>'; return; }
  var cr=crop(Fs,1,0.035,r); cr.ax=1; if(kmWide(f,cr)>15){ host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapNo))+'</div>'; return; }
  var px=cr.wv*G2, lv=px<=2700?0:px<=10800?1:2, inC=function(b){ return b[2]>cr.L0&&b[0]<cr.L0+cr.wv&&b[3]>cr.T0&&b[1]<cr.T0+cr.hv; };
  var h='<img class="pn-mb" src="'+E(G.img)+'" alt="" style="'+lay(cr,[0,0,1,1])+'">';
  if(lv<2){ var sz=lv?C*4:C, ov=sz/G2*0.003, set={}, dir=(ch.dir||"img/gu/c")+(lv?"1":""); ((lv?ch.l1:ch.l0)||[]).forEach(function(q){ set[q[0]+"_"+q[1]]=1; });   // 앱 구 화면 조각 그림(trip.js guMap 과 같은 자리) · 조각 사이 틈이 안 보이게 살짝 겹침
    for(var x=Math.floor(cr.L0*G2/sz);x<=Math.floor((cr.L0+cr.wv)*G2/sz);x++) for(var y=Math.floor(cr.T0*G2/sz);y<=Math.floor((cr.T0+cr.hv)*G2/sz);y++) if(set[x+"_"+y]){ var b=[x*sz/G2,y*sz/G2,(x+1)*sz/G2+ov,(y+1)*sz/G2+ov]; h+='<img class="pn-mt" src="'+E(dir+"/"+x+"_"+y+".jpg?v="+ch.v)+'" alt="" style="'+lay(cr,b)+'">'; }
    (G.gus||[]).forEach(function(og){ var ho=og.ho||[]; for(var k in (og.ic||{})){ var q=G.P&&G.P[k], b2=og.ic[k]; if(!q||ho.indexOf(k)>=0||/^__kara_/.test((G.act&&G.act[k])||"")||!inC(b2)) continue;
      h+='<img class="pn-mi" src="'+E(q.i)+'" alt="" style="'+lay(cr,b2)+(+b2[4]?';transform:rotate('+(+b2[4])+'deg)':'')+'">'; } }); }   // 구 화면 그림 (노래방은 숨김 — gu.js 와 같게)
  else { (G.gus||[]).forEach(function(og){ var q=og.rep&&G.P&&G.P[og.rep]; if(q&&inC(q.b)) h+='<img class="pn-mi c" src="'+E(q.i)+'" alt="" style="'+lay(cr,q.b)+'">'; }); }
  host.innerHTML='<div class="pn-mc" style="aspect-ratio:'+(cr.wv/cr.hv).toFixed(4)+'">'+h+pinsHtml(cr,fr,pts,o)+'</div>'; }
function mapOld(host,id,pts,o,r){ var c=CITY[id], as=c.aspect||1, fr=function(p){ return meGeoFrac(id,+p.lat,+p.lng); };
  var Fs=pts.map(fr).concat(o.base?[fr(o.base)]:[]).filter(Boolean); if(!Fs.length){ host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapNo))+'</div>'; return; }
  var cr=crop(Fs,as,0.12*as,r); cr.ax=as; if(kmWide(id,cr)>15){ host.innerHTML='<div class="pn-mmsg">'+E(L6(TX.mapNo))+'</div>'; return; }
  var h='<img class="pn-mb" src="'+E(c.img)+'" alt="" style="'+lay(cr,[0,0,1,1])+'">';
  host.innerHTML='<div class="pn-mc" style="aspect-ratio:'+(cr.wv/cr.hv).toFixed(4)+'">'+h+pinsHtml(cr,fr,pts,o)+'</div>'; }
function mapPaint(pts){ var m=D.getElementById("pnMap"), mc=D.getElementById("pnMc"); if(!m) return;
  mapDraw(m,pts,{base:{lat:B.lat,lng:B.lng}});
  if(mc) mc.innerHTML='<b><span class="pn-bdot s"></span>'+E(bName())+'</b>'+(pts.length?'<small>'+E(L6(touch()?TX.mapHintT:TX.mapHint))+'</small>':''); }
function pinHi(i,on,stay){ [].forEach.call(D.querySelectorAll("#pnMap .pn-pin"),function(p){ var me=p.getAttribute("data-i")===String(i); if(stay){ p.classList.toggle("on",me&&on); } else p.classList.toggle("hi",me&&on); }); }
function itemGo(i){ var it=D.querySelector('#pnList .pn-it[data-i="'+i+'"]'); if(!it) return; try{ it.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){ it.scrollIntoView(); }
  it.classList.remove("flash"); void it.offsetWidth; it.classList.add("flash"); setTimeout(function(){ it.classList.remove("flash"); },1600); }

// ── 「자세히」 = 앱 장소 카드(#res, spinCard)를 화면 가운데 창에 — 닫으면 #res 를 제자리로 ──
var DET=null;
function detOpen(x){ var res=D.getElementById("res"); if(!res||typeof window.spinCard!=="function"||!window.PLACES) return false; detClose();
  var ov=D.createElement("div"); ov.id="pcnDet"; ov.className="pn-ov";
  ov.innerHTML='<div class="pn-pop" role="dialog" aria-modal="true"><button type="button" class="pn-x" data-pn="detx" aria-label="'+E(L6(TX.close))+'">✕</button><div class="pn-dh"></div></div>';
  D.body.appendChild(ov);
  var frag=D.createDocumentFragment(); while(res.firstChild) frag.appendChild(res.firstChild);
  DET={res:res,par:res.parentNode,nx:res.nextSibling,frag:frag,pin:PLACES.__pin,ck:window._cardK,rr:window._RR};
  ov.querySelector(".pn-dh").appendChild(res);
  PLACES.__pin={own:0,ko:x.name,en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",lat:+x.y,lng:+x.x,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||"",_l:x.name_en?LG():"ko",oh:Array.isArray(x.oh)?x.oh:undefined,gt:Array.isArray(x.gt)?x.gt:undefined};   // 앱 near.js pick → spinShow 와 같은 칸
  try{ window.spinCard(); }catch(e){}
  H.classList.add("pnlock"); ov.addEventListener("click",function(e){ if(e.target===ov) detClose(); }); return true; }
function detClose(){ var o=D.getElementById("pcnDet"); if(DET){ var d=DET; DET=null;
    try{ d.res.innerHTML=""; d.res.appendChild(d.frag); if(d.nx&&d.nx.parentNode===d.par) d.par.insertBefore(d.res,d.nx); else d.par.appendChild(d.res); }catch(e){}
    try{ if(d.pin) PLACES.__pin=d.pin; else delete PLACES.__pin; window._cardK=d.ck; window._RR=d.rr; }catch(e){} }
  if(o) o.remove(); H.classList.remove("pnlock"); }
D.addEventListener("keydown",function(e){ if(e.key==="Escape"&&D.getElementById("pcnDet")) detClose(); });

// ── 화면 틀 (편의시설·긴급 같이) — cfg = {id, route, em, head(), top(), sideExtra(), main(), k, ti, kind(), ordName(), onBase} ──
window.addEventListener("hashchange",function(){ detClose(); });   // 아랫줄 메뉴 노랑 밑줄은 pc.js(NAVR) 가 한다
// 첫 화면으로(PCGO("") = pushState, hashchange 없음) 갈 때 아랫줄 노랑 밑줄도 지운다 (pc.js navOn 은 hashchange 때만 돈다)
(function(){ var g=window.PCGO; if(typeof g!=="function"||g._pn) return; var w=function(p){ var r=g.apply(this,arguments); if(!p){ detClose(); [].forEach.call(D.querySelectorAll("#phNav button.on"),function(b){ b.classList.remove("on"); }); } return r; }; w._pn=1; window.PCGO=w; })();
function frame(box,cfg){ CUR={box:box,cfg:cfg}; try{ var n=N(); if(n) n.css(); }catch(e){}
  box.innerHTML='<div id="'+cfg.id+'" class="pn3'+(cfg.em?' pn-em':'')+'">'+cfg.head()
   +'<div class="pn-g">'
   +'<aside class="pn-side">'+(cfg.side?cfg.side():sideBase()+(cfg.sideExtra?cfg.sideExtra():''))+'</aside>'
   +(cfg.top?'<div class="pn-top">'+cfg.top()+'</div>':'')
   +'<section class="pn-main">'+(cfg.main?cfg.main():'<div class="pn-lh"><h2 id="pnLt"></h2><div class="pn-ls" id="pnLs"></div></div><div id="pnList"></div>')+'</section>'
   +'<aside class="pn-r"><div class="pn-mapw"><div class="pn-map" id="pnMap"></div><div class="pn-mcap" id="pnMc"></div></div></aside>'
   +'</div></div>';
  if(cfg.after) cfg.after(); else listPaint(); }
function mine(id){ return CUR&&CUR.cfg&&CUR.cfg.id===id&&D.body.contains(CUR.box); }
function redraw(){ if(!CUR||!D.body.contains(CUR.box)) return; var y=window.scrollY, q=D.getElementById("pnQ"), qv=q?q.value:null; frame(CUR.box,CUR.cfg); var q2=D.getElementById("pnQ"); if(q2&&qv!=null) q2.value=qv; if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y); }
function sidePaint(){ var s=D.querySelector("#pcPage .pn-side"); if(!s||!CUR) return; var q=D.getElementById("pnQ"), qv=q?q.value:null, foc=q&&D.activeElement===q; s.innerHTML=CUR.cfg.side?CUR.cfg.side():sideBase()+(CUR.cfg.sideExtra?CUR.cfg.sideExtra():''); var q2=D.getElementById("pnQ"); if(q2&&qv!=null){ q2.value=qv; if(foc) q2.focus(); } }

// ── 편의시설 화면 ──
function tabOf(a){ for(var i=0;i<TABS.length;i++) if(TABS[i][0]===a) return TABS[i]; return TABS[0]; }
function nmK(k){ var n=N(); return n&&n.MENU6[k]?L6(n.MENU6[k]):k; }
function headNear(cur){ var n=N();
  return '<header class="pn-hd"><h1>'+E(T2("편의시설","Convenience"))+'</h1><p>'+E(L6(TX.sub))+'</p>'
   +'<nav class="pn-tabs t4">'+TABS.map(function(t){ return '<button type="button" data-pn="tab" data-t="'+t[0]+'" class="'+(t[0]===cur?"on":"")+'">'+ico(n&&n.ICON[t[1]]||"mi_amenity")+'<span>'+E(nmK(t[1]))+'</span></button>'; }).join("")+'</nav></header>'; }
function radNote(){ var n=N(); if(!n) return ""; return '<div class="pn-nt"><b>'+E(L6(TX.rad))+'</b> '+["am","fd","fx"].map(function(k){ return E(nmK(k))+" "+rkm(n.K[k].tabs[0].r); }).join(" · ")+'</div>'; }
function nearCfg(tab){ var t=tabOf(tab), k=t[1];
  if(k==="eb") return embCfg();
  return {id:"pcNear",route:"near",k:k,ti:0,head:function(){ return headNear(t[0]); },
    sideExtra:function(){ var g=k==="fd"; return (g?'<h3>'+E(L6(TX.sort))+'</h3><div class="pn-chips c2">'+[["",TX.oNear],["r",TX.oRate]].map(function(o){ return '<button type="button" data-pn="ord" data-o="'+o[0]+'" class="'+((ST.ord||"")===o[0]?"on":"")+'">'+E(L6(o[1]))+'</button>'; }).join("")+'</div>':'')
      +radNote()+(g?'<div class="pn-nt">'+E(L6(TX.fdNote))+'</div>':''); },
    kind:function(){ return nmK(k); }, ordName:function(){ return k==="fd"?L6(ST.ord==="r"?TX.oRate:TX.oNear):L6(TX.oNear2); },
    onBase:function(){ sidePaint(); listPaint(); }}; }

// ── 대사관 (나라 이름 순 · 「나라 찾기」 · 국기 그림 + EU 별) ──
function nz(s){ s=String(s||""); try{ s=s.normalize("NFD").replace(/[̀-ͯ]/g,""); }catch(e){} return s.toLowerCase().replace(/[\s·.,'’()\-]/g,""); }
function embAll(){ var n=N(); if(!n) return []; var a=n.EMB.slice(); if(n.embL()){ var lc={ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LG()]; a.sort(function(x,y){ return String(n.embKey(x)).localeCompare(String(n.embKey(y)),lc); }); } return a; }   // 앱 대사관 목록과 같은 차례
function embHit(x,q){ var n=N(), w=[x.e,x.k,x.n,x.ne,n.embN(x),n.embC(x)].concat((window.EMB_L&&EMB_L[x.f])||[]); for(var i=0;i<w.length;i++) if(nz(w[i]).indexOf(q)>=0) return true; return false; }
function embCountry(x){ var n=N(); return n.embL()?n.embC(x):x.e+" · "+n.embC(x); }
function flagHtml(x,cls){ var f=String(x.f||"").toLowerCase(); return '<span class="pn-fw'+(cls?" "+cls:"")+'"><img class="pn-fl" src="home/img/flags/'+E(f)+'.png" alt="" loading="lazy">'+(EUM[x.f]?'<img class="pn-eu" src="home/img/flags/eu_stars.png" alt="">':'')+'</span>'; }
function embCard(x){ var f=fg(), tel=x.t?telShow(x.t):"";
  return '<div class="pn-ec'+(ST.emb===x.f?' on':'')+'" data-pn="emb" data-f="'+E(x.f)+'" role="button" tabindex="0">'+flagHtml(x)
   +'<span class="pn-et"><span class="pn-ec1">'+E(embCountry(x))+'</span><b>'+E(N().embN(x))+'</b><span class="pn-ead">'+E(f?(x.ae||x.a):x.a)+'</span>'+(tel?'<span class="pn-etel">'+ico("mi_phone")+E(tel)+'</span>':'')+'</span></div>'; }
function embList(){ var q=nz(ST.emq), a=embAll().filter(function(x){ return !q||embHit(x,q); });
  return a.length?'<div class="pn-egrid">'+a.map(embCard).join("")+'</div>':'<div class="pn-msg">'+E(F(TX.ebNone,{q:ST.emq}))+'</div>'; }
function embPick(){ var n=N(); if(!n||!ST.emb) return null; return n.EMB.filter(function(x){ return x.f===ST.emb; })[0]||null; }
function embMap(){ var m=D.getElementById("pnMap"), mc=D.getElementById("pnMc"); if(!m) return; var x=embPick(), f=fg();
  if(!x){ m.innerHTML='<div class="pn-mmsg pn-mph">'+ico("mi_embassy")+'<span>'+E(L6(TX.ebPick))+'</span></div>'; if(mc) mc.innerHTML=""; return; }
  if(x.y) mapDraw(m,[{lat:x.y,lng:x.x,n:"",i:0}],{one:1}); else m.innerHTML='<div class="pn-mmsg">'+ico("mi_embassy")+'<span>'+E(L6(TX.ebNoLoc))+'</span></div>';
  var q=encodeURIComponent(x.a), go=x.y?dirUrl(x.n,x.y,x.x):(f?"https://www.google.com/maps/search/?api=1"+(window.hlG?hlG():"&hl=en")+"&query="+q:"https://map.kakao.com/?q="+q);
  if(mc) mc.innerHTML='<div class="pn-esel">'+flagHtml(x,"s")+'<span><b>'+E(N().embN(x))+'</b>'+(f?'<small class="pn-ko">'+E(x.n)+'</small>':'')+'</span></div>'
    +'<div class="pn-ead2">'+E(f?(x.ae||x.a):x.a)+'</div>'
    +'<div class="pn-bt"><a class="pn-b w" href="'+E(go)+'" target="_blank" rel="noopener">'+E(L6(TX.dir))+'</a>'+(x.t?'<a class="pn-b" href="'+E(telHref(x.t))+'">'+ico("mi_phone")+E(L6(TX.call))+'</a>':'')+'</div>'; }
function embCfg(){ return {id:"pcNear",route:"near",emb:1,head:function(){ return headNear("embassy"); },
    side:function(){ var n=N(); return '<h2>'+E(nmK("eb"))+'</h2><p class="pn-p">'+E(F(TX.ebN,{n:n?n.EMB.length:37}))+'</p><p class="pn-p">'+E(L6(TX.ebHow))+'</p>'
      +'<h3>'+E(L6(TX.ebGo))+'</h3><p class="pn-p">'+E(L6(TX.ebPass))+'</p>'; },
    main:function(){ return '<form class="pn-q pn-eq" data-pn="ef"><input id="pnEQ" type="search" maxlength="40" autocomplete="off" placeholder="'+E(L6(TX.ebQ))+'" value="'+E(ST.emq)+'"><button type="submit" aria-label="'+E(L6(TX.qa))+'"><img src="img/menu/mi_search.png" alt=""></button></form><div id="pnEL">'+embList()+'</div>'; },
    after:function(){ embMap(); }}; }

// ── 길잡이 등록 ──
PCREG("near",function(box,args){ detClose(); frame(box,nearCfg(args&&args[0])); });

// ── 누르기 (편의시설·긴급 같이) ──
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest) return;
  if(t.closest("#pcnDet [data-pn=detx]")){ detClose(); return; }
  var root=t.closest("#pcPage .pn3"); if(!root||!CUR) return; var c=t.closest("[data-pn]"); if(!c) return; var a=c.getAttribute("data-pn"), cfg=CUR.cfg;
  if(a==="tab"){ PCGO(cfg.route+"/"+c.getAttribute("data-t")); return; }
  if(sideAct(c)) return;
  if(a==="ord"){ ST.ord=c.getAttribute("data-o")||""; sidePaint(); listPaint(); return; }
  if(a==="pin"){ var pi=c.getAttribute("data-i"); pinHi(pi,true,true); itemGo(pi); return; }
  if(a==="spot"){ var si=c.getAttribute("data-i"); pinHi(si,true,true); if(phone()){ var mw=D.querySelector("#pcPage .pn-r"); if(mw) try{ mw.scrollIntoView({behavior:"smooth",block:"start"}); }catch(x){} } return; }
  if(a==="det"){ var x=(CUR.items||[])[+c.getAttribute("data-i")]; if(x){ try{ N().tap(cfg.k,N().K[cfg.k].tabs[cfg.ti]); }catch(y){} detOpen(x); } return; }
  if(a==="dir"){ try{ N().tap(cfg.k,N().K[cfg.k].tabs[cfg.ti]); }catch(y){} return; }   // 바깥 길찾기 — 앱과 같은 누름 집계만
  if(a==="emb"){ ST.emb=c.getAttribute("data-f"); [].forEach.call(D.querySelectorAll("#pnEL .pn-ec"),function(x){ x.classList.toggle("on",x===c); }); embMap(); if(phone()){ var r=D.querySelector("#pcPage .pn-r"); if(r) try{ r.scrollIntoView({behavior:"smooth",block:"start"}); }catch(x){} } return; }
});
D.addEventListener("submit",function(e){ var f=e.target; if(!f.closest||!f.closest("#pcPage .pn3")) return; e.preventDefault(); var a=f.getAttribute("data-pn"); if(a==="qf") qGo(); });
D.addEventListener("input",function(e){ if(e.target.id!=="pnEQ") return; ST.emq=e.target.value; var l=D.getElementById("pnEL"); if(l) l.innerHTML=embList(); });
D.addEventListener("keydown",function(e){ if(e.key!=="Enter"&&e.key!==" ") return; var c=e.target.closest&&e.target.closest("#pcPage .pn-ec, #pcPage .pn-nm[data-pn]"); if(!c||e.target!==c) return; e.preventDefault(); c.click(); });
// 목록에 마우스를 올리면 그 핀이 커진다
var HOV=null;
D.addEventListener("mouseover",function(e){ var it=e.target.closest&&e.target.closest("#pnList .pn-it"), i=it?it.getAttribute("data-i"):null; if(i===HOV) return; HOV=i; pinHi(i,i!=null,false); });

// ── 언어를 바꾸면 이 화면도 그 자리에서 다시 (긴급 화면 포함) ──
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(CUR&&D.body.contains(CUR.box)&&/^#\/(near|sos)(\/|$)/.test(location.hash||"")) redraw(); }catch(e){} return r; };
// 폰 ↔ PC 폭이 바뀌면 지도 상자 비율을 다시
["(max-width:640px)","(max-width:1180px)"].forEach(function(q){ try{ var mq=matchMedia(q), mqf=function(){ if(CUR&&D.body.contains(CUR.box)) redraw(); }; if(mq.addEventListener) mq.addEventListener("change",mqf); else if(mq.addListener) mq.addListener(mqf); }catch(e){} });

window.PCNEAR={TX:TX,T6:T6,L6:L6,F:F,E:E,ico:ico,frame:frame,sideBase:sideBase,listPaint:listPaint,detOpen:detOpen,detClose:detClose,mine:mine,redraw:redraw,sidePaint:sidePaint,rkm:rkm,
  base:function(){ return B; },state:function(){ return ST; },map:mapDraw};
})();
