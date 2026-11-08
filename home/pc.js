/* MosaicTrip.com 홈페이지 (PC 모양 · 폰에선 홈페이지를 폰에 맞춤) — 1단계: 첫 화면 + 머리 두 줄 (11-08)
 *  · home/index.html = mk_home.py 가 앱 index.html 을 그대로 베낀 것 + 이 파일. 이 파일은 그 맨 끝에서 돈다(앱 스크립트를 다 읽은 뒤)
 *  · 로직·서버·자료는 앱과 하나 (사장님 11-07) — 앱 전역(LANG·T·esc·MPICO·PLACES·HUB·SHOP·BELL·mpPG·shBuild·footBuild…)을 그대로 부른다
 *  · 앱 겉모양(머리줄·칩·안내판·고객의 소리)은 감추고(pc.css), 앱의 진짜 요소를 이 화면 자리로 옮겨 쓴다:
 *      머리 단추 홈(#rs)·공유(#sh)·언어(#hlg)·알림(#bell)·라이트/다크(#th) → 윗줄 · 검색칸(.sbox) → 소개 아래 · 결과(#res)·약도 줄(#vbar)·지도(#map)·관심 별(#favbar) → 지도 칸
 *  · 차례: 머리 두 줄 → 한 줄 소개+검색 → 전국 지도(첫 화면 채움) → 세 가지 여행 방법 → 대표 패키지 상품 ◀▶ → 앱 받기 → 맨 아래
 *  · 다음 단계(지금은 자리만): 아랫줄 메뉴 6개 · 세 여행 방법 화면 · 내 예약 · 「전체 보기」 · 구글 플레이(아직 공개 전)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME) return;
var D=document, H=D.documentElement;
function $(id){ return D.getElementById(id); }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function Lx(o){ return o&&typeof o==="object"?(o[window.LANG]||o.en||o.ko||""):(o||""); }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T2(ko,en){ try{ return window.T?window.T(ko,en):(window.LANG==="ko"?ko:en); }catch(e){ return window.LANG==="ko"?ko:en; } }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function phone(){ return window.matchMedia&&matchMedia("(max-width:640px)").matches; }
function touch(){ return window.matchMedia&&matchMedia("(hover:none)").matches; }

// ── 글 (6개 언어) ──
var AGN=window.AGN||T6("모자이크트립.com","MosaicTrip.com","MosaicTrip.com","MosaicTrip.com","MosaicTrip.com","MosaicTrip.com");
var TX={
 bk:T6("내 예약","My bookings","予約確認","我的预约","我的預約","Mis reservas"),
 lin:T6("로그인","Sign in","ログイン","登录","登入","Iniciar sesión"),
 lout:T6("로그아웃","Sign out","ログアウト","退出登录","登出","Cerrar sesión"),   // 11-08 사장님 — 로그인돼 있을 때 (앱 로그아웃 글과 같게)
 about:T6("회사 소개","About us","会社案内","关于我们","關於我們","Sobre nosotros"),
 contact:T6("문의","Contact","お問い合わせ","联系我们","聯絡我們","Contacto"),
 nav:T6("메뉴","Menu","メニュー","菜单","選單","Menú"),
 h1:T6('한국 여행, <em>일정부터 <br class="mbr">가이드까지</em> 한 곳에서',
       'Korea travel — <em>from your plan to your guide</em>, all in one place',
       '韓国旅行、<em>日程づくりからガイドまで</em>ひとつの場所で',
       '韩国旅行，<em>从行程到向导</em>，一站搞定',
       '韓國旅行，<em>從行程到嚮導</em>，一站搞定',
       'Viaja por Corea: <em>del plan al guía</em>, todo en un solo lugar'),   // 폰 줄바꿈 자리(mbr)는 시안대로 한국어만
 desc:T6("한국 여행, 일정부터 가이드까지 한 곳에서","Korea travel — from your plan to your guide, all in one place","韓国旅行、日程づくりからガイドまでひとつの場所で","韩国旅行，从行程到向导，一站搞定","韓國旅行，從行程到嚮導，一站搞定","Viaja por Corea: del plan al guía, todo en un solo lugar"),
 q:T6("가고 싶은 곳 · 하고 싶은 것 (예: 경복궁, 해운대 맛집)","Places to go · things to do (e.g. Gyeongbokgung, Haeundae food)","行きたい場所・やりたいこと（例：景福宮、海雲台グルメ）","想去的地方 · 想做的事（例：景福宫、海云台美食）","想去的地方 · 想做的事（例：景福宮、海雲台美食）","Lugares y planes (p. ej., Gyeongbokgung, comida en Haeundae)"),
 qs:T6("가고 싶은 곳 · 하고 싶은 것 (예: 경복궁)","Places to go · things to do","行きたい場所・やりたいこと","想去的地方 · 想做的事","想去的地方 · 想做的事","Lugares y planes"),   // 폰 — 칸이 좁아 짧게
 qa:T6("검색","Search","検索","搜索","搜尋","Buscar"),
 hint:T6("지도를 눌러 보세요","Click the map","地図をクリックしてみてください","点击地图看看","點擊地圖看看","Haz clic en el mapa"),
 hintT:T6("지도를 눌러 보세요","Tap the map","地図をタップしてみてください","点一下地图看看","點一下地圖看看","Toca el mapa"),
 hint2:T6("장소마다 사진·운영 시간·후기·가는 길","photos, opening hours, reviews and directions for each place","場所ごとに写真・営業時間・口コミ・行き方","每个地点都有照片·营业时间·评价·路线","每個地點都有照片·營業時間·評價·路線","fotos, horarios, reseñas y cómo llegar de cada lugar"),
 ways:T6("세 가지 여행 방법","Three ways to travel","3つの旅のスタイル","三种旅行方式","三種旅行方式","Tres formas de viajar"),
 w1t:T6("가이드 인솔 자유여행","Travel with Guide","ガイド同行の自由旅行","向导陪同自由行","嚮導陪同自由行","Viaje con guía"),
 w1p:T6("가고 싶은 곳을 내 일정대로 다니고, 현지 가이드가 함께 다니며 안내와 통역을 해 드려요.","Go where you want on your own schedule — a local guide comes along to show you around and interpret.","行きたい場所を自分の日程で回り、現地ガイドが同行して案内と通訳をします。","按自己的行程去想去的地方，当地向导全程陪同，为您讲解和翻译。","按自己的行程去想去的地方，當地嚮導全程陪同，為您講解和翻譯。","Ve adonde quieras con tu propio horario: un guía local te acompaña, te orienta y te hace de intérprete."),
 w1m:T6("반일 · 하루 · 여러 날","Half day · Full day · Several days","半日・1日・複数日","半天 · 一天 · 多天","半天 · 一天 · 多天","Medio día · Un día · Varios días"),
 w1g:T6("가이드 고르기 ›","Choose a guide ›","ガイドを選ぶ ›","选择向导 ›","選擇嚮導 ›","Elige un guía ›"),
 w2t:T6("패키지여행","Group Tour","パッケージツアー","跟团游","跟團遊","Tour en grupo"),
 w2p:T6("정해진 코스와 시간에 다른 여행자들과 함께 떠나요. 날짜와 인원만 고르면 돼요.","Set routes and times, shared with other travelers. Just pick a date and the number of people.","決まったコースと時間に、ほかの旅行者と一緒に出かけます。日付と人数を選ぶだけです。","按固定路线和时间，与其他游客一起出发。只需选择日期和人数。","按固定路線和時間，與其他旅客一起出發。只需選擇日期和人數。","Rutas y horarios fijos, compartidos con otros viajeros. Solo elige la fecha y el número de personas."),
 w2m:T6("가이드 · 입장권 · 체험 포함","Guide · tickets · activities included","ガイド・入場券・体験込み","含向导·门票·体验","含嚮導·門票·體驗","Guía · entradas · actividades incluidas"),
 w2g:T6("상품 보기 ›","See tours ›","商品を見る ›","查看产品 ›","查看商品 ›","Ver tours ›"),
 w3t:T6("AI와 자유여행","DIY Trip","DIY旅行","自助游","自助旅行","Viaje a tu aire"),
 w3p:T6("가고 싶은 곳을 담으면 AI가 날짜별 일정을 짜 드려요.","Add the places you want to go, and AI plans your trip day by day.","行きたい場所を追加すると、AIが日ごとの日程を組みます。","加入想去的地方，AI 为您按天安排行程。","加入想去的地方，AI 為您按天安排行程。","Añade los lugares que quieres visitar y la IA arma tu plan día a día."),
 w3m:T6("가이드 일정 검토 10만 원","Plan check by a guide · USD 100","ガイドによる日程チェック USD 100","向导检查行程 USD 100","嚮導檢查行程 USD 100","Revisión del plan por un guía · USD 100"),
 w3g:T6("일정 짜기 ›","Plan a trip ›","日程を作る ›","制定行程 ›","制定行程 ›","Planear viaje ›"),
 free:T6("무료","Free","無料","免费","免費","Gratis"),
 opt:T6("선택","Optional","任意","可选","可選","Opcional"),
 pkg:T6("대표 패키지 상품","Featured group tours","主なパッケージツアー","精选跟团游","精選跟團遊","Tours en grupo destacados"),
 all:T6("전체 보기 ›","See all ›","すべて見る ›","查看全部 ›","查看全部 ›","Ver todo ›"),
 prev:T6("이전","Previous","前へ","上一个","上一個","Anterior"),
 next:T6("다음","Next","次へ","下一个","下一個","Siguiente"),
 per:T6("1인","per person","1名","每人","每人","por persona"),
 won:T6("{n}원~","₩{n}~","₩{n}~","₩{n}~","₩{n}~","₩{n}~"),
 g6:T6("가이드 6개 언어","Guide in 6 languages","ガイド6言語","向导 6 种语言","嚮導 6 種語言","Guía en 6 idiomas"),
 l6:T6("6개 언어","6 languages","6言語","6种语言","6種語言","6 idiomas"),
 app:T6("앱 받기","Get the app","アプリを入手","下载应用","下載應用程式","Descarga la app"),
 appp:T6("여행 중에는 앱이 편해요. 지도, 내 일정, 가이드 대화방을 폰에서 바로 열어요.","On the road, the app is easier. Open the map, your plan and your guide chat right on your phone.","旅行中はアプリが便利です。地図・日程・ガイドとのチャットをスマホですぐ開けます。","旅途中用应用更方便。在手机上直接打开地图、我的行程和向导聊天。","旅途中用應用程式更方便。在手機上直接打開地圖、我的行程和嚮導聊天。","De viaje, la app es más cómoda. Abre el mapa, tu plan y el chat con tu guía en el móvil."),
 ios:T6("App Store는 출시 후 안내","App Store: coming after launch","App Storeはリリース後にご案内","App Store 上架后另行通知","App Store 上架後另行通知","App Store: disponible tras el lanzamiento"),
 qr:T6("폰 카메라로 찍으면 앱이 열려요","Scan with your phone camera to open the app","スマホのカメラで読み取るとアプリが開きます","用手机相机扫描即可打开应用","用手機相機掃描即可打開應用程式","Escanéalo con la cámara del móvil para abrir la app"),
 ver:T6("버전","Version","バージョン","版本","版本","Versión"),
 tr:T6("교통","Transport","交通","交通","交通","Transporte")   // 아랫줄 메뉴 「교통」 — 앱 교통 칩과 같은 말 (transit.js X.chip)
};
var NAVK=[["st","mi_stay"],["tr","mi_bus"],["gift","mi_gift"],["am","mi_amenity"],["em","mi_emergency"],["about","mi_info"],["contact","mi_phone"]];
function navLbl(k){ return k==="tr"?L6(TX.tr):k==="st"?T2("숙소","Stay"):k==="gift"?T2("선물 고르기","Gift finder"):k==="am"?T2("편의시설","Convenience"):k==="em"?T2("긴급","Emergency"):L6(TX[k]); }
function ttl(){ return window.LANG==="ko"?"모자이크트립.com - 대한민국":"MosaicTrip.com for Korea"; }   // 사장님 11-08 제목줄
function homeUrl(){ return location.origin+"/home/"; }
function img(n){ return '<img src="img/menu/'+n+'.png" alt="">'; }

// ── 뼈대 ──
var root=D.createElement("div"); root.id="phRoot";
root.innerHTML=
  '<header id="phHd"><div class="ph-hd1w"><div class="ph-in ph-hd1">'
 +  '<a class="ph-logo" id="phLogo" href="/home/"><img src="logo.png" alt=""><span id="phTtl"></span></a>'
 +  '<div class="ph-tools"><div class="ph-ics" id="phIcs"></div><div class="ph-acts"><button type="button" class="ph-tb" id="phBk"></button><button type="button" class="ph-tb pri" id="phIn"></button></div></div>'
 + '</div></div><nav class="ph-hd2" id="phNav">'+NAVK.map(function(x){ return '<button type="button" data-ph="'+x[0]+'">'+img(x[1])+'<span></span></button>'; }).join("")+'</nav></header>'
 +'<main id="phMain">'
 + '<section id="phHero"><img class="ph-branch" src="home/img/mugunghwa_branch.webp" alt="" aria-hidden="true"><h1 id="phH1"></h1></section>'
 + '<div id="phRes"></div>'
 + '<section id="phMapSec"><div class="ph-mapbox" id="phMapBox"></div></section>'
 + '<section class="ph-sec" id="phWays"><div class="ph-sh"><h2 id="phWaysT"></h2></div><div class="ph-ways" id="phWaysL"></div></section>'
 + '<section class="ph-sec" id="phPkg"><div class="ph-sh"><h2 id="phPkgT"></h2><button type="button" class="ph-more" id="phPkgAll"></button></div>'
 +   '<div class="ph-car"><button type="button" class="ph-arr" id="phPv">◀</button><div class="ph-track" id="phTk"></div><button type="button" class="ph-arr" id="phNx">▶</button></div></section>'
 + '<div class="ph-appw"><section class="ph-appb" id="phApp"><img class="ph-ai" src="icon-192.png" alt=""><div class="ph-tx"><h2 id="phAppT"></h2><p id="phAppP"></p></div>'
 +   '<div class="ph-dl"><div><img class="ph-gp" id="phGp" src="home/img/gplay/light/ko.png" alt="Google Play" width="646" height="250"><div class="ph-ios" id="phIos"></div></div><div class="ph-qr" id="phQr"><div></div></div></div></section></div>'
 +'</main>'
 +'<footer class="ph-foot"><div class="ph-fin"><nav class="ph-flinks" id="phFl"></nav><div class="ph-finfo" id="phFi"></div><div class="ph-fcred" id="phFc"></div><div class="ph-fbot"><span id="phCopy"></span><span class="ph-ver" id="phVer"></span></div></div></footer>';
D.body.insertBefore(root,D.body.firstChild);

// ── 앱 요소 옮기기 ──
function adopt(){ var ics=$("phIcs"); ["rs","sh","hlg","bell","th"].forEach(function(id,i){ var e=$(id); if(!e) return; if(e.parentNode!==ics||ics.children[i]!==e){ var ref=null; for(var j=i+1;j<5&&!ref;j++){ var n=$(["rs","sh","hlg","bell","th"][j]); if(n&&n.parentNode===ics) ref=n; } ics.insertBefore(e,ref); } });
  var sh=$("sh"); if(sh&&!sh._ph){ sh._ph=1; sh.removeAttribute("onclick"); sh.onclick=share; }
  var rs=$("rs"); if(rs&&!rs._ph){ rs._ph=1; rs.addEventListener("click",function(){ if(location.hash&&window.PCGO) PCGO(""); }); } }   // 홈 아이콘 = 다른 화면(#/guide 등)에서도 첫 화면으로 (11-08 3a)
adopt();
if(!$("bell")){ var _bt=0, _bi=setInterval(function(){ if($("bell")||++_bt>40){ clearInterval(_bi); adopt(); } },150); }
var form=D.querySelector("form.sbox"), qw=form&&form.querySelector(".qw");
if(form){ $("phHero").appendChild(form); if(qw&&!qw.querySelector(".ph-sic")) qw.insertAdjacentHTML("afterbegin",'<img class="ph-sic" src="img/menu/mi_search.png" alt="">'); }
var res=$("res"); if(res) $("phRes").appendChild(res);
var box=$("phMapBox"), vbar=$("vbar"), map=$("map");
if(vbar) box.parentNode.insertBefore(vbar,box);
if(map){ box.appendChild(map); var mh=D.createElement("div"); mh.className="ph-maphint"; mh.id="phMapHint"; map.appendChild(mh); }
var fav=$("favbar"); if(fav) box.parentNode.appendChild(fav);

// ── 공유 = 홈페이지 주소 (앱 공유 창 단추 그대로 · window.shareInto 와 같은 길) ──
function share(e){ if(e){ e.preventDefault(); e.stopPropagation(); }
  try{ ntap("_app","share"); }catch(x){}
  try{ var si=$("shIn"); shBuild(si,true); si.insertAdjacentHTML("afterbegin",'<div class="shhd">'+E(ttl())+'</div>'); shOwnerFix0(si,"","",{url:homeUrl(),txt:ttl(),desc:L6(TX.desc)}); $("shBox").hidden=false; }   // 맨 위 줄 = 「이 앱 공유하기」 대신 홈페이지 이름
  catch(x){ try{ shOpen(); }catch(y){} } }

// ── 머리줄 단추 ──
// 로그인 단추 (11-08 사장님) — 로그인돼 있으면 「로그아웃」(누르면 앱 로그아웃 mpPG.logout), 아니면 「로그인」(앱 로그인 창 구글·애플)
function signed(){ try{ return !!localStorage.getItem("mpv_pg_sess"); }catch(e){ return false; } }
var _inK="";
function inPaint(force){ var b=$("phIn"); if(!b) return; var on=signed(), k=(on?1:0)+"|"+(window.LANG||""); if(!force&&k===_inK) return; _inK=k; b.textContent=L6(on?TX.lout:TX.lin); }
$("phIn").onclick=function(){ try{ if(signed()){ if(window.mpPG&&mpPG.logout) mpPG.logout(); else localStorage.removeItem("mpv_pg_sess"); inPaint(1); } else if(window.mpPG) mpPG.open(); }catch(e){} };
D.addEventListener("mppg",function(){ inPaint(); });   // pg.js 가 로그인·로그아웃 때 알린다
window.addEventListener("storage",function(e){ if(!e||!e.key||e.key==="mpv_pg_sess") inPaint(); });   // 다른 탭에서 로그인·로그아웃
setInterval(function(){ inPaint(); },2000);   // 세션이 끝나 다른 화면이 지운 경우(허브 sess 오류)도 맞춘다 — 이 PC 저장소만 읽음
// 「내 예약」 단추 (11-08 사장님 「로그인·내 예약」, 배치도 12) — #/bookings (home/pc_bk.js) · 로그인 안 했으면 로그인 창부터, 로그인되면 그 화면으로
var _bkWant=false;
$("phBk").onclick=function(){ try{ if(signed()){ _bkWant=false; if(window.PCGO) PCGO("bookings"); } else { _bkWant=true; if(window.mpPG) mpPG.open(); } }catch(e){} };
D.addEventListener("mppg",function(){ if(_bkWant&&signed()){ _bkWant=false; try{ if(window.PCGO) PCGO("bookings"); }catch(e){} } });
$("phLogo").onclick=function(e){ if(e.ctrlKey||e.metaKey||e.shiftKey||e.button) return; e.preventDefault(); try{ if(location.hash&&window.PCGO) PCGO(""); resetAll(); }catch(x){ window.scrollTo(0,0); } };   // 다른 화면(#/guide 등)이면 첫 화면으로 (11-08 3a)

// ── 그리기 (언어를 바꾸면 다시) ──
function paint(){ var lg=window.LANG||"ko";
  $("phTtl").textContent=ttl(); D.title=ttl();
  $("phBk").textContent=L6(TX.bk); inPaint(1);
  $("phNav").setAttribute("aria-label",L6(TX.nav));
  [].forEach.call($("phNav").children,function(b){ b.querySelector("span").textContent=navLbl(b.dataset.ph); });
  $("phH1").innerHTML=L6(TX.h1);
  var q=$("q"); if(q){ q.placeholder=L6(phone()?TX.qs:TX.q); q.setAttribute("aria-label",L6(TX.qa)); }
  var mh=$("phMapHint"); if(mh) mh.innerHTML='<b>'+E(L6(touch()?TX.hintT:TX.hint))+'</b> · '+E(L6(TX.hint2));
  waysPaint(); pkgPaint(); appPaint(); footPaint();
  setTimeout(eqGo,0); }
function waysPaint(){ $("phWaysT").textContent=L6(TX.ways);
  var W=[["mi_guideperson",TX.w1t,"",TX.w1p,E(L6(TX.w1m)),TX.w1g],["mi_guide",TX.w2t,"",TX.w2p,E(L6(TX.w2m)),TX.w2g],["mi_calendar",TX.w3t,' <span class="ph-free">'+E(L6(TX.free))+'</span>',TX.w3p,E(L6(TX.w3m))+' <span class="ph-opt">'+E(L6(TX.opt))+'</span>',TX.w3g]];
  $("phWaysL").innerHTML=W.map(function(w,i){ return '<div class="ph-way" data-w="'+i+'"><div class="ph-ic">'+img(w[0])+'</div><h3>'+E(L6(w[1]))+w[2]+'</h3><p>'+E(L6(w[3]))+'</p><div class="ph-meta">'+w[4]+'</div><div class="ph-gorow"><button type="button" class="ph-go">'+E(L6(w[5]))+'</button></div></div>'; }).join(""); }
// 카드 단추 같은 크기 (사장님 11-08 「카드 단추는 같은 크기·오른쪽 맞춤」)
function eqGo(){ var bs=[].slice.call(D.querySelectorAll("#phWaysL .ph-go")); bs.forEach(function(b){ b.style.minWidth=""; }); var w=0; bs.forEach(function(b){ w=Math.max(w,b.offsetWidth); }); if(w) bs.forEach(function(b){ b.style.minWidth=Math.ceil(w)+"px"; }); }

// ── 대표 패키지 상품 — 앱 상품 자료(SHOP.items) 그대로, 앱 목록과 같은 차례 (11-08 밤 사장님 — 공연 관람도 넣음, 1단계엔 뺐었음) ──
var PKGLOADED=false;
function pkgList(){ try{ return (window.SHOP&&SHOP.items?SHOP.items():[]).filter(function(p){ return p&&p.id; }); }catch(e){ return []; } }
function langOf(p){ var a=(p.langs||[]).filter(function(x){ return /^(ko|en|ja|zhs|zht|es)$/.test(x); }); if(!a.length) return "";
  if(a.length>=6) return L6((p.kind||"tour")==="tour"?TX.g6:TX.l6);
  var N={ko:"한국어",en:"English",ja:"日本語",zhs:"中文(简)",zht:"中文(繁)",es:"Español"}; return a.map(function(x){ return N[x]; }).join(" · "); }
function pkgCard(p){ var b={}; try{ b=SHOP.brief(p)||{}; }catch(e){}
  var m=/₩\s?([\d,]+)/.exec(b.from||""), pr="";
  if(m) pr=window.LANG==="ko"?'<small>'+E(L6(TX.per))+'</small><b>'+E(L6(TX.won).replace("{n}",m[1]))+'</b>':'<b>'+E(L6(TX.won).replace("{n}",m[1]))+'</b><small>'+E(L6(TX.per))+'</small>';
  else try{ var X=SHOP.pc; if(X&&X.isExt(p)) pr='<small>'+E(X.L(X.TX.pxt))+'</small>'; }catch(e){}   // 공연 관람 등 바깥 예매처 — 「가격은 예매처에서」 (앱 카드·패키지 목록과 같은 말)
  var mt=[Lx(p.dur),langOf(p)].filter(Boolean).join(" · "), area=Lx(p.area), rv=window.rvMini?rvMini("shop:"+p.id):"";
  return '<button type="button" class="ph-pc" data-p="'+E(p.id)+'"><div class="ph-ph">'+(b.img?'<img src="'+E(b.img)+'" alt="" loading="lazy">':'')+(b.badge?'<span class="ph-st'+(b.real?' on':'')+'">'+E(b.badge)+'</span>':'')+(area?'<span class="ph-area">'+E(area)+'</span>':'')+'</div>'
   +'<div class="ph-bd"><div class="ph-nm">'+E(b.t||Lx(p.t))+'</div>'+(mt?'<div class="ph-mt">'+E(mt)+'</div>':'')+'<div class="ph-pr">'+pr+'<span class="ph-rv">'+rv+'</span></div></div></button>'; }
function pkgPaint(){ $("phPkgT").textContent=L6(TX.pkg); $("phPkgAll").textContent=L6(TX.all); $("phPv").setAttribute("aria-label",L6(TX.prev)); $("phNx").setAttribute("aria-label",L6(TX.next));
  var it=pkgList(), tk=$("phTk"); $("phPkg").hidden=!it.length; if(!it.length) return;
  var sl=tk.scrollLeft; tk.innerHTML=it.map(pkgCard).join(""); tk.scrollLeft=sl;
  try{ if(window.rvMiniLoad) rvMiniLoad(it.map(function(p){ return "shop:"+p.id; })); }catch(e){}
  arrUpd(); }
function step(){ var c=$("phTk").querySelector(".ph-pc"); return c?c.getBoundingClientRect().width+20:300; }
function arrUpd(){ var tk=$("phTk"); $("phPv").disabled=tk.scrollLeft<=2; $("phNx").disabled=tk.scrollLeft+tk.clientWidth>=tk.scrollWidth-2; }
$("phPv").onclick=function(){ $("phTk").scrollBy({left:-step(),behavior:"smooth"}); };
$("phNx").onclick=function(){ $("phTk").scrollBy({left:step(),behavior:"smooth"}); };
$("phTk").addEventListener("scroll",arrUpd,{passive:true});
// 상품을 누르면 — 상품마다 주소가 있는 상품 화면 #/package/<id> (home/pc_pkg.js, 11-08 3a) · 길잡이가 없으면 앱 상품 화면
$("phTk").addEventListener("click",function(e){ var c=e.target.closest&&e.target.closest(".ph-pc"); if(!c) return; try{ if(window.PCGO) PCGO("package/"+encodeURIComponent(c.dataset.p)); else SHOP.det(c.dataset.p); }catch(x){} });
$("phPkgAll").onclick=function(){ if(window.PCGO) PCGO("package"); };
// 세 가지 여행 방법 단추 (11-08 3a) — 0 가이드 인솔 #/guide · 1 패키지 #/package (2 AI 는 pc_ai.js 화면)
$("phWaysL").addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".ph-go"), w=b&&b.closest(".ph-way"); if(!w||!window.PCGO) return; var i=w.getAttribute("data-w"); if(i==="0") PCGO("guide"); else if(i==="1") PCGO("package"); else if(i==="2") PCGO("ai"); });   // 2 「일정 짜기 ›」 = AI와 자유여행 #/ai (11-08 3b)
// 아랫줄 메뉴 (11-08 4a) — 숙소 #/stay (home/pc_stay.js) · 선물 고르기 #/gift (home/pc_gift.js) · 다른 메뉴는 화면이 생기면 NAVR 에 더한다 · 지금 화면의 메뉴에 노랑 밑줄(.on)
var NAVR={st:"stay",gift:"gift",am:"near",em:"sos"};   // 11-08 4b — 편의시설 #/near (home/pc_near.js) · 긴급 #/sos (home/pc_sos.js)
$("phNav").addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("button[data-ph]"), r=b&&NAVR[b.dataset.ph]; if(r&&window.PCGO) PCGO(r); });
// 회사 소개·문의 = 따로 화면 없이 화면 가운데 창 (home/pc_info.js, 11-08 4b 사장님)
$("phNav").addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("button[data-ph]"), k=b&&b.dataset.ph; if(!window.PCINFO) return; if(k==="about") PCINFO.about(); else if(k==="contact") PCINFO.contact(); });
// 교통 = 앱 「교통」 창(transit.js) 그대로 화면 가운데 창으로 (11-08 밤 사장님 — 출발·도착 → 모든 수단 · 모양은 home/pc.css #tkBox)
$("phNav").addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("button[data-ph]"); if(!b||b.dataset.ph!=="tr"||!window.TRANSIT) return; try{ TRANSIT.open(); }catch(x){} });
function navOn(){ var h=(location.hash||"").replace(/^#\/?/,"").split("/")[0]; [].forEach.call($("phNav").children,function(b){ b.classList.toggle("on",!!h&&NAVR[b.dataset.ph]===h); }); }
window.addEventListener("hashchange",navOn); navOn();

// ── 앱 받기 ──
var QRU="https://navi.moneypuzzle.co.kr/?install=1";   // 앱 공유 창의 「앱 설치」 주소와 같음
function appPaint(){ try{ var gp=$("phGp"); if(gp) gp.src="home/img/gplay/light/"+({ko:"ko",en:"en",ja:"ja",zhs:"zh-cn",zht:"zh-tw",es:"es"}[window.LANG]||"en")+".png"; }catch(e){}   /* 11-09 사장님 「가」 — 구글 공식 배지 그림(언어별, play.google.com 배지 안내에서 받음) — 사장님 「라이트모드로 넣어」: 흰 바탕·검은 글자판(light/, 무채색만 밝기 뒤집음). 투어앱이 플레이 스토어에 올라가면 링크를 건다 */
  $("phAppT").textContent=L6(TX.app); $("phAppP").textContent=L6(TX.appp); $("phIos").textContent=L6(TX.ios);
  var qr=$("phQr"); if(qr){ qr.title=L6(TX.qr); qr.setAttribute("aria-label",L6(TX.qr)); qr.setAttribute("role","img"); } }
