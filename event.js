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
function post(p,b){ return fetch(H+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b||{})}).then(function(r){ return r.json(); }).then(function(j){ if(j&&j.err==="geo"){ alert(L(T.geo)); return new Promise(function(){}); } return j; }); }   // geo = 한국 IP·VPN 막힘(10-27) — 안내 한 번, 그 뒤 멈춤
var T={
 geo:{ko:"죄송해요. 이 이벤트는 해외에 계신 분을 위한 것이라, 한국에서 접속하거나 VPN·프록시를 쓰면 참가할 수 없어요.",en:"Sorry — this event is for people outside Korea. You can’t take part while connecting from Korea or through a VPN/proxy.",ja:"申し訳ありません。このイベントは海外にお住まいの方向けのため、韓国からの接続やVPN・プロキシ経由では参加できません。",zhs:"抱歉，本活动面向韩国境外的用户。从韩国连接或使用VPN/代理时无法参加。",zht:"抱歉，本活動面向韓國境外的用戶。從韓國連線或使用VPN/代理時無法參加。",es:"Lo sentimos: este evento es para personas fuera de Corea. No puedes participar si te conectas desde Corea o mediante una VPN o proxy."},
 title:{ko:"한국 빙고",en:"Korea Bingo",ja:"コリア・ビンゴ",zhs:"韩国宾果",zht:"韓國賓果",es:"Bingo de Corea"},
 sub:{ko:"매주 새 게임 · 월 00:00 ~ 일 24:00 (한국 시간)",en:"A new game every week · Mon 00:00 – Sun 24:00 (Korea time)",ja:"毎週新しいゲーム・月 00:00〜日 24:00（韓国時間）",zhs:"每周新游戏 · 周一 00:00 至 周日 24:00（韩国时间）",zht:"每週新遊戲 · 週一 00:00 至 週日 24:00（韓國時間）",es:"Un juego nuevo cada semana · lun 00:00 – dom 24:00 (hora de Corea)"},
 same:{ko:"모두 같은 판",en:"Same board for everyone",ja:"全員同じボード",zhs:"所有人同一张卡",zht:"所有人同一張卡",es:"El mismo cartón para todos"},
 ends:{ko:"마감 일 24:00",en:"Ends Sun 24:00 KST",ja:"締切 日 24:00",zhs:"截止 周日 24:00",zht:"截止 週日 24:00",es:"Cierra dom 24:00 KST"},
 closed:{ko:"Event Close — 첫 이벤트 준비 중",en:"Event Close — the first event is being prepared",ja:"Event Close — 最初のイベントを準備中",zhs:"Event Close — 首个活动准备中",zht:"Event Close — 首個活動準備中",es:"Event Close — preparando el primer evento"},
 pgsum:{ko:"상: 이번 주 이벤트 1등 100 · 2등 50 · 3등 20 퍼즐골드(PG·가상머니), 매일 빙고는 한 주 점수 합계 20점 20 PG · 50점 50 PG · 70점 100 PG. PG는 이 앱 결제에만 1년 동안 쓰는 가상 포인트이며 현금으로 바꿀 수 없습니다. 큰 상은 한 사람 3번까지(졸업).",en:"Prizes: weekly event 1st 100 · 2nd 50 · 3rd 20 Puzzle Gold (PG, virtual money — not real gold); Daily Bingo pays by weekly points: 20 pts → 20 PG · 50 pts → 50 PG · 70 pts → 100 PG. PG is a virtual point for payments in this app for 1 year and cannot be exchanged for cash. Up to 3 big prizes per person (then you graduate).",ja:"賞品：今週のイベントは1位100・2位50・3位20パズルゴールド（PG・仮想マネー）、毎日ビンゴは週間ポイント合計20点で20 PG・50点で50 PG・70点で100 PG。PGはこのアプリの決済に1年間使える仮想ポイントで、現金には交換できません。大きな賞は1人3回まで（卒業）。",zhs:"奖品：本周活动第1名100 · 第2名50 · 第3名20 Puzzle Gold（PG，虚拟货币）；每日宾果按周积分合计：20分得20 PG · 50分得50 PG · 70分得100 PG。PG是1年内仅可用于本应用付款的虚拟积分，不能兑换现金。大奖每人最多3次（毕业）。",zht:"獎品：本週活動第1名100 · 第2名50 · 第3名20 Puzzle Gold（PG，虛擬貨幣）；每日賓果按週積分合計：20分得20 PG · 50分得50 PG · 70分得100 PG。PG是1年內僅可用於本應用程式付款的虛擬點數，不能兌換現金。大獎每人最多3次（畢業）。",es:"Premios: evento semanal 1.º 100 · 2.º 50 · 3.º 20 Puzzle Gold (PG, dinero virtual — no es oro real); el Bingo diario paga por puntos semanales: 20 pts → 20 PG · 50 pts → 50 PG · 70 pts → 100 PG. PG es un punto virtual para pagos en esta app durante 1 año y no se canjea por dinero. Máximo 3 premios grandes por persona (luego te gradúas)."},
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
 gradD:{ko:"상을 3번 받아 졸업했어요 — 상금은 더 없지만 점수·순위·별은 계속 쌓여요.",en:"You’ve won 3 big prizes and graduated — no more prizes, but your points, ranking and stars still count.",ja:"大きな賞を3回受賞して卒業しました — 賞品はもうありませんが、ポイント・順位・星は引き続き記録されます。",zhs:"你已获得3次大奖并毕业 — 不再有奖品，但积分、排名和星星仍会累积。",zht:"你已獲得3次大獎並畢業 — 不再有獎品，但積分、排名和星星仍會累積。",es:"Ya ganaste 3 premios grandes y te graduaste: no hay más premios, pero tus puntos, clasificación y estrellas siguen contando."},
 err:{ko:"잠시 뒤 다시 해 주세요.",en:"Please try again in a moment.",ja:"少し後でもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."},
 x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"}
};
// 이벤트 규칙 (사장님 10-26 확정 문구 — 한국어 기준, 6개 언어)
var RULES=[
 {ko:"이번 주 이벤트는 매주 월요일 0시부터 일요일 24시(한국 시간)까지 열리고, 매일 빙고는 매일 한국 시간 0시에 새 판으로 열립니다.",en:"The weekly event runs every week from Monday 00:00 to Sunday 24:00 (Korea time); Daily Bingo opens a new board every day at 00:00 Korea time.",ja:"今週のイベントは毎週月曜0時から日曜24時（韓国時間）まで、毎日ビンゴは毎日韓国時間0時に新しいボードで開かれます。",zhs:"本周活动每周一0点至周日24点（韩国时间）进行；每日宾果每天韩国时间0点开放新卡。",zht:"本週活動每週一0點至週日24點（韓國時間）進行；每日賓果每天韓國時間0點開放新卡。",es:"El evento semanal se celebra cada semana del lunes 00:00 al domingo 24:00 (hora de Corea); el Bingo diario abre un cartón nuevo cada día a las 00:00, hora de Corea."},
 {ko:"구글 계정으로 로그인한 사람만 참가할 수 있으며, 한 사람은 한 계정으로만 참가합니다.",en:"Only people signed in with a Google account can take part, and each person may join with one account only.",ja:"Googleアカウントでログインした人のみ参加でき、1人1アカウントでのみ参加できます。",zhs:"仅限使用Google账号登录者参加，每人只能用一个账号参加。",zht:"僅限使用Google帳號登入者參加，每人只能用一個帳號參加。",es:"Solo pueden participar personas con sesión iniciada en una cuenta de Google, y cada persona solo con una cuenta."},
 {b:1,ko:"대한민국에 거주하는 분은 참가할 수 없습니다. 한국에서 접속하거나 VPN·프록시를 쓰면 참가가 막히며, 한국 거주자로 확인되면 상과 퍼즐골드를 취소합니다.",en:"Residents of the Republic of Korea may not take part. Entry is blocked when connecting from Korea or through a VPN/proxy, and prizes and Puzzle Gold will be cancelled if a winner is found to live in Korea.",ja:"大韓民国にお住まいの方は参加できません。韓国からの接続やVPN・プロキシ経由では参加できず、韓国在住と確認された場合は賞とパズルゴールドを取り消します。",zhs:"居住在大韩民国的人士不能参加。从韩国连接或使用VPN/代理时将无法参加；如确认为韩国居民，将取消奖项及 Puzzle Gold。",zht:"居住在大韓民國的人士不能參加。從韓國連線或使用VPN/代理時將無法參加；如確認為韓國居民，將取消獎項及 Puzzle Gold。",es:"No pueden participar los residentes de la República de Corea. La participación se bloquea si te conectas desde Corea o mediante una VPN o proxy, y se cancelarán los premios y el Puzzle Gold si se confirma que el ganador reside en Corea."},
 {ko:"순위 정하는 방법은 이벤트마다 그 이벤트 화면에 따로 안내합니다. 마감 뒤 서버가 자동으로 판정하며, 사진처럼 심사가 필요한 이벤트는 회사가 뽑습니다.",en:"How winners are ranked is explained separately on each event’s screen. The server judges automatically after closing; for events that need judging, such as photo events, the company selects the winners.",ja:"順位の決め方はイベントごとにそのイベント画面で別途ご案内します。締切後にサーバーが自動で判定し、写真のように審査が必要なイベントは会社が選びます。",zhs:"排名方式在每个活动的画面中另行说明。截止后由服务器自动判定；像照片这类需要评审的活动，由公司评选。",zht:"排名方式在每個活動的畫面中另行說明。截止後由伺服器自動判定；像照片這類需要評審的活動，由公司評選。",es:"La forma de clasificar se explica por separado en la pantalla de cada evento. El servidor decide automáticamente tras el cierre; en eventos que requieren jurado, como los de fotos, la empresa elige a los ganadores."},
 {ko:"상은 「퍼즐골드(Puzzle Gold)」로 지급합니다. 이번 주 이벤트는 1등 100 PG, 2등 50 PG, 3등 20 PG이고, 매일 빙고는 한 주 점수 합계가 20점 이상이면 20 PG, 50점 이상 50 PG, 70점 이상 100 PG(가장 높은 하나만)입니다.",en:"Prizes are paid in Puzzle Gold. Weekly event: 1st 100 PG, 2nd 50 PG, 3rd 20 PG. Daily Bingo: a weekly points total of 20+ earns 20 PG, 50+ earns 50 PG, 70+ earns 100 PG (only the highest one).",ja:"賞品は「パズルゴールド（Puzzle Gold）」で付与します。今週のイベントは1位100 PG、2位50 PG、3位20 PG、毎日ビンゴは週間ポイント合計が20点以上で20 PG、50点以上で50 PG、70点以上で100 PG（最も高い1つのみ）です。",zhs:"奖品以“Puzzle Gold（拼图金）”发放。本周活动：第1名100 PG，第2名50 PG，第3名20 PG；每日宾果：周积分合计20分以上得20 PG，50分以上得50 PG，70分以上得100 PG（只取最高一档）。",zht:"獎品以「Puzzle Gold（拼圖金）」發放。本週活動：第1名100 PG，第2名50 PG，第3名20 PG；每日賓果：週積分合計20分以上得20 PG，50分以上得50 PG，70分以上得100 PG（只取最高一檔）。",es:"Los premios se pagan en Puzzle Gold. Evento semanal: 1.º 100 PG, 2.º 50 PG, 3.º 20 PG. Bingo diario: con 20 o más puntos semanales, 20 PG; con 50 o más, 50 PG; con 70 o más, 100 PG (solo el más alto)."},
 {b:1,ko:"퍼즐골드는 이 앱 안에서만 쓰는 가상 포인트입니다. 어떠한 경우에도 현금이나 실제 돈으로 바꾸거나 환불·지급하지 않으며, 다른 사람에게 넘기거나 팔 수 없습니다.",en:"Puzzle Gold is a virtual point used only inside this app. Under no circumstances can it be exchanged for cash or real money, refunded or paid out, and it cannot be transferred or sold to anyone.",ja:"パズルゴールドはこのアプリ内でのみ使う仮想ポイントです。いかなる場合も現金や実際のお金への交換・払い戻し・支払いは行わず、他人への譲渡や販売もできません。",zhs:"Puzzle Gold 是仅限本应用内使用的虚拟积分。在任何情况下都不能兑换成现金或真实货币、不予退款或支付，也不能转让或出售给他人。",zht:"Puzzle Gold 是僅限本應用程式內使用的虛擬點數。在任何情況下都不能兌換成現金或真實貨幣、不予退款或支付，也不能轉讓或出售給他人。",es:"Puzzle Gold es un punto virtual que solo se usa dentro de esta app. En ningún caso se puede canjear por efectivo o dinero real, reembolsar ni pagar, y no se puede transferir ni vender a nadie."},
 {ko:"퍼즐골드는 받은 날부터 1년 동안 이 앱의 유료 결제에만 쓸 수 있고, 기간이 지나면 자동으로 사라집니다.",en:"Puzzle Gold can be used only for paid purchases in this app for 1 year from the day you receive it, and disappears automatically after that.",ja:"パズルゴールドは受け取った日から1年間、このアプリの有料決済にのみ使え、期間が過ぎると自動的に消滅します。",zhs:"Puzzle Gold 自获得之日起1年内仅可用于本应用的付费消费，过期自动失效。",zht:"Puzzle Gold 自取得之日起1年內僅可用於本應用程式的付費消費，過期自動失效。",es:"Puzzle Gold solo se puede usar en compras de pago de esta app durante 1 año desde que lo recibes, y luego desaparece automáticamente."},
 {ko:"큰 상(매일 빙고 주간 점수 상 · 이번 주 이벤트 1·2·3등)을 3번 받으면 상금 참가가 끝나며(졸업), 명예의 전당에 오릅니다. 졸업한 뒤에도 게임·점수·별은 계속됩니다.",en:"After winning 3 big prizes (Daily Bingo weekly points prizes or weekly event 1st–3rd), you can no longer win prizes (graduation) and join the Hall of Fame. You can still play and collect points and stars.",ja:"大きな賞（毎日ビンゴの週間ポイント賞・今週のイベント1・2・3位）を3回受けると賞品への参加は終了し（卒業）、殿堂入りします。卒業後もゲーム・ポイント・星は続きます。",zhs:"获得3次大奖（每日宾果周积分奖 · 本周活动第1·2·3名）后即不再获奖（毕业），并进入名人堂。毕业后仍可继续游戏、累积积分和星星。",zht:"獲得3次大獎（每日賓果週積分獎 · 本週活動第1·2·3名）後即不再得獎（畢業），並進入名人堂。畢業後仍可繼續遊戲、累積積分和星星。",es:"Tras ganar 3 premios grandes (premios por puntos semanales del Bingo diario o 1.º–3.º del evento semanal) ya no puedes ganar premios (graduación) y entras en el Salón de la Fama. Puedes seguir jugando y sumando puntos y estrellas."},
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
 bingo:{ko:"그날 판 24칸을 다 맞힌 사람 중 걸린 시간이 짧은 순 → 그날 점수(1등 10·2등 8·3등 6·4등 5·5등 4·6~10등 3·완성 1) → 한 주 합계",en:"Among players who finish all 24 squares of the day’s board, fastest time first → daily points (1st 10 · 2nd 8 · 3rd 6 · 4th 5 · 5th 4 · 6th–10th 3 · finished 1) → weekly total",ja:"その日のボード24マスをすべて正解した人の中で時間の短い順 → その日のポイント（1位10・2位8・3位6・4位5・5位4・6〜10位3・完成1）→ 週間合計",zhs:"在答对当天全部24格的玩家中，用时最短者优先 → 当日积分（第1名10 · 第2名8 · 第3名6 · 第4名5 · 第5名4 · 第6~10名3 · 完成1）→ 周合计",zht:"在答對當天全部24格的玩家中，用時最短者優先 → 當日積分（第1名10 · 第2名8 · 第3名6 · 第4名5 · 第5名4 · 第6~10名3 · 完成1）→ 週合計",es:"Entre quienes completan las 24 casillas del cartón del día, menor tiempo primero → puntos del día (1.º 10 · 2.º 8 · 3.º 6 · 4.º 5 · 5.º 4 · 6.º–10.º 3 · completado 1) → total semanal"}
};
var RKL={ko:"이번 주 순위 방법",en:"This week’s ranking",ja:"今週の順位の決め方",zhs:"本周排名方式",zht:"本週排名方式",es:"Clasificación de esta semana"};
// ── 이벤트 종류 (사장님 10-26) — 닫혀 있으면 종류를 드러내지 않는다 「뭐가 나올지 몰라야지」. 열린 주에만 그 종류 제목·순위 방법·화면 ──
var KIND="";   // 지금 열린 종류 (/npg/event)
var EVT={ko:"이벤트",en:"Event",ja:"イベント",zhs:"活动",zht:"活動",es:"Evento"};
var NEXT={ko:"이벤트 준비 중 — 다음 이벤트를 기다려 주세요",en:"Next event coming soon",ja:"イベント準備中 — 次のイベントをお待ちください",zhs:"活动准备中 — 敬请期待下一场活动",zht:"活動準備中 — 敬請期待下一場活動",es:"Próximo evento muy pronto"};
var KT={
 bingo:T.title,
 treasure:{ko:"지도 속 보물상자",en:"Treasure on the Map",ja:"地図の中の宝箱",zhs:"地图里的宝箱",zht:"地圖裡的寶箱",es:"El tesoro del mapa"},
 spot:{ko:"명소 맞히기",en:"Spot the Sight",ja:"名所当てクイズ",zhs:"猜景点",zht:"猜景點",es:"Adivina el lugar"},
 photo:{ko:"이번 주 사진",en:"Photo of the Week",ja:"今週の写真",zhs:"本周照片",zht:"本週照片",es:"Foto de la semana"}
};
var BBK={bingo:"KOREA\nBINGO",treasure:"TREASURE\nON THE MAP",spot:"SPOT THE\nSIGHT",photo:"PHOTO OF\nTHE WEEK"};
RANKHOW.treasure={ko:"보물상자를 먼저 연 순서 (1·2·3등)",en:"First to open the treasure box wins (1st, 2nd, 3rd)",ja:"宝箱を先に開けた順（1・2・3位）",zhs:"按最先打开宝箱的顺序（第1·2·3名）",zht:"按最先打開寶箱的順序（第1·2·3名）",es:"Gana quien abre antes el cofre (1.º, 2.º, 3.º)"};
RANKHOW.spot={ko:"맞힌 개수가 많은 순, 같으면 걸린 시간이 짧은 순",en:"Most correct answers first; on a tie, the shortest total time",ja:"正解数が多い順、同じならかかった時間が短い順",zhs:"答对数多者优先，相同则用时短者优先",zht:"答對數多者優先，相同則用時短者優先",es:"Más aciertos primero; en empate, el menor tiempo total"};
RANKHOW.photo={ko:"회사가 주제에 가장 잘 맞는 사진 1·2·3등을 고릅니다",en:"The company picks the three photos that best fit the theme",ja:"会社がテーマに最も合う写真1・2・3位を選びます",zhs:"由公司评选最符合主题的照片第1·2·3名",zht:"由公司評選最符合主題的照片第1·2·3名",es:"La empresa elige las tres fotos que mejor encajan con el tema"};
var KRULES={
 bingo:[   // 매일 빙고 — 매일 새 판·그날 점수·주간 기준 PG (사장님 10-27) + 24칸 완성 규칙
  {ko:"매일 빙고는 매일 한국 시간 밤 12시에 새 판으로 바뀝니다. 그날 판을 24칸 모두 맞힌 사람을 걸린 시간이 짧은 순으로 줄 세웁니다.",en:"Daily Bingo switches to a new board every day at midnight Korea time. Everyone who answers all 24 squares of that day’s board is ranked by the shortest time.",ja:"毎日ビンゴは毎日韓国時間の夜12時に新しいボードに変わります。その日のボードの24マスをすべて正解した人を、かかった時間が短い順に並べます。",zhs:"每日宾果每天韩国时间午夜12点换新卡。答对当天全部24格的玩家按用时从短到长排名。",zht:"每日賓果每天韓國時間午夜12點換新卡。答對當天全部24格的玩家按用時從短到長排名。",es:"El Bingo diario cambia a un cartón nuevo cada día a medianoche, hora de Corea. Quienes aciertan las 24 casillas del cartón del día se clasifican por el menor tiempo."},
  {ko:"그날 순위 점수: 1등 10점 · 2등 8점 · 3등 6점 · 4등 5점 · 5등 4점 · 6~10등 3점 · 그 밖에 판을 완성한 사람 1점. 그날 1등은 별 하나를 받습니다. 하루치 상금은 없습니다.",en:"Daily points: 1st 10 · 2nd 8 · 3rd 6 · 4th 5 · 5th 4 · 6th–10th 3 · anyone else who finishes the board 1. The day’s winner gets a star. There is no daily prize.",ja:"その日のポイント：1位10点・2位8点・3位6点・4位5点・5位4点・6〜10位3点・その他ボードを完成した人1点。その日の1位は星を1つもらえます。1日ごとの賞品はありません。",zhs:"当日积分：第1名10分 · 第2名8分 · 第3名6分 · 第4名5分 · 第5名4分 · 第6~10名3分 · 其他完成者1分。当日第1名获得一颗星。没有每日奖品。",zht:"當日積分：第1名10分 · 第2名8分 · 第3名6分 · 第4名5分 · 第5名4分 · 第6~10名3分 · 其他完成者1分。當日第1名獲得一顆星。沒有每日獎品。",es:"Puntos del día: 1.º 10 · 2.º 8 · 3.º 6 · 4.º 5 · 5.º 4 · 6.º–10.º 3 · cualquier otra persona que complete el cartón 1. El ganador del día recibe una estrella. No hay premio diario."},
  {b:1,ko:"한 주(월~일, 한국 시간) 점수를 더해 월요일 0시에 마감합니다. 합계 20점 이상 20 PG · 50점 이상 50 PG · 70점 이상 100 PG — 순위가 아니라 기준 점수라 넘으면 누구나 받으며, 한 사람은 한 주에 가장 높은 하나만 받습니다.",en:"Points are added up over the week (Mon–Sun, Korea time) and closed on Monday at 00:00. Total 20+ → 20 PG · 50+ → 50 PG · 70+ → 100 PG. These are thresholds, not ranks — everyone who reaches one gets it, and each person gets only the highest one per week.",ja:"1週間（月〜日、韓国時間）のポイントを合計し、月曜0時に締め切ります。合計20点以上で20 PG・50点以上で50 PG・70点以上で100 PG — 順位ではなく基準点なので、達した人は誰でももらえ、1人1週間に最も高い1つだけです。",zhs:"一周（周一至周日，韩国时间）的积分累计后于周一0点截止。合计20分以上得20 PG · 50分以上得50 PG · 70分以上得100 PG——这是达标分数而非名次，达到者人人可得，每人每周只取最高一档。",zht:"一週（週一至週日，韓國時間）的積分累計後於週一0點截止。合計20分以上得20 PG · 50分以上得50 PG · 70分以上得100 PG——這是達標分數而非名次，達到者人人可得，每人每週只取最高一檔。",es:"Los puntos se suman durante la semana (lun–dom, hora de Corea) y se cierran el lunes a las 00:00. Total de 20+ → 20 PG · 50+ → 50 PG · 70+ → 100 PG. Son umbrales, no puestos: todos los que lleguen lo reciben, y cada persona solo recibe el más alto por semana."},
  {ko:"시험(TEST) 기간에는 상금이 없고 순위·점수·별만 기록됩니다.",en:"During the TEST period there are no prizes; only rankings, points and stars are recorded.",ja:"テスト（TEST）期間中は賞品はなく、順位・ポイント・星のみ記録されます。",zhs:"测试（TEST）期间没有奖品，只记录排名、积分和星星。",zht:"測試（TEST）期間沒有獎品，只記錄排名、積分和星星。",es:"Durante el periodo de PRUEBA (TEST) no hay premios; solo se registran clasificaciones, puntos y estrellas."},
  {ko:"빙고판은 5×5이며 가운데(FREE)를 뺀 24칸이 모두 문제입니다. 24칸을 모두 맞히면 판 완성입니다(한 줄 완성이 아님).",en:"The bingo card is 5×5; all 24 squares except the centre (FREE) are questions. You complete the card when you answer all 24 correctly (not just one line).",ja:"ビンゴカードは5×5で、中央（FREE）を除く24マスすべてが問題です。24マスすべて正解するとカード完成です（1列完成ではありません）。",zhs:"宾果卡为5×5，除中间（FREE）外的24格都是题目。答对全部24格即完成整张卡（不是完成一条线）。",zht:"賓果卡為5×5，除中間（FREE）外的24格都是題目。答對全部24格即完成整張卡（不是完成一條線）。",es:"El cartón de bingo es de 5×5; las 24 casillas, salvo la central (FREE), son preguntas. Completas el cartón al acertar las 24 (no basta con una línea)."},
  {ko:"걸린 시간은 첫 문제에 답한 때부터 24번째 칸을 맞힌 때까지입니다. 틀린 칸은 판이 열려 있는 동안 횟수 제한 없이 다시 도전할 수 있습니다.",en:"Your time runs from your first answer until you get the 24th square right. You can retry wrong squares as many times as you like while the card is open.",ja:"時間は最初に解答した時から24マス目に正解した時までです。間違えたマスは、カードが開いている間は回数制限なく再挑戦できます。",zhs:"用时从你回答第一题起，到答对第24格为止。答错的格子在卡片开放期间可以不限次数重新挑战。",zht:"用時從你回答第一題起，到答對第24格為止。答錯的格子在卡片開放期間可以不限次數重新挑戰。",es:"Tu tiempo cuenta desde tu primera respuesta hasta que aciertas la casilla 24. Puedes reintentar las casillas falladas sin límite mientras el cartón esté abierto."}
 ],
 treasure:[
  {ko:"앱 지도(서울) 어딘가에 보물상자가 하나 숨어 있습니다. 매일 12시(한국 시간)에 힌트가 하나씩 공개되며, 처음엔 넓게 시작해 점점 좁아집니다.",en:"One treasure box is hidden somewhere on the app’s Seoul map. A new hint is revealed every day at 12:00 (Korea time), starting broad and getting narrower.",ja:"アプリの地図（ソウル）のどこかに宝箱が1つ隠れています。毎日12時（韓国時間）にヒントが1つずつ公開され、最初は広く、だんだん絞られていきます。",zhs:"应用的首尔地图上藏着一个宝箱。每天12点（韩国时间）公开一条提示，从大范围开始逐渐缩小。",zht:"應用程式的首爾地圖上藏著一個寶箱。每天12點（韓國時間）公開一條提示，從大範圍開始逐漸縮小。",es:"Hay un cofre escondido en algún lugar del mapa de Seúl de la app. Cada día a las 12:00 (hora de Corea) se revela una pista, de más general a más precisa."},
  {ko:"지도에서 상자가 있을 것 같은 곳을 누르면 열립니다. 틀리게 누르면 1분 동안 기다려야 다시 누를 수 있습니다.",en:"Tap the spot on the map where you think the box is. After a wrong tap you must wait 1 minute before trying again.",ja:"宝箱がありそうな場所を地図でタップすると開きます。外れたら1分待ってから再挑戦できます。",zhs:"在地图上点击你认为宝箱所在的位置即可打开。点错后需等待1分钟才能再试。",zht:"在地圖上點擊你認為寶箱所在的位置即可打開。點錯後需等待1分鐘才能再試。",es:"Toca en el mapa el lugar donde crees que está el cofre. Tras un toque equivocado, espera 1 minuto para volver a intentarlo."},
  {ko:"먼저 연 순서대로 1·2·3등이며, 3등이 나오면 상자 위치와 힌트를 모두 공개합니다.",en:"The first three to open it are 1st, 2nd and 3rd. Once the 3rd winner is found, the location and all hints are revealed.",ja:"先に開けた順に1・2・3位で、3位が出たら宝箱の位置とヒントをすべて公開します。",zhs:"按打开先后决定第1·2·3名，第3名产生后公开宝箱位置和全部提示。",zht:"按打開先後決定第1·2·3名，第3名產生後公開寶箱位置和全部提示。",es:"Los tres primeros en abrirlo son 1.º, 2.º y 3.º. Cuando aparece el 3.º, se revelan la ubicación y todas las pistas."}],
 spot:[
  {ko:"우리 앱 지도에 그림이 있는 전국 명소가 나옵니다(서울·수도권·강원·충청·전라·경상·경주·부산·제주). 명소 사진 10장이 차례로 나오고, 지도에서 그 명소 그림을 누르면 정답입니다. 다른 지역 명소는 전국 지도에서 그 지역 그림을 눌러 들어가 찾으세요.",en:"Sights from all over Korea that have a picture on our app’s maps are used (Seoul, Capital area, Gangwon, Chungcheong, Jeolla, Gyeongsang, Gyeongju, Busan, Jeju). 10 photos are shown one by one; tap that sight’s picture on the map to answer. For a sight in another region, tap that region’s picture on the Korea map to go there.",ja:"アプリの地図に絵がある全国の名所が出題されます（ソウル・首都圏・江原・忠清・全羅・慶尚・慶州・釜山・済州）。名所の写真が10枚順番に出て、地図でその名所の絵をタップすれば正解です。ほかの地域の名所は、全国地図でその地域の絵をタップして入って探してください。",zhs:"出题范围是本应用地图上有图画的全国景点（首尔·首都圈·江原·忠清·全罗·庆尚·庆州·釜山·济州）。依次出现10张景点照片，在地图上点击该景点的图画即为答对。其他地区的景点，请在全国地图上点击该地区的图画进入后寻找。",zht:"出題範圍是本應用程式地圖上有圖畫的全國景點（首爾·首都圈·江原·忠清·全羅·慶尚·慶州·釜山·濟州）。依次出現10張景點照片，在地圖上點擊該景點的圖畫即為答對。其他地區的景點，請在全國地圖上點擊該地區的圖畫進入後尋找。",es:"Salen lugares de toda Corea que tienen dibujo en los mapas de la app (Seúl, área capital, Gangwon, Chungcheong, Jeolla, Gyeongsang, Gyeongju, Busan, Jeju). Se muestran 10 fotos una a una; toca el dibujo de ese lugar en el mapa para responder. Para un lugar de otra región, toca el dibujo de esa región en el mapa de Corea para entrar."},
  {ko:"문제당 60초입니다. 주중 아무 때나 한 번만 도전할 수 있으며, 시작하면 끝까지 이어집니다.",en:"60 seconds per photo. You can play once, any time during the week; once you start, it runs to the end.",ja:"1問60秒です。週の間いつでも1回だけ挑戦でき、始めたら最後まで続きます。",zhs:"每题60秒。本周内任何时间可挑战一次，一旦开始须一直进行到结束。",zht:"每題60秒。本週內任何時間可挑戰一次，一旦開始須一直進行到結束。",es:"60 segundos por foto. Puedes jugar una vez, cuando quieras durante la semana; al empezar, sigue hasta el final."}],
 photo:[
  {ko:"이번 주 주제에 맞는 사진을 1인 1장 올립니다. 자기 나라에서 찍은 사진도 됩니다. 본인 얼굴은 나와도 안 나와도 됩니다.",en:"Upload one photo per person that fits this week’s theme. Photos taken in your own country are fine. Your own face may or may not appear.",ja:"今週のテーマに合う写真を1人1枚投稿します。自分の国で撮った写真でもOKです。本人の顔は写っていても写っていなくても構いません。",zhs:"每人上传一张符合本周主题的照片，在自己国家拍的也可以。本人的脸出现与否均可。",zht:"每人上傳一張符合本週主題的照片，在自己國家拍的也可以。本人的臉出現與否均可。",es:"Sube una foto por persona que encaje con el tema de la semana. Vale una foto hecha en tu país. Tu cara puede salir o no."},
  {ko:"직접 찍은 사진만 됩니다. 남의 사진·AI로 만든 사진·다른 사람 얼굴이 크게 나온 사진은 제외하며, 부적절한 사진은 지웁니다.",en:"Only photos you took yourself. Other people’s photos, AI-made images and photos with other people’s faces shown large are excluded; inappropriate photos are deleted.",ja:"自分で撮った写真のみです。他人の写真・AIで作った画像・他人の顔が大きく写った写真は対象外で、不適切な写真は削除します。",zhs:"仅限本人拍摄的照片。他人照片、AI生成图片、他人脸部明显的照片不在评选范围内，不当照片将被删除。",zht:"僅限本人拍攝的照片。他人照片、AI生成圖片、他人臉部明顯的照片不在評選範圍內，不當照片將被刪除。",es:"Solo fotos hechas por ti. Se excluyen fotos de otros, imágenes hechas con IA y fotos con caras de otras personas en primer plano; las inadecuadas se eliminan."},
  {ko:"올리면 회사가 SNS에서 사진을 소개할 수 있다는 데 동의하는 것입니다. 1·2·3등은 회사가 고릅니다.",en:"By uploading you agree that the company may feature your photo on social media. The company picks 1st, 2nd and 3rd.",ja:"投稿すると、会社がSNSで写真を紹介することに同意したものとみなします。1・2・3位は会社が選びます。",zhs:"上传即表示同意公司在社交媒体上介绍你的照片。第1·2·3名由公司评选。",zht:"上傳即表示同意公司在社群媒體上介紹你的照片。第1·2·3名由公司評選。",es:"Al subirla aceptas que la empresa pueda mostrar tu foto en redes sociales. La empresa elige 1.º, 2.º y 3.º."}]
};
// 매일 빙고·이번 주 이벤트 두 칸 (사장님 10-27) — 탭·배너·이번 주 점수
var TABS={bingo:{ko:"오늘의 빙고",en:"Today’s Bingo",ja:"今日のビンゴ",zhs:"今日宾果",zht:"今日賓果",es:"Bingo de hoy"},ev:{ko:"이번 주 이벤트",en:"This week’s event",ja:"今週のイベント",zhs:"本周活动",zht:"本週活動",es:"Evento de la semana"}};
var DSUB={ko:"매일 새 판 · 한국 시간 밤 12시에 바뀜",en:"A new board every day · changes at midnight Korea time",ja:"毎日新しいボード・韓国時間の夜12時に更新",zhs:"每天新卡 · 韩国时间午夜12点更换",zht:"每天新卡 · 韓國時間午夜12點更換",es:"Un cartón nuevo cada día · cambia a medianoche (hora de Corea)"};
var RKD={ko:"순위 방법",en:"How ranking works",ja:"順位の決め方",zhs:"排名方式",zht:"排名方式",es:"Cómo se clasifica"};
var LIVEB={ko:"상금: 한 주(월~일) 점수 합계 20점 → 20 PG · 50점 → 50 PG · 70점 → 100 PG (월요일 0시 마감) · 매일 밤 12시(한국 시간) 새 판",en:"Prizes: weekly points total (Mon–Sun) 20 → 20 PG · 50 → 50 PG · 70 → 100 PG (closes Mon 00:00) · New board every midnight (Korea time)",ja:"賞品：1週間（月〜日）のポイント合計 20点→20 PG・50点→50 PG・70点→100 PG（月曜0時締切）・毎晩12時（韓国時間）に新しいボード",zhs:"奖品：一周（周一至周日）积分合计 20分→20 PG · 50分→50 PG · 70分→100 PG（周一0点截止）· 每天午夜12点（韩国时间）换新卡",zht:"獎品：一週（週一至週日）積分合計 20分→20 PG · 50分→50 PG · 70分→100 PG（週一0點截止）· 每天午夜12點（韓國時間）換新卡",es:"Premios: total de puntos semanal (lun–dom) 20 → 20 PG · 50 → 50 PG · 70 → 100 PG (cierra lun 00:00) · Cartón nuevo cada medianoche (hora de Corea)"};
var EVP={ko:"상금: 1등 100 · 2등 50 · 3등 20 PG (퍼즐골드) · 한 주에 한 번 · 일요일 24:00(한국 시간) 마감",en:"Prizes: 1st 100 · 2nd 50 · 3rd 20 PG (Puzzle Gold) · once a week · closes Sun 24:00 (Korea time)",ja:"賞品：1位100・2位50・3位20 PG（パズルゴールド）・週1回・日曜24:00（韓国時間）締切",zhs:"奖品：第1名100 · 第2名50 · 第3名20 PG（Puzzle Gold）· 每周一次 · 周日24:00（韩国时间）截止",zht:"獎品：第1名100 · 第2名50 · 第3名20 PG（Puzzle Gold）· 每週一次 · 週日24:00（韓國時間）截止",es:"Premios: 1.º 100 · 2.º 50 · 3.º 20 PG (Puzzle Gold) · una vez por semana · cierra dom 24:00 (hora de Corea)"};
var PTS={ko:"점",en:"pts",ja:"点",zhs:"分",zht:"分",es:"pts"};
var WPT={t:{ko:"이번 주 점수",en:"This week’s points",ja:"今週のポイント",zhs:"本周积分",zht:"本週積分",es:"Puntos de esta semana"},
 me:{ko:"내 점수",en:"My points",ja:"自分のポイント",zhs:"我的积分",zht:"我的積分",es:"Mis puntos"},
 rk:{ko:"내 순위",en:"My rank",ja:"自分の順位",zhs:"我的排名",zht:"我的排名",es:"Mi puesto"},
 top:{ko:"주간 점수 순위",en:"Weekly points ranking",ja:"週間ポイント順位",zhs:"周积分排名",zht:"週積分排名",es:"Clasificación semanal de puntos"},
 none:{ko:"아직 이번 주 점수가 없어요 — 판을 완성하면 밤 12시에 점수가 들어와요",en:"No points yet this week — finish a board and your points arrive at midnight",ja:"今週のポイントはまだありません — ボードを完成すると夜12時にポイントが入ります",zhs:"本周还没有积分——完成卡片后，积分将在午夜到账",zht:"本週還沒有積分——完成卡片後，積分將在午夜入帳",es:"Aún no hay puntos esta semana: completa un cartón y los puntos llegan a medianoche"},
 close:{ko:"월요일 0시(한국 시간) 마감",en:"Closes Mon 00:00 (Korea time)",ja:"月曜0時（韓国時間）締切",zhs:"周一0点（韩国时间）截止",zht:"週一0點（韓國時間）截止",es:"Cierra lun 00:00 (hora de Corea)"},
 today:{ko:"오늘 점수는 밤 12시(한국 시간)에 더해져요",en:"Today’s points are added at midnight (Korea time)",ja:"今日のポイントは夜12時（韓国時間）に加算されます",zhs:"今日积分在午夜12点（韩国时间）计入",zht:"今日積分在午夜12點（韓國時間）計入",es:"Los puntos de hoy se suman a medianoche (hora de Corea)"},
 last:{ko:"지난주 주간 점수",en:"Last week’s points",ja:"先週の週間ポイント",zhs:"上周积分",zht:"上週積分",es:"Puntos de la semana pasada"}};
