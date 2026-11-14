/* 차량 대절 (사장님 2026-11-11 「그대로 해」) — 기사 딸린 승합차 하루 대절 · 규칙서 맨 아래 「(11-11 사장님) 차량 대절 상품」
 *  · 상품 화면(앱 shop.js · 홈페이지 home/pc_pkg.js) 예약 칸: 큰 짐 · 픽업(서울 안 장소 찾기 / 인천공항 / 김포공항) · 목적지 여러 곳(찾아 넣기 · ☰ 끌어 순서 · 폰은 꾹 눌러 끌기 · ✕)
 *    · 기사 언어(한국어·영어·일본어·중국어) · 요청 사항 · 구간 가격(목적지 가운데 가장 먼 곳) — 날짜·시작 시각·인원(1~7)·예약자 연락처는 상품 화면 칸 그대로
 *  · 구간 = 주소 글자로 바로 어림 → 허브 POST /shop/chr/quote(카카오 coord2regioncode · 무료)로 맞춤 · 주문 때 허브가 다시 계산(화면 값 cexp 와 다르면 409 → 새 값으로 다시 확인)
 *  · 교통 창 광고 띠(transit.js CHR.adHtml) · 일정표 날마다 [차량 대절](trip.js CHR.book) · 예약한 날 목적지·이동 줄(trip.js CHR.days)
 *  · 내 예약 바우처(near.js · home/pc_bk.js CHR.vchHtml) — 기사 이름·전화·차 번호는 사장님이 관리자에서 넣어 확정한 뒤
 *  · 🔴 가격·구간을 바꾸면 허브 cf_live_hub/src/chr_hub.js 의 CHR_PRICE·chrZone 도 같이 · 새 글은 6개 언어(규칙서 3장) · 이모지 대신 img/menu/mi_charter.png
 */
