/* 머니퍼즐 투어 — 체험·입장권 상품 진열장 (사장님 2026-10-27 「Klook·Creatrip 처럼 상품을 사진과 함께 · 주제별 분류 · 가이드 고르기 · 결제」)
 *  · 「체험·입장권」 칩을 누르면 near.js 옛 판(빅4 패키지·공연관람) 위에 이 화면이 전체로 뜬다. ✕ 로 닫으면 옛 판이 그대로 있다
 *  · 순서(웹·폰 같음, 사장님 「웹도 폰의 순서를 따라」): 주제 칩 → 상품 카드 → 가이드 고르기(언어 → 그 언어 승인 가이드, 허브 /guide/guides) → 예약·결제
 *  · 페이지 전체에 「UNDER TESTING」 도장 (사장님 지시). 진짜 상품 = 빅4 사옥 투어(결제하기 → 토스 결제창, 10-29)·공연관람(옛 판 목록). 나머지는 「예시 · 준비 중」
 *  · 상품 사진 img/shop/*.webp = 생성기(나노바나나)로 뽑음. 후기·별점은 실제 후기가 쌓이기 전엔 넣지 않는다
 */
(function(){
"use strict";
function L(o){ return o[window.LANG]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var HUBU=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
var TX={
 t:T6("프라이빗 카투어","Private Car Tours","プライベートカーツアー","私人包车游","私人包車遊","Tours privados en coche"),   // 11-14 사장님 「패키지 투어를 프라이빗 카투어로」 — 옛 「패키지여행」(11-06)·「체험·입장권」
 s:T6("기사가 운전하는 전용 승합차로 정해진 코스를 운행하는 상품이에요. 날짜·인원·픽업 숙소만 선택하면 돼요. 코스를 직접 짜고 싶으면 「가이드 인솔 자유여행」을 이용하세요.","Set routes in a private minivan with a driver. Just pick a date, the number of people and your hotel for pickup. To plan your own route, use “Travel with Guide”.","ドライバーが運転する専用ワゴン車で決まったコースを回る商品です。日付・人数・お迎えのホテルを選ぶだけ。コースを自分で決めたい場合は「ガイド同行の自由旅行」をご利用ください。","由司机驾驶的专属商务车走固定路线的产品。只需选择日期、人数和接送住处。如想自己安排路线，请使用「向导陪同自由行」。","由司機駕駛的專屬商務車走固定路線的商品。只需選擇日期、人數和接送住處。如想自己安排路線，請使用「嚮導陪同自由行」。","Rutas fijas en un monovolumen privado con conductor. Solo elige la fecha, cuántas personas sois y tu hotel de recogida. Para armar tu propia ruta, usa «Viaje con guía»."),   // 11-14
 s0:T6("한국 투어·체험·입장권을 골라 바로 예약하세요.","Pick Korea tours, experiences and tickets, and book right away.","韓国のツアー・体験・入場券を選んで、すぐ予約しましょう。","挑选韩国的游览·体验·门票，立即预约。","挑選韓國的遊覽·體驗·門票，立即預約。","Elige tours, experiencias y entradas en Corea y resérvalos al momento."),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 cx:T6("취소","Cancel","キャンセル","取消","取消","Cancelar"),   // 결제 단추 옆 취소 (사장님 11-05)
 n:T6("개 상품","products","商品","个商品","個商品","productos"),
 real:T6("판매 중","On sale","販売中","在售","販售中","A la venta"),
 ex:T6("예시 · 준비 중","Sample · coming soon","サンプル・準備中","示例·筹备中","範例·籌備中","Ejemplo · próximamente"),
 per:T6("1인","per person","1名","每人","每人","por persona"),
 g1:T6("가이드 고르기","Choose a guide","ガイドを選ぶ","选择向导","選擇嚮導","Elige un guía"),
 g2:T6("예약·결제","Book & pay","予約・決済","预约·付款","預約·付款","Reservar y pagar"),
 gl:T6("가이드 언어를 고르면 그 언어로 안내하는 가이드가 나옵니다.","Choose a language to see guides who speak it.","言語を選ぶと、その言語で案内するガイドが表示されます。","选择语言后，会显示使用该语言的向导。","選擇語言後，會顯示使用該語言的嚮導。","Elige un idioma para ver los guías que lo hablan."),
 gn:T6("이 언어의 가이드가 아직 없어요. 다른 언어를 고르거나 가이드 없이 예약할 수 있어요.","No guides for this language yet. Pick another language or book without a guide.","この言語のガイドはまだいません。別の言語を選ぶか、ガイドなしで予約できます。","暂无该语言的向导。可选择其他语言，或不选向导直接预约。","暫無該語言的嚮導。可選擇其他語言，或不選嚮導直接預約。","Aún no hay guías en este idioma. Elige otro idioma o reserva sin guía."),
 gld:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 pick:T6("위에서 상품을 고르면 여기에 예약 내용이 나옵니다.","Pick a product above to see the booking here.","上で商品を選ぶと、ここに予約内容が表示されます。","在上方选择商品后，这里会显示预约内容。","在上方選擇商品後，這裡會顯示預約內容。","Elige un producto arriba para ver aquí la reserva."),
 date:T6("날짜","Date","日付","日期","日期","Fecha"),
 tm:T6("시간","Time","時間","时间","時間","Hora"),
 dtm:T6("날짜·시간","Date & time","日時","日期·时间","日期·時間","Fecha y hora"),
 ppl:T6("인원","People","人数","人数","人數","Personas"),
 gd:T6("가이드","Guide","ガイド","向导","嚮導","Guía"),
 none:T6("고르지 않음","Not chosen","未選択","未选择","未選擇","Sin elegir"),
 tot:T6("합계","Total","合計","合计","合計","Total"),
 pay:T6("예약·결제","Book & pay","予約・決済","预约·付款","預約·付款","Reservar y pagar"),
 payn:T6("결제창에서 날짜·인원을 다시 확인합니다. 취소·환불은 환불 정책을 따릅니다.","You will confirm the date and people in the payment window. Cancellations follow our refund policy.","決済画面で日付・人数をもう一度確認します。キャンセル・返金は返金ポリシーに従います。","将在付款页面再次确认日期和人数。取消·退款按退款政策办理。","將在付款頁面再次確認日期和人數。取消·退款依退款政策辦理。","Confirmarás la fecha y las personas en la ventana de pago. Las cancelaciones siguen nuestra política de reembolso."),
 soon:T6("준비 중인 상품이라 아직 예약할 수 없어요.","This product is coming soon and can’t be booked yet.","準備中の商品のため、まだ予約できません。","该商品正在筹备中，暂时无法预约。","該商品正在籌備中，暫時無法預約。","Este producto llega pronto y aún no se puede reservar."),
 sel:T6("선택한 상품","Selected product","選んだ商品","已选商品","已選商品","Producto elegido"),
 seln:T6("오른쪽에서 상품을 고르세요.","Pick a product on the right.","右から商品を選んでください。","请在右侧选择商品。","請在右側選擇商品。","Elige un producto a la derecha."),
 soon2:T6("예시 상품이라 실제로 판매하지 않아요. 결제 화면만 미리 볼 수 있어요.","This is a sample product and isn’t on sale. You can preview the payment screen.","サンプル商品のため販売していません。決済画面だけ確認できます。","这是示例商品，暂不出售。可以预览付款页面。","這是範例商品，暫不販售。可以預覽付款頁面。","Producto de ejemplo, no está a la venta. Puedes ver la pantalla de pago."),
 pt:T6("결제","Payment","お支払い","付款","付款","Pago"),
 ord:T6("주문 내용","Order summary","ご注文内容","订单内容","訂單內容","Resumen del pedido"),
 pm:T6("결제 수단","Payment method","お支払い方法","付款方式","付款方式","Método de pago"),
 card:T6("신용·체크카드 (해외 카드 포함)","Credit/debit card (incl. overseas cards)","クレジット・デビットカード（海外カード可）","信用卡/借记卡（含境外卡）","信用卡/簽帳卡（含境外卡）","Tarjeta de crédito/débito (incl. extranjeras)"),
 agr:T6("주문 내용과 환불 정책을 확인했으며 결제에 동의합니다","I have checked the order and refund policy and agree to pay","注文内容と返金ポリシーを確認し、支払いに同意します","我已确认订单和退款政策并同意付款","我已確認訂單和退款政策並同意付款","He revisado el pedido y la política de reembolso y acepto pagar"),
 payb:T6("결제하기","Pay","支払う","付款","付款","Pagar"),
 test:T6("UNDER TESTING — 시험 화면이라 실제로 결제되지 않았어요.","UNDER TESTING — this is a test screen; no payment was made.","UNDER TESTING — テスト画面のため、実際の決済は行われていません。","UNDER TESTING — 测试页面，未实际扣款。","UNDER TESTING — 測試頁面，未實際扣款。","UNDER TESTING — pantalla de prueba; no se realizó ningún cobro."),
 back:T6("돌아가기","Back","戻る","返回","返回","Volver"),
 perf:T6("공연장 5곳의 공연 일정 보기","See shows at 5 theaters","劇場5か所の公演日程を見る","查看5家剧场的演出日程","查看5家劇場的演出日程","Ver funciones en 5 teatros"),
 cu:T6("예약자 정보","Your details","ご予約者情報","预订人信息","預訂人資訊","Tus datos"),
 cn:T6("이름 (필수)","Name (required)","お名前（必須）","姓名（必填）","姓名（必填）","Nombre (obligatorio)"),
 ce:T6("이메일 (필수)","Email (required)","メール（必須）","邮箱（必填）","電子郵件（必填）","Correo electrónico (obligatorio)"),
 cp:T6("전화 (필수)","Phone (required)","電話（必須）","电话（必填）","電話（必填）","Teléfono (obligatorio)"),
 cpn:T6("입력한 이름·이메일·전화는 예약 안내와 가이드 연결에만 씁니다. 결제가 끝나면 고른 가이드에게 상품·날짜·시간·인원·연락처가 전달됩니다.","Your name, email and phone are used only for booking notices and to connect you with your guide. After payment, the guide you chose receives the product, date, time, people and your contact.","入力したお名前・メール・電話は予約のご案内とガイドとの連絡にのみ使います。お支払い後、選んだガイドに商品・日時・人数・連絡先が伝わります。","您填写的姓名、邮箱和电话仅用于预约通知和联系向导。付款后，所选向导会收到商品、日期、时间、人数和您的联系方式。","您填寫的姓名、電子郵件和電話僅用於預約通知和聯絡嚮導。付款後，所選嚮導會收到商品、日期、時間、人數和您的聯絡方式。","Tu nombre, correo y teléfono solo se usan para avisos de la reserva y para contactar con tu guía. Tras el pago, el guía elegido recibe el producto, la fecha, la hora, las personas y tu contacto."),
 enm:T6("이름을 넣어 주세요.","Please enter your name.","お名前を入力してください。","请填写姓名。","請填寫姓名。","Escribe tu nombre."),
 eem:T6("이메일 주소를 확인해 주세요.","Please check your email address.","メールアドレスをご確認ください。","请检查邮箱地址。","請檢查電子郵件地址。","Revisa tu correo electrónico."),
 eph:T6("전화번호를 확인해 주세요.","Please check your phone number.","電話番号をご確認ください。","请检查电话号码。","請檢查電話號碼。","Revisa tu número de teléfono."),
 edt:T6("날짜·시간을 확인해 주세요 (오늘 이후).","Please check the date and time (from today).","日時をご確認ください（本日以降）。","请检查日期和时间（今天起）。","請檢查日期和時間（今天起）。","Revisa la fecha y la hora (desde hoy)."),
 efail:T6("저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.","Could not save. Please try again shortly.","保存できませんでした。しばらくしてからもう一度お試しください。","保存失败，请稍后再试。","儲存失敗，請稍後再試。","No se pudo guardar. Inténtalo de nuevo en un momento."),
 sav:T6("저장 중…","Saving…","保存中…","保存中…","儲存中…","Guardando…"),
 oid:T6("주문번호","Order no.","注文番号","订单号","訂單號","N.º de pedido"),
 sent:T6("예약을 받았어요. 가이드가 확정되면 🔔 앱 알림과 메일로 알려 드려요. 진행 상황은 말풍선(💬)에서 볼 수 있어요.","Your booking is received. We'll let you know by app notification (🔔) and email when a guide is confirmed. You can follow the progress in the chat (💬).","ご予約を受け付けました。ガイドが確定したら🔔アプリ通知とメールでお知らせします。進み具合は吹き出し（💬）で確認できます。","已收到预约。向导确认后会通过🔔应用通知和邮件告诉您，进度可在对话气泡（💬）中查看。","已收到預約。嚮導確認後會透過🔔應用程式通知和電郵告訴您，進度可在對話氣泡（💬）中查看。","Hemos recibido tu reserva. Te avisaremos con una notificación de la app (🔔) y por correo cuando se confirme un guía. Puedes seguir el progreso en el chat (💬)."),   // 11-06 손님 문자 끔   // 11-05 접수 문자·메일 끊음 — 화면 + 말풍선
 sentX:T6("예약을 받았어요. 확정·취소 같은 소식은 메일로 알려 드려요.","Your booking is received. We'll email you about news such as confirmation or cancellation.","ご予約を受け付けました。確定やキャンセルなどのお知らせはメールでお送りします。","已收到预约。确认、取消等消息会通过邮件通知您。","已收到預約。確認、取消等消息會透過電郵通知您。","Hemos recibido tu reserva. Te avisaremos por correo de novedades como la confirmación o una cancelación."),   // 11-06 손님 문자 끔   // 방 없는 상품(입장권·클래스)
 chatGo:T6("💬 말풍선에서 보기","💬 Open in chat","💬 吹き出し（チャット）で見る","💬 在对话气泡中查看","💬 在對話氣泡中查看","💬 Ver en el chat"),
 tsv:T6("시험 주문으로 저장했어요. 가이드·예약자에게는 아무것도 보내지 않았어요.","Saved as a test order. Nothing was sent to the guide or to you.","テスト注文として保存しました。ガイドやご予約者には何も送っていません。","已保存为测试订单，未向向导或您发送任何内容。","已儲存為測試訂單，未向嚮導或您傳送任何內容。","Guardado como pedido de prueba. No se envió nada al guía ni a ti."),
 // 결제창 (KG이니시스 · 포트원, 11-07 — 옛 토스 글자 바꿈)
 opn:T6("결제창을 여는 중…","Opening the payment window…","決済画面を開いています…","正在打开付款窗口…","正在開啟付款視窗…","Abriendo la ventana de pago…"),
 pdT:T6("결제 완료","Payment done","決済完了","付款完成","付款完成","Pago completado"),
 tkey:T6("시험 결제(테스트 키) — 실제 청구 없음","Test payment (test key) — no real charge","テスト決済（テストキー）— 実際の請求はありません","测试付款（测试密钥）— 不会实际扣款","測試付款（測試金鑰）— 不會實際扣款","Pago de prueba (clave de prueba): sin cargo real"),
 pfT:T6("결제가 완료되지 않았어요 (취소 또는 실패).","The payment was not completed (cancelled or failed).","決済が完了しませんでした（キャンセルまたは失敗）。","付款未完成（已取消或失败）。","付款未完成（已取消或失敗）。","El pago no se completó (cancelado o fallido)."),
 ppn:T6("PayPal 결제는 아직 연결 전이에요. 신용·체크카드(해외 카드 포함)로 결제해 주세요.","PayPal is not connected yet. Please pay by credit/debit card (overseas cards accepted).","PayPal決済はまだ準備中です。クレジット・デビットカード（海外カード可）でお支払いください。","PayPal付款尚未开通，请使用信用卡/借记卡（含境外卡）付款。","PayPal付款尚未開通，請使用信用卡/簽帳卡（含境外卡）付款。","PayPal aún no está disponible. Paga con tarjeta de crédito/débito (se aceptan extranjeras)."),
 amt:T6("결제 금액","Amount paid","決済金額","付款金额","付款金額","Importe pagado"),
 b4p:T6("1인 ₩89,000 · 2인 이상 1인 ₩79,000","1 person ₩89,000 · 2+ ₩79,000 each","1名 ₩89,000 · 2名以上 1名 ₩79,000","1人 ₩89,000 · 2人以上每人 ₩79,000","1人 ₩89,000 · 2人以上每人 ₩79,000","1 persona ₩89,000 · 2+ ₩79,000 c/u"),
 // 상품 상세 화면 (사장님 10-29 「카드를 누르면 자세한 설명 · 옆에 결제 화면이 계속 따라오도록 · 되돌아가는 버튼」)
 bk:T6("뒤로","Back","戻る","返回","返回","Atrás"),
 dIn:T6("상품 소개","About this experience","商品紹介","商品介绍","商品介紹","Sobre esta experiencia"),
 dFt:T6("포함·특징","What’s included","含まれるもの・特徴","包含内容·特色","包含內容·特色","Qué incluye"),
 dPr:T6("가격","Price","料金","价格","價格","Precio"),
 dRf:T6("취소·환불 안내","Cancellation & refunds","キャンセル・返金","取消·退款说明","取消·退款說明","Cancelación y reembolsos"),
 rf1:T6("여행 시작 5일 전까지 취소: 전액 환불","Cancel up to 5 days before the tour: full refund","旅行開始の5日前までの取消：全額返金","出发前5天及以前取消：全额退款","出發前5天及以前取消：全額退款","Hasta 5 días antes del tour: reembolso total"),
 rf2:T6("여행 시작 2일 전까지 취소: 요금의 10% 공제 후 환불","Cancel up to 2 days before: 10% of the fee deducted","2日前までの取消：料金の10%を差し引いて返金","出发前2天及以前取消：扣除费用的10%后退款","出發前2天及以前取消：扣除費用的10%後退款","Hasta 2 días antes: se descuenta el 10% del precio"),
 rf3:T6("여행 시작 1일 전 취소: 요금의 20% 공제 후 환불","Cancel 1 day before: 20% of the fee deducted","1日前の取消：料金の20%を差し引いて返金","出发前1天取消：扣除费用的20%后退款","出發前1天取消：扣除費用的20%後退款","1 día antes: se descuenta el 20% del precio"),
 rf4:T6("여행 당일 취소 또는 불참: 요금의 30% 공제 후 환불","Cancel on the day or no-show: 30% of the fee deducted","当日取消・不参加：料金の30%を差し引いて返金","当天取消或未参加：扣除费用的30%后退款","當天取消或未參加：扣除費用的30%後退款","El mismo día o si no te presentas: se descuenta el 30% del precio"),
 rf5:T6("날씨·안전 문제를 포함해 회사 또는 가이드의 사정으로 투어가 취소되면 전액 환불합니다.","If the tour is cancelled for reasons on our or the guide's side, including weather or safety, you get a full refund.","天候・安全上の理由を含め、会社またはガイドの都合でツアーが中止になった場合は全額返金します。","因公司或向导原因（包括天气、安全问题）取消行程时，全额退款。","因公司或嚮導原因（包括天氣、安全問題）取消行程時，全額退款。","Si el tour se cancela por motivos nuestros o del guía, incluidos el clima o la seguridad, el reembolso es total."),
 rf6:T6("환불은 결제한 수단으로 영업일 기준 3~7일 안에 처리됩니다.","Refunds are made to your original payment method within 3–7 business days.","返金は決済した手段で、営業日3～7日以内に行います。","退款将通过原支付方式在3～7个工作日内办理。","退款將透過原付款方式於3～7個工作天內辦理。","El reembolso se hace al medio de pago original en 3–7 días hábiles."),
 rfL:T6("환불 규정 전체 보기","View full refund policy","返金規定の全文を見る","查看完整退款规定","查看完整退款規定","Ver la política de reembolso completa"),
 // 관리자에서 등록한 상품 (10-29)
 dp:T6("{n}인 이상 1인","{n}+ people, each","{n}名以上 1名","{n}人以上每人","{n}人以上每人","{n}+ personas, c/u"),
 tk:T6("예매처로 가기","Go to the ticket site","チケットサイトへ","前往购票网站","前往購票網站","Ir al sitio de entradas"),
 tkn:T6("예약·결제는 공식 예매처에서 합니다.","Booking and payment are done on the official ticket site.","予約・決済は公式チケットサイトで行います。","预约和付款请在官方购票网站完成。","預約和付款請在官方購票網站完成。","La reserva y el pago se hacen en el sitio oficial de entradas."),
 dys:T6("진행 요일","Days","開催曜日","开放日","開放日","Días"),
 wd:[T6("일","Sun","日","日","日","dom"),T6("월","Mon","月","一","一","lun"),T6("화","Tue","火","二","二","mar"),T6("수","Wed","水","三","三","mié"),T6("목","Thu","木","四","四","jue"),T6("금","Fri","金","五","五","vie"),T6("토","Sat","土","六","六","sáb")],
 edy:T6("이 상품은 고른 요일에 진행하지 않아요. 진행 요일을 확인해 주세요.","This product doesn't run on that day. Please check the days.","この商品は選んだ曜日には開催しません。開催曜日をご確認ください。","该商品在所选日期不开放，请确认开放日。","該商品在所選日期不開放，請確認開放日。","Este producto no se ofrece ese día. Revisa los días."),
 mx:T6("최대 {n}명","Up to {n} people","最大{n}名","最多{n}人","最多{n}人","Hasta {n} personas"),
 // 최소 출발 인원 (사장님 10-30 — 빅4 4명, 24시간 전 미달이면 회사 취소·전액 환불)
 mp:T6("최소 출발 인원 {n}명","Minimum {n} people to depart","最少催行人員{n}名","最少成团人数{n}人","最少成團人數{n}人","Mínimo {n} personas para salir"),
 mpn:T6("같은 날짜 예약이 {n}명이 안 되면 출발 24시간 전에 알려 드리고 전액 환불합니다.","If fewer than {n} people book the same date, we will tell you 24 hours before departure and give you a full refund.","同じ日の予約が{n}名に満たない場合は、出発の24時間前までにお知らせし、全額返金します。","同一日期预约不足{n}人时，我们会在出发前24小时通知您并全额退款。","同一日期預約不足{n}人時，我們會在出發前24小時通知您並全額退款。","Si para esa fecha reservan menos de {n} personas, te avisaremos 24 horas antes de la salida y te devolveremos el importe completo."),
 // 체험·입장권 화면 개편 (사장님 10-30 「그대로 해봐」) — 앞면 단순하게 · 뒷면 순서 · 종류(tour 가이드 투어 / class 체험 클래스 / ticket 입장권)
 kT:T6("가이드 동행","With a guide","ガイド同行","向导同行","嚮導同行","Con guía"),
 kC:T6("업체 직원 진행","Hosted by venue staff","店舗スタッフが進行","由商家员工进行","由商家員工進行","Con personal del local"),
 kK:T6("입장권","Entry ticket","入場券","门票","門票","Entrada"),
 fc:T6("무료 취소 5일 전까지","Free cancellation up to 5 days before","5日前まで無料キャンセル","提前5天可免费取消","提前5天可免費取消","Cancelación gratis hasta 5 días antes"),
 pxt:T6("가격은 예매처에서","Price on the ticket site","料金はチケットサイトで","价格见售票处","價格見售票處","Precio en la web de venta"),
 dur:T6("소요 시간","Duration","所要時間","所需时间","所需時間","Duración"),
 lng:T6("진행 언어","Language","対応言語","使用语言","使用語言","Idioma"),
 gdN:T6("가이드 없음 · 업체 직원 진행","No guide · venue staff host","ガイドなし・店舗スタッフが進行","无向导·由商家员工进行","無嚮導·由商家員工進行","Sin guía · lo lleva el personal del local"),
 vch:T6("모바일 바우처","Mobile voucher","モバイルバウチャー","电子凭证","電子憑證","Bono móvil"),
 cfNow:T6("즉시 확정","Instant confirmation","即時確定","即时确认","即時確認","Confirmación inmediata"),
 cf24:T6("24시간 안에 확정","Confirmed within 24 h","24時間以内に確定","24小时内确认","24小時內確認","Confirmación en 24 h"),
 hl:T6("이런 걸 해요","What you’ll do","こんなことをします","活动内容","活動內容","Qué harás"),
 stT:T6("진행 순서 (코스)","Itinerary","行程（コース）","行程（路线）","行程（路線）","Itinerario"),
 stC:T6("진행 순서","How it goes","進行の流れ","进行顺序","進行順序","Cómo funciona"),
 inc:T6("포함","Included","含まれるもの","包含","包含","Incluye"),
 exc:T6("불포함","Not included","含まれないもの","不包含","不包含","No incluye"),
 way:T6("찾아가는 방법","Getting there","アクセス","怎么去","怎麼去","Cómo llegar"),
 meet:T6("만나는 곳","Meeting point","集合場所","集合地点","集合地點","Punto de encuentro"),
 gmap:T6("구글 지도","Google Maps","Googleマップ","谷歌地图","Google地圖","Google Maps"),
 kmap:T6("카카오맵","KakaoMap","カカオマップ","Kakao地图","Kakao地圖","KakaoMap"),
 nmap:T6("네이버 지도","Naver Map","NAVERマップ","NAVER地图","NAVER地圖","Naver Map"),
 stn:T6("가까운 역","Nearest station","最寄り駅","最近的车站","最近的車站","Estación más cercana"),
 ext:T6("{n}번 출구","Exit {n}","{n}番出口","{n}号出口","{n}號出口","Salida {n}"),
 wk:T6("도보 {n}분","{n} min walk","徒歩{n}分","步行{n}分钟","步行{n}分鐘","{n} min a pie"),
 tip:T6("찾는 요령","How to find it","見つけ方","找路小贴士","找路小貼士","Cómo encontrarlo"),
 ent:T6("입구","Entrance","入口","入口","入口","Entrada"),
 tx:T6("택시 기사에게 보여 주기","Show this to your taxi driver","タクシー運転手に見せる","出示给出租车司机","出示給計程車司機","Muéstraselo al taxista"),
 txn:T6("이 화면을 기사님께 보여 주세요.","Show this screen to the driver.","この画面を運転手に見せてください。","请把此画面给司机看。","請把此畫面給司機看。","Enseña esta pantalla al conductor."),
 cpy:T6("주소 복사","Copy address","住所をコピー","复制地址","複製地址","Copiar dirección"),
 cpd:T6("복사했어요","Copied","コピーしました","已复制","已複製","Copiado"),
 tbd:T6("예약 확정 후 안내","Sent after your booking is confirmed","予約確定後にご案内","预约确认后告知","預約確認後告知","Te lo indicamos tras confirmar la reserva"),
 day:T6("당일 이렇게","On the day","当日の流れ","当天须知","當天須知","El día de la actividad"),
 d1:T6("시작 10분 전에 도착해 주세요.","Please arrive 10 minutes before the start.","開始10分前にお越しください。","请在开始前10分钟到达。","請在開始前10分鐘到達。","Llega 10 minutos antes del inicio."),
 d2:T6("「내 예약」의 모바일 바우처(QR)를 보여 주세요. 확정 메일의 「내 예약」 링크로도 열 수 있어요.","Show the mobile voucher (QR) in “My bookings”. You can also open it from the “My bookings” link in your confirmation email.","「私の予約」のモバイルバウチャー（QR）を見せてください。確定メールの「私の予約」リンクからも開けます。","请出示「我的预约」中的电子凭证（二维码）。也可以通过确认邮件中的「我的预约」链接打开。","請出示「我的預約」中的電子憑證（QR碼）。也可以透過確認郵件中的「我的預約」連結打開。","Muestra el bono móvil (QR) de «Mis reservas». También puedes abrirlo desde el enlace «Mis reservas» del correo de confirmación."),   /* 11-11 「2나」 — 바우처 QR 은 「내 예약」에 (메일에는 그림 없이 링크) · 옛 글: */ d2old:T6("예약 확정 메일의 모바일 바우처(QR)를 보여 주세요.","Show the mobile voucher (QR) from your confirmation email.","予約確定メールのモバイルバウチャー（QR）を見せてください。","请出示确认邮件中的电子凭证（二维码）。","請出示確認郵件中的電子憑證（QR碼）。","Muestra el bono móvil (QR) del correo de confirmación."),
 d3:T6("늦을 것 같으면 바로 연락해 주세요: {n}","Running late? Contact us right away: {n}","遅れそうな場合はすぐにご連絡ください：{n}","如可能迟到，请立即联系：{n}","如可能遲到，請立即聯絡：{n}","¿Llegas tarde? Avísanos enseguida: {n}"),
 d3n:T6("늦을 것 같으면 예약 확정 메일의 연락처로 바로 알려 주세요.","Running late? Tell us right away using the contact in your confirmation email.","遅れそうな場合は、予約確定メールの連絡先にすぐお知らせください。","如可能迟到，请立即通过确认邮件中的联系方式告知。","如可能遲到，請立即透過確認郵件中的聯絡方式告知。","¿Llegas tarde? Avísanos enseguida con el contacto del correo de confirmación."),
 dP1:T6("공연 시작 전에 여유 있게 도착해 주세요.","Arrive with time to spare before the show starts.","開演前に余裕をもってお越しください。","请在演出开始前预留充足时间到达。","請在演出開始前預留充足時間到達。","Llega con tiempo antes de que empiece la función."),
 know:T6("알아 두세요","Good to know","ご注意ください","须知","須知","Información útil"),
 faq:T6("자주 묻는 질문","FAQ","よくある質問","常见问题","常見問題","Preguntas frecuentes"),
 rf5c:T6("날씨·안전 문제를 포함해 회사 또는 업체의 사정으로 취소되면 전액 환불합니다.","If it is cancelled for reasons on our or the venue’s side, including weather or safety, you get a full refund.","天候・安全上の理由を含め、会社または店舗の都合で中止になった場合は全額返金します。","因公司或商家原因（包括天气、安全问题）取消时，全额退款。","因公司或商家原因（包括天氣、安全問題）取消時，全額退款。","Si se cancela por motivos nuestros o del local, incluidos el clima o la seguridad, el reembolso es total."),
 tkDp:T6("공연마다 날짜를 골라 공식 예매처에서 예매합니다.","Pick a date for each show and book on the official ticket site.","公演ごとに日付を選び、公式チケットサイトで予約します。","每场演出选择日期，在官方售票处预订。","每場演出選擇日期，在官方售票處預訂。","Elige la fecha de cada función y reserva en la web oficial."),
 tkE:T6("입장 방법","How to get in","入場方法","入场方式","入場方式","Cómo entrar"),
 tkEd:T6("입구에서 「내 예약」의 모바일 바우처(QR)를 보여 주면 입장합니다.","Show the mobile voucher (QR) in “My bookings” at the entrance to get in.","入口で「私の予約」のモバイルバウチャー（QR）を見せて入場します。","在入口出示「我的预约」中的电子凭证（二维码）即可入场。","在入口出示「我的預約」中的電子憑證（QR碼）即可入場。","Muestra el bono móvil (QR) de «Mis reservas» en la entrada para entrar."),   /* 11-11 「2나」 · 옛 글: */ tkEdOld:T6("입구에서 모바일 바우처(QR)를 보여 주면 입장합니다.","Show your mobile voucher (QR) at the entrance to get in.","入口でモバイルバウチャー（QR）を見せて入場します。","在入口出示电子凭证（二维码）即可入场。","在入口出示電子憑證（QR碼）即可入場。","Muestra tu bono móvil (QR) en la entrada para entrar.")
};
var LGN={ko:"한국어",en:"English",ja:"日本語",zhs:"中文(简)",zht:"中文(繁)",es:"Español"};
var CATS=[["all",T6("전체","All","すべて","全部","全部","Todo")],["kpop",T6("K-POP","K-POP","K-POP","K-POP","K-POP","K-POP")],["tour",T6("관광","Sightseeing","観光","观光","觀光","Turismo")],["beauty",T6("미용","Beauty","美容","美容","美容","Belleza")],["hair",T6("헤어","Hair","ヘア","美发","美髮","Peluquería")],["food",T6("음식","Food","グルメ","美食","美食","Comida")],["show",T6("공연","Shows","公演","演出","演出","Espectáculos")],["well",T6("웰니스","Wellness","ウェルネス","养生","養生","Bienestar")]];
// 11-10 사장님 「가격은 패키지여행비라는 걸 명심하고, 건강검진비·도장 파는 비용·재료비 등은 모두 별도 부담이라고 써」 — 목록 카드·상세 가격·결제 칸 아래에도 같은 줄(px)
var SEAL_X=T6("도장값·재료비 별도","Seal & materials paid separately","はんこ代・材料費は別途","印章费·材料费另付","印章費·材料費另付","Sello y materiales se pagan aparte");
var HCHK_X=T6("건강검진비 별도","Check-up fee paid separately","健診費用は別途","体检费另付","健檢費另付","El chequeo se paga aparte");
// ── 프라이빗 카투어 공통 글 (11-14) — 상품 표(P)·상세(PX)가 같이 쓴다 ──
var CT_CAP=T6("최대 7명 · 승합차","Up to 7 people · minivan","最大7名・ワゴン車","最多7人·商务车","最多7人·商務車","Hasta 7 personas · monovolumen");
var CT_DRV=T6("기사 포함 · 가이드 선택","Driver included · guide optional","ドライバー付き・ガイドは選択","含司机·导游可选","含司機·導遊可選","Conductor incluido · guía opcional");
var CT_INC=[T6("카니발급 승합차 1대 · 기사 (운전만)","1 minivan (Kia Carnival class) · driver (driving only)","カーニバル級ワゴン車1台・ドライバー（運転のみ）","1辆嘉华级商务车·司机（仅驾驶）","1輛嘉華級商務車·司機（僅駕駛）","1 monovolumen (tipo Kia Carnival) · conductor (solo conduce)"),
 T6("기름값·통행료·주차비·기사 식사","Fuel, tolls, parking and the driver's meals","燃料代・高速料金・駐車料金・ドライバーの食事","油费·过路费·停车费·司机餐费","油費·過路費·停車費·司機餐費","Combustible, peajes, aparcamiento y comidas del conductor"),
 T6("서울 숙소 픽업·내려 드리기","Pickup and drop-off at your hotel in Seoul","ソウルのホテルへのお迎え・お送り","首尔住处接送","首爾住處接送","Recogida y regreso a tu hotel en Seúl")];
var CT_EXC=[T6("관광지 입장료","Admission to attractions","観光地の入場料","景点门票","景點門票","Entradas a los lugares"),T6("손님 식사","Your own meals","お客様の食事","您的餐费","您的餐費","Tus comidas"),
 T6("가이드 (선택 시 추가 · 하루 360,000원)","A guide (add if you like · ₩360,000 a day)","ガイド（希望すれば追加・1日360,000ウォン）","导游（需要可加·每天360,000韩元）","導遊（需要可加·每天360,000韓元）","Guía (si quieres, añádelo · ₩360.000 al día)"),
 T6("여행자보험(필요 시 개인 가입)","Travel insurance (buy your own if needed)","旅行保険（必要な方は各自ご加入）","旅行保险（如有需要请自行购买）","旅遊保險（如有需要請自行購買）","Seguro de viaje (si lo necesitas, contrátalo por tu cuenta)"),
 T6("이용 시간 초과 시 1시간에 30,000원 · 밤 10시 이후 1시간에 50,000원 (현장에서 기사에게 지불)","Over the hours: ₩30,000 per hour · after 10 p.m.: ₩50,000 per hour (paid to the driver on site)","時間を超えると1時間30,000ウォン・夜10時以降は1時間50,000ウォン（現地でドライバーに）","超时每小时30,000韩元·晚上10点后每小时50,000韩元（现场付给司机）","超時每小時30,000韓元·晚上10點後每小時50,000韓元（現場付給司機）","Si te pasas de las horas: ₩30.000 por hora · después de las 22:00: ₩50.000 por hora (se paga al conductor en el momento)")];
var CT_HLG=T6("안내가 필요하면 공인 가이드를 추가할 수 있어요 (하루 360,000원)","Add a licensed guide if you'd like explanations (₩360,000 a day)","案内が必要なら公認ガイドを追加できます（1日360,000ウォン）","如需讲解可加持证导游（每天360,000韩元）","如需講解可加持證導遊（每天360,000韓元）","Si quieres explicaciones, añade un guía con licencia (₩360.000 al día)");
var CT_HLI=T6("기름값·통행료·주차비·기사 식사가 가격에 포함돼요","Fuel, tolls, parking and the driver's meals are included","燃料代・高速料金・駐車料金・ドライバーの食事が料金に含まれます","价格已含油费·过路费·停车费·司机餐费","價格已含油費·過路費·停車費·司機餐費","Incluye combustible, peajes, aparcamiento y comidas del conductor");
var CT_NFIX=T6("정해진 코스라 장소와 순서는 변경할 수 없어요. 코스를 직접 짜려면 「가이드 인솔 자유여행」을 이용하세요.","This is a set route, so the places and their order can't be changed. To plan your own route, use “Travel with Guide”.","決まったコースのため、場所と順番は変えられません。コースを自分で決めたい場合は「ガイド同行の自由旅行」をご利用ください。","这是固定路线，景点和顺序不能更改。如想自己安排路线，请使用「向导陪同自由行」。","這是固定路線，景點和順序不能更改。如想自己安排路線，請使用「嚮導陪同自由行」。","Es una ruta fija: no se pueden cambiar los lugares ni el orden. Para armar tu propia ruta, usa «Viaje con guía».");
var CT_NLEAD=T6("이용 3일 전까지 예약할 수 있어요.","Book at least 3 days ahead.","ご利用の3日前まで予約できます。","需在使用日前3天预约。","需在使用日前3天預約。","Reserva con al menos 3 días de antelación.");
var CT_NDRV=T6("기사는 운전만 하고 기본 회화만 가능해요. 관광지 내부에는 동행하지 않아요.","The driver only drives and speaks basic conversational language. The driver doesn't go inside the attractions with you.","ドライバーは運転のみで、簡単な会話だけできます。観光地の中には同行しません。","司机只负责驾驶，只能进行简单对话，不陪同进入景点。","司機只負責駕駛，只能進行簡單對話，不陪同進入景點。","El conductor solo conduce y habla a nivel básico. No entra contigo en los lugares.");
var CT_FQG={q:T6("가이드 없이도 되나요?","Can I go without a guide?","ガイドなしでも大丈夫ですか？","不带导游可以吗？","不帶導遊可以嗎？","¿Puedo ir sin guía?"),a:T6("네. 기본은 기사만 동행해요. 설명이 필요하면 예약 시 「가이드 추가」를 선택하세요 (하루 360,000원).","Yes. By default only the driver comes along. If you'd like explanations, choose “Add a guide” when booking (₩360,000 a day).","はい。基本はドライバーのみ同行します。案内が必要なら、予約時に「ガイドを追加」を選んでください（1日360,000ウォン）。","可以。默认只有司机同行。如需讲解，预约时请选择「加导游」（每天360,000韩元）。","可以。預設只有司機同行。如需講解，預約時請選擇「加導遊」（每天360,000韓元）。","Sí. Por defecto solo va el conductor. Si quieres explicaciones, elige «Añadir guía» al reservar (₩360.000 al día).")};
var CT_FQC={q:T6("코스를 바꿀 수 있나요?","Can I change the route?","コースを変えられますか？","可以更改路线吗？","可以更改路線嗎？","¿Puedo cambiar la ruta?"),a:T6("아니요. 정해진 코스예요. 원하는 장소로 이동하려면 「차량 대절」이나 「가이드 인솔 자유여행」을 이용하세요.","No, it's a set route. To go where you like, use “Private Car Charter” or “Travel with Guide”.","いいえ、決まったコースです。行きたい場所へ行くなら「貸切チャーター」か「ガイド同行の自由旅行」をご利用ください。","不可以，这是固定路线。如想去自选地点，请使用「包车」或「向导陪同自由行」。","不可以，這是固定路線。如想去自選地點，請使用「包車」或「嚮導陪同自由行」。","No, es una ruta fija. Para ir a donde quieras, usa «Coche privado con conductor» o «Viaje con guía».")};
var CT_FQH={q:T6("이용 시간을 초과하면 어떻게 되나요?","What if we go over the hours?","時間を超えたらどうなりますか？","超时怎么办？","超時怎麼辦？","¿Y si nos pasamos de las horas?"),a:T6("1시간에 30,000원이고, 밤 10시 이후는 1시간에 50,000원이에요. 현장에서 기사에게 지불해 주세요.","It's ₩30,000 per hour, and ₩50,000 per hour after 10 p.m. Please pay the driver on site.","1時間30,000ウォン、夜10時以降は1時間50,000ウォンです。現地でドライバーにお支払いください。","每小时30,000韩元，晚上10点后每小时50,000韩元，请现场付给司机。","每小時30,000韓元，晚上10點後每小時50,000韓元，請現場付給司機。","Son ₩30.000 por hora, y ₩50.000 por hora después de las 22:00. Págalo al conductor en el momento.")};
var CT_PX=T6("입장료·손님 식사 별도","Admission & your meals extra","入場料・お客様の食事は別途","门票·您的餐费另付","門票·您的餐費另付","Entradas y tus comidas aparte");
var CT_STEP3=T6("숙소 도착·하차 (픽업부터 10시간)","Drop-off at your hotel (10 hours from pickup)","ホテルでお送り（お迎えから10時間）","送您回住处（从接您起10小时）","送您回住處（從接您起10小時）","Te dejamos en tu hotel (10 horas desde la recogida)");
var CT_STEP2=T6("코스 장소를 순서대로 관람","Visit the places on the route in order","コースの場所を順番に見学","按顺序游览路线上的景点","按順序遊覽路線上的景點","Visitas los lugares de la ruta en orden");
var P=[
 // ── 프라이빗 카투어 4개 (11-14 사장님 「패키지 투어를 프라이빗 카투어로」「실행해」) — 코스·값은 charter.js CTD(ct_data.json) · 예약 칸은 charter.js(CHR, 코스 방식) · 주문 = 차량 대절 길(pid chr + chr.crs)
 {id:"ctsel",c:"tour",img:"ct_seoul",real:"pkg",price:300000,
  t:T6("서울 시내 프라이빗 카투어","Seoul City Private Car Tour","ソウル市内 プライベートカーツアー","首尔市区私人包车游","首爾市區私人包車遊","Tour privado en coche por Seúl"),
  f:[T6("10시간","10 hours","10時間","10小时","10小時","10 h"),CT_CAP,CT_DRV,T6("코스 2개 중 선택","Choose 1 of 2 routes","2コースから選択","2条路线任选","2條路線任選","Elige 1 de 2 rutas")],
  d:T6("기사가 운전하는 전용 승합차로 서울의 유명 관광지를 하루 동안 관광해요. 「서울 클래식」(경복궁·북촌·인사동·N서울타워·명동)과 「한류·쇼핑」(성수동·압구정·코엑스 별마당도서관·롯데월드타워) 중에서 하나를 선택하세요. 기사는 운전만 하고, 안내가 필요하면 가이드를 추가할 수 있어요.","Spend a day seeing Seoul's best-known places in a private minivan with a driver. Choose “Seoul Classic” (Gyeongbokgung, Bukchon, Insadong, N Seoul Tower, Myeongdong) or “K-Culture & Shopping” (Seongsu-dong, Apgujeong, COEX Starfield Library, Lotte World Tower). The driver only drives; add a guide if you'd like explanations.","ドライバーが運転する専用ワゴン車で、ソウルの名所を1日かけて回ります。「ソウル・クラシック」（景福宮・北村・仁寺洞・Nソウルタワー・明洞）と「韓流・ショッピング」（聖水洞・狎鴎亭・COEXピョルマダン図書館・ロッテワールドタワー）から選んでください。ドライバーは運転のみで、案内が必要ならガイドを追加できます。","由司机驾驶的专属商务车带您一天游遍首尔名胜。请在「首尔经典」（景福宫·北村·仁寺洞·N首尔塔·明洞）和「韩流·购物」（圣水洞·狎鸥亭·COEX星空图书馆·乐天世界塔）中选择一条。司机只负责驾驶，如需讲解可加导游。","由司機駕駛的專屬商務車帶您一天遊遍首爾名勝。請在「首爾經典」（景福宮·北村·仁寺洞·N首爾塔·明洞）和「韓流·購物」（聖水洞·狎鷗亭·COEX星空圖書館·樂天世界塔）中選擇一條。司機只負責駕駛，如需講解可加導遊。","Recorre en un día los lugares más famosos de Seúl en un monovolumen privado con conductor. Elige «Seúl clásico» (Gyeongbokgung, Bukchon, Insadong, Torre N Seúl, Myeongdong) o «Cultura coreana y compras» (Seongsu-dong, Apgujeong, Biblioteca Starfield de COEX, Lotte World Tower). El conductor solo conduce; añade un guía si quieres explicaciones.")},
 {id:"ctdmz",c:"tour",img:"ct_dmz",real:"pkg",price:710000,
  t:T6("DMZ 프라이빗 카투어 (가이드 포함)","DMZ Private Car Tour (with guide)","DMZ プライベートカーツアー（ガイド付き）","DMZ私人包车游（含导游）","DMZ私人包車遊（含導遊）","Tour privado en coche a la DMZ (con guía)"),
  f:[T6("8시간","8 hours","8時間","8小时","8小時","8 h"),CT_CAP,T6("공인 가이드 포함","Licensed guide included","公認ガイド付き","含持证导游","含持證導遊","Guía con licencia incluido"),T6("DMZ 입장권 포함","DMZ admission included","DMZ入場券込み","含DMZ门票","含DMZ門票","Entrada a la DMZ incluida")],
  d:T6("기사가 운전하는 전용 승합차에 공인 가이드가 동승해 DMZ로 이동해요. 임진각에서 공식 셔틀로 환승해 제3땅굴과 도라전망대를 관람하고, 평화곤돌라로 캠프그리브스까지 관람한 뒤 숙소로 복귀해요. 가격은 차 1대 기준이고, DMZ 입장권은 인원수만큼 추가돼요.","A licensed guide rides with you in a private minivan with a driver to the DMZ. At Imjingak you switch to the official shuttle to see the 3rd Infiltration Tunnel and Dora Observatory, then take the Peace Gondola to Camp Greaves before heading back to your hotel. The price is per car; DMZ admission is added per person.","ドライバーが運転する専用ワゴン車に公認ガイドが同乗してDMZへ向かいます。臨津閣で公式シャトルに乗り換えて第3トンネルと都羅展望台を見学し、平和ゴンドラでキャンプ・グリーブスを回ってホテルへ戻ります。料金は車1台分で、DMZ入場券は人数分が加算されます。","持证导游与您同乘司机驾驶的专属商务车前往DMZ。在临津阁换乘官方班车参观第三地道和都罗瞭望台，再乘和平缆车游览格里夫斯营地，然后返回住处。价格按车计算，DMZ门票按人数另加。","持證導遊與您同乘司機駕駛的專屬商務車前往DMZ。在臨津閣換乘官方接駁車參觀第三地道和都羅瞭望台，再搭和平纜車遊覽格里夫斯營地，然後返回住處。價格按車計算，DMZ門票按人數另加。","Un guía con licencia viaja contigo a la DMZ en un monovolumen privado con conductor. En Imjingak cambias a la lanzadera oficial para ver el Tercer Túnel y el Observatorio Dora, y luego tomas el Teleférico de la Paz hasta Camp Greaves antes de volver al hotel. El precio es por coche; la entrada a la DMZ se suma por persona.")},
 {id:"ctsub",c:"tour",img:"ct_sub",real:"pkg",price:350000,
  t:T6("서울 근교 프라이빗 카투어","Private Car Tour near Seoul","ソウル近郊 プライベートカーツアー","首尔近郊私人包车游","首爾近郊私人包車遊","Tour privado en coche cerca de Seúl"),
  f:[T6("10시간","10 hours","10時間","10小时","10小時","10 h"),CT_CAP,CT_DRV,T6("코스 5개 중 선택","Choose 1 of 5 routes","5コースから選択","5条路线任选","5條路線任選","Elige 1 de 5 rutas")],
  d:T6("기사가 운전하는 전용 승합차로 서울 근교를 당일로 여행해요. 가평(남이섬·쁘띠프랑스·아침고요수목원), 수원(수원화성·화성행궁·한국민속촌), 용인(에버랜드·한국민속촌), 인천·강화(강화 루지·조양방직·차이나타운·월미도), 춘천(남이섬·강촌레일파크·알파카월드) 중에서 하나를 선택하세요.","Take a day trip from Seoul in a private minivan with a driver. Choose Gapyeong (Nami Island, Petite France, The Garden of Morning Calm), Suwon (Hwaseong Fortress, Hwaseong Haenggung, Korean Folk Village), Yongin (Everland, Korean Folk Village), Incheon & Ganghwa (Ganghwa Luge, Joyang Bangjik, Chinatown, Wolmido) or Chuncheon (Nami Island, Gangchon Rail Park, Alpaca World).","ドライバーが運転する専用ワゴン車で、ソウル近郊へ日帰りで出かけます。加平（南怡島・プチフランス・朝の静寂樹木園）、水原（水原華城・華城行宮・韓国民俗村）、龍仁（エバーランド・韓国民俗村）、仁川・江華（江華リュージュ・朝陽紡織・チャイナタウン・月尾島）、春川（南怡島・江村レールパーク・アルパカワールド）から選んでください。","乘坐司机驾驶的专属商务车，从首尔出发一日游近郊。请在加平（南怡岛·小法国村·晨静树木园）、水原（水原华城·华城行宫·韩国民俗村）、龙仁（爱宝乐园·韩国民俗村）、仁川·江华（江华斜坡滑车·朝阳纺织·中华街·月尾岛）、春川（南怡岛·江村铁路公园·羊驼世界）中选择一条。","搭乘司機駕駛的專屬商務車，從首爾出發一日遊近郊。請在加平（南怡島·小法國村·晨靜樹木園）、水原（水原華城·華城行宮·韓國民俗村）、龍仁（愛寶樂園·韓國民俗村）、仁川·江華（江華斜坡滑車·朝陽紡織·中華街·月尾島）、春川（南怡島·江村鐵路公園·羊駝世界）中選擇一條。","Haz una excursión de un día desde Seúl en un monovolumen privado con conductor. Elige Gapyeong (Isla Nami, Petite France, Jardín de la Calma Matinal), Suwon (Fortaleza Hwaseong, Hwaseong Haenggung, Aldea Folclórica Coreana), Yongin (Everland, Aldea Folclórica Coreana), Incheon y Ganghwa (Luge de Ganghwa, Joyang Bangjik, barrio chino, Wolmido) o Chuncheon (Isla Nami, Gangchon Rail Park, Alpaca World).")},
 {id:"ctgj",c:"tour",img:"ct_gj",real:"pkg",price:760000,
  t:T6("서울–경주 프라이빗 카투어","Seoul–Gyeongju Private Car Tour","ソウル–慶州 プライベートカーツアー","首尔–庆州私人包车游","首爾–慶州私人包車遊","Tour privado en coche Seúl–Gyeongju"),
  f:[T6("당일 12시간 · 1박 2일","Day trip (12 h) · 2 days","日帰り12時間・1泊2日","一日游12小时·两天一夜","一日遊12小時·兩天一夜","Un día (12 h) · 2 días"),CT_CAP,CT_DRV,T6("1박 2일은 기사 숙박·식사 포함","2-day trip: driver's stay & meals included","1泊2日はドライバーの宿泊・食事込み","两天一夜含司机住宿·餐费","兩天一夜含司機住宿·餐費","2 días: alojamiento y comidas del conductor incluidos")],
  d:T6("서울에서 전용 승합차로 신라 천년의 도시 경주를 여행해요. 당일 코스(불국사·석굴암·대릉원·첨성대·황리단길, 12시간)와 1박 2일 코스(1일차 국립경주박물관·대릉원·첨성대·동궁과 월지 야경, 2일차 불국사·석굴암·황리단길) 중에서 선택하세요. 1박 2일은 기사 숙박·식사가 가격에 포함돼 있고, 손님 숙소는 별도로 예약해 주세요.","Travel from Seoul to Gyeongju, the thousand-year capital of Silla, in a private minivan. Choose the day trip (Bulguksa, Seokguram, Daereungwon, Cheomseongdae, Hwangridan-gil; 12 hours) or 2 days (Day 1: Gyeongju National Museum, Daereungwon, Cheomseongdae, Donggung Palace and Wolji Pond at night; Day 2: Bulguksa, Seokguram, Hwangridan-gil). For the 2-day trip the driver's stay and meals are included; please book your own hotel.","ソウルから専用ワゴン車で、新羅千年の都・慶州へ出かけます。日帰りコース（仏国寺・石窟庵・大陵苑・瞻星台・皇理団通り、12時間）と1泊2日コース（1日目 国立慶州博物館・大陵苑・瞻星台・東宮と月池の夜景、2日目 仏国寺・石窟庵・皇理団通り）から選んでください。1泊2日はドライバーの宿泊・食事が料金に含まれ、お客様の宿は別途ご予約ください。","乘坐专属商务车从首尔前往新罗千年古都庆州。请在一日游（佛国寺·石窟庵·大陵苑·瞻星台·皇理团路，12小时）和两天一夜（第1天 国立庆州博物馆·大陵苑·瞻星台·东宫与月池夜景，第2天 佛国寺·石窟庵·皇理团路）中选择。两天一夜已含司机住宿·餐费，您的住宿请另行预订。","搭乘專屬商務車從首爾前往新羅千年古都慶州。請在一日遊（佛國寺·石窟庵·大陵苑·瞻星臺·皇理團路，12小時）和兩天一夜（第1天 國立慶州博物館·大陵苑·瞻星臺·東宮與月池夜景，第2天 佛國寺·石窟庵·皇理團路）中選擇。兩天一夜已含司機住宿·餐費，您的住宿請另行預訂。","Viaja de Seúl a Gyeongju, la capital milenaria de Silla, en un monovolumen privado. Elige la excursión de un día (Bulguksa, Seokguram, Daereungwon, Cheomseongdae, Hwangridan-gil; 12 horas) o 2 días (Día 1: Museo Nacional de Gyeongju, Daereungwon, Cheomseongdae y Donggung y Wolji de noche; Día 2: Bulguksa, Seokguram, Hwangridan-gil). En la de 2 días están incluidos el alojamiento y las comidas del conductor; reserva tú tu hotel.")},
 {id:"b4",c:"kpop",img:"kpop",real:"b4",price:89000,mp:4,
  t:T6("K-POP 빅4 사옥 투어 (HYBE·SM·JYP·YG)","K-pop Big4 Agency Tour (HYBE·SM·JYP·YG)","K-POP BIG4 社屋ツアー（HYBE・SM・JYP・YG）","K-POP四大社参观团（HYBE·SM·JYP·YG）","K-POP四大社參觀團（HYBE·SM·JYP·YG）","Tour de las Big4 del K-pop (HYBE·SM·JYP·YG)"),
  f:[T6("약 8시간","About 8 h","約8時間","约8小时","約8小時","Unas 8 h"),T6("가이드 동행","With a guide","ガイド同行","向导同行","嚮導同行","Con guía")],rt:1,
  d:T6("HYBE·SM·JYP·YG 사옥 외관과 SM KWANGYA(성수) 굿즈샵을 가이드와 함께 돕니다 (외관 관람·사진).","Visit the HYBE, SM, JYP and YG building exteriors and the SM KWANGYA goods shop in Seongsu with a guide (exterior & photos).","HYBE・SM・JYP・YGの社屋外観とSM KWANGYA（聖水）のグッズショップをガイドと巡ります（外観・写真）。","在向导带领下游览HYBE·SM·JYP·YG大楼外观和SM KWANGYA（圣水）周边店（外观·拍照）。","在嚮導帶領下遊覽HYBE·SM·JYP·YG大樓外觀和SM KWANGYA（聖水）周邊店（外觀·拍照）。","Recorre con guía los exteriores de HYBE, SM, JYP y YG y la tienda SM KWANGYA en Seongsu (exterior y fotos).")},
 {id:"perf",c:"show",img:"show",real:"perf",
  t:T6("공연 관람 — 서울 공연장 5곳","Shows — 5 theaters in Seoul","公演鑑賞 — ソウルの劇場5か所","演出观赏 — 首尔5家剧场","演出觀賞 — 首爾5家劇場","Espectáculos — 5 teatros de Seúl"),
  f:[T6("공연 일정","Show schedule","公演日程","演出日程","演出日程","Cartelera"),T6("예매처 연결","Ticket links","チケット購入先","购票链接","購票連結","Venta de entradas"),T6("6개 언어","6 languages","6言語","6种语言","6種語言","6 idiomas")],
  d:T6("공연장마다 지금 하는 공연을 보고, 공식 예매처로 바로 갑니다.","See what’s on at each theater and go straight to the official ticket site.","劇場ごとに上演中の公演を見て、公式チケットサイトへ直接移動します。","查看各剧场正在上演的演出，直接前往官方售票处。","查看各劇場正在上演的演出，直接前往官方售票處。","Mira qué hay en cada teatro y ve directo a la venta oficial de entradas.")},
 {id:"bty",c:"beauty",img:"beauty",price:79000,
  t:T6("K-뷰티 퍼스널컬러 진단 + 메이크업 클래스","K-beauty personal color + makeup class","K-ビューティー パーソナルカラー診断＋メイク教室","K-美妆 个人色彩诊断 + 化妆课","K-美妝 個人色彩診斷 + 化妝課","K-beauty: color personal + clase de maquillaje"),
  f:[T6("2시간","2 h","2時間","2小时","2小時","2 h"),T6("현지 업체 직원이 외국어로 진행","Local staff host in foreign languages","現地スタッフが外国語で進行","当地商家员工用外语进行","當地商家員工用外語進行","Personal local en otros idiomas"),T6("파우치 증정","Free pouch","ポーチ付き","赠送化妆包","贈送化妝包","Neceser de regalo")],
  d:T6("내 피부톤에 맞는 색을 진단받고, 전문 아티스트에게 한국식 메이크업을 배웁니다. 통역이 꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요.","Find the colors that suit your skin tone and learn Korean-style makeup from a pro artist. If you really need an interpreter, you can add one separately by booking a travel guide.","肌の色に合う色を診断し、プロから韓国風メイクを学びます。通訳が必要な場合は、旅行ガイド予約で別途お付けできます。","诊断适合自己肤色的颜色，并向专业化妆师学习韩式妆容。如确需翻译，可另行预约旅行向导。","診斷適合自己膚色的顏色，並向專業化妝師學習韓式妝容。如確需翻譯，可另行預約旅行嚮導。","Descubre los colores que te favorecen y aprende maquillaje coreano con una artista profesional. Si necesitas intérprete, puedes reservar un guía de viaje aparte.")},
 {id:"hr",c:"hair",img:"hair",price:65000,
  t:T6("서울 트렌드 헤어 스타일링","Seoul trend hair styling","ソウルトレンド ヘアスタイリング","首尔潮流发型设计","首爾潮流髮型設計","Peinado de tendencia en Seúl"),
  f:[T6("1.5시간","1.5 h","1.5時間","1.5小时","1.5小時","1,5 h"),T6("현지 업체 직원이 외국어로 진행","Local staff host in foreign languages","現地スタッフが外国語で進行","当地商家员工用外语进行","當地商家員工用外語進行","Personal local en otros idiomas"),T6("강남·홍대","Gangnam·Hongdae","江南・弘大","江南·弘大","江南·弘大","Gangnam·Hongdae")],
  d:T6("K-드라마 스타일 컷·드라이·펌 상담. 원하는 사진만 보여 주면 현지 업체 직원이 외국어로 상담해 드려요. 통역이 꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요.","K-drama style cut, blow-dry or perm. Just show a photo — local staff will help you in a foreign language. If you really need an interpreter, you can add one separately by booking a travel guide.","K-ドラマ風カット・ブロー・パーマの相談。写真を見せるだけで現地スタッフが外国語でご相談に応じます。通訳が必要な場合は、旅行ガイド予約で別途お付けできます。","韩剧风剪发·吹发·烫发咨询。只要给出照片，当地商家员工会用外语为您咨询。如确需翻译，可另行预约旅行向导。","韓劇風剪髮·吹髮·燙髮諮詢。只要給出照片，當地商家員工會用外語為您諮詢。如確需翻譯，可另行預約旅行嚮導。","Corte, secado o permanente estilo K-drama. Enseña una foto y el personal local te atiende en otro idioma. Si necesitas intérprete, puedes reservar un guía de viaje aparte.")},
 {id:"hb",c:"tour",img:"hanbok",price:45000,mp:4,
  t:T6("경복궁 한복 체험 + 궁궐 해설","Hanbok at Gyeongbokgung + palace guide","景福宮 韓服体験＋宮殿解説","景福宫韩服体验 + 宫殿讲解","景福宮韓服體驗 + 宮殿解說","Hanbok en Gyeongbokgung + guía del palacio"),
  f:[T6("3시간","3 h","3時間","3小时","3小時","3 h"),T6("한복 대여 포함","Hanbok rental","韓服レンタル込み","含韩服租赁","含韓服租借","Alquiler de hanbok"),T6("궁 입장 무료","Free palace entry","入場無料","免费入宫","免費入宮","Entrada gratis")],
  d:T6("한복을 입으면 궁 입장이 무료. 가이드가 궁궐의 이야기와 사진 명당을 안내합니다.","Wearing hanbok gets you in free. Your guide shares the palace’s stories and best photo spots.","韓服を着ると入場無料。ガイドが宮殿の物語と写真スポットを案内します。","穿韩服免费入宫。向导讲解宫殿故事并带您去拍照胜地。","穿韓服免費入宮。嚮導講解宮殿故事並帶您去拍照勝地。","Con hanbok entras gratis. Tu guía cuenta la historia del palacio y los mejores rincones para fotos.")},
 {id:"ck",c:"food",img:"cook",price:55000,
  t:T6("김밥·김치 쿠킹 클래스","Kimbap & kimchi cooking class","キンパ・キムチ 料理教室","紫菜包饭·泡菜烹饪课","紫菜包飯·泡菜烹飪課","Clase de cocina: kimbap y kimchi"),
  f:[T6("2.5시간","2.5 h","2.5時間","2.5小时","2.5小時","2,5 h"),T6("재료 포함","Ingredients incl.","材料込み","含食材","含食材","Ingredientes incl."),T6("레시피 카드","Recipe card","レシピカード","食谱卡","食譜卡","Tarjeta de receta")],
  d:T6("직접 만든 김밥과 김치로 점심을 먹고, 레시피 카드를 받아 갑니다.","Eat the kimbap and kimchi you made for lunch and take the recipe card home.","自分で作ったキンパとキムチでランチ。レシピカードも持ち帰れます。","用亲手做的紫菜包饭和泡菜当午餐，还能带走食谱卡。","用親手做的紫菜包飯和泡菜當午餐，還能帶走食譜卡。","Almuerza el kimbap y el kimchi que preparaste y llévate la receta.")},
 {id:"dmz",c:"tour",img:"dmz",price:85000,mp:4,
  t:T6("DMZ 반일 투어","DMZ half-day tour","DMZ 半日ツアー","DMZ半日游","DMZ半日遊","Tour de medio día a la DMZ"),
  f:[T6("6시간","6 h","6時間","6小时","6小時","6 h"),T6("왕복 버스","Round-trip bus","往復バス","往返巴士","往返巴士","Bus ida y vuelta"),T6("여권 필요","Passport needed","パスポート必要","需护照","需護照","Pasaporte")],
  d:T6("전망대에서 북한 땅을 바라보고, 땅굴과 기념관을 가이드 해설로 둘러봅니다.","Look across to North Korea from the observatory and tour the tunnel and memorial with a guide.","展望台から北朝鮮を望み、トンネルと記念館をガイド解説付きで巡ります。","在瞭望台眺望朝鲜，并在向导讲解下参观地道和纪念馆。","在瞭望台眺望北韓，並在嚮導講解下參觀地道和紀念館。","Mira hacia Corea del Norte desde el mirador y visita el túnel y el memorial con guía.")},
 {id:"jj",c:"well",img:"jjim",price:25000,
  t:T6("한국식 찜질방 체험","Korean jjimjilbang spa","韓国式チムジルバン体験","韩式汗蒸房体验","韓式汗蒸幕體驗","Spa coreano jjimjilbang"),
  f:[T6("자유 이용","Stay as long as you like","時間自由","不限时","不限時","Sin límite"),T6("입장권","Entry ticket","入場券","门票","門票","Entrada"),T6("식혜·구운 달걀","Sikhye & baked eggs","シッケ・ゆで卵","甜米露·烤鸡蛋","甜米露·烤雞蛋","Sikhye y huevos")],
  d:T6("한국 사람들의 휴식 공간. 여러 온도의 방과 사우나, 간식까지 한 번에 즐깁니다.","Where Koreans relax: rooms at different temperatures, saunas and snacks in one place.","韓国人の憩いの場。温度の違う部屋やサウナ、おやつまで一度に楽しめます。","韩国人的休闲场所，各种温度的房间、桑拿和小吃一次享受。","韓國人的休閒場所，各種溫度的房間、桑拿和小吃一次享受。","Donde se relajan los coreanos: salas a distintas temperaturas, saunas y tentempiés.")},
 {id:"seal",c:"tour",img:"seal",real:"pkg",price:70000,   // 11-10 사장님 「7만원으로 내려줘」 — 1인 70,000원(옛 100,000원), 도장·인주·고급 나무 케이스·비단 도장 주머니 세트 포함(옛 50,000원 + 도장값 별도)
  t:T6("인사동 전통 도장 만들기","Traditional name seal making in Insadong","仁寺洞 伝統はんこ作り","仁寺洞传统印章制作","仁寺洞傳統印章製作","Sello tradicional con tu nombre en Insadong"),
  f:[T6("1시간","1 h","1時間","1小时","1小時","1 h"),T6("한글·한자·영문 이름 중 선택","Name in Hangul, Hanja or English","ハングル・漢字・英字の名前から選択","可选韩文、汉字或英文名字","可選韓文、漢字或英文名字","Nombre en hangul, hanja o inglés"),T6("도장·인주·나무 케이스 세트","Seal, ink pad & wooden case set","はんこ・朱肉・木箱セット","印章·印泥·木盒套装","印章·印泥·木盒套裝","Set de sello, tampón y estuche de madera")],
  d:T6("인사동 도장 가게에서 장인이 내 이름을 새긴 도장을 그 자리에서 만들어 드립니다. 완성된 도장과 인주를 고급 나무 케이스에 담고, 비단 도장 주머니까지 함께 드리는 세트입니다. 다 되면 바로 가져갑니다.","At a seal shop in Insadong, a master craftsman carves your name into a seal on the spot. You get a set: the seal and an ink pad in a fine wooden case, plus a silk seal pouch. You take it with you as soon as it’s done.","仁寺洞のはんこ店で、職人があなたの名前を彫ったはんこをその場で作ります。できあがったはんこと朱肉を上質な木箱に収め、絹のはんこ袋も付いたセットです。できあがったらすぐに持ち帰れます。","在仁寺洞的印章店，匠人当场为您制作刻有您名字的印章。做好的印章和印泥装在精致的木盒里，并附赠丝绸印章袋。做好后即可带走。","在仁寺洞的印章店，匠人當場為您製作刻有您名字的印章。做好的印章和印泥裝在精緻的木盒裡，並附贈絲綢印章袋。做好後即可帶走。","En una tienda de sellos de Insadong, un maestro artesano graba tu nombre en un sello en el momento. Te llevas un set: el sello y un tampón de tinta en un estuche de madera fino, más una bolsita de seda para el sello. Te lo llevas en cuanto está listo.")},
 {id:"hchk",c:"well",img:"checkup",real:"pkg",price:300000,   // 11-10 사장님 「건강검진은 30만원으로」 — 1인 300,000원 = 패키지 여행비(그 전 500,000원), 1명부터(최소 인원 없음), 가이드는 동행·통역·안내 보조만 · (옛 300,000원) (건강검진비는 검진 센터에 따로) · 병원 이름은 계약 전이라 안 씀
  t:T6("외국인 종합 건강검진","Full health check-up for international visitors","外国人向け総合健康診断","外国人综合体检","外國人綜合健檢","Chequeo médico completo para extranjeros"),
  f:[T6("반나절(약 3~4시간)","Half day (about 3–4 h)","半日（約3〜4時間）","半天（约3~4小时）","半天（約3~4小時）","Medio día (unas 3–4 h)"),T6("결과지 영문, 이메일로 받기","Results in English, by email","結果は英文、メールで受け取り","英文报告，通过邮件接收","英文報告，透過郵件接收","Resultados en inglés, por correo"),HCHK_X],
  d:T6("이름난 대형 건강검진 센터에서 혈액·소변 검사, 흉부 X선, 복부 초음파, 위내시경 같은 기본 종합검진을 받습니다. 외국인 전담 코디네이터가 안내하고, 전날 밤부터 금식합니다. 상품 가격은 패키지 여행비이며, 건강검진비는 검진 센터에 따로 냅니다.","At a well-known large health screening center, you get a basic full check-up: blood and urine tests, chest X-ray, abdominal ultrasound and gastroscopy. A coordinator for international visitors guides you, and you fast from the night before. The price is the package tour fee; the check-up fee is paid to the center separately.","有名な大型健診センターで、血液・尿検査、胸部X線、腹部超音波、胃内視鏡などの基本的な総合健診を受けます。外国人専任のコーディネーターが案内し、前日の夜から絶食します。商品価格はパッケージツアー代金で、健診費用は健診センターに別途お支払いください。","在知名的大型体检中心，接受血液·尿液检查、胸部X光、腹部超声、胃镜等基本综合体检。由外国人专属协调员为您引导，前一天晚上开始禁食。商品价格为跟团游费用，体检费请另行支付给体检中心。","在知名的大型健檢中心，接受血液·尿液檢查、胸部X光、腹部超音波、胃鏡等基本綜合健檢。由外國人專屬協調員為您引導，前一天晚上開始禁食。商品價格為跟團遊費用，健檢費請另行支付給健檢中心。","En un conocido gran centro de chequeos médicos te haces un chequeo completo básico: análisis de sangre y orina, radiografía de tórax, ecografía abdominal y gastroscopia. Un coordinador para extranjeros te guía, y ayunas desde la noche anterior. El precio es la tarifa del tour; el chequeo se paga aparte en el centro.")},
 {id:"chr",c:"tour",img:"charter",real:"pkg",price:300000,   // 11-11 사장님 「그대로 해」 — 차량 대절(기사 딸린 승합차 하루 대절) · 가격은 구간(목적지 가운데 가장 먼 곳, charter.js) · 예약 칸은 charter.js(CHR) · 허브 chr_hub.js
  t:T6("차량 대절","Private Car Charter","貸切チャーター","包车","包車","Coche privado con conductor"),
  f:[T6("최대 10시간","Up to 10 hours","最大10時間","最长10小时","最長10小時","Hasta 10 horas"),T6("최대 7명 · 승합차","Up to 7 people · minivan","最大7名・ワゴン車","最多7人·商务车","最多7人·商務車","Hasta 7 personas · monovolumen"),T6("기름값·통행료 포함","Fuel & tolls included","燃料代・高速料金込み","含油费·过路费","含油費·過路費","Combustible y peajes incluidos"),T6("운전 기사 전용 · 관광 안내 없음","Driver only · no tour guiding","ドライバーのみ・観光案内なし","仅含司机·不含导游讲解","僅含司機·不含導遊講解","Solo conductor · sin guía turístico")],   // 11-14 사장님 「클룩이나 타 사이트를 모방 — 기사만·기본 회화 · 투어 가이드 예약 링크」
  d:T6("기사가 딸린 차로 하루 동안 원하는 곳 어디든 갑니다. 목적지는 손님이 정합니다. 운전 기사 전용 서비스로, 기사는 관광지 안내·해설을 하지 않으며 기본 회화만 할 수 있습니다.","A car with a driver takes you anywhere you want for a whole day. You choose the destinations. This is a driver-only service: the driver does not provide tour guiding and speaks basic conversational language only.","ドライバー付きの車で、1日お好きな場所へどこへでも行けます。目的地はお客様が決めます。ドライバーのみのサービスで、観光案内・解説は行わず、簡単な会話のみ可能です。","配司机的专车一整天带您去任何想去的地方，目的地由您决定。本服务仅含司机：司机不提供导游讲解，只能进行简单日常对话。","配司機的專車一整天帶您去任何想去的地方，目的地由您決定。本服務僅含司機：司機不提供導遊講解，只能進行簡單日常對話。","Un coche con conductor te lleva a donde quieras durante todo un día. Tú eliges los destinos. Es un servicio solo de conductor: no hace de guía turístico y solo habla a nivel de conversación básica.")}
];
// 고정 상품 상세 칸 (사장님 10-30 「그대로 해봐」 체험·입장권 화면 개편) — 실제 업체가 없는 예시 상품은 주소·연락처를 비워 두고 「예약 확정 후 안내」로 보인다
//   🔴 이 표를 고치면 worker.js SHOP_FX2 도 같이 (같은 내용 JSON)
var NOTE_ACC=T6("휠체어·유모차 이용이나 어린이 동반은 예약 전에 문의해 주세요.","If you use a wheelchair or stroller, or are bringing children, please ask us before booking.","車いす・ベビーカーのご利用やお子様連れの場合は、予約前にお問い合わせください。","如需使用轮椅、婴儿车或携带儿童，请在预约前咨询。","如需使用輪椅、嬰兒車或攜帶兒童，請在預約前諮詢。","Si usas silla de ruedas o carrito, o vienes con niños, consúltanos antes de reservar.");
var NOTE_SHOE=T6("많이 걷습니다. 편한 신발을 신어 주세요.","There is a lot of walking. Please wear comfortable shoes.","よく歩きます。歩きやすい靴でお越しください。","需要走很多路，请穿舒适的鞋。","需要走很多路，請穿舒適的鞋。","Se camina mucho. Lleva calzado cómodo.");
var EXC_OWN=T6("개인 경비 (식사·음료·쇼핑)","Personal expenses (meals, drinks, shopping)","個人的な費用（食事・飲み物・買い物）","个人花费（餐饮·购物）","個人花費（餐飲·購物）","Gastos personales (comidas, bebidas, compras)");
var EXC_INT=T6("통역 (꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요)","Interpreter (if you really need one, add it by booking a travel guide)","通訳（必要な場合は旅行ガイド予約で別途お付けできます）","翻译（如确需，可另行预约旅行向导）","翻譯（如確需，可另行預約旅行嚮導）","Intérprete (si lo necesitas, resérvalo aparte como guía de viaje)");
var FAQ_MP={q:T6("인원이 모자라면 어떻게 되나요?","What if not enough people book?","人数が足りない場合は？","人数不足怎么办？","人數不足怎麼辦？","¿Y si no se llega al mínimo de personas?"),
 a:T6("같은 날짜 예약이 최소 출발 인원에 못 미치면 출발 24시간 전에 알려 드리고 전액 환불합니다.","If the same date doesn’t reach the minimum, we tell you 24 hours before departure and give you a full refund.","同じ日の予約が最少催行人員に満たない場合は、出発の24時間前までにお知らせし、全額返金します。","同一日期预约不足最少成团人数时，我们会在出发前24小时通知您并全额退款。","同一日期預約不足最少成團人數時，我們會在出發前24小時通知您並全額退款。","Si esa fecha no llega al mínimo, te avisamos 24 horas antes de la salida y te devolvemos todo.")};
var FAQ_GD={q:T6("가이드를 꼭 골라야 하나요?","Do I have to choose a guide?","ガイドは必ず選ぶ必要がありますか？","必须选择向导吗？","必須選擇嚮導嗎？","¿Tengo que elegir un guía?"),
 a:T6("아니요. 가이드를 선택하지 않으면 자동으로 배정해 드립니다.","No. If you don’t choose a guide, we assign one for you automatically.","いいえ。ガイドを選ばない場合は自動で手配します。","不必。如未选择向导，我们会自动为您安排。","不必。如未選擇嚮導，我們會自動為您安排。","No. Si no eliges un guía, te asignamos uno automáticamente.")};   // 11-09 사장님 문구
var FAQ_INT={q:T6("직원이 제 언어를 하나요?","Will the staff speak my language?","スタッフは私の言語を話せますか？","工作人员会说我的语言吗？","工作人員會說我的語言嗎？","¿El personal hablará mi idioma?"),
 a:T6("현지 업체 직원이 외국어로 진행합니다. 통역이 꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요.","Local staff host in foreign languages. If you really need an interpreter, you can add one by booking a travel guide.","現地スタッフが外国語で進行します。通訳が必要な場合は、旅行ガイド予約で別途お付けできます。","由当地商家员工用外语进行。如确需翻译，可另行预约旅行向导。","由當地商家員工用外語進行。如確需翻譯，可另行預約旅行嚮導。","El personal local atiende en otros idiomas. Si necesitas intérprete, puedes reservar un guía de viaje aparte.")};
var MEET_TBD=T6("만나는 곳·시간은 예약이 확정되면 메일로 알려 드립니다.","We’ll email you the meeting point and time once your booking is confirmed.","集合場所・時間は予約確定後にメールでお知らせします。","预约确认后，我们会通过邮件告知集合地点和时间。","預約確認後，我們會透過電子郵件告知集合地點和時間。","Te enviaremos por correo el punto y la hora de encuentro cuando se confirme la reserva.");
var PLACE_TBD=T6("업체 이름·주소는 예약이 확정되면 메일로 알려 드립니다.","We’ll email you the venue name and address once your booking is confirmed.","店名・住所は予約確定後にメールでお知らせします。","预约确认后，我们会通过邮件告知商家名称和地址。","預約確認後，我們會透過電子郵件告知商家名稱和地址。","Te enviaremos por correo el nombre y la dirección del local cuando se confirme la reserva.");
var ALL6=["ko","en","ja","zhs","zht","es"];
var INC_GI=T6("가이드 동행·통역","Guide & interpreting","ガイド同行・通訳","向导陪同·翻译","嚮導陪同·翻譯","Guía e intérprete");   // 11-10 도장·건강검진
var HL_GI=T6("가이드가 동행하며 통역합니다","Your guide comes along and interprets for you","ガイドが同行して通訳します","向导全程陪同并为您翻译","嚮導全程陪同並為您翻譯","Tu guía te acompaña y te hace de intérprete");
var PX={
 // ── 프라이빗 카투어 상세 (11-14) ──
 ctsel:{kind:"car",area:T6("서울 시내","Seoul","ソウル市内","首尔市区","首爾市區","Seúl"),dur:T6("10시간","10 hours","10時間","10小时","10小時","10 horas"),durL:T6("이용 시간","Hours of use","利用時間","使用时长","使用時長","Tiempo de uso"),langs:[],px:CT_PX,
  hl:[T6("숙소 앞에서 승차해, 정해진 코스를 차량으로 편하게 관광해요","Get picked up at your hotel and ride the set route in comfort","ホテル前で乗車し、決まったコースを車で楽に回ります","在住处门口上车，乘车轻松游览固定路线","在住處門口上車，乘車輕鬆遊覽固定路線","Te recogemos en el hotel y recorres la ruta cómodamente en coche"),
   T6("코스 2개 중 하나를 선택해요: 서울 클래식 · 한류·쇼핑","Choose 1 of 2 routes: Seoul Classic · K-Culture & Shopping","2つのコースから選べます：ソウル・クラシック・韓流・ショッピング","2条路线任选其一：首尔经典·韩流·购物","2條路線任選其一：首爾經典·韓流·購物","Elige 1 de 2 rutas: Seúl clásico · Cultura coreana y compras"),CT_HLI,CT_HLG],
  steps:[T6("서울 숙소에서 기사와 합류 (서울 클래식 09:00 · 한류·쇼핑 10:00)","Meet your driver at your hotel in Seoul (Seoul Classic 9:00 · K-Culture & Shopping 10:00)","ソウルのホテルでドライバーと合流（ソウル・クラシック 9:00・韓流・ショッピング 10:00）","在首尔住处与司机会合（首尔经典 9:00·韩流·购物 10:00）","在首爾住處與司機會合（首爾經典 9:00·韓流·購物 10:00）","Te encuentras con el conductor en tu hotel (Seúl clásico 9:00 · Cultura coreana y compras 10:00)"),CT_STEP2,CT_STEP3],
  inc:CT_INC,exc:CT_EXC,
  note:[T6("경복궁은 화요일 휴무예요. 화요일에는 경복궁 대신 창덕궁을 관람해요.","Gyeongbokgung is closed on Tuesdays. On Tuesdays we visit Changdeokgung Palace instead.","景福宮は火曜日休みです。火曜日は景福宮の代わりに昌徳宮に立ち寄ります。","景福宫周二闭馆，周二改去昌德宫。","景福宮週二休館，週二改去昌德宮。","Gyeongbokgung cierra los martes. Los martes visitamos el Palacio Changdeokgung en su lugar."),CT_NDRV,CT_NFIX,CT_NLEAD],
  faq:[CT_FQG,CT_FQC,CT_FQH]},
 ctdmz:{kind:"car",area:T6("DMZ · 파주","DMZ · Paju","DMZ・坡州","DMZ·坡州","DMZ·坡州","DMZ · Paju"),dur:T6("8시간","8 hours","8時間","8小时","8小時","8 horas"),durL:T6("이용 시간","Hours of use","利用時間","使用时长","使用時長","Tiempo de uso"),langs:[],px:T6("곤돌라·손님 식사 별도","Gondola & your meals extra","ゴンドラ・お客様の食事は別途","缆车·您的餐费另付","纜車·您的餐費另付","Teleférico y tus comidas aparte"),
  hl:[T6("공인 자격을 갖춘 관광통역안내사가 전 일정 동행해요","A licensed tour guide is with you from start to finish","公認資格を持つ通訳案内士が最初から最後まで同行します","持证导游全程陪同","持證導遊全程陪同","Un guía turístico con licencia te acompaña de principio a fin"),
   T6("제3땅굴을 관람하고, 도라전망대에서 북한 땅을 조망해요","Walk into the 3rd Infiltration Tunnel and look across to North Korea from Dora Observatory","第3トンネルに入り、都羅展望台から北朝鮮を望みます","进入第三地道，在都罗瞭望台眺望朝鲜","進入第三地道，在都羅瞭望台眺望北韓","Entras en el Tercer Túnel y miras hacia Corea del Norte desde el Observatorio Dora"),
   T6("평화곤돌라로 임진강을 건너 캠프그리브스를 관람해요","Cross the Imjin River by the Peace Gondola to see Camp Greaves","平和ゴンドラで臨津江を渡り、キャンプ・グリーブスを見学します","乘和平缆车跨过临津江，参观格里夫斯营地","搭和平纜車跨過臨津江，參觀格里夫斯營地","Cruzas el río Imjin en el Teleférico de la Paz para ver Camp Greaves"),
   T6("DMZ 입장권과 기름값·통행료·주차비·기사 식사가 가격에 포함돼요","DMZ admission, fuel, tolls, parking and the driver's meals are included","DMZ入場券と燃料代・高速料金・駐車料金・ドライバーの食事が料金に含まれます","价格已含DMZ门票、油费·过路费·停车费·司机餐费","價格已含DMZ門票、油費·過路費·停車費·司機餐費","Incluye la entrada a la DMZ, combustible, peajes, aparcamiento y comidas del conductor")],
  steps:[T6("08:00 서울 숙소에서 기사·가이드와 합류","8:00 Meet your driver and guide at your hotel in Seoul","8:00 ソウルのホテルでドライバー・ガイドと合流","8:00 在首尔住处与司机·导游会合","8:00 在首爾住處與司機·導遊會合","8:00 Te encuentras con el conductor y el guía en tu hotel"),
   T6("09:10 임진각 평화누리공원 · DMZ 입장권 수령 (여권 확인)","9:10 Imjingak Nuri Peace Park · collect DMZ tickets (passport check)","9:10 臨津閣平和ヌリ公園・DMZのチケット受け取り（パスポート確認）","9:10 临津阁和平世界公园·领取DMZ门票（核对护照）","9:10 臨津閣和平世界公園·領取DMZ門票（核對護照）","9:10 Parque de la Paz de Imjingak · recoges las entradas a la DMZ (control de pasaporte)"),
   T6("09:40 공식 셔틀로 제3땅굴·DMZ 전시관·도라전망대 (약 3시간)","9:40 Official shuttle to the 3rd Tunnel, DMZ exhibition hall and Dora Observatory (about 3 hours)","9:40 公式シャトルで第3トンネル・DMZ展示館・都羅展望台（約3時間）","9:40 乘官方班车前往第三地道·DMZ展馆·都罗瞭望台（约3小时）","9:40 搭官方接駁車前往第三地道·DMZ展館·都羅瞭望台（約3小時）","9:40 Lanzadera oficial al Tercer Túnel, la sala de exposiciones de la DMZ y el Observatorio Dora (unas 3 horas)"),
   T6("12:40 점심 (각자 부담)","12:40 Lunch (own expense)","12:40 昼食（各自負担）","12:40 午餐（自费）","12:40 午餐（自費）","12:40 Almuerzo (por tu cuenta)"),
   T6("13:40 평화곤돌라 · 캠프그리브스","13:40 Peace Gondola · Camp Greaves","13:40 平和ゴンドラ・キャンプ・グリーブス","13:40 和平缆车·格里夫斯营地","13:40 和平纜車·格里夫斯營地","13:40 Teleférico de la Paz · Camp Greaves"),
   T6("16:00 숙소 도착","16:00 Back at your hotel","16:00 ホテル到着","16:00 抵达住处","16:00 抵達住處","16:00 Llegada al hotel")],
  inc:[CT_INC[0],T6("공인 관광통역안내사 (가이드)","Licensed tour guide","公認通訳案内士（ガイド）","持证导游","持證導遊","Guía turístico con licencia"),T6("DMZ 입장권 (공식 셔틀·모노레일)","DMZ admission (official shuttle & monorail)","DMZ入場券（公式シャトル・モノレール）","DMZ门票（官方班车·单轨车）","DMZ門票（官方接駁車·單軌車）","Entrada a la DMZ (lanzadera oficial y monorraíl)"),CT_INC[1],CT_INC[2]],
  exc:[T6("곤돌라 이용료 (1명 12,000원부터)","Gondola ride (from ₩12,000 per person)","ゴンドラ料金（1名12,000ウォンから）","缆车费用（每人12,000韩元起）","纜車費用（每人12,000韓元起）","Teleférico (desde ₩12.000 por persona)"),CT_EXC[1],CT_EXC[3],CT_EXC[4]],
  note:[T6("여권 실물을 반드시 지참해 주세요. 사본·사진·유효기간이 지난 여권으로는 입장할 수 없으며, 이 경우 환불되지 않아요.","Bring your actual passport. You can't enter with a copy, a photo or an expired passport, and there is no refund in that case.","パスポートの原本を必ずお持ちください。コピー・写真・期限切れのパスポートでは入れず、その場合は返金できません。","请务必携带护照原件。复印件、照片或过期护照无法入内，此时不予退款。","請務必攜帶護照正本。影本、照片或過期護照無法入內，此時不予退款。","Trae tu pasaporte original. No puedes entrar con una copia, una foto ni un pasaporte caducado, y en ese caso no hay reembolso."),
   T6("예약 시 요청 사항에 동행자 전원의 여권 영문 이름과 국적을 입력해 주세요. DMZ 입장권 사전 예약에 필요해요.","When booking, write the English name (as on the passport) and nationality of everyone in your group in the requests. We need them to book the DMZ tickets.","予約時、ご要望欄に同行者全員のパスポートの英字氏名と国籍をご記入ください。DMZのチケットを事前予約する際に必要です。","预约时请在备注中填写所有同行者的护照英文姓名和国籍，预订DMZ门票时需要。","預約時請在備註中填寫所有同行者的護照英文姓名和國籍，預訂DMZ門票時需要。","Al reservar, escribe en las peticiones el nombre en inglés (como en el pasaporte) y la nacionalidad de todo tu grupo. Lo necesitamos para reservar las entradas a la DMZ."),
   T6("전용차는 민통선 안으로 진입할 수 없어 임진각에서 공식 셔틀로 환승해요. 가이드도 셔틀에 동승해요.","Private cars can't enter the restricted zone, so you switch to the official shuttle at Imjingak. Your guide rides the shuttle with you.","専用車は民間人統制区域に入れないため、臨津閣で公式シャトルに乗り換えます。ガイドもシャトルに同乗します。","专车无法进入民间人控制区，需在临津阁换乘官方班车，导游与您同乘。","專車無法進入民間人控制區，需在臨津閣換乘官方接駁車，導遊與您同乘。","Los coches privados no pueden entrar en la zona restringida, así que en Imjingak cambias a la lanzadera oficial. Tu guía va contigo."),
   T6("DMZ는 월요일·주중 공휴일·설·추석 당일 휴무예요. 군 사정이나 기상 상황으로 당일 폐쇄되거나 일부 장소가 제외될 수 있어요.","The DMZ is closed on Mondays, weekday public holidays and on the days of Seollal and Chuseok. It may close or skip some places on the day for military or weather reasons.","DMZは月曜日・平日の祝日・旧正月と秋夕の当日が休みです。軍の事情や天候により、当日閉鎖されたり一部の場所が除かれたりすることがあります。","DMZ逢周一、工作日公休日及春节·中秋当天休息。因军方情况或天气，当天可能关闭或取消部分景点。","DMZ逢週一、平日國定假日及春節·中秋當天休息。因軍方情況或天氣，當天可能關閉或取消部分景點。","La DMZ cierra los lunes, los festivos entre semana y el día de Seollal y de Chuseok. Puede cerrar o saltarse algún lugar ese día por motivos militares o del tiempo."),
   T6("DMZ 코스 내에서는 사진·영상 촬영이 금지돼요.","Photos and videos are not allowed on the DMZ route.","DMZのコース内では写真・動画を撮影できません。","DMZ路线内禁止拍照·录像。","DMZ路線內禁止拍照·錄影。","No se permiten fotos ni vídeos en la ruta de la DMZ."),
   T6("제3땅굴은 협소하고 경사가 급해요. 편한 신발을 착용하세요. 거동이 불편하신 분이나 휠체어는 입장이 어려워요.","The 3rd Tunnel is narrow and steep. Wear comfortable shoes. It's hard to enter with limited mobility or a wheelchair.","第3トンネルは狭く急です。歩きやすい靴でお越しください。体の不自由な方や車椅子では入るのが難しいです。","第三地道狭窄陡峭，请穿舒适的鞋。行动不便者或轮椅难以进入。","第三地道狹窄陡峭，請穿舒適的鞋。行動不便者或輪椅難以進入。","El Tercer Túnel es estrecho y empinado. Lleva calzado cómodo. Es difícil entrar con movilidad reducida o en silla de ruedas."),
   T6("판문점(JSA)은 일반인 견학이 중단된 상태라 이 투어에 포함되지 않아요.","The JSA (Panmunjom) is not part of this tour; public visits are currently suspended.","板門店（JSA）は一般の見学が停止中のため、このツアーには含まれません。","板门店（JSA）目前暂停一般参观，本行程不含。","板門店（JSA）目前暫停一般參觀，本行程不含。","La JSA (Panmunjom) no está incluida; las visitas del público están suspendidas."),
   T6("미성년자는 보호자가 동행해야 해요.","Minors must come with a guardian.","未成年者は保護者の同伴が必要です。","未成年人须由监护人陪同。","未成年人須由監護人陪同。","Los menores deben venir con un adulto responsable."),CT_NLEAD],
  faq:[{q:T6("여권이 왜 필요한가요?","Why do I need my passport?","なぜパスポートが必要ですか？","为什么需要护照？","為什麼需要護照？","¿Por qué necesito el pasaporte?"),a:T6("DMZ 지역 출입 시 신분을 확인해요. 여권 실물만 인정돼요.","Your ID is checked when entering the DMZ area. Only an actual passport is accepted.","DMZ地域に入る際に身分確認があります。パスポートの原本のみ有効です。","进入DMZ地区时需核对身份，只接受护照原件。","進入DMZ地區時需核對身分，只接受護照正本。","Se comprueba tu identidad al entrar en la DMZ. Solo vale el pasaporte original.")},
   {q:T6("전용차로 DMZ 안까지 이동하나요?","Does the car go into the DMZ?","専用車でDMZの中まで行きますか？","专车能开进DMZ吗？","專車能開進DMZ嗎？","¿El coche entra en la DMZ?"),a:T6("아니요. 민통선 안은 공식 셔틀만 운행할 수 있어서 임진각에서 환승해요. 가이드도 셔틀에 동승해요.","No. Only the official shuttle can go inside, so you switch at Imjingak. Your guide rides with you.","いいえ。区域内は公式シャトルのみ通行できるため、臨津閣で乗り換えます。ガイドも同乗します。","不能。区域内只有官方班车能通行，需在临津阁换乘，导游与您同乘。","不能。區域內只有官方接駁車能通行，需在臨津閣換乘，導遊與您同乘。","No. Solo la lanzadera oficial puede entrar, así que cambias en Imjingak. Tu guía va contigo.")},
   {q:T6("DMZ가 갑자기 폐쇄되면요?","What if the DMZ closes suddenly?","DMZが急に閉鎖されたら？","DMZ突然关闭怎么办？","DMZ突然關閉怎麼辦？","¿Y si la DMZ cierra de repente?"),a:T6("전날까지 확인되면 날짜를 변경하거나 전액 환불해 드려요. 당일 현장에서 폐쇄되면 다른 코스로 진행하고 DMZ 입장권 금액을 환불해 드려요.","If we learn by the day before, you can change the date or get a full refund. If it closes on the day, we continue with another route and refund the DMZ admission.","前日までに分かれば、日付の変更か全額返金をいたします。当日現地で閉鎖された場合は別のコースで進め、DMZ入場券の代金を返金します。","如在前一天得知，可改期或全额退款。如当天现场关闭，将改走其他路线并退还DMZ门票费用。","如在前一天得知，可改期或全額退款。如當天現場關閉，將改走其他路線並退還DMZ門票費用。","Si lo sabemos el día anterior, puedes cambiar la fecha o recibir el reembolso total. Si cierra ese mismo día, seguimos con otra ruta y te devolvemos la entrada a la DMZ.")},
   {q:T6("판문점도 방문하나요?","Do we visit Panmunjom (JSA)?","板門店にも行きますか？","会去板门店吗？","會去板門店嗎？","¿Visitamos Panmunjom (JSA)?"),a:T6("아니요. 판문점(JSA)은 현재 일반인 견학이 중단된 상태예요.","No. Public visits to the JSA are currently suspended.","いいえ。板門店（JSA）は現在一般の見学が停止しています。","不会。板门店（JSA）目前暂停一般参观。","不會。板門店（JSA）目前暫停一般參觀。","No. Las visitas del público a la JSA están suspendidas.")}]},
 ctsub:{kind:"car",area:T6("경기·인천·강원","Gyeonggi · Incheon · Gangwon","京畿・仁川・江原","京畿·仁川·江原","京畿·仁川·江原","Gyeonggi · Incheon · Gangwon"),dur:T6("10시간","10 hours","10時間","10小时","10小時","10 horas"),durL:T6("이용 시간","Hours of use","利用時間","使用时长","使用時長","Tiempo de uso"),langs:[],px:CT_PX,
  hl:[T6("대중교통으로 이동이 불편한 근교를 차량으로 편하게 여행해요","Reach places near Seoul that are a hassle by public transport, comfortably by car","公共交通では行きにくい近郊へ、車で楽に出かけます","乘车轻松前往公共交通不便的近郊","乘車輕鬆前往大眾運輸不便的近郊","Llega cómodamente en coche a lugares cerca de Seúl difíciles en transporte público"),
   T6("코스 5개 중 하나를 선택해요 (하루 한 지역)","Choose 1 of 5 routes (one area a day)","5つのコースから選べます（1日1地域）","5条路线任选其一（一天一个地区）","5條路線任選其一（一天一個地區）","Elige 1 de 5 rutas (una zona al día)"),CT_HLI,CT_HLG],
  steps:[T6("서울 숙소에서 기사와 합류 (가평·춘천 08:00 · 기타 09:00)","Meet your driver at your hotel in Seoul (Gapyeong & Chuncheon 8:00 · others 9:00)","ソウルのホテルでドライバーと合流（加平・春川 8:00・その他 9:00）","在首尔住处与司机会合（加平·春川 8:00·其他 9:00）","在首爾住處與司機會合（加平·春川 8:00·其他 9:00）","Te encuentras con el conductor en tu hotel (Gapyeong y Chuncheon 8:00 · el resto 9:00)"),CT_STEP2,CT_STEP3],
  inc:CT_INC,exc:CT_EXC,
  note:[T6("가평·수원·용인·인천·강화 코스는 350,000원, 춘천 코스는 450,000원이에요.","Gapyeong, Suwon, Yongin and Incheon & Ganghwa routes are ₩350,000; the Chuncheon route is ₩450,000.","加平・水原・龍仁・仁川・江華コースは350,000ウォン、春川コースは450,000ウォンです。","加平·水原·龙仁·仁川·江华路线为350,000韩元，春川路线为450,000韩元。","加平·水原·龍仁·仁川·江華路線為350,000韓元，春川路線為450,000韓元。","Las rutas de Gapyeong, Suwon, Yongin e Incheon y Ganghwa cuestan ₩350.000; la de Chuncheon, ₩450.000."),
   T6("남이섬은 배로 입도해요. 차량은 가평 선착장에서 대기해요.","You reach Nami Island by boat. The car waits at the Gapyeong pier.","南怡島へは船で渡ります。車は加平の船着き場で待ちます。","南怡岛需乘船进入，车辆在加平码头等候。","南怡島需搭船進入，車輛在加平碼頭等候。","A la Isla Nami se llega en barco. El coche espera en el muelle de Gapyeong."),CT_NDRV,CT_NFIX,CT_NLEAD],
  faq:[CT_FQG,CT_FQC,{q:T6("입장권이 포함되나요?","Are tickets included?","入場券は含まれますか？","含门票吗？","含門票嗎？","¿Están incluidas las entradas?"),a:T6("아니요. 남이섬·에버랜드 등의 입장료는 현장에서 별도로 지불해요.","No. Admission to places like Nami Island and Everland is paid separately on site.","いいえ。南怡島・エバーランドなどの入場料は現地で別途お支払いください。","不含。南怡岛、爱宝乐园等门票请在现场另付。","不含。南怡島、愛寶樂園等門票請在現場另付。","No. Las entradas a lugares como la Isla Nami o Everland se pagan aparte allí.")},CT_FQH]},
 ctgj:{kind:"car",area:T6("경주 · 서울 출발","Gyeongju · from Seoul","慶州・ソウル発","庆州·首尔出发","慶州·首爾出發","Gyeongju · desde Seúl"),dur:T6("당일 12시간 · 1박 2일","Day trip 12 h · 2 days","日帰り12時間・1泊2日","一日游12小时·两天一夜","一日遊12小時·兩天一夜","Un día 12 h · 2 días"),durL:T6("이용 시간","Hours of use","利用時間","使用时长","使用時長","Tiempo de uso"),langs:[],px:T6("입장료·손님 식사 별도 (1박 2일은 손님 숙박도)","Admission & your meals extra (and your hotel for the 2-day trip)","入場料・お客様の食事は別途（1泊2日はお客様の宿泊も）","门票·您的餐费另付（两天一夜另含您的住宿）","門票·您的餐費另付（兩天一夜另含您的住宿）","Entradas y tus comidas aparte (y tu hotel en la de 2 días)"),
  hl:[T6("서울 숙소에서 경주까지 환승 없이 한 번에 이동해요","Go straight from your hotel in Seoul to Gyeongju with no transfers","ソウルのホテルから慶州まで乗り換えなしで行けます","从首尔住处直达庆州，无需换乘","從首爾住處直達慶州，無需換乘","Ve directo de tu hotel en Seúl a Gyeongju, sin transbordos"),
   T6("불국사·석굴암 등 세계유산을 차량으로 편하게 관람해요","See World Heritage sites like Bulguksa and Seokguram comfortably by car","仏国寺・石窟庵などの世界遺産を車で楽に巡ります","乘车轻松游览佛国寺·石窟庵等世界遗产","乘車輕鬆遊覽佛國寺·石窟庵等世界遺產","Visita cómodamente en coche patrimonios mundiales como Bulguksa y Seokguram"),
   T6("1박 2일은 동궁과 월지 야경까지 관람해요","The 2-day trip includes Donggung Palace and Wolji Pond at night","1泊2日は東宮と月池の夜景も楽しめます","两天一夜还能欣赏东宫与月池夜景","兩天一夜還能欣賞東宮與月池夜景","La de 2 días incluye Donggung y Wolji de noche"),CT_HLG],
  steps:[T6("당일: 07:00 서울 출발 → 불국사·석굴암 → 대릉원·첨성대 → 황리단길 → 19:00경 서울 도착","Day trip: 7:00 leave Seoul → Bulguksa, Seokguram → Daereungwon, Cheomseongdae → Hwangridan-gil → back in Seoul around 19:00","日帰り：7:00 ソウル出発 → 仏国寺・石窟庵 → 大陵苑・瞻星台 → 皇理団通り → 19:00ごろソウル到着","一日游：7:00 首尔出发 → 佛国寺·石窟庵 → 大陵苑·瞻星台 → 皇理团路 → 约19:00回到首尔","一日遊：7:00 首爾出發 → 佛國寺·石窟庵 → 大陵苑·瞻星臺 → 皇理團路 → 約19:00回到首爾","Un día: 7:00 salida de Seúl → Bulguksa, Seokguram → Daereungwon, Cheomseongdae → Hwangridan-gil → vuelta a Seúl hacia las 19:00"),
   T6("1박 2일 1일차: 07:30 서울 출발 → 국립경주박물관 → 대릉원·첨성대 → 동궁과 월지 야경 → 경주 숙소","2 days, Day 1: 7:30 leave Seoul → Gyeongju National Museum → Daereungwon, Cheomseongdae → Donggung and Wolji at night → your hotel in Gyeongju","1泊2日・1日目：7:30 ソウル出発 → 国立慶州博物館 → 大陵苑・瞻星台 → 東宮と月池の夜景 → 慶州の宿","两天一夜第1天：7:30 首尔出发 → 国立庆州博物馆 → 大陵苑·瞻星台 → 东宫与月池夜景 → 庆州住处","兩天一夜第1天：7:30 首爾出發 → 國立慶州博物館 → 大陵苑·瞻星臺 → 東宮與月池夜景 → 慶州住處","2 días, Día 1: 7:30 salida de Seúl → Museo Nacional de Gyeongju → Daereungwon, Cheomseongdae → Donggung y Wolji de noche → tu hotel en Gyeongju"),
   T6("1박 2일 2일차: 경주 숙소에서 출발 → 불국사 → 석굴암 → 황리단길 → 저녁에 서울 도착","2 days, Day 2: leave your hotel in Gyeongju → Bulguksa → Seokguram → Hwangridan-gil → back in Seoul in the evening","1泊2日・2日目：慶州の宿を出発 → 仏国寺 → 石窟庵 → 皇理団通り → 夕方ソウル到着","两天一夜第2天：从庆州住处出发 → 佛国寺 → 石窟庵 → 皇理团路 → 傍晚回到首尔","兩天一夜第2天：從慶州住處出發 → 佛國寺 → 石窟庵 → 皇理團路 → 傍晚回到首爾","2 días, Día 2: salida de tu hotel en Gyeongju → Bulguksa → Seokguram → Hwangridan-gil → vuelta a Seúl por la tarde")],
  inc:CT_INC.concat([T6("1박 2일: 기사 숙박·식사","2-day trip: driver's accommodation and meals","1泊2日：ドライバーの宿泊・食事","两天一夜：司机住宿·餐费","兩天一夜：司機住宿·餐費","2 días: alojamiento y comidas del conductor")]),
  exc:[CT_EXC[0],CT_EXC[1],T6("손님 숙박 (1박 2일)","Your own accommodation (2-day trip)","お客様の宿泊（1泊2日）","您的住宿（两天一夜）","您的住宿（兩天一夜）","Tu alojamiento (2 días)"),CT_EXC[2],CT_EXC[3],CT_EXC[4]],
  note:[T6("서울–경주는 차량으로 약 4시간이에요.","Seoul to Gyeongju is about 4 hours by car.","ソウル–慶州は車で約4時間です。","首尔到庆州车程约4小时。","首爾到慶州車程約4小時。","De Seúl a Gyeongju hay unas 4 horas en coche."),
   T6("1박 2일은 경주 숙소를 손님이 별도로 예약해 주세요. 「숙소」 메뉴에서 검색할 수 있어요. 2일차에는 기사가 그 숙소에서 픽업해요.","For the 2-day trip, please book your own hotel in Gyeongju (find one in the Stay menu). On Day 2 the driver picks you up there.","1泊2日は慶州の宿をお客様ご自身でご予約ください（「宿泊」メニューで探せます）。2日目はドライバーがその宿でお迎えします。","两天一夜请自行预订庆州住处（可在「住宿」菜单查找），第2天司机在该住处接您。","兩天一夜請自行預訂慶州住處（可在「住宿」選單查找），第2天司機在該住處接您。","En la de 2 días, reserva tú el hotel en Gyeongju (búscalo en el menú de alojamiento). El Día 2 el conductor te recoge allí."),CT_NDRV,CT_NFIX,CT_NLEAD],
  faq:[{q:T6("당일 여행도 괜찮나요?","Is a day trip enough?","日帰りでも大丈夫ですか？","一日往返可以吗？","一日往返可以嗎？","¿Basta con un día?"),a:T6("네. 왕복 약 8시간이 소요되고 경주에서 약 4시간 관광해요. 여유 있게 관광하려면 1박 2일을 추천해요.","Yes. The drive takes about 8 hours in total, leaving about 4 hours in Gyeongju. For a relaxed visit we recommend 2 days.","はい。往復で約8時間かかり、慶州で約4時間過ごします。ゆっくり見たいなら1泊2日がおすすめです。","可以。往返约需8小时，在庆州约停留4小时。想从容游览建议两天一夜。","可以。往返約需8小時，在慶州約停留4小時。想從容遊覽建議兩天一夜。","Sí. El viaje de ida y vuelta lleva unas 8 horas y pasas unas 4 en Gyeongju. Para ir con calma, recomendamos 2 días.")},
   {q:T6("1박 2일 숙소는요?","What about the hotel for the 2-day trip?","1泊2日の宿は？","两天一夜的住宿呢？","兩天一夜的住宿呢？","¿Y el hotel en la de 2 días?"),a:T6("손님 숙소는 별도로 예약해 주세요. 기사 숙박·식사는 가격에 포함돼 있어요.","Please book your own hotel. The driver's accommodation and meals are included in the price.","お客様の宿は別途ご予約ください。ドライバーの宿泊・食事は料金に含まれます。","您的住宿请另行预订，司机住宿·餐费已含在价格中。","您的住宿請另行預訂，司機住宿·餐費已含在價格中。","Reserva tú tu hotel. El alojamiento y las comidas del conductor están incluidos.")},CT_FQG,CT_FQH]},
 b4:{kind:"tour",area:T6("마포·용산·삼성·성수·강동","Mapo · Yongsan · Samseong · Seongsu · Gangdong","麻浦・龍山・三成・聖水・江東","麻浦·龙山·三成·圣水·江东","麻浦·龍山·三成·聖水·江東","Mapo · Yongsan · Samseong · Seongsu · Gangdong"),
  dur:T6("약 8시간","About 8 h","約8時間","约8小时","約8小時","Unas 8 h"),langs:ALL6,conf:"24h",
  hl:[T6("HYBE·SM·JYP·YG 사옥 외관을 하루에 모두 돌아봅니다","See the HYBE, SM, JYP and YG buildings all in one day","HYBE・SM・JYP・YGの社屋外観を1日ですべて巡ります","一天内游览HYBE·SM·JYP·YG全部大楼外观","一天內遊覽HYBE·SM·JYP·YG全部大樓外觀","Ve los edificios de HYBE, SM, JYP y YG en un solo día"),
   T6("성수 SM KWANGYA 굿즈샵에 들릅니다","Stop by the SM KWANGYA goods shop in Seongsu","聖水のSM KWANGYAグッズショップに立ち寄ります","顺路逛圣水SM KWANGYA周边店","順路逛聖水SM KWANGYA周邊店","Pasa por la tienda SM KWANGYA en Seongsu"),
   T6("삼성동 코엑스 아티움(SM)도 지나갑니다","Also pass COEX Artium (SM) in Samseong","三成洞のCOEXアティウム（SM）にも立ち寄ります","途经三成洞COEX Artium（SM）","途經三成洞COEX Artium（SM）","También pasamos por COEX Artium (SM) en Samseong"),
   T6("사옥 앞에서 사진을 찍습니다 (외관 관람)","Take photos in front of each building (exterior only)","社屋の前で写真を撮ります（外観のみ）","在大楼前拍照（仅外观）","在大樓前拍照（僅外觀）","Fotos frente a cada edificio (solo exterior)")],
  steps:[T6("YG 사옥 (마포 합정)","YG building (Hapjeong, Mapo)","YG社屋（麻浦・合井）","YG大楼（麻浦合井）","YG大樓（麻浦合井）","Edificio de YG (Hapjeong, Mapo)"),
   T6("HYBE 사옥 (용산)","HYBE building (Yongsan)","HYBE社屋（龍山）","HYBE大楼（龙山）","HYBE大樓（龍山）","Edificio de HYBE (Yongsan)"),
   T6("SM 코엑스 아티움 (삼성동)","SM COEX Artium (Samseong)","SM COEXアティウム（三成洞）","SM COEX Artium（三成洞）","SM COEX Artium（三成洞）","SM COEX Artium (Samseong)"),
   T6("SM KWANGYA 굿즈샵 (성수)","SM KWANGYA goods shop (Seongsu)","SM KWANGYAグッズショップ（聖水）","SM KWANGYA周边店（圣水）","SM KWANGYA周邊店（聖水）","Tienda SM KWANGYA (Seongsu)"),
   T6("JYP 사옥 (강동)","JYP building (Gangdong)","JYP社屋（江東）","JYP大楼（江东）","JYP大樓（江東）","Edificio de JYP (Gangdong)")],
  inc:[T6("가이드 동행","Guide","ガイド同行","向导同行","嚮導同行","Guía"),T6("5곳 동선 안내 (투어 노선도)","Route through 5 stops (tour map)","5か所のルート案内（路線図）","5处路线引导（路线图）","5處路線引導（路線圖）","Ruta por 5 paradas (mapa del tour)")],
  exc:[T6("사옥 내부 입장","Entry inside the buildings","社屋内部への入場","进入大楼内部","進入大樓內部","Entrada al interior de los edificios"),T6("굿즈 구입비","Goods you buy","グッズ購入費","周边购买费用","周邊購買費用","Compras en la tienda"),EXC_OWN],
  // 만나는 곳 = 노선 첫 곳 YG 사옥 (사장님 11-08 「패키지는 늘 같은 곳에서 만난다」) — 주소는 앱 지도 자료(seoulall·hongdae yg)·노선도 B4LL 과 같음 · 옛 「만나는 곳·시간은 예약 확정 뒤 메일」 줄은 뺌(시간 = 예약한 시작 시간)
  meetN:T6("YG 사옥 앞 (마포 합정)","In front of the YG building (Hapjeong, Mapo)","YG社屋前（麻浦・合井）","YG大楼前（麻浦合井）","YG大樓前（麻浦合井）","Frente al edificio de YG (Hapjeong, Mapo)"),bizKo:"YG엔터테인먼트",addrKo:"서울 마포구 희우정로1길 7",addrEn:"7 Huiujeong-ro 1-gil, Mapo-gu, Seoul",
  note:[NOTE_SHOE,T6("한 주문 최대 10명 · 결제 후 1개월 안의 예약일에 1회 진행합니다.","Up to 10 people per order · runs once on your booked date within 1 month of payment.","1回の注文で最大10名・決済後1か月以内の予約日に1回実施します。","每笔订单最多10人·付款后1个月内的预约日进行1次。","每筆訂單最多10人·付款後1個月內的預約日進行1次。","Máximo 10 personas por pedido · se realiza una vez en la fecha reservada, dentro de 1 mes desde el pago."),NOTE_ACC],
  faq:[{q:T6("사옥 안에 들어가나요?","Do we go inside the buildings?","社屋の中に入りますか？","会进入大楼内部吗？","會進入大樓內部嗎？","¿Entramos en los edificios?"),a:T6("아니요. 사옥은 외관 관람·사진이고, 굿즈샵(SM KWANGYA)에는 들어갑니다.","No. The buildings are exterior views and photos; we do go into the SM KWANGYA goods shop.","いいえ。社屋は外観と写真で、グッズショップ（SM KWANGYA）には入ります。","不会。大楼为外观参观和拍照，会进入SM KWANGYA周边店。","不會。大樓為外觀參觀和拍照，會進入SM KWANGYA周邊店。","No. Los edificios se ven por fuera y se hacen fotos; sí entramos en la tienda SM KWANGYA.")},FAQ_GD,FAQ_MP]},
 dmz:{kind:"tour",area:T6("DMZ · 서울 출발","DMZ · from Seoul","DMZ・ソウル発","DMZ·首尔出发","DMZ·首爾出發","DMZ · salida desde Seúl"),
  dur:T6("6시간","6 h","6時間","6小时","6小時","6 h"),langs:ALL6,conf:"24h",
  hl:[T6("전망대에서 북한 땅을 바라봅니다","Look across to North Korea from the observatory","展望台から北朝鮮を望みます","在瞭望台眺望朝鲜","在瞭望台眺望北韓","Mira hacia Corea del Norte desde el mirador"),
   T6("땅굴과 기념관을 가이드 해설로 둘러봅니다","Tour the tunnel and memorial with a guide","トンネルと記念館をガイド解説付きで巡ります","在向导讲解下参观地道和纪念馆","在嚮導講解下參觀地道和紀念館","Visita el túnel y el memorial con explicaciones del guía"),
   T6("왕복 버스로 편하게 다녀옵니다","Easy round trip by bus","往復バスで楽に行き来します","乘往返巴士轻松往返","乘往返巴士輕鬆往返","Ida y vuelta cómoda en bus")],
  steps:[T6("서울에서 버스로 출발","Bus departs from Seoul","ソウルからバスで出発","从首尔乘巴士出发","從首爾乘巴士出發","Salida en bus desde Seúl"),T6("전망대","Observatory","展望台","瞭望台","瞭望台","Mirador"),T6("땅굴","Tunnel","トンネル","地道","地道","Túnel"),T6("기념관","Memorial","記念館","纪念馆","紀念館","Memorial"),T6("서울로 돌아오기","Return to Seoul","ソウルへ戻る","返回首尔","返回首爾","Regreso a Seúl")],
  inc:[T6("왕복 버스","Round-trip bus","往復バス","往返巴士","往返巴士","Bus de ida y vuelta"),T6("가이드 해설","Guide commentary","ガイド解説","向导讲解","嚮導講解","Explicaciones del guía")],
  exc:[EXC_OWN],tip:MEET_TBD,
  note:[T6("여권을 꼭 가져오세요. 없으면 참가할 수 없어요.","Bring your passport. You can’t join without it.","パスポートを必ずお持ちください。ないと参加できません。","请务必携带护照，否则无法参加。","請務必攜帶護照，否則無法參加。","Trae tu pasaporte. Sin él no puedes participar."),NOTE_SHOE,NOTE_ACC],
  faq:[{q:T6("여권이 왜 필요하나요?","Why do I need my passport?","なぜパスポートが必要ですか？","为什么需要护照？","為什麼需要護照？","¿Por qué necesito el pasaporte?"),a:T6("DMZ 지역에 들어갈 때 신분을 확인합니다.","Your ID is checked when entering the DMZ area.","DMZ地域に入る際に身分確認があります。","进入DMZ地区时需要核对身份。","進入DMZ地區時需要核對身分。","Se comprueba tu identidad al entrar en la zona de la DMZ.")},FAQ_GD,FAQ_MP]},
 hb:{kind:"tour",area:T6("경복궁 (종로)","Gyeongbokgung (Jongno)","景福宮（鍾路）","景福宫（钟路）","景福宮（鍾路）","Gyeongbokgung (Jongno)"),
  dur:T6("3시간","3 h","3時間","3小时","3小時","3 h"),langs:ALL6,conf:"24h",
  hl:[T6("한복을 입고 궁에 무료로 들어갑니다","Wear hanbok and enter the palace for free","韓服を着て無料で宮殿に入ります","穿韩服免费入宫","穿韓服免費入宮","Con hanbok entras gratis al palacio"),
   T6("가이드가 궁궐의 이야기를 들려 드립니다","Your guide tells the palace’s stories","ガイドが宮殿の物語をお話しします","向导讲述宫殿故事","嚮導講述宮殿故事","Tu guía cuenta la historia del palacio"),
   T6("사진 명당을 안내받습니다","Get shown the best photo spots","写真スポットを案内します","带您去拍照胜地","帶您去拍照勝地","Te llevamos a los mejores rincones para fotos")],
  steps:[T6("한복 고르고 입기","Choose and put on hanbok","韓服を選んで着る","挑选并穿上韩服","挑選並穿上韓服","Elige y ponte el hanbok"),T6("경복궁 입장","Enter Gyeongbokgung","景福宮に入場","进入景福宫","進入景福宮","Entrada a Gyeongbokgung"),T6("가이드 해설로 궁 둘러보기","Palace tour with the guide","ガイド解説で宮殿見学","在向导讲解下参观宫殿","在嚮導講解下參觀宮殿","Recorrido con el guía"),T6("사진 명당에서 사진","Photos at the best spots","写真スポットで撮影","在拍照胜地拍照","在拍照勝地拍照","Fotos en los mejores rincones"),T6("한복 반납","Return the hanbok","韓服を返却","归还韩服","歸還韓服","Devuelves el hanbok")],
  inc:[T6("한복 대여","Hanbok rental","韓服レンタル","韩服租赁","韓服租借","Alquiler de hanbok"),T6("가이드 해설","Guide commentary","ガイド解説","向导讲解","嚮導講解","Explicaciones del guía"),T6("궁 입장 (한복을 입으면 무료)","Palace entry (free in hanbok)","宮殿入場（韓服着用で無料）","入宫（穿韩服免费）","入宮（穿韓服免費）","Entrada al palacio (gratis con hanbok)")],
  exc:[EXC_OWN],tip:MEET_TBD,
  note:[T6("경복궁은 매주 화요일 쉽니다.","Gyeongbokgung is closed on Tuesdays.","景福宮は毎週火曜日が休館です。","景福宫每周二闭馆。","景福宮每週二閉館。","Gyeongbokgung cierra los martes."),NOTE_ACC],
  faq:[{q:T6("한복을 입으면 정말 무료인가요?","Is entry really free in hanbok?","韓服を着ると本当に無料ですか？","穿韩服真的免费吗？","穿韓服真的免費嗎？","¿De verdad es gratis con hanbok?"),a:T6("네. 한복을 입으면 경복궁 입장료를 내지 않습니다.","Yes. If you wear hanbok, you don’t pay the Gyeongbokgung entry fee.","はい。韓服を着ていれば景福宮の入場料はかかりません。","是的。穿韩服无需支付景福宫门票。","是的。穿韓服無需支付景福宮門票。","Sí. Con hanbok no pagas la entrada a Gyeongbokgung.")},FAQ_GD,FAQ_MP]},
 bty:{kind:"class",area:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),dur:T6("2시간","2 h","2時間","2小时","2小時","2 h"),langs:["ko","en"],conf:"24h",
  hl:[T6("내 피부톤에 맞는 색을 진단받습니다","Find the colors that suit your skin tone","肌の色に合う色を診断します","诊断适合自己肤色的颜色","診斷適合自己膚色的顏色","Descubre los colores que te favorecen"),
   T6("전문 아티스트에게 한국식 메이크업을 배웁니다","Learn Korean-style makeup from a pro artist","プロから韓国風メイクを学びます","向专业化妆师学习韩式妆容","向專業化妝師學習韓式妝容","Aprende maquillaje coreano con una profesional"),
   T6("파우치를 선물로 받습니다","Get a free pouch","ポーチのプレゼント付き","赠送化妆包","贈送化妝包","Neceser de regalo")],
  steps:[T6("상담","Consultation","カウンセリング","咨询","諮詢","Consulta"),T6("퍼스널컬러 진단","Personal color analysis","パーソナルカラー診断","个人色彩诊断","個人色彩診斷","Análisis de color personal"),T6("메이크업 실습","Makeup practice","メイク実習","化妆实操","化妝實作","Práctica de maquillaje"),T6("마무리·사진","Finish and photos","仕上げ・写真","收尾·拍照","收尾·拍照","Acabado y fotos")],
  inc:[T6("퍼스널컬러 진단","Personal color analysis","パーソナルカラー診断","个人色彩诊断","個人色彩診斷","Análisis de color personal"),T6("메이크업 클래스","Makeup class","メイク教室","化妆课","化妝課","Clase de maquillaje"),T6("파우치","Pouch","ポーチ","化妆包","化妝包","Neceser")],
  exc:[T6("화장품 구입비","Cosmetics you buy","化粧品の購入費","购买化妆品的费用","購買化妝品的費用","Cosméticos que compres"),EXC_INT],tip:PLACE_TBD,
  note:[T6("맨얼굴이나 가벼운 화장으로 오면 진단이 더 정확해요.","Come bare-faced or with light makeup for a more accurate analysis.","すっぴんか薄化粧で来ると診断がより正確です。","素颜或淡妆前来，诊断会更准确。","素顏或淡妝前來，診斷會更準確。","Ven sin maquillaje o con poco para un análisis más preciso."),NOTE_ACC],
  faq:[FAQ_INT]},
 hr:{kind:"class",area:T6("강남·홍대","Gangnam · Hongdae","江南・弘大","江南·弘大","江南·弘大","Gangnam · Hongdae"),dur:T6("1.5시간","1.5 h","1.5時間","1.5小时","1.5小時","1,5 h"),langs:["ko","en"],conf:"24h",
  hl:[T6("K-드라마 스타일로 컷·드라이·펌 상담","K-drama style cut, blow-dry or perm consultation","K-ドラマ風カット・ブロー・パーマの相談","韩剧风剪发·吹发·烫发咨询","韓劇風剪髮·吹髮·燙髮諮詢","Consulta de corte, secado o permanente estilo K-drama"),
   T6("원하는 사진만 보여 주면 됩니다","Just show a photo of what you want","希望の写真を見せるだけ","只要给出想要的照片","只要給出想要的照片","Solo enseña una foto de lo que quieres")],
  steps:[T6("사진 보여 주며 상담","Consultation with your photo","写真を見せて相談","拿照片咨询","拿照片諮詢","Consulta con tu foto"),T6("시술 (컷·드라이 등)","Styling (cut, blow-dry, etc.)","施術（カット・ブローなど）","造型（剪发·吹发等）","造型（剪髮·吹髮等）","Servicio (corte, secado, etc.)"),T6("마무리 스타일링","Final styling","仕上げのスタイリング","最后造型","最後造型","Peinado final")],
  inc:[T6("상담","Consultation","カウンセリング","咨询","諮詢","Consulta"),T6("스타일링","Styling","スタイリング","造型","造型","Peinado")],
  exc:[EXC_INT,EXC_OWN],tip:PLACE_TBD,
  note:[T6("원하는 머리 모양 사진을 준비해 오세요.","Bring photos of the hairstyle you want.","希望の髪型の写真をご用意ください。","请准备想要的发型照片。","請準備想要的髮型照片。","Trae fotos del peinado que quieres."),NOTE_ACC],
  faq:[FAQ_INT]},
 ck:{kind:"class",area:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),dur:T6("2.5시간","2.5 h","2.5時間","2.5小时","2.5小時","2,5 h"),langs:["ko","en"],conf:"24h",
  hl:[T6("김밥과 김치를 직접 만듭니다","Make kimbap and kimchi yourself","キンパとキムチを自分で作ります","亲手做紫菜包饭和泡菜","親手做紫菜包飯和泡菜","Prepara kimbap y kimchi tú mismo"),
   T6("만든 음식으로 점심을 먹습니다","Eat what you made for lunch","作った料理でランチ","用亲手做的食物当午餐","用親手做的食物當午餐","Almuerza lo que preparaste"),
   T6("레시피 카드를 받아 갑니다","Take home a recipe card","レシピカードを持ち帰れます","带走食谱卡","帶走食譜卡","Llévate la receta")],
  steps:[T6("재료 소개","Meet the ingredients","材料の紹介","介绍食材","介紹食材","Presentación de ingredientes"),T6("김치 만들기","Make kimchi","キムチ作り","做泡菜","做泡菜","Preparar kimchi"),T6("김밥 말기","Roll kimbap","キンパを巻く","卷紫菜包饭","捲紫菜包飯","Enrollar kimbap"),T6("점심","Lunch","ランチ","午餐","午餐","Almuerzo")],
  inc:[T6("재료","Ingredients","材料","食材","食材","Ingredientes"),T6("만든 음식으로 점심","Lunch of what you made","作った料理のランチ","用做好的食物当午餐","用做好的食物當午餐","Almuerzo con lo que preparas"),T6("레시피 카드","Recipe card","レシピカード","食谱卡","食譜卡","Tarjeta de receta")],
  exc:[EXC_INT],tip:PLACE_TBD,
  note:[T6("음식 알레르기가 있으면 예약할 때 알려 주세요.","Tell us about any food allergies when you book.","食物アレルギーがあれば予約時にお知らせください。","如有食物过敏，请在预约时告知。","如有食物過敏，請在預約時告知。","Avísanos de cualquier alergia al reservar."),NOTE_ACC],
  faq:[{q:T6("채식도 되나요?","Is a vegetarian option possible?","ベジタリアン対応はできますか？","可以做素食吗？","可以做素食嗎？","¿Hay opción vegetariana?"),a:T6("예약할 때 알려 주시면 업체와 확인해 드립니다.","Tell us when you book and we’ll check with the venue.","予約時にお知らせいただければ、店舗に確認します。","预约时告知，我们会与商家确认。","預約時告知，我們會與商家確認。","Avísanos al reservar y lo consultamos con el local.")},FAQ_INT]},
 jj:{kind:"class",area:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),dur:T6("자유 이용","Stay as long as you like","時間自由","不限时","不限時","Sin límite"),langs:["ko","en"],conf:"24h",
  hl:[T6("여러 온도의 방에서 쉽니다","Relax in rooms at different temperatures","温度の違う部屋でくつろぎます","在不同温度的房间里休息","在不同溫度的房間裡休息","Relájate en salas a distintas temperaturas"),
   T6("사우나를 즐깁니다","Enjoy the saunas","サウナを楽しみます","享受桑拿","享受桑拿","Disfruta de las saunas"),
   T6("식혜와 구운 달걀을 맛봅니다","Try sikhye and baked eggs","シッケとゆで卵を味わいます","品尝甜米露和烤鸡蛋","品嚐甜米露和烤雞蛋","Prueba el sikhye y los huevos")],
  steps:[T6("입장","Check in","入場","入场","入場","Entrada"),T6("씻기·사우나","Wash and sauna","入浴・サウナ","洗浴·桑拿","洗浴·桑拿","Baño y sauna"),T6("찜질방에서 쉬기","Rest in the jjimjilbang","チムジルバンで休む","在汗蒸房休息","在汗蒸幕休息","Descanso en el jjimjilbang"),T6("간식","Snacks","おやつ","小吃","小吃","Tentempié")],
  inc:[T6("입장권","Entry ticket","入場券","门票","門票","Entrada"),T6("식혜·구운 달걀","Sikhye & baked eggs","シッケ・ゆで卵","甜米露·烤鸡蛋","甜米露·烤雞蛋","Sikhye y huevos")],
  exc:[T6("마사지·세신 등 추가 서비스","Extra services such as massage or body scrub","マッサージ・あかすりなどの追加サービス","按摩·搓澡等附加服务","按摩·搓澡等附加服務","Servicios extra como masaje o exfoliación"),EXC_OWN],tip:PLACE_TBD,
  note:[T6("목욕탕(사우나)은 남녀가 따로이며 옷을 벗고 이용합니다.","The bath area (sauna) is separated by gender and used without clothes.","浴場（サウナ）は男女別で、裸で利用します。","浴池（桑拿）男女分开，需脱衣使用。","浴池（桑拿）男女分開，需脫衣使用。","La zona de baños (sauna) está separada por sexo y se usa sin ropa."),NOTE_ACC],
  faq:[{q:T6("찜질방 안에서는 무엇을 입나요?","What do I wear inside?","チムジルバンでは何を着ますか？","汗蒸房里穿什么？","汗蒸幕裡穿什麼？","¿Qué me pongo dentro?"),a:T6("찜질방(공용 공간)에서는 업체가 주는 찜질복을 입습니다.","In the shared jjimjilbang area you wear the clothes the venue gives you.","共用スペースでは施設が用意する館内着を着ます。","在公共区域穿商家提供的汗蒸服。","在公共區域穿商家提供的汗蒸服。","En la zona común llevas la ropa que te da el local.")}]},
 perf:{kind:"ticket",area:T6("서울 공연장 5곳","5 theaters in Seoul","ソウルの劇場5か所","首尔5家剧场","首爾5家劇場","5 teatros de Seúl"),dur:T6("공연마다 다름","Varies by show","公演により異なる","因演出而异","因演出而異","Según la función"),langs:[],conf:"",
  hl:[T6("공연장 5곳의 지금 하는 공연을 한눈에 봅니다","See what’s on at 5 theaters at a glance","劇場5か所の上演中の公演をひと目で","一眼看到5家剧场正在上演的演出","一眼看到5家劇場正在上演的演出","Mira de un vistazo qué hay en 5 teatros"),
   T6("공연 제목·장소를 내 언어로 봅니다","Read show titles and venues in your language","公演名・会場を自分の言語で","用我的语言查看演出名称和地点","用我的語言查看演出名稱和地點","Lee títulos y lugares en tu idioma"),
   T6("공식 예매처로 바로 갑니다","Go straight to the official ticket site","公式チケットサイトへ直接","直接前往官方售票处","直接前往官方售票處","Ve directo a la venta oficial")],
  steps:[T6("공연장 고르기","Pick a theater","劇場を選ぶ","选择剧场","選擇劇場","Elige un teatro"),T6("공연·날짜 고르기","Pick a show and date","公演・日付を選ぶ","选择演出和日期","選擇演出和日期","Elige función y fecha"),T6("공식 예매처에서 결제","Pay on the official ticket site","公式チケットサイトで決済","在官方售票处付款","在官方售票處付款","Paga en la web oficial"),T6("공연 당일 입장","Enter on the show day","公演当日に入場","演出当天入场","演出當天入場","Entra el día de la función")],
  inc:[T6("공연 일정 정보","Show schedules","公演日程の情報","演出日程信息","演出日程資訊","Cartelera"),T6("공식 예매처 연결","Link to the official ticket site","公式チケットサイトへの案内","连接官方售票处","連結官方售票處","Enlace a la venta oficial")],
  exc:[T6("공연 티켓 값 (예매처에서 결제)","Ticket price (paid on the ticket site)","チケット代（チケットサイトで決済）","票价（在售票处付款）","票價（在售票處付款）","Precio de la entrada (se paga en la web de venta)")],
  entry:T6("예매처에서 받은 모바일 티켓을 보여 주거나, 공연장 매표소에서 예매번호로 표를 받습니다. 자세한 방법은 예매처 안내를 따릅니다.","Show the mobile ticket from the ticket site, or collect your ticket at the box office with your booking number. Follow the ticket site’s instructions.","チケットサイトのモバイルチケットを見せるか、劇場窓口で予約番号でチケットを受け取ります。詳しくはチケットサイトの案内に従ってください。","出示售票处的电子票，或在剧场售票处凭预订号取票。具体请按售票处说明。","出示售票處的電子票，或在劇場售票處憑訂票號取票。詳細請依售票處說明。","Muestra la entrada móvil o recógela en taquilla con tu número de reserva. Sigue las indicaciones de la web de venta."),
  note:[T6("좌석·가격·취소 규정은 예매처 기준입니다.","Seats, prices and cancellation rules follow the ticket site.","座席・料金・キャンセル規定はチケットサイトに準じます。","座位、价格和取消规定以售票处为准。","座位、價格和取消規定以售票處為準。","Asientos, precios y cancelaciones siguen las reglas de la web de venta.")],
  faq:[{q:T6("여기서 결제하나요?","Do I pay here?","ここで決済しますか？","在这里付款吗？","在這裡付款嗎？","¿Pago aquí?"),a:T6("아니요. 공연마다 공식 예매처에서 예매·결제합니다.","No. You book and pay on each show’s official ticket site.","いいえ。公演ごとに公式チケットサイトで予約・決済します。","不。每场演出在官方售票处预订和付款。","不。每場演出在官方售票處預訂和付款。","No. Reservas y pagas en la web oficial de cada función.")}]},
 // 11-10 도장·건강검진 — 가이드 동행 상품(hb 꼴) · 최소 인원 없음 · 가게(검진 센터) 계약 전이라 만나는 곳은 「예약 확정 후 안내」 · px = 「별도」 줄
 seal:{kind:"tour",area:T6("인사동 (종로)","Insadong (Jongno)","仁寺洞（鍾路）","仁寺洞（钟路）","仁寺洞（鍾路）","Insadong (Jongno)"),
  dur:T6("1시간","1 h","1時間","1小时","1小時","1 h"),langs:ALL6,conf:"24h",
  hl:[T6("도장과 인주를 고급 나무 케이스에 담고, 비단 도장 주머니까지 함께 드립니다","Your seal and ink pad come in a fine wooden case, with a silk seal pouch","はんこと朱肉を上質な木箱に収め、絹のはんこ袋もお付けします","印章和印泥装在精致的木盒里，并附赠丝绸印章袋","印章和印泥裝在精緻的木盒裡，並附贈絲綢印章袋","El sello y el tampón van en un estuche de madera fino, con una bolsita de seda"),
   T6("장인이 눈앞에서 내 이름을 새겨 도장을 만듭니다","A master craftsman carves your name into a seal right in front of you","職人が目の前であなたの名前を彫ってはんこを作ります","匠人在您眼前刻上您的名字，制作印章","匠人在您眼前刻上您的名字，製作印章","Un maestro artesano graba tu nombre en un sello delante de ti"),
   T6("이름은 한글·한자·영문 중에서 고릅니다","Choose your name in Hangul, Hanja or English","名前はハングル・漢字・英字から選べます","名字可选韩文、汉字或英文","名字可選韓文、漢字或英文","Elige tu nombre en hangul, hanja o inglés"),
   T6("다 만든 도장은 바로 가져갑니다","Take your seal with you as soon as it’s done","できあがったはんこはすぐに持ち帰れます","做好的印章可以马上带走","做好的印章可以馬上帶走","Te llevas el sello en cuanto está listo"),HL_GI],
  steps:[T6("인사동에서 가이드 만나기","Meet your guide in Insadong","仁寺洞でガイドと合流","在仁寺洞与向导会合","在仁寺洞與嚮導會合","Encuentro con tu guía en Insadong"),
   T6("도장 재료·서체 선택","Choose the material and lettering style","はんこの材料・書体を選ぶ","挑选印章材料和字体","挑選印章材料和字體","Eliges el material y el estilo de letra"),
   T6("장인이 이름 새기기","The craftsman carves your name","職人が名前を彫る","匠人刻上您的名字","匠人刻上您的名字","El artesano graba tu nombre"),
   T6("완성된 도장 받기","Pick up your finished seal","完成したはんこを受け取る","领取做好的印章","領取做好的印章","Recoges tu sello terminado")],
  inc:[INC_GI,T6("도장·인주·고급 나무 케이스·비단 도장 주머니 세트","Set: seal, ink pad, fine wooden case and silk seal pouch","はんこ・朱肉・上質な木箱・絹のはんこ袋のセット","印章、印泥、精致木盒和丝绸印章袋套装","印章、印泥、精緻木盒和絲綢印章袋套裝","Set: sello, tampón, estuche de madera fino y bolsita de seda"),T6("가게 예약 대행","Shop booking made for you","お店の予約代行","代为预约店铺","代為預約店家","Reservamos la tienda por ti")],
  exc:[T6("세트 밖의 재료로 바꾸거나 더 사는 것 (가게에 직접 냄)","Upgrading the material or buying extra items (paid directly to the shop)","セット以外の材料への変更や追加購入（お店に直接お支払い）","更换套装以外的材料或另购物品（直接付给店家）","更換套裝以外的材料或另購物品（直接付給店家）","Cambiar a otro material o comprar algo más (se paga directamente en la tienda)"),EXC_OWN],tip:MEET_TBD,
  note:[T6("새길 이름을 한글·한자·영문 중 무엇으로 할지 미리 정해 오세요.","Decide beforehand whether you want your name in Hangul, Hanja or English.","名前をハングル・漢字・英字のどれで彫るか、あらかじめ決めておいてください。","请事先决定名字要用韩文、汉字还是英文刻。","請事先決定名字要用韓文、漢字還是英文刻。","Decide antes si quieres tu nombre en hangul, hanja o inglés."),NOTE_ACC],
  faq:[{q:T6("도장값이 따로 드나요?","Do I pay extra for the seal?","はんこ代は別にかかりますか？","印章需要另外付费吗？","印章需要另外付費嗎？","¿Pago aparte el sello?"),a:T6("아니요. 7만 원에 도장·인주·고급 나무 케이스·비단 도장 주머니 세트가 모두 들어 있습니다. 다른 재료로 바꾸거나 더 사는 것만 가게에 따로 냅니다.","No. The ₩70,000 price includes the full set: seal, ink pad, fine wooden case and silk seal pouch. You only pay the shop separately if you upgrade the material or buy extra items.","いいえ。7万ウォンに、はんこ・朱肉・上質な木箱・絹のはんこ袋のセットがすべて含まれます。材料の変更や追加購入だけ、お店に別途お支払いください。","不需要。7万韩元已包含印章、印泥、精致木盒和丝绸印章袋全套。只有更换材料或另购物品时才需另付给店家。","不需要。7萬韓元已包含印章、印泥、精緻木盒和絲綢印章袋全套。只有更換材料或另購物品時才需另付給店家。","No. Los ₩70.000 incluyen todo el set: sello, tampón, estuche de madera fino y bolsita de seda. Solo pagas aparte en la tienda si cambias de material o compras algo más.")},FAQ_GD]},
 chr:{kind:"car",area:T6("서울·공항 출발","From Seoul or the airport","ソウル・空港発","首尔·机场出发","首爾·機場出發","Desde Seúl o el aeropuerto"),   // 11-11 차량 대절 (charter.js 글과 같게)
  dur:T6("최대 10시간","Up to 10 hours","最大10時間","最长10小时","最長10小時","Hasta 10 horas"),durL:T6("이용 시간","Hours of use","利用時間","使用时长","使用時長","Tiempo de uso"),langs:[],   /* 11-11 사장님 「1가」 — 차량 대절만 「이용 시간 최대 10시간」 */px:T6("기사 식사·주차비·입장료 별도","Driver's meals, parking & admission extra","ドライバーの食事・駐車料金・入場料は別途","司机餐费·停车费·门票另付","司機餐費·停車費·門票另付","Comidas del conductor, aparcamiento y entradas aparte"),
  hl:[T6("기사가 운전하는 승합차로 하루 동안 원하는 곳을 차례로 돌아요","A driver takes you to the places you choose, one after another, all day","ドライバーが運転するワゴン車で、1日お好きな場所を順番に回ります","司机驾驶商务车，一整天按顺序带您去想去的地方","司機駕駛商務車，一整天按順序帶您去想去的地方","Un conductor te lleva en monovolumen a los lugares que elijas, uno tras otro, todo el día"),
   T6("목적지는 손님이 정하고, 끌어서 순서를 바꿀 수 있어요","You choose the destinations and can drag them to change the order","目的地はお客様が決め、ドラッグで順番を変えられます","目的地由您决定，可拖动调整顺序","目的地由您決定，可拖動調整順序","Tú eliges los destinos y puedes arrastrarlos para cambiar el orden"),
   T6("서울 숙소나 인천·김포공항에서 태우고 내려 드려요","We pick you up and drop you off at your hotel in Seoul or at Incheon or Gimpo Airport","ソウルのホテルか仁川・金浦空港でお迎え・お送りします","在首尔的住处或仁川·金浦机场接送您","在首爾的住處或仁川·金浦機場接送您","Te recogemos y te dejamos en tu hotel de Seúl o en los aeropuertos de Incheon y Gimpo"),
   T6("기름값과 고속도로 통행료가 가격에 들어 있어요","Fuel and highway tolls are included in the price","燃料代と高速道路料金は料金に含まれます","价格已包含油费和高速公路费","價格已包含油費和高速公路費","El combustible y los peajes están incluidos en el precio"),
   T6("기사 언어는 한국어·영어 중에서 골라요 (추가 요금 없음)","Choose your driver's language: Korean or English (no extra charge)","ドライバーの言語は韓国語・英語から選べます（追加料金なし）","司机语言可选韩语或英语（不另收费）","司機語言可選韓語或英語（不另收費）","Elige el idioma del conductor: coreano o inglés (sin coste extra)")   /* 11-13 일·중 숨김 — 다시 켜면 「한국어·영어·일본어·중국어」 문구로 되돌린다(백업 shop.js.bak_1113_svc) */],
  steps:[T6("숙소(서울)나 공항에서 기사 만나기","Meet your driver at your hotel (Seoul) or the airport","ホテル（ソウル）か空港でドライバーと合流","在住处（首尔）或机场与司机会合","在住處（首爾）或機場與司機會合","Te encuentras con el conductor en tu hotel (Seúl) o en el aeropuerto"),
   T6("정한 순서대로 목적지 돌기","Visit your destinations in the order you set","決めた順番で目的地を回る","按您定好的顺序前往各目的地","按您定好的順序前往各目的地","Visitas los destinos en el orden que elegiste"),
   T6("숙소나 공항에서 내리기 (픽업부터 10시간)","Drop-off at your hotel or the airport (10 hours from pickup)","ホテルか空港でお送り（お迎えから10時間）","送您回住处或机场（从接您起10小时）","送您回住處或機場（從接您起10小時）","Te dejamos en tu hotel o en el aeropuerto (10 horas desde la recogida)")],
  inc:[T6("카니발급 승합차 1대","1 minivan (Kia Carnival class)","カーニバル級ワゴン車1台","1辆嘉华级商务车","1輛嘉華級商務車","1 monovolumen (tipo Kia Carnival)"),T6("기사 (운전만)","Driver (driving only)","ドライバー（運転のみ）","司机（仅驾驶）","司機（僅駕駛）","Conductor (solo conduce)"),
   T6("기름값·고속도로 통행료","Fuel and highway tolls","燃料代・高速道路料金","油费·高速公路费","油費·高速公路費","Combustible y peajes"),T6("숙소(서울)·공항 픽업과 내려 주기","Pickup and drop-off at your hotel (Seoul) or the airport","ホテル（ソウル）・空港のお迎えとお送り","住处（首尔）·机场接送","住處（首爾）·機場接送","Recogida y regreso en tu hotel (Seúl) o el aeropuerto")],
  exc:(window.CHR&&CHR.T.exl)||[],
  note:[T6("기사는 운전만 하고 관광지 안에는 같이 들어가지 않아요. 안내가 필요하면 「가이드 인솔」을 따로 예약해 주세요.","Your driver only drives and does not go inside the attractions with you. If you need a guide, book “Travel with Guide” separately.","ドライバーは運転のみで、観光地の中には同行しません。案内が必要なら「ガイド同行」を別途ご予約ください。","司机只负责驾驶，不陪同进入景点。如需讲解，请另外预约「向导陪同」。","司機只負責駕駛，不陪同進入景點。如需講解，請另外預約「嚮導陪同」。","El conductor solo conduce y no entra contigo en los lugares. Si necesitas guía, reserva «Viaje con guía» aparte."),
   T6("제주는 섬이라 갈 수 없어요.","Jeju is an island, so the car can't go there.","済州は島のため行けません。","济州是岛屿，无法前往。","濟州是島嶼，無法前往。","Jeju es una isla, así que el coche no puede ir."),
   T6("이용 3일 전까지 예약할 수 있어요. 여러 날 이용하려면 날마다 하나씩 예약해 주세요.","Book at least 3 days ahead. For several days, book each day separately.","ご利用の3日前まで予約できます。複数日ご利用の場合は、1日ずつご予約ください。","需在使用日前3天预约。如需多天使用，请每天分别预约。","需在使用日前3天預約。如需多天使用，請每天分別預約。","Reserva con al menos 3 días de antelación. Para varios días, reserva cada día por separado."),
   T6("큰 짐이 많거나 아이 카시트가 필요하면 요청 사항에 적어 주세요.","If you have a lot of luggage or need a child seat, write it in the requests.","大きな荷物が多い場合やチャイルドシートが必要な場合は、ご要望欄にご記入ください。","如行李较多或需要儿童安全座椅，请在备注中填写。","如行李較多或需要兒童安全座椅，請在備註中填寫。","Si llevas mucho equipaje o necesitas silla infantil, escríbelo en las peticiones.")],
  faq:[{q:T6("가격은 어떻게 정해지나요?","How is the price set?","料金はどう決まりますか？","价格怎么定？","價格怎麼定？","¿Cómo se fija el precio?"),a:T6("목적지 가운데 가장 먼 곳의 구간으로 정해져요. ① 서울 시내 30만 원 · ② 경기·인천 35만 원 · ③ 강원·충청(대전·세종 포함) 45만 원 · ④ 동해안·전라·경상(부산·대구·울산·광주 포함) 70만 원. 목적지를 넣으면 예약 칸에 바로 보여요.","It’s set by the farthest destination: ① Seoul (city) ₩300,000 · ② Gyeonggi · Incheon ₩350,000 · ③ Gangwon · Chungcheong (incl. Daejeon, Sejong) ₩450,000 · ④ East coast · Jeolla · Gyeongsang (incl. Busan, Daegu, Ulsan, Gwangju) ₩700,000. Add destinations and the price shows up right away.","目的地のうち最も遠い場所のエリアで決まります。①ソウル市内30万ウォン・②京畿・仁川35万ウォン・③江原・忠清（大田・世宗を含む）45万ウォン・④東海岸・全羅・慶尚（釜山・大邱・蔚山・光州を含む）70万ウォン。目的地を入れるとすぐに表示されます。","按目的地中最远的地点所在区域计价：①首尔市内30万韩元 · ②京畿·仁川35万韩元 · ③江原·忠清（含大田·世宗）45万韩元 · ④东海岸·全罗·庆尚（含釜山·大邱·蔚山·光州）70万韩元。添加目的地后马上显示价格。","按目的地中最遠的地點所在區域計價：①首爾市內30萬韓元 · ②京畿·仁川35萬韓元 · ③江原·忠清（含大田·世宗）45萬韓元 · ④東海岸·全羅·慶尚（含釜山·大邱·蔚山·光州）70萬韓元。加入目的地後馬上顯示價格。","Se fija por el destino más lejano: ① Seúl (ciudad) ₩300.000 · ② Gyeonggi · Incheon ₩350.000 · ③ Gangwon · Chungcheong (incl. Daejeon y Sejong) ₩450.000 · ④ Costa este · Jeolla · Gyeongsang (incl. Busan, Daegu, Ulsan y Gwangju) ₩700.000. Al añadir destinos, el precio aparece al momento.")},
   {q:T6("기사가 관광지 안까지 같이 가나요?","Does the driver come inside the attractions?","ドライバーは観光地の中まで同行しますか？","司机会陪同进入景点吗？","司機會陪同進入景點嗎？","¿El conductor entra en los lugares conmigo?"),a:T6("아니요. 기사는 운전만 하고 차에서 기다려요. 안내가 필요하면 「가이드 인솔」을 따로 예약해 주세요.","No. Your driver only drives and waits with the car. If you need a guide, book “Travel with Guide” separately.","いいえ。ドライバーは運転のみで、車でお待ちします。案内が必要なら「ガイド同行」を別途ご予約ください。","不会。司机只负责驾驶，在车上等候。如需讲解，请另外预约「向导陪同」。","不會。司機只負責駕駛，在車上等候。如需講解，請另外預約「嚮導陪同」。","No. El conductor solo conduce y te espera en el coche. Si necesitas guía, reserva «Viaje con guía» aparte.")},
   {q:T6("10시간이 넘으면 어떻게 되나요?","What if it goes over 10 hours?","10時間を超えたらどうなりますか？","超过10小时怎么办？","超過10小時怎麼辦？","¿Y si pasa de 10 horas?"),a:T6("1시간에 3만 원이고, 밤 10시부터 아침 7시까지는 1시간에 5만 원이에요. 현장에서 기사에게 내 주세요.","It’s ₩30,000 per hour, and ₩50,000 per hour from 10 p.m. to 7 a.m. Please pay the driver on site.","1時間3万ウォンで、夜10時から朝7時までは1時間5万ウォンです。現地でドライバーにお支払いください。","每小时3万韩元，晚上10点到早上7点每小时5万韩元，请在现场付给司机。","每小時3萬韓元，晚上10點到早上7點每小時5萬韓元，請在現場付給司機。","Son ₩30.000 por hora, y ₩50.000 por hora de 22:00 a 7:00. Págalo al conductor en el momento.")},
   {q:T6("여러 날 이용할 수 있나요?","Can I use it for several days?","複数日利用できますか？","可以连续多天使用吗？","可以連續多天使用嗎？","¿Puedo usarlo varios días?"),a:T6("네. 날마다 하나씩 예약해 주세요.","Yes. Please book each day separately.","はい。1日ずつご予約ください。","可以，请每天分别预约。","可以，請每天分別預約。","Sí. Reserva cada día por separado.")}]},
 hchk:{kind:"tour",area:T6("서울","Seoul","ソウル","首尔","首爾","Seúl"),
  dur:T6("반나절(약 3~4시간)","Half day (about 3–4 h)","半日（約3〜4時間）","半天（约3~4小时）","半天（約3~4小時）","Medio día (unas 3–4 h)"),langs:ALL6,conf:"24h",px:HCHK_X,
  hl:[T6("혈액·소변 검사, 흉부 X선, 복부 초음파, 위내시경 같은 기본 검사를 한 번에 받습니다","Get the basic tests in one visit: blood and urine tests, chest X-ray, abdominal ultrasound and gastroscopy","血液・尿検査、胸部X線、腹部超音波、胃内視鏡などの基本検査を一度に受けます","一次完成血液·尿液检查、胸部X光、腹部超声、胃镜等基本检查","一次完成血液·尿液檢查、胸部X光、腹部超音波、胃鏡等基本檢查","Haz en una sola visita las pruebas básicas: sangre y orina, radiografía de tórax, ecografía abdominal y gastroscopia"),
   T6("외국인 전담 코디네이터가 처음부터 끝까지 안내합니다","A coordinator for international visitors guides you from start to finish","外国人専任のコーディネーターが最初から最後まで案内します","外国人专属协调员从头到尾为您引导","外國人專屬協調員從頭到尾為您引導","Un coordinador para extranjeros te guía de principio a fin"),
   T6("영문 결과지를 이메일로 받습니다","Get your results in English by email","英文の結果をメールで受け取れます","通过电子邮件接收英文体检报告","透過電子郵件接收英文健檢報告","Recibes los resultados en inglés por correo"),HL_GI],
  steps:[T6("검진 센터에서 가이드 만나기","Meet your guide at the check-up center","健診センターでガイドと合流","在体检中心与向导会合","在健檢中心與嚮導會合","Encuentro con tu guía en el centro"),
   T6("접수·문진표 작성","Check-in and health questionnaire","受付・問診票の記入","登记·填写问诊表","報到·填寫問診表","Registro y cuestionario de salud"),
   T6("검사 (혈액·소변·X선·초음파·위내시경 등)","Tests (blood, urine, X-ray, ultrasound, gastroscopy, etc.)","検査（血液・尿・X線・超音波・胃内視鏡など）","检查（血液·尿液·X光·超声·胃镜等）","檢查（血液·尿液·X光·超音波·胃鏡等）","Pruebas (sangre, orina, rayos X, ecografía, gastroscopia, etc.)"),
   T6("건강검진비 결제 (검진 센터에 직접)","Pay the check-up fee (directly to the center)","健診費用の支払い（センターに直接）","支付体检费（直接付给体检中心）","支付健檢費（直接付給健檢中心）","Pagas el chequeo (directamente en el centro)"),
   T6("결과지 받기 (보통 1~2주 뒤 이메일)","Get your results (usually by email 1–2 weeks later)","結果の受け取り（通常1〜2週間後にメール）","接收体检报告（通常1~2周后通过邮件）","接收健檢報告（通常1~2週後透過郵件）","Recibes los resultados (normalmente por correo en 1–2 semanas)")],
  inc:[T6("가이드 동행·통역·안내 보조","Guide: accompanying, interpreting and help on site","ガイドの同行・通訳・案内補助","向导陪同、翻译和引导协助","嚮導陪同、翻譯和引導協助","Guía: acompañamiento, interpretación y ayuda en el lugar")],   /* 11-10 — 예약 대행 뺌(손님이 병원 국제진료센터에 직접 예약) */
  exc:[T6("건강검진비 (검진 센터에 직접 냄)","Check-up fee (paid directly to the center)","健診費用（センターに直接お支払い）","体检费（直接付给体检中心）","健檢費（直接付給健檢中心）","Chequeo médico (se paga directamente en el centro)"),T6("추가 검사비","Extra tests","追加検査費","追加检查费","追加檢查費","Pruebas adicionales"),EXC_OWN],tip:MEET_TBD,
  note:[T6("검진 예약은 고르신 병원의 국제진료센터에 직접 해 주세요. 전화번호와 예약 방법은 저희가 안내해 드립니다.","Please book the check-up directly with the international center of the hospital you choose. We’ll give you the phone number and how to book.","健診の予約は、お選びの病院の国際診療センターに直接お申し込みください。電話番号と予約方法はご案内します。","请直接向您选择的医院国际诊疗中心预约体检，我们会告知电话号码和预约方法。","請直接向您選擇的醫院國際診療中心預約健檢，我們會告知電話號碼和預約方法。","Reserva el chequeo directamente con el centro internacional del hospital que elijas. Te daremos el teléfono y cómo reservar."),
   T6("검진 전날 밤부터 금식합니다. 정확한 시간은 예약이 확정되면 알려 드립니다.","Fast from the night before the check-up. We’ll tell you the exact time once your booking is confirmed.","健診の前日の夜から絶食です。正確な時間は予約確定後にお知らせします。","体检前一天晚上开始禁食，具体时间将在预约确认后告知您。","健檢前一天晚上開始禁食，具體時間將在預約確認後告知您。","Ayunas desde la noche anterior al chequeo. Te diremos la hora exacta cuando se confirme la reserva."),
   T6("복용 중인 약이 있으면 예약할 때 미리 알려 주세요.","If you take any medication, tell us when you book.","服用中の薬があれば、予約時にお知らせください。","如有正在服用的药物，请在预约时告知。","如有正在服用的藥物，請在預約時告知。","Si tomas algún medicamento, avísanos al reservar."),
   T6("여권을 꼭 지참해 주세요. 검진 센터에서 신분을 확인합니다.","Bring your passport. The center checks your ID.","パスポートを必ずお持ちください。健診センターで本人確認があります。","请务必携带护照，体检中心会核对身份。","請務必攜帶護照，健檢中心會核對身分。","Trae tu pasaporte. El centro comprueba tu identidad."),
   T6("결과는 보통 1~2주 뒤 이메일로 받습니다.","Results usually arrive by email 1–2 weeks later.","結果は通常1〜2週間後にメールで届きます。","结果通常在1~2周后通过电子邮件发送。","結果通常在1~2週後透過電子郵件寄送。","Los resultados suelen llegar por correo en 1–2 semanas."),NOTE_ACC],
  faq:[{q:T6("건강검진비는 얼마인가요?","How much is the check-up fee?","健診費用はいくらですか？","体检费是多少？","健檢費是多少？","¿Cuánto cuesta el chequeo?"),a:T6("검진 항목에 따라 다르고, 검진 센터에 직접 냅니다. 상품 가격은 패키지 여행비입니다.","It depends on the tests, and you pay the center directly. The product price is the package tour fee.","検査項目によって異なり、健診センターに直接お支払いいただきます。商品価格はパッケージツアー代金です。","因检查项目而异，直接付给体检中心。商品价格为跟团游费用。","因檢查項目而異，直接付給健檢中心。商品價格為跟團遊費用。","Depende de las pruebas, y se paga directamente en el centro. El precio del producto es la tarifa del tour.")},FAQ_GD]}
};
P.forEach(function(p){ var x=PX[p.id]; if(x) Object.keys(x).forEach(function(k){ if(p[k]==null) p[k]=x[k]; }); });
// 상품 목록 = 허브 /shop/products (관리자 「상품 관리」, 10-29). 허브가 안 되면 위 P 표 그대로 (대비책) · 11-10 도장(seal)·건강검진(hchk) 더해 10개
//   🔴 고정 상품(P 표 10개)은 허브가 base:1 로 주면 이 파일의 P 를 그대로 쓴다 — 토스 심사 중, 글자·분류·가격·상태 안 바뀜
var HP=null, PLc=null;
var PXK=["kind","area","dur","durL","langs","conf","hl","steps","inc","exc","addrKo","addrEn","bizKo","meetN","stn","exit","walk","tip","entImg","tel","note","faq","entry","px"];   // 상세 칸 (10-30) · px = 가격 아래 「별도」 줄 (11-10)
function hubP(x){ var o=hubP0(x), q=(x.fixed&&PX[x.id])||{};   // 고친 고정 상품에 새 칸이 아직 없으면 위 PX 값
  PXK.forEach(function(k){ var v=x[k], empty=v==null||v===""||(Array.isArray(v)&&!v.length); o[k]=empty&&q[k]!=null?q[k]:v; });
  if(!o.kind) o.kind=o.real==="perf"?"ticket":"tour"; return o; }
