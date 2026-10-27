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
  pick:[["t1","제1여객터미널 (T1)","대부분의 외국 항공사·저비용항공사"],["t2","제2여객터미널 (T2)","대한항공·아시아나·스카이팀 항공사(델타·에어프랑스·KLM 등)"],["cc","탑승동 (게이트 101~132)","1터미널 항공편 중 일부 — 1터미널과 지하 셔틀트레인으로 이어져요"]],
  pickNote:"내 터미널은 탑승권이나 예약 확인서에 적혀 있어요. 두 터미널은 무료 셔틀버스로 오갈 수 있어요 — T1 3층 8번 출구, T2 3층 4·5번 출구 사이에서 타요(약 15분)." },
 gimpo:{ name:"김포국제공항", sub:"Gimpo International Airport · GMP",
  pick:[["int","국제선 청사","일본·중국·대만 등 가까운 나라 노선"],["dom","국내선 청사","제주·부산 등 한국 안 노선"]],
  pickNote:"두 청사는 걸어서 오갈 수 있어요(약 5~10분, 무료 셔틀도 있음)." }
};
// 동선 — [제목, [줄...], 덧붙임(회색)]
function arrIcn(t){ var T2=t==="t2", B1="교통센터 지하 1층";
 var L=arrIcn0(t,T2,B1); if(t==="cc") L[0]=["탑승동에서 1터미널로", ["1-1 탑승동 2층 도착 — 「입국/Arrivals」 표지판을 따라가요","1-2 지하 셔틀트레인 — 약 5분, 24시간 운행","1-3 1터미널에 내려 2층 입국심사","1-4 짐 찾기 — 에스컬레이터로 1층 수하물 수취대","1-5 세관 — 지나면 1층 입국장"], "셔틀트레인은 한 번 타면 탑승동으로 돌아갈 수 없어요. 그다음(2~6)은 1터미널과 같아요. 입국신고서는 등록하지 않은 외국인만 써요."];
 return L; }
function arrIcn0(t,T2,B1){
 return [
  ["비행기에서 내려서", ["1-1 입국심사 (2층)","1-2 짐 찾기 — 심사 뒤 수하물 수취대 번호를 확인하고 에스컬레이터로 1층","1-3 세관 — 지나면 1층 입국장으로 나와요"], (T2?"":"비행기가 101~132번 게이트(탑승동)에 내렸으면, 지하 셔틀트레인(약 5분)을 타고 터미널로 건너와 입국심사를 받아요. ")+"입국신고서는 등록하지 않은 외국인만 써요. 기내에서 미리 써 두면 빨라요."],
  ["입국장(1층)에서 바로 할 것", ["2-1 인포메이션 데스크 — 길·교통·숙소 무엇이든 물어보세요","2-2 환전소·ATM — 시내 교통비·간식비 정도만 바꾸면 충분해요","2-3 유심·eSIM·포켓와이파이 — 통신사 로밍센터","2-4 편의점 — 교통카드(티머니) 사고 충전, 지하철·버스·택시 모두 사용","짐 보관·배송 — 짐을 호텔로 먼저 보낼 수 있어요"], "정확한 위치는 아래 「공식 안내도」에서 층·출구 번호로 확인하세요."],
  ["시내로 ① 공항철도 (AREX) — 가장 빠르고 막히지 않아요", ["타는 곳: 1층 입국장에서 「Train / 공항철도」 표지판 → "+B1,"직통열차: 서울역까지 쉬지 않고 "+(T2?"약 51분":"약 43분")+", 지정좌석 · 표는 자동발매기·앱","일반열차: 서울역까지 "+(T2?"약 66분":"약 59분")+" · 홍대입구·공덕 등에 서요 · 교통카드로 바로 타요"], "직통 요금 성인 13,000원 안팎(바뀔 수 있음). 홍대·명동 쪽은 일반열차가 편해요."],
  ["시내로 ② 공항버스 (리무진)", (T2?["타는 곳: 지하 1층 교통센터 버스터미널","서울행 중앙 11~35번 · 경기행 동편 36~45번 · 지방행 서편 1~10번","표: 지하 1층 버스터미널 매표소·자동발매기"]:["타는 곳: 1층 입국장 밖 버스정차장","서울행 3~7번 출구 밖 · 경기행 7~10번 · 지방행 11~13번 · 인천 2~3·13~14번","표: 1층 버스 매표소·자동발매기"]).concat(["명동·강남·동대문·잠실 등 호텔 근처까지 바로 가요"]), "짐이 많고 호텔이 버스 노선 근처면 편해요. 내 노선 번호는 승차장 표지판에서 확인하세요."],
  ["시내로 ③ 택시", [(T2?"타는 곳: 1층 입국장 밖 — 서울 7C · 모범·대형 7D · 인터내셔널 3C · 경기 6D · 인천 5D":"타는 곳: 1층 입국장 밖 — 일반 5C·6C·6D · 모범 7C · 대형 8C · 인터내셔널 4C"),"일반택시(가장 저렴) · 모범택시(검은색, 더 비쌈) · 대형택시(짐 많을 때) · 인터내셔널택시(외국어 기사)","미터기 요금 + 고속도로 통행료를 내요. 카드 결제 돼요"], "입국장 안에서 말을 걸어오는 호객 택시·콜밴은 타지 마세요. 반드시 지정 승차장에서 타세요."],
  ["터미널 사이 이동 (무료 셔틀버스)", ["T1에서 타는 곳: 3층 출국장 중앙 8번 출구 앞","T2에서 타는 곳: 3층 출국장 중앙 4·5번 출구 사이","약 10분마다 · 05시~23시 · 타고 약 15분","공항철도로도 한 정거장(약 6분)"], "입국장(1층)에서는 에스컬레이터로 3층에 올라가서 타요."]
 ]; }
