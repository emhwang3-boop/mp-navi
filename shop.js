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
 t:T6("체험·입장권","Try & tickets","体験・入場券","体验·门票","體驗·門票","Prueba y entradas"),
 s:T6("한국 투어·체험·입장권을 골라 바로 예약하세요.","Pick Korea tours, experiences and tickets, and book right away.","韓国のツアー・体験・入場券を選んで、すぐ予約しましょう。","挑选韩国的游览·体验·门票，立即预约。","挑選韓國的遊覽·體驗·門票，立即預約。","Elige tours, experiencias y entradas en Corea y resérvalos al momento."),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
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
 cu:T6("예약자 정보","Your details","ご予約者情報","预约人信息","預約人資訊","Tus datos"),
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
 tsv:T6("시험 주문으로 저장했어요. 가이드·예약자에게는 아무것도 보내지 않았어요.","Saved as a test order. Nothing was sent to the guide or to you.","テスト注文として保存しました。ガイドやご予約者には何も送っていません。","已保存为测试订单，未向向导或您发送任何内容。","已儲存為測試訂單，未向嚮導或您傳送任何內容。","Guardado como pedido de prueba. No se envió nada al guía ni a ti."),
 // 토스 결제창 (10-29 카드사 심사 「결제창이 떠야 한다」)
 opn:T6("토스 결제창을 여는 중…","Opening the Toss payment window…","Toss決済画面を開いています…","正在打开Toss付款窗口…","正在開啟Toss付款視窗…","Abriendo la ventana de pago de Toss…"),
 pdT:T6("결제 완료","Payment complete","決済完了","付款完成","付款完成","Pago completado"),
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
 nmap:T6("네이버 지도","Naver Map","NAVER地図","Naver地图","Naver地圖","Naver Map"),
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
 d2:T6("예약 확정 메일의 모바일 바우처(QR)를 보여 주세요.","Show the mobile voucher (QR) from your confirmation email.","予約確定メールのモバイルバウチャー（QR）を見せてください。","请出示确认邮件中的电子凭证（二维码）。","請出示確認郵件中的電子憑證（QR碼）。","Muestra el bono móvil (QR) del correo de confirmación."),
 d3:T6("늦을 것 같으면 바로 연락해 주세요: {n}","Running late? Contact us right away: {n}","遅れそうな場合はすぐにご連絡ください：{n}","如可能迟到，请立即联系：{n}","如可能遲到，請立即聯絡：{n}","¿Llegas tarde? Avísanos enseguida: {n}"),
 d3n:T6("늦을 것 같으면 예약 확정 메일의 연락처로 바로 알려 주세요.","Running late? Tell us right away using the contact in your confirmation email.","遅れそうな場合は、予約確定メールの連絡先にすぐお知らせください。","如可能迟到，请立即通过确认邮件中的联系方式告知。","如可能遲到，請立即透過確認郵件中的聯絡方式告知。","¿Llegas tarde? Avísanos enseguida con el contacto del correo de confirmación."),
 dP1:T6("공연 시작 전에 여유 있게 도착해 주세요.","Arrive with time to spare before the show starts.","開演前に余裕をもってお越しください。","请在演出开始前预留充足时间到达。","請在演出開始前預留充足時間到達。","Llega con tiempo antes de que empiece la función."),
 know:T6("알아 두세요","Good to know","ご注意ください","须知","須知","Información útil"),
 faq:T6("자주 묻는 질문","FAQ","よくある質問","常见问题","常見問題","Preguntas frecuentes"),
 rf5c:T6("날씨·안전 문제를 포함해 회사 또는 업체의 사정으로 취소되면 전액 환불합니다.","If it is cancelled for reasons on our or the venue’s side, including weather or safety, you get a full refund.","天候・安全上の理由を含め、会社または店舗の都合で中止になった場合は全額返金します。","因公司或商家原因（包括天气、安全问题）取消时，全额退款。","因公司或商家原因（包括天氣、安全問題）取消時，全額退款。","Si se cancela por motivos nuestros o del local, incluidos el clima o la seguridad, el reembolso es total."),
 tkDp:T6("공연마다 날짜를 골라 공식 예매처에서 예매합니다.","Pick a date for each show and book on the official ticket site.","公演ごとに日付を選び、公式チケットサイトで予約します。","每场演出选择日期，在官方售票处预订。","每場演出選擇日期，在官方售票處預訂。","Elige la fecha de cada función y reserva en la web oficial."),
 tkE:T6("입장 방법","How to get in","入場方法","入场方式","入場方式","Cómo entrar"),
 tkEd:T6("입구에서 모바일 바우처(QR)를 보여 주면 입장합니다.","Show your mobile voucher (QR) at the entrance to get in.","入口でモバイルバウチャー（QR）を見せて入場します。","在入口出示电子凭证（二维码）即可入场。","在入口出示電子憑證（QR碼）即可入場。","Muestra tu bono móvil (QR) en la entrada para entrar.")
};
var LGN={ko:"한국어",en:"English",ja:"日本語",zhs:"中文(简)",zht:"中文(繁)",es:"Español"};
var CATS=[["all",T6("전체","All","すべて","全部","全部","Todo")],["kpop",T6("K-POP","K-POP","K-POP","K-POP","K-POP","K-POP")],["tour",T6("관광","Sightseeing","観光","观光","觀光","Turismo")],["beauty",T6("미용","Beauty","美容","美容","美容","Belleza")],["hair",T6("헤어","Hair","ヘア","美发","美髮","Peluquería")],["food",T6("음식","Food","グルメ","美食","美食","Comida")],["show",T6("공연","Shows","公演","演出","演出","Espectáculos")],["well",T6("웰니스","Wellness","ウェルネス","养生","養生","Bienestar")]];
var P=[
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
  d:T6("K-드라마 스타일 컷·드라이·펌 상담. 원하는 사진만 보여 주면 현지 업체 직원이 외국어로 상담해 드려요. 통역이 꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요.","K-drama style cut, blow-dry or perm. Just show a photo — local staff will help you in a foreign language. If you really need an interpreter, you can add one separately by booking a travel guide.","K-ドラマ風カット・ブロー・パーマの相談。写真を見せるだけで現地スタッフが外国語でご相談に応じます。通訳が必要な場合は、旅行ガイド予約で別途お付けできます。","韩剧风剪发·吹发·烫发咨询。只要给出照片，当地商家员工会用外语为你咨询。如确需翻译，可另行预约旅行向导。","韓劇風剪髮·吹髮·燙髮諮詢。只要給出照片，當地商家員工會用外語為你諮詢。如確需翻譯，可另行預約旅行嚮導。","Corte, secado o permanente estilo K-drama. Enseña una foto y el personal local te atiende en otro idioma. Si necesitas intérprete, puedes reservar un guía de viaje aparte.")},
 {id:"hb",c:"tour",img:"hanbok",price:45000,mp:4,
  t:T6("경복궁 한복 체험 + 궁궐 해설","Hanbok at Gyeongbokgung + palace guide","景福宮 韓服体験＋宮殿解説","景福宫韩服体验 + 宫殿讲解","景福宮韓服體驗 + 宮殿解說","Hanbok en Gyeongbokgung + guía del palacio"),
  f:[T6("3시간","3 h","3時間","3小时","3小時","3 h"),T6("한복 대여 포함","Hanbok rental","韓服レンタル込み","含韩服租赁","含韓服租借","Alquiler de hanbok"),T6("궁 입장 무료","Free palace entry","入場無料","免费入宫","免費入宮","Entrada gratis")],
  d:T6("한복을 입으면 궁 입장이 무료. 가이드가 궁궐의 이야기와 사진 명당을 안내합니다.","Wearing hanbok gets you in free. Your guide shares the palace’s stories and best photo spots.","韓服を着ると入場無料。ガイドが宮殿の物語と写真スポットを案内します。","穿韩服免费入宫。向导讲解宫殿故事并带你去拍照胜地。","穿韓服免費入宮。嚮導講解宮殿故事並帶你去拍照勝地。","Con hanbok entras gratis. Tu guía cuenta la historia del palacio y los mejores rincones para fotos.")},
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
  d:T6("한국 사람들의 휴식 공간. 여러 온도의 방과 사우나, 간식까지 한 번에 즐깁니다.","Where Koreans relax: rooms at different temperatures, saunas and snacks in one place.","韓国人の憩いの場。温度の違う部屋やサウナ、おやつまで一度に楽しめます。","韩国人的休闲场所，各种温度的房间、桑拿和小吃一次享受。","韓國人的休閒場所，各種溫度的房間、桑拿和小吃一次享受。","Donde se relajan los coreanos: salas a distintas temperaturas, saunas y tentempiés.")}
];
// 고정 상품 8개 상세 칸 (사장님 10-30 「그대로 해봐」 체험·입장권 화면 개편) — 실제 업체가 없는 예시 상품은 주소·연락처를 비워 두고 「예약 확정 후 안내」로 보인다
//   🔴 이 표를 고치면 worker.js SHOP_FX2 도 같이 (같은 내용 JSON)
var NOTE_ACC=T6("휠체어·유모차 이용이나 어린이 동반은 예약 전에 문의해 주세요.","If you use a wheelchair or stroller, or are bringing children, please ask us before booking.","車いす・ベビーカーのご利用やお子様連れの場合は、予約前にお問い合わせください。","如需使用轮椅、婴儿车或携带儿童，请在预约前咨询。","如需使用輪椅、嬰兒車或攜帶兒童，請在預約前諮詢。","Si usas silla de ruedas o carrito, o vienes con niños, consúltanos antes de reservar.");
var NOTE_SHOE=T6("많이 걷습니다. 편한 신발을 신어 주세요.","There is a lot of walking. Please wear comfortable shoes.","よく歩きます。歩きやすい靴でお越しください。","需要走很多路，请穿舒适的鞋。","需要走很多路，請穿舒適的鞋。","Se camina mucho. Lleva calzado cómodo.");
var EXC_OWN=T6("개인 경비 (식사·음료·쇼핑)","Personal expenses (meals, drinks, shopping)","個人的な費用（食事・飲み物・買い物）","个人花费（餐饮·购物）","個人花費（餐飲·購物）","Gastos personales (comidas, bebidas, compras)");
var EXC_INT=T6("통역 (꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요)","Interpreter (if you really need one, add it by booking a travel guide)","通訳（必要な場合は旅行ガイド予約で別途お付けできます）","翻译（如确需，可另行预约旅行向导）","翻譯（如確需，可另行預約旅行嚮導）","Intérprete (si lo necesitas, resérvalo aparte como guía de viaje)");
var FAQ_MP={q:T6("인원이 모자라면 어떻게 되나요?","What if not enough people book?","人数が足りない場合は？","人数不足怎么办？","人數不足怎麼辦？","¿Y si no se llega al mínimo de personas?"),
 a:T6("같은 날짜 예약이 최소 출발 인원에 못 미치면 출발 24시간 전에 알려 드리고 전액 환불합니다.","If the same date doesn’t reach the minimum, we tell you 24 hours before departure and give you a full refund.","同じ日の予約が最少催行人員に満たない場合は、出発の24時間前までにお知らせし、全額返金します。","同一日期预约不足最少成团人数时，我们会在出发前24小时通知您并全额退款。","同一日期預約不足最少成團人數時，我們會在出發前24小時通知您並全額退款。","Si esa fecha no llega al mínimo, te avisamos 24 horas antes de la salida y te devolvemos todo.")};
