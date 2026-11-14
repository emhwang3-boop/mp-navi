/* MosaicTrip.com 홈페이지 — 긴급 화면 (11-08 4b단계 · 배치도 tour_site\wireframes\8_긴급_배치도)
 *  · 주소 #/sos (응급실 — 11-14 사장님 「응급실이 있는 병원만」) · #/sos/pharmacy (약국) · #/sos/police (112 칸 → 근처 경찰서·파출소, 맨 위 「112 전화」)
 *  · 맨 윗줄 「긴급」 + 병원·약국 탭 · 가운데 맨 위 큰 전화 셋 119(응급)·112(경찰, 사장님 11-08 「나」)·1330(관광통역안내 24시간)
 *    왼쪽 「어디 근처?」(편의시설과 같은 칸·같은 기준) · 가운데 2km 안 가까운 순 목록(곳마다 [지도] [전화]) · 오른쪽 그 동네 그림 지도 + 번호 핀
 *  · 이름을 누르면 화면 가운데 창으로 앱 장소 카드(전화·길찾기) · [지도] = 오른쪽 지도에서 그곳 핀
 *  · 자료는 앱 near.js 「긴급」 그대로(카카오 병원 HP8·약국 PM9, 2km → 모자라면 10km) — 부품은 home/pc_near.js(window.PCNEAR)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
function P(){ return window.PCNEAR; }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function T2(ko,en){ try{ return window.T?window.T(ko,en):(window.LANG==="ko"?ko:en); }catch(e){ return window.LANG==="ko"?ko:en; } }
var TX={
 sub:T6("다쳤거나 아플 때, 도난·분실 사고가 났을 때 — 바로 전화하고 가까운 응급실·약국·경찰서를 찾아요","Hurt, sick, or something stolen or lost? Call right away and find a nearby emergency room, pharmacy or police station","けがや病気、盗難・紛失のときは、すぐに電話して近くの救急外来・薬局・警察署を探しましょう","受伤、生病或遇到盗窃·遗失时，请立即拨打电话，并查找附近的急诊室、药店和警察局","受傷、生病或遇到竊盜·遺失時，請立即撥打電話，並查找附近的急診室、藥局和警察局","¿Herido, enfermo o te han robado o has perdido algo? Llama enseguida y busca urgencias, farmacias o comisarías cercanas"),   // 11-14 응급실·경찰서
 c119:T6("응급 — 구급·화재","Emergency — ambulance · fire","救急 — 救急車・火事","急救 — 救护车·火灾","急救 — 救護車·火災","Emergencias — ambulancia · incendios"),
 c112:T6("경찰 — 도난·분실·사건","Police — theft · loss · crime","警察 — 盗難・紛失・事件","警察 — 盗窃·遗失·案件","警察 — 竊盜·遺失·案件","Policía — robo · pérdida · delitos"),   // 앱 긴급 칸과 같은 말 (11-08)
 c1330:T6("관광통역안내 · 24시간","Travel helpline · 24 hours","観光通訳案内・24時間","旅游翻译咨询 · 24小时","旅遊翻譯諮詢 · 24小時","Asistencia turística · 24 horas"),
 rad:T6("찾는 거리 2km · 가까운 순","Search radius 2 km · nearest first","検索範囲 2km・近い順","搜索范围 2公里 · 由近到远","搜尋範圍 2公里 · 由近到遠","Radio de 2 km · más cercanos primero"),
 tel:T6("「전화」를 누르면 폰이나 PC의 전화 앱으로 걸어요.","“Call” opens the phone app on your phone or PC.","「電話」を押すと、スマホやパソコンの電話アプリでかけられます。","点击“拨打”，会用手机或电脑的电话应用拨打。","點擊「撥打」，會用手機或電腦的電話應用程式撥打。","«Llamar» abre la app de teléfono de tu móvil o PC."),
 hosp:T6("응급실","Emergency rooms","救急外来","急诊室","急診室","Urgencias"),   // 목록 제목 「명동역 근처 응급실」 — 11-14 사장님 「응급실이 있는 병원만」(앱 탭 「응급실」과 같은 말, 영어는 여럿)
 erTab:T6("응급실","Emergency room","救急外来","急诊室","急診室","Urgencias"),
 pol:T6("경찰서·파출소","Police stations","警察署・交番","警察局·派出所","警察局·派出所","Comisarías de policía"),   // 11-14 「112를 누르면 근처 파출소나 경찰서」
 call112:T6("112 전화","Call 112","112に電話","拨打112","撥打112","Llamar al 112"),
 pharm:T6("약국","Pharmacies","薬局","药店","藥局","Farmacias"),
 nameT:T6("이름을 누르면 전화·길찾기 카드가 열려요.","Click a name to open its card with phone and directions.","名前を押すと、電話・経路のカードが開きます。","点击名称可打开含电话·路线的卡片。","點擊名稱可打開含電話·路線的卡片。","Haz clic en un nombre para ver su ficha con teléfono y cómo llegar.")
};
var TABS=[["hospital","mi_emergency",function(){ return P().L6(TX.erTab); }],["pharmacy","mi_pharmacy",function(){ return T2("약국","Pharmacy"); }]];
function polI(){ var n=window.NEARPC, a=(n&&n.K&&n.K.em&&n.K.em.tabs)||[]; for(var i=0;i<a.length;i++) if(a[i].c==="POL") return i; return 2; }   // 앱 near.js 긴급 탭 가운데 경찰(숨은 탭)
function head(cur){ var p=P(), E=p.E;
  return '<header class="pn-hd"><h1>'+E(T2("긴급","Emergency"))+'</h1><p>'+E(p.L6(TX.sub))+'</p>'
   +'<nav class="pn-tabs t2">'+TABS.map(function(t){ return '<button type="button" data-pn="tab" data-t="'+t[0]+'" class="'+(t[0]===cur?"on":"")+'">'+p.ico(t[1])+'<span>'+E(t[2]())+'</span></button>'; }).join("")+'</nav></header>'; }
function calls(pol){ var p=P(), E=p.E, L6=p.L6, ph='<span class="sos-i">'+p.ico("mi_phone")+'</span>';
  return '<div class="sos-calls">'
   +'<a class="sos-c c119" href="tel:119">'+ph+'<span class="sos-t"><b>119</b><small>'+E(L6(TX.c119))+'</small></span></a>'
   +'<a class="sos-c c112'+(pol?' on':'')+'" data-pn="tab" data-t="police" role="button" tabindex="0">'+ph+'<span class="sos-t"><b>112</b><small>'+E(L6(TX.c112))+'</small></span></a>'   // 11-14 「나」 — 누르면 #/sos/police 근처 경찰서·파출소, 전화는 목록 맨 위 「112 전화」
   +'<a class="sos-c c1330" href="tel:+82-2-1330">'+ph+'<span class="sos-t"><b>1330</b><small>'+E(L6(TX.c1330))+'</small></span></a></div>'; }   // 1330 = 앱과 같은 번호(+82-2-1330 — 외국 유심도 걸림)
function cfg(tab){ var pol=tab==="police", t=tab==="pharmacy"?TABS[1]:TABS[0], ti=pol?polI():t===TABS[1]?1:0;
  return {id:"pcSos",route:"sos",em:1,k:"em",ti:ti,head:function(){ return head(pol?"police":t[0]); },top:function(){ return calls(pol); },
    main:pol?function(){ var p=P(), E=p.E; return '<a class="sos-112" href="tel:112"><span class="sos-i">'+p.ico("mi_phone")+'</span>'+E(p.L6(TX.call112))+'</a><div class="pn-lh"><h2 id="pnLt"></h2><div class="pn-ls" id="pnLs"></div></div><div id="pnList"></div>'; }:null,
    sideExtra:function(){ var p=P(), E=p.E, L6=p.L6; return '<div class="pn-nt"><b>'+E(L6(TX.rad))+'</b></div><div class="pn-nt">'+E(L6(TX.tel))+' '+E(L6(TX.nameT))+'</div>'; },
    kind:function(){ return P().L6(pol?TX.pol:ti?TX.pharm:TX.hosp); },ordName:function(){ return P().L6(P().TX.oNear2); },
    onBase:function(){ P().sidePaint(); P().listPaint(); }}; }
PCREG("sos",function(box,args){ var p=P(); if(!p){ box.innerHTML=""; return; } p.detClose(); p.frame(box,cfg(args&&args[0]));
  // 폰 폭: 목록이 「어디 근처?」 칸 아래라 112를 눌러도 안 보인다 → 「112 전화」 단추로 내려 준다 (11-14)
  if(args&&args[0]==="police"&&window.matchMedia&&matchMedia("(max-width:640px)").matches) setTimeout(function(){ var b=document.querySelector("#pcSos .sos-112"); if(b) try{ b.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){ b.scrollIntoView(); } },80); });
})();
