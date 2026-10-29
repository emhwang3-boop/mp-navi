/* 머니퍼즐 투어 — 명소 후기(별점·댓글) (사장님 2026-10-29)
 *  · 관광 카드 앞면 = 별점 평균(★ 4.3)·후기 수만. 그 줄을 두 번 누르면(더블클릭·두 번 톡) 카드 아래에 후기 목록이 펼쳐지고, 다시 두 번 누르면 접힌다
 *  · 쓰기는 구글·애플 로그인(퍼즐골드 세션 mpv_pg_sess)만 — 안 했으면 「로그인하고 후기 남기기」 → 기존 로그인 창(mpPG.open)
 *  · 한 사람 한 명소 하나(다시 쓰면 고치기) · 별 1~5 + 글 300자 · 허브가 AI 로 검사(욕설·광고·스팸·개인정보)+6개 언어 번역
 *  · 허브: /npg/rv/sum · /npg/rv/list · /npg/rv/put · /npg/rv/del
 *  · index.html 은 카드에 rvSlot(k) 자리 + 그린 뒤 rvLoad(k) 만 부른다
 */
(function(){
"use strict";
var PH=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
var W={
 rev:{ko:"후기 {n}",en:"{n} reviews",ja:"レビュー {n}",zhs:"评价 {n}",zht:"評價 {n}",es:"{n} reseñas"},
 none:{ko:"아직 후기가 없습니다",en:"No reviews yet",ja:"まだレビューはありません",zhs:"暂无评价",zht:"尚無評價",es:"Aún no hay reseñas"},
 tap2:{ko:"두 번 눌러 후기 보기",en:"Double-tap to see reviews",ja:"2回タップでレビュー表示",zhs:"点两下查看评价",zht:"點兩下查看評價",es:"Toca dos veces para ver las reseñas"},
 tap2c:{ko:"두 번 눌러 접기",en:"Double-tap to close",ja:"2回タップで閉じる",zhs:"点两下收起",zht:"點兩下收起",es:"Toca dos veces para cerrar"},
 load:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 err:{ko:"불러오지 못했습니다. 잠시 뒤 다시 해 주세요.",en:"Could not load. Please try again shortly.",ja:"読み込めませんでした。しばらくしてからもう一度お試しください。",zhs:"无法加载，请稍后再试。",zht:"無法載入，請稍後再試。",es:"No se pudo cargar. Inténtelo de nuevo en un momento."},
 orig:{ko:"원문 보기",en:"See original",ja:"原文を見る",zhs:"查看原文",zht:"查看原文",es:"Ver original"},
 trn:{ko:"번역 보기",en:"See translation",ja:"翻訳を見る",zhs:"查看翻译",zht:"查看翻譯",es:"Ver traducción"},
 aitr:{ko:"AI 번역",en:"AI translation",ja:"AI翻訳",zhs:"AI翻译",zht:"AI翻譯",es:"Traducción por IA"},
 edited:{ko:"수정됨",en:"edited",ja:"編集済み",zhs:"已编辑",zht:"已編輯",es:"editada"},
 mine:{ko:"내 후기",en:"My review",ja:"自分のレビュー",zhs:"我的评价",zht:"我的評價",es:"Mi reseña"},
 write:{ko:"후기 쓰기",en:"Write a review",ja:"レビューを書く",zhs:"写评价",zht:"寫評價",es:"Escribir una reseña"},
 edit:{ko:"내 후기 고치기",en:"Edit my review",ja:"自分のレビューを編集",zhs:"修改我的评价",zht:"修改我的評價",es:"Editar mi reseña"},
 ph:{ko:"이곳은 어땠나요? (300자까지 · 전화번호·링크·광고는 올릴 수 없습니다)",en:"How was this place? (up to 300 characters · no phone numbers, links or ads)",ja:"ここはいかがでしたか？（300字まで・電話番号・リンク・広告は投稿できません）",zhs:"这里怎么样？（最多300字 · 不可包含电话号码、链接或广告）",zht:"這裡怎麼樣？（最多300字 · 不可包含電話號碼、連結或廣告）",es:"¿Qué tal este lugar? (hasta 300 caracteres · sin teléfonos, enlaces ni anuncios)"},
 pick:{ko:"별점을 골라 주세요.",en:"Please choose a star rating.",ja:"星の数を選んでください。",zhs:"请选择星级。",zht:"請選擇星級。",es:"Elija una puntuación."},
 save:{ko:"올리기",en:"Post",ja:"投稿",zhs:"发布",zht:"發佈",es:"Publicar"},
 saving:{ko:"검사·번역하는 중…",en:"Checking and translating…",ja:"確認・翻訳中…",zhs:"正在审核和翻译…",zht:"正在審核和翻譯…",es:"Revisando y traduciendo…"},
 saved:{ko:"후기를 올렸습니다. 고맙습니다!",en:"Your review is posted. Thank you!",ja:"レビューを投稿しました。ありがとうございます！",zhs:"评价已发布，谢谢！",zht:"評價已發佈，謝謝！",es:"Reseña publicada. ¡Gracias!"},
 del:{ko:"지우기",en:"Delete",ja:"削除",zhs:"删除",zht:"刪除",es:"Eliminar"},
 delq:{ko:"내 후기를 지울까요?",en:"Delete your review?",ja:"自分のレビューを削除しますか？",zhs:"要删除您的评价吗？",zht:"要刪除您的評價嗎？",es:"¿Eliminar su reseña?"},
 login:{ko:"로그인하고 후기 남기기",en:"Sign in to leave a review",ja:"ログインしてレビューを書く",zhs:"登录后写评价",zht:"登入後寫評價",es:"Inicie sesión para dejar una reseña"},
 loginNote:{ko:"구글 또는 애플 계정으로 로그인한 분만 후기를 쓸 수 있습니다. 아이디는 일부를 가려 보여 드립니다.",en:"Only visitors signed in with Google or Apple can write reviews. Your ID is shown partly hidden.",ja:"GoogleまたはAppleでログインした方のみレビューを書けます。IDは一部を隠して表示します。",zhs:"仅限使用Google或Apple登录的用户发表评价。账号将部分隐藏显示。",zht:"僅限使用Google或Apple登入的使用者發表評價。帳號將部分隱藏顯示。",es:"Solo quienes inicien sesión con Google o Apple pueden escribir reseñas. Su ID se muestra parcialmente oculto."},
 rule:{ko:"한 명소에 후기 하나 · 다시 쓰면 고쳐집니다 · 글은 AI가 검사하고 6개 언어로 번역합니다.",en:"One review per place · posting again edits it · AI checks your text and translates it into 6 languages.",ja:"1か所につきレビュー1件・再投稿で編集されます・文章はAIが確認し6言語に翻訳します。",zhs:"每个景点限一条评价 · 再次发布即为修改 · 文字由AI审核并翻译成6种语言。",zht:"每個景點限一則評價 · 再次發佈即為修改 · 文字由AI審核並翻譯成6種語言。",es:"Una reseña por lugar · publicar de nuevo la edita · la IA revisa el texto y lo traduce a 6 idiomas."},
 r_abuse:{ko:"욕설·비방이 있어 올릴 수 없습니다. 고쳐서 다시 올려 주세요.",en:"Your review contains abusive language and cannot be posted. Please edit it and try again.",ja:"暴言・誹謗が含まれているため投稿できません。修正して再度投稿してください。",zhs:"含有辱骂或诽谤内容，无法发布。请修改后重试。",zht:"含有辱罵或誹謗內容，無法發佈。請修改後重試。",es:"Contiene lenguaje ofensivo y no se puede publicar. Edítela e inténtelo de nuevo."},
 r_sexual:{ko:"선정적인 내용이 있어 올릴 수 없습니다.",en:"Your review contains sexual content and cannot be posted.",ja:"性的な内容が含まれているため投稿できません。",zhs:"含有色情内容，无法发布。",zht:"含有色情內容，無法發佈。",es:"Contiene contenido sexual y no se puede publicar."},
 r_hate:{ko:"혐오 표현이 있어 올릴 수 없습니다.",en:"Your review contains hate speech and cannot be posted.",ja:"ヘイト表現が含まれているため投稿できません。",zhs:"含有仇恨言论，无法发布。",zht:"含有仇恨言論，無法發佈。",es:"Contiene discurso de odio y no se puede publicar."},
 r_ad:{ko:"광고·홍보로 보여 올릴 수 없습니다.",en:"Your review looks like advertising and cannot be posted.",ja:"広告・宣伝と判断されたため投稿できません。",zhs:"内容疑似广告宣传，无法发布。",zht:"內容疑似廣告宣傳，無法發佈。",es:"Parece publicidad y no se puede publicar."},
 r_spam:{ko:"의미 없는 글이나 스팸으로 보여 올릴 수 없습니다.",en:"Your review looks like spam and cannot be posted.",ja:"意味のない文章またはスパムと判断されたため投稿できません。",zhs:"内容疑似垃圾信息，无法发布。",zht:"內容疑似垃圾訊息，無法發佈。",es:"Parece spam y no se puede publicar."},
 r_pii:{ko:"전화번호·이메일·메신저 아이디 같은 개인정보는 올릴 수 없습니다.",en:"Personal information such as phone numbers, emails or messenger IDs cannot be posted.",ja:"電話番号・メールアドレス・メッセンジャーIDなどの個人情報は投稿できません。",zhs:"不可发布电话号码、电子邮箱、聊天软件账号等个人信息。",zht:"不可發佈電話號碼、電子郵件、通訊軟體帳號等個人資訊。",es:"No se puede publicar información personal como teléfonos, correos o IDs de mensajería."},
 r_link:{ko:"링크(인터넷 주소)는 올릴 수 없습니다.",en:"Links (web addresses) cannot be posted.",ja:"リンク（URL）は投稿できません。",zhs:"不可发布链接（网址）。",zht:"不可發佈連結（網址）。",es:"No se pueden publicar enlaces (direcciones web)."},
 e_day:{ko:"오늘은 후기를 더 쓸 수 없습니다(하루 20번). 내일 다시 해 주세요.",en:"You have reached today's limit (20 posts). Please try again tomorrow.",ja:"本日の上限（20回）に達しました。明日もう一度お試しください。",zhs:"已达今日上限（20次），请明天再试。",zht:"已達今日上限（20次），請明天再試。",es:"Ha alcanzado el límite de hoy (20 publicaciones). Inténtelo mañana."},
 e_budget:{ko:"지금은 새 후기를 받지 않습니다. 잠시 뒤 다시 해 주세요.",en:"New reviews are paused right now. Please try again later.",ja:"現在、新しいレビューの受付を停止しています。後ほどお試しください。",zhs:"目前暂停接收新评价，请稍后再试。",zht:"目前暫停接收新評價，請稍後再試。",es:"Las nuevas reseñas están en pausa. Inténtelo más tarde."},
 e_sess:{ko:"로그인이 끝났습니다. 다시 로그인해 주세요.",en:"Your session has ended. Please sign in again.",ja:"ログインの有効期限が切れました。もう一度ログインしてください。",zhs:"登录已过期，请重新登录。",zht:"登入已過期，請重新登入。",es:"Su sesión ha terminado. Vuelva a iniciar sesión."},
 e_x:{ko:"올리지 못했습니다. 잠시 뒤 다시 해 주세요.",en:"Could not post. Please try again shortly.",ja:"投稿できませんでした。しばらくしてからもう一度お試しください。",zhs:"发布失败，请稍后再试。",zht:"發佈失敗，請稍後再試。",es:"No se pudo publicar. Inténtelo de nuevo en un momento."}
};
function lg(){ var l=window.LANG||"ko"; return W.rev[l]?l:"en"; }
function t(k,v){ var o=W[k]||{}, s=o[lg()]; if(s==null) s=o.en||""; if(v) for(var x in v) s=s.split("{"+x+"}").join(v[x]); return s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function day(ms){ return new Date(ms+9*3600e3).toISOString().slice(0,10); }
function sess(){ try{ return localStorage.getItem("mpv_pg_sess")||""; }catch(e){ return ""; } }
function post(path,b){ return fetch(PH+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),cache:"no-store"}).then(function(r){ return r.json(); }); }
function okK(k){ return typeof k==="string"&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/.test(k)&&k!=="mpstat"; }
function stars(n,px){ n=Math.round(n||0); var h=""; for(var i=1;i<=5;i++) h+='<span style="color:'+(i<=n?"#f59f00":"#ced4da")+'">★</span>'; return '<span class="rvst" style="font-size:'+(px||14)+'px">'+h+'</span>'; }
function css(){ if(document.getElementById("rvCss")) return; var s=document.createElement("style"); s.id="rvCss";
  s.textContent=".rvs{display:flex;align-items:center;gap:8px;margin:5px 0 3px;padding:6px 10px;border-radius:12px;background:#fff9db;border:1px solid #ffe066;font-size:13.5px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}"
  +".rvs b{font-size:15px;color:#e67700}.rvs .rvn{color:var(--ink);font-weight:700}.rvs .rvh{margin-left:auto;color:var(--sub);font-size:11.5px}"
  +":root[data-theme=dark] .rvs{background:#2b2512;border-color:#5c4a0f}.rvs.on{border-color:#f59f00}"
  +".rvp{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}.rvi{padding:8px 0;border-bottom:1px solid var(--line)}.rvi .rvm{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--sub);flex-wrap:wrap}"
  +".rvi .rvm b{color:var(--ink);font-weight:700}.rvi .rvt{font-size:14px;line-height:1.5;margin-top:3px;white-space:pre-wrap;word-break:break-word;color:var(--ink)}.rvi .rvo{border:0;background:none;color:#1971c2;font-size:12px;padding:2px 0;cursor:pointer}"
  +".rvi.me{background:rgba(255,224,102,.12)}.rvw{margin-top:10px;padding:10px;border-radius:12px;border:1px solid var(--line)}.rvw .rvq{font-weight:700;font-size:14px;margin-bottom:6px}"
  +".rvw .rvpick{font-size:30px;line-height:1;letter-spacing:2px}.rvw .rvpick span{cursor:pointer;color:#ced4da;padding:0 1px}.rvw .rvpick span.on{color:#f59f00}"
  +".rvw textarea{width:100%;box-sizing:border-box;min-height:74px;margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:14px;background:var(--card);color:var(--ink);resize:vertical}"
  +".rvw .rvr{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}.rvw .rvc{color:var(--sub);font-size:12px;margin-right:auto}"
  +".rvw button,.rvp .rvlg{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 16px;font-size:14px;cursor:pointer}.rvw button.rvgo,.rvp .rvlg{background:#f59f00;border-color:#f59f00;color:#fff;font-weight:700}"
  +".rvw button[disabled]{opacity:.6}.rvmsg{font-size:12.5px;margin-top:6px;color:var(--sub)}.rvmsg.e{color:#c92a2a}.rvmsg.o{color:#2b8a3e}.rvsm{font-size:12px;color:var(--sub);line-height:1.5;margin:6px 0}";
  document.head.appendChild(s); }
var SUM={}, OPEN=null, LIST=null, PICK=0;
window.rvSlot=function(k){ if(!okK(k)) return ""; css(); return '<div class="rvs" data-rvk="'+esc(k)+'" hidden></div>'; };
function slot(){ return document.querySelector("#res .rvs"); }
function paintSum(k){ var e=slot(); if(!e||e.dataset.rvk!==k) return; var s=SUM[k]||{n:0,avg:0}, on=OPEN===k;
  e.classList.toggle("on",on);
  e.innerHTML=(s.n?'<b>★ '+(+s.avg).toFixed(1)+'</b><span class="rvn">'+esc(t("rev",{n:s.n}))+'</span>':'<span class="rvn">'+esc(t("none"))+'</span>')+'<span class="rvh">'+esc(t(on?"tap2c":"tap2"))+'</span>';
  e.hidden=false; }
window.rvLoad=function(k){ if(!okK(k)) return; OPEN=null; LIST=null; if(SUM[k]) paintSum(k);
  post("/npg/rv/sum",{k:k}).then(function(j){ if(j&&j.ok){ SUM[k]={n:j.n,avg:j.avg}; paintSum(k); } }).catch(function(){}); };
function panel(){ var it=document.querySelector("#res .item"); if(!it) return null; var p=it.querySelector(".rvp"); if(!p){ p=document.createElement("div"); p.className="rvp"; it.appendChild(p); } return p; }
function toggle(k){ if(OPEN===k){ OPEN=null; var p=document.querySelector("#res .rvp"); if(p) p.remove(); paintSum(k); return; }
  OPEN=k; paintSum(k); var p2=panel(); if(!p2) return; p2.innerHTML='<div class="rvsm">'+esc(t("load"))+'</div>'; list(k); }
function list(k){ var s=sess(); post("/npg/rv/list",{k:k,l:lg(),sess:s||undefined}).then(function(j){ if(OPEN!==k||window._cardK!==k) return;
    if(!j||!j.ok){ var p=panel(); if(p) p.innerHTML='<div class="rvmsg e">'+esc(t("err"))+'</div>'; return; }
    if(s&&!j.login){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} }
    SUM[k]={n:j.n,avg:j.avg}; LIST=j; PICK=j.mine?j.mine.st:0; paintSum(k); paintList(k); })
  .catch(function(){ var p=panel(); if(p&&OPEN===k) p.innerHTML='<div class="rvmsg e">'+esc(t("err"))+'</div>'; }); }