function hubP0(x){ return {id:x.id,c:x.c,imgs:x.imgs||[],img0:x.img||"",t:x.t,d:x.d,f:x.f||[],price:x.price||0,disc:x.disc||[],free:!!x.free,days:x.days||[],times:x.times||[],max:x.max||20,st:x.st,link:x.link||"",rt:x.rt,mp:x.minPax||0,real:x.real==="perf"?"perf":(x.st==="sale"?"hub":""),hub:1}; }
var HIDE={b4:1,perf:1,bty:1,hr:1,hb:1,ck:1,dmz:1,jj:1,seal:1,hchk:1};   // 11-14 사장님 「1번은 일단 숨겨」 — 체험 상품(허브 SHOP_HIDE 와 같게)
function PL(){ if(!HP) return P.filter(function(p){ return !HIDE[p.id]; }); if(PLc) return PLc; var o=[]; HP.forEach(function(x){ if(x.base){ var q=P.filter(function(p){ return p.id===x.id; })[0]; if(q) o.push(typeof x.minPax==="number"&&x.minPax!==(q.mp||0)?Object.assign({},q,{mp:x.minPax}):q); } else if(x&&x.id&&x.t) o.push(hubP(x)); }); o=o.filter(function(p){ return !HIDE[p.id]; }); PLc=o.length?o:P.filter(function(p){ return !HIDE[p.id]; }); return PLc; }
function loadP(){ return fetch(HUBU+"/shop/products?l="+encodeURIComponent(window.LANG||"en"),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(j&&j.ok&&Array.isArray(j.items)){ HP=j.items; PLc=null; try{ if(window.SMN) SMN.load(j.items); }catch(e){} } }).catch(function(){}); }
function psrc(p,gi){ if(!p.hub) return "img/shop/"+p.img+".webp"; return p.imgs.length?HUBU+"/shop/img/"+p.imgs[Math.min(gi||0,p.imgs.length-1)]:(p.img0||""); }
function unitOf(p,n){ if(!p.hub) return p.real==="b4"?b4Price(n):p.price; var u=p.price; (p.disc||[]).forEach(function(d){ if(n>=d.n) u=d.p; }); return u; }
function fmt(o,n){ return L(o).replace("{n}",n); }
// 차량 대절 (11-11, charter.js) — 값은 「차 1대」 · 합계 = 구간 가격(인원과 상관없음) · 예약 칸·주문 본문은 CHR
function isChr(p){ return !!(p&&window.CHR&&(p.id==="chr"||CHR.isCrs(p.id))); }   // + 프라이빗 카투어 (11-14)
function isCt(p){ return !!(p&&window.CHR&&CHR.isCrs(p.id)); }
function perOf(p){ return isChr(p)?CHR.T.per:TX.per; }
function totOf(p){ return isChr(p)?CHR.amount():unitOf(p,S.n)*S.n+(window.SMN?SMN.appSum(p):0); }
function totTx(p){ if(isCt(p)) CHR.use(p.id); var t=totOf(p); return isChr(p)&&!t?won(CHR.PRICE[1])+"~":won(t); }   // 목적지를 넣기 전엔 「₩300,000~」
function nMax(p){ return isChr(p)?CHR.NMAX:(p&&p.hub?p.max:20); }
function fchips(p){ return p.f.map(function(x){ return '<span>'+esc(L(x))+'</span>'; }).join("")+(p.mp?'<span>'+esc(fmt(TX.mp,p.mp))+'</span>':''); }   // 특징 칩 + 최소 출발 인원 (10-30)
function mpNote(p){ return p&&p.mp?'<p class="snote">'+esc(fmt(TX.mpn,p.mp))+'</p>':''; }
function hubPr(p,sm){ if(!p.price) return ""; return '<div class="spr">'+won(p.price)+(sm?' <small>/ '+esc(L(perOf(p)))+'</small>':' / '+esc(L(perOf(p))))+(p.disc||[]).map(function(d){ return ' · '+esc(fmt(TX.dp,d.n))+' '+won(d.p); }).join("")+'</div>'; }
function noteOf(p){ return p.hub&&!p.real?TX.soon:(p.real?TX.payn:TX.soon2); }
function dayLine(p){ return p.hub&&!p.free&&p.days.length?'<span>'+esc(L(TX.dys))+': '+p.days.map(function(d){ return esc(L(TX.wd[d])); }).join("·")+'</span>':''; }
// ── 화면 개편 도우미 (10-30) ──
function Lx(o){ return o&&typeof o==="object"?(o[window.LANG]||o.en||o.ko||""):(o||""); }
function kindOf(p){ return p.kind||(p.real==="perf"?"ticket":"tour"); }
function isExt(p){ return p.real==="perf"||(p.hub&&!!p.link); }   // 외부 예매처 — 우리 환불 규정·바우처 아님
function kLab(p){ var k=kindOf(p); return k==="car"&&window.CHR?CHR.T.kind:k==="tour"?TX.kT:k==="class"?TX.kC:TX.kK; }   // 차량 대절 = 「기사 딸린 차」 (11-11)
function fcOf(p){ return isChr(p)?CHR.T.cfc:TX.fc; }   // 무료 취소 — 차량 대절은 2일 전 17시까지 (11-11)
function kBadge(p){ var k=kindOf(p); return '<span class="skb skb-'+k+'">'+esc(L(kLab(p)))+'</span>'; }
function fcBadge(p){ return isExt(p)?'':'<span class="sfc">'+esc(L(fcOf(p)))+'</span>'; }
function langTxt(p,max){ var a=(p.langs||[]).filter(function(l){ return LGN[l]&&(!window.svcOn||svcOn(l)); }).map(function(l){ return LGN[l]; }); if(!a.length) return ""; return max&&a.length>max?a.slice(0,max).join(" · ")+" +"+(a.length-max):a.join(" · "); }
function minUnit(p){ if(!p.hub&&p.real==="b4") return 79000; var u=p.price||0; (p.disc||[]).forEach(function(d){ if(d.p&&d.p<u) u=d.p; }); return u; }
function fromPr(p){ var u=minUnit(p); if(u) return '<div class="spr">'+won(u)+'~ <small>/ '+esc(L(perOf(p)))+'</small></div>'; return isExt(p)?'<div class="spr"><small>'+esc(L(TX.pxt))+'</small></div>':''; }
// 가격 아래 「별도」 줄 (11-10 도장·건강검진) — 목록 카드·상세 가격·결제 칸·결제창 · 홈페이지 카드(pc.js·pc_pkg.js)·AI 추천 카드(reco.js)도 같은 class
function pxHtml(p){ var t=Lx(p&&p.px); return t?'<div class="shpx">'+esc(t)+'</div>':''; }
(function(){ var s=document.createElement("style"); s.textContent=".shpx{margin-top:3px;font-size:12.5px;font-weight:700;line-height:1.4;opacity:.85}#shopBox .shpx{color:#495057;opacity:1}"; document.head.appendChild(s); })();
function cardHtml(p){ var meta=[catName(p.c),Lx(p.area)].filter(Boolean).join(" · "), inf=[Lx(p.dur),langTxt(p,3)].filter(Boolean);
  return '<button type="button" class="scard'+(S.prod===p.id?" on":"")+'" data-p="'+p.id+'"><div class="sph">'+(psrc(p)?'<img src="'+esc(psrc(p))+'" alt="" loading="lazy">':'')+(p.real?'<span class="sreal">'+esc(L(TX.real))+'</span>':'<span class="sex">'+esc(L(TX.ex))+'</span>')+'</div>'
   +'<div class="scb"><div class="smeta">'+esc(meta)+'</div><h3>'+esc(L(p.t))+'</h3>'+(inf.length?'<div class="sinf">'+inf.map(function(x){ return '<span>'+esc(x)+'</span>'; }).join("")+'</div>':'')
   +'<div class="sbdg">'+kBadge(p)+fcBadge(p)+'</div>'+fromPr(p)+pxHtml(p)+(window.rvMini?rvMini("shop:"+p.id):'')+'</div></button>'; }
