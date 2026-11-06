/* tpick.js — 앱 안 시각 칸(input type=time)을 24시간 「시 : 분」 고르기로 바꿈
   사장님 11-06: 폰 기본 시계는 오전·오후로 나와 칸이 좁으면 시각이 가려짐 → 「나: 24시간(00~23시)과 분만」
   원래 input 은 숨겨 두고 값·이벤트(input/change)는 그대로 → 기존 코드(onchange·.value) 손대지 않음 */
(function(){
  if(window.__tpk) return; window.__tpk=1;
  var D=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value");
  function p2(n){ return (n<10?"0":"")+n; }
  function lab(){ var l=(document.documentElement.lang||"en").toLowerCase(), k=/^ko/.test(l)?0:/^ja/.test(l)?1:/^zh/.test(l)?2:/^es/.test(l)?3:4;
    return [["시","분"],["時","分"],["时","分"],["Hora","Minuto"],["Hour","Minute"]][k]; }
  var st=document.createElement("style");
  st.textContent=".tpk{display:flex;align-items:center;gap:4px;min-width:0}.tpk>i{font-style:normal;font-weight:700;color:var(--sub,#666)}"
    +":where(.tpk) select{flex:1 1 0;min-width:0;width:auto;font:inherit;padding:6px 4px;border-radius:8px;border:1px solid var(--line,#ccc);background:var(--bg,#fff);color:var(--ink,#222)}"
    +".tpk select{-webkit-appearance:none;appearance:none;background-image:none!important;text-align:center;text-align-last:center;padding-left:2px!important;padding-right:2px!important}"
    +".tpk select:disabled{opacity:.45}";
  (document.head||document.documentElement).appendChild(st);
  function up(inp){
    if(inp.__tpk||!inp.parentNode) return; inp.__tpk=1;
    var cs=getComputedStyle(inp), step=+inp.getAttribute("step")||0, ms=step>=1800?30:5,
        blank=!D.get.call(inp)||inp.hasAttribute("data-stt")||inp.hasAttribute("data-apw"), L=lab();
    var w=document.createElement("span"), h=document.createElement("select"), m=document.createElement("select"), c=document.createElement("i");
    w.className="tpk"; c.textContent=":"; h.setAttribute("aria-label",L[0]); m.setAttribute("aria-label",L[1]);
    if(cs.flex&&cs.flex!=="0 1 auto") w.style.flex=cs.flex;
    var hs=blank?'<option value="">--</option>':""; for(var i=0;i<24;i++) hs+='<option value="'+p2(i)+'">'+p2(i)+'</option>'; h.innerHTML=hs;
    function fillM(cur){ var a=[]; for(var j=0;j<60;j+=ms) a.push(j); if(cur!=null&&a.indexOf(cur)<0){ a.push(cur); a.sort(function(x,y){ return x-y; }); }
      m.innerHTML=a.map(function(x){ return '<option value="'+p2(x)+'">'+p2(x)+'</option>'; }).join(""); }
    function sync(){ var r=/^(\d{1,2}):(\d{2})/.exec(D.get.call(inp)||"");
      if(r){ var hh=Math.min(23,+r[1]), mm=+r[2]; fillM(mm); h.value=p2(hh); m.value=p2(mm); m.disabled=false; }
      else { fillM(null); h.value=blank?"":"00"; m.value="00"; m.disabled=blank; } }
    function put(){ var nv=h.value?h.value+":"+(m.value||"00"):""; m.disabled=!h.value;
      if(nv===D.get.call(inp)) return; D.set.call(inp,nv);
      inp.dispatchEvent(new Event("input",{bubbles:true})); inp.dispatchEvent(new Event("change",{bubbles:true})); }
    h.__tpkPut=m.__tpkPut=put;   // 이벤트는 창(window) 맨 앞에서 받음 — 앱이 document 캡처로 화면을 다시 그리기 전에 값을 넣기 위해
    try{ Object.defineProperty(inp,"value",{configurable:true,get:function(){ return D.get.call(inp); },set:function(x){ D.set.call(inp,x); sync(); }}); }catch(e){}
    w.appendChild(h); w.appendChild(c); w.appendChild(m);
    inp.style.display="none"; inp.parentNode.insertBefore(w,inp.nextSibling);
    if(inp.disabled){ h.disabled=m.disabled=true; }
    sync();
  }
  function cap(e){ var t=e.target; if(t&&t.__tpkPut){ e.stopPropagation(); if(e.type==="change") t.__tpkPut(); } }
  window.addEventListener("change",cap,true); window.addEventListener("input",cap,true);
  function scan(){ q=0; var a=document.querySelectorAll('input[type="time"]'); for(var i=0;i<a.length;i++) if(!a[i].__tpk) up(a[i]); }
  var q=0; function later(){ if(!q){ q=1; (window.requestAnimationFrame||setTimeout)(scan); } }
  try{ new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",scan); else scan();
})();
