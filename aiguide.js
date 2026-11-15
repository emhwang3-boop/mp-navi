/* 🎧 AI 안내 (11-15 사장님 「AI 안내 — 앱에만」·「나로 한다」) — 앱 지도 화면 「AI 안내」 단추 · 홈페이지(PC_HOME)에는 없음
 *  · 켜면 화면 꺼짐 방지(Wake Lock) + 위치를 따라 근처 명소·궁 입구·전각 설명을 음성으로 자동 재생, 끄면 멈춤
 *  · 트는 조건: 명소 걸을 때 100m·차(시속 20km 이상) 300m · 궁 입구 소개 100m(걸을 때만) · 전각 35m(걸을 때만)
 *    한 번에 하나 · 그날 들은 곳은 다시 자동 재생하지 않음
 *  · 설명 중 다음 곳 반경에 들어서면(그리고 그곳이 지금 곳보다 가까우면) 지금 설명을 부드럽게 줄이고(페이드) 새 곳으로 — 끊긴 설명은 「다시 듣기」
 *  · 안내 언어: 한국어·English·Español (처음엔 앱 언어, 에스파냐어는 이 기능 안에서만 선택)
 *  · 목록 = data/aiguide.json · 설명 글·음성 = 허브 /aiguide/t/<id>.json · /aiguide/a/<언어>/<id>.mp3 (R2 저장소 — 「배포해」 때 올림)
 *  · 기록(그날 들은 곳·끊긴 설명·안내 언어)은 이 기기 안에만(localStorage) — 위치는 화면 안에서만 쓰고 보내지 않음 */
