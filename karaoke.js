/* 머니퍼즐 투어 — 무료 노래방 + 유료 콘텐츠 사용 통계 (사장님 2026-10-26)
 *  · 구 화면 노래방 그림(gu_build KARA → act "__kara_<code>")을 누르면 노래방 방처럼 어두운 화면
 *  · 노래 = TJ노래방 공식 유튜브채널(UCZUhx8ClCv6paFW7qi3qljg)·금영 노래방 공식 유튜브 채널(UCDqaUIUSJP5EVMEI178Zfag) 영상만 — 허브 /kara 가 고른다
 *    재생은 유튜브 퍼가기 플레이어(IFrame API) 그대로(광고·로고 안 가림), 퍼가기 막힌 영상(오류 101·150)은 다음 곡으로 · 무료
 *  · 단추의 채널 그림 = 두 회사 공식 채널 프로필 이미지 그대로(img/kara/tj.jpg·ky.jpg, 유튜브에서 받은 원본)
 *  · mpPaid — PC방·노래방·넷플릭스/유튜브 상영관 누름·나감·사용 시간(초)을 허브 /ntap(pc_*)로. 숫자만, 사장님 기기는 안 보냄
 */
(function(){
"use strict";
function L(o){ return o[window.LANG]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
// ── 사용 통계 ──
var P={k:null,t0:0,outAt:0,hidAt:0};
function send(k,e,n){ try{ if(!/^[A-Za-z0-9_-]{1,64}$/.test(k)) return; var x=0, own=false; try{ x=localStorage.getItem("mpv_ntt")?1:0; own=!!localStorage.getItem("mp_owner"); }catch(z){} if(own&&!x) return;
  var b=JSON.stringify({k:k,e:e,n:n||0,x:x}); if(navigator.sendBeacon&&navigator.sendBeacon(HUB+"/ntap",new Blob([b],{type:"text/plain"}))) return; fetch(HUB+"/ntap",{method:"POST",body:b,keepalive:true}).catch(function(){}); }catch(z){} }
function flush(){ if(!P.k||!P.t0) return; var s=Math.round((Date.now()-P.t0)/1000); if(s>0) send(P.k,"pc_time",s); P.t0=Date.now(); }
var mpPaid={ start:function(k){ if(P.k===k) return; mpPaid.end(); P.k=k; P.t0=Date.now(); P.outAt=0; send(k,"pc_open"); },
  end:function(){ if(!P.k) return; flush(); P.k=null; P.t0=0; P.outAt=0; },
  out:function(){ if(!P.k) return; flush(); P.outAt=Date.now(); send(P.k,"pc_out"); }, cur:function(){ return P.k; } };
window.mpPaid=mpPaid;
document.addEventListener("visibilitychange",function(){ if(!P.k) return;
  if(document.hidden){ if(P.outAt){ flush(); P.hidAt=Date.now(); } else { flush(); P.t0=0; } }   // 바깥 사이트로 나간 경우만 숨은 동안도 사용 시간
  else { if(P.outAt&&P.hidAt){ var s=Math.round((Date.now()-P.hidAt)/1000); if(s>0) send(P.k,"pc_time",s); } P.hidAt=0; P.outAt=0; P.t0=Date.now(); } });
window.addEventListener("pagehide",function(){ flush(); });
var PAIDK={netflixth:1,youtubeth:1};
var _ps=window.placeShow; if(_ps) window.placeShow=function(k){ var r=_ps.apply(this,arguments); try{ if(PAIDK[k]) mpPaid.start(k); else if(!document.getElementById("karBox")) mpPaid.end(); }catch(e){} return r; };
var _rc=window.resClear; if(_rc) window.resClear=function(){ var r=_rc.apply(this,arguments); try{ if(P.k&&!/^kara_/.test(P.k)) mpPaid.end(); }catch(e){} return r; };
document.addEventListener("click",function(e){ if(!P.k||/^kara_/.test(P.k)) return; var a=e.target.closest&&e.target.closest("#res a[href], #res button"); if(!a||a.classList.contains("xbtn")) return;
  if(a.tagName==="A"||/app|open|열기|앱/i.test(a.textContent||"")) mpPaid.out(); },true);

// ── 노래방 ──
var CH={tj:{n:{ko:"TJ노래방 공식 채널",en:"TJ Karaoke (official)",ja:"TJカラオケ 公式",zhs:"TJ 练歌房 官方",zht:"TJ 練歌房 官方",es:"TJ Karaoke (oficial)"},u:"https://www.youtube.com/channel/UCZUhx8ClCv6paFW7qi3qljg",i:"img/kara/tj.jpg"},
        ky:{n:{ko:"금영노래방 공식 채널",en:"KY Karaoke (official)",ja:"KYカラオケ 公式",zhs:"金永(KY) 练歌房 官方",zht:"金永(KY) 練歌房 官方",es:"KY Karaoke (oficial)"},u:"https://www.youtube.com/channel/UCDqaUIUSJP5EVMEI178Zfag",i:"img/kara/ky.jpg"}};
var TABS=[["kpop","K-POP"],["pop","Pop"],["jpop","J-POP"]];   // 중국 노래는 두 공식 채널에 없어서 탭을 안 둔다 (10-26 확인)
var TX={
 t:{ko:"노래방",en:"Karaoke",ja:"カラオケ",zhs:"KTV 练歌房",zht:"KTV 練歌房",es:"Karaoke"},
 s:{ko:"TJ·금영 공식 유튜브 채널의 노래방 영상 — 무료",en:"Karaoke videos from the official TJ and KY YouTube channels — free",ja:"TJ・KY公式YouTubeチャンネルのカラオケ動画 — 無料",zhs:"来自TJ、KY官方YouTube频道的卡拉OK视频 — 免费",zht:"來自TJ、KY官方YouTube頻道的卡拉OK影片 — 免費",es:"Vídeos de karaoke de los canales oficiales de TJ y KY en YouTube — gratis"},
 q:{ko:"노래 제목·가수 찾기",en:"Search song or artist",ja:"曲名・歌手で検索",zhs:"搜索歌名或歌手",zht:"搜尋歌名或歌手",es:"Buscar canción o artista"},
 go:{ko:"찾기",en:"Search",ja:"検索",zhs:"搜索",zht:"搜尋",es:"Buscar"},
 ld:{ko:"노래를 불러오는 중…",en:"Loading songs…",ja:"曲を読み込み中…",zhs:"正在加载歌曲…",zht:"正在載入歌曲…",es:"Cargando canciones…"},
 no:{ko:"노래를 찾지 못했어요.",en:"No songs found.",ja:"曲が見つかりませんでした。",zhs:"没有找到歌曲。",zht:"沒有找到歌曲。",es:"No se encontraron canciones."},
 pick:{ko:"아래에서 노래를 고르세요",en:"Pick a song below",ja:"下から曲を選んでください",zhs:"请在下面选歌",zht:"請在下面選歌",es:"Elige una canción abajo"},
 yt:{ko:"이 곡은 유튜브에서만 재생돼요",en:"This song plays only on YouTube",ja:"この曲はYouTubeでのみ再生できます",zhs:"这首歌只能在YouTube上播放",zht:"這首歌只能在YouTube上播放",es:"Esta canción solo se reproduce en YouTube"},
 ytb:{ko:"유튜브에서 열기",en:"Open on YouTube",ja:"YouTubeで開く",zhs:"在YouTube打开",zht:"在YouTube開啟",es:"Abrir en YouTube"},
 ytt:{ko:"유튜브에서",en:"on YouTube",ja:"YouTubeで",zhs:"在YouTube",zht:"在YouTube",es:"en YouTube"},
 lo:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 x:{ko:"나가기",en:"Leave",ja:"出る",zhs:"离开",zht:"離開",es:"Salir"}
};
var st=document.createElement("style");
st.textContent="#karBox{position:fixed;inset:0;z-index:2147483004;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden}"
 +"#karBox::before{content:'';position:absolute;inset:-20%;pointer-events:none;background:conic-gradient(from 0deg,rgba(255,80,200,.10),rgba(80,160,255,.10),rgba(120,255,180,.08),rgba(255,200,80,.10),rgba(255,80,200,.10));animation:karSpin 14s linear infinite;mix-blend-mode:screen}@keyframes karSpin{to{transform:rotate(360deg)}}"
 +"#karBox .kin{position:relative;max-width:720px;width:100%;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:10px 12px 0}"
 +"#karBox .khd{display:flex;align-items:center;gap:8px}#karBox .khd b{font-size:19px;text-shadow:0 0 8px #ff4fd8,0 0 16px #7a5cff}#karBox .khd small{display:block;font-size:12px;opacity:.75;font-weight:600}#karBox .kx{margin-left:auto;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:7px 14px;font-weight:800;cursor:pointer}"
 +"#karBox .kch{display:flex;gap:8px;margin:8px 0}#karBox .kch a{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 8px;color:#fff;text-decoration:none;font-weight:800;font-size:13px}#karBox .kch img{width:34px;height:34px;border-radius:50%;flex:0 0 auto}"
 +"#karBox .kpl{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 0 18px rgba(170,90,255,.45);flex:0 0 auto}#karBox .kpl .kmsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-weight:800;opacity:.8}#karBox .kpl iframe{width:100%;height:100%;border:0}"
 +"#karBox .ktb{display:flex;gap:6px;margin:10px 0 6px}#karBox .ktb button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .ktb button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}"
 +"#karBox .ksr{display:flex;gap:6px}#karBox .ksr input{flex:1;min-width:0;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;padding:9px 10px;font-size:15px}#karBox .ksr button{border:0;border-radius:10px;background:#ff4fd8;color:#fff;font-weight:900;padding:0 14px;cursor:pointer}"
 +"#karBox .kls{flex:1;overflow:auto;margin-top:8px;padding-bottom:16px;-webkit-overflow-scrolling:touch}#karBox .kit{display:flex;align-items:center;gap:8px;padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}#karBox .kit.on{background:rgba(255,79,216,.16);border-radius:10px}#karBox .kit img{width:24px;height:24px;border-radius:50%;flex:0 0 auto}#karBox .kit span{flex:1;font-size:14.5px;font-weight:700;line-height:1.3}#karBox .kit i{font-style:normal;font-size:12px;opacity:.6}"
 +"#karBox .kit b.kyt{font-weight:800;color:#ff8080;margin-right:4px}#karBox .kov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:rgba(0,0,0,.82);font-weight:800;z-index:2}#karBox .kov a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:900}#karBox .kst{font-size:13px;opacity:.75;padding:10px 4px}";
document.head.appendChild(st);
var K={code:"",tab:"kpop",items:[],idx:-1,pl:null,q:""};
function ytApi(cb){ if(window.YT&&YT.Player) return cb(); var prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=function(){ try{ prev&&prev(); }catch(e){} cb(); };
  if(!document.getElementById("ytApiJs")){ var s=document.createElement("script"); s.id="ytApiJs"; s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }
function box(){ return document.getElementById("karBox"); }
function paintList(){ var b=box(); if(!b) return; var el=b.querySelector(".kls");
  if(K.items===null){ el.innerHTML='<div class="kst">'+esc(L(TX.ld))+'</div>'; return; }
  if(!K.items.length){ el.innerHTML='<div class="kst">'+esc(L(TX.no))+'</div>'; return; }
  el.innerHTML=K.items.map(function(x,i){ return '<div class="kit'+(i===K.idx?' on':'')+'" data-i="'+i+'"><img src="'+CH[x.ch].i+'" alt=""><span>'+esc(x.t)+'</span><i>'+(x.e===0?'<b class="kyt">▶ '+esc(L(TX.ytt))+'</b> ':'')+esc(x.ln||"")+'</i></div>'; }).join("");
  [].forEach.call(el.querySelectorAll(".kit"),function(d){ d.onclick=function(){ play(+d.dataset.i); }; }); }
function load(){ K.items=null; paintList(); var u=HUB+"/kara?"+(K.q?"q="+encodeURIComponent(K.q):"tab="+K.tab);
  fetch(u).then(function(r){ return r.json(); }).then(function(j){ K.items=(j&&j.ok&&j.items)||[]; K.idx=-1; paintList(); }).catch(function(){ K.items=[]; paintList(); }); }
function ov(html,t){ var b=box(); if(!b) return; var pl=b.querySelector(".kpl"), o=pl.querySelector(".kov"); if(!html){ if(o&&(!t||o.dataset.t===t)) o.remove(); return; } if(!o){ o=document.createElement("div"); o.className="kov"; pl.appendChild(o); } o.dataset.t=t||""; o.innerHTML=html; }
function blocked(x){ try{ K.pl&&K.pl.pauseVideo&&K.pl.pauseVideo(); }catch(e){}
  ov('<div>'+esc(L(TX.yt))+'</div><a href="https://www.youtube.com/watch?v='+encodeURIComponent(x.id)+'" target="_blank" rel="noopener" data-kyt="1">▶ '+esc(L(TX.ytb))+'</a>');
  var a=box()&&box().querySelector("[data-kyt]"); if(a) a.addEventListener("click",function(){ mpPaid.out(); }); }
function play(i){ var x=K.items&&K.items[i]; if(!x) return; K.idx=i; paintList(); var b=box(); if(!b) return; var pl=b.querySelector(".kpl");
  try{ ntap("kara_"+K.code,"tap"); }catch(e){}
  var m0=pl.querySelector(".kmsg"); if(m0) m0.remove();
  if(x.e===0){ blocked(x); return; }   // 퍼가기 막힌 곡 — 앱 안에서 안 틀고 유튜브로 (허브가 oEmbed 로 미리 확인)
  ov('<div>'+esc(L(TX.lo))+'</div>',"lo"); K.want=x.id;
  ytApi(function(){ if(!box()) return;
    if(K.pl){ if(K.ready) K.pl.loadVideoById(x.id); return; }   // 플레이어는 하나만 — 곡마다 새로 만들지 않는다
    var d=document.createElement("div"); d.id="karYt"; pl.insertBefore(d,pl.firstChild);
    K.pl=new YT.Player("karYt",{videoId:x.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:function(){ K.ready=true; if(K.want&&K.pl.getVideoData&&K.pl.getVideoData().video_id!==K.want) K.pl.loadVideoById(K.want); },
      onError:function(){ var c=K.items&&K.items[K.idx]; if(c){ c.e=0; paintList(); blocked(c); } },   // 미리 못 잡은 막힌 곡도 그 자리에서 안내 (다음 곡으로 안 넘김)
      onStateChange:function(ev){ if(ev&&ev.data===1) ov("","lo"); } }}); }); }
function open(code){ var D=window.GU&&GU.d, o=D&&D.kara&&D.kara[code]; K.code=code; K.q=""; K.idx=-1; K.pl=null; K.ready=false; K.want=""; var old=box(); if(old) old.remove();
  var gn=o&&window.LP?LP(o.n):(o?o.g:""), b=document.createElement("div"); b.id="karBox";
  b.innerHTML='<div class="kin"><div class="khd"><div><b>'+esc(L(TX.t))+(gn?' · '+esc(gn):'')+'</b><small>'+esc(L(TX.s))+'</small></div><button type="button" class="kx">✕ '+esc(L(TX.x))+'</button></div>'
    +'<div class="kch">'+["tj","ky"].map(function(c){ return '<a href="'+CH[c].u+'" target="_blank" rel="noopener" data-kch="'+c+'"><img src="'+CH[c].i+'" alt="">'+esc(L(CH[c].n))+' ›</a>'; }).join("")+'</div>'
    +'<div class="kpl"><div class="kmsg">🎤 '+esc(L(TX.pick))+'</div></div>'
    +'<div class="ktb">'+TABS.map(function(t){ return '<button type="button" data-t="'+t[0]+'"'+(t[0]===K.tab?' class="on"':'')+'>'+t[1]+'</button>'; }).join("")+'</div>'
    +'<form class="ksr"><input type="search" placeholder="'+esc(L(TX.q))+'"><button type="submit">'+esc(L(TX.go))+'</button></form>'
    +'<div class="kls"></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".kx").onclick=close;
  [].forEach.call(b.querySelectorAll("[data-kch]"),function(a){ a.addEventListener("click",function(){ mpPaid.out(); }); });
  [].forEach.call(b.querySelectorAll(".ktb button"),function(t){ t.onclick=function(){ K.tab=t.dataset.t; K.q=""; b.querySelector(".ksr input").value=""; [].forEach.call(b.querySelectorAll(".ktb button"),function(x){ x.classList.toggle("on",x===t); }); load(); }; });
  b.querySelector(".ksr").onsubmit=function(e){ e.preventDefault(); K.q=String(b.querySelector(".ksr input").value||"").trim(); [].forEach.call(b.querySelectorAll(".ktb button"),function(x){ x.classList.toggle("on",!K.q&&x.dataset.t===K.tab); }); load(); };
  mpPaid.start("kara_"+code); load(); }
function close(){ var b=box(); if(b){ try{ K.pl&&K.pl.destroy&&K.pl.destroy(); }catch(e){} b.remove(); } K.pl=null; K.ready=false; document.documentElement.style.overflow=""; mpPaid.end(); }
window.karOpen=open; window.karClose=close; window.karState=K;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__kara_([a-z]+)$/.exec(k||""); if(m){ open(m[1]); return; } return _hc.apply(this,arguments); };
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 노래방 나가기
})();