var KOEV='<div class="ecard" style="background:#eaf3ff;border:2px solid #3b82f6;font-weight:800;color:#1e3a8a;text-align:center">한국인 판 · 상금 없음 · 순위·별만<div style="font-weight:600;font-size:12.5px;margin-top:4px">해외 판과 같은 이벤트(같은 장소·문제·주제)이고, 기록과 순위는 따로입니다. 1등은 별을 받아요.</div></div>';   // 한국인 판 이벤트 (한국어만)
var TAB="bingo"; try{ if(ls("mpv_ev_tab")==="ev") TAB="ev"; }catch(e){}
function tabsH(){ if(!(E&&B)) return ""; return '<div class="etab">'+[["bingo",TABS.bingo],["ev",TABS.ev]].map(function(t){ return '<button type="button" data-tab="'+t[0]+'" class="'+(TAB===t[0]?"on":"")+'">'+esc(L(t[1]))+(t[0]==="ev"&&E?'<small>'+esc(L(KT[E.kind]||EVT))+'</small>':'')+'</button>'; }).join("")+'</div>'; }
function render(){ if(TAB==="ev"&&E) evPaint(); else if(B) paint(); else if(E) evPaint(); }
function hofH(o){ return o.hof&&o.hof.length?'<div style="margin-top:8px;font-size:13px"><b style="color:#b8860b">'+esc(L(HOF))+'</b> '+o.hof.map(function(x){ return esc(x.nm); }).join(" · ")+'</div>':""; }
function bdPts(rk){ return [10,8,6,5,4,3,3,3,3,3][rk-1]||1; }   // 그날 순위 점수 — 허브 BD_PTS 와 같게
var TX3={
 hint:{ko:"힌트",en:"Hint",ja:"ヒント",zhs:"提示",zht:"提示",es:"Pista"},
 day:{ko:"일째",en:"Day",ja:"日目",zhs:"第几天",zht:"第幾天",es:"Día"},
 nextHint:{ko:"다음 힌트는 매일 12시(한국 시간)",en:"Next hint every day at 12:00 (Korea time)",ja:"次のヒントは毎日12時（韓国時間）",zhs:"每天12点（韩国时间）公开下一条提示",zht:"每天12點（韓國時間）公開下一條提示",es:"Nueva pista cada día a las 12:00 (hora de Corea)"},
 find:{ko:"지도에서 찾기",en:"Search on the map",ja:"地図で探す",zhs:"在地图上寻找",zht:"在地圖上尋找",es:"Buscar en el mapa"},
 tmode:{ko:"보물상자가 있을 것 같은 곳을 서울 지도(구 화면)에서 누르세요",en:"Tap where you think the treasure box is on the Seoul map (district view)",ja:"宝箱がありそうな場所をソウルの地図（区の画面）でタップしてください",zhs:"在首尔地图（区画面）上点击你认为宝箱所在的位置",zht:"在首爾地圖（區畫面）上點擊你認為寶箱所在的位置",es:"Toca en el mapa de Seúl (vista de distrito) donde crees que está el cofre"},
 seoul:{ko:"서울 지도에서 눌러 주세요",en:"Please tap on the Seoul map",ja:"ソウルの地図でタップしてください",zhs:"请在首尔地图上点击",zht:"請在首爾地圖上點擊",es:"Toca en el mapa de Seúl"},
 miss:{ko:"여기는 아니에요. 1분 뒤에 다시 눌러 보세요",en:"Not here. Try again in 1 minute",ja:"ここではありません。1分後にもう一度",zhs:"不在这里，1分钟后再试",zht:"不在這裡，1分鐘後再試",es:"Aquí no. Vuelve a intentarlo en 1 minuto"},
 near:{ko:"가까워요!",en:"Getting close!",ja:"近いです！",zhs:"很接近了！",zht:"很接近了！",es:"¡Te acercas!"},
 got:{ko:"보물상자를 찾았어요!",en:"You found the treasure box!",ja:"宝箱を見つけました！",zhs:"你找到宝箱了！",zht:"你找到寶箱了！",es:"¡Encontraste el cofre!"},
 rank:{ko:"등",en:"place",ja:"位",zhs:"名",zht:"名",es:"puesto"},
 wait:{ko:"다시 누를 수 있을 때까지",en:"You can tap again in",ja:"再挑戦まで",zhs:"可再次点击还需",zht:"可再次點擊還需",es:"Podrás tocar de nuevo en"},
 foundN:{ko:"지금까지 찾은 사람",en:"People who found it so far",ja:"これまでに見つけた人",zhs:"目前找到的人数",zht:"目前找到的人數",es:"Personas que lo han encontrado"},
 answer:{ko:"보물상자 위치",en:"Treasure location",ja:"宝箱の位置",zhs:"宝箱位置",zht:"寶箱位置",es:"Ubicación del cofre"},
 quit:{ko:"그만하기",en:"Stop",ja:"やめる",zhs:"停止",zht:"停止",es:"Salir"},
 sstart:{ko:"도전 시작 (10문제 · 문제당 60초)",en:"Start (10 photos · 60 s each)",ja:"挑戦スタート（10問・1問60秒）",zhs:"开始挑战（10题·每题60秒）",zht:"開始挑戰（10題·每題60秒）",es:"Empezar (10 fotos · 60 s cada una)"},
 sonce:{ko:"한 번만 도전할 수 있어요. 시작하면 끝까지 이어집니다.",en:"You can play only once. Once you start, it runs to the end.",ja:"挑戦は1回だけ。始めたら最後まで続きます。",zhs:"只能挑战一次，一旦开始须进行到结束。",zht:"只能挑戰一次，一旦開始須進行到結束。",es:"Solo puedes jugar una vez; al empezar, sigue hasta el final."},
 smode:{ko:"이 명소의 그림을 지도에서 누르세요",en:"Tap this sight’s picture on the map",ja:"この名所の絵を地図でタップ",zhs:"在地图上点击这个景点的图画",zht:"在地圖上點擊這個景點的圖畫",es:"Toca el dibujo de este lugar en el mapa"},
 skip:{ko:"넘기기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"跳過",es:"Saltar"},
 sdone:{ko:"도전 끝",en:"Finished",ja:"挑戦終了",zhs:"挑战结束",zht:"挑戰結束",es:"Terminado"},
 sres:{ko:"맞힌 수",en:"Correct",ja:"正解数",zhs:"答对",zht:"答對",es:"Aciertos"},
 stime:{ko:"걸린 시간",en:"Time",ja:"かかった時間",zhs:"用时",zht:"用時",es:"Tiempo"},
 topic:{ko:"이번 주 주제",en:"This week’s theme",ja:"今週のテーマ",zhs:"本周主题",zht:"本週主題",es:"Tema de la semana"},
 pick:{ko:"사진 고르기",en:"Choose a photo",ja:"写真を選ぶ",zhs:"选择照片",zht:"選擇照片",es:"Elegir foto"},
 sns:{ko:"회사가 이 사진을 SNS에서 소개하는 데 동의합니다 (직접 찍은 사진입니다)",en:"I agree the company may feature this photo on social media (I took this photo myself)",ja:"会社がこの写真をSNSで紹介することに同意します（自分で撮った写真です）",zhs:"我同意公司在社交媒体上介绍这张照片（照片为本人拍摄）",zht:"我同意公司在社群媒體上介紹這張照片（照片為本人拍攝）",es:"Acepto que la empresa muestre esta foto en redes sociales (la hice yo)"},
 send:{ko:"사진 올리기",en:"Upload photo",ja:"写真を投稿",zhs:"上传照片",zht:"上傳照片",es:"Subir foto"},
 sent:{ko:"올린 사진 (다시 올리면 바뀝니다)",en:"Your photo (uploading again replaces it)",ja:"投稿した写真（再投稿で差し替え）",zhs:"已上传的照片（再次上传会替换）",zht:"已上傳的照片（再次上傳會替換）",es:"Tu foto (si subes otra, se reemplaza)"},
 needsns:{ko:"SNS 소개 동의에 체크해 주세요",en:"Please tick the social media consent",ja:"SNS紹介への同意にチェックしてください",zhs:"请勾选社交媒体介绍同意",zht:"請勾選社群媒體介紹同意",es:"Marca el consentimiento para redes sociales"},
 lastEv:{ko:"지난 이벤트 결과",en:"Last event’s results",ja:"前回イベントの結果",zhs:"上次活动结果",zht:"上次活動結果",es:"Resultados del último evento"}
};
var E=null;   // 3종 화면 자료
function evTitle(k){ return L(k?(KT[k]||EVT):EVT); }
function setHead(k){ var h=document.querySelector("#evBox .ehd h1"), s=document.getElementById("evWk"); if(h) h.textContent=evTitle(k); if(s) s.textContent=k?L(k==="bingo"&&B&&(B.daily||B.ko)?DSUB:T.sub):""; }
function evClosed(last){ var e=document.getElementById("evBody"); if(!e) return; setHead("");
  var h='<div class="ecard" style="font-weight:800;color:#555">'+esc(L(NEXT))+'</div><div class="ecard">'+esc(L(T.pgsum))+'<button type="button" class="ebtn g" data-ev="pg">'+esc(L(T.mypg))+'</button><button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>';
  if(last&&last.res&&last.res.length){ var C=["#e0a100","#9aa4b0","#c47a3c"];
    h+='<div class="ecard"><b>'+esc(L(TX3.lastEv))+'</b> <span style="color:#888;font-size:12px">'+esc(last.wk||"")+'</span>'+last.res.slice(0,3).map(function(r,i){ return '<div class="erk"><div class="n" style="background:'+(C[i]||"#bbb")+'">'+r.rk+'</div><div><b>'+esc(r.nm)+'</b>'+(r.el!=null?' <span style="color:#888;font-size:12px">'+elTxt(r.el)+'</span>':'')+'</div><div class="pg">'+(r.pg?r.pg+' PG':'')+'</div></div>'; }).join("")+'</div>'; }
  e.innerHTML=h; wire(e); }
function wire(e){ [].forEach.call(e.querySelectorAll("[data-ev]"),function(x){ x.onclick=function(){ var a=x.dataset.ev;
  if(a==="pg"||a==="signin") signIn(); else if(a==="rules") showRules(!!(cur()&&cur().open&&cur().me&&!cur().me.agreed));
  else if(a==="find") treasureMode(); else if(a==="sstart") spotStart(); else if(a==="ppick") document.getElementById("evPf").click(); else if(a==="psend") photoSend(); else if(a==="share") shareResult(); }; });
  [].forEach.call(e.querySelectorAll("[data-tab]"),function(x){ x.onclick=function(){ TAB=x.dataset.tab; ls("mpv_ev_tab",TAB); render(); var b=box(); if(b) b.scrollTop=0; }; }); }
function cur(){ if(E&&B) return TAB==="ev"?E:B; return E||B; }   // 두 칸이 다 열려 있으면 고른 탭
function needIn(o){ if(!o.me) return '<div class="ecard"><button type="button" class="ebtn" data-ev="signin">'+esc(L(T.signin))+'</button></div>'; if(o.me.grad) return '<div class="ecard" style="color:#7a3cff;font-weight:700">'+esc(L(T.grad))+'</div>'; if(!o.me.agreed) return '<div class="ecard"><button type="button" class="ebtn" data-ev="rules">'+esc(L(T.agree))+'</button></div>'; return ""; }
function evPaint(){ var e=document.getElementById("evBody"); if(!e||!E) return; var k=E.kind, me=E.me; setHead(k);
  var h=tabsH()+(E.ko?KOEV:'<div class="ecard" style="background:#fff1e4;border:2px solid #ff7a1a;font-size:13px;font-weight:800;color:#8a3d00">'+esc(L(EVP))+'</div>');
  h+='<div class="ecard" style="font-size:13px"><b style="color:#ff7a1a">'+esc(L(RKL))+'</b> · '+esc(L(RANKHOW[k]||{en:""}))+'</div><div class="ecard ewk"><span>'+esc(L(T.ends))+'</span><span>'+leftTxt(E.end)+'</span></div>'+needIn(E);
  var ok=me&&me.agreed;
  if(k==="treasure"){
    h+='<div class="ecard"><b>'+esc(L(TX3.hint))+'</b>'+(E.hints||[]).map(function(x){ return '<div style="margin-top:6px"><b style="color:#ff7a1a">'+(lg()==="en"||lg()==="es"?esc(L(TX3.day))+' '+(x.d+1):(x.d+1)+esc(L(TX3.day)))+'</b> · '+esc(x.t)+'</div>'; }).join("")+'<div style="color:#888;font-size:12px;margin-top:6px">'+esc(L(TX3.nextHint))+'</div></div>';
    if(E.reveal) h+='<div class="ecard"><b>'+esc(L(TX3.answer))+'</b>: '+esc(E.reveal.place||"")+'</div>';
    if(ok){ if(me.ft) h+='<div class="ecard" style="font-weight:800;color:#27a745">'+esc(L(TX3.got))+(me.rank?' · '+(lg()==="en"?"#"+me.rank+" "+L(TX3.rank):me.rank+L(TX3.rank)):'')+'</div>';
      else h+='<div class="ecard">'+(me.lock?'<div style="color:#e8322f;font-weight:700">'+esc(L(TX3.wait))+' '+Math.max(0,Math.ceil((me.lock-Date.now())/1000))+'s</div>':'')+'<button type="button" class="ebtn" data-ev="find">'+esc(L(TX3.find))+'</button></div>'; }
    h+='<div class="ecard" style="font-size:13px">'+esc(L(TX3.foundN))+': <b>'+(E.found||0)+'</b></div>';
  }
  if(k==="spot"){
    if(ok){ if(me.done) h+='<div class="ecard"><b>'+esc(L(TX3.sdone))+'</b><div class="est" style="margin:8px 0 0"><div><b>'+me.ok+' / '+(E.total||10)+'</b>'+esc(L(TX3.sres))+'</div><div><b>'+me.t+'s</b>'+esc(L(TX3.stime))+'</div></div></div>';
      else h+='<div class="ecard">'+esc(L(TX3.sonce))+'<button type="button" class="ebtn" data-ev="sstart">'+esc(L(TX3.sstart))+'</button></div>'; }
  }
  if(k==="photo"){
    h+='<div class="ecard"><b>'+esc(L(TX3.topic))+'</b><div style="font-size:18px;font-weight:800;margin-top:4px">'+esc(E.topic||"")+'</div></div>';
    if(ok){ h+='<div class="ecard">'+(me.photo?'<div style="font-size:12px;color:#888">'+esc(L(TX3.sent))+'</div><img src="'+me.photo.img+'" alt="" style="width:100%;border-radius:10px;margin:6px 0">':'')
      +'<input type="file" id="evPf" accept="image/*" style="display:none"><div id="evPv"></div><label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;margin-top:8px"><input type="checkbox" id="evSns" style="margin-top:3px">'+esc(L(TX3.sns))+'</label>'
      +'<button type="button" class="ebtn g" data-ev="ppick">'+esc(L(TX3.pick))+'</button><button type="button" class="ebtn" data-ev="psend" id="evPs" disabled>'+esc(L(TX3.send))+'</button><div id="evPm" style="font-size:13px;color:#e8322f;margin-top:6px"></div></div>'; }
  }
  if(ok) h+='<div class="ecard"><button type="button" class="ebtn" data-ev="share" style="background:#7a3cff">'+esc(L(SHX.btn))+'</button></div>';
  if(k!=="photo") h+=rankCard(E,RANKHOW[k]); else if(E.hof&&E.hof.length) h+='<div class="ecard">'+hofH(E)+'</div>';   // 지금 순위 (사진은 회사가 고르므로 명예의 전당만)
  h+='<div class="ecard">'+(E.ko?'':esc(L(T.pgsum))+'<button type="button" class="ebtn g" data-ev="pg">'+esc(L(T.mypg))+'</button>')+'<button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>';
  e.innerHTML=h; wire(e);
  var pf=document.getElementById("evPf"); if(pf) pf.onchange=function(){ photoPrep(pf.files&&pf.files[0]); };
  if(k==="treasure"&&me&&me.lock&&me.lock>Date.now()) setTimeout(function(){ if(box()&&E&&E.kind==="treasure"&&cur()===E) evPaint(); },1000); }
// 보물상자 — 지도 누르기
var MODE=null;
function modeBar(html){ var o=document.getElementById("evMode"); if(!html){ if(o) o.remove(); return null; } if(!o){ o=document.createElement("div"); o.id="evMode"; o.style.cssText="position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:2147483002;width:min(94vw,480px);background:#fff8f0;color:#2b2b2b;border:2px solid #ff7a1a;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.25);padding:10px 12px;font:600 14px/1.45 'Segoe UI','Malgun Gothic',system-ui,sans-serif"; document.body.appendChild(o); } o.innerHTML=html; return o; }
function modeEnd(){ MODE=null; modeBar(null); }
function treasureMode(){ close(); MODE="treasure"; try{ if(window.VIEW!=="seoulall") viewSet("seoulall"); }catch(e){}
  var m=document.getElementById("map"); if(m) try{ m.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){}
  var o=modeBar('<div>'+esc(L(TX3.tmode))+'</div><div id="evMm" style="color:#e8322f;font-weight:700"></div><button type="button" id="evMq" style="margin-top:6px;border:1px solid #ddd;background:#fff;border-radius:999px;padding:5px 12px;font-weight:800;cursor:pointer">'+esc(L(TX3.quit))+'</button>');
  o.querySelector("#evMq").onclick=function(){ modeEnd(); open(); }; }
document.addEventListener("click",function(ev){ if(MODE!=="treasure") return; var m=document.getElementById("map"); if(!m||!m.contains(ev.target)) return; ev.preventDefault(); ev.stopPropagation();
  var mm=document.getElementById("evMm");
  if(window.VIEW!=="seoulall"){ if(mm) mm.textContent=L(TX3.seoul); return; }
  var im=document.getElementById("mapimg"), r=im.getBoundingClientRect(), fx=(ev.clientX-r.left)/r.width, fy=(ev.clientY-r.top)/r.height, G=(window.CITY&&CITY.seoulall&&CITY.seoulall.geo)||null;
  if(!Array.isArray(G)) return; var lat=G[0]-(fy-.5)*2*G[2], lng=G[1]+(fx-.5)*2*G[2]*G[4]/G[3];
  post("/npg/ev/treasure/try",{sess:sess(),lat:lat,lng:lng,l:lg()}).then(function(j){ if(!j) return;
    if(j.found){ modeEnd(); toast(L(TX3.got),"#27a745"); setTimeout(open,1200); return; }
    if(j.err==="lock"||j.lock){ if(mm) mm.textContent=(j.far==="near"?L(TX3.near)+" ":"")+L(TX3.miss); var t=setInterval(function(){ var s=Math.ceil((j.lock-Date.now())/1000); if(!document.getElementById("evMm")){ clearInterval(t); return; } if(s<=0){ clearInterval(t); document.getElementById("evMm").textContent=""; return; } document.getElementById("evMm").textContent=(j.far==="near"?L(TX3.near)+" ":"")+L(TX3.wait)+" "+s+"s"; },1000); }
  }).catch(function(){ if(mm) mm.textContent=L(T.err); }); },true);
// 명소 맞히기 — 사진 보며 지도 그림 누르기
var SQ=null, ST=null;
function spotStart(){ post("/npg/ev/spot/start",{sess:sess(),l:lg()}).then(function(j){ if(!j||!j.ok){ alert(L(T.err)); return; } if(j.done){ load(); return; } close(); MODE="spot"; spotShow(j.q); try{ if(window.VIEW!=="seoulall") viewSet("seoulall"); }catch(e){} }).catch(function(){ alert(L(T.err)); }); }
function spotShow(q){ SQ=q; if(!q){ modeEnd(); open(); return; } clearInterval(ST);
  var o=modeBar('<div style="display:flex;gap:10px;align-items:center"><img src="'+q.img+'" alt="" style="width:110px;height:84px;object-fit:contain;background:#fff;border-radius:8px;flex:0 0 auto"><div style="flex:1"><b>'+(q.i+1)+' / '+q.total+'</b> · <span id="evSt" style="color:#e8322f;font-weight:900"></span><div style="font-size:13px">'+esc(L(TX3.smode))+(q.gu?' · '+esc(L({ko:q.gu.ko||"",en:q.gu.en||"",ja:q.gu.ja||"",zhs:q.gu.zhs||"",zht:q.gu.zht||"",es:q.gu.en||""})):'')+'</div><button type="button" id="evSk" style="margin-top:4px;border:1px solid #ddd;background:#fff;border-radius:999px;padding:4px 12px;font-weight:800;cursor:pointer">'+esc(L(TX3.skip))+'</button></div></div>');
  var end=Date.now()+q.left; q._end=end; var tick=function(){ var s=Math.max(0,Math.ceil((end-Date.now())/1000)), el=document.getElementById("evSt"); if(el) el.textContent=s+"s"; if(s<=0){ clearInterval(ST); spotAns("",1); } }; tick(); ST=setInterval(tick,500);
  o.querySelector("#evSk").onclick=function(){ spotAns("",1); }; }
function spotAns(k,skip){ if(MODE!=="spot") return; clearInterval(ST); post("/npg/ev/spot/ans",{sess:sess(),k:k,skip:skip?1:0,l:lg()}).then(function(j){ if(!j||!j.ok){ modeEnd(); open(); return; }
  if(!skip) toast(j.right?L(T.right):L(T.wrong).split(" — ")[0],j.right?"#27a745":"#e8322f");
  if(j.done){ modeEnd(); setTimeout(open,900); return; } setTimeout(function(){ spotShow(j.q); },400); }).catch(function(){ modeEnd(); open(); }); }
function spotTap(k){ if(MODE!=="spot"||!k||String(k).indexOf("__")===0) return false; k=String(k);   // 명소 맞히기 중 지도 그림 누름 = 답
  var c=null; if(window.VIEW==="kr"){ try{ c=cityFor(k); }catch(e){} }   // 전국 지도의 지역 그림(해운대·설악산·한라산 등)은 답이 아니라 그 지역 약도로 들어가기 (10-27 전국 확대)
  if(c){ try{ clearTimeout(_tapT); }catch(e){} try{ viewSet(c); }catch(e){} return true; }
  spotAns(k,0); return true; }
var _hc3=window.hitClick; window.hitClick=function(k){ if(spotTap(k)) return; if(MODE==="treasure") return; return _hc3.apply(this,arguments); };
window.addEventListener("load",function(){ var h=window.hitClick; window.hitClick=function(k){ if(spotTap(k)) return; return h.apply(this,arguments); }; });   // 나중에 붙은 단추(김포공항 그림 = 공항 화면)보다 먼저 답으로
// 이번 주 사진 — 줄여서 올리기
var PIMG="";
function photoPrep(f){ var m=document.getElementById("evPm"); if(!f) return; var rd=new FileReader(); rd.onload=function(){ var im=new Image(); im.onload=function(){ var W0=im.naturalWidth, H0=im.naturalHeight, k=Math.min(1,1280/Math.max(W0,H0)), c=document.createElement("canvas"); c.width=Math.round(W0*k); c.height=Math.round(H0*k); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    var q=.82, d=c.toDataURL("image/jpeg",q); while(d.length>1300000&&q>.4){ q-=.1; d=c.toDataURL("image/jpeg",q); } PIMG=d;   /* 위치 등 사진 속 정보(EXIF)는 다시 그리면서 빠진다 */
    var pv=document.getElementById("evPv"); if(pv) pv.innerHTML='<img src="'+d+'" alt="" style="width:100%;border-radius:10px;margin-top:6px">'; var b=document.getElementById("evPs"); if(b) b.disabled=false; if(m) m.textContent=""; }; im.src=rd.result; }; rd.readAsDataURL(f); }
function photoSend(){ var m=document.getElementById("evPm"), sns=document.getElementById("evSns"); if(!PIMG) return; if(!sns||!sns.checked){ if(m) m.textContent=L(TX3.needsns); return; }
  var b=document.getElementById("evPs"); if(b) b.disabled=true; post("/npg/ev/photo/up",{sess:sess(),img:PIMG,sns:1,l:lg()}).then(function(j){ if(j&&j.ok){ PIMG=""; toast(L({ko:"올렸어요",en:"Uploaded",ja:"投稿しました",zhs:"已上传",zht:"已上傳",es:"Subida"}),"#27a745"); load(); } else { if(m) m.textContent=L(T.err); if(b) b.disabled=false; } }).catch(function(){ if(m) m.textContent=L(T.err); if(b) b.disabled=false; }); }

// ── 이벤트 결과 공유 카드 (사장님 10-26) — 1080×1080 그림을 코드로 그려 폰 공유창·카카오톡 카드로. 그림 = 이벤트 전광판 바탕·이벤트 섬(새로 안 그림), 글자 = 코드
//   개인정보 없음: 이름은 가린 표시(M***a)만, 이메일 등은 안 넣는다
var SHX={
 btn:{ko:"결과 공유",en:"Share my result",ja:"結果をシェア",zhs:"分享结果",zht:"分享結果",es:"Compartir resultado"},
 beat:{ko:"나를 이길 수 있어요?",en:"Can you beat me?",ja:"私に勝てる？",zhs:"你能赢我吗？",zht:"你能贏我嗎？",es:"¿Puedes superarme?"},
 lines:{ko:"줄 빙고!",en:"lines!",ja:"列ビンゴ！",zhs:"条宾果线！",zht:"條賓果線！",es:"líneas!"},
 found:{ko:"보물상자를 찾았어요!",en:"I found the treasure!",ja:"宝箱を見つけた！",zhs:"我找到宝箱了！",zht:"我找到寶箱了！",es:"¡Encontré el tesoro!"},
 hunt:{ko:"보물상자를 찾는 중",en:"Hunting the treasure",ja:"宝箱を探し中",zhs:"正在寻找宝箱",zht:"正在尋找寶箱",es:"Buscando el tesoro"},
 spot:{ko:"명소를 맞혔어요",en:"sights spotted",ja:"名所を正解",zhs:"个景点答对",zht:"個景點答對",es:"lugares acertados"},
 photo:{ko:"사진을 냈어요!",en:"I entered my photo!",ja:"写真を投稿したよ！",zhs:"我投稿了照片！",zht:"我投稿了照片！",es:"¡Ya envié mi foto!"},
 kakao:{ko:"카카오톡으로",en:"KakaoTalk",ja:"カカオトークで",zhs:"KakaoTalk",zht:"KakaoTalk",es:"KakaoTalk"},
 other:{ko:"다른 앱으로 공유",en:"Share to other apps",ja:"他のアプリでシェア",zhs:"分享到其他应用",zht:"分享到其他應用程式",es:"Compartir en otras apps"},
 save:{ko:"그림 저장",en:"Save image",ja:"画像を保存",zhs:"保存图片",zht:"儲存圖片",es:"Guardar imagen"},
 install:{ko:"앱 설치",en:"Install app",ja:"アプリを入れる",zhs:"安装应用",zht:"安裝應用",es:"Instalar app"}
};
function shLine(){ var c=cur(); if(!c||!c.open||!c.me) return null; var me=c.me, k=c.kind||"bingo", t=L(KT[k]||EVT), l=lg(), rk=c.myRank?"  #"+c.myRank:"";
  if(k==="bingo"&&c.daily&&c.day) t+=" "+c.day.slice(5).replace("-","/");   // 매일 빙고 = 그날 날짜
  if(k==="bingo"&&me.done) return [t, L(RNK.all)+" · "+elTxt(me.done-(me.f0||me.done))+rk];   // 판 완성 + 걸린 시간 (10-27)
  if(k==="bingo") return [t, (me.s||[]).length+"/24 · "+L(T.stamps)];
  if(k==="treasure") return [t, me.ft?L(SHX.found)+(me.rank?"  #"+me.rank:""):L(SHX.hunt)];
  if(k==="spot") return [t, (me.ok||0)+"/"+(c.total||10)+" "+L(SHX.spot)+rk];
  if(k==="photo") return [t, L(SHX.photo)];
  return null; }
function shImg(src){ return new Promise(function(ok){ var i=new Image(); i.onload=function(){ ok(i); }; i.onerror=function(){ ok(null); }; i.src=src; }); }
function shName(){ var s=sess(); if(!s) return Promise.resolve(""); return post("/npg/me",{sess:s}).then(function(j){ var nm=j&&j.ok&&j.me?String(j.me.name||"").trim():""; if(!nm) return ""; var a=Array.from(nm); return a.length<=1?a[0]+"***":a[0]+"***"+a[a.length-1]; }).catch(function(){ return ""; }); }
function shDraw(){ var ln=shLine(); if(!ln) return Promise.resolve(null);
  return Promise.all([shImg("img/kr_extra/event_bb.jpg?v=1026"),shImg("img/kr_extra/event_isle.webp?v=1026"),shName()]).then(function(a){ var bg=a[0], isle=a[1], nm=a[2], S=1080, c=document.createElement("canvas"); c.width=S; c.height=S; var x=c.getContext("2d");
    if(bg){ var k=Math.max(S/bg.width,S/bg.height), w=bg.width*k, h=bg.height*k; x.drawImage(bg,(S-w)/2,(S-h)/2,w,h); } else { x.fillStyle="#1b1030"; x.fillRect(0,0,S,S); }
    var g=x.createLinearGradient(0,0,0,S); g.addColorStop(0,"rgba(10,6,24,.82)"); g.addColorStop(.55,"rgba(10,6,24,.55)"); g.addColorStop(1,"rgba(10,6,24,.88)"); x.fillStyle=g; x.fillRect(0,0,S,S);
    if(isle){ var iw=330, ih=isle.height*iw/isle.width; x.drawImage(isle,S-iw-40,S-ih-110,iw,ih); }
    var F="'Arial Black','Segoe UI','Malgun Gothic','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif";
    var fit=function(t,max,size){ x.font="900 "+size+"px "+F; while(x.measureText(t).width>max&&size>30){ size-=4; x.font="900 "+size+"px "+F; } return size; };
    x.textAlign="left"; x.textBaseline="alphabetic";
    x.fillStyle="#ffd6f4"; x.font="800 40px "+F; x.fillText("Money Puzzle · Tour for Korea",70,120);
    x.shadowColor="#ff4fd8"; x.shadowBlur=30; x.fillStyle="#ffffff"; fit(ln[0],940,86); x.fillText(ln[0],70,300);
    x.shadowColor="#ffb000"; x.shadowBlur=26; x.fillStyle="#ffe28a"; fit(ln[1],940,104); x.fillText(ln[1],70,450);
    x.shadowBlur=0; x.fillStyle="#ffffff"; fit(L(SHX.beat),900,70); x.fillText(L(SHX.beat),70,600);
    if(nm){ x.fillStyle="#c9c2e6"; x.font="700 44px "+F; x.fillText("— "+nm,70,680); }
    x.fillStyle="#39d5ff"; x.font="800 44px "+F; x.fillText("navi.moneypuzzle.co.kr",70,S-70);
    return c; }); }
// 결과 공유 (사장님 10-27) — 그림을 허브(/bshare)에 올려 링크 하나로: 미리보기에 결과 그림이 뜨고, 그 쪽에 「코리아 빙고 같이 풀어요」·「투어앱 설치」 단추
//   카톡(그림+단추 2개) · 왓츠앱 · 라인 · 텔레그램 · 위챗(링크 복사) · 페북 · X · 틱톡·인스타(그림을 폰 공유창으로) · 다른 앱 · 링크 복사 · 그림 저장
var SHY={
 together:{ko:"코리아 빙고 같이 풀어요",en:"Let’s play Korea Bingo together",ja:"コリア・ビンゴ、一緒に解こう",zhs:"一起玩韩国宾果吧",zht:"一起玩韓國賓果吧",es:"¡Juguemos juntos al Bingo de Corea!"},
 play:{ko:"같이 풀기",en:"Play",ja:"一緒に解く",zhs:"一起玩",zht:"一起玩",es:"Jugar"},
 prep:{ko:"공유 링크 만드는 중…",en:"Making your share link…",ja:"共有リンクを作成中…",zhs:"正在生成分享链接…",zht:"正在產生分享連結…",es:"Creando tu enlace…"},
 sms:{ko:"문자",en:"Text message",ja:"SMS",zhs:"短信",zht:"簡訊",es:"SMS"},
 copy:{ko:"링크 복사",en:"Copy link",ja:"リンクをコピー",zhs:"复制链接",zht:"複製連結",es:"Copiar enlace"},
 copied:{ko:"링크를 복사했어요. 붙여 넣어 보내세요.",en:"Link copied — paste it to send.",ja:"リンクをコピーしました。貼り付けて送ってください。",zhs:"链接已复制，粘贴发送即可。",zht:"連結已複製，貼上傳送即可。",es:"Enlace copiado: pégalo para enviarlo."},
 wechat:{ko:"링크를 복사했어요. 위챗에 붙여 넣으세요.",en:"Link copied — paste it into WeChat.",ja:"リンクをコピーしました。WeChatに貼り付けてください。",zhs:"链接已复制，请粘贴到微信。",zht:"連結已複製，請貼到微信。",es:"Enlace copiado: pégalo en WeChat."},
 imgapp:{ko:"그림을 저장했어요. 틱톡·인스타그램에서 올려 주세요.",en:"Image saved — post it on TikTok or Instagram.",ja:"画像を保存しました。TikTok・Instagramで投稿してください。",zhs:"图片已保存，请在抖音/TikTok、Instagram 发布。",zht:"圖片已儲存，請在 TikTok、Instagram 發布。",es:"Imagen guardada: publícala en TikTok o Instagram."},
 join:{ko:"머니퍼즐 투어 이벤트 같이 해요",en:"Join the Money Puzzle Tour event with me",ja:"マネーパズル ツアーのイベント、一緒にやろう",zhs:"一起参加 Money Puzzle 韩国旅游活动吧",zht:"一起參加 Money Puzzle 韓國旅遊活動吧",es:"¡Únete conmigo al evento de Money Puzzle Tour!"}};
var RNK={t:{ko:"지금 순위",en:"Current ranking",ja:"現在の順位",zhs:"当前排名",zht:"目前排名",es:"Clasificación actual"},
 how:{ko:"24칸 다 맞힌 사람 · 걸린 시간 짧은 순",en:"All 24 squares · fastest time first",ja:"24マス全問正解・時間の短い順",zhs:"答对全部24格 · 用时最短优先",zht:"答對全部24格 · 用時最短優先",es:"Las 24 casillas · menor tiempo primero"},
 none:{ko:"아직 판을 다 맞힌 사람이 없어요. 첫 완성자가 되어 보세요!",en:"No one has finished the board yet — be the first!",ja:"まだ全問正解した人はいません。最初の達成者になろう！",zhs:"还没有人全部答对，快来成为第一人！",zht:"還沒有人全部答對，快來成為第一人！",es:"Nadie ha completado el cartón todavía: ¡sé el primero!"},
 none2:{ko:"아직 순위에 오른 사람이 없어요. 첫 번째가 되어 보세요!",en:"No one on the board yet — be the first!",ja:"まだ順位に入った人はいません。最初の一人になろう！",zhs:"还没有人上榜，快来成为第一人！",zht:"還沒有人上榜，快來成為第一人！",es:"Todavía no hay nadie en la clasificación: ¡sé el primero!"},
 all:{ko:"24칸 완성",en:"Full board",ja:"24マス完成",zhs:"全部完成",zht:"全部完成",es:"Cartón completo"},
 me:{ko:"나",en:"Me",ja:"自分",zhs:"我",zht:"我",es:"Yo"},
 play:{ko:"명 참가 중",en:" playing",ja:"人が参加中",zhs:"人参与中",zht:"人參與中",es:" jugando"}};
function elTxt(ms){ var s=Math.max(0,Math.round((ms||0)/1000)), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(x<10?"0":"")+x; }
// 우승 횟수 배지 (사장님 10-27) — 별 1~9 · 큰 별(10) · 작은 태양(100) · 큰 태양(1,000) · 1만 = 명예의 전당. 그림은 img/rank/*.webp (생성기로 뽑음)
var TMX={ko:"걸린 시간",en:"Your time",ja:"経過時間",zhs:"用时",zht:"用時",es:"Tu tiempo"};
var HOF={ko:"명예의 전당",en:"Hall of Fame",ja:"殿堂入り",zhs:"名人堂",zht:"名人堂",es:"Salón de la Fama"}, WINS={ko:"우승",en:"wins",ja:"優勝",zhs:"次冠军",zht:"次冠軍",es:"victorias"};
function winIcons(n){ n=n||0; if(!n) return ""; if(n>=10000) return '<span style="font-size:11px;font-weight:900;color:#b8860b">'+esc(L(HOF))+'</span>';
  var g=function(k,c,px){ var h=""; for(var i=0;i<c;i++) h+='<img src="img/rank/'+k+'.webp" alt="" style="width:'+px+'px;height:'+px+'px;vertical-align:middle;margin-right:1px">'; return h; };
  return '<div style="line-height:1;margin-bottom:2px" title="'+n+' '+esc(L(WINS))+'">'+g("bigsun",Math.floor(n/1000),18)+g("sun",Math.floor(n/100)%10,16)+g("bigstar",Math.floor(n/10)%10,16)+g("star",n%10,12)+'</div>'; }
// 지금 순위 카드 — 빙고·보물상자·명소·주간 점수 모두 같은 모양 (사장님 10-27). 값 = 걸린 시간 · 찾은 시각 · 맞힌 수 · 점수
function rankVal(o,r){ if(r.el!=null) return elTxt(r.el); if(r.ok!=null) return r.ok+"/"+(o.total||10)+" · "+(r.t||0)+"s"; if(r.at) return kst(r.at); if(r.p!=null) return r.p+" "+L(PTS); return ""; }
function rankRows(o,R,dp){ var C=["#e0a100","#9aa4b0","#c47a3c"]; return R.map(function(r,i){ return '<div class="erk"'+(r.me?' style="background:#fff4d6;border-radius:8px"':'')+'><div class="n" style="background:'+(C[i]||"#bbb")+'">'+r.rk+'</div><div>'+winIcons(r.win)+'<b>'+esc(r.nm)+'</b>'+(r.me?' <span style="color:#ff7a1a;font-weight:800">('+esc(L(RNK.me))+')</span>':'')+'</div><div class="pg">'+rankVal(o,r)+(dp?'<div style="font-size:11px;color:#888;font-weight:700;text-align:right">+'+bdPts(r.rk)+' '+esc(L(PTS))+'</div>':'')+'</div></div>'; }).join(""); }
function rankCard(o,how){ var R=o.rank||[], bg=(o.kind||"bingo")==="bingo", dp=bg&&(o.daily||o.ko);   // dp = 매일 빙고 — 그날 받을 점수도 같이
  var h='<div class="ecard"><b>'+esc(L(RNK.t))+'</b> <span style="color:#888;font-size:12px">'+esc(L(bg?RNK.how:(how||{en:""})))+(o.play?' · '+o.play+esc(L(RNK.play)):'')+'</span>';
  if(!R.length) return h+'<div style="color:#888;font-size:13px;margin-top:6px">'+esc(L(bg?RNK.none:RNK.none2))+'</div>'+hofH(o)+'</div>';
  h+=rankRows(o,R,dp);
  if(o.myRank>R.length) h+='<div style="font-size:13px;margin-top:6px">'+esc(L(RNK.me))+': #'+o.myRank+'</div>';
  return h+hofH(o)+'</div>'; }
// 이번 주 점수 카드 (매일 빙고) — 내 점수·기준 20/50/70(실전만)·주간 점수 10등
function wpCard(o){ var w=o.wp; if(!w) return ""; var me=w.me||0;
  var h='<div class="ecard"><b>'+esc(L(WPT.t))+'</b> <span style="color:#888;font-size:12px">'+esc(w.wk?w.wk.slice(5).replace("-","/")+" ~ · ":"")+esc(L(WPT.close))+'</span>';
  h+='<div class="est" style="margin:8px 0 0"><div><b>'+me+' '+esc(L(PTS))+'</b>'+esc(L(WPT.me))+'</div><div><b>'+(w.myRank?"#"+w.myRank:"-")+'</b>'+esc(L(WPT.rk))+'</div></div>';
  if(w.th) h+='<div style="display:flex;gap:6px;margin-top:8px">'+w.th.map(function(t){ var got=me>=t[0]; return '<div style="flex:1;text-align:center;border-radius:10px;padding:6px 4px;font-size:12.5px;font-weight:800;'+(got?'background:#e7f8ec;color:#1d7a35;border:1.5px solid #27a745':'background:#fff8f0;color:#8a5a00;border:1.5px dashed #e0a100')+'">'+t[0]+' '+esc(L(PTS))+'<br>→ '+t[1]+' PG'+(got?' ✓':'')+'</div>'; }).join("")+'</div>';
  h+='<div style="color:#888;font-size:12px;margin-top:6px">'+esc(L(WPT.today))+'</div>';
  h+='<div style="margin-top:8px;font-weight:800">'+esc(L(WPT.top))+'</div>'+(w.top&&w.top.length?rankRows(o,w.top,false):'<div style="color:#888;font-size:13px;margin-top:6px">'+esc(L(WPT.none))+'</div>');
  return h+'</div>'; }
function shareResult(){ shDraw().then(function(c){ if(!c){ alert(L(T.err)); return; }
  var ln=shLine(), cc=cur(), TOG=L(cc&&cc.kind&&cc.kind!=="bingo"?SHY.join:SHY.together), APP="https://navi.moneypuzzle.co.kr/", txt=ln[0]+" · "+ln[1]+" — "+L(SHX.beat)+"\n"+TOG, d=c.toDataURL("image/png"), jp=c.toDataURL("image/jpeg",0.8);
  var BT='width:100%;border:0;border-radius:12px;padding:11px 6px;font-weight:900;font-size:14px;color:#fff;cursor:pointer';
  var btn=function(id,bg,lab,fg){ return '<button type="button" data-sh="'+id+'" style="'+BT+';background:'+bg+(fg?';color:'+fg:'')+'">'+esc(lab)+'</button>'; };
  var s=sheet('<h3>'+esc(L(SHX.btn))+'</h3><img src="'+d+'" alt="" style="width:100%;border-radius:12px;margin:6px 0 8px"><div id="shMsg" style="font-size:13px;color:#888;text-align:center;min-height:18px">'+esc(L(SHY.prep))+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">'
    +btn("kakao","#FEE500","KakaoTalk","#3C1E1E")+btn("sms","#34C759",L(SHY.sms))+btn("wa","#25D366","WhatsApp")+btn("line","#06C755","LINE")+btn("tg","#26A5E4","Telegram")
    +btn("wechat","#07C160","WeChat")+btn("fb","#1877F2","Facebook")+btn("x","#111","X")+btn("tiktok","#111","TikTok")
    +btn("insta","#d62976","Instagram")+btn("more","#ff7a1a",L(SHX.other))+btn("copy","#6b7280",L(SHY.copy))
    +'<a download="money-puzzle-event.png" href="'+d+'" style="'+BT+';display:block;text-align:center;text-decoration:none;background:#fff;color:#2b2b2b;border:1.5px solid #e0d6cc;box-sizing:border-box">'+esc(L(SHX.save))+'</a></div>'
    +'<button type="button" data-sh="x0" style="display:block;width:100%;margin-top:8px;border:0;background:none;font-weight:700;color:#888">'+esc(L(T.x))+'</button>');
  var S={page:APP,img:"",id:""}, msg=function(t){ var m=s.querySelector("#shMsg"); if(m) m.textContent=t||""; };
  post("/bshare",{img:jp,t:ln[0]+" · "+ln[1],d:L(SHX.beat),l:lg()}).then(function(j){ if(j&&j.ok){ S.page=j.page+"?l="+lg(); S.img=j.img; S.id=j.id; } msg(""); }).catch(function(){ msg(""); });
  var go=function(u){ window.open(u,"_blank","noopener"); }, E=encodeURIComponent, cp=function(t,ok){ try{ navigator.clipboard.writeText(t).then(function(){ msg(ok); },function(){ prompt("",t); }); }catch(e){ prompt("",t); } };
  var file=function(){ return new Promise(function(r){ c.toBlob(function(b){ r(new File([b],"money-puzzle-event.png",{type:"image/png"})); },"image/png"); }); };
  [].forEach.call(s.querySelectorAll("[data-sh]"),function(b){ b.onclick=function(){ var k=b.dataset.sh, u=S.page, full=txt+"\n"+u;
    if(k==="x0"){ s.remove(); return; }
    if(k==="sms") location.href="sms:?&body="+E(full);   // 문자 (사장님 10-27)
    else if(k==="wa") go("https://api.whatsapp.com/send?text="+E(full));
    else if(k==="line") go("https://line.me/R/share?text="+E(full));
    else if(k==="tg") go("https://t.me/share/url?url="+E(u)+"&text="+E(txt));
    else if(k==="fb") go("https://www.facebook.com/sharer/sharer.php?u="+E(u));
    else if(k==="x") go("https://twitter.com/intent/tweet?text="+E(txt)+"&url="+E(u));
    else if(k==="wechat") cp(full,L(SHY.wechat));
    else if(k==="copy") cp(full,L(SHY.copied));
    else if(k==="tiktok"||k==="insta"){ file().then(function(f){ if(navigator.canShare&&navigator.canShare({files:[f]})) navigator.share({files:[f],text:full}).catch(function(){}); else { var a=document.createElement("a"); a.href=d; a.download="money-puzzle-event.png"; document.body.appendChild(a); a.click(); a.remove(); msg(L(SHY.imgapp)); } }); }
    else if(k==="more"){ if(navigator.share) navigator.share({title:"Money Puzzle · Korea Bingo",text:txt,url:u}).catch(function(){}); else cp(full,L(SHY.copied)); }
    else if(k==="kakao"){ try{ var K=window.Kakao; if(!K) throw 0; if(!K.isInitialized()) K.init("90a47ca48c2a967dd4d14b3b48de2e3b");
        var au=APP+(S.id?"?bs="+S.id+"&lang="+lg():""), iu=APP+"?install=1&lang="+lg();
        var send=function(im){ K.Share.sendDefault({objectType:"feed",content:{title:ln[0]+" · "+ln[1],description:TOG,imageUrl:im,imageWidth:1080,imageHeight:1080,link:{webUrl:au,mobileWebUrl:au}},buttons:[{title:L(SHY.play),link:{webUrl:au,mobileWebUrl:au}},{title:L(SHX.install),link:{webUrl:iu,mobileWebUrl:iu}}]}); };
        if(S.img) send(S.img); else file().then(function(f){ return K.Share.uploadImage({file:[f]}); }).then(function(r){ send(r.infos.original.url); }).catch(function(){ cp(full,L(SHY.copied)); });
      }catch(e){ cp(full,L(SHY.copied)); } }
  }; });
}); }
// 공유 링크로 들어온 사람 (?bs=<id>) — 지도보다 빙고(이벤트 창)를 바로 연다 (사장님 10-27 「같이 풀어요 누르면 빙고가 먼저」)
(function(){ if(!/[?&]bs=[0-9a-f]{16}/.test(location.search)) return;
  var go=function(){ try{ open(); }catch(e){} };
  if(document.readyState==="complete") setTimeout(go,300); else window.addEventListener("load",function(){ setTimeout(go,300); }); })();
window.evShareCard=shDraw;

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
 +"#evBox .etab{display:flex;gap:6px;margin:12px 14px 0;position:sticky;top:58px;z-index:2}#evBox .etab button{flex:1;border:2px solid #ff7a1a;background:#fff;color:#ff7a1a;border-radius:14px;padding:8px 6px;font-weight:900;font-size:14px;cursor:pointer;line-height:1.2;font-family:inherit}#evBox .etab button small{display:block;font-size:11px;font-weight:700;opacity:.85}#evBox .etab button.on{background:#ff7a1a;color:#fff}"
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
 +"#evBB .ebt{position:absolute;left:4%;top:8%;width:92%;height:84%;container-type:size;display:flex;align-items:center;justify-content:center;text-align:center}"
 +"#evBB .ebt b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Arial Black','Segoe UI',Impact,sans-serif;font-weight:900;line-height:1.05;white-space:pre-line;color:#fff;letter-spacing:.02em;-webkit-text-stroke:.05em rgba(30,0,50,.9);paint-order:stroke fill;"
 +"text-shadow:0 0 .06em #fff,0 0 .18em #ff4fd8,0 0 .4em #ff4fd8,0 0 .7em #39d5ff;opacity:0;transform:scale(.85);transition:opacity .45s,transform .45s}"
 +"#evBB .ebt b.on{opacity:1;transform:scale(1)}#evBB .ebt b.g{color:#ffe28a;text-shadow:0 0 .06em #fff,0 0 .2em #ffb000,0 0 .5em #ff7a1a}"
 +"#evBB .ebsh{position:absolute;top:-20%;bottom:-20%;width:16%;left:-30%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-18deg);animation:xwShine 5s ease-in-out infinite}"
 +"@media (prefers-reduced-motion:reduce){#evBB .ebg,#evBB .ebsh{animation:none}}";
document.head.appendChild(bbcss);
var BBT_OPEN=[["EVENT OPEN",""],["KOREA\nBINGO",""],["Win Puzzle Gold\n100 · 50 · 20","g"],["Every week",""]], BBT_CLOSE=[["Next event\ncoming soon",""]];
var bb=null, bbI=0;
function bbCurve(k){ var t,i,n=20,p=[]; for(i=0;i<=n;i++){ t=i/n; p.push((t*100).toFixed(2)+"% "+(k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); } for(i=n;i>=0;i--){ t=i/n; p.push((t*100).toFixed(2)+"% "+(100-k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); } return "polygon("+p.join(",")+")"; }
function bbMk(){ var mz=document.getElementById("mz"); if(!mz||document.getElementById("evBB")) return;
  bb=document.createElement("div"); bb.id="evBB"; bb.className="xbb"; bb.setAttribute("role","button"); bb.setAttribute("aria-label","Event"); bb.tabIndex=0;
  bb.style.cssText="left:63.6%;top:83.6%;width:18%";   /* 남해 이벤트 섬 오른쪽 빈 바다 — 서해 전광판(폭 18%)과 같은 크기 */
  bb.innerHTML='<i class="xp" style="left:24%"></i><i class="xp" style="left:70.5%"></i><i class="xb" style="left:20.2%"></i><i class="xb" style="left:66.7%"></i>'
    +'<div class="xf" style="clip-path:'+bbCurve(9)+'"><div class="xs" style="clip-path:'+bbCurve(8)+'"><div class="ebg"></div><div class="ebt"></div><i class="ebsh"></i><div class="xg"></div></div></div>';
  mz.appendChild(bb); bb.style.display="";
  var go=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } open(); };
  bb.addEventListener("click",go,false); bb.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") go(e); },false);
  ["pointerdown","mousedown","touchstart"].forEach(function(ev){ bb.addEventListener(ev,function(e){ e.stopPropagation(); },false); });
  bbPaint(); }
function bbPaint(){ if(!bb) return; var EVL2=EVKIND?[["EVENT OPEN",""],[BBK[EVKIND]||"EVENT",""],["Win Puzzle Gold\n100 · 50 · 20","g"]]:[];
  var L2=OPEN?(KOF?[["KOREA BINGO",""],["한국인 판",""],["매일 새 문제","g"]].concat(EVKIND?[[BBK[EVKIND]||"EVENT",""],["한국인 판",""]]:[]):TESTF?[["TEST BINGO",""],["No prizes\nTest only","g"],["New questions\nevery day",""]].concat(EVL2):LIVEF?[["EVENT OPEN",""],["DAILY\nKOREA BINGO",""],["Weekly points\n→ Puzzle Gold","g"]].concat(EVKIND?EVL2.slice(1):[]):[["EVENT OPEN",""],[BBK[KIND]||"EVENT",""],["Win Puzzle Gold\n100 · 50 · 20","g"]]):BBT_CLOSE, t=bb.querySelector(".ebt");
  t.innerHTML=L2.map(function(x,i){ var ls=x[0].split("\n"), w=Math.max.apply(null,ls.map(function(q){ return q.length; })), fs="min("+(92/(w*0.68)).toFixed(1)+"cqw,"+(86/(ls.length*1.08)).toFixed(1)+"cqh)"; return '<b class="'+x[1]+'" style="font-size:'+fs+'">'+esc(x[0])+'</b>'; }).join("");
  bbI=0; bbStep(); }
function bbStep(){ if(!bb) return; var bs=bb.querySelectorAll(".ebt b"); [].forEach.call(bs,function(b,i){ b.classList.toggle("on",i===bbI%bs.length); }); bbI++; }
setInterval(function(){ try{ if(bb&&typeof VIEW==="string"&&VIEW==="kr"&&!document.hidden) bbStep(); }catch(e){} },2300);
// ── 섬 ──
var isle=null, OPEN=false;
var TESTF=false, KOF=false, LIVEF=false, EVKIND="";   // 시험 빙고 · 한국인 판(한국어 + 한국 IP) · 매일 빙고 실전 · 이번 주 이벤트 종류 (10-27)
function sign(){ try{ bbPaint(); }catch(e){} if(!isle) return; var s=isle.querySelector(".evS"); s.className="evS "+(OPEN?"on":"off"); s.textContent=OPEN?(KOF?"Korea Bingo":TESTF&&!EVKIND?"Test Bingo":"Event Open"):"Event Close"; fit(); }
function fit(){ if(!isle) return; var s=isle.querySelector(".evS"), w=isle.clientWidth; if(w) s.style.fontSize=(w*0.037)+"px";   /* 간판 폭(섬의 21.5%)에 맞춤 — 지도를 키우면 같이 커진다 */ }
function mk(){ var mz=document.getElementById("mz"); if(!mz||document.getElementById("evIsle")) return;
  isle=document.createElement("div"); isle.id="evIsle"; isle.setAttribute("role","button"); isle.tabIndex=0; isle.setAttribute("aria-label","Event");
  isle.innerHTML='<img src="img/kr_extra/event_isle.webp?v=1026" alt=""><div class="evS off">Event Close</div>'; mz.appendChild(isle);
  var go=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } open(); };
  isle.addEventListener("click",go,false); isle.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") go(e); },false);
  ["pointerdown","mousedown","touchstart"].forEach(function(ev){ isle.addEventListener(ev,function(e){ e.stopPropagation(); },false); });
  try{ new ResizeObserver(fit).observe(isle); }catch(e){ window.addEventListener("resize",fit); }
  sign(); status(); }
