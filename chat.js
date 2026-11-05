/* 머니퍼즐 투어 — 손님 ↔ 가이드 대화방 (사장님 2026-11-05 「만들자」)
 *  · 머리줄 💬 말풍선(#hit) = 탭 두 개 「가이드 대화」·「통역」. 예약도 대화방도 없는 사람(대부분 손님)은 지금처럼 통역이 바로 열린다
 *  · 안 읽은 메시지가 있으면 말풍선에 빨간 숫자 · 「내 예약」 카드(near.js)의 「가이드와 대화」 단추도 같은 방(CHAT.room)
 *  · 방 하나 = 예약 하나. 자유 가이드(gbk) 방 맨 위 = 예약 내용 · 대화 · 「투어 완료」(끝나는 시각 뒤 켜짐) · 완료 뒤 같은 방에서 별점·후기
 *    패키지 방 = 가이드가 수락한 순간 ~ 그날 끝(그 뒤 읽기 전용) · 자동 번역 없음(사장님 「가이드와 대화인데 자동번역은 빼」)
 *  · 손님 = 예약한 폰의 예약 토큰(localStorage mpv_gbk_v1, near.js 와 같이 씀) · 가이드 = 구글·애플 로그인(pg.js mpv_pg_sess) 이메일이 등록 가이드 이메일과 같으면
 *  · 알림: 손님은 「알림 받기」를 누르면 웹 푸시(sw.js) — 앱이 꺼져 있어도. 허브가 안 되면 메일·문자로
 *  · 허브: POST /guide/chat (손님) · POST /guide/gme (가이드) · GET /guide/chat/vapid · POST /guide/booking/done · POST /guide/review
 *  · 주소: ?gchat=<예약 토큰>(그 방) · ?gchat=1(말풍선 창) · ?gme=1(가이드 화면)
 */
