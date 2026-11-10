/* 투어앱 결제 = KG이니시스 · 포트원 V2 (사장님 2026-11-07 「왜 토스로 하냐 이니시스로 해」) — 패키지(shop.js)·가이드 인솔(near.js)·가이드 일정 검토(trip.js) 공용
 *  · 노래방(karaoke.js kPortGo·kptReturn)과 같은 방식: 허브 /shop/order 가 준 storeId·channelKey·paymentId(=주문번호)·금액으로 PortOne.requestPayment
 *    → redirectUrl(?tpres=1&paymentId, 실패면 &code&message)로 돌아오면 허브 /shop/port/confirm {paymentId, ck} — 허브가 포트원에서 다시 읽어 확정(앱이 보낸 금액은 안 믿는다)
 *  · 🔴 SH_PG=false — 지금은 「결제하기」 = 바로 결제 완료(허브 pay:"none"). 허브 wrangler.toml 에 PORTONE_TOUR_CHANNEL_KEY(투어앱 KG이니시스 채널)를 넣을 때 여기를 true 로 같이 올린다
 *    (허브는 채널 키가 생기면 결제 없는 주문을 거절 — 앱이 pg:1 을 보내야 결제창 주문이 만들어진다)
 *  · 돌아왔을 때 화면은 상품마다 TPG.onRet(kind, fn(ctx, res)) 로 단 함수가 다시 그린다 — kind "pkg" | "gbk" | "grv" · res = {ok:true, j(확인 답)} | {ok:false, err:"fail"|"amount"|"noguide"|"wait", msg}
 *  index.html 은 <script src="tpg.js"> 한 줄 (shop.js·near.js·trip.js 보다 먼저) */
