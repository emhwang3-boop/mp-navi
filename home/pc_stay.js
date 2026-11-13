/* MosaicTrip.com 홈페이지 — 숙소 (11-08 4a단계 · 배치도 tour_site\wireframes\5_숙소_배치도, 사장님 11-08 통과)
 *  · #/stay — 맨 윗줄(제목·한 줄 설명) · 왼쪽 330 종류 넷·어디 근처?·정렬 · 가운데 숙소 카드 2줄씩 · 오른쪽 380 따라오는 그 동네 그림 지도 + 번호 핀
 *  · 로직은 앱 near.js 그대로 (window.NEARST — PC_HOME 일 때만): 숙소 찾기(카카오 숙박 /kplace · 관광공사 kto · 구글 별점 /gplace · 한옥 먼 곳)
 *    · 「예약하기」 = 앱 예약 창(Agoda·Booking.com·Trip.com 그 숙소 이름 검색, 새 창)
 *  · 카드 사진 = 앱 장소 사진과 같은 길(TRIP.photo = 허브 /gphoto · 같은 캐시 _cphC · 허브가 1시간 저장) — 화면에 들어온 카드만 · 사장님 11-08 「나머진 OK」(숙소 한 곳 약 50원)
 *  · 「자세히」 = 앱 장소 카드(#res · spinCard — ＋ 내 여행에 담기·예약하기·후기·길찾기 그대로)를 화면 가운데 창에 띄운다. 첫 화면 지도는 움직이지 않는다
 *  · 오른쪽 그림 지도 = 앱 약도 그림(regions.json 약도·전국 지도)에서 숙소들이 들어가는 가장 자세한 약도를 잘라 번호 핀만 얹는다(새 그림 없음)
 *  · 선물 고르기(pc_gift.js)도 같이 쓰는 부품은 window.PCSTAY 로 내놓는다: 가운데 장소 카드 창(pin·place) · 그림 지도(map) · 어디 근처 고르기(Where) · 사진(photo)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장 · 앱에 이미 있는 글은 앱 것(T)
 */
