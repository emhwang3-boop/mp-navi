/* MosaicTrip.com 고객 게시판 (사장님 11-09) — 앱 아래 「고객 게시판」 칸 + 화면 가운데 창 · 홈페이지 #/board 화면(home/pc_board.js)이 MTB.render 를 그대로 쓴다
 *  · 허브 /mtb/* (칸 "mtboard" — 머니퍼즐 홈페이지 게시판 /board/* 와 글·저장소가 따로)
 *  · 글쓰기 기본 = 별명 + 내용, 비밀번호 없음, 누구나 봄 · 「비밀글」을 고르면 비밀번호 필수 → 쓴 사람(그 비밀번호)과 관리자만 봄 · 목록에는 「비밀글입니다」만
 *  · 삭제: 공개글 = 쓴 기기(이 브라우저의 난수 mpv_bdev — 허브엔 해시만) 또는 쓸 때 로그인한 계정(mpv_pg_sess, 어느 기기에서나) · 비밀글 = 비밀번호 · 관리자 = 관리자 화면
 *  · 답변 = 관리자 화면(admin 「고객 게시판」) — 글 아래 「모자이크트립.com 답변」
 *  · 앱: 아래 칸(#mtbBox)은 화면에 보일 때만 최근 글 3개를 받는다(허브 호출 한 번) · 누르면 가운데 창(#mtbPop)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장 · 팝업은 가운데 · 한 줄 단추 묶음은 같은 크기
 */