(function(){
"use strict";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function lg(){ return window.LANG||"en"; }
function L(o){ return o?(o[lg()]||o.en||o.ko||""):""; }
function F(o,m){ var s=L(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function hub(){ return window.HUB||"https://brief-live-hub.emhwang3.workers.dev"; }
function won(n){ return "₩"+Number(n||0).toLocaleString("ko-KR"); }
function kstDay(add){ return new Date(Date.now()+9*36e5+(add||0)*864e5).toISOString().slice(0,10); }
function ico(st){ return '<img class="chr-ic" src="img/menu/mi_charter.png" alt=""'+(st?' style="'+st+'"':'')+'>'; }
var PID="chr", PRICE=[0,300000,350000,450000,700000], NMAX=7, DMAX=15, LEAD=3, LUGMAX=30;
// 프라이빗 카투어 코스 자료 (11-14 사장님 「실행해」) — 🔴 직접 고치지 말 것: tour_icons/navi_build/ct_data.json 을 고치고 mk_ct.py (허브 ct_data.js 에도 같이 들어감)
var CTD=/*CTD:begin*/{"v":"1114a","guide":360000,"dmzOff":["2026-12-25","2027-01-01","2027-02-07","2027-02-09","2027-05-05","2027-05-13","2027-09-14","2027-09-15","2027-09-16"],"stops":{"gbg":{"ko":"경복궁","en":"Gyeongbokgung Palace","ja":"景福宮","zhs":"景福宫","zht":"景福宮","es":"Palacio Gyeongbokgung","lat":37.577613,"lng":126.976898},"bch":{"ko":"북촌한옥마을","en":"Bukchon Hanok Village","ja":"北村韓屋村","zhs":"北村韩屋村","zht":"北村韓屋村","es":"Aldea Hanok de Bukchon","lat":37.581768,"lng":126.984812},"isd":{"ko":"인사동","en":"Insadong","ja":"仁寺洞","zhs":"仁寺洞","zht":"仁寺洞","es":"Insadong","lat":37.574352,"lng":126.984731},"nst":{"ko":"N서울타워","en":"N Seoul Tower","ja":"Nソウルタワー","zhs":"N首尔塔","zht":"N首爾塔","es":"Torre N Seúl","lat":37.551305,"lng":126.988231},"mdg":{"ko":"명동","en":"Myeongdong","ja":"明洞","zhs":"明洞","zht":"明洞","es":"Myeongdong","lat":37.562077,"lng":126.984901},"ssu":{"ko":"성수동 카페거리","en":"Seongsu-dong Cafe Street","ja":"聖水洞カフェ通り","zhs":"圣水洞咖啡街","zht":"聖水洞咖啡街","es":"Calle de cafés de Seongsu","lat":37.542433,"lng":127.056394},"apg":{"ko":"압구정로데오거리","en":"Apgujeong Rodeo Street","ja":"狎鴎亭ロデオ通り","zhs":"狎鸥亭罗德奥街","zht":"狎鷗亭羅德奧街","es":"Calle Rodeo de Apgujeong","lat":37.526756,"lng":127.039152},"sml":{"ko":"코엑스 별마당도서관","en":"Starfield Library (COEX)","ja":"COEX ピョルマダン図書館","zhs":"COEX 星空图书馆","zht":"COEX 星空圖書館","es":"Biblioteca Starfield (COEX)","lat":37.510193,"lng":127.060159},"lwt":{"ko":"롯데월드타워 서울스카이","en":"Lotte World Tower Seoul Sky","ja":"ロッテワールドタワー ソウルスカイ","zhs":"乐天世界塔 首尔天空","zht":"樂天世界塔 首爾天空","es":"Lotte World Tower – Seoul Sky","lat":37.512509,"lng":127.102437},"imj":{"ko":"임진각 평화누리공원","en":"Imjingak Nuri Peace Park","ja":"臨津閣 平和ヌリ公園","zhs":"临津阁和平世界公园","zht":"臨津閣和平世界公園","es":"Parque de la Paz de Imjingak","lat":37.892276,"lng":126.74392},"t3":{"ko":"제3땅굴","en":"3rd Infiltration Tunnel","ja":"第3トンネル","zhs":"第三地道","zht":"第三地道","es":"Tercer Túnel de Infiltración","lat":37.916474,"lng":126.699195},"dora":{"ko":"도라전망대","en":"Dora Observatory","ja":"都羅展望台","zhs":"都罗瞭望台","zht":"都羅瞭望台","es":"Observatorio Dora","lat":37.91099,"lng":126.706034},"cgv":{"ko":"캠프그리브스","en":"Camp Greaves","ja":"キャンプ・グリーブス","zhs":"格里夫斯营地","zht":"格里夫斯營地","es":"Camp Greaves","lat":37.898429,"lng":126.731631},"nami":{"ko":"남이섬","en":"Nami Island","ja":"南怡島","zhs":"南怡岛","zht":"南怡島","es":"Isla Nami","lat":37.803752,"lng":127.526161},"ptf":{"ko":"쁘띠프랑스","en":"Petite France","ja":"プチフランス","zhs":"小法国村","zht":"小法國村","es":"Petite France","lat":37.714995,"lng":127.490537},"acg":{"ko":"아침고요수목원","en":"The Garden of Morning Calm","ja":"朝の静寂樹木園","zhs":"晨静树木园","zht":"晨靜樹木園","es":"Jardín de la Calma Matinal","lat":37.743004,"lng":127.351661},"hsm":{"ko":"수원화성","en":"Suwon Hwaseong Fortress","ja":"水原華城","zhs":"水原华城","zht":"水原華城","es":"Fortaleza Hwaseong de Suwon","lat":37.285573,"lng":127.009687},"hhg":{"ko":"화성행궁","en":"Hwaseong Haenggung Palace","ja":"華城行宮","zhs":"华城行宫","zht":"華城行宮","es":"Palacio Hwaseong Haenggung","lat":37.281914,"lng":127.014041},"kfv":{"ko":"한국민속촌","en":"Korean Folk Village","ja":"韓国民俗村","zhs":"韩国民俗村","zht":"韓國民俗村","es":"Aldea Folclórica Coreana","lat":37.259615,"lng":127.119801},"evl":{"ko":"에버랜드","en":"Everland","ja":"エバーランド","zhs":"爱宝乐园","zht":"愛寶樂園","es":"Everland","lat":37.293101,"lng":127.202198},"lug":{"ko":"강화 루지","en":"Ganghwa Luge","ja":"江華リュージュ","zhs":"江华斜坡滑车","zht":"江華斜坡滑車","es":"Luge de Ganghwa","lat":37.617115,"lng":126.498117},"jyb":{"ko":"조양방직 (카페)","en":"Joyang Bangjik (cafe)","ja":"朝陽紡織（カフェ）","zhs":"朝阳纺织（咖啡馆）","zht":"朝陽紡織（咖啡館）","es":"Joyang Bangjik (cafetería)","lat":37.746953,"lng":126.480317},"cht":{"ko":"인천 차이나타운","en":"Incheon Chinatown","ja":"仁川チャイナタウン","zhs":"仁川中华街","zht":"仁川中華街","es":"Barrio chino de Incheon","lat":37.475604,"lng":126.617936},"wmd":{"ko":"월미도","en":"Wolmido","ja":"月尾島","zhs":"月尾岛","zht":"月尾島","es":"Wolmido","lat":37.471738,"lng":126.599231},"grp":{"ko":"강촌레일파크","en":"Gangchon Rail Park","ja":"江村レールパーク","zhs":"江村铁路公园","zht":"江村鐵路公園","es":"Gangchon Rail Park","lat":37.815773,"lng":127.712332},"alp":{"ko":"알파카월드","en":"Alpaca World","ja":"アルパカワールド","zhs":"羊驼世界","zht":"羊駝世界","es":"Alpaca World","lat":37.82765,"lng":127.883736},"gjm":{"ko":"국립경주박물관","en":"Gyeongju National Museum","ja":"国立慶州博物館","zhs":"国立庆州博物馆","zht":"國立慶州博物館","es":"Museo Nacional de Gyeongju","lat":35.829234,"lng":129.22795},"drw":{"ko":"대릉원","en":"Daereungwon Tomb Complex","ja":"大陵苑","zhs":"大陵苑","zht":"大陵苑","es":"Daereungwon (tumbas reales)","lat":35.838191,"lng":129.213334},"csd":{"ko":"첨성대","en":"Cheomseongdae Observatory","ja":"瞻星台","zhs":"瞻星台","zht":"瞻星臺","es":"Observatorio Cheomseongdae","lat":35.834715,"lng":129.219},"dgw":{"ko":"동궁과 월지","en":"Donggung Palace and Wolji Pond","ja":"東宮と月池","zhs":"东宫与月池","zht":"東宮與月池","es":"Palacio Donggung y estanque Wolji","lat":35.834776,"lng":129.226976},"bgs":{"ko":"불국사","en":"Bulguksa Temple","ja":"仏国寺","zhs":"佛国寺","zht":"佛國寺","es":"Templo Bulguksa","lat":35.789915,"lng":129.331843},"sga":{"ko":"석굴암","en":"Seokguram Grotto","ja":"石窟庵","zhs":"石窟庵","zht":"石窟庵","es":"Gruta Seokguram","lat":35.795242,"lng":129.350521},"hrd":{"ko":"황리단길","en":"Hwangridan-gil","ja":"皇理団通り","zhs":"皇理团路","zht":"皇理團路","es":"Calle Hwangridan","lat":35.839335,"lng":129.209645}},"crs":{"ctsel":{"t":{"ko":"서울 시내 프라이빗 카투어","en":"Seoul City Private Car Tour","ja":"ソウル市内 プライベートカーツアー","zhs":"首尔市区私人包车游","zht":"首爾市區私人包車遊","es":"Tour privado en coche por Seúl"},"g":"opt","ops":[{"k":"cl","n":{"ko":"서울 클래식","en":"Seoul Classic","ja":"ソウル・クラシック","zhs":"首尔经典","zht":"首爾經典","es":"Seúl clásico"},"z":1,"p":300000,"h":10,"tm":"09:00","d":[["gbg","bch","isd","nst","mdg"]]},{"k":"kw","n":{"ko":"한류·쇼핑","en":"K-Culture & Shopping","ja":"韓流・ショッピング","zhs":"韩流·购物","zht":"韓流·購物","es":"Cultura coreana y compras"},"z":1,"p":300000,"h":10,"tm":"10:00","d":[["ssu","apg","sml","lwt"]]}]},"ctdmz":{"t":{"ko":"DMZ 프라이빗 카투어 (가이드 포함)","en":"DMZ Private Car Tour (with guide)","ja":"DMZ プライベートカーツアー（ガイド付き）","zhs":"DMZ私人包车游（含导游）","zht":"DMZ私人包車遊（含導遊）","es":"Tour privado en coche a la DMZ (con guía)"},"g":"inc","tk":12200,"dmz":1,"ops":[{"k":"dmz","n":{"ko":"DMZ","en":"DMZ","ja":"DMZ","zhs":"DMZ","zht":"DMZ","es":"DMZ"},"z":2,"p":710000,"h":8,"tm":"08:00","d":[["imj","t3","dora","cgv"]]}]},"ctsub":{"t":{"ko":"서울 근교 프라이빗 카투어","en":"Private Car Tour near Seoul","ja":"ソウル近郊 プライベートカーツアー","zhs":"首尔近郊私人包车游","zht":"首爾近郊私人包車遊","es":"Tour privado en coche cerca de Seúl"},"g":"opt","ops":[{"k":"gp","n":{"ko":"가평","en":"Gapyeong","ja":"加平","zhs":"加平","zht":"加平","es":"Gapyeong"},"z":2,"p":350000,"h":10,"tm":"08:00","d":[["nami","ptf","acg"]]},{"k":"sw","n":{"ko":"수원","en":"Suwon","ja":"水原","zhs":"水原","zht":"水原","es":"Suwon"},"z":2,"p":350000,"h":10,"tm":"09:00","d":[["hsm","hhg","kfv"]]},{"k":"yi","n":{"ko":"용인","en":"Yongin","ja":"龍仁","zhs":"龙仁","zht":"龍仁","es":"Yongin"},"z":2,"p":350000,"h":10,"tm":"09:00","d":[["evl","kfv"]]},{"k":"ic","n":{"ko":"인천·강화","en":"Incheon & Ganghwa","ja":"仁川・江華","zhs":"仁川·江华","zht":"仁川·江華","es":"Incheon y Ganghwa"},"z":2,"p":350000,"h":10,"tm":"09:00","d":[["lug","jyb","cht","wmd"]]},{"k":"cc","n":{"ko":"춘천","en":"Chuncheon","ja":"春川","zhs":"春川","zht":"春川","es":"Chuncheon"},"z":3,"p":450000,"h":10,"tm":"08:00","d":[["nami","grp","alp"]]}]},"ctgj":{"t":{"ko":"서울–경주 프라이빗 카투어","en":"Seoul–Gyeongju Private Car Tour","ja":"ソウル–慶州 プライベートカーツアー","zhs":"首尔–庆州私人包车游","zht":"首爾–慶州私人包車遊","es":"Tour privado en coche Seúl–Gyeongju"},"g":"opt","ops":[{"k":"d1","n":{"ko":"당일 (12시간)","en":"Day trip (12 hours)","ja":"日帰り（12時間）","zhs":"一日游（12小时）","zht":"一日遊（12小時）","es":"Excursión de un día (12 h)"},"z":4,"p":760000,"h":12,"tm":"07:00","d":[["bgs","sga","drw","csd","hrd"]]},{"k":"d2","n":{"ko":"1박 2일","en":"2 days, 1 night","ja":"1泊2日","zhs":"两天一夜","zht":"兩天一夜","es":"2 días, 1 noche"},"z":4,"p":1500000,"h":10,"tm":"07:30","d":[["gjm","drw","csd","dgw"],["bgs","sga","hrd"]]}]}}}/*CTD:end*/;
var AP={icn:{ko:"인천국제공항",en:"Incheon International Airport",lat:37.4602,lng:126.4407,n:T6("인천공항","Incheon Airport","仁川空港","仁川机场","仁川機場","Aeropuerto de Incheon")},
        gmp:{ko:"김포국제공항",en:"Gimpo International Airport",lat:37.5583,lng:126.7906,n:T6("김포공항","Gimpo Airport","金浦空港","金浦机场","金浦機場","Aeropuerto de Gimpo")}};
var DLS=["ko","en","ja","zh"].filter(function(k){ return !window.svcOn||svcOn(k==="zh"?"zhs":k)||(k==="zh"&&svcOn("zht")); });   // 11-13 숨긴 서비스 언어 빼기(index.html SVC_LANG_ON)
var DLN={ko:T6("한국어","Korean","韓国語","韩语","韓語","Coreano"),en:T6("영어","English","英語","英语","英語","Inglés"),ja:T6("일본어","Japanese","日本語","日语","日語","Japonés"),zh:T6("중국어","Chinese","中国語","中文","中文","Chino")};
var ZN=[null,
 T6("서울 시내","Seoul (city)","ソウル市内","首尔市内","首爾市內","Seúl (ciudad)"),
 T6("경기·인천","Gyeonggi · Incheon","京畿・仁川","京畿·仁川","京畿·仁川","Gyeonggi · Incheon"),
 T6("강원·충청 (대전·세종 포함)","Gangwon · Chungcheong (incl. Daejeon, Sejong)","江原・忠清（大田・世宗を含む）","江原·忠清（含大田·世宗）","江原·忠清（含大田·世宗）","Gangwon · Chungcheong (incl. Daejeon y Sejong)"),
 T6("동해안·전라·경상 (부산·대구·울산·광주 포함)","East coast · Jeolla · Gyeongsang (incl. Busan, Daegu, Ulsan, Gwangju)","東海岸・全羅・慶尚（釜山・大邱・蔚山・光州を含む）","东海岸·全罗·庆尚（含釜山·大邱·蔚山·光州）","東海岸·全羅·慶尚（含釜山·大邱·蔚山·光州）","Costa este · Jeolla · Gyeongsang (incl. Busan, Daegu, Ulsan y Gwangju)")];
var ZNO=["","①","②","③","④"];
var TX={
 t:T6("차량 대절","Private Car Charter","貸切チャーター","包车","包車","Coche privado con conductor"),
 per:T6("차 1대","per car","車1台","每辆车","每輛車","por coche"),
 tm:T6("시작 시각","Start time","開始時刻","开始时间","開始時間","Hora de inicio"),
 tmn:T6("픽업부터 10시간","10 hours from pickup","お迎えから10時間","从接您起10小时","從接您起10小時","10 horas desde la recogida"),
 lug:T6("큰 짐 (캐리어)","Large bags (suitcases)","大きな荷物（スーツケース）","大件行李（行李箱）","大件行李（行李箱）","Maletas grandes"),
 pk:T6("픽업 장소","Pickup","お迎え場所","上车地点","上車地點","Recogida"),
 pkn:T6("서울 지역이나 인천·김포공항에서만 태워 드려요.","We pick you up only in Seoul or at Incheon or Gimpo Airport.","お迎えはソウル市内か仁川・金浦空港のみです。","仅在首尔市内或仁川·金浦机场接您上车。","僅在首爾市內或仁川·金浦機場接您上車。","Solo te recogemos en Seúl o en los aeropuertos de Incheon y Gimpo."),
 pkS:T6("서울 안 장소 찾기","Find a place in Seoul","ソウル市内で探す","在首尔市内查找","在首爾市內查找","Buscar en Seúl"),
 pkPh:T6("숙소·장소 이름 (서울)","Hotel or place name (Seoul)","ホテル・場所の名前（ソウル）","酒店或地点名称（首尔）","飯店或地點名稱（首爾）","Nombre del hotel o lugar (Seúl)"),
 pkOut:T6("서울 밖이라 고를 수 없어요","Outside Seoul — can't be chosen","ソウル市外のため選べません","在首尔以外，无法选择","在首爾以外，無法選擇","Fuera de Seúl: no se puede elegir"),
 pkChg:T6("바꾸기","Change","変更","更改","更改","Cambiar"),
 pkAuto:T6("그날 숙소가 서울이 아니라 픽업 장소를 비워 두었어요. 골라 주세요.","Your lodging that day isn't in Seoul, so the pickup is left blank. Please choose one.","その日の宿がソウルではないため、お迎え場所は空けてあります。選んでください。","当天的住处不在首尔，上车地点暂未填写，请选择。","當天的住處不在首爾，上車地點暫未填寫，請選擇。","Tu alojamiento de ese día no está en Seúl, así que dejamos la recogida en blanco. Elige una."),
 ePick:T6("픽업 장소를 골라 주세요.","Please choose a pickup place.","お迎え場所を選んでください。","请选择上车地点。","請選擇上車地點。","Elige el lugar de recogida."),
 ePkZ:T6("픽업은 서울 지역이나 인천·김포공항에서만 할 수 있어요.","Pickup is only in Seoul or at Incheon or Gimpo Airport.","お迎えはソウル市内か仁川・金浦空港のみです。","仅可在首尔市内或仁川·金浦机场上车。","僅可在首爾市內或仁川·金浦機場上車。","La recogida solo es en Seúl o en los aeropuertos de Incheon y Gimpo."),
 ds:T6("목적지","Destinations","目的地","目的地","目的地","Destinos"),
 dsn:T6("가고 싶은 곳을 찾아 넣고, ☰를 끌어 순서를 바꿔요. 폰은 꾹 눌러 끌어요.","Search and add the places you want to go. Drag ☰ to change the order (on a phone, press and hold, then drag).","行きたい場所を検索して追加し、☰をドラッグして順番を変えます（スマホは長押ししてドラッグ）。","搜索并添加想去的地方，拖动☰调整顺序（手机上请长按后拖动）。","搜尋並加入想去的地方，拖動☰調整順序（手機上請長按後拖動）。","Busca y añade los lugares a los que quieres ir. Arrastra ☰ para cambiar el orden (en el móvil, mantén pulsado y arrastra)."),
 dsPh:T6("목적지 이름 (예: 남이섬)","Destination (e.g. Nami Island)","目的地の名前（例：南怡島）","目的地名称（例：南怡岛）","目的地名稱（例：南怡島）","Destino (p. ej., isla Nami)"),
 find:T6("찾기","Search","検索","搜索","搜尋","Buscar"),
 add:T6("넣기","Add","追加","添加","加入","Añadir"),
 added:T6("넣음","Added","追加済み","已添加","已加入","Añadido"),
 pick:T6("고르기","Choose","選ぶ","选择","選擇","Elegir"),
 srch:T6("찾는 중…","Searching…","検索中…","正在查找…","正在搜尋…","Buscando…"),
 none:T6("찾은 곳이 없어요. 다른 이름으로 찾아 보세요.","No places found. Try another name.","見つかりませんでした。別の名前で検索してください。","没有找到，请换个名称搜索。","沒有找到，請換個名稱搜尋。","No se encontró nada. Prueba con otro nombre."),
 err:T6("잠시 뒤 다시 해 주세요.","Please try again shortly.","しばらくしてからもう一度お試しください。","请稍后再试。","請稍後再試。","Vuelve a intentarlo en un momento."),
 dsE:T6("목적지를 하나 이상 넣어 주세요.","Add at least one destination.","目的地を1つ以上追加してください。","请至少添加一个目的地。","請至少加入一個目的地。","Añade al menos un destino."),
 dmax:T6("목적지는 {n}곳까지 넣을 수 있어요.","You can add up to {n} destinations.","目的地は{n}か所まで追加できます。","最多可添加{n}个目的地。","最多可加入{n}個目的地。","Puedes añadir hasta {n} destinos."),
 jeju:T6("제주는 섬이라 갈 수 없어요","Jeju is an island — the car can't go there","済州は島のため行けません","济州是岛屿，无法前往","濟州是島嶼，無法前往","Jeju es una isla: el coche no puede ir"),
 zno:T6("갈 수 없는 곳이에요","We can't go to this place","行けない場所です","无法前往此地","無法前往此地","No podemos ir a este lugar"),
 eBad:T6("갈 수 없는 목적지가 있어요. 빼고 다시 해 주세요.","Some destinations can't be reached. Remove them and try again.","行けない目的地があります。外してからもう一度お試しください。","有无法前往的目的地，请删除后再试。","有無法前往的目的地，請刪除後再試。","Hay destinos a los que no podemos ir. Quítalos e inténtalo de nuevo."),
 zchk:T6("지역 확인 중…","Checking the area…","地域を確認中…","正在确认区域…","正在確認區域…","Comprobando la zona…"),
 eNet:T6("목적지 지역을 확인하지 못했어요. 잠시 뒤 다시 해 주세요.","We couldn't check the destination areas. Please try again shortly.","目的地の地域を確認できませんでした。しばらくしてからもう一度お試しください。","无法确认目的地所在区域，请稍后再试。","無法確認目的地所在區域，請稍後再試。","No pudimos comprobar la zona de los destinos. Vuelve a intentarlo en un momento."),
 dl:T6("기사 언어","Driver's language","ドライバーの言語","司机语言","司機語言","Idioma del conductor"),
 dln:T6("기본 회화 수준이며 추가 요금은 없어요.","Basic conversation level, no extra charge.","日常会話レベルで、追加料金はかかりません。","基本会话水平，不另收费。","基本會話水準，不另收費。","Nivel de conversación básica, sin coste extra."),
 memo:T6("요청 사항","Requests","ご要望","备注","備註","Peticiones"),
 memoPh:T6("예: 아이 카시트, 공항 터미널·편명, 내릴 곳","e.g. child seat, airport terminal & flight no., where to drop you off","例：チャイルドシート、空港のターミナル・便名、降りる場所","例：儿童安全座椅、机场航站楼·航班号、下车地点","例：兒童安全座椅、機場航廈·航班號、下車地點","p. ej.: silla infantil, terminal y n.º de vuelo, dónde dejarte"),
 zone:T6("구간 가격 (차 1대 · 하루 10시간)","Price by area (1 car · 10 hours)","エリア別料金（車1台・10時間）","按区域计价（1辆车·10小时）","按區域計價（1輛車·10小時）","Precio por zona (1 coche · 10 horas)"),
 zrule:T6("목적지 가운데 가장 먼 곳의 구간으로 정해져요. 기름값·고속도로 통행료가 들어 있어요.","Set by the farthest destination. Fuel and highway tolls are included.","目的地のうち最も遠い場所のエリアで決まります。燃料代・高速道路料金込みです。","按目的地中最远的地点所在区域计价，含油费和高速公路费。","按目的地中最遠的地點所在區域計價，含油費和高速公路費。","Se fija por el destino más lejano. Incluye combustible y peajes."),
 zeast:T6("동해안은 속초·양양·강릉·동해·삼척·고성이에요. 제주는 갈 수 없어요.","East coast means Sokcho, Yangyang, Gangneung, Donghae, Samcheok and Goseong. No trips to Jeju.","東海岸は束草・襄陽・江陵・東海・三陟・高城です。済州へは行けません。","东海岸指束草、襄阳、江陵、东海、三陟、高城。无法前往济州。","東海岸指束草、襄陽、江陵、東海、三陟、高城。無法前往濟州。","La costa este es Sokcho, Yangyang, Gangneung, Donghae, Samcheok y Goseong. No vamos a Jeju."),
 zfar:T6("가장 먼 목적지: {p}","Farthest destination: {p}","最も遠い目的地：{p}","最远的目的地：{p}","最遠的目的地：{p}","Destino más lejano: {p}"),
 ex:T6("손님이 따로 내는 것","You pay separately","別途お支払いいただくもの","需您另付的费用","需您另付的費用","Lo pagas aparte"),
 drvH:T6("기사 안내","About your driver","ドライバーについて","关于司机","關於司機","Sobre el conductor"),   // 11-14 사장님 「클룩이나 타 사이트를 모방 — 기사만·기본 회화 · 투어 가이드 예약 링크」
 drv1:T6("운전 기사 전용 서비스입니다. 기사는 관광지 안내·해설을 하지 않습니다.","This is a driver-only service. The driver does not act as a tour guide.","ドライバーのみのサービスです。ドライバーは観光地の案内・解説を行いません。","本服务仅含司机，司机不提供景点导览和讲解。","本服務僅含司機，司機不提供景點導覽和講解。","Es un servicio solo de conductor. El conductor no hace de guía turístico."),
 drv2:T6("기사는 선택한 언어로 기본 회화만 할 수 있습니다.","The driver speaks basic conversational language in the language you choose.","ドライバーは選んだ言語で簡単な会話のみ可能です。","司机可用您选择的语言进行简单日常对话。","司機可用您選擇的語言進行簡單日常對話。","El conductor habla a nivel básico en el idioma que elijas."),
 gq:T6("관광지 안내가 필요하신가요? 공인 자격을 갖춘 관광통역안내사를 따로 예약할 수 있어요.","Need a tour guide? You can book an officially licensed tour guide separately.","観光案内が必要ですか？国家資格を持つ通訳案内士を別途予約できます。","需要导游讲解吗？可另行预约持有官方资格的导游。","需要導遊講解嗎？可另行預約持有官方資格的導遊。","¿Necesitas un guía? Puedes reservar aparte un guía turístico con licencia oficial."),   // 11-14 사장님 「공인 자를 추가해」
 gbtn:T6("투어 가이드 예약 ›","Book a tour guide ›","ツアーガイドを予約 ›","预约导游 ›","預約導遊 ›","Reservar un guía ›"),
 exl:[T6("관광 안내·통역 (필요하면 투어 가이드를 따로 예약)","Tour guiding & interpretation (book a tour guide separately if needed)","観光案内・通訳（必要ならツアーガイドを別途予約）","导游讲解·翻译（如有需要请另行预约导游）","導遊講解·翻譯（如有需要請另行預約導遊）","Guía turístico e interpretación (resérvalo aparte si lo necesitas)"),
   T6("기사 식사 (점심·저녁 — 손님이 사 주세요)","Driver's meals (lunch and dinner — please treat your driver)","ドライバーの食事（昼食・夕食 — お客様のご負担）","司机餐费（午餐·晚餐 — 请您请司机用餐）","司機餐費（午餐·晚餐 — 請您請司機用餐）","Comidas del conductor (almuerzo y cena — invítale tú)"),
   T6("주차비","Parking fees","駐車料金","停车费","停車費","Aparcamiento"),
   T6("입장료","Admission fees","入場料","门票","門票","Entradas"),
   T6("손님 식사","Your own meals","お客様の食事","您的餐费","您的餐費","Tus comidas"),
   T6("10시간이 넘으면 1시간에 30,000원","Over 10 hours: ₩30,000 per hour","10時間を超えると1時間30,000ウォン","超过10小时，每小时30,000韩元","超過10小時，每小時30,000韓元","Más de 10 horas: ₩30.000 por hora"),
   T6("밤 10시~아침 7시는 1시간에 50,000원 (현장에서 기사에게)","10 p.m.–7 a.m.: ₩50,000 per hour (paid to the driver on site)","夜10時〜朝7時は1時間50,000ウォン（現地でドライバーに）","晚上10点~早上7点，每小时50,000韩元（现场付给司机）","晚上10點~早上7點，每小時50,000韓元（現場付給司機）","De 22:00 a 7:00: ₩50.000 por hora (se paga al conductor en el momento)"),
   T6("가이드 (필요하면 「가이드 인솔」을 따로 예약)","A guide (if you need one, book “Travel with Guide” separately)","ガイド（必要なら「ガイド同行」を別途ご予約）","导游（如需要，请另外预约「向导陪同」）","導遊（如需要，請另外預約「嚮導陪同」）","Guía (si lo necesitas, reserva «Viaje con guía» aparte)")],
 exS:T6("기사 식사·주차비·입장료 별도","Driver's meals, parking & admission extra","ドライバーの食事・駐車料金・入場料は別途","司机餐费·停车费·门票另付","司機餐費·停車費·門票另付","Comidas del conductor, aparcamiento y entradas aparte"),
 lead:T6("이용 3일 전까지 예약할 수 있어요. 여러 날 이용하려면 날마다 하나씩 예약해 주세요.","Book at least 3 days ahead. For several days, book each day separately.","ご利用の3日前まで予約できます。複数日ご利用の場合は、1日ずつご予約ください。","需在使用日前3天预约。如需多天使用，请每天分别预约。","需在使用日前3天預約。如需多天使用，請每天分別預約。","Reserva con al menos 3 días de antelación. Para varios días, reserva cada día por separado."),
 eLead:T6("이용 3일 전까지만 예약할 수 있어요. {d}부터 고를 수 있어요.","Bookings close 3 days before. You can choose from {d}.","ご利用の3日前までのご予約です。{d}から選べます。","需提前3天预约，可选择{d}及以后的日期。","需提前3天預約，可選擇{d}及以後的日期。","Las reservas cierran 3 días antes. Puedes elegir desde el {d}."),
 ePrice:T6("가격이 바뀌었어요: {p}. 확인하고 다시 눌러 주세요.","The price has changed: {p}. Please check and tap again.","料金が変わりました：{p}。ご確認のうえもう一度押してください。","价格已变为：{p}。请确认后再点一次。","價格已變為：{p}。請確認後再點一次。","El precio cambió: {p}. Revísalo y vuelve a pulsar."),
 cfc:T6("무료 취소 2일 전 17시까지","Free cancellation until 5 p.m. 2 days before","2日前の17時まで無料キャンセル","提前2天17点前可免费取消","提前2天17點前可免費取消","Cancelación gratis hasta las 17:00 de 2 días antes"),
 kind:T6("기사 포함","Car with driver","ドライバー付き","含司机","含司機","Coche con conductor"),
 cap:T6("차 1대 · 최대 {n}명","1 car · up to {n} people","車1台・最大{n}名","1辆车·最多{n}人","1輛車·最多{n}人","1 coche · hasta {n} personas"),
 rf1:T6("이용 2일 전 17시(한국 시간)까지 취소: 전액 환불","Cancel by 5 p.m. (Korea time) 2 days before: full refund","ご利用2日前の17時（韓国時間）までの取消：全額返金","使用日前2天17点（韩国时间）前取消：全额退款","使用日前2天17點（韓國時間）前取消：全額退款","Hasta las 17:00 (hora de Corea) de 2 días antes: reembolso total"),
 rf2:T6("그 뒤 취소하거나 나오지 않으면 환불하지 않아요","After that, or if you don't show up: no refund","それ以降の取消・不参加：返金なし","之后取消或未到场：不予退款","之後取消或未到場：不予退款","Después, o si no te presentas: sin reembolso"),
 rf3:T6("회사 사정으로 운행하지 못하면 전액 환불해요.","If we can't run the trip for reasons on our side, you get a full refund.","会社の都合で運行できない場合は全額返金します。","如因本公司原因无法出车，将全额退款。","如因本公司原因無法出車，將全額退款。","Si no podemos hacer el viaje por motivos nuestros, te devolvemos todo."),
 meet:T6("픽업 장소","Pickup","お迎え場所","上车地点","上車地點","Recogida"),
 meetD:T6("서울 안 숙소·장소나 인천·김포공항 중에서 예약할 때 골라요. 기사가 시작 시각에 맞춰 기다려요.","A hotel or place in Seoul, or Incheon or Gimpo Airport — you choose when booking. Your driver waits for you at the start time.","ソウル市内のホテル・場所、または仁川・金浦空港 — ご予約時に選びます。ドライバーが開始時刻に合わせてお待ちします。","首尔市内的酒店或地点，或仁川·金浦机场 — 预约时选择。司机会按开始时间等候您。","首爾市內的飯店或地點，或仁川·金浦機場 — 預約時選擇。司機會按開始時間等候您。","Un hotel o lugar de Seúl, o el aeropuerto de Incheon o Gimpo: lo eliges al reservar. El conductor te espera a la hora de inicio."),
 d1:T6("기사가 시작 시각에 픽업 장소에서 기다려요.","Your driver waits at the pickup place at the start time.","ドライバーが開始時刻にお迎え場所でお待ちします。","司机会在开始时间于上车地点等候。","司機會在開始時間於上車地點等候。","El conductor te espera en el lugar de recogida a la hora de inicio."),
 d2:T6("기사 이름·전화·차 번호는 확정 메일과 「내 예약」에 있어요.","Your driver's name, phone and car plate are in the confirmation email and in “My bookings”.","ドライバーの名前・電話・車両番号は確定メールと「私の予約」にあります。","司机姓名、电话和车牌号会写在确认邮件和「我的预约」中。","司機姓名、電話和車牌號會寫在確認郵件和「我的預約」中。","El nombre, teléfono y matrícula del conductor están en el correo de confirmación y en «Mis reservas»."),
 d3:T6("늦을 것 같으면 기사에게 바로 전화해 주세요.","Running late? Call your driver right away.","遅れそうな場合は、すぐにドライバーへお電話ください。","如可能迟到，请立即致电司机。","如可能遲到，請立即致電司機。","¿Llegas tarde? Llama enseguida al conductor."),
 tot:T6("합계","Total","合計","合计","合計","Total"),
 // 결제창 주문 줄
 rPk:T6("픽업","Pickup","お迎え","上车","上車","Recogida"),
 rDs:T6("목적지","Destinations","目的地","目的地","目的地","Destinos"),
 rZ:T6("구간","Area","エリア","区域","區域","Zona"),
 lugN:T6("{n}개","{n}","{n}個","{n}件","{n}件","{n}"),
 cpn:T6("입력한 이름·이메일·전화는 예약 안내와 기사 연결에만 사용합니다. 기사가 정해지면 기사에게 이름과 전화가 전달됩니다.","Your name, email and phone are used only for booking updates and to connect you with your driver. Once a driver is assigned, your name and phone are passed to the driver.","入力したお名前・メール・電話は、予約のご案内とドライバーとの連絡にのみ使います。ドライバーが決まると、お名前と電話番号をドライバーにお伝えします。","您填写的姓名、邮箱和电话仅用于预约通知和联系司机。司机确定后，会将您的姓名和电话转交给司机。","您填寫的姓名、電子郵件和電話僅用於預約通知和聯絡司機。司機確定後，會將您的姓名和電話轉交給司機。","Tu nombre, correo y teléfono solo se usan para avisarte de la reserva y ponerte en contacto con el conductor. Cuando asignemos un conductor, le pasaremos tu nombre y teléfono."),
 sent:T6("예약을 받았어요. 기사가 정해지면 기사 이름·전화·차 번호를 메일로 보내 드려요. 「내 예약」에서도 볼 수 있어요.","Your booking is received. Once a driver is assigned, we'll email you the driver's name, phone and car plate. You can also see them in “My bookings”.","ご予約を受け付けました。ドライバーが決まり次第、名前・電話・車両番号をメールでお送りします。「私の予約」でも確認できます。","已收到您的预约。司机确定后，我们会通过邮件发送司机姓名、电话和车牌号，也可在「我的预约」中查看。","已收到您的預約。司機確定後，我們會以電子郵件寄送司機姓名、電話和車牌號，也可在「我的預約」中查看。","Hemos recibido tu reserva. Cuando asignemos un conductor, te enviaremos por correo su nombre, teléfono y matrícula. También lo verás en «Mis reservas»."),
 // 바우처
 vt:T6("차량 대절 바우처","Car charter voucher","貸切チャーター バウチャー","包车凭证","包車憑證","Bono del coche con conductor"),
 drvW:T6("기사 배정을 기다리는 중이에요. 정해지면 메일로 알려 드려요.","Waiting for a driver to be assigned. We'll email you once one is set.","ドライバーの手配をお待ちください。決まり次第メールでお知らせします。","正在安排司机，确定后会通过邮件通知您。","正在安排司機，確定後會以電子郵件通知您。","Esperando la asignación del conductor. Te avisaremos por correo."),
 drv:T6("기사","Driver","ドライバー","司机","司機","Conductor"),
 tel:T6("전화","Phone","電話","电话","電話","Teléfono"),
 car:T6("차량 번호","Car plate","車両番号","车牌号","車牌號","Matrícula"),
 ppl:T6("인원","People","人数","人数","人數","Personas"),
 pplN:T6("{n}명","{n}","{n}名","{n}人","{n}人","{n}"),
 // 교통 창 광고 띠 · 일정표 단추
 adT:T6("차량 대절 · 하루 30만 원부터 · 원하는 곳 어디든","Private Car Charter · from ₩300,000 a day · anywhere you want","貸切チャーター・1日30万ウォンから・行きたい所どこへでも","包车 · 每天30万韩元起 · 想去哪里都行","包車 · 每天30萬韓元起 · 想去哪裡都行","Coche privado con conductor · desde ₩300.000 al día · a donde quieras"),
 adGo:T6("자세히","Details","詳しく","详情","詳情","Ver más"),
 adMy:T6("내 차량 대절 예약 {n}건","My car charter bookings ({n})","貸切チャーターの予約（{n}件）","我的包车预约（{n}）","我的包車預約（{n}）","Mis reservas de coche privado ({n})"),   // 11-11 사장님 「가로 하자」 — 교통 화면에서 바로 내 예약
 bkd:T6("차량 대절 예약됨","Car charter booked","貸切チャーター予約済み","已预约包车","已預約包車","Coche reservado"),
 pf:T6("일정표의 {d} 장소 {n}곳을 목적지로 넣었어요. 빼거나 순서를 바꿀 수 있어요.","We added {n} places from your plan for {d} as destinations. You can remove them or change the order.","日程表の{d}の場所{n}か所を目的地に入れました。外したり順番を変えたりできます。","已将行程表中{d}的{n}个地点设为目的地，可删除或调整顺序。","已將行程表中{d}的{n}個地點設為目的地，可刪除或調整順序。","Añadimos como destinos {n} lugares de tu plan del {d}. Puedes quitarlos o cambiar el orden.")
};

// ── 프라이빗 카투어 글 (11-14) — 정해진 코스 · 가이드(DMZ 포함 · 나머지 선택) · DMZ 입장권 ──
var TC={
 crsH:T6("코스","Route","コース","路线","路線","Ruta"),
 opH:T6("코스 선택","Choose a route","コースを選ぶ","选择路线","選擇路線","Elige la ruta"),
 fix:T6("정해진 코스라 장소와 순서는 변경할 수 없어요. 코스를 직접 짜고 싶으면 「가이드 인솔 자유여행」을 이용하세요.","This is a set route, so the places and their order can't be changed. To plan your own route, use “Travel with Guide”.","決まったコースのため、場所と順番は変えられません。コースを自分で決めたい場合は「ガイド同行の自由旅行」をご利用ください。","这是固定路线，景点和顺序不能更改。如想自己安排路线，请使用「向导陪同自由行」。","這是固定路線，景點和順序不能更改。如想自己安排路線，請使用「嚮導陪同自由行」。","Es una ruta fija: no se pueden cambiar los lugares ni el orden. Si quieres armar tu propia ruta, usa «Viaje con guía»."),
 fixB:T6("가이드 인솔 자유여행 ›","Travel with Guide ›","ガイド同行の自由旅行 ›","向导陪同自由行 ›","嚮導陪同自由行 ›","Viaje con guía ›"),
 day:T6("{n}일차","Day {n}","{n}日目","第{n}天","第{n}天","Día {n}"),
 tmn:T6("코스 출발 시각 (변경 불가)","Route start time (can't be changed)","コースの出発時刻（変更できません）","路线出发时间（不可更改）","路線出發時間（不可更改）","Hora de salida de la ruta (no se puede cambiar)"),
 hrs:T6("픽업부터 {n}시간","{n} hours from pickup","お迎えから{n}時間","从接您起{n}小时","從接您起{n}小時","{n} horas desde la recogida"),
 hrs2:T6("{d}일 · 매일 픽업부터 {n}시간","{d} days · {n} hours a day from pickup","{d}日間・毎日お迎えから{n}時間","{d}天·每天从接您起{n}小时","{d}天·每天從接您起{n}小時","{d} días · {n} horas al día desde la recogida"),
 pkn:T6("서울 시내 숙소에서 픽업하고, 종료 후 같은 장소에서 하차해요.","We pick you up at your hotel in Seoul and drop you back there at the end.","ソウル市内のホテルでお迎えし、終わったら同じ場所までお送りします。","在首尔市内的住处接您，结束后送回原处。","在首爾市內的住處接您，結束後送回原處。","Te recogemos en tu hotel en Seúl y al final te dejamos allí mismo."),
 ePkZ:T6("픽업은 서울 시내 숙소에서만 가능해요.","Pickup is only at a hotel in Seoul.","お迎えはソウル市内のホテルのみです。","仅可在首尔市内的住处上车。","僅可在首爾市內的住處上車。","Solo recogemos en hoteles de Seúl."),
 gH:T6("가이드","Guide","ガイド","导游","導遊","Guía"),
 gInc:T6("공인 자격을 갖춘 관광통역안내사가 동행하며 안내해요 (가격에 포함).","A licensed tour guide comes along and explains everything (included in the price).","公認資格を持つ通訳案内士が同行して案内します（料金に含まれます）。","持证导游全程陪同讲解（已含在价格中）。","持證導遊全程陪同講解（已含在價格中）。","Te acompaña un guía turístico con licencia (incluido en el precio)."),
 gOff:T6("기사만 (관광 안내 없음)","Driver only (no guiding)","ドライバーのみ（観光案内なし）","仅司机（无讲解）","僅司機（無講解）","Solo conductor (sin guía)"),
 gOn:T6("가이드 추가 +{p}","Add a guide +{p}","ガイドを追加 +{p}","加导游 +{p}","加導遊 +{p}","Añadir guía +{p}"),
 gOpn:T6("기사는 운전만 하고 관광 안내는 하지 않아요. 안내가 필요하면 공인 자격을 갖춘 관광통역안내사를 추가할 수 있어요 (하루 {p}).","The driver only drives and doesn't guide. If you'd like explanations, add a licensed tour guide ({p} a day).","ドライバーは運転のみで観光案内はしません。案内が必要なら、公認資格を持つ通訳案内士を追加できます（1日{p}）。","司机只负责驾驶，不提供讲解。如需讲解，可加持证导游（每天{p}）。","司機只負責駕駛，不提供講解。如需講解，可加持證導遊（每天{p}）。","El conductor solo conduce y no hace de guía. Si quieres explicaciones, añade un guía turístico con licencia ({p} al día)."),
 dlG:T6("기사·가이드 언어","Driver & guide language","ドライバー・ガイドの言語","司机·导游语言","司機·導遊語言","Idioma del conductor y del guía"),
 prH:T6("가격 (차 1대)","Price (1 car)","料金（車1台）","价格（1辆车）","價格（1輛車）","Precio (1 coche)"),
 prT:T6("DMZ 입장권 {n}명 × {p}","DMZ admission {n} × {p}","DMZ入場券 {n}名 × {p}","DMZ门票 {n}人 × {p}","DMZ門票 {n}人 × {p}","Entrada a la DMZ {n} × {p}"),
 prG:T6("가이드 {d}일 × {p}","Guide {d} day(s) × {p}","ガイド {d}日 × {p}","导游 {d}天 × {p}","導遊 {d}天 × {p}","Guía {d} día(s) × {p}"),
 prGi:T6("가이드 (포함)","Guide (included)","ガイド（込み）","导游（已含）","導遊（已含）","Guía (incluido)"),
 incH:T6("포함 사항","Included","料金に含まれるもの","价格包含","價格包含","Incluido"),
 inc1:T6("차·기사·기름값·통행료·주차비·기사 식사","Car, driver, fuel, tolls, parking and the driver's meals","車・ドライバー・燃料代・高速料金・駐車料金・ドライバーの食事","车辆·司机·油费·过路费·停车费·司机餐费","車輛·司機·油費·過路費·停車費·司機餐費","Coche, conductor, combustible, peajes, aparcamiento y comidas del conductor"),
 inc2:T6("서울 숙소 픽업·하차","Pickup and drop-off at your hotel in Seoul","ソウルのホテルへのお迎え・お送り","首尔住处接送","首爾住處接送","Recogida y regreso a tu hotel en Seúl"),
 incG:T6("관광통역안내사 (가이드)","Licensed tour guide","通訳案内士（ガイド）","持证导游","持證導遊","Guía turístico con licencia"),
 incT:T6("DMZ 입장권 (공식 셔틀·모노레일)","DMZ admission (official shuttle & monorail)","DMZ入場券（公式シャトル・モノレール）","DMZ门票（官方班车·单轨车）","DMZ門票（官方接駁車·單軌車）","Entrada a la DMZ (lanzadera oficial y monorraíl)"),
 incS:T6("기사 숙박·식사","Driver's accommodation and meals","ドライバーの宿泊・食事","司机住宿·餐费","司機住宿·餐費","Alojamiento y comidas del conductor"),
 exl:[T6("관광지 입장료","Admission to attractions","観光地の入場料","景点门票","景點門票","Entradas a los lugares"),T6("손님 식사","Your own meals","お客様の食事","您的餐费","您的餐費","Tus comidas"),T6("여행자보험(필요 시 개인 가입)","Travel insurance (buy your own if needed)","旅行保険（必要な方は各自ご加入）","旅行保险（如有需要请自行购买）","旅遊保險（如有需要請自行購買）","Seguro de viaje (si lo necesitas, contrátalo por tu cuenta)"),
   T6("이용 시간 초과 시 1시간에 30,000원 · 밤 10시 이후 1시간에 50,000원 (현장에서 기사에게 지불)","Over the hours: ₩30,000 per hour · after 10 p.m.: ₩50,000 per hour (paid to the driver on site)","時間を超えると1時間30,000ウォン・夜10時以降は1時間50,000ウォン（現地でドライバーに）","超时每小时30,000韩元·晚上10点后每小时50,000韩元（现场付给司机）","超時每小時30,000韓元·晚上10點後每小時50,000韓元（現場付給司機）","Si te pasas de las horas: ₩30.000 por hora · después de las 22:00: ₩50.000 por hora (se paga al conductor en el momento)")],
 exT:T6("곤돌라 이용료 (1명 12,000원부터)","Gondola ride (from ₩12,000 per person)","ゴンドラ料金（1名12,000ウォンから）","缆车费用（每人12,000韩元起）","纜車費用（每人12,000韓元起）","Teleférico (desde ₩12.000 por persona)"),
 exS:T6("손님 숙박 (숙소 메뉴에서 검색 가능)","Your own accommodation (find it in the Stay menu)","お客様の宿泊（宿泊メニューで探せます）","您的住宿（可在住宿菜单中查找）","您的住宿（可在住宿選單中查找）","Tu alojamiento (búscalo en el menú de alojamiento)"),
 exP:T6("입장료·손님 식사 별도","Admission & your meals extra","入場料・お客様の食事は別途","门票·您的餐费另付","門票·您的餐費另付","Entradas y tus comidas aparte"),
 exPT:T6("곤돌라·손님 식사 별도","Gondola & your meals extra","ゴンドラ・お客様の食事は別途","缆车·您的餐费另付","纜車·您的餐費另付","Teleférico y tus comidas aparte"),
 eDmz:T6("DMZ는 월요일·주중 공휴일·설·추석 당일 휴무예요. 다른 날짜를 선택해 주세요.","The DMZ is closed on Mondays, weekday public holidays and on the days of Seollal and Chuseok. Please choose another date.","DMZは月曜日・平日の祝日・旧正月と秋夕の当日が休みです。別の日をお選びください。","DMZ逢周一、工作日公休日及春节·中秋当天休息，请选择其他日期。","DMZ逢週一、平日國定假日及春節·中秋當天休息，請選擇其他日期。","La DMZ cierra los lunes, los festivos entre semana y el día de Seollal y de Chuseok. Elige otra fecha."),
 eCrs:T6("상품 정보를 다시 불러와 주세요.","Please reload the tour details.","商品情報を読み込み直してください。","请重新加载产品信息。","請重新載入商品資訊。","Vuelve a cargar los datos del tour."),
 vt:T6("프라이빗 카투어 바우처","Private car tour voucher","プライベートカーツアー バウチャー","私人包车游凭证","私人包車遊憑證","Bono del tour privado en coche"),
 gW:T6("가이드 배정 대기 중이에요.","Waiting for a guide to be assigned.","ガイドの手配を待っています。","正在等待安排导游。","正在等待安排導遊。","Esperando a que se asigne un guía."),
 d1:T6("기사가 코스 출발 시각에 숙소 앞에서 대기해요.","Your driver waits in front of your hotel at the route's start time.","ドライバーがコースの出発時刻にホテルの前でお待ちします。","司机在路线出发时间于住处门口等候。","司機在路線出發時間於住處門口等候。","El conductor te espera frente a tu hotel a la hora de salida."),
 d1g:T6("기사와 가이드가 코스 출발 시각에 숙소 앞에서 대기해요.","Your driver and guide wait in front of your hotel at the route's start time.","ドライバーとガイドがコースの出発時刻にホテルの前でお待ちします。","司机和导游在路线出发时间于住处门口等候。","司機和導遊在路線出發時間於住處門口等候。","El conductor y el guía te esperan frente a tu hotel a la hora de salida."),
 d2:T6("기사(가이드 포함 상품은 가이드도) 이름·전화와 차량 번호는 확정 메일과 「내 예약」에서 확인할 수 있어요.","Your driver's (and guide's, if any) name, phone and the car plate are in your confirmation email and “My bookings”.","ドライバー（ガイドがいる場合はガイドも）の名前・電話と車両番号は、確定メールと「私の予約」にあります。","司机（如有导游也包括导游）的姓名·电话和车牌号会写在确认邮件和「我的预约」中。","司機（如有導遊也包括導遊）的姓名·電話和車牌號會寫在確認郵件和「我的預約」中。","El nombre y teléfono del conductor (y del guía, si lo hay) y la matrícula están en el correo de confirmación y en «Mis reservas»."),
 memo:T6("예: 유아 카시트, 큰 짐","e.g. child seat, large luggage","例：チャイルドシート、大きな荷物","例如：儿童安全座椅、大件行李","例如：兒童安全座椅、大件行李","p. ej., silla infantil, equipaje grande"),
 memoD:T6("동행자 전원의 여권 영문 이름·국적 (예: HONG GILDONG, USA)","English name (as on the passport) and nationality of everyone (e.g. JOHN SMITH, USA)","同行者全員のパスポートの英字氏名・国籍（例：TARO YAMADA, JAPAN）","所有同行者的护照英文姓名·国籍（例：ZHANG SAN, CHINA）","所有同行者的護照英文姓名·國籍（例：CHEN DAWEN, TAIWAN）","Nombre en inglés (como en el pasaporte) y nacionalidad de todos (p. ej., JUAN PEREZ, MEXICO)"),
 exH:T6("불포함 사항","Not included","含まれないもの","不包含","不包含","No incluido"),
 incd:T6("포함","Included","込み","已含","已含","Incluido"),
 gdN:T6("{d}일 × {p}","{d} day(s) × {p}","{d}日 × {p}","{d}天 × {p}","{d}天 × {p}","{d} día(s) × {p}"),
 tkL:T6("DMZ 입장권","DMZ admission","DMZ入場券","DMZ门票","DMZ門票","Entrada a la DMZ"),
 tkN:T6("{n}명 × {p}","{n} × {p}","{n}名 × {p}","{n}人 × {p}","{n}人 × {p}","{n} × {p}"),
 dlnG:T6("가이드는 선택한 언어로 안내하고, 기사는 기본 회화만 가능해요. 추가 요금은 없어요.","The guide explains in the language you choose; the driver speaks basic conversational language. No extra charge.","ガイドは選んだ言語で案内し、ドライバーは簡単な会話のみです。追加料金はありません。","导游用您选择的语言讲解，司机只能简单对话，不另收费。","導遊用您選擇的語言講解，司機只能簡單對話，不另收費。","El guía explica en el idioma que elijas; el conductor habla a nivel básico. Sin coste extra."),
 lead:T6("이용 3일 전까지 예약할 수 있어요.","Book at least 3 days ahead.","ご利用の3日前まで予約できます。","需在使用日前3天预约。","需在使用日前3天預約。","Reserva con al menos 3 días de antelación."),
 sentG:T6("예약이 접수되었어요. 기사와 가이드가 배정되면 이름·전화·차량 번호를 메일로 안내해 드려요. 「내 예약」에서도 확인할 수 있어요.","We've received your booking. Once your driver and guide are assigned, we'll email their names, phone numbers and the car plate. You can also see them in “My bookings”.","ご予約を受け付けました。ドライバーとガイドが決まり次第、名前・電話・車両番号をメールでお送りします。「私の予約」でも確認できます。","已收到您的预约。司机和导游确定后，我们会通过邮件告知姓名·电话·车牌号，也可在「我的预约」中查看。","已收到您的預約。司機和導遊確定後，我們會透過郵件告知姓名·電話·車牌號，也可在「我的預約」中查看。","Hemos recibido tu reserva. Cuando asignemos al conductor y al guía, te enviaremos por correo sus nombres, teléfonos y la matrícula. También lo verás en «Mis reservas».")
};

// ── 구간 — 시·도(1단계)·시·군·구(2단계) 이름 → ①~④ · 0 = 제주 · -1 = 모름 (허브 chr_hub.js chrZone 과 같은 규칙) ──
var EAST=["속초시","양양군","강릉시","동해시","삼척시","고성군"];
function zone(r1,r2){ var a=String(r1||"").replace(/\s/g,""), b=String(r2||"").trim().split(/\s+/)[0]||"";
  if(/^서울/.test(a)) return 1; if(/^(경기|인천)/.test(a)) return 2; if(/^강원/.test(a)) return EAST.indexOf(b)>=0?4:3;
  if(/^(충북|충남|충청|대전|세종)/.test(a)) return 3; if(/^(전북|전남|전라|광주|경북|경남|경상|부산|대구|울산)/.test(a)) return 4; if(/^제주/.test(a)) return 0; return -1; }
function zAddr(a){ var t=String(a||"").trim().split(/\s+/); if(!t[0]) return null; var z=zone(t[0],t[1]); return z<0?null:z; }   // 카카오 주소 「강원특별자치도 강릉시 …」 — 바로 어림
function zOf(d){ if(!d) return null; if(d.z!=null) return d.z; return zAddr(d.addr); }

// ── 상태 (날짜·시작 시각·인원은 상품 화면 S 그대로) ──
var CS={crs:"",ck:"",g:0,pf:null,pick:null,dests:[],dl:"",lug:0,memo:"",ps:false,pq:"",pr:null,pb:0,pe:0,q:"",r:null,b:0,e:0,qb:0,qe:"",note:"",msg:""};
function dlDef(){ var l=lg(), d=l==="ko"?"ko":l==="ja"?"ja":(l==="zhs"||l==="zht")?"zh":"en"; return DLS.indexOf(d)>=0?d:"en"; }
function dl(){ var v=CS.dl||dlDef(); return DLS.indexOf(v)>=0?v:dlDef(); }
function chg(q){ if(q) quote(); try{ document.dispatchEvent(new Event("chrchg")); }catch(e){} }
function S(){ try{ return window.SHOP&&SHOP.st?SHOP.st():null; }catch(e){ return null; } }
function minDate(){ return kstDay(LEAD); }
function is(p){ return !!(p&&(p.id===PID||isCrs(p.id))); }
// ── 프라이빗 카투어 (11-14) — 상품 화면이 고른 상품 id 로 use(id) → 코스면 목적지 = 코스 장소(바꿀 수 없음) · 차량 대절이면 원래대로 ──
function isCrs(id){ return !!(id&&CTD.crs&&CTD.crs[id]); }
function crsC(){ return CS.crs?CTD.crs[CS.crs]:null; }
function crsOp(){ var C=crsC(); if(!C) return null; return C.ops.filter(function(x){ return x.k===CS.ck; })[0]||C.ops[0]; }
function crsDests(op){ var o=[], L0=lg(); op.d.forEach(function(day,di){ day.forEach(function(k){ var s=CTD.stops[k]; if(s) o.push({k:k,ko:s.ko,en:s.en,nm:s[L0]||s.en,lat:s.lat,lng:s.lng,addr:"",z:op.z,dy:di}); }); }); return o; }
function crsFill(){ var op=crsOp(); if(!op) return; CS.dests=crsDests(op); try{ if(window.SHOP&&SHOP.set) SHOP.set({time:op.tm}); }catch(e){} }
function use(id){ if(isCrs(id)){ if(CS.crs!==id){ CS.crs=id; CS.ck=CTD.crs[id].ops[0].k; CS.g=0; CS.pf=null; if(CS.pick&&CS.pick.t!=="place") CS.pick=null; } crsFill(); return; }
  if(CS.crs){ CS.crs=""; CS.ck=""; CS.g=0; CS.dests=[]; CS.pf=null; } }
function crsDays(){ var op=crsOp(); return op?op.d.length:1; }
function crsAmt(){ var C=crsC(), op=crsOp(); if(!C||!op) return 0; var s=S(), n=(s&&s.n)||1; return op.p+(C.g==="opt"&&CS.g?CTD.guide*op.d.length:0)+(C.tk?C.tk*n:0); }
function dmzOk(d){ var C=crsC(); if(!C||!C.dmz||!d) return true; return new Date(d+"T00:00:00Z").getUTCDay()!==1&&CTD.dmzOff.indexOf(d)<0; }
function crsNm(id,k){ var C=CTD.crs&&CTD.crs[id]; if(!C) return ""; var op=C.ops.filter(function(x){ return x.k===k; })[0]; return L(C.t)+(op&&C.ops.length>1?" · "+L(op.n):""); }
function stopNm(d){ var s=d&&d.k&&CTD.stops[d.k]; return s?(s[lg()]||s.en):nmOf(d); }
function nmOf(x){ if(!x) return ""; if(lg()==="ko") return x.ko||x.nm||x.en||""; return x.nm||x.en||x.ko||""; }
function pkName(p){ if(!p) return ""; if(p.t==="icn"||p.t==="gmp") return L(AP[p.t].n); return nmOf(p); }
function dKey(d){ return (+d.lat).toFixed(5)+","+(+d.lng).toFixed(5); }
function fromKp(x){ var en=x.name_en||"", L0=lg(); return {ko:x.name||"",en:(L0==="en"||L0==="es")?(en||x.name||""):"",nm:L0==="ko"?(x.name||""):(en||x.name||""),lat:+x.y,lng:+x.x,addr:x.addr||""}; }
function norm(d){ d=d||{}; var o={ko:String(d.ko||d.nm||""),en:String(d.en||""),nm:String(d.nm||d.ko||d.en||""),lat:+d.lat,lng:+d.lng,addr:String(d.addr||"")}; if(d.k) o.k=String(d.k); if(d.z!=null) o.z=d.z; return o; }
function zMax(){ var z=0, bad=0, unk=0; CS.dests.forEach(function(d){ var q=zOf(d); if(q==null) unk++; else if(q<=0) bad++; else if(q>z) z=q; }); return {z:z,bad:bad,unk:unk}; }
function amount(){ if(CS.crs) return crsAmt(); var m=zMax(); return CS.dests.length&&!m.bad&&!m.unk&&m.z>0?PRICE[m.z]:0; }
function pickOk(){ var p=CS.pick; if(!p) return false; if(p.t!=="place") return !CS.crs; var z=zOf(p); return z===1; }
function dateOk(){ var s=S(); return !!(s&&s.date&&s.date>=minDate()&&dmzOk(s.date)); }
function ok(){ if(CS.crs) return !!crsOp()&&pickOk()&&dateOk()&&!CS.qb; return CS.dests.length>0&&!!amount()&&pickOk()&&dateOk()&&!CS.qb; }
function why(){ var s0=S(); if(CS.crs&&s0&&s0.date&&s0.date>=minDate()&&!dmzOk(s0.date)) return L(TC.eDmz); if(!dateOk()) return F(TX.eLead,{d:minDate()});
  if(CS.crs){ if(!CS.pick) return L(TX.ePick); if(!pickOk()) return CS.pick.z==null&&CS.pick.t==="place"?L(TX.zchk):L(TC.ePkZ); return CS.qb?(CS.qe?L(TX.eNet):L(TX.zchk)):""; } if(!CS.pick) return L(TX.ePick); if(!pickOk()) return CS.pick.z==null&&CS.pick.t==="place"?L(TX.zchk):L(TX.ePkZ); if(!CS.dests.length) return L(TX.dsE); var m=zMax(); if(m.bad) return L(TX.eBad); if(m.unk||CS.qb) return CS.qe?L(TX.eNet):L(TX.zchk); return ""; }

// ── 견적 (허브 /shop/chr/quote · 카카오 무료) — 목적지·픽업을 넣고 뺄 때마다 · 못 받으면 주소 어림 그대로(주문 때 허브가 다시 계산) ──
var QT=0, QSEQ=0;
function pkBody(p){ if(!p) return null; return p.t==="place"?{t:"place",ko:p.ko,en:p.en,nm:p.nm,lat:p.lat,lng:p.lng,addr:p.addr}:{t:p.t,nm:L(AP[p.t].n)}; }
function dBody(d){ return {ko:d.ko,en:d.en,nm:d.nm,lat:d.lat,lng:d.lng,addr:d.addr}; }
function quote(){ clearTimeout(QT); var need=CS.dests.some(function(d){ return d.z==null; })||(CS.pick&&CS.pick.t==="place"&&CS.pick.z==null); if(!need){ CS.qb=0; return; } CS.qb=1; QT=setTimeout(quote0,200); }
function quote0(){ var seq=++QSEQ, ds=CS.crs?[]:CS.dests.slice(), pk=CS.pick;   /* 코스는 픽업 지역만 확인 (11-14) */
  fetch(hub()+"/shop/chr/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chr:{pick:pkBody(pk),dests:ds.map(dBody)}})}).then(function(r){ return r.json(); }).then(function(j){ if(seq!==QSEQ) return; CS.qb=0;
    if(j&&j.ok&&Array.isArray(j.zs)){ CS.qe=""; ds.forEach(function(d,i){ if(typeof j.zs[i]==="number") d.z=j.zs[i]; }); if(pk&&pk.t==="place"&&typeof j.pz==="number"){ pk.z=j.pz; if(pk.z!==1&&pk.auto){ CS.pick=null; CS.note="pkAuto"; } } }
    else CS.qe=(j&&j.err)||"net";
    chg(); }).catch(function(){ if(seq!==QSEQ) return; CS.qb=0; CS.qe="net"; chg(); }); }

// ── 장소 찾기 (허브 /kplace · 카카오 무료) ──
// 우리 명소(PLACES — 6개 언어 이름) 먼저 + 허브 /kplace (교통 창 찾기와 같은 길 · 「Nami Island」처럼 외국어 이름도)
var MAPS=null;
function maps(){ if(MAPS) return MAPS; try{ if(window.CITY&&typeof window.mapLoad==="function") return MAPS=Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).catch(function(){}); }catch(e){} return Promise.resolve(); }
function own(q){ var nz=function(s){ return String(s||"").replace(/[\s·()\-_.,'’]/g,"").toLowerCase(); }, n=nz(q), out=[]; if(n.length<2||!window.PLACES) return out;
  for(var k in PLACES){ if(k.charAt(0)==="_") continue; var p=PLACES[k]; if(!p||!(+p.lat)) continue;
    if([p.ko,p.en,p.ja,p.zhs,p.zht,p.es].some(function(s){ var a=nz(s); return a&&(a.indexOf(n)>=0||(a.length>=3&&n.indexOf(a)>=0)); })) out.push({name:p.ko||"",name_en:lg()==="ko"?"":(p[lg()]||p.en||p.ko||""),addr:p.addr||"",x:+p.lng,y:+p.lat,cat:"",own:1,kk:nz(p.ko)===n?0:1}); }
  out.sort(function(a,b){ return a.kk-b.kk||a.name.length-b.name.length; }); return out.slice(0,3); }
function kq(q,cb){ var u=hub()+"/kplace?q="+encodeURIComponent(q)+(typeof window.kpL==="function"?kpL():(lg()==="ko"?"":"&lang=en"));
  maps().then(function(){ var o=own(q); if(o.length) cb(o);   // 우리 명소는 바로 보이고, 카카오 결과가 오면 더한다(외국어 검색은 허브가 한국어로 바꿔 찾느라 늦을 수 있다)
    fetch(u).then(function(r){ return r.json(); }).then(function(j){ var it=((j&&j.ok&&j.items)||[]).filter(function(x){ return !o.some(function(y){ return Math.abs(y.y-(+x.y))<0.0015&&Math.abs(y.x-(+x.x))<0.0015; }); }); cb(o.concat(it)); })
      .catch(function(){ cb(o.length?o:null); }); }); }
function srch(w){ var inp=document.getElementById(w==="p"?"chrPq":"chrDq"), q=inp?inp.value.trim():(w==="p"?CS.pq:CS.q); if(!q) return;
  if(w==="p"){ CS.pq=q; CS.pb=1; CS.pr=null; CS.pe=0; } else { CS.q=q; CS.b=1; CS.r=null; CS.e=0; } chg();
  try{ ntap("shop","chr_srch_"+w); }catch(e){}
  kq(q,function(a){ if(w==="p"){ if(CS.pq!==q) return; CS.pb=0; CS.pr=a?a.filter(function(x){ return isFinite(+x.y)&&!/주차장|입출구/.test(x.cat||""); }).slice(0,8):null; CS.pe=a?0:1; }
    else { if(CS.q!==q) return; CS.b=0; CS.r=a?a.filter(function(x){ return isFinite(+x.y)&&!/주차장|입출구/.test(x.cat||""); }).slice(0,10):null; CS.e=a?0:1; } chg(); }); }
function has(x){ var k=(+x.y).toFixed(5)+","+(+x.x).toFixed(5); return CS.dests.some(function(d){ return dKey(d)===k; }); }

// ── 예약 칸 (앱 결제 칸 · 홈페이지 오른쪽 예약 칸 같은 모양) ──
function rowsHtml(list,btn){ return list.map(function(x,i){ var en=lg()!=="ko"&&x.name_en, a=String(x.addr||""), ct=String((lg()!=="ko"&&x.cat_en)||x.cat||"").split(">").pop().trim();
  return '<div class="chr-sr"><div><b>'+esc(en?x.name_en:x.name)+'</b>'+(ct?' <i>'+esc(ct)+'</i>':'')+'<small>'+esc(a)+'</small></div>'+btn(x,i)+'</div>'; }).join(""); }
function resHtml(r,b,e,btn){ if(b) return '<p class="chr-nt">'+esc(L(TX.srch))+'</p>'; if(e) return '<p class="chr-nt">'+esc(L(TX.err))+'</p>'; if(!r) return ""; if(!r.length) return '<p class="chr-nt">'+esc(L(TX.none))+'</p>'; return '<div class="chr-res">'+rowsHtml(r,btn)+'</div>'; }
function zTag(d){ var z=zOf(d); if(z==null) return '<em class="chr-z u">'+esc(L(TX.zchk))+'</em>'; if(z===0) return '<em class="chr-z x">'+esc(L(TX.jeju))+'</em>'; if(z<0) return '<em class="chr-z x">'+esc(L(TX.zno))+'</em>'; return '<em class="chr-z">'+ZNO[z]+' '+esc(L(ZN[z]).replace(/\s*[（(].*$/,""))+'</em>'; }
function lugRow(){ return '<div class="chr-row"><span class="chr-lb">'+esc(L(TX.lug))+'</span><div class="chr-stp"><button type="button" data-chr="lug" data-v="-1" aria-label="-">−</button><b>'+CS.lug+'</b><button type="button" data-chr="lug" data-v="1" aria-label="+">+</button></div></div>'; }
function pickBlk(){ var p=CS.pick, h='<div class="chr-blk"><div class="chr-h3">'+esc(L(TX.pk))+'</div><p class="chr-nt">'+esc(L(CS.crs?TC.pkn:TX.pkn))+'</p>';
  if(CS.note==="pkAuto"&&!p) h+='<p class="chr-w">'+esc(L(TX.pkAuto))+'</p>';
  if(CS.crs){ if(!(p&&p.t==="place")) CS.ps=true; }   /* 코스(11-14) = 서울 숙소만 — 공항 단추 없이 바로 찾기 칸 */
  else h+='<div class="chr-chips"><button type="button" data-chr="ps" class="'+(CS.ps||(p&&p.t==="place")?"on":"")+'">'+esc(L(TX.pkS))+'</button><button type="button" data-chr="icn" class="'+(p&&p.t==="icn"?"on":"")+'">'+esc(L(AP.icn.n))+'</button><button type="button" data-chr="gmp" class="'+(p&&p.t==="gmp"?"on":"")+'">'+esc(L(AP.gmp.n))+'</button></div>';
  if(p) h+='<div class="chr-sel">'+ico()+'<b>'+esc(pkName(p))+'</b>'+(p.t==="place"?(p.z==null?'<em class="chr-z u">'+esc(L(TX.zchk))+'</em>':p.z!==1?'<em class="chr-z x">'+esc(L(TX.pkOut))+'</em>':''):'')+'<button type="button" data-chr="px" aria-label="'+esc(L(TX.pkChg))+'">✕</button></div>';
  if(CS.ps&&!(p&&p.t==="place")){ h+='<div class="chr-q"><input id="chrPq" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(L(TX.pkPh))+'" value="'+esc(CS.pq)+'"><button type="button" data-chr="pgo">'+esc(L(TX.find))+'</button></div>'
    +resHtml(CS.pr,CS.pb,CS.pe,function(x,i){ var z=zAddr(x.addr); return z!=null&&z!==1?'<span class="chr-no">'+esc(L(TX.pkOut))+'</span>':'<button type="button" class="chr-b" data-chr="pp" data-i="'+i+'">'+esc(L(TX.pick))+'</button>'; }); }
  return h+'</div>'; }
function destBlk(){ var h='<div class="chr-blk"><div class="chr-h3">'+esc(L(TX.ds))+' <small>'+CS.dests.length+' / '+DMAX+'</small></div>';
  if(CS.pf) h+='<p class="chr-ok">'+esc(F(TX.pf,{d:CS.pf.d,n:CS.pf.n}))+'</p>';
  h+='<p class="chr-nt">'+esc(L(TX.dsn))+'</p>';
  if(CS.dests.length) h+='<ol class="chr-dl">'+CS.dests.map(function(d,i){ return '<li class="chr-li" data-ci="'+i+'"><span class="chr-hd" aria-hidden="true">☰</span><span class="chr-no2">'+(i+1)+'</span><span class="chr-dn"><b>'+esc(nmOf(d))+'</b>'+zTag(d)+'</span><button type="button" class="chr-x" data-chr="dx" data-i="'+i+'" aria-label="✕">✕</button></li>'; }).join("")+'</ol>';
  if(CS.dests.length<DMAX) h+='<div class="chr-q"><input id="chrDq" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(L(TX.dsPh))+'" value="'+esc(CS.q)+'"><button type="button" data-chr="dgo">'+esc(L(TX.find))+'</button></div>'
    +resHtml(CS.r,CS.b,CS.e,function(x,i){ return has(x)?'<span class="chr-no">✓ '+esc(L(TX.added))+'</span>':'<button type="button" class="chr-b" data-chr="da" data-i="'+i+'">＋ '+esc(L(TX.add))+'</button>'; });
  else h+='<p class="chr-nt">'+esc(F(TX.dmax,{n:DMAX}))+'</p>';
  return h+'</div>'; }
function drvBlk(){ return '<div class="chr-blk chr-drv"><div class="chr-h3">'+esc(L(TX.drvH))+'</div><ul><li>'+esc(L(TX.drv1))+'</li><li>'+esc(L(TX.drv2))+'</li></ul><p class="chr-nt">'+esc(L(TX.gq))+'</p><button type="button" class="chr-gbtn" data-chr="guide">'+esc(L(TX.gbtn))+'</button></div>'; }   // 클룩식 「Driver only」 안내 + 가이드 인솔 예약으로
function dlBlk(lb){ var c=dl(); return '<div class="chr-blk"><div class="chr-h3">'+esc(L(lb||TX.dl))+'</div><div class="chr-chips c4" style="grid-template-columns:repeat('+DLS.length+',minmax(0,1fr))">'+DLS.map(function(k){ return '<button type="button" data-chr="dl" data-v="'+k+'" class="'+(c===k?"on":"")+'">'+esc(L(DLN[k]))+'</button>'; }).join("")+'</div><p class="chr-nt">'+esc(L(lb?TC.dlnG:TX.dln))+'</p></div>'; }
function memoBlk(){ var C=crsC(); return '<div class="chr-blk"><label class="chr-h3" for="chrMemo">'+esc(L(TX.memo))+'</label><textarea id="chrMemo" rows="'+(C&&C.dmz?3:2)+'" maxlength="500" placeholder="'+esc(L(C?(C.dmz?TC.memoD:TC.memo):TX.memoPh))+'">'+esc(CS.memo)+'</textarea></div>'; }
function zoneTbl(cur){ return '<div class="chr-zt">'+[1,2,3,4].map(function(z){ return '<div class="'+(cur===z?"on":"")+'"><span>'+ZNO[z]+' '+esc(L(ZN[z]))+'</span><b>'+won(PRICE[z])+'</b></div>'; }).join("")+'</div>'; }
function zoneBlk(){ var m=zMax(), far=null; CS.dests.forEach(function(d){ var z=zOf(d); if(z>0&&(!far||z>zOf(far))) far=d; });
  return '<div class="chr-blk"><div class="chr-h3">'+esc(L(TX.zone))+'</div>'+zoneTbl(m.bad||m.unk?0:m.z)
    +(far&&!m.bad&&!m.unk?'<p class="chr-ok">'+esc(F(TX.zfar,{p:nmOf(far)+" ("+ZNO[zOf(far)]+")"}))+'</p>':'')
    +'<p class="chr-nt">'+esc(L(TX.zrule))+'<br>'+esc(L(TX.zeast))+'</p></div>'; }
function exBlk(){ return '<div class="chr-blk chr-exb"><div class="chr-h3">'+esc(L(TX.ex))+'</div><ul>'+TX.exl.map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ul></div>'; }
// ── 프라이빗 카투어 칸 (11-14) — 코스 고르기 · 코스 장소(날마다) · 가이드 · 가격 · 포함/불포함 ──
function crsOpBlk(){ var C=crsC(); if(!C||C.ops.length<2) return ""; var op=crsOp();
  return '<div class="chr-blk"><div class="chr-h3">'+esc(L(TC.opH))+'</div><div class="chr-ops">'+C.ops.map(function(o){ return '<button type="button" data-chr="ck" data-v="'+esc(o.k)+'" class="'+(op&&op.k===o.k?"on":"")+'"><b>'+esc(L(o.n))+'</b><small>'+won(o.p)+'</small></button>'; }).join("")+'</div></div>'; }
function crsStops(op,cls){ var multi=op.d.length>1, h=''; op.d.forEach(function(day,di){ if(multi) h+='<div class="chr-dy">'+esc(F(TC.day,{n:di+1}))+'</div>'; h+='<ol class="chr-cs'+(cls?' '+cls:'')+'">'+day.map(function(k){ var s=CTD.stops[k]; return s?'<li>'+esc(s[lg()]||s.en)+'</li>':''; }).join("")+'</ol>'; }); return h; }
function crsStopBlk(){ var op=crsOp(); if(!op) return "";
  return '<div class="chr-blk"><div class="chr-h3">'+esc(L(TC.crsH))+' <small>'+esc(op.d.length>1?F(TC.hrs2,{d:op.d.length,n:op.h}):F(TC.hrs,{n:op.h}))+'</small></div>'+crsStops(op)
    +'<p class="chr-nt">'+esc(L(TC.fix))+'</p><button type="button" class="chr-gbtn" data-chr="guide">'+esc(L(TC.fixB))+'</button></div>'; }
function crsGBlk(){ var C=crsC(); if(!C) return ""; if(C.g==="inc") return '<div class="chr-blk chr-drv"><div class="chr-h3">'+esc(L(TC.gH))+'</div><p class="chr-ok">'+esc(L(TC.gInc))+'</p></div>';
  var gp=won(CTD.guide*crsDays());
  return '<div class="chr-blk chr-drv"><div class="chr-h3">'+esc(L(TC.gH))+'</div><p class="chr-nt">'+esc(F(TC.gOpn,{p:won(CTD.guide)}))+'</p><div class="chr-chips" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-chr="g" data-v="0" class="'+(CS.g?"":"on")+'">'+esc(L(TC.gOff))+'</button><button type="button" data-chr="g" data-v="1" class="'+(CS.g?"on":"")+'">'+esc(F(TC.gOn,{p:gp}))+'</button></div></div>'; }
function crsPrBlk(){ var C=crsC(), op=crsOp(); if(!C||!op) return ""; var s=S(), n=(s&&s.n)||1, r=function(a,b){ return '<div><span>'+esc(a)+'</span><b>'+b+'</b></div>'; };
  return '<div class="chr-blk"><div class="chr-h3">'+esc(L(TC.prH))+'</div><div class="chr-zt">'+r(L(C.t)+(C.ops.length>1?" · "+L(op.n):""),won(op.p))
    +(C.g==="inc"?r(L(TC.prGi),"—"):CS.g?r(F(TC.prG,{d:op.d.length,p:won(CTD.guide)}),won(CTD.guide*op.d.length)):"")
    +(C.tk?r(F(TC.prT,{n:n,p:won(C.tk)}),won(C.tk*n)):"")+'</div></div>'; }
function crsIncList(C,op,g){ return [TC.inc1,TC.inc2].concat(g?[TC.incG]:[]).concat(C.tk?[TC.incT]:[]).concat(op.d.length>1?[TC.incS]:[]); }
function crsExList(C,op){ return (C.tk?TC.exl.slice(1):TC.exl).concat(C.tk?[TC.exT]:[]).concat(op.d.length>1?[TC.exS]:[]); }
function crsExBlk(){ var C=crsC(), op=crsOp(); if(!C||!op) return ""; var g=C.g==="inc"||!!CS.g;
  return '<div class="chr-blk chr-exb"><div class="chr-h3">'+esc(L(TC.incH))+'</div><ul>'+crsIncList(C,op,g).map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ul><div class="chr-h3" style="margin-top:6px">'+esc(L(TC.exH))+'</div><ul>'+crsExList(C,op).map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ul></div>'; }
// 상품 화면 결제 칸에 넣는 것 — 날짜·시작 시각·인원 줄 다음, 합계 앞
function pickHtml(p){ if(!is(p)) return ""; use(p.id);
  if(CS.crs){ var C=crsC(); return '<div class="chr">'+crsOpBlk()+crsStopBlk()+lugRow()+pickBlk()+crsGBlk()+dlBlk(C&&(C.g==="inc"||CS.g)?TC.dlG:null)+memoBlk()+crsPrBlk()+crsExBlk()+'<p class="chr-nt">'+esc(L(TC.lead))+'</p>'+(why()?'<p class="chr-w" id="chrWhy">'+esc(why())+'</p>':'')+'</div>'; } return '<div class="chr">'+lugRow()+pickBlk()+destBlk()+drvBlk()+dlBlk()+memoBlk()+zoneBlk()+exBlk()+'<p class="chr-nt">'+esc(L(TX.lead))+'</p>'+(why()?'<p class="chr-w" id="chrWhy">'+esc(why())+'</p>':'')+'</div>'; }
// 결제창 주문 내용 줄
function payRows(p){ if(!is(p)) return ""; use(p.id); var r=function(a,b){ return '<div class="sl"><span>'+esc(L(a))+'</span><span>'+b+'</span></div>'; }, m=zMax();
  if(CS.crs){ var C=crsC(), op=crsOp(), s=S(), n=(s&&s.n)||1; if(!C||!op) return "";
    return (C.ops.length>1?r(TC.crsH,esc(L(op.n))):"")+r(TX.lug,esc(F(TX.lugN,{n:CS.lug})))+r(TX.rPk,esc(pkName(CS.pick)))+r(TC.crsH,'<div class="chr-pl">'+crsStops(op,"chr-csp")+'</div>')
      +r(TC.gH,esc(C.g==="inc"?L(TC.incd):CS.g?F(TC.gdN,{d:op.d.length,p:won(CTD.guide)}):L(TC.gOff)))+(C.tk?r(TC.tkL,esc(F(TC.tkN,{n:n,p:won(C.tk)}))):"")
      +r(C.g==="inc"||CS.g?TC.dlG:TX.dl,esc(L(DLN[dl()])))+(CS.memo?r(TX.memo,esc(CS.memo)):"")+'<div class="shpx chr-px">'+esc(L(C.tk?TC.exPT:TC.exP))+'</div>'; }
  return r(TX.lug,esc(F(TX.lugN,{n:CS.lug})))+r(TX.rPk,esc(pkName(CS.pick)))+r(TX.rDs,'<div class="chr-pl">'+CS.dests.map(function(d,i){ return (i+1)+". "+esc(nmOf(d)); }).join("<br>")+'</div>')+r(TX.dl,esc(L(DLN[dl()])))
    +(m.z?r(TX.rZ,esc(ZNO[m.z]+" "+L(ZN[m.z]))):"")+(CS.memo?r(TX.memo,esc(CS.memo)):"")+'<div class="shpx chr-px">'+esc(L(TX.exS))+'</div>'; }
// 허브 주문 본문 · 「내 예약」에 둘 칸
function body(){ if(CS.crs){ var op=crsOp(); return {crs:CS.crs,ck:op?op.k:"",g:CS.g?1:0,pick:pkBody(CS.pick),dl:dl(),lug:CS.lug,memo:CS.memo}; }   // 코스(11-14) — 목적지는 허브가 코스 자료로
  return {pick:pkBody(CS.pick),dests:CS.dests.map(dBody),dl:dl(),lug:CS.lug,memo:CS.memo}; }
function pub(){ var p=CS.pick||{}; return {pick:{t:p.t,ko:p.t==="place"?p.ko:(AP[p.t]||{}).ko||"",en:p.t==="place"?p.en:(AP[p.t]||{}).en||"",nm:pkName(p),lat:p.t==="place"?+p.lat:(AP[p.t]||{}).lat,lng:p.t==="place"?+p.lng:(AP[p.t]||{}).lng},dests:CS.dests.map(function(d){ return {ko:d.ko,en:d.en,nm:d.nm,lat:d.lat,lng:d.lng,z:zOf(d),k:d.k||"",dy:d.dy||0}; }),dl:dl(),lug:CS.lug,z:CS.crs?((crsOp()||{}).z||0):zMax().z,memo:CS.memo,drv:null,
  crs:CS.crs?(function(){ var C=crsC(), op=crsOp()||{}; return {id:CS.crs,k:op.k,g:C.g==="inc"||CS.g?1:0,tk:C.tk||0,dn:(op.d||[[]]).length,h:op.h||10}; })():undefined,gd:null}; }
// 주문이 거절됐을 때 글 (허브 err)
function errTx(e,j){ if(e==="lead") return F(TX.eLead,{d:minDate()}); if(e==="pick"||e==="pickzone") return L(e==="pick"?TX.ePick:CS.crs?TC.ePkZ:TX.ePkZ); if(e==="dests") return L(TX.dsE);
  if(e==="jeju"||e==="zone"||e==="dest"){ if(j&&typeof j.i==="number"&&CS.dests[j.i]) CS.dests[j.i].z=e==="jeju"?0:-1; return L(TX.eBad); }
  if(e==="zonenet") return L(TX.eNet); if(e==="price"&&CS.crs) return F(TX.ePrice,{p:won(j&&j.amount)}); if(e==="price"){ if(j&&Array.isArray(j.zs)) CS.dests.forEach(function(d,i){ if(typeof j.zs[i]==="number") d.z=j.zs[i]; }); return F(TX.ePrice,{p:won(j&&j.amount)}); }
  if(e==="dmax") return F(TX.dmax,{n:DMAX}); if(e==="dmzday") return L(TC.eDmz); if(e==="crs") return L(TC.eCrs); return ""; }

// ── 누르기 · 입력 ──
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-chr]"); if(!t) return; var k=t.getAttribute("data-chr"), i=+t.getAttribute("data-i"); e.preventDefault();
  if(k==="lug"){ CS.lug=Math.max(0,Math.min(LUGMAX,CS.lug+(+t.getAttribute("data-v")))); chg(); return; }
  if(k==="ps"){ CS.ps=true; if(CS.pick&&CS.pick.t!=="place") CS.pick=null; CS.note=""; chg(); setTimeout(function(){ var q=document.getElementById("chrPq"); if(q&&!("ontouchstart" in window)) q.focus(); },30); return; }
  if(k==="icn"||k==="gmp"){ CS.pick={t:k}; CS.ps=false; CS.note=""; chg(); return; }
  if(k==="px"){ var was=CS.pick; CS.pick=null; CS.ps=!!(was&&was.t==="place"); chg(); return; }
  if(k==="pgo"){ srch("p"); return; }
  if(k==="pp"){ var x=(CS.pr||[])[i]; if(!x) return; var o=fromKp(x); o.t="place"; o.z=null; CS.pick=o; CS.ps=false; CS.pr=null; CS.pq=""; chg(true); return; }
  if(k==="dgo"){ srch("d"); return; }
  if(k==="da"){ var y=(CS.r||[])[i]; if(!y||has(y)) return; if(CS.dests.length>=DMAX) return; var d=fromKp(y); d.z=null; CS.dests.push(d); CS.pf=null; CS.r=null; CS.q=""; /* 넣으면 찾은 목록은 닫는다 */ try{ ntap("shop","chr_add"); }catch(z){} chg(true); return; }
  if(k==="dx"){ if(CS.dests[i]) CS.dests.splice(i,1); chg(); return; }
  if(k==="dl"){ CS.dl=t.getAttribute("data-v"); chg(); return; }
  if(k==="ck"){ CS.ck=t.getAttribute("data-v"); crsFill(); try{ ntap("shop","ct_"+CS.crs+"_"+CS.ck); }catch(z){} chg(); return; }   // 코스 고르기 (11-14)
  if(k==="g"){ CS.g=t.getAttribute("data-v")==="1"?1:0; chg(); return; }   // 가이드 추가 (11-14)
  if(k==="guide"){ try{ ntap("shop","chr_guide"); }catch(z){} if(window.PC_HOME){ location.hash="#/guide"; try{ window.scrollTo(0,0); }catch(z){} return; } try{ if(window.SHOP&&SHOP.close) SHOP.close(); }catch(z){} try{ if(window.NEAR&&NEAR.open) NEAR.open("ig"); }catch(z){} return; }   // 투어 가이드 예약 = 가이드 인솔 화면 (앱 「투어 가이드」 · 홈페이지 #/guide)
},true);
document.addEventListener("keydown",function(e){ if(e.key!=="Enter"||!e.target) return; var id=e.target.id; if(id!=="chrPq"&&id!=="chrDq") return; e.preventDefault(); srch(id==="chrPq"?"p":"d"); });
document.addEventListener("input",function(e){ var t=e.target; if(!t) return; if(t.id==="chrMemo") CS.memo=t.value.slice(0,500); else if(t.id==="chrPq") CS.pq=t.value; else if(t.id==="chrDq") CS.q=t.value; });

// ── 목적지 끌어서 순서 바꾸기 — PC = ☰ 를 눌러 끌기 · 폰 = 꾹 눌러(0.45초) 끌기 (일정표 끌기와 같은 시간) ──
var DG=null, LP=null, DGT=0;
function dgStart(li){ var ol=li.parentNode; DG={li:li,ol:ol}; li.classList.add("drag"); ol.classList.add("dragging"); try{ if(navigator.vibrate) navigator.vibrate(15); }catch(e){} }
function dgMove(y){ if(!DG) return; var els=[].slice.call(DG.ol.children);
  for(var i=0;i<els.length;i++){ var el=els[i]; if(el===DG.li) continue; var r=el.getBoundingClientRect(); if(y>r.top&&y<r.bottom){ if(y<r.top+r.height/2) DG.ol.insertBefore(DG.li,el); else DG.ol.insertBefore(DG.li,el.nextSibling); break; } }
  var sc=DG.ol.closest("#shopBox")||null, vh=window.innerHeight; if(y<70){ if(sc) sc.scrollTop-=12; else window.scrollBy(0,-12); } else if(y>vh-70){ if(sc) sc.scrollTop+=12; else window.scrollBy(0,12); } }
function dgEnd(ok2){ if(!DG) return; var d=DG; DG=null; DGT=Date.now(); d.li.classList.remove("drag"); d.ol.classList.remove("dragging");
  if(!ok2){ chg(); return; } var ord=[].map.call(d.ol.children,function(x){ return +x.getAttribute("data-ci"); }), nd=ord.map(function(i){ return CS.dests[i]; }).filter(Boolean);
  if(nd.length===CS.dests.length){ var same=nd.every(function(x,i){ return x===CS.dests[i]; }); CS.dests=nd; if(!same) try{ ntap("shop","chr_drag"); }catch(e){} } chg(); }
document.addEventListener("touchstart",function(e){ if(DG||e.touches.length!==1){ if(LP){ clearTimeout(LP.tm); LP=null; } return; } var li=e.target.closest&&e.target.closest(".chr-li"); if(!li||e.target.closest("button")) return; var t=e.touches[0];
  if(LP) clearTimeout(LP.tm); LP={li:li,x:t.clientX,y:t.clientY}; LP.tm=setTimeout(function(){ if(!LP) return; var q=LP; LP=null; dgStart(q.li); },450); },{passive:true});
document.addEventListener("touchmove",function(e){ var t=e.touches[0]; if(DG){ if(e.cancelable) e.preventDefault(); dgMove(t.clientY); return; } if(LP&&(Math.abs(t.clientX-LP.x)>10||Math.abs(t.clientY-LP.y)>10)){ clearTimeout(LP.tm); LP=null; } },{passive:false});
document.addEventListener("touchend",function(e){ if(DG){ if(e.cancelable) e.preventDefault(); dgEnd(true); } else if(LP){ clearTimeout(LP.tm); LP=null; } },{passive:false});
document.addEventListener("touchcancel",function(){ if(DG) dgEnd(false); else if(LP){ clearTimeout(LP.tm); LP=null; } });
document.addEventListener("mousedown",function(e){ if(e.button!==0||DG) return; var h=e.target.closest&&e.target.closest(".chr-hd"); if(!h) return; e.preventDefault(); dgStart(h.closest(".chr-li")); });
document.addEventListener("mousemove",function(e){ if(DG){ e.preventDefault(); dgMove(e.clientY); } });
document.addEventListener("mouseup",function(){ if(DG) dgEnd(true); });
document.addEventListener("contextmenu",function(e){ if(DG||LP) e.preventDefault(); },true);
window.addEventListener("click",function(e){ if(Date.now()-DGT<450&&e.target&&e.target.closest&&e.target.closest(".chr-dl")){ e.preventDefault(); e.stopPropagation(); } },true);

// ── 상품 화면 열기 · 일정표에서 미리 채워 열기 ──
function open(){ if(window.PC_HOME&&typeof window.PCGO==="function"){ PCGO("package/"+PID); setTimeout(function(){ var b=document.querySelector("#pcPk .pk-box .chr"); if(b) try{ b.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){} },600); return; }
  if(window.SHOP&&SHOP.det){ SHOP.det(PID); setTimeout(function(){ var co=document.getElementById("shopCo"); if(co) try{ co.scrollIntoView({block:"start"}); }catch(e){} },120); } }
// pref = {date, time, dests:[{ko,en,nm,lat,lng,addr,k}], pick:{t:"place"|"icn"|"gmp", …}} — 일정표 [차량 대절] (trip.js)
function book(pref){ pref=pref||{}; use(PID); var ds=(pref.dests||[]).filter(function(d){ return d&&isFinite(+d.lat)&&isFinite(+d.lng); }).map(norm), seen={};
  ds=ds.filter(function(d){ var k=dKey(d); if(seen[k]) return false; seen[k]=1; return true; }).slice(0,DMAX);
  CS.dests=ds; CS.r=null; CS.q=""; CS.pr=null; CS.pq=""; CS.ps=false; CS.note=""; CS.pf=ds.length?{d:pref.lbl||pref.date||"",n:ds.length}:null;
  var p=pref.pick; CS.pick=p?(p.t==="icn"||p.t==="gmp"?{t:p.t}:Object.assign(norm(p),{t:"place",auto:1})):null; if(CS.pick&&CS.pick.t==="place"){ var z=zAddr(CS.pick.addr); if(z!=null&&z!==1){ CS.pick=null; CS.note="pkAuto"; } }
  try{ if(window.SHOP&&SHOP.set) SHOP.set({date:pref.date||"",time:pref.time||"",n:pref.n||0}); }catch(e){}
  quote(); open(); chg(); }

// ── 예약한 날 (일정표 trip.js) — 이 기기 「내 예약」 + 로그인 계정 목록(near.js NEARBK.mine) 가운데 취소 안 된 차량 대절 ──
function days(){ var a=[]; try{ a=window.NEARBK&&NEARBK.mine?NEARBK.mine():[]; }catch(e){ a=[]; }
  return a.filter(function(x){ return x&&x.chr&&x.date&&x.status!=="cancelled"&&x.status!=="refunded"&&Array.isArray(x.chr.dests); })
    .reduce(function(o,x){ var cr=x.chr.crs, dn=(cr&&cr.dn)||1, ok=x.chr.dests.filter(function(d){ return d&&isFinite(+d.lat)&&isFinite(+d.lng); });
      for(var i=0;i<dn;i++){ var dt=i?new Date(Date.parse(x.date+"T00:00:00Z")+i*864e5).toISOString().slice(0,10):x.date;   // 프라이빗 카투어 여러 날(11-14) = 날마다 그날 코스만
        o.push({oid:x.oid,date:dt,time:x.time||"",pick:x.chr.pick||null,h:(cr&&cr.h)||10,crs:cr?cr.id:"",dests:dn>1?ok.filter(function(d){ return (d.dy||0)===i; }):ok}); } return o; },[]); }   // pick = 픽업 장소(일정표 출발 자리, 11-11 「가」)

// ── 내 예약 바우처 (near.js 앱 · home/pc_bk.js 홈페이지) ──
function vchHtml(x){ var c=x&&x.chr; if(!c) return ""; if(c.crs) return crsVch(x); var p=c.pick||{}, d=c.drv, r=function(a,b){ return '<div class="chr-vr"><span>'+esc(L(a))+'</span><b>'+b+'</b></div>'; };
  var pk=p.t==="icn"||p.t==="gmp"?L(AP[p.t].n):(lg()==="ko"?(p.ko||p.nm||""):(p.nm||p.en||p.ko||""));
  return '<div class="chr-v"><div class="chr-vh">'+ico()+esc(L(TX.vt))+'</div>'
    +(d?'<div class="chr-dv"><div class="chr-vr"><span>'+esc(L(TX.drv))+'</span><b>'+esc(d.nm||"")+'</b></div><div class="chr-vr"><span>'+esc(L(TX.tel))+'</span><b><a href="tel:'+esc(String(d.tel||"").replace(/[^\d+]/g,""))+'">'+esc(d.tel||"")+'</a></b></div><div class="chr-vr"><span>'+esc(L(TX.car))+'</span><b>'+esc(d.car||"")+'</b></div></div>'
      :'<div class="chr-wt">'+esc(L(TX.drvW))+'</div>')
    +r(TX.rPk,esc(pk))+'<div class="chr-vr"><span>'+esc(L(TX.rDs))+'</span></div><ol class="chr-vo">'+(c.dests||[]).map(function(q){ return '<li>'+esc(nmOf(q))+'</li>'; }).join("")+'</ol>'
    +r(TX.dl,esc(L(DLN[c.dl]||DLN.en)))+r(TX.ppl,esc(F(TX.pplN,{n:x.n||1})))+r(TX.lug,esc(F(TX.lugN,{n:c.lug||0})))+(c.z?r(TX.rZ,esc(ZNO[c.z]+" "+L(ZN[c.z]))):"")
    +'<div class="chr-vx">'+esc(L(TX.ex))+': '+esc(TX.exl.map(function(q){ return L(q); }).join(" · "))+'</div></div>'; }

// 프라이빗 카투어 바우처 (11-14) — 상품·코스(날마다)·기사·가이드
function crsVch(x){ var c=x.chr, cr=c.crs||{}, C=CTD.crs[cr.id]||{t:{},ops:[]}, p=c.pick||{}, d=c.drv, g=c.gd, r=function(a,b){ return '<div class="chr-vr"><span>'+esc(L(a))+'</span><b>'+b+'</b></div>'; };
  var pk=lg()==="ko"?(p.ko||p.nm||""):(p.nm||p.en||p.ko||""), multi=(cr.dn||1)>1, ds='', last=-1;
  (c.dests||[]).forEach(function(q){ var dy=q.dy||0; if(multi&&dy!==last){ if(last>=0) ds+='</ol>'; ds+='<div class="chr-dy">'+esc(F(TC.day,{n:dy+1}))+'</div><ol class="chr-vo">'; last=dy; } else if(last<0){ ds+='<ol class="chr-vo">'; last=dy; } ds+='<li>'+esc(stopNm(q))+'</li>'; }); if(last>=0) ds+='</ol>';
  var op=(C.ops||[]).filter(function(o){ return o.k===cr.k; })[0]||{d:[[]]}, inc=crsIncList(C,op,!!cr.g).map(function(q){ return L(q); }).join(" · "), ex=crsExList(C,op).map(function(q){ return L(q); }).join(" · ");
  return '<div class="chr-v"><div class="chr-vh">'+ico()+esc(L(TC.vt))+'</div><div class="chr-vn">'+esc(crsNm(cr.id,cr.k))+'</div>'
    +(d?'<div class="chr-dv"><div class="chr-vr"><span>'+esc(L(TX.drv))+'</span><b>'+esc(d.nm||"")+'</b></div><div class="chr-vr"><span>'+esc(L(TX.tel))+'</span><b><a href="tel:'+esc(String(d.tel||"").replace(/[^\d+]/g,""))+'">'+esc(d.tel||"")+'</a></b></div><div class="chr-vr"><span>'+esc(L(TX.car))+'</span><b>'+esc(d.car||"")+'</b></div></div>'
      :'<div class="chr-wt">'+esc(L(TX.drvW))+'</div>')
    +(cr.g?(g?'<div class="chr-dv"><div class="chr-vr"><span>'+esc(L(TC.gH))+'</span><b>'+esc(g.nm||"")+'</b></div><div class="chr-vr"><span>'+esc(L(TX.tel))+'</span><b><a href="tel:'+esc(String(g.tel||"").replace(/[^\d+]/g,""))+'">'+esc(g.tel||"")+'</a></b></div></div>':'<div class="chr-wt">'+esc(L(TC.gW))+'</div>'):'')
    +r(TX.rPk,esc(pk))+r(TX.tm,esc((x.time||"")+" · "+(multi?F(TC.hrs2,{d:cr.dn,n:cr.h||10}):F(TC.hrs,{n:cr.h||10}))))+'<div class="chr-vr"><span>'+esc(L(TC.crsH))+'</span></div>'+ds
    +r(cr.g?TC.dlG:TX.dl,esc(L(DLN[c.dl]||DLN.en)))+r(TX.ppl,esc(F(TX.pplN,{n:x.n||1})))+r(TX.lug,esc(F(TX.lugN,{n:c.lug||0})))
    +'<div class="chr-vx">'+esc(L(TC.incH))+': '+esc(inc)+'</div><div class="chr-vx">'+esc(L(TC.exH))+': '+esc(ex)+'</div></div>'; }

// ── 교통 창 광고 띠 (transit.js — 검색칸 바로 아래) ──
function adBtn(){ return '<button type="button" class="chr-ad" data-chrad="1">'+ico("height:30px;width:30px;margin:0")+'<span>'+esc(L(TX.adT))+'</span><b>'+esc(L(TX.adGo))+' ›</b></button>'; }
// 11-11 사장님 「가로 하자」 — 광고 띠 바로 아래 「내 차량 대절 예약 N건 ›」: 이 기기 + 로그인 계정 「내 예약」(near.js NEARBK.mine) 가운데 오늘 이후·취소 안 된 차량 대절만, 있을 때만
function myCnt(){ var a=[], td=new Date(Date.now()+9*3600000).toISOString().slice(0,10); try{ a=window.NEARBK&&NEARBK.mine?NEARBK.mine():[]; }catch(e){ a=[]; }
  return a.filter(function(x){ return x&&(x.chr||x.pid==="chr")&&x.status!=="cancelled"&&x.status!=="refunded"&&String(x.date||"")>=td; }).length; }
function myBtn(){ var n=myCnt(); return n?'<button type="button" class="chr-my" data-chrmy="1"><span>'+esc(F(TX.adMy,{n:n}))+'</span><b>›</b></button>':''; }
function adHtml(){ try{ if(window.NEARBK&&NEARBK.srv) NEARBK.srv(); }catch(e){} return '<div class="chr-adw">'+adBtn()+myBtn()+'</div>'; }   // 계정 목록은 near.js 가 30초에 한 번까지만 다시 받는다
document.addEventListener("mpbk",function(){ [].forEach.call(document.querySelectorAll(".chr-adw"),function(w){ w.innerHTML=adBtn()+myBtn(); }); });   // 다른 기기 예약이 계정 목록으로 들어오면
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("[data-chrmy]"); if(!a) return; e.preventDefault(); e.stopPropagation(); try{ ntap("shop","chr_my"); }catch(z){} try{ if(window.TRANSIT&&TRANSIT.close) TRANSIT.close(); }catch(z){}
  if(window.PC_HOME){ var b=document.getElementById("phBk"); if(b){ b.click(); return; } if(typeof window.PCGO==="function"){ PCGO("bookings"); return; } }   // 홈페이지 = 머리줄 [내 예약]과 같은 길(로그인 안 했으면 로그인 창부터)
  try{ if(window.NEAR&&NEAR.open) NEAR.open("ig"); }catch(z){} },true);   // 앱 = 「투어 가이드」 첫 화면 맨 위 「내 예약」
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("[data-chrad]"); if(!a) return; e.preventDefault(); e.stopPropagation(); try{ ntap("shop","chr_ad"); }catch(z){} try{ if(window.TRANSIT&&TRANSIT.close) TRANSIT.close(); }catch(z){} open(); },true);

