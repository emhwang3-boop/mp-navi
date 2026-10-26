/* 머니퍼즐 투어 — 구글 로그인 + 내 퍼즐골드(Puzzle Gold, PG) (사장님 2026-10-26)
 *  · ⋮ 메뉴 「로그인 / 내 퍼즐골드」 → 창: 로그인 전 = 「Google로 로그인」 단추(Google Identity Services) · 로그인 뒤 = 잔액·만료 예정·내역·남은 수상 횟수·졸업
 *  · 클라이언트 ID 는 허브 GOOGLE_CLIENT_ID 한 곳(wrangler.toml) — /npg/cfg 로 읽는다. 비어 있으면 단추 「준비 중」
 *  · 받은 ID 토큰은 허브 /npg/login 이 구글 서명까지 검사 → 허브 세션(30일)만 이 브라우저(mpv_pg_sess)에 둔다. 구글 토큰은 저장 안 함
 *  · 기기 번호 = 앱이 이미 쓰는 mpv_dev (같은 기기 다른 계정 수상 경고용) · 사장님 기기(mp_owner)는 own=1 → MIS 합계에서 빠진다
 *  · PG 는 무료 상으로만 — 충전·구매 화면 없음. 이벤트 자체는 아직 없음
 */
(function(){
"use strict";
var PH=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
var PG_CID="778127744827-qp5b6m9pnlq2tp38b7b39ghmked0t8mc.apps.googleusercontent.com";   /* 구글 OAuth 클라이언트 ID(웹) — 허브 wrangler.toml GOOGLE_CLIENT_ID 와 같은 값. 허브 값이 우선, 허브가 비면 이 값 */
var W={
 menu:{ko:"로그인 / 내 퍼즐골드",en:"Sign in / My Puzzle Gold",ja:"ログイン / マイパズルゴールド",zhs:"登录 / 我的 Puzzle Gold",zht:"登入 / 我的 Puzzle Gold",es:"Iniciar sesión / Mi Puzzle Gold"},
 menuIn:{ko:"내 퍼즐골드",en:"My Puzzle Gold",ja:"マイパズルゴールド",zhs:"我的 Puzzle Gold",zht:"我的 Puzzle Gold",es:"Mi Puzzle Gold"},
 title:{ko:"내 퍼즐골드",en:"My Puzzle Gold",ja:"マイパズルゴールド",zhs:"我的 Puzzle Gold",zht:"我的 Puzzle Gold",es:"Mi Puzzle Gold"},
 intro:{ko:"퍼즐골드(PG)는 매주 이벤트 상으로 드리는 앱 전용 포인트입니다. 1등 100 PG · 2등 50 PG · 3등 20 PG. 받은 날부터 1년 동안 이 앱의 유료 결제에만 쓸 수 있으며, 현금으로 바꾸거나 환불되지 않습니다. 상은 한 사람이 3번까지 받을 수 있습니다(3번이면 졸업).",
  en:"Puzzle Gold (PG) is an in-app point awarded as weekly event prizes: 1st 100 PG · 2nd 50 PG · 3rd 20 PG. It can be used only for paid services in this app for 1 year from the day you receive it, and cannot be exchanged for cash or refunded. One person can win up to 3 times (after 3 wins you graduate).",
  ja:"パズルゴールド（PG）は毎週のイベント賞品として差し上げるアプリ専用ポイントです。1位 100 PG・2位 50 PG・3位 20 PG。受け取った日から1年間、このアプリの有料決済にのみ使え、現金への交換や払い戻しはできません。受賞は1人3回まで（3回で卒業）です。",
  zhs:"Puzzle Gold（PG）是每周活动奖品发放的应用专用积分：第1名 100 PG · 第2名 50 PG · 第3名 20 PG。自获得之日起1年内仅可用于本应用的付费服务，不可兑换现金或退款。每人最多可获奖3次（满3次即毕业）。",
  zht:"Puzzle Gold（PG）是每週活動獎品發放的應用程式專用點數：第1名 100 PG · 第2名 50 PG · 第3名 20 PG。自取得之日起1年內僅可用於本應用程式的付費服務，不可兌換現金或退款。每人最多可得獎3次（滿3次即畢業）。",
  es:"Puzzle Gold (PG) es un punto de la app que se entrega como premio de los eventos semanales: 1.º 100 PG · 2.º 50 PG · 3.º 20 PG. Solo se puede usar para pagos dentro de esta app durante 1 año desde que lo recibe, y no se puede canjear por dinero ni reembolsar. Cada persona puede ganar hasta 3 veces (con 3 premios se gradúa)."},
 ask:{ko:"구글 계정으로 로그인하면 받은 퍼즐골드를 확인할 수 있습니다.",en:"Sign in with your Google account to see the Puzzle Gold you have won.",ja:"Googleアカウントでログインすると、受け取ったパズルゴールドを確認できます。",zhs:"使用Google账号登录即可查看您获得的 Puzzle Gold。",zht:"使用Google帳號登入即可查看您獲得的 Puzzle Gold。",es:"Inicie sesión con su cuenta de Google para ver el Puzzle Gold que ha ganado."},
 prep:{ko:"Google로 로그인 (준비 중)",en:"Sign in with Google (coming soon)",ja:"Googleでログイン（準備中）",zhs:"使用Google登录（准备中）",zht:"使用Google登入（準備中）",es:"Iniciar sesión con Google (próximamente)"},
 prepNote:{ko:"로그인 기능을 준비하고 있습니다. 곧 열립니다.",en:"Sign-in is being prepared and will open soon.",ja:"ログイン機能を準備中です。まもなく開始します。",zhs:"登录功能正在准备中，即将开放。",zht:"登入功能正在準備中，即將開放。",es:"El inicio de sesión se está preparando y abrirá pronto."},
 priv:{ko:"로그인하면 이름·이메일·구글 계정 식별값을 퍼즐골드 관리·부정 참여 방지 목적으로 보관하며, 마지막 이용 후 1년 뒤 삭제합니다.",en:"When you sign in, we keep your name, email and Google account identifier to manage Puzzle Gold and prevent fraudulent participation, and delete them 1 year after your last use.",ja:"ログインすると、氏名・メールアドレス・Googleアカウント識別子をパズルゴールドの管理・不正参加防止のために保管し、最終利用から1年後に削除します。",zhs:"登录后，我们会为管理 Puzzle Gold 及防止违规参与保存您的姓名、电子邮箱和Google账号标识，并在最后一次使用1年后删除。",zht:"登入後，我們會為管理 Puzzle Gold 及防止不當參與保存您的姓名、電子郵件和Google帳號識別碼，並在最後一次使用1年後刪除。",es:"Al iniciar sesión guardamos su nombre, correo e identificador de Google para gestionar Puzzle Gold y prevenir la participación fraudulenta, y los eliminamos 1 año después de su último uso."},
 privLink:{ko:"개인정보 처리방침",en:"Privacy Policy",ja:"個人情報処理方針",zhs:"隐私政策",zht:"隱私政策",es:"Política de Privacidad"},
 bal:{ko:"잔액",en:"Balance",ja:"残高",zhs:"余额",zht:"餘額",es:"Saldo"},
 soon:{ko:"만료 예정",en:"Expiring",ja:"有効期限",zhs:"即将到期",zht:"即將到期",es:"Vencimientos"},
 hist:{ko:"내역",en:"History",ja:"履歴",zhs:"记录",zht:"紀錄",es:"Historial"},
 left:{ko:"남은 수상 가능 횟수",en:"Wins remaining",ja:"残りの受賞可能回数",zhs:"剩余可获奖次数",zht:"剩餘可得獎次數",es:"Premios restantes"},
 times:{ko:"회",en:"",ja:"回",zhs:"次",zht:"次",es:""},
 grad:{ko:"졸업 — 상을 3번 받아 이벤트 참가가 끝났습니다. 남은 PG는 만료일까지 쓸 수 있습니다.",en:"Graduated — you have won 3 times, so your event participation has ended. Your remaining PG can be used until it expires.",ja:"卒業 — 3回受賞したため、イベント参加は終了しました。残りのPGは有効期限まで使えます。",zhs:"已毕业 — 您已获奖3次，活动参与资格结束。剩余PG可在到期前使用。",zht:"已畢業 — 您已得獎3次，活動參與資格結束。剩餘PG可在到期前使用。",es:"Graduado — ha ganado 3 veces, por lo que su participación en los eventos ha terminado. Puede usar su PG restante hasta que venza."},
 none:{ko:"아직 내역이 없습니다.",en:"No history yet.",ja:"まだ履歴はありません。",zhs:"暂无记录。",zht:"尚無紀錄。",es:"Aún no hay historial."},
 got:{ko:"받음",en:"Won",ja:"受取",zhs:"获得",zht:"獲得",es:"Ganado"},
 used:{ko:"사용",en:"Used",ja:"使用",zhs:"使用",zht:"使用",es:"Usado"},
 gone:{ko:"소멸",en:"Expired",ja:"失効",zhs:"已失效",zht:"已失效",es:"Vencido"},
 rank:{ko:"{n}등",en:"#{n}",ja:"{n}位",zhs:"第{n}名",zht:"第{n}名",es:"{n}.º"},
 until:{ko:"{d}까지",en:"until {d}",ja:"{d}まで",zhs:"至 {d}",zht:"至 {d}",es:"hasta {d}"},
 logout:{ko:"로그아웃",en:"Sign out",ja:"ログアウト",zhs:"退出登录",zht:"登出",es:"Cerrar sesión"},
 close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 err:{ko:"불러오지 못했습니다. 잠시 뒤 다시 해 주세요.",en:"Could not load. Please try again shortly.",ja:"読み込めませんでした。しばらくしてからもう一度お試しください。",zhs:"无法加载，请稍后再试。",zht:"無法載入，請稍後再試。",es:"No se pudo cargar. Inténtelo de nuevo en un momento."},
 lerr:{ko:"로그인하지 못했습니다. 다시 해 주세요.",en:"Sign-in failed. Please try again.",ja:"ログインできませんでした。もう一度お試しください。",zhs:"登录失败，请重试。",zht:"登入失敗，請重試。",es:"No se pudo iniciar sesión. Inténtelo de nuevo."},
 sess:{ko:"로그인이 끝났습니다. 다시 로그인해 주세요.",en:"Your session has ended. Please sign in again.",ja:"ログインの有効期限が切れました。もう一度ログインしてください。",zhs:"登录已过期，请重新登录。",zht:"登入已過期，請重新登入。",es:"Su sesión ha terminado. Vuelva a iniciar sesión."}
};
function lg(){ return window.LANG||"ko"; }
function t(k,v){ var o=W[k]||{}, s=o[lg()]; if(s==null) s=o.en||""; if(v) for(var x in v) s=s.split("{"+x+"}").join(v[x]); return s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function day(ms){ return new Date(ms+9*3600e3).toISOString().slice(0,10); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function dev(){ var d=ls("mpv_dev"); if(!/^[0-9a-f]{16,32}$/.test(d||"")){ d=Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(12)),function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); ls("mpv_dev",d); } return d; }
function post(path,b){ return fetch(PH+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),cache:"no-store"}).then(function(r){ return r.json(); }); }
var CFG=null;
function cfg(){ if(CFG) return Promise.resolve(CFG); return fetch(PH+"/npg/cfg",{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ CFG=j||{}; return CFG; }).catch(function(){ return {cid:""}; }); }
function css(){ if(document.getElementById("pgCss")) return; var s=document.createElement("style"); s.id="pgCss";
  s.textContent="#pgBox{position:fixed;inset:0;z-index:1040;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}#pgBox[hidden]{display:none}"
  +"#pgIn{background:var(--card);color:var(--ink);width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:16px 16px 26px;max-height:88vh;overflow:auto;box-sizing:border-box}"
  +"#pgIn h3{margin:0 0 8px;font-size:18px;display:flex;align-items:center;gap:8px}#pgIn h3 img{height:22px;width:22px}#pgIn .pgx{margin-left:auto;border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer}"
  +"#pgIn .pgp{color:var(--sub);font-size:13px;line-height:1.55;margin:8px 0}#pgIn .pgbal{background:linear-gradient(135deg,#ffe8a3,#f7c948);color:#4a3500;border-radius:14px;padding:14px;margin:10px 0}"
  +"#pgIn .pgbal b{display:block;font-size:30px;line-height:1.1}#pgIn .pgbal span{font-size:13px}#pgIn .pgrow{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}"
  +"#pgIn .pgrow small{color:var(--sub)}#pgIn .pgsec{font-weight:700;margin:14px 0 4px;font-size:14px}#pgIn .pggrad{background:#e7f5ff;color:#1c4f7a;border-radius:10px;padding:10px;font-size:13px;margin:8px 0}"
  +":root[data-theme=dark] #pgIn .pggrad{background:#1b2b3d;color:#a5d8ff}#pgIn .pgbtn{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 16px;font-size:14px;cursor:pointer}"
  +"#pgIn .pgbtn[disabled]{opacity:.6;cursor:default}#pgIn .pgplus{color:#2b8a3e;font-weight:700}#pgIn .pgminus{color:#c92a2a;font-weight:700}#pgIn .pgdim{color:var(--sub)}#pgGbtn{margin:12px 0;min-height:44px}";
  document.head.appendChild(s); }