var FAQ_GD={q:T6("가이드를 꼭 골라야 하나요?","Do I have to choose a guide?","ガイドは必ず選ぶ必要がありますか？","必须选择向导吗？","必須選擇嚮導嗎？","¿Tengo que elegir un guía?"),
 a:T6("아니요. 고르지 않으면 가이드를 배정해 드립니다.","No. If you don’t, we assign a guide for you.","いいえ。選ばない場合はこちらでガイドを手配します。","不必。如未选择，我们会为您安排向导。","不必。如未選擇，我們會為您安排嚮導。","No. Si no eliges, te asignamos uno.")};
var FAQ_INT={q:T6("직원이 제 언어를 하나요?","Will the staff speak my language?","スタッフは私の言語を話せますか？","工作人员会说我的语言吗？","工作人員會說我的語言嗎？","¿El personal hablará mi idioma?"),
 a:T6("현지 업체 직원이 외국어로 진행합니다. 통역이 꼭 필요하면 여행가이드 예약으로 따로 붙일 수 있어요.","Local staff host in foreign languages. If you really need an interpreter, you can add one by booking a travel guide.","現地スタッフが外国語で進行します。通訳が必要な場合は、旅行ガイド予約で別途お付けできます。","由当地商家员工用外语进行。如确需翻译，可另行预约旅行向导。","由當地商家員工用外語進行。如確需翻譯，可另行預約旅行嚮導。","El personal local atiende en otros idiomas. Si necesitas intérprete, puedes reservar un guía de viaje aparte.")};
