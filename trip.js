/* 머니퍼즐 내비 — 「맞춤형 투어(내 여행 일정)」 (사장님 2026-10-15)
 *  담기(무료) → 조건 → 「일정 짜기」(이용권: hasPass) → 날짜별 보고서 · 약도 동선 · PDF · 공유
 *  · 날짜 나누기·순서는 이 기기에서 계산 (숙소 기준 부채꼴 나누기 + 최근접 + 2-opt). 구간 시간은 직선거리 어림
 *  · 실제 대중교통 경로(ODsay)는 손님이 그 구간을 누를 때만 — 기존 odsBox 흐름 그대로
 *  · AI(허브 POST /ntrip)는 날짜별 설명·장소별 팁만. 보내는 것: 장소 키·이름·순서·시각·체류분·요일·숙소 이름. 좌표·위치 없음
 *  · 저장은 이 기기 localStorage(mpv_trip)뿐. 「현재 위치」 숙소는 좌표를 저장하지 않는다(그때그때 화면에서만)
 *  index.html 은 맨 끝 <script src="trip.js"> 한 줄뿐 — 나머지는 전역 함수(placeShow·spinCard·zApply·mapLoad·setLang)를 감싸서 붙는다
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
  o.opt=Object.assign({n:3,start:"",from:"09:30",to:"20:00",walk:1,hotel:null,food:"any",adv:false},o.opt||{}); return o; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(TR)); }catch(e){} }
function L(){ return window.LANG!=="ko"; }   // 외국어 화면(영·일·중) — 10-18
function nm(it){ if(!it) return ""; if(!L()) return it.ko; var p=it.k&&window.PLACES&&PLACES[it.k]; return (p&&p[LANG])||it[LANG]||it.en||it.ko; }   // 일·중 이름은 지금 받은 장소 자료에서
function T5(o){ return o[window.LANG]||o.en; }   // 다섯 말 문구 (10-20)
function LG6(o){ return o[window.LANG]||o.en; }   // 6개 언어 문구 (일정 공유·가이드 보내기, 10-24)
function aiTx(a){ return !a?"":LANG==="ko"?a.ko:(a[LANG]||a.en); }   // AI 설명 — 허브가 그 언어 칸을 주면 그것, 아니면 영어
function km(a,b){ var R=6371, rd=Math.PI/180, dLa=(b.lat-a.lat)*rd, dLo=(b.lng-a.lng)*rd, h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a.lat*rd)*Math.cos(b.lat*rd)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(h)); }
function hm2m(s){ var m=/^(\d{1,2}):(\d{2})$/.exec(s||""); return m?(+m[1])*60+(+m[2]):null; }
function m2hm(m){ m=Math.round(m); return ("0"+Math.floor(m/60)).slice(-2)+":"+("0"+(m%60)).slice(-2); }
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
function isNight(it){ return /밤 추천|night/i.test((it.d||"")+" "+(it.den||"")); }

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
function needCheck(it){ var c=catOf(it); return !FACT[it.k]&&/^(palace|museum|theme|tower|show|cruise)$/.test(c); }

// ── 담기 ──
function has(k){ return TR.items.some(function(x){ return x.k===k; }); }
function snapPlace(k){ var p=window.PLACES&&PLACES[k]; if(!p) return null; return {k:k,ko:p.ko,en:p.en||p.ko,lat:+p.lat,lng:+p.lng,addr:p.addr||"",addr_en:p.addr_en||"",d:p.dko||"",den:p.den||""}; }
function pinKey(p){ var s=(p.ko||"")+"|"+(+p.lat).toFixed(5)+"|"+(+p.lng).toFixed(5), h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return "pin_"+(h>>>0).toString(36); }
function snapPin(){ var p=window.PLACES&&PLACES.__pin; if(!p) return null; return {k:pinKey(p),ko:p.ko,en:p.en||p.ko,lat:+p.lat,lng:+p.lng,addr:p.addr||"",addr_en:p.addr_en||"",cat:p.cat||"",pin:1}; }
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
  if(document.getElementById("trRep")) repAgain(); if(document.getElementById("trGd")) gdPaint(); });   // 열린 창은 그 자리에서 (lang.js, 10-18)
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
function refresh(){ var n=TR.items.length, mm=document.getElementById("mm");
  if(mm){ var a=document.getElementById("mtrip"); if(!a){ a=document.createElement("a"); a.id="mtrip"; a.href="#"; a.className="mi"; a.onclick=function(){ mm.hidden=true; openPanel(); return false; }; mm.insertBefore(a,mm.firstChild); }
    a.innerHTML='<img class="miic" src="img/menu/mi_cart.png" alt="">'+esc(T("여행카트 ("+n+")","My trip ("+n+")")); }
  var tb=document.querySelector(".tbs"), c=document.getElementById("trchip");
  if(tb&&!c){ c=document.createElement("button"); c.id="trchip"; c.type="button"; c.className="tb"; c.onclick=openPanel; tb.insertBefore(c,document.getElementById("rs")); }
  if(c){ c.hidden=false; c.textContent="🛒 "+n; c.title=T("내 여행","My trip"); }
  flags(); }

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
function panelPaint(){ var box=document.querySelector("#trBox .trin"); if(!box) return; var o=TR.opt, n=TR.items.length;
  var li=TR.items.map(function(it,i){ var c=catOf(it), x=c==="hotel"?T(" · 숙소는 아래에서 고르세요"," · choose lodging below"):c==="trans"?T(" · 교통시설(일정에서 뺌)"," · transport (skipped)"):" · "+durTxt(stayOf(it));
    return '<li class="tri" data-k="'+esc(it.k)+'"><span class="trh" title="drag">☰</span><b class="trn">'+(i+1)+'</b><span class="trt">'+esc(nm(it))+'<i>'+esc(x)+'</i></span><button type="button" class="trx" data-k="'+esc(it.k)+'" aria-label="remove">✕</button></li>'; }).join("");
  var hsel='<select id="trHotel"><option value="">'+T("— 숙소 고르기 —","— Choose lodging —")+'</option><option value="__here"'+(o.hotel&&o.hotel.type==="here"?" selected":"")+'>'+T("📍 현재 위치","📍 My current location")+'</option>'
    +HOTELS.map(function(h){ return '<option value="'+esc(h.k)+'"'+(o.hotel&&o.hotel.k===h.k?" selected":"")+'>🏨 '+esc(nm(h))+'</option>'; }).join("")
    +(o.hotel&&o.hotel.type==="addr"?'<option value="__addr" selected>'+esc(hotelTxt(o.hotel))+'</option>':"")+'</select>';
  var days=""; for(var d=1;d<=7;d++) days+='<option'+(o.n===d?" selected":"")+' value="'+d+'">'+d+T("일"," day"+(d>1?"s":""))+'</option>';
  box.innerHTML='<div class="trtop"><b>'+T("🛒 내 여행","🛒 My trip")+' ('+n+')</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trBox\')">✕</button></div>'
    +(n?'<ol class="trl" id="trList">'+li+'</ol><button type="button" class="trbtn" id="trClearAll" style="margin:6px 0">'+T("🗑 모두 비우기","🗑 Clear all")+'</button><div class="d">'+T("☰ 를 끌어 순서를 바꿀 수 있어요 (일정 짜기는 동선에 맞게 다시 나눕니다)","Drag ☰ to reorder (planning re-arranges by route)")+'</div>'
      :'<div class="msg">'+T("아직 담은 곳이 없어요. 지도에서 그림을 누르고 「＋ 내 여행에 담기」를 누르세요.","Nothing added yet. Tap a picture on the map, then “＋ Add to my trip”.")+'</div>')
    +'<div class="trf2"><label>'+T("여행 일수","Days")+'<select id="trN">'+days+'</select></label>'
    +'<label>'+T("첫날","First day")+'<input type="date" id="trStart" value="'+esc(o.start||kstToday(1))+'"></label>'
    +'<label>'+T("하루 시작","Start")+'<input type="time" id="trFrom" value="'+esc(o.from)+'"></label>'
    +'<label>'+T("하루 끝","End")+'<input type="time" id="trTo" value="'+esc(o.to)+'"></label>'
    +'<label>'+T("걷기","Walking")+'<select id="trWalk"><option value="0"'+(o.walk===0?" selected":"")+'>'+T("적게 (1km까지)","Less (≤1 km)")+'</option><option value="1"'+(o.walk===1?" selected":"")+'>'+T("보통 (2km까지)","Normal (≤2 km)")+'</option><option value="2"'+(o.walk===2?" selected":"")+'>'+T("많이 (3km까지)","More (≤3 km)")+'</option></select></label>'
    +'<label>'+T("음식","Food")+'<select id="trFood">'+FOODS.map(function(f){ return '<option value="'+f[0]+'"'+(o.food===f[0]?" selected":"")+'>'+esc(T(f[1],f[2]))+'</option>'; }).join("")+'</select></label>'
    +'<label class="trck"><input type="checkbox" id="trAdv"'+(o.adv?" checked":"")+'> '+T("도전 음식도 괜찮아요","I’m adventurous")+'</label>'
    +'<label class="wide">'+T("숙소","Lodging")+hsel+'</label>'
    +'<div class="wide trsr"><input id="trAddrQ" placeholder="'+T("숙소 이름·주소로 찾기","Search lodging by name/address")+'"><button type="button" class="tb" id="trAddrGo">🔎</button></div><div class="wide" id="trAddrR"></div></div>'
    +'<button type="button" class="trbtn big" id="trPlan"'+(n?"":" disabled")+'>'+T("🗓 일정 짜기","🗓 Plan my trip")+'</button>'
    +(TR.plan?'<button type="button" class="trbtn" id="trOpenRep">'+T("📄 지난 일정 보기","📄 Open last plan")+'</button>':"")
    +'<div class="d" style="margin-top:8px">'+T("일정은 이 기기에만 저장돼요. 위치는 저장하지 않아요.","Your plan is saved only on this device. Your location is never saved.")+'</div>';
  var g=function(id){ return document.getElementById(id); };
  g("trN").onchange=function(){ o.n=+this.value; TR.plan=null; save(); };
  g("trStart").onchange=function(){ o.start=this.value; save(); };
  g("trFrom").onchange=function(){ if(hm2m(this.value)!=null) o.from=this.value; save(); };
  g("trTo").onchange=function(){ if(hm2m(this.value)!=null) o.to=this.value; save(); };
  g("trWalk").onchange=function(){ o.walk=+this.value; save(); };
  g("trFood").onchange=function(){ o.food=this.value; save(); }; g("trAdv").onchange=function(){ o.adv=this.checked; save(); };
  g("trHotel").onchange=function(){ var v=this.value; if(!v) o.hotel=null; else if(v==="__here") o.hotel={type:"here"}; else if(v!=="__addr"){ var h=HOTELS.filter(function(x){ return x.k===v; })[0]; if(h) o.hotel={type:"place",k:h.k,ko:h.ko,en:h.en,lat:h.lat,lng:h.lng}; } save(); };
  g("trAddrGo").onclick=addrSearch; g("trAddrQ").onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); addrSearch(); } };
  g("trPlan").onclick=planGo; if(g("trOpenRep")) g("trOpenRep").onclick=function(){ openReport(); };
  [].forEach.call(box.querySelectorAll(".trx"),function(b){ b.onclick=function(){ delItem(b.dataset.k); panelPaint(); }; });
  if(g("trClearAll")) g("trClearAll").onclick=function(){ if(!confirm(T("담은 곳과 짠 일정을 모두 지울까요?","Remove all places and your plan?"))) return; TR.items=[]; TR.plan=null; save(); refresh(); panelPaint(); };   // 모두 비우기 (사장님 10-16)
  dragInit(g("trList")); }
var ADDRQ="";   // 숙소 찾기 — 마지막 검색어 (언어를 바꿔 창을 다시 그릴 때 결과도 다시, 10-18)
function addrPaint(){ var out=document.getElementById("trAddrR"); if(!out||!ADDRQ) return; var q0=document.getElementById("trAddrQ"); if(q0&&!q0.value) q0.value=ADDRQ;
  if(window.KL&&ADDR.length) KL.ensure(ADDR,"item",ADDRQ,function(){ if(document.getElementById("trBox")) addrPaint(); });
    out.innerHTML=ADDR.length?ADDR.map(function(x,i){ return '<div class="tra" data-i="'+i+'"><b>'+esc(KS(L()&&x.name_en?x.name_en:x.name))+'</b><br><span class="d">'+esc(L()&&x.addr_en?x.addr_en:x.addr)+'</span></div>'; }).join(""):'<div class="d">'+T("찾은 곳이 없어요","No results")+'</div>';
    [].forEach.call(out.querySelectorAll(".tra"),function(e){ e.onclick=function(){ var x=ADDR[+e.dataset.i]; TR.opt.hotel={type:"addr",ko:x.name,en:x.name_en||x.name,lat:+x.y,lng:+x.x}; save(); ADDRQ=""; ADDR=[]; panelPaint(); }; }); }
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
  if(!OLD()){ var rt=RT[rtKey(a,b)]; if(typeof rt==="number"&&rt>0) return {mode:"transit",km:d,min:rt,real:1}; }
  if(d<=60) return {mode:"transit",km:d,min:Math.round(10+d*3.2)};
  return {mode:"far",km:d,min:Math.round(40+d/70*60)}; }
function legMin(a,b){ return leg(a,b).min; }
function tourCost(H,arr){ if(!arr.length) return 0; var c=0, p=H||arr[0]; arr.forEach(function(x){ c+=legMin(p,x); p=x; }); if(H) c+=legMin(p,H); return c; }
function nnOrder(H,arr){ var left=arr.slice(), out=[], p=H; if(!p){ var w=left.reduce(function(a,b){ return b.lng<a.lng?b:a; }); out.push(w); left.splice(left.indexOf(w),1); p=w; }
  while(left.length){ var bi=0, bd=1e9; left.forEach(function(x,i){ var d=km(p,x); if(d<bd){ bd=d; bi=i; } }); p=left[bi]; out.push(p); left.splice(bi,1); } return out; }
function twoOpt(H,arr){ var a=arr.slice(), imp=true, it=0;
  while(imp&&it++<50){ imp=false; for(var i=0;i<a.length-1;i++) for(var j=i+1;j<a.length;j++){ var b=a.slice(0,i).concat(a.slice(i,j+1).reverse(),a.slice(j+1)); if(tourCost(H,b)+0.01<tourCost(H,a)){ a=b; imp=true; } } } return a; }
function dayLoad(H,arr){ return arr.reduce(function(s,x){ return s+x.stay; },0)+tourCost(H,nnOrder(H,arr))+(arr.length?60:0); }
// 가까운 곳끼리 같은 날로 (사장님 10-24) — 좌표 k-means(체류시간 가중·여러 번 시작해 가장 싼 것) → 숙소 왕복 포함 비용으로 고른 뒤 improve 로 다듬기
//   · 각도로만 나누면 (옛 방식) 같은 방향이면 멀어도 묶여버린다. 좌표로 묶으면 가까운 곳이 한 날로 모인다
//   · 고정 씨앗 + 여러 번 시작 → 같은 입력이면 같은 결과. 하루 cap 초과·시간 균형은 improve(이동/옮기기)에 맡긴다
function splitDays(H,P,D,cap){ if(OLD()) return splitDaysAngular(H,P,D,cap);
  var n=P.length; if(!n) return []; var tot=P.reduce(function(s,x){ return s+x.stay; },0), avg=tot/D;
  if(n<=D){ var g0=[]; for(var gi=0;gi<D;gi++) g0.push(gi<n?[P[gi]]:[]); return improve(H,g0,cap,avg); }
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
  return improve(H,best,cap,avg); }
// (옛) 숙소 둘레 각도로 줄 세운 뒤 D 덩어리로 (모든 시작점 × DP) — 이동 + 시간초과 벌점 + 날짜 고르기 벌점 최소
function splitDaysAngular(H,P,D,cap){ var n=P.length; if(!n) return []; var C=H||{lat:P.reduce(function(s,x){ return s+x.lat; },0)/n,lng:P.reduce(function(s,x){ return s+x.lng; },0)/n};
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
function sched(H,arr,date,from,mo){ var t=from, p=H, rows=[], lunch=false, dinner=false, viol=0, wait=0, miss=0;
  // 식사 칸 — mo={to,lunch,dinner}(고른 식당). 고른 식당이 있으면 그리로 걸어가 1시간, 다음 장소는 식당에서 출발
  var meal=function(kind,anchor,next){ var r=mo&&mo[kind], lg=null; if(r){ lg=p?leg(p,r):null; if(lg) t+=lg.min; } rows.push({meal:kind,lunch:1,t:t,anchor:anchor,next:next,r:r||null,leg:lg}); t+=60; if(r) p=r; };
  arr.forEach(function(x,i){ var lg=p?leg(p,x):null; if(lg) t+=lg.min; var f=FACT[x.k], dw=date.getUTCDay(), note=[];
    if(f&&f.ev&&f.evd.indexOf(dw)>=0){ var ev=null; f.ev.forEach(function(e){ if(ev==null&&t<=e-10+5) ev=e; }); if(ev!=null&&ev-10>t&&ev-10-t<=90){ wait+=ev-10-t; t=ev-10; } if(ev!=null) note.push([f.evn[0]+" "+m2hm(ev),f.evn[1]+" "+m2hm(ev)]); else miss++; }
    var li=lastIn(f,date); if(li!=null&&t>li){ viol++; note.push(["입장 마감 "+m2hm(li)+" 지남","Last entry "+m2hm(li)+" passed"]); }
    rows.push({x:x,leg:lg,t:t,note:note}); t+=x.stay; p=x;
    if(!lunch&&t>=11*60+45&&t<=14*60+30&&(mo||i<arr.length-1)){ meal("lunch",x,arr[i+1]||null); lunch=true; }   // 보고서에선 마지막 장소 뒤라도 점심 칸
    else if(mo&&!dinner&&t>=17*60+30&&i<arr.length-1){ meal("dinner",x,arr[i+1]); dinner=true; } });
  if(mo&&!dinner&&arr.length){ var dt=Math.max(t,18*60); if(dt+60<=mo.to){ t=dt; meal("dinner",arr[arr.length-1],null); dinner=true; } }   // 저녁 칸이 없으면 하루 끝 전에
  var back=(H&&arr.length)?leg(p,H):null; if(back) t+=back.min;
  return {rows:rows,back:back,end:t,viol:viol,wait:wait,miss:miss}; }
function sc(s){ return s.viol*1000+s.miss*120+s.end+s.wait*0.5; }
function fixTimes(H,arr,date,from){ var cur=arr, cs=sched(H,cur,date,from);
  arr.forEach(function(x){ if(!FACT[x.k]) return; var base=cur.filter(function(y){ return y!==x; });
    for(var i=0;i<=base.length;i++){ var c=base.slice(0,i).concat([x],base.slice(i)), s=sched(H,c,date,from);
      if(sc(s)<sc(cs)-1){ cur=c; cs=s; } } });
  return cur; }
function orderDay(H,arr,date,from){ if(!arr.length) return arr; var o=twoOpt(H,nnOrder(H,arr)), night=o.filter(isNight); o=o.filter(function(x){ return !isNight(x); }).concat(night); return fixTimes(H,o,date,from); }
function closedOn(x,d){ var f=FACT[x.k]; return !!(f&&f.cl&&f.cl.indexOf(d.getUTCDay())>=0); }
function perms(a){ if(a.length<=1) return [a]; var r=[]; a.forEach(function(x,i){ perms(a.slice(0,i).concat(a.slice(i+1))).forEach(function(p){ r.push([x].concat(p)); }); }); return r; }
function compute(H){ var o=TR.opt, D=o.n, from=hm2m(o.from)||570, to=hm2m(o.to)||1200, cap=Math.max(120,to-from), skip=[];
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
  var days=gs.map(function(g,di){ var ord=orderDay(H,g,dates[di],from), s=sched(H,ord,dates[di],from);
    return {date:dates[di].toISOString().slice(0,10),stops:ord.map(function(x){ return x.k; }),end:s.end}; });
  var pool={}; P.forEach(function(x){ pool[x.k]=x; });
  return {v:1,at:Date.now(),from:from,to:to,hotel:o.hotel&&o.hotel.type!=="here"?o.hotel:(o.hotel?{type:"here"}:null),days:days,pool:pool,skip:skip.map(function(x){ return x.k; }),ai:null}; }
function hotelPos(cb){ var h=TR.opt.hotel; if(!h) return cb(null); if(h.type!=="here") return cb({k:"__hotel",ko:h.ko,en:h.en,lat:+h.lat,lng:+h.lng,hotel:1});
  var use=function(p){ cb(p?{k:"__hotel",ko:"현재 위치",en:"Current location",lat:p[0],lng:p[1],hotel:1,here:1}:null); };
  if(window.ME&&ME.pos) use(ME.pos); else myPos().then(use); }

// ── 일정 짜기 ──
function planGo(){ if(!hasPass()){ openPricing(); return; } if(!TR.items.length) return;
  var b=document.getElementById("trPlan"); if(b){ b.disabled=true; b.textContent=T("짜는 중…","Planning…"); }
  hotelPos(function(H){ setTimeout(function(){ var pl;
    try{ pl=compute(H); }catch(e){ try{ console.error(e); }catch(x){} if(b){ b.disabled=false; b.textContent=T("🗓 일정 짜기","🗓 Plan my trip"); } return; }
    pl.H=H&&!H.here?H:null; TR.plan=pl; save();
    var shown=false, show=function(){ if(shown) return; shown=true; try{ ntap("_trip","trip_plan"); }catch(e){} openReport(H); };
    if(OLD()||typeof fetch!=="function"){ show(); return; }
    // 실제 대중교통 시간 — 6초 안에 오면 그걸로 보여주고, 늦으면 직선거리로 먼저 보여준 뒤 오는 대로 그 자리에서 다듬는다 (recsFetch·aiFetch 처럼)
    var to=setTimeout(show,6000);
    realTimesFetch(pl,H,function(){ reorderWithReal(pl,H); save(); if(shown){ if(document.getElementById("trRep")) repPaint(); } else { clearTimeout(to); show(); } });
  },30); }); }
// 실제 대중교통 시간이 온 뒤 — 날짜 묶음은 그대로, 그날 안 순서만 실제 시간표로 다시 (2-opt 가 실제 시간을 본다)
function reorderWithReal(pl,H){ if(!pl||!pl.days) return; var from=pl.from;
  pl.days.forEach(function(d){ var dt=new Date(d.date+"T00:00:00Z"), arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean); if(!arr.length) return;
    var ord=orderDay(H,arr,dt,from), s=sched(H,ord,dt,from); d.stops=ord.map(function(x){ return x.k; }); d.end=s.end; }); }
// 일정에 실제로 나오는 구간만(날짜 안 — 날짜끼리는 직선거리 그대로) 허브 /ntimes 로 한 번에. 짧은 걷기 구간은 빼고, 캐시(sessionStorage)는 다시 안 묻는다. 허브가 ODsay 하루 한도를 지킨다
function realTimesFetch(pl,H,cb){ var pairs=[], keys=[], seen={};
  var add=function(a,b){ if(!a||!b||!isFinite(a.lat)||!isFinite(b.lat)) return; if(km(a,b)<=walkKm()) return; var kk=rtKey(a,b); if(seen[kk]) return; seen[kk]=1;
    if(typeof RT[kk]==="number") return; var sv=null; try{ sv=sessionStorage.getItem("nt:"+kk); }catch(e){} if(sv!=null&&sv!==""){ RT[kk]=+sv; return; }
    keys.push(kk); pairs.push([+a.lat,+a.lng,+b.lat,+b.lng]); };
  pl.days.forEach(function(d){ var arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), set=(H?[H]:[]).concat(arr);
    for(var i=0;i<set.length;i++) for(var j=i+1;j<set.length;j++) add(set[i],set[j]); });
  if(!pairs.length){ cb(); return; }
  pairs=pairs.slice(0,60); keys=keys.slice(0,60);   // 플랜마다 구간 상한(허브도 하루 한도로 또 막는다)
  var ctl=("AbortController" in window)?new AbortController():null, t=setTimeout(function(){ if(ctl) try{ ctl.abort(); }catch(e){} },7000);
  fetch(HUB+"/ntimes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pairs:pairs,mode:"transit"}),signal:ctl?ctl.signal:undefined})
    .then(function(r){ return r.json(); }).then(function(j){ clearTimeout(t); var ts=(j&&j.times)||[], used=0;
      keys.forEach(function(kk,i){ var m=ts[i]&&ts[i].min; if(typeof m==="number"&&m>0){ RT[kk]=m; used++; try{ sessionStorage.setItem("nt:"+kk,String(m)); }catch(e){} } });
      window.__trRtUsed=used; window.__trRtAsk=keys.length; cb(); })
    .catch(function(e){ clearTimeout(t); window.__trRtErr=String(e); cb(); }); }
// 이 일정이 실제 대중교통 시간을 쓰는 구간이 하나라도 있나 (아래 안내 문구 고르기용)
function planUsesReal(pl,H){ if(OLD()||!pl||!pl.days) return false; var any=false;
  pl.days.forEach(function(d){ var arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), p=H;
    arr.forEach(function(x){ if(p&&km(p,x)>walkKm()&&typeof RT[rtKey(p,x)]==="number") any=true; p=x; });
    if(H&&arr.length&&km(p,H)>walkKm()&&typeof RT[rtKey(p,H)]==="number") any=true; }); return any; }
function planHotel(cb){ var pl=TR.plan; if(!pl||!pl.hotel) return cb(null); if(pl.hotel.type==="here") return hotelPos(cb); cb({k:"__hotel",ko:pl.hotel.ko,en:pl.hotel.en,lat:+pl.hotel.lat,lng:+pl.hotel.lng,hotel:1}); }
function aiFetch(){ var pl=TR.plan; if(!pl) return; var hn=pl.hotel&&pl.hotel.type!=="here"?pl.hotel.ko:"";
  var H0=pl.H||null, body={h:hn,d:pl.days.map(function(d){ var dt=new Date(d.date+"T00:00:00Z"), s=sched(H0,d.stops.map(function(k){ return pl.pool[k]; }),dt,pl.from);
    return {w:DOW_EN[dt.getUTCDay()],s:s.rows.filter(function(r){ return !r.lunch; }).map(function(r){ return {k:r.x.k,ko:r.x.ko,en:r.x.en,t:m2hm(r.t),m:r.x.stay}; })}; }).filter(function(d){ return d.s.length; }),lang:LANG};   // lang: 허브가 그 언어 설명을 줄 수 있게 (10-18 — 지금 허브는 ko/en)
  var at=pl.at; var ap=document.getElementById("trAiS"); if(ap) ap.hidden=false;
  fetch(HUB+"/ntrip",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){ return r.json(); }).then(function(j){
    window.__trAiRes=j&&(j.ok?"ok":String(j.err)); if(!TR.plan||TR.plan.at!==at) return; if(j&&j.ok){ var k=0, days=pl.days.map(function(d){ return d.stops.length?(j.days||[])[k++]||null:null; }); TR.plan.ai={days:days,tips:j.tips||{}}; save(); } else if(!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1};
    if(document.getElementById("trRep")) repPaint(); }).catch(function(e){ window.__trAiRes="E "+e; if(TR.plan&&TR.plan.at===at&&!(TR.plan.ai&&TR.plan.ai.days)) TR.plan.ai={fail:1}; var a=document.getElementById("trAiS"); if(a) a.hidden=true; }); }

// ── 보고서 ──
var REPH=null, REPME=null, GEO=null, GEOST="";   // REPME = 그날 1번째 구간 출발점 = 「지금 내 위치」(숙소 아님 — 그날 숙소에서 안 잘 수도, 사장님 10-20) · GEO 는 이 화면 메모리에만(저장·전송 없음)
// 일·중 화면인데 AI 설명에 그 언어 칸이 없으면(다른 언어로 짠 일정) 그 언어로 한 번 더 받는다 — 허브는 같은 본문을 캐시 (10-18)
function aiLangMiss(ai){ if(!ai||!ai.days||!/^(ja|zhs|zht|es)$/.test(LANG)) return false; var d=ai.days.filter(Boolean)[0]; return !!d&&!d[LANG]; }
function openReport(H){ if(!TR.plan) return; sheetClose("trBox"); sheet("trRep"); GEOST=""; GEO=null; /* 열 때마다 위치를 한 번 새로 */ var aiGo=function(){ if(TR.plan&&(!TR.plan.ai||aiLangMiss(TR.plan.ai))&&hasPass()) aiFetch(); };
  if(H!==undefined){ REPH=H; repPaint(); aiGo(); } else planHotel(function(h){ REPH=h; repPaint(); aiGo(); }); }
