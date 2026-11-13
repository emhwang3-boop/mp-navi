/* MosaicTrip.com 홈페이지 — 가이드 인솔 자유여행 (11-08 3a단계 · 배치도 tour_site\wireframes\2_가이드인솔_배치도)
 *  · 화면 ① 가이드 고르기  #/guide            — 제목 카드(▼/ㅡ) · ⓘ 주의 사항(처음엔 접힘) · 왼쪽 언어·지역·정렬 · 가이드 카드 3줄
 *  · 화면 ② 예약하기      #/guide/<id>/<언어>  — 왼쪽 고른 가이드 · 가운데 예약 칸 · 오른쪽 따라오는 요금 + 「예약·결제」
 *  · 로직은 앱 near.js 그대로 (window.NEARIG — PC_HOME 일 때만 열림): 요금(GBK·gbkCalc)·칸 검사(gbSend, 칸 id 같음)·확인 창 → 결제 → 확정(허브 /shop/order)
 *    확인·결제·확정 창은 앱의 창(#nrBox)을 화면 가운데에 띄운다(.pcg) — 결제하면 확정 · 가이드와 대화방 (투어앱 규칙서 6장)
 *  · 가이드 목록·후기는 앱과 같은 허브 주소(/guide/guides?lang= · /guide/reviews) — 읽기만, 돈 드는 호출 없음
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document;
function N(){ return window.NEARIG||null; }
function LANGS(){ return ["ko","en","ja","zhs","zht","es"].filter(function(l){ return (!window.svcOn||svcOn(l)); }); }   // 11-13 숨긴 서비스 언어 빼기
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function XT(on,attrs){ return window.XTG?XTG.html(on,attrs):'<button type="button" '+(attrs||"")+'>'+(on?"—":"▼")+'</button>'; }

// ── 글 (6개 언어) — 앱에 있는 글은 앱 것을 그대로 (NEARIG.GBT 등) ──
var TX={
 pick:T6("고르기","Filters","絞り込み","筛选","篩選","Filtros"),
 lang:T6("필요한 언어","Language you need","必要な言語","需要的语言","需要的語言","Idioma que necesitas"),
 rgn:T6("지역","Area","地域","地区","地區","Zona"),
 sort:T6("정렬","Sort by","並べ替え","排序","排序","Ordenar"),
 sRv:T6("후기 많은 순","Most reviews","レビューが多い順","评价多的优先","評價多的優先","Más reseñas"),
 sYr:T6("경력 순","Most experience","経験が長い順","经验多的优先","經驗多的優先","Más experiencia"),
 all:T6("전체","All","すべて","全部","全部","Todas"),
 fee:T6("요금 안내","Prices","料金のご案内","费用说明","費用說明","Precios"),
 cnt:T6("가이드 {n}명","{n} guides","ガイド {n}名","向导 {n} 位","嚮導 {n} 位","{n} guías"),
 cnt1:T6("가이드 1명","1 guide","ガイド 1名","向导 1 位","嚮導 1 位","1 guía"),
 req:T6("요청하기 ›","Request ›","依頼する ›","请求 ›","請求 ›","Solicitar ›"),   // 앱 가이드 목록과 같은 글
 load:T6("찾는 중…","Searching…","検索中…","搜索中…","搜尋中…","Buscando…"),
 err:T6("잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Inténtalo de nuevo en un momento."),
 none:T6("아직 등록된 가이드가 없습니다. 곧 추가될 예정이에요.","No guides registered yet. More coming soon.","まだ登録されたガイドがいません。近日追加予定です。","暂无已登记的向导，即将新增。","暫無已登記的嚮導，即將新增。","Aún no hay guías registrados. Pronto habrá más."),
 noRg:T6("이 지역에는 아직 가이드가 없어요. 다른 지역을 골라 보세요.","No guides in this area yet. Please try another area.","この地域にはまだガイドがいません。別の地域を選んでみてください。","该地区暂时没有向导，请选择其他地区。","該地區暫時沒有嚮導，請選擇其他地區。","Aún no hay guías en esta zona. Prueba con otra."),
 bk:T6("예약 정보","Booking details","予約内容","预约信息","預約資訊","Datos de la reserva"),
 conf:T6("결제하면 바로 확정돼요. 가이드와 대화방이 열려 가고 싶은 곳을 함께 정해요.","Your booking is confirmed as soon as you pay. A chat with your guide opens so you can plan the places together.","お支払いと同時に予約が確定します。ガイドとのチャットが開き、行きたい場所を一緒に決められます。","付款后预约立即确认。会开启与向导的聊天室，一起商定想去的地方。","付款後預約立即確認。會開啟與嚮導的聊天室，一起商定想去的地方。","La reserva se confirma en cuanto pagas. Se abre un chat con tu guía para decidir juntos los lugares."),
 other:T6("‹ 다른 가이드 보기","‹ See other guides","‹ ほかのガイドを見る","‹ 查看其他向导","‹ 查看其他嚮導","‹ Ver otros guías"),
 rv:T6("손님 후기","Traveler reviews","旅行者のレビュー","旅客评价","旅客評價","Reseñas de viajeros"),
 noRv:T6("아직 후기가 없습니다.","No reviews yet.","まだレビューがありません。","暂无评价。","暫無評價。","Aún no hay reseñas."),
 rvN:T6("후기 {n}개","{n} reviews","レビュー{n}件","{n}条评价","{n}則評價","{n} reseñas"),
 rvMore:T6("후기 더 보기","More reviews","レビューをもっと見る","查看更多评价","查看更多評價","Ver más reseñas"),
 anon:T6("익명","Anonymous","匿名","匿名","匿名","Anónimo"),
 gedit:T6("가이드이신가요? 내 프로필 수정 ›","Are you a guide? Edit my profile ›","ガイドの方はこちら：プロフィール編集 ›","您是向导吗？修改我的资料 ›","您是嚮導嗎？修改我的資料 ›","¿Eres guía? Editar mi perfil ›"),
 gme:T6("가이드 화면 — 내 예약·손님과 대화 ›","Guide screen — my bookings & chats ›","ガイド画面 — 予約・お客様とのチャット ›","向导页面 — 我的预约·与旅客聊天 ›","嚮導頁面 — 我的預約·與旅客聊天 ›","Pantalla de guía — mis reservas y chats ›"),
 sel:T6("{m} · {n}","{m} · {n}","{m} · {n}","{m} · {n}","{m} · {n}","{m} · {n}"),
 ppl:T6("{n}명","{n} people","{n}名","{n}人","{n}人","{n} personas"),
 ppl1:T6("1명","1 person","1名","1人","1人","1 persona"),
 t:T6("가이드 인솔 자유여행","Travel with Guide","ガイド同行の自由旅行","向导陪同自由行","嚮導陪同自由行","Viaje con guía")   // 홈페이지 첫 화면 카드 이름과 같게 (pc.js w1t · 배치도)
};
var RGN=["","서울","부산","경주","제주"];   // 배치도 지역 4곳 + 전체(지역을 적지 않았거나 다른 곳 가이드도 보이게)
function rgName(r){ if(!r) return L6(TX.all); var n=N(); return window.LANG==="ko"||!n?r:n.region(r); }
function F(o,m){ var s=L6(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }

// ── 상태 ──
var ST={lang:"",langSet:false,rg:"",sort:"rv",tc:true,ign:false,ign2:false,rvAll:false,G:{},GT:{},RV:{}};
var CUR=null;   // 지금 그린 화면 {box, args}
function gLang(){ if(ST.langSet&&ST.lang) return ST.lang; var l=window.LANG; return LANGS().indexOf(l)>=0?l:"en"; }
function hub(){ return window.HUB||"https://brief-live-hub.emhwang3.workers.dev"; }
// 가이드 목록 — 앱과 같은 허브 주소(언어마다) · 한 번 받으면 2분 동안 그대로
function loadG(lang,force){ var t=ST.GT[lang]||0; if(!force&&ST.G[lang]&&Date.now()-t<120000) return; if(ST.G[lang]===null) return;
  var had=ST.G[lang]; ST.G[lang]=had||null;
  fetch(hub()+"/guide/guides?lang="+encodeURIComponent(lang),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){
    ST.G[lang]=(j&&j.ok&&Array.isArray(j.items))?j.items:"err"; ST.GT[lang]=Date.now(); redraw(); })
  .catch(function(){ if(!had) ST.G[lang]="err"; redraw(); }); }
function loadRv(gid){ if(ST.RV[gid]!==undefined) return; ST.RV[gid]=null;
  fetch(hub()+"/guide/reviews?guideId="+encodeURIComponent(gid),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){
    ST.RV[gid]=(j&&j.ok)?{items:j.items||[],avg:j.avg||0,count:j.count||0}:{items:[],avg:0,count:0}; rvUpd(gid); })
  .catch(function(){ ST.RV[gid]={items:[],avg:0,count:0}; rvUpd(gid); }); }
function rvUpd(gid){ var w=D.querySelector("#pcGd .pg-rvw"); if(w&&CUR&&CUR.args[0]===gid) w.innerHTML=rvHtml(gid); }   // 후기만 그 자리에서 (입력 중인 칸은 그대로)
function mine(){ return /^#\/guide(\/|$)/.test(location.hash||""); }
function redraw(){ if(!CUR||!mine()||!D.body.contains(CUR.box)) return; var y=window.scrollY; draw(CUR.box,CUR.args); if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y); }

// ── 공통 부품 ──
function tcard(){ var n=N();
  return '<section class="pg-tc'+(ST.tc?' on':'')+'"><div class="pg-tch" data-pg="tc"><h1>'+E(L6(TX.t))+'</h1>'+XT(ST.tc,'data-pg="tc"')+'</div>'
   +(ST.tc?'<div class="pg-tcb"><p>'+E(L6(n.desc))+'</p></div>':'')   /* 11-14 사장님 「투어 가이드 화면에서 저 노란 줄은 삭제해」 — 노란 「ⓘ 주의 사항」 상자 없앰 */+'</section>'; }
