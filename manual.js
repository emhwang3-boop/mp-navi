/* 머니퍼즐 투어 — 사용자 매뉴얼 도서관 (사장님 2026-10-25)
 *  · 구 화면(종로구·중구 경계, 청계광장 동쪽)의 도서관 그림(gu_build EXTRA library@main → act "__library")을 누르면 매뉴얼 카드
 *    카드 = 지금 화면 언어의 매뉴얼 PDF(큰 단추) + 6개 언어 PDF 목록 · 파일 manual/manual_<lang>.pdf
 *  · 안내판 맨 위 주의 문구 바로 아래 한 줄 「사용자 매뉴얼은 도서관에 있습니다 (지도 광화문 근처)」 → 누르면 도서관으로 간다
 */
(function(){
"use strict";
var ORD=["ko","en","es","ja","zhs","zht"], NM={ko:"한국어",en:"English",ja:"日本語",zhs:"简体中文",zht:"繁體中文",es:"Español"};
var TX={
  ttl:{ko:"도서관 — 사용자 매뉴얼",en:"Library — User manual",ja:"図書館 — ユーザーマニュアル",zhs:"图书馆 — 用户手册",zht:"圖書館 — 使用者手冊",es:"Biblioteca — Manual de usuario"},
  sub:{ko:"앱의 모든 기능을 화면 사진과 함께 차례대로 설명합니다 (PDF).",en:"Every feature of the app, step by step with screenshots (PDF).",ja:"アプリのすべての機能を画面写真とともに順番に説明します（PDF）。",zhs:"配合截图，按顺序介绍本应用的全部功能（PDF）。",zht:"配合截圖，按順序介紹本應用的全部功能（PDF）。",es:"Todas las funciones de la aplicación, paso a paso y con capturas de pantalla (PDF)."},
  open:{ko:"매뉴얼 열기",en:"Open the manual",ja:"マニュアルを開く",zhs:"打开手册",zht:"打開手冊",es:"Abrir el manual"},
  other:{ko:"다른 언어",en:"Other languages",ja:"ほかの言語",zhs:"其他语言",zht:"其他語言",es:"Otros idiomas"},
  close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
  line:{ko:"사용자 매뉴얼은 도서관에 있습니다 (지도 광화문 근처)",en:"The user manual is in the Library (on the map near Gwanghwamun)",ja:"ユーザーマニュアルは図書館にあります（地図の光化門の近く）",zhs:"用户手册在图书馆里（地图上光化门附近）",zht:"使用者手冊在圖書館裡（地圖上光化門附近）",es:"El manual de usuario está en la Biblioteca (en el mapa, cerca de Gwanghwamun)"}
};
function L(o){ return o[window.LANG]||o.en; }
function lg(){ return ORD.indexOf(window.LANG)>=0?window.LANG:"en"; }
function url(l){ return "manual/manual_"+l+".pdf?v="+(window.NAVI_V||"")+"m1028"; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var st=document.createElement("style");
st.textContent="#libBox{position:fixed;inset:0;z-index:1045;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}"
 +"#libBox>div{background:var(--card,#fff);color:var(--ink,#111);width:100%;max-width:420px;max-height:92vh;overflow:auto;border-radius:16px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3)}"
 +"#libBox .lh{display:flex;align-items:center;gap:10px}#libBox .lh img{width:64px;height:auto;flex:0 0 auto}#libBox .lh b{font-size:18px;line-height:1.25}"
 +"#libBox .ls{font-size:14px;line-height:1.5;margin:8px 0 12px;opacity:.85}"
 +"#libBox a.lb{display:block;text-align:center;background:#2f9e44;color:#fff;font-weight:800;font-size:16px;border-radius:12px;padding:12px;text-decoration:none}"
 +"#libBox .lo{margin-top:14px;font-size:13px;font-weight:700;opacity:.7}#libBox .ll{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}"
 +"#libBox .ll a{display:block;border:1.5px solid var(--line,#dde);border-radius:10px;padding:9px 10px;color:inherit;text-decoration:none;font-weight:700;font-size:14px}#libBox .ll a.on{border-color:#2f9e44;color:#2f9e44}"
 +"#libBox .lx{display:block;margin:14px auto 0;border:0;background:none;color:inherit;font-weight:700;font-size:14px;cursor:pointer;opacity:.7}"
 +"#infoboard{aspect-ratio:700/724;background-image:url(board4.png)}#infoboard #pl0{top:10.2%;height:10.6%}#infoboard #plman{top:26.6%;height:14.2%;font-size:clamp(12px,3.5vw,17px);line-height:1.15;color:#ffe08a;font-weight:800;cursor:pointer}#infoboard #plman span{-webkit-line-clamp:3!important}#infoboard #pl1{top:46.1%;height:10.6%}#infoboard #pl2{top:63.8%;height:10.6%}#infoboard #infomore{top:calc(69.1% - 23px)}#infoboard #pl0{cursor:pointer!important}#infoboard #pl0.full{top:6.9%;height:17.4%;font-size:clamp(11px,3.15vw,15px);line-height:1.2}#infoboard #pl0.full span{display:block;-webkit-line-clamp:unset;overflow:visible}";   /* 빨간 주의 문구 — 누르면 전체 펼침·다시 누르면 접힘 (사장님 10-25) */
document.head.appendChild(st);
function card(){ var o=document.getElementById("libBox"); if(o) o.remove(); o=document.createElement("div"); o.id="libBox"; o.onclick=function(e){ if(e.target===o) o.remove(); };
  o._rb=function(){ var l=lg(), h='<div><div class="lh"><img src="img/gu/library@main.webp" alt=""><b>'+esc(L(TX.ttl))+'</b></div><div class="ls">'+esc(L(TX.sub))+'</div>'
    +'<a class="lb" href="'+url(l)+'" target="_blank" rel="noopener">'+esc(L(TX.open))+' · '+NM[l]+' (PDF)</a><div class="lo">'+esc(L(TX.other))+'</div><div class="ll">';
    ORD.forEach(function(x){ h+='<a href="'+url(x)+'" target="_blank" rel="noopener"'+(x===l?' class="on"':'')+'>'+NM[x]+'</a>'; });
    o.innerHTML=h+'</div><button type="button" class="lx">'+esc(L(TX.close))+'</button></div>'; o.querySelector(".lx").onclick=function(){ o.remove(); }; };
  o._rb(); document.body.appendChild(o); try{ ntap("library","open_card"); }catch(e){} }
window.libCard=card;
var _hc=window.hitClick; window.hitClick=function(k){ if(k==="__library"){ card(); return; } return _hc.apply(this,arguments); };
/* 안내판 줄 → 서울 구 화면(종로구)으로 가서 도서관 카드 */
var LIB=[0.5212,0.48395];   // 도서관 자리 (gu_build EXTRA library@main 의 c)
window.libGo=function(){ try{ ntap("library","info_line"); }catch(e){}
  try{ if(window.VIEW!=="seoulall") viewSet("seoulall"); }catch(e){}
  var n=0, t=setInterval(function(){ n++; var G=window.GU; if(G&&G.d&&window.guEnter){ clearTimeout(t); clearInterval(t); try{ if(G.g!=="종로구") guEnter("종로구"); }catch(e){}
      var m=document.getElementById("map"); if(m) try{ m.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){}
      setTimeout(function(){ try{ var mp=document.getElementById("map"), w=mp.clientWidth, as=ASP(), sc=Math.min(ZM.s*1.8,(G.zmax||ZM.s*4)); ZM={s:sc,tx:w/2-LIB[0]*w*as*sc,ty:MH()/2-LIB[1]*w*sc}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} lodDraw(); }catch(e){} },150);   // 도서관을 가운데로
      setTimeout(card,900); return; }
    if(n>60){ clearInterval(t); card(); } },100); };
function line(){ var b=document.getElementById("infoboard"); if(!b) return; var e=document.getElementById("plman");
  if(!e){ e=document.createElement("div"); e.id="plman"; e.className="pl"; e.setAttribute("role","button"); var p0=document.getElementById("pl0"); b.insertBefore(e,p0?p0.nextSibling:b.firstChild);
    e.onclick=function(ev){ ev.stopPropagation(); window.libGo(); }; }
  e.innerHTML='<span>'+esc(L(TX.line))+'</span>'; }
var _ip=window.infoPaint; if(_ip) window.infoPaint=function(){ var r=_ip.apply(this,arguments); try{ line(); }catch(e){} return r; };
line();
(function(){ var p0=document.getElementById("pl0"); if(p0) p0.addEventListener("click",function(){ p0.classList.toggle("full"); }); })();
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ line(); var o=document.getElementById("libBox"); if(o&&o._rb) o._rb(); }catch(e){} return r; };
})();
