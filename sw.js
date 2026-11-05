/* 머니퍼즐 투어 — 웹 푸시 전용 서비스 워커 (사장님 2026-11-05 가이드 대화방 알림)
 *  · 손님이 대화방에서 「새 메시지 알림 받기」를 눌렀을 때만 chat.js 가 단다 (/sw.js?l=<언어>)
 *  · 허브는 내용 없는 알림만 보낸다 → 여기서 「가이드에게서 새 메시지」만 띄운다 (대화 내용은 알림에 안 실음)
 *  · fetch(캐시) 처리기는 일부러 없다 — 화면·파일 받기에 끼어들지 않는다
 */
var L=(new URL(self.location.href)).searchParams.get("l")||"en";
var TX={ko:["머니퍼즐 투어","가이드에게서 새 메시지가 왔습니다"],en:["Money Puzzle Tour","New message from your guide"],ja:["マネーパズル ツアー","ガイドから新しいメッセージが届きました"],
 zhs:["Money Puzzle 旅游","您收到了向导的新消息"],zht:["Money Puzzle 旅遊","您收到了嚮導的新訊息"],es:["Money Puzzle Tour","Nuevo mensaje de tu guía"]};
self.addEventListener("install",function(e){ self.skipWaiting(); });
self.addEventListener("activate",function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("push",function(e){ var t=TX[L]||TX.en;
  e.waitUntil(self.registration.showNotification(t[0],{body:t[1],icon:"/icon-192.png",badge:"/icon-192.png",tag:"mp-chat",renotify:true,data:{url:"/?gchat=1"}})); });
self.addEventListener("notificationclick",function(e){ e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){ var c=cs[i]; if(c.url.indexOf(self.location.origin)===0&&"focus" in c){ try{ c.postMessage({mp:"chat"}); }catch(x){} return c.focus(); } }
    return self.clients.openWindow("/?gchat=1"); })); });