(function(){
"use strict";
var D=document, HUBU=window.HUB||"https://brief-live-hub.emhwang3.workers.dev";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function F6(o,m){ var s=L6(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function num(n){ return Number(n||0).toLocaleString("en-US"); }

// ── 글 (6개 언어) ──
var TX={
 t:T6("고객 게시판","Customer board","お客様掲示板","客户留言板","客戶留言板","Foro de clientes"),
 sub:T6("궁금한 점이나 바라는 점을 남겨 주세요. 모자이크트립.com이 답변해 드려요.","Leave a question or a request, and MosaicTrip.com will reply.","気になることやご要望をお書きください。MosaicTrip.comがお答えします。","欢迎留下您的问题或建议，MosaicTrip.com 会为您回复。","歡迎留下您的問題或建議，MosaicTrip.com 會為您回覆。","Deja tu pregunta o sugerencia y MosaicTrip.com te responderá."),
 write:T6("글쓰기","Write a post","投稿する","写留言","寫留言","Escribir"),
 count:T6("글 {n}개","{n} posts","投稿 {n}件","共 {n} 条留言","共 {n} 則留言","{n} publicaciones"),
 count1:T6("글 1개","1 post","投稿 1件","共 1 条留言","共 1 則留言","1 publicación"),
 sec:T6("비밀글입니다","This is a private post","非公開の投稿です","这是私密留言","這是私密留言","Publicación privada"),
 ansY:T6("답변 완료","Answered","回答済み","已回复","已回覆","Respondida"),
 ansN:T6("답변 대기","Awaiting reply","回答待ち","等待回复","等待回覆","Sin respuesta"),
 mine:T6("내 글","My post","自分の投稿","我的留言","我的留言","Mía"),
 ansBy:T6("모자이크트립.com 답변","Reply from MosaicTrip.com","MosaicTrip.comからの回答","MosaicTrip.com 的回复","MosaicTrip.com 的回覆","Respuesta de MosaicTrip.com"),
 noAns:T6("아직 답변이 없어요.","No reply yet.","まだ回答はありません。","还没有回复。","還沒有回覆。","Todavía no hay respuesta."),
 list:T6("목록","Back to list","一覧へ","返回列表","返回列表","Volver"),
 del:T6("삭제","Delete","削除","删除","刪除","Eliminar"),
 post:T6("등록","Post","投稿","发布","發布","Publicar"),
 cancel:T6("취소","Cancel","キャンセル","取消","取消","Cancelar"),
 nick:T6("별명","Nickname","ニックネーム","昵称","暱稱","Apodo"),
 bodyPh:T6("궁금한 점이나 바라는 점을 적어 주세요.","Write your question or request.","気になることやご要望をお書きください。","请写下您的问题或建议。","請寫下您的問題或建議。","Escribe tu pregunta o sugerencia."),
 secChk:T6("비밀글","Private post","非公開","私密留言","私密留言","Publicación privada"),
 secHint:T6("쓴 사람과 관리자만 볼 수 있어요.","Only you and our staff can read it.","投稿した人と管理者だけが読めます。","只有您和管理员可以查看。","只有您和管理員可以查看。","Solo tú y nuestro equipo podréis leerla."),
 pwPh:T6("비밀번호 (4자 이상)","Password (4+ characters)","パスワード（4文字以上）","密码（至少4位）","密碼（至少4個字元）","Contraseña (mín. 4 caracteres)"),
 pwHint:T6("이 비밀번호로 글을 열고 삭제해요. 잊어버리면 찾을 수 없어요.","You'll use this password to open and delete the post. It can't be recovered if you forget it.","このパスワードで投稿を開いたり削除したりします。忘れると確認できなくなります。","查看和删除留言时需要此密码。忘记后无法找回。","查看和刪除留言時需要此密碼。忘記後無法找回。","Usarás esta contraseña para abrir y eliminar la publicación. Si la olvidas, no se puede recuperar."),
 pubNote:T6("글은 누구나 볼 수 있어요. 이름·전화번호·여권번호 같은 개인정보는 적지 마세요.","Anyone can read posts. Please don't include personal details such as your name, phone or passport number.","投稿は誰でも読めます。氏名・電話番号・パスポート番号などの個人情報は書かないでください。","留言所有人都能看到，请不要写姓名、电话号码、护照号码等个人信息。","留言所有人都能看到，請不要寫姓名、電話號碼、護照號碼等個人資料。","Cualquiera puede leer las publicaciones. No incluyas datos personales como tu nombre, teléfono o número de pasaporte."),
 delDev:T6("이 기기에서만 삭제할 수 있어요. 로그인하고 쓰면 다른 기기에서도 삭제할 수 있어요.","You can delete it only on this device. Sign in before posting to delete it from any device.","削除はこの端末からのみできます。ログインして投稿すると、ほかの端末からも削除できます。","只能在这台设备上删除。登录后发布，在其他设备上也能删除。","只能在這台裝置上刪除。登入後發布，在其他裝置上也能刪除。","Solo podrás eliminarla en este dispositivo. Si inicias sesión antes de publicar, podrás eliminarla desde cualquiera."),
 delAcct:T6("로그인한 계정으로 써서 다른 기기에서도 삭제할 수 있어요.","You're signed in, so you can delete it from any device.","ログイン中のアカウントで投稿するので、ほかの端末からも削除できます。","您已登录，在其他设备上也能删除。","您已登入，在其他裝置上也能刪除。","Has iniciado sesión, así que podrás eliminarla desde cualquier dispositivo."),
 lockT:T6("비밀글입니다. 쓴 사람과 관리자만 볼 수 있어요.","This is a private post. Only the writer and our staff can read it.","非公開の投稿です。投稿した人と管理者だけが読めます。","这是私密留言，只有发布者和管理员可以查看。","這是私密留言，只有發布者和管理員可以查看。","Esta publicación es privada. Solo quien la escribió y nuestro equipo pueden leerla."),
 lockAsk:T6("글을 쓸 때 정한 비밀번호를 넣어 주세요.","Enter the password you set when you wrote it.","投稿時に決めたパスワードを入力してください。","请输入发布时设置的密码。","請輸入發布時設定的密碼。","Introduce la contraseña que pusiste al escribirla."),
 pw:T6("비밀번호","Password","パスワード","密码","密碼","Contraseña"),
 ok:T6("확인","Open","確認","确认","確認","Abrir"),
 delQ:T6("이 글을 삭제할까요? 삭제하면 되돌릴 수 없어요.","Delete this post? This can't be undone.","この投稿を削除しますか？削除すると元に戻せません。","要删除这条留言吗？删除后无法恢复。","要刪除這則留言嗎？刪除後無法復原。","¿Eliminar esta publicación? No se puede deshacer."),
 none:T6("아직 글이 없어요. 궁금한 점이나 바라는 점을 남겨 주세요.","No posts yet. Leave your question or request.","まだ投稿はありません。気になることやご要望をお書きください。","还没有留言。欢迎留下您的问题或建议。","還沒有留言。歡迎留下您的問題或建議。","Aún no hay publicaciones. Deja tu pregunta o sugerencia."),
 load:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 err:T6("글을 불러오지 못했어요. 잠시 뒤 다시 해 주세요.","We couldn't load the posts. Please try again shortly.","投稿を読み込めませんでした。しばらくしてからもう一度お試しください。","无法加载留言，请稍后再试。","無法載入留言，請稍後再試。","No pudimos cargar las publicaciones. Inténtalo de nuevo en un momento."),
 retry:T6("다시 불러오기","Try again","再読み込み","重新加载","重新載入","Reintentar"),
 gone:T6("글을 찾을 수 없어요. 삭제된 글일 수 있어요.","We couldn't find this post. It may have been deleted.","投稿が見つかりません。削除された可能性があります。","找不到这条留言，可能已被删除。","找不到這則留言，可能已被刪除。","No encontramos esta publicación. Puede que se haya eliminado."),
 prev:T6("이전","Previous","前へ","上一页","上一頁","Anterior"),
 next:T6("다음","Next","次へ","下一页","下一頁","Siguiente"),
 more:T6("전체 보기 ›","See all ›","すべて見る ›","查看全部 ›","查看全部 ›","Ver todo ›"),
 close:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 eNick:T6("별명을 적어 주세요.","Please enter a nickname.","ニックネームを入力してください。","请输入昵称。","請輸入暱稱。","Escribe un apodo."),
 eBody:T6("내용을 적어 주세요.","Please write your message.","内容を入力してください。","请输入内容。","請輸入內容。","Escribe tu mensaje."),
 ePw:T6("비밀번호를 4자 이상 넣어 주세요.","Please enter a password of at least 4 characters.","パスワードを4文字以上入力してください。","请输入至少4位密码。","請輸入至少4個字元的密碼。","Introduce una contraseña de al menos 4 caracteres."),
 eLinks:T6("링크는 3개까지만 넣을 수 있어요.","You can include up to 3 links.","リンクは3つまでです。","最多只能加入3个链接。","最多只能加入3個連結。","Puedes incluir hasta 3 enlaces."),
 eRate:T6("한 시간에 글 5개까지 등록할 수 있어요. 잠시 뒤 다시 해 주세요.","You can post up to 5 times an hour. Please try again later.","投稿は1時間に5件までです。しばらくしてからもう一度お試しください。","每小时最多发布5条留言，请稍后再试。","每小時最多發布5則留言，請稍後再試。","Puedes publicar hasta 5 veces por hora. Inténtalo más tarde."),
 eLong:T6("글이 너무 길어요. 별명은 20자, 내용은 2,000자까지예요.","Too long. Nicknames can be up to 20 characters and messages up to 2,000.","長すぎます。ニックネームは20文字、内容は2,000文字までです。","内容过长。昵称最多20个字，内容最多2,000个字。","內容過長。暱稱最多20個字，內容最多2,000個字。","Es demasiado largo. El apodo admite 20 caracteres y el mensaje 2.000."),
 eFail:T6("등록하지 못했어요. 잠시 뒤 다시 해 주세요.","We couldn't post it. Please try again shortly.","投稿できませんでした。しばらくしてからもう一度お試しください。","发布失败，请稍后再试。","發布失敗，請稍後再試。","No se pudo publicar. Inténtalo de nuevo en un momento."),
 ePwBad:T6("비밀번호가 맞지 않아요.","That password isn't right.","パスワードが違います。","密码不正确。","密碼不正確。","La contraseña no es correcta."),
 eLock:T6("여러 번 틀려서 잠시 막혔어요. 10분 뒤 다시 해 주세요.","Too many wrong tries. Please try again in 10 minutes.","何度も間違えたため、しばらく使えません。10分後にもう一度お試しください。","错误次数过多，请10分钟后再试。","錯誤次數過多，請10分鐘後再試。","Demasiados intentos fallidos. Vuelve a intentarlo en 10 minutos."),
 eDel:T6("삭제하지 못했어요. 잠시 뒤 다시 해 주세요.","We couldn't delete it. Please try again shortly.","削除できませんでした。しばらくしてからもう一度お試しください。","删除失败，请稍后再试。","刪除失敗，請稍後再試。","No se pudo eliminar. Inténtalo de nuevo en un momento."),
 eOwner:T6("이 기기나 로그인한 계정에서 쓴 글만 삭제할 수 있어요.","You can only delete posts written on this device or with your signed-in account.","この端末、またはログイン中のアカウントで書いた投稿だけ削除できます。","只能删除在这台设备上或用已登录账号发布的留言。","只能刪除在這台裝置上或用已登入帳號發布的留言。","Solo puedes eliminar publicaciones escritas en este dispositivo o con tu cuenta."),
 infoT:T6("이용 안내","How it works","ご利用案内","使用说明","使用說明","Cómo funciona"),
 i1:T6("글은 누구나 볼 수 있어요. 「비밀글」로 쓰면 쓴 사람과 관리자만 볼 수 있어요.","Anyone can read posts. Choose “Private post” so only you and our staff can read it.","投稿は誰でも読めます。「非公開」にすると、投稿した人と管理者だけが読めます。","留言所有人都能看到。选择「私密留言」后，只有您和管理员可以查看。","留言所有人都能看到。選擇「私密留言」後，只有您和管理員可以查看。","Cualquiera puede leer las publicaciones. Elige «Publicación privada» para que solo tú y nuestro equipo la leáis."),
 i2:T6("모자이크트립.com이 글 아래에 답변을 달아 드려요.","MosaicTrip.com replies right under your post.","MosaicTrip.comが投稿の下に回答します。","MosaicTrip.com 会在留言下方回复。","MosaicTrip.com 會在留言下方回覆。","MosaicTrip.com responde justo debajo de tu publicación."),
 i3:T6("삭제는 글을 쓴 기기에서 할 수 있어요. 로그인하고 쓰면 다른 기기에서도 할 수 있어요. 비밀글은 비밀번호로 삭제해요.","You can delete a post on the device you wrote it on — or on any device if you were signed in. Private posts are deleted with their password.","削除は投稿した端末からできます。ログインして投稿した場合は、ほかの端末からもできます。非公開の投稿はパスワードで削除します。","可以在发布留言的设备上删除；登录后发布的留言在其他设备上也能删除。私密留言用密码删除。","可以在發布留言的裝置上刪除；登入後發布的留言在其他裝置上也能刪除。私密留言用密碼刪除。","Puedes eliminar una publicación en el dispositivo donde la escribiste, o en cualquiera si habías iniciado sesión. Las privadas se eliminan con su contraseña."),
 i4:T6("이름·전화번호·여권번호 같은 개인정보는 적지 마세요.","Please don't include personal details such as your name, phone or passport number.","氏名・電話番号・パスポート番号などの個人情報は書かないでください。","请不要写姓名、电话号码、护照号码等个人信息。","請不要寫姓名、電話號碼、護照號碼等個人資料。","No incluyas datos personales como tu nombre, teléfono o número de pasaporte.")
};

// ── 허브 ──
function dev(){ var d=ls("mpv_bdev"); if(d&&/^[0-9a-f]{32}$/.test(d)) return d;   // 이 기기(브라우저) 글쓴이 표 — 허브엔 해시만
  var a=new Uint8Array(16); try{ crypto.getRandomValues(a); }catch(e){ for(var i=0;i<16;i++) a[i]=Math.floor(Math.random()*256); }
  d=[].map.call(a,function(b){ return (b<16?"0":"")+b.toString(16); }).join(""); ls("mpv_bdev",d); return ls("mpv_bdev")===d?d:(window.__mtbDev=window.__mtbDev||d); }
function sess(){ return ls("mpv_pg_sess")||""; }
function api(path,body){ return fetch(HUBU+path,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify(body||{})})
  .then(function(r){ return r.json().catch(function(){ return {ok:false,err:"http"+r.status}; }); }); }
var PWS={};   // 비밀글 비밀번호 — 이 화면을 연 동안만 기억(저장 안 함)
var CACHE={list:{}};
function bump(){ CACHE.list={}; D.dispatchEvent(new CustomEvent("mtbchange")); }

// ── 모양 (앱 변수 --card·--ink·--sub·--line·--bg · 상징색 초록 #2f9e44 · 보조 노랑 #f5bf2a) ──
function css(){ if(D.getElementById("mtbCss")) return; var s=D.createElement("style"); s.id="mtbCss";
  s.textContent=
  ".mtb{color:var(--ink);font-size:15px;line-height:1.55}.mtb button{font-family:inherit}"
  +".mtb-tb{display:flex;align-items:center;gap:10px;margin:0 0 12px}.mtb-tb .mtb-n{color:var(--sub);font-size:13.5px;margin-right:auto}"
  +".mtb-b{display:inline-flex;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;min-height:40px;border:1.5px solid #2f9e44;background:var(--card);color:#2b8a3e;border-radius:999px;padding:6px 18px;font-size:14.5px;font-weight:800;cursor:pointer;white-space:nowrap;text-decoration:none}"
  +".mtb-b:hover:not(:disabled){background:#ebf7ee}.mtb-b.pri{background:#2f9e44;color:#fff}.mtb-b.pri:hover:not(:disabled){background:#2b8a3e}.mtb-b:disabled{opacity:.55;cursor:default}"
  +".mtb-b.red{border-color:#e03131;color:#c92a2a}.mtb-b.red:hover:not(:disabled){background:#fff5f5}"
  +":root[data-theme=dark] .mtb-b{color:#69db7c}:root[data-theme=dark] .mtb-b:hover:not(:disabled){background:#16301f}:root[data-theme=dark] .mtb-b.pri{color:#fff}:root[data-theme=dark] .mtb-b.red{color:#ff8787;border-color:#ff8787}:root[data-theme=dark] .mtb-b.red:hover:not(:disabled){background:#3b1f22}"
  +".mtb-bs{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:14px}.mtb-bs.c{justify-content:center}"
  +".mtb-it{display:block;width:100%;text-align:left;box-sizing:border-box;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);padding:12px 14px;margin:0 0 10px;cursor:pointer;font:inherit}"
  +".mtb-it:hover{border-color:#2f9e44}.mtb-ih{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mtb-ih b{font-weight:800;font-size:15px;min-width:0;overflow-wrap:anywhere}.mtb-ih time{color:var(--sub);font-size:12.5px}"
  +".mtb-ch{display:inline-block;font-size:12px;font-weight:800;border-radius:6px;padding:1px 8px;line-height:1.6;white-space:nowrap}.mtb-ch.y{background:#ebf7ee;color:#2b8a3e}.mtb-ch.n{background:var(--bg);color:var(--sub)}.mtb-ch.m{background:#fff6da;color:#8a6100}"
  +":root[data-theme=dark] .mtb-ch.y{background:#16301f;color:#8ce99a}:root[data-theme=dark] .mtb-ch.m{background:#2a2412;color:#ffd43b}"
  +".mtb-ih .mtb-chs{margin-left:auto;display:flex;gap:6px}"
  +".mtb-pv{margin-top:4px;color:var(--ink);font-size:14.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;white-space:pre-line}"
  +".mtb-pv.s{color:var(--sub)}"
  +".mtb-pg{display:flex;align-items:center;justify-content:center;gap:10px;margin:14px 0 4px}.mtb-pg span{color:var(--sub);font-size:14px;min-width:56px;text-align:center}"
  +".mtb-msg{border:1px dashed var(--line);border-radius:14px;background:var(--card);padding:24px 18px;text-align:center;color:var(--sub);font-size:14.5px;line-height:1.6}"
  +".mtb-card{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:16px 18px}"
  +".mtb-card .mtb-bd{margin-top:10px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15.5px;line-height:1.7}"
  +".mtb-ans{margin-top:12px;border-left:4px solid #2f9e44;background:#ebf7ee;border-radius:0 12px 12px 0;padding:10px 14px}:root[data-theme=dark] .mtb-ans{background:#16301f}"
  +".mtb-ans .mtb-ah{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14px;color:#2b8a3e}:root[data-theme=dark] .mtb-ans .mtb-ah{color:#8ce99a}.mtb-ans .mtb-ah time{font-weight:400;color:var(--sub);font-size:12.5px}"
  +".mtb-ans .mtb-ab{margin-top:4px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.65}"
  +".mtb-na{margin-top:12px;color:var(--sub);font-size:13.5px}"
  +".mtb-lock{margin-top:10px;background:var(--bg);border-radius:12px;padding:14px}.mtb-lock p{margin:0 0 8px;font-size:14.5px}.mtb-lock p.s{color:var(--sub);font-size:13.5px}"
  +".mtb-r2{display:flex;gap:8px}.mtb-r2 input{flex:1;min-width:0}"
  +".mtb input[type=text],.mtb input[type=password],.mtb textarea{display:block;width:100%;box-sizing:border-box;border:1.5px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit;font-size:15px;padding:10px 12px}"
  +".mtb .mtb-r2 input{width:auto}.mtb input:focus,.mtb textarea:focus{outline:none;border-color:#2f9e44}.mtb input::placeholder,.mtb textarea::placeholder{color:#8a929c;opacity:1}"
  +".mtb textarea{resize:vertical;min-height:150px;line-height:1.6}"
  +".mtb-f h3{margin:0 0 12px;font-size:18px;font-weight:800}.mtb-f label.mtb-lb{display:block;font-weight:700;font-size:14px;margin:12px 0 6px}"
  +".mtb-cnt{text-align:right;color:var(--sub);font-size:12.5px;margin-top:4px}"
  +".mtb-ck{display:flex;align-items:flex-start;gap:10px;margin-top:12px;cursor:pointer;font-size:14.5px}.mtb-ck input{width:20px;height:20px;margin:1px 0 0;accent-color:#2f9e44;flex:0 0 auto}.mtb-ck span{display:block}.mtb-ck small{display:block;color:var(--sub);font-size:12.5px;margin-top:1px}"
  +".mtb-pw{margin-top:10px}.mtb-pw[hidden]{display:none}.mtb-pw small{display:block;color:var(--sub);font-size:12.5px;margin-top:6px;line-height:1.5}"
  +".mtb-nt{margin-top:12px;color:var(--sub);font-size:12.5px;line-height:1.55}.mtb-nt div+div{margin-top:3px}"
  +".mtb-er{margin-top:10px;color:#c92a2a;font-size:13.5px;line-height:1.5}.mtb-er:empty{display:none}:root[data-theme=dark] .mtb-er{color:#ffa8a8}"
  +".mtb-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}"
  // 확인 창 (삭제) — 화면 가운데
  +".mtb-ov{position:fixed;inset:0;z-index:1065;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}"
  +".mtb-ov .mtb-cf{background:var(--card);color:var(--ink);width:100%;max-width:400px;border-radius:18px;padding:20px 20px 16px;box-sizing:border-box;box-shadow:0 12px 40px rgba(0,0,0,.3);font-size:15.5px;line-height:1.6}"
  // 앱 아래 칸
  +"#mtbBox{margin-top:12px;padding:10px 12px}#mtbBox .mtb-bh{display:flex;align-items:center;gap:8px;margin:0 2px 6px}#mtbBox .mtb-bh b{font-weight:800;font-size:14.5px;margin-right:auto}"
  +"#mtbBox .mtb-more{border:0;background:none;color:#2b8a3e;font-weight:700;font-size:13px;cursor:pointer;padding:2px 0;font-family:inherit}:root[data-theme=dark] #mtbBox .mtb-more{color:#69db7c}"
  +"#mtbBox .mtb-row{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:7px 2px;font:inherit;font-size:13.5px;text-align:left;cursor:pointer}"
  +"#mtbBox .mtb-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mtbBox .mtb-row span.s{color:var(--sub)}#mtbBox .mtb-row span.mtb-ch{flex:0 0 auto;overflow:visible}#mtbBox .mtb-row .mtb-ch{font-size:11px;padding:0 6px}"
  +"#mtbBox .mtb-e{border-top:1px solid var(--line);color:var(--sub);font-size:13px;padding:7px 2px;line-height:1.5}"
  +"#mtbBox .mtb-bw{display:block;width:100%;margin:6px 0 0;border:0;border-radius:999px;padding:7px 18px;background:#2f9e44;color:#fff;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}"
  // 앱 가운데 창
  +"#mtbPop{position:fixed;inset:0;z-index:1045;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}#mtbPop[hidden]{display:none}"
  +"#mtbIn{background:var(--card);color:var(--ink);width:100%;max-width:560px;border-radius:18px;padding:16px 16px 20px;max-height:85vh;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;box-sizing:border-box;box-shadow:0 12px 40px rgba(0,0,0,.3)}"
  +"@media (min-width:700px){#mtbPop{padding:7.5vh 16px}}"
  +"#mtbIn .mtb-ph{display:flex;align-items:center;gap:8px;margin:0 0 12px}#mtbIn .mtb-ph h3{margin:0;font-size:18px;font-weight:800}"
  +"#mtbIn .mtb-x{margin-left:auto;border:0;background:none;color:var(--sub);font-size:15px;cursor:pointer;font-family:inherit}"
  +"#mtbIn .mtb-card{padding:14px}#mtbIn .mtb-msg{padding:20px 14px}";
  D.head.appendChild(s); }

// 한 줄 단추 묶음은 같은 크기 (사장님 11-08) — 묶음 안에서 가장 넓은 단추에 맞춘다
function eq(root){ [].forEach.call(root.querySelectorAll(".mtb-bs,.mtb-pg"),function(g){ var bs=[].slice.call(g.querySelectorAll(".mtb-b")); bs.forEach(function(b){ b.style.minWidth=""; }); var w=0; bs.forEach(function(b){ w=Math.max(w,b.offsetWidth); }); if(w) bs.forEach(function(b){ b.style.minWidth=Math.ceil(w)+"px"; }); }); }

// ── 화면 그리기 — el 하나에 목록·글 읽기·글쓰기 (opts.nav(route) 로 옮겨 다닌다) ──
//   route = {v:"list", page} | {v:"read", id} | {v:"write"}
var VIEWS=[];
function render(el,route,opts){ css(); opts=opts||{}; route=route||{v:"list",page:1};
  var V=el._mtb; if(!V){ V=el._mtb={el:el}; VIEWS=VIEWS.filter(alive); VIEWS.push(V); el.addEventListener("click",function(e){ onClick(V,e); }); el.addEventListener("input",function(e){ onInput(V,e); }); el.addEventListener("keydown",function(e){ onKey(V,e); }); }
  V.route=route; V.nav=opts.nav||function(r){ render(el,r,opts); }; V.mode=opts.mode||"pop"; V.onTop=opts.onTop||null; V.ver=(V.ver||0)+1;
  el.classList.add("mtb"); paint(V); }
function alive(V){ return V.el&&D.body.contains(V.el); }
function go(V,r){ V.nav(r); }
function paint(V){ var r=V.route; if(r.v==="write") return wPaint(V); if(r.v==="read") return rPaint(V); return lPaint(V); }
function chips(x){ var c=[]; if(x.mine) c.push('<span class="mtb-ch m">'+E(L6(TX.mine))+'</span>'); c.push(x.na?'<span class="mtb-ch y">'+E(L6(TX.ansY))+'</span>':'<span class="mtb-ch n">'+E(L6(TX.ansN))+'</span>'); return c.join(""); }

// 목록
function lPaint(V){ var pg=Math.max(1,+V.route.page||1), c=CACHE.list[pg], v=V.ver;
  if(c) lDraw(V,c); else V.el.innerHTML='<div class="mtb-tb"><span class="mtb-n"></span><button type="button" class="mtb-b pri" data-mtb="write">'+E(L6(TX.write))+'</button></div><div class="mtb-msg">'+E(L6(TX.load))+'</div>';
  api("/mtb/list",{page:pg,dev:dev(),sess:sess()}).then(function(j){ if(!j||!j.ok) throw 0; CACHE.list[pg]=j; if(V.ver===v&&alive(V)&&V.route.v==="list") lDraw(V,j); })
  .catch(function(){ if(V.ver!==v||!alive(V)||c) return; V.el.innerHTML='<div class="mtb-msg">'+E(L6(TX.err))+'<div class="mtb-bs c"><button type="button" class="mtb-b" data-mtb="retry">'+E(L6(TX.retry))+'</button></div></div>'; eq(V.el); }); }
function lDraw(V,j){ var it=j.items||[], h='<div class="mtb-tb"><span class="mtb-n">'+E(j.total===1?L6(TX.count1):F6(TX.count,{n:num(j.total)}))+'</span><button type="button" class="mtb-b pri" data-mtb="write">'+E(L6(TX.write))+'</button></div>';
  if(!it.length) h+='<div class="mtb-msg">'+E(L6(TX.none))+'</div>';
  else h+=it.map(function(x){ return '<button type="button" class="mtb-it" data-mtb="open" data-id="'+E(x.id)+'"><div class="mtb-ih"><b>'+(x.sec?"🔒 ":"")+E(x.nick)+'</b><time>'+E(x.at)+'</time><span class="mtb-chs">'+chips(x)+'</span></div>'
    +'<div class="mtb-pv'+(x.sec?" s":"")+'">'+E(x.sec?L6(TX.sec):x.pv)+'</div></button>'; }).join("");
  if(j.pages>1) h+='<div class="mtb-pg"><button type="button" class="mtb-b" data-mtb="pg" data-p="'+(j.page-1)+'"'+(j.page<=1?" disabled":"")+'>‹ '+E(L6(TX.prev))+'</button><span>'+j.page+' / '+j.pages+'</span><button type="button" class="mtb-b" data-mtb="pg" data-p="'+(j.page+1)+'"'+(j.page>=j.pages?" disabled":"")+'>'+E(L6(TX.next))+' ›</button></div>';
  V.el.innerHTML=h; eq(V.el); }

// 글 읽기
function rPaint(V){ var id=String(V.route.id||""), v=V.ver; V.post=null; V.mine=false;
  V.el.innerHTML='<div class="mtb-msg">'+E(L6(TX.load))+'</div>';
  api("/mtb/view",{id:id,pw:PWS[id]||"",dev:dev(),sess:sess()}).then(function(j){ if(V.ver!==v||!alive(V)) return;
    if(j&&j.ok){ V.post=j.post; V.mine=!!j.mine; return rDraw(V); }
    if(j&&j.post&&j.post.sec){ if(j.err==="pw") delete PWS[id]; V.post=j.post; return rLock(V,j.err==="rate"?L6(TX.eLock):""); }
    if(j&&j.err==="notfound"){ V.el.innerHTML='<div class="mtb-msg">'+E(L6(TX.gone))+'<div class="mtb-bs c"><button type="button" class="mtb-b" data-mtb="list">'+E(L6(TX.list))+'</button></div></div>'; eq(V.el); return; }
    throw 0; })
  .catch(function(){ if(V.ver!==v||!alive(V)) return; V.el.innerHTML='<div class="mtb-msg">'+E(L6(TX.err))+'<div class="mtb-bs c"><button type="button" class="mtb-b" data-mtb="list">'+E(L6(TX.list))+'</button><button type="button" class="mtb-b" data-mtb="retry">'+E(L6(TX.retry))+'</button></div></div>'; eq(V.el); }); }
function head(p,mine){ return '<div class="mtb-ih"><b>'+(p.sec?"🔒 ":"")+E(p.nick)+'</b><time>'+E(p.at)+'</time><span class="mtb-chs">'+chips({mine:!!mine,na:p.na})+'</span></div>'; }
function rDraw(V){ var p=V.post, a=p.ans||[];
  var h='<article class="mtb-card">'+head(p,V.mine)+'<div class="mtb-bd">'+E(p.body)+'</div>'
    +(a.length?a.map(function(x){ return '<div class="mtb-ans"><div class="mtb-ah">💬 '+E(L6(TX.ansBy))+'<time>'+E(x.at)+'</time></div><div class="mtb-ab">'+E(x.body)+'</div></div>'; }).join(""):'<div class="mtb-na">'+E(L6(TX.noAns))+'</div>')
    +'</article><div class="mtb-er" id="mtbDe"></div><div class="mtb-bs"><button type="button" class="mtb-b" data-mtb="list">'+E(L6(TX.list))+'</button>'+(V.mine?'<button type="button" class="mtb-b red" data-mtb="del">'+E(L6(TX.del))+'</button>':'')+'</div>';
  V.el.innerHTML=h; eq(V.el); if(V.onTop) V.onTop(); }
function rLock(V,msg){ var p=V.post;
  V.el.innerHTML='<article class="mtb-card">'+head(p)+'<div class="mtb-lock"><p>🔒 '+E(L6(TX.lockT))+'</p><p class="s">'+E(L6(TX.lockAsk))+'</p>'
    +'<div class="mtb-r2"><input type="password" id="mtbLp" maxlength="64" autocomplete="off" placeholder="'+E(L6(TX.pw))+'" aria-label="'+E(L6(TX.pw))+'"><button type="button" class="mtb-b pri" data-mtb="unlock">'+E(L6(TX.ok))+'</button></div>'
    +'<div class="mtb-er" id="mtbLe">'+E(msg||"")+'</div></div></article><div class="mtb-bs"><button type="button" class="mtb-b" data-mtb="list">'+E(L6(TX.list))+'</button></div>';
  eq(V.el); }
function unlock(V){ var i=V.el.querySelector("#mtbLp"), e=V.el.querySelector("#mtbLe"), pw=i?i.value:"", id=V.post&&V.post.id, b=V.el.querySelector('[data-mtb="unlock"]');
  if(!pw){ if(e) e.textContent=L6(TX.ePw); return; } if(b) b.disabled=true;
  api("/mtb/view",{id:id,pw:pw}).then(function(j){ if(!alive(V)) return; if(b) b.disabled=false;
    if(j&&j.ok){ PWS[id]=pw; V.post=j.post; V.mine=true; rDraw(V); return; }
    if(e) e.textContent=L6(j&&j.err==="pw"?TX.ePwBad:j&&j.err==="rate"?TX.eLock:TX.err); try{ i.select(); }catch(x){} })
  .catch(function(){ if(b) b.disabled=false; if(e) e.textContent=L6(TX.err); }); }
function delAsk(V){ var p=V.post; if(!p) return;
  confirmBox(L6(TX.delQ),L6(TX.del),function(done){ api("/mtb/delete",{id:p.id,dev:dev(),sess:sess(),pw:PWS[p.id]||""}).then(function(j){ done();
      if(j&&j.ok){ delete PWS[p.id]; bump(); if(alive(V)) go(V,{v:"list",page:1}); return; }
      var e=V.el.querySelector("#mtbDe"); if(e) e.textContent=L6(j&&j.err==="owner"?TX.eOwner:j&&j.err==="pw"?TX.ePwBad:j&&j.err==="rate"?TX.eLock:TX.eDel); })
    .catch(function(){ done(); var e=V.el.querySelector("#mtbDe"); if(e) e.textContent=L6(TX.eDel); }); }); }
function confirmBox(msg,yes,fn){ css(); var o=D.createElement("div"); o.className="mtb-ov mtb";
  o.innerHTML='<div class="mtb-cf" role="alertdialog" aria-modal="true"><div>'+E(msg)+'</div><div class="mtb-bs"><button type="button" class="mtb-b" data-c="n">'+E(L6(TX.cancel))+'</button><button type="button" class="mtb-b red" data-c="y">'+E(yes)+'</button></div></div>';
  o.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-c]"); if(e.target===o||(b&&b.dataset.c==="n")){ o.remove(); return; } if(b&&b.dataset.c==="y"&&!b.disabled){ b.disabled=true; fn(function(){ o.remove(); }); } });
  D.body.appendChild(o); eq(o); try{ o.querySelector('[data-c="n"]').focus(); }catch(e){} }

// 글쓰기
var DRAFT={nick:null,body:"",sec:false};
function wPaint(V){ var lg=!!sess(), nk=DRAFT.nick!=null?DRAFT.nick:(ls("mpv_bnick")||"");
  V.el.innerHTML='<form class="mtb-f" autocomplete="off" onsubmit="return false"><h3>'+E(L6(TX.write))+'</h3>'
   +'<label class="mtb-lb" for="mtbNk">'+E(L6(TX.nick))+'</label><input type="text" id="mtbNk" maxlength="20" value="'+E(nk)+'" placeholder="'+E(L6(TX.nick))+'">'
   +'<textarea id="mtbTx" maxlength="2000" rows="6" placeholder="'+E(L6(TX.bodyPh))+'" aria-label="'+E(L6(TX.bodyPh))+'" style="margin-top:12px">'+E(DRAFT.body)+'</textarea><div class="mtb-cnt" id="mtbCn"></div>'
   +'<label class="mtb-ck"><input type="checkbox" id="mtbSc"'+(DRAFT.sec?" checked":"")+'><span>🔒 '+E(L6(TX.secChk))+'<small>'+E(L6(TX.secHint))+'</small></span></label>'
   +'<div class="mtb-pw" id="mtbPwB"'+(DRAFT.sec?"":" hidden")+'><input type="password" id="mtbPw" maxlength="64" autocomplete="new-password" placeholder="'+E(L6(TX.pwPh))+'" aria-label="'+E(L6(TX.pw))+'"><small>'+E(L6(TX.pwHint))+'</small></div>'
   +'<div class="mtb-nt" id="mtbNt"></div>'
   +'<div class="mtb-hp" aria-hidden="true"><input id="mtbHp" name="website" tabindex="-1" autocomplete="off"></div>'
   +'<div class="mtb-er" id="mtbWe"></div><div class="mtb-bs"><button type="button" class="mtb-b" data-mtb="wcancel">'+E(L6(TX.cancel))+'</button><button type="button" class="mtb-b pri" data-mtb="send">'+E(L6(TX.post))+'</button></div></form>';
  wNote(V,lg); wCnt(V); eq(V.el); if(V.onTop) V.onTop();
  setTimeout(function(){ try{ var f=V.el.querySelector(nk?"#mtbTx":"#mtbNk"); if(f&&(V.mode==="page"||window.innerWidth>=700)) f.focus({preventScroll:true}); }catch(e){} },30); }
function wNote(V,lg){ var n=V.el.querySelector("#mtbNt"), sc=V.el.querySelector("#mtbSc"); if(!n) return; var s=sc&&sc.checked;
  n.innerHTML=s?"":'<div>'+E(L6(TX.pubNote))+'</div><div>'+E(L6(lg?TX.delAcct:TX.delDev))+'</div>'; }
function wCnt(V){ var t=V.el.querySelector("#mtbTx"), c=V.el.querySelector("#mtbCn"); if(t&&c) c.textContent=num(t.value.length)+" / 2,000"; }
function send(V){ var g=function(s){ return V.el.querySelector(s); }, nk=g("#mtbNk").value.trim(), tx=g("#mtbTx").value.trim(), sc=g("#mtbSc").checked, pw=g("#mtbPw").value, er=g("#mtbWe"), b=g('[data-mtb="send"]');
  var bad=function(k,f){ er.textContent=L6(TX[k]); if(f) try{ g(f).focus(); }catch(e){} };
  if(!nk) return bad("eNick","#mtbNk"); if(!tx) return bad("eBody","#mtbTx"); if(sc&&pw.length<4) return bad("ePw","#mtbPw");
  if(nk.length>20||tx.length>2000) return bad("eLong"); if((tx.match(/https?:\/\/|www\./gi)||[]).length>3) return bad("eLinks","#mtbTx");
  er.textContent=""; b.disabled=true;
  api("/mtb/post",{nick:nk,body:tx,sec:sc?1:0,pw:sc?pw:"",dev:dev(),sess:sess(),hp:g("#mtbHp").value,lang:window.LANG||""}).then(function(j){ b.disabled=false;
    if(j&&j.ok){ ls("mpv_bnick",nk); DRAFT={nick:null,body:"",sec:false}; bump(); if(j.id&&sc) PWS[j.id]=pw; if(alive(V)) go(V,j.id?{v:"read",id:j.id}:{v:"list",page:1}); return; }
    var e=j&&j.err; bad(e==="rate"?"eRate":e==="links"?"eLinks":e==="long"?"eLong":e==="pwshort"?"ePw":e==="empty"?"eBody":"eFail"); })
  .catch(function(){ b.disabled=false; bad("eFail"); }); }

// 단추·입력
function onClick(V,e){ var b=e.target.closest&&e.target.closest("[data-mtb]"); if(!b||b.disabled) return; var k=b.dataset.mtb;
  if(k==="write") return go(V,{v:"write"});
  if(k==="open") return go(V,{v:"read",id:b.dataset.id});
  if(k==="pg") return go(V,{v:"list",page:+b.dataset.p||1});
  if(k==="list") return go(V,{v:"list",page:1});
  if(k==="retry") return paint(V);
  if(k==="unlock") return unlock(V);
  if(k==="del") return delAsk(V);
  if(k==="send") return send(V);
  if(k==="wcancel"){ DRAFT={nick:null,body:"",sec:false}; return go(V,{v:"list",page:1}); } }
function onInput(V,e){ var t=e.target; if(!t||!t.id) return;
  if(t.id==="mtbTx"){ DRAFT.body=t.value; wCnt(V); } else if(t.id==="mtbNk") DRAFT.nick=t.value;
  else if(t.id==="mtbSc"){ DRAFT.sec=t.checked; var p=V.el.querySelector("#mtbPwB"); if(p) p.hidden=!t.checked; wNote(V,!!sess()); if(t.checked) try{ V.el.querySelector("#mtbPw").focus(); }catch(x){} } }
function onKey(V,e){ if(e.key!=="Enter"||!e.target) return; if(e.target.id==="mtbLp"){ e.preventDefault(); unlock(V); } else if(e.target.id==="mtbNk"||e.target.id==="mtbPw"){ e.preventDefault(); } }

// ── 앱 — 아래 「고객 게시판」 칸 + 가운데 창 ──
var BOX={seen:false,j:null,err:false};
function boxPaint(){ var b=D.getElementById("mtbBox"); if(!b) return; css();
  var h='<div class="mtb-bh"><b>'+E(L6(TX.t))+'</b><button type="button" class="mtb-more" data-mb="all">'+E(L6(TX.more))+'</button></div>', j=BOX.j;
  if(j&&j.items&&j.items.length) h+=j.items.slice(0,3).map(function(x){ return '<button type="button" class="mtb-row" data-mb="open" data-id="'+E(x.id)+'"><span'+(x.sec?' class="s"':'')+'>'+(x.sec?"🔒 "+E(L6(TX.sec)):E(x.pv.replace(/\s+/g," ")))+'</span>'+(x.na?'<span class="mtb-ch y">'+E(L6(TX.ansY))+'</span>':'')+'</button>'; }).join("");
  else h+='<div class="mtb-e">'+E(L6(BOX.err?TX.err:j?TX.none:TX.sub))+'</div>';
  h+='<button type="button" class="mtb-bw" data-mb="write">'+E(L6(TX.write))+'</button>';
  b.innerHTML=h; }
function boxLoad(){ api("/mtb/list",{page:1,dev:dev(),sess:sess()}).then(function(j){ if(!j||!j.ok) throw 0; BOX.j=j; BOX.err=false; CACHE.list[1]=j; boxPaint(); }).catch(function(){ BOX.err=!BOX.j; boxPaint(); }); }
function boxInit(){ var b=D.getElementById("mtbBox"); if(!b||b._mtb0) return; b._mtb0=1; boxPaint();
  b.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-mb]"); if(!t) return; var k=t.dataset.mb; open(k==="open"?{v:"read",id:t.dataset.id}:k==="write"?{v:"write"}:{v:"list",page:1}); });
  var start=function(){ if(BOX.seen) return; BOX.seen=true; boxLoad(); };   // 화면에 보일 때만 받는다 (허브 호출 한 번)
  if(window.IntersectionObserver){ var io=new IntersectionObserver(function(es){ if(es.some(function(x){ return x.isIntersecting; })){ io.disconnect(); start(); } },{rootMargin:"300px 0px"}); io.observe(b); } else start(); }
function pop(){ var p=D.getElementById("mtbPop"); if(p) return p; css(); p=D.createElement("div"); p.id="mtbPop"; p.hidden=true;
  p.innerHTML='<div id="mtbIn" role="dialog" aria-modal="true"><div class="mtb-ph"><h3 id="mtbPt"></h3><button type="button" class="mtb-x" data-mp="x"></button></div><div id="mtbPb"></div></div>';
  p.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-mp]"); if(e.target===p||(t&&t.dataset.mp==="x")) close(); });
  D.body.appendChild(p); return p; }