function mapQ(p){ return p.addrKo||""; }
function mapBtns(p){ var q=encodeURIComponent(mapQ(p)); if(!q) return "";
  return '<div class="smaps"><a href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener">'+esc(L(TX.gmap))+'</a><a href="https://map.kakao.com/link/search/'+q+'" target="_blank" rel="noopener">'+esc(L(TX.kmap))+'</a><a href="https://map.naver.com/p/search/'+q+'" target="_blank" rel="noopener">'+esc(L(TX.nmap))+'</a></div>'; }
function liList(a,cls){ return '<ul'+(cls?' class="'+cls+'"':'')+'>'+(a||[]).map(function(x){ return '<li>'+esc(Lx(x))+'</li>'; }).join("")+'</ul>'; }
function galUrls(p){ if(p.hub&&p.imgs&&p.imgs.length) return p.imgs.map(function(x){ return HUBU+"/shop/img/"+x; }); var u=psrc(p); return u?[u]:[]; }
// 상세 본문 (사장님 승인 순서 ①~⑪, 10-30)
function detBody(p){ var K=kindOf(p), X=isExt(p), h='', urls=galUrls(p), gi=Math.min(S.gi||0,Math.max(0,urls.length-1));
  // ① 사진 여러 장 — 옆으로 넘기기
  h+='<div class="sdph"><div class="sgal" id="shopGal">'+urls.map(function(u){ return '<img src="'+esc(u)+'" alt="" draggable="false">'; }).join("")+'</div><span class="stag">'+esc(catName(p.c))+'</span>'+(p.real?'<span class="sreal">'+esc(L(TX.real))+'</span>':'<span class="sex">'+esc(L(TX.ex))+'</span>')+(urls.length>1?'<span class="sgn">'+(gi+1)+' / '+urls.length+'</span>':'')+'</div>'
   +(urls.length>1?'<div class="sdth">'+urls.map(function(u,i){ return '<button type="button" data-gi="'+i+'" class="'+(i===gi?"on":"")+'"><img src="'+esc(u)+'" alt="" loading="lazy"></button>'; }).join("")+'</div>':'');
  // ② 이름·별점·핵심 정보 줄
  var key=[];
  if(Lx(p.dur)) key.push([p.durL||TX.dur,Lx(p.dur)]);   // 차량 대절은 「이용 시간」 (11-11 「1가」)
  if(langTxt(p)) key.push([TX.lng,langTxt(p)]);
  if(K==="car"&&window.CHR){ key.push([CHR.T.dl,CHR.dlTxt()]); key.push([null,fmt(CHR.T.cap,CHR.NMAX)]); }   // 차량 대절 (11-11) — 기사 언어 · 차 1대 최대 7명
  else if(K==="tour") key.push([null,L(TX.kT)]); else if(K==="class") key.push([null,L(TX.gdN)]); else key.push([null,L(TX.kK)]);
  if(!X){ key.push([null,L(TX.vch)]); if(p.conf) key.push([null,L(p.conf==="now"?TX.cfNow:TX.cf24)]); key.push([null,L(fcOf(p)),"g"]); }
  h+='<div class="smeta">'+esc([catName(p.c),Lx(p.area)].filter(Boolean).join(" · "))+'</div><h1 class="sdh">'+esc(L(p.t))+'</h1>'+(window.rvMini?rvMini("shop:"+p.id):'')
   +'<div class="skey">'+key.map(function(k){ return '<span'+(k[2]?' class="g"':'')+'>'+(k[0]?'<small>'+esc(L(k[0]))+'</small> ':'')+esc(k[1])+'</span>'; }).join("")+'</div>'
   +priceHtml(p)+(K==="tour"&&p.mp?'<p class="snote"><b>'+esc(fmt(TX.mp,p.mp))+'</b></p>':'')+(p.hub&&(dayLine(p)||p.max<20)?'<div class="sft">'+dayLine(p)+(p.max<20?'<span>'+esc(fmt(TX.mx,p.max))+'</span>':'')+'</div>':'')
   +(X?'':'<p class="snote">'+esc(L(noteOf(p)))+'</p>');
  // 입장권 — 날짜·입장 방법 크게
  if(K==="ticket") h+='<section class="shbx stk"><div><small>'+esc(L(TX.date))+'</small><b>'+esc(X?L(TX.tkDp):(S.date||"-"))+'</b></div><div><small>'+esc(L(TX.tkE))+'</small><b>'+esc(Lx(p.entry)||L(TX.tkEd))+'</b></div>'+(p.real==="perf"?'<button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button>':'')+'</section>';
  // ③ 이런 걸 해요
  if((p.hl||[]).length||Lx(p.d)) h+='<section class="shbx"><h2>'+esc(L(TX.hl))+'</h2>'+((p.hl||[]).length?liList(p.hl,"shl"):'')+(Lx(p.d)?'<p class="sdd">'+esc(Lx(p.d))+'</p>':'')+'</section>';
  // ④ 진행 순서 — 투어는 코스(노선도), 체험은 단계
  if((p.steps||[]).length) h+='<section class="shbx"><h2>'+esc(L(K==="tour"?TX.stT:TX.stC))+'</h2><ol class="sstps">'+p.steps.map(function(x){ return '<li>'+esc(Lx(x))+'</li>'; }).join("")+'</ol>'+(K==="tour"&&p.rt?'<div>'+rtBtn()+'</div>':'')+'</section>';
  // ⑤ 포함 / 불포함
  if((p.inc||[]).length||(p.exc||[]).length) h+='<section class="shbx"><div class="sie"><div><h2>'+esc(L(TX.inc))+'</h2>'+liList(p.inc,"sin1")+'</div><div><h2>'+esc(L(TX.exc))+'</h2>'+liList(p.exc,"sex1")+'</div></div></section>';
  if(window.SMN) h+=SMN.detHtml(p);   // 가게 메뉴 — 값 안내 (11-10, smenu.js) · 메뉴가 없으면 아무것도 안 그림
  // ⑥ 찾아가는 방법 (투어는 만나는 곳) — 체험은 크게 · 차량 대절은 픽업 장소 안내 (11-11)
  if(K==="car"&&window.CHR) h+='<section class="shbx"><h2>'+esc(L(CHR.T.meet))+'</h2><p class="sline">'+esc(L(isCt(p)?CHR.TC.pkn:CHR.T.meetD))+'</p></section>';   // 카투어 = 서울 숙소 (11-14)
  else if(p.addrKo||Lx(p.tip)||Lx(p.stn)||p.entImg){ var w='';
    if(p.addrKo){ w+='<div class="sadr">'+(Lx(p.meetN)||p.bizKo?'<b>'+esc(Lx(p.meetN)||p.bizKo)+'</b>':'')+'<span>'+esc(p.addrKo)+'</span>'+(p.addrEn?'<span class="sub">'+esc(p.addrEn)+'</span>':'')+'</div>'+mapBtns(p); }
    else w+='<div class="sadr"><b>'+esc(L(TX.tbd))+'</b>'+(Lx(p.area)?'<span>'+esc(Lx(p.area))+'</span>':'')+'</div>';
    if(Lx(p.stn)) w+='<p class="sline"><small>'+esc(L(TX.stn))+'</small> <b>'+esc(Lx(p.stn))+'</b>'+(p.exit?' · '+esc(fmt(TX.ext,p.exit)):'')+(p.walk?' · '+esc(fmt(TX.wk,p.walk)):'')+'</p>';
    if(Lx(p.tip)) w+='<p class="sline">'+(p.addrKo?'<small>'+esc(L(TX.tip))+'</small> ':'')+esc(Lx(p.tip))+'</p>';
    if(p.entImg) w+='<figure class="sent"><img src="'+esc(HUBU+"/shop/img/"+p.entImg)+'" alt="" loading="lazy"><figcaption>'+esc(L(TX.ent))+'</figcaption></figure>';
    if(p.addrKo) w+='<div class="staxi"><small>'+esc(L(TX.tx))+'</small>'+(p.bizKo?'<b class="tb" lang="ko">'+esc(p.bizKo)+'</b>':'')+'<b class="ta" lang="ko">'+esc(p.addrKo)+'</b><p>'+esc(L(TX.txn))+'</p><button type="button" data-s="cpy" data-v="'+esc((p.bizKo?p.bizKo+" ":"")+p.addrKo)+'">'+esc(L(TX.cpy))+'</button></div>';
    h+='<section class="shbx'+(K==="class"?' sbig':'')+'"><h2>'+esc(L(K==="tour"?TX.meet:TX.way))+'</h2>'+w+'</section>'; }
  // ⑦ 당일 이렇게
  var dl=X?[L(TX.dP1)]:(K==="car"&&window.CHR)?(isCt(p)?[L(p.id==="ctdmz"?CHR.TC.d1g:CHR.TC.d1),L(CHR.TC.d2),L(CHR.T.d3)]:[L(CHR.T.d1),L(CHR.T.d2),L(CHR.T.d3)]):[L(TX.d1),L(TX.d2),p.tel?fmt(TX.d3,p.tel):L(TX.d3n)];   // 차량 대절 당일 (11-11)
  h+='<section class="shbx"><h2>'+esc(L(TX.day))+'</h2><ol class="sstps sday">'+dl.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol></section>';
  // ⑧ 알아 두세요 — 최소 출발 인원은 투어만
  var nt=(p.note||[]).map(Lx).filter(Boolean); if(K==="tour"&&p.mp) nt.push(fmt(TX.mp,p.mp)+" — "+fmt(TX.mpn,p.mp));
  if(nt.length) h+='<section class="shbx"><h2>'+esc(L(TX.know))+'</h2><ul>'+nt.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul></section>';
  // ⑨ 취소·환불 — 가이드 사정 문구는 투어만
  if(!X&&K==="car"&&window.CHR) h+='<section class="shbx"><h2>'+esc(L(TX.dRf))+'</h2><ul><li>'+esc(L(CHR.T.rf1))+'</li><li>'+esc(L(CHR.T.rf2))+'</li></ul><p>'+esc(L(CHR.T.rf3))+'</p><p>'+esc(L(TX.rf6))+'</p>'   // 차량 대절 = 2일 전 17시까지 전액 환불, 그 뒤 환불 없음 (11-11)
     +'<a class="srfl" href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rfL))+' ›</a></section>';
  else if(!X) h+='<section class="shbx"><h2>'+esc(L(TX.dRf))+'</h2><ul>'+["rf1","rf2","rf3","rf4"].map(function(k){ return '<li>'+esc(L(TX[k]))+'</li>'; }).join("")+'</ul><p>'+esc(L(K==="tour"?TX.rf5:TX.rf5c))+'</p><p>'+esc(L(TX.rf6))+'</p>'
     +'<a class="srfl" href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rfL))+' ›</a></section>';
  // ⑩ 후기 (기존 별점 띠)
  h+=(window.rvSlot?'<div class="rvhost" data-rvhost="1">'+rvSlot("shop:"+p.id)+'</div>':'');
  // ⑪ 자주 묻는 질문
  var fq=(p.faq||[]).filter(function(x){ return x&&Lx(x.q); });
  if(fq.length) h+='<section class="shbx"><h2>'+esc(L(TX.faq))+'</h2>'+fq.map(function(x){ return '<details class="sfq"><summary><span>'+esc(Lx(x.q))+'</span>'+XTG.html(false,'',1)+'</summary><p>'+esc(Lx(x.a))+'</p></details>'; }).join("")+'</section>';
  return h; }
