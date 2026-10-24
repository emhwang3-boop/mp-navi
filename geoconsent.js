/* 머니퍼즐 투어 — 위치정보 수집·이용 동의 (사장님 2026-10-24, 「나」 방식)
 *  · 위치를 처음 쓰려는 순간 우리 동의 화면 → 동의하면 그다음 OS(폰) 권한 팝업이 뜬다
 *  · navigator.geolocation.getCurrentPosition·watchPosition 을 감싼다 — 앱의 모든 위치 요청(검색·추천·내 위치·길안내)이 이 관문을 지난다
 *  · 한 번 동의하면 localStorage(mpv_geo_ok) 에 저장, 다시 안 뜬다 · 거부하면 위치 없이 진행(검색·지도는 그대로)
 *  · index.html 에 <script src="geoconsent.js"> 한 줄. 전역은 window.LANG 만 읽는다(없으면 ko/en)
 */
(function(){
"use strict";
var G = navigator.geolocation;
if (!G) return;
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function okAlready(){ return ls("mpv_geo_ok")==="1"; }
var L = {
  ko:{t:"위치정보 이용 동의",
    b:["내 주변의 관광지·맛집·숙소·편의시설을 추천하고 길을 안내하기 위해 현재 위치를 이용합니다.",
       "위치정보는 추천 결과를 보여 줄 때만 실시간으로 쓰고, 따로 저장하지 않습니다.",
       "동의하지 않아도 검색과 지도 보기는 그대로 쓸 수 있습니다.",
       "언제든지 휴대폰 설정에서 위치 권한을 끌 수 있습니다.",
       "위치정보사업자: 구글(Geolocation Services) 등"],
    c:"위치정보 수집·이용에 동의합니다", ok:"동의", no:"닫기"},
  en:{t:"Location use consent",
    b:["We use your current location to recommend nearby attractions, restaurants, stays and amenities, and to guide you.",
       "Location is used in real time only to show results, and is not stored.",
       "You can still use search and the map without consenting.",
       "You can turn off location permission anytime in your phone settings.",
       "Location provider: Google (Geolocation Services), etc."],
    c:"I agree to the collection and use of my location", ok:"Agree", no:"Close"},
  ja:{t:"位置情報の利用同意",
    b:["周辺の観光地・グルメ・宿泊・施設をおすすめし、道案内するために現在地を利用します。",
       "位置情報は結果を表示するときだけリアルタイムで使い、保存はしません。",
       "同意しなくても検索と地図の閲覧はそのまま使えます。",
       "スマートフォンの設定でいつでも位置情報の許可をオフにできます。",
       "位置情報事業者：Google（Geolocation Services）など"],
    c:"位置情報の収集・利用に同意します", ok:"同意", no:"閉じる"},
  zhs:{t:"位置信息使用同意",
    b:["为推荐您周边的景点·美食·住宿·便利设施并提供路线指引，我们会使用您的当前位置。",
       "位置信息仅在显示结果时实时使用，不另行保存。",
       "即使不同意，搜索和地图浏览仍可正常使用。",
       "您可随时在手机设置中关闭位置权限。",
       "位置信息经营者：谷歌（Geolocation Services）等"],
    c:"我同意收集和使用我的位置信息", ok:"同意", no:"关闭"},
  zht:{t:"位置資訊使用同意",
    b:["為推薦您周邊的景點·美食·住宿·便利設施並提供路線指引，我們會使用您的目前位置。",
       "位置資訊僅在顯示結果時即時使用，不另行儲存。",
       "即使不同意，搜尋與地圖瀏覽仍可正常使用。",
       "您可隨時在手機設定中關閉位置權限。",
       "位置資訊經營者：Google（Geolocation Services）等"],
    c:"我同意蒐集及使用我的位置資訊", ok:"同意", no:"關閉"},
  es:{t:"Consentimiento de ubicación",
    b:["Usamos su ubicación actual para recomendar atracciones, restaurantes, alojamientos y servicios cercanos, y para guiarle.",
       "La ubicación se usa en tiempo real solo para mostrar resultados y no se almacena.",
       "Puede usar la búsqueda y el mapa sin dar su consentimiento.",
       "Puede desactivar el permiso de ubicación en los ajustes del teléfono cuando quiera.",
       "Proveedor de ubicación: Google (Geolocation Services), etc."],
    c:"Acepto la recogida y el uso de mi ubicación", ok:"Aceptar", no:"Cerrar"}
};
function t(){ var l=(window.LANG&&L[window.LANG])?window.LANG:((window.LANG==="ko")?"ko":"en"); return L[l]||L.en; }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function css(){ if(document.getElementById("gcCss")) return; var s=document.createElement("style"); s.id="gcCss";
  s.textContent="#gcBox{position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:18px}"
   +"#gcBox .in{background:var(--card,#fff);color:var(--ink,#111);width:100%;max-width:460px;max-height:88vh;overflow:auto;border-radius:18px;padding:20px 18px 18px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.3)}"
   +"#gcBox h3{margin:0 0 10px;font-size:19px;font-weight:800;display:flex;align-items:center;gap:7px}"
   +"#gcBox ul{margin:0 0 12px;padding-left:18px}#gcBox li{font-size:14px;line-height:1.65;color:var(--sub,#444);margin:3px 0}"
   +"#gcBox label{display:flex;align-items:flex-start;gap:8px;font-size:14.5px;font-weight:700;background:var(--bg,#f4f6fb);border-radius:12px;padding:11px 12px;margin:4px 0 12px;cursor:pointer}"
   +"#gcBox label input{margin-top:3px;width:18px;height:18px}"
   +"#gcBox .row{display:flex;gap:8px;justify-content:flex-end}"
   +"#gcBox button{border:0;border-radius:999px;padding:11px 20px;font-weight:800;font-size:15px;cursor:pointer}"
   +"#gcBox .ok{background:var(--blue,#2f6bed);color:#fff}#gcBox .ok:disabled{opacity:.45;cursor:default}#gcBox .no{background:var(--bg,#eef1f6);color:var(--sub,#555)}";
  document.head.appendChild(s); }
function ask(cb){   // cb(true)=동의, cb(false)=거부
  css(); var X=t(); var old=document.getElementById("gcBox"); if(old) old.remove();
  var b=document.createElement("div"); b.id="gcBox";
  b.innerHTML='<div class="in"><h3>📍 '+esc(X.t)+'</h3><ul>'+X.b.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")
   +'</ul><label><input type="checkbox" id="gcChk"> <span>'+esc(X.c)+'</span></label>'
   +'<div class="row"><button type="button" class="no" id="gcNo">'+esc(X.no)+'</button><button type="button" class="ok" id="gcOk" disabled>'+esc(X.ok)+'</button></div></div>';
  document.body.appendChild(b);
  var chk=document.getElementById("gcChk"), okB=document.getElementById("gcOk");
  chk.addEventListener("change",function(){ okB.disabled=!chk.checked; });
  var close=function(agree){ b.remove(); cb(agree); };
  document.getElementById("gcNo").onclick=function(){ close(false); };
  okB.onclick=function(){ if(!chk.checked) return; ls("mpv_geo_ok","1"); close(true); };
  b.addEventListener("click",function(e){ if(e.target===b) close(false); });
}
function wrap(name){
  var orig = G[name] && G[name].bind(G);
  if (!orig) return;
  navigator.geolocation[name] = function(success, error, options){
    if (okAlready()) return orig(success, error, options);
    ask(function(agree){
      if (agree) { try{ orig(success, error, options); }catch(e){ if(error) try{ error({code:2,message:"geo"}); }catch(x){} } }
      else { if (error) try{ error({code:1,message:"denied"}); }catch(x){} }
    });
    return undefined;
  };
}
wrap("getCurrentPosition");
wrap("watchPosition");
})();