function qrMake(){ var qr=$("phQr"); if(!qr||qr._done) return; qr._done=1; try{ if(window.shQr) shQr(qr.firstElementChild,QRU); else qr.remove(); }catch(e){ try{ qr.remove(); }catch(x){} } }

// ── 맨 아래 — 사업자 정보·약관 = 앱 맨 아래 줄(footBuild) 그대로 · 출처 = 앱 안내(#credit) ──
function footPaint(){ try{ footBuild(); }catch(e){} var f=$("foot"), fl=$("phFl"), fi=$("phFi");
  if(f){ var ch=[].slice.call(f.children), lk=ch.length>1?ch.pop():null;
    fl.innerHTML=""; if(lk) [].forEach.call(lk.querySelectorAll("a"),function(a,i){ var c=a.cloneNode(true); c.removeAttribute("style"); if(/privacy/.test(c.getAttribute("href")||"")) c.className="pv"; fl.appendChild(c); });
    fi.innerHTML='<div><b>'+E(L6(AGN))+'</b></div>'+ch.map(function(d){ return '<div>'+d.innerHTML+'</div>'; }).join(""); }
  var cr=$("credit"); $("phFc").innerHTML=cr?cr.innerHTML:"";
  $("phCopy").textContent="© "+L6(AGN);
  $("phVer").textContent=L6(TX.ver)+" "+(window.APPV||""); }