function box(){ var b=document.getElementById("pgBox"); if(b) return b; css(); b=document.createElement("div"); b.id="pgBox"; b.hidden=true; b.innerHTML='<div id="pgIn"></div>';
  b.addEventListener("click",function(e){ if(e.target===b) close(); var a=e.target.closest&&e.target.closest("[data-pg]"); if(!a) return; var k=a.dataset.pg; if(k==="x") close(); else if(k==="out") logout(); });
  document.body.appendChild(b); return b; }
function head(){ return '<h3><img src="img/menu/mi_star.png" alt="">'+esc(t("title"))+'<button type="button" class="pgx" data-pg="x">'+esc(t("close"))+' ✕</button></h3>'; }
function privHtml(){ return '<div class="pgp">'+esc(t("priv"))+' <a href="privacy.html?lang='+esc(lg())+'" target="_blank" rel="noopener">'+esc(t("privLink"))+'</a></div>'; }
function close(){ var b=document.getElementById("pgBox"); if(b) b.hidden=true; }
var GIS=null;
function gisLoad(){ if(window.google&&google.accounts&&google.accounts.id) return Promise.resolve(); if(GIS) return GIS;
  GIS=new Promise(function(ok,no){ var s=document.createElement("script"); s.src="https://accounts.google.com/gsi/client"; s.async=true; s.onload=ok; s.onerror=function(){ GIS=null; no(); }; document.head.appendChild(s); }); return GIS; }