function itemHtml(x,i){ return '<div class="rvi'+(x.me?' me':'')+'"><div class="rvm">'+stars(x.st,13)+'<b>'+esc(x.nm)+'</b><span>'+esc(day(x.up||x.at))+(x.up?' · '+esc(t("edited")):'')+'</span>'+(x.me?'<span style="color:#e67700;font-weight:700">'+esc(t("mine"))+'</span>':'')+'</div>'
  +(x.txt?'<div class="rvt" data-i="'+i+'">'+esc(x.txt)+'</div>':'')+(x.o?'<button type="button" class="rvo" data-rvo="'+i+'">'+esc(t("orig"))+'</button> <span style="font-size:11px;color:var(--sub)">'+esc(t("aitr"))+'</span>':'')+'</div>'; }
function pickHtml(){ var h=""; for(var i=1;i<=5;i++) h+='<span data-rvpick="'+i+'"'+(i<=PICK?' class="on"':'')+'>★</span>'; return h; }
function paintList(k){ var p=panel(); if(!p||!LIST) return; var j=LIST, h="";
  h+=(j.items||[]).map(itemHtml).join("")||'<div class="rvsm">'+esc(t("none"))+'</div>';
  if(sess()&&j.login){ var m=j.mine;
    h+='<div class="rvw"><div class="rvq">'+esc(t(m?"edit":"write"))+'</div><div class="rvpick">'+pickHtml()+'</div>'
      +'<textarea maxlength="300" placeholder="'+esc(t("ph"))+'">'+esc(m?m.txt:"")+'</textarea>'
      +'<div class="rvr"><span class="rvc">'+((m?m.txt:"").length)+' / 300</span>'+(m?'<button type="button" data-rvdel="1">'+esc(t("del"))+'</button>':'')+'<button type="button" class="rvgo" data-rvgo="1">'+esc(t("save"))+'</button></div>'
      +'<div class="rvmsg"></div><div class="rvsm">'+esc(t("rule"))+'</div></div>'; }
  else h+='<div class="rvw"><button type="button" class="rvlg" data-rvlogin="1">'+esc(t("login"))+'</button><div class="rvsm">'+esc(t("loginNote"))+'</div></div>';
  p.innerHTML=h; }