var MEET_TBD=T6("만나는 곳·시간은 예약이 확정되면 메일로 알려 드립니다.","We’ll email you the meeting point and time once your booking is confirmed.","集合場所・時間は予約確定後にメールでお知らせします。","预约确认后，我们会通过邮件告知集合地点和时间。","預約確認後，我們會透過電子郵件告知集合地點和時間。","Te enviaremos por correo el punto y la hora de encuentro cuando se confirme la reserva.");
var PLACE_TBD=T6("업체 이름·주소는 예약이 확정되면 메일로 알려 드립니다.","We’ll email you the venue name and address once your booking is confirmed.","店名・住所は予約確定後にメールでお知らせします。","预约确认后，我们会通过邮件告知商家名称和地址。","預約確認後，我們會透過電子郵件告知商家名稱和地址。","Te enviaremos por correo el nombre y la dirección del local cuando se confirme la reserva.");
var ALL6=["ko","en","ja","zhs","zht","es"];
var PX={
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
  tip:MEET_TBD,note:[NOTE_SHOE,T6("한 주문 최대 10명 · 결제 후 1개월 안의 예약일에 1회 진행합니다.","Up to 10 people per order · runs once on your booked date within 1 month of payment.","1回の注文で最大10名・決済後1か月以内の予約日に1回実施します。","每笔订单最多10人·付款后1个月内的预约日进行1次。","每筆訂單最多10人·付款後1個月內的預約日進行1次。","Máximo 10 personas por pedido · se realiza una vez en la fecha reservada, dentro de 1 mes desde el pago."),NOTE_ACC],
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
   T6("사진 명당을 안내받습니다","Get shown the best photo spots","写真スポットを案内します","带你去拍照胜地","帶你去拍照勝地","Te llevamos a los mejores rincones para fotos")],
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
  faq:[{q:T6("여기서 결제하나요?","Do I pay here?","ここで決済しますか？","在这里付款吗？","在這裡付款嗎？","¿Pago aquí?"),a:T6("아니요. 공연마다 공식 예매처에서 예매·결제합니다.","No. You book and pay on each show’s official ticket site.","いいえ。公演ごとに公式チケットサイトで予約・決済します。","不。每场演出在官方售票处预订和付款。","不。每場演出在官方售票處預訂和付款。","No. Reservas y pagas en la web oficial de cada función.")}]}
};
P.forEach(function(p){ var x=PX[p.id]; if(x) Object.keys(x).forEach(function(k){ if(p[k]==null) p[k]=x[k]; }); });
// 상품 목록 = 허브 /shop/products (관리자 「상품 관리」, 10-29). 허브가 안 되면 위 P 표 8개 그대로 (대비책)
//   🔴 고정 상품(P 표 8개)은 허브가 base:1 로 주면 이 파일의 P 를 그대로 쓴다 — 토스 심사 중, 글자·분류·가격·상태 안 바뀜
var HP=null, PLc=null;
var PXK=["kind","area","dur","langs","conf","hl","steps","inc","exc","addrKo","addrEn","bizKo","stn","exit","walk","tip","entImg","tel","note","faq","entry"];   // 상세 칸 (10-30)
function hubP(x){ var o=hubP0(x), q=(x.fixed&&PX[x.id])||{};   // 고친 고정 상품에 새 칸이 아직 없으면 위 PX 값
  PXK.forEach(function(k){ var v=x[k], empty=v==null||v===""||(Array.isArray(v)&&!v.length); o[k]=empty&&q[k]!=null?q[k]:v; });
  if(!o.kind) o.kind=o.real==="perf"?"ticket":"tour"; return o; }
