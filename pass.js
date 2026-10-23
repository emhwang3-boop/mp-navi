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

/* ───────── 🧪 결제 테스트 모드 (사장님 2026-10-23 밤 — 건별 소액 모델) ─────────
 *  🔴 mpv_paytest==="1" 일 때만 전부 돈다. 실 손님 화면·동작은 한 글자도 안 바뀐다(이 블록을 통째로 건너뜀). 앱은 계속 무료(지도·명소·검색·별점).
 *  켜는 법: navi.moneypuzzle.co.kr/?paytest=1 로 연다(끄기 ?paytest=0).
 *  건별 소액(가짜 승인, 허브 /npass/pay):
 *    · AI 여행 플래너(추천받기 /nreco · 여행카트 일정 /ntrip): 실행할 때 그 자리에서 1,000원 결제창 → 가짜 승인하면 그 건 실행. (fetch 를 감싸서 가로챈다 — reco.js·trip.js 는 안 고침)
 *    · 통역·길안내(🗣 통역 단추): 10회 묶음 1,000원 → 기기에 10회 쌓고 쓸 때마다 1 차감(남은 횟수 ⋮메뉴에). '잔액'이 아니라 '남은 횟수'.
 *  7/15/30일 이용권·전체 화면 벽·기기추가 코드는 아래에 그대로 두되(보류) 화면엔 안 띄운다. PG(토스) 정해지면 가짜 승인을 토스 위젯으로 교체. */
