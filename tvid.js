/* 머니퍼즐 투어 — 유튜브 상영관을 앱 안에서 (사장님 2026-10-28)
 *  · 지도 위 「유튜브 상영관」(장소 app:"youtube")을 누르면 바깥 유튜브 대신 이 창 — 한국 관광 공식 채널 영상만 골라 묶음별로
 *  · 영상 목록 = data/tvid.json (VISITKOREA·VisitSeoul TV·VISIT BUSAN·Visit Jeju Global·강원관광재단·인천관광공사 — oEmbed 200 확인한 것만)
 *  · 넷플릭스 상영관(app:"netflix")도 같은 창 — Netflix Korea 공식 채널(+Netflix 본 채널) 예고편 data/tvid_nf.json, 맨 아래 「넷플릭스 앱에서 보기」= appGo("netflix")
 *  · 재생은 karaoke.js 와 같은 유튜브 퍼가기 플레이어(IFrame API). 막힌 영상은 「유튜브에서 열기」. 검색창 없음
 *  · 음악 감상실(「__music」 — 서울 전체 관악산 기슭 옛 노래방 칸, 사장님 11-05) = 같은 창·같은 플레이어 + 위에 검색칸.
 *    허브 /ytsearch(공식 YouTube Data API v3, 퍼가기 되는 음악 영상만) → 조회수 많은 순 10개(11-05 5→10) · (11-07~) 노래방(StageSong) 첫 화면 같은 보라색 — 폭 가득 플레이어 + 동그란 단추 7개(⏮ ▶ ⏭ ⏹ 반복 셔플 소리, 노래방 메뉴 단추 색)로 이어 듣기·반복·셔플 · 옛 금색 주크박스 그림(img/music/jukebox_ml3.webp)은 안 씀 · 플레이어는 늘 보이고 위를 덮지 않음(막힘 안내는 플레이어 밖) ·
 *    앱이 화면에서 사라지면 일시정지 · 창 아래 YouTube 서비스 약관·구글 개인정보처리방침 링크
 *  · 11-05 사장님 「가」 — 유튜브·넷플릭스 상영관도 같은 유튜브 규칙 세 가지: 숨으면 일시정지 · 맨 아래 약관 링크 줄 · 막힌 영상 안내는 플레이어 아래 한 줄
 */