// ── 지도 높이 = 첫 화면 나머지 (시안: 900 화면에 640) ──
var _mk="";
function mapH(force){ var m=$("map"); if(!m) return; var k=window.innerWidth+"x"+window.innerHeight+(phone()?"p":"");
  if(!force&&k===_mk) return; _mk=k;
  if(phone()) H.style.removeProperty("--phMH");
  else { var top=$("phRes").getBoundingClientRect().top+window.scrollY+8; H.style.setProperty("--phMH",Math.round(Math.max(440,Math.min(1200,window.innerHeight-top-12)))+"px"); }
  try{ zResize(true); }catch(e){} }

// ── 언어 바꾸기 — 앱 setLang 뒤에 이 화면도 ──
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ paint(); }catch(e){} return r; };

// ── 언어 목록(lang.js #lgL)은 지구본 오른쪽 끝에 맞춰 뜬다 — 폰에선 지구본이 왼쪽이라 화면 밖으로 나가지 않게 ──
try{ new MutationObserver(function(){ var l=$("lgL"); if(!l||l._ph) return; l._ph=1;
  requestAnimationFrame(function(){ var r=l.getBoundingClientRect(); if(r.left<6){ l.style.right="auto"; l.style.left="6px"; } }); }).observe(D.body,{childList:true}); }catch(e){}

