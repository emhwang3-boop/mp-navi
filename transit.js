/* 머니퍼즐 투어앱 — 「교통」 (사장님 2026-11-07) · 손님 언어로 가는 길
 *  첫 화면 칩(전에 「선물 고르기」 자리 — 선물 고르기는 ⋮ 메뉴에) → 가운데 창
 *  · 출발 = 현재 위치(기본) · 숙소(내 여행에서 고른 숙소) · 「다른 곳」으로 찾은 곳 / 도착 = 찾기(우리 명소 이름 + 허브 /kplace, kpL() 언어) → 고르면 바로 길찾기
 *  · 허브 GET /ntransit (ODsay 한 번 + 네이버 택시 한 번 · 같은 구간 10분 캐시) → 한 화면: 가장 빠른 길·가장 싼 길 → 대중교통 → 택시 → 고속·시외버스 → KTX·SRT (→ 비행기가 있으면)
 *  · 펼침은 공통 ▼/— (XTG) · 열차는 펼칠 때 TAGO 시간표(허브 /train, 무료 — 역이 KXS 25곳 안일 때) · 시각은 24시간 HH:MM(한국 시각)
 *  · 바깥 지도: 한국어 = 네이버 지도, 외국어 = 구글 지도 · 택시는 구글이 한국 자동차 길을 안 줘서 네이버 지도 + 카카오 T / K.Ride
 *  · 걷기(11-07): 직선 5km 안이면 맨 위 「걷기」 — 허브 /nwalk(티맵) · 펼치면 네이버 지도(길·방향 화살표·내 위치)
 *  · 새 글은 6개 언어(X) — i18n.js 는 안 건드림 · index.html 전역(HUB·LANG·esc·MPIMG·MIS·kpL·hlG·KS·LN·m3857·kmLL·myPos·ME·PLACES·CITY·mapLoad·subBadge·busIcon·trGrade·trBadge·KXS·krideL·kakaoTL·spinNorm)을 쓴다
 */