(function(){
"use strict";
var HB=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L(o){ return o[window.LANG]||o.en; }
function F(o,m){ var s=L(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function post(p,b){ return fetch(HB+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),cache:"no-store"}).then(function(r){ return r.json(); }); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function sess(){ return ls("mpv_pg_sess")||""; }
function bks(){ try{ return window.NEARBK?NEARBK.all():[]; }catch(e){ return []; } }
function isG(){ return !!sess()&&ls("mpv_isguide")==="1"; }
function hm(ms){ return new Date((+ms||0)+9*36e5).toISOString().slice(11,16); }
function won(x){ return "₩"+Number(x||0).toLocaleString("ko-KR"); }
var TX={
 tChat:T6("가이드 대화","Guide chat","ガイドとチャット","向导聊天","嚮導聊天","Chat con guía"),
 tInt:T6("통역","Interpreter","通訳","翻译","翻譯","Intérprete"),
 my:T6("내 예약 대화방","My booking chats","私の予約チャット","我的预约聊天","我的預約聊天","Chats de mis reservas"),
 none:T6("아직 대화방이 없습니다. 투어 가이드에서 가이드를 예약하면 여기에 방이 생깁니다.","No chats yet. When you book a guide under Tour guide, a chat room appears here.","まだチャットはありません。ツアーガイドでガイドを予約するとここにルームができます。","还没有聊天室。在「旅游向导」预约向导后，这里会出现聊天室。","還沒有聊天室。在「旅遊嚮導」預約嚮導後，這裡會出現聊天室。","Aún no hay chats. Cuando reserves un guía en Guía turístico, aparecerá una sala aquí."),
 gScr:T6("가이드 화면","Guide screen","ガイド画面","向导页面","嚮導頁面","Pantalla de guía"),
 gLogin:T6("가이드로 등록한 이메일과 같은 구글·애플 계정으로 로그인해 주세요.","Please sign in with the Google or Apple account that uses the email you registered as a guide.","ガイド登録したメールと同じGoogle・Appleアカウントでログインしてください。","请使用与向导登记邮箱相同的Google或Apple账号登录。","請使用與嚮導登記電郵相同的Google或Apple帳號登入。","Inicia sesión con la cuenta de Google o Apple que usa el correo con el que te registraste como guía."),
 gLoginB:T6("로그인","Sign in","ログイン","登录","登入","Iniciar sesión"),
 gNot:T6("이 계정의 이메일은 등록된 가이드 이메일과 다릅니다. 등록한 이메일의 계정으로 로그인해 주세요.","This account's email does not match a registered guide. Please sign in with the account of your registered email.","このアカウントのメールは登録ガイドのメールと異なります。登録したメールのアカウントでログインしてください。","该账号的邮箱与已登记的向导邮箱不同。请使用登记邮箱的账号登录。","該帳號的電郵與已登記的嚮導電郵不同。請使用登記電郵的帳號登入。","El correo de esta cuenta no coincide con ningún guía registrado. Inicia sesión con la cuenta de tu correo registrado."),
 gUp:T6("다가올 예약","Upcoming","今後の予約","即将到来","即將到來","Próximas"),
 gPast:T6("지난 예약","Past","過去の予約","已结束","已結束","Pasadas"),
 gNone:T6("아직 예약이 없습니다.","No bookings yet.","まだ予約はありません。","暂无预约。","暫無預約。","Aún no hay reservas."),
 pend:T6("수락을 기다리는 패키지 예약","Package booking waiting for your answer","承諾待ちのパッケージ予約","等待您接受的套餐预约","等待您接受的套餐預約","Reserva de paquete pendiente de tu respuesta"),
 acc:T6("수락","Accept","承諾","接受","接受","Aceptar"), rej:T6("거절","Decline","辞退","拒绝","拒絕","Rechazar"),
 rejQ:T6("이 예약을 거절할까요? 다른 가이드에게 넘어갑니다.","Decline this booking? It will go to another guide.","この予約を辞退しますか？別のガイドに回ります。","要拒绝此预约吗？将转给其他向导。","要拒絕此預約嗎？將轉給其他嚮導。","¿Rechazar esta reserva? Pasará a otro guía."),
 accQ:T6("이 예약을 수락할까요? 손님에게 확정 안내가 갑니다.","Accept this booking? The traveler will be notified.","この予約を承諾しますか？お客様に確定のご案内が届きます。","要接受此预约吗？旅客将收到确认通知。","要接受此預約嗎？旅客將收到確認通知。","¿Aceptar esta reserva? Se avisará al viajero."),
 accd:T6("수락함","Accepted","承諾済み","已接受","已接受","Aceptada"),
 open:T6("대화","Chat","チャット","聊天","聊天","Chat"),
 back:T6("목록","List","一覧","列表","列表","Lista"),
 ph:T6("메시지 (500자까지)","Message (up to 500 characters)","メッセージ（500字まで）","消息（最多500字）","訊息（最多500字）","Mensaje (hasta 500 caracteres)"),
 send:T6("보내기","Send","送信","发送","發送","Enviar"),
 empty:T6("아직 메시지가 없습니다. 먼저 인사해 보세요.","No messages yet. Say hello!","まだメッセージはありません。あいさつしてみましょう。","还没有消息，先打个招呼吧。","還沒有訊息，先打個招呼吧。","Aún no hay mensajes. ¡Saluda!"),
 ro:T6("이 대화방은 읽기 전용입니다 (예약이 끝났습니다).","This chat is read-only (the booking has ended).","このチャットは閲覧のみです（予約は終了しました）。","此聊天室为只读（预约已结束）。","此聊天室為唯讀（預約已結束）。","Este chat es de solo lectura (la reserva terminó)."),
 sum:T6("예약 내용","Booking","予約内容","预约内容","預約內容","Reserva"),
 dt:T6("날짜·시간","Date & time","日時","日期·时间","日期·時間","Fecha y hora"),
 endL:T6("끝나는 시간","Ends at","終了時刻","结束时间","結束時間","Termina a las"),
 ppl:T6("인원","People","人数","人数","人數","Personas"),
 amt:T6("결제 금액","Amount paid","決済金額","付款金额","付款金額","Importe pagado"),
 oid:T6("주문번호","Order no.","注文番号","订单号","訂單號","N.º de pedido"),
 cust:T6("손님","Traveler","お客様","旅客","旅客","Viajero"),
 bkr:T6("예약자","Booked by","予約者","预订人","預訂人","Reservado por"),   // 손님 쪽 예약자 이름 (11-05)
 lang:T6("손님 언어","Traveler language","お客様の言語","旅客语言","旅客語言","Idioma del viajero"),
 memo:T6("요청","Notes","メモ","备注","備註","Notas"),
 done:T6("투어 완료","Tour done","ツアー完了","导览完成","導覽完成","Tour completado"),
 doneW:T6("투어가 끝나는 {t}부터 누를 수 있습니다.","You can tap this from {t} (Korea time), when the tour ends.","ツアーが終わる{t}から押せます。","导览结束的{t}起可点击。","導覽結束的{t}起可點擊。","Podrás pulsarlo desde las {t} (hora de Corea), cuando termine el tour."),
 doneN:T6("투어가 끝났으면 「투어 완료」를 누르고 가이드 후기를 남겨 주세요.","If your tour is over, tap “Tour done” and leave a review for your guide.","ツアーが終わったら「ツアー完了」を押して、ガイドのレビューを残してください。","导览结束后，请点击「导览完成」并为向导留下评价。","導覽結束後，請點擊「導覽完成」並為嚮導留下評價。","Si tu tour terminó, pulsa «Tour completado» y deja una reseña para tu guía."),
 doneQ:T6("투어를 완료로 표시하고 가이드 후기를 남길까요?","Mark the tour as done and leave a review for your guide?","ツアーを完了にして、ガイドのレビューを書きますか？","将导览标记为已完成并为向导写评价吗？","將導覽標記為已完成並為嚮導寫評價嗎？","¿Marcar el tour como completado y dejar una reseña para tu guía?"),
 doneOk:T6("투어 완료","Tour done","ツアー完了","导览已完成","導覽已完成","Tour completado"),
 rvT:T6("가이드 별점·후기","Rate your guide","ガイドの評価・レビュー","为向导评分·写评价","為嚮導評分·寫評價","Valora a tu guía"),
 rvTx:T6("칭찬 한마디 (선택)","A kind word (optional)","ひとこと（任意）","赞美留言（可选）","讚美留言（可選）","Unas palabras (opcional)"),
 rvNm:T6("이름 또는 이니셜 (선택)","Name or initials (optional)","名前またはイニシャル（任意）","姓名或缩写（可选）","姓名或縮寫（可選）","Nombre o iniciales (opcional)"),
 rvGo:T6("후기 보내기","Submit review","レビューを送る","提交评价","提交評價","Enviar reseña"),
 rvPick:T6("별점을 골라 주세요.","Please choose a star rating.","評価を選んでください。","请选择评分。","請選擇評分。","Elige una valoración."),
 rvThx:T6("후기를 남겨 주셔서 감사합니다.","Thank you for your review.","レビューありがとうございました。","感谢您的评价。","感謝您的評價。","Gracias por tu reseña."),
 push:T6("🔔 새 메시지 알림 받기","🔔 Get new-message alerts","🔔 新着メッセージの通知を受け取る","🔔 接收新消息通知","🔔 接收新訊息通知","🔔 Recibir avisos de mensajes"),
 pushOk:T6("🔔 알림 받는 중","🔔 Alerts on","🔔 通知オン","🔔 已开启通知","🔔 已開啟通知","🔔 Avisos activados"),
 pushNo:T6("이 폰에서는 알림을 켤 수 없습니다. 새 메시지는 메일·문자로 알려 드립니다.","Alerts can't be turned on on this phone. We'll tell you about new messages by email or text.","この端末では通知をオンにできません。新着メッセージはメール・SMSでお知らせします。","此手机无法开启通知。新消息将通过邮件或短信通知您。","此手機無法開啟通知。新訊息將透過電郵或簡訊通知您。","No se pueden activar avisos en este teléfono. Te avisaremos por correo o SMS."),
 err:T6("잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Inténtalo de nuevo en un momento."),
 load:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 me:T6("나","Me","自分","我","我","Yo"),
 gd:T6("가이드","Guide","ガイド","向导","嚮導","Guía"),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 wait:T6("가이드 확정 대기","Waiting for a guide","ガイド確定待ち","等待向导确认","等待嚮導確認","Esperando un guía"),
 noG:T6("가이드가 확정되면 이 방에서 가이드와 대화할 수 있습니다. 확정 소식도 여기에 안내해 드립니다.","Once a guide is confirmed, you can chat with them here. We will post the confirmation here too.","ガイドが確定すると、このルームでガイドとチャットできます。確定のお知らせもここに届きます。","向导确认后，即可在此聊天室与向导聊天。确认消息也会在这里通知您。","嚮導確認後，即可在此聊天室與嚮導聊天。確認消息也會在這裡通知您。","Cuando se confirme un guía, podrás chatear con él aquí. También te avisaremos aquí de la confirmación.")};
// 방 안내 글 (메일로 가던 안내를 방에도, 11-05) — 허브는 코드+값만 · 여기서 보는 사람 언어로
var SYS={booked:T6("예약을 받았습니다.","Your booking has been received.","ご予約を受け付けました。","已收到预约。","已收到預約。","Hemos recibido la reserva."),
 gconf:T6("가이드 {g} 님이 확정되었습니다.","Guide {g} is confirmed.","ガイド {g} さんが確定しました。","向导 {g} 已确认。","嚮導 {g} 已確認。","El guía {g} está confirmado."),
 done:T6("투어 완료로 표시되었습니다.","The tour was marked as done.","ツアー完了になりました。","导览已标记为完成。","導覽已標記為完成。","El tour se marcó como completado."),
 rvthx:T6("후기를 남겨 주셔서 감사합니다.","Thank you for the review.","レビューありがとうございました。","感谢您的评价。","感謝您的評價。","Gracias por la reseña."),
 cancel:T6("예약이 취소되었습니다.","This booking was cancelled.","ご予約はキャンセルされました。","预约已取消。","預約已取消。","La reserva fue cancelada.")};
function sysTx(m){ var o=SYS[m.k]; if(!o) return ""; var g=(m.v&&m.v.g)||{}, l=window.LANG||"en", nm=l==="ko"?g.ko:l==="ja"?(g.ja||g.en):(l==="zhs"||l==="zht")?(g.zh||g.en):g.en; return F(o,{g:nm||g.ko||""}); }
// 말풍선 목록 — 「내 예약」과 같은 규칙으로 숨김: 취소·환불 · 후기까지 끝난 것(자유 가이드는 투어 완료+후기, 패키지는 후기)
function shown(r){ return !(r.status==="cancelled"||r.status==="refunded"||(r.reviewed&&(r.done||r.kind==="pkg"))); }
var MD={half:T6("반일 (4시간)","Half day (4 h)","半日（4時間）","半天（4小时）","半天（4小時）","Medio día (4 h)"),full:T6("하루 (8시간)","Full day (8 h)","1日（8時間）","一天（8小时）","一天（8小時）","Día completo (8 h)"),
 hours:T6("{n}시간","{n} h","{n}時間","{n}小时","{n}小時","{n} h"),days:T6("{n}일 (하루 8시간)","{n} days (8 h a day)","{n}日（1日8時間）","{n}天（每天8小时）","{n}天（每天8小時）","{n} días (8 h al día)")};
function mdTx(k){ if(!k||!k.mode) return ""; return F(MD[k.mode]||MD.half,{n:k.mode==="days"?k.d:k.h}); }
var LGN={ko:"한국어",en:"English",ja:"日本語",zhs:"中文(简)",zht:"中文(繁)",es:"Español"};
function gName(g){ if(!g) return ""; var l=window.LANG||"en", nm=g.name||""; if(l==="ko") return nm; var f=l==="ja"?(g.name_ja||g.name_en):(l==="zhs"||l==="zht")?(g.name_zh||g.name_en):g.name_en; return f&&f!==nm?f+" ("+nm+")":nm; }

// ── 모양 ──
var css=document.createElement("style");
css.textContent="#hit{position:relative}#hit .chdot{position:absolute;top:-3px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#e03131;color:#fff;font:800 11px/17px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px var(--card,#fff)}"
 +"#chB{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}"
 +"#chB .in{background:var(--card,#fff);color:var(--ink,#111827);width:100%;max-width:560px;height:92vh;display:flex;flex-direction:column;border-radius:18px 18px 0 0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;overflow:hidden}"
 +".chtabs{display:flex;gap:6px;padding:12px 12px 8px;border-bottom:1px solid var(--line,#e6e9ef);align-items:center}.chtabs button.t{flex:1;border:1.5px solid var(--line,#e6e9ef);background:var(--bg,#f4f6fa);color:var(--ink,#111827);border-radius:12px;padding:10px 6px;font-size:15px;font-weight:800;cursor:pointer;position:relative}"
 +".chtabs button.t.on{background:#0c8599;border-color:#0c8599;color:#fff}.chtabs .x{border:0;background:none;font-size:22px;color:#667;cursor:pointer;padding:0 4px}.chtabs .n{display:inline-block;margin-left:6px;min-width:18px;padding:0 5px;border-radius:9px;background:#e03131;color:#fff;font-size:12px;line-height:18px}"
 +".chbody{flex:1;overflow:auto;padding:10px 12px 14px;-webkit-overflow-scrolling:touch}.chlbl{font-size:13px;font-weight:800;color:var(--sub,#5b6474);margin:12px 2px 6px}.chnote{font-size:13.5px;color:var(--sub,#5b6474);line-height:1.55;background:var(--bg,#f4f6fa);border-radius:12px;padding:11px 12px;margin:6px 0}"
 +".chit{display:flex;gap:10px;align-items:center;border:1px solid var(--line,#e6e9ef);border-radius:14px;padding:10px 12px;margin:7px 0;cursor:pointer;background:var(--card,#fff)}.chit .av{width:44px;height:44px;border-radius:12px;object-fit:cover;background:#e3fafc;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:22px}"
 +".chit .b{flex:1;min-width:0}.chit .b b{font-size:15px}.chit .m{font-size:12.5px;color:var(--sub,#5b6474);margin-top:2px}.chit .u{min-width:22px;height:22px;border-radius:11px;background:#e03131;color:#fff;font:800 12px/22px system-ui;text-align:center;padding:0 6px}"
 +".chab{display:flex;gap:8px;margin-top:8px}.chab button{flex:1;border:0;border-radius:10px;padding:10px;font-size:14.5px;font-weight:800;cursor:pointer}.chab .a{background:#1f7a5a;color:#fff}.chab .r{background:#efece4;color:#1d2433}"
 +".chhd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line,#e6e9ef)}.chhd .bk{border:0;background:none;color:#0b7285;font-size:15px;font-weight:800;cursor:pointer;padding:4px 0}.chhd b{flex:1;font-size:15.5px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
 +".chsum{border:1px solid var(--line,#e6e9ef);border-radius:12px;padding:9px 12px;margin:2px 0 8px;background:var(--bg,#f4f6fa)}.chsum .r{display:flex;justify-content:space-between;gap:10px;font-size:13px;margin:2px 0}.chsum .r span:first-child{color:var(--sub,#5b6474)}.chsum .r span:last-child{text-align:right;word-break:break-word}"
 +".chmsg{display:flex;margin:6px 0}.chmsg.me{justify-content:flex-end}.chmsg .bb{max-width:78%;padding:8px 11px;border-radius:14px;font-size:14.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word;background:var(--bg,#f1f3f5)}.chmsg.me .bb{background:#0c8599;color:#fff}"
 +".chmsg .tm{font-size:11px;color:var(--sub,#8a929c);margin-top:3px}.chmsg.me .tm{text-align:right;color:rgba(255,255,255,.8)}"
 +".chft{border-top:1px solid var(--line,#e6e9ef);padding:8px 10px calc(8px + env(safe-area-inset-bottom));display:flex;gap:8px;align-items:flex-end}.chft textarea{flex:1;resize:none;min-height:42px;max-height:120px;border:1.5px solid var(--line,#e6e9ef);border-radius:12px;padding:9px 11px;font:inherit;font-size:15px;background:var(--bg,#f4f6fa);color:var(--ink,#111827)}"
 +".chft textarea::placeholder{color:#8a929c;opacity:1}:root[data-theme=\"dark\"] .chft textarea::placeholder{color:#6b7584}.chft button{border:0;border-radius:12px;background:#0c8599;color:#fff;font-weight:900;font-size:15px;padding:11px 14px;cursor:pointer}.chft button:disabled{opacity:.5}"
 +".chgo{display:block;width:100%;border:0;border-radius:12px;background:#0c8599;color:#fff;font-size:16px;font-weight:900;padding:12px;margin-top:8px;cursor:pointer}.chgo:disabled{opacity:.45;cursor:default}.chgo.g2{background:#efece4;color:#1d2433;font-size:14px;padding:10px}"
 +".chdone{border:1px solid #b2f2bb;background:#ebfbee;color:#2b8a3e;border-radius:12px;padding:10px 12px;font-weight:800;margin:8px 0}.chstars{display:flex;gap:4px;margin:4px 0}.chstars button{border:0;background:none;font-size:32px;line-height:1;color:#ccc;cursor:pointer;padding:2px 4px}.chstars button.on{color:#f59f00}"
 +".chin{width:100%;box-sizing:border-box;border:1.5px solid var(--line,#e6e9ef);border-radius:10px;padding:9px 11px;font:inherit;font-size:14.5px;background:var(--bg,#f4f6fa);color:var(--ink,#111827);margin-top:6px}.chin::placeholder{color:#8a929c;opacity:1}"
 +".chsys{text-align:center;margin:8px 0}.chsys span{display:inline-block;font-size:12px;color:var(--sub,#5b6474);background:var(--bg,#f1f3f5);border:1px solid var(--line,#e6e9ef);border-radius:999px;padding:4px 11px;line-height:1.4}.chsys small{color:#8a929c;margin-left:6px}.chpend{display:inline-block;font-size:11.5px;font-weight:800;color:#e8590c;background:#fff4e6;border-radius:999px;padding:1px 8px;margin-left:6px}.cherr{color:#c92a2a;font-weight:800;font-size:13px;margin-top:6px}.chsmall{font-size:12.5px;color:var(--sub,#5b6474);margin-top:6px;line-height:1.5}"
 +"#itB .chtabs{margin:-16px -14px 10px;padding:12px 12px 8px}";
document.head.appendChild(css);

// ── 상태 ──
var X={view:"list",room:null,msgs:[],last:0,rooms:null,gme:null,gerr:"",timer:null,dtm:null,stars:0,busy:false,ver:0};
var UNREAD={c:0,g:0};
function box(){ return document.getElementById("chB"); }
function body(){ var b=box(); return b&&b.querySelector(".chbody"); }
function stopPoll(){ if(X.timer){ clearInterval(X.timer); X.timer=null; } if(X.dtm){ clearTimeout(X.dtm); X.dtm=null; } }
function close(){ stopPoll(); var b=box(); if(b) b.remove(); X.view="list"; X.room=null; dot(); }
function tabs(cur){ var n=UNREAD.c+UNREAD.g;
  return '<div class="chtabs"><button type="button" class="t'+(cur==="chat"?" on":"")+'" data-cht="chat">💬 '+esc(L(TX.tChat))+(n>0?'<span class="n">'+n+'</span>':'')+'</button><button type="button" class="t'+(cur==="int"?" on":"")+'" data-cht="int">'+esc(L(TX.tInt))+'</button><button type="button" class="x" data-chx="1" aria-label="close">✕</button></div>'; }
function shell(){ var b=box(); if(!b){ b=document.createElement("div"); b.id="chB"; b.onclick=function(e){ if(e.target===b) close(); }; document.body.appendChild(b); } return b; }
function wireTabs(root){ [].forEach.call(root.querySelectorAll("[data-cht]"),function(t){ t.onclick=function(){ if(t.dataset.cht==="int") toInterp(); else { var it=document.getElementById("itB"); if(it) it.remove(); panel(); } }; });
  [].forEach.call(root.querySelectorAll("[data-chx]"),function(t){ t.onclick=function(){ close(); var it=document.getElementById("itB"); if(it) it.remove(); }; }); }
// 「통역」 탭 = 지금 통역 그대로 (interp.js) — 그 창 맨 위에도 같은 탭 줄을 얹는다
function toInterp(){ close(); var q=document.getElementById("q"), t=q?String(q.value||"").trim():"";
  if(!window.ITP) return; if(t) window.ITP.say(t); else window.ITP.open();
  var it=document.getElementById("itB"), inn=it&&it.querySelector(".in"); if(inn&&!inn.querySelector(".chtabs")){ var d=document.createElement("div"); d.innerHTML=tabs("int"); inn.insertBefore(d.firstChild,inn.firstChild); var hd=inn.querySelector(".hd button"); if(hd) hd.style.display="none"; wireTabs(inn); } }

// ── 목록 (손님 내 예약 방 + 가이드 화면) ──
function panel(){ stopPoll(); X.view="list"; X.room=null; var b=shell();
  b.innerHTML='<div class="in">'+tabs("chat")+'<div class="chbody"><div class="chnote">'+esc(L(TX.load))+'</div></div></div>'; wireTabs(b);
  loadLists().then(paintList); X.timer=setInterval(function(){ if(X.view==="list") loadLists().then(paintList); },15000); }
function loadLists(){ var tks=bks().map(function(x){ return x.tk; }), s=sess(), ps=[];
  ps.push(tks.length||s?post("/guide/chat",{op:"rooms",tks:tks,sess:s||undefined}).then(function(j){ X.rooms=j&&j.ok?j.items:[]; (X.rooms||[]).forEach(function(r){ try{ if(window.NEARBK&&!NEARBK.get(r.oid)) NEARBK.put(NEARBK.from(r,r.tk)); }catch(e){} }); }).catch(function(){ X.rooms=X.rooms||[]; }):Promise.resolve(X.rooms=[]));
  if(isG()||X.gwant) ps.push(gMe());
  return Promise.all(ps).then(function(){ UNREAD.c=(X.rooms||[]).filter(shown).reduce(function(a,r){ return a+(r.room&&r.room.unread||0); },0); UNREAD.g=X.gme?X.gme.items.reduce(function(a,r){ return a+(r.room&&r.room.unread||0); },0):0; dotPaint(); }); }
function gMe(){ var s=sess(); if(!s){ X.gme=null; X.gerr="login"; return Promise.resolve(); }
  return post("/guide/gme",{sess:s,op:"me"}).then(function(j){ if(j&&j.ok){ X.gme=j; X.gerr=""; ls("mpv_isguide","1"); } else { X.gme=null; X.gerr=(j&&j.err)||"x"; if(j&&(j.err==="notguide"||j.err==="sess")) ls("mpv_isguide",null); if(j&&j.err==="sess") ls("mpv_pg_sess",null); } }).catch(function(){ X.gerr="net"; }); }
function avHtml(g){ return g&&g.photo?'<img class="av" src="'+HB+'/guide/photo?id='+encodeURIComponent(g.id)+'" alt="">':'<span class="av">🧭</span>'; }
function paintList(){ var bd=body(); if(!bd||X.view!=="list") return; var h="", rs=(X.rooms||[]).filter(shown);
  if(rs.length||!(isG()||X.gwant)){ h+='<div class="chlbl">'+esc(L(TX.my))+'</div>';
    h+=rs.length?rs.map(function(r){ return '<div class="chit" data-chroom="'+esc(r.tk)+'">'+avHtml(r.g)+'<div class="b"><b>'+esc(r.kind==="pkg"?r.pname:gName(r.g))+'</b><div class="m">'+esc(r.date+" "+r.time+" (KST)")+(r.kind==="pkg"&&r.g?' · '+esc(gName(r.g)):'')+(r.kind==="pkg"&&!r.g?'<span class="chpend">'+esc(L(TX.wait))+'</span>':'')+(r.room.ro?' · '+esc(L(TX.ro)).split(" (")[0]:'')+'</div></div>'+(r.room.unread>0?'<span class="u">'+r.room.unread+'</span>':'')+'</div>'; }).join(""):'<div class="chnote">'+esc(L(TX.none))+'</div>'; }
  if(isG()||X.gwant){ h+='<div class="chlbl">'+esc(L(TX.gScr))+(X.gme?' · '+esc(gName(X.gme.guide)):'')+'</div>';
    if(X.gerr==="login"||X.gerr==="sess") h+='<div class="chnote">'+esc(L(TX.gLogin))+'</div><button type="button" class="chgo" data-chlogin="1">'+esc(L(TX.gLoginB))+'</button>';
    else if(X.gerr==="notguide") h+='<div class="chnote">'+esc(L(TX.gNot))+'</div><button type="button" class="chgo g2" data-chlogin="1">'+esc(L(TX.gLoginB))+'</button>';
    else if(X.gerr) h+='<div class="chnote">'+esc(L(TX.err))+'</div>';
    else if(!X.gme) h+='<div class="chnote">'+esc(L(TX.load))+'</div>';
    else { var now=Date.now(), up=X.gme.items.filter(function(x){ return x.end>=now; }), past=X.gme.items.filter(function(x){ return x.end<now; });
      var row=function(x){ var pk=x.kind==="pkg", t=esc(pk?(x.pnameKo||x.pname):(L(T6("자유 가이드 예약","Guide booking","ガイド予約","向导预约","嚮導預約","Reserva de guía"))+" · "+mdTx(x.k)));
        var meta=esc(x.date+" "+x.time+" · "+x.n+" · "+(x.cust||"")+" · "+(LGN[x.lang]||x.lang||""));
        var act=x.pend?'<div class="chnote" style="margin-top:6px">'+esc(L(TX.pend))+'</div><div class="chab"><button type="button" class="a" data-chans="accept" data-oid="'+esc(x.oid)+'">'+esc(L(TX.acc))+'</button><button type="button" class="r" data-chans="reject" data-oid="'+esc(x.oid)+'">'+esc(L(TX.rej))+'</button></div>':'';
        return '<div class="chit" style="flex-wrap:wrap'+(x.room?'':';cursor:default')+'"'+(x.room?' data-chgroom="'+esc(x.oid)+'"':'')+'><span class="av">'+(pk?'🎫':'🧭')+'</span><div class="b"><b>'+t+'</b><div class="m">'+meta+'</div>'+(x.ans==="accept"?'<div class="m" style="color:#2b8a3e;font-weight:800">✓ '+esc(L(TX.accd))+'</div>':'')+'</div>'+(x.room&&x.room.unread>0?'<span class="u">'+x.room.unread+'</span>':'')+(act?'<div style="flex-basis:100%">'+act+'</div>':'')+'</div>'; };
      h+='<div class="chlbl" style="margin-top:4px">'+esc(L(TX.gUp))+'</div>'+(up.length?up.map(row).join(""):'<div class="chnote">'+esc(L(TX.gNone))+'</div>');
      if(past.length) h+='<div class="chlbl">'+esc(L(TX.gPast))+'</div>'+past.map(row).join(""); } }
  bd.innerHTML=h;
  [].forEach.call(bd.querySelectorAll("[data-chroom]"),function(e){ e.onclick=function(){ room(e.dataset.chroom); }; });
  [].forEach.call(bd.querySelectorAll("[data-chgroom]"),function(e){ e.onclick=function(ev){ if(ev.target.closest("[data-chans]")) return; groom(e.dataset.chgroom); }; });
  [].forEach.call(bd.querySelectorAll("[data-chans]"),function(e){ e.onclick=function(ev){ ev.stopPropagation(); var a=e.dataset.chans; if(!window.confirm(L(a==="accept"?TX.accQ:TX.rejQ))) return; e.disabled=true;
    post("/guide/gme",{sess:sess(),op:"ans",oid:e.dataset.oid,a:a}).then(function(){ return gMe(); }).then(paintList).catch(function(){ e.disabled=false; }); }; });
  [].forEach.call(bd.querySelectorAll("[data-chlogin]"),function(e){ e.onclick=function(){ loginThen(function(){ X.gwant=true; loadLists().then(paintList); }); }; }); }
function loginThen(cb){ if(!window.mpPG) return; window.mpPG.open(); var bx=document.getElementById("pgBox"); if(!bx||!window.MutationObserver) return;
  var mo=new MutationObserver(function(){ if(!bx.hidden) return; mo.disconnect(); if(sess()) cb(); }); mo.observe(bx,{attributes:true,attributeFilter:["hidden"]}); }

// ── 대화방 ──
function sumRows(sm,side){ var r=function(a,b){ return '<div class="r"><span>'+esc(L(a))+'</span><span>'+b+'</span></div>'; }, pk=sm.kind==="pkg";
  return '<div class="chsum"><div style="font-weight:800;font-size:13.5px;margin-bottom:3px">'+esc(L(TX.sum))+'</div>'
    +(pk?r(T6("상품","Product","商品","商品","商品","Producto"),esc(side==="g"?(sm.pnameKo||sm.pname):sm.pname))+(side==="c"?r(TX.gd,X.room&&X.room.g?esc(gName(X.room.g)):'<span class="chpend" style="margin:0">'+esc(L(TX.wait))+'</span>'):''):r(TX.gd,esc(side==="g"?(X.gme&&X.gme.guide?X.gme.guide.name:""):gName(X.room&&X.room.g))+(sm.k?' · '+esc(mdTx(sm.k)):'')))
    +(side==="c"&&sm.cust?r(TX.bkr,esc(sm.cust)):'')+r(TX.dt,esc(sm.date+" "+sm.time+" (KST)"))+(sm.end?r(TX.endL,esc(window.NEARBK?NEARBK.when(sm.end):hm(sm.end))):'')+r(TX.ppl,esc(String(sm.n)))+r(TX.amt,esc(won(sm.amount)))+r(TX.oid,esc(sm.oid))
    +(side==="g"?r(TX.cust,esc(sm.cust||""))+r(TX.lang,esc(LGN[sm.lang]||sm.lang||""))+(sm.memo?r(TX.memo,esc(sm.memo)):''):'')+'</div>'; }
function room(tk){ var r=(X.rooms||[]).filter(function(x){ return x.tk===tk; })[0]||null; openRoom({side:"c",tk:tk,g:r&&r.g}); }
function groom(oid){ openRoom({side:"g",oid:oid}); }
function openRoom(o){ stopPoll(); X.view="room"; X.room=o; X.msgs=[]; X.last=0; X.stars=0; X.rvText=""; X.rvName=""; X.ver++; var v=X.ver, b=shell();
  b.innerHTML='<div class="in">'+tabs("chat")+'<div class="chhd"><button type="button" class="bk" data-chback="1">‹ '+esc(L(TX.back))+'</button><b>…</b><span style="width:40px"></span></div><div class="chbody"><div class="chnote">'+esc(L(TX.load))+'</div></div><div class="chft"></div></div>';
  wireTabs(b); b.querySelector("[data-chback]").onclick=function(){ panel(); };
  pull(true).then(function(){ if(X.ver!==v) return; X.timer=setInterval(function(){ if(X.view==="room"&&X.ver===v&&!document.hidden) pull(false); },4000); }); }
function api(op,extra){ var o=X.room, b=Object.assign({op:op},extra||{});
  if(o.side==="g"){ b.sess=sess(); b.oid=o.oid; return post("/guide/gme",b); } b.tk=o.tk; var s=sess(); if(s) b.sess=s; return post("/guide/chat",b); }
function pull(first){ var v=X.ver; return api("get",{after:X.last}).then(function(j){ if(X.ver!==v) return;
    if(!(j&&j.ok)){ if(first){ var bd=body(); if(bd) bd.innerHTML='<div class="chnote">'+esc(L(TX.err))+'</div>'; } return; }
    X.room.sum=j.sum; X.room.rm=j.room; if(j.info){ X.room.info=j.info; if(j.info.g) X.room.g=j.info.g; try{ if(window.NEARBK) NEARBK.put(NEARBK.from(j.info,X.room.tk)); }catch(e){} }
    var add=(j.msgs||[]).filter(function(m){ return m.s>X.last; }); if(add.length){ X.msgs=X.msgs.concat(add); X.last=add[add.length-1].s; }
    if(first||add.length) paintRoom(first); else paintTools(); dotSoon(); }).catch(function(){}); }
function paintRoom(first){ var b=box(); if(!b||X.view!=="room") return; var o=X.room, sm=o.sum||{}, bd=body(), side=o.side;
  var hd=b.querySelector(".chhd b"); if(hd) hd.textContent=side==="g"?(sm.cust||""):(sm.kind==="pkg"?sm.pname:gName(o.g));
  var near=bd.scrollHeight-bd.scrollTop-bd.clientHeight<80;
  var h=sumRows(sm,side)+'<div class="chtools"></div>';
  h+=X.msgs.length?X.msgs.map(function(m){ if(m.by==="s") return '<div class="chsys"><span>'+esc(sysTx(m))+'<small>'+hm(m.at)+'</small></span></div>'; var me=m.by===side; return '<div class="chmsg'+(me?' me':'')+'"><div class="bb">'+esc(m.t)+'<div class="tm">'+(me?esc(L(TX.me)):esc(side==="g"?L(TX.cust):L(TX.gd)))+' · '+hm(m.at)+'</div></div></div>'; }).join(""):'<div class="chnote">'+esc(L(TX.empty))+'</div>';
  bd.innerHTML=h; paintTools();
  var ft=b.querySelector(".chft"); if(o.rm&&o.rm.ro){ ft.innerHTML='<div class="chsmall" style="flex:1;text-align:center">'+esc(L(TX.ro))+'</div>'; }
  else if(o.rm&&o.rm.guide===false){ ft.innerHTML='<div class="chsmall" style="flex:1;text-align:center">'+esc(L(TX.noG))+'</div>'; }   // 패키지 — 가이드 확정 전엔 안내 글만 (11-05)
  else if(!ft.querySelector("textarea")){ ft.innerHTML='<textarea maxlength="500" rows="1" placeholder="'+esc(L(TX.ph))+'"></textarea><button type="button">'+esc(L(TX.send))+'</button>';
    var ta=ft.querySelector("textarea"), bt=ft.querySelector("button"); ta.oninput=function(){ ta.style.height="auto"; ta.style.height=Math.min(120,ta.scrollHeight)+"px"; }; bt.onclick=function(){ sendMsg(ta,bt); }; }
  if(first||near) bd.scrollTop=bd.scrollHeight; }
// 방 안 단추 — 손님: 알림 받기 · (자유 가이드) 투어 완료 → 별점·후기
function paintTools(){ var bd=body(), t=bd&&bd.querySelector(".chtools"); if(!t) return; var o=X.room, h="";
  if(o.side==="c"){ var inf=o.info||{}, sm=o.sum||{};
    if(sm.kind==="gbk"&&sm.status!=="cancelled"&&sm.status!=="refunded"){
      if(inf.reviewed) h+='<div class="chdone">✓ '+esc(L(TX.rvThx))+'</div>';
      else if(inf.done&&inf.review) h+=rvForm();
      else if(!inf.done){ var can=Date.now()>=(sm.end||0); h+='<button type="button" class="chgo" data-chdone="1"'+(can?'':' disabled')+'>'+esc(L(TX.done))+'</button><div class="chsmall" data-chdw="1">'+esc(can?L(TX.doneN):F(TX.doneW,{t:window.NEARBK?NEARBK.when(sm.end):hm(sm.end)}))+'</div>'; } }
    if(!(o.rm&&o.rm.ro)) h+=pushBtn(); }
  if(t._h!==h){ t.innerHTML=h; t._h=h; wireTools(t); } }
function rvForm(){ var s=""; for(var i=1;i<=5;i++) s+='<button type="button" data-chstar="'+i+'"'+(i<=X.stars?' class="on"':'')+'>'+(i<=X.stars?"★":"☆")+'</button>';
  return '<div class="chdone">✓ '+esc(L(TX.doneOk))+'</div><div class="chlbl" style="margin-top:6px">'+esc(L(TX.rvT))+'</div><div class="chstars">'+s+'</div>'
    +'<textarea class="chin" data-chrvt="1" maxlength="500" rows="3" placeholder="'+esc(L(TX.rvTx))+'">'+esc(X.rvText||"")+'</textarea><input class="chin" data-chrvn="1" maxlength="30" placeholder="'+esc(L(TX.rvNm))+'" value="'+esc(X.rvName||"")+'">'
    +'<button type="button" class="chgo" data-chrv="1">'+esc(L(TX.rvGo))+'</button><div class="cherr" data-chrve="1"></div>'; }
function pushBtn(){ if(!("serviceWorker" in navigator)||!("PushManager" in window)||!window.Notification) return ""; if(!X.vapid) return "";
  var on=X.room&&X.room.rm&&X.room.rm.push&&Notification.permission==="granted";
  return '<button type="button" class="chgo g2" data-chpush="1"'+(on?' disabled':'')+'>'+esc(L(on?TX.pushOk:TX.push))+'</button><div class="chsmall" data-chpe="1"></div>'; }
function wireTools(t){ var o=X.room, sm=o.sum||{};
  var d=t.querySelector("[data-chdone]"); if(d){ if(d.disabled&&sm.end>Date.now()){ var w=sm.end-Date.now()+400; if(w<2147483000){ if(X.dtm) clearTimeout(X.dtm); X.dtm=setTimeout(function(){ if(!document.body.contains(d)) return; d.disabled=false; var n=t.querySelector("[data-chdw]"); if(n) n.textContent=L(TX.doneN); },w); } }   // 끝나는 시각이 지나면 다시 그리지 않아도 켜진다
    d.onclick=function(){ if(Date.now()<(sm.end||0)||!window.confirm(L(TX.doneQ))) return; d.disabled=true;
      post("/guide/booking/done",{token:o.tk}).then(function(j){ if(j&&j.ok){ o.info=Object.assign(o.info||{},{done:true,review:j.review||"",reviewed:!!j.reviewed}); try{ if(window.NEARBK) NEARBK.put({oid:sm.oid,done:1,rv:j.review||"",rvd:!!j.reviewed}); }catch(e){} paintTools(); var f=t.querySelector(".chstars"); if(f) f.scrollIntoView({block:"center"}); return; }
        d.disabled=false; var n=t.querySelector("[data-chdw]"); if(n&&j&&j.err==="early"&&j.end){ sm.end=j.end; n.textContent=F(TX.doneW,{t:window.NEARBK?NEARBK.when(j.end):hm(j.end)}); d.disabled=true; } else if(n) n.textContent=L(TX.err); }).catch(function(){ d.disabled=false; }); }; }
  var rt=t.querySelector("[data-chrvt]"), rn=t.querySelector("[data-chrvn]"); if(rt) rt.oninput=function(){ X.rvText=rt.value; }; if(rn) rn.oninput=function(){ X.rvName=rn.value; };
  [].forEach.call(t.querySelectorAll("[data-chstar]"),function(s){ s.onclick=function(){ X.stars=+s.dataset.chstar; var tl=t; tl._h=""; [].forEach.call(t.querySelectorAll("[data-chstar]"),function(z){ var on=+z.dataset.chstar<=X.stars; z.className=on?"on":""; z.textContent=on?"★":"☆"; }); }; });
  var rb=t.querySelector("[data-chrv]"); if(rb) rb.onclick=function(){ var e=t.querySelector("[data-chrve]"); if(!X.stars){ e.textContent=L(TX.rvPick); return; } rb.disabled=true;
    post("/guide/review",{token:o.info.review,stars:X.stars,text:(t.querySelector("[data-chrvt]").value||"").slice(0,500),name:(t.querySelector("[data-chrvn]").value||"").slice(0,30)}).then(function(j){
      if(j&&(j.ok||j.err==="used")){ o.info.reviewed=true; try{ if(window.NEARBK) NEARBK.put({oid:sm.oid,rvd:true}); }catch(z){} paintTools(); return; } rb.disabled=false; e.textContent=L(TX.err); }).catch(function(){ rb.disabled=false; e.textContent=L(TX.err); }); };
  var pb=t.querySelector("[data-chpush]"); if(pb) pb.onclick=function(){ pushOn(pb,t.querySelector("[data-chpe]")); }; }
function sendMsg(ta,bt){ var v=String(ta.value||"").trim(); if(!v||X.busy) return; X.busy=true; bt.disabled=true; var ver=X.ver;
  api("send",{t:v.slice(0,500)}).then(function(j){ X.busy=false; bt.disabled=false; if(X.ver!==ver) return;
    if(j&&j.ok){ ta.value=""; ta.style.height=""; if(j.m&&j.m.s>X.last){ X.msgs.push(j.m); X.last=j.m.s; } paintRoom(false); var bd=body(); if(bd) bd.scrollTop=bd.scrollHeight; return; }
    if(j&&j.err==="ro"){ X.room.rm=Object.assign(X.room.rm||{},{ro:true}); paintRoom(false); return; }
    alert(L(TX.err)); }).catch(function(){ X.busy=false; bt.disabled=false; alert(L(TX.err)); }); }

// ── 웹 푸시 (손님) — 누르면 그때 권한을 묻고 sw.js 를 단다. 알림은 「새 메시지」만(내용은 안 실음) ──
function b64uToU8(s){ s=s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4) s+="="; var r=atob(s), u=new Uint8Array(r.length); for(var i=0;i<r.length;i++) u[i]=r.charCodeAt(i); return u; }
function pushOn(btn,msg){ btn.disabled=true;
  Notification.requestPermission().then(function(p){ if(p!=="granted") throw new Error("deny");
    return navigator.serviceWorker.register("/sw.js?l="+encodeURIComponent(window.LANG||"en"),{scope:"/"}); })
  .then(function(){ return navigator.serviceWorker.ready; })
  .then(function(reg){ return reg.pushManager.getSubscription().then(function(s){ return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uToU8(X.vapid)}); }); })
  .then(function(sub){ var tks=X.room&&X.room.side==="c"?[X.room.tk]:[]; bks().forEach(function(x){ if(tks.indexOf(x.tk)<0) tks.push(x.tk); });
    return Promise.all(tks.map(function(tk){ return post("/guide/chat",{op:"push",tk:tk,ep:sub.endpoint}).catch(function(){}); })); })
  .then(function(){ ls("mpv_chpush","1"); if(X.room&&X.room.rm) X.room.rm.push=true; btn.textContent=L(TX.pushOk); })
  .catch(function(){ btn.disabled=false; if(msg) msg.textContent=L(TX.pushNo); }); }