var GLOC={ko:"ko",en:"en",ja:"ja",zhs:"zh_CN",zht:"zh_TW",es:"es"};
function paintLogin(msg){ var I=document.getElementById("pgIn");
  I.innerHTML=head()+'<div class="pgp">'+esc(t("intro"))+'</div><div class="pgp" style="color:var(--ink)">'+esc(t("ask"))+'</div>'+(msg?'<div class="pgp" style="color:#c92a2a">'+esc(msg)+'</div>':'')
    +'<div id="pgGbtn"><button type="button" class="pgbtn" disabled>'+esc(t("load"))+'</button></div>'+privHtml();
  cfg().then(function(c){ var g=document.getElementById("pgGbtn"); if(!g) return; c={cid:(c&&c.cid)||PG_CID};
    if(!c||!c.cid){ g.innerHTML='<button type="button" class="pgbtn" id="pgPrep" disabled><img src="img/menu/mi_globe.png" alt="" style="height:16px;width:16px;vertical-align:-3px;margin-right:6px">'+esc(t("prep"))+'</button><div class="pgp">'+esc(t("prepNote"))+'</div>'; return; }
    gisLoad().then(function(){ var g2=document.getElementById("pgGbtn"); if(!g2) return; g2.innerHTML="";
      google.accounts.id.initialize({client_id:c.cid,callback:onCred,auto_select:false,cancel_on_tap_outside:true,ux_mode:"popup"});
      google.accounts.id.renderButton(g2,{type:"standard",theme:document.documentElement.getAttribute("data-theme")==="dark"?"filled_black":"outline",size:"large",text:"signin_with",shape:"pill",locale:GLOC[lg()]||"en"});
    }).catch(function(){ var g3=document.getElementById("pgGbtn"); if(g3) g3.innerHTML='<div class="pgp" style="color:#c92a2a">'+esc(t("err"))+'</div>'; }); }); }