function depIcn(t){ var T2=t==="t2", CC=t==="cc";
 return [
  ["1 공항 도착", ["공항철도: 지하 1층에서 내려 에스컬레이터로 3층 출국장 — 서울역 직통 "+(T2?"약 51분":"약 43분"),"공항버스·택시: 3층 출국장 앞에 내려요 (노선마다 내리는 출구 번호가 달라요)","공항철도는 1터미널에 먼저 서고 2터미널이 종점 — "+(T2?"2터미널은 끝까지 타세요":"1터미널에서 내리세요")], "국제선은 출발 3시간 전에 도착하세요. 터미널을 잘못 왔으면 무료 셔틀버스(T1 3층 8번 출구 ↔ T2 3층 4·5번 출구 사이, 약 15분)."],
  ["2 체크인 (3층)", ["전광판에서 내 항공편의 카운터 구역(알파벳)을 찾아 짐 맡기기","셀프 체크인·셀프 백드롭 기계도 있어요","택스리펀드(세금 환급)·세관신고는 짐 부치기 전에 먼저","환전·로밍·보험 등 용무는 출국장 들어가기 전에 끝내기"], "영수증·여권을 꼭 챙기세요."],
  ["3 출국장 → 보안검색", ["가까운 출국장으로 들어가 여권·탑승권 확인","가방·겉옷은 바구니에 · 액체는 100ml 이하만 기내 반입"], ""],
  ["4 출국심사", ["자동출입국심사 또는 심사관 심사"], "출국심사를 마치고 면세구역에 들어가면 일반구역으로 돌아갈 수 없어요."],
  ["5 면세구역", ["면세점·식당·라운지 · 남은 원화 재환전"], ""],
  ["6 탑승구 → 탑승", [(T2?"2터미널 탑승구: 208~290번":CC?"탑승동 탑승구: 101~132번 — 출국심사 뒤 지하 셔틀트레인으로 이동(약 5분)":"1터미널 탑승구: 1~50번 · 101~132번은 탑승동(셔틀트레인 약 5분)"),"탑승권의 탑승구 번호와 위치를 확인하세요"], (CC?"셔틀트레인은 한 번 타면 1터미널로 돌아올 수 없어요. 면세 쇼핑을 먼저 끝내세요. ":"")+"탑승 30~40분 전까지 탑승구에 도착하세요."]
 ]; }
function arrGmp(t){ if(t==="dom") return [
  ["국내선 도착", ["짐 찾기 → 1층 도착장으로 나와요"], ""],
  ["시내로", ["지하철: 김포공항역 — 공항철도·5호선·9호선 (국내선 1층 서편 에스컬레이터로 내려가요)","택시·버스: 청사 앞 승차장"], "홍대·서울역은 공항철도, 강남은 9호선 급행이 빨라요."]];
 return [
  ["비행기에서 내려서", ["1-1 입국심사 — 1층 도착장","1-2 짐 찾기 — 전광판에서 내 편명의 수하물 수취대 번호 확인","1-3 세관 — 지나면 1층 입국장"], "인천보다 작아서 빨리 나올 수 있어요. 입국신고서는 등록하지 않은 외국인만 써요."],
  ["입국장(1층)에서 바로 할 것", ["2-1 인포메이션 데스크","2-2 환전소·ATM","2-3 유심·eSIM","2-4 편의점 — 교통카드(티머니) 사고 충전"], "정확한 위치는 「공식 안내도」에서 확인하세요."],
  ["시내로 ① 지하철 — 김포공항역", ["「지하철 Subway」 표지판을 따라 지하 통로로 김포공항역까지 걸어가요","공항철도: 홍대입구·서울역 방면","9호선(급행): 여의도·강남(신논현) 방면","5호선: 광화문·동대문 방면"], "교통카드로 바로 타요. 서울역까지 20분대예요."],
  ["시내로 ② 버스", ["시내버스: 국제선 1층 1·2번 게이트로 나가 오른쪽 ①~④번, 왼쪽 ⑥·⑦번 정류장","공항순환버스: 1층 1번 게이트 나가 오른쪽 ⑤번","시외버스(경기·지방): 2층 2번 게이트 밖 ①번"], "노선은 정류장 표지판에서 확인하세요."],
  ["시내로 ③ 택시", ["청사 앞 길을 건너 택시 승차장","일반·모범·대형·국제택시 줄이 나뉘어 있어요"], "호객 택시는 타지 말고 지정 승차장에서 타세요."]
 ]; }