function hubP0(x){ return {id:x.id,c:x.c,imgs:x.imgs||[],img0:x.img||"",t:x.t,d:x.d,f:x.f||[],price:x.price||0,disc:x.disc||[],free:!!x.free,days:x.days||[],times:x.times||[],max:x.max||20,st:x.st,link:x.link||"",rt:x.rt,mp:x.minPax||0,real:x.real==="perf"?"perf":(x.st==="sale"?"hub":""),hub:1}; }
function PL(){ if(!HP) return P; if(PLc) return PLc; var o=[]; HP.forEach(function(x){ if(x.base){ var q=P.filter(function(p){ return p.id===x.id; })[0]; if(q) o.push(typeof x.minPax==="number"&&x.minPax!==(q.mp||0)?Object.assign({},q,{mp:x.minPax}):q); } else if(x&&x.id&&x.t) o.push(hubP(x)); }); PLc=o.length?o:P; return PLc; }
function loadP(){ return fetch(HUBU+"/shop/products?l="+encodeURIComponent(window.LANG||"en"),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(j&&j.ok&&Array.isArray(j.items)){ HP=j.items; PLc=null; } }).catch(function(){}); }
function psrc(p,gi){ if(!p.hub) return "img/shop/"+p.img+".webp"; return p.imgs.length?HUBU+"/shop/img/"+p.imgs[Math.min(gi||0,p.imgs.length-1)]:(p.img0||""); }
function unitOf(p,n){ if(!p.hub) return p.real==="b4"?b4Price(n):p.price; var u=p.price; (p.disc||[]).forEach(function(d){ if(n>=d.n) u=d.p; }); return u; }
function fmt(o,n){ return L(o).replace("{n}",n); }
function fchips(p){ return p.f.map(function(x){ return '<span>'+esc(L(x))+'</span>'; }).join("")+(p.mp?'<span>'+esc(fmt(TX.mp,p.mp))+'</span>':''); }   // 특징 칩 + 최소 출발 인원 (10-30)
function mpNote(p){ return p&&p.mp?'<p class="snote">'+esc(fmt(TX.mpn,p.mp))+'</p>':''; }
function hubPr(p,sm){ if(!p.price) return ""; return '<div class="spr">'+won(p.price)+(sm?' <small>/ '+esc(L(TX.per))+'</small>':' / '+esc(L(TX.per)))+(p.disc||[]).map(function(d){ return ' · '+esc(fmt(TX.dp,d.n))+' '+won(d.p); }).join("")+'</div>'; }
function noteOf(p){ return p.hub&&!p.real?TX.soon:(p.real?TX.payn:TX.soon2); }
function dayLine(p){ return p.hub&&!p.free&&p.days.length?'<span>'+esc(L(TX.dys))+': '+p.days.map(function(d){ return esc(L(TX.wd[d])); }).join("·")+'</span>':''; }
// ── 화면 개편 도우미 (10-30) ──
function Lx(o){ return o&&typeof o==="object"?(o[window.LANG]||o.en||o.ko||""):(o||""); }
function kindOf(p){ return p.kind||(p.real==="perf"?"ticket":"tour"); }
function isExt(p){ return p.real==="perf"||(p.hub&&!!p.link); }   // 외부 예매처 — 우리 환불 규정·바우처 아님
function kBadge(p){ var k=kindOf(p); return '<span class="skb skb-'+k+'">'+esc(L(k==="tour"?TX.kT:k==="class"?TX.kC:TX.kK))+'</span>'; }
function fcBadge(p){ return isExt(p)?'':'<span class="sfc">'+esc(L(TX.fc))+'</span>'; }
function langTxt(p,max){ var a=(p.langs||[]).filter(function(l){ return LGN[l]; }).map(function(l){ return LGN[l]; }); if(!a.length) return ""; return max&&a.length>max?a.slice(0,max).join(" · ")+" +"+(a.length-max):a.join(" · "); }
function minUnit(p){ if(!p.hub&&p.real==="b4") return 79000; var u=p.price||0; (p.disc||[]).forEach(function(d){ if(d.p&&d.p<u) u=d.p; }); return u; }
function fromPr(p){ var u=minUnit(p); if(u) return '<div class="spr">'+won(u)+'~ <small>/ '+esc(L(TX.per))+'</small></div>'; return isExt(p)?'<div class="spr"><small>'+esc(L(TX.pxt))+'</small></div>':''; }
function cardHtml(p){ var meta=[catName(p.c),Lx(p.area)].filter(Boolean).join(" · "), inf=[Lx(p.dur),langTxt(p,3)].filter(Boolean);
  return '<button type="button" class="scard'+(S.prod===p.id?" on":"")+'" data-p="'+p.id+'"><div class="sph">'+(psrc(p)?'<img src="'+esc(psrc(p))+'" alt="" loading="lazy">':'')+(p.real?'<span class="sreal">'+esc(L(TX.real))+'</span>':'<span class="sex">'+esc(L(TX.ex))+'</span>')+'</div>'
   +'<div class="scb"><div class="smeta">'+esc(meta)+'</div><h3>'+esc(L(p.t))+'</h3>'+(inf.length?'<div class="sinf">'+inf.map(function(x){ return '<span>'+esc(x)+'</span>'; }).join("")+'</div>':'')
   +'<div class="sbdg">'+kBadge(p)+fcBadge(p)+'</div>'+fromPr(p)+(window.rvMini?rvMini("shop:"+p.id):'')+'</div></button>'; }
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
  if(Lx(p.dur)) key.push([TX.dur,Lx(p.dur)]);
  if(langTxt(p)) key.push([TX.lng,langTxt(p)]);
  if(K==="tour") key.push([null,L(TX.kT)]); else if(K==="class") key.push([null,L(TX.gdN)]); else key.push([null,L(TX.kK)]);
  if(!X){ key.push([null,L(TX.vch)]); if(p.conf) key.push([null,L(p.conf==="now"?TX.cfNow:TX.cf24)]); key.push([null,L(TX.fc),"g"]); }
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
  // ⑥ 찾아가는 방법 (투어는 만나는 곳) — 체험은 크게
  if(p.addrKo||Lx(p.tip)||Lx(p.stn)||p.entImg){ var w='';
    if(p.addrKo){ w+='<div class="sadr">'+(p.bizKo?'<b>'+esc(p.bizKo)+'</b>':'')+'<span>'+esc(p.addrKo)+'</span>'+(p.addrEn?'<span class="sub">'+esc(p.addrEn)+'</span>':'')+'</div>'+mapBtns(p); }
    else w+='<div class="sadr"><b>'+esc(L(TX.tbd))+'</b>'+(Lx(p.area)?'<span>'+esc(Lx(p.area))+'</span>':'')+'</div>';
    if(Lx(p.stn)) w+='<p class="sline"><small>'+esc(L(TX.stn))+'</small> <b>'+esc(Lx(p.stn))+'</b>'+(p.exit?' · '+esc(fmt(TX.ext,p.exit)):'')+(p.walk?' · '+esc(fmt(TX.wk,p.walk)):'')+'</p>';
    if(Lx(p.tip)) w+='<p class="sline">'+(p.addrKo?'<small>'+esc(L(TX.tip))+'</small> ':'')+esc(Lx(p.tip))+'</p>';
    if(p.entImg) w+='<figure class="sent"><img src="'+esc(HUBU+"/shop/img/"+p.entImg)+'" alt="" loading="lazy"><figcaption>'+esc(L(TX.ent))+'</figcaption></figure>';
    if(p.addrKo) w+='<div class="staxi"><small>'+esc(L(TX.tx))+'</small>'+(p.bizKo?'<b class="tb" lang="ko">'+esc(p.bizKo)+'</b>':'')+'<b class="ta" lang="ko">'+esc(p.addrKo)+'</b><p>'+esc(L(TX.txn))+'</p><button type="button" data-s="cpy" data-v="'+esc((p.bizKo?p.bizKo+" ":"")+p.addrKo)+'">'+esc(L(TX.cpy))+'</button></div>';
    h+='<section class="shbx'+(K==="class"?' sbig':'')+'"><h2>'+esc(L(K==="tour"?TX.meet:TX.way))+'</h2>'+w+'</section>'; }
  // ⑦ 당일 이렇게
  var dl=X?[L(TX.dP1)]:[L(TX.d1),L(TX.d2),p.tel?fmt(TX.d3,p.tel):L(TX.d3n)];
  h+='<section class="shbx"><h2>'+esc(L(TX.day))+'</h2><ol class="sstps sday">'+dl.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol></section>';
  // ⑧ 알아 두세요 — 최소 출발 인원은 투어만
  var nt=(p.note||[]).map(Lx).filter(Boolean); if(K==="tour"&&p.mp) nt.push(fmt(TX.mp,p.mp)+" — "+fmt(TX.mpn,p.mp));
  if(nt.length) h+='<section class="shbx"><h2>'+esc(L(TX.know))+'</h2><ul>'+nt.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul></section>';
  // ⑨ 취소·환불 — 가이드 사정 문구는 투어만
  if(!X) h+='<section class="shbx"><h2>'+esc(L(TX.dRf))+'</h2><ul>'+["rf1","rf2","rf3","rf4"].map(function(k){ return '<li>'+esc(L(TX[k]))+'</li>'; }).join("")+'</ul><p>'+esc(L(K==="tour"?TX.rf5:TX.rf5c))+'</p><p>'+esc(L(TX.rf6))+'</p>'
     +'<a class="srfl" href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rfL))+' ›</a></section>';
  // ⑩ 후기 (기존 별점 띠)
  h+=(window.rvSlot?'<div class="rvhost" data-rvhost="1">'+rvSlot("shop:"+p.id)+'</div>':'');
  // ⑪ 자주 묻는 질문
  var fq=(p.faq||[]).filter(function(x){ return x&&Lx(x.q); });
  if(fq.length) h+='<section class="shbx"><h2>'+esc(L(TX.faq))+'</h2>'+fq.map(function(x){ return '<details class="sfq"><summary>'+esc(Lx(x.q))+'</summary><p>'+esc(Lx(x.a))+'</p></details>'; }).join("")+'</section>';
  return h; }