fetch(HB+"/guide/chat/vapid",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ X.vapid=j&&j.key&&/^[A-Za-z0-9_-]{80,100}$/.test(j.key)?j.key:""; }).catch(function(){});

// ── 말풍선 빨간 점 — 안 읽은 메시지 (손님 방 + 가이드 화면) · 1분마다 · 화면에 돌아오면 바로 ──
function dotPaint(){ var hb=document.getElementById("hit"); if(!hb) return; var n=UNREAD.c+UNREAD.g, d=hb.querySelector(".chdot");
  if(n>0){ if(!d){ d=document.createElement("span"); d.className="chdot"; hb.appendChild(d); } d.textContent=n>99?"99+":String(n); } else if(d) d.remove();
  [].forEach.call(document.querySelectorAll('.chtabs [data-cht="chat"]'),function(t){ var e=t.querySelector(".n"); if(n>0){ if(!e){ e=document.createElement("span"); e.className="n"; t.appendChild(e); } e.textContent=n; } else if(e) e.remove(); }); }
var dotT=null; function dotSoon(){ if(dotT) return; dotT=setTimeout(function(){ dotT=null; dot(); },1500); }
function dot(){ var tks=bks().map(function(x){ return x.tk; }), s=sess(), ps=[];
  if(tks.length) ps.push(post("/guide/chat",{op:"rooms",tks:tks}).then(function(j){ if(j&&j.ok){ X.rooms=j.items; UNREAD.c=j.items.filter(shown).reduce(function(a,r){ return a+(r.room&&r.room.unread||0); },0); } }).catch(function(){}));
  else UNREAD.c=0;
  if(isG()) ps.push(gMe().then(function(){ UNREAD.g=X.gme?X.gme.items.reduce(function(a,r){ return a+(r.room&&r.room.unread||0); },0):0; }));
  else UNREAD.g=0;
  return Promise.all(ps).then(dotPaint); }