function depGmp(t){ if(t==="dom") return [
  ["국내선 출발", ["1 공항 도착 — 지하철 김포공항역은 국내선 1층 서편 에스컬레이터와 이어져요","2 체크인 (2층) — 항공사 카운터·셀프 체크인에서 짐 맡기기 (모바일 체크인했으면 바로 3층으로)","3 출발장 (3층) — 입구에서 신분증·탑승권 확인 → 보안검색","4 탑승구 (3층)에서 기다렸다 탑승","4층: 식당가·항공사 라운지·전망대"], "외국인은 신분증으로 여권을 보여 주세요. 출발 1시간 전에 도착하면 충분해요."]];
 return [
  ["1 공항까지 가는 법", ["지하철 김포공항역(공항철도·5호선·9호선)에서 「국제선」 표지판 따라 지하 통로로","버스·택시는 국제선 청사 앞에 내려요"], "국제선은 출발 2시간 전에 도착하세요."],
  ["2 체크인 (2층)", ["항공사 카운터 또는 셀프 체크인 — 짐 맡기기","온라인·모바일로 미리 체크인했으면 3층 출발장으로 바로 가요"], "기내 가방은 가로55·세로40·높이20cm, 10kg 이내."],
  ["3 신원확인 → 보안검색 (3층 출발장 입구)", ["여권·탑승권을 보여 주고 들어가요 — 마스크·모자·선글라스는 잠깐 벗기","보안검색: 가방·겉옷을 바구니에, 액체는 100ml 이하만"], "택스리펀드(세금 환급)는 짐 부치기 전에 키오스크·세관에서 먼저 확인받으세요."],
  ["4 출국심사 (3층)", ["여권을 내고 출국심사 (자동출입국심사도 있어요)"], ""],
  ["5 면세구역 (3층)", ["면세점·식당 · 남은 원화는 환전소에서 다시 바꾸기"], ""],
  ["6 탑승구 → 탑승", ["탑승권에 적힌 탑승구로 — 출발 30분 전쯤 탑승 시작"], ""]
 ]; }