function onCred(r){ var I=document.getElementById("pgIn"); if(I) I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  var own=0; try{ own=localStorage.getItem("mp_owner")?1:0; }catch(e){}
  post("/npg/login",{cred:r&&r.credential,dev:dev(),own:own}).then(function(j){ if(!j||!j.ok||!j.sess){ paintLogin(t("lerr")); return; } ls("mpv_pg_sess",j.sess); paintMe(j.me); menuPaint(); })
    .catch(function(){ paintLogin(t("lerr")); }); }
function logout(){ ls("mpv_pg_sess",null); try{ if(window.google&&google.accounts&&google.accounts.id) google.accounts.id.disableAutoSelect(); }catch(e){} menuPaint(); paintLogin(); }
function paintMe(m){ var I=document.getElementById("pgIn"); if(!I||!m) return;
  var h=head()+'<div class="pgp" style="color:var(--ink)">'+esc(m.name||"")+(m.email?' <span class="pgdim">· '+esc(m.email)+'</span>':'')+'</div>'
    +'<div class="pgbal"><span>'+esc(t("bal"))+'</span><b>'+(m.bal||0).toLocaleString()+' PG</b></div>';
  h+= m.grad?'<div class="pggrad">'+esc(t("grad"))+'</div>':'<div class="pgrow"><span>'+esc(t("left"))+'</span><b>'+m.left+(t("times")?' '+esc(t("times")):'')+' / 3</b></div>';
  if(m.soon&&m.soon.length){ h+='<div class="pgsec">'+esc(t("soon"))+'</div>'; m.soon.forEach(function(s){ h+='<div class="pgrow"><span>'+s.amt.toLocaleString()+' PG</span><small>'+esc(t("until",{d:day(s.exp)}))+'</small></div>'; }); }
  h+='<div class="pgsec">'+esc(t("hist"))+'</div>';
  if(!m.hist||!m.hist.length) h+='<div class="pgp">'+esc(t("none"))+'</div>';
  else m.hist.forEach(function(x){
    if(x.t==="g") h+='<div class="pgrow"><span>'+esc(day(x.at))+' · '+esc(x.ev||"")+' · '+esc(t("rank",{n:x.rk}))+'<br><small>'+(x.st==="exp"?esc(t("gone")):esc(t("until",{d:day(x.exp)})))+'</small></span><span class="'+(x.st==="exp"?"pgdim":"pgplus")+'">+'+x.amt+' PG<br><small>'+esc(x.st==="exp"?t("gone"):t("got"))+'</small></span></div>';
    else h+='<div class="pgrow"><span>'+esc(day(x.at))+(x.memo?' · '+esc(x.memo):'')+'</span><span class="pgminus">−'+x.amt+' PG<br><small>'+esc(t("used"))+'</small></span></div>'; });
  h+='<div class="pgp" style="margin-top:12px">'+esc(t("intro"))+'</div>'+privHtml()+'<div style="margin-top:10px"><button type="button" class="pgbtn" data-pg="out">'+esc(t("logout"))+'</button></div>';
  I.innerHTML=h; }