(function(){
"use strict";
var X={
  chip:{ko:"교통",en:"Transport",ja:"交通",zhs:"交通",zht:"交通",es:"Transporte"},
  from:{ko:"출발",en:"From",ja:"出発",zhs:"出发",zht:"出發",es:"Origen"},
  to:{ko:"도착",en:"To",ja:"到着",zhs:"到达",zht:"抵達",es:"Destino"},
  me:{ko:"현재 위치",en:"My location",ja:"現在地",zhs:"当前位置",zht:"目前位置",es:"Mi ubicación"},
  other:{ko:"다른 곳",en:"Another place",ja:"別の場所",zhs:"其他地点",zht:"其他地點",es:"Otro lugar"},
  fph:{ko:"출발할 곳 이름",en:"Where are you starting from?",ja:"出発地の名前",zhs:"出发地名称",zht:"出發地名稱",es:"¿Desde dónde sales?"},
  tph:{ko:"어디로 가세요? 예: N서울타워",en:"Where to? e.g. N Seoul Tower",ja:"どこへ行きますか？例：Nソウルタワー",zhs:"去哪里？例：N首尔塔",zht:"去哪裡？例：N首爾塔",es:"¿Adónde vas? p. ej., N Seoul Tower"},
  find:{ko:"찾기",en:"Search",ja:"検索",zhs:"搜索",zht:"搜尋",es:"Buscar"},
  srch:{ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"正在查找…",zht:"正在搜尋…",es:"Buscando…"},
  route:{ko:"길 찾는 중…",en:"Finding routes…",ja:"経路を検索中…",zhs:"正在查找路线…",zht:"正在查詢路線…",es:"Buscando rutas…"},
  none:{ko:"찾은 곳이 없어요. 다른 이름으로 찾아 보세요.",en:"No places found. Try another name.",ja:"見つかりませんでした。別の名前で検索してください。",zhs:"没有找到，请换个名称搜索。",zht:"沒有找到，請換個名稱搜尋。",es:"No se encontró ningún lugar. Prueba con otro nombre."},
  pick:{ko:"도착할 곳을 찾아 고르면 바로 길을 보여 드려요.",en:"Search and pick where you're going — routes appear right away.",ja:"行き先を検索して選ぶと、すぐに経路を表示します。",zhs:"搜索并选择目的地，马上显示路线。",zht:"搜尋並選擇目的地，馬上顯示路線。",es:"Busca y elige tu destino: las rutas aparecen al instante."},
  loc:{ko:"현재 위치를 받지 못했어요. 위치 권한을 켜거나 「다른 곳」으로 출발할 곳을 찾아 주세요.",en:"Couldn't get your location. Allow location access, or pick a starting point with “Another place”.",ja:"現在地を取得できませんでした。位置情報を許可するか、「別の場所」で出発地を選んでください。",zhs:"无法获取当前位置。请开启定位权限，或用「其他地点」选择出发地。",zht:"無法取得目前位置。請開啟定位權限，或用「其他地點」選擇出發地。",es:"No se pudo obtener tu ubicación. Activa el permiso de ubicación o elige el origen con «Otro lugar»."},
  err:{ko:"잠시 뒤 다시 해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Vuelve a intentarlo en un momento."},
  same:{ko:"출발과 도착이 같은 곳이에요.",en:"Start and destination are the same place.",ja:"出発地と到着地が同じです。",zhs:"出发地和目的地相同。",zht:"出發地和目的地相同。",es:"El origen y el destino son el mismo lugar."},
  fast:{ko:"가장 빠른 길",en:"Fastest",ja:"最速ルート",zhs:"最快路线",zht:"最快路線",es:"La más rápida"},
  cheap:{ko:"가장 싼 길",en:"Cheapest",ja:"最安ルート",zhs:"最省钱路线",zht:"最省錢路線",es:"La más barata"},
  gT:{ko:"대중교통 (시내버스·지하철)",en:"Public transit (city bus & subway)",ja:"公共交通（市内バス・地下鉄）",zhs:"公共交通（市内公交·地铁）",zht:"大眾運輸（市區公車·地鐵）",es:"Transporte público (autobús urbano y metro)"},
  gX:{ko:"택시",en:"Taxi",ja:"タクシー",zhs:"出租车",zht:"計程車",es:"Taxi"},
  gB:{ko:"고속버스·시외버스",en:"Express & intercity buses",ja:"高速バス・市外バス",zhs:"高速巴士·长途汽车",zht:"高速巴士·長途客運",es:"Autobuses exprés e interurbanos"},
  gR:{ko:"KTX·SRT",en:"KTX & SRT",ja:"KTX・SRT",zhs:"KTX·SRT",zht:"KTX·SRT",es:"KTX y SRT"},
  gA:{ko:"비행기",en:"Flights",ja:"飛行機",zhs:"飞机",zht:"飛機",es:"Avión"},
  nT:{ko:"이 구간은 시내버스·지하철로 가는 길이 없어요.",en:"No city bus or subway route for this trip.",ja:"この区間は市内バス・地下鉄の経路がありません。",zhs:"该路段没有市内公交或地铁路线。",zht:"此路段沒有市區公車或地鐵路線。",es:"No hay ruta en autobús urbano ni metro para este trayecto."},
  nX:{ko:"이 구간은 택시 길을 찾지 못했어요.",en:"No taxi route found for this trip.",ja:"この区間のタクシー経路は見つかりませんでした。",zhs:"未找到该路段的出租车路线。",zht:"找不到此路段的計程車路線。",es:"No se encontró ruta en taxi para este trayecto."},
  nB:{ko:"이 구간은 고속버스·시외버스가 없어요.",en:"No express or intercity bus for this trip.",ja:"この区間は高速バス・市外バスがありません。",zhs:"该路段没有高速巴士或长途汽车。",zht:"此路段沒有高速巴士或長途客運。",es:"No hay autobús exprés ni interurbano para este trayecto."},
  nR:{ko:"이 구간은 기차가 없어요.",en:"No train for this trip.",ja:"この区間は列車がありません。",zhs:"该路段没有火车。",zht:"此路段沒有火車。",es:"No hay tren para este trayecto."},
  near:{ko:"가까워서 걸어가는 게 좋아요 — 걸어서 약 {d}",en:"It's close — about {d} on foot",ja:"近いので歩くのがおすすめです — 徒歩約{d}",zhs:"距离很近，建议步行——约{d}",zht:"距離很近，建議步行——約{d}",es:"Está cerca: mejor a pie, unos {d}"},
  na:{ko:"지금은 볼 수 없어요.",en:"Not available right now.",ja:"現在表示できません。",zhs:"暂时无法显示。",zht:"暫時無法顯示。",es:"No disponible ahora."},
  cap:{ko:"오늘은 대중교통 안내가 모두 끝났어요. 아래 지도 단추로 보세요.",en:"Transit directions are used up for today. Please use the map link below.",ja:"本日の公共交通案内は上限に達しました。下の地図ボタンでご確認ください。",zhs:"今天的公共交通指引已用完，请用下面的地图按钮查看。",zht:"今天的大眾運輸指引已用完，請用下方的地圖按鈕查看。",es:"Por hoy se agotaron las rutas de transporte público. Usa el botón del mapa de abajo."},
  busy:{ko:"대중교통 길을 지금 받지 못했어요. 잠시 뒤 다시 해 보거나 아래 지도 단추로 보세요.",en:"Couldn't get transit routes right now. Try again shortly or use the map link below.",ja:"公共交通の経路を取得できませんでした。しばらくしてから再度お試しいただくか、下の地図ボタンでご確認ください。",zhs:"暂时无法获取公共交通路线。请稍后再试，或用下面的地图按钮查看。",zht:"暫時無法取得大眾運輸路線。請稍後再試，或用下方的地圖按鈕查看。",es:"No se pudieron obtener rutas de transporte público. Vuelve a intentarlo o usa el botón del mapa de abajo."},
  xfer0:{ko:"환승 없음",en:"No transfers",ja:"乗換なし",zhs:"无需换乘",zht:"免轉乘",es:"Sin transbordos"},
  xfer:{ko:"환승 {n}번",en:"{n} transfer{s}",ja:"乗換{n}回",zhs:"换乘{n}次",zht:"轉乘{n}次",es:"{n} transbordo{s}"},
  dep:{ko:"{a} 출발 → {b} 도착",en:"Leave {a} → arrive {b}",ja:"{a}発 → {b}着",zhs:"{a} 出发 → {b} 到达",zht:"{a} 出發 → {b} 抵達",es:"Salida {a} → llegada {b}"},
  walk:{ko:"{a} → {b} 걸어서 약 {d}",en:"{a} → {b} · about {d} on foot",ja:"{a} → {b} 徒歩約{d}",zhs:"{a} → {b} 步行约{d}",zht:"{a} → {b} 步行約{d}",es:"{a} → {b} · unos {d} a pie"},
  acc:{ko:"{a} → {b} 대중교통·택시로 약 {d} (어림)",en:"{a} → {b} · about {d} by transit or taxi (estimate)",ja:"{a} → {b} 公共交通・タクシーで約{d}（目安）",zhs:"{a} → {b} 乘公共交通或出租车约{d}（估算）",zht:"{a} → {b} 搭大眾運輸或計程車約{d}（估算）",es:"{a} → {b} · unos {d} en transporte público o taxi (estimado)"},
  d2d:{ko:"출발지에서 도착지까지 약 {d} (어림)",en:"Door to door: about {d} (estimate)",ja:"出発地から到着地まで約{d}（目安）",zhs:"全程约{d}（估算）",zht:"全程約{d}（估算）",es:"De puerta a puerta: unos {d} (estimado)"},
  stopsS:{ko:"{n}정거장",en:"{n} stops",ja:"{n}駅",zhs:"{n}站",zht:"{n}站",es:"{n} paradas"},
  stopsB:{ko:"{n}정거장",en:"{n} stops",ja:"{n}停留所",zhs:"{n}站",zht:"{n}站",es:"{n} paradas"},
  exit:{ko:"{n}번 출구",en:"Exit {n}",ja:"{n}番出口",zhs:"{n}号出口",zht:"{n}號出口",es:"salida {n}"},
  bus:{ko:"{n}번 버스",en:"Bus {n}",ja:"{n}番バス",zhs:"{n}路公交",zht:"{n}路公車",es:"Autobús {n}"},
  daily:{ko:"하루 {n}회",en:"{n} a day",ja:"1日{n}本",zhs:"每天{n}班",zht:"每天{n}班",es:"{n} al día"},
  every:{ko:"약 {n}분마다",en:"about every {n} min",ja:"約{n}分ごと",zhs:"约每{n}分钟一班",zht:"約每{n}分鐘一班",es:"cada unos {n} min"},
  x5:{ko:"고속버스",en:"Express bus",ja:"高速バス",zhs:"高速巴士",zht:"高速巴士",es:"Autobús exprés"},
  x6:{ko:"시외버스",en:"Intercity bus",ja:"市外バス",zhs:"长途汽车",zht:"長途客運",es:"Autobús interurbano"},
  x4:{ko:"열차",en:"Train",ja:"列車",zhs:"列车",zht:"列車",es:"Tren"},
  x7:{ko:"비행기",en:"Flight",ja:"飛行機",zhs:"航班",zht:"航班",es:"Vuelo"},
  taxiT:{ko:"택시 약 {d}",en:"Taxi · about {d}",ja:"タクシー 約{d}",zhs:"出租车 约{d}",zht:"計程車 約{d}",es:"Taxi · unos {d}"},
  toll:{ko:"통행료 {f} 따로",en:"plus tolls {f}",ja:"通行料{f}は別",zhs:"另付过路费{f}",zht:"另付過路費{f}",es:"más peajes de {f}"},
  est:{ko:"어림",en:"estimate",ja:"目安",zhs:"估算",zht:"估算",es:"estimado"},
  live:{ko:"지금 교통 상황을 반영한 시간·요금이에요 (네이버 길찾기)",en:"Time and fare reflect current traffic (Naver)",ja:"現在の交通状況を反映した時間・料金です（NAVER）",zhs:"时间和车费已考虑当前路况（NAVER）",zht:"時間和車資已考量目前路況（NAVER）",es:"Tiempo y tarifa según el tráfico actual (Naver)"},
  tt:{ko:"열차 시간표",en:"Train times",ja:"列車時刻",zhs:"列车时刻",zht:"列車時刻",es:"Horarios de trenes"},
  today:{ko:"오늘",en:"Today",ja:"今日",zhs:"今天",zht:"今天",es:"Hoy"},
  tmrw:{ko:"내일",en:"Tomorrow",ja:"明日",zhs:"明天",zht:"明天",es:"Mañana"},
  ttLd:{ko:"열차 시간 찾는 중…",en:"Finding trains…",ja:"列車を検索中…",zhs:"正在查找列车…",zht:"正在查詢列車…",es:"Buscando trenes…"},
  ttNo:{ko:"시간표를 받지 못했어요. 예매 사이트에서 확인해 주세요.",en:"Couldn't get the timetable. Please check on the booking site.",ja:"時刻表を取得できませんでした。予約サイトでご確認ください。",zhs:"无法获取时刻表，请在订票网站确认。",zht:"無法取得時刻表，請在訂票網站確認。",es:"No se pudo obtener el horario. Consúltalo en la web de reservas."},
  nvMap:{ko:"네이버 지도로 보기",en:"Naver Map",ja:"NAVERマップ",zhs:"NAVER 地图",zht:"NAVER 地圖",es:"Naver Map"},
  gMap:{ko:"구글 지도로 보기",en:"Open in Google Maps",ja:"Google マップで開く",zhs:"在 Google 地图中打开",zht:"在 Google 地圖中開啟",es:"Abrir en Google Maps"},
  nvCar:{ko:"네이버 지도로 보기",en:"Car route on Naver Map",ja:"NAVERマップで車ルート",zhs:"在 NAVER 地图查看驾车路线",zht:"在 NAVER 地圖查看開車路線",es:"Ruta en coche en Naver Map"},
  bkK:{ko:"코레일 예매",en:"Book on Korail",ja:"KORAILで予約",zhs:"在 KORAIL 订票",zht:"在 KORAIL 訂票",es:"Reservar en Korail"},
  bkS:{ko:"SRT 예매",en:"Book on SRT",ja:"SRTで予約",zhs:"在 SRT 订票",zht:"在 SRT 訂票",es:"Reservar en SRT"},
  bk5:{ko:"고속버스 예매",en:"Book an express bus",ja:"高速バスを予約",zhs:"预订高速巴士",zht:"預訂高速巴士",es:"Reservar autobús exprés"},
  bk6:{ko:"시외버스 예매",en:"Book an intercity bus",ja:"市外バスを予約",zhs:"预订长途汽车",zht:"預訂長途客運",es:"Reservar autobús interurbano"},
  bkA:{ko:"항공권 찾기",en:"Find flights",ja:"航空券を探す",zhs:"查找机票",zht:"查找機票",es:"Buscar vuelos"},
  start:{ko:"출발지",en:"Start",ja:"出発地",zhs:"出发地",zht:"出發地",es:"Origen"},
  dest:{ko:"도착지",en:"Destination",ja:"到着地",zhs:"目的地",zht:"目的地",es:"Destino"},
  km:{ko:"직선 {k}",en:"{k} in a straight line",ja:"直線 {k}",zhs:"直线 {k}",zht:"直線 {k}",es:"{k} en línea recta"},
  at:{ko:"{t} 출발 기준",en:"Leaving at {t}",ja:"{t}出発の場合",zhs:"按 {t} 出发计算",zht:"以 {t} 出發計算",es:"Saliendo a las {t}"},
  src:{ko:"요금·시간은 참고용이에요. 대중교통 powered by www.ODsay.com · 택시 네이버",en:"Fares and times are for reference. Transit powered by www.ODsay.com · Taxi by Naver",ja:"運賃・時間は目安です。公共交通 powered by www.ODsay.com・タクシー NAVER",zhs:"票价和时间仅供参考。公共交通 powered by www.ODsay.com · 出租车 NAVER",zht:"票價和時間僅供參考。大眾運輸 powered by www.ODsay.com · 計程車 NAVER",es:"Tarifas y horarios orientativos. Transporte público powered by www.ODsay.com · Taxi: Naver"}
};
var DU={ko:["시간 ","분"],en:[" h "," min"],ja:["時間","分"],zhs:["小时","分钟"],zht:["小時","分鐘"],es:[" h "," min"]};
function L6(o){ return o[window.LANG]||o.en; }
function F(k,v){ return L6(X[k]).replace(/\{(\w)\}/g,function(m,n){ return v&&v[n]!=null?v[n]:""; }); }
function E(k,v){ return esc(F(k,v)); }
function dur(m){ m=Math.max(0,Math.round(+m||0)); var u=DU[window.LANG]||DU.en, h=Math.floor(m/60), r=m%60; return h?(h+u[0]+(r?r+u[1]:"")).replace(/\s+$/,""):r+u[1].replace(/^\s+/,LANG==="ko"||LANG==="ja"||/^zh/.test(LANG)?"":" "); }
function won(n){ return (Math.round(+n||0)).toLocaleString("en-US")+T("원"," KRW"); }
function kstMin(){ var d=new Date(Date.now()+9*3600e3); return d.getUTCHours()*60+d.getUTCMinutes(); }
function hm(m){ m=((Math.round(m)%1440)+1440)%1440; return ("0"+Math.floor(m/60)).slice(-2)+":"+("0"+m%60).slice(-2); }
function km2(a,b){ return kmLL([+a[0],+a[1]],[+b[0],+b[1]]); }
function walkMin(k){ return Math.max(1,Math.round(k*1.3/4.5*60)); }
function nm(s){ return LANG==="ko"?String(s||""):KS(s); }   // 일·중·스페인어 화면엔 한글을 남기지 않는다(로마자)

var S={from:{t:"me"},to:null,fq:"",tq:"",fc:null,tc:null,fs:0,fst:"",tst:"",st:"",R:null,rl:"",at:0,err:"",open:{},TT:{}};
// ── 출발 후보: 현재 위치 · 숙소 (11-09 사장님 「숙소는 모두 연동」 — 내 여행 숙소 칸(trip.js opt.nh)의 그 밤 숙소: 여행 중이면 오늘 밤, 도시를 옮기는 날은 전날 밤 숙소도 · 여행 전이면 첫날 밤) ──
function lodges(){ var r=null; try{ r=window.TRIP&&TRIP.stay&&TRIP.stay.now(); }catch(e){} if(!r) return [];
  var out=[], add=function(h){ if(!h||h.type==="here"||!(+h.lat)||!(+h.lng)) return; if(out.some(function(x){ return Math.abs(x.lat-h.lat)<1e-4&&Math.abs(x.lng-h.lng)<1e-4; })) return;
    var p=h.k&&PLACES[h.k]; out.push({t:"h",ko:h.ko||"",nm:p?LN(p):(LANG==="ko"?h.ko:KS(h.en||h.ko)),lat:+h.lat,lng:+h.lng}); };
  add(r.h); add(r.prev); return out; }
function pNm(x){ var p=x&&x.k&&PLACES[x.k]; return p?LN(p):(x?x.nm:""); }   // 우리 명소면 지금 화면 언어 이름 (언어를 바꿔도 그 자리에서)
function fromNm(){ var f=S.from; if(!f) return ""; if(f.t==="me") return F("me");
  if(f.t==="h"){ var h=lodges().filter(function(x){ return Math.abs(x.lat-f.lat)<1e-4&&Math.abs(x.lng-f.lng)<1e-4; })[0]; if(h) return h.nm; } return pNm(f); }
function fromKo(){ var f=S.from; return !f?"":f.t==="me"?"내 위치":f.ko; }
function fromPos(){ var f=S.from; if(!f) return Promise.resolve(null); if(f.t!=="me") return Promise.resolve([f.lat,f.lng]);
  if(ME.pos) return Promise.resolve(ME.pos); return myPos().then(function(p){ if(p){ try{ meSet(p); }catch(e){} } return p; }); }
// ── 장소 찾기: 우리 명소(어느 언어 이름이든) 먼저 + 허브 /kplace (그 언어 이름) ──
var MAPS=null;
function maps(){ return MAPS||(MAPS=Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).catch(function(){})); }
function find(q,ps){ var n=spinNorm(q);
  return maps().then(function(){ var own=[];
    if(n.length>=2) for(var k in PLACES){ if(k.charAt(0)==="_") continue; var p=PLACES[k]; if(!p||!(+p.lat)) continue;
      var hit=[p.ko,p.en,p.ja,p.zhs,p.zht,p.es].some(function(s){ var a=spinNorm(s); return a&&(a.indexOf(n)>=0||(a.length>=3&&n.indexOf(a)>=0)); });
      if(hit) own.push({k:k,nm:LN(p),ko:p.ko,lat:+p.lat,lng:+p.lng,sub:LANG==="ko"?(p.addr||""):(p.addr_en||p.addr||"")}); }
    own.sort(function(a,b){ return (spinNorm(a.ko)===n?0:1)-(spinNorm(b.ko)===n?0:1)||a.ko.length-b.ko.length; }); own=own.slice(0,3);
    return fetch(HUB+"/kplace?q="+encodeURIComponent(q)+kpL()+(ps?"&ux="+(+ps[1]).toFixed(5)+"&uy="+(+ps[0]).toFixed(5):"")).then(function(r){ return r.json(); }).catch(function(){ return null; }).then(function(j){
      var it=((j&&j.ok&&j.items)||[]).map(function(x){ return {nm:LANG==="ko"?x.name:KS(x.name_en||x.name),ko:x.name,lat:+x.y,lng:+x.x,sub:LANG==="ko"?(x.addr||""):(x.addr_en||x.addr||"")}; })
        .filter(function(x){ return isFinite(x.lat)&&isFinite(x.lng)&&!own.some(function(o){ return km2([o.lat,o.lng],[x.lat,x.lng])<0.15; }); });
      var all=own.concat(it).slice(0,8); if(ps) all.forEach(function(x){ x.d=km2(ps,[x.lat,x.lng]); }); return all; }); }); }
function kmT(k){ return k<1?Math.round(k*1000)+" m":(k<10?k.toFixed(1):Math.round(k))+" km"; }
function search(w){ var q=(w==="f"?S.fq:S.tq).trim(); if(!q) return; if(w==="f"){ S.fst="ld"; S.fc=null; } else { S.tst="ld"; S.tc=null; } paint();
  var ps=w==="t"&&S.from&&S.from.t!=="me"?[S.from.lat,S.from.lng]:ME.pos;
  find(q,ps).then(function(a){ if(w==="f"){ S.fc=a; S.fst=""; } else { S.tc=a; S.tst=""; } paint(); },function(){ if(w==="f") S.fst="err"; else S.tst="err"; paint(); }); }
// ── 길찾기 (허브 /ntransit) ──
function route(){ if(!S.to) return; S.st="ld"; S.err=""; S.R=null; S.W=null; S.open={}; S.TT={}; paint();
  var my=(S.seq=(S.seq||0)+1);
  fromPos().then(function(a){ if(my!==S.seq) return;
    if(!a){ S.st="err"; S.err="loc"; paint(); return; }
    S.a=[+a[0],+a[1]]; if(km2(S.a,[S.to.lat,S.to.lng])<0.05){ S.st="err"; S.err="same"; paint(); return; }
    var lg=LANG; S.at=kstMin(); walkGet(my,lg);
    return fetch(HUB+"/ntransit?a="+S.a[0].toFixed(6)+","+S.a[1].toFixed(6)+"&b="+(+S.to.lat).toFixed(6)+","+(+S.to.lng).toFixed(6)+"&lang="+encodeURIComponent(lg)).then(function(r){ return r.json(); }).then(function(j){ if(my!==S.seq) return;
      if(!j||!j.ok){ S.st="err"; S.err=j&&j.err==="same"?"same":"err"; paint(); return; }
      S.R=j; S.rl=lg; S.st="ok"; wantApply(); paint(); wantJump(); try{ ntap("_transit","transit"); }catch(e){} }); })
  .catch(function(){ if(my!==S.seq) return; S.st="err"; S.err="err"; paint(); }); }

// ── 화면 ──
function css(){ if(document.getElementById("tkCss")) return; var s=document.createElement("style"); s.id="tkCss";
  s.textContent="#gfchips .tkchip{display:inline-block;width:auto;margin:0;border:1.5px solid #2f9e44;background:#ebfbee;color:#2b8a3e;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:none}"   // 앱 상징색 초록 (규칙서 4)
  +".tklock,.tklock body{overflow:hidden}#tkBox{position:fixed;inset:0;z-index:1036;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}"
  +"#tkBox .tkin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px;box-sizing:border-box}"
  +"@media (min-width:700px){#tkBox{overflow:hidden}#tkBox .tkin{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:var(--sub,#8a94a6) var(--line,#e6e9ef);padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}}"   // 선물 고르기·편의시설 창과 같은 틀 — 가운데 칸
  +".tktop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin-bottom:4px}.tkx{width:34px;height:34px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}"
  +".tklb{font-weight:900;font-size:14px;margin:12px 2px 6px;color:var(--sub)}.tkfs{display:flex;flex-wrap:wrap;gap:6px}"
  +".tkf{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:6px 12px;font-size:13.5px;font-weight:800;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
  +".tkf.on{border-color:#2f9e44;background:#ebfbee;color:#2b8a3e}:root[data-theme=dark] .tkf.on{background:transparent;color:#69db7c}"
  +".tkq{display:flex;gap:6px;margin-top:8px}.tkq input{flex:1;min-width:0;border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;font-size:16px;background:var(--card);color:var(--ink);font-family:inherit}"
  +".tkq input:focus{outline:0;border-color:#2f9e44}.tkq button{border:0;border-radius:12px;background:#2f9e44;color:#fff;font-weight:900;padding:0 18px;font-size:15px;cursor:pointer;white-space:nowrap}"
  +".tkcs{margin:4px 0 0}.tkc{display:block;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:9px 4px;cursor:pointer;font-size:14.5px;font-family:inherit}"
  +".tkc b{display:block}.tkc span{display:block;color:var(--sub);font-size:12.5px;margin-top:1px}.tkmsg{color:var(--sub);font-size:13.5px;margin:8px 2px;line-height:1.5}"
  +".tksel{display:flex;align-items:center;gap:6px;font-weight:800;margin:8px 2px 0;color:#2b8a3e}:root[data-theme=dark] .tksel{color:#69db7c}"
  +".tksum{color:var(--sub);font-size:12.5px;margin:14px 2px 0;line-height:1.5}"
  +".tkbest{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 0}.tkb{text-align:left;border:1.5px solid #2f9e44;background:#ebfbee;color:var(--ink);border-radius:12px;padding:9px 10px;cursor:pointer;font-family:inherit;min-width:0}"
  +".tkb.c{border-color:#f59f00;background:#fff9db}.tkb.one{grid-column:1/-1}.tkb i{font-style:normal;font-weight:900;color:#2b8a3e;font-size:12.5px;display:block}.tkb.c i{color:#e67700}"
  +".tkb b{display:block;font-size:15px;margin:3px 0 1px;line-height:1.35}.tkb>span{display:block;font-size:12.5px;color:var(--sub)}:root[data-theme=dark] .tkb{background:transparent}"
  +".tkg{margin:16px 0 0}.tkg>h4{font-size:15.5px;font-weight:900;margin:0 2px 6px;display:flex;align-items:center}"
  +".tko{background:var(--card);border:1px solid var(--line);border-radius:14px;margin:8px 0;overflow:hidden}.tko.hl{box-shadow:0 0 0 2px #2f9e44}"
  +".tkoh{padding:10px 10px 10px 12px;cursor:pointer}.tkom{flex:1;min-width:0}.tkom>b{font-size:16px}.tkom .s{color:var(--sub);font-size:13px;margin-top:2px;line-height:1.45}.tkom .c{margin-top:5px;font-size:13px;line-height:1.75}"
  +".tkos{border-top:1px solid var(--line);padding:8px 12px 12px;font-size:14px;line-height:1.55}.tkst{display:flex;gap:8px;padding:5px 0}.tkst>.i{flex:0 0 22px;text-align:center;line-height:1.3}.tkst>.t{flex:1;min-width:0}.tkst .s{color:var(--sub);font-size:12.5px}.item .tkst>.t{font-weight:400;font-size:inherit}.item table.tktt{max-width:640px}"   // 검색 결과 카드(.item .t = 카드 제목 굵게)에 넣을 때 칸 글자가 굵어지지 않게 (11-08)
  +".tkst img.miic{height:18px;width:auto}.tklk a{display:inline-block;margin:8px 8px 0 0;border:1px solid #1a73e8;color:#1a73e8;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:800;text-decoration:none}"
  +".tklk a.kride{border-color:#f59f00;color:#c2410c}.tkno{color:var(--sub);font-size:13.5px;margin:2px 4px 4px;line-height:1.5}.tkbad{display:inline-block;padding:1px 7px;border-radius:6px;color:#fff;font-weight:800;font-size:12px;vertical-align:1px;margin-right:4px;white-space:nowrap}"
  +".tkft{color:var(--sub);font-size:11.5px;margin:18px 2px 0;line-height:1.5}"
  +"table.tktt{width:100%;border-collapse:collapse;margin:4px 0 6px;font-size:13px}.tktt td{padding:6px 4px;border-top:1px solid var(--line);white-space:nowrap}.tktt td.f{text-align:right;font-weight:700}";   // 열차 시간표 — index.html table.trn 모양 (trn 은 「내 여행」 번호 동그라미와 이름이 겹쳐 따로)
  document.head.appendChild(s); }
function open(){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  var o=document.getElementById("tkBox"); if(!o){ o=document.createElement("div"); o.id="tkBox"; o.innerHTML='<div class="tkin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("tklock"); try{ ntap("_transit_open","transit"); }catch(e){}
  if(!S.from) S.from={t:"me"}; maps(); paint();
  if(!S.to) setTimeout(function(){ var i=document.getElementById("tkTq"); if(i&&window.matchMedia&&matchMedia("(hover:hover)").matches) i.focus(); },50); }
function close(){ wmStop(); var o=document.getElementById("tkBox"); if(o) o.remove(); document.documentElement.classList.remove("tklock"); }
function cands(w){ var a=w==="f"?S.fc:S.tc, st=w==="f"?S.fst:S.tst;
  if(st==="ld") return '<div class="tkmsg">'+E("srch")+'</div>'; if(st==="err") return '<div class="tkmsg">'+E("err")+'</div>'; if(!a) return "";
  if(!a.length) return '<div class="tkmsg">'+E("none")+'</div>';
  return '<div class="tkcs">'+a.map(function(x,i){ return '<button type="button" class="tkc" data-tk="pk" data-w="'+w+'" data-i="'+i+'"><b>'+MPIMG("mi_pin",MIS)+esc(x.nm)+'</b><span>'+esc(x.sub||"")+(x.d!=null?' · '+kmT(x.d):'')+'</span></button>'; }).join("")+'</div>'; }
function paint(){ var b=document.querySelector("#tkBox .tkin"); if(!b) return; var f=S.from||{}, hs=lodges();
  var h='<div class="tktop"><b>'+MPIMG("mi_subway",MIS)+E("chip")+'</b><button type="button" class="tkx" data-tk="x" aria-label="close">✕</button></div>';
  h+='<div class="tklb">'+E("from")+'</div><div class="tkfs"><button type="button" class="tkf'+(f.t==="me"?' on':'')+'" data-tk="fme">'+MPIMG("mi_pin",MIS)+E("me")+'</button>'
    +hs.map(function(x,i){ var on=f.t==="h"&&Math.abs(f.lat-x.lat)<1e-4&&Math.abs(f.lng-x.lng)<1e-4; return '<button type="button" class="tkf'+(on?' on':'')+'" data-tk="fh" data-i="'+i+'">'+MPIMG("mi_stay",MIS)+esc(x.nm)+'</button>'; }).join("")
    +(f.t==="p"?'<button type="button" class="tkf on" data-tk="fs">'+MPIMG("mi_pin",MIS)+esc(fromNm())+'</button>':'')
    +'<button type="button" class="tkf'+(S.fs?' on':'')+'" data-tk="fs">'+MPIMG("mi_search",MIS)+E("other")+'</button></div>';
  if(S.fs) h+='<div class="tkq"><input id="tkFq" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(F("fph"))+'" value="'+esc(S.fq)+'"><button type="button" data-tk="fgo">'+E("find")+'</button></div>'+cands("f");
  h+='<div class="tklb">'+E("to")+'</div><div class="tkq"><input id="tkTq" type="search" enterkeyhint="search" autocomplete="off" placeholder="'+esc(F("tph"))+'" value="'+esc(S.tq)+'"><button type="button" data-tk="tgo">'+E("find")+'</button></div>'+(window.CHR?CHR.adHtml():"")+cands("t");   // 11-11 사장님 — 검색칸 바로 아래 차량 대절 광고 띠 (charter.js · [자세히] = 상품 화면)
  if(S.to&&!S.tc) h+='<div class="tksel">'+MPIMG("mi_pin",MIS)+esc(pNm(S.to))+'</div>';
  if(!S.to&&!S.tc&&S.tst!=="ld") h+='<div class="tkmsg">'+E("pick")+'</div>';
  if(S.st==="ld") h+='<div class="tkmsg">'+E("route")+'</div>';
  else if(S.st==="err") h+='<div class="tkmsg">'+E(S.err==="loc"?"loc":S.err==="same"?"same":"err")+'</div>';
  else if(S.st==="ok"&&S.R) h+=results();
  b.innerHTML=h; try{ wmPlace(); }catch(e){} }

// ── 결과 ──
function opts(){ var R=S.R, o=[];
  (R.t||[]).forEach(function(p,i){ o.push({id:"t"+i,g:"t",p:p,min:p.min,fare:p.fare}); });
  var x=taxi(); if(x) o.push({id:"x",g:"x",p:x,min:x.min,fare:(x.taxi||0)+(x.toll||0)});
  ["bus","rail"].forEach(function(g){ (R[g]||[]).forEach(function(p,i){ o.push({id:g.charAt(0)+i,g:g,p:p,min:p.min+(p.aa||0)+(p.ab||0),fare:p.fare}); }); });
  if(!o.length) (R.air||[]).forEach(function(p,i){ o.push({id:"a"+i,g:"air",p:p,min:p.min+(p.aa||0)+(p.ab||0)+60,fare:p.fare}); });   // 비행기는 다른 길이 없을 때만 견준다(공항 수속 1시간 어림)
  return o; }
function taxi(){ var R=S.R; if(R.x) return R.x; if(R.dr==="near"||R.dr==="none"||!(R.km>=0.7)) return null;
  var d=R.km*1.35, f=4800+Math.max(0,d-1.6)*770, m=S.at; if(m>=1320||m<240) f*=1.2;   // 네이버 키·상한이 없을 때 — trip.js 와 같은 어림(도로 = 직선 × 1.35 · 기본 4,800원 + km당 약 770원 · 22~04시 약 20% 더)
  return {min:Math.max(5,Math.round(5+d*2.4)),km:Math.round(d*10)/10,taxi:Math.round(f/100)*100,toll:0,est:1}; }
function rideNm(s){ return s.k===1?(LANG==="ko"?String(s.ln||"").replace(/^수도권\s*/,""):s.ln):F("bus",{n:(s.no||[]).map(nm).join(" / ")}); }
function chain(p){ return p.sp.filter(function(s){ return s.k!==3; }).map(function(s,i){ return '<span style="white-space:nowrap">'+(i?'<span style="color:var(--sub)">› </span>':'')+(s.k===1?subBadge(s.ln||"")+esc(rideNm(s)):busIcon(s.bt)+' '+esc(rideNm(s)))+'</span>'; }).join(' '); }   // 탈것마다 한 덩어리 — 줄이 넘어가도 「›」만 따로 떨어지지 않게
function stNm(s,k){ s=nm(s); if(!s) return s; if(k===1||k===4){ var c=s.replace(/\s*(역|駅|站|Station)$/i,"").replace(/^Estación\s+(de\s+)?/i,"");
    return LANG==="ko"?c+"역":LANG==="ja"?c+"駅":/^zh/.test(LANG)?c+"站":LANG==="es"?"Estación "+c:c+" Station"; }   // 지하철·기차역 — 장소 이름과 헷갈리지 않게 「역」(odsBox 와 같은 생각, 11-07)
  return s; }
function stopNm(s,k){ var n=stNm(s,k); if(k!==2||!n) return n;   // 걷는 구간 끝이 버스 정류장이면 「정류장」을 붙인다 — 장소 이름과 헷갈리지 않게 (odsBox 와 같은 생각)
  if(LANG==="ko") return /(정류장|정류소)$/.test(n)?n:n+" 정류장"; return LANG==="ja"?n+" バス停":LANG==="zhs"?n+" 公交站":LANG==="zht"?n+" 公車站":LANG==="es"?"Parada "+n:n+" bus stop"; }
function icNm(l,w){ return l.k===4?stNm(w==="s"?l.s:l.e,4):nm(w==="s"?l.s:l.e); }
function kx(l,w){ var la=w==="s"?l.sy:l.ey, lo=w==="s"?l.sx:l.ex, b=-1, bd=1e9; if(!Array.isArray(window.KXS)) return null;   // KTX 역(KXS) — 좌표가 600m 안이면 같은 역 (TAGO 코드·SRT 알아보기)
  KXS.forEach(function(s,i){ var d=km2([la,lo],[s[2],s[3]]); if(d<bd){ bd=d; b=i; } }); return b>=0&&bd<0.6?KXS[b]:null; }
function railGr(p){ var l=p.legs.filter(function(x){ return x.k===4; })[0]||p.legs[0], a=kx(l,"s"), b=kx(l,"e");
  if(l.tt&&l.tt!==1) return F("x4"); return (a&&/SRT/.test(a[4]))||(b&&/SRT/.test(b[4]))?"SRT":"KTX"; }   // ODsay trainType 1 = 고속열차(실측 11-07 — 수서 출발도 1) → 수서·동탄이면 SRT
function badge(t,c){ return '<span class="tkbad" style="background:'+c+'">'+esc(t)+'</span>'; }
function icHead(p,g){ var f=p.legs[0], z=p.legs[p.legs.length-1], t=icNm(f,"s")+" → "+icNm(z,"e");
  if(g==="rail"){ var gr=railGr(p); return badge(gr,gr==="SRT"?"#7b2d8e":gr==="KTX"?"#1f4fa3":"#5b6474")+esc(t); }
  if(g==="air") return MPIMG("mi_plane",MIS)+esc(t);
  return MPIMG("mi_bus",MIS)+esc(F(p.k===6?"x6":"x5"))+' · '+esc(t); }
function freq(l){ if(!l||!l.cnt) return ""; return F("daily",{n:l.cnt})+(l.iv&&l.iv<120&&l.cnt>2?" · "+F("every",{n:l.iv}):""); }
function best(o){ if(o.length<2) return "";
  var fa=o.slice().sort(function(a,b){ return a.min-b.min||a.fare-b.fare; })[0], ch=o.filter(function(x){ return x.fare>0; }).sort(function(a,b){ return a.fare-b.fare||a.min-b.min; })[0];
  var card=function(x,lb,cl){ var p=x.p, t;
    if(x.g==="t") t=chain(p); else if(x.g==="x") t=MPIMG("mi_taxi",MIS)+E("gX"); else t=icHead(p,x.g);
    var s=(x.g==="t"||x.g==="x"?dur(x.min):F("d2d",{d:dur(x.min)}))+(x.fare?" · "+(x.g==="x"&&p.est?"~":"")+won(x.fare):"");
    return '<button type="button" class="tkb'+cl+'" data-tk="jump" data-id="'+x.id+'"><i>'+lb+'</i><b>'+t+'</b><span>'+esc(s)+'</span></button>'; };
  if(!ch||ch.id===fa.id) return '<div class="tkbest">'+card(fa,E("fast")+(ch?" · "+E("cheap"):""),' one')+'</div>';
  return '<div class="tkbest">'+card(fa,E("fast"),'')+card(ch,E("cheap"),' c')+'</div>'; }
function mapLinks(mode){ var a=S.a, b=[+S.to.lat,+S.to.lng], L=function(h,t){ return '<a href="'+esc(h)+'" target="_blank" rel="noopener">'+t+'</a>'; };
  var A=m3857(a[0],a[1]), B=m3857(b[0],b[1]), nv="https://map.naver.com/p/directions/"+A[0]+","+A[1]+","+encodeURIComponent(fromKo())+",,/"+B[0]+","+B[1]+","+encodeURIComponent(S.to.ko||"")+",,/-/"+(mode==="car"?"car":mode==="walk"?"walk":"transit");
  if(mode==="car") return L(nv,MPIMG("mi_map",MIS)+E(LANG==="ko"?"nvMap":"nvCar"));
  if(mode==="walk") return L(nv,MPIMG("mi_map",MIS)+E(LANG==="ko"?"nvMap":"nvWalk"));   // 걷기도 네이버 (구글은 한국 걷기 길 없음)   // 구글은 한국 자동차 길을 안 준다
  if(LANG==="ko") return L(nv,MPIMG("mi_map",MIS)+E("nvMap"));
  var gid=S.to&&S.to.gid; return L("https://www.google.com/maps/dir/?api=1"+hlG()+"&origin="+a[0]+","+a[1]+"&destination="+b[0]+","+b[1]+((gid&&/^ChI/.test(gid))?"&destination_place_id="+encodeURIComponent(gid):"")+"&travelmode=transit",MPIMG("mi_map",MIS)+E("gMap")); }
function stepRow(ic,t,s){ return '<div class="tkst"><span class="i">'+ic+'</span><span class="t">'+t+(s?'<div class="s">'+s+'</div>':'')+'</span></div>'; }
function tSteps(p){ var sp=p.sp, A=fromNm(), Z=pNm(S.to);
  return sp.map(function(s,i){
    if(s.k===3){ if(!(s.min>0)) return ""; var pv=null, nx=null, j; for(j=i-1;j>=0;j--) if(sp[j].k!==3){ pv=sp[j]; break; } for(j=i+1;j<sp.length;j++) if(sp[j].k!==3){ nx=sp[j]; break; }
      var a=pv?stopNm(pv.e,pv.k)+(pv.k===1&&pv.xe?" "+F("exit",{n:pv.xe}):""):A, z=nx?stopNm(nx.s,nx.k)+(nx.k===1&&nx.xs?" "+F("exit",{n:nx.xs}):""):Z;
      return stepRow(MPIMG("mi_walk",MIS),esc(F("walk",{a:a,b:z,d:dur(s.min)})),s.m?esc(kmT(s.m/1000)):""); }
    var ic=s.k===1?subBadge(s.ln||""):busIcon(s.bt);
    return stepRow(ic,'<b>'+esc(rideNm(s))+'</b> '+esc(stNm(s.s,s.k))+' → '+esc(stNm(s.e,s.k)),esc((s.n?F(s.k===1?"stopsS":"stopsB",{n:s.n})+" · ":"")+dur(s.min))); }).join(""); }
function icSteps(p,g,id){ var f=p.legs[0], z=p.legs[p.legs.length-1], A=fromNm(), Z=pNm(S.to), h="";
  var acc=function(a,b,k,m){ if(k<0.25) return "";   /* 역·터미널 바로 앞(250m 안)이면 줄을 안 쓴다 */ return stepRow(MPIMG(k<=0.8?"mi_walk":"mi_subway",MIS),esc(F(k<=0.8?"walk":"acc",{a:a,b:b,d:dur(m)}))); };
  if(p.aa!=null) h+=acc(A,icNm(f,"s"),km2(S.a,[f.sy,f.sx]),p.aa);
  p.legs.forEach(function(l){ var ic=l.k===4?badge(g==="rail"&&l===f?railGr(p):F("x4"),"#1f4fa3"):l.k===7?MPIMG("mi_plane",MIS):MPIMG("mi_bus",MIS);
    h+=stepRow(ic,'<b>'+esc(l.k===4?"":F("x"+l.k)+" ")+'</b>'+esc(icNm(l,"s")+" → "+icNm(l,"e")),esc(dur(l.min)+(l.fare?" · "+won(l.fare):"")+(freq(l)?" · "+freq(l):"")));
    if(l.k===4) h+=ttHtml(l,id,p); });
  if(p.ab!=null) h+=acc(icNm(z,"e"),Z,km2([z.ey,z.ex],[+S.to.lat,+S.to.lng]),p.ab);
  return h; }
// 열차 시간표 — TAGO(허브 /train, 무료·30분 캐시) · 두 역이 다 KXS 안일 때만 · 역까지 어림 뒤 출발하는 KTX·SRT 5편 (오늘 남은 게 없으면 내일)
function ttHtml(l,id,p){ var a=kx(l,"s"), b=kx(l,"e"); if(!a||!b) return ""; var key=a[1]+">"+b[1], T0=S.TT[key];
  if(!T0){ T0=S.TT[key]={st:"ld"}; ttLoad(key,a[1],b[1]); }
  if(T0.st==="ld") return '<div class="tkno">'+E("ttLd")+'</div>'; if(T0.st!=="ok") return '<div class="tkno">'+E("ttNo")+'</div>';
  var hs=(l.tt===1||!l.tt), after=S.at+(p.aa||0), list=function(it){ return it.filter(function(x){ var g=trGrade(x); return !hs||/^(KTX|SRT)/.test(g); }); };
  var td=list(T0.d).filter(function(x){ return +x.dp.slice(0,2)*60+ +x.dp.slice(2)>=after; }), tm=false;
  if(!td.length){ td=list(T0.m||[]); tm=true; } if(!td.length) return '<div class="tkno">'+E("ttNo")+'</div>';
  return '<div class="trh" style="font-size:13.5px">'+E("tt")+' · '+E(tm?"tmrw":"today")+'</div><table class="tktt">'+td.slice(0,5).map(function(x){ var m=(+x.ar.slice(0,2)*60+ +x.ar.slice(2))-(+x.dp.slice(0,2)*60+ +x.dp.slice(2)); if(m<0) m+=1440;
    return '<tr><td>'+trBadge(trGrade(x))+'</td><td>'+x.dp.slice(0,2)+":"+x.dp.slice(2)+' → '+x.ar.slice(0,2)+":"+x.ar.slice(2)+'</td><td>'+esc(dur(m))+'</td><td class="f">'+(x.fare?won(x.fare):"-")+'</td></tr>'; }).join("")+'</table>'; }
function kday(add){ return new Date(Date.now()+9*3600e3+(add||0)*864e5).toISOString().slice(0,10).replace(/-/g,""); }
function ttGet(a,b,d){ var TC=window._trC||(window._trC={}), ck=a+"|"+b+"|"+d;   // index.html 열차 칸과 같은 캐시
  return (TC[ck]||(TC[ck]=fetch(HUB+"/train?dep="+a+"&arr="+b+"&date="+d).then(function(r){ return r.json(); }).catch(function(e){ delete TC[ck]; throw e; }))).then(function(j){ return ((j&&j.ok&&j.items)||[]).filter(function(x){ return /^\d{4}$/.test(x.dp)&&/^\d{4}$/.test(x.ar); }).sort(function(p,q){ return p.dp<q.dp?-1:1; }); }); }
function ttLoad(key,a,b){ var st=S, rp=function(){ if(st===IC) icPaint(); else paint(); };   // 부른 쪽(교통 창 · 검색 결과 카드 IC)에 시간표를 넣고 그쪽을 다시 그린다 (11-08)
  Promise.all([ttGet(a,b,kday(0)),ttGet(a,b,kday(1)).catch(function(){ return []; })]).then(function(r){ st.TT[key]={st:"ok",d:r[0],m:r[1]}; rp(); },function(){ st.TT[key]={st:"err"}; rp(); }); }
function book(p,g){ var L=function(h,t){ return '<a href="'+h+'" target="_blank" rel="noopener">'+t+'</a>'; };
  if(g==="rail") return railGr(p)==="SRT"?L("https://etk.srail.kr/",MPIMG("mi_ticket",MIS)+E("bkS")):L("https://www.letskorail.com/",MPIMG("mi_ticket",MIS)+E("bkK"));
  if(g==="bus") return p.k===6?L("https://txbus.t-money.co.kr/",MPIMG("mi_ticket",MIS)+E("bk6")):L("https://www.kobus.co.kr/",MPIMG("mi_ticket",MIS)+E("bk5"));
  if(g==="air") return L("https://www.google.com/travel/flights?hl="+({ko:"ko",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en"),MPIMG("mi_ticket",MIS)+E("bkA"));
  return ""; }
function card(id,g,p){ var on=!!S.open[id], hd="", sb="", body="";
  if(g==="t"){ hd='<b>'+esc(dur(p.min))+'</b> · '+esc(won(p.fare))+' · '+E(p.x?"xfer":"xfer0",{n:p.x,s:p.x>1?"s":""}); sb='<div class="s">'+E("dep",{a:hm(S.at),b:hm(S.at+p.min)})+'</div><div class="c">'+chain(p)+'</div>'; }
  else if(g==="x"){ hd='<b>'+esc(F("taxiT",{d:dur(p.min)}))+'</b> · '+(p.est?"~":"")+esc(won(p.taxi))+(p.est?' ('+E("est")+')':'');
    sb='<div class="s">'+E("dep",{a:hm(S.at),b:hm(S.at+p.min)})+' · '+esc(kmT(p.km))+(p.toll?' · '+E("toll",{f:won(p.toll)}):'')+'</div>'; }
  else { hd='<b>'+icHead(p,g)+'</b>'; var f0=p.legs[0]; sb='<div class="s">'+esc(dur(p.min)+" · "+won(p.fare)+(freq(f0)?" · "+freq(f0):""))+'</div>'+(p.aa!=null?'<div class="s">'+E("d2d",{d:dur(p.min+p.aa+p.ab)})+'</div>':''); }
  if(on){ if(g==="t") body=tSteps(p)+'<div class="tklk">'+mapLinks("transit")+'</div>';
    else if(g==="x") body=(p.est?'':'<div class="tkno" style="margin:0 0 2px">'+E("live")+'</div>')+'<div class="tklk">'+(LANG==="ko"?kakaoTL(S.to.ko,S.to.sub||""):krideL(S.to.ko,S.to.sub||""))+mapLinks("car")+'</div>';
    else body=icSteps(p,g,id)+'<div class="tklk">'+book(p,g)+mapLinks("transit")+'</div>'; }
  return '<div class="tko" id="tk_'+id+'"><div class="tkoh xtrow" data-tk="tg" data-id="'+id+'"><div class="tkom">'+hd+sb+'</div>'+XTG.html(on)+'</div>'+(on?'<div class="tkos">'+body+'</div>':'')+'</div>'; }
function results(){ var R=S.R, o=opts(), h='', bad=/^(cap|busy|relay)$/.test(R.od), nearL='<div class="tkno">'+E("near",{d:dur(walkMin(R.km))})+'</div>';
  h+='<div class="tksum">'+esc(fromNm())+' → '+esc(pNm(S.to))+' · '+E("km",{k:kmT(R.km)})+' · '+E("at",{t:hm(S.at)})+'</div>';
  if(bad) h+='<div class="tkmsg">'+E(R.od==="cap"?"cap":"busy")+'<div class="tklk">'+mapLinks("transit")+'</div></div>';
  h+=best(o);
  var grp=function(ic,k,list,g,noK){ return '<div class="tkg"><h4>'+MPIMG(ic,MIS)+E(k)+'</h4>'+(list.length?list.map(function(p,i){ return card(g.charAt(0)+i,g,p); }).join(""):'<div class="tkno">'+(R.od==="near"?nearL:bad?E("na"):E(noK))+'</div>')+'</div>'; };
  if(S.W) h+=wGrp();
  h+=grp("mi_subway","gT",R.t||[],"t","nT");
  var x=taxi(); h+='<div class="tkg"><h4>'+MPIMG("mi_taxi",MIS)+E("gX")+'</h4>'+(x?card("x","x",x):'<div class="tkno">'+(R.dr==="near"?nearL:E("nX"))+'</div>')+'</div>';
  h+=grp("mi_bus","gB",R.bus||[],"bus","nB");
  h+=grp("mi_train","gR",R.rail||[],"rail","nR");
  if((R.air||[]).length) h+=grp("mi_plane","gA",R.air,"air","nR");
  return h+'<div class="tkft">'+E("src")+'</div>'; }

// ── 걷기 (사장님 11-07 「5km 이하면 걷기 · 지도에 내 위치 · 가는 방향 화살표」) ──
//  · 직선 5km 안이면 맨 위에 「걷기」 — 허브 /nwalk(티맵 보행자 길, 하루 캐시) · 펼치면 네이버 지도에 길(초록 선)·출발/도착·내 위치(파란 점, 펼친 동안만 위치 따라감)·내 앞 길 위 방향 화살표 하나
//  · 안내 문장은 티맵 회전 번호로 6개 언어를 여기서 만든다(티맵은 한국어만) · 길 이름은 도로명판 표기, 근처 이름(역 출구 등)은 그 언어 — 허브가 바꿔 줌
//  · 길을 못 받으면(상한·오류) 지도에 도착지 쪽 곧은 점선 + 화살표만
var XW={
  gW:{ko:"걷기",en:"Walk",ja:"徒歩",zhs:"步行",zht:"步行",es:"A pie"},
  walkT:{ko:"걸어서 {d}",en:"Walk · {d}",ja:"徒歩 {d}",zhs:"步行 {d}",zht:"步行 {d}",es:"A pie · {d}"},
  wLd:{ko:"걷는 길 찾는 중…",en:"Finding the walking route…",ja:"徒歩ルートを検索中…",zhs:"正在查找步行路线…",zht:"正在查詢步行路線…",es:"Buscando la ruta a pie…"},
  wNo:{ko:"걷는 길을 지금 받지 못했어요. 지도에는 도착지 방향만 보여 드려요.",en:"Couldn't get the walking route right now. The map shows only the direction to your destination.",ja:"徒歩ルートを取得できませんでした。地図には目的地の方向だけを表示します。",zhs:"暂时无法获取步行路线，地图上只显示目的地方向。",zht:"暫時無法取得步行路線，地圖上只顯示目的地方向。",es:"No se pudo obtener la ruta a pie. El mapa muestra solo la dirección del destino."},
  wSrc:{ko:"걷는 길 TMAP · 시간은 참고용이에요",en:"Walking route by TMAP · times are for reference",ja:"徒歩ルート TMAP・時間は目安です",zhs:"步行路线 TMAP · 时间仅供参考",zht:"步行路線 TMAP · 時間僅供參考",es:"Ruta a pie: TMAP · tiempos orientativos"},
  nvWalk:{ko:"네이버 지도로 보기",en:"Walking route on Naver Map",ja:"NAVERマップで徒歩ルート",zhs:"在 NAVER 地图查看步行路线",zht:"在 NAVER 地圖查看步行路線",es:"Ruta a pie en Naver Map"},
  along:{ko:"{r} 따라 {m}",en:"along {r} · {m}",ja:"{r}沿いに {m}",zhs:"沿{r} {m}",zht:"沿{r} {m}",es:"por {r} · {m}"},
  atP:{ko:"{p}에서 {a}",en:"{a} at {p}",ja:"{p}で{a}",zhs:"在{p}{a}",zht:"在{p}{a}",es:"{a} en {p}"},
  s200:{ko:"출발",en:"Start",ja:"出発",zhs:"出发",zht:"出發",es:"Salida"},
  s201:{ko:"도착",en:"Arrive",ja:"到着",zhs:"到达",zht:"抵達",es:"Llegada"},
  s11:{ko:"직진",en:"Go straight",ja:"直進",zhs:"直行",zht:"直行",es:"Sigue recto"},
  s12:{ko:"좌회전",en:"Turn left",ja:"左折",zhs:"左转",zht:"左轉",es:"Gira a la izquierda"},
  s13:{ko:"우회전",en:"Turn right",ja:"右折",zhs:"右转",zht:"右轉",es:"Gira a la derecha"},
  s14:{ko:"유턴",en:"Make a U-turn",ja:"Uターン",zhs:"掉头",zht:"迴轉",es:"Da la vuelta"},
  s16:{ko:"8시 방향 좌회전",en:"Sharp left",ja:"左後方へ曲がる",zhs:"向左后方转",zht:"向左後方轉",es:"Giro cerrado a la izquierda"},
  s17:{ko:"10시 방향 좌회전",en:"Slight left",ja:"左前方へ進む",zhs:"向左前方走",zht:"向左前方走",es:"Ligeramente a la izquierda"},
  s18:{ko:"2시 방향 우회전",en:"Slight right",ja:"右前方へ進む",zhs:"向右前方走",zht:"向右前方走",es:"Ligeramente a la derecha"},
  s19:{ko:"4시 방향 우회전",en:"Sharp right",ja:"右後方へ曲がる",zhs:"向右后方转",zht:"向右後方轉",es:"Giro cerrado a la derecha"},
  s125:{ko:"육교로 건너기",en:"Cross by the footbridge",ja:"歩道橋を渡る",zhs:"走过街天桥",zht:"走天橋",es:"Cruza por la pasarela"},
  s126:{ko:"지하보도로 건너기",en:"Cross by the underpass",ja:"地下道を通る",zhs:"走地下通道",zht:"走地下道",es:"Cruza por el paso subterráneo"},
  s127:{ko:"계단",en:"Take the stairs",ja:"階段を進む",zhs:"走楼梯",zht:"走樓梯",es:"Toma las escaleras"},
  s128:{ko:"경사로",en:"Take the ramp",ja:"スロープを進む",zhs:"走坡道",zht:"走坡道",es:"Toma la rampa"},
  s129:{ko:"계단 또는 경사로",en:"Stairs or ramp",ja:"階段またはスロープ",zhs:"楼梯或坡道",zht:"樓梯或坡道",es:"Escaleras o rampa"},
  s211:{ko:"횡단보도 건너기",en:"Cross at the crosswalk",ja:"横断歩道を渡る",zhs:"过人行横道",zht:"過斑馬線",es:"Cruza por el paso de peatones"},
  s212:{ko:"왼쪽 횡단보도 건너기",en:"Cross at the crosswalk on your left",ja:"左の横断歩道を渡る",zhs:"走左侧人行横道",zht:"走左側斑馬線",es:"Cruza por el paso de peatones de la izquierda"},
  s213:{ko:"오른쪽 횡단보도 건너기",en:"Cross at the crosswalk on your right",ja:"右の横断歩道を渡る",zhs:"走右侧人行横道",zht:"走右側斑馬線",es:"Cruza por el paso de peatones de la derecha"},
  s218:{ko:"엘리베이터 타기",en:"Take the elevator",ja:"エレベーターに乗る",zhs:"乘电梯",zht:"搭電梯",es:"Toma el ascensor"}
};
for(var kw in XW) X[kw]=XW[kw];
var WAR={11:"↑",233:"↑",12:"↰",13:"↱",14:"↶",16:"↙",17:"↖",18:"↗",19:"↘"};   // 회전 화살표 (글자) — 건너기·계단·엘리베이터는 걷는 사람 아이콘
function wKey(t){ t=+t; if(t>=214&&t<=217) return "s211"; if(t===233) return "s11"; return X["s"+t]?"s"+t:"s11"; }
function wIc(t){ t=+t; if(t===200) return '<span class="tkar o"></span>'; if(t===201) return MPIMG("mi_pin",MIS); if(WAR[t]) return '<span class="tkar">'+WAR[t]+'</span>'; return MPIMG("mi_walk",MIS); }
function wCss(){ if(document.getElementById("tkWCss")) return; var s=document.createElement("style"); s.id="tkWCss";
  s.textContent=".tkwm{position:relative;height:300px;margin:2px 0 10px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#e9ecef}@media (min-width:700px){.tkwm{height:380px}}"
  +".tkwm .tkwmap{width:100%;height:100%}.tkwme{position:absolute;right:8px;top:8px;z-index:5;border:1px solid #c9ced8;background:#fff;color:#1a73e8;border-radius:999px;padding:5px 11px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.15);font-family:inherit}"
  +".tkar{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#2f9e44;color:#fff;font-weight:900;font-size:14px;line-height:1}.tkar.o{width:14px;height:14px;margin:4px;background:#fff;border:4px solid #2f9e44;box-sizing:border-box}"
  +".tkst.wst{cursor:pointer;border-radius:8px}.tkst.wst:hover{background:rgba(47,158,68,.07)}";
  document.head.appendChild(s); }
function wGrp(){ wCss(); var W=S.W, R=S.R, on=!!S.open.w, hd, sb, body="";
  if(W.k==="ok"){ hd='<b>'+esc(F("walkT",{d:dur(W.min)}))+'</b> · '+esc(kmT(W.m/1000)); sb='<div class="s">'+E("dep",{a:hm(S.at),b:hm(S.at+W.min)})+'</div>'; }
  else { var em=walkMin(R.km); hd='<b>'+esc(F("walkT",{d:dur(em)}))+'</b> ('+E("est")+')'; sb='<div class="s">'+(W.k==="ld"?E("wLd"):E("dep",{a:hm(S.at),b:hm(S.at+em)}))+'</div>'; }
  if(on){ body='<div id="tkWm" class="tkwm"><button type="button" class="tkwme" data-tk="wme">◎ '+E("me")+'</button></div>';
    if(W.k==="ok") body+=wSteps(W);
    else if(W.k==="ld") body+='<div class="tkno">'+E("wLd")+'</div>';
    else body+='<div class="tkno">'+E("wNo")+'</div>';
    body+='<div class="tklk">'+mapLinks("walk")+'</div><div class="tkft" style="margin-top:8px">'+E("wSrc")+'</div>'; }
  return '<div class="tkg"><h4>'+MPIMG("mi_walk",MIS)+E("gW")+'</h4><div class="tko" id="tk_w"><div class="tkoh xtrow" data-tk="tg" data-id="w"><div class="tkom">'+hd+sb+'</div>'+XTG.html(on)+'</div>'+(on?'<div class="tkos">'+body+'</div>':'')+'</div></div>'; }
function wSteps(W){ var Z=pNm(S.to), A=fromNm();
  return W.steps.map(function(s,i){ var t=+s.t, a=F(wKey(t)), ti, sub="";
    if(t===200){ ti=F("s200")+" · "+A; } else if(t===201){ ti=F("s201")+" · "+Z; } else ti=s.pn?F("atP",{p:s.pn,a:LANG==="en"||LANG==="es"?a.charAt(0).toLowerCase()+a.slice(1):a}):a;
    if(LANG==="en"||LANG==="es") ti=ti.charAt(0).toUpperCase()+ti.slice(1);
    if(t!==201&&s.m>0) sub=s.rd?F("along",{r:s.rd,m:kmT(s.m/1000)}):kmT(s.m/1000);
    return '<div class="tkst wst" data-tk="wst" data-i="'+i+'"><span class="i">'+wIc(t)+'</span><span class="t">'+esc(ti)+(sub?'<div class="s">'+esc(sub)+'</div>':'')+'</span></div>'; }).join(""); }
// 지도 — 지도 칸(div)은 하나를 만들어 두고 다시 그릴 때마다 옮겨 붙인다(paint 가 innerHTML 을 통째로 바꿔도 지도가 안 깨지게)
var WM={el:null,map:null,key:"",objs:[],me:null,wid:null,pos:null};
function LL(p){ return new naver.maps.LatLng(p[0],p[1]); }
function wBear(a,b){ var rd=Math.PI/180, y=Math.sin((b[1]-a[1])*rd)*Math.cos(b[0]*rd), x=Math.cos(a[0]*rd)*Math.sin(b[0]*rd)-Math.sin(a[0]*rd)*Math.cos(b[0]*rd)*Math.cos((b[1]-a[1])*rd); return (Math.atan2(y,x)/rd+360)%360; }
function wAhead(pts,p,ahead){   // 화살표 하나 — 내 위치에서 가장 가까운 길 위 점부터 ahead(m) 앞, 그 구간 방향 (사장님 11-07 「하나만, 내가 이동한 앞에」)
  var lat0=pts[0][0], kx=Math.cos(lat0*Math.PI/180)*111320, ky=110540, XY=function(q){ return [(q[1]-pts[0][1])*kx,(q[0]-lat0)*ky]; }, bi=0, bt=0, bd=1e9, i;
  if(p){ var P=XY(p); for(i=0;i<pts.length-1;i++){ var A=XY(pts[i]), B=XY(pts[i+1]), dx=B[0]-A[0], dy=B[1]-A[1], L2=dx*dx+dy*dy, t=L2?Math.max(0,Math.min(1,((P[0]-A[0])*dx+(P[1]-A[1])*dy)/L2)):0, ex=A[0]+dx*t-P[0], ey=A[1]+dy*t-P[1], d=Math.sqrt(ex*ex+ey*ey); if(d<bd){ bd=d; bi=i; bt=t; } }
    if(bd>300){ bi=0; bt=0; } }   // 길에서 300m 넘게 떨어져 있으면(아직 출발 전) 출발점 앞에
  var left=ahead; i=bi;
  while(i<pts.length-1){ var sl=km2(pts[i],pts[i+1])*1000, rest=sl*(1-bt); if(sl>0&&rest>=left){ var f=bt+left/sl, a=pts[i], b=pts[i+1]; return {p:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],r:wBear(a,b)}; } left-=rest; i++; bt=0; }
  var n=pts.length; return {p:pts[n-1],r:wBear(pts[n-2],pts[n-1])}; }
function wmArrow(){ if(!WM.map||!WM.pts||WM.pts.length<2||!window.naver) return;   // 화면에서 손가락 한 마디(약 34px) 앞 — 확대·축소하면 다시 맞춘다
  var mpp=156543.03*Math.cos(WM.pts[0][0]*Math.PI/180)/Math.pow(2,WM.map.getZoom()), x=wAhead(WM.pts,WM.pos||ME.pos,Math.max(12,Math.min(150,34*mpp)));
  var ic={content:'<div style="width:28px;height:28px;transform:rotate('+Math.round(x.r)+'deg);filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))"><svg viewBox="0 0 18 18" width="28" height="28"><path d="M9 2.5 L14.5 13 L9 10.2 L3.5 13 Z" fill="#fff" stroke="#1b6e30" stroke-width="1.3" stroke-linejoin="round"/></svg></div>',anchor:new naver.maps.Point(14,14)};
  if(!WM.ar) WM.ar=new naver.maps.Marker({map:WM.map,position:LL(x.p),clickable:false,zIndex:150,icon:ic}); else { WM.ar.setPosition(LL(x.p)); WM.ar.setIcon(ic); } }
function wmPlace(){ var ph=document.getElementById("tkWm"); if(!ph){ wmStop(); return; }
  if(!WM.el){ WM.el=document.createElement("div"); WM.el.className="tkwmap"; }
  ph.insertBefore(WM.el,ph.firstChild); wmWatch();
  nmLoad(function(){ if(document.getElementById("tkWm")!==ph||!WM.el.isConnected) return; try{ wmDraw(); }catch(e){} }); }
function wmDraw(){ var W=S.W, a=S.a, b=[+S.to.lat,+S.to.lng], ok=W&&W.k==="ok";
  if(!WM.map){ WM.map=new naver.maps.Map(WM.el,{center:LL(a),zoom:16,zoomControl:false,mapDataControl:false,scaleControl:false});
    naver.maps.Event.addListener(WM.map,"zoom_changed",function(){ try{ wmArrow(); }catch(e){} }); }
  else { try{ WM.map.setSize(new naver.maps.Size(WM.el.offsetWidth,WM.el.offsetHeight)); }catch(e){} }
  var key=S.seq+"|"+(W?W.k:"")+"|"+a.join(",")+"|"+b.join(",");
  if(WM.key!==key){ WM.key=key; WM.objs.forEach(function(o){ try{ o.setMap(null); }catch(e){} }); WM.objs=[];
    var pts=ok?W.ln:[a,b], path=pts.map(LL);
    WM.objs.push(new naver.maps.Polyline({map:WM.map,path:path,strokeColor:"#2f9e44",strokeWeight:ok?6:4,strokeOpacity:.9,strokeLineCap:"round",strokeLineJoin:"round",strokeStyle:ok?"solid":"shortdash"}));
    WM.pts=pts;
    WM.objs.push(new naver.maps.Marker({map:WM.map,position:LL(pts[0]),zIndex:60,title:fromNm(),icon:{content:'<i style="display:block;width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid #2f9e44;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,.3)"></i>',anchor:new naver.maps.Point(8,8)}}));
    WM.objs.push(new naver.maps.Marker({map:WM.map,position:LL(b),zIndex:70,title:pNm(S.to),icon:{content:'<img src="img/menu/mi_pin.png" alt="" style="display:block;height:34px;width:auto">',anchor:new naver.maps.Point(17,34)}}));
    var bd=new naver.maps.LatLngBounds(LL(pts[0]),LL(pts[0])); pts.concat([b]).forEach(function(p){ bd.extend(LL(p)); });
    try{ WM.map.fitBounds(bd,{top:44,right:30,bottom:30,left:30}); }catch(e){ WM.map.fitBounds(bd); } }
  wmMe(); wmArrow(); }
function wmMe(){ var p=WM.pos||ME.pos; if(!WM.map||!p||!window.naver) return; var ll=LL(p);
  if(!WM.me) WM.me=new naver.maps.Marker({map:WM.map,position:ll,zIndex:200,clickable:false,icon:{content:'<i style="display:block;width:16px;height:16px;border-radius:50%;background:#1a73e8;border:2px solid #fff;box-sizing:border-box;box-shadow:0 0 0 6px rgba(26,115,232,.25)"></i>',anchor:new naver.maps.Point(8,8)}});
  else WM.me.setPosition(ll);
  wmArrow(); }
function wmWatch(){ if(WM.wid!=null||!navigator.geolocation) return;   // 지도를 펼친 동안만 정확한 위치로 따라감 (저장·전송 없음)
  try{ WM.wid=navigator.geolocation.watchPosition(function(p){ WM.pos=[p.coords.latitude,p.coords.longitude]; try{ wmMe(); }catch(e){} },function(){},{enableHighAccuracy:true,maximumAge:3000,timeout:20000}); }catch(e){} }
function wmStop(){ if(WM.wid!=null){ try{ navigator.geolocation.clearWatch(WM.wid); }catch(e){} WM.wid=null; } }
function walkGet(my,lg){ var b=[+S.to.lat,+S.to.lng]; S.W=null; if(km2(S.a,b)>5) return;   // 직선 5km 안만
  S.W={k:"ld"}; if(km2(S.a,b)<0.7) S.open.w=true;   // 아주 가까우면(대중교통·택시 안 부름) 걷기를 펼쳐 둔다
  fetch(HUB+"/nwalk?a="+S.a[0].toFixed(6)+","+S.a[1].toFixed(6)+"&b="+b[0].toFixed(6)+","+b[1].toFixed(6)+"&lang="+encodeURIComponent(lg)).then(function(r){ return r.json(); })
    .then(function(j){ if(my!==S.seq) return; S.W=j&&j.ok&&Array.isArray(j.ln)&&j.ln.length>1?{k:"ok",m:+j.m||0,min:+j.min||1,ln:j.ln,steps:Array.isArray(j.st)?j.st:[]}:{k:"err",e:(j&&j.err)||"err"}; paint(); },
      function(){ if(my!==S.seq) return; S.W={k:"err",e:"err"}; paint(); }); }

// ── 누르기 ──
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-tk]"); if(!t||!t.closest("#tkBox,#gfchips,#mm")) return; e.preventDefault(); var g=t.dataset.tk;
  if(g==="open") return open();
  if(g==="x") return close();
  if(g==="fme"){ S.from={t:"me"}; S.fs=0; S.fc=null; paint(); if(S.to) route(); return; }
  if(g==="fh"){ var hh=lodges()[+t.dataset.i]; if(!hh) return; S.from=hh; S.fs=0; S.fc=null; paint(); if(S.to) route(); return; }
  if(g==="fs"){ S.fs=S.fs?0:1; paint(); if(S.fs){ var fi=document.getElementById("tkFq"); if(fi) fi.focus(); } return; }
  if(g==="fgo"||g==="tgo"){ var w=g==="fgo"?"f":"t", inp=document.getElementById(w==="f"?"tkFq":"tkTq"); if(inp){ if(w==="f") S.fq=inp.value; else S.tq=inp.value; } try{ inp.blur(); }catch(z){} search(w); return; }
  if(g==="pk"){ var a=t.dataset.w==="f"?S.fc:S.tc, x=a&&a[+t.dataset.i]; if(!x) return;
    if(t.dataset.w==="f"){ S.from={t:"p",k:x.k,nm:x.nm,ko:x.ko,lat:x.lat,lng:x.lng}; S.fs=0; S.fc=null; S.fq=""; }
    else { S.to=x; S.tc=null; S.tq=x.nm; }
    paint(); if(S.to) route(); return; }
  if(g==="wst"){ var ws=S.W&&S.W.steps&&S.W.steps[+t.dataset.i]; if(ws&&WM.map&&window.naver){ WM.map.setCenter(LL(ws.ll)); WM.map.setZoom(18); var mw=document.getElementById("tkWm"); if(mw) mw.scrollIntoView({behavior:"smooth",block:"nearest"}); } return; }
  if(g==="wme"){ var mp=WM.pos||ME.pos; if(mp&&WM.map&&window.naver){ WM.map.setCenter(LL(mp)); WM.map.setZoom(17); } else myPos().then(function(q){ if(q&&WM.map){ WM.pos=q; wmMe(); WM.map.setCenter(LL(q)); WM.map.setZoom(17); } }); return; }
  if(g==="tg"){ var id=t.dataset.id; S.open[id]=!S.open[id]; paint(); return; }
  if(g==="jump"){ var id2=t.dataset.id; S.open[id2]=true; paint(); var el=document.getElementById("tk_"+id2); if(el){ el.classList.add("hl"); el.scrollIntoView({behavior:"smooth",block:"start"}); setTimeout(function(){ el.classList.remove("hl"); },1600); } return; } });
document.addEventListener("input",function(e){ var t=e.target; if(t.id==="tkTq") S.tq=t.value; else if(t.id==="tkFq") S.fq=t.value; });
document.addEventListener("keydown",function(e){ var t=e.target; if(e.key!=="Enter"||!t||(t.id!=="tkTq"&&t.id!=="tkFq")) return; e.preventDefault(); if(t.id==="tkTq") S.tq=t.value; else S.fq=t.value; try{ t.blur(); }catch(z){} search(t.id==="tkTq"?"t":"f"); });

// ── 들어가는 곳: 첫 화면 칩 (선물 고르기가 있던 자리 — 칩은 글자만, 사장님 10-16) ──
function entries(){ css(); var box=document.getElementById("gfchips"); if(!box) return;
  var c=box.querySelector(".tkchip"); if(!c){ box.insertAdjacentHTML("beforeend",'<button type="button" class="tkchip" data-tk="open"></button>'); c=box.querySelector(".tkchip"); }
  c.textContent=F("chip"); }
var f0=window.setLang; if(typeof f0==="function"&&!f0._tk){ var g0=function(){ var r=f0.apply(this,arguments); try{ entries(); if(document.getElementById("tkBox")){ if(S.R&&S.rl!==LANG&&S.to) route(); else paint(); } }catch(e){} return r; };   // 열린 창은 그 자리에서 그 언어로 (결과는 그 언어 이름으로 다시 받음)
  for(var k0 in f0) if(k0.charAt(0)==="_") g0[k0]=f0[k0]; g0._tk=1; window.setLang=g0; }
entries();
// 「AI와 일정 짜기」 이동 줄에서 열기 (사장님 11-07 「이 창과 연계」) — 출발·도착을 채워 바로 길찾기, 누른 탈것 칸(want)을 펼치고 그 칸으로 내려간다
//   want = w 걷기 · x 택시 · t0 대중교통 첫 칸 · a0 비행기 · ic 기차·버스(열차가 있으면 KTX·SRT, 없으면 고속·시외버스) · 그 칸이 없으면 맨 위 그대로
function go(o){ if(!o||!o.to||!(+o.to.lat)) return;
  var f=o.from&&+o.from.lat?o.from:null; S.from=f?{t:"p",k:f.k||"",nm:f.nm||f.ko||"",ko:f.ko||f.nm||"",lat:+f.lat,lng:+f.lng}:{t:"me"};
  S.to={k:o.to.k||"",nm:o.to.nm||o.to.ko||"",ko:o.to.ko||o.to.nm||"",lat:+o.to.lat,lng:+o.to.lng,sub:o.to.sub||""};
  S.tq=pNm(S.to); S.tc=null; S.tst=""; S.fs=0; S.fc=null; S.fq=""; S.want=o.open||""; open(); route(); }
function wantApply(){ var w=S.want, R=S.R; S.want=""; if(!w||!R) return;
  if(w==="ic") w=(R.rail||[]).length?"r0":(R.bus||[]).length?"b0":"";
  if(w==="w"&&!S.W) w=(R.t||[]).length?"t0":"";
  if(w==="t0"&&!(R.t||[]).length) w="";
  if(w==="a0"&&!(R.air||[]).length) w="";
  if(w){ S.open[w]=true; S.jump=w; } }
function wantJump(){ var w=S.jump; S.jump=""; if(!w) return; var el=document.getElementById("tk_"+w); if(el) setTimeout(function(){ try{ el.scrollIntoView({block:"start"}); }catch(e){} },30); }
// ── 검색 결과 카드 「내 위치 ↔ 장소」 — 60km 넘는 육지 (사장님 11-08 밤) · index.html routePlan·distShow 가 부른다 ──
//  · 교통 창과 같은 허브 /ntransit(같은 구간·같은 언어 10분 캐시 — 여기서도 10분 기억)·같은 칸(card): 대중교통(있을 때) · 고속·시외버스 · KTX·SRT (· 비행기가 있으면)
//  · 칸을 누르면 그 자리에서 펼친다(역까지 가는 길·열차 시간표·예매 단추 — 교통 창과 같음) · 길은 새로 짜지 않는다 · 카드 아래 바깥 지도 단추는 그대로
//  · 그릴 때만 S 를 이 카드 상태(IC)로 잠깐 바꿔 교통 창의 그리기 함수를 그대로 쓴다
var IC=null, ICC={};
function icHtml(){ var R=S.R; if(S.st==="ld") return '<div class="tkno">'+E("route")+'</div>'; if(S.st!=="ok"||!R) return "";
  if(/^(cap|busy|relay)$/.test(R.od)) return '<div class="tkno">'+E(R.od==="cap"?"cap":"busy")+'</div>';
  var grp=function(ic,k,list,g,noK){ return '<div class="tkg"><h4>'+MPIMG(ic,MIS)+E(k)+'</h4>'+(list.length?list.map(function(p,i){ return card(g.charAt(0)+i,g,p); }).join(""):'<div class="tkno">'+E(noK)+'</div>')+'</div>'; };
  var h=(R.t||[]).length?grp("mi_subway","gT",R.t,"t","nT"):"";
  h+=grp("mi_bus","gB",R.bus||[],"bus","nB")+grp("mi_train","gR",R.rail||[],"rail","nR");
  if((R.air||[]).length) h+=grp("mi_plane","gA",R.air,"air","nR");
  return h+'<div class="d" style="font-size:11px;text-align:right;margin:4px 0 8px">powered by www.ODsay.com</div>'; }
function icPaint(){ var Q=IC; if(!Q||!Q.el||!document.body.contains(Q.el)) return; var s0=S; S=Q; try{ Q.el.innerHTML=icHtml(); }catch(e){} S=s0; }
function ic(el,ka,kb){ var p=PLACES[ka], q=PLACES[kb]; if(!el||!p||!q||!(+p.lat)||!(+q.lat)) return;
  var a=[+p.lat,+p.lng], b=[+q.lat,+q.lng], lg=LANG, ck=a[0].toFixed(3)+","+a[1].toFixed(3)+">"+b[0].toFixed(3)+","+b[1].toFixed(3)+"|"+lg;
  var Q=IC={el:el,from:ka==="__me"?{t:"me"}:{t:"p",k:ka,nm:LN(p),ko:p.ko||"",lat:a[0],lng:a[1]},to:{k:kb,nm:LN(q),ko:q.ko||"",lat:b[0],lng:b[1],sub:LANG==="ko"?(q.addr||""):(q.addr_en||q.addr||"")},
    a:a,at:kstMin(),st:"ld",R:null,rl:lg,open:{},TT:{},W:null};
  var done=function(j){ if(IC!==Q) return; if(j&&j.ok){ Q.R=j; Q.st="ok"; } else Q.st="err"; icPaint(); };
  var c=ICC[ck]; if(c&&Date.now()-c.t<6e5) return done(c.j);
  icPaint();
  fetch(HUB+"/ntransit?a="+a[0].toFixed(6)+","+a[1].toFixed(6)+"&b="+b[0].toFixed(6)+","+b[1].toFixed(6)+"&lang="+encodeURIComponent(lg)).then(function(r){ return r.json(); })
    .then(function(j){ if(j&&j.ok) ICC[ck]={t:Date.now(),j:j}; done(j); try{ ntap("_transit","card_far"); }catch(e){} },function(){ done(null); }); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-tk]"); if(!t||!IC||!IC.el||!IC.el.contains(t)) return; e.preventDefault(); e.stopPropagation();
  if(t.dataset.tk==="tg"){ var id=t.dataset.id; IC.open[id]=!IC.open[id]; icPaint(); } });
window.TRANSIT={open:open,close:close,go:go,ic:ic,state:function(){ return S; }};
if(/[?&]transit=1/.test(location.search)) setTimeout(open,300);
})();
