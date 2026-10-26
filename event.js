/* 머니퍼즐 투어 — 이벤트 섬 + 한국 빙고 (사장님 2026-10-26)
 *  · 전국 지도(kr) 남해 거북선 옆 바다에 「이벤트 섬」을 리본처럼 얹기만 한다 (kr 원본 그림·자료는 그대로). 그림 = 나노바나나(navi_placer\pics\kr_extra\_event_src)
 *  · 탑의 빈 간판에 코드로 네온 글씨: 빙고 진행 중이면 「Event Open」, 아니면 「Event Close」 — 허브 /npg/event
 *  · 누르면 「Korea Bingo」 화면: 모두 같은 5×5 판, 가운데 FREE, 칸 = 3지선다(손님 언어). 🔴 정답은 허브만 안다 (/npg/bingo/*)
 *    구글 로그인(퍼즐골드 세션 mpv_pg_sess)해야 참가 · 처음엔 「이벤트 규칙」 동의 · 순위·지급은 허브 Cron
 */
(function(){
"use strict";
var H=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
function lg(){ return ["ko","en","ja","zhs","zht","es"].indexOf(window.LANG)>=0?window.LANG:"en"; }
function L(o){ return o[lg()]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
function post(p,b){ return fetch(H+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b||{})}).then(function(r){ return r.json(); }); }
var T={
 title:{ko:"한국 빙고",en:"Korea Bingo",ja:"コリア・ビンゴ",zhs:"韩国宾果",zht:"韓國賓果",es:"Bingo de Corea"},
 sub:{ko:"매주 새 게임 · 월 00:00 ~ 일 24:00 (한국 시간)",en:"A new game every week · Mon 00:00 – Sun 24:00 (Korea time)",ja:"毎週新しいゲーム・月 00:00〜日 24:00（韓国時間）",zhs:"每周新游戏 · 周一 00:00 至 周日 24:00（韩国时间）",zht:"每週新遊戲 · 週一 00:00 至 週日 24:00（韓國時間）",es:"Un juego nuevo cada semana · lun 00:00 – dom 24:00 (hora de Corea)"},
 same:{ko:"모두 같은 판",en:"Same board for everyone",ja:"全員同じボード",zhs:"所有人同一张卡",zht:"所有人同一張卡",es:"El mismo cartón para todos"},
 ends:{ko:"마감 일 24:00",en:"Ends Sun 24:00 KST",ja:"締切 日 24:00",zhs:"截止 周日 24:00",zht:"截止 週日 24:00",es:"Cierra dom 24:00 KST"},
 closed:{ko:"Event Close — 첫 이벤트 준비 중",en:"Event Close — the first event is being prepared",ja:"Event Close — 最初のイベントを準備中",zhs:"Event Close — 首个活动准备中",zht:"Event Close — 首個活動準備中",es:"Event Close — preparando el primer evento"},
 pgsum:{ko:"상: 1등 100 · 2등 50 · 3등 20 퍼즐골드(PG). PG는 이 앱 결제에만 1년 동안 쓰는 가상 포인트이며 현금으로 바꿀 수 없습니다. 상은 한 사람 3번까지(졸업).",en:"Prizes: 1st 100 · 2nd 50 · 3rd 20 Puzzle Gold (PG). PG is a virtual point for payments in this app for 1 year and cannot be exchanged for cash. Up to 3 wins per person (then you graduate).",ja:"賞品：1位100・2位50・3位20パズルゴールド（PG）。PGはこのアプリの決済に1年間使える仮想ポイントで、現金には交換できません。受賞は1人3回まで（卒業）。",zhs:"奖品：第1名100 · 第2名50 · 第3名20 Puzzle Gold（PG）。PG是1年内仅可用于本应用付款的虚拟积分，不能兑换现金。每人最多获奖3次（毕业）。",zht:"獎品：第1名100 · 第2名50 · 第3名20 Puzzle Gold（PG）。PG是1年內僅可用於本應用程式付款的虛擬點數，不能兌換現金。每人最多得獎3次（畢業）。",es:"Premios: 1.º 100 · 2.º 50 · 3.º 20 Puzzle Gold (PG). PG es un punto virtual para pagos en esta app durante 1 año y no se canjea por dinero. Máximo 3 premios por persona (luego te gradúas)."},
 mypg:{ko:"내 퍼즐골드",en:"My Puzzle Gold",ja:"マイパズルゴールド",zhs:"我的 Puzzle Gold",zht:"我的 Puzzle Gold",es:"Mi Puzzle Gold"},
 rules:{ko:"이벤트 규칙",en:"Event rules",ja:"イベント規約",zhs:"活动规则",zht:"活動規則",es:"Reglas del evento"},
 agree:{ko:"동의하고 참가",en:"Agree and join",ja:"同意して参加",zhs:"同意并参加",zht:"同意並參加",es:"Aceptar y participar"},
 signin:{ko:"로그인하고 참가",en:"Sign in to play",ja:"ログインして参加",zhs:"登录后参加",zht:"登入後參加",es:"Inicia sesión para jugar"},
 signed:{ko:"로그인됨",en:"Signed in",ja:"ログイン中",zhs:"已登录",zht:"已登入",es:"Sesión iniciada"},
 stamps:{ko:"도장",en:"Stamps",ja:"スタンプ",zhs:"印章",zht:"印章",es:"Sellos"},
 lines:{ko:"빙고 줄",en:"Bingo lines",ja:"ビンゴ列",zhs:"宾果线",zht:"賓果線",es:"Líneas"},
 left:{ko:"남은 시간",en:"Time left",ja:"残り時間",zhs:"剩余时间",zht:"剩餘時間",es:"Tiempo restante"},
 sq:{ko:"칸",en:"Square",ja:"マス",zhs:"格子",zht:"格子",es:"Casilla"},
 right:{ko:"정답!",en:"Correct!",ja:"正解！",zhs:"答对了！",zht:"答對了！",es:"¡Correcto!"},
 wrong:{ko:"틀렸어요 — 다른 칸에 도전해 보세요",en:"Wrong — try another square",ja:"不正解 — 別のマスに挑戦しよう",zhs:"答错了 — 试试别的格子",zht:"答錯了 — 試試別的格子",es:"Incorrecto: prueba otra casilla"},
 retry:{ko:"다시 도전",en:"TRY AGAIN",ja:"再挑戦",zhs:"再挑战",zht:"再挑戰",es:"OTRA VEZ"},
 tries:{ko:"오늘 이 칸 남은 도전",en:"Tries left today for this square",ja:"このマスの今日の残り挑戦",zhs:"今天此格剩余次数",zht:"今天此格剩餘次數",es:"Intentos restantes hoy en esta casilla"},
 limit:{ko:"이 칸은 오늘 3번 다 도전했어요. 내일 다시 해 보세요.",en:"You’ve used all 3 tries on this square today. Try again tomorrow.",ja:"このマスは今日3回挑戦しました。明日また挑戦してください。",zhs:"此格今天已用完3次机会，请明天再试。",zht:"此格今天已用完3次機會，請明天再試。",es:"Ya usaste los 3 intentos de hoy en esta casilla. Vuelve mañana."},
 bingo:{ko:"빙고!",en:"BINGO!",ja:"ビンゴ！",zhs:"宾果！",zht:"賓果！",es:"¡BINGO!"},
 last:{ko:"지난주 결과",en:"Last week’s results",ja:"先週の結果",zhs:"上周结果",zht:"上週結果",es:"Resultados de la semana pasada"},
 lnN:{ko:"줄",en:"lines",ja:"列",zhs:"线",zht:"線",es:"líneas"},
 grad:{ko:"상을 3번 받아 졸업했어요 — 판은 즐길 수 있지만 순위에는 들어가지 않아요.",en:"You’ve won 3 times and graduated — you can still play, but you won’t be ranked.",ja:"3回受賞して卒業しました — プレイはできますが順位には入りません。",zhs:"你已获奖3次并毕业 — 仍可游玩，但不计入排名。",zht:"你已得獎3次並畢業 — 仍可遊玩，但不計入排名。",es:"Ya ganaste 3 veces y te graduaste: puedes jugar, pero no entras en la clasificación."},
 err:{ko:"잠시 뒤 다시 해 주세요.",en:"Please try again in a moment.",ja:"少し後でもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."},
 x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"}
};
// 이벤트 규칙 (사장님 10-26 확정 문구 — 한국어 기준, 6개 언어)
var RULES=[
 {ko:"이벤트는 매주 월요일 0시부터 일요일 24시(한국 시간)까지 열립니다.",en:"The event runs every week from Monday 00:00 to Sunday 24:00 (Korea time).",ja:"イベントは毎週月曜0時から日曜24時（韓国時間）まで開催されます。",zhs:"活动每周一0点至周日24点（韩国时间）进行。",zht:"活動每週一0點至週日24點（韓國時間）進行。",es:"El evento se celebra cada semana del lunes 00:00 al domingo 24:00 (hora de Corea)."},
 {ko:"구글 계정으로 로그인한 사람만 참가할 수 있으며, 한 사람은 한 계정으로만 참가합니다.",en:"Only people signed in with a Google account can take part, and each person may join with one account only.",ja:"Googleアカウントでログインした人のみ参加でき、1人1アカウントでのみ参加できます。",zhs:"仅限使用Google账号登录者参加，每人只能用一个账号参加。",zht:"僅限使用Google帳號登入者參加，每人只能用一個帳號參加。",es:"Solo pueden participar personas con sesión iniciada en una cuenta de Google, y cada persona solo con una cuenta."},
 {ko:"순위 정하는 방법은 이벤트마다 그 이벤트 화면에 따로 안내합니다. 마감 뒤 서버가 자동으로 판정하며, 사진처럼 심사가 필요한 이벤트는 회사가 뽑습니다.",en:"How winners are ranked is explained separately on each event’s screen. The server judges automatically after closing; for events that need judging, such as photo events, the company selects the winners.",ja:"順位の決め方はイベントごとにそのイベント画面で別途ご案内します。締切後にサーバーが自動で判定し、写真のように審査が必要なイベントは会社が選びます。",zhs:"排名方式在每个活动的画面中另行说明。截止后由服务器自动判定；像照片这类需要评审的活动，由公司评选。",zht:"排名方式在每個活動的畫面中另行說明。截止後由伺服器自動判定；像照片這類需要評審的活動，由公司評選。",es:"La forma de clasificar se explica por separado en la pantalla de cada evento. El servidor decide automáticamente tras el cierre; en eventos que requieren jurado, como los de fotos, la empresa elige a los ganadores."},
 {ko:"상은 1등 100 PG, 2등 50 PG, 3등 20 PG 「퍼즐골드(Puzzle Gold)」로 지급합니다.",en:"Prizes are paid in Puzzle Gold: 1st 100 PG, 2nd 50 PG, 3rd 20 PG.",ja:"賞品は「パズルゴールド（Puzzle Gold）」で、1位100 PG、2位50 PG、3位20 PGを付与します。",zhs:"奖品以“Puzzle Gold（拼图金）”发放：第1名100 PG，第2名50 PG，第3名20 PG。",zht:"獎品以「Puzzle Gold（拼圖金）」發放：第1名100 PG，第2名50 PG，第3名20 PG。",es:"Los premios se pagan en Puzzle Gold: 1.º 100 PG, 2.º 50 PG, 3.º 20 PG."},
 {b:1,ko:"퍼즐골드는 이 앱 안에서만 쓰는 가상 포인트입니다. 어떠한 경우에도 현금이나 실제 돈으로 바꾸거나 환불·지급하지 않으며, 다른 사람에게 넘기거나 팔 수 없습니다.",en:"Puzzle Gold is a virtual point used only inside this app. Under no circumstances can it be exchanged for cash or real money, refunded or paid out, and it cannot be transferred or sold to anyone.",ja:"パズルゴールドはこのアプリ内でのみ使う仮想ポイントです。いかなる場合も現金や実際のお金への交換・払い戻し・支払いは行わず、他人への譲渡や販売もできません。",zhs:"Puzzle Gold 是仅限本应用内使用的虚拟积分。在任何情况下都不能兑换成现金或真实货币、不予退款或支付，也不能转让或出售给他人。",zht:"Puzzle Gold 是僅限本應用程式內使用的虛擬點數。在任何情況下都不能兌換成現金或真實貨幣、不予退款或支付，也不能轉讓或出售給他人。",es:"Puzzle Gold es un punto virtual que solo se usa dentro de esta app. En ningún caso se puede canjear por efectivo o dinero real, reembolsar ni pagar, y no se puede transferir ni vender a nadie."},
 {ko:"퍼즐골드는 받은 날부터 1년 동안 이 앱의 유료 결제에만 쓸 수 있고, 기간이 지나면 자동으로 사라집니다.",en:"Puzzle Gold can be used only for paid purchases in this app for 1 year from the day you receive it, and disappears automatically after that.",ja:"パズルゴールドは受け取った日から1年間、このアプリの有料決済にのみ使え、期間が過ぎると自動的に消滅します。",zhs:"Puzzle Gold 自获得之日起1年内仅可用于本应用的付费消费，过期自动失效。",zht:"Puzzle Gold 自取得之日起1年內僅可用於本應用程式的付費消費，過期自動失效。",es:"Puzzle Gold solo se puede usar en compras de pago de esta app durante 1 año desde que lo recibes, y luego desaparece automáticamente."},
 {ko:"한 사람이 상을 3번 받으면 이벤트 참가가 끝납니다(졸업).",en:"Once a person has won 3 times, their participation in the event ends (graduation).",ja:"1人が3回受賞するとイベントへの参加は終了します（卒業）。",zhs:"每人获奖3次后即结束参加活动（毕业）。",zht:"每人得獎3次後即結束參加活動（畢業）。",es:"Cuando una persona gana 3 veces, termina su participación en el evento (graduación)."},
 {ko:"여러 계정 사용, 프로그램 사용 등 부정한 방법이 확인되면 상과 퍼즐골드를 취소할 수 있습니다.",en:"If cheating such as using multiple accounts or automated programs is found, prizes and Puzzle Gold may be cancelled.",ja:"複数アカウントの使用やプログラムの使用など不正な方法が確認された場合、賞品とパズルゴールドを取り消すことがあります。",zhs:"如发现使用多个账号、程序等不正当手段，可取消奖品和 Puzzle Gold。",zht:"如發現使用多個帳號、程式等不正當手段，可取消獎品和 Puzzle Gold。",es:"Si se detectan trampas como usar varias cuentas o programas automáticos, se pueden anular los premios y el Puzzle Gold."},
 {ko:"회사는 이벤트 내용과 일정을 바꾸거나 중단할 수 있으며, 바뀐 내용은 이 화면에 알립니다.",en:"The company may change or stop the event’s content and schedule, and will announce any changes on this screen.",ja:"会社はイベントの内容や日程を変更・中止することがあり、変更内容はこの画面でお知らせします。",zhs:"公司可变更或中止活动内容及日程，变更内容将在本画面公告。",zht:"公司可變更或中止活動內容及日程，變更內容將在本畫面公告。",es:"La empresa puede cambiar o detener el contenido y el calendario del evento, y avisará de los cambios en esta pantalla."},
 {ko:"문의: 앱 안 문의(고객의 소리) / 회사 이메일 emhwang3@moneypuzzle.co.kr (주식회사 부만)",en:"Contact: in-app inquiry (Customer Voice) / company email emhwang3@moneypuzzle.co.kr (주식회사 부만)",ja:"お問い合わせ：アプリ内のお問い合わせ（お客様の声）／会社メール emhwang3@moneypuzzle.co.kr (주식회사 부만)",zhs:"咨询：应用内咨询（顾客之声）/ 公司邮箱 emhwang3@moneypuzzle.co.kr (주식회사 부만)",zht:"諮詢：應用程式內諮詢（顧客之聲）/ 公司信箱 emhwang3@moneypuzzle.co.kr (주식회사 부만)",es:"Contacto: consulta en la app (La voz del cliente) / correo de la empresa emhwang3@moneypuzzle.co.kr (주식회사 부만)"},
 {ko:"사용처: 이 앱에서 파는 유료 상품(투어 상품 등)을 결제할 때만 쓸 수 있습니다. 제휴 가게·외부 사이트에서는 쓸 수 없습니다.",en:"Where to use: only when paying for paid products sold in this app (such as tours). It cannot be used at partner shops or external sites.",ja:"使い道：このアプリで販売する有料商品（ツアー商品など）の決済時にのみ使えます。提携店や外部サイトでは使えません。",zhs:"使用范围：仅可用于支付本应用销售的付费商品（如旅游商品），不能在合作店铺或外部网站使用。",zht:"使用範圍：僅可用於支付本應用程式銷售的付費商品（如旅遊商品），不能在合作店家或外部網站使用。",es:"Dónde usarlo: solo al pagar productos de pago vendidos en esta app (como tours). No se puede usar en tiendas asociadas ni en sitios externos."},
 {ko:"사용 방법: 결제 화면에서 구글 로그인 → 「퍼즐골드 사용」을 켜고 쓸 만큼 입력 → 남은 금액만 카드 등으로 결제. 1 PG = 1달러(USD)어치로 계산하며, 결제 시점 환율로 원화 금액에서 빼 줍니다. (먼저 만료되는 퍼즐골드부터 차감)",en:"How to use: on the payment screen, sign in with Google → turn on “Use Puzzle Gold” and enter how much → pay only the rest by card etc. 1 PG is worth 1 US dollar, deducted from the KRW price at the exchange rate at the time of payment (Puzzle Gold expiring soonest is used first).",ja:"使い方：決済画面でGoogleログイン →「パズルゴールドを使う」をオンにして使う分を入力 → 残りの金額だけカード等で決済。1 PG＝1米ドル相当で計算し、決済時点の為替レートでウォン金額から差し引きます（有効期限の早いものから使用）。",zhs:"使用方法：在付款画面用Google登录 → 打开“使用 Puzzle Gold”并输入使用数量 → 剩余金额用银行卡等支付。1 PG 按1美元计算，以付款时汇率从韩元金额中扣除（先扣即将到期的）。",zht:"使用方法：在付款畫面用Google登入 → 開啟「使用 Puzzle Gold」並輸入使用數量 → 剩餘金額用信用卡等支付。1 PG 按1美元計算，以付款時匯率從韓元金額中扣除（先扣即將到期的）。",es:"Cómo usarlo: en la pantalla de pago, inicia sesión con Google → activa «Usar Puzzle Gold» e indica cuánto → paga solo el resto con tarjeta, etc. 1 PG equivale a 1 dólar estadounidense y se descuenta del precio en wones al tipo de cambio del momento del pago (se usa primero el que vence antes)."},
 {ko:"결제를 취소·환불하면 쓴 퍼즐골드는 원래 만료일 그대로 되돌려 드립니다(현금으로 돌려주지 않음).",en:"If a payment is cancelled or refunded, the Puzzle Gold you used is returned with its original expiry date (it is not returned as cash).",ja:"決済を取消・返金した場合、使ったパズルゴールドは元の有効期限のまま戻します（現金では返しません）。",zhs:"取消或退款时，已使用的 Puzzle Gold 按原到期日退回（不退现金）。",zht:"取消或退款時，已使用的 Puzzle Gold 按原到期日退回（不退現金）。",es:"Si se cancela o reembolsa un pago, el Puzzle Gold usado se devuelve con su fecha de caducidad original (no se devuelve en efectivo)."},
 {ko:"잔액·받은 내역·만료일은 ⋮ 메뉴 「내 퍼즐골드」에서 확인합니다.",en:"Check your balance, history and expiry dates in “My Puzzle Gold” in the ⋮ menu.",ja:"残高・受取履歴・有効期限は ⋮ メニューの「マイパズルゴールド」で確認できます。",zhs:"余额、获得记录、到期日请在 ⋮ 菜单“我的 Puzzle Gold”中查看。",zht:"餘額、取得紀錄、到期日請在 ⋮ 選單「我的 Puzzle Gold」中查看。",es:"Consulta tu saldo, historial y fechas de caducidad en «Mi Puzzle Gold» del menú ⋮."},
 {ko:"계정을 삭제하거나 마지막 이용 후 1년이 지나면 남은 퍼즐골드는 사라집니다.",en:"If you delete your account, or 1 year passes after your last use, any remaining Puzzle Gold disappears.",ja:"アカウントを削除するか、最後の利用から1年が過ぎると、残りのパズルゴールドは消滅します。",zhs:"删除账号或最后一次使用后满1年，剩余的 Puzzle Gold 将失效。",zht:"刪除帳號或最後一次使用後滿1年，剩餘的 Puzzle Gold 將失效。",es:"Si eliminas tu cuenta o pasa 1 año desde tu último uso, el Puzzle Gold restante desaparece."},
 {ko:"상금은 이벤트 마감 다음 날(월요일) 자동 지급되며, 순위 발표는 이벤트 화면에 이름 일부를 가려 표시합니다.",en:"Prizes are paid automatically the day after the event closes (Monday), and rankings are shown on the event screen with names partly hidden.",ja:"賞品はイベント締切の翌日（月曜日）に自動付与され、順位発表はイベント画面に名前の一部を隠して表示します。",zhs:"奖品于活动截止次日（周一）自动发放，排名在活动画面公布，姓名部分隐藏。",zht:"獎品於活動截止次日（週一）自動發放，排名在活動畫面公布，姓名部分隱藏。",es:"Los premios se pagan automáticamente el día siguiente al cierre (lunes) y la clasificación se muestra en la pantalla del evento con los nombres parcialmente ocultos."},
 {ko:"당첨 안내는 구글 계정 이메일로 보내 드립니다.",en:"Winners are notified by email at their Google account address.",ja:"当選のご案内はGoogleアカウントのメールアドレスにお送りします。",zhs:"获奖通知将发送到您的Google账号邮箱。",zht:"得獎通知將寄送到您的Google帳號信箱。",es:"Avisamos a los ganadores por correo electrónico a la dirección de su cuenta de Google."},
 {ko:"퍼즐골드는 상으로만 주며, 돈을 받고 팔거나 충전해 드리지 않습니다.",en:"Puzzle Gold is given only as a prize; we never sell it or let you top it up for money.",ja:"パズルゴールドは賞品としてのみ付与し、お金で販売・チャージすることはありません。",zhs:"Puzzle Gold 仅作为奖品发放，不出售也不提供充值。",zht:"Puzzle Gold 僅作為獎品發放，不出售也不提供儲值。",es:"Puzzle Gold solo se entrega como premio; nunca lo vendemos ni permitimos recargarlo con dinero."}
];
// 이번 주 순위 방법 — 이벤트 종류별 설정값 (허브 board.kind). 보물상자·명소 맞히기·사진 등은 나중에 여기 값만 더한다 (사장님 10-26)
var RANKHOW={
 bingo:{ko:"빙고 줄 수가 많은 순, 같으면 마지막 줄을 먼저 완성한 순",en:"Most bingo lines first; on a tie, whoever completed their last line first",ja:"ビンゴの列数が多い順、同じなら最後の列を先に完成させた順",zhs:"宾果线数多者优先，相同则最后一条线先完成者优先",zht:"賓果線數多者優先，相同則最後一條線先完成者優先",es:"Más líneas de bingo primero; en empate, quien completó antes su última línea"}
};
var RKL={ko:"이번 주 순위 방법",en:"This week’s ranking",ja:"今週の順位の決め方",zhs:"本周排名方式",zht:"本週排名方式",es:"Clasificación de esta semana"};
var css=document.createElement("style");
css.textContent="#evIsle{position:absolute;z-index:4;width:7.2%;left:58.6%;top:97.2%;transform:translate(-50%,-100%);cursor:pointer;display:none;pointer-events:auto;-webkit-tap-highlight-color:transparent}.map.onkr #evIsle{display:block}html.mpc-lock #evIsle{visibility:hidden}"
 +"#evIsle img{display:block;width:100%;height:auto;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}"
 +"#evIsle .evS{position:absolute;left:27.5%;top:57.8%;width:21.5%;height:12.5%;display:flex;align-items:center;justify-content:center;transform:skewY(13deg);pointer-events:none;font-family:'Segoe UI',system-ui,sans-serif;font-weight:900;white-space:nowrap;letter-spacing:.02em;line-height:1}"
 +"#evIsle .evS.on{color:#ffd6f4;text-shadow:0 0 .12em #fff,0 0 .3em #ff4fd8,0 0 .6em #ff4fd8,0 0 .9em #39d5ff;animation:evNeon 2.6s ease-in-out infinite}#evIsle .evS.off{color:#9aa0aa;text-shadow:0 .05em 0 rgba(0,0,0,.5)}"
 +"@keyframes evNeon{0%,100%{opacity:1}45%{opacity:.82}50%{opacity:.35}55%{opacity:.9}}@media (prefers-reduced-motion:reduce){#evIsle .evS.on{animation:none}}"
 +"#evBox{position:fixed;inset:0;z-index:2147483003;background:#fff8f0;color:#2b2b2b;overflow:auto;font-family:'Segoe UI','Malgun Gothic',system-ui,sans-serif;-webkit-overflow-scrolling:touch}#evBox .ein{max-width:520px;margin:0 auto;padding-bottom:28px;position:relative}"
 +"#evBox .ehd{position:sticky;top:0;z-index:3;background:#fff;border-bottom:3px solid #ff7a1a;display:flex;align-items:center;gap:10px;padding:10px 14px}#evBox .elogo{width:34px;height:34px;border-radius:9px;background:#ff7a1a;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:15px;flex:0 0 auto}"
 +"#evBox .ehd h1{font-size:18px;font-weight:800;margin:0}#evBox .ehd small{display:block;font-size:11px;color:#888;font-weight:600}#evBox .ex{margin-left:auto;border:1px solid #ddd;background:#fff;border-radius:999px;padding:6px 12px;font-weight:800;cursor:pointer;color:#555}"
 +"#evBox .ecard{margin:12px 14px 0;background:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,.06);font-size:14px;line-height:1.55}#evBox .ewk{display:flex;justify-content:space-between;gap:8px;font-size:13px}#evBox .ewk b{color:#ff7a1a}"
 +"#evBox .ebtn{display:block;width:100%;margin-top:10px;border:0;border-radius:12px;padding:12px;font-weight:900;font-size:15px;cursor:pointer;background:#ff7a1a;color:#fff}#evBox .ebtn.g{background:#fff;color:#2b2b2b;border:1.5px solid #e0d6cc}#evBox .elink{background:none;border:0;color:#ff7a1a;font-weight:800;cursor:pointer;padding:6px 0;font-size:13.5px}"
 +"#evBox .egrid{margin:12px 14px 0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}#evBox .ec{position:relative;height:78px;overflow:hidden;background:#fff;border:2px solid #f0dcc8;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:11px;font-weight:700;line-height:1.15;padding:2px;color:#3a3a3a;cursor:pointer;word-break:break-word}"
 +"#evBox .ec .ko{display:block;margin-top:3px;font-size:10px;color:#999;font-weight:600}#evBox .ec.free{background:#ff7a1a;color:#fff;border-color:#ff7a1a;font-size:13px;cursor:default}#evBox .ec.done{background:#fff1e4;border-color:#ff9d55}#evBox .ec.retry{border:2px dashed #e0a100;background:#fffbe8}"
 +"#evBox .ec .rt{position:absolute;bottom:2px;left:0;right:0;font-size:8.5px;color:#b07c00;font-weight:800}#evBox .ec .stp{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border:3px solid #e8322f;border-radius:50%;color:#e8322f;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;transform:rotate(-14deg);background:rgba(255,240,236,.25)}"
 +"#evBox .est{margin:12px 14px 0;display:flex;gap:8px}#evBox .est div{flex:1;background:#fff;border-radius:12px;padding:8px;text-align:center;font-size:11px;color:#888;box-shadow:0 1px 4px rgba(0,0,0,.06)}#evBox .est b{display:block;font-size:18px;color:#2b2b2b}"
 +"#evBox .erk{display:flex;align-items:center;gap:10px;margin-top:8px}#evBox .erk .n{width:32px;height:32px;border-radius:50%;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center}#evBox .erk .pg{margin-left:auto;font-weight:900;color:#c98a00}"
 +"#evSheet{position:fixed;inset:0;z-index:2147483004;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;justify-content:center}#evSheet>div{background:#fff;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 18px 24px;font-family:'Segoe UI','Malgun Gothic',system-ui,sans-serif;color:#2b2b2b}"
 +"#evSheet .qc{font-size:13px;color:#ff7a1a;font-weight:800}#evSheet .qt{font-size:20px;font-weight:800;margin:6px 0 14px;line-height:1.3}#evSheet .op{display:block;width:100%;text-align:left;border:2px solid #e6e6e6;border-radius:14px;padding:13px 15px;font-size:17px;font-weight:700;margin-bottom:10px;background:#fff;cursor:pointer;color:#2b2b2b;font-family:inherit}"
 +"#evSheet .op.ok{background:#e7f8ec;border-color:#27a745;color:#1d7a35}#evSheet .op.bad{background:#fdeaea;border-color:#e8322f;color:#b0201e}#evSheet .msg{font-size:13px;color:#888}#evSheet ol{padding-left:20px;font-size:13.5px;line-height:1.6}#evSheet ol li{margin:4px 0}#evSheet h3{margin:0 0 8px;font-size:18px}"
 +"#evToast{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147483005;border-radius:20px;padding:16px 22px;font-size:26px;font-weight:900;color:#fff;text-align:center;max-width:90vw;pointer-events:none}#evToast.big{font-size:56px;color:#e8322f;background:rgba(255,248,240,.95);box-shadow:0 6px 24px rgba(0,0,0,.15)}";
document.head.appendChild(css);
// ── 이벤트 광고 전광판 (사장님 10-26) — 서해 「비행기 착륙」 전광판과 같은 틀(billboard.js 의 .xbb 모양)을 남해 바다에. 바탕 = 나노바나나(_eventbb_src), 글씨 = 코드 ──
var bbcss=document.createElement("style");
bbcss.textContent="#evBB{display:none;pointer-events:auto;cursor:pointer;z-index:4}.map.onkr #evBB{display:block}html.mpc-lock #evBB{visibility:hidden}#evBB *{pointer-events:none}"
 +"#evBB .ebg{position:absolute;inset:-4%;background:url(img/kr_extra/event_bb.jpg?v=1026) center/cover no-repeat;animation:ebKen 14s ease-in-out infinite alternate}"
 +"@keyframes ebKen{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.08) translate(2%,-1.5%)}}"
 +"#evBB .ebt{position:absolute;left:14%;top:24%;width:50%;height:56%;container-type:size;display:flex;align-items:center;justify-content:center;text-align:center}"
 +"#evBB .ebt b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Arial Black','Segoe UI',Impact,sans-serif;font-weight:900;line-height:1.05;white-space:pre-line;color:#fff;letter-spacing:.02em;"
 +"text-shadow:0 0 .06em #fff,0 0 .18em #ff4fd8,0 0 .4em #ff4fd8,0 0 .7em #39d5ff;opacity:0;transform:scale(.85);transition:opacity .45s,transform .45s}"
 +"#evBB .ebt b.on{opacity:1;transform:scale(1)}#evBB .ebt b.g{color:#ffe28a;text-shadow:0 0 .06em #fff,0 0 .2em #ffb000,0 0 .5em #ff7a1a}"
 +"#evBB .ebsh{position:absolute;top:-20%;bottom:-20%;width:16%;left:-30%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-18deg);animation:xwShine 5s ease-in-out infinite}"
 +"@media (prefers-reduced-motion:reduce){#evBB .ebg,#evBB .ebsh{animation:none}}";
document.head.appendChild(bbcss);
var BBT_OPEN=[["EVENT OPEN",""],["KOREA\nBINGO",""],["Win Puzzle Gold\n100 · 50 · 20","g"],["Every week",""]], BBT_CLOSE=[["Next event\ncoming soon",""]];
var bb=null, bbI=0;
function bbCurve(k){ var t,i,n=20,p=[]; for(i=0;i<=n;i++){ t=i/n; p.push((t*100).toFixed(2)+"% "+(k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); } for(i=n;i>=0;i--){ t=i/n; p.push((t*100).toFixed(2)+"% "+(100-k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); } return "polygon("+p.join(",")+")"; }
function bbMk(){ var mz=document.getElementById("mz"); if(!mz||document.getElementById("evBB")) return;
  bb=document.createElement("div"); bb.id="evBB"; bb.className="xbb"; bb.setAttribute("role","button"); bb.setAttribute("aria-label","Korea Bingo event"); bb.tabIndex=0;
  bb.style.cssText="left:63.6%;top:83.6%;width:18%";   /* 남해 이벤트 섬 오른쪽 빈 바다 — 서해 전광판(폭 18%)과 같은 크기 */
  bb.innerHTML='<i class="xp" style="left:24%"></i><i class="xp" style="left:70.5%"></i><i class="xb" style="left:20.2%"></i><i class="xb" style="left:66.7%"></i>'
    +'<div class="xf" style="clip-path:'+bbCurve(9)+'"><div class="xs" style="clip-path:'+bbCurve(8)+'"><div class="ebg"></div><div class="ebt"></div><i class="ebsh"></i><div class="xg"></div></div></div>';
  mz.appendChild(bb); bb.style.display="";
  var go=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } open(); };
  bb.addEventListener("click",go,false); bb.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") go(e); },false);
  ["pointerdown","mousedown","touchstart"].forEach(function(ev){ bb.addEventListener(ev,function(e){ e.stopPropagation(); },false); });
  bbPaint(); }
function bbPaint(){ if(!bb) return; var L2=OPEN?BBT_OPEN:BBT_CLOSE, t=bb.querySelector(".ebt");
  t.innerHTML=L2.map(function(x,i){ var n=x[0].replace(/\n/g," ").length, fs=n>18?8.5:n>14?10:n>10?13:16; return '<b class="'+x[1]+'" style="font-size:'+fs+'cqw">'+esc(x[0])+'</b>'; }).join("");
  bbI=0; bbStep(); }
function bbStep(){ if(!bb) return; var bs=bb.querySelectorAll(".ebt b"); [].forEach.call(bs,function(b,i){ b.classList.toggle("on",i===bbI%bs.length); }); bbI++; }
setInterval(function(){ try{ if(bb&&typeof VIEW==="string"&&VIEW==="kr"&&!document.hidden) bbStep(); }catch(e){} },2300);
// ── 섬 ──
var isle=null, OPEN=false;
function sign(){ try{ bbPaint(); }catch(e){} if(!isle) return; var s=isle.querySelector(".evS"); s.className="evS "+(OPEN?"on":"off"); s.textContent=OPEN?"Event Open":"Event Close"; fit(); }
function fit(){ if(!isle) return; var s=isle.querySelector(".evS"), w=isle.clientWidth; if(w) s.style.fontSize=(w*0.037)+"px";   /* 간판 폭(섬의 21.5%)에 맞춤 — 지도를 키우면 같이 커진다 */ }
function mk(){ var mz=document.getElementById("mz"); if(!mz||document.getElementById("evIsle")) return;
  isle=document.createElement("div"); isle.id="evIsle"; isle.setAttribute("role","button"); isle.tabIndex=0; isle.setAttribute("aria-label","Event");
  isle.innerHTML='<img src="img/kr_extra/event_isle.webp?v=1026" alt=""><div class="evS off">Event Close</div>'; mz.appendChild(isle);
  var go=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } open(); };
  isle.addEventListener("click",go,false); isle.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") go(e); },false);
  ["pointerdown","mousedown","touchstart"].forEach(function(ev){ isle.addEventListener(ev,function(e){ e.stopPropagation(); },false); });
  try{ new ResizeObserver(fit).observe(isle); }catch(e){ window.addEventListener("resize",fit); }
  sign(); status(); }
