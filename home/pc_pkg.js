/* MosaicTrip.com 홈페이지 — 패키지여행 (11-08 3a단계 · 배치도 tour_site\wireframes\3_패키지여행_배치도)
 *  · 화면 ① 상품 목록   #/package        — 제목 카드(▼/ㅡ) · 분야 고르기(같은 크기 한 줄) · 상품 카드 4줄
 *  · 화면 ② 상품 한 개  #/package/<id>   — 상품마다 주소 · 왼쪽 사진·제목·설명(앱과 같은 차례) · 오른쪽 따라오는 예약 칸
 *  · 자료·글·상세 본문·요금·결제창은 앱 shop.js 그대로 (SHOP.pc — PC_HOME 일 때만 열림) · 결제한 뒤 가이드가 수락·거절 (투어앱 규칙서 6장)
 *  · 후기 = 앱 후기 띠(review.js rvSlot) 그대로 — 산 사람만 쓴다(허브가 거름)
 *  · 진행 순서 오른쪽 투어 노선도 = 앱 지도(#map)를 이 화면에 잠깐 옮겨 앱 노선도(b4RouteShow)를 보여 주고, 화면을 떠나면 첫 화면 자리로 되돌린다
 *  · 새 글은 6개 언어 — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document;
function X(){ return window.SHOP&&SHOP.pc||null; }
function N(){ return window.NEARIG||null; }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function XT(on,attrs){ return window.XTG?XTG.html(on,attrs):'<button type="button" '+(attrs||"")+'>'+(on?"—":"▼")+'</button>'; }
function F(o,n){ return L6(o).replace("{n}",n); }
var IGN=T6("ⓘ 주의 사항","ⓘ Please note","ⓘ ご注意","ⓘ 注意事项","ⓘ 注意事項","ⓘ Ten en cuenta");   // 앱 가이드 인솔 ⓘ 카드와 같은 이름
var TX={
 won:T6("{n}원~","₩{n}~","₩{n}~","₩{n}~","₩{n}~","₩{n}~"),   // 첫 화면 대표 상품 카드와 같은 모양
 nf:T6("이 상품을 찾을 수 없어요.","We couldn’t find this product.","この商品が見つかりません。","找不到该商品。","找不到該商品。","No encontramos este producto."),
 list:T6("패키지 전체 보기 ›","See all group tours ›","パッケージ一覧を見る ›","查看全部跟团游 ›","查看全部跟團遊 ›","Ver todos los tours en grupo ›"),
 load:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 rt:T6("투어 노선도","Tour route","ツアー路線図","游览路线图","遊覽路線圖","Ruta del tour"),
 perfP:T6("공연장을 고르면 첫 화면 지도에서 그 공연장과 지금 하는 공연을 보여 드려요.","Pick a theater to see it and its current shows on the map on our main page.","劇場を選ぶと、トップページの地図でその劇場と上演中の公演をお見せします。","选择剧场后，会在首页地图上显示该剧场和正在上演的演出。","選擇劇場後，會在首頁地圖上顯示該劇場和正在上演的演出。","Elige un teatro y te lo mostramos en el mapa de la página principal con sus funciones actuales.")
};

// ── 상태 ──
var PK={cat:"all",tc:true,ign:false,gopen:false,G:{},loaded:false};
var CUR=null;
function mine(){ return /^#\/package(\/|$)/.test(location.hash||""); }
function items(){ try{ return SHOP.items()||[]; }catch(e){ return []; } }
function prod(id){ var a=items(); for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
function hub(){ return window.HUB||"https://brief-live-hub.emhwang3.workers.dev"; }
function kst(add){ return new Date(Date.now()+9*36e5+(add||0)*864e5).toISOString().slice(0,10); }
function redraw(){ if(!CUR||!mine()||!D.body.contains(CUR.box)) return; var y=window.scrollY; draw(CUR.box,CUR.args); if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y); }
// 상품 목록은 허브(관리자 「상품 관리」)에서 — 앱과 같은 SHOP.load · 첫 화면(pc.js)이 이미 불렀으면 한 번 더 받아도 같은 값
function ensure(){ if(PK.loaded||PK.ld) return; PK.ld=1; try{ SHOP.load().then(function(){ PK.loaded=true; PK.ld=0; redraw(); },function(){ PK.loaded=true; PK.ld=0; redraw(); }); }catch(e){ PK.loaded=true; } }

// ── 공통 부품 ──
function tcard(){ var x=X(), T=x.TX;
  return '<section class="pg-tc'+(PK.tc?' on':'')+'"><div class="pg-tch" data-pk="tc"><h1>'+E(x.L(T.t))+'</h1>'+XT(PK.tc,'data-pk="tc"')+'</div>'
   +(PK.tc?'<div class="pg-tcb"><p>'+E(x.L(T.s))+'</p></div>':'')+'</section>'; }
function priceLine(p){ var x=X(), u=x.minUnit(p); if(!u) return x.isExt(p)?'<small>'+E(x.L(x.TX.pxt))+'</small>':'';
  var n=Number(u).toLocaleString("ko-KR"), per=E(x.L(x.perOf?x.perOf(p):x.TX.per)), v=E(F(TX.won,n));   // 차량 대절은 「차 1대」 (11-11)
  return window.LANG==="ko"?'<small>'+per+'</small><b>'+v+'</b>':'<b>'+v+'</b><small>'+per+'</small>'; }
function kindTxt(p){ var x=X(), k=x.kindOf(p), T=x.TX; if(x.kLab) return x.L(x.kLab(p)); return x.L(k==="tour"?T.kT:k==="class"?T.kC:T.kK); }   // 차량 대절 = 「기사 딸린 차」 (11-11)

// ── 화면 ① 상품 목록 ──
function card(p){ var x=X(), T=x.TX, img=x.psrc(p), meta=[x.catName(p.c),x.Lx(p.area)].filter(Boolean).join(" · "),
    inf=[x.Lx(p.dur),x.langTxt(p,3),kindTxt(p),x.isExt(p)?"":x.L(x.fcOf?x.fcOf(p):T.fc)].filter(Boolean).join(" · ");
  return '<button type="button" class="pk-c" data-p="'+E(p.id)+'"><div class="pk-cph">'+(img?'<img src="'+E(img)+'" alt="" loading="lazy">':'')
   +'<span class="pk-st'+(p.real?' on':'')+'">'+E(x.L(p.real?T.real:T.ex))+'</span></div>'
   +'<div class="pk-cb"><div class="pk-l1">'+E(meta)+'</div><div class="pk-l2">'+E(x.L(p.t))+'</div><div class="pk-l3">'+E(inf)+'</div>'
   +'<div class="pk-l4">'+priceLine(p)+'<span class="pk-rv">'+(window.rvMini?rvMini("shop:"+p.id):'')+'</span></div>'+(x.Lx(p.px)?'<div class="shpx">'+E(x.Lx(p.px))+'</div>':'')+'</div></button>'; }   // shpx = 가격 아래 「별도」 줄 (11-10)
function list(box){ var x=X(), PA=items(), L0=PA.filter(function(p){ return PK.cat==="all"||p.c===PK.cat; });
  var cats='<div class="pk-cats"><div class="pk-catg">'+x.CATS.map(function(c){ var n=c[0]==="all"?PA.length:PA.filter(function(p){ return p.c===c[0]; }).length;
      return '<button type="button" data-cat="'+c[0]+'" class="'+(PK.cat===c[0]?"on":"")+'">'+E(x.L(c[1]))+' '+n+'</button>'; }).join("")+'</div></div>';
  box.innerHTML='<div id="pcPk" class="pg3">'+tcard()+cats+(PA.length?'<div class="pk-cards">'+L0.map(card).join("")+'</div>':'<div class="pg-msg">'+E(L6(TX.load))+'</div>')+'</div>';
  try{ if(window.rvMiniLoad) rvMiniLoad(L0.map(function(p){ return "shop:"+p.id; })); }catch(e){} }

// ── 화면 ② 상품 한 개 ──
function guideRow(p){ var x=X(), S=x.S, T=x.TX, n=N(), gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0];
  var h='<div class="pk-row pk-gdr" data-pk="gd"><span class="pk-lb">'+E(x.L(T.gd))+'</span><b>'+E(gg?x.gName(gg):x.L(T.none))+'</b>'+XT(PK.gopen,'data-pk="gd"')+'</div>';
  if(!PK.gopen) return h;
  h+='<div class="pk-gdp"><p class="pk-nt">'+E(x.L(T.gl))+'</p><div class="pg-chips" style="grid-template-columns:repeat(3,minmax(0,1fr))">'+["ko","en","ja","zhs","zht","es"].filter(function(l){ return (!window.svcOn||svcOn(l)); }).map(function(l){ return '<button type="button" data-pkgl="'+l+'" class="'+(S.glang===l?"on":"")+'">'+E(x.LGN[l])+'</button>'; }).join("")+'</div>';
  if(S.glang){ if(S.guides===null) h+='<p class="pk-nt">'+E(x.L(T.gld))+'</p>'; else if(!(S.guides||[]).length) h+='<p class="pk-nt">'+E(x.L(T.gn))+'</p>';
    else h+='<div class="pk-gl">'+S.guides.map(function(g){ var u=n&&n.photo(g); return '<button type="button" class="pk-g'+(S.gid===g.id?' on':'')+'" data-pkg="'+E(g.id)+'">'+(u?'<img src="'+E(u)+'" alt="">':'<span class="pk-gav">'+E(x.gName(g).slice(0,1))+'</span>')
      +'<span><b>'+E(x.gName(g))+'</b><small>'+E((g.langs||[]).filter(function(l){ return (!window.svcOn||svcOn(l)); }).map(function(l){ return x.LGN[l]||l; }).join(" · ")+(g.years&&n?" · "+n.years(g.years):""))+'</small></span></button>'; }).join("")+'</div>'; }
  return h+'</div>'; }
function ignBox(p){ var x=X(), t=[x.L(x.noteOf(p))]; if(p.mp) t.push(F(x.TX.mpn,p.mp));
  return '<div class="pg-ign'+(PK.ign?' on':'')+'"><div class="pg-ignh" data-pk="ign"><span>'+E(L6((N()&&N().noteT)||IGN))+'</span>'+XT(PK.ign,'data-pk="ign"')+'</div>'+(PK.ign?'<div class="pg-ignb">'+t.map(E).join("<br>")+'</div>':'')+'</div>'; }
function boxHtml(p){ var x=X(), S=x.S, T=x.TX, L=x.L, K=x.kindOf(p);
  var h='<div class="pk-pr">'+x.priceHtml(p)+'</div>';
  if(p.real==="perf"){ var pf=(N()&&N().perf)||[];   // 공연 관람 — 앱 「공연관람」 목록(공연장)과 같은 길: 고르면 첫 화면 지도에 그 공연장 카드(KOPIS 공연)
    return h+'<div class="pk-pfh">'+E(L(T.perf))+'</div><p class="pk-nt">'+E(L6(TX.perfP))+'</p><div class="pk-pf">'+pf.map(function(v){ return '<button type="button" data-pkperf="'+E(v[0])+'"><span>'+E(L6(v[1]))+'</span><i>›</i></button>'; }).join("")+'</div><p class="pk-nt">'+E(L(T.tkn))+'</p>'; }
  if(p.hub&&p.link) return h+'<a class="pg-pay" href="'+E(p.link)+'" target="_blank" rel="noopener">'+E(L(T.tk))+' ›</a><p class="pk-nt">'+E(L(T.tkn))+'</p>';   // 바깥 예매처
  if(p.hub&&!p.real) return h+'<p class="pk-nt">'+E(L(T.soon))+'</p>';   // 관리자 상품 「준비 중」 — 주문 안 받음 (앱과 같음)
  if(x.isChr&&x.isChr(p)){   // 차량 대절 (11-11, charter.js) — 날짜(3일 뒤부터)·시작 시각·인원(1~7) + 큰 짐·픽업·목적지(끌어 순서)·기사 언어·요청 사항·구간 가격 · 합계 = 구간 가격
    return h+'<div class="pk-row"><label class="pk-lb" for="pkDt">'+E(L(T.date))+'</label><input class="pg-in" type="date" id="pkDt" min="'+E(CHR.minDate())+'" value="'+E(S.date)+'"></div>'
     +'<div class="pk-row"><label class="pk-lb" for="pkTm">'+E(CHR.tx("tm"))+'<br><small>'+E(CHR.tx("tmn"))+'</small></label><input class="pg-in" type="time" id="pkTm" step="1800" value="'+E(S.time)+'"></div>'
     +'<div class="pk-row"><span class="pk-lb">'+E(L(T.ppl))+'</span><div class="pk-stp"><button type="button" data-pkn="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-pkn="1" aria-label="+">+</button></div></div>'
     +CHR.pickHtml(p)+'<div class="pk-tot"><span>'+E(L(T.tot))+'</span><b>'+x.totTx(p)+'</b></div>'+x.pxHtml(p)
     +'<button type="button" class="pg-pay" data-pk="pay"'+(CHR.ok()?'':' disabled')+'>'+E(L(T.pay))+'</button>'
     +'<div class="pg-rf"><a href="refund.html?lang='+E(window.LANG||"en")+'" target="_blank" rel="noopener">'+E(L(T.rfL))+' ›</a></div>'+ignBox(p); }
  if(K==="tour"&&p.mp) h+='<div class="pk-mp">'+E(F(T.mp,p.mp))+'</div>';
  var dl=x.dayLine(p); if(dl||(p.hub&&p.max<20)) h+='<div class="pk-ft">'+dl+(p.hub&&p.max<20?'<span>'+E(F(T.mx,p.max))+'</span>':'')+'</div>';
  var tsel=p.hub&&!p.free&&p.times&&p.times.length;
  h+='<div class="pk-row"><label class="pk-lb" for="pkDt">'+E(L(T.date))+'</label><input class="pg-in" type="date" id="pkDt" min="'+kst(0)+'" value="'+E(S.date)+'"></div>'
   +'<div class="pk-row"><label class="pk-lb" for="pkTm">'+E(L(T.tm))+'</label>'+(tsel?'<select class="pg-in" id="pkTm">'+p.times.map(function(t){ return '<option'+(t===S.time?' selected':'')+'>'+E(t)+'</option>'; }).join("")+'</select>':'<input class="pg-in" type="time" id="pkTm" step="1800" value="'+E(S.time)+'">')+'</div>'
   +'<div class="pk-row"><span class="pk-lb">'+E(L(T.ppl))+'</span><div class="pk-stp"><button type="button" data-pkn="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-pkn="1" aria-label="+">+</button></div></div>'
   +(K==="tour"?guideRow(p):'')
   +(window.SMN?SMN.pickHtml(p,x.unitOf(p,S.n)*S.n):'')+(window.HSP?HSP.pickHtml(p):'')+'<div class="pk-tot"><span>'+E(L(T.tot))+'</span><b>'+x.won(x.unitOf(p,S.n)*S.n+(window.SMN?SMN.appSum(p):0))+'</b></div>'   // 가게 메뉴 고르기·합계 (11-10)
   +'<button type="button" class="pg-pay" data-pk="pay"'+(window.HSP&&!HSP.ok(p)?' disabled':'')+'>'+E(L(T.pay))+'</button>'
   +'<div class="pg-rf"><a href="refund.html?lang='+E(window.LANG||"en")+'" target="_blank" rel="noopener">'+E(L(T.rfL))+' ›</a></div>'
   +ignBox(p);
  return h; }
function boxUpd(){ var p=CUR&&prod(CUR.args[0]), b=D.querySelector("#pcPk .pk-box"); if(p&&b) b.innerHTML=boxHtml(p); }
function det(box,id){ var x=X(), p=prod(id), S=x.S, T=x.TX;
  if(!p){ box.innerHTML='<div id="pcPk" class="pg3"><div class="pg-msg">'+E(L6(PK.loaded?TX.nf:TX.load))+'</div>'+(PK.loaded?'<div class="pg-cbr" style="justify-content:flex-start"><button type="button" class="pg-btn" data-pk="list">'+E(L6(TX.list))+'</button></div>':'')+'</div>'; return; }
  // 앱 상세 화면을 열 때와 같은 기본값 (shop.js open·openDet)
  if(!S.time) S.time="09:00"; if(!S.date) S.date=kst(3);
  if(p.hub){ if(!p.free&&p.times.length&&p.times.indexOf(S.time)<0) S.time=p.times[0]; if(S.n>p.max) S.n=p.max; }
  if(CUR.pid!==id){ S.gi=0; CUR.pid=id; }
  // 앱 상세 본문(detBody) 그대로 — 사진 · 제목 칸 · 설명 칸으로 나눠 담는다
  var tmp=D.createElement("div"); tmp.innerHTML=x.detBody(p);
  var ph=D.createElement("section"), ti=D.createElement("section"), de=D.createElement("section");
  ph.className="pk-photo"; ti.className="pk-title"; de.className="pk-desc";
  [].slice.call(tmp.children).forEach(function(el){
    if(el.matches(".sdph,.sdth")) ph.appendChild(el);
    else if(el.matches("section.shbx,.rvhost")) de.appendChild(el);
    else if(el.matches(".smeta,h1.sdh,.rvmini,.skey")) ti.appendChild(el); });   // 가격·최소 출발 인원·결제 안내는 오른쪽 예약 칸에
  var rv=de.querySelector(".rvhost"); if(rv) de.appendChild(rv);   // 후기는 맨 아래 (배치도)
  var g=ph.querySelector("#shopGal"); if(g){ g.id="pkGal"; var nimg=g.children.length;
    if(nimg>1) ph.querySelector(".sdph").insertAdjacentHTML("beforeend",'<button type="button" class="pk-arr pk-pv" data-pk="pv" aria-label="‹">◀</button><button type="button" class="pk-arr pk-nx" data-pk="nx" aria-label="›">▶</button>'); }
  // 진행 순서 (코스) — 오른쪽에 투어 노선도 지도 (배치도)
  var ol=de.querySelector("ol.sstps:not(.sday)"), rtSlot=null;
  if(ol&&p.rt){ var sec=ol.parentNode, rb=sec.querySelector(".srt"); var wrap=D.createElement("div"); wrap.className="pk-rt";
    sec.insertBefore(wrap,ol); var lt=D.createElement("div"); lt.className="pk-rtl"; lt.appendChild(ol); if(rb&&rb.parentNode) lt.appendChild(rb.parentNode); wrap.appendChild(lt);
    rtSlot=D.createElement("div"); rtSlot.className="pk-route"; rtSlot.id="pkRoute"; rtSlot.innerHTML='<div class="pk-rblock" aria-hidden="true"></div><span class="pk-rtt">'+E(L6(TX.rt))+'</span>'; wrap.appendChild(rtSlot); }
  box.innerHTML='<div id="pcPk" class="pg3 pk-detp"><button type="button" class="pg-back" data-pk="list">← '+E(x.L(T.bk))+'</button>'
   +'<div class="pk-g2"><div class="pk-main"></div><aside class="pk-side"><div class="pk-box">'+boxHtml(p)+'</div></aside></div></div>';
  var mn=box.querySelector(".pk-main"); mn.appendChild(ph); mn.appendChild(ti); mn.appendChild(de);
  if(rtSlot) routeIn(rtSlot);
  try{ if(window.rvMiniLoad) rvMiniLoad(["shop:"+p.id]); }catch(e){}
  try{ if(window.rvLoad&&CUR.rv!==p.id){ CUR.rv=p.id; rvLoad("shop:"+p.id); } else if(window.rvPaint) rvPaint("shop:"+p.id); }catch(e){}
  galSync(); }
function galSync(){ var g=D.getElementById("pkGal"), S=X().S; if(!g) return; var n=g.children.length; if(S.gi) g.scrollLeft=S.gi*g.clientWidth; galMark();
  g.addEventListener("scroll",function(){ var i=Math.round(g.scrollLeft/Math.max(1,g.clientWidth)); if(i===S.gi) return; S.gi=Math.max(0,Math.min(n-1,i)); galMark(); },{passive:true}); }
function galMark(){ var g=D.getElementById("pkGal"), S=X().S; if(!g) return; var c=D.querySelector("#pcPk .sgn"); if(c) c.textContent=(S.gi+1)+" / "+g.children.length;
  [].forEach.call(D.querySelectorAll("#pcPk .sdth button"),function(b,i){ b.classList.toggle("on",i===S.gi); });
  var pv=D.querySelector("#pcPk .pk-pv"), nx=D.querySelector("#pcPk .pk-nx"); if(pv) pv.disabled=S.gi<=0; if(nx) nx.disabled=S.gi>=g.children.length-1; }
function galGo(i){ var g=D.getElementById("pkGal"), S=X().S; if(!g) return; S.gi=Math.max(0,Math.min(g.children.length-1,i)); g.scrollTo({left:S.gi*g.clientWidth,behavior:"smooth"}); galMark(); }

// ── 투어 노선도 — 앱 지도(#map)를 잠깐 이 칸으로 (떠날 때 첫 화면 자리로 되돌림) ──
var MAPEL=null, MAPV=null, PEND=null, RTT=0, MAPKEY="";
function routeOk(){ return !!(window.CITY&&CITY.b4route&&CITY.b4route.geo&&window.b4RouteShow); }
function routeIn(slot,tries){ var m=MAPEL||D.getElementById("map"); if(!m) return;
  if(!routeOk()){ clearTimeout(RTT); if((tries||0)<25) RTT=setTimeout(function(){ if(D.body.contains(slot)) routeIn(slot,(tries||0)+1); },300); return; }   // 앱 지도 자료가 아직이면 잠깐 기다림
  if(MAPV==null) MAPV=PEND!=null?PEND:(window.VIEW||"kr"); PEND=null; MAPEL=m; MAPKEY=location.hash;
  slot.insertBefore(m,slot.firstChild); slot.classList.add("on");
  var show=function(){ if(!D.body.contains(slot)||m.parentNode!==slot) return; try{ zResize(true); }catch(e){} try{ b4RouteShow(); clearTimeout(window._scT); }catch(e){} };   // 앱 노선도 · 지도 쪽으로 화면을 끌고 가는 것만 끈다
  requestAnimationFrame(show); setTimeout(function(){ if(window.VIEW!=="b4route") show(); },1500); }
function mapBack(){ var m=MAPEL; if(!m) return; clearTimeout(RTT); var home=D.getElementById("phMapBox"); if(home&&m.parentNode!==home) home.appendChild(m);
  MAPEL=null; PEND=MAPV; MAPV=null; try{ b4Clear(); }catch(e){} fixHome(); }
function fixHome(){ if(PEND==null||D.body.classList.contains("pcpg")) return; var v=PEND; PEND=null;   // 첫 화면이 보일 때 보던 지도로 (가려진 채 크기를 재면 지도가 어긋난다)
  setTimeout(function(){ try{ if(window.VIEW==="b4route") viewSet(v&&v!=="b4route"?v:"kr"); else zResize(true); }catch(e){} },30); }
// 화면이 바뀌기 전에 지도를 먼저 되돌린다 — 주소(#)가 바뀌면 popstate 가 길잡이(hashchange)보다 먼저 온다 · PCGO · PCRENDER
//   (window 의 hashchange 는 잡기 단계로 걸어도 길잡이 뒤에 불려서 popstate 로 · 못 받았을 때를 위해 hashchange 에도 한 번 더)
function away(){ if(MAPEL&&location.hash!==MAPKEY) mapBack(); }
window.addEventListener("popstate",away,true);
window.addEventListener("hashchange",function(){ away(); fixHome(); });
(function(){ var g=window.PCGO, r=window.PCRENDER;
  if(g) window.PCGO=function(){ mapBack(); var o=g.apply(this,arguments); fixHome(); return o; };
  if(r) window.PCRENDER=function(){ mapBack(); return r.apply(this,arguments); }; })();

function draw(box,args){ if(!X()){ box.innerHTML=""; return; } mapBack(); var keep=CUR&&CUR.box===box?CUR:{}; CUR={box:box,args:args||[],pid:keep.pid,rv:keep.rv}; ensure();
  if(CUR.args[0]) det(box,CUR.args[0]); else list(box); }
PCREG("package",function(box,args){ PK.ign=false; PK.gopen=false; draw(box,args); });

// ── 누르기 ──
function cpFb(v){ try{ var ta=D.createElement("textarea"); ta.value=v; ta.style.cssText="position:fixed;left:-9999px"; D.body.appendChild(ta); ta.select(); D.execCommand("copy"); ta.remove(); }catch(e){} }
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest) return; var root=t.closest("#pcPk"); if(!root||t.closest(".spm")) return; var x=X(); if(!x) return; var S=x.S;
  var c=t.closest("[data-pk],[data-cat],[data-p],[data-pkn],[data-pkgl],[data-pkg],[data-pkperf],[data-gi],[data-s]"); if(!c) return;
  var k=c.getAttribute("data-pk");
  if(k==="tc"){ PK.tc=!PK.tc; redraw(); return; }
  if(k==="ign"){ PK.ign=!PK.ign; boxUpd(); return; }
  if(k==="gd"){ PK.gopen=!PK.gopen; boxUpd(); return; }
  if(k==="list"){ PCGO("package"); return; }
  if(k==="pv"||k==="nx"){ galGo(S.gi+(k==="nx"?1:-1)); return; }
  if(k==="pay"){ var p=prod(CUR&&CUR.args[0]); if(p) x.pay(root,p.id); return; }
  if(c.hasAttribute("data-cat")){ PK.cat=c.getAttribute("data-cat"); redraw(); return; }
  if(c.hasAttribute("data-p")){ try{ ntap("shop","p_"+c.getAttribute("data-p")); }catch(z){} PCGO("package/"+encodeURIComponent(c.getAttribute("data-p"))); return; }
  if(c.hasAttribute("data-pkn")){ var pm=prod(CUR.args[0]); S.n=Math.max(1,Math.min(x.nMax?x.nMax(pm):(pm&&pm.hub?pm.max:20),S.n+(+c.getAttribute("data-pkn")))); boxUpd(); return; }
  if(c.hasAttribute("data-pkgl")){ var l=c.getAttribute("data-pkgl"); S.glang=l; S.gid=null; S.guides=null; boxUpd();   // 가이드 목록 — 앱과 같은 허브 주소
    fetch(hub()+"/guide/guides?lang="+encodeURIComponent(l),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(S.glang!==l) return; S.guides=(j&&j.ok&&j.items)||[]; boxUpd(); }).catch(function(){ if(S.glang===l){ S.guides=[]; boxUpd(); } }); return; }
  if(c.hasAttribute("data-pkg")){ S.gid=c.getAttribute("data-pkg"); boxUpd(); return; }
  if(c.hasAttribute("data-pkperf")){ var v=c.getAttribute("data-pkperf"), n=N(); PCGO(""); setTimeout(function(){ try{ if(n) n.tgPick(v); }catch(z){} },150); return; }
  if(c.hasAttribute("data-gi")){ galGo(+c.getAttribute("data-gi")); return; }
  var s=c.getAttribute("data-s");
  if(s==="cpy"){ var val=c.getAttribute("data-v")||"", ok=function(){ c.textContent=x.L(x.TX.cpd); setTimeout(function(){ c.textContent=x.L(x.TX.cpy); },1600); };   // 택시 카드 주소 복사 (앱과 같음)
    try{ navigator.clipboard.writeText(val).then(ok,function(){ cpFb(val); ok(); }); }catch(z){ cpFb(val); ok(); } return; }
  if(s==="b4map"){ e.preventDefault(); var r=D.getElementById("pkRoute"); if(r&&r.classList.contains("on")){ try{ r.scrollIntoView({behavior:"smooth",block:"center"}); }catch(z){} return; }
    PCGO(""); setTimeout(function(){ try{ b4RouteShow(); }catch(z){} },150); return; }   // 노선도를 이 칸에 못 띄웠을 때 — 앱처럼 첫 화면 지도에서
});
D.addEventListener("change",function(e){ var t=e.target; if(!t||!t.closest||!t.closest("#pcPk")) return; var x=X(); if(!x) return;
  if(t.id==="pkDt") x.S.date=t.value; if(t.id==="pkTm") x.S.time=t.value; });
D.addEventListener("smnchg",function(){ try{ boxUpd(); }catch(e){} });   // 가게 메뉴 고르기 (11-10, smenu.js)
D.addEventListener("hspchg",function(){ try{ boxUpd(); }catch(e){} });   // 건강검진 병원 고르기 (11-10, hosp.js)
D.addEventListener("chrchg",function(){ try{ boxUpd(); }catch(e){} });   // 차량 대절 칸 (11-11, charter.js)
// 언어를 바꾸면 이 화면도 그 자리에서 다시
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ redraw(); }catch(e){} return r; };
})();
