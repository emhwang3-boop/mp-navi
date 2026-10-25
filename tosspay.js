/* 토스페이먼츠 결제 흐름 — 시험 모드 (사장님 2026-10-25, 카드사 심사용 결제경로)
 *  · 사장님 기기 전용 숨김: ?paytest=1 로 켜고 ?paytest=0 로 끈다 (localStorage mpv_ptest). 꺼져 있으면 손님 화면은 그대로(예약·문의만)
 *  · 빅4 패키지 카드에 「예약·결제」 → 주문 화면(날짜·인원·자동계산·총액·환불 한 줄·비회원 구매 안내) → 토스 결제위젯(v2) → 결제창
 *  · 시험 클라이언트 키 = 토스 공식 문서·샘플의 공개 위젯 키. 승인 서버 호출 없음 — 돌아오면 「시험 결제 완료」만 보여준다
 *  index.html 은 <script src="tosspay.js"> 한 줄뿐 — 전역(LANG·esc·refundLine)을 부른다 */
(function(){
"use strict";
var CK="test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";   // 토스 공식 문서 공개 시험 키 (결제위젯)
var SDK="https://js.tosspayments.com/v2/standard";
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
function L6(o){ var l=window.LANG||"en"; return o[l]||o.en; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function won(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",")+(window.LANG==="ko"?"원":" KRW"); }
// 켜기·끄기 (주소 ?paytest=1 / 0) — 손님에게 남지 않게 주소에서 지운다
(function(){ var m=/[?&]paytest=([01])/.exec(location.search); if(!m) return; ls("mpv_ptest",m[1]==="1"?"1":null);
  try{ var q=location.search.slice(1).split("&").filter(function(x){ return !/^paytest=/.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(q?"?"+q:"")+location.hash); }catch(e){} })();
function on(){ return true; }   // 10-25 사장님: 모든 손님에게 결제 흐름 (숨김 없앰). 단추는 near.js 빅4 카드의 「예약·결제」
var T={
  btn:{ko:"예약·결제",en:"Book & pay",ja:"予約・決済",zhs:"预订·付款",zht:"預訂·付款",es:"Reservar y pagar"},
  title:{ko:"K-POP 빅4 사옥 투어 주문",en:"Order: K-pop Big4 Agency Tour",ja:"ご注文：K-POP BIG4 社屋ツアー",zhs:"订单：K-POP四大社参观团",zht:"訂單：K-POP四大社參觀團",es:"Pedido: Tour de las Big4 del K-pop"},
  date:{ko:"투어 날짜",en:"Tour date",ja:"ツアー日",zhs:"旅游日期",zht:"旅遊日期",es:"Fecha del tour"},
  ppl:{ko:"인원",en:"People",ja:"人数",zhs:"人数",zht:"人數",es:"Personas"},
  unit:{ko:"1인 요금",en:"Price per person",ja:"1名あたり",zhs:"每人价格",zht:"每人價格",es:"Precio por persona"},
  rule:{ko:"1인 89,000원 · 2인 이상 1인 79,000원",en:"₩89,000 for 1 person · ₩79,000 per person for 2+",ja:"1名 ₩89,000・2名以上は1名 ₩79,000",zhs:"1人 ₩89,000·2人以上每人 ₩79,000",zht:"1人 ₩89,000·2人以上每人 ₩79,000",es:"₩89,000 para 1 persona · ₩79,000 por persona desde 2"},
  total:{ko:"총 결제금액",en:"Total",ja:"お支払い合計",zhs:"应付总额",zht:"應付總額",es:"Total a pagar"},
  name:{ko:"예약자 이름",en:"Your name",ja:"予約者名",zhs:"预订人姓名",zht:"預訂人姓名",es:"Tu nombre"},
  guest:{ko:"비회원 구매 — 회원가입·로그인 없이 바로 결제할 수 있어요. 예약 안내는 결제 때 입력한 연락처로 보내 드려요.",en:"Guest checkout — pay right away without signing up or logging in. We'll send booking details to the contact you enter at payment.",ja:"非会員購入 — 会員登録・ログインなしでそのまま決済できます。予約のご案内は決済時に入力した連絡先にお送りします。",zhs:"非会员购买——无需注册或登录即可直接付款。预订信息将发送到您付款时填写的联系方式。",zht:"非會員購買——無需註冊或登入即可直接付款。預訂資訊將寄到您付款時填寫的聯絡方式。",es:"Compra como invitado: paga sin registrarte ni iniciar sesión. Enviaremos los detalles de la reserva al contacto que indiques al pagar."},
  pay:{ko:"결제하기",en:"Pay",ja:"決済する",zhs:"去付款",zht:"去付款",es:"Pagar"},
  test:{ko:"시험 모드 — 실제로 돈이 빠져나가지 않아요",en:"Test mode — no real charge",ja:"テストモード — 実際の請求はありません",zhs:"测试模式——不会实际扣款",zht:"測試模式——不會實際扣款",es:"Modo de prueba: no se cobra de verdad"},
  needd:{ko:"날짜를 골라 주세요.",en:"Please choose a date.",ja:"日付を選んでください。",zhs:"请选择日期。",zht:"請選擇日期。",es:"Elige una fecha."},
  needn:{ko:"예약자 이름을 넣어 주세요.",en:"Please enter your name.",ja:"予約者名を入力してください。",zhs:"请填写预订人姓名。",zht:"請填寫預訂人姓名。",es:"Escribe tu nombre."},
  load:{ko:"결제수단 불러오는 중…",en:"Loading payment methods…",ja:"決済手段を読み込み中…",zhs:"正在加载付款方式…",zht:"正在載入付款方式…",es:"Cargando métodos de pago…"},
  close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
  okT:{ko:"시험 결제 완료",en:"Test payment complete",ja:"テスト決済完了",zhs:"测试付款完成",zht:"測試付款完成",es:"Pago de prueba completado"},
  okD:{ko:"시험 모드라 실제 결제·승인은 하지 않았어요.",en:"Test mode — no real charge or approval was made.",ja:"テストモードのため、実際の決済・承認は行っていません。",zhs:"测试模式，未进行实际付款或授权。",zht:"測試模式，未進行實際付款或授權。",es:"Modo de prueba: no se hizo ningún cobro ni autorización real."},
  failT:{ko:"결제가 완료되지 않았어요",en:"Payment was not completed",ja:"決済が完了しませんでした",zhs:"付款未完成",zht:"付款未完成",es:"El pago no se completó"},
  oid:{ko:"주문번호",en:"Order no.",ja:"注文番号",zhs:"订单号",zht:"訂單號",es:"N.º de pedido"},
  amt:{ko:"금액",en:"Amount",ja:"金額",zhs:"金额",zht:"金額",es:"Importe"}
};
function css(){ if(document.getElementById("tpCss")) return; var s=document.createElement("style"); s.id="tpCss";
  s.textContent="#tpBox{position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}"
  +"#tpBox .in{background:var(--card);color:var(--ink);width:100%;max-width:560px;max-height:94vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 16px 26px;box-sizing:border-box}"
  +"#tpBox h3{margin:0 0 4px;font-size:18px}#tpBox .d{font-size:13.5px;color:var(--sub);line-height:1.5}"
  +"#tpBox .row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0}#tpBox label{font-weight:800;font-size:14.5px}"
  +"#tpBox input{font-size:16px;padding:9px 11px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit}"
  +"#tpBox .step{display:flex;align-items:center;gap:8px}#tpBox .step button{width:36px;height:36px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;font-weight:800;cursor:pointer}"
  +"#tpBox .tot{font-size:20px;font-weight:900}#tpBox .guest{margin:12px 0;padding:10px 12px;border-radius:12px;background:var(--bg);border:1px solid var(--line);font-size:13.5px;line-height:1.5}"
  +"#tpBox .go{width:100%;border:0;border-radius:12px;padding:14px;font-size:17px;font-weight:900;background:#3182f6;color:#fff;cursor:pointer;margin-top:10px}#tpBox .go:disabled{opacity:.5}"
  +"#tpBox .x{float:right;border:0;background:none;font-size:22px;cursor:pointer;color:var(--sub)}#tpBox .tst{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;background:#fff4e6;color:#d9480f;font-size:12px;font-weight:800}";
  document.head.appendChild(s); }
function sdk(){ return new Promise(function(ok,no){ if(window.TossPayments) return ok(); var s=document.createElement("script"); s.src=SDK; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
var W=null;
function price(n){ return n>=2?79000:89000; }
function openOrder(){ css(); var b=document.getElementById("tpBox"); if(b) b.remove(); b=document.createElement("div"); b.id="tpBox";
  var d=new Date(Date.now()+9*3600e3+86400e3).toISOString().slice(0,10);
  b.innerHTML='<div class="in"><button type="button" class="x" id="tpX" aria-label="close">✕</button><h3>'+E(L6(T.title))+'</h3><span class="tst">'+E(window.PAYTEST6?L6(window.PAYTEST6):L6(T.test))+'</span>'
    +'<div class="row"><label for="tpD">'+E(L6(T.date))+'</label><input id="tpD" type="date" min="'+d+'" value="'+d+'"></div>'
    +'<div class="row"><label>'+E(L6(T.ppl))+'</label><div class="step"><button type="button" id="tpM">−</button><b id="tpN" style="min-width:24px;text-align:center;font-size:17px">1</b><button type="button" id="tpP">+</button></div></div>'
    +'<div class="row"><label>'+E(L6(T.unit))+'</label><span id="tpU"></span></div><div class="d">'+E(L6(T.rule))+'</div>'
    +'<div class="row"><label>'+E(L6(T.total))+'</label><span class="tot" id="tpT"></span></div>'
    +(window.refundLine?window.refundLine({p:1}):"")
    +'<div class="guest" id="tpG">'+E(L6(T.guest))+'</div>'
    +'<div class="row"><label for="tpName">'+E(L6(T.name))+'</label><input id="tpName" type="text" autocomplete="name" style="flex:1;min-width:0"></div>'
    +'<div id="tpMethods"><div class="d">'+E(L6(T.load))+'</div></div><div id="tpAgree"></div>'
    +'<button type="button" class="go" id="tpGo" disabled>'+E(L6(T.pay))+'</button><div class="d" style="margin-top:6px;text-align:center">'+E(window.PAYTEST6?L6(window.PAYTEST6):L6(T.test))+'</div><div class="d" id="tpMsg" style="margin-top:8px;min-height:18px"></div></div>';
  b.onclick=function(e){ if(e.target===b) b.remove(); }; document.body.appendChild(b);
  var n=1, q=function(i){ return b.querySelector(i); };
  var paint=function(){ q("#tpN").textContent=n; q("#tpU").textContent=won(price(n)); q("#tpT").textContent=won(price(n)*n); if(W) W.setAmount({currency:"KRW",value:price(n)*n}).catch(function(){}); };
  q("#tpX").onclick=function(){ b.remove(); }; q("#tpM").onclick=function(){ if(n>1){ n--; paint(); } }; q("#tpP").onclick=function(){ if(n<20){ n++; paint(); } };
  paint();
  sdk().then(function(){ var tp=window.TossPayments(CK); W=tp.widgets({customerKey:window.TossPayments.ANONYMOUS});
    return W.setAmount({currency:"KRW",value:price(n)*n}).then(function(){ q("#tpMethods").innerHTML=""; return Promise.all([W.renderPaymentMethods({selector:"#tpMethods",variantKey:"DEFAULT"}),W.renderAgreement({selector:"#tpAgree",variantKey:"AGREEMENT"})]); }); })
    .then(function(){ q("#tpGo").disabled=false; window.__tpReady=true; })
    .catch(function(e){ window.__tpErr=String(e&&e.message||e); q("#tpMsg").textContent=window.__tpErr; });
  q("#tpGo").onclick=function(){ var dt=q("#tpD").value, nm=q("#tpName").value.trim(); if(!dt){ q("#tpMsg").textContent=L6(T.needd); return; } if(!nm){ q("#tpMsg").textContent=L6(T.needn); return; }
    var oid="B4"+dt.replace(/-/g,"")+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), base=location.origin+location.pathname;
    W.requestPayment({orderId:oid,orderName:"K-POP Big4 Agency Tour ("+dt+", "+n+")",successUrl:base+"?ptres=ok",failUrl:base+"?ptres=fail",customerName:nm.slice(0,40)})
      .catch(function(e){ window.__tpReqErr=String(e&&e.message||e); q("#tpMsg").textContent=(e&&e.message)||""; }); }; }
// 빅4 카드에 「예약·결제」 단추 (켜져 있을 때만) — 「예약·문의」 바로 위
function addBtn(){ if(!on()) return; var c=document.querySelector(".b4pkg"); if(!c||c.querySelector("#tpOpen")) return; var ig=c.querySelector('[data-nr="ig"]'); if(!ig) return;
  var bt=document.createElement("button"); bt.type="button"; bt.id="tpOpen"; bt.className=ig.className; bt.style.cssText="margin-top:7px;background:#3182f6;color:#fff;border-color:#3182f6"; bt.textContent=L6(T.btn)+" ›";
  bt.addEventListener("click",function(e){ e.stopPropagation(); openOrder(); }); ig.parentNode.insertBefore(bt,ig); }
/* 단추는 이제 near.js 가 직접 그린다 (addBtn 안 씀, 10-25) */
// 결제창에서 돌아왔을 때 — 시험 결제 완료 / 실패 (승인 서버 호출 없음)
(function(){ var sp=new URLSearchParams(location.search), r=sp.get("ptres"); if(!r) return;
  var show=function(){ css(); var b=document.createElement("div"); b.id="tpBox"; var ok=r==="ok";
    b.innerHTML='<div class="in"><h3>'+E(L6(ok?T.okT:T.failT))+'</h3>'+(ok?'<div class="d">'+E(L6(T.okD))+'</div>':'<div class="d">'+E((sp.get("code")||"")+" "+(sp.get("message")||""))+'</div>')
      +'<div class="row"><label>'+E(L6(T.oid))+'</label><span>'+E(sp.get("orderId")||"-")+'</span></div>'+(sp.get("amount")?'<div class="row"><label>'+E(L6(T.amt))+'</label><span>'+E(won(+sp.get("amount")))+'</span></div>':"")
      +'<button type="button" class="go" id="tpC">'+E(L6(T.close))+'</button></div>';
    document.body.appendChild(b); b.querySelector("#tpC").onclick=function(){ b.remove(); }; window.__tpResult=r; };
  try{ history.replaceState(history.state,"",location.pathname+location.hash); }catch(e){}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(show,600); }); else setTimeout(show,600); })();
window.TPAY={on:on,open:openOrder};
})();