var GLANGS=[["en","English"],["ja","日本語"],["zhs","中文(简)"],["zht","中文(繁)"],["es","Español"],["ko","한국어"]];
var S={cat:"all",prod:null,glang:"",guides:null,gid:null,date:"",n:2,cn:"",ce:"",cp:""};   // cn·ce·cp = 예약자 이름·이메일·전화 (10-28 주문 저장)
var css=document.createElement("style");
css.textContent="#shopBox{position:fixed;inset:0;z-index:2147483003;background:#f6f4ef;color:#1d2433;overflow:auto;-webkit-overflow-scrolling:touch;font-family:system-ui,-apple-system,'Segoe UI','Malgun Gothic',sans-serif}"
 +"#shopBox .sstamp{position:fixed;inset:0;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;overflow:hidden}"
 +"#shopBox .sstamp span{transform:rotate(-24deg);font:900 clamp(44px,11vw,140px)/1 'Segoe UI',Arial,sans-serif;letter-spacing:.06em;color:rgba(214,40,40,.4);border:clamp(5px,1vw,12px) solid rgba(214,40,40,.4);border-radius:18px;padding:.12em .3em;white-space:nowrap}"
 +"#shopBox .shd{position:sticky;top:0;z-index:4;display:flex;align-items:center;gap:10px;padding:12px max(16px,env(safe-area-inset-right,0px)) 12px max(16px,env(safe-area-inset-left,0px));background:#1d2433;color:#fff}"
 +"#shopBox .shd b{font-size:18px}#shopBox .shd .ut{font-size:11px;font-weight:900;color:#ffd6d6;border:1.5px solid #ff8a8a;border-radius:6px;padding:2px 6px;letter-spacing:.05em}"
 +"#shopBox .shd button{margin-left:auto;border:0;background:rgba(255,255,255,.16);color:#fff;font-weight:800;border-radius:999px;padding:8px 14px;cursor:pointer}"
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
 +"#shopBox .sbdg{display:flex;flex-wrap:wrap;gap:5px}#shopBox .skb,#shopBox .sfc{font-size:11.5px;font-weight:800;border-radius:6px;padding:2px 7px}#shopBox .skb-tour{background:#e7f0fb;color:#1f5fa8}#shopBox .skb-class{background:#f3ecfd;color:#6941c6}#shopBox .skb-ticket{background:#fff1e6;color:#c4320a}#shopBox .sfc{background:#e8f6ee;color:#1f7a5a}"
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
 +"#shopBox .sfq{border-top:1px solid #efece4;padding:9px 0}#shopBox .sfq:first-of-type{border-top:0}#shopBox .sfq summary{cursor:pointer;font-weight:800;font-size:14.5px}#shopBox .sdm .sfq p{margin-top:6px;font-size:14px}";
document.head.appendChild(css);
function won(x){ return "₩"+Number(x).toLocaleString("ko-KR"); }
function box(){ return document.getElementById("shopBox"); }
function catName(c){ return L(CATS.filter(function(x){ return x[0]===c; })[0][1]); }
function prod(){ return PL().filter(function(p){ return p.id===S.prod; })[0]; }
// 빅4 「투어 노선도 보기」 — 서울 지도 위 노선도(index.html b4RouteShow)로 (10-28). 카드가 button 이라 span 으로
function rtBtn(){ return '<span class="srt" role="button" data-s="b4map">'+esc(L(T6("투어 노선도 보기","View tour route","ツアー路線図を見る","查看游览路线图","查看遊覽路線圖","Ver la ruta del tour")))+' ›</span>'; }
function b4Price(n){ return n>=2?79000:89000; }
function gName(g){ return window.LANG==="ko"?(g.name||g.name_en||""):(g.name_en||g.name||""); }
function paint(){ var b=box(); if(!b) return; var y=b.scrollTop;
  var PA=PL(), L0=PA.filter(function(p){ return S.cat==="all"||p.c===S.cat; });
  var h='<div class="sstamp" aria-hidden="true"><span>UNDER TESTING</span></div>'
   +'<div class="shd"><b>'+esc(L(TX.t))+'</b><span class="ut">UNDER TESTING</span><button type="button" data-s="x">✕ '+esc(L(TX.x))+'</button></div><div class="sin">'
   +'<p class="ssub">'+esc(L(TX.s))+'</p><div class="sgrid"><div class="smain">'
   +'<div class="scats">'+CATS.map(function(c){ var n=c[0]==="all"?PA.length:PA.filter(function(p){ return p.c===c[0]; }).length; return '<button type="button" data-cat="'+c[0]+'" class="'+(S.cat===c[0]?"on":"")+'">'+esc(L(c[1]))+' '+n+'</button>'; }).join("")+'</div>'
   +'<p class="scnt">'+L0.length+' '+esc(L(TX.n))+'</p>'
   +'<div class="scards">'+L0.map(cardHtml).join("")+'</div>';   // 앞면 단순하게 (10-30)
  h+='</div><aside class="sside">';
  h+=selHtml()+sideHtml()+'</aside></div></div>';
  b.innerHTML=h; b.scrollTop=y; try{ if(window.rvMiniLoad) rvMiniLoad(L0.map(function(p){ return "shop:"+p.id; })); }catch(e){} }   // 카드 맨 아래 별점 작은 띠 (10-29)
// 선택한 상품 칸 — 목록 화면과 상세 화면 왼쪽 기둥이 같이 쓴다 (사장님 10-29 「두 번째 화면을 첫 번째와 같게」)
function selHtml(){ var p0=prod();   // 선택한 상품
  return '<section class="shbx" id="shopSel"><h2>'+esc(L(TX.sel))+'</h2>'+(p0?'<div class="ssel">'+(psrc(p0)?'<img src="'+esc(psrc(p0))+'" alt="">':'')+'<b>'+esc(L(p0.t))+'</b><div class="sft">'+fchips(p0)+'</div>'+(p0.rt?rtBtn():'')+(p0.hub?hubPr(p0):p0.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p0.price?'<div class="spr">'+won(p0.price)+' / '+esc(L(TX.per))+'</div>':'')+'</div>':'<p class="snote">'+esc(L(TX.seln))+'</p>')+'</section>'; }