// ⓘ 주의 사항 — 처음엔 접힘, 누르면 앱 ⓘ 문구 전문 (규칙서 5장 11-08)
function ignBox(k){ var n=N(), on=ST[k];
  return '<div class="pg-ign'+(on?' on':'')+'"><div class="pg-ignh" data-pg="'+k+'"><span>'+E(L6(n.noteT))+'</span>'+XT(on,'data-pg="'+k+'"')+'</div>'+(on?'<div class="pg-ignb">'+E(n.note())+'</div>':'')+'</div>'; }
function chips(name,list,cur,lab,cols){ return '<div class="pg-chips" style="grid-template-columns:repeat('+cols+',minmax(0,1fr))">'+list.map(function(v){ return '<button type="button" data-'+name+'="'+E(v)+'" class="'+(v===cur?"on":"")+'">'+E(lab(v))+'</button>'; }).join("")+'</div>'; }
function meta(g){ var n=N(); return [(g.langs||[]).filter(function(l){ return (!window.svcOn||svcOn(l)); }).map(n.langName).join(" · "),g.years?n.years(g.years):"",g.region?n.region(g.region):""].filter(Boolean).map(E).join(" · "); }
function face(g,cls){ var u=N().photo(g); return u?'<img class="'+cls+'" src="'+E(u)+'" alt="" loading="lazy">':'<span class="'+cls+' pg-noph" aria-hidden="true">🧭</span>'; }