function status(){ fetch(H+"/npg/event",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(!j) return;
  var kr=!!j.kr&&lg()==="ko";   // 한국인(한국어 + 한국 IP)에겐 한국인 판만, 아니면 해외 판만 (서로 안 보인다)
  EVKIND=j.ev||""; KOF=kr&&!!j.ko; OPEN=kr?(KOF||!!EVKIND):!!j.open; TESTF=!kr&&!!j.test; LIVEF=!kr&&!!j.live; KIND=OPEN?(kr?(KOF?"bingo":EVKIND):(j.kind||"bingo")):""; sign(); }).catch(function(){}); }
setInterval(status,10*60000);
// ── 이벤트(빙고) 화면 ──
var B=null;   // 판 자료
function sess(){ return ls("mpv_pg_sess")||""; }
function box(){ return document.getElementById("evBox"); }
function close(){ var b=box(); if(b) b.remove(); var s=document.getElementById("evSheet"); if(s) s.remove(); document.documentElement.style.overflow=""; try{ window.mpPaid&&mpPaid.end(); }catch(e){} }
function kst(ms){ var d=new Date(ms+9*3600e3); return d.toISOString().slice(5,10).replace("-","/")+" "+d.toISOString().slice(11,16); }
function leftTxt(end){ var s=Math.max(0,end-Date.now()), d=Math.floor(s/864e5), h=Math.floor(s%864e5/36e5); return d+"d "+h+"h"; }
function open(){ close(); var b=document.createElement("div"); b.id="evBox"; b.innerHTML='<div class="ein"><div class="ehd"><div class="elogo">EV</div><div><h1>'+esc(L(EVT))+'</h1><small id="evWk"></small></div><button type="button" class="ex">✕ '+esc(L(T.x))+'</button></div><div id="evBody"><div class="ecard">'+esc(L(T.load))+'</div></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden"; b.querySelector(".ex").onclick=close;
  try{ ntap("_event","open_area"); }catch(e){}
  load(); }
