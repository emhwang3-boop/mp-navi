/* MosaicTrip 홈페이지 — 「회사 소개」·「문의」 창 (11-08 4b단계 · 배치도 tour_site\wireframes\9_회사소개_팝업_배치도 · 10_문의_팝업_배치도)
 *  · 따로 화면 없이 아랫줄 메뉴에서 화면 가운데 창(폭 700) — 사장님 11-08 (하나투어·노랑풍선처럼 별도 페이지 아님)
 *  · 회사 소개 = 한 줄 소개 · 세 가지 여행 방법 · 사업자 정보(앱 맨 아래 줄과 같은 내용) · [닫기] [문의하기 ›]
 *    여행업 등록번호·통신판매업 신고번호는 등록·신고 뒤 아래 NO 에 채운다 (그 전엔 앱 맨 아래 줄처럼 빈칸)
 *  · 문의 = 탭 셋(같은 크기): 손님 문의(「내 예약」 대화방 + 이메일·고객센터 전화) · 제휴 문의 · 가이드 등록
 *    제휴 문의·가이드 등록 = 앱 창(index.html inqOpen · near.js GUIDEREG)을 이 창 탭 안에 그대로 — 확인·보내기 모두 앱 그대로, 새 서버 기능 없음
 *  · 여행사 이름은 앱 AGN 하나에서 (바뀌면 여기도 저절로)
 *  · window.PCINFO = {about(), contact(탭)} · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME) return;
var D=document, H=D.documentElement;
function LG(){ return window.LANG||"ko"; }
function L6(o){ return o?(typeof o==="string"?o:(o[LG()]||o.en||o.ko||"")):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function T2(ko,en){ try{ return window.T?window.T(ko,en):(LG()==="ko"?ko:en); }catch(e){ return LG()==="ko"?ko:en; } }
function AGN(){ var a=window.AGN||T6("모자이크트립","MosaicTrip","MosaicTrip","MosaicTrip","MosaicTrip","MosaicTrip"); return L6(a); }

// 등록·신고 번호 — 나오면 여기만 채운다 (사장님 11-08 「여행업·통신판매업 번호는 등록 후 채움」)
var NO={travel:"",mail:""};
var MAIL="admin@moneypuzzle.co.kr", TEL="010-4221-7066", TELI="+82-10-4221-7066";   // 앱 맨 아래 줄과 같음
var ADDR_EN="220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Rm 707 C64 (M Tower), Korea";

var TX={
 about:T6("회사 소개","About us","会社案内","关于我们","關於我們","Sobre nosotros"),   // pc.js 아랫줄 메뉴와 같은 말
 contact:T6("문의","Contact","お問い合わせ","联系我们","聯絡我們","Contacto"),
 close:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 ask:T6("문의하기 ›","Contact us ›","お問い合わせ ›","联系我们 ›","聯絡我們 ›","Contáctanos ›"),
 lead:T6(" — 한국 여행, <em>일정부터 가이드까지</em> 한 곳에서"," — Korea travel, <em>from your plan to your guide</em>, all in one place"," — 韓国旅行、<em>日程づくりからガイドまで</em>ひとつの場所で"," — 韩国旅行，<em>从行程到向导</em>，一站搞定"," — 韓國旅行，<em>從行程到嚮導</em>，一站搞定",": viaja por Corea <em>del plan al guía</em>, todo en un solo lugar"),   // 첫 화면 한 줄 소개(pc.js h1)와 같은 말
 body:T6("외국인 여행객이 가고 싶은 곳을 고르면 AI가 일정을 짜고, 필요하면 현지 가이드가 함께 다니며 안내해 드립니다. 그림 지도로 둘러보고, 숙소·선물·편의시설·긴급 연락처까지 한 화면에서 찾을 수 있습니다.",
   "Choose the places you want to visit and AI plans your trip. If you like, a local guide comes along to show you around. Explore our illustrated map and find lodging, gifts, convenience services and emergency contacts on one screen.",
   "行きたい場所を選ぶとAIが日程を組み、必要なら現地ガイドが同行してご案内します。イラストマップで見て回り、宿・お土産・生活施設・緊急連絡先までひとつの画面で探せます。",
   "选好想去的地方，AI 就会为您安排行程；如有需要，当地向导还会全程陪同讲解。用手绘地图浏览，住处、礼物、便利设施和紧急联系方式都能在同一个页面找到。",
   "選好想去的地方，AI 就會為您安排行程；如有需要，當地嚮導還會全程陪同導覽。用手繪地圖瀏覽，住處、禮物、生活機能和緊急聯絡方式都能在同一個頁面找到。",
   "Elige los lugares que quieres visitar y la IA arma tu plan. Si quieres, un guía local te acompaña. Explora nuestro mapa ilustrado y encuentra alojamiento, regalos, servicios y contactos de emergencia en una sola pantalla."),
 w1:T6("가이드 인솔 자유여행","Travel with Guide","ガイド同行の自由旅行","向导陪同自由行","嚮導陪同自由行","Viaje con guía"),   // 첫 화면 세 가지 여행 방법 카드와 같은 이름
 w2:T6("패키지여행","Group Tour","パッケージツアー","跟团游","跟團遊","Tour en grupo"),
 w3:T6("AI와 자유여행","DIY Trip","DIY旅行","自助游","自助旅行","Viaje a tu aire"),
 rCo:T6("상호","Company","商号","公司名称","公司名稱","Empresa"),
 rCeo:T6("대표","CEO","代表","代表","代表","Representante"),
 rBiz:T6("사업자등록번호","Business Reg. No.","事業者登録番号","营业执照号","營業執照號","N.º de registro mercantil"),
 rTr:T6("여행업 등록번호","Travel Agency Reg. No.","旅行業登録番号","旅行社登记号","旅行社登記號","N.º de registro de agencia de viajes"),
 rMail:T6("통신판매업 신고번호","Mail-order Sales Reg. No.","通信販売業申告番号","通信销售业申告号","通信銷售業申告號","N.º de venta a distancia"),
 rLbs:T6("위치기반서비스사업 신고","Location-Based Service Reg. No.","位置情報サービス事業申告","位置服务业务申报号","位置服務業務申報號","N.º de servicio de localización"),
 rAddr:T6("주소","Address","住所","地址","地址","Dirección"),
 rCs:T6("고객센터 · 이메일","Support · Email","カスタマーセンター・メール","客服 · 邮箱","客服 · 電郵","Atención · Correo"),
 co:T6("주식회사 부만 (Booman Inc.) · 서비스 이름 {b}","Booman Inc. · Service name: {b}","株式会社 富滿（Booman Inc.）・サービス名 {b}","Booman Inc.（株式会社 富滿）· 服务名称 {b}","Booman Inc.（株式會社 富滿）· 服務名稱 {b}","Booman Inc. · Nombre del servicio: {b}"),   // 회사 이름 = 앱 맨 아래 줄과 같은 표기
 ceo:T6("전현진","Jeon Hyeonjin","全賢珍（Jeon Hyeonjin）","Jeon Hyeonjin","Jeon Hyeonjin","Jeon Hyeonjin"),
 lbs:T6("제1866호","No. 1866","第1866号","第1866号","第1866號","N.º 1866"),
 // 문의
 tCust:T6("손님 문의","Traveler help","お客様のお問い合わせ","旅客咨询","旅客諮詢","Ayuda al viajero"),
 tGuide:T6("가이드 등록","Register as a guide","ガイド登録","导游登记","導遊登記","Registro de guías"),   // 앱 「관광 가이드 등록」 창 이름과 같은 말(일·중)
 c1T:T6("예약한 여행·가이드에 대해","About your booked trip or guide","予約した旅行・ガイドについて","关于已预约的行程·向导","關於已預約的行程·嚮導","Sobre tu viaje o guía reservado"),
 c1P:T6("「내 예약」에서 그 예약의 대화방으로 바로 물어보세요 (가이드·우리 직원이 답해요)","Ask right in that booking's chat under “My bookings” (your guide or our staff will reply)","「予約確認」からその予約のチャットで直接お尋ねください（ガイドまたは当社スタッフがお答えします）","请在“我的预约”中通过该预约的聊天室直接提问（向导或我们的工作人员会回复）","請在「我的預約」中透過該預約的聊天室直接提問（嚮導或我們的工作人員會回覆）","Pregunta directamente en el chat de esa reserva en «Mis reservas» (te responderá tu guía o nuestro equipo)"),
 bk:T6("내 예약 ›","My bookings ›","予約確認 ›","我的预约 ›","我的預約 ›","Mis reservas ›"),   // pc.js 머리줄 「내 예약」과 같은 말
 c2T:T6("그 밖의 문의 (여행 상담·환불·사이트 사용)","Other questions (trip advice, refunds, using the site)","その他のお問い合わせ（旅行相談・返金・サイトの使い方）","其他咨询（旅行咨询·退款·网站使用）","其他諮詢（旅行諮詢·退款·網站使用）","Otras consultas (consejos de viaje, reembolsos, uso del sitio)"),
 em:T6("이메일","Email","メール","邮箱","電郵","Correo"),
 cs:T6("고객센터","Support","カスタマーセンター","客服","客服","Atención al cliente"),
 mailB:T6("메일 쓰기","Write email","メールを書く","写邮件","寫郵件","Escribir correo"),
 callB:T6("전화","Call","電話","拨打","撥打","Llamar"),
 noForm:T6("잠시 뒤 다시 열어 주세요.","Please open this again in a moment.","しばらくしてからもう一度開いてください。","请稍后再打开。","請稍後再打開。","Vuelve a abrirlo en un momento.")
};

// ── 창 ──
var POP=null;   // {kind:"about"|"contact", tab:"cust"|"ptn"|"guide", ov}
function open(kind,tab){ close(); var ov=D.createElement("div"); ov.id="pcInfo"; ov.className="pi-ov";
  ov.innerHTML='<div class="pi-pop" role="dialog" aria-modal="true" aria-labelledby="piT"></div>';
  D.body.appendChild(ov); POP={kind:kind,tab:tab||"cust",ov:ov};
  ov._rb=paint;   // 언어를 바꾸면(lang.js 가 떠 있는 창마다 부름) 이 창 글자를 그 자리에서
  ov.addEventListener("click",function(e){ if(e.target===ov) close(); });
  H.classList.add("pilock"); paint();
  setTimeout(function(){ try{ var x=ov.querySelector(".pi-x"); if(x) x.focus({preventScroll:true}); }catch(e){} },0); }
function close(){ var o=D.getElementById("pcInfo"); if(o) o.remove(); POP=null; H.classList.remove("pilock"); }
function hd(t){ return '<div class="pi-hd"><img class="pi-lg" src="logo.png" alt=""><h2 id="piT">'+E(L6(t))+'</h2><button type="button" class="pi-x" data-pi="x" aria-label="'+E(L6(TX.close))+'">✕</button></div>'; }
function paint(){ if(!POP||!D.body.contains(POP.ov)) return; var p=POP.ov.querySelector(".pi-pop"); if(POP.kind==="about") aboutPaint(p); else contactPaint(p); eq(); }
// 카드 오른쪽 단추 같은 크기 (사장님 11-08 「카드 단추는 같은 크기·오른쪽 맞춤」)
function eq(){ if(!POP) return; [".pi-r .pi-b",".pi-ft .pi-b"].forEach(function(sel){ var bs=[].slice.call(POP.ov.querySelectorAll(sel)); bs.forEach(function(b){ b.style.minWidth=""; }); var w=0; bs.forEach(function(b){ w=Math.max(w,b.offsetWidth); }); if(w) bs.forEach(function(b){ b.style.minWidth=Math.ceil(w)+"px"; }); }); }

// ── 회사 소개 ──
function rows(){ var ko=LG()==="ko", blank='<span class="pi-bl">(     )</span>';
  return [[TX.rCo,E(L6(TX.co).replace("{b}",AGN()))],[TX.rCeo,E(L6(TX.ceo))],[TX.rBiz,"297-81-03712"],
    [TX.rTr,NO.travel?E(NO.travel):blank],[TX.rMail,NO.mail?E(NO.mail):blank],[TX.rLbs,E(L6(TX.lbs))],
    [TX.rAddr,E(ko?"경기도 남양주시 진접읍 해밀예당1로 220, 707호 씨64호(엠타워)":ADDR_EN)],
    [TX.rCs,'<a href="tel:'+TELI+'">'+E(ko?TEL:TELI)+'</a> · <a href="mailto:'+MAIL+'">'+MAIL+'</a>']]; }
function aboutPaint(p){
  p.innerHTML=hd(TX.about)
   +'<div class="pi-lead">'+E(AGN())+L6(TX.lead)+'</div>'
   +'<p class="pi-p">'+E(L6(TX.body))+'</p>'
   +'<div class="pi-ways">'+[["guide",TX.w1],["package",TX.w2],["ai",TX.w3]].map(function(w){ return '<button type="button" data-pi="go" data-r="'+w[0]+'">'+E(L6(w[1]))+'</button>'; }).join("")+'</div>'
   +'<table class="pi-tb"><tbody>'+rows().map(function(r){ return '<tr><th scope="row">'+E(L6(r[0]))+'</th><td>'+r[1]+'</td></tr>'; }).join("")+'</tbody></table>'
   +'<div class="pi-ft"><button type="button" class="pi-b g" data-pi="x">'+E(L6(TX.close))+'</button><button type="button" class="pi-b" data-pi="ask">'+E(L6(TX.ask))+'</button></div>'; }

// ── 문의 ──
var TABS=[["cust",TX.tCust],["ptn",null],["guide",TX.tGuide]];
function tabLbl(k){ return k==="ptn"?T2("제휴 문의","Partner with us"):L6(k==="cust"?TX.tCust:TX.tGuide); }   // 제휴 문의 = 앱 창 제목과 같은 말
function custHtml(){ var ko=LG()==="ko";
  return '<div class="pi-box"><b>'+E(L6(TX.c1T))+'</b><div class="pi-r"><span>'+E(L6(TX.c1P))+'</span><button type="button" class="pi-b" data-pi="bk">'+E(L6(TX.bk))+'</button></div></div>'
   +'<div class="pi-box"><b>'+E(L6(TX.c2T))+'</b>'
   +'<div class="pi-r"><span>'+E(L6(TX.em))+' <a href="mailto:'+MAIL+'">'+MAIL+'</a></span><a class="pi-b w" href="mailto:'+MAIL+'">'+E(L6(TX.mailB))+'</a></div>'
   +'<div class="pi-r"><span>'+E(L6(TX.cs))+' <a href="tel:'+TELI+'">'+E(ko?TEL:TELI)+'</a></span><a class="pi-b w" href="tel:'+TELI+'">'+E(L6(TX.callB))+'</a></div></div>'; }
function contactPaint(p){
  if(!p.querySelector(".pi-panes")) p.innerHTML='<div class="pi-hdw"></div><div class="pi-tabs"></div><div class="pi-panes"><div class="pi-pane" data-p="cust"></div><div class="pi-pane" data-p="ptn" hidden></div><div class="pi-pane" data-p="guide" hidden></div></div><div class="pi-ft"></div>';
  p.querySelector(".pi-hdw").innerHTML=hd(TX.contact);
  p.querySelector(".pi-tabs").innerHTML=TABS.map(function(t){ return '<button type="button" data-pi="tab" data-t="'+t[0]+'" class="'+(POP.tab===t[0]?"on":"")+'" aria-pressed="'+(POP.tab===t[0])+'">'+E(tabLbl(t[0]))+'</button>'; }).join("");
  p.querySelector('.pi-pane[data-p="cust"]').innerHTML=custHtml();
  [].forEach.call(p.querySelectorAll(".pi-pane"),function(x){ x.hidden=x.getAttribute("data-p")!==POP.tab; });
  if(POP.tab==="ptn") ptnMount(p.querySelector('.pi-pane[data-p="ptn"]')); else if(POP.tab==="guide") guideMount(p.querySelector('.pi-pane[data-p="guide"]'));
  p.querySelector(".pi-ft").innerHTML='<button type="button" class="pi-b g" data-pi="x">'+E(L6(TX.close))+'</button>'; }
// 제휴 문의 — 앱 창(inqOpen)을 이 탭 안으로 옮긴다: ① 사업자등록번호 확인(국세청) ② 이메일 확인 ③ 업종·내용 · 앱 창 제목줄(✕)과 「관광 가이드 등록」 단추는 이 창에선 탭이 대신해 뺀다
function ptnMount(pane){ if(!pane||pane.querySelector("#inqBox")) return; if(typeof window.inqOpen!=="function"){ pane.innerHTML='<div class="pi-msg">'+E(L6(TX.noForm))+'</div>'; return; }
  try{ window.inqOpen(); }catch(e){} var b=D.getElementById("inqBox"); if(!b){ pane.innerHTML='<div class="pi-msg">'+E(L6(TX.noForm))+'</div>'; return; }
  b.onclick=null; pane.innerHTML=""; pane.appendChild(b);
  var inn=D.getElementById("inqIn"), h=inn&&inn.firstElementChild; if(h&&h.querySelector("h3")) h.remove();
  var gb=inn&&inn.querySelector('button[onclick*="GUIDEREG"]'); if(gb){ var nx=gb.nextElementSibling; gb.remove(); if(nx&&nx.classList.contains("m")) nx.remove(); } }
// 가이드 등록 — 앱 창(GUIDEREG)을 이 탭 안으로: 관광통역안내사 · 무료 · 언어·지역·자격증 · 승인 뒤 「가이드 인솔」 목록에
function guideMount(pane){ if(!pane||pane.querySelector("#gregBox")) return; if(typeof window.GUIDEREG!=="function"){ pane.innerHTML='<div class="pi-msg">'+E(L6(TX.noForm))+'</div>'; return; }
  try{ window.GUIDEREG(); }catch(e){} var b=D.getElementById("gregBox"); if(!b){ pane.innerHTML='<div class="pi-msg">'+E(L6(TX.noForm))+'</div>'; return; }
  pane.innerHTML=""; pane.appendChild(b); }

// ── 누르기 ──
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest||!POP) return; var c=t.closest("#pcInfo [data-pi]"); if(!c) return; var a=c.getAttribute("data-pi");
  if(a==="x"){ close(); return; }
  if(a==="ask"){ open("contact","cust"); return; }
  if(a==="go"){ var r=c.getAttribute("data-r"); close(); if(window.PCGO) PCGO(r); return; }
  if(a==="tab"){ POP.tab=c.getAttribute("data-t"); paint(); return; }
  if(a==="bk"){ close(); var bk=D.getElementById("phBk"); if(bk&&(bk.onclick||bk.getAttribute("data-pcbk"))){ bk.click(); return; } try{ if(window.CHAT&&CHAT.panel) CHAT.panel(); }catch(x){} return; }   // 머리줄 「내 예약」 화면이 생기면 그리로 — 지금은 앱 「내 예약 대화방」
});
// 앱 창 안의 「닫기」(보낸 뒤·접수 뒤 — 앱은 그 창만 지운다) = 이 창을 닫는다
window.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest('#pcInfo [onclick*="inqBox"],#pcInfo [onclick*="gregBox"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); close(); },true);
D.addEventListener("keydown",function(e){ if(e.key==="Escape"&&POP&&!D.querySelector("#pcnDet")) close(); });
window.addEventListener("hashchange",function(){ if(POP) close(); });

window.PCINFO={about:function(){ open("about"); },contact:function(tab){ open("contact",tab||"cust"); },close:close};
})();