function popHead(){ var t=D.getElementById("mtbPt"), x=D.querySelector("#mtbIn .mtb-x"); if(t) t.textContent=L6(TX.t); if(x) x.textContent=L6(TX.close)+" ✕"; }
function open(route){ var p=pop(); p.hidden=false; popHead(); var top=function(){ try{ D.getElementById("mtbIn").scrollTop=0; }catch(e){} };
  var o={mode:"pop",onTop:top}; o.nav=function(r){ top(); render(D.getElementById("mtbPb"),r,o); };
  render(D.getElementById("mtbPb"),route||{v:"list",page:1},o); top(); }
function close(){ var p=D.getElementById("mtbPop"); if(p) p.hidden=true; }

// 글이 바뀌면(등록·삭제) 아래 칸도 다시 · 로그인·로그아웃하면 「내 글」·삭제 단추가 달라져 다시 · 언어를 바꾸면 다시
D.addEventListener("mtbchange",function(){ if(BOX.seen) boxLoad(); });
D.addEventListener("mppg",function(){ CACHE.list={}; VIEWS.forEach(function(V){ if(alive(V)&&V.route&&V.route.v!=="write") paint(V); }); });
function relang(){ boxPaint(); popHead(); VIEWS.forEach(function(V){ if(!alive(V)) return; if(V.route.v==="read"&&V.post){ if(V.post.body!=null) rDraw(V); else rLock(V,""); } else if(V.route.v==="list"&&CACHE.list[+V.route.page||1]) lDraw(V,CACHE.list[+V.route.page||1]); else paint(V); }); }
var _sl=window.setLang; if(typeof _sl==="function"&&!_sl._mtb){ var w=function(){ var r=_sl.apply(this,arguments); try{ relang(); }catch(e){} return r; }; w._mtb=1; for(var k in _sl) if(Object.prototype.hasOwnProperty.call(_sl,k)&&!(k in w)) w[k]=_sl[k]; window.setLang=w; }
D.addEventListener("keydown",function(e){ if(e.key==="Escape"){ var o=D.querySelector(".mtb-ov"); if(o){ o.remove(); return; } var p=D.getElementById("mtbPop"); if(p&&!p.hidden) close(); } });

window.MTB={render:render,open:open,close:close,boxPaint:boxPaint,TX:TX,L6:L6};
if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",boxInit); else boxInit();
})();