function load(){ var q={sess:sess(),l:lg()};   // 빙고·이번 주 이벤트를 같이 — 둘 다 열려 있으면 탭 (10-27)
  Promise.all([post("/npg/ev/board",q).catch(function(){ return null; }),post("/npg/bingo/board",q).catch(function(){ return null; })]).then(function(a){ var j=a[0], k=a[1]; if(!(j&&j.ok)&&!(k&&k.ok)) throw 0;
    E=j&&j.ok&&j.open?j:null; B=k&&k.ok&&k.open&&k.cells?k:null;
    if(!E&&!B){ evClosed((j&&j.last)||null); return; }
    if(!E) TAB="bingo"; else if(!B) TAB="ev"; render(); }).catch(function(){ var e=document.getElementById("evBody"); if(e) e.innerHTML='<div class="ecard">'+esc(L(T.err))+'</div>'; }); }
function rulesHtml(){ var c=cur(), kr=c&&c.open?(KRULES[c.kind||"bingo"]||[]):[]; return '<ol>'+RULES.concat(kr).map(function(r){ return '<li'+(r.b?' style="font-weight:800"':'')+'>'+esc(L(r))+'</li>'; }).join("")+'</ol>'; }
function sheet(html){ var s=document.getElementById("evSheet"); if(s) s.remove(); s=document.createElement("div"); s.id="evSheet"; s.innerHTML='<div>'+html+'</div>'; s.onclick=function(e){ if(e.target===s) s.remove(); }; document.body.appendChild(s); return s; }
function showRules(withAgree){ var s=sheet('<h3>'+esc(L(T.rules))+'</h3>'+rulesHtml()+(withAgree?'<button type="button" class="ebtn" id="evAg" style="background:#ff7a1a;color:#fff;border:0;border-radius:12px;padding:12px;width:100%;font-weight:900;font-size:15px">'+esc(L(T.agree))+'</button>':'')+'<button type="button" class="ebtn g" id="evRx" style="margin-top:8px;width:100%;border-radius:12px;padding:11px;background:#fff;border:1.5px solid #e0d6cc;font-weight:800">'+esc(L(T.x))+'</button>');
  s.querySelector("#evRx").onclick=function(){ s.remove(); };
  var a=s.querySelector("#evAg"); if(a) a.onclick=function(){ a.disabled=true; post("/npg/bingo/agree",{sess:sess(),l:lg()}).then(function(j){ if(j&&j.ok){ s.remove(); load(); } else { a.disabled=false; alert(L(T.err)); } }).catch(function(){ a.disabled=false; alert(L(T.err)); }); }; }