var GLANGS=[["en","English"],["ja","日本語"],["zhs","中文(简)"],["zht","中文(繁)"],["es","Español"],["ko","한국어"]].filter(function(l){ return (!window.svcOn||svcOn(l[0])); });   // 11-13 숨긴 서비스 언어 빼기(index.html SVC_LANG_ON)
var S={cat:"all",prod:null,glang:"",guides:null,gid:null,date:"",n:2,cn:"",ce:"",cp:""};   // cn·ce·cp = 예약자 이름·이메일·전화 (10-28 주문 저장)
var css=document.createElement("style");
css.textContent="#shopBox{position:fixed;inset:0;z-index:2147483003;background:#f6f4ef;color:#1d2433;overflow:auto;-webkit-overflow-scrolling:touch;font-family:system-ui,-apple-system,'Segoe UI','Malgun Gothic',sans-serif}"
 +"#shopBox .sstamp{position:fixed;inset:0;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;overflow:hidden}"
 +"#shopBox .sstamp span{transform:rotate(-24deg);font:900 clamp(44px,11vw,140px)/1 'Segoe UI',Arial,sans-serif;letter-spacing:.06em;color:rgba(214,40,40,.4);border:clamp(5px,1vw,12px) solid rgba(214,40,40,.4);border-radius:18px;padding:.12em .3em;white-space:nowrap}"
 +"#shopBox .shd{position:sticky;top:0;z-index:4;display:flex;align-items:center;gap:10px;padding:12px max(16px,env(safe-area-inset-right,0px),calc((100% - 1100px)/2 + 16px)) 8px max(16px,env(safe-area-inset-left,0px),calc((100% - 1100px)/2 + 16px));background:#f6f4ef;color:#1d2433}"
 +"#shopBox .shd b{font-size:19px;font-weight:900}#shopBox .shd .ut{font-size:11px;font-weight:900;color:#c92a2a;border:1.5px solid #ff8a8a;border-radius:6px;padding:2px 6px;letter-spacing:.05em}"
 +"#shopBox .shd button{margin-left:auto;border:1px solid #e3ded3;background:#fff;color:#1d2433;font-weight:800;border-radius:999px;padding:8px 14px;cursor:pointer;font-family:inherit}"
 +"#shopBox .sin{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:14px max(16px,env(safe-area-inset-right,0px)) 40px max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:14px}"
 +"#shopBox .ssub{margin:0;color:#667085}"
 +"#shopBox .scats,#shopBox .sgl{display:flex;flex-wrap:wrap;gap:6px}#shopBox .scats button,#shopBox .sgl button{border:1px solid #e4e0d6;background:#efece4;color:#1d2433;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer}"
 +"#shopBox .scats button.on,#shopBox .sgl button.on{background:#1d2433;color:#fff;border-color:#1d2433}"
 +"#shopBox .scnt{color:#667085;font-size:13px;margin:0}"
 +"#shopBox .scards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}"
 +"#shopBox .scard{background:#fff;border:1px solid #e4e0d6;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;text-align:left;padding:0;color:inherit;font:inherit}"
 +"#shopBox .scard.on{outline:3px solid #ff6a1a;outline-offset:-1px}"
 +"#shopBox .sph{position:relative;aspect-ratio:4/3;background:#efece4}#shopBox .sph img{width:100%;height:100%;object-fit:cover;display:block}"
 +"#shopBox .stag{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.62);color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px}"
 +"#shopBox .sreal{position:absolute;right:10px;top:10px;background:#1f7a5a;color:#fff;font-size:11px;font-weight:900;border-radius:999px;padding:3px 9px}#shopBox .sex{position:absolute;right:10px;top:10px;background:rgba(255,255,255,.9);color:#333;font-size:11px;font-weight:900;border-radius:999px;padding:3px 9px}"
 +"#shopBox .scb{padding:11px 12px 13px;display:flex;flex-direction:column;gap:6px;flex:1}#shopBox .scb h3{font-size:15px;margin:0;line-height:1.35}"
 +"#shopBox .srt{display:inline-block;margin-top:7px;border:1.5px solid #ff7a00;color:#d9480f;background:#fff;border-radius:9px;padding:5px 10px;font-size:13px;font-weight:800;cursor:pointer}#shopBox .sft{display:flex;flex-wrap:wrap;gap:5px}#shopBox .sft span{font-size:11.5px;background:#fff1e6;border-radius:6px;padding:2px 7px}"
 +"#shopBox .scb p{margin:0;color:#667085;font-size:12.5px;line-height:1.5}#shopBox .spr{margin-top:auto;font-size:16px;font-weight:900}#shopBox .spr small{font-size:12px;color:#667085;font-weight:500}"
 +"#shopBox .shbx{background:#fff;border:1px solid #e4e0d6;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}#shopBox .shbx h2{font-size:16px;margin:0;display:flex;align-items:center;gap:8px}"
 +"#shopBox .sstep{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#1f5fa8;color:#fff;font-size:12px;font-weight:900}"
 +"#shopBox .snote{color:#667085;font-size:13px;margin:0;line-height:1.5}"
 +"#shopBox .sg{display:flex;gap:10px;align-items:center;border:1.5px solid #e4e0d6;border-radius:12px;padding:9px;cursor:pointer;background:#fff;text-align:left;width:100%;font:inherit;color:inherit}#shopBox .sg.on{border-color:#1f5fa8;background:#eef4fc}"
 +"#shopBox .sg img,#shopBox .sg .sav{flex:0 0 44px;width:44px;height:44px;border-radius:50%;object-fit:cover;display:grid;place-items:center;background:#1f5fa8;color:#fff;font-weight:900}"
 +"#shopBox .sg small{display:block;color:#667085;font-size:12px}"
 +"#shopBox .spick{display:flex;gap:10px;align-items:center}#shopBox .spick img{width:76px;height:57px;object-fit:cover;border-radius:10px}"
 +"#shopBox .srow{display:flex;justify-content:space-between;align-items:center;gap:8px}#shopBox .srow label{color:#667085;font-size:13px}#shopBox .srow input{font:inherit;border:1px solid #e4e0d6;border-radius:8px;padding:5px 8px}"
 +"#shopBox .sstp{display:flex;align-items:center;gap:8px}#shopBox .sstp button{width:30px;height:30px;border-radius:50%;border:1px solid #e4e0d6;background:#efece4;font-size:16px;font-weight:900;cursor:pointer}"
 +"#shopBox .stot{border-top:1px dashed #e4e0d6;padding-top:10px;display:flex;justify-content:space-between;font-size:18px;font-weight:900}"
 +"#shopBox .spay{border:0;border-radius:12px;padding:13px;background:#ff6a1a;color:#fff;font-size:16px;font-weight:900;cursor:pointer}#shopBox .spay:disabled{opacity:.45;cursor:not-allowed}";
