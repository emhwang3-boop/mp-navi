/* 머니퍼즐 투어 — 웹 푸시 전용 서비스 워커 (사장님 2026-11-05 가이드 대화방 알림 · 11-06 🔔 알림함)
 *  · 🔔 「알림 받기」(bell.js)·대화방 「알림 받기」를 켰을 때만 단다 (/sw.js?l=<언어>)
 *  · 허브는 내용 없는 알림만 보낸다 → 여기서 「가이드에게서 새 메시지」만 띄운다 (대화 내용은 알림에 안 실음)
 *  · 11-06: 소리·진동은 bell.js 가 Cache(mpbell /__mpbell/cfg)에 둔 설정 사본을 따른다(소리 끔 = silent) ·
 *    앱이 화면에 보이는 중이면 폰 알림 대신 앱에 넘겨 앱이 목록·띠·소리·진동을 · 아니면 폰 알림 + 목록 사본(/__mpbell/q → 다음에 앱을 열면 🔔 목록으로)
 *  · fetch(캐시) 처리기는 일부러 없다 — 화면·파일 받기에 끼어들지 않는다
 */
var L=(new URL(self.location.href)).searchParams.get("l")||"en";
var TX={ko:["머니퍼즐 투어","가이드에게서 새 메시지가 왔습니다"],en:["Money Puzzle Tour","New message from your guide"],ja:["マネーパズル ツアー","ガイドから新しいメッセージが届きました"],
 zhs:["Money Puzzle 旅游","您收到了向导的新消息"],zht:["Money Puzzle 旅遊","您收到了嚮導的新訊息"],es:["Money Puzzle Tour","Nuevo mensaje de tu guía"]};
var CT={ko:"가이드 대화방 새 소식",en:"New in your guide chat",ja:"ガイドチャットに新着",zhs:"向导聊天有新消息",zht:"嚮導聊天有新訊息",es:"Novedades en el chat con tu guía"};
function six(f){ var o={}; ["ko","en","ja","zhs","zht","es"].forEach(function(l){ o[l]=f(l); }); return o; }
function cfg(){ return caches.open("mpbell").then(function(c){ return c.match("/__mpbell/cfg"); }).then(function(r){ return r?r.json():{}; }).catch(function(){ return {}; }); }
function qAdd(e){ return caches.open("mpbell").then(function(c){ return c.match("/__mpbell/q").then(function(r){ return r?r.json():[]; }).catch(function(){ return []; }).then(function(a){
  a=Array.isArray(a)?a:[]; a.push(e); a=a.slice(-50); return c.put("/__mpbell/q",new Response(JSON.stringify(a),{headers:{"Content-Type":"application/json"}})); }); }).catch(function(){}); }
self.addEventListener("install",function(e){ self.skipWaiting(); });
self.addEventListener("activate",function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("push",function(e){ var t=TX[L]||TX.en, id="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  var ent={id:id,k:"chat",at:Date.now(),ti:six(function(l){ return CT[l]; }),bd:six(function(l){ return TX[l][1]; })};
  e.waitUntil(Promise.all([cfg(),self.clients.matchAll({type:"window",includeUncontrolled:true})]).then(function(r){ var c=r[0]||{}, cs=r[1]||[];
    var vis=cs.filter(function(x){ return x.visibilityState==="visible"&&x.url.indexOf(self.location.origin)===0; });
    if(vis.length){ vis.forEach(function(x){ try{ x.postMessage({mp:"bellpush",e:ent}); }catch(_){} }); return; }   // 앱이 보이는 중 — 앱이 목록·띠·소리·진동
    var o={body:t[1],icon:"/icon-192.png",badge:"/icon-192.png",tag:"mp-chat",renotify:true,data:{url:"/?bell="+id,id:id}};
    if(c.on===0||c.snd===0) o.silent=true; else if(c.vib!==0) o.vibrate=[200,100,200];   // 소리 끔(silent)이면 진동 패턴은 못 넣는다(브라우저 규칙)
    return qAdd(ent).then(function(){ return self.registration.showNotification(t[0],o); }); })); });
self.addEventListener("notificationclick",function(e){ e.notification.close(); var d=e.notification.data||{}, url=d.url||"/?gchat=1";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){ var c=cs[i]; if(c.url.indexOf(self.location.origin)===0&&"focus" in c){ try{ c.postMessage(d.id?{mp:"bell",id:d.id}:{mp:"chat"}); }catch(x){} return c.focus(); } }
    return self.clients.openWindow(url); })); });