function status(){ fetch(H+"/npg/event",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ OPEN=!!(j&&j.open); sign(); }).catch(function(){}); }
setInterval(status,10*60000);
// ── 이벤트(빙고) 화면 ──
var B=null;   // 판 자료
function sess(){ return ls("mpv_pg_sess")||""; }
function box(){ return document.getElementById("evBox"); }
function close(){ var b=box(); if(b) b.remove(); var s=document.getElementById("evSheet"); if(s) s.remove(); document.documentElement.style.overflow=""; try{ window.mpPaid&&mpPaid.end(); }catch(e){} }
function kst(ms){ var d=new Date(ms+9*3600e3); return d.toISOString().slice(5,10).replace("-","/")+" "+d.toISOString().slice(11,16); }
function leftTxt(end){ var s=Math.max(0,end-Date.now()), d=Math.floor(s/864e5), h=Math.floor(s%864e5/36e5); return d+"d "+h+"h"; }
function open(){ close(); var b=document.createElement("div"); b.id="evBox"; b.innerHTML='<div class="ein"><div class="ehd"><div class="elogo">KB</div><div><h1>'+esc(L(T.title))+'</h1><small id="evWk"></small></div><button type="button" class="ex">✕ '+esc(L(T.x))+'</button></div><div id="evBody"><div class="ecard">'+esc(L(T.load))+'</div></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden"; b.querySelector(".ex").onclick=close;
  try{ ntap("_event","open_area"); }catch(e){}
  load(); }