(function(){
"use strict";
var APP=!window.PC_HOME;   // 11-13 사장님 「웹에서 숙소 버튼 화면과 앱 숙소 화면을 비교해서 웹에 맞춰줘」 — 앱(폰)에서도 이 화면을 전체 화면 창(#apStay)으로 띄운다 · near.js open("st") 가 처음 누를 때 이 파일을 받는다
if(!APP&&!window.PCREG) return;
var D=document, H=D.documentElement;
function $(id){ return D.getElementById(id); }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function F(o,v){ var s=typeof o==="string"?o:L6(o); for(var k in v) s=s.split("{"+k+"}").join(v[k]); return s; }
function TT(ko,en){ try{ return window.T?window.T(ko,en):(window.LANG==="ko"?ko:en); }catch(e){ return window.LANG==="ko"?ko:en; } }   // 앱에 있는 글 = 앱 번역 그대로
function FL(){ return window.LANG!=="ko"; }
function KSs(s){ try{ return window.KS?KS(s):s; }catch(e){ return s; } }
function phone(){ return !!(window.matchMedia&&matchMedia("(max-width:640px)").matches); }
function touch(){ return !!(window.matchMedia&&matchMedia("(hover:none)").matches); }
function ico(n,c){ return '<img class="'+(c||"pcs-ic")+'" src="img/menu/'+n+'.png" alt="">'; }
function hub(){ return window.HUB||"https://brief-live-hub.emhwang3.workers.dev"; }
function kmD(m){ return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"; }
function KMs(a,b){ try{ return kmLL(a,b); }catch(e){ var R=6371, rd=Math.PI/180, x=(b[0]-a[0])*rd, y=(b[1]-a[1])*rd, h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a[0]*rd)*Math.cos(b[0]*rd)*Math.sin(y/2)*Math.sin(y/2); return 2*R*Math.asin(Math.sqrt(h)); } }

// ── 같이 쓰는 글 (6개 언어) ──
var CM={
 where:T6("어디 근처?","Near where?","どのあたり？","在哪附近？","在哪附近？","¿Cerca de dónde?"),
 qph:T6("동네·역·명소 이름 (예: 명동역)","Area or station (e.g. Myeongdong)","地域・駅・名所（例：明洞駅）","街区·车站·景点（例：明洞站）","街區·車站·景點（例：明洞站）","Barrio o estación (ej.: Myeongdong)"),
 qb:T6("찾기","Search","検索","搜索","搜尋","Buscar"),
 me:T6("내 위치로","Use my location","現在地にする","用我的位置","用我的位置","Usar mi ubicación"),
 my:T6("내 위치","My location","現在地","我的位置","我的位置","Mi ubicación"),
 trip:T6("내 일정 숙소 근처","Near my trip's lodging","旅程の宿の近く","我行程中的住处附近","我行程中的住處附近","Cerca del alojamiento de mi viaje"),
 tripS:T6("{h} · AI와 자유여행 {p}","{h} · DIY Trip {p}","{h}・DIY旅行 {p}","{h} · 自助游 {p}","{h} · 自助旅行 {p}","{h} · Viaje a tu aire {p}"),
 plan:T6("플랜 {n}","Plan {n}","プラン{n}","方案{n}","方案{n}","Plan {n}"),   // 앱 「내 플랜」 이름과 같게 (trip.js PL6)
 tripNo:T6("AI와 자유여행에서 숙소를 정하면 쓸 수 있어요","Available once you set your lodging in DIY Trip","DIY旅行で宿を決めると使えます","在自助游中设定住处后即可使用","在自助旅行中設定住處後即可使用","Disponible cuando elijas alojamiento en Viaje a tu aire"),
 locErr:T6("위치를 받을 수 없어요. 브라우저에서 위치 사용을 허락하거나, 동네·역 이름으로 찾아 주세요.","Couldn't get your location. Allow location access in your browser, or search by area or station name.","現在地を取得できません。ブラウザで位置情報の使用を許可するか、地域・駅の名前で探してください。","无法获取您的位置。请在浏览器中允许使用位置，或按街区·车站名称查找。","無法取得您的位置。請在瀏覽器中允許使用位置，或依街區·車站名稱搜尋。","No pudimos obtener tu ubicación. Permite el acceso a la ubicación en el navegador o busca por barrio o estación."),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 ld:T6("불러오는 중…","Loading…","読み込み中…","正在加载…","正在載入…","Cargando…")
};
// 「어디 근처?」 도시 넷 (배치도 · 사장님 11-08) — 손님이 많이 묵고 다니는 한가운데 한 곳씩
var CITY4=[{c:"seoul",n:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),p:T6("명동역","Myeongdong Station","明洞駅","明洞站","明洞站","la estación de Myeongdong"),lat:37.5609,lng:126.9863},
 {c:"busan",n:T6("부산","Busan","釜山","釜山","釜山","Busan"),p:T6("서면역","Seomyeon Station","西面駅","西面站","西面站","la estación de Seomyeon"),lat:35.1578,lng:129.0592},
 {c:"gyeongju",n:T6("경주","Gyeongju","慶州","庆州","慶州","Gyeongju"),p:T6("황리단길","Hwangnidan-gil","皇理団ギル","皇理团路","皇理團路","Hwangnidan-gil"),lat:35.8376,lng:129.2097},
 {c:"jeju",n:T6("제주","Jeju","済州","济州","濟州","Jeju"),p:T6("제주시청","Jeju City Hall","済州市庁","济州市政府","濟州市政府","el Ayuntamiento de Jeju"),lat:33.4996,lng:126.5312}];
function cityBase(c){ var o=CITY4.filter(function(x){ return x.c===c; })[0]||CITY4[0]; return {k:"city",c:o.c,lat:o.lat,lng:o.lng,nm:o.p}; }
function baseName(b){ if(!b) return ""; if(b.k==="city") return L6(b.nm); if(b.k==="me") return L6(CM.my); return KSs(FL()&&b.en?b.en:b.ko); }
// 「내 일정 숙소」 = AI와 자유여행 지금 플랜 숙소 칸(trip.js opt.nh, 11-09 「숙소는 모두 연동」)의 그 밤 숙소 — 여행 중이면 오늘 밤, 여행 전이면 첫날 밤 · 읽기만
function tripHotel(){ try{ var r=window.TRIP&&TRIP.stay&&TRIP.stay.now(), h=r&&r.h;
  return h&&h.type!=="here"&&+h.lat?{h:h,pno:r.no||1}:null; }catch(e){ return null; } }
function hName(h){ return KSs(FL()&&h.en?h.en:(h.ko||h.en||"")); }

// ══ 어디 근처 고르기 (숙소·선물 같이) — 도시 넷 · 동네·역 이름 찾기(허브 /kplace 카카오, 무료) · 내 위치 · 내 일정 숙소 ══
var WREG={};
function Where(o){ var w={id:o.id,base:cityBase("seoul"),q:"",res:null,msg:"",busy:0,seq:0};
  w.html=function(){ var b=w.base, h='<div class="pcs-sec pcs-wh"><h3>'+E(L6(o.title||CM.where))+'</h3>'
    +'<div class="pcs-chips pcs-cch" style="grid-template-columns:repeat(4,minmax(0,1fr))">'+CITY4.map(function(c){ return '<button type="button" data-wh="c" data-w="'+w.id+'" data-c="'+c.c+'" class="'+(b.k==="city"&&b.c===c.c?"on":"")+'">'+E(L6(c.n))+'</button>'; }).join("")+'</div>'
    +'<form class="pcs-q" data-whf="'+w.id+'" autocomplete="off"><input type="search" class="pcs-in" id="'+w.id+'Q" enterkeyhint="search" placeholder="'+E(L6(o.ph||CM.qph))+'" value="'+E(w.q)+'" aria-label="'+E(L6(o.ph||CM.qph))+'"><button type="submit" class="pcs-qb" aria-label="'+E(L6(CM.qb))+'"><img src="img/menu/mi_search.png" alt=""></button></form>'
    +(w.busy?'<div class="pcs-qm">'+E(TT("찾는 중…","Searching…"))+'</div>':w.msg?'<div class="pcs-qm">'+E(w.msg)+'</div>':'')
    +(w.res&&w.res.length?'<div class="pcs-qr">'+w.res.map(function(x,i){ var en=FL()&&x.name_en; return '<button type="button" data-wh="r" data-w="'+w.id+'" data-i="'+i+'"><b>'+E(KSs(en?x.name_en:x.name))+'</b><small>'+E((en?(x.addr_en||x.addr):x.addr)||"")+'</small></button>'; }).join("")+'</div>':'')
    +(b.k==="q"&&!w.res&&!w.busy?'<div class="pcs-cur">'+ico("mi_pin")+'<span>'+E(baseName(b))+'</span></div>':'')
    +'<button type="button" class="pcs-wb'+(b.k==="me"?" on":"")+'" data-wh="me" data-w="'+w.id+'">'+ico("mi_pin")+'<span>'+E(L6(CM.me))+'</span></button>';
    if(o.trip){ var th=tripHotel(); h+='<button type="button" class="pcs-wb'+(b.k==="trip"?" on":"")+'" data-wh="trip" data-w="'+w.id+'"'+(th?'':' disabled')+'>'+ico("mi_calendar")+'<span>'+E(L6(CM.trip))+'<small>'+E(th?F(CM.tripS,{h:hName(th.h),p:F(CM.plan,{n:th.pno})}):L6(CM.tripNo))+'</small></span></button>'; }
    return h+'</div>'; };
  w.set=function(b){ w.base=b; w.res=null; w.msg=""; w.busy=0; o.onSet(); };
  w.act=function(el){ var a=el.getAttribute("data-wh");
    if(a==="c"){ w.q=""; return w.set(cityBase(el.getAttribute("data-c"))); }
    if(a==="r"){ var x=w.res&&w.res[+el.getAttribute("data-i")]; if(!x) return; var en=FL()&&x.name_en; w.q=KSs(en?x.name_en:x.name); return w.set({k:"q",lat:+x.y,lng:+x.x,ko:x.name,en:x.name_en||""}); }
    if(a==="me"){ w.msg=""; w.q=""; var go=function(p){ if(!p||!(+p[0])){ w.busy=0; w.msg=L6(CM.locErr); o.redraw(); return; } w.set({k:"me",lat:+p[0],lng:+p[1]}); };
      w.busy=1; o.redraw();
      try{ if(window.ME&&ME.pos) return go(ME.pos); myPos().then(function(p){ if(p){ try{ if(!ME.pos) meSet(p); }catch(e){} } go(p); },function(){ go(null); }); }catch(e){ go(null); } return; }   // 앱 pickBase 와 같게 — 처음 받으면 앱 「나」 위치로도
    if(a==="trip"){ var th=tripHotel(); if(!th) return; w.q=""; return w.set({k:"trip",lat:+th.h.lat,lng:+th.h.lng,ko:th.h.ko||"",en:th.h.en||""}); } };
  w.search=function(q){ q=String(q||"").trim(); w.q=q; if(!q){ w.res=null; w.msg=""; o.redraw(); return; } var my=++w.seq; w.busy=1; w.res=null; w.msg=""; o.redraw();
    fetch(hub()+"/kplace?q="+encodeURIComponent(q)+(window.kpL?kpL():"")).then(function(r){ return r.json(); }).then(function(j){ if(my!==w.seq) return; w.busy=0;
      var a=((j&&j.ok&&j.items)||[]).filter(function(x){ return +x.y&&+x.x&&(!window.meInKR||meInKR(+x.y,+x.x)); }).slice(0,5);
      if(!a.length){ w.msg=TT("찾은 곳이 없어요","No results"); w.res=null; o.redraw(); return; }
      // 11-09 사장님 「내 위치 뒤에 다른 동네를 쳐도 리스트가 안 바뀌고 내 위치가 켜져 있다」 — 찾으면 첫 결과로 바로 바꾼다(편의시설 화면과 같게) · 여러 곳이면 아래에 다른 후보를 남겨 바꿀 수 있게
      w.q=q; w.set({k:"q",lat:+a[0].y,lng:+a[0].x,ko:q,en:q});   // 제목은 손님이 친 말 그대로(「마곡 근처 호텔」) — 첫 결과 자리를 기준으로
      })   // 11-09 사장님 「동네 명소가 검색창 밑에 보인다 — 안 보이게」: 다른 후보 목록은 띄우지 않는다
    .catch(function(){ if(my!==w.seq) return; w.busy=0; w.msg=TT("잠시 뒤 다시 해 주세요.","Please try again shortly."); o.redraw(); }); };
  WREG[w.id]=w; return w; }
D.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-wh][data-w]"); if(!t||t.disabled) return; var w=WREG[t.getAttribute("data-w")]; if(!w) return; e.preventDefault(); w.act(t); });
D.addEventListener("submit",function(e){ var f=e.target&&e.target.closest&&e.target.closest("form[data-whf]"); if(!f) return; e.preventDefault(); var w=WREG[f.getAttribute("data-whf")], i=f.querySelector("input"); if(w&&i) w.search(i.value); });