css.textContent+="#shopBox .sgrid{display:flex;flex-direction:column;gap:14px}#shopBox .sside{display:flex;flex-direction:column;gap:14px;order:2}#shopBox .smain{display:flex;flex-direction:column;gap:14px;order:1;min-width:0}"
 +"@media (min-width:900px){#shopBox .sgrid{display:grid;grid-template-columns:340px minmax(0,1fr);align-items:start;gap:20px}#shopBox .sside{grid-column:1;grid-row:1;position:sticky;top:70px}#shopBox .smain{grid-column:2;grid-row:1}}"
 +"#shopBox .ssel{display:flex;flex-direction:column;gap:8px}#shopBox .ssel img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}#shopBox .ssel b{font-size:15px}#shopBox .ssel .spr{font-size:15px}";   // 넓은 화면 = 왼쪽 기둥 (사장님 10-27 「왼쪽 칸도 채워줘」)
css.textContent+="div[id^=__tosspayments_]{z-index:2147483600!important}"   // 토스 결제창(dimmer z 9999999)이 이 화면(z 2147483003) 뒤에 숨지 않게 (10-29)
 +"#shopBox .spm{position:fixed;inset:0;z-index:6;background:rgba(10,14,24,.6);display:flex;align-items:center;justify-content:center;padding:16px}#shopBox .spm>div{width:min(440px,100%);max-height:100%;overflow:auto;background:#fff;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px}"
 +"#shopBox .spm h3{margin:0;font-size:18px}#shopBox .spm .sut{font-size:11px;font-weight:900;color:#d62828;border:1.5px solid #d62828;border-radius:6px;padding:2px 6px;margin-left:6px}#shopBox .spm .sl{display:flex;justify-content:space-between;gap:10px;font-size:14px}#shopBox .spm .sl span:first-child{color:#667085}"
 +"#shopBox .spm label.sr{display:flex;gap:8px;align-items:center;border:1.5px solid #e4e0d6;border-radius:10px;padding:9px 10px;font-size:14px;cursor:pointer}#shopBox .spm label.scl{display:flex;flex-direction:column;gap:4px;font-size:13px;color:#667085}#shopBox .spm label.scl input{font:inherit;font-size:15px;color:#1d2433;border:1.5px solid #e4e0d6;border-radius:10px;padding:9px 10px}#shopBox .spm .serr{background:#fdecec;color:#b42318;border-radius:10px;padding:8px 10px;font-size:13.5px;font-weight:700}#shopBox .spm .sdone{background:#fff4d6;border:2px dashed #e0a100;color:#8a5a00;font-weight:800;border-radius:12px;padding:10px;text-align:center}";
