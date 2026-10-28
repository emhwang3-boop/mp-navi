/* 머니퍼즐 투어 — 유튜브 상영관을 앱 안에서 (사장님 2026-10-28)
 *  · 지도 위 「유튜브 상영관」(장소 app:"youtube")을 누르면 바깥 유튜브 대신 이 창 — 한국 관광 공식 채널 영상만 골라 묶음별로
 *  · 영상 목록 = data/tvid.json (VISITKOREA·VisitSeoul TV·VISIT BUSAN·Visit Jeju Global·강원관광재단·인천관광공사 — oEmbed 200 확인한 것만)
 *  · 넷플릭스 상영관(app:"netflix")도 같은 창 — Netflix Korea 공식 채널(+Netflix 본 채널) 예고편 data/tvid_nf.json, 맨 아래 「넷플릭스 앱에서 보기」= appGo("netflix")
 *  · 재생은 karaoke.js 와 같은 유튜브 퍼가기 플레이어(IFrame API). 막힌 영상은 「유튜브에서 열기」. 검색창 없음
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
 x:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}
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
 +"#tvBox .tnf{flex:0 0 auto;margin:6px 0 12px;border:0;border-radius:12px;padding:12px;background:#e50914;color:#fff;font-size:15px;font-weight:900;cursor:pointer}";
document.head.appendChild(st);
var MD={yt:{G:G,t:"t",s:"s",f:"data/tvid.json",k:"youtubeth",g:"all"},nf:{G:GNF,t:"nt",s:"ns",f:"data/tvid_nf.json",k:"netflixth",g:"drama"}};
var T={m:"yt",cache:{},g:"all",all:null,idx:-1,pl:null,ready:false,want:""};
function ytApi(cb){ if(window.YT&&YT.Player) return cb(); var prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=function(){ try{ prev&&prev(); }catch(e){} cb(); };
  if(!document.getElementById("ytApiJs")){ var s=document.createElement("script"); s.id="ytApiJs"; s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }
function box(){ return document.getElementById("tvBox"); }
function items(){ return (T.all||[]).filter(function(x){ return x.g===T.g; }); }
function paintList(){ var b=box(); if(!b) return; var el=b.querySelector(".tls");
  if(T.all===null){ el.innerHTML='<div class="tst">'+esc(L(TX.ld))+'</div>'; return; }
  var a=items(); if(!a.length){ el.innerHTML='<div class="tst">'+esc(L(TX.no))+'</div>'; return; }
  el.innerHTML=a.map(function(x,i){ return '<div class="tit'+(i===T.idx?' on':'')+'" data-i="'+i+'"><img loading="lazy" src="https://i.ytimg.com/vi/'+encodeURIComponent(x.id)+'/mqdefault.jpg" alt=""><span>'+esc(x.t)+'<i>'+esc(x.ch)+'</i></span></div>'; }).join("");
  [].forEach.call(el.querySelectorAll(".tit"),function(d){ d.onclick=function(){ play(+d.dataset.i); }; }); }
function ov(html,t){ var b=box(); if(!b) return; var pl=b.querySelector(".tpl"), o=pl.querySelector(".tov"); if(!html){ if(o&&(!t||o.dataset.t===t)) o.remove(); return; } if(!o){ o=document.createElement("div"); o.className="tov"; pl.appendChild(o); } o.dataset.t=t||""; o.innerHTML=html; }
function blocked(x){ try{ T.pl&&T.pl.pauseVideo&&T.pl.pauseVideo(); }catch(e){}
  ov('<div>'+esc(L(TX.yt))+'</div><a href="https://www.youtube.com/watch?v='+encodeURIComponent(x.id)+'" target="_blank" rel="noopener" data-tyt="1">'+esc(L(TX.ytb))+'</a>');
  var a=box()&&box().querySelector("[data-tyt]"); if(a) a.addEventListener("click",function(){ try{ mpPaid.out(); }catch(e){} }); }
function play(i){ var x=items()[i]; if(!x) return; T.idx=i; paintList(); var b=box(); if(!b) return; var pl=b.querySelector(".tpl");
  try{ ntap(MD[T.m].k,"tv_"+x.id.replace(/[^A-Za-z0-9_-]/g,"")); }catch(e){}
  var m0=pl.querySelector(".tmsg"); if(m0) m0.remove(); ov("","");
  ov('<div>'+esc(L(TX.lo))+'</div>',"lo"); T.want=x.id; T.cur=x;
  ytApi(function(){ if(!box()) return;
    if(T.pl){ if(T.ready) T.pl.loadVideoById(x.id); return; }   // 플레이어는 하나만
    var d=document.createElement("div"); d.id="tvYt"; pl.insertBefore(d,pl.firstChild);
    T.pl=new YT.Player("tvYt",{videoId:x.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:function(){ T.ready=true; if(T.want&&T.pl.getVideoData&&T.pl.getVideoData().video_id!==T.want) T.pl.loadVideoById(T.want); },
      onError:function(){ if(T.cur) blocked(T.cur); },
      onStateChange:function(ev){ if(ev&&ev.data===1) ov("","lo"); } }}); }); }
function load(){ var m=T.m; if(T.cache[m]&&T.cache[m].length){ T.all=T.cache[m]; paintList(); return; } T.all=null; paintList();
  fetch(MD[m].f+"?v=1028tv").then(function(r){ return r.json(); }).then(function(j){ var a=(j&&j.items)||[]; T.cache[m]=a; if(T.m===m){ T.all=a; paintList(); } }).catch(function(){ if(T.m===m){ T.all=[]; paintList(); } }); }
function open(mode){ var M=MD[mode]||MD.yt; T.m=MD[mode]?mode:"yt"; T.g=M.g; T.all=null; T.idx=-1; T.pl=null; T.ready=false; T.want=""; T.cur=null; var old=box(); if(old) old.remove();
  var b=document.createElement("div"); b.id="tvBox";
  b.innerHTML='<div class="tin"><div class="thd"><div><b>'+esc(L(TX[M.t]))+'</b><small>'+esc(L(TX[M.s]))+'</small></div><button type="button" class="tx">✕ '+esc(L(TX.x))+'</button></div>'
    +'<div class="tpl"><div class="tmsg">'+esc(L(TX.pick))+'</div></div>'
    +'<div class="ttb">'+M.G.map(function(g){ return '<button type="button" data-g="'+g[0]+'"'+(g[0]===T.g?' class="on"':'')+'>'+esc(L(g[1]))+'</button>'; }).join("")+'</div>'
    +'<div class="tls"></div>'+(T.m==="nf"?'<button type="button" class="tnf">'+esc(L(TX.nb))+'</button>':'')+'</div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".tx").onclick=close;
  [].forEach.call(b.querySelectorAll(".ttb button"),function(t){ t.onclick=function(){ T.g=t.dataset.g; T.idx=-1; [].forEach.call(b.querySelectorAll(".ttb button"),function(x){ x.classList.toggle("on",x===t); }); paintList(); b.querySelector(".tls").scrollTop=0; }; });
  var nb=b.querySelector(".tnf"); if(nb) nb.onclick=function(){ try{ mpPaid.out(); }catch(e){} try{ T.pl&&T.pl.pauseVideo&&T.pl.pauseVideo(); }catch(e){} try{ appGo("netflix"); }catch(e){} };
  load(); }
function close(){ var b=box(); if(b){ try{ T.pl&&T.pl.destroy&&T.pl.destroy(); }catch(e){} b.remove(); } T.pl=null; T.ready=false; document.documentElement.style.overflow=""; try{ mpPaid.end(); }catch(e){} }
window.tvidOpen=open;
var _hcT=window.hitClick; if(_hcT) window.hitClick=function(k){ if(k==="__tv_yt"){ open("yt"); return; } if(k==="__tv_nf"){ open("nf"); return; } return _hcT.apply(this,arguments); };   // 서울 전체 관악산 기슭 상영관 (gu.js fxPlace, 10-28); window.tvidClose=close; window.tvidState=T;
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 창 닫기
})();