(function(){
"use strict";
var SH_PG=false;   // 🔴 PG 붙이면 true (KG이니시스 결제창) — 허브 PORTONE_TOUR_CHANNEL_KEY 와 같이
var PSDK="https://cdn.portone.io/v2/browser-sdk.js", RK="mpv_tpg", HUBU="https://brief-live-hub.emhwang3.workers.dev", H={};
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L6(o){ return o[window.LANG]||o.en; }
var TX={
 opn:T6("결제창을 여는 중…","Opening the payment window…","決済画面を開いています…","正在打开付款窗口…","正在開啟付款視窗…","Abriendo la ventana de pago…"),
 need:T6("PC에서 카드 결제를 하려면 이름·휴대폰 번호·이메일이 필요해요.","Card payment on a computer needs your name, mobile number and email.","パソコンでのカード決済には、お名前・携帯電話番号・メールアドレスが必要です。","在电脑上刷卡付款需要填写姓名、手机号码和邮箱。","在電腦上刷卡付款需要填寫姓名、手機號碼和電子郵件。","Para pagar con tarjeta en un ordenador necesitas tu nombre, tu móvil y tu correo."),
 fail:T6("결제창을 열지 못했어요. 잠시 뒤 다시 눌러 주세요.","Could not open the payment window. Please try again shortly.","決済画面を開けませんでした。しばらくしてからもう一度お試しください。","无法打开付款窗口，请稍后再试。","無法開啟付款視窗，請稍後再試。","No se pudo abrir la ventana de pago. Inténtalo de nuevo en un momento."),
 wait:T6("결제 결과를 확인하고 있어요. 확정되면 메일로 알려 드려요.","We are still confirming your payment. We'll email you once it is confirmed.","決済結果を確認しています。確定したらメールでお知らせします。","正在确认付款结果，确认后会通过邮件通知您。","正在確認付款結果，確認後會透過電子郵件通知您。","Aún estamos confirmando tu pago. Te avisaremos por correo cuando se confirme."),
 pgoff:T6("카드 결제를 준비하고 있어요. 잠시 뒤 다시 해 주세요.","Card payment is being set up. Please try again later.","カード決済を準備中です。しばらくしてからもう一度お試しください。","刷卡付款正在准备中，请稍后再试。","刷卡付款正在準備中，請稍後再試。","Estamos preparando el pago con tarjeta. Inténtalo más tarde."),
 pgreq:T6("결제 방식이 바뀌었어요. 앱을 새로 받은 뒤 다시 해 주세요.","Payment has been updated. Please reload the app and try again.","決済方法が更新されました。アプリを再読み込みしてからもう一度お試しください。","付款方式已更新，请重新加载应用后再试。","付款方式已更新，請重新載入應用程式後再試。","El pago se ha actualizado. Vuelve a cargar la app e inténtalo de nuevo."),
 amount:T6("결제 금액이 주문과 달라 확정하지 않았어요. 고객센터로 알려 주세요.","The paid amount did not match the order, so it was not confirmed. Please contact us.","決済金額が注文と異なるため確定していません。お問い合わせください。","付款金额与订单不符，未确认。请联系我们。","付款金額與訂單不符，未確認。請聯絡我們。","El importe pagado no coincide con el pedido, así que no se confirmó. Contáctanos.")};
function psdk(){ return new Promise(function(ok,no){ if(window.PortOne) return ok(); var s=document.createElement("script"); s.src=PSDK; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function ss(v){ try{ if(v===undefined) return JSON.parse(sessionStorage.getItem(RK)||"null"); if(v===null) sessionStorage.removeItem(RK); else sessionStorage.setItem(RK,JSON.stringify(v)); }catch(e){ return null; } }
function pc(){ var u=navigator.userAgent||""; return !(/Android|iPhone|iPad|iPod|Mobile/i.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)); }   // KG이니시스 PC 결제는 이름·전화·이메일 필수(모바일은 선택) — 노래방 kPc 와 같음
function phN(s){ var v=String(s||"").replace(/\D/g,""); if(/^82/.test(v)){ v=v.slice(2); if(v.charAt(0)!=="0") v="0"+v; } return v; }   // +82 10… → 010… (해외 번호는 숫자만)
function loc(){ var l=window.LANG; return l==="ko"?"KO_KR":(pc()&&(l==="zhs"||l==="zht"))?"ZH_CN":"EN_US"; }
function low(on){ try{ document.documentElement.classList.toggle("tpgon",!!on); }catch(e){} }   // PC 결제창이 우리 창(체험·가이드·일정 창) 뒤로 숨지 않게 — 결제창이 열린 동안만 낮춘다
(function(){ var c=document.createElement("style"); c.textContent="html.tpgon #shopBox,html.tpgon #nrBox,html.tpgon .trpop,html.tpgon .trsheet{z-index:10!important}"; document.head.appendChild(c); })();
// 결제창 열기 — j = /shop/order 답(pay "pg", pg{storeId,channelKey,paymentId,orderName,totalAmount,currency}, ck) · ctx = 돌아왔을 때 다시 그릴 내용({kind, …}) · cu = {name, email, phone}
//   돌려주는 값 Promise: null(결제창으로 감) · 글자(화면에 보일 오류)
function go(j,ctx,cu){ var g=j&&j.pg; if(!(g&&g.storeId&&g.channelKey&&g.paymentId&&g.totalAmount)) return Promise.resolve(L6(TX.fail));
  cu=cu||{}; var nm=String(cu.name||"").trim(), em=String(cu.email||"").trim(), ph=phN(cu.phone);
  if(pc()&&!(nm&&em&&/^\d{8,15}$/.test(ph))) return Promise.resolve(L6(TX.need));
  var base=location.origin+location.pathname, c={}; if(nm) c.fullName=nm.slice(0,100); if(em) c.email=em; if(ph) c.phoneNumber=ph;
  var req={storeId:g.storeId,channelKey:g.channelKey,paymentId:g.paymentId,orderName:String(g.orderName||"MosaicTrip").slice(0,100),totalAmount:g.totalAmount,currency:"KRW",payMethod:"CARD",customer:c,redirectUrl:base+"?tpres=1",forceRedirect:true,locale:loc()};
  ss({oid:g.paymentId,ck:j.ck||"",amount:g.totalAmount,ctx:ctx||{},at:Date.now()});   // 돌아왔을 때 화면을 다시 그리려고 이 탭에만 (확정은 허브가 포트원에서 읽은 값으로)
  try{ ntap("tpg","open_"+((ctx&&ctx.kind)||"")); }catch(e){}
  return psdk().then(function(){ low(1); return window.PortOne.requestPayment(req); }).then(function(r){ low(0);
      if(r&&r.code!==undefined){ window.__tpgErr=String(r.code)+" "+String(r.message||""); ss(null); return r.message||L6(TX.fail); }
      location.href=base+"?tpres=1&paymentId="+encodeURIComponent(g.paymentId); return null; })
    .catch(function(e){ low(0); window.__tpgErr=String((e&&e.code||"")+" "+(e&&e.message||e)); ss(null); return (e&&e.message)||L6(TX.fail); }); }
// 결제창에서 돌아옴 — 이 탭에서 연 결제만 · 실패(code)면 바로 실패 · 아니면 허브 확인 · 확인이 늦으면 「확인 중」(웹훅·30분 대조가 확정하고 손님에게 알린다)
function ret(){ var sp=new URLSearchParams(location.search); if(!sp.get("tpres")) return;
  try{ var keep=location.search.slice(1).split("&").filter(function(x){ return !/^(tpres|paymentId|txId|transactionType|code|message|pgCode|pgMessage)=/.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(keep?"?"+keep:"")+location.hash); }catch(e){}
  var v=ss(), oid=sp.get("paymentId")||(v&&v.oid)||"", cd=sp.get("code");
  if(!v||!v.ctx||v.oid!==oid) return;
  var fn=H[v.ctx.kind]; if(!fn) return;
  var fin=function(res){ window.__tpgResult=res.ok?"ok":(res.err||"fail"); try{ ntap("tpg","ret_"+v.ctx.kind+"_"+window.__tpgResult); }catch(e){} try{ fn(v.ctx,res); }catch(e){ window.__tpgRetErr=String(e); } };
  if(cd){ ss(null); fin({ok:false,err:"fail",msg:sp.get("pgMessage")||sp.get("message")||""}); return; }
  fetch(HUBU+"/shop/port/confirm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({paymentId:oid,ck:v.ck})}).then(function(r){ return r.json(); })
    .then(function(j){ ss(null); if(j&&j.ok){ fin({ok:true,j:j}); return; } fin({ok:false,err:(j&&/^(fail|amount|noguide)$/.test(j.err))?j.err:"wait",j:j||null}); })
    .catch(function(){ ss(null); fin({ok:false,err:"wait"}); }); }
// 허브 /shop/order 오류 → 화면 글자 (결제 관문만 — 나머지는 상품 화면이 자기 글자로)
function errTx(e){ return e==="pgoff"?L6(TX.pgoff):e==="pgreq"?L6(TX.pgreq):""; }
window.TPG={on:SH_PG,go:go,onRet:function(k,f){ H[k]=f; },pc:pc,errTx:errTx,tx:function(k){ return TX[k]?L6(TX[k]):""; },
  resTx:function(res){ return !res||res.ok?"":res.err==="wait"?L6(TX.wait):res.err==="amount"?L6(TX.amount):""; }};
if(/[?&]tpres=/.test(location.search)){ var _t=function(){ setTimeout(function(){ try{ ret(); }catch(e){ window.__tpgRetErr=String(e); } },900); }; if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",_t); else _t(); }
})();