// 입국 동선 단면도 — 그림은 나노바나나(글자 없는 실사 단면), 번호·화살표·층 이름은 여기서 얹는다(글자가 정확하고 언어 바꾸기 쉬움). 좌표 = 그림 2000×1116 기준
var FIG={ icn_t1_arr:{ img:"img/airport/icn_t1_arr.webp?v=1027",
  floors:[[330,"3층 출국장",1],[478,"2층 입국심사"],[648,"1층 짐 찾기·입국장"],[828,"지하1층 공항철도"]],
  path:["M330,468 L690,498","M690,498 L845,522 L862,632","M862,660 L705,688","M705,688 L1068,732","M1068,732 L880,748 L1010,872 L1170,900","M1068,732 L1395,742 L1590,700","M1395,742 L1520,790 L1770,810","M1068,732 L1120,560 L1180,420 L1320,392"],
  badge:[[690,440,"1-1","입국심사"],[905,590,"1-2","짐 찾기"],[630,632,"1-3","세관"],[1060,688,"2","입국장"],[1160,592,"2-1","",1],[1214,592,"2-2","",1],[1268,592,"2-3","",1],[1322,592,"2-4","",1],[965,850,"3","공항철도"],[1600,662,"4","공항버스\n(서울행\n3~7번 출구)",0,[1745,505]],[1770,758,"5","택시 (일반 5C·6C)"],[1350,350,"6","셔틀버스 (3층 8번 출구) → T2"]],
  legend:[1150,522,"2-1 안내 · 2-2 환전\n2-3 유심 · 2-4 편의점"] },
 icn_t2_arr:{ img:"img/airport/icn_t2_arr.webp?v=1027",
  floors:[[360,"3층 출국장"],[505,"2층 입국심사"],[655,"1층 짐 찾기·입국장"],[850,"지하1층 공항철도·버스"]],
  path:["M380,505 L880,500","M880,500 L1015,540 L965,662","M940,690 L790,668","M790,668 L1170,728","M1170,728 L1165,800 L1110,905 L830,860","M1110,905 L1300,915 L1510,940","M1170,728 L1560,762 L1700,775","M1170,728 L1300,560 L1520,412 L1720,392"],
  badge:[[880,452,"1-1","입국심사"],[1060,600,"1-2","짐 찾기"],[760,628,"1-3","세관"],[1150,686,"2","입국장"],[1335,650,"2-1","",1],[1388,650,"2-2","",1],[1441,650,"2-3","",1],[1494,650,"2-4","",1],[960,820,"3","공항철도"],[1420,870,"4","공항버스 (서울 11~35번)"],[1690,712,"5","택시 (서울 7C)"],[1600,330,"6","셔틀버스 (3층 4·5번 출구) → T1"]],
  legend:[1300,572,"2-1 안내 · 2-2 환전\n2-3 유심 · 2-4 편의점"] },
 icn_cc_arr:{ img:"img/airport/icn_cc_arr.webp?v=1027b", vb:[2000,450],
  floors:[],
  path:["M215,127 L415,130","M415,130 L395,180 L335,300 L480,370","M480,370 L1395,370","M1395,370 L1480,370 L1590,230 L1640,130 L1560,120","M1560,120 L1330,120","M1330,120 L1310,170 L1350,230 L1560,230","M1560,230 L1700,245"],
  badge:[[350,70,"1-1","탑승동 2층 도착"],[920,295,"1-2","지하 셔틀트레인 (약 5분)"],[1300,65,"1-3","1터미널 2층 입국심사"],[1300,230,"1-4","짐 찾기"],[1500,290,"1-5","세관"],[1740,195,"2","입국장"]],
  legend:null },
 gimpo_int_arr:{ img:"img/airport/gimpo_int_arr.webp?v=1027",
  floors:[[300,"3층 출국장",1],[640,"1층 입국심사·짐·입국장"],[800,"지하 통로 → 지하철"]],
  path:["M430,470 L1000,490 L930,592 L800,604","M800,604 L975,640","M975,640 L1130,656","M1130,656 L1325,662","M1325,662 L1210,692 L1470,880 L1650,935","M1325,662 L1540,692 L1650,632","M1540,692 L1700,722 L1880,652"],
  badge:[[760,560,"1-1","입국심사"],[1000,540,"1-2","짐 찾기"],[1150,612,"1-3","세관"],[1330,616,"2","입국장"],[1300,545,"2-1","",1],[1352,545,"2-2","",1],[1404,545,"2-3","",1],[1456,545,"2-4","",1],[1560,860,"3","지하철 김포공항역\n(공항철도·5호선·9호선)",0,[1080,960]],[1600,560,"4","버스\n(1층 1·2번 게이트 밖)",0,[1610,450]],[1890,722,"5","택시 (길 건너)"]],
  legend:[1250,462,"2-1 안내 · 2-2 환전\n2-3 유심 · 2-4 편의점"] },
 gimpo_int_dep:{ img:"img/airport/gimpo_int_dep.webp?v=1027", vb:[2000,775],
  floors:[[330,"3층 출국장"],[560,"지하 → 지하철"]],
  path:["M1700,560 L1430,555 L1190,355 L1250,322","M1760,330 L1600,322 L1360,322","M1330,322 L1300,212","M1250,212 L1130,292 L1005,292","M1005,292 L825,287","M825,287 L765,205","M765,205 L520,172 L345,152"],
  badge:[[1560,500,"1","지하철로 도착",0,[1440,640]],[1700,280,"1","버스·택시로 도착",0,[1650,230]],[1330,150,"2","체크인 (2층)"],[1060,235,"3","신원확인·보안검색 (3층)"],[830,230,"4","출국심사"],[700,125,"5","면세구역"],[480,95,"6","탑승구"]],
  legend:null},
 gimpo_dom_dep:{ img:"img/airport/gimpo_dom_dep.webp?v=1027", vb:[2000,680],
  floors:[],
  path:["M1650,545 L1490,545 L1130,285 L1210,242","M1760,300 L1620,245 L1340,240","M1300,240 L1300,185","M1260,190 L1100,230 L965,215","M965,215 L700,200 L480,175"],
  badge:[[1560,470,"1","지하철로 도착",0,[1190,600]],[1800,235,"1","버스·택시로 도착",0,[1640,165]],[1350,110,"2","체크인 (2층)"],[900,150,"3","신원확인·보안검색 (3층)"],[540,125,"4","탑승구 (3층)"]],
  legend:null },
 icn_t1_dep:{ img:"img/airport/icn_t1_dep.webp?v=1027",
  floors:[],
  path:["M1760,905 L1640,900 L1460,850 L1380,690 L1360,640","M1830,560 L1720,600 L1460,622","M1440,625 L1290,560","M1260,565 L1020,602 L815,612","M815,612 L900,562","M892,556 L735,505","M722,510 L560,600 L342,532"],
  badge:[[1700,800,"1","공항철도로 도착",0,[1330,1050]],[1840,470,"1","버스·택시로 도착 (3층)",0,[1600,420]],[1300,470,"2","체크인"],[1000,545,"3","출국장·보안검색"],[880,455,"4","출국심사"],[630,440,"5","면세구역"],[430,665,"6","탑승구 (1~50번)"]],
  legend:null },
 icn_t2_dep:{ img:"img/airport/icn_t2_dep.webp?v=1027", vb:[2000,690],
  floors:[],
  path:["M1790,520 L1720,480 L1700,370 L1560,320","M1790,272 L1650,262 L1520,300","M1500,300 L1300,232","M1290,235 L1180,285 L940,285","M930,285 L770,240","M760,240 L650,182","M645,182 L520,235 L330,200"],
  badge:[[1720,560,"1","공항철도로 도착",0,[1420,640]],[1840,215,"1","버스·택시로 도착 (3층)",0,[1540,165]],[1300,150,"2","체크인"],[1060,222,"3","출국장·보안검색"],[770,175,"4","출국심사"],[600,110,"5","면세구역"],[440,300,"6","탑승구 (208~290번)"]],
  legend:null } };