function msg(s,c){ var e=document.querySelector("#res .rvp .rvmsg"); if(e){ e.className="rvmsg"+(c?" "+c:""); e.textContent=s; } }
function save(k){ var ta=document.querySelector("#res .rvp textarea"), b=document.querySelector("#res .rvp [data-rvgo]"); if(!ta) return;
  if(!(PICK>=1&&PICK<=5)){ msg(t("pick"),"e"); return; }
  var s=sess(); if(!s){ paintList(k); return; }
  if(b) b.disabled=true; msg(t("saving"));
  post("/npg/rv/put",{sess:s,k:k,st:PICK,txt:ta.value.slice(0,300),l:lg()}).then(function(j){ if(b) b.disabled=false;
    if(j&&j.ok){ SUM[k]={n:j.n,avg:j.avg}; paintSum(k); list(k); setTimeout(function(){ msg(t("saved"),"o"); },400); return; }
    var er=j&&j.err;
    if(er==="reject") msg(t("r_"+(W["r_"+j.why]?j.why:"spam")),"e");
    else if(er==="day") msg(t("e_day"),"e");
    else if(er==="budget") msg(t("e_budget"),"e");
    else if(er==="sess"){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} msg(t("e_sess"),"e"); }
    else msg(t("e_x"),"e"); })
  .catch(function(){ if(b) b.disabled=false; msg(t("e_x"),"e"); }); }
