/* 머니퍼즐 내비 — 이용권 (사장님 2026-10-16 「일단 만들고 꺼 둬」)
 *  · 허브 스위치(PASS_ENFORCE)가 꺼져 있으면 손님 화면·동작은 그대로 — 이 파일은 이용권 글자를 유료 요청에 붙이기만 한다
 *  · 이 브라우저 저장: mpv_pass(이용권 글자) · mpv_dev(앱이 만든 무작위 기기 번호, 손님 정보 아님). 이메일은 저장 안 함
 *  · 유료 요청(허브 /nreco·/ntrip POST)에 {pt, pd} 를 붙인다 — trip.js·reco.js 는 손대지 않고 fetch 를 감싼다
 *  · 스위치가 켜져 있을 때만 ⋮ 메뉴에 「이용권 다시 받기」(이메일 → 그 이메일로 링크 재발송)
 *  · 메일 링크(?pass=)는 index.html 첫 화면 스크립트가 받아 등록한다 — 여기선 안내만
 *  index.html 은 <script src="pass.js"> 한 줄뿐 — 전역(HUB·T·esc·LANG·setLang)을 부른다
 */
(function(){
"use strict";
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function dev(){ var d=ls("mpv_dev"); if(!/^[0-9a-f]{16,32}$/.test(d||"")){ d=Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(12)),function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); ls("mpv_dev",d); } return d; }
function tok(){ var t=ls("mpv_pass"); return /^p1\.\d{8}\.[0-9a-f]{16}\.[0-9a-f]{16}$/.test(t||"")?t:""; }
var PAID=/\/(nreco|ntrip)(\?|$)/;
// 유료 요청에 이용권 붙이기 (JSON 본문에 pt·pd) — 이용권이 없으면 그대로 보낸다
var f0=window.fetch;
window.fetch=function(u,o){ try{ var s=typeof u==="string"?u:(u&&u.url)||"";
    if(o&&o.body&&typeof o.body==="string"&&s.indexOf(HUB)===0&&PAID.test(s)){ var t=tok(); if(t){ var b=JSON.parse(o.body); if(b&&typeof b==="object"&&!Array.isArray(b)){ b.pt=t; b.pd=dev(); o=Object.assign({},o,{body:JSON.stringify(b)}); } } } }catch(e){}
  return f0.apply(this,[u,o]); };
function css(){ if(document.getElementById("psCss")) return; var s=document.createElement("style"); s.id="psCss";
  s.textContent="#psBox{position:fixed;inset:0;z-index:1040;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}"
  +"#psBox .in{background:var(--card);color:var(--ink);width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:18px 16px 26px}"
  +"#psBox input{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);margin:10px 0}"
  +"#psBox button{border:0;border-radius:999px;padding:11px 18px;font-weight:800;font-size:15px;cursor:pointer;background:var(--blue);color:#fff}#psBox button.g{background:var(--bg);color:var(--sub)}"
  +"#psBox .m{font-size:13.5px;color:var(--sub);margin-top:8px;min-height:18px}#psToast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1050;background:#1f2937;color:#fff;border-radius:12px;padding:10px 16px;font-size:14px;font-weight:700;max-width:90vw;text-align:center}";
  document.head.appendChild(s); }
function toast(m){ css(); var e=document.getElementById("psToast"); if(e) e.remove(); e=document.createElement("div"); e.id="psToast"; e.textContent=m; document.body.appendChild(e); setTimeout(function(){ e.remove(); },5000); }
function dfmt(x){ return /^\d{8}$/.test(x)?x.slice(0,4)+"-"+x.slice(4,6)+"-"+x.slice(6):""; }
// 메일 링크로 들어왔을 때 한 줄 안내 (첫 화면 스크립트가 남긴 표시)
function linkMsg(){ var m=null; try{ m=sessionStorage.getItem("mpv_pass_msg"); if(m) sessionStorage.removeItem("mpv_pass_msg"); }catch(e){} if(!m) return false;
  toast(m==="x"?T("이용권 기간이 끝났어요","This pass has expired"):m==="bad"?T("이용권 링크를 확인하지 못했어요","Could not verify this pass link"):T("이용권이 들어왔어요 · ","Pass activated · ")+dfmt(m)+T(" 까지"," (valid until)")); return true; }
if(!linkMsg()) setTimeout(linkMsg,3000);
// 「이용권 다시 받기」 — 스위치가 켜져 있을 때만 메뉴에
function resendOpen(){ css(); var b=document.getElementById("psBox"); if(b) b.remove(); b=document.createElement("div"); b.id="psBox";
  b.innerHTML='<div class="in"><b>'+esc(T("이용권 다시 받기","Get my pass again"))+'</b><div class="m">'+esc(T("결제할 때 쓴 이메일을 넣으면, 쓸 수 있는 이용권 링크를 그 이메일로 다시 보내 드려요.","Enter the email you used to pay — we will email your pass link again."))+'</div>'
    +'<input id="psEm" type="email" autocomplete="email" inputmode="email" placeholder="email@example.com"><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="g" id="psX">'+esc(T("닫기","Close"))+'</button><button type="button" id="psGo">'+esc(T("보내기","Send"))+'</button></div><div class="m" id="psM"></div></div>';
  b.onclick=function(e){ if(e.target===b) b.remove(); }; document.body.appendChild(b);
  document.getElementById("psX").onclick=function(){ b.remove(); };
  document.getElementById("psGo").onclick=function(){ var em=document.getElementById("psEm").value.trim(), M=document.getElementById("psM");
    if(!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(em)){ M.textContent=T("이메일을 확인해 주세요","Please check the email"); return; }
    M.textContent="…"; f0(HUB+"/npass/resend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:em,lang:L2(),ul:LANG})}).then(function(r){ return r.json(); }).then(function(j){
      M.textContent=j&&j.ok?T("이용권이 있으면 몇 분 안에 메일이 가요. 메일의 링크를 이 폰에서 여세요.","If you have a pass, an email is on its way. Open its link on this phone."):j&&j.err==="rate"?T("잠시 뒤 다시 해 주세요","Please try again later"):T("잠시 뒤 다시 해 주세요","Please try again shortly"); })
    .catch(function(){ M.textContent=T("잠시 뒤 다시 해 주세요","Please try again shortly"); }); }; }
var ON=false;
function menu(){ var mm=document.getElementById("mm"); if(!mm) return; var a=document.getElementById("mpass");
  if(!ON){ if(a) a.remove(); return; }
  if(!a){ mm.insertAdjacentHTML("afterbegin",'<a href="#" id="mpass" class="mi"></a>'); a=document.getElementById("mpass"); a.onclick=function(e){ e.preventDefault(); mm.hidden=true; resendOpen(); }; }
  a.textContent=T("이용권 다시 받기","Get my pass again"); }
f0(HUB+"/npass/cfg",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ ON=!!(j&&j.on); menu(); }).catch(function(){});
var sl0=window.setLang; if(typeof sl0==="function") window.setLang=function(){ var r=sl0.apply(this,arguments); try{ menu(); }catch(e){} return r; };
window.NPASS={has:function(){ return !!tok(); },exp:function(){ var t=tok(); return t?t.split(".")[1]:""; },resend:resendOpen,on:function(){ return ON; }};
})();