function signIn(){   // 퍼즐골드 로그인 창(구글·Apple)을 빙고 화면 위로 — 원래 창(z 1040)이 빙고 화면(z 최상) 뒤에 열려 안 보였다 (10-26 고침)
  var had=sess(); try{ window.mpPG&&mpPG.open(); }catch(e){}
  var pb=document.getElementById("pgBox"); if(pb) pb.style.zIndex="2147483006";
  var t=setInterval(function(){ var p2=document.getElementById("pgBox"), now=sess();
    if(now&&now!==had){ clearInterval(t); try{ window.mpPG&&mpPG.close(); }catch(e){} if(p2) p2.style.zIndex=""; if(box()){ load(); setTimeout(function(){ var c=cur(); if(c&&c.open&&c.me&&!c.me.agreed) showRules(true); },1500); } return; }   // 로그인되면 바로 빙고로 → 규칙 동의
    if(!p2||p2.hidden){ clearInterval(t); if(p2) p2.style.zIndex=""; if(box()) load(); } },500); }
var TST={ko:"테스트 중이라 상금이 없습니다. 문제는 매일 한국 시간 밤 12시에 새로 바뀝니다.",en:"This is a test, so there are no prizes. New questions every day at midnight Korea time.",ja:"テスト中のため賞品はありません。問題は毎日、韓国時間の夜12時に新しくなります。",zhs:"目前为测试，没有奖品。题目每天韩国时间午夜12点更新。",zht:"目前為測試，沒有獎品。題目每天韓國時間午夜12點更新。",es:"Es una prueba, así que no hay premios. Preguntas nuevas cada día a medianoche, hora de Corea."},
    TNX={ko:"새 문제까지",en:"New questions in",ja:"新しい問題まで",zhs:"距新题目",zht:"距新題目",es:"Nuevas preguntas en"};   // 시험 빙고 (10-27)
