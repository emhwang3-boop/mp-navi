/* 머니퍼즐 투어 — 체험·입장권 상품 진열장 (사장님 2026-10-27 「Klook·Creatrip 처럼 상품을 사진과 함께 · 주제별 분류 · 가이드 고르기 · 결제」)
 *  · 「체험·입장권」 칩을 누르면 near.js 옛 판(빅4 패키지·공연관람) 위에 이 화면이 전체로 뜬다. ✕ 로 닫으면 옛 판이 그대로 있다
 *  · 순서(웹·폰 같음, 사장님 「웹도 폰의 순서를 따라」): 주제 칩 → 상품 카드 → 가이드 고르기(언어 → 그 언어 승인 가이드, 허브 /guide/guides) → 예약·결제
 *  · 페이지 전체에 「UNDER TESTING」 도장 (사장님 지시). 진짜 상품 = 빅4 사옥 투어(결제는 기존 tosspay TPAY.open 그대로)·공연관람(옛 판 목록). 나머지는 「예시 · 준비 중」
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
 s:T6("가이드와 함께하는 한국 체험을 골라 바로 예약하세요.","Pick a Korea experience with a guide and book it right away.","ガイドと一緒に楽しむ韓国体験を選んで、すぐ予約しましょう。","挑选有向导陪同的韩国体验，立即预约。","挑選有嚮導陪同的韓國體驗，立即預約。","Elige una experiencia en Corea con guía y resérvala al momento."),
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
 ppl:T6("인원","People","人数","人数","人數","Personas"),
 gd:T6("가이드","Guide","ガイド","向导","嚮導","Guía"),
 none:T6("고르지 않음","Not chosen","未選択","未选择","未選擇","Sin elegir"),
 tot:T6("합계","Total","合計","合计","合計","Total"),
 pay:T6("예약·결제","Book & pay","予約・決済","预约·付款","預約·付款","Reservar y pagar"),
 payn:T6("결제창에서 날짜·인원을 다시 확인합니다. 취소·환불은 환불 정책을 따릅니다.","You will confirm the date and people in the payment window. Cancellations follow our refund policy.","決済画面で日付・人数をもう一度確認します。キャンセル・返金は返金ポリシーに従います。","将在付款页面再次确认日期和人数。取消·退款按退款政策办理。","將在付款頁面再次確認日期和人數。取消·退款依退款政策辦理。","Confirmarás la fecha y las personas en la ventana de pago. Las cancelaciones siguen nuestra política de reembolso."),
 soon:T6("준비 중인 상품이라 아직 예약할 수 없어요.","This product is coming soon and can’t be booked yet.","準備中の商品のため、まだ予約できません。","该商品正在筹备中，暂时无法预约。","該商品正在籌備中，暫時無法預約。","Este producto llega pronto y aún no se puede reservar."),
 sel:T6("선택한 상품","Selected product","選んだ商品","已选商品","已選商品","Producto elegido"),
 seln:T6("오른쪽에서 상품을 고르세요.","Pick a product on the right.","右から商品を選んでください。","请在右侧选择商品。","請在右側選擇商品。","Elige un producto a la derecha."),
 perf:T6("공연장 5곳의 공연 일정 보기","See shows at 5 theaters","劇場5か所の公演日程を見る","查看5家剧场的演出日程","查看5家劇場的演出日程","Ver funciones en 5 teatros"),
 b4p:T6("1인 ₩89,000 · 2인 이상 1인 ₩79,000","1 person ₩89,000 · 2+ ₩79,000 each","1名 ₩89,000 · 2名以上 1名 ₩79,000","1人 ₩89,000 · 2人以上每人 ₩79,000","1人 ₩89,000 · 2人以上每人 ₩79,000","1 persona ₩89,000 · 2+ ₩79,000 c/u")
};
var CATS=[["all",T6("전체","All","すべて","全部","全部","Todo")],["kpop",T6("K-POP","K-POP","K-POP","K-POP","K-POP","K-POP")],["tour",T6("관광","Sightseeing","観光","观光","觀光","Turismo")],["beauty",T6("미용","Beauty","美容","美容","美容","Belleza")],["hair",T6("헤어","Hair","ヘア","美发","美髮","Peluquería")],["food",T6("음식","Food","グルメ","美食","美食","Comida")],["show",T6("공연","Shows","公演","演出","演出","Espectáculos")],["well",T6("웰니스","Wellness","ウェルネス","养生","養生","Bienestar")]];
var P=[
 {id:"b4",c:"kpop",img:"kpop",real:"b4",price:89000,
  t:T6("K-POP 빅4 사옥 투어 (HYBE·SM·JYP·YG)","K-pop Big4 Agency Tour (HYBE·SM·JYP·YG)","K-POP BIG4 社屋ツアー（HYBE・SM・JYP・YG）","K-POP四大社参观团（HYBE·SM·JYP·YG）","K-POP四大社參觀團（HYBE·SM·JYP·YG）","Tour de las Big4 del K-pop (HYBE·SM·JYP·YG)"),
  f:[T6("약 8시간","About 8 h","約8時間","约8小时","約8小時","Unas 8 h"),T6("가이드 동행","With a guide","ガイド同行","向导同行","嚮導同行","Con guía"),T6("노선도 제공","Route map","路線図あり","提供路线图","提供路線圖","Mapa de ruta")],
  d:T6("HYBE·SM·JYP·YG 사옥 외관과 SM KWANGYA(성수) 굿즈샵을 가이드와 함께 돕니다 (외관 관람·사진).","Visit the HYBE, SM, JYP and YG building exteriors and the SM KWANGYA goods shop in Seongsu with a guide (exterior & photos).","HYBE・SM・JYP・YGの社屋外観とSM KWANGYA（聖水）のグッズショップをガイドと巡ります（外観・写真）。","在向导带领下游览HYBE·SM·JYP·YG大楼外观和SM KWANGYA（圣水）周边店（外观·拍照）。","在嚮導帶領下遊覽HYBE·SM·JYP·YG大樓外觀和SM KWANGYA（聖水）周邊店（外觀·拍照）。","Recorre con guía los exteriores de HYBE, SM, JYP y YG y la tienda SM KWANGYA en Seongsu (exterior y fotos).")},
 {id:"perf",c:"show",img:"show",real:"perf",
  t:T6("공연 관람 — 서울 공연장 5곳","Shows — 5 theaters in Seoul","公演鑑賞 — ソウルの劇場5か所","演出观赏 — 首尔5家剧场","演出觀賞 — 首爾5家劇場","Espectáculos — 5 teatros de Seúl"),
  f:[T6("공연 일정","Show schedule","公演日程","演出日程","演出日程","Cartelera"),T6("예매처 연결","Ticket links","チケット購入先","购票链接","購票連結","Venta de entradas"),T6("6개 언어","6 languages","6言語","6种语言","6種語言","6 idiomas")],
  d:T6("공연장마다 지금 하는 공연을 보고, 공식 예매처로 바로 갑니다.","See what’s on at each theater and go straight to the official ticket site.","劇場ごとに上演中の公演を見て、公式チケットサイトへ直接移動します。","查看各剧场正在上演的演出，直接前往官方售票处。","查看各劇場正在上演的演出，直接前往官方售票處。","Mira qué hay en cada teatro y ve directo a la venta oficial de entradas.")},
 {id:"bty",c:"beauty",img:"beauty",price:79000,
  t:T6("K-뷰티 퍼스널컬러 진단 + 메이크업 클래스","K-beauty personal color + makeup class","K-ビューティー パーソナルカラー診断＋メイク教室","K-美妆 个人色彩诊断 + 化妆课","K-美妝 個人色彩診斷 + 化妝課","K-beauty: color personal + clase de maquillaje"),
  f:[T6("2시간","2 h","2時間","2小时","2小時","2 h"),T6("통역 가이드","Interpreter guide","通訳ガイド","翻译向导","翻譯嚮導","Guía intérprete"),T6("파우치 증정","Free pouch","ポーチ付き","赠送化妆包","贈送化妝包","Neceser de regalo")],
  d:T6("내 피부톤에 맞는 색을 진단받고, 전문 아티스트에게 한국식 메이크업을 배웁니다.","Find the colors that suit your skin tone and learn Korean-style makeup from a pro artist.","肌の色に合う色を診断し、プロから韓国風メイクを学びます。","诊断适合自己肤色的颜色，并向专业化妆师学习韩式妆容。","診斷適合自己膚色的顏色，並向專業化妝師學習韓式妝容。","Descubre los colores que te favorecen y aprende maquillaje coreano con una artista profesional.")},
 {id:"hr",c:"hair",img:"hair",price:65000,
  t:T6("서울 트렌드 헤어 스타일링","Seoul trend hair styling","ソウルトレンド ヘアスタイリング","首尔潮流发型设计","首爾潮流髮型設計","Peinado de tendencia en Seúl"),
  f:[T6("1.5시간","1.5 h","1.5時間","1.5小时","1.5小時","1,5 h"),T6("예약 통역","Booking interpreter","予約通訳","预约翻译","預約翻譯","Intérprete de reserva"),T6("강남·홍대","Gangnam·Hongdae","江南・弘大","江南·弘大","江南·弘大","Gangnam·Hongdae")],
  d:T6("K-드라마 스타일 컷·드라이·펌 상담. 원하는 사진만 보여 주면 가이드가 통역해 드려요.","K-drama style cut, blow-dry or perm. Just show a photo — your guide interprets.","K-ドラマ風カット・ブロー・パーマの相談。写真を見せるだけでガイドが通訳します。","韩剧风剪发·吹发·烫发咨询。只要给出照片，向导帮你翻译。","韓劇風剪髮·吹髮·燙髮諮詢。只要給出照片，嚮導幫你翻譯。","Corte, secado o permanente estilo K-drama. Enseña una foto y tu guía traduce.")},
 {id:"hb",c:"tour",img:"hanbok",price:45000,
  t:T6("경복궁 한복 체험 + 궁궐 해설","Hanbok at Gyeongbokgung + palace guide","景福宮 韓服体験＋宮殿解説","景福宫韩服体验 + 宫殿讲解","景福宮韓服體驗 + 宮殿解說","Hanbok en Gyeongbokgung + guía del palacio"),
  f:[T6("3시간","3 h","3時間","3小时","3小時","3 h"),T6("한복 대여 포함","Hanbok rental","韓服レンタル込み","含韩服租赁","含韓服租借","Alquiler de hanbok"),T6("궁 입장 무료","Free palace entry","入場無料","免费入宫","免費入宮","Entrada gratis")],
  d:T6("한복을 입으면 궁 입장이 무료. 가이드가 궁궐의 이야기와 사진 명당을 안내합니다.","Wearing hanbok gets you in free. Your guide shares the palace’s stories and best photo spots.","韓服を着ると入場無料。ガイドが宮殿の物語と写真スポットを案内します。","穿韩服免费入宫。向导讲解宫殿故事并带你去拍照胜地。","穿韓服免費入宮。嚮導講解宮殿故事並帶你去拍照勝地。","Con hanbok entras gratis. Tu guía cuenta la historia del palacio y los mejores rincones para fotos.")},
 {id:"ck",c:"food",img:"cook",price:55000,
  t:T6("김밥·김치 쿠킹 클래스","Kimbap & kimchi cooking class","キンパ・キムチ 料理教室","紫菜包饭·泡菜烹饪课","紫菜包飯·泡菜烹飪課","Clase de cocina: kimbap y kimchi"),
  f:[T6("2.5시간","2.5 h","2.5時間","2.5小时","2.5小時","2,5 h"),T6("재료 포함","Ingredients incl.","材料込み","含食材","含食材","Ingredientes incl."),T6("레시피 카드","Recipe card","レシピカード","食谱卡","食譜卡","Tarjeta de receta")],
  d:T6("직접 만든 김밥과 김치로 점심을 먹고, 레시피 카드를 받아 갑니다.","Eat the kimbap and kimchi you made for lunch and take the recipe card home.","自分で作ったキンパとキムチでランチ。レシピカードも持ち帰れます。","用亲手做的紫菜包饭和泡菜当午餐，还能带走食谱卡。","用親手做的紫菜包飯和泡菜當午餐，還能帶走食譜卡。","Almuerza el kimbap y el kimchi que preparaste y llévate la receta.")},
 {id:"dmz",c:"tour",img:"dmz",price:85000,
  t:T6("DMZ 반일 투어","DMZ half-day tour","DMZ 半日ツアー","DMZ半日游","DMZ半日遊","Tour de medio día a la DMZ"),
  f:[T6("6시간","6 h","6時間","6小时","6小時","6 h"),T6("왕복 버스","Round-trip bus","往復バス","往返巴士","往返巴士","Bus ida y vuelta"),T6("여권 필요","Passport needed","パスポート必要","需护照","需護照","Pasaporte")],
  d:T6("전망대에서 북한 땅을 바라보고, 땅굴과 기념관을 가이드 해설로 둘러봅니다.","Look across to North Korea from the observatory and tour the tunnel and memorial with a guide.","展望台から北朝鮮を望み、トンネルと記念館をガイド解説付きで巡ります。","在瞭望台眺望朝鲜，并在向导讲解下参观地道和纪念馆。","在瞭望台眺望北韓，並在嚮導講解下參觀地道和紀念館。","Mira hacia Corea del Norte desde el mirador y visita el túnel y el memorial con guía.")},
 {id:"jj",c:"well",img:"jjim",price:25000,
  t:T6("한국식 찜질방 체험","Korean jjimjilbang spa","韓国式チムジルバン体験","韩式汗蒸房体验","韓式汗蒸幕體驗","Spa coreano jjimjilbang"),
  f:[T6("자유 이용","Stay as long as you like","時間自由","不限时","不限時","Sin límite"),T6("입장권","Entry ticket","入場券","门票","門票","Entrada"),T6("식혜·구운 달걀","Sikhye & baked eggs","シッケ・ゆで卵","甜米露·烤鸡蛋","甜米露·烤雞蛋","Sikhye y huevos")],
  d:T6("한국 사람들의 휴식 공간. 여러 온도의 방과 사우나, 간식까지 한 번에 즐깁니다.","Where Koreans relax: rooms at different temperatures, saunas and snacks in one place.","韓国人の憩いの場。温度の違う部屋やサウナ、おやつまで一度に楽しめます。","韩国人的休闲场所，各种温度的房间、桑拿和小吃一次享受。","韓國人的休閒場所，各種溫度的房間、桑拿和小吃一次享受。","Donde se relajan los coreanos: salas a distintas temperaturas, saunas y tentempiés.")}
];
var GLANGS=[["en","English"],["ja","日本語"],["zhs","中文(简)"],["zht","中文(繁)"],["es","Español"],["ko","한국어"]];
var S={cat:"all",prod:null,glang:"",guides:null,gid:null,date:"",n:2};
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
 +"#shopBox .sft{display:flex;flex-wrap:wrap;gap:5px}#shopBox .sft span{font-size:11.5px;background:#fff1e6;border-radius:6px;padding:2px 7px}"
 +"#shopBox .scb p{margin:0;color:#667085;font-size:12.5px;line-height:1.5}#shopBox .spr{margin-top:auto;font-size:16px;font-weight:900}#shopBox .spr small{font-size:12px;color:#667085;font-weight:500}"
 +"#shopBox .sbox{background:#fff;border:1px solid #e4e0d6;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}#shopBox .sbox h2{font-size:16px;margin:0;display:flex;align-items:center;gap:8px}"
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
document.head.appendChild(css);
function won(x){ return "₩"+Number(x).toLocaleString("ko-KR"); }
function box(){ return document.getElementById("shopBox"); }
function catName(c){ return L(CATS.filter(function(x){ return x[0]===c; })[0][1]); }
function prod(){ return P.filter(function(p){ return p.id===S.prod; })[0]; }
function b4Price(n){ return n>=2?79000:89000; }
function gName(g){ return window.LANG==="ko"?(g.name||g.name_en||""):(g.name_en||g.name||""); }
function paint(){ var b=box(); if(!b) return; var y=b.scrollTop;
  var L0=P.filter(function(p){ return S.cat==="all"||p.c===S.cat; });
  var h='<div class="sstamp" aria-hidden="true"><span>UNDER TESTING</span></div>'
   +'<div class="shd"><b>'+esc(L(TX.t))+'</b><span class="ut">UNDER TESTING</span><button type="button" data-s="x">✕ '+esc(L(TX.x))+'</button></div><div class="sin">'
   +'<p class="ssub">'+esc(L(TX.s))+'</p><div class="sgrid"><div class="smain">'
   +'<div class="scats">'+CATS.map(function(c){ var n=c[0]==="all"?P.length:P.filter(function(p){ return p.c===c[0]; }).length; return '<button type="button" data-cat="'+c[0]+'" class="'+(S.cat===c[0]?"on":"")+'">'+esc(L(c[1]))+' '+n+'</button>'; }).join("")+'</div>'
   +'<p class="scnt">'+L0.length+' '+esc(L(TX.n))+'</p>'
   +'<div class="scards">'+L0.map(function(p){ return '<button type="button" class="scard'+(S.prod===p.id?" on":"")+'" data-p="'+p.id+'"><div class="sph"><img src="img/shop/'+p.img+'.webp" alt="" loading="lazy"><span class="stag">'+esc(catName(p.c))+'</span>'+(p.real?'<span class="sreal">'+esc(L(TX.real))+'</span>':'<span class="sex">'+esc(L(TX.ex))+'</span>')+'</div>'
      +'<div class="scb"><h3>'+esc(L(p.t))+'</h3><div class="sft">'+p.f.map(function(x){ return '<span>'+esc(L(x))+'</span>'; }).join("")+'</div><p>'+esc(L(p.d))+'</p>'
      +(p.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p.price?'<div class="spr">'+won(p.price)+' <small>/ '+esc(L(TX.per))+'</small></div>':'')+'</div></button>'; }).join("")+'</div>';
  h+='</div><aside class="sside">';
  var p0=prod();   // 선택한 상품
  h+='<section class="sbox"><h2>'+esc(L(TX.sel))+'</h2>'+(p0?'<div class="ssel"><img src="img/shop/'+p0.img+'.webp" alt=""><b>'+esc(L(p0.t))+'</b><div class="sft">'+p0.f.map(function(x){ return '<span>'+esc(L(x))+'</span>'; }).join("")+'</div>'+(p0.real==="b4"?'<div class="spr">'+esc(L(TX.b4p))+'</div>':p0.price?'<div class="spr">'+won(p0.price)+' / '+esc(L(TX.per))+'</div>':'')+'</div>':'<p class="snote">'+esc(L(TX.seln))+'</p>')+'</section>';
  // 가이드
  h+='<section class="sbox"><h2><span class="sstep">1</span>'+esc(L(TX.g1))+'</h2><p class="snote">'+esc(L(TX.gl))+'</p><div class="sgl">'+GLANGS.map(function(l){ return '<button type="button" data-gl="'+l[0]+'" class="'+(S.glang===l[0]?"on":"")+'">'+esc(l[1])+'</button>'; }).join("")+'</div>';
  if(S.glang){ if(S.guides===null) h+='<p class="snote">'+esc(L(TX.gld))+'</p>'; else if(!S.guides.length) h+='<p class="snote">'+esc(L(TX.gn))+'</p>';
    else h+=S.guides.map(function(g){ return '<button type="button" class="sg'+(S.gid===g.id?" on":"")+'" data-g="'+esc(g.id)+'">'+(g.photo?'<img src="'+esc(g.photo)+'" alt="">':'<span class="sav">'+esc(gName(g).slice(0,1))+'</span>')+'<span><b>'+esc(gName(g))+'</b><small>'+esc((g.langs||[]).join(" · "))+(g.years?' · '+esc(g.years):'')+(g.region?' · '+esc(g.region):'')+'</small></span></button>'; }).join(""); }
  h+='</section>';
  // 예약·결제
  var p=prod(); h+='<section class="sbox" id="shopCo"><h2><span class="sstep">2</span>'+esc(L(TX.g2))+'</h2>';
  if(!p) h+='<p class="snote">'+esc(L(TX.pick))+'</p>';
  else { var gg=(S.guides||[]).filter(function(g){ return g.id===S.gid; })[0];
    if(p.real==="perf") h+='<button type="button" class="spay" data-s="perf">'+esc(L(TX.perf))+' ›</button>';
    else { var unit=p.real==="b4"?b4Price(S.n):p.price;
      h+='<div class="srow"><label for="shopDt">'+esc(L(TX.date))+'</label><input type="date" id="shopDt" value="'+esc(S.date)+'"></div>'
       +'<div class="srow"><label>'+esc(L(TX.ppl))+'</label><div class="sstp"><button type="button" data-n="-1" aria-label="-">−</button><b>'+S.n+'</b><button type="button" data-n="1" aria-label="+">+</button></div></div>'
       +'<div class="srow"><label>'+esc(L(TX.gd))+'</label><b>'+(gg?esc(gName(gg)):esc(L(TX.none)))+'</b></div>'
       +'<div class="stot"><span>'+esc(L(TX.tot))+'</span><span>'+won(unit*S.n)+'</span></div>'
       +(p.real==="b4"?'<button type="button" class="spay" data-s="pay">'+esc(L(TX.pay))+' ›</button><p class="snote">'+esc(L(TX.payn))+'</p>'
         :'<button type="button" class="spay" disabled>'+esc(L(TX.pay))+'</button><p class="snote">'+esc(L(TX.soon))+'</p>'); } }
  h+='</section></aside></div></div>';
  b.innerHTML=h; b.scrollTop=y; }
function loadGuides(){ var l=S.glang; S.guides=null; paint();
  fetch(HUBU+"/guide/guides?lang="+encodeURIComponent(l)).then(function(r){ return r.json(); }).then(function(j){ if(S.glang!==l) return; S.guides=(j&&j.ok&&j.items)||[]; paint(); }).catch(function(){ if(S.glang===l){ S.guides=[]; paint(); } }); }
function open(){ if(box()) return; var b=document.createElement("div"); b.id="shopBox"; document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  if(!S.date){ S.date=new Date(Date.now()+3*864e5+9*36e5).toISOString().slice(0,10); }
  paint(); try{ ntap("shop","open"); }catch(e){} }
function close(){ var b=box(); if(b) b.remove(); document.documentElement.style.overflow=""; }
document.addEventListener("click",function(e){ var b=box(); if(!b||!b.contains(e.target)) return; var t=e.target.closest("[data-s],[data-cat],[data-p],[data-gl],[data-g],[data-n]"); if(!t) return;
  if(t.dataset.cat){ S.cat=t.dataset.cat; paint(); }
  else if(t.dataset.p){ S.prod=t.dataset.p; paint(); try{ ntap("shop","p_"+S.prod); }catch(z){} var c=document.getElementById("shopCo"); if(c&&window.innerWidth<900) c.scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(t.dataset.gl){ S.glang=t.dataset.gl; S.gid=null; loadGuides(); }
  else if(t.dataset.g){ S.gid=t.dataset.g; paint(); }
  else if(t.dataset.n){ S.n=Math.max(1,Math.min(20,S.n+(+t.dataset.n))); paint(); }
  else if(t.dataset.s==="x") close();
  else if(t.dataset.s==="pay"){ close(); try{ if(window.TPAY) TPAY.open(); }catch(z){} }   // 빅4 — 기존 결제(tosspay.js) 그대로
  else if(t.dataset.s==="perf"){ close(); var a=document.querySelector('[data-nr="tgx"][data-g="perf"]'); if(a&&!/▾/.test(a.textContent)) a.click(); }   // 옛 판의 공연관람 펼치기
});
document.addEventListener("change",function(e){ if(e.target&&e.target.id==="shopDt"){ S.date=e.target.value; } });
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ paint(); }catch(e){} return r; };   // 언어 바꾸면 바로
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로 = 닫기
window.SHOP={open:open,close:close};
})();