// ── 화면 ① 가이드 고르기 ──
function sorted(a){ a=a.slice(); if(ST.rg) a=a.filter(function(g){ var r=String(g.region||""); return r.indexOf(ST.rg)>=0||r.indexOf("전국")>=0; });
  if(ST.sort==="yr") a.sort(function(x,y){ return (+y.years||0)-(+x.years||0)||(+y.count||0)-(+x.count||0); });
  else a.sort(function(x,y){ return (+y.count||0)-(+x.count||0)||(+y.avg||0)-(+x.avg||0)||(+y.years||0)-(+x.years||0); });
  return a; }
function list(box){ var n=N(), lg=gLang(), G=ST.G[lg]; loadG(lg);
  var side='<aside class="pg-side"><h2>'+E(L6(TX.pick))+'</h2>'
   +'<div class="pg-fl"><div class="pg-flt">'+E(L6(TX.lang))+'</div>'+chips("gl",LANGS(),lg,function(v){ return n.langName(v); },3)+'</div>'
   +'<div class="pg-fl"><div class="pg-flt">'+E(L6(TX.rgn))+'</div>'+chips("rg",RGN,ST.rg,rgName,3)+'</div>'
   +'<div class="pg-fl"><div class="pg-flt">'+E(L6(TX.sort))+'</div>'+chips("so",["rv","yr"],ST.sort,function(v){ return L6(v==="rv"?TX.sRv:TX.sYr); },2)+'</div>'
   +'<div class="pg-fl pg-fee"><div class="pg-flt">'+E(L6(TX.fee))+'</div>'+(n.rateTbl?n.rateTbl():'')+'<p class="pg-x">'+E(L6(n.GBT.excl))+'</p></div>'   // 요금 안내 = 앱과 같은 표 (near.js gbRateTbl · 11-08 밤 사장님)
   +'<div class="pg-glk"><a href="#" data-pg="gedit"><img src="img/menu/mi_guideperson.png" alt="">'+E(L6(TX.gedit))+'</a><a href="#" data-pg="gme"><span aria-hidden="true">💬</span>'+E(L6(TX.gme))+'</a></div></aside>';
  var main='';
  if(G==null) main='<div class="pg-msg">'+E(L6(TX.load))+'</div>';
  else if(G==="err") main='<div class="pg-msg">'+E(L6(TX.err))+'</div>';
  else { var a=sorted(G);
    main=a.length?'<div class="pg-cnt">'+E(a.length===1?L6(TX.cnt1):F(TX.cnt,{n:a.length}))+'</div>':'';
    if(!G.length) main+='<div class="pg-msg">'+E(L6(TX.none))+'</div>';
    else if(!a.length) main+='<div class="pg-msg">'+E(L6(TX.noRg))+'</div>';
    else main+='<div class="pg-cards">'+a.map(function(g){ return '<div class="pg-gc" data-gid="'+E(g.id)+'" role="button" tabindex="0">'
      +'<div class="pg-gph">'+face(g,"pg-gim")+'</div><div class="pg-gbd">'
      +'<div class="pg-l1"><b>'+n.name(g)+'</b>'+n.badge(g)+'</div>'
      +'<div class="pg-l2">'+meta(g)+'</div>'
      +'<div class="pg-l3">'+E(g.intro||"")+'</div>'
      +'<div class="pg-cbr"><button type="button" class="pg-btn" data-gid="'+E(g.id)+'">'+E(L6(TX.req))+'</button></div></div></div>'; }).join("")+'</div>'; }
  box.innerHTML='<div id="pcGd" class="pg3">'+tcard()+'<div class="pg-g1">'+side+'<div class="pg-main">'+main+'</div></div></div>'; }

