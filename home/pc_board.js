/* MosaicTrip.com 홈페이지 — 「고객 게시판」 (사장님 11-09)
 *  · 주소 #/board(목록) · #/board/p2(2쪽) · #/board/write(글쓰기) · #/board/<글 번호>(읽기) — 머리줄 「고객 게시판」 단추(home/pc.js)
 *  · 그리기·허브·글쓴이 확인은 앱과 하나(board.js MTB.render — 앱 아래 「고객 게시판」 칸과 같은 글) · 이 파일은 홈페이지 틀(맨 윗줄·오른쪽 이용 안내)만
 *  · PC 1400: 가운데 목록·글 · 오른쪽 360 이용 안내(따라옴) · 좁은 화면은 한 줄로 쌓고 이용 안내는 아래
 *  · 새 글은 6개 언어 — 글은 board.js MTB.TX 를 같이 쓴다
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document;
function M(){ return window.MTB||null; }
function L(k){ var m=M(); return m?m.L6(m.TX[k]):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function route(a){ var x=String((a&&a[0])||""); if(!x) return {v:"list",page:1}; if(x==="write") return {v:"write"};
  var p=/^p(\d{1,4})$/.exec(x); if(p) return {v:"list",page:Math.max(1,+p[1])}; return {v:"read",id:x.replace(/[^a-z0-9]/g,"").slice(0,40)}; }
function path(r){ return r.v==="write"?"board/write":r.v==="read"?"board/"+encodeURIComponent(r.id):(r.page>1?"board/p"+r.page:"board"); }
var ROOT=null;
function head(){ if(!ROOT) return; var q=function(s){ return ROOT.querySelector(s); };
  q(".pn-hd h1").textContent=L("t"); q(".pn-hd p").textContent=L("sub");
  q(".bd-side h2").textContent=L("infoT"); q(".bd-side ul").innerHTML=["i1","i2","i3","i4"].map(function(k){ return "<li>"+E(L(k))+"</li>"; }).join(""); }
PCREG("board",function(box,args){ ROOT=box;
  box.innerHTML='<div class="bd3"><header class="pn-hd"><h1></h1><p></p></header><div class="bd-g"><main class="bd-main"></main><aside class="bd-side"><h2></h2><ul></ul></aside></div></div>';
  head(); btnOn();
  var m=M(); if(!m){ box.querySelector(".bd-main").textContent=""; return; }
  m.render(box.querySelector(".bd-main"),route(args),{mode:"page",nav:function(r){ if(window.PCGO) PCGO(path(r)); },onTop:function(){ try{ if(box.getBoundingClientRect().top<0) window.scrollTo(0,0); }catch(e){} }}); });
function here(){ return /^#\/?board(\/|$)/.test(location.hash||""); }
function btnOn(){ var b=D.getElementById("phBd"); if(b) b.classList.toggle("on",here()); }
window.addEventListener("hashchange",btnOn);
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(here()) head(); }catch(e){} return r; };   // 언어 바꾸면 틀 글도 (목록·글은 board.js 가 다시 그림)
btnOn();
})();