// 상품 상세 (10-29) — 넓은 화면(800px~): 왼쪽 상세 · 오른쪽 결제 칸 sticky / 폰: 상세 아래 결제 칸 + 맨 아래 금액·「예약·결제」 띠 고정
css.textContent+="#shopBox .sdbk{align-self:flex-start;border:1.5px solid #1d2433;background:#fff;color:#1d2433;font-weight:800;font-size:15px;border-radius:999px;padding:8px 16px;cursor:pointer}"
 +"#shopBox .sdg{display:flex;flex-direction:column;gap:14px}#shopBox .sdm{display:flex;flex-direction:column;gap:14px;min-width:0}#shopBox .sds{display:flex;flex-direction:column;gap:14px}"
 +"#shopBox .sdph{position:relative;border-radius:16px;overflow:hidden;background:#efece4;aspect-ratio:16/10}#shopBox .sdph img{width:100%;height:100%;object-fit:cover;display:block}"
 +"#shopBox .sdh{font-size:22px;line-height:1.35;margin:0}#shopBox .sdm .sft span{font-size:13px;padding:3px 9px}#shopBox .sdm .spr{font-size:19px}"
 +"#shopBox .sdm .shbx h2{font-size:15.5px}#shopBox .sdm .shbx p{margin:0;font-size:14.5px;line-height:1.65;color:#344054}#shopBox .sdm ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:5px;font-size:14px;line-height:1.55;color:#344054}"
 +"#shopBox .sdm a.srfl{color:#1f5fa8;font-weight:800;font-size:14px;text-decoration:none}"
 +"#shopBox .sbar{position:fixed;left:0;right:0;bottom:0;z-index:5;display:flex;align-items:center;gap:12px;padding:10px max(16px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:#fff;border-top:1px solid #e4e0d6;box-shadow:0 -4px 16px rgba(0,0,0,.08);transition:transform .2s}"
 +"#shopBox .sbar.off{transform:translateY(110%)}#shopBox .sbar div{flex:1;min-width:0;display:flex;flex-direction:column}#shopBox .sbar small{color:#667085;font-size:12px}#shopBox .sbar b{font-size:18px;font-weight:900}#shopBox .sbar .spay{flex:0 0 auto;padding:12px 18px}"
 +"@media (max-width:799px){#shopBox .sds #shopSel{display:none}}"   /* 폰 상세는 위에 같은 상품이 이미 크게 있다 */
 +"#shopBox .sin.sdet{padding-bottom:96px}#shopBox #shopCo{scroll-margin-top:66px}"
 +"@media (min-width:800px){#shopBox .sdg{display:grid;grid-template-columns:340px minmax(0,1fr);align-items:start;gap:20px}#shopBox .sdm{grid-column:2;grid-row:1;min-width:0}#shopBox .sds{grid-column:1;grid-row:1;display:flex;flex-direction:column;gap:14px;position:sticky;top:66px;max-height:calc(100vh - 80px);overflow:auto;padding-bottom:4px}#shopBox .sbar{display:none}#shopBox .sin.sdet{padding-bottom:40px}}";