var st=document.createElement("style");
st.textContent=""
 +".chr{display:flex;flex-direction:column;gap:12px;margin:6px 0 4px;text-align:left;color:var(--ink,#1d2433)}"
 +"#shopBox .chr,#shopBox .chr-v{--card:#fff;--ink:#1d2433;--sub:#5b6474;--line:#e4e0d6;--bg:#f6f4ef}"   // 앱 상품 화면은 늘 밝은 바탕
 +".chr-ic{height:1.25em;width:auto;vertical-align:-0.28em;margin-right:5px}"
 +".chr-row{display:flex;justify-content:space-between;align-items:center;gap:10px}.chr-lb{font-size:14px;color:var(--sub,#5b6474);font-weight:700}#shopBox .chr-lb{font-size:13px;color:#667085;font-weight:400}"
 +"#shopBox .chr-stp{gap:8px}#shopBox .chr-stp button{width:30px;height:30px;border:1px solid #e4e0d6;background:#efece4;font-size:16px}#shopBox .chr-stp b{min-width:0}"   // 앱 인원 칸과 같은 모양
 +".chr-stp{display:flex;align-items:center;gap:10px}.chr-stp b{min-width:22px;text-align:center;font-size:16px}.chr-stp button{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--line,#e4e0d6);background:var(--card,#fff);color:var(--ink,#1d2433);font-size:17px;font-weight:900;cursor:pointer;line-height:1;padding:0}"
 +".chr-blk{border-top:1px dashed var(--line,#e4e0d6);padding-top:10px;display:flex;flex-direction:column;gap:7px}.chr-h3{font-weight:900;font-size:15px;display:block}.chr-drv ul{margin:0;padding-left:18px;font-size:13.5px;line-height:1.55}.chr-gbtn{align-self:flex-start;border:1.5px solid #0c8599;background:var(--card,#fff);color:#0c8599;border-radius:10px;padding:8px 14px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}.chr-h3 small{font-weight:700;color:var(--sub,#5b6474);font-size:12px}"
 +".chr-nt{margin:0;font-size:12.5px;line-height:1.55;color:var(--sub,#5b6474)}.chr-w{margin:0;font-size:13px;font-weight:800;color:#c2410c;line-height:1.5}.chr-ok{margin:0;font-size:13px;font-weight:800;color:#2b8a3e;line-height:1.5}"
 +".chr-chips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.chr-chips.c4{grid-template-columns:repeat(4,minmax(0,1fr))}"
 +".chr-chips button{border:1.5px solid var(--line,#e4e0d6);background:var(--card,#fff);color:var(--ink,#1d2433);border-radius:10px;padding:8px 4px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;line-height:1.3;word-break:keep-all}"
 +".chr-chips button.on{border-color:#2f9e44;background:#2f9e44;color:#fff}"
 +".chr-sel{display:flex;align-items:center;gap:6px;border:1.5px solid #2f9e44;border-radius:12px;padding:8px 10px;background:rgba(47,158,68,.08)}.chr-sel b{flex:1;min-width:0;font-size:14px}.chr-sel button,.chr-x{border:0;background:transparent;color:var(--sub,#5b6474);font-size:16px;font-weight:900;cursor:pointer;padding:2px 6px}"
 +".chr-q{display:flex;gap:6px}.chr-q input{flex:1;min-width:0;font:inherit;font-size:15px;border:1.5px solid var(--line,#e4e0d6);border-radius:10px;padding:8px 10px;background:var(--card,#fff);color:var(--ink,#1d2433)}"
 +".chr-q button{border:0;border-radius:10px;background:#2f9e44;color:#fff;font:inherit;font-weight:800;font-size:14px;padding:0 14px;cursor:pointer;white-space:nowrap}"
 +".chr-res{display:flex;flex-direction:column;gap:6px;max-height:300px;overflow:auto;overscroll-behavior:contain}"
 +".chr-sr{display:flex;align-items:center;gap:8px;border:1px solid var(--line,#e4e0d6);border-radius:10px;padding:7px 9px;background:var(--card,#fff)}.chr-sr>div{flex:1;min-width:0;font-size:13.5px;line-height:1.4}.chr-sr i{font-style:normal;font-size:11.5px;color:var(--sub,#5b6474)}.chr-sr small{display:block;font-size:11.5px;color:var(--sub,#5b6474)}"
 +".chr-b{flex:0 0 auto;border:1.5px solid #2f9e44;background:var(--card,#fff);color:#2b8a3e;border-radius:9px;padding:6px 10px;font:inherit;font-size:13px;font-weight:900;cursor:pointer;white-space:nowrap}.chr-no{flex:0 0 auto;font-size:12px;font-weight:800;color:var(--sub,#5b6474);max-width:40%;text-align:right}"
 +".chr-dl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}"
 +".chr-li{display:flex;align-items:center;gap:8px;border:1.5px solid var(--line,#e4e0d6);border-radius:12px;padding:8px 6px 8px 8px;background:var(--card,#fff);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}"
 +".chr-li.drag{border-color:#2f9e44;box-shadow:0 6px 18px rgba(0,0,0,.18);transform:scale(1.02);position:relative;z-index:2}.chr-dl.dragging .chr-li:not(.drag){opacity:.75}"
 +".chr-hd{cursor:grab;color:var(--sub,#5b6474);font-size:17px;padding:0 4px;touch-action:none}.chr-no2{flex:0 0 22px;height:22px;border-radius:50%;background:#2f9e44;color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center}"
 +".chr-dn{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.chr-dn b{font-size:14px;line-height:1.35}"
 +".chr-z{font-style:normal;font-size:11.5px;font-weight:800;color:#2b8a3e}.chr-z.u{color:var(--sub,#5b6474)}.chr-z.x{color:#c92a2a}"
 +".chr-zt{display:flex;flex-direction:column;border:1px solid var(--line,#e4e0d6);border-radius:12px;overflow:hidden}.chr-zt>div{display:flex;justify-content:space-between;gap:10px;padding:7px 10px;font-size:13px;border-top:1px solid var(--line,#e4e0d6)}.chr-zt>div:first-child{border-top:0}"
 +".chr-zt>div span{min-width:0}.chr-zt>div b{white-space:nowrap}.chr-zt>div.on{background:#fff3bf;font-weight:900;color:#1d2433}"
 +".chr textarea{font:inherit;font-size:14.5px;border:1.5px solid var(--line,#e4e0d6);border-radius:10px;padding:8px 10px;resize:vertical;background:var(--card,#fff);color:var(--ink,#1d2433)}"
 +".chr-exb{background:rgba(255,212,59,.14);border:1px solid rgba(240,180,0,.45);border-radius:12px;padding:10px 12px}.chr-exb ul{margin:0;padding-left:18px;font-size:13px;line-height:1.6}"
 +".chr-pl{text-align:right;line-height:1.5;color:var(--ink,#1d2433)}#shopBox .chr-pl{color:#1d2433}.chr-px{text-align:right}"
 +".chr-v{margin:10px 0 0;padding:10px 12px;border:1.5px solid #2f9e44;border-radius:12px;background:rgba(47,158,68,.06);font-size:13px;line-height:1.55;text-align:left;color:var(--ink,#1d2433)}"
 +".chr-vh{font-weight:900;font-size:14.5px;margin:0 0 6px}.chr-vr{display:flex;justify-content:space-between;gap:10px;padding:2px 0}.chr-vr span{color:var(--sub,#5b6474)}.chr-vr b{text-align:right}.chr-vr a{color:#1f5fa8;text-decoration:none}"
 +".chr-dv{border:1px solid var(--line,#e4e0d6);border-radius:10px;padding:6px 10px;background:var(--card,#fff);margin:0 0 6px}.chr-wt{font-weight:800;color:#8a5a00;background:#fff3bf;border-radius:10px;padding:7px 10px;margin:0 0 6px}"
 +".chr-vo{margin:0 0 4px;padding-left:22px}.chr-vx{margin-top:6px;font-size:12px;color:var(--sub,#5b6474)}"
 +".chr-ops{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px}.chr-ops button{border:1.5px solid var(--line,#e4e0d6);background:var(--card,#fff);color:var(--ink,#1d2433);border-radius:10px;padding:8px 6px;font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:2px;align-items:center;line-height:1.3;word-break:keep-all}"
 +".chr-ops button b{font-size:13.5px;font-weight:900}.chr-ops button small{font-size:12px;font-weight:700;color:var(--sub,#5b6474)}.chr-ops button.on{border-color:#2f9e44;background:#2f9e44;color:#fff}.chr-ops button.on small{color:#e6fcf5}"
 +".chr-cs{margin:0;padding-left:22px;font-size:14px;line-height:1.6;font-weight:700}.chr-csp{text-align:left;font-weight:400;font-size:13px}.chr-dy{font-size:12.5px;font-weight:900;color:#2b8a3e;margin-top:2px}.chr-vn{font-weight:900;font-size:14px;margin:-2px 0 6px}"
 +".chr-zt>div b{text-align:right}"
 +".chr-ad{display:flex;align-items:center;gap:10px;width:100%;margin:8px 0 2px;border:1.5px solid #f0c419;background:#fff9db;color:#1d2433;border-radius:14px;padding:8px 12px;font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}"
 +".chr-ad span{flex:1;min-width:0;font-size:13.5px;font-weight:800;line-height:1.4}.chr-ad b{flex:0 0 auto;color:#2b8a3e;font-size:13.5px;font-weight:900;white-space:nowrap}"
 +".chr-my{display:flex;align-items:center;gap:8px;width:100%;margin:6px 0 2px;border:1.5px solid #b2dfbc;background:#ebfbee;color:#2b8a3e;border-radius:12px;padding:9px 12px;font:inherit;font-size:13.5px;font-weight:800;text-align:left;cursor:pointer;box-sizing:border-box}.chr-my span{flex:1;min-width:0}.chr-my b{flex:0 0 auto;font-weight:900}"
 +"html[data-theme=\"dark\"] .chr-my{background:#16301d;border-color:#2f6b3c;color:#8ce99a}"
 +"html[data-theme=\"dark\"] .chr-ad{background:#3a3210;border-color:#8a7414;color:#f8f1d2}html[data-theme=\"dark\"] .chr-ad b{color:#8ce99a}"
 +"html[data-theme=\"dark\"] .chr-wt{background:#3a3210;color:#ffe066}html[data-theme=\"dark\"] .chr-zt>div.on{background:#5c4d0f;color:#fff}html[data-theme=\"dark\"] .chr-ok,html[data-theme=\"dark\"] .chr-z{color:#8ce99a}html[data-theme=\"dark\"] .chr-vr a{color:#74c0fc}"
 +"html[data-theme=\"dark\"] #shopBox .chr-zt>div.on{background:#fff3bf;color:#1d2433}html[data-theme=\"dark\"] #shopBox .chr-ok,html[data-theme=\"dark\"] #shopBox .chr-z{color:#2b8a3e}html[data-theme=\"dark\"] #shopBox .chr-wt{background:#fff3bf;color:#8a5a00}";