function load(){ post("/npg/bingo/board",{sess:sess(),l:lg()}).then(function(j){ if(!j||!j.ok) throw 0; B=j; paint(); }).catch(function(){ var e=document.getElementById("evBody"); if(e) e.innerHTML='<div class="ecard">'+esc(L(T.err))+'</div>'; }); }
function rulesHtml(){ return '<ol>'+RULES.map(function(r){ return '<li'+(r.b?' style="font-weight:800"':'')+'>'+esc(L(r))+'</li>'; }).join("")+'</ol>'; }
function sheet(html){ var s=document.getElementById("evSheet"); if(s) s.remove(); s=document.createElement("div"); s.id="evSheet"; s.innerHTML='<div>'+html+'</div>'; s.onclick=function(e){ if(e.target===s) s.remove(); }; document.body.appendChild(s); return s; }
function showRules(withAgree){ var s=sheet('<h3>'+esc(L(T.rules))+'</h3>'+rulesHtml()+(withAgree?'<button type="button" class="ebtn" id="evAg" style="background:#ff7a1a;color:#fff;border:0;border-radius:12px;padding:12px;width:100%;font-weight:900;font-size:15px">'+esc(L(T.agree))+'</button>':'')+'<button type="button" class="ebtn g" id="evRx" style="margin-top:8px;width:100%;border-radius:12px;padding:11px;background:#fff;border:1.5px solid #e0d6cc;font-weight:800">'+esc(L(T.x))+'</button>');
  s.querySelector("#evRx").onclick=function(){ s.remove(); };
  var a=s.querySelector("#evAg"); if(a) a.onclick=function(){ a.disabled=true; post("/npg/bingo/agree",{sess:sess(),l:lg()}).then(function(j){ if(j&&j.ok){ s.remove(); if(B&&B.me) B.me.agreed=true; paint(); } else { a.disabled=false; alert(L(T.err)); } }).catch(function(){ a.disabled=false; alert(L(T.err)); }); }; }