// 가이드 고르기 + 예약·결제 칸 — 목록 화면 왼쪽 기둥과 상세 화면 결제 칸이 같이 쓴다 (10-29)
function sideHtml(){ var h='', p0=prod(), tour=!p0||kindOf(p0)==="tour";   // 가이드 고르기는 가이드 투어만 (10-30)
  // 가이드
  if(tour){ h+='<section class="shbx"><h2><span class="sstep">1</span>'+esc(L(TX.g1))+'</h2><p class="snote">'+esc(L(TX.gl))+'</p><div class="sgl">'+GLANGS.map(function(l){ return '<button type="button" data-gl="'+l[0]+'" class="'+(S.glang===l[0]?"on":"")+'">'+esc(l[1])+'</button>'; }).join("")+'</div>';
  if(S.glang){ if(S.guides===null) h+='<p class="snote">'+esc(L(TX.gld))+'</p>'; else if(!S.guides.length) h+='<p class="snote">'+esc(L(TX.gn))+'</p>';
    else h+=S.guides.map(function(g){ return '<button type="button" class="sg'+(S.gid===g.id?" on":"")+'" data-g="'+esc(g.id)+'">'+(g.photo?'<img src="'+esc(g.photo)+'" alt="">':'<span class="sav">'+esc(gName(g).slice(0,1))+'</span>')+'<span><b>'+esc(gName(g))+'</b><small>'+esc((g.langs||[]).join(" · "))+(g.years?' · '+esc(g.years):'')+(g.region?' · '+esc(g.region):'')+'</small></span></button>'; }).join(""); }
  h+='</section>'; }
  // 예약·결제
  var p=prod(); h+='<section class="shbx" id="shopCo"><h2><span class="sstep">'+(tour?2:1)+'</span>'+esc(L(TX.g2))+'</h2>';
  if(!p) h+='<p class="snote">'+esc(L(TX.pick))+'</p>';
  else { var gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0];
    if(p.real==="perf") h+='<button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button>';
    else if(p.hub&&p.link) h+='<a class="spay" href="'+esc(p.link)+'" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">'+esc(L(TX.tk))+' ›</a><p class="snote">'+esc(L(TX.tkn))+'</p>';   // 외부 예매처 (10-29)
    else if(p.hub&&!p.real) h+='<p class="snote">'+esc(L(TX.soon))+'</p>';   // 관리자 상품 「준비 중」 — 주문 안 받음
    else { var unit=unitOf(p,S.n), tsel=p.hub&&!p.free&&p.times.length;
      h+='<div class="srow"><label for="shopDt">'+esc(L(TX.date))+'</label><input type="date" id="shopDt" value="'+esc(S.date)+'"></div>'
       +(dayLine(p)?'<p class="snote">'+dayLine(p)+'</p>':'')
       +'<div class="srow"><label for="shopTm">'+esc(L(TX.tm))+'</label>'+(tsel?'<select id="shopTm">'+p.times.map(function(x){ return '<option'+(x===S.time?' selected':'')+'>'+esc(x)+'</option>'; }).join("")+'</select>':'<input type="time" id="shopTm" step="1800" value="'+esc(S.time)+'">')+'</div>'   // 시간 (사장님 10-27 「결제화면에 날짜와 시간까지」)
       +'<div class="srow"><label>'+esc(L(TX.ppl))+'</label><div class="sstp"><button type="button" data-n="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-n="1" aria-label="+">+</button></div></div>'
       +(tour?'<div class="srow"><label>'+esc(L(TX.gd))+'</label><b>'+(gg?esc(gName(gg)):esc(L(TX.none)))+'</b></div>':'')
       +'<div class="stot"><span>'+esc(L(TX.tot))+'</span><span>'+won(unit*S.n)+'</span></div>'
       +'<button type="button" class="spay" data-s="mock">'+esc(L(TX.pay))+' ›</button><p class="snote">'+esc(L(noteOf(p)))+'</p>'+mpNote(p); } }   // 시험 결제창 (사장님 10-27 「결제화면도 띄워줘, 어차피 결제는 안 돼」)
  return h+'</section>'; }