function legTxt(lg){ if(!lg) return ""; var d=lg.km<1?Math.round(lg.km*1000)+" m":lg.km.toFixed(1)+" km";
  if(lg.mode==="walk") return T("🚶 걸어서 약 "+lg.min+"분","🚶 ~"+lg.min+" min walk")+" · "+d;
  if(lg.mode==="transit") return T("🚇 대중교통 약 ","🚇 Transit ~")+durTxt(lg.min)+(lg.real?" ✓":"")+" · "+d;
  return T("🚄 장거리 이동 약 ","🚄 Long trip ~")+durTxt(lg.min)+T(" (기차·버스)"," (train/bus)")+" · "+Math.round(lg.km)+" km"; }
function repPaint(){ var box=document.querySelector("#trRep .trin"), pl=TR.plan; if(!box||!pl) return; var H=REPH, ai=pl.ai||{}, tips=ai.tips||{};
  var mp=(window.ME&&ME.pos)||GEO; REPME=mp?{k:"__me",ko:"현재 위치",en:"Current location",lat:+mp[0],lng:+mp[1],me:1}:null;
  if(!mp&&!GEOST&&typeof myPos==="function"){ GEOST="ask"; myPos().then(function(q){ GEOST=q?"ok":"fail"; GEO=q||null; if(q&&document.getElementById("trRep")) repPaint(); else { [].forEach.call(document.querySelectorAll("#trRep .tnost"),function(e){ e.hidden=false; }); } }); }   // 폰 안에서만 한 번 묻는다
  var hn=pl.hotel?(pl.hotel.type==="here"?T("현재 위치","Current location"):nm(pl.hotel)):"";
  var h='<div class="trtop" data-html2canvas-ignore><b>'+T("🛒 내 여행 일정","🛒 My trip plan")+'</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.close(\'trRep\')">✕</button></div>'
    +'<div class="trbar" data-html2canvas-ignore><button type="button" class="trbtn" id="trNext">'+T("➡ 다음 갈 곳","➡ Next stop")+'</button><button type="button" class="trbtn" id="trPdf">'+T("📄 PDF 받기","📄 Get PDF")+'</button><button type="button" class="trbtn" id="trShare">'+T("🔗 공유","🔗 Share")+'</button><button type="button" class="trbtn" id="trEdit">'+T("✏ 고치기","✏ Edit")+'</button><button type="button" class="trbtn ib" id="trInfo" aria-label="info">ⓘ</button></div>'
    +'<div id="trNextBox" data-html2canvas-ignore></div>'
    +'<div class="d" id="trAiS" data-html2canvas-ignore'+(pl.ai?" hidden":"")+'>'+T("설명을 쓰는 중… (없어도 일정은 그대로 쓸 수 있어요)","Writing notes… (the plan works without them)")+'</div>'
    +(pl.skip&&pl.skip.length?'<div class="d">'+T("일정에서 뺀 곳(숙소·교통시설): ","Skipped (lodging/transport): ")+esc(pl.skip.map(function(k){ var it=TR.items.filter(function(x){ return x.k===k; })[0]; return it?nm(it):k; }).join(", "))+'</div>':"");
  pl.days.forEach(function(d,di){ var dt=new Date(d.date+"T00:00:00Z"), arr=d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean), s=sched(H,arr,dt,pl.from,mealsOf(di)), a=ai.days&&ai.days[di];
    h+='<div class="tday" data-d="'+di+'"><div class="tdh"><span>'+T((di+1)+"일차",'Day '+(di+1))+'</span> · '+esc(dateTxt(dt))+'<small>'+T("투어맵","Tour Map")+'</small></div>';
    if(!arr.length){ h+='<div class="d" style="padding:6px 0">'+T("자유 일정","Free day")+'</div></div>'; return; }
    if(aiTx(a)) h+='<div class="tai">'+esc(aiTx(a))+'</div>';
    h+='<div class="tmap" id="tmap'+di+'"></div><div class="trows">';
    // 1번째 장소까지 — 늘 「지금 내 위치」에서(숙소는 날짜 나누기·순서·귀가에만). 모양은 장소 사이 구간과 같게, 실제 경로(ODsay)는 누를 때만, PDF 엔 안 찍음 (10-20)
    var f0=s.rows[0];
    if(f0&&f0.x){ if(REPME){ var lg0=leg(REPME,f0.x);
        h+='<div class="trw h" data-html2canvas-ignore><span class="tt">'+m2hm(Math.max(0,f0.t-lg0.min))+'</span><span class="tp">📍 '+T5({ko:"지금 내 위치 출발",en:"Start from where I am now",ja:"今いる場所から出発",zhs:"从我现在的位置出发",zht:"從我現在的位置出發",es:"Salir desde donde estoy ahora"})+'</span></div>'
          +'<div class="tlg" data-html2canvas-ignore data-a="__me" data-b="'+esc(f0.x.k)+'" data-d="'+di+'">'+legTxt(lg0)+(lg0.mode!=="walk"?' <a href="#" class="tlgo">· '+T("실제 경로 보기","See real routes")+'</a>':'')+'<div class="tods"></div></div>'; }
      else h+='<div class="d tnost" data-html2canvas-ignore'+(GEOST==="fail"?"":" hidden")+'>'+T5({ko:"위치를 켜면 1번째 장소까지 가는 길이 보입니다",en:"Turn on location to see the way to your first stop",ja:"位置情報をオンにすると1番目の場所までの行き方が表示されます",zhs:"开启定位后，会显示前往第1个地点的路线",zht:"開啟定位後，會顯示前往第1個地點的路線",es:"Activa la ubicación para ver cómo llegar a tu primera parada"})+'</div>'; }
    var n=0, prevK=REPME&&f0&&f0.x?"__me":null;
    s.rows.forEach(function(r,ri){ if(r.meal){ var mk=di+":"+r.meal, ml=r.meal==="lunch"?T("점심 (1시간)","Lunch (1 h)"):T("저녁 (1시간)","Dinner (1 h)");
        if(r.r){ if(r.leg) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="rs:'+mk+'" data-d="'+di+'">'+legTxt(r.leg)+'<div class="tods"></div></div>';
          h+='<div class="trw l"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">🍽 '+ml+'<span class="teat on">'+eatLine(r.r)+'<span class="teact">'+eatLinks(r.r)+' <button type="button" class="tebtn" data-x="'+mk+'">'+T("바꾸기","Change")+'</button></span></span></span></div>'; prevK="rs:"+mk; }
        else h+='<div class="trw l"><span class="tt">'+m2hm(r.t)+'</span><span class="tp">🍽 '+ml+'<span class="teat" id="te_'+mk.replace(":","_")+'" data-k="'+mk+'">'+eatList(mk,r.anchor)+'</span></span></div>';
        return; }
      if(r.leg&&prevK&&ri>0) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="'+esc(r.x.k)+'" data-d="'+di+'">'+legTxt(r.leg)+(r.leg.mode!=="walk"?' <a href="#" class="tlgo">· '+T("실제 경로 보기","See real routes")+'</a>':'')+'<div class="tods"></div></div>';
      n++; var tip=tips[r.x.k], memo=r.note.map(function(q){ return T(q[0],q[1]); });
      if(needCheck(r.x)) memo.push(T("운영 시간·휴무일 확인 필요","Check opening hours/closures"));
      if(isNight(r.x)) memo.push(T("밤 추천","Best at night"));
      h+='<div class="trw tpk" data-k="'+esc(r.x.k)+'"><span class="tt">'+m2hm(r.t)+'</span><span class="tp"><b class="tno">'+n+'</b> <b>'+esc(nm(r.x))+'</b> <i>'+durTxt(r.x.stay)+'</i>'
        +(memo.length?'<span class="tmemo">'+esc(memo.join(" · "))+'</span>':"")+(aiTx(tip)?'<span class="ttip">💡 '+esc(aiTx(tip))+'</span>':"")+'</span></div>';
      prevK=r.x.k; });
    if(s.back) h+='<div class="tlg" data-a="'+esc(prevK)+'" data-b="__hotel" data-d="'+di+'">'+legTxt(s.back)+(s.back.mode!=="walk"?' <a href="#" class="tlgo">· '+T("실제 경로 보기","See real routes")+'</a>':'')+'<div class="tods"></div></div><div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">🏨 '+T("숙소 도착","Back to lodging")+'</span></div>';
    else h+='<div class="trw h"><span class="tt">'+m2hm(s.end)+'</span><span class="tp">'+T("일정 끝","End of day")+'</span></div>';
    if(s.end>pl.to) h+='<div class="tmemo" style="margin-top:4px">⚠ '+T("하루 끝 시각("+m2hm(pl.to)+")을 넘어요 — 장소를 빼거나 날짜를 늘려 보세요","Runs past your end time ("+m2hm(pl.to)+") — remove a place or add a day")+'</div>';
    h+='</div></div>'; });
  h+='<div class="d" style="margin:10px 2px">'+(planUsesReal(pl,H)
    ? T5({ko:"이동 시간은 가능한 구간은 실제 대중교통 기준입니다. 일부 구간은 직선거리 어림이에요. 「실제 경로 보기」로 자세한 길을 볼 수 있어요.",
          en:"Travel times use real public transit where available; some legs are straight-line estimates. Tap “See real routes” for details.",
          ja:"移動時間は可能な区間は実際の公共交通機関に基づきます。一部は直線距離の目安です。「実際の経路を見る」で詳しく確認できます。",
          zhs:"交通时间尽可能采用实际公共交通，部分路段为直线距离估算。点按「查看实际路线」查看详情。",
          zht:"交通時間盡可能採用實際大眾運輸，部分路段為直線距離估算。點按「查看實際路線」查看詳情。",
          es:"Los tiempos usan transporte público real cuando es posible; algunos tramos son estimaciones en línea recta. Toca “Ver rutas reales” para más detalles."})
    : T("이동 시간은 직선거리 어림입니다. 「실제 경로 보기」를 누르면 그 구간만 대중교통을 찾아요.","Travel times are straight-line estimates. Tap “See real routes” to look up transit for that leg."))+'</div>';
  box.innerHTML=h; var g=function(id){ return document.getElementById(id); };
  g("trNext").onclick=nextStop; g("trPdf").onclick=pdfGo; g("trShare").onclick=shareGo; g("trEdit").onclick=function(){ sheetClose("trRep"); openPanel(); };
  g("trInfo").onclick=function(){ tPop(function(){ return '<b>ⓘ</b><div style="margin-top:6px;line-height:1.6">'+T("· PDF는 휴대폰 「다운로드」에 저장돼요 — 안드로이드는 파일 앱에서 PDF를 길게 눌러 「홈 화면에 추가」하면 바로 열 수 있어요.<br>· 궁궐 휴무(월: 창덕궁·창경궁·덕수궁·숭례문 / 화: 경복궁·종묘)는 궁능유적본부 안내 기준 — 휴무일이 공휴일이면 열고 다음 평일에 쉽니다.<br>· 다른 곳의 운영 시간은 현장·공식 안내를 확인하세요.","· The PDF is saved to Downloads — on Android, long-press it in the Files app and choose “Add to Home screen”.<br>· Palace closures (Mon: Changdeokgung, Changgyeonggung, Deoksugung, Sungnyemun / Tue: Gyeongbokgung, Jongmyo) follow the official Royal Palaces notice — if the closing day is a public holiday they open and close the next weekday.<br>· Check other opening hours on site or official pages.")+'</div>'; }); };
  pl.days.forEach(function(d,di){ var el=g("tmap"+di); if(!el) return; var s=sched(H,d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean),new Date(d.date+"T00:00:00Z"),pl.from,mealsOf(di));
    dayMap(el,H,s.rows.filter(function(r){ return r.x||r.r; }).map(function(r){ return r.x?r.x:Object.assign({eat:1},r.r); })); });
  recsFetch(); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("#trRep .tlgo"); if(!a) return; e.preventDefault(); legRoute(a.closest(".tlg")); },true);
