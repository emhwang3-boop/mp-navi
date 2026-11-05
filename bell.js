/* 머니퍼즐 투어 — 🔔 앱 알림함 (사장님 2026-11-06)
 *  · 머리줄 💬 옆 종(구글 Material Symbols 「notifications」 꽉 찬 모양 = 켜짐 · 「notifications_off」 사선 = 꺼짐, Apache 2.0 경로 그대로) · 안 읽은 알림 빨간 숫자
 *  · 누르면 종 아래 알림 판 — 맨 위 「알림 받기」(켤 때 브라우저 허락 · 대화방 웹 푸시 구독과 같은 상태)·「소리」·「진동」, 아래 알림 목록(새것 위 · ✕ 지우기 · 누르면 관련 화면)
 *  · 알림을 띄우는 때: 가이드 대화방 새 글(안내 줄 포함, chat.js) · 일정 늦어짐 70% 주의(trip.js) · 그 밖에 BELL.add
 *    띄울 때마다 목록 한 줄 + 앱이 보이는 중이면 화면 위 짧은 띠·소리(Web Audio)·진동(navigator.vibrate) / 안 보이면 알림 켜짐일 때 폰 알림(service worker showNotification)
 *  · 목록은 이 기기 localStorage(mpv_bell, 최근 50개·30일). 앱이 닫혀 있을 때 sw.js 가 받은 대화방 푸시는 Cache(mpbell)에 쌓였다가 앱을 열면 목록으로
 *  · 설정 mpv_bellcfg {on,snd,vib} — sw.js 도 읽게 Cache(mpbell /__mpbell/cfg)에 사본
 *  · 🔴 문자·메일은 여기서 보내지 않는다(허브 몫) · 사이트 데이터 지우라는 안내는 쓰지 않는다
 *  · 11-06 일정 알림(k "trip")을 누르면 TRIP.alert(go) — go.q 가 있으면 그 물음(더 계시나요?·숙소), 없으면 늦어짐 주의 창
 */
