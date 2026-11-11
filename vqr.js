/* 바우처 QR (사장님 2026-11-11 「2나」) — 모든 예약 바우처(가이드 인솔·패키지·차량 대절)에 예약마다 진짜 QR 하나
 *  · QR 안 = 허브 /shop/q?o=<예약 번호>&t=<확인 전용 서명> (허브가 「내 예약」 자료 qv 로 준다 — 손님 예약 토큰 ?tdone= 은 넣지 않는다)
 *  · 가이드·가게·기사가 폰 기본 카메라로 찍으면 그 예약의 「예약 확인」 화면(읽기만, 한국어+영어)이 열린다 — 따로 앱 없음 · 찍어도 아무것도 안 바뀐다
 *  · 그림 = 브라우저에서(index.html shQr — 앱 공유 창·홈페이지 「앱 받기」와 같은 qrcodejs) · 흰 바탕 · 누르면 화면 가운데에 크게
 *  · 자리: near.js 「내 예약」 카드 · home/pc_bk.js #/bookings 카드 · chat.js 대화방 요약(손님 쪽) — VQR.html(x) 를 넣으면 이 파일이 그림을 채운다
 */
(function(){
"use strict";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L(o){ return o?(o[window.LANG||"en"]||o.en||o.ko||""):""; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var TX={
 t:T6("바우처 QR","Voucher QR","バウチャーQR","凭证二维码","憑證QR碼","QR del bono"),
 tap:T6("눌러서 크게 보기","Tap to enlarge","タップで拡大","点击放大","點擊放大","Toca para ampliar"),
 show:T6("가이드·가게·기사에게 보여 주세요. 폰 카메라로 찍으면 예약 확인 화면이 열려요.","Show this to your guide, the shop or your driver. Scanning it with a phone camera opens the booking check page.","ガイド・お店・ドライバーに見せてください。スマホのカメラで読み取ると予約確認画面が開きます。","请出示给向导、店家或司机。用手机相机扫描即可打开预约确认页面。","請出示給嚮導、店家或司機。用手機相機掃描即可打開預約確認頁面。","Muéstralo a tu guía, a la tienda o al conductor. Al escanearlo con la cámara del móvil se abre la página de comprobación de la reserva."),
 bright:T6("화면 밝기를 올리면 더 잘 찍혀요.","Turn up your screen brightness for easier scanning.","画面を明るくすると読み取りやすくなります。","调高屏幕亮度更容易扫描。","調高螢幕亮度更容易掃描。","Sube el brillo de la pantalla para escanearlo mejor."),
 no:T6("예약 번호","Booking no.","予約番号","预约编号","預約編號","N.º de reserva"),
 x:T6("닫기","Close","閉じる","关闭","關閉","Cerrar")
};
var OK=/^https:\/\/brief-live-hub\.emhwang3\.workers\.dev\/shop\/q\?o=[0-9A-Za-z_%-]{4,80}&t=[0-9a-f]{24}$/;
var IMG={};   // 주소 → 그린 그림(data URL) — 다시 그릴 때 깜빡이지 않게
// 카드에 넣는 칸 — x = 「내 예약」 자료(qv·oid·pname·date·time·status) · 취소된 예약·주소 없는 예약은 빈칸
function html(x){ var u=x&&x.qv; if(!u||!OK.test(u)||x.status==="cancelled"||x.status==="refunded") return "";
  return '<div class="vqr" role="button" tabindex="0" data-vqr="'+esc(u)+'" data-vqo="'+esc(x.oid||"")+'" data-vqn="'+esc(x.pname||x.pnameKo||"")+'" data-vqd="'+esc(((x.date||"")+" "+(x.time||"")).trim())+'">'
    +'<div class="vqrc" data-q="'+esc(u)+'">'+(IMG[u]?'<img src="'+IMG[u]+'" alt="QR">':'')+'</div>'
    +'<div class="vqrt"><b>'+esc(L(TX.t))+'</b><span>'+esc(L(TX.tap))+'</span><small>'+esc(L(TX.show))+'</small></div></div>'; }
// 빈 QR 칸 채우기 — 화면이 다시 그려질 때마다(MutationObserver) 한 번에
function draw(el,u,sz,cb){ if(typeof window.shQr!=="function"){ return; } shQr(el,u,sz);
  var n=0, grab=function(){ var im=el.querySelector("img"), cv=el.querySelector("canvas"); var src=im&&/^data:image/.test(im.src||"")?im.src:(cv&&cv.toDataURL?cv.toDataURL("image/png"):"");
    if(src){ IMG[u]=src; el.innerHTML='<img src="'+src+'" alt="QR">'; if(cb) cb(); return; } if(++n<40) setTimeout(grab,100); }; setTimeout(grab,30); }
function fill(){ [].forEach.call(document.querySelectorAll(".vqrc[data-q]:not([data-on])"),function(el){ var u=el.getAttribute("data-q"); if(!OK.test(u)) return; el.setAttribute("data-on","1"); if(IMG[u]){ if(!el.querySelector("img")) el.innerHTML='<img src="'+IMG[u]+'" alt="QR">'; return; } draw(el,u,360); }); }
var RQ=0; function later(){ if(RQ) return; RQ=requestAnimationFrame(function(){ RQ=0; try{ fill(); }catch(e){} }); }
try{ new MutationObserver(function(){ if(document.querySelector(".vqrc[data-q]:not([data-on])")) later(); }).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
// 크게 — 화면 가운데 · 흰 바탕 · 예약 번호·상품·날짜
function open(a){ var u=a.getAttribute("data-vqr"); if(!OK.test(u)) return; close(); var o=document.createElement("div"); o.id="vqrBox"; o.setAttribute("role","dialog"); o.setAttribute("aria-modal","true");
  o.innerHTML='<div class="vqrp"><button type="button" class="vqrx" data-vqx="1" aria-label="'+esc(L(TX.x))+'">✕</button><div class="vqrb" data-q2="1">'+(IMG[u]?'<img src="'+IMG[u]+'" alt="QR">':'')+'</div>'
    +'<div class="vqri"><b>'+esc(a.getAttribute("data-vqn")||"")+'</b><span>'+esc(a.getAttribute("data-vqd")||"")+'</span><span>'+esc(L(TX.no))+' '+esc(a.getAttribute("data-vqo")||"")+'</span></div>'
    +'<p>'+esc(L(TX.show))+'</p><p class="vqrs">'+esc(L(TX.bright))+'</p><button type="button" class="vqrc2" data-vqx="1">'+esc(L(TX.x))+'</button></div>';
  o.addEventListener("click",function(e){ if(e.target===o||(e.target.closest&&e.target.closest("[data-vqx]"))) close(); });
  document.body.appendChild(o); if(!IMG[u]) draw(o.querySelector(".vqrb"),u,360); try{ ntap("_vqr","open"); }catch(e){} }
function close(){ var o=document.getElementById("vqrBox"); if(o){ o.remove(); return true; } return false; }
document.addEventListener("click",function(e){ var a=e.target.closest&&e.target.closest("[data-vqr]"); if(!a) return; e.preventDefault(); e.stopPropagation(); open(a); },true);
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&close()) return; if(e.key!=="Enter"&&e.key!==" ") return; var a=e.target&&e.target.closest&&e.target.closest("[data-vqr]"); if(a&&e.target===a){ e.preventDefault(); open(a); } });
var _gb=window.guBack; window.guBack=function(){ if(close()) return true; return _gb?_gb.apply(this,arguments):false; };   // 폰 뒤로 = 큰 QR 닫기
var st=document.createElement("style");
st.textContent=".vqr{display:flex;align-items:center;gap:12px;margin:10px 0 0;padding:10px;border:1.5px solid #2f9e44;border-radius:14px;background:#fff;color:#1d2433;cursor:pointer;text-align:left}"
 +".vqrc{flex:0 0 auto;width:132px;height:132px;background:#fff;padding:6px;box-sizing:border-box;border-radius:8px;display:flex;align-items:center;justify-content:center}"
 +".vqrc img,.vqrc canvas,.vqrb img,.vqrb canvas{width:100%!important;height:auto!important;display:block;image-rendering:pixelated}"
 +".vqrt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;line-height:1.45}.vqrt b{font-size:15px;font-weight:900}.vqrt span{font-size:13px;font-weight:800;color:#2b8a3e}.vqrt small{font-size:12px;color:#5b6474}"
 +"#vqrBox{position:fixed;inset:0;z-index:2147483006;background:rgba(10,14,24,.72);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}"
 +"#vqrBox .vqrp{position:relative;width:min(420px,100%);max-height:100%;overflow:auto;background:#fff;color:#1d2433;border-radius:20px;padding:22px 18px 18px;box-sizing:border-box;text-align:center;font-family:inherit}"
 +"#vqrBox .vqrb{width:min(330px,78vw);margin:4px auto 10px;background:#fff;padding:10px;box-sizing:border-box}"
 +"#vqrBox .vqri{display:flex;flex-direction:column;gap:2px;font-size:14px;color:#5b6474}#vqrBox .vqri b{font-size:16px;color:#1d2433}"
 +"#vqrBox p{margin:10px 0 0;font-size:13.5px;line-height:1.55;color:#1d2433}#vqrBox .vqrs{font-size:12.5px;color:#5b6474;margin-top:4px}"
 +"#vqrBox .vqrx{position:absolute;right:10px;top:8px;border:0;background:transparent;font-size:20px;font-weight:900;color:#5b6474;cursor:pointer;padding:6px}"
 +"#vqrBox .vqrc2{margin-top:14px;border:0;border-radius:12px;background:#2f9e44;color:#fff;font:inherit;font-weight:900;font-size:15px;padding:11px 28px;cursor:pointer}";
(document.head||document.documentElement).appendChild(st);
setTimeout(fill,0);
window.VQR={html:html,fill:fill,open:open,close:close,ok:function(u){ return OK.test(u||""); }};
})();