css.textContent+="#shopBox .sdth{display:flex;gap:6px;overflow-x:auto}#shopBox .sdth button{flex:0 0 auto;width:72px;height:54px;padding:0;border:2px solid transparent;border-radius:8px;overflow:hidden;background:#efece4;cursor:pointer}#shopBox .sdth button.on{border-color:#ff6a1a}#shopBox .sdth img{width:100%;height:100%;object-fit:cover;display:block}"
 +"#shopBox .rvhost{--ink:#1d2433;--sub:#667085;--line:#e4e0d6;--card:#fff}#shopBox .rvhost .rvs{background:#fff9db;border-color:#ffe066}#shopBox .rvhost .rvs.on{border-color:#f59f00}#shopBox select#shopTm{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid #d0cbbf;background:#fff}";
// 화면 개편 (10-30) — 앞면 카드 · 뒷면 상세 칸
css.textContent+="#shopBox .smeta{font-size:12px;color:#667085;font-weight:700}#shopBox .sinf{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12.5px;color:#344054}#shopBox .sinf span+span:before{content:'·';margin-right:10px;color:#98a2b3}"
 +"#shopBox .sbdg{display:flex;flex-wrap:wrap;gap:5px}#shopBox .skb,#shopBox .sfc{font-size:11.5px;font-weight:800;border-radius:6px;padding:2px 7px}#shopBox .skb-tour{background:#e7f0fb;color:#1f5fa8}#shopBox .skb-class{background:#f3ecfd;color:#6941c6}#shopBox .skb-ticket{background:#fff1e6;color:#c4320a}#shopBox .skb-car{background:#fff3bf;color:#7a5900}#shopBox .sfc{background:#e8f6ee;color:#1f7a5a}"
 +"#shopBox .sgal{display:flex;width:100%;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}#shopBox .sgal::-webkit-scrollbar{display:none}#shopBox .sgal img{flex:0 0 100%;width:100%;height:100%;object-fit:cover;scroll-snap-align:start;display:block}"
 +"#shopBox .sgn{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:2px 9px}"
 +"#shopBox .skey{display:flex;flex-wrap:wrap;gap:6px}#shopBox .skey span{font-size:13px;font-weight:700;background:#fff;border:1px solid #e4e0d6;border-radius:8px;padding:5px 9px;color:#1d2433}#shopBox .skey span small{color:#667085;font-weight:600;font-size:12px}#shopBox .skey span.g{background:#e8f6ee;border-color:#b7e1c8;color:#1f7a5a}"
 +"#shopBox .sdm ul.shl{list-style:none;padding-left:0}#shopBox .sdm ul.shl li{position:relative;padding-left:22px;font-weight:600;color:#1d2433}#shopBox .sdm ul.shl li:before{content:'';position:absolute;left:3px;top:.45em;width:9px;height:9px;border-radius:50%;background:#ff6a1a}"
 +"#shopBox .sdm .sdd{color:#667085;font-size:13.5px}"
 +"#shopBox ol.sstps{margin:0;padding:0;list-style:none;counter-reset:st;display:flex;flex-direction:column;gap:0}#shopBox ol.sstps li{counter-increment:st;position:relative;padding:0 0 14px 38px;font-size:14.5px;line-height:1.5;color:#344054;min-height:26px}"
 +"#shopBox ol.sstps li:before{content:counter(st);position:absolute;left:0;top:-1px;width:26px;height:26px;border-radius:50%;background:#1f5fa8;color:#fff;font-size:13px;font-weight:900;display:grid;place-items:center}#shopBox ol.sstps li:after{content:'';position:absolute;left:12px;top:26px;bottom:2px;width:2px;background:#d6e2f2}#shopBox ol.sstps li:last-child{padding-bottom:0}#shopBox ol.sstps li:last-child:after{display:none}"
 +"#shopBox ol.sday li:before{background:#1f7a5a}#shopBox ol.sday li:after{background:#cfe9db}"
 +"#shopBox .sie{display:grid;grid-template-columns:1fr 1fr;gap:12px}#shopBox .sie h2{margin-bottom:6px!important}#shopBox .sdm ul.sin1,#shopBox .sdm ul.sex1{list-style:none;padding-left:0}#shopBox .sdm ul.sin1 li,#shopBox .sdm ul.sex1 li{position:relative;padding-left:18px}"
 +"#shopBox .sdm ul.sin1 li:before,#shopBox .sdm ul.sex1 li:before{position:absolute;left:0;top:0;font-weight:900}#shopBox .sdm ul.sin1 li:before{content:'+';color:#1f7a5a}#shopBox .sdm ul.sex1 li:before{content:'−';color:#b42318}"
 +"#shopBox .sadr{display:flex;flex-direction:column;gap:2px}#shopBox .sadr b{font-size:16px}#shopBox .sadr span{font-size:14px;color:#344054}#shopBox .sadr .sub{color:#667085;font-size:13px}"
 +"#shopBox .smaps{display:flex;flex-wrap:wrap;gap:6px}#shopBox .smaps a{flex:1 1 0;min-width:96px;text-align:center;text-decoration:none;border:1.5px solid #1d2433;color:#1d2433;font-weight:800;font-size:13.5px;border-radius:10px;padding:8px 6px;background:#fff}"
 +"#shopBox .sdm p.sline{font-size:14px}#shopBox .sline small{color:#667085;font-weight:700}"
 +"#shopBox .sent{margin:0}#shopBox .sent img{width:100%;max-height:320px;object-fit:cover;border-radius:12px;display:block}#shopBox .sent figcaption{font-size:12px;color:#667085;margin-top:4px}"
 +"#shopBox .staxi{border:2px solid #1d2433;border-radius:14px;padding:14px;background:#fffbea;display:flex;flex-direction:column;gap:6px}#shopBox .staxi small{font-size:12.5px;font-weight:800;color:#8a5a00}#shopBox .staxi .tb{font-size:24px;line-height:1.3;color:#1d2433}#shopBox .staxi .ta{font-size:20px;line-height:1.4;color:#1d2433;word-break:keep-all}#shopBox .sdm .staxi p{font-size:13px;color:#667085}"
 +"#shopBox .staxi button{align-self:flex-start;border:0;border-radius:10px;background:#1d2433;color:#fff;font-weight:800;font-size:14px;padding:9px 16px;cursor:pointer}"
 +"#shopBox .sbig h2{font-size:18px!important}#shopBox .sbig .sadr b{font-size:19px}#shopBox .sdm .sbig p.sline{font-size:15.5px}"
 +"#shopBox .stk{border:2px solid #ff6a1a}#shopBox .stk>div{display:flex;flex-direction:column;gap:2px}#shopBox .stk small{color:#667085;font-size:12.5px;font-weight:700}#shopBox .stk b{font-size:17px;line-height:1.45}"
 +"#shopBox .sfq{border-top:1px solid #efece4;padding:9px 0}#shopBox .sfq:first-of-type{border-top:0}#shopBox .sfq summary{cursor:pointer;font-weight:800;font-size:14.5px}#shopBox .sdm .sfq p{margin-top:6px;font-size:14px}"
 +"#shopBox .sfq summary{display:flex;align-items:center;gap:8px;list-style:none}#shopBox .sfq summary::-webkit-details-marker{display:none}#shopBox .sfq summary>span:first-child{flex:1}";   // 자주 묻는 질문 — 브라우저 기본 ▶ 대신 오른쪽 끝 공통 ▼/— (11-07)
document.head.appendChild(css);
function won(x){ return "₩"+Number(x).toLocaleString("ko-KR"); }
// 결제 단추 옆 「취소」 (사장님 11-05) — 한 줄에 [취소 회색 테두리][결제 단추 그대로], 높이 같게
function cxRow(pay){ return '<div class="scx"><button type="button" class="scxb" data-s="cx">'+esc(L(TX.cx))+'</button>'+pay+'</div>'; }
(function(){ var s=document.createElement("style"); s.textContent="#shopBox .scx{display:flex;gap:8px;align-items:stretch}#shopBox .scx>.spay{flex:1 1 auto;min-width:0;margin:0;box-sizing:border-box}"
  +"#shopBox .scxb{flex:0 0 auto;min-width:84px;border:1.5px solid #adb5bd;background:#fff;color:#495057;border-radius:12px;padding:0 14px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit}"
  +"#shopBox .sbar .scx{flex:0 0 auto;flex-direction:row;min-width:0}#shopBox .sbar .scxb{min-width:0}"
  // 11-10 사장님 「고쳐」 — 스페인어 폰에서 합계가 「₩600,00 / 0」으로 숫자 중간에서 끊겼다 → 합계 숫자는 한 줄(줄 바꿈 금지), 모자라면 단추 쪽이 줄고 단추 글자가 줄 바꿈
  +"#shopBox .sbar.sbtot>div:first-child{min-width:auto}#shopBox .sbar.sbtot b,#shopBox .sbar.sbtot small{white-space:nowrap}#shopBox .sbar.sbtot .scx{flex:0 1 auto}"
  +"@media (max-width:359px){#shopBox .sbar.sbtot .spay{padding:10px;font-size:14px}#shopBox .sbar.sbtot .scxb{padding:0 10px;font-size:14px}}"; document.head.appendChild(s); })();   // 더 좁은 폰(320)은 단추 글자를 줄여 낱말이 안 끊기게
function box(){ return document.getElementById("shopBox"); }
function catName(c){ return L(CATS.filter(function(x){ return x[0]===c; })[0][1]); }
function prod(){ return PL().filter(function(p){ return p.id===S.prod; })[0]; }
// 빅4 「투어 노선도 보기」 — 서울 지도 위 노선도(index.html b4RouteShow)로 (10-28). 카드가 button 이라 span 으로
function rtBtn(){ return '<span class="srt" role="button" data-s="b4map">'+esc(L(T6("투어 노선도 보기","View tour route","ツアー路線図を見る","查看游览路线图","查看遊覽路線圖","Ver la ruta del tour")))+' ›</span>'; }
function b4Price(n){ return n>=2?79000:89000; }
function gName(g){ return window.LANG==="ko"?(g.name||g.name_en||""):(g.name_en||g.name||""); }
function paint(){ var b=box(); if(!b) return; var y=b.scrollTop;
  var PA=PL(), L0=PA.filter(function(p){ return S.cat==="all"||p.c===S.cat; });
  var h=''
   +'<div class="shd"><b>'+esc(L(TX.t))+'</b><button type="button" data-s="x">✕ '+esc(L(TX.x))+'</button></div><div class="sin">'
   +'<p class="ssub">'+esc(L(TX.s))+'</p><div class="sgrid"><div class="smain">'
   +(function(){ var cs=CATS.filter(function(c){ return c[0]==="all"||PA.some(function(p){ return p.c===c[0]; }); }); if(cs.length<=2){ S.cat="all"; return ""; }   // 11-14 — 상품이 있는 분류만, 하나뿐이면 칩 줄 없음
     return '<div class="scats">'+cs.map(function(c){ var n=c[0]==="all"?PA.length:PA.filter(function(p){ return p.c===c[0]; }).length; return '<button type="button" data-cat="'+c[0]+'" class="'+(S.cat===c[0]?"on":"")+'">'+esc(L(c[1]))+' '+n+'</button>'; }).join("")+'</div>'; })()
   +'<p class="scnt">'+L0.length+' '+esc(L(TX.n))+'</p>'
   +'<div class="scards">'+L0.map(cardHtml).join("")+'</div>';   // 앞면 단순하게 (10-30)
  h+='</div><aside class="sside">';
  h+=selHtml()+sideHtml()+'</aside></div></div>';
  b.innerHTML=h; b.scrollTop=y; try{ if(window.rvMiniLoad) rvMiniLoad(L0.map(function(p){ return "shop:"+p.id; })); }catch(e){} }   // 카드 맨 아래 별점 작은 띠 (10-29)
// 선택한 상품 칸 — 목록 화면과 상세 화면 왼쪽 기둥이 같이 쓴다 (사장님 10-29 「두 번째 화면을 첫 번째와 같게」)
function selHtml(){ var p0=prod();   // 선택한 상품
  return '<section class="shbx" id="shopSel"><h2>'+esc(L(TX.sel))+'</h2>'+(p0?'<div class="ssel">'+(psrc(p0)?'<img src="'+esc(psrc(p0))+'" alt="">':'')+'<b>'+esc(L(p0.t))+'</b><div class="sft">'+fchips(p0)+'</div>'+(p0.rt?rtBtn():'')+(p0.hub?hubPr(p0):p0.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p0.price?'<div class="spr">'+won(p0.price)+(isChr(p0)?'~':'')+' / '+esc(L(perOf(p0)))+'</div>':'')+'</div>':'<p class="snote">'+esc(L(TX.seln))+'</p>')+'</section>'; }
// 가이드 고르기 + 예약·결제 칸 — 목록 화면 왼쪽 기둥과 상세 화면 결제 칸이 같이 쓴다 (10-29)
function sideHtml(){ var h='', p0=prod(), tour=!p0||kindOf(p0)==="tour";   // 가이드 고르기는 가이드 투어만 (10-30)
  // 가이드
  if(tour){ h+='<section class="shbx"><h2><span class="sstep">1</span>'+esc(L(TX.g1))+'</h2><p class="snote">'+esc(L(TX.gl))+'</p><div class="sgl">'+GLANGS.map(function(l){ return '<button type="button" data-gl="'+l[0]+'" class="'+(S.glang===l[0]?"on":"")+'">'+esc(l[1])+'</button>'; }).join("")+'</div>';
  if(S.glang){ if(S.guides===null) h+='<p class="snote">'+esc(L(TX.gld))+'</p>'; else if(!S.guides.length) h+='<p class="snote">'+esc(L(TX.gn))+'</p>';
    else h+=S.guides.map(function(g){ return '<button type="button" class="sg'+(S.gid===g.id?" on":"")+'" data-g="'+esc(g.id)+'">'+(g.photo?'<img src="'+esc(g.photo)+'" alt="">':'<span class="sav">'+esc(gName(g).slice(0,1))+'</span>')+'<span><b>'+esc(gName(g))+'</b><small>'+esc((g.langs||[]).filter(function(c){ return (!window.svcOn||svcOn(c)); }).map(function(c){ return window.igLangName?igLangName(c):c; }).join(" · "))+(g.years?' · '+esc(window.igYears?igYears(g.years):g.years):'')+(g.region?' · '+esc(window.igRegion?igRegion(g.region):g.region):'')+'</small></span></button>'; }).join(""); }
  h+='</section>'; }
  // 예약·결제
  var p=prod(); h+='<section class="shbx" id="shopCo"><h2><span class="sstep">'+(tour?2:1)+'</span>'+esc(L(TX.g2))+'</h2>';
  if(!p) h+='<p class="snote">'+esc(L(TX.pick))+'</p>';
  else { var gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0];
    if(p.real==="perf") h+='<button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button>';
    else if(p.hub&&p.link) h+=cxRow('<a class="spay" href="'+esc(p.link)+'" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">'+esc(L(TX.tk))+' ›</a>')+'<p class="snote">'+esc(L(TX.tkn))+'</p>';   // 외부 예매처 (10-29)
    else if(p.hub&&!p.real) h+='<p class="snote">'+esc(L(TX.soon))+'</p>';   // 관리자 상품 「준비 중」 — 주문 안 받음
    else if(isChr(p)){   // 차량 대절 (11-11) — 날짜(3일 뒤부터)·시작 시각·인원(1~7) + charter.js 칸(큰 짐·픽업·목적지·기사 언어·요청 사항·구간 가격) · 합계 = 구간 가격
      h+='<div class="srow"><label for="shopDt">'+esc(L(TX.date))+'</label><input type="date" id="shopDt" min="'+esc(CHR.minDate())+'" value="'+esc(S.date)+'"></div>'
       +(isCt(p)?(function(){ CHR.use(p.id); var tm=CHR.crsTm(); if(tm) S.time=tm; return '<div class="srow"><label>'+esc(CHR.tx("tm"))+'<br><small>'+esc(L(CHR.TC.tmn))+'</small></label><b>'+esc(tm)+'</b></div>'; })()   // 프라이빗 카투어 — 코스 출발 시각 (11-14)
        :'<div class="srow"><label for="shopTm">'+esc(CHR.tx("tm"))+'<br><small>'+esc(CHR.tx("tmn"))+'</small></label><input type="time" id="shopTm" step="1800" value="'+esc(S.time)+'"></div>')
       +'<div class="srow"><label>'+esc(L(TX.ppl))+'</label><div class="sstp"><button type="button" data-n="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-n="1" aria-label="+">+</button></div></div>'
       +CHR.pickHtml(p)+'<div class="stot"><span>'+esc(L(TX.tot))+'</span><span>'+totTx(p)+'</span></div>'+pxHtml(p)
       +cxRow('<button type="button" class="spay" data-s="mock"'+(CHR.ok()?'':' disabled')+'>'+esc(L(TX.pay))+' ›</button>')+'<p class="snote">'+esc(L(noteOf(p)))+'</p>'; }
    else { var unit=unitOf(p,S.n), tsel=p.hub&&!p.free&&p.times.length;
      h+='<div class="srow"><label for="shopDt">'+esc(L(TX.date))+'</label><input type="date" id="shopDt" value="'+esc(S.date)+'"></div>'
       +(dayLine(p)?'<p class="snote">'+dayLine(p)+'</p>':'')
       +'<div class="srow"><label for="shopTm">'+esc(L(TX.tm))+'</label>'+(tsel?'<select id="shopTm">'+p.times.map(function(x){ return '<option'+(x===S.time?' selected':'')+'>'+esc(x)+'</option>'; }).join("")+'</select>':'<input type="time" id="shopTm" step="1800" value="'+esc(S.time)+'">')+'</div>'   // 시간 (사장님 10-27 「결제화면에 날짜와 시간까지」)
       +'<div class="srow"><label>'+esc(L(TX.ppl))+'</label><div class="sstp"><button type="button" data-n="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-n="1" aria-label="+">+</button></div></div>'
       +(tour?'<div class="srow"><label>'+esc(L(TX.gd))+'</label><b>'+(gg?esc(gName(gg)):esc(L(TX.none)))+'</b></div>':'')
       +(window.SMN?SMN.pickHtml(p,unit*S.n):'')+(window.HSP?HSP.pickHtml(p):'')+'<div class="stot"><span>'+esc(L(TX.tot))+'</span><span>'+won(unit*S.n+(window.SMN?SMN.appSum(p):0))+'</span></div>'+(window.SMN&&SMN.appSum(p)?'':pxHtml(p))
       +cxRow('<button type="button" class="spay" data-s="mock"'+(window.HSP&&!HSP.ok(p)?' disabled':'')+'>'+esc(L(TX.pay))+' ›</button>')+'<p class="snote">'+esc(L(noteOf(p)))+'</p>'+mpNote(p); } }   // 시험 결제창 (사장님 10-27 「결제화면도 띄워줘, 어차피 결제는 안 돼」)
  return h+'</section>'; }