// ══ 가운데 장소 카드 창 — 앱 장소 카드(#res)를 창 안으로 옮겨 그대로 그린다 (닫으면 제자리로 · 핀·카드는 지운다) ══
var CARD=null, MAPS=null;
function mapsReady(){ if(!MAPS){ try{ MAPS=Promise.all(Object.keys(window.CITY||{}).map(function(id){ return mapLoad(id).catch(function(){}); })).catch(function(){}); }catch(e){ MAPS=Promise.resolve(); } } return MAPS; }   // 그림 있는 명소인지 보려면 약도 자료(작은 JSON)를 다 받아 둔다 — 앱 spinShow 와 같게
function cardOpen(run){ var res=$("res"); if(!res) return; cardClose();
  var q=$("q"), ov=D.createElement("div"); ov.id="pcCard"; ov.className="pcc";
  ov.innerHTML='<div class="pcc-b" role="dialog" aria-modal="true"><button type="button" class="pcc-x" aria-label="'+E(L6(CM.x))+'">✕</button><div class="pcc-in"><div class="pcc-ld">'+E(L6(CM.ld))+'</div></div></div>';
  D.body.appendChild(ov);
  CARD={ov:ov,res:res,par:res.parentNode,nx:res.nextSibling,y:window.scrollY,q:q?q.value:""};
  res.innerHTML=""; ov.querySelector(".pcc-in").appendChild(res); H.classList.add("pcc-lock");
  try{ CARD.mo=new MutationObserver(function(){ if(!CARD) return; var l=ov.querySelector(".pcc-ld"); if(l&&res.firstChild) l.remove();
      try{ clearTimeout(window._scT); }catch(x){} if(Math.abs(window.scrollY-CARD.y)>2) window.scrollTo(0,CARD.y); }); CARD.mo.observe(res,{childList:true}); }catch(e){}   // 앱 카드가 지도 쪽으로 내리는 것을 멈춘다(창 뒤 화면 그대로)
  ov.addEventListener("click",function(e){ if(e.target===ov||(e.target.closest&&e.target.closest(".pcc-x"))){ e.preventDefault(); cardClose(); } });
  try{ run(); }catch(e){ try{ console.error("PCSTAY card",e); }catch(x){} } }
function cardClose(){ var c=CARD; if(!c) return; CARD=null; try{ if(c.mo) c.mo.disconnect(); }catch(e){}
  try{ if(window.spinClear) spinClear(); }catch(e){} c.res.innerHTML="";
  try{ if(c.par) c.par.insertBefore(c.res,(c.nx&&c.nx.parentNode===c.par)?c.nx:null); }catch(e){}
  try{ c.ov.remove(); }catch(e){} H.classList.remove("pcc-lock");
  var q=$("q"); if(q&&q.value!==c.q){ q.value=c.q; try{ qxSync(); }catch(e){} }
  if(Math.abs(window.scrollY-c.y)>2) window.scrollTo(0,c.y); }
