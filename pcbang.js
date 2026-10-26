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
var GAMES=[
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
 g:{ko:"세계에서 많이 하는 한국 게임",en:"Korean games played around the world",ja:"世界で人気の韓国ゲーム",zhs:"风靡全球的韩国游戏",zht:"風靡全球的韓國遊戲",es:"Juegos coreanos populares en todo el mundo"},
 h:["근처 PC방","PC bangs nearby","近くのPC房","附近的网吧","附近的網咖","PC bang cercanos"]
};
var st=document.createElement("style");
st.textContent=".pcbc .pcbh{display:flex;align-items:center;gap:10px}.pcbc .pcbh img{width:54px;height:auto}.pcbc .pcbh b{font-size:17px}"
 +".pcbc .pcbs{font-size:13.5px;line-height:1.5;color:var(--sub);margin:6px 0 10px}"
 +".pcbc a.pcst{display:block;text-align:center;background:#1b2838;color:#fff;font-weight:800;font-size:16px;border-radius:12px;padding:12px;text-decoration:none}"
 +".pcbc .pcgh{font-weight:900;font-size:15px;margin:14px 2px 6px}"
 +".pcbc a.pcg{display:block;border:1.5px solid var(--line);border-radius:12px;padding:9px 12px;margin:6px 0;text-decoration:none;color:var(--ink)}.pcbc a.pcg b{font-size:15px}.pcbc a.pcg i{font-style:normal;font-size:12px;color:var(--sub);margin-left:6px}.pcbc a.pcg div{font-size:13px;color:var(--sub);margin-top:2px;line-height:1.4}";
document.head.appendChild(st);
function card(code){ var D=window.GU&&GU.d, o=D&&D.pcb&&D.pcb[code]; if(!o) return; var k="pcb_"+code, l=window.LANG;
  window.PLACES[k]={ko:"PC방",en:"PC Bang",ja:"PC房",zhs:"网吧",zht:"網咖",es:"PC Bang",lat:+o.lat,lng:+o.lng};
  window.AREAEXP[k]="pcbang"; window.GA_H.pcbang=TX.h; window.GA_IC.pcbang="mi_device";
  var res=document.getElementById("res"); if(!res) return; window._cardK=k;
  var gn=window.LP?LP(o.n):o.g, h='<div class="item pcbc"><div class="pcbh"><img src="'+esc((D.P["pcbang@"+code]||{}).i||"")+'" alt=""><b>'+esc(L(TX.t))+' · '+esc(gn)+'</b></div>'
    +'<div class="pcbs">'+esc(L(TX.s))+'</div>'
    +'<a class="pcst" data-pcx="steam" href="https://store.steampowered.com/?l='+(STEAM_L[l]||"english")+'" target="_blank" rel="noopener">'+esc(L(TX.st))+' ›</a>'
    +'<div class="pcgh">'+esc(L(TX.g))+'</div>';
  GAMES.forEach(function(g,i){ h+='<a class="pcg" data-pcx="g'+i+'" href="'+esc(g.u[l]||g.u.en)+'" target="_blank" rel="noopener"><b>'+esc(g.n)+'</b><i>'+esc(g.by)+'</i><div>'+esc(L(g.d))+'</div></a>'; });
  res.innerHTML=h+'</div>';
  [].forEach.call(res.querySelectorAll("[data-pcx]"),function(a){ a.addEventListener("click",function(){ try{ ntap("pcb_"+code,"out_"+a.dataset.pcx); }catch(e){} try{ window.mpOut&&mpOut("pcb_"+code); }catch(e){} }); });
  try{ ntap("pcb_"+code,"open_card"); }catch(e){}
  try{ areaExpShow(k); }catch(e){}
  try{ res.scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){} }
window.pcbCard=card;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__pcb_([a-z]+)$/.exec(k||""); if(m){ card(m[1]); return; } return _hc.apply(this,arguments); };
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ var m=/^pcb_([a-z]+)$/.exec(window._cardK||""); if(m) card(m[1]); }catch(e){} return r; };
})();
