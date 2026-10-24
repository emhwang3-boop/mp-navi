/* 머니퍼즐 내비 — 「🏪 편의시설」·「🚑 긴급」 빠른 찾기 (사장님 2026-10-16)
 *  편의시설: 편의점(CS2)·마트(MT1) / 긴급: 병원(HP8)·약국(PM9) — 가까운 순 10곳. 한 곳 누르면 기존 검색 핀(spinShow) 그대로:
 *  약도(또는 자세한 지도)에 핀 + 카드(전화·길찾기·K.Ride·「나에게서 N km」) + 거리 재기. 핀은 카드 ✕ 로 지운다(기존 규칙)
 *  · 기준 위치: 「나」 위치 → 없으면 지금 보는 약도(자세한 지도) 가운데 → 그것도 없으면 위치 권한 요청
 *  · 자료: 허브 GET /kplace?cat=CS2&x=&y=&radius= (카카오 카테고리, navi 만, 좌표는 허브에서 100m 로 깎음). 거리는 화면에서 계산(위치는 안 남김)
 *  · 응급실 여부는 카카오가 안 줘서 표시 안 함 · 영업중 여부도 카카오가 안 줘서 생략
 *  · 긴급 맨 위: 119(응급) · 1330(한국관광공사 관광통역안내, 24시간 한·영·일·중 — 휴대폰은 지역번호+1330, 서울 02-1330 이라 +82-2-1330 으로 건다)
 *  · 누름 집계: ntap(cs2|mt1|hp8|pm9, "amenity"|"emergency") — 가게 이름은 안 보낸다
 *  index.html 은 <script src="near.js"> 한 줄뿐 — 전역(ME·DET·_nm·VIEW·CITY·ZM·ASP·meGeoInv·myPos·meSet·kmLL·spinShow·spinCard·telLine·ntap·T·esc·HUB)을 부른다
 */