function signIn(){   // 퍼즐골드 로그인 창(구글·Apple)을 빙고 화면 위로 — 원래 창(z 1040)이 빙고 화면(z 최상) 뒤에 열려 안 보였다 (10-26 고침)
  var had=sess(); try{ window.mpPG&&mpPG.open(); }catch(e){}
  var pb=document.getElementById("pgBox"); if(pb) pb.style.zIndex="2147483006";
  var t=setInterval(function(){ var p2=document.getElementById("pgBox"), now=sess();
    if(now&&now!==had){ clearInterval(t); try{ window.mpPG&&mpPG.close(); }catch(e){} if(p2) p2.style.zIndex=""; if(box()) post("/npg/bingo/board",{sess:now,l:lg()}).then(function(j){ if(j&&j.ok){ B=j; paint(); if(B.me&&!B.me.agreed&&B.open) showRules(true); } }).catch(function(){ load(); }); return; }   // 로그인되면 바로 빙고로 → 규칙 동의
    if(!p2||p2.hidden){ clearInterval(t); if(p2) p2.style.zIndex=""; if(box()) load(); } },500); }
function paint(){ var e=document.getElementById("evBody"); if(!e||!B) return; var wk=document.getElementById("evWk");
  var st=B.wk?B.wk.slice(5).replace("-","/"):""; if(wk) wk.textContent=L(T.sub);
  var h='', me=B.me, rh=RANKHOW[B.kind||"bingo"];
  if(rh) h+='<div class="ecard" style="font-size:13px"><b style="color:#ff7a1a">'+esc(L(RKL))+'</b> · '+esc(L(rh))+'</div>';
  if(!B.cells||!B.open){ h+='<div class="ecard" style="font-weight:800;color:#555">'+esc(L(T.closed))+'</div><div class="ecard">'+esc(L(T.pgsum))+'<button type="button" class="ebtn g" data-ev="pg">'+esc(L(T.mypg))+'</button><button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>'; }
  else {
    h+='<div class="ecard ewk"><span>'+esc(L(T.ends))+'</span><span>'+esc(L(T.same))+'</span></div>';
    if(!me) h+='<div class="ecard"><button type="button" class="ebtn" data-ev="signin">'+esc(L(T.signin))+'</button></div>';
    else if(me.grad) h+='<div class="ecard" style="color:#7a3cff;font-weight:700">'+esc(L(T.grad))+'</div>';
    var S=me?me.s:[], X=me?me.x:[];
    h+='<div class="egrid">'+B.cells.map(function(c){ if(c.free) return '<div class="ec free">FREE</div>';
      var done=S.indexOf(c.i)>=0, rt=!done&&X.indexOf(c.i)>=0;
      return '<div class="ec'+(done?' done':'')+(rt?' retry':'')+'" data-i="'+c.i+'"><div>'+esc(c.w.en)+(c.w.ko?'<span class="ko">'+esc(c.w.ko)+'</span>':'')+'</div>'+(done?'<div class="stp">OK</div>':'')+(rt?'<div class="rt">'+esc(L(T.retry))+'</div>':'')+'</div>'; }).join("")+'</div>';
    h+='<div class="est"><div><b>'+(S.length+1)+'</b>'+esc(L(T.stamps))+'</div><div><b>'+(me?me.lines:0)+'</b>'+esc(L(T.lines))+'</div><div><b>'+leftTxt(B.end)+'</b>'+esc(L(T.left))+'</div></div>';
    h+='<div class="ecard">'+esc(L(T.pgsum))+'<button type="button" class="ebtn g" data-ev="pg">'+esc(L(T.mypg))+'</button><button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>';
  }
  if(B.last&&B.last.res&&B.last.res.length){ var C=["#e0a100","#9aa4b0","#c47a3c"];
    h+='<div class="ecard"><b>'+esc(L(T.last))+'</b> <span style="color:#888;font-size:12px">'+esc(B.last.wk)+'</span>'+B.last.res.map(function(r,i){ return '<div class="erk"><div class="n" style="background:'+(C[i]||"#bbb")+'">'+r.rk+'</div><div><b>'+esc(r.nm)+'</b><div style="font-size:12px;color:#888">'+r.lines+' '+esc(L(T.lnN))+' · '+kst(r.lt)+'</div></div><div class="pg">'+(r.pg?r.pg+' PG':'')+'</div></div>'; }).join("")+'</div>'; }
  e.innerHTML=h;
  [].forEach.call(e.querySelectorAll("[data-ev]"),function(x){ x.onclick=function(){ var a=x.dataset.ev; if(a==="pg") signIn(); else if(a==="rules") showRules(!!(B.me&&!B.me.agreed)); else if(a==="signin") signIn(); }; });
  [].forEach.call(e.querySelectorAll(".ec[data-i]"),function(x){ x.onclick=function(){ tap(+x.dataset.i); }; }); }