// ── 화면 ② 예약하기 ──
function findG(gid,lang){ var G=ST.G[lang]; if(!Array.isArray(G)) return null; for(var i=0;i<G.length;i++) if(G[i].id===gid) return G[i]; return null; }
function tms(){ var a=[]; for(var t=7*60;t<=18*60;t+=30) a.push(("0"+Math.floor(t/60)).slice(-2)+":"+("0"+t%60).slice(-2)); return a; }   // 앱 예약 칸과 같은 07:00~18:00, 30분 간격
function opts(a,b,cur,lab){ var s=""; for(var i=a;i<=b;i++) s+='<option value="'+i+'"'+(i===cur?" selected":"")+'>'+E(lab(i))+'</option>'; return s; }
function rvHtml(gid){ var n=N(), r=ST.RV[gid];
  var h='<div class="pg-rvh">'+E(L6(TX.rv))+'</div>';
  if(r==null) return h+'<div class="pg-sub">…</div>';
  if(!r.count&&!r.items.length) return h+'<div class="pg-sub">'+E(L6(TX.noRv))+'</div>';
  h+='<div class="pg-rvs"><span class="pg-stars">'+n.stars(r.avg)+'</span> <b>'+E(r.avg)+'</b> · '+E(F(TX.rvN,{n:r.count||r.items.length}))+'</div>';
  var it=ST.rvAll?r.items:r.items.slice(0,3);
  h+=it.map(function(x){ return '<div class="pg-rv"><div class="pg-rvm"><span class="pg-stars">'+n.stars(x.stars)+'</span> <b>'+E(x.name||L6(TX.anon))+'</b> <small>'+E(x.date||"")+'</small></div>'+(x.text?'<div class="pg-rvt">'+E(x.text)+'</div>':'')+'</div>'; }).join("");
  if(r.items.length>3) h+='<div class="pg-more" data-pg="rvall"><span>'+E(L6(TX.rvMore))+'</span>'+XT(ST.rvAll,'data-pg="rvall"')+'</div>';
  return h; }