(function(){
"use strict";
var KINDS={
  am:{e:"amenity", t:["🏪 편의시설","🏪 Convenience"], tabs:[{c:"CS2",ko:"편의점",en:"Convenience store",i:"🏪",r:1000},{c:"FD6",g:1,ko:"음식점",en:"Restaurant",i:"🍽",r:1500},{c:"FX",ko:"환전소",en:"Currency Exchange",i:"",r:2000},{c:"EMB",ko:"대사관",en:"Embassies",i:"",fixed:1}]},   // 편의시설은 풀다운 하나 (10-16) · 마트 → 음식점(구글, 별점) (사장님 10-21) · 환전소 = 허브 키워드 검색, 은행 뺌 · 여행사(구글 /gnear?type=travel_agency, 별점, 3→10→30km) — 계획 없이 온 손님이 근처 가이드 투어 찾기 (사장님 10-22)
  // 투어 가이드 (사장님 10-23) — 맨 앞 칩. Klook·GetYourGuide 링크만 (근처 여행사 목록은 아웃바운드라 뺌)
  tg:{e:"tour", t:["🧭 투어 가이드","🧭 Tour guide"], tabs:[{c:"TA",ko:"투어",en:"Tour",i:"🧭"}]},
  em:{e:"emergency", t:["🚑 긴급","🚑 Emergency"], tabs:[{c:"HP8",ko:"병원",en:"Hospital",i:"🏥",r:2000},{c:"PM9",ko:"약국",en:"Pharmacy",i:"💊",r:2000}]},
  // 숙소 (사장님 10-16) — 카카오 숙박(AD5)을 허브가 종류로 나눔 + 관광공사 관광정보에 실린 숙소는 kto=1 (「관광공사」 표시)
  st:{e:"stay", t:["🏨 숙소","🏨 Stay"], tabs:[{c:"AD5",kind:"hotel",ko:"호텔",en:"Hotel",i:"🏨",r:3000},{c:"AD5",kind:"motel",ko:"모텔",en:"Motel",i:"🛏",r:3000},{c:"AD5",kind:"gh",ko:"게스트하우스",en:"Guesthouse",i:"🎒",r:3000},{c:"AD5",kind:"hanok",ko:"한옥스테이",en:"Hanok stay",i:"🏯",r:3000}]},
  // 통역·길안내 (사장님 10-24) — 우리 가이드(관광통역안내사) 등록·매칭 판. 무료. 언어 고르기→승인된 가이드 목록→요청 (GoWithGuide 외부 링크 대신)
  ig:{e:"guide", t:["통역·길안내","Interpreter & guide"], tabs:[{c:"IG"}]}
};
// 칩 글자 (아이콘 없이, 사장님 10-16) · ⋮ 메뉴 글자
var CHIP={tg:["투어 가이드","Tour guide"],am:["편의시설","Convenience"],em:["긴급","Emergency"],st:["숙소","Stay"]};
var MENU={tg:["투어 가이드","Tour guide"],am:["🏪 편의시설 (편의점·음식점·환전소·대사관)","🏪 Convenience (stores · restaurants · exchange · embassies)"],em:["🚑 긴급 (병원·약국)","🚑 Emergency (hospital · pharmacy)"],st:["🏨 숙소 (호텔·모텔·게스트하우스·한옥)","🏨 Stay (hotel · motel · guesthouse · hanok)"]};
var MENU_ICON={tg:"mi_guide",am:"mi_amenity",em:"mi_emergency",st:"mi_stay"};   // ⋮ 메뉴 라벨 앞 그림 아이콘 (후보3, 사장님 10-23)
function miLbl(k){ var lbl=k==="tg"?LG6(TOURS6):T(MENU[k][0],MENU[k][1]).replace(/^[\u{1F000}-\u{1FAFF}☀-➿⬀-⯿️]+\s*/u,""); return '<img class="miic" src="img/menu/'+MENU_ICON[k]+'.png" alt="">'+esc(lbl); }
// 대사관 (사장님 10-16) — 고정 목록 37곳(G20·동남아·고용허가제 송출국). 나라 영문 이름 알파벳 순(거리로 줄 세우지 않음)
//  이름·주소·전화: 외교부 「주한공관주소록」 국문·영문판(mofa.go.kr inKoEmblgbdAdres, 2026-10-16 읽음) · 전화는 첫 번호만
//  좌표: 허브 /kplace 카카오 「<나라> 대사관」 자리(전화 또는 외교부 주소 검색 자리와 맞춘 것). 몽골은 카카오 자리와 외교부 주소가 580m 어긋나 좌표 비움(주소로 지도 검색)
var EMB=[
{"e":"Argentina","f":"AR","k":"아르헨티나","n":"주한 아르헨티나 대사관","ne":"Embassy of Argentina","a":"서울특별시 용산구 녹사평대로 206 천우빌딩 5층","ae":"5F, Chunwoo Bldg., 206, Noksapyeong-daero, Yongsan-gu, Seoul","t":"02-796-8144","y":37.536157,"x":126.987504},
{"e":"Australia","f":"AU","k":"호주","n":"주한 호주 대사관","ne":"Embassy of Australia","a":"서울특별시 종로구 종로1, 교보빌딩 19층","ae":"19F, Kyobo Bldg., Jong-ro 1, Jongno-gu, Seoul","t":"02-2003-0100","y":37.571331,"x":126.977895},
{"e":"Bangladesh","f":"BD","k":"방글라데시","n":"주한 방글라데시 대사관","ne":"Embassy of Bangladesh","a":"서울특별시 용산구 장문로6길 17","ae":"17, Jangmun-ro 6-gil, Yongsan-gu, Seoul","t":"02-796-4056","y":37.527723,"x":126.993042},
{"e":"Brazil","f":"BR","k":"브라질","n":"주한 브라질 대사관","ne":"Embassy of Brazil","a":"서울특별시 종로구 청와대로 73","ae":"73, Cheongwa-daero, Jongno-gu, Seoul","t":"02-738-4970","y":37.58157,"x":126.980428},
{"e":"Brunei","f":"BN","k":"브루나이","n":"주한 브루나이 대사관","ne":"Embassy of Brunei Darussalam","a":"서울특별시 종로구 자하문로 133","ae":"133, Jahamun-ro, Jongno-gu, Seoul","t":"02-790-1078","y":37.587846,"x":126.969117},
{"e":"Cambodia","f":"KH","k":"캄보디아","n":"주한 캄보디아 대사관","ne":"Embassy of Cambodia","a":"서울특별시 중구 세종대로 55, 부영태평빌딩 14층","ae":"14F. Booyoung Taepyeong Bldg, Sejongdaero 55, Jung-gu, Seoul","t":"02-3785-1041","y":37.561618,"x":126.974978},
{"e":"Canada","f":"CA","k":"캐나다","n":"주한 캐나다 대사관","ne":"Embassy of Canada","a":"서울특별시 중구 정동길 21","ae":"21, Jeongdong-gil, Jung-gu, Seoul","t":"02-3783-6000","y":37.566922,"x":126.970842},
{"e":"China","f":"CN","k":"중국","n":"주한 중국 대사관","ne":"Embassy of the People's Republic of China","a":"서울특별시 중구 명동2길 27","ae":"27, Myeongdong 2-gil, Jung-gu, Seoul","t":"02-771-9020","y":37.563068,"x":126.983011},
{"e":"European Union","f":"EU","k":"유럽연합","n":"주한 유럽연합 대표부","ne":"Delegation of the European Union to the Republic of Korea","a":"서울특별시 중구 한강대로 416 서울스퀘어 11층","ae":"11F, Seoul Square, 416 Hangang-daero, Jung-gu, Seoul","t":"02-3704-1701","y":37.555505,"x":126.973753},
{"e":"France","f":"FR","k":"프랑스","n":"주한 프랑스 대사관","ne":"Embassy of France","a":"서울특별시 서대문구 서소문로 43-12","ae":"43-12, Seosomun-ro, Seodaemun-gu, Seoul","t":"02-3149-4300","y":37.56128,"x":126.965004},
{"e":"Germany","f":"DE","k":"독일","n":"주한 독일 대사관","ne":"Embassy of Germany","a":"서울특별시 중구 한강대로 416 서울스퀘어 8층","ae":"8F, Seoul Square, 416, Hangang-daero, Jung-gu, Seoul","t":"02-748-4114","y":37.555209,"x":126.973982},
{"e":"India","f":"IN","k":"인도","n":"주한 인도 대사관","ne":"Embassy of India","a":"서울특별시 용산구 독서당로 101","ae":"101, Dokseodang-ro, Yongsan-gu, Seoul","t":"02-798-4257","y":37.535534,"x":127.011077},
{"e":"Indonesia","f":"ID","k":"인도네시아","n":"주한 인도네시아 대사관","ne":"Embassy of Indonesia","a":"서울특별시 영등포구 여의대방로 380","ae":"380, Yeouidaebang-ro, Yeongdeungpo-gu, Seoul","t":"02-2224-9000","y":37.518626,"x":126.931695},
{"e":"Italy","f":"IT","k":"이탈리아","n":"주한 이탈리아 대사관","ne":"Embassy of Italy","a":"서울특별시 용산구 한남대로 98 일신빌딩 3층","ae":"3F, Ilshin Building, 98 Hannamdae-ro, Yongsan-gu, Seoul","t":"02-750-0200","y":37.537434,"x":127.005236},
{"e":"Japan","f":"JP","k":"일본","n":"주한 일본 대사관","ne":"Embassy of Japan","a":"서울특별시 종로구 율곡로 6 트윈트리타워 A동 8층","ae":"8F, Twin Tree Tower A, 6, Yulgok-ro, Jongno-gu, Seoul","t":"02-2170-5200","y":37.575447,"x":126.979771},
{"e":"Kyrgyzstan","f":"KG","k":"키르기스스탄","n":"주한 키르기스스탄 대사관","ne":"Embassy of the Kyrgyz Republic","a":"서울특별시 종로구 자하문로 125-12","ae":"125-12, Jahamun-ro, Jongno-gu, Seoul","t":"02-379-0951","y":37.58726,"x":126.968706},
{"e":"Laos","f":"LA","k":"라오스","n":"주한 라오스 대사관","ne":"Embassy of the Lao PDR","a":"서울특별시 용산구 대사관로11길 30-4","ae":"30-4, Daesagwan-ro 11-gil, Yongsan-gu, Seoul","t":"02-796-1713","y":37.534915,"x":127.002046},
{"e":"Malaysia","f":"MY","k":"말레이시아","n":"주한 말레이시아 대사관","ne":"Embassy of Malaysia","a":"서울특별시 용산구 독서당로 129","ae":"129, Dokseodang-ro, Yongsan-gu, Seoul","t":"02-2077-8600","y":37.537858,"x":127.01217},
{"e":"Mexico","f":"MX","k":"멕시코","n":"주한 멕시코 대사관","ne":"Embassy of Mexico","a":"서울특별시 종로구 율곡로 6, 트윈트리타워 B동 17층","ae":"17F, Twin Tree Tower B, 6, Yulgok-ro, Jongno-gu, Seoul","t":"02-6111-1600","y":37.575483,"x":126.980502},
{"e":"Mongolia","f":"MN","k":"몽골","n":"주한 몽골 대사관","ne":"Embassy of Mongolia","a":"서울특별시 용산구 대사관로34길 41","ae":"41, Daesagwan-ro 34-gil, Yongsan-gu, Seoul","t":"02-798-3464"},
{"e":"Myanmar","f":"MM","k":"미얀마","n":"주한 미얀마 대사관","ne":"Embassy of Myanmar","a":"서울특별시 용산구 한남대로28길 12","ae":"12, Hannam-daero 28-gil, Yongsan-gu, Seoul","t":"02-790-3814","y":37.538234,"x":127.005286},
{"e":"Nepal","f":"NP","k":"네팔","n":"주한 네팔 대사관","ne":"Embassy of Nepal","a":"서울특별시 성북구 선잠로2길 19","ae":"19, Seonjam-ro 2-gil, Seongbuk-gu, Seoul","t":"02-3789-9770","y":37.595433,"x":126.99906},
{"e":"Pakistan","f":"PK","k":"파키스탄","n":"주한 파키스탄 대사관","ne":"Embassy of Pakistan","a":"서울특별시 강남구 도산대로 169","ae":"169, Dosan-daero, Gangnam-gu, Seoul","t":"02-796-8252","y":37.519593,"x":127.026877},
{"e":"Philippines","f":"PH","k":"필리핀","n":"주한 필리핀 대사관","ne":"Embassy of the Philippines","a":"서울특별시 용산구 회나무로 80","ae":"80, Hoenamu-ro, Yongsan-gu, Seoul","t":"02-788-2100","y":37.540609,"x":126.995397},
{"e":"Russia","f":"RU","k":"러시아","n":"주한 러시아 대사관","ne":"Embassy of the Russian Federation","a":"서울특별시 중구 서소문로11길 43","ae":"43, Seosomun-ro 11gil, Jung-gu, Seoul","t":"02-318-2116","y":37.56503,"x":126.971895},
{"e":"Saudi Arabia","f":"SA","k":"사우디아라비아","n":"주한 사우디아라비아 대사관","ne":"Embassy of Saudi Arabia","a":"서울특별시 용산구 녹사평대로26길 37","ae":"37, Noksapyeong-daero 26-gil, Yongsan-gu, Seoul","t":"02-2022-7400","y":37.531681,"x":126.99166},
{"e":"Singapore","f":"SG","k":"싱가포르","n":"주한 싱가포르 대사관","ne":"Embassy of Singapore","a":"서울특별시 중구 세종대로 136 서울파이낸스센터 28층","ae":"28F, Seoul Finance Center, 136, Sejong-daero, Jung-gu, Seoul","t":"02-774-2464","y":37.568509,"x":126.978312},
{"e":"South Africa","f":"ZA","k":"남아공","n":"주한 남아프리카공화국 대사관","ne":"Embassy of the Republic of South Africa","a":"서울특별시 용산구 독서당로 104","ae":"104, Dokseodang-ro, Yongsan-gu, Seoul","t":"02-2077-5900","y":37.53566,"x":127.011622},
{"e":"Sri Lanka","f":"LK","k":"스리랑카","n":"주한 스리랑카 대사관","ne":"Embassy of Sri Lanka","a":"서울특별시 중구 동호로10길 39","ae":"39, Dongho-ro 10-gil, Jung-gu, Seoul","t":"02-735-2966","y":37.555637,"x":127.012309},
{"e":"Tajikistan","f":"TJ","k":"타지키스탄","n":"주한 타지키스탄 대사관","ne":"Embassy of Tajikistan","a":"서울특별시 용산구 유엔빌리지길 37","ae":"37, UN village-gil, Yongsan-gu, Seoul","t":"02-792-2535","y":37.53348,"x":127.010861},
{"e":"Thailand","f":"TH","k":"태국","n":"주한 태국 대사관","ne":"Embassy of Thailand","a":"서울특별시 용산구 대사관로 42","ae":"42, Daesagwan-ro, Yongsan-gu, Seoul","t":"02-795-0095","y":37.533397,"x":127.002851},
{"e":"Timor-Leste","f":"TL","k":"동티모르","n":"주한 동티모르 대사관","ne":"Embassy of Timor-Leste","a":"서울특별시 마포구 성미산로10길 26","ae":"26, Seongmisan-ro 10-gil, Mapo-gu, Seoul","t":"02-797-6151","y":37.558308,"x":126.915219},
{"e":"Türkiye","f":"TR","k":"튀르키예","n":"주한 튀르키예 대사관","ne":"Embassy of Türkiye","a":"서울특별시 중구 동호로20나길 40, 해동빌딩","ae":"Haedong bldg., 40, Dongho-ro 20na-gil, Jung-gu, Seoul","t":"02-3780-1600","y":37.560222,"x":127.006893},
{"e":"United Kingdom","f":"GB","k":"영국","n":"주한 영국 대사관","ne":"Embassy of the United Kingdom","a":"서울특별시 중구 세종대로 19길 24","ae":"24, Sejong-daero 19-gil, Jung-gu, Seoul","t":"02-3210-5500","y":37.566905,"x":126.975075},
{"e":"USA","f":"US","k":"미국","n":"주한 미국 대사관","ne":"Embassy of the United States of America","a":"서울특별시 종로구 세종대로 188","ae":"188 Sejong-daero, Jongno-gu, Seoul","t":"02-397-4114","y":37.573198,"x":126.977831},
{"e":"Uzbekistan","f":"UZ","k":"우즈베키스탄","n":"주한 우즈베키스탄 대사관","ne":"Embassy of Uzbekistan","a":"서울특별시 종로구 돈화문로11가길 99","ae":"99 Donhwamun-ro 11ga-gil, Jongno-gu, Seoul","t":"02-574-6554","y":37.576902,"x":126.989785},
{"e":"Vietnam","f":"VN","k":"베트남","n":"주한 베트남 대사관","ne":"Embassy of Viet Nam","a":"서울특별시 종로구 북촌로 123","ae":"123, Bukchon-ro, Jongno-gu, Seoul","t":"02-720-5124","y":37.586494,"x":126.983936}
];
var S={k:"",tab:0,base:null,src:"",items:null,err:""}, CACHE={}, PICK=null;
function L(){ return window.LANG!=="ko"; }   // 외국어 화면(영·일·중) — 10-18
function LG6(o){ return o[window.LANG]||o.en; }   // 통역·길안내 새 문구는 6개 언어를 바로 넣는다(i18n.js 안 건드림, 10-24)
// 「투어·입장권 / Tours & tickets」 (사장님 10-24) — 옛 「투어 가이드」. 내용(Klook·GetYourGuide·Creatrip)은 그대로, 이름만 6개 언어로
var TOURS6={ko:"투어·입장권",en:"Tours & tickets",ja:"ツアー・チケット",zhs:"旅游·门票",zht:"旅遊·門票",es:"Tours y entradas"};
// 「투어 가이드」 칩 글자 (사장님 10-24) — 맨 앞 칩. 누르면 통역·길안내(ig) 가이드 매칭 판이 열린다
var IG_CHIP6={ko:"투어 가이드",en:"Tour guide",ja:"ツアーガイド",zhs:"旅游向导",zht:"旅遊嚮導",es:"Guía turístico"};
// 빨간·파란 단추 안 전화기 — 흰 선 그림(글자색 그대로, 사장님 10-16: 이모지는 분홍빛이라)
var PH='<svg class="nrph" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function km(m){ return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"; }

function css(){ if(document.getElementById("nrCss")) return; var s=document.createElement("style"); s.id="nrCss";
  s.textContent="#gfchips .nrchip{display:inline-block;width:auto;margin:0;border:1.5px solid #1971c2;background:#e7f5ff;color:#1864ab;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:none}"
  +"#gfchips .nrchip.em{border-color:#e03131;background:#fff5f5;color:#c92a2a}"
  +".nrlock,.nrlock body{overflow:hidden}#nrBox{position:fixed;inset:0;z-index:1036;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}"
  +"#nrBox .nrin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px;box-sizing:border-box}"
  +".nrtop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin-bottom:8px}.nrx{width:34px;height:34px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}"
  +".nrsos{display:flex;gap:8px;margin:0 0 10px}.nrsos a{flex:1;display:block;text-align:center;text-decoration:none;border-radius:12px;padding:10px 6px;font-weight:900;font-size:15px;line-height:1.25}"
  +".nrsos a small{display:block;font-size:11.5px;font-weight:700;opacity:.85}.nrsos .s119{background:#e03131;color:#fff}.nrsos .s1330{background:#1971c2;color:#fff}"
  +".nrtabs{display:flex;gap:8px;margin:0 0 8px}.nrtab{flex:1;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:9px 6px;font-size:15px;font-weight:800;cursor:pointer}"
  +".nrtab.on{border-color:#1971c2;background:#e7f5ff;color:#1864ab}.nrem .nrtab.on{border-color:#e03131;background:#fff5f5;color:#c92a2a}"
  +".nrbase{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--sub);font-size:12.5px;margin:2px 2px 6px}.nrme{border:1px solid #1a73e8;background:none;color:#1a73e8;border-radius:999px;padding:3px 10px;font-size:12.5px;font-weight:800;cursor:pointer}"
  +".nrit{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0;cursor:pointer}"
  +".nrit .h{display:flex;align-items:baseline;gap:6px}.nrit .h b{flex:1;font-size:15.5px}.nrit .h i{font-style:normal;color:#1a73e8;font-weight:900;font-size:14px;white-space:nowrap}"
  +".nrit .ko{color:var(--sub);font-size:12.5px;margin-top:1px}.nrit .d{color:var(--sub);font-size:12.5px;margin-top:2px;line-height:1.45}"
  +".nrit .row{display:flex;align-items:center;gap:8px;margin-top:6px}.nrit .row .go{margin-left:auto;color:#1a73e8;font-weight:800;font-size:13px;white-space:nowrap}"
  +".nrtel{color:var(--ink);font-weight:800;font-size:14px;text-decoration:none}"
  +".nrcall{display:inline-block;background:#e03131;color:#fff!important;border-radius:10px;padding:8px 16px;font-size:16px;font-weight:900;text-decoration:none}"
  +".nrcall.am{background:#1971c2}"
  +".nrkto{display:inline-block;border:1px solid #2f9e44;color:#2b8a3e;border-radius:6px;font-size:11px;font-weight:900;padding:0 5px;margin-left:5px;vertical-align:2px;white-space:nowrap}"
  +".nrst .nrtab.on{border-color:#7048e8;background:#f3f0ff;color:#5f3dc4}.nrst .nrrank{background:#7048e8}#gfchips .nrchip.st{border-color:#7048e8;background:#f3f0ff;color:#5f3dc4}#gfchips .nrchip.tg,#gfchips .nrchip.ig{border-color:#0c8599;background:#e3fafc;color:#0b7285}"
  +".nrtabs{flex-wrap:wrap}.nrst .nrtab{flex:1 1 40%}"
  +".nrbook,.item a.nrbook{display:inline-block!important;background:#7048e8!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:7px 16px!important;font-size:14px!important;font-weight:900!important;margin:2px 0 8px!important;cursor:pointer}"
  +"#nrBk{position:fixed;inset:0;z-index:1040;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center}#nrBk .in{background:var(--card);color:var(--ink);width:100%;max-width:480px;border-radius:16px 16px 0 0;padding:14px 16px 22px;box-sizing:border-box}"
  +"#nrBk .h{font-weight:900;font-size:16px;margin:0 0 4px}#nrBk .s{color:var(--sub);font-size:12.5px;margin:0 0 10px}#nrBk a{display:block;text-align:center;text-decoration:none;border:1.5px solid var(--line);border-radius:12px;padding:12px;margin:8px 0;font-weight:900;font-size:15.5px;color:var(--ink);background:var(--bg)}"
  +"#nrBk button{width:100%;border:0;background:none;color:var(--sub);font-size:14px;padding:10px;cursor:pointer}"
  +".nrrank{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#1971c2;color:#fff;font-size:12px;text-align:center;vertical-align:1px}.nrem .nrrank{background:#e03131}"
  +".nrsel{display:block;width:100%;margin:0 0 8px;border:1.5px solid #1971c2;background:#e7f5ff;color:#1864ab;border-radius:12px;padding:10px 12px;font-size:16px;font-weight:800;cursor:pointer;min-height:44px}"
  +".nremb{cursor:default}.nremb .c{color:#1864ab;font-size:12.5px;font-weight:900;margin-bottom:2px}.nremb .lks{margin-top:8px}"
  +".nremb .lks a{display:inline-block;margin:0 6px 6px 0;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:5px 11px;font-size:13px;font-weight:700;color:var(--ink);background:#f8fafc}"
  +".nrph{display:inline-block;width:1em;height:1em;vertical-align:-0.14em;margin-right:5px;color:inherit}"
  +".nrdt{display:inline-block;border:1px solid #e8590c;color:#d9480f;border-radius:6px;font-size:11px;font-weight:900;padding:0 5px;margin-left:5px;vertical-align:2px;white-space:nowrap}"
  +".nrtg{margin:10px 0;padding:12px 14px;border:1px solid #c5d3e8;background:#fff;border-radius:12px}.nrtg a{display:inline-block;font-size:19px;font-weight:900;color:#1c5fb8;text-decoration:none;margin-bottom:4px}.nrtg .d{font-size:14.5px;color:#444;line-height:1.6}"
  +".nrtb{margin:8px 0 4px;padding:8px 10px;border:1px solid #ffd8a8;background:#fff4e6;border-radius:10px;font-size:14px;font-weight:800;color:#5c3d10;line-height:1.5}.nrtb a{color:#1c5fb8;text-decoration:underline;margin:0 2px;white-space:nowrap}"
  +".nrord{display:flex;gap:6px;margin:8px 0 2px}.nrord button{flex:1;border:1px solid #c5d3e8;background:#fff;color:#1c5fb8;border-radius:999px;padding:7px 0;font-weight:800;font-size:14px}.nrord button.on{background:#1c5fb8;color:#fff;border-color:#1c5fb8}"
  +".nrbig,.item a.nrbig{display:block!important;text-align:center;background:#e03131!important;color:#fff!important;border:0!important;border-radius:12px!important;padding:12px 8px!important;font-size:18px!important;font-weight:900!important;text-decoration:none;margin:4px 0 10px!important}"
  +".ignote{background:#e3fafc;border:1px solid #99e9f2;color:#0b7285;border-radius:12px;padding:12px 14px;font-size:14px;font-weight:700;line-height:1.5;margin:4px 0 14px}"
  +".iglbl{font-size:13px;color:var(--sub);font-weight:800;margin:0 2px 8px}"
  +".iglangs{display:flex;flex-direction:column;gap:9px}"
  +".iglangs a.iglang{display:block;text-align:center;text-decoration:none;border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:12px;padding:13px 10px;font-size:16px;font-weight:900}"
  +".igbook{margin:16px 2px 4px;padding:10px 12px;border:1px solid #ffd8a8;background:#fff4e6;border-radius:10px;font-size:14px;font-weight:800;color:#5c3d10;line-height:1.5}"
  +".ignt{font-size:12.5px;color:var(--sub);line-height:1.5;margin:10px 2px 0}"
  +".igback{border:0;background:none;color:#0b7285;font-size:14px;font-weight:800;padding:4px 0;margin:2px 0 4px;cursor:pointer}"
  +".igcard{display:flex;gap:11px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:9px 0;cursor:pointer}"
  +".igav{width:56px;height:56px;border-radius:12px;object-fit:cover;flex:0 0 auto;background:#e3fafc}.igav.igavx{display:flex;align-items:center;justify-content:center;font-size:26px}"
  +".igcard .igb{flex:1;min-width:0}.igcard .igb b{font-size:15.5px}.igm{color:var(--sub);font-size:12.5px;margin-top:2px}.igi{color:var(--ink);font-size:13px;margin-top:4px;line-height:1.45}"
  +".igpk{display:inline-block;margin-top:6px;color:#0c8599;font-weight:800;font-size:13px}"
  +".iglb{display:block;font-size:13px;color:var(--sub);font-weight:700;margin:10px 2px 3px}"
  +".igin{width:100%;box-sizing:border-box;font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:10px;padding:10px 11px}"
  +".igchk{display:flex;gap:7px;align-items:flex-start;font-size:13px;color:var(--ink);margin:12px 2px 0;line-height:1.5}.igchk input{width:18px;height:18px;margin-top:1px;flex:0 0 auto}";
  document.head.appendChild(s); }

// ── 기준 위치 ──
function mapCenter(){ try{
    if(window.DET&&window._nm){ var c=_nm.getCenter(); return [c.lat(),c.lng()]; }
    if(VIEW&&VIEW!=="kr"&&CITY[VIEW]){ var m=document.getElementById("map"), w=m.clientWidth, h=m.clientHeight||w, as=ASP(), iw=w*as*ZM.s, ih=w*ZM.s; return meGeoInv(VIEW,(w/2-ZM.tx)/iw,(h/2-ZM.ty)/ih); }
  }catch(e){} return null; }
function pickBase(force){
  if(ME.pos&&!force) return Promise.resolve({p:ME.pos,src:"me"});
  var c=force?null:mapCenter(); if(c) return Promise.resolve({p:c,src:"map"});
  return myPos().then(function(p){ if(p){ try{ if(!ME.pos) meSet(p); }catch(e){} return {p:p,src:"me"}; } return null; }); }

// ── 자료 ──
// 음식점 (사장님 10-21) — 허브 /gnear(구글 근처 음식점, 별점 포함). 차례 = 가까운 곳 먼저, 거리가 비슷하면(200m 안쪽 같은 칸) 리뷰 10개 이상인 곳 먼저(사장님 10-21) → 별점 높은 순 → 리뷰 많은 순
function sortIt(it,t){ if(!t.g) return it.sort(function(a,c){ return a.dist-c.dist; });
  if(S.ord==="r") return it.sort(function(a,c){ var ta=(a.n||0)>=10?1:0, tc=(c.n||0)>=10?1:0; if(ta!==tc) return tc-ta; if((c.rating||0)!==(a.rating||0)) return (c.rating||0)-(a.rating||0); if((c.dt||0)!==(a.dt||0)) return (c.dt||0)-(a.dt||0); if((c.n||0)!==(a.n||0)) return (c.n||0)-(a.n||0); return a.dist-c.dist; });   // 「별점순」 (사장님 10-21) — 구글 별점 높은 순, 리뷰 10개 미만은 뒤로
  return it.sort(function(a,c){ var ba=Math.floor(a.dist/200), bc=Math.floor(c.dist/200); if(ba!==bc) return ba-bc; var ta=(a.n||0)>=10?1:0, tc=(c.n||0)>=10?1:0; if(ta!==tc) return tc-ta; if((c.rating||0)!==(a.rating||0)) return (c.rating||0)-(a.rating||0); if((c.dt||0)!==(a.dt||0)) return (c.dt||0)-(a.dt||0); if((c.n||0)!==(a.n||0)) return (c.n||0)-(a.n||0); return a.dist-c.dist; }); }
function fetchKind(t,p){ if(t.g){ var gk="g|"+(t.gt||"")+"|"+p[0].toFixed(3)+","+p[1].toFixed(3)+"|"+LANG; if(CACHE[gk]) return CACHE[gk];
    return CACHE[gk]=fetch(HUB+"/gnear?lat="+p[0].toFixed(5)+"&lng="+p[1].toFixed(5)+"&lang="+encodeURIComponent(LANG)+(t.gt?"&type="+t.gt:"")).then(function(x){ return x.json(); }).then(function(j){ if(!j||!j.ok) throw new Error((j&&j.err)||"fail"); var a=j.items||[]; a.r=+j.r||t.r; return a; }).catch(function(e){ delete CACHE[gk]; throw e; }); }
  var en=kpL(), key=t.c+(t.kind||"")+"|"+p[0].toFixed(3)+","+p[1].toFixed(3)+en, need=t.c==="HP8"||t.c==="PM9"?10:3;
  var cnt=function(j){ return ((j&&j.items)||[]).filter(function(x){ return !t.kind||x.kind===t.kind; }).length; };
  if(CACHE[key]) return CACHE[key];
  var one=function(r){ return fetch(HUB+"/kplace?cat="+t.c+"&x="+p[1].toFixed(5)+"&y="+p[0].toFixed(5)+"&radius="+r+en).then(function(x){ return x.json(); }); };
  return CACHE[key]=one(t.r).then(function(j){ if(j&&j.ok&&cnt(j)>=need) return j; return one(10000); }).then(function(j){
    if(!j||!j.ok) throw new Error((j&&j.err)||"fail"); return (j.items||[]).filter(function(x){ return !t.kind||x.kind===t.kind; }); },function(e){ delete CACHE[key]; throw e; })
    .then(function(a){ return (t.kind==="hanok"&&!a.length)?hanokFar(p,a):a; })
    // 숙소(AD5) = 구글 별점 높은 순 → 같으면 가까운 순 (사장님 10-23)
    .then(function(a){ if(a.far||!/^AD5$/.test(t.c)||!a.length||!window.gRate) return a; var f=a.far; return stayRate(t,p,a).then(function(b){ b.far=f; return b; }); }).catch(function(e){ delete CACHE[key]; throw e; }); }
// 숙소 구글 별점 — 「종로구 호텔」처럼 그 동네 구 이름 + 종류로 구글을 한 번 받아, 카카오 숙소에 ★ 를 붙이고 카카오에 없는 10km 안 구글 숙소도 더한다 (사장님 10-23)
function stayRate(t,p,a){ var cnt={}, gu=""; a.forEach(function(x){ var w=String(x.addr||"").split(/\s+/)[1]||""; if(/[구군시]$/.test(w)) cnt[w]=(cnt[w]||0)+1; });
  Object.keys(cnt).forEach(function(k){ if(!gu||cnt[k]>cnt[gu]) gu=k; });
  var b=a.map(function(x){ var o=Object.assign({},x); o.dist=Math.round(kmLL(p,[+x.y,+x.x])*1000); return o; });
  return fetch(HUB+"/gplace?all=1&lang=ko&q="+encodeURIComponent((gu?gu+" ":"")+t.ko)+"&lat="+p[0].toFixed(5)+"&lng="+p[1].toFixed(5)).then(function(r){ return r.json(); }).then(function(j){ var g=(j&&j.ok&&j.items)||[], used={};
    b.forEach(function(x){ var nb=spinNorm(x.name), best=-1, bd=1e9; if(!nb) return;
      g.forEach(function(q,i){ var n=spinNorm(q.name); if(!n) return; var d=kmLL([+x.y,+x.x],[+q.lat,+q.lng]); if(d>0.2||d>=bd) return;
        if(n.indexOf(nb)>=0||nb.indexOf(n)>=0||(nb.length>=3&&n.slice(0,3)===nb.slice(0,3))){ bd=d; best=i; } });
      if(best>=0){ used[best]=1; if(g[best].rating){ x.rating=+g[best].rating; x.n=+g[best].n||0; } } });
    g.forEach(function(q,i){ if(used[i]||!q.rating) return; var d=kmLL(p,[+q.lat,+q.lng]); if(d>10) return;
      b.push({gid:q.id,name:q.name,addr:q.addr,x:q.lng,y:q.lat,rating:+q.rating,n:+q.n||0,kind:t.kind,cat:t.ko,cat_en:t.en,dist:Math.round(d*1000)}); });
    if(LANG==="ko"||!b.some(function(x){ return x.gid; })) return b;   // 외국어 화면: 구글에서 더한 곳은 그 언어 이름으로 한 번 더 받는다
    return fetch(HUB+"/gplace?all=1&lang="+encodeURIComponent(LANG)+"&q="+encodeURIComponent((gu?gu+" ":"")+t.ko)+"&lat="+p[0].toFixed(5)+"&lng="+p[1].toFixed(5)).then(function(r){ return r.json(); }).then(function(j2){ var m={};
      ((j2&&j2.ok&&j2.items)||[]).forEach(function(q){ m[q.id]=q; }); b.forEach(function(x){ var q=x.gid&&m[x.gid]; if(q){ x.name_en=q.name; x.addr_en=q.addr; } }); return b; }).catch(function(){ return b; });
  }).catch(function(){ return b; }); }
// 한옥스테이가 10km 안에 없으면 — 멀어도 구글 별점 높은 한옥스테이 (허브 /gplace, 별점 4.0·리뷰 20개 이상만, 사장님 10-23) · 40km 안 먼저, 그 안에서 별점 높은 순. 못 받으면 빈 목록 그대로
function hanokFar(p,a0){ return fetch(HUB+"/gplace?q="+encodeURIComponent("한옥스테이")+"&lat="+p[0].toFixed(5)+"&lng="+p[1].toFixed(5)+"&lang="+encodeURIComponent(LANG)).then(function(x){ return x.json(); }).then(function(j){
    if(!j||!j.ok||!(j.items||[]).length) return a0;
    var a=j.items.map(function(g){ return {name:g.name,addr:g.addr,x:g.lng,y:g.lat,rating:g.rating,n:g.n,kind:"hanok"}; })
      .sort(function(u,v){ var fu=kmLL(p,[u.y,u.x])>40?1:0, fv=kmLL(p,[v.y,v.x])>40?1:0; return (fu-fv)||(v.rating-u.rating)||(v.n-u.n); }); a.far=1; return a; }).catch(function(){ return a0; }); }
function load(){ var k=KINDS[S.k], t=k.tabs[S.tab]; S.items=null; S.err=""; S.byL={}; S.fl=""; S.gr=0;
  if(S.k==="ig"){ IG={view:"pick",lang:"",guides:null,gid:null,gobj:null,err:"",busy:false,done:false}; S.items=[]; S.base=null; paint(); return; }   // 통역·길안내 = 가이드 매칭 판, 위치·목록 없음 (10-24)
  if(S.k==="tg"){ S.items=[]; paint(); pickBase(false).then(function(b){ if(S.k!=="tg") return; S.base=b?b.p:null; paint(); },function(){}); return; }   // 투어 가이드 = Klook·GetYourGuide 링크만 (근처 여행사는 아웃바운드라 뺌, 사장님 10-23). 위치는 가까운 도시 이름에만
  if(t.fixed){ var mp=ME.pos||null; S.base=null; S.src="";   // 대사관: 고정 목록 · 위치를 묻지 않는다 · 「나」 위치가 있으면 거리만 (폰 안에서 계산)
    S.items=EMB.map(function(x){ var o=Object.assign({},x); o.dist=(mp&&x.y)?Math.round(kmLL(mp,[x.y,x.x])*1000):null; return o; }); if(embL()) S.items.sort(function(a,b){ return embKey(a).localeCompare(embKey(b),{ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]); }); paint(); return; }
  paint();
  var my=S.k+S.tab+LANG;
  pickBase(false).then(function(b){ if(!b){ S.base=null; S.err="loc"; paint(); return; }
    S.base=b.p; S.src=b.src; paint();
    return fetchKind(t,b.p).then(function(it){ if(S.k+S.tab+LANG!==my) return;
      S.gr=it.r||t.r; S.raw=it.map(function(x){ var o=Object.assign({},x); o.dist=Math.round(kmLL(b.p,[+x.y,+x.x])*1000); return o; }); S.far=!!it.far; it=(it.far?S.raw.slice():S.k==="st"?rateSort(S.raw.slice()):sortIt(S.raw.slice(),t)).slice(0,10);
      S.items=it; S.fl=LANG; S.byL[LANG]=it; paint(); }); }).catch(function(){ S.err="net"; paint(); }); }
// 언어를 바꿀 때 — 목록을 비우지 않고 그 자리에서 (한국어 = 받은 이름 그대로, 그 언어로 받아 둔 게 있으면 그것, 처음 가는 외국어만 같은 자리로 다시 받음, 10-18)
function relang(){ var k=KINDS[S.k]; if(!k) return; if(S.k==="ig"){ paint(); return; } var t=k.tabs[S.tab];
  if(t.fixed||!S.items||!S.base||S.err) return load();
  S.byL=S.byL||{}; if(!L()||S.fl===LANG){ paint(); return; }
  if(S.byL[LANG]){ S.items=S.byL[LANG]; S.fl=LANG; paint(); return; }
  paint(); var my=S.k+S.tab+LANG, b=S.base; try{ if(window.KL&&KL.bz) KL.bz(1); }catch(e){}
  fetchKind(t,b).then(function(it){ if(S.k+S.tab+LANG!==my) return; S.gr=it.r||t.r; S.raw=it.map(function(x){ var o=Object.assign({},x); o.dist=Math.round(kmLL(b,[+x.y,+x.x])*1000); return o; }); S.far=!!it.far; it=(it.far?S.raw.slice():S.k==="st"?rateSort(S.raw.slice()):sortIt(S.raw.slice(),t)).slice(0,10);
    S.items=it; S.fl=LANG; S.byL[LANG]=it; paint(); }).catch(function(){}).then(function(){ try{ if(window.KL&&KL.bz) KL.bz(-1); }catch(e){} }); }

// ── 화면 ──
function open(k){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  if(S.k!==k){ S.tab=0; } S.k=k;
  var o=document.getElementById("nrBox"); if(!o){ o=document.createElement("div"); o.id="nrBox"; o.innerHTML='<div class="nrin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("nrlock"); o.scrollTop=0; load(); }
function close(){ var o=document.getElementById("nrBox"); if(o) o.remove(); document.documentElement.classList.remove("nrlock"); }
function sos(){ return '<div class="nrsos"><a class="s119" href="tel:119">'+PH+T("응급 119","Emergency 119")+'<small>'+T("구급·화재","Ambulance · Fire")+'</small></a>'
  +'<a class="s1330" href="tel:+82-2-1330">'+PH+'1330<small>'+T("관광통역안내 (24시간)","Travel helpline · English 24h")+'</small></a></div>'; }
function itemHtml(x,i,em){ var en=L()&&x.name_en, nm=KS(en?x.name_en:x.name), ad=en?(x.addr_en||x.addr):x.addr, ct=en?(x.cat_en||""):String(x.cat||"").split(">").pop().trim();
  var tel=""; if(x.tel){ var shown=L()?(/^0/.test(x.tel)?"+82 "+x.tel.slice(1):"+82 "+x.tel):x.tel;
    tel=em?'<a class="nrcall" href="tel:'+esc(telIntl(x.tel))+'">'+PH+T("전화","Call")+'</a> <span class="d">'+esc(shown)+'</span>':'<a class="nrcall am" href="tel:'+esc(telIntl(x.tel))+'">'+PH+T("전화","Call")+'</a> <span class="d">'+esc(shown)+'</span>'; }   // 편의점·마트도 같은 흰 전화기 단추 (파랑)
  return '<div class="nrit" data-nr="pick" data-i="'+i+'"><div class="h"><span class="nrrank">'+(i+1)+'</span><b>'+esc(nm)+(x.kto?'<span class="nrkto" title="'+T("한국관광공사 관광정보에 실린 숙소","Listed by the Korea Tourism Organization")+'">'+T("관광공사","KTO")+'</span>':'')+(x.dt?'<span class="nrdt">'+T("🎟 당일 투어","🎟 Day tour")+'</span>':'')+'</b><i>'+km(x.dist)+'</i></div>'
    +(en&&x.name_en!==x.name?'<div class="ko">'+esc(x.name)+'</div>':'')+(x.rating?'<div class="d"><b style="color:#e8590c">★ '+x.rating.toFixed(1)+'</b> ('+x.n+')</div>':'')+'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+'</div>'
    +'<div class="row">'+tel+'<span class="go">'+T("지도에 핀","Pin on map")+' ›</span></div></div>'; }
// 「📱 내일 투어를 바로 예약」 띠 (사장님 10-22) — 기준 위치(내 위치·지도 가운데)에서 가까운 도시의 당일 투어 검색. 제휴 코드 없음 · 새 창
//  Klook 언어 = 주소 앞 /ko/·/ja/·/zh-CN/·/zh-TW/·/es/·/en-US/ · GetYourGuide = /ja-jp/·/zh-cn/·/es-es/ (한국어·번체는 그런 주소가 없어 브라우저 언어로)
var TB_CITY=[["Seoul",37.5665,126.978,40],["Incheon",37.456,126.705,20],["Busan",35.1796,129.0756,35],["Jeju",33.38,126.55,70],["Gyeongju",35.856,129.225,25],["Jeonju",35.82,127.148,20],["Gangneung",37.752,128.876,25],["Sokcho",38.207,128.592,20],["Daegu",35.871,128.601,25],["Yeosu",34.76,127.662,25]];
// 투어 가이드 창 (사장님 10-23) — 폰 그림·노란 띠 없이 Klook·GetYourGuide 링크(첫 화면, 그 언어)와 설명 세 줄씩. 손님이 그 사이트 검색칸에 도시를 넣는다
function tgHtml(){ var kl={ko:"ko",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en-US", gl={ja:"ja-jp/",zhs:"zh-cn/",es:"es-es/"}[LANG]||"";
  var ds='<div class="d">'+T("당일 투어 가능","Day tours available")+'</div><div class="d">'+T("내일 투어 예약 가능","Book tomorrow’s tour")+'</div><div class="d">'+T("검색창에 가고 싶은 도시 입력 (예: 서울)","Type the city you want in the search box (e.g. Seoul)")+'</div>';
  var one=function(u,nm){ return '<div class="nrtg"><a href="'+u+'" target="_blank" rel="noopener">'+nm+' ›</a>'+ds+'</div>'; };
  var cl={ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en";   // 크리에이트립 (사장님 10-23) — 한국어판은 없어 영어로 연다
  return one("https://www.klook.com/"+kl+"/","Klook")+one("https://www.getyourguide.com/"+gl,"GetYourGuide")+one("https://creatrip.com/"+cl,"Creatrip"); }
// 통역·길안내 (사장님 10-24) — 우리 가이드(관광통역안내사) 등록·매칭. 무료. GoWithGuide 외부 링크 대신 우리 목록.
//   손님: 언어 고르기 → 승인된 가이드 목록(사진·이름·언어·경력·지역·소개) → 한 명 골라 요청(이름·연락처·날짜·메모) → 가이드 이메일 + 우리 텔레그램
//   가이드 등록은 「입점 문의」 빌딩 → 「관광 가이드 등록」(window.GUIDEREG) · 승인은 통계청(관리자)
var GLANG6=[["한국어","ko"],["English","en"],["日本語","ja"],["中文(简)","zhs"],["中文(繁)","zht"],["Español","es"]];
var IG={view:"pick",lang:"",guides:null,gid:null,gobj:null,err:"",busy:false,done:false};
function igNote(){ return LG6({ko:"실제 통역·길안내를 해 주는 사람(관광통역안내사)을 연결해 드립니다. (소개이며 중개가 아닙니다)",
  en:"We connect you with a real licensed interpreter-guide. (introduction only, not a broker)",
  ja:"実際に通訳・道案内をしてくれる人（通訳案内士）をおつなぎします。（紹介であり仲介ではありません）",
  zhs:"为您联系真人口译·向导（持证导游）。（仅为介绍，并非中介）",
  zht:"為您聯繫真人口譯·嚮導（持證導遊）。（僅為介紹，並非仲介）",
  es:"Te ponemos en contacto con un intérprete-guía con licencia real. (solo presentación, no intermediación)"}); }
function igDates(){ var out=[]; for(var i=1;i<=2;i++){ var d=new Date(Date.now()+9*3600e3+i*864e5), s=d.toISOString().slice(0,10);
    out.push([s, (i===1?LG6({ko:"내일",en:"Tomorrow",ja:"明日",zhs:"明天",zht:"明天",es:"Mañana"}):LG6({ko:"모레",en:"Day after tomorrow",ja:"明後日",zhs:"后天",zht:"後天",es:"Pasado mañana"}))+" ("+s+")"]); } return out; }
function igLangName(c){ for(var i=0;i<GLANG6.length;i++) if(GLANG6[i][1]===c) return GLANG6[i][0]; return c; }
// 한 판 안에서 세 화면(pick=언어 고르기 · list=가이드 목록 · req=요청하기) 을 state(IG)로
function igRender(b){
  var head='<div class="nrtop"><b>'+esc(LG6({ko:"통역·길안내",en:"Interpreter & guide",ja:"通訳・ガイド",zhs:"翻译·向导",zht:"翻譯·嚮導",es:"Intérprete y guía"}))+'</b><button type="button" class="nrx" data-nr="x" aria-label="close">✕</button></div>';
  var back='<button type="button" class="igback" data-igback="1">‹ '+esc(LG6({ko:"뒤로",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Atrás"}))+'</button>';
  if(IG.view==="done"){ b.innerHTML=head+'<div class="ignote">✓ '+esc(LG6({ko:"요청이 전달되었습니다. 가이드가 곧 연락 드릴 거예요.",en:"Your request was sent. The guide will contact you soon.",ja:"リクエストを送りました。ガイドからまもなくご連絡します。",zhs:"请求已发送，向导会尽快与您联系。",zht:"請求已發送，嚮導會盡快與您聯繫。",es:"Tu solicitud fue enviada. El guía te contactará pronto."}))+'</div><button type="button" class="nrsel" data-igback="pick">'+esc(LG6({ko:"처음으로",en:"Start over",ja:"最初に戻る",zhs:"返回开始",zht:"返回開始",es:"Volver al inicio"}))+'</button>'; igWire(b); return; }
  if(IG.view==="req"&&IG.gobj){ var g=IG.gobj, ds=igDates();
    b.innerHTML=head+back
      +'<div class="igcard" style="margin-top:8px">'+igFace(g)+'<div class="igb"><b>'+esc(g.name)+'</b><div class="igm">'+g.langs.map(igLangName).map(esc).join(" · ")+'</div></div></div>'
      +'<div class="iglbl" style="margin-top:12px">'+esc(LG6({ko:"요청 내용을 적어 주세요",en:"Fill in your request",ja:"リクエストを入力してください",zhs:"请填写您的请求",zht:"請填寫您的請求",es:"Completa tu solicitud"}))+'</div>'
      +'<label class="iglb">'+esc(LG6({ko:"이름 *",en:"Your name *",ja:"お名前 *",zhs:"您的姓名 *",zht:"您的姓名 *",es:"Tu nombre *"}))+'</label><input class="igin" id="igqNm" maxlength="30">'
      +'<label class="iglb">'+esc(LG6({ko:"연락처 (이메일 또는 전화) *",en:"Contact (email or phone) *",ja:"連絡先（メールまたは電話）*",zhs:"联系方式（邮箱或电话）*",zht:"聯絡方式（電郵或電話）*",es:"Contacto (correo o teléfono) *"}))+'</label><input class="igin" id="igqCt" maxlength="60">'
      +'<label class="iglb">'+esc(LG6({ko:"희망 날짜 (당일 예약은 받지 않습니다)",en:"Date (no same-day booking)",ja:"希望日（当日予約不可）",zhs:"日期（不接受当天预约）",zht:"日期（不接受當天預約）",es:"Fecha (no el mismo día)"}))+'</label><select class="igin" id="igqDt">'+ds.map(function(d){ return '<option value="'+d[0]+'">'+esc(d[1])+'</option>'; }).join("")+'</select>'
      +'<label class="iglb">'+esc(LG6({ko:"요청 메모 (선택)",en:"Message (optional)",ja:"メモ（任意）",zhs:"留言（可选）",zht:"留言（可選）",es:"Mensaje (opcional)"}))+'</label><textarea class="igin" id="igqMs" maxlength="600" style="min-height:70px"></textarea>'
      +'<label class="igchk"><input type="checkbox" id="igqAg"> '+esc(LG6({ko:"내 이름·연락처를 이 가이드에게 전달하는 데 동의합니다.",en:"I agree to share my name and contact with this guide.",ja:"氏名・連絡先をこのガイドに伝えることに同意します。",zhs:"我同意将我的姓名和联系方式转交给该向导。",zht:"我同意將我的姓名和聯絡方式轉交給該嚮導。",es:"Acepto compartir mi nombre y contacto con este guía."}))+'</label>'
      +'<button type="button" class="nrsel" id="igqGo" style="background:#0c8599;color:#fff;border-color:#0c8599;margin-top:10px">'+esc(LG6({ko:"이 가이드에게 요청",en:"Send request",ja:"このガイドに依頼",zhs:"向该向导发送请求",zht:"向該嚮導發送請求",es:"Enviar solicitud"}))+'</button>'
      +'<div class="ignt" id="igqM"></div>'; igWire(b); return; }
  if(IG.view==="list"){ var h=head+back+'<div class="iglbl" style="margin-top:8px">'+esc(LG6({ko:igLangName(IG.lang)+" 가이드",en:igLangName(IG.lang)+" guides",ja:igLangName(IG.lang)+"のガイド",zhs:igLangName(IG.lang)+"向导",zht:igLangName(IG.lang)+"嚮導",es:"Guías de "+igLangName(IG.lang)}))+'</div>';
    if(IG.err) h+='<div class="msg">'+esc(LG6({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."}))+'</div>';
    else if(!IG.guides) h+='<div class="msg">'+esc(LG6({ko:"찾는 중…",en:"Searching…",ja:"検索中…",zhs:"搜索中…",zht:"搜尋中…",es:"Buscando…"}))+'</div>';
    else if(!IG.guides.length) h+='<div class="ignote">'+esc(LG6({ko:"아직 등록된 가이드가 없습니다. 곧 추가될 예정이에요.",en:"No guides registered yet. More coming soon.",ja:"まだ登録されたガイドがいません。近日追加予定です。",zhs:"暂无已登记的向导，即将新增。",zht:"暫無已登記的嚮導，即將新增。",es:"Aún no hay guías registrados. Pronto habrá más."}))+'</div>';
    else h+=IG.guides.map(function(g,i){ return '<div class="igcard" data-igpick="'+i+'">'+igFace(g)+'<div class="igb"><b>'+esc(g.name)+'</b><div class="igm">'+g.langs.map(igLangName).map(esc).join(" · ")+(g.years?' · '+g.years+(window.LANG==="ko"?"년":"y"):"")+(g.region?' · '+esc(g.region):"")+'</div>'+(g.intro?'<div class="igi">'+esc(g.intro)+'</div>':"")+'<span class="igpk">'+esc(LG6({ko:"요청하기 ›",en:"Request ›",ja:"依頼する ›",zhs:"请求 ›",zht:"請求 ›",es:"Solicitar ›"}))+'</span></div></div>'; }).join("");
    b.innerHTML=h; igWire(b); return; }
  // pick
  var btns=GLANG6.map(function(l){ return '<a class="iglang" href="#" data-iglang="'+l[1]+'">'+esc(l[0])+' ›</a>'; }).join("");
  b.innerHTML=head+'<div class="ignote">ⓘ '+esc(igNote())+'</div>'
    +'<div class="iglbl">'+esc(LG6({ko:"필요한 언어를 고르세요",en:"Choose the language you need",ja:"必要な言語を選んでください",zhs:"请选择您需要的语言",zht:"請選擇您需要的語言",es:"Elige el idioma que necesitas"}))+'</div><div class="iglangs">'+btns+'</div>';
  igWire(b);
}
function igFace(g){ return g.photo?'<img class="igav" src="'+HUB+'/guide/photo?id='+encodeURIComponent(g.id)+'" alt="" loading="lazy">':'<span class="igav igavx">🧭</span>'; }
function igWire(b){
  [].forEach.call(b.querySelectorAll("[data-iglang]"),function(a){ a.onclick=function(e){ e.preventDefault(); IG.lang=a.dataset.iglang; IG.view="list"; IG.guides=null; IG.err=""; paint(); igLoad(); }; });
  [].forEach.call(b.querySelectorAll("[data-igback]"),function(a){ a.onclick=function(e){ e.preventDefault(); var to=a.dataset.igback==="pick"?"pick":(IG.view==="req"?"list":"pick"); IG.view=to; if(to==="pick"){ IG.lang=""; IG.guides=null; } IG.done=false; paint(); }; });
  [].forEach.call(b.querySelectorAll("[data-igpick]"),function(c){ c.onclick=function(){ var g=IG.guides&&IG.guides[+c.dataset.igpick]; if(g){ IG.gobj=g; IG.gid=g.id; IG.view="req"; paint(); } }; });
  var go=b.querySelector("#igqGo"); if(go) go.onclick=igSend;
}
function igLoad(){ var lang=IG.lang; fetch(HUB+"/guide/guides?lang="+encodeURIComponent(lang)).then(function(r){ return r.json(); }).then(function(j){ if(IG.lang!==lang||IG.view!=="list") return;
    if(j&&j.ok){ IG.guides=j.items||[]; } else IG.err="x"; paint(); }).catch(function(){ if(IG.lang===lang&&IG.view==="list"){ IG.err="net"; paint(); } }); }
function igSend(){ if(IG.busy) return; var g=function(i){ var e=document.getElementById(i); return e?String(e.value||"").trim():""; };
  var nm=g("igqNm"), ct=g("igqCt"), dt=g("igqDt"), ms=g("igqMs"), ag=document.getElementById("igqAg"), M=document.getElementById("igqM");
  var set=function(t){ if(M){ M.textContent=t; } };
  if(!nm||!ct){ set(LG6({ko:"이름과 연락처를 넣어 주세요.",en:"Please enter your name and contact.",ja:"お名前と連絡先を入力してください。",zhs:"请填写姓名和联系方式。",zht:"請填寫姓名和聯絡方式。",es:"Introduce tu nombre y contacto."})); return; }
  if(!ag||!ag.checked){ set(LG6({ko:"전달 동의에 체크해 주세요.",en:"Please check the consent box.",ja:"同意にチェックしてください。",zhs:"请勾选同意。",zht:"請勾選同意。",es:"Marca la casilla de consentimiento."})); return; }
  IG.busy=true; set("…"); var go=document.getElementById("igqGo"); if(go) go.disabled=true;
  fetch(HUB+"/guide/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gid:IG.gid,name:nm,contact:ct,date:dt,msg:ms,lang:LANG,consent:true}),cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ IG.busy=false; if(go) go.disabled=false;
    if(j&&j.ok){ IG.view="done"; paint(); return; }
    set(j&&j.err==="contact"?LG6({ko:"연락처를 확인해 주세요.",en:"Please check your contact.",ja:"連絡先を確認してください。",zhs:"请检查联系方式。",zht:"請檢查聯絡方式。",es:"Revisa tu contacto."}):j&&j.err==="rate"?LG6({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again later.",ja:"しばらくしてからもう一度。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo más tarde."}):LG6({ko:"보내지 못했습니다.",en:"Could not send.",ja:"送信できませんでした。",zhs:"发送失败。",zht:"發送失敗。",es:"No se pudo enviar."})); })
  .catch(function(){ IG.busy=false; if(go) go.disabled=false; set(LG6({ko:"연결에 실패했습니다.",en:"Connection failed.",ja:"接続に失敗しました。",zhs:"连接失败。",zht:"連接失敗。",es:"Error de conexión."})); }); }
function tourBand(){ var c="South Korea", best=1e9, b=S.base;
  if(b) TB_CITY.forEach(function(x){ var d=kmLL(b,[x[1],x[2]]); if(d<=x[3]&&d<best){ best=d; c=x[0]; } });
  var q=encodeURIComponent(c+" day tour"), kl={ko:"ko",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"}[LANG]||"en-US", gl={ja:"ja-jp/",zhs:"zh-cn/",es:"es-es/"}[LANG]||"";
  return '<div class="nrtb"><img src="img/phone_tour.png" alt="" style="height:22px;width:auto;vertical-align:-5px;margin-right:4px">'+T("📱 내일 투어를 바로 예약:","📱 Book a tour for tomorrow:").replace(/^📱\s*/,"")+' <a href="https://www.klook.com/'+kl+'/search/result/?query='+q+'" target="_blank" rel="noopener">Klook</a> · <a href="https://www.getyourguide.com/'+gl+'s/?q='+q+'" target="_blank" rel="noopener">GetYourGuide</a></div>'; }
// 대사관 — 일본어·중국어 화면은 나라 이름(EMB_L)으로 「아르헨티나 대사관」 꼴 (10-18). 표에 없으면 영어 이름
// 일·중 화면은 나라 이름을 그 언어로만, 그 언어 순서(일: 50음, 简: 병음, 繁: 획수)로 (10-18)
function embL(){ return {ja:1,zhs:1,zht:1,es:1}[LANG]===1; }
var EMB_KANA={CN:"ちゅうごく",JP:"にほん",EU:"おうしゅうれんごう"};
function embKey(x){ return (LANG==="ja"&&EMB_KANA[x.f])||embC(x); }
function embC(x){ var l=window.EMB_L&&EMB_L[x.f], i={ja:0,zhs:1,zht:2,es:3}[LANG]; return (l&&i!=null&&l[i])||x.k; }
function embN(x){ if(LANG==="ko") return x.n; if(LANG==="en") return x.ne; var l=window.EMB_L&&EMB_L[x.f], i={ja:0,zhs:1,zht:2,es:3}[LANG]; if(!l||i==null) return x.ne;
  var nm=l[i]; if(x.f==="EU") return [nm+"代表部","欧盟驻韩国代表团","歐盟駐韓國代表處","Delegación de la Unión Europea en Corea"][i]; return [nm+"大使館（在韓国）",nm+"驻韩国大使馆",nm+"駐韓國大使館","Embajada de "+nm+" en Corea"][i]; }
// 국기 = 나라 두 글자 → 지역 표시 글자 둘 (사장님 10-16: 이모지 금지의 예외, 국기만). 윈도우 PC 크롬은 글자(US)로 보일 수 있다
function flag(c){ if(!c||c.length!==2) return ""; try{ return String.fromCodePoint(0x1F1E6+c.charCodeAt(0)-65,0x1F1E6+c.charCodeAt(1)-65)+" "; }catch(e){ return ""; } }
// 대사관 한 줄: 「영문 나라 · 한글 나라」 / 대사관 이름 / 주소 / 전화(흰 전화기 단추) / 길찾기(linksTo)
function embHtml(x){ var en=L(), tel="", lk;
  if(x.t){ var shown=en?(/^0/.test(x.t)?"+82 "+x.t.slice(1):"+82 "+x.t):x.t; tel='<a class="nrcall am" href="tel:'+esc(telIntl(x.t))+'">'+PH+T("전화","Call")+'</a> <span class="d">'+esc(shown)+'</span>'; }
  if(x.y) lk=linksTo(x.n,x.y,x.x,x.n,x.a);
  else { var q=encodeURIComponent(x.a), A=function(h,t){ return '<a href="'+h+'" target="_blank" rel="noopener">'+t+'</a>'; };   // 좌표 없는 곳은 주소로 지도 검색
    lk=en?A("https://www.google.com/maps/search/?api=1"+(hlG()||"&hl=en")+"&query="+q,TE("Google Maps (English)"))+A("https://map.naver.com/p/search/"+q,TE("Naver Map")):A("https://map.kakao.com/?q="+q,"카카오맵")+A("https://map.naver.com/p/search/"+q,"네이버 지도")+A("https://www.google.com/maps/search/?api=1&query="+q,"구글 지도"); }
  return '<div class="nrit nremb" data-ak="'+esc(x.f)+'"><div class="c">'+flag(x.f)+(embL()?esc(embC(x)):esc(x.e)+' · '+esc(embC(x)))+'</div><div class="h"><b>'+esc(embN(x))+'</b>'+(x.dist!=null?'<i>'+km(x.dist)+'</i>':'')+'</div>'
    +(en?'<div class="ko">'+esc(x.n)+'</div>':'')+'<div class="d">'+esc(en?(x.ae||x.a):x.a)+'</div>'
    +(tel?'<div class="row">'+tel+'</div>':'')+'<div class="lks">'+lk+'</div></div>'; }
function paint(){ var b=document.querySelector("#nrBox .nrin"); if(!b||!S.k) return;
  if(S.k==="ig"){ b.className="nrin"; igRender(b); return; }   // 통역·길안내 판 (10-24) — 가이드 등록·매칭
  var k=KINDS[S.k], em=S.k==="em";
  b.className="nrin"+(em?" nrem":"")+(S.k==="st"?" nrst":"");
  var h='<div class="nrtop"><b>'+(S.k==="tg"?"🧭 "+esc(LG6(TOURS6)):T(k.t[0],k.t[1]))+'</b><button type="button" class="nrx" data-nr="x" aria-label="close">✕</button></div>';
  if(em) h+=sos();
  if(S.k==="am") h+='<select class="nrsel" id="nrSel" aria-label="'+T("종류","Type")+'">'+k.tabs.map(function(t,i){ return '<option value="'+i+'"'+(i===S.tab?' selected':'')+'>'+esc(T(t.ko,t.en))+'</option>'; }).join("")+'</select>';   // 편의시설 = 풀다운 (사장님 10-16, 이모지 없이)
  else if(S.k==="tg"){ b.innerHTML=h+tgHtml(); return; }   // 투어 가이드 — Klook·GetYourGuide 두 칸, 그 아래 설명 세 줄 (사장님 10-23)
  else h+='<div class="nrtabs">'+k.tabs.map(function(t,i){ return '<button type="button" class="nrtab'+(i===S.tab?' on':'')+'" data-nr="tab" data-i="'+i+'">'+t.i+' '+esc(T(t.ko,t.en))+'</button>'; }).join("")+'</div>';
  if(S.err==="loc") h+='<div class="msg">'+T("위치를 받을 수 없습니다 — 폰 설정에서 위치 권한을 켜 주세요. 또는 지도를 보고 싶은 동네로 옮긴 뒤 다시 눌러 주세요.","Could not get your location — please allow location access, or move the map to the area you want and try again.")+'</div><div class="nrbase"><button type="button" class="nrme" data-nr="me">📍 '+T("내 위치 다시 받기","Try my location again")+'</button></div>';
  else if(S.err) h+='<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>';
  else if(k.tabs[S.tab].fixed&&S.items) h+='<div class="nrbase">'+(embL()?TE("Sorted by country name (local order)"):T("나라 영문 이름 순","Sorted by country name (A–Z)"))+'</div>'+S.items.map(embHtml).join("");
  else { var tg=k.tabs[S.tab].g, rr=tg&&S.ord==="r";
    if(tg&&S.items&&S.items.length) h+='<div class="nrord"><button type="button" data-nr="ord" data-o="d" class="'+(rr?'':'on')+'">'+T("거리순","Nearest")+'</button><button type="button" data-nr="ord" data-o="r" class="'+(rr?'on':'')+'">'+T("별점순 (구글)","Top rated (Google)")+'</button></div>';   // 구글 자료(음식점·여행사)만 거리순·별점순 (사장님 10-21)
    if(S.base) h+='<div class="nrbase">'+(rr?(function(){ var g=((S.gr||k.tabs[S.tab].r)/1000).toFixed(1).replace(/\.0$/,""); return T("⭐ "+g+"km 안 구글 별점 높은 순","⭐ Highest Google rating within "+g+" km"); })():(S.src==="me"?(tg?T("📍 내 위치에서 가까운 순 (비슷한 거리는 별점순)","📍 Nearest to you (similar distance: higher rating first)"):(S.k==="st"&&!S.far)?T("⭐ 구글 별점 높은 순 (같으면 가까운 순)","⭐ Highest Google rating first (then nearest)"):T("📍 내 위치에서 가까운 순","📍 Nearest to you")):T("🗺 지금 보는 지도 가운데에서 가까운 순","🗺 Nearest to the center of the map")))
      +(S.src!=="me"?' <button type="button" class="nrme" data-nr="me">📍 '+T("내 위치로","Use my location")+'</button>':'')+'</div>';
    if(k.tabs[S.tab].gt==="travel_agency"&&S.k!=="tg") h+=tourBand();   // 여행사 맨 위 띠 — Klook·GetYourGuide 당일 투어 검색 (10-22)
    if(!S.items) h+='<div class="msg">'+T("찾는 중…","Searching…")+'</div>';
    else if(!S.items.length) h+='<div class="msg">'+T("가까운 곳에 없습니다.","None found nearby.")+'</div>';
    else h+=(S.far?'<div class="msg">'+T("가까운 곳에 한옥스테이가 없어, 멀어도 별점 높은 곳을 보여 드립니다.","No hanok stays nearby — showing top-rated ones farther away.")+'</div>':"")+S.items.map(function(x,i){ return itemHtml(x,i,em); }).join(""); }
  b.innerHTML=h; }

// ── 한 곳 고르기 → 기존 검색 핀 ──
function pick(x){ var t=KINDS[S.k].tabs[S.tab]; try{ ntap(t.kind||t.c.toLowerCase(),KINDS[S.k].e); }catch(e){}
  PICK={lat:+x.y,lng:+x.x,em:S.k==="em"}; close();
  spinShow({name:x.name,name_en:x.name_en||x.name,addr:x.addr||"",addr_en:x.addr_en||x.addr||"",y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:x.cat_en||"",_l:S.fl||(x.name_en?LANG:"ko")}); }
// 긴급으로 고른 곳은 카드 맨 위에 큰 「전화」 단추
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._nr){ var sc1=function(){ var r=sc0.apply(this,arguments);
    try{ var p=PLACES.__pin; if(PICK&&PICK.em&&p&&p.tel&&Math.abs(+p.lat-PICK.lat)<1e-6&&Math.abs(+p.lng-PICK.lng)<1e-6){ var it=document.querySelector("#res .item");
      if(it&&!it.querySelector(".nrbig")){ css(); var t=it.querySelector(".t"); var a='<a class="nrbig tel" href="tel:'+esc(telIntl(p.tel))+'">'+PH+T("전화 걸기","Call now")+'</a>'; if(t) t.insertAdjacentHTML("afterend",a); else it.insertAdjacentHTML("afterbegin",a); } } }catch(e){}
    return r; }; sc1._nr=1; sc1._gf=sc0._gf; sc1._tr=sc0._tr; window.spinCard=sc1; }

// ── 「예약하기 / Book」 (사장님 10-16) — 숙소 카드(검색 핀 중 카카오 분류 「숙박」·숙소 칩에서 고른 곳·그림 있는 호텔)에만.
//    누르면 아고다·부킹닷컴·트립닷컴의 그 숙소 이름 검색 화면으로 (새 창). 제휴 코드는 BOOK_AID 한 곳에서 (지금은 없음)
//    검색 주소는 헤드리스로 열어 확인(10-16): 부킹닷컴 searchresults?ss= · 트립닷컴 global-search?keyword= 는 이름만으로 그 호텔이 나옴.
//    아고다는 도시 번호(city)가 있어야 이름 검색이 됨 — 확인한 도시(서울 14690·부산 17172·제주 16901)만 아고다 검색, 그 밖은 구글 「이름 agoda」
var BOOK_AID={agoda:"",booking:"",trip:""};
var AGODA_CITY=[[37.5665,126.978,14690,45],[35.1796,129.0756,17172,40],[33.38,126.55,16901,70]];
function bookUrls(nm,lat,lng){ nm=String(nm||"").split(" · ").pop(); var q=encodeURIComponent(nm), ag=null;   // 「일·중 이름 · 영어 이름」이면 영어 쪽으로 검색 (10-18)
  AGODA_CITY.forEach(function(c){ if(!ag&&kmLL([lat,lng],[c[0],c[1]])<=c[3]) ag=c[2]; });
  return {agoda:ag?"https://www.agoda.com/search?city="+ag+"&textToSearch="+q+BOOK_AID.agoda:"https://www.google.com/search?q="+encodeURIComponent(nm+" agoda"),
    booking:"https://www.booking.com/searchresults.html?ss="+q+BOOK_AID.booking,
    trip:"https://www.trip.com/global-search/searchlist/search?keyword="+q+BOOK_AID.trip}; }
var BK=null;   // 지금 카드의 숙소 {nm, lat, lng, key}
function isHotelKey(k){ var p=PLACES[k]; return !!p&&(/^h_/.test(k)||k==="shilla"||/호텔/.test(p.ko||"")); }
function bookBtn(info){ var it=document.querySelector("#res .item"); if(!it||it.querySelector(".nrbook")) return; css(); BK=info;
  var a='<a class="nrbook" href="#" data-nrbk="1">🛏 '+T("예약하기","Book")+'</a>', t=it.querySelector(".nrbig")||it.querySelector(".t");
  if(t) t.insertAdjacentHTML("afterend",'<div>'+a+'</div>'); else it.insertAdjacentHTML("afterbegin",a); }
function bookOpen(){ if(!BK) return; var u=bookUrls(BK.nm,BK.lat,BK.lng), o=document.getElementById("nrBk"); if(o) o.remove();
  o=document.createElement("div"); o.id="nrBk";
  o.innerHTML='<div class="in"><div class="h">🛏 '+T("예약하기","Book")+' · '+esc(BK.nm)+'</div><div class="s">'+T("예약 사이트에서 이 숙소 이름으로 찾아 드려요 (새 창)","Opens a search for this place on the booking site (new tab)")+'</div>'
    +'<a href="'+esc(u.agoda)+'" target="_blank" rel="noopener" data-site="agoda">Agoda</a><a href="'+esc(u.booking)+'" target="_blank" rel="noopener" data-site="booking">Booking.com</a><a href="'+esc(u.trip)+'" target="_blank" rel="noopener" data-site="trip">Trip.com</a>'
    +'<button type="button">'+T("닫기","Close")+'</button></div>';
  o.addEventListener("click",function(e){ var a=e.target.closest("a[data-site]");
    if(a){ try{ ntap(a.dataset.site,"book"); ntap(BK.key||"sp_stay","book"); }catch(z){} setTimeout(function(){ o.remove(); },50); return; }
    if(e.target===o||e.target.tagName==="BUTTON") o.remove(); });
  document.body.appendChild(o); }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("a[data-nrbk]"); if(!a) return; e.preventDefault(); e.stopPropagation(); bookOpen(); },true);
// 검색 핀 카드 — 카카오 분류에 「숙박」이면
var sc2=window.spinCard; if(typeof sc2==="function"&&!sc2._nrb){ var sc3=function(){ var r=sc2.apply(this,arguments);
    try{ var p=PLACES.__pin; if(p&&/숙박/.test(p.cat||"")) bookBtn({nm:(p.en&&p.en!==p.ko)?p.en:p.ko,lat:+p.lat,lng:+p.lng,key:""}); }catch(e){} return r; };
  for(var _k in sc2) sc3[_k]=sc2[_k]; sc3._nrb=1; window.spinCard=sc3; }
// 그림 있는 호텔 카드
var ps0=window.placeShow; if(typeof ps0==="function"&&!ps0._nrb){ var ps1=function(k){ var r=ps0.apply(this,arguments);
    try{ if(isHotelKey(k)){ var p=PLACES[k]; bookBtn({nm:p.en||p.ko,lat:+p.lat,lng:+p.lng,key:k}); } }catch(e){} return r; };
  for(var _j in ps0) ps1[_j]=ps0[_j]; ps1._nrb=1; window.placeShow=ps1; }
document.addEventListener("change",function(e){ if(e.target&&e.target.id==="nrSel"){ S.tab=+e.target.value; load(); } });
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-nr]"); if(!t||!t.closest("#nrBox,#gfchips,#mm")) return;
  if(e.target.closest("a[href^='tel:']")) return;   // 전화는 그대로 건다
  e.preventDefault(); var g=t.dataset.nr;
  if(g==="tg"||g==="am"||g==="em"||g==="st"||g==="ig") return open(g);
  if(g==="x") return close();
  if(g==="tab"){ S.tab=+t.dataset.i; load(); return; }
  if(g==="ord"){ S.ord=t.dataset.o==="r"?"r":"d"; var kt=KINDS[S.k].tabs[S.tab]; if(S.raw){ S.items=sortIt(S.raw.slice(),kt).slice(0,10); S.byL={}; S.byL[LANG]=S.items; } paint(); return; }
  if(g==="me"){ S.items=null; S.err=""; paint(); myPos().then(function(p){ if(p){ try{ meSet(p); }catch(z){} } load(); }); return; }
  if(g==="pick"){ var x=S.items&&S.items[+t.dataset.i]; if(x) pick(x); } });

// ── 들어가는 곳: 검색창 아래 칩(선물 고르기 옆) · ⋮ 메뉴 ──
function entries(){ css(); var box=document.getElementById("gfchips");
  if(!box){ var h=document.getElementById("gob")||document.getElementById("hint"); if(!h) return; h.insertAdjacentHTML("afterend",'<div id="gfchips" style="display:flex;justify-content:center;gap:6px;margin:10px 0 0;flex-wrap:wrap"></div>'); box=document.getElementById("gfchips"); }
  ["ig","tg","am","em","st"].forEach(function(k){ var c=box.querySelector('.nrchip[data-nr="'+k+'"]'); if(!c){ box.insertAdjacentHTML("beforeend",'<button type="button" class="nrchip'+(k!=="am"?' '+k:'')+'" data-nr="'+k+'"></button>'); c=box.querySelector('.nrchip[data-nr="'+k+'"]'); }
    c.textContent=k==="tg"?LG6(TOURS6):k==="ig"?LG6(IG_CHIP6):T(CHIP[k][0],CHIP[k][1]); });
  var mm=document.getElementById("mm"); if(mm) ["tg","am","em","st","ig"].forEach(function(k){ var id="mnear_"+k, a=document.getElementById(id);
    if(!a){ a=document.createElement("a"); a.id=id; a.href="#"; a.className="mi"; a.dataset.nr=k; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
    a.innerHTML=k==="ig"?'<img class="miic" src="img/menu/mi_guideperson.png" alt="">'+esc(LG6({ko:"통역·길안내",en:"Interpreter & guide",ja:"通訳・ガイド",zhs:"翻译·向导",zht:"翻譯·嚮導",es:"Intérprete y guía"})):miLbl(k); }); }
var f=window.setLang; if(typeof f==="function"&&!f._nr){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); if(document.getElementById("nrBox")) relang(); var bk=document.getElementById("nrBk"); if(bk&&BK) bookOpen(); }catch(e){} return r; }; g._nr=1; g._gf=f._gf; g._tr=f._tr; window.setLang=g; }   // 열린 목록·예약 창은 그 자리에서 (10-18)
entries();
// ── 관광 가이드 등록 (공급 측, 사장님 10-24) — 「입점 문의」 빌딩에서 window.GUIDEREG() 로 연다. 별도 전체 화면 · 6개 언어 ──
//   필수: 이름·사진·가능 언어·자격증 번호·자격증 사본·연락처 이메일 + 개인정보 동의. 사진은 폰에서 줄여 ≤120KB JPEG 로 보낸다.
//   자격증 번호 = 자유 영숫자(관광통역안내사 실제 형식 확인 전) · 제출 → 허브 /guide/join (대기 → 관리자 승인)
var GREGV={photo:null,lic:null};
function gShrink(file,cb){ if(!file){ cb(null); return; } var r=new FileReader();
  r.onload=function(){ var img=new Image(); img.onload=function(){ try{ var mx=1000, w=img.width, h=img.height, sc=Math.min(1,mx/Math.max(w,h||1)), cw=Math.max(1,Math.round(w*sc)), ch=Math.max(1,Math.round(h*sc));
      var c=document.createElement("canvas"); c.width=cw; c.height=ch; var x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,cw,ch); x.drawImage(img,0,0,cw,ch);
      var q=0.85, out=c.toDataURL("image/jpeg",q), guard=0; while(out.length>158000&&q>0.3&&guard<8){ q-=0.1; out=c.toDataURL("image/jpeg",q); guard++; }
      cb(out.indexOf("data:image/jpeg")===0&&out.length<=170000?out:null); }catch(e){ cb(null); } }; img.onerror=function(){ cb(null); }; img.src=r.result; };
  r.onerror=function(){ cb(null); }; r.readAsDataURL(file); }
function gReg(){ css(); var o=document.getElementById("gregBox"); if(o) o.remove();
  if(!document.getElementById("gregCss")){ var gs=document.createElement("style"); gs.id="gregCss";
    gs.textContent="#gregBox{position:fixed;inset:0;z-index:2147483040;background:var(--bg);overflow:auto;-webkit-overflow-scrolling:touch}"
      +"#gregBox .gin{max-width:560px;margin:0 auto;padding:16px 16px 48px}"
      +"#gregBox h3{font-size:19px;margin:4px 0 2px}#gregBox .gsub{color:var(--sub);font-size:13.5px;line-height:1.5;margin-bottom:6px}"
      +"#gregBox textarea.igin{min-height:72px;resize:vertical}"
      +"#gregBox .glg{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0}#gregBox .glg label{display:flex;align-items:center;gap:5px;border:1.5px solid var(--line);border-radius:999px;padding:7px 12px;font-size:14px;font-weight:700;cursor:pointer}#gregBox .glg input{width:16px;height:16px;margin:0}"
      +"#gregBox .gph{display:flex;align-items:center;gap:10px;margin:4px 0}#gregBox .gpv{width:60px;height:60px;border-radius:12px;object-fit:cover;background:#e3fafc;border:1px solid var(--line)}"
      +"#gregBox .ghint{font-size:12px;color:var(--sub);margin:2px 2px 0}"
      +"#gregBox .gbtn{width:100%;border:0;border-radius:12px;padding:13px;font-size:16px;font-weight:900;cursor:pointer;margin-top:14px;background:#0c8599;color:#fff}#gregBox .gbtn:disabled{opacity:.5}"
      +"#gregBox .gx{position:absolute;top:12px;right:14px;width:36px;height:36px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}";
    document.head.appendChild(gs); }
  GREGV={photo:null,lic:null};
  var L=LG6, langsH=GLANG6.map(function(l){ return '<label><input type="checkbox" value="'+l[1]+'" class="gLchk"> '+esc(l[0])+'</label>'; }).join("");
  o=document.createElement("div"); o.id="gregBox";
  o.innerHTML='<div class="gin"><button type="button" class="gx" id="gX">✕</button>'
    +'<h3><img src="img/menu/mi_guideperson.png" alt="" style="height:24px;width:auto;vertical-align:-5px;margin-right:7px">'+esc(L({ko:"관광 가이드 등록",en:"Register as a tour guide",ja:"観光ガイド登録",zhs:"导游登记",zht:"導遊登記",es:"Regístrate como guía turístico"}))+'</h3>'
    +'<div class="gsub">'+esc(L({ko:"관광통역안내사 등 실제로 통역·길안내를 해 주실 분을 등록합니다. 담당자가 자격증을 확인한 뒤 승인합니다. (무료)",en:"Register if you are a real (licensed) interpreter-guide. We approve after verifying your license. (free)",ja:"通訳案内士など、実際に通訳・道案内をされる方の登録です。資格を確認後に承認します。（無料）",zhs:"面向真正的持证口译·向导。核验资格证后审核通过。（免费）",zht:"面向真正的持證口譯·嚮導。核驗資格證後審核通過。（免費）",es:"Regístrate si eres un intérprete-guía real (con licencia). Aprobamos tras verificar tu licencia. (gratis)"}))+'</div>'
    +'<label class="iglb">'+esc(L({ko:"이름 *",en:"Name *",ja:"お名前 *",zhs:"姓名 *",zht:"姓名 *",es:"Nombre *"}))+'</label><input class="igin" id="gNm" maxlength="40">'
    +'<label class="iglb">'+esc(L({ko:"사진 *",en:"Photo *",ja:"写真 *",zhs:"照片 *",zht:"照片 *",es:"Foto *"}))+'</label><div class="gph"><img class="gpv" id="gPv" alt="" style="display:none"><input type="file" accept="image/*" id="gPh"></div>'
    +'<label class="iglb">'+esc(L({ko:"가능 언어 * (여러 개)",en:"Languages spoken * (multiple)",ja:"対応言語 *（複数可）",zhs:"可用语言 *（可多选）",zht:"可用語言 *（可多選）",es:"Idiomas * (varios)"}))+'</label><div class="glg">'+langsH+'</div>'
    +'<label class="iglb">'+esc(L({ko:"관광통역안내사 자격증 번호 *",en:"Tour-guide license number *",ja:"通訳案内士 資格番号 *",zhs:"导游资格证号 *",zht:"導遊資格證號 *",es:"Número de licencia de guía *"}))+'</label><input class="igin" id="gLic" maxlength="40" placeholder="예: A1234567"><div class="ghint">'+esc(L({ko:"자격증에 적힌 번호를 영문·숫자로 적어 주세요.",en:"Enter the alphanumeric number shown on your license.",ja:"資格証の番号を英数字で入力してください。",zhs:"请输入资格证上的英数字号码。",zht:"請輸入資格證上的英數字號碼。",es:"Introduce el número alfanumérico de tu licencia."}))+'</div>'
    +'<label class="iglb">'+esc(L({ko:"자격증 사본 *",en:"License photo *",ja:"資格証の写し *",zhs:"资格证照片 *",zht:"資格證照片 *",es:"Foto de la licencia *"}))+'</label><div class="gph"><img class="gpv" id="gLv" alt="" style="display:none"><input type="file" accept="image/*" id="gLp"></div>'
    +'<label class="iglb">'+esc(L({ko:"경력 (년)",en:"Years of experience",ja:"経験年数",zhs:"从业年数",zht:"從業年數",es:"Años de experiencia"}))+'</label><input class="igin" id="gYr" inputmode="numeric" maxlength="2">'
    +'<label class="iglb">'+esc(L({ko:"활동 지역",en:"Region",ja:"活動地域",zhs:"活动地区",zht:"活動地區",es:"Región"}))+'</label><input class="igin" id="gRg" maxlength="40" placeholder="'+esc(L({ko:"예: 서울, 부산",en:"e.g. Seoul, Busan",ja:"例：ソウル、釜山",zhs:"例：首尔、釜山",zht:"例：首爾、釜山",es:"p. ej. Seúl, Busan"}))+'">'
    +'<label class="iglb">'+esc(L({ko:"자기소개 (짧게)",en:"Short self-introduction",ja:"自己紹介（短く）",zhs:"简短自我介绍",zht:"簡短自我介紹",es:"Breve presentación"}))+'</label><textarea class="igin" id="gIn" maxlength="500"></textarea>'
    +'<label class="iglb">'+esc(L({ko:"이메일 *",en:"Email *",ja:"メール *",zhs:"邮箱 *",zht:"電郵 *",es:"Correo *"}))+'</label><input class="igin" id="gEm" type="email" maxlength="120" autocomplete="email">'
    +'<label class="iglb">'+esc(L({ko:"전화 (선택)",en:"Phone (optional)",ja:"電話（任意）",zhs:"电话（可选）",zht:"電話（可選）",es:"Teléfono (opcional)"}))+'</label><input class="igin" id="gTel" inputmode="tel" maxlength="30">'
    +'<label class="igchk"><input type="checkbox" id="gAg"> '+esc(L({ko:"개인정보 수집·이용에 동의합니다. (목적: 가이드 등록·승인·손님 연결 · 항목: 이름·사진·언어·자격증 번호·자격증 사본·연락처 · 보관: 탈퇴 또는 1년 뒤 손님 요청 삭제 · 연락처는 암호화 보관)",en:"I agree to the collection and use of my personal data. (Purpose: guide registration, approval and traveler matching · Items: name, photo, languages, license number, license photo, contact · Contact stored encrypted)",ja:"個人情報の収集・利用に同意します。（目的：ガイド登録・承認・お客様とのマッチング／項目：氏名・写真・言語・資格番号・資格証の写し・連絡先／連絡先は暗号化保管）",zhs:"我同意收集和使用个人信息。（目的：导游登记·审核·对接游客／项目：姓名·照片·语言·资格证号·资格证照片·联系方式／联系方式加密保存）",zht:"我同意收集和使用個人資訊。（目的：嚮導登記·審核·對接旅客／項目：姓名·照片·語言·資格證號·資格證照片·聯絡方式／聯絡方式加密保存）",es:"Acepto la recogida y uso de mis datos personales. (Fin: registro, aprobación y conexión con viajeros · Datos: nombre, foto, idiomas, número de licencia, foto de licencia, contacto · Contacto cifrado)"}))+'</label>'
    +'<button type="button" class="gbtn" id="gGo">'+esc(L({ko:"등록 신청",en:"Register",ja:"登録申請",zhs:"提交登记",zht:"提交登記",es:"Registrarme"}))+'</button>'
    +'<div class="ignt" id="gMsg"></div></div>';
  document.body.appendChild(o);
  document.getElementById("gX").onclick=function(){ o.remove(); };
  var bindPhoto=function(inp,prev,key){ var e=document.getElementById(inp); e.onchange=function(){ var f=e.files&&e.files[0]; if(!f){ GREGV[key]=null; return; } gShrink(f,function(d){ GREGV[key]=d; var p=document.getElementById(prev); if(d&&p){ p.src=d; p.style.display="inline-block"; } }); }; };
  bindPhoto("gPh","gPv","photo"); bindPhoto("gLp","gLv","lic");
  document.getElementById("gGo").onclick=gRegSend;
}
function gRegSend(){ var L=LG6, M=document.getElementById("gMsg"), set=function(t){ if(M) M.textContent=t; };
  var g=function(i){ var e=document.getElementById(i); return e?String(e.value||"").trim():""; };
  var langs=[].map.call(document.querySelectorAll(".gLchk:checked"),function(c){ return c.value; });
  var nm=g("gNm"), lic=g("gLic"), em=g("gEm"), rg=g("gRg");
  if(!nm||!langs.length||!lic||!em||!rg||!GREGV.photo||!GREGV.lic){ set(L({ko:"* 칸(이름·사진·언어·자격증 번호·자격증 사본·지역·이메일)을 채워 주세요.",en:"Please fill the * fields (name, photo, languages, license number, license photo, region, email).",ja:"*項目（氏名・写真・言語・資格番号・資格証の写し・地域・メール）を入力してください。",zhs:"请填写*项（姓名·照片·语言·资格证号·资格证照片·地区·邮箱）。",zht:"請填寫*項（姓名·照片·語言·資格證號·資格證照片·地區·電郵）。",es:"Completa los campos * (nombre, foto, idiomas, licencia, foto de licencia, región, correo)."})); return; }
  if(!document.getElementById("gAg").checked){ set(L({ko:"개인정보 수집·이용에 동의해 주세요.",en:"Please agree to the privacy notice.",ja:"個人情報の取り扱いに同意してください。",zhs:"请同意个人信息处理。",zht:"請同意個人資訊處理。",es:"Acepta el aviso de privacidad."})); return; }
  var go=document.getElementById("gGo"); if(go) go.disabled=true; set("…");
  fetch(HUB+"/guide/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:nm,langs:langs,lic:lic,years:g("gYr"),region:rg,intro:g("gIn"),email:em,phone:g("gTel"),photo:GREGV.photo,licPhoto:GREGV.lic,consent:true}),cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(go) go.disabled=false;
    if(j&&j.ok){ var o=document.getElementById("gregBox"); if(o) o.querySelector(".gin").innerHTML='<button type="button" class="gx" onclick="document.getElementById(\'gregBox\').remove()">✕</button><h3>✓ '+esc(L({ko:"등록 신청이 접수되었습니다",en:"Registration received",ja:"登録申請を受け付けました",zhs:"已收到登记申请",zht:"已收到登記申請",es:"Registro recibido"}))+'</h3><div class="gsub">'+esc(L({ko:"담당자가 자격증을 확인한 뒤 승인해 드립니다. 승인되면 손님이 통역·길안내에서 회원님을 볼 수 있어요.",en:"We will approve after verifying your license. Once approved, travelers can find you under Interpreter & guide.",ja:"資格確認後に承認します。承認後、お客様が通訳・ガイドで見つけられます。",zhs:"核验资格后审核通过。通过后游客可在翻译·向导中找到您。",zht:"核驗資格後審核通過。通過後旅客可在翻譯·嚮導中找到您。",es:"Aprobaremos tras verificar tu licencia. Luego los viajeros podrán encontrarte en Intérprete y guía."}))+'</div><button type="button" class="gbtn" onclick="document.getElementById(\'gregBox\').remove()">'+esc(L({ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}))+'</button>'; return; }
    set(j&&j.err==="photo"||j&&j.err==="licphoto"?L({ko:"사진을 다시 올려 주세요 (JPEG).",en:"Please re-upload the photo (JPEG).",ja:"写真を再アップロードしてください（JPEG）。",zhs:"请重新上传照片（JPEG）。",zht:"請重新上傳照片（JPEG）。",es:"Vuelve a subir la foto (JPEG)."}):j&&j.err==="rate"?L({ko:"잠시 뒤 다시 해 주세요.",en:"Please try again later.",ja:"しばらくしてから。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo más tarde."}):L({ko:"보내지 못했습니다. 칸을 확인해 주세요.",en:"Could not send. Please check the fields.",ja:"送信できませんでした。入力をご確認ください。",zhs:"发送失败，请检查填写。",zht:"發送失敗，請檢查填寫。",es:"No se pudo enviar. Revisa los campos."})); })
  .catch(function(){ if(go) go.disabled=false; set(L({ko:"연결에 실패했습니다.",en:"Connection failed.",ja:"接続に失敗しました。",zhs:"连接失败。",zht:"連接失敗。",es:"Error de conexión."})); }); }
window.GUIDEREG=gReg;
window.NEAR={open:open,close:close,state:function(){ return S; }};
var qm=location.search.match(/[?&]near=(am|em)/); if(qm) setTimeout(function(){ open(qm[1]); },300);
})();