function has(){ return bks().some(function(x){ return x.room||x.kind==="gbk"||x.kind==="pkg"; })||isG(); }   // 대화방이 있을 수 있는 사람 — 아니면 말풍선 = 통역 그대로
setInterval(function(){ if(!document.hidden&&has()) dot(); },60000);
document.addEventListener("visibilitychange",function(){ if(!document.hidden&&has()) dot(); });
// 머리줄 말풍선 — 대화방이 있는 사람만 탭 두 개 창, 나머지는 지금 통역(interp.js) 그대로
function hook(){ var hb=document.getElementById("hit"); if(!hb||hb._ch) return; var orig=hb.onclick; if(!orig){ setTimeout(hook,300); return; } hb._ch=1;
  hb.onclick=function(e){ if(!has()) return orig.call(this,e); e.preventDefault(); e.stopPropagation(); var q=document.getElementById("q"), t=q?String(q.value||"").trim():""; if(t&&!(UNREAD.c+UNREAD.g)) return orig.call(this,e); panel(); }; }
hook(); setTimeout(function(){ if(has()) dot(); },1200);
// 주소 ?gchat=<예약 토큰> · ?gchat=1 · ?gme=1 (메일·문자·알림에서)
(function(){ var q=location.search, m=/[?&]gchat=([0-9a-f]{32}|1)(?![0-9a-z])/i.exec(q), g=/[?&]gme=1(?![0-9a-z])/.test(q);
  if(/[?&](gchat|gme)=/i.test(q)){ try{ var k=q.slice(1).split("&").filter(function(x){ return !/^(gchat|gme)=/i.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(k?"?"+k:"")+location.hash); }catch(e){} }
  if(m){ var tk=m[1].toLowerCase(); setTimeout(function(){ if(tk==="1") panel(); else { if(window.NEARBK&&!bks().some(function(x){ return x.tk===tk; })) fetch(HB+"/guide/booking/check?token="+tk,{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(j&&j.ok) NEARBK.put(NEARBK.from(j,tk)); }).catch(function(){}); openRoom({side:"c",tk:tk}); } },900); }
  else if(g) setTimeout(guide,900); })();
function guide(){ X.gwant=true; panel(); }
navigator.serviceWorker&&navigator.serviceWorker.addEventListener&&navigator.serviceWorker.addEventListener("message",function(e){ if(e.data&&e.data.mp==="chat") panel(); });
window.CHAT={panel:panel,room:room,guide:guide,dot:dot,has:has,close:close};
})();