function del(k){ if(!confirm(t("delq"))) return; var s=sess(); if(!s) return;
  post("/npg/rv/del",{sess:s,k:k}).then(function(j){ if(j&&j.ok){ SUM[k]={n:j.n,avg:j.avg}; PICK=0; paintSum(k); list(k); } else msg(t("e_x"),"e"); }).catch(function(){ msg(t("e_x"),"e"); }); }
function loginOpen(k){ if(!window.mpPG) return; window.mpPG.open();   // 로그인 창이 닫히면 후기 칸을 다시 그린다
  var bx=document.getElementById("pgBox"); if(!bx||!window.MutationObserver) return;
  var mo=new MutationObserver(function(){ if(!bx.hidden) return; mo.disconnect(); if(OPEN===k&&window._cardK===k) list(k); }); mo.observe(bx,{attributes:true,attributeFilter:["hidden"]}); }
// 두 번 누르기 — 마우스 dblclick · 손가락은 350ms 안에 두 번 톡
var lastT=0, lastEl=null;
document.addEventListener("dblclick",function(e){ var el=e.target.closest&&e.target.closest("#res .rvs"); if(!el) return; e.preventDefault(); if(Date.now()-lastT<600&&lastEl===null) return; toggle(el.dataset.rvk); });
document.addEventListener("touchend",function(e){ var el=e.target.closest&&e.target.closest("#res .rvs"); if(!el) return; var n=Date.now();
  if(lastEl===el&&n-lastT<350){ e.preventDefault(); lastEl=null; lastT=n; toggle(el.dataset.rvk); } else { lastEl=el; lastT=n; } },{passive:false});
document.addEventListener("click",function(e){ var p=e.target.closest&&e.target.closest("#res .rvp"); if(!p) return; var k=window._cardK; if(!okK(k)) return;
  var a=e.target.closest("[data-rvpick]"); if(a){ PICK=+a.dataset.rvpick; var w=p.querySelector(".rvpick"); if(w) w.innerHTML=pickHtml(); return; }
  if(e.target.closest("[data-rvgo]")){ save(k); return; }
  if(e.target.closest("[data-rvdel]")){ del(k); return; }
  if(e.target.closest("[data-rvlogin]")){ loginOpen(k); return; }
  var o=e.target.closest("[data-rvo]"); if(o&&LIST){ var i=+o.dataset.rvo, x=LIST.items[i], tx=p.querySelector('.rvt[data-i="'+i+'"]'); if(!x||!tx) return;
    var show=o.dataset.on!=="1"; o.dataset.on=show?"1":""; tx.textContent=show?x.o:x.txt; o.textContent=t(show?"trn":"orig"); } });
document.addEventListener("input",function(e){ if(!e.target.matches||!e.target.matches("#res .rvp textarea")) return; var c=document.querySelector("#res .rvp .rvc"); if(c) c.textContent=e.target.value.length+" / 300"; });
})();