function tap(i){ if(!B||!B.open) return; var me=B.me; if(!me){ signIn(); return; } if(!me.agreed){ showRules(true); return; }
  if(me.s.indexOf(i)>=0) return; var c=B.cells.filter(function(x){ return x.i===i; })[0]; if(!c) return;
  var tl=3-(me.tries[i]||0);
  var s=sheet('<div class="qc">'+esc(L(T.sq))+': '+esc(c.w.en)+(c.w.ko?' · '+esc(c.w.ko):'')+'</div><div class="qt">'+esc(c.q)+'</div>'+c.o.map(function(o,k){ return '<button type="button" class="op" data-c="'+k+'">'+["①","②","③"][k]+' '+esc(o)+'</button>'; }).join("")+'<div class="msg">'+esc(L(T.tries))+': '+Math.max(0,tl)+'/3</div>');
  if(tl<=0){ s.querySelector(".msg").textContent=L(T.limit); [].forEach.call(s.querySelectorAll(".op"),function(b){ b.disabled=true; }); return; }
  [].forEach.call(s.querySelectorAll(".op"),function(b){ b.onclick=function(){ [].forEach.call(s.querySelectorAll(".op"),function(x){ x.disabled=true; });
    var before=me.lines||0;
    post("/npg/bingo/answer",{sess:sess(),i:i,c:+b.dataset.c,l:lg()}).then(function(j){
      if(!j||!j.ok){ s.querySelector(".msg").textContent=j&&j.err==="limit"?L(T.limit):L(T.err); return; }
      me.s=j.s||me.s; me.x=j.x||me.x; me.lines=j.lines||0; me.tries[i]=3-(j.left==null?0:j.left);
      b.classList.add(j.right?"ok":"bad"); toast(j.right?L(T.right):L(T.wrong),j.right?"#27a745":"#e8322f");
      setTimeout(function(){ s.remove(); paint(); if(j.right&&me.lines>before) toast(L(T.bingo),"",true); },900);
    }).catch(function(){ s.querySelector(".msg").textContent=L(T.err); }); }; }); }
function toast(t,bg,big){ var o=document.getElementById("evToast"); if(o) o.remove(); o=document.createElement("div"); o.id="evToast"; if(big) o.className="big"; else o.style.background=bg; o.textContent=t; document.body.appendChild(o); setTimeout(function(){ o.remove(); },big?2200:1100); }
window.evOpen=open;
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ bbMk(); mk(); }); else { bbMk(); mk(); }
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(box()) load(); }catch(e){} return r; };
})();