// 일정에서 장소를 누르면 그곳이 🗣 통역 대상 — 전역 _ntK(통역이 보는 「지금 장소」)를 그 장소로, 명소 목록에 없는 곳(카카오 등)은 _itPick 이름으로 (10-20)
function pickPlace(row){ var pl=TR.plan, k=row&&row.dataset.k, it=k&&pl&&pl.pool[k]; if(!it) return;
  window._itPick={k:k,ko:it.ko||"",en:it.en||it.ko||"",ja:it.ja||"",zhs:it.zhs||"",zht:it.zht||"",es:it.es||""}; window._ntK=k; window._ntEl=null;
  [].forEach.call(document.querySelectorAll("#trRep .trw.tpk.on"),function(e){ e.classList.remove("on"); }); row.classList.add("on");
  try{ if(window.ITP&&document.getElementById("itB")) ITP.refresh(); }catch(x){} }
document.addEventListener("click",function(e){ var r=e.target.closest&&e.target.closest("#trRep .trw.tpk"); if(!r||(e.target.closest&&e.target.closest("a,button"))) return; pickPlace(r); },true);
// 그 구간만 ODsay — 기존 odsBox 를 잠깐 빌린 키로 부른다(하루 한도 아낌, 같은 구간은 sessionStorage 캐시)
function ptK(k){ var pl=TR.plan; if(k==="__hotel") return REPH; if(k==="__me") return REPME; if(/^rs:/.test(k)) return pl.meals&&pl.meals[k.slice(3)]; return pl.pool[k]; }
function legRoute(row){ var pl=TR.plan, A=row.dataset.a, B=row.dataset.b, pa=ptK(A), pb=ptK(B); if(!pa||!pb) return;
  var box=row.querySelector(".tods"), old=document.getElementById("ods"), ka="__t_"+(/^__(hotel|me)$/.test(A)?"h"+(+pa.lat).toFixed(3)+"_"+(+pa.lng).toFixed(3):A), kb="__t_"+(/^__(hotel|me)$/.test(B)?"h"+(+pb.lat).toFixed(3)+"_"+(+pb.lng).toFixed(3):B);
  if(old) old.id="ods_tmp"; box.id="ods"; PLACES[ka]={ko:pa.ko,en:pa.en,lat:+pa.lat,lng:+pa.lng}; PLACES[kb]={ko:pb.ko,en:pb.en,lat:+pb.lat,lng:+pb.lng};
  try{ odsBox(ka,kb); }catch(x){} delete PLACES[ka]; delete PLACES[kb]; box.id=""; if(old) old.id="ods";
  try{ var nk=B==="__hotel"?A:B; if(/^[A-Za-z0-9_-]+$/.test(nk)) ntap(nk,"route"); }catch(x){} }