(function(){
  if(window.PC_HOME) return;
  var HUB="https://brief-live-hub.emhwang3.workers.dev", V="1115c3";
  var GL=["ko","en","es"], R_CAR_MS=20/3.6, CAR_HOLD_MS=180000, FADE_MS=1600;
  var TX={
    btn:{ko:"AI 안내",en:"AI Guide",ja:"AI案内",zhs:"AI导览",zht:"AI導覽",es:"Guía IA"},
    on:{ko:"AI 안내 켜짐",en:"AI Guide on",ja:"AI案内 オン",zhs:"AI导览 已开启",zht:"AI導覽 已開啟",es:"Guía IA activada"},
    sub:{ko:"명소 근처에 가면 설명이 자동으로 재생돼요. 안내 중에는 화면이 꺼지지 않아요.",en:"When you get near a sight, its story plays automatically. The screen stays on while the guide is running.",ja:"名所の近くに行くと解説が自動で流れます。案内中は画面が消えません。",zhs:"走近景点时会自动播放讲解。导览期间屏幕保持常亮。",zht:"走近景點時會自動播放講解。導覽期間螢幕保持常亮。",es:"Cuando te acerques a un lugar, su explicación sonará sola. La pantalla se queda encendida mientras la guía está activa."},
    lang:{ko:"안내 언어",en:"Guide language",ja:"案内の言語",zhs:"导览语言",zht:"導覽語言",es:"Idioma de la guía"},
    wait:{ko:"근처에 안내할 곳을 찾는 중이에요",en:"Looking for places nearby",ja:"近くの案内スポットを探しています",zhs:"正在寻找附近的讲解地点",zht:"正在尋找附近的講解地點",es:"Buscando lugares cercanos"},
    nopos:{ko:"위치를 받을 수 없어요 — 폰 설정에서 위치 권한을 켜 주세요",en:"Can't get your location — please allow location access",ja:"位置情報を取得できません — スマホの設定で位置情報を許可してください",zhs:"无法获取位置 — 请在手机设置中允许定位",zht:"無法取得位置 — 請在手機設定中允許定位",es:"No se puede obtener tu ubicación: activa el permiso de ubicación"},
    play:{ko:"재생",en:"Play",ja:"再生",zhs:"播放",zht:"播放",es:"Reproducir"},
    pause:{ko:"일시 정지",en:"Pause",ja:"一時停止",zhs:"暂停",zht:"暫停",es:"Pausa"},
    skip:{ko:"건너뛰기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"跳過",es:"Saltar"},
    again:{ko:"다시 듣기",en:"Play again",ja:"もう一度聞く",zhs:"再听一遍",zht:"再聽一遍",es:"Escuchar otra vez"},
    text:{ko:"설명 글",en:"Transcript",ja:"説明文",zhs:"讲解文字",zht:"講解文字",es:"Texto"},
    cut:{ko:"중간에 끊긴 설명",en:"Interrupted stories",ja:"途中で切れた解説",zhs:"中途中断的讲解",zht:"中途中斷的講解",es:"Explicaciones interrumpidas"},
    off:{ko:"끄기",en:"Turn off",ja:"オフにする",zhs:"关闭",zht:"關閉",es:"Desactivar"},
    playing:{ko:"재생 중",en:"Playing",ja:"再生中",zhs:"播放中",zht:"播放中",es:"Reproduciendo"},
    paused:{ko:"일시 정지됨",en:"Paused",ja:"一時停止中",zhs:"已暂停",zht:"已暫停",es:"En pausa"},
    done:{ko:"오늘 들은 곳은 다시 자동 재생하지 않아요",en:"Places you've heard today won't play again automatically",ja:"今日聞いた場所は自動で再生しません",zhs:"今天听过的地点不会再自动播放",zht:"今天聽過的地點不會再自動播放",es:"Los lugares que ya escuchaste hoy no se repiten solos"},
    car:{ko:"차량 이동 중 — 300m 안 명소를 안내해요",en:"In a vehicle — sights within 300 m",ja:"車で移動中 — 300m以内の名所を案内します",zhs:"乘车中 — 讲解300米内的景点",zht:"乘車中 — 講解300公尺內的景點",es:"En vehículo: lugares a menos de 300 m"},
    err:{ko:"음성을 불러오지 못했어요",en:"Couldn't load the audio",ja:"音声を読み込めませんでした",zhs:"无法加载语音",zht:"無法載入語音",es:"No se pudo cargar el audio"},
    k_spot:{ko:"명소",en:"Sight",ja:"名所",zhs:"景点",zht:"景點",es:"Lugar"},
    k_palace:{ko:"궁 입구 소개",en:"Palace introduction",ja:"宮殿の入口案内",zhs:"宫殿入口介绍",zht:"宮殿入口介紹",es:"Presentación del palacio"},
    k_hall:{ko:"전각",en:"Palace hall",ja:"殿閣",zhs:"殿阁",zht:"殿閣",es:"Pabellón del palacio"},
    src_khs:{ko:"국가유산청",en:"Korea Heritage Service",ja:"国家遺産庁",zhs:"国家遗产厅",zht:"國家遺產廳",es:"Servicio de Patrimonio de Corea"},
    src_kto:{ko:"한국관광공사",en:"Korea Tourism Organization",ja:"韓国観光公社",zhs:"韩国观光公社",zht:"韓國觀光公社",es:"Organización de Turismo de Corea"},
    src:{ko:"자료",en:"Sources",ja:"資料",zhs:"资料",zht:"資料",es:"Fuentes"}
  };
  var LN={ko:"한국어",en:"English",es:"Español"};
  function U(k){ var o=TX[k]; return o[window.LANG]||o.en; }
  function es(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function ls(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); localStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
  function today(){ return new Date(Date.now()+9*3600e3).toISOString().slice(0,10); }
  function km(a,b){ var R=6371e3, r=Math.PI/180, dLa=(b[0]-a[0])*r, dLo=(b[1]-a[1])*r, h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(h)); }   // 미터
  function mmss(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+":"+("0"+s%60).slice(-2); }

  var S={on:false, idx:null, items:[], wid:null, pos:null, acc:null, hist:[], car:false, cur:null, curAt:0, paused:false, conf:{}, msg:"", txt:{}, open:false, wl:null, fading:false, lastEval:0, timer:null};
  var A=new Audio(); A.preload="auto";
  S.gl=(function(){ var g=ls("mpv_aig_lang"); if(GL.indexOf(g)>=0) return g; return GL.indexOf(window.LANG)>=0?window.LANG:"en"; })();
  function day(){ var h=ls("mpv_aig_day"); if(!h||h.d!==today()) h={d:today(),heard:{},cut:[]}; return h; }
  function daySave(h){ ls("mpv_aig_day",h); }

  // ── 목록 ──
  function loadIdx(){ if(S.idx) return Promise.resolve(S.idx);
    return fetch("data/aiguide.json?v="+V).then(function(r){ return r.json(); }).then(function(j){ S.idx=j; S.items=j.items||[]; return j; }); }
  function itemById(id){ for(var i=0;i<S.items.length;i++) if(S.items[i].id===id) return S.items[i]; return null; }
  function title(it,g){ return (it&&it.t&&(it.t[g||S.gl]||it.t.en||it.t.ko))||""; }
  function getText(id){ if(S.txt[id]) return Promise.resolve(S.txt[id]);
    return fetch(HUB+"/aiguide/t/"+id+".json?v="+(S.idx&&S.idx.v||V)).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){ S.txt[id]=j; return j; }); }

  // ── 위치 ──
  function onPos(p){ var c=p.coords, now=Date.now(), q=[c.latitude,c.longitude];
    S.pos=q; S.acc=c.accuracy; S.msg="";
    S.hist.push({t:now,q:q,v:(c.speed!=null&&c.speed>=0)?c.speed:null}); while(S.hist.length&&now-S.hist[0].t>20000) S.hist.shift();
    var sp=[]; for(var i=1;i<S.hist.length;i++){ var a=S.hist[i-1], b=S.hist[i], dt=(b.t-a.t)/1000; sp.push(b.v!=null?b.v:(dt>0.5?km(a.q,b.q)/dt:0)); }
    // 차 판정 (11-15 「나」): 시속 20km 이상이면 차 · 신호 대기 등으로 잠깐 서도 3분 동안 시속 11km(3m/s) 넘는 움직임이 없을 때만 걷기로 돌아감 (11-15 사장님 「1분 → 3분」)
    var last=sp.slice(-3).sort(function(x,y){ return x-y; }), med=last.length>=2?last[Math.floor(last.length/2)]:0;
    if(med>=R_CAR_MS){ S.car=true; S.fastAt=now; }
    else if(S.car){ if(sp.length&&sp[sp.length-1]>=3) S.fastAt=now; if(now-(S.fastAt||0)>CAR_HOLD_MS) S.car=false; }
    evalNow(); }
  function onPosErr(){ if(!S.pos){ S.msg=U("nopos"); draw(); } }
  function watch(on){ if(!navigator.geolocation) return; if(on){ if(S.wid!=null) return;
      try{ S.wid=navigator.geolocation.watchPosition(onPos,onPosErr,{enableHighAccuracy:true,maximumAge:2000,timeout:20000}); }catch(e){} }
    else if(S.wid!=null){ try{ navigator.geolocation.clearWatch(S.wid); }catch(e){} S.wid=null; } }

  // ── 고르기 ──
  function radius(it){ return S.car?(it.rc||0):(it.rw||0); }
  function cands(){ var h=day(), out=[]; if(!S.pos||S.acc>100) return out;
    for(var i=0;i<S.items.length;i++){ var it=S.items[i], r=radius(it); if(!r||h.heard[it.id]) continue;
      if(it.k==="hall"&&S.acc>40) continue;
      var d=km(S.pos,[it.la,it.lo]); if(d<=r) out.push({it:it,d:d,f:d/r}); }
    out.sort(function(a,b){ return a.f-b.f; }); return out; }
  function evalNow(){ var now=Date.now(); if(!S.on||!S.items.length) { draw(); return; } S.lastEval=now;
    if(S.car&&now-(S.fastAt||0)>CAR_HOLD_MS) S.car=false;   // 서 있으면 위치 알림이 끊길 수 있어 시간으로도 본다
    var cs=cands(), seen={};
    cs.forEach(function(c){ seen[c.it.id]=1; S.conf[c.it.id]=(S.conf[c.it.id]||0)+1; });
    for(var k in S.conf) if(!seen[k]) delete S.conf[k];
    var best=null; for(var i=0;i<cs.length;i++) if(S.conf[cs[i].it.id]>=2){ best=cs[i]; break; }
    if(best&&!S.fading){
      if(!S.cur) play(best.it,false);
      // 차로 이동 중엔 지금 설명을 끝까지 — 그사이 지나친 곳은 건너뛰고, 끝났을 때 아직 반경 안인 곳만 다음으로(ended → evalNow) · 걸을 땐 페이드로 바로 넘어감
      else if(!S.paused&&!S.car&&best.it.id!==S.cur.id&&now-S.curAt>8000){
        var dc=S.pos?km(S.pos,[S.cur.la,S.cur.lo]):1e9, rc=radius(S.cur)||S.cur.rw||100;
        if(best.f<dc/rc) cutTo(best.it);   // 다음 곳이 지금 곳보다 (반경 대비) 가까우면 넘어감
      }
    }
    draw(); }

  // ── 재생 ──
  function fadeOut(cb){ if(A.paused||!A.src){ cb(); return; } S.fading=true; var v0=A.volume, t0=Date.now();
    var iv=setInterval(function(){ var k=Math.min(1,(Date.now()-t0)/FADE_MS); try{ A.volume=Math.max(0,v0*(1-k)); }catch(e){} if(k>=1){ clearInterval(iv); try{ A.pause(); }catch(e){} try{ A.volume=1; }catch(e){} S.fading=false; cb(); } },60); }
  function cutTo(next,manual){ var c=S.cur, h=day(); if(c&&A.currentTime<(A.duration||1e9)-3){ h.cut=h.cut.filter(function(x){ return x.id!==c.id; }); h.cut.unshift({id:c.id,at:Date.now()}); h.cut=h.cut.slice(0,5); daySave(h); }
    fadeOut(function(){ play(next,!!manual); }); }
  function play(it,manual){ var h=day(); h.heard[it.id]=1; if(manual) h.cut=h.cut.filter(function(x){ return x.id!==it.id; }); daySave(h);
    S.cur=it; S.curAt=Date.now(); S.paused=false; S.err=false;
    A.src=HUB+"/aiguide/a/"+S.gl+"/"+it.id+".mp3?v="+(S.idx&&S.idx.v||V); try{ A.currentTime=0; A.volume=1; }catch(e){}
    var pr=A.play(); if(pr&&pr.catch) pr.catch(function(){ S.paused=true; draw(); });
    getText(it.id).then(draw,function(){}); draw(); }
  A.addEventListener("ended",function(){ S.cur=null; S.paused=false; draw(); setTimeout(evalNow,500); });
  A.addEventListener("error",function(){ if(!S.cur) return; S.err=true; S.cur=null; draw(); });
  A.addEventListener("timeupdate",function(){ var e=document.getElementById("aigTm"); if(e&&S.cur) e.textContent=mmss(A.currentTime)+" / "+mmss(A.duration||(S.cur.d&&S.cur.d[S.gl])||0); });
  function toggle(){ if(!S.cur) return; if(A.paused){ var pr=A.play(); if(pr&&pr.catch) pr.catch(function(){}); S.paused=false; } else { A.pause(); S.paused=true; } draw(); }
  function skip(){ if(!S.cur) return; fadeOut(function(){ S.cur=null; S.paused=false; draw(); setTimeout(evalNow,300); }); }
  function again(id){ var it=itemById(id); if(!it) return; if(S.cur&&S.cur.id!==id&&!A.paused){ cutTo(it,true); return; } fadeOut(function(){ play(it,true); }); }

  // ── 화면 꺼짐 방지 ──
  function lock(on){ if(on){ if(S.wl||!navigator.wakeLock||document.visibilityState!=="visible") return;
      navigator.wakeLock.request("screen").then(function(w){ S.wl=w; w.addEventListener("release",function(){ S.wl=null; }); },function(){}); }
    else if(S.wl){ try{ S.wl.release(); }catch(e){} S.wl=null; } }
  document.addEventListener("visibilitychange",function(){ if(S.on&&document.visibilityState==="visible") lock(true); });

  // ── 켜기·끄기 ──
  function start(){ S.on=true; ls("mpv_aig_on",1);
    try{ A.muted=false; }catch(e){}
    lock(true); loadIdx().then(function(){ watch(true); draw(); evalNow(); },function(){ draw(); });
    clearInterval(S.timer); S.timer=setInterval(function(){ if(Date.now()-S.lastEval>4000) evalNow(); },2000);
    draw(); try{ document.getElementById("aigCard").scrollIntoView({block:"nearest",behavior:"smooth"}); }catch(e){} }
  function stop(){ S.on=false; ls("mpv_aig_on",0); clearInterval(S.timer); watch(false); lock(false);
    fadeOut(function(){ S.cur=null; S.paused=false; draw(); }); S.conf={}; draw(); }
  function setGl(g){ if(GL.indexOf(g)<0||g===S.gl) return; S.gl=g; ls("mpv_aig_lang",g);
    if(S.cur){ var it=S.cur; fadeOut(function(){ play(it,true); }); } draw(); }

  // ── 화면 ──
  var css="#aigBtn{position:absolute;top:8px;right:8px;z-index:8;display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 13px 0 10px;border-radius:999px;border:2px solid var(--green,#2f9e44);background:var(--card,#fff);color:var(--green,#2f9e44);font:inherit;font-size:14px;font-weight:900;white-space:nowrap;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.22);-webkit-tap-highlight-color:transparent}"
    +"#aigBtn img{height:20px;width:auto;margin:0}#aigBtn.on{background:var(--green,#2f9e44);color:#fff}#aigBtn.on img{background:#fff;border-radius:50%;padding:1px}"
    +"#aigCard{border:2px solid var(--green,#2f9e44)}#aigCard[hidden]{display:none}#aigCard .ah{display:flex;align-items:center;gap:8px}#aigCard .ah .t{flex:1;font-weight:900;font-size:16px;color:var(--green,#2f9e44)}"
    +"#aigCard .as{font-size:13px;color:var(--sub);margin:4px 0 8px;line-height:1.5}#aigCard .al{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px;font-size:13px;color:var(--sub)}"
    +"#aigCard .al button{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:5px 12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}#aigCard .al button.on{border-color:var(--green,#2f9e44);background:#eefaf0;color:var(--green,#2f9e44)}"
    +"#aigCard .np{display:flex;gap:10px;align-items:flex-start;background:var(--bg);border-radius:12px;padding:10px}#aigCard .np img.ph{width:84px;height:84px;object-fit:cover;border-radius:10px;flex:0 0 auto;background:var(--line)}"
    +"#aigCard .np .nt{font-weight:900;font-size:16px;line-height:1.35}#aigCard .np .nk{font-size:12px;color:var(--sub);margin-top:2px}#aigCard .np .nm{font-size:13px;color:var(--green,#2f9e44);font-weight:800;margin-top:4px}"
    +"#aigCard .ab{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}#aigCard .ab button{flex:1 1 auto;min-width:0;border:1.5px solid var(--green,#2f9e44);background:var(--card);color:var(--green,#2f9e44);border-radius:999px;padding:9px 10px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:normal;line-height:1.25}#aigCard .ab button.pri{background:var(--green,#2f9e44);color:#fff}#aigCard .ab button:disabled{opacity:.4;cursor:default}"
    +"#aigCard .tx{margin:10px 0 0}#aigCard .tx .xtrow{font-weight:800;font-size:14px}#aigCard .tx .bd{font-size:14.5px;line-height:1.75;margin-top:8px;white-space:pre-wrap}#aigCard .sr{font-size:12px;color:var(--sub);margin-top:6px}"
    +"#aigCard .cu{margin:12px 0 0;border-top:1px solid var(--line);padding-top:10px}#aigCard .cu .ct{font-size:13px;font-weight:800;color:var(--sub);margin-bottom:6px}#aigCard .cu .ci{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:14px}#aigCard .cu .ci span{flex:1}"
    +"#aigCard .cu .ci button{border:1.5px solid var(--green,#2f9e44);background:var(--card);color:var(--green,#2f9e44);border-radius:999px;padding:4px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}#aigCard .ms{font-size:13px;color:var(--sub);margin-top:8px}#aigCard .ms.e{color:#e03131}"
    +"#aigCard .off{border:0;background:none;color:var(--sub);font:inherit;font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer;padding:4px}";
  function mount(){ var map=document.getElementById("map"); if(!map||document.getElementById("aigBtn")) return;
    var st=document.createElement("style"); st.id="aigCss"; st.textContent=css; document.head.appendChild(st);
    var b=document.createElement("button"); b.type="button"; b.id="aigBtn"; b.addEventListener("click",function(e){ e.stopPropagation(); if(S.on) stop(); else start(); }); map.appendChild(b);
    var c=document.createElement("div"); c.id="aigCard"; c.className="item"; c.hidden=true; map.insertAdjacentElement("afterend",c);
    c.addEventListener("click",function(e){ var t=e.target.closest("[data-a]"); if(!t) return; var a=t.getAttribute("data-a");
      if(a==="off") stop(); else if(a==="tg") toggle(); else if(a==="skip") skip(); else if(a==="again") again(t.getAttribute("data-id")); else if(a==="gl") setGl(t.getAttribute("data-g"));
      else if(a==="tx"){ S.open=!S.open; draw(); } });
    if(ls("mpv_aig_on")===1){ /* 다시 열면 꺼진 채로 — 소리는 손님이 눌러야 나온다(자동 재생 막힘) */ ls("mpv_aig_on",0); }
    draw(); }
  function srcLine(j){ var s=(j&&j.src)||[]; if(!s.length) return ""; return '<div class="sr">'+es(U("src"))+": "+s.map(function(k){ return es(U("src_"+k)); }).join(" · ")+'</div>'; }
  function draw(){ var b=document.getElementById("aigBtn"), c=document.getElementById("aigCard"); if(!b||!c) return;
    b.className=S.on?"on":""; b.innerHTML=(window.MPIMG?window.MPIMG("mi_speaker"):"")+'<span>'+es(U(S.on?"on":"btn"))+'</span>'; b.setAttribute("aria-pressed",S.on?"true":"false");
    c.hidden=!S.on; if(!S.on){ c.innerHTML=""; return; }
    var h=day(), it=S.cur, j=it&&S.txt[it.id], g=S.gl;
    var H='<div class="ah">'+(window.MPIMG?window.MPIMG("mi_speaker","height:22px;width:auto"):"")+'<div class="t">'+es(U("btn"))+'</div><button type="button" class="off" data-a="off">'+es(U("off"))+'</button></div>'
      +'<div class="as">'+es(U("sub"))+'</div>'
      +'<div class="al"><span>'+es(U("lang"))+'</span>'+GL.map(function(x){ return '<button type="button" data-a="gl" data-g="'+x+'" class="'+(x===g?"on":"")+'">'+LN[x]+'</button>'; }).join("")+'</div>';
    if(it){ var dist=S.pos?Math.round(km(S.pos,[it.la,it.lo])):null;
      H+='<div class="np">'+(it.img?'<img class="ph" src="'+es(it.img)+'" alt="">':'')+'<div style="flex:1;min-width:0"><div class="nt">'+es((j&&j[g]&&j[g].title)||title(it,g))+'</div>'
        +'<div class="nk">'+es(U("k_"+it.k))+(dist!=null?' · '+dist+' m':'')+'</div>'
        +'<div class="nm">'+es(U(S.paused?"paused":"playing"))+' · <span id="aigTm">'+mmss(A.currentTime)+' / '+mmss(A.duration||(it.d&&it.d[g])||0)+'</span></div></div></div>'
        +'<div class="ab"><button type="button" class="pri" data-a="tg">'+es(U(S.paused?"play":"pause"))+'</button><button type="button" data-a="skip">'+es(U("skip"))+'</button><button type="button" data-a="again" data-id="'+es(it.id)+'">'+es(U("again"))+'</button></div>';
      if(j&&j[g]) H+='<div class="tx"><div class="xtrow" data-a="tx" style="cursor:pointer">'+es(U("text"))+(window.XTG?window.XTG.html(S.open):"")+'</div>'+(S.open?'<div class="bd">'+es(j[g].script)+'</div>':'')+srcLine(j)+'</div>';
    } else {
      H+='<div class="ms'+(S.msg?' e':'')+'">'+es(S.err?U("err"):(S.msg||U("wait")))+'</div>';
    }
    if(S.car&&S.on) H+='<div class="ms">'+es(U("car"))+'</div>';
    var cut=h.cut.filter(function(x){ return !(it&&x.id===it.id)&&itemById(x.id); });
    if(cut.length) H+='<div class="cu"><div class="ct">'+es(U("cut"))+'</div>'+cut.map(function(x){ var ci=itemById(x.id); return '<div class="ci"><span>'+es(title(ci,g))+'</span><button type="button" data-a="again" data-id="'+es(x.id)+'">'+es(U("again"))+'</button></div>'; }).join("")+'</div>';
    if(Object.keys(h.heard).length) H+='<div class="ms">'+es(U("done"))+'</div>';
    c.innerHTML=H; }
  var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount); else mount();
  // 시험 틀용(손님 화면에는 영향 없음)
  window.AIG={S:S,A:A,eval:evalNow,start:start,stop:stop,again:again,setGl:setGl,day:day};
})();