D.addEventListener("keydown",function(e){ if(e.key==="Escape"&&CARD&&!$("nrBk")) cardClose(); });
window.addEventListener("hashchange",function(){ cardClose(); });
// 검색 핀 카드와 같은 내용 — 앱 spinShow 에서 지도 옮기기만 뺀 것: 그림 있는 명소면 그 명소 카드, 아니면 PLACES.__pin + spinCard
function pinShow(x){ cardOpen(function(){ mapsReady().then(function(){ if(!CARD) return; var lat=+x.y, lng=+x.x, nb=spinNorm(x.name);
    if(nb) for(var k in PLACES){ if(k.charAt(0)==="_") continue; var p=PLACES[k], a=spinNorm(p.ko); if(a&&(a===nb||a.indexOf(nb)>=0||nb.indexOf(a)>=0)&&KMs([lat,lng],[+p.lat,+p.lng])<0.05){ placeShow(k); return; } }
    try{ ntap("sp_"+spinCat(x.cat),"search_pin"); }catch(e){}
    PLACES.__pin={own:x.own?1:0,ko:x.name,en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",lat:lat,lng:lng,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||"",_l:x._l||(x.name_en?LANG:"ko"),LL:x.LL?JSON.parse(JSON.stringify(x.LL)):undefined,oh:Array.isArray(x.oh)?x.oh:undefined,gt:Array.isArray(x.gt)?x.gt:undefined};
    window.spinCard(); }); }); }
function placeOpen(k){ cardOpen(function(){ mapsReady().then(function(){ if(!CARD) return; if(window.PLACES&&PLACES[k]) placeShow(k); }); }); }

// ══ 그 동네 그림 지도 — 앱 약도 그림을 잘라 번호 핀만 얹는다 (pts=[{lat,lng,n}] · o.h = 바라는 높이 px, 없으면 4:3) ══
function geoOf(id){ return id==="kr"?window.NAVI_ROOT:id; }
function mDepth(id){ var d=0, p=id; while(CITY[p]&&d<20){ p=CITY[p].parent; d++; } return d; }
// 11-11 사장님 「일부 명품 브랜드에서 구지도를 가지고 온다」 — 앱(trip.js GUF)·주변 화면(pc_near.js)과 같게: 옛 약도 넷(서울 도심·인사동·경복궁·명동)은 빼고 서울 전체·부산은 새 구 지도 그림으로
var GUF={seoulall:"seoulall",seoul:"seoulall",insadong:"seoulall",gyeongbok:"seoulall",myeongdong:"seoulall",busan:"busan"}, GUD={}, GUG={}, GUW=null, GUOK=0;
function guData(f){ if(window.GU&&GU.all&&GU.all[f]) return Promise.resolve(GU.all[f]); if(GUD[f]) return GUD[f];
  var reg=(window.GU&&GU.reg)||{seoulall:"data/gu_seoul.json",busan:"data/gu_busan.json"}; if(!reg[f]) return Promise.resolve(null);
  var sc=D.querySelector('script[src*="gu.js"]'), v=((sc&&sc.getAttribute("src")||"").match(/[?&]v=([^&]+)/)||[])[1]||"";
  return GUD[f]=fetch(reg[f]+"?v="+v).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
function guWait(){ return GUW||(GUW=Promise.all(["seoulall","busan"].map(function(f){ return guData(f).then(function(G){ GUG[f]=(G&&G.ch&&G.img)?G:null; }); })).then(function(){ GUOK=1; })); }
// 구 지도 조각 그림·명소 그림 (pc_near.js mapGu 와 같은 자리·같은 단계: 좁게 보면 촘촘한 조각, 넓게 보면 구마다 대표 그림 하나)
function guTiles(G,cr,as,lay){ var ch=G.ch, G2=ch.G2, Cc=ch.C, x0=cr.L0/as, x1=(cr.L0+cr.wv)/as, y0=cr.T0, y1=cr.T0+cr.hv, px=(x1-x0)*G2, lv=px<=2700?0:px<=10800?1:2, h="";
  var inC=function(b){ return b[2]>x0&&b[0]<x1&&b[3]>y0&&b[1]<y1; };
  if(lv<2){ var sz=lv?Cc*4:Cc, ov=sz/G2*0.003, set={}, dir=(ch.dir||"img/gu/c")+(lv?"1":""); ((lv?ch.l1:ch.l0)||[]).forEach(function(q){ set[q[0]+"_"+q[1]]=1; });
    for(var x=Math.floor(x0*G2/sz);x<=Math.floor(x1*G2/sz);x++) for(var y=Math.floor(y0*G2/sz);y<=Math.floor(y1*G2/sz);y++) if(set[x+"_"+y]) h+='<img class="pcm-t" alt="" src="'+E(dir+"/"+x+"_"+y+".jpg?v="+ch.v)+'" style="'+lay([x*sz/G2,y*sz/G2,(x+1)*sz/G2+ov,(y+1)*sz/G2+ov])+'">';
    (G.gus||[]).forEach(function(og){ var ho=og.ho||[]; for(var k in (og.ic||{})){ var q=G.P&&G.P[k], b2=og.ic[k]; if(!q||ho.indexOf(k)>=0||/^__kara_/.test((G.act&&G.act[k])||"")||!inC(b2)) continue;
      h+='<img class="pcm-t" alt="" src="'+E(q.i)+'" style="'+lay(b2)+(+b2[4]?';transform:rotate('+(+b2[4])+'deg)':'')+'">'; } }); }   // 노래방 그림은 숨김 — gu.js 와 같게
  else (G.gus||[]).forEach(function(og){ var q=og.rep&&G.P&&G.P[og.rep]; if(q&&inC(q.b)) h+='<img class="pcm-t c" alt="" src="'+E(q.i)+'" style="'+lay(q.b)+'">'; });
  return h; }
function mCands(){ var a=[]; for(var id in (window.CITY||{})){ var c=CITY[id]; if(!(c&&c.img&&c.bb&&c.geo)) continue; var gf=GUF[id];
    if(gf&&gf!==id&&GUG[gf]) continue;   // 옛 약도 — 앱도 구 지도로 넘긴다
    var G=gf===id?GUG[id]:null; a.push({id:id,img:G?G.img:c.img,as:c.aspect||1,bb:c.bb,d:mDepth(id),G:G}); }
  try{ if(window.ROOT_IMG&&window.NAVI_ROOT) a.push({id:"kr",img:ROOT_IMG,as:1,bb:[32.9,124.2,38.9,132],d:0}); }catch(e){} return a; }
function inBB(b,p){ return p.lat>=b[0]&&p.lat<=b[2]&&p.lng>=b[1]&&p.lng<=b[3]; }
function cropA(F,as,A,minW){ var x0=1e9, y0=1e9, x1=-1e9, y1=-1e9; F.forEach(function(f){ var X=f[0]*as; x0=Math.min(x0,X); x1=Math.max(x1,X); y0=Math.min(y0,f[1]); y1=Math.max(y1,f[1]); });
  var cx=(x0+x1)/2, cy=(y0+y1)/2, wv=Math.max((x1-x0)*1.3,(y1-y0)*1.3*A,minW), hv=wv/A;
  if(wv>as){ wv=as; hv=wv/A; } if(hv>1){ hv=1; wv=Math.min(as,hv*A); }
  return {L0:Math.max(0,Math.min(as-wv,cx-wv/2)),T0:Math.max(0,Math.min(1-hv,cy-hv/2)),wv:wv,hv:hv}; }
function lmap(el,pts,o){ o=o||{}; if(!el) return; var my=el._lm=(el._lm||0)+1;
  if(!GUOK){ guWait().then(function(){ if(el._lm===my) lmap(el,pts,o); }); return; }   // 11-11 구 지도 자료부터 — 옛 약도가 잠깐이라도 안 보이게
  pts=(pts||[]).filter(function(p){ return +p.lat&&+p.lng; });
  if(!pts.length||!window.meGeoFrac){ el.innerHTML=o.none?'<div class="pcm-no">'+E(o.none)+'</div>':""; return; }
  var W=el.clientWidth||340, A=o.h?Math.max(0.45,Math.min(2.2,W/o.h)):(o.asp||4/3), C=mCands(), best=null;
  // 숙소가 모두 들어가는 가장 자세한 약도 — 너무 넓게 잘려 흐려지면(그림 폭 360px 밑) 많이 들어가는 자세한 약도로 · 밖에 있는 번호는 지도에서만 뺀다
  C.forEach(function(c){ var inn=pts.filter(function(p){ return inBB(c.bb,p); }); if(!inn.length) return;
    var F=inn.map(function(p){ return meGeoFrac(geoOf(c.id),+p.lat,+p.lng); }); if(F.some(function(f){ return !f; })) return;
    var f0=F[0], f1=meGeoFrac(geoOf(c.id),+inn[0].lat+0.009,+inn[0].lng), dkm=f1?Math.abs(f1[1]-f0[1]):0.01, mw=Math.max(dkm*2.2,0.004), px;   // 약도 그림은 모두 높이 2048
    if(c.G) mw=Math.max(mw,0.035);   // 11-11 구 지도 — 주변 화면과 같은 가장 좁은 폭
    px=cropA(F,c.as,A,mw).wv*(c.G?c.G.ch.G2:2048);   // 구 지도는 조각 그림이 있어 훨씬 촘촘하다
    var sc=[px>=360?1:0,inn.length===pts.length?1:0,inn.length,c.d,-(c.bb[2]-c.bb[0])*(c.bb[3]-c.bb[1])];   // 자세히 보이는 약도 먼저 → 다 들어가는 것 → 많이 들어가는 것 → 더 자세한 약도
    if(!best||cmp(sc,best.sc)>0) best={c:c,inn:inn,F:F,cr:cropA(F,c.as,A,c.G?mw:Math.max(mw,360/2048)),sc:sc}; });   // 그래도 너무 좁게 자르면 흐려지니 그림 폭 360px 보다 좁게는 안 자른다
  function cmp(a,b){ for(var i=0;i<a.length;i++){ if(a[i]!==b[i]) return a[i]>b[i]?1:-1; } return 0; }
  if(!best){ el.innerHTML=o.none?'<div class="pcm-no">'+E(o.none)+'</div>':""; return; }
  var c=best.c, cr=best.cr, as=c.as;
  var pins=best.inn.map(function(p,i){ var f=best.F[i], X=(f[0]*as-cr.L0)/cr.wv*100, Y=(f[1]-cr.T0)/cr.hv*100; if(X<0||X>100||Y<0||Y>100) return "";
    return '<button type="button" class="pcm-p" data-n="'+p.n+'" style="left:'+X.toFixed(2)+'%;top:'+Y.toFixed(2)+'%" aria-label="'+p.n+'">'+p.n+'</button>'; }).join("");
  var lay=function(b){ return 'left:'+((b[0]*as-cr.L0)/cr.wv*100).toFixed(3)+'%;top:'+((b[1]-cr.T0)/cr.hv*100).toFixed(3)+'%;width:'+((b[2]-b[0])*as/cr.wv*100).toFixed(3)+'%;height:'+((b[3]-b[1])/cr.hv*100).toFixed(3)+'%'; };
  el.innerHTML='<div class="pcm" style="aspect-ratio:'+(cr.wv/cr.hv).toFixed(4)+'"><img class="pcm-i" alt="" src="'+E(c.img)+'" style="width:'+(as/cr.wv*100).toFixed(3)+'%;left:'+(-cr.L0/cr.wv*100).toFixed(3)+'%;top:'+(-cr.T0/cr.hv*100).toFixed(3)+'%">'+(c.G?guTiles(c.G,cr,as,lay):"")+pins+'</div>';
  if(el._pon) pinOn(el,el._pon); }
function pinOn(root,n){ if(!root) return; root._pon=n; [].forEach.call(root.querySelectorAll(".pcm-p"),function(b){ b.classList.toggle("on",String(n)===b.getAttribute("data-n")); }); }

// ══ 카드 사진 — 앱 장소 사진(TRIP.photo = trip.js ppPhoto · /gphoto · 같은 캐시)과 같은 길 · 화면에 들어온 칸만 · 한 곳에 한 번 ══
var PHS={p:{},bad:{},io:null};
function phKey(s){ return s.ko+"|"+s.lat.toFixed(4)+","+s.lng.toFixed(4); }   // ppPhoto·cphLoad 캐시 열쇠와 같은 꼴(사진 지정표 없는 곳)
function phGet(slot){ var s=slot._ph; if(!s||!slot.isConnected||!window.TRIP||!TRIP.photo) return; var ck=phKey(s), C=window._cphC||{};
  var fin=function(j){ if(j&&j.ok) slot.classList.add("on"); };
  if(PHS.bad[ck]) return; if(C[ck]) return TRIP.photo("",s.ko,s.lat,s.lng,slot,fin);
  if(PHS.p[ck]){ PHS.p[ck].push(slot); return; }
  PHS.p[ck]=[]; TRIP.photo("",s.ko,s.lat,s.lng,slot,function(j){ fin(j); var w=PHS.p[ck]||[]; delete PHS.p[ck]; if(!j||!j.ok) PHS.bad[ck]=1; else w.forEach(phGet); }); }
function photo(slot,s){ if(!slot||!s||!s.ko||!(+s.lat)) return; slot._ph={ko:s.ko,lat:+s.lat,lng:+s.lng};
  if(!("IntersectionObserver" in window)){ phGet(slot); return; }
  if(!PHS.io) PHS.io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ PHS.io.unobserve(e.target); phGet(e.target); } }); },{rootMargin:"120px 0px"});
  PHS.io.observe(slot); }