function sumSel(k){ var n=N(); return F(TX.sel,{m:n.modeTxt(k),n:k.n===1?L6(TX.ppl1):F(TX.ppl,{n:k.n})}); }   // 오른쪽 요금 칸 맨 위 「하루 (8시간) · 2명」
function book(box,gid,lang){ var n=N();
  if(!ST.G[lang]||ST.G[lang]==="err"){ loadG(lang); box.innerHTML='<div id="pcGd" class="pg3"><div class="pg-msg">'+E(L6(ST.G[lang]==="err"?TX.err:TX.load))+'</div></div>'; return; }
  var g=findG(gid,lang);
  if(!g){ box.innerHTML='<div id="pcGd" class="pg3"><div class="pg-msg">'+E(L6(n.GBT.egd))+'</div><div class="pg-cbr" style="justify-content:flex-start"><button type="button" class="pg-btn" data-pg="back">'+E(L6(TX.other))+'</button></div></div>'; return; }
  var s=n.state(), same=s.gid===g.id&&s.bk;
  if(!(same&&D.getElementById("nrBox"))){ if(same) n.grab(); n.pick(g,lang); }   // 앱 확인 창이 떠 있으면 그 예약 그대로 (창 단계를 건드리지 않음)
  var k=n.state().bk; loadRv(g.id);
  var L=L6, T=n.GBT, mn=n.day(1), mx=n.day(365);
  var left='<aside class="pg-gl"><div class="pg-gbig">'+face(g,"pg-gbim")+'</div>'
   +'<div class="pg-l1 pg-big"><b>'+n.name(g)+'</b>'+n.badge(g)+'</div><div class="pg-l2">'+meta(g)+'</div>'+(g.intro?'<div class="pg-intro">'+E(g.intro)+'</div>':'')
   +'<div class="pg-rvw">'+rvHtml(g.id)+'</div>'
   +'<button type="button" class="pg-back" data-pg="back">'+E(L(TX.other))+'</button></aside>';
  var form='<section class="pg-form"><h2>'+E(L(TX.bk))+'</h2>'
   +'<label class="pg-lb">'+E(L(T.dur))+'</label><div class="pg-modes">'+["half","full","hours","days"].map(function(m){ return '<button type="button" data-gbm="'+m+'" class="'+(k.mode===m?"on":"")+'">'+E(L(T[m]))+'</button>'; }).join("")+'</div>'
   +(k.mode==="hours"?'<label class="pg-lb" for="gbH">'+E(L(T.hSel))+'</label><select class="pg-in pg-half" id="gbH">'+opts(n.GBK.hMin,n.GBK.hMax,k.h,function(i){ return n.F(T.hN,{n:i}); })+'</select>':'')
   +(k.mode==="days"?'<label class="pg-lb" for="gbD">'+E(L(T.dSel))+'</label><select class="pg-in pg-half" id="gbD">'+opts(n.GBK.dMin,n.GBK.dMax,k.d,function(i){ return n.F(T.dN,{n:i}); })+'</select>':'')
   +'<div class="pg-r3"><div><label class="pg-lb" for="gbDt">'+E(L(T.date))+'</label><input class="pg-in" type="date" id="gbDt" min="'+mn+'" max="'+mx+'" value="'+E(k.date)+'"></div>'
   +'<div><label class="pg-lb" for="gbTm">'+E(L(T.tm))+'</label><select class="pg-in" id="gbTm">'+tms().map(function(x){ return '<option'+(x===k.time?" selected":"")+'>'+x+'</option>'; }).join("")+'</select></div>'
   +'<div><label class="pg-lb" for="gbN">'+E(L(T.ppl))+'</label><select class="pg-in" id="gbN">'+opts(1,n.GBK.nMax,k.n,function(i){ return n.F(T.pN,{n:i}); })+'</select></div></div>'
   +'<label class="pg-lb" for="gbMemo">'+E(L(T.memo))+'</label><textarea class="pg-in" id="gbMemo" maxlength="500" rows="5" placeholder="'+E(L(T.memoPh))+'">'+E(k.memo)+'</textarea>'
   +'<h3>'+E(L(T.cu))+'</h3>'
   +'<div class="pg-r3 pg-rc"><div><label class="pg-lb" for="gbCn">'+E(L(T.cn))+'</label><input class="pg-in" id="gbCn" maxlength="40" autocomplete="name" value="'+E(k.cn)+'"></div>'
   +'<div><label class="pg-lb" for="gbCp">'+E(L(T.cp))+'</label><input class="pg-in" id="gbCp" type="tel" maxlength="30" autocomplete="tel" placeholder="'+E(L(T.cpPh))+'" value="'+E(k.cp)+'"></div>'
   +'<div><label class="pg-lb" for="gbCe">'+E(L(T.ce))+'</label><input class="pg-in" id="gbCe" type="email" maxlength="100" autocomplete="email" value="'+E(k.ce)+'"></div></div>'
   +'<div class="pg-nt">'+E(L(T.cpn))+'</div>'
   +'<div class="gberr pg-err" id="gbM">'+E(k.err||"")+'</div>'
   +'<div class="pg-conf">'+E(L(TX.conf))+'</div></section>';
  var right='<aside class="pg-sum"><div class="pg-sumin"><h3>'+E(L(T.fee))+'</h3><div class="pg-sumsel" id="pgSel">'+E(sumSel(k))+'</div>'
   +'<div class="pg-pb" id="gbPr">'+n.priceBox()+'</div>'
   +'<button type="button" class="pg-pay" data-pg="pay">'+E(L(n.payT))+'</button>'
   +'<div class="pg-x">'+E(L(T.excl))+'</div>'
   +'<div class="pg-rf">'+E(L(T.rf))+' <a href="refund.html?lang='+E(window.LANG||"en")+'" target="_blank" rel="noopener">'+E(L(T.rfL))+' ›</a></div>'
   +'</div></aside>';   /* 11-14 사장님 「투어 가이드 화면에서 저 노란 줄은 삭제해」 — 노란 「ⓘ 주의 사항」 상자 없앰 (예약 칸 쪽도) */
  box.innerHTML='<div id="pcGd" class="pg3 pg-bkp"><div class="pg-g2">'+left+form+right+'</div></div>'; }