// 그날 동선 약도 — 그날 장소를 다 덮는 가장 자세한 약도를 잘라 번호+선 (캔버스 → 그림, PDF 에도 그대로)
function coverMap(pts){ var best=null, bd=-1, ba=1e9; for(var id in CITY){ var q=CITY[id].bb; if(!q||!CITY[id].img) continue; if(!pts.every(function(p){ return p.lat>=q[0]&&p.lat<=q[2]&&p.lng>=q[1]&&p.lng<=q[3]; })) continue;
    var d=0, x=id; while(CITY[x]&&d<20){ x=CITY[x].parent; d++; } var ar=(q[2]-q[0])*(q[3]-q[1]); if(d>bd||(d===bd&&ar<ba)){ bd=d; ba=ar; best=id; } } return best||"kr"; }
var IMGC={};
function imgLoad(src){ return IMGC[src]||(IMGC[src]=new Promise(function(ok,no){ var im=new Image(); im.onload=function(){ ok(im); }; im.onerror=no; im.src=src; })); }
function dayMap(el,H,arr){ var pts=arr.slice(); if(H) pts.push(H); var id=coverMap(pts), c=id==="kr"?{img:ROOT_IMG,aspect:1}:CITY[id], as=c.aspect||1;
  var fr=function(p){ var f=null; if(id!=="kr"&&c.spots&&c.spots[p.k]){ var b=c.spots[p.k]; f=[(b[0]+b[2])/2,(b[1]+b[3])/2]; } return f||meGeoFrac(id==="kr"?NAVI_ROOT:id,p.lat,p.lng); };
  var go=function(){ var F=arr.map(fr), FH=H?fr(H):null; if(F.some(function(f){ return !f; })) { el.innerHTML=""; return; }
    var all=F.concat(FH?[FH]:[]), x0=1, y0=1, x1=0, y1=0; all.forEach(function(f){ x0=Math.min(x0,f[0]); x1=Math.max(x1,f[0]); y0=Math.min(y0,f[1]); y1=Math.max(y1,f[1]); });
    // 그림 비율(as:1)로 보고, 4:3 상자에 넉넉히
    var X0=x0*as, X1=x1*as, cx=(X0+X1)/2, cy=(y0+y1)/2, wv=Math.max((X1-X0)*1.35,0.12*as,(y1-y0)*1.35*4/3,0.09), hv=wv*3/4;
    if(wv>as){ wv=as; hv=wv*3/4; } if(hv>1){ hv=1; wv=Math.min(as,hv*4/3); }
    var L0=Math.max(0,Math.min(as-wv,cx-wv/2)), T0=Math.max(0,Math.min(1-hv,cy-hv/2));
    imgLoad(c.img).then(function(im){ var W=900, Hh=Math.round(W*hv/wv), cv=document.createElement("canvas"); cv.width=W; cv.height=Hh; var g=cv.getContext("2d");
      var sx=im.naturalWidth/as, sy=im.naturalHeight; g.drawImage(im,L0*sx,T0*sy,wv*sx,hv*sy,0,0,W,Hh);
      var P=function(f){ return [(f[0]*as-L0)/wv*W,(f[1]-T0)/hv*Hh]; }, seq=F.map(P), hp=FH?P(FH):null, R=Math.max(13,W*0.022);
      var line=(hp?[hp]:[]).concat(seq,hp?[hp]:[]);
      g.lineJoin="round"; g.lineCap="round"; g.strokeStyle="rgba(255,255,255,.9)"; g.lineWidth=R*0.75; g.beginPath(); line.forEach(function(p,i){ if(i) g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]); }); g.stroke();
      g.strokeStyle="#e8590c"; g.lineWidth=R*0.35; g.setLineDash([R*0.9,R*0.6]); g.stroke(); g.setLineDash([]);
      if(hp){ g.fillStyle="#1f4fa3"; g.strokeStyle="#fff"; g.lineWidth=3; g.beginPath(); g.rect(hp[0]-R,hp[1]-R,2*R,2*R); g.fill(); g.stroke(); g.fillStyle="#fff"; g.font="900 "+Math.round(R*1.1)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("H",hp[0],hp[1]+1); }
      // 식당(🍴)을 먼저, 번호를 위에 — 식당이 장소 바로 옆이면 비스듬히 비켜 그린다
      var stp=seq.filter(function(p,i){ return !arr[i].eat; });
      seq.forEach(function(p,i){ if(!arr[i].eat) return; var q=[p[0],p[1]]; if(stp.some(function(s){ return Math.hypot(s[0]-q[0],s[1]-q[1])<R*1.8; })){ q[0]+=R*1.35; q[1]-=R*1.35; }
        g.fillStyle="#2f9e44"; g.strokeStyle="#fff"; g.lineWidth=R*0.22; g.beginPath(); g.arc(q[0],q[1],R*0.8,0,7); g.fill(); g.stroke(); g.fillStyle="#fff"; g.font="900 "+Math.round(R*0.9)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("🍴",q[0],q[1]+1); });
      var no=0; seq.forEach(function(p,i){ if(arr[i].eat) return; g.fillStyle="#fff"; g.strokeStyle="#e8590c"; g.lineWidth=R*0.28; g.beginPath(); g.arc(p[0],p[1],R,0,7); g.fill(); g.stroke();
        g.fillStyle="#c2410c"; g.font="900 "+Math.round(R*1.15)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(++no),p[0],p[1]+1); });
      var url=""; try{ url=cv.toDataURL("image/jpeg",0.85); }catch(e){} el.innerHTML=url?'<img alt="" src="'+url+'">':""; if(!url) el.appendChild(cv); }).catch(function(){ el.innerHTML=""; }); };
  if(id==="kr"||c.spots) go(); else mapLoad(id).then(go,go); }
