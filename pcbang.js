/* 머니퍼즐 투어 — 구마다 PC방 (사장님 2026-10-26)
 *  · 구 화면의 PC방 그림(gu_build PCB_ST → act "__pcb_<code>", 자료 GU.d.pcb[code])을 누르면 카드
 *  · 맨 위 Steam, 그 아래 「세계에서 많이 하는 한국 게임」 공식 사이트(손님 언어 판이 있으면 그 주소 — 10-26 실제 접속해 확인) · 로고 그림 없이 한 줄 설명
 *  · 카드 아래 그 구의 실제 PC방 목록 = 구역형 가게 목록 부품(areaExpShow, 허브 /garea type=pcbang) 그대로
 */
(function(){
"use strict";
function L(o){ return o[window.LANG]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var STEAM_L={ko:"koreana",en:"english",ja:"japanese",zhs:"schinese",zht:"tchinese",es:"spanish"};
// 게임 공식 사이트 — 언어별 주소 (없는 언어는 en). 2026-10-26 접속 확인
var MOB={
 "Steam":{all:{n:"Steam Mobile",a:"com.valvesoftware.android.steam.community",i:495369748}},
 "League of Legends":{ko:{n:"와일드 리프트",a:"com.riotgames.league.wildrift",i:1480616990},en:{n:"Wild Rift",a:"com.riotgames.league.wildrift",i:1480616990},ja:{n:"ワイルドリフト",a:"com.riotgames.league.wildrift",i:1480616990},es:{n:"Wild Rift",a:"com.riotgames.league.wildrift",i:1480616990},zht:{n:"激鬥峽谷 (Wild Rift)",s:"https://wildrift.leagueoflegends.com/zh-tw/"},zhs:{n:"Wild Rift",s:"https://wildrift.leagueoflegends.com/zh-tw/"}},
 "FC Online (FIFA)":{ko:{n:"FC 모바일",a:"com.nexon.fmk",i:1478371252},en:{n:"EA SPORTS FC Mobile",a:"com.ea.gp.fifamobile",i:1094930513},ja:{n:"EA SPORTS FC Mobile",a:"com.ea.gp.fifamobile",i:1094930513},zht:{n:"EA SPORTS FC Mobile",a:"com.ea.gp.fifamobile",i:1094930513},es:{n:"EA SPORTS FC Mobile",a:"com.ea.gp.fifamobile",i:1094930513},zhs:{n:"EA SPORTS FC Mobile",s:"https://www.ea.com/games/ea-sports-fc/fc-mobile"}},
 "PUBG: BATTLEGROUNDS":{ko:{n:"배틀그라운드 모바일",a:"com.pubg.krmobile",i:1366526331},ja:{n:"PUBG MOBILE",a:"com.pubg.krmobile",i:1366526331},en:{n:"PUBG MOBILE",a:"com.tencent.ig",i:1330123889},es:{n:"PUBG MOBILE",a:"com.tencent.ig",i:1330123889},zht:{n:"PUBG MOBILE",s:"https://www.pubgmobile.com/"},zhs:{n:"PUBG MOBILE",s:"https://www.pubgmobile.com/"}},
 "Black Desert":{ko:{n:"검은사막 모바일",a:"com.pearlabyss.blackdesertm",i:1323002999},en:{n:"Black Desert Mobile",a:"com.pearlabyss.blackdesertm.gl",i:1477186880},ja:{n:"黒い砂漠 MOBILE",a:"com.pearlabyss.blackdesertm.gl",i:1477186880},zht:{n:"黑色沙漠 MOBILE",a:"com.pearlabyss.blackdesertm.gl",i:1477186880},es:{n:"Black Desert Mobile",a:"com.pearlabyss.blackdesertm.gl",i:1477186880}},
 "MapleStory":{ko:{n:"메이플스토리M",a:"com.nexon.nsc.maplem",i:1133463693},en:{n:"MapleStory M",a:"com.nexon.maplem.global",i:1290086677},zht:{n:"MapleStory M",a:"com.nexon.maplem.global",i:1290086677},es:{n:"MapleStory M",a:"com.nexon.maplem.global",i:1290086677}},
 "Dungeon & Fighter":{all:{n:"던전앤파이터 모바일",a:"com.nexon.mdnf",i:1448979486,kr:1}},
 "Ragnarok Online":{ko:{n:"라그나로크M: ETERNAL LOVE",a:"com.gravity.rom.aos",i:1297870337},en:{n:"Ragnarok M: Eternal Love",a:"com.gravity.romNAg",i:1444739251}}
};
var CC={ko:"kr",en:"us",ja:"jp",zhs:"cn",zht:"tw",es:"es"};
var MOBT={ko:"모바일",en:"Mobile",ja:"モバイル",zhs:"手机版",zht:"手機版",es:"Móvil"}, KRONLY={ko:"한국 전용",en:"Korea only",ja:"韓国のみ",zhs:"仅限韩国",zht:"僅限韓國",es:"solo Corea"};
function mobLink(g,l){ var m=MOB[g.n]; if(!m) return ""; var o=m[l]||m.all; if(!o) return ""; var ua=navigator.userAgent||"", u;
  if(o.s) u=o.s; else if(/iPhone|iPad|iPod/i.test(ua)) u="https://apps.apple.com/"+(o.kr?"kr":(CC[l]||"us"))+"/app/id"+o.i; else u="https://play.google.com/store/apps/details?id="+o.a;
  return '<a class="pcx2" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(L(MOBT))+': '+esc(o.n)+(o.kr&&l!=="ko"?' ('+esc(L(KRONLY))+')':'')+' ›</a>'; }
var GAMES=[
 {n:"Steam", by:"Valve", u:{ko:"https://store.steampowered.com/?l=koreana",en:"https://store.steampowered.com/?l=english",ja:"https://store.steampowered.com/?l=japanese",zhs:"https://store.steampowered.com/?l=schinese",zht:"https://store.steampowered.com/?l=tchinese",es:"https://store.steampowered.com/?l=spanish"},
  d:{ko:"세계 최대 PC 게임 상점 — 내 계정으로 로그인해 게임 실행",en:"The world’s biggest PC game store — log in to play your games",ja:"世界最大のPCゲームストア — 自分のアカウントでログインしてプレイ",zhs:"全球最大的PC游戏商店 — 登录自己的账号即可开玩",zht:"全球最大的PC遊戲商店 — 登入自己的帳號即可開玩",es:"La mayor tienda de juegos de PC del mundo: inicia sesión y juega"}},
 {n:"League of Legends", by:"Riot Games", u:{ko:"https://www.leagueoflegends.com/ko-kr/",en:"https://www.leagueoflegends.com/en-us/",ja:"https://www.leagueoflegends.com/ja-jp/",zhs:"https://lol.qq.com/",zht:"https://www.leagueoflegends.com/zh-tw/",es:"https://www.leagueoflegends.com/es-es/"},
  d:{ko:"한국 PC방 점유율 1위 — 5대5 팀 전략 게임",en:"No. 1 game in Korean PC bangs — 5-vs-5 team strategy",ja:"韓国PC房の人気No.1 — 5対5のチーム戦略ゲーム",zhs:"韩国网吧人气第一 — 5对5团队策略游戏",zht:"韓國網咖人氣第一 — 5對5團隊策略遊戲",es:"El juego n.º 1 en los PC bang coreanos: estrategia por equipos 5 contra 5"}},
 {n:"FC Online (FIFA)", by:"NEXON", u:{ko:"https://fconline.nexon.com/",en:"https://fconline.nexon.com/"}, x:{t:"EA SPORTS FC", u:{ko:"https://www.ea.com/ko/games/ea-sports-fc",en:"https://www.ea.com/games/ea-sports-fc",ja:"https://www.ea.com/ja/games/ea-sports-fc",zht:"https://www.ea.com/zh-hant/games/ea-sports-fc",es:"https://www.ea.com/es/games/ea-sports-fc"}},
  d:{ko:"한국 PC방의 축구 게임(옛 FIFA 온라인 4) — 세계판 EA SPORTS FC는 Steam에서",en:"The football game of Korean PC bangs (formerly FIFA Online 4) — the global EA SPORTS FC is on Steam",ja:"韓国PC房のサッカーゲーム（旧FIFAオンライン4）— 世界版EA SPORTS FCはSteamで",zhs:"韩国网吧的足球游戏（原FIFA Online 4）— 全球版EA SPORTS FC在Steam上",zht:"韓國網咖的足球遊戲（原FIFA Online 4）— 全球版EA SPORTS FC在Steam上",es:"El juego de fútbol de los PC bang coreanos (antes FIFA Online 4); el EA SPORTS FC global está en Steam"}},
 {n:"StarCraft: Remastered", by:"Blizzard", u:{ko:"https://starcraft.blizzard.com/ko-kr",en:"https://starcraft.blizzard.com/en-us",zht:"https://starcraft.blizzard.com/zh-tw",es:"https://starcraft.blizzard.com/es-es"},
  d:{ko:"한국 PC방 문화를 만든 전설의 실시간 전략 게임",en:"The legendary real-time strategy game that built Korea’s PC bang culture",ja:"韓国のPC房文化を生んだ伝説のリアルタイム戦略ゲーム",zhs:"开创韩国网吧文化的传奇即时战略游戏",zht:"開創韓國網咖文化的傳奇即時戰略遊戲",es:"El legendario juego de estrategia en tiempo real que creó la cultura de los PC bang"}},
 {n:"PUBG: BATTLEGROUNDS", by:"KRAFTON", u:{ko:"https://pubg.com/ko",en:"https://pubg.com/en",ja:"https://pubg.com/ja",zhs:"https://pubg.com/zh-cn",zht:"https://pubg.com/zh-tw",es:"https://pubg.com/es-es"},
  d:{ko:"100명이 섬에 떨어져 마지막 한 명이 남을 때까지 싸우는 배틀로얄",en:"Battle royale: 100 players drop onto an island and fight until one is left",ja:"100人が島に降り立ち最後の1人まで戦うバトルロイヤル",zhs:"100名玩家空降海岛、战到最后一人的大逃杀",zht:"100名玩家空降海島、戰到最後一人的大逃殺",es:"Battle royale: 100 jugadores caen en una isla y luchan hasta que queda uno"}},
 {n:"Lost Ark", by:"Smilegate", u:{ko:"https://lostark.game.onstove.com/",en:"https://www.playlostark.com/en-us",es:"https://www.playlostark.com/es-es"},
  d:{ko:"화려한 전투의 쿼터뷰 액션 MMORPG",en:"Action MMORPG with spectacular top-down combat",ja:"華やかな戦闘のクォータービュー・アクションMMORPG",zhs:"战斗华丽的俯视角动作MMORPG",zht:"戰鬥華麗的俯視角動作MMORPG",es:"MMORPG de acción con combates espectaculares en vista cenital"}},
 {n:"Black Desert", by:"Pearl Abyss", u:{ko:"https://www.kr.playblackdesert.com/ko-KR",en:"https://www.naeu.playblackdesert.com/en-US",ja:"https://www.jp.playblackdesert.com/ja-JP",zhs:"https://www.tw.playblackdesert.com/zh-TW",zht:"https://www.tw.playblackdesert.com/zh-TW",es:"https://www.naeu.playblackdesert.com/es-ES"},
  d:{ko:"넓은 세계를 누비는 사실적인 그래픽의 오픈월드 MMORPG",en:"Open-world MMORPG with realistic graphics and a huge world",ja:"広大な世界を旅するリアルなグラフィックのオープンワールドMMORPG",zhs:"画面写实、世界广阔的开放世界MMORPG",zht:"畫面寫實、世界廣闊的開放世界MMORPG",es:"MMORPG de mundo abierto con gráficos realistas y un mundo enorme"}},
 {n:"MapleStory", by:"NEXON", u:{ko:"https://maplestory.nexon.com/",en:"https://maplestory.nexon.net/",ja:"https://maplestory.nexon.co.jp/",zht:"https://maplestory.beanfun.com/"},
  d:{ko:"귀여운 캐릭터로 즐기는 옆으로 가는 2D 온라인 RPG",en:"Side-scrolling 2D online RPG with cute characters",ja:"かわいいキャラクターで遊ぶ横スクロール2DオンラインRPG",zhs:"角色可爱的横版2D网络RPG",zht:"角色可愛的橫向2D線上RPG",es:"RPG online 2D de desplazamiento lateral con personajes adorables"}},
 {n:"Dungeon & Fighter", by:"NEXON / Neople", u:{ko:"https://df.nexon.com/",en:"https://www.dfoneople.com/"},
  d:{ko:"오락실 느낌의 2D 격투 액션 RPG",en:"Arcade-style 2D beat-’em-up action RPG",ja:"ゲームセンター風の2D格闘アクションRPG",zhs:"街机风格的2D格斗动作RPG",zht:"街機風格的2D格鬥動作RPG",es:"RPG de acción 2D estilo arcade de peleas"}},
 {n:"THRONE AND LIBERTY", by:"NCSOFT", u:{ko:"https://tl.plaync.com/ko-kr/index",en:"https://www.playthroneandliberty.com/en-us",es:"https://www.playthroneandliberty.com/es-es"},
  d:{ko:"날씨·밤낮이 바뀌는 세계에서 변신하며 싸우는 MMORPG",en:"MMORPG where you shapeshift in a world of changing weather and day/night",ja:"天候や昼夜が変わる世界で変身しながら戦うMMORPG",zhs:"在天气与昼夜变化的世界中变身战斗的MMORPG",zht:"在天氣與晝夜變化的世界中變身戰鬥的MMORPG",es:"MMORPG en el que te transformas en un mundo con clima y día/noche cambiantes"}},
 {n:"Ragnarok Online", by:"Gravity", u:{ko:"https://ro.gnjoy.com/",en:"https://playragnarok.com/",ja:"https://ragnarokonline.gungho.jp/",zht:"https://ro.gnjoy.com.tw/"},
  d:{ko:"2002년부터 이어진 원조 한국 온라인 RPG",en:"The classic Korean online RPG, running since 2002",ja:"2002年から続く元祖韓国オンラインRPG",zhs:"自2002年运营至今的元祖韩国网络RPG",zht:"自2002年營運至今的元祖韓國線上RPG",es:"El RPG online coreano clásico, en marcha desde 2002"}}
];
var TX={
 t:{ko:"PC방",en:"PC Bang (gaming café)",ja:"PC房（ネットカフェ）",zhs:"网吧（PC房）",zht:"網咖（PC房）",es:"PC Bang (cibercafé gamer)"},
 s:{ko:"한국 PC방은 시간당 요금으로 고사양 게임 PC를 쓰는 곳이에요. 컵라면·음료도 팔아요.",en:"Korean PC bangs rent high-end gaming PCs by the hour — snacks and cup noodles too.",ja:"韓国のPC房は高性能ゲームPCを時間料金で使える場所。カップ麺や飲み物もあります。",zhs:"韩国网吧按小时计费使用高配游戏电脑，还卖泡面和饮料。",zht:"韓國網咖按小時計費使用高規格遊戲電腦，還賣泡麵和飲料。",es:"En los PC bang coreanos alquilas PCs gamer potentes por horas; también venden fideos y bebidas."},
 st:{ko:"Steam 열기",en:"Open Steam",ja:"Steamを開く",zhs:"打开 Steam",zht:"打開 Steam",es:"Abrir Steam"},
 g:{ko:"한국 PC방에서 인기 있는 게임",en:"Popular in Korean PC bangs",ja:"韓国のPC房で人気のゲーム",zhs:"韩国网吧热门游戏",zht:"韓國網咖熱門遊戲",es:"Lo más jugado en los PC bang coreanos"},
 h:["근처 PC방","PC bangs nearby","近くのPC房","附近的网吧","附近的網咖","PC bang cercanos"]
};
var st=document.createElement("style");
st.textContent=".pcbc .pcbh{display:flex;align-items:center;gap:10px}.pcbc .pcbh img{width:54px;height:auto}.pcbc .pcbh b{font-size:17px}"
 +".pcbc .pcbs{font-size:13.5px;line-height:1.5;color:var(--sub);margin:6px 0 10px}"
 +".pcbc a.pcst{display:block;text-align:center;background:#1b2838;color:#fff;font-weight:800;font-size:16px;border-radius:12px;padding:12px;text-decoration:none}"
 +".pcbc .pcgh{font-weight:900;font-size:15px;margin:14px 2px 6px}"
 +".pcbc a.pcg{display:block;border:1.5px solid var(--line);border-radius:12px;padding:9px 12px;margin:6px 0;text-decoration:none;color:var(--ink)}.pcbc a.pcg b{font-size:15px}.pcbc a.pcg i{font-style:normal;font-size:12px;color:var(--sub);margin-left:6px}.pcbc .pcgw{position:relative}.pcbc a.pcx2{display:inline-block;margin:-2px 0 6px 12px;font-size:12.5px;font-weight:800;color:#1a73e8;text-decoration:none}.pcbc a.pcg div{font-size:13px;color:var(--sub);margin-top:2px;line-height:1.4}";
document.head.appendChild(st);
function card(code){ var D=window.GU&&GU.d, o=D&&D.pcb&&D.pcb[code]; if(!o) return; var k="pcb_"+code, l=window.LANG;
  window.PLACES[k]={ko:"PC방",en:"PC Bang",ja:"PC房",zhs:"网吧",zht:"網咖",es:"PC Bang",lat:+o.lat,lng:+o.lng};
  window.AREAEXP[k]="pcbang"; window.GA_H.pcbang=TX.h; window.GA_IC.pcbang="mi_device";
  var res=document.getElementById("res"); if(!res) return; window._cardK=k;
  var gn=window.LP?LP(o.n):o.g, h='<div class="item pcbc"><div class="pcbh"><img src="'+esc((D.P["pcbang@"+code]||{}).i||"")+'" alt=""><b>'+esc(L(TX.t))+' · '+esc(gn)+'</b></div>'
    +'<div class="pcbs">'+esc(L(TX.s))+'</div>'
    +'<div class="pcgh">'+esc(L(TX.g))+'</div>';
  GAMES.forEach(function(g,i){ h+='<div class="pcgw"><a class="pcg" data-pcx="g'+i+'" href="'+esc(g.u[l]||g.u.en)+'" target="_blank" rel="noopener"><b>'+esc(g.n)+'</b><i>'+esc(g.by)+'</i><div>'+esc(L(g.d))+'</div></a>'+(g.x?'<a class="pcx2" href="'+esc(g.x.u[l]||g.x.u.en)+'" target="_blank" rel="noopener">'+esc(g.x.t)+' ›</a>':'')+mobLink(g,l)+'</div>'; });
  res.innerHTML=h+'</div>';
  try{ ntap("pcb_"+code,"tap"); }catch(e){}   // 그림별 누름 통계 (기존 칸)
  try{ window.mpPaid&&mpPaid.start("pcb_"+code); }catch(e){}   // 유료 콘텐츠 통계 — 단추로 나가는 것은 karaoke.js 가 #res 링크 누름으로 센다
  try{ areaExpShow(k); }catch(e){}
  try{ res.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){} }
window.pcbCard=card;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__pcb_([a-z]+)$/.exec(k||""); if(m){ card(m[1]); return; } return _hc.apply(this,arguments); };
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ var m=/^pcb_([a-z]+)$/.exec(window._cardK||""); if(m) card(m[1]); }catch(e){} return r; };
})();
