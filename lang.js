/* 머니퍼즐 투어 — 어느 화면에서나 언어 바꾸기 (사장님 2026-10-18)
 *  「외국인이 근처 한국인에게 화면을 보여 줄 때 그 화면에서 바로 한국어로, 다른 화면으로 움직이면 안 된다」
 *  · 떠 있는 작은 단추(#lgP) — 모든 창·지도 위에 늘 보인다. 외국어 화면: 「🌐 한국어」 한 번 누르면 한국어로 → 다시 누르면 원래 언어로
 *    ▾ 또는 길게 누르기 = 다섯 언어 목록. 위쪽 고르기 칸(#lang)도 그대로, 서로 맞춰진다
 *  · 언어를 바꾸면 지금 화면을 그 자리에서 다시 그린다 — 열린 카드·창·스크롤·지도 배율 그대로, 새로 검색하지 않는다
 *    (#res 는 마지막으로 그린 함수 window._RR.f 를 다시 부른다 · 창은 각 파일 setLang 감싸기 + 창 요소의 _rb)
 *  · 카카오 장소(검색·핀·근처·AI 가까운 곳)는 받은 언어 이름을 x.LL[언어] 에 모아 둔다 → 한국어는 늘 그대로(name),
 *    다른 외국어로 처음 갈 때만 그 자리에서 이름을 한 번 받아 온다(KL.ensure)
 *  · 한국어로 「잠깐」 바꾼 것은 저장하지 않는다(mpv_lang 은 손님 언어 그대로) — 목록에서 한국어를 고르면 그때는 저장
 *  index.html 은 맨 끝 <script src="lang.js"> 한 줄 — 전역(setLang·LANG·T·esc·PLACES·HUB·kpL·KS·kmLL·placeShow·spinCard·distShow·ktxErr·favList)을 감싼다
 */
