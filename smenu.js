/* 가게 메뉴 · 모바일 바우처 · 모델 바꾸기 (사장님 2026-11-10 「만들어」 — 규칙서 「패키지 가격 = 패키지 여행비」「가게 수수료 받는 방식」)
 *  · 상품마다 「가게 메뉴」(관리자 → 가게·메뉴) — 「하나만」(도장 등) / 「여러 개·수량」(식당 등) · 메뉴마다 「앱에서 결제」 또는 「현장에서 결제」(건강검진 추가 검사 등, 값 안내·미리 고르기만)
 *  · 결제 금액 = 패키지 여행비(지금 계산 그대로) + 앱에서 결제하는 메뉴 합계 — 허브 /shop/order 가 서버 값으로 다시 계산 · 메뉴가 없는 상품은 지금과 똑같다
 *  · 「내 예약」(near.js)·홈페이지 내 예약(home/pc_bk.js)·대화방 예약 내용(chat.js)에 바우처 · 「모델 바꾸기」 = 손님(예약 토큰 /shop/mchg)·동행 가이드(/guide/gme op mchg)
 *    더 비싸면 차액 결제(PG 전이면 바로 완료 · PG 뒤면 KG이니시스 결제창 tpg.js kind "mchg") · 더 싸면 결제 카드 부분 취소 → 바우처 다시 · 가게에 문자
 *  · 가게 메뉴가 있는 패키지는 「내 예약」에 「투어 완료」(예약 시작 시각부터) — 가게 정산은 손님이 투어 완료를 누른 예약만
 *  · shop.js·near.js·chat.js·home/pc_pkg.js·home/pc_bk.js 가 window.SMN 으로 부른다(없으면 지금 그대로) · 고르기를 바꾸면 document 에 「smnchg」, 바우처가 바뀌면 「smnvch」 */