function paint(){ var e=document.getElementById("evBody"); if(!e||!B) return;
  var h=tabsH(), me=B.me, rh=RANKHOW[B.kind||"bingo"], dl=B.daily||B.ko;
  if(!B.cells||!B.open){ evClosed(null); return; }
  setHead("bingo");
  if(B.ko) h+='<div class="ecard" style="background:#eaf3ff;border:2px solid #3b82f6;font-weight:800;color:#1e3a8a;text-align:center">한국인 판 · 한국어 설정으로 한국에서 접속한 분만 풀 수 있어요. 상금은 없고 순위·점수·별 배지만 있습니다. 사자성어·순우리말 등 어려운 문제가 매일 밤 12시에 바뀝니다.</div>';   // 한국인 판 (10-27, 한국어만)
  else if(B.test) h+='<div class="ecard" style="background:#fff4d6;border:2px dashed #e0a100;font-weight:800;color:#8a5a00;text-align:center">TEST · '+esc(L(TST))+'</div>';
  else if(B.live) h+='<div class="ecard" style="background:#fff1e4;border:2px solid #ff7a1a;font-size:13px;font-weight:800;color:#8a3d00">'+esc(L(LIVEB))+'</div>';   // 매일 빙고 실전 — 상금·기간
  if(rh) h+='<div class="ecard" style="font-size:13px"><b style="color:#ff7a1a">'+esc(L(dl?RKD:RKL))+'</b> · '+esc(L(rh))+'</div>';
  if(!B.test&&!B.ko) h+='<div class="ecard ewk"><span>'+esc(L(dl?DSUB:T.ends))+'</span><span>'+esc(L(T.same))+'</span></div>';
  if(!me) h+='<div class="ecard"><button type="button" class="ebtn" data-ev="signin">'+esc(L(T.signin))+'</button></div>';
  else if(me.grad&&!B.test&&!B.ko) h+='<div class="ecard" style="color:#7a3cff;font-weight:700">'+esc(L(B.daily?T.gradD:T.grad))+'</div>';
  var S=me?me.s:[], X=me?me.x:[];
  h+='<div class="egrid">'+B.cells.map(function(c){ if(c.free) return '<div class="ec free">FREE</div>';
    var done=S.indexOf(c.i)>=0, rt=!done&&X.indexOf(c.i)>=0;
    return '<div class="ec'+(done?' done':'')+(rt?' retry':'')+'" data-i="'+c.i+'"><div>'+esc(c.w.en)+(c.w.ko?'<span class="ko">'+esc(c.w.ko)+'</span>':'')+'</div>'+(done?'<div class="stp">OK</div>':'')+(rt?'<div class="rt">'+esc(L(T.retry))+'</div>':'')+'</div>'; }).join("")+'</div>';
  h+='<div class="est"><div><b>'+S.length+'/24</b>'+esc(L(T.stamps))+'</div><div><b>'+(me&&me.f0?elTxt((me.done||Date.now())-me.f0):"0:00")+'</b>'+esc(L(TMX))+'</div><div><b>'+leftTxt(B.end)+'</b>'+esc(L(dl||B.test?TNX:T.left))+'</div></div>';
  if(me&&me.agreed) h+='<div class="ecard"><button type="button" class="ebtn" data-ev="share" style="background:#7a3cff">'+esc(L(SHX.btn))+'</button></div>';
  h+=rankCard(B);
  h+=wpCard(B);   // 이번 주 점수 (매일 빙고)
  if(!B.test&&!B.ko) h+='<div class="ecard">'+esc(L(T.pgsum))+'<button type="button" class="ebtn g" data-ev="pg">'+esc(L(T.mypg))+'</button><button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>';
  else h+='<div class="ecard"><button type="button" class="elink" data-ev="rules">'+esc(L(T.rules))+' ›</button></div>';
  if(B.last&&B.last.res&&B.last.res.length){ var C=["#e0a100","#9aa4b0","#c47a3c"];
    if(B.last.pts) h+='<div class="ecard"><b>'+esc(L(WPT.last))+'</b> <span style="color:#888;font-size:12px">'+esc(B.last.wk)+'</span>'+B.last.res.map(function(r,i){ return '<div class="erk"><div class="n" style="background:'+(C[i]||"#bbb")+'">'+r.rk+'</div><div><b>'+esc(r.nm)+'</b><div style="font-size:12px;color:#888">'+r.p+' '+esc(L(PTS))+'</div></div><div class="pg">'+(r.pg?r.pg+' PG':'')+'</div></div>'; }).join("")+'</div>';   // 매일 빙고 — 지난주 주간 점수
    else h+='<div class="ecard"><b>'+esc(L(T.last))+'</b> <span style="color:#888;font-size:12px">'+esc(B.last.wk)+'</span>'+B.last.res.map(function(r,i){ return '<div class="erk"><div class="n" style="background:'+(C[i]||"#bbb")+'">'+r.rk+'</div><div><b>'+esc(r.nm)+'</b><div style="font-size:12px;color:#888">'+(r.el!=null?elTxt(r.el):r.lines+' '+esc(L(T.lnN)))+' · '+kst(r.lt)+'</div></div><div class="pg">'+(r.pg?r.pg+' PG':'')+'</div></div>'; }).join("")+'</div>'; }
  e.innerHTML=h; wire(e);
  [].forEach.call(e.querySelectorAll(".ec[data-i]"),function(x){ x.onclick=function(){ tap(+x.dataset.i); }; }); }