(function(){
"use strict";
var NM={ko:"한국어",en:"English",ja:"日本語",zhs:"简体中文",zht:"繁體中文"}, ORD=["ko","en","ja","zhs","zht"];
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
function fg(){ var f=ls("mpv_lang_fg"); return ORD.indexOf(f)>0?f:null; }   // 손님 외국어 (마지막으로 쓴 외국어)
if(window.LANG&&LANG!=="ko") ls("mpv_lang_fg",LANG);

// ── 카카오 장소 이름 언어별 보관 (KL) ──
var F={item:{n:"name_en",a:"addr_en",c:"cat_en",ko:"name",lat:"y",lng:"x"},pin:{n:"en",a:"addr_en",c:"cat_en",ko:"ko",lat:"lat",lng:"lng"}};
var KL={prev:null,busy:0};
function kN(s){ return String(s||"").replace(/[\s·()\-_.,'’]/g,"").toLowerCase(); }
function keep(x,f){ if(x._l&&x._l!=="ko"&&x[f.n]!=null){ x.LL=x.LL||{}; if(!x.LL[x._l]) x.LL[x._l]={n:x[f.n],a:x[f.a],c:x[f.c]}; } }
function use(x,f,l){ if(l==="ko") return true; if(!x._l) x._l=KL.prev||l; keep(x,f); if(x._l===l) return true; var d=x.LL&&x.LL[l]; if(!d) return false;
  x[f.n]=d.n!=null?d.n:(f===F.pin?KS(x[f.ko]):null); if(d.a!=null) x[f.a]=d.a; x[f.c]=d.c!=null?d.c:""; x._l=l; return true; }
function kq(q,ps){ return fetch(HUB+"/kplace?q="+encodeURIComponent(q)+kpL()+(ps?"&ux="+(+ps[1]).toFixed(5)+"&uy="+(+ps[0]).toFixed(5):"")).then(function(r){ return r.json(); }).then(function(j){ return (j&&j.ok&&j.items)||[]; }).catch(function(){ return []; }); }
function take(miss,f,l,res){ miss.forEach(function(x){ if(x.LL&&x.LL[l]) return; var a=kN(x[f.ko]), la=+x[f.lat], lo=+x[f.lng];
  var m=res.filter(function(y){ return kN(y.name)===a&&kmLL([+y.y,+y.x],[la,lo])<0.3; })[0]||res.filter(function(y){ var b=kN(y.name); return b&&a&&(b.indexOf(a)>=0||a.indexOf(b)>=0)&&kmLL([+y.y,+y.x],[la,lo])<0.15; })[0];
  if(m&&m.name_en){ x.LL=x.LL||{}; x.LL[l]={n:m.name_en,a:m.addr_en,c:m.cat_en}; } }); }
function fill(miss,f,l,q){ var p=q?kq(q,window.ME&&ME.pos).then(function(r){ take(miss,f,l,r); }):Promise.resolve();
  return p.then(function(){ var rest=miss.filter(function(x){ return !(x.LL&&x.LL[l]); }).slice(0,10), i=0;
    function next(){ if(i>=rest.length) return Promise.resolve(); var b=rest.slice(i,i+4); i+=4;
      return Promise.all(b.map(function(x){ return kq(x[f.ko],[x[f.lat],x[f.lng]]).then(function(r){ take([x],f,l,r); }); })).then(next); }
    return next(); }); }
// 지금 언어 이름이 없는 것만 받아 와서 cb() — 받을 게 없으면 false
KL.ensure=function(list,kind,q,cb){ var l=window.LANG, f=F[kind]; if(l==="ko"||!list||!list.length) return false;
  var miss=list.filter(function(x){ return x&&!use(x,f,l); }); if(!miss.length) return false;
  var key=l+"|"+miss.map(function(x){ return x[f.ko]; }).join("|"); if(KL._q&&KL._q[key]) return true; KL._q=KL._q||{}; KL._q[key]=1;
  busy(1); fill(miss,f,l,q).then(function(){ miss.forEach(function(x){ x.LL=x.LL||{}; if(!x.LL[l]) x.LL[l]={n:null}; }); },function(){}).then(function(){ delete KL._q[key]; busy(-1);
    if(window.LANG===l){ miss.forEach(function(x){ use(x,f,l); }); try{ cb(); }catch(e){} } });
  return true; };
KL.use=function(x,kind,l){ return use(x,F[kind],l||window.LANG); };
KL.bz=function(d){ busy(d); };
window.KL=KL;

// ── 단추 ──
function css(){ if(document.getElementById("lgCss")) return; var s=document.createElement("style"); s.id="lgCss";
  s.textContent="#lgP{position:fixed;right:0;top:58%;transition:top .15s;z-index:2147483000;display:flex;align-items:stretch;background:#1f2937;color:#fff;border-radius:999px 0 0 999px;box-shadow:0 2px 10px rgba(0,0,0,.35);font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;opacity:.94;touch-action:none}"
  +"#lgP button{border:0;background:none;color:inherit;font:inherit;cursor:pointer;padding:0;margin:0;-webkit-tap-highlight-color:transparent}"
  +"#lgT{font-size:12.5px;font-weight:800;line-height:1;padding:9px 4px 9px 11px!important;white-space:nowrap}#lgM{font-size:11px;padding:9px 8px 9px 5px!important;border-left:1px solid rgba(255,255,255,.25)!important;opacity:.85}"
  +"#lgP.busy #lgT::after{content:'';display:inline-block;width:9px;height:9px;margin-left:5px;border:2px solid rgba(255,255,255,.5);border-top-color:#fff;border-radius:50%;vertical-align:-1px;animation:lgSp .8s linear infinite}@keyframes lgSp{to{transform:rotate(360deg)}}"
  +"#lgP.flash{animation:lgFl .5s ease-out}@keyframes lgFl{0%{transform:scale(1.15)}100%{transform:scale(1)}}"
  +"#lgL{position:fixed;right:6px;z-index:2147483001;background:#fff;color:#111827;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.3);overflow:hidden;min-width:150px;font-family:inherit}"
  +"#lgL button{display:block;width:100%;text-align:left;border:0;border-top:1px solid #e6e9ef;background:#fff;color:#111827;font-size:15px;font-weight:700;padding:11px 14px;cursor:pointer;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','PingFang TC','Microsoft YaHei','Microsoft JhengHei',sans-serif}#lgL button:first-child{border-top:0}#lgL button.on{color:#2f9e44}#lgL button.on::after{content:' ✓'}"
  +"@media print{#lgP,#lgL{display:none!important}}";
  document.head.appendChild(s); }
var P=null;
function label(){ if(!P) return; var t=document.getElementById("lgT"), l=window.LANG, f=fg();
  if(l!=="ko"){ t.textContent="🌐 한국어"; t.title=TE("Show this screen in Korean"); }
  else if(f){ t.textContent="🌐 "+NM[f]; t.title="← "+NM[f]; }
  else { t.textContent="🌐 한국어"; t.title="Language"; }
  t.setAttribute("aria-label",t.title); document.getElementById("lgM").setAttribute("aria-label",T("언어 고르기","Choose language")); }
function busy(d){ KL.busy=Math.max(0,KL.busy+d); if(P) P.classList.toggle("busy",KL.busy>0); }
function listOpen(){ listClose(); var r=P.getBoundingClientRect(), b=document.createElement("div"); b.id="lgL";
  b.innerHTML=ORD.map(function(l){ return '<button type="button" data-l="'+l+'"'+(l===window.LANG?' class="on"':'')+' lang="'+({ko:"ko",en:"en",ja:"ja",zhs:"zh-Hans",zht:"zh-Hant"}[l])+'">'+NM[l]+'</button>'; }).join("");
  document.body.appendChild(b); var h=b.offsetHeight, top=r.top-h-6; if(top<6) top=Math.min(window.innerHeight-h-6,r.bottom+6); b.style.top=Math.max(6,top)+"px";
  b.addEventListener("click",function(e){ e.stopPropagation(); var x=e.target.closest("button[data-l]"); if(!x) return; listClose(); to(x.dataset.l,false); });
  setTimeout(function(){ document.addEventListener("pointerdown",outside,true); },0); }
function outside(e){ var b=document.getElementById("lgL"); if(!b) return document.removeEventListener("pointerdown",outside,true); if(b.contains(e.target)||(P&&P.contains(e.target))) return; e.stopPropagation(); e.preventDefault(); listClose(); }
function listClose(){ var b=document.getElementById("lgL"); if(b) b.remove(); document.removeEventListener("pointerdown",outside,true); }
function quick(){ var l=window.LANG, f=fg(); if(l!=="ko") return to("ko",true); if(f) return to(f,false); listOpen(); }
function make(){ css(); if(document.getElementById("lgP")) return; P=document.createElement("div"); P.id="lgP"; P.setAttribute("translate","no"); P.className="notranslate";
  P.innerHTML='<button type="button" id="lgT"></button><button type="button" id="lgM">▾</button>'; document.body.appendChild(P);
  var t=document.getElementById("lgT"), lp=null, longed=false, dr=null, dragged=false;
  ["click","pointerup","pointerdown","touchstart","touchend","mousedown","mouseup"].forEach(function(ev){ P.addEventListener(ev,function(e){ e.stopPropagation(); },false); });   // 밑의 지도·창 닫기로 새지 않게
  t.addEventListener("pointerdown",function(){ longed=false; clearTimeout(lp); lp=setTimeout(function(){ if(!dragged){ longed=true; listOpen(); } },550); });
  ["pointerup","pointercancel","pointerleave"].forEach(function(ev){ t.addEventListener(ev,function(){ clearTimeout(lp); }); });
  // 위아래로 끌어 자리 옮기기 — 손님이 가린 곳을 보고 싶을 때 (자리는 이 기기에만 기억)
  P.addEventListener("pointerdown",function(e){ dragged=false; dr={y:e.clientY,t:P.getBoundingClientRect().top,id:e.pointerId}; });
  P.addEventListener("pointermove",function(e){ if(!dr) return; var dy=e.clientY-dr.y; if(!dragged&&Math.abs(dy)<9) return; if(!dragged){ dragged=true; clearTimeout(lp); try{ P.setPointerCapture(dr.id); }catch(x){} listClose(); }
    var y=Math.max(8,Math.min(window.innerHeight-P.offsetHeight-8,dr.t+dy)); P.style.transition="none"; P.style.top=y+"px"; e.preventDefault(); });
  P.addEventListener("pointerup",function(){ if(dr&&dragged){ var y=P.getBoundingClientRect().top; ls("mpv_lgy",String((y/window.innerHeight).toFixed(3))); P.style.transition=""; setTimeout(function(){ dragged=false; },50); dr=null; return; } dr=null; });
  P.addEventListener("pointercancel",function(){ dr=null; dragged=false; P.style.transition=""; });
  P.addEventListener("click",function(e){ if(dragged){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
  t.addEventListener("contextmenu",function(e){ e.preventDefault(); });
  t.addEventListener("click",function(e){ e.preventDefault(); if(longed){ longed=false; return; } if(document.getElementById("lgL")){ listClose(); return; } quick(); });
  document.getElementById("lgM").addEventListener("click",function(e){ e.preventDefault(); if(document.getElementById("lgL")) listClose(); else listOpen(); });
  label(); place(); }
// 자리 비키기 — 단추 밑에 작은 단추·링크·입력칸이 오면(스크롤이 멈춘 뒤) 위아래 빈 곳으로 살짝 옮긴다. 줄 전체를 누르는 목록 줄·지도는 괜찮다
function hit(top){ var vw=document.documentElement.clientWidth, w=P.offsetWidth, h=P.offsetHeight, L=vw-w, bad=0;
  for(var x=L+3;x<vw-2;x+=7) for(var y=top+3;y<top+h-2;y+=6){ var e=document.elementFromPoint(x,y); if(!e) continue;
    var c=e.closest&&e.closest("button,a,input,select,textarea,[role=button],.trx,.tebtn,.tradd,.nrcall,label"); if(!c||c.closest("#lgP,#lgL,#nmap")) continue;
    var r=c.getBoundingClientRect(); if(r.width>vw*0.8) continue; bad++; } return bad; }
var _pt=null, _base=null;
function place(){ if(!P||P.style.transition==="none"||document.getElementById("lgL")) return; var vh=window.innerHeight, h=P.offsetHeight||34, f=parseFloat(ls("mpv_lgy")), base=Math.round((f>0&&f<1?f:0.58)*vh);
  base=Math.max(8,Math.min(vh-h-8,base)); P.style.pointerEvents="none"; P.style.visibility="hidden";
  var cur=parseFloat(P.style.top)||base, best=null, cand=[cur,base], i; for(i=1;i<=12;i++){ cand.push(base-i*36,base+i*36); }
  try{ for(i=0;i<cand.length;i++){ var y=cand[i]; if(y<8||y>vh-h-8) continue; if(!hit(y)){ best=y; break; } } }catch(e){}
  P.style.pointerEvents=""; P.style.visibility=""; P.style.top=(best==null?base:best)+"px"; }
function placeSoon(){ clearTimeout(_pt); _pt=setTimeout(place,160); }
window.addEventListener("scroll",placeSoon,{capture:true,passive:true}); window.addEventListener("resize",placeSoon);
document.addEventListener("click",function(){ setTimeout(place,450); setTimeout(place,1300); },true);
try{ new MutationObserver(placeSoon).observe(document.body,{childList:true}); }catch(e){}   // 창이 열리고 닫힐 때도

// ── 바꾸기 ── tmp=true 이면 한국어로 「잠깐」 (저장한 손님 언어는 그대로)
function to(l,tmp){ if(l===window.LANG){ label(); return; } var keepL=ls("mpv_lang"); window.setLang(l); if(tmp) ls("mpv_lang",keepL||fg()||l);
  if(P){ P.classList.remove("flash"); void P.offsetWidth; P.classList.add("flash"); } }
window.langTo=to;

// 스크롤 자리 — 바꾸기 직전 값을 다시 그린 뒤에도 그대로 (그림·지도가 늦게 그려져도 0.9초 동안 지킨다, 손님이 만지면 그만)
var SCR=["#nrBox","#gfBox","#trBox","#trRep","#inqIn","#shIn","#infopop","#psBox"];
// 기준 줄 — 언어마다 줄 높이·순서가 달라도(대사관은 언어마다 나라 이름 순) 보던 그 항목이 같은 높이에 오게
var AK=".nrit[data-ak],.nrit[data-i],.sres[data-i],.rcit[data-rk],.gfk[data-kc],.tri[data-k],.trw,.tlg,.tdh,.gfq";
function akKey(e){ var d=e.closest("[data-d]"); return (e.className.split(" ")[0])+"|"+(e.dataset.ak||e.dataset.i||e.dataset.rk||e.dataset.kc||e.dataset.k||[].indexOf.call(e.parentNode.children,e))+(d?"@"+d.dataset.d:""); }
function anchor(root,top,bot){ var a=root.querySelectorAll(AK), first=null; for(var i=0;i<a.length;i++){ var r=a[i].getBoundingClientRect(); if(!r.height||r.top>=bot) continue; if(r.top>=top-2) return {k:akKey(a[i]),off:r.top-top}; if(!first&&r.bottom>top+4) first={k:akKey(a[i]),off:r.top-top}; } return first; }   // 화면 안에서 위가 보이는 첫 줄 (없으면 걸친 줄)
function topOf(e){ return e?e.getBoundingClientRect().top:0; }
function snap(){ var o={y:window.scrollY,x:window.scrollX,e:[]}; var res=document.getElementById("res");
  o.a=res&&!document.querySelector(".trsheet,#nrBox,#gfBox")?anchor(res,0,window.innerHeight):null;
  SCR.forEach(function(s){ var e=document.querySelector(s); if(e){ var t=topOf(e); o.e.push([e,e.scrollTop,anchor(e,t,t+e.clientHeight)]); } }); return o; }
function find(root,k){ var a=root.querySelectorAll(AK); for(var i=0;i<a.length;i++) if(akKey(a[i])===k) return a[i]; return null; }
function room(o){ var b=document.body, need=o.y+window.innerHeight, h=document.documentElement.scrollHeight; if(h<need){ var cur=parseFloat(b.style.paddingBottom)||0; b.style.paddingBottom=(cur+need-h)+"px"; }
  o.e.forEach(function(a){ var e=a[0], c=e.firstElementChild; if(!e.isConnected||!c) return; var nd=a[1]+e.clientHeight; if(e.scrollHeight<nd){ var cp=parseFloat(c.style.paddingBottom)||parseFloat(getComputedStyle(c).paddingBottom)||0; c.style.paddingBottom=(cp+nd-e.scrollHeight)+"px"; } }); }
function restore(o){ room(o); var stop=false, f=function(){ stop=true; }; ["touchstart","wheel","keydown","pointerdown"].forEach(function(ev){ window.addEventListener(ev,f,{once:true,capture:true,passive:true}); });
  var go=function(){ if(stop) return; room(o);
    var ty=o.y; if(o.a){ var res=document.getElementById("res"), el=res&&find(res,o.a.k); if(el) ty=window.scrollY+(el.getBoundingClientRect().top-o.a.off); }
    if(Math.abs(window.scrollY-ty)>1) window.scrollTo(o.x,ty);
    o.e.forEach(function(a){ var e=a[0]; if(!e.isConnected) return; var t=a[1]; if(a[2]){ var el=find(e,a[2].k); if(el) t=e.scrollTop+(el.getBoundingClientRect().top-topOf(e)-a[2].off); } if(Math.abs(e.scrollTop-t)>1) e.scrollTop=t; }); };
  go(); requestAnimationFrame(go); [60,150,300,600,900,1200,1500].forEach(function(t){ setTimeout(go,t); });
  setTimeout(function(){ ["touchstart","wheel","keydown","pointerdown"].forEach(function(ev){ window.removeEventListener(ev,f,true); }); },1550); }

// 조용히 다시 그리기 — 누름 집계·「나」 자세·스크롤 이동·관심 분석 없이
function quiet(fn){ var W=window, s={ntap:W.ntap,mePose:W.mePose,meDest:W.meDest,favTap:W.favTap,scrollTo:W.scrollTo,siv:Element.prototype.scrollIntoView}, nop=function(){};
  W.ntap=nop; W.mePose=nop; W.meDest=nop; W.favTap=nop; W.scrollTo=nop; Element.prototype.scrollIntoView=nop; W.__lgQuiet=1;
  try{ fn(); }catch(e){ try{ console.error(e); }catch(x){} }
  W.ntap=s.ntap; W.mePose=s.mePose; W.meDest=s.meDest; W.favTap=s.favTap; W.scrollTo=s.scrollTo; Element.prototype.scrollIntoView=s.siv; W.__lgQuiet=0;
  clearTimeout(W._scT); }

// #res 를 그린 함수 기억 (언어를 바꾸면 이것만 다시)
function rr(f){ window._RR={f:f}; }
function wrapRes(name,mk){ var o=window[name]; if(typeof o!=="function"||o._lg) return; var g=function(){ var a=arguments, r=o.apply(this,a); try{ var f=mk.apply(null,a); if(f) rr(f); }catch(e){} return r; };
  for(var k in o) g[k]=o[k]; g._lg=1; window[name]=g; }
wrapRes("placeShow",function(k){ if(!window.PLACES||!PLACES[k]||k==="adinq") return null; return function(){ var hk=!!document.getElementById("herek"); quiet(function(){ window._hereNext=hk; try{ window.placeShow(k); } finally{ window._hereNext=false; } }); }; });   // 「여기!」 표시도 그대로
wrapRes("spinCard",function(){ return function(){ quiet(function(){ window.spinCard(); }); }; });
wrapRes("distShow",function(a,b,p0,p1){ return function(){ quiet(function(){ window.distShow(a,b,p0,p1); }); }; });
wrapRes("ktxErr",function(){ return function(){ window.ktxErr(); }; });
wrapRes("favList",function(){ return function(){ quiet(function(){ window.favList(); }); }; });
["resClear","resetAll"].forEach(function(n){ var o=window[n]; if(typeof o!=="function"||o._lg) return; var g=function(){ window._RR=null; return o.apply(this,arguments); }; for(var k in o) g[k]=o[k]; g._lg=1; window[n]=g; });

function resAgain(){ var r=document.getElementById("res"), R=window._RR; if(!r||!r.firstElementChild||!R||typeof R.f!=="function") return; R.f(); }
// 그 밖의 열린 창 글자 — T() 가 낸 글자를 기억해 둔 표(_TL)로 그 자리에서 옮긴다 (입력한 값·고른 값은 그대로)
function tr1(v){ var m=window._TL&&window._TL.get(v); return m?T(m[0],m[1]):null; }
function trS(v){ if(!v||!/\S/.test(v)) return null; var t=v.trim(), r=tr1(t);
  if(r==null){ var m=/^([^\p{L}]*)([\s\S]*?)([^\p{L}]*)$/u.exec(t);   // 앞의 「1. 」「✓ 」·뒤의 「 *」 같은 꾸밈을 떼고 찾는다
    if(m){ var c=[[m[1],t.slice(m[1].length),""],[m[1],m[2],m[3]],["",t.slice(0,t.length-m[3].length),m[3]]]; for(var i=0;i<c.length&&r==null;i++){ if(!c[i][1]||c[i][1]===t) continue; var q=tr1(c[i][1]); if(q!=null) r=c[i][0]+q+c[i][2]; } } }
  return r==null||r===t?null:v.replace(t,r); }
function retext(root){ if(!root) return; var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), n, a=[]; while((n=w.nextNode())) a.push(n);
  a.forEach(function(x){ if(x.parentNode&&/^(SCRIPT|STYLE|TEXTAREA)$/.test(x.parentNode.nodeName)) return; var r=trS(x.nodeValue); if(r!=null) x.nodeValue=r; });
  [].forEach.call(root.querySelectorAll("[placeholder],[title],[aria-label]"),function(e){ ["placeholder","title","aria-label"].forEach(function(k){ var v=e.getAttribute(k), r=v&&trS(v); if(r!=null) e.setAttribute(k,r); }); }); }
window.lgRetext=retext;
var SKIP={lgP:1,lgL:1,nrBox:1,gfBox:1,trBox:1,trRep:1,shBox:1};
function overlaysAgain(){ var a=[].slice.call(document.querySelectorAll("body > *")).filter(function(e){ if(e.hidden||SKIP[e.id]||e.classList.contains("trsheet")||/^(SCRIPT|STYLE)$/.test(e.tagName)) return false; return typeof e._rb==="function"||getComputedStyle(e).position==="fixed"; });
  a.forEach(function(e){ try{ retext(e); }catch(x){} if(typeof e._rb==="function") try{ e._rb(); }catch(x){} });
  try{ retext(document.getElementById("mm")); }catch(e){}
  var sh=document.getElementById("shBox"); if(sh&&!sh.hidden){ try{ shBuild(); if(ls("mp_owner")) shOwnerFix(document.getElementById("shIn"),"Money Puzzle - Tour"); }catch(e){} } }
function mapAgain(){ try{ var c=window.CITY&&CITY[VIEW], tt=document.getElementById("vttl"); if(c&&tt) tt.textContent=LN(c);
    var vb=document.getElementById("vback"); if(c&&vb){ vb.title=vb.ariaLabel=c.parent!=="kr"&&CITY[c.parent]?T(CITY[c.parent].ko+"로",LN(CITY[c.parent])):T("전국 지도로","Korea map"); }
    var vd=document.getElementById("vdet"); if(vd) vd.textContent=window.DET?T("약도","Sketch"):T("자세히","Detailed");
    var sl=document.querySelector("#spin .spl"), p=PLACES.__pin; if(sl&&p) sl.textContent=FG()?KS(p.en||p.ko):p.ko;
    var hk=document.querySelector("#herek .hk-b"); if(hk) hk.textContent=T("여기!","Here");
    var r=document.querySelector("#res > .xbtn"); if(r) r.setAttribute("aria-label",T("닫기","Close")); }catch(e){}
  try{ nmRelang(); }catch(e){} }

// 자세한 지도(네이버) — 바탕 지도 글자는 스크립트를 부를 때 언어로 정해진다 → 같은 자리·같은 배율로 그 언어 스크립트를 다시 불러 갈아 끼운다
var NML={ko:"ko",en:"en",ja:"ja",zhs:"zh",zht:"zh"};
function nmCur(){ var s=document.querySelector('script[src*="oapi.map.naver.com/openapi/v3/maps.js"]'); var m=s&&/language=(\w+)/.exec(s.src); return m?m[1]:null; }
function nmRelang(){ if(!window._nm||!window.naver||!naver.maps) return; var want=NML[LANG]||"en", cur=nmCur(); if(!cur||cur===want) return;
  var c=_nm.getCenter(), z=_nm.getZoom(), lat=c.lat(), lng=c.lng(), iw=window._niwK&&window._niw&&_niw.getMap()?_niwK:null, pin=PLACES.__pin&&window._spm&&_spm.getMap()?PLACES.__pin:null;
  try{ _nm.destroy(); }catch(e){} window._nm=null; window._nmk={}; window._niw=null; window._niwK=null; window._nmMe=null; window._nmMeP=""; window._spm=null;
  [].forEach.call(document.querySelectorAll('script[src*="oapi.map.naver.com"],script[src*="map.pstatic.net"],script[src*="navermaps"]'),function(s){ s.remove(); });
  try{ delete window.naver; }catch(e){ window.naver=undefined; } var box=document.getElementById("nmap"); if(box) box.innerHTML="";
  nmLoad(function(){ var t=0, iv=setInterval(function(){ if(!(window.naver&&naver.maps&&naver.maps.Map)&&++t<80) return; clearInterval(iv); if(!(window.naver&&naver.maps&&naver.maps.Map)) return;
    _nm=new naver.maps.Map("nmap",{center:new naver.maps.LatLng(lat,lng),zoom:z,zoomControl:true,zoomControlOptions:{position:naver.maps.Position.RIGHT_BOTTOM}});
    naver.maps.Event.addListener(_nm,"click",function(){ if(window._nmMk&&Date.now()-window._nmMk<400) return; if(_niw) _niw.close(); });
    try{ nmMark(); }catch(e){} try{ nmMe(); }catch(e){} if(iw&&_nmk[iw]) try{ nmOpen(iw); }catch(e){}
    if(pin){ try{ _spm=new naver.maps.Marker({position:new naver.maps.LatLng(+pin.lat,+pin.lng),map:_nm,title:pin.ko}); naver.maps.Event.addListener(_spm,"click",function(){ spinCard(); }); }catch(e){} }
    setTimeout(nmRelang,0); },50); }); }   // 받는 사이에 또 바꿨으면 한 번 더

// setLang 맨 바깥 감싸기 — 모든 파일의 감싸기가 끝난 뒤 지금 화면을 다시
var sl0=window.setLang;
window.setLang=function(l){ var o=snap();  listClose(); KL.prev=window.LANG; var r;
  try{ r=sl0.apply(this,arguments); }catch(e){ try{ console.error(e); }catch(x){} }
  if(window.LANG!=="ko") ls("mpv_lang_fg",window.LANG);
  try{ resAgain(); }catch(e){ try{ console.error(e); }catch(x){} }
  try{ overlaysAgain(); }catch(e){} mapAgain(); label(); restore(o); setTimeout(place,1000); return r; };
window.setLang._lg=1;
make();
window.LANGBTN={quick:quick,open:listOpen,close:listClose,to:to};
})();
