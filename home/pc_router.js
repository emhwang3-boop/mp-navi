/* 홈페이지 화면 길잡이 (11-08) — 주소 #/guide · #/package · #/package/<id> · #/ai … 로 화면을 바꾼다.
 *  · 화면 모듈(home/pc_*.js)은 PCREG("이름", function(box, args){ box 에 그린다 }) 로 등록한다.
 *  · 등록된 화면이면 첫 화면(#phMain)을 감추고 #pcPage 에 그 화면을 그린다. 없는 주소면 첫 화면.
 *  · 화면 이동: PCGO("package/k4") → location.hash 만 바꾼다(뒤로 가기 됨). 머리 두 줄·맨 아래는 그대로. */
(function(){ if(!window.PC_HOME) return;
  var R=window.PCR=window.PCR||{};
  var st=document.createElement("style"); st.textContent="body.pcpg #phMain{display:none!important}"; document.head.appendChild(st);
  function box(){ var b=document.getElementById("pcPage"); if(b) return b; var m=document.getElementById("phMain"); if(!m) return null;
    b=document.createElement("div"); b.id="pcPage"; m.parentNode.insertBefore(b,m); return b; }
  function cur(){ var p=(location.hash||"").replace(/^#\/?/,"").split("/"); return {n:p[0]||"",a:p.slice(1).map(function(x){ try{ return decodeURIComponent(x); }catch(e){ return x; } })}; }
  var last="";
  function go(force){ var b=box(); if(!b) return false; var c=cur(), f=c.n&&R[c.n], key=location.hash;
    if(!f){ document.body.classList.remove("pcpg"); b.innerHTML=""; last=""; return true; }
    if(!force&&key===last) return true; last=key;
    document.body.classList.add("pcpg"); b.innerHTML=""; try{ f(b,c.a); }catch(e){ try{ console.error("PCR "+c.n,e); }catch(x){} }
    try{ window.scrollTo(0,0); }catch(e){} return true; }
  window.PCREG=function(n,f){ R[n]=f; if(cur().n===n) go(true); };
  window.PCGO=function(path){ path=String(path||""); if(!path){ history.pushState(null,"",location.pathname+location.search); go(true); return; } location.hash="#/"+path; };
  window.PCRENDER=function(){ go(true); };   // 언어 바꿈 등으로 지금 화면을 다시 그릴 때
  window.addEventListener("hashchange",function(){ go(false); });
  (function start(){ if(!go(true)) setTimeout(start,100); })();
})();
