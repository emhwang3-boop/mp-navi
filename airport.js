/* 공항 화면 (사장님 10-27) — 지도에서 인천(kr "icn")·김포(seoulall "gimpo") 아이콘을 누르면 열린다. X 로 닫는다.
 *   순서: 입국/출국 고르기 → (인천) 1·2터미널 / (김포) 국제선·국내선 → 동선 순서대로 한 장
 *   입국 = 공항을 빠져나오는 순서(입국심사→편의시설→공항철도→버스→택시), 출국 = 공항에 들어가는 순서
 *   1차: 한국어판만. 사장님이 보고 고친 뒤 6개 언어로 늘린다. 층별 동선은 공항 공식 지도로 연결(그림은 안 그린다)
 */
(function(){
var MAP={ t1:"https://www.airport.kr/geomap/ap_ko/view.do?type=2&alertType=0&tmnlId=P01", t2:"https://www.airport.kr/geomap/ap_ko/view.do?type=2&alertType=0&tmnlId=P03",
  icn:"https://www.airport.kr", gmp:"https://www.airport.co.kr/gimpo/index.do", arex:"https://www.airportrailroad.com" };
var AP={
 icn:{ name:"인천국제공항", sub:"Incheon International Airport · ICN",
  pick:[["t1","제1여객터미널 (T1)","대부분의 외국 항공사·저비용항공사"],["t2","제2여객터미널 (T2)","대한항공·아시아나·스카이팀 항공사(델타·에어프랑스·KLM 등)"]],
  pickNote:"내 터미널은 탑승권이나 예약 확인서에 적혀 있어요. 두 터미널은 무료 셔틀버스로 오갈 수 있어요 — T1 3층 8번 출구, T2 3층 4·5번 출구 사이에서 타요(약 15분)." },
 gimpo:{ name:"김포국제공항", sub:"Gimpo International Airport · GMP",
  pick:[["int","국제선 청사","일본·중국·대만 등 가까운 나라 노선"],["dom","국내선 청사","제주·부산 등 한국 안 노선"]],
  pickNote:"두 청사는 걸어서 오갈 수 있어요(약 5~10분, 무료 셔틀도 있음)." }
};
// 동선 — [제목, [줄...], 덧붙임(회색)]
function arrIcn(t){ var T2=t==="t2", B1=T2?"교통센터 지하 1층":"교통센터 지하 1층";
 return [
  ["비행기에서 내려서", ["1-1 입국심사 (2층) — 탑승동에 내렸으면 셔틀트레인(24시간)을 타고 터미널로 와요","1-2 짐 찾기 — 심사 뒤 수하물 수취대 번호를 확인하고 에스컬레이터로 1층","1-3 세관 — 지나면 1층 입국장으로 나와요"], "입국신고서는 등록하지 않은 외국인만 써요. 기내에서 미리 써 두면 빨라요."],
  ["입국장(1층)에서 바로 할 것", ["2-1 인포메이션 데스크 — 길·교통·숙소 무엇이든 물어보세요","2-2 환전소·ATM — 시내 교통비·간식비 정도만 바꾸면 충분해요","2-3 유심·eSIM·포켓와이파이 — 통신사 로밍센터","2-4 편의점 — 교통카드(티머니) 사고 충전, 지하철·버스·택시 모두 사용","짐 보관·배송 — 짐을 호텔로 먼저 보낼 수 있어요"], "정확한 위치는 아래 「공식 안내도」에서 층·출구 번호로 확인하세요."],
  ["시내로 ① 공항철도 (AREX) — 가장 빠르고 막히지 않아요", ["타는 곳: 1층 입국장에서 「Train / 공항철도」 표지판 → "+B1,"직통열차: 서울역까지 쉬지 않고 "+(T2?"약 51분":"약 43분")+", 지정좌석 · 표는 자동발매기·앱","일반열차: 서울역까지 "+(T2?"약 66분":"약 59분")+" · 홍대입구·공덕 등에 서요 · 교통카드로 바로 타요"], "직통 요금 성인 13,000원 안팎(바뀔 수 있음). 홍대·명동 쪽은 일반열차가 편해요."],
  ["시내로 ② 공항버스 (리무진)", (T2?["타는 곳: 지하 1층 교통센터 버스터미널","서울행 중앙 11~35번 · 경기행 동편 36~45번 · 지방행 서편 1~10번","표: 지하 1층 버스터미널 매표소·자동발매기"]:["타는 곳: 1층 입국장 밖 버스정차장","서울행 3~7번 출구 밖 · 경기행 7~10번 · 지방행 11~13번 · 인천 2~3·13~14번","표: 1층 버스 매표소·자동발매기"]).concat(["명동·강남·동대문·잠실 등 호텔 근처까지 바로 가요"]), "짐이 많고 호텔이 버스 노선 근처면 편해요. 내 노선 번호는 승차장 표지판에서 확인하세요."],
  ["시내로 ③ 택시", [(T2?"타는 곳: 1층 입국장 밖 — 서울 7C · 모범·대형 7D · 인터내셔널 3C · 경기 6D · 인천 5D":"타는 곳: 1층 입국장 밖 — 일반 5C·6C·6D · 모범 7C · 대형 8C · 인터내셔널 4C"),"일반택시(가장 저렴) · 모범택시(검은색, 더 비쌈) · 대형택시(짐 많을 때) · 인터내셔널택시(외국어 기사)","미터기 요금 + 고속도로 통행료를 내요. 카드 결제 돼요"], "입국장 안에서 말을 걸어오는 호객 택시·콜밴은 타지 마세요. 반드시 지정 승차장에서 타세요."],
  ["터미널 사이 이동 (무료 셔틀버스)", ["T1에서 타는 곳: 3층 출국장 중앙 8번 출구 앞","T2에서 타는 곳: 3층 출국장 중앙 4·5번 출구 사이","약 10분마다 · 05시~23시 · 타고 약 15분","공항철도로도 한 정거장(약 6분)"], "입국장(1층)에서는 에스컬레이터로 3층에 올라가서 타요."]
 ]; }
function depIcn(t){ var T2=t==="t2";
 return [
  ["공항까지 가는 법", ["공항철도: 서울역에서 직통 "+(T2?"약 51분":"약 43분")+" · 일반열차는 홍대입구 등에서 타요","공항버스: 호텔 근처 정류장에서 바로","택시: 시내에서 1시간 안팎 + 통행료"], "국제선은 출발 3시간 전에 도착하세요. 공항철도는 T1에 먼저 서고 T2가 종점이에요 — "+(T2?"T2는 끝까지 타세요.":"T1에서 내리세요.")],
  ["내 터미널 다시 확인", ["탑승권·예약 확인서의 터미널 표시를 확인하세요 (지금: "+(T2?"제2터미널":"제1터미널")+")"], "잘못 왔으면 무료 셔틀버스로 옮겨 가요 — T1 3층 8번 출구, T2 3층 4·5번 출구 사이(약 10분마다, 타고 약 15분)."],
  ["3층 출국장 — 체크인", ["항공사 카운터는 알파벳 구역(A, B, C…)으로 나뉘어 있어요 — 전광판에서 내 항공편 찾기","셀프 체크인 기계·셀프 백드롭(짐 맡기기)도 있어요"], ""],
  ["택스리펀드 (세금 환급)", ["산 물건 세금을 돌려받으려면 짐을 부치기 전에 환급 키오스크·세관에서 먼저 확인받으세요","시내에서 즉시 환급받은 물건도 확인이 필요할 수 있어요"], "영수증과 여권을 꼭 챙기세요."],
  ["보안검색 → 출국심사 → 탑승구", ["보안검색: 액체는 100ml 이하만 기내 반입","출국심사 뒤 면세구역 — 면세점·식당·라운지","남은 원화는 보안검색 전후 환전소에서 다시 바꿀 수 있어요"], "탑승구는 출발 30~40분 전에 닫힐 수 있어요."]
 ]; }
function arrGmp(t){ if(t==="dom") return [
  ["국내선 도착", ["짐 찾기 → 1층 도착 로비"], ""],
  ["시내로", ["지하철: 김포공항역 — 공항철도·5호선·9호선이 지하 통로로 이어져요","택시·버스: 청사 앞 승차장"], "홍대·서울역은 공항철도, 강남은 9호선 급행이 빨라요."]];
 return [
  ["비행기에서 내려서", ["입국심사 → 짐 찾기 → 세관 → 입국장으로 나와요"], "인천보다 작아서 빨리 나올 수 있어요."],
  ["입국장에서 바로 할 것", ["인포메이션 데스크","환전소·ATM","유심·eSIM","교통카드(티머니) — 편의점에서 사고 충전"], "정확한 위치는 「공식 안내도」에서 확인하세요."],
  ["시내로 ① 지하철 — 김포공항역", ["청사에서 지하 통로로 김포공항역까지 걸어가요","공항철도: 홍대입구·서울역 방면","9호선(급행): 여의도·강남(신논현) 방면","5호선: 광화문·동대문 방면"], "교통카드로 바로 타요. 서울역까지 20분대예요."],
  ["시내로 ② 버스", ["청사 앞 버스 승차장 — 시내·경기 여러 곳으로 가요"], "노선은 공식 안내도에서 확인하세요."],
  ["시내로 ③ 택시", ["국제선 청사 건너편 주차장 앞 도로의 택시 승차장","일반·모범·대형·국제택시 줄이 나뉘어 있어요"], "호객 택시는 타지 말고 지정 승차장에서 타세요."]
 ]; }
function depGmp(t){ if(t==="dom") return [
  ["국내선 출발", ["신분증(여권) 확인 → 체크인 → 보안검색 → 탑승구"], "출발 1시간 전에 도착하면 충분해요."]];
 return [
  ["공항까지 가는 법", ["지하철 김포공항역(공항철도·5호선·9호선)에서 지하 통로로 국제선 청사까지","택시·버스는 청사 앞에 내려요"], "국제선은 출발 2시간 전에 도착하세요."],
  ["체크인", ["항공사 카운터 또는 셀프 체크인"], ""],
  ["택스리펀드 (세금 환급)", ["짐 부치기 전에 환급 키오스크·세관에서 먼저 확인"], "영수증·여권을 챙기세요."],
  ["보안검색 → 출국심사 → 탑승구", ["면세점·식당","남은 원화 재환전"], ""]
 ]; }

// 입국 동선 단면도 — 그림은 나노바나나(글자 없는 실사 단면), 번호·화살표·층 이름은 여기서 얹는다(글자가 정확하고 언어 바꾸기 쉬움). 좌표 = 그림 2000×1116 기준
var FIG={ icn_t1_arr:{ img:"img/airport/icn_t1_arr.webp?v=1027",
  floors:[[330,"3층 출국장",1],[478,"2층 입국심사"],[648,"1층 짐 찾기·입국장"],[828,"지하1층 공항철도"]],
  path:["M330,468 L690,498","M690,498 L845,522 L862,632","M862,660 L705,688","M705,688 L1068,732","M1068,732 L880,748 L1010,872 L1170,900","M1068,732 L1395,742 L1590,700","M1395,742 L1520,790 L1770,810","M1068,732 L1120,560 L1180,420 L1320,392"],
  badge:[[690,440,"1-1","입국심사"],[905,590,"1-2","짐 찾기"],[630,632,"1-3","세관"],[1060,688,"2","입국장"],[1160,592,"2-1","",1],[1214,592,"2-2","",1],[1268,592,"2-3","",1],[1322,592,"2-4","",1],[965,850,"3","공항철도"],[1600,662,"4","공항버스 (서울 3~7번 출구)"],[1770,758,"5","택시 (일반 5C·6C)"],[1350,350,"6","셔틀버스 (3층 8번 출구) → T2"]],
  legend:[1150,555,"2-1 안내 · 2-2 환전 · 2-3 유심 · 2-4 편의점"] },
 icn_t2_arr:{ img:"img/airport/icn_t2_arr.webp?v=1027",
  floors:[[360,"3층 출국장"],[505,"2층 입국심사"],[655,"1층 짐 찾기·입국장"],[850,"지하1층 공항철도·버스"]],
  path:["M380,505 L880,500","M880,500 L1015,540 L965,662","M940,690 L790,668","M790,668 L1170,728","M1170,728 L1165,800 L1110,905 L830,860","M1110,905 L1300,915 L1510,940","M1170,728 L1560,762 L1700,775","M1170,728 L1300,560 L1520,412 L1720,392"],
  badge:[[880,452,"1-1","입국심사"],[1060,600,"1-2","짐 찾기"],[760,628,"1-3","세관"],[1150,686,"2","입국장"],[1335,650,"2-1","",1],[1388,650,"2-2","",1],[1441,650,"2-3","",1],[1494,650,"2-4","",1],[960,820,"3","공항철도"],[1420,870,"4","공항버스 (서울 11~35번)"],[1690,712,"5","택시 (서울 7C)"],[1600,330,"6","셔틀버스 (3층 4·5번 출구) → T1"]],
  legend:[1290,605,"2-1 안내 · 2-2 환전 · 2-3 유심 · 2-4 편의점"] } };
function fig(k){ var F=FIG[k]; if(!F) return ""; var s='<svg viewBox="0 0 2000 1116" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="apAr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff5a0a"/></marker></defs>';
 F.floors.forEach(function(f){ s+='<g opacity="'+(f[2]?.45:1)+'"><rect x="24" y="'+(f[0]-34)+'" width="'+(f[1].length*34+40)+'" height="56" rx="12" fill="#fff" fill-opacity=".92"/><text x="44" y="'+(f[0]+6)+'" font-size="34" font-weight="800" fill="#17324d">'+esc(f[1])+'</text></g>'; });
 F.path.forEach(function(d){ s+='<path d="'+d+'" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/><path d="'+d+'" fill="none" stroke="#ff5a0a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#apAr)"/>'; });
 F.badge.forEach(function(b){ var r=b[4]?24:32, fs=b[2].length>1?(b[4]?20:24):32; s+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="'+r+'" fill="#ff5a0a" stroke="#fff" stroke-width="5"/><text x="'+b[0]+'" y="'+(b[1]+fs*0.36)+'" text-anchor="middle" font-size="'+fs+'" font-weight="900" fill="#fff">'+esc(b[2])+'</text>';
  var lf=b[3]&&b[0]+r+10+b[3].length*31>1990;   /* 오른쪽 끝을 넘으면 이름을 동그라미 왼쪽에 */
  if(b[3]) s+='<text x="'+(lf?b[0]-r-10:b[0]+r+10)+'" y="'+(b[1]+12)+'"'+(lf?' text-anchor="end"':'')+' font-size="34"font-weight="900" fill="#17324d" stroke="#fff" stroke-width="9" paint-order="stroke" stroke-linejoin="round">'+esc(b[3])+'</text>'; });
 if(F.legend) s+='<text x="'+F.legend[0]+'" y="'+F.legend[1]+'" font-size="26" font-weight="800" fill="#17324d" stroke="#fff" stroke-width="7" paint-order="stroke">'+esc(F.legend[2])+'</text>';
 s+='</svg>'; return '<div class="apfig"><div class="apfw"><img src="'+F.img+'" alt="" loading="lazy">'+s+'</div></div><p class="apnote">그림을 옆으로 밀어 보세요. 실제 층 배치는 공식 안내도가 정확해요.</p>'; }
var S={ap:null,dir:null,t:null};
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function css(){ if(document.getElementById("apCss")) return; var st=document.createElement("style"); st.id="apCss";
 st.textContent="#apBox{position:fixed;inset:0;z-index:1040;background:var(--bg,#f6f7f9);overflow:auto;-webkit-overflow-scrolling:touch}"
 +"#apBox .aph{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:12px 14px;background:#1f5fa8;color:#fff}"
 +"#apBox .aph h1{margin:0;font-size:18px;line-height:1.2}#apBox .aph small{display:block;font-size:12px;opacity:.85;font-weight:400}"
 +"#apBox .apx{margin-left:auto;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:15px;font-weight:800;border-radius:999px;padding:8px 14px;cursor:pointer}"
 +"#apBox .apin{max-width:560px;margin:0 auto;padding:14px 14px 40px;display:flex;flex-direction:column;gap:12px}"
 +"#apBox .apq{font-size:16px;font-weight:800;margin:6px 2px 0}"
 +"#apBox .apbig{display:grid;grid-template-columns:1fr 1fr;gap:10px}"
 +"#apBox .apbig button,#apBox .appk button{border:1.5px solid #d6dde5;background:var(--card,#fff);border-radius:14px;padding:16px 12px;text-align:left;cursor:pointer;color:inherit}"
 +"#apBox .apbig b{display:block;font-size:20px}#apBox .apbig span,#apBox .appk span{display:block;font-size:13px;color:var(--sub,#667);margin-top:4px;line-height:1.45}"
 +"#apBox .apbig .a b{color:#1f7a5a}#apBox .apbig .d b{color:#1f5fa8}"
 +"#apBox .appk{display:flex;flex-direction:column;gap:10px}#apBox .appk b{font-size:16px}"
 +"#apBox .apnote{font-size:13px;color:var(--sub,#667);line-height:1.5;margin:0 2px}"
 +"#apBox .apnav{display:flex;flex-wrap:wrap;gap:8px;align-items:center}"
 +"#apBox .apnav button{border:1px solid #d6dde5;background:var(--card,#fff);border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer;color:inherit}"
 +"#apBox .apnav .on{background:#1f5fa8;border-color:#1f5fa8;color:#fff}"
 +"#apBox .apmap{display:block;text-align:center;border-radius:12px;padding:12px;background:#eaf1fb;color:#1f5fa8;font-weight:800;text-decoration:none}"
 +"#apBox .apst{background:var(--card,#fff);border-radius:14px;padding:12px 14px;display:flex;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)}"
 +"#apBox .apn{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:900;font-size:13px}"
 +"#apBox .arr .apn{background:#1f7a5a}#apBox .dep .apn{background:#1f5fa8}"
 +"#apBox .apst h3{margin:2px 0 6px;font-size:15px;line-height:1.35}#apBox .apst ul{margin:0;padding-left:16px}#apBox .apst li{margin:3px 0;font-size:14px;line-height:1.5}"
 +"#apBox .apfig{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:14px;background:#eeeef3}#apBox .apfw{position:relative;width:max(100%,880px)}#apBox .apfw img{display:block;width:100%;height:auto}#apBox .apfw svg{position:absolute;inset:0;width:100%;height:100%;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif}"
 +"#apBox .apst p{margin:6px 0 0;font-size:12.5px;color:var(--sub,#667);line-height:1.5}";
 document.head.appendChild(st); }
function close(){ var b=document.getElementById("apBox"); if(b) b.remove(); document.documentElement.style.overflow=""; }
function open(k){ css(); close(); S={ap:k,dir:null,t:null}; var b=document.createElement("div"); b.id="apBox"; document.body.appendChild(b); document.documentElement.style.overflow="hidden"; paint(); }
function paint(){ var b=document.getElementById("apBox"); if(!b) return; var A=AP[S.ap], h='';
 h+='<div class="aph"><div><h1>'+esc(A.name)+'</h1><small>'+esc(A.sub)+'</small></div><button type="button" class="apx" data-a="x" aria-label="닫기">✕ 닫기</button></div><div class="apin">';
 if(!S.dir){
  h+='<div class="apq">한국에 도착하셨나요, 떠나시나요?</div><div class="apbig"><button type="button" class="a" data-a="dir" data-v="arr"><b>입국</b><span>한국에 도착 — 공항에서 시내로 나가는 길</span></button><button type="button" class="d" data-a="dir" data-v="dep"><b>출국</b><span>한국을 떠남 — 공항 가는 길과 탑승까지</span></button></div>';
 } else if(!S.t){
  h+='<div class="apnav"><button type="button" data-a="back">‹ 처음으로</button><span class="apnote">'+(S.dir==="arr"?"입국":"출국")+'</span></div>';
  h+='<div class="apq">'+(S.ap==="icn"?"어느 터미널인가요?":"어느 청사인가요?")+'</div><div class="appk">';
  A.pick.forEach(function(p){ h+='<button type="button" data-a="t" data-v="'+p[0]+'"><b>'+esc(p[1])+'</b><span>'+esc(p[2])+'</span></button>'; });
  h+='</div><p class="apnote">'+esc(A.pickNote)+'</p>';
 } else {
  var L=S.ap==="icn"?(S.dir==="arr"?arrIcn(S.t):depIcn(S.t)):(S.dir==="arr"?arrGmp(S.t):depGmp(S.t)), tn=A.pick.filter(function(p){ return p[0]===S.t; })[0][1];
  h+='<div class="apnav"><button type="button" data-a="back">‹ 처음으로</button>';
  A.pick.forEach(function(p){ h+='<button type="button" data-a="t" data-v="'+p[0]+'" class="'+(p[0]===S.t?"on":"")+'">'+esc(p[1].split(" (")[0])+'</button>'; });
  h+='</div><div class="apq">'+(S.dir==="arr"?"입국":"출국")+' · '+esc(tn)+'</div>';
  h+=fig(S.ap+"_"+S.t+"_"+S.dir);
  var mu=S.ap==="icn"?MAP[S.t]:MAP.gmp; h+='<a class="apmap" href="'+mu+'" target="_blank" rel="noopener">공식 공항 안내도 보기 (층·출구 번호)</a>';
  L.forEach(function(s,i){ h+='<div class="apst '+S.dir+'"><div class="apn">'+(i+1)+'</div><div><h3>'+esc(s[0])+'</h3><ul>'+s[1].map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>'+(s[2]?'<p>'+esc(s[2])+'</p>':'')+'</div></div>'; });
  if(S.ap==="icn"&&S.dir==="arr") h+='<a class="apmap" href="'+MAP.arex+'" target="_blank" rel="noopener">공항철도 공식 시간표·요금</a>';
 }
 h+='</div>'; b.innerHTML=h; b.scrollTop=0; }
document.addEventListener("click",function(e){ var el=e.target.closest&&e.target.closest("#apBox [data-a]"); if(!el) return; var a=el.getAttribute("data-a"), v=el.getAttribute("data-v");
 if(a==="x") close(); else if(a==="dir"){ S.dir=v; paint(); } else if(a==="t"){ S.t=v; paint(); } else if(a==="back"){ S.dir=null; S.t=null; paint(); } });
var _gb=window.guBack; window.guBack=function(){ if(document.getElementById("apBox")){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로 = 닫기
var _hc=window.hitClick; window.hitClick=function(k){ if(k==="icn"||k==="gimpo"){ open(k); return; } return _hc.apply(this,arguments); };
window.apOpen=open;
})();