// 다음 갈 곳 — 오늘이 여행 날이면 지금 시각 다음 장소, 아니면 첫날 첫 장소 → 길찾기·K.Ride (기존 linksTo)
function nextStop(){ var pl=TR.plan, box=document.getElementById("trNextBox"); if(!pl||!box) return; var today=kstToday(0), now=new Date(Date.now()+9*3600e3), nm0=now.getUTCHours()*60+now.getUTCMinutes(), pick=null;
  pl.days.forEach(function(d){ if(pick||d.date!==today) return; var s=sched(REPH,d.stops.map(function(k){ return pl.pool[k]; }),new Date(d.date+"T00:00:00Z"),pl.from); s.rows.forEach(function(r){ if(!pick&&!r.lunch&&r.t+r.x.stay>nm0) pick=r.x; }); });
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
    +(c.srcs&&c.srcs.length?'<span class="tesrc">📖 '+(c.url&&/^https:\/\//.test(c.url)?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener">':'')+esc(c.srcs.map(function(q){ return LP(q); }).join(" · "))+(c.url?'</a>':'')+'</span>':'')
    +(c.note?'<span class="tmemo">'+esc(c.note)+'</span>':'')+(c.src==="ad"&&LD(c)?'<span class="ttip">'+esc(LD(c))+'</span>':''); }
function eatLinks(c){ var t=String(c.tel||"").replace(/\s/g,""), tl=t?'<a class="tel" href="tel:'+esc(telIntl(t))+'">📞 '+esc(L()?telIntl(t).replace("-"," "):t)+'</a>':"";
  return tl+linksTo(c.ko,c.lat,c.lng,c.ko,c.addr); }
var EATC={};
function eatList(mk,anchor){ var pl=TR.plan, rc=pl.recs&&pl.recs[mk];
  if(!rc||(anchor&&rc.ak!==anchor.k)) return '<span class="d">'+T("근처 식당 찾는 중…","Finding places to eat nearby…")+'</span>';
  var cs=eatPick(mk)||[]; EATC[mk]=cs;
  if(!cs.length) return '<span class="d">'+T("조건에 맞는 근처 식당을 못 찾았어요","No matching places nearby")+'</span>';
  return '<span class="tehd">'+T("🍽 근처 식당 추천","🍽 Places to eat nearby")+'</span>'+cs.map(function(c,i){ return '<span class="tec">'+eatLine(c)+' <button type="button" class="tebtn" data-k="'+mk+'" data-i="'+i+'">'+T("넣기","Pick")+'</button></span>'; }).join(""); }
var EATQ={};
function recsFetch(){ var pl=TR.plan; if(!pl) return; pl.recs=pl.recs||{}; var H=REPH;
  eatsLoad().then(function(){ if(TR.plan!==pl) return; pl.days.forEach(function(d,di){ var s=sched(H,d.stops.map(function(k){ return pl.pool[k]; }).filter(Boolean),new Date(d.date+"T00:00:00Z"),pl.from,mealsOf(di));
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
function busy(id,on,txt){ var b=document.getElementById(id); if(!b) return; if(on){ b.dataset.t=b.textContent; b.textContent=txt; b.disabled=true; } else { b.textContent=b.dataset.t||b.textContent; b.disabled=false; } }
// A4 PDF 문서를 만든다 (받기·보내기 공용) — {doc,n,name}
function pdfBuild(){ return Promise.all([shotDays(),lib(LIBS.pdf)]).then(function(r){ var cvs=r[0], J=window.jspdf.jsPDF, doc=new J({orientation:"p",unit:"mm",format:"a4"}), PW=210, PH=297, M=10;
  cvs.forEach(function(cv,i){ if(i) doc.addPage(); var w=PW-2*M, h=cv.height*w/cv.width; if(h>PH-2*M){ h=PH-2*M; w=cv.width*h/cv.height; }
    doc.addImage(cv.toDataURL("image/jpeg",0.9),"JPEG",(PW-w)/2,M,w,h); });
  return {doc:doc,n:cvs.length,name:"my-trip-"+(TR.plan.days[0]&&TR.plan.days[0].date||"plan")+".pdf"}; }); }
function pdfGo(){ busy("trPdf",1,T("만드는 중…","Making…"));
  pdfBuild().then(function(o){ o.doc.save(o.name); window.__trPdfOk=o.n; try{ ntap("_trip","trip_pdf"); }catch(e){} busy("trPdf",0); })
    .catch(function(e){ window.__trPdfErr=String(e); busy("trPdf",0); alert(T("PDF를 만들지 못했어요. 잠시 뒤 다시 해 주세요.","Could not make the PDF. Please try again.")); }); }
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
function shareData(){ var pl=TR.plan, r=function(n){ return Math.round(n*1e5)/1e5; };
  return {v:1,s:pl.days[0]&&pl.days[0].date,f:m2hm(pl.from),t:m2hm(pl.to),w:TR.opt.walk,h:pl.hotel&&pl.hotel.type!=="here"?[pl.hotel.ko,pl.hotel.en,r(pl.hotel.lat),r(pl.hotel.lng)]:null,
    d:pl.days.map(function(d){ return d.stops.map(function(k){ var x=pl.pool[k]; return x.pin?[x.ko,x.en,r(x.lat),r(x.lng)]:k; }); })}; }
// 일정을 # 뒤에 압축해 담은 공유 링크(읽기 전용으로 앱에서 열린다) — 링크·메일·가이드 보내기 공용
function tripUrl(){ return zip(JSON.stringify(shareData())).then(function(z){ return location.origin+location.pathname.replace(/index\.html$/,"")+"?trip=1#tp="+z; }); }
var SENDGUIDE6={ko:"가이드에게 보내기",en:"Send to a guide",ja:"ガイドに送る",zhs:"发送给向导",zht:"發送給嚮導",es:"Enviar a un guía"};
function shareGo(){ var box=document.getElementById("trNextBox");
  box.innerHTML='<div class="item"><div class="t">'+T("🔗 공유","🔗 Share")+'</div>'
    +'<div class="shgrid" style="margin-top:8px"><button type="button" id="trShL">🔗 '+T("링크","Link")+'</button><button type="button" id="trShI">🖼 '+T("그림","Image")+'</button><button type="button" id="trShP">📄 '+T("PDF 보내기","Send PDF")+'</button><button type="button" id="trShMail">✉ '+T("메일","Email")+'</button></div>'
    +'<button type="button" class="trgdbtn" id="trShGd"><img class="miic trgdic" src="img/menu/mi_guideperson.png" alt="">'+esc(LG6(SENDGUIDE6))+'</button>'
    +'<div class="shmsg" id="trShM"></div></div>';
  document.getElementById("trShL").onclick=function(){ tripUrl().then(function(u){ var m=document.getElementById("trShM");
    if(navigator.share) navigator.share({title:T("내 여행 일정","My trip plan"),url:u}).catch(function(){});
    else { try{ navigator.clipboard.writeText(u); m.textContent=T("링크를 복사했어요","Link copied"); }catch(e){ m.textContent=u; } } window.__trShareUrl=u; try{ ntap("_trip","share"); }catch(e){} }); };
  // ✉ 메일 — 데스크톱·공유 시트 없을 때도 메일 앱으로 일정 링크를 보낼 수 있게 (사장님 10-24)
  document.getElementById("trShMail").onclick=function(){ var m=document.getElementById("trShM"); m.textContent=T("메일 여는 중…","Opening email…"); tripUrl().then(function(u){ m.textContent=""; window.__trShareUrl=u;
    var subj=encodeURIComponent(T("내 여행 일정","My trip plan")), body=encodeURIComponent(T("여행 일정을 공유합니다:","Here is my trip plan:")+"\n"+u); try{ ntap("_trip","share_mail"); }catch(e){} location.href="mailto:?subject="+subj+"&body="+body; }); };
  document.getElementById("trShP").onclick=pdfShareGo;
  document.getElementById("trShGd").onclick=gdOpen;
  document.getElementById("trShI").onclick=function(){ var m=document.getElementById("trShM"); m.textContent=T("그림 만드는 중…","Making image…");
    shotDays().then(function(cvs){ var W=Math.max.apply(null,cvs.map(function(c){ return c.width; })), Hh=cvs.reduce(function(s,c){ return s+c.height+20; },0), cv=document.createElement("canvas"); cv.width=W; cv.height=Hh;
      var g=cv.getContext("2d"), y=0; g.fillStyle="#fff"; g.fillRect(0,0,W,Hh); cvs.forEach(function(c){ g.drawImage(c,0,y); y+=c.height+20; });
      cv.toBlob(function(b){ var f=new File([b],"my-trip.png",{type:"image/png"}); m.textContent="";
        if(navigator.canShare&&navigator.canShare({files:[f]})) navigator.share({files:[f],title:T("내 여행 일정","My trip plan")}).catch(function(){});
        else { var a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="my-trip.png"; document.body.appendChild(a); a.click(); a.remove(); } },"image/png"); })
      .catch(function(){ m.textContent=T("그림을 만들지 못했어요","Could not make the image"); }); }; }
function fromShare(z){ return unzip(z).then(function(s){ var o=JSON.parse(s); if(!o||o.v!==1||!Array.isArray(o.d)) throw 0;
  return Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){
    var items=[], days=[], pool={};
    o.d.slice(0,7).forEach(function(arr){ var ks=[]; (arr||[]).slice(0,MAXN).forEach(function(x){ var it=typeof x==="string"?snapPlace(x):(Array.isArray(x)?{ko:String(x[0]).slice(0,80),en:String(x[1]).slice(0,80),lat:+x[2],lng:+x[3],pin:1}:null);
      if(!it||!isFinite(it.lat)||!isFinite(it.lng)) return; if(it.pin) it.k=pinKey(it); if(pool[it.k]) return; it.stay=stayOf(it); pool[it.k]=it; items.push(it); ks.push(it.k); }); days.push(ks); });
    if(TR.items.length&&!confirm(T("받은 일정으로 바꿀까요? (지금 담은 목록은 바뀝니다)","Replace your current trip with the shared plan?"))) return false;
    var h=Array.isArray(o.h)?{type:"addr",ko:String(o.h[0]).slice(0,80),en:String(o.h[1]).slice(0,80),lat:+o.h[2],lng:+o.h[3]}:null;
    TR={items:items.map(function(x){ var y=Object.assign({},x); delete y.stay; return y; }),opt:{n:days.length,start:o.s,from:o.f,to:o.t,walk:+o.w||1,hotel:h}};
    TR.plan={v:1,at:Date.now(),from:hm2m(o.f)||570,to:hm2m(o.t)||1200,hotel:h,days:days.map(function(ks,i){ return {date:dayDate(i).toISOString().slice(0,10),stops:ks}; }),pool:pool,skip:[],ai:null};
    TR.plan.H=h?{k:"__hotel",ko:h.ko,en:h.en,lat:h.lat,lng:h.lng,hotel:1}:null; save(); refresh(); }); }); }

// ── 가이드에게 보내기 (사장님 2026-10-24) — 짜 둔 일정을 등록된(승인된) 가이드에게 이메일로 전달 + 우리 텔레그램 ──
//   near.js 통역·길안내(igRender)의 언어 고르기 → 가이드 목록 → 폼 흐름을 그대로 베낌. 결제 없음.
//   보내는 것: 가이드 선택 언어 · 일정 공유 링크(?trip=1#tp=…) · 손님 이름(선택) · 쪽지(선택) · 전달 동의
//   가이드 알림은 지금 이메일(허브 /guide/itinerary → Resend) + 우리 텔레그램. 가이드 앱/웹푸시는 Phase2 (가이드 앱 생길 때)
var GLANG6=[["한국어","ko"],["English","en"],["日本語","ja"],["中文(简)","zhs"],["中文(繁)","zht"],["Español","es"]];
var GD={view:"pick",lang:"",guides:null,gid:null,gobj:null,busy:false,err:""};
function gdLangName(c){ for(var i=0;i<GLANG6.length;i++) if(GLANG6[i][1]===c) return GLANG6[i][0]; return c; }
function gdFace(g){ return g.photo?'<img class="gdav" src="'+HUB+'/guide/photo?id='+encodeURIComponent(g.id)+'" alt="" loading="lazy">':'<span class="gdav gdavx"><img class="trgdic2" src="img/menu/mi_guideperson.png" alt=""></span>'; }
function gdOpen(){ GD={view:"pick",lang:"",guides:null,gid:null,gobj:null,busy:false,err:""}; sheet("trGd"); gdPaint(); try{ ntap("_trip","trip_guide_open"); }catch(e){} }
function gdLoad(){ var lang=GD.lang; fetch(HUB+"/guide/guides?lang="+encodeURIComponent(lang)).then(function(r){ return r.json(); }).then(function(j){ if(GD.lang!==lang||GD.view!=="list") return; if(j&&j.ok) GD.guides=j.items||[]; else GD.err="x"; gdPaint(); }).catch(function(){ if(GD.lang===lang&&GD.view==="list"){ GD.err="net"; gdPaint(); } }); }
function gdPaint(){ var box=document.querySelector("#trGd .trin"); if(!box) return;
  var head='<div class="trtop"><b><img class="miic trgdic" src="img/menu/mi_guideperson.png" alt="">'+esc(LG6(SENDGUIDE6))+'</b><button type="button" class="xbtn" style="position:static" onclick="TRIP.closeGuide()">✕</button></div>';
  var back='<button type="button" class="trbtn" id="gdBack" style="margin:0 0 6px">‹ '+esc(LG6({ko:"뒤로",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Atrás"}))+'</button>';
  if(GD.view==="done"){ box.innerHTML=head+'<div class="gdnote">✓ '+esc(LG6({ko:"가이드에게 일정을 보냈어요. 가이드가 이메일로 받습니다.",en:"Sent. The guide will receive it by email.",ja:"ガイドに日程を送りました。ガイドはメールで受け取ります。",zhs:"已将行程发送给向导。向导将通过邮件收到。",zht:"已將行程發送給嚮導。嚮導將透過電子郵件收到。",es:"Enviado. El guía lo recibirá por correo electrónico."}))+'</div><button type="button" class="trbtn" onclick="TRIP.closeGuide()">'+T("닫기","Close")+'</button>'; return; }
  if(GD.view==="req"&&GD.gobj){ var g=GD.gobj;
    box.innerHTML=head+back
      +'<div class="gdcard" style="cursor:default">'+gdFace(g)+'<div class="gdb"><b>'+esc(g.name)+'</b><div class="gdm">'+g.langs.map(gdLangName).map(esc).join(" · ")+'</div></div></div>'
      +'<label class="gdlb">'+esc(LG6({ko:"손님 이름 (선택)",en:"Your name (optional)",ja:"お名前（任意）",zhs:"您的姓名（可选）",zht:"您的姓名（可選）",es:"Tu nombre (opcional)"}))+'</label><input class="gdin" id="gdNm" maxlength="30">'
      +'<label class="gdlb">'+esc(LG6({ko:"쪽지 (선택)",en:"Message (optional)",ja:"メモ（任意）",zhs:"留言（可选）",zht:"留言（可選）",es:"Mensaje (opcional)"}))+'</label><textarea class="gdin" id="gdMs" maxlength="500" style="min-height:70px"></textarea>'
      +'<label class="gdchk"><input type="checkbox" id="gdAg"> '+esc(LG6({ko:"내 여행 일정을 이 가이드에게 전달하는 데 동의합니다.",en:"I agree to share my trip itinerary with this guide.",ja:"私の旅程をこのガイドに伝えることに同意します。",zhs:"我同意将我的行程转交给该向导。",zht:"我同意將我的行程轉交給該嚮導。",es:"Acepto compartir mi itinerario con este guía."}))+'</label>'
      +'<button type="button" class="trbtn big" id="gdGo" style="margin-top:10px"><img class="trgdic" src="img/menu/mi_guideperson.png" alt="" style="filter:brightness(0) invert(1)">'+esc(LG6(SENDGUIDE6))+'</button><div class="shmsg" id="gdM"></div>';
    document.getElementById("gdBack").onclick=function(){ GD.view="list"; gdPaint(); };
    document.getElementById("gdGo").onclick=gdSend; return; }
  if(GD.view==="list"){ var h=head+back+'<div class="gdlbl">'+esc(LG6({ko:gdLangName(GD.lang)+" 가이드",en:gdLangName(GD.lang)+" guides",ja:gdLangName(GD.lang)+"のガイド",zhs:gdLangName(GD.lang)+"向导",zht:gdLangName(GD.lang)+"嚮導",es:"Guías de "+gdLangName(GD.lang)}))+'</div>';
    if(GD.err) h+='<div class="msg">'+esc(LG6({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."}))+'</div>';
    else if(!GD.guides) h+='<div class="msg">'+esc(LG6({ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"搜索中…",zht:"搜尋中…",es:"Buscando…"}))+'</div>';
    else if(!GD.guides.length) h+='<div class="gdnote">'+esc(LG6({ko:"아직 등록된 가이드가 없습니다. 곧 추가될 예정이에요.",en:"No guides registered yet. More coming soon.",ja:"まだ登録されたガイドがいません。近日追加予定です。",zhs:"暂无已登记的向导，即将新增。",zht:"暫無已登記的嚮導，即將新增。",es:"Aún no hay guías registrados. Pronto habrá más."}))+'</div>';
    else h+=GD.guides.map(function(g,i){ return '<div class="gdcard" data-gdi="'+i+'">'+gdFace(g)+'<div class="gdb"><b>'+esc(g.name)+'</b>'+(g.count>0?' <span class="gdrb">★'+(g.avg!=null?g.avg:0)+' ('+g.count+')</span>':'')+'<div class="gdm">'+g.langs.map(gdLangName).map(esc).join(" · ")+(g.years?' · '+g.years+(window.LANG==="ko"?"년":"y"):"")+(g.region?' · '+esc(g.region):"")+'</div>'+(g.intro?'<div class="gdi">'+esc(g.intro)+'</div>':"")+'<span class="gdpk">'+esc(LG6({ko:"이 가이드에게 보내기 ›",en:"Send to this guide ›",ja:"このガイドに送る ›",zhs:"发送给该向导 ›",zht:"發送給該嚮導 ›",es:"Enviar a este guía ›"}))+'</span></div></div>'; }).join("");
    box.innerHTML=h; document.getElementById("gdBack").onclick=function(){ GD.view="pick"; GD.lang=""; GD.guides=null; gdPaint(); };
    [].forEach.call(box.querySelectorAll("[data-gdi]"),function(c){ c.onclick=function(){ var g=GD.guides&&GD.guides[+c.dataset.gdi]; if(g){ GD.gobj=g; GD.gid=g.id; GD.view="req"; gdPaint(); } }; }); return; }
  // pick
  box.innerHTML=head+'<div class="gdnote">ⓘ '+esc(LG6({ko:"짜 둔 여행 일정을 가이드에게 보내면, 가이드가 이메일로 받아 미리 볼 수 있어요.",en:"Send your trip itinerary to a guide; they’ll receive it by email and can review it beforehand.",ja:"作成した旅程をガイドに送ると、ガイドはメールで受け取り、事前に確認できます。",zhs:"将您的行程发送给向导，向导将通过邮件收到并提前查看。",zht:"將您的行程發送給嚮導，嚮導將透過電子郵件收到並提前查看。",es:"Envía tu itinerario a un guía; lo recibirá por correo y podrá revisarlo antes."}))+'</div>'
    +'<div class="gdlbl">'+esc(LG6({ko:"필요한 언어를 고르세요",en:"Choose the language you need",ja:"必要な言語を選んでください",zhs:"请选择您需要的语言",zht:"請選擇您需要的語言",es:"Elige el idioma que necesitas"}))+'</div><div class="gdlangs">'
    +GLANG6.map(function(l){ return '<button type="button" class="gdlang" data-gdl="'+l[1]+'">'+esc(l[0])+' ›</button>'; }).join("")+'</div>';
  [].forEach.call(box.querySelectorAll("[data-gdl]"),function(a){ a.onclick=function(){ GD.lang=a.dataset.gdl; GD.view="list"; GD.guides=null; GD.err=""; gdPaint(); gdLoad(); }; }); }
function gdSend(){ if(GD.busy) return; var ag=document.getElementById("gdAg"), M=document.getElementById("gdM"), set=function(t){ if(M) M.textContent=t; };
  if(!ag||!ag.checked){ set(LG6({ko:"전달 동의에 체크해 주세요.",en:"Please check the consent box.",ja:"同意にチェックしてください。",zhs:"请勾选同意。",zht:"請勾選同意。",es:"Marca la casilla de consentimiento."})); return; }
  var nm=document.getElementById("gdNm"), ms=document.getElementById("gdMs"), nmv=nm?nm.value:"", msv=ms?ms.value:"";
  GD.busy=true; set("…"); var go=document.getElementById("gdGo"); if(go) go.disabled=true;
  tripUrl().then(function(u){ window.__trShareUrl=u; return fetch(HUB+"/guide/itinerary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({guideId:GD.gid,lang:LANG,tripUrl:u,name:nmv,msg:msv,consent:true}),cache:"no-store"}); }).then(function(r){ return r.json(); }).then(function(j){ GD.busy=false; if(go) go.disabled=false;
    if(j&&j.ok){ GD.view="done"; gdPaint(); try{ ntap("_trip","trip_guide_send"); }catch(e){} return; }
    set(j&&j.err==="url"?LG6({ko:"일정 링크를 만들지 못했어요.",en:"Could not build the itinerary link.",ja:"日程リンクを作成できませんでした。",zhs:"无法生成行程链接。",zht:"無法產生行程連結。",es:"No se pudo crear el enlace."}):j&&j.err==="rate"?LG6({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again later.",ja:"しばらくしてからもう一度。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo más tarde."}):LG6({ko:"보내지 못했습니다.",en:"Could not send.",ja:"送信できませんでした。",zhs:"发送失败。",zht:"發送失敗。",es:"No se pudo enviar."})); })
  .catch(function(){ GD.busy=false; if(go) go.disabled=false; set(LG6({ko:"연결에 실패했습니다.",en:"Connection failed.",ja:"接続に失敗しました。",zhs:"连接失败。",zht:"連接失敗。",es:"Error de conexión."})); }); }

// ── 시작 ──
var css=document.createElement("style"); css.textContent=
 ".tradd{margin:8px 0 0;border:1.5px solid var(--green);background:#eefaf0;color:#2b8a3e;border-radius:999px;padding:7px 14px;font-weight:800;font-size:13.5px;cursor:pointer;font-family:inherit}.tradd.on{background:var(--green);color:#fff}"
+":root[data-theme=dark] .tradd{background:#13261a}:root[data-theme=dark] .tradd.on{background:var(--green)}"
+"#mz .trf{position:absolute;z-index:3;pointer-events:none;transform-origin:0 100%}#mz .trf b{display:block;position:relative;margin-left:0;background:#e8590c;color:#fff;font-weight:900;line-height:1;padding:.3em .45em .3em .4em;border-radius:.25em .45em .45em 0;box-shadow:0 1px 3px rgba(0,0,0,.4);white-space:nowrap;margin-bottom:1.1em}#mz .trf b:after{content:'';position:absolute;left:0;top:100%;width:.16em;height:1.1em;background:#7a2e05}"
+".trlock,.trlock body{overflow:hidden}.trsheet{position:fixed;inset:0;z-index:1035;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}.trsheet .trin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px}"
+".trtop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin:2px 0 10px}.trl{list-style:none;padding:0;margin:0}.tri{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:6px 0;touch-action:none}.tri.drag{opacity:.7;box-shadow:0 4px 14px rgba(0,0,0,.2)}"
+".trh{cursor:grab;font-size:18px;color:var(--sub);padding:0 4px;user-select:none;touch-action:none}.trn{background:#e8590c;color:#fff;border-radius:6px;min-width:22px;text-align:center;font-size:13px;padding:2px 4px}.trt{flex:1;font-weight:700;font-size:14.5px}.trt i{font-style:normal;color:var(--sub);font-weight:500;font-size:12.5px}.trx{border:0;background:none;color:var(--sub);font-size:18px;cursor:pointer}"
+".trf2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.trf2 label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--sub);font-weight:700}.trf2 .wide{grid-column:1/-1}.trf2 select,.trf2 input{font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:inherit;width:100%}"
+".trsr{display:flex;gap:6px}.tra{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:4px 0;cursor:pointer;font-size:14px}"
+".trbtn{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 14px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;margin:4px 4px 0 0}.trbtn.big{display:block;width:100%;background:var(--green);border-color:var(--green);color:#fff;font-size:17px;padding:13px}.trbtn:disabled{opacity:.6}.trbtn.ib{padding:9px 12px}"
+".trbar{display:flex;flex-wrap:wrap;margin:0 0 8px}.tday{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:12px 0}.tdh{font-weight:900;font-size:17px;display:flex;align-items:baseline;gap:6px}.tdh span{color:#e8590c}.tdh small{margin-left:auto;font-size:11px;color:var(--sub);font-weight:700}"
+".tai{font-size:14px;line-height:1.6;margin:6px 0 8px;color:var(--ink)}.tmap{margin:6px 0 8px;border-radius:12px;overflow:hidden;background:#96b2c4}.tmap img,.tmap canvas{display:block;width:100%;height:auto}"
+".trw{display:flex;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:14.5px}.trw .tt{font-weight:900;min-width:46px;color:var(--sub)}.trw .tp{flex:1}.trw.tpk{cursor:pointer}.trw.tpk.on{background:rgba(11,155,110,.10);box-shadow:inset 3px 0 0 #0b9b6e}.trw.h .tp,.trw.l .tp{color:var(--sub);font-weight:700}.trw i{font-style:normal;color:var(--sub);font-size:12.5px}"
+".tno{display:inline-block;background:#fff;color:#c2410c;border:2px solid #e8590c;border-radius:50%;width:22px;height:22px;line-height:18px;text-align:center;font-size:12px}.tmemo{display:block;font-size:12.5px;color:#c2410c;font-weight:700;margin-top:2px}.ttip{display:block;font-size:13px;color:var(--sub);margin-top:3px;line-height:1.45}"
+".tlg{font-size:12.5px;color:#1a73e8;font-weight:700;padding:3px 0 5px 56px}.tlg a{color:#1a73e8}.tods .trh{font-size:14px;color:var(--ink);padding:0;cursor:auto}"
+".teat{display:block;margin-top:4px;font-weight:500;color:var(--ink)}.tehd{display:block;font-size:12.5px;color:var(--sub);font-weight:800}.tec{display:block;padding:4px 0;border-top:1px dashed var(--line);font-size:13.5px}.tec i,.teat i{font-style:normal;color:var(--sub);font-size:12px}"
+".tesrc{display:block;font-size:11.5px;color:var(--sub);margin-top:1px}.tesrc a{color:var(--sub)}.tead{display:inline-block;background:#f59f00;color:#fff;border-radius:4px;padding:0 5px;font-size:11px}.tebtn{border:1.5px solid var(--green);background:var(--card);color:#2b8a3e;border-radius:999px;padding:3px 10px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;margin-left:4px}"
+".teact{display:block;margin-top:4px}.teact a{display:inline-block;margin:3px 5px 0 0;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;color:var(--ink);background:var(--bg)}.trck{flex-direction:row!important;align-items:center;gap:6px!important;font-size:13px!important}.trck input{width:auto!important}"
+".trpop{position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}.trpop>div{background:var(--card);color:var(--ink);max-width:440px;border-radius:16px;padding:16px 18px;font-size:14.5px;text-align:center}"
+".trshot{position:absolute;left:-12000px;top:0;width:680px;background:var(--bg);padding:0}.trshot .tday{margin:0}"
// 공유 칸 단추 + 가이드에게 보내기 판 (사장님 10-24)
+".shgrid{display:flex;flex-wrap:wrap;gap:8px}.shgrid button{flex:1 1 40%;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 10px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}.shmsg{font-size:13px;color:var(--sub);margin-top:8px;word-break:break-all}"
+".trgdbtn{display:flex;align-items:center;justify-content:center;width:100%;margin-top:8px;border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:12px;padding:11px 10px;font-weight:900;font-size:15px;cursor:pointer;font-family:inherit}:root[data-theme=dark] .trgdbtn{background:#0b2b31}.trgdic{height:18px;width:auto;vertical-align:-3px;margin-right:6px}"
+".gdlbl{font-size:13px;color:var(--sub);font-weight:800;margin:10px 2px 6px}.gdnote{background:#e3fafc;border:1px solid #99e9f2;color:#0b7285;border-radius:12px;padding:12px 14px;font-size:14px;font-weight:700;line-height:1.5;margin:6px 0 12px}:root[data-theme=dark] .gdnote{background:#0b2b31}"
+".gdlangs{display:flex;flex-direction:column;gap:9px}.gdlang{display:block;width:100%;text-align:center;border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:12px;padding:13px 10px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit}:root[data-theme=dark] .gdlang{background:#0b2b31}"
+".gdcard{display:flex;gap:11px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:9px 0;cursor:pointer}.gdav{width:56px;height:56px;border-radius:12px;object-fit:cover;flex:0 0 auto;background:#e3fafc}.gdav.gdavx{display:flex;align-items:center;justify-content:center}.gdavx .trgdic2{height:32px;width:auto}.gdb{flex:1;min-width:0}.gdb b{font-size:15.5px}.gdm{color:var(--sub);font-size:12.5px;margin-top:2px}.gdi{color:var(--ink);font-size:13px;margin-top:4px;line-height:1.45}.gdpk{display:inline-block;margin-top:6px;color:#0c8599;font-weight:800;font-size:13px}.gdrb{display:inline-block;font-size:12.5px;font-weight:800;color:#e8590c;white-space:nowrap}"
+".gdlb{display:block;font-size:13px;color:var(--sub);font-weight:700;margin:10px 2px 3px}.gdin{width:100%;box-sizing:border-box;font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:10px;padding:10px 11px}.gdchk{display:flex;gap:7px;align-items:flex-start;font-size:13px;color:var(--ink);margin:12px 2px 0;line-height:1.5}.gdchk input{width:18px;height:18px;margin-top:1px;flex:0 0 auto}";
document.head.appendChild(css);
window.TRIP={open:openPanel,report:openReport,close:sheetClose,closeGuide:function(){ sheetClose("trGd"); },guide:gdOpen,state:function(){ return TR; },hasPass:hasPass};
refresh();
if(/[?&]trip=1/.test(location.search)){ var hz=/#tp=([A-Za-z0-9_-]+)/.exec(location.hash);
  var startRep=function(){ if(TR.plan) openReport(); else openPanel(); };
  var waitCity=function(cb){ var n=0, iv=setInterval(function(){ if((window.CITY&&Object.keys(CITY).length)||++n>100){ clearInterval(iv); cb(); } },100); };
  waitCity(function(){ if(hz){ try{ history.replaceState(history.state,"",location.pathname+location.search); }catch(e){}
      fromShare(hz[1]).then(function(ok){ if(ok!==false) openReport(); else startRep(); },function(){ startRep(); }); } else startRep(); }); }
})();