(function(){
  function pt1(){ return ls("mpv_paytest")==="1"; }
  if(!pt1()) return;
  var TSECS=(location.search.match(/[?&]trialsecs=(\d{1,3})/)||[])[1];   // 테스트 단축창(벽 빨리 보기) — 테스트 모드에서만
  var PLANS=[{d:7,w:"9,900",u:"7.99"},{d:15,w:"17,900",u:"13.99"},{d:30,w:"29,900",u:"22.99"}];
  var active=false, wtmr=0;
  function dlabel(d){ return T(d+"일",d+" days"); }
  function pcss(){ if(document.getElementById("ptCss")) return; var s=document.createElement("style"); s.id="ptCss";
    s.textContent="#psBox{z-index:2147483010!important}"
    +"#psBox .ptitem{display:flex;justify-content:space-between;align-items:center;padding:14px 14px;border:1.5px solid var(--blue);border-radius:12px;margin:12px 0;font-weight:800}#psBox .ptitem .pts{font-size:16px}#psBox .ptitem .ptpr{font-size:16px}#psBox .ptitem .ptpr small{color:var(--sub);font-weight:600;font-size:13px}"
    +"#psBox .ptopts{margin:12px 0 4px}"
    +"#psBox .ptopt{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1.5px solid var(--line);border-radius:12px;margin:8px 0;cursor:pointer}"
    +"#psBox .ptopt input{width:18px;height:18px;margin:0;flex:0 0 auto}"
    +"#psBox .ptopt .ptd{font-weight:800;font-size:15px}#psBox .ptopt .ptp{margin-left:auto;font-weight:800;font-size:14.5px}#psBox .ptopt .ptp small{color:var(--sub);font-weight:600}"
    +"#psBox .ptmlbl{font-size:13px;color:var(--sub);margin:14px 0 6px;font-weight:700}"
    +"#psBox .ptm{padding:10px 12px;border:1.5px dashed var(--line);border-radius:10px;margin:6px 0;color:var(--sub);font-size:14px;opacity:.6;cursor:not-allowed}"
    +"#psBox .ptm em{float:right;font-style:normal;font-size:12px;background:var(--bg);padding:2px 8px;border-radius:999px}"
    +"#psBox .ptlink{word-break:break-all;font-size:12.5px;color:var(--sub);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px;margin-top:4px}"
    +"#pwWall{position:fixed;inset:0;z-index:1060;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px 16px;overflow:auto}"
    +"#pwWall .pwIn{background:var(--card);color:var(--ink);width:100%;max-width:420px;border-radius:18px;padding:26px 20px 24px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.25)}"
    +"#pwWall .pwLogo{font-size:40px;margin-bottom:8px}#pwWall b{font-size:19px;display:block;margin-bottom:6px}#pwWall .m{font-size:14px;color:var(--sub);margin-bottom:16px}"
    +"#pwWall .ptrow{display:flex;justify-content:space-between;padding:9px 12px;border:1.5px solid var(--line);border-radius:12px;margin:7px 0;font-weight:800;font-size:14.5px}#pwWall .ptrow small{color:var(--sub);font-weight:600}"
    +"#pwWall #pwBuy{margin-top:16px;width:100%;border:0;border-radius:999px;padding:14px;font-weight:800;font-size:16px;background:var(--blue);color:#fff;cursor:pointer}";
    document.head.appendChild(s); }
  function fcopy(s){ try{ var i=document.createElement("textarea"); i.value=s; i.style.position="fixed"; i.style.left="-9999px"; document.body.appendChild(i); i.focus(); i.select(); document.execCommand("copy"); i.remove(); toast(T("링크를 복사했어요","Link copied")); }catch(e){ toast(T("복사하지 못했어요","Could not copy")); } }
  function copy(s){ try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(s).then(function(){ toast(T("링크를 복사했어요","Link copied")); },function(){ fcopy(s); }); return; } }catch(e){} fcopy(s); }
  function hub(path,body){ return f0(HUB+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"}).then(function(r){ return r.json(); }); }
  // ── 가짜 승인 → 이 기기에 테스트 이용권 발급
  function buyPass(days){ hub("/npass/buy",{days:days,pd:dev(),test:1}).then(function(j){
      if(j&&j.ok&&j.t){ ls("mpv_pass",j.t); ls("mpv_ok","1"); active=true; clearTimeout(wtmr);
        var w=document.getElementById("pwWall"); if(w) w.remove(); var b=document.getElementById("psBox"); if(b) b.remove();
        tmenu(); toast(T("이용권이 들어왔어요 · ","Pass activated · ")+dfmt(j.exp)+T(" 까지"," (valid until)")); }
      else toast(T("결제(테스트)에 실패했어요","Test payment failed")); })
    .catch(function(){ toast(T("결제(테스트)에 실패했어요","Test payment failed")); }); }
  // ── 이용권 고르기 + 결제수단(자리만) + 가짜 결제 단추
  function payModal(){ css(); pcss(); var b=document.getElementById("psBox"); if(b) b.remove(); b=document.createElement("div"); b.id="psBox";
    var opts=PLANS.map(function(p,i){ return '<label class="ptopt"><input type="radio" name="ptplan" value="'+p.d+'"'+(i===0?" checked":"")+'><span class="ptd">'+esc(dlabel(p.d))+'</span><span class="ptp">₩'+p.w+' <small>($'+p.u+')</small></span></label>'; }).join("");
    var meths=[['<img src="img/menu/mi_pay.png" style="width:20px;height:20px;object-fit:contain;vertical-align:-4px" alt="">',T("카드","Card")],["🅿","PayPal"],["📲",T("간편결제","Easy pay")],["📱",T("휴대폰에 카드를 대세요","Tap your card to your phone")]];
    var ml=meths.map(function(m){ return '<div class="ptm">'+m[0]+' '+esc(m[1])+' <em>'+esc(T("준비 중","coming soon"))+'</em></div>'; }).join("");
    b.innerHTML='<div class="in"><b>'+esc(T("이용권","Pass"))+'</b><div class="ptopts">'+opts+'</div>'
      +'<div class="ptmlbl">'+esc(T("결제수단","Payment method"))+'</div>'+ml
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button type="button" class="g" id="ptC">'+esc(T("닫기","Close"))+'</button><button type="button" id="ptGo">'+esc(T("결제하기(테스트)","Pay (test)"))+'</button></div></div>';
    b.onclick=function(e){ if(e.target===b) b.remove(); }; document.body.appendChild(b);
    document.getElementById("ptC").onclick=function(){ b.remove(); };
    document.getElementById("ptGo").onclick=function(){ var r=b.querySelector('input[name="ptplan"]:checked'); buyPass(r?+r.value:PLANS[0].d); }; }
  // ── 전체 화면 벽 (옵션 나) — 뒤는 못 쓴다
  function wall(){ if(active) return; pcss(); if(document.getElementById("pwWall")) return;
    var rows=PLANS.map(function(p){ return '<div class="ptrow"><span>'+esc(dlabel(p.d))+'</span><span>₩'+p.w+' <small>($'+p.u+')</small></span></div>'; }).join("");
    var w=document.createElement("div"); w.id="pwWall";
    w.innerHTML='<div class="pwIn"><div class="pwLogo">🧩</div><b>'+esc(T("무료 체험이 끝났어요","Your free trial has ended"))+'</b>'
      +'<div class="m">'+esc(T("이용권을 구매하시면 계속 이용하실 수 있어요.","Buy a pass to keep using the app."))+'</div>'
      +'<div>'+rows+'</div><button type="button" id="pwBuy"><img src="img/menu/mi_pay.png" style="width:20px;height:20px;object-fit:contain;vertical-align:-4px;margin-right:6px" alt="">'+esc(T("결제","Pay"))+'</button></div>';
    document.body.appendChild(w); document.getElementById("pwBuy").onclick=payModal; }
  // ── QR 라이브러리(그 자리에서 그린다 — 밖으로 안 보냄)
  function loadQR(cb){ if(window.QRCode){ cb(true); return; } var s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; s.onload=function(){ cb(!!window.QRCode); }; s.onerror=function(){ cb(false); }; document.head.appendChild(s); }
  // ── 기기 추가 (QR + 링크 + 복사/공유)
  function addDevice(){ var t=tok(); if(!t){ toast(T("먼저 이용권을 받아 주세요","Get a pass first")); return; }
    var link="https://navi.moneypuzzle.co.kr/?pass="+t; css(); pcss();
    var b=document.getElementById("psBox"); if(b) b.remove(); b=document.createElement("div"); b.id="psBox";
    b.innerHTML='<div class="in"><b>'+esc(T("기기 추가","Add a device"))+'</b>'
      +'<div class="m">'+esc(T("이 링크를 다른 기기에서 열면 그 기기에서도 이용권을 쓸 수 있어요 (최대 2대).","Open this link on another device to use the pass there too (up to 2 devices)."))+'</div>'
      +'<div id="ptQR" style="display:flex;justify-content:center;align-items:center;margin:12px auto;min-height:150px"></div>'
      +'<div class="ptlink" id="ptLink"></div>'
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button type="button" class="g" id="ptCopy">'+esc(T("복사","Copy"))+'</button><button type="button" id="ptShare">'+esc(T("공유","Share"))+'</button><button type="button" class="g" id="ptX">'+esc(T("닫기","Close"))+'</button></div></div>';
    b.onclick=function(e){ if(e.target===b) b.remove(); }; document.body.appendChild(b);
    document.getElementById("ptLink").textContent=link;
    document.getElementById("ptX").onclick=function(){ b.remove(); };
    document.getElementById("ptCopy").onclick=function(){ copy(link); };
    var sh=document.getElementById("ptShare");
    sh.onclick=navigator.share?function(){ try{ navigator.share({title:"Money Puzzle Tour for Korea",text:T("머니퍼즐 투어 이용권","Money Puzzle Tour pass"),url:link}).catch(function(){}); }catch(e){ copy(link); } }:function(){ copy(link); };
    loadQR(function(okq){ var q=document.getElementById("ptQR"); if(!q) return; if(okq&&window.QRCode){ try{ q.innerHTML=""; new window.QRCode(q,{text:link,width:150,height:150,correctLevel:window.QRCode.CorrectLevel.M}); return; }catch(e){} } q.textContent=T("(QR 준비 실패 — 링크를 복사해 주세요)","(QR unavailable — please copy the link)"); }); }
  // ═══════════ 건별 소액 모델 (사장님 10-23 밤) ═══════════
  function mmAdd(id,fn){ var mm=document.getElementById("mm"); if(!mm) return null; var a=document.getElementById(id);
    if(!a){ mm.insertAdjacentHTML("afterbegin",'<a href="#" id="'+id+'" class="mi"></a>'); a=document.getElementById(id); a.onclick=function(e){ e.preventDefault(); mm.hidden=true; fn(); }; } return a; }
  function L6(o){ return o[LANG]||o.en; }   // 이 블록 새 문구는 6개 언어를 바로 넣는다(i18n.js 안 건드림)
  var CRED=0;   // 통역·길안내 남은 횟수 (허브 기준, 화면 표시용)
  var PLAN={item:"plan",title:{ko:"AI 여행 플래너",en:"AI travel planner",ja:"AI旅行プランナー",zhs:"AI行程规划",zht:"AI行程規劃",es:"Planificador de viaje IA"},sub:{ko:"1건 실행",en:"1 use",ja:"1件",zhs:"1次",zht:"1次",es:"1 uso"},w:"1,000",u:"0.79"};
  var INTERP={item:"interp",title:{ko:"통역·길안내",en:"Interpreter & directions",ja:"通訳・道案内",zhs:"翻译·路线",zht:"翻譯·路線",es:"Intérprete y rutas"},sub:{ko:"10회 묶음",en:"10-use pack",ja:"10回パック",zhs:"10次套餐",zht:"10次套餐",es:"Paquete de 10 usos"},w:"1,000",u:"0.79"};
  // ── 건별 결제창: 한 가지 항목 + 결제수단(자리만, 회색) + 가짜 승인. onOk(j)=승인, onCancel()=닫기
  function payMicro(cfg,onOk,onCancel){ css(); pcss(); var done=false; var fin=function(v,j){ if(done) return; done=true; var x=document.getElementById("psBox"); if(x) x.remove(); if(v){ if(onOk) onOk(j); } else if(onCancel) onCancel(); };
    var b=document.getElementById("psBox"); if(b) b.remove(); b=document.createElement("div"); b.id="psBox";
    var meths=[['<img src="img/menu/mi_pay.png" style="width:20px;height:20px;object-fit:contain;vertical-align:-4px" alt="">',T("카드","Card")],["🅿","PayPal"],["📲",T("간편결제","Easy pay")],["📱",T("휴대폰에 카드를 대세요","Tap your card to your phone")]];
    var ml=meths.map(function(m){ return '<div class="ptm">'+m[0]+' '+esc(m[1])+' <em>'+esc(T("준비 중","coming soon"))+'</em></div>'; }).join("");
    b.innerHTML='<div class="in"><b>'+esc(L6(cfg.title))+'</b>'
      +'<div class="ptitem"><span class="pts">'+esc(L6(cfg.sub))+'</span><span class="ptpr">₩'+cfg.w+' <small>($'+cfg.u+')</small></span></div>'
      +'<div class="ptmlbl">'+esc(T("결제수단","Payment method"))+'</div>'+ml
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button type="button" class="g" id="ptC">'+esc(T("닫기","Close"))+'</button><button type="button" id="ptGo">'+esc(T("결제하기(테스트)","Pay (test)"))+'</button></div></div>';
    b.onclick=function(e){ if(e.target===b) fin(false); }; document.body.appendChild(b);
    document.getElementById("ptC").onclick=function(){ fin(false); };
    document.getElementById("ptGo").onclick=function(){ var g=document.getElementById("ptGo"); if(g) g.disabled=true;
      hub("/npass/pay",{item:cfg.item,pd:dev(),test:1}).then(function(j){ if(j&&j.ok) fin(true,j); else { if(g) g.disabled=false; toast(T("결제(테스트)에 실패했어요","Test payment failed")); } })
      .catch(function(){ if(g) g.disabled=false; toast(T("결제(테스트)에 실패했어요","Test payment failed")); }); }; }
  // ── AI 플래너 건별: 결제창 띄우고 승인 여부를 Promise 로 (fetch 게이트가 쓴다)
  function planGate(){ return new Promise(function(res){ payMicro(PLAN,function(){ res(true); },function(){ res(false); }); }); }
  // ── fetch 가로채기: /nreco(추천받기)·/ntrip(여행 일정) 은 보내기 전에 1,000원 결제창. 취소하면 {ok:false} 로 돌려 앱이 조용히 멈춘다
  var fPrev=window.fetch;
  window.fetch=function(u,o){ try{ var s=typeof u==="string"?u:(u&&u.url)||"";
      if(s.indexOf(HUB)===0&&/\/(nreco|ntrip)(\?|$)/.test(s)&&o&&o.body){ var self=this,args=arguments;
        return planGate().then(function(ok){ return ok?fPrev.apply(self,args):new Response(JSON.stringify({ok:false,err:"cancel"}),{headers:{"Content-Type":"application/json"}}); }); } }catch(e){}
    return fPrev.apply(this,arguments); };
  // ── 통역·길안내 크레딧
  function openInterp(){ try{ if(window.ITP&&ITP.open) ITP.open(); }catch(e){} }
  function creditSet(n){ CRED=n|0; tmenu(); }
  function usedToast(n){ return L6({ko:"통역·길안내 1회 사용 · 남은 "+n+"회",en:"Interpreter & directions: 1 used · "+n+" left",ja:"通訳・道案内 1回使用 · 残り"+n+"回",zhs:"翻译·路线 使用1次 · 剩余"+n+"次",zht:"翻譯·路線 使用1次 · 剩餘"+n+"次",es:"Intérprete y rutas: 1 usado · "+n+" restantes"}); }
  function addToast(n){ return L6({ko:"통역·길안내 10회가 들어왔어요 · 남은 "+n+"회",en:"10 uses added · "+n+" left",ja:"通訳・道案内10回を追加 · 残り"+n+"回",zhs:"已添加10次 · 剩余"+n+"次",zht:"已新增10次 · 剩餘"+n+"次",es:"10 usos añadidos · "+n+" restantes"}); }
  function buyInterp(after){ payMicro(INTERP,function(j){ var n=j&&j.left!=null?j.left:CRED+10; creditSet(n); toast(addToast(n)); if(after) after(); },function(){}); }
  // 🗣 통역 단추 누름을 가로챈다(interp.js 는 안 고침) — 크레딧 있으면 1 차감 후 열고, 없으면 10회 묶음 결제창
  document.addEventListener("click",function(e){ var t=e.target&&e.target.closest&&e.target.closest("#itP"); if(!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    hub("/npass/usecredit",{pd:dev()}).then(function(j){
      if(j&&j.used){ creditSet(j.left); toast(usedToast(j.left)); openInterp(); }
      else buyInterp(function(){ hub("/npass/usecredit",{pd:dev()}).then(function(k){ creditSet(k&&k.left!=null?k.left:CRED-1); openInterp(); }).catch(openInterp); }); })
    .catch(function(){ openInterp(); }); },true);   // 허브 실패 시 막지 않는다
  // ── ⋮ 메뉴: 통역·길안내 남은 횟수 (누르면 10회 더 사기)
  function tmenu(){ var a=mmAdd("mcred",function(){ buyInterp(); });
    if(a) a.innerHTML='<img class="miic" src="img/menu/mi_guide.png" alt="">'+esc(L6({ko:"통역·길안내 (남은 "+CRED+"회)",en:"Interpreter & directions ("+CRED+" left)",ja:"通訳・道案内（残り"+CRED+"回）",zhs:"翻译·路线（剩余"+CRED+"次）",zht:"翻譯·路線（剩餘"+CRED+"次）",es:"Intérprete y rutas ("+CRED+" restantes)"})); }
  function loadCredit(){ hub("/npass/credit",{pd:dev()}).then(function(j){ CRED=j&&j.left!=null?j.left:0; tmenu(); }).catch(function(){ tmenu(); }); }
  // 언어 바꾸면 메뉴 글자도 다시
  var sl1=window.setLang; if(typeof sl1==="function") window.setLang=function(){ var r=sl1.apply(this,arguments); try{ tmenu(); }catch(e){} return r; };
  try{ loadCredit(); }catch(e){}
})();
})();