(function(){
"use strict";
var LGS=["ko","en","ja","zhs","zht","es"];
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L6(o){ return !o?"":(typeof o==="string"?o:(o[window.LANG]||o.en||o.ko||"")); }
function F6(o,l,v){ return String(o[l]||o.en).replace(/\{(\w)\}/g,function(_,k){ return v[k]; }); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
var TX={
 ttl:T6("알림","Notifications","通知","通知","通知","Notificaciones"),
 on:T6("알림 받기","Get notifications","通知を受け取る","接收通知","接收通知","Recibir notificaciones"),
 snd:T6("소리","Sound","サウンド","声音","聲音","Sonido"),
 vib:T6("진동","Vibration","バイブレーション","振动","震動","Vibración"),
 blocked:T6("브라우저 설정에서 이 사이트 알림을 허용해 주세요","Please allow notifications for this site in your browser settings","ブラウザの設定でこのサイトの通知を許可してください","请在浏览器设置中允许此网站的通知","請在瀏覽器設定中允許此網站的通知","Permite las notificaciones de este sitio en la configuración del navegador"),
 unsup:T6("이 폰·브라우저에서는 폰 알림을 켤 수 없어요","Notifications aren't available on this phone or browser","この端末・ブラウザでは通知をオンにできません","此手机或浏览器无法开启通知","此手機或瀏覽器無法開啟通知","Las notificaciones no están disponibles en este teléfono o navegador"),
 ios:T6("아이폰은 공유(□↑) → 홈 화면에 추가 → 그 아이콘으로 열어야 알림이 와요","On iPhone, tap Share (□↑) → Add to Home Screen, then open the app from that icon to get notifications","iPhoneは共有（□↑）→ホーム画面に追加→そのアイコンから開くと通知が届きます","iPhone 请点「分享（□↑）」→「添加到主屏幕」，再从该图标打开才能收到通知","iPhone 請點「分享（□↑）」→「加入主畫面」，再從該圖示開啟才能收到通知","En iPhone, toca Compartir (□↑) → Añadir a pantalla de inicio y abre la app desde ese icono para recibir notificaciones"),
 empty:T6("알림이 없어요","No notifications yet","通知はありません","暂无通知","暫無通知","Aún no hay notificaciones"),
 del:T6("지우기","Delete","削除","删除","刪除","Eliminar"),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 chatT:T6("가이드 대화방 새 소식","New in your guide chat","ガイドチャットに新着","向导聊天有新消息","嚮導聊天有新訊息","Novedades en el chat con tu guía"),
 chatB:T6("{r} · 새 소식 {n}개","{r} · {n} new update(s)","{r}・新着{n}件","{r} · {n}条新消息","{r} · {n}則新訊息","{r} · {n} novedad(es)"),   // 가이드 글·확정·취소 안내 줄 모두
 chatB0:T6("가이드에게서 새 메시지가 왔습니다","New message from your guide","ガイドから新しいメッセージが届きました","您收到了向导的新消息","您收到了嚮導的新訊息","Nuevo mensaje de tu guía"),
 prompt:T6("가이드 소식을 받으려면 알림을 켜 주세요","Turn on notifications to get news from your guide","ガイドからのお知らせを受け取るには通知をオンにしてください","如需接收向导的消息，请开启通知","如需接收嚮導的消息，請開啟通知","Activa las notificaciones para recibir novedades de tu guía"),
 pbtn:T6("알림 켜기","Turn on notifications","通知をオンにする","开启通知","開啟通知","Activar notificaciones"),
 pok:T6("✓ 알림이 켜졌어요","✓ Notifications are on","✓ 通知がオンになりました","✓ 已开启通知","✓ 已開啟通知","✓ Notificaciones activadas")};
// 구글 Material Symbols (Apache 2.0, github.com/google/material-design-icons) — 경로 그대로 (직접 그리지 않음)
var P={
 on:"M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z",   // notifications (FILL 1)
 off:"M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z",   // notifications_off
 chat:"M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm160-320h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80Z",   // chat (FILL 1)
 warn:"m40-120 440-760 440 760H40Zm440-120q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Z",   // warning (FILL 1)
 info:"M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",   // info
 sndOn:"M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z",   // volume_up
 sndOff:"M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z",   // volume_off
 vibOn:"M0-360v-240h80v240H0Zm120 80v-400h80v400h-80Zm760-80v-240h80v240h-80Zm-120 80v-400h80v400h-80ZM320-120q-33 0-56.5-23.5T240-200v-560q0-33 23.5-56.5T320-840h320q33 0 56.5 23.5T720-760v560q0 33-23.5 56.5T640-120H320Zm0-80h320v-560H320v560Zm0 0v-560 560Z",   // vibration
 vibOff:"M820-28 28-820l56-56L876-84l-56 56ZM200-703l80 80v383h384l96 96v24q0 33-23.5 56.5T680-40H280q-33 0-56.5-23.5T200-120v-583Zm80 543v40h400v-40H280Zm73-560-79-80h406v-40H234l-28-28q10-23 29.5-37.5T280-920h400q33 0 56.5 23.5T760-840v526l-80-80v-326H353Zm127 560Zm-23-640Z",   // mobile_off
 close:"m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"};   // close
function SV(d,sz,st){ return '<svg viewBox="0 -960 960 960" width="'+sz+'" height="'+sz+'" fill="currentColor" aria-hidden="true" style="display:block;'+(st||"")+'"><path d="'+d+'"/></svg>'; }

// ── 설정 ──
function notifOk(){ return ("Notification" in window)&&("serviceWorker" in navigator); }
function perm(){ try{ return notifOk()?Notification.permission:"unsup"; }catch(e){ return "unsup"; } }
var CFG=(function(){ var o=null; try{ o=JSON.parse(ls("mpv_bellcfg")||"null"); }catch(e){} if(!o||typeof o!=="object") o={on:(ls("mpv_chpush")==="1"&&perm()==="granted")?1:0,snd:1,vib:1};   // 예전에 대화방 「알림 받기」를 켠 폰은 켜진 채로
  return {on:o.on?1:0,snd:o.snd===0?0:1,vib:o.vib===0?0:1}; })();
function isOn(){ return !!CFG.on&&perm()==="granted"; }
function cfgSave(){ ls("mpv_bellcfg",JSON.stringify(CFG)); try{ if(window.caches) caches.open("mpbell").then(function(c){ return c.put("/__mpbell/cfg",new Response(JSON.stringify({on:isOn()?1:0,snd:CFG.snd,vib:CFG.vib}),{headers:{"Content-Type":"application/json"}})); }).catch(function(){}); }catch(e){} }
function isIOS(){ var u=navigator.userAgent||""; return /iPad|iPhone|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1); }
function isStandalone(){ try{ return (window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true; }catch(e){ return false; } }

// ── 목록 (mpv_bell) ──
var LIST=(function(){ var a=null; try{ a=JSON.parse(ls("mpv_bell")||"[]"); }catch(e){} return Array.isArray(a)?a.filter(function(x){ return x&&x.id; }):[]; })();
function trim(){ var cut=Date.now()-30*864e5; LIST=LIST.filter(function(x){ return (+x.at||0)>=cut; }); LIST.sort(function(a,b){ return (+b.at||0)-(+a.at||0); }); if(LIST.length>50) LIST=LIST.slice(0,50); }
function save(){ trim(); ls("mpv_bell",JSON.stringify(LIST)); }
function unread(){ return LIST.filter(function(x){ return !x.rd; }).length; }
function nid(){ return "b"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function whenTx(ms){ var d=new Date((+ms||0)+9*36e5), t=new Date(Date.now()+9*36e5), hm=d.toISOString().slice(11,16); return d.toISOString().slice(0,10)===t.toISOString().slice(0,10)?hm:(d.getUTCMonth()+1)+"/"+d.getUTCDate()+" "+hm; }

// ── 머리줄 종 ──
function btnPaint(){ var b=document.getElementById("bell"); if(!b) return; var n=unread(), on=isOn(), lb=L6(TX.ttl)+(n?" ("+n+")":"");
  b.innerHTML=SV(on?P.on:P.off,24)+(n?'<span class="bldot">'+(n>99?"99+":n)+'</span>':''); b.title=lb; b.setAttribute("aria-label",lb); b.classList.toggle("bloff",!on); }
function mount(){ if(document.getElementById("bell")) return true; var hit=document.getElementById("hit"); if(!hit||!hit.parentNode) return false;
  var b=document.createElement("button"); b.id="bell"; b.type="button"; b.className="hic"; b.onclick=function(e){ e.preventDefault(); e.stopPropagation(); if(document.getElementById("bellP")) close(); else open(); };
  hit.parentNode.insertBefore(b,hit.nextSibling); btnPaint(); return true; }

// ── 알림 판 ──
var MSG="", SEENNOW={};
function whyTx(w){ return w==="blocked"?L6(TX.blocked):w==="ios"?L6(TX.ios):w==="unsup"?L6(TX.unsup):""; }
function open(){ close(); var bk=document.createElement("div"); bk.id="bellBk"; bk.onclick=close; document.body.appendChild(bk);
  var p=document.createElement("div"); p.id="bellP"; p.setAttribute("role","dialog"); document.body.appendChild(p); p._rb=paint;
  SEENNOW={}; LIST.forEach(function(x){ if(!x.rd) SEENNOW[x.id]=1; x.rd=1; }); save();   // 판을 열면 읽음 — 이번에 새로 본 줄만 이번 판에서 강조
  if(perm()==="denied") MSG="blocked"; else if(!notifOk()) MSG=isIOS()&&!isStandalone()?"ios":"unsup";
  paint(); btnPaint(); qPull(); }
function close(){ var p=document.getElementById("bellP"), bk=document.getElementById("bellBk"); if(p) p.remove(); if(bk) bk.remove(); }
function place(){ var p=document.getElementById("bellP"), b=document.getElementById("bell"); if(!p||!b) return; var r=b.getBoundingClientRect(), top=Math.round(r.bottom+6);
  p.style.top=top+"px"; p.style.maxHeight="calc(100vh - "+(top+12)+"px)"; }
function sw(k,on,ic){ return '<button type="button" class="blsw'+(on?' on':'')+'" role="switch" aria-checked="'+(on?"true":"false")+'" data-bl="'+k+'"><span></span></button>'; }
function paint(){ var p=document.getElementById("bellP"); if(!p) return; var on=isOn(), h='';
  h+='<div class="blhd"><b>'+esc(L6(TX.ttl))+'</b><button type="button" class="blx" data-bl="x" aria-label="'+esc(L6(TX.x))+'">'+SV(P.close,22)+'</button></div>';
  h+='<div class="blset"><div class="blrow"><span class="blk">'+SV(on?P.on:P.off,20)+esc(L6(TX.on))+'</span>'+sw("on",on)+'</div>'+(MSG?'<div class="blmsg">'+esc(whyTx(MSG))+'</div>':'')
    +'<div class="blrow'+(on?'':' dim')+'"><span class="blk">'+SV(CFG.snd?P.sndOn:P.sndOff,20)+esc(L6(TX.snd))+'</span>'+sw("snd",!!CFG.snd)+'</div>'
    +'<div class="blrow'+(on?'':' dim')+'"><span class="blk">'+SV(CFG.vib?P.vibOn:P.vibOff,20)+esc(L6(TX.vib))+'</span>'+sw("vib",!!CFG.vib)+'</div></div>';
  h+='<div class="bllist">'+(LIST.length?LIST.map(function(x){ var ic=x.k==="chat"?P.chat:x.k==="trip"?P.warn:P.info;
      return '<div class="blit'+(SEENNOW[x.id]?' new':'')+'" data-bid="'+esc(x.id)+'"><span class="blic bl_'+esc(x.k)+'">'+SV(ic,22)+'</span><div class="blb"><b>'+esc(L6(x.ti))+'</b><div>'+esc(L6(x.bd))+'</div><small>'+esc(whenTx(x.at))+'</small></div>'
        +'<button type="button" class="bldel" data-bdel="'+esc(x.id)+'" aria-label="'+esc(L6(TX.del))+'" title="'+esc(L6(TX.del))+'">'+SV(P.close,18)+'</button></div>'; }).join(""):'<div class="blemp">'+esc(L6(TX.empty))+'</div>')+'</div>';
  p.innerHTML=h; place(); }
document.addEventListener("click",function(e){ var p=document.getElementById("bellP"); if(!p||!e.target.closest||!p.contains(e.target)) return;
  var d=e.target.closest("[data-bdel]"); if(d){ e.preventDefault(); e.stopPropagation(); var id=d.dataset.bdel; LIST=LIST.filter(function(x){ return x.id!==id; }); save(); paint(); btnPaint(); return; }
  var s=e.target.closest("[data-bl]"); if(s){ e.preventDefault(); e.stopPropagation(); var k=s.dataset.bl;
    if(k==="x"){ close(); return; }
    if(k==="on"){ if(isOn()) turnOff(); else turnOn(); return; }
    if(k==="snd"||k==="vib"){ CFG[k]=CFG[k]?0:1; cfgSave(); paint(); if(CFG[k]&&isOn()){ if(k==="snd") ding(); else buzz(); } return; } }
  var it=e.target.closest("[data-bid]"); if(it){ e.preventDefault(); goId(it.dataset.bid); } },true);
window.addEventListener("resize",place);

// ── 켜기·끄기 — 브라우저 허락 + 대화방 웹 푸시(chat.js) 구독과 같은 상태 ──
function reqPerm(){ return new Promise(function(res){ try{ var r=Notification.requestPermission(function(x){ res(x); }); if(r&&r.then) r.then(res,function(){ res("default"); }); }catch(e){ res("default"); } }); }
function swRegister(){ if(!("serviceWorker" in navigator)) return Promise.resolve(null); return navigator.serviceWorker.register("/sw.js?l="+encodeURIComponent(window.LANG||"en"),{scope:"/"}).then(function(){ return navigator.serviceWorker.ready; }).catch(function(){ return null; }); }
function turnOn(){ MSG="";
  if(!notifOk()){ MSG=isIOS()&&!isStandalone()?"ios":"unsup"; paintAll(); return Promise.resolve({ok:false,why:MSG}); }
  if(perm()==="denied"){ MSG="blocked"; paintAll(); return Promise.resolve({ok:false,why:"blocked"}); }
  return reqPerm().then(function(p){ if(p!=="granted"){ MSG=p==="denied"?"blocked":""; paintAll(); return {ok:false,why:p==="denied"?"blocked":"dismiss"}; }
    CFG.on=1; cfgSave(); paintAll();
    var sub=(window.CHAT&&CHAT.pushSub)?CHAT.pushSub():swRegister();
    return Promise.resolve(sub).catch(function(){ return swRegister(); }).then(function(){ paintAll(); return {ok:true}; }); }); }
function turnOff(){ CFG.on=0; cfgSave(); MSG=""; try{ if(window.CHAT&&CHAT.pushUnsub) CHAT.pushUnsub(); }catch(e){} paintAll(); }
function paintAll(){ btnPaint(); paint(); try{ if(window.CHAT&&CHAT.repaint) CHAT.repaint(); }catch(e){}
  [].forEach.call(document.querySelectorAll("[data-bellbox]"),function(b){ if(isOn()) b.innerHTML='<div class="blprt">'+esc(L6(TX.pok))+'</div>'; }); }

// ── 알림 띄우기 ──
var AC=null;
function acUnlock(){ if(!(isOn()&&CFG.snd)) return; try{ if(!AC){ var C=window.AudioContext||window.webkitAudioContext; if(C) AC=new C(); } if(AC&&AC.state==="suspended") AC.resume(); }catch(e){} }
document.addEventListener("pointerdown",acUnlock,{capture:true,passive:true});
function ding(){ window.__bellDing=(window.__bellDing||0)+1; try{ acUnlock(); if(!AC) return; var t=AC.currentTime;
  [[880,0],[1320,0.15]].forEach(function(q){ var o=AC.createOscillator(), g=AC.createGain(); o.type="sine"; o.frequency.value=q[0]; g.gain.setValueAtTime(0.0001,t+q[1]); g.gain.exponentialRampToValueAtTime(0.22,t+q[1]+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+q[1]+0.2); o.connect(g); g.connect(AC.destination); o.start(t+q[1]); o.stop(t+q[1]+0.22); }); }catch(e){} }
function buzz(){ window.__bellBuzz=(window.__bellBuzz||0)+1; try{ if(navigator.vibrate) navigator.vibrate([120,60,120]); }catch(e){} }
function swReg(){ if(!("serviceWorker" in navigator)) return Promise.resolve(null); return navigator.serviceWorker.getRegistration("/").then(function(r){ return r||swRegister(); }).catch(function(){ return null; }); }
function sysNote(e){ if(!isOn()) return Promise.resolve(false);
  var o={body:L6(e.bd),icon:"/icon-192.png",badge:"/icon-192.png",tag:"mp-"+e.k+(e.tk?"-"+e.tk:""),renotify:true,data:{url:"/?bell="+e.id,id:e.id}};
  if(!CFG.snd) o.silent=true; else if(CFG.vib) o.vibrate=[200,100,200];   // 소리 끔(silent)이면 진동 패턴은 넣을 수 없다(브라우저 규칙)
  window.__bellSys=(window.__bellSys||[]).concat([{id:e.id,k:e.k,o:o}]);
  return swReg().then(function(reg){ if(reg&&reg.showNotification) return reg.showNotification(L6(e.ti),o).then(function(){ return true; }); try{ new Notification(L6(e.ti),o); return true; }catch(x){ return false; } }).catch(function(){ return false; }); }
function banner(e){ var o=document.getElementById("bellBan"); if(o) o.remove(); var b=document.createElement("div"); b.id="bellBan"; b.setAttribute("role","status");
  var ic=e.k==="chat"?P.chat:e.k==="trip"?P.warn:P.info;
  var draw=function(){ b.innerHTML='<span class="blic bl_'+esc(e.k)+'">'+SV(ic,22)+'</span><div class="blb"><b>'+esc(L6(e.ti))+'</b><div>'+esc(L6(e.bd))+'</div></div>'; };
  draw(); b._rb=draw; b.onclick=function(){ b.remove(); goId(e.id); }; document.body.appendChild(b);
  clearTimeout(window._bellBanT); window._bellBanT=setTimeout(function(){ try{ b.remove(); }catch(x){} },6000); }
function notify(e){ if(document.hidden){ sysNote(e); return; } banner(e); if(isOn()){ if(CFG.snd) ding(); if(CFG.vib) buzz(); } }
function add(o){ o=o||{}; var e={id:nid(),k:o.k||"info",at:Date.now(),ti:o.ti||"",bd:o.bd||"",tk:o.tk||null,go:o.go||null,rd:0};
  LIST.unshift(e); save(); btnPaint(); if(document.getElementById("bellP")){ SEENNOW[e.id]=1; e.rd=1; save(); paint(); btnPaint(); } notify(e); return e; }
// 대화방 새 글 (chat.js) — {tk, n, lb:{언어:방 이름}} · 앱이 닫혀 있을 때 sw.js 가 받아 둔 같은 소식(방 모름)이 있으면 그 줄에 방을 붙인다(두 줄 안 되게)
function chat(o){ var lb=o.lb||{}, bd={}; LGS.forEach(function(l){ var r=lb[l]||lb.en||lb.ko||""; bd[l]=r?F6(TX.chatB,l,{r:r,n:o.n||1}):(TX.chatB0[l]||TX.chatB0.en); });
  var s=LIST.filter(function(x){ return x.k==="chat"&&x.sw&&!x.tk&&Date.now()-x.at<6*36e5; })[0];
  if(s){ s.tk=o.tk; s.bd=bd; s.ti=TX.chatT; s.go={k:"chat",tk:o.tk}; save(); btnPaint(); paint(); return s; }
  return add({k:"chat",ti:TX.chatT,bd:bd,tk:o.tk,go:{k:"chat",tk:o.tk}}); }
// sw.js 가 앱이 보이는 중에 받은 푸시를 넘겨줌 — 바로 전에 같은 방 소식을 이미 띄웠으면 안 겹치게
function addSw(e){ if(!e||!e.id||LIST.some(function(x){ return x.id===e.id; })) return; var dup=LIST.some(function(x){ return x.k===e.k&&Date.now()-x.at<120000; });
  if(!dup){ var n={id:e.id,k:e.k||"chat",at:e.at||Date.now(),ti:e.ti,bd:e.bd,tk:null,go:{k:e.k||"chat"},rd:0,sw:1}; LIST.unshift(n); save(); btnPaint(); paint(); notify(n); }
  try{ if(window.CHAT&&CHAT.dot) CHAT.dot(); }catch(x){} }
function goId(id){ var e=LIST.filter(function(x){ return x.id===id; })[0]; close();
  if(e){ e.rd=1; save(); btnPaint(); }
  var k=(e&&e.k)||"chat";
  if(k==="trip"){ try{ if(window.TRIP&&TRIP.alert) TRIP.alert(e&&e.go); }catch(x){} return; }   // go.q = 「더 계시나요?」·숙소 물음이면 그 물음으로 (trip.js, 11-06)
  if(k==="chat"){ try{ if(window.CHAT){ if(e&&e.tk) CHAT.room(e.tk); else CHAT.panel(); } }catch(x){} return; } }
// 앱이 닫혀 있을 때 sw.js 가 쌓아 둔 알림 → 목록
function qPull(){ if(!window.caches) return Promise.resolve(0);
  return caches.open("mpbell").then(function(c){ return c.match("/__mpbell/q").then(function(r){ return r?r.json():[]; }).catch(function(){ return []; }).then(function(a){ var n=0;
    (Array.isArray(a)?a:[]).forEach(function(e){ if(e&&e.id&&!LIST.some(function(x){ return x.id===e.id; })){ LIST.push({id:e.id,k:e.k||"chat",at:+e.at||Date.now(),ti:e.ti,bd:e.bd,tk:null,go:{k:e.k||"chat"},rd:0,sw:1}); n++; } });
    if(n){ save(); btnPaint(); paint(); } return (Array.isArray(a)&&a.length?c.delete("/__mpbell/q"):Promise.resolve()).then(function(){ return n; }); }); }).catch(function(){ return 0; }); }
if(navigator.serviceWorker&&navigator.serviceWorker.addEventListener) navigator.serviceWorker.addEventListener("message",function(ev){ var d=ev.data||{};
  if(d.mp==="bellpush"&&d.e) addSw(d.e); else if(d.mp==="bell"&&d.id) qPull().then(function(){ goId(d.id); }); });
document.addEventListener("visibilitychange",function(){ if(!document.hidden) qPull(); });

// ── 예약 끝 화면 권유 (near.js 가이드 예약 · shop.js 체험 상품) — 이미 켜져 있으면 안 띄움 ──
function promptHtml(){ if(isOn()) return ""; var ios=isIOS()&&!isStandalone();
  return '<div class="blpr" data-bellbox="1" data-html2canvas-ignore><div class="blprt">'+SV(P.on,20,"display:inline-block;vertical-align:-4px;margin-right:4px")+esc(L6(TX.prompt))+'</div>'
    +(ios?'<div class="blpri">'+esc(L6(TX.ios))+'</div>':'')+'<button type="button" class="blprb" data-bellon="1">'+esc(L6(TX.pbtn))+'</button><div class="blprm"></div></div>'; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-bellon]"); if(!b) return; e.preventDefault(); e.stopPropagation(); b.disabled=true;
  turnOn().then(function(r){ var box=b.closest("[data-bellbox]"); if(r&&r.ok){ if(box) box.innerHTML='<div class="blprt">'+esc(L6(TX.pok))+'</div>'; return; } b.disabled=false; var m=box&&box.querySelector(".blprm"); if(m) m.textContent=whyTx(r&&r.why); }); },true);

// ── 모양 ──
var css=document.createElement("style");
css.textContent="#bell{position:relative;color:var(--ink)}#bell.bloff{color:var(--sub)}#bell .bldot{position:absolute;top:-3px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#e03131;color:#fff;font:800 11px/17px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px var(--card,#fff);box-sizing:border-box}"
 +"#bellBk{position:fixed;inset:0;z-index:2147483003;background:rgba(0,0,0,.12)}"
 +"#bellP{position:fixed;right:8px;z-index:2147483004;width:min(380px,calc(100vw - 16px));overflow:auto;background:var(--card,#fff);color:var(--ink,#111827);border:1px solid var(--line,#e6e9ef);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.22);font-family:system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}"
 +".blhd{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 6px 16px}.blhd b{font-size:17px}.blx{border:0;background:none;color:var(--sub,#5b6474);cursor:pointer;padding:4px;line-height:0}"
 +".blset{margin:0 12px 8px;border:1px solid var(--line,#e6e9ef);border-radius:12px;background:var(--bg,#f4f6fa);padding:2px 12px}.blrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;font-size:15px;font-weight:800}.blrow+.blrow{border-top:1px solid var(--line,#e6e9ef)}.blrow.dim .blk{opacity:.55}"
 +".blk{display:flex;align-items:center;gap:8px}.blk svg{flex:0 0 auto}.blmsg{font-size:13px;font-weight:800;color:#c92a2a;line-height:1.45;padding:0 0 8px}"
 +".blsw{position:relative;flex:0 0 auto;width:46px;height:28px;border:0;border-radius:14px;background:#c5ccd6;cursor:pointer;padding:0;transition:background .15s}.blsw span{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .15s}.blsw.on{background:#0c8599}.blsw.on span{left:21px}"
 +".bllist{padding:0 8px 10px}.blemp{text-align:center;color:var(--sub,#5b6474);font-size:14px;padding:18px 0}"
 +".blit{display:flex;gap:10px;align-items:flex-start;border-radius:12px;padding:10px 6px 10px 8px;cursor:pointer}.blit+.blit{border-top:1px solid var(--line,#e6e9ef)}.blit.new{background:rgba(12,133,153,.08)}"
 +".blic{flex:0 0 auto;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e3fafc;color:#0b7285}.blic.bl_trip{background:#fff4e6;color:#e8590c}.blic.bl_info{background:#edf2ff;color:#3b5bdb}"
 +".blb{flex:1;min-width:0}.blb b{display:block;font-size:14.5px;line-height:1.35}.blb div{font-size:13px;color:var(--sub,#5b6474);line-height:1.45;margin-top:1px;word-break:break-word}.blb small{display:block;font-size:11.5px;color:#8a929c;margin-top:3px}"
 +".bldel{flex:0 0 auto;border:0;background:none;color:#8a929c;cursor:pointer;padding:4px;line-height:0;border-radius:50%}.bldel:hover{background:var(--bg,#f1f3f5)}"
 +"#bellBan{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));transform:translateX(-50%);z-index:2147483005;width:min(420px,calc(100vw - 20px));box-sizing:border-box;display:flex;gap:10px;align-items:center;background:var(--card,#fff);color:var(--ink,#111827);border:1px solid var(--line,#e6e9ef);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:10px 12px;cursor:pointer;animation:blIn .25s ease-out;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}"
 +"@keyframes blIn{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}@media (prefers-reduced-motion:reduce){#bellBan{animation:none}}"
 +".blpr{border:1.5px solid #0c8599;background:#e3fafc;color:#0b7285;border-radius:12px;padding:11px 12px;margin:10px 0;text-align:left}:root[data-theme=dark] .blpr{background:#0a2a30}.blprt{font-size:14.5px;font-weight:900;line-height:1.45}.blpri{font-size:13px;font-weight:700;line-height:1.5;margin-top:6px;color:var(--ink,#111827)}"
 +".blprb{display:block;width:100%;margin-top:9px;border:0;border-radius:10px;background:#0c8599;color:#fff;font-weight:900;font-size:15px;padding:10px;cursor:pointer;font-family:inherit}.blprb:disabled{opacity:.55}.blprm{font-size:12.5px;color:#c92a2a;font-weight:800;margin-top:6px}";
document.head.appendChild(css);

// ── 시작 ──
cfgSave();   // sw.js 가 읽는 사본을 지금 상태로
(function tryMount(n){ if(!mount()&&n<40) setTimeout(function(){ tryMount(n+1); },150); })(0);
var sl0=window.setLang; if(typeof sl0==="function"&&!sl0._bl){ var sl1=function(){ var r=sl0.apply(this,arguments); try{ btnPaint(); paint(); }catch(e){} return r; }; for(var k0 in sl0) sl1[k0]=sl0[k0]; sl1._bl=1; window.setLang=sl1; }
qPull();
// 알림 판 밖으로 나온 주소 ?bell=<알림 id> (폰 알림을 눌러 앱을 새로 열 때)
(function(){ var m=/[?&]bell=([A-Za-z0-9]{4,40})/.exec(location.search); if(!m) return;
  try{ var k=location.search.slice(1).split("&").filter(function(x){ return !/^bell=/.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(k?"?"+k:"")+location.hash); }catch(e){}
  setTimeout(function(){ qPull().then(function(){ goId(m[1]); }); },1200); })();
// 이미 켜 둔 폰은 sw.js 새 판을 받아 두게
try{ if(isOn()&&navigator.serviceWorker) navigator.serviceWorker.getRegistration("/").then(function(r){ if(r) r.update().catch(function(){}); }).catch(function(){}); }catch(e){}
window.BELL={add:add,chat:chat,open:open,close:close,isOn:isOn,turnOn:turnOn,turnOff:turnOff,promptHtml:promptHtml,list:function(){ return LIST; },cfg:function(){ return CFG; },qPull:qPull,repaint:paintAll};
})();