function priceUpd(){ var n=N(); if(!n) return; n.grab(); var k=n.state().bk; if(!k) return; var p=D.getElementById("gbPr"); if(p) p.innerHTML=n.priceBox(); var s=D.getElementById("pgSel"); if(s) s.textContent=sumSel(k); }

function draw(box,args){ CUR={box:box,args:args||[]}; if(!N()){ box.innerHTML=""; return; } try{ N().css(); }catch(e){}
  if(args&&args[0]) book(box,args[0],args[1]||gLang()); else list(box); }
PCREG("guide",function(box,args){ ST.rvAll=false; ST.ign2=false; draw(box,args); });

// ── 누르기 ──
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest) return; var root=t.closest("#pcGd"); if(!root) return; var n=N(); if(!n) return;
  var c=t.closest("[data-pg],[data-gl],[data-rg],[data-so],[data-gid],[data-gbm]"); if(!c) return;
  var pg=c.getAttribute("data-pg");
  if(pg==="tc"){ ST.tc=!ST.tc; redraw(); return; }
  if(pg==="ign"||pg==="ign2"){ ST[pg]=!ST[pg]; var b=c.closest(".pg-ign"); if(b){ var w=D.createElement("div"); w.innerHTML=ignBox(pg); b.parentNode.replaceChild(w.firstChild,b); } return; }
  if(pg==="rvall"){ ST.rvAll=!ST.rvAll; if(CUR) rvUpd(CUR.args[0]); return; }
  if(pg==="back"){ try{ n.grab(); }catch(x){} PCGO("guide"); return; }
  if(pg==="gedit"){ e.preventDefault(); n.editAsk(); return; }
  if(pg==="gme"){ e.preventDefault(); if(window.CHAT) CHAT.guide(); return; }
  if(pg==="pay"){ if(n.send()){ var o=D.getElementById("nrBox"); if(o) o.classList.add("pcg"); } return; }
  if(c.hasAttribute("data-gl")){ ST.lang=c.getAttribute("data-gl"); ST.langSet=true; redraw(); return; }
  if(c.hasAttribute("data-rg")){ ST.rg=c.getAttribute("data-rg"); redraw(); return; }
  if(c.hasAttribute("data-so")){ ST.sort=c.getAttribute("data-so"); redraw(); return; }
  if(c.hasAttribute("data-gbm")){ n.grab(); var k=n.state().bk; if(k){ k.mode=c.getAttribute("data-gbm"); k.err=""; } redraw(); return; }
  if(c.hasAttribute("data-gid")){ var gid=c.getAttribute("data-gid"); try{ ntap("guide","gbk_open"); }catch(x){} PCGO("guide/"+encodeURIComponent(gid)+"/"+gLang()); return; }
});
D.addEventListener("keydown",function(e){ if(e.key!=="Enter"&&e.key!==" ") return; var c=e.target.closest&&e.target.closest("#pcGd .pg-gc"); if(!c||e.target!==c) return; e.preventDefault(); c.click(); });
D.addEventListener("change",function(e){ if(!e.target.closest||!e.target.closest("#pcGd")) return; if(/^gb(H|D|N|Dt|Tm)$/.test(e.target.id||"")) priceUpd(); });
// 앱 확인 창(#nrBox.pcg)의 「취소」·「‹ 뒤로」(신청서로) = 창만 닫고 이 PC 예약 칸으로 (앱 신청서를 창 안에 다시 그리지 않는다)
window.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest('#nrBox.pcg [data-igback="req"]'); if(!t) return; var n=N(); if(!n) return;
  e.preventDefault(); e.stopPropagation(); var s=n.state(); if(s.busy) return; s.view="req"; if(s.bk) s.bk.err=""; try{ NEAR.close(); }catch(x){} },true);
// 언어를 바꾸면 이 화면도 그 자리에서 다시 (위치 그대로)
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ if(mine()&&CUR&&CUR.args[0]){ try{ N().grab(); }catch(e){} } var r=_sl.apply(this,arguments); try{ redraw(); }catch(e){} return r; };
})();