function tap(i){ if(!B||!B.open) return; var me=B.me; if(!me){ signIn(); return; } if(!me.agreed){ showRules(true); return; }
  if(me.s.indexOf(i)>=0) return; var c=B.cells.filter(function(x){ return x.i===i; })[0]; if(!c) return;
  var s=sheet('<div class="qc">'+esc(L(T.sq))+': '+esc(c.w.en)+(c.w.ko?' · '+esc(c.w.ko):'')+'</div><div class="qt">'+esc(c.q)+'</div>'+c.o.map(function(o,k){ return '<button type="button" class="op" data-c="'+k+'">'+["①","②","③"][k]+' '+esc(o)+'</button>'; }).join("")+'<div class="msg"></div>');   // 하루 3번 제한 없앰 (10-27)
  [].forEach.call(s.querySelectorAll(".op"),function(b){ b.onclick=function(){ [].forEach.call(s.querySelectorAll(".op"),function(x){ x.disabled=true; });
    var before=me.lines||0;
    post("/npg/bingo/answer",{sess:sess(),i:i,c:+b.dataset.c,l:lg()}).then(function(j){
      if(!j||!j.ok){ s.querySelector(".msg").textContent=j&&j.err==="limit"?L(T.limit):L(T.err); return; }
      me.s=j.s||me.s; me.x=j.x||me.x; me.lines=j.lines||0; me.f0=me.f0||Date.now(); if(me.s.length>=24&&!me.done) me.done=Date.now(); me.tries[i]=3-(j.left==null?0:j.left);
      b.classList.add(j.right?"ok":"bad"); toast(j.right?L(T.right):L(T.wrong),j.right?"#27a745":"#e8322f");
      setTimeout(function(){ s.remove(); paint(); if(j.right&&me.s.length>=24) toast(L(T.bingo)+" "+L(RNK.all)+"!","",true); try{ load(); }catch(e){} },900);
    }).catch(function(){ s.querySelector(".msg").textContent=L(T.err); }); }; }); }
function toast(t,bg,big){ var o=document.getElementById("evToast"); if(o) o.remove(); o=document.createElement("div"); o.id="evToast"; if(big) o.className="big"; else o.style.background=bg; o.textContent=t; document.body.appendChild(o); setTimeout(function(){ o.remove(); },big?2200:1100); }
window.evOpen=open;
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ bbMk(); mk(); }); else { bbMk(); mk(); }
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ evRelang(); }catch(e){} return r; };
// 언어 바꾸면 열린 이벤트 화면 전부 그 언어로 (사장님 10-27 「다른 이벤트도 다 그렇게」) — 새 이벤트 화면을 만들면 여기에 더한다
function evRelang(){ var s=document.getElementById("evSheet"); if(s) s.remove(); if(box()) load(); try{ status(); }catch(e){}
  if(MODE==="treasure") treasureMode();
  else if(MODE==="spot"&&SQ&&SQ._end) spotShow(Object.assign({},SQ,{left:Math.max(0,SQ._end-Date.now())})); }
})();