(function(){
"use strict";
function L(o){ return o[window.LANG]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var G=[
 ["all",{ko:"전국",en:"All Korea",ja:"韓国全土",zhs:"韩国全境",zht:"韓國全境",es:"Toda Corea"}],
 ["seoul",{ko:"서울",en:"Seoul",ja:"ソウル",zhs:"首尔",zht:"首爾",es:"Seúl"}],
 ["busan",{ko:"부산",en:"Busan",ja:"釜山",zhs:"釜山",zht:"釜山",es:"Busan"}],
 ["jeju",{ko:"제주",en:"Jeju",ja:"済州",zhs:"济州",zht:"濟州",es:"Jeju"}],
 ["gyeongju",{ko:"경주·경상",en:"Gyeongju·Gyeongsang",ja:"慶州・慶尚",zhs:"庆州·庆尚",zht:"慶州·慶尚",es:"Gyeongju·Gyeongsang"}],
 ["gangwon",{ko:"강원",en:"Gangwon",ja:"江原",zhs:"江原",zht:"江原",es:"Gangwon"}],
 ["jeolla",{ko:"전라",en:"Jeolla",ja:"全羅",zhs:"全罗",zht:"全羅",es:"Jeolla"}],
 ["chung",{ko:"충청",en:"Chungcheong",ja:"忠清",zhs:"忠清",zht:"忠清",es:"Chungcheong"}],
 ["gyeonggi",{ko:"경기·인천",en:"Gyeonggi·Incheon",ja:"京畿・仁川",zhs:"京畿·仁川",zht:"京畿·仁川",es:"Gyeonggi·Incheon"}]];
var GNF=[
 ["drama",{ko:"드라마",en:"Series",ja:"ドラマ",zhs:"剧集",zht:"影集",es:"Series"}],
 ["movie",{ko:"영화",en:"Films",ja:"映画",zhs:"电影",zht:"電影",es:"Películas"}],
 ["show",{ko:"예능",en:"Reality & Variety",ja:"バラエティ",zhs:"综艺",zht:"綜藝",es:"Realities"}]];
var TX={
 nt:{ko:"넷플릭스 예고편",en:"Netflix Trailers",ja:"Netflix 予告編",zhs:"Netflix 预告片",zht:"Netflix 預告片",es:"Tráileres de Netflix"},
 ns:{ko:"넷플릭스 공식 유튜브 채널의 한국 작품 예고편",en:"Korean titles from Netflix's official YouTube channels",ja:"Netflix公式YouTubeチャンネルの韓国作品予告編",zhs:"来自Netflix官方YouTube频道的韩国作品预告片",zht:"來自Netflix官方YouTube頻道的韓國作品預告片",es:"Títulos coreanos de los canales oficiales de Netflix en YouTube"},
 nb:{ko:"넷플릭스 앱에서 보기",en:"Watch in the Netflix app",ja:"Netflixアプリで見る",zhs:"在Netflix应用中观看",zht:"在Netflix App中觀看",es:"Ver en la app de Netflix"},
 t:{ko:"한국 여행 영상",en:"Korea Travel Videos",ja:"韓国旅行動画",zhs:"韩国旅游视频",zht:"韓國旅遊影片",es:"Vídeos de viaje por Corea"},
 s:{ko:"관광공사·관광재단 공식 유튜브 채널 영상",en:"From official tourism YouTube channels",ja:"観光公社・観光財団の公式YouTubeチャンネル",zhs:"来自旅游机构官方YouTube频道",zht:"來自觀光機構官方YouTube頻道",es:"De canales oficiales de turismo en YouTube"},
 pick:{ko:"아래에서 영상을 고르세요",en:"Pick a video below",ja:"下から動画を選んでください",zhs:"请在下面选择视频",zht:"請在下面選擇影片",es:"Elige un vídeo abajo"},
 ld:{ko:"영상을 불러오는 중…",en:"Loading videos…",ja:"動画を読み込み中…",zhs:"正在加载视频…",zht:"正在載入影片…",es:"Cargando vídeos…"},
 no:{ko:"영상을 불러오지 못했어요.",en:"Could not load videos.",ja:"動画を読み込めませんでした。",zhs:"无法加载视频。",zht:"無法載入影片。",es:"No se pudieron cargar los vídeos."},
 lo:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 yt:{ko:"이 영상은 유튜브에서만 재생돼요",en:"This video plays only on YouTube",ja:"この動画はYouTubeでのみ再生できます",zhs:"此视频只能在YouTube上播放",zht:"此影片只能在YouTube上播放",es:"Este vídeo solo se reproduce en YouTube"},
 ytb:{ko:"유튜브에서 열기",en:"Open on YouTube",ja:"YouTubeで開く",zhs:"在YouTube打开",zht:"在YouTube開啟",es:"Abrir en YouTube"},
 x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 // 음악 감상실 (11-05)
 mt:{ko:"음악 감상실",en:"Music Lounge",ja:"音楽鑑賞室",zhs:"音乐欣赏室",zht:"音樂欣賞室",es:"Sala de música"},
 ms:{ko:"유튜브 음악 영상 검색·감상",en:"Search and play music videos from YouTube",ja:"YouTubeの音楽動画を検索して鑑賞",zhs:"搜索并欣赏YouTube音乐视频",zht:"搜尋並欣賞YouTube音樂影片",es:"Busca y disfruta vídeos musicales de YouTube"},
 mq:{ko:"가수·노래 제목·가사 일부",en:"Artist, song title or lyrics",ja:"歌手・曲名・歌詞の一部",zhs:"歌手、歌名或部分歌词",zht:"歌手、歌名或部分歌詞",es:"Artista, canción o parte de la letra"},
 mb:{ko:"검색",en:"Search",ja:"検索",zhs:"搜索",zht:"搜尋",es:"Buscar"},
 mpk:{ko:"노래를 검색해 선택하세요",en:"Search for a song and pick one",ja:"曲を検索して選んでください",zhs:"请搜索并选择歌曲",zht:"請搜尋並選擇歌曲",es:"Busca una canción y elígela"},
 mhint:{ko:"위 칸에 가수·노래 제목·가사 일부를 입력해 검색하세요. 조회수 많은 순으로 10곡을 보여 드려요.",en:"Type an artist, song title or some lyrics above and search. We'll show the 10 most-viewed songs.",ja:"上の欄に歌手・曲名・歌詞の一部を入力して検索してください。再生回数の多い順に10曲を表示します。",zhs:"请在上方输入歌手、歌名或部分歌词后搜索。将按观看次数从高到低显示10首歌曲。",zht:"請在上方輸入歌手、歌名或部分歌詞後搜尋。將依觀看次數由高到低顯示10首歌曲。",es:"Escribe arriba un artista, una canción o parte de la letra y busca. Te mostraremos las 10 canciones más vistas."},
 msr:{ko:"검색 중…",en:"Searching…",ja:"検索中…",zhs:"正在搜索…",zht:"正在搜尋…",es:"Buscando…"},
 mno:{ko:"검색 결과가 없어요. 다른 검색어로 다시 검색해 보세요.",en:"No songs found. Try different words.",ja:"見つかりませんでした。別の言葉で検索してみてください。",zhs:"没有找到歌曲，请换个关键词再试。",zht:"沒有找到歌曲，請換個關鍵字再試。",es:"No se encontraron canciones. Prueba con otras palabras."},
 merr:{ko:"지금은 검색할 수 없어요. 잠시 뒤 다시 시도해 주세요.",en:"Search isn't available right now. Please try again later.",ja:"ただいま検索できません。しばらくしてからもう一度お試しください。",zhs:"暂时无法搜索，请稍后再试。",zht:"暫時無法搜尋，請稍後再試。",es:"La búsqueda no está disponible ahora. Inténtalo más tarde."},
 vw:{ko:"조회수 {n}회",en:"{n} views",ja:"{n} 回視聴",zhs:"{n}次观看",zht:"{n}次觀看",es:"{n} visualizaciones"},
 tos:{ko:"YouTube 서비스 약관",en:"YouTube Terms of Service",ja:"YouTube 利用規約",zhs:"YouTube 服务条款",zht:"YouTube 服務條款",es:"Términos del Servicio de YouTube"},
 pp:{ko:"구글 개인정보처리방침",en:"Google Privacy Policy",ja:"Google プライバシー ポリシー",zhs:"Google 隐私权政策",zht:"Google 隱私權政策",es:"Política de Privacidad de Google"},
 rep:{ko:"반복 재생",en:"Repeat",ja:"リピート再生",zhs:"循环播放",zht:"循環播放",es:"Repetir"},
 shuf:{ko:"셔플 재생",en:"Shuffle",ja:"シャッフル再生",zhs:"随机播放",zht:"隨機播放",es:"Aleatorio"},
 jprev:{ko:"이전 곡",en:"Previous",ja:"前の曲",zhs:"上一首",zht:"上一首",es:"Anterior"},
 jplay:{ko:"재생",en:"Play",ja:"再生",zhs:"播放",zht:"播放",es:"Reproducir"},
 jpause:{ko:"일시정지",en:"Pause",ja:"一時停止",zhs:"暂停",zht:"暫停",es:"Pausa"},
 jnext:{ko:"다음 곡",en:"Next",ja:"次の曲",zhs:"下一首",zht:"下一首",es:"Siguiente"},
 jstop:{ko:"정지",en:"Stop",ja:"停止",zhs:"停止",zht:"停止",es:"Detener"},
 jmute:{ko:"소리 끄기",en:"Mute",ja:"消音",zhs:"静音",zht:"靜音",es:"Silenciar"},
 junmute:{ko:"소리 켜기",en:"Unmute",ja:"消音を解除",zhs:"取消静音",zht:"取消靜音",es:"Activar sonido"}
};
var st=document.createElement("style");
st.textContent="#tvBox{position:fixed;inset:0;z-index:2147483004;background:radial-gradient(ellipse at 20% 0%,#3a0a0a 0%,#140707 45%,#050303 100%);color:#fff3f0;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden}"
 +"#tvBox .tin{position:relative;max-width:720px;width:100%;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:10px 12px 0}"
 +"#tvBox .thd{display:flex;align-items:center;gap:8px}#tvBox .thd b{font-size:19px;text-shadow:0 0 8px #ff2a2a,0 0 16px #ff7a3c}#tvBox .thd small{display:block;font-size:12px;opacity:.75;font-weight:600}#tvBox .tx{margin-left:auto;white-space:nowrap;flex-shrink:0;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:7px 14px;font-weight:800;cursor:pointer}"
 +"#tvBox .tpl{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 0 18px rgba(255,60,60,.4);flex:0 0 auto;margin-top:8px}#tvBox .tpl .tmsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-weight:800;opacity:.8}#tvBox .tpl iframe{width:100%;height:100%;border:0}"
 +"#tvBox .tov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:rgba(0,0,0,.82);font-weight:800;z-index:2}#tvBox .tov a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:900}"
 +"#tvBox .ttb{display:flex;gap:6px;margin:10px 0 4px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}#tvBox .ttb::-webkit-scrollbar{display:none}#tvBox .ttb button{flex:0 0 auto;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 13px;font-weight:900;cursor:pointer;white-space:nowrap}#tvBox .ttb button.on{background:linear-gradient(90deg,#ff2a2a,#ff7a3c);border-color:transparent}"
 +"#tvBox .tls{flex:1;overflow:auto;margin-top:6px;padding-bottom:16px;-webkit-overflow-scrolling:touch}#tvBox .tit{display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}#tvBox .tit.on{background:rgba(255,60,60,.16);border-radius:10px}"
 +"#tvBox .tit img{width:128px;height:72px;object-fit:cover;border-radius:8px;flex:0 0 auto;background:#222}#tvBox .tit span{flex:1;min-width:0;font-size:14px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}#tvBox .tit i{display:block;font-style:normal;font-size:12px;opacity:.6;margin-top:3px;font-weight:600}#tvBox .tst{font-size:13px;opacity:.75;padding:10px 4px}"
 +"#tvBox .tnf{flex:0 0 auto;margin:6px 0 12px;border:0;border-radius:12px;padding:12px;background:#e50914;color:#fff;font-size:15px;font-weight:900;cursor:pointer}"
 +"#tvBox .tsr{display:flex;gap:6px;margin-top:8px;flex:0 0 auto}#tvBox .tsr input{flex:1;min-width:0;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:9px 14px;font-size:16px;outline:none;-webkit-appearance:none;appearance:none}#tvBox .tsr input::placeholder{color:rgba(255,243,240,.55)}#tvBox .tsr input:focus{border-color:#ff7a3c}#tvBox .tsr button{flex:0 0 auto;border:0;border-radius:999px;padding:9px 16px;background:linear-gradient(90deg,#ff2a2a,#ff7a3c);color:#fff;font-size:15px;font-weight:900;cursor:pointer}"
 +"#tvBox .tnote{flex:0 0 auto;margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;font-weight:800}#tvBox .tnote[hidden]{display:none}#tvBox .tnote a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:6px 12px;font-weight:900}"
 +"#tvBox .tit span.tmu{display:block}#tvBox .tmu em{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#tvBox .tmu i{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
 +"#tvBox .tft{flex:0 0 auto;text-align:center;font-size:12px;font-weight:600;line-height:1.5;padding:8px 4px calc(10px + env(safe-area-inset-bottom));opacity:.75}#tvBox .tft a{color:inherit;text-decoration:underline}"
 +"#tvBox.mu{background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff}#tvBox.mu .thd b{text-shadow:0 0 8px #b04bff,0 0 16px #ff4fd8}"   /* 음악 감상실 = 노래방(StageSong) 첫 화면과 같은 보라색 (11-07 사장님) */
 +"#tvBox.mu .tsr input:focus{border-color:#ff9be6}#tvBox.mu .tsr button{background:#ff4fd8}#tvBox.mu .tsr input::placeholder{color:rgba(245,234,255,.55)}"
 +"#tvBox.mu .tpl{min-height:200px;max-height:52vh;max-height:52dvh;box-shadow:0 0 18px rgba(170,90,255,.45)}#tvBox.mu .tpl .tmsg{color:#eadcff}"   /* 플레이어 = 화면 폭 가득 16:9 · 세로 200px 이상 (유튜브 최소 200×200) */
 +"#tvBox.mu .tnow{flex:0 0 auto;margin:8px 2px 0;min-width:0;text-align:center}#tvBox.mu .tnow[hidden]{display:none}#tvBox.mu .tnow b{display:block;font-size:15px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0 8px rgba(176,75,255,.7)}#tvBox.mu .tnow small{display:block;font-size:12px;font-weight:700;color:#ff9be6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}"   /* 지금 곡 제목·채널 */
 +"#tvBox.mu .tdk{flex:0 0 auto;display:flex;justify-content:center;align-items:center;gap:clamp(5px,2vw,14px);margin:12px 0 6px;padding-bottom:4px}"
 +"#tvBox.mu .tdb{flex:0 0 auto;width:clamp(38px,11vw,56px);aspect-ratio:1;border-radius:50%;border:1.5px solid var(--c);color:var(--c);padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.2) 0,rgba(255,255,255,.05) 55%,rgba(255,255,255,0) 72%),#1c0f2e;box-shadow:0 4px 0 #07040c,0 0 12px -3px var(--c);transition:transform .08s,box-shadow .08s,background .15s,color .15s}"
 +"#tvBox.mu .tdb svg{width:56%;height:56%;fill:currentColor;display:block}"
 +"#tvBox.mu .tdb:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 #07040c,0 0 8px -3px var(--c)}"   /* 누르면 아래로 들어감 */
 +"#tvBox.mu .tdb.on,#tvBox.mu .tdb.mut{background:var(--c);color:#1c0f2e;transform:translateY(3px);box-shadow:0 1px 0 #07040c,0 0 16px 1px var(--c)}"   /* 켜짐(반복·셔플)·소리 끔 = 눌린 채 + 색 채움 */
 +"#tvBox.mu .tdb:disabled{opacity:.38;cursor:default}"
 +"#tvBox.mu .tls{margin-top:4px;scrollbar-color:rgba(200,160,255,.45) transparent}#tvBox.mu .tit img{width:104px;height:58px}#tvBox.mu .tit.on{background:rgba(170,90,255,.24)}#tvBox.mu .tmu i{color:#d9c6ff}#tvBox.mu .tst{color:#eadcff}";   /* 곡 목록 (화면 아래 남은 칸에서만 스크롤) */
document.head.appendChild(st);
var MD={yt:{G:G,t:"t",s:"s",f:"data/tvid.json",k:"youtubeth",g:"all"},nf:{G:GNF,t:"nt",s:"ns",f:"data/tvid_nf.json",k:"netflixth",g:"drama"},mu:{G:[],t:"mt",s:"ms",k:"musiclounge",g:""}};
var T={m:"yt",cache:{},g:"all",all:null,idx:-1,pl:null,ready:false,want:"",res:[],mst:"",sq:0,ord:[],pos:-1,rep:false,shuf:false,mut:false};   // mut = 소리 끔   // ord·pos = 음악 감상실 재생 순서·지금 자리, rep·shuf = 반복·셔플 (기본 끔)   // res·mst·sq = 음악 감상실 검색 결과·안내 문구·검색 차례
function ytApi(cb){ if(window.YT&&YT.Player) return cb(); var prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=function(){ try{ prev&&prev(); }catch(e){} cb(); };
  if(!document.getElementById("ytApiJs")){ var s=document.createElement("script"); s.id="ytApiJs"; s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }
function box(){ return document.getElementById("tvBox"); }
function items(){ if(T.m==="mu") return T.res||[]; return (T.all||[]).filter(function(x){ return x.g===T.g; }); }
function paintList(){ if(T.m==="mu") return paintMu(); var b=box(); if(!b) return; var el=b.querySelector(".tls");
  if(T.all===null){ el.innerHTML='<div class="tst">'+esc(L(TX.ld))+'</div>'; return; }
  var a=items(); if(!a.length){ el.innerHTML='<div class="tst">'+esc(L(TX.no))+'</div>'; return; }
  el.innerHTML=a.map(function(x,i){ return '<div class="tit'+(i===T.idx?' on':'')+'" data-i="'+i+'"><img loading="lazy" src="https://i.ytimg.com/vi/'+encodeURIComponent(x.id)+'/mqdefault.jpg" alt=""><span>'+esc(x.t)+'<i>'+esc(x.ch)+'</i></span></div>'; }).join("");
  [].forEach.call(el.querySelectorAll(".tit"),function(d){ d.onclick=function(){ play(+d.dataset.i); }; }); }
function ov(html,t){ var b=box(); if(!b) return; var pl=b.querySelector(".tpl"), o=pl.querySelector(".tov"); if(!html){ if(o&&(!t||o.dataset.t===t)) o.remove(); return; } if(!o){ o=document.createElement("div"); o.className="tov"; pl.appendChild(o); } o.dataset.t=t||""; o.innerHTML=html; }
function blocked(x){ try{ T.pl&&T.pl.pauseVideo&&T.pl.pauseVideo(); }catch(e){}
  ov("","");   // 플레이어 위 덮개(불러오는 중)는 걷는다
  var nt=box()&&box().querySelector(".tnote"); if(nt){ nt.innerHTML='<span>'+esc(L(TX.yt))+'</span><a href="https://www.youtube.com/watch?v='+encodeURIComponent(x.id)+'" target="_blank" rel="noopener" data-tyt="1">'+esc(L(TX.ytb))+'</a>'; nt.hidden=false; }   // 플레이어 아래 한 줄 (플레이어 위를 덮지 않음, 11-05 모든 상영관)
  var a=box()&&box().querySelector("[data-tyt]"); if(a) a.addEventListener("click",function(){ try{ mpPaid.out(); }catch(e){} }); }
function play(i){ var x=items()[i]; if(!x) return; T.idx=i; paintList(); var b=box(); if(!b) return; var pl=b.querySelector(".tpl");
  try{ ntap(MD[T.m].k,"tv_"+x.id.replace(/[^A-Za-z0-9_-]/g,"")); }catch(e){}
  var m0=pl.querySelector(".tmsg"); if(m0){ if(!T.pl) m0.textContent=L(TX.lo); else m0.remove(); } ov("","");   // 플레이어가 생기기 전까지만 「불러오는 중」 (11-05 상영관도 음악 감상실과 같게 — 자동 재생이 막혀도 ▶ 를 누를 수 있게)
  var nt=b.querySelector(".tnote"); if(nt){ nt.hidden=true; nt.innerHTML=""; } T.want=x.id; T.cur=x;   // 막힘 안내 줄 지움 · 플레이어를 덮는 안내는 안 띄운다 (11-05 모든 상영관)
  ytApi(function(){ if(!box()) return; var m1=pl.querySelector(".tmsg"); if(m1) m1.remove();
    if(T.pl){ if(T.ready) T.pl.loadVideoById(x.id); return; }   // 플레이어는 하나만
    var d=document.createElement("div"); d.id="tvYt"; pl.insertBefore(d,pl.firstChild);
    T.pl=new YT.Player("tvYt",{videoId:x.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:function(){ T.ready=true; if(T.want&&T.pl.getVideoData&&T.pl.getVideoData().video_id!==T.want) T.pl.loadVideoById(T.want); if(T.m==="mu"){ if(T.mut){ try{ T.pl.mute(); }catch(e){} } muDeck(); } },
      onError:function(){ if(T.cur) blocked(T.cur); },
      onStateChange:function(ev){ if(ev&&ev.data===1) ov("","lo"); if(ev&&ev.data===0&&T.m==="mu") muNext(); if(T.m==="mu") muDeck(); } }}); }); }   // 0 = 곡 끝 → 음악 감상실 이어 듣기
function load(){ var m=T.m; if(T.cache[m]&&T.cache[m].length){ T.all=T.cache[m]; paintList(); return; } T.all=null; paintList();
  fetch(MD[m].f+"?v=1028tv").then(function(r){ return r.json(); }).then(function(j){ var a=(j&&j.items)||[]; T.cache[m]=a; if(T.m===m){ T.all=a; paintList(); } }).catch(function(){ if(T.m===m){ T.all=[]; paintList(); } }); }
function open(mode){ var M=MD[mode]||MD.yt; T.m=MD[mode]?mode:"yt"; T.g=M.g; T.all=null; T.idx=-1; T.pl=null; T.ready=false; T.want=""; T.cur=null; T.res=[]; T.mst="mhint"; T.sq++; T.ord=[]; T.pos=-1; T.rep=false; T.shuf=false; T.mut=false; var old=box(); if(old) old.remove();
  var b=document.createElement("div"); b.id="tvBox";
  if(T.m==="mu") return muOpen(b,M);
  b.innerHTML='<div class="tin"><div class="thd"><div><b>'+esc(L(TX[M.t]))+'</b><small>'+esc(L(TX[M.s]))+'</small></div><button type="button" class="tx">✕ '+esc(L(TX.x))+'</button></div>'
    +'<div class="tpl"><div class="tmsg">'+esc(L(TX.pick))+'</div></div><div class="tnote" hidden></div>'
    +'<div class="ttb">'+M.G.map(function(g){ return '<button type="button" data-g="'+g[0]+'"'+(g[0]===T.g?' class="on"':'')+'>'+esc(L(g[1]))+'</button>'; }).join("")+'</div>'
    +'<div class="tls"></div>'+(T.m==="nf"?'<button type="button" class="tnf">'+esc(L(TX.nb))+'</button>':'')+ftHtml()+'</div>';   // 약관 링크 줄 = 맨 아래 (넷플릭스 단추 아래, 11-05)
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".tx").onclick=close;
  [].forEach.call(b.querySelectorAll(".ttb button"),function(t){ t.onclick=function(){ T.g=t.dataset.g; T.idx=-1; [].forEach.call(b.querySelectorAll(".ttb button"),function(x){ x.classList.toggle("on",x===t); }); paintList(); b.querySelector(".tls").scrollTop=0; }; });
  var nb=b.querySelector(".tnf"); if(nb) nb.onclick=function(){ try{ mpPaid.out(); }catch(e){} try{ T.pl&&T.pl.pauseVideo&&T.pl.pauseVideo(); }catch(e){} try{ appGo("netflix"); }catch(e){} };
  load(); }
// ── 음악 감상실 (사장님 11-05) — 검색 → 조회수 많은 순 10개 → 골라 듣기(같은 플레이어) → 이어 듣기·반복·셔플 ──
var LOC={ko:"ko-KR",en:"en-US",ja:"ja-JP",zhs:"zh-CN",zht:"zh-TW",es:"es-ES"};
function fmtV(n){ var s; try{ s=new Intl.NumberFormat(LOC[window.LANG]||"en-US",{notation:"compact"}).format(+n||0); }catch(e){ s=String(+n||0); } return L(TX.vw).replace("{n}",s); }
function thumbOf(x){ return /^https:\/\/i\.ytimg\.com\//.test(x.thumb||"")?x.thumb:"https://i.ytimg.com/vi/"+encodeURIComponent(x.id)+"/mqdefault.jpg"; }
function ftHtml(){ return '<div class="tft"><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener">'+esc(L(TX.tos))+'</a> · <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">'+esc(L(TX.pp))+'</a></div>'; }   // 맨 아래 YouTube 서비스 약관 · 구글 개인정보처리방침 (모든 상영관·음악 감상실)
function paintMu(){ var b=box(); if(!b) return; var el=b.querySelector(".tls");
  muDeck(); if(T.mst){ el.innerHTML='<div class="tst">'+esc(L(TX[T.mst]))+'</div>'; return; }
  el.innerHTML=(T.res||[]).map(function(x,i){ return '<div class="tit'+(i===T.idx?' on':'')+'" data-i="'+i+'"><img loading="lazy" src="'+esc(thumbOf(x))+'" alt=""><span class="tmu"><em>'+esc(x.title)+'</em><i>'+esc(x.channel)+' · '+esc(fmtV(x.views))+'</i></span></div>'; }).join("");
  [].forEach.call(el.querySelectorAll(".tit"),function(d){ d.onclick=function(){ muPick(+d.dataset.i); }; }); }
function muFind(q){ q=String(q||"").replace(/\s+/g," ").trim().slice(0,100); if(!q) return; var n=++T.sq; T.res=[]; T.idx=-1; T.ord=[]; T.pos=-1; T.mst="msr"; paintMu();
  var bad=function(){ if(n!==T.sq||T.m!=="mu"||!box()) return; T.res=[]; T.mst="merr"; paintMu(); };
  fetch((window.HUB||"https://brief-live-hub.emhwang3.workers.dev")+"/ytsearch?q="+encodeURIComponent(q)+"&lang="+encodeURIComponent(window.LANG||"en")).then(function(r){ return r.json(); }).then(function(j){ if(n!==T.sq||T.m!=="mu"||!box()) return;
    if(!j||!j.ok) return bad(); T.res=(j.items||[]).filter(function(x){ return x&&/^[A-Za-z0-9_-]{6,20}$/.test(x.id||""); }).slice(0,10); T.mst=T.res.length?"":"mno"; paintMu(); var l=box().querySelector(".tls"); if(l) l.scrollTop=0; }).catch(bad); }   // 목록 창 맨 위로
// 이어 듣기 (11-05) — 곡이 끝나면 순서(ord)의 다음 곡. 반복 끔 = 마지막 곡 뒤 멈춤 · 반복 켬 = 처음으로(셔플이면 한 바퀴마다 다시 섞기) · 셔플 = 한 바퀴 안에 같은 곡 두 번 없음
// 단추 7개 (11-07 사장님 「노래방 메뉴 단추 색깔처럼, 동그랗게, 누르는 형태」) — 아이콘 = 구글 공개 아이콘(Material Icons, Apache 2.0) · 색 = 노래방 메뉴 단추 6색
var MIC={prev:"M6 6h2v12H6zm3.5 6l8.5 6V6z",play:"M8 5v14l11-7z",pause:"M6 19h4V5H6v14zm8-14v14h4V5h-4z",next:"M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",stop:"M6 6h12v12H6z",rep:["M20,128A76.08,76.08,0,0,1,96,52h99l-3.52-3.51a12,12,0,1,1,17-17l24,24a12,12,0,0,1,0,17l-24,24a12,12,0,0,1-17-17L195,76H96a52.06,52.06,0,0,0-52,52,12,12,0,0,1-24,0Zm204-12a12,12,0,0,0-12,12,52.06,52.06,0,0,1-52,52H61l3.52-3.51a12,12,0,1,0-17-17l-24,24a12,12,0,0,0,0,17l24,24a12,12,0,1,0,17-17L61,204h99a76.08,76.08,0,0,0,76-76A12,12,0,0,0,224,116Z","0 0 256 256"],shuf:["M240.49,175.51a12,12,0,0,1,0,17l-24,24a12,12,0,0,1-17-17L203,196h-2.09a76.17,76.17,0,0,1-61.85-31.83L97.38,105.78A52.1,52.1,0,0,0,55.06,84H32a12,12,0,0,1,0-24H55.06a76.17,76.17,0,0,1,61.85,31.83l41.71,58.39A52.1,52.1,0,0,0,200.94,172H203l-3.52-3.51a12,12,0,0,1,17-17Zm-95.62-72.62a12,12,0,0,0,16.93-1.13A52,52,0,0,1,200.94,84H203l-3.52,3.51a12,12,0,0,0,17,17l24-24a12,12,0,0,0,0-17l-24-24a12,12,0,0,0-17,17L203,60h-2.09a76,76,0,0,0-57.2,26A12,12,0,0,0,144.87,102.89Zm-33.74,50.22a12,12,0,0,0-16.93,1.13A52,52,0,0,1,55.06,172H32a12,12,0,0,0,0,24H55.06a76,76,0,0,0,57.2-26A12,12,0,0,0,111.13,153.11Z","0 0 256 256"],vol:"M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",mute:"M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"};
var MBC={prev:"#8fd3ff",play:"#ff9be6",next:"#8fd3ff",stop:"#ff6b6b",rep:"#7cffb2",shuf:"#ffe066",vol:"#ffb36b"};   // 파랑(주변 노래 친구)·분홍(주크박스)·빨강(LIVE)·초록(챌린지)·노랑(스테이지)·주황(우리끼리 노래)
var MBK=["prev","play","next","stop","rep","shuf","vol"];
function svgI(k){ var p=MIC[k], vb="0 0 24 24"; if(typeof p!=="string"){ vb=p[1]; p=p[0]; } return '<svg viewBox="'+vb+'" aria-hidden="true"><path d="'+p+'"/></svg>'; }   // 반복·셔플 = 부드러운 곡선 (Phosphor Icons bold, MIT · 11-07 사장님 「직선 말고 곡선」)
function mix(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function muOrder(first){ var n=(T.res||[]).length, a=[]; for(var i=0;i<n;i++) a.push(i); var f=first!=null&&first>=0&&first<n;
  if(T.shuf){ if(f){ a.splice(first,1); T.ord=[first].concat(mix(a)); } else T.ord=mix(a); T.pos=0; } else { T.ord=a; T.pos=f?first:0; } }
function muPick(i){ muOrder(i); play(i); }   // 손님이 고른 곡부터 이어 간다
function muSee(){ var b=box(), l=b&&b.querySelector(".tls"), it=l&&l.querySelector(".tit.on"); if(!it) return; var lr=l.getBoundingClientRect(), r=it.getBoundingClientRect(); if(r.top<lr.top) l.scrollTop-=lr.top-r.top+2; else if(r.bottom>lr.bottom) l.scrollTop+=r.bottom-lr.bottom+2; }   // 지금 곡이 목록 창 안에 보이게 (창 안만 움직임)
function muNext(){ var n=(T.res||[]).length; if(!n||!box()) return;
  if(T.ord.length!==n){ muOrder(null); play(T.ord[T.pos]); return muSee(); }   // 새로 검색한 목록 = 처음부터 새 순서
  if(T.pos+1<n) T.pos++;
  else { if(!T.rep) return;   // 반복 끔 = 마지막 곡 뒤 멈춤
    var last=T.ord[T.pos]; if(T.shuf){ T.ord=mix(T.ord.slice()); if(n>1&&T.ord[0]===last){ var j=1+Math.floor(Math.random()*(n-1)), t=T.ord[0]; T.ord[0]=T.ord[j]; T.ord[j]=t; } } T.pos=0; }
  play(T.ord[T.pos]); muSee(); }
// 단추 7개 상태 (11-07 보라색 화면) — ▶/⏸·소리 아이콘 바꾸기 · 반복·셔플 켜짐 = 눌린 채 · 지금 곡 제목·채널 = 플레이어 아래 줄
function muDeck(){ var b=box(); if(!b||T.m!=="mu") return; var has=(T.res||[]).length>0, cur=!!T.cur, st=-1; try{ if(T.pl&&T.ready&&T.pl.getPlayerState) st=T.pl.getPlayerState(); }catch(e){}
  var set=function(k,lab,dis,on,ic){ var t=b.querySelector('.tdb[data-j="'+k+'"]'); if(!t) return; var s=L(TX[lab]); t.setAttribute("aria-label",s); t.title=s; t.disabled=!!dis; if(on!=null){ t.classList.toggle("on",!!on); t.setAttribute("aria-pressed",on?"true":"false"); } if(ic&&t._ic!==ic){ t._ic=ic; t.innerHTML=svgI(ic); } };
  var pz=(st===1||st===3); set("prev","jprev",!cur); set("play",pz?"jpause":"jplay",!cur&&!has,null,pz?"pause":"play"); set("next","jnext",!cur); set("stop","jstop",!cur); set("rep","rep",false,T.rep); set("shuf","shuf",false,T.shuf);
  set("vol",T.mut?"junmute":"jmute",false,null,T.mut?"mute":"vol"); var v=b.querySelector('.tdb[data-j="vol"]'); if(v) v.classList.toggle("mut",!!T.mut);
  var nw=b.querySelector(".tnow"), h=cur?'<b>'+esc(T.cur.title||"")+'</b>'+(T.cur.channel?'<small>'+esc(T.cur.channel)+'</small>':''):""; if(nw&&nw._h!==h){ nw._h=h; nw.innerHTML=h; nw.hidden=!h; } }
function muPlay(){ var n=(T.res||[]).length; if(!T.cur||!T.pl){ if(n){ muOrder(null); play(T.ord[T.pos]); } return; }   // 아직 안 골랐으면 목록 처음(셔플이면 섞은 첫 곡)부터
  try{ var s=T.pl.getPlayerState(); if(s===1||s===3) T.pl.pauseVideo(); else T.pl.playVideo(); }catch(e){} setTimeout(muDeck,300); }
function muPrev(){ var n=(T.res||[]).length; if(!T.cur) return;
  if(T.ord.length===n&&T.idx>=0){ if(T.pos>0){ T.pos--; play(T.ord[T.pos]); return muSee(); } if(T.rep&&n>1){ T.pos=n-1; play(T.ord[T.pos]); return muSee(); } }
  try{ T.pl.seekTo(0,true); T.pl.playVideo(); }catch(e){} }   // 맨 앞이면 지금 곡 처음부터
function muStop(){ try{ T.pl&&T.pl.stopVideo&&T.pl.stopVideo(); }catch(e){} setTimeout(muDeck,300); }
function muMute(){ T.mut=!T.mut; try{ if(T.pl&&T.ready){ if(T.mut) T.pl.mute(); else T.pl.unMute(); } }catch(e){} muDeck(); }
function muTog(c){ if(c==="rep") T.rep=!T.rep;
  else { T.shuf=!T.shuf; var n=(T.res||[]).length, cur=T.idx;
    if(n&&cur>=0&&cur<n){ var a=[]; for(var i=0;i<n;i++) if(!T.shuf||i!==cur) a.push(i); if(T.shuf){ T.ord=[cur].concat(mix(a)); T.pos=0; } else { T.ord=a; T.pos=cur; } }   // 셔플 켬 = 지금 곡 다음부터 섞음 · 끔 = 목록 순서로 지금 곡 다음부터
    else { T.ord=[]; T.pos=-1; } }
  muDeck(); }
function muOpen(b,M){ b.classList.add("mu");   // 11-07 사장님: 금색 주크박스 그림 → 노래방(StageSong) 첫 화면 같은 보라색 · 그림 속 화면에 끼우지 않으니 폰·PC 모두 안 잘림
  b.innerHTML='<div class="tin"><div class="thd"><div><b>'+esc(L(TX[M.t]))+'</b><small>'+esc(L(TX[M.s]))+'</small></div><button type="button" class="tx">✕ '+esc(L(TX.x))+'</button></div>'
    +'<form class="tsr" role="search"><input type="search" enterkeyhint="search" maxlength="100" autocomplete="off" placeholder="'+esc(L(TX.mq))+'" aria-label="'+esc(L(TX.mq))+'"><button type="submit">'+esc(L(TX.mb))+'</button></form>'
    +'<div class="tpl"><div class="tmsg">'+esc(L(TX.mpk))+'</div></div>'   // 플레이어 = 화면 폭 가득
    +'<div class="tnow" hidden></div><div class="tnote" hidden></div>'   // 지금 곡 · 막힌 영상 안내(플레이어 밖)
    +'<div class="tdk">'+MBK.map(function(k){ return '<button type="button" class="tdb" data-j="'+k+'" style="--c:'+MBC[k]+'">'+svgI(k)+'</button>'; }).join("")+'</div>'   // ⏮ ▶ ⏭ ⏹ 반복 셔플 소리
    +'<div class="tls"></div>'+ftHtml()+'</div>';   // 곡 목록 = 검색 후보 10곡
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".tx").onclick=close;
  var fm=b.querySelector(".tsr"), inp=fm.querySelector("input");
  fm.onsubmit=function(e){ e.preventDefault(); if(!inp.value.trim()){ inp.focus(); return; } try{ inp.blur(); }catch(z){} muFind(inp.value); };   // 검색 뒤 자판을 내려 후보가 보이게
  var J={prev:muPrev,play:muPlay,next:function(){ if(!T.cur) return muPlay(); muNext(); },stop:muStop,rep:function(){ muTog("rep"); },shuf:function(){ muTog("shuf"); },vol:muMute};
  [].forEach.call(b.querySelectorAll(".tdb"),function(t){ t.onclick=function(){ var f=J[t.dataset.j]; if(f) f(); }; });
  paintMu(); try{ ntap(M.k,"tap"); }catch(e){} }   // 누름 수 (관리자 계기판 장소별 누름)
document.addEventListener("visibilitychange",function(){ if(document.hidden&&box()&&T.pl&&T.pl.pauseVideo){ try{ T.pl.pauseVideo(); }catch(e){} } });   // 앱이 화면에서 사라지면 일시정지 (유튜브 규칙 — 소리만 뒤에서 재생 금지)
function close(){ try{ T.ro&&T.ro.disconnect(); }catch(e){} T.ro=null; var b=box(); if(b){ try{ T.pl&&T.pl.destroy&&T.pl.destroy(); }catch(e){} b.remove(); } T.pl=null; T.ready=false; document.documentElement.style.overflow=""; try{ mpPaid.end(); }catch(e){} }
window.tvidOpen=open;
var _hcT=window.hitClick; if(_hcT) window.hitClick=function(k){ if(k==="__tv_yt"){ open("yt"); return; } if(k==="__tv_nf"){ open("nf"); return; } if(k==="__music"){ open("mu"); return; } return _hcT.apply(this,arguments); };   // 서울 전체 관악산 기슭 상영관 (gu.js fxPlace, 10-28); window.tvidClose=close; window.tvidState=T;
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 창 닫기
})();
