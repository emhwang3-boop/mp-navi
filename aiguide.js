/* 🎧 AI 안내 (11-15 사장님 「AI 안내 — 앱에만」·「나로 한다」) — 앱 지도 화면 「AI 안내」 단추 · 홈페이지(PC_HOME)에는 없음
 *  · 켜면 화면 꺼짐 방지(Wake Lock) + 위치를 따라 근처 명소·궁 입구·전각 설명을 음성으로 자동 재생, 끄면 멈춤
 *  · 트는 조건: 명소 걸을 때 100m·차(시속 20km 이상) 300m · 궁 입구 소개 100m(걸을 때만) · 전각 35m(걸을 때만)
 *    한 번에 하나 · 그날 들은 곳은 다시 자동 재생하지 않음
 *  · 걸을 때: 설명 중 다음 곳 반경에 들어서면(그리고 그곳이 지금 곳보다 가까우면) 지금 설명을 부드럽게 줄이고(페이드) 새 곳으로 — 끊긴 설명은 「다시 듣기」
 *  · 차로 이동 중(「나」 11-15): 지금 설명을 끝까지 — 그사이 지나친 곳은 건너뛰고, 끝났을 때 아직 반경 안인 곳만 다음으로
 *  · 안내 언어 6개(11-15): 한국어·English·Español / 日本語·简体中文·繁體中文 — 두 줄 3개씩 · 처음엔 앱 언어 · 중국어 간체·번체는 같은 표준 중국어 음성(zh)
 *  · 지도 따라가기(11-15 「이것도 해줘」): 켜 둔 동안 「나」를 따라 지도가 움직이고(10m 이상 움직였을 때만), 구 화면·지역 약도 밖으로 나가면
 *    그 자리의 구 화면·약도로 — 🔴 전국 지도(kr)로는 바꾸지 않음 · 손으로 끌면 잠시 멈추고 「◎ 내 위치로」(또는 「나」)를 누르면 다시 · 지금 곳·다음 곳은 지도 핀으로
 *  · 골라 듣기(11-15): 지도 명소 카드의 「AI 안내 듣기」 · 안내 칸의 「궁별 목록」 — 꺼져 있어도 바로 재생, 듣는 동안엔 자동으로 넘어가지 않음(끝나면 자동 규칙)
 *  · 목록 = data/aiguide.json · 설명 글·음성 = 허브 /aiguide/t/<id>.json · /aiguide/a/<ko|en|es|ja|zh>/<id>.mp3 (R2 — 「배포해」 때 올림)
 *  · 기록(그날 들은 곳·끊긴 설명·안내 언어)은 이 기기 안에만(localStorage) — 위치는 화면 안에서만 쓰고 보내지 않음 */
