/* 머니퍼즐 투어 — 구글·애플 로그인 (사장님 2026-10-26)
 *  · 11-08 사장님: 「내 배지」 창과 ⋮ 메뉴 「내 배지」를 없앰 — 이 파일은 로그인 창만. 로그인되면 창을 닫고, 로그아웃은 mpPG.logout(홈페이지 머리줄 「로그아웃」 단추)
 *  · 로그인·로그아웃 때 document 에 「mppg」 이벤트를 보낸다(홈페이지 단추 글자 바꾸기)
 *  · 클라이언트 ID 는 허브 GOOGLE_CLIENT_ID 한 곳(wrangler.toml) — /npg/cfg 로 읽는다. 비어 있으면 이 파일의 PG_CID
 *  · 받은 ID 토큰은 허브 /npg/login 이 구글 서명까지 검사 → 허브 세션(30일)만 이 브라우저(mpv_pg_sess)에 둔다. 구글 토큰은 저장 안 함
 *  · 기기 번호 = 앱이 이미 쓰는 mpv_dev (같은 기기 다른 계정 수상 경고용) · 사장님 기기(mp_owner)는 own=1 → MIS 합계에서 빠진다
 */
(function(){
"use strict";
var PH=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
var PG_CID="778127744827-qp5b6m9pnlq2tp38b7b39ghmked0t8mc.apps.googleusercontent.com";   /* 구글 OAuth 클라이언트 ID(웹) — 허브 wrangler.toml GOOGLE_CLIENT_ID 와 같은 값. 허브 값이 우선, 허브가 비면 이 값 */
var W={
 login:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Iniciar sesión"},
 priv:{ko:"로그인하면 이름·이메일·구글 또는 애플 계정 식별값을 부정 참여 방지 목적으로 보관하며, 마지막 이용 후 1년 뒤 삭제합니다. 다만 유료 포인트 잔액이 있으면 잔액이 없어질 때까지 보관합니다.",en:"When you sign in, we keep your name, email and Google or Apple account identifier to prevent fraudulent participation, and delete them 1 year after your last use. However, if you have a paid point balance, we keep them until the balance is gone.",ja:"ログインすると、氏名・メールアドレス・GoogleまたはAppleアカウント識別子を不正参加防止のために保管し、最終利用から1年後に削除します。ただし、有料ポイントの残高がある場合は、残高がなくなるまで保管します。",zhs:"登录后，我们会为防止违规参与保存您的姓名、电子邮箱和Google或Apple账号标识，并在最后一次使用1年后删除。但如有付费积分余额，将保存至余额用尽为止。",zht:"登入後，我們會為防止不當參與保存您的姓名、電子郵件和Google或Apple帳號識別碼，並在最後一次使用1年後刪除。但如有付費點數餘額，將保存至餘額用盡為止。",es:"Al iniciar sesión guardamos su nombre, correo e identificador de Google o Apple para prevenir la participación fraudulenta, y los eliminamos 1 año después de su último uso. No obstante, si tiene saldo de puntos de pago, se conservan hasta que el saldo se agote."},
 privLink:{ko:"개인정보 처리방침",en:"Privacy Policy",ja:"個人情報処理方針",zhs:"隐私政策",zht:"隱私政策",es:"Política de Privacidad"},
 logout:{ko:"로그아웃",en:"Sign out",ja:"ログアウト",zhs:"退出登录",zht:"登出",es:"Cerrar sesión"},
 close:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 err:{ko:"불러오지 못했습니다. 잠시 뒤 다시 해 주세요.",en:"Could not load. Please try again shortly.",ja:"読み込めませんでした。しばらくしてからもう一度お試しください。",zhs:"无法加载，请稍后再试。",zht:"無法載入，請稍後再試。",es:"No se pudo cargar. Inténtelo de nuevo en un momento."},
 lerr:{ko:"로그인하지 못했습니다. 다시 해 주세요.",en:"Sign-in failed. Please try again.",ja:"ログインできませんでした。もう一度お試しください。",zhs:"登录失败，请重试。",zht:"登入失敗，請重試。",es:"No se pudo iniciar sesión. Inténtelo de nuevo."},
 sess:{ko:"로그인이 끝났습니다. 다시 로그인해 주세요.",en:"Your session has ended. Please sign in again.",ja:"ログインの有効期限が切れました。もう一度ログインしてください。",zhs:"登录已过期，请重新登录。",zht:"登入已過期，請重新登入。",es:"Su sesión ha terminado. Vuelva a iniciar sesión."},
 gNat:{ko:"Google로 로그인",en:"Sign in with Google",ja:"Googleでログイン",zhs:"使用Google登录",zht:"使用Google登入",es:"Iniciar sesión con Google"},
 aNat:{ko:"앱에서는 Apple 로그인을 지원하지 않습니다. Google로 로그인하거나, 웹 브라우저의 사이트에서 Apple로 로그인해 주세요.",en:"Sign in with Apple is not available in the app. Please sign in with Google, or use Apple sign-in on the website in your web browser.",ja:"アプリではAppleでのログインはご利用いただけません。Googleでログインするか、ウェブブラウザのサイトでAppleでログインしてください。",zhs:"应用内不支持Apple登录。请使用Google登录，或在网页浏览器的网站上使用Apple登录。",zht:"App 內不支援 Apple 登入。請使用 Google 登入，或在網頁瀏覽器的網站上使用 Apple 登入。",es:"El inicio de sesión con Apple no está disponible en la app. Inicia sesión con Google o usa Apple en el sitio web desde tu navegador."},
 iosNo:{ko:"아이폰 앱(App Store)은 당분간 지원하지 않습니다. 아이폰에서는 웹 브라우저로 이용해 주세요.",en:"The iPhone app (App Store) is not available for now. On iPhone, please use this website in your web browser.",ja:"iPhoneアプリ（App Store）は当面ご利用いただけません。iPhoneではウェブブラウザでご利用ください。",zhs:"暂不支持iPhone应用（App Store）。在iPhone上请使用网页浏览器访问。",zht:"暫不支援 iPhone App（App Store）。在 iPhone 上請使用網頁瀏覽器瀏覽。",es:"La app para iPhone (App Store) no está disponible por ahora. En iPhone, usa este sitio web desde tu navegador."},
 natUpd:{ko:"이 앱 버전에서는 로그인을 지원하지 않습니다. 앱을 최신 버전으로 업데이트해 주세요.",en:"Sign-in is not supported in this app version. Please update the app to the latest version.",ja:"このアプリのバージョンではログインできません。アプリを最新バージョンに更新してください。",zhs:"此应用版本不支持登录，请将应用更新到最新版本。",zht:"此 App 版本不支援登入，請將 App 更新到最新版本。",es:"Esta versión de la app no admite el inicio de sesión. Actualiza la app a la última versión."},
 // ── 이메일 인증번호 로그인 (사장님 11-08 「로그인·내 예약」 통과 — 배치도 11) ──
 sub:{ko:"로그인하면 PC·폰 어디서든 같은 카트·플랜·예약을 볼 수 있어요.",en:"Sign in to see the same cart, plans and bookings on any PC or phone.",ja:"ログインすると、PCでもスマホでも同じカート・プラン・予約を見られます。",zhs:"登录后，在电脑和手机上都能看到同样的购物车、行程和预约。",zht:"登入後，在電腦和手機上都能看到同樣的購物車、行程和預約。",es:"Inicia sesión para ver el mismo carrito, planes y reservas en cualquier PC o móvil."},
 or:{ko:"또는 이메일로",en:"or with email",ja:"またはメールで",zhs:"或使用邮箱",zht:"或使用電子郵件",es:"o con tu correo"},
 emPh:{ko:"이메일 주소",en:"Email address",ja:"メールアドレス",zhs:"电子邮箱",zht:"電子郵件地址",es:"Correo electrónico"},
 emSend:{ko:"인증번호 받기",en:"Get code",ja:"認証番号を受け取る",zhs:"获取验证码",zht:"取得驗證碼",es:"Recibir código"},
 emAgain:{ko:"다시 받기",en:"Resend",ja:"再送信",zhs:"重新获取",zht:"重新取得",es:"Reenviar"},
 emAgainS:{ko:"다시 받기 ({s}초)",en:"Resend ({s}s)",ja:"再送信（{s}秒）",zhs:"重新获取（{s}秒）",zht:"重新取得（{s}秒）",es:"Reenviar ({s} s)"},
 emCodePh:{ko:"메일로 온 6자리 번호",en:"6-digit code",ja:"6桁の認証番号",zhs:"6位验证码",zht:"6位驗證碼",es:"Código de 6 cifras"},   // 폰에서 칸이 좁아 짧게 (안내 줄에 「메일로 온 번호」가 있음)
 emOk:{ko:"확인",en:"Confirm",ja:"確認",zhs:"确认",zht:"確認",es:"Confirmar"},
 emNote:{ko:"비밀번호는 없어요. 메일로 온 번호를 10분 안에 넣으면 돼요. 처음이면 그대로 가입돼요.",en:"No password needed — just enter the code we email you within 10 minutes. If you're new, this signs you up.",ja:"パスワードは不要です。メールに届いた番号を10分以内に入力するだけです。初めての方はそのまま登録されます。",zhs:"无需密码，只需在10分钟内输入邮件中的验证码。首次使用将直接注册。",zht:"無需密碼，只需在10分鐘內輸入郵件中的驗證碼。首次使用將直接註冊。",es:"Sin contraseña: introduce el código que te enviamos por correo en 10 minutos. Si eres nuevo, así te registras."},
 emSent:{ko:"{e} 메일함을 확인해 주세요. 번호는 10분 동안 쓸 수 있어요. 메일이 안 보이면 스팸함도 봐 주세요.",en:"We sent a code to {e}. It works for 10 minutes. If you don't see it, check your spam folder.",ja:"{e} に認証番号を送りました。10分間有効です。届かない場合は迷惑メールフォルダもご確認ください。",zhs:"验证码已发送至 {e}，10分钟内有效。如未收到，请查看垃圾邮件文件夹。",zht:"驗證碼已寄至 {e}，10分鐘內有效。如未收到，請查看垃圾郵件資料夾。",es:"Enviamos un código a {e}. Sirve durante 10 minutos. Si no lo ves, revisa la carpeta de spam."},
 emBad:{ko:"이메일 주소를 확인해 주세요.",en:"Please check the email address.",ja:"メールアドレスをご確認ください。",zhs:"请检查电子邮箱地址。",zht:"請檢查電子郵件地址。",es:"Revisa la dirección de correo."},
 emWait:{ko:"{s}초 뒤에 다시 받을 수 있어요.",en:"You can get a new code in {s} s.",ja:"{s}秒後にもう一度受け取れます。",zhs:"{s}秒后可重新获取。",zht:"{s}秒後可重新取得。",es:"Podrás pedir otro código en {s} s."},
 emRate:{ko:"오늘은 인증번호를 더 받을 수 없어요. 내일 다시 하시거나 구글·애플로 로그인해 주세요.",en:"Too many codes today. Please try again tomorrow, or sign in with Google or Apple.",ja:"本日はこれ以上認証番号を受け取れません。明日もう一度お試しいただくか、GoogleまたはAppleでログインしてください。",zhs:"今天获取验证码的次数已达上限。请明天再试，或使用Google或Apple登录。",zht:"今天取得驗證碼的次數已達上限。請明天再試，或使用Google或Apple登入。",es:"Has pedido demasiados códigos hoy. Inténtalo mañana o inicia sesión con Google o Apple."},
 emMail:{ko:"메일을 보내지 못했어요. 잠시 뒤 다시 하시거나 구글·애플로 로그인해 주세요.",en:"We couldn't send the email. Please try again later, or sign in with Google or Apple.",ja:"メールを送れませんでした。しばらくしてからもう一度お試しいただくか、GoogleまたはAppleでログインしてください。",zhs:"邮件发送失败。请稍后再试，或使用Google或Apple登录。",zht:"郵件寄送失敗。請稍後再試，或使用Google或Apple登入。",es:"No pudimos enviar el correo. Inténtalo más tarde o inicia sesión con Google o Apple."},
 emNeed:{ko:"메일로 온 6자리 번호를 넣어 주세요.",en:"Please enter the 6-digit code from the email.",ja:"メールに届いた6桁の番号を入力してください。",zhs:"请输入邮件中的6位验证码。",zht:"請輸入郵件中的6位驗證碼。",es:"Introduce el código de 6 cifras del correo."},
 emCode:{ko:"번호가 맞지 않아요. {n}번 더 넣을 수 있어요.",en:"That code is not right. You have {n} more tries.",ja:"番号が違います。あと{n}回入力できます。",zhs:"验证码不正确，还可以输入{n}次。",zht:"驗證碼不正確，還可以輸入{n}次。",es:"El código no es correcto. Te quedan {n} intentos."},
 emLock:{ko:"5번 틀려서 이 번호는 쓸 수 없어요. 인증번호를 다시 받아 주세요.",en:"Too many wrong tries — this code no longer works. Please get a new code.",ja:"5回間違えたため、この番号は使えません。認証番号をもう一度受け取ってください。",zhs:"已输错5次，此验证码失效。请重新获取验证码。",zht:"已輸錯5次，此驗證碼失效。請重新取得驗證碼。",es:"Fallaste 5 veces y este código ya no sirve. Pide un código nuevo."},
 emExp:{ko:"번호가 만료됐어요. 인증번호를 다시 받아 주세요.",en:"This code has expired. Please get a new code.",ja:"番号の有効期限が切れました。認証番号をもう一度受け取ってください。",zhs:"验证码已过期，请重新获取。",zht:"驗證碼已過期，請重新取得。",es:"El código caducó. Pide uno nuevo."}
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
  s.textContent="#pgBox{position:fixed;inset:0;z-index:1040;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}#pgBox[hidden]{display:none}"
  +"#pgIn{background:var(--card);color:var(--ink);width:100%;max-width:520px;border-radius:18px;padding:16px 16px calc(26px + env(safe-area-inset-bottom,0px));max-height:85vh;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;box-sizing:border-box}"
  +"@media (min-width:700px){#pgBox{align-items:center;padding:7.5vh 16px;box-sizing:border-box}#pgIn{border-radius:18px;max-height:85vh;padding-bottom:22px;box-shadow:0 12px 40px rgba(0,0,0,.3)}}"
  +"#pgIn h3{margin:0 0 8px;font-size:18px;display:flex;align-items:center;gap:8px}#pgIn h3 img{flex:none}#pgIn .pgx{margin-left:auto;border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer}"
  +"#pgIn .pgp{color:var(--sub);font-size:13px;line-height:1.55;margin:8px 0}"
  +"#pgIn .pgrow{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}"
  +"#pgIn .pgrow small{color:var(--sub)}#pgIn .pgsec{font-weight:700;margin:14px 0 4px;font-size:14px}#pgIn .pggrad{background:#e7f5ff;color:#1c4f7a;border-radius:10px;padding:10px;font-size:13px;margin:8px 0}"
  +":root[data-theme=dark] #pgIn .pggrad{background:#1b2b3d;color:#a5d8ff}#pgIn .pgbtn{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:9px 16px;font-size:14px;cursor:pointer}"
  +"#pgIn .pgbtn[disabled]{opacity:.6;cursor:default}#pgIn .pgdim{color:var(--sub)}#pgGbtn{margin:12px 0 6px;min-height:44px}#pgAbtn{margin:0 0 12px;min-height:44px}#appleid-signin{width:240px;height:40px;cursor:pointer}"
  +"#pgIn .pgbd{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0 2px}#pgIn .pgbd div{background:var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:11px;color:var(--sub)}"
  +"#pgIn .pgbd img{width:32px;height:32px;display:block;margin:0 auto 4px}#pgIn .pgbd b{display:block;font-size:18px;color:var(--ink)}#pgIn .pgdim0{opacity:.35}"
  /* 이메일 인증번호 (11-08) — 상징색 초록(#2f9e44) · 두 단추는 같은 크기 */
  +"#pgIn .pgor{display:flex;align-items:center;gap:10px;color:var(--sub);font-size:13px;margin:14px 0 10px}#pgIn .pgor:before,#pgIn .pgor:after{content:\"\";flex:1;height:1px;background:var(--line)}"
  +"#pgIn .pgr2{display:flex;gap:8px;margin:0 0 8px}#pgIn .pgr2 input{flex:1;min-width:0;box-sizing:border-box;height:44px;border:1.5px solid var(--line);border-radius:12px;padding:0 12px;font:inherit;font-size:15px;background:var(--card);color:var(--ink)}"
  +"#pgIn .pgr2 input::placeholder{color:#8a929c;opacity:1}#pgIn .pgr2 input:focus{outline:none;border-color:#2f9e44}"
  +"#pgIn .pgr2 button{flex:0 0 140px;box-sizing:border-box;height:44px;border-radius:12px;padding:0 6px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}"
  +"#pgIn .pgEs{background:#2f9e44;border:1.5px solid #2f9e44;color:#fff}#pgIn .pgEv{background:var(--card);border:1.5px solid #2f9e44;color:#2f9e44}#pgIn .pgr2 button[disabled]{opacity:.55;cursor:default}"
  +"#pgIn .pgemsg{font-size:13px;line-height:1.5;margin:0 2px 6px}#pgIn .pgemsg:empty{display:none}#pgIn .pgemsg.ok{color:#2b8a3e}#pgIn .pgemsg.er{color:#c92a2a}:root[data-theme=dark] #pgIn .pgemsg.ok{color:#8ce99a}:root[data-theme=dark] #pgIn .pgemsg.er{color:#ffa8a8}"
  +"#pgIn .pgnote{margin:2px 2px 4px;font-size:12.5px}";
  document.head.appendChild(s); }
function box(){ var b=document.getElementById("pgBox"); if(b) return b; css(); b=document.createElement("div"); b.id="pgBox"; b.hidden=true; b.innerHTML='<div id="pgIn"></div>';
  b.addEventListener("click",function(e){ if(e.target===b) close(); var a=e.target.closest&&e.target.closest("[data-pg]"); if(!a) return; var k=a.dataset.pg; if(k==="x") close(); else if(k==="out") logout(); });
  document.body.appendChild(b); return b; }
function ttl(px){ if(PGS&&PGS.simple) return esc(t("title")); return esc(t("login")); }   /* 11-08 — 「내 ★배지」 대신 「로그인」 */
function head(){ return '<h3><span>'+ttl(20)+'</span><button type="button" class="pgx" data-pg="x">'+esc(t("close"))+' ✕</button></h3>'; }
function privHtml(){ return '<div class="pgp">'+esc(t("priv"))+' <a href="privacy.html?lang='+esc(lg())+'" target="_blank" rel="noopener">'+esc(t("privLink"))+'</a></div>'; }
function close(){ var b=document.getElementById("pgBox"); if(b) b.hidden=true; }
var GIS=null;
function gisLoad(){ if(window.google&&google.accounts&&google.accounts.id) return Promise.resolve(); if(GIS) return GIS;
  GIS=new Promise(function(ok,no){ var s=document.createElement("script"); s.src="https://accounts.google.com/gsi/client"; s.async=true; s.onload=ok; s.onerror=function(){ GIS=null; no(); }; document.head.appendChild(s); }); return GIS; }
var GLOC={ko:"ko",en:"en",ja:"ja",zhs:"zh_CN",zht:"zh_TW",es:"es"};
function paintLogin(msg){ var I=document.getElementById("pgIn");
  I.innerHTML=head()+(t("intro")?'<div class="pgp">'+esc(t("intro"))+'</div>':'')+(t("ask")?'<div class="pgp" style="color:var(--ink)">'+esc(t("ask"))+'</div>':'')+(PGS?'':'<div class="pgp">'+esc(t("sub"))+'</div>')+(msg?'<div class="pgp" style="color:#c92a2a">'+esc(msg)+'</div>':'')
    +'<div id="pgGbtn"><button type="button" class="pgbtn" disabled>'+esc(t("load"))+'</button></div><div id="pgAbtn"></div>'
    +(natApp()?'':'<div class="pgp" style="color:var(--ink)">'+esc(t("iosNo"))+'</div>')   /* 아이폰 앱 없음 안내 — 웹만 (사장님 11-04 「가」, 노래방·투어앱 둘 다) */
    +emHtml()+rvHtml()+privHtml();
  emWire();   /* 이메일 인증번호 (11-08) — 투어앱·홈페이지만(노래방 사이트 PG_SITE 는 그대로) · 구글·애플 단추는 위 그대로 */
  if(natApp()){ natPaint(); rvWire(); return; }   /* 앱(StageSong 등) 안 — 웹 구글·애플 로그인은 WebView 에서 막힘(흰 화면) → 앱 전용 로그인 (10-31) */
  appleBtn(); rvWire();
  cfg().then(function(c){ var g=document.getElementById("pgGbtn"); if(!g) return; c={cid:(c&&c.cid)||PG_CID};
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
// ── 이메일 인증번호 로그인 (사장님 11-08 「로그인·내 예약」 통과, 배치도 11) — 비밀번호 없음 · 처음이면 그대로 가입 ──
//   허브 POST /npg/ecode {email,l} → 메일로 6자리 번호(10분) · POST /npg/everify {email,code,dev,own} → 구글·애플과 같은 세션(mpv_pg_sess)
//   같은 이메일의 구글·애플 계정이 있으면 허브가 그 계정으로 로그인시킨다(계정 하나) · 노래방 사이트(PG_SITE)에는 안 보인다
var EMS={em:"",code:"",until:0,msg:"",cls:"",busy:0}, EMT=null;
function emOn(){ return !PGS; }
function emValid(e){ return /^[^\s@<>"'(),;:\\]{1,64}@[^\s@<>"'(),;:\\]{1,190}\.[a-z]{2,}$/i.test(e); }
function emHtml(){ if(!emOn()) return "";
  return '<div class="pgor"><span>'+esc(t("or"))+'</span></div>'
    +'<div class="pgr2"><input id="pgEm" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="'+esc(t("emPh"))+'" aria-label="'+esc(t("emPh"))+'" value="'+esc(EMS.em)+'"><button type="button" class="pgEs" id="pgEs"></button></div>'
    +'<div class="pgr2"><input id="pgEc" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" placeholder="'+esc(t("emCodePh"))+'" aria-label="'+esc(t("emCodePh"))+'" value="'+esc(EMS.code)+'"><button type="button" class="pgEv" id="pgEv">'+esc(t("emOk"))+'</button></div>'
    +'<div class="pgemsg '+EMS.cls+'" id="pgEmsg" role="status" aria-live="polite">'+esc(EMS.msg)+'</div>'
    +'<div class="pgp pgnote">'+esc(t("emNote"))+'</div>'; }
function emMsg(m,cls){ EMS.msg=m||""; EMS.cls=cls||""; var e=document.getElementById("pgEmsg"); if(e){ e.textContent=EMS.msg; e.className="pgemsg "+EMS.cls; } }
function emBtn(){ var b=document.getElementById("pgEs"); if(!b) return; var left=Math.ceil((EMS.until-Date.now())/1000);
  if(left>0){ b.textContent=t("emAgainS",{s:left}); b.disabled=true; } else { b.textContent=t(EMS.until?"emAgain":"emSend"); b.disabled=!!EMS.busy; } }
function emTick(){ if(EMT) return; EMT=setInterval(function(){ emBtn(); var bx=document.getElementById("pgBox"); if(Date.now()>=EMS.until||!bx||bx.hidden){ clearInterval(EMT); EMT=null; emBtn(); } },1000); }
function emWire(){ if(!emOn()) return; var em=document.getElementById("pgEm"), ec=document.getElementById("pgEc"), es=document.getElementById("pgEs"), ev=document.getElementById("pgEv"); if(!em) return;
  em.oninput=function(){ EMS.em=em.value; }; ec.oninput=function(){ var v=ec.value.replace(/\D/g,"").slice(0,6); if(v!==ec.value) ec.value=v; EMS.code=v; };
  em.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); emSend(); } }; ec.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); emVerify(); } };
  es.onclick=emSend; ev.onclick=emVerify; emBtn(); if(EMS.until>Date.now()) emTick(); }
function emSend(){ var em=document.getElementById("pgEm"), v=String((em&&em.value)||EMS.em||"").trim(); EMS.em=v;
  if(!emValid(v)){ emMsg(t("emBad"),"er"); try{ em.focus(); }catch(e){} return; }
  if(EMS.busy||EMS.until>Date.now()) return; EMS.busy=1; emBtn();
  post("/npg/ecode",{email:v,l:lg()}).then(function(j){ EMS.busy=0;
    if(j&&j.ok){ EMS.until=Date.now()+((+j.gap||60)*1000); emMsg(t("emSent",{e:v}),"ok"); emBtn(); emTick(); var c=document.getElementById("pgEc"); if(c) try{ c.focus(); }catch(e){} return; }
    var er=j&&j.err;
    if(er==="wait"){ EMS.until=Date.now()+((+j.wait||60)*1000); emMsg(t("emWait",{s:+j.wait||60}),"er"); emBtn(); emTick(); return; }
    emMsg(er==="email"?t("emBad"):er==="rate"?t("emRate"):t("emMail"),"er"); emBtn(); })
  .catch(function(){ EMS.busy=0; emMsg(t("emMail"),"er"); emBtn(); }); }
function emVerify(){ var em=document.getElementById("pgEm"), ec=document.getElementById("pgEc"), v=String((em&&em.value)||EMS.em||"").trim(), c=String((ec&&ec.value)||"").replace(/\D/g,"");
  EMS.em=v; EMS.code=c; if(!emValid(v)){ emMsg(t("emBad"),"er"); return; } if(c.length!==6){ emMsg(t("emNeed"),"er"); try{ ec.focus(); }catch(e){} return; }
  var b=document.getElementById("pgEv"); if(EMS.busy) return; EMS.busy=2; if(b) b.disabled=true;
  var own=0; try{ own=localStorage.getItem("mp_owner")?1:0; }catch(e){}
  post("/npg/everify",{email:v,code:c,dev:dev(),own:own}).then(function(j){ EMS.busy=0; if(b) b.disabled=false;
    if(j&&j.ok&&j.sess){ ls("mpv_pg_sess",j.sess); EMS.code=""; EMS.msg=""; EMS.cls=""; EMS.until=0; paintMe(j.me); menuPaint(); return; }   // 구글·애플 login() 과 같은 마무리
    var er=j&&j.err; if(er==="code"){ emMsg(t("emCode",{n:j.left!=null?j.left:""}),"er"); try{ ec.select(); }catch(e){} return; }
    if(er==="locked"||er==="expired"){ EMS.code=""; if(ec) ec.value=""; EMS.until=0; emBtn(); }
    emMsg(er==="locked"?t("emLock"):er==="expired"?t("emExp"):er==="email"?t("emBad"):t("lerr"),"er"); })
  .catch(function(){ EMS.busy=0; if(b) b.disabled=false; emMsg(t("lerr"),"er"); }); }
function logout(){ ls("mpv_pg_sess",null); try{ if(window.google&&google.accounts&&google.accounts.id) google.accounts.id.disableAutoSelect(); }catch(e){} try{ var P=natSL(); if(P&&SLI) P.logout({provider:"google"}).catch(function(){}); }catch(e){} menuPaint(); var b=document.getElementById("pgBox"); if(b&&!b.hidden) paintLogin(); }
function paintMe(m){ var I=document.getElementById("pgIn"); if(!I||!m) return;
  if(PGS&&PGS.simple){ I.innerHTML=head()+'<div class="pgp" style="color:var(--ink)">'+esc(m.name||"")+(m.email?' <span class="pgdim">· '+esc(m.email)+'</span>':'')+'</div><div class="pgp">'+esc(t("intro"))+'</div>'+privHtml()+'<div style="margin-top:10px"><button type="button" class="pgbtn" data-pg="out">'+esc(t("logout"))+'</button></div>'; return; }   /* 노래방 사이트 — 배지 없이 계정만 */   /* 내 배지 (10-27) — /npg/me 의 wins·twins·kwins·dw·fin·gr·hof */
  close(); }   /* 투어앱 — 「내 배지」 창 없앰 (11-08 사장님): 로그인되면 창을 닫는다 */
window.mpPGpaint=function(m){ box().hidden=false; paintMe(m); };   /* 화면 점검용 — 그리기만 */
function open(){ var b=box(); b.hidden=false; var s=ls("mpv_pg_sess"), I=document.getElementById("pgIn");
  if(!s||!(PGS&&PGS.simple)){ paintLogin(); return; }   /* 투어앱 — 배지 창 없음, 늘 로그인 창 (11-08) */
  I.innerHTML=head()+'<div class="pgp">'+esc(t("load"))+'</div>';
  post("/npg/me",{sess:s}).then(function(j){ if(j&&j.ok){ paintMe(j.me); return; } if(j&&j.err==="sess"){ ls("mpv_pg_sess",null); menuPaint(); paintLogin(t("sess")); return; } I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; })
    .catch(function(){ I.innerHTML=head()+'<div class="pgp">'+esc(t("err"))+'</div>'; }); }
function menuPaint(){ try{ document.dispatchEvent(new CustomEvent("mppg")); }catch(e){}   /* 로그인·로그아웃 알림 (11-08) */
  if(!(PGS&&PGS.simple)){ var o=document.getElementById("mpg"); if(o) o.remove(); return; }   /* 11-08 사장님: ⋮ 메뉴 「내 배지」 없앰 */
  var mm=document.getElementById("mm"); if(!mm) return; var a=document.getElementById("mpg");
  if(!a){ a=document.createElement("a"); a.id="mpg"; a.href="#"; a.className="mi"; a.onclick=function(e){ e.preventDefault(); try{ document.getElementById("mm").hidden=true; }catch(x){} open(); }; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); }
  a.innerHTML='<img class="miic" src="img/menu/mi_star.png" alt="">'+ttl(16); }
