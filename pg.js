/* 머니퍼즐 투어 — 구글·애플 로그인 + 내 배지 (사장님 2026-10-26, 10-27 배지 창)
 *  · ⋮ 메뉴 「내 ★배지」(★ = img/rank/star.webp, 10-27 퍼즐골드 창 대체) → 창: 로그인 전 = 구글·애플 로그인 단추 · 로그인 뒤 = 별·큰 별·작은 태양·큰 태양·매일 빙고 1등·주간 1·2·3등·졸업/명예의 전당
 *  · 클라이언트 ID 는 허브 GOOGLE_CLIENT_ID 한 곳(wrangler.toml) — /npg/cfg 로 읽는다. 비어 있으면 단추 「준비 중」
 *  · 받은 ID 토큰은 허브 /npg/login 이 구글 서명까지 검사 → 허브 세션(30일)만 이 브라우저(mpv_pg_sess)에 둔다. 구글 토큰은 저장 안 함
 *  · 기기 번호 = 앱이 이미 쓰는 mpv_dev (같은 기기 다른 계정 수상 경고용) · 사장님 기기(mp_owner)는 own=1 → MIS 합계에서 빠진다
 */
(function(){
"use strict";
var PH=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
var PG_CID="778127744827-qp5b6m9pnlq2tp38b7b39ghmked0t8mc.apps.googleusercontent.com";   /* 구글 OAuth 클라이언트 ID(웹) — 허브 wrangler.toml GOOGLE_CLIENT_ID 와 같은 값. 허브 값이 우선, 허브가 비면 이 값 */
var W={
 badge:{ko:"내 {s} 배지",en:"My {s} badges",ja:"マイ{s}バッジ",zhs:"我的{s}徽章",zht:"我的{s}徽章",es:"Mis {s} insignias"},
 intro:{ko:"매일 빙고(그날)와 이번 주 이벤트의 1등은 별 배지를 하나 받습니다. 별 10개는 큰 별, 큰 별 10개는 작은 태양, 작은 태양 10개는 큰 태양이 됩니다. 이번 주 이벤트 1·2·3등 또는 매일 빙고 주간 점수 1·2·3등에 3번 오르면 졸업하고 명예의 전당에 오릅니다.",
  en:"The 1st place of each Daily Bingo day and of each weekly event gets one star badge. 10 stars become a big star, 10 big stars a small sun, and 10 small suns a big sun. Finish in the top 3 three times (weekly event 1st–3rd or Daily Bingo weekly points 1st–3rd) and you graduate into the Hall of Fame.",
  ja:"毎日ビンゴ（その日）と今週のイベントの1位は星バッジを1つもらえます。星10個で大きな星、大きな星10個で小さな太陽、小さな太陽10個で大きな太陽になります。今週のイベント1・2・3位、または毎日ビンゴの週間ポイント1・2・3位に3回入ると卒業し、殿堂入りします。",
  zhs:"每日宾果（当天）和本周活动的第1名获得一枚星星徽章。10颗星变成大星星，10颗大星星变成小太阳，10个小太阳变成大太阳。在本周活动第1·2·3名或每日宾果周积分第1·2·3名中累计进入3次即毕业，并进入名人堂。",
  zht:"每日賓果（當天）和本週活動的第1名獲得一枚星星徽章。10顆星變成大星星，10顆大星星變成小太陽，10個小太陽變成大太陽。在本週活動第1·2·3名或每日賓果週積分第1·2·3名中累計進入3次即畢業，並進入名人堂。",
  es:"El 1.º de cada día del Bingo diario y de cada evento semanal recibe una insignia de estrella. 10 estrellas forman una estrella grande, 10 estrellas grandes un sol pequeño y 10 soles pequeños un sol grande. Si quedas entre los 3 primeros tres veces (1.º–3.º del evento semanal o de los puntos semanales del Bingo diario), te gradúas y entras en el Salón de la Fama."},
 ask:{ko:"구글 또는 애플 계정으로 로그인하면 내 배지와 이벤트 기록을 볼 수 있습니다.",en:"Sign in with your Google or Apple account to see your badges and event record.",ja:"GoogleまたはAppleアカウントでログインすると、自分のバッジとイベント記録を確認できます。",zhs:"使用Google或Apple账号登录即可查看您的徽章和活动记录。",zht:"使用Google或Apple帳號登入即可查看您的徽章和活動紀錄。",es:"Inicie sesión con su cuenta de Google o Apple para ver sus insignias y su historial de eventos."},
 priv:{ko:"로그인하면 이름·이메일·구글 또는 애플 계정 식별값을 이벤트 순위·배지 표시(아이디 일부 가림)와 부정 참여 방지 목적으로 보관하며, 마지막 이용 후 1년 뒤 삭제합니다.",en:"When you sign in, we keep your name, email and Google or Apple account identifier to show event rankings and badges (with your ID partly hidden) and prevent fraudulent participation, and delete them 1 year after your last use.",ja:"ログインすると、氏名・メールアドレス・GoogleまたはAppleアカウント識別子をイベントの順位・バッジ表示（IDの一部を隠して表示）と不正参加防止のために保管し、最終利用から1年後に削除します。",zhs:"登录后，我们会为显示活动排名和徽章（账号部分隐藏）及防止违规参与保存您的姓名、电子邮箱和Google或Apple账号标识，并在最后一次使用1年后删除。",zht:"登入後，我們會為顯示活動排名和徽章（帳號部分隱藏）及防止不當參與保存您的姓名、電子郵件和Google或Apple帳號識別碼，並在最後一次使用1年後刪除。",es:"Al iniciar sesión guardamos su nombre, correo e identificador de Google o Apple para mostrar la clasificación y las insignias de los eventos (con su ID parcialmente oculto) y prevenir la participación fraudulenta, y los eliminamos 1 año después de su último uso."},
 star:{ko:"별",en:"Star",ja:"星",zhs:"星星",zht:"星星",es:"Estrella"},
 bigstar:{ko:"큰 별",en:"Big star",ja:"大きな星",zhs:"大星星",zht:"大星星",es:"Estrella grande"},
 sun:{ko:"작은 태양",en:"Small sun",ja:"小さな太陽",zhs:"小太阳",zht:"小太陽",es:"Sol pequeño"},
 bigsun:{ko:"큰 태양",en:"Big sun",ja:"大きな太陽",zhs:"大太阳",zht:"大太陽",es:"Sol grande"},
 bEv:{ko:"이벤트",en:"Events",ja:"イベント",zhs:"活动",zht:"活動",es:"Eventos"},
 bKo:{ko:"한국인 판",en:"Korean board",ja:"韓国人ボード",zhs:"韩国人专场",zht:"韓國人專場",es:"Tablero coreano"},
 wtot:{ko:"1등 {n}회",en:"1st place × {n}",ja:"1位 {n}回",zhs:"第1名 {n}次",zht:"第1名 {n}次",es:"1.er puesto × {n}"},
 nob:{ko:"아직 받은 배지가 없습니다.",en:"No badges yet.",ja:"まだバッジはありません。",zhs:"暂无徽章。",zht:"尚無徽章。",es:"Aún no tiene insignias."},
 dw:{ko:"매일 빙고 1등",en:"Daily Bingo 1st place",ja:"毎日ビンゴ1位",zhs:"每日宾果第1名",zht:"每日賓果第1名",es:"1.er puesto en el Bingo diario"},
 fin:{ko:"주간 1·2·3등",en:"Weekly top-3 finishes",ja:"週間1〜3位",zhs:"每周前三名",zht:"每週前三名",es:"Top 3 semanal"},
 gradY:{ko:"졸업 — 1·2·3등에 3번 올라 명예의 전당에 올랐습니다.",en:"Graduated — you finished in the top 3 three times and entered the Hall of Fame.",ja:"卒業 — 1〜3位に3回入り、殿堂入りしました。",zhs:"已毕业 — 您已3次进入前三名，进入名人堂。",zht:"已畢業 — 您已3次進入前三名，進入名人堂。",es:"Graduado — ha quedado entre los 3 primeros tres veces y entró en el Salón de la Fama."},
 hofY:{ko:"명예의 전당에 올랐습니다.",en:"You are in the Hall of Fame.",ja:"殿堂入りしました。",zhs:"您已进入名人堂。",zht:"您已進入名人堂。",es:"Está en el Salón de la Fama."},
 gradN:{ko:"졸업(명예의 전당)까지 1·2·3등 {n}번 남았습니다.",en:"{n} more top-3 finishes to graduate into the Hall of Fame.",ja:"卒業（殿堂入り）まで、あと{n}回の1〜3位入りです。",zhs:"再进入前三名{n}次即可毕业（进入名人堂）。",zht:"再進入前三名{n}次即可畢業（進入名人堂）。",es:"Le faltan {n} puestos en el top 3 para graduarse en el Salón de la Fama."},
 prep:{ko:"Google로 로그인 (준비 중)",en:"Sign in with Google (coming soon)",ja:"Googleでログイン（準備中）",zhs:"使用Google登录（准备中）",zht:"使用Google登入（準備中）",es:"Iniciar sesión con Google (próximamente)"},
 prepNote:{ko:"로그인 기능을 준비하고 있습니다. 곧 열립니다.",en:"Sign-in is being prepared and will open soon.",ja:"ログイン機能を準備中です。まもなく開始します。",zhs:"登录功能正在准备中，即将开放。",zht:"登入功能正在準備中，即將開放。",es:"El inicio de sesión se está preparando y abrirá pronto."},
 privLink:{ko:"개인정보 처리방침",en:"Privacy Policy",ja:"個人情報処理方針",zhs:"隐私政策",zht:"隱私政策",es:"Política de Privacidad"},
 times:{ko:"회",en:"",ja:"回",zhs:"次",zht:"次",es:""},
 logout:{ko:"로그아웃",en:"Sign out",ja:"ログアウト",zhs:"退出登录",zht:"登出",es:"Cerrar sesión"},
 close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 err:{ko:"불러오지 못했습니다. 잠시 뒤 다시 해 주세요.",en:"Could not load. Please try again shortly.",ja:"読み込めませんでした。しばらくしてからもう一度お試しください。",zhs:"无法加载，请稍后再试。",zht:"無法載入，請稍後再試。",es:"No se pudo cargar. Inténtelo de nuevo en un momento."},
 lerr:{ko:"로그인하지 못했습니다. 다시 해 주세요.",en:"Sign-in failed. Please try again.",ja:"ログインできませんでした。もう一度お試しください。",zhs:"登录失败，请重试。",zht:"登入失敗，請重試。",es:"No se pudo iniciar sesión. Inténtelo de nuevo."},
 sess:{ko:"로그인이 끝났습니다. 다시 로그인해 주세요.",en:"Your session has ended. Please sign in again.",ja:"ログインの有効期限が切れました。もう一度ログインしてください。",zhs:"登录已过期，请重新登录。",zht:"登入已過期，請重新登入。",es:"Su sesión ha terminado. Vuelva a iniciar sesión."},
 gNat:{ko:"Google로 로그인",en:"Sign in with Google",ja:"Googleでログイン",zhs:"使用Google登录",zht:"使用Google登入",es:"Iniciar sesión con Google"},
 aNat:{ko:"앱에서는 Apple 로그인을 지원하지 않습니다. Google로 로그인하거나, 웹 브라우저의 사이트에서 Apple로 로그인해 주세요.",en:"Sign in with Apple is not available in the app. Please sign in with Google, or use Apple sign-in on the website in your web browser.",ja:"アプリではAppleでのログインはご利用いただけません。Googleでログインするか、ウェブブラウザのサイトでAppleでログインしてください。",zhs:"应用内不支持Apple登录。请使用Google登录，或在网页浏览器的网站上使用Apple登录。",zht:"App 內不支援 Apple 登入。請使用 Google 登入，或在網頁瀏覽器的網站上使用 Apple 登入。",es:"El inicio de sesión con Apple no está disponible en la app. Inicia sesión con Google o usa Apple en el sitio web desde tu navegador."},
 natUpd:{ko:"이 앱 버전에서는 로그인을 지원하지 않습니다. 앱을 최신 버전으로 업데이트해 주세요.",en:"Sign-in is not supported in this app version. Please update the app to the latest version.",ja:"このアプリのバージョンではログインできません。アプリを最新バージョンに更新してください。",zhs:"此应用版本不支持登录，请将应用更新到最新版本。",zht:"此 App 版本不支援登入，請將 App 更新到最新版本。",es:"Esta versión de la app no admite el inicio de sesión. Actualiza la app a la última versión."}
};
/* 다른 사이트(노래방 karaoke.moneypuzzle.co.kr, 10-30)가 같은 pg.js 를 쓸 때 — window.PG_SITE={W:{문구},simple,aredir}. 투어앱엔 PG_SITE 가 없어 그대로 */
var PGS=window.PG_SITE||null; if(PGS&&PGS.W) for(var _pk in PGS.W) W[_pk]=PGS.W[_pk];
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
  +"#pgIn{background:var(--card);color:var(--ink);width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:16px 16px calc(26px + env(safe-area-inset-bottom,0px));max-height:85vh;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;box-sizing:border-box}"
  +"@media (min-width:700px){#pgBox{align-items:center;padding:7.5vh 16px;box-sizing:border-box}#pgIn{border-radius:18px;max-height:85vh;padding-bottom:22px;box-shadow:0 12px 40px rgba(0,0,0,.3)}}"
  +"#pgIn h3{margin:0 0 8px;font-size:18px;display:flex;align-items:center;gap:8px}#pgIn h3 img{flex:none}#pgIn .pgx{margin-left:auto;border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer}"
  +"#pgIn .pgp{color:var(--sub);font-size:13px;line-height:1.55;margin:8px 0}#pgIn .pgbal{background:linear-gradient(135deg,#ffe8a3,#f7c948);color:#4a3500;border-radius:14px;padding:14px;margin:10px 0}"
  +"#pgIn .pgbal b{display:block;font-size:30px;line-height:1.1}#pgIn .pgbal span{font-size:13px}#pgIn .pgrow{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}"
  +"#pgIn .pgrow small{color:var(--sub)}#pgIn .pgsec{font-weight:700;margin:14px 0 4px;font-size:14px}#pgIn .pggrad{background:#e7f5ff;color:#1c4f7a;border-radius:10px;padding:10px;font-size:13px;margin:8px 0}"
  +":root[data-theme=dark] #pgIn .pggrad{background:#1b2b3d;color:#a5d8ff}#pgIn .pgbtn{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 16px;font-size:14px;cursor:pointer}"
  +"#pgIn .pgbtn[disabled]{opacity:.6;cursor:default}#pgIn .pgplus{color:#2b8a3e;font-weight:700}#pgIn .pgminus{color:#c92a2a;font-weight:700}#pgIn .pgdim{color:var(--sub)}#pgGbtn{margin:12px 0 6px;min-height:44px}#pgAbtn{margin:0 0 12px;min-height:44px}#appleid-signin{width:240px;height:40px;cursor:pointer}"
  +"#pgIn .pgbd{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0 2px}#pgIn .pgbd div{background:var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:11px;color:var(--sub)}"
  +"#pgIn .pgbd img{width:32px;height:32px;display:block;margin:0 auto 4px}#pgIn .pgbd b{display:block;font-size:18px;color:var(--ink)}#pgIn .pgdim0{opacity:.35}";
  document.head.appendChild(s); }
function box(){ var b=document.getElementById("pgBox"); if(b) return b; css(); b=document.createElement("div"); b.id="pgBox"; b.hidden=true; b.innerHTML='<div id="pgIn"></div>';
  b.addEventListener("click",function(e){ if(e.target===b) close(); var a=e.target.closest&&e.target.closest("[data-pg]"); if(!a) return; var k=a.dataset.pg; if(k==="x") close(); else if(k==="out") logout(); });
  document.body.appendChild(b); return b; }
function ttl(px){ if(PGS&&PGS.simple) return esc(t("title")); return esc(t("badge")).split("{s}").join('<img src="img/rank/star.webp" alt="" style="width:'+px+'px;height:'+px+'px;vertical-align:-2px;margin:0 1px">'); }   /* 「내 ★배지」 — ★ = 별 그림 (10-27) */
function head(){ return '<h3><span>'+ttl(20)+'</span><button type="button" class="pgx" data-pg="x">'+esc(t("close"))+' ✕</button></h3>'; }
function privHtml(){ return '<div class="pgp">'+esc(t("priv"))+' <a href="privacy.html?lang='+esc(lg())+'" target="_blank" rel="noopener">'+esc(t("privLink"))+'</a></div>'; }
function close(){ var b=document.getElementById("pgBox"); if(b) b.hidden=true; }
var GIS=null;
function gisLoad(){ if(window.google&&google.accounts&&google.accounts.id) return Promise.resolve(); if(GIS) return GIS;
  GIS=new Promise(function(ok,no){ var s=document.createElement("script"); s.src="https://accounts.google.com/gsi/client"; s.async=true; s.onload=ok; s.onerror=function(){ GIS=null; no(); }; document.head.appendChild(s); }); return GIS; }
var GLOC={ko:"ko",en:"en",ja:"ja",zhs:"zh_CN",zht:"zh_TW",es:"es"};
function paintLogin(msg){ var I=document.getElementById("pgIn");
  I.innerHTML=head()+'<div class="pgp">'+esc(t("intro"))+'</div><div class="pgp" style="color:var(--ink)">'+esc(t("ask"))+'</div>'+(msg?'<div class="pgp" style="color:#c92a2a">'+esc(msg)+'</div>':'')
    +'<div id="pgGbtn"><button type="button" class="pgbtn" disabled>'+esc(t("load"))+'</button></div><div id="pgAbtn"></div>'+rvHtml()+privHtml();
  if(natApp()){ natPaint(); rvWire(); return; }   /* 앱(StageSong 등) 안 — 웹 구글·애플 로그인은 WebView 에서 막힘(흰 화면) → 앱 전용 로그인 (10-31) */
  appleBtn(); rvWire();
  cfg().then(function(c){ var g=document.getElementById("pgGbtn"); if(!g) return; c={cid:(c&&c.cid)||PG_CID};
    if(!c||!c.cid){ g.innerHTML='<button type="button" class="pgbtn" id="pgPrep" disabled><img src="img/menu/mi_globe.png" alt="" style="height:16px;width:16px;vertical-align:-3px;margin-right:6px">'+esc(t("prep"))+'</button><div class="pgp">'+esc(t("prepNote"))+'</div>'; return; }
    gisLoad().then(function(){ var g2=document.getElementById("pgGbtn"); if(!g2) return; g2.innerHTML="";
      google.accounts.id.initialize({client_id:c.cid,callback:onCred,auto_select:false,cancel_on_tap_outside:true,ux_mode:"popup"});
      google.accounts.id.renderButton(g2,{type:"standard",theme:document.documentElement.getAttribute("data-theme")==="dark"?"filled_black":"outline",size:"large",width:240,text:"signin_with",shape:"pill",locale:GLOC[lg()]||"en"});
    }).catch(function(){ var g3=document.getElementById("pgGbtn"); if(g3) g3.innerHTML='<div class="pgp" style="color:#c92a2a">'+esc(t("err"))+'</div>'; }); }); }
// ── 앱 안 로그인 (10-31) — 구글은 WebView 안 OAuth 를 막는다(disallowed_useragent → 흰 화면) · 웹판(브라우저)은 위 그대로
//   안드로이드 앱 = 플러그인 @capgo/capacitor-social-login (Credential Manager) · webClientId = 웹 클라이언트 ID → ID 토큰 aud 가 웹과 같아 허브 /npg/login 그대로 = 같은 계정·같은 지갑
//   애플은 앱 안에서 안내만 · 플러그인이 없는 옛 앱 판·iOS 는 업데이트 안내 (멈추지 않게)
function natApp(){ try{ var C=window.Capacitor; return !!(C&&C.isNativePlatform&&C.isNativePlatform()); }catch(e){ return false; } }
function natSL(){ try{ var C=window.Capacitor; return C.getPlatform&&C.getPlatform()==="android"&&C.Plugins&&C.Plugins.SocialLogin||null; }catch(e){ return null; } }
var GSV='<svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-4px;margin-right:8px"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
var SLI=null;
function natPaint(){ var g=document.getElementById("pgGbtn"), a=document.getElementById("pgAbtn"), P=natSL();
  if(a) a.innerHTML=P?'<div class="pgp">'+esc(t("aNat"))+'</div>':"";
  if(!g) return;
  if(!P){ g.innerHTML='<div class="pgp" style="color:#c92a2a">'+esc(t("natUpd"))+'</div>'; return; }
  g.innerHTML='<button type="button" class="pgbtn" id="pgGnat" style="min-width:240px;font-weight:600">'+GSV+esc(t("gNat"))+'</button>';
  document.getElementById("pgGnat").onclick=function(){ var b=this; b.disabled=true;
    cfg().then(function(c){ var cid=(c&&c.cid)||PG_CID;
      if(!SLI) SLI=P.initialize({google:{webClientId:cid,mode:"online"}}).catch(function(e){ SLI=null; throw e; });
      return SLI; }).then(function(){ return P.login({provider:"google",options:{}}); })
    .then(function(r){ var tk=r&&r.result&&r.result.idToken; if(!tk){ paintLogin(t("lerr")); return; } login({cred:tk}); })
    .catch(function(e){ var m=String(e&&(e.message||e.code)||e||""); if(/cancel/i.test(m)){ paintLogin(); return; } paintLogin(t("lerr")); }); }; }
// ── Apple로 로그인 (사장님 2026-10-26) — Sign in with Apple JS 공식 스크립트(판 1)·공식 검정 단추·팝업 · state·nonce 는 창 열 때마다 새로 ──
//   Services ID kr.co.moneypuzzle.navi.web · Return URL https://navi.moneypuzzle.co.kr/ · 허브 /npg/login {prov:"apple"} 가 애플 JWKS 로 검사
var ACID="kr.co.moneypuzzle.navi.web", AREDIR=(PGS&&PGS.aredir)||"https://navi.moneypuzzle.co.kr/", ALOC={ko:"ko_KR",en:"en_US",ja:"ja_JP",zhs:"zh_CN",zht:"zh_TW",es:"es_ES"}, AS=null, AJS=null;
function rnd(n){ return Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(n)),function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); }
function appleLoad(){ if(window.AppleID&&AppleID.auth) return Promise.resolve(); if(AJS) return AJS;
  AJS=new Promise(function(ok,no){ var s=document.createElement("script"); s.src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/"+(ALOC[lg()]||"en_US")+"/appleid.auth.js"; s.async=true; s.onload=ok; s.onerror=function(){ AJS=null; no(); }; document.head.appendChild(s); });
  document.addEventListener("AppleIDSignInOnSuccess",function(e){ onApple(e.detail); });
  document.addEventListener("AppleIDSignInOnFailure",function(e){ var er=e&&e.detail&&e.detail.error; if(er!=="popup_closed_by_user"&&er!=="user_cancelled_authorize") paintLogin(t("lerr")); });
  return AJS; }
function appleBtn(){ var a=document.getElementById("pgAbtn"); if(!a) return;
  a.innerHTML='<div id="appleid-signin" data-mode="center-align" data-type="sign-in" data-color="black" data-border="false" data-border-radius="50" data-width="240" data-height="40"></div>';
  appleLoad().then(function(){ AS={state:rnd(16),nonce:rnd(16)};
    AppleID.auth.init({clientId:ACID,scope:"name email",redirectURI:AREDIR,state:AS.state,nonce:AS.nonce,usePopup:true});
    try{ if(AppleID.auth.renderButton) AppleID.auth.renderButton(); }catch(e){} }).catch(function(){ var b=document.getElementById("pgAbtn"); if(b) b.innerHTML=""; }); }
function onApple(d){ var au=d&&d.authorization; if(!au||!au.id_token||!AS||au.state!==AS.state){ paintLogin(t("lerr")); return; }
  var nm=""; try{ var n=d.user&&d.user.name; if(n) nm=[n.firstName,n.lastName].filter(Boolean).join(" "); }catch(e){}   // 이름은 첫 로그인 때만 온다
  login({prov:"apple",cred:au.id_token,nonce:AS.nonce,name:nm}); }
/* 게임물관리위원회 심사용 로그인 (사장님 10-29) — ?grac=1 로 들어온 창에서만 아이디·비밀번호 칸이 보인다. 허브 /npg/rvlogin */
var GR=false; try{ GR=/[?&]grac=1(?![0-9a-z])/i.test(location.search)||sessionStorage.getItem("mp_grac")==="1"; if(GR) sessionStorage.setItem("mp_grac","1"); }catch(e){}
function rvHtml(){ if(!GR) return ""; var st="width:100%;box-sizing:border-box;padding:8px;margin:4px 0;border:1px solid #ccc;border-radius:8px;font-size:15px";
  return '<div class="pgsec" style="margin-top:12px">심사용 로그인 (GRAC)</div><input id="pgRvId" autocomplete="username" placeholder="아이디" style="'+st+'"><input id="pgRvPw" type="password" autocomplete="current-password" placeholder="비밀번호" style="'+st+'"><button type="button" class="pgbtn" id="pgRvGo">로그인</button>'; }
function rvWire(){ var g=document.getElementById("pgRvGo"); if(!g) return; g.onclick=function(){ var i=document.getElementById("pgRvId"), w=document.getElementById("pgRvPw"); rvLogin(i&&i.value, w&&w.value); }; }
function rvLogin(id,pw){ var I=document.getElementById("pgIn"); if(I) I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  post("/npg/rvlogin",{id:id||"",pw:pw||""}).then(function(j){ if(!j||!j.ok||!j.sess){ paintLogin("아이디 또는 비밀번호가 맞지 않습니다."); return; } ls("mpv_pg_sess",j.sess); paintMe(j.me); menuPaint(); })
    .catch(function(){ paintLogin(t("lerr")); }); }
function login(b){ var I=document.getElementById("pgIn"); if(I) I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  var own=0; try{ own=localStorage.getItem("mp_owner")?1:0; }catch(e){} b.dev=dev(); b.own=own;
  post("/npg/login",b).then(function(j){ if(!j||!j.ok||!j.sess){ paintLogin(t("lerr")); return; } ls("mpv_pg_sess",j.sess); paintMe(j.me); menuPaint(); })
    .catch(function(){ paintLogin(t("lerr")); }); }
function onCred(r){ login({cred:r&&r.credential}); }
function logout(){ ls("mpv_pg_sess",null); try{ if(window.google&&google.accounts&&google.accounts.id) google.accounts.id.disableAutoSelect(); }catch(e){} try{ var P=natSL(); if(P&&SLI) P.logout({provider:"google"}).catch(function(){}); }catch(e){} menuPaint(); paintLogin(); }
function bdRow(n,lab){ n=n||0; var K=[["bigsun",Math.floor(n/1000)],["sun",Math.floor(n/100)%10],["bigstar",Math.floor(n/10)%10],["star",n%10]];
  return (lab?'<div class="pgsec">'+esc(lab)+'</div>':'')+'<div class="pgbd">'+K.map(function(k){ return '<div'+(k[1]?'':' class="pgdim0"')+'><img src="img/rank/'+k[0]+'.webp" alt=""><b>'+k[1]+'</b>'+esc(t(k[0]))+'</div>'; }).join("")+'</div><div class="pgp" style="text-align:right;margin:2px 0 6px">'+esc(t("wtot",{n:n.toLocaleString()}))+'</div>'; }
function paintMe(m){ var I=document.getElementById("pgIn"); if(!I||!m) return;
  if(PGS&&PGS.simple){ I.innerHTML=head()+'<div class="pgp" style="color:var(--ink)">'+esc(m.name||"")+(m.email?' <span class="pgdim">· '+esc(m.email)+'</span>':'')+'</div><div class="pgp">'+esc(t("intro"))+'</div>'+privHtml()+'<div style="margin-top:10px"><button type="button" class="pgbtn" data-pg="out">'+esc(t("logout"))+'</button></div>'; return; }   /* 노래방 사이트 — 배지 없이 계정만 */   /* 내 배지 (10-27) — /npg/me 의 wins·twins·kwins·dw·fin·gr·hof */
  var fw=(m.wins||0)+(m.twins||0), kw=m.kwins||0, fin=m.fin||0, tm=t("times")?' '+esc(t("times")):'';
  var h=head()+'<div class="pgp" style="color:var(--ink)">'+esc(m.name||"")+(m.email?' <span class="pgdim">· '+esc(m.email)+'</span>':'')+'</div>';
  if(!fw&&!kw) h+='<div class="pgp">'+esc(t("nob"))+'</div>'+bdRow(0,"");
  else { if(fw) h+=bdRow(fw,kw?t("bEv"):""); if(kw) h+=bdRow(kw,fw?t("bKo"):""); }
  h+='<div class="pgrow"><span>'+esc(t("dw"))+'</span><b>'+(m.dw||0)+tm+'</b></div><div class="pgrow"><span>'+esc(t("fin"))+'</span><b>'+fin+tm+'</b></div>';
  h+= m.gr?'<div class="pggrad">'+esc(t("gradY"))+'</div>':(m.hof?'<div class="pggrad">'+esc(t("hofY"))+'</div>':'')+'<div class="pgp">'+esc(t("gradN",{n:Math.max(1,3-fin)}))+'</div>';
  h+='<div class="pgp" style="margin-top:12px">'+esc(t("intro"))+'</div>'+privHtml()+'<div style="margin-top:10px"><button type="button" class="pgbtn" data-pg="out">'+esc(t("logout"))+'</button></div>';
  I.innerHTML=h; }
window.mpPGpaint=function(m){ box().hidden=false; paintMe(m); };   /* 화면 점검용 — 그리기만 */
function open(){ var b=box(); b.hidden=false; var s=ls("mpv_pg_sess"), I=document.getElementById("pgIn");
  if(!s){ paintLogin(); return; }
  I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  post("/npg/me",{sess:s}).then(function(j){ if(j&&j.ok){ paintMe(j.me); return; } if(j&&j.err==="sess"){ ls("mpv_pg_sess",null); menuPaint(); paintLogin(t("sess")); return; } I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; })
    .catch(function(){ I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; }); }
function menuPaint(){ var mm=document.getElementById("mm"); if(!mm) return; var a=document.getElementById("mpg");
  if(!a){ a=document.createElement("a"); a.id="mpg"; a.href="#"; a.className="mi"; a.onclick=function(e){ e.preventDefault(); try{ document.getElementById("mm").hidden=true; }catch(x){} open(); }; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
  a.innerHTML='<img class="miic" src="img/menu/mi_star.png" alt="">'+ttl(16); }
var f=window.setLang; if(typeof f==="function"&&!f._pg){ var g=function(){ var r=f.apply(this,arguments); try{ menuPaint(); var b=document.getElementById("pgBox"); if(b&&!b.hidden) open(); }catch(e){} return r; }; g._pg=1; g._tr=f._tr; window.setLang=g; }
menuPaint();
window.mpPG={open:open,close:close};
if(/[?&]pg=1(?![0-9a-z])/i.test(location.search)||(/[?&]grac=1(?![0-9a-z])/i.test(location.search)&&!ls("mpv_pg_sess"))) setTimeout(open,400);   // 심사용 주소는 로그인 창부터
})();
