/* 머니퍼즐 내비 — 「맞춤형 투어(내 여행 일정)」 (사장님 2026-10-15)
 *  담기(무료) → 조건 → 「일정 짜기」(이용권: hasPass) → 날짜별 보고서 · 약도 동선 · PDF · 공유
 *  · 날짜 나누기·순서는 이 기기에서 계산 (숙소 기준 부채꼴 나누기 + 최근접 + 2-opt). 구간 시간은 직선거리 어림
 *  · 실제 대중교통 경로(ODsay)는 손님이 그 구간을 누를 때만 — 기존 odsBox 흐름 그대로
 *  · AI(허브 POST /ntrip)는 날짜별 설명·장소별 팁만. 보내는 것: 장소 키·이름·순서·시각·체류분·요일·숙소 이름. 좌표·위치 없음
 *  · 저장은 이 기기 localStorage(mpv_trip)뿐. 「현재 위치」 숙소는 좌표를 저장하지 않는다(그때그때 화면에서만)
 *  index.html 은 맨 끝 <script src="trip.js"> 한 줄뿐 — 나머지는 전역 함수(placeShow·spinCard·zApply·mapLoad·setLang)를 감싸서 붙는다
 *  · 11-06 전국 일정(아래 「══ 전국 일정」) — 도시 묶기·도시 순서·날 배분·도시 사이 이동 칸(TAGO 열차·ODsay 버스·항공 칸)·도시마다 숙소·택시·공항
 *    도시가 하나이고 공항을 안 넣은 일정은 예전 길(compute) 그대로 · 저장된 옛 일정(pl.mc 없음)·옛 공유 링크도 예전 그대로
 *  · 11-06 실시간 교통 — 출발 기록 순간 다음 이동이 택시면 허브 /ndrive(네이버 Directions 5, 실시간 교통)로 그 구간 시간을 바꿔 다시 계산
 *  · 11-06 첫 화면 「지금 여기」 카드·더 머무를 때 묻기(🔔)·숙소 도착 물음
 */
(function(){
"use strict";
// ── 이용권 ── 결제 연결 전이라 모두 true. 막으려면 아래 한 줄을 `return false;` 로 (또는 이용권 확인 함수로)
function hasPass(){ return true; }
window.hasPass=window.hasPass||hasPass;
if(typeof window.openPricing!=="function") window.openPricing=function(){ tPop(function(){ return '<div style="font-size:30px;margin-bottom:6px">🎫</div><b>'+T("이용권 준비 중","Pass coming soon")+'</b><div class="d" style="margin-top:6px">'+T("「일정 짜기」는 이용권 기능입니다. 곧 열립니다.","“Plan my trip” is a pass feature. Coming soon.")+'</div>'; }); };

var KEY="mpv_trip", MAXN=40;
var TR=load();
function load(){ var o=null; try{ o=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){} if(!o||!Array.isArray(o.items)) o={items:[]};
  o.opt=Object.assign({n:3,start:"",from:"09:30",to:"20:00",walk:1,hotel:null,food:"any",adv:false},o.opt||{}); return o; }   // 11-06 더한 칸(없어도 됨): hotels{도시 id:숙소} · ap{a,d} · pax · hAll
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(TR)); }catch(e){} }
function L(){ return window.LANG!=="ko"; }   // 외국어 화면(영·일·중) — 10-18
function nm(it){ if(!it) return ""; if(!L()) return it.ko; var p=it.k&&window.PLACES&&PLACES[it.k]; return (p&&p[LANG])||it[LANG]||it.en||it.ko; }   // 일·중 이름은 지금 받은 장소 자료에서
function T5(o){ return o[window.LANG]||o.en; }   // 다섯 말 문구 (10-20)
function aiTx(a){ return !a?"":LANG==="ko"?a.ko:(a[LANG]||a.en); }   // AI 설명 — 허브가 그 언어 칸을 주면 그것, 아니면 영어
function km(a,b){ var R=6371, rd=Math.PI/180, dLa=(b.lat-a.lat)*rd, dLo=(b.lng-a.lng)*rd, h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*rd)*Math.cos(b.lat*rd)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(h)); }
function hm2m(s){ var m=/^(\d{1,2}):(\d{2})$/.exec(s||""); return m?(+m[1])*60+(+m[2]):null; }
function m2hm(m){ m=Math.round(m); return ("0"+(Math.floor(m/60)%24)).slice(-2)+":"+("0"+(m%60)).slice(-2); }   // 11-05 사장님 「25시·27시는 00시·02시로」 — 자정 넘으면 24시간제로
function durTxt(m){ m=Math.round(m); var h=Math.floor(m/60), r=m%60, U={ko:["시간 ","분"],en:["h ","m"],ja:["時間","分"],zhs:["小时","分钟"],zht:["小時","分鐘"],es:[" h "," min"]}[window.LANG]||["h ","m"]; return ((h?h+U[0]:"")+(r||!h?r+U[1]:"")).trim(); }
var DOW_KO="일월화수목금토", DOW_EN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function kstToday(add){ return new Date(Date.now()+9*3600e3+(add||0)*864e5).toISOString().slice(0,10); }
function dayDate(i){ var s=TR.opt.start||kstToday(1), d=new Date(s+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+i); return d; }
var DOW_L={ja:"日月火水木金土",zhs:["周日","周一","周二","周三","周四","周五","周六"],zht:["週日","週一","週二","週三","週四","週五","週六"]};
function dateTxt(d){ if(DOW_L[LANG]) return (d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日（"+DOW_L[LANG][d.getUTCDay()]+"）"; if(LANG==="es") return ["dom","lun","mar","mié","jue","vie","sáb"][d.getUTCDay()]+", "+d.getUTCDate()+" "+["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"][d.getUTCMonth()]; return L()?DOW_EN[d.getUTCDay()]+", "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()]+" "+d.getUTCDate():(d.getUTCMonth()+1)+"월 "+d.getUTCDate()+"일 ("+DOW_KO[d.getUTCDay()]+")"; }

// ── 장소 종류 어림 → 기본 체류(분) ──
function catOf(it){ var k=it.k||"", s=(it.ko||"")+" "+(it.en||"")+" "+(it.d||"")+" "+(it.cat||"");
  if(/^h_/.test(k)||/호텔|hotel|숙박/i.test(it.ko+" "+it.en+" "+(it.cat||""))) return "hotel";
  if(/^(icn|gimpo|expterm|citytour)$/.test(k)||/공항|터미널|매표소|airport|terminal/i.test(it.ko+" "+it.en)) return "trans";
  if(/롯데월드$|에버랜드|놀이공원|theme park|amusement/i.test(it.ko+" "+it.en)&&!/타워|tower/i.test(it.ko)) return "theme";
  if(/궁|종묘|palace|shrine|사직단/i.test(it.ko+" "+it.en)&&!/박물관|museum|돌담/i.test(it.ko+" "+it.en)) return "palace";
  if(/박물관|미술관|museum|gallery|전시|문화역/i.test(it.ko+" "+it.en)) return "museum";
  if(/한라산|설악산|지리산|북한산|인수봉|산성|대청봉|mountain|hike/i.test(s)) return "mount";
  if(/시장|market/i.test(it.ko+" "+it.en)) return "market";
  if(/타워|전망|tower|observatory|케이블카/i.test(it.ko+" "+it.en)) return "tower";
  if(/극장|문화회관|공연|theater|theatre|performing/i.test(it.ko+" "+it.en)) return "show";
  if(/백화점|몰|아울렛|mall|department|outlet/i.test(it.ko+" "+it.en)) return "shop";
  if(/절$|사$|사찰|temple|성당|cathedral/i.test(it.ko+" "+it.en)) return "temple";
  if(/공원|숲|한강|park|forest|해수욕장|beach/i.test(it.ko+" "+it.en)) return "park";
  if(/유람선|크루즈|cruise/i.test(it.ko+" "+it.en)) return "cruise";
  if(/마을|village/i.test(it.ko+" "+it.en)) return "village";
  if(/사옥|HQ/i.test(it.ko+" "+it.en)) return "hq";
  return "street"; }
var STAY={palace:120,museum:120,market:90,tower:60,show:60,shop:90,temple:60,park:60,cruise:90,village:90,street:60,hq:20,theme:300,mount:300};
function stayOf(it){ return STAY[catOf(it)]||60; }
var PERFK={sejongctr:1,sac:1,bluesq:1,lgart:1,olympichall:1};   // 공연장 5곳 — 공연은 저녁이라 그날 마지막 장소로 (사장님 10-27 「예술의전당 9시에 끝」)
function isNight(it){ return !!PERFK[it.k]||/밤 추천|night/i.test((it.d||"")+" "+(it.den||""))||isBar(it); }
// ── 밤 종류·영업시간 (사장님 11-06 — 구글 「Day&Night 데이앤나잇」 나이트클럽이 1일차 10:00 첫 장소로 들어감) ──
//  · 밤 종류 = 구글·카카오에서 담은 핀(pin)만: 구글 종류(gt) night_club·bar·pub 등 → 없으면 카카오 분류(cat) 「술집」 등 → 그것도 없으면 이름 낱말
//  · 영업시간(oh, 허브가 구글에서 같이 받아 옴): 문 여는 시각 전에는 안 넣고(기다렸다 들어감), 마감 뒤에 닿으면 표시 · 쉬는 요일이면 다른 날로(compute)
//  · 밤 종류인데 영업시간을 모르면 저녁 19시부터 · 알면 그 시각에 맞춰 · 밤 종류는 지금처럼 그날 끝자리
var BAR_GT=/^(night_club|bar|pub|wine_bar|cocktail_bar|lounge_bar|sports_bar|irish_pub|brewpub|beer_garden|hookah_bar)$/;
//  · 11-06 밤 낱말 더함 — 재즈·재즈바·jazz·와인·wine·라이브 바(클럽·하우스) (사장님 「올댓재즈가 오전 10시에」) · 와인 가게·재즈 학원 같은 곳은 예외
//  · nb = 공유 링크로 받은 밤 장소 여부(1 밤 · 0 아님) — 보낸 사람 폰이 구글 종류·카카오 분류로 판단한 것 그대로
var BAR_X=/골프|헬스|피트니스|키즈|어린이|북 ?클럽|요트|스포츠,레저|학원|아카데미|교습|golf|fitness|\bgym\b|kids|book ?club|country ?club|yacht|academy|school|(sushi|salad|juice|snack|oyster|noodle|coffee|espresso|dessert|milk|nail|brow|lash) ?bar|(스시|샐러드|주스|커피|디저트|네일) ?바|와인 ?(샵|숍|가게|마트|상회|아울렛|창고|백화점)|wine ?(shop|store|mart|outlet|warehouse)/i;
var BAR_C=/술집|주점|호프|포장마차|포차|이자카야|칵테일|와인|재즈|라이브 ?(바|클럽|하우스)|나이트|클럽|라운지|\bbars?\b|\bpubs?\b|night ?club|lounge|jazz|\bwine\b|live ?(bar|house|music)/i;
var BAR_N=/나이트클럽|나이트(?!\s*(마켓|투어|뷰|시장|사파리|워크))|클럽|night ?club|\bclub\b|\bpubs?\b|펍|술집|주점|라운지|lounge|이자카야|izakaya|居酒屋|포차|포장마차|호프|칵테일|cocktail|와인|\bwine\b|재즈|jazz|라이브 ?(바|클럽|하우스)|live ?(bar|house|music)|\bbars?\b|ナイトクラブ|バー(?!ガ)|ジャズ|ワイン|酒吧|爵士|夜店|夜总会|夜總會/i;
function isBar(it){ if(!it||!it.pin) return false; if(it.nb===1) return true; if(it.nb===0) return false; var gt=Array.isArray(it.gt)?it.gt:[]; if(gt.length) return gt.some(function(t){ return BAR_GT.test(t); });
  var c=String(it.cat||""); if(c){ if(BAR_X.test(c)) return false; if(BAR_C.test(c)) return true; if(/>/.test(c)) return false; }   // 카카오 분류(「음식점 > 한식」 등)가 있으면 그것으로
  var s=(it.ko||"")+" "+(it.en||""); return BAR_N.test(s)&&!BAR_X.test(s); }
var EVE=19*60;   // 영업시간을 모르는 밤 종류 = 19시부터
// 그날 여는 칸 [[여는 분, 닫는 분], …] (그날 0시 기준, 전날 밤부터 이어지는 칸·자정 넘는 칸 포함) · off = 그날 쉼 · eve = 영업시간 모르는 밤 종류 · null = 모름(제한 없음)
function winOf(x,date){ var oh=x&&x.oh;
  if(Array.isArray(oh)&&oh.length){ var dw=date.getUTCDay(), w=[];
    oh.forEach(function(q){ if(!Array.isArray(q)||q.length<3) return; var S=q[0]*1440+(+q[1])-dw*1440, E=q[0]*1440+(+q[2])-dw*1440;
      [-10080,0,10080].forEach(function(s){ var a=S+s, b=E+s; if(b>0&&a<2880) w.push([a,b]); }); });
    w.sort(function(a,b){ return a[0]-b[0]; }); var m=[];
    w.forEach(function(r){ var l=m[m.length-1]; if(l&&r[0]<=l[1]) l[1]=Math.max(l[1],r[1]); else m.push(r.slice()); });
    if(!m.some(function(r){ return r[1]>360&&r[0]<1440; })) return {w:[],off:1};   // 그날 아침 6시~자정에 여는 칸이 없으면 쉬는 날
    return {w:m.filter(function(r){ return r[0]<1680; })}; }   // 다음 날 새벽 4시 뒤에 여는 칸(= 다음 날 영업)은 그날 칸이 아니다 — 밤새 기다려 다음 날 들어가는 일정은 안 만든다
  if(isBar(x)) return {w:[[EVE,4320]],eve:1};
  return null; }
// 그 시각에 닿을 때의 마감 — {c:닫는 분, o:여는 분} · last=궁궐 입장마감 · off=쉬는 날 · c:null=모름
function closeOf(x,dt,t){ if(PERFK[x.k]) return {c:null}; var li=lastIn(FACT[x.k],dt); if(li!=null) return {c:li,last:1};
  var wn=winOf(x,dt); if(!wn) return {c:null}; if(wn.eve) return {c:null,eve:1}; if(wn.off) return {c:null,off:1};
  for(var i=0;i<wn.w.length;i++) if(t<wn.w[i][1]) return {c:wn.w[i][1],o:wn.w[i][0]};
  var l=wn.w[wn.w.length-1]; return {c:l?l[1]:null,o:l?l[0]:null}; }
// 밤 장소(끝자리)를 가장 이르게 들어갈 때 숙소 도착 — 하루 끝 시각보다 늦으면 그날 기준 끝 = 이것 (나이트클럽을 담았으면 그 시각까지가 그날) · from = 하루 시작
function nightEnd(H,arr,date,from){ var nt=arr.filter(isNight); if(!nt.length) return 0; var t=from||0, p=null;
  nt.forEach(function(x){ if(p) t+=legMin(p,x); var wn=PERFK[x.k]?null:winOf(x,date); if(wn&&!wn.off){ for(var i=0;i<wn.w.length;i++) if(t<wn.w[i][1]){ if(t<wn.w[i][0]) t=wn.w[i][0]; break; } } t+=x.stay; p=x; });
  var E=hE(H); if(E&&p) t+=legMin(p,E); return t; }
function dayLim(pl,d,H,arr,dt,X){ var n=Math.max((d&&d.gap&&d.gap.until)||(X&&X.to)||pl.to,nightEnd(H,arr,dt,X?X.from:pl.from));
  return (X&&X.lim!=null)?Math.min(n,X.lim):n; }   // 전국 일정 — 기차(막차)·비행기 시각에 맞춰야 하는 날은 그 시각이 더 이르면 그것 (11-06)

// ── 공식 확인된 운영 정보만 (궁능유적본부 관람안내 royal.khs.go.kr/ROYAL/contents/R702000000.do, 2026-10-15 확인) ──
//   cl=정기휴일 요일(0=일) · last=월별 입장마감 · ev=정해진 행사 시각(덕수궁 수문장 교대식 — 장소 자료 문구, 2024년 기준)
//   ※ 휴일이 공휴일과 겹치면 열고 다음 평일 휴무 — 화면 ⓘ 에 적는다
var GBG_LAST=[16,16,17,17,17,17.5,17.5,17.5,17,17,16,16], CDG_LAST=[16.5,17,17,17,17,17.5,17.5,17.5,17,17,16.5,16.5];
var FACT={
  geunjeong:{cl:[2],last:GBG_LAST}, jongmyo:{cl:[2]},
  donhwamun:{cl:[1],last:CDG_LAST}, changgyeong:{cl:[1]}, sungnyemun:{cl:[1],last:[17.9]},
  deoksugung:{cl:[1],last:[20],ev:[660,840],evd:[2,3,4,5,6,0],evn:["수문장 교대식","Royal Guard Changing Ceremony"]}
};
function lastIn(f,d){ if(!f||!f.last) return null; var v=f.last.length===1?f.last[0]:f.last[d.getUTCMonth()]; return Math.round(v*60); }
function needCheck(it){ var c=catOf(it); return !FACT[it.k]&&!(Array.isArray(it.oh)&&it.oh.length)&&/^(palace|museum|theme|tower|show|cruise)$/.test(c); }   // 구글 영업시간을 받은 곳은 뺀다 (11-06)

// ── 담기 ──
function has(k){ return TR.items.some(function(x){ return x.k===k; }); }
function snapPlace(k){ var p=window.PLACES&&PLACES[k]; if(!p) return null; return {k:k,ko:p.ko,en:p.en||p.ko,lat:+p.lat,lng:+p.lng,addr:p.addr||"",addr_en:p.addr_en||"",d:p.dko||"",den:p.den||""}; }
function pinKey(p){ var s=(p.ko||"")+"|"+(+p.lat).toFixed(5)+"|"+(+p.lng).toFixed(5), h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return "pin_"+(h>>>0).toString(36); }
function snapPin(){ var p=window.PLACES&&PLACES.__pin; if(!p) return null; var it={k:pinKey(p),ko:p.ko,en:p.en||p.ko,lat:+p.lat,lng:+p.lng,addr:p.addr||"",addr_en:p.addr_en||"",cat:p.cat||"",pin:1};
  if(Array.isArray(p.oh)&&p.oh.length) it.oh=p.oh; if(Array.isArray(p.gt)&&p.gt.length) it.gt=p.gt; return it; }   // 구글 영업시간·종류 (11-06)
function addItem(it){ if(!it||has(it.k)) return; if(TR.items.length>=MAXN){ alert(T("최대 "+MAXN+"곳까지 담을 수 있어요","Up to "+MAXN+" places")); return; }
  TR.items.push(it); TR.plan=null; save(); try{ ntap(it.pin?("sp_"+(window.spinCat?spinCat(it.cat):"etc")):it.k,"trip_add"); }catch(e){} refresh(); }
function delItem(k){ TR.items=TR.items.filter(function(x){ return x.k!==k; }); TR.plan=null; save(); refresh(); }
function btnHtml(k){ var on=has(k);
  return '<button type="button" class="tradd'+(on?' on':'')+'" data-k="'+esc(k)+'">'+(on?T("✓ 담김 · 빼기","✓ Added · Remove"):T("＋ 내 여행에 담기","＋ Add to my trip"))+'</button>'; }
function cardBtn(){ var r=document.getElementById("res"), c=r&&r.querySelector(".item"); if(!c) return; var k=window._cardK; if(!k||k==="mpstat"||k==="adinq") return;
  var it=k==="__pin"?snapPin():snapPlace(k); if(!it) return; var old=c.querySelector(".tradd"); if(old) old.remove();
  c.insertAdjacentHTML("beforeend",'<div class="trbw">'+btnHtml(it.k)+'</div>'); c.querySelector(".tradd").dataset.src=k; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".tradd"); if(!b) return; e.preventDefault(); e.stopPropagation();
  var k=b.dataset.k; if(has(k)) delItem(k); else addItem(b.dataset.src==="__pin"?snapPin():snapPlace(b.dataset.src||k));
  b.outerHTML=btnHtml(k); var nb=document.querySelector('.tradd[data-k="'+k+'"]'); if(nb) nb.dataset.src=b.dataset.src; },true);

// ── 전역 함수 감싸기 ──
function wrap(name,after){ var f=window[name]; if(typeof f!=="function"||f._tr) return; var g=function(){ var r=f.apply(this,arguments); try{ after.apply(this,[r].concat([].slice.call(arguments))); }catch(e){} return r; }; g._tr=1; window[name]=g; }
wrap("placeShow",function(){ cardBtn(); });
wrap("spinCard",function(){ cardBtn(); });
wrap("zApply",function(){ flags(); });
wrap("setLang",function(){ refresh(); if(document.getElementById("trBox")){ var aq=document.getElementById("trAddrQ"), av=aq?aq.value:""; panelPaint(); var aq2=document.getElementById("trAddrQ"); if(aq2) aq2.value=av; addrPaint(); }
  if(document.getElementById("trRep")) repAgain(); });   // 열린 창은 그 자리에서 (lang.js, 10-18)
// 보고서를 그 자리에서 다시 — 「다음 갈 곳」·「공유」 칸과 펼쳐 둔 「실제 경로」 구간을 그대로 다시 연다 (같은 구간은 sessionStorage 캐시)
function repAgain(){ var nb=document.getElementById("trNextBox"), nx=nb&&nb.firstElementChild?(nb.querySelector("#trShL")?"share":"next"):"", open=[];
  [].forEach.call(document.querySelectorAll("#trRep .tlg"),function(r){ var t=r.querySelector(".tods"); if(t&&t.firstElementChild) open.push([r.dataset.a,r.dataset.b,r.dataset.d]); });
  repPaint(); if(nx==="next") nextStop(); else if(nx==="share") shareGo();
  var nt=window.ntap; window.ntap=function(){}; try{ open.forEach(function(o){ var r=[].filter.call(document.querySelectorAll("#trRep .tlg"),function(x){ return x.dataset.a===o[0]&&x.dataset.b===o[1]&&x.dataset.d===o[2]; })[0]; if(r) legRoute(r); }); }catch(e){} window.ntap=nt; }
wrap("mapLoad",function(r){ if(r&&r.then) r.then(function(){ flags(); },function(){}); });
window.addEventListener("resize",function(){ flags(); });

// ── 지도 위 번호 깃발 (지도와 같이 움직이고 배율 따라 커진다) ──
function fracOf(it){ var V=window.VIEW, c=window.CITY&&CITY[V]; if(V!=="kr"&&c&&c.spots&&c.spots[it.k]){ var b=c.spots[it.k]; return [(b[0]+b[2])/2,(b[1]+b[3])/2]; } return meGeoFrac(V==="kr"?NAVI_ROOT:V,it.lat,it.lng); }
function flags(){ var z=document.getElementById("mz"); if(!z) return; [].forEach.call(z.querySelectorAll(".trf"),function(e){ e.remove(); });
  if(!TR.items.length||window.DET) return; var w=document.getElementById("map").clientWidth, sz=Math.max(14,w*0.032), sc=1/Math.sqrt(ZM.s||1), grp=[];
  TR.items.forEach(function(it,i){ var f=null; try{ f=fracOf(it); }catch(e){} if(!f||f[0]<0||f[0]>1||f[1]<0||f[1]>1) return;
    var g=null; if(window.VIEW==="kr"){ for(var j=0;j<grp.length;j++) if(Math.abs(grp[j].f[0]-f[0])<0.03&&Math.abs(grp[j].f[1]-f[1])<0.03){ g=grp[j]; break; } }
    if(g) g.n.push(i+1); else grp.push({f:f,n:[i+1]}); });
  grp.forEach(function(g){ var e=document.createElement("div"); e.className="trf"; e.style.cssText="left:"+(g.f[0]*100)+"%;top:"+(g.f[1]*100)+"%;font-size:"+(sz*0.55)+"px;transform:translate(0,-100%) scale("+sc+")";
    e.innerHTML='<b>'+(g.n.length>1?"🛒"+g.n.length:g.n[0])+'</b>'; z.appendChild(e); }); }

// ── 메뉴·칩 ──
function refresh(){ var n=TR.items.length, mm=document.getElementById("mm"); var om=document.getElementById("mtrip"); if(om) om.remove();   // 11-06 사장님 ⋮ 메뉴 「My trip(여행카트)」 삭제 — 머리줄 카트에 있음
  if(mm&&false){ var a=document.getElementById("mtrip"); if(!a){ a=document.createElement("a"); a.id="mtrip"; a.href="#"; a.className="mi"; a.onclick=function(){ mm.hidden=true; openPanel(); return false; }; mm.insertBefore(a,mm.firstChild); }
    a.innerHTML='<img class="miic" src="img/menu/mi_cart.png" alt="">'+esc(T("여행카트 ("+n+")","My trip ("+n+")")); }
  var tb=document.querySelector(".tbs"), c=document.getElementById("trchip");
  if(tb&&!c){ c=document.createElement("button"); c.id="trchip"; c.type="button"; c.className="tb"; c.onclick=openPanel; var rs=document.getElementById("rs"); tb.insertBefore(c,rs&&rs.parentNode===tb?rs.nextSibling:null); }   // 머리줄 = 처음으로 | 🛒 | 공유 | 🌐 | 💬 | 🔔 | 🌙 | ⋮ (사장님 11-06)
  if(c){ c.hidden=false; c.innerHTML=CARTSVG("1.35em","vertical-align:-0.3em;margin-right:3px")+n; c.title=T("내 여행","My trip"); }
  flags(); }
// 카트 아이콘 = 구글 Material Symbols 「shopping_cart」(Apache 2.0, github.com/google/material-design-icons) 경로 그대로 (사장님 11-05) — 머리줄 카트·AI와 일정짜기 화면·안내 창이 같이 쓴다
function CARTSVG(sz,st){ return '<svg class="cartic" viewBox="0 -960 960 960" width="'+sz+'" height="'+sz+'" fill="currentColor" aria-hidden="true" style="display:inline-block;'+(st||"")+'"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>'; }
window.CARTSVG=CARTSVG;

// ── 창 공통 ──
function tPop(html){ var b=document.createElement("div"); b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ b.innerHTML='<div>'+(typeof html==="function"?html():html)+'<button type="button" class="trbtn" style="margin-top:12px" onclick="this.closest(\'.trpop\').remove()">'+T("닫기","Close")+'</button></div>'; };
  draw(); if(typeof html==="function") b._rb=draw;   // 글을 함수로 주면 언어를 바꿀 때 그 자리에서 다시 (lang.js, 10-18)
  document.body.appendChild(b); return b; }
function sheet(id){ var o=document.getElementById(id); if(o) o.remove(); o=document.createElement("div"); o.id=id; o.className="trsheet";
  o.innerHTML='<div class="trin"></div>'; document.body.appendChild(o); document.documentElement.classList.add("trlock"); return o.firstChild; }
function sheetClose(id){ var o=document.getElementById(id); if(o) o.remove(); if(!document.querySelector(".trsheet")) document.documentElement.classList.remove("trlock"); }

// ── 담은 목록 + 조건 ──
var HOTELS=[], ADDR=[];
function openPanel(){ var mm=document.getElementById("mm"); if(mm) mm.hidden=true; sheet("trBox"); panelPaint();
  Promise.all(Object.keys(window.CITY||{}).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){ hotelsFill(); if(document.getElementById("trBox")) panelPaint(); }); }
function hotelsFill(){ HOTELS=[]; for(var k in PLACES){ if(k.charAt(0)==="_") continue; var p=PLACES[k]; if(/^h_/.test(k)||/호텔/.test(p.ko)) HOTELS.push({k:k,ko:p.ko,en:p.en,lat:+p.lat,lng:+p.lng}); }
  HOTELS.sort(function(a,b){ return a.ko<b.ko?-1:1; }); }
function hotelTxt(h){ if(!h) return T("정하지 않음","Not set"); if(h.type==="here") return T("📍 현재 위치","📍 My current location"); return (h.type==="addr"?"🔎 ":"🏨 ")+nm(h); }
function panelPaint(){ var box=document.querySelector("#trBox .trin"); if(!box) return; var o=TR.opt, n=TR.items.length; try{ PANELG=panelGroups(); }catch(e){ PANELG=null; }   // 도시가 둘 이상이면 도시별 숙소 (11-06)
  var li=TR.items.map(function(it,i){ var c=catOf(it), x=c==="hotel"?T(" · 숙소는 아래에서 고르세요"," · choose lodging below"):c==="trans"?T(" · 교통시설(일정에서 뺌)"," · transport (skipped)"):" · "+durTxt(stayOf(it));
    return '<li class="tri" data-k="'+esc(it.k)+'"><span class="trh" title="drag">☰</span><b class="trn">'+(i+1)+'</b><span class="trt">'+esc(nm(it))+'<i>'+esc(x)+'</i></span><button type="button" class="trx" data-k="'+esc(it.k)+'" aria-label="remove">✕</button></li>'; }).join("");
  var hsel='<select id="trHotel"><option value="">'+T("— 숙소 고르기 —","— Choose lodging —")+'</option><option value="__here"'+(o.hotel&&o.hotel.type==="here"?" selected":"")+'>'+T("📍 현재 위치","📍 My current location")+'</option>'
    +HOTELS.map(function(h){ return '<option value="'+esc(h.k)+'"'+(o.hotel&&o.hotel.k===h.k?" selected":"")+'>🏨 '+esc(nm(h))+'</option>'; }).join("")
    +(o.hotel&&o.hotel.type==="addr"?'<option value="__addr" selected>'+esc(hotelTxt(o.hotel))+'</option>':"")+'</select>';
  var days=""; for(var d=1;d<=7;d++) days+='<option'+(o.n===d?" selected":"")+' value="'+d+'">'+d+T("일"," day"+(d>1?"s":""))+'</option>';
  box.innerHTML='<div class="trtop"><b>'+MPICO("mi_cart",T("🛒 내 여행","🛒 My trip"),MIS)+' ('+n+')</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trBox\')">✕</button></div>'
    +(n?'<ol class="trl" id="trList">'+li+'</ol><button type="button" class="trbtn" id="trClearAll" style="margin:6px 0">'+T("🗑 모두 비우기","🗑 Clear all")+'</button><div class="d">'+T("☰ 를 끌어 순서를 바꿀 수 있어요 (일정 짜기는 동선에 맞게 다시 나눕니다)","Drag ☰ to reorder (planning re-arranges by route)")+'</div>'
      :'<div class="msg">'+T("아직 담은 곳이 없어요. 지도에서 그림을 누르고 「＋ 내 여행에 담기」를 누르세요.","Nothing added yet. Tap a picture on the map, then “＋ Add to my trip”.")+'</div>')
    +'<div class="trf2"><label>'+T("여행 일수","Days")+'<select id="trN">'+days+'</select></label>'
    +'<label>'+T("첫날","First day")+'<input type="date" id="trStart" value="'+esc(o.start||kstToday(1))+'"></label>'
    +'<label>'+T("하루 시작","Start")+'<input type="time" id="trFrom" value="'+esc(o.from)+'"></label>'
    +'<label>'+T("하루 끝","End")+'<input type="time" id="trTo" value="'+esc(o.to)+'"></label>'
    +'<label>'+T("걷기","Walking")+'<select id="trWalk"><option value="0"'+(o.walk===0?" selected":"")+'>'+T("적게 (1km까지)","Less (≤1 km)")+'</option><option value="1"'+(o.walk===1?" selected":"")+'>'+T("보통 (2km까지)","Normal (≤2 km)")+'</option><option value="2"'+(o.walk===2?" selected":"")+'>'+T("많이 (3km까지)","More (≤3 km)")+'</option></select></label>'
    +'<label>'+T("음식","Food")+'<select id="trFood">'+FOODS.map(function(f){ return '<option value="'+f[0]+'"'+(o.food===f[0]?" selected":"")+'>'+esc(T(f[1],f[2]))+'</option>'; }).join("")+'</select></label>'
    +'<label class="trck"><input type="checkbox" id="trAdv"'+(o.adv?" checked":"")+'> '+T("도전 음식도 괜찮아요","I’m adventurous")+'</label>'
    +(PANELG?natHotelRows(PANELG):'<label class="wide">'+T("숙소","Lodging")+hsel+'</label>')
    +'<div class="wide trsr"><input id="trAddrQ" placeholder="'+T("숙소 이름·주소로 찾기","Search lodging by name/address")+'"><button type="button" class="tb" id="trAddrGo">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div><div class="wide" id="trAddrR"></div>'+natApRows()+'</div>'
    +'<button type="button" class="trbtn big" id="trPlan"'+(n?"":" disabled")+'>'+MPICO("mi_calendar",T("🗓 일정 짜기","🗓 Plan my trip"),MIS)+'</button>'
    +(TR.plan?'<button type="button" class="trbtn" id="trOpenRep">'+MPICO("mi_doc",T("📄 지난 일정 보기","📄 Open last plan"),MIS)+'</button>':"")
    +'<div class="d" style="margin-top:8px">'+T("일정은 이 기기에만 저장돼요. 위치는 저장하지 않아요.","Your plan is saved only on this device. Your location is never saved.")+'</div>';
  var g=function(id){ return document.getElementById(id); };
  g("trN").onchange=function(){ o.n=+this.value; TR.plan=null; save(); };
  g("trStart").onchange=function(){ o.start=this.value; save(); };
  g("trFrom").onchange=function(){ if(hm2m(this.value)!=null) o.from=this.value; save(); };
  g("trTo").onchange=function(){ if(hm2m(this.value)!=null) o.to=this.value; save(); };
  g("trWalk").onchange=function(){ o.walk=+this.value; save(); };
  g("trFood").onchange=function(){ o.food=this.value; save(); }; g("trAdv").onchange=function(){ o.adv=this.checked; save(); };
  if(g("trHotel")) g("trHotel").onchange=function(){ var v=this.value; if(!v) o.hotel=null; else if(v==="__here") o.hotel={type:"here"}; else if(v!=="__addr"){ var h=HOTELS.filter(function(x){ return x.k===v; })[0]; if(h) o.hotel={type:"place",k:h.k,ko:h.ko,en:h.en,lat:h.lat,lng:h.lng}; } save(); };
  g("trAddrGo").onclick=addrSearch; g("trAddrQ").onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); addrSearch(); } };
  g("trPlan").onclick=planGo; if(g("trOpenRep")) g("trOpenRep").onclick=function(){ openReport(); };
  [].forEach.call(box.querySelectorAll(".trx"),function(b){ b.onclick=function(){ delItem(b.dataset.k); panelPaint(); }; });
  if(g("trClearAll")) g("trClearAll").onclick=function(){ if(!confirm(T("담은 곳과 짠 일정을 모두 지울까요?","Remove all places and your plan?"))) return; TR.items=[]; TR.plan=null; save(); refresh(); panelPaint(); };   // 모두 비우기 (사장님 10-16)
  natPanelWire(box); dragInit(g("trList")); }
var ADDRQ="";   // 숙소 찾기 — 마지막 검색어 (언어를 바꿔 창을 다시 그릴 때 결과도 다시, 10-18)
function addrPaint(){ var out=document.getElementById("trAddrR"); if(!out||!ADDRQ) return; var q0=document.getElementById("trAddrQ"); if(q0&&!q0.value) q0.value=ADDRQ;
  if(window.KL&&ADDR.length) KL.ensure(ADDR,"item",ADDRQ,function(){ if(document.getElementById("trBox")) addrPaint(); });
    out.innerHTML=ADDR.length?ADDR.map(function(x,i){ return '<div class="tra" data-i="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join(""):'<div class="d">'+T("찾은 곳이 없어요","No results")+'</div>';
    [].forEach.call(out.querySelectorAll(".tra"),function(e){ e.onclick=function(){ var x=ADDR[+e.dataset.i]; var h={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""}; if(!natAssignHotel(h)) TR.opt.hotel=h; save(); ADDRQ=""; ADDR=[]; panelPaint(); }; }); }   // 도시가 여럿이면 가까운 도시 숙소로 (11-06)
function addrSearch(){ var q=document.getElementById("trAddrQ").value.trim(), out=document.getElementById("trAddrR"); if(!q) return; out.innerHTML='<div class="d">'+T("찾는 중…","Searching…")+'</div>'; var lg=LANG;
  fetch(HUB+"/kplace?q="+encodeURIComponent(q)+kpL()).then(function(r){ return r.json(); }).then(function(j){ ADDR=((j&&j.ok&&j.items)||[]).slice(0,6); ADDR.forEach(function(x){ x._l=lg; }); ADDRQ=q; addrPaint(); })
    .catch(function(){ out.innerHTML='<div class="d">'+T("잠시 뒤 다시 해 주세요","Please try again")+'</div>'; }); }
function dragInit(ol){ if(!ol) return; var cur=null;
  ol.addEventListener("pointerdown",function(e){ var h=e.target.closest(".trh"); if(!h) return; e.preventDefault(); cur=h.closest(".tri"); cur.classList.add("drag"); try{ h.setPointerCapture(e.pointerId); }catch(x){} });
  ol.addEventListener("pointermove",function(e){ if(!cur) return; e.preventDefault(); var els=[].slice.call(ol.children);
    for(var i=0;i<els.length;i++){ var el=els[i]; if(el===cur) continue; var r=el.getBoundingClientRect(); if(e.clientY>r.top&&e.clientY<r.bottom){ if(e.clientY<r.top+r.height/2) ol.insertBefore(cur,el); else ol.insertBefore(cur,el.nextSibling); break; } } });
  var end=function(){ if(!cur) return; cur.classList.remove("drag"); cur=null; var ord=[].map.call(ol.children,function(e){ return e.dataset.k; });
    TR.items.sort(function(a,b){ return ord.indexOf(a.k)-ord.indexOf(b.k); }); TR.plan=null; save(); refresh(); panelPaint(); };
  ol.addEventListener("pointerup",end); ol.addEventListener("pointercancel",end); }

// ── 일정 계산 ──
function walkKm(){ return [1,2,3][TR.opt.walk]||2; }
// 옛 알고리즘으로 돌리는 스위치(비교·시험용) — window.__TRIP_OLD 또는 localStorage mpv_oldalgo=1
function OLD(){ try{ return !!window.__TRIP_OLD||localStorage.getItem("mpv_oldalgo")==="1"; }catch(e){ return !!window.__TRIP_OLD; } }
// ── 실제 대중교통 시간 캐시 (사장님 10-24) — 구간(반올림 좌표 한 쌍, 방향 무관)별 분. 이 화면 메모리 + sessionStorage. 좌표만 저장(위치 아님)
var RT={};
function rkPt(p){ return (+p.lat).toFixed(4)+","+(+p.lng).toFixed(4); }
function rtKey(a,b){ var x=rkPt(a), y=rkPt(b); return (x<y?x+"|"+y:y+"|"+x)+"|t"; }
function leg(a,b){ var d=km(a,b), w=walkKm();
  if(d<=w) return {mode:"walk",km:d,min:Math.max(3,Math.round(d*1.3/4.5*60))};   // 가까운 곳은 늘 걷기(실제 시간 있어도)
  if(!OLD()){ if(isleOf(a)!==isleOf(b)) return {mode:"air",km:d,min:Math.round(150+d/10)};
    if((a.ap||b.ap)&&d>TX_SHORT&&d<=80){ var ra=RT[rtKey(a,b)], ok=typeof ra==="number"&&ra>0; return {mode:"transit",km:d,min:ok?ra:Math.round(25+d*1.1),real:ok?1:0}; }   // 공항 ↔ 시내 = 공항철도·리무진 어림 (11-06)   // 섬(제주) 건너는 구간 = 항공 (11-06 전국 일정)
    if(d<=TX_SHORT){ var wm=Math.round(d*1.3/4.5*60), rq=RT[rtKey(a,b)]; if(wm>25&&typeof rq==="number"&&rq>0&&rq>=wm*0.8) return txLeg(a,b,"short"); } }   // 11-06 사장님 「가」 — 짧은 구간은 걸어서 25분 넘고 대중교통이 걷기와 별 차이 없을 때(실제 경로 시간 ≥ 걷기의 80%)만 택시. 밤 22:30 뒤·짐 옮기는 날 택시는 그대로
  if(!OLD()){ var rt=RT[rtKey(a,b)]; if(typeof rt==="number"&&rt>0) return {mode:"transit",km:d,min:rt,real:1}; }
  if(d<=60) return {mode:"transit",km:d,min:Math.round(10+d*3.2)};
  return {mode:"far",km:d,min:Math.round(40+d/70*60)}; }
function legMin(a,b){ return leg(a,b).min; }
// ── 택시 (11-06) — 걷기보다 멀고 TX_SHORT(직선 3km) 안 · 밤 22:30 뒤 출발 · 짐 옮기는 날(역·공항 ↔ 숙소)
//   시간·요금 = 네이버 길찾기(허브 /ndrive, DR 캐시)가 있으면 그것, 없으면 어림(도로 = 직선 × 1.35 · 시속 약 25km · 기본 4,800원 + km당 약 770원 · 22~04시 할증 약 20%) — 화면에 「약」
var TX_SHORT=3, NIGHT_TX=22*60+30, DR={};
function taxiMin(d){ return Math.max(5,Math.round(5+d*1.35*2.4)); }
function taxiFare(d,t){ var f=4800+Math.max(0,d*1.35-1.6)*770, m=t==null?720:((t%1440)+1440)%1440; if(m>=1320||m<240) f*=1.2; return Math.round(f/100)*100; }
function txLeg(a,b,why,t){ var d=km(a,b), dr=DR[rtKey(a,b)]; if(dr&&dr.min>0) return {mode:"taxi",km:d,min:dr.min,fare:dr.fare||null,why:why,real:1};
  return {mode:"taxi",km:d,min:taxiMin(d),fare:taxiFare(d,t),why:why,est:1}; }
function isleOf(p){ var la=+p.lat, lo=+p.lng; if(la>32.8&&la<33.8&&lo>125.9&&lo<127.2) return "jeju"; if(lo>130.6&&la>37.2&&la<37.7) return "ulleung"; return "land"; }
// 출발·도착이 다른 구간 (11-06 전국 일정) — H 가 {pair:1,s,e} 면 아침에 나서는 곳(s)과 저녁에 닿는 곳(e)이 다르다(역·공항·다른 도시 숙소). 보통 숙소 하나면 H 그대로
function hS(H){ return H&&H.pair?H.s:H; }
function hE(H){ return H&&H.pair?H.e:H; }
function hPair(s,e){ if(s===e||(!s&&!e)) return s||null; return {pair:1,s:s||null,e:e||null}; }
function tourCost(H,arr){ if(!arr.length) return 0; var c=0, S=hS(H), E=hE(H), p=S||arr[0]; arr.forEach(function(x){ c+=legMin(p,x); p=x; }); if(E) c+=legMin(p,E); return c; }
function nnOrder(H,arr){ var left=arr.slice(), out=[], p=hS(H); if(!p){ var w=left.reduce(function(a,b){ return b.lng<a.lng?b:a; }); out.push(w); left.splice(left.indexOf(w),1); p=w; }
  while(left.length){ var bi=0, bd=1e9; left.forEach(function(x,i){ var d=km(p,x); if(d<bd){ bd=d; bi=i; } }); p=left[bi]; out.push(p); left.splice(bi,1); } return out; }
function twoOpt(H,arr){ var a=arr.slice(), imp=true, it=0;
  while(imp&&it++<50){ imp=false; for(var i=0;i<a.length-1;i++) for(var j=i+1;j<a.length;j++){ var b=a.slice(0,i).concat(a.slice(i,j+1).reverse(),a.slice(j+1)); if(tourCost(H,b)+0.01<tourCost(H,a)){ a=b; imp=true; } } } return a; }
function dayLoad(H,arr){ return arr.reduce(function(s,x){ return s+x.stay; },0)+tourCost(H,nnOrder(H,arr))+(arr.length?60:0); }
// 가까운 곳끼리 같은 날로 (사장님 10-24) — 좌표 k-means(체류시간 가중·여러 번 시작해 가장 싼 것) → 숙소 왕복 포함 비용으로 고른 뒤 improve 로 다듬기
//   · 각도로만 나누면 (옛 방식) 같은 방향이면 멀어도 묶여버린다. 좌표로 묶으면 가까운 곳이 한 날로 모인다
//   · 고정 씨앗 + 여러 번 시작 → 같은 입력이면 같은 결과. 하루 cap 초과·시간 균형은 improve(이동/옮기기)에 맡긴다
function splitDays(H,P,D,cap){ if(OLD()) return splitDaysAngular(H,P,D,cap);
  var n=P.length; if(!n) return []; var tot=P.reduce(function(s,x){ return s+x.stay; },0), avg=tot/D;
  if(n<=D){ var g0=[]; for(var gi=0;gi<D;gi++) g0.push(gi<n?[P[gi]]:[]); return g0; }
  var mlat=P.reduce(function(s,x){ return s+x.lat; },0)/n, kx=Math.cos(mlat*Math.PI/180);   // 등거리 투영 — 경도는 위도만큼 줄여 거리 왜곡 없이
  var px=P.map(function(x){ return [x.lat,x.lng*kx]; }), dist2=function(a,b){ var dy=a[0]-b[0], dx=a[1]-b[1]; return dy*dy+dx*dx; };
  var cst=function(g){ if(!g.length) return 500; var ld=dayLoad(H,g), st=g.reduce(function(q,x){ return q+x.stay; },0); return (ld-st)+Math.max(0,ld-cap)*20+0.01*(st-avg)*(st-avg); };   // improve 와 같은 식(이동+시간초과+균형)
  var rng=function(seed){ return function(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; };
  var best=null, bc=1e18;
  for(var r=0;r<8;r++){ var rnd=rng((2654435761+r*40503)>>>0), cen=[px[Math.floor(rnd()*n)].slice()];
    while(cen.length<D){ var w=[], sum=0;   // k-means++ 씨앗, 체류시간 가중
      for(var ii=0;ii<n;ii++){ var m=1e18; for(var c=0;c<cen.length;c++) m=Math.min(m,dist2(px[ii],cen[c])); var v=m*(P[ii].stay||1); w.push(v); sum+=v; }
      var pick=Math.floor(rnd()*n); if(sum>0){ var t=rnd()*sum, acc=0; for(ii=0;ii<n;ii++){ acc+=w[ii]; if(acc>=t){ pick=ii; break; } } } cen.push(px[pick].slice()); }
    var asg=new Array(n).fill(0);   // 로이드 반복 (체류시간 가중 중심)
    for(var it2=0;it2<40;it2++){ var ch=false;
      for(var k=0;k<n;k++){ var bi=0, bd=1e18; for(c=0;c<D;c++){ var dv=dist2(px[k],cen[c]); if(dv<bd){ bd=dv; bi=c; } } if(asg[k]!==bi){ asg[k]=bi; ch=true; } }
      for(c=0;c<D;c++){ var sy=0,sx=0,sw=0; for(k=0;k<n;k++) if(asg[k]===c){ var wt=P[k].stay||1; sy+=px[k][0]*wt; sx+=px[k][1]*wt; sw+=wt; } if(sw>0) cen[c]=[sy/sw,sx/sw]; }
      if(!ch) break; }
    var gs2=[]; for(c=0;c<D;c++) gs2.push([]); for(k=0;k<n;k++) gs2[asg[k]].push(P[k]);
    var tc=gs2.reduce(function(s,g){ return s+cst(g); },0); if(tc<bc){ bc=tc; best=gs2.map(function(g){ return g.slice(); }); } }
  // 한 날이라도 하루 시간 cap 을 넘을 때만 improve 로 다시 균형 — cap 안에 다 들어오면 묶음(지리) 그대로 둔다 (사장님 10-24: 가까운 곳을 같은 날로)
  var over=best.some(function(g){ return dayLoad(H,g)>cap; });
  return over?improve(H,best,cap,avg):best; }
// (옛) 숙소 둘레 각도로 줄 세운 뒤 D 덩어리로 (모든 시작점 × DP) — 이동 + 시간초과 벌점 + 날짜 고르기 벌점 최소
function splitDaysAngular(H,P,D,cap){ var n=P.length; if(!n) return []; var C=hS(H)||{lat:P.reduce(function(s,x){ return s+x.lat; },0)/n,lng:P.reduce(function(s,x){ return s+x.lng; },0)/n};
  var srt=P.map(function(x){ return {x:x,a:Math.atan2(x.lat-C.lat,(x.lng-C.lng)*Math.cos(C.lat*Math.PI/180))}; }).sort(function(a,b){ return a.a-b.a; }).map(function(o){ return o.x; });
  var tot=P.reduce(function(s,x){ return s+x.stay; },0), avg=tot/D, best=null, bc=1e18;
  for(var s=0;s<n;s++){ var seq=srt.slice(s).concat(srt.slice(0,s)), gc={};
    var cost=function(i,j){ var k=i+","+j; if(gc[k]!=null) return gc[k]; var g=seq.slice(i,j); if(!g.length) return gc[k]=0; var ld=dayLoad(H,g), st=g.reduce(function(q,x){ return q+x.stay; },0), ov=Math.max(0,ld-cap);
      return gc[k]=(ld-st)+ov*20+0.01*(st-avg)*(st-avg); };
    var f=[], bk=[]; for(var d=0;d<=D;d++){ f.push(new Array(n+1).fill(1e18)); bk.push(new Array(n+1).fill(-1)); } f[0][0]=0;
    for(d=1;d<=D;d++) for(var j=0;j<=n;j++) for(var i=0;i<=j;i++){ if(f[d-1][i]>=1e18) continue; var v=f[d-1][i]+cost(i,j)+(i===j&&n>=D?500:0); if(v<f[d][j]){ f[d][j]=v; bk[d][j]=i; } }
    if(f[D][n]<bc){ bc=f[D][n]; var gs=[], jj=n; for(d=D;d>=1;d--){ var ii=bk[d][jj]; gs.unshift(seq.slice(ii,jj)); jj=ii; } best=gs; } }
  return improve(H,best,cap,avg); }
// 나눈 뒤 다듬기 — 한 곳 옮기기·두 곳 맞바꾸기로 (이동 + 시간초과 + 고르기) 합이 줄면 받아들인다
function improve(H,gs,cap,avg){ var cst=function(g){ if(!g.length) return 500; var ld=dayLoad(H,g), st=g.reduce(function(q,x){ return q+x.stay; },0); return (ld-st)+Math.max(0,ld-cap)*20+0.01*(st-avg)*(st-avg); };
  var cs=gs.map(cst), ok=true, it=0;
  while(ok&&it++<30){ ok=false;
    for(var a=0;a<gs.length;a++) for(var i=0;i<gs[a].length;i++) for(var b=0;b<gs.length;b++){ if(a===b) continue; var x=gs[a][i];
      var A=gs[a].slice(0,i).concat(gs[a].slice(i+1)), B=gs[b].concat([x]), ca=cst(A), cb=cst(B);
      if(ca+cb<cs[a]+cs[b]-0.5){ gs[a]=A; gs[b]=B; cs[a]=ca; cs[b]=cb; ok=true; i--; break; }
      for(var j=0;j<gs[b].length;j++){ var y=gs[b][j], A2=gs[a].slice(), B2=gs[b].slice(); A2[i]=y; B2[j]=x; var c1=cst(A2), c2=cst(B2);
        if(c1+c2<cs[a]+cs[b]-0.5){ gs[a]=A2; gs[b]=B2; cs[a]=c1; cs[b]=c2; ok=true; x=y; } } } }
  return gs; }
// 하루 시간표 — 정해진 행사 시각은 그 앞에 닿게, 입장마감 넘기면 표시
// lv (11-06, 오늘 실제 기록) = {i:마지막으로 기록된 장소 차례, rec:{키:{a:도착 분,d:출발 분}}, now:지금 분, r:이 손님 머문 시간 비율, ml:{차례:[식사]}} — 있으면
//   i 앞·i = 실제 도착·출발 시각 그대로(지금 장소는 「지금까지 + 경향」만큼), i 뒤 = 지금 시각부터 이동 + 계획 머문 시간 × 비율 · 식사 칸은 계획과 같은 자리(ml)
// 식사 칸 (사장님 11-06 「식사 시간 조절까지 AI답게」) — 정해진 시각에 박지 않고 장소와 장소 사이 가장 자연스러운 자리에
//   · 좋은 시작 시각 = 점심 11:30~13:30 · 저녁 17:30~19:30 (조금 이르거나 늦게는 11:00~14:30 · 17:00~20:30 까지)
//   · 자리 후보 = 첫 장소 앞·장소 사이·마지막 장소 뒤 — 후보마다 그날을 다시 계산해 「좋은 시각에서 벗어난 분 + (늘어난 하루 − 60분) + 1.5 × 늘어난 빈 시간」이 가장 작은 곳
//     (빈 시간 = 나와서 그냥 기다리는 시간 — 첫 장소 앞 기다림은 늦게 나오면 되니 빼고 센다)
//   · 문 여는 시각을 기다려야 하는 곳 앞이면 그 근처로 먼저 가서 먹고 들어간다(기다림이 식사로 바뀜) · 밤 장소(바·재즈바·클럽·공연)가 있는 날 저녁은 그 앞에
//   · 마지막 장소 뒤 식사는 끝나고 30분 안에 시작할 때만(몇 시간 뒤 저녁 칸만 덩그러니 X) — 하루가 점심 전에 끝나면 점심 없이, 저녁 전에 끝나면 저녁 없이
//   · 장소 사이 식사는 그 때문에 빈 시간이 45분 넘게 늘거나, 마감에 걸려 못 들어가는 곳이 생기면 안 넣는다
var ML={lunch:{lo:690,hi:810,la:660,ha:870,hl:870,c:750},dinner:{lo:1050,hi:1170,la:1020,ha:1230,hl:1260,c:1110}};   // hl = 오늘 실제 기록으로 다시 계산할 때 그 식사를 빼는 시각(지금처럼 점심 14:30·저녁 21:00)
function TO0(){ return hm2m(TR.opt&&TR.opt.to)||1200; }
function mDev(K,m){ var M=ML[K]; return Math.max(0,M.lo-m)+Math.max(0,m-M.hi); }
// 그 시각에 닿으면 문 열기를 기다려야 하나 — 기다려야 하면 여는 분, 아니면 null
function openAt(x,date,t){ if(!x||PERFK[x.k]) return null; var wn=winOf(x,date); if(!wn||wn.off) return null; for(var i=0;i<wn.w.length;i++) if(t<wn.w[i][1]) return t<wn.w[i][0]?wn.w[i][0]:null; return null; }
// 그 자리 식사 시작 — ready=먹을 수 있는 때 · la=식사 뒤 다음 장소까지 이동 · o=다음 장소 문 여는 시각(기다려야 할 때) · end=마지막 장소 뒤 · live=오늘 실제 기록(그 자리 그대로, 늦으면 뺀다)
function mealAt(K,ready,la,o,end,to,live){ var M=ML[K], a=Math.max(ready,M.la); if(live) return a>M.hl?null:a; if(a>M.ha) return null;
  var base=Math.max(ready+la,o||0), best=null, bc=1e18, T=(K==="dinner"&&o!=null)?Math.min(o-la-60,M.hi):Math.max(ready,M.lo);   // 같은 값이면 — 점심은 먹을 수 있을 때 바로, 문 열기를 기다릴 곳(밤 장소) 앞 저녁은 그 장소 들어가기 바로 전
  [a,M.lo,M.c,M.hi,M.ha,T,o!=null?o-la-60:null].forEach(function(m){ if(m==null||m<a||m>M.ha) return;
    var idle=end?m-ready:Math.max(m+60+la,o||0)-base-60; if(end&&(idle>30||m+60>to)) return;
    var c=mDev(K,m)+1.5*idle+0.01*Math.abs(m-T); if(c<bc){ bc=c; best=m; } });
  return best; }
// 하루 한 번 계산 — MP={자리:[식사]} (자리 j = j번째 장소 앞, 장소 수 = 마지막 장소 뒤)
// 그 시각에 떠나는 구간 — 밤 22:30 뒤 대중교통 구간은 택시로 · 오늘 실제 기록에 네이버 실시간 시간(lv.dr)이 있으면 그것 (11-06)
function legT(a,b,t,lv){ var lg=leg(a,b);
  if(lv&&lv.dr){ var q=lv.dr[(a.k||"")+">"+(b.k||"")]; if(q&&q.min>0) return {mode:"taxi",km:lg.km,min:q.min,fare:q.fare||null,why:lg.why||"live",real:1,live:1}; }
  if(OLD()||t==null) return lg;
  if(t>=NIGHT_TX&&lg.mode==="transit") return txLeg(a,b,"night",t);
  if(lg.mode==="taxi"&&lg.est&&(t>=1320||t%1440<240)) return Object.assign({},lg,{fare:taxiFare(lg.km,t)});
  return lg; }
function simDay(H,arr,date,from,mo,MP,lv,to){ var t=from, p=hS(H), rows=[], viol=0, wait=0, miss=0, idle=0, cut=0, tv=0, wd=0, pre=null, n=arr.length, gt=[];   // tv=이동 분 · wd=낮 장소(밤 장소 빼고) 문 열기를 나와서 기다린 분 · gt[j]=자리 j 에 닿는 시각
  var meals=function(j){ gt[j]=t; (MP[j]||[]).forEach(function(K){ var nx=j<n?arr[j]:null, r=(mo&&mo[K])||null, end=j>=n, past=!!lv&&j<=lv.i;
      // 어디서 먹나 — next = 다음 장소 근처로 먼저 가서 먹고 들어감(첫 장소 앞·밤 장소 앞 저녁·문 열기를 기다릴 곳 앞) · prev = 앞 장소 근처에서 먹고 이동
      var here=!!nx&&pre===nx, at="prev"; if(nx&&(here||j===0||(K==="dinner"&&isNight(nx))||openAt(nx,date,t+(p?legMin(p,nx):0))!=null)) at="next";
      var lg=null, mv=null, ready=t, la=0;
      if(r){ lg=p?legT(p,r,t,lv):null; ready=t+(lg?lg.min:0); la=nx?legMin(r,nx):0; }   // 고른 식당이 있으면 그리로 가서 먹고, 다음 장소는 식당에서 출발
      else if(at==="next"){ if(!here){ mv=p?legT(p,nx,t,lv):null; ready=t+(mv?mv.min:0); } }
      else if(nx) la=p?legMin(p,nx):0;
      var o=nx?openAt(nx,date,ready+la):null; if(j===0&&!lv&&o==null&&ready<ML[K].la) return;   // 첫 장소 앞 식사는 그 장소가 아직 안 열었거나(밤 장소 앞 저녁) 식사 시각에 첫 장소에 닿을 때만 — 나오자마자 점심 X
      var m=past?ready:mealAt(K,ready,la,o,end,to,!!lv); if(m==null) return;
      if(rows.length) idle+=Math.max(0,m-ready); if(lg) tv+=lg.min; if(mv) tv+=mv.min; t=m+60;
      rows.push({meal:K,lunch:1,t:m,anchor:(at==="next"||j===0)?nx:arr[j-1],next:nx,r:r,leg:lg||mv,to:(!r&&at==="next"&&!here&&nx)?nx.k:null});
      if(r){ p=r; pre=null; } else if(at==="next"&&!here){ p=nx; pre=nx; } }); };   // 다음 장소 근처로 먼저 갔으면 거기서 들어간다(이동 한 번)
  arr.forEach(function(x,i){ meals(i); var lg=pre===x?null:(p?legT(p,x,t,lv):null); pre=null; if(lg){ t+=lg.min; tv+=lg.min; } var f=FACT[x.k], dw=date.getUTCDay(), note=[], st=x.stay, act=0, R=lv&&lv.rec[x.k], w0=wait;
    if(lv&&i<=lv.i){ if(R&&R.a!=null) t=R.a;   // 실제로 다녀온 곳·지금 있는 곳 — 확인 없이 기록 그대로
      if(i<lv.i){ if(R&&R.a!=null&&R.d!=null) st=Math.max(1,R.d-R.a); act=R&&(R.a!=null||R.d!=null)?2:0; }
      else if(R&&R.d!=null){ if(R.a==null&&R.d-t<10) t=R.d-x.stay; st=Math.max(1,R.d-t); act=2; }
      else { st=Math.max(Math.round(x.stay*lv.r),lv.now-t+1); if(R&&R.u!=null) st=Math.max(st,R.u-t); act=1; } }   // R.u = 「더 있을게요」로 정한 떠날 시각 (11-06)
    else {
      if(lv){ if(t<lv.now) t=lv.now; st=Math.max(5,Math.round(x.stay*lv.r)); }
      if(f&&f.ev&&f.evd.indexOf(dw)>=0){ var ev=null; f.ev.forEach(function(e){ if(ev==null&&t<=e-10+5) ev=e; }); if(ev!=null&&ev-10>t&&ev-10-t<=90){ wait+=ev-10-t; t=ev-10; } if(ev!=null) note.push([f.evn[0]+" "+m2hm(ev),f.evn[1]+" "+m2hm(ev)]); else miss++; }
      var wn=PERFK[x.k]?null:winOf(x,date);   // 영업시간 (11-06) — 문 열기 전이면 기다렸다 들어가고, 마감 뒤면 표시
      if(wn){ if(wn.off){ viol++; note.push({o:LV6.off}); }
        else { var wq=null, lc=null; for(var wi=0;wi<wn.w.length;wi++){ if(t<wn.w[wi][1]){ wq=wn.w[wi]; break; } lc=wn.w[wi][1]; }
          if(!wq){ viol++; note.push({o:LV6.shut,v:{t:m2hm(lc||0)}}); } else { if(t<wq[0]){ wait+=wq[0]-t; t=wq[0]; note.push({o:LV6.open,v:{t:m2hm(wq[0])}}); } if(t+st>wq[1]) cut+=t+st-wq[1]; } }   // cut = 마감에 걸려 덜 머무는 분
        if(wn.eve) note.push({o:LV6.eve}); }
      var li=PERFK[x.k]?null:lastIn(f,date); if(li!=null&&t>li){ viol++; note.push(["입장 마감 "+m2hm(li)+" 지남","Last entry "+m2hm(li)+" passed"]); } }
    if(rows.length){ idle+=wait-w0; if(!isNight(x)) wd+=wait-w0; }
    rows.push({x:x,leg:lg,t:t,note:note,st:st,act:act,ext:act===1?1:0}); t+=st; p=x; });
  meals(n);
  var HE=hE(H), back=(HE&&n)?legT(p,HE,t,lv):null; if(back){ t+=back.min; tv+=back.min; }
  return {rows:rows,back:back,end:t,viol:viol,wait:wait,miss:miss,idle:idle,cut:cut,tv:tv,wd:wd,gt:gt}; }
function addM(MP,j,K){ var o={}; for(var q in MP) o[q]=MP[q].slice(); (o[j]=o[j]||[]).push(K); return o; }
// mo={to,lunch,dinner}(고른 식당) — 없으면 하루 끝 = 지금 조건
function sched(H,arr,date,from,mo,lv){ var to=(mo&&mo.to)||TO0();
  if(lv&&lv.ml){ var LM={}; for(var li in lv.ml) LM[+li+1]=lv.ml[li].slice(); return simDay(H,arr,date,from,mo,LM,lv,to); }   // 오늘 실제 기록 — 식사는 계획과 같은 자리
  var mb={to:to}, MP={}, cur=simDay(H,arr,date,from,mb,MP,null,to), n=arr.length; if(!n) return simDay(H,arr,date,from,mo,MP,null,to);   // 자리는 고른 식당 없이 정한다 — 식당을 골라도 식사 자리가 안 바뀌게
  var jn=-1; for(var i=0;i<n;i++) if(isNight(arr[i])){ jn=i; break; }
  var lg=-1;
  ["lunch","dinner"].forEach(function(K){ var best=null;
    for(var j=(K==="dinner"&&lg>=0)?lg:0;j<=n;j++){ if(K==="dinner"&&jn>=0&&j>jn) break;   // 저녁은 밤 장소 앞까지만
      if(cur.gt[j]>ML[K].ha) break;   // 그 자리에 닿는 시각이 이미 늦으면 뒤 자리도 다 늦다 (식사를 넣으면 늦어지기만 한다) — 장소가 많은 날 계산을 줄인다
      var M2=addM(MP,j,K), s=simDay(H,arr,date,from,mb,M2,null,to), mr=null; s.rows.forEach(function(r){ if(r.meal===K) mr=r; }); if(!mr) continue;
      var di=s.idle-cur.idle; if(s.viol>cur.viol||(j<n&&di>45)) continue;
      var c=mDev(K,mr.t)+(s.end-cur.end-60)+1.5*di+(K==="dinner"&&j===jn?-20:0)+0.01*Math.abs(mr.t-ML[K].c);
      if(!best||c<best.c-1e-6) best={c:c,j:j,s:s,M:M2}; }
    if(best){ MP=best.M; cur=best.s; if(K==="lunch") lg=best.j; } });
  return (mo&&(mo.lunch||mo.dinner))?simDay(H,arr,date,from,mo,MP,null,to):cur; }
// 순서 점수 — 못 들어감·행사 놓침 ≫ 숙소 도착 시각 + 낮 장소 문 열기를 나와서 기다림 + 마감에 걸려 덜 머묾 + 이동 × 0.5 (11-06 늦게 여는 곳은 기다리지 말고 다른 곳 먼저)
//   이동을 따로 보는 까닭 — 밤 장소가 있는 날은 숙소 도착이 그 장소 시각으로 정해져, 이동을 늘려 밤 장소 앞 빈 시간을 메우는 순서가 「좋아」 보였다
function sc(s){ return s.viol*1000+s.miss*120+s.end+(s.wd||0)+(s.cut||0)*2+(s.tv||0)*0.5; }
function fixTimes(H,arr,date,from,to){ var mo={to:to||TO0()}, cur=arr, cs=sched(H,cur,date,from,mo);
  for(var ps=0;ps<3;ps++){ var mv=false;   // 한 곳 옮기면 다른 곳 자리도 달라지니 바뀌는 게 없을 때까지(3번까지)
    arr.forEach(function(x){ if(!(FACT[x.k]||winOf(x,date))||PERFK[x.k]) return; var base=cur.filter(function(y){ return y!==x; });   // 영업시간이 있는 곳도 문 여는 시각에 맞는 자리로 (11-06)
      for(var i=0;i<=base.length;i++){ var c=base.slice(0,i).concat([x],base.slice(i)); if(c.some(function(y,j){ return j>0&&!isNight(y)&&isNight(c[j-1]); })) continue; var s=sched(H,c,date,from,mo);   // 밤·공연 장소는 늘 끝자리
        if(sc(s)<sc(cs)-1){ cur=c; cs=s; mv=true; } } });
    if(!mv) break; }
  return cur; }
// 밤 장소가 있는 날 (11-06) — 낮 장소는 숙소에서 나와 첫 밤 장소 쪽으로 끝나게(숙소로 돌아오는 길은 밤 장소 뒤) · 밤 장소끼리는 따로 순서
//   (예전엔 밤 장소까지 한 바퀴로 짠 뒤 밤 장소만 뒤로 빼서, 이태원 → 잠실 → 종로 → 다시 이태원처럼 돌았다)
function pathCost(S,arr,E){ if(!arr.length) return 0; var c=0, p=S||arr[0]; arr.forEach(function(x){ c+=legMin(p,x); p=x; }); if(E) c+=legMin(p,E); return c; }
function twoOptPath(S,arr,E){ var a=arr.slice(), imp=true, it=0;
  while(imp&&it++<50){ imp=false; for(var i=0;i<a.length-1;i++) for(var j=i+1;j<a.length;j++){ var b=a.slice(0,i).concat(a.slice(i,j+1).reverse(),a.slice(j+1)); if(pathCost(S,b,E)+0.01<pathCost(S,a,E)){ a=b; imp=true; } } } return a; }
function orderDay(H,arr,date,from,to){ if(!arr.length) return arr; var day=arr.filter(function(x){ return !isNight(x); }), nt=arr.filter(isNight), o;
  if(nt.length&&day.length){ nt=twoOpt(H,nnOrder(H,nt)); o=twoOptPath(hS(H),nnOrder(H,day),nt[0]).concat(nt); }
  else { o=twoOpt(H,nnOrder(H,arr)); var n2=o.filter(isNight); o=o.filter(function(x){ return !isNight(x); }).concat(n2); }
  return fixTimes(H,o,date,from,to); }
function closedOn(x,d){ var f=FACT[x.k]; if(f&&f.cl&&f.cl.indexOf(d.getUTCDay())>=0) return true; var w=winOf(x,d); return !!(w&&w.off); }   // 구글 영업시간상 쉬는 요일도 (11-06)
function perms(a){ if(a.length<=1) return [a]; var r=[]; a.forEach(function(x,i){ perms(a.slice(0,i).concat(a.slice(i+1))).forEach(function(p){ r.push([x].concat(p)); }); }); return r; }
function compute(H,Dn){ if(!OLD()){ var nat=null; try{ nat=natPlan(H,Dn); }catch(e){ try{ console.error(e); }catch(x){} nat=null; } if(nat) return nat; }   // 도시가 둘 이상이거나 공항을 넣었으면 전국 일정 (11-06)
  var o=TR.opt, D=Dn||o.n, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), skip=[];
  var P=TR.items.filter(function(it){ var c=catOf(it); if(c==="hotel"||c==="trans"){ skip.push(it); return false; } return true; }).map(function(it){ return Object.assign({},it,{stay:stayOf(it)}); });
  var gs=splitDays(H,P,D,cap); while(gs.length<D) gs.push([]);
  // 날짜 배치 — 휴무 겹침이 가장 적은 차례 (7일이면 5040가지)
  var dates=[]; for(var i=0;i<D;i++) dates.push(dayDate(i));
  var bad=function(g,d){ return g.filter(function(x){ return closedOn(x,d); }).length; }, bp=null, bb=1e9, idx=gs.map(function(_,i){ return i; });
  (D<=7?perms(idx):[idx]).forEach(function(pm){ var s=0; pm.forEach(function(gi,di){ s+=bad(gs[gi],dates[di])*10+(gi!==di?0.01:0); }); if(s<bb){ bb=s; bp=pm; } });
  gs=bp.map(function(gi){ return gs[gi].slice(); });
  // 남은 휴무 겹침은 문 여는 다른 날로
  gs.forEach(function(g,di){ g.slice().forEach(function(x){ if(!closedOn(x,dates[di])) return; var bj=-1, bc=1e9;
    gs.forEach(function(h,dj){ if(dj===di||closedOn(x,dates[dj])) return; var c=dayLoad(H,h.concat([x]))-dayLoad(H,h); if(c<bc){ bc=c; bj=dj; } });
    if(bj>=0){ g.splice(g.indexOf(x),1); gs[bj].push(x); } }); });
  var days=gs.map(function(g,di){ var ord=orderDay(H,g,dates[di],from,to), s=sched(H,ord,dates[di],from,{to:to});
    return {date:dates[di].toISOString().slice(0,10),stops:ord.map(function(x){ return x.k; }),end:s.end}; });
  var pool={}; P.forEach(function(x){ pool[x.k]=x; });
  return {v:1,at:Date.now(),from:from,to:to,hotel:o.hotel&&o.hotel.type!=="here"?o.hotel:(o.hotel?{type:"here"}:null),days:days,pool:pool,skip:skip.map(function(x){ return x.k; }),ai:null}; }
// 날짜 수 추천 (사장님 11-05) — 고른 날짜로 하루 끝 시각 안에 다 못 돌면, 다 들어가는 가장 짧은 날짜 수를 (고른 수+1)~7일 차례로 짜 보아 찾는다. 7일로도 안 되면 7
//   「들어간다」= 보고서 ⚠ 경고와 같은 기준 — 그날 시간표(식사 칸 포함, 새 일정의 mealsOf 와 같은 {to,lunch:null,dinner:null}) 숙소 도착 ≤ 하루 끝
function planFits(H,p){ return p.days.every(function(d,di){ var X=dayX(p,di,H), arr=X.arr, dt=X.dt;
  return sched(X.H,arr,dt,X.from,{to:X.to,lunch:null,dinner:null}).end<=dayLim(p,{},X.H,arr,dt,X); }); }   // 밤 장소가 있는 날은 그 장소 시각까지가 그날 (11-06) · 전국 일정은 그날 틀(출발점·시작 시각·기차 시각)로
var SUG={key:""};   // 같은 일정·조건·실제 시간 개수면 다시 안 짠다 (화면에만)
function sugDays(H,cur,at){ var key=at+"|"+cur+"|"+Object.keys(RT).length+"|"+JSON.stringify(TR.opt); if(SUG.key===key) return SUG.n; var n=7;
  for(var D=Math.max(2,cur+1);D<=7;D++){ if(planFits(H,compute(H,D))){ n=D; break; } }
  SUG={key:key,n:n}; return n; }
// 날짜 줄이기 추천 (사장님 11-06 「손님 일정이 너무 많이 남을 때를 AI가 스스로 판단」) — 늘리기의 반대
//   더 적은 날짜로 다시 짜 보아 모든 날이 ① 하루 끝 시각(밤 장소가 있는 날은 그 장소 시각까지 — 보고서 ⚠ 와 같은 기준) 안에 숙소 도착
//   ② 문 여는 시각·마감·쉬는 날에 걸려 못 들어가는 곳이 지금 일정보다 늘지 않고 ③ 식사 칸까지 넣은 시간표에서 나와서 그냥 기다리는 시간이 하루 SHR_IDLE 분 이하
//   → 그중 가장 적은 날짜 수. 1일부터 짜 보되 머문 시간 합 ÷ 하루 길이보다 적은 날짜는 건너뛴다 · 같은 일정·조건이면 다시 안 짠다 (화면에만, 허브 호출 없음)
var SHR_IDLE=120, SHR={key:""};
function planScore(H,p){ var v=0, ok=true;
  p.days.forEach(function(d,di){ var X=dayX(p,di,H), arr=X.arr; if(!arr.length) return; var dt=X.dt, s=sched(X.H,arr,dt,X.from,{to:X.to,lunch:null,dinner:null});
    v+=s.viol; if(s.end>dayLim(p,{},X.H,arr,dt,X)||s.idle>SHR_IDLE) ok=false; });
  return {v:v,ok:ok}; }
function shrinkDays(H,pl){ var cur=pl.days.length; if(cur<2) return 0; var key=pl.at+"|"+cur+"|"+Object.keys(RT).length+"|"+JSON.stringify(TR.opt)+"|"+TR.items.length; if(SHR.key===key) return SHR.n;
  var o=TR.opt, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), n=0, base=planScore(H,pl).v;
  var st=TR.items.filter(function(it){ var c=catOf(it); return c!=="hotel"&&c!=="trans"; }).reduce(function(s,x){ return s+stayOf(x); },0);
  if(st>0) for(var D=Math.max(1,Math.ceil(st/cap));D<cur;D++){ var q=planScore(H,compute(H,D)); if(q.ok&&q.v<=base){ n=D; break; } }
  SHR={key:key,n:n}; return n; }
function hotelPos(cb){ var h=TR.opt.hotel; if(!h) return cb(null); if(h.type!=="here") return cb({k:"__hotel",ko:h.ko,en:h.en,lat:+h.lat,lng:+h.lng,hotel:1});
  var use=function(p){ cb(p?{k:"__hotel",ko:"현재 위치",en:"Current location",lat:p[0],lng:p[1],hotel:1,here:1}:null); };
  if(window.ME&&ME.pos) use(ME.pos); else myPos().then(use); }

// ── 일정 짜기 ──
function planGo(){ if(!hasPass()){ openPricing(); return; } if(!TR.items.length) return;
  var b=document.getElementById("trPlan"); if(b){ b.disabled=true; b.textContent=T("짜는 중…","Planning…"); }
  hotelPos(function(H){ setTimeout(function(){ var pl;
    try{ pl=compute(H); }catch(e){ try{ console.error(e); }catch(x){} if(b){ b.disabled=false; b.innerHTML=MPICO("mi_calendar",T("🗓 일정 짜기","🗓 Plan my trip"),MIS); } return; }
    pl.H=H&&!H.here?H:null; TR.plan=pl; save();
    var shown=false, show=function(){ if(shown) return; shown=true; try{ ntap("_trip","trip_plan"); }catch(e){} openReport(H); };
    if(OLD()||typeof fetch!=="function"){ show(); return; }
    // 실제 대중교통 시간 — 6초 안에 오면 그걸로 보여주고, 늦으면 직선거리로 먼저 보여준 뒤 오는 대로 그 자리에서 다듬는다 (recsFetch·aiFetch 처럼)
    var to=setTimeout(show,6000), left=2;
    // 전국 일정 (11-06) — 도시 사이 열차 시간표(TAGO)·버스(ODsay)도 같이 받고, 다 오면 그날 틀로 순서를 다시 · 그 뒤 택시 구간 요금(네이버 길찾기)을 받아 그 자리에서 다듬는다
    var fin=function(){ if(--left>0) return; reorderWithReal(pl,H); save(); if(shown){ if(document.getElementById("trRep")) repPaint(); } else { clearTimeout(to); show(); }
      drFetch(pl,function(n){ if(n&&TR.plan===pl){ save(); if(document.getElementById("trRep")) repPaint(); } }); };
    realTimesFetch(pl,H,fin); trFetch(pl,fin);
  },30); }); }
// 실제 대중교통 시간이 온 뒤 — 날짜 묶음은 그대로, 그날 안 순서만 실제 시간표로 다시 (2-opt 가 실제 시간을 본다)
function reorderWithReal(pl,H){ if(!pl||!pl.days) return;
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), dt=X.dt, arr=X.arr; if(!arr.length) return;
    var ord=orderDay(X.H,arr,dt,X.from,X.to), s=sched(X.H,ord,dt,X.from,{to:X.to}); d.stops=ord.map(function(x){ return x.k; }); d.end=s.end; }); }
// 일정에 실제로 나오는 구간만(날짜 안 — 날짜끼리는 직선거리 그대로) 허브 /ntimes 로 한 번에. 짧은 걷기 구간은 빼고, 캐시(sessionStorage)는 다시 안 묻는다. 허브가 ODsay 하루 한도를 지킨다
function realTimesFetch(pl,H,cb){ var pairs=[], keys=[], seen={};
  var add=function(a,b){ if(!a||!b||!isFinite(a.lat)||!isFinite(b.lat)) return; var dk=km(a,b); if(dk<=walkKm()) return; if(!OLD()&&(dk<=TX_SHORT||dk>80||isleOf(a)!==isleOf(b))) return;   // 택시 구간(짧은 곳)·도시 사이는 안 묻는다 (11-06 — ODsay 아낌)
    var kk=rtKey(a,b); if(seen[kk]) return; seen[kk]=1;
    if(typeof RT[kk]==="number") return; var sv=null; try{ sv=sessionStorage.getItem("nt:"+kk); }catch(e){} if(sv!=null&&sv!==""){ RT[kk]=+sv; return; }
    keys.push(kk); pairs.push([+a.lat,+a.lng,+b.lat,+b.lng]); };
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), arr=X.arr, S=hS(X.H), E=hE(X.H), set=(S?[S]:[]).concat(E&&E!==S?[E]:[],arr);
    for(var i=0;i<set.length;i++) for(var j=i+1;j<set.length;j++) add(set[i],set[j]); });
  if(!pairs.length){ cb(); return; }
  pairs=pairs.slice(0,60); keys=keys.slice(0,60);   // 플랜마다 구간 상한(허브도 하루 한도로 또 막는다)
  var ctl=("AbortController" in window)?new AbortController():null, t=setTimeout(function(){ if(ctl) try{ ctl.abort(); }catch(e){} },20000);   // 넉넉히 — 첫 화면은 6초에 직선거리로 이미 뜨고, 이건 그 뒤 실제 시간이 와서 그 자리에서 다듬어지는 요청
  fetch(HUB+"/ntimes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pairs:pairs,mode:"transit"}),signal:ctl?ctl.signal:undefined})
    .then(function(r){ return r.json(); }).then(function(j){ clearTimeout(t); var ts=(j&&j.times)||[], used=0;
      keys.forEach(function(kk,i){ var m=ts[i]&&ts[i].min; if(typeof m==="number"&&m>0){ RT[kk]=m; used++; try{ sessionStorage.setItem("nt:"+kk,String(m)); }catch(e){} } });
      window.__trRtUsed=used; window.__trRtAsk=keys.length; cb(); })
    .catch(function(e){ clearTimeout(t); window.__trRtErr=String(e); cb(); }); }
// 이 일정이 실제 대중교통 시간을 쓰는 구간이 하나라도 있나 (아래 안내 문구 고르기용)
function planUsesReal(pl,H){ if(OLD()||!pl||!pl.days) return false; var any=false;
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), arr=X.arr, p=hS(X.H), E=hE(X.H);
    arr.forEach(function(x){ if(p&&km(p,x)>walkKm()&&typeof RT[rtKey(p,x)]==="number") any=true; p=x; });
    if(E&&arr.length&&km(p,E)>walkKm()&&typeof RT[rtKey(p,E)]==="number") any=true; }); return any; }
function planHotel(cb){ var pl=TR.plan; if(!pl||!pl.hotel) return cb(null); if(pl.hotel.type==="here") return hotelPos(cb); cb({k:"__hotel",ko:pl.hotel.ko,en:pl.hotel.en,lat:+pl.hotel.lat,lng:+pl.hotel.lng,hotel:1}); }
function aiFetch(){ var pl=TR.plan; if(!pl) return; var hn=pl.mc?"":(pl.hotel&&pl.hotel.type!=="here"?pl.hotel.ko:"");
  // 보고서와 같은 시간표(식사 칸·밤 장소·문 여는 시각 반영)를 그대로 보낸다 (11-06) — 식사는 e:[{a:그 앞 장소 수, k:L 점심·D 저녁, t:시각}] (옛 허브는 모르는 칸이라 버린다)
  //   전국 일정(11-06) — 그날 도시 사이 이동 mv·공항 ap·그날 밤 숙소 ht 도 시간표 그대로 (aiExtra) · 숙소 하나 일정은 예전 본문 그대로(허브 캐시 그대로)
  var H0=REPH||pl.H||null, body={h:hn,d:pl.days.map(function(d,di){ var X=dayX(pl,di,H0), dt=X.dt, s=sched(X.H,X.arr,dt,X.from,moX(di,X)), np=0, st=[], e=[];
    s.rows.forEach(function(r){ if(r.meal){ e.push({a:np,k:r.meal==="dinner"?"D":"L",t:m2hm(r.t)}); return; } np++; st.push({k:r.x.k,ko:r.x.ko,en:r.x.en,t:m2hm(r.t),m:r.x.stay}); });
    var o={w:DOW_EN[dt.getUTCDay()],s:st}; if(e.length) o.e=e; if(pl.mc) aiExtra(pl,di,X,s,o); return o; }).filter(function(d){ return d.s.length; }),lang:LANG};   // lang: 허브가 그 언어 설명을 줄 수 있게 (10-18 — 지금 허브는 ko/en)
  var at=pl.at; var ap=document.getElementById("trAiS"); if(ap) ap.hidden=false;
  fetch(HUB+"/ntrip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){ return r.json(); }).then(function(j){
    window.__trAiRes=j&&(j.ok?"ok":String(j.err)); if(!TR.plan||TR.plan.at!==at) return; if(j&&j.ok){ var k=0, days=pl.days.map(function(d){ return d.stops.length?(j.days||[])[k++]||null:null; }); TR.plan.ai={days:days,tips:j.tips||{}}; save(); } else if(!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1};
    if(document.getElementById("trRep")) repPaint(); }).catch(function(e){ window.__trAiRes="E "+e; if(TR.plan&&TR.plan.at===at&&!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1}; var a=document.getElementById("trAiS"); if(a) a.hidden=true; }); }

// ── 보고서 ──
var REPH=null, REPME=null, GEO=null, GEOST="";   // REPME = 그날 1번째 구간 출발점 = 「지금 내 위치」(숙소 아님 — 그날 숙소에서 안 잘 수도, 사장님 10-20) · GEO 는 이 화면 메모리에만(저장·전송 없음)
// 일·중 화면인데 AI 설명에 그 언어 칸이 없으면(다른 언어로 짠 일정) 그 언어로 한 번 더 받는다 — 허브는 같은 본문을 캐시 (10-18)
function aiLangMiss(ai){ if(!ai||!ai.days||!/^(ja|zhs|zht|es)$/.test(LANG)) return false; var d=ai.days.filter(Boolean)[0]; return !!d&&!d[LANG]; }
function openReport(H){ if(!TR.plan) return; drLoad(TR.plan); var pl0=TR.plan; if(pl0.mc&&Array.isArray(pl0.tr)&&pl0.tr.some(function(t){ return !t.st; })) trFetch(pl0,function(){ if(TR.plan!==pl0) return; save(); if(document.getElementById("trRep")) repPaint(); });   // 공유로 받은 전국 일정 — 열차·버스 시간표를 받는다(순서는 받은 그대로)
  sheetClose("trBox"); sheet("trRep"); GEOST=""; GEO=null; /* 열 때마다 위치를 한 번 새로 */ var aiGo=function(){ if(TR.plan&&(!TR.plan.ai||aiLangMiss(TR.plan.ai))&&hasPass()) aiFetch(); };
  if(H!==undefined){ REPH=H; repPaint(); aiGo(); } else planHotel(function(h){ REPH=h; repPaint(); aiGo(); }); }
function legTxt(lg){ if(!lg) return ""; var d=lg.km<1?Math.round(lg.km*1000)+" m":lg.km.toFixed(1)+" km";
  if(lg.mode==="walk") return MPICO("mi_walk",T("🚶 걸어서 약 "+lg.min+"분","🚶 ~"+lg.min+" min walk"),MIS)+" · "+d;
  if(lg.mode==="transit") return MPICO("mi_subway",T("🚇 대중교통 약 ","🚇 Transit ~"),MIS)+durTxt(lg.min)+(lg.real?" ✓":"")+" · "+d;
  if(lg.mode==="taxi"){ var fr=lg.fare?gTxt(lg.est?TX6.fe:TX6.fr,{f:won(lg.fare)}):"";   // 택시 (11-06) — 네이버 길찾기 값이면 ✓, 어림이면 「약」
    return MPICO("mi_taxi",gTxt(TX6.m,{m:durTxt(lg.min)}),MIS)+(lg.real?" ✓":"")+(fr?" · "+esc(fr):"")+" · "+d+' <i class="txw">'+esc(T5(TX6[lg.live?"live":lg.why]||TX6.short))+'</i>'; }
  if(lg.mode==="air") return MPICO("mi_plane",gTxt(NX6.airLeg,{d:durTxt(lg.min)}),MIS)+" · "+Math.round(lg.km)+" km";
  return MPICO("mi_train",T("🚄 장거리 이동 약 ","🚄 Long trip ~"),MIS)+durTxt(lg.min)+T(" (기차·버스)"," (train/bus)")+" · "+Math.round(lg.km)+" km"; }
// 일찍 끝나는 날 (사장님 10-27 「손님이 넣은 끝 시각에 맞춰라, 맘대로 늘리지 마라 — 일찍 끝나면 숙소로 일찍 갈지 묻고, 아니면 언제 도착하고 싶은지 물어 그때 추가 일정」)
//   d.gap = "early"(일찍 감) · {until:분}(그 시각까지 추가 일정을 넣음). 추가 장소 = 지도 그림 명소 중 그날 마지막 장소에서 가까운 곳(숙소·교통 빼고)
var GX={
 q:{ko:"이 날은 {e}에 끝나서 하루 끝({t})까지 {g}이 비어요. 숙소로 일찍 돌아갈까요?",en:"This day ends at {e}, leaving {g} free before your end time ({t}). Head back to your lodging early?",ja:"この日は{e}に終わり、終了時刻（{t}）まで{g}空きます。早めに宿に戻りますか？",zhs:"这一天{e}结束，到结束时间（{t}）还空出{g}。要早点回住处吗？",zht:"這一天{e}結束，到結束時間（{t}）還空出{g}。要早點回住處嗎？",es:"Este día termina a las {e} y te quedan {g} libres hasta tu hora de fin ({t}). ¿Vuelves antes al alojamiento?"},
 y:{ko:"네, 일찍 갈게요",en:"Yes, go back early",ja:"はい、早めに戻ります",zhs:"好，早点回去",zht:"好，早點回去",es:"Sí, volver antes"},
 n:{ko:"아니요, 더 둘러볼래요",en:"No, I want to see more",ja:"いいえ、もっと回りたい",zhs:"不，我想多逛逛",zht:"不，我想多逛逛",es:"No, quiero ver más"},
 w:{ko:"몇 시쯤 숙소에 도착하길 원하세요?",en:"What time would you like to get back to your lodging?",ja:"何時ごろ宿に着きたいですか？",zhs:"您希望几点左右回到住处？",zht:"您希望幾點左右回到住處？",es:"¿A qué hora quieres llegar al alojamiento?"},
 go:{ko:"추가 일정 짜기",en:"Add more to this day",ja:"追加の予定を組む",zhs:"安排更多行程",zht:"安排更多行程",es:"Añadir más a este día"},
 ok:{ko:"숙소로 일찍 돌아가는 일정이에요.",en:"You head back to your lodging early this day.",ja:"この日は早めに宿に戻る予定です。",zhs:"这一天早点回住处。",zht:"這一天早點回住處。",es:"Este día vuelves antes al alojamiento."},
 none:{ko:"근처에 더 넣을 곳을 찾지 못했어요. 지도에서 골라 「내 여행에 담기」로 넣어 주세요.",en:"Couldn’t find more places nearby. Pick some on the map and add them to your trip.",ja:"近くに追加できる場所が見つかりませんでした。地図から選んで「旅行に追加」してください。",zhs:"附近没有找到可添加的地点。请在地图上选择并加入行程。",zht:"附近沒有找到可加入的地點。請在地圖上選擇並加入行程。",es:"No encontramos más lugares cerca. Elige en el mapa y añádelos a tu viaje."},
 re:{ko:"다시 묻기",en:"Ask again",ja:"もう一度",zhs:"重新选择",zht:"重新選擇",es:"Volver a preguntar"}};
function gTxt(o,v){ return T5(o).replace(/\{(\w)\}/g,function(_,k){ return v[k]; }); }
// 날짜 수 추천 칸 (사장님 11-05) — 보고서 맨 위 안내 한 줄 + [N박 N+1일로 다시 짜기]. 누르면 날짜 수만 바꿔 「일정 짜기」 길(planGo) 그대로
var SG6={
 q1:{ko:"담은 {n}곳은 하루에 다 못 돌아요 — {r}을 추천해요",en:"The {n} places you added won’t fit in one day — we recommend {r}",ja:"追加した{n}か所は1日では回りきれません — {r}がおすすめです",zhs:"已加入的{n}个地点一天逛不完——建议安排{r}",zht:"已加入的{n}個地點一天逛不完——建議安排{r}",es:"Los {n} lugares que añadiste no caben en un día — te recomendamos {r}"},
 qn:{ko:"담은 {n}곳은 {c}일 안에 다 못 돌아요 — {r}을 추천해요",en:"The {n} places you added won’t fit in {c} days — we recommend {r}",ja:"追加した{n}か所は{c}日では回りきれません — {r}がおすすめです",zhs:"已加入的{n}个地点{c}天内逛不完——建议安排{r}",zht:"已加入的{n}個地點{c}天內逛不完——建議安排{r}",es:"Los {n} lugares que añadiste no caben en {c} días — te recomendamos {r}"},
 go:{ko:"{r}로 다시 짜기",en:"Re-plan for {r}",ja:"{r}で組み直す",zhs:"改为{r}重新安排",zht:"改為{r}重新安排",es:"Planificar de nuevo para {r}"},
 // 줄이기 (11-06) — {c}=날짜 수 · {d}=영어·스페인어 「N day(s)/día(s)」
 s1:{ko:"담은 곳은 {c}일이면 다 돌 수 있어요",en:"Everything you added fits in {d}",ja:"追加した場所は{c}日で回れます",zhs:"已加入的地点{c}天就能逛完",zht:"已加入的地點{c}天就能逛完",es:"Todo lo que añadiste cabe en {d}"},
 sgo:{ko:"{c}일로 줄이기",en:"Shorten to {d}",ja:"{c}日に短縮する",zhs:"缩短为{c}天",zht:"縮短為{c}天",es:"Acortar a {d}"},
 sno:{ko:"이대로 둘게요",en:"Keep it as is",ja:"このままにする",zhs:"保持不变",zht:"保持不變",es:"Dejarlo así"}};
function tripLen(n){ var x=n-1; return T5({ko:n<2?"당일":x+"박 "+n+"일",en:n<2?"a day trip":n+" days ("+x+" night"+(x>1?"s":"")+")",ja:n<2?"日帰り":x+"泊"+n+"日",zhs:n<2?"一日游":n+"天"+x+"晚",zht:n<2?"一日遊":n+"天"+x+"夜",es:n<2?"una excursión de un día":n+" días y "+x+" noche"+(x>1?"s":"")}); }
function sugHtml(cur,rn){ var np=TR.items.filter(function(it){ var c=catOf(it); return c!=="hotel"&&c!=="trans"; }).length, v={n:np,c:cur,r:tripLen(rn)};
  return '<div class="tgap" id="trSug" data-html2canvas-ignore><b>'+esc(gTxt(cur<2?SG6.q1:SG6.qn,v))+'</b><div class="tgr"><button type="button" class="trbtn" data-sugn="'+rn+'">'+esc(gTxt(SG6.go,v))+'</button></div></div>'; }
// 줄이기 칸 (11-06) — 같은 자리·같은 모양. [N일로 줄이기] = 늘리기 단추와 같은 길(날짜 수만 바꿔 다시 짜기) · [이대로 둘게요] = 이 일정에선 다시 안 묻고, 일찍 끝나는 날 물음을 보인다
function shrHtml(rn){ var v={c:rn,d:LANG==="es"?rn+(rn>1?" días":" día"):rn+(rn>1?" days":" day")};
  return '<div class="tgap" id="trSug" data-html2canvas-ignore><b>'+esc(gTxt(SG6.s1,v))+'</b><div class="tgr"><button type="button" class="trbtn" data-sugn="'+rn+'" data-shr="1">'+esc(gTxt(SG6.sgo,v))+'</button><button type="button" class="trbtn" data-shrno="1">'+esc(T5(SG6.sno))+'</button></div></div>'; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-shrno]"); if(!b||!TR.plan) return; e.preventDefault(); TR.plan.noShr=1; save(); repPaint(); });
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-sugn]"); if(!b) return; e.preventDefault(); var n=+b.dataset.sugn; if(!(n>=1&&n<=7)||b.disabled) return;
  b.disabled=true; b.textContent=T("짜는 중…","Planning…"); try{ ntap("_trip",b.dataset.shr?"trip_shrdays":"trip_sugdays"); }catch(z){}
  TR.opt.n=n; TR.plan=null; save(); planGo(); });   // 여행 일수 칸을 바꾼 것과 같게(#trN onchange) → 「일정 짜기」
// 그날 아래 ⚠ 경고 — 쉬운 말로 (사장님 11-05). {t} = 그날 기준 끝 시각(추가 일정으로 정한 시각이 있으면 그것)
var OVR6={ko:"이 날은 장소가 많아 {t}까지 다 못 돌아요 — 장소를 빼거나 날짜를 늘려 보세요",en:"Too many places to finish this day by {t} — remove a place or add a day",ja:"この日は場所が多く、{t}までに回りきれません — 場所を減らすか日数を増やしてください",zhs:"这一天地点太多，{t}前逛不完——请减少地点或增加天数",zht:"這一天地點太多，{t}前逛不完——請減少地點或增加天數",es:"Este día tiene demasiados lugares para terminar antes de las {t} — quita un lugar o añade un día"};
function gapAsk(pl,d,di,s,hush){ var gap=pl.to-s.end; if(d.gap==="early") return '<div class="tgap" data-html2canvas-ignore><span>'+esc(T5(GX.ok))+'</span> <a href="#" data-gap="re" data-d="'+di+'">'+esc(T5(GX.re))+'</a></div>';
  if(d.gap&&d.gap.until){ return d.gap.none?'<div class="tgap" data-html2canvas-ignore>'+esc(T5(GX.none))+'</div>':''; }
  if(gap<45) return "";
  if(hush&&!d.gap) return "";   // 날짜 줄이기 칸이 맨 위에 떠 있으면 줄이기를 먼저 — 「이대로 둘게요」를 누르면 이 물음이 다시 보인다 (11-06)
  var v={e:m2hm(s.end),t:m2hm(pl.to),g:durTxt(gap)};
  if(d.gap==="ask") return '<div class="tgap" data-html2canvas-ignore><b>'+esc(T5(GX.w))+'</b><div class="tgr"><input type="time" id="tgT'+di+'" value="'+m2hm(pl.to)+'"><button type="button" class="trbtn" data-gap="go" data-d="'+di+'">'+esc(T5(GX.go))+'</button></div></div>';
  return '<div class="tgap" data-html2canvas-ignore><b>'+esc(gTxt(GX.q,v))+'</b><div class="tgr"><button type="button" class="trbtn" data-gap="y" data-d="'+di+'">'+esc(T5(GX.y))+'</button><button type="button" class="trbtn" data-gap="n" data-d="'+di+'">'+esc(T5(GX.n))+'</button></div></div>'; }
// 그 시각까지 추가 장소 — 마지막(밤·공연 아닌) 장소 근처 지도 명소를 가까운 순으로, 숙소 도착이 원하는 시각을 넘지 않을 때까지
function gapFill(pl,di,until){ var d=pl.days[di], X=dayX(pl,di,REPH), H=X.H, dt=X.dt, used={}, F=X.from;
  pl.days.forEach(function(x){ x.stops.forEach(function(k){ used[k]=1; }); });
  var cur=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), last=cur.filter(function(x){ return !isNight(x); }).pop()||cur[cur.length-1]||hE(H)||hS(H); if(!last) return 0;
  var cand=[]; for(var k in (window.PLACES||{})){ if(used[k]||k.charAt(0)==="_") continue; var q=PLACES[k]; if(!q||!isFinite(+q.lat)||!isFinite(+q.lng)) continue;
    var it={k:k,ko:q.ko,en:q.en,lat:+q.lat,lng:+q.lng,d:q.d,den:q.den}, c=catOf(it); if(c==="hotel"||c==="trans"||PERFK[k]) continue; var dk=km(last,it); if(dk>6) continue; it.stay=stayOf(it); cand.push([dk,it]); }
  cand.sort(function(a,b){ return a[0]-b[0]; }); var n=0;
  for(var i=0;i<cand.length&&n<4;i++){ var it=cand[i][1], night=cur.filter(isNight), day=cur.filter(function(x){ return !isNight(x); }), trial=day.concat([it],night), sv=sched(H,trial,dt,F,moX(di,X));   // 식사 칸까지 넣고 잰다
    if(sv.end<=until&&sv.viol===0){ pl.pool[it.k]=it; cur=trial; n++; } }
  d.stops=cur.map(function(x){ return x.k; }); d.end=sched(H,cur,dt,F,moX(di,X)).end; return n; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-gap]"); if(!a) return; e.preventDefault(); var pl=TR.plan; if(!pl) return; var di=+a.dataset.d, d=pl.days[di]; if(!d) return;
  var g=a.dataset.gap;
  if(g==="y") d.gap="early"; else if(g==="n") d.gap="ask"; else if(g==="re") delete d.gap;
  else if(g==="go"){ var v=(document.getElementById("tgT"+di)||{}).value||"", un=hm2m(v)||pl.to, got=gapFill(pl,di,un); d.gap={until:un,none:got?0:1}; try{ ntap("_trip","gap_fill"); }catch(z){} }
  save(); repPaint(); });
function repPaint(){ var box=document.querySelector("#trRep .trin"), pl=TR.plan; if(!box||!pl) return; var H=REPH, ai=pl.ai||{}, tips=ai.tips||{};
  var mp=(window.ME&&ME.pos)||GEO; REPME=mp?{k:"__me",ko:"현재 위치",en:"Current location",lat:+mp[0],lng:+mp[1],me:1}:null;
  if(!mp&&!GEOST&&typeof myPos==="function"){ GEOST="ask"; myPos().then(function(q){ GEOST=q?"ok":"fail"; GEO=q||null; if(q&&document.getElementById("trRep")) repPaint(); else { [].forEach.call(document.querySelectorAll("#trRep .tnost"),function(e){ e.hidden=false; }); } }); }   // 폰 안에서만 한 번 묻는다
  var hn=pl.hotel?(pl.hotel.type==="here"?T("현재 위치","Current location"):nm(pl.hotel)):"";
  var h='<div class="trtop" data-html2canvas-ignore><b>'+MPICO("mi_cart",T("🛒 내 여행 일정","🛒 My trip plan"),MIS)+'</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trRep\')">✕</button></div>'
    +'<div class="trbar" data-html2canvas-ignore><button type="button" class="trbtn" id="trNext">'+T("➡ 다음 갈 곳","➡ Next stop")+'</button><button type="button" class="trbtn" id="trPdf">'+MPICO("mi_device",T5(SAVE6),MIS)+'</button><button type="button" class="trbtn" id="trMail">'+MPICO("mi_doc",T5(MAIL6),MIS)+'</button><button type="button" class="trbtn" id="trShare">'+T("🔗 공유","🔗 Share")+'</button><button type="button" class="trbtn" id="trEdit">'+T("✏ 고치기","✏ Edit")+'</button><button type="button" class="trbtn ib" id="trInfo" aria-label="info">ⓘ</button></div>'
    +'<div id="trNextBox" data-html2canvas-ignore></div>'
    +'<div class="d" id="trAiS" data-html2canvas-ignore'+(pl.ai?" hidden":"")+'>'+T("설명을 쓰는 중… (없어도 일정은 그대로 쓸 수 있어요)","Writing notes… (the plan works without them)")+'</div>'
    +(pl.skip&&pl.skip.length?'<div class="d">'+T("일정에서 뺀 곳(숙소·교통시설): ","Skipped (lodging/transport): ")+esc(pl.skip.map(function(k){ var it=TR.items.filter(function(x){ return x.k===k; })[0]; return it?nm(it):k; }).join(", "))+'</div>':"");
  // 날마다 시간표 먼저 — ⚠(하루 끝 넘김)가 하나라도 있으면 늘리기, 없으면 줄이기 판단 (11-06) · 오늘 실제 기록이 있거나 손님이 이미 정한 날(일찍 감·추가 일정)·「이대로 둘게요」면 줄이기는 안 묻는다
  var DS=pl.days.map(function(d,di){ var X=dayX(pl,di,H), dt=X.dt, arr=X.arr, mo=moX(di,X), lv=liveLv(pl,di,X.H,arr,dt,mo,X.from), s=sched(X.H,arr,dt,X.from,mo,lv);   // 전국 일정은 그날 틀(출발점·시작 시각·도착점) — 옛 일정은 X 가 예전 값 그대로 (11-06)
    return {X:X,dt:dt,arr:arr,lv:lv,s:s,lim:dayLim(pl,d,X.H,arr,dt,X),post:pl.mc?natPost(pl,di,X,s):null}; });
  var over=DS.some(function(q){ return (q.arr.length&&q.s.end>q.lim)||(q.post&&q.post.miss); }), shr=0;
  if(!over&&!pl.noShr&&!pl.days.some(function(d){ return d.gap; })&&!DS.some(function(q){ return q.lv; })){ try{ shr=shrinkDays(H,pl); }catch(e){ shr=0; } }
  pl.days.forEach(function(d,di){ var Q=DS[di], X=Q.X, dt=Q.dt, arr=Q.arr, lv=Q.lv, s=Q.s, a=(ai.days&&!d.aiX)?ai.days[di]:null, hk=d.date===kstToday(0)?liveHereK(pl,di,arr,s,lv):null;   // 오늘 = 실제 도착·출발로 다시 계산한 시각 (11-06) · d.aiX = 「새로 짜기」로 순서가 바뀐 날(그날 설명만 감춘다 — AI 다시 안 부름)
    var cty=pl.mc&&pl.cities&&pl.cities[d.c]?cnm(pl.cities[d.c]):"", pre=pl.mc&&X.pre&&X.pre.length?X.pre:null;
    h+='<div class="tday" data-d="'+di+'"><div class="tdh"><span>'+T((di+1)+"일차",'Day '+(di+1))+'</span> · '+esc(dateTxt(dt))+(cty?'<b class="tcty">'+esc(cty)+'</b>':'')+'<small>'+T("투어맵","Tour Map")+'</small></div>';
    if(!arr.length&&!pre&&!(Q.post&&Q.post.tr)){ h+='<div class="d" style="padding:6px 0">'+T("자유 일정","Free day")+'</div>'+(Q.post&&Q.post.rows.length?'<div class="trows">'+natPostHtml(pl,di,X,Q.post,null)+'</div>':'')+'</div>'; return; }
    if(aiTx(a)) h+='<div class="tai">'+esc(aiTx(a))+'</div>';
    if(lv) h+='<div class="tlvn" data-html2canvas-ignore>'+esc(T5(LV6.pred))+'</div>';
    h+=(arr.length?'<div class="tmap" id="tmap'+di+'"></div>':'')+'<div class="trows">';
    var n=0, prevK=null, f0=s.rows[0], g0=f0&&(f0.x||f0.r||f0.next);   // 첫 칸이 식사(첫 장소 앞 — 밤 장소만 있는 날 저녁 등)면 그 식당·그 장소로
    var Sx=hS(X.H), today=d.date===kstToday(0);   // 출발점 (11-06 「가」) — 오늘이고 위치가 있으면 「지금 내 위치 출발」, 아니면 전날 밤 숙소 출발
    if(pre){ h+=natPreHtml(pl,di,X); var S0=hS(X.H); prevK=S0?S0.k:null; }   // 전국 일정 — 공항 도착·아침 도시 이동이 있는 날은 그 줄부터(지금 내 위치 줄 대신)
    else if(!X.me&&Sx&&f0&&!OLD()){ var l1=f0.leg; h+=rowH(Math.max(0,f0.t-(l1?l1.min:0)),"mi_stay",esc(gTxt(NX6.st0,{h:ptNm(Sx)}))); prevK=Sx.k; pre=[1];
      if(today&&!REPME) h+='<div class="d tnost" data-html2canvas-ignore'+(GEOST==="fail"?"":" hidden")+'>'+T5({ko:"위치를 켜면 1번째 장소까지 가는 길이 보입니다",en:"Turn on location to see the way to your first stop",ja:"位置情報をオンにすると1番目の場所までの行き方が表示されます",zhs:"开启定位后，会显示前往第1个地点的路线",zht:"開啟定位後，會顯示前往第1個地點的路線",es:"Activa la ubicación para ver cómo llegar a tu primera parada"})+'</div>'; }
    else if(g0&&(X.me||OLD()||(today&&!REPME))){   // 1번째 장소까지 — 늘 「지금 내 위치」에서(숙소는 날짜 나누기·순서·귀가에만). 모양은 장소 사이 구간과 같게, 실제 경로(ODsay)는 누를 때만, PDF 엔 안 찍음 (10-20)
      if(REPME){ var lg0=leg(REPME,g0), b0=f0.x?f0.x.k:f0.r?"rs:"+di+":"+f0.meal:g0.k;
        h+='<div class="trw h" data-html2canvas-ignore><span class="tt">'+m2hm(Math.max(0,f0.t-lg0.min))+'</span><span class="tp">'+MPIMG("mi_pin",MIS)+T5({ko:"지금 내 위치 출발",en:"Start from where I am now",ja:"今いる場所から出発",zhs:"从我现在的位置出发",zht:"從我現在的位置出發",es:"Salir desde donde estoy ahora"})+'</span></div>'
          +'<div class="tlg" data-html2canvas-ignore data-a="__me" data-b="'+esc(b0)+'" data-d="'+di+'">'+legTxt(lg0)+legGo(lg0)+'<div class="tods"></div></div>'; prevK="__me"; }
      else h+='<div class="d tnost" data-html2canvas-ignore'+(GEOST==="fail"?"":" hidden")+'>'+T5({ko:"위치를 켜면 1번째 장소까지 가는 길이 보입니다",en:"Turn on location to see the way to your first stop",ja:"位置情報をオンにすると1番目の場所までの行き方が表示されます",zhs:"开启定位后，会显示前往第1个地点的路线",zht:"開啟定位後，會顯示前往第1個地點的路線",es:"Activa la ubicación para ver cómo llegar a tu primera parada"})+'</div>'; }
    s.rows.forEach(function(r,ri){ var lgOk=ri>0||!!pre; if(r.meal){ var mk=di+":"+r.meal, ml=r.meal==="lunch"?T("점심 (1시간)","Lunch (1 h)"):T("저녁 (1시간)","Dinner (1 h)");
        if(r.r){ if(r.leg&&lgOk&&prevK) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="rs:'+mk+'" data-d="'+di+'">'+legTxt(r.leg)+'<div class="tods"></div></div>';
          h+='<div class="trw l"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+ml+'<span class="teat on">'+eatLine(r.r)+'<span class="teact">'+eatLinks(r.r)+' <button type="button" class="tebtn" data-x="'+mk+'">'+T("바꾸기","Change")+'</button></span></span></span></div>'; prevK="rs:"+mk; }
        else { if(r.to&&r.leg&&prevK&&lgOk) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.to)+'" data-d="'+di+'">'+legTxt(r.leg)+legGo(r.leg)+'<div class="tods"></div></div>';   // 다음 장소 근처로 먼저 가서 먹는 칸 — 이동이 식사 앞
          h+='<div class="trw l"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+ml+'<span class="teat" id="te_'+mk.replace(":","_")+'" data-k="'+mk+'">'+eatList(mk,r.anchor)+'</span></span></div>'; }
        return; }
      if(r.leg&&prevK&&lgOk) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.x.k)+'" data-d="'+di+'">'+legTxt(r.leg)+legGo(r.leg)+'<div class="tods"></div></div>';
      n++; var tip=tips[r.x.k], memo=r.note.map(function(q){ return Array.isArray(q)?T(q[0],q[1]):gTxt(q.o,q.v||{}); }), lr=lv&&lv.rec[r.x.k];
      if(r.act===2&&lr) memo.unshift(lr.a!=null?gTxt(LV6.done,{a:m2hm(lr.a),d:m2hm(lr.d!=null?lr.d:r.t+r.st)}):gTxt(LV6.left,{d:m2hm(lr.d)}));
      else if(r.act===1&&lr) memo.unshift(gTxt(LV6.here,{a:m2hm(lr.a)}));
      if(!r.act&&Array.isArray(r.x.oh)&&r.x.oh.length){ var co=closeOf(r.x,dt,r.t); if(co.c!=null&&co.o!=null&&co.c-co.o<1440) memo.push(gTxt(LV6.hrs,{o:m2hm(co.o),c:m2hm(co.c)})); }
      if(needCheck(r.x)) memo.push(T("운영 시간·휴무일 확인 필요","Check opening hours/closures"));
      if(isNight(r.x)) memo.push(T("밤 추천","Best at night"));
      h+='<div class="trw tpk" data-k="'+esc(r.x.k)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp"><b class="tno">'+n+'</b> <b>'+esc(nm(r.x))+'</b> <i>'+durTxt(r.st||r.x.stay)+(r.ext?' · '+T(m2hm(r.t+(r.st||r.x.stay))+"까지","until "+m2hm(r.t+(r.st||r.x.stay))):'')+'</i>'
        +(memo.length?'<span class="tmemo">'+esc(memo.join(" · "))+'</span>':"")+(aiTx(tip)?'<span class="ttip">'+MPIMG("mi_tip",MIS)+esc(aiTx(tip))+'</span>':"")
        +(hk===r.x.k?'<span class="tlvw" data-html2canvas-ignore><button type="button" class="tlvb" data-lvleave="'+esc(r.x.k)+'">'+esc(T5(LV6.leave))+'</button></span>':'')+'</span></div>';
      prevK=r.x.k; });
    if(Q.post) h+=natPostHtml(pl,di,X,Q.post,prevK);
    else if(s.back) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="__hotel" data-d="'+di+'">'+legTxt(s.back)+legGo(s.back)+'<div class="tods"></div></div><div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">'+MPICO("mi_stay",T("숙소 도착","Back to lodging"),MIS)+'</span></div>';
    else h+='<div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">'+T("일정 끝","End of day")+'</span></div>';
    if(!Q.post&&pl.days.length>1&&di<pl.days.length-1) h+=nightHtml(pl,di,null);   // 밤마다 숙소 칸 (11-06) — 숙소 하나 일정은 마지막 날 빼고
    if(!(X.pmTr||X.apD)) h+=gapAsk(pl,d,di,s,shr>0);   // 기차·비행기 시각이 정해진 날은 「일찍 끝나요」를 안 묻는다 (11-06)
    var lim=Q.lim;   // 밤 장소가 있는 날은 그 장소 시각까지 (11-06) · 전국 일정은 막차·공항 도착 시각도
    if(s.end>lim&&arr.length) h+='<div class="tmemo" style="margin-top:4px">⚠ '+esc(gTxt(X.apD?NX6.wAp:(X.pmTr&&X.lim!=null&&lim===X.lim)?NX6.wTr:OVR6,{t:m2hm(lim)}))+'</div>';
    h+='</div></div>'; });
  // 그날 ⚠ 경고가 하나라도 있으면 맨 위에 날짜 수 추천 (고른 날짜가 이미 7일이면 더 늘릴 수 없어 안 띄움)
  if(over&&pl.days.length<7){ var sg=sugHtml(pl.days.length,sugDays(H,pl.days.length,pl.at)); h=h.replace('<div class="trbar"',function(m){ return sg+m; }); }
  else if(shr>0){ var sr=shrHtml(shr); h=h.replace('<div class="trbar"',function(m){ return sr+m; }); }   // 더 적은 날짜로 다 들어가면 같은 자리에 줄이기 (11-06)
  h+='<div class="d" style="margin:10px 2px">'+(planUsesReal(pl,H)
    ? T5({ko:"이동 시간은 가능한 구간은 실제 대중교통 기준입니다. 일부 구간은 직선거리 어림이에요. 「실제 경로 보기」로 자세한 길을 볼 수 있어요.",
          en:"Travel times use real public transit where available; some legs are straight-line estimates. Tap “See real routes” for details.",
          ja:"移動時間は可能な区間は実際の公共交通機関に基づきます。一部は直線距離の目安です。「実際の経路を見る」で詳しく確認できます。",
          zhs:"交通时间尽可能采用实际公共交通，部分路段为直线距离估算。点按「查看实际路线」查看详情。",
          zht:"交通時間盡可能採用實際大眾運輸，部分路段為直線距離估算。點按「查看實際路線」查看詳情。",
          es:"Los tiempos usan transporte público real cuando es posible; algunos tramos son estimaciones en línea recta. Toca “Ver rutas reales” para más detalles."})
    : T("이동 시간은 직선거리 어림입니다. 「실제 경로 보기」를 누르면 그 구간만 대중교통을 찾아요.","Travel times are straight-line estimates. Tap “See real routes” to look up transit for that leg."))+'</div>';
  box.innerHTML=h; var g=function(id){ return document.getElementById(id); };
  g("trNext").onclick=nextStop; g("trPdf").onclick=pdfGo; g("trMail").onclick=mailOpen; g("trShare").onclick=shareGo; g("trEdit").onclick=function(){ sheetClose("trRep"); openPanel(); };
  g("trInfo").onclick=function(){ tPop(function(){ return '<b>ⓘ</b><div style="margin-top:6px;line-height:1.6">'+T("· PDF는 휴대폰 「다운로드」에 저장돼요 — 안드로이드는 파일 앱에서 PDF를 길게 눌러 「홈 화면에 추가」하면 바로 열 수 있어요.<br>· 궁궐 휴무(월: 창덕궁·창경궁·덕수궁·숭례문 / 화: 경복궁·종묘)는 궁능유적본부 안내 기준 — 휴무일이 공휴일이면 열고 다음 평일에 쉽니다.<br>· 다른 곳의 운영 시간은 현장·공식 안내를 확인하세요.","· The PDF is saved to Downloads — on Android, long-press it in the Files app and choose “Add to Home screen”.<br>· Palace closures (Mon: Changdeokgung, Changgyeonggung, Deoksugung, Sungnyemun / Tue: Gyeongbokgung, Jongmyo) follow the official Royal Palaces notice — if the closing day is a public holiday they open and close the next weekday.<br>· Check other opening hours on site or official pages.")+'</div>'; }); };
  pl.days.forEach(function(d,di){ var el=g("tmap"+di); if(!el) return; var X=DS[di].X, s=sched(X.H,X.arr,X.dt,X.from,moX(di,X));
    dayMap(el,hpOf(X.H),s.rows.filter(function(r){ return r.x||r.r; }).map(function(r){ return r.x?r.x:Object.assign({eat:1},r.r); }),X.me?hS(X.H):null); });
  recsFetch(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep .tlgo"); if(!a) return; e.preventDefault(); legRoute(a.closest(".tlg")); },true);
// 일정에서 장소를 누르면 그곳이 🗣 통역 대상 — 전역 _ntK(통역이 보는 「지금 장소」)를 그 장소로, 명소 목록에 없는 곳(카카오 등)은 _itPick 이름으로 (10-20)
function pickPlace(row){ var pl=TR.plan, k=row&&row.dataset.k, it=k&&pl&&pl.pool[k]; if(!it) return;
  window._itPick={k:k,ko:it.ko||"",en:it.en||it.ko||"",ja:it.ja||"",zhs:it.zhs||"",zht:it.zht||"",es:it.es||""}; window._ntK=k; window._ntEl=null;
  [].forEach.call(document.querySelectorAll("#trRep .trw.tpk.on"),function(e){ e.classList.remove("on"); }); row.classList.add("on");
  try{ if(window.ITP&&document.getElementById("itB")) ITP.refresh(); }catch(x){} }
document.addEventListener("click",function(e){ var r=e.target.closest&&e.target.closest("#trRep .trw.tpk"); if(!r||(e.target.closest&&e.target.closest("a,button"))) return; pickPlace(r); },true);
// 그 구간만 ODsay — 기존 odsBox 를 잠깐 빌린 키로 부른다(하루 한도 아낌, 같은 구간은 sessionStorage 캐시)
function ptK(k){ var pl=TR.plan; if(k==="__hotel") return REPH; if(k==="__me") return REPME; if(/^rs:/.test(k)) return pl.meals&&pl.meals[k.slice(3)]; if(/^__/.test(k)) return natPt(pl,k); return pl.pool[k]; }   // __ht·__st·__tm·__ap·__ct = 전국 일정 숙소·역·터미널·공항·도시 (11-06)
function legRoute(row){ var pl=TR.plan, A=row.dataset.a, B=row.dataset.b, pa=ptK(A), pb=ptK(B); if(!pa||!pb) return;
  var box=row.querySelector(".tods"), old=document.getElementById("ods"), ka="__t_"+(/^__/.test(A)?"h"+(+pa.lat).toFixed(3)+"_"+(+pa.lng).toFixed(3):A), kb="__t_"+(/^__/.test(B)?"h"+(+pb.lat).toFixed(3)+"_"+(+pb.lng).toFixed(3):B);
  if(old) old.id="ods_tmp"; box.id="ods"; PLACES[ka]={ko:pa.ko,en:pa.en,lat:+pa.lat,lng:+pa.lng}; PLACES[kb]={ko:pb.ko,en:pb.en,lat:+pb.lat,lng:+pb.lng};
  try{ odsBox(ka,kb); }catch(x){} delete PLACES[ka]; delete PLACES[kb]; box.id=""; if(old) old.id="ods";
  try{ var nk=/^__/.test(B)?A:B; if(/^[A-Za-z0-9_-]+$/.test(nk)&&!/^__/.test(nk)) ntap(nk,"route"); }catch(x){} }
// 그날 동선 약도 — 그날 장소를 다 덮는 가장 자세한 약도를 잘라 번호+선 (캔버스 → 그림, PDF 에도 그대로)
// 11-06 사장님 「빨간 사각형이 남은 초창기 지도」 → 첫 화면과 같은 지도로
//   · 서울 전체(seoulall)·옛 도심 약도 4개(광화문 seoul·인사동·경복궁·명동)·부산이 걸리는 날 = 첫 화면 「구별 지도」(gu.js) 그림 그대로
//     넓게 보면 바탕 img/maps/seoulall_gu.jpg(부산 busan_gu.jpg) + 구 대표 그림 · 좁게 보면 전역 조각(img/gu/c·c1, 부산 img/gu/bs/c) + 구 화면 그림(실제 자리)
//     (옛 seoulall.jpg·seoul.jpg 는 하위 약도 자리 빨간 네모가 그림 파일에 박혀 있다 — 코드가 그리는 것 아님. 첫 화면은 이미 이 둘을 안 쓴다)
//   · 다른 약도(홍대·이태원·용산·성수·신사·강남역·삼성·올림픽공원·지역 약도·전국)는 첫 화면과 같은 그 약도 그림 그대로
function coverMap(pts){ var best=null, bd=-1, ba=1e9; for(var id in CITY){ var q=CITY[id].bb; if(!q||!CITY[id].img) continue; if(!pts.every(function(p){ return p.lat>=q[0]&&p.lat<=q[2]&&p.lng>=q[1]&&p.lng<=q[3]; })) continue;
    var d=0, x=id; while(CITY[x]&&d<20){ x=CITY[x].parent; d++; } var ar=(q[2]-q[0])*(q[3]-q[1]); if(d>bd||(d===bd&&ar<ba)){ bd=d; ba=ar; best=id; } } return best||"kr"; }
var IMGC={};
function imgLoad(src){ return IMGC[src]||(IMGC[src]=new Promise(function(ok,no){ var im=new Image(); im.onload=function(){ ok(im); }; im.onerror=no; im.src=src; })); }
function imgOnce(src){ return new Promise(function(ok){ var im=new Image(); im.onload=function(){ ok(im); }; im.onerror=function(){ ok(null); }; im.src=src; }); }   // 조각 그림 — 붙인 뒤 버린다(폰 메모리)
var GUF={seoulall:"seoulall",seoul:"seoulall",insadong:"seoulall",gyeongbok:"seoulall",myeongdong:"seoulall",busan:"busan"}, GUD={}, MAPC={}, MAPQ=Promise.resolve();
function guV(){ var s=document.querySelector('script[src*="gu.js"]'); return ((s&&s.getAttribute("src")||"").match(/[?&]v=([0-9a-f]+)/)||[])[1]||""; }
function guData(f){ if(window.GU&&GU.all&&GU.all[f]) return Promise.resolve(GU.all[f]); if(GUD[f]) return GUD[f];
  var reg=(window.GU&&GU.reg)||{seoulall:"data/gu_seoul.json",busan:"data/gu_busan.json"}; if(!reg[f]) return Promise.resolve(null);
  return GUD[f]=fetch(reg[f]+"?v="+guV()).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }   // gu.js 와 같은 주소 — 받아 둔 게 있으면 그대로
// 4:3 상자에 넉넉히 — all=[[x,y]](그림 비율 as:1 의 x·y 비율), mw=가장 작은 폭(as 단위), mh=가장 작은 높이 쪽 폭
function cropOf(all,as,mw,mh){ var x0=1, y0=1, x1=0, y1=0; all.forEach(function(f){ x0=Math.min(x0,f[0]); x1=Math.max(x1,f[0]); y0=Math.min(y0,f[1]); y1=Math.max(y1,f[1]); });
  var X0=x0*as, X1=x1*as, cx=(X0+X1)/2, cy=(y0+y1)/2, wv=Math.max((X1-X0)*1.35,mw,(y1-y0)*1.35*4/3,mh), hv=wv*3/4;
  if(wv>as){ wv=as; hv=wv*3/4; } if(hv>1){ hv=1; wv=Math.min(as,hv*4/3); }
  return {L0:Math.max(0,Math.min(as-wv,cx-wv/2)),T0:Math.max(0,Math.min(1-hv,cy-hv/2)),wv:wv,hv:hv}; }
// 선·숙소 H·식당 🍴·번호 — seq=장소 화면 자리, hp=숙소
function mapMarks(g,W,arr,seq,hp,sp){ var R=Math.max(13,W*0.022), line=(sp?[sp]:hp?[hp]:[]).concat(seq,hp?[hp]:[]);   // sp = 오늘 출발점 「나」(11-06) — 선은 나에서 시작해 숙소(H)로
  g.lineJoin="round"; g.lineCap="round"; g.strokeStyle="rgba(255,255,255,.9)"; g.lineWidth=R*0.75; g.beginPath(); line.forEach(function(p,i){ if(i) g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]); }); g.stroke();
  g.strokeStyle="#e8590c"; g.lineWidth=R*0.35; g.setLineDash([R*0.9,R*0.6]); g.stroke(); g.setLineDash([]);
  if(hp){ g.fillStyle="#1f4fa3"; g.strokeStyle="#fff"; g.lineWidth=3; g.beginPath(); g.rect(hp[0]-R,hp[1]-R,2*R,2*R); g.fill(); g.stroke(); g.fillStyle="#fff"; g.font="900 "+Math.round(R*1.1)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("H",hp[0],hp[1]+1); }
  // 식당(🍴)을 먼저, 번호를 위에 — 식당이 장소 바로 옆이면 비스듬히 비켜 그린다
  var stp=seq.filter(function(p,i){ return !arr[i].eat; });
  seq.forEach(function(p,i){ if(!arr[i].eat) return; var q=[p[0],p[1]]; if(stp.some(function(s){ return Math.hypot(s[0]-q[0],s[1]-q[1])<R*1.8; })){ q[0]+=R*1.35; q[1]-=R*1.35; }
    g.fillStyle="#2f9e44"; g.strokeStyle="#fff"; g.lineWidth=R*0.22; g.beginPath(); g.arc(q[0],q[1],R*0.8,0,7); g.fill(); g.stroke(); g.fillStyle="#fff"; g.font="900 "+Math.round(R*0.9)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("🍴",q[0],q[1]+1); });
  if(sp){ g.fillStyle="#1c7ed6"; g.strokeStyle="#fff"; g.lineWidth=R*0.3; g.beginPath(); g.arc(sp[0],sp[1],R*0.95,0,7); g.fill(); g.stroke(); g.fillStyle="#fff"; g.font="900 "+Math.round(R*(LANG==="ko"||/^(ja|zhs|zht)$/.test(LANG)?1:0.72))+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(T5({ko:"나",en:"Me",ja:"私",zhs:"我",zht:"我",es:"Yo"}),sp[0],sp[1]+1); }   // 오늘 출발점 「나」 (11-06)
  var no=0; seq.forEach(function(p,i){ if(arr[i].eat) return; g.fillStyle="#fff"; g.strokeStyle="#0ea5e9"; g.lineWidth=R*0.28; g.beginPath(); g.arc(p[0],p[1],R,0,7); g.fill(); g.stroke();   // 번호 동그라미 = 지도 깃발과 같은 하늘색 (사장님 11-06) · 경로 점선은 주황 그대로
    g.fillStyle="#0284c7"; g.font="900 "+Math.round(R*1.15)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(++no),p[0],p[1]+1); }); }
function mapPut(el,key,cv){ var url=""; try{ url=cv.toDataURL("image/jpeg",0.85); }catch(e){} if(url){ var ks=Object.keys(MAPC); if(ks.length>24) delete MAPC[ks[0]]; MAPC[key]=url; el.innerHTML='<img alt="" src="'+url+'">'; } else { el.innerHTML=""; el.appendChild(cv); } }
function dayMap(el,H,arr,SP){ var pts=arr.slice(); if(H) pts.push(H); if(SP) pts.push(SP); var id=coverMap(pts), gf=GUF[id];
  var key=id+"|"+pts.map(function(p){ return (p.eat?"e":"")+(p.k||"")+"@"+(+p.lat).toFixed(5)+","+(+p.lng).toFixed(5); }).join(";")+"|"+(H?1:0);   // 다시 그릴 때(언어·식당 추천 등)는 그려 둔 그림 그대로
  if(MAPC[key]){ el.innerHTML='<img alt="" src="'+MAPC[key]+'">'; return; }
  if(gf&&CITY[gf]&&CITY[gf].geo){ MAPQ=MAPQ.then(function(){ return guData(gf).then(function(G){ if(!el.isConnected) return; if(G&&G.ch&&G.img) return guMap(el,key,gf,G,H,arr,SP); oldMap(el,key,id,H,arr,SP); }); }).catch(function(){}); return; }   // 한 장씩 차례로(조각 그림 메모리)
  oldMap(el,key,id,H,arr,SP); }
// 첫 화면 「구별 지도」와 같은 그림으로 — 서울·부산 전역 좌표(seoulall·busan 약도 비율)
function guMap(el,key,f,G,H,arr,SP){ var ch=G.ch, G2=ch.G2, C=ch.C, icK={};
  (G.gus||[]).forEach(function(o){ for(var k in (o.ic||{})) icK[k]=o.ic[k]; });
  var fr=function(p){ var b=p.k&&icK[p.k]; return b?[(b[0]+b[2])/2,(b[1]+b[3])/2]:meGeoFrac(f,+p.lat,+p.lng); };   // 그림이 있는 명소는 그 그림 자리(첫 화면 누르는 자리)
  var F=arr.map(fr), FH=H?fr(H):null, FS=SP?meGeoFrac(f,+SP.lat,+SP.lng):null; if(F.some(function(q){ return !q; })){ el.innerHTML=""; return; }
  var cr=cropOf(F.concat(FH?[FH]:[],FS?[FS]:[]),1,0.035,0), px=cr.wv*G2, lv=px<=2700?0:px<=10800?1:2, W=900, Hh=Math.round(W*cr.hv/cr.wv);
  var X=function(fx){ return (fx-cr.L0)/cr.wv*W; }, Y=function(fy){ return (fy-cr.T0)/cr.hv*Hh; }, inC=function(b){ return b[2]>cr.L0&&b[0]<cr.L0+cr.wv&&b[3]>cr.T0&&b[1]<cr.T0+cr.hv; };
  var tiles=[], ics=[];
  if(lv<2){ var sz=lv?C*4:C, set={}, dir=(ch.dir||"img/gu/c")+(lv?"1":""); ((lv?ch.l1:ch.l0)||[]).forEach(function(q){ set[q[0]+"_"+q[1]]=1; });
    for(var x=Math.floor(cr.L0*G2/sz);x<=Math.floor((cr.L0+cr.wv)*G2/sz);x++) for(var y=Math.floor(cr.T0*G2/sz);y<=Math.floor((cr.T0+cr.hv)*G2/sz);y++) if(set[x+"_"+y]) tiles.push({u:dir+"/"+x+"_"+y+".jpg?v="+ch.v,b:[x*sz/G2,y*sz/G2,(x+1)*sz/G2,(y+1)*sz/G2]});
    (G.gus||[]).forEach(function(o){ var ho=o.ho||[]; for(var k in (o.ic||{})){ var q=G.P[k]; if(!q||ho.indexOf(k)>=0||/^__kara_/.test((G.act&&G.act[k])||"")) continue; ics.push({u:q.i,b:o.ic[k],fill:1}); } }); }   // 구 화면 그림(실제 자리·채움) · 노래방은 숨김(gu.js 와 같게)
  else { (G.gus||[]).forEach(function(o){ if(o.rep&&G.P[o.rep]) ics.push({u:G.P[o.rep].i,b:G.P[o.rep].b}); }); (G.out||[]).forEach(function(k){ if(G.P[k]) ics.push({u:G.P[k].i,b:G.P[k].b}); }); }   // 묶음 화면 — 구 대표 그림·서울 밖 그림
  ics=ics.filter(function(q){ return inC(q.b); });
  return imgLoad(G.img).catch(function(){ return null; }).then(function(base){ var cv=document.createElement("canvas"); cv.width=W; cv.height=Hh; var g=cv.getContext("2d"); g.fillStyle="#f3efe4"; g.fillRect(0,0,W,Hh);
    if(base) g.drawImage(base,cr.L0*base.naturalWidth,cr.T0*base.naturalHeight,cr.wv*base.naturalWidth,cr.hv*base.naturalHeight,0,0,W,Hh);   // 조각이 없는 곳(서울 밖)도 바탕으로
    return Promise.all(tiles.map(function(q){ return imgOnce(q.u).then(function(im){ if(im) g.drawImage(im,X(q.b[0]),Y(q.b[1]),X(q.b[2])-X(q.b[0])+0.6,Y(q.b[3])-Y(q.b[1])+0.6); }); }))
      .then(function(){ return Promise.all(ics.map(function(q){ return imgLoad(q.u).then(function(im){ return [q,im]; },function(){ return [q,null]; }); })); })
      .then(function(rs){ rs.forEach(function(a){ var q=a[0], im=a[1]; if(!im) return; var x0=X(q.b[0]), y0=Y(q.b[1]), w=X(q.b[2])-x0, h=Y(q.b[3])-y0, dw=w, dh=h;
          if(!q.fill){ var r=im.naturalWidth/im.naturalHeight; if(w/h>r) dw=h*r; else dh=w/r; }   // 묶음 그림은 비율 그대로(contain)
          g.save(); g.translate(x0+w/2,y0+h/2); if(+q.b[4]) g.rotate((+q.b[4])*Math.PI/180); g.drawImage(im,-dw/2,-dh/2,dw,dh); g.restore(); });
        mapMarks(g,W,arr,F.map(function(f){ return [X(f[0]),Y(f[1])]; }),FH?[X(FH[0]),Y(FH[1])]:null,FS?[X(FS[0]),Y(FS[1])]:null); mapPut(el,key,cv); }); }).catch(function(){ el.innerHTML=""; }); }
function oldMap(el,key,id,H,arr,SP){ var c=id==="kr"?{img:ROOT_IMG,aspect:1}:CITY[id], as=c.aspect||1;
  var fr=function(p){ var f=null; if(id!=="kr"&&c.spots&&c.spots[p.k]){ var b=c.spots[p.k]; f=[(b[0]+b[2])/2,(b[1]+b[3])/2]; } return f||meGeoFrac(id==="kr"?NAVI_ROOT:id,p.lat,p.lng); };
  var go=function(){ var F=arr.map(fr), FH=H?fr(H):null, FS=SP?meGeoFrac(id==="kr"?NAVI_ROOT:id,+SP.lat,+SP.lng):null; if(F.some(function(f){ return !f; })) { el.innerHTML=""; return; }
    var cr=cropOf(F.concat(FH?[FH]:[],FS?[FS]:[]),as,0.12*as,0.09), L0=cr.L0, T0=cr.T0, wv=cr.wv, hv=cr.hv;   // 그림 비율(as:1)로 보고, 4:3 상자에 넉넉히
    imgLoad(c.img).then(function(im){ var W=900, Hh=Math.round(W*hv/wv), cv=document.createElement("canvas"); cv.width=W; cv.height=Hh; var g=cv.getContext("2d");
      var sx=im.naturalWidth/as, sy=im.naturalHeight; g.drawImage(im,L0*sx,T0*sy,wv*sx,hv*sy,0,0,W,Hh);
      var P=function(f){ return [(f[0]*as-L0)/wv*W,(f[1]-T0)/hv*Hh]; }; mapMarks(g,W,arr,F.map(P),FH?P(FH):null,FS?P(FS):null); mapPut(el,key,cv); }).catch(function(){ el.innerHTML=""; }); };
  if(id==="kr"||c.spots) go(); else mapLoad(id).then(go,go); }
// 다음 갈 곳 — 오늘이 여행 날이면 지금 시각 다음 장소, 아니면 첫날 첫 장소 → 길찾기·K.Ride (기존 linksTo)
function nextStop(){ var pl=TR.plan, box=document.getElementById("trNextBox"); if(!pl||!box) return; var today=kstToday(0), now=new Date(Date.now()+9*3600e3), nm0=now.getUTCHours()*60+now.getUTCMinutes(), pick=null;
  pl.days.forEach(function(d,di){ if(pick||d.date!==today) return; var X=dayX(pl,di,REPH), arr=X.arr, dt=X.dt, lv=liveLv(pl,di,X.H,arr,dt,moX(di,X),X.from), s=sched(X.H,arr,dt,X.from,X.mc?{to:X.to}:undefined,lv);   // 오늘 실제 기록이 있으면 그 시각으로 (11-06)
    s.rows.forEach(function(r){ if(!pick&&!r.lunch&&r.act!==2&&r.t+(r.st||r.x.stay)>nm0) pick=r.x; }); });
  if(!pick){ for(var i=0;i<pl.days.length&&!pick;i++){ var d=pl.days[i]; if(d.date>=today&&d.stops.length) pick=pl.pool[d.stops[0]]; } }
  if(!pick) for(i=0;i<pl.days.length&&!pick;i++) if(pl.days[i].stops.length) pick=pl.pool[pl.days[i].stops[0]];
  if(!pick) return; box.innerHTML='<div class="item"><div class="t">➡ '+esc(nm(pick))+'</div><div class="d">'+esc(L()?(pick.addr_en||pick.addr||""):(pick.addr||""))+'</div>'+linksTo(pick.ko,pick.lat,pick.lng,null,pick.addr)+'</div>'; }

// ── 식당 추천 (사장님 2026-10-16) — 점심·저녁 칸마다 3곳: ① 제휴(광고) ② 이름난 식당(data/eats.json) ③ 카카오 근처 음식점(종류 섞기)
//   기준 = 바로 앞 장소(관광지) 좌표, 700m 안. 허브 /neat 는 칸마다 한 번(같은 좌표 하루 캐시). 손님 위치는 안 보낸다
//   외국인이 힘들어할 음식은 기본 제외 — 아래 HARD_FOOD 표 한 곳. 「도전 음식도 괜찮아요」를 켰을 때만 허용 (eats.json·제휴에도 같은 표)
var HARD_FOOD=["순대","순댓국","순대국","홍어","삼합","번데기","산낙지","보신탕","개고기","영양탕","선지","내장탕","곱창","막창","대창","닭발","추어탕","청국장","개불","멍게","육회","생간","천엽","육사시미"];
var FOODS=[["any","아무거나","Anything"],["korean","한식 위주","Mostly Korean"],["veg","채식","Vegetarian"],["halal","할랄","Halal"],["nospicy","매운 것 못 먹음","No spicy food"],["noseafood","해산물 못 먹음","No seafood"]];
var RX={meat:/육류|고기|갈비|삼겹|불고기|족발|보쌈|치킨|닭|돈까스|돈가스|스테이크|햄버거|버거|국밥|곰탕|설렁탕|해장국|감자탕|샤브|양꼬치|순대|곱창|정육|육회/,
  spicy:/떡볶이|마라|훠궈|짬뽕|불닭|닭갈비|매운|낙지|쭈꾸미|주꾸미|김치찌개|부대찌개|감자탕|아구찜|해물찜|닭볶음|육개장/,
  sea:/해물|해산물|생선|횟집|초밥|스시|조개|대게|게장|꽃게|굴|장어|아구|아귀|낙지|쭈꾸미|주꾸미|오징어|복어|매운탕|물회|전복|문어|참치|일식집|> 회/,
  vegOk:/채식|비건|vegan|vegetarian|사찰음식|샐러드/i, halalOk:/할랄|halal|이슬람|터키|튀르키예|케밥|인도음식|인도요리|파키스탄|아랍|중동/i,
  skip:/술집|간식|카페|호프|주점|포장마차|이자카야|와인|칵테일/};
function hardHit(s){ s=String(s||""); for(var i=0;i<HARD_FOOD.length;i++) if(s.indexOf(HARD_FOOD[i])>=0) return true; return false; }
var EATS=null; function eatsLoad(){ if(EATS) return Promise.resolve(EATS); return jget("eats.json").then(function(j){ EATS=(j&&j.items)||[]; return EATS; },function(){ EATS=[]; return EATS; }); }
function mealsOf(di){ var pl=TR.plan, m=(pl&&pl.meals)||{}; return {to:pl?pl.to:1200,lunch:m[di+":lunch"]||null,dinner:m[di+":dinner"]||null}; }
function kindOf(cat){ var a=String(cat||"").split(">").map(function(x){ return x.trim(); }); return a[1]||a[0]||""; }
var KCODE={"한식":"korean","중식":"chinese","일식":"japanese","양식":"western","분식":"snack","아시아음식":"asian","패스트푸드":"fast","뷔페":"buffet"};
// 후보 하나 → 통과면 {note}, 아니면 null. ①② 는 태그로, ③ 은 카카오 종류·이름 글자로(정확하지 않으면 「확인 필요」)
function eatOk(c,o){ var tx=(c.ko||"")+" "+(c.cat||"")+" "+(c.kind||"")+" "+(c.menu||""), tg=c.tags||[], f=o.food||"any", note="", tagged=c.src!=="near";
  if(!o.adv&&(hardHit(tx)||tg.indexOf("hard")>=0)) return null;
  if(c.src==="near"&&RX.skip.test(c.cat||"")) return null;
  if(f==="korean"){ if(!/한식|korean/i.test(tx)&&!/^food\.korean/.test(c.catc||"")) return null; }
  else if(f==="veg"){ if(tagged){ if(tg.indexOf("veg")<0) return null; } else if(RX.vegOk.test(tx)) note=""; else if(RX.meat.test(tx)||RX.sea.test(tx)) return null; else note=T("채식 메뉴 확인 필요","Check vegetarian options"); }
  else if(f==="halal"){ if(tagged){ if(tg.indexOf("halal")<0) return null; } else if(RX.halalOk.test(tx)) note=T("할랄 인증 확인 필요","Check halal certification"); else return null; }
  else if(f==="nospicy"){ if(tagged){ if(tg.indexOf("spicy")>=0) return null; } else if(RX.spicy.test(tx)) return null; else if(/한식/.test(tx)) note=T("맵기 확인 필요","Ask about spiciness"); }
  else if(f==="noseafood"){ if(tagged){ if(tg.indexOf("seafood")>=0) return null; } else if(RX.sea.test(tx)) return null; else if(/일식/.test(tx)) note=T("해산물 확인 필요","Check for seafood"); }
  return {note:note}; }
function eatPick(mk){ var pl=TR.plan, rc=pl&&pl.recs&&pl.recs[mk]; if(!rc) return null; var o=TR.opt, out=[], seen={};
  if(/:dinner$/.test(mk)) (EATC[mk.replace("dinner","lunch")]||eatPick(mk.replace("dinner","lunch"))||[]).forEach(function(c){ seen[(c.ko||"")+"|"+Math.round(c.lat*1e4)]=1; });   // 같은 날 점심에 보인 곳은 저녁에 다시 안 보인다
  var add=function(c){ var key=(c.ko||"")+"|"+Math.round(c.lat*1e4); if(seen[key]) return false; var ok=eatOk(c,o); if(!ok) return false; seen[key]=1; c.note=ok.note; out.push(c); return true; };
  (rc.p||[]).forEach(function(x){ if(out.length<3) add({src:"ad",id:x.id,ko:x.ko,en:x.en||x.ko,lat:+x.lat,lng:+x.lng,tel:x.tel||"",addr:x.addr||"",catc:x.cat,kind:"",tags:x.tags||[],dko:x.dko,den:x.den,dist:x.dist}); });
  var ne=0, ez=(EATS||[]).map(function(x){ return {x:x,d:Math.round(km({lat:rc.a[0],lng:rc.a[1]},{lat:+x.lat,lng:+x.lng})*1000)}; }).filter(function(q){ return q.d<=700&&q.x.kind!=="디저트"; }).sort(function(a,b){ return a.d-b.d; });
  ez.forEach(function(q){ if(out.length>=3||ne>=2) return; var x=q.x, d=q.d; ne++;   // 이름난 식당은 많아야 2곳 — 근처 검색 한 곳은 남긴다
    add({src:"eat",id:x.id,ko:x.ko,en:x.en||x.ko,ja:x.ja,zhs:x.zhs,zht:x.zht,es:x.es,lat:+x.lat,lng:+x.lng,tel:x.tel||"",addr:x.addr||"",kind:x.kind||"",kind_en:x.kind_en||"",kind_x:x["kind_"+LANG]||"",menu:(x.menu||[]).join(", "),menu_x:(x["menu_"+LANG]||[]).join(", "),tags:x.tags||[],srcs:x.src||[],url:x.url||"",lux:x.lux||0,dist:d})||ne--; });
  var near=(rc.i||[]).map(function(x){ return {src:"near",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,tel:x.tel||"",addr:x.addr||"",addr_en:x.addr_en||"",cat:x.cat||"",cat_en:x.cat_en||"",kind:kindOf(x.cat),dist:x.dist}; });
  var used={}; [true,false].forEach(function(dis){ near.forEach(function(c){ if(out.length>=3||out.indexOf(c)>=0) return; if(dis&&used[c.kind]) return; if(add(c)) used[c.kind]=1; }); });   // 종류가 겹치지 않게 먼저, 모자라면 겹쳐도
  return out; }
function eatName(c){ return L()?(c[LANG]||c.en||c.ko):c.ko; }
var KIND_X={"한식":"Korean food","중식":"Chinese food","일식":"Japanese food","양식":"Western food","분식":"Korean snack food","아시아음식":"Asian food","패스트푸드":"Fast food","뷔페":"Buffet","치킨":"Fried chicken","카페":"Cafe","간식":"Snacks","술집":"Bar"};   // 허브 번역이 빠졌을 때 일·중 화면 종류 (10-18)
function kindX(k){ return (LANG!=="en"&&KIND_X[k])?TE(KIND_X[k]):k; }
function eatLine(c){ var kd=c.src==="near"?(L()?(c.cat_en||kindX(c.kind)):String(c.cat||"").split(">").slice(1).map(function(x){ return x.trim(); }).join("·")):(L()?(c.kind_x||c.kind_en||c.kind):c.kind);
  return (c.src==="ad"?'<b class="tead">'+T("광고","Ad")+'</b> ':'')+'<b>'+esc(eatName(c))+'</b>'+(kd?' <i>'+esc(kd)+'</i>':'')+(c.dist!=null?' <i>· '+(c.dist<1000?c.dist+" m":(c.dist/1000).toFixed(1)+" km")+'</i>':'')
    +(c.src==="eat"&&c.menu&&c.menu!==c.kind&&c.menu!=="음식점"?' <i>· '+esc((L()&&c.menu_x)||c.menu)+'</i>':'')+(c.lux?' <b class="tead" style="background:#7048e8">'+T("고급","Fine dining")+'</b>':'')
    +(c.srcs&&c.srcs.length?'<span class="tesrc">'+MPIMG("mi_doc",MIS)+(c.url&&/^https:\/\//.test(c.url)?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener">':'')+esc(c.srcs.map(function(q){ return LP(q); }).join(" · "))+(c.url?'</a>':'')+'</span>':'')
    +(c.note?'<span class="tmemo">'+esc(c.note)+'</span>':'')+(c.src==="ad"&&LD(c)?'<span class="ttip">'+esc(LD(c))+'</span>':''); }
function eatLinks(c){ var t=String(c.tel||"").replace(/\s/g,""), tl=t?'<a class="tel" href="tel:'+esc(telIntl(t))+'">'+MPIMG("mi_phone",MIS)+esc(L()?telIntl(t).replace("-"," "):t)+'</a>':"";
  return tl+linksTo(c.ko,c.lat,c.lng,c.ko,c.addr); }
var EATC={};
function eatList(mk,anchor){ var pl=TR.plan, rc=pl.recs&&pl.recs[mk];
  if(!rc||(anchor&&rc.ak!==anchor.k)) return '<span class="d">'+T("근처 식당 찾는 중…","Finding places to eat nearby…")+'</span>';
  var cs=eatPick(mk)||[]; EATC[mk]=cs;
  if(!cs.length) return '<span class="d">'+T("조건에 맞는 근처 식당을 못 찾았어요","No matching places nearby")+'</span>';
  return '<span class="tehd">'+MPICO("mi_food",T("🍽 근처 식당 추천","🍽 Places to eat nearby"),MIS)+'</span>'+cs.map(function(c,i){ return '<span class="tec">'+eatLine(c)+' <button type="button" class="tebtn" data-k="'+mk+'" data-i="'+i+'">'+T("넣기","Pick")+'</button></span>'; }).join(""); }
var EATQ={};
function recsFetch(){ var pl=TR.plan; if(!pl) return; pl.recs=pl.recs||{}; var H=REPH;
  eatsLoad().then(function(){ if(TR.plan!==pl) return; pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), s=sched(X.H,X.arr,X.dt,X.from,moX(di,X));
    s.rows.forEach(function(r){ if(!r.meal||r.r) return; var mk=di+":"+r.meal, an=r.anchor||r.next, rc=pl.recs[mk], el=document.getElementById("te_"+mk.replace(":","_")); if(!an) return;
      if(rc&&rc.ak===an.k&&(rc.l===LANG||!L())){ if(el&&!el.querySelector(".tec")) el.innerHTML=eatList(mk,an); return; }   // 영어 화면인데 한글로 받아 둔 것만 다시
      var lg=LANG, qk=mk+"|"+an.k+"|"+lg; if(EATQ[qk]) return; EATQ[qk]=1; var at=pl.at;   // 언어는 부를 때 값으로 적는다 — 받는 사이에 언어를 바꾸면 다른 언어 이름이 그 언어로 저장됐다 (10-18)
      fetch(HUB+"/neat?x="+(+an.lng).toFixed(4)+"&y="+(+an.lat).toFixed(4)+kpL()).then(function(r){ return r.json(); }).then(function(j){ delete EATQ[qk]; if(!TR.plan||TR.plan.at!==at) return;
        TR.plan.recs[mk]={ak:an.k,a:[+an.lat,+an.lng],p:(j&&j.partners)||[],i:(j&&j.ok&&j.items)||[],l:lg}; save(); if(lg!==LANG) return;
        var e2=document.getElementById("te_"+mk.replace(":","_")); if(e2) e2.innerHTML=eatList(mk,an); })
        .catch(function(){ delete EATQ[qk]; var e2=document.getElementById("te_"+mk.replace(":","_")); if(e2) e2.innerHTML='<span class="d">'+T("식당 추천을 못 불러왔어요","Could not load suggestions")+'</span>'; }); }); }); }); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep .tebtn"); if(!b) return; e.preventDefault(); var pl=TR.plan; if(!pl) return; pl.meals=pl.meals||{};
  if(b.dataset.x){ delete pl.meals[b.dataset.x]; save(); repPaint(); return; }
  var mk=b.dataset.k, c=(EATC[mk]||[])[+b.dataset.i]; if(!c) return; pl.meals[mk]=Object.assign({},c,{k:"rs_"+mk.replace(":","_"),stay:60}); save();
  try{ ntap(c.src==="ad"?c.id:c.src==="eat"?("eat_"+c.id):("sp_"+(KCODE[c.kind]||"food")),"trip_eat"); }catch(x){} repPaint(); },true);
// ── PDF (화면을 그림으로 떠서 — 한글 글꼴 문제 없음) · cdnjs 정확한 판 고정 ──
var LIBS={h2c:"https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",pdf:"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"};
function lib(u){ return new Promise(function(ok,no){ if(document.querySelector('script[src="'+u+'"]')&&(window.html2canvas||window.jspdf)){ var t=0, iv=setInterval(function(){ if((u===LIBS.h2c&&window.html2canvas)||(u===LIBS.pdf&&window.jspdf)||++t>100){ clearInterval(iv); ok(); } },50); return; }
  var s=document.createElement("script"); s.src=u; s.crossOrigin="anonymous"; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function shotDays(){ return lib(LIBS.h2c).then(function(){ var ds=[].slice.call(document.querySelectorAll("#trRep .tday")), host=document.createElement("div"); host.className="trshot"; document.body.appendChild(host);
  var bg=getComputedStyle(document.body).backgroundColor||"#fff", out=[];
  return ds.reduce(function(p,d){ return p.then(function(){ var c=d.cloneNode(true); [].forEach.call(c.querySelectorAll(".tods,.tlgo,.tebtn,.teact"),function(e){ e.remove(); }); host.innerHTML=""; host.appendChild(c);
    return html2canvas(c,{scale:2,backgroundColor:bg,useCORS:true,logging:false}).then(function(cv){ out.push(cv); }); }); },Promise.resolve()).then(function(){ host.remove(); return out; },function(e){ host.remove(); throw e; }); }); }
function busy(id,on,txt){ var b=document.getElementById(id); if(!b) return; if(on){ if(!b.disabled) b._h=b.innerHTML; b.textContent=txt; b.disabled=true; } else { if(b._h!=null) b.innerHTML=b._h; b.disabled=false; } }   // 끝나면 아이콘까지 원래대로 (10-25)
// A4 PDF 문서를 만든다 (받기·보내기 공용) — {doc,n,name}
function pdfBuild(){ return Promise.all([shotDays(),lib(LIBS.pdf)]).then(function(r){ var cvs=r[0], J=window.jspdf.jsPDF, doc=new J({orientation:"p",unit:"mm",format:"a4"}), PW=210, PH=297, M=10;
  cvs.forEach(function(cv,i){ if(i) doc.addPage(); var w=PW-2*M, h=cv.height*w/cv.width; if(h>PH-2*M){ h=PH-2*M; w=cv.width*h/cv.height; }
    doc.addImage(cv.toDataURL("image/jpeg",0.9),"JPEG",(PW-w)/2,M,w,h); });
  return {doc:doc,n:cvs.length,name:"my-trip-"+(TR.plan.days[0]&&TR.plan.days[0].date||"plan")+".pdf"}; }); }
// 「폰에 저장」 (사장님 10-25) — 안드로이드·PC = 다운로드 저장 · 아이폰·홈 화면 앱 = 공유 시트(「파일에 저장」) · 공유를 못 쓰면 새 창으로 PDF 열기
var SAVE6={ko:"폰에 저장",en:"Save to phone",ja:"スマホに保存",zhs:"保存到手机",zht:"儲存到手機",es:"Guardar en el móvil"};
var MAIL6={ko:"내 이메일로 받기",en:"Email it to me",ja:"自分のメールで受け取る",zhs:"发送到我的邮箱",zht:"寄到我的信箱",es:"Recibir por email"};
function isIOS(){ var u=navigator.userAgent||""; return /iPad|iPhone|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1); }
function isStandalone(){ try{ return (window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true; }catch(e){ return false; } }
// 안드로이드는 홈 화면 앱이어도 공유 시트를 쓰지 않고 바로 파일 저장 (사장님 실기기 10-25 — 공유 시트가 떠서 저장이 안 됐다). 공유 시트는 아이폰만
var SAVED6={ko:"다운로드 폴더에 저장했어요.",en:"Saved to your Downloads folder.",ja:"ダウンロードフォルダに保存しました。",zhs:"已保存到下载文件夹。",zht:"已儲存到下載資料夾。",es:"Guardado en tu carpeta de Descargas."};
function isAndroid(){ return /Android/i.test(navigator.userAgent||""); }
function saveBlob(blob,name){ var u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=name; a.rel="noopener"; a.style.display="none"; document.body.appendChild(a); a.click(); setTimeout(function(){ try{ a.remove(); URL.revokeObjectURL(u); }catch(e){} },60000); }
function savedNote(){ try{ var n=document.getElementById("trSaved"); if(!n){ n=document.createElement("div"); n.id="trSaved"; n.className="d"; n.setAttribute("data-html2canvas-ignore",""); n.style.cssText="margin:6px 2px;font-weight:700;color:var(--green)"; var bar=document.querySelector("#trRep .trbar"); if(bar&&bar.parentNode) bar.parentNode.insertBefore(n,bar.nextSibling); else return; } n.textContent=T5(SAVED6); clearTimeout(window._trSvT); window._trSvT=setTimeout(function(){ try{ n.remove(); }catch(e){} },6000); }catch(e){} }
function pdfGo(){ busy("trPdf",1,T5({ko:"만드는 중…",en:"Making…",ja:"作成中…",zhs:"正在生成…",zht:"正在產生…",es:"Creando…"}));
  var done=function(mode,n){ window.__trSaveMode=mode; window.__trPdfOk=n; try{ ntap("_trip","trip_pdf_"+mode); }catch(e){} busy("trPdf",0); };
  pdfBuild().then(function(o){ var blob=o.doc.output("blob");
    if(isAndroid()||!isIOS()){   // 안드로이드·PC: 바로 다운로드
      try{ saveBlob(blob,o.name); done("download",o.n); }catch(e){ o.doc.save(o.name); done("download-save",o.n); }
      savedNote(); return; }
    var f=null; try{ f=new File([blob],o.name,{type:"application/pdf"}); }catch(e){}
    var openIt=function(){ var u=URL.createObjectURL(blob), w=window.open(u,"_blank"); if(!w) location.href=u; setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} },60000); done("open",o.n); };
    if(f&&navigator.canShare&&navigator.share&&navigator.canShare({files:[f]})){
      navigator.share({files:[f],title:o.name}).then(function(){ done("share",o.n); },function(e){ if(e&&e.name==="AbortError") done("share-cancel",o.n); else openIt(); });
    } else openIt(); })
    .catch(function(e){ window.__trPdfErr=String(e); busy("trPdf",0); alert(T5({ko:"PDF를 만들지 못했어요. 잠시 뒤 다시 해 주세요.",en:"Could not make the PDF. Please try again.",ja:"PDFを作成できませんでした。しばらくしてからもう一度お試しください。",zhs:"无法生成PDF，请稍后再试。",zht:"無法產生PDF，請稍後再試。",es:"No se pudo crear el PDF. Inténtalo de nuevo."})); }); }
// 「내 이메일로 받기」 (사장님 10-25) — 손님이 넣은 주소로 PDF 첨부 메일 (허브 POST /guide/sendme). 주소는 이 기기·서버 어디에도 저장하지 않는다
var ML6={ t:MAIL6,
  d:{ko:"이메일 주소를 넣으면 일정 PDF를 첨부해 보내 드려요. 주소는 저장하지 않아요.",en:"Enter your email and we will send the trip PDF as an attachment. We don’t keep your address.",ja:"メールアドレスを入力すると日程PDFを添付してお送りします。アドレスは保存しません。",zhs:"输入邮箱地址，我们会把行程PDF作为附件发送给您。我们不会保存您的地址。",zht:"輸入電子郵件地址，我們會把行程PDF作為附件寄給您。我們不會保存您的地址。",es:"Escribe tu email y te enviaremos el PDF del plan como adjunto. No guardamos tu dirección."},
  go:{ko:"보내기",en:"Send",ja:"送信",zhs:"发送",zht:"寄出",es:"Enviar"},
  bad:{ko:"이메일 주소를 확인해 주세요.",en:"Please check the email address.",ja:"メールアドレスをご確認ください。",zhs:"请检查邮箱地址。",zht:"請檢查電子郵件地址。",es:"Revisa la dirección de email."},
  mk:{ko:"PDF 만드는 중…",en:"Making PDF…",ja:"PDF作成中…",zhs:"正在生成PDF…",zht:"正在產生PDF…",es:"Creando el PDF…"},
  sd:{ko:"보내는 중…",en:"Sending…",ja:"送信中…",zhs:"正在发送…",zht:"正在寄送…",es:"Enviando…"},
  ok:{ko:"보냈어요. 메일함을 확인하세요 (스팸함도).",en:"Sent! Check your inbox (and spam folder).",ja:"送信しました。受信トレイ（迷惑メールも）をご確認ください。",zhs:"已发送！请查看收件箱（及垃圾邮件）。",zht:"已寄出！請查看收件匣（及垃圾郵件）。",es:"¡Enviado! Revisa tu bandeja de entrada (y spam)."},
  rate:{ko:"잠시 뒤 다시 해 주세요 (보내기 횟수 제한).",en:"Please try again later (sending limit).",ja:"しばらくしてから再度お試しください（送信回数の制限）。",zhs:"请稍后再试（发送次数限制）。",zht:"請稍後再試（寄送次數限制）。",es:"Inténtalo más tarde (límite de envíos)."},
  fail:{ko:"보내지 못했어요. 잠시 뒤 다시 해 주세요.",en:"Could not send. Please try again.",ja:"送信できませんでした。しばらくしてからもう一度お試しください。",zhs:"发送失败，请稍后再试。",zht:"寄送失敗，請稍後再試。",es:"No se pudo enviar. Inténtalo de nuevo."} };
function mailOpen(){ var b=tPop(function(){ return '<b>'+MPICO("mi_doc",T5(ML6.t),MIS)+'</b><div class="d" style="margin:6px 0 8px;line-height:1.5">'+esc(T5(ML6.d))+'</div>'
    +'<input id="trMlE" type="email" autocomplete="email" inputmode="email" placeholder="email@example.com" style="width:100%;box-sizing:border-box;font-size:16px;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink)">'
    +'<button type="button" class="trbtn big" id="trMlGo" style="margin-top:10px;width:100%">'+esc(T5(ML6.go))+'</button><div class="d" id="trMlM" style="margin-top:8px;min-height:18px"></div>'; });
  var go=b.querySelector("#trMlGo"), M=function(t){ var m=b.querySelector("#trMlM"); if(m) m.textContent=t; };
  go.onclick=function(){ var em=(b.querySelector("#trMlE").value||"").trim();
    if(!/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(em)){ M(T5(ML6.bad)); return; }
    go.disabled=true; M(T5(ML6.mk));
    Promise.all([pdfBuild(),tripUrl().catch(function(){ return ""; })]).then(function(r){ var o=r[0], url=r[1], pdf=""; try{ pdf=o.doc.output("datauristring"); }catch(e){}
      var bi=pdf.indexOf("base64,"); pdf=bi>=0?("data:application/pdf;base64,"+pdf.slice(bi+7)):""; M(T5(ML6.sd));
      return fetch(HUB+"/guide/sendme",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:em,lang:window.LANG||"en",pdfBase64:pdf,tripUrl:url}),cache:"no-store"}).then(function(x){ return x.json(); }); })
    .then(function(j){ window.__trSendMe=j; go.disabled=false; M(j&&j.ok?T5(ML6.ok):(j&&j.err==="rate"?T5(ML6.rate):j&&j.err==="email"?T5(ML6.bad):T5(ML6.fail))); if(j&&j.ok){ try{ ntap("_trip","trip_sendme"); }catch(e){} } })
    .catch(function(e){ window.__trSendMeErr=String(e); go.disabled=false; M(T5(ML6.fail)); }); }; }
// 📄 PDF 보내기 — PDF를 폰 공유 시트(카톡·메일·드라이브…)로 보낸다. 공유 시트를 못 쓰면 「다운로드」에 저장 (사장님 10-24)
function pdfShareGo(){ var m=document.getElementById("trShM"); if(m) m.textContent=T("PDF 만드는 중…","Making PDF…"); busy("trShP",1,T("만드는 중…","Making…"));
  pdfBuild().then(function(o){ var f=null; try{ f=new File([o.doc.output("blob")],o.name,{type:"application/pdf"}); }catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){ if(m) m.textContent=""; navigator.share({files:[f],title:T("내 여행 일정","My trip plan")}).catch(function(){}); }
    else { o.doc.save(o.name); if(m) m.textContent=T("이 기기에서는 공유 시트를 열 수 없어 PDF를 「다운로드」에 저장했어요.","Your device can’t open the share sheet, so the PDF was saved to Downloads."); }
    window.__trPdfShareOk=o.n; try{ ntap("_trip","trip_pdf_share"); }catch(e){} busy("trShP",0); })
    .catch(function(e){ window.__trPdfShareErr=String(e); busy("trShP",0); if(m) m.textContent=T("PDF를 만들지 못했어요. 잠시 뒤 다시 해 주세요.","Could not make the PDF. Please try again."); }); }

// ── 공유 — 일정은 서버에 저장하지 않고 링크 # 뒤에 압축해 담는다 · 그림은 화면을 떠서 ──
function b64u(bytes){ var s=""; for(var i=0;i<bytes.length;i++) s+=String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function ub64(s){ s=s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4) s+="="; var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
function zip(str){ var u=new TextEncoder().encode(str); if(!window.CompressionStream) return Promise.resolve("0"+b64u(u));
  return new Response(new Blob([u]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer().then(function(b){ return "1"+b64u(new Uint8Array(b)); }); }
function unzip(s){ var u=ub64(s.slice(1)); if(s.charAt(0)==="0") return Promise.resolve(new TextDecoder().decode(u));
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text(); }
// 핀 정보 (사장님 11-06 「받은 사람 폰에선 바·재즈바가 오전 10시에」) — 핀 [이름, 영어 이름, 위도, 경도] 뒤에 다섯째 칸을 짧게 붙인다
//   [밤 장소(1)·아님(0)·모름(2), 여는 분, 닫는 분, 요일 묶음(일=1·월=2·…·토=64), (여는 분, 닫는 분, 요일 묶음)…] — 같은 시각인 요일은 한 묶음
//   구글 종류·카카오 분류도 영업시간도 없는 핀은 안 붙인다(받는 쪽도 이름 낱말로 같은 판단) · 옛 앱은 다섯째 칸을 모르고 버린다
function pinInfo(x){ var known=(Array.isArray(x.gt)&&x.gt.length>0)||!!x.cat||x.nb===0||x.nb===1, oh=Array.isArray(x.oh)?x.oh:[], g={}, ord=[];
  oh.forEach(function(q){ if(!Array.isArray(q)||q.length<3) return; var k=Math.round(+q[1])+","+Math.round(+q[2]); if(!(k in g)){ g[k]=0; ord.push(k); } g[k]|=1<<(((+q[0])%7+7)%7); });
  if(!known&&!ord.length) return null; var a=[known?(isBar(x)?1:0):2];
  ord.slice(0,14).forEach(function(k){ var q=k.split(","); a.push(+q[0],+q[1],g[k]); }); return a; }
function pinFrom(a,it){ if(!Array.isArray(a)||!a.length) return; if(a[0]===1||a[0]===0) it.nb=a[0]; var oh=[];
  for(var i=1;i+2<a.length&&oh.length<28;i+=3){ var o=Math.round(+a[i]), c=Math.round(+a[i+1]), m=(+a[i+2])|0; if(!(o>=0&&o<1440&&c>o&&c<=o+10080)) continue; for(var d=0;d<7;d++) if(m&(1<<d)) oh.push([d,o,c]); }
  if(oh.length) it.oh=oh.slice(0,28); }
function shareData(){ var pl=TR.plan, r=function(n){ return Math.round(n*1e5)/1e5; };
  return {v:1,s:pl.days[0]&&pl.days[0].date,f:m2hm(pl.from),t:m2hm(pl.to),w:TR.opt.walk,h:pl.hotel&&pl.hotel.type!=="here"?[pl.hotel.ko,pl.hotel.en,r(pl.hotel.lat),r(pl.hotel.lng)]:null,
    d:pl.days.map(function(d){ return d.stops.map(function(k){ var x=pl.pool[k]; if(!x.pin) return k; var a=[x.ko,x.en,r(x.lat),r(x.lng)], q=pinInfo(x); if(q) a.push(q); return a; }); }),x:natShare(pl,r)}; }   // x = 전국 일정(도시별 숙소·공항·도시 이동 아침/저녁) — 옛 앱은 모르는 칸이라 버린다 (11-06)
// 일정을 # 뒤에 압축해 담은 공유 링크(읽기 전용으로 앱에서 열린다) — 링크·메일 공용
function tripUrl(){ return zip(JSON.stringify(shareData())).then(function(z){ return location.origin+location.pathname.replace(/index\.html$/,"")+"?trip=1#tp="+z; }); }
function shareGo(){ var box=document.getElementById("trNextBox");
  box.innerHTML='<div class="item"><div class="t">'+T("🔗 공유","🔗 Share")+'</div>'
    +'<div class="shgrid" style="margin-top:8px"><button type="button" id="trShL">🔗 '+T("링크","Link")+'</button><button type="button" id="trShMail">✉ '+T("메일","Email")+'</button></div>'
    +'<button type="button" id="trShP" class="gsbtn" style="margin-top:8px">'+MPIMG("mi_guideperson",MIS)+esc(T5({ko:"가이드에게 PDF 보내기",en:"Send PDF to a guide",ja:"ガイドにPDFを送る",zhs:"把PDF发给向导",zht:"把PDF傳給嚮導",es:"Enviar PDF a un guía"}))+'</button>'
    +'<div class="shmsg" id="trShM"></div></div>';
  document.getElementById("trShL").onclick=function(){ tripUrl().then(function(u){ var m=document.getElementById("trShM");
    if(navigator.share) navigator.share({title:T("내 여행 일정","My trip plan"),url:u}).catch(function(){});
    else { try{ navigator.clipboard.writeText(u); m.textContent=T("링크를 복사했어요","Link copied"); }catch(e){ m.textContent=u; } } window.__trShareUrl=u; try{ ntap("_trip","share"); }catch(e){} }); };
  // ✉ 메일 — 데스크톱·공유 시트 없을 때도 메일 앱으로 일정 링크를 보낼 수 있게 (사장님 10-24)
  document.getElementById("trShMail").onclick=function(){ var m=document.getElementById("trShM"); m.textContent=T("메일 여는 중…","Opening email…"); tripUrl().then(function(u){ m.textContent=""; window.__trShareUrl=u;
    var subj=encodeURIComponent(T("내 여행 일정","My trip plan")), body=encodeURIComponent(T("여행 일정을 공유합니다:","Here is my trip plan:")+"\n"+u); try{ ntap("_trip","share_mail"); }catch(e){} location.href="mailto:?subject="+subj+"&body="+body; }); };
  document.getElementById("trShP").onclick=function(){ gsOpen(); }; }

// ── 가이드에게 일정 PDF 보내기 (사장님 2026-10-24) — 「PDF 보내기」를 가이드 전용으로. 언어 고르기 → 가이드 목록 → 확인 → 이메일로 PDF 첨부 발송(+문자 링크는 준비만) ──
//   near.js 의 통역·길안내(ig) 목록 UX 를 이 창(trNextBox) 안에서 그대로 흉내 낸다. 가이드 자료는 허브 GET /guide/guides?lang= · 보내기는 POST /guide/sendplan
var GS={view:"lang",lang:"",guides:null,err:"",g:null,busy:false,msg:""};
var GSLANG6=[["한국어","ko","🇰🇷"],["English","en","🇺🇸"],["日本語","ja","🇯🇵"],["中文(简)","zhs","🇨🇳"],["中文(繁)","zht","🇹🇼"],["Español","es","🇪🇸"]];
function gsLangName(c){ for(var i=0;i<GSLANG6.length;i++) if(GSLANG6[i][1]===c) return GSLANG6[i][0]; return c; }
function gsLast(){ try{ var o=JSON.parse(localStorage.getItem("mpv_lastguide")||"null"); return (o&&o.id&&o.name)?o:null; }catch(e){ return null; } }
function gsOpen(){ GS={view:"lang",lang:"",guides:null,err:"",g:null,busy:false,msg:""}; gsPaint(); try{ ntap("_trip","guide_send_open"); }catch(e){} }
function gsStars(n){ n=Math.max(0,Math.min(5,Math.round(n||0))); var s=""; for(var i=0;i<5;i++) s+=(i<n?"★":"☆"); return s; }
function gsFace(g){ return g.photo?'<img class="gsav" src="'+HUB+'/guide/photo?id='+encodeURIComponent(g.id)+'" alt="" loading="lazy">':'<span class="gsav gsavx">🧭</span>'; }
// 지역 이름을 화면 언어로 (가이드가 한글로 적은 지역을 외국어 화면에서 현지 표기로, 10-24) · 표에 없으면 원래대로
var GRGN6={"서울":{en:"Seoul",ja:"ソウル",zhs:"首尔",zht:"首爾",es:"Seúl"},"부산":{en:"Busan",ja:"釜山",zhs:"釜山",zht:"釜山",es:"Busan"},"제주":{en:"Jeju",ja:"済州",zhs:"济州",zht:"濟州",es:"Jeju"},"경주":{en:"Gyeongju",ja:"慶州",zhs:"庆州",zht:"慶州",es:"Gyeongju"},"인천":{en:"Incheon",ja:"仁川",zhs:"仁川",zht:"仁川",es:"Incheon"},"전주":{en:"Jeonju",ja:"全州",zhs:"全州",zht:"全州",es:"Jeonju"},"경기":{en:"Gyeonggi",ja:"京畿",zhs:"京畿",zht:"京畿",es:"Gyeonggi"},"강원":{en:"Gangwon",ja:"江原",zhs:"江原",zht:"江原",es:"Gangwon"},"대구":{en:"Daegu",ja:"大邱",zhs:"大邱",zht:"大邱",es:"Daegu"},"대전":{en:"Daejeon",ja:"大田",zhs:"大田",zht:"大田",es:"Daejeon"},"광주":{en:"Gwangju",ja:"光州",zhs:"光州",zht:"光州",es:"Gwangju"},"울산":{en:"Ulsan",ja:"蔚山",zhs:"蔚山",zht:"蔚山",es:"Ulsan"},"강릉":{en:"Gangneung",ja:"江陵",zhs:"江陵",zht:"江陵",es:"Gangneung"},"여수":{en:"Yeosu",ja:"麗水",zhs:"丽水",zht:"麗水",es:"Yeosu"},"속초":{en:"Sokcho",ja:"束草",zhs:"束草",zht:"束草",es:"Sokcho"}};
function gsRegion(r){ if(!r||!L()) return r||""; var k=String(r).replace(/\s/g,"").replace(/(특별자치시|특별자치도|특별시|광역시|시|도)$/,""); var m=GRGN6[k]||GRGN6[String(r).trim()]; return m?(m[LANG]||m.en):r; }
function gsPaint(){ var box=document.getElementById("trNextBox"); if(!box) return; var h='';
  var back='<button type="button" class="trbtn gsback" id="gsBack" style="margin:0 0 6px">‹ '+esc(T5({ko:"뒤로",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Atrás"}))+'</button>';
  if(GS.view==="done"){ box.innerHTML='<div class="item"><div class="gsdone">✓ '+esc(T5({ko:"가이드에게 일정을 보냈어요 (이메일 + 문자).",en:"Sent to the guide (email + SMS).",ja:"ガイドに旅程を送りました（メール＋SMS）。",zhs:"已把行程发给向导（邮件＋短信）。",zht:"已把行程傳給嚮導（郵件＋簡訊）。",es:"Enviado al guía (correo + SMS)."}))+'</div>'
      +(GS.g?'<div class="gsm">'+esc(GS.g.name)+'</div>':'')+'</div>'; return; }
  if(GS.view==="confirm"&&GS.g){ var g=GS.g;
    box.innerHTML='<div class="item">'+back
      +'<div class="gscard" style="cursor:default">'+gsFace(g)+'<div class="gsb"><b>'+(window.igName?igName(g):esc(g.name))+'</b><div class="gsm">'+(g.langs||[]).map(gsLangName).map(esc).join(" · ")+(g.region?" · "+esc(gsRegion(g.region)):"")+'</div></div></div>'
      +'<label class="gslb">'+esc(T5({ko:"손님 이름 (선택)",en:"Your name (optional)",ja:"お名前（任意）",zhs:"您的姓名（可选）",zht:"您的姓名（可選）",es:"Tu nombre (opcional)"}))+'</label><input class="gsin" id="gsName" maxlength="30">'
      +'<label class="gschk"><input type="checkbox" id="gsAg"> '+esc(T5({ko:"내 여행 일정을 이 가이드에게 전달하는 데 동의합니다",en:"I agree to share my trip itinerary with this guide",ja:"私の旅程をこのガイドに伝えることに同意します",zhs:"我同意将我的行程转交给该向导",zht:"我同意將我的行程轉交給該嚮導",es:"Acepto compartir mi itinerario con este guía"}))+'</label>'
      +'<button type="button" class="trbtn big gsgo" id="gsGo" style="margin-top:10px">'+esc(T5({ko:"보내기",en:"Send",ja:"送る",zhs:"发送",zht:"發送",es:"Enviar"}))+'</button>'
      +'<div class="shmsg" id="gsMsg">'+esc(GS.msg||"")+'</div></div>';
    gsWire(); return; }
  if(GS.view==="list"){ h='<div class="item">'+back+'<div class="gslbl">'+esc(T5({ko:gsLangName(GS.lang)+" 가이드",en:gsLangName(GS.lang)+" guides",ja:gsLangName(GS.lang)+"のガイド",zhs:gsLangName(GS.lang)+"向导",zht:gsLangName(GS.lang)+"嚮導",es:"Guías de "+gsLangName(GS.lang)}))+'</div>';
    if(GS.err) h+='<div class="gsnote">'+esc(T5({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."}))+'</div>';
    else if(!GS.guides) h+='<div class="gsnote">'+esc(T5({ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"搜索中…",zht:"搜尋中…",es:"Buscando…"}))+'</div>';
    else if(!GS.guides.length) h+='<div class="gsnote">'+esc(T5({ko:"아직 등록된 가이드가 없습니다.",en:"No guides registered yet.",ja:"まだ登録されたガイドがいません。",zhs:"暂无已登记的向导。",zht:"暫無已登記的嚮導。",es:"Aún no hay guías registrados."}))+'</div>';
    else h+=GS.guides.map(function(g,i){ return '<div class="gscard" data-gspick="'+i+'">'+gsFace(g)+'<div class="gsb"><b>'+(window.igName?igName(g):esc(g.name))+'</b> '+(g.count>0?'<span class="gsrb">★'+(g.avg!=null?g.avg:0)+' ('+g.count+')</span>':'<span class="gsrb gsrb0">'+esc(T5({ko:"후기 없음",en:"No reviews",ja:"レビューなし",zhs:"暂无评价",zht:"暫無評價",es:"Sin reseñas"}))+'</span>')+'<div class="gsm">'+(g.langs||[]).map(gsLangName).map(esc).join(" · ")+(g.region?" · "+esc(gsRegion(g.region)):"")+'</div></div><span class="gspk">'+esc(T5({ko:"고르기 ›",en:"Pick ›",ja:"選ぶ ›",zhs:"选择 ›",zht:"選擇 ›",es:"Elegir ›"}))+'</span></div>'; }).join("");
    h+='</div>'; box.innerHTML=h; gsWire(); return; }
  // lang
  var last=gsLast();
  h='<div class="item"><div class="t">'+MPIMG("mi_guideperson",MIS)+esc(T5({ko:"가이드에게 PDF 보내기",en:"Send PDF to a guide",ja:"ガイドにPDFを送る",zhs:"把PDF发给向导",zht:"把PDF傳給嚮導",es:"Enviar PDF a un guía"}))+'</div>';
  if(last) h+='<button type="button" class="gscard gsquick" data-gsquick="1" style="width:100%;text-align:left;border:0;font:inherit;cursor:pointer"><span class="gsav gsavx">🧭</span><div class="gsb"><b>'+esc(last.name)+'</b><div class="gsm">'+esc(T5({ko:"최근 고른 가이드에게 바로 보내기",en:"Send to recently chosen guide",ja:"最近選んだガイドに送る",zhs:"发送给最近选择的向导",zht:"傳送給最近選擇的嚮導",es:"Enviar al guía elegido recientemente"}))+'</div></div></button>';
  h+='<div class="gslbl" style="margin-top:8px">'+esc(T5({ko:"가이드 언어를 고르세요",en:"Choose the guide’s language",ja:"ガイドの言語を選んでください",zhs:"请选择向导的语言",zht:"請選擇嚮導的語言",es:"Elige el idioma del guía"}))+'</div><div class="gslangs">'
    +GSLANG6.map(function(l){ return '<button type="button" class="gslang" data-gslang="'+l[1]+'">'+l[2]+' '+esc(l[0])+' ›</button>'; }).join("")+'</div></div>';
  box.innerHTML=h; gsWire(); }
function gsWire(){ var box=document.getElementById("trNextBox"); if(!box) return;
  var bk=document.getElementById("gsBack"); if(bk) bk.onclick=function(){ GS.view=(GS.view==="confirm")?"list":"lang"; if(GS.view==="lang"){ GS.lang=""; GS.guides=null; } GS.msg=""; gsPaint(); };
  [].forEach.call(box.querySelectorAll("[data-gslang]"),function(b){ b.onclick=function(){ GS.lang=b.dataset.gslang; GS.view="list"; GS.guides=null; GS.err=""; gsPaint(); gsLoad(); }; });
  [].forEach.call(box.querySelectorAll("[data-gspick]"),function(c){ c.onclick=function(){ var g=GS.guides&&GS.guides[+c.dataset.gspick]; if(g){ GS.g=g; GS.view="confirm"; GS.msg=""; gsPaint(); } }; });
  var q=box.querySelector("[data-gsquick]"); if(q) q.onclick=function(){ var l=gsLast(); if(l){ GS.g={id:l.id,name:l.name,langs:l.langs||[],region:l.region||"",photo:false}; GS.lang=l.lang||((l.langs||[])[0])||"en"; GS.view="confirm"; GS.msg=""; gsPaint(); } };
  var go=document.getElementById("gsGo"); if(go) go.onclick=gsSend; }
function gsLoad(){ var lang=GS.lang; fetch(HUB+"/guide/guides?lang="+encodeURIComponent(lang)).then(function(r){ return r.json(); }).then(function(j){ if(GS.lang!==lang||GS.view!=="list") return;
    if(j&&j.ok){ GS.guides=j.items||[]; } else GS.err="x"; gsPaint(); }).catch(function(){ if(GS.lang===lang&&GS.view==="list"){ GS.err="net"; gsPaint(); } }); }
function gsSend(){ if(GS.busy||!GS.g) return; var nmEl=document.getElementById("gsName"), ag=document.getElementById("gsAg"), M=document.getElementById("gsMsg"), set=function(t){ GS.msg=t; if(M) M.textContent=t; };
  var name=nmEl?String(nmEl.value||"").trim():"";
  if(!ag||!ag.checked){ set(T5({ko:"전달 동의에 체크해 주세요.",en:"Please check the consent box.",ja:"同意にチェックしてください。",zhs:"请勾选同意。",zht:"請勾選同意。",es:"Marca la casilla de consentimiento."})); return; }
  GS.busy=true; var go=document.getElementById("gsGo"); if(go){ go.disabled=true; } set(T5({ko:"PDF 만드는 중…",en:"Making PDF…",ja:"PDF作成中…",zhs:"正在生成PDF…",zht:"正在產生PDF…",es:"Creando PDF…"}));
  Promise.all([pdfBuild(),tripUrl()]).then(function(r){ var o=r[0], url=r[1], pdf=""; try{ pdf=o.doc.output("datauristring"); }catch(e){}
    var bi=pdf.indexOf("base64,"); pdf=bi>=0?("data:application/pdf;base64,"+pdf.slice(bi+7)):"";   // jsPDF 가 붙이는 ;filename= 등을 떼고 깨끗이 다시 만든다 (서버 검사 통과, 10-24)
    set(T5({ko:"가이드에게 보내는 중…",en:"Sending to the guide…",ja:"ガイドに送信中…",zhs:"正在发送给向导…",zht:"正在傳送給嚮導…",es:"Enviando al guía…"}));
    return fetch(HUB+"/guide/sendplan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({guideId:GS.g.id,lang:GS.lang,pdfBase64:pdf,tripUrl:url,name:name}),cache:"no-store"}).then(function(x){ return x.json(); }); })
  .then(function(j){ GS.busy=false; if(go) go.disabled=false;
    if(j&&j.ok){ try{ localStorage.setItem("mpv_lastguide",JSON.stringify({id:GS.g.id,name:GS.g.name,langs:GS.g.langs||[],region:GS.g.region||"",lang:GS.lang})); }catch(e){} window.__trSendPlan=j; try{ ntap("_trip","guide_send_ok"); }catch(e){} GS.view="done"; gsPaint(); return; }
    set(j&&j.err==="guide"?T5({ko:"가이드를 찾을 수 없어요.",en:"Guide not found.",ja:"ガイドが見つかりません。",zhs:"找不到该向导。",zht:"找不到該嚮導。",es:"Guía no encontrado."}):j&&j.err==="rate"?T5({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again later.",ja:"しばらくしてからもう一度。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo más tarde."}):j&&(j.err==="pdfbig"||j.err==="pdf")?T5({ko:"PDF를 만들지 못했어요. 다시 해 주세요.",en:"Could not prepare the PDF. Please try again.",ja:"PDFを準備できませんでした。もう一度お試しください。",zhs:"无法准备PDF，请重试。",zht:"無法準備PDF，請重試。",es:"No se pudo preparar el PDF. Inténtalo de nuevo."}):T5({ko:"보내지 못했어요.",en:"Could not send.",ja:"送信できませんでした。",zhs:"发送失败。",zht:"發送失敗。",es:"No se pudo enviar."})); })
  .catch(function(e){ GS.busy=false; if(go) go.disabled=false; window.__trSendPlanErr=String(e); set(T5({ko:"연결에 실패했어요.",en:"Connection failed.",ja:"接続に失敗しました。",zhs:"连接失败。",zht:"連接失敗。",es:"Error de conexión."})); }); }
function fromShare(z){ return unzip(z).then(function(s){ var o=JSON.parse(s); if(!o||o.v!==1||!Array.isArray(o.d)) throw 0;
  return Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){
    var items=[], days=[], pool={};
    o.d.slice(0,7).forEach(function(arr){ var ks=[]; (arr||[]).slice(0,MAXN).forEach(function(x){ var it=typeof x==="string"?snapPlace(x):(Array.isArray(x)?{ko:String(x[0]).slice(0,80),en:String(x[1]).slice(0,80),lat:+x[2],lng:+x[3],pin:1}:null);
      if(it&&Array.isArray(x)) pinFrom(x[4],it);   // 밤 장소 여부·영업시간 (11-06, 옛 링크엔 없음 → 이름 낱말 규칙)
      if(!it||!isFinite(it.lat)||!isFinite(it.lng)) return; if(it.pin) it.k=pinKey(it); if(pool[it.k]) return; it.stay=stayOf(it); pool[it.k]=it; items.push(it); ks.push(it.k); }); days.push(ks); });
    if(TR.items.length&&!confirm(T("받은 일정으로 바꿀까요? (지금 담은 목록은 바뀝니다)","Replace your current trip with the shared plan?"))) return false;
    var h=Array.isArray(o.h)?{type:"addr",ko:String(o.h[0]).slice(0,80),en:String(o.h[1]).slice(0,80),lat:+o.h[2],lng:+o.h[3]}:null;
    TR={items:items.map(function(x){ var y=Object.assign({},x); delete y.stay; return y; }),opt:{n:days.length,start:o.s,from:o.f,to:o.t,walk:+o.w||1,hotel:h}};
    TR.plan={v:1,at:Date.now(),from:hm2m(o.f)||570,to:hm2m(o.t)||1200,hotel:h,days:days.map(function(ks,i){ return {date:dayDate(i).toISOString().slice(0,10),stops:ks}; }),pool:pool,skip:[],ai:null};
    TR.plan.H=h?{k:"__hotel",ko:h.ko,en:h.en,lat:h.lat,lng:h.lng,hotel:1}:null;
    if(o.x&&typeof o.x==="object"){ try{ natFromShare(TR.plan,o.x); }catch(e){ try{ console.error(e); }catch(z){} } }   // 전국 일정 (11-06) — 날마다 장소는 받은 그대로, 도시·이동·숙소 틀만 다시
    save(); refresh(); }); }); }

// ══ 실제 머문 시간으로 남은 오늘 일정 계속 조정 (사장님 2026-11-06 「1-가」) ══
//  · 도착·출발 — 앱이 켜져 있을 때 폰 위치(「나」 = meSet)가 오늘 일정 장소 120m 안에 1분 넘게(위치 2번 넘게) 있으면 도착, 지금 장소에서 250m 밖에 1분 넘게 있으면 출발.
//    잠깐 튀는 위치는 무시(1분·2번 조건) · 「여기 떠나요」 단추 = 출발 · 기록은 이 기기 localStorage(mpv_trlive)에만(서버로 안 보냄, 14일 지나면 지움)
//  · 출발·도착할 때마다 남은 오늘 일정을 지금 시각부터 다시 계산 — 이 손님 경향 = 실제/계획 머문 시간 비율(기록이 쌓일수록 1에서 멀어짐, 0.5~2.5)
//  · 70% 판단 — 남은 장소 머문 시간(경향 × 흩어짐, 로그정규 σ: 기록 3곳부터 이 손님 것, 그 전 0.3)·이동 시간(±25%)을 폰 안에서 400번 모의 →
//    하루 끝 시각을 넘기거나 남은 장소 하나라도 마감 뒤 도착할 확률 ≥ 70% 면 주의. 같은 내용(남은 장소·넘는 것)은 30분 안에 다시 안 울림 · 「끝까지 간다」를 고른 내용은 그날 다시 안 울림
//  · 주의 = 앱 안 주의 창(내일로·취소·끝까지) + 🔔 알림함(bell.js — 알림 켜짐이면 폰 알림). 🔴 문자·메일·대화방·허브로는 보내지 않는다 (사장님 11-06)
//  · 앱이 완전히 닫혀 있으면 위치를 못 받으니 다시 열 때 계산
var LV6={
 open:{ko:"{t} 문 열어요",en:"Opens at {t}",ja:"{t}に開店",zhs:"{t}开门",zht:"{t}開門",es:"Abre a las {t}"},
 shut:{ko:"마감 {t} 지남 — 못 들어가요",en:"Closed at {t} — can't get in",ja:"{t}に閉店 — 入れません",zhs:"{t}已关门——进不去",zht:"{t}已關門——進不去",es:"Cerró a las {t}: no podrás entrar"},
 off:{ko:"이 날은 쉬는 날",en:"Closed on this day",ja:"この日は定休日",zhs:"当天休息",zht:"當天休息",es:"Cerrado este día"},
 eve:{ko:"영업시간 정보가 없어 저녁(19시 뒤)에 넣었어요",en:"No opening hours found — placed after 7 pm",ja:"営業時間が分からないため夜（19時以降）に入れました",zhs:"没有营业时间信息，已安排在晚上（19点后）",zht:"沒有營業時間資訊，已安排在晚上（19點後）",es:"Sin horario disponible: lo pusimos después de las 19:00"},
 hrs:{ko:"영업 {o}–{c}",en:"Open {o}–{c}",ja:"営業 {o}–{c}",zhs:"营业 {o}–{c}",zht:"營業 {o}–{c}",es:"Abierto {o}–{c}"},
 pred:{ko:"실제로 머문 시간에 맞춰 남은 시각을 다시 계산했어요 (예상)",en:"Remaining times were recalculated from how long you actually stayed (estimate)",ja:"実際の滞在時間に合わせて残りの時刻を計算し直しました（予想）",zhs:"已根据实际停留时间重新计算剩余时间（预计）",zht:"已根據實際停留時間重新計算剩餘時間（預計）",es:"Recalculamos las horas restantes según el tiempo que realmente te quedaste (estimado)"},
 done:{ko:"다녀옴 {a}–{d}",en:"Visited {a}–{d}",ja:"訪問済み {a}–{d}",zhs:"已到访 {a}–{d}",zht:"已到訪 {a}–{d}",es:"Visitado {a}–{d}"},
 left:{ko:"{d} 출발",en:"Left at {d}",ja:"{d}に出発",zhs:"{d}出发",zht:"{d}出發",es:"Salida a las {d}"},
 here:{ko:"{a} 도착 · 지금 여기",en:"Arrived {a} · you're here",ja:"{a}到着・今ここ",zhs:"{a}到达 · 现在在这里",zht:"{a}到達 · 現在在這裡",es:"Llegada {a} · estás aquí"},
 leave:{ko:"여기 떠나요",en:"I'm leaving here",ja:"ここを出発します",zhs:"我要离开这里",zht:"我要離開這裡",es:"Me voy de aquí"},
 at:{ko:"오늘 일정이 늦어지고 있어요",en:"Today's plan is running late",ja:"今日の予定が遅れています",zhs:"今天的行程正在延误",zht:"今天的行程正在延誤",es:"El plan de hoy va con retraso"},
 ab:{ko:"이대로 가면 {p}% 확률로 하루 끝({t})을 넘기거나 마감 시각에 늦어요.",en:"At this pace there is a {p}% chance you'll go past your end time ({t}) or reach a place after it closes.",ja:"このままだと{p}%の確率で一日の終わり（{t}）を過ぎるか、閉店時刻に間に合いません。",zhs:"照这样下去，有{p}%的可能超过当天结束时间（{t}）或赶不上关门时间。",zht:"照這樣下去，有{p}%的可能超過當天結束時間（{t}）或趕不上關門時間。",es:"A este ritmo hay un {p}% de probabilidad de pasarte de tu hora de fin ({t}) o de llegar a un lugar ya cerrado."},
 bb:{ko:"하루 끝·마감에 늦을 확률 {p}% — 눌러서 남은 일정을 정하세요",en:"{p}% chance of running past your end time or closing times — tap to decide",ja:"終了時刻・閉店に遅れる確率{p}% — 押して残りの予定を決めてください",zhs:"有{p}%的可能赶不上结束或关门时间——点按决定剩余行程",zht:"有{p}%的可能趕不上結束或關門時間——點按決定剩餘行程",es:"{p}% de probabilidad de pasarte de la hora de fin o de cierre — toca para decidir"},
 eta:{ko:"도착 예상 {a}",en:"ETA {a}",ja:"到着予想 {a}",zhs:"预计到达 {a}",zht:"預計到達 {a}",es:"Llegada prevista {a}"},
 cl:{ko:"마감 {c}",en:"closes {c}",ja:"閉店 {c}",zhs:"关门 {c}",zht:"關門 {c}",es:"cierra {c}"},
 last:{ko:"입장 마감 {c}",en:"last entry {c}",ja:"入場締切 {c}",zhs:"最晚入场 {c}",zht:"最晚入場 {c}",es:"última entrada {c}"},
 late:{ko:"못 들어가요",en:"you won't get in",ja:"入れません",zhs:"进不去",zht:"進不去",es:"no podrás entrar"},
 ok:{ko:"들어갈 수 있어요",en:"you'll make it",ja:"間に合います",zhs:"来得及",zht:"來得及",es:"llegas a tiempo"},
 unk:{ko:"마감 정보 없음",en:"closing time unknown",ja:"閉店時刻不明",zhs:"关门时间不详",zht:"關門時間不詳",es:"hora de cierre desconocida"},
 endH:{ko:"숙소 도착 예상 {e}",en:"Back at lodging around {e}",ja:"宿に着くのは{e}ごろ",zhs:"预计{e}回到住处",zht:"預計{e}回到住處",es:"Llegada al alojamiento hacia las {e}"},
 endN:{ko:"일정 끝 예상 {e}",en:"Day ends around {e}",ja:"予定終了は{e}ごろ",zhs:"预计{e}结束行程",zht:"預計{e}結束行程",es:"El día termina hacia las {e}"},
 b1:{ko:"남은 일정 내일로",en:"Move the rest to tomorrow",ja:"残りの予定を明日へ",zhs:"剩余行程改到明天",zht:"剩餘行程改到明天",es:"Pasar el resto a mañana"},
 b2:{ko:"남은 일정 취소",en:"Cancel the rest",ja:"残りの予定を取り消す",zhs:"取消剩余行程",zht:"取消剩餘行程",es:"Cancelar el resto"},
 b3:{ko:"끝까지 간다",en:"Keep going",ja:"最後まで行く",zhs:"坚持走完",zht:"堅持走完",es:"Seguir hasta el final"},
 r1:{ko:"남은 {n}곳을 내일({d})로 옮기고 내일 일정을 처음부터 다시 짰어요.",en:"Moved the remaining {n} place(s) to tomorrow ({d}) and re-planned tomorrow from scratch.",ja:"残りの{n}か所を明日（{d}）に移し、明日の予定を最初から組み直しました。",zhs:"已把剩余{n}个地点改到明天（{d}），并从头重新安排了明天的行程。",zht:"已把剩餘{n}個地點改到明天（{d}），並從頭重新安排了明天的行程。",es:"Pasamos los {n} lugares restantes a mañana ({d}) y replanificamos mañana desde cero."},
 r1x:{ko:"마지막 날이라 하루를 늘렸어요.",en:"It was the last day, so we added a day.",ja:"最終日だったので1日増やしました。",zhs:"因为是最后一天，已增加一天。",zht:"因為是最後一天，已增加一天。",es:"Era el último día, así que añadimos un día."},
 r2:{ko:"오늘 남은 {n}곳을 일정에서 뺐어요. 여행카트에는 그대로 있어요.",en:"Removed the remaining {n} place(s) from today's plan. They're still in your trip cart.",ja:"今日の残り{n}か所を予定から外しました。旅のカートにはそのまま残っています。",zhs:"已从今天的行程中移除剩余{n}个地点，行程购物车里仍然保留。",zht:"已從今天的行程中移除剩餘{n}個地點，行程購物車裡仍然保留。",es:"Quitamos los {n} lugares restantes del plan de hoy. Siguen en tu carrito de viaje."},
 r3:{ko:"그대로 갑니다. 남은 장소의 마감 시각을 확인하세요.",en:"Keeping the plan. Check the closing times below.",ja:"このまま進みます。残りの場所の閉店時刻を確認してください。",zhs:"按原计划继续。请确认剩余地点的关门时间。",zht:"按原計畫繼續。請確認剩餘地點的關門時間。",es:"Seguimos con el plan. Revisa las horas de cierre."},
 rl:{ko:"남은 장소 마감 확인",en:"Closing times of the places left",ja:"残りの場所の閉店時刻",zhs:"剩余地点关门时间",zht:"剩餘地點關門時間",es:"Horas de cierre de los lugares restantes"},
 rt:{ko:"내일({d}) 일정",en:"Tomorrow ({d})",ja:"明日（{d}）の予定",zhs:"明天（{d}）行程",zht:"明天（{d}）行程",es:"Mañana ({d})"},
 none:{ko:"오늘 남은 장소가 없어요.",en:"No places left today.",ja:"今日残っている場所はありません。",zhs:"今天没有剩余地点。",zht:"今天沒有剩餘地點。",es:"Hoy no quedan lugares."},
 view:{ko:"일정 보기",en:"See my plan",ja:"予定を見る",zhs:"查看行程",zht:"查看行程",es:"Ver mi plan"},
 x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}};
function fill6(o,v){ var r={}; ["ko","en","ja","zhs","zht","es"].forEach(function(l){ r[l]=String(o[l]||o.en).replace(/\{(\w)\}/g,function(_,k){ return v[k]; }); }); return r; }
var LKEY="mpv_trlive", LIVE=(function(){ var o=null; try{ o=JSON.parse(localStorage.getItem(LKEY)||"null"); }catch(e){} return (o&&typeof o==="object")?o:{}; })();
function liveSave(){ try{ var cut=kstToday(-14); for(var k in (LIVE.d||{})) if(k<cut) delete LIVE.d[k]; for(var s in (LIVE.ack||{})) if(s.slice(0,10)<cut) delete LIVE.ack[s]; ["dr","hq","lq"].forEach(function(f){ for(var q in (LIVE[f]||{})) if(q<cut) delete LIVE[f][q]; }); localStorage.setItem(LKEY,JSON.stringify(LIVE)); }catch(e){} }   // dr·hq·lq = 실시간 구간·숙소 도착 물음·오늘 밤 숙소 물음 (11-06)
function liveRecs(date,mk){ LIVE.d=LIVE.d||{}; if(!LIVE.d[date]&&mk) LIVE.d[date]={}; return LIVE.d[date]||null; }
function kminOn(ms,date){ return Math.round((ms-Date.parse(date+"T00:00:00+09:00"))/6e4); }   // 그날 한국 0시부터 분 (자정 넘으면 1440 넘음)
function liveToday(){ var pl=TR.plan; if(!pl||!pl.days) return null; var td=kstToday(0);
  for(var i=0;i<pl.days.length;i++){ var d=pl.days[i]; if(d.date===td) return {pl:pl,di:i,d:d,arr:d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean)}; } return null; }
function liveH(){ var pl=TR.plan; return REPH||(pl&&pl.H)||null; }
// 이 손님 경향 — 실제/계획 머문 시간 비율(로그 평균, 기록 n곳이면 n/(n+1) 만큼만 믿음) · 흩어짐 σ
function liveTrend(){ var pl=TR.plan, ls=[];
  for(var dt in (LIVE.d||{})){ var rc=LIVE.d[dt]; for(var k in rc){ var q=rc[k], x=pl&&pl.pool[k]; if(!x||q.a==null||q.d==null) continue; var m=(q.d-q.a)/6e4; if(m<3) continue; var r=m/(x.stay||60); if(r>0.15&&r<6) ls.push(Math.log(r)); } }
  var n=ls.length; if(!n) return {r:1,sg:0.3,n:0}; var mu=ls.reduce(function(s,x){ return s+x; },0)/n, v=ls.reduce(function(s,x){ return s+(x-mu)*(x-mu); },0)/n;
  return {r:Math.min(2.5,Math.max(0.5,Math.exp(mu*n/(n+1)))),sg:n>=3?Math.min(0.6,Math.max(0.15,Math.sqrt(v))):0.3,n:n}; }
// 오늘이고 기록이 있으면 sched 의 lv (없으면 null) — 식사 칸 자리는 계획과 같게(ml) · from = 그날 시작 시각(전국 일정은 그날 틀, 11-06)
//   dr = 출발 순간 받은 네이버 실시간 구간 시간 {"떠난 곳>갈 곳":{min,fare}} (11-06) · u = 「더 있을게요」로 정한 떠날 시각
function liveLv(pl,di,H,arr,dt,mo,from){ var d=pl&&pl.days[di]; if(!d||!arr.length||d.date!==kstToday(0)) return null; var rc=liveRecs(d.date); if(!rc) return null;
  var ai=-1; arr.forEach(function(x,i){ var q=rc[x.k]; if(q&&(q.a!=null||q.d!=null)) ai=i; }); if(ai<0) return null;
  var R={}; arr.forEach(function(x){ var q=rc[x.k]; if(q){ R[x.k]={a:q.a!=null?kminOn(q.a,d.date):null,d:q.d!=null?kminOn(q.d,d.date):null}; if(q.u!=null) R[x.k].u=kminOn(q.u,d.date); } });
  var ps=sched(H,arr,dt,from!=null?from:pl.from,mo), ml={}, li=-1; ps.rows.forEach(function(r){ if(r.meal) (ml[li]=ml[li]||[]).push(r.meal); else li=arr.indexOf(r.x); });
  var tr=liveTrend(), o={i:ai,rec:R,now:kminOn(Date.now(),d.date),r:tr.r,sg:tr.sg,n:tr.n,ml:ml}, dr=LIVE.dr&&LIVE.dr[d.date]; if(dr) o.dr=dr; return o; }
// 「여기 떠나요」 단추를 붙일 장소 — 지금 있는 곳(도착 기록, 출발 없음) · 아니면 마지막 출발 다음 곳 · 기록이 없으면 계획상 지금 있을 곳
function liveHereK(pl,di,arr,s,lv){ if(!arr.length) return null;
  if(lv){ var x=arr[lv.i], q=lv.rec[x.k]; if(q&&q.a!=null&&q.d==null) return x.k; var nx=arr[lv.i+1]; return nx?nx.k:null; }
  var now=kminOn(Date.now(),pl.days[di].date), pick=null; if(now>s.end) return null; s.rows.forEach(function(r){ if(r.x&&r.t<=now+15) pick=r.x.k; }); return pick; }
// 위치 → 도착·출발 (화면 메모리 후보 GF — 1분·2번 넘게 그 상태여야 기록) · GF.h = 숙소 도착 후보 (11-06)
var GF={c:null,o:null,h:null};
function liveTick(pos){ var L=liveToday(); if(!L||!L.arr.length||!pos) return; var now=Date.now(), me={lat:+pos[0],lng:+pos[1]}, rec=liveRecs(L.d.date,1), ch="", dk="";
  var cur=null; L.arr.forEach(function(x){ var q=rec[x.k]; if(q&&q.a!=null&&q.d==null) cur=x; });
  var dCur=cur?km(me,cur)*1000:1e9, nb=null, nd=1e9;
  L.arr.forEach(function(x){ var q=rec[x.k]; if(x===cur||(q&&(q.a!=null||q.d!=null))) return; var dm=km(me,x)*1000; if(dm<=120&&dm<nd){ nd=dm; nb=x; } });
  if(nb&&(!cur||nd<dCur)){ if(!GF.c||GF.c.k!==nb.k) GF.c={k:nb.k,t:now,n:1}; else GF.c.n++;
    if(GF.c.n>=2&&now-GF.c.t>=60000){ if(cur&&rec[cur.k].d==null){ rec[cur.k].d=GF.c.t; dk=cur.k; } rec[nb.k]={a:GF.c.t}; GF.c=null; GF.o=null; ch="arr"; } }
  else GF.c=null;
  if(!ch&&cur){ if(dCur>250){ if(!GF.o||GF.o.k!==cur.k) GF.o={k:cur.k,t:now,n:1}; else GF.o.n++; if(GF.o.n>=2&&now-GF.o.t>=60000){ rec[cur.k].d=GF.o.t; dk=cur.k; GF.o=null; ch="dep"; } } else GF.o=null; }
  // 숙소 도착 (11-06 사장님 D) — 그날 밤 숙소 150m 안에 1분·2번 넘게 → 남은 곳이 있으면 한 번 묻는다
  try{ var X=dayX(L.pl,L.di,liveH()), HE=hE(X.H); if(HE&&HE.hotel&&!HE.here){ if(km(me,HE)*1000<=150){ if(!GF.h) GF.h={t:now,n:1}; else GF.h.n++; if(GF.h.n>=2&&now-GF.h.t>=60000){ GF.h=null; hotelArrive(L); } } else GF.h=null; } }catch(e){}
  if(ch){ if(dk) pqDone(dk); liveSave(); liveChanged(ch); if(dk&&ch==="dep") liveDrive(L,dk); } }   // 도착으로 알아챈 출발은 이미 다음 곳에 닿은 뒤라 길찾기를 안 부른다
function liveLeave(k){ var L=liveToday(); if(!L) return; var rec=liveRecs(L.d.date,1), q=rec[k]||(rec[k]={}); if(q.d==null) q.d=Date.now(); GF.c=null; GF.o=null; pqDone(k); liveSave(); liveChanged("leave"); liveDrive(L,k); }
function liveChanged(why){ try{ if(document.getElementById("trRep")) repPaint(); }catch(e){} try{ liveCheck(why); }catch(e){} try{ nowPaint(); }catch(e){} }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-lvleave]"); if(!b) return; e.preventDefault(); e.stopPropagation(); liveLeave(b.dataset.lvleave); },true);
// 그날 틀 (전국 일정 — 출발점·시작 시각·도착점, 11-06) · 옛 일정은 예전 그대로(liveH · pl.from)
function liveX(L){ return dayX(L.pl,L.di,liveH()); }
// 지금 상태 — 오늘 기록이 있고 남은 장소가 있을 때만
function liveState(){ var L=liveToday(); if(!L||!L.arr.length) return null; var pl=L.pl, X=liveX(L), H=X.H, dt=X.dt, mo=moX(L.di,X), lv=liveLv(pl,L.di,H,L.arr,dt,mo,X.from); if(!lv) return null;
  var s=sched(H,L.arr,dt,X.from,mo,lv), E=dayLim(pl,L.d,H,L.arr,dt,X), rest=L.arr.slice(lv.i+1);
  return {L:L,X:X,H:H,dt:dt,mo:mo,lv:lv,s:s,E:E,rest:rest,info:closeList(L.arr,dt,s,lv.i),over:s.end>E+LVTOL}; }
var LVTOL=15;   // 하루 끝은 15분 여유를 두고 넘김으로 본다 — 계획이 하루 끝에 딱 맞으면 머문 시간 흩어짐만으로 「넘김」이 절반쯤 나와 헛주의가 된다
// 장소별 도착 예상 vs 마감 (from 차례 뒤만)
function closeList(arr,dt,s,from){ var out=[]; s.rows.forEach(function(r){ if(!r.x) return; var i=arr.indexOf(r.x); if(i<=from) return; var co=closeOf(r.x,dt,r.t), late=!!co.off||(co.c!=null&&(co.last?r.t>co.c:r.t>=co.c)); out.push({x:r.x,t:r.t,co:co,late:late}); }); return out; }
function sigOf(S){ return S.L.d.date+"|"+S.rest.map(function(x){ return x.k; }).join(",")+"|"+(S.over?"E":"")+"|"+S.info.filter(function(q){ return q.late; }).map(function(q){ return q.x.k; }).join(","); }
function nrm(){ var u=Math.random()||1e-9, v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
// 구간 시간 — 출발 순간 받은 네이버 실시간 값(lv.dr)이 있으면 그것 (11-06)
function lmin(lv,p,x){ var q=lv&&lv.dr&&p&&x&&lv.dr[(p.k||"")+">"+(x.k||"")]; return q&&q.min>0?q.min:legMin(p,x); }
// 400번 모의 — 하루 끝을 넘기거나 마감 뒤 도착이 하나라도 있는 비율
function mcRisk(S){ var lv=S.lv, arr=S.L.arr, rows=S.s.rows, dt=S.dt, H=hE(S.H), E=S.E, a0=-1;
  rows.forEach(function(r,j){ if(r.x&&arr.indexOf(r.x)===lv.i) a0=j; }); if(a0<0) return 0;
  var ax=arr[lv.i], R=lv.rec[ax.k]||{}, N=400, bad=0, sg=lv.sg;
  for(var n=0;n<N;n++){ var t, p=ax, late=false, first, pv=null;
    if(R.d!=null){ t=R.d; first=true; } else { var a=R.a!=null?R.a:lv.now; t=Math.max(lv.now,a+ax.stay*lv.r*Math.exp(sg*nrm()),R.u!=null?R.u:0); first=false; }
    for(var j=a0+1;j<rows.length;j++){ var r=rows[j];
      if(r.meal){ if(r.r){ t+=lmin(lv,p,r.r)*Math.exp(0.25*nrm()); p=r.r; pv=null; } else if(r.to&&r.next){ t+=lmin(lv,p,r.next)*Math.exp(0.25*nrm()); p=r.next; pv=r.next; } if(first&&t<lv.now) t=lv.now; first=false; t+=60; continue; }   // 다음 장소 근처로 먼저 가서 먹는 칸이면 이동이 식사 앞 (11-06)
      var x=r.x; if(pv!==x) t+=lmin(lv,p,x)*Math.exp(0.25*nrm()); pv=null; if(first&&t<lv.now) t=lv.now; first=false;
      var wn=PERFK[x.k]?null:winOf(x,dt);
      if(wn){ if(wn.off) late=true; else { var nx=null; for(var i=0;i<wn.w.length;i++) if(t<wn.w[i][1]){ nx=wn.w[i]; break; } if(!nx) late=true; else if(t<nx[0]) t=nx[0]; } }
      var li=PERFK[x.k]?null:lastIn(FACT[x.k],dt); if(li!=null&&t>li) late=true;
      t+=x.stay*lv.r*Math.exp(sg*nrm()); p=x; }
    if(H&&p) t+=lmin(lv,p,H)*Math.exp(0.25*nrm());
    if(late||t>E+LVTOL) bad++; }
  return bad/N; }
function liveCheck(why){ try{ askCheck(why); }catch(e){} var S=liveState(); if(!S||!S.rest.length) return null; var P=mcRisk(S);
  var res={p:P,end:S.s.end,lim:S.E,over:S.over,late:S.info.filter(function(q){ return q.late; }).map(function(q){ return q.x.k; }),r:S.lv.r,why:why||""}; window.__trLive=res;
  if(P<0.7) return res; var sig=sigOf(S); LIVE.ack=LIVE.ack||{};
  if(LIVE.ack[sig]){ res.ack=1; return res; }
  var al=LIVE.al; if(al&&al.sig===sig&&Date.now()-al.at<30*60000){ res.dup=1; return res; }
  LIVE.al={sig:sig,at:Date.now(),p:P}; liveSave(); res.fired=1;
  try{ if(window.BELL&&BELL.add) BELL.add({k:"trip",ti:LV6.at,bd:fill6(LV6.bb,{p:Math.round(P*100)}),go:{k:"trip"}}); }catch(e){}
  if(!document.hidden&&!(LIVE.pq&&LIVE.pq.t==="stay"&&Date.now()-(LIVE.pq.at||0)<10*60000)) liveModal(P);   // 「더 계시나요?」를 막 물었으면 그 답이 먼저 — 주의는 🔔 목록에만 (11-06)
  return res; }
// ── 주의 창 (앱 안) — 남은 장소 도착 예상·마감 + 선택 4개(내일로·취소·끝까지·새로 짜기, 11-06) → 고른 뒤 남은 장소 마감 다시 ──
var ALS={view:"ask",p:null,res:null};
function lvRows(list){ return list.map(function(q){ var co=q.co, st=co.off?T5(LV6.off):co.c==null?T5(LV6.unk):gTxt(co.last?LV6.last:LV6.cl,{c:m2hm(co.c)});
    return '<div class="talr'+(q.late?' bad':'')+'"><b>'+esc(nm(q.x))+'</b><span>'+esc(gTxt(LV6.eta,{a:m2hm(q.t)}))+' · '+esc(st)+(co.off||co.c!=null?' — '+esc(T5(q.late?LV6.late:LV6.ok)):'')+'</span></div>'; }).join(""); }
function lvEnd(H,end){ var E=hE(H); return '<div class="tale">'+esc(gTxt(E?LV6.endH:LV6.endN,{e:m2hm(end)}))+'</div>'; }
function liveModal(p){ var o=document.getElementById("trAl"); if(o) o.remove();
  var b=document.createElement("div"); b.id="trAl"; b.className="trpop tral"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  ALS={view:"ask",p:(typeof p==="number")?p:null,res:null};
  if(ALS.p==null){ var S0=liveState(); ALS.p=S0&&S0.rest.length?mcRisk(S0):0; }
  var draw=function(){ b.innerHTML='<div class="talbox">'+alHtml()+'</div>'; };
  b._rb=draw; draw(); document.body.appendChild(b); return b; }
function nmList(ks){ var pl=TR.plan; return ks.map(function(k){ var x=pl&&pl.pool[k]; return x?nm(x):k; }).join(", "); }
function alHtml(){ var pl=TR.plan, h='';
  if(ALS.view==="res"&&ALS.res){ var R=ALS.res;
    if((R.kind==="tm"||R.kind==="rtm")&&R.none){ h+='<div class="talh">'+esc(T5(NX6.nomv))+'</div>'; }
    else if((R.kind==="tm"||R.kind==="rtm")&&pl&&pl.days[R.di]){ var nd=pl.days[R.di], NX=dayX(pl,R.di,liveH()), ndt=NX.dt, arr=NX.arr, s=sched(NX.H,arr,ndt,NX.from,moX(R.di,NX)), lim=dayLim(pl,nd,NX.H,arr,ndt,NX);
      h+='<div class="talh">✓ '+esc(gTxt(LV6.r1,{n:R.n,d:dateTxt(ndt)}))+'</div>'+(R.added?'<div class="tals">'+esc(T5(LV6.r1x))+'</div>':'')
        +'<div class="tall"><div class="talt">'+esc(gTxt(LV6.rt,{d:dateTxt(ndt)}))+'</div>'+lvRows(closeList(arr,ndt,s,-1))+'</div>'+lvEnd(NX.H,s.end)
        +(s.end>lim?'<div class="tmemo">⚠ '+esc(gTxt(OVR6,{t:m2hm(lim)}))+'</div>':''); }
    else { var S=liveState();
      h+='<div class="talh">✓ '+esc(R.kind==="cx"||R.kind==="rcx"?gTxt(LV6.r2,{n:R.n||0}):R.kind==="re"?T5(NX6.reD):T5(LV6.r3))+'</div>';
      if(R.kind==="re"&&R.out&&R.out.length&&pl){ var still=R.out.filter(function(k){ var L0=liveToday(); return L0&&L0.d.stops.indexOf(k)>=0; });
        if(still.length) h+='<div class="tgap"><b>'+esc(gTxt(NX6.reOut,{l:nmList(still)}))+'</b><div class="tgr"><button type="button" class="trbtn" data-al="rtm">'+esc(T5(NOW6.tm))+'</button><button type="button" class="trbtn" data-al="rcx">'+esc(T5(NOW6.cx))+'</button></div></div>'; }
      if(S&&S.rest.length) h+='<div class="tall"><div class="talt">'+esc(T5(LV6.rl))+'</div>'+lvRows(S.info)+'</div>'+lvEnd(S.H,S.s.end)+(S.over?'<div class="tmemo">⚠ '+esc(gTxt(OVR6,{t:m2hm(S.E)}))+'</div>':'');
      else { h+='<div class="tals">'+esc(T5(LV6.none))+'</div>'; var L=liveToday(); if(L&&L.arr.length){ var X2=liveX(L), mo=moX(L.di,X2), s2=sched(X2.H,L.arr,X2.dt,X2.from,mo,liveLv(pl,L.di,X2.H,L.arr,X2.dt,mo,X2.from)); h+=lvEnd(X2.H,s2.end); } } }
    return h+'<div class="talb"><button type="button" data-al="view">'+esc(T5(LV6.view))+'</button></div><button type="button" class="talx" data-al="x">'+esc(T5(LV6.x))+'</button>'; }
  var S2=liveState();
  h+='<div class="talh">⚠ '+esc(T5(LV6.at))+'</div>';
  if(!S2||!S2.rest.length) return h+'<div class="tals">'+esc(T5(LV6.none))+'</div><button type="button" class="talx" data-al="x">'+esc(T5(LV6.x))+'</button>';
  h+='<div class="tals">'+esc(gTxt(LV6.ab,{p:Math.round((ALS.p||0)*100),t:m2hm(S2.E)}))+'</div><div class="tall">'+lvRows(S2.info)+'</div>'+lvEnd(S2.H,S2.s.end)
    +'<div class="talb"><button type="button" data-al="re">'+esc(T5(NX6.re))+'</button><button type="button" data-al="tm">'+esc(T5(LV6.b1))+'</button><button type="button" data-al="cx">'+esc(T5(LV6.b2))+'</button><button type="button" data-al="go">'+esc(T5(LV6.b3))+'</button></div>'
    +'<button type="button" class="talx" data-al="x">'+esc(T5(LV6.x))+'</button>';
  return h; }
// 날 di 의 장소 몇 곳(keys)을 다음 날로 — 미룬 곳 + 다음 날 일정을 합쳐 다음 날을 처음부터 다시(orderDay = 밤 장소 끝자리·문 여는 시각·마감 확인) · 마지막 날이면 하루 늘림 · AI 하루 설명은 지금처럼 다시 받기(보고서를 열 때 aiFetch 한 번)
//   전국 일정(11-06) — 같은 도시인 다음 날로만. 뒤 날이 다른 도시뿐이거나 마지막 날이 공항으로 떠나는 날이면 옮기지 않는다({none})
function liveMoveSet(di,keys){ var pl=TR.plan; if(!pl||!pl.days[di]) return null; var d=pl.days[di], rest=(keys||[]).filter(function(k){ return d.stops.indexOf(k)>=0; }); if(!rest.length) return {n:0,di:di+1};
  var j=-1; for(var q=di+1;q<pl.days.length;q++){ if(!pl.mc||pl.days[q].c===d.c){ j=q; break; } }
  var added=false;
  if(j<0){ if(pl.mc&&(di<pl.days.length-1||(pl.ap&&pl.ap.d))) return {none:1,n:rest.length};
    var x=new Date(d.date+"T00:00:00Z"); x.setUTCDate(x.getUTCDate()+1); var nd0={date:x.toISOString().slice(0,10),stops:[]}; if(pl.mc){ nd0.c=d.c; nd0.nc=d.c; if(d.nc==null||d.nc<0) d.nc=d.c; }
    pl.days.push(nd0); j=pl.days.length-1; added=true; TR.opt.n=pl.days.length; }
  d.stops=d.stops.filter(function(k){ return rest.indexOf(k)<0; }); if(d.date===kstToday(0)) d.gap="early";   // 오늘은 여기서 끝 — 「일찍 끝나는 날」 물음 대신 「숙소로 일찍 돌아가는 일정」
  var nd=pl.days[j], NX=dayX(pl,j,liveH()), all=nd.stops.concat(rest.filter(function(k){ return nd.stops.indexOf(k)<0; })).map(function(k){ return pl.pool[k]; }).filter(Boolean);
  var ord=orderDay(NX.H,all,NX.dt,NX.from,NX.to); nd.stops=ord.map(function(x){ return x.k; }); delete nd.gap; nd.end=sched(NX.H,ord,NX.dt,NX.from,{to:NX.to}).end;
  pl.ai=null; pl.at=Date.now(); save(); return {n:rest.length,di:j,added:added}; }
function liveMove(){ var S=liveState(); if(!S||!S.rest.length) return null; return liveMoveSet(S.L.di,S.rest.map(function(x){ return x.k; })); }
// 취소 — 남은 곳을 그날 일정에서만 뺀다(여행카트 TR.items 는 그대로)
function liveCancelSet(di,keys){ var pl=TR.plan; if(!pl||!pl.days[di]) return null; var d=pl.days[di], n0=d.stops.length; d.stops=d.stops.filter(function(k){ return (keys||[]).indexOf(k)<0; }); if(d.date===kstToday(0)) d.gap="early"; save(); return {n:n0-d.stops.length}; }
function liveCancel(){ var S=liveState(); if(!S||!S.rest.length) return null; return liveCancelSet(S.L.di,S.rest.map(function(x){ return x.k; })); }
// 끝까지 — 그대로, 이 내용으로는 오늘 다시 안 울림
function liveKeep(){ var S=liveState(); if(S){ LIVE.ack=LIVE.ack||{}; LIVE.ack[sigOf(S)]=1; liveSave(); } return {}; }
// 새로 짜기 (11-06 사장님 6) — 지금 시각·지금 자리부터 남은 곳 순서를 다시: 들어갈 수 있는 곳(문 열기·마감·쉬는 날·하루 끝 안) 수가 가장 많고, 같으면 일찍 끝나는 순서
//   남은 곳이 7곳 이하면 모든 순서를 다 짜 보고, 더 많으면 가까운 순 · 못 들어가는 곳은 뒤로 빼 두고 「내일로 옮길까요?」 · AI 는 다시 안 부른다(그날 설명만 감춤)
function liveRe(){ var S=liveState(); if(!S||!S.rest.length) return null; var pl=S.L.pl, d=S.L.d, lv=S.lv, arr=S.L.arr, dt=S.dt, HE=hE(S.H), E=S.E;
  var ax=arr[lv.i], R=lv.rec[ax.k]||{}, t0=R.d!=null?Math.max(R.d,lv.now):Math.max(lv.now,(R.a!=null?R.a:lv.now)+Math.round(ax.stay*lv.r),R.u!=null?R.u:0);
  var sim=function(ord){ var t=t0, p=ax, inc=[], out=[];
    ord.forEach(function(x){ var tt=t+lmin(lv,p,x), ok=true, wn=PERFK[x.k]?null:winOf(x,dt);
      if(wn){ if(wn.off) ok=false; else { var w=null; for(var i=0;i<wn.w.length;i++) if(tt<wn.w[i][1]){ w=wn.w[i]; break; } if(!w) ok=false; else if(tt<w[0]) tt=w[0]; } }
      var li=PERFK[x.k]?null:lastIn(FACT[x.k],dt); if(li!=null&&tt>li) ok=false;
      var st=Math.max(5,Math.round(x.stay*lv.r)); if(ok&&tt+st+(HE?legMin(x,HE):0)>E+LVTOL) ok=false;
      if(ok){ inc.push(x); t=tt+st; p=x; } else out.push(x); });
    return {inc:inc,out:out,end:t+(HE?legMin(p,HE):0)}; };
  var rest=S.rest.slice(), cand=rest.length<=7?perms(rest):[nnOrder(ax,rest)], best=null;
  cand.forEach(function(o){ var r=sim(o), sc=r.inc.length*100000-r.end; if(!best||sc>best.sc+1e-6) best={sc:sc,r:r}; });
  var before=d.stops.join(",");
  d.stops=arr.slice(0,lv.i+1).concat(best.r.inc,best.r.out).map(function(x){ return x.k; }); if(d.stops.join(",")!==before) d.aiX=1;
  save(); return {inc:best.r.inc.map(function(x){ return x.k; }),out:best.r.out.map(function(x){ return x.k; })}; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trAl [data-al]"); if(!a) return; e.preventDefault(); var v=a.dataset.al, b=document.getElementById("trAl");
  if(v==="x"){ if(b) b.remove(); return; }
  if(v==="view"){ if(b) b.remove(); try{ openReport(); }catch(z){} return; }
  var r;
  if(v==="rtm"||v==="rcx"){ var L=liveToday(), out=(ALS.res&&ALS.res.out)||[]; r=L?(v==="rtm"?liveMoveSet(L.di,out):liveCancelSet(L.di,out)):null; }
  else r=v==="tm"?liveMove():v==="cx"?liveCancel():v==="re"?liveRe():liveKeep();
  try{ ntap("_trip","live_"+v); }catch(z){}
  ALS.view="res"; ALS.res=Object.assign({kind:v},r||{}); if(b&&b._rb) b._rb();
  try{ if(document.getElementById("trRep")) repPaint(); }catch(z){} try{ nowPaint(); }catch(z){} },true);
// 위치 받기 감싸기 · 앱을 열 때·화면에 돌아올 때·5분마다 다시 판단 · 1분마다 「더 계시나요?」·첫 화면 카드 (11-06 — 숨겨진 동안에도 묻는다: 폰 알림)
(function(){ var f=window.meSet; if(typeof f!=="function"||f._lv) return; var g=function(p){ var r=f.apply(this,arguments); try{ if(p) liveTick(p); }catch(e){} return r; }; for(var k in f) g[k]=f[k]; g._lv=1; window.meSet=g; })();
setTimeout(function(){ try{ liveCheck("open"); }catch(e){} try{ nowPaint(); }catch(e){} },4000);
setInterval(function(){ if(!document.hidden) try{ liveCheck("tick"); }catch(e){} },5*60000);
setInterval(function(){ try{ askCheck("min"); }catch(e){} if(!document.hidden) try{ nowPaint(); }catch(e){} },60000);
document.addEventListener("visibilitychange",function(){ if(!document.hidden){ try{ liveCheck("show"); }catch(e){} try{ nowPaint(); }catch(e){} } });

// ══ 전국 일정 (사장님 2026-11-06 「AI의 능력을 보여줘」) ══
//  ① 도시 묶기 — 카트 장소를 위치로 묶는다(직선 30km 안끼리 이어 묶기 · 제주·울릉은 섬 하나) → 이름 = 가까운 도시(40km 안, CITYNM) · 없으면 지역 약도 이름
//  ② 도시 순서 — 도시 사이 이동 어림(열차·버스·항공 + 역 오가기) 합이 가장 작은 순서 (7곳까지 모든 순서) · 도착 공항이 있으면 공항 → 첫 도시, 출발 공항이 있으면 마지막 도시 → 공항도 더한다 · 같으면 먼저 담은 도시부터
//  ③ 날 배분 — 도시마다 머문 시간+이동(그 도시 장소 양), 모든 나누기 × 도시 이동을 아침/저녁에 하는 경우를 다 따져 넘침이 가장 적은 것 (저녁 이동은 23시까지 숙소 도착 · 날짜가 도시보다 적으면 가까운 도시끼리 한 날로)
//  ④ 도시 이동 칸 — 열차 = 허브 /train(TAGO 그날 시간표·어른 운임, 역에 닿는 시각 + 15분 뒤 첫 열차) · 역이 없거나 열차가 없으면 /nxcity(ODsay 도시 간 결과) · 섬 = 「항공 — 예약 필요」(시각·요금은 안 지어냄)
//     시간표를 못 받으면 「예상 ○시간 ○분 · 시간표 확인」 · 아침 이동 = 숙소 →(택시)→ 역 → 열차 → 역 →(택시)→ 다음 도시 숙소에 짐 두고 시작 · 저녁 이동 = 마지막 장소 → 역 → 열차 →(택시)→ 숙소
//  ⑤ 숙소 — 도시마다 하나(TR.opt.hotels[도시 id], 예전 숙소 하나 TR.opt.hotel 은 가까운 도시로) · 「여행 내내 이 숙소」(TR.opt.hAll) = 모든 밤 그 숙소
//  ⑥ 공항 — 도착: 국제선 입국 뒤 1시간 30분(국내선 45분)부터 그날 시작 · 출발: 국제선 3시간·국내선 1시간 30분 전 공항 도착에 맞춰 그날 끝
var LATE=23*60, NAT_LINK=30, NATH=null;
var CITYNM=[["seoul","서울","Seoul","ソウル","首尔","首爾","Seúl",37.5665,126.978],["incheon","인천","Incheon","仁川","仁川","仁川","Incheon",37.4563,126.7052],["suwon","수원","Suwon","水原","水原","水原","Suwon",37.2636,127.0286],
 ["busan","부산","Busan","釜山","釜山","釜山","Busan",35.1796,129.0756],["gyeongju","경주","Gyeongju","慶州","庆州","慶州","Gyeongju",35.8562,129.2247],["daegu","대구","Daegu","大邱","大邱","大邱","Daegu",35.8714,128.6014],
 ["daejeon","대전","Daejeon","大田","大田","大田","Daejeon",36.3504,127.3845],["gwangju","광주","Gwangju","光州","光州","光州","Gwangju",35.1595,126.8526],["ulsan","울산","Ulsan","蔚山","蔚山","蔚山","Ulsan",35.5384,129.3114],
 ["jeonju","전주","Jeonju","全州","全州","全州","Jeonju",35.8242,127.148],["gangneung","강릉","Gangneung","江陵","江陵","江陵","Gangneung",37.7519,128.8761],["sokcho","속초","Sokcho","束草","束草","束草","Sokcho",38.207,128.5918],
 ["chuncheon","춘천","Chuncheon","春川","春川","春川","Chuncheon",37.8813,127.7298],["yeosu","여수","Yeosu","麗水","丽水","麗水","Yeosu",34.7604,127.6622],["suncheon","순천","Suncheon","順天","顺天","順天","Suncheon",34.9507,127.4872],
 ["mokpo","목포","Mokpo","木浦","木浦","木浦","Mokpo",34.8118,126.3922],["andong","안동","Andong","安東","安东","安東","Andong",36.5684,128.7294],["pohang","포항","Pohang","浦項","浦项","浦項","Pohang",36.019,129.3435],
 ["tongyeong","통영","Tongyeong","統営","统营","統營","Tongyeong",34.8544,128.4331],["jeju","제주","Jeju","済州","济州","濟州","Jeju",33.4996,126.5312]];
// 공항 — 인천·김포 이름은 「공항 이용 안내」(airport.js·airport_i18n.js)와 같게 · ui = 일정 짜기 창에서 고르는 공항 · dom = 국내선(제주 오가는 항공 칸에 쓰는 공항)
var APT={icn:{ko:"인천국제공항",en:"Incheon International Airport",ja:"仁川国際空港",zhs:"仁川国际机场",zht:"仁川國際機場",es:"Aeropuerto Internacional de Incheon",lat:37.4491679,lng:126.4509204,ui:1,c:"ICN"},
 gmp:{ko:"김포국제공항",en:"Gimpo International Airport",ja:"金浦国際空港",zhs:"金浦国际机场",zht:"金浦國際機場",es:"Aeropuerto Internacional de Gimpo",lat:37.558677,lng:126.802781,ui:1,dom:1,c:"GMP"},
 pus:{ko:"김해국제공항",en:"Gimhae International Airport",ja:"金海国際空港",zhs:"金海国际机场",zht:"金海國際機場",es:"Aeropuerto Internacional de Gimhae",lat:35.1795,lng:128.9382,ui:1,dom:1,c:"PUS"},
 cju:{ko:"제주국제공항",en:"Jeju International Airport",ja:"済州国際空港",zhs:"济州国际机场",zht:"濟州國際機場",es:"Aeropuerto Internacional de Jeju",lat:33.5066,lng:126.4929,ui:1,dom:1,c:"CJU"},
 tae:{ko:"대구국제공항",en:"Daegu International Airport",ja:"大邱国際空港",zhs:"大邱国际机场",zht:"大邱國際機場",es:"Aeropuerto Internacional de Daegu",lat:35.8941,lng:128.6589,ui:1,dom:1,c:"TAE"},
 cjj:{ko:"청주국제공항",en:"Cheongju International Airport",ja:"清州国際空港",zhs:"清州国际机场",zht:"清州國際機場",es:"Aeropuerto Internacional de Cheongju",lat:36.7166,lng:127.4991,ui:1,dom:1,c:"CJJ"},
 kwj:{ko:"광주공항",en:"Gwangju Airport",ja:"光州空港",zhs:"光州机场",zht:"光州機場",es:"Aeropuerto de Gwangju",lat:35.1264,lng:126.8089,dom:1,c:"KWJ"},
 rsu:{ko:"여수공항",en:"Yeosu Airport",ja:"麗水空港",zhs:"丽水机场",zht:"麗水機場",es:"Aeropuerto de Yeosu",lat:34.8423,lng:127.6161,dom:1,c:"RSU"},
 usn:{ko:"울산공항",en:"Ulsan Airport",ja:"蔚山空港",zhs:"蔚山机场",zht:"蔚山機場",es:"Aeropuerto de Ulsan",lat:35.5935,lng:129.3518,dom:1,c:"USN"}};
var LG6s=["ko","en","ja","zhs","zht","es"];
function F6x(o,vf){ var r={}; LG6s.forEach(function(l){ var v=vf(l)||{}; r[l]=String(o[l]||o.en).replace(/\{(\w)\}/g,function(_,k){ return v[k]!=null?v[k]:""; }); }); return r; }   // 언어마다 다른 값으로 채우기 (🔔 알림 글)
function nmL(x,l){ if(!x) return ""; if(l==="ko") return x.ko; var p=x.k&&window.PLACES&&PLACES[x.k]; return (p&&p[l])||x[l]||x.en||x.ko; }
function durL(m,l){ var o=LANG; try{ window.LANG=l; return durTxt(m); }finally{ window.LANG=o; } }
var NX6={
 air:{ko:"항공 — 예약 필요",en:"Flight — booking needed",ja:"飛行機 — 予約が必要",zhs:"航班——需预订",zht:"航班——需預訂",es:"Vuelo: hay que reservar"},
 airEst:{ko:"비행 약 {d} (예상)",en:"about {d} in the air (estimate)",ja:"飛行 約{d}（目安）",zhs:"飞行约{d}（预计）",zht:"飛行約{d}（預計）",es:"unos {d} de vuelo (estimado)"},
 airChk:{ko:"시각·요금은 항공사에서 확인",en:"check times and fares with the airline",ja:"時刻・運賃は航空会社で確認",zhs:"时刻和票价请向航空公司确认",zht:"時刻和票價請向航空公司確認",es:"consulta horarios y tarifas con la aerolínea"},
 airLeg:{ko:"항공 약 {d} (예약 필요)",en:"Flight ~{d} (booking needed)",ja:"飛行機 約{d}（要予約）",zhs:"航班约{d}（需预订）",zht:"航班約{d}（需預訂）",es:"Vuelo ~{d} (hay que reservar)"},
 tago:{ko:"열차 시간표 (국토교통부 TAGO)",en:"Train timetable (MOLIT TAGO)",ja:"列車時刻表（国土交通部TAGO）",zhs:"列车时刻表（国土交通部TAGO）",zht:"列車時刻表（國土交通部TAGO）",es:"Horario de trenes (TAGO, Ministerio de Transporte)"},
 est:{ko:"예상 {d} · 시간표 확인",en:"about {d} · check the timetable",ja:"目安 {d}・時刻表を確認",zhs:"预计{d} · 请查看时刻表",zht:"預計{d} · 請查看時刻表",es:"unos {d} · consulta el horario"},
 bus:{ko:"버스 약 {d}",en:"Bus ~{d}",ja:"バス 約{d}",zhs:"大巴约{d}",zht:"巴士約{d}",es:"Autobús ~{d}"},
 bus5:{ko:"고속버스",en:"Express bus",ja:"高速バス",zhs:"高速大巴",zht:"高速巴士",es:"Autobús exprés"},
 bus6:{ko:"시외버스",en:"Intercity bus",ja:"市外バス",zhs:"城际大巴",zht:"城際巴士",es:"Autobús interurbano"},
 rail4:{ko:"열차",en:"Train",ja:"列車",zhs:"列车",zht:"列車",es:"Tren"},
 busChk:{ko:"시간표·좌석은 터미널·예매 사이트에서 확인 (ODsay 길찾기)",en:"check times and seats at the terminal or booking site (ODsay)",ja:"時刻・座席はターミナル・予約サイトで確認（ODsay）",zhs:"时刻和座位请在客运站或订票网站确认（ODsay）",zht:"時刻和座位請在客運站或訂票網站確認（ODsay）",es:"consulta horarios y plazas en la terminal o web de reservas (ODsay)"},
 miss:{ko:"막차({t})를 놓쳐요 — 장소를 빼거나 다음 날 아침으로 옮기세요",en:"You'll miss the last train ({t}) — remove a place or move to the next morning",ja:"終電（{t}）に間に合いません — 場所を減らすか翌朝に移してください",zhs:"会错过末班车（{t}）——请减少地点或改到第二天早上",zht:"會錯過末班車（{t}）——請減少地點或改到隔天早上",es:"Perderás el último tren ({t}): quita un lugar o pásalo a la mañana siguiente"},
 wTr:{ko:"이 날은 장소가 많아 열차 시간({t}까지 역 도착)에 늦어요 — 장소를 빼거나 날짜를 늘려 보세요",en:"Too many places — you'd reach the station after {t} — remove a place or add a day",ja:"場所が多く、列車の時間（{t}までに駅到着）に遅れます — 場所を減らすか日数を増やしてください",zhs:"地点太多，会赶不上火车（{t}前到站）——请减少地点或增加天数",zht:"地點太多，會趕不上火車（{t}前到站）——請減少地點或增加天數",es:"Demasiados lugares: llegarías a la estación después de las {t}. Quita un lugar o añade un día"},
 wAp:{ko:"이 날은 장소가 많아 공항 도착 시각({t})에 늦어요 — 장소를 빼 주세요",en:"Too many places — you'd reach the airport after {t} — remove a place",ja:"場所が多く、空港到着時刻（{t}）に遅れます — 場所を減らしてください",zhs:"地点太多，会晚于{t}到达机场——请减少地点",zht:"地點太多，會晚於{t}到達機場——請減少地點",es:"Demasiados lugares: llegarías al aeropuerto después de las {t}. Quita un lugar"},
 apA:{ko:"{a} 도착 {f} · 입국 뒤 {t} 출발",en:"Land at {a} {f} · leave the airport {t}",ja:"{a} {f}着・入国後 {t}出発",zhs:"{f}抵达{a} · 入境后{t}出发",zht:"{f}抵達{a} · 入境後{t}出發",es:"Llegada a {a} {f} · salida del aeropuerto {t}"},
 apA0:{ko:"{a}에서 출발",en:"Start from {a}",ja:"{a}から出発",zhs:"从{a}出发",zht:"從{a}出發",es:"Salida desde {a}"},
 apD:{ko:"{a} 도착",en:"Arrive at {a}",ja:"{a}に到着",zhs:"到达{a}",zht:"到達{a}",es:"Llegada a {a}"},
 apDi:{ko:"{f} 국제선 — 3시간 전({b})까지 공항에",en:"{f} international flight — be at the airport by {b} (3 h before)",ja:"{f} 国際線 — 3時間前（{b}）までに空港へ",zhs:"{f}国际航班——请于3小时前（{b}）到达机场",zht:"{f}國際航班——請於3小時前（{b}）到達機場",es:"Vuelo internacional {f}: estar en el aeropuerto antes de las {b} (3 h antes)"},
 apDd:{ko:"{f} 국내선 — 1시간 30분 전({b})까지 공항에",en:"{f} domestic flight — be at the airport by {b} (1 h 30 min before)",ja:"{f} 国内線 — 1時間30分前（{b}）までに空港へ",zhs:"{f}国内航班——请于1小时30分钟前（{b}）到达机场",zht:"{f}國內航班——請於1小時30分鐘前（{b}）到達機場",es:"Vuelo nacional {f}: estar en el aeropuerto antes de las {b} (1 h 30 min antes)"},
 apD0:{ko:"비행기 시각을 넣으면 공항 도착 시각에 맞춰 짜요",en:"Add your flight time to plan around it",ja:"便の時刻を入れると空港到着に合わせて組みます",zhs:"填写航班时间后会按到达机场的时间安排",zht:"填寫航班時間後會按到達機場的時間安排",es:"Añade la hora del vuelo para planificar según ella"},
 st0:{ko:"{h} 출발",en:"Leave {h}",ja:"{h}を出発",zhs:"从{h}出发",zht:"從{h}出發",es:"Salida de {h}"},
 st:{ko:"{h} 출발 (짐 챙기기)",en:"Leave {h} (with luggage)",ja:"{h}を出発（荷物を持って）",zhs:"从{h}出发（带上行李）",zht:"從{h}出發（帶上行李）",es:"Salida de {h} (con equipaje)"},
 drop:{ko:"{h} — 짐 두기",en:"{h} — drop off luggage",ja:"{h} — 荷物を預ける",zhs:"{h}——寄放行李",zht:"{h}——寄放行李",es:"{h}: dejar el equipaje"},
 bagTip:{ko:"짐은 아침에 숙소나 역 물품보관함에 맡겨 두면 편해요",en:"Tip: leave your luggage at the hotel or a station locker in the morning",ja:"荷物は朝に宿や駅のコインロッカーに預けると楽です",zhs:"建议早上把行李寄存在住处或车站储物柜",zht:"建議早上把行李寄放在住處或車站置物櫃",es:"Consejo: deja el equipaje por la mañana en el hotel o en una consigna de la estación"},
 noH:{ko:"{c} 숙소를 아직 안 정했어요",en:"No lodging yet in {c}",ja:"{c}の宿がまだ決まっていません",zhs:"{c}的住宿还没定",zht:"{c}的住宿還沒定",es:"Aún no hay alojamiento en {c}"},
 hPick:{ko:"숙소 찾기",en:"Find lodging",ja:"宿を探す",zhs:"查找住宿",zht:"查找住宿",es:"Buscar alojamiento"},
 night:{ko:"{n}일 밤 · {c} · {h}",en:"Night {n} · {c} · {h}",ja:"{n}日目の夜・{c}・{h}",zhs:"第{n}晚 · {c} · {h}",zht:"第{n}晚 · {c} · {h}",es:"Noche {n} · {c} · {h}"},
 nightX:{ko:"숙소 미정",en:"lodging not set",ja:"宿未定",zhs:"住宿未定",zht:"住宿未定",es:"sin alojamiento"},
 nomv:{ko:"다음 날은 다른 도시라 옮길 수 없어요 — 취소하거나 일정을 다시 짜 주세요",en:"The next day is in another city, so we can't move them — cancel them or re-plan",ja:"翌日は別の都市なので移せません — キャンセルするか日程を組み直してください",zhs:"第二天在另一座城市，无法移过去——请取消或重新安排",zht:"隔天在另一座城市，無法移過去——請取消或重新安排",es:"El día siguiente es en otra ciudad, no podemos moverlos: cancélalos o replanifica"},
 re:{ko:"새로 짜기",en:"Re-plan the rest",ja:"組み直す",zhs:"重新安排",zht:"重新安排",es:"Replanificar"},
 reD:{ko:"지금 시각과 마감에 맞춰 남은 곳 순서를 다시 짰어요 (들어갈 수 있는 곳부터)",en:"Re-ordered the rest of today for the time left and closing times (places you can still get into first)",ja:"今の時刻と閉店時刻に合わせて残りの順番を組み直しました（入れる場所から）",zhs:"已按当前时间和关门时间重新安排剩余地点（先去来得及的地方）",zht:"已按目前時間和關門時間重新安排剩餘地點（先去來得及的地方）",es:"Reordenamos lo que queda según la hora y los cierres (primero donde aún puedes entrar)"},
 reOut:{ko:"오늘은 시간이 모자란 곳: {l} — 내일로 옮길까요?",en:"Won't fit in today: {l} — move to tomorrow?",ja:"今日は時間が足りない場所：{l} — 明日に移しますか？",zhs:"今天时间不够：{l}——要改到明天吗？",zht:"今天時間不夠：{l}——要改到明天嗎？",es:"Hoy no da tiempo: {l}. ¿Lo pasamos a mañana?"},
 book:{ko:"예약·결제는 {s}에서 합니다 — 투어앱은 예약 당사자가 아닙니다",en:"Booking and payment are made on {s} — the tour app is not a party to the booking",ja:"予約・決済は{s}で行います — ツアーアプリは予約の当事者ではありません",zhs:"预订和付款在{s}完成——旅游应用不是预订当事方",zht:"預訂和付款在{s}完成——旅遊應用程式不是預訂當事方",es:"La reserva y el pago se hacen en {s}; la app de viajes no es parte de la reserva"},
 sites:{ko:"각 예약 사이트",en:"each booking site",ja:"各予約サイト",zhs:"各预订网站",zht:"各預訂網站",es:"cada web de reservas"}};
var TX6={m:{ko:"택시 약 {m}",en:"Taxi ~{m}",ja:"タクシー 約{m}",zhs:"出租车约{m}",zht:"計程車約{m}",es:"Taxi ~{m}"},
 fr:{ko:"{f} (네이버 길찾기)",en:"{f} (Naver)",ja:"{f}（NAVER）",zhs:"{f}（NAVER）",zht:"{f}（NAVER）",es:"{f} (Naver)"},
 fe:{ko:"약 {f}",en:"~{f}",ja:"約{f}",zhs:"约{f}",zht:"約{f}",es:"~{f}"},
 short:{ko:"짧은 구간",en:"short ride",ja:"短い区間",zhs:"短途",zht:"短程",es:"trayecto corto"},
 night:{ko:"밤늦게",en:"late night",ja:"深夜",zhs:"深夜",zht:"深夜",es:"de noche"},
 bag:{ko:"짐 있는 날",en:"with luggage",ja:"荷物あり",zhs:"带行李",zht:"帶行李",es:"con equipaje"},
 live:{ko:"실시간 교통",en:"live traffic",ja:"リアルタイム交通",zhs:"实时路况",zht:"即時路況",es:"tráfico en vivo"}};
function moX(di,X){ var m=mealsOf(di); if(X&&X.to!=null) m.to=X.to; return m; }
function cnm(c){ return !c?"":LANG==="ko"?c.ko:(c[LANG]||c.en||c.ko); }
function ptNm(p){ if(!p) return ""; if(p.k&&!/^__/.test(p.k)) return nm(p); return LANG==="ko"?p.ko:(p[LANG]||p.en||p.ko); }
function won(n){ return (+n||0).toLocaleString()+T("원"," KRW"); }
function legGo(lg){ return (lg&&lg.mode!=="walk"&&lg.mode!=="air")?' <a href="#" class="tlgo">· '+T("실제 경로 보기","See real routes")+'</a>':''; }
function hpOf(H){ var E=hE(H), S=hS(H); if(E&&(E.hotel||E.k==="__hotel")) return E; if(S&&(S.hotel||S.k==="__hotel")) return S; return null; }
function hm4(s){ s=String(s||""); return (+s.slice(0,2))*60+(+s.slice(2,4)); }
function railMin(d){ return Math.round(15+0.43*d); } function busMin(d){ return Math.round(20+0.75*d); } function flyMin(d){ return Math.round(25+d/10); }
var APC={};
function apPt(id){ var a=APT[id]; if(!a) return null; return APC[id]||(APC[id]={k:"__ap_"+id,ko:a.ko,en:a.en,ja:a.ja,zhs:a.zhs,zht:a.zht,es:a.es,lat:a.lat,lng:a.lng,ap:id}); }
function apNm(id){ var a=APT[id]; return a?(a[LANG]||a.en):""; }
function nearAp(p){ var b=null, bd=1e9; for(var id in APT){ if(!APT[id].dom) continue; var d=km(p,APT[id]); if(d<bd){ bd=d; b=id; } } return b?apPt(b):null; }
function kxs(){ return Array.isArray(window.KXS)?window.KXS:[]; }
var STC={};
function stPt(i){ var s=kxs()[i]; if(!s) return null; if(STC[s[1]]) return STC[s[1]]; var cl=function(v){ return String(v||"").replace(/\s*\(.*\)\s*$/,""); }, e=cl(s[4]);
  return STC[s[1]]={k:"__st_"+s[1],ko:s[0]+"역",en:e+" Station",ja:cl(s[5])+"駅",zhs:cl(s[6])+"站",zht:cl(s[7])+"站",es:"Estación "+e,lat:s[2],lng:s[3],code:s[1],st:1}; }
function nearSt(p,maxKm){ var b=-1, bd=1e9; kxs().forEach(function(s,i){ var d=km(p,{lat:s[2],lng:s[3]}); if(d<bd){ bd=d; b=i; } }); return b>=0&&bd<=(maxKm||45)?stPt(b):null; }
function cityPt(c){ return {k:"__ct_"+c.id,ko:c.ko,en:c.en,ja:c.ja,zhs:c.zhs,zht:c.zht,es:c.es,lat:+c.lat,lng:+c.lng,ct:1}; }
// 숙소 점 — 도시마다 하나 · 같은 숙소면 같은 점(그날 출발점과 도착점이 같은지 알아보려고)
var HPC={};
function hotelPt(pl,ci){ var c=pl&&pl.cities&&pl.cities[ci]; if(!c||!c.h) return null; var h=c.h;
  if(h.type==="here") return (REPH&&REPH.here)?REPH:((NATH&&NATH.here)?NATH:null);
  var key=c.id+"|"+h.ko+"|"+h.lat+"|"+h.lng; if(HPC[ci]&&HPC[ci].key===key) return HPC[ci].p;
  var p={k:"__ht"+ci,ko:h.ko,en:h.en||h.ko,lat:+h.lat,lng:+h.lng,addr:h.addr||"",hotel:1,ci:ci}; HPC[ci]={key:key,p:p}; return p; }
function natPt(pl,k){ if(!pl) return null; var m=/^__ht(\d+)$/.exec(k); if(m) return hotelPt(pl,+m[1]); m=/^__ap_(\w+)$/.exec(k); if(m) return apPt(m[1]);
  var f=null; (pl.tr||[]).forEach(function(t){ if(t.sa&&t.sa.k===k) f=t.sa; if(t.sb&&t.sb.k===k) f=t.sb; }); if(f) return f;
  m=/^__ct_(.+)$/.exec(k); if(m&&pl.cities) pl.cities.forEach(function(c){ if(c.id===m[1]) f=cityPt(c); }); return f; }
function bagLeg(a,b,t){ var d=km(a,b); if(d<=0.5) return {mode:"walk",km:d,min:Math.max(3,Math.round(d*1.3/4.5*60))}; return txLeg(a,b,"bag",t); }
function apOpt(){ var a=TR.opt&&TR.opt.ap; if(!a||typeof a!=="object") return {}; var c=function(q){ return q&&APT[q.id]?{id:q.id,t:hm2m(q.t),k:q.k==="d"?"d":"i"}:null; }; return {a:c(a.a),d:c(a.d)}; }
// ① 도시 묶기
function natGroups(P){ var n=P.length, par=[], f=function(i){ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }, i, j;
  for(i=0;i<n;i++) par.push(i);
  for(i=0;i<n;i++) for(j=i+1;j<n;j++){ var ia=isleOf(P[i]), ib=isleOf(P[j]); if(ia!==ib) continue; if(ia!=="land"||km(P[i],P[j])<=NAT_LINK){ var x=f(i), y=f(j); if(x!==y) par[y]=x; } }
  var m={}, G=[]; for(i=0;i<n;i++){ var r=f(i); if(!m[r]){ m[r]={pts:[],first:i}; G.push(m[r]); } m[r].pts.push(P[i]); }
  var used={};
  G.forEach(function(g,gi){ g.lat=g.pts.reduce(function(s,x){ return s+(+x.lat); },0)/g.pts.length; g.lng=g.pts.reduce(function(s,x){ return s+(+x.lng); },0)/g.pts.length; g.isle=isleOf(g.pts[0]);
    var c=natCity(g,gi), id=c.id; if(used[id]){ used[id]++; id=id+"-"+used[id]; } else used[id]=1; g.id=id; g.nm=c; });
  return G; }
function nmOf(c){ return {id:c[0],ko:c[1],en:c[2],ja:c[3],zhs:c[4],zht:c[5],es:c[6]}; }
function natCity(g,gi){ var b=null, bd=1e9, i;
  if(g.isle==="jeju"){ for(i=0;i<CITYNM.length;i++) if(CITYNM[i][0]==="jeju") return nmOf(CITYNM[i]); }
  CITYNM.forEach(function(c){ var d=km(g,{lat:c[7],lng:c[8]}); if(d<bd){ bd=d; b=c; } }); if(b&&bd<=40) return nmOf(b);
  var best=null, ba=1e9; for(var id in (window.CITY||{})){ var q=CITY[id]; if(!q||!q.bb||(q.parent!=="kr"&&q.parent!==window.NAVI_ROOT)) continue; var bb=q.bb;
    if(g.lat>=bb[0]&&g.lat<=bb[2]&&g.lng>=bb[1]&&g.lng<=bb[3]){ var ar=(bb[2]-bb[0])*(bb[3]-bb[1]); if(ar<ba){ ba=ar; best=id; } } }
  if(best){ var q2=CITY[best]; return {id:best,ko:q2.ko,en:q2.en||q2.ko,ja:q2.ja||q2.en,zhs:q2.zhs||q2.en,zht:q2.zht||q2.en,es:q2.es||q2.en}; }
  return {id:"area"+(gi+1),ko:"지역 "+(gi+1),en:"Area "+(gi+1),ja:"地域"+(gi+1),zhs:"地区"+(gi+1),zht:"地區"+(gi+1),es:"Zona "+(gi+1)}; }
// 도시마다 숙소 — TR.opt.hotels[id](정한 것 · null = 「정하지 않음」으로 고른 것) → 예전 숙소 하나는 40km 안 가장 가까운 도시로 · 「여행 내내」면 모든 도시에
function natHotels(G,H){ var o=TR.opt, hs=o.hotels||{}, one=o.hotel, oneG=null, bd=1e9;
  if(one&&one.type!=="here"&&isFinite(+one.lat)) G.forEach(function(g){ var d=km(g,{lat:+one.lat,lng:+one.lng}); if(d<bd){ bd=d; oneG=g; } });
  else if(one&&one.type==="here"&&H&&H.here) G.forEach(function(g){ var d=km(g,H); if(d<bd){ bd=d; oneG=g; } });
  if(bd>40) oneG=null;
  G.forEach(function(g){ if(o.hAll&&one) g.h=one.type==="here"?{type:"here"}:one; else if(Object.prototype.hasOwnProperty.call(hs,g.id)) g.h=hs[g.id]||null; else if(g===oneG) g.h=one.type==="here"?{type:"here"}:one; else g.h=null; }); }
function gAnchor(g){ return (g.h&&g.h.type!=="here"&&isFinite(+g.h.lat))?{lat:+g.h.lat,lng:+g.h.lng,c:g}:{lat:g.lat,lng:g.lng,c:g}; }
// 도시 사이 이동 한 칸 — 섬을 건너면 항공 · 두 쪽 다 KTX·SRT 역(45km 안)이 있고 다르면 열차 · 아니면 버스(ODsay)
function natTr(pa,pb,a,b){ var kind, sa, sb, ca=pa.c?cityPt({id:pa.c.id,ko:pa.c.nm.ko,en:pa.c.nm.en,ja:pa.c.nm.ja,zhs:pa.c.nm.zhs,zht:pa.c.nm.zht,es:pa.c.nm.es,lat:pa.c.lat,lng:pa.c.lng}):pa, cb=pb.c?cityPt({id:pb.c.id,ko:pb.c.nm.ko,en:pb.c.nm.en,ja:pb.c.nm.ja,zhs:pb.c.nm.zhs,zht:pb.c.nm.zht,es:pb.c.nm.es,lat:pb.c.lat,lng:pb.c.lng}):pb;
  if(isleOf(pa)!==isleOf(pb)){ kind="air"; sa=pa.ap?pa:nearAp(pa); sb=pb.ap?pb:nearAp(pb); }
  else { var s1=pa.ap?null:nearSt(pa,45), s2=pb.ap?null:nearSt(pb,45); if(s1&&s2&&s1.code!==s2.code){ kind="rail"; sa=s1; sb=s2; } else { kind="bus"; sa=s1||ca; sb=s2||cb; } }
  var d=km(sa,sb); return {a:a,b:b,kind:kind,sa:sa,sb:sb,d:Math.round(d),est:kind==="rail"?railMin(d):kind==="air"?flyMin(d):busMin(d),list:null,bus:null,st:""}; }
function trDoor(tr){ return tr.kind==="air"?30+60+tr.est+20+30:25+15+tr.est+25; }   // 숙소에서 숙소까지 어림(역·공항 오가기·기다림 포함)
function apCost(A,p){ var d=km(A,p); return d<=80?Math.round(25+d*1.1):trDoor(natTr(A,p,-1,0)); }
// ② 도시 순서
function natOrder(G,A,Dp){ var k=G.length; if(k<2) return G.slice(); var an=G.map(gAnchor), M=[], i, j;
  for(i=0;i<k;i++){ M.push([]); for(j=0;j<k;j++) M[i].push(i===j?0:trDoor(natTr(an[i],an[j],i,j))); }
  var ca=an.map(function(p){ return A?apCost(A,p):0; }), cd=an.map(function(p){ return Dp?apCost(Dp,p):0; }), idx=G.map(function(_,q){ return q; }), best=null, bc=1e18;
  var cands=k<=7?perms(idx):(function(){ var left=idx.slice(1), o=[0]; while(left.length){ var p=o[o.length-1], bi=0; left.forEach(function(x,q){ if(M[p][x]<M[p][left[bi]]) bi=q; }); o.push(left.splice(bi,1)[0]); } return [o]; })();
  cands.forEach(function(o){ var c=ca[o[0]]+cd[o[k-1]]+G[o[0]].first*1e-3; for(var q=0;q+1<k;q++) c+=M[o[q]][o[q+1]]; if(c<bc-1e-9){ bc=c; best=o; } });
  return best.map(function(q){ return G[q]; }); }
// 날짜가 도시보다 적으면 — 이동이 가장 짧은 이웃 두 도시를 한 묶음으로 (섬은 되도록 안 합친다)
function natMerge(ord){ var bi=0, bc=1e18, i;
  for(i=0;i+1<ord.length;i++){ var c=trDoor(natTr(gAnchor(ord[i]),gAnchor(ord[i+1]),0,1))+(ord[i].isle!==ord[i+1].isle?1e5:0); if(c<bc){ bc=c; bi=i; } }
  var a=ord[bi], b=ord[bi+1], n1=a.pts.length, n2=b.pts.length, g={pts:a.pts.concat(b.pts),first:Math.min(a.first,b.first),lat:(a.lat*n1+b.lat*n2)/(n1+n2),lng:(a.lng*n1+b.lng*n2)/(n1+n2),isle:a.isle,id:a.id+"+"+b.id,h:a.h||b.h,nm:{id:a.id+"+"+b.id}};
  LG6s.forEach(function(l){ g.nm[l]=a.nm[l]+"·"+b.nm[l]; }); ord.splice(bi,2,g); }
// ③ 날 배분 — L=도시별 일 양(분) · T=이웃 도시 이동(분) · 저녁 이동은 23시(LATE)까지 숙소 도착이 되게 그날 장소를 줄이고, 아침 이동은 그날 시작이 늦어진다
function natAlloc(L,T,D,cap,red0,redN,to){ var k=L.length; if(k<=1) return {n:[D],f:[]};
  var best=null, bs=1e18, n=[];
  var SL=L.reduce(function(a,x){ return a+Math.max(30,x); },0), ST=D*cap-red0-redN;   // 남는 날은 장소 양에 비례해서 (11-06 — 장소 하나뿐인 도시에 빈 날이 몰리지 않게)
  var evalc=function(){ for(var m=0;m<(1<<(k-1));m++){ var f=[], s=0, b, i; for(b=0;b<k-1;b++) f.push((m>>b)&1?"am":"pm");
      for(i=0;i<k;i++){ var base=n[i]*cap-(i===0?red0:0)-(i===k-1?redN:0), av=base, tg=ST*Math.max(30,L[i])/SL; if(i>0&&f[i-1]==="am") av-=T[i-1]; if(i<k-1&&f[i]==="pm") av-=Math.max(0,to-(LATE-T[i]));
        s+=10*Math.max(0,L[i]-av)+0.02*Math.abs(base-tg); if(i<k-1&&f[i]==="am") s+=3; }   // 넘침이 같으면 저녁 이동 · 남는 시간은 장소 양에 비례
      if(s<bs-1e-9){ bs=s; best={n:n.slice(),f:f}; } } };
  var rec=function(i,left){ if(i===k-1){ n[i]=left; evalc(); return; } for(var v=1;v<=left-(k-1-i);v++){ n[i]=v; rec(i+1,left-v); } };
  rec(0,D); return best; }
function natPlan(H,Dn){ var o=TR.opt, D=Math.max(1,Dn||o.n), from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), skip=[];
  var P=TR.items.filter(function(it){ var c=catOf(it); if(c==="hotel"||c==="trans"){ skip.push(it); return false; } return true; }).map(function(it){ return Object.assign({},it,{stay:stayOf(it)}); });
  if(!P.length) return null;
  var ap=apOpt(), G=natGroups(P); if(G.length<2&&!ap.a&&!ap.d) return null;   // 도시 하나·공항 없음 = 예전 길
  if(o.hAll&&o.hotel&&G.length>1){ if(!ap.a&&!ap.d) return null; while(G.length>1){ var g0=G.shift(), g1=G.shift(); G.unshift({pts:g0.pts.concat(g1.pts),first:Math.min(g0.first,g1.first),lat:(g0.lat+g1.lat)/2,lng:(g0.lng+g1.lng)/2,isle:g0.isle,id:g0.id+"+"+g1.id,nm:(function(){ var q={id:g0.id+"+"+g1.id}; LG6s.forEach(function(l){ q[l]=g0.nm[l]+"·"+g1.nm[l]; }); return q; })()}); } }   // 「여행 내내 이 숙소」 = 한 숙소에서 오가는 일정
  NATH=H&&H.here?H:null; natHotels(G,H);
  var A=ap.a?apPt(ap.a.id):null, Dp=ap.d?apPt(ap.d.id):null, ord=natOrder(G,A,Dp);
  while(ord.length>D) natMerge(ord);
  var k=ord.length, TRS=[], T=[], i;
  for(i=0;i+1<k;i++){ var tr=natTr(gAnchor(ord[i]),gAnchor(ord[i+1]),i,i+1); TRS.push(tr); T.push(trDoor(tr)); }
  var apIn=A&&km(A,ord[0])>80?natTr(A,gAnchor(ord[0]),-1,0):null, apOut=Dp&&km(Dp,ord[k-1])>80?natTr(gAnchor(ord[k-1]),Dp,k-1,-2):null;   // 공항이 첫·마지막 도시에서 80km 넘게 떨어지면 공항 ↔ 도시도 도시 이동 칸
  var red0=0, redN=0;
  if(A){ var ex=ap.a.t!=null?ap.a.t+(ap.a.k==="d"?45:90):from; red0=Math.max(0,ex-from)+(apIn?trDoor(apIn):Math.round(25+km(A,ord[0])*1.1)); }
  if(Dp){ var by=ap.d.t!=null?ap.d.t-(ap.d.k==="d"?90:180):to; redN=Math.max(0,to-by)+(apOut?trDoor(apOut):Math.round(25+km(Dp,ord[k-1])*1.1)); }
  var L=ord.map(function(g){ var hp=g.h&&g.h.type!=="here"&&isFinite(+g.h.lat)?{lat:+g.h.lat,lng:+g.h.lng}:null; return dayLoad(hp,g.pts); });
  var al=natAlloc(L,T,D,cap-60,red0,redN,to);
  var pl={v:1,mc:1,at:Date.now(),from:from,to:to,hotel:o.hotel&&o.hotel.type!=="here"?o.hotel:(o.hotel?{type:"here"}:null),days:[],pool:{},skip:skip.map(function(x){ return x.k; }),ai:null,tr:[],
    cities:ord.map(function(g){ return {id:g.id,ko:g.nm.ko,en:g.nm.en,ja:g.nm.ja,zhs:g.nm.zhs,zht:g.nm.zht,es:g.nm.es,lat:Math.round(g.lat*1e5)/1e5,lng:Math.round(g.lng*1e5)/1e5,isle:g.isle,h:g.h||null}; }),ap:(ap.a||ap.d)?{a:ap.a,d:ap.d}:null};
  P.forEach(function(x){ pl.pool[x.k]=x; });
  var di=0; ord.forEach(function(g,ci){ for(var j=0;j<al.n[ci];j++){ pl.days.push({date:dayDate(di).toISOString().slice(0,10),stops:[],c:ci,nc:ci}); di++; } });
  var firstD=function(ci){ for(var q=0;q<pl.days.length;q++) if(pl.days[q].c===ci) return q; return -1; }, lastD=function(ci){ for(var q=pl.days.length-1;q>=0;q--) if(pl.days[q].c===ci) return q; return -1; };
  TRS.forEach(function(tr,bi){ tr.w=al.f[bi]; if(tr.w==="pm"){ tr.di=lastD(bi); pl.days[tr.di].pm=pl.tr.length; pl.days[tr.di].nc=bi+1; } else { tr.di=firstD(bi+1); pl.days[tr.di].am=pl.tr.length; } pl.tr.push(tr); });
  if(apIn&&pl.days[0].am==null){ apIn.w="am"; apIn.di=0; pl.days[0].am=pl.tr.length; pl.tr.push(apIn); }
  if(Dp){ var ld=pl.days.length-1; pl.days[ld].nc=-1; if(apOut&&pl.days[ld].pm==null){ apOut.w="pm"; apOut.di=ld; pl.days[ld].pm=pl.tr.length; pl.tr.push(apOut); } }
  // 도시마다 장소를 그 도시 날로 나눈다 — 가벼운 묶음은 이동·공항으로 짧아진 날에, 쉬는 날 겹침이 가장 적게
  ord.forEach(function(g,ci){ var ds=[]; pl.days.forEach(function(d,q){ if(d.c===ci) ds.push(q); }); if(!ds.length) return;
    var hp=hotelPt(pl,ci), gs=ds.length===1?[g.pts.slice()]:splitDays(hp,g.pts,ds.length,cap); while(gs.length<ds.length) gs.push([]);
    var av=ds.map(function(q){ var X=dayX(pl,q,H); return Math.max(30,(X.lim!=null?Math.min(X.lim,to):to)-X.from); }), dates=ds.map(function(q){ return new Date(pl.days[q].date+"T00:00:00Z"); });
    var idx=gs.map(function(_,q){ return q; }), bp=idx, bb=1e18;
    (ds.length<=7?perms(idx):[idx]).forEach(function(pm){ var sc0=0; pm.forEach(function(gi,k2){ var g2=gs[gi], ld2=g2.length?dayLoad(hp,g2):0; sc0+=g2.filter(function(x){ return closedOn(x,dates[k2]); }).length*1000+Math.max(0,ld2-av[k2])*2+(gi!==k2?0.01:0); }); if(sc0<bb){ bb=sc0; bp=pm; } });
    var gg=bp.map(function(gi){ return gs[gi].slice(); });
    gg.forEach(function(arr,k2){ arr.slice().forEach(function(x){ if(!closedOn(x,dates[k2])) return; var bj=-1, bc2=1e9; gg.forEach(function(h2,k3){ if(k3===k2||closedOn(x,dates[k3])) return; var c=dayLoad(hp,h2.concat([x]))-dayLoad(hp,h2); if(c<bc2){ bc2=c; bj=k3; } }); if(bj>=0){ arr.splice(arr.indexOf(x),1); gg[bj].push(x); } }); });
    gg.forEach(function(arr,k2){ pl.days[ds[k2]].stops=arr.map(function(x){ return x.k; }); }); });
  pl.days.forEach(function(d,q){ var X=dayX(pl,q,H); if(!X.arr.length) return; var od=orderDay(X.H,X.arr,X.dt,X.from,X.to); d.stops=od.map(function(x){ return x.k; }); d.end=sched(X.H,od,X.dt,X.from,{to:X.to}).end; });
  return pl; }
// 그날 틀 — {H:출발점·도착점, from:시작 분, to:하루 끝, lim:늦어도 되는 끝(막차·공항), pre:[아침 줄], pmTr:저녁 이동, apD:출발 공항} · 옛 일정은 예전 값 그대로
// 출발점 (사장님 11-06 「가」) — 오늘 일정 = 지금 내 위치(「나」 ME.pos · 보고서가 받은 위치 GEO)에서 · 위치를 모르거나 그날 장소에서 80km 넘게 떨어져 있으면 숙소에서
//   다른 날 = 전날 밤 숙소에서(미리 보기) — 그날 아침 앱을 열면 그날이 「오늘」이 되어 내 위치로 다시 계산된다 · 끝은 늘 그날 밤 숙소
var MEC=null;
function mePt(){ var mp=(window.ME&&ME.pos)||GEO; if(!mp) return null; if(MEC&&MEC.lat===+mp[0]&&MEC.lng===+mp[1]) return MEC; return MEC={k:"__me",ko:"현재 위치",en:"Current location",lat:+mp[0],lng:+mp[1],me:1}; }
function meFor(d,arr){ if(!d||d.date!==kstToday(0)||OLD()) return null; var me=mePt(); if(!me||!arr.length) return null; var near=arr.some(function(x){ return km(me,x)<=80; }); return near?me:null; }
function dayX(pl,di,H0){ var d=pl.days[di], dt=new Date(d.date+"T00:00:00Z"), arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean);
  if(!pl.mc){ var me0=meFor(d,arr); return {H:me0?hPair(me0,hE(H0)):H0,from:pl.from,to:pl.to,dt:dt,arr:arr,me:me0?1:0}; }
  var X={mc:1,dt:dt,arr:arr,from:pl.from,to:pl.to,lim:null,pre:[],city:d.c}, t=pl.from, S=null;
  if(di===0&&pl.ap&&pl.ap.a){ var A=apPt(pl.ap.a.id), ta=pl.ap.a.t; S=A; if(ta!=null) t=Math.max(pl.from,ta+(pl.ap.a.k==="d"?45:90)); X.pre.push({ap:"a",p:A,t:t,ft:ta}); }
  else { var pc=di>0?pl.days[di-1].nc:d.c; S=(pc!=null&&pc>=0)?hotelPt(pl,pc):null; var me1=meFor(d,arr.length?arr:(d.am!=null&&pl.tr[d.am]?[pl.tr[d.am].sa]:[])); if(me1){ S=me1; X.me=1; } }
  if(d.am!=null&&pl.tr[d.am]){ var st0=(!X.pre.length&&S)?{start:1,p:S,t:t}:null; var r=trRun(pl,pl.tr[d.am],S,t); if(st0){ if(r.rows.ts!=null) st0.t=r.rows.ts; X.pre.push(st0); } X.pre=X.pre.concat(r.rows); S=r.S; t=r.t; }
  X.from=t;
  var E=null;
  if(d.pm!=null&&pl.tr[d.pm]){ var tp=pl.tr[d.pm]; E=tp.sa; X.pmTr=tp; X.lim=pmLim(pl,tp); }
  else if(di===pl.days.length-1&&pl.ap&&pl.ap.d){ E=apPt(pl.ap.d.id); var td=pl.ap.d.t; X.lim=td!=null?td-(pl.ap.d.k==="d"?90:180):null; X.apD={p:E,ft:td,by:X.lim,k:pl.ap.d.k}; }
  else { var nc=d.nc!=null?d.nc:d.c; E=nc>=0?hotelPt(pl,nc):null; }
  X.H=hPair(S,E); return X; }
// 저녁 이동이 있는 날 늦어도 되는 역 도착 — 열차 시간표가 있으면 막차 15분 전, 없으면 23시에 숙소 도착이 되게(공항으로 가면 비행기 시각에 맞춰)
function pmLim(pl,tr){ var L=tr.list; if(tr.kind==="rail"&&Array.isArray(L)&&L.length) return hm4(L[L.length-1][0])-15;
  var HB=tr.b>=0?hotelPt(pl,tr.b):null, tail=(tr.kind==="air"?60+flyMin(tr.d)+20:15+(tr.bus&&tr.bus.min>0?tr.bus.min+10:tr.est))+(HB?bagLeg(tr.sb,HB).min:0);
  if(tr.b===-2){ var q=pl.ap&&pl.ap.d; return q&&q.t!=null?q.t-(q.k==="d"?90:180)-tail:null; }
  return LATE-tail; }
// 그 시각(ready) 뒤 탈 것 — 열차 시간표면 첫 열차, 없으면 어림(dp=ready)
function trPick(tr,ready){ var L=tr.list;
  if(tr.kind==="rail"&&Array.isArray(L)&&L.length){ for(var i=0;i<L.length;i++){ var dp=hm4(L[i][0]); if(dp>=ready){ var ar=hm4(L[i][1]); if(ar<dp) ar+=1440; return {dp:dp,ar:ar,g:L[i][2],no:L[i][3],fare:L[i][4],src:"tago"}; } }
    var l=L[L.length-1], d2=hm4(l[0]), a2=hm4(l[1]); if(a2<d2) a2+=1440; return {dp:ready,ar:ready+(a2-d2),est:1,miss:1,last:{dp:d2},src:"tago"}; }
  if(tr.bus&&tr.bus.min>0) return {dp:ready,ar:ready+tr.bus.min+10,fare:tr.bus.fare||null,est:1,bus:tr.bus,src:"odsay"};
  if(tr.kind==="air") return {dp:ready,ar:ready+flyMin(tr.d),est:1,src:"air"};
  return {dp:ready,ar:ready+tr.est,est:1,src:"est"}; }
// 아침 이동 줄 — 숙소 →(택시)→ 역 → 열차 → 역 →(택시)→ 다음 숙소(짐 두기 15분)
function trRun(pl,tr,S,t){ var rows=[], sa=tr.sa, sb=tr.sb, L1=(S&&km(S,sa)>0.05)?bagLeg(S,sa,t):null, bf=tr.kind==="air"?60:15;
  var tA=t+(L1?L1.min:0), opt=trPick(tr,tA+bf);
  if(opt.src==="tago"&&!opt.est&&opt.dp-(tA+bf)>45){ var o0=trPick(tr,tA+bf-60); if(!o0.est&&o0.dp<opt.dp){ opt=o0; t=o0.dp-bf-(L1?L1.min:0); tA=t+(L1?L1.min:0); rows.ts=t; } }   // 다음 열차까지 45분 넘게 기다리면 한 시간 안에서 일찍 나서 앞 열차를 탄다
  if(L1) rows.push({leg:L1,a:S,b:sa}); rows.push({tr:tr,opt:opt,ta:tA});
  var tB=opt.ar+(tr.kind==="air"?20:0), HB=tr.b>=0?hotelPt(pl,tr.b):null;
  if(HB){ var L2=km(sb,HB)>0.05?bagLeg(sb,HB,tB):null; if(L2) rows.push({leg:L2,a:sb,b:HB}); var td=tB+(L2?L2.min:0); rows.push({drop:1,p:HB,t:td}); return {rows:rows,S:HB,t:td+15,opt:opt}; }
  return {rows:rows,S:sb,t:tB,opt:opt}; }
// 그날 끝 줄 — 숙소·공항 도착 · 저녁 이동(역 → 열차 → 숙소) · 숙소를 안 정했으면 「숙소 찾기」
function natPost(pl,di,X,s){ var d=pl.days[di], rows=[], S=hS(X.H), E=hE(X.H), t=s.end, o={rows:rows,end:t,miss:0,tr:null};
  if(X.arr.length){ if(s.back) rows.push({leg:s.back,b:E}); }
  else if(S&&E&&km(S,E)>0.05){ var l0=X.pmTr?bagLeg(S,E,X.from):legT(S,E,X.from), t0=X.from; if(X.apD&&X.apD.by!=null) t0=Math.max(X.from,X.apD.by-l0.min-30); rows.push({leg:l0,a:S,b:E}); t=t0+l0.min; }   // 장소 없는 마지막 날 = 공항 도착 시각에 맞춰 나선다
  else t=(X.apD&&X.apD.by!=null&&!X.arr.length)?Math.max(X.from,X.apD.by-30):X.from;
  o.end=t;
  if(X.pmTr){ var tr=X.pmTr, opt=trPick(tr,t+(tr.kind==="air"?60:15)); o.tr=tr; rows.push({tr:tr,opt:opt,ta:t}); if(opt.miss) o.miss=1;
    var tB=opt.ar+(tr.kind==="air"?20:0);
    if(tr.b===-2){ var q=pl.ap&&pl.ap.d, by=q&&q.t!=null?q.t-(q.k==="d"?90:180):null; rows.push({apD:1,p:tr.sb,t:tB,ft:q?q.t:null,by:by,k:q?q.k:"i"}); if(by!=null&&tB>by) o.miss=1; o.end=tB; return o; }
    var HB=hotelPt(pl,tr.b); if(HB){ var L2=bagLeg(tr.sb,HB,tB); rows.push({leg:L2,a:tr.sb,b:HB}); rows.push({hotel:1,p:HB,t:tB+L2.min}); o.end=tB+L2.min; } else { rows.push({end:1,t:tB}); o.end=tB; }
    rows.push({tip:1}); rows.push({night:1,ci:tr.b,di:di}); return o; }
  if(X.apD){ rows.push({apD:1,p:E,t:t,ft:X.apD.ft,by:X.apD.by,k:X.apD.k}); return o; }
  if(X.arr.length||(X.pre&&X.pre.length)){ if(E&&(E.hotel||E.k==="__hotel")) rows.push({hotel:1,p:E,t:t}); else rows.push({end:1,t:t}); }   // 장소 없는 날(자유 일정)은 끝 줄 없이 밤 숙소 칸만
  var nc=d.nc!=null?d.nc:d.c; if(nc>=0&&(di<pl.days.length-1||hotelPt(pl,nc))) rows.push({night:1,ci:nc,di:di});
  return o; }
function rowH(t,ic,txt,cls){ return '<div class="trw h'+(cls?" "+cls:"")+'"><span class="tt">'+(t!=null?m2hm(t):"")+'</span><span class="tp">'+(ic?MPIMG(ic,MIS):"")+txt+'</span></div>'; }
function legRow(r,di,aK){ var a=(r.a&&r.a.k)||aK, b=(r.b&&r.b.k)||"__hotel"; return '<div class="tlg" data-a="'+esc(a||"")+'" data-b="'+esc(b)+'" data-d="'+di+'">'+legTxt(r.leg)+legGo(r.leg)+'<div class="tods"></div></div>'; }
function natPreHtml(pl,di,X){ var h=''; X.pre.forEach(function(r){
    if(r.ap==="a") h+=rowH(r.t,"mi_plane",esc(r.ft!=null?gTxt(NX6.apA,{a:ptNm(r.p),f:m2hm(r.ft),t:m2hm(r.t)}):gTxt(NX6.apA0,{a:ptNm(r.p)})));
    else if(r.start) h+=rowH(r.t,"mi_stay",esc(gTxt(NX6.st,{h:ptNm(r.p)})));
    else if(r.leg) h+=legRow(r,di,null);
    else if(r.tr) h+=trCard(pl,r.tr,r.opt);
    else if(r.drop) h+=rowH(r.t,"mi_stay",esc(gTxt(NX6.drop,{h:ptNm(r.p)}))); }); return h; }
function natPostHtml(pl,di,X,post,prevK){ var h=''; post.rows.forEach(function(r){
    if(r.leg) h+=legRow(r,di,prevK);
    else if(r.tr) h+=trCard(pl,r.tr,r.opt)+(r.opt.miss?'<div class="tmemo">⚠ '+esc(gTxt(NX6.miss,{t:m2hm(r.opt.last?r.opt.last.dp:r.opt.dp)}))+'</div>':'');
    else if(r.hotel) h+=rowH(r.t,"mi_stay",esc(T("숙소 도착","Back to lodging"))+' · <b>'+esc(ptNm(r.p))+'</b>');
    else if(r.end) h+=rowH(r.t,null,esc(T("일정 끝","End of day")));
    else if(r.apD){ h+=rowH(r.t,"mi_plane",esc(gTxt(NX6.apD,{a:ptNm(r.p)})))+'<div class="d txs2">'+esc(r.ft!=null?gTxt(r.k==="d"?NX6.apDd:NX6.apDi,{f:m2hm(r.ft),b:m2hm(r.by)}):T5(NX6.apD0))+'</div>'; if(r.by!=null&&r.t>r.by) h+='<div class="tmemo">⚠ '+esc(gTxt(NX6.wAp,{t:m2hm(r.by)}))+'</div>'; }
    else if(r.tip) h+='<div class="d txs2">'+esc(T5(NX6.bagTip))+'</div>';
    else if(r.night) h+=nightHtml(pl,di,r.ci); }); return h; }
// 밤마다 숙소 칸 (사장님 11-06 「○일 밤 · ○○ · 숙소」) — 정했으면 그 숙소 + 택시 단추(외국어 K.Ride · 한국어 카카오 T, 첫 화면과 같은 단추), 안 정했으면 「숙소 찾기」
function nightCity(pl,di){ if(pl.mc){ var d=pl.days[di], nc=d.nc!=null?d.nc:d.c; return nc>=0?pl.cities[nc]:null; } var arr=pl.days[di].stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), H=REPH||pl.H, p=H&&!H.here?H:arr[arr.length-1]; if(!p) return null;
  var b=null, bd=1e9; CITYNM.forEach(function(c){ var q=km(p,{lat:c[7],lng:c[8]}); if(q<bd){ bd=q; b=c; } }); return b&&bd<=40?(function(){ var o=nmOf(b); o.lat=b[7]; o.lng=b[8]; return o; })():null; }
function nightHotel(pl,di,ci){ if(pl.mc) return ci!=null&&ci>=0?hotelPt(pl,ci):null; var H=REPH||pl.H; return H&&!H.here?H:null; }
function taxiBtn(h){ try{ return (typeof FG==="function"&&FG())?(window.krideL?krideL(h.ko,h.addr||""):""):(window.kakaoTL?kakaoTL(h.ko,h.addr||""):""); }catch(e){ return ""; } }
function nightHtml(pl,di,ci){ var c=pl.mc?(ci!=null&&ci>=0?pl.cities[ci]:null):nightCity(pl,di), hp=nightHotel(pl,di,ci); if(pl.mc&&!c) return "";
  var cn=c?cnm(c):"", hn=hp?ptNm(hp):T5(NX6.nightX);
  return '<div class="tnight'+(hp?'':' no')+'" data-html2canvas-ignore><b>🌙 '+esc(gTxt(NX6.night,{n:di+1,c:cn||"—",h:hn}))+'</b>'
    +(hp?'<span class="tnl">'+taxiBtn(hp)+'</span>':'<button type="button" class="trbtn" data-hpick="'+(ci!=null?ci:"")+'" data-hd="'+di+'">'+MPIMG("mi_stay",MIS)+esc(T5(NX6.hPick))+'</button>')+'</div>'; }
function trName(tr){ return ptNm(tr.sa)+" → "+ptNm(tr.sb); }
function trCard(pl,tr,opt){ var line="", sub="", lk="", ic="mi_train", gb="";
  if(tr.kind==="air"){ ic="mi_plane"; line=T5(NX6.air)+" · "+trName(tr); sub=gTxt(NX6.airEst,{d:durTxt(flyMin(tr.d))})+" · "+T5(NX6.airChk); lk=flyLinks(tr.sa.ap,tr.sb.ap,pl.days[tr.di]&&pl.days[tr.di].date); }
  else if(opt.src==="tago"&&!opt.est){ var g=(typeof trGrade==="function")?trGrade({g:opt.g,no:opt.no}):String(opt.g||""); gb=(typeof trBadge==="function")?trBadge(g)+" ":"";
    line=ptNm(tr.sa)+" "+m2hm(opt.dp)+" "+(gb?"":g+" ")+(opt.no?opt.no+" ":"")+"→ "+ptNm(tr.sb)+" "+m2hm(opt.ar)+(opt.fare?" · "+won(opt.fare):""); sub=T5(NX6.tago);
    lk='<a href="'+(/^SRT/.test(g)?"https://etk.srail.kr/":"https://www.letskorail.com/")+'" target="_blank" rel="noopener">'+esc(/^SRT/.test(g)?T("SRT 예매","Book on SRT"):T("코레일 예매","Book on Korail"))+'</a>'; }
  else if(opt.bus){ var b=opt.bus; ic=b.k===4?"mi_train":"mi_bus"; line=T5(b.k===4?NX6.rail4:b.k===6?NX6.bus6:NX6.bus5)+" · "+ptNm(tr.sa)+" → "+ptNm(tr.sb)+" · "+gTxt(NX6.est,{d:durTxt(b.min)})+(b.fare?" · "+won(b.fare):""); sub=T5(NX6.busChk);
    lk=b.k===4?'<a href="https://www.letskorail.com/" target="_blank" rel="noopener">'+esc(T("코레일 예매","Book on Korail"))+'</a>':'<a href="'+(b.k===6?"https://txbus.t-money.co.kr/":"https://www.kobus.co.kr/")+'" target="_blank" rel="noopener">'+esc(T("버스 예매","Book a bus"))+'</a>'; }
  else { ic=tr.kind==="rail"?"mi_train":"mi_bus"; line=trName(tr)+" · "+gTxt(NX6.est,{d:durTxt(opt.ar-opt.dp)}); if(tr.kind==="rail") lk='<a href="https://www.letskorail.com/" target="_blank" rel="noopener">'+esc(T("코레일 예매","Book on Korail"))+'</a>'; }
  return '<div class="trw x"><span class="tt">'+(opt.est?"~":"")+m2hm(opt.dp)+'</span><span class="tp"><span class="txc">'+MPIMG(ic,MIS)+gb+'<b>'+esc(line)+'</b>'+(sub?'<i class="txs">'+esc(sub)+'</i>':'')+(lk?'<span class="txl">'+lk+'</span>':'')+'</span></span></div>'; }
// 항공권 찾기 링크 (공개 검색 주소 — 스카이스캐너 /transport/flights/출발/도착/YYMMDD/ · 구글 항공권 ?q=) · 날짜·인원을 채운다 · 예약·결제는 그 사이트에서
function flyLinks(a,b,date,pax){ var A=APT[a], B=APT[b]; if(!A&&!B) return ""; pax=pax||(TR.opt&&TR.opt.pax)||1; var ymd=String(date||"").replace(/-/g,"").slice(2);
  var sk=(A&&B&&ymd.length===6)?"https://www.skyscanner.co.kr/transport/flights/"+A.c.toLowerCase()+"/"+B.c.toLowerCase()+"/"+ymd+"/?adultsv2="+pax:null;
  var gq="Flights"+(B?" to "+B.c:"")+(A?" from "+A.c:"")+(date?" on "+date:"")+" for "+pax+" adult"+(pax>1?"s":""), gf="https://www.google.com/travel/flights?q="+encodeURIComponent(gq)+"&hl="+({ko:"ko",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en");
  return (sk?'<a href="'+sk+'" target="_blank" rel="noopener" data-bk="sky">'+esc(T("스카이스캐너","Skyscanner"))+'</a>':'')+'<a href="'+gf+'" target="_blank" rel="noopener" data-bk="gfl">'+esc(T("구글 항공권","Google Flights"))+'</a>'; }
function aiExtra(pl,di,X,s,o){ var np=o.s.length, mv=[], ap=[], add=function(r,p){ if(!r.tr) return; var op=r.opt||{}, tr=r.tr; mv.push({p:p,k:tr.kind,f:tr.sa.ko,fe:tr.sa.en,to:tr.sb.ko,te:tr.sb.en,dt:op.est?"":m2hm(op.dp),at:op.est?"":m2hm(op.ar),g:op.est?"":String(op.g||"").slice(0,20),m:Math.max(0,Math.round(op.ar-op.dp))}); };
  (X.pre||[]).forEach(function(r){ if(r.ap==="a") ap.push({p:0,k:"A",n:r.p.ko,ne:r.p.en,t:m2hm(r.t),ft:r.ft!=null?m2hm(r.ft):""}); add(r,0); });
  natPost(pl,di,X,s).rows.forEach(function(r){ if(r.apD) ap.push({p:np,k:"D",n:r.p.ko,ne:r.p.en,t:m2hm(r.t),ft:r.ft!=null?m2hm(r.ft):""}); add(r,np); });
  var d=pl.days[di], nc=d.nc!=null?d.nc:d.c, hp=nc>=0?hotelPt(pl,nc):null;
  if(mv.length) o.mv=mv.slice(0,3); if(ap.length) o.ap=ap.slice(0,2); if(hp&&!hp.here) o.ht=String(hp.ko).slice(0,60); }
// ── 받아 오기: 열차(TAGO /train) · 버스(ODsay /nxcity) · 택시 요금(네이버 /ndrive) ──
function trainGet(a,b,ymd){ var TC=window._trC||(window._trC={}), ck=a+"|"+b+"|"+ymd;   // index.html KTX 시간표와 같은 캐시(같은 구간·같은 날은 한 번)
  return (TC[ck]||(TC[ck]=fetch(HUB+"/train?dep="+a+"&arr="+b+"&date="+ymd).then(function(r){ return r.json(); }).catch(function(){ delete TC[ck]; return null; }))).then(function(j){
    return ((j&&j.ok&&j.items)||[]).filter(function(x){ return /^\d{4}$/.test(x.dp)&&/^\d{4}$/.test(x.ar); }).map(function(x){ return [x.dp,x.ar,String(x.g||"").slice(0,20),String(x.no||"").slice(0,8),+x.fare||0]; }).sort(function(p,q){ return p[0]<q[0]?-1:p[0]>q[0]?1:0; }).slice(0,80); }); }
function busGet(tr){ var key="nx:"+(+tr.sa.lat).toFixed(2)+","+(+tr.sa.lng).toFixed(2)+">"+(+tr.sb.lat).toFixed(2)+","+(+tr.sb.lng).toFixed(2), sv=null; try{ sv=JSON.parse(sessionStorage.getItem(key)||"null"); }catch(e){}
  var use=function(j){ var op=((j&&j.ok&&j.opts)||[]).filter(function(x){ return x&&x.min>0; }); if(!op.length){ tr.st="none"; return; }
    op.sort(function(p,q){ return p.min-q.min; }); var b=op[0]; tr.bus={k:b.k,min:b.min,fare:b.fare||null}; tr.st="ok";
    if(b.s&&isFinite(+b.s.lat)) tr.sa={k:"__tm_"+(+b.s.lat).toFixed(4)+"_"+(+b.s.lng).toFixed(4),ko:b.s.ko,en:b.s.en||b.s.ko,lat:+b.s.lat,lng:+b.s.lng,tm:1};
    if(b.e&&isFinite(+b.e.lat)) tr.sb={k:"__tm_"+(+b.e.lat).toFixed(4)+"_"+(+b.e.lng).toFixed(4),ko:b.e.ko,en:b.e.en||b.e.ko,lat:+b.e.lat,lng:+b.e.lng,tm:1}; };
  if(sv){ use(sv); return Promise.resolve(); }
  return fetch(HUB+"/nxcity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({a:[+tr.sa.lat,+tr.sa.lng],b:[+tr.sb.lat,+tr.sb.lng]})}).then(function(r){ return r.json(); })
    .then(function(j){ if(j&&j.ok){ try{ sessionStorage.setItem(key,JSON.stringify(j)); }catch(e){} } use(j); },function(){ tr.st="none"; }); }
function trFetch(pl,cb){ if(!pl||!pl.mc||!Array.isArray(pl.tr)||!pl.tr.length||typeof fetch!=="function"){ if(cb) cb(); return; }
  var jobs=[]; pl.tr.forEach(function(tr){ if(tr.st) return; var d=pl.days[tr.di]; if(!d){ tr.st="none"; return; } var ymd=d.date.replace(/-/g,"");
    if(tr.kind==="rail") jobs.push(trainGet(tr.sa.code,tr.sb.code,ymd).then(function(it){ if(it&&it.length){ tr.list=it; tr.st="ok"; return; } return busGet(tr); }));
    else if(tr.kind==="bus") jobs.push(busGet(tr)); else tr.st="air"; });
  var done=false, fin=function(){ if(done) return; done=true; if(cb) cb(); }; setTimeout(fin,9000);
  Promise.all(jobs).then(fin,fin); }
function ndrive(legs){ return fetch(HUB+"/ndrive",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({legs:legs})}).then(function(r){ return r.json(); }).then(function(j){ window.__trNdrive=j&&(j.ok?"ok":j.err); return (j&&j.ok&&Array.isArray(j.r))?j.r:[]; }).catch(function(){ return []; }); }
// 택시 구간 요금·시간 (네이버 길찾기, 그 일정에 나오는 택시 구간만 · 짐·밤 구간 먼저 · 많아야 8개 · 같은 구간은 다시 안 묻는다)
function drFetch(pl,cb){ if(!pl||OLD()||typeof fetch!=="function"){ if(cb) cb(0); return; } var cand=[], seen={}, pr={bag:0,night:1,short:2};
  var add=function(a,b,lg){ if(!a||!b||!lg||lg.mode!=="taxi"||lg.real) return; var kk=rtKey(a,b); if(seen[kk]||DR[kk]) return; seen[kk]=1; var sv=null; try{ sv=JSON.parse(sessionStorage.getItem("nd:"+kk)||"null"); }catch(e){} if(sv&&sv.min>0){ DR[kk]=sv; return; } cand.push({k:kk,a:a,b:b,p:pr[lg.why]!=null?pr[lg.why]:3}); };
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,REPH||pl.H), s=sched(X.H,X.arr,X.dt,X.from,moX(di,X)), p=hS(X.H);
    (X.pre||[]).forEach(function(r){ if(r.leg) add(r.a,r.b,r.leg); });
    s.rows.forEach(function(r){ if(r.meal){ if(r.r){ if(r.leg) add(p,r.r,r.leg); p=r.r; } else if(r.to&&r.next){ if(r.leg) add(p,r.next,r.leg); p=r.next; } return; } if(r.leg&&p) add(p,r.x,r.leg); p=r.x; });
    if(s.back) add(p,hE(X.H),s.back); if(pl.mc) natPost(pl,di,X,s).rows.forEach(function(r){ if(r.leg&&r.a) add(r.a,r.b,r.leg); }); });
  cand.sort(function(x,y){ return x.p-y.p; }); cand=cand.slice(0,8); if(!cand.length){ if(cb) cb(0); return; }
  ndrive(cand.map(function(c){ return [+c.a.lat,+c.a.lng,+c.b.lat,+c.b.lng]; })).then(function(r){ var n=0; pl.dr=pl.dr||{};
    cand.forEach(function(c,i){ var q=r[i]; if(!q||!(q.min>0)) return; var v={min:Math.round(q.min),fare:q.taxi||null}; DR[c.k]=v; pl.dr[c.k]=[v.min,v.fare]; n++; try{ sessionStorage.setItem("nd:"+c.k,JSON.stringify(v)); }catch(e){} });
    if(cb) cb(n); }); }
function drLoad(pl){ if(pl&&pl.dr) for(var k in pl.dr){ var v=pl.dr[k]; if(!DR[k]&&Array.isArray(v)&&v[0]>0) DR[k]={min:v[0],fare:v[1]||null}; } }
// 숙소를 바꾸면 — 역 고르기·그날 순서만 이 기기에서 다시(AI 다시 안 부름 · 순서가 바뀐 날은 그날 설명만 감춤)
function natRefit(pl,cb){ if(!pl||!pl.mc){ if(cb) cb(); return; } (pl.tr||[]).forEach(function(tr,i){ if(tr.a<0||tr.b===-2) return;
    var pa=hotelPt(pl,tr.a)||cityPt(pl.cities[tr.a]), pb=hotelPt(pl,tr.b)||cityPt(pl.cities[tr.b]), nt=natTr(pa,pb,tr.a,tr.b);
    if(nt.kind!==tr.kind||(nt.kind==="rail"&&(nt.sa.code!==tr.sa.code||nt.sb.code!==tr.sb.code))){ nt.w=tr.w; nt.di=tr.di; pl.tr[i]=nt; } });
  var re=function(){ pl.days.forEach(function(d,di){ var X=dayX(pl,di,REPH), b4=d.stops.join(","); if(!X.arr.length) return; var od=orderDay(X.H,X.arr,X.dt,X.from,X.to); d.stops=od.map(function(x){ return x.k; }); if(d.stops.join(",")!==b4) d.aiX=1; }); save(); if(cb) cb(); };
  trFetch(pl,re); }
function natSetHotel(pl,ci,h,di){ if(!pl) return; TR.opt.hotels=TR.opt.hotels||{};
  if(pl.mc&&pl.cities[ci]){ pl.cities[ci].h=h; TR.opt.hotels[pl.cities[ci].id]=h; }
  else { TR.opt.hotel=h; pl.hotel=h; pl.H={k:"__hotel",ko:h.ko,en:h.en,lat:+h.lat,lng:+h.lng,addr:h.addr||"",hotel:1}; REPH=pl.H; }
  save(); var after=function(){ drFetch(pl,function(){ save(); if(document.getElementById("trRep")) repPaint(); }); if(document.getElementById("trRep")) repPaint(); try{ nowPaint(); }catch(e){} };
  if(pl.mc) natRefit(pl,after); else { reorderWithReal(pl,pl.H); save(); after(); } }
// 공유 링크 x 칸 — 도시별 숙소 · 공항 · 날마다 도시 이동(아침 a·저녁 p)
function natShare(pl,r){ if(!pl||!pl.mc) return undefined; return {c:pl.cities.map(function(c){ var h=c.h&&c.h.type!=="here"?c.h:null; return [c.id,h?[h.ko,h.en,r(+h.lat),r(+h.lng)]:0]; }),
  ap:pl.ap?[pl.ap.a?[pl.ap.a.id,pl.ap.a.t,pl.ap.a.k]:0,pl.ap.d?[pl.ap.d.id,pl.ap.d.t,pl.ap.d.k]:0]:0,m:pl.days.map(function(d){ return (d.am!=null?"a":"")+(d.pm!=null?"p":""); }),n:TR.opt.pax||undefined}; }
function natFromShare(pl,x){ var o=TR.opt; o.hotels={};
  (Array.isArray(x.c)?x.c:[]).forEach(function(q){ if(!Array.isArray(q)||typeof q[0]!=="string") return; var h=q[1]; o.hotels[q[0].slice(0,40)]=Array.isArray(h)?{type:"addr",ko:String(h[0]).slice(0,80),en:String(h[1]).slice(0,80),lat:+h[2],lng:+h[3]}:null; });
  if(Array.isArray(x.ap)){ var c=function(q){ return Array.isArray(q)&&APT[q[0]]?{id:q[0],t:(q[1]!=null&&isFinite(+q[1]))?m2hm(+q[1]):"",k:q[2]==="d"?"d":"i"}:null; }; o.ap={a:c(x.ap[0]),d:c(x.ap[1])}; }
  if(+x.n>=1&&+x.n<=9) o.pax=+x.n;
  natRebuild(pl,Array.isArray(x.m)?x.m:[]); }
function natRebuild(pl,m){ var P=[], k; for(k in pl.pool) P.push(pl.pool[k]); if(!P.length) return;
  var ap=apOpt(), G=natGroups(P); if(G.length<2&&!ap.a&&!ap.d) return;
  natHotels(G,null); var gi={}; G.forEach(function(g,i){ g.pts.forEach(function(x){ gi[x.k]=i; }); });
  var dc=pl.days.map(function(d){ var c={}, b=-1, bn=0; d.stops.forEach(function(q){ var g=gi[q]; if(g==null) return; c[g]=(c[g]||0)+1; if(c[g]>bn){ bn=c[g]; b=g; } }); return b; }), i;
  for(i=0;i<dc.length;i++) if(dc[i]<0) dc[i]=i>0?dc[i-1]:-1; for(i=dc.length-1;i>=0;i--) if(dc[i]<0) dc[i]=i+1<dc.length?dc[i+1]:0;
  var ordG=[], idx={}; dc.forEach(function(g){ if(idx[g]==null){ idx[g]=ordG.length; ordG.push(G[g]); } });
  pl.mc=1; pl.tr=[]; pl.ap=(ap.a||ap.d)?{a:ap.a,d:ap.d}:null;
  pl.cities=ordG.map(function(g){ return {id:g.id,ko:g.nm.ko,en:g.nm.en,ja:g.nm.ja,zhs:g.nm.zhs,zht:g.nm.zht,es:g.nm.es,lat:Math.round(g.lat*1e5)/1e5,lng:Math.round(g.lng*1e5)/1e5,isle:g.isle,h:g.h||null}; });
  pl.days.forEach(function(d,q){ d.c=idx[dc[q]]; d.nc=d.c; delete d.am; delete d.pm; });
  for(i=1;i<pl.days.length;i++){ var a=pl.days[i-1].c, b=pl.days[i].c; if(a===b) continue; var tr=natTr(hotelPt(pl,a)||cityPt(pl.cities[a]),hotelPt(pl,b)||cityPt(pl.cities[b]),a,b);
    if(/p/.test(m[i-1]||"")){ tr.w="pm"; tr.di=i-1; pl.days[i-1].pm=pl.tr.length; pl.days[i-1].nc=b; } else { tr.w="am"; tr.di=i; pl.days[i].am=pl.tr.length; } pl.tr.push(tr); }
  if(pl.ap&&pl.ap.d) pl.days[pl.days.length-1].nc=-1; }
// ══ 숙소 찾기 (사장님 11-06 「싼 곳부터 · 예약 사이트로 넘긴다」) ══
//  · 검색 = 첫 화면 「숙소」 칩과 같은 것: 허브 /kplace?cat=AD5(카카오 숙박, 3km → 모자라면 10km) + /gplace「구 이름 호텔」(구글 별점·가격대, 칩과 같은 주소 꼴) — 새 종류의 유료 호출 없음
//  · 나누기 = 숙소 종류(카카오 분류·이름)와 구글 priceLevel(같은 Enterprise 요청에 칸만 더함, 허브): 저렴(유스호스텔·게스트하우스·호스텔) → 중간(비즈니스호텔·모텔·레지던스) → 고급(특급·브랜드)
//  · 「예약하기」 = 날짜·인원·이름을 채운 부킹닷컴·아고다·호스텔월드 공개 검색 주소로 넘긴다(앱 안 예약·결제 없음). 가격은 지어내지 않는다
var LG6={ttl:{ko:"숙소 찾기",en:"Find lodging",ja:"宿を探す",zhs:"查找住宿",zht:"查找住宿",es:"Buscar alojamiento"},
 sub:{ko:"싼 곳부터 보여 드려요 · 가격·빈방은 예약 사이트에서 확인",en:"Cheapest types first · check prices and availability on the booking site",ja:"安い順に表示 · 料金・空室は予約サイトで確認",zhs:"从便宜的开始显示 · 价格和空房请在预订网站确认",zht:"從便宜的開始顯示 · 價格和空房請在預訂網站確認",es:"Primero lo más económico · consulta precios y disponibilidad en la web de reservas"},
 t1:{ko:"저렴 — 유스호스텔·게스트하우스·호스텔",en:"Budget — youth hostels, guesthouses, hostels",ja:"格安 — ユースホステル・ゲストハウス・ホステル",zhs:"经济——青年旅舍、民宿、旅舍",zht:"經濟——青年旅舍、民宿、旅舍",es:"Económico: albergues, casas de huéspedes, hostales"},
 t2:{ko:"중간 — 비즈니스호텔·모텔·레지던스",en:"Mid-range — business hotels, motels, residences",ja:"中級 — ビジネスホテル・モーテル・レジデンス",zhs:"中档——商务酒店、汽车旅馆、公寓式酒店",zht:"中價位——商務飯店、汽車旅館、公寓式飯店",es:"Gama media: hoteles business, moteles, residencias"},
 t3:{ko:"고급 — 특급·브랜드 호텔",en:"Upscale — luxury and brand hotels",ja:"高級 — 一流・ブランドホテル",zhs:"高档——豪华及品牌酒店",zht:"高檔——豪華及品牌飯店",es:"Alta gama: hoteles de lujo y de cadena"},
 use:{ko:"이 숙소로",en:"Stay here",ja:"この宿にする",zhs:"选这家",zht:"選這家",es:"Elegir este"},
 bk:{ko:"예약하기",en:"Book",ja:"予約する",zhs:"预订",zht:"預訂",es:"Reservar"},
 all:{ko:"여행 내내 이 숙소",en:"Stay here for the whole trip",ja:"旅行中ずっとこの宿",zhs:"整个行程都住这里",zht:"整個行程都住這裡",es:"Este alojamiento todo el viaje"},
 none:{ko:"근처에서 숙소를 찾지 못했어요",en:"No lodging found nearby",ja:"近くに宿が見つかりませんでした",zhs:"附近没有找到住宿",zht:"附近沒有找到住宿",es:"No encontramos alojamiento cerca"},
 busy:{ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"搜索中…",zht:"搜尋中…",es:"Buscando…"},
 done:{ko:"✓ {h} — 그날 밤 숙소로 넣었어요",en:"✓ {h} is now your lodging for that night",ja:"✓ {h}をその夜の宿にしました",zhs:"✓ 已把{h}设为当晚住宿",zht:"✓ 已把{h}設為當晚住宿",es:"✓ {h} es ahora tu alojamiento esa noche"},
 nights:{ko:"{d} 체크인 · {n}박 · {p}명",en:"Check-in {d} · {n} night(s) · {p} guest(s)",ja:"{d}チェックイン・{n}泊・{p}名",zhs:"{d}入住 · {n}晚 · {p}人",zht:"{d}入住 · {n}晚 · {p}人",es:"Entrada {d} · {n} noche(s) · {p} persona(s)"}};
var LQ={};
function stayList(lat,lng){ var en=kpL(), key=lat.toFixed(3)+","+lng.toFixed(3)+en; if(LQ[key]) return LQ[key];
  var one=function(r){ return fetch(HUB+"/kplace?cat=AD5&x="+lng.toFixed(5)+"&y="+lat.toFixed(5)+"&radius="+r+en).then(function(x){ return x.json(); }); };
  return LQ[key]=one(3000).then(function(j){ if(j&&j.ok&&(j.items||[]).length>=3) return j; return one(10000); }).then(function(j){ var a=((j&&j.ok&&j.items)||[]).map(function(x){ var o=Object.assign({},x); o.dist=Math.round(km({lat:lat,lng:lng},{lat:+x.y,lng:+x.x})*1000); return o; });
      if(!a.length||typeof window.gRate!=="function") return a;
      var cnt={}, gu=""; a.forEach(function(x){ var w=String(x.addr||"").split(/\s+/)[1]||""; if(/[구군시]$/.test(w)) cnt[w]=(cnt[w]||0)+1; }); Object.keys(cnt).forEach(function(k){ if(!gu||cnt[k]>cnt[gu]) gu=k; });
      return fetch(HUB+"/gplace?all=1&lang=ko&q="+encodeURIComponent((gu?gu+" ":"")+"호텔")+"&lat="+lat.toFixed(5)+"&lng="+lng.toFixed(5)).then(function(r){ return r.json(); }).then(function(g){ var gs=(g&&g.ok&&g.items)||[];   // 칩 「숙소」 첫 칸(호텔)과 같은 주소
        a.forEach(function(x){ var best=null, bd=0.2; gs.forEach(function(q){ var d=km({lat:+x.y,lng:+x.x},{lat:+q.lat,lng:+q.lng}); if(d<bd&&(String(q.name).indexOf(String(x.name).slice(0,3))>=0||String(x.name).indexOf(String(q.name).slice(0,3))>=0)){ bd=d; best=q; } }); if(best){ if(best.rating){ x.rating=+best.rating; x.n=+best.n||0; } if(best.pl!=null) x.pl=+best.pl; } });
        return a; }).catch(function(){ return a; }); }).catch(function(){ delete LQ[key]; return []; }); }
var LUX=/특급|5성|그랜드|하얏트|hyatt|힐튼|hilton|메리어트|marriott|신라|shilla|롯데호텔|lotte hotel|웨스틴|westin|인터컨티넨탈|intercontinental|포시즌스|four seasons|조선|josun|콘래드|conrad|쉐라톤|sheraton|파라다이스|paradise|시그니엘|signiel|반얀트리|banyan|앰배서더|ambassador|노보텔|novotel|소피텔|sofitel|르메르디앙|meridien|리츠|ritz|워커힐|walkerhill|아난티|ananti|켄싱턴|kensington|그랜드\s?하얏트|jw/i;
var BUDGET=/유스|youth|게스트\s?하우스|guest\s?house|호스텔|hostel|민박|캡슐|capsule|도미토리|dormitory|백패커|backpacker/i;
function lgTier(x){ var s=(x.name||"")+" "+(x.cat||"")+" "+(x.name_en||""); if(x.pl>=3||LUX.test(s)) return 3; if(x.kind==="gh"||BUDGET.test(s)||x.pl===1) return 1; return 2; }
function lgSite(x){ return lgTier(x)===1?"hw":"bk"; }
function lgLinks(x,date,n,pax){ var q=encodeURIComponent((x.name_en&&L()?x.name_en:x.name)+" "+(x.city||"")), d2=date?(function(){ var t=new Date(date+"T00:00:00Z"); t.setUTCDate(t.getUTCDate()+(n||1)); return t.toISOString().slice(0,10); })():"", hl={ko:"ko",ja:"ja",zhs:"zh-cn",zht:"zh-tw",es:"es"}[LANG]||"en-gb";
  var bk="https://www.booking.com/searchresults."+hl+".html?ss="+q+(date?"&checkin="+date+"&checkout="+d2:"")+"&group_adults="+pax+"&no_rooms=1";   // 언어는 주소 칸으로(searchresults.ko.html) — ?lang= 은 되돌려 보내며 검색 칸을 버린다 (11-06 확인)
  var ag="https://www.agoda.com/search?textToSearch="+q+(date?"&checkIn="+date+"&los="+(n||1):"")+"&adults="+pax+"&rooms=1";
  var hw="https://www.hostelworld.com/hostels/asia/south-korea/"+encodeURIComponent(String(x.city_en||"Seoul").toLowerCase().replace(/[^a-z]+/g,"-").replace(/^-|-$/g,"")||"seoul")+"/";   // 호스텔월드는 도시 화면(날짜·인원은 그 화면에서) — 검색 주소는 공개 꼴이 아니다 (11-06 확인)
  return '<a href="'+bk+'" target="_blank" rel="noopener" data-bk="booking">Booking.com</a><a href="'+ag+'" target="_blank" rel="noopener" data-bk="agoda">Agoda</a>'+(lgTier(x)===1?'<a href="'+hw+'" target="_blank" rel="noopener" data-bk="hostelworld">Hostelworld</a>':''); }
var LGS={};   // 열린 숙소 찾기 창 상태 {lat,lng,date,n,ci,di,all,city,items,cb}
function openLodge(o){ LGS=Object.assign({items:null,all:false},o||{}); var b=sheet("trLg"); b.parentNode.style.zIndex="1040"; lgPaint();
  stayList(+LGS.lat,+LGS.lng).then(function(a){ if(!document.getElementById("trLg")) return; LGS.items=a; lgPaint(); }); try{ ntap("_trip","lodge_open"); }catch(e){} }
function lgPaint(){ var box=document.querySelector("#trLg .trin"); if(!box) return; var pax=(TR.opt&&TR.opt.pax)||1, its=LGS.items;
  var h='<div class="trtop"><b>'+MPIMG("mi_stay",MIS)+esc(T5(LG6.ttl))+(LGS.city?' · '+esc(LGS.city):'')+'</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trLg\')">✕</button></div>'
    +'<div class="d">'+esc(T5(LG6.sub))+(LGS.date?' · '+esc(gTxt(LG6.nights,{d:dateTxt(new Date(LGS.date+"T00:00:00Z")),n:LGS.n||1,p:pax})):'')+'</div>'
    +(LGS.allOpt?'<label class="trck" style="margin:8px 0"><input type="checkbox" id="trLgAll"'+(LGS.all?" checked":"")+'> '+esc(T5(LG6.all))+'</label>':'')
    +'<div class="tlgnote">'+esc(gTxt(NX6.book,{s:T5(NX6.sites)}))+'</div>';
  if(!its) h+='<div class="msg">'+esc(T5(LG6.busy))+'</div>';
  else if(!its.length) h+='<div class="msg">'+esc(T5(LG6.none))+'</div>';
  else [1,2,3].forEach(function(t){ var a=its.filter(function(x){ return lgTier(x)===t; }).sort(function(p,q){ return (p.dist||0)-(q.dist||0); }); if(!a.length) return;
    h+='<div class="tlgt">'+esc(T5(LG6["t"+t]))+'</div>'+a.slice(0,8).map(function(x){ var i=its.indexOf(x); x.city=LGS.cityKo||""; x.city_en=LGS.cityEn||"";
      return '<div class="tlgi"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b>'+(x.rating?' <span class="tlgr">★'+x.rating.toFixed(1)+(x.n?' ('+x.n+')':'')+'</span>':'')
        +'<div class="d">'+esc((L()?(x.cat_en||""):String(x.cat||"").split(">").pop().trim()))+(x.dist!=null?' · '+(x.dist<1000?x.dist+" m":(x.dist/1000).toFixed(1)+" km"):'')+'</div>'
        +'<div class="tlgb"><button type="button" class="trbtn" data-lgu="'+i+'">'+esc(T5(LG6.use))+'</button><span class="tlgk">'+esc(T5(LG6.bk))+': '+lgLinks(x,LGS.date,LGS.n||1,pax)+'</span></div></div>'; }).join(""); });
  box.innerHTML=h; var al=document.getElementById("trLgAll"); if(al) al.onchange=function(){ LGS.all=this.checked; }; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trLg [data-lgu]"); if(b){ e.preventDefault(); var x=LGS.items&&LGS.items[+b.dataset.lgu]; if(!x) return;
    var h={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""}; try{ ntap("_trip","lodge_pick"); }catch(z){} sheetClose("trLg"); if(LGS.cb) LGS.cb(h,!!LGS.all); return; }
  var a=e.target.closest&&e.target.closest("#trLg a[data-bk], #trRep a[data-bk], #trNow a[data-bk], #aipSteps a[data-bk]"); if(a){ try{ ntap("_trip","bk_"+a.dataset.bk); }catch(z){} } },true);
// 보고서 「숙소 찾기」 — 그날 밤 도시(전국 일정) 또는 그날 마지막 장소 근처 · 고르면 그날 밤(도시) 숙소로
function lodgeFor(pl,di,ci,near){ var c=pl.mc&&ci!=null&&ci>=0?pl.cities[ci]:nightCity(pl,di), arr=pl.days[di].stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), p=near||(c?{lat:+c.lat,lng:+c.lng}:arr[arr.length-1]);
  if(!p) return; var n=1; if(pl.mc){ for(var q=di+1;q<pl.days.length;q++){ var dq=pl.days[q]; if((dq.nc!=null?dq.nc:dq.c)===ci) n++; else break; } } else n=Math.max(1,pl.days.length-1-di);
  openLodge({lat:+p.lat,lng:+p.lng,date:pl.days[di].date,n:n,ci:ci,di:di,city:c?cnm(c):"",cityKo:c?c.ko:"",cityEn:c?c.en:"",allOpt:false,cb:function(h){ natSetHotel(TR.plan,ci,h,di); try{ lgToast(gTxt(LG6.done,{h:h.ko})); }catch(e){} }}); }
function lgToast(t){ var o=document.createElement("div"); o.className="tlgtoast"; o.textContent=t; document.body.appendChild(o); setTimeout(function(){ try{ o.remove(); }catch(e){} },3500); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-hpick]"); if(!b) return; e.preventDefault(); var pl=TR.plan; if(!pl) return; var ci=b.dataset.hpick===""?null:+b.dataset.hpick; lodgeFor(pl,+b.dataset.hd,ci); },true);

// ══ 「AI일정짜기」 화면 3단계 (사장님 11-06) — ① 항공편 ② 첫날 숙소(「여행 내내 이 숙소」) ③ AI와 일정짜기(reco.js 지금 화면 그대로) · 건너뛸 수 있고, 이미 예약했으면 「있어요 — 입력」 ══
var ST6={s1:{ko:"① 항공편 예약",en:"① Book flights",ja:"① 航空券の予約",zhs:"① 预订机票",zht:"① 預訂機票",es:"① Reserva tus vuelos"},
 s2:{ko:"② 첫날 숙소 예약",en:"② Book your first night",ja:"② 初日の宿の予約",zhs:"② 预订第一晚住宿",zht:"② 預訂第一晚住宿",es:"② Reserva la primera noche"},
 s3:{ko:"③ AI와 일정짜기",en:"③ Plan with AI",ja:"③ AIと旅程づくり",zhs:"③ 与AI规划行程",zht:"③ 與AI規劃行程",es:"③ Planifica con IA"},
 have:{ko:"있어요 — 입력",en:"Already booked — enter it",ja:"予約済み — 入力",zhs:"已预订——填写",zht:"已預訂——填寫",es:"Ya reservado: introducir"},
 skip:{ko:"건너뛰기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"略過",es:"Omitir"},
 find:{ko:"항공권 찾기",en:"Find flights",ja:"航空券を探す",zhs:"查找机票",zht:"查找機票",es:"Buscar vuelos"},
 inb:{ko:"한국 도착편",en:"Flight to Korea",ja:"韓国到着便",zhs:"到达韩国的航班",zht:"抵達韓國的航班",es:"Vuelo a Corea"},
 outb:{ko:"한국 출발편",en:"Flight home",ja:"韓国出発便",zhs:"离开韩国的航班",zht:"離開韓國的航班",es:"Vuelo de regreso"},
 day1:{ko:"첫날",en:"First day",ja:"初日",zhs:"第一天",zht:"第一天",es:"Primer día"},
 days:{ko:"여행 일수",en:"Days",ja:"旅行日数",zhs:"旅行天数",zht:"旅行天數",es:"Días"},
 pax:{ko:"인원",en:"Travelers",ja:"人数",zhs:"人数",zht:"人數",es:"Viajeros"},
 city:{ko:"첫날 묵을 도시",en:"City for the first night",ja:"初日に泊まる都市",zhs:"第一晚住宿的城市",zht:"第一晚住宿的城市",es:"Ciudad de la primera noche"},
 ok:{ko:"✓ 정했어요",en:"✓ Set",ja:"✓ 決定",zhs:"✓ 已设定",zht:"✓ 已設定",es:"✓ Listo"},
 hname:{ko:"숙소 이름·주소로 찾기",en:"Search lodging by name/address",ja:"宿の名前・住所で探す",zhs:"按住宿名称或地址查找",zht:"按住宿名稱或地址查找",es:"Busca el alojamiento por nombre o dirección"},
 times:{ko:"비행기 시각을 넣으면 첫날·마지막 날 일정을 그 시각에 맞춰요",en:"Add your flight times and we'll fit the first and last days around them",ja:"便の時刻を入れると初日・最終日をその時刻に合わせます",zhs:"填写航班时间后，第一天和最后一天会按航班安排",zht:"填寫航班時間後，第一天和最後一天會按航班安排",es:"Añade las horas de tus vuelos y ajustaremos el primer y el último día"}};
var STS={open:"",hq:"",hr:null};
function stepsPaint(el){ el=el||document.getElementById("aipSteps"); if(!el) return; var o=TR.opt, ap=o.ap||{}, pax=o.pax||1, start=o.start||kstToday(1), last=dayDate(Math.max(0,(o.n||1)-1)).toISOString().slice(0,10);
  var apSel=function(w){ var q=ap[w]||{}; return '<select data-stap="'+w+'"><option value="">'+esc(T5(AP6.none))+'</option>'+Object.keys(APT).filter(function(id){ return APT[id].ui; }).map(function(id){ return '<option value="'+id+'"'+(q.id===id?' selected':'')+'>'+esc(apNm(id))+'</option>'; }).join("")+'</select>'; };
  var f1=!!(ap.a&&ap.a.id), f2=!!o.hotel, h='';
  h+='<div class="stp'+(f1?' ok':'')+'"><div class="stph" data-sto="1"><b>'+esc(T5(ST6.s1))+'</b>'+(f1?'<span class="stok">'+esc(T5(ST6.ok))+'</span>':'')+'</div>';
  if(STS.open==="1"){ h+='<div class="stpb"><div class="stpr"><label>'+esc(T5(ST6.day1))+'<input type="date" data-sts="start" value="'+esc(start)+'"></label><label>'+esc(T5(ST6.days))+'<select data-sts="n">'+[1,2,3,4,5,6,7].map(function(d){ return '<option'+(o.n===d?" selected":"")+'>'+d+'</option>'; }).join("")+'</select></label><label>'+esc(T5(ST6.pax))+'<select data-sts="pax">'+[1,2,3,4,5,6,7,8,9].map(function(d){ return '<option'+(pax===d?" selected":"")+'>'+d+'</option>'; }).join("")+'</select></label></div>'
    +'<div class="stpr"><label class="w">'+esc(T5(AP6.arr))+apSel("a")+'</label><label>'+esc(T5(AP6.tA))+'<input type="time" data-stt="a" value="'+esc((ap.a&&ap.a.t)||"")+'"></label></div>'
    +'<div class="stpl"><span>'+esc(T5(ST6.inb))+':</span>'+flyLinks(null,(ap.a&&ap.a.id)||"icn",start,pax)+'</div>'
    +'<div class="stpr"><label class="w">'+esc(T5(AP6.dep))+apSel("d")+'</label><label>'+esc(T5(AP6.tD))+'<input type="time" data-stt="d" value="'+esc((ap.d&&ap.d.t)||"")+'"></label></div>'
    +'<div class="stpl"><span>'+esc(T5(ST6.outb))+':</span>'+flyLinks((ap.d&&ap.d.id)||(ap.a&&ap.a.id)||"icn",null,last,pax)+'</div>'
    +'<div class="d">'+esc(T5(ST6.times))+'</div><div class="tlgnote">'+esc(gTxt(NX6.book,{s:T5(NX6.sites)}))+'</div>'
    +'<div class="stpn"><button type="button" class="trbtn" data-sto="2">'+esc(T5(ST6.skip))+' ›</button></div></div>'; }
  h+='</div><div class="stp'+(f2?' ok':'')+'"><div class="stph" data-sto="2"><b>'+esc(T5(ST6.s2))+'</b>'+(f2?'<span class="stok">'+esc(T5(ST6.ok))+' · '+esc(hotelTxt(o.hotel))+(o.hAll?' · '+esc(T5(LG6.all)):'')+'</span>':'')+'</div>';
  if(STS.open==="2"){ var cid=STS.city||(ap.a&&ap.a.id==="pus"?"busan":ap.a&&ap.a.id==="cju"?"jeju":"seoul");
    h+='<div class="stpb"><div class="stpr"><label class="w">'+esc(T5(ST6.city))+'<select data-stc="1">'+CITYNM.map(function(c){ return '<option value="'+c[0]+'"'+(c[0]===cid?' selected':'')+'>'+esc(LANG==="ko"?c[1]:({en:c[2],ja:c[3],zhs:c[4],zht:c[5],es:c[6]}[LANG]||c[2]))+'</option>'; }).join("")+'</select></label></div>'
      +'<div class="stpn"><button type="button" class="trbtn big" data-stl="1">'+MPIMG("mi_stay",MIS)+esc(T5(LG6.ttl))+'</button></div>'
      +'<div class="stpr"><input id="stHQ" placeholder="'+esc(T5(ST6.hname))+'" value="'+esc(STS.hq||"")+'"><button type="button" class="tb" data-sth="1">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div><div id="stHR">'+stHrHtml()+'</div>'
      +'<div class="stpn"><button type="button" class="trbtn" data-sto="3">'+esc(T5(ST6.skip))+' ›</button></div></div>'; }
  h+='</div><div class="stp"><div class="stph" data-sto="3"><b>'+esc(T5(ST6.s3))+'</b></div></div>';
  el.innerHTML=h; }
function stHrHtml(){ var a=STS.hr; if(!a) return ""; if(!a.length) return '<div class="d">'+esc(T("찾은 곳이 없어요","No results"))+'</div>';
  return a.slice(0,6).map(function(x,i){ return '<div class="tra" data-sthp="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join("")+'<label class="trck" style="margin:6px 0"><input type="checkbox" id="stHAll"'+(TR.opt.hAll?" checked":"")+'> '+esc(T5(LG6.all))+'</label>'; }
function stApSet(){ var o=TR.opt, ap=o.ap||{}, el=document.getElementById("aipSteps"); if(!el) return; ["a","d"].forEach(function(w){ var s=el.querySelector('[data-stap="'+w+'"]'), t=el.querySelector('[data-stt="'+w+'"]'); if(!s) return; var id=s.value;
    ap[w]=id?{id:id,t:(t&&hm2m(t.value)!=null)?t.value:"",k:(ap[w]&&ap[w].id===id&&ap[w].k)||(id==="cju"?"d":"i")}:null; }); o.ap=ap; save(); }
document.addEventListener("change",function(e){ var t=e.target, el=document.getElementById("aipSteps"); if(!el||!el.contains(t)) return; var o=TR.opt;
  if(t.dataset.sts==="start"){ o.start=t.value; save(); } else if(t.dataset.sts==="n"){ o.n=+t.value; TR.plan=null; save(); } else if(t.dataset.sts==="pax"){ o.pax=+t.value; save(); }
  else if(t.dataset.stap||t.dataset.stt) stApSet(); else if(t.dataset.stc){ STS.city=t.value; }
  stepsPaint(el); },true);
document.addEventListener("click",function(e){ var el=document.getElementById("aipSteps"); if(!el||!e.target.closest||!el.contains(e.target)) return; var t=e.target.closest("[data-sto],[data-stl],[data-sth],[data-sthp]"); if(!t) return; e.preventDefault();
  if(t.dataset.sto){ var v=t.dataset.sto; STS.open=STS.open===v?"":v; if(v==="3"){ STS.open=""; try{ var q=document.getElementById("aipQ"); if(q){ q.scrollIntoView({block:"center"}); q.focus(); } }catch(z){} } stepsPaint(el); return; }
  if(t.dataset.stl){ var cid=STS.city||(el.querySelector("[data-stc]")||{}).value||"seoul", c=CITYNM.filter(function(q){ return q[0]===cid; })[0]||CITYNM[0];
    openLodge({lat:c[7],lng:c[8],date:TR.opt.start||kstToday(1),n:Math.max(1,(TR.opt.n||1)-1),city:LANG==="ko"?c[1]:({en:c[2],ja:c[3],zhs:c[4],zht:c[5],es:c[6]}[LANG]||c[2]),cityKo:c[1],cityEn:c[2],allOpt:true,all:!!TR.opt.hAll,cb:function(h,all){ TR.opt.hotel=h; TR.opt.hAll=all?1:0; if(!all){ TR.opt.hotels=TR.opt.hotels||{}; } TR.plan=null; save(); STS.open="3"; stepsPaint(); }}); return; }
  if(t.dataset.sth){ var q2=(document.getElementById("stHQ")||{}).value||""; q2=q2.trim(); if(!q2) return; STS.hq=q2; STS.hr=null; var box=document.getElementById("stHR"); if(box) box.innerHTML='<div class="d">'+esc(T5(LG6.busy))+'</div>';
    fetch(HUB+"/kplace?q="+encodeURIComponent(q2)+kpL()).then(function(r){ return r.json(); }).then(function(j){ STS.hr=((j&&j.ok&&j.items)||[]).slice(0,6); var b2=document.getElementById("stHR"); if(b2) b2.innerHTML=stHrHtml(); }).catch(function(){ STS.hr=[]; var b3=document.getElementById("stHR"); if(b3) b3.innerHTML=stHrHtml(); }); return; }
  if(t.dataset.sthp){ var x=STS.hr&&STS.hr[+t.dataset.sthp]; if(!x) return; var all=!!(document.getElementById("stHAll")||{}).checked; TR.opt.hotel={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""}; TR.opt.hAll=all?1:0; TR.plan=null; save(); STS.hr=null; STS.hq=""; STS.open="3"; stepsPaint(el); } },true);

// ══ 첫 화면 「지금 여기」 카드 · 더 머무를 때 묻기 · 숙소 도착 물음 · 오늘 밤 숙소 물음 (사장님 11-06) ══
//  · 카드 = 오늘 일정이 있고 그날 시간 안(첫 장소 1시간 전 ~ 끝 1시간 뒤)일 때 첫 화면 아래 — 지도 높이를 카드만큼 줄여 지도·칩을 안 가린다 · ✕ = 그 상태 그대로면 다시 안 띄움
//  · 묻기(🔔 알림 — 알림함 목록 · 보이면 위 띠+소리·진동, 숨겨져 있으면 폰 알림 · 🔔 판 소리·진동 설정 그대로 · 누르면 카드/물음 창)
//    ① 「○○에 더 계시나요?」 — 예정 머무를 시간이 지나면 한 번, 그 자리에 계속 있으면 1시간마다 (떠나면 끝) · 낮·밤 장소 같은 규칙
//    ② 숙소 도착(그날 밤 숙소 150m 안, 17시 뒤)인데 못 간 곳이 있으면 「오늘 못 간 ○○ [내일로] [취소]」 한 번 · 답이 없으면 다음 날 앱을 처음 열 때 한 번 더
//    ③ 그날 밤 숙소가 안 정해졌으면 마지막 장소에 닿을 때(또는 하루 끝 1시간 전) 「오늘 밤 묵을 숙소가 있으세요?」 [있어요 → 이름으로 찾아 넣고 택시 단추] [없어요 → 숙소 찾기]
//  · 🔴 문자·메일·허브로는 보내지 않는다 · 기록은 이 기기 mpv_trlive 에만
var NOW6={ttl:{ko:"지금 여기",en:"Right now",ja:"いまここ",zhs:"现在",zht:"現在",es:"Ahora"},
 at:{ko:"{p}에 있어요",en:"You're at {p}",ja:"{p}にいます",zhs:"您在{p}",zht:"您在{p}",es:"Estás en {p}"},
 plan:{ko:"지금 일정: {p}",en:"On the plan now: {p}",ja:"今の予定：{p}",zhs:"当前行程：{p}",zht:"目前行程：{p}",es:"Ahora en el plan: {p}"},
 go:{ko:"{p} 가는 중",en:"On the way to {p}",ja:"{p}へ移動中",zhs:"正在前往{p}",zht:"正在前往{p}",es:"De camino a {p}"},
 first:{ko:"첫 장소: {p} {t}",en:"First stop: {p} at {t}",ja:"最初の場所：{p} {t}",zhs:"第一站：{p} {t}",zht:"第一站：{p} {t}",es:"Primera parada: {p} a las {t}"},
 lv:{ko:"떠날 예정 {t}",en:"leave around {t}",ja:"出発予定 {t}",zhs:"预计{t}离开",zht:"預計{t}離開",es:"salida prevista {t}"},
 nx:{ko:"다음: {p}",en:"Next: {p}",ja:"次：{p}",zhs:"下一站：{p}",zht:"下一站：{p}",es:"Siguiente: {p}"},
 end:{ko:"다음: 숙소로",en:"Next: back to your lodging",ja:"次：宿へ",zhs:"下一站：回住处",zht:"下一站：回住處",es:"Siguiente: al alojamiento"},
 endN:{ko:"다음: 오늘 일정 끝",en:"Next: end of today's plan",ja:"次：今日の予定終了",zhs:"下一步：今天行程结束",zht:"下一步：今天行程結束",es:"Siguiente: fin del plan de hoy"},
 b2:{ko:"오늘은 여기까지",en:"That's it for today",ja:"今日はここまで",zhs:"今天就到这里",zht:"今天就到這裡",es:"Hasta aquí por hoy"},
 b3:{ko:"다음 곳 길 안내",en:"Directions to next stop",ja:"次の場所への道案内",zhs:"前往下一站的路线",zht:"前往下一站的路線",es:"Cómo llegar a la siguiente"},
 rest:{ko:"오늘 남은 {n}곳: {l}",en:"{n} place(s) left today: {l}",ja:"今日残り{n}か所：{l}",zhs:"今天还剩{n}个地点：{l}",zht:"今天還剩{n}個地點：{l}",es:"Quedan {n} lugar(es) hoy: {l}"},
 tm:{ko:"내일로",en:"Move to tomorrow",ja:"明日へ",zhs:"改到明天",zht:"改到明天",es:"Pasar a mañana"},
 cx:{ko:"취소",en:"Cancel",ja:"キャンセル",zhs:"取消",zht:"取消",es:"Cancelar"},
 today:{ko:"오늘로",en:"Move to today",ja:"今日へ",zhs:"改到今天",zht:"改到今天",es:"Pasar a hoy"},
 stayQ:{ko:"{p}에 더 계시나요?",en:"Still at {p}?",ja:"まだ{p}にいますか？",zhs:"还在{p}吗？",zht:"還在{p}嗎？",es:"¿Sigues en {p}?"},
 stayB:{ko:"예정한 {m}이 지났어요. 더 있으면 뒤 일정을 1시간 밀어 다시 계산해요.",en:"Your planned {m} is up. If you stay, we'll push the rest of today back 1 hour.",ja:"予定の{m}が過ぎました。もう少しいるなら残りの予定を1時間遅らせて計算し直します。",zhs:"计划的{m}已经到了。如果再待一会儿，后面的行程会顺延1小时重新计算。",zht:"計畫的{m}已經到了。如果再待一會兒，後面的行程會順延1小時重新計算。",es:"Ya pasó el tiempo previsto ({m}). Si te quedas, retrasamos 1 hora el resto del día."},
 more:{ko:"더 있을게요",en:"I'll stay longer",ja:"もう少しいます",zhs:"我再待一会儿",zht:"我再待一會兒",es:"Me quedo más"},
 leave:{ko:"떠나요",en:"I'm leaving",ja:"出発します",zhs:"我要走了",zht:"我要走了",es:"Me voy"},
 htQ:{ko:"오늘 못 간 {l}",en:"Not visited today: {l}",ja:"今日行けなかった場所：{l}",zhs:"今天没去成：{l}",zht:"今天沒去成：{l}",es:"Hoy no visitaste: {l}"},
 htQy:{ko:"어제 못 간 {l}",en:"Not visited yesterday: {l}",ja:"昨日行けなかった場所：{l}",zhs:"昨天没去成：{l}",zht:"昨天沒去成：{l}",es:"Ayer no visitaste: {l}"},
 htB:{ko:"숙소에 도착했어요. 남은 곳을 어떻게 할까요?",en:"You're back at your lodging. What should we do with the rest?",ja:"宿に着きました。残りの場所はどうしますか？",zhs:"您已回到住处。剩下的地点怎么安排？",zht:"您已回到住處。剩下的地點怎麼安排？",es:"Ya estás en el alojamiento. ¿Qué hacemos con lo que queda?"},
 htBy:{ko:"어제 남은 곳을 어떻게 할까요?",en:"What should we do with yesterday's remaining places?",ja:"昨日の残りの場所はどうしますか？",zhs:"昨天剩下的地点怎么安排？",zht:"昨天剩下的地點怎麼安排？",es:"¿Qué hacemos con los lugares que quedaron ayer?"},
 lq:{ko:"오늘 밤 묵을 숙소가 있으세요?",en:"Do you have a place to stay tonight?",ja:"今夜泊まる宿はありますか？",zhs:"今晚有住的地方吗？",zht:"今晚有住的地方嗎？",es:"¿Tienes dónde dormir esta noche?"},
 lqB:{ko:"일정에 오늘 밤 숙소가 없어요.",en:"Your plan has no lodging for tonight.",ja:"予定に今夜の宿がありません。",zhs:"行程里没有今晚的住宿。",zht:"行程裡沒有今晚的住宿。",es:"Tu plan no tiene alojamiento para esta noche."},
 yes:{ko:"있어요",en:"Yes, I do",ja:"あります",zhs:"有",zht:"有",es:"Sí"},
 no:{ko:"없어요",en:"No",ja:"ありません",zhs:"没有",zht:"沒有",es:"No"},
 lqH:{ko:"숙소 이름으로 찾아 고르세요",en:"Search for your lodging by name",ja:"宿の名前で探して選んでください",zhs:"请按住宿名称搜索并选择",zht:"請按住宿名稱搜尋並選擇",es:"Busca tu alojamiento por nombre"},
 lqOk:{ko:"✓ 오늘 밤 숙소: {h}",en:"✓ Tonight: {h}",ja:"✓ 今夜の宿：{h}",zhs:"✓ 今晚住宿：{h}",zht:"✓ 今晚住宿：{h}",es:"✓ Esta noche: {h}"},
 moved:{ko:"{n}곳을 {d} 일정으로 옮겼어요",en:"Moved {n} place(s) to {d}",ja:"{n}か所を{d}の予定に移しました",zhs:"已把{n}个地点移到{d}",zht:"已把{n}個地點移到{d}",es:"Pasamos {n} lugar(es) a {d}"}};
var NOWS={stop:0,msg:"",h:0,lq:0,lr:null};
function dayIdx(pl,date){ if(!pl) return -1; for(var i=0;i<pl.days.length;i++) if(pl.days[i].date===date) return i; return -1; }
function nmsL(ks,l){ var pl=TR.plan; return ks.map(function(k){ var x=pl&&pl.pool[k]; return x?nmL(x,l):k; }).join(", "); }
function bell(o){ try{ if(window.BELL&&BELL.add) BELL.add(o); }catch(e){} }
function pqDone(k){ var q=LIVE.pq; if(q&&q.t==="stay"&&q.k===k) delete LIVE.pq; }
var STAYQ=60*60000;
function askCheck(why){ var r=null; try{ r=stayAsk(); }catch(e){} try{ if(why==="open"||why==="show") yAsk(); }catch(e){} try{ lodgeAsk(); }catch(e){} return r; }
function stayAsk(){ var L=liveToday(); if(!L||!L.arr.length) return null; var rec=liveRecs(L.d.date); if(!rec) return null; var now=Date.now(), cur=null;
  L.arr.forEach(function(x){ var q=rec[x.k]; if(q&&q.a!=null&&q.d==null) cur=x; }); if(!cur) return null;
  var q=rec[cur.k], qs=Array.isArray(q.q)?q.q:(q.q=[]), due=qs.length?qs[qs.length-1]+STAYQ:q.a+(cur.stay||60)*60000;
  if(now<due) return null;
  qs.push(now); LIVE.pq={t:"stay",d:L.d.date,k:cur.k,at:now}; liveSave(); window.__trAsk=(window.__trAsk||0)+1;
  bell({k:"trip",ti:F6x(NOW6.stayQ,function(l){ return {p:nmL(cur,l)}; }),bd:F6x(NOW6.stayB,function(l){ return {m:durL(cur.stay||60,l)}; }),go:{k:"trip",q:"stay"}});
  try{ nowPaint(); }catch(e){} return {asked:1,k:cur.k,n:qs.length}; }
function hotelArrive(L){ var date=L.d.date, now=Date.now(); LIVE.hq=LIVE.hq||{}; if(LIVE.hq[date]||kminOn(now,date)<17*60) return null;
  var rec=liveRecs(date)||{}, ks=L.arr.filter(function(x){ var q=rec[x.k]; return !(q&&(q.a!=null||q.d!=null)); }).map(function(x){ return x.k; }); if(!ks.length) return null;
  LIVE.hq[date]={at:now,ks:ks,ans:0}; LIVE.pq={t:"hotel",d:date,ks:ks,at:now}; liveSave();
  bell({k:"trip",ti:F6x(NOW6.htQ,function(l){ return {l:nmsL(ks,l)}; }),bd:NOW6.htB,go:{k:"trip",q:"hotel"}}); try{ nowPaint(); }catch(e){} return {asked:1,ks:ks}; }
function yAsk(){ var hq=LIVE.hq||{}, yd=kstToday(-1), q=hq[yd], pl=TR.plan; if(!q||q.ans||q.again||!pl) return null; var di=dayIdx(pl,yd); if(di<0) return null;
  var ks=(q.ks||[]).filter(function(k){ return pl.days[di].stops.indexOf(k)>=0; }); q.again=1; if(!ks.length){ q.ans=1; liveSave(); return null; }
  LIVE.pq={t:"hotel",d:yd,ks:ks,y:1,at:Date.now()}; liveSave();
  bell({k:"trip",ti:F6x(NOW6.htQy,function(l){ return {l:nmsL(ks,l)}; }),bd:NOW6.htBy,go:{k:"trip",q:"hotel"}}); try{ nowPaint(); }catch(e){} return {asked:1,ks:ks}; }
// 오늘 밤 숙소 물음 — 그날 밤 숙소가 없고(전국 일정은 그 도시 숙소, 예전 일정은 숙소 하나) 마지막 장소 도착 · 또는 하루 끝 1시간 전
function lodgeAsk(){ var L=liveToday(); if(!L||!L.arr.length) return null; var pl=L.pl, date=L.d.date; LIVE.lq=LIVE.lq||{}; if(LIVE.lq[date]) return null;
  if(pl.mc){ var nc=L.d.nc!=null?L.d.nc:L.d.c; if(nc<0||hotelPt(pl,nc)) return null; } else { var H=liveH(); if(H||(pl.hotel&&pl.hotel.type==="here")) return null; if(L.di===pl.days.length-1&&pl.days.length>1) return null; }
  var rec=liveRecs(date)||{}, last=L.arr[L.arr.length-1], ql=rec[last.k], X=liveX(L), lim=dayLim(pl,L.d,X.H,L.arr,X.dt,X), now=kminOn(Date.now(),date);
  if(!((ql&&ql.a!=null)||now>=lim-60)) return null;
  LIVE.lq[date]={at:Date.now()}; LIVE.pq={t:"lodge",d:date,at:Date.now()}; liveSave();
  bell({k:"trip",ti:NOW6.lq,bd:NOW6.lqB,go:{k:"trip",q:"lodge"}}); try{ nowPaint(); }catch(e){} return {asked:1}; }
// 출발 순간 — 다음 이동이 택시면 네이버 길찾기(실시간 교통)로 그 구간 시간을 받아 계획 시간 대신 (허브 /ndrive · 하루 상한 · 키 없으면 그냥 지나감)
function liveDrive(L,k){ try{ var pl=L.pl, X=liveX(L), mo=moX(L.di,X), lv=liveLv(pl,L.di,X.H,L.arr,X.dt,mo,X.from); if(!lv) return; var s=sched(X.H,L.arr,X.dt,X.from,mo,lv), i=-1, j, nx=null, lg=null, from=pl.pool[k];
  s.rows.forEach(function(r,q){ if(r.x&&r.x.k===k) i=q; }); if(i<0||!from) return;
  for(j=i+1;j<s.rows.length;j++){ var r=s.rows[j]; if(r.meal){ if(r.r&&r.leg){ nx=r.r; lg=r.leg; break; } if(r.to&&r.leg&&r.next){ nx=r.next; lg=r.leg; break; } continue; } nx=r.x; lg=r.leg; break; }
  if(!nx&&s.back){ nx=hE(X.H); lg=s.back; }
  if(!nx||!lg||lg.mode!=="taxi"||lg.live) return;
  var me=(window.ME&&ME.pos)?{lat:+ME.pos[0],lng:+ME.pos[1]}:from, date=L.d.date;
  window.__trDriveAsk=(window.__trDriveAsk||0)+1;
  ndrive([[me.lat,me.lng,+nx.lat,+nx.lng]]).then(function(r){ var q=r&&r[0]; if(!q||!(q.min>0)) return; LIVE.dr=LIVE.dr||{}; (LIVE.dr[date]=LIVE.dr[date]||{})[k+">"+nx.k]={min:Math.round(q.min),fare:q.taxi||null,at:Date.now()}; liveSave(); window.__trDrive=q; liveChanged("drive"); }); }catch(e){} }
// 지금 상태 (카드용)
function nowState(){ var L=liveToday(); if(!L||!L.arr.length) return null; var pl=L.pl, X=liveX(L), mo=moX(L.di,X), lv=liveLv(pl,L.di,X.H,L.arr,X.dt,mo,X.from), s=sched(X.H,L.arr,X.dt,X.from,mo,lv), now=kminOn(Date.now(),L.d.date);
  var rows=s.rows.filter(function(r){ return r.x; }); if(!rows.length) return null;
  var st0=X.pre&&X.pre.length&&X.pre[0].t!=null?X.pre[0].t:rows[0].t-((rows[0].leg&&rows[0].leg.min)||30);
  var rec=liveRecs(L.d.date)||{}, cur=null, going=null, plan=0, ci=-1, i;
  rows.forEach(function(r,q){ var x=rec[r.x.k]; if(x&&x.a!=null&&x.d==null){ cur=r; ci=q; } });
  if(!cur&&lv){ for(i=0;i<rows.length;i++){ if(L.arr.indexOf(rows[i].x)>lv.i){ going=rows[i]; ci=i-1; break; } } if(!going) ci=rows.length; }
  if(!cur&&!lv){ rows.forEach(function(r,q){ if(r.t<=now+15){ cur=r; ci=q; } }); plan=1; }
  var nxt=cur?(rows[ci+1]||null):going;
  return {L:L,X:X,s:s,lv:lv,now:now,st0:st0,cur:cur,going:going,nxt:nxt,lg:nxt?nxt.leg:s.back,plan:plan,ci:ci,rows:rows}; }
function remainKeys(N){ if(!N) return []; var rec=liveRecs(N.L.d.date)||{}; return N.rows.slice(Math.max(0,N.ci+1)).filter(function(r){ var q=rec[r.x.k]; return !(q&&(q.a!=null||q.d!=null)); }).map(function(r){ return r.x.k; }); }
function qHtml(pq){ var pl=TR.plan; if(!pq||!pl) return "";
  if(pq.t==="stay"){ var x=pl.pool[pq.k]; if(!x) return ""; return '<div class="tnq"><b>'+esc(gTxt(NOW6.stayQ,{p:nm(x)}))+'</b><div>'+esc(gTxt(NOW6.stayB,{m:durTxt(x.stay||60)}))+'</div><div class="tnb"><button type="button" data-tq="more">'+esc(T5(NOW6.more))+'</button><button type="button" data-tq="leave">'+esc(T5(NOW6.leave))+'</button><button type="button" data-tq="stop">'+esc(T5(NOW6.b2))+'</button></div></div>'; }
  if(pq.t==="hotel") return '<div class="tnq"><b>'+esc(gTxt(pq.y?NOW6.htQy:NOW6.htQ,{l:nmList(pq.ks||[])}))+'</b><div>'+esc(T5(pq.y?NOW6.htBy:NOW6.htB))+'</div><div class="tnb"><button type="button" data-tq="htm">'+esc(T5(pq.y?NOW6.today:NOW6.tm))+'</button><button type="button" data-tq="hcx">'+esc(T5(NOW6.cx))+'</button></div></div>';
  if(pq.t==="lodge"){ var h='<div class="tnq"><b>'+esc(T5(NOW6.lq))+'</b><div>'+esc(T5(NOW6.lqB))+'</div>';
    if(NOWS.lq===1) h+='<div class="tnr"><div class="tnsr"><input id="trNowHQ" placeholder="'+esc(T5(NOW6.lqH))+'"><button type="button" data-tq="lsr">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div><div id="trNowHR">'+(NOWS.lr?(NOWS.lr.length?NOWS.lr.slice(0,5).map(function(x,i){ return '<div class="tra" data-tq="lpk" data-i="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join(""):'<div class="d">'+esc(T("찾은 곳이 없어요","No results"))+'</div>'):'')+'</div></div>';
    else h+='<div class="tnb"><button type="button" data-tq="lyes">'+esc(T5(NOW6.yes))+'</button><button type="button" data-tq="lno">'+esc(T5(NOW6.no))+'</button></div>';
    return h+'</div>'; }
  return ""; }
function nowHtml(N){ var pq=LIVE.pq, h='<div class="tnh"><b>'+MPIMG("mi_pin",MIS)+esc(T5(NOW6.ttl))+(N?' · '+esc(T((N.L.di+1)+"일차","Day "+(N.L.di+1))):'')+'</b><button type="button" class="tnx" data-tn="x" aria-label="close">✕</button></div>';
  if(pq) h+=qHtml(pq);
  if(NOWS.msg) h+='<div class="tnm">'+NOWS.msg+'</div>';
  if(N){ if(N.cur) h+='<div class="tnc"><b>'+esc(gTxt(N.plan?NOW6.plan:NOW6.at,{p:nm(N.cur.x)}))+'</b> <span>'+esc(gTxt(NOW6.lv,{t:m2hm(N.cur.t+(N.cur.st||N.cur.x.stay))}))+'</span></div>';
    else if(N.going) h+='<div class="tnc"><b>'+esc(gTxt(NOW6.go,{p:nm(N.going.x)}))+'</b> <span>'+esc(gTxt(LV6.eta,{a:m2hm(N.going.t)}))+'</span></div>';
    else if(N.nxt) h+='<div class="tnc"><b>'+esc(gTxt(NOW6.first,{p:nm(N.nxt.x),t:m2hm(N.nxt.t)}))+'</b></div>';
    if(N.cur&&N.nxt) h+='<div class="tnn">➡ '+esc(gTxt(NOW6.nx,{p:nm(N.nxt.x)}))+(N.lg?' · '+legTxt(N.lg):'')+'</div>';
    else if(N.cur&&N.lg) h+='<div class="tnn">➡ '+esc(T5(hE(N.X.H)?NOW6.end:NOW6.endN))+' · '+legTxt(N.lg)+'</div>';
    h+='<div class="tnb">'+(N.cur?'<button type="button" data-tn="leave">'+esc(T5(LV6.leave))+'</button>':'')+'<button type="button" data-tn="stop">'+esc(T5(NOW6.b2))+'</button>'+((N.nxt||N.going)?'<button type="button" data-tn="go">'+esc(T5(NOW6.b3))+'</button>':'')+'</div>';
    if(NOWS.stop){ var ks=remainKeys(N); h+=ks.length?'<div class="tnr"><b>'+esc(gTxt(NOW6.rest,{n:ks.length,l:nmList(ks)}))+'</b><div class="tnb"><button type="button" data-tn="tm">'+esc(T5(NOW6.tm))+'</button><button type="button" data-tn="cx">'+esc(T5(NOW6.cx))+'</button></div></div>':'<div class="tnr">'+esc(T5(LV6.none))+'</div>'; }
    h+='<div id="trNowGo"></div>'; }
  return h; }
function nowSig(N){ return N?((N.cur?N.cur.x.k:"")+"|"+(N.going?N.going.x.k:"")):""; }
function nowPaint(){ var el=document.getElementById("trNow"), N=null; try{ N=nowState(); }catch(e){ N=null; }
  var pq=LIVE.pq, td=kstToday(0); if(pq&&!(pq.d===td||(pq.y&&pq.d===kstToday(-1)))){ delete LIVE.pq; pq=null; }
  var inDay=!!(N&&N.now>=N.st0-60&&N.now<=N.s.end+60), show=!!pq||inDay;
  if(show&&!pq&&!NOWS.stop&&!NOWS.msg&&LIVE.nx&&LIVE.nx.d===td&&LIVE.nx.s===nowSig(N)) show=false;   // ✕ 로 닫은 그 상태 그대로면 안 띄움
  if(!show){ if(el){ el.remove(); nowFit(0); } return; }
  if(!el){ el=document.createElement("div"); el.id="trNow"; el.setAttribute("role","region"); document.body.appendChild(el); }
  var go=document.getElementById("trNowGo"), keep=go?go.innerHTML:"";
  el.innerHTML=nowHtml(inDay?N:null); if(keep){ var g2=document.getElementById("trNowGo"); if(g2) g2.innerHTML=keep; }
  nowFit(el.offsetHeight); }
function nowFit(h){ var de=document.documentElement, on=de.classList.contains("trnowon");
  if(h){ de.style.setProperty("--trnowh",(h+14)+"px"); if(!on||Math.abs((NOWS.h||0)-h)>8){ de.classList.add("trnowon"); NOWS.h=h; try{ window.dispatchEvent(new Event("resize")); }catch(e){} } }
  else if(on){ de.classList.remove("trnowon"); de.style.removeProperty("--trnowh"); NOWS.h=0; try{ window.dispatchEvent(new Event("resize")); }catch(e){} } }
function nowMsgSet(t){ NOWS.msg=t; clearTimeout(NOWS.mt); NOWS.mt=setTimeout(function(){ NOWS.msg=""; try{ nowPaint(); }catch(e){} },8000); }
function resMsg(r,v){ if(!r) return ""; if(r.none) return esc(T5(NX6.nomv)); var pl=TR.plan; if(v==="tm"||v==="htm"){ var d=pl&&pl.days[r.di]; return esc(gTxt(NOW6.moved,{n:r.n,d:d?dateTxt(new Date(d.date+"T00:00:00Z")):""})); } return esc(gTxt(LV6.r2,{n:r.n||0})); }
function nowAct(v,b){ var N=null; try{ N=nowState(); }catch(e){} var pq=LIVE.pq, pl=TR.plan, rec, r;
  if(v==="x"){ LIVE.nx={d:kstToday(0),s:nowSig(N)}; NOWS.stop=0; NOWS.msg=""; liveSave(); var qm=document.getElementById("trQ"); if(qm) qm.remove(); nowPaint(); return; }
  if(v==="leave"&&b&&b.dataset.tn){ if(N&&N.cur) liveLeave(N.cur.x.k); return; }
  if(v==="stop"){ NOWS.stop=NOWS.stop?0:1; if(pq&&pq.t==="stay"){ delete LIVE.pq; liveSave(); } nowPaint(); return; }
  if(v==="go"){ var t=N&&(N.going?N.going.x:N.nxt&&N.nxt.x); if(!t) return; try{ ntap("_trip","now_route"); }catch(z){}
    if(window.PLACES&&PLACES[t.k]&&!/^pin_/.test(t.k)&&typeof placeShow==="function"){ try{ placeShow(t.k); var rs=document.getElementById("res"); if(rs) rs.scrollIntoView({block:"start",behavior:"smooth"}); }catch(z){} return; }
    var g=document.getElementById("trNowGo"); if(g) g.innerHTML='<div class="tnl"><b>➡ '+esc(nm(t))+'</b><br>'+(typeof linksTo==="function"?linksTo(t.ko,t.lat,t.lng,null,t.addr):"")+'</div>'; nowFit((document.getElementById("trNow")||{}).offsetHeight||0); return; }
  if(v==="tm"||v==="cx"){ if(!N) return; var ks=remainKeys(N); r=v==="tm"?liveMoveSet(N.L.di,ks):liveCancelSet(N.L.di,ks); NOWS.stop=0; nowMsgSet(resMsg(r,v)); liveSave(); liveChanged("stop"); return; }
  if(!pq) { nowPaint(); return; }
  if(v==="more"&&pq.t==="stay"){ rec=liveRecs(pq.d,1); if(rec[pq.k]) rec[pq.k].u=Date.now()+STAYQ; delete LIVE.pq; liveSave(); try{ ntap("_trip","stay_more"); }catch(z){} liveChanged("more"); return; }
  if(v==="leave"&&pq.t==="stay"){ var k0=pq.k; delete LIVE.pq; liveLeave(k0); return; }
  if((v==="htm"||v==="hcx")&&pq.t==="hotel"){ var di=dayIdx(pl,pq.d); if(di<0){ delete LIVE.pq; liveSave(); nowPaint(); return; } r=v==="htm"?liveMoveSet(di,pq.ks||[]):liveCancelSet(di,pq.ks||[]); if(LIVE.hq&&LIVE.hq[pq.d]) LIVE.hq[pq.d].ans=1; delete LIVE.pq; nowMsgSet(resMsg(r,v)); liveSave(); liveChanged("hotelq"); var qm2=document.getElementById("trQ"); if(qm2) qm2.remove(); return; }
  if(pq.t==="lodge"){ var L0=liveToday();
    if(v==="lyes"){ NOWS.lq=1; NOWS.lr=null; nowPaint(); qRefresh(); return; }
    if(v==="lno"){ delete LIVE.pq; liveSave(); NOWS.lq=0; var qm3=document.getElementById("trQ"); if(qm3) qm3.remove(); nowPaint(); if(L0&&pl){ var nc=pl.mc?(L0.d.nc!=null?L0.d.nc:L0.d.c):null; lodgeFor(pl,L0.di,nc,(window.ME&&ME.pos)?{lat:+ME.pos[0],lng:+ME.pos[1]}:null); } return; }
    if(v==="lsr"){ var q=((document.getElementById("trNowHQ")||{}).value||"").trim(); if(!q) return; fetch(HUB+"/kplace?q="+encodeURIComponent(q)+kpL()).then(function(r2){ return r2.json(); }).then(function(j){ NOWS.lr=((j&&j.ok&&j.items)||[]).slice(0,5); nowPaint(); qRefresh(); }).catch(function(){ NOWS.lr=[]; nowPaint(); qRefresh(); }); return; }
    if(v==="lpk"){ var x=NOWS.lr&&NOWS.lr[+b.dataset.i]; if(!x||!L0) return; var h={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""}, nc2=pl.mc?(L0.d.nc!=null?L0.d.nc:L0.d.c):null;
      natSetHotel(pl,nc2,h,L0.di); delete LIVE.pq; NOWS.lq=0; NOWS.lr=null; liveSave(); nowMsgSet(esc(gTxt(NOW6.lqOk,{h:L()&&h.en?h.en:h.ko}))+' <span class="tnl">'+taxiBtn(h)+'</span>'); var qm4=document.getElementById("trQ"); if(qm4) qm4.remove(); nowPaint(); return; } } }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trNow [data-tn], #trNow [data-tq], #trQ [data-tq]"); if(!b) return; e.preventDefault(); e.stopPropagation(); nowAct(b.dataset.tn||b.dataset.tq,b); },true);
// 🔔 알림을 누르면 — 묻는 중이면 그 물음(첫 화면이면 카드, 다른 창이 떠 있으면 같은 물음 창) · 아니면 늦어짐 주의 창
function qModal(){ var o=document.getElementById("trQ"); if(o) o.remove(); if(!LIVE.pq) return null; var b=document.createElement("div"); b.id="trQ"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ var h=qHtml(LIVE.pq); if(!h){ b.remove(); return; } b.innerHTML='<div class="talbox" style="text-align:left">'+h+'<button type="button" class="talx" onclick="this.closest(\'.trpop\').remove()">'+esc(T5(LV6.x))+'</button></div>'; };
  b._rb=draw; draw(); document.body.appendChild(b); return b; }
function qRefresh(){ var b=document.getElementById("trQ"); if(b&&b._rb) b._rb(); }
function tripAlert(go){ if(go&&go.q&&LIVE.pq){ if(document.querySelector(".trsheet")) return qModal(); nowPaint(); var el=document.getElementById("trNow"); if(el){ el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } return el; } return liveModal(); }
// ── 일정 짜기 창 — 공항(도착·출발)·인원·도시별 숙소 (11-06) ──
var AP6={arr:{ko:"도착 공항",en:"Arrival airport",ja:"到着空港",zhs:"到达机场",zht:"抵達機場",es:"Aeropuerto de llegada"},
 dep:{ko:"출발 공항",en:"Departure airport",ja:"出発空港",zhs:"出发机场",zht:"出發機場",es:"Aeropuerto de salida"},
 none:{ko:"— 없음 —",en:"— None —",ja:"— なし —",zhs:"— 无 —",zht:"— 無 —",es:"— Ninguno —"},
 tA:{ko:"도착 시각 (선택)",en:"Landing time (optional)",ja:"到着時刻（任意）",zhs:"到达时间（可选）",zht:"抵達時間（可選）",es:"Hora de llegada (opcional)"},
 tD:{ko:"출발 시각 (선택)",en:"Departure time (optional)",ja:"出発時刻（任意）",zhs:"起飞时间（可选）",zht:"起飛時間（可選）",es:"Hora de salida (opcional)"},
 i:{ko:"국제선",en:"International",ja:"国際線",zhs:"国际航班",zht:"國際航班",es:"Internacional"},
 d:{ko:"국내선",en:"Domestic",ja:"国内線",zhs:"国内航班",zht:"國內航班",es:"Nacional"},
 note:{ko:"도착: 입국 뒤 1시간 30분(국내선 45분)부터 일정 · 출발: 국제선 3시간·국내선 1시간 30분 전 공항 도착",en:"Arrival: the plan starts 1 h 30 min after landing (domestic 45 min) · Departure: be at the airport 3 h before (domestic 1 h 30 min)",ja:"到着：入国後1時間30分（国内線45分）から予定 · 出発：国際線3時間・国内線1時間30分前に空港到着",zhs:"到达：入境后1小时30分钟（国内航班45分钟）开始行程 · 出发：国际航班提前3小时、国内航班提前1小时30分钟到达机场",zht:"抵達：入境後1小時30分鐘（國內航班45分鐘）開始行程 · 出發：國際航班提前3小時、國內航班提前1小時30分鐘到達機場",es:"Llegada: el plan empieza 1 h 30 min después de aterrizar (nacional 45 min) · Salida: estar en el aeropuerto 3 h antes (nacional 1 h 30 min)"},
 ch:{ko:"도시별 숙소",en:"Lodging by city",ja:"都市ごとの宿",zhs:"各城市住宿",zht:"各城市住宿",es:"Alojamiento por ciudad"},
 nh:{ko:"— 정하지 않음 —",en:"— Not set —",ja:"— 未定 —",zhs:"— 未定 —",zht:"— 未定 —",es:"— Sin definir —"},
 hint:{ko:"숙소를 정하지 않은 도시는 일정표의 「숙소 찾기」로 정할 수 있어요",en:"Cities without lodging can be set later with “Find lodging” in the plan",ja:"宿を決めていない都市は日程表の「宿を探す」で決められます",zhs:"未定住宿的城市可在行程表中用「查找住宿」设定",zht:"未定住宿的城市可在行程表中用「查找住宿」設定",es:"Las ciudades sin alojamiento se pueden definir luego con «Buscar alojamiento» en el plan"},
 pax:{ko:"인원",en:"Travelers",ja:"人数",zhs:"人数",zht:"人數",es:"Viajeros"}};
var PANELG=null;
function panelGroups(){ var P=TR.items.filter(function(it){ var c=catOf(it); return c!=="hotel"&&c!=="trans"; }); if(P.length<2) return null; var G=natGroups(P); if(G.length<2) return null; natHotels(G,null); return G; }
function natHotelRows(G){ return '<div class="wide trch"><span class="trchh">'+esc(T5(AP6.ch))+'</span>'+G.map(function(g,i){ var cur=g.h;
    var opts='<option value="">'+esc(T5(AP6.nh))+'</option>'+HOTELS.filter(function(h){ return km(h,g)<=40; }).map(function(h){ return '<option value="'+esc(h.k)+'"'+(cur&&cur.k===h.k?' selected':'')+'>🏨 '+esc(nm(h))+'</option>'; }).join("")+(cur&&!cur.k&&cur.type!=="here"?'<option value="__cur" selected>🔎 '+esc(L()&&cur.en?cur.en:cur.ko)+'</option>':'');
    return '<div class="trchr"><span class="trchn">'+esc(cnm(g.nm))+'</span><select data-chs="'+i+'">'+opts+'</select><button type="button" class="tb" data-chf="'+i+'" title="'+esc(T5(NX6.hPick))+'">'+MPIMG("mi_stay","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div>'; }).join("")+'<div class="d">'+esc(T5(AP6.hint))+'</div></div>'; }
function natApRows(){ var ap=TR.opt.ap||{}, ids=Object.keys(APT).filter(function(id){ return APT[id].ui; }), pax=TR.opt.pax||1;
  var row=function(w){ var q=ap[w]||{}; return '<div class="wide trapr"><span class="trapl">'+esc(T5(w==="a"?AP6.arr:AP6.dep))+'</span><div class="trapf"><select id="trAp'+w+'" data-apw="'+w+'"><option value="">'+esc(T5(AP6.none))+'</option>'+ids.map(function(id){ return '<option value="'+id+'"'+(q.id===id?' selected':'')+'>'+esc(apNm(id))+'</option>'; }).join("")+'</select>'
    +'<input type="time" id="trApT'+w+'" data-apw="'+w+'" value="'+esc(q.t||"")+'" aria-label="'+esc(T5(w==="a"?AP6.tA:AP6.tD))+'" title="'+esc(T5(w==="a"?AP6.tA:AP6.tD))+'"><select id="trApK'+w+'" data-apw="'+w+'"><option value="i"'+(q.k!=="d"?' selected':'')+'>'+esc(T5(AP6.i))+'</option><option value="d"'+(q.k==="d"?' selected':'')+'>'+esc(T5(AP6.d))+'</option></select></div><span class="trapt">'+esc(T5(w==="a"?AP6.tA:AP6.tD))+'</span></div>'; };
  return '<label>'+esc(T5(AP6.pax))+'<select id="trPax">'+[1,2,3,4,5,6,7,8,9].map(function(d){ return '<option'+(pax===d?" selected":"")+'>'+d+'</option>'; }).join("")+'</select></label>'+row("a")+row("d")+'<div class="wide d" style="margin-top:-4px">'+esc(T5(AP6.note))+'</div>'; }
function natPanelWire(box){ var g=function(id){ return document.getElementById(id); }, o=TR.opt;
  var apSave=function(w,chg){ var s=g("trAp"+w), t=g("trApT"+w), k=g("trApK"+w); if(!s) return; o.ap=o.ap||{}; if(!s.value){ o.ap[w]=null; save(); return; }
    if(chg==="id"&&k) k.value=s.value==="cju"?"d":"i"; o.ap[w]={id:s.value,t:(t&&hm2m(t.value)!=null)?t.value:"",k:k&&k.value==="d"?"d":"i"}; save(); };
  ["a","d"].forEach(function(w){ if(g("trAp"+w)) g("trAp"+w).onchange=function(){ apSave(w,"id"); }; if(g("trApT"+w)) g("trApT"+w).onchange=function(){ apSave(w); }; if(g("trApK"+w)) g("trApK"+w).onchange=function(){ apSave(w); }; });
  if(g("trPax")) g("trPax").onchange=function(){ o.pax=+this.value; save(); };
  [].forEach.call(box.querySelectorAll("[data-chs]"),function(s){ s.onchange=function(){ var G=PANELG, gg=G&&G[+s.dataset.chs]; if(!gg) return; o.hotels=o.hotels||{}; var v=s.value; if(v==="__cur") return;
    var h=HOTELS.filter(function(x){ return x.k===v; })[0]; o.hotels[gg.id]=h?{type:"place",k:h.k,ko:h.ko,en:h.en,lat:h.lat,lng:h.lng}:null; save(); }; });
  [].forEach.call(box.querySelectorAll("[data-chf]"),function(b){ b.onclick=function(){ var gg=PANELG&&PANELG[+b.dataset.chf]; if(!gg) return;
    openLodge({lat:gg.lat,lng:gg.lng,date:o.start||kstToday(1),n:1,city:cnm(gg.nm),cityKo:gg.nm.ko,cityEn:gg.nm.en,cb:function(h){ o.hotels=o.hotels||{}; o.hotels[gg.id]=h; save(); if(document.getElementById("trBox")) panelPaint(); }}); }; }); }
// 숙소 이름·주소 찾기로 고른 곳 — 도시가 여럿이면 가까운 도시 숙소로
function natAssignHotel(h){ var G=PANELG; if(!G||G.length<2) return false; var b=null, bd=1e9; G.forEach(function(g){ var d=km(g,h); if(d<bd){ bd=d; b=g; } }); if(!b||bd>40) return false; TR.opt.hotels=TR.opt.hotels||{}; TR.opt.hotels[b.id]=h; return true; }

// ══ 일정 화면에서 장소·식당 이름을 누르면 「무엇 하는 곳인지」 팝업 (사장님 11-06) ══
//  · 지금 장소 카드(placeShow·spinCard)와 같은 조각을 그대로: 사진(cph — 같은 /gphoto 주소·같은 캐시 _cphC) · 이름 · 💡 tipTag · 설명(LD = dko/den…) · 주소 · 전화(telLine) · linksTo(길찾기·택시 K.Ride/카카오 T·자세히 보기)
//  · 더한 것: 종류(우리 분류·카카오 분류·구글 종류) · 그날 영업시간/입장 마감 · 그 일정의 💡 AI 팁 · 보고서 위에 뜨고 ✕·뒤로가기로 닫힌다 · 새 호출은 사진(장소 카드와 같은 것)뿐
var KIND6={palace:["궁궐","Palace","宮殿","宫殿","宮殿","Palacio"],museum:["박물관·미술관","Museum · gallery","博物館・美術館","博物馆·美术馆","博物館·美術館","Museo · galería"],market:["시장","Market","市場","市场","市場","Mercado"],
 tower:["전망대·타워","Tower · observatory","展望台・タワー","观景台·塔","觀景台·塔","Torre · mirador"],show:["공연장","Performance venue","劇場","剧场","劇場","Teatro"],shop:["쇼핑","Shopping","ショッピング","购物","購物","Compras"],
 temple:["사찰·성당","Temple · church","寺院・聖堂","寺庙·教堂","寺廟·教堂","Templo · iglesia"],park:["공원·해변","Park · beach","公園・ビーチ","公园·海滩","公園·海灘","Parque · playa"],cruise:["유람선","Cruise","遊覧船","游船","遊船","Crucero"],
 village:["마을","Village","村","村落","村落","Aldea"],street:["거리·명소","Street · sight","街・名所","街区·景点","街區·景點","Calle · lugar de interés"],theme:["놀이공원","Theme park","テーマパーク","主题乐园","主題樂園","Parque temático"],
 mount:["산","Mountain","山","山","山","Montaña"],hq:["기업 사옥","Company HQ","本社","总部","總部","Sede de empresa"],bar:["바·술집·클럽","Bar · pub · club","バー・パブ・クラブ","酒吧·夜店","酒吧·夜店","Bar · pub · club"],
 hotel:["숙소","Lodging","宿泊","住宿","住宿","Alojamiento"],trans:["교통","Transport","交通","交通","交通","Transporte"],food:["식당","Restaurant","レストラン","餐厅","餐廳","Restaurante"]};
var PP6={kind:{ko:"종류",en:"Type",ja:"種類",zhs:"类型",zht:"類型",es:"Tipo"},hrs:{ko:"이 날 ({d})",en:"On {d}",ja:"この日（{d}）",zhs:"当天（{d}）",zht:"當天（{d}）",es:"Ese día ({d})"},
 cl:{ko:"정기 휴무: {w}",en:"Regular closing day: {w}",ja:"定休日：{w}",zhs:"固定休息日：{w}",zht:"固定休息日：{w}",es:"Cierre semanal: {w}"},ai:{ko:"AI 팁",en:"AI tip",ja:"AIのヒント",zhs:"AI 提示",zht:"AI 提示",es:"Consejo de la IA"},
 rt:{ko:"별점",en:"Rating",ja:"評価",zhs:"评分",zht:"評分",es:"Valoración"},x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}};
var WD6={ko:"일월화수목금토",en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ja:"日月火水木金土",zhs:["周日","周一","周二","周三","周四","周五","周六"],zht:["週日","週一","週二","週三","週四","週五","週六"],es:["dom","lun","mar","mié","jue","vie","sáb"]};
function wdL(i){ var w=WD6[LANG]||WD6.en; return typeof w==="string"?w.charAt(i)+(LANG==="ko"?"요일":"曜日"):w[i]; }
function kindL(x){ var c; if(isBar(x)) c="bar"; else if(x.eat) c="food"; else c=catOf(x); var k=KIND6[c]||KIND6.street, i=LG6s.indexOf(LANG); return k[i<0?1:i]; }
function ppPhoto(k,ko,lat,lng,el){ if(!el||!ko||!(+lat)) return; var fxT=window.CPH_FIX||{}, fx=fxT[k]||null, fq=fx?(fx.q?"&pq="+encodeURIComponent(fx.q):"")+(fx.pi!=null?"&pi="+fx.pi:""):"", ck=ko+"|"+(+lat).toFixed(4)+","+(+lng).toFixed(4)+fq, C=window._cphC||(window._cphC={});   // 장소 카드 cphLoad 와 같은 주소·같은 캐시
  var put=function(j){ if(!el.isConnected||!j||!j.ok) return; var at=(j.attr||[]).filter(function(a){ return a&&a.n; }).map(function(a){ return /^https:\/\//.test(a.u||"")?'<a href="'+esc(a.u)+'" target="_blank" rel="noopener">'+esc(a.n)+'</a>':esc(a.n); }).join(", ");
    el.innerHTML='<img alt="" src="'+HUB+esc(j.img)+'"><div class="cpa">'+(at?T("사진","Photo")+': '+at+' · ':'')+'Google</div>'; var im=el.querySelector("img"); im.onerror=function(){ el.hidden=true; }; im.onload=function(){ el.hidden=false; }; };
  if(C[ck]) return put(C[ck]); fetch(HUB+"/gphoto?q="+encodeURIComponent(ko)+"&lat="+(+lat).toFixed(5)+"&lng="+(+lng).toFixed(5)+fq).then(function(r){ return r.json(); }).then(function(j){ C[ck]=j; put(j); }).catch(function(){}); }
var PPS=null;   // 열린 팝업 {t:"place"|"eat", k, di, mk, i}
function ppHtml(){ var pl=TR.plan, s=PPS; if(!pl||!s) return ""; var h='', ai=(pl.ai&&pl.ai.tips)||{};
  if(s.t==="eat"){ var c=s.c; if(!c) return ""; var kd=c.src==="near"?(L()?(c.cat_en||kindX(c.kind)):String(c.cat||"").split(">").slice(1).map(function(x){ return x.trim(); }).join("·")):(L()?(c.kind_x||c.kind_en||c.kind):c.kind);
    h='<div class="item">'+(c.lat?'<div class="cph" hidden></div>':'')+'<div class="t">'+MPICO("mi_food",eatName(c),MIS)+'</div>'+(L()&&c.en!==c.ko?'<div class="d">'+esc(c.ko)+'</div>':'')
      +'<div class="ppk"><b>'+esc(T5(PP6.kind))+'</b> '+esc(KIND6.food[Math.max(0,LG6s.indexOf(LANG))])+(kd?' · '+esc(kd):'')+'</div>'
      +(c.menu&&c.menu!==c.kind?'<div class="d" style="color:var(--ink)">'+esc((L()&&c.menu_x)||c.menu)+'</div>':'')+(c.src==="ad"&&LD(c)?'<div class="d" style="color:var(--ink)">'+esc(LD(c))+'</div>':'')
      +(c.srcs&&c.srcs.length?'<div class="d">'+MPIMG("mi_doc",MIS)+esc(c.srcs.map(function(q){ return LP(q); }).join(" · "))+'</div>':'')
      +'<div class="d">'+esc(L()?(c.addr_en||c.addr||""):(c.addr||""))+'</div>'+telLine(c.tel)+linksTo(c.ko,c.lat,c.lng,c.ko,c.addr)+'</div>';
    return h; }
  var x=pl.pool[s.k]; if(!x) return ""; var p=(!x.pin&&window.PLACES&&PLACES[s.k])||x, d=pl.days[s.di], dt=d?new Date(d.date+"T00:00:00Z"):null, nmx=nm(x);
  h='<div class="item"><div class="cph" hidden></div><div class="t">'+(x.pin?MPICO("mi_pin",nmx,MIS):esc(nmx))+'</div>'+(x.pin&&L()&&x.en!==x.ko?'<div class="d">'+esc(x.ko)+'</div>':'')+(!x.pin?tipTag(p):'')
    +'<div class="ppk"><b>'+esc(T5(PP6.kind))+'</b> '+esc(kindL(x))+(x.pin&&x.cat?' · '+esc(L()?(x.cat_en||String(x.cat).split(">").pop().trim()):String(x.cat).split(">").pop().trim()):'')+'</div>'
    +(LD(p)?'<div class="d" style="color:var(--ink);margin:3px 0 2px">'+esc(LD(p))+'</div>':'')
    +(x.rating?'<div class="d">'+esc(T5(PP6.rt))+' ★'+(+x.rating).toFixed(1)+(x.n?' ('+x.n+')':'')+'</div>':'');
  if(dt){ var hr=[], f=FACT[x.k]; if(Array.isArray(x.oh)&&x.oh.length){ var wn=winOf(x,dt); if(wn&&wn.off) hr.push(T5(LV6.off)); else if(wn&&wn.w.length) hr.push(wn.w.filter(function(w){ return w[0]>=0; }).map(function(w){ return gTxt(LV6.hrs,{o:m2hm(w[0]),c:m2hm(Math.min(w[1],w[0]+1439))}); }).join(", ")); }
    else if(isBar(x)) hr.push(T5(LV6.eve));
    if(f){ var li=lastIn(f,dt); if(li!=null) hr.push(gTxt(LV6.last,{c:m2hm(li)})); if(f.cl) hr.push(gTxt(PP6.cl,{w:f.cl.map(wdL).join(", ")})); }
    else if(needCheck(x)) hr.push(T("운영 시간·휴무일 확인 필요","Check opening hours/closures"));
    if(hr.length) h+='<div class="pph"><b>'+esc(gTxt(PP6.hrs,{d:dateTxt(dt)}))+'</b> '+esc(hr.join(" · "))+'</div>'; }
  if(aiTx(ai[s.k])) h+='<div class="ttip">'+MPIMG("mi_tip",MIS)+'<b>'+esc(T5(PP6.ai))+'</b> '+esc(aiTx(ai[s.k]))+'</div>';
  h+='<div class="d">'+esc(L()?(p.addr_en||p.addr||""):(p.addr||""))+'</div>'+telLine(p.tel||x.tel)+linksTo(p.ko||x.ko,x.lat,x.lng,x.pin?x.ko:null,p.addr||x.addr)+'</div>';
  return h; }
function ppOpen(o){ var old=document.getElementById("trPp"); if(old) old.remove(); PPS=o; var b=document.createElement("div"); b.id="trPp"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ var h=ppHtml(); if(!h){ b.remove(); return; } b.innerHTML='<div class="ppbox"><button type="button" class="ppx" aria-label="'+esc(T5(PP6.x))+'" onclick="this.closest(\'.trpop\').remove()">✕</button>'+h+'</div>';
    var x=PPS.t==="eat"?PPS.c:TR.plan.pool[PPS.k]; ppPhoto(PPS.t==="eat"?"":PPS.k,x&&x.ko,x&&x.lat,x&&x.lng,b.querySelector(".cph")); };
  b._rb=draw; draw(); document.body.appendChild(b); try{ ntap(o.t==="eat"?"_trip":(/^[A-Za-z0-9_-]+$/.test(o.k||"")&&!/^pin_/.test(o.k)?o.k:"_trip"),"trip_pop"); }catch(e){} return b; }
document.addEventListener("click",function(e){ if(!e.target.closest) return; if(e.target.closest("a,button,input,select")) return;
  var en=e.target.closest("#trRep .tec b, #trRep .teat.on > b, #trRep .teat.on b:not(.tead)");   // 식사 칸 식당 이름 — 넣기 단추 옆
  if(en){ var row=en.closest(".tec"), pl=TR.plan, c=null, mk="";
    if(row){ var bt=row.querySelector(".tebtn[data-k]"); if(bt){ mk=bt.dataset.k; c=(EATC[mk]||[])[+bt.dataset.i]; } }
    else { var on=en.closest(".teat.on"), bx=on&&on.querySelector(".tebtn[data-x]"); if(bx){ mk=bx.dataset.x; c=pl&&pl.meals&&pl.meals[mk]; } }
    if(c){ e.preventDefault(); e.stopPropagation(); ppOpen({t:"eat",c:c,mk:mk}); } return; }
  var r=e.target.closest("#trRep .trw.tpk"); if(!r) return; var td=r.closest(".tday"); ppOpen({t:"place",k:r.dataset.k,di:td?+td.dataset.d:0}); },false);

// ── 시작 ──
var css=document.createElement("style"); css.textContent=
 ".tradd{margin:8px 0 0;border:1.5px solid var(--green);background:#eefaf0;color:#2b8a3e;border-radius:999px;padding:7px 14px;font-weight:800;font-size:13.5px;cursor:pointer;font-family:inherit}.tradd.on{background:var(--green);color:#fff}"
+":root[data-theme=dark] .tradd{background:#13261a}:root[data-theme=dark] .tradd.on{background:var(--green)}"
+"#mz .trf{position:absolute;z-index:3;pointer-events:none;transform-origin:0 100%}#mz .trf b{display:block;position:relative;margin-left:0;background:#0ea5e9;color:#fff;font-weight:900;line-height:1;padding:.3em .45em .3em .4em;border-radius:.25em .45em .45em 0;box-shadow:0 1px 3px rgba(0,0,0,.4);white-space:nowrap;margin-bottom:1.1em}#mz .trf b:after{content:'';position:absolute;left:0;top:100%;width:.16em;height:1.1em;background:#1e3a5f}"   // 지도 번호 깃발 = 하늘색 판·흰 글자·남색 깃대 — 주황 「+N」 묶음 배지와 헷갈리지 않게 (사장님 11-06)
+".trlock,.trlock body{overflow:hidden}.trsheet{position:fixed;inset:0;z-index:1035;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}.trsheet .trin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px}"
+".trtop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin:2px 0 10px}.trl{list-style:none;padding:0;margin:0}.tri{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:6px 0;touch-action:none}.tri.drag{opacity:.7;box-shadow:0 4px 14px rgba(0,0,0,.2)}"
+".trh{cursor:grab;font-size:18px;color:var(--sub);padding:0 4px;user-select:none;touch-action:none}.trn{background:#e8590c;color:#fff;border-radius:6px;min-width:22px;text-align:center;font-size:13px;padding:2px 4px}.trt{flex:1;font-weight:700;font-size:14.5px}.trt i{font-style:normal;color:var(--sub);font-weight:500;font-size:12.5px}.trx{border:0;background:none;color:var(--sub);font-size:18px;cursor:pointer}"
+".trf2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.trf2 label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700}.trf2 .wide{grid-column:1/-1}.trf2 select,.trf2 input{font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit;width:100%}"
+".trsr{display:flex;gap:6px}.tra{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:4px 0;cursor:pointer;font-size:14px}"
+".trbtn{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 14px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;margin:4px 4px 0 0}.trbtn.big{display:block;width:100%;background:var(--green);border-color:var(--green);color:#fff;font-size:17px;padding:13px}.trbtn:disabled{opacity:.6}.trbtn.ib{padding:9px 12px}"
+".trbar{display:flex;flex-wrap:wrap;margin:0 0 8px}.tday{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:12px 0}.tdh{font-weight:900;font-size:17px;display:flex;align-items:baseline;gap:6px}.tdh span{color:#e8590c}.tdh small{margin-left:auto;font-size:11px;color:var(--sub);font-weight:700}"
+".tai{font-size:14px;line-height:1.6;margin:6px 0 8px;color:var(--ink)}.tmap{margin:6px 0 8px;border-radius:12px;overflow:hidden;background:#96b2c4}.tmap img,.tmap canvas{display:block;width:100%;height:auto}"
+".trw{display:flex;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:14.5px}.trw .tt{font-weight:900;min-width:46px;color:var(--sub)}.trw .tp{flex:1}.trw.tpk{cursor:pointer}.trw.tpk.on{background:rgba(11,155,110,.10);box-shadow:inset 3px 0 0 #0b9b6e}.trw.h .tp,.trw.l .tp{color:var(--sub);font-weight:700}.trw i{font-style:normal;color:var(--sub);font-size:12.5px}"
+".tgap{margin-top:8px;border:1.5px dashed #e8590c;background:#fff7ed;border-radius:10px;padding:9px 10px;font-size:13.5px;line-height:1.5}.tgap .tgr{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.tgap .trbtn{margin:0;width:auto;padding:7px 12px}.tgap input{font:inherit;padding:5px 8px;border:1px solid #d6dde5;border-radius:8px}"
+".tno{display:inline-block;background:#fff;color:#0284c7;border:2px solid #0ea5e9;border-radius:50%;width:22px;height:22px;line-height:18px;text-align:center;font-size:12px}.tmemo{display:block;font-size:12.5px;color:#c2410c;font-weight:700;margin-top:2px}.ttip{display:block;font-size:13px;color:var(--sub);margin-top:3px;line-height:1.45}"
+".tlg{font-size:12.5px;color:#1a73e8;font-weight:700;padding:3px 0 5px 56px}.tlg a{color:#1a73e8}.tods .trh{font-size:14px;color:var(--ink);padding:0;cursor:auto}"
+".teat{display:block;margin-top:4px;font-weight:500;color:var(--ink)}.tehd{display:block;font-size:12.5px;color:var(--sub);font-weight:800}.tec{display:block;padding:4px 0;border-top:1px dashed var(--line);font-size:13.5px}.tec i,.teat i{font-style:normal;color:var(--sub);font-size:12px}"
+".tesrc{display:block;font-size:11.5px;color:var(--sub);margin-top:1px}.tesrc a{color:var(--sub)}.tead{display:inline-block;background:#f59f00;color:#fff;border-radius:4px;padding:0 5px;font-size:11px}.tebtn{border:1.5px solid var(--green);background:var(--card);color:#2b8a3e;border-radius:999px;padding:3px 10px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;margin-left:4px}"
+".teact{display:block;margin-top:4px}.teact a{display:inline-block;margin:3px 5px 0 0;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;color:var(--ink);background:var(--bg)}.trck{flex-direction:row!important;align-items:center;gap:6px!important;font-size:13px!important}.trck input{width:auto!important}"
+".trpop{position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}.trpop>div{background:var(--card);color:var(--ink);max-width:440px;border-radius:16px;padding:16px 18px;font-size:14.5px;text-align:center}"
+".trshot{position:absolute;left:-12000px;top:0;width:680px;background:var(--bg);padding:0}.trshot .tday{margin:0}"
// 공유 칸 단추 (사장님 10-24)
+".shgrid{display:flex;flex-wrap:wrap;gap:8px}.shgrid button{flex:1 1 40%;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 10px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}.shmsg{font-size:13px;color:var(--sub);margin-top:8px;word-break:break-all}"
// 가이드에게 PDF 보내기 (사장님 2026-10-24)
+".gsbtn{display:block;width:100%;border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:999px;padding:11px 12px;font-weight:900;font-size:15px;cursor:pointer;font-family:inherit}:root[data-theme=dark] .gsbtn{background:#0a2a30}"
+".gsback{font-size:13px;padding:6px 12px}.gslbl{font-size:13px;color:var(--sub);font-weight:800;margin:4px 2px 6px}.gsnote{background:#e3fafc;border:1px solid #99e9f2;color:#0b7285;border-radius:12px;padding:10px 12px;font-size:13.5px;font-weight:700;margin:4px 0}:root[data-theme=dark] .gsnote{background:#0a2a30}"
+".gslangs{display:flex;flex-direction:column;gap:9px}.gslang{display:block;width:100%;text-align:left;border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:12px;padding:13px 12px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit}:root[data-theme=dark] .gslang{background:#0a2a30}"
+".gscard{display:flex;gap:11px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:9px 0;cursor:pointer}.gsquick{border:1.5px solid #0c8599!important;background:#e3fafc!important}:root[data-theme=dark] .gsquick{background:#0a2a30!important}"
+".gsav{width:52px;height:52px;border-radius:12px;object-fit:cover;flex:0 0 auto;background:#e3fafc}.gsav.gsavx{display:flex;align-items:center;justify-content:center;font-size:24px}.gscard .gsb{flex:1;min-width:0}.gscard .gsb b{font-size:15.5px}.gsm{color:var(--sub);font-size:12.5px;margin-top:2px}.gspk{align-self:center;color:#0c8599;font-weight:800;font-size:13px;white-space:nowrap}"
+".gsrb{display:inline-block;font-size:12.5px;font-weight:800;color:#e8590c;white-space:nowrap;margin-left:4px}.gsrb0{color:var(--sub);font-weight:700;font-size:12px}"
+".gslb{display:block;font-size:13px;color:var(--sub);font-weight:700;margin:10px 2px 3px}.gsin{width:100%;box-sizing:border-box;font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:10px;padding:10px 11px}"
+".gschk{display:flex;gap:7px;align-items:flex-start;font-size:13px;color:var(--ink);margin:12px 2px 0;line-height:1.5}.gschk input{width:18px;height:18px;margin-top:1px;flex:0 0 auto}.gsgo{background:#0c8599!important;border-color:#0c8599!important;color:#fff!important}"
+".gsdone{background:#e3fafc;border:1px solid #99e9f2;color:#0b7285;border-radius:12px;padding:12px 14px;font-size:14.5px;font-weight:800;line-height:1.5}:root[data-theme=dark] .gsdone{background:#0a2a30}"
// 오늘 실제 머문 시간·「여기 떠나요」·늦어짐 주의 창 (사장님 11-06)
+".tlvn{font-size:12.5px;color:#0b7285;background:#e3fafc;border-radius:8px;padding:5px 9px;margin:4px 0 6px;font-weight:700;line-height:1.45}:root[data-theme=dark] .tlvn{background:#0a2a30;color:#99e9f2}"
+".tlvw{display:block;margin-top:6px}.tlvb{border:1.5px solid #e8590c;background:#fff4e6;color:#c2410c;border-radius:999px;padding:6px 14px;font-weight:900;font-size:13.5px;cursor:pointer;font-family:inherit}:root[data-theme=dark] .tlvb{background:#3a1d08;color:#ffc078}"
+"#trAl{z-index:2147483002}#trAl>div{text-align:left;width:100%;max-width:440px;max-height:86vh;overflow:auto;box-sizing:border-box}.talh{font-size:17px;font-weight:900;color:#c2410c;margin-bottom:6px;line-height:1.4}.tals{font-size:14px;line-height:1.55;margin-bottom:8px}"
+".talt{font-size:13px;font-weight:900;color:var(--sub);margin:4px 0 2px}.talr{display:block;border-top:1px solid var(--line);padding:6px 0;font-size:14px}.talr b{display:block}.talr span{color:var(--sub);font-size:12.5px}.talr.bad span{color:#c2410c;font-weight:800}"
+".tale{font-size:13px;color:var(--sub);margin:8px 0 2px;font-weight:800}.talb{display:flex;flex-direction:column;gap:7px;margin-top:12px}.talb button{border:0;border-radius:12px;padding:11px;font-weight:900;font-size:15px;cursor:pointer;font-family:inherit;background:var(--green);color:#fff}"
+".talb [data-al=tm]{background:#1c7ed6}.talb [data-al=cx]{background:#efece4;color:#1d2433}.talb [data-al=go]{background:#e8590c}.talx{display:block;margin:10px auto 0;border:0;background:none;color:var(--sub);font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}"
+".talb [data-al=re]{background:#2b8a3e}"
// 전국 일정·택시·공항·숙소 찾기·AI일정짜기 3단계·첫 화면 「지금 여기」 카드 (사장님 11-06)
+".tdh .tcty{margin-left:2px;font-size:12px;background:#e7f5ff;color:#1864ab;border-radius:999px;padding:2px 9px;font-weight:800;white-space:nowrap}:root[data-theme=dark] .tdh .tcty{background:#10263d;color:#a5d8ff}"
+".trw.x .tp{color:var(--ink);font-weight:500}.txc{display:block;border:1.5px solid #1c7ed6;background:#f1f8ff;border-radius:10px;padding:7px 9px;line-height:1.45}.txc b{font-weight:800}:root[data-theme=dark] .txc{background:#10263d}"
+".txs{display:block;font-size:12px;color:var(--sub);font-style:normal;margin-top:2px}.txl a{display:inline-block;margin:6px 6px 0 0;font-size:12px;font-weight:800;color:#1c7ed6;border:1px solid #a5d8ff;border-radius:999px;padding:3px 10px;text-decoration:none;background:var(--card)}"
+".txs2{margin:2px 0 4px 56px;font-size:12px}.txw{font-style:normal;font-size:11px;background:#fff3bf;color:#8a6100;border-radius:4px;padding:0 5px;margin-left:3px;font-weight:800}:root[data-theme=dark] .txw{background:#3b3000;color:#ffe066}"
+".tnight{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:8px;border:1.5px solid #5f3dc4;background:#f3f0ff;border-radius:10px;padding:8px 10px;font-size:13.5px}.tnight.no{border-style:dashed}.tnight b{flex:1 1 100%;color:#3b2a8a}.tnight .trbtn{margin:0;padding:6px 12px}.tnight a{display:inline-block;font-size:12.5px;font-weight:800;border:1px solid #b197fc;border-radius:999px;padding:4px 10px;color:#5f3dc4;text-decoration:none;background:var(--card);margin:0 4px 0 0}:root[data-theme=dark] .tnight{background:#1e1838}:root[data-theme=dark] .tnight b{color:#d0bfff}"
+".trch{display:flex;flex-direction:column;gap:6px}.trchh{font-size:12.5px;color:var(--sub);font-weight:700}.trchr{display:flex;gap:6px;align-items:center}.trchn{min-width:58px;font-weight:800;color:var(--ink);font-size:14px}.trchr select{flex:1;min-width:0;width:auto!important}"
+".trapr{display:flex;flex-direction:column;gap:4px}.trapl{font-size:12.5px;color:var(--sub);font-weight:700}.trapt{font-size:11px;color:var(--sub)}.trapf{display:flex;gap:6px}.trapf select{flex:2;min-width:0;width:auto!important}.trapf input{flex:1.3;min-width:0;width:auto!important}"
+".tlgnote{font-size:12px;color:#c2410c;font-weight:700;margin:6px 2px;line-height:1.45}.tlgt{font-weight:900;font-size:14.5px;margin:14px 2px 4px;color:var(--ink)}.tlgi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:9px 11px;margin:6px 0;font-size:14px}.tlgr{color:#e8590c;font-weight:800;font-size:12.5px}"
+".tlgb{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px}.tlgb .trbtn{margin:0;padding:6px 12px;border-color:var(--green);color:#2b8a3e}.tlgk{font-size:12px;color:var(--sub);font-weight:700}.tlgk a{display:inline-block;margin:2px 4px 0 0;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:800;color:#1c7ed6;text-decoration:none;background:var(--bg)}"
+".tlgtoast{position:fixed;left:50%;bottom:calc(20px + var(--trnowh,0px));transform:translateX(-50%);z-index:2147483006;background:#1d2433;color:#fff;border-radius:999px;padding:10px 16px;font-weight:800;font-size:14px;box-shadow:0 6px 18px rgba(0,0,0,.3);max-width:90vw}"
+"#aipSteps{margin:4px 0 10px}.stp{border:1px solid var(--line);background:var(--card);border-radius:12px;margin:6px 0;overflow:hidden}.stp.ok{border-color:#8ce99a}.stph{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;font-size:15px}.stph b{flex:1}.stok{font-size:12px;color:#2b8a3e;font-weight:800;text-align:right}"
+".stpb{padding:0 12px 10px}.stpr{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.stpr label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--sub);font-weight:700;flex:1;min-width:90px}.stpr label.w{flex:2 1 180px}"
+".stpr select,.stpr input{font-size:15px;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit;min-width:0}.stpr>input{flex:1}.stpl{font-size:13px;margin:4px 0 8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.stpl span{font-weight:800;color:var(--sub)}"
+".stpl a{display:inline-block;border:1.5px solid #1c7ed6;color:#1c7ed6;border-radius:999px;padding:5px 12px;font-weight:800;font-size:13px;text-decoration:none;background:var(--bg)}.stpn{display:flex;justify-content:flex-end;margin-top:6px}.stpn .trbtn.big{width:100%}"
+"#trNow{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:1020;max-width:560px;margin:0 auto;background:var(--card);color:var(--ink);border:1.5px solid #0c8599;border-radius:16px;box-shadow:0 8px 26px rgba(0,0,0,.25);padding:9px 12px 10px;font-size:13.5px;max-height:46vh;overflow:auto;font-family:inherit}"
+"#trNow.flash{animation:tnFl 1.2s ease-out 2}@keyframes tnFl{0%{box-shadow:0 0 0 0 rgba(12,133,153,.7)}100%{box-shadow:0 0 0 14px rgba(12,133,153,0)}}"
+"#trNow .tnh{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#0b7285;margin-bottom:3px}.tnx{border:0;background:none;color:var(--sub);font-size:17px;cursor:pointer;padding:2px 4px}"
+"#trNow .tnc b{font-size:15px}#trNow .tnc span{color:var(--sub);font-size:12.5px;font-weight:700}#trNow .tnn{font-size:12.5px;color:#1a73e8;font-weight:700;margin-top:3px}"
+".tnb{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.tnb button{border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:999px;padding:6px 11px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit}:root[data-theme=dark] .tnb button{background:#0a2a30;color:#99e9f2}"
+".tnq{border:1.5px solid #e8590c;background:#fff4e6;border-radius:12px;padding:8px 10px;margin:4px 0 6px}.tnq b{color:#c2410c;font-size:14.5px}.tnq>div{font-size:12.5px;line-height:1.45;margin-top:2px}.tnq .tnb button{border-color:#e8590c;background:#fff;color:#c2410c}:root[data-theme=dark] .tnq{background:#3a1d08}"
+".tnr{margin-top:6px;border-top:1px dashed var(--line);padding-top:6px;font-size:13px}.tnm{font-size:13px;font-weight:800;color:#2b8a3e;margin:4px 0}.tnl{display:block;margin-top:6px}.tnl a{display:inline-block;margin:3px 5px 0 0;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;color:var(--ink);text-decoration:none;background:var(--bg)}"
+".tnsr{display:flex;gap:6px}.tnsr input{flex:1;min-width:0;font-size:15px;padding:7px 9px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}.tnsr button{border:1px solid var(--line);background:var(--card);border-radius:10px;padding:0 10px}"
+"html.trnowon .map{height:calc(var(--MH,max(320px,calc(100vh - 300px))) - var(--trnowh,0px))!important}html.trnowon body{padding-bottom:var(--trnowh,0px)}"
+"#trPp{z-index:1060}#trPp>div.ppbox{position:relative;text-align:left;width:100%;max-width:460px;max-height:86vh;overflow:auto;box-sizing:border-box;padding:12px 14px 14px}.ppx{position:absolute;right:6px;top:4px;z-index:2;border:0;background:var(--card);border-radius:50%;width:34px;height:34px;font-size:19px;color:var(--sub);cursor:pointer}"
+"#trPp .item{margin:0;border:0;box-shadow:none;padding:2px 0 0;background:none}#trPp .t{font-size:17px;font-weight:900;margin:2px 36px 2px 0}.ppk{font-size:13px;margin:5px 0 3px;color:var(--ink)}.ppk b{color:var(--sub);margin-right:3px}.pph{font-size:13px;margin:5px 0;color:#0b7285;font-weight:700;line-height:1.45}.pph b{color:var(--sub)}#trPp .ttip{margin:6px 0}"
+"#trRep .tec b,#trRep .teat.on b{cursor:pointer}#trRep .trw.tpk .tp>b:not(.tno){text-decoration:underline dotted;text-underline-offset:3px}";

document.head.appendChild(css);
window.TRIP={open:openPanel,report:openReport,close:sheetClose,state:function(){ return TR; },hasPass:hasPass,
  add:function(it){ addItem(it); return has(it&&it.k); },del:delItem,has:has,snap:snapPlace,pinKey:pinKey,   // 「AI와 일정짜기」 화면이 같은 카트에 담는다 (11-05)
  alert:function(go){ return tripAlert(go); },live:{check:liveCheck,tick:liveTick,leave:liveLeave,state:function(){ return LIVE; },trend:liveTrend,ask:askCheck,re:liveRe,drive:liveDrive,hotel:function(){ var L=liveToday(); return L?hotelArrive(L):null; }},   // 🔔 알림함 「일정 주의」 → 주의 창(물음이면 그 물음) · 시험용 읽기 (11-06)
  now:function(){ nowPaint(); return document.getElementById("trNow"); },steps:function(el){ stepsPaint(el); },lodge:openLodge,nat:{x:function(di){ var pl=TR.plan; return pl?dayX(pl,di,REPH||pl.H):null; },dr:function(){ return DR; },fetch:trFetch,groups:natGroups},   // 전국 일정 (11-06)   // 🔔 알림함 「일정 주의」 → 주의 창 · 시험용 읽기 (11-06)
  debug:function(){ var pl=TR.plan; if(!pl) return null; var H=REPH||pl.H||null, tot=0, tr=0, rl=0;   // 읽기 전용 — 날짜별 묶음·이동시간·실제구간 수 (시험·비교용)
    var days=pl.days.map(function(d){ var arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), p=H, tv=0, legs=0, real=0;
      arr.forEach(function(x){ if(p){ var lg=leg(p,x); if(lg.mode!=="walk"){ legs++; if(lg.real) real++; } tv+=lg.min; } p=x; });
      if(H&&arr.length){ var lb=leg(p,H); if(lb.mode!=="walk"){ legs++; if(lb.real) real++; } tv+=lb.min; }
      tot+=tv; tr+=legs; rl+=real; return {stops:arr.map(function(x){ return x.ko; }),travel:Math.round(tv),legs:legs,real:real}; });
    return {old:OLD(),days:days,total:Math.round(tot),legs:tr,real:rl}; }};
refresh();
if(/[?&]trip=1/.test(location.search)){ var hz=/#tp=([A-Za-z0-9_-]+)/.exec(location.hash);
  var startRep=function(){ if(TR.plan) openReport(); else openPanel(); };
  var waitCity=function(cb){ var n=0, iv=setInterval(function(){ if((window.CITY&&Object.keys(CITY).length)||++n>100){ clearInterval(iv); cb(); } },100); };
  waitCity(function(){ if(hz){ try{ history.replaceState(history.state,"",location.pathname+location.search); }catch(e){}
      fromShare(hz[1]).then(function(ok){ if(ok!==false) openReport(); else startRep(); },function(){ startRep(); }); } else startRep(); }); }
})();