function open(){ var b=box(); b.hidden=false; var s=ls("mpv_pg_sess"), I=document.getElementById("pgIn");
  if(!s){ paintLogin(); return; }
  I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  post("/npg/me",{sess:s}).then(function(j){ if(j&&j.ok){ paintMe(j.me); return; } if(j&&j.err==="sess"){ ls("mpv_pg_sess",null); menuPaint(); paintLogin(t("sess")); return; } I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; })
    .catch(function(){ I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; }); }
function menuPaint(){ var mm=document.getElementById("mm"); if(!mm) return; var a=document.getElementById("mpg");
  if(!a){ a=document.createElement("a"); a.id="mpg"; a.href="#"; a.className="mi"; a.onclick=function(e){ e.preventDefault(); try{ document.getElementById("mm").hidden=true; }catch(x){} open(); }; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
  a.innerHTML='<img class="miic" src="img/menu/mi_star.png" alt="">'+esc(ls("mpv_pg_sess")?t("menuIn"):t("menu")); }
var f=window.setLang; if(typeof f==="function"&&!f._pg){ var g=function(){ var r=f.apply(this,arguments); try{ menuPaint(); var b=document.getElementById("pgBox"); if(b&&!b.hidden) open(); }catch(e){} return r; }; g._pg=1; g._tr=f._tr; window.setLang=g; }
menuPaint();
window.mpPG={open:open,close:close};
if(/[?&]pg=1(?![0-9a-z])/i.test(location.search)) setTimeout(open,400);
})();