(function(){
"use strict";
var HB=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function F(o,m){ var s=L(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function won(x){ return "₩"+Number(x||0).toLocaleString("ko-KR"); }
function post(p,b){ return fetch(HB+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),cache:"no-store"}).then(function(r){ return r.json(); }); }
function sess(){ try{ return localStorage.getItem("mpv_pg_sess")||""; }catch(e){ return ""; } }
var TX={
 mT:T6("가게 메뉴","Shop menu","お店のメニュー","店铺菜单","店家菜單","Menú de la tienda"),
 one:T6("하나만 고를 수 있습니다.","You can choose one.","1つだけ選べます。","只能选择一项。","只能選擇一項。","Puedes elegir uno."),
 multi:T6("여러 개를 수량과 함께 고를 수 있습니다.","You can choose several, with quantities.","複数を数量とあわせて選べます。","可选择多项并选择数量。","可選擇多項並選擇數量。","Puedes elegir varios, con cantidades."),
 detN:T6("예약·결제 칸에서 고르면 패키지 여행비와 함께 결제됩니다.","Choose in the booking box and it’s paid together with the package tour fee.","予約・決済欄で選ぶと、パッケージツアー代金と一緒に決済されます。","在预约·付款栏中选择后，将与跟团游费用一起付款。","在預約·付款欄中選擇後，將與跟團遊費用一起付款。","Elígelo en el recuadro de reserva y se paga junto con la tarifa del tour."),
 tagA:T6("앱에서 결제","Paid in the app","アプリで決済","在应用内付款","在應用程式內付款","Se paga en la app"),
 tagS:T6("현장에서 결제","Pay on site","現地で支払い","现场付款","現場付款","Se paga en el lugar"),
 pick:T6("가게 메뉴 고르기","Choose from the shop menu","お店のメニューを選ぶ","选择店铺菜单","選擇店家菜單","Elige del menú de la tienda"),
 none:T6("고르지 않음 (현장에서 골라 따로 계산)","None (choose and pay on site)","選ばない（現地で選んで別途お支払い）","不选（现场选择并另行付款）","不選（現場選擇並另行付款）","Ninguno (eliges y pagas en el lugar)"),
 tour:T6("패키지 여행비","Package tour fee","パッケージツアー代金","跟团游费用","跟團遊費用","Tarifa del tour"),
 appL:T6("가게 메뉴 (앱에서 결제)","Shop menu (paid in the app)","お店のメニュー（アプリで決済）","店铺菜单（在应用内付款）","店家菜單（在應用程式內付款）","Menú de la tienda (se paga en la app)"),
 dirL:T6("현장에서 낼 금액 (안내)","To pay on site (for reference)","現地で支払う金額（目安）","现场支付金额（参考）","現場支付金額（參考）","A pagar en el lugar (referencia)"),
 out:T6("바우처에 없는 메뉴는 가게에서 따로 계산합니다.","Anything not on this voucher is paid separately at the shop.","バウチャーにないメニューは、お店で別途お支払いください。","凭证上没有的项目请在店内另行付款。","憑證上沒有的項目請在店內另行付款。","Lo que no esté en este bono se paga aparte en la tienda."),
 vT:T6("모바일 바우처","Mobile voucher","モバイルバウチャー","电子凭证","電子憑證","Bono móvil"),
 vChg:T6("{t} 바뀜","Changed {t}","{t} 変更","{t} 已更改","{t} 已變更","Cambiado {t}"),
 vNone:T6("고른 메뉴가 없습니다.","No menu items chosen.","選んだメニューはありません。","未选择任何项目。","未選擇任何項目。","No elegiste nada del menú."),
 chg:T6("모델 바꾸기","Change selection","内容を変更","更改选择","更改選擇","Cambiar selección"),
 done:T6("투어 완료","Tour done","ツアー完了","导览完成","導覽完成","Tour completado"),
 doneW:T6("투어가 시작되는 {t}부터 누를 수 있습니다.","You can tap this from {t} (Korea time), when the tour starts.","ツアーが始まる{t}から押せます。","导览开始的{t}起可点击。","導覽開始的{t}起可點擊。","Podrás pulsarlo desde las {t} (hora de Corea), cuando empiece el tour."),
 doneN:T6("가게에서 받을 것을 다 받았으면 「투어 완료」를 눌러 주세요.","Once you’ve received everything at the shop, tap “Tour done”.","お店ですべて受け取ったら「ツアー完了」を押してください。","在店里拿到所有东西后，请点击「导览完成」。","在店裡拿到所有東西後，請點擊「導覽完成」。","Cuando hayas recibido todo en la tienda, pulsa «Tour completado»."),
 doneQ:T6("투어를 완료로 표시할까요? 표시한 뒤에는 바우처를 바꿀 수 없습니다.","Mark the tour as done? After that, the voucher can’t be changed.","ツアーを完了にしますか？完了にした後はバウチャーを変更できません。","将导览标记为完成吗？标记后将无法更改凭证。","將導覽標記為完成嗎？標記後將無法變更憑證。","¿Marcar el tour como completado? Después no podrás cambiar el bono."),
 doneOk:T6("투어 완료","Tour done","ツアー完了","导览已完成","導覽已完成","Tour completado"),
 cur:T6("지금 바우처","Current voucher","現在のバウチャー","当前凭证","目前憑證","Bono actual"),
 nxt:T6("바꾼 뒤","After the change","変更後","更改后","變更後","Después del cambio"),
 up:T6("추가 결제","Additional payment","追加決済","追加付款","追加付款","Pago adicional"),
 dn:T6("결제한 카드로 환불","Refund to the card you paid with","決済したカードへ返金","退款至付款银行卡","退款至付款卡片","Reembolso a la tarjeta con la que pagaste"),
 eq:T6("금액은 그대로입니다.","The amount stays the same.","金額は変わりません。","金额不变。","金額不變。","El importe no cambia."),
 goUp:T6("{a} 결제하고 바꾸기","Pay {a} and change","{a}を決済して変更","付款 {a} 并更改","付款 {a} 並變更","Pagar {a} y cambiar"),
 goDn:T6("바꾸기 · 환불 {a}","Change · refund {a}","変更・返金 {a}","更改 · 退款 {a}","變更 · 退款 {a}","Cambiar · reembolso de {a}"),
 go:T6("바꾸기","Change","変更する","更改","變更","Cambiar"),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 gN:T6("손님과 함께 고른 뒤 누르세요. 바뀐 바우처는 가게에 문자로 갑니다.","Choose together with the traveler, then tap. The new voucher is sent to the shop by text message.","お客様と一緒に選んでから押してください。変更したバウチャーはお店にSMSで届きます。","请与旅客一起选择后再点击。更改后的凭证会以短信发送给店家。","請與旅客一起選擇後再點擊。變更後的憑證會以簡訊傳送給店家。","Elige junto con el viajero y luego pulsa. El nuevo bono se envía a la tienda por SMS."),
 cN:T6("바뀐 바우처는 가게에 바로 전해집니다.","The new voucher is sent to the shop right away.","変更したバウチャーはすぐにお店に届きます。","更改后的凭证会立即发送给店家。","變更後的憑證會立即傳送給店家。","El nuevo bono se envía a la tienda enseguida."),
 okT:T6("바우처를 바꿨습니다.","The voucher has been changed.","バウチャーを変更しました。","凭证已更改。","憑證已變更。","El bono se ha cambiado."),
 rfOk:T6("결제한 카드로 환불: {a}","Refunded to your card: {a}","決済したカードへ返金：{a}","已退款至付款银行卡：{a}","已退款至付款卡片：{a}","Reembolsado a tu tarjeta: {a}"),
 rfW:T6("환불 {a}은 확인한 뒤 처리해 드립니다.","We’ll process the {a} refund after checking.","返金 {a} は確認後に処理いたします。","退款 {a} 将在确认后为您处理。","退款 {a} 將在確認後為您處理。","Tramitaremos el reembolso de {a} tras comprobarlo."),
 eAgain:T6("그사이 바우처가 바뀌었습니다. 다시 열어 주세요.","The voucher was just changed. Please open it again.","その間にバウチャーが変更されました。もう一度開いてください。","凭证刚刚已被更改，请重新打开。","憑證剛剛已被變更，請重新開啟。","El bono acaba de cambiar. Ábrelo de nuevo."),
 eSame:T6("바뀐 것이 없습니다.","Nothing has changed.","変更はありません。","没有任何更改。","沒有任何變更。","No has cambiado nada."),
 eDone:T6("투어 완료 뒤에는 바꿀 수 없습니다.","It can’t be changed after the tour is done.","ツアー完了後は変更できません。","导览完成后无法更改。","導覽完成後無法變更。","No se puede cambiar después de completar el tour."),
 eStat:T6("확정된 예약만 바꿀 수 있습니다.","Only confirmed bookings can be changed.","確定した予約のみ変更できます。","只能更改已确认的预约。","只能變更已確認的預約。","Solo se pueden cambiar reservas confirmadas."),
 eNot:T6("가이드가 예약을 수락한 뒤에 바꿀 수 있습니다.","You can change it after the guide accepts the booking.","ガイドが予約を承諾した後に変更できます。","向导接受预约后才能更改。","嚮導接受預約後才能變更。","Podrás cambiarlo cuando el guía acepte la reserva."),
 eBusy:T6("처리 중입니다. 잠시 뒤 다시 해 주세요.","Still processing. Please try again shortly.","処理中です。しばらくしてからもう一度お試しください。","正在处理，请稍后再试。","正在處理，請稍後再試。","Se está procesando. Inténtalo de nuevo en un momento."),
 eMenu:T6("가게 메뉴가 바뀌었습니다. 다시 골라 주세요.","The shop menu has changed. Please choose again.","お店のメニューが変わりました。もう一度選んでください。","店铺菜单已更改，请重新选择。","店家菜單已變更，請重新選擇。","El menú de la tienda ha cambiado. Vuelve a elegir."),
 err:T6("잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Inténtalo de nuevo en un momento."),
 load:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 opn:T6("결제창을 여는 중…","Opening the payment window…","決済画面を開いています…","正在打开付款窗口…","正在開啟付款視窗…","Abriendo la ventana de pago…"),
 old:T6("지금은 메뉴에 없음","No longer on the menu","現在はメニューにありません","目前已不在菜单上","目前已不在菜單上","Ya no está en el menú"),
 pfail:T6("결제가 끝나지 않아 바우처는 그대로입니다.","The payment wasn’t completed, so the voucher stays the same.","決済が完了しなかったため、バウチャーは変わりません。","付款未完成，凭证保持不变。","付款未完成，憑證保持不變。","El pago no se completó, así que el bono sigue igual.")};
// ── 모양 (앱 #shopBox · 홈페이지 #pcPk · 내 예약 · 대화방 · 가운데 창) — 초록(앱 주요 색)·노랑(보조) ──
(function(){ var s=document.createElement("style"); s.textContent=""
 +".smnl{display:flex;flex-direction:column;gap:0}.smnl .smni{display:flex;gap:10px;align-items:center;padding:9px 0;border-top:1px solid rgba(0,0,0,.07)}.smnl .smni:first-child{border-top:0}"
 +".smni img{width:52px;height:52px;border-radius:10px;object-fit:cover;flex:0 0 auto;background:#efece4}.smni .smnb{flex:1;min-width:0}.smni .smnb b{display:block;font-size:15px;line-height:1.35}.smni .smnpr{font-weight:900;font-size:15px;white-space:nowrap}"
 +".smtag{display:inline-block;font-size:11.5px;font-weight:800;border-radius:6px;padding:1px 7px;margin-top:3px}.smtag.a{background:#e8f6ee;color:#1f7a5a}.smtag.s{background:#fff4d6;color:#8a5a00}.smtag.o{background:#f1f3f5;color:#667085}"
 +".smnp{border:1.5px solid #b7e1c8;background:#f6fbf8;border-radius:12px;padding:10px 12px;margin:10px 0;color:#1d2433}.smnp .smnh{font-weight:900;font-size:14.5px;margin-bottom:2px}.smnp .smnh small{display:block;font-weight:600;color:#667085;font-size:12px}"
 +".smnp button.smo{display:flex;width:100%;gap:10px;align-items:center;text-align:left;border:1.5px solid #e4e0d6;background:#fff;color:#1d2433;border-radius:10px;padding:8px 10px;margin-top:6px;cursor:pointer;font:inherit}"
 +".smnp button.smo.on{border-color:#1f7a5a;box-shadow:inset 0 0 0 1px #1f7a5a;background:#eefaf3}.smnp button.smo i{flex:0 0 auto;width:18px;height:18px;border-radius:50%;border:2px solid #adb5bd;box-sizing:border-box}.smnp button.smo.on i{border:6px solid #1f7a5a}"
 +".smnp button.smo img{width:40px;height:40px;border-radius:8px;object-fit:cover;flex:0 0 auto}.smnp button.smo .smnb{flex:1;min-width:0}.smnp button.smo .smnb b{display:block;font-size:14px;line-height:1.35}.smnp button.smo .smnb span{font-size:13px;color:#344054;font-weight:700}"
 +".smnp .smq{display:flex;gap:10px;align-items:center;border:1.5px solid #e4e0d6;background:#fff;border-radius:10px;padding:8px 10px;margin-top:6px}.smnp .smq.on{border-color:#1f7a5a;background:#eefaf3}.smnp .smq img{width:40px;height:40px;border-radius:8px;object-fit:cover;flex:0 0 auto}.smnp .smq .smnb{flex:1;min-width:0}.smnp .smq .smnb b{display:block;font-size:14px;line-height:1.35}.smnp .smq .smnb span{font-size:13px;color:#344054;font-weight:700}"
 +".smst{display:flex;align-items:center;gap:6px;flex:0 0 auto}.smst button{width:30px;height:30px;border-radius:50%;border:1.5px solid #adb5bd;background:#fff;color:#1d2433;font-size:17px;font-weight:900;line-height:1;cursor:pointer;padding:0}.smst b{min-width:18px;text-align:center;font-size:15px}"
 +".smnt{margin-top:8px;font-size:13.5px}.smnt div{display:flex;justify-content:space-between;gap:10px;padding:2px 0}.smnt span{color:#475467}.smnn{font-size:12.5px;color:#667085;margin:6px 0 0;line-height:1.5}"
 +".smv{border:2px dashed #1f7a5a;border-radius:14px;padding:11px 12px;margin:10px 0 0;background:#fbfffc;color:#1d2433}.smv .smvh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:14.5px}.smv .smvh small{color:#667085;font-size:12px;font-weight:700}"
 +".smv .smvi{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid #e3efe8;font-size:14px}.smv .smvi:first-of-type{border-top:0}.smv .smvi b{font-size:14px}.smv .smvt{border-top:1.5px solid #1d2433;margin-top:4px;padding-top:6px;font-size:13.5px}.smv .smvt div{display:flex;justify-content:space-between;gap:10px;padding:1px 0}.smv .smvt span{color:#475467}"
 +".smv .smbtn{display:block;width:100%;border:0;border-radius:11px;background:#1f7a5a;color:#fff;font-size:15px;font-weight:900;padding:11px;margin-top:9px;cursor:pointer;font-family:inherit}.smv .smbtn.g2{background:#fff;color:#1f7a5a;border:1.5px solid #1f7a5a}.smv .smbtn:disabled{opacity:.45;cursor:default}"
 +".smv .smok{border:1px solid #b2f2bb;background:#ebfbee;color:#2b8a3e;border-radius:10px;padding:8px 10px;font-weight:800;margin-top:9px;font-size:14px}.smv .smsm{font-size:12.5px;color:#667085;margin-top:5px;line-height:1.5}"
 +"#smnM{position:fixed;inset:0;z-index:2147483005;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}"
 +"#smnM .in{background:#fff;color:#1d2433;width:100%;max-width:520px;max-height:90vh;max-height:90dvh;overflow:auto;border-radius:18px;padding:16px 14px 14px;box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI','Malgun Gothic',sans-serif;word-break:keep-all;overflow-wrap:anywhere}"
 +"#smnM h3{margin:0 0 4px;font-size:18px}#smnM .sub{color:#667085;font-size:13px}#smnM .smnp{margin:10px 0}#smnM .smdf{border-radius:12px;background:#fff9db;border:1px solid #ffe066;padding:10px 12px;margin:10px 0;font-size:14.5px}#smnM .smdf div{display:flex;justify-content:space-between;gap:10px;padding:2px 0}"
 +"#smnM .smdf .big{font-weight:900;font-size:16px}#smnM .row{display:flex;gap:8px;margin-top:10px}#smnM .row button{flex:1;border:0;border-radius:12px;padding:12px;font-size:15.5px;font-weight:900;cursor:pointer;font-family:inherit}#smnM .row .pri{background:#1f7a5a;color:#fff}#smnM .row .sec{flex:0 0 auto;min-width:84px;background:#fff;color:#495057;border:1.5px solid #adb5bd}"
 +"#smnM .row button:disabled{opacity:.45;cursor:default}#smnM .err{color:#c92a2a;font-weight:800;font-size:13.5px;margin-top:8px}#smnM .ok{border:1px solid #b2f2bb;background:#ebfbee;color:#2b8a3e;border-radius:12px;padding:12px;font-weight:800;margin-top:10px;line-height:1.55}";
 document.head.appendChild(s); })();

// ── 상품의 메뉴 (허브 /shop/products 의 mn) · 손님이 고른 것(이 화면 동안) ──
var MN={}, PK={};
function load(items){ (items||[]).forEach(function(x){ if(!x||!x.id) return; var m=x.mn&&x.mn.items&&x.mn.items.length?x.mn:null; MN[x.id]=m;
  var k=PK[x.id]; if(k){ Object.keys(k).forEach(function(id){ if(!m||!m.items.some(function(y){ return y.id===id; })) delete k[id]; }); } }); }   // 없어진 메뉴는 고른 것에서도 뺀다
function of(pid){ return MN[pid]||null; }
function picks(pid){ return PK[pid]||(PK[pid]={}); }
function linesOf(m,k){ if(!m) return []; return m.items.filter(function(x){ return (k[x.id]||0)>0; }).map(function(x){ return {id:x.id,t:x.t,price:x.price,q:m.mode==="multi"?k[x.id]:1,at:x.at,img:x.img}; }); }
function sums(ls){ var a=0,d=0; ls.forEach(function(x){ var v=x.price*x.q; if(x.at==="shop") d+=v; else a+=v; }); return {app:a,dir:d}; }
function appSum(p){ return p?sums(linesOf(of(p.id),picks(p.id))).app:0; }
function body(p){ return p?linesOf(of(p.id),picks(p.id)).map(function(x){ return {id:x.id,q:x.q}; }):[]; }
function setPicks(pid,a){ var k=PK[pid]={}; (a||[]).forEach(function(x){ if(x&&x.id&&x.q>0) k[x.id]=x.q; }); }
function img(x){ return x.img?'<img src="'+esc(HB+"/shop/img/"+x.img)+'" alt="" loading="lazy">':''; }
function tag(at){ return '<span class="smtag '+(at==="shop"?"s":"a")+'">'+esc(L(at==="shop"?TX.tagS:TX.tagA))+'</span>'; }
// 상세 화면 「가게 메뉴」 칸 — 값 안내 (고르기는 예약·결제 칸에서)
function detHtml(p){ var m=p&&of(p.id); if(!m) return "";
  return '<section class="shbx smn-d"><h2>'+esc(L(TX.mT))+'</h2><p class="snote">'+esc(L(m.mode==="multi"?TX.multi:TX.one))+' '+esc(L(TX.detN))+'</p><div class="smnl">'
    +m.items.map(function(x){ return '<div class="smni">'+img(x)+'<div class="smnb"><b>'+esc(L(x.t))+'</b>'+tag(x.at)+'</div><span class="smnpr">'+won(x.price)+'</span></div>'; }).join("")
    +'</div><p class="snote">'+esc(L(TX.out))+'</p></section>'; }
// 고르는 칸 — m(메뉴)·k(고른 것)·key(누르면 바꿀 자리) · 결제 칸과 「모델 바꾸기」 창이 같이 쓴다
function pickBox(m,k,key,extra){ var h='<div class="smnp"><div class="smnh">'+esc(L(TX.pick))+'<small>'+esc(L(m.mode==="multi"?TX.multi:TX.one))+'</small></div>';
  if(m.mode==="multi") h+=m.items.map(function(x){ var q=k[x.id]||0; return '<div class="smq'+(q?" on":"")+'">'+img(x)+'<div class="smnb"><b>'+esc(L(x.t))+'</b><span>'+won(x.price)+'</span> '+tag(x.at)+(x.old?' <span class="smtag o">'+esc(L(TX.old))+'</span>':'')+'</div>'
      +'<div class="smst"><button type="button" data-smq="'+esc(key+"|"+x.id+"|-1")+'" aria-label="-">−</button><b>'+q+'</b><button type="button" data-smq="'+esc(key+"|"+x.id+"|1")+'" aria-label="+">+</button></div></div>'; }).join("");
  else { var any=m.items.some(function(x){ return k[x.id]>0; });
    h+='<button type="button" class="smo'+(any?"":" on")+'" data-smo="'+esc(key+"|")+'"><i></i><span class="smnb"><b>'+esc(L(TX.none))+'</b></span></button>'
      +m.items.map(function(x){ var on=k[x.id]>0; return '<button type="button" class="smo'+(on?" on":"")+'" data-smo="'+esc(key+"|"+x.id)+'"><i></i>'+img(x)+'<span class="smnb"><b>'+esc(L(x.t))+'</b><span>'+won(x.price)+'</span> '+tag(x.at)+(x.old?' <span class="smtag o">'+esc(L(TX.old))+'</span>':'')+'</span></button>'; }).join(""); }
  return h+(extra||"")+'<p class="smnn">'+esc(L(TX.out))+'</p></div>'; }
function totRows(tour,s){ return '<div class="smnt"><div><span>'+esc(L(TX.tour))+'</span><b>'+won(tour)+'</b></div><div><span>'+esc(L(TX.appL))+'</span><b>'+won(s.app)+'</b></div>'+(s.dir?'<div><span>'+esc(L(TX.dirL))+'</span><b>'+won(s.dir)+'</b></div>':'')+'</div>'; }
// 예약·결제 칸 (앱 shop.js sideHtml · 홈페이지 pc_pkg.js boxHtml) — tour = 패키지 여행비(인원 반영)
function pickHtml(p,tour){ var m=p&&of(p.id); if(!m) return ""; var k=picks(p.id); return pickBox(m,k,"p:"+p.id,totRows(tour,sums(linesOf(m,k)))); }
// 결제창(mockPay) — 고른 메뉴 줄
function payRows(p,tour){ var m=p&&of(p.id); if(!m) return ""; var ls=linesOf(m,picks(p.id)), s=sums(ls);
  return '<div class="smnt" style="margin-top:6px">'+ls.map(function(x){ return '<div><span>'+esc(L(x.t))+' × '+x.q+(x.at==="shop"?' · '+esc(L(TX.tagS)):'')+'</span><b>'+won(x.price*x.q)+'</b></div>'; }).join("")
    +'<div><span>'+esc(L(TX.tour))+'</span><b>'+won(tour)+'</b></div><div><span>'+esc(L(TX.appL))+'</span><b>'+won(s.app)+'</b></div>'+(s.dir?'<div><span>'+esc(L(TX.dirL))+'</span><b>'+won(s.dir)+'</b></div>':'')+'</div>'; }

// ── 바우처 (손님 「내 예약」 near.js bkCard · 홈페이지 pc_bk.js · 대화방 예약 내용 chat.js) ──
function startMs(x){ var t=Date.parse(String(x.date||"")+"T"+(/^\d\d:\d\d$/.test(x.time||"")?x.time:"00:00")+":00+09:00"); return isFinite(t)?t:0; }
function whenTx(ms){ try{ if(window.NEARBK&&NEARBK.when) return NEARBK.when(ms); }catch(e){} return new Date(ms+9*36e5).toISOString().slice(5,16).replace("T"," "); }
function vLines(m){ return (m.items.length?m.items.map(function(x){ return '<div class="smvi"><div><b>'+esc(L(x.t))+'</b> × '+x.q+'<br>'+tag(x.at)+'</div><b>'+won(x.price*x.q)+'</b></div>'; }).join(""):'<div class="smsm" style="margin:6px 0">'+esc(L(TX.vNone))+'</div>')
  +'<div class="smvt">'+(m.tAmt?'<div><span>'+esc(L(TX.tour))+'</span><b>'+won(m.tAmt)+'</b></div>':'')+'<div><span>'+esc(L(TX.appL))+'</span><b>'+won(m.app)+'</b></div>'+(m.dir?'<div><span>'+esc(L(TX.dirL))+'</span><b>'+won(m.dir)+'</b></div>':'')+'</div>'
  +'<div class="smsm">'+esc(L(TX.out))+'</div>'; }
function vHead(m,oid){ return '<div class="smvh"><b>🎫 '+esc(L(TX.vT))+'</b><small>'+(m.v>1?esc(F(TX.vChg,{t:String(m.at||"").slice(5)})):'')+(oid?(m.v>1?' · ':'')+esc(oid):'')+'</small></div>'; }
function vchHtml(x){ var m=x&&x.menu; if(!m) return ""; var cx=x.status==="cancelled"||x.status==="refunded", h='<div class="smv">'+vHead(m,"")+vLines(m);
  if(!cx&&x.tk){ if(!m.lock) h+='<button type="button" class="smbtn g2" data-smchg="'+esc(x.tk)+'">'+esc(L(TX.chg))+'</button>';
    if(x.done) h+='<div class="smok">✓ '+esc(L(TX.doneOk))+'</div>';
    else if(x.g&&(x.status==="paid"||x.status==="confirmed")){ var st=startMs(x), can=Date.now()>=st; h+='<button type="button" class="smbtn" data-smdone="'+esc(x.tk)+'"'+(can?'':' disabled')+'>'+esc(L(TX.done))+'</button><div class="smsm">'+esc(can?L(TX.doneN):F(TX.doneW,{t:whenTx(st)}))+'</div>'; } }
  return h+'</div>'; }
function sumHtml(sm,side){ var m=sm&&sm.menu; if(!m) return ""; var cx=sm.status==="cancelled"||sm.status==="refunded";
  return '<div class="smv" style="margin:8px 0 2px">'+vHead(m,"")+vLines(m)+(side==="g"&&!cx&&!m.lock?'<button type="button" class="smbtn g2" data-smchgg="'+esc(sm.oid)+'">'+esc(L(TX.chg))+'</button>':'')+(m.lock==="done"?'<div class="smok">✓ '+esc(L(TX.doneOk))+'</div>':'')+'</div>'; }

// ── 「모델 바꾸기」 가운데 창 — o = {side:"c", tk} | {side:"g", oid} ──
var MC=null;
function api(o,b){ if(o.side==="g") return post("/guide/gme",Object.assign({sess:sess(),op:"mchg",oid:o.oid},b)); return post("/shop/mchg",Object.assign({tk:o.tk},b)); }
function pgOn(){ return !!(window.TPG&&TPG.on); }
function shell(){ var b=document.getElementById("smnM"); if(!b){ b=document.createElement("div"); b.id="smnM"; b.onclick=function(e){ if(e.target===b&&!(MC&&MC.busy)) closeM(); }; document.body.appendChild(b); } return b; }
function closeM(){ var b=document.getElementById("smnM"); if(b) b.remove(); MC=null; }
function eTx(e){ var pe=window.TPG&&TPG.errTx?TPG.errTx(e):""; return pe||L(e==="again"?TX.eAgain:e==="same"?TX.eSame:e==="done"?TX.eDone:e==="status"?TX.eStat:e==="notyet"?TX.eNot:e==="busy"?TX.eBusy:e==="menu"?TX.eMenu:TX.err); }
function openChg(o){ MC={o:o,j:null,k:{},busy:false,msg:"",res:null}; var b=shell(); b.innerHTML='<div class="in"><h3>'+esc(L(TX.chg))+'</h3><div class="sub">'+esc(L(TX.load))+'</div></div>';
  api(o,{sub:"menu"}).then(function(j){ if(!MC||MC.o!==o) return; if(!(j&&j.ok)){ MC.err=eTx(j&&j.err); paintM(); return; }
    MC.j=j; MC.k={}; (j.cur||[]).forEach(function(x){ MC.k[x.id]=x.q; }); paintM(); }).catch(function(){ if(MC){ MC.err=L(TX.err); paintM(); } }); }
function paintM(){ var b=document.getElementById("smnM"); if(!b||!MC) return; var j=MC.j, h='<div class="in"><h3>'+esc(L(TX.chg))+'</h3>';
  if(!j){ b.innerHTML=h+'<div class="err">'+esc(MC.err||L(TX.err))+'</div><div class="row"><button type="button" class="sec" data-smm="x">'+esc(L(TX.x))+'</button></div></div>'; return; }
  var m={mode:j.mode,items:j.base}, nl=linesOf(m,MC.k), ns=sums(nl), d=ns.app-(j.app||0);
  h+='<div class="sub">'+esc((MC.o.side==="g"?(j.pnameKo||j.pname):j.pname)+" · "+j.date+" "+(j.time||"")+" (KST)")+'</div>';
  if(MC.res){ var r=MC.res; h+='<div class="ok">✓ '+esc(L(TX.okT))+(r.refund&&r.refund.pg?'<br>'+esc(F(TX.rfOk,{a:won(r.refund.pg)})):'')+(r.refund&&r.refund.fail?'<br>'+esc(F(TX.rfW,{a:won(r.refund.fail)})):'')+'</div>'
      +(r.menu?'<div class="smv">'+vHead(r.menu,"")+vLines(r.menu)+'</div>':'')+'<div class="row"><button type="button" class="pri" data-smm="x">'+esc(L(TX.x))+'</button></div></div>'; b.innerHTML=h; return; }
  h+=pickBox(m,MC.k,"m:")
   +'<div class="smdf"><div><span>'+esc(L(TX.cur))+'</span><b>'+won(j.app||0)+'</b></div><div><span>'+esc(L(TX.nxt))+'</span><b>'+won(ns.app)+'</b></div>'
   +'<div class="big"><span>'+esc(d>0?L(TX.up):d<0?L(TX.dn):L(TX.eq))+'</span><b>'+(d?won(Math.abs(d)):'')+'</b></div>'+(ns.dir?'<div><span>'+esc(L(TX.dirL))+'</span><b>'+won(ns.dir)+'</b></div>':'')+'</div>'
   +'<div class="sub">'+esc(L(MC.o.side==="g"?TX.gN:TX.cN))+'</div>'+(MC.msg?'<div class="err">'+esc(MC.msg)+'</div>':'')
   +'<div class="row"><button type="button" class="sec" data-smm="x"'+(MC.busy?' disabled':'')+'>'+esc(L(TX.x))+'</button><button type="button" class="pri" data-smm="go"'+(MC.busy?' disabled':'')+'>'+esc(MC.busy===2?L(TX.opn):MC.busy?L(TX.load):d>0?F(TX.goUp,{a:won(d)}):d<0?F(TX.goDn,{a:won(-d)}):L(TX.go))+'</button></div></div>';
  b.innerHTML=h; }
function doneVch(o,r){ try{ if(o.side==="c"&&window.NEARBK&&r&&r.oid){ var x=NEARBK.get(r.oid); if(x&&x.tk) NEARBK.put({oid:r.oid,tk:x.tk,menu:r.menu,amount:r.amount}); if(NEARBK.srv) NEARBK.srv(true); } }catch(e){}
  try{ document.dispatchEvent(new CustomEvent("smnvch",{detail:{oid:r&&r.oid}})); }catch(e){} }
function applyM(){ if(!MC||!MC.j||MC.busy) return; var o=MC.o, j=MC.j, m={mode:j.mode,items:j.base}, items=linesOf(m,MC.k).map(function(x){ return {id:x.id,q:x.q}; });
  MC.busy=1; MC.msg=""; paintM();
  api(o,{sub:"apply",items:items,v:j.v,pg:pgOn()?1:0}).then(function(r){ if(!MC||MC.o!==o) return;
    if(r&&r.ok&&r.pay==="pg"){ MC.busy=2; paintM();   // 차액 결제 — KG이니시스 결제창 (돌아오면 아래 TPG.onRet("mchg"))
      return TPG.go(r,{kind:"mchg",side:o.side,tk:o.tk||"",oid:o.oid||j.oid,pname:j.pname,pnameKo:j.pnameKo,date:j.date,time:j.time},r.cu||{}).then(function(e){ if(e&&MC){ MC.busy=false; MC.msg=e; paintM(); } }); }
    MC.busy=false; if(r&&r.ok){ MC.res=r; paintM(); doneVch(o,r); return; }
    MC.msg=eTx(r&&r.err); if(r&&(r.err==="again"||r.err==="menu")){ MC.j=null; openChg(o); return; } paintM(); }).catch(function(){ if(MC){ MC.busy=false; MC.msg=L(TX.err); paintM(); } }); }
// 결제창에서 돌아옴 (tpg.js → 허브 /shop/port/confirm 이 차액 결제를 확인하고 바우처를 바꾼 뒤)
if(window.TPG) TPG.onRet("mchg",function(v,res){ var o={side:v.side,tk:v.tk,oid:v.oid}; MC={o:o,j:{pname:v.pname,pnameKo:v.pnameKo,date:v.date,time:v.time,base:[],mode:"one",app:0},k:{},busy:false,msg:"",res:null}; shell();
  if(res&&res.ok){ var r=res.j||{}; MC.res={ok:true,menu:r.menu,amount:r.amount,oid:r.orderId,refund:null}; paintM(); doneVch(o,{oid:r.orderId,menu:r.menu,amount:r.amount}); return; }
  MC.j=null; MC.err=(res&&res.err==="wait"&&window.TPG?TPG.resTx(res):"")||(res&&res.err==="again"?L(TX.eAgain):L(TX.pfail)); paintM(); });
// 「투어 완료」 (가게 메뉴가 있는 패키지) — 허브 /guide/booking/done (자유 가이드와 같은 길)
function tourDone(tk,bt){ if(!window.confirm(L(TX.doneQ))) return; if(bt) bt.disabled=true;
  post("/guide/booking/done",{token:tk}).then(function(j){ if(j&&j.ok){ try{ var x=(window.NEARBK&&NEARBK.mine?NEARBK.mine():[]).filter(function(y){ return y.tk===tk; })[0]; if(x){ var mm=x.menu?Object.assign({},x.menu,{lock:"done"}):null; NEARBK.put({oid:x.oid,tk:tk,done:1,menu:mm}); } if(window.NEARBK&&NEARBK.srv) NEARBK.srv(true); }catch(e){}
      try{ document.dispatchEvent(new CustomEvent("smnvch")); }catch(e){} return; }
    if(bt) bt.disabled=false; alert(j&&j.err==="early"&&j.end?F(TX.doneW,{t:whenTx(j.end)}):L(TX.err)); }).catch(function(){ if(bt) bt.disabled=false; alert(L(TX.err)); }); }

// ── 누르기 (document 하나에서) ──
document.addEventListener("click",function(e){ var t=e.target&&e.target.closest?e.target.closest("[data-smo],[data-smq],[data-smchg],[data-smchgg],[data-smdone],[data-smm]"):null; if(!t) return;
  var ds=t.dataset;
  if(ds.smo!=null||ds.smq!=null){ e.preventDefault(); var a=String(ds.smo!=null?ds.smo:ds.smq).split("|"), where=a[0], k, m;
    if(where==="m:"){ if(!MC||!MC.j||MC.busy||MC.res) return; k=MC.k; m={mode:MC.j.mode,items:MC.j.base}; }
    else { var pid=where.replace(/^p:/,""); m=of(pid); if(!m) return; k=picks(pid); }
    if(ds.smo!=null){ Object.keys(k).forEach(function(id){ delete k[id]; }); if(a[1]) k[a[1]]=1; }
    else { var id=a[1], n=Math.max(0,Math.min(99,(k[id]||0)+(+a[2]||0))); if(n) k[id]=n; else delete k[id]; }
    if(where==="m:") paintM(); else { try{ document.dispatchEvent(new CustomEvent("smnchg",{detail:{pid:where.slice(2)}})); }catch(z){} }
    return; }
  if(ds.smchg){ e.preventDefault(); e.stopPropagation(); openChg({side:"c",tk:ds.smchg}); return; }
  if(ds.smchgg){ e.preventDefault(); e.stopPropagation(); openChg({side:"g",oid:ds.smchgg}); return; }
  if(ds.smdone){ e.preventDefault(); e.stopPropagation(); tourDone(ds.smdone,t); return; }
  if(ds.smm==="x"){ if(MC&&MC.busy) return; closeM(); return; }
  if(ds.smm==="go") applyM(); },true);

window.SMN={load:load,of:of,appSum:appSum,body:body,setPicks:setPicks,detHtml:detHtml,pickHtml:pickHtml,payRows:payRows,vchHtml:vchHtml,sumHtml:sumHtml,open:openChg,done:tourDone,tx:function(k){ return TX[k]?L(TX[k]):""; }};
})();