// ── 같은 문서 안 「#」 고리 — <base href="/"> 때문에 앱 주소(/#)로 나가지 않게 ──
window.addEventListener("click",function(e){ var a=e.target&&e.target.closest&&e.target.closest("a[href]"); if(!a) return; var h=a.getAttribute("href")||""; if(h.charAt(0)!=="#") return;
  e.preventDefault(); if(h.length>1){ var t=D.getElementById(h.slice(1)); if(t) try{ t.scrollIntoView({behavior:"smooth",block:"start"}); }catch(x){} } },true);

// ── 처음 그리기 ──
paint(); mapH(true);
H.classList.add("pch-on");
window.addEventListener("resize",function(){ mapH(); try{ var q=$("q"); if(q) q.placeholder=L6(phone()?TX.qs:TX.q); }catch(e){} arrUpd(); eqGo(); });
window.addEventListener("load",function(){ adopt(); mapH(true); eqGo(); arrUpd(); qrMake(); });
D.addEventListener("DOMContentLoaded",function(){ adopt(); try{ paint(); }catch(e){} });
// 상품 목록은 허브(관리자 「상품 관리」)에서 한 번 더 — 앱 「AI와 일정짜기」 화면과 같은 길
try{ if(window.SHOP&&SHOP.load) SHOP.load().then(function(){ PKGLOADED=true; try{ pkgPaint(); }catch(e){} }); }catch(e){}
})();