window.PCSTAY={pin:pinShow,place:placeOpen,close:cardClose,map:lmap,pinOn:pinOn,Where:Where,photo:photo,cityBase:cityBase,baseName:baseName,CM:CM,phone:phone,touch:touch};

// ══ 숙소 화면 ══
var TX={
 sub:T6("가까운 숙소를 찾고, 예약 사이트에서 바로 예약해요","Find places to stay nearby and book them right on booking sites","近くの宿を探して、予約サイトですぐ予約できます","查找附近的住宿，直接在预订网站上预订","查找附近的住宿，直接在訂房網站上預訂","Encuentra alojamiento cerca y resérvalo directamente en sitios de reservas"),
 kind:T6("종류","Type","種類","类型","類型","Tipo"),
 sort:T6("정렬","Sort by","並べ替え","排序","排序","Ordenar"),
 sNear:T6("가까운 순","Nearest","近い順","距离最近","距離最近","Más cercanos"),
 sLux:T6("고급 호텔 먼저","Luxury hotels first","高級ホテルを先に","高档酒店优先","高檔飯店優先","Hoteles de lujo primero"),   // 11-13 사장님 「5성급 호텔이 잘 안 보인다」→ 정렬 「고급 호텔 먼저」(「이대로 해」)
 sKto:T6("관광공사에 실린 곳 먼저","KTO-listed first","観光公社掲載を先に","韩国观光公社收录优先","韓國觀光公社收錄優先","Primero los de la KTO"),   // 11-08 밤 사장님 — 「관광공사 실린」→「관광공사에 실린」 (다른 언어는 그대로 자연스러움)
 head:T6("{p} 근처 {k} · {s}","{k} near {p} · {s}","{p}周辺の{k}・{s}","{p}附近的{k} · {s}","{p}附近的{k} · {s}","{k} cerca de {p} · {s}"),
 headF:T6("{p} 근처 {k}","{k} near {p}","{p}周辺の{k}","{p}附近的{k}","{p}附近的{k}","{k} cerca de {p}"),
 src:T6("카카오 숙소 자료 · {r} 안","Kakao lodging data · within {r}","カカオの宿泊データ・{r}以内","Kakao 住宿资料 · {r}以内","Kakao 住宿資料 · {r}以內","Datos de alojamiento de Kakao · a menos de {r}"),
 det:T6("자세히","Details","詳細","详情","詳情","Detalles"),
 web:T6("홈페이지","Website","ホームページ","官网","官網","Sitio web"),   // 11-13 사장님 「한옥스테이에 뜨는 곳들의 전화번호가 없다 기재해주고 홈페이지도 연결해줘(있으면)」
 mapNo:T6("지도에 표시할 숙소가 없어요","No places to show on the map","地図に表示する宿がありません","没有可在地图上显示的住宿","沒有可在地圖上顯示的住宿","No hay alojamientos para mostrar en el mapa"),
 capP:T6("목록과 같은 번호예요 · 숙소 카드에 마우스를 올리면 번호가 커지고, 번호를 누르면 그 숙소로 가요","Numbers match the list · hover over a card to enlarge its number; click a number to jump to that place","番号はリストと同じです・カードにマウスを合わせると番号が大きくなり、番号を押すとその宿へ移動します","编号与列表一致 · 将鼠标移到卡片上编号会放大，点击编号即可跳到该住宿","編號與列表一致 · 將滑鼠移到卡片上編號會放大，點擊編號即可跳到該住宿","Los números coinciden con la lista · pasa el ratón sobre una tarjeta para agrandar su número; haz clic en un número para ir a ese alojamiento"),
 capT:T6("목록과 같은 번호예요 · 번호를 누르면 그 숙소로 가요","Numbers match the list · tap a number to jump to that place","番号はリストと同じです・番号を押すとその宿へ移動します","编号与列表一致 · 点击编号即可跳到该住宿","編號與列表一致 · 點擊編號即可跳到該住宿","Los números coinciden con la lista · toca un número para ir a ese alojamiento")
};
var KIC={hotel:"mi_stay",motel:"mi_motel",gh:"mi_guesthouse",hanok:"mi_hanok"};
var ST={tab:0,sort:"d",raw:null,items:null,err:"",far:false,seq:0,lang:"",bkey:"",hv:0};
function NS(){ return window.NEARST||null; }
function tabs(){ var n=NS(); return n?n.tabs:[]; }
function kindL(t){ return TT(t.ko,t.en); }
function mine(){ return APP?!!$("apStay"):/^#\/stay(\/|$)/.test(location.hash||""); }
function bkey(){ var b=WS.base; return ST.tab+"|"+b.lat.toFixed(4)+","+b.lng.toFixed(4)+"|"+(window.LANG||""); }
var WS=Where({id:"psW",trip:true,onSet:function(){ drawLeft(); load(); },redraw:function(){ drawLeft(); }});

function load(){ var n=NS(); if(!n) return; var t=n.tabs[ST.tab], b=WS.base, p=[b.lat,b.lng], my=++ST.seq;
  ST.raw=null; ST.items=null; ST.err=""; ST.far=false; ST.lang=window.LANG; ST.bkey=bkey(); drawMain();
  n.fetch(t,p).then(function(a){ if(my!==ST.seq) return; ST.far=!!(a&&a.far);
      ST.raw=(a||[]).map(function(x){ var o=Object.assign({},x); o.dist=Math.round(KMs(p,[+x.y,+x.x])*1000); return o; }); ST.luxK=""; sortNow(); drawMain(); if(ST.sort==="l") luxLoad(); },
    function(){ if(my!==ST.seq) return; ST.err="net"; drawMain(); }); }
// 가까운 순 · 관광공사에 실린 곳 먼저(그다음 가까운 순) — 10곳 (앱 목록과 같은 수) · 한옥 먼 곳(별점 순)은 받은 차례 그대로
// 11-13 사장님 「5성급 호텔이 잘 안 보인다」→ 정렬 「고급 호텔 먼저」(「이대로 해」) — 고급 = 구글 가격대 3·4(비쌈·아주 비쌈) 또는 특급 호텔 이름(일정표 숙소 찾기 LUX 와 같은 갈래, 중급 브랜드는 뺌) · 후보 = 카카오 가까운 숙소 + 구글 그 구 「호텔」 10km 안(이미 받는 자료, 새 호출 없음)
var LUXH=/특급|5성|하얏트|hyatt|힐튼|hilton|메리어트|marriott|신라호텔|the shilla|롯데호텔|lotte hotel|웨스틴|westin|인터컨티넨탈|intercontinental|포시즌스|four seasons|조선 ?팰리스|그랜드 ?조선|josun|콘래드|conrad|쉐라톤|sheraton|파라다이스|paradise|시그니엘|signiel|반얀트리|banyan|소피텔|sofitel|르메르디앙|meridien|리츠|ritz|워커힐|walkerhill|아난티|ananti|jw ?메리어트|jw marriott|로즈우드|rosewood|안다즈|andaz|몬드리안|mondrian|페어몬트|fairmont|켄싱턴|kensington/i,
    LUXX=/신라스테이|shilla stay|^l7|엘세븐|이비스|ibis|롯데시티|lotte city|모텔|게스트하우스|호스텔/i;
function luxS(x){ var s=(x.name||"")+" "+(x.name_en||""), p=+x.pl||0; return x.lux||p>=4?3:(p>=3||(LUXH.test(s)&&!LUXX.test(s)))?2:0; }
// 「고급 호텔 먼저」를 누를 때만 — 구글 「(그 구) 5성급 호텔」 한 번 (사장님 11-13 「가」 — 한 번 약 50원, 허브가 동네별 7일 저장해 모두 같이 씀)
//   호텔 종류만(구글 primaryType) · 고른 곳에서 10km 안만 · 카카오 목록에 같은 곳(150m·이름 비슷)이 있으면 합치고 없으면 더한다 · lux=1 은 맨 앞
function guOf(a){ var c={}, g=""; (a||[]).forEach(function(x){ var w=String(x.addr||"").split(/\s+/)[1]||""; if(/[구군시]$/.test(w)) c[w]=(c[w]||0)+1; }); Object.keys(c).forEach(function(k){ if(!g||c[k]>c[g]) g=k; }); return g; }
function nmLike(a,b){ try{ a=spinNorm(a); b=spinNorm(b); }catch(e){ a=String(a||""); b=String(b||""); } return !!a&&!!b&&(a.indexOf(b)>=0||b.indexOf(a)>=0||(a.length>=3&&a.slice(0,3)===b.slice(0,3))); }
function luxLoad(){ if(!ST.raw||!isHotel()) return; var key=bkey(); if(ST.luxK===key) return; ST.luxK=key; var b=WS.base, my=ST.seq, gu=guOf(ST.raw), L=window.LANG||"ko";
  fetch(hub()+"/gplace?all=1&ty=1&lang=ko&q="+encodeURIComponent((gu?gu+" ":"")+"5성급 호텔")+(L!=="ko"?"&tl="+encodeURIComponent(L):"")+"&lat="+b.lat.toFixed(5)+"&lng="+b.lng.toFixed(5)).then(function(r){ return r.json(); }).then(function(j){
    if(my!==ST.seq||!ST.raw) return; var p=[b.lat,b.lng], add=0;
    ((j&&j.ok&&j.items)||[]).forEach(function(g){ if(g.pt&&!/hotel|lodging|resort|inn/i.test(g.pt)) return; var d=KMs(p,[+g.lat,+g.lng]); if(!(d<=10)) return;
      var hit=null; ST.raw.forEach(function(x){ if(!hit&&KMs([+x.y,+x.x],[+g.lat,+g.lng])<0.15&&nmLike(x.name,g.name)) hit=x; });
      if(hit){ hit.lux=1; if(!hit.rating&&g.rating){ hit.rating=+g.rating; hit.n=+g.n||0; } if(!hit.tel&&g.tel) hit.tel=g.tel; if(!hit.web&&g.web) hit.web=g.web; add++; return; }
      ST.raw.push({gid:g.id,name:g.name,addr:g.addr,name_en:g.name_en||undefined,addr_en:g.addr_en||undefined,x:g.lng,y:g.lat,rating:+g.rating||0,n:+g.n||0,pl:g.pl,tel:g.tel,web:g.web,kind:"hotel",cat:"호텔",cat_en:"Hotel",lux:1,dist:Math.round(d*1000)}); add++; });
    if(add&&ST.sort==="l"){ sortNow(); drawMain(); } }).catch(function(){ ST.luxK=""; }); }
function sortNow(){ var a=(ST.raw||[]).slice(); if(!ST.far) a.sort(function(x,y){ if(ST.sort==="k"){ var d=(y.kto?1:0)-(x.kto?1:0); if(d) return d; } if(ST.sort==="l"){ var e=luxS(y)-luxS(x); if(e) return e; } return x.dist-y.dist; }); ST.items=a.slice(0,10); }
function rLbl(){ var t=tabs()[ST.tab]||{r:3000}, mx=0; (ST.items||[]).forEach(function(x){ mx=Math.max(mx,x.dist||0); }); var r=mx>t.r?10000:t.r; if(mx>10000) r=Math.ceil(mx/1000)*1000; return (r/1000)+" km"; }

function draw(box){ ST.box=box;
  box.innerHTML='<div id="pcSt" class="pcs">'
   +'<div class="pcs-barw"><div class="pcs-bar"><h1 class="pcs-h1">'+ico("mi_stay","pcs-hic")+'<span id="psT"></span></h1><span class="pcs-sub" id="psS"></span></div></div>'
   +'<div class="pcs-cols"><aside class="pcs-l"><div class="pcs-pn" id="psL"></div></aside><section class="pcs-c" id="psC"></section>'
   +'<aside class="pcs-r"><div class="pcs-pn pcs-mapp"><div id="psM" class="pcs-map"></div><div class="pcs-cap" id="psCap"></div></div></aside></div></div>';
  $("psT").textContent=TT("숙소","Stay"); $("psS").textContent=L6(TX.sub);
  drawLeft(); drawMain(); }
function chips(name,list,cur,lab,cls){ return '<div class="pcs-chips'+(cls?" "+cls:"")+'" style="grid-template-columns:repeat('+list.length+',minmax(0,1fr))">'+list.map(function(v){ return '<button type="button" data-ps="'+name+'" data-v="'+E(v)+'" class="'+(String(v)===String(cur)?"on":"")+'">'+E(lab(v))+'</button>'; }).join("")+'</div>'; }
function drawLeft(){ var el=$("psL"); if(!el) return; var T=tabs();
  el.innerHTML='<div class="pcs-sec"><h3>'+E(L6(TX.kind))+'</h3>'+chips("tab",T.map(function(t,i){ return i; }),ST.tab,function(i){ return kindL(T[i]); },"pcs-kch")+'</div>'
   +WS.html()
   +'<div class="pcs-sec"><h3>'+E(L6(TX.sort))+'</h3>'+chips("so",isHotel()?["d","k","l"]:["d","k"],ST.sort,function(v){ return L6(v==="k"?TX.sKto:v==="l"?TX.sLux:TX.sNear); })+'</div>'; }
function isHotel(){ var t=tabs()[ST.tab]; return !!t&&t.kind==="hotel"; }   // 「고급 호텔 먼저」는 호텔 칸에만
function msg(t){ return '<div class="pcs-msg">'+E(t)+'</div>'; }
function card(x,i){ var t=tabs()[ST.tab]||{}, en=FL()&&x.name_en, nm=KSs(en?x.name_en:x.name), ad=en?(x.addr_en||x.addr):x.addr;
  var tel=x.tel?'<div class="pcs-tel"><a href="tel:'+E(telIntl(x.tel))+'">☎ '+E(FL()?(/^0/.test(x.tel)?"+82 "+x.tel.slice(1):"+82 "+x.tel):x.tel)+'</a></div>':'';   // 앱 목록과 같은 꼴(외국어 화면 +82)
  return '<article class="pcs-card" data-i="'+i+'"><div class="pcs-ph"><span class="pcs-phx">'+ico(KIC[t.kind]||"mi_stay","")+'</span><div class="pcs-phi"></div></div><div class="pcs-bd">'
   +'<div class="pcs-nm"><span class="pcs-no">'+(i+1)+'</span><b>'+E(nm)+'</b>'+(x.kto?'<span class="pcs-kto" title="'+E(TT("한국관광공사 관광정보에 실린 숙소","Listed by the Korea Tourism Organization"))+'">'+E(TT("관광공사","KTO"))+'</span>':'')+'</div>'
   +(en&&x.name_en!==x.name?'<div class="pcs-ko">'+E(x.name)+'</div>':'')
   +'<div class="pcs-mt">'+E(kindL(t))+' · '+E(kmD(x.dist))+(x.rating?' · <span class="pcs-rtw"><span class="pcs-rt">★ '+(+x.rating).toFixed(1)+'</span> ('+(+x.n||0)+')</span>':'')+'</div>'
   +(ad?'<div class="pcs-ad">'+E(ad)+'</div>':'')+tel+(function(){ var w=webOf(x); return w?'<div class="pcs-tel pcs-web"><a href="'+E(w.u)+'" target="_blank" rel="noopener">'+ico("mi_globe","pcs-wic")+E(L6(w.l))+' ›</a></div>':''; })()+'</div>'
   +'<div class="pcs-bt"><button type="button" class="pcs-b2" data-ps="det" data-i="'+i+'">'+E(L6(TX.det))+'</button><button type="button" class="pcs-b2" data-ps="my" data-i="'+i+'">'+E(myLbl())+'</button><button type="button" class="pcs-b1" data-ps="bk" data-i="'+i+'">'+E(TT("예약하기","Book"))+'</button></div></article>'; }   // 11-09 사장님 「가」 — [내 숙소로 정하기] · 단추 셋은 카드 폭 한 줄에 같은 크기(오른쪽 맞춤)
// 숙소 홈페이지 링크 (11-13) — 구글 홈페이지 먼저, 없거나 예약 대행 사이트면 관광공사 예약 주소(web2) · 대행 사이트(부킹닷컴·아고다·구글 등)는 안 보임 · 네이버 예약·지도·에어비앤비·인스타는 그 이름으로
var WEBL=[[/(^|\.)booking\.naver\.com$/i,T6("네이버 예약","Naver Booking","NAVER予約","Naver 预订","Naver 預訂","Reserva en Naver")],
 [/(^|\.)(map|place|m\.place|m\.map)\.naver\.com$|^naver\.me$/i,T6("네이버 지도","Naver Map","NAVER地図","Naver 地图","Naver 地圖","Naver Map")],
 [/(^|\.)airbnb\./i,T6("에어비앤비","Airbnb","Airbnb","Airbnb","Airbnb","Airbnb")],
 [/(^|\.)stayfolio\.com$/i,T6("스테이폴리오","STAYFOLIO","STAYFOLIO","STAYFOLIO","STAYFOLIO","STAYFOLIO")],
 [/(^|\.)instagram\.com$/i,T6("인스타그램","Instagram","Instagram","Instagram","Instagram","Instagram")]];
var WEBX=/(^|\.)(google\.[a-z.]+|booking\.com|agoda\.com|trip\.com|expedia\.[a-z.]+|hotels\.com|hotelskorean\.com|instantroom\.eu|southkrhotel\.com|hostelworld\.com|tripadvisor\.[a-z.]+|kayak\.[a-z.]+|trivago\.[a-z.]+)$/i;
function webOf(x){ var a=[x.web,x.web2]; for(var i=0;i<a.length;i++){ var u=a[i], h=""; if(!/^https?:\/\//i.test(u||"")) continue; try{ h=new URL(u).hostname.replace(/^www\./i,""); }catch(e){ continue; } if(WEBX.test(h)) continue;
  var lb=TX.web; WEBL.forEach(function(w){ if(w[0].test(h)) lb=w[1]; }); return {u:u,l:lb}; } return null; }
function myLbl(){ try{ return TRIP.stay.label(); }catch(e){ return L6(T6("내 숙소로 정하기","Set as my lodging","宿泊先に設定","设为我的住处","設為我的住處","Elegir como alojamiento")); } }
function drawMain(){ var c=$("psC"); if(!c) return; var t=tabs()[ST.tab]; if(!t){ c.innerHTML=""; return; }
  var h='<div class="pcs-ch"><h2>'+E(F(ST.far?TX.headF:TX.head,{p:baseName(WS.base),k:kindL(t),s:L6(ST.sort==="k"?TX.sKto:ST.sort==="l"?TX.sLux:TX.sNear)}))+'</h2>'
   +(ST.items&&ST.items.length&&!ST.far?'<div class="pcs-src">'+E(F(TX.src,{r:rLbl()}))+'</div>':'')+'</div>';
  if(ST.err) h+=msg(TT("잠시 뒤 다시 해 주세요.","Please try again shortly."));
  else if(!ST.items) h+=msg(TT("찾는 중…","Searching…"));
  else if(!ST.items.length) h+=msg(TT("가까운 곳에 없습니다.","None found nearby."));
  else h+=(ST.far?'<div class="pcs-far">'+E(TT("가까운 곳에 한옥스테이가 없어, 멀어도 별점 높은 곳을 보여 드립니다.","No hanok stays nearby — showing top-rated ones farther away."))+'</div>':'')+'<div class="pcs-cards">'+ST.items.map(card).join("")+'</div>';
  c.innerHTML=h;
  [].forEach.call(c.querySelectorAll(".pcs-card"),function(el){ var x=ST.items[+el.getAttribute("data-i")]; if(x) photo(el.querySelector(".pcs-phi"),{ko:x.name,lat:+x.y,lng:+x.x}); });
  drawMap(); }
function drawMap(){ var m=$("psM"), cap=$("psCap"); if(!m) return; var it=ST.items||[];
  if(!it.length){ m.innerHTML='<div class="pcm-no">'+E(ST.items?L6(TX.mapNo):TT("찾는 중…","Searching…"))+'</div>'; if(cap) cap.textContent=""; return; }
  lmap(m,it.map(function(x,i){ return {lat:+x.y,lng:+x.x,n:i+1}; }),phone()?{asp:1}:{h:Math.max(360,Math.min(720,window.innerHeight-210))});
  if(cap) cap.textContent=L6(touch()?TX.capT:TX.capP); ST.mw=m.clientWidth; }

if(!APP) PCREG("stay",function(box,args){ draw(box); if(!ST.raw||ST.bkey!==bkey()) load(); });
// 앱 — 전체 화면 창 · 닫기 ✕ · 뒤로 가기는 index.html 뒤로 가기 목록(#pcCard → #apStay 차례)
else window.APPSTAY={open:function(){ var o=$("apStay"); if(!o){ o=D.createElement("div"); o.id="apStay"; o.setAttribute("role","dialog"); o.setAttribute("aria-modal","true");
    o.innerHTML='<button type="button" class="apst-x" aria-label="'+E(L6(CM.x))+'">✕</button><div id="apStayIn"></div>'; D.body.appendChild(o);
    o.querySelector(".apst-x").addEventListener("click",function(e){ e.preventDefault(); window.APPSTAY.close(); }); }
    H.classList.add("apst-lock"); o.scrollTop=0; draw($("apStayIn")); if(!ST.raw||ST.bkey!==bkey()) load(); },
  close:function(){ cardClose(); var o=$("apStay"); if(o) o.remove(); H.classList.remove("apst-lock"); }};
D.addEventListener("keydown",function(e){ if(APP&&e.key==="Escape"&&$("apStay")&&!CARD&&!$("nrBk")&&!D.querySelector(".trpop")) window.APPSTAY.close(); });

// ── 누르기 ──
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest||!t.closest("#pcSt")) return;
  var p=t.closest(".pcm-p"); if(p&&p.closest("#psM")){ e.preventDefault(); var n=+p.getAttribute("data-n"), cd=D.querySelector('#psC .pcs-card[data-i="'+(n-1)+'"]'); if(cd){ try{ cd.scrollIntoView({behavior:"smooth",block:"center"}); }catch(x){} cd.classList.remove("pcs-fl"); void cd.offsetWidth; cd.classList.add("pcs-fl"); } pinOn($("psM"),n); return; }
  var c=t.closest("[data-ps]"); if(!c) return; var a=c.getAttribute("data-ps");
  if(a==="tab"){ var i=+c.getAttribute("data-v"); if(i===ST.tab) return; ST.tab=i; if(ST.sort==="l"&&!isHotel()) ST.sort="d"; drawLeft(); load(); return; }
  if(a==="so"){ var s=c.getAttribute("data-v"); if(s===ST.sort) return; ST.sort=s; drawLeft(); sortNow(); drawMain(); if(s==="l") luxLoad(); return; }
  var x=ST.items&&ST.items[+c.getAttribute("data-i")], tb=tabs()[ST.tab]; if(!x) return;
  if(a==="det"){ try{ NS().tap(tb); }catch(z){}   // 앱 목록에서 한 곳 고를 때와 같은 집계
    pinShow({name:x.name,name_en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||"",_l:ST.lang!=="ko"&&x.name_en?ST.lang:"ko",oh:x.oh,gt:x.gt}); return; }
  if(a==="bk"){ var nm=(x.name_en&&x.name_en!==x.name)?x.name_en:x.name; try{ NS().book(nm,+x.y,+x.x); }catch(z){} return; }   // 앱 카드 「예약하기」와 같은 이름(영어 이름이 있으면 그것)
  if(a==="my"){ var bn=(x.name_en&&x.name_en!==x.name)?x.name_en:x.name; try{ TRIP.stay.mine({type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""},function(idx){ drawLeft(); try{ NS().book(bn,+x.y,+x.x,idx); }catch(q){} }); }catch(z){} return; }   // 11-13 사장님 「숙소메뉴에서 숙소를 정하면 자동으로 부킹 사이트에 입력이 되도록 해줘」 — 정하면 바로 예약 창(그 밤 날짜·인원을 넣은 아고다·부킹닷컴)   // 11-09 앱 ⋮ 숙소와 같은 길(trip.js myStay — 짠 일정이 있으면 「이 밤들에 넣을까요?」, 없으면 첫날 밤)
});
// 숙소 카드에 마우스 → 그 번호 핀이 커진다 (배치도)
D.addEventListener("mouseover",function(e){ var t=e.target; if(!t.closest) return; var cd=t.closest("#psC .pcs-card"), n=cd?(+cd.getAttribute("data-i")+1):0; if(n===ST.hv) return; if(!cd&&!t.closest("#psC")&&!ST.hv) return; ST.hv=n; pinOn($("psM"),n||""); });
// 화면 폭이 바뀌면 지도만 다시 (잘라 낸 비율)
var _rt=0; window.addEventListener("resize",function(){ clearTimeout(_rt); _rt=setTimeout(function(){ if(mine()&&$("psM")&&ST.items&&$("psM").clientWidth!==ST.mw) drawMap(); },200); });
// 언어를 바꾸면 이 화면도 — 이름·주소는 그 언어로 다시 받는다(앱 목록과 같은 길, 받아 둔 언어는 저장분)
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(mine()&&ST.box&&D.body.contains(ST.box)){ draw(ST.box); if(ST.bkey!==bkey()) load(); } }catch(e){} return r; };
})();