(function(){
  if(window.PC_HOME) return;
  var HUB="https://brief-live-hub.emhwang3.workers.dev", V="1115l6";
  var GL=["ko","en","es","ja","zhs","zht"], AUD={ko:"ko",en:"en",es:"es",ja:"ja",zhs:"zh",zht:"zh"};
  var R_CAR_MS=20/3.6, CAR_HOLD_MS=180000, FADE_MS=1600, FOLLOW_M=10;
  var TX={
    btn:{ko:"AI 안내",en:"AI Guide",ja:"AI案内",zhs:"AI导览",zht:"AI導覽",es:"Guía IA"},
    on:{ko:"AI 안내 켜짐",en:"AI Guide on",ja:"AI案内 オン",zhs:"AI导览 已开启",zht:"AI導覽 已開啟",es:"Guía IA activada"},
    sub:{ko:"명소 근처에 가면 설명이 자동으로 재생돼요. 안내 중에는 화면이 꺼지지 않아요.",en:"When you get near a sight, its story plays automatically. The screen stays on while the guide is running.",ja:"名所の近くに行くと解説が自動で流れます。案内中は画面が消えません。",zhs:"走近景点时会自动播放讲解。导览期间屏幕保持常亮。",zht:"走近景點時會自動播放講解。導覽期間螢幕保持常亮。",es:"Cuando te acerques a un lugar, su explicación sonará sola. La pantalla se queda encendida mientras la guía está activa."},
    sub2:{ko:"선택한 곳의 설명을 들려 드려요. 지도 위 「AI 안내」를 켜면 위치를 따라 자동으로 재생돼요.",en:"Playing the place you chose. Turn on “AI Guide” on the map to hear stories automatically as you move.",ja:"選んだ場所の解説を再生します。地図の「AI案内」をオンにすると、位置に合わせて自動で流れます。",zhs:"正在为您播放所选地点的讲解。打开地图上的“AI导览”，即可随位置自动播放。",zht:"正在為您播放所選地點的講解。開啟地圖上的「AI導覽」，即可隨位置自動播放。",es:"Escuchas el lugar que elegiste. Activa «Guía IA» en el mapa para que suene sola según te muevas."},
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
    close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
    playing:{ko:"재생 중",en:"Playing",ja:"再生中",zhs:"播放中",zht:"播放中",es:"Reproduciendo"},
    paused:{ko:"일시 정지됨",en:"Paused",ja:"一時停止中",zhs:"已暂停",zht:"已暫停",es:"En pausa"},
    done:{ko:"오늘 들은 곳은 다시 자동 재생하지 않아요",en:"Places you've heard today won't play again automatically",ja:"今日聞いた場所は自動で再生しません",zhs:"今天听过的地点不会再自动播放",zht:"今天聽過的地點不會再自動播放",es:"Los lugares que ya escuchaste hoy no se repiten solos"},
    car:{ko:"차량 이동 중 — 300m 안 명소를 안내해요",en:"In a vehicle — sights within 300 m",ja:"車で移動中 — 300m以内の名所を案内します",zhs:"乘车中 — 讲解300米内的景点",zht:"乘車中 — 講解300公尺內的景點",es:"En vehículo: lugares a menos de 300 m"},
    manual:{ko:"선택한 곳을 듣는 중 — 끝나면 위치 따라 자동 재생으로 돌아가요",en:"Playing the place you chose — auto play resumes when it ends",ja:"選んだ場所を再生中 — 終わると位置に合わせた自動再生に戻ります",zhs:"正在播放您选择的地点 — 结束后恢复按位置自动播放",zht:"正在播放您選擇的地點 — 結束後恢復依位置自動播放",es:"Escuchas el lugar que elegiste; al terminar vuelve la reproducción automática"},
    err:{ko:"음성을 불러오지 못했어요",en:"Couldn't load the audio",ja:"音声を読み込めませんでした",zhs:"无法加载语音",zht:"無法載入語音",es:"No se pudo cargar el audio"},
    listen:{ko:"AI 안내 듣기",en:"Listen to AI Guide",ja:"AI案内を聞く",zhs:"收听AI导览",zht:"收聽AI導覽",es:"Escuchar la guía IA"},
    plist:{ko:"궁별 목록",en:"Palaces and their halls",ja:"宮殿別の一覧",zhs:"按宫殿浏览",zht:"依宮殿瀏覽",es:"Palacios y sus pabellones"},
    intro:{ko:"입구 소개",en:"Entrance introduction",ja:"入口の案内",zhs:"入口介绍",zht:"入口介紹",es:"Presentación del palacio"},
    mepos:{ko:"◎ 내 위치로",en:"◎ My location",ja:"◎ 現在地へ",zhs:"◎ 回到我的位置",zht:"◎ 回到我的位置",es:"◎ Mi ubicación"},
    now:{ko:"지금 설명 중",en:"Now playing",ja:"解説中",zhs:"正在讲解",zht:"正在講解",es:"Sonando ahora"},
    next:{ko:"다음 안내",en:"Up next",ja:"次の案内",zhs:"下一个",zht:"下一個",es:"Siguiente"},
    k_spot:{ko:"명소",en:"Sight",ja:"名所",zhs:"景点",zht:"景點",es:"Lugar"},
    k_palace:{ko:"궁 입구 소개",en:"Palace introduction",ja:"宮殿の入口案内",zhs:"宫殿入口介绍",zht:"宮殿入口介紹",es:"Presentación del palacio"},
    k_hall:{ko:"전각",en:"Palace hall",ja:"殿閣",zhs:"殿阁",zht:"殿閣",es:"Pabellón del palacio"},
    src_khs:{ko:"국가유산청",en:"Korea Heritage Service",ja:"国家遺産庁",zhs:"国家遗产厅",zht:"國家遺產廳",es:"Servicio de Patrimonio de Corea"},
    src_kto:{ko:"한국관광공사",en:"Korea Tourism Organization",ja:"韓国観光公社",zhs:"韩国观光公社",zht:"韓國觀光公社",es:"Organización de Turismo de Corea"},
    src_odii:{ko:"한국관광공사 오디",en:"Korea Tourism Organization Odii",ja:"韓国観光公社 Odii",zhs:"韩国观光公社 Odii",zht:"韓國觀光公社 Odii",es:"Odii de la Organización de Turismo de Corea"},
    src_wiki:{ko:"위키백과",en:"Wikipedia",ja:"ウィキペディア",zhs:"维基百科",zht:"維基百科",es:"Wikipedia"},
    src:{ko:"자료",en:"Sources",ja:"資料",zhs:"资料",zht:"資料",es:"Fuentes"}
  };
  var LN={ko:"한국어",en:"English",es:"Español",ja:"日本語",zhs:"简体中文",zht:"繁體中文"};
  var PAL=["gyeongbok","changdeok","changgyeong","deoksu","gyeonghui","jongmyo"];
  function U(k){ var o=TX[k]; return o[window.LANG]||o.en; }
  function es(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function ls(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); localStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
  function today(){ return new Date(Date.now()+9*3600e3).toISOString().slice(0,10); }
  function km(a,b){ var R=6371e3, r=Math.PI/180, dLa=(b[0]-a[0])*r, dLo=(b[1]-a[1])*r, h=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(h)); }   // 미터
  function mmss(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+":"+("0"+s%60).slice(-2); }

  var S={on:false, card:false, manual:false, idx:null, items:[], wid:null, pos:null, acc:null, hist:[], car:false, cur:null, curAt:0, paused:false, conf:{}, msg:"", txt:{}, open:false, plOpen:false, plSub:{}, wl:null, fading:false, lastEval:0, timer:null,
    follow:true, lastFollow:null, userAt:0, selfZ:false};
  var A=new Audio(); A.preload="auto";
  S.gl=(function(){ var g=ls("mpv_aig_lang"); if(GL.indexOf(g)>=0) return g; return GL.indexOf(window.LANG)>=0?window.LANG:"en"; })();
  function day(){ var h=ls("mpv_aig_day"); if(!h||h.d!==today()) h={d:today(),heard:{},cut:[]}; return h; }
  function daySave(h){ ls("mpv_aig_day",h); }

  // ── 목록 ──
  function loadIdx(){ if(S.idx) return Promise.resolve(S.idx); if(S._ld) return S._ld;
    S._ld=fetch("data/aiguide.json?v="+V).then(function(r){ return r.json(); }).then(function(j){ S.idx=j; S.items=j.items||[]; return j; }); return S._ld; }
  function itemById(id){ for(var i=0;i<S.items.length;i++) if(S.items[i].id===id) return S.items[i]; return null; }
  function itemBySpot(k){ for(var i=0;i<S.items.length;i++){ var it=S.items[i]; if(it.id===k||(it.sk&&it.sk.indexOf(k)>=0)) return it; } return null; }
  function lg(it){ return it&&it.t&&it.t[S.gl]?S.gl:"en"; }   // 그곳에 이 언어 원고가 없으면 영어로
  function title(it,g){ g=g||S.gl; return (it&&it.t&&(it.t[g]||it.t.en||it.t.ko))||""; }
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
    evalNow(); followStep(false); }
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
  function nextItem(){ if(!S.pos) return null; var h=day(), best=null, bd=2000;   // 다음으로 나올 곳 = 아직 안 들은 곳 중 가장 가까운 곳(2km 안)
    for(var i=0;i<S.items.length;i++){ var it=S.items[i]; if(!radius(it)||h.heard[it.id]||(S.cur&&S.cur.id===it.id)) continue;
      var d=km(S.pos,[it.la,it.lo]); if(d<bd){ bd=d; best=it; } } return best; }
  function evalNow(){ var now=Date.now(); if(!S.on||!S.items.length) { draw(); return; } S.lastEval=now;
    if(S.car&&now-(S.fastAt||0)>CAR_HOLD_MS) S.car=false;   // 서 있으면 위치 알림이 끊길 수 있어 시간으로도 본다
    var cs=cands(), seen={};
    cs.forEach(function(c){ seen[c.it.id]=1; S.conf[c.it.id]=(S.conf[c.it.id]||0)+1; });
    for(var k in S.conf) if(!seen[k]) delete S.conf[k];
    var best=null; for(var i=0;i<cs.length;i++) if(S.conf[cs[i].it.id]>=2){ best=cs[i]; break; }
    if(best&&!S.fading){
      if(!S.cur) play(best.it,false);
      // 골라 듣는 중엔 자동으로 안 넘어감 · 차로 이동 중엔 지금 설명을 끝까지 — 그사이 지나친 곳은 건너뛰고, 끝났을 때 아직 반경 안인 곳만 다음으로(ended → evalNow) · 걸을 땐 페이드로 바로 넘어감
      else if(!S.manual&&!S.paused&&!S.car&&best.it.id!==S.cur.id&&now-S.curAt>8000){
        var dc=S.pos?km(S.pos,[S.cur.la,S.cur.lo]):1e9, rc=radius(S.cur)||S.cur.rw||100;
        if(best.f<dc/rc) cutTo(best.it);   // 다음 곳이 지금 곳보다 (반경 대비) 가까우면 넘어감
      }
    }
    draw(); pins(); }

  // ── 재생 ──
  function fadeOut(cb){ if(A.paused||!A.src){ cb(); return; } S.fading=true; var v0=A.volume, t0=Date.now();
    var iv=setInterval(function(){ var k=Math.min(1,(Date.now()-t0)/FADE_MS); try{ A.volume=Math.max(0,v0*(1-k)); }catch(e){} if(k>=1){ clearInterval(iv); try{ A.pause(); }catch(e){} try{ A.volume=1; }catch(e){} S.fading=false; cb(); } },60); }
  function cutTo(next,manual){ var c=S.cur, h=day(); if(c&&A.currentTime<(A.duration||1e9)-3){ h.cut=h.cut.filter(function(x){ return x.id!==c.id; }); h.cut.unshift({id:c.id,at:Date.now()}); h.cut=h.cut.slice(0,5); daySave(h); }
    fadeOut(function(){ play(next,!!manual); }); }
  function play(it,manual){ var h=day(); h.heard[it.id]=1; if(manual) h.cut=h.cut.filter(function(x){ return x.id!==it.id; }); daySave(h);
    S.cur=it; S.curAt=Date.now(); S.paused=false; S.err=false; S.manual=!!manual;
    A.src=HUB+"/aiguide/a/"+AUD[lg(it)]+"/"+it.id+".mp3?v="+(S.idx&&S.idx.v||V); try{ A.currentTime=0; A.volume=1; }catch(e){}
    var pr=A.play(); if(pr&&pr.catch) pr.catch(function(){ S.paused=true; draw(); });
    getText(it.id).then(draw,function(){}); draw(); pins(); }
  A.addEventListener("ended",function(){ S.cur=null; S.paused=false; S.manual=false; draw(); pins(); setTimeout(evalNow,500); });
  A.addEventListener("error",function(){ if(!S.cur) return; S.err=true; S.cur=null; S.manual=false; draw(); pins(); });
  A.addEventListener("timeupdate",function(){ var e=document.getElementById("aigTm"); if(e&&S.cur) e.textContent=mmss(A.currentTime)+" / "+mmss(A.duration||(S.cur.d&&S.cur.d[lg(S.cur)])||0); });
  function toggle(){ if(!S.cur) return; if(A.paused){ var pr=A.play(); if(pr&&pr.catch) pr.catch(function(){}); S.paused=false; } else { A.pause(); S.paused=true; } draw(); }
  function skip(){ if(!S.cur) return; fadeOut(function(){ S.cur=null; S.paused=false; S.manual=false; draw(); pins(); setTimeout(evalNow,300); }); }
  function again(id){ var it=itemById(id); if(!it) return; if(S.cur&&S.cur.id!==id&&!A.paused){ cutTo(it,true); return; } fadeOut(function(){ play(it,true); }); }
  // 골라 듣기 — 지도 명소 카드·궁별 목록 (AI 안내가 꺼져 있어도 안내 칸을 열고 바로 재생)
  function listen(id){ loadIdx().then(function(){ var it=itemById(id); if(!it) return; S.card=true; draw();
      try{ document.getElementById("aigCard").scrollIntoView({block:"center",behavior:"smooth"}); }catch(e){}
      if(S.cur&&S.cur.id!==id&&!A.paused){ cutTo(it,true); return; } fadeOut(function(){ play(it,true); }); }); }

  // ── 화면 꺼짐 방지 ──
  function lock(on){ if(on){ if(S.wl||!navigator.wakeLock||document.visibilityState!=="visible") return;
      navigator.wakeLock.request("screen").then(function(w){ S.wl=w; w.addEventListener("release",function(){ S.wl=null; }); },function(){}); }
    else if(S.wl){ try{ S.wl.release(); }catch(e){} S.wl=null; } }
  document.addEventListener("visibilitychange",function(){ if(S.on&&document.visibilityState==="visible") lock(true); });

  // ── 지도 따라가기 (11-15) — 앱에 있는 「나」·약도 전환(meSet·meBest·meGo·구 화면 meGo2)을 그대로 쓴다 ──
  function selfMove(fn){ S.selfZ=true; try{ fn(); }catch(e){} S.selfZ=false; }
  function inBox(id,p){ var c=window.CITY&&CITY[id]; var b=c&&c.bb; return !!(b&&p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3]); }
  function followStep(force){ if(!S.on||!S.follow||!S.pos||window.DET) return; var p=S.pos;
    if(!force&&S.lastFollow&&km(S.lastFollow,p)<FOLLOW_M) return; S.lastFollow=p.slice();
    try{ if(typeof meSet==="function") meSet(p); }catch(e){}
    var root=window.NAVI_ROOT||"kr", cur=window.VIEW, best=(typeof meBest==="function")?meBest(p[0],p[1]):null;
    selfMove(function(){
      if(window.GU&&GU.d&&cur===GU.d.map&&inBox(cur,p)&&window.meGo2){ meGo2(); return; }   // 서울·부산 구 화면: 내가 든 구로 들어가 가운데(구 경계를 넘으면 그 구로)
      if(cur!==root&&inBox(cur,p)){ var f=meGeoFrac(cur,p[0],p[1]); if(f){ var m=document.getElementById("map"), w=m.clientWidth, as=ASP(), s=ZM.s;   // 지금 약도 안: 배율 그대로 가운데로만
          ZM={s:s,tx:w/2-f[0]*w*as*s,ty:MH()/2-f[1]*w*s}; window.ZM=ZM; zApply(); try{ meDraw(); }catch(e){} } return; }
      if(best&&best!==root&&typeof meGo==="function"){ meGo(); }   // 약도·구 화면 밖 → 그 자리 약도·구 화면 (🔴 전국 지도로는 안 바꿈)
    });
    setTimeout(pins,60); setTimeout(pins,600); }
  function followResume(){ S.follow=true; S.lastFollow=null; followStep(true); draw(); }
  // 손으로 지도를 끌거나 확대하면 따라가기를 잠시 멈춤 — 지도가 움직인 것(zApply)이 손님 손 때문일 때만
  ["touchstart","touchmove","mousedown","wheel"].forEach(function(t){ document.addEventListener(t,function(e){ try{ if(e.target&&e.target.closest&&e.target.closest("#map")&&!e.target.closest("#aigBtn,#aigMe,#meedge")) S.userAt=Date.now(); }catch(x){} },{capture:true,passive:true}); });
  function hookMap(){
    var _z=window.zApply; if(typeof _z==="function"&&!_z._aig){ var nz=function(){ var r=_z.apply(this,arguments); if(S.on){ pinScale(); if(S.follow&&!S.selfZ&&Date.now()-S.userAt<1500){ S.follow=false; draw(); } } return r; }; nz._aig=1; window.zApply=nz; }
    var _t=window.meTap; if(typeof _t==="function"&&!_t._aig){ var nt=function(){ var r=_t.apply(this,arguments); if(S.on&&!S.follow) followResume(); return r; }; nt._aig=1; window.meTap=nt; }   // 「나」를 눌러도 다시 따라감
    var _v=window.viewSet; if(typeof _v==="function"&&!_v._aig){ var nv=function(){ var r=_v.apply(this,arguments); setTimeout(pins,80); setTimeout(pins,700); return r; }; nv._aig=1; window.viewSet=nv; }
    var _p=window.placeShow; if(typeof _p==="function"&&!_p._aig){ var np=function(k){ var r=_p.apply(this,arguments); try{ cardBtn(k); }catch(e){} return r; }; np._aig=1; window.placeShow=np; }
  }
  // 지금 곳·다음 곳 핀 — 앱의 검색 핀(pinMark)과 같은 모양: 지금 곳 = 빨간 핀 + 이름, 다음 곳 = 회색 핀(지금 곳과 80m 안이면 이름 없이)
  //   지도 배율과 상관없이 화면에서 늘 같은 크기(핀 높이 약 30px) — 확대할 때마다 다시 맞춤(pinScale)
  var PIN_PX=30;
  function pinScale(){ ["aigPinC","aigPinN"].forEach(function(id){ var e=document.getElementById(id); if(!e) return; var h=+e.dataset.h||1, s=(window.ZM&&ZM.s)||1; e.style.transform="translate(-50%,-100%) scale("+(PIN_PX/(h*s))+")"; }); }
  function pinEl(id,it,col,lab){ var mz=document.getElementById("mz"), o=document.getElementById(id); if(o) o.remove(); if(!it||!mz||window.DET||typeof meGeoFrac!=="function") return;
    var f=meGeoFrac(window.VIEW,it.la,it.lo); if(!f||f[0]<0||f[0]>1||f[1]<0||f[1]>1) return;
    var w=document.getElementById("map").clientWidth, sz=Math.max(10,w*0.045), fs=Math.max(4,w*0.016), e=document.createElement("div"); e.id=id; e.dataset.h=sz*34/24;
    e.style.cssText="position:absolute;z-index:4;cursor:pointer;left:"+(f[0]*100)+"%;top:"+(f[1]*100)+"%;transform-origin:50% 100%;pointer-events:auto";
    e.innerHTML='<svg viewBox="0 0 24 34" style="display:block;width:'+sz+'px;height:'+(sz*34/24)+'px;margin:0 auto;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))"><path d="M12 1C6 1 1.5 5.5 1.5 11.3 1.5 19 12 33 12 33s10.5-14 10.5-21.7C22.5 5.5 18 1 12 1z" fill="'+col+'" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="11.5" r="4" fill="#fff"/></svg>'
      +(lab?'<div style="position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;white-space:nowrap;background:#fff;color:'+col+';border:'+Math.max(0.6,fs*0.12)+'px solid '+col+';border-radius:999px;padding:'+(fs*0.12)+'px '+(fs*0.5)+'px;font-size:'+fs+'px;font-weight:900;line-height:1.3">'+es(lab+" · "+title(it))+'</div>':'');
    e.addEventListener("click",function(ev){ ev.stopPropagation(); try{ document.getElementById("aigCard").scrollIntoView({block:"center",behavior:"smooth"}); }catch(x){} });
    mz.appendChild(e); pinScale(); }
  function pins(){ if(!S.on){ pinEl("aigPinC",null); pinEl("aigPinN",null); return; } var n=nextItem(), near=n&&S.cur&&km([n.la,n.lo],[S.cur.la,S.cur.lo])<80;
    pinEl("aigPinC",S.cur,"#e03131",U("now")); pinEl("aigPinN",n,"#868e96",near?"":U("next")); }

  // ── 켜기·끄기 ──
  function start(){ S.on=true; S.card=true; S.follow=true; S.lastFollow=null; ls("mpv_aig_on",1);
    try{ A.muted=false; }catch(e){}
    lock(true); loadIdx().then(function(){ watch(true); draw(); evalNow(); },function(){ draw(); });
    clearInterval(S.timer); S.timer=setInterval(function(){ if(Date.now()-S.lastEval>4000) evalNow(); },2000);
    draw(); try{ document.getElementById("aigCard").scrollIntoView({block:"nearest",behavior:"smooth"}); }catch(e){} }
  function stop(){ S.on=false; S.card=false; S.manual=false; ls("mpv_aig_on",0); clearInterval(S.timer); watch(false); lock(false);
    fadeOut(function(){ S.cur=null; S.paused=false; draw(); }); S.conf={}; draw(); pins(); }
  function setGl(g){ if(GL.indexOf(g)<0||g===S.gl) return; var old=S.cur?AUD[lg(S.cur)]:null; S.gl=g; ls("mpv_aig_lang",g);
    if(S.cur&&AUD[lg(S.cur)]!==old){ var it=S.cur, mn=S.manual; fadeOut(function(){ play(it,mn); }); }   // 간체 ↔ 번체는 같은 음성이라 이어서 재생
    draw(); pins(); }

  // ── 화면 ──
  var css="#aigBtn{position:absolute;top:8px;right:8px;z-index:8;display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 13px 0 10px;border-radius:999px;border:2px solid var(--green,#2f9e44);background:var(--card,#fff);color:var(--green,#2f9e44);font:inherit;font-size:14px;font-weight:900;white-space:nowrap;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.22);-webkit-tap-highlight-color:transparent}"
    +"#aigBtn img{height:20px;width:auto;margin:0}#aigBtn.on{background:var(--green,#2f9e44);color:#fff}#aigBtn.on img{background:#fff;border-radius:50%;padding:1px}"
    /* 「◎ 내 위치로」 — 앱의 「◎ 현재 위치」(#zme) 단추와 같은 모양 */
    +"#aigMe{position:absolute;left:8px;bottom:26px;z-index:8;height:38px;padding:0 15px;border-radius:999px;border:1px solid var(--line);background:var(--card);font:inherit;font-size:15px;font-weight:800;white-space:nowrap;color:#1a73e8;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);line-height:1}#aigMe[hidden]{display:none}"
    +"#aigCard{border:2px solid var(--green,#2f9e44)}#aigCard[hidden]{display:none}#aigCard .ah{display:flex;align-items:center;gap:8px}#aigCard .ah .t{flex:1;font-weight:900;font-size:16px;color:var(--green,#2f9e44)}"
    +"#aigCard .as{font-size:13px;color:var(--sub);margin:4px 0 8px;line-height:1.5}#aigCard .al{margin:0 0 10px;font-size:13px;color:var(--sub)}"
    /* 언어 단추 — 두 줄 3개씩 같은 너비 격자 (11-15) */
    +"#aigCard .al .lg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:6px}"
    +"#aigCard .al button{width:100%;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:7px 4px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#aigCard .al button.on{border-color:var(--green,#2f9e44);background:#eefaf0;color:var(--green,#2f9e44)}"
    +"#aigCard .np{display:flex;gap:10px;align-items:flex-start;background:var(--bg);border-radius:12px;padding:10px}#aigCard .np img.ph{width:84px;height:84px;object-fit:cover;border-radius:10px;flex:0 0 auto;background:var(--line)}"
    +"#aigCard .np .nt{font-weight:900;font-size:16px;line-height:1.35}#aigCard .np .nk{font-size:12px;color:var(--sub);margin-top:2px}#aigCard .np .nm{font-size:13px;color:var(--green,#2f9e44);font-weight:800;margin-top:4px}"
    +"#aigCard .ab{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}#aigCard .ab button{flex:1 1 auto;min-width:0;border:1.5px solid var(--green,#2f9e44);background:var(--card);color:var(--green,#2f9e44);border-radius:999px;padding:9px 10px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:normal;line-height:1.25}#aigCard .ab button.pri{background:var(--green,#2f9e44);color:#fff}#aigCard .ab button:disabled{opacity:.4;cursor:default}"
    +"#aigCard .tx{margin:10px 0 0}#aigCard .xtrow{font-weight:800;font-size:14px}#aigCard .tx .bd{font-size:14.5px;line-height:1.75;margin-top:8px;white-space:pre-wrap}#aigCard .sr{font-size:12px;color:var(--sub);margin-top:6px}"
    +"#aigCard .cu,#aigCard .pl{margin:12px 0 0;border-top:1px solid var(--line);padding-top:10px}#aigCard .cu .ct{font-size:13px;font-weight:800;color:var(--sub);margin-bottom:6px}#aigCard .ci{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:14px}#aigCard .ci span{flex:1;min-width:0}"
    +"#aigCard .ci button.l{border:1.5px solid var(--green,#2f9e44);background:var(--card);color:var(--green,#2f9e44);border-radius:999px;padding:4px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}#aigCard .ms{font-size:13px;color:var(--sub);margin-top:8px}#aigCard .ms.e{color:#e03131}"
    +"#aigCard .pl .pp{margin:6px 0 0 4px}#aigCard .pl .pn{font-weight:800}#aigCard .pl .ci{margin-left:10px}"
    +"#aigCard .off{border:0;background:none;color:var(--sub);font:inherit;font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer;padding:4px}"
    +".aigL{display:inline-flex;align-items:center;gap:5px;margin:8px 0 2px;border:1.5px solid var(--green,#2f9e44);background:var(--card);color:var(--green,#2f9e44);border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;font-weight:800;cursor:pointer}.aigL img{height:18px;width:auto;margin:0}";
  function mount(){ var map=document.getElementById("map"); if(!map||document.getElementById("aigBtn")) return;
    var st=document.createElement("style"); st.id="aigCss"; st.textContent=css; document.head.appendChild(st);
    var b=document.createElement("button"); b.type="button"; b.id="aigBtn"; b.addEventListener("click",function(e){ e.stopPropagation(); if(S.on) stop(); else start(); }); map.appendChild(b);
    var me=document.createElement("button"); me.type="button"; me.id="aigMe"; me.hidden=true; me.addEventListener("click",function(e){ e.stopPropagation(); followResume(); }); map.appendChild(me);
    ["touchstart","mousedown","pointerdown"].forEach(function(t){ [b,me].forEach(function(x){ x.addEventListener(t,function(e){ e.stopPropagation(); },{passive:true}); }); });   // 지도 끌기·거리재기로 안 넘어가게
    var c=document.createElement("div"); c.id="aigCard"; c.className="item"; c.hidden=true; map.insertAdjacentElement("afterend",c);
    c.addEventListener("click",function(e){ var t=e.target.closest("[data-a]"); if(!t) return; var a=t.getAttribute("data-a");
      if(a==="off") stop(); else if(a==="close"){ S.card=false; S.manual=false; fadeOut(function(){ S.cur=null; S.paused=false; draw(); }); draw(); }
      else if(a==="tg") toggle(); else if(a==="skip") skip(); else if(a==="again") again(t.getAttribute("data-id")); else if(a==="gl") setGl(t.getAttribute("data-g"));
      else if(a==="ls") listen(t.getAttribute("data-id"));
      else if(a==="tx"){ S.open=!S.open; draw(); } else if(a==="pl"){ S.plOpen=!S.plOpen; if(S.plOpen) loadIdx().then(draw); draw(); }
      else if(a==="pp"){ var p=t.getAttribute("data-p"); S.plSub[p]=!S.plSub[p]; draw(); } });
    if(ls("mpv_aig_on")===1){ /* 다시 열면 꺼진 채로 — 소리는 손님이 눌러야 나온다(자동 재생 막힘) */ ls("mpv_aig_on",0); }
    hookMap(); draw(); }
  // 지도 명소 카드에 「AI 안내 듣기」 — 그곳 음성이 있을 때만
  function cardBtn(k){ loadIdx().then(function(){ var it=itemBySpot(k); if(!it||window._cardK!==k) return; var box=document.querySelector("#res .item"); if(!box||box.querySelector(".aigL")) return;
      var bt=document.createElement("button"); bt.type="button"; bt.className="aigL"; bt.innerHTML=(window.MPIMG?window.MPIMG("mi_speaker"):"")+es(U("listen")); bt.addEventListener("click",function(e){ e.stopPropagation(); listen(it.id); });
      var t=box.querySelector(".t"); if(t) t.insertAdjacentElement("afterend",bt); else box.appendChild(bt); },function(){}); }
  function srcLine(j){ var s=(j&&j.src)||[]; if(!s.length) return ""; return '<div class="sr">'+es(U("src"))+": "+s.map(function(k){ return es(U("src_"+k)); }).join(" · ")+'</div>'; }
  function plHtml(){ if(!S.plOpen) return ""; var g=S.gl, out="";
    PAL.forEach(function(p){ var pi=itemById("pal_"+p); var hs=S.items.filter(function(x){ return x.k==="hall"&&x.pl===p; }); if(!pi&&!hs.length) return; var on=!!S.plSub[p];
      out+='<div class="pp"><div class="xtrow ci" data-a="pp" data-p="'+p+'" style="cursor:pointer"><span class="pn">'+es(pi?title(pi,g):p)+'</span>'+(window.XTG?window.XTG.html(on):"")+'</div>';
      if(on){ if(pi) out+='<div class="ci"><span>'+es(U("intro"))+'</span><button type="button" class="l" data-a="ls" data-id="'+es(pi.id)+'">'+es(U("listen"))+'</button></div>';
        hs.forEach(function(h){ var nm=title(h,g), pn=pi?title(pi,g):""; if(pn&&nm.indexOf(pn)===0) nm=nm.slice(pn.length).replace(/^[\s,·、，]+/,""); out+='<div class="ci"><span>'+es(nm||title(h,g))+'</span><button type="button" class="l" data-a="ls" data-id="'+es(h.id)+'">'+es(U("listen"))+'</button></div>'; }); }
      out+='</div>'; });
    return out; }
  function draw(){ var b=document.getElementById("aigBtn"), c=document.getElementById("aigCard"), me=document.getElementById("aigMe"); if(!b||!c) return;
    b.className=S.on?"on":""; b.innerHTML=(window.MPIMG?window.MPIMG("mi_speaker"):"")+'<span>'+es(U(S.on?"on":"btn"))+'</span>'; b.setAttribute("aria-pressed",S.on?"true":"false");
    if(me){ me.hidden=!(S.on&&!S.follow); me.textContent=U("mepos"); }
    var show=S.on||S.card; c.hidden=!show; if(!show){ c.innerHTML=""; return; }
    var h=day(), it=S.cur, j=it&&S.txt[it.id], g=S.gl, gl=it?lg(it):g;
    var H='<div class="ah">'+(window.MPIMG?window.MPIMG("mi_speaker","height:22px;width:auto"):"")+'<div class="t">'+es(U("btn"))+'</div><button type="button" class="off" data-a="'+(S.on?"off":"close")+'">'+es(U(S.on?"off":"close"))+'</button></div>'
      +'<div class="as">'+es(U(S.on?"sub":"sub2"))+'</div>'
      +'<div class="al"><span>'+es(U("lang"))+'</span><div class="lg">'+GL.map(function(x){ return '<button type="button" data-a="gl" data-g="'+x+'" class="'+(x===g?"on":"")+'" lang="'+(x==="zhs"?"zh-CN":x==="zht"?"zh-TW":x)+'">'+LN[x]+'</button>'; }).join("")+'</div></div>';
    if(it){ var dist=S.pos?Math.round(km(S.pos,[it.la,it.lo])):null;
      H+='<div class="np">'+(it.img?'<img class="ph" src="'+es(it.img)+'" alt="">':'')+'<div style="flex:1;min-width:0"><div class="nt">'+es((j&&j[gl]&&j[gl].title)||title(it,gl))+'</div>'
        +'<div class="nk">'+es(U("k_"+it.k))+(dist!=null?' · '+(dist>=1000?(dist/1000).toFixed(1)+' km':dist+' m'):'')+'</div>'
        +'<div class="nm">'+es(U(S.paused?"paused":"playing"))+' · <span id="aigTm">'+mmss(A.currentTime)+' / '+mmss(A.duration||(it.d&&it.d[gl])||0)+'</span></div></div></div>'
        +'<div class="ab"><button type="button" class="pri" data-a="tg">'+es(U(S.paused?"play":"pause"))+'</button><button type="button" data-a="skip">'+es(U("skip"))+'</button><button type="button" data-a="again" data-id="'+es(it.id)+'">'+es(U("again"))+'</button></div>';
      if(j&&j[gl]) H+='<div class="tx"><div class="xtrow" data-a="tx" style="cursor:pointer">'+es(U("text"))+(window.XTG?window.XTG.html(S.open):"")+'</div>'+(S.open?'<div class="bd">'+es(j[gl].script)+'</div>':'')+srcLine(j)+'</div>';
      if(S.on&&S.manual) H+='<div class="ms">'+es(U("manual"))+'</div>';
    } else if(S.on) {
      H+='<div class="ms'+(S.msg?' e':'')+'">'+es(S.err?U("err"):(S.msg||U("wait")))+'</div>';
    } else if(S.err) H+='<div class="ms e">'+es(U("err"))+'</div>';
    if(S.car&&S.on) H+='<div class="ms">'+es(U("car"))+'</div>';
    var cut=h.cut.filter(function(x){ return !(it&&x.id===it.id)&&itemById(x.id); });
    if(cut.length) H+='<div class="cu"><div class="ct">'+es(U("cut"))+'</div>'+cut.map(function(x){ var ci=itemById(x.id); return '<div class="ci"><span>'+es(title(ci,g))+'</span><button type="button" class="l" data-a="again" data-id="'+es(x.id)+'">'+es(U("again"))+'</button></div>'; }).join("")+'</div>';
    H+='<div class="pl"><div class="xtrow" data-a="pl" style="cursor:pointer">'+es(U("plist"))+(window.XTG?window.XTG.html(S.plOpen):"")+'</div>'+plHtml()+'</div>';
    if(S.on&&Object.keys(h.heard).length) H+='<div class="ms">'+es(U("done"))+'</div>';
    c.innerHTML=H; }
  var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount); else mount();
  // 시험 틀용(손님 화면에는 영향 없음)
  window.AIG={S:S,A:A,eval:evalNow,start:start,stop:stop,again:again,setGl:setGl,day:day,listen:listen,follow:followStep,resume:followResume};
})();