function fig(k){ var F=FIG[k]; if(!F) return ""; var vb=F.vb||[2000,1116], s='<svg viewBox="0 0 '+vb[0]+' '+vb[1]+'" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="apAr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff5a0a"/></marker></defs>';
 F.floors.forEach(function(f){ s+='<g opacity="'+(f[2]?.45:1)+'"><rect x="24" y="'+(f[0]-34)+'" width="'+(f[1].length*34+40)+'" height="56" rx="12" fill="#fff" fill-opacity=".92"/><text x="44" y="'+(f[0]+6)+'" font-size="34" font-weight="800" fill="#17324d">'+esc(f[1])+'</text></g>'; });
 F.path.forEach(function(d){ s+='<path d="'+d+'" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/><path d="'+d+'" fill="none" stroke="#ff5a0a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#apAr)"/>'; });
 F.badge.forEach(function(b){ var r=b[4]?24:32, fs=b[2].length>1?(b[4]?20:24):32; s+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="'+r+'" fill="#ff5a0a" stroke="#fff" stroke-width="5"/><text x="'+b[0]+'" y="'+(b[1]+fs*0.36)+'" text-anchor="middle" font-size="'+fs+'" font-weight="900" fill="#fff">'+esc(b[2])+'</text>';
  var ln=String(b[3]||"").split("\n"), w=Math.max.apply(null,ln.map(function(q){ return q.length; })), lf=!b[5]&&b[3]&&b[0]+r+10+w*31>1990;   /* 오른쪽 끝을 넘으면 이름을 동그라미 왼쪽에 · b[5]=[x,y] 이름 자리 따로(여러 줄은 \n) */
  var lx=b[5]?b[5][0]:(lf?b[0]-r-10:b[0]+r+10), ly=b[5]?b[5][1]:b[1]+12;
  if(b[3]) s+='<text x="'+lx+'" y="'+ly+'"'+(lf?' text-anchor="end"':'')+' font-size="34" font-weight="900" fill="#17324d" stroke="#fff" stroke-width="9" paint-order="stroke" stroke-linejoin="round">'+ln.map(function(q,i){ return '<tspan x="'+lx+'" dy="'+(i?40:0)+'">'+esc(q)+'</tspan>'; }).join("")+'</text>'; });
 if(F.legend) s+='<text x="'+F.legend[0]+'" y="'+F.legend[1]+'" font-size="26" font-weight="800" fill="#17324d" stroke="#fff" stroke-width="7" paint-order="stroke">'+String(F.legend[2]).split("\n").map(function(q,i){ return '<tspan x="'+F.legend[0]+'" dy="'+(i?32:0)+'">'+esc(q)+'</tspan>'; }).join("")+'</text>';
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