var f=window.setLang; if(typeof f==="function"&&!f._pg){ var g=function(){ var r=f.apply(this,arguments); try{ menuPaint(); var b=document.getElementById("pgBox"); if(b&&!b.hidden) open(); }catch(e){} return r; }; g._pg=1; g._tr=f._tr; window.setLang=g; }
menuPaint();
window.mpPG={open:open,close:close,logout:logout,on:function(){ return !!ls("mpv_pg_sess"); }};
if(/[?&]pg=1(?![0-9a-z])/i.test(location.search)||(/[?&]grac=1(?![0-9a-z])/i.test(location.search)&&!ls("mpv_pg_sess"))) setTimeout(open,400);   // 심사용 주소는 로그인 창부터
/* ⋮ 메뉴 「로그인 / 로그아웃」 (11-09 사장님 「넣어」 — 「내 배지」를 없앤 뒤 앱 안 로그아웃 자리) · 그림 mi_login(나노바나나 11-09)
   로그인돼 있으면 「로그아웃」(누르면 바로 로그아웃), 아니면 「로그인」(로그인 창) — 홈페이지 초록 단추와 같은 동작. 노래방 사이트(PG_SITE)·홈페이지(⋮ 없음)엔 안 붙는다 */
if(!PGS){ (function(){
  function mpgPaint(){ var mm=document.getElementById("mm"); if(!mm) return; var a=document.getElementById("mpg"), on=!!ls("mpv_pg_sess");
    if(!a){ a=document.createElement("a"); a.id="mpg"; a.href="#"; a.className="mi"; a.onclick=function(e){ e.preventDefault(); try{ document.getElementById("mm").hidden=true; }catch(x){} if(ls("mpv_pg_sess")) logout(); else open(); }; mm.insertBefore(a,document.getElementById("mref")||null); }
    a.innerHTML='<img class="miic" src="img/menu/mi_login.png" alt="">'+esc(t(on?"logout":"login")); }
  document.addEventListener("mppg",mpgPaint);
  function hook(){ mpgPaint(); try{ var mm=document.getElementById("mm"); if(mm&&window.MutationObserver) new MutationObserver(function(){ if(!document.getElementById("mpg")||!mm.hidden) mpgPaint(); }).observe(mm,{attributes:true,attributeFilter:["hidden"],childList:true}); }catch(e){} }   // 언어를 바꾸면 메뉴를 새로 그려 이 줄이 빠지므로 다시 붙인다
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",hook); else hook();
})(); }
})();