(document.head||document.documentElement).appendChild(st);

window.CHR={PID:PID,PRICE:PRICE,NMAX:NMAX,is:is,isCrs:isCrs,use:use,crsNm:crsNm,CTD:CTD,TC:TC,
  crsTm:function(){ var op=CS.crs?crsOp():null; return op?op.tm:""; },crsOn:function(){ return !!CS.crs; },crsG:function(){ var C=crsC(); return !!(C&&(C.g==="inc"||CS.g)); },
  crsMin:function(id){ var C=CTD.crs&&CTD.crs[id]; return C?Math.min.apply(null,C.ops.map(function(o){ return o.p; })):0; },ok:ok,why:why,amount:amount,minDate:minDate,pickHtml:pickHtml,payRows:payRows,body:body,pub:pub,errTx:errTx,
  vchHtml:vchHtml,adHtml:adHtml,open:open,book:book,days:days,quote:quote,zone:zone,
  pkTx:function(p){ if(!p) return ""; if(p.t==="icn"||p.t==="gmp") return L(AP[p.t].n); return lg()==="ko"?(p.ko||p.nm||p.en||""):(p.nm||p.en||p.ko||""); },   // 예약한 픽업 장소 이름(일정표 픽업 줄, 11-11)
  st:function(){ return CS; }, tx:function(k){ return TX[k]?L(TX[k]):""; }, T:TX, dlTxt:function(){ return DLS.map(function(k){ return L(DLN[k]); }).join(" · "); },
  done:function(){ try{ document.dispatchEvent(new Event("chrbk")); }catch(e){} }};   // 결제 끝 — 일정표가 그날을 다시 그린다
})();
