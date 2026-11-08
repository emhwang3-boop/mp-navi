/* MosaicTrip.com 홈페이지 — AI와 자유여행 (11-08 3b단계 · 배치도 tour_site\wireframes\4a·4b · 시안 tour_site\mock\ai_1·ai_2, 사장님 「좋아 통과」)
 *  · 화면 ① 담기와 준비  #/ai       — 맨 윗줄(제목·내 플랜 고르기·플랜 추가·플랜 삭제·🛒) · 왼쪽 ① 항공편 ② 첫날 숙소 ③ 조건
 *                                     · 가운데 「AI에게 묻기」+버튼 8개+추천 카드 · 오른쪽 따라오는 내 카트(끌기·머무는 시간·도착 시각·장소 찾기·[AI와 일정 짜기])
 *  · 화면 ② 일정표      #/ai/plan  — 왼쪽 따라오는 날짜 목록(누르면 그날로)+단추 5개 · 가운데 모든 날 위아래로(앱 일정표 그대로) · 오른쪽 따라오는 그날 큰 지도
 *  · 로직은 앱과 하나 (사장님 11-07) — 새 계산·새 호출 없음:
 *      카트·조건·일정표 = trip.js 가 그린 진짜 요소. trip.js sheet() 가 PCSHEET 로 이 화면 칸을 자리로 받고, 다 그린 뒤 PCTRIP 로 알려 주면 칸을 나눠 옮긴다
 *      (조건 칸 .trf2 → 왼쪽 ①②③ · 플랜 고르기 줄 .trpbar → 맨 윗줄) · 단추 핸들러는 요소에 붙어 있어 옮겨도 그대로
 *      AI에게 묻기·추천 카드 = reco.js 「AI와 일정짜기」 창(#aipBox)을 가운데 칸에 넣은 것 · 버튼 8개 = 그 칸에 정해 둔 질문을 넣고 「찾기」
 *  · 창(일정 추가·식당 찾기·넣기 확인·검사 창·자세히 보기)은 앱 창 그대로 화면 가운데에
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document, H=D.documentElement;
function $(id){ return D.getElementById(id); }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function F(o,v){ var s=L6(o); for(var k in v) s=s.split("{"+k+"}").join(v[k]); return s; }
function TS(){ try{ return window.TRIP&&TRIP.state(); }catch(e){ return null; } }
function phone(){ return !!(window.matchMedia&&matchMedia("(max-width:640px)").matches); }
function img(n,c){ return '<img'+(c?' class="'+c+'"':'')+' src="img/menu/'+n+'.png" alt="">'; }
function cart(sz){ return window.CARTSVG?CARTSVG(sz,"display:block"):""; }

// ── 글 (6개 언어) — 앱에 같은 말이 있으면 앱 것과 같게 ──
var TX={
 ttl:T6("AI와 자유여행","DIY Trip","DIY旅行","自助游","自助旅行","Viaje a tu aire"),
 sub:T6("가고 싶은 곳을 담으면 AI가 날짜별 일정을 짜 드려요","Add the places you want to go, and AI plans your trip day by day","行きたい場所を追加すると、AIが日ごとの日程を組みます","加入想去的地方，AI 为您按天安排行程","加入想去的地方，AI 為您按天安排行程","Añade los lugares que quieres visitar y la IA arma tu plan día a día"),
 cart:T6("내 카트","My cart","マイカート","我的购物车","我的購物車","Mi carrito"),
 cartN:T6("{n}곳 · 끌어서 순서 바꾸기","{n} places · drag to reorder","{n}か所 · ドラッグで並べ替え","{n}个地点 · 拖动调整顺序","{n}個地點 · 拖曳調整順序","{n} lugares · arrastra para reordenar"),
 s1:T6("① 항공편","① Flights","① 航空便","① 航班","① 航班","① Vuelos"),
 s2:T6("② 첫날 숙소","② First night's lodging","② 初日の宿","② 第一晚住宿","② 第一晚住宿","② Alojamiento de la primera noche"),
 s3:T6("③ 조건","③ Preferences","③ 条件","③ 条件","③ 條件","③ Preferencias"),
 ok:T6("✓ 정했어요","✓ Set","✓ 決定","✓ 已设定","✓ 已設定","✓ Listo"),   // 앱 「AI와 일정짜기」 ①② 와 같은 말
 ref:T6("(참고)","(for reference)","（目安）","（参考）","（參考）","(orientativa)"),   // 끝나는 시각은 참고만 (11-08)
 ask:T6("무엇을 하고 싶으세요?","What would you like to do?","何をしたいですか？","想做些什么？","想做些什麼？","¿Qué te gustaría hacer?"),
 askB:T6("AI에게 묻기","Ask AI","AIに聞く","问AI","問AI","Preguntar a la IA"),
 rh:T6("AI 추천","AI picks","AIのおすすめ","AI推荐","AI推薦","Sugerencias de la IA"),
 rhH:T6("카드를 누르면 자세히 볼 수 있어요","Click a card for details","カードを押すと詳しく見られます","点击卡片查看详情","點擊卡片查看詳情","Haz clic en una tarjeta para ver detalles"),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 dates:T6("날짜","Dates","日付","日期","日期","Fechas"),
 dayN:T6("{n}일차","Day {n}","{n}日目","第{n}天","第{n}天","Día {n}"),
 dep:T6("출국","Departure","出国","离境","離境","Salida"),
 free:T6("자유 일정","Free day","自由行動","自由活动","自由活動","Día libre"),   // 앱 일정표와 같은 말
 bEdit:T6("담은 곳·조건 고치기","Edit places & preferences","場所・条件を直す","修改地点和条件","修改地點和條件","Editar lugares y preferencias"),
 bShare:T6("공유","Share","共有","分享","分享","Compartir"),
 bPdf:T6("PDF","PDF","PDF","PDF","PDF","PDF"),
 bGrv:T6("가이드 일정 검토","Plan check by a guide","ガイドによる日程チェック","向导检查行程","嚮導檢查行程","Revisión del plan por un guía"),
 bRst:T6("처음부터 다시","Start over","最初からやり直す","从头开始","從頭開始","Empezar de nuevo"),
 rstQ:T6("이 기기에 저장한 모든 플랜(담은 장소·일정·숙소·항공 정보)을 지우고 처음부터 다시 시작할까요?","Delete all plans saved on this device (places, schedules, lodging and flight info) and start over?","この端末に保存したすべてのプラン（場所・旅程・宿・航空情報）を消して、最初からやり直しますか？","要删除这台设备上保存的所有方案（地点、行程、住宿和航班信息），从头开始吗？","要刪除這台裝置上儲存的所有方案（地點、行程、住宿和航班資訊），從頭開始嗎？","¿Borrar todos los planes guardados en este dispositivo (lugares, itinerarios, alojamiento y vuelos) y empezar de nuevo?"),
 busy:T6("만드는 중…","Making…","作成中…","正在生成…","正在產生…","Creando…"),
 mapT:T6("{n}일차 지도","Day {n} map","{n}日目の地図","第{n}天地图","第{n}天地圖","Mapa del día {n}"),
 mapH:T6("숙소 H에서 {r}","From your lodging (H): {r}","宿（H）から {r}","从住处（H）出发：{r}","從住處（H）出發：{r}","Desde el alojamiento (H): {r}"),
 mapV:T6("장소에 마우스를 올리면 번호가 커져요","Hover over a place to enlarge its number","場所にマウスを合わせると番号が大きくなります","将鼠标移到地点上，编号会放大","將滑鼠移到地點上，編號會放大","Pasa el ratón sobre un lugar para agrandar su número"),
 mapNo:T6("이 날은 지도에 표시할 장소가 없어요","No places to show on the map for this day","この日は地図に表示する場所がありません","这天没有可在地图上显示的地点","這天沒有可在地圖上顯示的地點","Este día no tiene lugares para mostrar en el mapa"),
 mapIng:T6("지도를 그리는 중…","Drawing the map…","地図を描いています…","正在绘制地图…","正在繪製地圖…","Dibujando el mapa…"),
 planB:T6("AI와 일정 짜기","Plan with AI","AIと日程を作る","用AI制定行程","用AI制定行程","Planear con IA")
};
// 「AI에게 묻기」 아래 버튼 8개 (사장님 11-08 이름 · 영어 밤문화 = Night Life) — 누르면 그 질문을 칸에 넣고 앱과 같은 AI 추천(허브 /nreco)
var CH=[
 {k:"ev",t:T6("이벤트","Events","イベント","活动","活動","Eventos"),q:T6("요즘 열리는 축제·공연·이벤트","Festivals, shows and events on now","今開催中のお祭り・公演・イベント","最近举办的节庆、演出和活动","最近舉辦的節慶、演出和活動","Festivales, espectáculos y eventos de estos días")},
 {k:"ex",t:T6("체험","Experiences","体験","体验","體驗","Experiencias"),q:T6("한복 입기·전통 공예 같은 한국 체험","Korean experiences like wearing hanbok or traditional crafts","韓服体験や伝統工芸などの韓国体験","穿韩服、传统手工艺等韩国体验","穿韓服、傳統手工藝等韓國體驗","Experiencias coreanas como vestir hanbok o artesanía tradicional")},
 {k:"fd",t:T6("K-Food","K-Food","K-Food","K-Food","K-Food","K-Food"),q:T6("꼭 먹어 봐야 할 한국 음식과 시장 먹거리","Must-try Korean food and market eats","絶対食べたい韓国料理と市場グルメ","必吃的韩国美食和市场小吃","必吃的韓國美食和市場小吃","Comida coreana imprescindible y puestos de mercado")},
 {k:"kp",t:T6("K-Pop","K-Pop","K-Pop","K-Pop","K-Pop","K-Pop"),q:T6("K-Pop 좋아해요 — 기획사·굿즈숍·공연장","I love K-Pop — agencies, merch shops and venues","K-POPが好き — 事務所・グッズショップ・公演会場","我喜欢K-Pop——经纪公司、周边店和演出场地","我喜歡K-Pop——經紀公司、周邊店和演出場地","Me encanta el K-Pop: agencias, tiendas de merch y salas")},
 {k:"hr",t:T6("헤어","Hair","ヘア","美发","美髮","Peluquería"),q:T6("K스타일 헤어 미용실","K-style hair salons","Kスタイルのヘアサロン","韩式发型美发店","韓式髮型美髮店","Peluquerías de estilo coreano")},
 {k:"bt",t:T6("K-Beauty","K-Beauty","K-Beauty","K-Beauty","K-Beauty","K-Beauty"),q:T6("K-뷰티 화장품 쇼핑과 퍼스널 컬러 진단","K-beauty cosmetics shopping and personal color analysis","Kビューティーのコスメショッピングとパーソナルカラー診断","韩国美妆购物和个人色彩诊断","韓國美妝購物和個人色彩診斷","Compras de cosmética coreana y análisis de color personal")},
 {k:"sk",t:T6("피부관리","Skin care","スキンケア","皮肤管理","皮膚管理","Cuidado de la piel"),q:T6("피부관리·에스테틱 받을 수 있는 곳","Places for facials and skin care","肌ケア・エステを受けられる場所","可以做皮肤护理和美容的地方","可以做皮膚護理和美容的地方","Lugares para tratamientos faciales y cuidado de la piel")},
 {k:"nl",t:T6("밤문화","Night Life","ナイトライフ","夜生活","夜生活","Vida nocturna"),q:T6("밤에 놀기 좋은 곳 — 클럽·바·야시장","Night life — clubs, bars and night markets","夜遊びにいい場所 — クラブ・バー・夜市","夜生活好去处——夜店、酒吧、夜市","夜生活好去處——夜店、酒吧、夜市","Vida nocturna: discotecas, bares y mercados nocturnos")}];

var S={v:"",chip:"",day:0,lock:0,sig:"",apSig:"",apSkip:0,rt:0,raf:0,hv:null,mk:"",obs:null,obsEl:null,rsObs:null};
var INSH=0;   // PCSHEET 가 화면을 바꾸는 중 — 그 사이엔 카트·일정표를 다시 열지 않는다(trip.js 가 바로 그 자리에 그린다)
function view(){ var r=$("pcAi"); return r&&r.isConnected?r.getAttribute("data-v"):""; }
function sigOf(tp){ return tp&&tp.items?tp.items.map(function(x){ return x.k; }).join("|"):""; }

// ── 화면 뼈대 ──
function shell(box,v){
  var bar='<div class="pa-barw"><div class="pa-bar" id="pcAiBar"><h1 class="pa-h1">'+img("mi_guide")+'<span id="paTtl"></span></h1><span class="pa-sub" id="paSub"></span>'
    +'<div class="pa-br"><div class="pa-plan" id="paPlan"></div><button type="button" class="pa-cartb" id="paCart">'+cart("28px")+'<b id="paCn">0</b></button></div></div></div>';
  var cols;
  if(v==="cart") cols='<aside class="pa-l pa-pn" id="paL">'
      +[1,2,3].map(function(i){ return '<section class="pa-s"><h3><span id="paS'+i+'"></span>'+(i<3?'<em class="pa-ok" id="paOk'+i+'" hidden></em>':'')+'</h3><div class="pa-f" id="paF'+i+'"></div></section>'; }).join("")+'</aside>'
    +'<section class="pa-c"><div class="pa-pn pa-ask"><h2 id="paAsk"></h2><div id="paAip"></div></div></section>'
    +'<aside class="pa-r"><div class="pa-pn pa-cartp" id="paCartP"><div class="pa-ch">'+cart("22px")+'<b id="paCt"></b><span id="paCs"></span></div><div class="pa-host"></div></div></aside>';
  else cols='<aside class="pa-l"><div class="pa-pn pa-days"><h3 id="paDt"></h3><div class="pa-dl" id="paDl"></div><div class="pa-lb" id="paLb">'
      +["edit","share","pdf","grv","rst"].map(function(k){ return '<button type="button" class="pa-lbt'+(k==="rst"?" g":"")+'" data-lb="'+k+'"></button>'; }).join("")+'</div></div></aside>'
    +'<section class="pa-c"><div class="pa-host"></div></section>'
    +'<aside class="pa-r"><div class="pa-pn pa-map"><div class="pa-mw"><div class="pa-mi" id="paMi"></div><div class="pa-mo" id="paMo"></div></div><div class="pa-mc" id="paMc"></div></div></aside>';
  box.innerHTML='<div id="pcAi" class="pa-v'+(v==="cart"?1:2)+'" data-v="'+v+'">'+bar+'<div class="pa-cols">'+cols+'</div></div>';
  S.v=v; S.mk=""; S.hv=null; if(v==="plan"){ S.day=0; } }
function host(v){ var r=$("pcAi"); if(!r||!r.isConnected||r.getAttribute("data-v")!==v) return null; return r.querySelector(".pa-host"); }

// 글 그리기 (언어를 바꾸면 다시)
function paint(){ var v=view(); if(!v) return; var s=function(id,t){ var e=$(id); if(e) e.textContent=t; };
  s("paTtl",L6(TX.ttl)); s("paSub",L6(TX.sub)); var cb=$("paCart"); if(cb){ cb.title=L6(TX.cart); cb.setAttribute("aria-label",L6(TX.cart)); }
  if(v==="cart"){ s("paS1",L6(TX.s1)); s("paS2",L6(TX.s2)); s("paS3",L6(TX.s3)); s("paOk1",L6(TX.ok)); s("paOk2",L6(TX.ok)); s("paAsk",L6(TX.ask)); s("paCt",L6(TX.cart)); okPaint(); aipPaint(); }
  else { s("paDt",L6(TX.dates)); var LB={edit:TX.bEdit,share:TX.bShare,pdf:TX.bPdf,grv:TX.bGrv,rst:TX.bRst};
    [].forEach.call(D.querySelectorAll("#paLb [data-lb]"),function(b){ if(!b.disabled) b.textContent=L6(LB[b.getAttribute("data-lb")]); }); daysPaint(); mapSync(true); }
  cnPaint(); }
function cnPaint(){ var tp=TS(), n=tp&&tp.items?tp.items.length:0, e=$("paCn"); if(e){ e.textContent=n; e.hidden=!n; } var c=$("paCs"); if(c) c.textContent=F(TX.cartN,{n:n}); }

function whenCity(cb){ var n=0; (function w(){ if((window.CITY&&Object.keys(CITY).length)||++n>100) cb(); else setTimeout(w,100); })(); }   // 새로 열었을 때 지도 자료(도시)가 오기 전이면 잠깐 기다림 — 앱 공유 링크 여는 길과 같음

// trip.js sheet() 가 부른다 — 카트(trBox)는 ①의 오른쪽 칸, 일정표(trRep)는 ②의 가운데 칸 · 다른 화면에 있으면 그 화면으로 바꾼 뒤 자리를 준다
window.PCSHEET=function(id){ if(id!=="trBox"&&id!=="trRep") return null; var v=id==="trBox"?"cart":"plan", h=host(v); if(h) return h;
  INSH=1; try{ var hs="#/ai"+(v==="plan"?"/plan":""); if(location.hash!==hs) history.pushState(null,"",location.pathname+location.search+hs); if(window.PCRENDER) PCRENDER(); } finally{ INSH=0; }
  return host(v); };
// trip.js 가 카트·일정표를 다 그린 뒤 · 담은 곳이 바뀐 뒤
window.PCTRIP=function(w,box){ if(w==="panel0") panelPre(box); else if(w==="panel") onPanel(box); else if(w==="rep") onRep(box); else if(w==="refresh") onRefresh(); };
// 다른 곳에서 「AI와 일정짜기」 창을 열면 이 화면으로
var APO=window.AIPLAN&&AIPLAN.open;
if(APO) AIPLAN.open=function(){ if(view()==="cart") return aipMount(); if(window.PCGO) PCGO("ai"); };

// ── 플랜 고르기 줄(앱 .trpbar) → 맨 윗줄 ──
function planBar(box){ var pb=box&&box.querySelector(".trpbar"), sl=$("paPlan"); if(!pb||!sl) return; sl.innerHTML=""; sl.appendChild(pb); }

// ══ ① 담기와 준비 ══
// 카트를 다시 그리기 직전 — 왼쪽에 옮겨 둔 지난 칸(같은 id)을 먼저 치운다(앱이 id 로 새 칸에 핸들러를 붙이게)
function panelPre(box){ var r=$("pcAi"); if(!r||!r.contains(box)) return; ["paF1","paF2","paF3"].forEach(function(id){ var e=$(id); if(e) e.innerHTML=""; }); }
function onPanel(box){ var r=$("pcAi"); if(!r||!r.contains(box)) return; S.sig=sigOf(TS());
  planBar(box);
  var tf=box.querySelector(".trf2"), f1=$("paF1"), f2=$("paF2"), f3=$("paF3");
  if(tf&&f1&&f2&&f3){ f1.innerHTML=f2.innerHTML=f3.innerHTML="";
    var lab=function(id){ var e=$(id); return e&&tf.contains(e)?(e.closest("label")||e):null; };
    var row=function(par,els,c){ var d=D.createElement("div"); d.className="pa-row "+c; els.forEach(function(e){ if(e) d.appendChild(e); }); if(d.children.length) par.appendChild(d); };
    row(f1,[lab("trStart"),lab("trN"),lab("trPax")],"c3");   // 첫날 · 여행 일수 · 인원
    [].forEach.call(tf.querySelectorAll(".trapr"),function(e){ f1.appendChild(e); });   // 도착 공항·도착 시각 / 출발 공항·출발 시각
    var nt=tf.querySelector("div.wide.d"); if(nt){ nt.className="pa-note"; nt.removeAttribute("style"); f1.appendChild(nt); }
    var ch=tf.querySelector(".trch"); if(ch) f2.appendChild(ch); else { var hs=lab("trHotel"); if(hs) f2.appendChild(hs); }   // 숙소 (도시가 여럿이면 도시별 숙소)
    var sr=tf.querySelector(".trsr"); if(sr) f2.appendChild(sr); var ar=$("trAddrR"); if(ar&&tf.contains(ar)) f2.appendChild(ar);
    var to=lab("trTo"); if(to&&!to.querySelector(".pa-lt")){ var tn=to.firstChild; if(tn&&tn.nodeType===3){ var w=D.createElement("span"); w.className="pa-lt"; to.insertBefore(w,tn); w.appendChild(tn); w.insertAdjacentHTML("beforeend",' <small class="pa-ref">'+E(L6(TX.ref))+'</small>'); } }
    row(f3,[lab("trFrom"),to],"c2"); row(f3,[lab("trWalk"),lab("trFood")],"c2"); var ad=lab("trAdv"); if(ad) f3.appendChild(ad);
    tf.hidden=true; }
  var pb=$("trPlan"); if(pb) pb.textContent=L6(TX.planB);   // 앱 「🗓 일정 짜기」 = 시안 「AI와 일정 짜기」
  okPaint(); cnPaint(); cartFit(); }
// ① ② 제목 옆 「✓ 정했어요」 — 앱 「AI와 일정짜기」 3단계와 같은 기준(도착·출발 공항을 다 골랐을 때 · 이 날짜로 숙소를 골랐을 때)
function okPaint(){ var tp=TS(); if(!tp) return; var o=tp.opt||{}, ap=o.ap||{}, f1=!!(ap.a&&ap.a.id&&ap.d&&ap.d.id), hk=(o.start||"")+"|"+(o.n||1);
  var f2=(!!o.hotel&&o.hOk===hk)||!!(o.hotels&&Object.keys(o.hotels).some(function(k){ return !!o.hotels[k]; }));
  var a=$("paOk1"), b=$("paOk2"); if(a) a.hidden=!f1; if(b) b.hidden=!f2; }
D.addEventListener("change",function(e){ if(e.target&&e.target.closest&&e.target.closest("#pcAi .pa-l")) setTimeout(okPaint,0); });
D.addEventListener("click",function(e){ if(e.target&&e.target.closest&&e.target.closest("#pcAi .pa-l .tra")) setTimeout(okPaint,0); });

// 가운데 — 앱 「AI와 일정짜기」 창(#aipBox)을 이 칸에 넣는다 (덮개·「완료」·3단계 칸은 뺌 — 3단계는 왼쪽 칸이 맡음)
function aipMount(){ var hb=$("paAip"); if(!hb||!window.AIPLAN) return; var b=$("aipBox");
  if(!b&&APO){ try{ APO.call(AIPLAN); }catch(e){} b=$("aipBox"); }
  if(!b) return; H.classList.remove("aiplock"); b.setAttribute("data-pc","1"); b.removeAttribute("role"); if(b.parentNode!==hb) hb.appendChild(b);
  var st=$("aipSteps"); if(st) st.remove();
  var f=$("aipF"); if(f&&!f.querySelector(".pa-qic")) f.insertAdjacentHTML("afterbegin",img("mi_search","pa-qic"));
  if(f&&!$("paChips")) f.insertAdjacentHTML("afterend",'<div class="pa-chips" id="paChips"></div><div class="pa-rh" id="paRh" hidden></div>');
  var rs=$("aipRes"); if(rs&&S.rsEl!==rs){ if(S.rsObs) S.rsObs.disconnect(); S.rsEl=rs; try{ S.rsObs=new MutationObserver(rhPaint); S.rsObs.observe(rs,{childList:true}); }catch(e){} }
  aipPaint(); rhPaint(); }
function aipPaint(){ var g=$("aipGo"); if(g) g.innerHTML='<span>'+E(L6(TX.askB))+'</span>';
  var c=$("paChips"); if(c) c.innerHTML=CH.map(function(x){ return '<button type="button" class="pa-chip'+(S.chip===x.k?' on':'')+'" data-chip="'+x.k+'">'+E(L6(x.t))+'</button>'; }).join("");
  chipFit(); rhPaint(); }
// 버튼 8개는 같은 크기 한 줄 (사장님 11-08 단추 규칙) — 글자가 넘치면 그 줄 글씨만 줄인다
function chipFit(){ var c=$("paChips"); if(!c) return; c.style.removeProperty("--pa-cf"); requestAnimationFrame(function(){ var bs=c.children, fs=13.5, n=0, over=function(){ for(var i=0;i<bs.length;i++) if(bs[i].scrollWidth>bs[i].clientWidth+1) return true; return false; };
  while(over()&&fs>10.5&&n++<8){ fs-=0.5; c.style.setProperty("--pa-cf",fs+"px"); } }); }
// 추천 결과 머리 한 줄 — 「AI 추천 · K-Food · 카드를 누르면 자세히」
function rhPaint(){ var rh=$("paRh"), rs=$("aipRes"); if(!rh||!rs) return; var on=!!rs.querySelector(".apc,.apk"), ch=CH.filter(function(x){ return x.k===S.chip; })[0];
  rh.hidden=!on; if(on) rh.innerHTML='<b>'+E(L6(TX.rh))+(ch?' · '+E(L6(ch.t)):'')+'</b><span>'+E(L6(TX.rhH))+'</span>';
  S.apSig=sigOf(TS()); phSlots(); }
D.addEventListener("click",function(e){ var c=e.target.closest&&e.target.closest("#paChips [data-chip]"); if(!c) return; e.preventDefault();
  var ch=CH.filter(function(x){ return x.k===c.getAttribute("data-chip"); })[0], q=$("aipQ"), f=$("aipF"); if(!ch||!q||!f) return;
  S.chip=ch.k; q.value=L6(ch.q); aipPaint(); try{ if(f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event("submit",{cancelable:true})); }catch(x){} });
D.addEventListener("submit",function(e){ if(!e.target||e.target.id!=="aipF"||!S.chip) return; var ch=CH.filter(function(x){ return x.k===S.chip; })[0], q=$("aipQ");
  if(!ch||!q||q.value.trim()!==L6(ch.q).trim()){ S.chip=""; aipPaint(); } },true);   // 손님이 직접 적어 찾으면 버튼 표시는 끈다
// ── 추천 카드 사진 (사장님 11-08 「나」 · 시안 ai_1) — 앱 장소 사진과 같은 길: trip.js ppPhoto(TRIP.photo) = 허브 /gphoto · 같은 캐시 _cphC · 「사진: 찍은 사람 · Google」 줄
//   화면에 들어온 카드만 받는다 · 한 곳에 한 번(받는 중이면 기다렸다가 저장분으로 · 못 받은 곳은 다시 안 부름) · 상품 카드는 원래 사진 그대로 · 사진이 없거나 실패하면 사진 칸을 접는다
var PH={p:{},bad:{},io:null};
function phSrc(o){ if(!o) return null; if(o.t==="p"){ var P=window.PLACES&&PLACES[o.p.k]; return P&&P.ko&&+P.lat?{k:o.p.k,ko:P.ko,lat:+P.lat,lng:+P.lng}:null; }
  var x=o.x||{}, g=o.t==="g", lat=g?+x.lat:+x.y, lng=g?+x.lng:+x.x; return x.name&&lat&&lng?{k:"",ko:x.name,lat:lat,lng:lng}:null; }   // 우리 명소 = 앱 장소 카드와 같은 이름·자리(같은 캐시 칸)
function phKey(s){ var fx=(window.CPH_FIX||{})[s.k]||null, fq=fx?(fx.q?"&pq="+encodeURIComponent(fx.q):"")+(fx.pi!=null?"&pi="+fx.pi:""):""; return s.ko+"|"+s.lat.toFixed(4)+","+s.lng.toFixed(4)+fq; }   // ppPhoto 캐시 열쇠와 같은 꼴
function phSlot(s){ var el=D.createElement("div"); el.className="pa-ph"; el._ph=s; return el; }
function phSlots(){ var rs=$("aipRes"); if(!rs||!window.TRIP||!TRIP.photo||!window.AIPLAN||!AIPLAN.list) return; var L=null;
  [].forEach.call(rs.querySelectorAll(".item.apc[data-ai]"),function(c){ if(c.querySelector(".pa-ph")) return; if(!L){ try{ L=AIPLAN.list()||[]; }catch(e){ L=[]; } }
    var s=phSrc(L[+c.getAttribute("data-ai")]); if(!s) return; var el=phSlot(s); c.insertBefore(el,c.firstChild); phWatch(el); }); }
function phWatch(el){ if(!("IntersectionObserver" in window)){ phGet(el); return; }
  if(!PH.io) PH.io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ PH.io.unobserve(e.target); phGet(e.target); } }); },{rootMargin:"80px 0px"});
  PH.io.observe(el); }
function phGet(el){ var s=el._ph; if(!s||!el.isConnected) return; var ck=phKey(s), C=window._cphC||{};
  if(PH.bad[ck]) return phFin(el,null);
  if(C[ck]) return TRIP.photo(s.k,s.ko,s.lat,s.lng,el,function(j){ phFin(el,j); });
  if(PH.p[ck]){ PH.p[ck].push(el); return; }
  PH.p[ck]=[]; TRIP.photo(s.k,s.ko,s.lat,s.lng,el,function(j){ phFin(el,j); var w=PH.p[ck]||[]; delete PH.p[ck]; if(!j) PH.bad[ck]=1; w.forEach(phGet); }); }
function phFin(el,j){ if(!j||!j.ok){ el.remove(); return; } el.classList.add("on"); }   // 그림이 안 열리면 ppPhoto 가 칸을 숨긴다(hidden)
// 추천 카드를 누르면 화면 가운데 창으로 「자세히 보기」 (앱 카드 상세와 같은 내용 · 담기 단추도 그대로)
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest) return; var c=t.closest("#pcAi #aipRes .apc[data-ai]"); if(!c||t.closest("[data-aa],a,button")||!window.AIPLAN||!AIPLAN.det) return;
  e.preventDefault(); e.stopPropagation(); detOpen(+c.getAttribute("data-ai")); },true);
D.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("#pcAi #aipBox [data-aa]")) S.apSkip=Date.now(); },true);   // 카드 「담기」는 reco.js 가 단추를 바꾼다 — 다시 그리지 않음
function detOpen(i){ var b=$("aipBox"); if(!b) return; detClose(); var h=""; try{ h=AIPLAN.det(i); }catch(e){} if(!h) return;
  var p=D.createElement("div"); p.className="trpop pa-det"; p.id="paDet";
  p.innerHTML='<div class="pa-detb"><button type="button" class="pa-x" aria-label="'+E(L6(TX.x))+'">✕</button>'+h+'</div>';
  p.onclick=function(e){ if(e.target===p||(e.target.closest&&e.target.closest(".pa-x,[data-ap=back]"))){ e.preventDefault(); e.stopPropagation(); detClose(); } };
  b.appendChild(p);
  var dt=p.querySelector(".apdet"), s=null; try{ s=phSrc(AIPLAN.list()[i]); }catch(e){} if(dt&&s){ var el=phSlot(s); el.className="pa-ph pa-phd"; dt.insertBefore(el,dt.firstChild); phGet(el); } }   // 자세히 보기도 같은 사진(같은 캐시 — 카드에서 받았으면 다시 안 부름)
function detClose(){ var p=$("paDet"); if(p) p.remove(); }
D.addEventListener("keydown",function(e){ if(e.key==="Escape"&&$("paDet")) detClose(); });

// 담은 곳이 바뀌면(카드 「담기」·카트 ✕·장소 찾기 「＋ 담기」) — 오른쪽 카트·맨 윗줄 수·추천 카드 단추를 맞춘다
function onRefresh(){ cnPaint(); if(view()!=="cart") return; clearTimeout(S.rt); S.rt=setTimeout(function(){ if(view()!=="cart") return; var sg=sigOf(TS());
  if(sg!==S.sig&&$("trBox")&&window.TRIP&&TRIP.panel) TRIP.panel();
  if(sg!==S.apSig){ S.apSig=sg; if(Date.now()-S.apSkip>800&&window.AIPLAN&&AIPLAN.paint) AIPLAN.paint(); } },0); }

// 🛒 — 짠 일정이 있으면 일정표, 없으면 카트 (앱 머리줄 카트와 같은 규칙)
D.addEventListener("click",function(e){ if(!(e.target.closest&&e.target.closest("#paCart"))) return; e.preventDefault(); var tp=TS(), v=view();
  if(tp&&tp.plan){ if(v==="plan") window.scrollTo({top:0,behavior:"smooth"}); else TRIP.report(); return; }
  if(v!=="cart"){ if(window.PCGO) PCGO("ai"); return; }
  var c=$("paCartP"); if(c){ try{ c.scrollIntoView({block:"start",behavior:"smooth"}); }catch(x){} c.classList.remove("pa-fl"); void c.offsetWidth; c.classList.add("pa-fl"); } });

// ══ ② 일정표 ══
function onRep(box){ var r=$("pcAi"); if(!r||!r.contains(box)) return; planBar(box); daysPaint(); mapSync(true); cnPaint();
  var rep=$("trRep"); if(rep&&S.obsEl!==rep){ if(S.obs) S.obs.disconnect(); S.obsEl=rep; try{ S.obs=new MutationObserver(function(){ if(S.mq) return; S.mq=requestAnimationFrame(function(){ S.mq=0; mapSync(false); }); }); S.obs.observe(rep,{childList:true,subtree:true}); }catch(e){} }
  setTimeout(onScroll,80); }
function dShort(s){ var d=new Date(s+"T00:00:00Z"); if(!isFinite(d)) return ""; var m=d.getUTCMonth()+1, dd=d.getUTCDate(), w=d.getUTCDay(), L=window.LANG;
  if(L==="ko") return m+"/"+dd+" ("+"일월화수목금토".charAt(w)+")";
  if(L==="ja") return m+"/"+dd+"（"+"日月火水木金土".charAt(w)+"）";
  if(L==="zhs") return m+"/"+dd+"（"+["周日","周一","周二","周三","周四","周五","周六"][w]+"）";
  if(L==="zht") return m+"/"+dd+"（"+["週日","週一","週二","週三","週四","週五","週六"][w]+"）";
  if(L==="es") return ["dom","lun","mar","mié","jue","vie","sáb"][w]+" "+dd+"/"+m;
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][w]+" "+m+"/"+dd; }
// 왼쪽 날짜 목록 — 앱 일정표 날 머리의 요약(장소 ○곳)을 그대로 · 장소 없는 마지막 날은 「출국」(돌아가는 비행기를 넣었을 때), 남는 날은 「자유 일정」
function daysPaint(){ var tp=TS(), pl=tp&&tp.plan, dl=$("paDl"); if(!pl||!dl) return; var o=tp.opt||{}, h="";
  [].forEach.call(D.querySelectorAll("#trRep .tday"),function(t){ var di=+t.getAttribute("data-d"), d=pl.days[di]; if(!d) return;
    var sm=t.querySelector(".tsum"), cnt=sm?String(sm.textContent).split(" · ")[0]:"", dep=di===pl.days.length-1&&o.ap&&o.ap.d&&o.ap.d.id;
    var rt=cnt||(dep?L6(TX.dep):t.querySelector(".tfree")?L6(TX.free):"");
    h+='<button type="button" class="pa-dli'+(di===S.day?' on':'')+'" data-d="'+di+'"><span><b>'+E(F(TX.dayN,{n:di+1}))+'</b> '+E(dShort(d.date))+'</span><i>'+E(rt)+'</i></button>'; });
  dl.innerHTML=h; }
function setDay(di,scroll){ var ch=di!==S.day; S.day=di; [].forEach.call(D.querySelectorAll("#paDl .pa-dli"),function(b){ var on=+b.getAttribute("data-d")===di; b.classList.toggle("on",on);
    if(on&&ch){ var dl=$("paDl"); if(dl&&dl.scrollWidth>dl.clientWidth+2) dl.scrollLeft=Math.max(0,b.offsetLeft-dl.clientWidth/2+b.offsetWidth/2); else if(dl&&dl.scrollHeight>dl.clientHeight+2){ var top=b.offsetTop-dl.offsetTop; if(top<dl.scrollTop||top+b.offsetHeight>dl.scrollTop+dl.clientHeight) dl.scrollTop=top-dl.clientHeight/2; } } });
  mapSync(true);
  if(scroll){ var t=D.querySelector('#trRep .tday[data-d="'+di+'"]'); if(t){ S.lock=Date.now(); try{ window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+window.scrollY-12),behavior:"smooth"}); }catch(e){ window.scrollTo(0,t.getBoundingClientRect().top+window.scrollY-12); } } } }
D.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#paDl .pa-dli"); if(!b) return; e.preventDefault(); setDay(+b.getAttribute("data-d"),true); });
// 지금 보고 있는 날 — 화면 위쪽(높이 40%·260px 중 작은 쪽)을 지나간 마지막 날
// ① 오른쪽 카트 높이 = 화면 아래 끝까지 (맨 위에서도 「AI와 일정 짜기」가 첫 화면에 보이게 · 내리면 위에 붙어 따라옴)
function cartFit(){ var p=$("paCartP"); if(!p||view()!=="cart") return; if(getComputedStyle(p.parentNode).position!=="sticky"){ p.style.maxHeight=""; return; } var t=Math.max(16,p.getBoundingClientRect().top); p.style.maxHeight=Math.max(320,Math.round(window.innerHeight-t-16))+"px"; }
function onScroll(){ if(S.raf) return; S.raf=requestAnimationFrame(function(){ S.raf=0; if(view()==="cart"){ cartFit(); return; } if(view()!=="plan"||Date.now()-S.lock<900) return;
  var ds=D.querySelectorAll("#trRep .tday"), y=Math.min(window.innerHeight*0.4,260), cur=-1;
  for(var i=0;i<ds.length;i++){ if(ds[i].getBoundingClientRect().top<=y) cur=+ds[i].getAttribute("data-d"); else break; }
  if(cur<0&&ds.length) cur=+ds[0].getAttribute("data-d"); if(cur>=0&&cur!==S.day) setDay(cur,false); }); }
window.addEventListener("scroll",onScroll,{passive:true});
// 오른쪽 큰 지도 = 그날 일정표 지도 그림(앱이 그린 것) + 마우스를 올린 장소 번호를 크게 (자리는 trip.js 가 그릴 때 기억, TRIP.mk)
function circ(n){ n=+n; return n>=1&&n<=20?String.fromCharCode(0x245F+n):"("+n+")"; }
function mapSync(force){ var mi=$("paMi"), mo=$("paMo"), mc=$("paMc"); if(!mi||view()!=="plan") return; var di=S.day, el=$("tmap"+di), im=el&&el.querySelector("img"), src=im?im.getAttribute("src")||"":"", mk=el?el.getAttribute("data-mk")||"":"";
  var key=di+"|"+(el?1:0)+"|"+mk+"|"+src.length+"|"+(window.LANG||"");
  if(!force&&key===S.mk) return; S.mk=key; S.hv=null;
  if(!el||!im){ mi.innerHTML='<div class="pa-mno">'+E(L6(el?TX.mapIng:TX.mapNo))+'</div>'; mo.innerHTML=""; }
  else { var ni=D.createElement("img"); ni.alt=""; ni.src=src; mi.innerHTML=""; mi.appendChild(ni);
    var m=null; try{ m=mk&&window.TRIP&&TRIP.mk?TRIP.mk(mk):null; }catch(e){}
    mo.innerHTML=m&&m.w&&m.h?m.p.map(function(q){ return '<b data-n="'+q[2]+'" style="left:'+(q[0]/m.w*100).toFixed(2)+'%;top:'+(q[1]/m.h*100).toFixed(2)+'%">'+q[2]+'</b>'; }).join(""):""; }
  if(mc){ var td=D.querySelector('#trRep .tday[data-d="'+di+'"]'), ps=td?[].slice.call(td.querySelectorAll(".trw.tpk")):[], nmOf=function(r){ var n=r.querySelector(".tno"), t=r.querySelector(".tpn"); return circ(n?n.textContent:"")+" "+(t?t.textContent:""); };
    var rt=ps.length?nmOf(ps[0])+(ps.length>1?" → "+nmOf(ps[ps.length-1]):""):"", m2=null; try{ m2=mk&&TRIP.mk?TRIP.mk(mk):null; }catch(e){}
    mc.innerHTML='<b>'+E(F(TX.mapT,{n:di+1}))+'</b>'+(rt?'<span class="pa-mr">'+E(m2&&m2.hp?F(TX.mapH,{r:rt}):rt)+'</span>':'')+(el&&im&&ps.length?'<small>'+E(L6(TX.mapV))+'</small>':''); } }
// 장소 카드에 마우스 → 그날 지도로 바꾸고 그 번호를 크게
D.addEventListener("mouseover",function(e){ if(view()!=="plan") return; var r=e.target.closest?e.target.closest("#pcAi #trRep .trw.tpk"):null; if(r===S.hv) return; S.hv=r;
  [].forEach.call(D.querySelectorAll("#paMo b.on"),function(b){ b.classList.remove("on"); }); if(!r) return;
  var td=r.closest(".tday"), di=td?+td.getAttribute("data-d"):-1, n=(r.querySelector(".tno")||{}).textContent; if(di<0) return;
  if(di!==S.day){ setDay(di,false); S.hv=r; } var b=D.querySelector('#paMo b[data-n="'+n+'"]'); if(b) b.classList.add("on"); });
// 왼쪽 단추 5개 = 앱 일정표 단추를 그대로 누른다 (✏ 고치기 · 공유 · 폰에 저장(PDF) · 가이드 일정 검토 · 처음부터 다시)
D.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#paLb [data-lb]"); if(!b) return; e.preventDefault(); var k=b.getAttribute("data-lb"), cl=function(id){ var x=$(id); if(x) x.click(); return x; };
  if(k==="edit") cl("trEdit");
  else if(k==="share"){ cl("trShare"); setTimeout(function(){ var nb=$("trNextBox"); if(nb&&nb.firstElementChild) try{ window.scrollTo({top:Math.max(0,nb.getBoundingClientRect().top+window.scrollY-16),behavior:"smooth"}); }catch(x){} },60); }
  else if(k==="pdf"){ var p=cl("trPdf"); if(!p) return; b.disabled=true; b.textContent=L6(TX.busy); var iv=setInterval(function(){ var q=$("trPdf"); if(!q||!q.disabled||!b.isConnected){ clearInterval(iv); b.disabled=false; b.textContent=L6(TX.bPdf); } },300); }   // 다 만들 때까지 「만드는 중…」
  else if(k==="grv") cl("trGrvB");
  else if(k==="rst"){ if(window.TRIP&&TRIP.reset) TRIP.reset(L6(TX.rstQ)); } });

// ── 언어 바꾸기 — 앱 setLang(카트·일정표를 그 자리에서 다시) 뒤에 이 화면 글도 ──
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ paint(); }catch(e){} return r; };
window.addEventListener("resize",function(){ if(view()==="cart"){ chipFit(); cartFit(); } });
// ── 길잡이 등록 — #/ai = ① · #/ai/plan = ② (맨 끝에서 — 주소가 이미 #/ai 이면 등록하자마자 그린다) ──
window.PCREG("ai",function(box,args){ var v=args[0]==="plan"?"plan":"cart", tp=TS();
  if(v==="plan"&&!(tp&&tp.plan)&&!INSH){ box.innerHTML=""; setTimeout(function(){ try{ history.replaceState(null,"",location.pathname+location.search+"#/ai"); }catch(e){} if(window.PCRENDER) PCRENDER(); },0); return; }   // 짠 일정이 없으면 ①
  shell(box,v); paint();
  if(v==="cart"){ aipMount(); if(!INSH&&window.TRIP) TRIP.open(); }
  else if(!INSH) whenCity(function(){ if(view()==="plan"&&!$("trRep")&&window.TRIP) TRIP.report(); }); });
})();