function priceHtml(p){ return p.hub?hubPr(p,true):p.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p.price?'<div class="spr">'+won(p.price)+' <small>/ '+esc(L(TX.per))+'</small></div>':''; }
// 상품 상세 화면 — 왼쪽 상세 · 오른쪽(폰은 아래) 결제 칸 + 폰 맨 아래 띠 (10-29)
function paintDet(){ var b=box(), p=prod(); if(!b||!p) return; var y=b.scrollTop, rk="shop:"+p.id, keep=b.querySelector('.rvp[data-rvk="'+rk+'"]');   // 펼친 후기 칸은 다시 그려도 그대로 (10-29)
  var h='<div class="sstamp" aria-hidden="true"><span>UNDER TESTING</span></div>'
   +'<div class="shd"><b>'+esc(L(TX.t))+'</b><span class="ut">UNDER TESTING</span><button type="button" data-s="x">✕ '+esc(L(TX.x))+'</button></div><div class="sin sdet">'
   +'<button type="button" class="sdbk" data-s="bk">← '+esc(L(TX.bk))+'</button><div class="sdg"><div class="sdm">'
   +detBody(p)   // 뒷면 순서 ①~⑪ (10-30)
   +'</div><aside class="sds">'+selHtml()+sideHtml()+'</aside></div></div>';
  // 폰 맨 아래 띠 — 금액 + 「예약·결제」(누르면 결제 칸으로). 결제 칸이 화면에 보이면 숨긴다
  if(p.real==="perf") h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b></div><button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button></div>';
  else if(p.hub&&p.link) h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b></div><a class="spay" href="'+esc(p.link)+'" target="_blank" rel="noopener" style="text-decoration:none">'+esc(L(TX.tk))+' ›</a></div>';
  else if(p.hub&&!p.real) h+='<div class="sbar"><div><b style="font-size:15px">'+esc(L(p.t))+'</b><small>'+esc(L(TX.ex))+'</small></div></div>';
  else h+='<div class="sbar"><div><small>'+esc(L(TX.tot))+' · '+esc(L(TX.ppl))+' '+S.n+'</small><b>'+won(unitOf(p,S.n)*S.n)+'</b></div><button type="button" class="spay" data-s="go">'+esc(L(TX.pay))+' ›</button></div>';
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
function openDet(id){ var b=box(); if(!b) return; listY=b.scrollTop; S.prod=id; S.det=true; S.gi=0;
  var p=prod(); if(p&&p.hub){ if(!p.free&&p.times.length&&p.times.indexOf(S.time)<0) S.time=p.times[0]; if(S.n>p.max) S.n=p.max; }
  b.scrollTop=0; paintDet(); b.scrollTop=0; try{ if(window.rvLoad) rvLoad("shop:"+id); }catch(e){} barTog(); }
function toList(){ var b=box(); S.det=false; var o=b&&b.querySelector(".spm"); if(o) o.remove(); paint(); if(b) b.scrollTop=listY; }
function repaint(){ if(S.det) paintDet(); else paint(); }
// 결제창 — 「결제하기」를 누르면 허브 /shop/order 에 시험 주문(test:true, 서버가 금액 계산·orderId 발급, 텔레그램 [시험 주문])을 만들고
//   그 orderId·금액으로 토스 결제창(API 개별 연동, 우리 상점 시험 키)을 띄운다 (10-29 카드사 심사 「바로 테스트 결제 완료 → 결제창이 떠야」)
//   돌아오면(?shres=ok|fail) 아래 shopReturn 이 완료/실패 화면. 승인 API(/shop/toss/confirm)는 TOSS_SK 가 없어 부르지 않는다 — 시험 키라 실제 청구 없음
//   🔴 결제 붙일 때: test:true → false, 돌아오면 paymentKey·orderId·amount 를 허브 /shop/toss/confirm 으로 (worker.js shopRoute 주석)
var TCK="test_ck_5OWRapdA8dzyq72vW4gRVo1zEqZK", TSDK="https://js.tosspayments.com/v2/standard", PKEY="mpv_shpay";   // 시험 키 원본 _secrets\toss_test_ck.txt (tosspay.js CK_API 와 같음)
function tsdk(){ return new Promise(function(ok,no){ if(window.TossPayments) return ok(); var s=document.createElement("script"); s.src=TSDK; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function ss(k,v){ try{ if(v===undefined) return JSON.parse(sessionStorage.getItem(k)||"null"); if(v===null) sessionStorage.removeItem(k); else sessionStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
function mockPay(res){ var b=box(), p=prod(); if(!b||!p) return; var o=b.querySelector(".spm"); if(o) o.remove();
  var unit=unitOf(p,S.n), tot=unit*S.n, gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0], gnm=gg?gName(gg):(S.gid&&S.gname)||"";
  o=document.createElement("div"); o.className="spm"; b.appendChild(o); var agd=false; if(!S.pm) S.pm="card";
  // res = 결제창에서 돌아온 결과 {ok, oid, amount} 또는 {ok:false, err}
  var draw=function(oid,err,busy){ var done=res&&res.ok;
    o.innerHTML='<div><h3>'+esc(L(done?TX.pdT:TX.pt))+'<span class="sut">UNDER TESTING</span></h3>'
    +'<b>'+esc(L(TX.ord))+'</b><div class="spick">'+(psrc(p)?'<img src="'+esc(psrc(p))+'" alt="">':'')+'<b>'+esc(L(p.t))+'</b></div>'
    +'<div class="sl"><span>'+esc(L(TX.dtm))+'</span><span>'+esc((S.date||"-")+" "+(S.time||""))+'</span></div><div class="sl"><span>'+esc(L(TX.ppl))+'</span><span>'+S.n+'</span></div>'+(kindOf(p)==="tour"?'<div class="sl"><span>'+esc(L(TX.gd))+'</span><span>'+(gnm?esc(gnm):esc(L(TX.none)))+'</span></div>':'')
    +'<div class="stot"><span>'+esc(L(done?TX.amt:TX.tot))+'</span><span>'+won(done?res.amount:tot)+'</span></div>'
    +(done?'<div class="sl"><span>'+esc(L(TX.oid))+'</span><b>'+esc(res.oid)+'</b></div><div class="sdone">'+esc(L(TX.tkey))+'<br>'+esc(L(TX.tsv))+'</div>'
     :'<b>'+esc(L(TX.cu))+'</b>'
     +'<label class="scl">'+esc(L(TX.cn))+'<input type="text" id="spmN" maxlength="40" autocomplete="name" value="'+esc(S.cn)+'"></label>'
     +'<label class="scl">'+esc(L(TX.cp))+'<input type="tel" id="spmP" maxlength="30" autocomplete="tel" value="'+esc(S.cp)+'"></label>'
     +'<label class="scl">'+esc(L(TX.ce))+'<input type="email" id="spmE" maxlength="100" autocomplete="email" value="'+esc(S.ce)+'"></label>'
     +'<p class="snote">'+esc(L(TX.cpn))+'</p>'
     +'<b>'+esc(L(TX.pm))+'</b><label class="sr"><input type="radio" name="spmm" value="card"'+(S.pm!=="paypal"?" checked":"")+'> '+esc(L(TX.card))+'</label><label class="sr"><input type="radio" name="spmm" value="paypal"'+(S.pm==="paypal"?" checked":"")+'> PayPal</label>'
     +mpNote(p)
     +'<label class="sr"><input type="checkbox" id="spmAg"> '+esc(L(TX.agr))+'</label>'
     +(err?'<div class="serr">'+esc(err)+'</div>':'')
     +'<button type="button" class="spay" id="spmGo" disabled>'+(busy?esc(L(busy===2?TX.opn:TX.sav)):won(tot)+' '+esc(L(TX.payb)))+'</button>')
    +'<button type="button" class="spay" id="spmX" style="background:#efece4;color:#1d2433">'+esc(L(TX.back))+'</button></div>';
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
      if(S.pm==="paypal"){ draw(null,L(TX.ppn)); return; }   // 토스 해외간편결제(PayPal)는 USD·별도 계약이라 시험 키에서 COMMON_ERROR (10-29 확인) — 주문 만들지 않고 안내만
      draw(null,"",1); var pm="card";
      fetch(HUBU+"/shop/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pid:p.id,pname:L(p.t),date:S.date,time:S.time,n:S.n,gid:S.gid||null,glang:S.glang||"",lang:window.LANG||"en",name:nm,email:em,phone:ph,consent:true,test:true})})
       .then(function(r){ return r.json(); }).then(function(j){
         if(!(j&&j.ok&&j.orderId&&j.amount)){ var e=j&&j.err; draw(null,e==="name"?L(TX.enm):e==="email"?L(TX.eem):e==="phone"?L(TX.eph):(e==="date"||e==="time")?L(p.hub&&p.days&&p.days.length?TX.edy:TX.edt):e==="notsale"?L(TX.soon):L(TX.efail)); return; }
         try{ ntap("shop","order_"+p.id); }catch(z){}
         draw(null,"",2);
         // 돌아왔을 때 화면을 다시 그리려고 주문 내용을 이 탭에만 잠깐 둔다 (sessionStorage)
         ss(PKEY,{oid:j.orderId,amount:j.amount,pid:p.id,date:S.date,time:S.time,n:S.n,gid:S.gid||null,gname:gnm,glang:S.glang||"",cn:nm,ce:em,cp:ph,pm:pm,at:Date.now()});
         var base=location.origin+location.pathname, mob=ph.replace(/\D/g,"");
         var req={method:"CARD",amount:{currency:"KRW",value:j.amount},orderId:j.orderId,orderName:String(j.orderName||L(p.t)).slice(0,100),
           successUrl:base+"?shres=ok",failUrl:base+"?shres=fail",customerName:nm.slice(0,40),customerEmail:em};
         if(/^01\d{8,9}$/.test(mob)) req.customerMobilePhone=mob;   // 토스는 한국 휴대폰 숫자만 받는다
         req.card={flowMode:"DEFAULT",useEscrow:false,useCardPoint:false,useAppCardOnly:false};   // 카드사 선택 → 카드사 인증창 (토스 결제창)
         // 🔴 PayPal 붙일 때: method "FOREIGN_EASY_PAY", foreignEasyPay:{provider:"PAYPAL",country:"KR"}, amount 는 USD 여야 한다 (KRW 면 INVALID_AMOUNT_CURRENCY)
         return tsdk().then(function(){ return window.TossPayments(TCK).payment({customerKey:window.TossPayments.ANONYMOUS}).requestPayment(req); })
           .catch(function(e){ window.__shTossErr=String((e&&e.code||"")+" "+(e&&e.message||e)); ss(PKEY,null); draw(null,(e&&e.code==="USER_CANCEL")?L(TX.pfT):((e&&e.message)||L(TX.pfT))); }); })
       .catch(function(){ draw(null,L(TX.efail)); }); };
    o.querySelector("#spmX").onclick=function(){ o.remove(); }; };
  draw(null,res&&!res.ok?res.err:""); }
// 토스 결제창에서 돌아왔을 때 (successUrl ?shres=ok&paymentKey&orderId&amount · failUrl ?shres=fail&code&message&orderId)
//   ok  → 체험·입장권 상세 화면 위에 결제 완료(주문 내용·주문번호·「시험 결제(테스트 키) — 실제 청구 없음」)
//   fail→ 실패/취소 안내를 단 결제창으로 되돌아간다. 주소창 쿼리는 처리 후 지운다
function shopReturn(){ var sp=new URLSearchParams(location.search), r=sp.get("shres"); if(!r) return;
  try{ var keep=location.search.slice(1).split("&").filter(function(x){ return !/^(shres|paymentKey|orderId|amount|paymentType|code|message)=/.test(x); }).join("&");
    history.replaceState(history.state,"",location.pathname+(keep?"?"+keep:"")+location.hash); }catch(e){}
  var v=ss(PKEY); if(!v||!v.pid) return;
  loadP().then(function(){ shopRet2(sp,r,v); }); }
function shopRet2(sp,r,v){ if(!PL().some(function(x){ return x.id===v.pid; })) return;
  var oid=sp.get("orderId")||"", amt=Math.round(Number(sp.get("amount")||0)), ok=r==="ok"&&oid===v.oid&&amt===v.amount;
  if(ok) ss(PKEY,null);
  S.date=v.date; S.time=v.time; S.n=v.n; S.gid=v.gid; S.gname=v.gname; S.cn=v.cn||""; S.ce=v.ce||""; S.cp=v.cp||""; S.pm=v.pm;
  var msg=L(TX.pfT)+(r!=="ok"&&sp.get("message")?" ("+sp.get("message")+")":""), res=ok?{ok:true,oid:v.oid,amount:v.amount}:{ok:false,err:msg};
  open(); openDet(v.pid); mockPay(res);
  if(v.glang){ S.glang=v.glang; S.guides=null;   // 가이드 목록은 다시 받아 오되, 다 그린 뒤 결제창을 다시 얹는다
    fetch(HUBU+"/guide/guides?lang="+encodeURIComponent(v.glang)).then(function(q){ return q.json(); }).then(function(j){ S.guides=(j&&j.ok&&j.items)||[]; }).catch(function(){ S.guides=[]; })
      .then(function(){ if(!box()||!S.det) return; var had=!!box().querySelector(".spm"); repaint(); if(had) mockPay(res); }); }
  try{ ntap("shop",ok?"paid_test_"+v.pid:"payfail_"+v.pid); }catch(z){}
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
  else if(t.dataset.s==="go"){ var co=document.getElementById("shopCo"); if(co) co.scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(t.dataset.gl){ S.glang=t.dataset.gl; S.gid=null; loadGuides(); }
  else if(t.dataset.g){ S.gid=t.dataset.g; repaint(); }
  else if(t.dataset.n){ var pm=prod(); S.n=Math.max(1,Math.min(pm&&pm.hub?pm.max:20,S.n+(+t.dataset.n))); repaint(); }
  else if(t.dataset.s==="x"){ close(); try{ var nb=window.NEAR&&NEAR.state(); if(nb&&nb.k==="tg") NEAR.close(); }catch(z){} }   // ✕ = 아래 옛 판(빅4·공연관람 목록)까지 닫는다 (사장님 10-28)
  else if(t.dataset.s==="b4map"){ e.preventDefault(); e.stopPropagation(); close(); try{ var nb2=window.NEAR&&NEAR.state(); if(nb2&&nb2.k==="tg") NEAR.close(); }catch(z){} try{ ntap("shop","b4map"); }catch(z){} try{ if(window.b4RouteShow) b4RouteShow(); }catch(z){} }
  else if(t.dataset.s==="mock") mockPay();
  else if(t.dataset.s==="pay"){ close(); try{ if(window.TPAY) TPAY.open(); }catch(z){} }   // 빅4 — 기존 결제(tosspay.js) 그대로
  else if(t.dataset.s==="perf"){ close(); var a=document.querySelector('[data-nr="tgx"][data-g="perf"]'); if(a&&!/▾/.test(a.textContent)) a.click(); }   // 옛 판의 공연관람 펼치기
});
document.addEventListener("change",function(e){ if(e.target&&e.target.id==="shopDt"){ S.date=e.target.value; } if(e.target&&e.target.id==="shopTm"){ S.time=e.target.value; } });
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ repaint(); }catch(e){} return r; };   // 언어 바꾸면 바로
var _gb=window.guBack; window.guBack=function(){ if(box()){ if(back()) return true; close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로 = 닫기
// 폰 뒤로가기(index.html backClose 맨 앞에서 부름) — 결제창 → 상세 → 목록 한 단계씩. 목록이면 false (원래 동작 그대로) (10-29)
function back(){ var b=box(); if(!b) return false; var o=b.querySelector(".spm"); if(o){ o.remove(); return true; } if(S.det){ toList(); return true; } return false; }
window.addEventListener("resize",function(){ try{ barTog(); }catch(e){} });
window.SHOP={open:open,close:close,back:back};
if(/[?&]shres=/.test(location.search)){ var _sr=function(){ setTimeout(function(){ try{ shopReturn(); }catch(e){ window.__shRetErr=String(e); } },700); }; if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",_sr); else _sr(); }   // 토스 결제창에서 돌아옴 (10-29)
})();