function priceHtml(p){ return (p.hub?hubPr(p,true):p.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p.price?'<div class="spr">'+won(p.price)+(isChr(p)?'~':'')+' <small>/ '+esc(L(perOf(p)))+'</small></div>':'')+pxHtml(p); }   // 차량 대절 = 「₩300,000~ / 차 1대」 (11-11)
// 상품 상세 화면 — 왼쪽 상세 · 오른쪽(폰은 아래) 결제 칸 + 폰 맨 아래 띠 (10-29)
function paintDet(){ var b=box(), p=prod(); if(!b||!p) return; var y=b.scrollTop, rk="shop:"+p.id, keep=b.querySelector('.rvp[data-rvk="'+rk+'"]');   // 펼친 후기 칸은 다시 그려도 그대로 (10-29)
  var h=''
   +'<div class="shd"><b>'+esc(L(TX.t))+'</b><button type="button" data-s="x">✕ '+esc(L(TX.x))+'</button></div><div class="sin sdet">'
   +'<button type="button" class="sdbk" data-s="bk">← '+esc(L(TX.bk))+'</button><div class="sdg"><div class="sdm">'
   +detBody(p)   // 뒷면 순서 ①~⑪ (10-30)
   +'</div><aside class="sds">'+selHtml()+sideHtml()+'</aside></div></div>';
  // 폰 맨 아래 띠 — 금액 + 「예약·결제」(누르면 결제 칸으로). 결제 칸이 화면에 보이면 숨긴다
  if(p.real==="perf") h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b></div><button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button></div>';
  else if(p.hub&&p.link) h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b></div>'+cxRow('<a class="spay" href="'+esc(p.link)+'" target="_blank" rel="noopener" style="text-decoration:none">'+esc(L(TX.tk))+' ›</a>')+'</div>';
  else if(p.hub&&!p.real) h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b><small>'+esc(L(TX.ex))+'</small></div></div>';
  else h+='<div class="sbar sbtot"><div><small>'+esc(L(TX.tot))+' · '+esc(L(TX.ppl))+' '+S.n+'</small><b>'+totTx(p)+'</b></div>'+cxRow('<button type="button" class="spay" data-s="go">'+esc(L(TX.pay))+' ›</button>')+'</div>';
  b.innerHTML=h; b.scrollTop=y; galWire();
  try{ if(window.rvMiniLoad) rvMiniLoad([rk]); }catch(e){}
  if(window.rvPaint){ var hs=b.querySelector("[data-rvhost]"); if(keep&&hs) hs.appendChild(keep); try{ rvPaint(rk); }catch(e){} }
  barTog(); }
// 사진 옆으로 넘기기 (10-30) — 넘기면 번호·작은 사진 표시만 바꾼다
function galWire(){ var b=box(), g=b&&b.querySelector("#shopGal"); if(!g) return; var n=g.children.length; if(S.gi) g.scrollLeft=S.gi*g.clientWidth;
  g.addEventListener("scroll",function(){ var i=Math.round(g.scrollLeft/Math.max(1,g.clientWidth)); if(i===S.gi) return; S.gi=Math.max(0,Math.min(n-1,i)); galMark(); },{passive:true}); }
function galMark(){ var b=box(); if(!b) return; var c=b.querySelector(".sgn"), g=b.querySelector("#shopGal"); if(c&&g) c.textContent=(S.gi+1)+" / "+g.children.length; [].forEach.call(b.querySelectorAll(".sdth button"),function(x,i){ x.classList.toggle("on",i===S.gi); }); }
function barTog(){ var b=box(); if(!b) return; var bar=b.querySelector(".sbar"), co=b.querySelector("#shopCo"); if(!bar||!co) return;
  var r=co.getBoundingClientRect(); bar.classList.toggle("off", r.top<window.innerHeight-60 && r.bottom>60); }
var listY=0;
function openDet(id){ var b=box(); if(!b) return; listY=b.scrollTop; S.prod=id; S.det=true; S.gi=0; S.fromAi=false;
  var p=prod(); if(p&&p.hub){ if(!p.free&&p.times.length&&p.times.indexOf(S.time)<0) S.time=p.times[0]; if(S.n>p.max) S.n=p.max; }
  if(isChr(p)){ CHR.use(p.id); if(isCt(p)){ var tm0=CHR.crsTm(); if(tm0) S.time=tm0; } if(S.n>CHR.NMAX) S.n=CHR.NMAX; if(!S.date||S.date<CHR.minDate()) S.date=CHR.minDate(); CHR.quote(); }   // + 프라이빗 카투어 코스 시각 (11-14)   // 차량 대절 (11-11) — 최대 7명 · 날짜는 그대로(일정표에서 고른 날이 3일 안이면 예약 칸에 안내)
  b.scrollTop=0; paintDet(); b.scrollTop=0; try{ if(window.rvLoad) rvLoad("shop:"+id); }catch(e){} barTog(); }
function toList(){ var b=box(); S.det=false; var o=b&&b.querySelector(".spm"); if(o) o.remove(); paint(); if(b) b.scrollTop=listY; }
function repaint(){ if(S.det) paintDet(); else paint(); }
// 결제창 — 11-05 실전(사장님 「시험 판 운영하지 마… 결제도 막 눌러」): 「결제하기」 = 허브 /shop/order 실전 주문 → PG 전(SH_PG=false)이라 허브가 pay:"none" 으로 바로 결제 완료
//   → 손님 메일·문자 · 고른 가이드에게 수락·거절 링크(거절하면 다른 가이드 자동 배정) · 사장님 텔레그램 · 이 폰 「내 예약」에 저장(배정 가이드 카드·별점·후기)
//   🔴 PG 붙일 때 (11-07 사장님 「이니시스로 해」 — 토스 아님): tpg.js 의 SH_PG=true + 허브 PORTONE_TOUR_CHANNEL_KEY → 「결제하기」가 pg:1 로 주문 → KG이니시스 결제창(포트원) → 돌아오면 TPG.onRet("pkg") 아래
function pgOn(){ return !!(window.TPG&&TPG.on); }
function mockPay(res,host){ var b=(window.PC_HOME&&host)||box(), p=prod(); if(!b||!p) return; var o=b.querySelector(".spm"); if(o) o.remove();   // host = PC 홈페이지 상품 화면(home/pc_pkg.js, 11-08) — 폰 앱은 늘 box()
  var unit=unitOf(p,S.n), tot=totOf(p), gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0], gnm=gg?gName(gg):(S.gid&&S.gname)||"";
  o=document.createElement("div"); o.className="spm"; b.appendChild(o); var agd=false; if(!S.pm) S.pm="card";
  // res = 결제창에서 돌아온 결과 {ok, oid, amount} 또는 {ok:false, err}
  var draw=function(oid,err,busy){ var done=res&&res.ok; tot=totOf(p);   // 차량 대절은 허브가 구간 값을 다시 알려 주면 바뀐다 (11-11)
    o.innerHTML='<div><h3>'+esc(L(done?TX.pdT:TX.pt))+'</h3>'
    +'<b>'+esc(L(TX.ord))+'</b><div class="spick">'+(psrc(p)?'<img src="'+esc(psrc(p))+'" alt="">':'')+'<b>'+esc(L(p.t))+'</b></div>'
    +'<div class="sl"><span>'+esc(L(TX.dtm))+'</span><span>'+esc((S.date||"-")+" "+(S.time||""))+'</span></div><div class="sl"><span>'+esc(L(TX.ppl))+'</span><span>'+S.n+'</span></div>'+(kindOf(p)==="tour"?'<div class="sl"><span>'+esc(L(TX.gd))+'</span><span>'+(gnm?esc(gnm):esc(L(TX.none)))+'</span></div>':'')
    +(window.HSP?HSP.payRow(p):'')+(window.SMN?SMN.payRows(p,unit*S.n):'')+(isChr(p)?CHR.payRows(p):'')+'<div class="stot"><span>'+esc(L(done?TX.amt:TX.tot))+'</span><span>'+won(done?res.amount:tot)+'</span></div>'+((window.SMN&&SMN.appSum(p))||isChr(p)?'':pxHtml(p))
    +(done?'<div class="sl"><span>'+esc(L(TX.oid))+'</span><b>'+esc(res.oid)+'</b></div><div class="sdone">'+esc(isChr(p)?(isCt(p)&&CHR.crsG()?L(CHR.TC.sentG):CHR.tx("sent")):L(res.chat?TX.sent:TX.sentX))+'</div>'+(res.chat&&window.BELL&&BELL.promptHtml?BELL.promptHtml():'')+(res.chat&&res.tk?'<button type="button" class="spay" id="spmChat">'+esc(L(TX.chatGo))+'</button>':'')
     :'<b>'+esc(L(TX.cu))+'</b>'
     +'<label class="scl">'+esc(L(TX.cn))+'<input type="text" id="spmN" maxlength="40" autocomplete="name" value="'+esc(S.cn)+'"></label>'
     +'<label class="scl">'+esc(L(TX.cp))+'<input type="tel" id="spmP" maxlength="30" autocomplete="tel" value="'+esc(S.cp)+'"></label>'
     +'<label class="scl">'+esc(L(TX.ce))+'<input type="email" id="spmE" maxlength="100" autocomplete="email" value="'+esc(S.ce)+'"></label>'
     +'<p class="snote">'+esc(isChr(p)?CHR.tx("cpn"):L(TX.cpn))+'</p>'   // 차량 대절은 「기사」 (11-11)
     +'<b>'+esc(L(TX.pm))+'</b><label class="sr"><input type="radio" name="spmm" value="card"'+(S.pm!=="paypal"?" checked":"")+'> '+esc(L(TX.card))+'</label><label class="sr"><input type="radio" name="spmm" value="paypal"'+(S.pm==="paypal"?" checked":"")+'> PayPal</label>'
     +mpNote(p)
     +'<label class="sr"><input type="checkbox" id="spmAg"> '+esc(L(TX.agr))+'</label>'
     +(err?'<div class="serr">'+esc(err)+'</div>':'')
     +'<div class="scx"><button type="button" class="scxb" id="spmCx">'+esc(L(TX.cx))+'</button><button type="button" class="spay" id="spmGo" disabled>'+(busy?esc(L(busy===2?TX.opn:TX.sav)):won(tot)+' '+esc(L(TX.payb)))+'</button></div>')
    +(done?'<button type="button" class="spay" id="spmX" style="background:#efece4;color:#1d2433">'+esc(L(TX.back))+'</button>':'')+'</div>';   // 결제 전엔 「취소」가 같은 동작이라 뺌 — 결제 끝난 화면에만 (사장님 11-05)
    var ag=o.querySelector("#spmAg"), go=o.querySelector("#spmGo");
    ["spmN","spmE","spmP"].forEach(function(id,k){ var el=o.querySelector("#"+id); if(el) el.oninput=function(){ S[["cn","ce","cp"][k]]=el.value; }; });
    [].forEach.call(o.querySelectorAll('input[name="spmm"]'),function(r){ r.onchange=function(){ if(r.checked) S.pm=r.value; }; });
    if(ag&&go){ if(busy){ ag.checked=true; ag.disabled=true; } else { ag.checked=agd; go.disabled=!agd; ag.onchange=function(){ agd=ag.checked; go.disabled=!agd; }; } }
    if(go) go.onclick=function(){ if(busy) return; var nm=S.cn.trim(), em=S.ce.trim(), ph=S.cp.trim(), today=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
      if(!nm){ draw(null,L(TX.enm)); return; }
      if(!/^[\d\s+()-]{7,30}$/.test(ph)){ draw(null,L(TX.eph)); return; }   // 전화도 필수 (사장님 10-28)
      if(!/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(em)){ draw(null,L(TX.eem)); return; }
      if(!S.date||S.date<today||!/^\d{2}:\d{2}$/.test(S.time||"")){ draw(null,L(TX.edt)); return; }
      if(p.hub&&!p.free&&p.days.length&&p.days.indexOf(new Date(S.date+"T00:00:00Z").getUTCDay())<0){ draw(null,L(TX.edy)); return; }   // 진행 요일 (10-29)
      if(window.HSP&&!HSP.ok(p)){ draw(null,HSP.tx("need")); return; }   // 건강검진 병원 고르기 (11-10)
      if(isChr(p)&&!CHR.ok()){ draw(null,CHR.why()||L(TX.efail)); return; }   // 차량 대절 — 픽업·목적지·구간·날짜(3일 뒤부터) (11-11)
      if(S.pm==="paypal"){ draw(null,L(TX.ppn)); return; }   // 토스 해외간편결제(PayPal)는 USD·별도 계약이라 시험 키에서 COMMON_ERROR (10-29 확인) — 주문 만들지 않고 안내만
      draw(null,"",1); var pm="card";
      fetch(HUBU+"/shop/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pid:(isChr(p)?CHR.PID:p.id),chr:(isChr(p)?CHR.body():undefined),cexp:(isChr(p)?CHR.amount():undefined),hosp:(window.HSP?HSP.body(p):undefined),menu:(window.SMN?SMN.body(p):undefined),mexp:(window.SMN&&SMN.of(p.id)?SMN.appSum(p):undefined),pname:L(p.t),date:S.date,time:S.time,n:S.n,gid:S.gid||null,glang:S.glang||"",lang:window.LANG||"en",name:nm,email:em,phone:ph,consent:true,pg:pgOn()?1:0,sess:(function(){ try{ return localStorage.getItem("mpv_pg_sess")||undefined; }catch(z){ return undefined; } })()})})
       .then(function(r){ return r.json(); }).then(function(j){
         if(!(j&&j.ok&&j.orderId&&j.amount)){ var e=j&&j.err, pe=(isChr(p)&&CHR.errTx(e,j))||(window.TPG?TPG.errTx(e):""); if(isChr(p)&&e){ try{ var bx0=box(), k0=bx0&&bx0.querySelector(".spm"); if(bx0&&S.det&&!host){ paintDet(); if(k0) bx0.appendChild(k0); } else document.dispatchEvent(new Event("chrchg")); }catch(z){} }   // 차량 대절 — 허브가 알려 준 구간·오류를 화면에 (11-11)
           draw(null,pe||(e==="name"?L(TX.enm):e==="email"?L(TX.eem):e==="phone"?L(TX.eph):(e==="date"||e==="time")?L(p.hub&&p.days&&p.days.length?TX.edy:TX.edt):e==="notsale"?L(TX.soon):(e==="hosp"&&window.HSP)?HSP.tx("need"):(e==="menu"&&window.SMN)?SMN.tx("eMenu"):L(TX.efail))); if(e==="menu") loadP().then(function(){ try{ var bx=box(), k=bx&&bx.querySelector(".spm"); if(bx&&S.det&&!host){ paintDet(); if(k) bx.appendChild(k); } }catch(z){} }); return; }
         try{ ntap("shop","order_"+p.id); }catch(z){}
         if(j.pay!=="pg"){ try{ if(window.NEARBK&&j.tdone) NEARBK.put({oid:j.orderId,tk:j.tdone,qv:j.qv||"",kind:"pkg",pname:(isCt(p)?CHR.crsNm(p.id,(CHR.pub().crs||{}).k):L(p.t)),date:S.date,time:S.time,n:S.n,amount:j.amount,status:j.status||"paid",end:0,g:null,room:null,hosp:(window.HSP&&HSP.body(p))||"",chr:isChr(p)?CHR.pub():undefined}); }catch(z){}   // 「내 예약」 (11-05) · 차량 대절 목적지·픽업 (11-11)
           if(isChr(p)) try{ CHR.done(); }catch(z){}
           S.cn=nm; S.ce=em; S.cp=ph; mockPay({ok:true,oid:j.orderId,amount:j.amount,tk:j.tdone||"",chat:!!j.chat},host); return; }
         // KG이니시스 결제창 (포트원, 11-07) — 돌아왔을 때 화면을 다시 그릴 주문 내용은 tpg.js 가 이 탭에만 둔다
         draw(null,"",2);
         return TPG.go(j,{kind:"pkg",oid:j.orderId,amount:j.amount,pid:p.id,chr:isChr(p)?CHR.pub():undefined,mn:(window.SMN?SMN.body(p):[]),hs:(window.HSP&&HSP.body(p))||"",pname:L(p.t),date:S.date,time:S.time,n:S.n,gid:S.gid||null,gname:gnm,glang:S.glang||"",cn:nm,ce:em,cp:ph,pm:pm},{name:nm,email:em,phone:ph})
           .then(function(m){ if(m) draw(null,m); }); })
       .catch(function(){ draw(null,L(TX.efail)); }); };
    var sx=o.querySelector("#spmX"); if(sx) sx.onclick=function(){ o.remove(); };
    var cxb=o.querySelector("#spmCx"); if(cxb) cxb.onclick=function(){ o.remove(); };   // 취소 = 「돌아가기」와 같음 (11-05)
    var chb=o.querySelector("#spmChat"); if(chb) chb.onclick=function(){ if(!window.CHAT) return; close(); CHAT.room(res.tk); };   // 결제 완료 → 그 예약의 말풍선 방 (11-05)
  };
  draw(null,res&&!res.ok?res.err:""); }
// KG이니시스 결제창(포트원)에서 돌아왔을 때 (11-07 — 옛 토스 ?shres= 자리) — tpg.js 가 허브 /shop/port/confirm 으로 확정한 뒤 부른다
//   ok  → 체험·입장권 상세 화면 위에 결제 완료(주문번호 · 💬 말풍선) + 「내 예약」 · 실패·취소 → 실패 안내를 단 결제창 · 확인 중 → 그 안내
if(window.TPG) TPG.onRet("pkg",function(v,r){ loadP().then(function(){ shopRet2(v,r); }); });
function shopRet2(v,r){ if(!PL().some(function(x){ return x.id===v.pid; })) return;
  var ok=!!(r&&r.ok), j=(r&&r.j)||{};
  S.date=v.date; S.time=v.time; S.n=v.n; S.gid=v.gid; try{ if(window.SMN) SMN.setPicks(v.pid,v.mn); }catch(z){} try{ if(window.HSP) HSP.set(v.pid,v.hs); }catch(z){} S.gname=v.gname; S.cn=v.cn||""; S.ce=v.ce||""; S.cp=v.cp||""; S.pm=v.pm;
  if(ok){ try{ if(window.NEARBK&&j.tdone) NEARBK.put({oid:j.orderId,tk:j.tdone,qv:j.qv||"",kind:"pkg",pname:v.pname||"",date:v.date,time:v.time,n:v.n,amount:j.amount,status:j.status||"paid",end:0,g:null,room:null,hosp:v.hs||"",chr:v.chr||undefined}); }catch(z){} if(v.chr) try{ window.CHR&&CHR.done(); }catch(z){} }
  var msg=(window.TPG&&TPG.resTx(r))||(L(TX.pfT)+(r&&r.msg?" ("+r.msg+")":"")), res=ok?{ok:true,oid:j.orderId||v.oid,amount:j.amount||v.amount,tk:j.tdone||"",chat:!!j.chat}:{ok:false,err:msg};
  open(); openDet(v.pid); mockPay(res);
  if(v.glang){ S.glang=v.glang; S.guides=null;   // 가이드 목록은 다시 받아 오되, 다 그린 뒤 결제창을 다시 얹는다
    fetch(HUBU+"/guide/guides?lang="+encodeURIComponent(v.glang)).then(function(q){ return q.json(); }).then(function(j){ S.guides=(j&&j.ok&&j.items)||[]; }).catch(function(){ S.guides=[]; })
      .then(function(){ if(!box()||!S.det) return; var had=!!box().querySelector(".spm"); repaint(); if(had) mockPay(res); }); }
  try{ ntap("shop",ok?"paid_"+v.pid:"payfail_"+v.pid); }catch(z){}
  window.__shResult=ok?"ok":"fail"; }
function loadGuides(){ var l=S.glang; S.guides=null; repaint();
  fetch(HUBU+"/guide/guides?lang="+encodeURIComponent(l)).then(function(r){ return r.json(); }).then(function(j){ if(S.glang!==l) return; S.guides=(j&&j.ok&&j.items)||[]; repaint(); }).catch(function(){ if(S.glang===l){ S.guides=[]; repaint(); } }); }
function open(){ if(box()) return; var b=document.createElement("div"); b.id="shopBox"; document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  S.det=false; b.addEventListener("scroll",barTog,{passive:true});   // 처음엔 목록 · 스크롤하면 폰 띠 숨김/보임 (10-29)
  if(!S.time) S.time="09:00";
  if(!S.date){ S.date=new Date(Date.now()+3*864e5+9*36e5).toISOString().slice(0,10); }
  paint(); try{ ntap("shop","open"); }catch(e){}
  loadP().then(function(){ var bb=box(); if(!bb||bb.querySelector(".spm")) return; if(S.det&&!prod()){ toList(); return; } repaint(); }); }   // 허브 상품 목록 (10-29) — 안 되면 P 그대로
function cpFb(v){ try{ var ta=document.createElement("textarea"); ta.value=v; ta.style.cssText="position:fixed;left:-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }catch(e){} }
function close(){ var b=box(); if(b) b.remove(); document.documentElement.style.overflow=""; }
document.addEventListener("click",function(e){ var b=box(); if(!b||!b.contains(e.target)) return; var t=e.target.closest("[data-s],[data-cat],[data-p],[data-gl],[data-g],[data-n],[data-gi]"); if(!t) return;
  if(t.dataset.gi){ S.gi=+t.dataset.gi; var gl=b.querySelector("#shopGal"); if(gl){ gl.scrollTo({left:S.gi*gl.clientWidth,behavior:"smooth"}); galMark(); } else repaint(); return; }   // 상품 사진 넘기기 (10-29 · 10-30 옆으로 넘기기)
  if(t.dataset.s==="cpy"){ var v=t.dataset.v||"", ok=function(){ t.textContent=L(TX.cpd); setTimeout(function(){ t.textContent=L(TX.cpy); },1600); };   // 택시 카드 주소 복사 (10-30)
    try{ navigator.clipboard.writeText(v).then(ok,function(){ cpFb(v); ok(); }); }catch(z){ cpFb(v); ok(); } return; }   // 상품 사진 넘기기 (10-29)
  if(t.dataset.cat){ S.cat=t.dataset.cat; paint(); }
  else if(t.dataset.p){ openDet(t.dataset.p); try{ ntap("shop","p_"+S.prod); }catch(z){} }   // 카드 = 상세 화면 (10-29)
  else if(t.dataset.s==="bk") toList();
  else if(t.dataset.s==="cx"){ if(S.det&&!S.fromAi) toList(); else { close(); try{ var nb3=window.NEAR&&NEAR.state(); if(nb3&&nb3.k==="tg") NEAR.close(); }catch(z){} } }   // 결제 단추 옆 취소 — 상세 = 「뒤로」(목록), 목록·「AI와 일정짜기」에서 연 상세 = ✕ 닫기와 같음 (11-05)
  else if(t.dataset.s==="go"){ var co=document.getElementById("shopCo"); if(co) co.scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(t.dataset.gl){ S.glang=t.dataset.gl; S.gid=null; loadGuides(); }
  else if(t.dataset.g){ S.gid=t.dataset.g; repaint(); }
  else if(t.dataset.n){ var pm=prod(); S.n=Math.max(1,Math.min(nMax(pm),S.n+(+t.dataset.n))); repaint(); }
  else if(t.dataset.s==="x"){ close(); try{ var nb=window.NEAR&&NEAR.state(); if(nb&&nb.k==="tg") NEAR.close(); }catch(z){} }   // ✕ = 아래 옛 판(빅4·공연관람 목록)까지 닫는다 (사장님 10-28)
  else if(t.dataset.s==="b4map"){ e.preventDefault(); e.stopPropagation(); close(); try{ var nb2=window.NEAR&&NEAR.state(); if(nb2&&nb2.k==="tg") NEAR.close(); }catch(z){} try{ ntap("shop","b4map"); }catch(z){} try{ if(window.b4RouteShow) b4RouteShow(); }catch(z){} }
  else if(t.dataset.s==="mock") mockPay();
  else if(t.dataset.s==="pay"){ close(); try{ if(window.TPAY) TPAY.open(); }catch(z){} }   // 빅4 — 기존 결제(tosspay.js) 그대로
  else if(t.dataset.s==="perf"){ close(); var a=document.querySelector('[data-nr="tgx"][data-g="perf"]'); if(a&&!a.querySelector(".xtg.on")) a.click(); }   // 옛 판의 공연관람 펼치기 (11-07 ▾ 글자 → 공통 단추 .xtg.on 으로 열림 확인)
});
document.addEventListener("toggle",function(e){ var d=e.target; if(d&&d.classList&&d.classList.contains("sfq")&&window.XTG) XTG.set(d.querySelector("summary>.xtg"),d.open); },true);   // 자주 묻는 질문 펼침·접힘 → ▼/— (11-07, toggle 은 거품이 없어 잡기 단계로)
document.addEventListener("change",function(e){ if(e.target&&e.target.id==="shopDt"){ S.date=e.target.value; } if(e.target&&e.target.id==="shopTm"){ S.time=e.target.value; } });
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ repaint(); }catch(e){} return r; };   // 언어 바꾸면 바로
var _gb=window.guBack; window.guBack=function(){ if(box()){ if(back()) return true; close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로 = 닫기
// 폰 뒤로가기(index.html backClose 맨 앞에서 부름) — 결제창 → 상세 → 목록 한 단계씩. 목록이면 false (원래 동작 그대로) (10-29)
function back(){ var b=box(); if(!b) return false; var o=b.querySelector(".spm"); if(o){ o.remove(); return true; } if(S.det){ toList(); return true; } return false; }
window.addEventListener("resize",function(){ try{ barTog(); }catch(e){} });
document.addEventListener("smnchg",function(){ try{ var b=box(); if(b&&!b.querySelector(".spm")) repaint(); }catch(e){} });   // 가게 메뉴 고르기 (11-10, smenu.js)
document.addEventListener("hspchg",function(){ try{ var b=box(); if(b&&!b.querySelector(".spm")) repaint(); }catch(e){} });   // 건강검진 병원 고르기 (11-10, hosp.js)
document.addEventListener("chrchg",function(){ try{ var b=box(); if(b&&S.det&&!b.querySelector(".spm")){ var p=prod(); if(isChr(p)) paintDet(); } }catch(e){} });   // 차량 대절 칸 (11-11, charter.js)
window.SHOP={open:open,close:close,back:back,
  // 「AI와 일정짜기」 화면 (11-05) — 상품 목록(허브에서 받은 것 있으면 그것)·카드 요약·상세 화면 바로 열기
  load:loadP,items:function(){ return PL(); },
  st:function(){ return S; },   // 차량 대절 (charter.js) — 날짜·시작 시각·인원
  set:function(o){ o=o||{}; if(/^\d{4}-\d{2}-\d{2}$/.test(o.date||"")) S.date=o.date; if(/^\d{2}:\d{2}$/.test(o.time||"")) S.time=o.time; if(o.n>0) S.n=Math.min(20,o.n); },
  brief:function(p){ var u=minUnit(p); return {id:p.id,c:p.c,t:L(p.t),img:psrc(p),cat:(function(){ try{ return catName(p.c); }catch(e){ return ""; } })(),from:u?won(u)+"~ / "+L(perOf(p)):"",per:L(perOf(p)),badge:L(p.real?TX.real:TX.ex),real:!!p.real,px:Lx(p.px)}; },
  det:function(id){ if(!PL().some(function(x){ return x.id===id; })) return; open(); openDet(id); S.fromAi=true; try{ ntap("shop","p_"+id); }catch(z){} }};
// PC 홈페이지(home/pc_pkg.js, 11-08) — 패키지 화면을 PC 배치로 그릴 때 이 파일의 자료·글·상세 본문·요금·결제창을 그대로 쓴다 (폰 앱은 PC_HOME 이 없어 그대로)
//   pay(host,id) = 앱 「예약·결제」(mockPay) 를 host 안에 띄움 — 예약자·결제 수단·동의·허브 /shop/order·「내 예약」 저장 모두 앱 그대로
if(window.PC_HOME) SHOP.pc={TX:TX,CATS:CATS,LGN:LGN,S:S,L:L,Lx:Lx,won:won,unitOf:unitOf,minUnit:minUnit,kindOf:kindOf,isExt:isExt,psrc:psrc,galUrls:galUrls,catName:catName,langTxt:langTxt,
  detBody:detBody,noteOf:noteOf,mpNote:mpNote,dayLine:dayLine,priceHtml:priceHtml,fromPr:fromPr,gName:gName,isChr:isChr,perOf:perOf,totOf:totOf,totTx:totTx,nMax:nMax,kLab:kLab,fcOf:fcOf,pxHtml:pxHtml,
  pay:function(host,id){ if(!PL().some(function(x){ return x.id===id; })) return; S.prod=id; mockPay(null,host); }};
// 결제창에서 돌아옴 = tpg.js(?tpres=) → 위 TPG.onRet("pkg") (11-07 — 옛 토스 ?shres= 처리기는 지움)
})();
