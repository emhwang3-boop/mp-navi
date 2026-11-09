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

var KEY="mpv_trip", MAXN=300, MAXD=90;   // 11-06 사장님 — 담는 곳 40 → 300 · 여행 일수 7 → 90일(한국 무비자 체류 최대 90일), 일수는 숫자로 직접 넣는다
// 여행 일수 칸 — 1 미만은 1, 90 초과는 90, 빈칸·숫자 아님은 지금 일수 그대로 → {n:맞춘 값, fix:바꿨으면 1}
function nFix(v,cur){ var s=String(v==null?"":v).trim(), x=/^\d+(\.\d+)?$/.test(s)?Math.round(+s):NaN, c=Math.max(1,Math.min(MAXD,Math.round(+cur)||1));
  if(!isFinite(x)) return {n:c,fix:1}; var n=Math.max(1,Math.min(MAXD,x)); return {n:n,fix:n!==x?1:0}; }
var DN6={ko:"여행 일수는 1~"+MAXD+"일로 넣어 주세요 — {n}일로 맞췄어요",en:"Trip length is 1–"+MAXD+" days — set to {d}",ja:"旅行日数は1〜"+MAXD+"日で入れてください — {n}日にしました",zhs:"旅行天数请填1~"+MAXD+"天——已设为{n}天",zht:"旅行天數請填1~"+MAXD+"天——已設為{n}天",es:"La duración es de 1 a "+MAXD+" días: se ajustó a {d}"};
function nMsg(n){ return gTxt(DN6,{n:n,d:LANG==="es"?n+(n>1?" días":" día"):n+(n>1?" days":" day")}); }
function nInput(id,attr,n){ return '<input type="number" '+(id?'id="'+id+'" ':'')+(attr||"")+' inputmode="numeric" pattern="[0-9]*" min="1" max="'+MAXD+'" step="1" value="'+(+n||1)+'" enterkeyhint="done">'; }
var TR=load();
function opt0(o){ return Object.assign({n:3,start:"",from:"09:30",to:"20:00",walk:1,hotel:null,food:"any",adv:false},o||{}); }
function load(){ var o=null; try{ o=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){} if(!o||!Array.isArray(o.items)) o={items:[]};
  o.opt=opt0(o.opt); pastFix(o);
  // 11-08 내 플랜 여러 개 — 지금 플랜 번호 pid(옛 저장엔 없음 = 1) · 다른 플랜 saved[{id,items,opt,plan,u}] (모양이 틀린 것·같은 번호는 버린다)
  o.pid=+o.pid||1; var seen={}; seen[o.pid]=1;
  o.saved=(Array.isArray(o.saved)?o.saved:[]).filter(function(p){ if(!p||typeof p!=="object"||!Array.isArray(p.items)||!(+p.id)||seen[+p.id]) return false; p.id=+p.id; seen[p.id]=1; p.opt=opt0(p.opt); p.plan=p.plan&&Array.isArray(p.plan.days)?p.plan:null; pastFix(p); return true; });
  plNoFix(o); return o; }
// 11-08 사장님 「나」 — 플랜 번호는 만들 때 붙인 번호 그대로(플랜 2를 지워도 플랜 3은 플랜 3) · 번호 없는 것(옛 저장)·겹치는 것은 만든 차례대로 빈 번호 다음부터
function plNoFix(o){ var a=[{id:o.pid,set:function(n){ o.pno=n; },no:+o.pno||0}].concat(o.saved.map(function(p){ return {id:p.id,set:function(n){ p.no=n; },no:+p.no||0}; })).sort(function(x,y){ return x.id-y.id; }), used={}, mx=0;
  a.forEach(function(x){ if(x.no>0&&!used[x.no]){ used[x.no]=1; mx=Math.max(mx,x.no); } else x.no=0; });
  a.forEach(function(x){ if(!x.no) x.no=++mx; x.set(x.no); }); }
function pastFix(o){
  // 11-06 사장님 「2-가」 — 저장된 첫날이 오늘보다 앞(지난 날짜)이면 내일로 옮겨 보여 준다. 짜 둔 일정은 장소 그대로 날짜만 같이 옮기고, 요일이 바뀌니 AI 설명은 다시 받는다
  try{ var td=kstToday(0); if(o.opt.start&&o.opt.start<td){ var ns=kstToday(1), dd=Math.round((Date.parse(ns+"T00:00:00Z")-Date.parse(o.opt.start+"T00:00:00Z"))/864e5); o.opt.start=ns;
    if(o.plan&&Array.isArray(o.plan.days)){ o.plan.days.forEach(function(d){ if(d&&d.date){ var t=Date.parse(d.date+"T00:00:00Z"); if(isFinite(t)) d.date=new Date(t+dd*864e5).toISOString().slice(0,10); } }); o.plan.ai=null; } } }catch(e){} }   // 11-06 더한 칸(없어도 됨): hotels{도시 id:숙소} · ap{a,d} · pax · hAll
var SAVED_H=JSON.stringify(TR.opt&&TR.opt.hotel||null);   // 11-06 사장님 「숙소를 안 잡았는데 잡혀 있다」 — 예전에 저장된 숙소는 이번 여행에서 고른 것으로 보지 않는다
function hKey(){ var o=TR.opt||{}; return (o.start||"")+"|"+(o.n||1); }
function hOkNow(){ var o=TR.opt||{}; return !!o.hotel&&o.hOk===hKey(); }
function save(){ try{ var hj=JSON.stringify(TR.opt&&TR.opt.hotel||null); if(hj!==SAVED_H){ if(TR.opt) TR.opt.hOk=TR.opt.hotel?hKey():""; SAVED_H=hj; } var j=JSON.stringify(TR); localStorage.setItem(KEY,j); if(j!==SYLAST) syMark(); }catch(e){} }
// ── 「내 여행」 기기끼리 맞추기 (사장님 11-07 「당연히 만들어야지」) — 로그인(구글·애플) 손님만 · 허브 POST /ntsync · 「1-나」 두 기기가 다르면 최근에 바꾼 쪽 통째로 ──
//   mpv_trip_sync = {at: 이 기기에서 마지막으로 바꾼 시각, sv: 서버와 맞춘 시각} · 바꾸면 2.5초 뒤 올린다 · 앱을 열 때·화면으로 돌아올 때·로그인한 직후 서버 것을 받아 더 새것이면 그것으로 바꾼다
//   mpv_trlive(오늘 실제 기록)는 그 기기 것이라 안 맞춘다 · 로그인 전에 쓰던 기기는 바꾼 시각을 모르니(at 0) 서버에 있는 것이 이긴다
var SYK="mpv_trip_sync", SYIN=0, SYT=0, SYBUSY=0, SYLAST=null, SYSESS="";
function syMeta(){ try{ return JSON.parse(localStorage.getItem(SYK)||"null")||{at:0,sv:0}; }catch(e){ return {at:0,sv:0}; } }
function sySet(m){ try{ localStorage.setItem(SYK,JSON.stringify(m)); }catch(e){} }
function sySess(){ try{ return localStorage.getItem("mpv_pg_sess")||""; }catch(e){ return ""; } }
function syMark(){ if(SYIN) return; var m=syMeta(); m.at=Date.now(); sySet(m); if(!sySess()) return; clearTimeout(SYT); SYT=setTimeout(function(){ SYT=0; sync("put"); },2500); }
function syPost(b){ return fetch(HUB+"/ntsync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).then(function(r){ return r.json(); }); }
function syTake(d,at){ var o=null; try{ o=JSON.parse(d); }catch(e){} if(!o||!Array.isArray(o.items)) return;
  SYIN=1; try{ localStorage.setItem(KEY,d); TR=load(); SAVED_H=JSON.stringify(TR.opt&&TR.opt.hotel||null); SYLAST=JSON.stringify(TR); }catch(e){} SYIN=0; sySet({at:at,sv:at});
  try{ refresh(); if(document.getElementById("trBox")) panelPaint(); if(document.getElementById("trRep")){ if(TR.plan) repPaint(); else sheetClose("trRep"); } if(document.getElementById("aipSteps")) stepsPaint(); }catch(e){} }
function sync(why){ var s=sySess(); if(!s) return; if(SYBUSY){ if(why==="put") setTimeout(function(){ sync("put"); },3000); return; } SYBUSY=1; var m=syMeta(), fin=function(){ SYBUSY=0; };
  var put=function(){ var d=""; try{ d=localStorage.getItem(KEY)||""; }catch(e){} if(!d||!m.at){ fin(); return; }
    syPost({sess:s,op:"put",at:m.at,d:d}).then(function(j){ if(j&&j.ok){ if(j.old){ if(j.d) syTake(j.d,j.at); } else { SYLAST=d; var m2=syMeta(); if(m2.at===m.at){ m2.sv=j.at; sySet(m2); } } } }).catch(function(){}).then(fin); };
  if(why==="put"&&m.sv&&m.at>m.sv){ put(); return; }   // 서버와 맞춘 적 있는 기기 — 바뀐 것만 올린다
  syPost({sess:s,op:"get"}).then(function(j){ if(!j||!j.ok){ fin(); return; }
    if(j.d&&j.at>m.at){ syTake(j.d,j.at); fin(); return; }   // 서버가 더 새것 — 그대로 받는다
    if(!m.at&&!j.at&&(TR.items.length||TR.plan)){ m.at=Date.now(); sySet(m); }   // 서버가 비었고 이 기기에 담은 것이 있으면 이 기기 것을 올린다
    if(m.at>(j.at||0)){ put(); return; } m.sv=j.at; sySet(m); fin(); }).catch(fin); }
SYSESS=sySess(); setTimeout(function(){ sync("open"); },1200);
setInterval(function(){ var s=sySess(); if(s===SYSESS) return; SYSESS=s; if(s) sync("login"); try{ if(document.getElementById("trBox")) panelPaint(); }catch(e){} },3000);   // 로그인·로그아웃 — 로그인 창(pg.js)이 따로 알려 주지 않아 3초마다 본다(이 폰 저장소만 읽음)
document.addEventListener("visibilitychange",function(){ if(document.hidden){ if(SYT){ clearTimeout(SYT); SYT=0; sync("put"); } } else sync("show"); });
var SYL6={q:{ko:"로그인하면 PC·폰에서 같은 카트를 볼 수 있어요",en:"Sign in to see the same trip cart on your PC and phone",ja:"ログインすると、PCとスマホで同じ旅行カートを見られます",zhs:"登录后，电脑和手机上可以看到同一个旅行购物车",zht:"登入後，電腦和手機上可以看到同一個旅行購物車",es:"Inicia sesión para ver el mismo carrito de viaje en tu PC y tu móvil"},
  b:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Iniciar sesión"}};   // 사장님 11-07 「2-가」 — 로그인하지 않은 손님에게 카트 화면 안내 한 줄
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trLogin"); if(!a) return; e.preventDefault(); try{ if(window.mpPG&&mpPG.open) mpPG.open(); }catch(z){} });
function L(){ return window.LANG!=="ko"; }   // 외국어 화면(영·일·중) — 10-18
function nm(it){ if(!it) return ""; if(!L()) return it.ko; var p=it.k&&window.PLACES&&PLACES[it.k]; return (p&&p[LANG])||it[LANG]||it.en||it.ko; }   // 일·중 이름은 지금 받은 장소 자료에서
function T5(o){ return o[window.LANG]||o.en; }   // 다섯 말 문구 (10-20)
function aiTx(a){ return !a?"":LANG==="ko"?a.ko:(a[LANG]||a.en); }   // AI 설명 — 허브가 그 언어 칸을 주면 그것, 아니면 영어
function km(a,b){ var R=6371, rd=Math.PI/180, dLa=(b.lat-a.lat)*rd, dLo=(b.lng-a.lng)*rd, h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*rd)*Math.cos(b.lat*rd)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(h)); }
function hm2m(s){ var m=/^(\d{1,2}):(\d{2})$/.exec(s||""); return m?(+m[1])*60+(+m[2]):null; }
function m2hm(m){ m=Math.round(m); if(m<0) m=((m%1440)+1440)%1440;   /* 11-09 — 전날 밤에 연 칸(-2:00)도 22:00 으로 */ return ("0"+(Math.floor(m/60)%24)).slice(-2)+":"+("0"+(m%60)).slice(-2); }   // 11-05 사장님 「25시·27시는 00시·02시로」 — 자정 넘으면 24시간제로
function durTxt(m){ m=Math.round(m); var h=Math.floor(m/60), r=m%60, U={ko:["시간 ","분"],en:["h ","m"],ja:["時間","分"],zhs:["小时","分钟"],zht:["小時","分鐘"],es:[" h "," min"]}[window.LANG]||["h ","m"]; return ((h?h+U[0]:"")+(r||!h?r+U[1]:"")).trim(); }
var DOW_KO="일월화수목금토", DOW_EN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function kstToday(add){ return new Date(Date.now()+9*3600e3+(add||0)*864e5).toISOString().slice(0,10); }
function dayDate(i){ var s=TR.opt.start||kstToday(1), d=new Date(s+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+i); return d; }
var DOW_L={ja:"日月火水木金土",zhs:["周日","周一","周二","周三","周四","周五","周六"],zht:["週日","週一","週二","週三","週四","週五","週六"]};
function dateTxt(d){ if(DOW_L[LANG]) return (d.getUTCMonth()+1)+"月"+d.getUTCDate()+"日（"+DOW_L[LANG][d.getUTCDay()]+"）"; if(LANG==="es") return ["dom","lun","mar","mié","jue","vie","sáb"][d.getUTCDay()]+", "+d.getUTCDate()+" "+["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"][d.getUTCMonth()]; return L()?DOW_EN[d.getUTCDay()]+", "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()]+" "+d.getUTCDate():(d.getUTCMonth()+1)+"월 "+d.getUTCDate()+"일 ("+DOW_KO[d.getUTCDay()]+")"; }

// ── 장소 종류 어림 → 기본 체류(분) ──
function catOf(it){ if(it&&it.eat) return "food";   // 손님이 일정에 넣은 식당 (11-07)
  var k=it.k||"", s=(it.ko||"")+" "+(it.en||"")+" "+(it.d||"")+" "+(it.cat||"");
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
// 11-07 사장님 「머무는 시간은 손님이 고른다」 — it.um = 카트에서 손님이 고른 분(30분 단위 칸) · 없으면 지금 추정값(stayEst) · 일정은 이 값을 그대로 쓴다
function stayEst(it){ return STAY[catOf(it)]||60; }
// 11-08 사장님 「머무는 시간이 일 단위도 필요하다 — 템플스테이처럼 3일도 있다」 — it.ud = N일(달력으로 N일에 걸침 = N−1박, 「가」) · 그 장소는 그 N일을 통째로(중간에 다른 일정 안 짬) · 그동안 숙소는 안 씀(절에서 잠)
function udOf(it){ var v=it&&+it.ud; return (v>=1&&v<=14)?Math.round(v):0; }
function udLbl(n){ return T5({ko:n+"일",en:n+(n>1?" days":" day"),ja:n+"日",zhs:n+"天",zht:n+"天",es:n+(n>1?" días":" día")}); }
function udNb(n){ var b=n-1; return n<2?T5({ko:"종일",en:"All day",ja:"終日",zhs:"全天",zht:"全天",es:"Todo el día"}):T5({ko:b+"박 "+n+"일",en:n+" days, "+b+" night"+(b>1?"s":""),ja:b+"泊"+n+"日",zhs:n+"天"+b+"晚",zht:n+"天"+b+"夜",es:n+" días, "+b+" noche"+(b>1?"s":"")}); }
var UD6={end:{ko:"{d}까지",en:"until {d}",ja:"{d}まで",zhs:"至{d}",zht:"至{d}",es:"hasta el {d}"},
 nth:{ko:"{n}일 중 {i}일째",en:"Day {i} of {n}",ja:"{n}日間の{i}日目",zhs:"{n}天中的第{i}天",zht:"{n}天中的第{i}天",es:"Día {i} de {n}"},
 all:{ko:"종일",en:"All day",ja:"終日",zhs:"全天",zht:"全天",es:"Todo el día"},
 sleep:{ko:"{p}에서 묵어요",en:"Stay overnight at {p}",ja:"{p}に宿泊",zhs:"在{p}住宿",zht:"在{p}住宿",es:"Pasas la noche en {p}"},
 out:{ko:"마치고 숙소로",en:"Finish and head to your lodging",ja:"終えて宿へ",zhs:"结束后回住处",zht:"結束後回住處",es:"Terminas y vas al alojamiento"}};
// 일 단위로 머무는 곳의 끝나는 날 — 짠 일정에 있으면 그 마지막 날(사장님 「3일 이상은 옆에 끝나는 날」)
function udEnd(pl,k){ if(!pl||!pl.days) return ""; var e=""; pl.days.forEach(function(d){ if(d.md&&d.md.k===k&&d.md.i===d.md.n-1) e=d.date; }); return e?dateTxt(new Date(e+"T00:00:00Z")):""; }
// 짠 일정에 일 단위 장소를 넣는다 — 카트에서 바로 앞 장소가 든 날 다음에 N일을 통째로(그 날들 d.md={k,i,n}) · 날짜는 처음부터 다시 · 열차·이동 칸 날짜(tr.di)·옮긴 기록(fxm)도 같이 민다
function mdPlace(pl,MD){ if(!pl||!MD||!MD.length) return; var ks=TR.items.map(function(x){ return x.k; });
  MD.forEach(function(m){ var N=udOf(m), ci=ks.indexOf(m.k), at=0, q, c=null;
    for(q=ci-1;q>=0&&!at;q--){ var pk=ks[q]; for(var di=pl.days.length-1;di>=0;di--){ if(pl.days[di].stops.indexOf(pk)>=0){ at=di+1; break; } } }
    if(pl.ap&&pl.ap.d&&pl.days.length&&at>=pl.days.length) at=pl.days.length-1;   // 떠나는 날(비행기) 뒤로는 안 넣는다
    if(pl.mc&&Array.isArray(pl.cities)){ var bd=1e9; pl.cities.forEach(function(cc,i){ var dk=km(cc,m); if(dk<bd){ bd=dk; c=i; } }); }
    var blk=[]; for(var i=0;i<N;i++){ var b={date:"",stops:i===0?[m.k]:[],md:{k:m.k,i:i,n:N}}; if(c!=null){ b.c=c; b.nc=c; } blk.push(b); }
    pl.days.splice.apply(pl.days,[at,0].concat(blk));
    (pl.tr||[]).forEach(function(t){ if(t.di!=null&&t.di>=at) t.di+=N; });
    if(pl.fxm) for(var fk in pl.fxm){ var fm=pl.fxm[fk]; if(fm.f>=at) fm.f+=N; if(fm.t>=at) fm.t+=N; }
    pl.pool[m.k]=Object.assign({},m,{stay:480}); });
  pl.days.forEach(function(d,di){ d.date=dayDate(di).toISOString().slice(0,10); }); }
function stayOf(it){ var u=it&&+it.um; return (u>=5&&u<=1440)?Math.round(u):stayEst(it); }
var PERFK={sejongctr:1,sac:1,bluesq:1,lgart:1,olympichall:1};   // 공연장 5곳 — 공연은 저녁이라 그날 마지막 장소로 (사장님 10-27 「예술의전당 9시에 끝」)
function isNight(it){ if(LC&&it&&typeof it==="object"){ var v=LC.n.get(it); if(v===undefined){ v=isNight0(it); LC.n.set(it,v); } return v; } return isNight0(it); }
function isNight0(it){ return !!PERFK[it.k]||/밤 추천|night/i.test((it.d||"")+" "+(it.den||""))||isBar(it); }
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
    if(!m.some(function(r){ return r[0]<1440&&r[1]>360&&(r[0]>=0||r[1]>720); })) return {w:[],off:1};   // 그날 아침 6시~자정에 여는 칸이 없으면 쉬는 날
    // 11-09 사장님 「고쳐」(Club AURA 「마감 07:00 지남」) — 전날 밤에 열어 그날 아침에 닫는 꼬리 칸(예: 전날 22:00~07:00)은 그날 영업으로 치지 않는다. 그날 밤에 안 열면 「이 날은 쉬는 날」 · 24시간 가게처럼 낮까지 이어지는 칸은 그대로
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
function hardLim(X,lim){ return !!(X&&(X.apD||(X.pmTr&&X.lim!=null&&lim===X.lim))); }   // 11-08 그날 끝이 비행기·열차 시각에 묶였나 — 끝나는 시각(손님이 쓴 것)은 참고만
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
function repAgain(){ var nb=document.getElementById("trNextBox"), nx=nb&&nb.firstElementChild?(nb.querySelector("#trShG")?"share":"next"):"", open=[];
  [].forEach.call(document.querySelectorAll("#trRep .tlg"),function(r){ var t=r.querySelector(".tods"); if(t&&t.firstElementChild&&!t.hidden) open.push([r.dataset.a,r.dataset.b,r.dataset.d]); });   // 접어 둔 구간(hidden)은 다시 열지 않는다 (11-07)
  repPaint(); if(nx==="next") nextStop(); else if(nx==="share") shareGo();
  var nt=window.ntap; window.ntap=function(){}; try{ open.forEach(function(o){ var r=[].filter.call(document.querySelectorAll("#trRep .tlg"),function(x){ return x.dataset.a===o[0]&&x.dataset.b===o[1]&&x.dataset.d===o[2]; })[0]; if(r) legTog(r,true); }); }catch(e){} window.ntap=nt; }
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

// ══ 11-07 사장님 설계 「손님이 일정을 정하고 AI는 계산·검사·제안만」 ══
//  · 순서 = 카트에서 ☰ 로 끌어 놓은 순서 그대로 — 일정 짜기는 날짜만 나눈다(seqSplit) · 전국 일정도 손님 순서 그대로(도시를 오가면 그대로 두고 검사 창에 알림)
//  · 머무는 시간 = 카트 칸에서 손님이 고른 값 그대로(um) — 코드는 적당한지 한 줄로만 알림(장소 안에서 오가는 시간 포함, stayJudge) · 값은 자동으로 안 바꾼다
//  · 일정에 넣기 전엔 늘 먼저 보여 주고 동의(넣을 자리·머무는 시간·넣지 않기, insOpen) · 바뀌면 전체 다시 검사(planIssues → 검사 창, 고칠지는 손님이)
//  · 새 유료 호출 없음 — 판단은 이미 받은 자료(구글 영업시간·종류)와 코드 규칙 · 넓혀 찾는 식당은 카카오(허브 /kplace kw, 무료)
var CK6={
 hint:{ko:"☰ 를 끌어 순서를 바꿀 수 있어요 — 일정은 이 순서 그대로 짜요 (날짜만 나눠요)",en:"Drag ☰ to reorder — your plan keeps this exact order (we only split it into days)",ja:"☰ をドラッグして順番を変えられます — 日程はこの順番のまま組みます（日にちだけ分けます）",zhs:"拖动 ☰ 可调整顺序——行程完全按这个顺序安排（只按天拆分）",zht:"拖動 ☰ 可調整順序——行程完全按這個順序安排（只按天拆分）",es:"Arrastra ☰ para cambiar el orden: el plan sigue exactamente este orden (solo lo dividimos por días)"},
 stay:{ko:"머무는 시간",en:"Time here",ja:"滞在時間",zhs:"停留时间",zht:"停留時間",es:"Tiempo aquí"},
 tight:{ko:"{m}은 빠듯해요 (보통 {n})",en:"{m} is tight (usually {n})",ja:"{m}では短めです（目安 {n}）",zhs:"{m}有点紧（一般需要{n}）",zht:"{m}有點緊（一般需要{n}）",es:"{m} es poco tiempo (lo normal es {n})"},
 ok:{ko:"{m}이면 적당해요",en:"{m} is about right",ja:"{m}でちょうどよいです",zhs:"{m}刚好合适",zht:"{m}剛好合適",es:"{m} está bien"},
 loose:{ko:"{m}은 넉넉해요 (보통 {n}) — 남는 시간에 다른 곳을 더 넣을 수 있어요",en:"{m} is generous (usually {n}) — you could fit another place",ja:"{m}は長めです（目安 {n}）— 空いた時間に他の場所も入れられます",zhs:"{m}比较宽裕（一般{n}）——可以再加一个地方",zht:"{m}比較寬裕（一般{n}）——可以再加一個地方",es:"{m} es bastante (lo normal es {n}): cabría otro lugar"},
 // 장소 안에서 오가는 시간 (판단에 더해 센다)
 i_seok:{ko:"석굴암은 주차장에서 걸어 올라가는 데 약 15분",en:"Seokguram: about a 15-minute uphill walk from the parking lot",ja:"石窟庵は駐車場から歩いて上るのに約15分",zhs:"石窟庵从停车场步行上山约15分钟",zht:"石窟庵從停車場步行上山約15分鐘",es:"Seokguram: unos 15 minutos a pie cuesta arriba desde el aparcamiento"},
 i_tower:{ko:"N서울타워는 케이블카 대기·오르는 시간이 있어요",en:"N Seoul Tower: allow time to queue for and ride the cable car up",ja:"Nソウルタワーはケーブルカーの待ち時間・上る時間がかかります",zhs:"N首尔塔需要排队等缆车和上山的时间",zht:"N首爾塔需要排隊等纜車和上山的時間",es:"N Seoul Tower: cuenta la espera y la subida en teleférico"},
 i_bulguk:{ko:"불국사는 경내가 넓어 걸어서 둘러보는 시간이 길어요",en:"Bulguksa: the grounds are large, so walking around takes a while",ja:"仏国寺は境内が広く、歩いて回る時間が長くなります",zhs:"佛国寺寺内很大，步行参观需要较长时间",zht:"佛國寺寺內很大，步行參觀需要較長時間",es:"Bulguksa: el recinto es grande y recorrerlo a pie lleva tiempo"},
 i_sky:{ko:"전망대는 엘리베이터 대기·입장 줄 시간이 있어요",en:"Observation deck: allow time for the elevator and entry queue",ja:"展望台はエレベーター待ち・入場列の時間がかかります",zhs:"观景台需要排队等电梯和入场",zht:"觀景台需要排隊等電梯和入場",es:"Mirador: cuenta la cola del ascensor y de la entrada"},
 i_blue:{ko:"해변열차·스카이캡슐은 타는 줄을 기다리는 시간이 있어요",en:"Beach Train / Sky Capsule: allow time to queue for the ride",ja:"海辺列車・スカイカプセルは乗車待ちの時間がかかります",zhs:"海边列车、天空胶囊需要排队等候乘坐",zht:"海邊列車、天空膠囊需要排隊等候搭乘",es:"Beach Train / Sky Capsule: cuenta la cola para subir"},
 i_nami:{ko:"남이섬은 배를 타고 들어가요 (선착장 대기 포함)",en:"Nami Island is reached by ferry (including the wait at the pier)",ja:"南怡島は船で渡ります（船着き場の待ち時間を含む）",zhs:"南怡岛要坐船进岛（含码头等候）",zht:"南怡島要搭船進島（含碼頭等候）",es:"A la isla Nami se llega en ferri (incluida la espera en el muelle)"},
 // 검사 창
 cT:{ko:"일정 검사 — 확인해 주세요",en:"Plan check — please review",ja:"日程チェック — ご確認ください",zhs:"行程检查——请确认",zht:"行程檢查——請確認",es:"Revisión del plan: compruébalo"},
 cI:{ko:"카트에 놓으신 순서 그대로 짰어요. 아래는 시간이 맞지 않는 곳이에요 — 어떻게 할지 골라 주세요. (자동으로 고치지 않아요)",en:"We kept your order exactly. These spots don't fit the time well — choose what to do. (We won't change anything automatically)",ja:"お客様が決めた順番のまま組みました。下は時間が合わない場所です — どうするか選んでください。（自動では直しません）",zhs:"已完全按您的顺序安排。以下地点时间不太合适——请选择如何处理。（不会自动修改）",zht:"已完全按您的順序安排。以下地點時間不太合適——請選擇如何處理。（不會自動修改）",es:"Mantuvimos tu orden exacto. Estos lugares no encajan bien con la hora: elige qué hacer. (No cambiamos nada automáticamente)"},
 cI2:{ko:"바뀐 일정을 다시 검사했어요. 아래를 확인해 주세요.",en:"We re-checked the updated plan. Please review the items below.",ja:"変更後の日程をもう一度チェックしました。下をご確認ください。",zhs:"已重新检查修改后的行程，请确认以下内容。",zht:"已重新檢查修改後的行程，請確認以下內容。",es:"Revisamos de nuevo el plan modificado. Mira lo siguiente."},
 cOk:{ko:"일정을 다시 검사했어요 — 끝나는 시각·문 닫는 시각·식사 모두 문제 없어요",en:"Plan re-checked — end times, closing times and meals all look fine",ja:"日程を再チェックしました — 終了時刻・閉店時刻・食事すべて問題ありません",zhs:"已重新检查行程——结束时间、关门时间和用餐都没有问题",zht:"已重新檢查行程——結束時間、關門時間和用餐都沒有問題",es:"Plan revisado: horas de fin, cierres y comidas, todo bien"},
 cBar:{ko:"⚠ 확인할 곳 {n}곳",en:"⚠ {n} item(s) to check",ja:"⚠ 確認が必要な場所 {n}件",zhs:"⚠ 有{n}项需要确认",zht:"⚠ 有{n}項需要確認",es:"⚠ {n} punto(s) por revisar"},
 cSee:{ko:"보기",en:"View",ja:"見る",zhs:"查看",zht:"查看",es:"Ver"},
 night:{ko:"밤에 여는 곳인데 {a}에 잡혔어요",en:"Opens at night, but it's scheduled at {a}",ja:"夜に開く場所ですが{a}に入っています",zhs:"这是晚上营业的地方，却安排在{a}",zht:"這是晚上營業的地方，卻安排在{a}",es:"Abre de noche, pero está programado a las {a}"},
 nightW:{ko:"문 여는 {o}까지 {w} 기다려야 해요",en:"you'd wait {w} until it opens at {o}",ja:"開店の{o}まで{w}待つことになります",zhs:"要等{w}到{o}开门",zht:"要等{w}到{o}開門",es:"tendrías que esperar {w} hasta que abra a las {o}"},
 nfirst:{ko:"밤에 여는 곳이 앞에 있어 뒤 장소 {n}곳이 밤으로 밀려요 (이곳 {a} 도착)",en:"A night spot comes early, pushing the {n} place(s) after it into the night (arrive here {a})",ja:"夜に開く場所が先にあるため、後の{n}か所が夜にずれ込みます（ここは{a}着）",zhs:"晚上营业的地方排在前面，后面{n}个地点被推到晚上（这里{a}到达）",zht:"晚上營業的地方排在前面，後面{n}個地點被推到晚上（這裡{a}到達）",es:"Un lugar nocturno va primero y empuja a la noche los {n} lugares siguientes (llegas aquí a las {a})"},
 nightU:{ko:"보통 저녁(17시 뒤)에 가는 곳이에요",en:"usually visited in the evening (after 5 pm)",ja:"ふつうは夕方（17時以降）に行く場所です",zhs:"一般傍晚（17点后）才去",zht:"一般傍晚（17點後）才去",es:"normalmente se visita por la tarde-noche (después de las 17:00)"},
 early:{ko:"{a}에 도착하는데 문 여는 {o}까지 {w} 기다려야 해요",en:"You arrive at {a} but it opens at {o} — a {w} wait",ja:"{a}に着きますが開店の{o}まで{w}待ちます",zhs:"{a}到达，但{o}才开门——要等{w}",zht:"{a}到達，但{o}才開門——要等{w}",es:"Llegas a las {a} pero abre a las {o}: esperarías {w}"},
 shut:{ko:"{a}에 도착하는데 이미 문을 닫은 뒤예요 ({c} 마감)",en:"You arrive at {a}, after it closes ({c})",ja:"{a}に着きますが、もう閉まっています（{c}閉店）",zhs:"{a}到达时已经关门（{c}关门）",zht:"{a}到達時已經關門（{c}關門）",es:"Llegas a las {a}, cuando ya cerró ({c})"},
 last:{ko:"{a}에 도착하는데 입장 마감({c})이 지난 뒤예요",en:"You arrive at {a}, after last entry ({c})",ja:"{a}に着きますが入場締切（{c}）を過ぎます",zhs:"{a}到达时已过最晚入场时间（{c}）",zht:"{a}到達時已過最晚入場時間（{c}）",es:"Llegas a las {a}, pasada la última entrada ({c})"},
 off:{ko:"이 날({d})은 쉬는 날이에요",en:"It's closed on this day ({d})",ja:"この日（{d}）は休業日です",zhs:"这天（{d}）休息",zht:"這天（{d}）休息",es:"Está cerrado ese día ({d})"},
 cut:{ko:"머무는 동안 문을 닫아요 ({c} 마감 — {s}만 머물 수 있어요)",en:"It closes while you're there ({c} — only {s} inside)",ja:"滞在中に閉まります（{c}閉店 — {s}しかいられません）",zhs:"停留期间会关门（{c}关门——只能待{s}）",zht:"停留期間會關門（{c}關門——只能待{s}）",es:"Cierra mientras estás dentro ({c}: solo {s})"},
 late:{ko:"보통 낮에만 여는 곳인데 {a}에 잡혔어요 — 운영 시간을 확인하세요",en:"Usually open only in the daytime, but it's scheduled at {a} — check the hours",ja:"ふつうは昼だけ開く場所ですが{a}に入っています — 営業時間をご確認ください",zhs:"一般只在白天开放，却安排在{a}——请确认开放时间",zht:"一般只在白天開放，卻安排在{a}——請確認開放時間",es:"Normalmente solo abre de día, pero está programado a las {a}: revisa el horario"},
 zig:{ko:"도시를 오가요: {r} — 「{p}」부터 다시 {c} 일정이에요",en:"You go back and forth between cities: {r} — you return to {c} at “{p}”",ja:"都市を行き来します：{r} — 「{p}」で{c}に戻ります",zhs:"在城市间来回：{r}——到「{p}」时又回到{c}",zht:"在城市間來回：{r}——到「{p}」時又回到{c}",es:"Vas y vuelves entre ciudades: {r}; en «{p}» regresas a {c}"},
 over:{ko:"이 날은 장소가 많아 {t}까지 다 못 돌아요 ({e}에 끝나요)",en:"Too many places this day — you can’t see them all by {t} (ends at {e})",ja:"この日は場所が多く、{t}までに回りきれません（{e}に終わります）",zhs:"这天地点太多，{t}前逛不完（{e}才结束）",zht:"這天地點太多，{t}前逛不完（{e}才結束）",es:"Demasiados lugares este día: no da tiempo a verlos todos antes de las {t} (termina a las {e})"},
 overN:{ko:"이 날은 장소가 많아 숙소에 {e}에야 들어가요",en:"Too many places this day — you’ll only get back to your lodging at {e}",ja:"この日は場所が多く、宿に戻るのは{e}になります",zhs:"这天地点太多，要到{e}才能回到住处",zht:"這天地點太多，要到{e}才能回到住處",es:"Demasiados lugares este día: no llegarás al alojamiento hasta las {e}"},
 overN2:{ko:"이 날은 장소가 많아 {e}에야 끝나요",en:"Too many places this day — it only ends at {e}",ja:"この日は場所が多く、終わるのは{e}になります",zhs:"这天地点太多，要到{e}才结束",zht:"這天地點太多，要到{e}才結束",es:"Demasiados lugares este día: no termina hasta las {e}"},
 mealL:{ko:"점심 식사 자리가 없어요",en:"There's no lunch break",ja:"昼食の時間がありません",zhs:"没有安排午餐",zht:"沒有安排午餐",es:"No hay hueco para comer"},
 mealD:{ko:"저녁 식사 자리가 없어요",en:"There's no dinner break",ja:"夕食の時間がありません",zhs:"没有安排晚餐",zht:"沒有安排晚餐",es:"No hay hueco para cenar"},
 bOrd:{ko:"순서 바꾸기",en:"Change the order",ja:"順番を変える",zhs:"调整顺序",zht:"調整順序",es:"Cambiar el orden"},
 bDrop:{ko:"이 장소 빼기",en:"Remove this place",ja:"この場所を外す",zhs:"移除这个地点",zht:"移除這個地點",es:"Quitar este lugar"},
 bKeep:{ko:"그대로 두기",en:"Leave it",ja:"このままにする",zhs:"保持不变",zht:"保持不變",es:"Dejarlo así"},
 bCart:{ko:"카트에서 고치기",en:"Edit in my trip",ja:"カートで直す",zhs:"在购物车中修改",zht:"在購物車中修改",es:"Editar en mi viaje"},
 bEat:{ko:"식당 찾기",en:"Find a restaurant",ja:"レストランを探す",zhs:"查找餐厅",zht:"查找餐廳",es:"Buscar restaurante"},
 dropD:{ko:"「{p}」 — 카트와 일정에서 뺐어요",en:"Removed “{p}” from your trip and plan",ja:"「{p}」をカートと日程から外しました",zhs:"已把「{p}」从购物车和行程中移除",zht:"已把「{p}」從購物車和行程中移除",es:"Quitamos «{p}» del viaje y del plan"},
 hl:{ko:"「{p}」 — ☰ 로 끌어 순서를 바꾼 뒤 「일정 짜기」를 다시 눌러 주세요",en:"“{p}” — drag ☰ to move it, then tap “Plan my trip” again",ja:"「{p}」 — ☰ をドラッグして順番を変えてから、もう一度「日程を組む」を押してください",zhs:"「{p}」——用 ☰ 拖动调整顺序后，再点一次「安排行程」",zht:"「{p}」——用 ☰ 拖動調整順序後，再點一次「安排行程」",es:"«{p}»: arrastra ☰ para moverlo y vuelve a tocar «Planificar»"},
 // 식당 찾기 · 넣기 확인
 fBtn:{ko:"직접 식당 찾기",en:"Find a restaurant myself",ja:"自分でレストランを探す",zhs:"自己找餐厅",zht:"自己找餐廳",es:"Buscar restaurante yo mismo"},
 fT:{ko:"식당 찾기 — {d} {m}",en:"Find a restaurant — {d}, {m}",ja:"レストランを探す — {d} {m}",zhs:"查找餐厅——{d} {m}",zht:"查找餐廳——{d} {m}",es:"Buscar restaurante: {d}, {m}"},
 fW:{ko:"조건을 넓혀 찾았어요 — 반경 5km · 음식 종류 아무거나 · 평점 기준 없음. 고른 조건과 다를 수 있는 곳은 표시했어요.",en:"We widened the search — within 5 km, any type of food, no rating filter. Places that may not match your preferences are marked.",ja:"条件を広げて探しました — 半径5km・料理の種類は問わず・評価の基準なし。選んだ条件と違う可能性がある店は表示しています。",zhs:"已放宽条件搜索——半径5公里 · 不限菜系 · 不限评分。可能不符合您所选条件的餐厅已标注。",zht:"已放寬條件搜尋——半徑5公里 · 不限菜系 · 不限評分。可能不符合您所選條件的餐廳已標註。",es:"Ampliamos la búsqueda: hasta 5 km, cualquier tipo de comida, sin filtro de valoración. Marcamos los que quizá no cumplan tus preferencias."},
 fIng:{ko:"더 넓게 찾는 중…",en:"Searching wider…",ja:"さらに広く検索中…",zhs:"正在扩大搜索…",zht:"正在擴大搜尋…",es:"Buscando más lejos…"},
 fNone:{ko:"5km 안에서도 식당을 못 찾았어요. 숙소 근처에서 드세요.",en:"No restaurants found even within 5 km. Please eat near your lodging.",ja:"5km以内でもレストランが見つかりませんでした。宿の近くでお食事ください。",zhs:"5公里内也没找到餐厅。请在住处附近用餐。",zht:"5公里內也沒找到餐廳。請在住處附近用餐。",es:"No encontramos restaurantes ni a 5 km. Come cerca del alojamiento."},
 fCond:{ko:"고른 음식 조건과 다를 수 있어요",en:"may not match your food preference",ja:"選んだ料理の条件と違う可能性があります",zhs:"可能不符合您选的饮食条件",zht:"可能不符合您選的飲食條件",es:"puede no cumplir tu preferencia de comida"},
 fHrs:{ko:"영업시간 정보 없음 — 「자세히 보기」에서 확인",en:"No opening hours — check in “Details”",ja:"営業時間の情報なし — 「詳しく見る」で確認",zhs:"无营业时间信息——请在「详情」中确认",zht:"無營業時間資訊——請在「詳情」中確認",es:"Sin horario: consúltalo en «Detalles»"},
 fNoR:{ko:"평점 정보 없음",en:"no rating info",ja:"評価情報なし",zhs:"无评分信息",zht:"無評分資訊",es:"sin valoración"},
 fNoRH:{ko:"평점·영업시간 정보 없음",en:"no rating or opening-hours info",ja:"評価・営業時間の情報なし",zhs:"无评分和营业时间信息",zht:"無評分和營業時間資訊",es:"sin valoración ni horario"},
 det:{ko:"자세히 보기",en:"Details",ja:"詳しく見る",zhs:"详情",zht:"詳情",es:"Detalles"},
 pick:{ko:"고르기",en:"Choose",ja:"選ぶ",zhs:"选择",zht:"選擇",es:"Elegir"},
 iT:{ko:"일정에 넣기 전에 확인해 주세요",en:"Check before adding to your plan",ja:"日程に入れる前にご確認ください",zhs:"加入行程前请确认",zht:"加入行程前請確認",es:"Revisa antes de añadirlo al plan"},
 iPos:{ko:"넣을 자리",en:"Where",ja:"入れる場所",zhs:"放在哪里",zht:"放在哪裡",es:"Dónde"},
 iStay:{ko:"머무는 시간",en:"How long",ja:"滞在時間",zhs:"停留时间",zht:"停留時間",es:"Cuánto tiempo"},
 p0:{ko:"출발하자마자 (1번째 장소 앞)",en:"Right at the start (before stop 1)",ja:"出発してすぐ（1番目の場所の前）",zhs:"一出发就去（第1个地点之前）",zht:"一出發就去（第1個地點之前）",es:"Al empezar (antes de la parada 1)"},
 pN:{ko:"{n}번째 「{p}」 다음",en:"After stop {n} “{p}”",ja:"{n}番目「{p}」の次",zhs:"第{n}个「{p}」之后",zht:"第{n}個「{p}」之後",es:"Después de la parada {n} «{p}»"},
 pE:{ko:" (그날 마지막)",en:" (last of the day)",ja:"（その日の最後）",zhs:"（当天最后）",zht:"（當天最後）",es:" (la última del día)"},
 iPrev:{ko:"넣으면 이 날 {e}에 끝나요 (지금 {c})",en:"With it, this day ends at {e} (now {c})",ja:"入れるとこの日は{e}に終わります（今は{c}）",zhs:"加入后这天{e}结束（现在{c}）",zht:"加入後這天{e}結束（現在{c}）",es:"Con esto, el día termina a las {e} (ahora {c})"},
 iOver:{ko:"{t}까지 다 못 돌아요",en:"you can’t see them all by {t}",ja:"{t}までに回りきれません",zhs:"{t}前逛不完",zht:"{t}前逛不完",es:"no da tiempo a verlo todo antes de las {t}"},
 iGo:{ko:"넣기",en:"Add",ja:"入れる",zhs:"加入",zht:"加入",es:"Añadir"},
 iNo:{ko:"넣지 않기",en:"Don't add",ja:"入れない",zhs:"不加入",zht:"不加入",es:"No añadir"},
 lunch:{ko:"점심",en:"Lunch",ja:"昼食",zhs:"午餐",zht:"午餐",es:"Comida"},
 dinner:{ko:"저녁",en:"Dinner",ja:"夕食",zhs:"晚餐",zht:"晚餐",es:"Cena"},
 meal:{ko:"식사",en:"Meal",ja:"食事",zhs:"用餐",zht:"用餐",es:"Comida"},
 rm:{ko:"빼기",en:"Remove",ja:"外す",zhs:"移除",zht:"移除",es:"Quitar"},
 rsv:{ko:"예약·전화 (네이버 지도)",en:"Reserve / call (Google Maps)",ja:"予約・電話（Googleマップ）",zhs:"预订·电话（Google地图）",zht:"預訂·電話（Google地圖）",es:"Reservar / llamar (Google Maps)"},
 rsvN:{ko:"식당 예약은 네이버 지도의 예약·전화로 해요 — 앱 안에서는 예약하지 않아요",en:"Reserve through Google Maps (reserve / call) — the app doesn't make bookings",ja:"予約はGoogleマップの予約・電話で — アプリ内では予約しません",zhs:"请通过Google地图预订或致电——应用内不提供预订",zht:"請透過Google地圖預訂或致電——應用程式內不提供預訂",es:"Reserva en Google Maps (reservar / llamar): la app no hace reservas"},
 added:{ko:"「{p}」 — 일정에 넣었어요",en:"Added “{p}”",ja:"「{p}」を入れました",zhs:"已加入「{p}」",zht:"已加入「{p}」",es:"Añadido «{p}»"},
 // 저녁이 빈 날
 eveQ:{ko:"저녁 일정이 비어 있어요 — {e}에 숙소 도착 · {t}까지 {g} 남아요",en:"Your evening is free — back at lodging at {e} · {g} left until {t}",ja:"夜の予定が空いています — {e}に宿到着・{t}まで{g}あります",zhs:"晚上的行程是空的——{e}回到住处 · 到{t}还有{g}",zht:"晚上的行程是空的——{e}回到住處 · 到{t}還有{g}",es:"Tienes la tarde-noche libre: llegas al alojamiento a las {e} · te quedan {g} hasta las {t}"},
 eveQ2:{ko:"저녁 일정이 비어 있어요 — {e}에 일정 끝 · {t}까지 {g} 남아요",en:"Your evening is free — the day ends at {e} · {g} left until {t}",ja:"夜の予定が空いています — {e}に予定終了・{t}まで{g}あります",zhs:"晚上的行程是空的——{e}行程结束 · 到{t}还有{g}",zht:"晚上的行程是空的——{e}行程結束 · 到{t}還有{g}",es:"Tienes la tarde-noche libre: el día termina a las {e} · te quedan {g} hasta las {t}"},
 eveE:{ko:" · 저녁 식사 없음",en:" · no dinner yet",ja:"・夕食なし",zhs:" · 尚未安排晚餐",zht:" · 尚未安排晚餐",es:" · sin cena"},
 eveD:{ko:"이 날은 저녁 식사 자리가 없어요",en:"No dinner planned for this day",ja:"この日は夕食の予定がありません",zhs:"这天没有安排晚餐",zht:"這天沒有安排晚餐",es:"Este día no tiene cena"},
 eveT:{ko:"일정 추가",en:"Add to your plan",ja:"予定を追加",zhs:"添加行程",zht:"新增行程",es:"Añadir al plan"},
 // 「일정 추가」 칸 단추 넷 (11-07 사장님 — 「저녁」「일찍」 빼고, 그날 끝 칸·장소 사이 빈 시간 칸 모두 같은 넷)
 eveAdd:{ko:"일정 추가",en:"Add a place",ja:"予定を追加",zhs:"添加行程",zht:"新增行程",es:"Añadir un lugar"},
 eveEat:{ko:"식당 찾기",en:"Find a restaurant",ja:"レストランを探す",zhs:"查找餐厅",zht:"查找餐廳",es:"Buscar restaurante"},
 eveNo:{ko:"숙소로 갈게요",en:"Head back to my lodging",ja:"宿に戻ります",zhs:"回住处",zht:"回住處",es:"Volver al alojamiento"},
 eveRest:{ko:"숙소에서 쉴게요",en:"Rest at my lodging",ja:"宿で休みます",zhs:"回住处休息",zht:"回住處休息",es:"Descansar en el alojamiento"},
 // 장소 사이 빈 시간 칸 (11-07)
 gapT:{ko:"{a}부터 {b}까지 {g}이 비어요",en:"{g} free from {a} to {b}",ja:"{a}から{b}まで{g}空いています",zhs:"{a}到{b}空出{g}",zht:"{a}到{b}空出{g}",es:"{g} libres de {a} a {b}"},
 gRec:{ko:"{d} 오전의 {p}{j} 이날 {q} 옮기기 ({t} 도착)",en:"Move “{p}” from the morning of {d} to this {q} (arrive {t})",ja:"{d}午前の「{p}」をこの日の{q}に移す（{t}着）",zhs:"把{d}上午的「{p}」移到这天{q}（{t}到达）",zht:"把{d}上午的「{p}」移到這天{q}（{t}到達）",es:"Pasar «{p}» de la mañana del {d} a {q} de este día (llegada {t})"},
 gRecS:{ko:"머무는 시간을 {m}으로 줄이면 들어가요",en:"fits if you shorten the stay to {m}",ja:"滞在時間を{m}にすれば入ります",zhs:"停留时间缩短到{m}就能排进去",zht:"停留時間縮短到{m}就能排進去",es:"cabe si acortas la estancia a {m}"},
 gI2:{ko:"빈 시간 바로 앞 장소 근처 명소예요. 「고르기」를 누르면 넣을 자리·머무는 시간을 정해요.",en:"Sights near the stop just before the free time. Tap “Choose” to set where and how long.",ja:"空き時間の直前の場所の近くの名所です。「選ぶ」で入れる場所・滞在時間を決めます。",zhs:"这些是空闲时间前一个地点附近的景点。点「选择」后再决定放在哪里、停留多久。",zht:"這些是空閒時間前一個地點附近的景點。點「選擇」後再決定放在哪裡、停留多久。",es:"Lugares cerca de la parada justo antes del tiempo libre. Toca «Elegir» para decidir dónde y cuánto tiempo."},
 rsRow:{ko:"숙소에서 쉬기 {a}–{b}",en:"Rest at your lodging {a}–{b}",ja:"宿で休憩 {a}–{b}",zhs:"回住处休息 {a}–{b}",zht:"回住處休息 {a}–{b}",es:"Descanso en el alojamiento {a}–{b}"},
 rsNoH:{ko:"숙소를 아직 정하지 않았어요. 숙소를 정하면 숙소에서 쉬다 갈 수 있어요.",en:"You haven't chosen your lodging yet. Choose one to rest there during the free time.",ja:"宿がまだ決まっていません。宿を決めると、空き時間に宿で休めます。",zhs:"还没确定住处。确定住处后，空闲时间可以回住处休息。",zht:"還沒確定住處。確定住處後，空閒時間可以回住處休息。",es:"Aún no has elegido alojamiento. Elígelo para descansar allí en el tiempo libre."},
 goT:{ko:"이 뒤 장소를 다른 날로 옮길까요?",en:"Move the rest of this day to other days?",ja:"この後の場所を別の日に移しますか？",zhs:"要把之后的地点移到其他日子吗？",zht:"要把之後的地點移到其他日子嗎？",es:"¿Pasamos los lugares siguientes a otros días?"},
 goI:{ko:"숙소로 가면 이 날 남은 {n}곳({l})은 못 가요. 날마다 시간이 맞는 자리를 찾아 옮기고, 맞는 날이 없는 곳은 그대로 두고 일정 검사에서 알려 드려요.",en:"If you head back now, you'll miss the remaining {n} place(s) ({l}). We'll move each one to the day where the times work best; any that fit no day stay here and the plan check will flag them.",ja:"宿に戻ると、この日の残り{n}か所（{l}）には行けません。日ごとに時間が合う位置を探して移し、合う日がない場所はそのままにして日程チェックでお知らせします。",zhs:"回住处的话，这天剩下的{n}个地点（{l}）就去不了了。我们会为每个地点找时间合适的日子移过去；没有合适日子的地点保持不变，并在行程检查中提示。",zht:"回住處的話，這天剩下的{n}個地點（{l}）就去不了了。我們會為每個地點找時間合適的日子移過去；沒有合適日子的地點保持不變，並在行程檢查中提示。",es:"Si vuelves ahora, te perderás los {n} lugar(es) que quedan ({l}). Pasaremos cada uno al día donde mejor encaje el horario; los que no encajen en ningún día se quedan y la revisión del plan te avisará."},
 goD:{ko:"{n}곳을 다른 날로 옮겼어요",en:"Moved {n} place(s) to other days",ja:"{n}か所を別の日に移しました",zhs:"已把{n}个地点移到其他日子",zht:"已把{n}個地點移到其他日子",es:"Pasamos {n} lugar(es) a otros días"},
 goK:{ko:"{n}곳은 맞는 날이 없어 그대로 두었어요",en:"{n} place(s) fit no other day and stayed",ja:"{n}か所は合う日がないため、そのままにしました",zhs:"{n}个地点没有合适的日子，保持不变",zht:"{n}個地點沒有合適的日子，保持不變",es:"{n} lugar(es) no encajan en otro día y se quedan"},
 gT:{ko:"추가할 곳 — {d}",en:"Places to add — {d}",ja:"追加する場所 — {d}",zhs:"可添加的地点——{d}",zht:"可新增的地點——{d}",es:"Lugares para añadir: {d}"},
 gI:{ko:"그날 마지막 장소 근처 명소예요. 「고르기」를 누르면 넣을 자리·머무는 시간을 정해요.",en:"Sights near your last stop that day. Tap “Choose” to set where and how long.",ja:"その日の最後の場所の近くの名所です。「選ぶ」で入れる場所・滞在時間を決めます。",zhs:"这些是当天最后一个地点附近的景点。点「选择」后再决定放在哪里、停留多久。",zht:"這些是當天最後一個地點附近的景點。點「選擇」後再決定放在哪裡、停留多久。",es:"Lugares cerca de tu última parada de ese día. Toca «Elegir» para decidir dónde y cuánto tiempo."},
 gFit:{ko:"넣으면 {e} 숙소 도착",en:"back at lodging {e} with it",ja:"入れると{e}に宿到着",zhs:"加入后{e}回到住处",zht:"加入後{e}回到住處",es:"llegarías al alojamiento a las {e}"},
 gFit2:{ko:"넣으면 {e}에 일정 끝",en:"the day ends at {e} with it",ja:"入れると{e}に予定終了",zhs:"加入后{e}结束行程",zht:"加入後{e}結束行程",es:"con esto el día termina a las {e}"},
 gapM:{ko:"식사 시각({t})까지 {g} 비어요",en:"{g} free before the meal at {t}",ja:"食事の時刻（{t}）まで{g}空いています",zhs:"到用餐时间（{t}）前空出{g}",zht:"到用餐時間（{t}）前空出{g}",es:"{g} libres antes de la comida a las {t}"},
 gNo:{ko:"{t}까지는 못 들어가요",en:"won't fit by {t}",ja:"{t}までには収まりません",zhs:"{t}前排不下",zht:"{t}前排不下",es:"no cabe antes de las {t}"},
 km:{ko:"{d} 거리",en:"{d} away",ja:"{d}先",zhs:"距离{d}",zht:"距離{d}",es:"a {d}"}};
// 머무는 시간 판단 — 장소 안에서 오가는 시간까지 센 「보통」(need). 값은 절대 안 바꾸고 한 줄만
var INNER=[{k:{gj_seokguram:1,seok:1},re:/석굴암|Seokguram/i,need:90,n:"i_seok"},{k:{tower:1,ntower:1},re:/N\s?서울타워|남산서울타워|N Seoul Tower/i,need:120,n:"i_tower"},
  {k:{gj_bulguksa:1},re:/불국사|Bulguksa/i,need:90,n:"i_bulguk"},{re:/서울스카이|Seoul Sky|롯데월드타워|Lotte World Tower/i,need:90,n:"i_sky"},{k:{bs_blueline:1},re:/블루라인|Blueline/i,need:120,n:"i_blue"},{re:/남이섬|Nami ?Island/i,need:180,n:"i_nami"}];
function innerOf(it){ if(!it) return null; var s=(it.ko||"")+" "+(it.en||""); for(var i=0;i<INNER.length;i++){ var q=INNER[i]; if((q.k&&q.k[it.k])||q.re.test(s)) return q; } return null; }
function stayJudge(it,m){ var c=catOf(it); if(c==="hotel"||c==="trans"||c==="food") return ""; var q=innerOf(it), need=q?q.need:stayEst(it), v={m:durTxt(m),n:durTxt(need)}, pre=q?T5(CK6[q.n])+" — ":"";
  if(m<(q?need:need*0.75)) return pre+gTxt(CK6.tight,v);
  if(m>=need*2.5&&m-need>=120) return pre+gTxt(CK6.loose,v);
  return q?pre+gTxt(CK6.ok,v):""; }
function stayOpts(cur,lo,hi,ud){ var o=[], seen={}; for(var m=lo;m<=hi;m+=30){ o.push(m); seen[m]=1; } if(!seen[cur]) o.push(cur); o.sort(function(a,b){ return a-b; });
  return o.map(function(m){ return '<option value="'+m+'"'+(m===cur&&!ud?' selected':'')+'>'+esc(durTxt(m))+'</option>'; }).join("")
    +(ud!=null?[1,2,3,4,5,6,7].map(function(n){ return '<option value="d'+n+'"'+(ud===n?' selected':'')+'>'+esc(udLbl(n))+'</option>'; }).join(""):""); }   // ud = 일 단위 칸도 (카트 · 11-08)
var HLK=null;   // 검사 창 「순서 바꾸기」로 카트에서 눈에 띄게 할 장소
// 11-07 사장님 「시작 시각 정하기」 — it.fx = 손님이 정한 그 장소 시작 시각(그날 0시부터 분, 카트 칸) · 일찍 닿으면 그 시각까지 기다리고(simDay), 늦게 닿으면 검사 창(fix)
//   검사 창 단추 — 하루 늘리기(날짜 수 +1 로 다시 짜기 = 「N일로 다시 짜기」 길) · 다른 날로 옮기기(mvOpen) · 머무는 시간 줄이기(stOpen)
var FX6={
 b:{ko:"도착 시각 정하기",en:"Set arrival time",ja:"到着時刻を決める",zhs:"设定到达时间",zht:"設定到達時間",es:"Fijar hora de llegada"},
 on:{ko:"{t} 도착",en:"arrive {t}",ja:"{t}着",zhs:"{t}到达",zht:"{t}到達",es:"llegada {t}"},
 nt:{ko:"⏰ {t} 도착",en:"⏰ arrive {t}",ja:"⏰ {t}着",zhs:"⏰ {t}到达",zht:"⏰ {t}到達",es:"⏰ llegada {t}"},
 set:{ko:"정하기",en:"Set",ja:"決める",zhs:"确定",zht:"確定",es:"Fijar"},
 clr:{ko:"도착 시각 지우기",en:"Clear arrival time",ja:"到着時刻を消す",zhs:"清除到达时间",zht:"清除到達時間",es:"Quitar hora de llegada"},
 bEarly:{ko:"{m} 일찍 출발하기 ({t} 출발)",en:"Leave {m} earlier ({t})",ja:"{m}早く出発する（{t}出発）",zhs:"提前{m}出发（{t}出发）",zht:"提前{m}出發（{t}出發）",es:"Salir {m} antes ({t})"},
 earlyD:{ko:"{d} 출발을 당겼어요 — {t} 출발",en:"{d}: departure moved up to {t}",ja:"{d}の出発を{t}に早めました",zhs:"{d}出发时间提前到{t}",zht:"{d}出發時間提前到{t}",es:"{d}: salida adelantada a las {t}"},
 fix:{ko:"{f} 도착으로 정해 두셨는데 {a}에 도착해요",en:"You chose to arrive at {f}, but you’ll get there at {a}",ja:"{f}到着にしていますが、{a}に着きます",zhs:"您选了{f}到达，但{a}才到",zht:"您選了{f}到達，但{a}才到",es:"Elegiste llegar a las {f}, pero llegas a las {a}"},
 bAdd:{ko:"하루 늘리기",en:"Add a day",ja:"1日増やす",zhs:"增加一天",zht:"增加一天",es:"Añadir un día"},
 bMv:{ko:"다른 날로 옮기기",en:"Move to another day",ja:"別の日に移す",zhs:"移到其他日子",zht:"移到其他日子",es:"Pasar a otro día"},
 bSh:{ko:"머무는 시간 줄이기",en:"Shorten stays",ja:"滞在時間を短くする",zhs:"缩短停留时间",zht:"縮短停留時間",es:"Acortar estancias"},
 lastP:{ko:"마지막 장소 「{p}」",en:"last stop “{p}”",ja:"最後の場所「{p}」",zhs:"最后一个地点「{p}」",zht:"最後一個地點「{p}」",es:"última parada «{p}»"},
 mT:{ko:"다른 날로 옮기기 — {p}",en:"Move to another day — {p}",ja:"別の日に移す — {p}",zhs:"移到其他日子——{p}",zht:"移到其他日子——{p}",es:"Pasar a otro día: {p}"},
 mI:{ko:"날마다 시간이 맞는 가장 좋은 자리를 찾았어요. 그날 다른 장소 순서는 그대로예요.",en:"We found the best spot in each day where the times work. The order of that day’s other places stays the same.",ja:"日ごとに時間が合ういちばん良い位置を探しました。その日のほかの場所の順番はそのままです。",zhs:"已在每一天找出时间合适的最佳位置，当天其他地点的顺序不变。",zht:"已在每一天找出時間合適的最佳位置，當天其他地點的順序不變。",es:"Buscamos en cada día el mejor hueco donde encaja el horario. El orden de los demás lugares de ese día no cambia."},
 mOk:{ko:"{t} 도착 ✓",en:"arrive {t} ✓",ja:"{t}着 ✓",zhs:"{t}到达 ✓",zht:"{t}到達 ✓",es:"llegada {t} ✓"},
 mNo:{ko:"이 날도 문 연 시간에 도착할 수 없어요",en:"Can’t get there during opening hours on this day either",ja:"この日も営業時間内に着けません",zhs:"这天也赶不上营业时间",zht:"這天也趕不上營業時間",es:"Este día tampoco llegas en horario de apertura"},
 mNoF:{ko:"이 날도 {f}까지 도착할 수 없어요",en:"Can’t get there by {f} on this day either",ja:"この日も{f}までに着けません",zhs:"这天也赶不上{f}到达",zht:"這天也趕不上{f}到達",es:"Este día tampoco llegas a las {f}"},
 mCity:{ko:"다른 도시에 있는 날이에요",en:"You’re in another city that day",ja:"この日は別の都市にいます",zhs:"这天在其他城市",zht:"這天在其他城市",es:"Ese día estás en otra ciudad"},
 mOth:{ko:"이 날 다른 장소 {n}곳 시간이 안 맞게 돼요",en:"{n} other place(s) that day would stop fitting the time",ja:"この日のほかの{n}か所の時間が合わなくなります",zhs:"当天另外{n}个地点的时间会对不上",zht:"當天另外{n}個地點的時間會對不上",es:"{n} lugar(es) más de ese día dejarían de encajar en el horario"},
 mNone:{ko:"옮길 수 있는 날이 없어요 — 하루를 늘리거나 이 장소를 빼 보세요",en:"There’s no day it fits — add a day or remove this place",ja:"移せる日がありません — 1日増やすか、この場所を外してください",zhs:"没有可以移过去的日子——请增加一天或移除这个地点",zht:"沒有可以移過去的日子——請增加一天或移除這個地點",es:"No hay ningún día donde encaje: añade un día o quita este lugar"},
 mD:{ko:"「{p}」 — {d}로 옮겼어요",en:"Moved “{p}” to {d}",ja:"「{p}」を{d}に移しました",zhs:"已把「{p}」移到{d}",zht:"已把「{p}」移到{d}",es:"«{p}» pasó al {d}"},
 sT:{ko:"머무는 시간 줄이기 — {d}",en:"Shorten stays — {d}",ja:"滞在時間を短くする — {d}",zhs:"缩短停留时间——{d}",zht:"縮短停留時間——{d}",es:"Acortar estancias: {d}"},
 sI:{ko:"앞 장소에서 머무는 시간을 줄이면 「{p}」에 더 일찍 도착해요.",en:"Spend less time at the earlier places to reach “{p}” sooner.",ja:"前の場所の滞在時間を短くすると、「{p}」に早く着きます。",zhs:"缩短前面地点的停留时间，就能更早到达「{p}」。",zht:"縮短前面地點的停留時間，就能更早到達「{p}」。",es:"Si pasas menos tiempo en los lugares anteriores, llegarás antes a «{p}»."},
 sOk:{ko:"「{p}」 — 이제 시간이 맞아요",en:"“{p}” now fits the time",ja:"「{p}」は時間が合うようになりました",zhs:"「{p}」现在时间合适了",zht:"「{p}」現在時間合適了",es:"«{p}» ya encaja en el horario"},
 sEnd:{ko:"이 날 {e}에 끝나요",en:"This day ends at {e}",ja:"この日は{e}に終わります",zhs:"这天{e}结束",zht:"這天{e}結束",es:"Este día termina a las {e}"},
 sGo:{ko:"다시 검사하기",en:"Check again",ja:"もう一度チェック",zhs:"重新检查",zht:"重新檢查",es:"Revisar de nuevo"},
 // 11-07 짤 때 정한 시각에 못 닿는 곳을 같은 도시 다른 날로 옮긴 것 (그 장소 줄에 한 줄)
 mvA:{ko:"도착한 날엔 {f}까지 갈 수 없어 {d}로 옮겼어요",en:"Couldn't make {f} on arrival day, so we moved it to {d}",ja:"到着日は{f}に間に合わないため{d}に移しました",zhs:"到达当天赶不上{f}，已移到{d}",zht:"抵達當天趕不上{f}，已移到{d}",es:"El día de llegada no llegabas a las {f}; lo pasamos al {d}"},
 mvN:{ko:"{s}엔 {f}까지 갈 수 없어 {d}로 옮겼어요",en:"Couldn't make {f} on {s}, so we moved it to {d}",ja:"{s}は{f}に間に合わないため{d}に移しました",zhs:"{s}赶不上{f}，已移到{d}",zht:"{s}趕不上{f}，已移到{d}",es:"El {s} no llegabas a las {f}; lo pasamos al {d}"},
 // 11-07 시작 시각보다 이른 도착 시각에 맞춰 그날 출발을 알아서 당긴 것 (그날 맨 위 한 줄 — fxEarly)
 frA:{ko:"「{p}」 {f} 도착에 맞춰 {t}에 출발해요",en:"Leaving at {t} to reach “{p}” by {f}",ja:"「{p}」に{f}に着くよう、{t}に出発します",zhs:"为了{f}到达「{p}」，{t}出发",zht:"為了{f}到達「{p}」，{t}出發",es:"Salimos a las {t} para llegar a «{p}» a las {f}"}};
function fxOf(x){ var v=x&&x.fx; return (v!=null&&v!==""&&isFinite(+v)&&+v>=0&&+v<1440)?Math.round(+v):null; }

// ── 메뉴·칩 ──
function refresh(){ var n=TR.items.length, mm=document.getElementById("mm"); var om=document.getElementById("mtrip"); if(om) om.remove();   // 11-06 사장님 ⋮ 메뉴 「My trip(여행카트)」 삭제 — 머리줄 카트에 있음
  if(mm&&false){ var a=document.getElementById("mtrip"); if(!a){ a=document.createElement("a"); a.id="mtrip"; a.href="#"; a.className="mi"; a.onclick=function(){ mm.hidden=true; openPanel(); return false; }; mm.insertBefore(a,mm.firstChild); }
    a.innerHTML='<img class="miic" src="img/menu/mi_cart.png" alt="">'+esc(T("여행카트 ("+n+")","My trip ("+n+")")); }
  var tb=document.querySelector(".tbs"), c=document.getElementById("trchip");
  if(tb&&!c){ c=document.createElement("button"); c.id="trchip"; c.type="button"; c.className="tb"; c.onclick=cartGo; var rs=document.getElementById("rs"); tb.insertBefore(c,rs&&rs.parentNode===tb?rs.nextSibling:null); }   // 머리줄 = 처음으로 | 🛒 | 공유 | 🌐 | 💬 | 🔔 | 🌙 | ⋮ (사장님 11-06)
  if(c){ c.hidden=false; c.className="hic"; c.innerHTML=CARTSVG("24px","display:block")+'<span class="tcn">'+n+'</span>'; c.title=T("내 여행","My trip"); }   // 11-07 사장님 — 옆 아이콘(24px)과 같은 크기 · 바탕 투명(흰 칸 없앰) · 담은 수는 옆에
  flags(); pcHook("refresh"); }
function cartGo(){ if(TR.plan) openReport(); else openPanel(); }   // 11-08 사장님 「이미 짠 일정이 있으면 카트를 눌렀을 때 기존 일정을 보여준다」 — 담은 곳·조건은 일정표 위 「✏ 고치기」
// ── 내 플랜 여러 개 (사장님 11-08 「나」 — 플랜마다 따로, 날짜가 겹쳐도 된다) ──
//   지금 플랜 = TR.items·TR.opt·TR.plan(예전 그대로) + TR.pid · 다른 플랜 = TR.saved[{id,items,opt,plan,u:마지막으로 쓴 시각}] → save()·「내 여행」 기기끼리 맞추기가 통째로 같이 나른다
//   이름은 만든 차례대로 「플랜 1」「플랜 2」… · 지워도 남은 플랜 번호는 그대로(11-08 사장님 「나」) · 새 플랜 = 지금 가장 큰 번호 + 1 · 날짜는 짠 일정의 첫날~끝날(없으면 조건의 첫날·여행 일수)
//   카트 맨 위·일정표 맨 위에 [플랜 고르기 ▾] [새 플랜] [플랜 삭제] · 「자유 일정」 날마다 [이 날짜로 새 플랜]
var PL6={nm:{ko:"플랜 {n}",en:"Plan {n}",ja:"プラン{n}",zhs:"方案{n}",zht:"方案{n}",es:"Plan {n}"},
 sel:{ko:"내 플랜",en:"My plans",ja:"マイプラン",zhs:"我的方案",zht:"我的方案",es:"Mis planes"},
 nw:{ko:"플랜 추가",en:"Add plan",ja:"プランを追加",zhs:"添加方案",zht:"新增方案",es:"Añadir plan"},   // 11-08 사장님 「새 플랜」→「플랜 추가」
 del:{ko:"플랜 삭제",en:"Delete plan",ja:"プランを削除",zhs:"删除方案",zht:"刪除方案",es:"Eliminar plan"},
 day:{ko:"이 날짜로 플랜 추가",en:"Add plan from this day",ja:"この日からプランを追加",zhs:"从这天起添加方案",zht:"從這天起新增方案",es:"Añadir plan desde este día"},
 q:{ko:"「{p}」의 담은 곳과 일정표를 모두 지울까요?",en:"Delete “{p}”, including its places and schedule?",ja:"「{p}」の追加した場所と日程表をすべて削除しますか？",zhs:"要删除「{p}」的所有地点和行程表吗？",zht:"要刪除「{p}」的所有地點和行程表嗎？",es:"¿Eliminar «{p}» con todos sus lugares y su itinerario?"}};
function plAll(){ var a=(TR.saved||[]).slice(); a.push({id:TR.pid,no:TR.pno,items:TR.items,opt:TR.opt,plan:TR.plan,cur:1}); return a.sort(function(x,y){ return x.id-y.id; }); }
function plName(id){ var p=plAll().filter(function(x){ return x.id===id; })[0]; return gTxt(PL6.nm,{n:p&&p.no||1}); }
function plNoNext(){ return plAll().reduce(function(m,p){ return Math.max(m,+p.no||0); },0)+1; }
function plDays(p){ return p.plan&&Array.isArray(p.plan.days)&&p.plan.days.length?p.plan.days:null; }
function plLast(p){ var ds=plDays(p), o=p.opt||{}; if(ds) return ds[ds.length-1].date; var d=new Date((o.start||kstToday(1))+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+Math.max(1,+o.n||1)-1); return d.toISOString().slice(0,10); }
function plMD(d){ return LANG==="es"?d.getUTCDate()+"/"+(d.getUTCMonth()+1):(d.getUTCMonth()+1)+"/"+d.getUTCDate(); }   // 스페인어는 일/월
function plRange(p){ var ds=plDays(p), o=p.opt||{}, a=new Date((ds?ds[0].date:(o.start||kstToday(1)))+"T00:00:00Z"), b=new Date(plLast(p)+"T00:00:00Z"); if(!isFinite(a)||!isFinite(b)) return "";
  return plMD(a)+(b>a?({ja:"〜",en:"–",es:"–"}[LANG]||"~")+plMD(b):""); }
function plBar(){ var a=plAll(); return '<div class="trpbar" data-html2canvas-ignore><select class="trpsel" aria-label="'+esc(T5(PL6.sel))+'">'+a.map(function(p,i){ return '<option value="'+p.id+'"'+(p.cur?' selected':'')+'>'+esc(gTxt(PL6.nm,{n:p.no||i+1})+" · "+plRange(p))+'</option>'; }).join("")+'</select>'
  +'<span class="trpbt"><button type="button" class="trbtn trpnew" data-pnew="1">'+esc(T5(PL6.nw))+'</button><button type="button" class="trbtn" data-pdel="1">'+esc(T5(PL6.del))+'</button></span></div>'; }   // 한 줄에 다 안 들어가면(영어·스페인어) 단추 둘이 같이 아랫줄 오른쪽으로
function plId(){ var id=Date.now(), a=plAll(); while(a.some(function(p){ return p.id===id; })) id++; return id; }
function plStash(){ TR.saved=TR.saved||[]; TR.saved.push({id:TR.pid,no:TR.pno,items:TR.items,opt:TR.opt,plan:TR.plan,u:Date.now()}); }
function plUse(p){ TR.items=Array.isArray(p.items)?p.items:[]; TR.opt=p.opt||opt0(); TR.plan=p.plan||null; TR.pid=p.id; TR.pno=+p.no||1; SAVED_H=JSON.stringify(TR.opt.hotel||null); HLK=null; REPH=null; }   // 숙소를 고른 표시(hOk)는 플랜 것 그대로 — save() 가 다시 매기지 않게
// 바꾼 뒤 열려 있던 화면을 그 플랜으로 — 일정표가 열려 있었는데 짠 일정이 없으면 카트로 · panel = 카트를 연다(새 플랜)
function plShow(panel){ try{ refresh(); }catch(e){} try{ nowPaint(); }catch(e){} try{ if(document.getElementById("aipSteps")) stepsPaint(); }catch(e){}
  var rep=!!document.getElementById("trRep");
  if(panel||(rep&&!TR.plan)){ sheetClose("trRep"); openPanel(); return; }
  if(rep){ openReport(); return; }
  if(document.getElementById("trBox")) panelPaint(); }
function plSwitch(id){ if(!id||id===TR.pid) return; var S=TR.saved||[], i=-1; S.forEach(function(p,j){ if(p.id===id) i=j; }); if(i<0) return;
  var nx=S.splice(i,1)[0]; plStash(); plUse(nx); save(); try{ ntap("_trip","plan_sw"); }catch(z){} plShow(); }
// 「자유 일정」 날 — 일정표 그리기(repPaint0)와 같은 기준: 장소·여러 날 머묾·공항 도착·도시 이동이 없는 날
function plFree(pl,di){ var d=pl&&pl.days&&pl.days[di]; if(!d||d.md) return false; if((d.stops||[]).some(function(k){ return pl.pool&&pl.pool[k]; })) return false;
  if(pl.mc){ if(di===0&&pl.ap&&pl.ap.a) return false; if(d.am!=null&&pl.tr&&pl.tr[d.am]) return false; if(d.pm!=null&&pl.tr&&pl.tr[d.pm]) return false; } return true; }
// 새 플랜 — di = 그 자유 일정 날부터 이어지는 자유 일정 날까지 · di 없음(「새 플랜」 단추) = 맨 뒤 자유 일정 날들, 없으면 끝날 다음 날부터 3일
//   카트는 비우고 조건은 그대로(숙소·시작/끝나는 시각·걷기·음식·인원…) · 도착 공항은 안 옮김 · 떠나는 공항은 끝날이 같을 때만 · 숙소를 고른 표시는 새 날짜로
function plNew(di){ var o=TR.opt, pl=TR.plan, ds=plDays({plan:pl}), last=plLast({opt:o,plan:pl}), start, n;
  if(di==null&&ds){ var j=ds.length; while(j>0&&plFree(pl,j-1)) j--; if(j>0&&j<ds.length) di=j; }
  if(di!=null&&ds&&ds[di]){ start=ds[di].date; n=0; for(var k=di;k<ds.length&&plFree(pl,k);k++) n++; n=Math.max(1,n); }
  else { var d=new Date(last+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+1); start=d.toISOString().slice(0,10); n=3; }
  var no=JSON.parse(JSON.stringify(o)), e=new Date(start+"T00:00:00Z"); e.setUTCDate(e.getUTCDate()+n-1);
  no.start=start; no.n=n; no.ap=Object.assign({},no.ap||{}); no.ap.a=null; if(e.toISOString().slice(0,10)!==last) no.ap.d=null;
  no.hOk=(no.hotel&&hOkNow())?start+"|"+n:"";
  var nn=plNoNext(); plStash(); plUse({id:plId(),no:nn,items:[],opt:no,plan:null}); save(); try{ ntap("_trip","plan_new"); }catch(z){} plShow(1); }
// 플랜 삭제 — 한 번 묻고, 남은 플랜 가운데 가장 최근에 쓴 것을 연다 · 마지막 하나였으면 빈 플랜(기본 조건)
function plDel(){ if(!confirm(gTxt(PL6.q,{p:plName(TR.pid)}))) return; var S=TR.saved||[];
  if(S.length){ var b=0; S.forEach(function(p,j){ if((p.u||0)>(S[b].u||0)) b=j; }); plUse(S.splice(b,1)[0]); }
  else plUse({id:plId(),no:1,items:[],opt:opt0(),plan:null});
  save(); try{ ntap("_trip","plan_del"); }catch(z){} plShow(); }
document.addEventListener("change",function(e){ var s=e.target.closest&&e.target.closest("#trBox .trpsel,#trRep .trpsel,#pcAiBar .trpsel"); if(!s) return; plSwitch(+s.value); });
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trBox [data-pnew],#trRep [data-pnew],#trBox [data-pdel],#trRep [data-pdel],#trRep [data-pnd],#pcAiBar [data-pnew],#pcAiBar [data-pdel]"); if(!a) return; e.preventDefault(); if(typeof DG!=="undefined"&&DG) return;
  if(a.dataset.pdel) plDel(); else if(a.dataset.pnd!=null) plNew(+a.dataset.pnd); else plNew(null); });
// 카트 아이콘 = 구글 Material Symbols 「shopping_cart」(Apache 2.0, github.com/google/material-design-icons) 경로 그대로 (사장님 11-05) — 머리줄 카트·AI와 일정짜기 화면·안내 창이 같이 쓴다
function CARTSVG(sz,st){ return '<svg class="cartic" viewBox="0 -960 960 960" width="'+sz+'" height="'+sz+'" fill="currentColor" aria-hidden="true" style="display:inline-block;'+(st||"")+'"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>'; }
window.CARTSVG=CARTSVG;

// ── 창 공통 ──
function tPop(html){ var b=document.createElement("div"); b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ b.innerHTML='<div>'+(typeof html==="function"?html():html)+'<button type="button" class="trbtn" style="margin-top:12px" onclick="this.closest(\'.trpop\').remove()">'+T("닫기","Close")+'</button></div>'; };
  draw(); if(typeof html==="function") b._rb=draw;   // 글을 함수로 주면 언어를 바꿀 때 그 자리에서 다시 (lang.js, 10-18)
  document.body.appendChild(b); return b; }
// 11-08 홈페이지(PC_HOME) — 카트(trBox)·일정표(trRep)는 덮개 대신 PC 화면 칸 안에 그린다(home/pc_ai.js 의 PCSHEET 가 자리를 준다) · 앱(PC_HOME 없음)은 예전 그대로
function pcHook(w,x){ if(!window.PC_HOME||typeof window.PCTRIP!=="function") return; try{ window.PCTRIP(w,x); }catch(e){ try{ console.error(e); }catch(z){} } }
function sheet(id){ var o=document.getElementById(id); if(o) o.remove(); var ph=null; if(window.PC_HOME&&typeof window.PCSHEET==="function"){ try{ ph=window.PCSHEET(id); }catch(e){ ph=null; } }
  o=document.createElement("div"); o.id=id; o.className=ph?"pcsheet":"trsheet";
  o.innerHTML='<div class="trin"></div>'; if(ph){ ph.appendChild(o); return o.firstChild; } document.body.appendChild(o); document.documentElement.classList.add("trlock"); return o.firstChild; }
function sheetClose(id){ var o=document.getElementById(id); if(o) o.remove(); if(!document.querySelector(".trsheet")) document.documentElement.classList.remove("trlock"); }

// ── 담은 목록 + 조건 ──
var HOTELS=[], ADDR=[];
function openPanel(){ var mm=document.getElementById("mm"); if(mm) mm.hidden=true; sheet("trBox"); panelPaint();
  Promise.all(Object.keys(window.CITY||{}).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){ hotelsFill(); if(document.getElementById("trBox")) panelPaint(); }); }
function hotelsFill(){ HOTELS=[]; for(var k in PLACES){ if(k.charAt(0)==="_") continue; var p=PLACES[k]; if(/^h_/.test(k)||/호텔/.test(p.ko)) HOTELS.push({k:k,ko:p.ko,en:p.en,lat:+p.lat,lng:+p.lng}); }
  HOTELS.sort(function(a,b){ return a.ko<b.ko?-1:1; }); }
function hotelTxt(h){ if(!h) return T("정하지 않음","Not set"); if(h.type==="here") return T("📍 현재 위치","📍 My current location"); return (h.type==="addr"?"🔎 ":"🏨 ")+nm(h); }
function panelPaint(){ var box=document.querySelector("#trBox .trin"); if(!box) return; pcHook("panel0",box); var o=TR.opt, n=TR.items.length; try{ PANELG=panelGroups(); }catch(e){ PANELG=null; }   // 도시가 둘 이상이면 도시별 숙소 (11-06)
  var li=TR.items.map(function(it,i){ var c=catOf(it), x=c==="hotel"?T(" · 숙소는 아래에서 고르세요"," · choose lodging below"):c==="trans"?T(" · 교통시설(일정에서 뺌)"," · transport (skipped)"):"";
    // 11-07 머무는 시간 칸(30분 단위 30분~8시간, 기본 = 지금 추정값) + 적당한지 한 줄(값은 안 바꾼다)
    var sw="", jd=""; if(!x){ var m=stayOf(it); sw='<span class="trsw"><label class="trswl">'+MPIMG("mi_clock",MIS)+esc(T5(CK6.stay))+' <select class="trsl" data-k="'+esc(it.k)+'">'+stayOpts(m,30,480,udOf(it))+'</select></label>'+(udOf(it)>=2?'<span class="trud">'+esc(udNb(udOf(it)))+(udOf(it)>=3&&udEnd(TR.plan,it.k)?' · '+esc(gTxt(UD6.end,{d:udEnd(TR.plan,it.k)})):'')+'</span>':'')+'<span class="trfxw">'+fxCart(it)+'</span></span>'; jd=stayJudge(it,m); }   // 11-07 옆에 「시작 시각」(fx)
    return '<li class="tri'+(HLK&&it.k===HLK?' hl':'')+'" data-k="'+esc(it.k)+'"><span class="trh" title="drag">☰</span><b class="trn">'+(i+1)+'</b><span class="trt">'+(it.eat?MPIMG("mi_food",MIS):'')+esc(nm(it))+(x?'<i>'+esc(x)+'</i>':'')+sw+(jd?'<span class="trjd">'+esc(jd)+'</span>':'')+'</span><button type="button" class="trx" data-k="'+esc(it.k)+'" aria-label="remove">✕</button></li>'; }).join("");
  var hsel='<select id="trHotel"><option value="">'+T("— 숙소 고르기 —","— Choose lodging —")+'</option><option value="__here"'+(o.hotel&&o.hotel.type==="here"?" selected":"")+'>'+T("📍 현재 위치","📍 My current location")+'</option>'
    +HOTELS.map(function(h){ return '<option value="'+esc(h.k)+'"'+(o.hotel&&o.hotel.k===h.k?" selected":"")+'>🏨 '+esc(nm(h))+'</option>'; }).join("")
    +(o.hotel&&o.hotel.type==="addr"?'<option value="__addr" selected>'+esc(hotelTxt(o.hotel))+'</option>':"")+'</select>';
  box.innerHTML='<div class="trtop"><b>'+MPICO("mi_cart",T("🛒 내 여행","🛒 My trip"),MIS)+' ('+n+')</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trBox\')">✕</button></div>'
    +plBar()   // 11-08 내 플랜 고르기·새 플랜·플랜 삭제
    +(TR.plan?'<button type="button" class="trbtn" id="trOpenRep" style="margin:0 0 8px">'+MPICO("mi_doc",T5({ko:"📄 내 일정 보기",en:"📄 My plan",ja:"📄 私の日程を見る",zhs:"📄 查看我的行程",zht:"📄 查看我的行程",es:"📄 Ver mi plan"}),MIS)+'</button>':"")   // 11-07 사장님 — 맨 위로 옮기고 「지난 일정 보기」 → 「내 일정 보기」 (짜 둔 일정을 연다 · 다시 짜면 덮어씀)
    +(!sySess()?'<div class="trsync">'+esc(T5(SYL6.q))+'<button type="button" class="trbtn pri" id="trLogin">'+esc(T5(SYL6.b))+'</button></div>':'')
    +(n?(HLK&&has(HLK)?'<div class="trhln">'+esc(gTxt(CK6.hl,{p:nm(TR.items.filter(function(x){ return x.k===HLK; })[0])}))+'</div>':'')+'<ol class="trl" id="trList">'+li+'</ol><button type="button" class="trbtn" id="trClearAll" style="margin:6px 0">'+T("🗑 모두 비우기","🗑 Clear all")+'</button><div class="d">'+esc(T5(CK6.hint))+'</div>'
      :'<div class="msg">'+esc(T5(PS8.empty))+'</div>')
    +psCartBox()   // 11-08 사장님 「검색으로 완전히 새로운 장소나 액티비티」 — 카트에서도 찾아 담기
    +'<div class="trf2"><label>'+T("여행 일수","Days")+nInput("trN","",o.n)+'<span class="d trnm" id="trNm" hidden></span></label>'
    +'<label>'+T("첫날","First day")+'<input type="date" id="trStart" value="'+esc(o.start||kstToday(1))+'"></label>'
    +'<label>'+T("시작 시각","Start")+'<input type="time" id="trFrom" value="'+esc(o.from)+'"></label>'
    +'<label>'+T("끝나는 시각","End")+'<input type="time" id="trTo" value="'+esc(o.to)+'"></label>'
    +'<label>'+T("걷기","Walking")+'<select id="trWalk"><option value="0"'+(o.walk===0?" selected":"")+'>'+T("적게 (1km까지)","Less (≤1 km)")+'</option><option value="1"'+(o.walk===1?" selected":"")+'>'+T("보통 (2km까지)","Normal (≤2 km)")+'</option><option value="2"'+(o.walk===2?" selected":"")+'>'+T("많이 (3km까지)","More (≤3 km)")+'</option></select></label>'
    +'<label>'+T("음식","Food")+'<select id="trFood">'+FOODS.map(function(f){ return '<option value="'+f[0]+'"'+(o.food===f[0]?" selected":"")+'>'+esc(T(f[1],f[2]))+'</option>'; }).join("")+'</select></label>'
    +'<label class="trck"><input type="checkbox" id="trAdv"'+(o.adv?" checked":"")+'> '+T("도전 음식도 괜찮아요","I’m adventurous")+'</label>'
    +(PANELG?natHotelRows(PANELG):'<label class="wide">'+T("숙소","Lodging")+hsel+'</label>')
    // 11-07 사장님 — 「도시별 숙소」 아래 안내 문장·「숙소 이름·주소로 찾기」 칸·🔍 삭제(도시마다 🏨 숙소 찾기 단추가 있다) · 도시 하나 일정은 이 칸이 유일한 숙소 검색이라 그대로
    +(PANELG?'':'<div class="wide trsr"><input id="trAddrQ" enterkeyhint="search" placeholder="'+T("숙소 이름·주소로 찾기","Search lodging by name/address")+'"><button type="button" class="tb" id="trAddrGo">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div><div class="wide" id="trAddrR"></div>')+natApRows()+'</div>'
    +'<button type="button" class="trbtn big" id="trPlan"'+(n?"":" disabled")+'>'+MPICO("mi_calendar",T("🗓 일정 짜기","🗓 Plan my trip"),MIS)+'</button>'
    +'<button type="button" class="trbtn" id="trPlanS" style="display:block;width:100%;margin:8px 0 0"'+(n?"":" disabled")+'>'+esc(T5(PS6.b))+'</button>'   // 11-08 사장님 「카트에 있는 장소만 남기고 일정을 다시 짜는 단추」 — 관광지만(식당 뺌, 사장님 「맞다」)
    +'<div class="d" style="margin-top:8px">'+T("일정은 이 기기에만 저장돼요. 위치는 저장하지 않아요.","Your plan is saved only on this device. Your location is never saved.")+'</div>';
  var g=function(id){ return document.getElementById(id); };
  g("trN").onchange=function(){ var q=nFix(this.value,o.n), m=g("trNm"); this.value=q.n; if(m){ m.hidden=!q.fix; m.textContent=q.fix?nMsg(q.n):""; } if(q.n!==o.n){ o.n=q.n; TR.plan=null; save(); } };   // 숫자 칸 (11-06) — 1~90 밖·빈칸은 맞추고 한 줄 안내
  g("trStart").onchange=function(){ o.start=this.value; save(); };
  g("trFrom").onchange=function(){ if(hm2m(this.value)!=null) o.from=this.value; save(); };
  g("trTo").onchange=function(){ if(hm2m(this.value)!=null) o.to=this.value; save(); };
  g("trWalk").onchange=function(){ o.walk=+this.value; save(); };
  g("trFood").onchange=function(){ o.food=this.value; save(); }; g("trAdv").onchange=function(){ o.adv=this.checked; save(); };
  if(g("trHotel")) g("trHotel").onchange=function(){ var v=this.value; if(!v) o.hotel=null; else if(v==="__here") o.hotel={type:"here"}; else if(v!=="__addr"){ var h=HOTELS.filter(function(x){ return x.k===v; })[0]; if(h) o.hotel={type:"place",k:h.k,ko:h.ko,en:h.en,lat:h.lat,lng:h.lng}; } save(); };
  if(g("trAddrGo")){ g("trAddrGo").onclick=addrSearch; g("trAddrQ").onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); addrSearch(); } }; }
  g("trPlan").onclick=planGo; g("trPlanS").onclick=planSights; psCartWire(g); if(g("trOpenRep")) g("trOpenRep").onclick=function(){ openReport(); };
  [].forEach.call(box.querySelectorAll(".trx"),function(b){ b.onclick=function(){ if(b.dataset.k===HLK) HLK=null; delItem(b.dataset.k); panelPaint(); }; });
  // 머무는 시간 칸 — 고른 값 그대로(um). 짜 둔 일정이 있으면 그 일정의 같은 장소도 같은 값으로 바꾸고 「다시 검사」 표시(AI 다시 안 부름)
  [].forEach.call(box.querySelectorAll(".trsl"),function(s){ s.onchange=function(){ var k=s.dataset.k, it=TR.items.filter(function(x){ return x.k===k; })[0], m=+s.value; if(!it) return;
    var dv=/^d(\d+)$/.exec(s.value); if(dv||udOf(it)){ if(dv) it.ud=+dv[1]; else { delete it.ud; if(m>0) it.um=m; } TR.plan=null; save(); refresh(); panelPaint(); return; }   // 일 단위로 바꾸거나 일 단위에서 돌아오면 날짜 틀이 바뀌니 다시 짜기 (11-08)
    if(!(m>0)) return; it.um=m;
    var pl=TR.plan; if(pl&&pl.pool&&pl.pool[k]){ pl.pool[k].um=m; pl.pool[k].stay=m; pl.chk=2; }
    save(); var li2=s.closest(".tri"), jd=stayJudge(it,m), sp=li2&&li2.querySelector(".trjd"); if(li2){ if(jd){ if(!sp){ sp=document.createElement("span"); sp.className="trjd"; li2.querySelector(".trt").appendChild(sp); } sp.textContent=jd; } else if(sp) sp.remove(); } }; });
  if(HLK){ var hle=box.querySelector(".tri.hl"); if(hle) setTimeout(function(){ try{ hle.scrollIntoView({block:"center",behavior:"smooth"}); }catch(e){} },60); }
  if(g("trClearAll")) g("trClearAll").onclick=function(){ if(!confirm(T("담은 곳과 짠 일정을 모두 지울까요?","Remove all places and your plan?"))) return; TR.items=[]; TR.plan=null; save(); refresh(); panelPaint(); };   // 모두 비우기 (사장님 10-16)
  natPanelWire(box); dragInit(g("trList")); pcHook("panel",box); }
// 카트 「시작 시각」 칸 (11-07) — [⏰ 시작 시각] → 시각 칸(input time)+[정하기] → 「⏰ 14:00 고정 ✕」 · ✕ = 지우기 · 그 줄만 다시 그린다
function fxCart(it){ var f=fxOf(it); if(f!=null) return '<span class="trfx">⏰ '+esc(gTxt(FX6.on,{t:m2hm(f)}))+'<button type="button" class="trfxx" data-k="'+esc(it.k)+'" aria-label="'+esc(T5(FX6.clr))+'">✕</button></span>';
  return '<button type="button" class="trfxb" data-k="'+esc(it.k)+'">⏰ '+esc(T5(FX6.b))+'</button>'; }
// 시각 칸 처음 값 — 짜 둔 일정에서 그 장소에 닿는 시각(10분 단위), 없으면 하루 시작 시각
function fxGuess(it){ var f=fxOf(it); if(f!=null) return m2hm(f); var pl=TR.plan;
  if(pl&&pl.pool&&pl.pool[it.k]) try{ for(var di=0;di<pl.days.length;di++){ if(pl.days[di].stops.indexOf(it.k)<0) continue; var X=dayX(pl,di,REPH||pl.H||null), s=withLC(function(){ return sched(X.H,X.arr,X.dt,X.from,moX(di,X)); }), r=s.rows.filter(function(q){ return q.x&&q.x.k===it.k; })[0]; if(r) return m2hm(Math.round(r.t/10)*10); } }catch(e){}
  return (TR.opt&&TR.opt.from)||"09:30"; }
// 정하기·지우기 — 카트 칸과 짜 둔 일정의 같은 장소(pool)를 같이 · 「다시 검사」 표시 (머무는 시간 칸과 같은 길)
function fxSet(it,v){ if(v==null) delete it.fx; else it.fx=v; var pl=TR.plan, p=pl&&pl.pool&&pl.pool[it.k]; if(p){ if(v==null) delete p.fx; else p.fx=v; pl.chk=2; } save(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trBox .trfxb,#trBox .trfxx,#trBox .trfxok,#trBox .trfxno"); if(!a) return; e.preventDefault(); var k=a.dataset.k, w=a.closest(".trfxw"), it=TR.items.filter(function(x){ return x.k===k; })[0]; if(!w||!it) return;
  if(a.classList.contains("trfxb")){ w.innerHTML='<span class="trfxe"><input type="time" class="trfxi" value="'+esc(fxGuess(it))+'"><button type="button" class="trfxok" data-k="'+esc(k)+'">'+esc(T5(FX6.set))+'</button><button type="button" class="trfxno" data-k="'+esc(k)+'" aria-label="'+esc(T5(LV6.x))+'">✕</button></span>';
    return; }   // 시각 칸은 tpick.js 가 24시간 「시 : 분」 고르기로 바꾼다(원래 input 값은 그대로)
  if(a.classList.contains("trfxok")){ var v=hm2m((w.querySelector(".trfxi")||{}).value); if(v==null) return; fxSet(it,v); try{ ntap("_trip","trip_fix"); }catch(z){} }
  else if(a.classList.contains("trfxx")) fxSet(it,null);
  w.innerHTML=fxCart(it); });
var ADDRQ="";   // 숙소 찾기 — 마지막 검색어 (언어를 바꿔 창을 다시 그릴 때 결과도 다시, 10-18)
function addrPaint(){ var out=document.getElementById("trAddrR"); if(!out||!ADDRQ) return; var q0=document.getElementById("trAddrQ"); if(q0&&!q0.value) q0.value=ADDRQ;
  if(window.KL&&ADDR.length) KL.ensure(ADDR,"item",ADDRQ,function(){ if(document.getElementById("trBox")) addrPaint(); });
    out.innerHTML=ADDR.length?ADDR.map(function(x,i){ return '<div class="tra" data-i="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join(""):'<div class="d">'+T("찾은 곳이 없어요","No results")+'</div>';
    [].forEach.call(out.querySelectorAll(".tra"),function(e){ e.onclick=function(){ var x=ADDR[+e.dataset.i]; var h={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,addr:x.addr||""}; if(!natAssignHotel(h)) TR.opt.hotel=h; save(); ADDRQ=""; ADDR=[]; panelPaint(); }; }); }   // 도시가 여럿이면 가까운 도시 숙소로 (11-06)
// 숙소 이름·주소로 찾기 — 카카오 「숙박」 분류가 하나라도 있으면 그것만(「웨스틴조선」을 찾으면 호텔 안 식당까지 나왔다, 11-07 사장님 「먹통이다 자유롭게 숙소를 찾게」) · 없으면(주소로 찾은 경우 등) 그대로
function lodgeOnly(a){ var h=(a||[]).filter(function(x){ return /숙박/.test(x.cat||""); }); return h.length?h:(a||[]); }
function addrSearch(){ var q=document.getElementById("trAddrQ").value.trim(), out=document.getElementById("trAddrR"); if(!q) return; out.innerHTML='<div class="d">'+T("찾는 중…","Searching…")+'</div>'; var lg=LANG;
  fetch(HUB+"/kplace?q="+encodeURIComponent(q)+kpL()).then(function(r){ return r.json(); }).then(function(j){ ADDR=lodgeOnly((j&&j.ok&&j.items)||[]).slice(0,8); ADDR.forEach(function(x){ x._l=lg; }); ADDRQ=q; addrPaint(); })
    .catch(function(){ out.innerHTML='<div class="d">'+T("잠시 뒤 다시 해 주세요","Please try again")+'</div>'; }); }
function dragInit(ol){ if(!ol) return; var cur=null;
  ol.addEventListener("pointerdown",function(e){ var h=e.target.closest(".trh"); if(!h) return; e.preventDefault(); cur=h.closest(".tri"); cur.classList.add("drag"); try{ h.setPointerCapture(e.pointerId); }catch(x){} });
  ol.addEventListener("pointermove",function(e){ if(!cur) return; e.preventDefault(); var els=[].slice.call(ol.children);
    for(var i=0;i<els.length;i++){ var el=els[i]; if(el===cur) continue; var r=el.getBoundingClientRect(); if(e.clientY>r.top&&e.clientY<r.bottom){ if(e.clientY<r.top+r.height/2) ol.insertBefore(cur,el); else ol.insertBefore(cur,el.nextSibling); break; } } });
  var end=function(){ if(!cur) return; cur.classList.remove("drag"); cur=null; var ord=[].map.call(ol.children,function(e){ return e.dataset.k; });
    HLK=null; TR.items.sort(function(a,b){ return ord.indexOf(a.k)-ord.indexOf(b.k); }); TR.plan=null; save(); refresh(); panelPaint(); };
  ol.addEventListener("pointerup",end); ol.addEventListener("pointercancel",end); }

// ── 일정 계산 ──
function walkKm(){ return [1,2,3][TR.opt.walk]||2; }
// 옛 알고리즘으로 돌리는 스위치(비교·시험용) — window.__TRIP_OLD 또는 localStorage mpv_oldalgo=1
var OLDC={t:0,v:false};   // localStorage 는 1초에 한 번만 읽는다 (11-06 — 90일 일정 계산에서 leg 마다 읽어 느렸다)
function OLD(){ if(window.__TRIP_OLD) return true; var n=Date.now(); if(n-OLDC.t>1000||n<OLDC.t){ OLDC.t=n; try{ OLDC.v=localStorage.getItem("mpv_oldalgo")==="1"; }catch(e){ OLDC.v=false; } } return OLDC.v; }
// 한 번의 계산 안에서만 쓰는 구간 기억 (11-06 — 일수 90일·장소 300곳) — 계산 도중엔 실제 시간(RT·DR)·걷기 조건이 안 바뀌니 같은 두 점이면 같은 답
//   LC 가 있을 때만(withLC 안) · 끝나면 버린다 — 결과는 기억 없을 때와 똑같다
var LC=null;
function withLC(f){ if(LC) return f(); LC={g:new WeakMap(),k:new WeakMap(),r:new WeakMap(),n:new WeakMap()}; try{ return f(); }finally{ LC=null; } }
function lcGet(M,a,b,fn){ var m=M.get(a); if(!m){ m=new Map(); M.set(a,m); } var v=m.get(b); if(v===undefined){ v=fn(a,b); m.set(b,v); } return v; }
// ── 실제 대중교통 시간 캐시 (사장님 10-24) — 구간(반올림 좌표 한 쌍, 방향 무관)별 분. 이 화면 메모리 + sessionStorage. 좌표만 저장(위치 아님)
var RT={};
function rkPt(p){ return (+p.lat).toFixed(4)+","+(+p.lng).toFixed(4); }
function rtKey(a,b){ return LC?lcGet(LC.r,a,b,rtKey0):rtKey0(a,b); }
function rtKey0(a,b){ var x=rkPt(a), y=rkPt(b); return (x<y?x+"|"+y:y+"|"+x)+"|t"; }
function leg(a,b){ return (LC&&a&&b)?lcGet(LC.g,a,b,leg0):leg0(a,b); }
function kmC(a,b){ return LC?lcGet(LC.k,a,b,km):km(a,b); }
function leg0(a,b){ var d=km(a,b), w=walkKm();
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
  while(left.length){ var bi=0, bd=1e9; left.forEach(function(x,i){ var d=kmC(p,x); if(d<bd){ bd=d; bi=i; } }); p=left[bi]; out.push(p); left.splice(bi,1); } return out; }
function twoOpt(H,arr){ var a=arr.slice(), imp=true, it=0;
  while(imp&&it++<50){ imp=false; for(var i=0;i<a.length-1;i++) for(var j=i+1;j<a.length;j++){ var b=a.slice(0,i).concat(a.slice(i,j+1).reverse(),a.slice(j+1)); if(tourCost(H,b)+0.01<tourCost(H,a)){ a=b; imp=true; } } } return a; }
function dayLoad(H,arr){ return arr.reduce(function(s,x){ return s+x.stay; },0)+tourCost(H,nnOrder(H,arr))+(arr.length?60:0); }
// dayLoad 와 똑같은 값을 빠르게 (11-06 — 담는 곳 300곳·여행 일수 90일) — 날짜 나누기(splitDays·improve)가 같은 장소 묶음을 수만 번 재서 느렸다
//   장소마다 번호를 매겨 거리(km)·이동 분(legMin)을 표에 한 번만 재 두고, nnOrder·tourCost 와 같은 차례·같은 덧셈 순서로 계산한다(결과가 dayLoad 와 똑같다)
function mkLoad(H,P){ var S=hS(H), E=hE(H), n=P.length, id=new Map(), i;
  for(i=0;i<n;i++) if(!id.has(P[i])) id.set(P[i],i);
  var K=new Float64Array(n*n).fill(-1), M=new Float64Array(n*n).fill(-1), KS=new Float64Array(n).fill(-1), MS=new Float64Array(n).fill(-1), ME=new Float64Array(n).fill(-1);
  var kk=function(a,b){ var q=a*n+b, v=K[q]; if(v<0){ v=km(P[a],P[b]); K[q]=v; } return v; }, mm=function(a,b){ var q=a*n+b, v=M[q]; if(v<0){ v=legMin(P[a],P[b]); M[q]=v; } return v; };
  var ks=function(b){ var v=KS[b]; if(v<0){ v=km(S,P[b]); KS[b]=v; } return v; }, ms=function(b){ var v=MS[b]; if(v<0){ v=legMin(S,P[b]); MS[b]=v; } return v; }, me=function(a){ var v=ME[a]; if(v<0){ v=legMin(P[a],E); ME[a]=v; } return v; };
  return function(arr){ var m=arr.length, st=0, ix=new Array(m), j, q;
    for(j=0;j<m;j++){ q=id.get(arr[j]); if(q===undefined) return dayLoad(H,arr); ix[j]=q; }
    for(j=0;j<m;j++) st=st+arr[j].stay;
    if(!m) return dayLoad(H,arr);
    var left=ix, out=[], p=-1, bi, bd, d;
    if(!S){ var w=0; for(j=1;j<left.length;j++) if(P[left[j]].lng<P[left[w]].lng) w=j; p=left[w]; out.push(p); left.splice(w,1); }
    while(left.length){ bi=0; bd=1e9; for(j=0;j<left.length;j++){ d=p<0?ks(left[j]):kk(p,left[j]); if(d<bd){ bd=d; bi=j; } } p=left[bi]; out.push(p); left.splice(bi,1); }
    var c=0, pv=-1; for(j=0;j<out.length;j++){ var x=out[j]; c+=pv<0?(S?ms(x):mm(x,x)):mm(pv,x); pv=x; } if(E) c+=me(pv);
    return st+c+(m?60:0); }; }
// 11-07 손님 순서 그대로 날짜만 나누기 — 이어진 덩어리로만 자른다(순서는 안 바꾼다). 비용 = 이동 + 하루 시간 넘침 ×20 + 날마다 머문 시간 고르기 (옛 splitDaysAngular DP 와 같은 식, 손님 줄 하나 그대로)
//   caps = 하루 길이(분) 하나 또는 날마다 배열(전국 일정 — 이동·공항으로 짧아진 날) · 장소가 날짜보다 적으면 빈 날은 뒤로 · 300곳 × 90일도 0.1초 안(D·n²/2 번)
function seqLoad(H,arr){ if(!arr.length) return 0; var S=hS(H), E=hE(H), c=0, p=S||arr[0]; arr.forEach(function(x){ c+=legMin(p,x); p=x; }); if(E) c+=legMin(p,E); return arr.reduce(function(q,x){ return q+x.stay; },0)+c+60; }
// 11-08 사장님 「끝나는 시각은 참고만 — 관광은 원래 약간 무리한 일정」 「가」 — 하루를 꽉 채우고 필요한 날만 쓴다, 남는 날은 맨 뒤 「자유 일정」
//   하루를 쓰는 값 PK_DAY · 끝나는 시각을 PK_SL 분까지 넘는 것은 가볍게(분당 0.5) · 그보다 더 넘으면 무겁게(분당 20 — 그때는 다음 날로) · 예전 「날짜를 다 쓰게 고르게 펴기」 벌점은 뺐다
var PK_DAY=200, PK_SL=60;
function seqSplit(H,P,D,caps){ var n=P.length, out=[], i, j, d; if(D<=1){ out.push(P.slice()); return out; } if(!n){ for(d=0;d<D;d++) out.push([]); return out; }
  var S=hS(H), E=hE(H), st=[0], L=[0], hs=[], he=[];
  for(i=0;i<n;i++){ st.push(st[i]+P[i].stay); hs.push(S?legMin(S,P[i]):0); he.push(E?legMin(P[i],E):0); if(i) L.push(L[i-1]+legMin(P[i-1],P[i])); }
  var cp=function(q){ return Array.isArray(caps)?(caps[q]!=null?caps[q]:caps[caps.length-1]):caps; }, avg=st[n]/D;
  // 11-08 꽉 채우면 뒤쪽 장소가 문 닫은 뒤에 닿을 수 있다 — 묶음마다 시작 시각부터 차례로 걸어 보아 마감 어림(dayOnly: 궁·박물관 18시·산 17시…) 30분 전보다 늦게 닿는 곳 수 V[a][b] · 점심 1시간은 12시를 지나면 더한다
  //   마감 = 검사 창과 같은 정보(공식 입장 마감·구글 영업시간·종류별 어림 — 여행 첫날 기준) · 문 닫기 전 min(머무는 시간, 60분)은 남아야 · 점심(12시)·저녁(17시 반) 1시간씩 더해 걸어 본다
  var F0=hm2m(TR.opt.from)||570, V=[], VW=400, dt0=new Date((TR.opt.start||kstToday(1))+"T00:00:00Z"), CL=[];
  for(j=0;j<n;j++){ var cx=P[j], cv=0; if(!isNight(cx)&&!cx.eat){ var co=closeOf(cx,dt0,F0), f0=FACT[cx.k]; cv=(co.c!=null&&!co.eve)?co.c:((!co.eve&&!(f0&&f0.last))?dayOnly(cx):0); } CL.push(cv||0); }
  for(i=0;i<n;i++){ var vt=F0+hs[i], vc=0, vl=false, vd=false, vr=new Int16Array(n+1); for(j=i;j<n;j++){ if(!vl&&vt>=720){ vt+=60; vl=true; } if(!vd&&vt>=1050){ vt+=60; vd=true; } if(CL[j]&&vt+Math.min(P[j].stay,60)>CL[j]) vc++; vr[j+1]=vc; vt+=P[j].stay+(j+1<n?L[j+1]-L[j]:0); } V.push(vr); }
  var cost=function(q,a,b){ if(a===b) return (D-q)*0.001; var sm=st[b]-st[a], tv=hs[a]+(L[b-1]-L[a])+he[b-1], ld=sm+tv+60, ov=ld-cp(q); return tv+PK_DAY+(ov<=0?0:ov<=PK_SL?ov*0.5:PK_SL*0.5+(ov-PK_SL)*20)+V[a][b]*VW; };   // 빈 날은 뒤로 (11-08)
  var INF=1e18, f=[], bk=[]; for(d=0;d<=D;d++){ f.push(new Float64Array(n+1).fill(INF)); bk.push(new Int32Array(n+1).fill(-1)); } f[0][0]=0;
  for(d=1;d<=D;d++) for(j=0;j<=n;j++){ var best=INF, bi=-1; for(i=0;i<=j;i++){ var v=f[d-1][i]; if(v>=INF) continue; v+=cost(d-1,i,j); if(v<best){ best=v; bi=i; } } f[d][j]=best; bk[d][j]=bi; }
  var gs=[], jj=n; for(d=D;d>=1;d--){ var ii=bk[d][jj]; if(ii<0) ii=jj; gs.unshift(P.slice(ii,jj)); jj=ii; } return gs; }
// 가까운 곳끼리 같은 날로 (사장님 10-24) — 좌표 k-means(체류시간 가중·여러 번 시작해 가장 싼 것) → 숙소 왕복 포함 비용으로 고른 뒤 improve 로 다듬기
//   · 각도로만 나누면 (옛 방식) 같은 방향이면 멀어도 묶여버린다. 좌표로 묶으면 가까운 곳이 한 날로 모인다
//   · 고정 씨앗 + 여러 번 시작 → 같은 입력이면 같은 결과. 하루 cap 초과·시간 균형은 improve(이동/옮기기)에 맡긴다
function splitDays(H,P,D,cap){ if(OLD()) return splitDaysAngular(H,P,D,cap);
  var n=P.length; if(!n) return []; var tot=P.reduce(function(s,x){ return s+x.stay; },0), avg=tot/D;
  if(n<=D){ var g0=[]; for(var gi=0;gi<D;gi++) g0.push(gi<n?[P[gi]]:[]); return g0; }
  var mlat=P.reduce(function(s,x){ return s+x.lat; },0)/n, kx=Math.cos(mlat*Math.PI/180);   // 등거리 투영 — 경도는 위도만큼 줄여 거리 왜곡 없이
  var px=P.map(function(x){ return [x.lat,x.lng*kx]; }), dist2=function(a,b){ var dy=a[0]-b[0], dx=a[1]-b[1]; return dy*dy+dx*dx; };
  var DL=mkLoad(H,P), cst=function(g){ if(!g.length) return 500; var ld=DL(g), st=g.reduce(function(q,x){ return q+x.stay; },0); return (ld-st)+Math.max(0,ld-cap)*20+0.01*(st-avg)*(st-avg); };   // improve 와 같은 식(이동+시간초과+균형) · DL = dayLoad 와 같은 값 (11-06)
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
  var over=best.some(function(g){ return DL(g)>cap; });
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
function improve(H,gs,cap,avg){ var DL=mkLoad(H,[].concat.apply([],gs)), cst=function(g){ if(!g.length) return 500; var ld=DL(g), st=g.reduce(function(q,x){ return q+x.stay; },0); return (ld-st)+Math.max(0,ld-cap)*20+0.01*(st-avg)*(st-avg); };   // DL = dayLoad 와 같은 값 (11-06)
  var cs=gs.map(cst), ok=true, it=0, lA=null, lI=-1, A=null, ca=0;   // 「한 곳 빼기」 쪽(A·ca)은 그 날 묶음·그 자리가 그대로면 다시 안 잰다 (11-06 — 결과는 같다)
  while(ok&&it++<30){ ok=false;
    for(var a=0;a<gs.length;a++) for(var i=0;i<gs[a].length;i++) for(var b=0;b<gs.length;b++){ if(a===b) continue; var x=gs[a][i];
      if(lA!==gs[a]||lI!==i){ A=gs[a].slice(0,i).concat(gs[a].slice(i+1)); ca=cst(A); lA=gs[a]; lI=i; }
      var B=gs[b].concat([x]), cb=cst(B);
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
var ML={lunch:{lo:720,hi:780,la:720,ha:840,hl:840,c:750},dinner:{lo:1080,hi:1200,la:1080,ha:1260,hl:1260,c:1140}};   // 11-08 사장님 「점심은 항상 12-2시 사이 · 저녁은 6시 이후 9시 사이 · 일정 때문에 못 먹으면 건너뛴다 · 강요하지 않는다」 — 시작 시각 점심 12:00~14:00 · 저녁 18:00~21:00 (그 안에 자리가 없으면 그 끼니 없음)   // hl = 오늘 실제 기록으로 다시 계산할 때 그 식사를 빼는 시각(지금처럼 점심 14:30·저녁 21:00)
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
  // 숙소에서 쉬기 (11-07 사장님) — mo.rs=[{k:다음 장소,m:그 앞 식사 칸 끼니(없으면 ""),p:숙소 점}] · 그 자리에서 숙소로 가서 쉬고, 다음 일정을 기다리던 시간만큼 숙소에서 쉬다 나선다(기다림 → 쉬기, 빈 시간으로 안 셈) · 오늘 실제 기록 날은 안 함
  var RS=(!lv&&mo&&mo.rs&&mo.rs.length)?mo.rs:null, rsd={}, RST=null;
  var rest=function(j,K){ if(!RS||j>=n||!p) return; var x=arr[j], q=null; RS.forEach(function(z){ if(!q&&z.p&&z.k===x.k&&!rsd[z.k]&&(K==null||(z.m||"")===K)) q=z; }); if(!q) return; rsd[q.k]=1;
    var lg=km(p,q.p)>0.05?legT(p,q.p,t,lv):null; if(lg){ t+=lg.min; tv+=lg.min; } RST={rest:1,t:t,e:t,p:q.p,leg:lg,k:q.k}; rows.push(RST); p=q.p; pre=null; };
  var meals=function(j){ gt[j]=t; (MP[j]||[]).forEach(function(K){ rest(j,K); var t0=t, nx=j<n?arr[j]:null, r=(mo&&mo[K])||null, end=j>=n, past=!!lv&&j<=lv.i;
      // 어디서 먹나 — next = 다음 장소 근처로 먼저 가서 먹고 들어감(첫 장소 앞·밤 장소 앞 저녁·문 열기를 기다릴 곳 앞) · prev = 앞 장소 근처에서 먹고 이동
      var here=!!nx&&pre===nx, at="prev"; if(nx&&(here||j===0||(K==="dinner"&&isNight(nx))||openAt(nx,date,t+(p?legMin(p,nx):0))!=null)) at="next";
      var lg=null, mv=null, ready=t, la=0;
      if(r){ lg=p?legT(p,r,t,lv):null; ready=t+(lg?lg.min:0); la=nx?legMin(r,nx):0; }   // 고른 식당이 있으면 그리로 가서 먹고, 다음 장소는 식당에서 출발
      else if(at==="next"){ if(!here){ mv=p?legT(p,nx,t,lv):null; ready=t+(mv?mv.min:0); } }
      else if(nx) la=p?legMin(p,nx):0;
      var o=nx?openAt(nx,date,ready+la):null; if(j===0&&!lv&&o==null&&ready<ML[K].la) return;   // 첫 장소 앞 식사는 그 장소가 아직 안 열었거나(밤 장소 앞 저녁) 식사 시각에 첫 장소에 닿을 때만 — 나오자마자 점심 X
      var m=past?ready:mealAt(K,ready,la,o,end,to,!!lv); if(m==null) return;
      var wt=Math.max(0,m-ready); if(RST){ RST.e=RST.t+wt; RST=null; wt=0; ready=m; }   // 숙소에서 쉬다 나서면 기다림이 없다
      if(rows.length) idle+=wt; if(lg) tv+=lg.min; if(mv) tv+=mv.min; t=m+((r&&r.stay>=30)?r.stay:60);   // 고른 식당 머무는 시간 (11-08 — 일정표에서 고침, 기본 1시간)
      rows.push({meal:K,lunch:1,t:m,anchor:(at==="next"||j===0)?nx:arr[j-1],next:nx,r:r,leg:lg||mv,to:(!r&&at==="next"&&!here&&nx)?nx.k:null,t0:t0,rd:ready});   // t0 = 앞 일정에서 나서는 시각 · rd = 먹을 수 있는 때 (빈 시간 = t − rd, 11-07)
      if(r){ p=r; pre=null; } else if(at==="next"&&!here){ p=nx; pre=nx; } }); };   // 다음 장소 근처로 먼저 갔으면 거기서 들어간다(이동 한 번)
  arr.forEach(function(x,i){ meals(i); rest(i); var lg=pre===x?null:(p?legT(p,x,t,lv):null); pre=null; if(lg){ t+=lg.min; tv+=lg.min; } var ar0=t, f=FACT[x.k], dw=date.getUTCDay(), note=[], st=x.stay, act=0, R=lv&&lv.rec[x.k], w0=wait;   // ar0 = 문 열기·행사를 기다리기 전 닿는 시각 (11-07 검사용)
    if(lv&&i<=lv.i){ if(R&&R.a!=null) t=R.a;   // 실제로 다녀온 곳·지금 있는 곳 — 확인 없이 기록 그대로
      if(i<lv.i){ if(R&&R.a!=null&&R.d!=null) st=Math.max(1,R.d-R.a); act=R&&(R.a!=null||R.d!=null)?2:0; }
      else if(R&&R.d!=null){ if(R.a==null&&R.d-t<10) t=R.d-x.stay; st=Math.max(1,R.d-t); act=2; }
      else { st=Math.max(Math.round(x.stay*lv.r),lv.now-t+1); if(R&&R.u!=null) st=Math.max(st,R.u-t); act=1; } }   // R.u = 「더 있을게요」로 정한 떠날 시각 (11-06)
    else {
      if(lv){ if(t<lv.now) t=lv.now; st=Math.max(5,Math.round(x.stay*lv.r)); }
      if(x.eat&&ML[x.meal]&&t<ML[x.meal].lo){ wait+=ML[x.meal].lo-t; t=ML[x.meal].lo; }   // 손님이 넣은 점심·저녁 식당 — 점심 11:30·저녁 17:30 전에 닿으면 그 시각에 먹는다 (11-07)
      var fx=fxOf(x); if(fx!=null){ if(t<fx){ wait+=fx-t; t=fx; } note.push({o:FX6.nt,v:{t:m2hm(fx)}}); }   // 손님이 정한 시작 시각 (11-07) — 일찍 닿으면 그 시각까지 기다린다 · 늦게 닿으면 검사 창(fix)
      if(f&&f.ev&&f.evd.indexOf(dw)>=0){ var ev=null; f.ev.forEach(function(e){ if(ev==null&&t<=e-10+5) ev=e; }); if(ev!=null&&ev-10>t&&ev-10-t<=90){ wait+=ev-10-t; t=ev-10; } if(ev!=null) note.push([f.evn[0]+" "+m2hm(ev),f.evn[1]+" "+m2hm(ev)]); else miss++; }
      var wn=PERFK[x.k]?null:winOf(x,date);   // 영업시간 (11-06) — 문 열기 전이면 기다렸다 들어가고, 마감 뒤면 표시
      if(wn){ if(wn.off){ viol++; note.push({o:LV6.off}); }
        else { var wq=null, lc=null; for(var wi=0;wi<wn.w.length;wi++){ if(t<wn.w[wi][1]){ wq=wn.w[wi]; break; } lc=wn.w[wi][1]; }
          if(!wq){ viol++; note.push({o:LV6.shut,v:{t:m2hm(lc||0)}}); } else { if(t<wq[0]){ wait+=wq[0]-t; t=wq[0]; note.push({o:LV6.open,v:{t:m2hm(wq[0])}}); } if(t+st>wq[1]) cut+=t+st-wq[1]; } }   // cut = 마감에 걸려 덜 머무는 분
        if(wn.eve) note.push({o:LV6.eve}); }
      var li=PERFK[x.k]?null:lastIn(f,date); if(li!=null&&t>li){ viol++; note.push(["입장 마감 "+m2hm(li)+" 지남","Last entry "+m2hm(li)+" passed"]); } }
    if(rows.length){ var ww=wait-w0; if(RST){ RST.e=RST.t+ww; RST=null; ar0=t; ww=0; } idle+=ww; if(!isNight(x)) wd+=ww; }   // 숙소에서 쉬다 나서면 문 열기·도착 시각을 안 기다린다
    rows.push({x:x,leg:lg,t:t,ar:ar0,note:note,st:st,act:act,ext:act===1?1:0}); t+=st; p=x; });
  meals(n);
  var HE=hE(H), back=(HE&&n)?legT(p,HE,t,lv):null; if(back){ t+=back.min; tv+=back.min; }
  return {rows:rows,back:back,end:t,viol:viol,wait:wait,miss:miss,idle:idle,cut:cut,tv:tv,wd:wd,gt:gt}; }
function addM(MP,j,K){ var o={}; for(var q in MP) o[q]=MP[q].slice(); (o[j]=o[j]||[]).push(K); return o; }
// mo={to,lunch,dinner}(고른 식당) — 없으면 하루 끝 = 지금 조건
function sched(H,arr,date,from,mo,lv){ var to=(mo&&mo.to)||TO0();
  if(lv&&lv.ml){ var LM={}; for(var li in lv.ml) LM[+li+1]=lv.ml[li].slice(); return simDay(H,arr,date,from,mo,LM,lv,to); }   // 오늘 실제 기록 — 식사는 계획과 같은 자리
  var mb={to:to,rs:mo&&mo.rs}, MP={}, cur=simDay(H,arr,date,from,mb,MP,null,to), n=arr.length; if(!n) return simDay(H,arr,date,from,mo,MP,null,to);   // 자리는 고른 식당 없이 정한다 — 식당을 골라도 식사 자리가 안 바뀌게
  var jn=-1; for(var i=0;i<n;i++) if(isNight(arr[i])){ jn=i; break; }
  var lg=-1;
  ["lunch","dinner"].forEach(function(K){ var best=null; if(mo&&mo.skip&&mo.skip[K]) return; if(arr.some(function(x){ return x&&x.eat&&x.meal===K; })) return;   // 손님이 그 끼니 식당을 직접 넣은 날 (11-07)
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
function compute(H,Dn){ return withLC(function(){ return compute0(H,Dn); }); }   // 구간 기억 안에서 (11-06)
function compute0(H,Dn){ if(!OLD()){ var nat=null; try{ nat=natPlan(H,Dn); }catch(e){ try{ console.error(e); }catch(x){} nat=null; } if(nat) return nat; }   // 도시가 둘 이상이거나 공항을 넣었으면 전국 일정 (11-06)
  var o=TR.opt, D=Dn||o.n, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), skip=[];
  var P=TR.items.filter(function(it){ var c=catOf(it); if(c==="hotel"||c==="trans"){ skip.push(it); return false; } return true; }).map(function(it){ return Object.assign({},it,{stay:stayOf(it)}); });
  var PE=OLD()?[]:P.filter(function(x){ return x.eat; }); if(PE.length) P=P.filter(function(x){ return !x.eat; });   // 11-08 식당은 관광지와 섞지 않는다 (eatAssign)
  if(!OLD()){   // 11-07 사장님 — 순서는 손님이 ☰ 로 놓은 그대로, 날짜만 나눈다(쉬는 날·시간대가 안 맞으면 검사 창으로 알린다 — 옮기지 않는다)
    var MD=P.filter(function(x){ return udOf(x); }); if(MD.length) P=P.filter(function(x){ return !udOf(x); });   // 11-08 일 단위로 머무는 곳 — 따로 통째로 (mdPlace)
    var D2=MD.length?Math.max(P.length?1:0,D-MD.reduce(function(a,x){ return a+udOf(x); },0)):D;
    var dts=[]; for(var q0=0;q0<D2;q0++) dts.push(dayDate(q0));
    var sq=D2?seqSplit(H,P,D2,cap):[], pool0={}; P.forEach(function(x){ pool0[x.k]=x; });
    var pl0={v:1,at:Date.now(),from:from,to:to,hotel:o.hotel&&o.hotel.type!=="here"?o.hotel:(o.hotel?{type:"here"}:null),
      days:sq.map(function(g,di){ return {date:dts[di].toISOString().slice(0,10),stops:g.map(function(x){ return x.k; })}; }),pool:pool0,skip:skip.map(function(x){ return x.k; }),ai:null,ord:1};
    mdPlace(pl0,MD);   // 11-08
    fxFix(pl0,H);   // 11-07 정한 시작 시각에 못 닿는 곳 → 다른 날로
    pl0.days.forEach(function(d,di){ if(d.md) return; d.end=sched(H,d.stops.map(function(k){ return pool0[k]; }),new Date(d.date+"T00:00:00Z"),d.fr!=null?d.fr:from,{to:to}).end; });   // d.fr = 이른 도착 시각에 맞춰 당긴 출발 (11-07)
    eatAssign(pl0,H,PE); return pl0; }
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
// 11-08 사장님 「식당은 식당으로 구분하고 관광지로 구분하지 않게」 — 다시 짤 때 카트의 식당(「식당 찾기」로 넣은 것, eat)은 날짜 나누기에서 빼고:
//   그 식당과 가까운 관광지가 있는 날(40km 안, 가까운 날부터)의 원래 끼니(점심·저녁) 자리에 고른 식당으로 넣는다(pl.meals — 그 끼니 「후보 3곳」 칸은 안 생김, 이름표는 그 자리 시각)
//   그날 그 끼니 자리가 없으면(일찍 끝나는 날 등) 다음으로 가까운 날 · 같은 식당이 두 번이거나 그날 그 끼니에 이미 식당이 있으면 남는 하나는 삭제(pl.drop — 짠 뒤 카트에서도 뺌, 사장님 「남는 한개의 식당은 삭제한다」)
//   맞는 자리가 어느 날에도 없으면 pl.emiss(일정엔 없고 카트엔 그대로) · 화면에 알림은 planGo
function eatAssign(pl,H,PE){ if(!pl||!PE||!PE.length) return; pl.meals=pl.meals||{}; var drop=[], miss=[], seen=[], SL={};
  var slot=function(di,K){ var key=di+":"+K; if(SL[key]==null){ var X=dayX(pl,di,H); SL[key]=X.arr.length?sched(X.H,X.arr,X.dt,X.from,{to:X.to}).rows.some(function(r){ return r.meal===K; }):false; } return SL[key]; };
  PE.forEach(function(r){ if(!isFinite(+r.lat)||!isFinite(+r.lng)){ miss.push(r.k); return; }
    if(seen.some(function(q){ return String(q.ko||"")===String(r.ko||"")&&km(q,r)<0.05; })){ drop.push(r.k); return; } seen.push(r);
    var K=r.meal==="dinner"?"dinner":"lunch", cd=[];
    pl.days.forEach(function(d,di){ if(d.md) return; var a=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean); if(!a.length) return; var dk=1e9; a.forEach(function(x){ dk=Math.min(dk,km(x,r)); }); if(dk<=40) cd.push({di:di,dk:dk}); });
    cd.sort(function(a,b){ return a.dk-b.dk; });
    for(var i=0;i<cd.length;i++){ var di=cd[i].di, mk=di+":"+K; if(!slot(di,K)) continue; if(pl.meals[mk]){ drop.push(r.k); return; }
      var m=Object.assign({},r,{k:"rs_"+mk.replace(":","_"),stay:60,ck:r.k}); delete m.eat; delete m.meal; delete m.um; delete m.fx; pl.meals[mk]=m; return; }
    miss.push(r.k); });
  if(drop.length) pl.drop=drop; if(miss.length) pl.emiss=miss; }
var EA6={drop:{ko:"겹치는 식당 {n}곳을 카트에서 뺐어요: {p}",en:"Removed {n} duplicate restaurant(s) from your cart: {p}",ja:"重複する飲食店{n}件をカートから外しました：{p}",zhs:"已从购物车移除{n}家重复的餐厅：{p}",zht:"已從購物車移除{n}家重複的餐廳：{p}",es:"Quitamos {n} restaurante(s) repetido(s) del carrito: {p}"},
 miss:{ko:"식사 자리가 없어 일정에 못 넣은 식당: {p} (카트에는 그대로 있어요)",en:"No lunch or dinner slot for: {p} (still in your cart)",ja:"食事の時間帯がなく日程に入れられなかった飲食店：{p}（カートには残っています）",zhs:"没有用餐时段，未能排入行程的餐厅：{p}（仍在购物车中）",zht:"沒有用餐時段，未能排入行程的餐廳：{p}（仍在購物車中）",es:"Sin hueco de comida o cena para: {p} (sigue en tu carrito)"}};
// 11-08 일 단위로 머무는 날 — 첫날: 숙소 출발 → 그곳 도착 · 「2박 3일 · 11/15까지」(3일 이상만 끝나는 날) · 「○○에서 묵어요」 / 가운데 날: 종일 / 마지막 날: 마치고 숙소로 → 숙소 도착 · 「일정 추가」 칸·끌어 옮기기는 없음(중간 일정 안 짬)
function mdHtml(pl,d,di,Q){ var md=d.md, x=pl.pool[md.k], N=md.n, i=md.i, X=Q?Q.X:dayX(pl,di,REPH||pl.H||null), dt=new Date(d.date+"T00:00:00Z"), cty=pl.mc&&pl.cities&&pl.cities[d.c]?cnm(pl.cities[d.c]):"";
  var h='<div class="tday tmdd" data-d="'+di+'"><div class="tdh"><span>'+T((di+1)+"일차",'Day '+(di+1))+'</span> · '+esc(dateTxt(dt))+(cty?'<b class="tcty">'+esc(cty)+'</b>':'')+(x?'<em class="tsum">'+esc(nm(x))+' · '+esc(gTxt(UD6.nth,{i:i+1,n:N}))+'</em>':'')+'</div>';
  if(!x) return h+'</div>';
  var Hs=hS(X.H), He=hE(X.H), lst=pl.days[di-i+N-1], et=(N>=3&&lst)?' · '+gTxt(UD6.end,{d:dateTxt(new Date(lst.date+"T00:00:00Z"))}):"";
  var card=function(t,sub){ return '<div class="trw tmd"><span class="tt">'+(t!=null?m2hm(t):"")+'</span><span class="tp"><b class="tpn">'+esc(nm(x))+'</b> <i>'+esc(sub)+'</i></span></div>'; };
  var lg=function(a,b,ak,bk){ var q=a&&b?leg(a,b):null; return q?'<div class="tlg" data-a="'+esc(ak)+'" data-b="'+esc(bk)+'" data-d="'+di+'">'+legTxt(q)+'<div class="tods"></div></div>':''; };
  h+='<div class="trows">';
  if(i===0){ var l0=Hs?leg(Hs,x):null; if(Hs) h+=rowH(X.from,"mi_stay",esc(gTxt(NX6.st0,{h:ptNm(Hs)}))); h+=lg(Hs,x,"__hotel",x.k)+card(X.from+(l0?l0.min:0),udNb(N)+et);
    if(N>=2) h+=rowH(null,"mi_moon",esc(gTxt(UD6.sleep,{p:nm(x)}))); else h+=lg(x,He,x.k,"__hotel")+rowH(null,"mi_stay",esc(T("숙소 도착","Back to lodging"))); }
  else if(i<N-1) h+=card(null,T5(UD6.all))+rowH(null,"mi_moon",esc(gTxt(UD6.sleep,{p:nm(x)})));
  else h+=card(null,T5(UD6.out))+lg(x,He,x.k,"__hotel")+rowH(null,"mi_stay",esc(T("숙소 도착","Back to lodging")));
  return h+'</div></div>'; }
// 11-08 관광지만 남기고 다시 짜기 — 카트의 식당(「식당 찾기」로 넣은 것)을 빼고 「일정 짜기」와 같은 길 · 식당이 있으면 한 번 묻는다
var PS6={b:{ko:"관광지만 남기고 다시 짜기",en:"Re-plan with sights only",ja:"観光地だけ残して組み直す",zhs:"只保留景点并重新安排",zht:"只保留景點並重新安排",es:"Replanificar solo con lugares turísticos"},
 q:{ko:"카트에서 식당 {n}곳을 빼고, 관광지 {m}곳으로 일정을 다시 짤까요?",en:"Remove {n} restaurant(s) from your cart and re-plan with {m} sights?",ja:"カートから飲食店{n}件を外し、観光地{m}か所で日程を組み直しますか？",zhs:"要从购物车移除{n}家餐厅，并用{m}个景点重新安排行程吗？",zht:"要從購物車移除{n}家餐廳，並用{m}個景點重新安排行程嗎？",es:"¿Quitar {n} restaurante(s) del carrito y replanificar con {m} lugares?"}};
function planSights(){ var ne=TR.items.filter(function(x){ return x.eat; }).length, m=TR.items.filter(function(x){ var c=catOf(x); return !x.eat&&c!=="hotel"&&c!=="trans"; }).length; if(!m) return;
  if(ne){ if(!confirm(gTxt(PS6.q,{n:ne,m:m}))) return; TR.items=TR.items.filter(function(x){ return !x.eat; }); }
  try{ ntap("_trip","trip_plan_sights"); }catch(e){} TR.plan=null; save(); refresh(); if(document.getElementById("trBox")) panelPaint(); planGo(); }
// 날짜 수 추천 (사장님 11-05) — 고른 날짜로 하루 끝 시각 안에 다 못 돌면, 다 들어가는 가장 짧은 날짜 수를 (고른 수+1)일부터 차례로 짜 보아 찾는다
//   11-06 일수 90일 — 한 번에 SGW(7)개 날짜 수까지만 짜 본다: (고른 수+1)~(고른 수+7)일(머문 시간 합 ÷ 하루 길이보다 적은 날짜는 못 들어가니 거기부터, 밤 장소가 없을 때) · 그 안에서도 안 되면 그 끝 날짜를 권한다(예전 「7일로도 안 되면 7」)
//   화면을 멈추지 않게 — 0.25초 안에 끝나면 그 자리에서(예전처럼), 넘으면 남은 날짜 수는 하나씩 뒤로 미뤄 짜고 다 되면 보고서를 다시 그린다(그동안 권유 칸은 안 보임)
//   「들어간다」= 보고서 ⚠ 경고와 같은 기준 — 그날 시간표(식사 칸 포함, 새 일정의 mealsOf 와 같은 {to,lunch:null,dinner:null}) 숙소 도착 ≤ 하루 끝
function planFits(H,p){ return withLC(function(){ return planFits0(H,p); }); }
function planFits0(H,p){ return p.days.every(function(d,di){ if(d.md) return true; var X=dayX(p,di,H), arr=X.arr, dt=X.dt; if(X.rest&&!arr.length) return true;   // 밤에 도착해 쉬는 날 (11-07)
  return sched(X.H,arr,dt,X.from,{to:X.to,lunch:null,dinner:null}).end<=dayLim(p,{},X.H,arr,dt,X); }); }   // 밤 장소가 있는 날은 그 장소 시각까지가 그날 (11-06) · 전국 일정은 그날 틀(출발점·시작 시각·기차 시각)로
var SUG={key:""}, SGW=7, SGB=250;   // 같은 일정·조건·실제 시간 개수면 다시 안 짠다 (화면에만)
// 날짜 수를 차례로 짜 보기 — st=SUG·SHR · Ds=짜 볼 날짜 수 · ok(D)=맞으면 true · none=못 찾을 때 · 답이 아직이면 null(뒤에서 짜는 중)
function daySearch(st,key,Ds,ok,none){ if(st.key===key){ if(st.n!=null) return st.n; if(st.t) return null; } else { st.key=key; st.n=null; st.i=0; st.Ds=Ds; st.t=0; }
  var t0=Date.now(), at=TR.plan&&TR.plan.at, one=function(){ var D=st.Ds[st.i++], y=false; try{ y=ok(D); }catch(e){ y=false; } if(y) st.n=D; else if(st.i>=st.Ds.length) st.n=none; return st.n!=null; };
  while(!(st.i>=st.Ds.length?(st.n=none,true):one())){ if(Date.now()-t0>SGB){ st.t=1; break; } }
  if(st.n!=null){ st.t=0; return st.n; }
  var go=function(){ if(st.key!==key||!TR.plan||TR.plan.at!==at){ st.t=0; return; } if(st.i>=st.Ds.length?(st.n=none,true):one()){ st.t=0; if(document.getElementById("trRep")) repPaint(); return; } setTimeout(go,30); };
  setTimeout(go,30); return null; }
function stayAll(){ var st=0, nt=false; TR.items.forEach(function(it){ var c=catOf(it); if(c==="hotel"||c==="trans") return; st+=stayOf(it); if(isNight(it)) nt=true; }); return {st:st,nt:nt}; }
function stSig(){ return TR.items.map(function(x){ return (x.um||"")+(fxOf(x)!=null?"@"+fxOf(x):""); }).join(","); }   // 손님이 고른 머무는 시간·시작 시각 (11-07)
function sugDays(H,cur,at){ var key=at+"|"+cur+"|"+Object.keys(RT).length+"|"+JSON.stringify(TR.opt)+"|"+stSig(); if(SUG.key===key&&SUG.n!=null) return SUG.n;
  var o=TR.opt, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), sa=stayAll(), lb=sa.nt?0:Math.ceil(sa.st/cap);
  var lo=Math.min(MAXD,Math.max(2,cur+1,lb)), hi=Math.min(MAXD,lo+SGW-1), Ds=[]; for(var D=lo;D<=hi;D++) Ds.push(D);
  return daySearch(SUG,key,Ds,function(D){ return planFits(H,compute(H,D)); },hi); }
// 날짜 줄이기 추천 (사장님 11-06 「손님 일정이 너무 많이 남을 때를 AI가 스스로 판단」) — 늘리기의 반대
//   더 적은 날짜로 다시 짜 보아 모든 날이 ① 하루 끝 시각(밤 장소가 있는 날은 그 장소 시각까지 — 보고서 ⚠ 와 같은 기준) 안에 숙소 도착
//   ② 문 여는 시각·마감·쉬는 날에 걸려 못 들어가는 곳이 지금 일정보다 늘지 않고 ③ 식사 칸까지 넣은 시간표에서 나와서 그냥 기다리는 시간이 하루 SHR_IDLE 분 이하
//   → 그중 가장 적은 날짜 수. 1일부터 짜 보되 머문 시간 합 ÷ 하루 길이보다 적은 날짜는 건너뛴다 · 같은 일정·조건이면 다시 안 짠다 (화면에만, 허브 호출 없음)
var SHR_IDLE=120, SHR={key:""};
function planScore(H,p){ return withLC(function(){ return planScore0(H,p); }); }
function planScore0(H,p){ var v=0, ok=true;
  p.days.forEach(function(d,di){ if(d.md) return; var X=dayX(p,di,H), arr=X.arr; if(!arr.length) return; var dt=X.dt, s=sched(X.H,arr,dt,X.from,{to:X.to,lunch:null,dinner:null});
    v+=s.viol; if(s.end>dayLim(p,{},X.H,arr,dt,X)||s.idle>SHR_IDLE) ok=false; });
  return {v:v,ok:ok}; }
//   11-06 일수 90일 — 짜 보는 날짜 수는 거기서부터 SGW(7)개까지 (지금 일수 −1 까지) · 화면을 멈추지 않게 늘리기와 같이(daySearch) · 답이 아직이면 null
function shrinkDays(H,pl){ var cur=pl.days.length; if(cur<2) return 0; var key=pl.at+"|"+cur+"|"+Object.keys(RT).length+"|"+JSON.stringify(TR.opt)+"|"+TR.items.length+"|"+stSig(); if(SHR.key===key&&SHR.n!=null) return SHR.n;
  var o=TR.opt, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), base=null;
  var st=TR.items.filter(function(it){ var c=catOf(it); return c!=="hotel"&&c!=="trans"; }).reduce(function(s,x){ return s+stayOf(x); },0), Ds=[];
  if(st>0) for(var D=Math.max(1,Math.ceil(st/cap));D<cur&&Ds.length<SGW;D++) Ds.push(D);
  if(!Ds.length){ SHR={key:key,n:0}; return 0; }
  return daySearch(SHR,key,Ds,function(D){ if(base==null) base=planScore(H,pl).v; var q=planScore(H,compute(H,D)); return q.ok&&q.v<=base; },0); }
function hotelPos(cb){ var h=TR.opt.hotel; if(!h) return cb(null); if(h.type!=="here") return cb({k:"__hotel",ko:h.ko,en:h.en,lat:+h.lat,lng:+h.lng,hotel:1});
  var use=function(p){ cb(p?{k:"__hotel",ko:"현재 위치",en:"Current location",lat:p[0],lng:p[1],hotel:1,here:1}:null); };
  if(window.ME&&ME.pos) use(ME.pos); else myPos().then(use); }

// ── 일정 짜기 ──
function planGo(){ if(!hasPass()){ openPricing(); return; } if(!TR.items.length) return;
  var b=document.getElementById("trPlan"); if(b){ b.disabled=true; b.textContent=T("짜는 중…","Planning…"); }
  hotelPos(function(H){ setTimeout(function(){ var pl;
    try{ pl=compute(H); }catch(e){ try{ console.error(e); }catch(x){} if(b){ b.disabled=false; b.innerHTML=MPICO("mi_calendar",T("🗓 일정 짜기","🗓 Plan my trip"),MIS); } return; }
    pl.H=H&&!H.here?H:null; if(pl.ord) pl.chk=DAYUP?2:1; DAYUP=0;
    var eDrop=[], eMiss=[]; if(pl.drop){ TR.items=TR.items.filter(function(x){ if(pl.drop.indexOf(x.k)<0) return true; eDrop.push(nm(x)); return false; }); delete pl.drop; }   // 11-08 겹치는 식당은 카트에서도 뺀다
    if(pl.emiss){ TR.items.forEach(function(x){ if(pl.emiss.indexOf(x.k)>=0) eMiss.push(nm(x)); }); delete pl.emiss; }
    TR.plan=pl; save(); if(eDrop.length||eMiss.length){ refresh(); setTimeout(function(){ if(eDrop.length) lgToast(gTxt(EA6.drop,{n:eDrop.length,p:eDrop.join(", ")})); if(eMiss.length) setTimeout(function(){ lgToast(gTxt(EA6.miss,{p:eMiss.join(", ")})); },eDrop.length?3600:0); },1200); }   // 11-07 짠 직후 검사 창 한 번 · 검사 창 「하루 늘리기」로 다시 짰으면 「다시 검사」 문구로
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
function reorderWithReal(pl,H){ return withLC(function(){ return reorderWithReal0(pl,H); }); }
function reorderWithReal0(pl,H){ if(!pl||!pl.days) return;
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), dt=X.dt, arr=X.arr; if(!arr.length) return;
    if(pl.ord){ d.end=sched(X.H,arr,dt,X.from,{to:X.to}).end; return; }   // 11-07 손님 순서 그대로 — 실제 시간이 와도 순서는 안 바꾸고 시각만 다시
    var ord=orderDay(X.H,arr,dt,X.from,X.to), s=sched(X.H,ord,dt,X.from,{to:X.to}); d.stops=ord.map(function(x){ return x.k; }); d.end=s.end; }); }
// 일정에 실제로 나오는 구간만(날짜 안 — 날짜끼리는 직선거리 그대로) 허브 /ntimes 로 한 번에. 짧은 걷기 구간은 빼고, 캐시(sessionStorage)는 다시 안 묻는다. 허브가 ODsay 하루 한도를 지킨다
function realTimesFetch(pl,H,cb){ var pairs=[], keys=[], seen={};
  var add=function(a,b){ if(!a||!b||!isFinite(a.lat)||!isFinite(b.lat)) return; var dk=km(a,b); if(dk<=walkKm()) return; if(!OLD()&&(dk<=TX_SHORT||dk>80||isleOf(a)!==isleOf(b))) return;   // 택시 구간(짧은 곳)·도시 사이는 안 묻는다 (11-06 — ODsay 아낌)
    var kk=rtKey(a,b); if(seen[kk]) return; seen[kk]=1;
    if(typeof RT[kk]==="number") return; var sv=null; try{ sv=sessionStorage.getItem("nt:"+kk); }catch(e){} if(sv!=null&&sv!==""){ RT[kk]=+sv; return; }
    keys.push(kk); pairs.push([+a.lat,+a.lng,+b.lat,+b.lng]); };
  pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), arr=X.arr, S=hS(X.H), E=hE(X.H), set=(S?[S]:[]).concat(E&&E!==S?[E]:[],arr);
    (X.pre||[]).forEach(function(r){ if(r.leg&&r.leg.mode==="transit"&&r.a&&r.b) add(r.a,r.b); });   // 도착한 날 공항 → 숙소 (11-07 — 예전엔 공항 → 첫 장소로 물었다)
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
// AI 하루 설명 (허브 POST /ntrip) — 7일 이하 일정은 예전처럼 한 번(본문·허브 캐시 그대로)
//   11-06 여행 일수 90일 — 8일 넘는 일정은 7일(AIW)씩 묶어 묶음마다 한 번(30일 = 5번 · 90일 = 13번, 장소 없는 묶음은 안 부름) · 한 번에 AIP(3)묶음까지 같이 보내고 오는 대로 그 자리에 붙인다
//   묶음 본문 = 그 묶음 날들만 + 날마다 n(몇 일차) + t(여행 전체 일수) — 허브가 「Day 8」처럼 차례를 맞추고, 캐시 키도 묶음마다 다르다
//   ai.pend = 지금 받는 중인 묶음 · ai.retry = 답을 못 받은 묶음(연결이 끊기거나 앱을 닫아 끊긴 것 — 다음에 일정을 열 때 그 묶음만 이어서)
//   허브가 실패로 답한 묶음(하루 한도 등)은 다시 안 부른다(그 날 설명만 없음) · 나눠 부르는 것 말고 호출을 늘리지 않는다
var AIW=7, AIP=3, AIQ={at:0,run:0};
function aiDays(pl){ var H0=REPH||pl.H||null;
  return pl.days.map(function(d,di){ if(d.md) return {w:DOW_EN[new Date(d.date+"T00:00:00Z").getUTCDay()],s:[]}; var X=dayX(pl,di,H0), dt=X.dt, s=sched(X.H,X.arr,dt,X.from,moX(di,X)), np=0, st=[], e=[];
    s.rows.forEach(function(r){ if(r.rest) return; if(r.meal||(r.x&&r.x.eat)){ e.push({a:np,k:(r.meal||r.x.meal)==="dinner"?"D":"L",t:m2hm(r.t)}); return; } np++; st.push({k:r.x.k,ko:r.x.ko,en:r.x.en,t:m2hm(r.t),m:r.x.stay}); });
    var o={w:DOW_EN[dt.getUTCDay()],s:st}; if(e.length) o.e=e; if(pl.mc) aiExtra(pl,di,X,s,o); return o; }); }
function aiFetch(){ var pl=TR.plan; if(!pl) return; var hn=pl.mc?"":(pl.hotel&&pl.hotel.type!=="here"?pl.hotel.ko:"");
  // 보고서와 같은 시간표(식사 칸·밤 장소·문 여는 시각 반영)를 그대로 보낸다 (11-06) — 식사는 e:[{a:그 앞 장소 수, k:L 점심·D 저녁, t:시각}] (옛 허브는 모르는 칸이라 버린다)
  //   전국 일정(11-06) — 그날 도시 사이 이동 mv·공항 ap·그날 밤 숙소 ht 도 시간표 그대로 (aiExtra) · 숙소 하나 일정은 예전 본문 그대로(허브 캐시 그대로)
  var all=withLC(function(){ return aiDays(pl); }), N=pl.days.length;
  if(N>AIW) return aiFetchParts(pl,hn,all);
  var body={h:hn,d:all.filter(function(d){ return d.s.length; }),lang:LANG};   // lang: 허브가 그 언어 설명을 줄 수 있게 (10-18 — 지금 허브는 ko/en)
  var at=pl.at; var ap=document.getElementById("trAiS"); if(ap) ap.hidden=false;
  fetch(HUB+"/ntrip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){ return r.json(); }).then(function(j){
    window.__trAiRes=j&&(j.ok?"ok":String(j.err)); if(!TR.plan||TR.plan.at!==at) return; if(j&&j.ok){ var k=0, days=pl.days.map(function(d){ return d.stops.length?(j.days||[])[k++]||null:null; }); TR.plan.ai={days:days,tips:j.tips||{}}; save(); } else if(!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1};
    if(document.getElementById("trRep")) repPaint(); }).catch(function(e){ window.__trAiRes="E "+e; if(TR.plan&&TR.plan.at===at&&!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1}; var a=document.getElementById("trAiS"); if(a) a.hidden=true; }); }
// 8일 넘는 일정 — 7일씩 묶어 부르고 합친다 · only = 이어서 부를 묶음 번호들(없으면 전부)
function aiFetchParts(pl,hn,all,only){ var N=pl.days.length, at=pl.at, lang=LANG, parts=[], c;
  for(c=0;c*AIW<N;c++){ var a0=c*AIW, a1=Math.min(N,a0+AIW), ds=[]; for(var di=a0;di<a1;di++){ var o=all[di]; if(o&&o.s.length){ o=Object.assign({},o,{n:di+1}); ds.push({di:di,o:o}); } }
    if(ds.length&&(!only||only.indexOf(c)>=0)) parts.push({c:c,a0:a0,a1:a1,ds:ds}); }
  var prev=pl.ai&&pl.ai.days?pl.ai:null, ai={days:prev?prev.days.slice(0,N):new Array(N).fill(null),tips:prev?Object.assign({},prev.tips||{}):{},pend:parts.map(function(p){ return p.c; }),retry:[]};
  while(ai.days.length<N) ai.days.push(null);
  if(!parts.length){ if(!prev) pl.ai={fail:1}; else { delete pl.ai.pend; delete pl.ai.retry; } save(); return; }
  pl.ai=ai; save(); var tok={at:at,run:1}; AIQ=tok; var ap=document.getElementById("trAiS"); if(ap) ap.hidden=false;
  var mine=function(){ return TR.plan===pl&&pl.at===at&&pl.ai===ai; };   // 그사이 다시 짰거나 다른 언어로 새로 부르기 시작했으면 손대지 않는다
  var q=parts.slice(), live=0, got=0, end=function(){ if(live>0||q.length) return; tok.run=0; if(!mine()) return; delete ai.pend; if(!ai.retry.length) delete ai.retry;
      if(!got&&!prev&&!ai.days.some(Boolean)&&!ai.retry) pl.ai={fail:1}; save(); if(document.getElementById("trRep")) repPaint(); },
    next=function(){ if(!mine()){ tok.run=0; return; } while(live<AIP&&q.length){ one(q.shift()); } end(); },
    done=function(p,net){ var i=ai.pend?ai.pend.indexOf(p.c):-1; if(i>=0) ai.pend.splice(i,1); if(net&&ai.retry) ai.retry.push(p.c); live--; },
    one=function(p){ live++; var body={h:hn,d:p.ds.map(function(x){ return x.o; }),t:N,lang:lang};
      fetch(HUB+"/ntrip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){ return r.json(); }).then(function(j){
        window.__trAiRes=j&&(j.ok?"ok":String(j.err)); if(!mine()){ live--; tok.run=0; return; }
        if(j&&j.ok){ got++; var k=0, jd=j.days||[]; for(var di=p.a0;di<p.a1;di++) if(p.ds.some(function(x){ return x.di===di; })) ai.days[di]=jd[k++]||null; else if(!pl.days[di].stops.length) ai.days[di]=null;
          var tp=j.tips||{}; for(var tk in tp) ai.tips[tk]=tp[tk]; }
        done(p); save(); if(document.getElementById("trRep")) repPaint(); next(); })
      .catch(function(e){ window.__trAiRes="E "+e; done(p,1); save(); next(); }); };   // 연결 끊김·앱 닫힘 = 다음에 이어서
  next(); }

// ── 보고서 ──
var REPH=null, REPME=null, GEO=null, GEOST="";   // REPME = 그날 1번째 구간 출발점 = 「지금 내 위치」(숙소 아님 — 그날 숙소에서 안 잘 수도, 사장님 10-20) · GEO 는 이 화면 메모리에만(저장·전송 없음)
// 일·중 화면인데 AI 설명에 그 언어 칸이 없으면(다른 언어로 짠 일정) 그 언어로 한 번 더 받는다 — 허브는 같은 본문을 캐시 (10-18)
function aiLangMiss(ai){ if(!ai||!ai.days||!/^(ja|zhs|zht|es)$/.test(LANG)) return false; var d=ai.days.filter(Boolean)[0]; return !!d&&!d[LANG]; }
function openReport(H){ if(!TR.plan) return; drLoad(TR.plan); var pl0=TR.plan; if(pl0.mc&&Array.isArray(pl0.tr)&&pl0.tr.some(function(t){ return !t.st; })) trFetch(pl0,function(){ if(TR.plan!==pl0) return; save(); if(document.getElementById("trRep")) repPaint(); });   // 공유로 받은 전국 일정 — 열차·버스 시간표를 받는다(순서는 받은 그대로)
  sheetClose("trBox"); sheet("trRep"); GEOST=""; GEO=null; /* 열 때마다 위치를 한 번 새로 */ var aiGo=function(){ var pa=TR.plan&&TR.plan.ai; if(TR.plan&&(!pa||aiLangMiss(pa))&&hasPass()) aiFetch();
    else if(pa&&((pa.pend&&pa.pend.length)||(pa.retry&&pa.retry.length))&&hasPass()&&!(AIQ.run&&AIQ.at===TR.plan.at)){ var p0=TR.plan, hn0=p0.mc?"":(p0.hotel&&p0.hotel.type!=="here"?p0.hotel.ko:""); aiFetchParts(p0,hn0,withLC(function(){ return aiDays(p0); }),(pa.pend||[]).concat(pa.retry||[])); } };   // 7일씩 나눠 부르다 앱을 닫았으면 남은 묶음만 (11-06)
  if(H!==undefined){ REPH=H; repPaint(); aiGo(); } else planHotel(function(h){ REPH=h; repPaint(); aiGo(); }); }
// 구간 양 끝 이름 (11-07 사장님 「걷는 사람 아이콘 어디서 어디까지 몇 분」) — k = 줄의 data-a/data-b 키 · b = 도착 쪽(숙소 키가 출발·도착 둘 다 __hotel 일 때 가르기)
var LGC={}, LGME={ko:"지금 내 위치",en:"My location",ja:"現在地",zhs:"我的位置",zht:"我的位置",es:"Mi ubicación"};
function lgNm(k,di,b){ var pl=TR.plan; if(!pl||!k) return ""; if(k==="__me") return T5(LGME);
  var x=pl.pool[k]; if(x) return x.eat?eatName(x):nm(x);
  var m=/^rs:(\d+):(lunch|dinner)$/.exec(k); if(m){ var c=mealsOf(+m[1])[m[2]]; return c?eatName(c):""; }
  var X=LGC[di]||(LGC[di]=dayX(pl,di,REPH||pl.H||null)), S=hS(X.H), E=hE(X.H);
  if(k==="__hotel") return ptNm(b?E:S)||ptNm(E||S); if(E&&E.k===k&&b) return ptNm(E); if(S&&S.k===k) return ptNm(S); if(E&&E.k===k) return ptNm(E);
  if(/^__(ht|lt)\d+$/.test(k)){ var np=natPt(pl,k); if(np) return ptNm(np); }   // 숙소에서 쉬기 구간 (11-07)
  return (window.PLACES&&PLACES[k])?nm(PLACES[k]):""; }
// 11-08 사장님 「일목요연」 — 이동은 카드 사이 회색 작은 한 줄: 탈것 아이콘 + 시간 · 거리 (줄 전체를 누르면 교통 창 · 끝의 › 는 CSS) · 장소 이름·「약」·✓ 는 뺀다
function lgDur(m){ if(window.LANG!=="en") return durTxt(m); m=Math.round(m); var h=Math.floor(m/60), r=m%60; return ((h?h+" h ":"")+(r||!h?r+" min":"")).trim(); }   // 영어는 「37m」이 미터와 헷갈려 「37 min」
function legTxt(lg,an,bn){ if(!lg) return ""; var d=lg.km<1?Math.round(lg.km*1000)+" m":lg.km.toFixed(1)+" km";
  if(lg.mode==="walk") return MPIMG("mi_walk",MIS)+lgDur(lg.min)+" · "+d;
  if(lg.mode==="transit") return MPIMG("mi_subway",MIS)+lgDur(lg.min)+" · "+d;
  if(lg.mode==="taxi"){ var fr=lg.fare?gTxt(lg.est?TX6.fe:TX6.fr,{f:won(lg.fare)}):"";
    return MPIMG("mi_taxi",MIS)+lgDur(lg.min)+(fr?" · "+esc(fr):"")+" · "+d+' <i class="txw">'+esc(T5(TX6[lg.live?"live":lg.why]||TX6.short))+'</i>'; }
  if(lg.mode==="air") return MPIMG("mi_plane",MIS)+lgDur(lg.min)+" · "+Math.round(lg.km)+" km";
  return MPIMG("mi_train",MIS)+lgDur(lg.min)+" · "+Math.round(lg.km)+" km"; }
// 일찍 끝나는 날 (사장님 10-27 「손님이 넣은 끝 시각에 맞춰라, 맘대로 늘리지 마라 — 일찍 끝나면 숙소로 일찍 갈지 묻고, 아니면 언제 도착하고 싶은지 물어 그때 추가 일정」)
//   d.gap = "early"(일찍 감) · {until:분}(그 시각까지 추가 일정을 넣음). 추가 장소 = 지도 그림 명소 중 그날 마지막 장소에서 가까운 곳(숙소·교통 빼고)
var GX={
 q:{ko:"이 날은 {e}에 끝나서 {t}까지 {g}이 비어요. 숙소로 일찍 돌아갈까요?",en:"This day ends at {e}, leaving {g} free until {t}. Head back to your lodging early?",ja:"この日は{e}に終わり、{t}まで{g}空きます。早めに宿に戻りますか？",zhs:"这一天{e}结束，到{t}还空出{g}。要早点回住处吗？",zht:"這一天{e}結束，到{t}還空出{g}。要早點回住處嗎？",es:"Este día termina a las {e} y te quedan {g} libres hasta las {t}. ¿Vuelves antes al alojamiento?"},
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
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-sugn]"); if(!b) return; e.preventDefault(); var n=+b.dataset.sugn; if(!(n>=1&&n<=MAXD)||b.disabled) return;
  b.disabled=true; b.textContent=T("짜는 중…","Planning…"); try{ ntap("_trip",b.dataset.shr?"trip_shrdays":"trip_sugdays"); }catch(z){}
  TR.opt.n=n; TR.plan=null; save(); planGo(); });   // 여행 일수 칸을 바꾼 것과 같게(#trN onchange) → 「일정 짜기」
// 그날 아래 ⚠ 경고 — 쉬운 말로 (사장님 11-05). {t} = 그날 기준 끝 시각(추가 일정으로 정한 시각이 있으면 그것)
var OVR6={ko:"이 날은 장소가 많아 {t}까지 다 못 돌아요 — 장소를 빼거나 날짜를 늘려 보세요",en:"Too many places to finish this day by {t} — remove a place or add a day",ja:"この日は場所が多く、{t}までに回りきれません — 場所を減らすか日数を増やしてください",zhs:"这一天地点太多，{t}前逛不完——请减少地点或增加天数",zht:"這一天地點太多，{t}前逛不完——請減少地點或增加天數",es:"Este día tiene demasiados lugares para terminar antes de las {t} — quita un lugar o añade un día"};
function gapAsk(pl,d,di,s,hush){ var gap=pl.to-s.end; if(d.gap==="early") return '<div class="tgap" data-html2canvas-ignore><span>'+esc(T5(GX.ok))+'</span> <a href="#" data-gap="re" data-d="'+di+'">'+esc(T5(GX.re))+'</a></div>';
  if(d.gap&&d.gap.until){ return d.gap.none?'<div class="tgap" data-html2canvas-ignore>'+esc(T5(GX.none))+' <a href="#" data-gap="re" data-d="'+di+'">'+esc(T5(GX.re))+'</a></div>':'<div class="tgap" data-html2canvas-ignore><div class="tgr" style="margin-top:0"><button type="button" class="trbtn" data-ev="add" data-d="'+di+'">'+esc(T5(CK6.eveAdd))+'</button></div> <a href="#" data-gap="re" data-d="'+di+'">'+esc(T5(GX.re))+'</a></div>'; }   // 11-07 자동으로 넣지 않는다
  if(gap<45) return "";
  if(hush&&!d.gap) return "";   // 날짜 줄이기 칸이 맨 위에 떠 있으면 줄이기를 먼저 — 「이대로 둘게요」를 누르면 이 물음이 다시 보인다 (11-06)
  var v={e:m2hm(s.end),t:m2hm(pl.to),g:durTxt(gap)};
  if(d.gap==="ask") return '<div class="tgap" data-html2canvas-ignore><b>'+esc(T5(GX.w))+'</b><div class="tgr"><input type="time" id="tgT'+di+'" value="'+m2hm(pl.to)+'"><button type="button" class="trbtn" data-gap="go" data-d="'+di+'">'+esc(T5(GX.go))+'</button></div></div>';
  return '<div class="tgap" data-html2canvas-ignore><b>'+esc(gTxt(GX.q,v))+'</b><div class="tgr"><button type="button" class="trbtn" data-gap="y" data-d="'+di+'">'+esc(T5(GX.y))+'</button><button type="button" class="trbtn" data-gap="n" data-d="'+di+'">'+esc(T5(GX.n))+'</button></div></div>'; }
// 그 시각까지 추가 장소 — 마지막(밤·공연 아닌) 장소 근처 지도 명소를 가까운 순으로, 숙소 도착이 원하는 시각을 넘지 않을 때까지
//   🔴 11-07부터 안 쓴다(자동으로 넣던 것) — 「추가 일정 짜기」는 gcOpen(후보를 보여 주고 손님이 고른 뒤 넣기 전 확인)
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
  if(g==="y") d.gap="early"; else if(g==="n") d.gap="ask"; else if(g==="re"){ delete d.gap; delete d.eveX; }
  else if(g==="go"){ var v=(document.getElementById("tgT"+di)||{}).value||"", un=hm2m(v)||pl.to; d.gap={until:un}; try{ ntap("_trip","gap_fill"); }catch(z){} save(); repPaint(); gcOpen(di,un); return; }   // 11-07 — 후보를 보여 주고 손님이 고른다(예전 gapFill 자동 넣기 X)
  save(); repPaint(); });
function repPaint(){ var sc=null, an=null; try{ sc=dgSc(); an=repAnchor(sc); }catch(e){} var r=withLC(repPaint0); try{ repRestore(sc,an); }catch(e){} return r; }
// 11-08 사장님 「N일차에서 뭔가를 고치면 화면이 다른 일차로 이동해 있다 — N일차에 머무르게」 — 다시 그리기 전 보고 있던 날(화면 위쪽에 걸친 날)과 그 위치를 적어 두고, 다시 그린 뒤 같은 자리로
function repAnchor(sc){ if(!sc) return null; var top=(sc===document.getElementById("trRep")||sc===document.scrollingElement||sc===document.documentElement)?0:sc.getBoundingClientRect().top, best=null;
  [].some.call(document.querySelectorAll("#trRep .tday"),function(t){ var r=t.getBoundingClientRect(); if(r.bottom>top+70){ best={d:t.dataset.d,off:r.top-top}; return true; } return false; }); return best; }
function repRestore(sc,an){ if(!sc||!an||!sc.scrollTop&&an.d==="0") return; var t=document.querySelector('#trRep .tday[data-d="'+an.d+'"]'); if(!t) return; var top=(sc===document.getElementById("trRep")||sc===document.scrollingElement||sc===document.documentElement)?0:sc.getBoundingClientRect().top;
  var fix=function(){ var r=t.getBoundingClientRect(), dv=(r.top-top)-an.off; if(Math.abs(dv)>1) sc.scrollTop+=dv; };
  fix(); [60,250,700].forEach(function(ms){ setTimeout(function(){ if(document.body.contains(t)&&!DG) fix(); },ms); });   // 위쪽 지도 그림이 늦게 그려지면 높이가 바뀌어 한 번 더 맞춘다
  var stop=function(){ an.off=null; }; sc.addEventListener("touchstart",stop,{once:true,passive:true}); sc.addEventListener("wheel",stop,{once:true,passive:true});
  var f0=fix; fix=function(){ if(an.off!=null) f0(); }; }   // 구간 기억 안에서 (11-06 — 90일 일정)
function repPaint0(){ var box=document.querySelector("#trRep .trin"), pl=TR.plan; if(!box||!pl) return; LGC={}; GPC={}; var H=REPH, ai=pl.ai||{}, tips=ai.tips||{};
  var mp=(window.ME&&ME.pos)||GEO; REPME=mp?{k:"__me",ko:"현재 위치",en:"Current location",lat:+mp[0],lng:+mp[1],me:1}:null;
  if(!mp&&!GEOST&&typeof myPos==="function"){ GEOST="ask"; myPos().then(function(q){ GEOST=q?"ok":"fail"; GEO=q||null; if(q&&document.getElementById("trRep")) repPaint(); else { [].forEach.call(document.querySelectorAll("#trRep .tnost"),function(e){ e.hidden=false; }); } }); }   // 폰 안에서만 한 번 묻는다
  var hn=pl.hotel?(pl.hotel.type==="here"?T("현재 위치","Current location"):nm(pl.hotel)):"";
  var h='<div class="trtop" data-html2canvas-ignore><b>'+MPICO("mi_cart",T("🛒 내 여행 일정","🛒 My trip plan"),MIS)+'</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trRep\')">✕</button></div>'
    +plBar()   // 11-08 내 플랜 고르기·새 플랜·플랜 삭제
    +'<div class="trbar" data-html2canvas-ignore><button type="button" class="trbtn" id="trNext">'+T("➡ 다음 갈 곳","➡ Next stop")+'</button><button type="button" class="trbtn" id="trPdf">'+MPICO("mi_device",T5(SAVE6),MIS)+'</button><button type="button" class="trbtn" id="trMail">'+MPICO("mi_doc",T5(MAIL6),MIS)+'</button><button type="button" class="trbtn" id="trShare">'+SHSVG+T("공유","Share")+'</button><button type="button" class="trbtn" id="trEdit">'+T("✏ 고치기","✏ Edit")+'</button><button type="button" class="trbtn ib" id="trInfo" aria-label="info">ⓘ</button></div>'
    +'<div id="trNextBox" data-html2canvas-ignore></div>'
    +(pl.days.some(function(d){ return d.stops.length; })?'<div class="d tdhint" data-html2canvas-ignore>'+esc(T5(DGC()?DG6.hT:DG6.hM))+'</div>':'')   // 11-08 끌어 옮기기 안내
    +grvCard()   // 가이드 일정 검토 (선택 · 11-07) — 누르지 않아도 일정은 그대로
    +'<div class="d" id="trAiS" data-html2canvas-ignore'+(pl.ai&&!(pl.ai.pend&&pl.ai.pend.length)?" hidden":"")+'>'+T("설명을 쓰는 중… (없어도 일정은 그대로 쓸 수 있어요)","Writing notes… (the plan works without them)")+'</div>'
    +(pl.skip&&pl.skip.length?'<div class="d">'+T("일정에서 뺀 곳(숙소·교통시설): ","Skipped (lodging/transport): ")+esc(pl.skip.map(function(k){ var it=TR.items.filter(function(x){ return x.k===k; })[0]; return it?nm(it):k; }).join(", "))+'</div>':"");
  // 날마다 시간표 먼저 — ⚠(하루 끝 넘김)가 하나라도 있으면 늘리기, 없으면 줄이기 판단 (11-06) · 오늘 실제 기록이 있거나 손님이 이미 정한 날(일찍 감·추가 일정)·「이대로 둘게요」면 줄이기는 안 묻는다
  var DS=pl.days.map(function(d,di){ var X=dayX(pl,di,H), dt=X.dt, arr=X.arr, mo=moX(di,X), lv=liveLv(pl,di,X.H,arr,dt,mo,X.from), s=sched(X.H,arr,dt,X.from,mo,lv);   // 전국 일정은 그날 틀(출발점·시작 시각·도착점) — 옛 일정은 X 가 예전 값 그대로 (11-06)
    return {X:X,dt:dt,arr:arr,lv:lv,s:s,lim:dayLim(pl,d,X.H,arr,dt,X),post:pl.mc?natPost(pl,di,X,s):null}; });
  var over=DS.some(function(q){ return (q.arr.length&&q.s.end>q.lim&&hardLim(q.X,q.lim))||(q.post&&q.post.miss); }), shr=0;   // 11-08 끝나는 시각 넘김은 문제로 안 본다
  if(!over&&!pl.noShr&&!pl.days.some(function(d){ return d.gap; })&&!DS.some(function(q){ return q.lv; })){ try{ shr=shrinkDays(H,pl); }catch(e){ shr=0; } }   // null = 뒤에서 짜는 중 (11-06) — 그동안 「일찍 끝나요」 물음도 잠깐 감춘다(줄이기 칸이 뜨면 그쪽이 먼저)
  // 11-07 일정 검사 — 그대로 두기(ack) 안 한 것 수는 맨 위에, 장소 줄엔 그 장소 문제를 한 줄로(그대로 두기 한 것도 안내로는 남긴다)
  var ALLI=[]; try{ ALLI=pl.ord?chkAll(DS):[]; }catch(e){ ALLI=[]; } var ACK=pl.ack||{}, ISS=ALLI.filter(function(q){ return !ACK[q.sig]; }), IM={};
  ALLI.forEach(function(q){ if(!q.k||!/^(night|nfirst|late|cut|zig|off|early|fix)$/.test(q.t)) return; if(q.t==="off"||q.t==="early"){ var xx=pl.pool[q.k], dd=pl.days[q.di], w=xx&&dd?winOf(xx,new Date(dd.date+"T00:00:00Z")):null; if(q.t==="off"&&w&&w.off) return; if(q.t==="early") return; }   // 쉬는 날(구글)·문 열기 기다림은 아래 원래 메모에 이미 있다
    (IM[q.di+"|"+q.k]=IM[q.di+"|"+q.k]||[]).push("⚠ "+issTxt(pl,q)); });
  var ack0=DS[0]&&DS[0].X&&DS[0].X.chk;   // 11-07 도착한 날 들를 첫날 숙소를 안 정했으면 맨 위에 한 줄 + 숙소 찾기(그날 밤 숙소 칸과 같은 길) — 그동안은 서울역·도시 중심 기준
  if(pl.mc&&ack0&&ack0.tmp){ var ad0=pl.days[0], aci0=ad0.nc!=null?ad0.nc:ad0.c; h+='<div class="tgap" data-html2canvas-ignore><b>'+esc(T5(NX6.h1st))+'</b><div class="tgr"><button type="button" class="trbtn" data-hpick="'+aci0+'" data-hd="0">'+MPIMG("mi_stay",MIS)+esc(T5(NX6.hPick))+'</button></div></div>'; }
  if(ISS.length) h+='<div class="tchkbar" data-html2canvas-ignore><span>'+esc(gTxt(CK6.cBar,{n:ISS.length}))+'</span><button type="button" class="trbtn" data-ck="open">'+esc(T5(CK6.cSee))+'</button></div>';
  pl.days.forEach(function(d,di){ if(d.md){ h+=mdHtml(pl,d,di,DS[di]); return; }   // 11-08 일 단위로 머무는 날
    var Q=DS[di], X=Q.X, dt=Q.dt, arr=Q.arr, lv=Q.lv, s=Q.s, a=(ai.days&&!d.aiX)?ai.days[di]:null, hk=d.date===kstToday(0)?liveHereK(pl,di,arr,s,lv):null;   // 오늘 = 실제 도착·출발로 다시 계산한 시각 (11-06) · d.aiX = 「새로 짜기」로 순서가 바뀐 날(그날 설명만 감춘다 — AI 다시 안 부름)
    var cty=pl.mc&&pl.cities&&pl.cities[d.c]?cnm(pl.cities[d.c]):"", pre=pl.mc&&X.pre&&X.pre.length?X.pre:null;
    if(cty){ var trp=d.pm!=null&&pl.tr?pl.tr[d.pm]:null, tra=d.am!=null&&pl.tr?pl.tr[d.am]:null, c2="";   // 11-08 사장님 — 도시를 옮기는 날 명찰 「부산 → 서울」
      if(trp) c2=(trp.b>=0&&pl.cities[trp.b])?cnm(pl.cities[trp.b]):(trp.sb?ptNm(trp.sb):""); if(trp&&c2&&c2!==cty) cty=cty+" → "+c2;
      else if(tra&&tra.a>=0&&pl.cities[tra.a]){ var c1=cnm(pl.cities[tra.a]); if(c1!==cty) cty=c1+" → "+cty; } }
    var np=arr.filter(function(x){ return !x.eat; }).length, f00=s.rows[0], a00=pre?((pre[0]&&pre[0].t!=null)?pre[0].t:X.from):(f00?Math.max(0,f00.t-(f00.leg?f00.leg.min:0)):X.from), b00=Q.post?Q.post.end:s.end;   // 11-08 날마다 요약 한 줄 — 장소 수 · 나서는 시각~끝 시각
    h+='<div class="tday" data-d="'+di+'"><div class="tdh"><span>'+T((di+1)+"일차",'Day '+(di+1))+'</span> · '+esc(dateTxt(dt))+(cty?'<b class="tcty">'+esc(cty)+'</b>':'')+(np?'<em class="tsum">'+esc(gTxt(DG6.sum,{n:np,a:m2hm(a00),b:m2hm(b00)}))+'</em>':'')+'</div>';
    if(arr.length) h+=tdBar(di,d.date===kstToday(0));
    var tam=d.am!=null&&pl.tr?pl.tr[d.am]:null; if(tam&&tam.fl&&tam.b>=0&&pl.cities[tam.b]) h+='<div class="tmemo ti" style="margin:2px 0 6px">'+esc(gTxt(PM6.n,{c:cnm(pl.cities[tam.b])}))+'</div>';   // 11-08 사장님 「모든 날에 보이게 해줘」 — 날마다 [진행] [하루 미루기] [일정 취소] (오늘은 초록 칸 「오늘 일정」, 다른 날은 작은 단추만)
    if(!arr.length&&!pre&&!(Q.post&&Q.post.tr)){ h+='<div class="tfree"><span class="d">'+esc(T5({ko:"자유 일정",en:"Free day",ja:"自由行動",zhs:"自由活动",zht:"自由活動",es:"Día libre"}))+'</span><button type="button" class="trbtn" data-pnd="'+di+'" data-html2canvas-ignore>'+esc(T5(PL6.day))+'</button></div>'+(Q.post&&Q.post.rows.length?'<div class="trows">'+natPostHtml(pl,di,X,Q.post,null)+'</div>':'')+eveHtml(pl,d,di,s,X,Q.lim)+'</div>'; return; }   // 11-08 남는 날도 「일정 추가」 칸
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
          +'<div class="tlg" data-html2canvas-ignore data-a="__me" data-b="'+esc(b0)+'" data-d="'+di+'">'+legTxt(lg0,lgNm("__me",di),lgNm(b0,di,1))+legGo(lg0)+'<div class="tods"></div></div>'; prevK="__me"; }
      else h+='<div class="d tnost" data-html2canvas-ignore'+(GEOST==="fail"?"":" hidden")+'>'+T5({ko:"위치를 켜면 1번째 장소까지 가는 길이 보입니다",en:"Turn on location to see the way to your first stop",ja:"位置情報をオンにすると1番目の場所までの行き方が表示されます",zhs:"开启定位后，会显示前往第1个地点的路线",zht:"開啟定位後，會顯示前往第1個地點的路線",es:"Activa la ubicación para ver cómo llegar a tu primera parada"})+'</div>'; }
    var fa=d.fra, fax=fa&&pl.pool[fa.k]; if(fax&&d.fr===fa.t&&fxOf(fax)===fa.x&&arr.indexOf(fax)>=0) h+='<div class="tmemo ti" style="margin:2px 0 6px">⏰ '+esc(gTxt(FX6.frA,{p:nm(fax),f:m2hm(fa.x),t:m2hm(fa.t)}))+'</div>';   // 11-07 이른 도착 시각에 맞춰 그날 출발을 당겼으면 한 줄 (fxEarly)
    var pj=0;   // 이 줄 앞 장소 수(식사 칸에서 「직접 식당 찾기」로 넣을 자리 기본값)
    var GP=[], GPI={}; if(!lv&&!OLD()){ try{ GP=gapsOf(s); GP.forEach(function(g,gi){ GPI[g.ri]=gi; try{ g.rec=gapRec(pl,di,X,s,g); }catch(e){ g.rec=[]; } }); }catch(e){ GP=[]; GPI={}; } } GPC[di]=GP;   // 11-07 장소 사이 빈 시간 — 그 자리에 「일정 추가」 칸 (오늘 실제 기록 날은 실시간 조정이 맡는다)
    var lqi=-1; if(!OLD()&&lunchAskOn(pl,d,di,X,s)){ lqi=s.rows.length; for(var q9=0;q9<s.rows.length;q9++){ if(s.rows[q9].t>=720){ lqi=q9; break; } } }   // 11-08 사장님 「점심시간이 비는데 점심을 물어보지 않는다 — 물어봐줘」
    s.rows.forEach(function(r,ri){ var lgOk=ri>0||!!pre;
      if(ri===lqi) h+=lunchAskHtml(di);
      if(GPI[ri]!=null) h+=gapHtml(pl,di,GP[GPI[ri]],GPI[ri]);   // 앞 일정 ↔ (이동) 다음 일정 사이
      if(r.rest){ var rk=(r.p&&r.p.k)||"__hotel", rn=ptNm(r.p);   // 숙소에서 쉬기 (11-07) — 숙소까지 · 쉬기 줄 · 다음 일정까지는 다음 줄의 구간
        if(r.leg&&prevK) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(rk)+'" data-d="'+di+'">'+legTxt(r.leg,lgNm(prevK,di),rn)+legGo(r.leg)+'<div class="tods"></div></div>';
        h+='<div class="trw h"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_stay",MIS)+txBtn('data-rsx="'+esc(r.k)+'" data-d="'+di+'" data-ra="'+m2hm(r.t)+'" data-rb="'+m2hm(r.e)+'"',CK6.rm)+esc(gTxt(CK6.rsRow,{a:m2hm(r.t),b:m2hm(r.e)}))+' · <b>'+esc(r.p&&r.p.tmp?gTxt(NX6.hTmp,{p:rn}):rn)+'</b></span></div>';   // 11-09 사장님 — 「빼기」도 오른쪽 ✕
        prevK=rk; return; }
      if(r.x&&r.x.eat){ pj++; if(r.leg&&prevK&&lgOk) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.x.k)+'" data-d="'+di+'">'+legTxt(r.leg,lgNm(prevK,di),eatName(r.x))+legGo(r.leg)+'<div class="tods"></div></div>';   // 11-07 손님이 넣은 식당
        var gw=(r.ar!=null&&!lv)?r.t-r.ar:0, gwh=gw>=60?'<span class="tmemo ti">'+esc(gTxt(CK6.gapM,{t:m2hm(r.t),g:durTxt(gw)}))+'</span>':'';
        var acts=(gw>=60&&GPI[ri]==null)?'<span class="tmact" data-html2canvas-ignore><button type="button" class="trbtn" data-ev="add" data-d="'+di+'" data-pos="'+(pj-1)+'">'+esc(T5(CK6.eveAdd))+'</button></span>':'';   // 11-09 사장님 — 「삭제」는 카드 머리줄 오른쪽 ✕(txBtn)로   // 11-08 사장님 — 「일정 추가」 옆에 「삭제」(식사가 겹칠 때) · 펼치지 않아도 보임   // 2시간 넘게 비면 위 「일정 추가」 칸이 맡는다 (11-07)   // 넣은 식당이 식사 시각을 기다리면 그 빈 시간에 넣을 곳 (11-07)
        h+='<div class="trw l teu tcx'+(EXP["u:"+r.x.k]?' open':'')+'" data-uk="'+esc(r.x.k)+'" data-xk="u:'+esc(r.x.k)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+txBtn('data-ux="'+esc(r.x.k)+'"',DG6.del)+esc(T5(CK6[r.t<900?"lunch":"dinner"]||CK6.meal))+' '+stSel(r.x.k,r.x.stay,180)+gwh+'<span class="teat on">'+eatLine(r.x)+acts+'<span class="teact">'+eatLinks(r.x)+rsvLink(r.x)+' <button type="button" class="tsbtn" data-pp="eat">'+esc(T5(DG6.det))+'</button></span></span>'+(window.XTG?XTG.html(!!EXP["u:"+r.x.k],'',true):'')+'</span></div>';
        prevK=r.x.k; return; }
      if(r.meal){ var mk=di+":"+r.meal, ml=r.meal==="lunch"?T("점심 (1시간)","Lunch (1 h)"):T("저녁 (1시간)","Dinner (1 h)");
        if(r.r){ if(r.leg&&lgOk&&prevK) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="rs:'+mk+'" data-d="'+di+'">'+legTxt(r.leg,lgNm(prevK,di),eatName(r.r))+'<div class="tods"></div></div>';
          h+='<div class="trw l tcx'+(EXP["m:"+mk]?' open':'')+'" data-xk="m:'+mk+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+txBtn('data-mdel="'+mk+'"',DG6.del)+esc(T5(CK6[r.meal]||CK6.meal))+' <select class="tstay" data-smk="'+mk+'" aria-label="'+esc(T5(CK6.stay))+'">'+stayOpts(r.r.stay>=30?r.r.stay:60,30,180)+'</select><span class="teat on">'+eatLine(r.r)+'<span class="teact">'+eatLinks(r.r)+' <button type="button" class="tebtn" data-x="'+mk+'">'+T("바꾸기","Change")+'</button> <button type="button" class="tsbtn" data-pp="eat">'+esc(T5(DG6.det))+'</button></span></span>'+(window.XTG?XTG.html(!!EXP["m:"+mk],'',true):'')+'</span></div>'; prevK="rs:"+mk; }
        else { if(r.to&&r.leg&&prevK&&lgOk) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.to)+'" data-d="'+di+'">'+legTxt(r.leg,lgNm(prevK,di),lgNm(r.to,di,1))+legGo(r.leg)+'<div class="tods"></div></div>';   // 다음 장소 근처로 먼저 가서 먹는 칸 — 이동이 식사 앞
          h+='<div class="trw l"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+ml+'<span class="teat" id="te_'+mk.replace(":","_")+'" data-k="'+mk+'" data-j="'+pj+'">'+eatPickRow(mk,r.anchor,pj)+'</span></span></div>'; }
        return; }
      if(r.leg&&prevK&&lgOk) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.x.k)+'" data-d="'+di+'">'+legTxt(r.leg,lgNm(prevK,di),nm(r.x))+legGo(r.leg)+'<div class="tods"></div></div>';
      n++; pj++; var tip=tips[r.x.k], memo=[], warn=(IM[di+"|"+r.x.k]||[]).slice(), det=[], lr=lv&&lv.rec[r.x.k];   // 11-08 카드 — warn 경고(빨강)·memo 꼭 알 것(늘 보임: ⏰ 도착·수문장 교대식·문 여는 시각) / det 는 누르면 펼침
      r.note.forEach(function(q){ var s1=Array.isArray(q)?T(q[0],q[1]):gTxt(q.o,q.v||{}); if((q.o&&(q.o===LV6.off||q.o===LV6.shut))||(Array.isArray(q)&&/입장 마감/.test(q[0]))) warn.push(s1); else memo.push(s1); });
      if(r.act===2&&lr) memo.unshift(lr.a!=null?gTxt(LV6.done,{a:m2hm(lr.a),d:m2hm(lr.d!=null?lr.d:r.t+r.st)}):gTxt(LV6.left,{d:m2hm(lr.d)}));
      else if(r.act===1&&lr) memo.unshift(gTxt(LV6.here,{a:m2hm(lr.a)}));
      if(!r.act&&Array.isArray(r.x.oh)&&r.x.oh.length){ var co=closeOf(r.x,dt,r.t); if(co.c!=null&&co.o!=null&&co.c-co.o<1440) det.push(gTxt(LV6.hrs,{o:m2hm(co.o),c:m2hm(co.c)})); }
      if(needCheck(r.x)) det.push(T("운영 시간·휴무일 확인 필요","Check opening hours/closures"));
      if(isNight(r.x)) det.push(T("밤 추천","Best at night"));
      var fm=pl.fxm&&pl.fxm[r.x.k], fmt=(fm&&fm.t===di&&!r.act)?gTxt(fm.a?FX6.mvA:FX6.mvN,{f:m2hm(fm.x),s:dLbl(fm.f),d:dLbl(fm.t)}):"";   // 11-07 짤 때 정한 시각에 맞춰 옮긴 곳
      var xk="p:"+r.x.k, op=!!EXP[xk];
      h+='<div class="trw tpk tcx'+(op?' open':'')+'" data-k="'+esc(r.x.k)+'" data-xk="'+esc(xk)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp"><b class="tno">'+n+'</b>'+txBtn('data-ux="'+esc(r.x.k)+'"',DG6.del)+'<b class="tpn">'+esc(nm(r.x))+'</b> <i>'+stSel(r.x.k,r.x.stay,480)+(r.ext?' · '+T(m2hm(r.t+(r.st||r.x.stay))+"까지","until "+m2hm(r.t+(r.st||r.x.stay))):'')+'</i>'
        +(warn.length?'<span class="tmemo">'+esc(warn.join(" · "))+'</span>':"")+(memo.length?'<span class="tmemo ti">'+esc(memo.join(" · "))+'</span>':"")
        +'<span class="tdet">'+(det.length?'<span class="tmemo ti">'+esc(det.join(" · "))+'</span>':"")+(fmt?'<span class="tmemo ti">↪ '+esc(fmt)+'</span>':"")+(aiTx(tip)?'<span class="ttip">'+MPIMG("mi_tip",MIS)+esc(aiTx(tip))+'</span>':"")
        +'<span class="tdbt" data-html2canvas-ignore>'+fxRep(r.x)+'<button type="button" class="tsbtn" data-pp="'+esc(r.x.k)+'">'+esc(T5(DG6.det))+'</button></span></span>'
        +(hk===r.x.k?'<span class="tlvw" data-html2canvas-ignore><button type="button" class="tlvb" data-lvleave="'+esc(r.x.k)+'">'+esc(T5(LV6.leave))+'</button></span>':'')+(window.XTG?XTG.html(op,'',true):'')+'</span></div>';
      prevK=r.x.k; });
    if(lqi===s.rows.length) h+=lunchAskHtml(di);
    if(Q.post) h+=natPostHtml(pl,di,X,Q.post,prevK);
    else if(s.back) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="__hotel" data-d="'+di+'">'+legTxt(s.back,lgNm(prevK,di),lgNm("__hotel",di,1))+legGo(s.back)+'<div class="tods"></div></div><div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">'+MPICO("mi_stay",T("숙소 도착","Back to lodging"),MIS)+'</span></div>';
    else h+='<div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">'+T("일정 끝","End of day")+'</span></div>';
    if(!Q.post&&pl.days.length>1&&di<pl.days.length-1) h+=nightHtml(pl,di,null);   // 밤마다 숙소 칸 (11-06) — 숙소 하나 일정은 마지막 날 빼고
    if(d.gap&&!(X.pmTr||X.apD)) h+=gapAsk(pl,d,di,s,shr!==0);   // 「숙소로 일찍 갈게요」를 고른 날 등 — 그 표시와 되돌리기 (11-07 「일찍 끝나요」 물음은 아래 「일정 추가」 칸이 맡는다)
    var lim=Q.lim;   // 밤 장소가 있는 날은 그 장소 시각까지 (11-06) · 전국 일정은 막차·공항 도착 시각도
    var trLate=!!(X.pmTr&&X.lim!=null&&s.end>X.lim); if(trLate) lim=X.lim;   // 11-08 저녁 이동 날은 밤 장소가 있어도 막차 기준으로 따로 본다(밤 장소 끝 시각에 가려 경고가 빠졌다)
    if(s.end>lim&&arr.length&&(trLate||hardLim(X,lim))){ var ntD=!X.apD&&!(X.pmTr&&X.lim!=null&&lim===X.lim)&&lim>((d.gap&&d.gap.until)||X.to||pl.to);   // 밤 장소 날 — 기준 시각(03:38 같은 밤 장소 시각)은 손님이 정한 게 아니라 실제 도착만 (11-07)
      h+='<div class="tmemo" style="margin-top:4px">⚠ '+esc(ntD?gTxt(hE(X.H)?CK6.overN:CK6.overN2,{e:m2hm(s.end)}):gTxt(X.apD?NX6.wAp:(X.pmTr&&X.lim!=null&&lim===X.lim)?NX6.wTr:OVR6,{t:m2hm(lim)}))+'</div>';
      if(X.pmTr&&pmCanFlip(pl,di)) h+='<div class="tmact" data-html2canvas-ignore><button type="button" class="trbtn" data-pmam="'+di+'">'+esc(T5(PM6.b))+'</button></div>'; }   // 11-08 사장님 「다음날 아침에 도시간 이동을 미루는게 현명하다」
    h+=eveHtml(pl,d,di,s,X,lim);   // 11-07 사장님 — 「일정 추가」 칸은 모든 날 일정 맨 끝에 무조건 (일정을 더 짜서 놀고 싶은 사람)
    h+='</div></div>'; });
  // 그날 ⚠ 경고가 하나라도 있으면 맨 위에 날짜 수 추천 (고른 날짜가 이미 90일이면 더 늘릴 수 없어 안 띄움 · 뒤에서 짜는 중이면 다 된 뒤 다시 그릴 때)
  var sgn=null;   // 11-08 사장님 「그 때문에 날짜를 늘리지 않는다」 — 날짜 늘리기 권유 칸은 안 띄운다(sugDays 는 남겨 둠)
  if(sgn!=null){ var sg=sugHtml(pl.days.length,sgn); h=h.replace('<div class="trbar"',function(m){ return sg+m; }); }
  else if(shr>0){ var sr=shrHtml(shr); h=h.replace('<div class="trbar"',function(m){ return sr+m; }); }   // 더 적은 날짜로 다 들어가면 같은 자리에 줄이기 (11-06)
  h+='<div class="d" style="margin:10px 2px">'+(planUsesReal(pl,H)
    ? T5({ko:"이동 시간은 가능한 구간은 실제 대중교통 기준입니다. 일부 구간은 직선거리 어림이에요. 이동 줄을 누르면 자세한 길을 볼 수 있어요.",
          en:"Travel times use real public transit where available; some legs are straight-line estimates. Tap a travel line for the full route.",
          ja:"移動時間は可能な区間は実際の公共交通機関に基づきます。一部は直線距離の目安です。移動の行をタップすると詳しい経路を確認できます。",
          zhs:"交通时间尽可能采用实际公共交通，部分路段为直线距离估算。点按交通行可查看详细路线。",
          zht:"交通時間盡可能採用實際大眾運輸，部分路段為直線距離估算。點按交通列可查看詳細路線。",
          es:"Los tiempos usan transporte público real cuando es posible; algunos tramos son estimaciones en línea recta. Toca una línea de trayecto para ver la ruta completa."})
    : T5({ko:"이동 시간은 직선거리 어림입니다. 이동 줄을 누르면 그 구간의 실제 길을 찾아요.",en:"Travel times are straight-line estimates. Tap a travel line to look up the real route.",ja:"移動時間は直線距離の目安です。移動の行をタップすると、その区間の実際の経路を調べます。",zhs:"交通时间为直线距离估算。点按交通行即可查询该路段的实际路线。",zht:"交通時間為直線距離估算。點按交通列即可查詢該路段的實際路線。",es:"Los tiempos de trayecto son estimaciones en línea recta. Toca una línea de trayecto para buscar la ruta real."}))+'</div>';
  box.innerHTML=h; try{ eatPRe(); }catch(e){} var g=function(id){ return document.getElementById(id); };
  g("trNext").onclick=function(){ nbTog("next",nextStop); }; g("trPdf").onclick=pdfGo; g("trMail").onclick=mailOpen; g("trShare").onclick=function(){ nbTog("share",shareGo); }; g("trEdit").onclick=function(){ sheetClose("trRep"); openPanel(); };   // 「다음 갈 곳」·「공유」 = 같은 단추를 다시 누르면 접힘 (11-07)
  g("trInfo").onclick=function(){ tPop(function(){ return '<b>ⓘ</b><div style="margin-top:6px;line-height:1.6">'+T("· PDF는 휴대폰 「다운로드」에 저장돼요 — 안드로이드는 파일 앱에서 PDF를 길게 눌러 「홈 화면에 추가」하면 바로 열 수 있어요.<br>· 궁궐 휴무(월: 창덕궁·창경궁·덕수궁·숭례문 / 화: 경복궁·종묘)는 궁능유적본부 안내 기준 — 휴무일이 공휴일이면 열고 다음 평일에 쉽니다.<br>· 다른 곳의 운영 시간은 현장·공식 안내를 확인하세요.","· The PDF is saved to Downloads — on Android, long-press it in the Files app and choose “Add to Home screen”.<br>· Palace closures (Mon: Changdeokgung, Changgyeonggung, Deoksugung, Sungnyemun / Tue: Gyeongbokgung, Jongmyo) follow the official Royal Palaces notice — if the closing day is a public holiday they open and close the next weekday.<br>· Check other opening hours on site or official pages.")+'</div>'; }); };
  pl.days.forEach(function(d,di){ var el=g("tmap"+di); if(!el) return; var X=DS[di].X, s=sched(X.H,X.arr,X.dt,X.from,moX(di,X));
    dayMap(el,hpOf(X.H),s.rows.filter(function(r){ return r.x||r.r; }).map(function(r){ return r.x?r.x:Object.assign({eat:1},r.r); }),X.me?hS(X.H):null); });
  recsFetch();
  if(pl.chk){ var c0=pl.chk; pl.chk=0; save(); setTimeout(function(){ if(TR.plan===pl&&document.getElementById("trRep")) chkOpen(c0===2); },120); } pcHook("rep",box); }   // 11-07 바뀌면 전체 다시 검사 — 고칠지는 손님이
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep .tlgo,#trRep .tlg>.xtg"); if(!a) return; e.preventDefault(); legTog(a.closest(".tlg")); },true);
// 이동 줄(걷기·대중교통·택시·기차·버스·비행기)을 누르면 「교통」 창 — 출발 = 앞 장소, 도착 = 다음 장소, 누른 줄의 탈것 칸을 펼쳐 둔다 (사장님 11-07)
//   ▼/— 와 펼친 경로 칸(.tods) 안은 예전 그대로 · 교통 창이 없으면(옛 화면) 아무것도 안 함
document.addEventListener("click",function(e){ var r=e.target.closest&&e.target.closest("#trRep .tlg"); if(!r||!window.TRANSIT||!TRANSIT.go) return;
  if(e.target.closest(".xtg,.tods")||(e.target.closest("a,button")&&!e.target.closest(".tlgt"))) return;
  e.preventDefault(); e.stopPropagation(); legTransit(r); },true);
function legTransit(row){ var A=row.dataset.a, B=row.dataset.b, di=+row.dataset.d||0, pa=A==="__me"?null:ptK(A), pb=ptK(B); if(!pb||!(+pb.lat)) return;
  var im=row.querySelector("img"), ic=im?String(im.getAttribute("src")||""):"", w=/mi_walk/.test(ic)?"w":/mi_taxi/.test(ic)?"x":/mi_subway/.test(ic)?"t0":/mi_plane/.test(ic)?"a0":/mi_train/.test(ic)?"ic":"";
  var pt=function(k,p,b){ return {k:(window.PLACES&&PLACES[k]&&!/^__/.test(k))?k:"",nm:lgNm(k,di,b)||p.ko||"",ko:p.ko||lgNm(k,di,b)||"",lat:+p.lat,lng:+p.lng,sub:p.addr||""}; };
  try{ ntap("_trip_leg_transit","trip"); }catch(x){}
  TRANSIT.go({from:pa&&+pa.lat?pt(A,pa,0):null,to:pt(B,pb,1),open:w}); }
// 「실제 경로 보기」 펼치기·접기 (사장님 11-07) — 공통 ▼/— 단추(.tlg>.xtg) · 접으면 숨기기만(받은 경로는 그대로), 다시 펼치면 그것을 다시 보여 준다(ODsay 다시 안 부름) · 빈 칸일 때만 legRoute
function legTog(row,on){ if(!row) return; var t=row.querySelector(".tods"), b=row.querySelector(":scope>.xtg"); if(!t) return; if(on==null) on=!(b&&b.classList.contains("on"));
  t.hidden=!on; if(on&&!t.firstElementChild) legRoute(row); if(window.XTG) XTG.set(b,on); }
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
  var ME6={ko:"현재 위치",en:"Current location",ja:"現在地",zhs:"当前位置",zht:"目前位置",es:"Ubicación actual"}, lnm=function(k,p){ return k==="__me"?T5(ME6):(p.eat?eatName(p):ptNm(p)); };   // 걷는 구간 「어디 → 어디」 이름 (11-07) — 그 화면 언어로
  PLACES[ka][LANG]=lnm(A,pa); PLACES[kb][LANG]=lnm(B,pb); if(A==="__me") PLACES[ka].ko=ME6.ko; if(B==="__me") PLACES[kb].ko=ME6.ko;
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
var MKL=null, MKC={};   // 11-08 홈페이지(PC_HOME)만 — 그날 지도 그림의 번호·숙소 자리(그림 크기 기준)
function mapMarks(g,W,arr,seq,hp,sp){ if(window.PC_HOME){ var n9=0; MKL={w:W,h:g.canvas.height,hp:hp?[hp[0],hp[1]]:null,p:seq.map(function(p,i){ return arr[i].eat?null:[p[0],p[1],++n9]; }).filter(Boolean)}; } var R=Math.max(13,W*0.022), line=(sp?[sp]:hp?[hp]:[]).concat(seq,hp?[hp]:[]);   // sp = 오늘 출발점 「나」(11-06) — 선은 나에서 시작해 숙소(H)로
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
function mapPut(el,key,cv){ if(window.PC_HOME&&MKL){ MKC[key]=MKL; MKL=null; try{ el.setAttribute("data-mk",key); }catch(e){} } var url=""; try{ url=cv.toDataURL("image/jpeg",0.85); }catch(e){} if(url){ var ks=Object.keys(MAPC); if(ks.length>Math.max(24,((TR.plan&&TR.plan.days&&TR.plan.days.length)||0)+6)) delete MAPC[ks[0]]; MAPC[key]=url; el.innerHTML='<img alt="" src="'+url+'">'; } else { el.innerHTML=""; el.appendChild(cv); } }   // 11-06 — 긴 일정(30·90일)은 그날 수만큼 기억(넘치면 다시 그릴 때마다 수십 장을 새로 그려 폰이 버벅였다) · 7일 이하는 예전처럼 25장
function dayMap(el,H,arr,SP){ var pts=arr.slice(); if(H) pts.push(H); if(SP) pts.push(SP); var id=coverMap(pts), gf=GUF[id];
  var key=id+"|"+pts.map(function(p){ return (p.eat?"e":"")+(p.k||"")+"@"+(+p.lat).toFixed(5)+","+(+p.lng).toFixed(5); }).join(";")+"|"+(H?1:0);   // 다시 그릴 때(언어·식당 추천 등)는 그려 둔 그림 그대로
  if(MAPC[key]){ el.innerHTML='<img alt="" src="'+MAPC[key]+'">'; if(window.PC_HOME) el.setAttribute("data-mk",key); return; }
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
    s.rows.forEach(function(r){ if(!pick&&r.x&&!r.lunch&&r.act!==2&&r.t+(r.st||r.x.stay)>nm0) pick=r.x; }); });
  if(!pick){ for(var i=0;i<pl.days.length&&!pick;i++){ var d=pl.days[i]; if(d.date>=today&&d.stops.length) pick=pl.pool[d.stops[0]]; } }
  if(!pick) for(i=0;i<pl.days.length&&!pick;i++) if(pl.days[i].stops.length) pick=pl.pool[pl.days[i].stops[0]];
  if(!pick) return; box.dataset.p="next"; box.innerHTML='<div class="item"><div class="t xtrow"><span>➡ '+esc(nm(pick))+'</span>'+nbX()+'</div><div class="d">'+esc(L()?(pick.addr_en||pick.addr||""):(pick.addr||""))+'</div>'+linksTo(pick.ko,pick.lat,pick.lng,null,pick.addr,0,null,(window.txEn?txEn(pick):""))+'</div>'; }
// 「다음 갈 곳」·「공유」 칸 접기 (사장님 11-07) — 칸 맨 윗줄 오른쪽 공통 — 단추 · 같은 툴바 단추를 다시 눌러도 접힌다
//   접기 = 칸 비우기(repAgain 은 빈 칸을 「닫힘」으로 본다) · box.dataset.p = 지금 열린 칸(next·share) · GS.view="off" = 가이드 목록 받는 중이던 것이 다시 그리지 않게
function nbX(){ return window.XTG?XTG.html(true,'data-nbx="1"'):""; }
function nbClose(){ var box=document.getElementById("trNextBox"); if(!box) return; box.innerHTML=""; delete box.dataset.p; GS.view="off"; }
function nbTog(p,f){ var box=document.getElementById("trNextBox"); if(box&&box.firstElementChild&&box.dataset.p===p){ nbClose(); return; } f(); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trNextBox [data-nbx]"); if(!b) return; e.preventDefault(); nbClose(); });

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
function mealsOf(di){ var pl=TR.plan, m=(pl&&pl.meals)||{}, sk=(pl&&pl.mskip)||{}; return {to:pl?pl.to:1200,lunch:m[di+":lunch"]||null,dinner:m[di+":dinner"]||null,skip:{lunch:!!sk[di+":lunch"],dinner:!!sk[di+":dinner"]}}; }   // skip = 「삭제」로 건너뛴 끼니 (11-08)
function kindOf(cat){ var a=String(cat||"").split(">").map(function(x){ return x.trim(); }); return a[1]||a[0]||""; }
var KCODE={"한식":"korean","중식":"chinese","일식":"japanese","양식":"western","분식":"snack","아시아음식":"asian","패스트푸드":"fast","뷔페":"buffet"};
// 후보 하나 → 통과면 {note}, 아니면 null. ①② 는 태그로, ③ 은 카카오 종류·이름 글자로(정확하지 않으면 「확인 필요」)
function eatOk(c,o){ var tx=(c.ko||"")+" "+(c.cat||"")+" "+(c.kind||"")+" "+(c.menu||""), tg=c.tags||[], f=o.food||"any", note="", tagged=c.src!=="near"&&c.src!=="g";   // g = 구글 식당(태그 없음, 종류 글자로 판단 · 11-07)
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
    +(c.src==="eat"&&c.menu&&c.menu!==c.kind&&c.menu!=="음식점"?' <i>· '+esc((L()&&c.menu_x)||c.menu)+'</i>':'')+(c.lux?' <b class="tead" style="background:#2b8a3e">'+T("고급","Fine dining")+'</b>':'')
    +(c.srcs&&c.srcs.length?'<span class="tesrc">'+MPIMG("mi_doc",MIS)+(c.url&&/^https:\/\//.test(c.url)?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener">':'')+esc(c.srcs.map(function(q){ return LP(q); }).join(" · "))+(c.url?'</a>':'')+'</span>':'')
    +(c.note?'<span class="tmemo">'+esc(c.note)+'</span>':'')+(c.src==="ad"&&LD(c)?'<span class="ttip">'+esc(LD(c))+'</span>':''); }
function eatLinks(c){ var t=String(c.tel||"").replace(/\s/g,""), tl=t?'<a class="tel" href="tel:'+esc(telIntl(t))+'">'+MPIMG("mi_phone",MIS)+esc(L()?telIntl(t).replace("-"," "):t)+'</a>':"";
  return tl+linksTo(c.ko,c.lat,c.lng,c.ko,c.addr,0,null,(window.txEn?txEn(c):"")); }
var EATC={};
function eatList(mk,anchor){ var pl=TR.plan, rc=pl.recs&&pl.recs[mk];
  if(!rc||(anchor&&rc.ak!==anchor.k)) return '<span class="d">'+T("근처 식당 찾는 중…","Finding places to eat nearby…")+'</span>';
  var cs=eatPick(mk)||[]; EATC[mk]=cs;
  if(!cs.length) return '<span class="d">'+T("조건에 맞는 근처 식당을 못 찾았어요","No matching places nearby")+'</span> '+efBtn(mk);   // 11-07 — 조건을 넓혀 직접 찾기
  return '<span class="tehd">'+MPICO("mi_food",T("🍽 근처 식당 추천","🍽 Places to eat nearby"),MIS)+'</span>'+cs.map(function(c,i){ return '<span class="tec">'+eatLine(c)+' <button type="button" class="tebtn" data-k="'+mk+'" data-i="'+i+'">'+T("넣기","Pick")+'</button></span>'; }).join(""); }
function efBtn(mk){ return '<button type="button" class="tebtn tefb" data-ef="'+esc(mk)+'">'+MPIMG("mi_search",MIS)+esc(T5(CK6.fBtn))+'</button>'; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep [data-ef]"); if(!b) return; e.preventDefault(); e.stopPropagation(); var mk=b.dataset.ef, te=b.closest(".teat"), q=mk.split(":");
  efOpen({di:+q[0],K:q[1],mk:mk,pos:te&&te.dataset.j!=null?+te.dataset.j:0}); },true);
var EATQ={};
function recsFetch(){ var pl=TR.plan; if(!pl) return; pl.recs=pl.recs||{}; var H=REPH;
  eatsLoad().then(function(){ if(TR.plan!==pl) return; pl.days.forEach(function(d,di){ var X=dayX(pl,di,H), s=sched(X.H,X.arr,X.dt,X.from,moX(di,X));
    s.rows.forEach(function(r){ if(!r.meal||r.r) return; var mk=di+":"+r.meal, an=r.anchor||r.next, rc=pl.recs[mk], el=document.getElementById("te_"+mk.replace(":","_")); if(!an) return;
      if(rc&&rc.ak===an.k&&(rc.l===LANG||!L())){ if(el&&!el.querySelector(".tec,.tepk")) el.innerHTML=eatPickRow(mk,an,el.dataset.j); return; }   // 영어 화면인데 한글로 받아 둔 것만 다시
      var lg=LANG, qk=mk+"|"+an.k+"|"+lg; if(EATQ[qk]) return; EATQ[qk]=1; var at=pl.at;   // 언어는 부를 때 값으로 적는다 — 받는 사이에 언어를 바꾸면 다른 언어 이름이 그 언어로 저장됐다 (10-18)
      fetch(HUB+"/neat?x="+(+an.lng).toFixed(4)+"&y="+(+an.lat).toFixed(4)+kpL()).then(function(r){ return r.json(); }).then(function(j){ delete EATQ[qk]; if(!TR.plan||TR.plan.at!==at) return;
        TR.plan.recs[mk]={ak:an.k,a:[+an.lat,+an.lng],p:(j&&j.partners)||[],i:(j&&j.ok&&j.items)||[],l:lg}; save(); if(lg!==LANG) return;
        var e2=document.getElementById("te_"+mk.replace(":","_")); if(e2) e2.innerHTML=eatPickRow(mk,an,e2.dataset.j); eatPRe(); })
        .catch(function(){ delete EATQ[qk]; var e2=document.getElementById("te_"+mk.replace(":","_")); if(e2) e2.innerHTML='<span class="d">'+T("식당 추천을 못 불러왔어요","Could not load suggestions")+'</span> '+efBtn(mk); }); }); }); }); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#trRep .tebtn"); if(!b) return; e.preventDefault(); var pl=TR.plan; if(!pl) return; pl.meals=pl.meals||{};
  if(b.dataset.x){ delete pl.meals[b.dataset.x]; save(); repPaint(); return; }
  var mk=b.dataset.k, c=(EATC[mk]||[])[+b.dataset.i]; if(!c) return; pl.meals[mk]=Object.assign({},c,{k:"rs_"+mk.replace(":","_"),stay:60}); save();
  try{ ntap(c.src==="ad"?c.id:c.src==="eat"?("eat_"+c.id):("sp_"+(KCODE[c.kind]||"food")),"trip_eat"); }catch(x){} repPaint(); },true);
// ══ 11-07 일정 검사 · 넣기 전 확인 · 직접 식당 찾기 · 저녁 일정 추가 (사장님 설계 — 손님이 정하고 AI는 계산·검사·제안만) ══
//  · 검사(planIssues) — 밤 장소가 낮에(17시 전)·밤 장소가 앞이라 뒤 낮 장소가 밤으로 밀림 · 낮에만 여는 곳이 밤에(영업시간 모를 때 종류별 어림 시각 DAYC 뒤)·문 닫은 뒤·쉬는 날·머무는 동안 마감 · 문 열기를 1시간 넘게 기다림
//    · 도시를 오감(전국 일정) · 하루 끝 넘김 · 점심(11:30 전 시작·14시 뒤 끝)·저녁(17:30 전 시작·20시 뒤 끝) 자리 없음 — 판단은 이미 받은 자료(구글 영업시간·종류)·코드 규칙뿐, 새 호출 없음
//  · 검사 창 — 일정을 짠 직후·바뀐 직후(pl.chk) 한 번. 고를 것: 순서 바꾸기(카트로 가서 그 장소를 눈에 띄게) / 이 장소 빼기 / 그대로 두기(pl.ack — 다시 안 띄움) · 자동으로 고치지 않는다
//    · 11-07 넘치는 날·시간이 안 맞는 낮 장소·쉬는 날은 하루 늘리기 / 다른 날로 옮기기 / 머무는 시간 줄이기 (ckBtns) · 손님이 정한 시작 시각보다 늦음(fix)
//  · 넣기 전 확인(insOpen) — 넣을 자리·머무는 시간·넣으면 끝나는 시각을 먼저 보여 주고 [넣기]/[넣지 않기] · 넣은 곳은 카트에도 같은 자리에(다시 짜도 남게)
var NIGHT_FROM=17*60, DAYC={palace:1080,museum:1080,temple:1080,mount:1020,market:1260,shop:1320,theme:1320};   // 영업시간 모를 때 「보통 이 시각 뒤엔 닫는다」 어림(분) — 궁·박물관·절 18시 · 산 17시 · 시장 21시(야시장 빼고) · 쇼핑·놀이공원 22시
function nightStrong(x,dt){ if(!x||x.eat) return false; if(isBar(x)||PERFK[x.k]||/밤 추천/.test(x.d||"")) return true;
  var wn=(Array.isArray(x.oh)&&x.oh.length)?winOf(x,dt):null; if(wn&&!wn.off&&wn.w.length){ var f=wn.w.filter(function(w){ return w[1]>360&&w[0]<1440; })[0]; if(f&&f[0]>=16*60) return true; } return false; }
function dayOnly(x){ if(!x||x.eat||isNight(x)) return 0; var s=(x.ko||"")+" "+(x.en||""); if(/야시장|night ?market|夜市/i.test(s)) return 0; if(/석굴암|Seokguram|불국사|Bulguksa/i.test(s)) return 1080; return DAYC[catOf(x)]||0; }   // 늦어도 되는 시각(분) · 0 = 판단 안 함
function dLbl(di){ return T((di+1)+"일차","Day "+(di+1)); }
// 장소 한 줄 검사 — 가장 먼저 걸리는 문제 하나 또는 null · 「다른 날로 옮기기」 자리 찾기(mvFind)도 같은 기준 (11-07)
//   fx = 손님이 정한 시작 시각 — 그 시각까지 기다리는 것은 문제로 안 보고(af = 기다린 뒤 시각), 그보다 늦게 닿으면 fix
function rowIss(s,r,ri,dt,di){ var x=r.x; if(!x||x.eat) return null; var ar=r.ar!=null?r.ar:r.t, fx=fxOf(x), af=fx!=null?Math.max(ar,fx):ar, o=openAt(x,dt,af), st=r.st||x.stay;
  if(nightStrong(x,dt)){ if(af<NIGHT_FROM) return {t:"night",k:x.k,di:di,a:af,o:o,w:o!=null?o-af:0};
    var aft=s.rows.slice(ri+1).filter(function(q){ return q.x&&!q.x.eat&&!nightStrong(q.x,dt); }).length; if(aft) return {t:"nfirst",k:x.k,di:di,a:r.t,n:aft};   // 밤 장소가 앞에 있어 뒤 낮 장소들이 밤으로 밀림
    return (fx!=null&&ar>fx)?{t:"fix",k:x.k,di:di,a:ar,f:fx}:null; }
  if(closedOn(x,dt)) return {t:"off",k:x.k,di:di};
  var co=closeOf(x,dt,r.t);
  if(co.last&&co.c!=null&&r.t>co.c) return {t:"last",k:x.k,di:di,a:r.t,c:co.c};
  if(!co.last&&co.c!=null&&co.o!=null&&r.t>=co.c) return {t:"shut",k:x.k,di:di,a:r.t,c:co.c};
  if(fx!=null&&ar>fx) return {t:"fix",k:x.k,di:di,a:ar,f:fx};
  if(o!=null&&o-af>=60&&!isNight(x)) return {t:"early",k:x.k,di:di,a:af,o:o,w:o-af};
  if(!co.last&&co.c!=null&&co.o!=null&&r.t+st>co.c+10) return {t:"cut",k:x.k,di:di,c:co.c,s:co.c-r.t};
  var f0=FACT[x.k], dl=(co.c==null&&!co.eve&&!(f0&&f0.last))?dayOnly(x):0; if(dl&&r.t>=dl) return {t:"late",k:x.k,di:di,a:r.t};   // 공식 입장 마감이 없는 곳(종묘·창경궁 — 쉬는 요일만 앎)도 종류별 어림 (11-07 — 옮기기 자리 찾기가 종묘를 18시 넘어 넣었다)
  return null; }
function planIssues(pl,H,DS){ var out=[]; if(!pl||!pl.days) return out;
  if(pl.mc&&Array.isArray(pl.cities)){ var vis={}, pc=-1, rt=[], zs=[];   // 도시를 오가는 순서(손님 순서 그대로 둔 것)
    pl.days.forEach(function(d,di){ var c=d.c; if(c==null||c<0||c===pc) return; rt.push(c);
      if(vis[c]){ var k0=null; for(var q=di;q<pl.days.length&&!k0;q++){ if(pl.days[q].c!==c) break; k0=pl.days[q].stops.filter(function(z){ return pl.pool[z]; })[0]||null; } zs.push({t:"zig",k:k0,di:di,c:c}); }
      vis[c]=1; pc=c; });
    zs.forEach(function(q){ q.rt=rt; out.push(q); }); }
  pl.days.forEach(function(d,di){ if(d.md) return; var Q=DS&&DS[di], X=Q?Q.X:dayX(pl,di,H), arr=Q?Q.arr:X.arr; if(!arr.length) return;
    var dt=X.dt, mo=moX(di,X), lv=Q?Q.lv:liveLv(pl,di,X.H,arr,dt,mo,X.from); if(lv) return;   // 오늘 실제 기록으로 다시 계산하는 날은 실시간 조정(70% 주의 창)이 맡는다
    var s=Q?Q.s:sched(X.H,arr,dt,X.from,mo), lim=Q?Q.lim:dayLim(pl,d,X.H,arr,dt,X);
    s.rows.forEach(function(r,ri){ var q=rowIss(s,r,ri,dt,di); if(q) out.push(q); });
    if(s.end>lim&&hardLim(X,lim)) out.push({t:"over",di:di,e:s.end,lim:lim,nt:lim>((d.gap&&d.gap.until)||X.to||pl.to)?1:0,hb:hE(X.H)?1:0});   // nt = 밤 장소 날(기준이 손님이 정한 시각이 아니라 밤 장소 시각) — 기준 시각 없이 실제 도착만 (11-07)
    var hasK=function(K){ return s.rows.some(function(r){ return r.meal===K||(r.x&&r.x.eat&&r.x.meal===K); }); };
    });   // 11-08 사장님 「못 먹으면 건너뛴다 · 강요하지 않는다」 — 점심·저녁 자리 없음은 검사 창에 안 올린다
  out.forEach(function(q){ q.sig=q.t+":"+(q.k||"")+":"+q.di+":"+(q.K||""); });
  return out; }
function chkAll(DS){ var pl=TR.plan; if(!pl) return []; return withLC(function(){ return planIssues(pl,REPH||pl.H||null,DS); }); }
function chkList(DS){ var pl=TR.plan, A=(pl&&pl.ack)||{}; return chkAll(DS).filter(function(q){ return !A[q.sig]; }); }
// 검사 창 단추가 다루는 장소 — 장소 문제는 그 장소 · 시간이 넘치는 날(over)은 그날 마지막 장소(손님이 넣은 식당 빼고) (11-07)
function ovLast(pl,di){ var d=pl&&pl.days[di]; if(!d) return null; var a=d.stops.filter(function(k){ var x=pl.pool[k]; return x&&!x.eat; }); return a.length?a[a.length-1]:null; }
function ckK(pl,q){ return q.k||(q.t==="over"?ovLast(pl,q.di):null); }
// 검사 창 단추 (사장님 11-07) — 넘치는 날: 하루 늘리기·마지막 장소 다른 날로·빼기 · 낮 장소가 안 맞는 시각(밤에 잡힘·마감 뒤·입장 마감·머무는 동안 마감·정한 시각보다 늦음): 다른 날로·머무는 시간 줄이기·빼기
//   쉬는 날: 다른 날로·빼기 · 밤 장소가 낮에·문 열기 기다림·도시 오감·식사는 예전 그대로 · 모든 줄에 그대로 두기
// 일찍 출발 — 정한 시각보다 늦는 분만큼 그날 출발을 당긴다(05:00 보다 이르면 안 권함) → {late, ns}
function ckEarly(pl,q){ var X=dayX(pl,q.di,REPH||pl.H||null), late=(q.a||0)-(q.f||0), ns=X.from-late; if(X.pre&&X.pre.some(function(r){ return r.ap||r.tr; })) return null; return (late>0&&ns>=300)?{late:late,ns:ns}:null; }   // 비행기·아침 도시 이동으로 시작이 정해진 날(도착한 날 등)은 안 권함 (11-07)
function ckBtns(pl,q,x){ var K=[["keep",CK6.bKeep]];
  if(q.t==="over") return [pl.days.length<MAXD?["add",FX6.bAdd]:null,x?["mv",FX6.bMv]:null,x?["drop",CK6.bDrop]:null].filter(Boolean).concat(K);
  if(q.t==="meal") return [["eat",CK6.bEat]].concat(K);
  if(q.t==="zig") return x?[["ord",CK6.bOrd]].concat(K):K;
  if(/^(late|shut|last|cut|fix)$/.test(q.t)){ var d0=pl.days[q.di], ks=d0?d0.stops.filter(function(k){ return pl.pool[k]&&!pl.pool[k].eat; }):[], first=!!x&&ks.indexOf(x.k)<=0, B=[];
    if(q.t==="fix"){ var e0=ckEarly(pl,q); if(e0) B.push(["early",fill6(FX6.bEarly,{m:durTxt(e0.late),t:m2hm(e0.ns)})]); }   // 늦는 만큼 그날 일찍 출발 (11-07 사장님)
    B.push(["mv",FX6.bMv]); if(!first) B.push(["short",FX6.bSh]); B.push(["drop",CK6.bDrop]); return B.concat(K); }   // 그날 첫 장소면 「머무는 시간 줄이기」는 소용없어 뺀다 (앞에 줄일 곳이 없다)
  if(q.t==="off") return [["mv",FX6.bMv],["drop",CK6.bDrop]].concat(K);
  return [["ord",CK6.bOrd],["drop",CK6.bDrop]].concat(K); }
function issTxt(pl,q){ var dd=pl.days[q.di], dt=dd?new Date(dd.date+"T00:00:00Z"):null, v={a:m2hm(q.a||0),o:q.o!=null?m2hm(q.o):"",w:durTxt(Math.max(0,q.w||0)),c:q.c!=null?m2hm(q.c):"",s:durTxt(Math.max(0,q.s||0)),f:q.f!=null?m2hm(q.f):""};
  if(q.t==="fix") return gTxt(FX6.fix,v);
  if(q.t==="night") return gTxt(CK6.night,v)+" — "+(q.o!=null&&q.w>0?gTxt(CK6.nightW,v):T5(CK6.nightU));
  if(q.t==="nfirst") return gTxt(CK6.nfirst,{a:v.a,n:q.n});
  if(q.t==="off") return gTxt(CK6.off,{d:dt?dateTxt(dt):""});
  if(q.t==="zig") return gTxt(CK6.zig,{r:(q.rt||[]).map(function(c){ return cnm(pl.cities[c]); }).join(" → "),p:q.k&&pl.pool[q.k]?nm(pl.pool[q.k]):"—",c:cnm(pl.cities[q.c])});
  if(q.t==="over") return q.nt?gTxt(q.hb?CK6.overN:CK6.overN2,{e:m2hm(q.e)}):gTxt(CK6.over,{e:m2hm(q.e),t:m2hm(q.lim)});
  if(q.t==="meal") return T5(q.K==="lunch"?CK6.mealL:CK6.mealD);
  return CK6[q.t]?gTxt(CK6[q.t],v):""; }
// 검사 창 — after = 바뀐 뒤 다시 검사(문제 없으면 한 줄 알림)
function chkOpen(after){ var old=document.getElementById("trChk"); if(old) old.remove(); var L=chkList();
  if(!L.length){ if(after) lgToast(T5(CK6.cOk)); return null; }
  var b=document.createElement("div"); b.id="trChk"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ var pl=TR.plan, L2=chkList(); if(!pl||!L2.length){ b.remove(); return; }
    b.innerHTML='<div class="tchkbox"><div class="talh">⚠ '+esc(T5(CK6.cT))+'</div><div class="tals">'+esc(T5(after?CK6.cI2:CK6.cI))+'</div>'+L2.map(function(q){ var tk=ckK(pl,q), x=tk&&pl.pool[tk];   // 넘치는 날은 그날 마지막 장소
      var bt=ckBtns(pl,q,x);
      return '<div class="tchkc"><div class="tchkh"><b>'+esc(dLbl(q.di))+'</b>'+(x?' · '+esc(q.t==="over"?gTxt(FX6.lastP,{p:nm(x)}):nm(x)):'')+'</div><div class="tchkm">'+esc(issTxt(pl,q))+'</div><div class="tgr">'
        +bt.map(function(a,i){ return '<button type="button" class="trbtn'+(i===0&&a[0]!=="keep"?' pri':'')+'" data-ck="'+a[0]+'" data-sig="'+esc(q.sig)+'">'+esc(T5(a[1]))+'</button>'; }).join("")+'</div></div>'; }).join("")
      +'<button type="button" class="talx" data-ck="x">'+esc(T5(LV6.x))+'</button></div>'; };
  b._rb=draw; draw(); document.body.appendChild(b); try{ ntap("_trip","trip_check"); }catch(e){} return b; }
// 장소 빼기 — 카트와 일정 모두에서(다른 날·순서는 그대로) · 다시 검사
function dropPlace(k){ if(!k) return; var pl=TR.plan; TR.items=TR.items.filter(function(x){ return x.k!==k; }); if(HLK===k) HLK=null;
  if(pl){ pl.days.forEach(function(d){ d.stops=d.stops.filter(function(q){ return q!==k; }); if(d.post) d.post=d.post.filter(function(q){ return q!==k; }); }); delete pl.pool[k]; pl.chk=2; } save(); refresh(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trChk [data-ck], #trRep [data-ck]"); if(!a) return; e.preventDefault(); var v=a.dataset.ck, pl=TR.plan, b=document.getElementById("trChk");
  if(v==="x"){ if(b) b.remove(); return; } if(v==="open"){ chkOpen(false); return; } if(!pl) return;
  var q=chkList().filter(function(z){ return z.sig===a.dataset.sig; })[0]; if(!q){ if(b&&b._rb) b._rb(); return; }
  try{ ntap("_trip","check_"+v); }catch(z){}
  if(v==="keep"){ pl.ack=pl.ack||{}; pl.ack[q.sig]=1; save(); if(b&&b._rb) b._rb(); if(document.getElementById("trRep")) repPaint(); return; }
  if(v==="ord"||v==="cart"){ if(b) b.remove(); HLK=v==="ord"?q.k:null; sheetClose("trRep"); openPanel(); return; }
  var tk=ckK(pl,q);   // 넘치는 날은 그날 마지막 장소 (11-07)
  if(v==="drop"){ var nx=tk&&pl.pool[tk]?nm(pl.pool[tk]):""; dropPlace(tk); lgToast(gTxt(CK6.dropD,{p:nx})); if(document.getElementById("trRep")) repPaint(); else if(b&&b._rb) b._rb(); return; }
  if(v==="add"){ dayUp(a); return; }
  if(v==="mv"){ if(!tk||!pl.pool[tk]) return; if(b) b.remove(); mvOpen(q.di,tk); return; }
  if(v==="short"){ if(b) b.remove(); stOpen(q.di,tk); return; }
  if(v==="early"){ var e1=ckEarly(pl,q); if(!e1) return; pl.days[q.di].fr=e1.ns; pl.chk=2; save(); refresh(); lgToast(gTxt(FX6.earlyD,{d:dLbl(q.di),t:m2hm(e1.ns)})); if(document.getElementById("trRep")) repPaint(); if(b) b.remove(); chkOpen(true); return; }
  if(v==="eat"){ if(b) b.remove(); efOpen({di:q.di,K:q.K,pos:mealPos(pl,q.di,q.K)}); } },true);
// 하루 늘리기 — 날짜 수 +1 로 「N일로 다시 짜기」(data-sugn)와 같은 길(여행 일수 칸을 바꾼 것과 같게 → 「일정 짜기」) · 전국 일정은 natAlloc 이 넘치는 도시에 날을 준다 · 다시 짠 뒤 검사 창은 「다시 검사」로
var DAYUP=0;
function dayUp(btn){ var pl=TR.plan; if(!pl) return; var n=pl.days.length+1; if(n>MAXD) return;
  if(btn){ btn.disabled=true; btn.textContent=T("짜는 중…","Planning…"); }
  DAYUP=1; TR.opt.n=n; TR.plan=null; save(); planGo(); }
// ── 다른 날로 옮기기 (11-07) — 다른 날마다 그 장소를 넣을 수 있는 자리를 다 넣어 보고, 그 장소가 시간에 맞는(rowIss 문제 없음 · 문 열기 기다림은 괜찮음) 자리 중 그날이 가장 덜 늘어나는 곳
//   그날 다른 장소 순서는 손님이 정한 그대로(이 장소만 끼워 넣음) · 그 때문에 그날 다른 장소가 새로 안 맞게 되면 뒤로(1곳당 1000분) · 전국 일정은 같은 도시 날만(다른 도시 날은 「다른 도시」)
var MVS=null;
function mvFind(pl,di,k){ var H0=REPH||pl.H||null, x=pl.pool[k], src=pl.days[di]; if(!x||!src) return [];
  var cnt=function(s,dt,dj,skip){ var n=0; s.rows.forEach(function(r,ri){ if(!r.x||r.x===skip) return; var q=rowIss(s,r,ri,dt,dj); if(q&&q.t!=="early") n++; }); return n; };
  return pl.days.map(function(d,dj){ if(dj===di||d.md) return null; var o={dj:dj,d:d,b:null,arr:[]};
    if(pl.mc&&d.c!==src.c){ o.city=1; return o; }
    var X=dayX(pl,dj,H0), arr=X.arr.filter(function(y){ return y!==x; }), dt=X.dt, mo=moX(dj,X), s0=sched(X.H,arr,dt,X.from,mo), b0=cnt(s0,dt,dj,null), best=null;
    for(var p=0;p<=arr.length;p++){ var tr=arr.slice(0,p).concat([x],arr.slice(p)), s=sched(X.H,tr,dt,X.from,mo), r=null, ri=-1;
      s.rows.forEach(function(q,i){ if(q.x===x){ r=q; ri=i; } }); if(!r) continue;
      var iq=rowIss(s,r,ri,dt,dj); if(iq&&iq.t!=="early") continue;
      var oth=Math.max(0,cnt(s,dt,dj,x)-b0), c=(s.end-s0.end)+oth*1000;
      if(!best||c<best.c) best={c:c,p:p,t:r.t,oth:oth,e:s.end}; }
    o.b=best; o.arr=arr; return o; }).filter(Boolean); }
// 짤 때 정한 시작 시각 지키기 (11-07 사장님 「알리기만 하지 말고 짤 때 피해라」) — 날짜를 나눈 뒤 fx 가 있는 곳이 그날 fx 까지 못 닿으면(일찍 닿아 기다리는 건 괜찮음)
//   같은 도시의 다른 날에 모든 자리를 넣어 보아 fx 까지 닿는 자리로 — 가장 이른 날 → 그 안에서 가장 덜 늘어나는 자리 · 그날 다른 장소 순서는 그대로(mvFind 와 같은 셈: 그 장소 문제 없음(문 열기 기다림은 괜찮음) · 다른 장소가 새로 안 맞게 되면 X)
//   옮긴 것 pl.fxm[키]={f:원래 날,t:옮긴 날,x:정한 시각,a:도착한 날이면 1} — 그 장소 줄에 한 줄 · 어느 날도 안 되면 그대로(검사 창 「정한 … 보다 늦은 …」) · 식사 칸 없이 잰다(짤 때와 같게)
function fxSpot(pl,di,x,H){ var src=pl.days[di], fx=fxOf(x), best=null;
  var cnt=function(s,dt,dj){ var n=0; s.rows.forEach(function(r,ri){ if(!r.x||r.x===x) return; var q=rowIss(s,r,ri,dt,dj); if(q&&q.t!=="early") n++; }); return n; };
  for(var dj=0;dj<pl.days.length&&!best;dj++){ var d=pl.days[dj]; if(d.md||dj===di||(pl.mc&&d.c!==src.c)) continue;
    var X=dayX(pl,dj,H); if(X.rest&&!X.arr.length) continue;   // 밤에 도착해 쉬는 날엔 안 넣는다
    var arr=X.arr.filter(function(y){ return y!==x; }), dt=X.dt, mo={to:X.to}, s0=sched(X.H,arr,dt,X.from,mo), b0=cnt(s0,dt,dj);
    for(var p=0;p<=arr.length;p++){ var s=sched(X.H,arr.slice(0,p).concat([x],arr.slice(p)),dt,X.from,mo), r=null, ri=-1;
      s.rows.forEach(function(q,i){ if(q.x===x){ r=q; ri=i; } }); if(!r||(r.ar!=null?r.ar:r.t)>fx) continue;
      var iq=rowIss(s,r,ri,dt,dj); if(iq&&iq.t!=="early") continue; if(cnt(s,dt,dj)>b0) continue;
      var c=s.end-s0.end; if(!best||c<best.c) best={dj:dj,p:p,c:c}; } }
  return best; }
// 11-07 사장님 「가」 — 시작 시각보다 이른 도착 시각(예: 시작 09:30, N서울타워 09:00)이라 어느 날도 그 시각에 도착할 수 없으면(fxSpot 실패) 그 장소가 있는 날만 출발을 알아서 당긴다(d.fr — 검사 창 「일찍 출발하기」와 같은 칸)
//   그날이 비행기·아침 도시 이동에 묶인 날(도착한 날 등)이면 같은 도시의 묶이지 않은 가장 이른 날로 옮겨서 당긴다(가장 덜 당기는 자리) · 05:00 보다 이르면 안 함 · 그날 다른 장소가 새로 안 맞게 되면 안 함
//   → {dj,p(-1 = 그날 그 자리 그대로),ns:새 출발,f0:원래 출발} · 당긴 날 d.fra={k,x:도착 시각,t:출발} = 그날 맨 위 한 줄 「「…」 09:00 도착에 맞춰 08:33에 출발해요」
function frBound(X){ return !!(X&&X.pre&&X.pre.some(function(r){ return r.ap||r.tr; })); }
function fxEarly(pl,di,x,H){ var src=pl.days[di], fx=fxOf(x), best=null, X0=dayX(pl,di,H), own=!frBound(X0);
  var cnt=function(s,dt,dj){ var n=0; s.rows.forEach(function(r,ri){ if(!r.x||r.x===x) return; var q=rowIss(s,r,ri,dt,dj); if(q&&q.t!=="early") n++; }); return n; }, arOf=function(r){ return r.ar!=null?r.ar:r.t; };
  for(var dj=0;dj<pl.days.length&&!best;dj++){ var d=pl.days[dj]; if(own?dj!==di:(dj===di||(pl.mc&&d.c!==src.c))) continue;
    if(pl.days[dj].md) continue; var X=dj===di?X0:dayX(pl,dj,H); if(frBound(X)||(X.rest&&!X.arr.length)) continue;
    var arr=X.arr.filter(function(y){ return y!==x; }), dt=X.dt, mo={to:X.to}, b0=cnt(sched(X.H,dj===di?X.arr:arr,dt,X.from,mo),dt,dj), ps=[-1];
    if(dj!==di){ ps=[]; for(var q=0;q<=arr.length;q++) ps.push(q); }
    ps.forEach(function(p){ var tr=p<0?X.arr:arr.slice(0,p).concat([x],arr.slice(p)), ns=X.from, s=null, r=null, ri=-1;
      for(var it=0;it<4;it++){ s=sched(X.H,tr,dt,ns,mo); r=null; ri=-1; s.rows.forEach(function(q2,i2){ if(q2.x===x){ r=q2; ri=i2; } }); if(!r) return; var late=arOf(r)-fx; if(late<=0) break; ns=Math.floor(ns-late); if(ns<300) return; }   // 앞 장소가 문 열기를 기다리면 당긴 만큼 다 안 당겨지니 몇 번 더
      if(arOf(r)>fx) return; var iq=rowIss(s,r,ri,dt,dj); if(iq&&iq.t!=="early") return; if(cnt(s,dt,dj)>b0) return;
      var c=(X.from-ns)*1000+(s.end-ns); if(!best||c<best.c) best={dj:dj,p:p,ns:ns,f0:X.from,c:c}; }); }
  return best; }
function fxFix(pl,H){ var done={};
  for(var di=0;di<pl.days.length;di++){ var d=pl.days[di];
    for(var i=0;i<d.stops.length;i++){ var k=d.stops[i], x=pl.pool[k], fx=fxOf(x); if(fx==null||x.eat||done[k]) continue;
      var X=dayX(pl,di,H), s=sched(X.H,X.arr,X.dt,X.from,{to:X.to}), r=null; s.rows.forEach(function(q){ if(q.x===x) r=q; }); if(!r||(r.ar!=null?r.ar:r.t)<=fx) continue;
      var b=fxSpot(pl,di,x,H), e=null; if(!b){ e=fxEarly(pl,di,x,H); if(!e) continue; b={dj:e.dj,p:e.p}; }   // 다른 날로 옮겨도 안 되면 출발을 당긴다 (11-07)
      if(b.dj!==di){ d.stops.splice(i,1); i--; var d2=pl.days[b.dj], a2=d2.stops.filter(function(q){ return pl.pool[q]; }), at=b.p<=0?(a2.length?d2.stops.indexOf(a2[0]):0):(b.p>=a2.length?d2.stops.length:d2.stops.indexOf(a2[b.p])); d2.stops.splice(at<0?d2.stops.length:at,0,k);   // mvStop 과 같은 자리 셈
        (pl.fxm=pl.fxm||{})[k]={f:di,t:b.dj,x:fx,a:(pl.mc&&di===0&&pl.ap&&pl.ap.a)?1:0}; }
      if(e&&e.ns<e.f0){ var de=pl.days[e.dj]; de.fr=e.ns; de.fra={k:k,x:fx,t:e.ns}; }
      done[k]=1; } } }
function mvOpen(di,k){ var pl=TR.plan; if(!pl||!k||!pl.pool[k]||!pl.days[di]) return; MVS={di:di,k:k}; var old=document.getElementById("trMv"); if(old) old.remove();
  var b=document.createElement("div"); b.id="trMv"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); }; b._rb=mvPaint; document.body.appendChild(b); mvPaint(); try{ ntap("_trip","check_mvopen"); }catch(z){} }
function mvPaint(){ var b=document.getElementById("trMv"), pl=TR.plan, o=MVS; if(!b||!pl||!o||!pl.pool[o.k]||!pl.days[o.di]){ if(b) b.remove(); return; } var x=pl.pool[o.k], fx=fxOf(x);
  var L=withLC(function(){ return mvFind(pl,o.di,o.k); }); o.L=L; var any=L.some(function(q){ return q.b; });
  var rows=L.map(function(q){ var dt=new Date(q.d.date+"T00:00:00Z"), cty=pl.mc&&pl.cities&&pl.cities[q.d.c]?cnm(pl.cities[q.d.c]):"", hd='<b>'+esc(dLbl(q.dj))+(cty?' ('+esc(cty)+')':'')+'</b> <i>'+esc(dateTxt(dt))+'</i>';
    if(!q.b) return '<div class="mvd no">'+hd+'<span class="mvm">'+esc(q.city?T5(FX6.mCity):fx!=null?gTxt(FX6.mNoF,{f:m2hm(fx)}):T5(FX6.mNo))+'</span></div>';
    var A=q.arr, p=q.b.p, py=A[p-1], ps=p===0?T5(CK6.p0):gTxt(CK6.pN,{n:p,p:py.eat?eatName(py):nm(py)})+(p===A.length?T5(CK6.pE):"");
    return '<button type="button" class="mvd" data-mv="'+q.dj+'">'+hd+'<span class="mvok">'+esc(gTxt(FX6.mOk,{t:m2hm(q.b.t)}))+' · '+esc(ps)+'</span><span class="mvp">'+insPrev(pl,{di:q.dj,item:x},p,x.stay)+(q.b.oth?' <b class="insov">⚠ '+esc(gTxt(FX6.mOth,{n:q.b.oth}))+'</b>':'')+'</span></button>'; }).join("");
  b.innerHTML='<div class="mvbox"><div class="talh" style="color:var(--ink)">'+esc(gTxt(FX6.mT,{p:nm(x)}))+'</div>'+(any?'<div class="tals">'+esc(T5(FX6.mI))+'</div>':'')+rows
    +(any?'':'<div class="mvnone"><b>'+esc(T5(FX6.mNone))+'</b><div class="tgr">'+(pl.days.length<MAXD?'<button type="button" class="trbtn pri" data-mvx="add">'+esc(T5(FX6.bAdd))+'</button>':'')+'<button type="button" class="trbtn" data-mvx="drop">'+esc(T5(CK6.bDrop))+'</button></div></div>')
    +'<button type="button" class="talx" data-mvx="x">'+esc(T5(LV6.x))+'</button></div>'; }
// 옮기기 — 그날(di)에서 빼서 dj 의 p 번째 자리(그 장소를 뺀 그날 장소 기준 — insStop 과 같은 셈)에 · 카트 순서도 그 앞 장소 다음으로(다시 짜도 그 날 쪽에 남게, insStop 처럼) · 다시 검사
function mvStop(pl,di,dj,p,k){ var s=pl.days[di], d=pl.days[dj]; if(!s||!d||!pl.pool[k]) return false;
  s.stops=s.stops.filter(function(q){ return q!==k; }); d.stops=d.stops.filter(function(q){ return q!==k; });
  var arr=d.stops.filter(function(q){ return pl.pool[q]; }), at=p<=0?(arr.length?d.stops.indexOf(arr[0]):0):(p>=arr.length?d.stops.length:d.stops.indexOf(arr[p])); d.stops.splice(at<0?d.stops.length:at,0,k);
  var ix=-1, i; for(i=0;i<TR.items.length;i++) if(TR.items[i].k===k){ ix=i; break; }
  if(ix>=0){ var it=TR.items.splice(ix,1)[0], ks=TR.items.map(function(y){ return y.k; }), to=-1, near=function(q,last){ var z=pl.days[q].stops.filter(function(w){ return ks.indexOf(w)>=0; }); return z.length?ks.indexOf(z[last?z.length-1:0])+(last?1:0):-1; };
    if(arr.length){ if(p<=0) to=ks.indexOf(arr[0]); else { var a1=ks.indexOf(arr[Math.min(p,arr.length)-1]); to=a1<0?-1:a1+1; } }
    else { for(i=dj-1;i>=0&&to<0;i--) to=near(i,1); for(i=dj+1;i<pl.days.length&&to<0;i++) to=near(i,0); }   // 빈 날 — 앞 날 마지막 장소 다음, 없으면 뒤 날 첫 장소 앞
    TR.items.splice(to<0?TR.items.length:to,0,it); }
  pl.chk=2; save(); refresh(); return true; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trMv [data-mv],#trMv [data-mvx]"); if(!a) return; e.preventDefault(); var b=document.getElementById("trMv"), o=MVS, pl=TR.plan; if(!o||!pl||!pl.pool[o.k]){ if(b) b.remove(); return; }
  var v=a.dataset.mvx, nx=nm(pl.pool[o.k]);
  if(v==="x"){ if(b) b.remove(); return; }
  if(v==="add"){ if(b) b.remove(); try{ ntap("_trip","check_add"); }catch(z){} dayUp(null); return; }
  if(v==="drop"){ if(b) b.remove(); try{ ntap("_trip","check_drop"); }catch(z){} dropPlace(o.k); lgToast(gTxt(CK6.dropD,{p:nx})); if(document.getElementById("trRep")) repPaint(); else chkOpen(true); return; }
  var dj=+a.dataset.mv, q=(o.L||[]).filter(function(z){ return z.dj===dj; })[0]; if(!q||!q.b) return;
  if(mvStop(pl,o.di,dj,q.b.p,o.k)){ try{ ntap("_trip","check_mvday"); }catch(z){} }
  if(b) b.remove(); MVS=null; lgToast(gTxt(FX6.mD,{p:nx,d:dLbl(dj)}));
  if(document.getElementById("trRep")) repPaint(); else chkOpen(true); },true);
// ── 머무는 시간 줄이기 (11-07) — 그날 장소마다 카트와 같은 머무는 시간 칸(stayOpts 30분~8시간) · 바꾸면 카트·일정 같은 값(um, 카트 칸과 같은 길)
//   아래에 그 장소가 이제 시간에 맞는지·그날 끝 시각 · [다시 검사하기]·바깥 누름 = 닫고(바꿨으면) 다시 그리고 다시 검사
var STS=null;
function stOpen(di,k){ var pl=TR.plan; if(!pl||!pl.days[di]) return; STS={di:di,k:k,ch:0}; var old=document.getElementById("trSt"); if(old) old.remove();
  var b=document.createElement("div"); b.id="trSt"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) stClose(); }; b._rb=stPaint; document.body.appendChild(b); stPaint(); }
function stSet(k,m){ if(!(m>0)) return; var pl=TR.plan, it=TR.items.filter(function(x){ return x.k===k; })[0]; if(it) it.um=m; if(pl&&pl.pool&&pl.pool[k]){ pl.pool[k].um=m; pl.pool[k].stay=m; pl.chk=2; } save(); }
function stClose(go){ var b=document.getElementById("trSt"), o=STS; if(b) b.remove(); STS=null; if(!o||!TR.plan||!(o.ch||go)) return; if(o.ch&&document.getElementById("trRep")) repPaint(); else chkOpen(true); }   // go = [다시 검사하기] — 안 바꿨어도 검사 창을 다시
function stPaint(){ var b=document.getElementById("trSt"), pl=TR.plan, o=STS; if(!b||!pl||!o||!pl.days[o.di]){ if(b) b.remove(); return; }
  var di=o.di, X=dayX(pl,di,REPH||pl.H||null), dt=X.dt, x=o.k?pl.pool[o.k]:null, iq=null, n=0, s=withLC(function(){ return sched(X.H,X.arr,dt,X.from,moX(di,X)); }), lim=withLC(function(){ return dayLim(pl,pl.days[di],X.H,X.arr,dt,X); }), d=pl.days[di];
  var li=s.rows.map(function(r,ri){ var y=r.x; if(!y) return ""; if(y===x) iq=rowIss(s,r,ri,dt,di); if(!y.eat) n++;
    return '<div class="stl'+(y===x?' on':'')+'"><span class="tt">'+m2hm(r.t)+'</span><span class="stn">'+(y.eat?MPIMG("mi_food",MIS)+esc(eatName(y)):'<b class="tno">'+n+'</b> '+esc(nm(y)))+'</span><select class="trsl2" data-k="'+esc(y.k)+'">'+stayOpts(y.stay,30,480)+'</select></div>'; }).join("");
  var nt=lim>((d.gap&&d.gap.until)||X.to||pl.to), st=x?(iq&&iq.t!=="early"?'<b class="insov">⚠ '+esc(issTxt(pl,iq))+'</b>':'<b class="stok2">✓ '+esc(gTxt(FX6.sOk,{p:nm(x)}))+'</b>')+'<br>':'';   // nt = 밤 장소 날(기준 시각 없이 끝 시각만)
  b.innerHTML='<div class="mvbox"><div class="talh" style="color:var(--ink)">'+esc(gTxt(FX6.sT,{d:dLbl(di)}))+'</div><div class="d" style="margin:0 0 4px">'+esc(dateTxt(dt))+'</div>'+(x?'<div class="tals">'+esc(gTxt(FX6.sI,{p:nm(x)}))+'</div>':'')+li
    +'<div class="insp">'+st+esc(gTxt(FX6.sEnd,{e:m2hm(s.end)}))+(s.end>lim&&!nt?' <b class="insov">⚠ '+esc(gTxt(CK6.iOver,{t:m2hm(lim)}))+'</b>':'')+'</div>'
    +'<div class="talb"><button type="button" data-st="go">'+esc(T5(FX6.sGo))+'</button></div></div>';
  [].forEach.call(b.querySelectorAll(".trsl2"),function(sl){ sl.onchange=function(){ stSet(sl.dataset.k,+sl.value); o.ch=1; var bx=b.firstChild, sc=bx?bx.scrollTop:0; stPaint(); if(b.firstChild) b.firstChild.scrollTop=sc; }; });
  b.querySelector("[data-st=go]").onclick=function(){ try{ ntap("_trip","check_short"); }catch(z){} stClose(1); }; }
// 식사를 넣을 자리 기본값 — 점심 12:30 · 저녁 17:30 전에 끝나는 장소 다음
function mealPos(pl,di,K){ var X=dayX(pl,di,REPH||pl.H||null), s=sched(X.H,X.arr,X.dt,X.from,moX(di,X)), tg=K==="lunch"?ML.lunch.c:ML.dinner.lo, j=0; s.rows.forEach(function(r){ if(r.x&&r.t+(r.st||r.x.stay)<=tg) j++; }); return j; }
// ── 넣기 전 확인 창 ──
var INS=null;
function insOpen(o){ var pl=TR.plan; if(!pl||!pl.days[o.di]||!o.item) return; INS=o; var old=document.getElementById("trIns"); if(old) old.remove();
  var b=document.createElement("div"); b.id="trIns"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); }; b._rb=insPaint; document.body.appendChild(b); insPaint(); }
function insPrev(pl,o,pos,stay){ return withLC(function(){ var X=dayX(pl,o.di,REPH||pl.H||null), arr=X.arr, mo=moX(o.di,X), cur=sched(X.H,arr,X.dt,X.from,mo), it=Object.assign({},o.item,{stay:stay}), tr=arr.slice(0,pos).concat([it],arr.slice(pos)), s=sched(X.H,tr,X.dt,X.from,mo), lim=dayLim(pl,pl.days[o.di],X.H,tr,X.dt,X);
  var d0=pl.days[o.di], nt=lim>((d0.gap&&d0.gap.until)||X.to||pl.to);   // 밤 장소 날은 기준 시각 없이 (11-07)
  return esc(gTxt(CK6.iPrev,{e:m2hm(s.end),c:m2hm(cur.end)}))+(s.end>lim?' <b class="insov">⚠ '+esc(nt?gTxt(hE(X.H)?CK6.overN:CK6.overN2,{e:m2hm(s.end)}):gTxt(CK6.iOver,{t:m2hm(lim)}))+'</b>':''); }); }
function insPaint(){ var b=document.getElementById("trIns"), pl=TR.plan, o=INS; if(!b||!pl||!o||!pl.days[o.di]){ if(b) b.remove(); return; } if(o.post){ insPaintPost(b,pl,o); return; }   // 11-08 도착 후 일정
  var X=dayX(pl,o.di,REPH||pl.H||null), arr=X.arr, it=o.item;
  var s0=b.querySelector("#tiPos"), s1=b.querySelector("#tiStay"), pos=s0?+s0.value:o.pos, stay=s1?+s1.value:o.stay;   // 언어를 바꿔 다시 그릴 때 고른 값 그대로
  var ud0=(s1&&/^d\d+$/.test(s1.value))?+s1.value.slice(1):0;   // 11-08 일 단위 (템플스테이 등)
  if(!(pos>=0&&pos<=arr.length)) pos=arr.length; if(!(stay>0)) stay=o.kind==="eat"?60:stayOf(it);
  var opts='<option value="0"'+(pos===0?' selected':'')+'>'+esc(T5(CK6.p0))+'</option>'+arr.map(function(x,i){ return '<option value="'+(i+1)+'"'+(pos===i+1?' selected':'')+'>'+esc(gTxt(CK6.pN,{n:i+1,p:x.eat?eatName(x):nm(x)})+(i===arr.length-1?T5(CK6.pE):''))+'</option>'; }).join("");
  b.innerHTML='<div class="insbox"><div class="talh" style="color:var(--ink)">'+esc(T5(CK6.iT))+'</div><div class="d" style="margin:0 0 4px">'+esc(dLbl(o.di))+' · '+esc(dateTxt(X.dt))+'</div>'
    +'<div class="insn">'+(o.kind==="eat"?MPIMG("mi_food",MIS)+eatLine(it):'<b>'+esc(nm(it))+'</b> <i>'+esc(kindL(it))+'</i>')+'</div>'
    +'<label class="insl">'+esc(T5(CK6.iPos))+'<select id="tiPos">'+opts+'</select></label>'
    +'<label class="insl">'+esc(T5(CK6.iStay))+'<select id="tiStay">'+stayOpts(stay,30,o.kind==="eat"?180:480,o.kind==="eat"?null:ud0)+'</select></label>'
    +'<div class="trjd" id="tiJd"></div><div class="insp" id="tiPrev"></div>'
    +'<div class="talb"><button type="button" data-ins="go">'+esc(T5(CK6.iGo))+'</button><button type="button" data-ins="no" class="insno">'+esc(T5(CK6.iNo))+'</button></div></div>';
  var upd=function(){ var p2=+b.querySelector("#tiPos").value, sv=b.querySelector("#tiStay").value, s2=+sv, dn=/^d\d+$/.test(sv)?+sv.slice(1):0; b.querySelector("#tiPos").disabled=!!dn;
    if(dn){ b.querySelector("#tiPrev").innerHTML=esc(mdInsTxt(pl,o.di,dn)); b.querySelector("#tiJd").textContent=""; return; }   // 11-08 일 단위 — 그날 다음 날부터 통째로 (자리 고르기 없음)
    b.querySelector("#tiPrev").innerHTML=insPrev(pl,o,p2,s2); b.querySelector("#tiJd").textContent=o.kind==="eat"?"":stayJudge(it,s2); };
  b.querySelector("#tiPos").onchange=upd; b.querySelector("#tiStay").onchange=upd; upd(); }
// 11-08 이미 짠 일정에 「일정 추가」로 일 단위 장소를 넣기 — di 다음 날부터 N일을 통째로(d.md) · 뒤 날들은 N일씩 밀리고, 맨 뒤 자유 일정(떠나는 날 빼고)이 있으면 그만큼 빼서 여행 일수는 그대로(모자라면 그만큼만 늘림)
//   고른 식당(meals)·식당 추천(recs)·AI 설명(ai.days)·열차 칸(tr.di)·옮긴 기록(fxm) 날 번호도 같이 민다 · 카트에도 그날 마지막 장소 다음에(ud=N)
var MDI6={a:{ko:"{d} 다음 날부터 {n}일({b})을 통째로 넣어요.",en:"Adds {n} full days ({b}) right after {d}.",ja:"{d}の翌日から{n}日間（{b}）をまるごと入れます。",zhs:"从{d}的第二天起整段加入{n}天（{b}）。",zht:"從{d}的隔天起整段加入{n}天（{b}）。",es:"Añade {n} días completos ({b}) justo después del {d}."},
 f:{ko:"맨 뒤 자유 일정 {f}일을 써서 여행 일수는 그대로예요.",en:"It uses {f} free day(s) at the end, so your trip length stays the same.",ja:"最後の自由行動{f}日を使うので、旅行日数は変わりません。",zhs:"会用掉最后的{f}天自由活动，旅行天数不变。",zht:"會用掉最後的{f}天自由活動，旅行天數不變。",es:"Usa {f} día(s) libre(s) del final, así que la duración del viaje no cambia."},
 x:{ko:"뒤 일정이 {n}일씩 밀리고, 여행이 {m}일 늘어요.",en:"Later days move back {n} day(s) and your trip gets {m} day(s) longer.",ja:"後ろの日程が{n}日ずつずれ、旅行が{m}日長くなります。",zhs:"后面的行程顺延{n}天，旅行延长{m}天。",zht:"後面的行程順延{n}天，旅行延長{m}天。",es:"Los días siguientes se retrasan {n} día(s) y el viaje se alarga {m} día(s)."}};
function mdFreeN(pl,di){ var n=0, e=pl.days.length-1-((pl.ap&&pl.ap.d)?1:0); for(var q=e;q>di;q--){ var d=pl.days[q]; if(d.md||d.stops.length||d.am!=null||d.pm!=null||d.gap||d.rs) break; n++; } return n; }
function mdInsTxt(pl,di,N){ var f=Math.min(N,mdFreeN(pl,di)), m=N-f; return gTxt(MDI6.a,{d:dLbl(di),n:N,b:udNb(N)})+" "+(m>0?gTxt(MDI6.x,{n:N,m:m}):gTxt(MDI6.f,{f:N})); }
function mdKeys(obj,fn){ if(!obj) return obj; var o2={}; for(var mk in obj){ var p=String(mk).split(":"), q=fn(+p[0]); if(q!=null&&isFinite(q)) o2[q+":"+p.slice(1).join(":")]=obj[mk]; } return o2; }
function mdShiftAll(pl,from,delta,drop){ (pl.tr||[]).forEach(function(t){ if(t.di!=null&&t.di>=from) t.di+=delta; });
  if(pl.fxm) for(var fk in pl.fxm){ var fm=pl.fxm[fk]; if(fm.f>=from) fm.f+=delta; if(fm.t>=from) fm.t+=delta; }
  var fn=function(q){ return (drop!=null&&q===drop)?null:(q>=from?q+delta:q); }; pl.meals=mdKeys(pl.meals,fn); pl.recs=mdKeys(pl.recs,fn); if(pl.mskip) pl.mskip=mdKeys(pl.mskip,fn); if(pl.mno) pl.mno=mdKeys(pl.mno,fn); }
function mdInsert(pl,di,it,N){ var k=it&&it.k, at=di+1; if(!k||!pl.days[di]||pl.pool[k]||!(N>=1)) return false; var f=Math.min(N,mdFreeN(pl,di)), c=pl.days[di].c, i, q;
  var blk=[]; for(i=0;i<N;i++){ var b0={date:"",stops:i===0?[k]:[],md:{k:k,i:i,n:N}}; if(c!=null){ b0.c=c; b0.nc=c; } blk.push(b0); }
  mdShiftAll(pl,at,N,null); pl.days.splice.apply(pl.days,[at,0].concat(blk));
  if(pl.ai&&Array.isArray(pl.ai.days)){ var nn=[]; for(i=0;i<N;i++) nn.push(null); pl.ai.days.splice.apply(pl.ai.days,[at,0].concat(nn)); }
  var rm=0, e=pl.days.length-1-((pl.ap&&pl.ap.d)?1:0);   // 맨 뒤 자유 일정 f일을 뺀다
  for(q=e;q>=at+N&&rm<f;q--){ var d=pl.days[q]; if(d.md||d.stops.length||d.am!=null||d.pm!=null||d.gap||d.rs) break; pl.days.splice(q,1); if(pl.ai&&Array.isArray(pl.ai.days)) pl.ai.days.splice(q,1); mdShiftAll(pl,q+1,-1,q); rm++; }
  pl.days.forEach(function(d2,i2){ d2.date=dayDate(i2).toISOString().slice(0,10); });
  pl.pool[k]=Object.assign({},it,{stay:480,ud:N,ins:1});
  if(!has(k)&&TR.items.length<MAXN){ var ci=Object.assign({},it,{ud:N}); delete ci.stay; delete ci.ins; var ks=TR.items.map(function(x){ return x.k; }), last=null;
    pl.days[di].stops.forEach(function(q2){ if(ks.indexOf(q2)>=0) last=q2; }); TR.items.splice(last?ks.indexOf(last)+1:TR.items.length,0,ci); }
  if(TR.opt.n!==pl.days.length){ var hk0=hKey(), hok=TR.opt.hOk===hk0; TR.opt.n=pl.days.length; if(hok) TR.opt.hOk=hKey(); }   // 여행 일수 칸도 맞춘다(숙소를 고른 표시는 그대로)
  pl.chk=2; save(); refresh(); return true; }
// ── 11-08 사장님 「일정마다 진행·하루미루기·일정취소」 (오늘인 날에만 「나」) ──
//   진행 = 하는 일 없음(알림만) · 하루 미루기 = 오늘은 비워 두고 오늘부터 하루씩 뒤로(맨 뒤 자유 일정 하루를 쓰고, 없으면 여행을 하루 늘림 「가」 — 떠나는 비행기 날짜가 있고 남는 날도 없으면 못 미룸)
//   일정 취소 = 오늘 장소를 일정표에서만 뺀다(카트엔 남음 「가」) · 내일 일정은 그대로
var TD6={t:{ko:"오늘 일정",en:"Today's plan",ja:"今日の予定",zhs:"今天的行程",zht:"今天的行程",es:"Plan de hoy"},
 go:{ko:"진행",en:"Go ahead",ja:"このまま進める",zhs:"照常进行",zht:"照常進行",es:"Seguir"},
 push:{ko:"하루 미루기",en:"Postpone a day",ja:"1日延期",zhs:"推迟一天",zht:"延後一天",es:"Aplazar un día"},
 cx:{ko:"일정 취소",en:"Cancel today",ja:"今日の予定を取り消す",zhs:"取消今天行程",zht:"取消今天行程",es:"Cancelar hoy"},
 goD:{ko:"오늘 일정대로 진행해요",en:"Going ahead with today's plan",ja:"今日の予定どおり進めます",zhs:"按今天的行程进行",zht:"按今天的行程進行",es:"Seguimos con el plan de hoy"},
 pushQ:{ko:"오늘은 비워 두고, 오늘부터 일정을 하루씩 뒤로 미룰까요?",en:"Keep today free and move everything from today back by one day?",ja:"今日は空けて、今日からの予定を1日ずつ後ろにずらしますか？",zhs:"今天空出来，并把从今天起的行程都往后推一天吗？",zht:"今天空出來，並把從今天起的行程都往後延一天嗎？",es:"¿Dejar hoy libre y retrasar un día todo desde hoy?"},
 pushD:{ko:"오늘부터 일정을 하루씩 미뤘어요",en:"Moved your plan back one day from today",ja:"今日からの予定を1日ずつ後ろにずらしました",zhs:"已将今天起的行程推迟一天",zht:"已將今天起的行程延後一天",es:"Retrasamos un día el plan desde hoy"},
 pushX:{ko:"맨 뒤에 남는 날이 없어 여행을 하루 늘렸어요",en:"There was no free day left, so your trip is now one day longer",ja:"空いている日がなかったので、旅行を1日延ばしました",zhs:"最后没有空余的日子，所以旅行延长了一天",zht:"最後沒有空餘的日子，所以旅行延長了一天",es:"No quedaba ningún día libre, así que el viaje dura un día más"},
 pushNo:{ko:"떠나는 비행기 날짜가 정해져 있고 남는 날이 없어 미룰 수 없어요. 「일정 취소」를 써 주세요.",en:"Your departure flight date is fixed and there is no free day left, so this can't be postponed. Use “Cancel today” instead.",ja:"出発便の日付が決まっていて空きの日もないため、延期できません。「今日の予定を取り消す」を使ってください。",zhs:"返程航班日期已定且没有空余的日子，无法推迟。请使用「取消今天行程」。",zht:"回程航班日期已定且沒有空餘的日子，無法延後。請使用「取消今天行程」。",es:"La fecha del vuelo de salida es fija y no queda ningún día libre, así que no se puede aplazar. Usa «Cancelar hoy»."},
 cxQ:{ko:"오늘 일정({n}곳)을 취소할까요? 일정표에서 빠지고 카트에는 남아요. 내일 일정은 그대로예요.",en:"Cancel today's plan ({n} places)? They leave your schedule but stay in your cart. Tomorrow stays the same.",ja:"今日の予定（{n}か所）を取り消しますか？日程からは外れますが、カートには残ります。明日の予定はそのままです。",zhs:"要取消今天的行程（{n}个地点）吗？会从行程中移除，但仍留在购物车中。明天的行程不变。",zht:"要取消今天的行程（{n}個地點）嗎？會從行程中移除，但仍留在購物車中。明天的行程不變。",es:"¿Cancelar el plan de hoy ({n} lugares)? Saldrán del itinerario pero seguirán en tu carrito. Mañana no cambia."},
 cxd:{ko:"일정 취소",en:"Cancel this day",ja:"この日の予定を取り消す",zhs:"取消当天行程",zht:"取消當天行程",es:"Cancelar este día"},
 goDd:{ko:"{d} 일정대로 진행해요",en:"Going ahead with the plan for {d}",ja:"{d}の予定どおり進めます",zhs:"按{d}的行程进行",zht:"按{d}的行程進行",es:"Seguimos con el plan del {d}"},
 pushQd:{ko:"{d}는 비워 두고, {d}부터 일정을 하루씩 뒤로 미룰까요?",en:"Keep {d} free and move everything from {d} back by one day?",ja:"{d}は空けて、{d}からの予定を1日ずつ後ろにずらしますか？",zhs:"{d}空出来，并把从{d}起的行程都往后推一天吗？",zht:"{d}空出來，並把從{d}起的行程都往後延一天嗎？",es:"¿Dejar libre el {d} y retrasar un día todo desde el {d}?"},
 pushDd:{ko:"{d}부터 일정을 하루씩 미뤘어요",en:"Moved your plan back one day from {d}",ja:"{d}からの予定を1日ずつ後ろにずらしました",zhs:"已将{d}起的行程推迟一天",zht:"已將{d}起的行程延後一天",es:"Retrasamos un día el plan desde el {d}"},
 cxQd:{ko:"{d} 일정({n}곳)을 취소할까요? 일정표에서 빠지고 카트에는 남아요. 다음 날 일정은 그대로예요.",en:"Cancel the plan for {d} ({n} places)? They leave your schedule but stay in your cart. The next day stays the same.",ja:"{d}の予定（{n}か所）を取り消しますか？日程からは外れますが、カートには残ります。翌日の予定はそのままです。",zhs:"要取消{d}的行程（{n}个地点）吗？会从行程中移除，但仍留在购物车中。第二天的行程不变。",zht:"要取消{d}的行程（{n}個地點）嗎？會從行程中移除，但仍留在購物車中。隔天的行程不變。",es:"¿Cancelar el plan del {d} ({n} lugares)? Saldrán del itinerario pero seguirán en tu carrito. El día siguiente no cambia."},
 cxDd:{ko:"{d} 일정을 취소했어요",en:"Cancelled the plan for {d}",ja:"{d}の予定を取り消しました",zhs:"已取消{d}的行程",zht:"已取消{d}的行程",es:"Cancelamos el plan del {d}"},
 cxD:{ko:"오늘 일정을 취소했어요",en:"Cancelled today's plan",ja:"今日の予定を取り消しました",zhs:"已取消今天的行程",zht:"已取消今天的行程",es:"Cancelamos el plan de hoy"}};
function dL6(di){ var n=di+1; return T5({ko:n+"일차",en:"Day "+n,ja:n+"日目",zhs:"第"+n+"天",zht:"第"+n+"天",es:"Día "+n}); }
function tdBar(di,today){ var bt='<button type="button" class="trbtn" data-td="go" data-d="'+di+'">'+esc(T5(TD6.go))+'</button><button type="button" class="trbtn" data-td="push" data-d="'+di+'">'+esc(T5(TD6.push))+'</button><button type="button" class="trbtn" data-td="cx" data-d="'+di+'">'+esc(T5(today?TD6.cx:TD6.cxd))+'</button>';
  return today?'<div class="ttoday" data-html2canvas-ignore><b>'+esc(T5(TD6.t))+'</b><div class="tgr">'+bt+'</div></div>':'<div class="tdays" data-html2canvas-ignore>'+bt+'</div>'; }
function tdPush(pl,di){ var f=mdFreeN(pl,di); if(!f&&pl.ap&&pl.ap.d) return -1;
  var d0=pl.days[di], c=pl.mc?((di>0&&pl.days[di-1].nc!=null&&pl.days[di-1].nc>=0)?pl.days[di-1].nc:d0.c):null, nd={date:"",stops:[]}; if(c!=null){ nd.c=c; nd.nc=c; }
  mdShiftAll(pl,di,1,null); pl.days.splice(di,0,nd); if(pl.ai&&Array.isArray(pl.ai.days)) pl.ai.days.splice(di,0,null);
  var ext=1; if(f){ var e=pl.days.length-1-((pl.ap&&pl.ap.d)?1:0); for(var q=e;q>di+1;q--){ var d=pl.days[q]; if(d.md||d.stops.length||d.am!=null||d.pm!=null||d.gap||d.rs) break; pl.days.splice(q,1); if(pl.ai&&Array.isArray(pl.ai.days)) pl.ai.days.splice(q,1); mdShiftAll(pl,q+1,-1,q); ext=0; break; } }
  pl.days.forEach(function(d2,i2){ d2.date=dayDate(i2).toISOString().slice(0,10); });
  if(TR.opt.n!==pl.days.length){ var hk0=hKey(), hok=TR.opt.hOk===hk0; TR.opt.n=pl.days.length; if(hok) TR.opt.hOk=hKey(); }
  pl.chk=0; save(); refresh(); return ext; }
function tdCancel(pl,di){ var d=pl.days[di]; if(!d) return; d.stops=[]; d.post=[]; if(pl.meals){ delete pl.meals[di+":lunch"]; delete pl.meals[di+":dinner"]; } delete d.gap; delete d.rs; delete d.fr; delete d.fra; d.aiX=1; pl.chk=0; save(); refresh(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-td]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, di=+a.dataset.d, d=pl&&pl.days[di]; if(!d) return; var v=a.dataset.td;
  try{ ntap("_trip","today_"+v); }catch(z){}
  var td=d.date===kstToday(0), dl=dL6(di);   // 오늘이면 「오늘」, 다른 날이면 「2일차」 (11-08 모든 날에)
  if(v==="go"){ lgToast(td?T5(TD6.goD):gTxt(TD6.goDd,{d:dl})); return; }
  if(v==="push"){ if(!mdFreeN(pl,di)&&pl.ap&&pl.ap.d){ lgToast(T5(TD6.pushNo)); return; } if(!confirm(td?T5(TD6.pushQ):gTxt(TD6.pushQd,{d:dl}))) return; var r=tdPush(pl,di); if(r<0){ lgToast(T5(TD6.pushNo)); return; } repPaint(); lgToast(r?T5(TD6.pushX):(td?T5(TD6.pushD):gTxt(TD6.pushDd,{d:dl}))); return; }
  if(v==="cx"){ var n=d.stops.filter(function(k){ var x=pl.pool[k]; return x&&!x.eat; }).length; if(!confirm(td?gTxt(TD6.cxQ,{n:n}):gTxt(TD6.cxQd,{d:dl,n:n}))) return; tdCancel(pl,di); repPaint(); lgToast(td?T5(TD6.cxD):gTxt(TD6.cxDd,{d:dl})); } },true);
// ── 11-08 사장님 「시작 시간을 조절하는 장치가 필요하다」 「나」 — 일정표 장소 카드를 펼치면 「자세히 보기」 옆에 [⏰ 도착 시각 정하기] ──
//   카트의 도착 시각(fx)과 같은 값 · 정하면 그 시각까지 기다렸다 들어가고 그날 일정을 다시 계산(머무는 시간 칸과 같은 길) · ✕ = 지우기
var FXR6={ko:"도착 시각 바꾸기",en:"Change arrival time",ja:"到着時刻を変える",zhs:"更改到达时间",zht:"更改到達時間",es:"Cambiar hora de llegada"};
function fxRep(x){ var f=fxOf(x), k=esc(x.k); return '<span class="tfxw">'+(f!=null?'<button type="button" class="tsbtn tfxb" data-fk="'+k+'">⏰ '+esc(T5(FXR6))+'</button><button type="button" class="trfxx" data-fk="'+k+'" aria-label="'+esc(T5(FX6.clr))+'" title="'+esc(T5(FX6.clr))+'">✕</button>'
  :'<button type="button" class="tsbtn tfxb" data-fk="'+k+'">⏰ '+esc(T5(FX6.b))+'</button>')+'</span>'; }   // 정한 시각은 카드 위 「⏰ 18:00 도착」 줄에 — 여기는 바꾸기·지우기만(두 번 안 보이게)
function fxSetK(k,v){ var it=TR.items.filter(function(x){ return x.k===k; })[0]; if(it){ fxSet(it,v); return; } var pl=TR.plan, p=pl&&pl.pool&&pl.pool[k]; if(!p) return; if(v==null) delete p.fx; else p.fx=v; save(); }   // 카트에 없는(일정에만 있는) 곳도
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-fk]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, k=a.dataset.fk, x=pl&&pl.pool&&pl.pool[k], w=a.closest(".tfxw"); if(!x||!w) return;
  if(a.classList.contains("tfxb")){ w.innerHTML='<span class="trfxe"><input type="time" class="trfxi" value="'+esc(fxGuess(x))+'"><button type="button" class="trfxok" data-fk="'+esc(k)+'">'+esc(T5(FX6.set))+'</button><button type="button" class="trfxno" data-fk="'+esc(k)+'" aria-label="'+esc(T5(LV6.x))+'">✕</button></span>'; return; }
  if(a.classList.contains("trfxno")){ w.outerHTML=fxRep(x); return; }
  var v=null; if(a.classList.contains("trfxok")){ v=hm2m((w.querySelector(".trfxi")||{}).value); if(v==null) return; } else if(!a.classList.contains("trfxx")) return;
  fxSetK(k,v); try{ ntap("_trip",v==null?"trip_fix_clr":"trip_fix"); }catch(z){} pl.chk=0; save(); repPaint(); setTimeout(function(){ if(TR.plan===pl&&document.getElementById("trRep")&&chkList().length) chkOpen(true); },150); },true);
// ── 11-08 사장님 「장소 또는 식당에서 머무는 시간을 고칠 수 있게 — 고치면 그날 일정은 다시 계산」 · 식당 칸 「삭제」 ──
function stSel(k,cur,hi){ return '<select class="tstay" data-sk="'+esc(k)+'" aria-label="'+esc(T5(CK6.stay))+'">'+stayOpts(cur>0?cur:60,30,hi)+'</select>'; }
document.addEventListener("change",function(e){ var s=e.target; if(!s||!s.classList||!s.classList.contains("tstay")||!s.closest||!s.closest("#trRep")) return; var pl=TR.plan, m=+s.value; if(!pl||!(m>0)) return;
  if(s.dataset.sk) stSet(s.dataset.sk,m); else if(s.dataset.smk&&pl.meals&&pl.meals[s.dataset.smk]) pl.meals[s.dataset.smk].stay=m; else return;
  try{ ntap("_trip","trip_stay_edit"); }catch(z){} pl.chk=0; save(); repPaint(); setTimeout(function(){ if(TR.plan===pl&&document.getElementById("trRep")&&chkList().length) chkOpen(true); },150); },true);
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-mdel]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, mk=a.dataset.mdel; if(!pl||!mk) return;
  var c0=pl.meals&&pl.meals[mk];   // 11-09 사장님 — 빼기 전에 한 번 묻는다
  xAsk(function(){ var c=(pl.meals&&pl.meals[mk])||c0; return gTxt(XD6.qm,{p:c?eatName(c):"",j:eul(c?eatName(c):"")}); },function(){ if(TR.plan!==pl) return;
    pl.mskip=pl.mskip||{}; pl.mskip[mk]=1; if(pl.meals) delete pl.meals[mk]; try{ ntap("_trip","trip_meal_del"); }catch(z){} save(); repPaint(); lgToast(T5(DG6.skipD)); }); },true);   // 고른 식당 「삭제」 = 그 끼니 건너뛰기(다시 짜면 다시 생김)
// ── 11-08 점심을 묻는 칸 — 그날 일정이 13시 앞뒤로 걸쳐 있는데 점심(점심 칸·11~15시 식당)이 없으면 12시 자리에 [식당 찾기] [점심 안 먹어요]
//   「삭제」로 점심을 지운 날(mskip)에도 묻는다 · [점심 안 먹어요]를 누른 날(mno)만 안 묻는다
var LQ6={q:{ko:"점심 자리가 없어요. 점심은 어떻게 할까요?",en:"There's no lunch on this day. What would you like to do?",ja:"この日は昼食がありません。昼食はどうしますか？",zhs:"这天没有安排午餐。午餐怎么安排？",zht:"這天沒有安排午餐。午餐怎麼安排？",es:"Este día no tiene almuerzo. ¿Qué quieres hacer?"},
 no:{ko:"점심 안 먹어요",en:"Skip lunch",ja:"昼食はとらない",zhs:"不吃午餐",zht:"不吃午餐",es:"Sin almuerzo"}};
function lunchAskOn(pl,d,di,X,s){ if(!s||!s.rows.length||(pl.mno&&pl.mno[di+":lunch"])) return false; if(X.from>780||s.end<780) return false;
  return !s.rows.some(function(r){ return r.meal==="lunch"||(r.x&&r.x.eat&&r.t>=660&&r.t<900); }); }
function lunchAskHtml(di){ return '<div class="tgap teve tlq" data-html2canvas-ignore><b>'+MPIMG("mi_food",MIS)+esc(T5(LQ6.q))+'</b><div class="tgr"><button type="button" class="trbtn" data-lq="eat" data-d="'+di+'">'+esc(T5(CK6.eveEat))+'</button><button type="button" class="trbtn" data-lq="no" data-d="'+di+'">'+esc(T5(LQ6.no))+'</button></div></div>'; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-lq]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, di=+a.dataset.d; if(!pl||!pl.days[di]) return;
  try{ ntap("_trip","lunch_ask_"+a.dataset.lq); }catch(z){}
  if(a.dataset.lq==="eat"){ efOpen({di:di,K:"lunch",pos:mealPos(pl,di,"lunch")}); return; }
  pl.mno=pl.mno||{}; pl.mno[di+":lunch"]=1; save(); repPaint(); lgToast(T5(DG6.skipD)); },true);
// ── 11-08 도착 후 일정 (도시를 옮기는 날 열차·비행기 뒤) ──
var PO6={dep:{ko:"출국 준비",en:"Before your flight",ja:"出国の準備",zhs:"出境准备",zht:"出境準備",es:"Antes de tu vuelo"},
 p0:{ko:"도착 바로 뒤",en:"Right after arriving",ja:"到着直後",zhs:"到达后立刻",zht:"抵達後立刻",es:"Justo al llegar"},
 ins:{ko:"도착한 뒤 일정에 넣어요",en:"Adds it after you arrive",ja:"到着後の予定に入れます",zhs:"加入到达后的行程",zht:"加入抵達後的行程",es:"Se añade después de tu llegada"},
 hot:{ko:"숙소 도착 {t}",en:"Back at lodging {t}",ja:"宿到着 {t}",zhs:"回到住处 {t}",zht:"回到住處 {t}",es:"Llegada al alojamiento {t}"},
 ap:{ko:"공항 도착 {t}",en:"At the airport {t}",ja:"空港到着 {t}",zhs:"抵达机场 {t}",zht:"抵達機場 {t}",es:"Llegada al aeropuerto {t}"},
 end:{ko:"일정 끝 {t}",en:"Day ends {t}",ja:"予定終了 {t}",zhs:"行程结束 {t}",zht:"行程結束 {t}",es:"Fin del día {t}"},
 late:{ko:"비행기 시각에 늦어요 — {t}까지 공항에 가야 해요",en:"Too late for your flight — be at the airport by {t}",ja:"飛行機に間に合いません — {t}までに空港へ",zhs:"会赶不上航班——需在{t}前到达机场",zht:"會趕不上航班——需在{t}前抵達機場",es:"Llegarías tarde al vuelo: debes estar en el aeropuerto a las {t}"}};
function postTr(pl,di){ var d=pl.days[di]; return d&&d.pm!=null&&pl.tr?pl.tr[d.pm]:null; }
function postAnchor(pl,di){ var d=pl.days[di], tr=postTr(pl,di), ps=((d&&d.post)||[]).map(function(k){ return pl.pool[k]; }).filter(Boolean); return ps.length?ps[ps.length-1]:(tr?tr.sb:null); }
function postRun(pl,di){ return withLC(function(){ var X=dayX(pl,di,REPH||pl.H||null), s=sched(X.H,X.arr,X.dt,X.from,moX(di,X)); return natPost(pl,di,X,s); }); }
function postAt(pl,di){ var o=postRun(pl,di), t=o.tB; (o.rows||[]).forEach(function(r){ if(r.px) t=r.t+r.px.stay; }); return t; }
// x 를 도착 후 일정 pos 자리에 넣었다고 치고 끝(숙소·공항 도착) — {end, miss, ap:공항이면 1, by}
function postEndWith(pl,di,x,pos,stay){ var d=pl.days[di], bak=d.post, tk="__ptmp"; pl.pool[tk]=Object.assign({},x,{k:tk,stay:stay||x.stay}); d.post=(bak||[]).slice(); d.post.splice(pos==null?d.post.length:pos,0,tk);
  var o=null; try{ o=postRun(pl,di); }catch(e){} d.post=bak; delete pl.pool[tk]; if(!o) return null; var last=o.rows[o.rows.length-1]||{}, ap=null; o.rows.forEach(function(r){ if(r.apD) ap=r; });
  return {end:o.end,miss:!!o.miss,ap:ap?1:0,by:ap?ap.by:null,hot:last.hotel?1:0}; }
function gcCandsPost(pl,di){ var last=postAnchor(pl,di), used={}, pts=[]; if(!last) return [];
  pl.days.forEach(function(x){ x.stops.forEach(function(k){ used[k]=1; }); (x.post||[]).forEach(function(k){ used[k]=1; }); }); TR.items.forEach(function(x){ used[x.k]=1; });
  for(var pk in pl.pool){ var pp=pl.pool[pk]; if(pp&&isFinite(+pp.lat)) pts.push(pp); }
  var cand=[]; for(var k in (window.PLACES||{})){ if(used[k]||k.charAt(0)==="_") continue; var q=PLACES[k]; if(!q||!isFinite(+q.lat)||!isFinite(+q.lng)) continue;
    var it={k:k,ko:q.ko,en:q.en||q.ko,lat:+q.lat,lng:+q.lng,addr:q.addr||"",addr_en:q.addr_en||"",d:q.dko||"",den:q.den||""}, c=catOf(it); if(c==="hotel"||c==="trans"||PERFK[k]) continue;
    var dk=km(last,it); if(dk>6) continue; if(pts.some(function(p){ return km(p,it)<0.08; })) continue; it.stay=stayOf(it); cand.push({d:dk,x:it}); }
  cand.sort(function(a,b){ return a.d-b.d; }); var out=[], sn={};
  cand.forEach(function(c){ if(out.length>=8) return; var key=Math.round(c.x.lat*1e3)+","+Math.round(c.x.lng*1e3)+"|"+String(c.x.ko).slice(0,4); if(sn[key]) return; sn[key]=1; out.push(c); });
  out.forEach(function(c){ var r=postEndWith(pl,di,c.x,null,c.x.stay); c.end=r?r.end:null; c.fit=!!r&&!r.miss; c.at=null; c.ap=r?r.ap:0; c.hot=r?r.hot:0; c.by=r?r.by:null; });
  return out; }
function insPost(pl,di,pos,it,stay){ var d=pl.days[di]; if(!d||!it||!it.k) return false; var k=it.k; d.post=d.post||[]; if(d.post.indexOf(k)>=0||d.stops.indexOf(k)>=0) return false;
  pl.pool[k]=Object.assign({},it,{stay:stay,um:stay,ins:1}); d.post.splice(Math.max(0,Math.min(pos,d.post.length)),0,k);
  if(!has(k)&&TR.items.length<MAXN){ var ci=Object.assign({},it,{um:stay}); delete ci.stay; delete ci.ins; var ks=TR.items.map(function(x){ return x.k; }), last=null;
    d.stops.concat(d.post).forEach(function(q){ if(q!==k&&ks.indexOf(q)>=0) last=q; }); TR.items.splice(last?ks.indexOf(last)+1:TR.items.length,0,ci); }
  pl.chk=2; save(); refresh(); return true; }
function insPaintPost(b,pl,o){ var d=pl.days[o.di], it=o.item, ps=(d.post||[]).map(function(k){ return pl.pool[k]; }).filter(Boolean), s0=b.querySelector("#tiPos"), s1=b.querySelector("#tiStay");
  var pos=s0?+s0.value:(o.pos!=null?o.pos:ps.length), stay=s1?+s1.value:(o.kind==="eat"?60:(o.stay||stayOf(it))); if(!(pos>=0&&pos<=ps.length)) pos=ps.length; if(!(stay>0)) stay=60;
  var opts='<option value="0"'+(pos===0?' selected':'')+'>'+esc(T5(PO6.p0))+'</option>'+ps.map(function(x,i){ return '<option value="'+(i+1)+'"'+(pos===i+1?' selected':'')+'>'+esc(gTxt(CK6.pN,{n:i+1,p:x.eat?eatName(x):nm(x)})+(i===ps.length-1?T5(CK6.pE):''))+'</option>'; }).join("");
  b.innerHTML='<div class="insbox"><div class="talh" style="color:var(--ink)">'+esc(T5(CK6.iT))+'</div><div class="d" style="margin:0 0 4px">'+esc(dLbl(o.di))+' · '+esc(dateTxt(new Date(d.date+"T00:00:00Z")))+'</div>'
    +'<div class="insn">'+(o.kind==="eat"?MPIMG("mi_food",MIS)+eatLine(it):'<b>'+esc(nm(it))+'</b> <i>'+esc(kindL(it))+'</i>')+'</div>'
    +'<label class="insl">'+esc(T5(CK6.iPos))+'<select id="tiPos">'+opts+'</select></label>'
    +'<label class="insl">'+esc(T5(CK6.iStay))+'<select id="tiStay">'+stayOpts(stay,30,o.kind==="eat"?180:480)+'</select></label>'
    +'<div class="insp" id="tiPrev"></div>'
    +'<div class="talb"><button type="button" data-ins="go">'+esc(T5(CK6.iGo))+'</button><button type="button" data-ins="no" class="insno">'+esc(T5(CK6.iNo))+'</button></div></div>';
  var upd=function(){ var p2=+b.querySelector("#tiPos").value, s2=+b.querySelector("#tiStay").value, r=postEndWith(pl,o.di,it,p2,s2), t="";
    if(r){ t=esc(T5(PO6.ins))+' · '+esc(gTxt(r.ap?PO6.ap:r.hot?PO6.hot:PO6.end,{t:m2hm(r.end)})); if(r.miss&&r.by!=null) t+=' <b class="insov">⚠ '+esc(gTxt(PO6.late,{t:m2hm(r.by)}))+'</b>'; }
    b.querySelector("#tiPrev").innerHTML=t; };
  b.querySelector("#tiPos").onchange=upd; b.querySelector("#tiStay").onchange=upd; upd(); }
function pxHtml(pl,di,r,n){ var x=r.px, k=x.k, del=txBtn('data-ux="'+esc(k)+'"',DG6.del);   // 11-09 사장님 — 「삭제」 = 카드 머리줄 오른쪽 ✕
  if(x.eat){ var op=!!EXP["u:"+k]; return '<div class="trw l teu tcx'+(op?' open':'')+'" data-uk="'+esc(k)+'" data-xk="u:'+esc(k)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">'+MPIMG("mi_food",MIS)+del+esc(T5(CK6[r.t<900?"lunch":"dinner"]||CK6.meal))+' '+stSel(k,x.stay,180)+'<span class="teat on">'+eatLine(x)+'<span class="teact">'+eatLinks(x)+rsvLink(x)+' <button type="button" class="tsbtn" data-pp="eat">'+esc(T5(DG6.det))+'</button></span></span>'+(window.XTG?XTG.html(op,'',true):'')+'</span></div>'; }
  var xk="p:"+k, op2=!!EXP[xk]; return '<div class="trw tpk tcx'+(op2?' open':'')+'" data-k="'+esc(k)+'" data-xk="'+esc(xk)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp"><b class="tno">'+n+'</b>'+del+'<b class="tpn">'+esc(nm(x))+'</b> <i>'+stSel(k,x.stay,480)+'</i><span class="tdet"><span class="tdbt" data-html2canvas-ignore>'+fxRep(x)+'<button type="button" class="tsbtn" data-pp="'+esc(k)+'">'+esc(T5(DG6.det))+'</button></span></span>'+(window.XTG?XTG.html(op2,'',true):'')+'</span></div>'; }
// ── 11-08 사장님 「이런 날은 새벽에 기차를 탈 게 아니라 다음날 아침에 도시간 이동을 미루는게 현명하다」 ──
//   저녁 도시 이동(pm)인데 그날 일정이 막차(역 도착 마감 X.lim)보다 늦게 끝나면 → 그날 밤은 지금 도시 숙소, 다음 날 아침 이동(am)
//   짤 때 저절로(pmFlipAll) · 짠 뒤 늦어지면 ⚠ 줄의 [이동을 다음 날 아침으로] · 공항으로 가는 날·다음 날이 없거나 이미 아침 이동이 있는 날은 안 바꿈
var PM6={b:{ko:"이동을 다음 날 아침으로",en:"Move the trip to next morning",ja:"移動を翌朝に",zhs:"改为次日早上出发",zht:"改為隔天早上出發",es:"Viajar a la mañana siguiente"},
 d:{ko:"{c} 이동을 다음 날 아침으로 옮겼어요",en:"Moved the trip to {c} to the next morning",ja:"{c}への移動を翌朝に移しました",zhs:"已将前往{c}的行程改到次日早上",zht:"已將前往{c}的行程改到隔天早上",es:"Movimos el viaje a {c} a la mañana siguiente"},
 n:{ko:"전날 일정이 늦게 끝나 {c} 이동은 아침에 해요",en:"Yesterday ends late, so you travel to {c} this morning",ja:"前日の予定が遅く終わるため、{c}への移動は朝にします",zhs:"前一天的行程结束较晚，所以早上前往{c}",zht:"前一天的行程結束較晚，所以早上前往{c}",es:"El día anterior termina tarde, así que viajas a {c} por la mañana"}};
function pmCanFlip(pl,di){ var d=pl.days[di], n=pl.days[di+1]; if(!d||d.pm==null||!n||n.am!=null||n.md) return false; var tr=pl.tr&&pl.tr[d.pm]; return !!(tr&&tr.b>=0&&n.c===tr.b); }
function pmFlip(pl,di,H){ if(!pmCanFlip(pl,di)) return false; var d=pl.days[di], n=pl.days[di+1], ti=d.pm, tr=pl.tr[ti];
  delete d.pm; d.nc=d.c; n.am=ti; tr.w="am"; tr.di=di+1; tr.fl=1;
  withLC(function(){ [di,di+1].forEach(function(q){ var X=dayX(pl,q,H); if(X.arr.length) pl.days[q].end=sched(X.H,X.arr,X.dt,X.from,{to:X.to}).end; }); }); return true; }
function pmFlipAll(pl,H){ if(!pl||!pl.mc||!Array.isArray(pl.tr)) return; withLC(function(){ pl.tr.forEach(function(tr,ti){ if(tr.w!=="pm"||tr.di==null) return; var di=tr.di, d=pl.days[di]; if(!d||d.pm!==ti||!pmCanFlip(pl,di)) return;
    var X=dayX(pl,di,H); if(X.lim==null||!X.arr.length) return; var s=sched(X.H,X.arr,X.dt,X.from,{to:X.to}); if(s.end>X.lim) pmFlip(pl,di,H); }); }); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-pmam]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, di=+a.dataset.pmam; if(!pl) return;
  var tr=pl.days[di]&&pl.days[di].pm!=null?pl.tr[pl.days[di].pm]:null, cn=tr&&tr.b>=0&&pl.cities[tr.b]?cnm(pl.cities[tr.b]):"";
  if(!pmFlip(pl,di,REPH||pl.H||null)) return; try{ ntap("_trip","pm_to_am"); }catch(z){} pl.chk=0; save(); repPaint(); lgToast(gTxt(PM6.d,{c:cn})); },true);
// ── 11-08 사장님 「검색으로 완전히 새로운 장소나 액티비티를 찾는 건 불가하네?」 「가」 — 장소 검색 (허브 /kplace — 카카오 키워드, 기준점이 있으면 가까운 순)
//   「일정 추가」 창 맨 위: 찾은 곳 [고르기] → 넣기 전 확인 창 → 그날에만 끼워 넣음(짜 둔 일정은 그대로) · 카트: 찾은 곳 [＋ 담기] → 카트에 담음(지도에서 담기와 같음)
var PS8={ph:{ko:"장소·액티비티 찾기 (예: 롯데월드, 한강 유람선)",en:"Search places & activities (e.g. Lotte World, Han River cruise)",ja:"場所・アクティビティを探す（例：ロッテワールド、漢江クルーズ）",zhs:"搜索地点和活动（例：乐天世界、汉江游船）",zht:"搜尋地點和活動（例：樂天世界、漢江遊船）",es:"Buscar lugares y actividades (p. ej., Lotte World, crucero por el río Han)"},
 ing:{ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"搜索中…",zht:"搜尋中…",es:"Buscando…"},
 none:{ko:"찾은 곳이 없어요",en:"No results",ja:"見つかりませんでした",zhs:"没有找到",zht:"沒有找到",es:"Sin resultados"},
 err:{ko:"잠시 뒤 다시 해 주세요",en:"Please try again shortly",ja:"少ししてからもう一度お試しください",zhs:"请稍后再试",zht:"請稍後再試",es:"Inténtalo de nuevo en un momento"},
 res:{ko:"검색 결과",en:"Search results",ja:"検索結果",zhs:"搜索结果",zht:"搜尋結果",es:"Resultados"},
 near:{ko:"근처 지도 명소",en:"Sights on the map nearby",ja:"近くの地図の名所",zhs:"附近地图上的景点",zht:"附近地圖上的景點",es:"Lugares del mapa cercanos"},
 nn:{ko:"근처에 지도 그림 명소가 없어요. 위 검색창으로 찾아 보세요.",en:"No pictured sights nearby. Try the search box above.",ja:"近くに地図のイラスト名所がありません。上の検索欄で探してみてください。",zhs:"附近没有地图上的插画景点。请用上方搜索框查找。",zht:"附近沒有地圖上的插畫景點。請用上方搜尋框查找。",es:"No hay lugares ilustrados cerca. Prueba con el buscador de arriba."},
 add:{ko:"＋ 담기",en:"+ Add",ja:"＋ 追加",zhs:"＋ 加入",zht:"＋ 加入",es:"+ Añadir"},
 inP:{ko:"✓ {d}에 있음",en:"✓ In {d}",ja:"✓ {d}にあり",zhs:"✓ 已在{d}",zht:"✓ 已在{d}",es:"✓ En {d}"},
 got:{ko:"✓ 담김",en:"✓ Added",ja:"✓ 追加済み",zhs:"✓ 已加入",zht:"✓ 已加入",es:"✓ Añadido"},
 addD:{ko:"「{p}」 담았어요",en:"Added “{p}”",ja:"「{p}」を追加しました",zhs:"已加入「{p}」",zht:"已加入「{p}」",es:"Se añadió «{p}»"},
 empty:{ko:"아직 담은 곳이 없어요. 아래 검색창으로 찾거나, 지도에서 그림을 누르고 「＋ 내 여행에 담기」를 누르세요.",en:"Nothing added yet. Search below, or tap a picture on the map and then “＋ Add to my trip”.",ja:"まだ何も追加していません。下の検索欄で探すか、地図の絵を押して「＋ 旅行に追加」を押してください。",zhs:"还没有加入任何地点。请用下方搜索框查找，或点地图上的插画再点「＋ 加入我的旅行」。",zht:"還沒有加入任何地點。請用下方搜尋框查找，或點地圖上的插畫再點「＋ 加入我的旅行」。",es:"Aún no has añadido nada. Busca abajo, o toca un dibujo del mapa y luego «＋ Añadir a mi viaje»."}};
function psSearch(q,A,cb){ q=String(q||"").trim(); if(!q){ cb([]); return; } var u=HUB+"/kplace?q="+encodeURIComponent(q)+(A&&isFinite(+A.lat)?"&near=1&ux="+(+A.lng).toFixed(3)+"&uy="+(+A.lat).toFixed(3):"")+kpL();
  fetch(u).then(function(r){ return r.json(); }).then(function(j){ cb((j&&j.ok&&j.items)||[]); }).catch(function(){ cb(null); }); }
function psItem(x){ var lat=+x.y, lng=+x.x, it={k:pinKey({ko:x.name,lat:lat,lng:lng}),ko:x.name,en:x.name_en||x.name,lat:lat,lng:lng,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",cat:x.cat||"",pin:1}; it.stay=stayOf(it); return it; }
function psRow(x,A,btn){ var en=L()&&x.name_en, nmx=en?x.name_en:x.name, ct=String((L()&&x.cat_en)||x.cat||"").split(">").pop().trim(), dk=A&&isFinite(+x.y)?km(A,{lat:+x.y,lng:+x.x}):null;
  return '<div class="efi"><div><b>'+esc(nmx)+'</b>'+(ct?' <i>'+esc(ct)+'</i>':'')+(dk!=null?' <i>· '+esc(dk<1?Math.round(dk*1000)+" m":dk.toFixed(1)+" km")+'</i>':'')+'</div><div class="d" style="font-size:12px">'+esc((L()&&x.addr_en)||x.addr||"")+'</div><div class="tgr" style="justify-content:flex-end">'+btn+'</div></div>'; }
function psList(S,A,btnOf){ if(S.busy) return '<div class="d" style="margin:6px 0">'+esc(T5(PS8.ing))+'</div>'; if(S.r==null) return S.er?'<div class="d" style="margin:6px 0">'+esc(T5(PS8.err))+'</div>':'';
  if(!S.r.length) return '<div class="d" style="margin:6px 0">'+esc(T5(PS8.none))+'</div>'; return '<div class="psh">'+esc(T5(PS8.res))+'</div>'+S.r.slice(0,10).map(function(x,i){ return psRow(x,A,btnOf(x,i)); }).join(""); }
function psInput(id,go,v){ return '<div class="trsr psr"><input id="'+id+'" enterkeyhint="search" placeholder="'+esc(T5(PS8.ph))+'" value="'+esc(v||"")+'"><button type="button" class="tb" id="'+go+'" aria-label="search">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div>'; }
// 카트
var PSC={q:"",r:null,busy:0,er:0};
function psCartA(){ var h=TR.opt&&TR.opt.hotel; if(h&&isFinite(+h.lat)&&h.type!=="here") return {lat:+h.lat,lng:+h.lng}; var it=TR.items.filter(function(x){ return isFinite(+x.lat); })[0]; return it?{lat:+it.lat,lng:+it.lng}:null; }
function psCartBox(){ var A=psCartA(); return '<div class="psbox">'+psInput("psQc","psGoC",PSC.q)+'<div id="psRc">'+psList(PSC,A,function(x){ var it=psItem(x); return has(it.k)?'<span class="d">'+esc(T5(PS8.got))+'</span>':'<button type="button" class="trbtn" data-psa="'+esc(it.k)+'">'+esc(T5(PS8.add))+'</button>'; })+'</div></div>'; }
function psCartWire(g){ var q=g("psQc"), b=g("psGoC"); if(!q||!b) return; var go=function(){ PSC.q=q.value.trim(); if(!PSC.q) return; PSC.busy=1; PSC.r=null; PSC.er=0; panelPaint(); try{ ntap("_trip","cart_search"); }catch(z){}
    psSearch(PSC.q,psCartA(),function(L){ PSC.busy=0; PSC.r=L; PSC.er=L?0:1; if(document.getElementById("trBox")) panelPaint(); }); };
  b.onclick=go; q.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); go(); } }; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trBox [data-psa]"); if(!a) return; e.preventDefault(); var x=(PSC.r||[]).filter(function(y){ return psItem(y).k===a.dataset.psa; })[0]; if(!x) return;
  var it=psItem(x); delete it.stay; addItem(it); try{ panelPaint(); }catch(z){} lgToast(gTxt(PS8.addD,{p:nm(it)})); },true);
// 「일정 추가」 창
function gcAnchor(pl,o){ if(o.post) return postAnchor(pl,o.di); var X=dayX(pl,o.di,REPH||pl.H||null), arr=X.arr, P0=(o.pos!=null&&o.pos>=0&&o.pos<arr.length)?o.pos:arr.length; return arr[P0-1]||arr[arr.length-1]||hE(X.H)||hS(X.H)||null; }
function psGcBox(o,Lc){ var A=null; try{ A=gcAnchor(TR.plan,o); }catch(e){} o.ps=o.ps||{q:"",r:null,busy:0,er:0};
  var pl=TR.plan, inD=function(k){ for(var q=0;q<pl.days.length;q++){ var d=pl.days[q]; if(d.stops.indexOf(k)>=0||(d.post||[]).indexOf(k)>=0) return q; } return -1; };   // 이미 일정에 있는 곳은 「✓ ○일차에 있음」
  return psInput("psQg","psGoG",o.ps.q)+psList(o.ps,A,function(x,i){ var q=inD(psItem(x).k); return q>=0?'<span class="d">'+esc(gTxt(PS8.inP,{d:dLbl(q)}))+'</span>':'<button type="button" class="trbtn pri" data-gsp="'+i+'">'+esc(T5(CK6.pick))+'</button>'; })+(Lc.length?'<div class="psh">'+esc(T5(PS8.near))+'</div>':'<div class="d" style="margin:8px 0">'+esc(T5(PS8.nn))+'</div>'); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trGc #psGoG, #trGc [data-gsp]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var o=GCS, pl=TR.plan; if(!o||!pl||!pl.days[o.di]) return; o.ps=o.ps||{q:"",r:null,busy:0,er:0};
  if(a.id==="psGoG"){ var q=document.getElementById("psQg"); o.ps.q=q?q.value.trim():""; if(!o.ps.q) return; o.ps.busy=1; o.ps.r=null; o.ps.er=0; gcPaint(); try{ ntap("_trip","gc_search"); }catch(z){}
    var A=null; try{ A=gcAnchor(pl,o); }catch(z){} psSearch(o.ps.q,A,function(L){ if(GCS!==o) return; o.ps.busy=0; o.ps.r=L; o.ps.er=L?0:1; gcPaint(); }); return; }
  var x=(o.ps.r||[])[+a.dataset.gsp]; if(!x) return; var it=psItem(x), X=dayX(pl,o.di,REPH||pl.H||null);
  insOpen({di:o.di,kind:"place",pos:o.post?(pl.days[o.di].post||[]).length:(o.pos!=null&&o.pos>=0&&o.pos<X.arr.length)?o.pos:X.arr.length,item:it,stay:it.stay,post:o.post}); },true);
document.addEventListener("keydown",function(e){ if(e.key!=="Enter"||!e.target||e.target.id!=="psQg") return; e.preventDefault(); var b=document.getElementById("psGoG"); if(b) b.click(); },true);
// 넣기 — 그날 그 자리에 · 카트에도 같은 자리에(앞 장소 다음) · 다시 검사
function insStop(pl,di,pos,it,stay){ var d=pl.days[di]; if(!d||!it||!it.k) return false; var k=it.k; if(d.stops.indexOf(k)>=0) return false;
  var arr=d.stops.filter(function(q){ return pl.pool[q]; });
  pl.pool[k]=Object.assign({},it,{stay:stay,um:stay,ins:1});
  var at=pos<=0?(arr.length?d.stops.indexOf(arr[0]):0):(pos>=arr.length?d.stops.length:d.stops.indexOf(arr[pos])); d.stops.splice(at<0?d.stops.length:at,0,k);
  if(!has(k)&&TR.items.length<MAXN){ var ci=Object.assign({},it,{um:stay}); delete ci.stay; delete ci.ins; var ks=TR.items.map(function(x){ return x.k; });
    if(pos<=0&&arr.length){ var nx=ks.indexOf(arr[0]); TR.items.splice(nx<0?TR.items.length:nx,0,ci); } else { var ix=pos>0?ks.indexOf(arr[pos-1]):-1; TR.items.splice(ix<0?TR.items.length:ix+1,0,ci); } }
  pl.chk=2; save(); refresh(); return true; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trIns [data-ins]"); if(!a) return; e.preventDefault(); var b=document.getElementById("trIns"), o=INS, pl=TR.plan;
  if(a.dataset.ins==="no"||!o||!pl){ if(b) b.remove(); return; }
  var pos=+b.querySelector("#tiPos").value, sv=b.querySelector("#tiStay").value, stay=+sv, nmx=o.kind==="eat"?eatName(o.item):nm(o.item), dn=/^d\d+$/.test(sv)?+sv.slice(1):0;
  if(o.post?insPost(pl,o.di,pos,o.item,stay):dn?mdInsert(pl,o.di,o.item,dn):insStop(pl,o.di,pos,o.item,stay)){ try{ ntap(o.kind==="eat"?"_trip":(/^[A-Za-z0-9_-]+$/.test(o.item.k)?o.item.k:"_trip"),o.kind==="eat"?"trip_eat_ins":"trip_ins"); }catch(z){} }
  ["trIns","trEf","trGc"].forEach(function(id){ var x=document.getElementById(id); if(x) x.remove(); }); INS=null; lgToast(gTxt(CK6.added,{p:nmx}));
  if(document.getElementById("trRep")) repPaint(); else chkOpen(true); },true);
// ── 직접 식당 찾기 (식사 칸에 맞는 식당이 없을 때·저녁 식당 찾기·검사 창 「식당 찾기」) ──
//   조건을 넓혀서: 반경 5km(산 위 석굴암처럼 2km 안에 식당이 없는 곳이 있어서 — 카카오는 가까운 순이라 넓혀도 가까운 곳부터) · 음식 종류 아무거나(고른 조건과 다를 수 있으면 표시) · 평점 기준 없음(카카오 자료엔 평점이 없다)
//   후보 = 이미 받은 것(그 칸 근처 카카오 15곳·제휴·이름난 식당 eats.json·같은 일정 다른 칸 근처 식당) + 허브 /kplace kw=음식점 반경 5km 한 번(카카오 무료, 같은 자리·언어는 이 화면에서 다시 안 부름)
var EFW={}, EFS=null;
function efAnchor(pl,o){ if(o.post){ var A0=postAnchor(pl,o.di); return A0?{lat:+A0.lat,lng:+A0.lng}:null; } if(o.mk&&pl.recs&&pl.recs[o.mk]&&pl.recs[o.mk].a) return {lat:+pl.recs[o.mk].a[0],lng:+pl.recs[o.mk].a[1]};
  var X=dayX(pl,o.di,REPH||pl.H||null), arr=X.arr, p=arr[Math.max(0,Math.min(arr.length-1,(o.pos||0)-1))]||arr[0]||hE(X.H)||hS(X.H); return p?{lat:+p.lat,lng:+p.lng}:null; }
function efWide(A,cb){ var key=(+A.lat).toFixed(3)+","+(+A.lng).toFixed(3)+"|"+LANG; if(EFW[key]) return cb(EFW[key]); if(EFW[key+"?"]) return; EFW[key+"?"]=1;
  fetch(HUB+"/kplace?kw="+encodeURIComponent("음식점")+"&x="+(+A.lng).toFixed(3)+"&y="+(+A.lat).toFixed(3)+"&radius=5000"+kpL()).then(function(r){ return r.json(); })
    .then(function(j){ delete EFW[key+"?"]; EFW[key]=(j&&j.ok&&j.items)||[]; cb(EFW[key]); }).catch(function(){ delete EFW[key+"?"]; EFW[key]=[]; cb([]); }); }
// 구글 평점·영업시간 (사장님 11-07 「켜」) — 허브 /gnear type=eat(구글 인기순 음식점 1.5km — 가까운 순으로 받으면 시장 안 작은 가게뿐이라 평점이 거의 없다 · 3곳 못 되면 허브가 5km 한 번 더) 한 번 · 허브가 300m 칸·언어별로 하루 저장(같은 칸은 구글 안 부름) · 이 화면에서도 같은 자리·언어는 다시 안 부름
//   카카오·이름난 식당 후보와 같은 곳(전화번호가 같거나, 200m 안 이름 앞글자가 같으면)에는 평점·영업시간을 붙이고, 없는 곳은 구글 식당으로 더한다
var EFG={};
function efGoog(A){ var key=(+A.lat).toFixed(3)+","+(+A.lng).toFixed(3)+"|"+LANG; if(EFG[key]) return EFG[key];
  return EFG[key]=fetch(HUB+"/gnear?lat="+(+A.lat).toFixed(5)+"&lng="+(+A.lng).toFixed(5)+"&lang="+encodeURIComponent(LANG)+"&type=eat").then(function(r){ return r.json(); })
    .then(function(j){ EFG[key+"!"]=(j&&j.ok&&j.items)||[]; }).catch(function(){ EFG[key+"!"]=[]; }); }
function efGMerge(out,A,add){ var G=EFG[(+A.lat).toFixed(3)+","+(+A.lng).toFixed(3)+"|"+LANG+"!"]; if(!G||!G.length) return;
  var nz=function(s){ return String(s||"").replace(/[\s\-·•()（）\[\]'’".,&!]/g,"").toLowerCase(); }, tz=function(s){ return String(s||"").replace(/\D/g,""); };
  G.forEach(function(g){ var gl={lat:+g.y,lng:+g.x}; if(!isFinite(gl.lat)||!isFinite(gl.lng)) return; var gn=nz(g.name), gt=tz(g.tel), best=null, bd=1e9;
    out.forEach(function(c){ if(c.gid) return; var d=km(gl,c)*1000; if(d>300) return; var ct=tz(c.tel), ok=gt.length>=8&&gt===ct;
      if(!ok&&d<=200&&gn.length>=2) [nz(c.ko),nz(c.en)].forEach(function(cn){ if(cn.length>=2&&(cn.indexOf(gn.slice(0,3))===0||gn.indexOf(cn.slice(0,3))===0)) ok=true; });
      if(ok&&d<bd){ bd=d; best=c; } });
    if(best){ best.gid=g.id; if(g.rating){ best.rating=+g.rating; best.n=+g.n||0; } if(Array.isArray(g.oh)&&g.oh.length&&!(Array.isArray(best.oh)&&best.oh.length)) best.oh=g.oh; return; }
    add({src:"g",gid:g.id,ko:g.name,en:g.name_en||g.name,lat:gl.lat,lng:gl.lng,tel:g.tel||"",addr:g.addr||"",addr_en:g.addr_en||"",kind:g.cat||"",kind_en:g.cat_en||g.cat||"",rating:+g.rating||0,n:+g.n||0,oh:Array.isArray(g.oh)?g.oh:null}); }); }
function efNear(x){ return {src:"near",id:x.id,ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x,tel:x.tel||"",addr:x.addr||"",addr_en:x.addr_en||"",cat:x.cat||"",cat_en:x.cat_en||"",kind:kindOf(x.cat)}; }
function efCands(pl,o,A){ var out=[], seen={}, op=TR.opt;
  var add=function(c){ if(!c||!isFinite(+c.lat)||!isFinite(+c.lng)||!c.ko) return; var key=String(c.ko).replace(/\s/g,"")+"|"+Math.round(c.lat*2e3)+"|"+Math.round(c.lng*2e3); if(seen[key]) return;
    if(c.src==="near"&&(RX.skip.test(c.cat||"")||(c.cat&&!/^음식점/.test(c.cat)))) return;   // 술집·카페·간식은 식사가 아니라 뺀다 · 카카오 「음식점」 분류만
    var d=Math.round(km(A,c)*1000); if(d>5000) return; seen[key]=1; var ok=eatOk(c,op); out.push(Object.assign({},c,{dist:d,cond:ok?0:1,note:ok?ok.note:""})); };
  var rc=o.mk&&pl.recs&&pl.recs[o.mk];
  if(rc){ (rc.p||[]).forEach(function(x){ add({src:"ad",id:x.id,ko:x.ko,en:x.en||x.ko,lat:+x.lat,lng:+x.lng,tel:x.tel||"",addr:x.addr||"",catc:x.cat,kind:"",tags:x.tags||[],dko:x.dko,den:x.den}); }); (rc.i||[]).forEach(function(x){ add(efNear(x)); }); }
  (EATS||[]).forEach(function(x){ if(x.kind==="디저트") return; add({src:"eat",id:x.id,ko:x.ko,en:x.en||x.ko,ja:x.ja,zhs:x.zhs,zht:x.zht,es:x.es,lat:+x.lat,lng:+x.lng,tel:x.tel||"",addr:x.addr||"",kind:x.kind||"",kind_en:x.kind_en||"",kind_x:x["kind_"+LANG]||"",menu:(x.menu||[]).join(", "),menu_x:(x["menu_"+LANG]||[]).join(", "),tags:x.tags||[],srcs:x.src||[],url:x.url||"",lux:x.lux||0}); });
  for(var mk in (pl.recs||{})){ var q=pl.recs[mk]; if(q&&(q.l===LANG||!L())) (q.i||[]).forEach(function(x){ add(efNear(x)); }); }
  (EFW[(+A.lat).toFixed(3)+","+(+A.lng).toFixed(3)+"|"+LANG]||[]).forEach(function(x){ add(efNear(x)); });
  efGMerge(out,A,add);
  // 차례 (11-07) — 광고 먼저 · 가까운 곳 먼저, 200m 안쪽 같은 칸이면 리뷰 10개 이상인 곳 → 별점 높은 순 → 리뷰 많은 순 (편의시설 「음식점」과 같은 규칙, 사장님 10-21)
  out.sort(function(a,b){ var x=(a.src==="ad"?0:1)-(b.src==="ad"?0:1); if(x) return x; x=Math.floor(a.dist/200)-Math.floor(b.dist/200); if(x) return x;
    x=((b.n||0)>=10?1:0)-((a.n||0)>=10?1:0); if(x) return x; x=(b.rating||0)-(a.rating||0); if(x) return x; x=(b.n||0)-(a.n||0); return x||(a.dist-b.dist); }); return out.slice(0,20); }
function efOpen(o){ var pl=TR.plan; if(!pl||!pl.days[o.di]) return; var A=efAnchor(pl,o); if(!A) return; EFS=Object.assign({},o,{A:A,busy:1});
  var old=document.getElementById("trEf"); if(old) old.remove(); var b=document.createElement("div"); b.id="trEf"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  b._rb=efPaint; document.body.appendChild(b);
  var gp=efGoog(A);   // 구글 평점·영업시간은 카카오와 함께 기다린다 (11-07)
  eatsLoad().then(function(){ efPaint(); efWide(A,function(){ gp.then(function(){ if(EFS&&EFS.A===A){ EFS.busy=0; efPaint(); } }); }); }); efPaint(); try{ ntap("_trip","eat_find"); }catch(e){} }
function efHrs(c,dt){ if(!Array.isArray(c.oh)||!c.oh.length||!dt) return T5(CK6.fHrs); var wn=winOf(c,dt); if(!wn) return T5(CK6.fHrs); if(wn.off) return T5(LV6.off); return wn.w.filter(function(w){ return w[0]>=0; }).map(function(w){ return gTxt(LV6.hrs,{o:m2hm(w[0]),c:m2hm(Math.min(w[1],w[0]+1439))}); }).join(", ")||T5(CK6.fHrs); }
function efPaint(){ var b=document.getElementById("trEf"), pl=TR.plan, o=EFS; if(!b||!pl||!o) return; var d=pl.days[o.di]; if(!d){ b.remove(); return; }
  var Lc=efCands(pl,o,o.A), dt=new Date(d.date+"T00:00:00Z"); o.list=Lc;
  var h='<div class="efbox"><button type="button" class="ppx" aria-label="'+esc(T5(PP6.x))+'" data-efx="1">✕</button><div class="talh" style="color:var(--ink);margin-right:34px">'+MPIMG("mi_food",MIS)+esc(gTxt(CK6.fT,{d:dLbl(o.di),m:T5(CK6[o.K]||CK6.meal)}))+'</div><div class="d" style="margin:2px 0 8px;line-height:1.5">'+esc(T5(CK6.fW))+'</div>';
  h+=Lc.map(function(c,i){ return '<div class="efi"><div>'+eatLine(c)+'</div><div class="efm">'+(!c.rating&&!(Array.isArray(c.oh)&&c.oh.length)?esc(T5(CK6.fNoRH)):(c.rating?'★'+(+c.rating).toFixed(1)+(c.n?' ('+c.n+')':''):esc(T5(CK6.fNoR)))+' · '+esc(efHrs(c,dt)))+'</div>'+(c.cond?'<span class="tmemo">'+esc(T5(CK6.fCond))+'</span>':'')
    +'<div class="tgr"><button type="button" class="trbtn" data-efd="'+i+'">'+esc(T5(CK6.det))+'</button><button type="button" class="trbtn pri" data-efp="'+i+'">'+esc(T5(CK6.pick))+'</button></div></div>'; }).join("");
  if(o.busy) h+='<div class="d" style="margin:8px 0">'+esc(T5(CK6.fIng))+'</div>'; else if(!Lc.length) h+='<div class="d" style="margin:8px 0">'+esc(T5(CK6.fNone))+'</div>';
  h+='<div class="d" style="margin-top:10px">'+esc(T5(CK6.rsvN))+'</div></div>'; b.innerHTML=h; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trEf [data-efx], #trEf [data-efd], #trEf [data-efp]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var b=document.getElementById("trEf"), o=EFS;
  if(a.dataset.efx){ if(b) b.remove(); return; } if(!o||!o.list) return; var c=o.list[+(a.dataset.efd!=null?a.dataset.efd:a.dataset.efp)]; if(!c) return;
  if(a.dataset.efd!=null){ ppOpen({t:"eat",c:c,di:o.di}); return; }   // 장소 상세 팝업(일정 화면과 같은 것) — 닫으면 이 목록으로
  insOpen({di:o.di,kind:"eat",K:o.K,pos:o.pos,item:eatItem(c,o.K,o.di),stay:60,post:o.post}); },true);
function eatItem(c,K,di){ var h=0, s0=(c.ko||"")+"|"+(+c.lat).toFixed(5)+"|"+(+c.lng).toFixed(5); for(var i=0;i<s0.length;i++) h=(h*31+s0.charCodeAt(i))|0;
  var it=Object.assign({},c,{k:"ue_"+(h>>>0).toString(36)+"_"+(K||"m")+di,eat:1,meal:K||"",pin:1,lat:+c.lat,lng:+c.lng}); delete it.dist; delete it.cond; return it; }
// 식당 예약 = 아웃링크(앱 안 예약 없음) — 한국어 화면 네이버 지도 장소 검색(예약·전화), 외국어 화면 구글 지도 장소 검색(Reserve·Call)
function rsvLink(c){ var a=String(c.addr||"").split(/\s+/), q=FG()?(c.ko||"")+" "+(c.addr||""):(c.ko||"")+(a[1]?" "+a[1]:"");
  var u=FG()?"https://www.google.com/maps/search/?api=1"+hlG()+"&query="+encodeURIComponent(q):"https://map.naver.com/p/search/"+encodeURIComponent(q);
  return '<a href="'+esc(u)+'" target="_blank" rel="noopener" class="trsv">'+MPIMG("mi_calendar",MIS)+esc(T5(CK6.rsv))+'</a>'; }
function mealLbl(x){ return T5(CK6[x.meal]||CK6.meal)+" ("+durTxt(x.stay||60)+")"; }
// ── 11-09 사장님 — 일정표에서 빼기는 모두 같은 ✕ (카트 ✕ 와 같은 모양 · 카드 머리줄 오른쪽 끝, ▼/ㅡ 옆) · 누르면 가운데 창으로 한 번 묻는다 ──
//   장소 카드(번호 동그라미)·넣은 식당 = 일정과 카트에서 빼기(dropPlace) · 고른 식당 = 그 끼니 건너뛰기 · 숙소에서 쉬기 = 그 쉬기만 빼기
var XD6={q:{ko:"「{p}」{j} 일정과 카트에서 뺄까요?",en:"Remove “{p}” from your plan and trip?",ja:"「{p}」を日程とカートから外しますか？",zhs:"要把「{p}」从行程和购物车中移除吗？",zht:"要把「{p}」從行程和購物車中移除嗎？",es:"¿Quitar «{p}» del plan y del viaje?"},
 qm:{ko:"「{p}」{j} 일정에서 뺄까요? 이 끼니는 건너뛰어요.",en:"Remove “{p}” from your plan? This meal will be skipped.",ja:"「{p}」を日程から外しますか？この食事は省きます。",zhs:"要把「{p}」从行程中移除吗？这顿饭将跳过。",zht:"要把「{p}」從行程中移除嗎？這頓飯將跳過。",es:"¿Quitar «{p}» del plan? Se omitirá esta comida."},
 qr:{ko:"{a}–{b} 숙소에서 쉬기를 일정에서 뺄까요?",en:"Remove the rest at your lodging ({a}–{b}) from your plan?",ja:"{a}–{b}の宿での休憩を日程から外しますか？",zhs:"要从行程中移除{a}–{b}回住处休息吗？",zht:"要從行程中移除{a}–{b}回住處休息嗎？",es:"¿Quitar del plan el descanso en el alojamiento ({a}–{b})?"}};
function txBtn(attr,lb){ var t=esc(T5(lb)); return '<button type="button" class="trx txd" '+attr+' aria-label="'+t+'" title="'+t+'" data-html2canvas-ignore>✕</button>'; }   // 글씨(「삭제」「빼기」)는 읽어 주기·마우스 올림 글로만
function xAsk(msg,go){ var o=document.getElementById("trXq"); if(o) o.remove(); var b=document.createElement("div"); b.id="trXq"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ b.innerHTML='<div class="txq"><div class="tals">'+esc(typeof msg==="function"?msg():msg)+'</div><div class="talb"><button type="button" data-xq="y">'+esc(T5(CK6.rm))+'</button><button type="button" data-xq="n" class="insno">'+esc(T5(CK6.bKeep))+'</button></div></div>';
    b.querySelector('[data-xq="y"]').onclick=function(e){ e.stopPropagation(); b.remove(); go(); }; b.querySelector('[data-xq="n"]').onclick=function(e){ e.stopPropagation(); b.remove(); }; };
  draw(); b._rb=draw; document.body.appendChild(b); return b; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-ux]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, k=a.dataset.ux; if(!pl||!pl.pool[k]) return;
  var x0=pl.pool[k], nmx=function(){ var x=pl.pool[k]||x0; return x.eat?eatName(x):nm(x); };
  xAsk(function(){ var p=nmx(); return gTxt(XD6.q,{p:p,j:eul(p)}); },function(){ if(TR.plan!==pl||!pl.pool[k]) return; var nx=nmx();
    if(!x0.eat) pl.days.forEach(function(d){ if(d.stops.indexOf(k)>=0||(d.post&&d.post.indexOf(k)>=0)) d.aiX=1; });   // 장소를 빼면 그날 AI 설명은 옛 일정 얘기라 감춘다(끌어 옮기기와 같게)
    if(!x0.eat) try{ ntap("_trip","trip_place_del"); }catch(z){} dropPlace(k); pl.chk=0; save(); lgToast(gTxt(CK6.dropD,{p:nx})); repPaint();
    setTimeout(function(){ if(TR.plan===pl&&document.getElementById("trRep")&&chkList().length) chkOpen(true); },150); }); },true);   // 다시 검사는 머무는 시간 고치기와 같게 — 문제가 있을 때만 검사 창(「문제 없어요」 알림이 「뺐어요」 알림을 덮지 않게)
// ── 「일정 추가」 칸 (11-07 사장님) — 모든 날 맨 끝 + 장소 사이 빈 시간(GAPMIN 넘게 그냥 기다리는 곳) · 같은 모양·같은 단추 넷 ──
//   [일정 추가] = 그 자리 앞 장소 근처 지도 명소(6km 안, 가까운 순 8곳) 후보 → 고르면 넣기 전 확인 (빈 시간 칸은 다음 일정 시각까지 들어가는지) · [식당 찾기] = 직접 식당 찾기 — 그 시간이 대부분 15시 전이면 점심, 아니면 저녁
//   [숙소로 갈게요] = 그날 끝 칸은 예전 「일찍 감」 · 빈 시간 칸은 그 뒤 장소를 다른 날로 옮길지 먼저 묻고(가운데 창) 날마다 시간이 맞는 자리로(mvFind — 맞는 날이 없으면 그대로, 검사 창이 알림)
//   [숙소에서 쉴게요] = 빈 시간 칸은 숙소에 가서 쉬다 다음 일정으로(d.rs — 저장·공유에 남음) · 그날 끝 칸은 「숙소로 갈게요」와 같다
//   빈 시간 칸 맨 위 = 다른 날 오전 장소를 이 빈 시간으로 옮기기 추천(같은 도시 · 그 장소가 시간에 맞고 그날도 안 망가질 때 · 머무는 시간을 줄여야 들어가면 그 줄에 적고, 고르면 줄인다)
var GAPMIN=120, GAPC=8, GPC={};   // 빈 시간 기준 2시간 · 추천 후보 장소 수 상한 · GPC[날] = 그린 빈 시간 칸(누를 때 같은 값)
var GQ6={am:{ko:"오전으로",en:"morning",ja:"午前",zhs:"上午",zht:"上午",es:"la mañana"},pm:{ko:"오후로",en:"afternoon",ja:"午後",zhs:"下午",zht:"下午",es:"la tarde"},ev:{ko:"저녁으로",en:"evening",ja:"夕方",zhs:"傍晚",zht:"傍晚",es:"la noche"}};
function eul(s){ var m=/([가-힣])[^가-힣]*$/.exec(String(s||"")); return !m?"을(를)":((m[1].charCodeAt(0)-0xAC00)%28?"을":"를"); }   // 받침 있으면 「을」, 없으면 「를」
// 장소 사이 빈 시간 — 앞 일정에서 나선 뒤 다음 일정까지 그냥 기다리는 분(문 열기·도착 시각·식사 시각 기다림)이 GAPMIN 넘는 줄 · 이동·식사·숙소에서 쉬기는 빈 시간이 아님 · 그날 첫 일정 앞은 늦게 나서면 되니 뺀다
//   → [{ri:그 줄, j:넣을 자리(그 앞 장소 수), k:다음 장소, m:그 줄이 식사 칸이면 끼니, a:앞 일정에서 나서는 시각, w:빈 분, b:a+w, end:다음 일정 시작, K:맞는 끼니}]
function gapsOf(s){ var out=[], j=0, hasL=s.rows.some(function(r){ return r.meal==="lunch"||(r.x&&r.x.eat&&r.x.meal==="lunch"); }); s.rows.forEach(function(r,ri){   // 점심이 이미 있는 날은 빈 시간 「식당 찾기」가 저녁 (11-07 — 있던 점심을 갈아치웠다)
    var rd=r.meal?r.rd:(r.x?r.ar:null);   // 11-08 고침 — 이 줄이 위 주석에 붙어 실행되지 않았다(빈 시간 카드가 한 번도 안 뜸)
    if(ri>0&&rd!=null&&!r.act&&!s.rows[ri-1].rest&&r.t-rd>=GAPMIN){ var w=r.t-rd, a=r.meal?(r.t0!=null?r.t0:rd):rd-(r.leg?r.leg.min:0), nx=r.meal?r.next:r.x;
      if(nx) out.push({ri:ri,j:j,k:nx.k,m:r.meal||"",a:a,w:w,b:a+w,end:r.t,K:(!hasL&&(a+a+w)/2<900)?"lunch":"dinner"}); }
    if(r.x) j++; }); return out; }
// 다른 날 오전 장소를 이 빈 시간으로 — 가까운 날부터 GAPC곳까지 넣어 보기(mvFind 와 같은 셈: 그 장소 rowIss 문제 없음(문 열기 기다림은 괜찮음) · 이 날 다른 장소가 새로 안 맞게 되면 X · 다음 일정·그날 끝이 늦어지면 X)
//   빼는 날도 새 문제·새 빈 시간이 생기면 X · 머무는 시간 그대로 안 되면 30분씩 줄여(절반까지) 들어가는 가장 긴 값 → [{dj,k,t:도착,st:줄인 머무는 시간|null}] 2개까지
function gapRec(pl,di,X,s,g){ var src=pl.days[di], arr=X.arr, dt=X.dt, mo=moX(di,X), out=[], tried=0, H0=REPH||pl.H||null;
  var cnt=function(s2,dt2,dj,skip){ var n=0; s2.rows.forEach(function(r,ri){ if(!r.x||r.x===skip) return; var q=rowIss(s2,r,ri,dt2,dj); if(q&&q.t!=="early") n++; }); return n; };
  var nxT=function(s2){ var t=null; s2.rows.forEach(function(r){ if(r.x&&r.x.k===g.k) t=r.t; }); return t; }, b0=cnt(s,dt,di,null), t0=nxT(s), ds=[];
  pl.days.forEach(function(d,dj){ if(dj!==di&&!d.md&&!(pl.mc&&d.c!==src.c)&&d.date!==kstToday(0)) ds.push(dj); }); ds.sort(function(a,b){ return Math.abs(a-di)-Math.abs(b-di)||a-b; });   // 전국 일정은 같은 도시 날만 · 오늘(실제 기록) 날은 안 건드림
  ds.forEach(function(dj){ if(tried>=GAPC) return; var Y=dayX(pl,dj,H0); if(!Y.arr.length) return; var ym=moX(dj,Y), ys=sched(Y.H,Y.arr,Y.dt,Y.from,ym), yb=null;
    ys.rows.forEach(function(r){ if(tried>=GAPC||!r.x||r.x.eat||isNight(r.x)||r.t>=720) return; var y=r.x; tried++;
      var rs=sched(Y.H,Y.arr.filter(function(z){ return z!==y; }),Y.dt,Y.from,ym); if(yb==null) yb=cnt(ys,Y.dt,dj,null);
      if(cnt(rs,Y.dt,dj,null)>yb||gapsOf(rs).length>gapsOf(ys).length) return;   // 빼면 그날이 망가짐
      var st0=y.stay, lo=Math.max(30,Math.ceil(st0/60)*30), best=null;
      for(var st=st0;st>=lo&&!best;st=(st===st0?Math.floor((st0-1)/30)*30:st-30)){ var yy=st===st0?y:Object.assign({},y,{stay:st}), s2=sched(X.H,arr.slice(0,g.j).concat([yy],arr.slice(g.j)),dt,X.from,mo), rr=null, ri2=-1;
        s2.rows.forEach(function(q,i){ if(q.x===yy){ rr=q; ri2=i; } }); if(!rr) continue;
        var iq=rowIss(s2,rr,ri2,dt,di); if(iq&&iq.t!=="early") continue; if(cnt(s2,dt,di,yy)>b0) continue;
        var tn=nxT(s2); if(t0!=null&&tn!=null&&tn>t0+1) continue; if(s2.end>s.end+1) continue;
        best={dj:dj,k:y.k,t:rr.t,st:st===st0?null:st,idle:s2.idle}; }
      if(best) out.push(best); }); });
  out.sort(function(a,b){ return (a.st?1:0)-(b.st?1:0)||a.idle-b.idle||Math.abs(a.dj-di)-Math.abs(b.dj-di); });
  return out.slice(0,2); }
function evBtns(di,gi,post){ return [["add",CK6.eveAdd],["eat",CK6.eveEat],["no",CK6.eveNo],["rest",CK6.eveRest]].map(function(a){ return '<button type="button" class="trbtn" data-ev="'+a[0]+'" data-d="'+di+'"'+(gi!=null?' data-gi="'+gi+'"':'')+(post?' data-post="1"':'')+'>'+esc(T5(a[1]))+'</button>'; }).join(""); }
function eveHtml(pl,d,di,s,X,lim){ var dep=!!(pl.ap&&pl.ap.d&&di===pl.days.length-1), post=!!(X&&X.pmTr); return '<div class="tgap teve" data-html2canvas-ignore><b>'+esc(T5(dep?PO6.dep:CK6.eveT))+'</b><div class="tgr">'+evBtns(di,null,post)+'</div></div>'; }   // 11-08 출국하는 날 = 「출국 준비」(단추 그대로) · 도시를 옮기는 날 = 도착한 도시에서 찾기   // 그날 끝 — 모든 날 맨 끝에 무조건
function gapHtml(pl,di,G,gi){ var rc=(G.rec||[]).map(function(q,i){ var x=pl.pool[q.k]; if(!x) return ""; var pn=nm(x), pd=q.t<720?"am":q.t<1020?"pm":"ev";   // 빈 시간 — 그 자리에, 같은 모양
    return '<button type="button" class="tgrec" data-gr="'+i+'" data-gi="'+gi+'" data-d="'+di+'">'+esc(gTxt(CK6.gRec,{d:dLbl(q.dj),p:pn,j:eul(pn),q:T5(GQ6[pd]),t:m2hm(q.t)}))+(q.st?'<small>'+esc(gTxt(CK6.gRecS,{m:durTxt(q.st)}))+'</small>':'')+'</button>'; }).join("");
  return '<div class="tgap teve tgp" data-html2canvas-ignore><b>'+esc(T5(CK6.eveT))+'</b><span class="tgpsub">'+esc(gTxt(CK6.gapT,{a:m2hm(G.a),b:m2hm(G.b),g:durTxt(G.w)}))+'</span>'+rc+'<div class="tgr">'+evBtns(di,gi)+'</div></div>'; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-ev]"); if(!a) return; e.preventDefault(); var pl=TR.plan; if(!pl) return; var di=+a.dataset.d, d=pl.days[di]; if(!d) return; var v=a.dataset.ev, G=a.dataset.gi!=null?(GPC[di]||[])[+a.dataset.gi]:null;
  try{ ntap("_trip",(G?"gap_":"eve_")+v); }catch(z){}
  if(G){ if(v==="add") gcOpen(di,G.end,G.j,G); else if(v==="eat") efOpen({di:di,K:G.K,pos:G.j}); else if(v==="no") goOpen(di,G); else if(v==="rest") rsSet(pl,di,G); return; }   // 빈 시간 칸 — 그 자리에
  if(a.dataset.post==="1"&&(v==="add"||v==="eat")){ if(v==="add") gcOpen(di,null,null,null,1); else { var tA=postAt(pl,di); efOpen({di:di,K:(tA!=null&&tA<840)?"lunch":"dinner",pos:(d.post||[]).length,post:1}); } return; }   // 11-08 도착한 도시에서
  if(v==="no"||v==="rest"){ d.gap="early"; save(); repPaint(); return; }   // 그날 끝 — 「숙소에서 쉴게요」도 숙소로 가는 것과 같다
  if(v==="keep"){ d.eveX=1; save(); repPaint(); return; }
  var X=dayX(pl,di,REPH), lim=(d.gap&&d.gap.until)||dayLim(pl,d,X.H,X.arr,X.dt,X);
  if(v==="add") gcOpen(di,lim,a.dataset.pos!=null?+a.dataset.pos:null);
  else if(v==="eat"){ var se=withLC(function(){ return sched(X.H,X.arr,X.dt,X.from,moX(di,X)); }), a0=se.end-(se.back?se.back.min:0); var hasL2=se.rows.some(function(r){ return r.meal==="lunch"||(r.x&&r.x.eat&&r.x.meal==="lunch"); }); efOpen({di:di,K:(!hasL2&&(a0+Math.max(a0,lim))/2<900)?"lunch":"dinner",pos:X.arr.length}); } });   // 마지막 장소 뒤 ~ 그날 끝 시각이 대부분 15시 전이면 점심
// 추천 「○일차 오전의 ○○을 이날 오후로 옮기기」 — 머무는 시간을 줄여야 들어가면 줄이고(카트 칸과 같은 값) 그 자리로 옮긴다(mvStop) · 다시 검사
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-gr]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan; if(!pl) return; var di=+a.dataset.d, G=(GPC[di]||[])[+a.dataset.gi], q=G&&G.rec&&G.rec[+a.dataset.gr]; if(!q||!pl.pool[q.k]||!pl.days[q.dj]||!pl.days[di]) return;
  try{ ntap("_trip","gap_move"); }catch(z){}
  var nx=nm(pl.pool[q.k]); if(q.st) stSet(q.k,q.st); if(mvStop(pl,q.dj,di,G.j,q.k)) lgToast(gTxt(FX6.mD,{p:nx,d:dLbl(di)}));
  if(document.getElementById("trRep")) repPaint(); else chkOpen(true); },true);
// 숙소에서 쉬기 — 그날 d.rs 에 {k:다음 장소, m:그 줄이 식사 칸이면 끼니} · 숙소가 없으면(전국 일정은 서울역·도시 중심 기준이 있다) 한 줄 알림 · 다시 검사
function rsSet(pl,di,G){ var d=pl.days[di]; if(!d) return; if(!rsPt(pl,di,dayX(pl,di,REPH||pl.H||null))){ lgToast(T5(CK6.rsNoH)); return; }
  d.rs=(d.rs||[]).filter(function(z){ return z.k!==G.k; }); d.rs.push({k:G.k,m:G.m||""}); pl.chk=2; save(); repPaint(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-rsx]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var pl=TR.plan, d=pl&&pl.days[+a.dataset.d], rk=a.dataset.rsx; if(!d||!d.rs) return;
  var ra=a.dataset.ra||"", rb=a.dataset.rb||""; xAsk(function(){ return gTxt(XD6.qr,{a:ra,b:rb}); },function(){ if(TR.plan!==pl||!d.rs) return;   // 11-09 사장님 — 빼기 전에 한 번 묻는다
    d.rs=d.rs.filter(function(z){ return z.k!==rk; }); if(!d.rs.length) delete d.rs; pl.chk=2; save(); repPaint(); }); },true);   // 쉬기 줄 「빼기」
// 숙소로 갈게요 (빈 시간 칸) — 그 뒤 장소를 다른 날로 옮길지 가운데 창으로 먼저 묻는다
var GOS=null;
function goOpen(di,G){ var pl=TR.plan; if(!pl||!pl.days[di]) return; var X=dayX(pl,di,REPH||pl.H||null), L=X.arr.slice(G.j); if(!L.length){ pl.days[di].gap="early"; save(); repPaint(); return; }
  GOS={di:di,ks:L.map(function(x){ return x.k; })}; var old=document.getElementById("trGo"); if(old) old.remove();
  var b=document.createElement("div"); b.id="trGo"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); }; b._rb=goPaint; document.body.appendChild(b); goPaint(); }
function goPaint(){ var b=document.getElementById("trGo"), pl=TR.plan, o=GOS; if(!b||!pl||!o||!pl.days[o.di]){ if(b) b.remove(); return; } var L=o.ks.map(function(k){ return pl.pool[k]; }).filter(Boolean);
  b.innerHTML='<div class="mvbox"><div class="talh" style="color:var(--ink)">'+esc(T5(CK6.goT))+'</div><div class="d" style="margin:0 0 4px">'+esc(dLbl(o.di))+' · '+esc(dateTxt(new Date(pl.days[o.di].date+"T00:00:00Z")))+'</div>'
    +'<div class="tals">'+esc(gTxt(CK6.goI,{n:L.length,l:L.map(function(x){ return x.eat?eatName(x):nm(x); }).join(", ")}))+'</div>'
    +'<div class="talb"><button type="button" data-go="y">'+esc(T5(FX6.bMv))+'</button><button type="button" data-go="n" class="insno">'+esc(T5(CK6.bKeep))+'</button></div></div>'; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trGo [data-go]"); if(!a) return; e.preventDefault(); var b=document.getElementById("trGo"), o=GOS, pl=TR.plan; if(b) b.remove(); GOS=null;
  if(a.dataset.go!=="y"||!o||!pl||!pl.days[o.di]) return; try{ ntap("_trip","gap_home"); }catch(z){}
  var r=goLater(pl,o.di,o.ks); lgToast(r.mv?gTxt(CK6.goD,{n:r.mv})+(r.kept?" · "+gTxt(CK6.goK,{n:r.kept}):""):gTxt(CK6.goK,{n:r.kept}));
  if(document.getElementById("trRep")) repPaint(); else chkOpen(true); },true);
// 그 뒤 장소를 하나씩 — 같은 도시 다른 날 중 시간이 맞는(그 장소 문제 없음 · 그날 다른 장소 안 망가짐) 자리, 그날 끝 시각을 안 넘는 날 먼저, 그 안에서 가장 덜 늘어나는 곳(mvFind)
//   손님이 넣은 식당은 바로 뒤 장소(없으면 바로 앞 장소)를 따라 그날 그 장소 앞(뒤)으로 · 다 옮기면 그날은 「숙소로 일찍 돌아가는 일정」(d.gap="early") → {mv,kept}
function goLater(pl,di,ks){ var src=pl.days[di], mv=0, kept=0, dst={}, att={}, H0=REPH||pl.H||null;
  ks.forEach(function(k){ var x=pl.pool[k]; if(!x||x.eat||src.stops.indexOf(k)<0) return;
    var L=withLC(function(){ return mvFind(pl,di,k); }), best=null;
    L.forEach(function(q){ if(!q.b||q.b.oth) return; var Y=withLC(function(){ return dayX(pl,q.dj,H0); }), lim=withLC(function(){ return dayLim(pl,q.d,Y.H,q.arr.concat([x]),Y.dt,Y); }), c=(q.b.e>lim?1e6:0)+q.b.c; if(!best||c<best.c) best={q:q,c:c}; });
    if(best&&mvStop(pl,di,best.q.dj,best.q.b.p,k)){ mv++; dst[k]=best.q.dj; } else kept++; });
  ks.forEach(function(k,i){ var x=pl.pool[k]; if(!x||!x.eat||src.stops.indexOf(k)<0) return; var f=null, af=0, q;
    for(q=i+1;q<ks.length&&!f;q++){ var y=pl.pool[ks[q]]; if(y&&!y.eat) f=ks[q]; } if(!f){ for(q=i-1;q>=0&&!f;q--){ var y2=pl.pool[ks[q]]; if(y2&&!y2.eat){ f=ks[q]; af=1; } } }
    if(f&&dst[f]!=null){ var a2=pl.days[dst[f]].stops.filter(function(z){ return pl.pool[z]; }), ix=a2.indexOf(f); if(ix>=0){ var ps=af?ix+1+(att[f]||0):ix; if(af) att[f]=(att[f]||0)+1; if(mvStop(pl,di,dst[f],ps,k)){ mv++; return; } } }
    kept++; });
  if(!kept) src.gap="early"; pl.chk=2; save(); return {mv:mv,kept:kept}; }
var GCS=null;
function gcCands(pl,di,until,pos,gp,post){ if(post) return gcCandsPost(pl,di); var X=dayX(pl,di,REPH||pl.H||null), arr=X.arr, H=X.H, dt=X.dt, mo=moX(di,X), used={}, pts=[], P0=(pos!=null&&pos>=0&&pos<arr.length)?pos:arr.length;   // pos = 넣을 자리(그 앞 장소 근처) — 없으면 그날 끝
  pl.days.forEach(function(x){ x.stops.forEach(function(k){ used[k]=1; }); }); TR.items.forEach(function(x){ used[x.k]=1; });
  for(var pk in pl.pool){ var pp=pl.pool[pk]; if(pp&&isFinite(+pp.lat)) pts.push(pp); }
  var last=(P0<arr.length?arr.slice(0,P0):arr).filter(function(x){ return !isNight(x)&&!x.eat; }).pop()||arr[P0-1]||arr[arr.length-1]||hE(H)||hS(H); if(!last) return [];
  var cand=[]; for(var k in (window.PLACES||{})){ if(used[k]||k.charAt(0)==="_") continue; var q=PLACES[k]; if(!q||!isFinite(+q.lat)||!isFinite(+q.lng)) continue;
    var it={k:k,ko:q.ko,en:q.en||q.ko,lat:+q.lat,lng:+q.lng,addr:q.addr||"",addr_en:q.addr_en||"",d:q.dko||"",den:q.den||""}, c=catOf(it); if(c==="hotel"||c==="trans"||PERFK[k]) continue;
    var dk=km(last,it); if(dk>6) continue; if(pts.some(function(p){ return km(p,it)<0.08; })) continue; it.stay=stayOf(it); cand.push({d:dk,x:it}); }   // 이미 일정에 있는 곳과 같은 자리(다른 약도의 같은 명소)는 뺀다
  cand.sort(function(a,b){ return a.d-b.d; }); var out=[], sn={};
  cand.forEach(function(c){ if(out.length>=8) return; var key=Math.round(c.x.lat*1e3)+","+Math.round(c.x.lng*1e3)+"|"+String(c.x.ko).slice(0,4); if(sn[key]) return; sn[key]=1; out.push(c); });
  var cur=gp?sched(H,arr,dt,X.from,mo):null, t0=null; if(cur) cur.rows.forEach(function(q){ if(q.x&&q.x.k===gp.k) t0=q.t; });   // 빈 시간 칸 (11-07) — 넣어도 다음 일정·그날 끝이 안 늦어지고 그곳이 시간에 맞으면 「들어감」, c.at = 그곳 도착
  out.forEach(function(c){ var s=sched(H,arr.slice(0,P0).concat([c.x],arr.slice(P0)),dt,X.from,mo); c.end=s.end;
    if(gp){ var r=null, ri=-1, tn=null; s.rows.forEach(function(q,i){ if(q.x===c.x){ r=q; ri=i; } if(q.x&&q.x.k===gp.k) tn=q.t; }); var iq=r?rowIss(s,r,ri,dt,di):null; c.at=r?r.t:null;
      c.fit=!!r&&(!iq||iq.t==="early")&&s.viol<=cur.viol&&s.end<=cur.end+1&&(tn==null||t0==null||tn<=t0+1); }
    else c.fit=s.end<=until&&s.viol===0; });
  return out; }
function gcOpen(di,until,pos,gp,post){ var pl=TR.plan; if(!pl||!pl.days[di]) return; GCS={di:di,until:until,pos:pos,gp:gp||null,post:post?1:0}; var L0=withLC(function(){ return gcCands(pl,di,until,pos,gp,post); });
  // 11-08 근처 그림 명소가 없어도(빈 시간 카드 포함) 창은 연다 — 맨 위 검색창으로 찾게
  var old=document.getElementById("trGc"); if(old) old.remove(); var b=document.createElement("div"); b.id="trGc"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  b._rb=gcPaint; document.body.appendChild(b); gcPaint(); }
function gcPaint(){ var b=document.getElementById("trGc"), pl=TR.plan, o=GCS; if(!b||!pl||!o||!pl.days[o.di]){ if(b) b.remove(); return; } var Lc=withLC(function(){ return gcCands(pl,o.di,o.until,o.pos,o.gp,o.post); }); o.list=Lc;
  var dt=new Date(pl.days[o.di].date+"T00:00:00Z"), mid=o.pos!=null&&o.pos>=0&&o.pos<dayX(pl,o.di,REPH||pl.H||null).arr.length;   // 장소 사이에 넣을 때는 「빈 시간 바로 앞 장소 근처」 (11-07)
  b.innerHTML='<div class="efbox"><button type="button" class="ppx" aria-label="'+esc(T5(PP6.x))+'" data-gcx="1">✕</button><div class="talh" style="color:var(--ink);margin-right:34px">'+MPIMG("mi_moon",MIS)+esc(gTxt(CK6.gT,{d:dLbl(o.di)+" · "+dateTxt(dt)}))+'</div><div class="d" style="margin:2px 0 8px;line-height:1.5">'+esc(T5(mid?CK6.gI2:CK6.gI))+'</div>'+psGcBox(o,Lc)
    +Lc.map(function(c,i){ var dd=c.d<1?Math.round(c.d*1000)+" m":c.d.toFixed(1)+" km";
      return '<div class="efi"><div><b>'+esc(nm(c.x))+'</b> <i>'+esc(kindL(c.x))+' · '+esc(gTxt(CK6.km,{d:dd}))+(isNight(c.x)?' · '+esc(T("밤 추천","Best at night")):'')+'</i></div><div class="efm">'+esc(durTxt(c.x.stay))+' · '+(o.post?(c.fit?esc(gTxt(c.ap?PO6.ap:c.hot?PO6.hot:PO6.end,{t:m2hm(c.end)})):'<b style="color:#c2410c">'+esc(gTxt(PO6.late,{t:m2hm(c.by)}))+'</b>'):c.fit?esc(o.gp?gTxt(FX6.mOk,{t:m2hm(c.at)}):gTxt(hE(dayX(pl,o.di,REPH||pl.H||null).H)?CK6.gFit:CK6.gFit2,{e:m2hm(c.end)})):'<b style="color:#c2410c">'+esc(gTxt(CK6.gNo,{t:m2hm(o.until)}))+'</b>')+'</div>'
        +'<div class="tgr"><button type="button" class="trbtn" data-gcd="'+i+'">'+esc(T5(CK6.det))+'</button><button type="button" class="trbtn pri" data-gcp="'+i+'">'+esc(T5(CK6.pick))+'</button></div></div>'; }).join("")+'</div>'; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trGc [data-gcx], #trGc [data-gcd], #trGc [data-gcp]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var b=document.getElementById("trGc"), o=GCS, pl=TR.plan;
  if(a.dataset.gcx){ if(b) b.remove(); return; } if(!o||!o.list||!pl) return; var c=o.list[+(a.dataset.gcd!=null?a.dataset.gcd:a.dataset.gcp)]; if(!c) return;
  if(a.dataset.gcd!=null){ ppOpen({t:"place",k:c.x.k,x:c.x,di:o.di}); return; }
  var X=dayX(pl,o.di,REPH||pl.H||null); insOpen({di:o.di,kind:"place",pos:o.post?(pl.days[o.di].post||[]).length:(o.pos!=null&&o.pos>=0&&o.pos<X.arr.length)?o.pos:X.arr.length,item:c.x,stay:c.x.stay,post:o.post}); },true);
// ── PDF (화면을 그림으로 떠서 — 한글 글꼴 문제 없음) · cdnjs 정확한 판 고정 ──
var LIBS={h2c:"https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",pdf:"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"};
function lib(u){ return new Promise(function(ok,no){ if(document.querySelector('script[src="'+u+'"]')&&(window.html2canvas||window.jspdf)){ var t=0, iv=setInterval(function(){ if((u===LIBS.h2c&&window.html2canvas)||(u===LIBS.pdf&&window.jspdf)||++t>100){ clearInterval(iv); ok(); } },50); return; }
  var s=document.createElement("script"); s.src=u; s.crossOrigin="anonymous"; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function shotDays(){ return lib(LIBS.h2c).then(function(){ var ds=[].slice.call(document.querySelectorAll("#trRep .tday")), host=document.createElement("div"); host.className="trshot"; document.body.appendChild(host);
  var bg=getComputedStyle(document.body).backgroundColor||"#fff", out=[];
  return ds.reduce(function(p,d){ return p.then(function(){ var c=d.cloneNode(true); [].forEach.call(c.querySelectorAll(".tods,.tlgo,.tlgt,.tebtn,.teact,.xtg,.tsbtn,.tdbt"),function(e){ e.remove(); }); [].forEach.call(c.querySelectorAll(".tcx"),function(e){ e.classList.add("open"); }); var hd0=c.querySelector(".tdh"); if(hd0) hd0.style.position="static"; host.innerHTML=""; host.appendChild(c);
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
    d:pl.days.map(function(d){ return d.stops.filter(function(k){ return pl.pool[k]; }).map(function(k){ var x=pl.pool[k]; if(!x.pin) return k; var a=[x.ko,x.en,r(x.lat),r(x.lng)], q=pinInfo(x); if(x.eat){ a.push(q||0); a.push({e:x.meal||"",m:x.stay||60}); } else if(q) a.push(q); return a; }); }),x:natShare(pl,r),
    u:(function(){ var u={}, n=0; for(var k in pl.pool){ var x=pl.pool[k]; if(x&&!x.eat&&+x.um>0){ u[k]=+x.um; n++; } } return n?u:undefined; })(),
    z:(function(){ var z={}, n=0; for(var k in pl.pool){ var f=fxOf(pl.pool[k]); if(f!=null){ z[k]=f; n++; } } return n?z:undefined; })(),
    r:(function(){ var o=[]; pl.days.forEach(function(d,di){ (d.rs||[]).forEach(function(q){ var j=d.stops.filter(function(k){ return pl.pool[k]; }).indexOf(q.k); if(j>=0) o.push([di,j,q.m||""]); }); }); return o.length?o:undefined; })()}; }   // r = 숙소에서 쉬기(11-07) — 그날 j번째 장소 앞 · 식당 키는 받는 쪽에서 바뀌니 자리 번호로   // z = 손님이 정한 시작 시각(분, 11-07) — 옛 앱은 모르는 칸이라 버린다   // 11-07 손님이 고른 머무는 시간(u)·손님이 넣은 식당([5] = {e:끼니, m:분}) — 옛 앱은 모르는 칸이라 버린다   // x = 전국 일정(도시별 숙소·공항·도시 이동 아침/저녁) — 옛 앱은 모르는 칸이라 버린다 (11-06)
// 일정을 # 뒤에 압축해 담은 공유 링크(읽기 전용으로 앱에서 열린다) — 링크·메일 공용
function tripUrl(){ return zip(JSON.stringify(shareData())).then(function(z){ return location.origin+location.pathname.replace(/index\.html$/,"")+"?trip=1#tp="+z; }); }
var SHSVG='<svg viewBox="0 0 24 24" style="width:1.05em;height:1.05em;vertical-align:-0.17em;margin-right:4px" aria-hidden="true"><path fill="#5b93ff" d="M18 16.08a2.9 2.9 0 0 0-1.96.77L8.9 12.7a3.3 3.3 0 0 0 0-1.4l7.05-4.11A2.92 2.92 0 1 0 15 5a3 3 0 0 0 .06.6L8.04 9.72a3 3 0 1 0 0 4.56l7.1 4.15c-.04.2-.06.4-.06.6a2.92 2.92 0 1 0 2.92-2.95z"/></svg>';   // 공유 아이콘 = 앱 공유 창 「다른 앱으로」와 같은 모양 (11-07 사장님 — 링크 아이콘이 잘못 붙어 있었다)
function shareGo(){ var box=document.getElementById("trNextBox");   // 11-07 사장님 — 앱 공유 창 단추(X·문자·텔레그램·LINE·페이스북·밴드·WhatsApp·메일·카카오톡·위챗·링크 복사·다른 앱으로)를 그대로, 보내는 것은 이 일정 링크
  box.dataset.p="share"; box.innerHTML='<div class="item"><div class="t xtrow"><span>'+SHSVG+T("공유","Share")+'</span>'+nbX()+'</div>'
    +'<div id="trShG" style="margin-top:8px"><div class="d">…</div></div>'
    +'<button type="button" id="trShP" class="gsbtn" style="margin-top:8px">'+MPIMG("mi_guideperson",MIS)+esc(T5({ko:"가이드에게 PDF 보내기",en:"Send PDF to a guide",ja:"ガイドにPDFを送る",zhs:"把PDF发给向导",zht:"把PDF傳給嚮導",es:"Enviar PDF a un guía"}))+'</button></div>';
  document.getElementById("trShP").onclick=function(){ gsOpen(); };
  tripUrl().then(function(u){ var g=document.getElementById("trShG"); if(!g) return; window.__trShareUrl=u;
    var pl=TR.plan, dd=pl&&pl.days&&pl.days.length?pl.days:null, desc=dd?dateTxt(new Date(dd[0].date+"T00:00:00Z"))+(dd.length>1?" – "+dateTxt(new Date(dd[dd.length-1].date+"T00:00:00Z")):""):"";
    if(typeof window.shareInto==="function") window.shareInto(g,{url:u,txt:T5({ko:"내 여행 일정",en:"My trip plan",ja:"私の旅行日程",zhs:"我的旅行行程",zht:"我的旅行行程",es:"Mi plan de viaje"}),desc:desc||"MosaicTrip.com for Korea"});
    else g.innerHTML='<div class="d" style="word-break:break-all">'+esc(u)+'</div>';
    g.addEventListener("click",function(){ try{ ntap("_trip","share"); }catch(e){} }); }); }

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
function gsPaint(){ var box=document.getElementById("trNextBox"); if(!box||box.dataset.p!=="share") return; var h='';   // 접었거나 「다음 갈 곳」으로 바뀐 칸에는 그리지 않는다 (11-07)
  var back='<div class="xtrow" style="margin:0 0 6px"><button type="button" class="trbtn gsback" id="gsBack" style="margin:0">‹ '+esc(T5({ko:"뒤로",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Atrás"}))+'</button>'+nbX()+'</div>';   // 맨 윗줄 오른쪽 — 접기 (11-07)
  if(GS.view==="done"){ box.innerHTML='<div class="item"><div class="xtrow" style="align-items:flex-start"><div class="gsdone" style="flex:1">✓ '+esc(T5({ko:"가이드에게 일정을 보냈어요 (이메일 + 문자).",en:"Sent to the guide (email + SMS).",ja:"ガイドに旅程を送りました（メール＋SMS）。",zhs:"已把行程发给向导（邮件＋短信）。",zht:"已把行程傳給嚮導（郵件＋簡訊）。",es:"Enviado al guía (correo + SMS)."}))+'</div>'+nbX()+'</div>'
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
  h='<div class="item"><div class="t xtrow"><span>'+MPIMG("mi_guideperson",MIS)+esc(T5({ko:"가이드에게 PDF 보내기",en:"Send PDF to a guide",ja:"ガイドにPDFを送る",zhs:"把PDF发给向导",zht:"把PDF傳給嚮導",es:"Enviar PDF a un guía"}))+'</span>'+nbX()+'</div>';
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
// ── 가이드 일정 검토 (사장님 11-07 「나로 하자, 옵션이지 필수는 아님」) — 선택 · 10만 원(외국어 화면 USD 100, 결제는 KRW 100,000) ──
//   카트 맨 위 작은 칸 → 가운데 창: 받는 것 · 결과 받을 이메일(필수) · 가이드 언어(가이드가 있는 말만 — 허브 GET /shop/grv/info) · 메모 · 금액 · 「결제하기」
//   「결제하기」 = 허브 /shop/order {pid:"grv", tp(공유 링크 #tp= 뒤 — 가이드가 앱에서 그대로 엶), start, days, glang, email, note} → PG 전이면 바로 결제 완료·가이드 배정·24시간 마감
//   PG 뒤(tpg.js SH_PG)면 KG이니시스 결제창 → 돌아오면 TPG.onRet("grv") · AI 일정은 무료 그대로라 이 칸을 안 눌러도 모든 기능이 그대로
var GRV6={
  card:{ko:"가이드에게 일정 검토 받기",en:"Get your plan checked by a guide",ja:"ガイドに日程をチェックしてもらう",zhs:"请向导检查行程",zht:"請嚮導檢查行程",es:"Que un guía revise tu plan"},
  cardS:{ko:"(선택 · 10만 원)",en:"(optional · USD 100)",ja:"（任意・USD 100）",zhs:"（可选 · USD 100）",zht:"（可選 · USD 100）",es:"(opcional · USD 100)"},
  title:{ko:"가이드 일정 검토",en:"Guide itinerary review",ja:"ガイドによる日程チェック",zhs:"向导行程检查",zht:"嚮導行程檢查",es:"Revisión del itinerario por un guía"},
  opt:{ko:"선택",en:"Optional",ja:"任意",zhs:"可选",zht:"可選",es:"Opcional"},
  desc:{ko:"현지 가이드가 결제 후 24시간 안에 일정을 살펴보고, 의견과 고친 일정을 이메일로 보내 드려요.",en:"A local guide checks your plan within 24 hours of payment and emails you comments and a revised plan.",ja:"現地ガイドがお支払いから24時間以内に日程をチェックし、コメントと修正した日程をメールでお送りします。",zhs:"当地向导会在付款后24小时内检查您的行程，并通过邮件发送意见和修改后的行程。",zht:"當地嚮導會在付款後24小時內檢查您的行程，並透過電子郵件寄送意見和修改後的行程。",es:"Un guía local revisa tu plan en las 24 horas siguientes al pago y te envía por correo sus comentarios y un plan corregido."},
  b1:{ko:"동선·이동 시간·순서·문 여는 시간을 살펴봐요",en:"Checks routes, travel times, order and opening hours",ja:"動線・移動時間・順番・営業時間を確認します",zhs:"检查路线、交通时间、顺序和开放时间",zht:"檢查路線、交通時間、順序和開放時間",es:"Revisa rutas, tiempos de traslado, orden y horarios"},
  b2:{ko:"고친 일정은 링크로 받아 앱에서 바로 열 수 있어요",en:"The revised plan comes as a link that opens right in the app",ja:"修正した日程はリンクで届き、アプリですぐ開けます",zhs:"修改后的行程以链接发送，可直接在应用中打开",zht:"修改後的行程以連結寄送，可直接在應用程式中開啟",es:"El plan corregido llega como enlace y se abre directamente en la app"},
  b3:{ko:"24시간 안에 답이 없으면 자동으로 전액 환불돼요",en:"No reply within 24 hours means an automatic full refund",ja:"24時間以内に返信がなければ自動で全額返金されます",zhs:"24小时内未回复将自动全额退款",zht:"24小時內未回覆將自動全額退款",es:"Si no hay respuesta en 24 horas, se reembolsa todo automáticamente"},
  free:{ko:"AI 일정은 지금처럼 무료예요. 검토는 원할 때만 받으세요.",en:"The AI plan stays free. Get a review only if you want one.",ja:"AIの日程はこれまでどおり無料です。チェックはご希望の場合だけどうぞ。",zhs:"AI行程依然免费，只在需要时才申请检查。",zht:"AI行程依然免費，只在需要時才申請檢查。",es:"El plan de la IA sigue siendo gratis. Pide la revisión solo si la quieres."},
  em:{ko:"결과 받을 이메일 *",en:"Email for the result *",ja:"結果を受け取るメール *",zhs:"接收结果的邮箱 *",zht:"接收結果的電子郵件 *",es:"Correo para recibir el resultado *"},
  gl:{ko:"가이드 언어",en:"Guide's language",ja:"ガイドの言語",zhs:"向导语言",zht:"嚮導語言",es:"Idioma del guía"},
  nt:{ko:"요청 메모 (선택)",en:"Notes for the guide (optional)",ja:"ガイドへのメモ（任意）",zhs:"给向导的留言（可选）",zht:"給嚮導的留言（可選）",es:"Notas para el guía (opcional)"},
  ntp:{ko:"예: 아이와 함께 가요 · 걷는 시간을 줄이고 싶어요",en:"e.g. Traveling with kids · Less walking, please",ja:"例：子ども連れです・歩く時間を減らしたい",zhs:"例如：带孩子同行·希望少走路",zht:"例如：帶孩子同行·希望少走路",es:"p. ej.: Viajamos con niños · Queremos caminar menos"},
  nm:{ko:"이름",en:"Name",ja:"お名前",zhs:"姓名",zht:"姓名",es:"Nombre"},
  ph:{ko:"휴대폰 번호",en:"Mobile number",ja:"携帯電話番号",zhs:"手机号码",zht:"手機號碼",es:"Móvil"},
  pgn:{ko:"PC에서 카드로 결제할 때 필요해요.",en:"Needed for card payment on a computer.",ja:"パソコンでカード決済するときに必要です。",zhs:"在电脑上刷卡付款时需要。",zht:"在電腦上刷卡付款時需要。",es:"Necesario para pagar con tarjeta en un ordenador."},
  amt:{ko:"결제 금액",en:"Price",ja:"お支払い金額",zhs:"付款金额",zht:"付款金額",es:"Precio"},
  krw:{ko:"",en:"Charged as KRW 100,000",ja:"KRW 100,000で決済されます",zhs:"按 KRW 100,000 结算",zht:"按 KRW 100,000 結算",es:"Se cobra como KRW 100,000"},
  agr:{ko:"일정과 메모를 가이드에게 보내는 데 동의하고 결제합니다",en:"I agree to share my plan and notes with the guide and to pay",ja:"日程とメモをガイドに送ることに同意し、支払います",zhs:"我同意将行程和留言发给向导并付款",zht:"我同意將行程和留言傳給嚮導並付款",es:"Acepto compartir mi plan y mis notas con el guía y pagar"},
  rf:{ko:"취소·환불 정책",en:"Cancellation & refund policy",ja:"キャンセル・返金ポリシー",zhs:"取消·退款政策",zht:"取消·退款政策",es:"Política de cancelación y reembolso"},
  cx:{ko:"취소",en:"Cancel",ja:"キャンセル",zhs:"取消",zht:"取消",es:"Cancelar"},
  pay:{ko:"결제하기",en:"Pay",ja:"支払う",zhs:"付款",zht:"付款",es:"Pagar"},
  sav:{ko:"저장 중…",en:"Saving…",ja:"保存中…",zhs:"保存中…",zht:"儲存中…",es:"Guardando…"},
  load:{ko:"가이드를 찾는 중…",en:"Finding guides…",ja:"ガイドを探しています…",zhs:"正在查找向导…",zht:"正在尋找嚮導…",es:"Buscando guías…"},
  none:{ko:"지금은 검토할 수 있는 가이드가 없어요. 잠시 뒤 다시 봐 주세요.",en:"No guide is available for reviews right now. Please check again later.",ja:"現在チェックできるガイドがいません。しばらくしてからご確認ください。",zhs:"目前没有可检查行程的向导，请稍后再看。",zht:"目前沒有可檢查行程的嚮導，請稍後再看。",es:"Ahora no hay guías disponibles para revisiones. Vuelve a mirar más tarde."},
  eem:{ko:"이메일 주소를 확인해 주세요.",en:"Please check your email address.",ja:"メールアドレスをご確認ください。",zhs:"请检查邮箱地址。",zht:"請檢查電子郵件地址。",es:"Revisa tu correo electrónico."},
  eph:{ko:"전화번호를 확인해 주세요.",en:"Please check your phone number.",ja:"電話番号をご確認ください。",zhs:"请检查电话号码。",zht:"請檢查電話號碼。",es:"Revisa tu número de teléfono."},
  egd:{ko:"지금은 이 언어 가이드가 없어요. 다른 언어를 골라 주세요.",en:"No guide speaks this language right now. Please choose another language.",ja:"現在この言語のガイドがいません。別の言語をお選びください。",zhs:"目前没有会这种语言的向导，请选择其他语言。",zht:"目前沒有會這種語言的嚮導，請選擇其他語言。",es:"Ahora no hay guías de este idioma. Elige otro idioma."},
  enog:{ko:"지금은 이 언어로 검토할 가이드가 없어 주문을 취소했어요. 결제 금액은 전액 환불돼요.",en:"No guide could take this review right now, so we cancelled the order. The full amount will be refunded.",ja:"現在この言語でチェックできるガイドがいないため、ご注文をキャンセルしました。お支払い金額は全額返金されます。",zhs:"目前没有能用这种语言检查的向导，订单已取消，付款金额将全额退款。",zht:"目前沒有能用這種語言檢查的嚮導，訂單已取消，付款金額將全額退款。",es:"Ahora ningún guía puede hacer esta revisión, así que cancelamos el pedido. Se reembolsará el importe total."},
  eplan:{ko:"일정을 보내지 못했어요. 일정을 다시 짠 뒤 해 주세요.",en:"Could not send the plan. Please make the plan again and retry.",ja:"日程を送れませんでした。日程を作り直してからお試しください。",zhs:"无法发送行程，请重新生成行程后再试。",zht:"無法傳送行程，請重新產生行程後再試。",es:"No se pudo enviar el plan. Vuelve a crearlo e inténtalo de nuevo."},
  efail:{ko:"저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.",en:"Could not save. Please try again shortly.",ja:"保存できませんでした。しばらくしてからもう一度お試しください。",zhs:"保存失败，请稍后再试。",zht:"儲存失敗，請稍後再試。",es:"No se pudo guardar. Inténtalo de nuevo en un momento."},
  pfT:{ko:"결제가 완료되지 않았어요 (취소 또는 실패).",en:"The payment was not completed (cancelled or failed).",ja:"決済が完了しませんでした（キャンセルまたは失敗）。",zhs:"付款未完成（已取消或失败）。",zht:"付款未完成（已取消或失敗）。",es:"El pago no se completó (cancelado o fallido)."},
  dT:{ko:"검토를 요청했어요",en:"Review requested",ja:"チェックを依頼しました",zhs:"已申请检查",zht:"已申請檢查",es:"Revisión solicitada"},
  dB:{ko:"{g} 가이드가 일정을 살펴보고 {t}(한국 시간)까지 이메일로 보내 드려요.",en:"{g} will check your plan and email you by {t} (Korea time).",ja:"{g}ガイドが日程をチェックし、{t}（韓国時間）までにメールでお送りします。",zhs:"向导{g}会检查您的行程，并在{t}（韩国时间）前通过邮件发送给您。",zht:"嚮導{g}會檢查您的行程，並在{t}（韓國時間）前透過電子郵件寄給您。",es:"{g} revisará tu plan y te escribirá antes de las {t} (hora de Corea)."},
  gx:{ko:"담당",en:"Your guide",ja:"担当",zhs:"",zht:"",es:"Tu guía"},
  oid:{ko:"주문번호",en:"Order no.",ja:"注文番号",zhs:"订单号",zht:"訂單號",es:"N.º de pedido"},
  em2:{ko:"받는 이메일",en:"Sent to",ja:"送信先",zhs:"接收邮箱",zht:"接收電子郵件",es:"Se envía a"},
  due:{ko:"마감",en:"Due by",ja:"締め切り",zhs:"截止",zht:"截止",es:"Plazo"},
  x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}};
var GRV={view:"form",langs:null,lerr:0,em:"",gl:"",nt:"",nm:"",ph:"",ag:false,err:"",busy:0,res:null};
var GRV_EM=/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/;
function grvCard(){ return '<div class="trgrv" data-html2canvas-ignore><button type="button" class="trgrvb" id="trGrvB">'+MPIMG("mi_guideperson",MIS)+'<span>'+esc(T5(GRV6.card))+' <i>'+esc(T5(GRV6.cardS))+'</i></span><b aria-hidden="true">›</b></button></div>'; }
function grvPrice(){ return LANG==="ko"?"10만 원":"USD 100"; }
function grvDue(ms){ return ms?new Date(ms+9*36e5).toISOString().slice(5,16).replace("T"," "):""; }
function grvClose(){ var b=document.getElementById("trGrvP"); if(b) b.remove(); }
function grvGrab(){ var b=document.getElementById("trGrvP"); if(!b||GRV.view!=="form") return; var f=function(id,k){ var e=b.querySelector("#"+id); if(e) GRV[k]=e.value; };
  f("grvEm","em"); f("grvGl","gl"); f("grvNt","nt"); f("grvNm","nm"); f("grvPh","ph"); var a=b.querySelector("#grvAg"); if(a) GRV.ag=a.checked; }
// 창 열기 — res 를 주면 끝난 화면(결제 완료·실패) · 이메일은 지난번 넣은 것 → 로그인 계정 이메일 순으로 미리 채운다
function grvOpen(res){ grvGrab(); grvClose(); if(!TR.plan) return;
  GRV.err=""; GRV.busy=0; GRV.res=res||null; GRV.view=res?"done":"form";
  var b=document.createElement("div"); b.id="trGrvP"; b.className="trpop"; b.onclick=function(e){ if(e.target===b&&!GRV.busy) grvClose(); }; b._rb=grvPaint; document.body.appendChild(b);
  if(!res){ if(!GRV.em){ try{ GRV.em=localStorage.getItem("mpv_grv_em")||""; }catch(e){} }
    if(!GRV.em&&sySess()) fetch(HUB+"/npg/me",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sess:sySess()})}).then(function(r){ return r.json(); }).then(function(j){
      var m=String((j&&j.ok&&j.me&&j.me.email)||"").trim(); if(m&&!GRV.em&&GRV_EM.test(m)){ GRV.em=m; var i=document.getElementById("grvEm"); if(i&&!i.value) i.value=m; } }).catch(function(){});
    GRV.langs=null; GRV.lerr=0;
    fetch(HUB+"/shop/grv/info").then(function(r){ return r.json(); }).then(function(j){ GRV.langs=(j&&j.ok&&Array.isArray(j.langs))?j.langs:[]; if(!(j&&j.ok)) GRV.lerr=1; })
      .catch(function(){ GRV.langs=[]; GRV.lerr=1; }).then(function(){ if(document.getElementById("trGrvP")&&GRV.view==="form") grvPaint(); }); }
  grvPaint(); try{ ntap("_trip",res?"grv_res":"grv_open"); }catch(e){} }
function grvPaint(){ var b=document.getElementById("trGrvP"); if(!b) return; grvGrab();
  var h='<div class="grvbox"><button type="button" class="grvx" data-grv="x" aria-label="close"'+(GRV.busy?' disabled':'')+'>✕</button>';
  if(GRV.view==="done"){ var r=GRV.res||{}, j=r.j||{};
    if(r.ok) h+='<div class="grvt"><span class="grvok">✓</span> '+esc(T5(GRV6.dT))+'</div><div class="grvd">'+esc(gTxt(GRV6.dB,{g:j.gname||T5(GRV6.gx),t:"\u0001"})).replace("\u0001",'<span class="grvnw">'+esc(grvDue(j.due))+'</span>')+'</div>'
      +'<div class="grvrs"><div class="grvr"><span>'+esc(T5(GRV6.oid))+'</span><b>'+esc(j.orderId||"")+'</b></div><div class="grvr"><span>'+esc(T5(GRV6.amt))+'</span><b>'+esc(grvPrice())+'</b></div>'
      +'<div class="grvr"><span>'+esc(T5(GRV6.em2))+'</span><b>'+esc(r.em||"")+'</b></div>'+(j.due?'<div class="grvr"><span>'+esc(T5(GRV6.due))+'</span><b>'+esc(grvDue(j.due))+' (KST)</b></div>':'')+'</div>';
    else h+='<div class="grvt">'+esc(T5(GRV6.title))+'</div><div class="'+(r.soft?'grvd':'grverr')+'">'+esc(r.msg||T5(GRV6.efail))+'</div>';
    b.innerHTML=h+'<div class="grvbt"><button type="button" class="trbtn" data-grv="x">'+esc(T5(GRV6.x))+'</button></div></div>'; return; }
  var L0=GRV.langs, pg=!!(window.TPG&&TPG.on), bz=GRV.busy?' disabled':'', dis=GRV.busy||!GRV.ag||!L0||!L0.length;
  h+='<div class="grvt">'+esc(T5(GRV6.title))+' <span class="grvo">'+esc(T5(GRV6.opt))+'</span></div>'
    +'<div class="grvd">'+esc(T5(GRV6.desc))+'</div><ul class="grvl"><li>'+esc(T5(GRV6.b1))+'</li><li>'+esc(T5(GRV6.b2))+'</li><li>'+esc(T5(GRV6.b3))+'</li></ul>'
    +'<div class="grvn">'+esc(T5(GRV6.free))+'</div>'
    +'<label class="gslb" for="grvEm">'+esc(T5(GRV6.em))+'</label><input class="gsin" id="grvEm" type="email" inputmode="email" autocomplete="email" maxlength="100" value="'+esc(GRV.em)+'"'+bz+'>'
    +'<label class="gslb" for="grvGl">'+esc(T5(GRV6.gl))+'</label>';
  if(!L0) h+='<div class="grvn">'+esc(T5(GRV6.load))+'</div>';
  else if(!L0.length) h+='<div class="grverr">'+esc(T5(GRV.lerr?GRV6.efail:GRV6.none))+'</div>';
  else { if(L0.indexOf(GRV.gl)<0) GRV.gl=L0.indexOf(LANG)>=0?LANG:L0[0];   // 처음엔 앱 언어 — 그 언어 가이드가 없으면 있는 말 중 첫째
    h+='<select class="gsin" id="grvGl"'+bz+'>'+L0.map(function(l){ return '<option value="'+esc(l)+'"'+(l===GRV.gl?' selected':'')+'>'+esc(gsLangName(l))+'</option>'; }).join("")+'</select>'; }
  h+='<label class="gslb" for="grvNt">'+esc(T5(GRV6.nt))+'</label><textarea class="gsin" id="grvNt" maxlength="1000" rows="2" placeholder="'+esc(T5(GRV6.ntp))+'"'+bz+'>'+esc(GRV.nt)+'</textarea>';
  if(pg) h+='<label class="gslb" for="grvNm">'+esc(T5(GRV6.nm))+'</label><input class="gsin" id="grvNm" maxlength="40" autocomplete="name" value="'+esc(GRV.nm)+'"'+bz+'>'   // KG이니시스 PC 결제 = 이름·전화·이메일 필요 (PG 켠 뒤에만 보임)
    +'<label class="gslb" for="grvPh">'+esc(T5(GRV6.ph))+'</label><input class="gsin" id="grvPh" type="tel" maxlength="30" autocomplete="tel" value="'+esc(GRV.ph)+'"'+bz+'><div class="grvn">'+esc(T5(GRV6.pgn))+'</div>';
  h+='<div class="grvp"><span>'+esc(T5(GRV6.amt))+'</span><span><b>'+esc(grvPrice())+'</b>'+(LANG!=="ko"?'<i>'+esc(T5(GRV6.krw))+'</i>':'')+'</span></div>'
    +'<label class="gschk"><input type="checkbox" id="grvAg"'+(GRV.ag?' checked':'')+bz+'><span>'+esc(T5(GRV6.agr))+' · <a href="refund.html?lang='+esc(LANG)+'" target="_blank" rel="noopener">'+esc(T5(GRV6.rf))+' ›</a></span></label>'
    +(GRV.err?'<div class="grverr">'+esc(GRV.err)+'</div>':'')
    +'<div class="grvbt"><button type="button" class="trbtn" data-grv="x"'+bz+'>'+esc(T5(GRV6.cx))+'</button><button type="button" class="trbtn pri" data-grv="go"'+(dis?' disabled':'')+'>'+esc(GRV.busy===2?((window.TPG&&TPG.tx("opn"))||"…"):GRV.busy?T5(GRV6.sav):T5(GRV6.pay))+'</button></div></div>';
  b.innerHTML=h;
  var ag=b.querySelector("#grvAg"); if(ag) ag.onchange=function(){ GRV.ag=ag.checked; var g=b.querySelector('[data-grv="go"]'); if(g) g.disabled=!!GRV.busy||!GRV.ag||!GRV.langs||!GRV.langs.length; }; }
// 「결제하기」 — 이메일 확인 → 지금 일정의 공유 링크 → 허브 /shop/order (PG 전 = 바로 결제 완료 · PG 뒤 = 결제창)
function grvGo(){ if(GRV.busy||!TR.plan) return; grvGrab(); var em=String(GRV.em||"").trim(), pg=!!(window.TPG&&TPG.on), pl=TR.plan;
  if(!GRV_EM.test(em)){ GRV.err=T5(GRV6.eem); grvPaint(); try{ document.getElementById("grvEm").focus(); }catch(e){} return; }
  if(!GRV.ag||!GRV.langs||GRV.langs.indexOf(GRV.gl)<0) return;
  GRV.err=""; GRV.busy=1; grvPaint();
  tripUrl().then(function(u){ var tp=String(u).split("#tp=")[1]||"", d0=(pl.days&&pl.days[0]&&pl.days[0].date)||"";
    return fetch(HUB+"/shop/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pid:"grv",pname:T5(GRV6.title),tp:tp,start:d0,days:pl.days.length,glang:GRV.gl,lang:window.LANG||"en",email:em,note:String(GRV.nt||"").trim().slice(0,1000),
      name:String(GRV.nm||"").trim()||undefined,phone:String(GRV.ph||"").trim()||undefined,consent:true,pg:pg?1:0,sess:sySess()||undefined})}); })
    .then(function(r){ return r.json(); }).then(function(j){
      if(!(j&&j.ok&&j.orderId)){ var e=j&&j.err, pe=window.TPG?TPG.errTx(e):""; GRV.busy=0;
        if(e==="noguide"){ grvOpen({ok:false,msg:T5(GRV6.enog)}); return; }
        GRV.err=pe||T5(e==="email"?GRV6.eem:e==="guide"?GRV6.egd:(e==="plan"||e==="long")?GRV6.eplan:e==="phone"?GRV6.eph:GRV6.efail); grvPaint(); return; }
      try{ localStorage.setItem("mpv_grv_em",em); }catch(z){} try{ ntap("_trip","grv_order"); }catch(z){}
      if(j.pay!=="pg"){ grvOpen({ok:true,j:j,em:em}); return; }
      GRV.busy=2; grvPaint();   // KG이니시스 결제창 (tpg.js) — 돌아오면 아래 TPG.onRet("grv")
      return TPG.go(j,{kind:"grv",oid:j.orderId,em:em},{name:GRV.nm,email:em,phone:GRV.ph}).then(function(m){ if(m){ GRV.busy=0; GRV.err=m; grvPaint(); } }); })
    .catch(function(){ GRV.busy=0; GRV.err=T5(GRV6.efail); grvPaint(); }); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep #trGrvB"); if(!a) return; e.preventDefault(); grvOpen(); });
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trGrvP [data-grv]"); if(!a||a.disabled) return; e.preventDefault(); if(a.dataset.grv==="go") grvGo(); else if(!GRV.busy) grvClose(); });
if(window.TPG) TPG.onRet("grv",function(v,r){ var n=0, iv=setInterval(function(){ if(!((window.CITY&&Object.keys(CITY).length)||++n>100)) return; clearInterval(iv);   // 지도 자료가 붙은 뒤 카트 보고서 → 끝난 화면 (?trip=1 과 같은 기다림)
  try{ if(TR.plan&&!document.getElementById("trRep")) openReport(); }catch(e){}
  if(r&&r.ok) grvOpen({ok:true,j:r.j||{},em:v.em||""});
  else grvOpen({ok:false,soft:r&&r.err==="wait"?1:0,msg:(r&&r.err==="noguide")?T5(GRV6.enog):((window.TPG&&TPG.resTx(r))||(T5(GRV6.pfT)+(r&&r.msg?" ("+r.msg+")":"")))}); },100); });
(function(){ var c=document.createElement("style"); c.textContent=""
  +".trgrv{margin:0 0 8px}.trgrvb{display:flex;align-items:center;gap:2px;width:100%;box-sizing:border-box;border:1.5px dashed #0c8599;background:var(--card);color:#0b7285;border-radius:12px;padding:8px 12px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;text-align:left;line-height:1.35}"
  +".trgrvb span{flex:1;min-width:0}.trgrvb i{font-style:normal;font-weight:700;color:var(--sub);font-size:12.5px;white-space:nowrap}.trgrvb b{font-size:17px;line-height:1;color:var(--sub)}:root[data-theme=dark] .trgrvb{color:#99e9f2}"
  +"#trGrvP{z-index:1058}#trGrvP>div.grvbox{position:relative;text-align:left;width:100%;max-width:460px;box-sizing:border-box;padding:14px 16px 16px}"
  +".grvx{position:absolute;right:6px;top:4px;border:0;background:var(--card);border-radius:50%;width:34px;height:34px;font-size:19px;color:var(--sub);cursor:pointer}"
  +".grvt{font-size:17px;font-weight:900;margin:2px 36px 6px 0;line-height:1.35}.grvo{display:inline-block;vertical-align:2px;font-size:12px;font-weight:800;color:#0b7285;background:#e3fafc;border-radius:999px;padding:2px 8px}:root[data-theme=dark] .grvo{background:#0a2a30;color:#99e9f2}"
  +".grvd{font-size:14px;line-height:1.55}.grvl{margin:8px 0 0;padding-left:18px;font-size:13.5px;line-height:1.55}.grvn{font-size:12.5px;color:var(--sub);margin-top:6px;line-height:1.45}"
  +"#trGrvP textarea.gsin{min-height:58px;resize:vertical}#trGrvP select.gsin{font-size:15px}"
  +".grvp{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding:9px 11px;border-radius:10px;background:var(--bg);font-size:14px}.grvp b{font-size:18px}.grvp i{display:block;font-style:normal;font-size:12px;color:var(--sub);text-align:right}.grvp>span:last-child{text-align:right}"
  +".grverr{color:#c2410c;font-weight:800;font-size:13.5px;margin-top:8px;line-height:1.45}.grvbt{display:flex;gap:8px;margin-top:12px}.grvbt .trbtn{margin:0;flex:1;padding:11px 12px;font-size:15px}.grvbt .trbtn[disabled]{opacity:.45;cursor:default}"
  +".grvok{color:#2b8a3e}.grvrs{margin-top:10px}.grvr{display:flex;justify-content:space-between;gap:10px;border-top:1px solid var(--line);padding:7px 0;font-size:13.5px}.grvr span{color:var(--sub);flex:0 0 auto}.grvr b{text-align:right;word-break:break-all}.grvnw{white-space:nowrap}#trGrvP .gschk a{white-space:nowrap}";
  document.head.appendChild(c); })();
function fromShare(z){ return unzip(z).then(function(s){ var o=JSON.parse(s); if(!o||o.v!==1||!Array.isArray(o.d)) throw 0;
  return Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){
    var items=[], days=[], pool={};   // 11-06 — 옛 링크(7일까지)·새 링크(90일까지) 모두
    o.d.slice(0,MAXD).forEach(function(arr){ var ks=[]; (arr||[]).slice(0,MAXN).forEach(function(x){ var it=typeof x==="string"?snapPlace(x):(Array.isArray(x)?{ko:String(x[0]).slice(0,80),en:String(x[1]).slice(0,80),lat:+x[2],lng:+x[3],pin:1}:null);
      if(it&&Array.isArray(x)) pinFrom(x[4],it);   // 밤 장소 여부·영업시간 (11-06, 옛 링크엔 없음 → 이름 낱말 규칙)
      if(it&&Array.isArray(x)&&x[5]&&typeof x[5]==="object"){ it.eat=1; it.meal=/^(lunch|dinner)$/.test(x[5].e)?x[5].e:""; var m5=+x[5].m; if(m5>=5&&m5<=600) it.um=Math.round(m5); }   // 손님이 넣은 식당 (11-07)
      if(!it||!isFinite(it.lat)||!isFinite(it.lng)) return; if(it.pin) it.k=pinKey(it); if(pool[it.k]) return;
      if(!it.um&&o.u&&typeof o.u==="object"){ var mu=+o.u[it.k]; if(mu>=5&&mu<=1440) it.um=Math.round(mu); }   // 손님이 고른 머무는 시간 (11-07)
      if(o.z&&typeof o.z==="object"&&o.z[it.k]!=null){ var fz=fxOf({fx:o.z[it.k]}); if(fz!=null) it.fx=fz; }   // 손님이 정한 시작 시각 (11-07)
      it.stay=stayOf(it); pool[it.k]=it; items.push(it); ks.push(it.k); }); days.push(ks); });
    if(TR.items.length&&!confirm(T("받은 일정으로 바꿀까요? (지금 담은 목록은 바뀝니다)","Replace your current trip with the shared plan?"))) return false;
    var h=Array.isArray(o.h)?{type:"addr",ko:String(o.h[0]).slice(0,80),en:String(o.h[1]).slice(0,80),lat:+o.h[2],lng:+o.h[3]}:null;
    var sv0=TR.saved||[], pid0=TR.pid||1, pno0=TR.pno||1;   // 11-08 내 플랜 — 받은 일정은 지금 플랜 자리에 · 다른 플랜은 그대로
    TR={items:items.map(function(x){ var y=Object.assign({},x); delete y.stay; return y; }),opt:{n:days.length,start:o.s,from:o.f,to:o.t,walk:+o.w||1,hotel:h},pid:pid0,pno:pno0,saved:sv0};
    TR.plan={v:1,ord:1,at:Date.now(),from:hm2m(o.f)||570,to:hm2m(o.t)||1200,hotel:h,days:days.map(function(ks,i){ return {date:dayDate(i).toISOString().slice(0,10),stops:ks}; }),pool:pool,skip:[],ai:null};   // ord = 받은 순서 그대로(숙소를 바꿔도 안 섞음, 11-07)
    TR.plan.H=h?{k:"__hotel",ko:h.ko,en:h.en,lat:h.lat,lng:h.lng,hotel:1}:null;
    if(o.x&&typeof o.x==="object"){ try{ natFromShare(TR.plan,o.x); }catch(e){ try{ console.error(e); }catch(z){} } }
    if(Array.isArray(o.r)) o.r.slice(0,200).forEach(function(q){ if(!Array.isArray(q)) return; var d=TR.plan.days[+q[0]], k=days[+q[0]]&&days[+q[0]][+q[1]]; if(!d||!k||d.stops.indexOf(k)<0) return; (d.rs=d.rs||[]).push({k:k,m:/^(lunch|dinner)$/.test(q[2])?q[2]:""}); });   // 숙소에서 쉬기 (11-07)   // 전국 일정 (11-06) — 날마다 장소는 받은 그대로, 도시·이동·숙소 틀만 다시
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
 ab:{ko:"이대로 가면 {p}% 확률로 {t}까지 다 못 돌거나 마감 시각에 늦어요.",en:"At this pace there is a {p}% chance you won’t see everything by {t} or will reach a place after it closes.",ja:"このままだと{p}%の確率で{t}までに回りきれないか、閉店時刻に間に合いません。",zhs:"照这样下去，有{p}%的可能{t}前逛不完或赶不上关门时间。",zht:"照這樣下去，有{p}%的可能{t}前逛不完或趕不上關門時間。",es:"A este ritmo hay un {p}% de probabilidad de no verlo todo antes de las {t} o de llegar a un lugar ya cerrado."},
 bb:{ko:"끝나는 시각까지 다 못 돌거나 마감에 늦을 확률 {p}% — 눌러서 남은 일정을 정하세요",en:"{p}% chance you won’t finish in time or will miss closing times — tap to decide",ja:"予定の時刻までに回りきれないか閉店に遅れる確率{p}% — 押して残りの予定を決めてください",zhs:"有{p}%的可能按时逛不完或赶不上关门时间——点按决定剩余行程",zht:"有{p}%的可能按時逛不完或趕不上關門時間——點按決定剩餘行程",es:"{p}% de probabilidad de no terminar a tiempo o de llegar tras el cierre — toca para decidir"},
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
  var ps=sched(H,arr,dt,from!=null?from:pl.from,mo), ml={}, li=-1; ps.rows.forEach(function(r){ if(r.meal) (ml[li]=ml[li]||[]).push(r.meal); else if(r.x) li=arr.indexOf(r.x); });
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
function liveState(){ var L=liveToday(); if(!L||!L.arr.length||(L.d&&L.d.md)) return null; var pl=L.pl, X=liveX(L), H=X.H, dt=X.dt, mo=moX(L.di,X), lv=liveLv(pl,L.di,H,L.arr,dt,mo,X.from); if(!lv) return null;
  var s=sched(H,L.arr,dt,X.from,mo,lv), E=Math.max(dayLim(pl,L.d,H,L.arr,dt,X),sched(H,L.arr,dt,X.from,mo).end), rest=L.arr.slice(lv.i+1);   // 11-08 끝나는 시각은 참고만 — 짜 둔 일정보다 늦어질 때만
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
 // 11-07 도착한 날 — 공항에서 첫날 숙소로 먼저 (짐 맡기기·체크인 30분) · 밤에 닿으면 쉬기 · 숙소를 안 정했으면 서울역(다른 도시는 도시 중심) 기준
 chk:{ko:"숙소 들르기 · 짐 맡기기·체크인 (30분)",en:"Stop at your lodging · drop bags / check in (30 min)",ja:"宿に立ち寄り・荷物預け・チェックイン（30分）",zhs:"先去住处 · 寄放行李·办理入住（30分钟）",zht:"先去住處 · 寄放行李·辦理入住（30分鐘）",es:"Pasar por el alojamiento · dejar el equipaje / registrarse (30 min)"},
 rest:{ko:"숙소 도착 · 쉬기",en:"Arrive at your lodging · rest",ja:"宿に到着・休む",zhs:"到达住处 · 休息",zht:"到達住處 · 休息",es:"Llegada al alojamiento · descansar"},
 hTmp:{ko:"숙소 미정 — {p} 기준",en:"Lodging not set — using {p}",ja:"宿未定 — {p}を基準に",zhs:"住宿未定——以{p}为准",zht:"住宿未定——以{p}為準",es:"Alojamiento sin elegir: referencia {p}"},
 cen:{ko:"{c} 중심",en:"central {c}",ja:"{c}中心部",zhs:"{c}市中心",zht:"{c}市中心",es:"centro de {c}"},
 h1st:{ko:"첫날 숙소를 먼저 정해 주세요",en:"Please choose your first night's lodging first",ja:"まず初日の宿を決めてください",zhs:"请先确定第一晚的住宿",zht:"請先確定第一晚的住宿",es:"Elige primero el alojamiento de la primera noche"},
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
function moX(di,X){ var m=mealsOf(di), pl=TR.plan, d=pl&&pl.days[di]; if(X&&X.to!=null) m.to=X.to;
  if(d&&Array.isArray(d.rs)&&d.rs.length){ var P=rsPt(pl,di,X||dayX(pl,di,REPH||pl.H||null)); if(P) m.rs=d.rs.map(function(z){ return {k:z.k,m:z.m||"",p:P}; }); }   // 숙소에서 쉬기 (11-07)
  return m; }
// 숙소에서 쉴 곳 (11-07) — 그날 밤 숙소(없으면 아침에 나선 숙소) · 전국 일정에서 숙소를 안 정했으면 도착한 날과 같은 기준(서울역·도시 중심) · 그 밖엔 null(「숙소를 아직 정하지 않았어요」)
function rsPt(pl,di,X){ var P=X?hpOf(X.H):null; if(P) return P; if(pl&&pl.mc){ var d=pl.days[di], nc=d&&(d.nc!=null?d.nc:d.c); if(nc!=null&&nc>=0) return tmpLodge(pl,nc); } return null; }
function cnm(c){ return !c?"":LANG==="ko"?c.ko:(c[LANG]||c.en||c.ko); }
function ptNm(p){ if(!p) return ""; if(p.k&&!/^__/.test(p.k)) return nm(p); return LANG==="ko"?p.ko:(p[LANG]||p.en||p.ko); }
function won(n){ return (+n||0).toLocaleString()+T("원"," KRW"); }

function legGo(lg){ return ""; }   // 11-08 사장님 — 「…보기」 글자와 ▼ 는 뺐다: 이동 줄 전체를 누르면 교통 창(legTransit) · 끝의 › 는 CSS   // 줄 오른쪽 끝 공통 ▼/— 단추 (11-07)
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
// 첫날 숙소를 아직 안 정했을 때 도착한 날 들르는 곳 (11-07 사장님) — 서울은 서울역, 다른 도시는 도시 중심(CITYNM) · 둘 다 아니면 그 도시 장소들 가운데
var TLC={}, SEOUL_ST={ko:"서울역",en:"Seoul Station",ja:"ソウル駅",zhs:"首尔站",zht:"首爾站",es:"Estación de Seúl",lat:37.5547,lng:126.9707};
function tmpLodge(pl,ci){ var c=pl&&pl.cities&&pl.cities[ci]; if(!c) return null; var key=c.id+"|"+c.lat+"|"+c.lng; if(TLC[ci]&&TLC[ci].key===key) return TLC[ci].p;
  var id=String(c.id||"").split(/[-+]/)[0], q=CITYNM.filter(function(z){ return z[0]===id; })[0], o=q?nmOf(q):c, p=id==="seoul"?Object.assign({},SEOUL_ST):F6x(NX6.cen,function(l){ return {c:o[l]||o.en||o.ko}; });
  if(id!=="seoul"){ p.lat=q?q[7]:+c.lat; p.lng=q?q[8]:+c.lng; }
  p.k="__lt"+ci; p.tmp=1; p.ci=ci; TLC[ci]={key:key,p:p}; return p; }
function natPt(pl,k){ if(!pl) return null; var m=/^__ht(\d+)$/.exec(k); if(m) return hotelPt(pl,+m[1]); m=/^__lt(\d+)$/.exec(k); if(m) return tmpLodge(pl,+m[1]); m=/^__ap_(\w+)$/.exec(k); if(m) return apPt(m[1]);
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
function natAlloc(L,T,D,cap,red0,redN,to,MN){ var k=L.length; if(k<=1) return {n:[D],f:[]};   // MN[i] = 구간 i 에 줄 가장 적은 날 수 (11-08, 없으면 1)
  var mn=function(i){ return Math.max(1,(MN&&MN[i])||1); };   // 11-07 사장님 「풀어」 — 도착한 날 저녁에도 다른 도시로 옮길 수 있다(「도착한 날 저녁 이동 금지」 뺌)
  var best=null, bs=1e18, n=[];
  var SL=L.reduce(function(a,x){ return a+Math.max(30,x); },0), ST=D*cap-red0-redN;   // 남는 날은 장소 양에 비례해서 (11-06 — 장소 하나뿐인 도시에 빈 날이 몰리지 않게)
  var evalc=function(){ for(var m=0;m<(1<<(k-1));m++){ var f=[], s=0, b, i; for(b=0;b<k-1;b++) f.push((m>>b)&1?"am":"pm");
      for(i=0;i<k;i++){ var base=n[i]*cap-(i===0?red0:0)-(i===k-1?redN:0), av=base, tg=ST*Math.max(30,L[i])/SL; if(i>0&&f[i-1]==="am") av-=T[i-1]; if(i<k-1&&f[i]==="pm") av-=Math.max(0,to-(LATE-T[i]));
        var ov=L[i]-av, sl=PK_SL*n[i]; s+=(ov<=0?0:ov<=sl?ov*0.05:sl*0.05+(ov-sl)*10)+(i<k-1?20*n[i]:0); if(i<k-1&&f[i]==="am") s+=3; }   // 11-08 도시마다 필요한 날만 — 남는 날은 마지막 도시(맨 뒤 자유 일정)   // 넘침이 같으면 저녁 이동 · 남는 시간은 장소 양에 비례
      if(s<bs-1e-9){ bs=s; best={n:n.slice(),f:f}; } } };
  var rec=function(i,left){ if(i===k-1){ if(left<mn(i)) return; n[i]=left; evalc(); return; } for(var v=mn(i);v<=left-(k-1-i);v++){ n[i]=v; rec(i+1,left-v); } };
  // 경우의 수 = 날 나누기 C(D-1,k-1) × 아침/저녁 2^(k-1) — 7일 일정처럼 적으면 예전처럼 다 따지고, 많으면(30·90일, 도시 여럿) 같은 점수를 도시 차례로 쌓아 가장 작은 것 (11-06)
  var cmb=1; for(var q=1;q<k;q++){ cmb=cmb*(D-q)/q*2; if(cmb>2e4) break; }
  if(cmb<=2e4){ rec(0,D); return best; }
  return natAllocDP(L,T,D,cap,red0,redN,to,SL,ST,MN); }
// natAlloc 과 같은 점수(넘침 10배 + 장소 양 비례 0.02 + 아침 이동 3)를 도시 차례로 — f[i]=도시 i 와 i+1 사이 이동(pm·am) · 상태 = (쓴 날, 앞 이동)
function natAllocDP(L,T,D,cap,red0,redN,to,SL,ST,MN){ var k=L.length, INF=1e18, F=["pm","am"], i, u, fp, v, fi;
  var dp=[], bk=[]; for(i=0;i<=k;i++){ dp.push([]); bk.push([]); for(u=0;u<=D;u++){ dp[i].push([INF,INF]); bk[i].push([null,null]); } }
  dp[0][0][0]=0;
  for(i=0;i<k;i++){ var tg=ST*Math.max(30,L[i])/SL, last=i===k-1;
    for(u=0;u<=D;u++) for(fp=0;fp<2;fp++){ var c0=dp[i][u][fp]; if(c0>=INF) continue;
      var vmin=last?D-u:Math.max(1,(MN&&MN[i])||1), vmax=last?D-u:D-u-(k-1-i);
      for(v=vmin;v<=vmax;v++){ if(v<1||v<((MN&&MN[i])||1)) continue; var base=v*cap-(i===0?red0:0)-(last?redN:0);
        for(fi=0;fi<(last?1:2);fi++){ var av=base; if(i>0&&fp===1) av-=T[i-1]; if(!last&&fi===0) av-=Math.max(0,to-(LATE-T[i]));
          var ov=L[i]-av, sl=PK_SL*v, c=c0+(ov<=0?0:ov<=sl?ov*0.05:sl*0.05+(ov-sl)*10)+(last?0:20*v)+(!last&&fi===1?3:0);   // 11-08 natAlloc 과 같은 점수
          if(c<dp[i+1][u+v][fi]-1e-9){ dp[i+1][u+v][fi]=c; bk[i+1][u+v][fi]=[u,fp,v]; } } } } }
  var n=new Array(k), f=new Array(k-1), cu=D, cf=0;
  for(i=k;i>=1;i--){ var b=bk[i][cu][cf]; if(!b) return null; n[i-1]=b[2]; if(i<k) f[i-1]=F[cf]; cu=b[0]; cf=b[1]; }
  return {n:n,f:f}; }
function natPlan(H,Dn){ var o=TR.opt, D=Math.max(1,Dn||o.n), from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), skip=[];
  var P=TR.items.filter(function(it){ var c=catOf(it); if(c==="hotel"||c==="trans"){ skip.push(it); return false; } return true; }).map(function(it){ return Object.assign({},it,{stay:stayOf(it)}); });
  var PE=OLD()?[]:P.filter(function(x){ return x.eat; }); if(PE.length) P=P.filter(function(x){ return !x.eat; });   // 11-08 식당은 관광지와 섞지 않는다 (eatAssign)
  var MD=OLD()?[]:P.filter(function(x){ return udOf(x); }); if(MD.length) P=P.filter(function(x){ return !udOf(x); });   // 11-08 일 단위로 머무는 곳 (mdPlace)
  if(!P.length) return null;
  var ap=apOpt(), G=natGroups(P); if(G.length<2&&!ap.a&&!ap.d) return null;   // 도시 하나·공항 없음 = 예전 길
  if(o.hAll&&o.hotel&&G.length>1){ if(!ap.a&&!ap.d) return null; while(G.length>1){ var g0=G.shift(), g1=G.shift(); G.unshift({pts:g0.pts.concat(g1.pts),first:Math.min(g0.first,g1.first),lat:(g0.lat+g1.lat)/2,lng:(g0.lng+g1.lng)/2,isle:g0.isle,id:g0.id+"+"+g1.id,nm:(function(){ var q={id:g0.id+"+"+g1.id}; LG6s.forEach(function(l){ q[l]=g0.nm[l]+"·"+g1.nm[l]; }); return q; })()}); } }   // 「여행 내내 이 숙소」 = 한 숙소에서 오가는 일정
  NATH=H&&H.here?H:null; natHotels(G,H);
  if(!OLD()){ var plS=natPlanSeq(H,MD.length?Math.max(1,D-MD.reduce(function(a,x){ return a+udOf(x); },0)):D,P,G,ap,from,to,cap,skip); if(plS){ pmFlipAll(plS,H); mdPlace(plS,MD); eatAssign(plS,H,PE); } return plS; }   // 11-07 손님 순서 그대로 (아래 옛 길은 비교·시험용 스위치에서만)
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
// 11-07 사장님 — 전국 일정도 손님 순서 그대로. 카트 순서를 따라 같은 도시가 이어지는 구간(segment)으로 자르고, 구간 차례 그대로 도시를 옮겨 다닌다
//   · 도시를 오가는 순서(서울 → 부산 → 서울)도 그대로 둔다 — pl.zig 에 적어 검사 창에서 알린다(옮기지 않는다)
//   · 날 배분(natAlloc)·도시 이동 칸(열차·버스·항공)·아침/저녁 이동·공항은 예전과 같은 계산 · 구간 안 날짜 나누기 = seqSplit(순서 그대로)
//   · 도시(pl.cities)는 처음 나온 차례로 하나씩 — 같은 도시를 다시 가면 같은 숙소(공유 링크 natRebuild 와 같은 꼴)
function natPlanSeq(H,D,P,G,ap,from,to,cap,skip){ var o=TR.opt;   // 「여행 내내 이 숙소」는 natPlan 이 이미 한 묶음으로 합쳐 둠 — 아래 구간 자르기가 P(손님 순서)를 따라가니 순서는 그대로
  var gi=new Map(); G.forEach(function(g){ g.pts.forEach(function(x){ gi.set(x,g); }); });
  var ord=[]; P.forEach(function(x,pi){ var g=gi.get(x)||G[0], l=ord[ord.length-1]; if(l&&l.g===g){ l.pts.push(x); return; }
    ord.push({g:g,pts:[x],first:pi,lat:g.lat,lng:g.lng,isle:g.isle,id:g.id,nm:g.nm,h:g.h}); });
  var A=ap.a?apPt(ap.a.id):null, Dp=ap.d?apPt(ap.d.id):null;
  while(ord.length>D) natMerge(ord);
  var cities=[], cix={}; ord.forEach(function(sg){ if(cix[sg.id]==null){ cix[sg.id]=cities.length; cities.push({id:sg.id,ko:sg.nm.ko,en:sg.nm.en,ja:sg.nm.ja,zhs:sg.nm.zhs,zht:sg.nm.zht,es:sg.nm.es,lat:Math.round(sg.lat*1e5)/1e5,lng:Math.round(sg.lng*1e5)/1e5,isle:sg.isle,h:sg.h||null}); } sg.ci=cix[sg.id]; });
  var zig=[], seen={}; ord.forEach(function(sg,si){ if(seen[sg.id]&&si>0) zig.push({k:sg.pts[0].k,c:sg.nm}); seen[sg.id]=1; });
  var k=ord.length, TRS=[], T=[], i;
  for(i=0;i+1<k;i++){ var tr=natTr(gAnchor(ord[i]),gAnchor(ord[i+1]),ord[i].ci,ord[i+1].ci); TRS.push(tr); T.push(trDoor(tr)); }
  var apIn=A&&km(A,ord[0])>80?natTr(A,gAnchor(ord[0]),-1,ord[0].ci):null, apOut=Dp&&km(Dp,ord[k-1])>80?natTr(gAnchor(ord[k-1]),Dp,ord[k-1].ci,-2):null;
  var red0=0, redN=0;
  if(A){ var X0=dayX({mc:1,from:from,to:to,ap:{a:ap.a,d:null},cities:cities,tr:apIn?[apIn]:[],pool:{},days:[{date:dayDate(0).toISOString().slice(0,10),stops:[],c:ord[0].ci,nc:(D<2&&Dp)?-1:ord[0].ci,am:apIn?0:null}]},0,H);
    red0=X0.rest?cap-60:X0.from-from; }   // 11-07 아침에 내려 시작 시각 전에 숙소를 들렀으면 그날이 그만큼 길다(red0 < 0 — 그날 틀 dayX 와 같게)   // 11-07 도착한 날 — 그날 틀(dayX) 그대로: 공항(먼 도시면 도시 이동) → 첫날 숙소 들르기(30분)까지 뺀 나머지 · 숙소 들른 뒤가 20시 넘으면 0 (예전 = 공항에서 첫 장소까지)
  if(Dp){ var by=ap.d.t!=null?ap.d.t-(ap.d.k==="d"?90:180):to; redN=Math.max(0,to-by)+(apOut?trDoor(apOut):Math.round(25+km(Dp,ord[k-1])*1.1)); }
  var L=ord.map(function(g){ var hp=g.h&&g.h.type!=="here"&&isFinite(+g.h.lat)?{lat:+g.h.lat,lng:+g.h.lng}:null; return seqLoad(hp,g.pts); });
  var MN=ord.map(function(g){ var hp=g.h&&g.h.type!=="here"&&isFinite(+g.h.lat)?{lat:+g.h.lat,lng:+g.h.lng}:null, m=Math.min(D,g.pts.length); return m>1?seqSplit(hp,g.pts,m,cap).filter(function(x){ return x.length; }).length:1; });   // 11-08 구간마다 꽉 채워 필요한 날 수
  if(MN.reduce(function(a,b){ return a+b; },0)>D) MN=null;   // 날짜가 모자라면 예전처럼(넘침 점수만)
  var al=natAlloc(L,T,D,cap-60,red0,redN,to,MN);
  var pl={v:1,mc:1,ord:1,at:Date.now(),from:from,to:to,hotel:o.hotel&&o.hotel.type!=="here"?o.hotel:(o.hotel?{type:"here"}:null),days:[],pool:{},skip:skip.map(function(x){ return x.k; }),ai:null,tr:[],cities:cities,ap:(ap.a||ap.d)?{a:ap.a,d:ap.d}:null};
  if(zig.length) pl.zig={r:ord.map(function(sg){ return sg.nm; }),z:zig};
  P.forEach(function(x){ pl.pool[x.k]=x; });
  var di=0, segD=[]; ord.forEach(function(sg,si){ segD.push([]); for(var j=0;j<al.n[si];j++){ pl.days.push({date:dayDate(di).toISOString().slice(0,10),stops:[],c:sg.ci,nc:sg.ci}); segD[si].push(di); di++; } });
  TRS.forEach(function(tr,bi){ tr.w=al.f[bi]; if(tr.w==="pm"){ tr.di=segD[bi][segD[bi].length-1]; pl.days[tr.di].pm=pl.tr.length; pl.days[tr.di].nc=ord[bi+1].ci; } else { tr.di=segD[bi+1][0]; pl.days[tr.di].am=pl.tr.length; } pl.tr.push(tr); });
  if(apIn&&pl.days[0].am==null){ apIn.w="am"; apIn.di=0; pl.days[0].am=pl.tr.length; pl.tr.push(apIn); }
  if(Dp){ var ld=pl.days.length-1; pl.days[ld].nc=-1; if(apOut&&pl.days[ld].pm==null){ apOut.w="pm"; apOut.di=ld; pl.days[ld].pm=pl.tr.length; pl.tr.push(apOut); } }
  ord.forEach(function(sg,si){ var ds=segD[si]; if(!ds.length) return; var hp=hotelPt(pl,sg.ci);
    var av=ds.map(function(q){ var X=dayX(pl,q,H); return Math.max(30,(X.lim!=null?Math.min(X.lim,to):to)-X.from); });
    var r0=(ds[0]===0&&ds.length>1&&dayX(pl,0,H).rest)?1:0, ds2=ds.slice(r0), av2=av.slice(r0);   // 11-07 밤에 도착한 날(숙소 들른 뒤 20시 넘음)은 장소 없이 쉬기 — 그 도시 다음 날들로
    var gs=ds2.length===1?[sg.pts.slice()]:seqSplit(hp,sg.pts,ds2.length,av2);
    gs.forEach(function(arr,k2){ pl.days[ds2[k2]].stops=arr.map(function(x){ return x.k; }); }); });
  fxFix(pl,H);   // 11-07 정한 시작 시각에 못 닿는 곳 → 같은 도시 다른 날로
  pl.days.forEach(function(d,q){ var X=dayX(pl,q,H); if(!X.arr.length) return; d.end=sched(X.H,X.arr,X.dt,X.from,{to:X.to}).end; });
  return pl; }
// 그날 틀 — {H:출발점·도착점, from:시작 분, to:하루 끝, lim:늦어도 되는 끝(막차·공항), pre:[아침 줄], pmTr:저녁 이동, apD:출발 공항} · 옛 일정은 예전 값 그대로
// 출발점 (사장님 11-06 「가」) — 오늘 일정 = 지금 내 위치(「나」 ME.pos · 보고서가 받은 위치 GEO)에서 · 위치를 모르거나 그날 장소에서 80km 넘게 떨어져 있으면 숙소에서
//   다른 날 = 전날 밤 숙소에서(미리 보기) — 그날 아침 앱을 열면 그날이 「오늘」이 되어 내 위치로 다시 계산된다 · 끝은 늘 그날 밤 숙소
var MEC=null, ARR_CHK=30, ARR_REST=20*60;   // 도착한 날 숙소 들르기(분) · 숙소 들른 뒤 이 시각이 넘으면 그날은 쉬기 (11-07)
function mePt(){ var mp=(window.ME&&ME.pos)||GEO; if(!mp) return null; if(MEC&&MEC.lat===+mp[0]&&MEC.lng===+mp[1]) return MEC; return MEC={k:"__me",ko:"현재 위치",en:"Current location",lat:+mp[0],lng:+mp[1],me:1}; }
function meFor(d,arr){ if(!d||d.date!==kstToday(0)||OLD()) return null; var me=mePt(); if(!me||!arr.length) return null; var near=arr.some(function(x){ return km(me,x)<=80; }); return near?me:null; }
function dayX(pl,di,H0){ var d=pl.days[di], dt=new Date(d.date+"T00:00:00Z"), arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean);
  var F0=(d.fr!=null&&d.fr>=300)?d.fr:pl.from;   // 그날만 일찍 출발 (11-07 사장님 「늦는 시간만큼 일찍 출발하기」 — 검사 창 단추) · 없으면 조건의 시작 시각
  if(!pl.mc){ var me0=meFor(d,arr); return {H:me0?hPair(me0,hE(H0)):H0,from:F0,to:pl.to,dt:dt,arr:arr,me:me0?1:0}; }
  var X={mc:1,dt:dt,arr:arr,from:F0,to:pl.to,lim:null,pre:[],city:d.c}, t=F0, S=null;
  if(di===0&&pl.ap&&pl.ap.a){ var A=apPt(pl.ap.a.id), ta=pl.ap.a.t; S=A; if(ta!=null) t=ta+(pl.ap.a.k==="d"?45:90); X.pre.push({ap:"a",p:A,t:t,ft:ta}); }   // 11-07 사장님 「가」 — 아침에 내려도 시작 시각까지 공항에서 기다리지 않고 입국(국내 45분·국제 90분) 뒤 바로 숙소로
  else { var pc=di>0?pl.days[di-1].nc:d.c; S=(pc!=null&&pc>=0)?hotelPt(pl,pc):null; var me1=meFor(d,arr.length?arr:(d.am!=null&&pl.tr[d.am]?[pl.tr[d.am].sa]:[])); if(me1){ S=me1; X.me=1; } }
  if(d.am!=null&&pl.tr[d.am]){ var st0=(!X.pre.length&&S)?{start:1,p:S,t:t}:null; var r=trRun(pl,pl.tr[d.am],S,t); if(st0){ if(r.rows.ts!=null) st0.t=r.rows.ts; X.pre.push(st0); } X.pre=X.pre.concat(r.rows); S=r.S; t=r.t; }
  // 11-07 사장님 「공항에서 바로 구경 가는 사람 없다」 — 도착한 날은 공항(먼 도시면 도시 이동) 뒤 첫날 숙소에 먼저 들러 짐 맡기기·체크인(30분), 장소는 그 뒤 숙소에서
  //   숙소를 안 정했으면 tmpLodge(서울역·도시 중심) 기준 · 숙소 들른 뒤가 20시 넘으면 X.rest = 그날은 쉬기(장소 없음 — natPlanSeq 가 다음 날로) · 그날 저녁 도시 이동·당일 출국이면 예전 그대로
  var nc0=d.nc!=null?d.nc:d.c;
  if(di===0&&pl.ap&&pl.ap.a&&d.pm==null&&nc0!=null&&nc0>=0&&!OLD()){ var lq=X.pre[X.pre.length-1], HB0=hotelPt(pl,nc0), LP=HB0||tmpLodge(pl,nc0), ck=null;
    if(lq&&lq.drop&&lq.p===LP){ ck=lq; t+=ARR_CHK-15; }   // 아침 도시 이동이 이미 숙소까지 (짐 두기 15분 → 체크인 30분)
    else if(LP){ var L0=km(S,LP)>0.05?(lq&&lq.tr?bagLeg(S,LP,t):legT(S,LP,t)):null; if(L0){ X.pre.push({leg:L0,a:S,b:LP}); t+=L0.min; } ck={p:LP,t:t}; X.pre.push(ck); t+=ARR_CHK; }
    if(ck){ delete ck.drop; ck.chk=1; ck.tmp=HB0?0:1; S=LP; X.rest=t>ARR_REST?1:0; ck.rest=X.rest&&!arr.length?1:0; X.chk=ck; } }
  if(di===0&&pl.ap&&pl.ap.a&&pl.ap.a.t!=null&&t<300) t=Math.max(t,F0);   // 새벽 05:00 전에 숙소까지 다 갔으면(자정 넘어 내린 비행기) 장소는 시작 시각부터
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
    var tB=opt.ar+(tr.kind==="air"?20:0); o.tB=tB;
    // 11-08 사장님 「도착한 뒤엔 그 도시에서 일정 추가·식당 찾기」 — 도착 후 일정 d.post: 도착 지점에서 차례로(식당은 점심 12시·저녁 18시 전이면 기다림) · 그 뒤 숙소(또는 공항)
    var PS=(d.post||[]).map(function(k){ return pl.pool[k]; }).filter(Boolean), pp=tr.sb, tp=tB;
    var walkPost=function(){ PS.forEach(function(x){ var lg=legT(pp,x,tp); tp+=lg.min; if(x.eat){ var K=tp<900?"lunch":"dinner"; if(tp<ML[K].lo) tp=ML[K].lo; } rows.push({px:x,t:tp,leg:lg,a:pp}); tp+=x.stay; pp=x; }); };
    if(tr.b===-2){ var q=pl.ap&&pl.ap.d, by=q&&q.t!=null?q.t-(q.k==="d"?90:180):null;
      if(!PS.length){ rows.push({apD:1,p:tr.sb,t:tB,ft:q?q.t:null,by:by,k:q?q.k:"i"}); if(by!=null&&tB>by) o.miss=1; o.end=tB; return o; }
      rows.push({arr:1,p:tr.sb,t:tB}); walkPost(); var AP=q?apPt(q.id):null;
      if(AP){ var L3=legT(pp,AP,tp); rows.push({leg:L3,a:pp,b:AP}); tp+=L3.min; rows.push({apD:1,p:AP,t:tp,ft:q.t,by:by,k:q.k}); if(by!=null&&tp>by) o.miss=1; }
      o.end=tp; return o; }
    if(PS.length){ rows.push({arr:1,p:tr.sb,t:tB}); walkPost(); }
    var HB=hotelPt(pl,tr.b); if(HB){ var L2=PS.length?legT(pp,HB,tp):bagLeg(tr.sb,HB,tB); rows.push({leg:L2,a:pp,b:HB}); rows.push({hotel:1,p:HB,t:tp+L2.min}); o.end=tp+L2.min; } else { rows.push({end:1,t:tp}); o.end=tp; }
    rows.push({tip:1}); rows.push({night:1,ci:tr.b,di:di}); return o; }
  if(X.apD){ rows.push({apD:1,p:E,t:t,ft:X.apD.ft,by:X.apD.by,k:X.apD.k}); return o; }
  if(X.arr.length||(X.pre&&X.pre.length&&!X.chk)){ if(E&&(E.hotel||E.k==="__hotel")) rows.push({hotel:1,p:E,t:t}); else rows.push({end:1,t:t}); }   // 장소 없는 날(자유 일정)은 끝 줄 없이 밤 숙소 칸만 · 도착한 날 장소가 없으면 숙소 들르기·쉬기 줄이 끝 (11-07)
  var nc=d.nc!=null?d.nc:d.c; if(nc>=0&&(di<pl.days.length-1||hotelPt(pl,nc))) rows.push({night:1,ci:nc,di:di});
  return o; }
function rowH(t,ic,txt,cls){ return '<div class="trw h'+(cls?" "+cls:"")+'"><span class="tt">'+(t!=null?m2hm(t):"")+'</span><span class="tp">'+(ic?MPIMG(ic,MIS):"")+txt+'</span></div>'; }
function legRow(r,di,aK){ var a=(r.a&&r.a.k)||aK, b=(r.b&&r.b.k)||"__hotel"; return '<div class="tlg" data-a="'+esc(a||"")+'" data-b="'+esc(b)+'" data-d="'+di+'">'+legTxt(r.leg,r.a?ptNm(r.a):lgNm(aK,di),r.b?ptNm(r.b):lgNm("__hotel",di,1))+legGo(r.leg)+'<div class="tods"></div></div>'; }
function natPreHtml(pl,di,X){ var h=''; X.pre.forEach(function(r){
    if(r.ap==="a") h+=rowH(r.t,"mi_plane",esc(r.ft!=null?gTxt(NX6.apA,{a:ptNm(r.p),f:m2hm(r.ft),t:m2hm(r.t)}):gTxt(NX6.apA0,{a:ptNm(r.p)})));
    else if(r.start) h+=rowH(r.t,"mi_stay",esc(gTxt(NX6.st,{h:ptNm(r.p)})));
    else if(r.leg) h+=legRow(r,di,null);
    else if(r.tr) h+=trCard(pl,r.tr,r.opt);
    else if(r.chk) h+=rowH(r.t,"mi_stay",esc(T5(r.rest?NX6.rest:NX6.chk))+' · <b>'+esc(r.tmp?gTxt(NX6.hTmp,{p:ptNm(r.p)}):ptNm(r.p))+'</b>');   // 도착한 날 숙소 들르기 (11-07)
    else if(r.drop) h+=rowH(r.t,"mi_stay",esc(gTxt(NX6.drop,{h:ptNm(r.p)}))); }); return h; }
function natPostHtml(pl,di,X,post,prevK){ var h='', pk=prevK, pn=X.arr.filter(function(x){ return !x.eat; }).length; post.rows.forEach(function(r){
    if(r.px){ h+=legRow({leg:r.leg,a:r.a,b:r.px},di,pk)+pxHtml(pl,di,r,r.px.eat?0:++pn); pk=r.px.k; return; }   // 11-08 도착 후 일정
    if(r.arr){ h+=rowH(r.t,"mi_train",esc(gTxt(NX6.apD,{a:ptNm(r.p)}))); return; }
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
function taxiBtn(h){ try{ return (typeof FG==="function"&&FG())?(window.krideL?krideL(h.ko,h.addr||"",0,(window.txEn?txEn(h):"")):""):(window.kakaoTL?kakaoTL(h.ko,h.addr||""):""); }catch(e){ return ""; } }
function nightHtml(pl,di,ci){ var c=pl.mc?(ci!=null&&ci>=0?pl.cities[ci]:null):nightCity(pl,di), hp=nightHotel(pl,di,ci); if(pl.mc&&!c) return ""; if(hp) return "";   // 11-08 사장님 「삭제한다」 — 숙소를 정한 밤 칸은 「숙소 도착」 줄과 겹쳐 없앰 (안 정했으면 「숙소 찾기」 칸만 남김)
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
//   11-06 사장님 — 구글 항공권 검색어를 실제로 열어 확인(6개 화면 언어): 「One way flights to ICN on 날짜 for N adults」= 편도 · 「Flights to ICN from 가는 날 to 오는 날 for N adults」= 왕복(출발지는 구글이 손님 위치로)
//   (예전 「Flights to ICN on 날짜」는 왕복 + 구글이 고른 오는 날로 열렸다 · 「… returning 날짜」는 영어 화면에서만 왕복, 한국어·일본어·중국어·스페인어 화면에선 빈 검색 · 「from GMP」를 붙이면 GMP 를 출발지로 읽는다)
//   ret = 오는 날(왕복 — 도착 공항 b 만 줄 때) · b 가 "sel" 이면 서울 모든 공항(인천·김포) · 스카이스캐너는 출발·도착 공항을 다 알 때만(편도 꼴 — 날짜 하나)
function flyLinks(a,b,date,pax,ret){ var A=APT[a], B=b==="sel"?{c:"SEL"}:APT[b]; if(!A&&!B) return ""; pax=pax||(TR.opt&&TR.opt.pax)||1; var ymd=String(date||"").replace(/-/g,"").slice(2);
  var sk=(A&&B&&ymd.length===6)?"https://www.skyscanner.co.kr/transport/flights/"+A.c.toLowerCase()+"/"+B.c.toLowerCase()+"/"+ymd+"/?adultsv2="+pax:null, px=" for "+pax+" adult"+(pax>1?"s":"");
  var gq=(ret&&date&&B&&!A)?"Flights to "+B.c+" from "+date+" to "+ret+px:"One way flights"+(B?" to "+B.c:"")+(A?" from "+A.c:"")+(date?" on "+date:"")+px, gf="https://www.google.com/travel/flights?q="+encodeURIComponent(gq)+"&hl="+({ko:"ko",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en");
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
    s.rows.forEach(function(r){ if(r.rest){ if(r.leg&&p) add(p,r.p,r.leg); p=r.p; return; } if(r.meal){ if(r.r){ if(r.leg) add(p,r.r,r.leg); p=r.r; } else if(r.to&&r.next){ if(r.leg) add(p,r.next,r.leg); p=r.next; } return; } if(r.leg&&p) add(p,r.x,r.leg); p=r.x; });
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
  var re=function(){ if(pl.ord){ pl.chk=2; save(); if(cb) cb(); return; }   // 11-07 손님 순서 그대로 — 숙소가 바뀌면 순서는 두고 다시 검사만
    pl.days.forEach(function(d,di){ var X=dayX(pl,di,REPH), b4=d.stops.join(","); if(!X.arr.length) return; var od=orderDay(X.H,X.arr,X.dt,X.from,X.to); d.stops=od.map(function(x){ return x.k; }); if(d.stops.join(",")!==b4) d.aiX=1; }); save(); if(cb) cb(); };
  trFetch(pl,re); }
function natSetHotel(pl,ci,h,di){ if(!pl) return; TR.opt.hotels=TR.opt.hotels||{};
  if(pl.mc&&pl.cities[ci]){ pl.cities[ci].h=h; TR.opt.hotels[pl.cities[ci].id]=h; }
  else { TR.opt.hotel=h; pl.hotel=h; pl.H={k:"__hotel",ko:h.ko,en:h.en,lat:+h.lat,lng:+h.lng,addr:h.addr||"",hotel:1}; REPH=pl.H; }
  save(); var after=function(){ drFetch(pl,function(){ save(); if(document.getElementById("trRep")) repPaint(); }); if(document.getElementById("trRep")) repPaint(); try{ nowPaint(); }catch(e){} };
  if(pl.mc) natRefit(pl,after); else { reorderWithReal(pl,pl.H); if(pl.ord) pl.chk=2; save(); after(); } }
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
var ST6={rst:{ko:"처음부터 다시",en:"Start over",ja:"最初からやり直す",zhs:"从头开始",zht:"從頭開始",es:"Empezar de nuevo"},rstQ:{ko:"이 폰에 저장한 모든 플랜(담은 장소·일정·숙소·항공 정보)을 지우고 처음부터 다시 시작할까요?",en:"Delete all plans saved on this phone (places, schedules, lodging and flight info) and start over?",ja:"このスマホに保存したすべてのプラン（場所・旅程・宿・航空情報）を消して、最初からやり直しますか？",zhs:"要删除这部手机上保存的所有方案（地点、行程、住宿和航班信息），从头开始吗？",zht:"要刪除這支手機上儲存的所有方案（地點、行程、住宿和航班資訊），從頭開始嗎？",es:"¿Borrar todos los planes guardados en este teléfono (lugares, itinerarios, alojamiento y vuelos) y empezar de nuevo?"},prev:{ko:"지난번 숙소: {h}",en:"Your earlier lodging: {h}",ja:"前回の宿: {h}",zhs:"上次的住宿: {h}",zht:"上次的住宿: {h}",es:"Alojamiento anterior: {h}"},useP:{ko:"이 숙소로",en:"Use this one",ja:"この宿にする",zhs:"就住这里",zht:"就住這裡",es:"Usar este"},otherP:{ko:"다른 숙소 찾기",en:"Find another",ja:"別の宿を探す",zhs:"找其他住宿",zht:"找其他住宿",es:"Buscar otro"},s1:{ko:"① 항공편 예약",en:"① Book flights",ja:"① 航空券の予約",zhs:"① 预订机票",zht:"① 預訂機票",es:"① Reserva tus vuelos"},
 s2:{ko:"② 첫날 숙소 예약",en:"② Book your first night",ja:"② 初日の宿の予約",zhs:"② 预订第一晚住宿",zht:"② 預訂第一晚住宿",es:"② Reserva la primera noche"},
 s3:{ko:"③ AI와 일정짜기",en:"③ Plan with AI",ja:"③ AIと旅程づくり",zhs:"③ 与AI规划行程",zht:"③ 與AI規劃行程",es:"③ Planifica con IA"},
 have:{ko:"있어요 — 입력",en:"Already booked — enter it",ja:"予約済み — 入力",zhs:"已预订——填写",zht:"已預訂——填寫",es:"Ya reservado: introducir"},
 skip:{ko:"건너뛰기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"略過",es:"Omitir"},
 find:{ko:"항공권 찾기",en:"Find flights",ja:"航空券を探す",zhs:"查找机票",zht:"查找機票",es:"Buscar vuelos"},
 inb:{ko:"한국 도착편",en:"Flight to Korea",ja:"韓国到着便",zhs:"到达韩国的航班",zht:"抵達韓國的航班",es:"Vuelo a Corea"},
 outb:{ko:"한국 출발편",en:"Flight home",ja:"韓国出発便",zhs:"离开韩国的航班",zht:"離開韓國的航班",es:"Vuelo de regreso"},
 rt:{ko:"왕복 항공권",en:"Round-trip flights",ja:"往復航空券",zhs:"往返机票",zht:"來回機票",es:"Vuelos de ida y vuelta"},   // 11-06 — 체류 기간 왕복
 ow:{ko:"한국 도착편 (편도)",en:"Flight to Korea (one way)",ja:"韓国到着便（片道）",zhs:"到达韩国的航班（单程）",zht:"抵達韓國的航班（單程）",es:"Vuelo a Corea (solo ida)"},
 owo:{ko:"한국 출발편 (편도)",en:"Flight home (one way)",ja:"韓国出発便（片道）",zhs:"离开韩国的航班（单程）",zht:"離開韓國的航班（單程）",es:"Vuelo de regreso (solo ida)"},
 day1:{ko:"첫날",en:"First day",ja:"初日",zhs:"第一天",zht:"第一天",es:"Primer día"},
 days:{ko:"여행 일수",en:"Days",ja:"旅行日数",zhs:"旅行天数",zht:"旅行天數",es:"Días"},
 pax:{ko:"인원",en:"Travelers",ja:"人数",zhs:"人数",zht:"人數",es:"Viajeros"},
 city:{ko:"첫날 묵을 도시",en:"City for the first night",ja:"初日に泊まる都市",zhs:"第一晚住宿的城市",zht:"第一晚住宿的城市",es:"Ciudad de la primera noche"},
 ok:{ko:"✓ 정했어요",en:"✓ Set",ja:"✓ 決定",zhs:"✓ 已设定",zht:"✓ 已設定",es:"✓ Listo"},
 okB:{ko:"정했어요",en:"Done",ja:"決定",zhs:"确定",zht:"確定",es:"Listo"},   // 11-07 아래 단추 — 다 넣었을 때만 눌린다(① 도착·출발 공항 · ② 숙소)
 hname:{ko:"숙소 이름·주소로 찾기",en:"Search lodging by name/address",ja:"宿の名前・住所で探す",zhs:"按住宿名称或地址查找",zht:"按住宿名稱或地址查找",es:"Busca el alojamiento por nombre o dirección"},
 times:{ko:"비행기 시각을 넣으면 첫날·마지막 날 일정을 그 시각에 맞춰요",en:"Add your flight times and we'll fit the first and last days around them",ja:"便の時刻を入れると初日・最終日をその時刻に合わせます",zhs:"填写航班时间后，第一天和最后一天会按航班安排",zht:"填寫航班時間後，第一天和最後一天會按航班安排",es:"Añade las horas de tus vuelos y ajustaremos el primer y el último día"}};
var STS={open:"",hq:"",hr:null,nm:""};   // nm = 여행 일수 칸을 맞췄다는 한 줄 (11-06)
function stepsPaint(el){ el=el||document.getElementById("aipSteps"); if(!el) return; var o=TR.opt, ap=o.ap||{}, pax=o.pax||1, start=o.start||kstToday(1), last=dayDate(Math.max(0,(o.n||1)-1)).toISOString().slice(0,10);
  var apSel=function(w){ var q=ap[w]||{}; return '<select data-stap="'+w+'"><option value="">'+esc(T5(w==="d"?AP6.noneD:AP6.none))+'</option>'+Object.keys(APT).filter(function(id){ return APT[id].ui; }).map(function(id){ return '<option value="'+id+'"'+(q.id===id?' selected':'')+'>'+esc(apNm(id))+'</option>'; }).join("")+'</select>'; };
  var f1=!!(ap.a&&ap.a.id&&ap.d&&ap.d.id), f2=hOkNow(), old=!!o.hotel&&!f2, hNm=function(x){ return x&&x.type==='here'?hotelTxt(x):nm(x); }, h='';
  h+='<div class="stp'+(f1?' ok':'')+'"><div class="stph" data-sto="1"><b>'+esc(T5(ST6.s1))+'</b></div>';   // 11-07 사장님 — 「정했어요」는 제목 옆 표시가 아니라 아래 단추로
  if(STS.open==="1"){ h+='<div class="stpb"><div class="stpr"><label>'+esc(T5(ST6.day1))+'<input type="date" data-sts="start" value="'+esc(start)+'"></label><label>'+esc(T5(ST6.days))+nInput("",'data-sts="n"',o.n)+'</label><label>'+esc(T5(ST6.pax))+'<select data-sts="pax">'+[1,2,3,4,5,6,7,8,9].map(function(d){ return '<option'+(pax===d?" selected":"")+'>'+d+'</option>'; }).join("")+'</select></label></div>'+(STS.nm?'<div class="d trnm">'+esc(STS.nm)+'</div>':'')
    +'<div class="stpr"><label class="w">'+esc(T5(AP6.arr))+apSel("a")+'</label><label>'+esc(T5(AP6.tA))+'<input type="time" data-stt="a" value="'+esc((ap.a&&ap.a.t)||"")+'"></label></div>'
    +'<div class="stpr"><label class="w">'+esc(T5(AP6.dep))+apSel("d")+'</label><label>'+esc(T5(AP6.tD))+'<input type="time" data-stt="d" value="'+esc((ap.d&&ap.d.t)||"")+'"></label></div>'
    +stFly(ap,start,last,pax)
    +'<div class="d">'+esc(T5(ST6.times))+'</div><div class="tlgnote">'+esc(gTxt(NX6.book,{s:T5(NX6.sites)}))+'</div>'
    +'<div class="stpn"><button type="button" class="trbtn pri" data-sto="2"'+(f1?'':' disabled')+'>'+esc(T5(ST6.okB))+'</button><button type="button" class="trbtn" data-sto="2">'+esc(T5(ST6.skip))+' ›</button></div></div>'; }
  h+='</div><div class="stp'+(f2?' ok':'')+'"><div class="stph" data-sto="2"><b>'+esc(T5(ST6.s2))+(f2?'<span class="stsub">'+esc(hNm(o.hotel))+(o.hAll?' · '+esc(T5(LG6.all)):'')+'</span>':'')+'</b></div>'+(old&&STS.open!=="2"?'<div class="stpb"><div class="d" style="margin:0 0 6px">'+esc(gTxt(ST6.prev,{h:hNm(o.hotel)}))+'</div><div class="stpn"><button type="button" class="trbtn" data-sthok="1">'+esc(T5(ST6.useP))+'</button> <button type="button" class="trbtn" data-sto="2">'+esc(T5(ST6.otherP))+'</button></div></div>':'');
  if(STS.open==="2"){ var cid=STS.city||(ap.a&&ap.a.id==="pus"?"busan":ap.a&&ap.a.id==="cju"?"jeju":"seoul");
    h+='<div class="stpb"><div class="stpr"><label class="w">'+esc(T5(ST6.city))+'<select data-stc="1">'+CITYNM.map(function(c){ return '<option value="'+c[0]+'"'+(c[0]===cid?' selected':'')+'>'+esc(LANG==="ko"?c[1]:({en:c[2],ja:c[3],zhs:c[4],zht:c[5],es:c[6]}[LANG]||c[2]))+'</option>'; }).join("")+'</select></label></div>'
      +'<div class="stpn"><button type="button" class="trbtn big" data-stl="1">'+MPIMG("mi_stay",MIS)+esc(T5(LG6.ttl))+'</button></div>'
      +'<div class="stpr"><input id="stHQ" enterkeyhint="search" placeholder="'+esc(T5(ST6.hname))+'" value="'+esc(STS.hq||"")+'"><button type="button" class="tb" data-sth="1">'+MPIMG("mi_search","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div><div id="stHR">'+stHrHtml()+'</div>'
      +'<div class="stpn"><button type="button" class="trbtn pri" data-sto="3"'+(f2?'':' disabled')+'>'+esc(T5(ST6.okB))+'</button><button type="button" class="trbtn" data-sto="3">'+esc(T5(ST6.skip))+' ›</button></div></div>'; }
  h+='</div><div class="stp"><div class="stph" data-sto="3"><b>'+esc(T5(ST6.s3))+'</b></div></div>';
  h+='<div style="text-align:right;margin:6px 4px 0"><a href="#" data-streset="1" class="d" style="text-decoration:underline">'+esc(T5(ST6.rst))+'</a></div>';   // 11-06 사장님 「테스터 리셋, 다시 해보게」 — 이 폰의 여행 기록을 처음 상태로
  el.innerHTML=h; }
// ① 항공편 링크 (11-06 사장님) — 기본은 체류 기간 왕복(가는 날 = 첫날 · 오는 날 = 첫날 + 일수 − 1 · 도착 공항 → 출발 공항)
//   출발 공항 「선택 안 함」 = 돌아가는 편 없이 한국 오는 편도만 · 도착 공항을 안 골랐으면 인천(예전처럼)
//   도착·출발 공항이 같으면 그 공항 왕복 · 인천·김포처럼 둘 다 서울이면 서울(모든 공항) 왕복 · 다른 도시(예: 인천 도착·김해 출발)는 구글 검색어로 왕복을 못 만들어 편도 둘
var SEL_AP={icn:1,gmp:1};
function stFly(ap,start,last,pax){ var arr=(ap.a&&ap.a.id)||"icn", dep=ap.d&&ap.d.id, row=function(lb,lk){ return '<div class="stpl"><span>'+esc(T5(lb))+':</span>'+lk+'</div>'; };
  if(!dep||!APT[dep]) return row(ST6.ow,flyLinks(null,arr,start,pax));
  if(dep===arr||(SEL_AP[dep]&&SEL_AP[arr])) return row(ST6.rt,flyLinks(null,dep===arr?arr:"sel",start,pax,last));
  return row(ST6.ow,flyLinks(null,arr,start,pax))+row(ST6.owo,flyLinks(dep,null,last,pax)); }
function stHrHtml(){ var a=STS.hr; if(!a) return ""; if(!a.length) return '<div class="d">'+esc(T("찾은 곳이 없어요","No results"))+'</div>';
  return a.slice(0,6).map(function(x,i){ return '<div class="tra" data-sthp="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join("")+'<label class="trck" style="margin:6px 0"><input type="checkbox" id="stHAll"'+(TR.opt.hAll?" checked":"")+'> '+esc(T5(LG6.all))+'</label>'; }
document.addEventListener("keydown",function(e){ if(e.key!=="Enter"||!e.target||e.target.id!=="stHQ") return; e.preventDefault(); var b=document.querySelector('#aipSteps [data-sth]'); if(b) b.click(); });   // ② 숙소 이름 칸 — 자판 Enter·검색으로도 찾는다 (11-07)
// 처음부터 다시 — 이 기기의 모든 플랜을 지우고 새로 (q = 확인 창 문구, 없으면 앱 문구)
function stReset(q){ if(!confirm(q||T5(ST6.rstQ))) return false; try{ localStorage.removeItem(KEY); localStorage.removeItem("mpv_trlive"); }catch(z){} location.reload(); return true; }
function stApSet(){ var o=TR.opt, ap=o.ap||{}, el=document.getElementById("aipSteps"); if(!el) return; ["a","d"].forEach(function(w){ var s=el.querySelector('[data-stap="'+w+'"]'), t=el.querySelector('[data-stt="'+w+'"]'); if(!s) return; var id=s.value;
    ap[w]=id?{id:id,t:(t&&hm2m(t.value)!=null)?t.value:"",k:(ap[w]&&ap[w].id===id&&ap[w].k)||(id==="cju"?"d":"i")}:null; }); o.ap=ap; save();
  var ok=!!(ap.a&&ap.a.id&&ap.d&&ap.d.id), bt=el.querySelector('.stpn .trbtn.pri[data-sto="2"]'); if(bt){ bt.disabled=!ok; var cd=bt.closest(".stp"); if(cd) cd.classList.toggle("ok",ok); } }   // 다시 그리지 않고 「정했어요」만 켜고 끈다 (11-07 — 시각 칸 입력 중 초점 유지)
document.addEventListener("change",function(e){ var t=e.target, el=document.getElementById("aipSteps"); if(!el||!el.contains(t)) return; var o=TR.opt;
  if(t.dataset.sts!=="n") STS.nm="";
  if(t.dataset.sts==="start"){ o.start=t.value; save(); } else if(t.dataset.sts==="n"){ var q=nFix(t.value,o.n); STS.nm=q.fix?nMsg(q.n):""; if(q.n!==o.n){ o.n=q.n; TR.plan=null; save(); } } else if(t.dataset.sts==="pax"){ o.pax=+t.value; save(); }
  else if(t.dataset.stap||t.dataset.stt) stApSet(); else if(t.dataset.stc){ STS.city=t.value; }
  stepsPaint(el); },true);
document.addEventListener("click",function(e){ var el=document.getElementById("aipSteps"); if(!el||!e.target.closest||!el.contains(e.target)) return; var t=e.target.closest("[data-streset],[data-sthok],[data-sto],[data-stl],[data-sth],[data-sthp]"); if(!t) return; e.preventDefault();
  if(t.dataset.streset){ stReset(); return; }
  if(t.dataset.sthok){ TR.opt.hOk=hKey(); save(); STS.open="3"; stepsPaint(el); return; }
  if(t.dataset.sto){ var v=t.dataset.sto; STS.open=STS.open===v?"":v; if(v==="3"){ STS.open=""; try{ var q=document.getElementById("aipQ"); if(q){ q.scrollIntoView({block:"center"}); q.focus(); } }catch(z){} } stepsPaint(el); return; }
  if(t.dataset.stl){ var cid=STS.city||(el.querySelector("[data-stc]")||{}).value||"seoul", c=CITYNM.filter(function(q){ return q[0]===cid; })[0]||CITYNM[0];
    openLodge({lat:c[7],lng:c[8],date:TR.opt.start||kstToday(1),n:Math.max(1,(TR.opt.n||1)-1),city:LANG==="ko"?c[1]:({en:c[2],ja:c[3],zhs:c[4],zht:c[5],es:c[6]}[LANG]||c[2]),cityKo:c[1],cityEn:c[2],allOpt:true,all:!!TR.opt.hAll,cb:function(h,all){ TR.opt.hotel=h; TR.opt.hAll=all?1:0; if(!all){ TR.opt.hotels=TR.opt.hotels||{}; } TR.plan=null; save(); STS.open="3"; stepsPaint(); }}); return; }
  if(t.dataset.sth){ var q2=(document.getElementById("stHQ")||{}).value||""; q2=q2.trim(); if(!q2) return; STS.hq=q2; STS.hr=null; var box=document.getElementById("stHR"); if(box) box.innerHTML='<div class="d">'+esc(T5(LG6.busy))+'</div>';
    fetch(HUB+"/kplace?q="+encodeURIComponent(q2)+kpL()).then(function(r){ return r.json(); }).then(function(j){ STS.hr=lodgeOnly((j&&j.ok&&j.items)||[]).slice(0,8); var b2=document.getElementById("stHR"); if(b2) b2.innerHTML=stHrHtml(); }).catch(function(){ STS.hr=[]; var b3=document.getElementById("stHR"); if(b3) b3.innerHTML=stHrHtml(); }); return; }
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
 stayB:{ko:"머물기로 한 {m}이 지났어요. 더 있으면 뒤 일정을 1시간 밀어 다시 계산해요.",en:"Your planned {m} is up. If you stay, we'll push the rest of today back 1 hour.",ja:"予定の{m}が過ぎました。もう少しいるなら残りの予定を1時間遅らせて計算し直します。",zhs:"计划的{m}已经到了。如果再待一会儿，后面的行程会顺延1小时重新计算。",zht:"計畫的{m}已經到了。如果再待一會兒，後面的行程會順延1小時重新計算。",es:"Ya pasó el tiempo previsto ({m}). Si te quedas, retrasamos 1 hora el resto del día."},
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
    var g=document.getElementById("trNowGo"); if(g) g.innerHTML='<div class="tnl"><b>➡ '+esc(nm(t))+'</b><br>'+(typeof linksTo==="function"?linksTo(t.ko,t.lat,t.lng,null,t.addr,0,null,(window.txEn?txEn(t):"")):"")+'</div>'; nowFit((document.getElementById("trNow")||{}).offsetHeight||0); return; }
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
 noneD:{ko:"선택 안 함",en:"Not selected",ja:"選択しない",zhs:"不选择",zht:"不選擇",es:"Sin seleccionar"},   // 출발 공항 첫 항목 (11-06 사장님) — 고르지 않으면 돌아가는 편 없이 오는 편도만
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
    return '<div class="trchr"><span class="trchn">'+esc(cnm(g.nm))+'</span><select data-chs="'+i+'">'+opts+'</select><button type="button" class="tb" data-chf="'+i+'" title="'+esc(T5(NX6.hPick))+'">'+MPIMG("mi_stay","height:1.2em;width:auto;vertical-align:-0.2em;margin:0")+'</button></div>'; }).join("")+'</div>'; }   // 11-07 사장님 — 아래 안내 문장(AP6.hint) 삭제
function natApRows(){ var ap=TR.opt.ap||{}, ids=Object.keys(APT).filter(function(id){ return APT[id].ui; }), pax=TR.opt.pax||1;
  var row=function(w){ var q=ap[w]||{}; return '<div class="wide trapr"><span class="trapl">'+esc(T5(w==="a"?AP6.arr:AP6.dep))+'</span><div class="trapf"><select id="trAp'+w+'" data-apw="'+w+'"><option value="">'+esc(T5(w==="d"?AP6.noneD:AP6.none))+'</option>'+ids.map(function(id){ return '<option value="'+id+'"'+(q.id===id?' selected':'')+'>'+esc(apNm(id))+'</option>'; }).join("")+'</select>'
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
function ppPhoto(k,ko,lat,lng,el,done){ if(!el||!ko||!(+lat)) return;   // done(j|null) = 받은 뒤 알림(11-08 홈페이지 AI 추천 카드 · 앱 부르는 곳은 그대로)
  var fxT=window.CPH_FIX||{}, fx=fxT[k]||null, fq=fx?(fx.q?"&pq="+encodeURIComponent(fx.q):"")+(fx.pi!=null?"&pi="+fx.pi:""):"", ck=ko+"|"+(+lat).toFixed(4)+","+(+lng).toFixed(4)+fq, C=window._cphC||(window._cphC={});   // 장소 카드 cphLoad 와 같은 주소·같은 캐시
  var put=function(j){ if(done){ try{ done(j); }catch(e){} } if(!el.isConnected||!j||!j.ok) return; var at=(j.attr||[]).filter(function(a){ return a&&a.n; }).map(function(a){ return /^https:\/\//.test(a.u||"")?'<a href="'+esc(a.u)+'" target="_blank" rel="noopener">'+esc(a.n)+'</a>':esc(a.n); }).join(", ");
    el.innerHTML='<img alt="" src="'+HUB+esc(j.img)+'"><div class="cpa">'+(at?T("사진","Photo")+': '+at+' · ':'')+'Google</div>'; var im=el.querySelector("img"); im.onerror=function(){ el.hidden=true; }; im.onload=function(){ el.hidden=false; }; };
  if(C[ck]) return put(C[ck]); fetch(HUB+"/gphoto?q="+encodeURIComponent(ko)+"&lat="+(+lat).toFixed(5)+"&lng="+(+lng).toFixed(5)+fq).then(function(r){ return r.json(); }).then(function(j){ C[ck]=j; put(j); }).catch(function(){ if(done){ try{ done(null); }catch(e){} } }); }
var PPS=null;   // 열린 팝업 {t:"place"|"eat", k, di, mk, i}
function ppHtml(){ var pl=TR.plan, s=PPS; if(!pl||!s) return ""; var h='', ai=(pl.ai&&pl.ai.tips)||{};
  if(s.t==="eat"){ var c=s.c; if(!c) return ""; var kd=c.src==="near"?(L()?(c.cat_en||kindX(c.kind)):String(c.cat||"").split(">").slice(1).map(function(x){ return x.trim(); }).join("·")):(L()?(c.kind_x||c.kind_en||c.kind):c.kind);
    h='<div class="item">'+(c.lat?'<div class="cph" hidden></div>':'')+'<div class="t">'+MPICO("mi_food",eatName(c),MIS)+'</div>'+(L()&&c.en!==c.ko?'<div class="d">'+esc(c.ko)+'</div>':'')
      +'<div class="ppk"><b>'+esc(T5(PP6.kind))+'</b> '+esc(KIND6.food[Math.max(0,LG6s.indexOf(LANG))])+(kd?' · '+esc(kd):'')+'</div>'
      +(c.menu&&c.menu!==c.kind?'<div class="d" style="color:var(--ink)">'+esc((L()&&c.menu_x)||c.menu)+'</div>':'')+(c.src==="ad"&&LD(c)?'<div class="d" style="color:var(--ink)">'+esc(LD(c))+'</div>':'')
      +(c.srcs&&c.srcs.length?'<div class="d">'+MPIMG("mi_doc",MIS)+esc(c.srcs.map(function(q){ return LP(q); }).join(" · "))+'</div>':'')
      +(c.rating?'<div class="d">'+esc(T5(PP6.rt))+' ★'+(+c.rating).toFixed(1)+(c.n?' ('+c.n+')':'')+'</div>':'')
      +(Array.isArray(c.oh)&&c.oh.length&&pl.days[s.di]?(function(){ var dt=new Date(pl.days[s.di].date+"T00:00:00Z"); return '<div class="pph"><b>'+esc(gTxt(PP6.hrs,{d:dateTxt(dt)}))+'</b> '+esc(efHrs(c,dt))+'</div>'; })():'')   // 구글 평점·영업시간 (11-07)
      +'<div class="d">'+esc(L()?(c.addr_en||c.addr||""):(c.addr||""))+'</div>'+telLine(c.tel)+linksTo(c.ko,c.lat,c.lng,c.ko,c.addr,0,null,(window.txEn?txEn(c):""))+'<div class="ppr">'+rsvLink(c)+'</div></div>';   // 예약은 아웃링크 (11-07)
    return h; }
  var x=s.x||pl.pool[s.k]; if(!x) return ""; var p=(!x.pin&&window.PLACES&&PLACES[s.k])||x, d=pl.days[s.di], dt=d?new Date(d.date+"T00:00:00Z"):null, nmx=nm(x);
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
  h+='<div class="d">'+esc(L()?(p.addr_en||p.addr||""):(p.addr||""))+'</div>'+telLine(p.tel||x.tel)+linksTo(p.ko||x.ko,x.lat,x.lng,x.pin?x.ko:null,p.addr||x.addr,0,null,(window.txEn?txEn((p.ko?p:x)):""))+'</div>';
  return h; }
function ppOpen(o){ var old=document.getElementById("trPp"); if(old) old.remove(); PPS=o; var b=document.createElement("div"); b.id="trPp"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) b.remove(); };
  var draw=function(){ var h=ppHtml(); if(!h){ b.remove(); return; } b.innerHTML='<div class="ppbox"><button type="button" class="ppx" aria-label="'+esc(T5(PP6.x))+'" onclick="this.closest(\'.trpop\').remove()">✕</button>'+h+'</div>';
    var x=PPS.t==="eat"?PPS.c:(PPS.x||TR.plan.pool[PPS.k]); ppPhoto(PPS.t==="eat"?"":PPS.k,x&&x.ko,x&&x.lat,x&&x.lng,b.querySelector(".cph")); };
  b._rb=draw; draw(); document.body.appendChild(b); try{ ntap(o.t==="eat"?"_trip":(/^[A-Za-z0-9_-]+$/.test(o.k||"")&&!/^pin_/.test(o.k)?o.k:"_trip"),"trip_pop"); }catch(e){} return b; }
document.addEventListener("click",function(e){ if(!e.target.closest) return;
  var dp=e.target.closest("#trRep [data-pp]"); if(dp){ e.preventDefault(); var td0=dp.closest(".tday"); if(dp.dataset.pp==="eat"){ var ce=eatOfRow(dp.closest(".trw")); if(ce) ppOpen({t:"eat",c:ce.c,mk:ce.mk}); } else ppOpen({t:"place",k:dp.dataset.pp,di:td0?+td0.dataset.d:0}); return; }   // 11-08 카드를 펼친 칸의 「자세히 보기」
  if(e.target.closest("a,button,input,select,.tfxw")) return;
  var en=e.target.closest("#trRep .tec b");   // 식당 후보 이름(고르기 창) — 그 식당 자세히   // 식사 칸 식당 이름 — 넣기 단추 옆
  if(en){ var row=en.closest(".tec"), pl=TR.plan, c=null, mk="";
    if(row){ var bt=row.querySelector(".tebtn[data-k]"); if(bt){ mk=bt.dataset.k; c=(EATC[mk]||[])[+bt.dataset.i]; } }
    else { var on=en.closest(".teat.on"), bx=on&&on.querySelector(".tebtn[data-x]"), bu=on&&on.querySelector(".tebtn[data-ux]"); if(bx){ mk=bx.dataset.x; c=pl&&pl.meals&&pl.meals[mk]; } else if(bu&&pl){ c=pl.pool[bu.dataset.ux]||null; } }
    if(c){ e.preventDefault(); e.stopPropagation(); ppOpen({t:"eat",c:c,mk:mk}); } return; }
  var r=e.target.closest("#trRep .trw.tcx"); if(!r) return; tcxTog(r); },false);   // 11-08 카드를 누르면 펼치기/접기 (사장님 「가」)

// ══ 11-08 사장님 — 일정표 일목요연(세로 시간선·카드·회색 이동 줄·식당 후보 접기·날마다 요약) + 장소 카드 끌어 옮기기 ══
var DG6={
 sum:{ko:"장소 {n}곳 · {a}~{b}",en:"{n} stops · {a}–{b}",ja:"{n}か所 · {a}~{b}",zhs:"{n}个地点 · {a}~{b}",zht:"{n}個地點 · {a}~{b}",es:"{n} paradas · {a}–{b}"},
 det:{ko:"자세히 보기",en:"Details",ja:"詳しく見る",zhs:"查看详情",zht:"查看詳情",es:"Ver detalles"},
 pick:{ko:"후보 {n}곳에서 고르기",en:"Choose from {n} places",ja:"候補{n}件から選ぶ",zhs:"从{n}个候选中选择",zht:"從{n}個候選中選擇",es:"Elegir entre {n} sitios"},
 lun:{ko:"점심 고르기",en:"Choose lunch",ja:"昼食を選ぶ",zhs:"选择午餐",zht:"選擇午餐",es:"Elegir almuerzo"},
 din:{ko:"저녁 고르기",en:"Choose dinner",ja:"夕食を選ぶ",zhs:"选择晚餐",zht:"選擇晚餐",es:"Elegir cena"},
 hT:{ko:"장소 카드를 꾹 눌러 끌면 다른 자리나 다른 날로 옮길 수 있어요. 다른 카드 위에 놓으면 서로 바뀌어요.",en:"Press and hold a place card, then drag it to another spot or day. Drop it on another card to swap them.",ja:"場所カードを長押ししてドラッグすると、別の位置や別の日に移せます。別のカードの上に置くと入れ替わります。",zhs:"长按地点卡片并拖动，可移到其他位置或其他日期。放在另一张卡片上即可互换。",zht:"長按地點卡片並拖曳，可移到其他位置或其他日期。放在另一張卡片上即可互換。",es:"Mantén pulsada una tarjeta de lugar y arrástrala a otro sitio o día. Suéltala sobre otra tarjeta para intercambiarlas."},
 hM:{ko:"장소 카드를 끌면 다른 자리나 다른 날로 옮길 수 있어요. 다른 카드 위에 놓으면 서로 바뀌어요.",en:"Drag a place card to another spot or day. Drop it on another card to swap them.",ja:"場所カードをドラッグすると、別の位置や別の日に移せます。別のカードの上に置くと入れ替わります。",zhs:"拖动地点卡片，可移到其他位置或其他日期。放在另一张卡片上即可互换。",zht:"拖曳地點卡片，可移到其他位置或其他日期。放在另一張卡片上即可互換。",es:"Arrastra una tarjeta de lugar a otro sitio o día. Suéltala sobre otra tarjeta para intercambiarlas."},
 ord:{ko:"「{p}」 순서를 바꿨어요",en:"Moved “{p}”",ja:"「{p}」の順番を変えました",zhs:"已调整「{p}」的顺序",zht:"已調整「{p}」的順序",es:"Se movió «{p}»"},
 sw:{ko:"「{a}」, 「{b}」 자리를 서로 바꿨어요",en:"Swapped “{a}” and “{b}”",ja:"「{a}」と「{b}」を入れ替えました",zhs:"已互换「{a}」和「{b}」",zht:"已互換「{a}」和「{b}」",es:"Se intercambiaron «{a}» y «{b}»"},
 del:{ko:"삭제",en:"Delete",ja:"削除",zhs:"删除",zht:"刪除",es:"Eliminar"},
 skipD:{ko:"이 끼니는 건너뛰어요",en:"Skipping this meal",ja:"この食事は省きます",zhs:"已跳过这顿饭",zht:"已跳過這頓飯",es:"Se omite esta comida"},
 city:{ko:"같은 도시 날에만 넣을 수 있어요",en:"You can only move it to a day in the same city",ja:"同じ都市の日にだけ移せます",zhs:"只能移到同一城市的日期",zht:"只能移到同一城市的日期",es:"Solo puedes moverlo a un día en la misma ciudad"}};
function DGC(){ try{ return matchMedia("(pointer:coarse)").matches; }catch(e){ return false; } }
// 카드 펼치기/접기 — 다시 그려도 그대로 (p:장소 · m:고른 식사 · u:넣은 식당)
var EXP={};
function tcxTog(r){ var k=r.dataset.xk; if(!k) return; var on=!r.classList.contains("open"); r.classList.toggle("open",on); if(on) EXP[k]=1; else delete EXP[k];
  var x=r.querySelector(".tp>.xtg"); if(x&&window.XTG) XTG.set(x,on); }
function eatOfRow(rw){ var pl=TR.plan; if(!rw||!pl) return null; var bx=rw.querySelector(".tebtn[data-x]"), bu=rw.querySelector("[data-ux]");
  if(bx){ var mk=bx.dataset.x; return pl.meals&&pl.meals[mk]?{c:pl.meals[mk],mk:mk}:null; }
  if(bu&&pl.pool[bu.dataset.ux]) return {c:pl.pool[bu.dataset.ux],mk:""}; return null; }
// 안 고른 식사 — 일정 안엔 한 줄 「후보 N곳에서 고르기」, 누르면 가운데 창에서 고른다 (못 찾으면 예전처럼 그 자리에 「직접 식당 찾기」)
var EATA={}, EATP="";
function eatPickRow(mk,anchor,j){ EATA[mk]={a:anchor||null,j:j!=null?+j:0}; var pl=TR.plan, rc=pl&&pl.recs&&pl.recs[mk];
  if(!rc||(anchor&&rc.ak!==anchor.k)) return '<span class="d">'+T("근처 식당 찾는 중…","Finding places to eat nearby…")+'</span>';
  var cs=eatPick(mk)||[]; EATC[mk]=cs; if(!cs.length) return eatList(mk,anchor);
  return '<button type="button" class="tsbtn tepk" data-epk="'+esc(mk)+'">'+esc(gTxt(DG6.pick,{n:cs.length}))+'</button>'; }
function eatPOpen(mk){ var rep=document.getElementById("trRep"); if(!rep) return; eatPClose(); EATP=mk;
  var b=document.createElement("div"); b.id="trEatP"; b.className="trpop"; b.onclick=function(e){ if(e.target===b) eatPClose(); }; rep.appendChild(b); eatPPaint(); try{ ntap("_trip","trip_eatpick"); }catch(e){} }
function eatPClose(){ var b=document.getElementById("trEatP"); if(b) b.remove(); EATP=""; }
function eatPPaint(){ var b=document.getElementById("trEatP"), pl=TR.plan, mk=EATP; if(!b||!pl||!mk||(pl.meals&&pl.meals[mk])){ eatPClose(); return; } var A=EATA[mk]||{};
  b.innerHTML='<div class="mvbox"><div class="talh" style="color:var(--ink)">'+esc(T5(/lunch$/.test(mk)?DG6.lun:DG6.din))+'</div><div class="teat" data-k="'+esc(mk)+'" data-j="'+(A.j||0)+'">'+eatList(mk,A.a)+'</div><button type="button" class="talx" data-epx="1">'+esc(T5(LV6.x))+'</button></div>'; }
function eatPRe(){ if(!EATP) return; if(document.getElementById("trEatP")) eatPPaint(); else EATP=""; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep [data-epk]"); if(!a) return; e.preventDefault(); e.stopPropagation(); eatPOpen(a.dataset.epk); },true);
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trEatP [data-epx],#trEatP [data-ef]"); if(!a) return; if(a.dataset.epx){ e.preventDefault(); eatPClose(); return; } setTimeout(eatPClose,0); },true);   // 「넣기」는 고른 뒤 다시 그릴 때 닫힌다(eatPPaint)

// ── 장소 카드 끌어 옮기기 (사장님 11-08 「모듈화해서 이리저리 · 드래그 & 놓기 = 삽입 · 바꿔치기」) ──
//   관광 장소만(식당·숙소·공항은 안 옮김) · 폰 = 꾹 눌러(0.45초) 끌기 · PC = 눌러 끌기
//   카드 가운데에 놓으면 서로 바꾸기, 카드 사이·빈 날에 놓으면 끼워 넣기(다른 날로 옮기기 mvStop 과 같은 길 — 카트 순서도 따라감)
//   여러 도시 일정은 같은 도시 날에만(「가」) · 골라 둔 식당은 그대로, 시각은 다시 셈(「나」) · 놓은 뒤 문제가 있으면 검사 창
var DG=null, DGT=0;
function dgRow(t){ return t&&t.closest?t.closest("#trRep .trw.tpk[data-k]"):null; }
function dgStart(row,x,y,touch){ var pl=TR.plan, td=row.closest(".tday"); if(!pl||!td||DG) return; var k=row.dataset.k, di=+td.dataset.d;
  if(!pl.pool[k]||!pl.days[di]||pl.days[di].md||pl.days[di].stops.indexOf(k)<0) return;
  var card=row.querySelector(".tp"), r=card.getBoundingClientRect(), gh=card.cloneNode(true), ln=document.createElement("div");
  gh.className="tdgh"; gh.style.width=r.width+"px"; ln.className="tdins"; ln.hidden=true; document.body.appendChild(gh); document.body.appendChild(ln); row.classList.add("tdsrc");
  DG={row:row,k:k,di:di,gh:gh,ln:ln,dx:x-r.left,dy:y-r.top,x:x,y:y,tg:null,raf:0,touch:!!touch,sc:dgSc()};
  try{ if(touch&&navigator.vibrate) navigator.vibrate(20); }catch(e){}
  dgMove(x,y); DG.raf=requestAnimationFrame(dgLoop); }
function dgSc(){ var sh=document.getElementById("trRep"); if(!sh) return null; if(sh.classList.contains("pcsheet")) return document.scrollingElement||document.documentElement; var a=[sh.querySelector(".trin"),sh]; for(var i=0;i<a.length;i++){ var e=a[i]; if(e&&e.scrollHeight>e.clientHeight+2){ var oy=getComputedStyle(e).overflowY; if(oy==="auto"||oy==="scroll") return e; } } return sh; }   // 폰 = 시트 · PC = 가운데 칸(.trin)이 넘어간다
function dgLoop(){ if(!DG) return; var sh=DG.sc, y=DG.y, h=window.innerHeight, v=0;   // 위·아래 끝에 가까우면 저절로 넘김
  if(y<90) v=-Math.ceil((90-y)/5); else if(y>h-90) v=Math.ceil((y-(h-90))/5);
  if(v&&sh){ var s0=sh.scrollTop; sh.scrollTop=s0+v; if(sh.scrollTop!==s0) dgFind(); } DG.raf=requestAnimationFrame(dgLoop); }
function dgMove(x,y){ if(!DG) return; DG.x=x; DG.y=y; DG.gh.style.transform="translate("+Math.round(x-DG.dx)+"px,"+Math.round(y-DG.dy)+"px)"; dgFind(); }
function dgFind(){ var o=DG, pl=TR.plan; if(!o||!pl) return; var el=document.elementFromPoint(o.x,o.y), td=el&&el.closest?el.closest("#trRep .tday"):null, old=document.querySelector("#trRep .tswap");
  if(old) old.classList.remove("tswap"); o.ln.hidden=true; o.gh.classList.remove("no"); o.tg=null; if(!td) return;
  var dj=+td.dataset.d, d=pl.days[dj]; if(!d||d.md) return;
  if(pl.mc&&d.c!==pl.days[o.di].c){ o.tg={no:1}; o.gh.classList.add("no"); return; }
  var c=el.closest(".trw.tpk[data-k]");
  if(c&&c!==o.row&&td.contains(c)){ var r=c.getBoundingClientRect(); if(o.y>r.top+r.height*0.25&&o.y<r.bottom-r.height*0.25){ c.classList.add("tswap"); o.tg={sw:c.dataset.k,dj:dj}; return; } }
  var rows=[].filter.call(td.querySelectorAll(".trw.tpk[data-k],.trw.teu[data-uk]"),function(e){ return e!==o.row; }), p=0;
  rows.forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top+r.height/2<o.y) p++; });
  var tr=td.querySelector(".trows"), R=(tr||td).getBoundingClientRect(), ly, hd=td.querySelector(".tdh");
  if(rows.length) ly=p<rows.length?rows[p].getBoundingClientRect().top-2:rows[rows.length-1].getBoundingClientRect().bottom+2;
  else ly=tr?R.top+8:(hd?hd.getBoundingClientRect().bottom+4:R.top+8);
  o.ln.style.top=Math.round(ly-2)+"px"; o.ln.style.left=Math.round(R.left+(tr?70:12))+"px"; o.ln.style.width=Math.max(60,Math.round(R.width-(tr?74:24)))+"px"; o.ln.hidden=false; o.tg={p:p,dj:dj}; }
function dgSwap(pl,di,k1,dj,k2){ var a=pl.days[di], b=pl.days[dj]; if(!a||!b||k1===k2) return false; var i=a.stops.indexOf(k1), j=b.stops.indexOf(k2); if(i<0||j<0) return false;
  a.stops[i]=k2; b.stops[j]=k1;
  var ks=TR.items.map(function(y){ return y.k; }), p=ks.indexOf(k1), q=ks.indexOf(k2); if(p>=0&&q>=0){ var t=TR.items[p]; TR.items[p]=TR.items[q]; TR.items[q]=t; }   // 다시 짜도 그 자리 쪽에 남게 카트 순서도 맞바꿈
  save(); refresh(); return true; }
function dgEnd(ok){ var o=DG; if(!o) return; DG=null; DGT=Date.now(); cancelAnimationFrame(o.raf); o.gh.remove(); o.ln.remove(); o.row.classList.remove("tdsrc");
  var sw=document.querySelector("#trRep .tswap"); if(sw) sw.classList.remove("tswap");
  var pl=TR.plan, t=o.tg; if(!ok||!pl||!t) return;
  if(t.no){ lgToast(T5(DG6.city)); return; }
  var x=pl.pool[o.k], nx=x?nm(x):"", msg="";
  if(t.sw){ var y=pl.pool[t.sw]; if(!dgSwap(pl,o.di,o.k,t.dj,t.sw)) return; msg=gTxt(DG6.sw,{a:nx,b:y?nm(y):""}); }
  else { var cur=pl.days[o.di].stops.filter(function(q){ return pl.pool[q]; }); if(t.dj===o.di&&t.p===cur.indexOf(o.k)) return;   // 제자리
    if(!mvStop(pl,o.di,t.dj,t.p,o.k)) return; msg=t.dj===o.di?gTxt(DG6.ord,{p:nx}):gTxt(FX6.mD,{p:nx,d:dLbl(t.dj)}); }
  pl.days[o.di].aiX=1; pl.days[t.dj].aiX=1;   // 그날 AI 설명은 옛 순서 얘기라 감춘다(새로 짜기와 같게)
  pl.chk=0; save(); try{ ntap("_trip",t.sw?"trip_dragswap":"trip_drag"); }catch(e){}
  repPaint(); [].forEach.call(document.querySelectorAll(".tlgtoast"),function(z){ z.remove(); }); lgToast(msg); setTimeout(function(){ if(TR.plan===pl&&document.getElementById("trRep")&&chkList().length) chkOpen(true); },150); }
(function(){ var P=null, clr=function(){ if(P&&P.tm) clearTimeout(P.tm); P=null; };
  document.addEventListener("touchstart",function(e){ if(DG||e.touches.length!==1){ clr(); return; } var row=dgRow(e.target); if(!row||e.target.closest("a,button,input,select")) return; var t=e.touches[0];
    clr(); P={row:row,x:t.clientX,y:t.clientY}; P.tm=setTimeout(function(){ if(!P) return; var q=P; P=null; dgStart(q.row,q.x,q.y,1); },450); },{passive:true});
  document.addEventListener("touchmove",function(e){ var t=e.touches[0]; if(DG){ if(e.cancelable) e.preventDefault(); dgMove(t.clientX,t.clientY); return; }
    if(P&&(Math.abs(t.clientX-P.x)>10||Math.abs(t.clientY-P.y)>10)) clr(); },{passive:false});
  document.addEventListener("touchend",function(e){ if(DG){ if(e.cancelable) e.preventDefault(); dgEnd(true); } else clr(); },{passive:false});
  document.addEventListener("touchcancel",function(){ if(DG) dgEnd(false); else clr(); });
  document.addEventListener("mousedown",function(e){ if(e.button!==0||DG) return; var row=dgRow(e.target); if(!row||e.target.closest("a,button,input,select")) return; P={row:row,x:e.clientX,y:e.clientY,mouse:1}; },true);
  document.addEventListener("mousemove",function(e){ if(DG){ if(DG.touch) return; e.preventDefault(); dgMove(e.clientX,e.clientY); return; }
    if(P&&P.mouse&&(Math.abs(e.clientX-P.x)>6||Math.abs(e.clientY-P.y)>6)){ var q=P; P=null; dgStart(q.row,q.x,q.y,0); dgMove(e.clientX,e.clientY); } });
  document.addEventListener("mouseup",function(){ if(DG&&!DG.touch) dgEnd(true); if(P&&P.mouse) P=null; });
  document.addEventListener("contextmenu",function(e){ if(DG||(P&&!P.mouse)) e.preventDefault(); },true);
  window.addEventListener("click",function(e){ if(Date.now()-DGT<450&&e.target&&e.target.closest&&e.target.closest("#trRep")){ e.preventDefault(); e.stopPropagation(); } },true);   // 끌고 놓은 손가락·마우스가 누르기로 읽히지 않게
  document.addEventListener("keydown",function(e){ if(DG&&e.key==="Escape") dgEnd(false); });
})();

// ── 시작 ──
var css=document.createElement("style"); css.textContent=
 ".tradd{margin:8px 0 0;border:1.5px solid var(--green);background:#eefaf0;color:#2b8a3e;border-radius:999px;padding:7px 14px;font-weight:800;font-size:13.5px;cursor:pointer;font-family:inherit}.tradd.on{background:var(--green);color:#fff}"
+":root[data-theme=dark] .tradd{background:#13261a}:root[data-theme=dark] .tradd.on{background:var(--green)}"
+"#mz .trf{position:absolute;z-index:3;pointer-events:none;transform-origin:0 100%}#mz .trf b{display:block;position:relative;margin-left:0;background:#0ea5e9;color:#fff;font-weight:900;line-height:1;padding:.3em .45em .3em .4em;border-radius:.25em .45em .45em 0;box-shadow:0 1px 3px rgba(0,0,0,.4);white-space:nowrap;margin-bottom:1.1em}#mz .trf b:after{content:'';position:absolute;left:0;top:100%;width:.16em;height:1.1em;background:#1e3a5f}"   // 지도 번호 깃발 = 하늘색 판·흰 글자·남색 깃대 — 주황 「+N」 묶음 배지와 헷갈리지 않게 (사장님 11-06)
+".trlock,.trlock body{overflow:hidden}.trsheet{position:fixed;inset:0;z-index:1035;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}.trsheet .trin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px}"
+".trtop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin:2px 0 10px}.trl{list-style:none;padding:0;margin:0}.tri{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:6px 0;touch-action:pan-y}.tri.drag{opacity:.7;box-shadow:0 4px 14px rgba(0,0,0,.2)}"   // 11-07 카트 줄은 손가락으로 위아래 넘김(pan-y) — 끌기는 ☰(.trh, touch-action:none)에서만
+".trh{cursor:grab;font-size:18px;color:var(--sub);padding:0 4px;user-select:none;touch-action:none}.trn{background:#e8590c;color:#fff;border-radius:6px;min-width:22px;text-align:center;font-size:13px;padding:2px 4px}.trt{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:700;font-size:14.5px}.trt i{font-style:normal;color:var(--sub);font-weight:500;font-size:12.5px}.trx{border:0;background:none;color:var(--sub);font-size:18px;cursor:pointer}"   // 긴 식당 이름은 줄을 바꿔 칸 안에 (11-07 — PC 카트 옆 스크롤바)
+".trf2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.trf2 label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700}.trf2 .wide{grid-column:1/-1}.trf2 select,.trf2 input{font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit;width:100%}"
+".trsr{display:flex;gap:6px}.tra{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:4px 0;cursor:pointer;font-size:14px}"
+".trbtn{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 14px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;margin:4px 4px 0 0}.trbtn.big{display:block;width:100%;margin-right:0;background:var(--green);border-color:var(--green);color:#fff;font-size:17px;padding:13px}.trbtn:disabled{opacity:.6}.trbtn.ib{padding:9px 12px}"   // 꽉 찬 단추(.big)는 오른쪽 여백 0 — 「일정 짜기」 4px 가 PC 카트에 옆 스크롤바를 만들었다 (11-07)
+".trbar{display:flex;flex-wrap:wrap;margin:0 0 8px}.tday{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:12px 0}.tdh{font-weight:900;font-size:17px;display:flex;align-items:baseline;gap:6px}.tdh span{color:#e8590c}.tdh small{margin-left:auto;font-size:11px;color:var(--sub);font-weight:700}"
+".tai{font-size:14px;line-height:1.6;margin:6px 0 8px;color:var(--ink)}.tmap{margin:6px 0 8px;border-radius:12px;overflow:hidden;background:#96b2c4}.tmap img,.tmap canvas{display:block;width:100%;height:auto}"
+".trw{display:flex;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:14.5px}.trw .tt{font-weight:900;min-width:46px;color:var(--sub)}.trw .tp{flex:1}.trw.tpk{cursor:pointer}.trw.tpk.on{background:rgba(11,155,110,.10);box-shadow:inset 3px 0 0 #0b9b6e}.trw.h .tp,.trw.l .tp{color:var(--sub);font-weight:700}.trw i{font-style:normal;color:var(--sub);font-size:12.5px}"
+".tgap{margin-top:8px;border:1.5px dashed #e8590c;background:#fff7ed;border-radius:10px;padding:9px 10px;font-size:13.5px;line-height:1.5}.tgap .tgr{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.tgap .trbtn{margin:0;width:auto;padding:7px 12px}.tgap input{font:inherit;padding:5px 8px;border:1px solid #d6dde5;border-radius:8px}"
+".tno{display:inline-block;background:#fff;color:#0284c7;border:2px solid #0ea5e9;border-radius:50%;width:22px;height:22px;line-height:18px;text-align:center;font-size:12px}.tmemo{display:block;font-size:12.5px;color:#c2410c;font-weight:700;margin-top:2px}.ttip{display:block;font-size:13px;color:var(--sub);margin-top:3px;line-height:1.45}"
+".tlg{font-size:12.5px;color:#1a73e8;font-weight:700;padding:3px 0 5px 56px;cursor:pointer}.tlg a{color:#1a73e8}.tods .trh{font-size:14px;color:var(--ink);padding:0;cursor:auto}"
+".tlg{position:relative}.tlg:has(>.xtg){padding-right:32px}.tlg>.xtg{position:absolute;right:-2px;top:-2px}.tlg:has(>.xtg)>.tods{margin-right:-32px}.tlg:has(>.xtg)>.tlgo,.tlg>.tlgt{white-space:nowrap}"   // 「실제 경로 보기」 줄 오른쪽 끝 ▼/— (11-07) · 링크 글자는 중간에서 안 끊기게
+".teat{display:block;margin-top:4px;font-weight:500;color:var(--ink)}.tehd{display:block;font-size:12.5px;color:var(--sub);font-weight:800}.tec{display:block;padding:4px 0;border-top:1px dashed var(--line);font-size:13.5px}.tec i,.teat i{font-style:normal;color:var(--sub);font-size:12px}"
+".tesrc{display:block;font-size:11.5px;color:var(--sub);margin-top:1px}.tesrc a{color:var(--sub)}.tead{display:inline-block;background:#f59f00;color:#fff;border-radius:4px;padding:0 5px;font-size:11px}.tebtn{border:1.5px solid var(--green);background:var(--card);color:#2b8a3e;border-radius:999px;padding:3px 10px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;margin-left:4px}"
+".teact{display:block;margin-top:4px}.teact a{display:inline-block;margin:3px 5px 0 0;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;color:var(--ink);background:var(--bg)}.trck{flex-direction:row!important;align-items:center;gap:6px!important;font-size:13px!important}.trck input{width:auto!important}"
+".trpop{position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}.trpop>div{background:var(--card);color:var(--ink);max-width:440px;border-radius:16px;padding:16px 18px;font-size:14.5px;text-align:center}"
+".trshot{position:absolute;left:-12000px;top:0;width:680px;background:var(--bg);padding:0}.trshot .tday{margin:0}"
// 넓은 화면(PC 창) — 덮개 대신 가운데 일정 칸 자체가 스크롤, 스크롤바가 칸 오른쪽 가장자리에 (사장님 11-06 「팝업창에도 스크롤바」) · 폰(700px 미만)은 그대로
+"@media (min-width:700px){.trsheet{overflow:hidden}.trsheet .trin{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:var(--sub,#8a94a6) var(--line,#e6e9ef);padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}"
+".trpop>div{max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto;box-sizing:border-box;overscroll-behavior:contain;scrollbar-color:var(--sub,#8a94a6) var(--line,#e6e9ef)}}"
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
+".stpl a{display:inline-block;border:1.5px solid #1c7ed6;color:#1c7ed6;border-radius:999px;padding:5px 12px;font-weight:800;font-size:13px;text-decoration:none;background:var(--bg)}.stpn{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}.trsync{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:4px 0 10px;padding:9px 12px;border:1px dashed #74c0fc;border-radius:12px;background:#e7f5ff;color:#1864ab;font-size:13.5px;font-weight:700}.trsync .trbtn{margin:0}#trchip{display:inline-flex;align-items:center;gap:2px;line-height:1;color:var(--ink)}#trchip .tcn{font-size:15px;font-weight:800}.stpn .trbtn[disabled]{opacity:.4;cursor:default}.stph b .stsub{display:block;font-size:12px;font-weight:700;color:#2b8a3e;margin-top:2px}.stpn .trbtn.big{width:100%}"
+"#trNow{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:1020;max-width:560px;margin:0 auto;background:var(--card);color:var(--ink);border:1.5px solid #0c8599;border-radius:16px;box-shadow:0 8px 26px rgba(0,0,0,.25);padding:9px 12px 10px;font-size:13.5px;max-height:46vh;overflow:auto;font-family:inherit}"
+"#trNow.flash{animation:tnFl 1.2s ease-out 2}@keyframes tnFl{0%{box-shadow:0 0 0 0 rgba(12,133,153,.7)}100%{box-shadow:0 0 0 14px rgba(12,133,153,0)}}"
+"#trNow .tnh{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#0b7285;margin-bottom:3px}.tnx{border:0;background:none;color:var(--sub);font-size:17px;cursor:pointer;padding:2px 4px}"
+"#trNow .tnc b{font-size:15px}#trNow .tnc span{color:var(--sub);font-size:12.5px;font-weight:700}#trNow .tnn{font-size:12.5px;color:#1a73e8;font-weight:700;margin-top:3px}"
+".tnb{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.tnb button{border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:999px;padding:6px 11px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit}:root[data-theme=dark] .tnb button{background:#0a2a30;color:#99e9f2}"
+".tnq{border:1.5px solid #e8590c;background:#fff4e6;border-radius:12px;padding:8px 10px;margin:4px 0 6px}.tnq b{color:#c2410c;font-size:14.5px}.tnq>div{font-size:12.5px;line-height:1.45;margin-top:2px}.tnq .tnb button{border-color:#e8590c;background:#fff;color:#c2410c}:root[data-theme=dark] .tnq{background:#3a1d08}"
+".tnr{margin-top:6px;border-top:1px dashed var(--line);padding-top:6px;font-size:13px}.tnm{font-size:13px;font-weight:800;color:#2b8a3e;margin:4px 0}.tnl{display:block;margin-top:6px}.tnl a{display:inline-block;margin:3px 5px 0 0;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;color:var(--ink);text-decoration:none;background:var(--bg)}"
+".tnsr{display:flex;gap:6px}.tnsr input{flex:1;min-width:0;font-size:15px;padding:7px 9px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}.tnsr button{border:1px solid var(--line);background:var(--card);border-radius:10px;padding:0 10px}"
+"html.trnowon .map{height:calc(var(--MH,max(320px,calc(100vh - 300px))) - var(--trnowh,0px))!important}html.trnowon body{padding-bottom:var(--trnowh,0px)}"
+".trnm{color:#c2410c!important;font-weight:700;font-size:12px;line-height:1.4;margin-top:2px}"   // 여행 일수 칸을 1~90일로 맞췄다는 한 줄 (11-06)
+"#trPp{z-index:1060}#trPp>div.ppbox{position:relative;text-align:left;width:100%;max-width:460px;max-height:86vh;overflow:auto;box-sizing:border-box;padding:12px 14px 14px}.ppx{position:absolute;right:6px;top:4px;z-index:2;border:0;background:var(--card);border-radius:50%;width:34px;height:34px;font-size:19px;color:var(--sub);cursor:pointer}"
+"#trPp .item{margin:0;border:0;box-shadow:none;padding:2px 0 0;background:none}#trPp .t{font-size:17px;font-weight:900;margin:2px 36px 2px 0}.ppk{font-size:13px;margin:5px 0 3px;color:var(--ink)}.ppk b{color:var(--sub);margin-right:3px}.pph{font-size:13px;margin:5px 0;color:#0b7285;font-weight:700;line-height:1.45}.pph b{color:var(--sub)}#trPp .ttip{margin:6px 0}"
+"#trRep .tec b,#trRep .teat.on b{cursor:pointer}#trRep .trw.tpk .tp>b:not(.tno){text-decoration:underline dotted;text-underline-offset:3px}"
// 11-07 카트 머무는 시간 칸·판단 한 줄·눈에 띄게 · 검사 창 · 식당 찾기·저녁 일정 추가·넣기 전 확인 (폰 412px 먼저)
+".trt{display:block;min-width:0}.trsw{display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-top:5px;font-size:12.5px;color:var(--sub);font-weight:700}.trsw select{font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit;font-weight:700;max-width:100%}"
+".trjd{display:block;font-size:12px;color:#c2410c;font-weight:700;margin-top:4px;line-height:1.45}.tri.hl{border:2px solid #e8590c;background:#fff4e6;box-shadow:0 0 0 3px rgba(232,89,12,.18)}:root[data-theme=dark] .tri.hl{background:#3a1d08}"
+".trhln{font-size:13px;color:#c2410c;background:#fff4e6;border:1px solid #ffc078;border-radius:10px;padding:7px 10px;margin:4px 0 6px;font-weight:700;line-height:1.45}:root[data-theme=dark] .trhln{background:#3a1d08;border-color:#8a4b00}"
+".tchkbar{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1.5px solid #e8590c;background:#fff4e6;color:#c2410c;border-radius:10px;padding:6px 10px;margin:4px 0 8px;font-weight:800;font-size:13.5px}.tchkbar .trbtn{margin:0;padding:5px 12px;font-size:13px;border-color:#e8590c;color:#c2410c;flex:0 0 auto}:root[data-theme=dark] .tchkbar{background:#3a1d08}"
+"#trChk{z-index:1055}#trChk>div.tchkbox{text-align:left;width:100%;max-width:460px;max-height:86vh;overflow:auto;box-sizing:border-box}.tchkc{border-top:1px solid var(--line);padding:9px 0}.tchkh{font-size:14.5px;line-height:1.4}.tchkm{font-size:13.5px;color:#c2410c;font-weight:700;margin:3px 0 7px;line-height:1.5}"
+".tchkc .tgr,.efi .tgr{display:flex;flex-wrap:wrap;gap:6px}.tchkc .trbtn,.efi .trbtn{margin:0;padding:7px 12px;font-size:13px}.trbtn.pri{background:#1c7ed6;border-color:#1c7ed6;color:#fff}"
+"#trEf,#trGc{z-index:1052}#trEf>div.efbox,#trGc>div.efbox{position:relative;text-align:left;width:100%;max-width:460px;max-height:86vh;overflow:auto;box-sizing:border-box;padding:14px 14px 16px}"
+".efi{border-top:1px solid var(--line);padding:9px 0;font-size:13.5px;line-height:1.45}.efi i{font-style:normal;color:var(--sub);font-size:12px}.efm{font-size:12px;color:var(--sub);margin:3px 0 6px}"
+"#trIns{z-index:1065}#trIns>div.insbox{text-align:left;width:100%;max-width:440px;max-height:86vh;overflow:auto;box-sizing:border-box}.insn{font-size:14px;line-height:1.5;margin:6px 0 4px;padding:8px 10px;background:var(--bg);border-radius:10px}.insn i{font-style:normal;color:var(--sub);font-size:12px}"
+".insl{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700;margin:10px 0 0}.insl select{font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit;width:100%}"
+".insp{margin-top:10px;font-size:13.5px;font-weight:700;color:#0b7285;background:#e3fafc;border-radius:8px;padding:7px 10px;line-height:1.5}:root[data-theme=dark] .insp{background:#0a2a30;color:#99e9f2}.insov{color:#c2410c}.talb .insno{background:#efece4;color:#1d2433}"
+".teve{border-color:#5f3dc4;background:#f3f0ff}.teve b{color:#3b2a8a}:root[data-theme=dark] .teve{background:#1e1838}:root[data-theme=dark] .teve b{color:#d0bfff}.tefb{border-color:#1c7ed6;color:#1c7ed6;margin:4px 0 0}"
+".tgpsub{display:block;font-size:12.5px;color:var(--sub);font-weight:700;margin-top:2px}.tgrec{display:block;width:100%;text-align:left;border:1.5px solid var(--green);background:var(--card);color:var(--ink);border-radius:12px;padding:8px 11px;margin:7px 0 0;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;line-height:1.45}.tgrec small{display:block;font-size:12.5px;font-weight:700;color:#c2410c;margin-top:2px}"   // 장소 사이 빈 시간 칸 (11-07) — 「…부터 …까지 비어요」 · 다른 날 오전 장소 옮기기 추천(초록 테)
+"a.trsv{display:inline-block;margin:3px 5px 0 0;border:1.5px solid #2b8a3e!important;color:#2b8a3e!important;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:800;text-decoration:none;background:var(--bg)}.ppr{margin-top:6px}"
// 11-07 카트 「시작 시각」 칸 · 검사 창 「다른 날로 옮기기」(날 고르기)·「머무는 시간 줄이기」 창
+".trswl{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px}.trfxw{display:inline-flex;align-items:center;max-width:100%}.trfxb{border:1px dashed #74c0fc;background:var(--bg);color:#1864ab;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit}"
+".trfx{display:inline-flex;align-items:center;gap:2px;border:1.5px solid #1c7ed6;background:#e7f5ff;color:#1864ab;border-radius:999px;padding:2px 2px 2px 10px;font-weight:800;font-size:12.5px}.trfxx{border:0;background:none;color:#1864ab;font-size:14px;cursor:pointer;padding:2px 7px;font-family:inherit}:root[data-theme=dark] .trfx{background:#10263d;color:#a5d8ff}:root[data-theme=dark] .trfxx{color:#a5d8ff}"
+".trfxe{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}.trfxi{font-size:14px;padding:4px 6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit}.trfxok{border:1.5px solid #1c7ed6;background:#1c7ed6;color:#fff;border-radius:999px;padding:4px 12px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit}.trfxno{border:0;background:none;color:var(--sub);font-size:14px;cursor:pointer;padding:2px 6px;font-family:inherit}"
+"#trMv,#trSt{z-index:1060}#trMv>div.mvbox,#trSt>div.mvbox{text-align:left;width:100%;max-width:460px;max-height:86vh;overflow:auto;box-sizing:border-box}"
+".mvd{display:block;width:100%;text-align:left;border:1.5px solid #1c7ed6;background:var(--card);color:var(--ink);border-radius:12px;padding:9px 11px;margin:8px 0 0;font:inherit;font-size:14px;cursor:pointer;line-height:1.45}.mvd i{font-style:normal;color:var(--sub);font-size:12px}.mvd.no{border:1px dashed var(--line);cursor:default}.mvd.no b{color:var(--sub)}"
+".mvok{display:block;color:#2b8a3e;font-weight:800;font-size:13.5px;margin-top:3px}.mvm{display:block;color:#c2410c;font-weight:700;font-size:13px;margin-top:3px}.mvp{display:block;font-size:12.5px;color:#0b7285;font-weight:700;margin-top:2px}:root[data-theme=dark] .mvp{color:#99e9f2}"
+".mvnone{margin-top:10px;border:1.5px dashed #e8590c;background:#fff7ed;border-radius:10px;padding:9px 10px;font-size:13.5px;line-height:1.5}.mvnone .tgr{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.mvnone .trbtn{margin:0;width:auto;padding:7px 12px}:root[data-theme=dark] .mvnone{background:#3a1d08}"
+".stl{display:flex;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 2px;font-size:14px}.stl .tt{font-weight:900;min-width:44px;color:var(--sub)}.stl .stn{flex:1;min-width:0;line-height:1.4}.stl select{font-size:14px;padding:5px 6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-family:inherit;font-weight:700;flex:0 0 auto}"
+".stl.on{background:#fff4e6;box-shadow:inset 3px 0 0 #e8590c}:root[data-theme=dark] .stl.on{background:#3a1d08}.stok2{color:#2b8a3e}";

document.head.appendChild(css);
window.TRIP={open:openPanel,report:openReport,close:sheetClose,state:function(){ return TR; },hasPass:hasPass,
  panel:function(){ if(document.getElementById("trBox")) panelPaint(); },reset:stReset,mk:function(k){ return MKC[k]||null; },photo:function(k,ko,lat,lng,el,done){ return ppPhoto(k,ko,lat,lng,el,done); },   // 11-08 홈페이지 — 카트 다시 그리기·처음부터 다시·지도 번호 자리
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
// 11-08 사장님 「일목요연」 — 세로 시간선(왼쪽 시각 · 가운데 선 · 점) · 장소/식당 카드 · 회색 이동 줄 · 날 머리 요약(위에 붙어 따라옴) · 색은 초록·노랑·회색(빨강은 경고만) · 끌기 모양
//   선 가운데 = 줄 왼쪽에서 62px (시각 칸 50 + 12) · 카드·이동 줄 글은 74px 부터
var css3=document.createElement("style"); css3.id="trBoardCss"; css3.textContent=
".tdhint{margin:0 2px 8px;font-size:12.5px;line-height:1.5}"
+".tdh{position:sticky;top:0;z-index:4;background:var(--card);flex-wrap:wrap;row-gap:2px;margin:-12px -14px 4px;padding:12px 14px 8px;border-radius:16px 16px 0 0}"
+".tdh span{color:#2b8a3e}.tdh .tsum{font-style:normal;margin-left:auto;font-size:12.5px;font-weight:700;color:var(--sub);white-space:nowrap}"
+".tdh .tcty{background:#ebfbee;color:#2b8a3e}:root[data-theme=dark] .tdh .tcty{background:#13261a;color:#8ce99a}"
+".trows{position:relative;padding:2px 0}"
+".trows:before{content:'';position:absolute;left:61px;top:14px;bottom:14px;width:2px;border-radius:2px;background:#d3e5d8}:root[data-theme=dark] .trows:before{background:#2b3a30}"
+".trows .trw{position:relative;gap:0;border-top:0;padding:5px 0}"
+".trows .trw .tt{flex:0 0 50px;width:50px;min-width:50px;font-size:13.5px;padding-top:1px}"
+".trows .trw .tp{margin-left:24px;min-width:0}"
+".trows .trw:before{content:'';position:absolute;left:56px;top:10px;width:8px;height:8px;border-radius:50%;background:var(--card);border:2px solid #adb5bd}"
+".trows .trw.tpk:before,.trows .trw:has(>.tp>img.miic:first-child):before{display:none}"
+".trows .trw .tp>img.miic:first-child{position:absolute;left:51px;top:4px;width:22px!important;height:22px!important;margin:0!important;vertical-align:0!important;background:var(--card);border-radius:50%;padding:2px;box-sizing:border-box}"
+".trows .trw.tcx .tp>img.miic:first-child{top:12px}"
+".trows .trw.tcx .tp{background:var(--card);border:1px solid #cfe3d5;border-radius:12px;padding:8px 40px 8px 10px;box-shadow:0 1px 3px rgba(16,24,40,.07);cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}"
+".trows .trw.l.tcx .tp{border-color:#f1dc8f;background:#fffcf0}:root[data-theme=dark] .trows .trw.tcx .tp{border-color:#2b4a35}:root[data-theme=dark] .trows .trw.l.tcx .tp{background:#221f12;border-color:#5c4d1a}"
+".trows .trw.tpk .tno{position:absolute;left:50px;top:11px;z-index:1;box-sizing:border-box;width:24px;height:24px;line-height:20px;background:#2f9e44;color:#fff;border:2px solid var(--card);font-size:12px}"
+".trows .trw.tpk .tpn{font-weight:800}.teve b{color:#2b8a3e}:root[data-theme=dark] .teve b{color:#8ce99a}#trRep .trows .trw.tpk .tp>b:not(.tno){text-decoration:none}.trows .trw.tpk.on{background:none;box-shadow:none}.trows .trw.tpk.on .tp{border-color:#2f9e44;box-shadow:0 0 0 2px rgba(47,158,68,.2)}"
+".trows .trw.tcx .tp>.xtg{position:absolute;right:8px;top:10px}"
+".trw.tcx:not(.open) .tdet,.trw.tcx:not(.open) .teact,.trw.tcx:not(.open) .tesrc{display:none}"
+".tdet{display:block}.tdbt{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:6px;margin-top:6px;text-align:right}.tfxw{display:inline-flex;align-items:center;max-width:100%}.tfxw .trfxe{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}"
+".tsbtn{border:1.5px solid var(--green);background:var(--card);color:#2b8a3e;border-radius:999px;padding:4px 11px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;margin:0}"
+".tepk{margin-top:4px}"
+".psbox{margin:4px 0 10px}.psr{margin:0 0 6px}.psr input{flex:1;min-width:0;font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit}.psh{font-size:12.5px;font-weight:800;color:#2b8a3e;margin:8px 0 2px}"
+".tdays{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;margin:2px 0 8px}.tdays .trbtn{margin:0;padding:4px 10px;font-size:12px;font-weight:700;color:var(--sub)}.teve .tgr{justify-content:flex-end}.tlq b{display:flex;align-items:center;gap:4px}"
+".tstay{-webkit-appearance:menulist!important;appearance:auto!important;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--sub);font:inherit;font-size:12.5px;font-weight:700;padding:1px 2px;margin-left:2px;max-width:112px;cursor:pointer}.tmact{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;margin-top:6px}.trows .trw.tcx .tmact,.trows .trw.tcx .tdbt{margin-right:-30px}.tmact .trbtn{margin:0;padding:5px 11px;font-size:12.5px}"
+".ttoday{margin:6px 0 6px;padding:8px 10px;border:1.5px solid #2f9e44;border-radius:12px;background:#ebfbee}.ttoday b{display:block;font-size:13px;color:#2b8a3e;margin-bottom:5px}.ttoday .tgr{margin-top:0}.ttoday .trbtn{margin:0;padding:6px 12px;font-size:13px}:root[data-theme=dark] .ttoday{background:#13261a}"
+".trows .trw.tmd .tp{background:var(--card);border:1px solid #cfe3d5;border-radius:12px;padding:8px 10px;box-shadow:0 1px 3px rgba(16,24,40,.07)}.trows .trw.tmd:before{border-color:#2f9e44;background:#2f9e44}.trud{display:inline-block;margin-left:8px;font-size:12.5px;font-weight:700;color:var(--sub)}"
+".tmemo{color:#e03131}.tmemo.ti{color:var(--sub);font-weight:600}"
+".trows .tlg{color:var(--sub);font-weight:600;font-size:12.5px;padding:1px 0 1px 74px}.trows .tlg .miic{opacity:.85}"
+".tlg:after{content:'›';margin-left:6px;font-weight:900;font-size:15px;line-height:1}.tlg>.tods:empty{display:none}"
+".trows .tgap,.trows>.d,.trows>.tnight,.trows>.tmemo{margin-left:74px}.trows>.d{font-size:12.5px;line-height:1.45;color:var(--sub)}"
+".txc{border-color:#cfd6de;background:var(--card)}:root[data-theme=dark] .txc{background:var(--card);border-color:#3a4558}.tnight{border-color:#adb5bd;background:var(--bg)}.tnight b{color:var(--ink)}.tnight a{border-color:var(--line);color:#2b8a3e}:root[data-theme=dark] .tnight{background:var(--bg)}:root[data-theme=dark] .tnight b{color:var(--ink)}"
+".tgap{border-color:#f2c94c;background:#fffbea}:root[data-theme=dark] .tgap{background:#2a2410;border-color:#8a6d1a}"
+".trw.tdsrc .tp{opacity:.35}.trw.tswap .tp{outline:3px solid #f2c94c;outline-offset:1px}"
+".tdgh{position:fixed;left:0;top:0;z-index:2147483005;pointer-events:none;margin:0;opacity:.95;background:var(--card);color:var(--ink);border:2px solid #2f9e44;border-radius:12px;padding:8px 10px;box-shadow:0 12px 28px rgba(0,0,0,.28);font-size:14.5px;box-sizing:border-box}"
+".tdgh .xtg,.tdgh .tdet,.tdgh .tmemo,.tdgh .tlvw,.tdgh .txd{display:none}.tdgh .tno{margin-right:6px}.tdgh.no{border-color:#e03131;opacity:.7}"
+".tdins{position:fixed;height:4px;border-radius:4px;background:#2f9e44;z-index:2147483004;pointer-events:none;box-shadow:0 0 0 3px rgba(47,158,68,.22)}"
// 11-08 내 플랜 — 플랜 고르기 줄(카트·일정표 맨 위) · 자유 일정 날 [이 날짜로 새 플랜]
+".trpbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}.trpbt{display:flex;gap:6px;flex:0 0 auto;margin-left:auto}.trpbar .trpsel{flex:1 0 auto;min-width:0;max-width:100%;font-size:15px;font-weight:800;padding:8px 10px;border-radius:10px;border:1.5px solid var(--green);background:var(--card);color:var(--ink);font-family:inherit;cursor:pointer}"
+".trpbar .trbtn{margin:0;flex:0 0 auto;padding:7px 12px;font-size:13px;color:var(--sub)}.trpbar .trpnew{border-color:var(--green);color:#2b8a3e}:root[data-theme=dark] .trpbar .trpnew{color:#8ce99a}"
+".tfree{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:6px 0}.tfree .d{margin:0}.tfree .trbtn{margin:0 0 0 auto;padding:5px 11px;font-size:12.5px;border-color:var(--green);color:#2b8a3e}:root[data-theme=dark] .tfree .trbtn{color:#8ce99a}"
// 11-09 사장님 — 일정표 빼기 ✕ (카트 .trx 그대로) · 카드 머리줄 오른쪽 끝(▼/ㅡ 바로 왼쪽), 첫 줄만 비켜 가게 float · 묻는 창
+".trows .trw .tp>.txd{float:right;height:26px;line-height:26px;margin:1px -2px 0 6px;padding:0 4px}.trows .trw:not(.tcx) .tp>.txd{margin-right:39px}"   // 카드가 아닌 줄(숙소에서 쉬기)도 카드 ✕ 와 같은 세로줄에
+".txq{width:100%;max-width:380px}.txq .tals{font-size:15.5px;font-weight:800;color:var(--ink);line-height:1.5;margin:4px 0 0}";
(document.head||document.documentElement).appendChild(css3);

})();
