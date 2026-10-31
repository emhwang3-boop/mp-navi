/* 머니퍼즐 투어 — 무료 노래방 + 유료 콘텐츠 사용 통계 (사장님 2026-10-26)
 *  · 구 화면 노래방 그림(gu_build KARA → act "__kara_<code>")을 누르면 노래방 방처럼 어두운 화면
 *  · 노래 = 금영 노래방 공식 유튜브 채널(UCDqaUIUSJP5EVMEI178Zfag) 영상만 — 허브 /kara 가 고른다 (10-30 사장님 「금영으로 맞춰」)
 *    재생은 유튜브 퍼가기 플레이어(IFrame API) 그대로(광고·로고 안 가림), 퍼가기 막힌 영상(오류 101·150)은 다음 곡으로 · 무료
 *  · 단추의 채널 그림 = 금영 공식 채널 프로필 이미지 그대로(img/kara/ky.jpg, 유튜브에서 받은 원본)
 *  · mpPaid — PC방·노래방·넷플릭스/유튜브 상영관 누름·나감·사용 시간(초)을 허브 /ntap(pc_*)로. 숫자만, 사장님 기기는 안 보냄
 */
(function(){
"use strict";
function L(o){ return o[window.LANG]||o.en; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
// ── 사용 통계 ──
var P={k:null,t0:0,outAt:0,hidAt:0};
function send(k,e,n){ try{ if(!/^[A-Za-z0-9_-]{1,64}$/.test(k)) return; var x=0, own=false; try{ x=localStorage.getItem("mpv_ntt")?1:0; own=!!localStorage.getItem("mp_owner"); }catch(z){} if(own&&!x) return;
  var b=JSON.stringify({k:k,e:e,n:n||0,x:x}); if(navigator.sendBeacon&&navigator.sendBeacon(HUB+"/ntap",new Blob([b],{type:"text/plain"}))) return; fetch(HUB+"/ntap",{method:"POST",body:b,keepalive:true}).catch(function(){}); }catch(z){} }
function flush(){ if(!P.k||!P.t0) return; var s=Math.round((Date.now()-P.t0)/1000); if(s>0) send(P.k,"pc_time",s); P.t0=Date.now(); }
var mpPaid={ start:function(k){ if(P.k===k) return; mpPaid.end(); P.k=k; P.t0=Date.now(); P.outAt=0; send(k,"pc_open"); },
  end:function(){ if(!P.k) return; flush(); P.k=null; P.t0=0; P.outAt=0; },
  out:function(){ if(!P.k) return; flush(); P.outAt=Date.now(); send(P.k,"pc_out"); }, cur:function(){ return P.k; } };
window.mpPaid=mpPaid;
document.addEventListener("visibilitychange",function(){ if(!P.k) return;
  if(document.hidden){ if(P.outAt){ flush(); P.hidAt=Date.now(); } else { flush(); P.t0=0; } }   // 바깥 사이트로 나간 경우만 숨은 동안도 사용 시간
  else { if(P.outAt&&P.hidAt){ var s=Math.round((Date.now()-P.hidAt)/1000); if(s>0) send(P.k,"pc_time",s); } P.hidAt=0; P.outAt=0; P.t0=Date.now(); } });
window.addEventListener("pagehide",function(){ flush(); });
var PAIDK={netflixth:1,youtubeth:1};
var _ps=window.placeShow; if(_ps) window.placeShow=function(k){ var r=_ps.apply(this,arguments); try{ if(PAIDK[k]) mpPaid.start(k); else if(!document.getElementById("karBox")) mpPaid.end(); }catch(e){} return r; };
var _rc=window.resClear; if(_rc) window.resClear=function(){ var r=_rc.apply(this,arguments); try{ if(P.k&&!/^kara_/.test(P.k)) mpPaid.end(); }catch(e){} return r; };
document.addEventListener("click",function(e){ if(!P.k||/^kara_/.test(P.k)) return; var a=e.target.closest&&e.target.closest("#res a[href], #res button"); if(!a||a.classList.contains("xbtn")) return;
  if(a.tagName==="A"||/app|open|열기|앱/i.test(a.textContent||"")) mpPaid.out(); },true);

// ── 노래방 이용 기록 (사장님 10-30 「지금 무료 노래방부터」 — 음악저작권협회 곡별 사용료 정산 대비) ──
//  한 번 부를 때 한 줄 → 허브 /nkara. 같은 줄(pid)을 시작·1분마다·멈춤·끝·화면 떠날 때 덮어쓴다(sendBeacon)
//  보내는 것: 곡(영상 id·번호·제목·가수·회사·원래 유튜브 제목)·재생 초·끝까지·영상 길이·재생 방식(앱 안/유튜브로)·언어·결제 금액(지금 0원)
//  이용자: 로그인 세션(허브가 uid 해시로 바꿈) 또는 기기 무작위 번호(mpv_dev, 허브가 해시로 바꿈) — 이름·이메일 안 보냄
var KLG=null, KLI=0;
function klDev(){ var d=""; try{ d=localStorage.getItem("mpv_dev")||""; if(!/^[0-9a-f]{16,32}$/.test(d)){ d=Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(12)),function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); localStorage.setItem("mpv_dev",d); } }catch(e){} return d; }
function klSplit(x){ var t=String(x.t||""), i=t.indexOf(" - "); if(i<0) return [t,""]; var a=t.slice(0,i).trim(), b=t.slice(i+3).trim();
  return [b,a]; }   // 금영 제목 「가수 - 제목」 (원래 제목 rt 도 같이 남긴다)
function klNew(x,mode){ var r="",i; for(i=0;i<6;i++) r+="abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*36)]; var ta=klSplit(x);
  return {pid:Date.now().toString(36)+"-"+r,id:x.id,no:x.no||"",t:ta[0],a:ta[1],ch:x.ch,rt:x.rt||x.t||"",lyr:x.lyr||"",cmp:x.cmp||"",mode:mode,acc:0,run:0,full:0,dur:0,pos:0,won:0,end:0}; }   // won = 결제 금액(지금 무료 0원, 이용권 쓰면 1000)
function klTick(){ var g=KLG; if(!g) return; var n=Date.now(); if(g.run){ g.acc+=n-g.run; g.run=n; }
  if(g.mode==="embed"&&K.pl&&K.ready){ try{ var d=+K.pl.getDuration()||0, p=+K.pl.getCurrentTime()||0; if(d>0) g.dur=Math.round(d); if(p>g.pos) g.pos=Math.round(p); if(d>0&&p>=d-3) g.full=1; }catch(e){} } }
function klSend(){ var g=KLG; if(!g) return; try{ var x=0, own=0, ss=""; try{ x=localStorage.getItem("mpv_ntt")?1:0; own=localStorage.getItem("mp_owner")?1:0; ss=localStorage.getItem("mpv_pg_sess")||""; }catch(z){}
  var b=JSON.stringify({pid:g.pid,id:g.id,no:g.no,t:g.t.slice(0,120),a:g.a.slice(0,80),ch:g.ch,rt:g.rt.slice(0,160),lyr:g.lyr,cmp:g.cmp,mode:g.mode,sec:Math.round(g.acc/1000),dur:g.dur,pos:g.pos,full:g.full,l:window.LANG||"",dev:klDev(),sess:ss,won:g.won,own:own,x:x});
  window.karLastLog=b;   // 화면 확인용(마지막으로 보낸 줄)
  if(navigator.sendBeacon&&navigator.sendBeacon(HUB+"/nkara",new Blob([b],{type:"text/plain"}))) return; fetch(HUB+"/nkara",{method:"POST",body:b,keepalive:true}).catch(function(){}); }catch(e){} }
function klEnd(){ if(!KLG) return; if(!KLG.end){ klTick(); KLG.run=0; klSend(); } KLG=null; }
function klState(s){ var x=K.cur; if(!x) return; var n=Date.now();
  if(s===1){ if(!KLG||KLG.end||KLG.id!==x.id){ klEnd(); KLG=klNew(x,"embed"); KLG.run=n; klTick(); klSend(); } else if(!KLG.run) KLG.run=n; return; }   // 재생 시작 = 한 줄 (껐다 켜면 새 줄)
  if(!KLG||KLG.end) return; klTick(); KLG.run=0;
  if(s===0){ KLG.full=1; klSend(); KLG.end=1; } else if(s===2) klSend(); }   // 0 끝 · 2 멈춤
function klYt(x){ klEnd(); KLG=klNew(x,"yt"); klSend(); KLG.end=1; KLG=null; }   // 유튜브로 보냄 — 재생 시간은 모른다
setInterval(function(){ if(KLG&&KLG.run&&!KLG.end){ klTick(); klSend(); } },60000);
document.addEventListener("visibilitychange",function(){ if(document.hidden&&KLG&&!KLG.end){ klTick(); klSend(); } });
window.addEventListener("pagehide",function(){ if(KLG&&!KLG.end){ klTick(); klSend(); } });

// ── 노래방 ──
var CH={ky:{n:{ko:"금영노래방 공식 채널",en:"KY Karaoke (official)",ja:"KYカラオケ 公式",zhs:"金永(KY) 练歌房 官方",zht:"金永(KY) 練歌房 官方",es:"KY Karaoke (oficial)"},u:"https://www.youtube.com/channel/UCDqaUIUSJP5EVMEI178Zfag",i:"img/kara/ky.jpg"}};
var TABS=[["kpop","K-POP"],["pop","Pop"],["jpop","J-POP"]];   // 중국 노래는 금영 공식 채널에 없어서 탭을 안 둔다 (10-26 확인)
var TX={
 t:{ko:"노래방",en:"Karaoke",ja:"カラオケ",zhs:"KTV 练歌房",zht:"KTV 練歌房",es:"Karaoke"},
 s:{ko:"금영 노래방 공식 유튜브 채널의 노래방 영상",en:"Karaoke videos from the official KY (Kumyoung) YouTube channel",ja:"KY（クミョン）公式YouTubeチャンネルのカラオケ動画",zhs:"来自金永（KY）官方YouTube频道的卡拉OK视频",zht:"來自金永（KY）官方YouTube頻道的卡拉OK影片",es:"Vídeos de karaoke de los canal oficial de KY (Kumyoung) en YouTube"},
 q:{ko:"노래 제목·가수 검색",en:"Search song or artist",ja:"曲名・歌手で検索",zhs:"搜索歌名或歌手",zht:"搜尋歌名或歌手",es:"Buscar canción o artista"},
 go:{ko:"검색",en:"Search",ja:"検索",zhs:"搜索",zht:"搜尋",es:"Buscar"},
 ld:{ko:"노래를 불러오는 중…",en:"Loading songs…",ja:"曲を読み込み中…",zhs:"正在加载歌曲…",zht:"正在載入歌曲…",es:"Cargando canciones…"},
 no:{ko:"검색된 노래가 없어요.",en:"No songs found.",ja:"曲が見つかりませんでした。",zhs:"没有找到歌曲。",zht:"沒有找到歌曲。",es:"No se encontraron canciones."},
 pick:{ko:"아래에서 노래를 선택하세요",en:"Pick a song below",ja:"下から曲を選んでください",zhs:"请在下面选歌",zht:"請在下面選歌",es:"Elige una canción abajo"},
 yt:{ko:"이 곡은 유튜브에서만 재생돼요",en:"This song plays only on YouTube",ja:"この曲はYouTubeでのみ再生できます",zhs:"这首歌只能在YouTube上播放",zht:"這首歌只能在YouTube上播放",es:"Esta canción solo se reproduce en YouTube"},
 ytb:{ko:"유튜브에서 재생",en:"Open on YouTube",ja:"YouTubeで開く",zhs:"在YouTube打开",zht:"在YouTube開啟",es:"Abrir en YouTube"},
 ytt:{ko:"유튜브에서",en:"on YouTube",ja:"YouTubeで",zhs:"在YouTube",zht:"在YouTube",es:"en YouTube"},
 lo:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 x:{ko:"퇴장",en:"Leave",ja:"出る",zhs:"离开",zht:"離開",es:"Salir"},
 // 노래방 곡 이용권 판매 (사장님 10-27 「1,000원당 1곡, 기계의 돈 넣는 곳에 PAYMENT」 → 10-30 「카드사 심사에 보여 줄 판매 화면」 · 묶음 1 / 3+1 / 5+2 / 10+5)
 //  곡 이용권 = 정식 반주 곡용 · 결제는 시험(UNDER TESTING, 토스 시험 키)
  kb:{ko:"이용권",en:"Karaoke pass",ja:"利用券",zhs:"畅唱券",zht:"暢唱券",es:"Bono de karaoke"},   // (10-31) 곡 이용권 → 기간 이용권
  kbs:{ko:"1·3·6·12개월 · 기간 안에는 노래 무제한",en:"1, 3, 6 or 12 months · unlimited singing",ja:"1・3・6・12か月・期間中は歌い放題",zhs:"1·3·6·12个月 · 有效期内无限畅唱",zht:"1·3·6·12個月 · 有效期內無限暢唱",es:"1, 3, 6 o 12 meses · canta sin límite"},
 kbuy:{ko:"곡 이용권 구매",en:"Buy song pass",ja:"曲チケットを買う",zhs:"购买点歌券",zht:"購買點歌券",es:"Comprar bono"},
 slot:{ko:"충전",en:"Insert here",ja:"投入口",zhs:"投币口",zht:"投幣口",es:"Introduce aquí"},
 left:{ko:"잔여 곡",en:"Songs left",ja:"残り曲数",zhs:"剩余歌曲",zht:"剩餘歌曲",es:"Canciones"},
 lgin:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Entrar"},
 lgReq:{ko:"로그인 후 이용할 수 있습니다.",en:"Please sign in to continue.",ja:"ログインするとご利用いただけます。",zhs:"请登录后使用。",zht:"請登入後使用。",es:"Inicia sesión para continuar."},
 keep:{ko:"잔여 곡은 1년 보관, 미사용 곡은 환불 요청 가능",en:"Unused songs kept for 1 year · refund on request",ja:"残った曲は1年保管・歌っていない曲は返金申請可",zhs:"剩余歌曲保留1年 · 未唱歌曲可申请退款",zht:"剩餘歌曲保留1年 · 未唱歌曲可申請退款",es:"Las canciones sin usar se guardan 1 año · reembolso a petición"},
 svc:{ko:"서비스 {b}곡",en:"+{b} bonus",ja:"サービス{b}曲",zhs:"赠送{b}首",zht:"贈送{b}首",es:"+{b} de regalo"},
 per:{ko:"곡당 {w}",en:"{w} per song",ja:"1曲あたり{w}",zhs:"每首{w}",zht:"每首{w}",es:"{w} por canción"},
 sN:{ko:"{n}곡",en:"{n} songs",ja:"{n}曲",zhs:"{n}首",zht:"{n}首",es:"{n} canciones"},
 sN1:{ko:"{n}곡",en:"{n} song",ja:"{n}曲",zhs:"{n}首",zht:"{n}首",es:"{n} canción"},
 tot:{ko:"결제 금액",en:"Amount",ja:"お支払い金額",zhs:"支付金额",zht:"付款金額",es:"Importe"},
 pay:{ko:"결제",en:"Pay",ja:"支払う",zhs:"付款",zht:"付款",es:"Pagar"},
 nxt:{ko:"다음",en:"Next",ja:"次へ",zhs:"下一步",zht:"下一步",es:"Siguiente"},
 cancel:{ko:"취소",en:"Cancel",ja:"キャンセル",zhs:"取消",zht:"取消",es:"Cancelar"},
 back:{ko:"이전",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Volver"},
 sel:{ko:"선택한 묶음",en:"Selected pack",ja:"選んだパック",zhs:"所选套餐",zht:"所選套餐",es:"Pack elegido"},
 rcv:{ko:"지급 곡",en:"Songs you get",ja:"受け取る曲数",zhs:"获得歌曲",zht:"獲得歌曲",es:"Canciones que recibes"},
  sgn:{ko:"이용권은 로그인한 계정에 적용되므로, 구매하려면 로그인이 필요합니다.",en:"The pass is linked to your account, so please sign in to buy.",ja:"利用券はアカウントに適用されるため、購入にはログインが必要です。",zhs:"畅唱券绑定您的账户，购买前请先登录。",zht:"暢唱券綁定您的帳戶，購買前請先登入。",es:"El bono se vincula a tu cuenta, así que inicia sesión para comprar."},
 cu:{ko:"구매자 정보",en:"Your details",ja:"ご購入者情報",zhs:"购买人信息",zht:"購買人資訊",es:"Tus datos"},
 cn:{ko:"이름 (필수)",en:"Name (required)",ja:"お名前（必須）",zhs:"姓名（必填）",zht:"姓名（必填）",es:"Nombre (obligatorio)"},
 cp:{ko:"휴대폰 (필수)",en:"Mobile phone (required)",ja:"携帯電話（必須）",zhs:"手机（必填）",zht:"手機（必填）",es:"Móvil (obligatorio)"},
 ce:{ko:"이메일 (필수)",en:"Email (required)",ja:"メール（必須）",zhs:"邮箱（必填）",zht:"電子郵件（必填）",es:"Correo electrónico (obligatorio)"},
 cpn:{ko:"입력한 이름·휴대폰·이메일은 결제 안내와 환불 처리에만 사용합니다.",en:"Your name, phone and email are used only for payment notices and refunds.",ja:"入力したお名前・携帯電話・メールは決済のご案内と返金処理にのみ使います。",zhs:"您填写的姓名、手机、邮箱仅用于付款通知和退款处理。",zht:"您填寫的姓名、手機、電子郵件僅用於付款通知和退款處理。",es:"Tu nombre, móvil y correo solo se usan para avisos de pago y reembolsos."},
 pm:{ko:"결제 수단",en:"Payment method",ja:"お支払い方法",zhs:"付款方式",zht:"付款方式",es:"Método de pago"},
 card:{ko:"신용·체크카드 (해외 카드 포함)",en:"Credit/debit card (incl. overseas cards)",ja:"クレジット・デビットカード（海外カード可）",zhs:"信用卡/借记卡（含境外卡）",zht:"信用卡/簽帳卡（含境外卡）",es:"Tarjeta de crédito/débito (incl. extranjeras)"},
 agr:{ko:"주문 내용·이용약관·환불 규정을 확인했으며 결제에 동의합니다",en:"I have checked the order, Terms and Refund Policy and agree to pay",ja:"注文内容・利用規約・返金規定を確認し、支払いに同意します",zhs:"我已确认订单、使用条款和退款规定并同意付款",zht:"我已確認訂單、使用條款和退款規定並同意付款",es:"He revisado el pedido, los Términos y la Política de reembolso y acepto pagar"},
 tL:{ko:"이용약관",en:"Terms",ja:"利用規約",zhs:"使用条款",zht:"使用條款",es:"Términos"},
 rL:{ko:"환불 규정",en:"Refund policy",ja:"返金規定",zhs:"退款规定",zht:"退款規定",es:"Reembolsos"},
 pL:{ko:"개인정보처리방침",en:"Privacy policy",ja:"プライバシーポリシー",zhs:"隐私政策",zht:"隱私政策",es:"Privacidad"},
 pdT:{ko:"결제 완료",en:"Payment complete",ja:"お支払い完了",zhs:"付款完成",zht:"付款完成",es:"Pago completado"},
 pfT:{ko:"결제가 취소되었거나 완료되지 않았어요.",en:"The payment was cancelled or not completed.",ja:"お支払いがキャンセルされたか、完了しませんでした。",zhs:"付款已取消或未完成。",zht:"付款已取消或未完成。",es:"El pago se canceló o no se completó."},
 oid:{ko:"주문번호",en:"Order no.",ja:"注文番号",zhs:"订单号",zht:"訂單號",es:"N.º de pedido"},
 sav:{ko:"저장 중…",en:"Saving…",ja:"保存中…",zhs:"保存中…",zht:"儲存中…",es:"Guardando…"},
 opn:{ko:"결제창 실행 중…",en:"Opening payment…",ja:"決済画面を開いています…",zhs:"正在打开付款页面…",zht:"正在開啟付款頁面…",es:"Abriendo el pago…"},
 enm:{ko:"이름을 입력해 주세요.",en:"Please enter your name.",ja:"お名前を入力してください。",zhs:"请填写姓名。",zht:"請填寫姓名。",es:"Escribe tu nombre."},
 eem:{ko:"이메일 주소를 확인해 주세요.",en:"Please check your email address.",ja:"メールアドレスをご確認ください。",zhs:"请检查邮箱地址。",zht:"請檢查電子郵件地址。",es:"Revisa tu correo electrónico."},
 eph:{ko:"휴대폰 번호를 확인해 주세요.",en:"Please check your phone number.",ja:"携帯電話番号をご確認ください。",zhs:"请检查手机号码。",zht:"請檢查手機號碼。",es:"Revisa tu número de móvil."},
 efail:{ko:"저장하지 못했어요. 잠시 후 다시 시도해 주세요.",en:"Could not save. Please try again shortly.",ja:"保存できませんでした。しばらくしてからもう一度お試しください。",zhs:"保存失败，请稍后再试。",zht:"儲存失敗，請稍後再試。",es:"No se pudo guardar. Inténtalo de nuevo en un momento."},
 esess:{ko:"로그인이 해제되었어요. 다시 로그인해 주세요.",en:"Your sign-in expired. Please sign in again.",ja:"ログインが切れました。もう一度ログインしてください。",zhs:"登录已失效，请重新登录。",zht:"登入已失效，請重新登入。",es:"Tu sesión caducó. Vuelve a iniciar sesión."},
 // 공지사항 — 첫 줄(가격)과 예시는 가격표(허브)로 그때그때 만든다
 rec:{"ko": "● 녹화", "en": "● Record", "ja": "● 録画", "zhs": "● 录像", "zht": "● 錄影", "es": "● Grabar"},
 bgT:{"ko": "배경", "en": "Background", "ja": "背景", "zhs": "背景", "zht": "背景", "es": "Fondo"},
 bgNone:{"ko": "없음", "en": "None", "ja": "なし", "zhs": "无", "zht": "無", "es": "Ninguno"},
 bgBlur:{"ko": "흐림 효과", "en": "Blur", "ja": "ぼかし", "zhs": "模糊", "zht": "模糊", "es": "Difuminar"},
 bgStage:{"ko": "노래방 무대", "en": "Stage", "ja": "ステージ", "zhs": "舞台", "zht": "舞台", "es": "Escenario"},
 bgConcert:{"ko": "콘서트장", "en": "Concert", "ja": "コンサート", "zhs": "演唱会", "zht": "演唱會", "es": "Concierto"},
 bgBeach:{"ko": "바닷가", "en": "Beach", "ja": "ビーチ", "zhs": "海边", "zht": "海邊", "es": "Playa"},
 bgNamsan:{"ko": "남산 야경", "en": "Namsan night", "ja": "南山の夜景", "zhs": "南山夜景", "zht": "南山夜景", "es": "Namsan de noche"},
 bgNo:{"ko": "배경을 사용할 수 없어요", "en": "Background isn't available", "ja": "背景を使えません", "zhs": "无法使用背景", "zht": "無法使用背景", "es": "El fondo no está disponible"},
 thT:{"ko": "테마방", "en": "Theme room", "ja": "テーマルーム", "zhs": "主题房", "zht": "主題房", "es": "Sala temática"},
 aiMk:{"ko": "상황 사진 생성", "en": "Make a scene photo", "ja": "シーン写真を作る", "zhs": "制作情景照片", "zht": "製作情境照片", "es": "Crear foto temática"},
 aiPick:{"ko": "장면을 선택해 주세요", "en": "Pick a scene", "ja": "シーンを選んでください", "zhs": "请选择场景", "zht": "請選擇場景", "es": "Elige una escena"},
 aiRnd:{"ko": "장면 변경", "en": "Another scene", "ja": "別のシーン", "zhs": "换个场景", "zht": "換個場景", "es": "Otra escena"},
 aiIng:{"ko": "생성 중…", "en": "Drawing…", "ja": "描いています…", "zhs": "正在绘制…", "zht": "正在繪製…", "es": "Dibujando…"},
 aiProf:{"ko": "저장(프로필로 사용)", "en": "Save (use as profile)", "ja": "保存（プロフィールに使う）", "zhs": "保存（用作头像）", "zht": "儲存（用作頭像）", "es": "Guardar (usar como perfil)"},
 aiCard:{"ko": "공유 카드로 사용", "en": "Use as share card", "ja": "共有カードに使う", "zhs": "用作分享卡片", "zht": "用作分享卡片", "es": "Usar como tarjeta para compartir"},
 aiX:{"ko": "닫기", "en": "Close", "ja": "閉じる", "zhs": "关闭", "zht": "關閉", "es": "Cerrar"},
 aiCap:{"ko": "오늘 생성 한도에 도달했어요. 내일 다시 이용해 주세요.", "en": "That's all for today. Please try again tomorrow.", "ja": "今日はここまでです。また明日お試しください。", "zhs": "今天就到这里，请明天再试。", "zht": "今天就到這裡，請明天再試。", "es": "Eso es todo por hoy. Vuelve a intentarlo mañana."},
 aiF:{"ko": "사진 생성에 실패했어요. 잠시 후 다시 시도해 주세요.", "en": "Couldn't make the photo. Please try again shortly.", "ja": "写真を作れませんでした。しばらくしてからもう一度お試しください。", "zhs": "无法生成照片，请稍后再试。", "zht": "無法產生照片，請稍後再試。", "es": "No se pudo crear la foto. Inténtalo de nuevo en un momento."},
 aiN:{"ko": "실제 얼굴은 녹화한 본인만 사용하고, 함께 등장하는 다른 사람은 AI가 생성한 가상 인물이에요.", "en": "Only your own face from the recording is real; everyone else is a fictional AI-generated person.", "ja": "実際の顔は録画したご本人だけで、一緒に写る人はAIが作った架空の人物です。", "zhs": "只使用录像中您本人的真实面孔，其他人物均为AI生成的虚拟人物。", "zht": "只使用錄影中您本人的真實面孔，其他人物均為AI生成的虛擬人物。", "es": "Solo tu cara de la grabación es real; las demás personas son ficticias, creadas por IA."},
 aiLb:{"ko": "AI 생성", "en": "AI-generated", "ja": "AI生成", "zhs": "AI生成", "zht": "AI生成", "es": "Generado por IA"},
 aiPOk:{"ko": "프로필 사진으로 저장했어요", "en": "Saved as your profile photo", "ja": "プロフィール写真に保存しました", "zhs": "已保存为头像", "zht": "已儲存為頭像", "es": "Guardada como foto de perfil"},
 aiCOk:{"ko": "노래를 게시하면 이 사진이 공유 카드로 사용돼요", "en": "This photo becomes the share card when you post", "ja": "投稿するとこの写真が共有カードになります", "zhs": "发布后此照片将作为分享卡片", "zht": "發布後此照片將作為分享卡片", "es": "Esta foto será la tarjeta al publicar"},
 aiG:{ko:"AI 사진",en:"AI photos",ja:"AI写真",zhs:"AI照片",zht:"AI照片",es:"Fotos IA"},
 aivMk:{ko:"AI 영상 생성",en:"Make an AI video",ja:"AI動画を作る",zhs:"生成AI视频",zht:"產生AI影片",es:"Crear video IA"},
 aivT:{ko:"AI 영상",en:"AI video",ja:"AI動画",zhs:"AI视频",zht:"AI影片",es:"Video IA"},
 aivTh:{ko:"테마 선택",en:"Choose a theme",ja:"テーマを選ぶ",zhs:"选择主题",zht:"選擇主題",es:"Elige un tema"},
 aivScH:{ko:"장면 선택",en:"Choose a scene",ja:"シーンを選ぶ",zhs:"选择场景",zht:"選擇場景",es:"Elige una escena"},
 aivSeg:{ko:"구간 선택 (최대 {n}초)",en:"Choose the clip (up to {n} s)",ja:"区間を選ぶ（最大{n}秒）",zhs:"选择片段（最长{n}秒）",zht:"選擇片段（最長{n}秒）",es:"Elige el fragmento (hasta {n} s)"},
 aivSecs:{ko:"{n}초",en:"{n} s",ja:"{n}秒",zhs:"{n}秒",zht:"{n}秒",es:"{n} s"},
 aivSegN:{ko:"음량이 가장 큰 구간을 자동 선택했습니다. 막대를 움직여 변경할 수 있습니다.",en:"The loudest part is selected. Move the slider to change it.",ja:"音量がいちばん大きい区間を自動で選びました。バーを動かして変更できます。",zhs:"已自动选择音量最大的片段，拖动滑块即可更改。",zht:"已自動選擇音量最大的片段，拖動滑桿即可變更。",es:"Se eligió la parte con más volumen. Mueve el control para cambiarla."},
 aivPv:{ko:"구간 미리 보기",en:"Preview clip",ja:"区間をプレビュー",zhs:"预览片段",zht:"預覽片段",es:"Vista previa"},
 aivPrep:{ko:"구간 준비 중… {p}%",en:"Preparing clip… {p}%",ja:"区間を準備中… {p}%",zhs:"正在准备片段… {p}%",zht:"正在準備片段… {p}%",es:"Preparando fragmento… {p}%"},
 aivSend:{ko:"전송 중…",en:"Uploading…",ja:"送信中…",zhs:"正在上传…",zht:"正在上傳…",es:"Subiendo…"},
 aivIng:{ko:"생성 중… 4~5분",en:"Generating… 4–5 min",ja:"生成中… 4〜5分",zhs:"生成中… 4~5分钟",zht:"產生中… 4~5分鐘",es:"Generando… 4–5 min"},
 aivBg:{ko:"화면을 닫아도 생성은 계속되며, 완성되면 「내 AI 사진」 모음의 AI 영상에 저장됩니다. 실패하면 포인트는 자동 환불됩니다.",en:"You can close this screen; generation continues and the video is saved under AI videos in \u201cMy AI photos\u201d. If it fails, your points are refunded automatically.",ja:"画面を閉じても生成は続き、完成すると「自分のAI写真」のAI動画に保存されます。失敗した場合、ポイントは自動で返金されます。",zhs:"关闭此画面也会继续生成，完成后保存在「我的AI照片」的AI视频中。生成失败时积分会自动退还。",zht:"關閉此畫面也會繼續產生，完成後儲存在「我的AI照片」的AI影片中。產生失敗時點數會自動退還。",es:"Puedes cerrar esta pantalla: la generación sigue y el video se guarda en Videos IA de \u201cMis fotos IA\u201d. Si falla, los puntos se reembolsan automáticamente."},
 aivOk:{ko:"완성되었습니다. 재생하면 녹화한 노래 소리가 함께 나옵니다.",en:"Done! Your recorded singing plays along with the video.",ja:"完成しました。再生すると録画した歌声も一緒に流れます。",zhs:"完成了！播放时会同时播放您录制的歌声。",zht:"完成了！播放時會同時播放您錄製的歌聲。",es:"¡Listo! Al reproducir se oye tu canto grabado."},
 aivPost:{ko:"게시 영상으로 사용",en:"Use as my post video",ja:"投稿動画に使う",zhs:"用作发布视频",zht:"用作發布影片",es:"Usar como video para publicar"},
 aivSave:{ko:"저장/공유",en:"Save / Share",ja:"保存/共有",zhs:"保存/分享",zht:"儲存/分享",es:"Guardar / Compartir"},
 aivSv:{ko:"저장",en:"Save",ja:"保存",zhs:"保存",zht:"儲存",es:"Guardar"},
 aivSh:{ko:"공유",en:"Share",ja:"共有",zhs:"分享",zht:"分享",es:"Compartir"},
 aivMix:{ko:"영상 합성 중… {p}%",en:"Combining video… {p}%",ja:"動画を合成中… {p}%",zhs:"正在合成视频… {p}%",zht:"正在合成影片… {p}%",es:"Combinando video… {p}%"},
 aivMixF:{ko:"영상 합성에 실패했습니다. 다시 시도해 주세요.",en:"Couldn't combine the video. Please try again.",ja:"動画を合成できませんでした。もう一度お試しください。",zhs:"视频合成失败，请重试。",zht:"影片合成失敗，請重試。",es:"No se pudo combinar el video. Inténtalo de nuevo."},
 aivPostOk:{ko:"AI 영상을 게시 영상으로 설정했습니다.",en:"The AI video is set as your post video.",ja:"AI動画を投稿動画に設定しました。",zhs:"已将AI视频设为发布视频。",zht:"已將AI影片設為發布影片。",es:"El video IA quedó como video para publicar."},
 aivF:{ko:"영상 생성에 실패했습니다. 포인트는 자동 환불되었습니다.",en:"The video couldn't be generated. Your points have been refunded.",ja:"動画を生成できませんでした。ポイントは自動で返金されました。",zhs:"视频生成失败，积分已自动退还。",zht:"影片產生失敗，點數已自動退還。",es:"No se pudo generar el video. Los puntos se reembolsaron."},
 aivF0:{ko:"영상 생성을 시작하지 못했습니다. 포인트는 차감되지 않았습니다. 잠시 후 다시 시도해 주세요.",en:"Couldn't start the video. No points were used. Please try again shortly.",ja:"動画の生成を開始できませんでした。ポイントは使われていません。しばらくしてからお試しください。",zhs:"无法开始生成视频，未扣除积分。请稍后再试。",zht:"無法開始產生影片，未扣除點數。請稍後再試。",es:"No se pudo iniciar el video. No se usaron puntos. Inténtalo en un momento."},
 aivCapU:{ko:"오늘 AI 영상 생성 한도(1인 {n}편)에 도달했습니다. 내일 다시 이용해 주세요.",en:"You've reached today's AI video limit ({n} per person). Please try again tomorrow.",ja:"本日のAI動画の上限（1人{n}本）に達しました。また明日ご利用ください。",zhs:"已达到今天的AI视频上限（每人{n}个），请明天再试。",zht:"已達到今天的AI影片上限（每人{n}支），請明天再試。",es:"Llegaste al límite de videos IA de hoy ({n} por persona). Vuelve mañana."},
 aivShort:{ko:"녹화가 너무 짧습니다 (최소 3초).",en:"The recording is too short (at least 3 s).",ja:"録画が短すぎます（3秒以上）。",zhs:"录像太短（至少3秒）。",zht:"錄影太短（至少3秒）。",es:"La grabación es muy corta (mínimo 3 s)."},
 aivLong:{ko:"구간이 너무 깁니다. 15초 이하로 선택해 주세요.",en:"The clip is too long. Please choose 15 s or less.",ja:"区間が長すぎます。15秒以下にしてください。",zhs:"片段太长，请选择15秒以内。",zht:"片段太長，請選擇15秒以內。",es:"El fragmento es muy largo. Elige 15 s o menos."},
 aivNo:{ko:"이 기기에서는 구간 준비를 지원하지 않습니다. 다른 브라우저에서 이용해 주세요.",en:"This device can't prepare the clip. Please try another browser.",ja:"この端末では区間の準備に対応していません。別のブラウザでお試しください。",zhs:"此设备不支持准备片段，请换用其他浏览器。",zht:"此裝置不支援準備片段，請改用其他瀏覽器。",es:"Este dispositivo no puede preparar el fragmento. Prueba con otro navegador."},
 aivN:{ko:"녹화한 본인의 얼굴·입 모양·동작은 그대로 두고 배경·의상·조명만 테마 장면으로 변경합니다. 결과 영상에는 「AI 생성」 표시가 붙습니다.",en:"Your face, mouth movements and motion stay as recorded; only the background, outfit and lighting change to the theme scene. The result is labeled \u201cAI-generated\u201d.",ja:"録画したご本人の顔・口の動き・動作はそのままに、背景・衣装・照明だけをテーマのシーンに変えます。結果の動画には「AI生成」と表示されます。",zhs:"保留您录像中的脸、口型和动作，只把背景、服装和灯光换成主题场景。生成的视频会标注「AI生成」。",zht:"保留您錄影中的臉、口型和動作，只把背景、服裝和燈光換成主題場景。產生的影片會標註「AI生成」。",es:"Tu cara, el movimiento de la boca y tus gestos se mantienen; solo cambian el fondo, la ropa y la luz según la escena. El resultado lleva la etiqueta \u201cGenerado por IA\u201d."},
 aivAgain:{ko:"다시 선택",en:"Choose again",ja:"選び直す",zhs:"重新选择",zht:"重新選擇",es:"Elegir de nuevo"},
 aivDelQ:{ko:"이 AI 영상을 삭제할까요?",en:"Delete this AI video?",ja:"このAI動画を削除しますか？",zhs:"要删除这个AI视频吗？",zht:"要刪除這支AI影片嗎？",es:"¿Eliminar este video IA?"},
 aivRun:{ko:"생성 중",en:"Generating",ja:"生成中",zhs:"生成中",zht:"產生中",es:"Generando"},
 aiGT:{ko:"내 AI 사진",en:"My AI photos",ja:"自分のAI写真",zhs:"我的AI照片",zht:"我的AI照片",es:"Mis fotos IA"},
 aiGE:{ko:"아직 생성한 AI 사진이 없어요. 테마방에서 노래를 녹화한 뒤 「상황 사진 생성」으로 생성할 수 있어요.",en:"No AI photos yet. Record a song in a theme room, then tap \u201cMake a scene photo\u201d.",ja:"まだAI写真がありません。テーマルームで歌を録画してから「シーン写真を作る」で作れます。",zhs:"还没有AI照片。在主题房录制歌曲后，点击「制作情景照片」即可生成。",zht:"還沒有AI照片。在主題房錄製歌曲後，點選「製作情境照片」即可產生。",es:"Aún no tienes fotos IA. Graba una canción en una sala temática y toca \u201cCrear foto temática\u201d."},
 aiUse:{ko:"프로필로 사용",en:"Use as profile",ja:"プロフィールに使う",zhs:"用作头像",zht:"用作頭像",es:"Usar como perfil"},
 aiNow:{ko:"현재 프로필",en:"Current profile",ja:"現在のプロフィール",zhs:"当前头像",zht:"目前頭像",es:"Perfil actual"},
 aiDelQ:{ko:"이 AI 사진을 삭제할까요? 프로필로 사용 중이면 프로필도 해제돼요. 복구할 수 없어요.",en:"Delete this AI photo? If it is your profile, the profile will be cleared too. This cannot be undone.",ja:"このAI写真を削除しますか？プロフィールに使っている場合はプロフィールも空になります。元に戻せません。",zhs:"要删除这张AI照片吗？如果正用作头像，头像也会被清空。删除后无法恢复。",zht:"要刪除這張AI照片嗎？如果正用作頭像，頭像也會被清空。刪除後無法復原。",es:"¿Borrar esta foto IA? Si es tu foto de perfil, el perfil también se vaciará. No se puede deshacer."},
 aiDelOk:{ko:"삭제했어요",en:"Deleted",ja:"削除しました",zhs:"已删除",zht:"已刪除",es:"Borrada"},
 aiZm:{ko:"두 손가락으로 벌리면 확대, 확대 후 한 손가락으로 이동, 두 번 누르면 원래 크기",en:"Pinch to zoom, drag with one finger when zoomed, double-tap to reset",ja:"2本指で広げると拡大、拡大後は1本指で移動、ダブルタップで元のサイズ",zhs:"双指张开放大，放大后单指拖动，双击恢复原大小",zht:"雙指張開放大，放大後單指拖動，點兩下恢復原大小",es:"Pellizca para ampliar, arrastra con un dedo al ampliar y toca dos veces para volver"},
 pkT:{ko:"프로필 선택",en:"Choose profile",ja:"プロフィールを選ぶ",zhs:"选择头像",zht:"選擇頭像",es:"Elegir perfil"},
 pkVid:{ko:"영상",en:"Videos",ja:"動画",zhs:"视频",zht:"影片",es:"Vídeos"},
 pkAiN:{ko:"프로필로 사용할 AI 사진을 선택하세요. 다른 것을 선택해도 사진은 그대로 보관돼요.",en:"Tap an AI photo to use as your profile. Your other photos stay saved.",ja:"プロフィールに使うAI写真をタップしてください。別のものを選んでも写真は残ります。",zhs:"点击要用作头像的AI照片。改选其他的，照片也会保留。",zht:"點選要用作頭像的AI照片。改選其他的，照片也會保留。",es:"Toca una foto IA para usarla como perfil. Tus otras fotos se conservan."},
 acPk:{ko:"이 사진을 공유 카드로 사용할 내 영상을 선택하세요. (비공개 영상은 공유하지 않아 제외했어요)",en:"Choose the video that will use this photo as its share card. (Private videos are not shared, so they are not listed)",ja:"この写真を共有カードに使う自分の動画を選んでください。（自分だけの動画は共有しないため表示されません）",zhs:"请选择用这张照片作分享卡片的视频。（仅自己可见的视频不会分享，所以不显示）",zht:"請選擇用這張照片作分享卡片的影片。（僅自己可見的影片不會分享，所以不顯示）",es:"Elige el vídeo que usará esta foto como tarjeta para compartir. (Los vídeos privados no se comparten, así que no aparecen)"},
 acE:{ko:"공유할 수 있는 영상이 없어요. 전체 공개·팔로워·우리끼리 노래로 게시한 영상에만 사용할 수 있어요.",en:"No shareable videos. This works only for videos posted as public, followers or group.",ja:"共有できる動画がありません。全体公開・フォロワー・グループで投稿した動画にだけ使えます。",zhs:"没有可分享的视频。只适用于以公开、粉丝或群组发布的视频。",zht:"沒有可分享的影片。只適用於以公開、粉絲或群組發布的影片。",es:"No hay vídeos para compartir. Solo funciona con vídeos publicados como públicos, para seguidores o de grupo."},
 acOk:{ko:"공유 카드를 변경했어요",en:"Share card updated",ja:"共有カードを変更しました",zhs:"已更换分享卡片",zht:"已更換分享卡片",es:"Tarjeta para compartir actualizada"},
 recX:{"ko": "■ 녹화 종료", "en": "■ Stop", "ja": "■ 停止", "zhs": "■ 停止", "zht": "■ 停止", "es": "■ Parar"},
 recNo:{"ko": "카메라·마이크를 사용할 수 없어요. 브라우저에서 카메라·마이크 사용을 허용해 주세요.", "en": "Can't use the camera or microphone. Please allow them in your browser.", "ja": "カメラ・マイクを使えません。ブラウザで許可してください。", "zhs": "无法使用相机或麦克风，请在浏览器中允许。", "zht": "無法使用相機或麥克風，請在瀏覽器中允許。", "es": "No se puede usar la cámara o el micrófono. Permítelos en tu navegador."},
 retk:{"ko": "재촬영", "en": "Record again", "ja": "撮り直す", "zhs": "重拍", "zht": "重拍", "es": "Grabar de nuevo"},
 pvT:{"ko": "내 녹화", "en": "My recording", "ja": "自分の録画", "zhs": "我的录像", "zht": "我的錄影", "es": "Mi grabación"},
 pvN:{"ko": "녹화한 영상은 이 기기에만 저장되고 외부로 전송하지 않습니다. 닫으면 삭제됩니다.", "en": "Your recording stays on this device and is not sent anywhere. It is deleted when you close.", "ja": "録画はこの端末にのみあり、どこにも送信しません。閉じると削除されます。", "zhs": "录像只保存在本设备上，不会发送到任何地方。关闭后即删除。", "zht": "錄影只存在本裝置上，不會傳送到任何地方。關閉後即刪除。", "es": "Tu grabación se queda en este dispositivo y no se envía a ningún sitio. Se borra al cerrar."},
 up:{"ko": "내 노래 게시", "en": "Post my song", "ja": "自分の歌を投稿", "zhs": "发布我的歌", "zht": "發布我的歌", "es": "Publicar mi canción"},
 upQ:{"ko": "노래 종료! 내 노래를 스테이지에 게시해 보세요", "en": "Song finished! Post your song to the Public Stage", "ja": "歌い終わり！自分の歌をステージに投稿しよう", "zhs": "唱完了！把你的歌发布到舞台", "zht": "唱完了！把你的歌發布到舞台", "es": "¡Canción terminada! Publica tu canción en el Escenario"},
 stgB:{"ko": "스테이지", "en": "Stage", "ja": "ステージ", "zhs": "舞台", "zht": "舞台", "es": "Escenario"},
 stg:{"ko": "스테이지", "en": "Public Stage", "ja": "ステージ", "zhs": "舞台", "zht": "舞台", "es": "Escenario"},
 mstg:{"ko": "내 스테이지", "en": "My Stage", "ja": "マイステージ", "zhs": "我的舞台", "zht": "我的舞台", "es": "Mi escenario"},
 stgE:{"ko": "다른 사람 노래 영상", "en": "Other people's singing videos", "ja": "ほかの人の歌の動画", "zhs": "其他人的唱歌视频", "zht": "其他人的唱歌影片", "es": "Vídeos de otras personas cantando"},
 mstgE:{"ko": "내 노래 영상", "en": "My singing videos", "ja": "自分の歌の動画", "zhs": "我的唱歌视频", "zht": "我的唱歌影片", "es": "Mis vídeos cantando"},
 // 내 노래 올리기·가요무대 목록 (10-30 사장님 기기 시험판)
 pvN2:{ko:"게시 전에는 이 기기에만 저장됩니다. 게시하지 않고 닫으면 삭제됩니다.",en:"Until you post it, the recording stays only on this device. If you close without posting, it is deleted.",ja:"投稿するまでは、この端末にのみ保存されます。投稿せずに閉じると削除されます。",zhs:"发布前录像只保存在本设备上。不发布就关闭，录像会被删除。",zht:"發布前錄影只存在本裝置上。不發布就關閉，錄影會被刪除。",es:"Hasta que la publiques, la grabación solo está en este dispositivo. Si cierras sin publicar, se borra."},
 vis:{ko:"공개 범위",en:"Who can see it",ja:"公開範囲",zhs:"公开范围",zht:"公開範圍",es:"Quién puede verla"},
 vPub:{ko:"전체 공개",en:"Everyone",ja:"全体に公開",zhs:"所有人可见",zht:"所有人可見",es:"Todos"},
 vMe:{ko:"비공개",en:"Only me",ja:"自分だけ",zhs:"仅自己可见",zht:"僅自己可見",es:"Solo yo"},
 vPubN:{ko:"스테이지에 게시되어 누구나 시청할 수 있어요.",en:"It goes on the Public Stage where anyone can watch it.",ja:"ステージに載り、誰でも見られます。",zhs:"会发布到舞台，所有人都能观看。",zht:"會發布到舞台，所有人都能觀看。",es:"Se publica en el Escenario y cualquiera puede verla."},
 vMeN:{ko:"내 스테이지에만 표시되고 본인만 시청할 수 있어요.",en:"It stays on My Stage and only you can see it.",ja:"マイステージにだけあり、自分だけが見られます。",zhs:"只在我的舞台上，仅自己可以观看。",zht:"只在我的舞台上，僅自己可以觀看。",es:"Se queda en Mi escenario y solo tú puedes verla."},
 by:{ko:"출생 연도 (4자리)",en:"Year of birth (4 digits)",ja:"生まれた年（4桁）",zhs:"出生年份（4位数）",zht:"出生年份（4位數）",es:"Año de nacimiento (4 cifras)"},
 byN:{ko:"최초 게시 때 한 번만 확인해요. 만 14세 미만은 노래를 게시할 수 없어요.",en:"We ask only once, the first time you post. Users under 14 cannot post songs.",ja:"初めて投稿するときに一度だけ確認します。14歳未満は歌を投稿できません。",zhs:"仅在首次发布时询问一次。未满14周岁不能发布歌曲。",zht:"僅在首次發布時詢問一次。未滿14歲不能發布歌曲。",es:"Solo lo preguntamos la primera vez. Los menores de 14 años no pueden publicar canciones."},
 byE:{ko:"출생 연도를 4자리 숫자로 입력해 주세요.",en:"Please enter your year of birth as 4 digits.",ja:"生まれた年を4桁の数字で入力してください。",zhs:"请用4位数字填写出生年份。",zht:"請用4位數字填寫出生年份。",es:"Escribe tu año de nacimiento con 4 cifras."},
 by14:{ko:"만 14세 미만은 노래를 게시할 수 없어요.",en:"Users under 14 cannot post songs.",ja:"14歳未満は歌を投稿できません。",zhs:"未满14周岁不能发布歌曲。",zht:"未滿14歲不能發布歌曲。",es:"Los menores de 14 años no pueden publicar canciones."},
 upGo:{ko:"게시",en:"Post",ja:"投稿する",zhs:"发布",zht:"發布",es:"Publicar"},
 upIng:{ko:"게시 중… {p}%",en:"Posting… {p}%",ja:"投稿中… {p}%",zhs:"发布中… {p}%",zht:"發布中… {p}%",es:"Publicando… {p}%"},
 upOk:{ko:"게시했어요.",en:"Posted.",ja:"投稿しました。",zhs:"已发布。",zht:"已發布。",es:"Publicada."},
 upF:{ko:"게시에 실패했어요. 잠시 후 다시 시도해 주세요.",en:"Could not post. Please try again shortly.",ja:"投稿できませんでした。しばらくしてからもう一度お試しください。",zhs:"发布失败，请稍后再试。",zht:"發布失敗，請稍後再試。",es:"No se pudo publicar. Inténtalo de nuevo en un momento."},
 upBig:{ko:"영상 용량이 너무 커요(최대 60MB). 조금 짧게 재촬영해 주세요.",en:"The video is too large (60 MB max). Please record a shorter one.",ja:"動画が大きすぎます（60MBまで）。少し短く撮り直してください。",zhs:"视频太大（最多60MB），请录短一点再试。",zht:"影片太大（最多60MB），請錄短一點再試。",es:"El vídeo es demasiado grande (máx. 60 MB). Graba uno más corto."},
 upTy:{ko:"이 기기의 녹화 형식은 게시할 수 없어요.",en:"This device's recording format cannot be posted.",ja:"この端末の録画形式は投稿できません。",zhs:"无法发布此设备的录像格式。",zht:"無法發布此裝置的錄影格式。",es:"No se puede publicar el formato de grabación de este dispositivo."},
 upNet:{ko:"인터넷 연결을 확인하고 다시 시도해 주세요.",en:"Please check your internet connection and try again.",ja:"インターネット接続を確認して、もう一度お試しください。",zhs:"请检查网络连接后再试。",zht:"請檢查網路連線後再試。",es:"Revisa tu conexión a internet e inténtalo de nuevo."},
 needRec:{ko:"먼저 ● 녹화로 노래를 촬영해 주세요.",en:"First record your song with ● Record.",ja:"まず ● 録画で歌を撮ってください。",zhs:"请先用 ● 录像录下你的歌。",zht:"請先用 ● 錄影錄下你的歌。",es:"Primero graba tu canción con ● Grabar."},
 del:{ko:"삭제",en:"Delete",ja:"削除",zhs:"删除",zht:"刪除",es:"Borrar"},
 delQ:{ko:"이 노래 영상을 삭제할까요? 삭제하면 복구할 수 없어요.",en:"Delete this video? This cannot be undone.",ja:"この動画を削除しますか？元に戻せません。",zhs:"要删除这个视频吗？删除后无法恢复。",zht:"要刪除這個影片嗎？刪除後無法復原。",es:"¿Borrar este vídeo? No se puede deshacer."},
 delF:{ko:"삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",en:"Could not delete. Please try again shortly.",ja:"削除できませんでした。しばらくしてからもう一度お試しください。",zhs:"删除失败，请稍后再试。",zht:"刪除失敗，請稍後再試。",es:"No se pudo borrar. Inténtalo de nuevo en un momento."},
 stF:{ko:"목록을 불러오지 못했어요.",en:"Could not load the list.",ja:"一覧を読み込めませんでした。",zhs:"无法加载列表。",zht:"無法載入列表。",es:"No se pudo cargar la lista."},
 // 가요무대 화면 전환·프로필·설명·댓글 (10-30 사장님 기기 시험판)
 idSet:{ko:"ID 설정",en:"Set your ID",ja:"IDを決める",zhs:"设置ID",zht:"設定ID",es:"Elegir tu ID"},
 idCh:{ko:"ID 변경",en:"Change ID",ja:"IDを変更",zhs:"更改ID",zht:"更改ID",es:"Cambiar ID"},
 idN:{ko:"2~20자 · 문자·숫자·_ . - 만 (공백 없이)",en:"2–20 characters · letters, numbers, _ . - only (no spaces)",ja:"2〜20文字・文字・数字・_ . - のみ（スペースなし）",zhs:"2~20个字符 · 仅限文字、数字、_ . -（不含空格）",zht:"2~20個字元 · 僅限文字、數字、_ . -（不含空格）",es:"2–20 caracteres · solo letras, números, _ . - (sin espacios)"},
 idTk:{ko:"이미 사용 중인 ID예요.",en:"That ID is already taken.",ja:"そのIDはすでに使われています。",zhs:"该ID已被使用。",zht:"該ID已被使用。",es:"Ese ID ya está en uso."},
 save:{ko:"저장",en:"Save",ja:"保存",zhs:"保存",zht:"儲存",es:"Guardar"},
 fol:{ko:"팔로워",en:"Followers",ja:"フォロワー",zhs:"粉丝",zht:"粉絲",es:"Seguidores"},
 vw:{ko:"조회수",en:"Views",ja:"再生回数",zhs:"播放量",zht:"觀看次數",es:"Vistas"},
 vids:{ko:"게시한 영상",en:"Videos",ja:"投稿動画",zhs:"发布的视频",zht:"發布的影片",es:"Vídeos"},
 lks:{ko:"받은 좋아요",en:"Likes received",ja:"もらったいいね",zhs:"收到的赞",zht:"收到的讚",es:"Me gusta recibidos"},
 sNew:{ko:"최신순",en:"Newest first",ja:"新しい順",zhs:"最新优先",zht:"最新優先",es:"Más recientes"},
 sOld:{ko:"오래된순",en:"Oldest first",ja:"古い順",zhs:"最早优先",zht:"最早優先",es:"Más antiguos"},
 sScore:{ko:"점수순",en:"Top score",ja:"点数順",zhs:"按分数",zht:"按分數",es:"Mejor puntuación"},
 scPt:{ko:"점",en:"pts",ja:"点",zhs:"分",zht:"分",es:"pts"},
 scT:{ko:"노래 점수",en:"Singing score",ja:"歌唱得点",zhs:"演唱得分",zht:"演唱得分",es:"Puntuación"},
 dsc:{ko:"설명",en:"Description",ja:"説明",zhs:"简介",zht:"簡介",es:"Descripción"},
 dscE:{ko:"설명 수정",en:"Edit description",ja:"説明を編集",zhs:"编辑简介",zht:"編輯簡介",es:"Editar descripción"},
 dscP:{ko:"이 노래 영상에 대한 설명 (최대 200자)",en:"Describe this video (up to 200 characters)",ja:"この動画の説明（200文字まで）",zhs:"这个视频的简介（最多200字）",zht:"這個影片的簡介（最多200字）",es:"Describe este vídeo (hasta 200 caracteres)"},
 dscN:{ko:"설명이 없어요.",en:"No description.",ja:"説明はありません。",zhs:"暂无简介。",zht:"暫無簡介。",es:"Sin descripción."},
 cmT:{ko:"댓글",en:"Comments",ja:"コメント",zhs:"评论",zht:"留言",es:"Comentarios"},
 cmP:{ko:"댓글 작성 (최대 200자)",en:"Write a comment (up to 200 characters)",ja:"コメントを書く（200文字まで）",zhs:"写评论（最多200字）",zht:"寫留言（最多200字）",es:"Escribe un comentario (hasta 200 caracteres)"},
 cmGo:{ko:"등록",en:"Post",ja:"送信",zhs:"发表",zht:"發表",es:"Publicar"},
 cmE:{ko:"첫 댓글을 작성해 보세요.",en:"Be the first to comment.",ja:"最初のコメントを書いてみましょう。",zhs:"来发表第一条评论吧。",zht:"來發表第一則留言吧。",es:"Sé el primero en comentar."},
 cmDQ:{ko:"이 댓글을 삭제할까요?",en:"Delete this comment?",ja:"このコメントを削除しますか？",zhs:"要删除这条评论吗？",zht:"要刪除這則留言嗎？",es:"¿Borrar este comentario?"},
 pfT:{ko:"프로필 영상 선택",en:"Choose profile video",ja:"プロフィール動画を選ぶ",zhs:"选择头像视频",zht:"選擇頭像影片",es:"Elegir vídeo de perfil"},
 pfN:{ko:"프로필로 사용할 내 영상을 선택하세요. 첫 장면이 프로필로 설정됩니다.",en:"Tap one of your videos to use as your profile. Its first frame becomes your profile.",ja:"プロフィールに使う自分の動画をタップしてください。最初の場面がプロフィールになります。",zhs:"点击要用作头像的视频，第一个画面会成为头像。",zht:"點選要用作頭像的影片，第一個畫面會成為頭像。",es:"Toca uno de tus vídeos para usarlo como perfil. Su primer fotograma será tu perfil."},
 pfE:{ko:"아직 게시한 영상이 없어요. 노래를 녹화해 게시하면 첫 장면이 프로필로 설정됩니다.",en:"No videos yet. Record and post a song — its first frame becomes your profile.",ja:"まだ動画がありません。歌を録画して投稿すると、最初の場面がプロフィールになります。",zhs:"还没有视频。录制并发布歌曲后，第一个画面就会成为头像。",zht:"還沒有影片。錄製並發布歌曲後，第一個畫面就會成為頭像。",es:"Aún no hay vídeos. Graba y publica una canción: su primer fotograma será tu perfil."},
 chg:{ko:"변경",en:"Change",ja:"変更",zhs:"更换",zht:"更換",es:"Cambiar"},
 fail:{ko:"잠시 후 다시 시도해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."},
 upB:{ko:"좋아요",en:"Like",ja:"いいね",zhs:"赞",zht:"讚",es:"Me gusta"},
 // 팔로우·그 사람 무대 (10-30)
 vFol:{ko:"팔로워만",en:"Followers only",ja:"フォロワーのみ",zhs:"仅粉丝可见",zht:"僅粉絲可見",es:"Solo seguidores"},
 vFolN:{ko:"나를 팔로우한 사람만 시청할 수 있어요.",en:"Only people who follow you can watch it.",ja:"あなたをフォローしている人だけが見られます。",zhs:"只有关注你的人可以观看。",zht:"只有追蹤你的人可以觀看。",es:"Solo las personas que te siguen pueden verla."},
 flw:{ko:"+ 팔로우",en:"+ Follow",ja:"+ フォロー",zhs:"+ 关注",zht:"+ 追蹤",es:"+ Seguir"},
 flg:{ko:"팔로잉",en:"Following",ja:"フォロー中",zhs:"已关注",zht:"追蹤中",es:"Siguiendo"},
 fing:{ko:"팔로잉",en:"Following",ja:"フォロー中",zhs:"关注",zht:"追蹤中",es:"Siguiendo"},
 flE:{ko:"아직 아무도 없어요.",en:"No one yet.",ja:"まだ誰もいません。",zhs:"还没有人。",zht:"還沒有人。",es:"Aún no hay nadie."},
 ustE:{ko:"시청 가능한 영상이 없어요.",en:"No videos to show.",ja:"表示できる動画がありません。",zhs:"没有可观看的视频。",zht:"沒有可觀看的影片。",es:"No hay vídeos para mostrar."},
 dnB:{ko:"싫어요",en:"Dislike",ja:"よくないね",zhs:"踩",zht:"倒讚",es:"No me gusta"},
 ntc:{ko:"공지사항",en:"Notice",ja:"お知らせ",zhs:"公告",zht:"公告",es:"Aviso"},
  ntcP0:{ko:"이용권: {list} (포인트로 구매 · 자동 연장 없음)",en:"Passes: {list} (bought with points · no auto-renewal)",ja:"利用券：{list}（ポイントで購入・自動更新なし）",zhs:"畅唱券：{list}（用积分购买 · 不自动续费）",zht:"暢唱券：{list}（用點數購買 · 不自動續費）",es:"Bonos: {list} (con puntos · sin renovación automática)"},
  ntcL:{
   ko:["이용권 기간에는 노래를 무제한으로 부를 수 있습니다. 이용 중에 다시 구매하면 지금 끝나는 날부터 기간이 이어집니다.","환불: 구매일로부터 7일 이내이고 노래를 부르지 않았으면 이용권 구매에 사용한 유료 포인트 몫 전액을, 그 밖에는 남은 일수에 해당하는 금액에서 10%를 공제한 금액을 결제한 수단으로 환불합니다(1P = 1원, 10원 미만 버림). 무료 포인트로 산 몫은 환불하지 않으며, 포인트 환불 수수료를 다시 공제하지 않습니다. 환불을 요청하면 이용권은 바로 끝납니다.","이전에 구매한 곡 이용권(잔여 곡)은 그대로 유효합니다.","문의: 앱의 문의 메뉴 또는 admin@moneypuzzle.co.kr"],
   en:["During the pass you can sing as much as you like. If you buy again while a pass is active, the new period starts from the current end date.","Refunds: within 7 days of purchase and if you have not sung, the full paid-point share you used for the pass; otherwise the amount for the remaining days minus 10%. Refunds go to your original payment method (1P = ₩1, rounded down to ₩10). The share bought with free points is not refunded, and no points refund fee is deducted again. The pass ends as soon as you request the refund.","Song credits you bought before (songs left) remain valid.","Contact: the app's inquiry menu or admin@moneypuzzle.co.kr"],
   ja:["利用券の期間中は歌い放題です。利用中にもう一度購入すると、今の終了日から期間が続きます。","返金：購入日から7日以内でまだ歌っていなければ、利用券の購入に使った有料ポイント分を全額、それ以外は残り日数分の金額から10%を差し引いた金額を、決済した手段で返金します（1P＝1ウォン、10ウォン未満切り捨て）。無料ポイントで購入した分は返金せず、ポイントの返金手数料を再び差し引くことはありません。返金を申請すると利用券はすぐに終了します。","以前に購入した曲チケット（残り曲）はそのまま有効です。","お問い合わせ：アプリのお問い合わせメニューまたは admin@moneypuzzle.co.kr"],
   zhs:["畅唱券有效期内可无限唱歌。使用中再次购买，新期间从当前到期日起接续。","退款：购买之日起7天内且未唱歌的，全额退还购买时使用的付费积分部分；其他情况退还剩余天数对应金额扣除10%后的金额，退回原支付方式（1P = 1韩元，不足10韩元舍去）。用免费积分购买的部分不予退款，也不会再次扣除积分退款手续费。申请退款后畅唱券立即结束。","此前购买的点歌券（剩余歌曲）继续有效。","咨询：应用内的咨询菜单或 admin@moneypuzzle.co.kr"],
   zht:["暢唱券有效期內可無限唱歌。使用中再次購買，新期間從目前到期日起接續。","退款：購買之日起7天內且未唱歌者，全額退還購買時使用的付費點數部分；其他情況退還剩餘天數對應金額扣除10%後的金額，退回原付款方式（1P = 1韓元，不足10韓元捨去）。以免費點數購買的部分不予退款，亦不會再次扣除點數退款手續費。申請退款後暢唱券立即結束。","此前購買的點歌券（剩餘歌曲）繼續有效。","諮詢：App 內的諮詢選單或 admin@moneypuzzle.co.kr"],
   es:["Durante el bono puedes cantar sin límite. Si compras otro mientras uno está activo, el nuevo periodo empieza en la fecha de fin actual.","Reembolsos: en los 7 días siguientes a la compra y si no has cantado, toda la parte pagada con puntos de pago; si no, el importe de los días restantes menos un 10%. Se devuelve a tu método de pago original (1P = ₩1, redondeo a la baja a ₩10). La parte comprada con puntos gratuitos no se reembolsa y no se vuelve a descontar la comisión de reembolso de puntos. El bono termina en cuanto pides el reembolso.","Las canciones que compraste antes (canciones restantes) siguen siendo válidas.","Contacto: menú de consultas de la app o admin@moneypuzzle.co.kr"]},
  ntcEx:{ko:"예: {m} 이용권({w})을 사고 노래를 부른 뒤 {u}일째 환불하면 — 남은 {d}일 금액 {a}에서 10%를 공제한 {r}을 환불합니다.",en:"Example: buy a {m} pass ({w}), sing, and ask for a refund on day {u} — you get {r} back ({a} for the remaining {d} days minus 10%) to your payment method.",ja:"例：{m}の利用券（{w}）を購入して歌い、{u}日目に返金すると — 残り{d}日分 {a} から10%を差し引いた {r} を返金します。",zhs:"例：购买{m}畅唱券（{w}）并唱歌后，第{u}天申请退款 — 退还剩余{d}天金额 {a} 扣除10%后的 {r}。",zht:"例：購買{m}暢唱券（{w}）並唱歌後，第{u}天申請退款 — 退還剩餘{d}天金額 {a} 扣除10%後的 {r}。",es:"Ejemplo: compras un bono de {m} ({w}), cantas y pides el reembolso el día {u} — te devolvemos {r} ({a} por los {d} días restantes menos el 10%)."},   // (10-31) 이용권 환불 = 7일 이내·미사용 전액 / 그 밖 = 잔여 일수 금액 − 10%
 ntcR:{ko:"환불 규정 전체 보기",en:"View full refund policy",ja:"返金規定の全文を見る",zhs:"查看完整退款规定",zht:"查看完整退款規定",es:"Ver la política de reembolso completa"},
  ntcP:{ko:"이용권 안내 · 환불 규정 — 공지사항",en:"Pass guide · refund policy — Notice",ja:"利用券のご案内・返金規定 — お知らせ",zhs:"畅唱券说明 · 退款规定 — 公告",zht:"暢唱券說明 · 退款規定 — 公告",es:"Guía del bono · reembolsos — Aviso"},
 ok:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 lftN:{ko:"잔여 곡: {n}곡",en:"Songs left: {n}",ja:"残り曲数: {n}曲",zhs:"剩余歌曲：{n}首",zht:"剩餘歌曲：{n}首",es:"Canciones restantes: {n}"},
  sgi:{ko:"로그인 후 이용권을 구매할 수 있습니다",en:"Sign in to buy a pass",ja:"ログインすると利用券を購入できます",zhs:"登录后即可购买畅唱券",zht:"登入後即可購買暢唱券",es:"Inicia sesión para comprar un bono"},
 sgb:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Iniciar sesión"},
 rfb:{ko:"잔여 곡 환불 요청 ({n}곡)",en:"Request refund for unused songs ({n})",ja:"残り曲の返金を申請（{n}曲）",zhs:"申请退还剩余歌曲（{n}首）",zht:"申請退還剩餘歌曲（{n}首）",es:"Solicitar reembolso de canciones ({n})"},
 rfh:{ko:"환불 요청",en:"Refund request",ja:"返金申請",zhs:"退款申请",zht:"退款申請",es:"Solicitud de reembolso"},
 rfq:{ko:"잔여 곡 {n}곡의 환불을 요청할까요? 금액은 환불 규정(7일 이내는 결제 금액에서 쓴 곡을 1곡 1,000원으로 뺀 금액, 7일이 지나면 거기서 수수료 10%를 더 뺀 금액)으로 계산해 결제한 수단으로 영업일 3~7일 안에 환불됩니다.",en:"Request a refund for {n} unused songs? The amount follows our refund policy (within 7 days: amount paid minus songs used at ₩1,000 each; after 7 days: that amount minus a 10% fee) and goes to your original payment method within 3–7 business days.",ja:"残り{n}曲の返金を申請しますか？金額は返金規定（7日以内は支払額から使った曲を1曲1,000ウォンとして差し引いた金額、7日を過ぎるとそこから手数料10%をさらに差し引いた金額）で計算し、お支払い方法へ3〜7営業日以内に返金します。",zhs:"要申请退还剩余的{n}首歌吗？金额按退款规定计算（7天内为支付金额减去已用歌曲每首₩1,000后的金额，超过7天再扣除10%手续费），将在3–7个工作日内退回原支付方式。",zht:"要申請退還剩餘的{n}首歌嗎？金額依退款規定計算（7天內為付款金額減去已用歌曲每首₩1,000後的金額，超過7天再扣除10%手續費），將在3–7個工作天內退回原付款方式。",es:"¿Solicitar el reembolso de {n} canciones sin usar? El importe sigue nuestra política (en 7 días: importe pagado menos las canciones usadas a ₩1,000 cada una; después: ese importe menos una comisión del 10%) y se devuelve a tu método de pago en 3–7 días hábiles."},
 rfo:{ko:"요청",en:"Request",ja:"申請",zhs:"申请",zht:"申請",es:"Solicitar"},
 rfd:{ko:"환불 요청이 접수되었습니다.",en:"Your refund request has been received.",ja:"返金申請を受け付けました。",zhs:"退款申请已受理。",zht:"退款申請已受理。",es:"Hemos recibido tu solicitud de reembolso."},
 // 사업자 정보 (노래방 화면 맨 아래·곡 이용권 창 아래 — 카드사 심사용)
 bzh:{"ko": "호스팅서비스 제공자", "en": "Hosting provider", "ja": "ホスティング事業者", "zhs": "托管服务提供者", "zht": "主機代管服務提供者", "es": "Proveedor de alojamiento"},
 bzn:{"ko": "이메일 주소 무단 수집을 거부합니다.", "en": "We refuse unauthorized collection of email addresses.", "ja": "メールアドレスの無断収集を拒否します。", "zhs": "拒绝未经许可收集电子邮箱地址。", "zht": "拒絕未經許可蒐集電子郵件地址。", "es": "Rechazamos la recopilación no autorizada de direcciones de correo."},
 gL:{"ko": "법적 고지", "en": "Legal Notice", "ja": "法的告知", "zhs": "法律声明", "zht": "法律聲明", "es": "Aviso legal"},
 bz:{ko:["사업자 정보","주식회사 부만","대표","전현진","사업자등록번호","통신판매업 신고번호","신고 예정","주소","경기도 남양주시 진접읍 해밀예당1로 220, 707호 씨64호(엠타워)","이메일"],
  en:["Business info","Booman Inc.","CEO","Jeon Hyeonjin","Business Reg. No.","Mail-order business reg. No.","To be filed","Address","Rm 707, M Tower, 220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Korea","Email"],
  ja:["事業者情報","株式会社 부만 (Booman Inc.)","代表","全賢珍 (Jeon Hyeonjin)","事業者登録番号","通信販売業申告番号","申告予定","住所","Rm 707, M Tower, 220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Korea","メール"],
  zhs:["经营者信息","Booman Inc.（株式会社 부만）","代表","Jeon Hyeonjin","营业执照号","通信销售业申报号","即将申报","地址","Rm 707, M Tower, 220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Korea","邮箱"],
  zht:["經營者資訊","Booman Inc.（株式會社 부만）","代表","Jeon Hyeonjin","營業執照號","通信銷售業申報號","即將申報","地址","Rm 707, M Tower, 220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Korea","電郵"],
  es:["Información del operador","Booman Inc.","Representante","Jeon Hyeonjin","N.º de registro mercantil","N.º de registro de venta a distancia","Pendiente de registro","Dirección","Rm 707, M Tower, 220 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do, Korea","Correo"]}
};
// ── 우리끼리 방·영상 공유 문구 (사장님 10-30)
Object.assign(TX,{
 vwAll:{ko:"전체",en:"All",ja:"すべて",zhs:"全部",zht:"全部",es:"Todo"},
 vwFlw:{ko:"팔로잉만",en:"Following",ja:"フォロー中",zhs:"仅关注",zht:"僅追蹤",es:"Siguiendo"},
 vwRoom:{ko:"우리끼리\n노래",en:"Just Us\nKaraoke",ja:"仲間だけ\nカラオケ",zhs:"小圈子\nK歌",zht:"小圈子\nK歌",es:"Solo nosotros\nKaraoke"},
 vRoomN:{ko:"선택한 우리끼리 노래 방 멤버만 시청할 수 있어요.",en:"Only people in the Just Us Karaoke rooms you pick can watch it.",ja:"選んだ「仲間だけカラオケ」ルームの人だけが見られます。",zhs:"只有所选小圈子K歌房的成员可以观看。",zht:"只有所選小圈子K歌房的成員可以觀看。",es:"Solo las personas de las salas «Solo nosotros Karaoke» que elijas pueden verlo."},
 rmPkE:{ko:"게시할 방을 하나 이상 선택하세요.",en:"Choose at least one room.",ja:"ルームを1つ以上選んでください。",zhs:"请至少选择一个房间。",zht:"請至少選擇一個房間。",es:"Elige al menos una sala."},
 rmNone:{ko:"아직 우리끼리 노래 방이 없어요.",en:"No Just Us Karaoke rooms yet.",ja:"まだ「仲間だけカラオケ」ルームがありません。",zhs:"还没有小圈子K歌房。",zht:"還沒有小圈子K歌房。",es:"Aún no tienes salas «Solo nosotros Karaoke»."},
 rmNew:{ko:"우리끼리 노래 방 생성",en:"Create a Just Us Karaoke room",ja:"「仲間だけカラオケ」ルームを作る",zhs:"创建小圈子K歌房",zht:"建立小圈子K歌房",es:"Crear sala «Solo nosotros Karaoke»"},
 rmName:{ko:"방 이름",en:"Room name",ja:"ルーム名",zhs:"房间名称",zht:"房間名稱",es:"Nombre de la sala"},
 rmDef:{ko:"우리끼리 노래",en:"Just Us Karaoke",ja:"仲間だけカラオケ",zhs:"小圈子K歌",zht:"小圈子K歌",es:"Solo nosotros Karaoke"},
 rmWho:{ko:"참여자 · 내가 팔로우한 사람 (최대 30명)",en:"Members · people you follow (up to 30)",ja:"メンバー・フォロー中の人（30人まで）",zhs:"成员 · 我关注的人（最多30人）",zht:"成員 · 我追蹤的人（最多30人）",es:"Miembros · personas que sigues (hasta 30)"},
 rmMk:{ko:"생성",en:"Create",ja:"作成",zhs:"创建",zht:"建立",es:"Crear"},
 rmN:{ko:"{n}명",en:"{n} people",ja:"{n}人",zhs:"{n}人",zht:"{n}人",es:"{n} personas"},
 rmOw:{ko:"방장",en:"Host",ja:"ホスト",zhs:"房主",zht:"房主",es:"Anfitrión"},
 rmAdd:{ko:"멤버 추가",en:"Add people",ja:"メンバーを追加",zhs:"添加成员",zht:"新增成員",es:"Añadir personas"},
 rmRm:{ko:"멤버 제외",en:"Remove people",ja:"メンバーを外す",zhs:"移除成员",zht:"移除成員",es:"Quitar personas"},
 rmRen:{ko:"이름 변경",en:"Rename",ja:"名前を変更",zhs:"重命名",zht:"重新命名",es:"Cambiar nombre"},
 rmDel:{ko:"방 삭제",en:"Delete room",ja:"ルームを削除",zhs:"删除房间",zht:"刪除房間",es:"Eliminar sala"},
 rmLv:{ko:"방 퇴장",en:"Leave room",ja:"ルームを退出",zhs:"退出房间",zht:"退出房間",es:"Salir de la sala"},
 rmDelQ:{ko:"이 방을 삭제할까요? 이 방에만 게시한 영상은 게시자 본인만 시청할 수 있게 됩니다.",en:"Delete this room? Videos posted only to this room will be visible only to the person who posted them.",ja:"このルームを削除しますか？このルームにだけ投稿した動画は投稿者だけが見られるようになります。",zhs:"要删除这个房间吗？只发到此房间的视频将只有上传者能看到。",zht:"要刪除這個房間嗎？只發到此房間的影片將只有上傳者能看到。",es:"¿Eliminar esta sala? Los vídeos publicados solo en ella quedarán visibles solo para quien los subió."},
 rmLvQ:{ko:"이 방에서 퇴장할까요?",en:"Leave this room?",ja:"このルームから退出しますか？",zhs:"要退出这个房间吗？",zht:"要退出這個房間嗎？",es:"¿Salir de esta sala?"},
 rmNmE:{ko:"방 이름은 1~20자로 입력해 주세요.",en:"Room name must be 1–20 characters.",ja:"ルーム名は1〜20文字で入力してください。",zhs:"房间名称请输入1~20个字。",zht:"房間名稱請輸入1~20個字。",es:"El nombre debe tener entre 1 y 20 caracteres."},
 rmMax:{ko:"최대 30명까지 선택할 수 있어요.",en:"You can choose up to 30 people.",ja:"30人まで選べます。",zhs:"最多可选30人。",zht:"最多可選30人。",es:"Puedes elegir hasta 30 personas."},
 rmNoF:{ko:"팔로우한 사람이 없어요. 먼저 팔로우해 주세요.",en:"You aren't following anyone yet. Follow people first.",ja:"フォロー中の人がいません。先にフォローしてください。",zhs:"你还没有关注任何人，请先关注。",zht:"你還沒有追蹤任何人，請先追蹤。",es:"Aún no sigues a nadie. Sigue a alguien primero."},
 rmNoA:{ko:"추가할 수 있는 사람이 없어요.",en:"No one else to add.",ja:"追加できる人がいません。",zhs:"没有可添加的人。",zht:"沒有可新增的人。",es:"No hay nadie más para añadir."},
 rmE:{ko:"이 방에 아직 영상이 없어요.",en:"No videos in this room yet.",ja:"このルームにはまだ動画がありません。",zhs:"这个房间还没有视频。",zht:"這個房間還沒有影片。",es:"Aún no hay vídeos en esta sala."},
 rmGone:{ko:"이 방에 입장할 수 없어요.",en:"You can't open this room.",ja:"このルームは開けません。",zhs:"无法打开这个房间。",zht:"無法開啟這個房間。",es:"No puedes abrir esta sala."},
 flwE:{ko:"팔로우한 사람의 영상이 없어요.",en:"No videos from people you follow.",ja:"フォロー中の人の動画はありません。",zhs:"没有你关注的人的视频。",zht:"沒有你追蹤的人的影片。",es:"No hay vídeos de las personas que sigues."},
 shB:{ko:"공유",en:"Share",ja:"共有",zhs:"分享",zht:"分享",es:"Compartir"},
 shHd:{ko:"이 영상 공유",en:"Share this video",ja:"この動画を共有",zhs:"分享此视频",zht:"分享此影片",es:"Compartir este vídeo"},
 shT:{ko:"{n}님의 노래 · {t}",en:"{n}'s song · {t}",ja:"{n}さんの歌・{t}",zhs:"{n}的演唱 · {t}",zht:"{n}的演唱 · {t}",es:"Canción de {n} · {t}"},
 shD:{ko:"StageSong 점수 {s}점 — 감상해 보세요",en:"StageSong score {s} pts — have a listen",ja:"StageSong得点 {s}点 — 聴いてみて",zhs:"StageSong 得分 {s} 分 — 来听听",zht:"StageSong 得分 {s} 分 — 來聽聽",es:"Puntuación StageSong {s} pts — escúchala"},
 shD0:{ko:"StageSong 노래 영상 — 감상해 보세요",en:"A StageSong singing video — have a listen",ja:"StageSongの歌の動画 — 聴いてみて",zhs:"StageSong 演唱视频 — 来听听",zht:"StageSong 演唱影片 — 來聽聽",es:"Un vídeo de StageSong — escúchalo"},
 shDR:{ko:"우리끼리 노래 방 {r}에서만 시청할 수 있어요",en:"Only viewable in the Just Us Karaoke room {r}",ja:"「仲間だけカラオケ」ルーム {r} でのみ見られます",zhs:"仅限小圈子K歌房 {r} 观看",zht:"僅限小圈子K歌房 {r} 觀看",es:"Solo visible en la sala «Solo nosotros Karaoke» {r}"},
 shDF:{ko:"팔로우하면 시청할 수 있어요",en:"Follow to watch this video",ja:"フォローすると見られます",zhs:"关注后即可观看",zht:"追蹤後即可觀看",es:"Sigue a esta persona para verlo"},
 shV:{ko:"영상 재생",en:"Watch video",ja:"動画を見る",zhs:"观看视频",zht:"觀看影片",es:"Ver vídeo"},
 rmPpE:{ko:"한 명 이상 선택하세요.",en:"Choose at least one person.",ja:"1人以上選んでください。",zhs:"请至少选择一人。",zht:"請至少選擇一人。",es:"Elige al menos una persona."},
 shPrep:{ko:"공유 카드 생성 중…",en:"Preparing the share card…",ja:"共有カードを作成中…",zhs:"正在制作分享卡片…",zht:"正在製作分享卡片…",es:"Preparando la tarjeta…"}
});
// ── 우리끼리 방 카톡 초대 (사장님 10-31 「카톡 친구도 초대」)
Object.assign(TX,{
 rmInv:{ko:"카톡으로 초대",en:"Invite via KakaoTalk",ja:"カカオトークで招待",zhs:"通过KakaoTalk邀请",zht:"透過KakaoTalk邀請",es:"Invitar por KakaoTalk"},
 rmInvP:{ko:"초대 링크 생성 중…",en:"Creating an invitation link…",ja:"招待リンクを作成中…",zhs:"正在生成邀请链接…",zht:"正在產生邀請連結…",es:"Creando el enlace de invitación…"},
 rmInvT:{ko:"{n}님이 우리끼리 노래 방 「{r}」에 초대했어요",en:"{n} invited you to the Just Us Karaoke room “{r}”",ja:"{n}さんが「仲間だけカラオケ」ルーム「{r}」に招待しました",zhs:"{n} 邀请你加入小圈子K歌房「{r}」",zht:"{n} 邀請你加入小圈子K歌房「{r}」",es:"{n} te ha invitado a la sala «Solo nosotros Karaoke» «{r}»"},
 rmInvT0:{ko:"우리끼리 노래 방 「{r}」에 초대했어요",en:"You’re invited to the Just Us Karaoke room “{r}”",ja:"「仲間だけカラオケ」ルーム「{r}」への招待です",zhs:"邀请你加入小圈子K歌房「{r}」",zht:"邀請你加入小圈子K歌房「{r}」",es:"Te han invitado a la sala «Solo nosotros Karaoke» «{r}»"},
 rmInvD:{ko:"StageSong 우리끼리 노래 방 — 함께 노래 영상을 나눠요",en:"StageSong Just Us Karaoke room — share singing videos together",ja:"StageSong「仲間だけカラオケ」ルーム — 歌の動画を一緒に共有しましょう",zhs:"StageSong 小圈子K歌房 — 一起分享演唱视频",zht:"StageSong 小圈子K歌房 — 一起分享演唱影片",es:"Sala «Solo nosotros Karaoke» de StageSong — compartid vídeos cantando"},
 rmInvB:{ko:"방 입장",en:"Enter room",ja:"ルームに入室",zhs:"进入房间",zht:"進入房間",es:"Entrar a la sala"},
 rmInvH:{ko:"초대 링크 (7일간 유효)",en:"Invitation link (valid for 7 days)",ja:"招待リンク（7日間有効）",zhs:"邀请链接（7天内有效）",zht:"邀請連結（7天內有效）",es:"Enlace de invitación (válido 7 días)"},
 rjIng:{ko:"우리끼리 노래 방에 입장하는 중…",en:"Entering the Just Us Karaoke room…",ja:"「仲間だけカラオケ」ルームに入室中…",zhs:"正在进入小圈子K歌房…",zht:"正在進入小圈子K歌房…",es:"Entrando en la sala «Solo nosotros Karaoke»…"},
 rjOk:{ko:"「{r}」 방에 입장했어요.",en:"You joined “{r}”.",ja:"「{r}」に入室しました。",zhs:"已加入「{r}」。",zht:"已加入「{r}」。",es:"Te has unido a «{r}»."},
 rjAl:{ko:"이미 「{r}」 방의 멤버예요.",en:"You’re already a member of “{r}”.",ja:"すでに「{r}」のメンバーです。",zhs:"你已经是「{r}」的成员。",zht:"你已經是「{r}」的成員。",es:"Ya eres miembro de «{r}»."},
 rjExp:{ko:"초대 링크가 만료되었어요. 방장에게 새 초대 링크를 요청해 주세요.",en:"This invitation link has expired. Ask the host for a new one.",ja:"招待リンクの有効期限が切れました。ホストに新しいリンクを依頼してください。",zhs:"邀请链接已过期，请向房主索取新的链接。",zht:"邀請連結已過期，請向房主索取新的連結。",es:"El enlace de invitación ha caducado. Pide uno nuevo al anfitrión."},
 rjNo:{ko:"유효하지 않은 초대 링크예요. 방이 삭제되었을 수 있어요.",en:"This invitation link isn’t valid. The room may have been deleted.",ja:"無効な招待リンクです。ルームが削除された可能性があります。",zhs:"邀请链接无效，房间可能已被删除。",zht:"邀請連結無效，房間可能已被刪除。",es:"El enlace no es válido. Puede que la sala se haya eliminado."},
 rjFull:{ko:"방 인원이 가득 찼어요 (최대 30명).",en:"This room is full (up to 30 people).",ja:"ルームが満員です（最大30人）。",zhs:"房间已满（最多30人）。",zht:"房間已滿（最多30人）。",es:"La sala está llena (máximo 30 personas)."},
 rjId:{ko:"내 스테이지 ID를 설정해 주세요. 방 멤버에게 이 ID로 표시됩니다.",en:"Set your Stage ID. Room members will see you by this ID.",ja:"ステージIDを決めてください。ルームのメンバーにはこのIDで表示されます。",zhs:"请设置你的舞台ID，房间成员会看到这个ID。",zht:"請設定你的舞台ID，房間成員會看到這個ID。",es:"Elige tu ID de Stage. Los miembros de la sala te verán con este ID."},
 rjLt:{ko:"나중에",en:"Later",ja:"あとで",zhs:"以后再说",zht:"以後再說",es:"Más tarde"}
});
// ── 챌린지·릴레이·위챗/웨이보·이용 안내 문구 (사장님 10-31) — 한국어는 한자어
Object.assign(TX,{
 chB:{ko:"챌린지",en:"Challenge",ja:"チャレンジ",zhs:"挑战",zht:"挑戰",es:"Reto"},
 chT:{ko:"이번 주 챌린지",en:"This week's challenge",ja:"今週のチャレンジ",zhs:"本周挑战",zht:"本週挑戰",es:"Reto de la semana"},
 chNone:{ko:"진행 중인 챌린지가 없어요.",en:"There is no challenge right now.",ja:"開催中のチャレンジはありません。",zhs:"目前没有进行中的挑战。",zht:"目前沒有進行中的挑戰。",es:"No hay ningún reto en curso."},
 chLeft:{ko:"{n}일 남음",en:"{n} days left",ja:"残り{n}日",zhs:"剩余{n}天",zht:"剩餘{n}天",es:"Quedan {n} días"},
 chLeftH:{ko:"{n}시간 남음",en:"{n} hours left",ja:"残り{n}時間",zhs:"剩余{n}小时",zht:"剩餘{n}小時",es:"Quedan {n} horas"},
 chEnd:{ko:"종료",en:"Ended",ja:"終了",zhs:"已结束",zht:"已結束",es:"Finalizado"},
 chWait:{ko:"시작 전",en:"Not started",ja:"開始前",zhs:"未开始",zht:"未開始",es:"Aún no empieza"},
 chN:{ko:"참여 {n}건",en:"{n} entries",ja:"参加 {n}件",zhs:"参与 {n}个",zht:"參與 {n}個",es:"{n} participaciones"},
 chGo:{ko:"도전",en:"Take the challenge",ja:"挑戦する",zhs:"参加挑战",zht:"參加挑戰",es:"Participar"},
 chInv:{ko:"친구 초대",en:"Invite friends",ja:"友だちを招待",zhs:"邀请好友",zht:"邀請好友",es:"Invitar amigos"},
 chList:{ko:"참여 영상",en:"Entries",ja:"参加動画",zhs:"参与视频",zht:"參與影片",es:"Participaciones"},
 chE:{ko:"아직 참여 영상이 없어요. 첫 도전자가 되어 보세요.",en:"No entries yet. Be the first to take the challenge.",ja:"まだ参加動画がありません。最初の挑戦者になりましょう。",zhs:"还没有参与视频，来当第一个挑战者吧。",zht:"還沒有參與影片，來當第一個挑戰者吧。",es:"Aún no hay participaciones. Sé la primera persona en participar."},
 chPast:{ko:"지난 챌린지",en:"Past challenges",ja:"過去のチャレンジ",zhs:"往期挑战",zht:"往期挑戰",es:"Retos anteriores"},
 chJoin:{ko:"챌린지 참여",en:"Join the challenge",ja:"チャレンジに参加",zhs:"参加挑战",zht:"參加挑戰",es:"Unirme al reto"},
 chVisN:{ko:"챌린지 참여는 전체 공개 영상만 가능해요.",en:"Only videos visible to everyone can join the challenge.",ja:"チャレンジ参加は全体公開の動画のみです。",zhs:"只有公开给所有人的视频才能参加挑战。",zht:"只有公開給所有人的影片才能參加挑戰。",es:"Solo los vídeos públicos pueden participar en el reto."},
 chErr:{ko:"챌린지 기간이 종료되었거나 곡이 달라요.",en:"The challenge has ended or this is a different song.",ja:"チャレンジ期間が終了したか、曲が違います。",zhs:"挑战已结束，或歌曲不同。",zht:"挑戰已結束，或歌曲不同。",es:"El reto ha terminado o la canción es distinta."},
 chInvT:{ko:"{n}님이 챌린지 「{t}」에 초대했어요",en:"{n} invited you to the challenge “{t}”",ja:"{n}さんがチャレンジ「{t}」に招待しました",zhs:"{n} 邀请你参加挑战「{t}」",zht:"{n} 邀請你參加挑戰「{t}」",es:"{n} te ha invitado al reto «{t}»"},
 chInvT0:{ko:"챌린지 「{t}」에 초대했어요",en:"You’re invited to the challenge “{t}”",ja:"チャレンジ「{t}」への招待です",zhs:"邀请你参加挑战「{t}」",zht:"邀請你參加挑戰「{t}」",es:"Te han invitado al reto «{t}»"},
 chInvD:{ko:"같은 노래로 도전하고 점수를 겨뤄 보세요",en:"Sing the same song and compete for the top score",ja:"同じ歌で挑戦して点数を競いましょう",zhs:"唱同一首歌，比一比谁的分数高",zht:"唱同一首歌，比一比誰的分數高",es:"Canta la misma canción y compite por la mejor puntuación"},
 chRank:{ko:"{n}위",en:"No. {n}",ja:"{n}位",zhs:"第{n}名",zht:"第{n}名",es:"N.º {n}"},
 rlB:{ko:"릴레이",en:"Relay",ja:"リレー",zhs:"接力",zht:"接力",es:"Relevo"},
 rlNone:{ko:"진행 중인 릴레이가 없어요.",en:"No relay in progress.",ja:"進行中のリレーはありません。",zhs:"目前没有进行中的接力。",zht:"目前沒有進行中的接力。",es:"No hay ningún relevo en curso."},
 rlNoneO:{ko:"방장만 릴레이를 시작할 수 있어요.",en:"Only the host can start a relay.",ja:"リレーを始められるのはホストだけです。",zhs:"只有房主可以开始接力。",zht:"只有房主可以開始接力。",es:"Solo el anfitrión puede iniciar un relevo."},
 rlStart:{ko:"릴레이 시작",en:"Start a relay",ja:"リレーを始める",zhs:"开始接力",zht:"開始接力",es:"Iniciar relevo"},
 rlSong:{ko:"곡 선택",en:"Choose a song",ja:"曲を選ぶ",zhs:"选择歌曲",zht:"選擇歌曲",es:"Elige una canción"},
 rlFirst:{ko:"첫 주자 지명",en:"Choose the first singer",ja:"最初の走者を指名",zhs:"指定第一棒",zht:"指定第一棒",es:"Elige quién canta primero"},
 rlTurn:{ko:"{n}님 차례",en:"{n}'s turn",ja:"{n}さんの番",zhs:"轮到 {n}",zht:"輪到 {n}",es:"Turno de {n}"},
 rlMine:{ko:"내 차례",en:"Your turn",ja:"あなたの番",zhs:"轮到你了",zht:"輪到你了",es:"Te toca"},
 rlWait:{ko:"다음 주자 지명 대기",en:"Waiting for the next singer",ja:"次の走者の指名待ち",zhs:"等待指定下一棒",zht:"等待指定下一棒",es:"Esperando al siguiente"},
 rlGo:{ko:"릴레이 도전",en:"Sing my turn",ja:"リレーに挑戦",zhs:"接力演唱",zht:"接力演唱",es:"Cantar mi turno"},
 rlNext:{ko:"다음 주자 지명",en:"Pass to the next singer",ja:"次の走者を指名",zhs:"指定下一棒",zht:"指定下一棒",es:"Pasar al siguiente"},
 rlNextN:{ko:"아직 부르지 않은 사람이 먼저 표시됩니다.",en:"People who haven't sung yet are shown first.",ja:"まだ歌っていない人が先に表示されます。",zhs:"还没唱过的人排在前面。",zht:"還沒唱過的人排在前面。",es:"Primero aparecen quienes aún no han cantado."},
 rlSung:{ko:"완료",en:"Done",ja:"済み",zhs:"已唱",zht:"已唱",es:"Hecho"},
 rlChg:{ko:"주자 변경",en:"Change singer",ja:"走者を変更",zhs:"更换接力者",zht:"更換接力者",es:"Cambiar cantante"},
 rlSkip:{ko:"건너뛰기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"跳過",es:"Saltar"},
 rlEnd:{ko:"릴레이 종료",en:"End relay",ja:"リレーを終了",zhs:"结束接力",zht:"結束接力",es:"Terminar relevo"},
 rlEndQ:{ko:"릴레이를 종료할까요? 게시한 영상은 방에 그대로 남아요.",en:"End this relay? Posted videos stay in the room.",ja:"リレーを終了しますか？投稿した動画はルームに残ります。",zhs:"要结束接力吗？已发布的视频会留在房间里。",zht:"要結束接力嗎？已發布的影片會留在房間裡。",es:"¿Terminar el relevo? Los vídeos publicados se quedan en la sala."},
 rlTell:{ko:"차례 알림",en:"Tell them",ja:"番を知らせる",zhs:"提醒接力",zht:"提醒接力",es:"Avisar"},
 rlTellT:{ko:"{n}님, 우리끼리 노래 방 릴레이 차례예요",en:"{n}, it's your turn in the Just Us Karaoke room relay",ja:"{n}さん、「仲間だけカラオケ」ルームのリレーの番です",zhs:"{n}，轮到你在小圈子K歌房接力了",zht:"{n}，輪到你在小圈子K歌房接力了",es:"{n}, te toca en el relevo de la sala «Solo nosotros Karaoke»"},
 rlInvT:{ko:"{n}님이 릴레이 「{t}」에 초대했어요",en:"{n} invited you to the relay “{t}”",ja:"{n}さんがリレー「{t}」に招待しました",zhs:"{n} 邀请你参加接力「{t}」",zht:"{n} 邀請你參加接力「{t}」",es:"{n} te ha invitado al relevo «{t}»"},
 rlInvT0:{ko:"릴레이 「{t}」에 초대했어요",en:"You’re invited to the relay “{t}”",ja:"リレー「{t}」への招待です",zhs:"邀请你参加接力「{t}」",zht:"邀請你參加接力「{t}」",es:"Te han invitado al relevo «{t}»"},
 rlTellD:{ko:"곡: {t} · StageSong 우리끼리 노래 방",en:"Song: {t} · StageSong Just Us Karaoke room",ja:"曲: {t} · StageSong「仲間だけカラオケ」ルーム",zhs:"歌曲：{t} · StageSong 小圈子K歌房",zht:"歌曲：{t} · StageSong 小圈子K歌房",es:"Canción: {t} · Sala «Solo nosotros Karaoke» de StageSong"},
 rlPost:{ko:"릴레이 게시",en:"Post as my relay turn",ja:"リレーとして投稿",zhs:"作为接力发布",zht:"作為接力發布",es:"Publicar como mi turno"},
 rlPostN:{ko:"릴레이 영상은 이 방(우리끼리 노래)에만 게시됩니다.",en:"Relay videos are posted only to this Just Us Karaoke room.",ja:"リレー動画はこの「仲間だけカラオケ」ルームにだけ投稿されます。",zhs:"接力视频只发布到这个小圈子K歌房。",zht:"接力影片只發布到這個小圈子K歌房。",es:"Los vídeos del relevo solo se publican en esta sala."},
 rlDone:{ko:"게시 완료. 다음 주자를 지명하세요.",en:"Posted. Now pass to the next singer.",ja:"投稿しました。次の走者を指名してください。",zhs:"已发布，请指定下一棒。",zht:"已發布，請指定下一棒。",es:"Publicado. Ahora elige al siguiente."},
 rlErr:{ko:"지금은 릴레이 차례가 아니에요.",en:"It isn't your relay turn right now.",ja:"いまはリレーの番ではありません。",zhs:"现在还没轮到你接力。",zht:"現在還沒輪到你接力。",es:"Ahora no es tu turno en el relevo."},
 rlBusy:{ko:"이미 진행 중인 릴레이가 있어요.",en:"A relay is already in progress.",ja:"すでに進行中のリレーがあります。",zhs:"已有进行中的接力。",zht:"已有進行中的接力。",es:"Ya hay un relevo en curso."},
 rlSeq:{ko:"부른 순서",en:"Singing order",ja:"歌った順番",zhs:"演唱顺序",zht:"演唱順序",es:"Orden de canto"},
 rlNoS:{ko:"검색 결과가 없어요.",en:"No results.",ja:"検索結果がありません。",zhs:"没有搜索结果。",zht:"沒有搜尋結果。",es:"Sin resultados."},
 wcB:{ko:"위챗",en:"WeChat",ja:"WeChat",zhs:"微信",zht:"微信",es:"WeChat"},
 wbB:{ko:"웨이보",en:"Weibo",ja:"Weibo",zhs:"微博",zht:"微博",es:"Weibo"},
 wcCp:{ko:"링크를 복사했어요 — 위챗 대화방에 붙여 넣으세요",en:"Link copied — paste it into a WeChat chat",ja:"リンクをコピーしました — WeChatのトークに貼り付けてください",zhs:"已复制链接 — 请粘贴到微信聊天中",zht:"已複製連結 — 請貼到微信聊天中",es:"Enlace copiado — pégalo en un chat de WeChat"},
 wcQr:{ko:"위챗으로 QR 코드를 스캔해도 열 수 있어요.",en:"You can also scan this QR code with WeChat.",ja:"WeChatでこのQRコードを読み取っても開けます。",zhs:"也可以用微信扫描二维码打开。",zht:"也可以用微信掃描 QR 碼開啟。",es:"También puedes escanear este código QR con WeChat."},
 bkB:{ko:"이용 안내",en:"User guide",ja:"ご利用案内",zhs:"使用指南",zht:"使用指南",es:"Guía de uso"},
 bkToc:{ko:"목차",en:"Contents",ja:"目次",zhs:"目录",zht:"目錄",es:"Índice"},
 bkPrev:{ko:"이전",en:"Back",ja:"前へ",zhs:"上一页",zht:"上一頁",es:"Anterior"},
 bkNext:{ko:"다음",en:"Next",ja:"次へ",zhs:"下一页",zht:"下一頁",es:"Siguiente"},
 bkSw:{ko:"좌우로 밀어 장을 넘길 수 있어요.",en:"Swipe left or right to turn the page.",ja:"左右にスワイプしてページをめくれます。",zhs:"左右滑动即可翻页。",zht:"左右滑動即可翻頁。",es:"Desliza a izquierda o derecha para pasar de página."}
});
// 이용 안내 책자 — 장마다 [제목, 문장들] · o = 옛 사장님 기기 전용 표시(10-31 출시판부터 안 씀) · ic = 기존 아이콘(kst_*.png) · ui = 단추 모양 재사용
var BOOK=[
 {ic:["view"],ui:"srch",t:{ko:"노래 검색·재생",en:"Search and play songs",ja:"曲の検索・再生",zhs:"搜索与播放歌曲",zht:"搜尋與播放歌曲",es:"Buscar y reproducir"},
  p:{ko:["검색창에 곡명이나 가수명을 입력하세요.","첫 목록은 화면 언어에 맞춰 표시됩니다. 한국어·중국어는 K-POP, 일본어는 J-POP, 영어·스페인어는 Pop입니다.","곡을 누르면 금영 공식 유튜브 영상이 재생됩니다.","두 손가락으로 화면을 확대하고, 확대 후에는 한 손가락으로 이동합니다."],
   en:["Type a song title or singer in the search box.","The first list follows the screen language: K-POP for Korean and Chinese, J-POP for Japanese, Pop for English and Spanish.","Tap a song to play the official KY Karaoke video on YouTube.","Pinch with two fingers to zoom in, then drag with one finger to move."],
   ja:["検索欄に曲名や歌手名を入力します。","最初の一覧は画面の言語に合わせて表示されます。韓国語・中国語はK-POP、日本語はJ-POP、英語・スペイン語はPopです。","曲を押すとKY公式YouTube動画が再生されます。","2本の指で拡大し、拡大後は1本の指で移動します。"],
   zhs:["在搜索框输入歌名或歌手名。","第一个列表按界面语言显示：韩语和中文为 K-POP，日语为 J-POP，英语和西班牙语为 Pop。","点歌曲即播放金永(KY)官方 YouTube 视频。","双指放大画面，放大后单指移动。"],
   zht:["在搜尋框輸入歌名或歌手名。","第一個列表依介面語言顯示：韓語和中文為 K-POP，日語為 J-POP，英語和西班牙語為 Pop。","點歌曲即播放金永(KY)官方 YouTube 影片。","雙指放大畫面，放大後單指移動。"],
   es:["Escribe el título o el artista en el buscador.","La primera lista sigue el idioma: K-POP en coreano y chino, J-POP en japonés y Pop en inglés y español.","Toca una canción para reproducir el vídeo oficial de KY Karaoke en YouTube.","Amplía con dos dedos y, después, muévete con un dedo."]}},
  {ic:[],t:{"ko": "포인트·내 지갑", "en": "Points and My wallet", "ja": "ポイント・マイウォレット", "zhs": "积分与我的钱包", "zht": "點數與我的錢包", "es": "Puntos y Mi monedero"},
  p:{ko:["초록 칸의 「내 지갑」에서 포인트를 충전하고 잔여 포인트를 확인합니다. 1P는 1원입니다.", "충전 묶음은 50,000P·100,000P·150,000P·200,000P이며, 앱에서 충전하면 앱 마켓 가격이 적용됩니다.", "사용 전에 「사용 포인트 → 사용 후 잔여 포인트」를 확인합니다. 충전·사용 기록은 「사용 내역」에 있습니다.", "유효기간은 충전일로부터 1년이며, 「기간 연장」으로 3개월씩 연장할 수 있습니다(충전일로부터 5년까지).", "「환불 요청」: 7일 이내 미사용 유료 포인트는 전액, 그 뒤에는 수수료를 공제하고 환불합니다. 무료 포인트는 환불되지 않습니다."],
   en:["Charge points and check your balance in “My wallet” from the green box. 1P equals 1 won.", "Packs are 50,000P, 100,000P, 150,000P and 200,000P. Charging in the app uses app-store prices.", "Before any use you see “points used → balance after”. Charges and uses are listed in “History”.", "Points are valid for 1 year from charging; “Extend” adds 3 months at a time (up to 5 years from charging).", "“Request refund”: unused paid points within 7 days are refunded in full; after that a fee is deducted. Free points are not refunded."],
   ja:["緑の欄の「マイウォレット」でポイントをチャージし、残りポイントを確認します。1Pは1ウォンです。", "チャージは50,000P・100,000P・150,000P・200,000Pで、アプリでのチャージはアプリストアの価格になります。", "使う前に「使用ポイント → 使用後の残り」を確認します。チャージ・使用の記録は「利用履歴」にあります。", "有効期限はチャージ日から1年で、「期間延長」で3か月ずつ延長できます(チャージ日から5年まで)。", "「返金申請」：7日以内の未使用の有料ポイントは全額、その後は手数料を差し引いて返金します。無料ポイントは返金されません。"],
   zhs:["在绿色框的「我的钱包」中充值积分并查看余额。1P 等于1韩元。", "充值套餐为50,000P·100,000P·150,000P·200,000P，在应用内充值按应用商店价格计算。", "使用前会显示「使用积分 → 使用后余额」。充值和使用记录在「使用记录」中。", "积分自充值日起有效1年，可通过「延长有效期」每次延长3个月(最长至充值日起5年)。", "「申请退款」：7天内未使用的付费积分全额退款，之后扣除手续费退款。免费积分不予退款。"],
   zht:["在綠色框的「我的錢包」中儲值點數並查看餘額。1P 等於1韓元。", "儲值方案為50,000P·100,000P·150,000P·200,000P，在應用程式內儲值按應用商店價格計算。", "使用前會顯示「使用點數 → 使用後餘額」。儲值和使用紀錄在「使用記錄」中。", "點數自儲值日起有效1年，可透過「延長有效期」每次延長3個月(最長至儲值日起5年)。", "「申請退款」：7天內未使用的付費點數全額退款，之後扣除手續費退款。免費點數不予退款。"],
   es:["Recarga puntos y consulta tu saldo en «Mi monedero» desde el recuadro verde. 1P equivale a 1 won.", "Los paquetes son 50.000P, 100.000P, 150.000P y 200.000P. En la app se aplican los precios de la tienda.", "Antes de usar ves «puntos usados → saldo después». Las recargas y usos están en «Historial».", "Los puntos valen 1 año desde la recarga; «Ampliar» suma 3 meses cada vez (hasta 5 años desde la recarga).", "«Solicitar reembolso»: los puntos pagados sin usar en 7 días se devuelven completos; después se descuenta una comisión. Los puntos gratuitos no se reembolsan."]}},
 {ic:[],ui:"pay",t:{ko:"이용권",en:"Karaoke pass",ja:"利用券",zhs:"畅唱券",zht:"暢唱券",es:"Bono de karaoke"},
   p:{ko:["PAYMENT 단추에서 이용권(1·3·6·12개월)을 포인트로 구매합니다.","이용권 기간에는 노래를 무제한으로 부를 수 있으며, 자동 연장되지 않습니다.","이용 중에 다시 구매하면 지금 끝나는 날부터 기간이 이어집니다.","초록 칸에 이용권 끝나는 날과 잔여 포인트가 표시됩니다.","자세한 기준은 「공지사항」과 환불 규정을 확인하세요."],
    en:["Buy a pass (1, 3, 6 or 12 months) with points from the PAYMENT button.","During the pass you can sing without limit. It does not renew automatically.","If you buy again while a pass is active, the period continues from the current end date.","The green box shows when your pass ends and your points balance.","See the notice and the refund policy for details."],
    ja:["PAYMENTボタンから利用券（1・3・6・12か月）をポイントで購入します。","利用券の期間中は歌い放題で、自動更新はありません。","利用中にもう一度購入すると、今の終了日から期間が続きます。","緑の欄に利用券の終了日と残りポイントが表示されます。","詳しくは「お知らせ」と返金規定をご確認ください。"],
    zhs:["通过 PAYMENT 按钮用积分购买畅唱券（1·3·6·12个月）。","畅唱券有效期内可无限唱歌，不会自动续费。","使用中再次购买，期间从当前到期日起接续。","绿色框中显示畅唱券到期日和剩余积分。","详情请查看公告和退款规定。"],
    zht:["透過 PAYMENT 按鈕用點數購買暢唱券（1·3·6·12個月）。","暢唱券有效期內可無限唱歌，不會自動續費。","使用中再次購買，期間從目前到期日起接續。","綠色框中顯示暢唱券到期日和剩餘點數。","詳情請查看公告和退款規定。"],
    es:["Compra un bono (1, 3, 6 o 12 meses) con puntos desde el botón PAYMENT.","Durante el bono puedes cantar sin límite. No se renueva automáticamente.","Si compras otro mientras uno está activo, el periodo sigue desde la fecha de fin actual.","El recuadro verde muestra cuándo termina tu bono y tus puntos.","Consulta el aviso y la política de reembolso."]}},
 {o:1,ic:["score"],ui:"rec",t:{ko:"녹화",en:"Recording",ja:"録画",zhs:"录像",zht:"錄影",es:"Grabación"},
  p:{ko:["영상 위 「● 녹화」를 누르면 카메라가 켜지고 녹화가 시작됩니다.","뷰파인더에 녹화 시간과 노래 점수가 표시됩니다.","「■ 녹화 종료」를 누르면 미리 보기와 최종 점수가 표시됩니다."],
   en:["Tap “● Record” on the video to turn on the camera and start recording.","The viewfinder shows the recording time and your singing score.","Tap “■ Stop” to see a preview and your final score."],
   ja:["動画の上の「● 録画」を押すとカメラがつき、録画が始まります。","ビューファインダーに録画時間と歌の点数が表示されます。","「■ 停止」を押すとプレビューと最終点数が表示されます。"],
   zhs:["点视频上的「● 录像」即打开相机并开始录像。","取景画面显示录像时间和演唱分数。","点「■ 停止」即可预览并查看最终分数。"],
   zht:["點影片上的「● 錄影」即開啟相機並開始錄影。","取景畫面顯示錄影時間和演唱分數。","點「■ 停止」即可預覽並查看最終分數。"],
   es:["Toca «● Grabar» sobre el vídeo para encender la cámara y grabar.","El visor muestra el tiempo de grabación y tu puntuación.","Toca «■ Parar» para ver la vista previa y la puntuación final."]}},
 {o:1,ic:["bg","theme"],t:{ko:"배경·테마방·AI 상황 사진",en:"Backgrounds, theme rooms and AI photos",ja:"背景・テーマルーム・AIシーン写真",zhs:"背景、主题房与 AI 场景照",zht:"背景、主題房與 AI 場景照",es:"Fondos, salas temáticas y fotos IA"},
  p:{ko:["녹화 중 오른쪽 위 단추로 배경을 선택합니다. 흐림·무대·콘서트·해변 등이 있습니다.","테마방을 선택하면 테마 배경으로 녹화됩니다.","테마방 녹화 후에는 AI 상황 사진을 생성할 수 있습니다."],
   en:["While recording, use the top-right button to pick a background such as blur, stage, concert or beach.","Pick a theme room to record with a theme background.","After a theme-room recording, you can create an AI scene photo."],
   ja:["録画中は右上のボタンで背景を選びます。ぼかし・ステージ・コンサート・ビーチなどがあります。","テーマルームを選ぶとテーマの背景で録画します。","テーマルームで録画したあとはAIシーン写真を作れます。"],
   zhs:["录像时用右上角按钮选择背景，有模糊、舞台、演唱会、海滩等。","选择主题房即可用主题背景录像。","主题房录像后可生成 AI 场景照。"],
   zht:["錄影時用右上角按鈕選擇背景，有模糊、舞台、演唱會、海灘等。","選擇主題房即可用主題背景錄影。","主題房錄影後可生成 AI 場景照。"],
   es:["Al grabar, usa el botón de arriba a la derecha para elegir fondo: desenfoque, escenario, concierto, playa…","Elige una sala temática para grabar con su fondo.","Tras grabar en una sala temática, puedes crear una foto IA."]}},
 {o:1,ic:["theme"],t:{"ko": "AI 영상", "en": "AI video", "ja": "AI動画", "zhs": "AI 视频", "zht": "AI 影片", "es": "Video IA"},
  p:{ko:["녹화 미리 보기에서 「AI 영상」을 누르고 테마 장면을 선택합니다.", "녹화 영상에서 15초 구간을 골라 15,000P로 생성합니다. 완성까지 4~5분 정도 걸립니다.", "생성에 실패하면 사용한 포인트는 자동으로 환불됩니다.", "완성된 영상에는 「AI 생성」이 표시됩니다."],
   en:["In the recording preview, tap “AI video” and pick a theme scene.", "Choose a 15-second part of your recording and create it for 15,000P. It takes about 4–5 minutes.", "If creation fails, the points are refunded automatically.", "Finished videos are labeled “AI-generated”."],
   ja:["録画のプレビューで「AI動画」を押し、テーマの場面を選びます。", "録画から15秒の区間を選び、15,000Pで作成します。完成まで4〜5分ほどかかります。", "作成に失敗すると、使ったポイントは自動で返金されます。", "完成した動画には「AI生成」と表示されます。"],
   zhs:["在录像预览中点「AI视频」，选择主题场景。", "从录像中选取15秒片段，用15,000P生成，约需4~5分钟完成。", "生成失败时，所用积分会自动退还。", "完成的视频会标注「AI 生成」。"],
   zht:["在錄影預覽中點「AI影片」，選擇主題場景。", "從錄影中選取15秒片段，用15,000P生成，約需4~5分鐘完成。", "生成失敗時，所用點數會自動退還。", "完成的影片會標註「AI 生成」。"],
   es:["En la vista previa de la grabación, toca «Video IA» y elige una escena temática.", "Elige un tramo de 15 segundos y créalo por 15.000P. Tarda unos 4–5 minutos.", "Si la creación falla, los puntos se devuelven automáticamente.", "Los videos terminados llevan la etiqueta «Generado por IA»."]}},
 {o:1,ic:[],ui:"chips",t:{ko:"게시·공개 범위",en:"Posting and who can see",ja:"投稿・公開範囲",zhs:"发布与公开范围",zht:"發布與公開範圍",es:"Publicar y quién lo ve"},
  p:{ko:["미리 보기에서 「내 노래 게시」를 누릅니다.","공개 범위는 전체 공개·팔로워만·우리끼리 노래·비공개 네 가지입니다.","공개 범위는 게시 전에 선택합니다."],
   en:["In the preview, tap “Post my song”.","There are four options: everyone, followers only, Just Us Karaoke rooms, and only me.","Choose who can see it before you post."],
   ja:["プレビューで「自分の歌を投稿」を押します。","公開範囲は全体公開・フォロワーのみ・仲間だけ・自分だけの4つです。","公開範囲は投稿前に選びます。"],
   zhs:["在预览中点「发布我的歌」。","公开范围有四种：所有人、仅粉丝、小圈子、仅自己。","发布前选择公开范围。"],
   zht:["在預覽中點「發布我的歌」。","公開範圍有四種：所有人、僅粉絲、小圈子、僅自己。","發布前選擇公開範圍。"],
   es:["En la vista previa, toca «Publicar mi canción».","Hay cuatro opciones: todo el mundo, solo seguidores, salas «Solo nosotros Karaoke» y solo yo.","Elige quién puede verla antes de publicar."]}},
 {o:1,ic:["vid","grid","list"],t:{ko:"스테이지·내 스테이지",en:"Stage and My Stage",ja:"ステージ・マイステージ",zhs:"舞台与我的舞台",zht:"舞台與我的舞台",es:"Escenario y Mi escenario"},
  p:{ko:["「스테이지」에서 다른 사람의 노래 영상을 시청합니다.","「내 스테이지」에는 내가 게시한 영상이 모입니다.","목록·바둑판 보기로 전환하고, 최신순·오래된순·점수순으로 정렬합니다."],
   en:["Watch other people's singing videos on the Stage.","My Stage collects the videos you posted.","Switch between list and grid view, and sort by newest, oldest or top score."],
   ja:["「ステージ」でほかの人の歌の動画を見ます。","「マイステージ」には自分が投稿した動画が集まります。","一覧・グリッド表示を切り替え、新しい順・古い順・点数順に並べ替えます。"],
   zhs:["在「舞台」观看其他人的演唱视频。","「我的舞台」汇集你发布的视频。","可切换列表/宫格视图，并按最新、最早、分数排序。"],
   zht:["在「舞台」觀看其他人的演唱影片。","「我的舞台」匯集你發布的影片。","可切換列表/宮格檢視，並依最新、最早、分數排序。"],
   es:["En el Escenario ves vídeos de otras personas.","Mi escenario reúne los vídeos que publicaste.","Cambia entre lista y cuadrícula y ordena por recientes, antiguos o puntuación."]}},
 {o:1,ic:["fol","id","up"],t:{ko:"팔로우·프로필·ID",en:"Follow, profile and ID",ja:"フォロー・プロフィール・ID",zhs:"关注、头像与 ID",zht:"追蹤、頭像與 ID",es:"Seguir, perfil e ID"},
  p:{ko:["ID를 누르면 그 사람의 스테이지로 이동합니다.","팔로우하면 팔로워 공개 영상도 시청할 수 있습니다.","내 스테이지에서 ID를 설정하고 프로필(영상 또는 AI 사진)을 변경합니다."],
   en:["Tap an ID to open that person's stage.","Follow someone to also watch their followers-only videos.","On My Stage, set your ID and change your profile (a video or an AI photo)."],
   ja:["IDを押すとその人のステージに移動します。","フォローするとフォロワー限定の動画も見られます。","マイステージでIDを決め、プロフィール（動画またはAI写真）を変更します。"],
   zhs:["点 ID 即可进入对方的舞台。","关注后也能观看仅粉丝可见的视频。","在「我的舞台」设置 ID 并更换头像（视频或 AI 照片）。"],
   zht:["點 ID 即可進入對方的舞台。","追蹤後也能觀看僅粉絲可見的影片。","在「我的舞台」設定 ID 並更換頭像（影片或 AI 照片）。"],
   es:["Toca un ID para abrir el escenario de esa persona.","Si la sigues, también verás sus vídeos solo para seguidores.","En Mi escenario, elige tu ID y cambia tu perfil (vídeo o foto IA)."]}},
 {o:1,ic:["!krm_song","plus","share"],t:{ko:"우리끼리 노래 방",en:"Just Us Karaoke rooms",ja:"「仲間だけカラオケ」ルーム",zhs:"小圈子K歌房",zht:"小圈子K歌房",es:"Salas «Solo nosotros Karaoke»"},
  p:{ko:["팔로우한 사람을 선택해 방을 생성합니다. 최대 30명이며, 방장이 생성할 때 3,000P를 한 번 사용합니다.","방장은 멤버 추가·제외, 이름 변경, 방 삭제 권한이 있습니다.","방장은 카톡 초대 링크(7일간 유효)로 친구를 초대합니다."],
   en:["Create a room with people you follow, up to 30 people. The host uses 3,000P once to create it.","The host can add or remove members, rename the room and delete it.","The host can invite friends with a KakaoTalk link that is valid for 7 days."],
   ja:["フォロー中の人を選んでルームを作ります。最大30人で、作成時にホストが3,000Pを1回使用します。","ホストはメンバーの追加・削除、名前の変更、ルームの削除ができます。","ホストはカカオトークの招待リンク（7日間有効）で友だちを招待します。"],
   zhs:["从你关注的人中选择成员创建房间，最多30人，房主创建时一次性使用3,000P。","房主可添加或移除成员、重命名和删除房间。","房主可用 KakaoTalk 邀请链接（7天有效）邀请好友。"],
   zht:["從你追蹤的人中選擇成員建立房間，最多30人，房主建立時一次性使用3,000P。","房主可新增或移除成員、重新命名和刪除房間。","房主可用 KakaoTalk 邀請連結（7天有效）邀請好友。"],
   es:["Crea una sala con personas que sigues, hasta 30. El anfitrión usa 3.000P una vez al crearla.","El anfitrión puede añadir o quitar miembros, renombrar y eliminar la sala.","El anfitrión invita con un enlace de KakaoTalk válido 7 días."]}},
 {o:1,ic:["!dor","!dor_sing","!dor_dance"],t:{ko:"도란도란",en:"Doran-doran video room",ja:"ドランドラン",zhs:"Doran-doran 视频聊天室",zht:"Doran-doran 視訊聊天室",es:"Sala de video Doran-doran"},
  p:{ko:["방장이 3,000P로 방을 생성해 2시간 사용합니다. 참여자는 무료이며 최대 9명이고, 초대 링크로만 입장합니다.", "화면은 「바둑판」 또는 「둥글게」로 바꾸며, 두 번 누르면 그 사람이 크게 보입니다. 마이크·카메라는 아래 단추로 끕니다.", "「노래하기」·「춤추기」를 누르면 모두의 화면에 같은 반주가 맞춰 재생되고 그 사람이 크게 보입니다.", "끝나기 30분 전부터 누구나 3,000P로 2시간 연장할 수 있습니다(10분 전 알림).", "「나갔다 오기」는 나만 나가고 방은 그대로입니다. 「방 종료」는 방장이 방을 끝냅니다. 방장은 「강퇴」할 수 있고, 누구나 ⋯에서 신고할 수 있습니다.", "화면이 멈추면 「화면 다시 불러오기」를 누르세요. 영상과 소리는 녹화·저장하지 않습니다."],
   en:["The host creates a room for 3,000P and uses it for 2 hours. Guests join free, up to 9 people, by invitation link only.", "Switch between “Grid” and “Circle”; double-tap someone to see them large. Turn your mic or camera off with the buttons below.", "Tap “Sing” or “Dance” and the same backing track plays in sync for everyone, with that person shown large.", "From 30 minutes before the end, anyone can extend 2 hours for 3,000P (notice at 10 minutes).", "“Step out” leaves only you; the room stays. “End room” lets the host close it. The host can “Kick out” someone, and anyone can report from ⋯.", "If the screen freezes, tap “Reload video”. Video and audio are never recorded or stored."],
   ja:["ホストが3,000Pでルームを作り、2時間使用します。参加者は無料で最大9人、招待リンクでのみ入室します。", "「グリッド」と「円形」を切り替え、ダブルタップするとその人が大きく表示されます。マイク・カメラは下のボタンでオフにします。", "「歌う」「踊る」を押すと全員の画面で同じ伴奏が同期して流れ、その人が大きく表示されます。", "終了30分前から誰でも3,000Pで2時間延長できます(10分前にお知らせ)。", "「ちょっと外へ」は自分だけ退出し、部屋はそのままです。「ルームを終了」はホストが部屋を終えます。ホストは「強制退室」ができ、誰でも⋯から通報できます。", "画面が止まったら「映像を再読み込み」を押してください。映像と音声は録画・保存しません。"],
   zhs:["房主用3,000P创建房间，可使用2小时。参与者免费，最多9人，仅凭邀请链接进入。", "可切换「九宫格」和「围坐」，双击某人即可放大。用下方按钮关闭麦克风或摄像头。", "点「唱歌」「跳舞」后，所有人的画面会同步播放同一伴奏，并放大显示此人。", "结束前30分钟起，任何人都可用3,000P延长2小时(结束前10分钟提醒)。", "「暂时离开」只有自己离开，房间保留；「结束房间」由房主结束房间。房主可以「踢出」成员，任何人都可在⋯中举报。", "画面卡住时请点「重新加载画面」。不录制、不保存视频和声音。"],
   zht:["房主用3,000P建立房間，可使用2小時。參與者免費，最多9人，僅憑邀請連結進入。", "可切換「九宮格」和「圍坐」，雙擊某人即可放大。用下方按鈕關閉麥克風或攝影機。", "點「唱歌」「跳舞」後，所有人的畫面會同步播放同一伴奏，並放大顯示此人。", "結束前30分鐘起，任何人都可用3,000P延長2小時(結束前10分鐘提醒)。", "「暫時離開」只有自己離開，房間保留；「結束房間」由房主結束房間。房主可以「踢出」成員，任何人都可在⋯中檢舉。", "畫面卡住時請點「重新載入畫面」。不錄製、不保存影像和聲音。"],
   es:["El anfitrión crea una sala por 3.000P y la usa 2 horas. Los invitados entran gratis, hasta 9, solo con enlace de invitación.", "Cambia entre «Cuadrícula» y «Círculo»; toca dos veces a alguien para verlo en grande. Apaga micrófono o cámara con los botones de abajo.", "Toca «Cantar» o «Bailar» y la misma pista suena sincronizada para todos, con esa persona en grande.", "Desde 30 minutos antes del final, cualquiera puede ampliar 2 horas por 3.000P (aviso a los 10 minutos).", "«Salir un rato» te saca solo a ti; la sala sigue. «Cerrar sala» la termina el anfitrión. El anfitrión puede «Expulsar», y cualquiera puede denunciar desde ⋯.", "Si la pantalla se congela, toca «Recargar vídeo». El video y el audio no se graban ni se guardan."]}},
 {o:1,ic:[],t:{"ko": "방 꾸미기", "en": "Room decor", "ja": "ルームデコ", "zhs": "房间装饰", "zht": "房間裝飾", "es": "Decorar la sala"},
  p:{ko:["우리끼리 노래 방·도란도란 방의 「꾸미기」 단추로 상점과 보관함을 엽니다.", "장소(방 배경)는 방장만 바꾸고, 소품은 방 사람 누구나 놓을 수 있습니다.", "먹거리·폭죽·야광봉 같은 소모품은 놓을 때 하나씩 사용되고, 영구 아이템은 한 번 구매하면 보관함에 남아 계속 사용합니다.", "세트는 이미 보유한 영구 아이템을 뺀 금액만 냅니다. 방장은 놓인 소품을 모두 치울 수 있습니다."],
   en:["Tap “Decorate” in a Just Us Karaoke or Doran-doran room to open the shop and your storage.", "Only the host changes the place (room background); anyone in the room can place props.", "Consumables such as snacks, fireworks and glow sticks are used up when placed; permanent items stay in storage once bought.", "Sets cost only the permanent items you do not own yet. The host can remove any placed prop."],
   ja:["仲間だけカラオケ部屋・ドランドランの「デコる」ボタンでショップと保管箱を開きます。", "場所(部屋の背景)はホストだけが変え、小物は部屋の誰でも置けます。", "食べ物・花火・サイリウムなどの消耗品は置くたびに1つ使い、永久アイテムは一度買えば保管箱に残り使い続けられます。", "セットはすでに持っている永久アイテムを除いた金額だけです。ホストは置かれた小物をすべて片付けられます。"],
   zhs:["在小圈子K歌房或 Doran-doran 房间点「装扮」，打开商店和收纳箱。", "场所(房间背景)只有房主可以更换，道具房间里任何人都可以摆放。", "零食、烟花、荧光棒等消耗品每摆放一次用掉一个；永久道具购买一次即留在收纳箱中持续使用。", "套装只需支付尚未拥有的永久道具的金额。房主可以移除所有摆放的道具。"],
   zht:["在小圈子K歌房或 Doran-doran 房間點「裝扮」，打開商店和收納箱。", "場所(房間背景)只有房主可以更換，道具房間裡任何人都可以擺放。", "零食、煙火、螢光棒等消耗品每擺放一次用掉一個；永久道具購買一次即留在收納箱中持續使用。", "套裝只需支付尚未擁有的永久道具的金額。房主可以移除所有擺放的道具。"],
   es:["Toca «Decorar» en una sala Solo nosotros Karaoke o Doran-doran para abrir la tienda y tu almacén.", "Solo el anfitrión cambia el lugar (fondo de la sala); cualquiera en la sala puede colocar objetos.", "Los consumibles como comida, fuegos artificiales y barras luminosas se gastan al colocarlos; los objetos permanentes quedan en el almacén tras comprarlos.", "Los sets solo cuestan los objetos permanentes que aún no tienes. El anfitrión puede quitar cualquier objeto colocado."]}},
 {o:1,ic:["fol"],t:{"ko": "주변 노래 친구", "en": "Singers nearby", "ja": "近くの歌友", "zhs": "附近歌友", "zht": "附近歌友", "es": "Cantantes cerca"},
  p:{ko:["19세 이상 성인 인증을 마친 계정만 이용합니다.", "「내 위치 보이기」를 켠 사람끼리만 서로 보이며, 거리는 1km·3km·10km 이내로만 표시됩니다. 24시간이 지나면 자동으로 꺼집니다.", "「같이 노래해요」로 우리끼리 노래 방 또는 도란도란 방에 초대합니다. 상대가 수락하면 방이 만들어지고 초대한 사람이 3,000P를 사용합니다.", "받은 초대는 수락·거절·차단할 수 있습니다. 차단하면 서로 보이지 않습니다.", "방 안의 「근처 친구 찾기」로 지금 있는 방에 추가 요금 없이 부를 수 있습니다(10분 안에 수락)."],
   en:["Available only to accounts verified as 19 or older.", "Only people who turn on “Show my location” see each other, and distance is shown only as within 1, 3 or 10 km. It turns off automatically after 24 hours.", "Use “Sing together” to invite someone to a Just Us Karaoke or Doran-doran room. When they accept, the room is created and the inviter uses 3,000P.", "You can accept, decline or block an invitation. Blocked people cannot see each other.", "Inside a room, “Find nearby friends” invites people to that room at no extra charge (accept within 10 minutes)."],
   ja:["19歳以上の成人認証を済ませたアカウントのみ利用できます。", "「自分の位置を表示」をオンにした人同士だけが表示され、距離は1km・3km・10km以内でのみ表示されます。24時間で自動的にオフになります。", "「一緒に歌おう」で仲間だけカラオケ部屋またはドランドランに招待します。相手が承諾すると部屋が作られ、招待した人が3,000Pを使います。", "届いた招待は承諾・辞退・ブロックできます。ブロックするとお互いに表示されません。", "部屋の中の「近くの友だちを探す」で、今の部屋に追加料金なしで呼べます(10分以内に承諾)。"],
   zhs:["仅限完成19岁以上成人认证的账号使用。", "只有开启「显示我的位置」的人才能互相看到，距离仅显示为1公里·3公里·10公里以内。24小时后自动关闭。", "用「一起唱吧」邀请对方进入小圈子K歌房或 Doran-doran 房间。对方接受后创建房间，由邀请人使用3,000P。", "收到的邀请可以接受、拒绝或屏蔽。屏蔽后彼此看不到对方。", "在房间内用「查找附近的朋友」可免费邀请对方进入当前房间(需在10分钟内接受)。"],
   zht:["僅限完成19歲以上成人認證的帳號使用。", "只有開啟「顯示我的位置」的人才能互相看到，距離僅顯示為1公里·3公里·10公里以內。24小時後自動關閉。", "用「一起唱吧」邀請對方進入小圈子K歌房或 Doran-doran 房間。對方接受後建立房間，由邀請人使用3,000P。", "收到的邀請可以接受、拒絕或封鎖。封鎖後彼此看不到對方。", "在房間內用「尋找附近的朋友」可免費邀請對方進入目前房間(需在10分鐘內接受)。"],
   es:["Solo para cuentas verificadas como mayores de 19 años.", "Solo se ven entre sí quienes activan «Mostrar mi ubicación», y la distancia se muestra solo como a menos de 1, 3 o 10 km. Se desactiva sola a las 24 horas.", "Con «Cantemos juntos» invitas a una sala Solo nosotros Karaoke o Doran-doran. Si acepta, se crea la sala y quien invita usa 3.000P.", "Puedes aceptar, rechazar o bloquear una invitación. Las personas bloqueadas no se ven entre sí.", "Dentro de una sala, «Buscar amigos cerca» invita a esa sala sin coste extra (aceptar en 10 minutos)."]}},
 {o:1,ic:["relay"],t:{ko:"릴레이",en:"Relay",ja:"リレー",zhs:"接力",zht:"接力",es:"Relevo"},
  p:{ko:["방장이 곡과 첫 주자를 지정해 릴레이를 시작합니다.","차례인 사람만 「릴레이 도전」으로 녹화·게시할 수 있습니다.","게시 후 다음 주자를 지명합니다. 방장은 주자 변경·건너뛰기·종료가 가능합니다."],
   en:["The host picks a song and the first singer to start a relay.","Only the person whose turn it is can record and post with “Sing my turn”.","After posting, pass to the next singer. The host can change singers, skip or end the relay."],
   ja:["ホストが曲と最初の走者を決めてリレーを始めます。","番の人だけが「リレーに挑戦」で録画・投稿できます。","投稿したら次の走者を指名します。ホストは走者の変更・スキップ・終了ができます。"],
   zhs:["房主选择歌曲和第一棒，开始接力。","只有轮到的人才能用「接力演唱」录像并发布。","发布后指定下一棒。房主可更换接力者、跳过或结束接力。"],
   zht:["房主選擇歌曲和第一棒，開始接力。","只有輪到的人才能用「接力演唱」錄影並發布。","發布後指定下一棒。房主可更換接力者、跳過或結束接力。"],
   es:["El anfitrión elige canción y primera persona para iniciar el relevo.","Solo quien tiene el turno puede grabar y publicar con «Cantar mi turno».","Tras publicar, pasa el turno. El anfitrión puede cambiar, saltar o terminar."]}},
 {o:1,ic:["chal","score"],t:{ko:"챌린지",en:"Challenge",ja:"チャレンジ",zhs:"挑战",zht:"挑戰",es:"Reto"},
  p:{ko:["운영자가 정한 곡으로 기간 내 누구나 참여합니다.","「도전」을 누르면 곡 재생과 녹화가 시작됩니다.","전체 공개로 게시한 영상만 참여로 인정되며, 점수순으로 순위가 표시됩니다.","「친구 초대」로 카카오톡·LINE·WhatsApp 등에 초대 링크를 보냅니다."],
   en:["Anyone can join with the song we pick, during the challenge period.","Tap “Take the challenge” to play the song and start recording.","Only videos posted for everyone count, ranked by score.","Use “Invite friends” to send the link via KakaoTalk, LINE, WhatsApp and more."],
   ja:["運営が決めた曲で、期間中なら誰でも参加できます。","「挑戦する」を押すと曲の再生と録画が始まります。","全体公開で投稿した動画だけが参加となり、点数順に順位が表示されます。","「友だちを招待」でカカオトーク・LINE・WhatsAppなどに招待リンクを送ります。"],
   zhs:["活动期间任何人都可以用指定歌曲参加。","点「参加挑战」即开始播放歌曲并录像。","只有公开给所有人的视频才算参与，按分数排名。","用「邀请好友」通过 KakaoTalk、LINE、WhatsApp 等发送邀请链接。"],
   zht:["活動期間任何人都可以用指定歌曲參加。","點「參加挑戰」即開始播放歌曲並錄影。","只有公開給所有人的影片才算參與，依分數排名。","用「邀請好友」透過 KakaoTalk、LINE、WhatsApp 等傳送邀請連結。"],
   es:["Cualquiera puede participar con la canción elegida durante el reto.","Toca «Participar» para reproducir la canción y grabar.","Solo cuentan los vídeos públicos, ordenados por puntuación.","Con «Invitar amigos» envía el enlace por KakaoTalk, LINE, WhatsApp y más."]}},
 {ic:["share"],ui:"shr",t:{ko:"공유",en:"Sharing",ja:"共有",zhs:"分享",zht:"分享",es:"Compartir"},
  p:{ko:["공유 단추에서 카카오톡·X·페이스북·LINE·WhatsApp·텔레그램·위챗·웨이보·문자·메일로 보냅니다.","위챗은 링크를 복사해 대화방에 붙여 넣거나 QR 코드를 스캔합니다.","「다른 앱으로」를 누르면 인스타그램 등 휴대폰의 다른 앱으로 보냅니다."],
   en:["Share via KakaoTalk, X, Facebook, LINE, WhatsApp, Telegram, WeChat, Weibo, text message or email.","For WeChat, copy the link and paste it into a chat, or scan the QR code.","“Other apps” sends it to other apps on your phone, such as Instagram."],
   ja:["共有ボタンからカカオトーク・X・Facebook・LINE・WhatsApp・Telegram・WeChat・Weibo・メッセージ・メールで送れます。","WeChatはリンクをコピーしてトークに貼り付けるか、QRコードを読み取ります。","「他のアプリ」を押すとInstagramなどスマホの他のアプリに送れます。"],
   zhs:["可通过 KakaoTalk、X、Facebook、LINE、WhatsApp、Telegram、微信、微博、短信、邮件分享。","微信：复制链接后粘贴到聊天中，或扫描二维码。","点「其他应用」可发送到 Instagram 等手机上的其他应用。"],
   zht:["可透過 KakaoTalk、X、Facebook、LINE、WhatsApp、Telegram、微信、微博、簡訊、郵件分享。","微信：複製連結後貼到聊天中，或掃描 QR 碼。","點「其他應用」可傳送到 Instagram 等手機上的其他應用。"],
   es:["Comparte por KakaoTalk, X, Facebook, LINE, WhatsApp, Telegram, WeChat, Weibo, SMS o correo.","En WeChat, copia el enlace y pégalo en un chat, o escanea el código QR.","«Otras apps» lo envía a otras apps del móvil, como Instagram."]}},
 {ic:[],ui:"law",t:{ko:"문의·약관",en:"Contact and terms",ja:"お問い合わせ・規約",zhs:"联系与条款",zht:"聯絡與條款",es:"Contacto y condiciones"},
  p:{ko:["문의는 메일로 보내 주세요: admin@moneypuzzle.co.kr","아래에서 이용약관·환불 규정·개인정보처리방침을 확인할 수 있습니다."],
   en:["Email us at admin@moneypuzzle.co.kr","See the terms of use, refund policy and privacy policy below."],
   ja:["お問い合わせはメールで: admin@moneypuzzle.co.kr","下から利用規約・返金規定・個人情報処理方針を確認できます。"],
   zhs:["如有疑问请发邮件至 admin@moneypuzzle.co.kr","可在下方查看使用条款、退款规定和隐私政策。"],
   zht:["如有疑問請寄信至 admin@moneypuzzle.co.kr","可在下方查看使用條款、退款規定和隱私權政策。"],
   es:["Escríbenos a admin@moneypuzzle.co.kr","Abajo puedes ver las condiciones de uso, la política de reembolso y la de privacidad."]}}
];
var st=document.createElement("style");
st.textContent="#karBox{touch-action:pan-x pan-y;word-break:keep-all;overflow-wrap:break-word;position:fixed;inset:0;z-index:2147483004;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden}"
 +"#karBox::before{content:'';position:absolute;inset:-20%;pointer-events:none;background:conic-gradient(from 0deg,rgba(255,80,200,.10),rgba(80,160,255,.10),rgba(120,255,180,.08),rgba(255,200,80,.10),rgba(255,80,200,.10));animation:karSpin 14s linear infinite;mix-blend-mode:screen}@keyframes karSpin{to{transform:rotate(360deg)}}"
 +"#karBox .kin{position:relative;max-width:720px;width:100%;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:10px 12px 0}"
 +"#karBox .khd{display:flex;align-items:center;gap:8px}#karBox .khd b{font-size:19px;text-shadow:0 0 8px #ff4fd8,0 0 16px #7a5cff}#karBox .khd small{display:block;font-size:12px;opacity:.75;font-weight:600}#karBox .kx{margin-left:auto;white-space:nowrap;flex-shrink:0;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:7px 14px;font-weight:800;cursor:pointer}"
 +"#karBox .kch{display:flex;gap:8px;margin:8px 0}#karBox .kch a{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 8px;color:#fff;text-decoration:none;font-weight:800;font-size:13px}#karBox .kch img{width:34px;height:34px;border-radius:50%;flex:0 0 auto}"
 +"#karBox .kpl{position:relative;width:100%;height:max(200px,calc(100dvh - 485px));background:#000;border-radius:12px;overflow:hidden;box-shadow:0 0 18px rgba(170,90,255,.45);flex:0 0 auto}#karBox .kpl .kmsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-weight:800;opacity:.8}#karBox .kpl iframe{width:100%;height:100%;border:0}"
 +"#karBox .ktb{display:flex;gap:6px;margin:10px 0 6px}#karBox .ktb button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .ktb .kstg{flex:1.15;line-height:1.15;white-space:normal;border-color:#ffe066;color:#ffe066}#karBox.krecm .kin>*:not(.kpl){display:none!important}#karBox.krecm .kin{padding:8px}#karBox.krecm .kpl{height:auto!important;flex:1 1 auto;border:3px solid #ff3b3b;box-shadow:0 0 0 2px rgba(255,59,59,.35),0 0 28px rgba(255,59,59,.55)}#karBox .kvf{position:absolute;inset:0;pointer-events:none;z-index:3}#karBox .kvf i{position:absolute;width:36px;height:36px;border:3px solid rgba(255,255,255,.92)}#karBox .kvf .a{top:16px;left:16px;border-right:0;border-bottom:0}#karBox .kvf .b{top:16px;right:16px;border-left:0;border-bottom:0}#karBox .kvf .c{bottom:16px;left:16px;border-right:0;border-top:0}#karBox .kvf .d{bottom:16px;right:16px;border-left:0;border-top:0}#karBox .kvf b{position:absolute;top:18px;left:50%;transform:translateX(-50%);font:800 14px/1 ui-monospace,Consolas,monospace;color:#fff;background:rgba(0,0,0,.45);padding:6px 10px;border-radius:6px;letter-spacing:.06em}#karBox .kvf em{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff2b2b;vertical-align:0;animation:kbl 1s steps(1) infinite}@keyframes kbl{50%{opacity:0}}#karBox .kvf s{position:absolute;left:33.3%;right:33.3%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.12);border-right:1px solid rgba(255,255,255,.12)}#karBox .kflash{position:absolute;inset:0;z-index:6;background:#fff;pointer-events:none;animation:kfl .45s ease-out forwards}@keyframes kfl{from{opacity:.95}to{opacity:0}}#karBox .kcam{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);z-index:1;background:#000}#karBox.krecm .kpl iframe{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);width:min(calc(100% - 24px),560px);height:auto;aspect-ratio:16/9;z-index:4;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.6)}@media (orientation:landscape){#karBox.krecm .kpl iframe{left:auto;right:12px;transform:none;width:min(38%,calc((100dvh - 40px)*0.45*16/9))}}#karBox.krecm .kmsg{display:none}#karBox .kpv video{width:100%;max-height:50vh;background:#000;border-radius:10px}#karBox.krecm .krec::first-letter{color:#fff}#karBox.krecm .krec{top:14px;left:14px;z-index:5;background:#ff2b2b;font-size:14px;padding:9px 18px;box-shadow:0 0 0 4px rgba(255,255,255,.85)}#karBox .krec{position:absolute;top:10px;left:10px;z-index:4;border:0;border-radius:999px;background:rgba(0,0,0,.6);color:#fff;font-weight:900;font-size:12.5px;padding:6px 11px;cursor:pointer}#karBox .krec::first-letter{color:#ff3b3b}#karBox .kcvs{transform:none;z-index:2}#karBox .kcam.khid{opacity:0}#karBox .kbgb{position:absolute;top:62px;right:14px;z-index:5;width:46px;height:46px;border:0;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 0 0 3px rgba(255,255,255,.5),0 3px 10px rgba(0,0,0,.4);padding:5px;cursor:pointer}#karBox .kbgb img{width:100%;height:100%;display:block}#karBox .kbgr{position:absolute;left:0;right:0;bottom:10px;z-index:7;display:flex;gap:10px;overflow-x:auto;padding:10px 12px;background:rgba(0,0,0,.62);-webkit-overflow-scrolling:touch}#karBox .kbgr button{flex:0 0 auto;width:64px;border:0;background:none;color:#fff;font-size:11px;font-weight:800;line-height:1.2;padding:0;cursor:pointer;text-align:center}#karBox .kbgr i{display:block;width:56px;height:56px;margin:0 auto 4px;border-radius:50%;background:#333;border:3px solid rgba(255,255,255,.6);overflow:hidden}#karBox .kbgr i b{display:block;width:100%;height:100%;background:center/cover no-repeat}#karBox .kbgr i b.kbl{filter:blur(3px);transform:scale(1.2)}#karBox .kbgr .kon i{border-color:#ffe066;box-shadow:0 0 0 2px #ffe066}#karBox .kbgr .kon{color:#ffe066}#karBox .kupb{border:0;border-radius:999px;background:#ffe066;color:#1a1300;font-weight:900;font-size:15px;padding:11px 20px;cursor:pointer}#karBox .ksoon{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:9;background:rgba(20,14,36,.95);border:1px solid #ffe066;color:#ffe066;font-weight:800;font-size:14px;padding:10px 16px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.5);white-space:nowrap;pointer-events:none}#karBox .kstgt{display:flex;gap:6px}#karBox .kstgt button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .kstgt button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}#karBox .kstge{min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;color:#cfc6e8;line-height:1.6;padding:12px;border:1px dashed rgba(255,255,255,.25);border-radius:12px}#karBox .ktb button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}"
 +"#karBox .ksr{display:flex;gap:6px}#karBox .ksr input{flex:1;min-width:0;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;padding:9px 10px;font-size:15px}#karBox .ksr button{border:0;border-radius:10px;background:#ff4fd8;color:#fff;font-weight:900;padding:0 14px;cursor:pointer}"
 +"#karBox .kls{flex:1;overflow:auto;margin-top:8px;padding-bottom:16px;-webkit-overflow-scrolling:touch}#karBox .kit{display:flex;align-items:center;gap:8px;padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}#karBox .kit.on{background:rgba(255,79,216,.16);border-radius:10px}#karBox .kit img{width:24px;height:24px;border-radius:50%;flex:0 0 auto}#karBox .kit span{flex:1;font-size:14.5px;font-weight:700;line-height:1.3}#karBox .kit i{font-style:normal;font-size:12px;opacity:.6}"
 +"#karBox .kit b.kyt{font-weight:800;color:#ff8080;margin-right:4px}#karBox .kov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:rgba(0,0,0,.82);font-weight:800;z-index:2}#karBox .kov a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:900}#karBox .kst{font-size:13px;opacity:.75;padding:10px 4px}";
st.textContent+="#karBox .kpay{display:flex;align-items:center;gap:10px;margin:10px 0 2px;background:linear-gradient(180deg,#2a2440,#16121f);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}"
 +"#karBox .kpay .kr{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:8px;row-gap:2px;line-height:1.25}#karBox .kpay .kr b{font-size:15px;color:#ffe066;text-shadow:0 0 6px rgba(255,200,60,.6)}#karBox .kpay .kr small{font-size:11.5px;opacity:.75}"
 +"#karBox .kpay .kl{cursor:pointer;font:800 13px/1.2 ui-monospace,Consolas,monospace;color:#7CFFB2;background:#05140c;border:1px solid #1d6b43;border-radius:6px;padding:5px 8px;text-shadow:0 0 6px #2bd97d}"
 +"#karBox .kslot{margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:linear-gradient(180deg,#5a5f6b,#2c2f36);border-radius:10px;padding:6px 14px 7px;cursor:pointer;box-shadow:0 2px 0 #111,inset 0 1px 0 rgba(255,255,255,.25)}"
 +"#karBox .kslot i{display:block;width:44px;height:7px;border-radius:4px;background:#000;box-shadow:inset 0 2px 3px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.2)}#karBox .kslot span{font:900 12px/1 system-ui,sans-serif;letter-spacing:.12em;color:#fff}#karBox .kslot small{font-size:10px;color:#cfd3dc;font-weight:600}"
 +"#karBox .kpm{position:absolute;inset:0;z-index:5;background:rgba(5,3,10,.78);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}#karBox .kpm>div{margin:auto 0;flex:0 0 auto}#karBox .kpm>div{width:min(360px,100%);background:#1d1830;border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}"
 +"#karBox .kpm h3{margin:0;font-size:17px}#karBox .kpm .ksel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#karBox .kpm .ksel button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:9px 0;font-weight:900;cursor:pointer}#karBox .kpm .ksel button.on{background:#ff4fd8;border-color:#ff4fd8}"
 +"#karBox .kpm .kt{display:flex;justify-content:space-between;font-size:18px;font-weight:900}#karBox .kpm .kgo{border:0;border-radius:12px;padding:12px;background:#ffe066;color:#1a1300;font-size:16px;font-weight:900;cursor:pointer}#karBox .kpm .kc{border:0;background:none;color:#cfc6e8;font-weight:700;cursor:pointer}#karBox .kpm .km{font-size:12.5px;color:#cfc6e8;line-height:1.5;margin:0}"
 +"#karBox .kntl{display:block;flex:0 0 auto;white-space:nowrap;margin:0 0 0 auto;border:0;background:none;color:#cfc6e8;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:2px 4px}"
 +"#karBox .kpm.kntc{z-index:6}#karBox .kpm.kntc>div{max-height:100%;overflow:auto}#karBox .kpm ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;font-size:13.5px;line-height:1.5;color:#efe6ff}#karBox .kpm .kra{color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline}#karBox .kpm .kpp{border:0;background:none;padding:0;text-align:left;font-size:12.5px;color:#ffe066;text-decoration:underline;cursor:pointer;line-height:1.4}";
st.textContent+="#karBox .kpm .klf{font:800 15px/1.3 system-ui,sans-serif;color:#7CFFB2}#karBox .kpm .ksg{font-size:13px;color:#efe6ff;line-height:1.5}#karBox .kpm .ksgb{border:0;background:none;padding:0 0 0 4px;color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer}"
 +"#karBox .kpm .krf{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px;font-size:14px;font-weight:800;cursor:pointer}#karBox .kpm .kq{margin:0;font-size:14.5px;line-height:1.55;color:#efe6ff}";
st.textContent+="#karBox .kpol2{display:flex;align-items:center;gap:8px;margin:2px 0 0}#karBox .kpol2 span{flex:1;font-size:11.5px;line-height:1.35;color:#cfc6e8}#karBox .kpay .kbk2{border:0;background:none;padding:0;margin:0;cursor:pointer;line-height:0;align-self:center}#karBox .kpay .kbk2 img{width:26px;height:26px;display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}#karBox .kpay .kr{align-self:center}#karBox .kpay .kbuyb{margin-left:auto}#karBox .kpay .kbuyb+.kslot{margin-left:0}#karBox .kpay{display:grid!important;grid-template-columns:1fr auto;grid-template-areas:'kr kl' 'kr ks';column-gap:8px;row-gap:5px;align-items:center;padding-top:6px;padding-bottom:6px}#karBox .kpay .kr{grid-area:kr}#karBox .kpay .kl{grid-area:kl;justify-self:end;padding:3px 7px;font-size:12px}#karBox .kpay .kslot{grid-area:ks;justify-self:end;margin-left:0!important;padding:4px 10px 5px;gap:2px}#karBox .kpay .kslot i{width:34px;height:5px}#karBox .kpay .kslot span{font-size:11px}#karBox .kpay .kslot small{font-size:9px}#karBox .kpay{grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);grid-template-areas:'kr kl ks';column-gap:8px;align-items:stretch}#karBox .kpay .kr{display:flex;align-items:stretch;justify-content:stretch;min-width:0}#karBox .kpay .kbk2,#karBox .kpay .kl,#karBox .kpay .kslot{height:46px;box-sizing:border-box;min-width:0;width:100%;justify-self:stretch;align-self:center;margin:0!important}#karBox .kpay .kbk2{display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,224,102,.55);background:linear-gradient(180deg,#4a1d6b,#2a0f3d);border-radius:8px;box-shadow:0 2px 0 rgba(0,0,0,.5);padding:0}#karBox .kpay .kl{display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;line-height:1.15;padding:3px 6px;border-radius:8px;white-space:normal;word-break:keep-all;overflow-wrap:anywhere}#karBox .kpay .kslot{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3px 6px}@media (max-width:380px){#karBox .kpay{column-gap:6px}#karBox .kpay .kl{font-size:12px;padding:3px 4px}}#karBox .kbuyb{flex:0 0 auto;border:0;border-radius:999px;padding:8px 14px;background:#ffe066;color:#1a1300;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 0 10px rgba(255,224,102,.45)}"
 +"#karBox .kbz .nw{white-space:nowrap}#karBox .kbz{word-break:keep-all;overflow-wrap:break-word;margin:14px 2px 6px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.15);font-size:11px;line-height:1.6;color:#b9b0d4}#karBox .kbz b{color:#efe6ff}#karBox .kbzl{margin-top:4px}#karBox .kbz a{color:#ffe066}"
 +"#karBox .kpm.kbuy>div{position:relative;max-height:100%;overflow:auto;overflow-x:hidden}#karBox .kut{display:inline-block;margin-left:8px;vertical-align:middle;background:#c92a2a;color:#fff;font:900 10.5px/1 system-ui,sans-serif;letter-spacing:.06em;padding:4px 6px;border-radius:5px}"
 +"#karBox .kstamp{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);border:4px solid rgba(220,40,40,.35);color:rgba(220,40,40,.35);font:900 28px/1 system-ui,sans-serif;letter-spacing:.08em;padding:6px 12px;border-radius:10px;pointer-events:none;white-space:nowrap}"
 +"#karBox .kpks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#karBox .kpk{min-width:0;overflow:hidden}#karBox .kpk .ksv{white-space:nowrap}#karBox .kpk{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.05);color:#fff;border-radius:12px;padding:10px;cursor:pointer}#karBox .kpk.on{border-color:#ffe066;background:rgba(255,224,102,.14);box-shadow:0 0 0 2px #ffe066 inset}"
 +"#karBox .kpk b{font-size:19px}#karBox .ksv{font-style:normal;font-size:11.5px;font-weight:900;color:#1a1300;background:#7CFFB2;border-radius:999px;padding:2px 7px}#karBox .ksv0{background:none}#karBox .kpk .kpp1{font-size:16px;font-weight:900;color:#ffe066}#karBox .kpk small{font-size:11px;opacity:.8}"
 +"#karBox .krow{display:flex;justify-content:space-between;gap:10px;font-size:14px}#karBox .krow span{opacity:.8}#karBox .kh{font-size:14px;margin-top:4px}#karBox .kfl{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:#cfc6e8}#karBox .kfl input{border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;padding:9px 10px;font-size:15px}"
 +"#karBox .kfr{display:flex;align-items:flex-start;gap:6px;font-size:13px;line-height:1.4}#karBox .klk a{color:#ffe066;font-size:12.5px;margin-right:12px}#karBox .kerr{background:rgba(201,42,42,.25);border:1px solid #c92a2a;border-radius:10px;padding:8px;font-size:13px}#karBox .ktst{margin:0;font-size:11.5px;color:#ff9b9b;font-weight:700}"
 +"#karBox .kdone{background:rgba(124,255,178,.12);border:1px solid #1d6b43;border-radius:10px;padding:10px;font-size:13px;line-height:1.5}#karBox .kgo:disabled{opacity:.45;cursor:default}#karBox .kpol{background:rgba(255,255,255,.06);border-radius:10px;padding:8px}";
// 내 노래 올리기 창·가요무대 목록 (10-30)
st.textContent+="#karBox .kpm.kupm{z-index:7}#karBox .kpm.kplay{z-index:8}#karBox .kpm.kstgp>div{max-height:100%;overflow:auto}#karBox .kupv{display:flex;gap:6px}#karBox .kupv button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:9px 4px;font-weight:900;cursor:pointer}#karBox .kupv button.on{background:#ff4fd8;border-color:#ff4fd8}"
 +"#karBox .kupbar{height:10px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}#karBox .kupbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff4fd8,#ffe066);transition:width .2s}#karBox .kupp{font-size:13px;font-weight:800;color:#ffe066;text-align:center}"
 +"#karBox .kstgl{display:grid;grid-template-columns:1fr 1fr;gap:8px}#karBox .kstc{position:relative;display:flex;flex-direction:column;gap:3px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:5px;cursor:pointer;min-width:0}#karBox .kstc video{width:100%;aspect-ratio:3/4;object-fit:cover;background:#000;border-radius:7px;pointer-events:none}"
 +"#karBox .kstc b{font-size:12.5px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .kstc small{font-size:11px;opacity:.7}#karBox .kstc .kvt{position:absolute;top:9px;left:9px;font:800 10.5px/1 system-ui,sans-serif;background:rgba(0,0,0,.65);color:#fff;padding:3px 6px;border-radius:5px}"
 +"#karBox .kstc .kdel{border:1px solid rgba(255,120,120,.6);background:rgba(201,42,42,.18);color:#ffb0b0;border-radius:8px;padding:5px;font-size:12px;font-weight:800;cursor:pointer}#karBox .kplay video{width:100%;max-height:65vh;background:#000;border-radius:10px}";
// 가요무대 페이지(화면 전환)·프로필·영상 상세 (10-30)
st.textContent+="#karBox .kpg{position:absolute;inset:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;overflow:hidden}#karBox .kpgh{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:10px 12px 8px;padding-top:max(10px,env(safe-area-inset-top));border-bottom:1px solid rgba(255,255,255,.1)}#karBox .kpbk{flex:0 0 auto;width:38px;height:38px;border:0;border-radius:12px;background:rgba(255,255,255,.07);padding:5px;cursor:pointer;display:flex;align-items:center;justify-content:center}#karBox .kpbk img{width:26px;height:26px;display:block}#karBox .kpgt{flex:1;min-width:0;display:flex;gap:6px;align-items:center}#karBox .kpgt h3{margin:0;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpgt button{flex:1;min-width:0;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;font-size:13.5px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpgt button.on{background:#ff4fd8;border-color:#ff4fd8}#karBox .kpgb{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px}#karBox .kpgb>*{flex:0 0 auto;width:100%;max-width:640px;align-self:center;box-sizing:border-box}#karBox .kic{width:20px;height:20px;flex:0 0 auto;vertical-align:middle}#karBox .kic.s{width:14px;height:14px}#karBox .kpf{display:flex;gap:12px;align-items:flex-start}#karBox .kpfv{position:relative;flex:0 0 auto;width:min(36vw,150px);aspect-ratio:3/4;border:2px solid #ffe066;border-radius:14px;overflow:hidden;background:#000;padding:0;cursor:pointer}#karBox .kpfv video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}#karBox .kpfe{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.45}#karBox .kpfe .kic{width:44px;height:44px}#karBox .kpfc{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.62);color:#fff;font:800 11.5px/1 system-ui,sans-serif;padding:6px 0;text-align:center}#karBox .kpfi{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;padding-top:2px}#karBox .kpr{display:flex;align-items:center;gap:7px;font-size:13px;min-width:0}#karBox .kpr span{flex:1;min-width:0;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpr b{font-size:15px}#karBox .kpr.kpn b{flex:1;min-width:0;font-size:16px;color:#ffe066;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kln{border:1px solid #ffe066;background:none;color:#ffe066;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap}#karBox .ksrt{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;font-weight:800}#karBox .ksrt button{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 12px;font-weight:800;font-size:12.5px;cursor:pointer;white-space:nowrap}#karBox .krows{display:flex;flex-direction:column;gap:8px}#karBox .krow{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px;cursor:pointer;min-width:0}#karBox .krd{flex:0 0 auto;width:62px;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}#karBox .krd b{font-size:13.5px}#karBox .krd small{font-size:10.5px;opacity:.65;line-height:1.3}#karBox .krs{flex:0 0 auto;width:46px;align-self:stretch;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-left:1px solid rgba(255,255,255,.14);border-right:1px solid rgba(255,255,255,.14);margin-left:-4px}#karBox .krs b{font-size:21px;font-weight:900;line-height:1;color:#ffe066;font-variant-numeric:tabular-nums}#karBox .krs b.kna{color:rgba(255,255,255,.45)}#karBox .krs small{font-size:10.5px;opacity:.7;line-height:1.2}#karBox .kvf u{position:absolute;top:54px;left:50%;transform:translateX(-50%);text-decoration:none;font:900 18px/1 system-ui,sans-serif;color:#ffe066;background:rgba(0,0,0,.45);padding:6px 12px;border-radius:999px;font-variant-numeric:tabular-nums;text-shadow:0 0 8px rgba(255,224,102,.6)}#karBox .kpvs{margin:-4px 0 8px;font-weight:900;color:#ffe066}#karBox .kpvs b{font-size:20px}#karBox .kthb{top:116px}#karBox .kpv .kaib{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:12px;padding:10px;background:#ff4fd8;color:#fff;font-size:15px;font-weight:900;cursor:pointer}#karBox .kpv .kaib img{width:28px;height:28px}#karBox .kpm.kaim{z-index:7}#karBox .kpm.kaim>div{max-height:100%;overflow:auto}#karBox .kaim h3{display:flex;align-items:center;gap:8px}#karBox .kaih{width:30px;height:30px}#karBox .kaic{display:flex;flex-wrap:wrap;gap:6px}#karBox .kaic button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:16px;padding:6px 10px;font-size:12.5px;font-weight:800;cursor:pointer}#karBox .kaic button.on{background:#ff4fd8;border-color:#ff4fd8}#karBox .kaic button.krn{background:#ffe066;color:#1a1300;border-color:#ffe066}#karBox .kaic button:disabled{opacity:.5}#karBox .kaiimg{width:100%;border-radius:12px;display:block}#karBox .kaiw{display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 0;font-weight:900;color:#ffe066}#karBox .kaiw i{width:34px;height:34px;border-radius:50%;border:4px solid rgba(255,224,102,.3);border-top-color:#ffe066;animation:kaisp 1s linear infinite}@keyframes kaisp{to{transform:rotate(360deg)}}#karBox .kpm .kg2{background:#fff;color:#1a1300}#karBox .kpm .kg2.on{background:#7be37b}#karBox .kpfv img.kpfm{width:100%;height:100%;object-fit:cover;display:block}#karBox .kvf s.kg1{left:33.33%;right:33.33%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.32);border-right:1px solid rgba(255,255,255,.32)}#karBox .kvf s.kg2{position:absolute;top:33.33%;bottom:33.33%;left:0;right:0;border-top:1px solid rgba(255,255,255,.32);border-bottom:1px solid rgba(255,255,255,.32);border-left:0;border-right:0}#karBox .kvf .ksa{position:absolute;inset:5%;border:1px dashed rgba(255,255,255,.18)}#karBox .kvf>b{top:62px;left:20px;transform:none;background:none;padding:0;font-size:13px;text-shadow:0 1px 2px rgba(0,0,0,.75);font-variant-numeric:tabular-nums}#karBox .kvf>b span{margin-left:6px}#karBox .kvf .kfo{position:absolute;left:37.5%;top:37.5%;width:25%;height:25%;opacity:.6;background:linear-gradient(#fff,#fff) 0 0/16px 2px,linear-gradient(#fff,#fff) 0 0/2px 16px,linear-gradient(#fff,#fff) 100% 0/16px 2px,linear-gradient(#fff,#fff) 100% 0/2px 16px,linear-gradient(#fff,#fff) 0 100%/16px 2px,linear-gradient(#fff,#fff) 0 100%/2px 16px,linear-gradient(#fff,#fff) 100% 100%/16px 2px,linear-gradient(#fff,#fff) 100% 100%/2px 16px;background-repeat:no-repeat;filter:drop-shadow(0 0 1px rgba(0,0,0,.6))}#karBox .kvf .kfo p{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;border:1.5px solid;border-color:rgba(255,255,255,.55) rgba(255,255,255,.55) rgba(255,255,255,.18) rgba(255,255,255,.18);transform:rotate(-45deg)}#karBox .kvf .kfo::before,#karBox .kvf .kfo::after{content:'';position:absolute;left:50%;top:50%;background:#fff}#karBox .kvf .kfo::before{width:16px;height:1.5px;margin:-.75px 0 0 -8px}#karBox .kvf .kfo::after{width:1.5px;height:16px;margin:-8px 0 0 -.75px}#karBox .kvf .kru{position:absolute;left:64px;right:calc(38% + 36px);bottom:24px;height:14px;background:repeating-linear-gradient(to right,rgba(255,255,255,.55) 0 1px,transparent 1px 10px) bottom/100% 6px no-repeat;border-bottom:1px solid rgba(255,255,255,.5);filter:drop-shadow(0 1px 1px rgba(0,0,0,.6))}#karBox .kvf .kru::after{content:'';position:absolute;left:50%;bottom:0;width:2px;height:14px;margin-left:-1px;background:#fff}#karBox .kvf .kru p{position:absolute;left:50%;bottom:-9px;margin:0 0 0 -5px;width:0;height:0;border:5px solid transparent;border-bottom:7px solid #ffe066;border-top:0;transition:left .1s linear}#karBox .kvf .klv{position:absolute;left:20px;top:32%;bottom:24%;width:46px;font:700 9px/1 ui-monospace,Consolas,monospace;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8)}#karBox .kvf .klv .kc{position:absolute;top:0;bottom:0;width:7px;background:linear-gradient(to top,#3ddc84 0%,#3ddc84 70%,#ffe066 78%,#ffe066 90%,#ff3b3b 94%);box-shadow:0 0 0 1px rgba(255,255,255,.4)}#karBox .kvf .klv .kc:nth-child(2){left:10px}#karBox .kvf .klv .kc::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(to top,transparent 0 4px,rgba(0,0,0,.5) 4px 5px)}#karBox .kvf .klv .kc p{position:absolute;left:0;right:0;top:0;height:100%;margin:0;background:rgba(10,10,14,.8);z-index:1}#karBox .kvf .klv .kc a{position:absolute;left:-1px;right:-1px;bottom:0;height:2px;background:#fff;z-index:2}#karBox .kvf .klv .kc small{position:absolute;top:100%;left:0;width:7px;margin-top:4px;text-align:center}#karBox .kvf .klv .ksl{position:absolute;left:21px;top:0;bottom:0}#karBox .kvf .klv .ksl small{position:absolute;left:0;transform:translateY(50%);white-space:nowrap}#karBox .kvf .khd{position:absolute;top:24px;right:60px;display:flex;align-items:center;gap:7px;font:800 11px/1 ui-monospace,Consolas,monospace;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8)}#karBox .kvf .khd var{position:relative;display:flex;gap:1px;padding:1px;width:24px;height:11px;border:1.5px solid #fff;border-radius:2px;box-sizing:border-box;box-shadow:0 1px 2px rgba(0,0,0,.6)}#karBox .kvf .khd var::after{content:'';position:absolute;right:-4px;top:2px;width:2px;height:4px;background:#fff}#karBox .kvf .khd q{flex:1;background:#fff}#karBox .kvf .khd q::before,#karBox .kvf .khd q::after{content:none}#karBox .kvf .khd span:last-child{border:1px solid #fff;padding:1px 3px;border-radius:2px}#karBox .kpl:has(.kbgr) .kvf .kru,#karBox .kpl:has(.kbgr) .kvf .klv{display:none}#karBox.krecm .krec{animation:krecp 1s ease-in-out infinite alternate}@keyframes krecp{from{box-shadow:0 0 0 4px rgba(255,255,255,.85)}to{box-shadow:0 0 0 4px rgba(255,255,255,.85),0 0 16px 5px rgba(255,43,43,.85)}}#karBox .kscr{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(8,4,20,.86);cursor:pointer;animation:kscIn .25s ease-out}#karBox .kscr::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:0}#karBox .kscr.kdone::before{background:radial-gradient(circle at 50% 50%,rgba(255,224,102,.55),rgba(255,79,216,.25) 35%,transparent 65%);animation:kfl 1.2s ease-out forwards}#karBox .kscw{position:relative;text-align:center;color:#fff}#karBox .kscw small{display:block;font-weight:900;font-size:18px;letter-spacing:.08em;color:#ffb3ef;margin-bottom:6px}#karBox .kscw b{display:inline-block;font:900 128px/1 system-ui,sans-serif;color:#ffe066;font-variant-numeric:tabular-nums;text-shadow:0 0 18px rgba(255,224,102,.7),0 0 40px rgba(255,79,216,.55)}#karBox .kscw i{font-style:normal;font-weight:900;font-size:34px;color:#ffe066;margin-left:6px}#karBox .kscr.kdone b{animation:kscPop .6s cubic-bezier(.2,1.6,.4,1),kscGl .9s ease-in-out .6s infinite alternate}@keyframes kscIn{from{opacity:0}to{opacity:1}}@keyframes kscPop{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}@keyframes kscGl{from{text-shadow:0 0 18px rgba(255,224,102,.7),0 0 40px rgba(255,79,216,.55)}to{text-shadow:0 0 26px #fff,0 0 60px #ffe066,0 0 100px #ff4fd8}}#karBox .krm{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}#karBox .krm p{margin:0;font-size:13.5px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all;overflow-wrap:break-word}#karBox .kvw{margin-left:6px;min-width:36px;font-size:16px;line-height:1;display:inline-flex;align-items:center;justify-content:center}#karBox .kvw .kgvi{width:16px;height:16px;display:block}#karBox.kgv .krows{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px}#karBox.kgv .krow{display:block!important;position:relative;padding:0!important;border:0!important;border-radius:4px;overflow:hidden;aspect-ratio:1/1;background:#000;min-height:0}#karBox.kgv .krow>*:not(video){display:none!important}#karBox.kgv .krow>video{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;object-fit:cover;border-radius:0!important;margin:0!important}#karBox .krm small{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;align-items:center;column-gap:12px;row-gap:4px;font-size:11.5px;opacity:.85}#karBox .krm small>:first-child:not(.kst2){grid-column:1/-1;justify-self:start}#karBox .krm .kst2{white-space:nowrap}#karBox .krm .kst2{display:inline-flex;align-items:center;gap:3px}#karBox .krm .knk{color:#ffe066;font-weight:800;max-width:9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .ktg{display:inline-block;border:1px solid rgba(255,255,255,.4);border-radius:6px;padding:1px 5px;font:800 10.5px/1.3 system-ui,sans-serif;color:#cfc6e8}#karBox .ktg.p{border-color:#7CFFB2;color:#7CFFB2}#karBox .krv{flex:0 0 auto;width:54px;aspect-ratio:3/4;object-fit:cover;background:#000;border-radius:8px;pointer-events:none}#karBox .kdv{width:100%;max-height:62vh;background:#000;border-radius:12px;display:block}#karBox .kdm{font-size:12.5px;color:#cfc6e8}#karBox .kdm b{color:#ffe066}#karBox .kdr{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#karBox .kdr button,#karBox .kdr .kvw{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 14px;font-weight:900;font-size:14px;cursor:pointer}#karBox .kdr button.on{background:rgba(255,224,102,.22);border-color:#ffe066}#karBox .kdr .kvw{cursor:default;border-style:dashed}#karBox .kbx{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}#karBox .kbx h4{margin:0;font-size:14px;display:flex;align-items:center;gap:6px}#karBox .kbx p{margin:0;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word}#karBox .kbx .kdim{opacity:.6}#karBox .kbx textarea{width:100%;min-height:68px;resize:vertical;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.3);color:#fff;border-radius:10px;padding:8px;font:inherit;font-size:14px;box-sizing:border-box}#karBox .kbr{display:flex;gap:6px;justify-content:flex-end;align-items:center}#karBox .kbr small{margin-right:auto;opacity:.6;font-size:11.5px}#karBox .kbt{border:0;border-radius:10px;padding:7px 14px;font-weight:900;font-size:13.5px;cursor:pointer;background:#ffe066;color:#1a1300}#karBox .kbt.g{background:rgba(255,255,255,.1);color:#fff}#karBox .kbt.r{background:rgba(201,42,42,.2);color:#ffb0b0;border:1px solid rgba(255,120,120,.6);padding:10px}#karBox .kcm{display:flex;flex-direction:column;gap:3px;padding:7px 0;border-top:1px solid rgba(255,255,255,.08)}#karBox .kch{display:flex;gap:6px;align-items:center;font-size:12px}#karBox .kch b{color:#ffe066}#karBox .kch small{opacity:.6}#karBox .kch button{margin-left:auto;border:0;background:none;color:#ffb0b0;font-size:11.5px;cursor:pointer;text-decoration:underline}#karBox .kpkp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#karBox .kpkp button{position:relative;padding:0;border:2px solid transparent;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:3/4;cursor:pointer}#karBox .kpkp button.on{border-color:#ffe066}#karBox .kpkp video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}#karBox .kpkp small{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);color:#fff;font-size:10.5px;padding:3px 0}#karBox .kpkp img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}#karBox .kzv{position:relative;overflow:hidden;touch-action:none;border-radius:12px;background:#000}#karBox .kzv img{display:block;width:100%;height:auto;transform-origin:0 0;user-select:none;-webkit-user-drag:none;pointer-events:none}#karBox .kaiv .kzv,#karBox .kzv.kaiz{width:auto;max-width:100%;align-self:center}#karBox .kaiv .kzv img,#karBox .kzv.kaiz img{width:auto;max-width:100%;max-height:58vh}#karBox .kzv.kaiz img{max-height:46vh}#karBox .kaib{display:flex;flex-direction:column;gap:8px}#karBox .kaib .kbt{padding:12px;font-size:15px}#karBox .kaib .kbt:disabled{opacity:.7;cursor:default}#karBox .kpg .kpm{z-index:30}#karBox .kni{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:10px;padding:10px;font-size:16px;font-weight:800}#karBox .ksoon{z-index:60}";
// 팔로우 단추·ID 누르기·팔로워 목록 (10-30)
st.textContent+="#karBox .ktg.f{border-color:#8fc7ff;color:#8fc7ff}#karBox .kfw{flex:0 0 auto;border:1px solid #ff4fd8;background:#ff4fd8;color:#fff;border-radius:999px;padding:4px 11px;font-weight:900;font-size:12px;cursor:pointer;white-space:nowrap}#karBox .kfw.on{background:none;color:#ffb3ef}#karBox .kfw:disabled{opacity:.6}"
 +"#karBox .kun{border:0;background:none;padding:0;margin:0;font:inherit;color:#ffe066;font-weight:800;cursor:pointer;text-decoration:underline;text-underline-offset:2px;max-width:12em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}#karBox .kdm{display:flex;flex-wrap:wrap;align-items:center;gap:6px}"
 +"#karBox .kpr.kfl2{cursor:pointer}#karBox .kpr.kfl2 b{text-decoration:underline;text-underline-offset:2px}#karBox .kpfv.kro{cursor:default}#karBox .kfls{display:flex;flex-direction:column;gap:6px}#karBox .kfls button{display:flex;align-items:center;gap:8px;text-align:left;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#ffe066;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px;cursor:pointer}";
// 우리끼리 방·보기 전환·공개 범위 칩·공유 (10-30) — 한 화면에 단추를 늘어놓지 않게: 작은 3칸 전환 한 줄 · 방 = 이름 한 줄 + 사람 수 + ⋯ · 칩 4개 한 줄
st.textContent+="#karBox .kseg{display:flex;gap:2px;padding:3px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:999px}"
 +"#karBox .kseg button{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:4px;border:0;background:none;color:#e9dcff;border-radius:999px;padding:6px 4px;font-weight:800;font-size:12.5px;cursor:pointer;white-space:nowrap;overflow:hidden}"
 +"#karBox .kseg button span{overflow:hidden;text-overflow:ellipsis}#karBox .kseg button.on{background:#ff4fd8;color:#fff}"
 +"#karBox .krms{display:flex;flex-direction:column;gap:8px}#karBox .krms>button{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit}"
 +"#karBox .krms>button .kic{width:28px;height:28px}#karBox .krms>button b{flex:1;min-width:0;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .krms>button small{font-size:12px;opacity:.75;white-space:nowrap}"
 +"#karBox .krms>button.krm0{border-style:dashed;border-color:rgba(255,224,102,.55)}#karBox .krms>button.krm0 b{color:#ffe066;font-size:14px}"
 +"#karBox .krmh{display:flex;align-items:center;gap:8px}#karBox .krmt{flex:1;min-width:0;display:flex;align-items:center;gap:8px}#karBox .krmt .kic{width:30px;height:30px}"
 +"#karBox .krmt b{font-size:17px;color:#ffe066;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
 +"#karBox .krmc{flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:5px 10px;font-weight:800;font-size:12.5px;cursor:pointer;white-space:nowrap}#karBox .krmc.on{border-color:#ff4fd8}"
 +"#karBox .krmx{flex:0 0 auto;width:38px;height:32px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;font-size:18px;font-weight:900;line-height:1;cursor:pointer;padding:0}"
 +"#karBox .krmm{display:flex;flex-wrap:wrap;gap:6px}#karBox .krmm>span{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:4px 10px;font-size:13px}"
 +"#karBox .krmm .kme{color:#fff}#karBox .krmm .krmi{display:inline-flex;align-items:center;gap:5px;border:0;border-radius:999px;padding:5px 12px;background:#ffe066;color:#1a1300;font-size:13px;font-weight:900;cursor:pointer}#karBox .kpm .kmsg{margin:0;font-size:15px;line-height:1.55;color:#efe6ff;white-space:pre-line}#karBox .krmm small{font:800 10px/1.3 system-ui,sans-serif;color:#ffb3ef;border:1px solid #ffb3ef;border-radius:5px;padding:0 4px}"
 +"#karBox .kmn{display:flex;flex-direction:column;gap:6px}#karBox .kmn button{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px;cursor:pointer;text-align:left}"
 +"#karBox .kmn button.r{color:#ffb0b0;border-color:rgba(255,120,120,.5)}"
 +"#karBox .kchk{display:flex;flex-direction:column;gap:4px;max-height:38vh;overflow:auto}#karBox .kchk label{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.05);font-size:14px;font-weight:700;cursor:pointer;min-width:0}"
 +"#karBox .kchk label span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .kchk label small{font-size:11.5px;opacity:.7}#karBox .kchk input{width:18px;height:18px;margin:0;accent-color:#ff4fd8;flex:0 0 auto}"
 +"#karBox .kchips{display:flex;gap:5px}#karBox .kchips button{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;border-radius:16px;padding:7px 2px 6px;font-weight:800;font-size:11px;line-height:1.2;cursor:pointer;text-align:center}"
 +"#karBox .kchips button .kic{width:26px;height:26px}#karBox .kchips button span{max-width:100%;overflow-wrap:anywhere}#karBox .kchips button.on{background:rgba(255,79,216,.28);border-color:#ff4fd8}"
 +"#karBox .kdr .kshb{margin-left:auto}#karBox .ktg.r{border-color:#ffb3d9;color:#ffb3d9}";
// 공유창 (노래방 사이트와 투어앱 같이)
st.textContent+="#karShr{position:fixed;inset:0;z-index:2147483006;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}"
 +"#karShr .shin{background:#fff;color:#111827;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:16px 14px 24px;max-height:85vh;overflow:auto;box-sizing:border-box}"
 +"#karShr .shhd{font-size:12px;color:#5b6474;margin:0 2px 8px}#karShr .shgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}"
 +"#karShr .shgrid a,#karShr .shgrid button{display:flex;align-items:center;gap:6px;padding:9px 10px;border:1px solid #e6e9ef;border-radius:9px;background:#fff;color:#111827;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;text-align:left;font-family:inherit}"
 +"#karShr svg{width:17px;height:17px;flex:0 0 auto}#karShr .shmsg{font-size:12.5px;color:#1f5fa8;margin-top:9px;min-height:16px;text-align:center;font-weight:700;word-break:break-all}";
// 화면 다듬기 (사장님 10-30 「이런 것도 네가 알아서 예쁘게」) — 두 줄 갈라짐·홀로 남는 낱말·숫자 넘침·칸 높이 맞춤 · 모양만, 동작은 그대로
st.textContent+="#karBox,#karShr{text-wrap:pretty}html:lang(ja) #karBox{word-break:auto-phrase}#karBox h3,#karBox h4,#karBox .kpay .kr small,#karBox .ksrt>span,#karBox .krd small,#karBox .kpk small,#karBox .kstge,#karBox .kbz{text-wrap:balance}"
 +"#karBox .kit span{min-width:0}#karBox .kit i{flex:0 1 auto;max-width:36%;text-align:right;line-height:1.3;overflow-wrap:anywhere}"
 +"#karBox .krm small{display:flex!important;flex-wrap:wrap;align-items:center;column-gap:10px;row-gap:4px;line-height:1.25}#karBox .krm small>:not(.kst2){order:0;min-width:0;max-width:100%}#karBox .krm small::after{content:'';order:1;flex:0 0 100%;height:0}#karBox .krm small:not(:has(>:not(.kst2)))::after{display:none}#karBox .krm small .kst2{order:2;font-variant-numeric:tabular-nums}"
 +"#karBox .krm .ktg{max-width:100%;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}#karBox .krm .knk{max-width:100%;line-height:1.45}#karBox .krd b{white-space:nowrap}#karBox .ksrt>span{flex:1;min-width:0}#karBox .ksrt button{flex:0 0 auto}"
 +"@media (max-width:380px){#karBox .krow{gap:8px;padding:8px 7px}#karBox .krd{width:60px}#karBox .krd b{font-size:13px}#karBox .krs{width:40px;margin-left:-2px}#karBox .krs b{font-size:19px}#karBox .krv{width:46px}#karBox .krm small{column-gap:8px}#karBox .kdr{gap:6px}#karBox .kdr button,#karBox .kdr .kvw{padding:6px 9px;font-size:13.5px;gap:5px}#karBox .kdr .kic{width:18px;height:18px}}"
 +"#karBox .kdr button,#karBox .kdr .kvw{line-height:1;font-variant-numeric:tabular-nums}#karBox .kch{flex-wrap:wrap;row-gap:2px}#karBox .kch b{min-width:0;overflow-wrap:anywhere}#karBox .kch small{white-space:nowrap}"
 +"#karBox .kchips button{justify-content:flex-start}#karBox .kchips button span{flex:1 0 auto;min-height:2.4em;display:flex;align-items:center;justify-content:center;text-wrap:balance}html:lang(ja) #karBox .kchips button span{word-break:auto-phrase}"
 +"#karBox .kpk small{font-size:10.5px;line-height:1.3}#karBox .kpl:has(.kbgr) .kvf .c,#karBox .kpl:has(.kbgr) .kvf .d{display:none}#karBox .kbgr{scrollbar-width:none}#karBox .kbgr::-webkit-scrollbar{display:none}"
 +"#karBox .kpg .kpgb>p.km{margin:0;font-size:14px;line-height:1.5}";
// 챌린지·릴레이·이용 안내 책자 (10-31) — 아이콘 + 짧은 글자, 단순하게
st.textContent+="#karBox .ktb .kchb{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;line-height:1.15;border-color:#7CFFB2;color:#7CFFB2}#karBox .ktb .kchb .kic{width:22px;height:22px}#karBox .ktb .kstg{flex:1}"
 +"#karBox .kpol2 .kbook{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,224,102,.55);background:linear-gradient(180deg,#4a1d6b,#2a0f3d);color:#ffe066;border-radius:6px 10px 10px 6px;box-shadow:inset 4px 0 0 #b0287a,0 2px 0 rgba(0,0,0,.5);padding:3px 10px 3px 6px;font-weight:900;font-size:12.5px;cursor:pointer;white-space:nowrap}#karBox .kpol2 .kbook img{width:26px;height:26px;display:block}"
 +"#karBox .kchh{display:flex;flex-direction:column;gap:9px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:12px}#karBox .kchn{display:flex;align-items:center;gap:10px;min-width:0}#karBox .kchn>.kic{width:48px;height:48px}#karBox .krlE{flex-direction:column;gap:8px}#karBox .krlh{display:block;width:min(240px,64%);height:auto;margin:0 auto;filter:drop-shadow(0 0 14px rgba(255,236,200,.35))}#karBox .krlT{width:min(200px,52%);margin:2px auto 8px}#karBox .kchn>.kic{width:64px;height:64px}#karBox .kchn>div{flex:1;min-width:0}#karBox .kchn b{display:block;font-size:17px;color:#ffe066}#karBox .kchn p{margin:2px 0 0;font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
 +"#karBox .kchm{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12.5px;color:#cfc6e8;font-variant-numeric:tabular-nums}#karBox .kchl{color:#7CFFB2;font-weight:800}#karBox .kchl.x{color:#ffb0b0}"
 +"#karBox .kchgo{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;padding:13px;background:#ffe066;color:#1a1300;font-size:17px;font-weight:900;cursor:pointer}#karBox .kchgo .kic{width:24px;height:24px}#karBox .kchiv{display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid rgba(255,255,255,.3);border-radius:12px;padding:9px;background:rgba(255,255,255,.06);color:#fff;font-size:14px;font-weight:800;cursor:pointer}"
 +"#karBox .kchd{margin-left:auto;font-size:11px;opacity:.7;font-weight:700;color:#cfc6e8}"
 +"#karBox .krow{position:relative}#karBox .krk{position:absolute;top:4px;left:4px;z-index:2;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;display:flex;align-items:center;justify-content:center;font:900 12px/1 system-ui,sans-serif;background:#ffe066;color:#1a1300;box-shadow:0 1px 3px rgba(0,0,0,.5)}#karBox .krk.r2{background:#d9dde6}#karBox .krk.r3{background:#e0a46a}#karBox .krk.s{background:#ff4fd8;color:#fff}#karBox.kgv .krow>.krk{display:flex!important}"
 +"#karBox .ktrn{display:flex;align-items:center;gap:7px;border-radius:12px;padding:8px 12px;background:rgba(124,255,178,.12);border:1px solid #1d6b43;cursor:pointer;min-width:0}#karBox .ktrn .kic{width:22px;height:22px}#karBox .ktrn b{color:#7CFFB2;font-size:14px;white-space:nowrap}#karBox .ktrn span{flex:1;min-width:0;font-size:12.5px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .ktrn.me{background:rgba(255,224,102,.16);border-color:#ffe066}#karBox .ktrn.me b{color:#ffe066}"
 +"#karBox .ksng{max-height:42vh;overflow:auto}#karBox .ksng button{color:#fff;font-size:13.5px;line-height:1.35}#karBox .kpm .ksr input{font-size:15px}"
 +"#karBox .kbk{display:flex;flex-direction:column;gap:12px;background:linear-gradient(90deg,#f6eedc 0,#fffaf0 18px,#fffaf0 calc(100% - 18px),#efe4cc 100%);color:#2b1d0e;border-radius:6px 14px 14px 6px;box-shadow:inset 6px 0 0 #b0287a,0 6px 22px rgba(0,0,0,.45);padding:16px 16px 18px 22px;min-height:52vh}"
 +"#karBox .kbkt{display:flex;align-items:center;gap:10px}#karBox .kbkt .kic{width:56px;height:56px}#karBox .kbkt b{font-size:21px;color:#7a1d55}#karBox .kbtoc{margin:0;font-size:13px;color:#8a6b44;letter-spacing:.12em}"
 +"#karBox .kbls{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}#karBox .kbls button{width:100%;display:flex;align-items:center;gap:10px;border:0;border-bottom:1px dashed #d8c7a6;background:none;color:#2b1d0e;padding:9px 2px;font-size:14.5px;font-weight:800;text-align:left;cursor:pointer}#karBox .kbls em{flex:0 0 auto;width:24px;font-style:normal;color:#b0287a;font-variant-numeric:tabular-nums;text-align:right}#karBox .kbls span{flex:1;min-width:0}"
 +"#karBox .kbsoon{flex:0 0 auto;margin-left:6px;font:800 10.5px/1.3 system-ui,sans-serif;color:#b0287a;border:1px solid #b0287a;border-radius:5px;padding:1px 5px;vertical-align:middle;white-space:nowrap}#karBox .kbsw{margin:0;font-size:11.5px;color:#8a6b44;text-align:center}"
 +"#karBox .kbno{font:800 12px/1 ui-monospace,Consolas,monospace;color:#8a6b44;text-align:right}#karBox .kbh{margin:0;font-size:19px;color:#7a1d55;line-height:1.35}#karBox .kbic{display:flex;gap:10px}#karBox .kbic .kic{width:46px;height:46px}"
 +"#karBox .kbp{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:14.5px;line-height:1.6}#karBox .kbui{background:#1d1830;border-radius:12px;padding:10px;color:#fff;pointer-events:none}#karBox .kbui .kpay{margin:0}#karBox .kbui .kchips{gap:4px}"
 +"#karBox .kbrec{display:inline-block;margin-right:8px;border-radius:999px;background:rgba(0,0,0,.6);color:#fff;font-weight:900;font-size:13px;padding:7px 12px;box-shadow:0 0 0 2px rgba(255,255,255,.5)}#karBox .kbrec::first-letter{color:#ff3b3b}#karBox .kbrec.x{background:#ff2b2b}#karBox .kbrec.x::first-letter{color:#fff}"
 +"#karBox .kbch{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:6px 2px;font-size:10.5px;font-weight:800;text-align:center}#karBox .kbch .kic{width:24px;height:24px}"
 +"#karBox .kbsh{display:flex;flex-wrap:wrap;gap:8px;background:#fff;color:#111}#karBox .kbsh svg{width:26px;height:26px}#karBox .kblaw{display:flex;flex-direction:column;gap:8px;pointer-events:auto;background:none;padding:0}#karBox .kblaw a{color:#7a1d55;font-weight:800;font-size:14px}"
 +"#karBox .kbnav{display:flex;gap:6px}#karBox .kbnav button{flex:1;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:10px 4px;font-weight:900;font-size:13.5px;cursor:pointer}#karBox .kbnav button:disabled{opacity:.35;cursor:default}"
 +"#karBox .kbinr{animation:kbinr .28s ease-out}#karBox .kbinl{animation:kbinl .28s ease-out}@keyframes kbinr{from{transform:translateX(30px) rotateY(-8deg);opacity:.3}to{transform:none;opacity:1}}@keyframes kbinl{from{transform:translateX(-30px) rotateY(8deg);opacity:.3}to{transform:none;opacity:1}}"
 +"#karBox .kvc{margin:8px 0 0;font-size:11px;color:#8f86a8;text-align:center}#karShr .shqr{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:#5b6474}#karShr .shqr>div{padding:8px;background:#fff;border:1px solid #e6e9ef;border-radius:10px}#karShr .shqr img,#karShr .shqr canvas{display:block;width:160px;height:160px}";
// 포인트 지갑 (10-31)
st.textContent+="#karBox .kwb{display:flex;flex-direction:column;align-items:center;gap:3px;background:#05140c;border:1px solid #1d6b43;border-radius:14px;padding:12px;color:#7CFFB2;text-align:center}#karBox .kwb small{font-size:12px;color:#9fe8bf}#karBox .kwb b{font:900 28px/1.1 ui-monospace,Consolas,monospace;text-shadow:0 0 8px #2bd97d}#karBox .kwb span{font-size:12.5px;color:#cfeedd}"
 +"#karBox .kwbt{display:flex;gap:8px}#karBox .kwbt>*{flex:1;min-width:0}#karBox .kpm .kwg2{background:#7CFFB2}#karBox .kwls{display:flex;flex-direction:column;gap:6px;max-height:34vh;overflow:auto}#karBox .kwls>div{display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;font-size:13.5px}#karBox .kwls span{display:block;min-width:0}#karBox .kwls small{display:block}#karBox .kwls small{font-size:11.5px;color:#cfc6e8}#karBox .kwls b{white-space:nowrap;font-variant-numeric:tabular-nums}#karBox .kwls .kwp{color:#7CFFB2}#karBox .kwls .kwm{color:#ffb4c8}"
 +"#karBox .kwtg{font-style:normal;font-size:10.5px;font-weight:900;color:#1a1300;background:#ffe066;border-radius:6px;padding:1px 5px;margin-left:4px}#karBox .kwpk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#karBox .kwpk button{display:flex;flex-direction:column;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px 4px;cursor:pointer}#karBox .kwpk button.on{border-color:#ffe066;background:rgba(255,224,102,.15)}#karBox .kwpk b{font-size:15px}#karBox .kwpk span{font-size:13px;color:#ffe066;font-weight:800}"
 +"#karBox .ktm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}#karBox .ktm button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:9px 2px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;line-height:1.25}#karBox .ktm button.on{border-color:#ffe066;background:rgba(255,224,102,.15);color:#ffe066}"
 +"#karBox .ktgst{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:9px 10px;font-size:12.5px;line-height:1.5;color:#e9defc}#karBox .ktgst button{margin-left:6px;border:0;border-radius:8px;padding:4px 10px;background:#ffe066;color:#1a1300;font-weight:900;cursor:pointer;font-family:inherit}"
 +"#karBox .ktsr .krow{display:flex;justify-content:space-between;gap:10px;font-size:14px}#karBox .ktsr .krow b{text-align:right;overflow-wrap:anywhere}#karBox .ktsr .kwait{background:rgba(255,224,102,.12);border:1px solid #b08900;border-radius:10px;padding:10px;font-size:13px;line-height:1.5}"
 +"div[id^=__tosspayments_]{z-index:2147483600!important}"
 +"#karBox .kwuse{font:900 19px/1.35 system-ui,sans-serif;text-align:center;background:#05140c;border:1px solid #1d6b43;color:#7CFFB2;border-radius:12px;padding:12px}#karBox .kwuse.kwno{color:#ffb4c8;border-color:#7a2a3a;background:#1a070c}#karBox .kpm.kptq{z-index:7}#karBox .kwtst{border-style:dashed!important;border-color:#ffe066!important;color:#ffe066!important}#karBox .kwac{margin-top:-4px}#karBox .kwlow{align-self:flex-end;border:0;background:none;color:#ffe066;font-weight:800;font-size:13px;text-decoration:underline;cursor:pointer;padding:0}#karBox .kwsoon{font-size:12.5px;line-height:1.5;background:rgba(255,224,102,.12);border-color:#8a7420;color:#ffe9a6}#karBox .kwbt .krf{padding:9px 4px;font-size:13px}#karBox .kwbt .krf:disabled{opacity:.4;cursor:default}#karBox .kwcap{text-align:center}";
// 우리끼리 방 머리 (사장님 10-31) — 집 아이콘 + 방 이름은 한 줄 전체(길면 줄바꿈, 말줄임 없음) · 「N명」「릴레이」「⋯」은 그 아래 줄 오른쪽
st.textContent+="#karBox .krmh{flex-wrap:wrap;row-gap:8px}#karBox .krmh .krmt{flex:1 1 100%}#karBox .krmh .krmt b{white-space:normal;overflow:visible;text-overflow:clip;word-break:keep-all;overflow-wrap:anywhere;line-height:1.3}#karBox .krmh .krmt+.krmc{margin-left:auto}";
document.head.appendChild(st);
var K={code:"",tab:"kpop",items:[],idx:-1,pl:null,q:""};
function ytApi(cb){ if(window.YT&&YT.Player) return cb(); var prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=function(){ try{ prev&&prev(); }catch(e){} cb(); };
  if(!document.getElementById("ytApiJs")){ var s=document.createElement("script"); s.id="ytApiJs"; s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }
function box(){ return document.getElementById("karBox"); }
// 영상 화면 높이 = 아래 곡 목록이 딱 4곡 보이게 남은 자리를 모두 영상에 (사장님 10-30) — 곡 줄 높이를 실제로 재서 맞춘다
function fitPl(){ var b=box(); if(!b||b.classList.contains("krecm")) return; var pl=b.querySelector(".kpl"), ls=b.querySelector(".kls"); if(!pl||!ls) return;
  var it=ls.querySelector(".kit"), rh=it?Math.min(90,Math.max(40,it.offsetHeight)):52, want=rh*4+12;
  var h=pl.offsetHeight+(ls.clientHeight-want); h=Math.max(200,Math.min(h,window.innerHeight*0.72)); pl.style.height=Math.round(h)+"px"; }
window.addEventListener("resize",function(){ clearTimeout(fitPl._t); fitPl._t=setTimeout(fitPl,150); });
// 노래방 화면 두 손가락 확대 → 확대된 뒤엔 한 손가락으로 이리저리 이동 (투어앱 지도와 같은 방식, 사장님 10-31)
//  브라우저 자체 확대는 막고(#karBox touch-action) 노래방 화면(.kin)을 우리가 키운다 · 1배로 줄이면 원래대로 · 녹화 중·스테이지 화면에선 안 함
var KZ={s:1,x:0,y:0,g:null};
function kzKin(){ var b=box(); if(!b) return null; var pg=b.querySelectorAll(".kpg"); return pg.length?pg[pg.length-1]:b.querySelector(".kin"); }   // 맨 위 스테이지 화면이 있으면 그것을, 없으면 노래방 화면을 (10-31 스테이지에서도)
function kzSync(){ var k=kzKin(); if(KZ.el&&KZ.el!==k){ try{ KZ.el.style.transform=""; KZ.el.style.touchAction=""; [].forEach.call(KZ.el.querySelectorAll(".kpgb"),function(x){ x.style.touchAction=""; }); }catch(e){} KZ.s=1; KZ.x=0; KZ.y=0; } KZ.el=k; return k; }
function kzLock(on){ var b=box(); if(!b) return; b.style.touchAction=on?"none":""; if(KZ.el){ KZ.el.style.touchAction=on?"none":""; [].forEach.call(KZ.el.querySelectorAll(".kpgb"),function(x){ x.style.touchAction=on?"none":""; }); } [].forEach.call(b.querySelectorAll(".kpl iframe"),function(f){ f.style.pointerEvents=on?"none":""; }); }   // 확대 중엔 유튜브 화면이 손가락을 가져가지 않게 + 브라우저 스크롤이 끼어들지 않게 (사장님 10-31 「확대 후 이동이 안 된다」)
function kzApply(){ var k=kzKin(); if(!k) return; if(KZ.s<=1.02){ KZ.s=1; KZ.x=0; KZ.y=0; k.style.transform=""; kzLock(false); return; } kzLock(true);
  var W=k.offsetWidth, H=k.offsetHeight; KZ.x=Math.min(0,Math.max(W-W*KZ.s,KZ.x)); KZ.y=Math.min(0,Math.max(H-H*KZ.s,KZ.y));
  k.style.transformOrigin="0 0"; k.style.transform="translate("+KZ.x+"px,"+KZ.y+"px) scale("+KZ.s+")"; }
function kzReset(){ KZ.s=1; KZ.g=null; kzApply(); }
function kzOk(e){ var b=box(); return b&&b.contains(e.target)&&!b.classList.contains("krecm")&&!b.querySelector(".kpm")&&!(e.target.closest&&e.target.closest("[data-pz]")); }
document.addEventListener("touchstart",function(e){ if(!kzOk(e)){ KZ.g=null; return; } var k=kzSync(); if(!k) return; var r=k.getBoundingClientRect(), L0=r.left-KZ.x, T0=r.top-KZ.y;
  if(e.touches.length===2){ var a=e.touches[0], c=e.touches[1]; KZ.g={p:1,d:Math.hypot(a.clientX-c.clientX,a.clientY-c.clientY)||1,s:KZ.s,u:((a.clientX+c.clientX)/2-L0-KZ.x)/KZ.s,v:((a.clientY+c.clientY)/2-T0-KZ.y)/KZ.s,L0:L0,T0:T0}; }
  else if(e.touches.length===1&&KZ.s>1){ KZ.g={m:1,px:e.touches[0].clientX,py:e.touches[0].clientY,x:KZ.x,y:KZ.y}; } else KZ.g=null; },{passive:true});
document.addEventListener("touchmove",function(e){ var g=KZ.g; if(!g) return;
  if(g.p&&e.touches.length===2){ var a=e.touches[0], c=e.touches[1], d=Math.hypot(a.clientX-c.clientX,a.clientY-c.clientY)||1, ns=Math.min(3,Math.max(1,g.s*d/g.d));
    KZ.s=ns; KZ.x=(a.clientX+c.clientX)/2-g.L0-ns*g.u; KZ.y=(a.clientY+c.clientY)/2-g.T0-ns*g.v; kzApply(); e.preventDefault(); }
  else if(g.m&&e.touches.length===1&&KZ.s>1){ KZ.x=g.x+(e.touches[0].clientX-g.px); KZ.y=g.y+(e.touches[0].clientY-g.py); kzApply(); e.preventDefault(); } },{passive:false});
document.addEventListener("touchend",function(e){ if(!e.touches.length) KZ.g=null; else if(e.touches.length===1&&KZ.s>1){ KZ.g={m:1,px:e.touches[0].clientX,py:e.touches[0].clientY,x:KZ.x,y:KZ.y}; } },{passive:true});
function paintList(){ var b=box(); if(!b) return; var el=b.querySelector(".kls");
  if(K.items===null){ el.innerHTML='<div class="kst">'+esc(L(TX.ld))+'</div>'+bizHtml(); return; }
  if(!K.items.length){ el.innerHTML='<div class="kst">'+esc(L(TX.no))+'</div>'+bizHtml(); return; }
  el.innerHTML=K.items.map(function(x,i){ return '<div class="kit'+(i===K.idx?' on':'')+'" data-i="'+i+'"><img src="'+(CH[x.ch]||CH.ky).i+'" alt=""><span>'+esc(x.t)+'</span><i>'+(x.e===0?'<b class="kyt">▶ '+esc(L(TX.ytt))+'</b> ':'')+esc(x.ln||"")+'</i></div>'; }).join("")+bizHtml();   // 맨 아래 사업자 정보 (10-30)
  [].forEach.call(el.querySelectorAll(".kit"),function(d){ d.onclick=function(){ play(+d.dataset.i); }; }); setTimeout(fitPl,30); }
function load(){ K.items=null; paintList(); var u=HUB+"/kara?"+(K.q?"q="+encodeURIComponent(K.q):"tab="+K.tab);
  fetch(u).then(function(r){ return r.json(); }).then(function(j){ K.items=(j&&j.ok&&j.items)||[]; K.idx=-1; paintList(); }).catch(function(){ K.items=[]; paintList(); }); }
function ov(html,t){ var b=box(); if(!b) return; var pl=b.querySelector(".kpl"), o=pl.querySelector(".kov"); if(!html){ if(o&&(!t||o.dataset.t===t)) o.remove(); return; } if(!o){ o=document.createElement("div"); o.className="kov"; pl.appendChild(o); } o.dataset.t=t||""; o.innerHTML=html; }
function blocked(x){ try{ K.pl&&K.pl.pauseVideo&&K.pl.pauseVideo(); }catch(e){}
  ov('<div>'+esc(L(TX.yt))+'</div><a href="https://www.youtube.com/watch?v='+encodeURIComponent(x.id)+'" target="_blank" rel="noopener" data-kyt="1">▶ '+esc(L(TX.ytb))+'</a>');
  var a=box()&&box().querySelector("[data-kyt]"); if(a) a.addEventListener("click",function(){ mpPaid.out(); klYt(x); }); }
function play(i){ var x=K.items&&K.items[i]; if(!x) return; klEnd(); K.cur=x; K.idx=i; paintList(); var b=box(); if(!b) return; var pl=b.querySelector(".kpl");
  try{ ntap("kara_"+K.code,"tap"); }catch(e){}
  try{ kPassUse(); }catch(e){}   // 이용권 기간이면 사용 표시 (10-31) — 노래 차감은 없음
  var m0=pl.querySelector(".kmsg"); if(m0) m0.remove();
  if(x.e===0){ blocked(x); return; }   // 퍼가기 막힌 곡 — 앱 안에서 안 틀고 유튜브로 (허브가 oEmbed 로 미리 확인)
  ov('<div>'+esc(L(TX.lo))+'</div>',"lo"); K.want=x.id;
  ytApi(function(){ if(!box()) return;
    if(K.pl){ if(K.ready) K.pl.loadVideoById(x.id); return; }   // 플레이어는 하나만 — 곡마다 새로 만들지 않는다
    var d=document.createElement("div"); d.id="karYt"; pl.insertBefore(d,pl.firstChild);
    K.pl=new YT.Player("karYt",{videoId:x.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:function(){ K.ready=true; if(K.want&&K.pl.getVideoData&&K.pl.getVideoData().video_id!==K.want) K.pl.loadVideoById(K.want); },
      onError:function(){ var c=K.items&&K.items[K.idx]; if(c){ c.e=0; paintList(); blocked(c); } },   // 미리 못 잡은 막힌 곡도 그 자리에서 안내 (다음 곡으로 안 넘김)
      onStateChange:function(ev){ if(ev&&ev.data===1){ ov("","lo"); ov("","up"); } if(ev&&ev.data===0) ov('<div>'+esc(L(TX.upQ))+'</div><button type="button" class="kupb" data-kup="1">'+esc(L(TX.up))+'</button>',"up"); try{ klState(ev&&ev.data); }catch(e){} } }}); }); }
function open(code){ K.tab=({ja:"jpop",en:"pop",es:"pop"})[window.LANG]||"kpop";   // 첫 목록 = 언어별 (한·중 K-POP, 일 J-POP, 영·서 팝)
 try{ if(PG.length) pgTo(0); }catch(e){} var D=window.GU&&GU.d, o=D&&D.kara&&D.kara[code]; K.code=code; K.q=""; K.idx=-1; K.pl=null; K.ready=false; K.want=""; var old=box(); if(old) old.remove();
  var gn=o&&window.LP?LP(o.n):(o?o.g:""), b=document.createElement("div"); b.id="karBox";
  b.innerHTML='<div class="kin"><div class="khd"><div><b>'+esc(L(TX.t))+(gn?' · '+esc(gn):'')+'</b><small>'+esc(L(TX.s))+'</small></div><button type="button" class="kx">✕ '+esc(L(TX.x))+'</button></div>'
    // 채널 단추 줄은 뺐다 (사장님 10-30 「삭제」)
    +'<div class="kpl"><button type="button" class="krec">'+esc(L(TX.rec))+'</button><div class="kmsg">🎤 '+esc(L(TX.pick))+'</div></div>'
    +'<div class="kpay"><div class="kr"><button type="button" class="kbook kbk2" data-kbook="1" aria-label="'+esc(L(TX.bkB))+'" title="'+esc(L(TX.bkB))+'">'+kIc("book")+'</button></div><button type="button" class="kl" id="karLeft">'+esc(L(TX.lgin))+'</button><button type="button" class="kslot" data-kpay="1" aria-label="PAYMENT"><i></i><span>PAYMENT</span><small>'+esc(L(TX.slot))+'</small></button></div>'
    +'<div class="kpol2"><button type="button" class="kntl" data-kntc="1">'+esc(L(TX.ntc))+'</button></div>'   // 「곡 이용권 사기」 단추는 뺐다 — PAYMENT 와 같은 창 (사장님 10-30 「삭제」)
    +'<div class="ktb"><button type="button" class="kstg">'+esc(L(TX.stgB))+'</button><button type="button" class="kchb">'+kIc("chal")+'<span>'+esc(L(TX.chB))+'</span></button><button type="button" class="kdorb"><img src="img/kara/dor.png" alt=""><span>'+esc(L(TX.dorB))+'</span></button><button type="button" class="knrb">'+kIc("fol")+'<span>'+esc(L(NT.nrB))+'</span></button></div>'
    +'<form class="ksr"><input type="search" placeholder="'+esc(L(TX.q))+'"><button type="submit">'+esc(L(TX.go))+'</button></form>'
    +'<div class="kls"></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".kx").onclick=close;
  [].forEach.call(b.querySelectorAll("[data-kpay]"),function(x){ x.onclick=function(){ payOpen(""); }; /* PAYMENT = 이용권 구매 창 (1·3·6·12개월, 포인트로 「구매」 · 10-31) · 충전은 내 지갑에만 */ });
  b.querySelector("[data-kntc]").onclick=ntcOpen;
  b.querySelector(".kstg").onclick=function(){ stageOpen("all"); };
  b.querySelector(".kchb").onclick=function(){ kChal(); };   // 챌린지 (10-31)
  b.querySelector(".kdorb").onclick=function(){ dorOpen(""); };   // 도란도란 (10-31 밤)
  b.querySelector(".knrb").onclick=function(){ nrOpen(); }; nrPoll();   // 주변 노래 친구 (10-31) — 받은 초대 배지
  b.querySelector("[data-kbook]").onclick=kBook;   // 이용 안내 책자 (10-31)
  kChGet();
  b.querySelector(".krec").onclick=function(){   // 녹화 = 누구나 (10-31 출시판) — 올리기만 로그인
    if(b.classList.contains("krecm")){ recStop(); return; } kzReset(); b.classList.add("krecm"); this.textContent=L(TX.recX); recStart(); };   // 녹화 = 노래방 영상 화면만 테두리째 화면 가득 (사장님 10-30)
  b.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-kup]")){ e.preventDefault(); e.stopPropagation(); upStart(); } });   // 내 노래 올리기 (10-30)
  b.querySelector("#karLeft").onclick=function(){ if(kptOn()) kwOpen(""); else signIn(); };   // 포인트 켜지면 「내 지갑」 (10-31) — 계정 창은 지갑 안 「계정」   // 초록 칸 = 로그인 전엔 로그인 창, 로그인 뒤엔 계정 창(로그아웃) (사장님 10-30)
  [].forEach.call(b.querySelectorAll("[data-kch]"),function(a){ a.addEventListener("click",function(){ mpPaid.out(); }); });
  [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(t){ t.onclick=function(){ K.tab=t.dataset.t; K.q=""; b.querySelector(".ksr input").value=""; [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(x){ x.classList.toggle("on",x===t); }); load(); }; });
  b.querySelector(".ksr").onsubmit=function(e){ e.preventDefault(); K.q=String(b.querySelector(".ksr input").value||"").trim(); [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(x){ x.classList.toggle("on",!K.q&&x.dataset.t===K.tab); }); load(); };
  mpPaid.start("kara_"+code); load(); barPaint(); karcLoad();
  if(KPTQ&&!kApp()){ KPTQ=false; setTimeout(function(){ if(box()&&!box().querySelector(".kwal")) kwOpen("chg"); },500); } }   // 심사용 ?paytest=1 (10-31)
// ── 곡 이용권 판매 (사장님 10-30 「카드사 심사에 보여 줄 판매 화면」) — 노래방 안에서: 묶음 고르기 → 확인·구매자 정보 → 토스 시험 결제창 → 결제 완료
//   가격표 = 허브 GET/POST /shop/karc (관리자 「상품 관리」에서 고침, 서버 주문 금액도 같은 값). 허브가 안 되면 아래 기본값(허브 KARC_DEF 와 같게)
//   주문 = 허브 POST /shop/order {pid:"karc", k, sess, test:true} → 시험 주문·텔레그램 「[시험 주문] 노래방 곡 이용권 n곡」 · 곡 수는 안 쌓음
//   🔴 결제 붙일 때: test:true → false + 허브 승인 경로(worker.js shopRoute 주석)에서 "kc:<uid>" 에 곡 수 적립
var KB={packs:[{n:1,b:0,p:1000},{n:3,b:1,p:3000},{n:5,b:2,p:5000},{n:10,b:5,p:10000}],left:0,sess:-1,k:1,cn:"",cp:"",ce:"",redraw:null};
var TCK="test_ck_5OWRapdA8dzyq72vW4gRVo1zEqZK", TSDK="https://js.tosspayments.com/v2/standard", KPK="mpv_karpay";   // 시험 키 = shop.js·tosspay.js 와 같음 (_secrets\toss_test_ck.txt)
function sess(){ try{ return localStorage.getItem("mpv_pg_sess")||""; }catch(e){ return ""; } }
// 로그인 여부 = pg.js 가 허브 세션을 두는 자리(mpv_pg_sess) — pg.js 는 안 건드리고 읽기만. 허브가 세션이 풀렸다고 하면(sess:0) 로그인 안 된 것으로
function karSigned(){ return !!sess()&&KB.sess!==0; }
// 남은 곡 수 — 허브(계정별, 진짜 결제만 쌓임). 지금은 시험이라 늘 0
function karLeft(){
  // 사장님 미리보기 전용: 주소에 ?kartest=1 이거나 localStorage mpv_kartest=1 이면 5곡으로 보여 환불 단추를 볼 수 있게 한다
  try{ if(/[?&]kartest=1(&|$)/.test(location.search)||localStorage.getItem("mpv_kartest")==="1") return 5; }catch(e){}
  return KB.left||0; }
function karcLoad(){ if(sess()) kptLoad();   // 포인트 지갑 (10-31)
  var s=sess(), u=HUB+"/shop/karc", o=s?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sess:s})}:{};
  return fetch(u,o).then(function(r){ return r.json(); }).then(function(j){ if(!(j&&j.ok)) return;
    if(Array.isArray(j.packs)&&j.packs.length) KB.packs=j.packs; KB.sess=s?(j.sess?1:0):-1; KB.left=+j.left||0; barPaint(); if(KB.redraw) KB.redraw(); }).catch(function(){}); }
function won(v){ return "₩"+Math.round(v).toLocaleString("ko-KR"); }
function tf(t,o){ return String(t).replace(/\{(\w+)\}/g,function(m,k){ return o[k]!=null?o[k]:m; }); }
function fmtN(t,n){ return tf(t,{n:n}); }
function songsTx(n){ return tf(L(n===1?TX.sN1:TX.sN),{n:n}); }
function pkName(x){ return x.b?x.n+"+"+x.b:songsTx(x.n); }   // 3+1 · 1곡
function perSong(x){ var v=x.p/(x.n+x.b); return (v%1?"≈":"")+won(v); }
function bizHtml(){ var z=TX.bz[window.LANG]||TX.bz.en, lg=TX.bz[window.LANG]?window.LANG:"en";
  return '<div class="kbz"><b>'+esc(z[0])+'</b><br><span class="nw">'+esc(z[1])+'</span> · <span class="nw">'+esc(z[2])+' '+esc(z[3])+'</span><br>'+esc(z[4])+' <span class="nw">297-81-03712</span><br>'+esc(z[5])+': '+esc(z[6])+'<br>'+esc(z[7])+': '+esc(z[8])+'<br>'+esc(z[9])+': admin@moneypuzzle.co.kr'+'<br>'+esc(L({ko:"전화",en:"Tel",ja:"電話",zhs:"电话",zht:"電話",es:"Tel."}))+': <span class="nw">010-4221-7066</span><br>'+esc(L(TX.bzh))+': GitHub, Inc. · Cloudflare, Inc.<br>'+esc(L(TX.bzn))
    +'<div class="kbzl"><a href="terms.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+'</a> · <a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+'</a> · <a href="privacy.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.pL))+'</a>'+(window.KAR_SITE?' · <a href="legal.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.gL))+'</a>':'')+'</div>'+(window.KAR_VC?'<p class="kvc">'+esc(window.KAR_VC())+'</p>':'')+'</div>'; }   // 노래방 사이트 방문자 수 (site.js, 10-31)
// 노래방 화면의 곡 이용권 칸 (남은 곡 표시)
function barPaint(){ var b=box(), el=b&&b.querySelector("#karLeft"); if(!el) return; el.textContent=karSigned()?(kptOn()?kBarTx():(karLeft()>0?fmtN(L(TX.lftN),karLeft()):L(TX.kwT))):L(TX.lgin); }   // (10-31) 「이용권 ~11.30 · 12,000P」 · 이용권 없으면 「잔여 곡 3 · 12,000P」(잔여 곡 있을 때만) · 「12,000P」
// 로그인 창(pg.js)을 노래방 위에 띄운다 — 닫히면 원래 높이로 돌리고 결제 창을 다시 그린다(로그인하면 남은 곡 표시)
function signIn(){ if(!window.mpPG||!mpPG.open) return; mpPG.open(); var p=document.getElementById("pgBox"); if(!p) return; p.style.zIndex="2147483006";
  if(!p._karMo&&window.MutationObserver){ p._karMo=new MutationObserver(function(){ if(!p.hidden) return; p.style.zIndex=""; KB.sess=-1; karcLoad(); var b=box(); if(b&&b.querySelector(".kpm:not(.kntc)")) payOpen(KB.k_go?"co":""); }); p._karMo.observe(p,{attributes:true,attributeFilter:["hidden"]}); } }
function tsdk(){ return new Promise(function(ok,no){ if(window.TossPayments) return ok(); var s=document.createElement("script"); s.src=TSDK; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function ss(k,v){ try{ if(v===undefined) return JSON.parse(sessionStorage.getItem(k)||"null"); if(v===null) sessionStorage.removeItem(k); else sessionStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
// mode: "" 묶음 고르기 · "co" 확인·결제 · "paid" 결제 완료(res) · "rq" 환불 요청 확인 · "done" 환불 요청 접수
function payOpen(mode0,res){ var b=box(); if(!b) return; var o=b.querySelector(".kpm:not(.kntc)"); if(o) o.remove(); var mode=typeof mode0==="string"?mode0:"", agd=false;
  o=document.createElement("div"); o.className="kpm kbuy"; b.appendChild(o);
  if(!mode){ try{ ntap("kara_pay","open"); }catch(e){} }
  var ut='';
  var cur={msg:"",busy:0};
  var draw=function(msg,busy){ cur={msg:msg||"",busy:busy||0}; var sg=karSigned(), left=karLeft(), P=KB.packs, x=P[KB.k]||P[0];
    if(mode==="co") mode="";   // 돈 결제 창은 닫음 (10-31) — 로그인 뒤·토스 돌아옴도 묶음 창으로
    KB.k_go=mode==="co";
    if(mode==="rq"){   // 환불 요청 확인 — 노래방 안에서
      o.innerHTML='<div><h3>'+esc(L(TX.rfh))+'</h3><p class="kq">'+esc(fmtN(L(TX.rfq),left))+'</p><button type="button" class="kgo" data-rfo="1">'+esc(L(TX.rfo))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
      o.querySelector("[data-rfo]").onclick=function(){ try{ ntap("kara_pay","refund_req"); }catch(e){}
        // 허브 POST /shop/karefund {sess,left,l} → 노래방 관리자 「환불 도구」 목록에 한 줄 (10-30). 카드 취소는 관리자가 처리 — 지금은 결제 연결 전이라 기록만
        try{ fetch(HUB+"/shop/karefund",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sess:sess(),left:left,l:window.LANG||"en"})}).catch(function(){}); }catch(e){}
        mode="done"; draw(); };
      o.querySelector(".kc").onclick=function(){ mode=""; draw(); }; return; }
    if(mode==="done"){
      o.innerHTML='<div><h3>'+esc(L(TX.rfh))+'</h3><p class="kq">'+esc(L(TX.rfd))+'</p><button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
      o.querySelector(".kc").onclick=function(){ mode=""; draw(); }; return; }
    if(mode==="paid"){   // 결제 완료 (토스 결제창에서 돌아옴)
      var px=res.pk||x;
      o.innerHTML='<div><h3>'+esc(L(TX.pdT))+ut+'</h3>'
        +'<div class="krow"><span>'+esc(L(TX.sel))+'</span><b>'+esc(L(TX.kb))+' '+esc(pkName(px))+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.rcv))+'</span><b>'+esc(songsTx(px.n+px.b))+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.oid))+'</span><b>'+esc(res.oid)+'</b></div>'
        +'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(res.amount)+'</span></div>'
        +'<button type="button" class="kgo kcl">'+esc(L(TX.ok))+'</button>'+'</div>';
      o.querySelector(".kcl").onclick=function(){ o.remove(); KB.redraw=null; }; return; }
    if(mode==="co"){   // 확인·구매자 정보·결제 수단·동의 → 결제하기
      if(!sg){ mode=""; draw(L(TX.sgn)); return; }
      o.innerHTML='<div><h3>'+esc(L(TX.kb))+' · '+esc(L(TX.pay))+ut+'</h3>'
        +'<div class="krow"><span>'+esc(L(TX.sel))+'</span><b>'+esc(pkName(x))+(x.b?' <em class="ksv">'+esc(tf(L(TX.svc),{b:x.b}))+'</em>':'')+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.rcv))+'</span><b>'+esc(songsTx(x.n+x.b))+' · '+esc(tf(L(TX.per),{w:perSong(x)}))+'</b></div>'
        +(kptOn()?'<div class="kt"><span>'+esc(L(TX.kwUseAmt))+'</span><span>'+ptS(x.n*((KP.d.use&&KP.d.use.song)||1000))+'</span></div>'+(KP.d.bal.total<x.n*((KP.d.use&&KP.d.use.song)||1000)?'<button type="button" class="kwlow" data-kwlow="1">'+esc(L(TX.kwLow))+' ›</button>':''):'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(x.p)+'</span></div>')
        +'<p class="km">'+esc(L(TX.keep))+'</p>'
        +'<b class="kh">'+esc(L(TX.cu))+'</b>'
        +'<label class="kfl">'+esc(L(TX.cn))+'<input type="text" id="kbN" maxlength="40" autocomplete="name" value="'+esc(KB.cn)+'"></label>'
        +'<label class="kfl">'+esc(L(TX.cp))+'<input type="tel" id="kbP" maxlength="30" autocomplete="tel" value="'+esc(KB.cp)+'"></label>'
        +'<label class="kfl">'+esc(L(TX.ce))+'<input type="email" id="kbE" maxlength="100" autocomplete="email" value="'+esc(KB.ce)+'"></label>'
        +'<p class="km">'+esc(L(TX.cpn))+'</p>'
        +'<b class="kh">'+esc(L(TX.pm))+'</b><label class="kfr"><input type="radio" checked> '+esc(L(TX.card))+'</label>'
        +'<label class="kfr"><input type="checkbox" id="kbAg"> '+esc(L(TX.agr))+'</label>'
        +'<div class="klk"><a href="terms.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+' ›</a> <a href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div>'
        +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
        +'<button type="button" class="kgo" id="kbGo" disabled>'+(busy?esc(L(busy===2?TX.opn:TX.sav)):won(x.p)+' '+esc(L(TX.pay)))+'</button>'
        +'<button type="button" class="kc" id="kbX">'+esc(L(TX.back))+'</button>'+'</div>';
      ["kbN","kbP","kbE"].forEach(function(id,i){ var el=o.querySelector("#"+id); el.oninput=function(){ KB[["cn","cp","ce"][i]]=el.value; }; });
      var ag=o.querySelector("#kbAg"), go=o.querySelector("#kbGo");
      if(busy){ ag.checked=true; ag.disabled=true; } else { ag.checked=agd; go.disabled=!agd; ag.onchange=function(){ agd=ag.checked; go.disabled=!agd; }; }
      o.querySelector("#kbX").onclick=function(){ if(busy) return; mode=""; draw(); };
      go.onclick=function(){ if(busy) return; var nm=KB.cn.trim(), ph=KB.cp.trim(), em=KB.ce.trim();
        if(!nm){ draw(L(TX.enm)); return; }
        if(!/^[\d\s+()-]{7,30}$/.test(ph)){ draw(L(TX.eph)); return; }
        if(!/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(em)){ draw(L(TX.eem)); return; }
        draw("",1); var k=KB.k;
        fetch(HUB+"/shop/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pid:"karc",k:k,sess:sess(),pname:L(TX.kb)+" "+pkName(x),lang:window.LANG||"en",name:nm,email:em,phone:ph,consent:true,test:true})})
         .then(function(r){ return r.json(); }).then(function(j){
           if(!(j&&j.ok&&j.orderId&&j.amount)){ var e=j&&j.err; if(e==="sess"){ KB.sess=0; barPaint(); } draw(e==="sess"?L(TX.esess):e==="name"?L(TX.enm):e==="email"?L(TX.eem):e==="phone"?L(TX.eph):L(TX.efail)); return; }
           try{ ntap("kara_pay","order_"+(x.n+x.b)); }catch(z){}
           draw("",2);
           ss(KPK,{oid:j.orderId,amount:j.amount,k:k,pk:{n:x.n,b:x.b,p:x.p},code:K.code,cn:nm,cp:ph,ce:em,at:Date.now()});   // 돌아왔을 때 화면을 다시 그리려고 이 탭에만 잠깐
           var base=location.origin+location.pathname, mob=ph.replace(/\D/g,"");
           var req={method:"CARD",amount:{currency:"KRW",value:j.amount},orderId:j.orderId,orderName:String(j.orderName||"Karaoke song pass").slice(0,100),
             successUrl:base+"?karres=ok",failUrl:base+"?karres=fail",customerName:nm.slice(0,40),customerEmail:em};
           if(/^01\d{8,9}$/.test(mob)) req.customerMobilePhone=mob;   // 토스는 한국 휴대폰 숫자만 받는다
           req.card={flowMode:"DEFAULT",useEscrow:false,useCardPoint:false,useAppCardOnly:false};
           return tsdk().then(function(){ return window.TossPayments(TCK).payment({customerKey:window.TossPayments.ANONYMOUS}).requestPayment(req); })
             .catch(function(e){ window.__karTossErr=String((e&&e.code||"")+" "+(e&&e.message||e)); ss(KPK,null); draw((e&&e.code==="USER_CANCEL")?L(TX.pfT):((e&&e.message)||L(TX.pfT))); }); })
         .catch(function(){ draw(L(TX.efail)); }); };
      return; }
    // 이용권 고르기 (사장님 10-31 「곡당 판매 → 기간 이용권」) — 누구나 볼 수 있음 · 사려면 로그인 · 포인트로 「구매」 → 「7,000P 사용 → N P 남음」 확인
    var PP=kPassP(), q0=PP[KP.pk]||PP[0], on=kptOn(), bal=on?KP.d.bal.total:0, ps=(on&&KP.d.pass)||{};
    o.innerHTML='<div><h3>'+esc(L(TX.kb))+'</h3>'
    +(sg?'<div class="klf">'+esc(on?kBarTx():(left>0?fmtN(L(TX.lftN),left):L(TX.kwT)))+'</div>':'<div class="ksg">'+esc(L(TX.sgi))+'<button type="button" class="ksgb">'+esc(L(TX.sgb))+'</button></div>')
    +'<div class="kpks">'+PP.map(function(q,i){ return '<button type="button" data-pk="'+i+'" class="kpk'+(i===KP.pk?" on":"")+'"><b>'+esc(kMon(q.m))+'</b>'
      +(q.m>1?'<em class="ksv">'+esc(tf(L(TX.psPer),{w:ptS(Math.round(q.p/q.m/10)*10)}))+'</em>':'<em class="ksv ksv0">&nbsp;</em>')
      +'<span class="kpp1">'+ptS(q.p)+'</span><small>'+esc(L(TX.psUnl))+'</small></button>'; }).join("")+'</div>'
    +'<p class="km">'+esc(L(TX.psNo))+(ps.on?'<br>'+esc(tf(L(TX.psExt),{d:kMd(ps.end,1)})):'')+'</p>'
    +'<div class="kt"><span>'+esc(L(TX.kwUseAmt))+'</span><span>'+ptS(q0.p)+'</span></div>'+(on&&bal<q0.p?'<button type="button" class="kwlow" data-kwlow="1">'+esc(L(TX.kwLow))+' ›</button>':'')
    +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
    +'<button type="button" class="kgo" id="kbNx">'+esc(L(TX.kwBuyB))+'</button>'
    +(on?'<button type="button" class="krf" data-kwc="1">'+esc(L(TX.kwT))+' · '+ptS(bal)+'</button>':'')
    +(on&&ps.on?'<button type="button" class="krf" data-psrf="1">'+esc(L(TX.psRf))+'</button>':'')
    +(sg&&left>=1?'<button type="button" class="krf krfs">'+esc(fmtN(L(TX.rfb),left))+'</button>':'')   // 이전에 산 잔여 곡 환불 (그대로)
    +'<button type="button" class="kpp" data-kntc="1">'+esc(L(TX.ntcP))+'</button>'+'<button type="button" class="kc">'+esc(L(TX.ok))+'</button>'+'</div>';
    [].forEach.call(o.querySelectorAll("[data-pk]"),function(y){ y.onclick=function(){ KP.pk=+y.dataset.pk; draw(); }; });
    o.querySelector("#kbNx").onclick=function(){ if(!karSigned()){ draw(L(TX.sgn)); signIn(); return; } if(kptOn()){ kPassBuy(KP.pk); return; } kptLoad().then(function(){ if(kptOn()) kPassBuy(KP.pk); else draw(L(TX.efail)); }); };
    var sb=o.querySelector(".ksgb"); if(sb) sb.onclick=signIn; var kw=o.querySelector("[data-kwc]"); if(kw) kw.onclick=function(){ kwOpen(""); }; var kl=o.querySelector("[data-kwlow]"); if(kl) kl.onclick=function(){ kwOpen("chg"); };
    var pr=o.querySelector("[data-psrf]"); if(pr) pr.onclick=kPassRf;
    var rb=o.querySelector(".krfs"); if(rb) rb.onclick=function(){ mode="rq"; draw(); };
    o.querySelector(".kpp").onclick=ntcOpen;
    o.querySelector(".kc").onclick=function(){ o.remove(); KB.redraw=null; }; };
  KB.redraw=function(){ if(o.isConnected&&!cur.busy) draw(cur.msg); };   // 언어 바꿈·가격표 받아 옴 → 다시 그림 (결제창 여는 중엔 안 건드림)
  draw(res&&res.err?res.err:""); if(!mode||mode==="co") karcLoad(); }
// 토스 결제창에서 돌아옴 (?karres=ok&paymentKey&orderId&amount · ?karres=fail&code&message) — 주문번호·금액이 맞을 때만 완료 화면, 아니면 결제 확인 화면으로
function karReturn(){ var sp=new URLSearchParams(location.search), r=sp.get("karres"); if(!r) return;
  try{ var keep=location.search.slice(1).split("&").filter(function(x){ return !/^(karres|paymentKey|orderId|amount|paymentType|code|message)=/.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(keep?"?"+keep:"")+location.hash); }catch(e){}
  var v=ss(KPK); if(!v||!v.oid) return;
  var oid=sp.get("orderId")||"", amt=Math.round(Number(sp.get("amount")||0)), ok=r==="ok"&&oid===v.oid&&amt===v.amount;
  if(ok) ss(KPK,null);
  KB.cn=v.cn||""; KB.cp=v.cp||""; KB.ce=v.ce||""; if(typeof v.k==="number") KB.k=v.k;
  open(v.code||"");
  if(ok) payOpen("paid",{oid:v.oid,amount:v.amount,pk:v.pk});
  else payOpen("co",{err:L(TX.pfT)+(r!=="ok"&&sp.get("message")?" ("+sp.get("message")+")":"")});
  try{ ntap("kara_pay",ok?"paid_test":"payfail"); }catch(e){} window.__karResult=ok?"ok":"fail"; }
if(/[?&]karres=/.test(location.search)){ var _kr=function(){ setTimeout(function(){ try{ karReturn(); }catch(e){ window.__karRetErr=String(e); } },700); }; if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",_kr); else _kr(); }
// ── 포인트 지갑 (사장님 10-31 「자 만들어봐」) — 1원 = 1P · 로그인 계정마다 허브에 지갑 하나(웹·앱 같은 지갑) · 허브 POST /shop/kpt/{me,charge,use,refund}
//   켜짐 = 로그인하고 허브가 지갑을 돌려줄 때 (10-31 출시판 — 누구나)
//   초록 칸 「잔여 곡 3 · 12,000P」 → 누르면 「내 지갑」(잔여·유료/무료·유효기간·충전·사용 내역·환불 요청) · 돈 드는 일은 늘 「3,000P 사용 → 9,000P 남음」 확인 뒤
//   충전: 웹 = 웹 가격(KG이니시스) / 앱(Capacitor) = 앱 가격만(구글 플레이 결제) — 앱에는 웹 가격을 절대 보이지 않는다
//   (10-31 출시판) 「결제」 단추 하나 — 허브 d.live 에 진짜 결제 길(inicis·gplay)이 있으면 그 길, 없으면 같은 단추가 조용히 시험 충전(덩어리 test:1, 「시험」 표시만)
var KP={on:0,d:null,redraw:null,k:1,pk:0};   // pk = 고른 이용권 (기본 1개월)   // k = 고른 충전 묶음 (기본 10,000P)
function ptPer(q){ var v=q.n*((KP.d&&KP.d.use&&KP.d.use.song)||1000)/(q.n+q.b); return (v%1?"≈":"")+ptS(v); }   // 곡당 P
function wonL(v){ return window.LANG==="ko"?Math.round(v).toLocaleString("ko-KR")+"원":won(v); }   // 결제 단추 — 한국어는 「10,000원」
Object.assign(TX,{
 kwPayB:{ko:"결제",en:"Pay",ja:"決済",zhs:"支付",zht:"支付",es:"Pagar"},
 kwBuyB:{ko:"구매",en:"Buy",ja:"購入",zhs:"购买",zht:"購買",es:"Comprar"},
 kwBuyPt:{ko:"이용권 구매",en:"Buy a pass",ja:"利用券を購入",zhs:"购买畅唱券",zht:"購買暢唱券",es:"Comprar bono"},
 psM:{ko:"{n}개월",en:"{n} months",ja:"{n}か月",zhs:"{n}个月",zht:"{n}個月",es:"{n} meses"},
 psM1:{ko:"{n}개월",en:"{n} month",ja:"{n}か月",zhs:"{n}个月",zht:"{n}個月",es:"{n} mes"},
 psUnl:{ko:"기간 안에는 노래 무제한",en:"Unlimited singing",ja:"期間中は歌い放題",zhs:"有效期内无限畅唱",zht:"有效期內無限暢唱",es:"Canta sin límite"},
 psPer:{ko:"월 {w}",en:"{w}/month",ja:"月 {w}",zhs:"每月 {w}",zht:"每月 {w}",es:"{w}/mes"},
 psNo:{ko:"포인트로 구매 · 자동 연장 없음",en:"Bought with points · no auto-renewal",ja:"ポイントで購入・自動更新なし",zhs:"用积分购买 · 不自动续费",zht:"用點數購買 · 不自動續費",es:"Con puntos · sin renovación automática"},
 psExt:{ko:"이용 중 — 지금 끝나는 날({d})부터 이어집니다",en:"Active — adds on from the current end date ({d})",ja:"利用中 — 今の終了日（{d}）から続きます",zhs:"使用中 — 从当前到期日（{d}）起接续",zht:"使用中 — 從目前到期日（{d}）起接續",es:"Activo — se suma desde la fecha de fin actual ({d})"},
 psEnd:{ko:"이용권 ~{d}",en:"Pass ~{d}",ja:"利用券 ~{d}",zhs:"畅唱券 ~{d}",zht:"暢唱券 ~{d}",es:"Bono ~{d}"},
 kwSongN:{ko:"잔여 곡 {n}",en:"Songs {n}",ja:"残り曲 {n}",zhs:"剩余歌曲 {n}",zht:"剩餘歌曲 {n}",es:"Canciones {n}"},
 psRf:{ko:"이용권 환불",en:"Pass refund",ja:"利用券の返金",zhs:"畅唱券退款",zht:"暢唱券退款",es:"Reembolso del bono"},
 psRfB:{ko:"환불",en:"Refund",ja:"返金",zhs:"退款",zht:"退款",es:"Reembolsar"},
 psRfN:{ko:"구매일로부터 7일 이내이고 노래를 부르지 않았으면 유료 포인트 몫 전액, 그 밖에는 남은 일수 금액에서 10%를 공제한 금액을 결제한 수단으로 환불합니다. 무료 포인트로 산 몫은 환불하지 않습니다. 환불을 요청하면 이용권은 바로 끝납니다.",en:"Within 7 days of purchase and if you have not sung, the full paid-point share; otherwise the amount for the remaining days minus 10%, refunded to your payment method. The share bought with free points is not refunded. The pass ends as soon as you request the refund.",ja:"購入日から7日以内でまだ歌っていなければ有料ポイント分を全額、それ以外は残り日数分の金額から10%を差し引いた金額を、決済した手段で返金します。無料ポイントで購入した分は返金しません。返金を申請すると利用券はすぐに終了します。",zhs:"购买之日起7天内且未唱歌的全额退还付费积分部分，其他情况退还剩余天数金额扣除10%后的金额，退回原支付方式。用免费积分购买的部分不予退款。申请退款后畅唱券立即结束。",zht:"購買之日起7天內且未唱歌者全額退還付費點數部分，其他情況退還剩餘天數金額扣除10%後的金額，退回原付款方式。以免費點數購買的部分不予退款。申請退款後暢唱券立即結束。",es:"En los 7 días siguientes a la compra y si no has cantado, toda la parte pagada con puntos de pago; si no, el importe de los días restantes menos un 10%, devuelto a tu método de pago. La parte comprada con puntos gratuitos no se reembolsa. El bono termina en cuanto pides el reembolso."},
 psRfFull:{ko:"7일 이내 · 미사용 · 전액",en:"Within 7 days · unused · full",ja:"7日以内・未使用・全額",zhs:"7天内 · 未使用 · 全额",zht:"7天內 · 未使用 · 全額",es:"En 7 días · sin usar · completo"},
 psRfPro:{ko:"잔여 {n}일 − 10%",en:"{n} days left − 10%",ja:"残り{n}日 − 10%",zhs:"剩余{n}天 − 10%",zht:"剩餘{n}天 − 10%",es:"{n} días restantes − 10%"},
 psRfOk:{ko:"환불 요청이 접수되었습니다. 확인 후 결제한 수단으로 {w}을 환불해 드립니다.",en:"Your refund request was received. After review, {w} will be refunded to your payment method.",ja:"返金申請を受け付けました。確認後、決済した手段で{w}を返金します。",zhs:"已收到退款申请。确认后将 {w} 退回原支付方式。",zht:"已收到退款申請。確認後將 {w} 退回原付款方式。",es:"Recibimos tu solicitud. Tras revisarla, reembolsaremos {w} a tu método de pago."},
 psRfAmt:{ko:"환불 예정 금액 {w} (영업일 기준 처리)",en:"Estimated refund {w} (processed on business days)",ja:"返金予定額 {w}（営業日に処理）",zhs:"预计退款金额 {w}（按工作日处理）",zht:"預計退款金額 {w}（依工作天處理）",es:"Reembolso estimado {w} (se tramita en días hábiles)"},
 psRfFx:{ko:"무료 {n} 몫 제외",en:"{n} free-point share excluded",ja:"無料 {n} 分は対象外",zhs:"免费 {n} 部分除外",zht:"免費 {n} 部分除外",es:"excluida la parte de {n} gratis"},
 psRfNo:{ko:"환불할 이용권이 없습니다.",en:"No pass to refund.",ja:"返金できる利用券がありません。",zhs:"没有可退款的畅唱券。",zht:"沒有可退款的暢唱券。",es:"No hay ningún bono que reembolsar."},
 kwUseAmt:{ko:"사용 포인트",en:"Points to use",ja:"使用ポイント",zhs:"使用积分",zht:"使用點數",es:"Puntos a usar"},
 kwLow:{ko:"포인트 부족 → 충전",en:"Not enough points → Top up",ja:"ポイント不足 → チャージ",zhs:"积分不足 → 充值",zht:"點數不足 → 儲值",es:"Puntos insuficientes → Recargar"},
 kwBar:{ko:"잔여 곡 {n} · {p}",en:"Songs {n} · {p}",ja:"残り曲 {n} · {p}",zhs:"剩余歌曲 {n} · {p}",zht:"剩餘歌曲 {n} · {p}",es:"Canciones {n} · {p}"},
 kwT:{ko:"내 지갑",en:"My wallet",ja:"マイウォレット",zhs:"我的钱包",zht:"我的錢包",es:"Mi monedero"},
 kwBal:{ko:"잔여 포인트",en:"Points balance",ja:"残りポイント",zhs:"剩余积分",zht:"剩餘點數",es:"Saldo de puntos"},
 kwPaid:{ko:"유료",en:"Paid",ja:"有料",zhs:"付费",zht:"付費",es:"De pago"},
 kwFree:{ko:"무료",en:"Free",ja:"無料",zhs:"免费",zht:"免費",es:"Gratis"},
 kwChg:{ko:"충전",en:"Top up",ja:"チャージ",zhs:"充值",zht:"儲值",es:"Recargar"},
 kwBuy:{ko:"이용권 구매",en:"Buy a pass",ja:"利用券を購入",zhs:"购买畅唱券",zht:"購買暢唱券",es:"Comprar bono"},
 kwHist:{ko:"사용 내역",en:"History",ja:"利用履歴",zhs:"使用记录",zht:"使用記錄",es:"Historial"},
 kwRf:{ko:"환불 요청",en:"Request refund",ja:"返金申請",zhs:"申请退款",zht:"申請退款",es:"Solicitar reembolso"},
 kwAcct:{ko:"계정",en:"Account",ja:"アカウント",zhs:"账户",zht:"帳戶",es:"Cuenta"},
 kwLots:{ko:"보유 포인트 · 유효기간",en:"Your points · expiry",ja:"保有ポイント・有効期限",zhs:"持有积分 · 有效期",zht:"持有點數 · 有效期",es:"Tus puntos · caducidad"},
 kwUntil:{ko:"{d}까지",en:"until {d}",ja:"{d}まで",zhs:"至 {d}",zht:"至 {d}",es:"hasta {d}"},
 kwExpd:{ko:"기간 만료",en:"Expired",ja:"期限切れ",zhs:"已过期",zht:"已過期",es:"Caducado"},
 kwFrz:{ko:"환불 요청 중",en:"Refund requested",ja:"返金申請中",zhs:"退款申请中",zht:"退款申請中",es:"Reembolso solicitado"},
 kwRule:{ko:"1P = 1원 · 유료 포인트부터 사용 · 유효기간은 구매일부터 1년(기간 안 요청 시 3개월씩, 충전일부터 5년까지 연장)",en:"1P = ₩1 · paid points are used first · valid for 1 year from purchase (extendable 3 months at a time on request, up to 5 years from top-up)",ja:"1P＝1ウォン・有料ポイントから使用・有効期限は購入日から1年（期間内の申請で3か月ずつ、チャージ日から5年まで延長）",zhs:"1P = 1韩元 · 先使用付费积分 · 有效期为购买日起1年（期内申请每次延长3个月，最长至充值日起5年）",zht:"1P = 1韓元 · 先使用付費點數 · 有效期為購買日起1年（期內申請每次延長3個月，最長至儲值日起5年）",es:"1P = ₩1 · primero se usan los puntos de pago · válidos 1 año desde la compra (ampliables de 3 en 3 meses a petición, hasta 5 años desde la recarga)"},
 kwChgT:{ko:"포인트 충전",en:"Top up points",ja:"ポイントをチャージ",zhs:"积分充值",zht:"點數儲值",es:"Recargar puntos"},
 kwBon:{ko:"+ 무료 {b}",en:"+ {b} free",ja:"＋無料 {b}",zhs:"+ 免费 {b}",zht:"+ 免費 {b}",es:"+ {b} gratis"},
 kwCard:{ko:"카드 결제",en:"Pay by card",ja:"カード決済",zhs:"刷卡支付",zht:"刷卡付款",es:"Pagar con tarjeta"},
 kwPgN:{ko:"결제를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",en:"The payment could not be completed. Please try again shortly.",ja:"決済を完了できませんでした。しばらくしてからもう一度お試しください。",zhs:"未能完成支付，请稍后再试。",zht:"未能完成付款，請稍後再試。",es:"No se pudo completar el pago. Inténtalo de nuevo en un momento."},
 kwGp:{ko:"Google Play로 구매",en:"Buy with Google Play",ja:"Google Playで購入",zhs:"通过 Google Play 购买",zht:"透過 Google Play 購買",es:"Comprar con Google Play"},
 kwGpN:{ko:"스토어에서 구매한 포인트의 환불은 스토어 환불 규정을 따릅니다.",en:"Refunds for points bought in the store follow the store's refund policy.",ja:"ストアで購入したポイントの返金はストアの返金規定に従います。",zhs:"在应用商店购买的积分，退款按商店退款规定办理。",zht:"在應用商店購買的點數，退款依商店退款規定辦理。",es:"Los reembolsos de puntos comprados en la tienda siguen la política de la tienda."},
 kwGpX:{ko:"구매를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",en:"The purchase could not be verified. Please try again shortly.",ja:"購入を確認できませんでした。しばらくしてからもう一度お試しください。",zhs:"未能确认购买，请稍后再试。",zht:"未能確認購買，請稍後再試。",es:"No se pudo verificar la compra. Inténtalo de nuevo en un momento."},
 kwUse:{ko:"{c} 사용 → {r} 남음",en:"Use {c} → {r} left",ja:"{c} 使用 → 残り {r}",zhs:"使用 {c} → 剩余 {r}",zht:"使用 {c} → 剩餘 {r}",es:"Usar {c} → quedan {r}"},
 kwShort:{ko:"포인트가 부족합니다 (잔여 {h})",en:"Not enough points ({h} left)",ja:"ポイントが足りません（残り {h}）",zhs:"积分不足（剩余 {h}）",zht:"點數不足（剩餘 {h}）",es:"Puntos insuficientes (quedan {h})"},
 kwOk:{ko:"확인",en:"OK",ja:"確認",zhs:"确认",zht:"確認",es:"Aceptar"},
 kwDone:{ko:"완료되었습니다.",en:"Done.",ja:"完了しました。",zhs:"已完成。",zht:"已完成。",es:"Listo."},
 kwRfN:{ko:"구매일로부터 7일 이내에는 미사용 유료 포인트를 수수료 없이 전부 환불합니다(일부를 사용했어도). 7일이 지나면 잔여 유료 포인트에서 10% 이내의 수수료(현재 {f}%)를 제외하고 환불합니다. 다만 잔여 유료 포인트가 10,000P 이하인 경우에는 수수료 대신 1,000원을 공제하며, 공제 후 금액이 공제액보다 적으면 환불되지 않습니다. 유효기간이 지난 뒤에도 충전일부터 5년까지 잔여 유료 포인트의 90%를 환불받을 수 있습니다. 무료 포인트는 환불되지 않으며 환불 처리 시 소멸합니다. 앱 스토어에서 구매한 포인트는 스토어 환불 규정을 따릅니다.",en:"Within 7 days of purchase, unused paid points are refunded in full with no fee (even if you used some). After 7 days, remaining paid points are refunded minus a fee of up to 10% (currently {f}%); if the remaining paid points are 10,000P or less, ₩1,000 is deducted instead, and if the amount after the deduction is less than the deduction, there is no refund. Even after expiry, you can get 90% of the remaining paid points refunded until 5 years from the top-up date. Free points are not refunded and expire when a refund is processed. Points bought in an app store follow the store's refund policy.",ja:"購入日から7日以内は、未使用の有料ポイントを手数料なしで全額返金します（一部を使っていても）。7日を過ぎると、残りの有料ポイントから10%以内の手数料（現在{f}%）を差し引いて返金します。ただし残りの有料ポイントが10,000P以下の場合は手数料の代わりに1,000ウォンを差し引き、差し引き後の金額が差引額より少ない場合は返金されません。有効期限が過ぎた後も、チャージ日から5年まで残りの有料ポイントの90%を返金できます。無料ポイントは返金されず、返金処理時に消滅します。アプリストアで購入したポイントはストアの返金規定に従います。",zhs:"购买之日起7日内，未使用的付费积分免手续费全额退还（即使已使用部分）。超过7日后，从剩余付费积分中扣除不超过10%的手续费（目前为{f}%）后退还；剩余付费积分在10,000P以下时，改为扣除1,000韩元，扣除后金额少于扣除额的，不予退款。有效期过后，自充值日起5年内仍可退还剩余付费积分的90%。免费积分不予退款，并在退款处理时失效。在应用商店购买的积分按商店退款规定办理。",zht:"購買之日起7日內，未使用的付費點數免手續費全額退還（即使已使用部分）。超過7日後，從剩餘付費點數中扣除不超過10%的手續費（目前為{f}%）後退還；剩餘付費點數在10,000P以下時，改為扣除1,000韓元，扣除後金額少於扣除額者，不予退款。有效期過後，自儲值日起5年內仍可退還剩餘付費點數的90%。免費點數不予退款，並在退款處理時失效。在應用商店購買的點數依商店退款規定辦理。",es:"En los 7 días siguientes a la compra, los puntos de pago no usados se reembolsan íntegros sin comisión (aunque hayas usado parte). Pasados 7 días, se reembolsan los puntos de pago restantes menos una comisión de hasta el 10% (ahora {f}%); si los puntos de pago restantes son 10.000P o menos, se descuentan ₩1.000 en su lugar y, si lo que queda es menor que el descuento, no hay reembolso. Incluso tras caducar, puedes recuperar el 90% de los puntos de pago restantes hasta 5 años desde la recarga. Los puntos gratis no se reembolsan y caducan al procesar el reembolso. Los puntos comprados en una tienda de apps siguen la política de la tienda."},
 kwRfAmt:{ko:"환불 예정 금액",en:"Estimated refund",ja:"返金予定額",zhs:"预计退款金额",zht:"預計退款金額",es:"Reembolso estimado"},
 kwRfFull:{ko:"7일 이내 · 수수료 없음",en:"Within 7 days · no fee",ja:"7日以内・手数料なし",zhs:"7日内 · 免手续费",zht:"7日內 · 免手續費",es:"En 7 días · sin comisión"},
 kwRfFee:{ko:"잔여 {l} − 수수료 {f}%",en:"{l} left − {f}% fee",ja:"残り {l} − 手数料 {f}%",zhs:"剩余 {l} − 手续费 {f}%",zht:"剩餘 {l} − 手續費 {f}%",es:"{l} restantes − {f}% comisión"},
 kwRfGone:{ko:"무료 {n} 소멸 예정",en:"{n} free points will expire",ja:"無料 {n} 消滅予定",zhs:"免费 {n} 将失效",zht:"免費 {n} 將失效",es:"Caducarán {n} gratis"},
 kwRfOk:{ko:"환불 요청이 접수되었습니다. 확인 후 결제한 수단으로 환불해 드립니다.",en:"Your refund request was received. We will refund it to your payment method after review.",ja:"返金申請を受け付けました。確認後、決済した手段で返金します。",zhs:"已收到退款申请。确认后将退回原支付方式。",zht:"已收到退款申請。確認後將退回原付款方式。",es:"Recibimos tu solicitud. Tras revisarla, reembolsaremos al medio de pago."},
 kwRfNo:{ko:"환불 가능한 포인트가 없습니다.",en:"No points can be refunded.",ja:"返金できるポイントがありません。",zhs:"没有可退款的积分。",zht:"沒有可退款的點數。",es:"No hay puntos reembolsables."},
 kwRfPd:{ko:"처리 중인 환불 요청이 있습니다.",en:"A refund request is already in progress.",ja:"処理中の返金申請があります。",zhs:"已有正在处理的退款申请。",zht:"已有正在處理的退款申請。",es:"Ya hay una solicitud de reembolso en curso."},
 kwNone:{ko:"내역이 없습니다.",en:"No history yet.",ja:"履歴はありません。",zhs:"暂无记录。",zht:"暫無記錄。",es:"Aún no hay historial."},
 kwRfFix:{ko:"잔여 {l} − 정액 {x}",en:"{l} left − fixed {x}",ja:"残り {l} − 定額 {x}",zhs:"剩余 {l} − 定额 {x}",zht:"剩餘 {l} − 定額 {x}",es:"{l} restantes − fijo {x}"},
 kwRfExp:{ko:"기간 만료 · 잔여 {l}의 90%",en:"Expired · 90% of {l}",ja:"期限切れ・残り {l} の90%",zhs:"已过期 · 剩余 {l} 的90%",zht:"已過期 · 剩餘 {l} 的90%",es:"Caducado · 90% de {l}"},
 kwExt:{ko:"기간 연장",en:"Extend",ja:"期間延長",zhs:"延长有效期",zht:"延長有效期",es:"Ampliar"},
 kwExtQ:{ko:"사용 가능한 유료 포인트의 유효기간을 3개월 연장합니다. 충전일로부터 5년을 넘을 수 없습니다.",en:"Extend the validity of your usable paid points by 3 months. It cannot go beyond 5 years from the top-up date.",ja:"使用可能な有料ポイントの有効期限を3か月延長します。チャージ日から5年を超えることはできません。",zhs:"将可用付费积分的有效期延长3个月，最长不超过充值日起5年。",zht:"將可用付費點數的有效期延長3個月，最長不超過儲值日起5年。",es:"Amplía 3 meses la validez de tus puntos de pago disponibles, sin superar 5 años desde la recarga."},
 kwExtOk:{ko:"유효기간을 3개월 연장했습니다.",en:"Extended by 3 months.",ja:"有効期限を3か月延長しました。",zhs:"已延长3个月。",zht:"已延長3個月。",es:"Ampliado 3 meses."},
 kwExtCap:{ko:"충전일로부터 5년까지 연장되어 더 연장할 수 없습니다.",en:"Already extended to 5 years from top-up; no further extension.",ja:"チャージ日から5年まで延長済みのため、これ以上延長できません。",zhs:"已延长至充值日起5年，无法再延长。",zht:"已延長至儲值日起5年，無法再延長。",es:"Ya ampliado hasta 5 años desde la recarga; no se puede ampliar más."},
 kwExtNo:{ko:"연장할 수 있는 유료 포인트가 없습니다.",en:"No paid points can be extended.",ja:"延長できる有料ポイントがありません。",zhs:"没有可延长的付费积分。",zht:"沒有可延長的付費點數。",es:"No hay puntos de pago que ampliar."},
 kwSoon:{ko:"{p}가 {d}에 만료됩니다. 만료 전 「기간 연장」으로 3개월 연장할 수 있고, 만료 뒤에도 충전일부터 5년까지 잔여 유료 포인트의 90%를 환불 요청할 수 있습니다.",en:"{p} expire on {d}. Before then you can extend by 3 months; after expiry you can still request 90% of the remaining paid points back until 5 years from the top-up date.",ja:"{p}が{d}に期限切れになります。期限前は「期間延長」で3か月延長でき、期限後もチャージ日から5年まで残りの有料ポイントの90%を返金申請できます。",zhs:"{p}将于{d}到期。到期前可「延长有效期」3个月；到期后自充值日起5年内仍可申请退还剩余付费积分的90%。",zht:"{p}將於{d}到期。到期前可「延長有效期」3個月；到期後自儲值日起5年內仍可申請退還剩餘付費點數的90%。",es:"{p} caducan el {d}. Antes puedes ampliarlos 3 meses; después aún puedes pedir el 90% de los puntos de pago restantes hasta 5 años desde la recarga."},
 kwSoonC:{ko:"{p}가 {d}에 만료됩니다. 충전일로부터 5년까지 연장되어 더 연장할 수 없으며, 만료 뒤에는 환불 기간도 끝납니다. 필요하면 만료 전에 사용하거나 환불을 요청해 주세요.",en:"{p} expire on {d}. They have reached the 5-year limit from top-up, so they cannot be extended and the refund window ends at expiry. Please use them or request a refund before then.",ja:"{p}が{d}に期限切れになります。チャージ日から5年まで延長済みのためこれ以上延長できず、期限後は返金期間も終わります。必要なら期限前に使うか返金を申請してください。",zhs:"{p}将于{d}到期。已延长至充值日起5年，无法再延长，到期后退款期限也随之结束。如有需要，请在到期前使用或申请退款。",zht:"{p}將於{d}到期。已延長至儲值日起5年，無法再延長，到期後退款期限也隨之結束。如有需要，請在到期前使用或申請退款。",es:"{p} caducan el {d}. Han llegado al límite de 5 años desde la recarga: no se pueden ampliar y el plazo de reembolso termina al caducar. Úsalos o pide el reembolso antes."},
 kwR5:{ko:"{d}까지 90% 환불 가능",en:"90% refundable until {d}",ja:"{d}まで90%返金可",zhs:"{d}前可退90%",zht:"{d}前可退90%",es:"90% reembolsable hasta {d}"},
 kwPtBuy:{ko:"{c}로 구매",en:"Buy with {c}",ja:"{c}で購入",zhs:"用 {c} 购买",zht:"用 {c} 購買",es:"Comprar con {c}"},
 kwH:{ko:"충전|무료 지급|사용|사용 취소|환불 요청|환불|환불 거절|스토어 환불|기간 연장|이용권 구매|이용권 환불",en:"Top-up|Free points|Used|Use cancelled|Refund requested|Refunded|Refund declined|Store refund|Extended|Pass bought|Pass refunded",ja:"チャージ|無料付与|使用|使用取消|返金申請|返金|返金却下|ストア返金|期間延長|利用券購入|利用券返金",zhs:"充值|免费赠送|使用|取消使用|申请退款|退款|拒绝退款|商店退款|延长有效期|购买畅唱券|畅唱券退款",zht:"儲值|免費贈送|使用|取消使用|申請退款|退款|拒絕退款|商店退款|延長有效期|購買暢唱券|暢唱券退款",es:"Recarga|Puntos gratis|Uso|Uso cancelado|Reembolso solicitado|Reembolsado|Reembolso rechazado|Reembolso de tienda|Ampliado|Bono comprado|Bono reembolsado"},
 kwW:{ko:"곡 이용권|상황 사진|AI 영상|도란도란|도란도란 연장|우리끼리 노래 방|방 꾸미기",en:"Song pass|AI photo|AI video|Doran-doran|Doran-doran extension|Just Us Karaoke room|Room decor",ja:"曲チケット|シーン写真|AI動画|ドランドラン|ドランドラン延長|仲間だけカラオケ|ルームデコ",zhs:"点歌券|情景照片|AI视频|Doran-doran|Doran-doran 延长|小圈子K歌房|房间装扮",zht:"點歌券|情境照片|AI影片|Doran-doran|Doran-doran 延長|小圈子K歌房|房間裝扮",es:"Bono de canciones|Foto IA|Video IA|Doran-doran|Ampliación Doran-doran|Sala Solo nosotros Karaoke|Decorar la sala"}
});
// ── 웹 포인트 충전 = 토스페이먼츠 결제창 (10-31 토스 PG 재심사) — 웹만 · 앱은 구글 플레이 그대로
//   내 지갑 → 충전: 묶음 · 결제 수단(카드·토스페이·카카오페이·네이버페이·계좌이체·휴대폰) · 「50,000원 결제」 → 토스 결제창(API 개별 연동 키 TCK, requestPayment)
//   로그인 = 허브 /shop/kpt/toss/order 가 주문번호·금액(서버 값)을 준다 → 돌아오면(?kptres=ok) /shop/kpt/toss/confirm → 충전 결과 화면
//   비로그인(?paytest=1 심사용 등) = 같은 충전 화면·결제창을 볼 수 있다. 주문번호는 앞단에서(SG…) · 돌아오면 「결제 승인 대기(시험 키)」 — 포인트 없음
//   시크릿 키(허브 TOSS_SECRET_KEY) 넣기 전 = 허브가 승인 못 함 → 시험 충전 스위치가 켜져 있으면 시험 포인트(test:1), 꺼져 있으면 「결제 승인 대기(시험 키)」
//   🔴 승인 뒤: TCK 를 live_ck_… 로 바꾸고 허브에 TOSS_SECRET_KEY (live_sk_…)
Object.assign(TX,{
 tsCard:{ko:"신용·체크카드",en:"Credit/debit card",ja:"クレジット・デビットカード",zhs:"信用卡·借记卡",zht:"信用卡·簽帳金融卡",es:"Tarjeta de crédito/débito"},
 tsToss:{ko:"토스페이",en:"Toss Pay",ja:"Toss Pay",zhs:"Toss Pay",zht:"Toss Pay",es:"Toss Pay"},
 tsKakao:{ko:"카카오페이",en:"Kakao Pay",ja:"Kakao Pay",zhs:"Kakao Pay",zht:"Kakao Pay",es:"Kakao Pay"},
 tsNaver:{ko:"네이버페이",en:"Naver Pay",ja:"Naver Pay",zhs:"Naver Pay",zht:"Naver Pay",es:"Naver Pay"},
 tsTr:{ko:"계좌이체",en:"Bank transfer",ja:"口座振替",zhs:"账户转账",zht:"帳戶轉帳",es:"Transferencia bancaria"},
 tsPh:{ko:"휴대폰",en:"Mobile phone",ja:"携帯電話",zhs:"手机支付",zht:"手機付款",es:"Teléfono móvil"},
 tsAgr:{ko:"결제를 누르면 주문 내용과 이용약관·환불 규정을 확인하고 결제에 동의한 것으로 봅니다.",en:"By tapping Pay, you confirm the order and agree to the Terms and Refund Policy.",ja:"「決済」を押すと、注文内容と利用規約・返金規定を確認し、決済に同意したものとみなします。",zhs:"点击「支付」即表示您已确认订单内容及使用条款·退款规定，并同意付款。",zht:"點擊「支付」即表示您已確認訂單內容及使用條款·退款規定，並同意付款。",es:"Al pulsar Pagar, confirmas el pedido y aceptas los Términos y la Política de reembolso."},
 tsPay:{ko:"결제",en:"Pay",ja:"決済",zhs:"支付",zht:"支付",es:"Pagar"},
 tsGst:{ko:"로그인하지 않아도 충전 화면과 결제창을 볼 수 있습니다. 포인트는 로그인한 계정에만 충전됩니다.",en:"You can view the top-up screen and payment window without signing in. Points are only added to a signed-in account.",ja:"ログインしなくてもチャージ画面と決済画面を見られます。ポイントはログインしたアカウントにのみチャージされます。",zhs:"无需登录也可查看充值页面和支付窗口。积分只会充值到已登录的账户。",zht:"無需登入也可查看儲值頁面和付款視窗。點數只會儲值到已登入的帳戶。",es:"Puedes ver la recarga y la ventana de pago sin iniciar sesión. Los puntos solo se añaden a una cuenta con sesión iniciada."},
 tsChk:{ko:"결제를 확인하고 있습니다…",en:"Confirming your payment…",ja:"決済を確認しています…",zhs:"正在确认付款…",zht:"正在確認付款…",es:"Confirmando el pago…"},
 tsOkT:{ko:"결제 완료",en:"Payment complete",ja:"決済完了",zhs:"支付完成",zht:"付款完成",es:"Pago completado"},
 tsOkD:{ko:"{p}가 충전되었습니다.",en:"{p} has been added.",ja:"{p}をチャージしました。",zhs:"已充值 {p}。",zht:"已儲值 {p}。",es:"Se han añadido {p}."},
 tsTstD:{ko:"시험 결제입니다 — 실제 청구는 없으며 시험 포인트로 충전되었습니다.",en:"Test payment — no real charge; test points were added.",ja:"テスト決済です — 実際の請求はなく、テストポイントがチャージされました。",zhs:"测试支付 — 不会实际扣款，已充值测试积分。",zht:"測試付款 — 不會實際扣款，已儲值測試點數。",es:"Pago de prueba: sin cargo real; se añadieron puntos de prueba."},
 tsWtT:{ko:"결제 승인 대기(시험 키)",en:"Awaiting approval (test key)",ja:"決済承認待ち（テストキー）",zhs:"等待支付批准（测试密钥）",zht:"等待付款核准（測試金鑰）",es:"Pendiente de aprobación (clave de prueba)"},
 tsWtD:{ko:"시험 결제창에서 돌아왔습니다. 정식 승인 전이라 실제 청구는 없고 포인트도 충전되지 않았습니다.",en:"You are back from the test payment window. It is not approved yet, so there is no charge and no points were added.",ja:"テスト決済画面から戻りました。正式承認前のため、請求はなく、ポイントもチャージされていません。",zhs:"已从测试支付窗口返回。尚未正式批准，因此不会扣款，也未充值积分。",zht:"已從測試付款視窗返回。尚未正式核准，因此不會扣款，也未儲值點數。",es:"Has vuelto de la ventana de pago de prueba. Aún no está aprobado: no hay cargo ni se añadieron puntos."},
 tsFlT:{ko:"결제가 완료되지 않았습니다",en:"Payment not completed",ja:"決済が完了しませんでした",zhs:"支付未完成",zht:"付款未完成",es:"El pago no se completó"},
 tsFlD:{ko:"결제가 취소되었거나 승인되지 않았습니다. 청구된 금액은 없습니다.",en:"The payment was cancelled or not approved. You have not been charged.",ja:"決済がキャンセルされたか、承認されませんでした。請求は発生していません。",zhs:"支付已取消或未获批准，未产生任何扣款。",zht:"付款已取消或未獲核准，未產生任何扣款。",es:"El pago se canceló o no se aprobó. No se te ha cobrado."},
 tsPt:{ko:"충전 포인트",en:"Top-up points",ja:"チャージポイント",zhs:"充值积分",zht:"儲值點數",es:"Puntos de recarga"},
 tsRe:{ko:"다시 결제",en:"Try again",ja:"もう一度決済",zhs:"重新支付",zht:"重新付款",es:"Intentar de nuevo"}
});
var KTK="mpv_kptpay", KTM=[["card","tsCard"],["tosspay","tsToss"],["kakaopay","tsKakao"],["naverpay","tsNaver"],["transfer","tsTr"],["phone","tsPh"]];
var KPTQ=/[?&]paytest=1(?![0-9a-z])/i.test(location.search);   // 심사용 주소 ?paytest=1 — 노래방이 열리면 바로 「내 지갑 → 충전」 (로그인 없이도)
if(KPTQ){ try{ var _pq=location.search.slice(1).split("&").filter(function(x){ return !/^paytest=/i.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(_pq?"?"+_pq:"")+location.hash); }catch(e){} }
// 로그인 전 충전 화면용 묶음표 (허브 KPT_PT·KPT_WEB 과 같은 값)
function kGuestD(){ return {guest:1,packs:{pt:[50000,100000,150000,200000],web:[50000,100000,150000,200000],app:[60000,120000,180000,240000],gp:[]},bonus:[0,0,0,0],bal:{total:0,paid:0,free:0},live:{},hist:[],lots:[]}; }
// 충전 화면의 결제 수단 · 동의 안내 · 결제 단추 (웹)
function kTossUi(amt,busy,guest){ var m=KP.tm||"card", lg=esc(window.LANG||"en");
  return '<b class="kh">'+esc(L(TX.pm))+'</b><div class="ktm">'+KTM.map(function(x){ return '<button type="button" data-tm="'+x[0]+'"'+(x[0]===m?' class="on"':'')+'>'+esc(L(TX[x[1]]))+'</button>'; }).join("")+'</div>'
    +'<p class="km">'+esc(L(TX.tsAgr))+'</p><div class="klk"><a href="terms.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+' ›</a> <a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div>'
    +(guest?'<div class="ktgst">'+esc(L(TX.tsGst))+'<button type="button" data-tlg="1">'+esc(L(TX.sgb))+'</button></div>':'')
    +'<button type="button" class="kgo" data-pg="1"'+(busy?' disabled':'')+'>'+esc(busy?L(TX.opn):tf(L(TX.tsPay),{w:wonL(amt)}))+'</button>'; }
// 토스 결제창 열기 — 돌려주는 값: null(결제창으로 감) · 문자열(화면에 보일 오류)
function kTossGo(k){ var m=KP.tm||"card", guest=!kptOn(), base=location.origin+location.pathname, G=kGuestD();
  var od=guest?Promise.resolve({ok:true,orderId:"SG"+kYmd(Date.now()).replace(/-/g,"")+"_"+kRid().slice(1),amount:G.packs.web[k],pt:G.packs.pt[k],orderName:"StageSong 포인트 "+G.packs.pt[k].toLocaleString("ko-KR")+"P"})
    :kptPost("toss/order",{k:k,rid:kRid()});
  var me=guest?Promise.resolve(null):fetch(HUB+"/npg/me",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sess:sess()})}).then(function(r){ return r.json(); }).catch(function(){ return null; });
  return Promise.all([od,me]).then(function(a){ var j=a[0], u=(a[1]&&a[1].me)||{};
    if(!(j&&j.ok&&j.orderId&&j.amount)){ if(j&&j.err==="sess"){ KB.sess=0; barPaint(); return L(TX.esess); } return L(TX.kwPgN); }
    try{ ntap("kara_pt","toss_"+m+"_"+k); }catch(e){}
    ss(KTK,{oid:j.orderId,amount:j.amount,pt:j.pt,k:k,m:m,g:guest?1:0,code:K.code,at:Date.now()});   // 돌아왔을 때 이 탭에서만 맞춰 본다
    var req={amount:{currency:"KRW",value:j.amount},orderId:j.orderId,orderName:String(j.orderName||"StageSong").slice(0,100),successUrl:base+"?kptres=ok",failUrl:base+"?kptres=fail"};
    var nm=String(u.name||"").trim(), em=String(u.email||"").trim();
    if(nm) req.customerName=nm.slice(0,100); if(/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(em)) req.customerEmail=em;
    var cd={flowMode:"DEFAULT",useEscrow:false,useCardPoint:false,useAppCardOnly:false};
    if(m==="tosspay"||m==="kakaopay"||m==="naverpay"){ req.method="CARD"; req.card={flowMode:"DIRECT",easyPay:{tosspay:"TOSSPAY",kakaopay:"KAKAOPAY",naverpay:"NAVERPAY"}[m],useEscrow:false,useCardPoint:false,useAppCardOnly:false}; }
    else if(m==="transfer"){ req.method="TRANSFER"; req.transfer={cashReceipt:{type:"소득공제"},useEscrow:false}; }
    else if(m==="phone"){ req.method="MOBILE_PHONE"; }
    else { req.method="CARD"; req.card=cd; }
    var ck=/^[A-Za-z0-9_=.@-]{2,50}$/.test(j.customerKey||"")?j.customerKey:null;
    return tsdk().then(function(){ return window.TossPayments(TCK).payment({customerKey:ck||window.TossPayments.ANONYMOUS}).requestPayment(req); }).then(function(){ return null; })
      .catch(function(e){ window.__kptTossErr=String((e&&e.code||"")+" "+(e&&e.message||e)); ss(KTK,null); return (e&&e.code==="USER_CANCEL")?L(TX.tsFlD):((e&&e.message)||L(TX.kwPgN)); }); })
    .catch(function(){ return L(TX.kwPgN); }); }
// 결제 결과 창 — st: "chk" 확인 중 · "ok" 충전됨(x.test = 시험) · "wait" 승인 대기(시험 키) · "fail"
function kTossRes(st,x){ var b=box(); if(!b) return null; var o=b.querySelector(".ktsr"); if(o) o.remove(); o=document.createElement("div"); o.className="kpm ktsr"; b.appendChild(o); x=x||{};
  var lg=esc(window.LANG||"en"), h='<div><h3>'+esc(L(st==="ok"?TX.tsOkT:st==="wait"?TX.tsWtT:st==="fail"?TX.tsFlT:TX.tsChk))+'</h3>';
  if(st==="chk") h+='<p class="km">'+esc(L(TX.lo))+'</p>';
  else if(st==="ok") h+='<div class="kdone">'+esc(tf(L(TX.tsOkD),{p:ptS(x.pt)}))+(x.test?'<br>'+esc(L(TX.tsTstD)):'')+'</div>';
  else if(st==="wait") h+='<div class="kwait">'+esc(L(TX.tsWtD))+'</div>';
  else h+='<div class="kerr">'+esc(L(TX.tsFlD))+(x.msg?' ('+esc(String(x.msg).slice(0,120))+')':'')+'</div>';
  if(x.oid) h+='<div class="krow"><span>'+esc(L(TX.oid))+'</span><b>'+esc(x.oid)+'</b></div>';
  if(x.won) h+='<div class="krow"><span>'+esc(L(TX.tot))+'</span><b>'+wonL(x.won)+'</b></div>';
  if(x.pt) h+='<div class="krow"><span>'+esc(L(TX.tsPt))+'</span><b>'+ptS(x.pt)+'</b></div>';
  if(st==="ok"&&x.bal) h+='<div class="kt"><span>'+esc(L(TX.kwBal))+'</span><span>'+ptS(x.bal.total)+'</span></div>';
  if(st==="ok") h+='<button type="button" class="kgo" data-tw="1">'+esc(L(TX.kwT))+'</button><button type="button" class="krf" data-tb="1">'+esc(L(TX.kwBuy))+'</button>';
  if(st==="wait"||st==="fail") h+='<button type="button" class="kgo" data-tr="1">'+esc(L(TX.tsRe))+'</button>';
  h+='<div class="klk"><a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div>'+(st!=="chk"?'<button type="button" class="kc">'+esc(L(TX.ok))+'</button>':'')+'</div>';
  o.innerHTML=h; var q=function(s){ return o.querySelector(s); };
  if(q(".kc")) q(".kc").onclick=function(){ o.remove(); };
  if(q("[data-tw]")) q("[data-tw]").onclick=function(){ o.remove(); kwOpen(""); };
  if(q("[data-tb]")) q("[data-tb]").onclick=function(){ o.remove(); payOpen(""); };
  if(q("[data-tr]")) q("[data-tr]").onclick=function(){ o.remove(); kwOpen("chg"); };
  return o; }
// 토스 결제창에서 돌아옴 (?kptres=ok&paymentKey&orderId&amount · ?kptres=fail&code&message)
function kptReturn(){ var sp=new URLSearchParams(location.search), r=sp.get("kptres"); if(!r) return;
  try{ var keep=location.search.slice(1).split("&").filter(function(x){ return !/^(kptres|paymentKey|orderId|amount|paymentType|code|message)=/.test(x); }).join("&"); history.replaceState(history.state,"",location.pathname+(keep?"?"+keep:"")+location.hash); }catch(e){}
  var v=ss(KTK); ss(KTK,null);
  var oid=sp.get("orderId")||"", amt=Math.round(Number(sp.get("amount")||0)), pk=sp.get("paymentKey")||"", ok=r==="ok"&&!!v&&oid===v.oid&&amt===v.amount&&!!pk;
  if(!box()) open((v&&v.code)||(window.KAR_SITE?"site":""));
  var base={oid:oid||(v&&v.oid)||"",won:(v&&v.amount)||amt||0,pt:(v&&v.pt)||0};
  var fin=function(st,x){ window.__kptResult=st; try{ ntap("kara_pt","toss_res_"+st); }catch(e){} kTossRes(st,Object.assign({},base,x||{})); };
  if(!ok){ fin("fail",{msg:r==="ok"?"":(sp.get("message")||"")}); return; }
  if(v.g){ fin("wait"); return; }
  kTossRes("chk",base);
  kptPost("toss/confirm",{rid:kRid(),paymentKey:pk,orderId:oid,amount:amt}).then(function(j){
    if(j&&j.ok){ kptLoad(); fin("ok",{pt:j.pt||base.pt,won:j.won||base.won,test:j.test?1:0,bal:j.bal}); return; }
    if(j&&j.err==="nosk"){ fin("wait"); return; }
    fin("fail",{msg:j&&j.err==="sess"?L(TX.esess):(j&&j.msg)||""}); }).catch(function(){ fin("fail"); }); }
if(/[?&]kptres=/.test(location.search)){ var _kt=function(){ setTimeout(function(){ try{ kptReturn(); }catch(e){ window.__kptRetErr=String(e); } },700); }; if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",_kt); else _kt(); }
var KWH=["charge","bonus","use","undo","refreq","refund","refrej","void","ext","pass","passrf"], KWW=["song","ai","aiv","dor","dorx","room","deco"];   // deco = 방 꾸미기 (10-31)
function kTx(o,i){ return String(L(o)).split("|")[i]||""; }
function ptS(n){ return Math.round(n||0).toLocaleString("ko-KR")+"P"; }
function kYmd(ms){ return new Date(ms+9*3600e3).toISOString().slice(0,10); }
function kApp(){ try{ var C=window.Capacitor; return !!(C&&C.isNativePlatform&&C.isNativePlatform()); }catch(e){ return false; } }   // 전용 앱(Capacitor) — 앱 가격·구글 플레이만
function kRid(){ return "r"+Date.now().toString(36)+Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(6)),function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); }   // 요청 번호 — 두 번 눌러도 한 번만
function kptOn(){ return !!(KP.on&&KP.d&&karSigned()); }
function kptPost(path,o){ var q={sess:sess()}; for(var k in o) q[k]=o[k]; var h={"Content-Type":"application/json"};
  return fetch(HUB+"/shop/kpt/"+path,{method:"POST",headers:h,body:JSON.stringify(q)}).then(function(r){ return r.json().catch(function(){ return {ok:false,err:"http"}; }); }); }
function kptLoad(){ if(!sess()){ KP.on=0; KP.d=null; barPaint(); return Promise.resolve(null); }
  return kptPost("me",{}).then(function(j){ if(j&&j.ok&&!j.closed){ KP.on=1; KP.d=j; KB.left=+j.left||0; if(kApp()&&!KP.rec){ KP.rec=1; kGpRecover(); } if(!KP.pr){ KP.pr=1; kPromoWait(0); } if(KP.reChg){ KP.reChg=0; kwOpen("chg"); } } else { KP.on=0; KP.d=null; } barPaint(); if(KP.redraw) KP.redraw(); if(KB.redraw) KB.redraw(); return j; }).catch(function(){ return null; }); }
// 사용 미리 보기 — 「3,000P 사용 → 9,000P 남음」 · 확인하면 go() (모자라면 충전으로)
function kptAsk(cost,title,go,note,okL,onX){ /* okL = 마지막 단추 글자 (구매 등, 없으면 확인) */ var b=box(); if(!b) return; var o=document.createElement("div"); o.className="kpm kptq"; b.appendChild(o); var bal=KP.d?KP.d.bal.total:0, busy=false;   // note = 금액 대신 안내 글 (연장 등 돈 안 드는 확인)
  var draw=function(msg){ var short=!note&&bal<cost;
    o.innerHTML='<div><h3>'+esc(title)+'</h3><div class="kwuse'+(short?' kwno':'')+'">'+esc(note||tf(L(TX.kwUse),{c:ptS(cost),r:ptS(Math.max(0,bal-cost))}))+'</div>'
      +(short?'<div class="kerr">'+esc(tf(L(TX.kwShort),{h:ptS(bal)}))+'</div>':'')+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<p class="km">'+esc(L(TX.kwRule))+'</p>'
      +(short?'<button type="button" class="kgo" data-c="1">'+esc(L(TX.kwChg))+'</button>':'<button type="button" class="kgo" data-y="1"'+(busy?' disabled':'')+'>'+esc(okL||L(TX.kwOk))+'</button>')+'<button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
    o.querySelector(".kc").onclick=function(){ o.remove(); if(onX) onX(); };   // onX = 사용하지 않고 닫음 (10-31 밤)
    var y=o.querySelector("[data-y]"); if(y) y.onclick=function(){ if(busy) return; busy=true; draw(); go(function(err){ busy=false; if(err) draw(err); else o.remove(); }); };
    var c=o.querySelector("[data-c]"); if(c) c.onclick=function(){ o.remove(); if(onX) onX(); kwOpen("chg"); }; };
  draw(""); }
// 내 지갑 — v: "" 첫 화면 · "chg" 충전 · "rf" 환불 요청 · "hist" 사용 내역
function kwOpen(v0){ var b=box(); if(!b) return; var o=b.querySelector(".kwal"); if(o) o.remove(); o=document.createElement("div"); o.className="kpm kwal"; b.appendChild(o);
  var v=v0||"", msg="", busy=false, rf=null, app=kApp();
  try{ ntap("kara_pt","open_"+(v||"main")); }catch(e){}
  var draw=function(){ var d=KP.d||(v==="chg"&&!app?kGuestD():null); if(!d){ o.innerHTML='<div><h3>'+esc(L(TX.kwT))+'</h3><p class="km">'+esc(L(TX.lo))+'</p><button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>'; o.querySelector(".kc").onclick=function(){ o.remove(); KP.redraw=null; }; return; }
    var B=d.bal, now=d.now||Date.now(), h='<div><h3>'+esc(L(TX.kwT))+'</h3>';
    if(v==="chg"){ var P=d.packs, wonA=app?P.app:P.web;
      h+='<b class="kh">'+esc(L(TX.kwChgT))+'</b><div class="kwpk">'+P.pt.map(function(pt,i){ var bo=(d.bonus||[])[i]||0;
        return '<button type="button" data-k="'+i+'"'+(i===(KP.k||0)?' class="on"':'')+'><b>'+ptS(pt)+'</b>'+(bo?'<em class="ksv">'+esc(tf(L(TX.kwBon),{b:ptS(bo)}))+'</em>':'')+'<span>'+won(wonA[i])+'</span></button>'; }).join("")+'</div>'
        +'<p class="km">'+esc(L(TX.kwRule))+(app?'<br>'+esc(L(TX.kwGpN)):'')+'</p>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
        +(app?'<button type="button" class="kgo" data-gp="1"'+(busy?' disabled':'')+'>'+esc(L(TX.kwPayB))+'</button>'
             :kTossUi(wonA[KP.k||0],busy,!!d.guest))   // 웹 = 토스페이먼츠 결제창 (10-31)
        +'<button type="button" class="krf" data-buy="1">'+esc(L(TX.kwBuyPt))+'</button>'   // 충전 창 안에서 곡 이용권 구매 (10-31)
        +'<button type="button" class="kc" data-bk="1">'+esc(L(TX.back))+'</button>'+(app?'':bizHtml())+'</div>'; }
    else if(v==="rf"){ var f=Math.round((d.fee||0)*1000)/10;
      h+='<b class="kh">'+esc(L(TX.kwRf))+'</b><p class="km">'+esc(tf(L(TX.kwRfN),{f:f}))+'</p>';
      if(d.req) h+='<div class="kdone">'+esc(L(TX.kwRfPd))+' ('+esc(d.req.id)+' · '+won(d.req.total)+')</div>';
      else if(rf&&rf.done) h+='<div class="kdone">'+esc(L(TX.kwRfOk))+'</div>';
      else if(!rf) h+='<p class="km">'+esc(L(TX.lo))+'</p>';
      else if(!rf.rows||!rf.rows.length) h+='<div class="kerr">'+esc(L(TX.kwRfNo))+'</div>';
      else h+='<div class="kwls">'+rf.rows.map(function(r){ return '<div><span>'+esc(kYmd(r.t))+' · '+ptS(r.amt)+'<small>'+esc(r.kind==='d7'?L(TX.kwRfFull):r.kind==='exp'?tf(L(TX.kwRfExp),{l:ptS(r.left)}):r.kind==='fix'?tf(L(TX.kwRfFix),{l:ptS(r.left),x:won(r.fee)}):tf(L(TX.kwRfFee),{l:ptS(r.left),f:f}))+'</small></span><b>'+won(r.refund)+'</b></div>'; }).join("")+'</div>'
        +'<div class="kt"><span>'+esc(L(TX.kwRfAmt))+'</span><span>'+won(rf.total)+'</span></div>'+(rf.free?'<p class="km">'+esc(tf(L(TX.kwRfGone),{n:ptS(rf.free)}))+'</p>':'')
        +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo" data-rq="1"'+(busy?' disabled':'')+'>'+esc(L(TX.kwRf))+' · '+won(rf.total)+'</button>';
      h+='<div class="klk"><a href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div><button type="button" class="kc" data-bk="1">'+esc(L(TX.back))+'</button></div>'; }
    else if(v==="hist"){ h+='<b class="kh">'+esc(L(TX.kwHist))+'</b><div class="kwls kwhs">'+((d.hist||[]).map(function(x){ var i=KWH.indexOf(x.op), w=KWW.indexOf(x.what);
        return '<div><span>'+esc(kTx(TX.kwH,i<0?2:i))+(w>=0?' · '+esc(kTx(TX.kwW,w)):'')+(x.what==="deco"&&x.key?' · '+esc(dcHN(x.key)):'')+(x.songs?' · '+esc(songsTx(x.songs)):'')+(x.op==="pass"&&x.m?' · '+esc(kMon(x.m)):'')+'<small>'+esc(new Date(x.at+9*3600e3).toISOString().slice(0,16).replace("T"," "))+'</small></span><b class="'+(x.pt>0?'kwp':x.pt<0?'kwm':'')+'">'+(x.pt>0?'+':'')+(x.pt?ptS(x.pt):x.won?won(x.won):'')+'</b></div>'; }).join("")||'<p class="km">'+esc(L(TX.kwNone))+'</p>')+'</div><button type="button" class="kc" data-bk="1">'+esc(L(TX.back))+'</button></div>'; }
    else { h+='<div class="kwb"><small>'+esc(L(TX.kwBal))+'</small><b>'+ptS(B.total)+'</b><span>'+esc(L(TX.kwPaid))+' '+ptS(B.paid)+' · '+esc(L(TX.kwFree))+' '+ptS(B.free)+'</span>'+(d.pass&&d.pass.on?'<span>'+esc(tf(L(TX.psEnd),{d:kMd(d.pass.end)}))+'</span>':'')+(d.left>0?'<span>'+esc(fmtN(L(TX.lftN),d.left))+'</span>':'')+'</div>'
        +'<div class="kwbt"><button type="button" class="kgo" data-v="chg">'+esc(L(TX.kwChg))+'</button><button type="button" class="kgo kwg2" data-buy="1">'+esc(L(TX.kwBuy))+'</button></div>'
        +((d.soon||[]).length?'<div class="kerr kwsoon">'+esc(tf(L(d.soon.every(function(l){ return l.cap; })?TX.kwSoonC:TX.kwSoon),{p:ptS(d.soon.reduce(function(a,l){ return a+l.left; },0)),d:kYmd(Math.min.apply(null,d.soon.map(function(l){ return l.exp; })))}))+'</div>':'')   // 만료 30일 안 알림 (10-31)
        +'<b class="kh">'+esc(L(TX.kwLots))+'</b><div class="kwls">'+((d.lots||[]).map(function(l){ var ex=l.exp<=now;
          return '<div><span>'+esc(L(l.k==="paid"?TX.kwPaid:TX.kwFree))+' '+ptS(l.amt)+'<small>'+esc(l.st==="frz"?L(TX.kwFrz):ex?L(TX.kwExpd)+(l.k==="paid"&&l.r5>now?' · '+tf(L(TX.kwR5),{d:kYmd(l.r5)}):''):tf(L(TX.kwUntil),{d:kYmd(l.exp)}))+'</small></span><b>'+ptS(l.left)+'</b></div>'; }).join("")||'<p class="km">'+esc(L(TX.kwNone))+'</p>')+'</div>'
        +'<p class="km">'+esc(L(TX.kwRule))+'</p>'
        +'<div class="kwbt"><button type="button" class="krf" data-v="hist">'+esc(L(TX.kwHist))+'</button><button type="button" class="krf" data-ext="1"'+(busy||d.extCap?' disabled':'')+'>'+esc(L(TX.kwExt))+'</button><button type="button" class="krf" data-v="rf">'+esc(L(TX.kwRf))+'</button></div>'+(d.extCap?'<p class="km kwcap">'+esc(L(TX.kwExtCap))+'</p>':'')+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
        +'<button type="button" class="kc kwac" data-ac="1">'+esc(L(TX.kwAcct))+'</button><button type="button" class="kc" data-x="1">'+esc(L(TX.ok))+'</button></div>'; }
    o.innerHTML=h;
    [].forEach.call(o.querySelectorAll("[data-v]"),function(x){ x.onclick=function(){ v=x.dataset.v; msg=""; rf=null; draw(); if(v==="rf") rfLoad(); try{ ntap("kara_pt","open_"+v); }catch(e){} }; });
    [].forEach.call(o.querySelectorAll("[data-bk]"),function(x){ x.onclick=function(){ if(!KP.d){ o.remove(); KP.redraw=null; return; } v=""; msg=""; draw(); }; });   // 로그인 전 충전 화면 = 닫기
    [].forEach.call(o.querySelectorAll("[data-tm]"),function(x){ x.onclick=function(){ KP.tm=x.dataset.tm; msg=""; draw(); }; });   // 결제 수단 (10-31)
    [].forEach.call(o.querySelectorAll("[data-tlg]"),function(x){ x.onclick=function(){ o.remove(); KP.redraw=null; KP.reChg=1; signIn(); }; });   // 로그인 → 다시 충전 화면
    [].forEach.call(o.querySelectorAll(".kwpk [data-k]"),function(x){ x.onclick=function(){ KP.k=+x.dataset.k; msg=""; draw(); }; });
    var q=function(s){ return o.querySelector(s); };
    if(q("[data-x]")) q("[data-x]").onclick=function(){ o.remove(); KP.redraw=null; };
    if(q("[data-ac]")) q("[data-ac]").onclick=function(){ o.remove(); KP.redraw=null; signIn(); };
    if(q("[data-buy]")) q("[data-buy]").onclick=function(){ o.remove(); KP.redraw=null; payOpen(""); };
    var live=d.live||{}, tst=function(){ if(busy) return; busy=true; draw(); var k=KP.k||0;   // 진짜 결제 길이 아직 없을 때 = 같은 「결제」 단추가 시험 충전 (10-31 출시판)
      var p=app?kGpTest(k):kptPost("charge",{rail:"test",k:k,rid:kRid()});
      p.then(function(j){ busy=false; if(j&&j.ok){ try{ ntap("kara_pt","test_"+k); }catch(e){} v=""; msg=""; kptLoad().then(function(){ soon(L(TX.kwDone)); }); } else { msg=L(TX.kwPgN); draw(); } }).catch(function(){ busy=false; msg=L(TX.kwPgN); draw(); }); };
    if(q("[data-pg]")) q("[data-pg]").onclick=function(){ if(busy) return; busy=true; msg=""; draw();
      if(!live.inicis){ kTossGo(KP.k||0).then(function(e){ busy=false; if(e) msg=e; if(o.isConnected) draw(); }); return; }   // 웹 = 토스페이먼츠 결제창 (10-31) · 이니시스 계약이 생기면 아래 길
      kptPost("charge",{rail:"inicis",k:KP.k||0,rid:kRid()}).then(function(j){ busy=false; msg=j&&j.ok?"":L(TX.kwPgN); draw(); }).catch(function(){ busy=false; msg=L(TX.kwPgN); draw(); }); };
    if(q("[data-gp]")) q("[data-gp]").onclick=function(){ if(!live.gplay) return tst(); if(busy) return; busy=true; msg=""; draw(); kGpBuy(KP.k||0).then(function(r){ busy=false; if(r&&r.ok){ v=""; kptLoad().then(function(){ soon(L(TX.kwDone)); }); } else { msg=r&&r.msg||L(TX.efail); draw(); } }); };
    if(q("[data-ext]")) q("[data-ext]").onclick=function(){ if(busy) return; var rid=kRid(); kptAsk(0,L(TX.kwExt),function(done){ kptPost("ext",{rid:rid}).then(function(j){ done(); if(j&&j.ok){ try{ ntap("kara_pt","ext"); }catch(e){} msg=""; kptLoad().then(function(){ soon(L(TX.kwExtOk)); }); } else { msg=j&&j.err==="cap"?L(TX.kwExtCap):j&&j.err==="none"?L(TX.kwExtNo):L(TX.efail); draw(); } }).catch(function(){ done(L(TX.efail)); }); },L(TX.kwExtQ)); };   // 기간 연장 (10-31)
    if(q("[data-rq]")) q("[data-rq]").onclick=function(){ if(busy) return; busy=true; draw();
      kptPost("refund",{rid:rf.rid}).then(function(j){ busy=false; if(j&&j.ok){ rf.done=1; try{ ntap("kara_pt","refund_req"); }catch(e){} kptLoad(); } else msg=j&&j.err==="pending"?L(TX.kwRfPd):L(TX.efail); draw(); }).catch(function(){ busy=false; msg=L(TX.efail); draw(); }); }; };
  var rfLoad=function(){ kptPost("refund",{preview:true,rid:kRid()}).then(function(j){ if(v!=="rf") return; rf=j&&j.calc?j.calc:{rows:[]}; rf.rid=kRid(); if(j&&j.err==="pending") KP.d.req=j.req; draw(); }).catch(function(){ rf={rows:[]}; draw(); }); };
  KP.redraw=function(){ if(o.isConnected&&!busy) draw(); };
  o.onclick=function(e){ if(e.target===o&&!busy){ o.remove(); KP.redraw=null; } };
  draw(); if(v==="rf") rfLoad(); kptLoad(); }
// ── 이용권 (사장님 10-31 「곡당 판매 → 기간 이용권」) — 허브 /shop/kpt/pass {k} · 가격 = 허브 passP (관리자 「이용권」) · 기간 안에는 노래 무제한 · 자동 연장 없음 · 이용 중에 사면 끝나는 날부터 이어 붙임
function kPassP(){ var d=KP.d; return d&&d.passP&&d.passP.length?d.passP:[{m:1,p:7000},{m:3,p:17000},{m:6,p:30000},{m:12,p:50000}]; }
function kMon(m){ return tf(L(m===1?TX.psM1:TX.psM),{n:m}); }
function kMd(ms){ var s=kYmd(ms), md=(+s.slice(5,7))+"."+s.slice(8,10); return s.slice(0,4)!==kYmd(Date.now()).slice(0,4)?s.slice(0,4)+"."+md:md; }   // 「11.30」 · 해가 다르면 「2027.2.28」
function kBarTx(){ var d=KP.d, ps=d&&d.pass, n=karLeft(), a=[]; if(ps&&ps.on) a.push(tf(L(TX.psEnd),{d:kMd(ps.end)})); else if(n>0) a.push(fmtN(L(TX.kwSongN),n)); if(d) a.push(ptS(d.bal.total)); return a.join(" · ")||L(TX.kwT); }
function kPassBuy(k){ var q=kPassP()[k]||kPassP()[0], rid=kRid();
  kptAsk(q.p,L(TX.kb)+" "+kMon(q.m),function(done){
    kptPost("pass",{k:k,rid:rid}).then(function(j){ if(j&&j.ok){ try{ ntap("kara_pt","pass_"+q.m); }catch(e){} done(); kptLoad().then(function(){ soon(L(TX.kwDone)+" "+tf(L(TX.psEnd),{d:kMd(j.to)})); }); }
      else done(j&&j.err==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):L(TX.efail)); }).catch(function(){ done(L(TX.efail)); }); },"",L(TX.kwBuyB)); }
// 노래를 틀 때 — 이용권 기간이면 「사용」 표시 한 번 (7일 이내 전액 환불 기준) · 차감 없음
function kPassUse(){ var d=KP.d, ps=d&&d.pass; if(!kptOn()||!ps||!ps.on||ps.used||KP.pu) return; KP.pu=1;
  kptPost("passuse",{rid:kRid()}).then(function(j){ KP.pu=0; if(j&&j.ok&&j.n>=0&&KP.d&&KP.d.pass) KP.d.pass.used=1; }).catch(function(){ KP.pu=0; }); }
function kPassRf(){ var b=box(); if(!b) return; var o=document.createElement("div"); o.className="kpm kptq kpsrf"; b.appendChild(o); var c=null, busy=false, msg="", done=0, rid=kRid(), lg=esc(window.LANG||"en");
  var draw=function(){ var h='<div><h3>'+esc(L(TX.psRf))+'</h3><p class="km">'+esc(L(TX.psRfN))+'</p>';
    if(done) h+='<div class="kdone">'+esc(tf(L(TX.psRfOk),{w:wonL(done)}))+'</div>';
    else if(!c) h+='<p class="km">'+esc(L(TX.lo))+'</p>';
    else if(!c.rows||!c.rows.length) h+='<div class="kerr">'+esc(L(TX.psRfNo))+'</div>';
    else h+='<div class="kwls">'+c.rows.map(function(r){ return '<div><span>'+esc(kMon(r.m))+' · '+esc(kMd(r.from))+'~'+esc(kMd(r.to))+'<small>'+esc(r.kind==="d7"?L(TX.psRfFull):tf(L(TX.psRfPro),{n:r.remD}))+(r.free?' · '+esc(tf(L(TX.psRfFx),{n:ptS(r.free)})):'')+'</small></span><b>'+wonL(r.refund)+'</b></div>'; }).join("")+'</div>'
      +'<div class="kwuse">'+esc(tf(L(TX.psRfAmt),{w:wonL(c.total)}))+'</div>'+(c.store?'<p class="km">'+esc(L(TX.kwGpN))+'</p>':'')+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo" data-rq="1"'+(busy?' disabled':'')+'>'+esc(L(TX.psRfB))+'</button>';
    h+='<div class="klk"><a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div><button type="button" class="kc">'+esc(L(done?TX.ok:TX.back))+'</button></div>';
    o.innerHTML=h; o.querySelector(".kc").onclick=function(){ if(!busy) o.remove(); };
    var y=o.querySelector("[data-rq]"); if(y) y.onclick=function(){ if(busy) return; busy=true; draw();
      kptPost("passrf",{rid:rid}).then(function(j){ busy=false; if(j&&j.ok){ done=String(j.total||0); try{ ntap("kara_pt","pass_rf"); }catch(e){} kptLoad(); } else msg=L(TX.efail); if(o.isConnected) draw(); }).catch(function(){ busy=false; msg=L(TX.efail); draw(); }); }; };
  draw(); kptPost("passrf",{preview:true,rid:kRid()}).then(function(j){ c=j&&j.calc?j.calc:{rows:[]}; draw(); }).catch(function(){ c={rows:[]}; draw(); }); }
// ── 앱 결제 (구글 플레이) — 플러그인 @capgo/native-purchases (Capacitor 8) · 상품 pt_50000·pt_100000·pt_150000·pt_200000 (소모성, 10-31 밤) · 옛 pt_5000·pt_10000·pt_30000 은 복구만 (허브 KPT_GP_OLD)
//   구매 → 허브 /shop/kpt/charge {rail:"gplay", pid, token} 가 확인·충전 → 허브 OK 뒤에만 consumePurchase (실패하면 남겨 두고 다음에 다시 보냄 — 허브는 같은 토큰을 한 번만 충전)
//   허브 확인은 서비스 계정(GPLAY_SA) 넣기 전엔 d.live.gplay 0 → 「결제」 = 시험 충전(kGpTest) · 넣으면 자동으로 진짜 구매 창 (플레이 콘솔 상품도 있어야 함)
function kGp(){ try{ var C=window.Capacitor; return C&&C.Plugins&&C.Plugins.NativePurchases||null; }catch(e){ return null; } }
function kGpSend(k,pid,tr,test){ return kptPost("charge",{rail:"gplay",k:k,pid:pid,token:tr.purchaseToken||"",rid:"g"+String(tr.purchaseToken||"").replace(/[^A-Za-z0-9]/g,"").slice(-24)+"x",test:!!test}); }
function kGpBuy(k){ var P=kGp(), d=KP.d, pid=d&&d.packs.gp[k]; if(!P||!pid) return Promise.resolve({ok:false,msg:L(TX.kwGpX)});
  return P.purchaseProduct({productIdentifier:pid,productType:"inapp",appAccountToken:d.acct,isConsumable:false,autoAcknowledgePurchases:false}).then(function(tr){
    if(!tr||!tr.purchaseToken) return {ok:false};
    return kGpSend(k,pid,tr,false).then(function(j){ if(j&&j.ok){ P.consumePurchase({purchaseToken:tr.purchaseToken}).catch(function(){}); return {ok:true}; }
      return {ok:false,msg:j&&j.err==="nosa"?L(TX.kwGpX):L(TX.efail)}; }); }).catch(function(e){ return {ok:false,msg:String(e&&e.message||"").indexOf("cancel")>=0?"":L(TX.efail)}; }); }
function kGpTest(k){ var d=KP.d; return kptPost("charge",{rail:"gplay",k:k,pid:d.packs.gp[k],token:"test."+kRid()+kRid(),rid:kRid(),test:true}); }   // 앱 시험 충전 — 가짜 토큰 · test:1 덩어리 (허브 cfg.test 켜져 있을 때만)
// 앱을 켤 때 — 허브에 못 보낸 구매(소비 안 된 것)를 다시 보낸다
function kGpRecover(){ var P=kGp(); if(!P||!kptOn()) return; var d=KP.d;
  P.getPurchases({productType:"inapp"}).then(function(r){ (r&&r.purchases||[]).forEach(function(tr){ var k=d.packs.gp.indexOf(tr.productIdentifier), old=(d.packs.gpOld||[]).indexOf(tr.productIdentifier)>=0; if((k<0&&!old)||!tr.purchaseToken||String(tr.purchaseState)!=="1") return; if(k<0) k=0;   // 옛 묶음 상품 = 허브가 그 값으로 (10-31 밤)
    kGpSend(k,tr.productIdentifier,tr,false).then(function(j){ if(j&&j.ok){ P.consumePurchase({purchaseToken:tr.purchaseToken}).catch(function(){}); kptLoad(); } }); }); }).catch(function(){}); }
// 공지사항 창 — 곡 이용권 가격·보관·환불 규칙. 노래방 안에서 열리고, 결제 창 위에 겹쳐도 닫으면 결제 창으로 돌아간다
// 녹화 화면 효과 — 카메라 뷰파인더(네 귀퉁이)·깜박이는 ● REC 시간·찰칵 플래시 (사장님 10-30 「카메라로 찍는 효과」) · 실제 녹화는 아직
var RECT=0, RECL=0;
function recFx(on){ var b=box(); if(!b) return; var pl=b.querySelector(".kpl"); if(!pl) return; var v=pl.querySelector(".kvf"); if(v) v.remove(); clearInterval(RECT); clearInterval(RECL); if(!on) return;
  // 캠코더 뷰파인더 (사장님 10-30 「카메라 효과가 약하다」) — 꺾쇠 4·3등분선·가운데 초점 원(음양 두 반원+십자)·아래 눈금자·왼쪽 소리 막대·HD+배터리 · 화면 위에만 (녹화 영상엔 안 들어감)
  //   업무용 캠코더 화면 표시 참고: 왼쪽 위 ● REC + 타임코드(시:분:초:프레임 30fps) · 오른쪽 위 배터리 4칸·1080/30p·AF · 가운데 초점 꺾쇠(1/4)+십자+옅은 원 · 3×3 안내선 · 세이프 영역 점선(90%)
  //   왼쪽 오디오 미터 CH1·CH2(-40·-20·-12·0, 초록→노랑→빨강, 피크) · 아래 눈금자(가운데 기준 + 소리 크기 따라 움직이는 작은 삼각)
  v=document.createElement("div"); v.className="kvf"; v.innerHTML='<s class="kg1"></s><s class="kg2"></s><div class="ksa"></div><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><b><em></em> REC <span>00:00:00:00</span></b>'
    +'<div class="kfo"><p></p></div><div class="kru"><p></p></div>'
    +'<div class="klv"><div class="kc"><p></p><a></a><small>1</small></div><div class="kc"><p></p><a></a><small>2</small></div><div class="ksl"><small style="bottom:16.7%">-40</small><small style="bottom:58.3%">-20</small><small style="bottom:75%">-12</small><small style="bottom:100%">0</small></div></div>'
    +'<div class="khd"><var><q></q><q></q><q></q><q></q></var><span>1080/30p</span><span>AF</span></div>'; pl.appendChild(v);
  var tc=v.querySelector("b span"), cv=v.querySelectorAll(".klv .kc p"), pk=v.querySelectorAll(".klv .kc a"), tri=v.querySelector(".kru p"), t1=Date.now(), lvA=[0,0], pkA=[0,0], pkT=[0,0], z2=function(n){ return ("0"+n).slice(-2); };
  clearInterval(RECL); RECL=setInterval(function(){ if(!v.parentNode){ clearInterval(RECL); return; } var ms=Date.now()-t1, x=Math.floor(ms/1000);
    tc.textContent=z2(Math.floor(x/3600))+":"+z2(Math.floor(x/60)%60)+":"+z2(x%60)+":"+z2(Math.floor((ms%1000)*30/1000));   // 타임코드 — 프레임 칸 30fps
    var d=KSC&&KSC.d, db=d&&d.length?d[d.length-1]:-90, lv=Math.max(0,Math.min(1,(db+48)/48)), now=Date.now();   // 마이크 소리 크기 (점수용 측정값 재사용) · -48dB=0 · 0dB=끝
    for(var c=0;c<2;c++){ var t=c?lv*(0.94+Math.random()*0.06):lv; lvA[c]=t>lvA[c]?t:lvA[c]*0.85+t*0.15; if(lvA[c]>=pkA[c]||now-pkT[c]>1500){ pkA[c]=lvA[c]; pkT[c]=now; }
      cv[c].style.height=Math.round((1-lvA[c])*100)+"%"; pk[c].style.bottom=Math.round(pkA[c]*100)+"%"; }   // 위를 덮는 검은 판 높이 · 피크는 1.5초 붙잡음
    tri.style.left=(50+(lvA[0]-0.5)*40).toFixed(1)+"%"; },33);
  var t0=Date.now(), sp=v.querySelector("span"), su=v.querySelector("u"); RECT=setInterval(function(){ if(!v.parentNode){ clearInterval(RECT); return; } if(su&&KSC) su.textContent="♪ "+kScCalc(KSC,(Date.now()-KSC.t0)/1000); },1000);   // ♪ 지금까지 점수 1초마다 (사장님 10-30)
  var f=document.createElement("div"); f.className="kflash"; pl.appendChild(f); setTimeout(function(){ f.remove(); },450); }
// 잠깐 안내 글 (10-30)
function soon(msg){ var b=box(); if(!b) return; var o=b.querySelector(".ksoon"); if(o) o.remove(); o=document.createElement("div"); o.className="ksoon"; if(typeof msg!=="string"||!msg){ o.remove(); return; } o.textContent=msg; b.appendChild(o); setTimeout(function(){ if(o.parentNode) o.remove(); },typeof msg==="string"?4000:2200); }
// ── 녹화 (10-30) — 앞카메라+마이크(반주 소리도 함께 담기게 에코 제거 끔) → MediaRecorder · 이 기기 안에서만, 회사로 안 보냄
var REC={st:null,mr:null,ch:[],mt:"",url:"",blob:null,t0:0,dur:0,sc:null};   // sc = 노래 점수 0~100 (사장님 기기 녹화만, 10-30)
// ── 노래 점수 (사장님 10-30 「노래방 기계식」) — 녹화 중 마이크 소리를 0.1초마다 잰다 (Web Audio AnalyserNode)
//   ① 목소리 크기: 적당한 크기면 가점, 너무 작으면 낮게, 찢어지게 크면(파형이 끝에 닿음) 감점  ② 노래한 시간 비율  ③ 끊김 없이 이어 부른 정도(소리 덩어리 평균 길이)
//   셋을 섞어 보통 사람이 부르면 70~95점대가 나오게 늘림 · 거의 소리 없으면 낮게 · 15초 미만 녹화는 낮게 · 영상에는 안 새김
var KAC=null, KSC=null;
function kAC(){ try{ if(!KAC) KAC=new (window.AudioContext||window.webkitAudioContext)(); if(KAC.state==="suspended") KAC.resume(); }catch(e){ KAC=null; } return KAC; }
function kScStop(){ var k=KSC; KSC=null; if(!k) return; clearInterval(k.iv); try{ k.src.disconnect(); }catch(e){} try{ k.an.disconnect(); }catch(e){} try{ k.g.disconnect(); }catch(e){} }
function kScStart(st){ kScStop(); var ac=kAC(); if(!ac||!st||!st.getAudioTracks().length) return;
  try{ var src=ac.createMediaStreamSource(st), an=ac.createAnalyser(), g=ac.createGain(); an.fftSize=2048; g.gain.value=0; src.connect(an); an.connect(g); g.connect(ac.destination);   // 스피커로는 0 (되울림 없음)
    var fb=an.getFloatTimeDomainData?new Float32Array(an.fftSize):null, bb=fb?null:new Uint8Array(an.fftSize);
    var k=KSC={src:src,an:an,g:g,t0:Date.now(),n:0,v:0,q:0,c:0,rn:0,cur:0,iv:0};
    k.iv=setInterval(function(){ if(KSC!==k) return; var i, x, sq=0, pk=0, N=an.fftSize;
      if(fb){ an.getFloatTimeDomainData(fb); for(i=0;i<N;i++){ x=fb[i]; sq+=x*x; if(x<0) x=-x; if(x>pk) pk=x; } }
      else { an.getByteTimeDomainData(bb); for(i=0;i<N;i++){ x=(bb[i]-128)/128; sq+=x*x; if(x<0) x=-x; if(x>pk) pk=x; } }
      var db=20*Math.log(Math.sqrt(sq/N)+1e-9)/Math.LN10; k.n++; (k.d=k.d||[]).push(db); if(pk>0.985) k.c2=(k.c2||0)+1;
      if(db>-42){ k.v++; k.cur++; k.q+=db<-32?0.3+0.7*(db+42)/10:db<=-6?1:Math.max(0.3,1-(db+6)/10); if(pk>0.985) k.c++; }   // 소리 냄 = -42dB 위 · 알맞은 크기 -32~-6dB
      else if(k.cur){ k.rn++; k.cur=0; } },100);
  }catch(e){ kScStop(); } }
function kScCalc(k,dur){ if(!k||k.n<5) return 0;
  // 깐깐하게 (사장님 10-30 「너무 후하다」): 스피커 반주 소리를 바닥으로 보고, 그보다 6dB 이상 큰 순간만 「노래함」으로 센다
  var d=(k.d||[]).slice(-6000), n=d.length; if(n<5) return 0;
  var so=d.slice().sort(function(a,b){ return a-b; }), base=so[Math.floor(n*0.2)], thr=Math.max(-42,base+6);
  var v=0, q=0, runs=0, cur=0, lens=[];
  for(var i=0;i<n;i++){ var db=d[i]; if(db>thr){ v++; cur++; q+=db<-30?0.2:db<=-8?1:Math.max(0.2,1-(db+8)/8); } else if(cur){ lens.push(cur); runs++; cur=0; } }
  if(cur){ lens.push(cur); runs++; }
  var vr=v/n, lq=v?q/v:0, clip=v?(k.c2||0)/v:0, avg=runs?v/runs*0.1:0, cont=Math.min(1,avg/3);   // 이어 부르기 = 소리 덩어리 평균 3초면 만점
  var raw=0.4*Math.min(1,vr/0.55)+0.3*lq+0.3*cont-Math.min(0.35,clip*2); raw=Math.max(0,Math.min(1,raw));
  var s=30+65*Math.pow(raw,1.5);   // 보통 60~80점, 아주 잘 불러야 90점대
  if(vr<0.12) s=Math.min(s,20+vr/0.12*25);   // 거의 안 불렀으면 낮게
  if(dur<30) s=Math.min(s,20+dur*1.5);   // 30초 미만 = 낮게
  return Math.max(0,Math.min(100,Math.round(s))); }
// 끝 점수 화면 — 큰 숫자가 0부터 올라가고 팡파레 (소리는 이벤트 섬 스도쿠·빙고 끝 팡파레(event.js fxSnd "fan")와 같은 가락, 노래방 따로 배포판에도 울리게 여기 같이 둠)
function kTone(f,t0,d,tp,v){ var a=kAC(); if(!a) return; var o=a.createOscillator(), g=a.createGain(), s=a.currentTime+t0; o.type=tp||"sine"; o.frequency.setValueAtTime(f,s); g.gain.setValueAtTime(0.0001,s); g.gain.exponentialRampToValueAtTime(v||0.18,s+0.02); g.gain.exponentialRampToValueAtTime(0.0001,s+d); o.connect(g); g.connect(a.destination); o.start(s); o.stop(s+d+0.05); }
function kFan(){ try{ [[523,0,.18],[523,.2,.18],[523,.4,.18],[659,.6,.5],[784,1.15,.25],[659,1.4,.18],[784,1.6,.9]].forEach(function(x){ kTone(x[0],x[1],x[2]+.1,"sawtooth",0.09); kTone(x[0]*2,x[1],x[2]+.1,"triangle",0.08); kTone(x[0]/2,x[1],x[2]+.1,"sine",0.12); }); }catch(e){} }
function kScShow(b,sc){ var o=document.createElement("div"); o.className="kscr"; o.innerHTML='<div class="kscw"><small>'+esc(L(TX.scT))+'</small><b>0</b><i>'+esc(L(TX.scPt))+'</i></div>'; b.appendChild(o);
  var n=o.querySelector("b"), t0=0, T=1800, done=false, bye=function(){ if(o.parentNode) o.remove(); };
  var fin=function(){ if(done) return; done=true; n.textContent=String(sc); o.classList.add("kdone"); kFan(); setTimeout(bye,4200); };
  var fr=function(ts){ if(!o.parentNode||done) return; if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/T); n.textContent=String(Math.round(sc*(1-Math.pow(1-p,3)))); if(p>=1) fin(); else requestAnimationFrame(fr); };
  requestAnimationFrame(fr);
  setTimeout(fin,T+600);   // 화면이 숨겨져 그림이 멈춰도 끝은 낸다
  o.onclick=function(){ if(!done) fin(); else bye(); }; }   // blob = 미리 보기 창을 닫기 전까지 보관 (올리기용, 10-30)
// ── 녹화 배경 바꾸기 (사장님 10-30 「뒤 지저분한 걸 숨기기」 · 사장님 기기(mp_owner) 시험판)
//   앞카메라 → MediaPipe 사람 오려 내기(selfie_segmenter) → <canvas> 에 [배경]+[사람] 합성 → canvas.captureStream(30)+마이크 소리를 녹화
//   「없음」이면 예전처럼 카메라 그대로 녹화 · 라이브러리는 배경을 고를 때만 불러온다 · 못 불러오면 조용히 「없음」+안내
var KBG_LIST=[["none",""],["blur",""],["stage","bg_stage.jpg"],["concert","bg_concert.jpg"],["beach","bg_beach.jpg"],["namsan","bg_namsan.jpg"]];
var KBG_TX={none:"bgNone",blur:"bgBlur",stage:"bgStage",concert:"bgConcert",beach:"bgBeach",namsan:"bgNamsan"};
var KMP="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14", KMP_M="https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite";
var KSEG=null, KSEGP=null, KBGW=1280, KSEGDL="", KSEGIN=384;   // (10-31 화질) 처리·녹화 긴 쪽 1280 · 사람 찾기 입력은 긴 쪽 384(모델이 256 이라 더 키워도 소용없고 느려짐)   // KSEGDL = 지금 모델이 도는 곳 (CPU/GPU)
// ── 테마방 (사장님 10-30 · 사장님 기기만) — 테마 = 녹화 배경 그림(th_<키>.jpg) + 상황 사진(AI) 장면 6개씩
//   이름·장면은 "ko|en|ja|zhs|zht|es" · 장면 키는 허브 worker.js KST_TH 와 같게
var KTH_LIST=[
 ["bus","관광버스 아줌마|Tour Bus Aunties|観光バスのおばさま|旅游大巴阿姨|旅遊巴士阿姨|Tías del autobús turístico",[["aisle","통로에서 열창|Singing in the aisle|通路で熱唱|过道里高歌|走道裡高歌|Cantando en el pasillo"],["fan","부채춤|Fan dance|扇子の舞|扇子舞|扇子舞|Baile del abanico"],["window","창가 손 흔들기|Waving at the window|窓から手を振る|车窗挥手|車窗揮手|Saludando por la ventana"],["rest","휴게소 간식|Rest stop snacks|サービスエリアのおやつ|服务区零食|休息站點心|Snacks en el área de descanso"],["photo","버스 앞 단체사진|Group photo by the bus|バスの前で集合写真|大巴前合影|巴士前合照|Foto de grupo junto al autobús"],["dance","막춤 메들리|Wild dance medley|ノリノリダンス|疯狂乱舞|瘋狂亂舞|Baile desenfrenado"]]],
 ["boss","부장님 뒤풀이|The Boss's After-party|部長の二次会|部长的续摊|部長的續攤|La fiesta del jefe",[["tie","넥타이 머리띠·소화기|Tie headband & extinguisher|ネクタイ鉢巻き・消火器|领带头巾·灭火器|領帶頭巾·滅火器|Corbata en la cabeza y extintor"],["table","테이블 위 열창|Singing on the table|テーブルの上で熱唱|站上桌子高歌|站上桌子高歌|Cantando sobre la mesa"],["toast","건배 제의|Proposing a toast|乾杯の音頭|带头干杯|帶頭乾杯|Proponiendo un brindis"],["tamb","탬버린 신들림|Tambourine frenzy|タンバリン乱舞|疯狂摇铃鼓|瘋狂搖鈴鼓|Pandereta frenética"],["jacket","양복 상의 휘두르기|Swinging the jacket|上着を振り回す|甩西装外套|甩西裝外套|Girando la chaqueta"],["group","어깨동무 떼창|Arm-in-arm singalong|肩を組んで大合唱|搭肩大合唱|搭肩大合唱|Cantando abrazados"]]],
 ["trip","70·80 수학여행|70s-80s School Trip|70・80年代の修学旅行|七八十年代修学旅行|七八十年代修學旅行|Viaje escolar de los 70-80",[["cassette","카세트 메고 열창|Boombox on the shoulder|ラジカセを担いで熱唱|扛着录音机高歌|扛著錄音機高歌|Radiocasete al hombro"],["disco","교복 디스코|Uniform disco|制服でディスコ|校服迪斯科|制服迪斯可|Disco en uniforme"],["bus","관광버스 앞 단체사진|Group photo by the bus|観光バス前の集合写真|旅游大巴前合影|遊覽車前合照|Foto de grupo junto al autobús"],["temple","불국사 앞 기념사진|Photo at Bulguksa|仏国寺前で記念写真|佛国寺前留影|佛國寺前留影|Foto en Bulguksa"],["fire","캠프파이어|Campfire|キャンプファイヤー|篝火晚会|營火晚會|Fogata"],["gogo","고고장 춤|Go-go club dance|ゴーゴー喫茶で踊る|舞厅跳舞|舞廳跳舞|Baile go-go"]]],
 ["trot","트로트 여왕|Trot Queen|トロットの女王|Trot女王|Trot女王|Reina del trot",[["crown","왕관·꽃다발|Tiara & bouquet|ティアラと花束|皇冠与花束|皇冠與花束|Tiara y ramo"],["stairs","계단 등장|Grand staircase entrance|階段から登場|阶梯登场|階梯登場|Entrada por la escalera"],["confetti","우승 꽃가루|Winner's confetti|優勝の紙吹雪|夺冠彩带|奪冠彩帶|Confeti de campeón"],["fans","팬클럽 응원|Fan club cheering|ファンクラブの応援|粉丝团应援|粉絲團應援|Club de fans animando"],["duet","듀엣 무대|Duet stage|デュエットステージ|二重唱舞台|二重唱舞台|Dúo en el escenario"],["encore","앙코르 피날레|Encore finale|アンコールのフィナーレ|安可谢幕|安可謝幕|Final con bis"]]],
 ["sunny","학부모 뒤풀이|Parents' Reunion Party|保護者の打ち上げ|家长聚会|家長聚會|Fiesta de padres",[["shoulder","어깨동무 떼창|Arm-in-arm singalong|肩を組んで大合唱|搭肩大合唱|搭肩大合唱|Cantando abrazados"],["denim","청재킷 단체 포즈|Denim jacket group pose|デニムジャケットで集合ポーズ|牛仔夹克合体造型|牛仔夾克合體造型|Pose grupal con chaquetas vaqueras"],["dance","복고 댄스|Retro dance|レトロダンス|复古舞|復古舞|Baile retro"],["tears","웃다 울다|Laughing to tears|笑い泣き|笑出眼泪|笑出眼淚|Reír hasta llorar"],["selfie","단체 셀카|Group selfie|みんなで自撮り|集体自拍|團體自拍|Selfi de grupo"],["school","교복 추억|School uniform memories|制服の思い出|校服回忆|制服回憶|Recuerdos del uniforme"]]],
 ["roller","롤라장|Roller Rink|ローラースケート場|旱冰场|溜冰場|Pista de patinaje",[["skate","스케이트 열창|Skating & singing|滑りながら熱唱|边溜边唱|邊溜邊唱|Patinando y cantando"],["couple","손잡고 커플 타기|Couple skate|手をつないでカップル滑り|牵手双人滑|牽手雙人滑|Patinaje en pareja"],["dj","DJ 박스|DJ booth|DJブース|DJ台|DJ台|Cabina del DJ"],["train","기차놀이|Skating train|列車ごっこ|开火车|開火車|Trenecito"],["fall","꽈당!|Wipeout!|ずってん！|摔倒啦！|摔倒啦！|¡Caída!"],["pose","네온 포즈|Neon pose|ネオンでポーズ|霓虹造型|霓虹造型|Pose de neón"]]],
 ["xmas","크리스마스 특집|Christmas Special|クリスマス特集|圣诞特辑|聖誕特輯|Especial de Navidad",[["tree","트리 앞 열창|Singing by the tree|ツリーの前で熱唱|圣诞树前高歌|聖誕樹前高歌|Cantando junto al árbol"],["gift","선물 열기|Opening presents|プレゼントを開ける|拆礼物|拆禮物|Abriendo regalos"],["snow","눈 오는 창가|Snowy window|雪の窓辺|雪夜窗边|雪夜窗邊|Ventana nevada"],["santa","산타 변신|Santa makeover|サンタに変身|变身圣诞老人|變身聖誕老人|Disfrazado de Papá Noel"],["party","가족 파티|Family party|家族パーティー|家庭派对|家庭派對|Fiesta familiar"],["sled","눈썰매|Snow sled|雪そり|雪橇|雪橇|Trineo"]]]];
function Lp(t){ var a=String(t).split("|"), i=["ko","en","ja","zhs","zht","es"].indexOf(window.LANG); return a[i<0?1:i]||a[1]; }
function kTh(k){ for(var i=0;i<KTH_LIST.length;i++) if(KTH_LIST[i][0]===k) return KTH_LIST[i]; return null; }
function kThGet(){ var t=""; try{ t=sessionStorage.getItem("mpv_kth")||""; }catch(e){} return kTh(t)?t:""; }
function kThSet(t){ try{ if(t) sessionStorage.setItem("mpv_kth",t); else sessionStorage.removeItem("mpv_kth"); }catch(e){} }
function kEff(){ var t=kThGet(); return t?"th:"+t:kBgGet(); }   // 실제로 깔 배경 — 테마를 골랐으면 테마 그림   // KBGW = 처리·녹화 긴 쪽 픽셀 (10-31 640 → 1280 · 사장님 「사람이 흐릿하다」)
var KCV=null;   // 합성 중인 판
function kBgGet(){ var k="none"; try{ k=sessionStorage.getItem("mpv_kbg")||"none"; }catch(e){} return KBG_TX[k]?k:"none"; }
function kBgSet(k){ try{ sessionStorage.setItem("mpv_kbg",k); }catch(e){} }
// 🔴 10-30 폰 버그: GPU 로 돌면 사람 마스크가 비어 배경만 녹화되고 얼굴이 안 나옴 → CPU 먼저 (dl="CPU1" = CPU 만)
function kSegLoad(dl){ if(KSEG) return Promise.resolve(KSEG); if(KSEGP) return KSEGP;
  var mk=function(m,fs,dl){ return m.ImageSegmenter.createFromOptions(fs,{baseOptions:{modelAssetPath:KMP_M,delegate:dl},runningMode:"VIDEO",outputCategoryMask:false,outputConfidenceMasks:true}); };
  var on=function(d){ return function(x){ KSEGDL=d; return x; }; };
  KSEGP=import(KMP+"/vision_bundle.mjs").then(function(m){ return m.FilesetResolver.forVisionTasks(KMP+"/wasm").then(function(fs){ var c=mk(m,fs,"CPU").then(on("CPU")); return dl==="CPU1"?c:c.catch(function(){ return mk(m,fs,"GPU").then(on("GPU")); }); }); })   // CPU 먼저, 안 되면 GPU
    .then(function(s){ KSEG=s; return s; }); KSEGP.catch(function(){ KSEGP=null; }); return KSEGP; }
function kBgFail(){ kBgSet("none"); kThSet(""); if(KCV) KCV.k="none"; kBgRow(false); soon(L(TX.bgNo)); }
// 마스크가 1초 넘게 비면 — GPU 였으면 CPU 로 다시 만들어 보고, 그래도 비면 「흐리게」(가운데 얼굴은 또렷하게) + 안내. 얼굴 없이 배경만 녹화되는 일이 없게
function kSegEmpty(g){ g.e0=0; g.mask=false;
  if(KSEGDL!=="CPU"&&!g.cpuT){ g.cpuT=1; var o=KSEG; KSEG=null; KSEGP=null; try{ o&&o.close&&o.close(); }catch(e){} kSegLoad("CPU1").catch(function(){ if(KCV===g) kSegEmpty(g); }); return; }
  g.bad=1; g.k="blur"; kBgSet("blur"); kThSet(""); kBgRow(false); soon(L(TX.bgNo)); }
// 배경 그림 한 장을 판 크기에 맞춰 cover 로 미리 깔아 둔다 (매 프레임 다시 자르지 않게)
function kBgPrep(k){ var g=KCV; if(!g) return; g.k=k; g.img=null; g.bad=0; g.e0=0; var f=null; KBG_LIST.forEach(function(x){ if(x[0]===k) f=x[1]; }); if(/^th:/.test(k)&&kTh(k.slice(3))) f="th_"+k.slice(3)+".jpg"; if(!f) return;
  var im=new Image(); im.onload=function(){ if(KCV!==g||g.k!==k) return; var W=g.w, H=g.h, s=Math.max(W/im.naturalWidth,H/im.naturalHeight), w=im.naturalWidth*s, h=im.naturalHeight*s;
    g.bx.clearRect(0,0,W,H); kCvSoftDraw(g.bx,im,(W-w)/2,(H-h)/2,w,h,W,H); g.avg=kCvAvg(g.bc); g.img=1; }; im.onerror=function(){ if(KCV===g&&g.k===k) kBgFail(); }; im.src="img/kara/"+f; }
// (10-31 화질) 그림 배경은 살짝 흐리게(초점 아웃 2~3px) — canvas filter 가 되면 blur, 안 되면(아이폰) 반 크기로 줄였다 늘리기
function kCvFil(x){ try{ x.filter="blur(1px)"; var ok=x.filter==="blur(1px)"; x.filter="none"; return ok; }catch(e){ return false; } }
function kCvSoftDraw(x,im,dx,dy,w,h,W,H){ var r=Math.max(W,H)/1280;
  if(kCvFil(x)){ x.filter="blur("+(2.5*r).toFixed(2)+"px)"; x.drawImage(im,dx-8,dy-8,w+16,h+16); x.filter="none"; return; }
  var t=mkc0(Math.max(8,Math.round(W/2.5)),Math.max(8,Math.round(H/2.5))), q=t.getContext("2d"); q.imageSmoothingEnabled=true; q.drawImage(im,dx/2.5,dy/2.5,w/2.5,h/2.5); x.imageSmoothingEnabled=true; x.drawImage(t,0,0,W,H); }
function kCvAvg(c){ try{ var t=mkc0(1,1), q=t.getContext("2d"); q.imageSmoothingEnabled=true; q.drawImage(c,0,0,1,1); var d=q.getImageData(0,0,1,1).data; return "rgb("+d[0]+","+d[1]+","+d[2]+")"; }catch(e){ return ""; } }
// 필름 그레인(256 칸 무늬, 매 프레임 자리 옮김) + 비네트 — 합성 판에 그리므로 녹화 영상에도 들어간다 (사람·배경 공통 한 겹)
function kCvFx(g){ var W=g.w, H=g.h;
  if(!g.gr){ g.gr=mkc0(256,256); var q=g.gr.getContext("2d"), id=q.createImageData(256,256), d=id.data; for(var i=0;i<d.length;i+=4){ var v=Math.random()*255|0; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; } q.putImageData(id,0,0); g.grp=null; }
  if(!g.vg){ g.vg=mkc0(W,H); var y=g.vg.getContext("2d"), rg=y.createRadialGradient(W/2,H/2,Math.min(W,H)*0.42,W/2,H/2,Math.hypot(W,H)*0.56); rg.addColorStop(0,"rgba(0,0,0,0)"); rg.addColorStop(1,"rgba(0,0,0,0.32)"); y.fillStyle=rg; y.fillRect(0,0,W,H); }
  var x=g.x; if(!g.grp) g.grp=x.createPattern(g.gr,"repeat");
  x.save(); x.globalAlpha=0.045; x.globalCompositeOperation="overlay"; x.translate(-(Math.random()*256|0),-(Math.random()*256|0)); x.fillStyle=g.grp; x.fillRect(0,0,W+256,H+256); x.restore();
  x.drawImage(g.vg,0,0); }
window.karCvStat=function(){ var g=KCV; return g?{w:g.w,h:g.h,ms:+(g.ft||0).toFixed(2),seg:+(g.stT||0).toFixed(2),skip:g.skip||1,n:g.stN||0,max:+(g.stM||0).toFixed(1),dl:KSEGDL,fil:!!g.fil}:null; };   // 시험용 — 프레임 처리 시간
// 합성 판 만들기 — 카메라 video(v) 크기가 정해진 뒤에 부른다. 돌려주는 값 = 녹화할 스트림(합성 영상+마이크)
function kCvOn(pl,v,st,k){ kCvOff(); var vw=v.videoWidth||1280, vh=v.videoHeight||720, r=KBGW/Math.max(vw,vh), W=Math.round(vw*r/2)*2, H=Math.round(vh*r/2)*2;
  var mkc=function(w,h){ var c=document.createElement("canvas"); c.width=w; c.height=h; return c; };
  var c=mkc(W,H); c.className="kcam kcvs"; pl.insertBefore(c,v.nextSibling); v.classList.add("khid");
  var g=KCV={c:c,x:c.getContext("2d"),v:v,raf:0,n:0,k:"none",w:W,h:H,mask:false,img:null,
    fc:mkc(W,H),pc:mkc(W,H),bc:mkc(W,H),sc:mkc(Math.max(8,Math.round(W/16)),Math.max(8,Math.round(H/16))),mc:mkc(8,8),md:null,
    qc:mkc(Math.max(16,Math.round(W*KSEGIN/Math.max(W,H))),Math.max(16,Math.round(H*KSEGIN/Math.max(W,H)))),skip:1,ft:0,mp:null};   // qc = 사람 찾기용 작은 판
  g.fx=g.fc.getContext("2d"); g.px=g.pc.getContext("2d"); g.bx=g.bc.getContext("2d"); g.sx=g.sc.getContext("2d"); g.mx=g.mc.getContext("2d"); g.qx=g.qc.getContext("2d"); g.fil=kCvFil(g.px);
  kBgPrep(k); if(k!=="none") kBgSeg();
  var fr=function(){ if(KCV!==g) return; g.raf=requestAnimationFrame(fr); try{ kCvDraw(g); }catch(e){} }; g.raf=requestAnimationFrame(fr);
  var cs=c.captureStream?c.captureStream(30):null; if(!cs) return null; g.cs=cs;
  return new MediaStream(cs.getVideoTracks().concat(st.getAudioTracks())); }
function kCvOff(){ var g=KCV; KCV=null; if(!g) return; cancelAnimationFrame(g.raf); try{ g.cs&&g.cs.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} if(g.c.parentNode) g.c.remove(); try{ g.v.classList.remove("khid"); }catch(e){} }
function kBgSeg(){ kSegLoad().catch(function(){ if(KCV&&KCV.k!=="none") kBgFail(); }); }
// 한 프레임 — ① 카메라 → fc ② 사람 마스크(매 프레임, 느리면 2프레임에 1번 · 앞 프레임과 섞음) ③ 배경(그림/흐린 카메라) ④ 사람(마스크로 오린 카메라) · 사람과 흐린 배경은 거울로, 그림 배경은 바로
function mkc0(w,h){ var c=document.createElement("canvas"); c.width=w; c.height=h; return c; }
function kCvDraw(g){ var v=g.v, W=g.w, H=g.h, x=g.x; if(v.readyState<2) return; var t0=performance.now();
  g.fx.drawImage(v,0,0,W,H);
  var mir=function(src){ x.save(); x.translate(W,0); x.scale(-1,1); x.drawImage(src,0,0,W,H); x.restore(); };
  var blr=function(){ g.sx.drawImage(g.fc,0,0,g.sc.width,g.sc.height); x.imageSmoothingEnabled=true; mir(g.sc); };   // 작게 줄였다 늘리면 흐려진다 (아이폰은 canvas filter 가 없어서)
  var soft=function(){ blr(); if(!g.vc){ g.vc=mkc0(W,H); var q=g.vc.getContext("2d"), rg=q.createRadialGradient(W/2,H*0.45,Math.min(W,H)*0.22,W/2,H*0.45,Math.max(W,H)*0.55); rg.addColorStop(0,"rgba(0,0,0,1)"); rg.addColorStop(1,"rgba(0,0,0,0)"); q.fillStyle=rg; q.fillRect(0,0,W,H); }
    var p=g.px; p.globalCompositeOperation="copy"; p.drawImage(g.vc,0,0); p.globalCompositeOperation="source-in"; p.drawImage(g.fc,0,0); p.globalCompositeOperation="source-over"; mir(g.pc); };   // 마스크 없이 흐리게 — 가운데(얼굴)는 또렷하게
  var end=function(){ var dt=performance.now()-t0; g.ft=g.ft?g.ft*0.9+dt*0.1:dt; g.stN=(g.stN||0)+1; if(dt>(g.stM||0)) g.stM=dt;
    if(g.ft>33&&g.skip===1) g.skip=2; else if(g.ft<20&&g.skip===2) g.skip=1; };   // (10-31) 프레임 처리 33ms 넘으면 사람 찾기를 2프레임에 1번으로, 여유 생기면 다시 매 프레임
  if(g.k==="none"){ mir(g.fc); return; }   // 없음 = 카메라 그대로
  if(g.bad){ soft(); kCvFx(g); return end(); }
  if(!KSEG){ blr(); return; }   // 모델 불러오는 동안 = 화면 전체 흐리게 (뒤가 첫 순간에도 안 보이게)
  g.n++; if(g.n%g.skip===0||!g.mask){ var s0=performance.now(); try{ g.qx.drawImage(g.fc,0,0,g.qc.width,g.qc.height);
      KSEG.segmentForVideo(g.qc,performance.now(),function(res){ var m=res&&res.confidenceMasks&&res.confidenceMasks[0]; if(!m) return;
      var a=m.getAsFloat32Array(), mw=m.width, mh=m.height, n=a.length; if(g.mc.width!==mw||g.mc.height!==mh){ g.mc.width=mw; g.mc.height=mh; g.md=null; }
      if(!g.md){ g.md=g.mx.createImageData(mw,mh); for(var k=0;k<g.md.data.length;k+=4) g.md.data[k]=g.md.data[k+1]=g.md.data[k+2]=255; }
      if(!g.mp||g.mp.length!==n) g.mp=new Float32Array(a);   // 앞 프레임 마스크 (시간 섞기용)
      var d=g.md.data, pv=g.mp, i, q, sm=0;
      for(i=0;i<n;i++){ q=a[i]; sm+=q; q=q*0.6+pv[i]*0.4; pv[i]=q;   // (10-31) 새 마스크 6 : 앞 마스크 4 — 테두리 지글거림(정전기) 줄임
        q=(q-0.35)/0.4; q=q<0?0:q>1?1:q; d[i*4+3]=q*q*(3-2*q)*255; }   // smoothstep 0.35~0.75 — 경계가 부드럽게
      g.mx.putImageData(g.md,0,0); g.mask=true;
      if(sm/(n||1)<0.02){ if(!g.e0) g.e0=performance.now(); } else g.e0=0; }); }   // 마스크 평균이 거의 0 = 사람을 못 찾음
    catch(e){ kBgFail(); mir(g.fc); return; } var sd=performance.now()-s0; g.stT=g.stT?g.stT*0.9+sd*0.1:sd; }
  if(!g.mask){ blr(); return; }   // 첫 마스크 나오기 전 = 흐리게
  if(g.e0){ if(performance.now()-g.e0>1000) kSegEmpty(g); soft(); kCvFx(g); return end(); }   // 마스크가 비는 동안 = 얼굴 또렷한 흐리게 (배경만 녹화 막기)
  if(g.k==="blur") blr();
  else if(g.img) x.drawImage(g.bc,0,0); else blr();   // 그림 아직 안 왔으면 흐리게
  var p=g.px; p.globalCompositeOperation="copy"; p.imageSmoothingEnabled=true; if(g.fil) p.filter="blur("+(1.2*Math.max(W,H)/1280).toFixed(2)+"px)";   // 경계 살짝 번지게 (작은 마스크를 늘리면서 한 번 더)
  p.drawImage(g.mc,0,0,W,H); if(g.fil) p.filter="none"; p.globalCompositeOperation="source-in"; p.drawImage(g.fc,0,0);
  if(g.k!=="blur"&&g.img&&g.avg){ p.globalCompositeOperation="source-atop"; p.globalAlpha=0.12; p.fillStyle=g.avg; p.fillRect(0,0,W,H); p.globalAlpha=1; }   // (10-31) 사람 색을 배경 평균 색에 12% 맞춤 — 합성 티 줄임
  p.globalCompositeOperation="source-over";
  mir(g.pc); kCvFx(g); end(); }
// 녹화기 — 카메라 스트림 또는 합성 스트림을 받아 녹화 시작 (다시 시작할 때도 씀)
function recMr(ms,st){ var mt=["video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].filter(function(x){ try{ return MediaRecorder.isTypeSupported(x); }catch(e){ return false; } })[0]||"";
  REC.ch=[]; REC.mt=mt; try{ REC.mr=mt?new MediaRecorder(ms,{mimeType:mt}):new MediaRecorder(ms); }catch(e){ return false; }
  REC.mr.ondataavailable=function(e){ if(e.data&&e.data.size) REC.ch.push(e.data); }; REC.mr.onstop=recDone; REC.mr.start(1000); REC.t0=Date.now();
  REC.frc=null; clearTimeout(REC.frt); REC.frt=setTimeout(kFrGrab,1500);   // 상황 사진용 = 합성 전 카메라 장면 한 장 (이 기기 안에만, 「상황 사진 만들기」를 눌러야 보냄)
  kScStart(st); recFx(true); return true; }   // 점수는 원래 마이크 스트림(st)으로
function kFrGrab(){ var b=box(), v=b&&b.querySelector("video.kcam"); if(!v||v.readyState<2||!v.videoWidth) return false;
  var s=Math.min(1,768/Math.max(v.videoWidth,v.videoHeight)), w=Math.round(v.videoWidth*s), h=Math.round(v.videoHeight*s), c=mkc0(w,h), x=c.getContext("2d");
  x.translate(w,0); x.scale(-1,1); x.drawImage(v,0,0,w,h); REC.frc=c; return true; }   // 거울로 (화면에서 본 대로)
// 배경 단추(오른쪽 위 둥근 그림) + 아래 썸네일 한 줄 — 사장님 기기 녹화 화면 안에서만
function kBgBtn(pl){ if(pl.querySelector(".kbgb")) return; var bt=document.createElement("button"); bt.type="button"; bt.className="kbgb"; bt.setAttribute("aria-label",L(TX.bgT)); bt.innerHTML='<img src="img/kara/kst_bg.png" alt="">';
  bt.onclick=function(e){ e.stopPropagation(); kBgRow(!pl.querySelector(".kbgr:not(.kthr)")); }; pl.appendChild(bt);
  var tb=document.createElement("button"); tb.type="button"; tb.className="kbgb kthb"; tb.setAttribute("aria-label",L(TX.thT)); tb.innerHTML='<img src="img/kara/kst_theme.png" alt="">';   // 테마방 단추 (10-30) — 배경 단추 바로 아래
  tb.onclick=function(e){ e.stopPropagation(); kThRow(!pl.querySelector(".kthr")); }; pl.appendChild(tb); }
// 테마 한 줄 — 「없음」 + 테마 7개 (배경 줄과 같은 모양, 한 번에 하나만 열림)
function kThRow(on){ var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl) return; kBgRow(false); if(!on) return;
  var cur=kThGet(), r=document.createElement("div"); r.className="kbgr kthr";
  r.innerHTML='<button type="button" data-kth=""'+(!cur?' class="kon"':'')+'><i><b></b></i>'+esc(L(TX.bgNone))+'</button>'+KTH_LIST.map(function(x){ return '<button type="button" data-kth="'+x[0]+'"'+(x[0]===cur?' class="kon"':'')+'><i><b style="background-image:url(img/kara/th_'+x[0]+'.jpg)"></b></i>'+esc(Lp(x[1]))+'</button>'; }).join("");
  r.onclick=function(e){ var t=e.target.closest&&e.target.closest("[data-kth]"); e.stopPropagation(); if(!t) return; kThPick(t.getAttribute("data-kth")); };
  pl.appendChild(r); }
function kThPick(t){ kThSet(t); kBgRow(false); kBgApply(t?"th:"+t:kBgGet()); }
function kBgRow(on){ var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl) return; var r=pl.querySelector(".kbgr"); if(r) r.remove(); if(!on) return;
  var cur=kThGet()?"":kBgGet(); r=document.createElement("div"); r.className="kbgr";
  r.innerHTML=KBG_LIST.map(function(x){ var f=x[1]||(x[0]==="blur"?"bg_stage.jpg":""); return '<button type="button" data-kbg="'+x[0]+'"'+(x[0]===cur?' class="kon"':'')+'><i><b'+(x[0]==="blur"?' class="kbl"':'')+(f?' style="background-image:url(img/kara/'+f+')"':'')+'></b></i>'+esc(L(TX[KBG_TX[x[0]]]))+'</button>'; }).join("");
  r.onclick=function(e){ var t=e.target.closest&&e.target.closest("[data-kbg]"); e.stopPropagation(); if(!t) return; kBgPick(t.getAttribute("data-kbg")); };
  pl.appendChild(r); }
function kBgPick(k){ kBgSet(k); kThSet(""); kBgRow(false); kBgApply(k); }   // 배경을 고르면 테마는 끔
function kBgApply(k){ if(REC.nat){ kNatBg(k); return; }   // 앱 녹화 (10-31)
  var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl||!REC.st) return;
  if(KCV){ kBgPrep(k); if(k!=="none") kBgSeg(); return; }   // 이미 합성 중 = 바로 바꿈 (녹화 그대로 이어짐)
  if(k==="none") return;
  var v=pl.querySelector("video.kcam"); if(!v||!(window.HTMLCanvasElement&&HTMLCanvasElement.prototype.captureStream)){ kBgFail(); return; }   // 카메라 그대로 녹화 중 → 합성으로 바꾸고 녹화를 처음부터 다시 (녹화기 영상 줄은 도중에 못 바꿈)
  var go=function(){ if(!REC.st||KCV) return; var ms=kCvOn(pl,v,REC.st,k); if(!ms){ kCvOff(); kBgFail(); return; }
    if(REC.mr&&REC.mr.state!=="inactive"){ REC.mr.onstop=null; REC.mr.ondataavailable=null; try{ REC.mr.stop(); }catch(e){} REC.mr=null; if(!recMr(ms,REC.st)){ soon(L(TX.recNo)); recExit(); } } };
  if(v.videoWidth) go(); else v.addEventListener("loadedmetadata",go,{once:true}); }
function camOff(){ kScStop(); kCvOff(); kNatOff(); try{ if(REC.st) REC.st.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} REC.st=null; var b=box(); if(!b) return; [].forEach.call(b.querySelectorAll(".kcam,.kbgb,.kbgr"),function(x){ x.remove(); }); }
function recExit(){ camOff(); recFx(false); var b=box(); if(!b) return; b.classList.remove("krecm"); var k=b.querySelector(".krec"); if(k) k.textContent=L(TX.rec); }
// ── StageSong 전용 앱 녹화 (10-31) — 앱 안이면 카메라·사람 오려내기·배경 합성·녹화를 앱(네이티브 StageCam)이 한다 · 웹은 녹화 칸을 투명하게 비워 앱 화면이 비쳐 보이게 · 웹판(브라우저)은 위 그대로
//   소리 크기는 앱이 0.1초마다 보내 줌(level) → KSC.d 에 그대로 쌓아 점수·소리 막대가 웹판과 같게 · 끝나면 mp4 를 받아 REC.blob 흐름(미리 보기·올리기·상황 사진)에 그대로 넣는다
function kNat(){ try{ var C=window.Capacitor; return C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.StageCam||null; }catch(e){ return null; } }
var KNL=[];   // 앱 이벤트 듣기 핸들
function kNatBgv(k){ if(!k||k==="none") return null; if(k==="blur") return "blur"; var f=""; KBG_LIST.forEach(function(x){ if(x[0]===k) f=x[1]; }); if(/^th:/.test(k)&&kTh(k.slice(3))) f="th_"+k.slice(3)+".jpg"; return f?new URL("img/kara/"+f,location.href).href:null; }   // 앱에 넘길 배경 = 그림 전체 주소 · 흐림 · 없음(null)
function kNatRect(){ var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl) return null; var r=pl.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; }
function kNatRs(){ var P=kNat(), r=kNatRect(); if(P&&REC.nat&&r) P.setRect({rect:r}).catch(function(){}); }
function kNatCss(){ if(document.getElementById("kstnCss")) return; var s=document.createElement("style"); s.id="kstnCss"; s.textContent="html.kstn,html.kstn body{background:transparent!important}html.kstn body>*:not(#karBox){visibility:hidden!important}html.kstn #karBox,html.kstn #karBox .kin,html.kstn #karBox .kpl,html.kstn #karBox .kcam.knv{background:transparent!important}html.kstn #karBox::before{display:none}"; document.head.appendChild(s); }   // 앱 화면이 비치도록 녹화 칸까지 투명
function kNatUn(){ KNL.forEach(function(h){ Promise.resolve(h).then(function(x){ x&&x.remove&&x.remove(); }).catch(function(){}); }); KNL=[]; }
function kNatBg(k){ var P=kNat(); REC.nk=k; if(P&&REC.nat) P.setBackground({bg:kNatBgv(k)}).catch(function(){}); }   // 녹화 도중 배경 바꿔도 녹화는 그대로 이어짐
function kNatOff(){ if(!REC.nat) return; REC.nat=0; kNatUn(); window.removeEventListener("resize",kNatRs); document.documentElement.classList.remove("kstn"); var P=kNat(); if(P) P.close().catch(function(){}); }
function kNatStart(b,pl){ var P=kNat(); kAC(); REC.sc=null; var k=kEff();
  kNatCss(); document.documentElement.classList.add("kstn"); var d=document.createElement("div"); d.className="kcam knv"; pl.insertBefore(d,pl.firstChild); kBgBtn(pl); REC.nat=1; REC.nst=0; REC.nk=k;
  kNatUn(); [["level",function(e){ var q=KSC; if(!q||!q.nat) return; q.n++; q.d.push(e.db); if(e.pk>0.985) q.c2=(q.c2||0)+1; }],["bgfail",function(){ kBgFail(); kNatBg("none"); }],["segfail",function(){ soon(L(TX.bgNo)); }]].forEach(function(x){ KNL.push(P.addListener(x[0],x[1])); });
  window.addEventListener("resize",kNatRs);
  P.start({bg:kNatBgv(k),facing:"user",rect:kNatRect()}).then(function(){ if(!REC.nat||!b.classList.contains("krecm")||!box()){ kNatOff(); return; }
    kScStop(); KSC={nat:1,t0:Date.now(),n:0,d:[],c2:0,iv:0}; REC.t0=Date.now(); REC.frc=null; recFx(true); setTimeout(kNatRs,300); try{ ntap("kara_rec","tap"); }catch(e){} })   // KSC = 웹판 점수 판과 같은 모양 (d = dB 기록)
  .catch(function(){ kNatOff(); soon(L(TX.recNo)); recExit(); }); }
function kNatBlob(P,r){ var u=window.Capacitor.convertFileSrc?window.Capacitor.convertFileSrc(r.path):"";   // 앱 파일 → Blob (안 되면 조각조각 읽기)
  var rd=function(){ var parts=[], off=0, nx=function(){ return P.read({path:r.path,offset:off,length:2097152}).then(function(x){ var s=atob(x.data||""), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); parts.push(a); off+=a.length; return x.eof||!a.length?new Blob(parts,{type:"video/mp4"}):nx(); }); }; return nx(); };
  return (u?fetch(u).then(function(x){ if(!x.ok) throw 0; return x.blob(); }).then(function(bl){ if(!bl.size) throw 0; return bl; }):Promise.reject(0)).catch(rd); }
function kNatStop(){ var P=kNat(); if(!P||REC.nst) return; REC.nst=1;
  P.stop().then(function(r){ return kNatBlob(P,r).then(function(bl){ REC.ch=[bl]; REC.mt="video/mp4";
      if(r.frame) return new Promise(function(ok){ var im=new Image(); im.onload=function(){ var c=mkc0(im.naturalWidth,im.naturalHeight); c.getContext("2d").drawImage(im,0,0); REC.frc=c; ok(); }; im.onerror=function(){ ok(); }; im.src=r.frame; }); }); })   // 상황 사진용 장면 = 앱이 1.5초 때 찍어 둔 합성 전 카메라(거울)
  .then(function(){ REC.nst=0; recDone(); }).catch(function(){ REC.nst=0; soon(L(TX.recNo)); recExit(); }); }
function recStart(){ var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl) return;
  if(kNat()){ kNatStart(b,pl); return; }   // 전용 앱 = 앱이 녹화 (10-31)
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)){ soon(L(TX.recNo)); recExit(); return; }
  kAC(); REC.sc=null;   // 아이폰은 누른 순간에 소리판을 깨워야 점수 재기·팡파레가 된다
  var k=kEff(); if(k!=="none") kSegLoad().catch(function(){});   // 배경 골라 뒀으면 카메라 허락 받는 동안 미리 불러옴
  navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(st){
    if(!b.classList.contains("krecm")||!box()){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
    REC.st=st; var v=document.createElement("video"); v.className="kcam"; v.muted=true; v.autoplay=true; v.playsInline=true; v.setAttribute("playsinline",""); v.srcObject=st; pl.insertBefore(v,pl.firstChild); try{ v.play(); }catch(e){}
    kBgBtn(pl);
    var go=function(){ if(REC.st!==st) return; var ms=st;
      if(k!=="none"&&window.HTMLCanvasElement&&HTMLCanvasElement.prototype.captureStream){ ms=kCvOn(pl,v,st,k); if(!ms){ kCvOff(); kBgFail(); ms=st; } }
      if(!recMr(ms,st)){ soon(L(TX.recNo)); recExit(); return; } try{ ntap("kara_rec","tap"); }catch(e){} };
    if(k==="none"||v.videoWidth) go(); else v.addEventListener("loadedmetadata",go,{once:true});   // 합성 판 크기는 카메라 크기를 안 뒤에 정한다
  }).catch(function(){ soon(L(TX.recNo)); recExit(); }); }
function recStop(){ try{ K.pl&&K.pl.pauseVideo&&K.pl.pauseVideo(); }catch(e){}   // 녹화 끝 = 노래도 멈춤 (사장님 10-30)
 if(REC.nat){ kNatStop(); return; }   // 앱 녹화 (10-31)
 if(REC.mr&&REC.mr.state!=="inactive") REC.mr.stop(); else recExit(); }
function recDone(){ var blob=new Blob(REC.ch,{type:(REC.mt||"video/webm").split(";")[0]}); REC.blob=blob; clearTimeout(REC.frt); if(!REC.frc) kFrGrab(); var _ek=KCV?KCV.k:(REC.nat&&REC.nk||""); REC.th=/^th:/.test(_ek)&&kTh(_ek.slice(3))?_ek.slice(3):"";   /* 앱 녹화 = REC.nk (10-31) */ REC.aiCard=null; REC.dur=REC.t0?Math.round((Date.now()-REC.t0)/1000):0; REC.sc=KSC?kScCalc(KSC,REC.dur):null; REC.t0=0; REC.mr=null; REC.ch=[]; camOff(); recFx(false); var b=box(); if(!b) return;
  if(REC.url) try{ URL.revokeObjectURL(REC.url); }catch(e){} REC.url=URL.createObjectURL(blob);
  var o=document.createElement("div"); o.className="kpm kpv"; b.appendChild(o);
  o.innerHTML='<div><h3>'+esc(L(TX.pvT))+'</h3>'+(REC.sc!=null?'<div class="kpvs">♪ '+esc(L(TX.scT))+' <b>'+REC.sc+'</b>'+esc(L(TX.scPt))+'</div>':'')+'<video controls playsinline src="'+REC.url+'"></video><p class="km">'+esc(L(TX.pvN2))+'</p>'+(REC.th&&REC.frc?'<button type="button" class="kaib" data-kai="1"><img src="img/kara/kst_theme.png" alt="">'+esc(L(TX.aiMk))+'</button>':'')+'<button type="button" class="kaib kaiv" data-kaiv="1"><img src="img/kara/kst_vid.png" alt="">'+esc(L(TX.aivMk))+'</button><button type="button" class="kupb" data-kup="1">'+esc(L(TX.up))+'</button><button type="button" class="krf" data-rt="1">'+esc(L(TX.retk))+'</button><button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
  var pvV=o.querySelector("video"); if(pvV) try{ pvV.poster=REC.frc&&REC.frc.toDataURL?REC.frc.toDataURL("image/jpeg",0.85):"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }catch(e){}   // 회색 재생 그림(늘어나 찌그러짐) 대신 녹화 때 찍어 둔 장면, 없으면 검은 1점 그림 (사장님 10-31)
  var bye=function(){ o.remove(); try{ URL.revokeObjectURL(REC.url); }catch(e){} REC.url=""; REC.blob=null; REC.sc=null; REC.frc=null; REC.th=""; REC.aiCard=null; REC.aiv=""; [].forEach.call(b.querySelectorAll(".kupm,.kaim"),function(u){ u.remove(); }); };
  var ab=o.querySelector("[data-kai]"); if(ab) ab.onclick=kAiOpen;
  var avb=o.querySelector("[data-kaiv]"); if(avb){ kAivCss(); avb.onclick=kAivOpen; }   // AI 영상 (10-31)
  o.querySelector(".kc").onclick=function(){ bye(); recExit(); };
  o.querySelector("[data-rt]").onclick=function(){ bye(); kzReset(); b.classList.add("krecm"); recStart(); };
  if(REC.sc!=null) kScShow(b,REC.sc); }
window.addEventListener("pagehide",function(){ try{ if(REC.mr&&REC.mr.state!=="inactive") REC.mr.stop(); }catch(e){} camOff(); });
// 가요무대(모두의 노래 피드) · 내 스테이지(내가 올린 노래) (사장님 10-30 「노래방의 페이스북·유튜브」)
//   허브 /kst/list 목록·크게 재생·지우기(내 것)·내 노래 올리기 — 보기는 누구나, 올리기·팔로우·댓글 등은 로그인
// (10-31 출시판) 사장님 기기 구분(mp_owner·x-kown) 폐지 — 모든 기능 누구나 · 계정이 필요한 일은 로그인 창을 띄운다(kLogin)
function kLogin(after){ signIn(); var p=document.getElementById("pgBox"); if(!p||!after||!window.MutationObserver) return;
  var mo=new MutationObserver(function(){ if(!p.hidden) return; mo.disconnect(); if(sess()) setTimeout(after,200); }); mo.observe(p,{attributes:true,attributeFilter:["hidden"]}); }
function kLoc(){ return {ko:"ko-KR",en:"en-US",ja:"ja-JP",zhs:"zh-CN",zht:"zh-TW",es:"es-ES"}[window.LANG]||"en-US"; }
function kDate(t){ try{ return new Date(t).toLocaleString(kLoc(),{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
// 「내 노래 올리기」 — 녹화 중이면 녹화를 끝내 미리 보기부터 · 방금 찍은 녹화가 있으면 올리기 창 · 없으면 안내
function upStart(){ if(REC.mr&&REC.mr.state!=="inactive"){ recStop(); return; } if(!REC.blob){ soon(L(TX.needRec)); return; } if(!sess()){ soon(L(TX.lgReq)); kLogin(upOpen); return; } upOpen(); }
function upOpen(){ var b=box(); if(!b||!REC.blob) return; var o=b.querySelector(".kupm"); if(o) o.remove();
  o=document.createElement("div"); o.className="kpm kupm"; b.appendChild(o);
  var vis="pub", busy=false, xhr=null, by0="", rms=null, rsel={};
  var cc=KCH&&KCH.cur&&KCH.cur.live&&K.cur&&K.cur.id===KCH.cur.sid?KCH.cur:null, chOn=!!cc, rx=K.ctx&&K.ctx.rl&&K.cur&&K.cur.id===K.ctx.sid?K.ctx:null, rlOn=!!rx;   // (10-31) 챌린지 곡이면 「챌린지 참여」 자동 체크 · 릴레이 도전이면 「릴레이 게시」(이 방에만)
  var rlH=function(){ return rx?'<label class="kfr"><input type="checkbox" id="kupRl"'+(rlOn?' checked':'')+'>'+kIc("relay",1)+'<span>'+esc(L(TX.rlPost))+'</span></label>'+(rlOn?'<p class="km">'+esc(L(TX.rlPostN))+'</p>':''):''; };
  var chH=function(){ return cc&&!rlOn?'<label class="kfr"><input type="checkbox" id="kupCh"'+(chOn&&vis==="pub"?' checked':'')+(vis!=="pub"?' disabled':'')+'>'+kIc("chal",1)+'<span>'+esc(L(TX.chJoin))+' · '+esc(kChTtl(cc))+'</span></label>'+(vis!=="pub"?'<p class="km">'+esc(L(TX.chVisN))+'</p>':''):''; }; try{ by0=localStorage.getItem("mpv_kst_by")||""; }catch(e){} if(!/^\d{4}$/.test(by0)) by0="";
  var draw=function(msg,pct){ var s=pct!=null;
    o.innerHTML='<div><h3>'+esc(L(TX.up))+'</h3>'
      +rlH()+(rlOn?'':'<b class="kh">'+esc(L(TX.vis))+'</b><div class="kchips">'+[["pub","pub",TX.vPub],["fol","folonly",TX.vFol],["room","!krm_song",TX.vwRoom],["me","lock",TX.vMe]].map(function(c){ return '<button type="button" data-v="'+c[0]+'"'+(vis===c[0]?' class="on"':'')+'>'+kIc(c[1])+'<span>'+esc(L(c[2]))+'</span></button>'; }).join("")+'</div>'
      +'<p class="km">'+esc(L(vis==="pub"?TX.vPubN:vis==="fol"?TX.vFolN:vis==="room"?TX.vRoomN:TX.vMeN))+'</p>'
      +(vis!=="room"?'':rms===null?'<p class="km">'+esc(L(TX.lo))+'</p>':!rms.length?'<p class="km">'+esc(L(TX.rmNone))+'</p>'
        :'<div class="kchk">'+rms.map(function(r,i){ return '<label><input type="checkbox" data-r="'+i+'"'+(rsel[r.rid]?' checked':'')+'>'+kIc("room",1)+'<span>'+esc(r.name)+'</span><small>'+esc(tf(L(TX.rmN),{n:r.count}))+'</small></label>'; }).join("")+'</div>'))+chH()
      +(by0?'':'<label class="kfl">'+esc(L(TX.by))+'<input type="text" inputmode="numeric" maxlength="4" id="kupBy" autocomplete="bday-year"></label><p class="km">'+esc(L(TX.byN))+'</p>')
      +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
      +(s?'<div class="kupbar"><i style="width:'+pct+'%"></i></div><div class="kupp">'+esc(tf(L(TX.upIng),{p:pct}))+'</div>':'')
      +'<button type="button" class="kgo" id="kupGo"'+(s?' disabled':'')+'>'+esc(L(TX.upGo))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    [].forEach.call(o.querySelectorAll("[data-v]"),function(x){ x.onclick=function(){ if(busy) return; vis=x.dataset.v; re();
      if(vis==="room"&&rms===null) kGet("/kst/rooms").then(function(j){ rms=(j&&j.ok&&j.items)||[]; if(rms.length===1) rsel[rms[0].rid]=1; if(o.isConnected&&!busy) re(); }).catch(function(){ rms=[]; if(o.isConnected&&!busy) re(); }); }; });
    [].forEach.call(o.querySelectorAll("[data-r]"),function(c){ c.onchange=function(){ var r=rms&&rms[+c.dataset.r]; if(!r) return; if(c.checked) rsel[r.rid]=1; else delete rsel[r.rid]; }; });
    var rlc=o.querySelector("#kupRl"); if(rlc) rlc.onchange=function(){ rlOn=rlc.checked; re(); };
    var chc=o.querySelector("#kupCh"); if(chc) chc.onchange=function(){ chOn=chc.checked; };
    o.querySelector(".kc").onclick=function(){ if(xhr){ try{ xhr.abort(); }catch(e){} } o.remove(); };
    o.querySelector("#kupGo").onclick=go; };
  var re=function(){ var by=o.querySelector("#kupBy"), keep=by?by.value:""; draw(); var by2=o.querySelector("#kupBy"); if(by2) by2.value=keep; };   // 생년 칸 값 지키며 다시 그림
  var bar=function(p){ var i=o.querySelector(".kupbar i"), t=o.querySelector(".kupp"); if(!i){ draw("",p); return; } i.style.width=p+"%"; t.textContent=tf(L(TX.upIng),{p:p}); };
  var go=function(){ if(busy) return;
    if(!by0){ var v=String((o.querySelector("#kupBy")||{}).value||"").replace(/\D/g,""), y=new Date().getFullYear();
      if(!/^\d{4}$/.test(v)||+v<1900||+v>y){ draw(L(TX.byE)); return; }
      if(y-(+v)<15){ draw(L(TX.by14)); return; }   // 해만 알므로 생일 전일 수 있다 → 올해 만 14세가 될 사람까지 막는다 (약관 제8조 만 14세 미만)
      by0=v; try{ localStorage.setItem("mpv_kst_by",v); }catch(e){} }
    var rs=vis!=="room"?[]:Object.keys(rsel).filter(function(k){ return rms&&rms.some(function(r){ return r.rid===k; }); }); var rlq=rlOn&&rx?rx.rl:"", chq=!rlq&&cc&&chOn&&vis==="pub"?cc.id:""; if(vis==="room"&&!rs.length&&!rlq){ draw(L(TX.rmPkE)); return; }   // 우리끼리 노래 = 방 하나 이상
    var bl=REC.blob; if(!bl){ o.remove(); soon(L(TX.needRec)); return; }
    var ty=String(bl.type||REC.mt||"video/webm").split(";")[0]; if(ty!=="video/mp4"&&ty!=="video/webm"){ draw(L(TX.upTy)); return; }
    if(bl.size>60*1024*1024){ draw(L(TX.upBig)); return; }
    var c=K.cur||{}, q="vis="+(rlq?"room":vis)+"&sid="+encodeURIComponent(c.id||"")+"&t="+encodeURIComponent(String(c.t||"").slice(0,120))+"&dur="+(REC.dur||0)+(REC.sc!=null?"&sc="+REC.sc:"")+(REC.th?"&th="+REC.th:"")+(REC.aiv?"&aiv="+REC.aiv:"")+(vis==="room"&&!rlq?"&rooms="+rs.join(","):"")+(rlq?"&rl="+rlq:"")+(chq?"&ch="+chq:"")+"&dev="+encodeURIComponent(klDev())+"&sess="+encodeURIComponent(sess());
    busy=true; draw("",0);
    xhr=new XMLHttpRequest(); xhr.open("POST",HUB+"/kst/up?"+q); xhr.setRequestHeader("Content-Type",ty);
    xhr.upload.onprogress=function(e){ if(e.lengthComputable) bar(Math.min(99,Math.floor(e.loaded*100/e.total))); };
    xhr.onload=function(){ busy=false; var j=null; try{ j=JSON.parse(xhr.responseText); }catch(e){} xhr=null;
      if(j&&j.ok){ try{ ntap("kara_stage","up_"+vis); }catch(e){}
        if(vis!=="me"&&j.id&&REC.aiCard){ kCardImg(REC.aiCard.blob,REC.sc,c.t).then(function(jpg){ return kThUp(j.id,jpg); }).catch(function(){}); }   // 상황 사진을 공유 카드로 (10-30)
        else if(vis!=="me"&&j.id){ var cu=URL.createObjectURL(bl); kCard(cu,REC.sc,c.t).then(function(jpg){ return kThUp(j.id,jpg); }).catch(function(){}).then(function(){ try{ URL.revokeObjectURL(cu); }catch(e){} }); }   // 공유 카드 그림 — 뒤에서 만들어 올림
        o.remove(); var pv=b.querySelector(".kpv"); if(pv) pv.remove(); try{ if(REC.url) URL.revokeObjectURL(REC.url); }catch(e){} REC.url=""; REC.blob=null; REC.sc=null; REC.frc=null; REC.th=""; REC.aiCard=null; var am=b.querySelector(".kaim"); if(am) am.remove(); recExit();
        if(rlq){ var rdd=rx.rid; K.ctx=null; kRelay(rdd,null,function(S2){ var r2=S2.j&&S2.j.relay; if(r2&&r2.cur&&r2.cur.me&&r2.curDone){ soon(L(TX.rlDone)); S2.next(); } }); return; }   // 릴레이 = 그 방 릴레이 화면 + 다음 주자 지명 (10-31)
        if(chq){ kChGet(); kChal(); soon(L(TX.upOk)); return; }   // 챌린지 = 챌린지 화면 (10-31)
        stageOpen("me"); soon(L(TX.upOk)); return; }
      var er=j&&j.err; if(er==="login"){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} draw(L(TX.lgReq)); kLogin(); return; } draw(er==="rate"?L(TX.aiCap):er==="big"?L(TX.upBig):er==="type"?L(TX.upTy):er==="chvis"?L(TX.chVisN):er==="chal"||er==="song"?L(TX.chErr):er==="turn"||er==="relay"?L(TX.rlErr):er==="room"?L(rlq?TX.rlErr:TX.rmPkE):L(TX.upF)); };
    xhr.onerror=function(){ busy=false; xhr=null; draw(L(TX.upNet)); };
    xhr.onabort=function(){ busy=false; xhr=null; };
    xhr.send(bl); };
  o.onclick=function(e){ if(e.target===o&&!busy) o.remove(); };
  draw(); }
// ── 가요무대·내 스테이지 = 노래방 화면 위를 덮는 전체 화면 페이지 (사장님 10-30 「창·카드 말고 화면 전환」)
//   돌아가기 = 폰 뒤로 버튼(history.pushState + popstate) 과 화면 위 왼쪽 작은 뒤로 화살표(kst_back.png, 나노바나나)
//   페이지가 겹치면(목록 → 영상 상세 → …) PG 에 쌓고, 뒤로 한 번에 한 장씩 닫는다. 투어앱 뒤로 지킴(nvg)과 엉키지 않게 state 에 nvg:1 도 같이 둔다
//   아이콘 = img/kara/kst_*.png (나노바나나로 뽑음 — 코드로 그리지 않는다)
var PG=[];
function pgOpen(cls){ var b=box(); if(!b) return null; try{ b.classList.toggle("kgv",KGV); }catch(e){} var o=document.createElement("div"); o.className="kpg "+(cls||""); o.style.zIndex=String(10+PG.length); b.appendChild(o); PG.push(o);
  o._h=false; try{ history.pushState({nvg:1,kst:PG.length},""); o._h=true; }catch(e){} return o; }
function pgPop(n){ while(PG.length>n){ var o=PG.pop(); try{ [].forEach.call(o.querySelectorAll("video"),function(v){ try{ v.pause(); v.removeAttribute("src"); v.load(); }catch(e){} }); }catch(e){} if(o._bye) try{ o._bye(); }catch(e){} o.remove(); } }
function pgBack(){ if(!PG.length) return; var o=PG[PG.length-1]; if(o._h){ try{ history.back(); return; }catch(e){} } pgPop(PG.length-1); }
window.addEventListener("popstate",function(e){ var n=(e.state&&e.state.kst)||0; if(PG.length>n) pgPop(n); });
function pgTo(n){ var k=0; PG.slice(n).forEach(function(o){ if(o._h) k++; }); pgPop(n); if(k) try{ history.go(-k); }catch(e){} }   // 단추로 여러 장 한꺼번에 닫을 때 — 쌓인 history 칸도 같이 되돌린다
function kIc(n,s){ return '<img class="kic'+(s?" s":"")+'" src="img/kara/'+(n.charAt(0)==="!"?n.slice(1):"kst_"+n)+'.png" alt="" aria-hidden="true">'; }   // "!이름" = img/kara/이름.png 그대로 (10-31 밤)
function kAiPf(id){ return '<img class="kpfm" src="'+esc(HUB+"/kst/ai/"+id)+'" alt="">'; }   // 프로필 = 상황 사진 (10-30)
function kVid(id){ return HUB+"/kst/v/"+id; }
function kThumb(id,cls){ return '<video class="'+cls+'" preload="metadata" playsinline muted src="'+esc(kVid(id))+'#t=0.1"></video>'; }
function kHead(inner){ return '<div class="kpgh"><button type="button" class="kpbk" aria-label="'+esc(L(TX.back))+'"><img src="img/kara/kst_back.png" alt=""></button><div class="kpgt">'+inner+'</div></div>'; }
function kNum(n){ n=+n||0; try{ return n.toLocaleString(kLoc()); }catch(e){ return String(n); } }
function kQs(){ return "dev="+encodeURIComponent(klDev())+"&sess="+encodeURIComponent(sess()); }
function kGet(path){ return fetch(HUB+path+(path.indexOf("?")>=0?"&":"?")+kQs()).then(function(r){ return r.json(); }); }
function kPost(path,o){ if(!sess()&&path!=="/kst/view"){ kLogin(); return Promise.resolve({ok:false,err:"login"}); }   // 쓰기 = 로그인 필요 (조회수만 빼고)
  var q={dev:klDev(),sess:sess()}; for(var k in o) q[k]=o[k]; return fetch(HUB+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)}).then(function(r){ return r.json(); }).then(function(j){ if(j&&j.err==="login"){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} kLogin(); } return j; }); }
function kDay(t){ try{ var d=new Date(t); return [d.toLocaleDateString(kLoc(),{month:"short",day:"numeric"}),d.getFullYear()+" · "+d.toLocaleTimeString(kLoc(),{hour:"2-digit",minute:"2-digit"})]; }catch(e){ return ["",""]; } }
function kVisTag(x){ var f=x.vis==="fol", r=x.vis==="room"; return '<span class="ktg'+(x.vis==="pub"?" p":f?" f":r?" r":"")+'">'+esc(L(x.vis==="pub"?TX.vPub:f?TX.vFol:r?TX.vwRoom:TX.vMe).replace(/\n/g," "))+(r&&x.rooms&&x.rooms.length?' · '+esc(x.rooms.map(function(q){ return q.name; }).join(", ")):'')+'</span>'; }   // 우리끼리 노래 = 방 이름 작게
// ── 팔로우 (사장님 10-30) — 사람은 pubid(허브가 만든 무작위 공개 id)로만 부른다 · 내 것엔 단추 없음
function kUn(x){ var n=esc(x.nick||"guest"); return x.pubid?'<button type="button" class="kun" data-u="'+esc(x.pubid)+'">'+n+'</button>':'<b>'+n+'</b>'; }   // 누르면 그 사람 무대
function kFwB(on){ return '<button type="button" class="kfw'+(on?' on':'')+'" data-fw="1">'+esc(L(on?TX.flg:TX.flw))+'</button>'; }
function kFollow(pub,on,btn){ if(btn) btn.disabled=true;
  return kPost("/kst/follow",{pubid:pub,on:!!on}).then(function(j){ if(btn) btn.disabled=false; if(!(j&&j.ok)){ soon(L(TX.fail)); return null; }
    try{ ntap("kara_stage",on?"follow":"unfollow"); }catch(e){}
    PG.forEach(function(o){ if(o._fw) try{ o._fw(pub,j); }catch(e){} });   // 열린 페이지들(그 사람 무대·상세·내 스테이지)에 알림
    return j; }).catch(function(){ if(btn) btn.disabled=false; soon(L(TX.upNet)); return null; }); }
function kUnBind(root){ [].forEach.call(root.querySelectorAll(".kun[data-u]"),function(u){ u.onclick=function(e){ e.stopPropagation(); kUser(u.dataset.u); }; u.onkeydown=function(e){ e.stopPropagation(); }; }); }
// 목록 점수 칸·정렬 (사장님 10-30) — 날짜 칸 옆 점수(없으면 –) · 정렬 단추 = 최신순 → 오래된순 → 점수순(높은 점수 먼저, 같으면 최신) → 최신순
function kScC(x){ var v=x&&typeof x.sc==="number"?x.sc:null; return '<div class="krs">'+(v==null?'<b class="kna">–</b>':'<b>'+v+'</b><small>'+esc(L(TX.scPt))+'</small>')+'</div>'; }
// 목록 보기 방식 — 줄 목록 ↔ 바둑판(3열, 사진만) (사장님 10-31) · 스테이지·내 스테이지·그 사람 무대·우리끼리 방 공통, 기기에 기억
var KGV=false; try{ KGV=localStorage.getItem("mpv_kgv")==="1"; }catch(e){}
function kVwBtn(){ return '<button type="button" class="kvw" data-view="1" aria-label="view">'+(KGV?'<img class="kgvi" src="img/kara/kst_list.png" alt="">':'<img class="kgvi" src="img/kara/kst_grid.png" alt="">')+'</button>'; }
function kGvApply(){ var b=box(); if(b) b.classList.toggle("kgv",KGV); [].forEach.call(document.querySelectorAll("#karBox .kvw"),function(x){ x.innerHTML=KGV?'<img class="kgvi" src="img/kara/kst_list.png" alt="">':'<img class="kgvi" src="img/kara/kst_grid.png" alt="">'; }); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#karBox [data-view]"); if(!t) return; e.preventDefault(); e.stopPropagation(); KGV=!KGV; try{ localStorage.setItem("mpv_kgv",KGV?"1":"0"); }catch(x){} kGvApply(); },true);
new MutationObserver(function(){ var b=box(); if(b&&b.classList.contains("kgv")!==KGV) b.classList.toggle("kgv",KGV); }).observe(document.body,{childList:true});
function kSortNx(s){ return s==="new"?"old":s==="old"?"score":"new"; }
function kSortL(s){ return L(s==="old"?TX.sOld:s==="score"?TX.sScore:TX.sNew); }
function kSortA(items,s){ var a=items.map(function(x,i){ return [x,i]; }), nv=function(x){ return typeof x.sc==="number"?x.sc:-1; };
  a.sort(function(p,q){ return s==="old"?p[0].at-q[0].at:s==="score"?(nv(q[0])-nv(p[0])||q[0].at-p[0].at):q[0].at-p[0].at; }); return a; }
// 그 사람 무대 — 프로필(고른 영상 첫 장면)·ID·팔로워·팔로잉·영상 수·받은 좋아요 + 팔로우 단추 + 내가 볼 수 있는 영상(전체 공개 + 내가 팔로워면 팔로워만)
function kUser(pub){ if(!/^[0-9a-f]{12}$/.test(String(pub||""))) return; var o=pgOpen("kusr"); if(!o) return;
  var U={o:o,tab:"user",pub:pub,info:null,items:null,err:0,sort:"new",tok:0,busy:false};
  U.load=function(){ var my=++U.tok; U.items=null; U.err=0; U.draw();
    kGet("/kst/user?pubid="+pub).then(function(j){ if(my!==U.tok) return; if(j&&j.ok) U.info=j; else U.err=1; U.draw(); }).catch(function(){ if(my!==U.tok) return; U.err=1; U.draw(); });
    kGet("/kst/ulist?pubid="+pub+"&sort="+U.sort).then(function(j){ if(my!==U.tok) return; if(j&&j.ok) U.items=j.items||[]; else { U.items=[]; U.err=1; } U.draw(); }).catch(function(){ if(my!==U.tok) return; U.items=[]; U.err=1; U.draw(); }); };
  U.loadMe=function(){};
  o._bye=function(){ U.tok++; };
  o._fw=function(p2,j){ if(p2===pub&&U.info){ U.info.iFollow=j.iFollow; U.info.followers=j.followers; U.load(); } else if(U.info&&U.info.isMe){ U.info.following=j.following; U.draw(); } };
  U.draw=function(){ var m=U.info, dash="…", body;
    var head='<div class="kpf"><div class="kpfv kro">'+(m&&m.aip?kAiPf(m.aip):m&&m.pid?kThumb(m.pid,"kpfm"):'<span class="kpfe">'+kIc("vid")+'</span>')+'</div><div class="kpfi">'
      +'<div class="kpr kpn">'+kIc("id")+'<b>'+esc(m?(m.nick||"guest"):dash)+'</b>'+(m&&!m.isMe?kFwB(m.iFollow):'')+'</div>'
      +'<div class="kpr kfl2" role="button" tabindex="0" data-fl="followers">'+kIc("fol")+'<span>'+esc(L(TX.fol))+'</span><b>'+(m?kNum(m.followers):dash)+'</b></div>'
      +'<div class="kpr kfl2" role="button" tabindex="0" data-fl="following">'+kIc("fol")+'<span>'+esc(L(TX.fing))+'</span><b>'+(m?kNum(m.following):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("vid")+'<span>'+esc(L(TX.vids))+'</span><b>'+(m?kNum(m.count):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("up")+'<span>'+esc(L(TX.lks))+'</span><b>'+(m?kNum(m.likes):dash)+'</b></div></div></div>';
    var list;
    if(U.items===null) list='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(U.err&&!U.items.length) list='<div class="kstge">'+esc(L(TX.stF))+'</div>';
    else if(!U.items.length) list='<div class="kstge">'+esc(L(TX.ustE))+'</div>';
    else list='<div class="krows">'+kSortA(U.items,U.sort).map(function(r){ var x=r[0], i=r[1], d=kDay(x.at);
      return '<div class="krow" role="button" tabindex="0" data-i="'+i+'"><div class="krd"><b>'+esc(d[0])+'</b><small>'+esc(d[1])+'</small></div>'+kScC(x)
        +'<div class="krm"><p>'+esc(x.desc||x.t||"-")+'</p><small>'+(x.vis!=="pub"?kVisTag(x):'')
        +'<span class="kst2">'+kIc("up",1)+kNum(x.up)+'</span><span class="kst2">'+kIc("cm",1)+kNum(x.cm)+'</span><span class="kst2">'+kIc("view",1)+kNum(x.views)+'</span></small></div>'
        +kThumb(x.id,"krv")+'</div>'; }).join("")+'</div>';
    body=head+'<div class="ksrt"><span>'+esc(L(TX.vids))+(U.items&&U.items.length?' · '+U.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(U.sort))+'</button>'+kVwBtn()+'</div>'+list;
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<h3>'+esc(m?(m.nick||"guest"):L(TX.stg))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack;
    var fw=o.querySelector("[data-fw]"); if(fw) fw.onclick=function(){ if(!m) return; kFollow(pub,!m.iFollow,fw); };
    [].forEach.call(o.querySelectorAll("[data-fl]"),function(r){ var go=function(){ kFl(pub,r.dataset.fl); }; r.onclick=go; r.onkeydown=function(e){ if(e.key==="Enter") go(); }; });
    var so=o.querySelector("[data-sort]"); if(so) so.onclick=function(){ U.sort=kSortNx(U.sort); U.load(); var g=o.querySelector(".kpgb"); if(g) g.scrollTop=0; };
    [].forEach.call(o.querySelectorAll(".krow"),function(c){ var go=function(){ var x=U.items&&U.items[+c.dataset.i]; if(x) kDet(x,U); }; c.onclick=go; c.onkeydown=function(e){ if(e.key==="Enter") go(); }; }); };
  U.load(); try{ ntap("kara_stage","user"); }catch(e){} }
// 팔로워·팔로잉 목록 — ID 를 누르면 그 사람 무대
function kFl(pub,kind){ var o=pgOpen("kfl"); if(!o) return; var items=null, err=0, ttl=L(kind==="following"?TX.fing:TX.fol);
  var draw=function(){ var body=items===null?'<div class="kstge">'+esc(L(TX.lo))+'</div>':err?'<div class="kstge">'+esc(L(TX.stF))+'</div>':!items.length?'<div class="kstge">'+esc(L(TX.flE))+'</div>'
      :'<div class="kfls">'+items.map(function(x,i){ return '<button type="button" data-i="'+i+'">'+kIc("id")+esc(x.nick||"guest")+'</button>'; }).join("")+'</div>';
    o.innerHTML=kHead('<h3>'+esc(ttl)+(items&&items.length?' · '+kNum(items.length):'')+'</h3>')+'<div class="kpgb">'+body+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll(".kfls button"),function(c){ c.onclick=function(){ var x=items[+c.dataset.i]; if(x&&x.pubid) kUser(x.pubid); }; }); };
  draw(); kGet("/kst/fl?pubid="+pub+"&kind="+(kind==="following"?"following":"followers")).then(function(j){ if(!o.isConnected) return; if(j&&j.ok) items=j.items||[]; else { items=[]; err=1; } draw(); })
    .catch(function(){ if(!o.isConnected) return; items=[]; err=1; draw(); }); }
var KS=null;   // 열린 가요무대 페이지 상태 {o,tab,items,err,me,sort,tok,draw,load}
function stageOpen(tab0){ var tab=tab0==="me"?"me":"all";
  if(KS&&KS.o&&KS.o.isConnected){ pgTo(PG.indexOf(KS.o)+1); KS.tab=tab; KS.items=null; KS.err=0; KS.draw(); KS.load(); return; }
  var o=pgOpen("kstpg"); if(!o) return;
  var S=KS={o:o,tab:tab,items:null,err:0,me:null,sort:"new",tok:0,view:"all",rooms:null};   // view = all(전체) | flw(팔로잉만) | room(우리끼리 노래 방 목록)
  o._bye=function(){ S.tok++; if(KS===S) KS=null; };
  o._fw=function(){ if(S.tab==="me") S.loadMe(); else S.load(); };   // 팔로우가 바뀌면 — 내 스테이지 = 팔로잉 수 · 가요무대 = 팔로워만 영상이 들어오고 빠진다
  S.load=function(){ var my=++S.tok; if(!sess()&&(S.tab==="me"||S.view!=="all")){ S.items=[]; S.rooms=[]; S.err=0; S.draw(); return; }   // 내 스테이지·팔로잉·우리끼리 노래 = 로그인 S.items=null; S.err=0;
    if(S.tab==="all"&&S.view==="room"){ S.rooms=null; kGet("/kst/rooms").then(function(j){ if(my!==S.tok) return; if(j&&j.ok) S.rooms=j.items||[]; else { S.rooms=[]; S.err=1; } S.draw(); })
      .catch(function(){ if(my!==S.tok) return; S.rooms=[]; S.err=1; S.draw(); }); return; }
    kGet("/kst/list?scope="+(S.tab==="all"?(S.view==="flw"?"following":"pub"):"me")).then(function(j){ if(my!==S.tok) return; if(j&&j.ok) S.items=j.items||[]; else { S.items=[]; S.err=1; } S.draw(); })
      .catch(function(){ if(my!==S.tok) return; S.items=[]; S.err=1; S.draw(); });
    if(S.tab==="me") S.loadMe(); };
  S.loadMe=function(){ var my=S.tok; kGet("/kst/me").then(function(j){ if(my!==S.tok||!(j&&j.ok)) return; S.me=j; S.draw(); }).catch(function(){}); };
  var prof=function(){ var m=S.me, pid=m&&m.pid, dash="…";
    return '<div class="kpf"><button type="button" class="kpfv" data-pf="1" aria-label="'+esc(L(TX.pfT))+'">'+(m&&m.aip?kAiPf(m.aip):pid?kThumb(pid,"kpfm"):'<span class="kpfe">'+kIc("vid")+'</span>')+'<span class="kpfc">'+esc(L(TX.chg))+'</span></button>'
      +'<div class="kpfi">'
      +'<div class="kpr kpn">'+kIc("id")+(m&&m.nick?'<b>'+esc(m.nick)+'</b><button type="button" class="kln" data-nick="1">'+esc(L(TX.chg))+'</button>':'<button type="button" class="kln" data-nick="1">'+esc(L(TX.idSet))+'</button>')+'</div>'
      +'<div class="kpr'+(m&&m.pubid?' kfl2" role="button" tabindex="0" data-fl="followers':'')+'">'+kIc("fol")+'<span>'+esc(L(TX.fol))+'</span><b>'+(m?kNum(m.followers):dash)+'</b></div>'
      +'<div class="kpr'+(m&&m.pubid?' kfl2" role="button" tabindex="0" data-fl="following':'')+'">'+kIc("fol")+'<span>'+esc(L(TX.fing))+'</span><b>'+(m?kNum(m.following):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("view")+'<span>'+esc(L(TX.vw))+'</span><b>'+(m?kNum(m.views):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("vid")+'<span>'+esc(L(TX.vids))+'</span><b>'+(m?kNum(m.count):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("up")+'<span>'+esc(L(TX.lks))+'</span><b>'+(m?kNum(m.likes):dash)+'</b></div>'
      +'<div class="kpr kfl2" role="button" tabindex="0" data-aig="1">'+kIc("theme")+'<span>'+esc(L(TX.aiG))+'</span><b>'+(m?kNum(m.ain||0):dash)+'</b></div>'
      +'</div></div>'; };
  var rows=function(){
    if(S.items===null) return '<div class="kstge">'+esc(L(TX.lo))+'</div>';
    if(S.err) return '<div class="kstge">'+esc(L(TX.stF))+'</div>';
    if(!S.items.length) return '<div class="kstge">'+esc(L(S.tab==="all"?(S.view==="flw"?TX.flwE:TX.stgE):TX.mstgE))+'</div>';
    var a=kSortA(S.items,S.sort);
    return '<div class="krows">'+a.map(function(r){ var x=r[0], d=kDay(x.at);
      return '<div class="krow" role="button" tabindex="0" data-i="'+r[1]+'"><div class="krd"><b>'+esc(d[0])+'</b><small>'+esc(d[1])+'</small></div>'+kScC(x)
        +'<div class="krm"><p>'+esc(x.desc||x.t||"-")+'</p><small>'+(S.tab==="me"?kVisTag(x):(x.vis==="fol"?kVisTag(x):'')+(x.pubid?kUn(x).replace('class="kun"','class="kun knk"'):'<b class="knk">'+esc(x.nick||"guest")+'</b>'))
        +'<span class="kst2">'+kIc("up",1)+kNum(x.up)+'</span><span class="kst2">'+kIc("cm",1)+kNum(x.cm)+'</span><span class="kst2">'+kIc("view",1)+kNum(x.views)+'</span></small></div>'
        +kThumb(x.id,"krv")+'</div>'; }).join("")+'</div>'; };
  var roomsH=function(){ var h='<div class="krms"><button type="button" class="krm0" data-rnew="1">'+kIc("plus")+'<b>'+esc(L(TX.rmNew))+'</b></button>';   // 우리끼리 노래 = 내 방 목록 (맨 위 「+ 방 만들기」)
    if(S.rooms===null) h+='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(S.err&&!S.rooms.length) h+='<div class="kstge">'+esc(L(TX.stF))+'</div>';
    else if(!S.rooms.length) h+='<div class="kstge">'+esc(L(TX.rmNone))+'</div>';
    else h+=S.rooms.map(function(r,i){ return '<button type="button" data-ri="'+i+'">'+kIc("!krm_song")+'<b>'+esc(r.name)+'</b><small>'+esc(tf(L(TX.rmN),{n:r.count}))+(r.owner?' · '+esc(L(TX.rmOw)):'')+'</small></button>'; }).join("");
    return h+'</div>'; };
  S.draw=function(){ var body;
    var lgN=!sess()&&(S.tab==="me"||S.view!=="all"), lgH='<div class="kstge">'+esc(L(TX.lgReq))+'<br><button type="button" data-lg="1" style="display:inline-block;margin-top:12px;background:#ffe066;color:#1a1300;border:0;border-radius:999px;font-weight:900;font-size:15px;padding:10px 26px;cursor:pointer">'+esc(L(TX.lgin))+'</button></div>';
    if(lgN&&S.tab==="me") body=lgH;
    else if(S.tab==="me") body=prof()+'<div class="ksrt"><span>'+esc(L(TX.mstgE))+(S.items&&S.items.length?' · '+S.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(S.sort))+'</button>'+kVwBtn()+'</div>'+rows();
    else body='<div class="kseg">'+[["all",TX.vwAll,"pub"],["flw",TX.vwFlw,"folonly"],["room",TX.vwRoom,"!krm_song"]].map(function(b){ return '<button type="button" data-vw="'+b[0]+'"'+(S.view===b[0]?' class="on"':'')+'>'+kIc(b[2],1)+'<span>'+esc(L(b[1]))+'</span></button>'; }).join("")+'</div>'
      +(lgN?lgH:S.view==="room"?roomsH():'<div class="ksrt"><span>'+esc(L(S.view==="flw"?TX.vwFlw:TX.stgE))+(S.items&&S.items.length?' · '+S.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(S.sort))+'</button>'+kVwBtn()+'</div>'+rows());   // 가요무대 = 프로필 없이 같은 줄 목록 + 최신순/오래된순 (사장님 10-30) · 친구(팔로우) 영상은 팔로우 생기면 같이
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<button type="button" data-st="all"'+(S.tab==="all"?' class="on"':'')+'>'+esc(L(TX.stg))+'</button><button type="button" data-st="me"'+(S.tab==="me"?' class="on"':'')+'>'+esc(L(TX.mstg))+'</button>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack;
    var lgb=o.querySelector("[data-lg]"); if(lgb) lgb.onclick=function(){ kLogin(function(){ if(o.isConnected){ S.items=null; S.draw(); S.load(); } }); };   // 로그인 안내 (10-31 출시판)
    [].forEach.call(o.querySelectorAll("[data-st]"),function(x){ x.onclick=function(){ if(S.tab===x.dataset.st) return; S.tab=x.dataset.st; S.items=null; S.err=0; S.draw(); S.load(); var g=o.querySelector(".kpgb"); if(g) g.scrollTop=0; }; });
    var so=o.querySelector("[data-sort]"); if(so) so.onclick=function(){ S.sort=kSortNx(S.sort); S.draw(); };
    [].forEach.call(o.querySelectorAll("[data-vw]"),function(x){ x.onclick=function(){ if(S.view===x.dataset.vw) return; S.view=x.dataset.vw; S.items=null; S.rooms=null; S.err=0; S.draw(); S.load(); try{ ntap("kara_stage","view_"+S.view); }catch(e){} }; });
    var rn=o.querySelector("[data-rnew]"); if(rn) rn.onclick=function(){ kRoomNew(S); };
    [].forEach.call(o.querySelectorAll("[data-ri]"),function(x){ x.onclick=function(){ var r=S.rooms&&S.rooms[+x.dataset.ri]; if(r) kRoom(r.rid,S); }; });
    var pf=o.querySelector("[data-pf]"); if(pf) pf.onclick=function(){ kPick(S); };
    var ag=o.querySelector("[data-aig]"); if(ag){ ag.onclick=function(){ kAiGal(S); }; ag.onkeydown=function(e){ if(e.key==="Enter") kAiGal(S); }; }   // 내 AI 사진 모음 (10-31)
    var nk=o.querySelector("[data-nick]"); if(nk) nk.onclick=function(){ kNick(S); };
    [].forEach.call(o.querySelectorAll("[data-fl]"),function(r){ var go=function(){ if(S.me&&S.me.pubid) kFl(S.me.pubid,r.dataset.fl); }; r.onclick=go; r.onkeydown=function(e){ if(e.key==="Enter") go(); }; });
    kUnBind(o);
    [].forEach.call(o.querySelectorAll(".krow"),function(c){ var go=function(){ var x=S.items&&S.items[+c.dataset.i]; if(x) kDet(x,S); }; c.onclick=go; c.onkeydown=function(e){ if(e.key==="Enter") go(); }; }); };
  S.draw(); S.load(); try{ ntap("kara_stage","tap"); }catch(e){} }
// ID(닉네임) 정하기·바꾸기 — 가요무대 페이지 안 작은 창 · 허브가 중복을 본다(소문자 비교)
function kNick(S){ var o=S.o, m=S.me||{}, busy=false; var w=o.querySelector(".kpm"); if(w) w.remove();
  w=document.createElement("div"); w.className="kpm"; o.appendChild(w);
  var draw=function(msg,val){ w.innerHTML='<div><h3>'+esc(L(m.nick?TX.idCh:TX.idSet))+'</h3><input type="text" class="kni" maxlength="20" autocomplete="nickname" autocapitalize="off" spellcheck="false" value="'+esc(val!=null?val:(m.nick||""))+'"><p class="km">'+esc(L(TX.idN))+'</p>'
      +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo">'+esc(L(TX.save))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    var inp=w.querySelector(".kni"); try{ inp.focus(); }catch(e){}
    w.querySelector(".kc").onclick=function(){ w.remove(); };
    w.querySelector(".kgo").onclick=function(){ if(busy) return; var v=String(inp.value||"").trim(), n=Array.from(v).length, ok=false;
      try{ ok=n>=2&&n<=20&&new RegExp("^[\\p{L}\\p{N}_.\\-]+$","u").test(v)&&v.toLowerCase()!=="guest"; }catch(e){ ok=n>=2&&n<=20&&!/\s/.test(v); }
      if(!ok){ draw(L(TX.idN),v); return; } if(v===m.nick){ w.remove(); return; }
      busy=true; kPost("/kst/me",{nick:v}).then(function(j){ busy=false; if(j&&j.ok){ S.me=j; w.remove(); S.draw(); return; } draw(L(j&&j.err==="taken"?TX.idTk:j&&j.err==="nick"?TX.idN:TX.fail),v); })
        .catch(function(){ busy=false; draw(L(TX.upNet),v); }); }; };
  w.onclick=function(e){ if(e.target===w&&!busy) w.remove(); }; draw(); }
// 프로필 고르기 — 「영상」(내 영상 첫 장면) / 「AI 사진」(내가 만든 AI 사진) 두 탭 (10-31) · 어느 쪽을 골라도 다른 쪽 자료는 그대로 남는다
//   영상을 고르면 aip 를 비우고(프로필 = 영상), AI 사진을 고르면 aip 로 표시
function kPick(S){ var o=pgOpen("kpick"); if(!o) return; var mine=null, ais=null, busy=false, tab=S.me&&S.me.aip?"ai":"vid";
  var set=function(q){ if(busy) return; busy=true;
    kPost("/kst/me",q).then(function(j){ busy=false; if(j&&j.ok){ S.me=j; S.draw(); pgBack(); return; } draw(L(TX.fail)); }).catch(function(){ busy=false; draw(L(TX.upNet)); }); };
  var draw=function(msg){ var body, aip=S.me&&S.me.aip;
    if(tab==="vid"){
      if(mine===null) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
      else if(!mine.length) body='<div class="kstge">'+esc(L(TX.pfE))+'</div>';
      else body='<p class="km">'+esc(L(TX.pfN))+'</p>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<div class="kpkp">'+mine.map(function(x,i){ var cur=!aip&&S.me&&S.me.pid===x.id;
        return '<button type="button" data-i="'+i+'"'+(cur?' class="on"':'')+'>'+kThumb(x.id,"")+'<small>'+esc(kDay(x.at)[0])+'</small></button>'; }).join("")+'</div>'; }
    else {
      if(ais===null) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
      else if(!ais.length) body='<div class="kstge">'+esc(L(TX.aiGE))+'</div>';
      else body='<p class="km">'+esc(L(TX.pkAiN))+'</p>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<div class="kpkp">'+ais.map(function(x,i){ var cur=aip===x.aid;
        return '<button type="button" data-a="'+i+'"'+(cur?' class="on"':'')+'><img src="'+esc(kAiSrc(x.aid))+'" alt="" loading="lazy"><small>'+esc(cur?L(TX.aiNow):kDay(x.at)[0])+'</small></button>'; }).join("")+'</div>'; }
    o.innerHTML=kHead('<h3>'+esc(L(TX.pkT))+'</h3>')+'<div class="kpgb"><div class="kseg">'+[["vid",TX.pkVid,"vid"],["ai",TX.aiG,"theme"]].map(function(b){ return '<button type="button" data-tb="'+b[0]+'"'+(tab===b[0]?' class="on"':'')+'>'+kIc(b[2],1)+'<span>'+esc(L(b[1]))+'</span></button>'; }).join("")+'</div>'+body+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll("[data-tb]"),function(c){ c.onclick=function(){ if(tab===c.dataset.tb) return; tab=c.dataset.tb; draw(); need(); }; });
    [].forEach.call(o.querySelectorAll("[data-i]"),function(c){ c.onclick=function(){ var x=mine[+c.dataset.i]; if(x) set({pid:x.id,aip:""}); }; });
    [].forEach.call(o.querySelectorAll("[data-a]"),function(c){ c.onclick=function(){ var x=ais[+c.dataset.a]; if(x) set({aip:x.aid}); }; }); };
  var need=function(){
    if(tab==="vid"&&mine===null){ if(S.tab==="me"&&S.items&&!S.err){ mine=S.items.slice(); draw(); }
      else kGet("/kst/list?scope=me").then(function(j){ mine=(j&&j.ok&&j.items)||[]; if(o.isConnected) draw(); }).catch(function(){ mine=[]; if(o.isConnected) draw(L(TX.stF)); }); }
    if(tab==="ai"&&ais===null) kGet("/kst/ailist").then(function(j){ ais=(j&&j.ok&&j.items)||[]; if(o.isConnected) draw(j&&j.ok?"":L(TX.stF)); }).catch(function(){ ais=[]; if(o.isConnected) draw(L(TX.stF)); }); };
  draw(); need(); }
// 영상 상세 — 위 영상 크게 · 설명(주인은 고치기) · 좋아요/싫어요 · 조회수 · 댓글 (같은 기기 같은 영상 조회수는 하루 1번)
function kDet(x,S){ var o=pgOpen("kdet"); if(!o) return; var cms=null, edit=false, busy=false, d=kDay(x.at);
  var chg=function(){ if(S&&S.o&&S.o.isConnected){ S.draw(); if(S.tab==="me") S.loadMe(); } };
  o.innerHTML=kHead('<h3>'+esc(x.t||L(TX.stg))+'</h3>')+'<div class="kpgb"><video class="kdv" controls autoplay playsinline preload="metadata" src="'+esc(kVid(x.id))+'"></video>'
    +'<div class="kdm">'+kUn(x)+'<span class="kfwh"></span><span>'+esc(d[0]+" "+d[1])+'</span>'+(x.mine||x.vis==="fol"||x.vis==="room"?kVisTag(x):'')+'</div><div class="kdr"></div><div class="kbx kdd"></div><div class="kbx kdc"></div>'
    +(x.mine?'<button type="button" class="kbt r kdel2">'+esc(L(TX.del))+'</button>':'')+'</div>';
  o.querySelector(".kpbk").onclick=pgBack; kUnBind(o);
  var fwOn=null, fwH=o.querySelector(".kfwh"), fwDraw=function(){ if(x.mine||!x.pubid||fwOn===null){ fwH.innerHTML=""; return; } fwH.innerHTML=kFwB(fwOn);
    var bt=fwH.querySelector("[data-fw]"); bt.onclick=function(){ kFollow(x.pubid,!fwOn,bt); }; };
  o._fw=function(p2,j){ if(p2===x.pubid){ fwOn=!!j.iFollow; fwDraw(); } };
  if(!x.mine&&x.pubid) kGet("/kst/user?pubid="+x.pubid).then(function(j){ if(!o.isConnected||!(j&&j.ok)) return; if(j.isMe){ x.mine=true; fwOn=null; } else fwOn=!!j.iFollow; fwDraw(); }).catch(function(){});
  var R=o.querySelector(".kdr"), D=o.querySelector(".kdd"), C=o.querySelector(".kdc");
  var rDraw=function(){ R.innerHTML='<button type="button" data-r="up" aria-label="'+esc(L(TX.upB))+'"'+(x.my==="up"?' class="on"':'')+'>'+kIc("up")+'<b>'+kNum(x.up)+'</b></button>'
      +'<button type="button" data-r="down" aria-label="'+esc(L(TX.dnB))+'"'+(x.my==="down"?' class="on"':'')+'>'+kIc("down")+'<b>'+kNum(x.down)+'</b></button>'
      +'<span class="kvw" title="'+esc(L(TX.vw))+'">'+kIc("view")+'<b>'+kNum(x.views)+'</b></span>'
      +(x.vis!=="me"?'<button type="button" class="kshb" data-sh="1" aria-label="'+esc(L(TX.shB))+'">'+kIc("share")+'<b>'+esc(L(TX.shB))+'</b></button>':'');
    var sb=R.querySelector("[data-sh]"); if(sb) sb.onclick=function(){ kShareVid(x); };
    [].forEach.call(R.querySelectorAll("[data-r]"),function(btn){ btn.onclick=function(){ if(busy) return; busy=true; var r=x.my===btn.dataset.r?"":btn.dataset.r;
      kPost("/kst/react",{id:x.id,r:r}).then(function(j){ busy=false; if(j&&j.ok){ x.up=j.up; x.down=j.down; x.my=j.my; rDraw(); chg(); } else soon(L(TX.fail)); }).catch(function(){ busy=false; soon(L(TX.upNet)); }); }; }); };
  var dDraw=function(msg){ var h='<h4>'+esc(L(TX.dsc))+'</h4>';
    if(edit){ D.innerHTML=h+'<textarea maxlength="200" placeholder="'+esc(L(TX.dscP))+'">'+esc(x.desc||"")+'</textarea>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<div class="kbr"><small class="kcn"></small><button type="button" class="kbt g" data-dc="1">'+esc(L(TX.cancel))+'</button><button type="button" class="kbt" data-ds="1">'+esc(L(TX.save))+'</button></div>';
      var ta=D.querySelector("textarea"), cn=D.querySelector(".kcn"), cnt=function(){ cn.textContent=Array.from(ta.value).length+"/200"; }; ta.oninput=cnt; cnt(); try{ ta.focus(); }catch(e){}
      D.querySelector("[data-dc]").onclick=function(){ edit=false; dDraw(); };
      D.querySelector("[data-ds]").onclick=function(){ if(busy) return; busy=true; kPost("/kst/desc",{id:x.id,text:Array.from(ta.value).slice(0,200).join("")}).then(function(j){ busy=false; if(j&&j.ok){ x.desc=j.desc||""; edit=false; dDraw(); chg(); } else dDraw(L(TX.efail)); }).catch(function(){ busy=false; dDraw(L(TX.upNet)); }); };
      return; }
    D.innerHTML=h+'<p'+(x.desc?'':' class="kdim"')+'>'+esc(x.desc||L(TX.dscN))+'</p>'+(x.mine?'<div class="kbr"><button type="button" class="kbt g" data-de="1">'+esc(L(TX.dscE))+'</button></div>':'');
    var de=D.querySelector("[data-de]"); if(de) de.onclick=function(){ edit=true; dDraw(); }; };
  var cDraw=function(msg){ var keep=C.querySelector("textarea"), kv=keep?keep.value:"";
    var list=cms===null?'<p class="kdim">'+esc(L(TX.lo))+'</p>':!cms.length?'<p class="kdim">'+esc(L(TX.cmE))+'</p>':cms.map(function(c,i){ var cd=kDay(c.at);
      return '<div class="kcm"><div class="kch"><b>'+esc(c.nick||"guest")+'</b><small>'+esc(cd[0]+" "+cd[1])+'</small>'+(c.can?'<button type="button" data-cd="'+i+'">'+esc(L(TX.del))+'</button>':'')+'</div><p>'+esc(c.text)+'</p></div>'; }).join("");
    C.innerHTML='<h4>'+kIc("cm")+esc(L(TX.cmT))+' '+kNum(x.cm)+'</h4>'+list+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
      +'<textarea maxlength="200" placeholder="'+esc(L(TX.cmP))+'"></textarea><div class="kbr"><small class="kcn"></small><button type="button" class="kbt" data-cw="1">'+esc(L(TX.cmGo))+'</button></div>';
    var ta=C.querySelector("textarea"), cn=C.querySelector(".kcn"), cnt=function(){ cn.textContent=Array.from(ta.value).length+"/200"; }; ta.value=kv; ta.oninput=cnt; cnt();
    C.querySelector("[data-cw]").onclick=function(){ var t=String(ta.value||"").trim(); if(!t||busy) return; busy=true;
      kPost("/kst/cm",{id:x.id,text:Array.from(t).slice(0,200).join("")}).then(function(j){ busy=false; if(j&&j.ok){ x.cm=j.cm; ta.value=""; cLoad(); chg(); } else cDraw(L(TX.fail)); }).catch(function(){ busy=false; cDraw(L(TX.upNet)); }); };
    [].forEach.call(C.querySelectorAll("[data-cd]"),function(b2){ b2.onclick=function(){ var c=cms&&cms[+b2.dataset.cd]; if(!c||busy||!window.confirm(L(TX.cmDQ))) return; busy=true;
      kPost("/kst/cm",{id:x.id,del:c.k}).then(function(j){ busy=false; if(j&&j.ok){ x.cm=j.cm; cLoad(); chg(); } else cDraw(L(TX.delF)); }).catch(function(){ busy=false; cDraw(L(TX.upNet)); }); }; }); };
  var cLoad=function(){ kGet("/kst/cm?id="+x.id).then(function(j){ if(!o.isConnected) return; if(j&&j.ok){ cms=j.items||[]; if(j.cm!=null) x.cm=j.cm; cDraw(); } else { cms=[]; cDraw(L(TX.stF)); } }).catch(function(){ if(!o.isConnected) return; cms=[]; cDraw(L(TX.stF)); }); };
  var dl=o.querySelector(".kdel2"); if(dl) dl.onclick=function(){ if(busy||!window.confirm(L(TX.delQ))) return; busy=true; dl.disabled=true;
    kPost("/kst/del",{id:x.id}).then(function(j){ busy=false; if(j&&j.ok){ pgBack(); if(S&&S.o&&S.o.isConnected) S.load(); return; } dl.disabled=false; soon(L(TX.delF)); }).catch(function(){ busy=false; dl.disabled=false; soon(L(TX.delF)); }); };
  rDraw(); dDraw(); cDraw(); cLoad();
  // 조회수 — 이 기기에서 오늘 처음 연 영상만 허브에 알린다(허브도 기기 해시+날짜로 한 번 더 막는다)
  try{ var vm={}, today=new Date(Date.now()+9*3600000).toISOString().slice(0,10); try{ vm=JSON.parse(localStorage.getItem("mpv_kst_vw")||"{}")||{}; }catch(e){ vm={}; }
    if(vm[x.id]!==today){ kPost("/kst/view",{id:x.id}).then(function(j){ if(j&&j.ok){ x.views=j.views; if(o.isConnected) rDraw(); chg(); vm[x.id]=today; var ks=Object.keys(vm); if(ks.length>300) ks.slice(0,ks.length-300).forEach(function(k){ delete vm[k]; }); try{ localStorage.setItem("mpv_kst_vw",JSON.stringify(vm)); }catch(e){} } }).catch(function(){}); } }catch(e){}
}
// 공유 단추 그림·문구 (노래방 사이트에서 옮겨 옴 10-30)
var SHI={"x": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>", "sms": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#34C759\" d=\"M12 3C6.98 3 3 6.36 3 10.5c0 2.35 1.28 4.43 3.3 5.8-.13 1.02-.5 2.2-1.3 3.2 1.7-.2 3.2-.94 4.3-1.7.85.2 1.75.3 2.7.3 5.02 0 9-3.36 9-7.6S17.02 3 12 3z\"/></svg>", "tg": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#26A5E4\" d=\"M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z\"/></svg>", "line": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#00C300\" d=\"M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314\"/></svg>", "fb": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#1877F2\" d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>", "band": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#00C73C\"/><text x=\"12\" y=\"17.5\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" fill=\"#fff\" font-family=\"Arial\">B</text></svg>", "wa": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#25D366\" d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"/></svg>", "mail": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#EA4335\" d=\"M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z\"/></svg>", "kakao": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#FEE500\"/><g transform=\"translate(3.2,3.2) scale(0.73)\"><path fill=\"#3C1E1E\" d=\"M22.125 0H1.875C.8394 0 0 .8394 0 1.875v20.25C0 23.1606.8394 24 1.875 24h20.25C23.1606 24 24 23.1606 24 22.125V1.875C24 .8394 23.1606 0 22.125 0zM12 18.75c-.591 0-1.1697-.0413-1.7317-.1209-.5626.3965-3.813 2.6797-4.1198 2.7225 0 0-.1258.0489-.2328-.0141s-.0876-.2282-.0876-.2282c.0322-.2198.8426-3.0183.992-3.5333-2.7452-1.36-4.5701-3.7686-4.5701-6.5135C2.25 6.8168 6.6152 3.375 12 3.375s9.75 3.4418 9.75 7.6875c0 4.2457-4.3652 7.6875-9.75 7.6875zM8.0496 9.8672h-.8777v3.3417c0 .2963-.2523.5372-.5625.5372s-.5625-.2409-.5625-.5372V9.8672h-.8777c-.3044 0-.552-.2471-.552-.5508s.2477-.5508.552-.5508h2.8804c.3044 0 .552.2471.552.5508s-.2477.5508-.552.5508zm10.9879 2.9566a.558.558 0 0 1 .108.4167.5588.5588 0 0 1-.2183.371.5572.5572 0 0 1-.3383.1135.558.558 0 0 1-.4493-.2236l-1.3192-1.7479-.1952.1952v1.2273a.5635.5635 0 0 1-.5627.5628.563.563 0 0 1-.5625-.5625V9.3281c0-.3102.2523-.5625.5625-.5625s.5625.2523.5625.5625v1.209l1.5694-1.5694c.0807-.0807.1916-.1252.312-.1252.1404 0 .2814.0606.3871.1661.0985.0984.1573.2251.1654.3566.0082.1327-.036.2542-.1241.3425l-1.2818 1.2817 1.3845 1.8344zm-8.3502-3.5023c-.095-.2699-.3829-.5475-.7503-.5557-.3663.0083-.6542.2858-.749.5551l-1.3455 3.5415c-.1708.5305-.0217.7272.1333.7988a.8568.8568 0 0 0 .3576.0776c.2346 0 .4139-.0952.4678-.2481l.2787-.7297 1.7152.0001.2785.7292c.0541.1532.2335.2484.4681.2484a.8601.8601 0 0 0 .3576-.0775c.1551-.0713.3041-.2681.1329-.7999l-1.3449-3.5398zm-1.3116 2.4433l.5618-1.5961.5618 1.5961H9.3757zm5.9056 1.3836c0 .2843-.2418.5156-.5391.5156h-1.8047c-.2973 0-.5391-.2314-.5391-.5156V9.3281c0-.3102.2576-.5625.5742-.5625s.5742.2523.5742.5625v3.3047h1.1953c.2974 0 .5392.2314.5392.5156z\"/></g></svg>", "copy": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"#8a93a3\" stroke-width=\"2\" stroke-linecap=\"round\" d=\"M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.2 1.2M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.2-1.2\"/></svg>", "other": "<svg class=\"shi\" viewBox=\"0 0 24 24\"><path fill=\"#5b93ff\" d=\"M18 16.08a2.9 2.9 0 0 0-1.96.77L8.9 12.7a3.3 3.3 0 0 0 0-1.4l7.05-4.11A2.92 2.92 0 1 0 15 5a3 3 0 0 0 .06.6L8.04 9.72a3 3 0 1 0 0 4.56l7.1 4.15c-.04.2-.06.4-.06.6a2.92 2.92 0 1 0 2.92-2.95z\"/></svg>"};
SHI.wc='<svg class="shi" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#07C160"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">微</text></svg>';   // 위챗·웨이보 = 글자 배지 (로고 그림 안 베낌, 10-31)
SHI.wb='<svg class="shi" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#E6162D"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">博</text></svg>';
var SH={hd:{ko:"이 앱 공유",en:"Share this app",ja:"このアプリを共有",zhs:"分享此应用",zht:"分享此應用",es:"Compartir esta app"},
 btn:{ko:"공유",en:"Share",ja:"共有",zhs:"分享",zht:"分享",es:"Compartir"},
 sms:{ko:"문자",en:"Message",ja:"メッセージ",zhs:"短信",zht:"簡訊",es:"Mensaje"},
 tg:{ko:"텔레그램",en:"Telegram",ja:"Telegram",zhs:"Telegram",zht:"Telegram",es:"Telegram"},
 fb:{ko:"페이스북",en:"Facebook",ja:"Facebook",zhs:"Facebook",zht:"Facebook",es:"Facebook"},
 band:{ko:"밴드",en:"BAND",ja:"BAND",zhs:"BAND",zht:"BAND",es:"BAND"},
 mail:{ko:"메일",en:"Email",ja:"メール",zhs:"邮件",zht:"郵件",es:"Correo"},
 kakao:{ko:"카카오톡",en:"KakaoTalk",ja:"カカオトーク",zhs:"KakaoTalk",zht:"KakaoTalk",es:"KakaoTalk"},
 copy:{ko:"링크 복사",en:"Copy link",ja:"リンクをコピー",zhs:"复制链接",zht:"複製連結",es:"Copiar enlace"},
 other:{ko:"다른 앱으로",en:"Other apps",ja:"他のアプリ",zhs:"其他应用",zht:"其他應用",es:"Otras apps"},
 kinst:{"ko": "앱 설치", "en": "Install app", "ja": "アプリを入れる", "zhs": "安装应用", "zht": "安裝應用", "es": "Instalar app"},
 kopen:{"ko": "노래방 입장", "en": "Open karaoke", "ja": "カラオケを開く", "zhs": "打开练歌房", "zht": "開啟練歌房", "es": "Abrir karaoke"},
 kdesc:{"ko": "금영 노래방 공식 영상으로 즉시 부르는 온라인 노래방", "en": "Sing right away with official KY karaoke videos", "ja": "KY公式カラオケ動画ですぐ歌えるオンラインカラオケ", "zhs": "用金永(KY)官方卡拉OK视频马上开唱", "zht": "用金永(KY)官方卡拉OK影片馬上開唱", "es": "Canta al instante con vídeos oficiales de karaoke KY"},
 copied:{ko:"링크를 복사했습니다:",en:"Link copied:",ja:"リンクをコピーしました:",zhs:"已复制链接:",zht:"已複製連結:",es:"Enlace copiado:"}};
// ── 공용 공유창 (사장님 10-30) — 노래방 사이트 「이 앱 공유하기」와 영상 공유가 같이 쓴다 (투어앱에서도 이 파일이 쓰이므로 여기 둔다)
//   o = {hd, url, iurl(앱 설치 링크), txt, kk:{title,desc,img,w,h,b1(첫 단추 글자)}} · 카카오 = feed(그림+「b1」「앱 설치」 단추), 안 되면 폰 공유창
var KAKAO_KEY="90a47ca48c2a967dd4d14b3b48de2e3b";
function kShare(o){ var u=o.url, iu=o.iurl||u, txt=o.txt||"", e=encodeURIComponent, il=L(SH.kinst), kk=o.kk||{};
  var it=[["X",SHI.x,"https://twitter.com/intent/tweet?text="+e(o.full?txt+"\n"+il+": "+iu:txt)+"&url="+e(u)],
    [L(SH.sms),SHI.sms,"sms:?&body="+e(txt+" "+u+"\n"+il+": "+iu)],
    [L(SH.tg),SHI.tg,"https://t.me/share/url?url="+e(u)+"&text="+e(txt+"\n"+il+": "+iu)],
    ["LINE",SHI.line,o.full?"https://line.me/R/share?text="+e(txt+"\n"+u+"\n"+il+": "+iu):"https://social-plugins.line.me/lineit/share?url="+e(u)],
    [L(SH.fb),SHI.fb,"https://www.facebook.com/sharer/sharer.php?u="+e(u)],
    [L(SH.band),SHI.band,"https://band.us/plugin/share?body="+e(txt+"\n"+u+"\n"+il+": "+iu)+"&route="+e(u)],
    ["WhatsApp",SHI.wa,"https://api.whatsapp.com/send?text="+e(txt+" "+u+"\n"+il+": "+iu)],
    [L(SH.mail),SHI.mail,"mailto:?subject="+e(kk.title||txt)+"&body="+e(txt+"\n"+u+"\n"+il+": "+iu)],
    [L(SH.kakao),SHI.kakao,"#kakao"],[L(SH.copy),SHI.copy,"#copy"]];
  // 중국 손님 (10-31) — 위챗 = 링크 복사 + QR · 웨이보 = 공유 창 · 중국어 화면이면 맨 앞, 그 밖엔 「링크 복사」 앞
  var cn=[[L(TX.wcB),SHI.wc,"#wechat"],[L(TX.wbB),SHI.wb,"https://service.weibo.com/share/share.php?url="+e(u)+"&title="+e(txt+" "+il+": "+iu)]];
  if(window.LANG==="zhs"||window.LANG==="zht") it=cn.concat(it); else it.splice(it.length-1,0,cn[0],cn[1]);
  if(navigator.share) it.push([L(SH.other),SHI.other,"#share"]);
  var sh=function(){ if(navigator.share) navigator.share({title:kk.title||txt,text:txt+"\n"+il+": "+iu,url:u}).catch(function(){}); };
  var w=document.getElementById("karShr"); if(w) w.remove(); w=document.createElement("div"); w.id="karShr";
  w.innerHTML='<div class="shin"><div class="shhd">'+esc(o.hd||L(SH.hd))+'</div><div class="shgrid">'+it.map(function(a){ var h=a[2];
      if(h.charAt(0)==="#") return '<button type="button" data-a="'+h.slice(1)+'">'+a[1]+' '+esc(a[0])+'</button>';
      return '<a href="'+esc(h)+'"'+(/^(sms|mailto):/.test(h)?'':' target="_blank" rel="noopener"')+'>'+a[1]+' '+esc(a[0])+'</a>'; }).join("")+'</div><div class="shmsg"></div></div>';
  document.body.appendChild(w);
  w.onclick=function(ev){ if(ev.target===w){ w.remove(); return; } var b=ev.target.closest&&ev.target.closest("button[data-a]"); if(!b) return; var m=w.querySelector(".shmsg"), a=b.getAttribute("data-a");
    if(a==="wechat"){ var wt=txt+"\n"+u+"\n"+il+": "+iu; try{ navigator.clipboard.writeText(wt).catch(function(){}); }catch(x){}
      m.innerHTML=esc(L(TX.wcCp))+'<div class="shqr"><div></div><span>'+esc(L(TX.wcQr))+'</span></div>'; kQr(m.querySelector(".shqr>div"),u); try{ ntap("_app","share_wechat"); }catch(x){} return; }
    if(a==="kakao"){ try{ if(!window.Kakao) throw 0; if(!Kakao.isInitialized()) Kakao.init(KAKAO_KEY);
        var ct={title:kk.title||txt,description:kk.desc||"",imageUrl:kk.img||"https://karaoke.moneypuzzle.co.kr/img/card/card_app.png",link:{webUrl:u,mobileWebUrl:u}}; if(kk.w){ ct.imageWidth=kk.w; ct.imageHeight=kk.h||kk.w; } else if(!kk.img){ ct.imageWidth=1200; ct.imageHeight=630; }
        Kakao.Share.sendDefault({objectType:"feed",content:ct,buttons:[{title:kk.b1||L(SH.kopen),link:{webUrl:u,mobileWebUrl:u}},{title:il,link:{webUrl:iu,mobileWebUrl:iu}}]}); return; }
      catch(x){ if(navigator.share){ sh(); return; } } }
    if(a==="share"&&navigator.share){ sh(); return; }
    var cp=o.full?txt+"\n"+u+"\n"+il+": "+iu:u;   // full = 글 + 링크 + 「앱 설치」 링크 같이 복사 (10-31)
    try{ navigator.clipboard.writeText(cp).then(function(){ m.textContent=L(SH.copied)+" "+u; },function(){ m.textContent=u; }); }catch(x){ m.textContent=u; } }; }
// QR 코드 (위챗 스캔용, 10-31) — qrcodejs 1.0.0 (cdnjs, 버전 고정) 를 처음 쓸 때만 불러온다
var KQR=null; function kQr(el,u){ if(!el) return; var bad=function(){ var p=el.parentNode; if(p) p.remove(); };
  var go=function(){ try{ el.innerHTML=""; new QRCode(el,{text:u,width:160,height:160,correctLevel:QRCode.CorrectLevel.M}); }catch(e){ bad(); } };
  if(window.QRCode) return go(); if(!KQR) KQR=new Promise(function(res,rej){ var s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; s.crossOrigin="anonymous"; s.referrerPolicy="no-referrer"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  KQR.then(go).catch(function(){ KQR=null; bad(); }); }
window.karShare=kShare; window.karSHI=SHI; window.karSH=SH;
// ── 공유 카드 그림 (사장님 10-30 「영상과 노래방 점수도 크게 해서 보내자」) — 녹화 영상 1초쯤 장면 + 아래 어두운 띠 + 큰 점수(노란 굵은 글씨) + 작은 곡 제목 + 오른쪽 아래 「StageSong」 · 800x800 JPG
//   그림은 새로 그리지 않는다 — 영상 장면과 글자만
function kGrab(src,cors){ return new Promise(function(res,rej){ var v=document.createElement("video"), done=false, to=0;
  v.muted=true; v.playsInline=true; v.setAttribute("playsinline",""); v.setAttribute("muted",""); v.preload="auto"; if(cors) v.crossOrigin="anonymous";
  var fin=function(ok){ if(done) return; done=true; clearTimeout(to); if(ok&&v.videoWidth) res(v); else rej(new Error("grab")); };
  v.onloadeddata=function(){ var d=v.duration;
    if(!(isFinite(d)&&d>0)){ v.ontimeupdate=function(){ if(v.currentTime>=1){ try{ v.pause(); }catch(e){} fin(true); } }; var pp=v.play(); if(pp&&pp.catch) pp.catch(function(){ fin(true); }); return; }   // 길이 모르는 녹화(webm) = 1초까지 소리 없이 돌려서
    try{ v.currentTime=Math.min(1,d/2); }catch(e){ fin(true); } };
  v.onseeked=function(){ fin(true); }; v.onerror=function(){ fin(false); };
  to=setTimeout(function(){ fin(v.readyState>=2); },7000);
  v.src=src; try{ v.load(); }catch(e){} }); }
function kFit(g,s,w){ s=String(s||""); if(g.measureText(s).width<=w) return s; var a=Array.from(s); while(a.length&&g.measureText(a.join("")+"…").width>w) a.pop(); return a.join("")+"…"; }
function kCardDraw(v,sc,t,ai){ var W=800, c=document.createElement("canvas"); c.width=W; c.height=W; var g=c.getContext("2d"), F="system-ui,-apple-system,'Segoe UI','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif";
  g.fillStyle="#12081f"; g.fillRect(0,0,W,W);
  var vw=v&&(v.videoWidth||v.naturalWidth), vh=v&&(v.videoHeight||v.naturalHeight); if(vw&&vh){ var s=Math.max(W/vw,W/vh), dw=vw*s, dh=vh*s; g.drawImage(v,(W-dw)/2,(W-dh)/2,dw,dh); }
  var has=typeof sc==="number", top=has?440:580, gr=g.createLinearGradient(0,top,0,W); gr.addColorStop(0,"rgba(5,3,10,0)"); gr.addColorStop(0.22,"rgba(5,3,10,.86)"); gr.addColorStop(1,"rgba(5,3,10,.96)"); g.fillStyle=gr; g.fillRect(0,top,W,W-top);
  g.textBaseline="alphabetic"; g.textAlign="left"; g.lineJoin="round";
  if(has){ g.font="700 34px "+F; g.fillStyle="#f5eaff"; g.fillText(kFit(g,t,W-80),40,580);
    var num=String(sc), pt=L(TX.scPt); g.font="900 160px "+F; var nw=g.measureText(num).width;
    g.lineWidth=12; g.strokeStyle="rgba(0,0,0,.6)"; g.strokeText(num,36,742); g.shadowColor="rgba(255,190,40,.7)"; g.shadowBlur=26; g.fillStyle="#ffe066"; g.fillText(num,36,742); g.shadowBlur=0;
    g.font="900 62px "+F; g.lineWidth=8; g.strokeText(pt,36+nw+14,742); g.fillText(pt,36+nw+14,742); }
  else { g.font="800 46px "+F; g.fillStyle="#f5eaff"; g.fillText(kFit(g,t,W-80),40,720); }
  g.font="800 24px "+F; g.textAlign="right"; g.fillStyle="rgba(245,234,255,.92)"; g.fillText("Money Puzzle · StageSong",W-30,W-28); g.textAlign="left";
  g.lineWidth=10; g.strokeStyle="#3b0d5c"; g.strokeRect(5,5,W-10,W-10); g.lineWidth=2; g.strokeStyle="rgba(190,110,255,.55)"; g.strokeRect(11,11,W-22,W-22);   // 초대 카드와 같은 보라 테두리 (10-31)
  if(ai) kAiTag(g,W,W,F,true);   // 상황 사진 카드 = 오른쪽 위에 「AI 생성」 (아래쪽은 잘리므로)
  return c; }
function kCard(src,sc,t,cors){ return kGrab(src,cors).then(function(v){ var c=kCardDraw(v,sc,t); try{ v.removeAttribute("src"); v.load(); }catch(e){}
  return new Promise(function(res,rej){ var q=0.86, go=function(){ try{ c.toBlob(function(b){ if(!b) return rej(new Error("blob")); if(b.size>400*1024&&q>0.5){ q-=0.12; go(); return; } res(b); },"image/jpeg",q); }catch(e){ rej(e); } }; go(); }); }); }
// 「AI 생성」 작은 글자 — 상황 사진·그 카드에 덧그린다 (저장·공유되는 그림에 남게)
function kAiTag(g,W,H,F,top){ var fs=Math.max(14,Math.round(W*0.028)), pd=Math.round(fs*0.45), t=L(TX.aiLb); g.save(); g.font="800 "+fs+"px "+F; g.textAlign="left"; g.textBaseline="middle"; var tw=g.measureText(t).width, bw=tw+pd*2, bh=fs+pd*1.4, x=W-bw-pd*1.5, y=top?pd*1.5:H-bh-pd*1.5;
  g.fillStyle="rgba(0,0,0,.5)"; if(g.roundRect){ g.beginPath(); g.roundRect(x,y,bw,bh,pd); g.fill(); } else g.fillRect(x,y,bw,bh); g.fillStyle="rgba(255,255,255,.94)"; g.fillText(t,x+pd,y+bh/2); g.restore(); }
var KF="system-ui,-apple-system,'Segoe UI','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif";
function kJpg(c,max){ return new Promise(function(res,rej){ var q=0.86, go=function(){ try{ c.toBlob(function(b){ if(!b) return rej(new Error("blob")); if(b.size>max&&q>0.5){ q-=0.1; go(); return; } res(b); },"image/jpeg",q); }catch(e){ rej(e); } }; go(); }); }
function kImg(src){ return new Promise(function(res,rej){ var im=new Image(); im.onload=function(){ res(im); }; im.onerror=rej; im.src=src; }); }
function kCardImg(blob,sc,t){ var u=URL.createObjectURL(blob); return kImg(u).then(function(im){ var c=kCardDraw(im,sc,t,true); try{ URL.revokeObjectURL(u); }catch(e){} return kJpg(c,400*1024); }); }
// ── 사진 확대·이동 (사장님 10-31 「가」) — 두 손가락 벌리면 확대, 확대된 뒤엔 한 손가락으로 이동, 두 번 톡 = 원래 크기
//   노래방 화면 전체 확대(KZ)와 같은 셈법 — 사진 뷰어(.kzv) 안에서만. 화면 전체 확대는 kzOk 가 .kpg/.kpm 이 있으면 안 하므로 겹치지 않는다
function kPz(w){ var im=w&&w.querySelector("img"); if(!im||w._pz) return; w._pz=1; w.setAttribute("data-pz","1"); var Z={s:1,x:0,y:0,g:null,t0:0,tap:0};
  var ap=function(){ if(Z.s<=1.02){ Z.s=1; Z.x=0; Z.y=0; im.style.transform=""; w.classList.remove("on"); return; }
    var W=w.clientWidth, H=w.clientHeight; Z.x=Math.min(0,Math.max(W-W*Z.s,Z.x)); Z.y=Math.min(0,Math.max(H-H*Z.s,Z.y));
    im.style.transform="translate("+Z.x+"px,"+Z.y+"px) scale("+Z.s+")"; w.classList.add("on"); };
  var one=function(t){ Z.g={m:1,px:t.clientX,py:t.clientY,x:Z.x,y:Z.y,mv:0}; };
  w.addEventListener("touchstart",function(e){ var r=w.getBoundingClientRect();
    if(e.touches.length===2){ var a=e.touches[0], c=e.touches[1]; Z.g={p:1,d:Math.hypot(a.clientX-c.clientX,a.clientY-c.clientY)||1,s:Z.s,u:((a.clientX+c.clientX)/2-r.left-Z.x)/Z.s,v:((a.clientY+c.clientY)/2-r.top-Z.y)/Z.s,L:r.left,T:r.top}; Z.tap=0; e.preventDefault(); }
    else if(e.touches.length===1){ one(e.touches[0]); Z.t0=Date.now(); } else Z.g=null; },{passive:false});
  w.addEventListener("touchmove",function(e){ var g=Z.g; if(!g) return;
    if(g.p&&e.touches.length===2){ var a=e.touches[0], c=e.touches[1], d=Math.hypot(a.clientX-c.clientX,a.clientY-c.clientY)||1, ns=Math.min(4,Math.max(1,g.s*d/g.d));
      Z.s=ns; Z.x=(a.clientX+c.clientX)/2-g.L-ns*g.u; Z.y=(a.clientY+c.clientY)/2-g.T-ns*g.v; ap(); e.preventDefault(); }
    else if(g.m&&e.touches.length===1){ var dx=e.touches[0].clientX-g.px, dy=e.touches[0].clientY-g.py; if(Math.abs(dx)+Math.abs(dy)>8) g.mv=1;
      if(Z.s>1){ Z.x=g.x+dx; Z.y=g.y+dy; ap(); e.preventDefault(); } } },{passive:false});
  w.addEventListener("touchend",function(e){ var g=Z.g;
    if(!e.touches.length){ var now=Date.now(), tp=g&&g.m&&!g.mv&&now-Z.t0<300; Z.g=null;
      if(tp){ if(Z.tap&&now-Z.tap<350){ Z.tap=0; Z.s=1; ap(); e.preventDefault(); } else Z.tap=now; } else Z.tap=0; }
    else if(e.touches.length===1) one(e.touches[0]); },{passive:false});
  w.addEventListener("dblclick",function(){ Z.s=1; ap(); });
  w._pzReset=function(){ Z.s=1; ap(); }; }
function kAiSrc(aid){ return HUB+"/kst/ai/"+aid; }
// ── 내 AI 사진 모음 (사장님 10-31 「AI 사진을 영상으로 바꿨더니 사라졌다」) — 만든 사진은 허브 목록에 모두 남는다 · 3열 격자 · 누르면 크게
function kAiGal(S){ var o=pgOpen("kaig"); if(!o) return; kAivCss(); var G={o:o,items:null,err:0,aip:"",vids:[]};
  kGet("/kst/aivlist").then(function(j){ if(j&&j.ok){ G.vids=j.items||[]; if(o.isConnected&&G.items!==null) G.draw(); } }).catch(function(){});   // AI 영상 (10-31)
  G.load=function(){ kGet("/kst/ailist").then(function(j){ if(!o.isConnected) return; if(j&&j.ok){ G.items=j.items||[]; G.aip=j.aip||""; G.err=0; } else { G.items=G.items||[]; G.err=1; } G.draw(); })
    .catch(function(){ if(!o.isConnected) return; G.items=G.items||[]; G.err=1; G.draw(); }); };
  G.chg=function(){ if(S&&S.o&&S.o.isConnected&&S.loadMe) S.loadMe(); };
  G.draw=function(){ var body, n=G.items?G.items.length:0;
    if(G.items===null) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(G.err&&!n) body='<div class="kstge">'+esc(L(TX.stF))+'</div>';
    else if(!n&&!G.vids.length) body='<div class="kstge">'+esc(L(TX.aiGE))+'</div>';
    else body=(G.vids.length?'<b class="kh">'+esc(L(TX.aivT))+' · '+kNum(G.vids.length)+'</b><div class="kpkp kaivg">'+G.vids.map(function(x,i){ return '<button type="button" data-v="'+i+'"><video muted playsinline preload="metadata" src="'+esc(x.url)+'#t=0.5"></video><em>'+esc(L(TX.aiLb))+'</em><small>'+esc(kDay(x.at)[0])+'</small></button>'; }).join("")+'</div>'+(n?'<b class="kh">'+esc(L(TX.aiG))+' · '+kNum(n)+'</b>':''):'')+(!n?'':'<div class="kpkp kaigd">'+G.items.map(function(x,i){ var cur=x.aid===G.aip;
      return '<button type="button" data-i="'+i+'"'+(cur?' class="on"':'')+'><img src="'+esc(kAiSrc(x.aid))+'" alt="" loading="lazy"><small>'+esc(cur?L(TX.aiNow):kDay(x.at)[0])+'</small></button>'; }).join("")+'</div>');
    o.innerHTML=kHead('<h3>'+esc(L(TX.aiGT))+(n?' · '+kNum(n):'')+'</h3>')+'<div class="kpgb">'+body+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll(".kaigd button"),function(c){ c.onclick=function(){ var x=G.items[+c.dataset.i]; if(x) kAiView(G,x,S); }; });
    [].forEach.call(o.querySelectorAll(".kaivg button"),function(c){ c.onclick=function(){ var x=G.vids[+c.dataset.v]; if(x) kAivView(G,x); }; }); };
  G.draw(); G.load(); try{ ntap("kara_stage","aigal"); }catch(e){} }
// AI 사진 크게 보기 — 확대·이동 + 프로필로 쓰기 · 공유 카드로 쓰기 · 지우기
function kAiView(G,x,S){ var o=pgOpen("kaiv"); if(!o) return; var busy=false, d=kDay(x.at);
  var draw=function(){ var cur=G.aip===x.aid;
    o.innerHTML=kHead('<h3>'+esc(L(TX.aiG))+' · '+esc(d[0])+'</h3>')+'<div class="kpgb"><div class="kzv"><img src="'+esc(kAiSrc(x.aid))+'" alt=""></div><p class="km">'+esc(L(TX.aiZm))+'</p>'
      +'<div class="kaib"><button type="button" class="kbt'+(cur?' g':'')+'" data-ap="1"'+(cur?' disabled':'')+'>'+esc(L(cur?TX.aiNow:TX.aiUse))+'</button><button type="button" class="kbt g" data-ac="1">'+esc(L(TX.aiCard))+'</button><button type="button" class="kbt r" data-ad="1">'+esc(L(TX.del))+'</button></div></div>';
    o.querySelector(".kpbk").onclick=pgBack; kPz(o.querySelector(".kzv"));
    var ap=o.querySelector("[data-ap]"); ap.onclick=function(){ if(busy||cur) return; busy=true; ap.disabled=true;
      kPost("/kst/me",{aip:x.aid}).then(function(j){ busy=false; if(j&&j.ok){ G.aip=x.aid; if(S){ S.me=j; if(S.o&&S.o.isConnected) S.draw(); } G.draw(); draw(); soon(L(TX.aiPOk)); return; } ap.disabled=false; soon(L(TX.aiF)); })
        .catch(function(){ busy=false; ap.disabled=false; soon(L(TX.upNet)); }); };
    o.querySelector("[data-ac]").onclick=function(){ kAiCardPick(x,S); };
    var dl=o.querySelector("[data-ad]"); dl.onclick=function(){ if(busy||!window.confirm(L(TX.aiDelQ))) return; busy=true; dl.disabled=true;
      kPost("/kst/aidel",{aid:x.aid}).then(function(j){ busy=false; if(j&&j.ok){ G.items=(G.items||[]).filter(function(y){ return y.aid!==x.aid; }); if(G.aip===x.aid) G.aip=""; G.draw(); G.chg(); pgBack(); soon(L(TX.aiDelOk)); return; } dl.disabled=false; soon(L(TX.delF)); })
        .catch(function(){ busy=false; dl.disabled=false; soon(L(TX.delF)); }); }; };
  draw(); }
// AI 사진을 내 영상 하나의 공유 카드로 — 공유되는 영상(나만 보기 빼고)만 · 카드 = 사진 + 점수·제목(kCardImg) → /kst/thumb
function kAiCardPick(x,S){ var o=pgOpen("kpick"); if(!o) return; var mine=null, busy=false;
  var draw=function(msg){ var body, vs=(mine||[]).filter(function(v){ return v.vis!=="me"; });
    if(mine===null) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(!vs.length) body='<div class="kstge">'+esc(L(TX.acE))+'</div>';
    else body='<p class="km">'+esc(L(TX.acPk))+'</p>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<div class="kpkp">'+vs.map(function(v){ return '<button type="button" data-id="'+esc(v.id)+'">'+kThumb(v.id,"")+'<small>'+esc(kDay(v.at)[0])+'</small></button>'; }).join("")+'</div>';
    o.innerHTML=kHead('<h3>'+esc(L(TX.aiCard))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll(".kpkp button"),function(c){ c.onclick=function(){ var v=vs.filter(function(y){ return y.id===c.dataset.id; })[0]; if(!v||busy) return; busy=true; soon(L(TX.shPrep));
      fetch(kAiSrc(x.aid)).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(bl){ return kCardImg(bl,v.sc,v.t); }).then(function(jpg){ return kThUp(v.id,jpg); })
        .then(function(ok){ busy=false; if(!ok) throw 0; v.th=1; if(S&&S.items) S.items.forEach(function(y){ if(y.id===v.id) y.th=1; }); soon(L(TX.acOk)); if(o.isConnected) pgBack(); })
        .catch(function(){ busy=false; if(o.isConnected) draw(L(TX.fail)); }); }; }); };
  if(S&&S.tab==="me"&&S.items&&!S.err){ mine=S.items.slice(); draw(); }
  else { draw(); kGet("/kst/list?scope=me").then(function(j){ mine=(j&&j.ok&&j.items)||[]; if(o.isConnected) draw(); }).catch(function(){ mine=[]; if(o.isConnected) draw(L(TX.stF)); }); } }
// ── 상황 사진 만들기 (사장님 10-30 테마방) — 녹화의 카메라 장면(본인) → 허브 /kst/aiphoto (구글 Gemini) → 「AI 생성」 덧그려 /kst/aiput
//   장면 칩 6개(테마마다) + 「다른 장면」(무작위) · 그리는 중 최대 60초 · 하루 30장(허브) · 사진을 따로 올리는 길은 없다 · 가격 표시 없음(시험판)
function kAiOpen(){ var b=box(), th=REC.th, T=kTh(th); if(!b||!REC.frc||!T) return; var o=b.querySelector(".kaim"); if(o) o.remove();
  o=document.createElement("div"); o.className="kpm kaim"; b.appendChild(o);
  var A={sc:"",busy:false,res:null,msg:"",used:false,ac:null}, fr=REC.frc;
  var draw=function(){ var r=A.res;
    o.innerHTML='<div><h3><img class="kaih" src="img/kara/kst_theme.png" alt="">'+esc(Lp(T[1]))+'</h3>'
      +'<div class="kaic">'+T[2].map(function(x){ return '<button type="button" data-sc="'+x[0]+'"'+(x[0]===A.sc?' class="on"':'')+(A.busy?' disabled':'')+'>'+esc(Lp(x[1]))+'</button>'; }).join("")+'<button type="button" class="krn" data-rn="1"'+(A.busy?' disabled':'')+'>'+esc(L(TX.aiRnd))+'</button></div>'
      +(A.busy?'<div class="kaiw"><i></i>'+esc(L(TX.aiIng))+'</div>':r?'<div class="kzv kaiz"><img class="kaiimg" src="'+r.url+'" alt=""></div><p class="km">'+esc(L(TX.aiZm))+'</p>':'<p class="km">'+esc(L(TX.aiPick))+'</p>')
      +(A.msg?'<div class="kerr">'+esc(A.msg)+'</div>':'')
      +'<p class="km">'+esc(L(TX.aiN))+'</p>'
      +(r&&!A.busy?'<button type="button" class="kgo" data-ap="1">'+esc(L(TX.aiProf))+'</button><button type="button" class="kgo kg2'+(A.used?' on':'')+'" data-ac="1">'+esc(L(TX.aiCard))+'</button>':'')
      +'<button type="button" class="kc" data-ax="1">'+esc(L(TX.aiX))+'</button></div>';
    var zv=o.querySelector(".kzv"); if(zv) kPz(zv);   // 결과 사진 확대·이동 (10-31)
    [].forEach.call(o.querySelectorAll("[data-sc]"),function(x){ x.onclick=function(){ gen(x.dataset.sc); }; });
    o.querySelector("[data-rn]").onclick=function(){ var ks=T[2].map(function(x){ return x[0]; }).filter(function(k){ return k!==A.sc; }); gen(ks[Math.floor(Math.random()*ks.length)]); };
    o.querySelector("[data-ax]").onclick=function(){ if(A.ac) try{ A.ac.abort(); }catch(e){} o.remove(); };
    var ap=o.querySelector("[data-ap]"); if(ap) ap.onclick=function(){ var rr=A.res; ap.disabled=true; rr.put.then(function(ok){ if(!ok) throw 0; return kPost("/kst/me",{aip:rr.aid}); }).then(function(j){ ap.disabled=false; soon(L(j&&j.ok?TX.aiPOk:TX.aiF)); }).catch(function(){ ap.disabled=false; soon(L(TX.aiF)); }); };
    var ac=o.querySelector("[data-ac]"); if(ac) ac.onclick=function(){ REC.aiCard={aid:A.res.aid,blob:A.res.blob}; A.used=true; draw(); soon(L(TX.aiCOk)); }; };
  var fail=function(m){ A.busy=false; A.ac=null; A.msg=m||L(TX.aiF); draw(); };
  var gen=function(k){ if(A.busy) return; if(!sess()){ soon(L(TX.lgReq)); kLogin(function(){ gen(k); }); return; }   // 상황 사진 = 로그인 + 3,000P (10-31 출시판)
    if(!A.pq){ var ask=function(){ var pc=(KP.d.use&&KP.d.use.ai)||3000; kptAsk(pc,Lp(T[1]),function(done){ done(); A.pq={rid:kRid()}; gen(k); },"",L(TX.kwBuyB)); };   // 모자라면 kptAsk 가 「충전」 단추
      if(kptOn()) ask(); else kptLoad().then(function(){ if(kptOn()) ask(); else fail(); }); return; }
    gen0(k); };   // 포인트 (10-31)
  var gen0=function(k){ var pq=A.pq; A.pq=null; if(A.busy) return; A.sc=k; A.busy=true; A.msg=""; draw(); try{ ntap("kara_ai",th+"_"+k); }catch(e){}
    var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ctl) try{ ctl.abort(); }catch(e){} },60000); A.ac=ctl;
    kJpg(fr,580*1024).then(function(jpg){ return fetch(HUB+"/kst/aiphoto?th="+th+"&sc="+k+"&"+kQs()+(pq?"&pt=1&rid="+pq.rid:""),{method:"POST",headers:{"Content-Type":"image/jpeg"},body:jpg,signal:ctl?ctl.signal:undefined}); })
      .then(function(r){ return r.json(); }).then(function(j){ clearTimeout(to); if(!o.isConnected) return;
        if(!(j&&j.ok&&j.b64)){ if(j&&j.err==="login"){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} fail(L(TX.lgReq)); kLogin(); return; } fail(j&&j.err==="pt"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):L(j&&(j.err==="cap"||j.err==="ucap"||j.err==="rate")?TX.aiCap:TX.aiF)); if(pq) kptLoad(); return; } if(pq) kptLoad();
        return kImg("data:"+(j.mime||"image/jpeg")+";base64,"+j.b64).then(function(im){ var s=Math.min(1,1200/Math.max(im.naturalWidth,im.naturalHeight)), w=Math.round(im.naturalWidth*s), h=Math.round(im.naturalHeight*s), c=mkc0(w,h), g=c.getContext("2d");
          g.drawImage(im,0,0,w,h); kAiTag(g,w,h,KF,false); return kJpg(c,580*1024); }).then(function(bl){ if(A.res) try{ URL.revokeObjectURL(A.res.url); }catch(e){}
          var put=fetch(HUB+"/kst/aiput?aid="+j.aid+"&"+kQs(),{method:"POST",headers:{"Content-Type":"image/jpeg"},body:bl}).then(function(r){ return r.json(); }).then(function(x){ return !!(x&&x.ok); }).catch(function(){ return false; });
          A.res={aid:j.aid,blob:bl,url:URL.createObjectURL(bl),put:put}; A.used=false; A.busy=false; A.ac=null; draw(); }); })
      .catch(function(){ clearTimeout(to); if(o.isConnected) fail(); }); };
  o.onclick=function(e){ if(e.target===o&&!A.busy) o.remove(); };
  draw(); }
// ── AI 영상 (사장님 10-31) — 녹화 구간(최대 15초) → 허브 /kst/aivid (Runway Aleph 2.0) → 테마 장면 영상 · 로그인 + 포인트(가격은 허브 설정, 관리자에서 변경)
//   흐름: 테마·장면 칩 → 구간 막대(처음 = 음량이 가장 큰 구간, 못 재면 처음부터) → 포인트 확인(kptAsk) → 구간을 기기에서 다시 녹화(kMix: 캔버스+소리 → mp4/webm) → 올리기 → 5초마다 상태 → 결과
//   구간 자르기 = 기기에서 — <video> 를 캔버스에 그려 captureStream(30fps) + WebAudio 소리로 MediaRecorder (웹·앱 같은 길, 서버 ffmpeg 없음)
//   결과 영상은 얼굴·동작만 바꾼 그림이라 재생·게시·저장 때 원본 구간 소리를 맞춰 붙인다 · 게시·저장 파일 = 「AI 생성」 글자 덧그림
var KAV={cfg:null,css:0};
function kAivCss(){ if(KAV.css) return; KAV.css=1; var s=document.createElement("style");
  s.textContent="#karBox .kpv .kaib.kaiv{background:#6c4cff}#karBox .kaivp{position:relative;border-radius:12px;overflow:hidden;background:#000}#karBox .kaivp video{display:block;width:100%;max-height:50vh;background:#000}"
   +"#karBox .kaivb{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.62);color:#fff;font-size:12px;font-weight:800;padding:3px 8px;border-radius:8px;pointer-events:none}"
   +"#karBox .kaivs video{display:block;width:100%;max-height:30vh;border-radius:10px;background:#000}#karBox .kaivs input[type=range]{width:100%;accent-color:#ff4fd8;margin:8px 0 2px}"
   +"#karBox .kaivt{display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:#ffe066}#karBox .kaivpv{margin-top:6px;width:100%}#karBox .kaiwp{font-size:12px;opacity:.75;font-weight:700}"
   +"#karBox .kaivg{margin-bottom:12px}#karBox .kaivg button em{position:absolute;top:4px;right:4px;background:rgba(0,0,0,.62);color:#fff;font-size:10px;font-style:normal;font-weight:800;padding:1px 5px;border-radius:6px}"
   +"#karBox .kaivsh .kgo{display:block;width:100%;box-sizing:border-box}#karBox .kaivsv{display:flex;gap:8px}#karBox .kaivsv>*{flex:1;text-align:center;text-decoration:none}";
  document.head.appendChild(s); }
function kAivCfg(){ return kGet("/kst/aivcfg").then(function(j){ if(j&&j.ok) KAV.cfg=j; return KAV.cfg; }).catch(function(){ return KAV.cfg; }); }
function kMt(){ if(!window.MediaRecorder) return ""; return ["video/mp4;codecs=avc1,mp4a.40.2","video/mp4","video/webm;codecs=vp8,opus","video/webm"].filter(function(x){ try{ return MediaRecorder.isTypeSupported(x); }catch(e){ return false; } })[0]||""; }
function kSec(t){ t=Math.max(0,Math.round(t||0)); return Math.floor(t/60)+":"+("0"+(t%60)).slice(-2); }
// 음량이 가장 큰 len 초의 시작(초) — 소리를 풀지 못하면 0
function kLoud(blob,len){ var AC=window.AudioContext||window.webkitAudioContext; if(!AC||!blob||!blob.arrayBuffer||blob.size>150*1048576) return Promise.resolve(0);
  return blob.arrayBuffer().then(function(ab){ var ac=new AC(); return new Promise(function(res,rej){ var p=ac.decodeAudioData(ab,res,rej); if(p&&p.catch) p.catch(rej); }).then(function(bf){ try{ ac.close(); }catch(e){}
    var d=bf.getChannelData(0), sr=Math.round(bf.sampleRate), n=Math.floor(d.length/sr), e=[], i, k, s;
    for(i=0;i<n;i++){ s=0; for(k=i*sr;k<(i+1)*sr;k+=16) s+=d[k]*d[k]; e.push(s); }
    var ln=Math.min(len,n); if(n<=ln) return 0; var w=0; for(i=0;i<ln;i++) w+=e[i]; var best=w, bi=0;
    for(i=ln;i<n;i++){ w+=e[i]-e[i-ln]; if(w>best){ best=w; bi=i-ln+1; } } return bi; }); }).catch(function(){ return 0; }); }
// 다시 녹화 — o = {v: 그림 영상 주소, a: 소리 영상 주소(없으면 v), t0, a0, len, tag(「AI 생성」 덧그림), onP(%)} → Promise(Blob)
//   🔴 손 누름 안에서 바로 불러야 한다(아이폰 소리 재생 허락) · 주소는 blob: 이어야 캔버스가 막히지 않는다
function kMix(o){ return new Promise(function(res,rej){ var AC=window.AudioContext||window.webkitAudioContext, mt=kMt(), cv=document.createElement("canvas");
    if(!AC||!mt||!cv.captureStream){ rej(new Error("nosup")); return; }
    var mk=function(src,mute){ var v=document.createElement("video"); v.playsInline=true; v.setAttribute("playsinline",""); v.preload="auto"; v.muted=!!mute; v.src=src; v.style.cssText="position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none"; document.body.appendChild(v); return v; };
    var same=!o.a||o.a===o.v, V=mk(o.v,!same), A=same?V:mk(o.a,false), ac=new AC(), dst=ac.createMediaStreamDestination(), done=false, mr=null, ch=[], raf=0, tmo=0;
    try{ ac.createMediaElementSource(A).connect(dst); }catch(e){}
    var end=function(err,bl){ if(done) return; done=true; cancelAnimationFrame(raf); clearTimeout(tmo); [V,A].forEach(function(x){ try{ x.pause(); x.removeAttribute("src"); x.load(); x.remove(); }catch(e){} }); try{ ac.close(); }catch(e){} if(err) rej(err); else res(bl); };
    var ready=function(v){ return new Promise(function(r){ if(v.readyState>=1) r(); else { v.addEventListener("loadedmetadata",function(){ r(); },{once:true}); v.addEventListener("error",function(){ r(); },{once:true}); } }); };
    var seek=function(v,t){ return new Promise(function(r){ if(Math.abs((v.currentTime||0)-t)<0.05){ r(); return; } v.addEventListener("seeked",function(){ r(); },{once:true}); try{ v.currentTime=t; }catch(e){ r(); } setTimeout(r,4000); }); };
    tmo=setTimeout(function(){ end(new Error("time")); },(o.len+45)*1000);
    try{ ac.resume(); }catch(e){} [V,A].forEach(function(x){ try{ var p=x.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){} });
    Promise.all([ready(V),ready(A)]).then(function(){ V.pause(); A.pause(); return Promise.all([seek(V,o.t0||0),same?null:seek(A,o.a0||0)]); }).then(function(){
      var w=V.videoWidth||720, h=V.videoHeight||1280, s=Math.min(1,1280/Math.max(w,h)); w=Math.max(2,Math.round(w*s/2)*2); h=Math.max(2,Math.round(h*s/2)*2); cv.width=w; cv.height=h; var g=cv.getContext("2d");
      var draw=function(){ try{ g.drawImage(V,0,0,w,h); }catch(e){} if(o.tag) kAiTag(g,w,h,KF,true); };
      draw();
      mr=new MediaRecorder(new MediaStream(cv.captureStream(30).getVideoTracks().concat(dst.stream.getAudioTracks())),{mimeType:mt,videoBitsPerSecond:3000000,audioBitsPerSecond:128000});
      mr.ondataavailable=function(e){ if(e.data&&e.data.size) ch.push(e.data); };
      mr.onstop=function(){ end(null,new Blob(ch,{type:mt.split(";")[0]})); };
      mr.onerror=function(){ end(new Error("rec")); };
      var t1=(o.t0||0)+o.len, w0=performance.now(), loop=function(){ if(done) return; draw(); if(o.onP) o.onP(Math.max(0,Math.min(99,Math.round((V.currentTime-(o.t0||0))*100/o.len))));
        if(V.currentTime>=t1-0.05||V.ended||performance.now()-w0>=o.len*1000-80){ V.pause(); A.pause(); if(mr.state!=="inactive") mr.stop(); return; } raf=requestAnimationFrame(loop); };
      return Promise.all([V.play(),same?null:A.play()]).then(function(){ mr.start(500); w0=performance.now(); raf=requestAnimationFrame(loop); });   // 재생이 시작된 뒤에 녹화 — 앞에 빈 시간이 붙지 않게
    }).catch(function(e){ end(e||new Error("play")); }); }); }
// 결과 재생 — AI 영상(소리 끔) + 원본 구간 소리를 맞춰 튼다 · 오른쪽 위 「AI 생성」
function kAivPlayer(host,url,src){ host.innerHTML='<div class="kaivp"><video class="kaivv" playsinline controls loop muted preload="auto" src="'+esc(url)+'"></video><span class="kaivb">'+esc(L(TX.aiLb))+'</span></div>';
  var V=host.querySelector("video"), A=null; if(!src) return V;
  A=document.createElement("audio"); A.preload="auto"; A.src=src; host.appendChild(A);
  var sync=function(){ try{ if(Math.abs(A.currentTime-V.currentTime)>0.3) A.currentTime=V.currentTime; }catch(e){} };
  V.addEventListener("play",function(){ sync(); var p=A.play(); if(p&&p.catch) p.catch(function(){}); });
  V.addEventListener("pause",function(){ A.pause(); });
  V.addEventListener("seeked",sync); V.addEventListener("timeupdate",sync);
  V.addEventListener("ended",function(){ A.pause(); });
  return V; }
function kBlobUrl(u){ return fetch(u).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){ return URL.createObjectURL(b); }); }
// 저장/공유 — 합성(소리+「AI 생성」) 뒤 「저장」 링크·「공유」 단추 (공유는 새 손 누름이 있어야 열린다)
function kAivSave(host,S){ /* S = {ai: blob 주소 약속, src: blob 주소 약속, len, file:null} */
  var paint=function(msg){ if(S.file){ var u=URL.createObjectURL(S.file), ext=/mp4/.test(S.file.type)?"mp4":"webm";
      host.innerHTML='<div class="kaivsv"><a class="kgo" href="'+u+'" download="StageSong_AI.'+ext+'">'+esc(L(TX.aivSv))+'</a>'+(navigator.canShare&&navigator.canShare({files:[S.file]})?'<button type="button" class="kgo kg2" data-sh="1">'+esc(L(TX.aivSh))+'</button>':'')+'</div>';
      var sh=host.querySelector("[data-sh]"); if(sh) sh.onclick=function(){ navigator.share({files:[S.file],title:"StageSong"}).catch(function(){}); }; return; }
    host.innerHTML=(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo kg2" data-sv="1"'+(S.busy?' disabled':'')+'>'+esc(S.busy?tf(L(TX.aivMix),{p:S.p||0}):L(TX.aivSave))+'</button>';
    var b=host.querySelector("[data-sv]"); if(b) b.onclick=go; };
  var go=function(){ if(S.busy) return; S.busy=true; S.p=0; paint();
    Promise.all([S.ai,S.src]).then(function(a){ return kMix({v:a[0],a:a[1]||a[0],t0:0,a0:0,len:S.len,tag:true,onP:function(p){ S.p=p; var bt=host.querySelector("[data-sv]"); if(bt) bt.textContent=tf(L(TX.aivMix),{p:p}); }}); })
      .then(function(bl){ S.busy=false; S.file=new File([bl],"StageSong_AI."+(/mp4/.test(bl.type)?"mp4":"webm"),{type:bl.type}); paint(); })
      .catch(function(){ S.busy=false; paint(L(TX.aivMixF)); }); };
  paint(""); }
function kAivOpen(){ var b=box(); if(!b||!REC.blob) return; kAivCss(); var o=b.querySelector(".kaivm"); if(o) o.remove();
  o=document.createElement("div"); o.className="kpm kaim kaivm"; b.appendChild(o);
  var A={th:REC.th||"",sc:"",st:"pick",t0:0,len:0,dur:0,msg:"",p:0,vid:"",res:null,clip:null,auto:0,pt:0}, pv=null, pvT=0;
  var T=function(){ return A.th?kTh(A.th):null; };
  var scN=function(){ var t=T(); if(!t) return ""; var x=t[2].filter(function(y){ return y[0]===A.sc; })[0]; return x?Lp(x[1]):""; };
  var setDur=function(d){ var mx=(KAV.cfg&&KAV.cfg.max)||15; A.dur=d; A.len=Math.min(mx,Math.floor(d)); if(A.t0>A.dur-A.len) A.t0=Math.max(0,A.dur-A.len); };
  var segH=function(){ var mx=(KAV.cfg&&KAV.cfg.max)||15, span=Math.max(0,A.dur-A.len);
    return '<b class="kh">'+esc(tf(L(TX.aivSeg),{n:mx}))+'</b><div class="kaivs"><video playsinline preload="auto" src="'+REC.url+'"></video>'
      +(A.len>=3?'<input type="range" min="0" max="'+span.toFixed(1)+'" step="0.5" value="'+A.t0.toFixed(1)+'"'+(span<=0?' disabled':'')+'><div class="kaivt"><span>'+kSec(A.t0)+' ~ '+kSec(A.t0+A.len)+'</span><span>'+esc(tf(L(TX.aivSecs),{n:A.len}))+'</span></div><p class="km">'+esc(L(TX.aivSegN))+'</p><button type="button" class="krf kaivpv" data-pv="1">'+esc(L(TX.aivPv))+'</button>'
        :A.dur?'<div class="kerr">'+esc(L(TX.aivShort))+'</div>':'<p class="km">'+esc(L(TX.lo))+'</p>')+'</div>'; };
  var draw=function(){ var t=T(), h='<div><h3><img class="kaih" src="img/kara/kst_vid.png" alt="">'+esc(L(TX.aivT))+(t?' · '+esc(Lp(t[1])):'')+'</h3>';
    if(A.st==="pick"){
      if(!REC.th) h+='<b class="kh">'+esc(L(TX.aivTh))+'</b><div class="kaic">'+KTH_LIST.map(function(x){ return '<button type="button" data-th="'+x[0]+'"'+(x[0]===A.th?' class="on"':'')+'>'+esc(Lp(x[1]))+'</button>'; }).join("")+'</div>';
      if(t) h+='<b class="kh">'+esc(L(TX.aivScH))+'</b><div class="kaic">'+t[2].map(function(x){ return '<button type="button" data-sc="'+x[0]+'"'+(x[0]===A.sc?' class="on"':'')+'>'+esc(Lp(x[1]))+'</button>'; }).join("")+'</div>';
      h+=segH()+'<p class="km">'+esc(L(TX.aivN))+'</p>'+(A.msg?'<div class="kerr">'+esc(A.msg)+'</div>':'')
        +'<button type="button" class="kgo" data-go="1"'+(!t||A.len<3?' disabled':'')+'>'+esc(L(TX.aivMk))+(KAV.cfg?' · '+ptS(KAV.cfg.price):'')+'</button>'; }
    else if(A.st==="prep"||A.st==="send"||A.st==="ing"){ var tx=A.st==="prep"?tf(L(TX.aivPrep),{p:A.p}):A.st==="send"?L(TX.aivSend):L(TX.aivIng)+(A.p>0?' · '+Math.round(A.p*100)+'%':'');
      h+='<div class="kaiw"><i></i><span class="kaiwt">'+esc(tx)+'</span></div><p class="km">'+esc(L(TX.aivBg))+'</p>'; }
    else if(A.st==="res"){ h+='<div class="kaivr"></div><p class="km">'+esc(L(TX.aivOk))+'</p><button type="button" class="kgo" data-post="1">'+esc(L(TX.aivPost))+'</button><div class="kaivsh"></div>'; }
    else if(A.st==="fail"){ h+='<div class="kerr">'+esc(A.msg||L(TX.aivF))+'</div><button type="button" class="krf" data-again="1">'+esc(L(TX.aivAgain))+'</button>'; }
    h+='<button type="button" class="kc" data-x="1">'+esc(L(TX.aiX))+'</button></div>'; o.innerHTML=h; wire(); };
  var wire=function(){ var q=function(s){ return o.querySelector(s); };
    [].forEach.call(o.querySelectorAll("[data-th]"),function(x){ x.onclick=function(){ A.th=x.dataset.th; A.sc=kTh(A.th)[2][0][0]; A.msg=""; draw(); }; });
    [].forEach.call(o.querySelectorAll("[data-sc]"),function(x){ x.onclick=function(){ A.sc=x.dataset.sc; A.msg=""; [].forEach.call(o.querySelectorAll("[data-sc]"),function(y){ y.classList.toggle("on",y===x); }); }; });
    pv=q(".kaivs video");
    if(pv){ var meta=function(){ if(!A.dur){ var d=isFinite(pv.duration)&&pv.duration>0?pv.duration:(REC.dur||0); if(d){ setDur(d); A.auto=1; draw(); kLoud(REC.blob,A.len).then(function(s){ if(A.st!=="pick"||A.t0) return; A.t0=Math.min(s,Math.max(0,A.dur-A.len)); if(o.isConnected) draw(); }); } return; } try{ pv.currentTime=A.t0+0.05; }catch(e){} };
      if(pv.readyState>=1) meta(); else pv.addEventListener("loadedmetadata",meta,{once:true}); }
    var rg=q(".kaivs input[type=range]"); if(rg) rg.oninput=function(){ A.t0=+rg.value||0; var sp=q(".kaivt span"); if(sp) sp.textContent=kSec(A.t0)+" ~ "+kSec(A.t0+A.len); try{ pv.pause(); pv.currentTime=A.t0; }catch(e){} };
    var pb=q("[data-pv]"); if(pb) pb.onclick=function(){ if(!pv) return; clearTimeout(pvT); try{ pv.currentTime=A.t0; pv.play(); }catch(e){} var st=function(){ if(pv.currentTime>=A.t0+A.len){ pv.pause(); return; } pvT=setTimeout(st,200); }; st(); };
    var gb=q("[data-go]"); if(gb) gb.onclick=go;
    var ag=q("[data-again]"); if(ag) ag.onclick=function(){ A.st="pick"; A.msg=""; draw(); };
    q("[data-x]").onclick=function(){ A.gone=1; clearTimeout(A.pt); clearTimeout(pvT); o.remove(); };
    if(A.st==="res"&&A.res){ var host=q(".kaivr"); kAivPlayer(host,A.res.url,A.res.audio);
      kAivSave(q(".kaivsh"),A.res.S);
      q("[data-post]").onclick=post; } };
  var errM=function(j){ var e=j&&j.err; return e==="pt"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):e==="ucap"?tf(L(TX.aivCapU),{n:(KAV.cfg&&KAV.cfg.ucap)||3}):e==="cap"||e==="rate"?L(TX.aiCap):e==="dur"||e==="long"?L(TX.aivLong):e==="big"?L(TX.upBig):L(TX.aivF0); };
  var go=function(){ if(!A.th||A.len<3) return; if(!sess()){ soon(L(TX.lgReq)); kLogin(go); return; }
    var ask=function(){ var c=KAV.cfg; if(!c){ A.msg=L(TX.aivF0); draw(); return; } if(!c.left||!c.uleft){ A.msg=c.left?tf(L(TX.aivCapU),{n:c.ucap}):L(TX.aiCap); draw(); return; }
      if(!kMt()){ A.msg=L(TX.aivNo); draw(); return; }
      kptAsk(c.price,L(TX.aivT)+" · "+Lp(T()[1])+" · "+scN(),function(done){ done(); start(kRid()); },"",L(TX.aivMk)); };
    var pre=function(){ if(kptOn()) ask(); else kptLoad().then(function(){ if(kptOn()) ask(); else { A.msg=L(TX.aivF0); draw(); } }); };
    kAivCfg().then(pre); };
  var start=function(rid){ A.st="prep"; A.p=0; A.msg=""; draw(); try{ ntap("kara_aiv",A.th+"_"+A.sc); }catch(e){}
    kMix({v:REC.url,t0:A.t0,len:A.len,onP:function(p){ A.p=p; var s=o.querySelector(".kaiwt"); if(s) s.textContent=tf(L(TX.aivPrep),{p:p}); }}).then(function(clip){ if(A.gone) return;
      if(clip.size>32*1048576){ A.st="fail"; A.msg=L(TX.upBig); draw(); return; }
      A.clip=clip; A.st="send"; draw();
      return fetch(HUB+"/kst/aivid?th="+A.th+"&sc="+A.sc+"&rid="+rid+"&dur="+A.len+"&"+kQs(),{method:"POST",headers:{"Content-Type":clip.type.split(";")[0]},body:clip}).then(function(r){ return r.json(); }).then(function(j){ kptLoad();
        if(j&&j.ok&&j.vid){ A.vid=j.vid; A.st="ing"; A.p=0; draw(); poll(Date.now()); return; }
        if(j&&j.err==="login"){ try{ localStorage.removeItem("mpv_pg_sess"); }catch(e){} kLogin(); }
        A.st="fail"; A.msg=j&&j.err==="login"?L(TX.lgReq):errM(j); draw(); }); })
      .catch(function(e){ if(A.gone) return; A.st="fail"; A.msg=e&&e.message==="nosup"?L(TX.aivNo):L(TX.aivF0); draw(); }); };
  var poll=function(t0){ clearTimeout(A.pt); A.pt=setTimeout(function(){ if(A.gone||!o.isConnected) return;
      kGet("/kst/aivst?vid="+A.vid).then(function(j){ if(A.gone||!o.isConnected) return;
        if(j&&j.ok&&j.st==="ok"){ var srcB=A.clip?URL.createObjectURL(A.clip):null; A.res={url:j.url,audio:srcB||j.src,S:{ai:kBlobUrl(j.url),src:srcB?Promise.resolve(srcB):kBlobUrl(j.src),len:A.len}}; A.st="res"; draw(); return; }
        if(j&&j.ok&&j.st==="fail"){ kptLoad(); A.st="fail"; A.msg=L(TX.aivF); draw(); return; }
        if(j&&j.ok){ A.p=j.p||0; var s=o.querySelector(".kaiwt"); if(s) s.textContent=L(TX.aivIng)+(A.p>0?' · '+Math.round(A.p*100)+'%':''); }
        if(Date.now()-t0<25*60000) poll(t0); })
        .catch(function(){ if(Date.now()-t0<25*60000) poll(t0); }); },5000); };
  var post=function(){ var bt=o.querySelector("[data-post]"), S=A.res.S; if(!bt||S.busy) return; bt.disabled=true; S.busy=true;
    Promise.all([S.ai,S.src]).then(function(a){ return kMix({v:a[0],a:a[1],t0:0,a0:0,len:A.len,tag:true,onP:function(p){ bt.textContent=tf(L(TX.aivMix),{p:p}); }}); })
      .then(function(bl){ S.busy=false; S.file=new File([bl],"StageSong_AI."+(/mp4/.test(bl.type)?"mp4":"webm"),{type:bl.type});
        if(REC.url) try{ URL.revokeObjectURL(REC.url); }catch(e){} REC.blob=bl; REC.url=URL.createObjectURL(bl); REC.dur=A.len; REC.aiv=A.vid; REC.mt=bl.type;
        var pvv=b.querySelector(".kpv video"); if(pvv){ pvv.src=REC.url; }
        A.gone=1; o.remove(); soon(L(TX.aivPostOk)); upStart(); })
      .catch(function(){ S.busy=false; bt.disabled=false; bt.textContent=L(TX.aivPost); soon(L(TX.aivMixF)); }); };
  o.onclick=function(e){ if(e.target===o&&A.st==="pick"){ A.gone=1; o.remove(); } };
  if(!A.th) A.th=""; if(A.th) A.sc=kTh(A.th)[2][0][0];
  draw(); kAivCfg().then(function(){ if(o.isConnected&&A.st==="pick"){ if(A.dur) setDur(A.dur); draw(); } }); }
// 내 AI 영상 크게 보기 — 재생(원본 소리 맞춤) · 저장/공유 · 삭제
function kAivView(G,x){ kAivCss(); var o=pgOpen("kaivv"); if(!o) return; var d=kDay(x.at), busy=false;
  o.innerHTML=kHead('<h3>'+esc(L(TX.aivT))+' · '+esc(d[0])+'</h3>')+'<div class="kpgb"><div class="kaivr"></div><div class="kaivsh" style="margin-top:10px"></div><button type="button" class="kbt r" data-ad="1" style="margin-top:8px;width:100%">'+esc(L(TX.del))+'</button></div>';
  o.querySelector(".kpbk").onclick=pgBack;
  kAivPlayer(o.querySelector(".kaivr"),x.url,x.src);
  kAivSave(o.querySelector(".kaivsh"),{ai:kBlobUrl(x.url),src:x.src?kBlobUrl(x.src):Promise.resolve(null),len:x.dur||15});
  var dl=o.querySelector("[data-ad]"); dl.onclick=function(){ if(busy||!window.confirm(L(TX.aivDelQ))) return; busy=true; dl.disabled=true;
    kPost("/kst/aivdel",{vid:x.vid}).then(function(j){ busy=false; if(j&&j.ok){ G.vids=(G.vids||[]).filter(function(y){ return y.vid!==x.vid; }); G.draw(); pgBack(); soon(L(TX.aiDelOk)); return; } dl.disabled=false; soon(L(TX.delF)); })
      .catch(function(){ busy=false; dl.disabled=false; soon(L(TX.delF)); }); }; }
function kThUp(id,jpg){ return fetch(HUB+"/kst/thumb?id="+id+"&"+kQs(),{method:"POST",headers:{"Content-Type":"image/jpeg"},body:jpg}).then(function(r){ return r.json(); }).then(function(j){ return !!(j&&j.ok); }); }
window.karCard=kCard;   // 시험용
// 영상 공유 — 링크만 보낸다(영상 파일은 안 감) · 카드 그림이 없는 옛 영상은 그 자리에서 만들어 올린 뒤 공유 · 실패하면 노래방 아이콘
function kShareVid(x){ if(!x||x.vis==="me") return;
  var go=function(){ var u="https://karaoke.moneypuzzle.co.kr/?v="+x.id, nm=x.nick||"guest", t=x.t||"StageSong", rn=(x.rooms||[]).map(function(r){ return r.name; }).filter(Boolean).join(", ");
    var desc=x.vis==="room"?tf(L(TX.shDR),{r:rn||L(TX.rmDef)}):x.vis==="fol"?L(TX.shDF):(typeof x.sc==="number"?tf(L(TX.shD),{s:x.sc}):L(TX.shD0)), title=tf(L(TX.shT),{n:nm,t:t});
    kShare({hd:L(TX.shHd),url:u,iurl:u+"&install=1",txt:title+" — "+desc,kk:{title:title,desc:desc,img:x.th?HUB+"/kst/t/"+x.id:"https://karaoke.moneypuzzle.co.kr/img/card/card_app.png",w:x.th?800:1200,h:x.th?800:630,b1:L(TX.shV)}});
    try{ ntap("kara_stage","share_"+x.vis); }catch(e){} };
  if(x.th||!x.mine){ go(); return; }
  soon(L(TX.shPrep));
  kCard(kVid(x.id),x.sc,x.t,true).then(function(jpg){ return kThUp(x.id,jpg); }).then(function(ok){ if(ok) x.th=1; go(); }).catch(function(){ go(); }); }
// ── 「우리끼리」 방 (사장님 10-30) — 방장이 내가 팔로우한 사람 중 골라 만든다(30명까지) · 방 사람만 그 방 영상을 본다
function kMyFol(){ return kGet("/kst/me").then(function(m){ if(!(m&&m.ok&&m.pubid)) return []; return kGet("/kst/fl?pubid="+m.pubid+"&kind=following").then(function(j){ return (j&&j.ok&&j.items)||[]; }); }); }
// 고르기 창 (방 만들기·사람 더하기·빼기·이름 바꾸기 같이) — host 페이지 위 작은 창
//   opt = {title, name(이름 칸 처음 값 · 없으면 이름 칸 없음), sub, list(사람 고르기 있음), items:[{pubid,nick}]|null(불러오는 중), empty, ok, need(한 명 이상), go:function(name,pubids) → Promise(오류 글자 | null=끝)}
function kPplPick(host,opt){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w); var sel={}, busy=false, items=opt.items;
  var draw=function(msg){ var nmv=w.querySelector(".kni"), keep=nmv?nmv.value:opt.name;
    var lst=!opt.list?'':items===null?'<p class="km">'+esc(L(TX.lo))+'</p>':!items.length?'<p class="km">'+esc(opt.empty)+'</p>'
      :'<div class="kchk">'+items.map(function(x,i){ return '<label><input type="checkbox" data-i="'+i+'"'+(sel[x.pubid]?' checked':'')+'>'+kIc("id",1)+'<span>'+esc(x.nick||"guest")+'</span></label>'; }).join("")+'</div>';
    w.innerHTML='<div><h3>'+esc(opt.title)+'</h3>'+(opt.name!=null?'<b class="kh">'+esc(L(TX.rmName))+'</b><input type="text" class="kni" maxlength="20" value="'+esc(keep)+'">':'')
      +(opt.sub?'<b class="kh">'+esc(opt.sub)+'</b>':'')+lst+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
      +'<button type="button" class="kgo"'+(busy||(opt.need&&!(items&&items.length))?' disabled':'')+'>'+esc(opt.ok)+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    [].forEach.call(w.querySelectorAll(".kchk input"),function(c){ c.onchange=function(){ var x=items[+c.dataset.i]; if(c.checked&&Object.keys(sel).length>=30){ c.checked=false; draw(L(TX.rmMax)); return; } if(c.checked) sel[x.pubid]=1; else delete sel[x.pubid]; }; });
    w.querySelector(".kc").onclick=function(){ if(!busy) w.remove(); };
    w.querySelector(".kgo").onclick=function(){ if(busy) return; var nm=null; if(opt.name!=null){ nm=String(w.querySelector(".kni").value||"").trim(); var n=Array.from(nm).length; if(n<1||n>20){ draw(L(TX.rmNmE)); return; } }
      var ps=Object.keys(sel); if(opt.need&&!ps.length){ draw(L(TX.rmPpE)); return; }
      busy=true; draw(); opt.go(nm,ps).then(function(err){ busy=false; if(err==null){ w.remove(); return; } draw(err||""); }).catch(function(){ busy=false; draw(L(TX.upNet)); }); }; };
  w.onclick=function(e){ if(e.target===w&&!busy) w.remove(); };
  w.setItems=function(a){ items=a; draw(); };
  draw(); return w; }
function kRoomErr(j){ var e=j&&j.err; return L(e==="many"?TX.rmMax:e==="name"?TX.rmNmE:e==="room"||e==="none"||e==="own"?TX.rmGone:TX.fail); }
function kRoomNew(S){ var w=kPplPick(S.o,{title:L(TX.rmNew),name:L(TX.rmDef),sub:L(TX.rmWho),list:1,items:null,empty:L(TX.rmNoF),ok:L(TX.rmMk),
    go:function(nm,ps){ return new Promise(function(res){ var rid=kRid(), cost=dCost("room");   // (10-31 밤) 방장이 1,000P 1회 — 「1,000P 사용 → N P 남음」 확인 뒤 생성 · 실패하면 허브가 되돌림
      dPay(cost,L(TX.rmNew),function(done){ kPost("/kst/room",{op:"create",name:nm,pubids:ps,rid:rid}).then(function(j){ if(!(j&&j.ok)){ var e=j&&j.err, t=e==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):kRoomErr(j); done(t); kptLoad(); return; }
        done(); kptLoad(); try{ ntap("kara_stage","room_new"); }catch(e){} if(S.load) S.load(); res(null); kRoom(j.rid,S); }).catch(function(){ done(L(TX.upNet)); }); },function(){ res(""); }); }); }});
  kMyFol().then(function(a){ if(w.isConnected) w.setItems(a); }).catch(function(){ if(w.isConnected) w.setItems([]); }); }
function kRoomRow(x,i,rk,seq){ var d=kDay(x.at);   // rk = 순위(챌린지 1·2·3) 또는 순번(릴레이, seq) 배지 (10-31)
  return '<div class="krow" role="button" tabindex="0" data-i="'+i+'">'+(rk?'<b class="krk'+(seq?' s':rk===2?' r2':rk===3?' r3':'')+'">'+rk+'</b>':'')+'<div class="krd"><b>'+esc(d[0])+'</b><small>'+esc(d[1])+'</small></div>'+kScC(x)
    +'<div class="krm"><p>'+esc(x.desc||x.t||"-")+'</p><small>'+(x.pubid?kUn(x).replace('class="kun"','class="kun knk"'):'<b class="knk">'+esc(x.nick||"guest")+'</b>')
    +'<span class="kst2">'+kIc("up",1)+kNum(x.up)+'</span><span class="kst2">'+kIc("cm",1)+kNum(x.cm)+'</span><span class="kst2">'+kIc("view",1)+kNum(x.views)+'</span></small></div>'
    +kThumb(x.id,"krv")+'</div>'; }
// 방 화면 — 이름 한 줄 + 사람 수(누르면 사람 목록) + 「⋯」(방장 메뉴 / 나가기) + 그 방 영상 목록(날짜·점수 칸, 정렬 3단계)
function kRoom(rid,S0){ if(!/^[0-9a-f]{12}$/.test(String(rid||""))) return; var o=pgOpen("kroom"); if(!o) return;
  var R={o:o,info:null,items:null,err:0,gone:false,sort:"new",tok:0,mem:false,rl:null};
  R.setRl=function(j){ R.rl=j; R.draw(); };   // 릴레이 화면에서 바뀌면 띠도 (10-31)
  var up=function(){ if(S0&&S0.o&&S0.o.isConnected&&S0.load) S0.load(); };
  R.load=function(){ var my=++R.tok; R.items=null; R.err=0; R.draw();
    kGet("/kst/room?rid="+rid).then(function(j){ if(my!==R.tok) return; if(j&&j.ok){ R.info=j; dcKstNews(rid,j.deco); } else R.gone=true; R.draw(); }).catch(function(){ if(my!==R.tok) return; R.err=1; R.draw(); });
    kGet("/kst/relay?rid="+rid).then(function(j){ if(my!==R.tok) return; if(j&&j.ok){ R.rl=j; R.draw(); } }).catch(function(){});   // 「○○님 차례」 띠 (10-31)
    kGet("/kst/list?scope=room&rid="+rid).then(function(j){ if(my!==R.tok) return; if(j&&j.ok) R.items=j.items||[]; else { R.items=[]; R.err=1; if(j&&j.err==="room") R.gone=true; } R.draw(); }).catch(function(){ if(my!==R.tok) return; R.items=[]; R.err=1; R.draw(); }); };
  R.loadMe=function(){};
  o._bye=function(){ R.tok++; };
  R.draw=function(){ var m=R.info, body;
    if(R.gone) body='<div class="kstge">'+esc(L(TX.rmGone))+'</div>';
    else { body=kTurnBand(R.rl)+'<div class="krmh"><div class="krmt">'+kIc("!krm_song")+'<b>'+esc(m?m.name:"…")+'</b></div>'
        +'<button type="button" class="krmc'+(R.mem?' on':'')+'" data-mem="1">'+kIc("fol",1)+esc(tf(L(TX.rmN),{n:m?m.count:"…"}))+'</button>'
        +'<button type="button" class="krmc" data-rl="1">'+kIc("relay",1)+esc(L(TX.rlB))+'</button>'
        +'<button type="button" class="kdrb" data-dor="1"><img src="img/kara/dor.png" alt="">'+esc(L(TX.dorB))+'</button>'
        +'<button type="button" class="kdcb" data-deco="1"><img src="img/deco/pr_balloons.webp" alt="">'+esc(L(TX.dcB))+'</button>'
        +'<button type="button" class="krmx" data-mn="1" aria-label="menu">⋯</button></div>'+(m?'<div class="kddeco kdk"></div>':'')
        +(R.mem&&m?'<div class="krmm">'+m.mem.map(function(p){ return '<span>'+(p.pubid&&!p.me?'<button type="button" class="kun" data-u="'+esc(p.pubid)+'">'+esc(p.nick||"guest")+'</button>':'<b class="kme">'+esc(p.nick||"guest")+'</b>')+(p.owner?'<small>'+esc(L(TX.rmOw))+'</small>':'')+'</span>'; }).join("")+(m.owner?'<button type="button" class="krmi" data-inv="1">'+kIc("share",1)+esc(L(TX.rmInv))+'</button><button type="button" class="krmi" data-nr="1">'+kIc("fol",1)+esc(L(NT.nrFind))+'</button>':'')+'</div>':'')
        +'<div class="ksrt"><span>'+esc(L(TX.vids))+(R.items&&R.items.length?' · '+R.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(R.sort))+'</button>'+kVwBtn()+'</div>'
        +(R.items===null?'<div class="kstge">'+esc(L(TX.lo))+'</div>':R.err&&!R.items.length?'<div class="kstge">'+esc(L(TX.stF))+'</div>':!R.items.length?'<div class="kstge">'+esc(L(TX.rmE))+'</div>'
          :'<div class="krows">'+kSortA(R.items,R.sort).map(function(r){ return kRoomRow(r[0],r[1]); }).join("")+'</div>'); }
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<h3 class="k2l">'+esc(L(TX.vwRoom))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack; kUnBind(o);
    var dct=dcKstCtx(R,rid); dcBg(o,!R.gone&&m&&m.deco&&m.deco.pl||""); dcStrip(o.querySelector(".kddeco"),dct); var dcb=o.querySelector("[data-deco]"); if(dcb) dcb.onclick=function(){ if(R.info) dcOpen(dct,0); };   // 방 꾸미기 — 배경·아래 띠 (10-31)
    var mb=o.querySelector("[data-mem]"); if(mb) mb.onclick=function(){ R.mem=!R.mem; R.draw(); };
    [].forEach.call(o.querySelectorAll("[data-rl],[data-trn]"),function(x){ x.onclick=function(){ kRelay(rid,R); }; });   // 릴레이 (10-31)
    var mn=o.querySelector("[data-mn]"); if(mn) mn.onclick=function(){ if(R.info) menu(); };
    var dr=o.querySelector("[data-dor]"); if(dr) dr.onclick=function(){ dorOpen(R.info&&R.info.name||""); };   // 방 이름으로 도란도란 (10-31 밤)
    var iv=o.querySelector("[data-inv]"); if(iv) iv.onclick=function(){ if(R.info) kRoomInv(R.info,rid); };
    var nrb=o.querySelector("[data-nr]"); if(nrb) nrb.onclick=function(){ if(R.info) nrOpen({type:"song",room:rid,name:R.info.name}); };   // 근처 친구 찾기 (10-31)
    var so=o.querySelector("[data-sort]"); if(so) so.onclick=function(){ R.sort=kSortNx(R.sort); R.draw(); };
    [].forEach.call(o.querySelectorAll(".krow"),function(c){ var go=function(){ var x=R.items&&R.items[+c.dataset.i]; if(x) kDet(x,R); }; c.onclick=go; c.onkeydown=function(e){ if(e.key==="Enter") go(); }; }); };
  var op=function(a){ a.rid=rid; return kPost("/kst/room",a).then(function(j){ if(!(j&&j.ok)) return kRoomErr(j); R.load(); up(); return null; }); };
  var menu=function(){ var m=R.info, w=document.createElement("div"); w.className="kpm"; o.appendChild(w);
    var bs=m.owner?[["inv",TX.rmInv,"share",""],["near",NT.nrFind,"fol",""],["add",TX.rmAdd,"plus",""],["rm",TX.rmRm,"fol",""],["ren",TX.rmRen,"id",""],["del",TX.rmDel,"","r"]]:[["lv",TX.rmLv,"","r"]];
    w.innerHTML='<div><h3>'+esc(m.name)+'</h3><div class="kmn">'+bs.map(function(b){ return '<button type="button" data-k="'+b[0]+'"'+(b[3]?' class="'+b[3]+'"':'')+'>'+(b[2]?kIc(b[2]):'')+esc(L(b[1]))+'</button>'; }).join("")+'</div><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-k]"),function(b){ b.onclick=function(){ var k=b.dataset.k; w.remove();
      if(k==="inv"){ kRoomInv(m,rid); return; }
      if(k==="near"){ nrOpen({type:"song",room:rid,name:m.name}); return; }   // 근처 친구 찾기 (10-31)
      if(k==="add"){ var have={}; m.mem.forEach(function(p){ have[p.pubid]=1; }); var pw=kPplPick(o,{title:L(TX.rmAdd),list:1,items:null,empty:L(TX.rmNoA),ok:L(TX.rmAdd),need:1,go:function(n,ps){ return op({op:"add",pubids:ps}); }});
        kMyFol().then(function(a){ if(pw.isConnected) pw.setItems(a.filter(function(x){ return x.pubid&&!have[x.pubid]; })); }).catch(function(){ if(pw.isConnected) pw.setItems([]); }); }
      else if(k==="rm") kPplPick(o,{title:L(TX.rmRm),list:1,items:m.mem.filter(function(p){ return !p.owner&&p.pubid; }),empty:L(TX.flE),ok:L(TX.rmRm),need:1,go:function(n,ps){ return op({op:"remove",pubids:ps}); }});
      else if(k==="ren") kPplPick(o,{title:L(TX.rmRen),name:m.name,items:[],ok:L(TX.save),go:function(n){ return op({op:"rename",name:n}); }});
      else if(k==="del"||k==="lv"){ if(!window.confirm(L(k==="del"?TX.rmDelQ:TX.rmLvQ))) return; kPost("/kst/room",{op:k==="del"?"del":"leave",rid:rid}).then(function(j){ if(j&&j.ok){ up(); pgBack(); return; } soon(kRoomErr(j)); }).catch(function(){ soon(L(TX.upNet)); }); } }; }); };
  R.load(); try{ ntap("kara_stage","room"); }catch(e){} return R; }
// ── 카톡 초대 (10-31) — 방장만. 허브가 초대 토큰(16자리·7일)을 만들고, 공용 공유창(kShare)으로 카카오톡 카드·다른 앱·링크 복사
//   링크 = 노래방 사이트 ?rinv=<토큰> · 「앱 설치」 = 같은 링크 + &install=1 · 받은 사람은 site.js → karRoomJoin
var RINV_U="https://karaoke.moneypuzzle.co.kr/";
function kRoomInv(m,rid){ if(!m||!m.owner) return; soon(L(TX.rmInvP));
  kPost("/kst/room",{op:"inv",rid:rid}).then(function(j){ if(!(j&&j.ok&&/^[A-Za-z0-9]{16}$/.test(j.tok||""))){ soon(kRoomErr(j)); return; }
    var on=((m.mem||[]).filter(function(p){ return p.owner; })[0]||{}).nick||"", u=RINV_U+"?rinv="+j.tok, iu=u+"&install=1";
    var ttl=on?tf(L(TX.rmInvT),{n:on,r:m.name}):tf(L(TX.rmInvT0),{r:m.name});
    var sk=document.querySelector("#karBox .ksoon"); if(sk) sk.remove();
    kShare({hd:L(TX.rmInv)+" · "+L(TX.rmInvH),url:u,iurl:iu,txt:ttl,kk:{title:ttl,desc:L(TX.rmInvD),img:RINV_U+"img/card/card_room.png",w:1200,h:630,b1:L(TX.dorIn)}});
    try{ ntap("kara_stage","room_inv"); }catch(e){} }).catch(function(){ soon(L(TX.upNet)); }); }
// 초대 링크로 입장 — 노래방 화면이 열린 뒤 site.js 가 부른다 (누구나, 로그인 전이면 로그인부터). 토큰은 localStorage "kst_rinv" 에도 있다(입장 끝나거나 못 쓰는 토큰이면 지움)
function kMsg(host,msg,btns){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w);
  w.innerHTML='<div><p class="kmsg">'+esc(msg)+'</p>'+(btns||[]).map(function(b,i){ return '<button type="button" class="'+(b[2]||"kgo")+'" data-b="'+i+'">'+esc(b[0])+'</button>'; }).join("")+'</div>';
  [].forEach.call(w.querySelectorAll("[data-b]"),function(x){ x.onclick=function(){ w.remove(); var f=btns[+x.dataset.b][1]; if(f) f(); }; }); return w; }
function kRoomJoin(tok){ var b=box(); if(!b||!/^[A-Za-z0-9]{16}$/.test(String(tok||""))) return; if(!sess()){ kMsg(b,L(TX.lgReq),[[L(TX.lgin),function(){ kLogin(function(){ kRoomJoin(tok); }); }],[L(TX.cancel),null,"kc"]]); return; }   // 초대 입장 = 로그인 (10-31 출시판)
  var drop=function(){ try{ localStorage.removeItem("kst_rinv"); }catch(e){} };
  soon(L(TX.rjIng));
  kPost("/kst/room",{op:"join",tok:tok}).then(function(j){ var sk=b.querySelector(".ksoon"); if(sk) sk.remove();
    if(!(j&&j.ok&&j.rid)){ var e=j&&j.err; if(e==="exp"||e==="none"||e==="tok"||e==="many") drop();
      kMsg(b,L(e==="exp"?TX.rjExp:e==="none"||e==="tok"?TX.rjNo:e==="many"?TX.rjFull:TX.fail),[[L(TX.ok),null]]); return; }
    drop(); try{ ntap("kara_stage",j.already?"room_join_again":"room_join"); }catch(e){}
    stageOpen("all"); var S=KS; if(S){ S.view="room"; S.rooms=null; S.items=null; S.err=0; S.draw(); S.load(); }
    var R=kRoom(j.rid,S); soon(tf(L(j.already?TX.rjAl:TX.rjOk),{r:j.name||""})); var sq=b.querySelector(".ksoon"); if(sq){ sq.style.whiteSpace="normal"; sq.style.width="max-content"; sq.style.maxWidth="calc(100% - 32px)"; sq.style.textAlign="center"; }
    if(!j.nick&&R&&R.o) setTimeout(function(){ if(!R.o.isConnected) return;   // 처음 온 사람 = 스테이지 ID 한 번 안내
      kMsg(R.o,L(TX.rjId),[[L(TX.idSet),function(){ kNick({o:R.o,me:{nick:""},draw:function(){ R.load(); }}); }],[L(TX.rjLt),null,"kc"]]); },600); })
    .catch(function(){ var sk=b.querySelector(".ksoon"); if(sk) sk.remove(); kMsg(b,L(TX.upNet),[[L(TX.ok),null]]); }); }
window.karRoomJoin=kRoomJoin;
function ntcOpen(){ var b=box(); if(!b) return; var o=b.querySelector(".kntc"); if(o) o.remove();
  var lg=window.LANG||"en", li=TX.ntcL[lg]||TX.ntcL.en, PP=kPassP(), X=PP[0], span=30, u=10, dl=span-u, a=Math.floor(X.p*dl/span), r=Math.floor(X.p*dl/span*0.9/10)*10;   // 예: 1개월(30일)을 10일째 환불
  var first=tf(L(TX.ntcP0),{list:PP.map(function(q){ return kMon(q.m)+" "+ptS(q.p); }).join(" · ")});
  var ex=tf(L(TX.ntcEx),{m:kMon(X.m),w:ptS(X.p),u:u,d:dl,a:wonL(a),r:wonL(r)});
  var all=[first,li[0],li[1],ex,li[2],li[3]];
  o=document.createElement("div"); o.className="kpm kntc"; b.appendChild(o);
  o.innerHTML='<div><h3>'+esc(L(TX.ntc))+'</h3><ul>'+all.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul>'
    +'<a class="kra" href="refund.html?lang='+encodeURIComponent(TX.ntcL[lg]?lg:"en")+'" target="_blank" rel="noopener">'+esc(L(TX.ntcR))+' ›</a>'
    +'<button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
  o.querySelector(".kc").onclick=function(){ o.remove(); };
  o.onclick=function(e){ if(e.target===o) o.remove(); }; }
// ── 도전 공통 (10-31) — 그 곡을 노래방 화면에서 틀고 녹화 화면으로. ctx = {ch:챌린지} | {rl:릴레이id, rid, sid} → 게시 창이 보고 자동으로 챌린지 참여·릴레이 게시
function kSing(sid,t,ctx){ var b=box(); if(!b||!/^[A-Za-z0-9_-]{11}$/.test(String(sid||""))) return; try{ pgTo(0); }catch(e){}
  K.ctx=ctx||null; K.q=String(t||""); var inp=b.querySelector(".ksr input"); if(inp) inp.value=K.q;
  K.items=[{id:sid,t:String(t||""),ch:"ky"}]; K.idx=-1; paintList(); play(0);
  setTimeout(function(){ var bb=box(), r=bb&&bb.querySelector(".krec"); if(bb&&r&&!bb.classList.contains("krecm")) r.click(); },400); }
// ── 챌린지 (사장님 10-31 「전체가 다 하는 거로」) — 지금 챌린지는 KCH 에 기억(게시 창이 곡을 보고 「챌린지 참여」 자동 체크)
var KCH=null;
function kChGet(){ return kGet("/kst/chal").then(function(j){ KCH=j&&j.ok?j:null; return KCH; }).catch(function(){ return null; }); }
function kChTtl(c){ return !c?"":(!c.ttl||c.ttl==="이번 주 챌린지")?L(TX.chT):c.ttl; }   // 기본 제목은 화면 언어로
function kChLeft(c){ var now=Date.now(); if(!c) return ""; if(c.end||now>=c.e) return L(TX.chEnd); if(now<c.s) return L(TX.chWait); var h=Math.ceil((c.e-now)/3600000); return h>=48?tf(L(TX.chLeft),{n:Math.ceil(h/24)}):tf(L(TX.chLeftH),{n:h}); }
function kChDay(t){ try{ return new Date(t).toLocaleDateString(kLoc(),{month:"short",day:"numeric"}); }catch(e){ return ""; } }
function kChal(id0){ var o=pgOpen("kchal"); if(!o) return;
  var C={o:o,j:null,c:null,id:id0||"",items:null,err:0,sort:"score",tok:0};
  o._bye=function(){ C.tok++; };
  C.load=function(){ var my=++C.tok; C.items=null; C.err=0; C.draw();
    var go=function(id){ if(!id){ C.items=[]; C.draw(); return; }
      kGet("/kst/chal/list?id="+id+"&sort="+C.sort).then(function(j){ if(my!==C.tok) return; if(j&&j.ok){ C.items=j.items||[]; if(!C.c||C.c.id===j.chal.id) C.c=j.chal; } else { C.items=[]; C.err=1; } C.draw(); })
        .catch(function(){ if(my!==C.tok) return; C.items=[]; C.err=1; C.draw(); }); };
    if(C.j){ go(C.c&&C.c.id); return; }
    kChGet().then(function(j){ if(my!==C.tok) return; C.j=j||{cur:null,hist:[]}; var h=(C.j.hist||[]).filter(function(x){ return x.id===C.id; })[0]; C.c=h||C.j.cur||null; go(C.c&&C.c.id); }); };
  C.draw=function(){ var c=C.c, body;
    if(!C.j) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(!c) body='<div class="kstge">'+esc(L(TX.chNone))+'</div>';
    else { var live=c.live;
      body='<div class="kchh"><div class="kchn">'+kIc("chal")+'<div><b>'+esc(kChTtl(c))+'</b><p>'+esc(c.t||"-")+'</p></div></div>'
        +'<div class="kchm"><span>'+esc(kChDay(c.s)+" ~ "+kChDay(c.e))+'</span><span class="kchl'+(live?'':' x')+'">'+esc(kChLeft(c))+'</span><span>'+esc(tf(L(TX.chN),{n:kNum(c.n)}))+'</span></div>'
        +(live?'<button type="button" class="kchgo" data-go="1">'+kIc("vid",1)+esc(L(TX.chGo))+'</button><button type="button" class="kchiv" data-inv="1">'+kIc("share",1)+esc(L(TX.chInv))+'</button>':'')+'</div>'
        +'<div class="ksrt"><span>'+esc(L(TX.chList))+(C.items&&C.items.length?' · '+C.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(L(C.sort==="score"?TX.sScore:TX.sNew))+'</button>'+kVwBtn()+'</div>'
        +(C.items===null?'<div class="kstge">'+esc(L(TX.lo))+'</div>':C.err?'<div class="kstge">'+esc(L(TX.stF))+'</div>':!C.items.length?'<div class="kstge">'+esc(L(TX.chE))+'</div>'
          :'<div class="krows">'+C.items.map(function(x,i){ return kRoomRow(x,i,C.sort==="score"&&i<3&&typeof x.sc==="number"?i+1:0); }).join("")+'</div>');
      var hs=(C.j.hist||[]).filter(function(h){ return h.id!==c.id; }).concat(C.j.cur&&C.j.cur.id!==c.id?[C.j.cur]:[]);
      if(hs.length) body+='<div class="kbx"><h4>'+esc(L(TX.chPast))+'</h4><div class="kfls">'+hs.slice(0,10).map(function(h){ return '<button type="button" data-h="'+esc(h.id)+'">'+kIc("chal",1)+esc(kChTtl(h)+" · "+(h.t||""))+'<small class="kchd">'+esc(kChDay(h.s))+'</small></button>'; }).join("")+'</div></div>'; }
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<h3>'+esc(L(TX.chB))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack; kUnBind(o);
    var g=o.querySelector("[data-go]"); if(g) g.onclick=function(){ try{ ntap("kara_stage","chal_try"); }catch(e){} kSing(c.sid,c.t,{ch:c.id}); };
    var iv=o.querySelector("[data-inv]"); if(iv) iv.onclick=function(){ kChInv(c); };
    var so=o.querySelector("[data-sort]"); if(so) so.onclick=function(){ C.sort=C.sort==="score"?"new":"score"; C.load(); };
    [].forEach.call(o.querySelectorAll("[data-h]"),function(x){ x.onclick=function(){ kChal(x.dataset.h); }; });
    [].forEach.call(o.querySelectorAll(".krow"),function(r){ var go=function(){ var x=C.items&&C.items[+r.dataset.i]; if(x) kDet(x,C); }; r.onclick=go; r.onkeydown=function(e){ if(e.key==="Enter") go(); }; }); };
  C.draw(); C.load(); try{ ntap("kara_stage","chal"); }catch(e){} }
// 챌린지 친구 초대 — 공용 공유창 전체(카카오톡·X·페이스북·WhatsApp·LINE·텔레그램·위챗·웨이보·문자·메일·링크 복사·다른 앱으로) · 모든 글에 ?chal= 링크 + 「앱 설치」 링크
function kChInv(c){ if(!c) return;
  kGet("/kst/me").then(function(m){ return m&&m.ok?m.nick||"":""; }).catch(function(){ return ""; }).then(function(nk){
    var u=RINV_U+"?chal="+c.id, ttl=nk?tf(L(TX.chInvT),{n:nk,t:c.t||""}):tf(L(TX.chInvT0),{t:c.t||""});
    kShare({hd:L(TX.chInv)+" · StageSong "+L(TX.chB),url:u,iurl:u+"&install=1",txt:ttl+"\n"+L(TX.chInvD),full:1,kk:{title:ttl,desc:L(TX.chInvD),img:RINV_U+"img/card/card_chal.png",w:1200,h:630,b1:L(TX.dorIn)}});
    try{ ntap("kara_stage","chal_inv"); }catch(e){} }); }
window.karChal=function(id){ if(!box()) return; kChal(/^[0-9a-f]{12}$/.test(String(id||""))?id:""); };
// ── 우리끼리 방 릴레이 (사장님 10-31 「방장에게 권한」) — 방마다 진행 중 1개 · 지금 주자만 도전 · 게시 뒤 다음 주자 지명 · 방장 = 주자 변경·건너뛰기·종료
function kTurnBand(j){ var r=j&&j.relay; if(!r) return ""; var c=r.cur;
  return '<div class="ktrn'+(c&&c.me?' me':'')+'" data-trn="1">'+kIc("relay",1)+'<b>'+esc(c?(c.me?L(TX.rlMine):tf(L(TX.rlTurn),{n:c.nick||"guest"})):L(TX.rlWait))+'</b><span>'+esc(r.t||"")+'</span></div>'; }
// 곡 고르기 창 — 지금 노래방 목록 + 금영 곡 검색(허브 /kara?q=)
function kSongPick(host,title,cb){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w); var items=(K.items||[]).filter(function(x){ return x&&x.e!==0; }).slice(0,30), q="", busy=false;
  var draw=function(){ w.innerHTML='<div><h3>'+esc(title)+'</h3><form class="ksr"><input type="search" placeholder="'+esc(L(TX.q))+'" value="'+esc(q)+'"><button type="submit">'+esc(L(TX.go))+'</button></form>'
      +(busy?'<p class="km">'+esc(L(TX.lo))+'</p>':!items.length?'<p class="km">'+esc(L(TX.rlNoS))+'</p>':'<div class="kfls ksng">'+items.map(function(x,i){ return '<button type="button" data-i="'+i+'">'+esc(x.t)+'</button>'; }).join("")+'</div>')
      +'<button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector("form").onsubmit=function(e){ e.preventDefault(); q=String(w.querySelector("input").value||"").trim(); if(!q) return; busy=true; draw();
      fetch(HUB+"/kara?q="+encodeURIComponent(q)).then(function(r){ return r.json(); }).then(function(j){ busy=false; items=((j&&j.ok&&j.items)||[]).filter(function(x){ return x.e!==0; }); if(w.isConnected) draw(); }).catch(function(){ busy=false; items=[]; if(w.isConnected) draw(); }); };
    w.querySelector(".kc").onclick=function(){ w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-i]"),function(x){ x.onclick=function(){ var s=items[+x.dataset.i]; if(!s) return; w.remove(); cb({id:s.id,t:s.t}); }; }); };
  w.onclick=function(e){ if(e.target===w) w.remove(); }; draw(); }
// 주자 고르기 창 — 아직 안 부른 사람 먼저 · noMe = 나 빼기(주자가 다음 사람 지명할 때)
function kMemPick(host,title,mem,noMe,cb){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w);
  var a=(mem||[]).filter(function(p){ return p.pubid&&!(noMe&&p.me); }).slice().sort(function(x,y){ return (x.sung?1:0)-(y.sung?1:0); });
  w.innerHTML='<div><h3>'+esc(title)+'</h3><p class="km">'+esc(L(TX.rlNextN))+'</p><div class="kfls">'+a.map(function(p,i){ return '<button type="button" data-i="'+i+'">'+kIc("id")+esc(p.nick||"guest")+(p.owner?'<small class="kchd">'+esc(L(TX.rmOw))+'</small>':'')+(p.sung?'<small class="kchd">'+esc(L(TX.rlSung))+'</small>':'')+'</button>'; }).join("")+'</div><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
  w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
  [].forEach.call(w.querySelectorAll("[data-i]"),function(x){ x.onclick=function(){ var p=a[+x.dataset.i]; if(!p) return; w.remove(); cb(p); }; }); }
function kRlErr(j){ var e=j&&j.err; return L(e==="busy"?TX.rlBusy:e==="turn"||e==="own"?TX.rlErr:e==="room"||e==="none"?TX.rmGone:TX.fail); }
function kRelay(rid,R0,after){ if(!/^[0-9a-f]{12}$/.test(String(rid||""))) return; var o=pgOpen("krelay"); if(!o) return;
  var S={o:o,j:null,err:0,tok:0};
  o._bye=function(){ S.tok++; };
  var tell=function(j){ if(R0&&R0.o&&R0.o.isConnected&&R0.setRl) R0.setRl(j); };
  S.load=function(cb){ var my=++S.tok; kGet("/kst/relay?rid="+rid).then(function(j){ if(my!==S.tok) return; if(j&&j.ok){ S.j=j; S.err=0; tell(j); } else S.err=j&&j.err==="room"?2:1; S.draw(); if(cb) cb(); })
    .catch(function(){ if(my!==S.tok) return; S.err=1; S.draw(); }); };
  var post=function(a){ a.rid=rid; return kPost("/kst/relay",a).then(function(j){ if(j&&j.ok){ S.j=j; tell(j); S.draw(); try{ ntap("kara_stage","relay_"+a.op); }catch(e){} return; } soon(kRlErr(j)); }).catch(function(){ soon(L(TX.upNet)); }); };
  var start=function(){ kSongPick(o,L(TX.rlSong),function(s){ kMemPick(o,L(TX.rlFirst),S.j.mem,false,function(p){ post({op:"start",sid:s.id,t:s.t,pubid:p.pubid}); }); }); };
  var next=function(title){ kMemPick(o,title||L(TX.rlNext),S.j.mem,!S.j.owner,function(p){ post({op:"next",pubid:p.pubid}); }); };
  S.next=next;
  var tellShare=function(){ var r=S.j&&S.j.relay, c=r&&r.cur; if(!c) return; var u=RINV_U+"?room="+rid, d=tf(L(TX.rlTellT),{n:c.nick||"guest"})+" · "+tf(L(TX.rlTellD),{t:r.t||""});
    kGet("/kst/me").then(function(m){ return m&&m.ok?m.nick||"":""; }).catch(function(){ return ""; }).then(function(nk){ var ttl=nk?tf(L(TX.rlInvT),{n:nk,t:r.t||""}):tf(L(TX.rlInvT0),{t:r.t||""});
    kShare({hd:L(TX.rlTell),url:u,iurl:u+"&install=1",txt:ttl+"\n"+d,full:1,kk:{title:ttl,desc:d,img:RINV_U+"img/card/card_relay.png",w:1200,h:630,b1:L(TX.dorIn)}}); try{ ntap("kara_stage","relay_tell"); }catch(e){} }); };
  var menu=function(){ var w=document.createElement("div"); w.className="kpm"; o.appendChild(w);
    w.innerHTML='<div><h3>'+esc(L(TX.rlB))+'</h3><div class="kmn"><button type="button" data-k="chg">'+kIc("id")+esc(L(TX.rlChg))+'</button><button type="button" data-k="skip">'+kIc("relay")+esc(L(TX.rlSkip))+'</button><button type="button" data-k="end" class="r">'+esc(L(TX.rlEnd))+'</button></div><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-k]"),function(b){ b.onclick=function(){ var k=b.dataset.k; w.remove();
      if(k==="chg") next(L(TX.rlChg)); else if(k==="skip") post({op:"skip"}); else if(k==="end"&&window.confirm(L(TX.rlEndQ))) post({op:"end"}); }; }); };
  S.draw=function(){ var j=S.j, r=j&&j.relay, body;
    if(S.err===2) body='<div class="kstge">'+esc(L(TX.rmGone))+'</div>';
    else if(!j) body='<div class="kstge">'+esc(L(S.err?TX.stF:TX.lo))+'</div>';
    else if(!r) body='<div class="kstge krlE"><img class="krlh" src="img/kara/kst_relay_l.png" alt="" aria-hidden="true">'+esc(L(TX.rlNone))+(j.owner?'':'<br><small>'+esc(L(TX.rlNoneO))+'</small>')+'</div>'+(j.owner?'<button type="button" class="kchgo" data-st="1">'+kIc("relay",1)+esc(L(TX.rlStart))+'</button>':'');
    else { var c=r.cur, mine=c&&c.me;
      body='<img class="krlh krlT" src="img/kara/kst_relay_l.png" alt="" aria-hidden="true">'+kTurnBand(j)
        +'<div class="kchh"><div class="kchn">'+kIc("!kst_relay_l")+'<div><b>'+esc(r.t||"-")+'</b><p>'+esc((j.name||"")+" · "+tf(L(TX.rmN),{n:(j.mem||[]).length}))+'</p></div>'+(j.owner?'<button type="button" class="krmx" data-mn="1" aria-label="menu">⋯</button>':'')+'</div>'
        +(mine&&!r.curDone?'<button type="button" class="kchgo" data-go="1">'+kIc("vid",1)+esc(L(TX.rlGo))+'</button>':'')
        +((mine&&r.curDone)||(j.owner&&(!c||r.curDone))?'<button type="button" class="kchgo" data-nx="1">'+kIc("fol",1)+esc(L(TX.rlNext))+'</button>':'')
        +(c&&!c.me?'<button type="button" class="kchiv" data-tl="1">'+kIc("share",1)+esc(L(TX.rlTell))+'</button>':'')+'</div>'
        +'<div class="ksrt"><span>'+esc(L(TX.rlSeq))+(j.items&&j.items.length?' · '+j.items.length:'')+'</span>'+kVwBtn()+'</div>'
        +(!j.items.length?'<div class="kstge">'+esc(L(TX.rmE))+'</div>':'<div class="krows">'+j.items.map(function(x,i){ return kRoomRow(x,i,x.no||i+1,1); }).join("")+'</div>'); }
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<h3>'+esc(L(TX.rlB))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack; kUnBind(o);
    var q=function(s){ return o.querySelector(s); };
    if(q("[data-st]")) q("[data-st]").onclick=start;
    if(q("[data-mn]")) q("[data-mn]").onclick=menu;
    if(q("[data-nx]")) q("[data-nx]").onclick=function(){ next(); };
    if(q("[data-tl]")) q("[data-tl]").onclick=tellShare;
    if(q("[data-go]")) q("[data-go]").onclick=function(){ try{ ntap("kara_stage","relay_try"); }catch(e){} kSing(r.sid,r.t,{rl:r.id,rid:rid,sid:r.sid}); };
    [].forEach.call(o.querySelectorAll(".krow"),function(c2){ var go=function(){ var x=j&&j.items&&j.items[+c2.dataset.i]; if(x) kDet(x,S); }; c2.onclick=go; c2.onkeydown=function(e){ if(e.key==="Enter") go(); }; }); };
  S.draw(); S.load(after?function(){ after(S); }:null); try{ ntap("kara_stage","relay"); }catch(e){} return S; }
// 카톡 「차례」 알림 링크 ?room=<rid> — 이미 방 사람이니 그 방을 바로 연다 (site.js 가 부른다, 로그인 필요)
window.karRoomOpen=function(rid){ if(!box()||!/^[0-9a-f]{12}$/.test(String(rid||""))) return; if(!sess()){ kMsg(box(),L(TX.lgReq),[[L(TX.lgin),function(){ kLogin(function(){ window.karRoomOpen(rid); }); }],[L(TX.cancel),null,"kc"]]); return; } stageOpen("all"); var S=KS; if(S){ S.view="room"; S.rooms=null; S.items=null; S.err=0; S.draw(); S.load(); } kRoom(rid,S); };
// ── 이용 안내 책자 (사장님 10-31 「노래방 책자인 척」) — 목차 → 장 넘기기(좌우 단추 + 손가락 밀기) · (10-31 출시판) 모든 장 열림
function kBookUi(k){ var lg=window.LANG||"en";
  if(k==="srch") return '<div class="kbui"><form class="ksr" onsubmit="return false"><input type="search" placeholder="'+esc(L(TX.q))+'" tabindex="-1" readonly><button type="button" tabindex="-1">'+esc(L(TX.go))+'</button></form></div>';
  if(k==="pay") return '<div class="kbui"><div class="kpay"><div class="kr"><b>'+esc(L(TX.kb))+'</b><small>'+esc(L(TX.kbs))+'</small></div><span class="kl">'+esc(L(TX.lgin))+'</span><span class="kslot"><i></i><span>PAYMENT</span><small>'+esc(L(TX.slot))+'</small></span></div></div>';
  if(k==="rec") return '<div class="kbui"><span class="kbrec">'+esc(L(TX.rec))+'</span><span class="kbrec x">'+esc(L(TX.recX))+'</span></div>';
  if(k==="chips") return '<div class="kbui"><div class="kchips">'+[["pub",TX.vPub],["folonly",TX.vFol],["!krm_song",TX.vwRoom],["lock",TX.vMe]].map(function(c){ return '<span class="kbch">'+kIc(c[0])+'<span>'+esc(L(c[1]))+'</span></span>'; }).join("")+'</div></div>';
  if(k==="shr") return '<div class="kbui kbsh">'+["kakao","x","fb","line","wa","tg","wc","wb","sms","mail"].map(function(n){ return SHI[n]||""; }).join("")+'</div>';
  if(k==="law") return '<div class="kbui kblaw"><a href="mailto:admin@moneypuzzle.co.kr">admin@moneypuzzle.co.kr</a><a href="terms.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+'</a><a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+'</a><a href="privacy.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.pL))+'</a></div>';
  return ""; }
function kBook(){ var o=pgOpen("kbook"); if(!o) return; var pg=-1, N=BOOK.length;
  var soonT=function(){ return ""; };   // (10-31 출시판) 장마다 붙던 「곧 오픈 예정」 없음 — 모두 열림
  var draw=function(dir){ var body;
    if(pg<0) body='<div class="kbk"><div class="kbkt">'+kIc("book")+'<b>'+esc(L(TX.bkB))+'</b></div><h4 class="kbtoc">'+esc(L(TX.bkToc))+'</h4><ol class="kbls">'+BOOK.map(function(c,i){ return '<li><button type="button" data-p="'+i+'"><em>'+(i+1)+'</em><span>'+esc(L(c.t))+'</span>'+soonT(c)+'</button></li>'; }).join("")+'</ol><p class="kbsw">'+esc(L(TX.bkSw))+'</p></div>';
    else { var c=BOOK[pg], ps=c.p[window.LANG]||c.p.en;
      body='<div class="kbk kbpg'+(dir?' kbin'+(dir>0?'r':'l'):'')+'"><div class="kbno">'+(pg+1)+' / '+N+'</div><h3 class="kbh">'+esc(L(c.t))+soonT(c)+'</h3>'
        +(c.ic&&c.ic.length?'<div class="kbic">'+c.ic.map(function(n){ return kIc(n); }).join("")+'</div>':'')+(c.ui?kBookUi(c.ui):'')
        +'<ul class="kbp">'+ps.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul></div>'; }
    var nav='<div class="kbnav"><button type="button" data-nv="-1"'+(pg<0?' disabled':'')+'>‹ '+esc(L(TX.bkPrev))+'</button><button type="button" data-nv="toc"'+(pg<0?' disabled':'')+'>'+esc(L(TX.bkToc))+'</button><button type="button" data-nv="1"'+(pg>=N-1?' disabled':'')+'>'+esc(L(TX.bkNext))+' ›</button></div>';
    o.innerHTML=kHead('<h3>'+esc(L(TX.bkB))+'</h3>')+'<div class="kpgb">'+body+nav+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll("[data-p]"),function(x){ x.onclick=function(){ pg=+x.dataset.p; draw(1); }; });
    [].forEach.call(o.querySelectorAll("[data-nv]"),function(x){ x.onclick=function(){ var v=x.dataset.nv; if(v==="toc"){ pg=-1; draw(-1); return; } go(+v); }; });
    var g=o.querySelector(".kpgb"); if(g) g.scrollTop=0; };
  var go=function(d){ var n=pg+d; if(n<-1||n>N-1) return; pg=n; draw(d); };
  var sx=null, sy=0;   // 손가락 좌우 밀기 = 장 넘기기 (확대 중엔 안 함)
  o.addEventListener("touchstart",function(e){ if(e.touches.length!==1||KZ.s>1){ sx=null; return; } sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  o.addEventListener("touchend",function(e){ if(sx==null) return; var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy; sx=null; if(Math.abs(dx)>60&&Math.abs(dy)<50) go(dx<0?1:-1); },{passive:true});
  draw(0); try{ ntap("kara_site","book"); }catch(e){} }
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ barPaint(); if(KB.redraw) KB.redraw(); if(KP.redraw) KP.redraw(); }catch(e){} return r; };   // 언어 바꾸면 곡 이용권 창도 바로
try{ localStorage.removeItem("mpv_kbg"); localStorage.removeItem("mpv_kth"); }catch(e){}   // 녹화 배경·테마는 이번 노래방 안에서만 기억 — 다시 들어오면 기본(사장님 10-31)
function close(){ try{ kzReset(); sessionStorage.removeItem("mpv_kbg"); sessionStorage.removeItem("mpv_kth"); }catch(e){} try{ pgTo(0); }catch(e){} try{ klEnd(); }catch(e){} try{ if(REC.mr&&REC.mr.state!=="inactive"){ REC.mr.onstop=null; REC.mr.stop(); } camOff(); }catch(e){} K.cur=null; var b=box(); if(b){ try{ K.pl&&K.pl.destroy&&K.pl.destroy(); }catch(e){} b.remove(); } K.pl=null; K.ready=false; document.documentElement.style.overflow=""; mpPaid.end(); }
// 도란도란·충전 안내창 모양 (10-31 밤)
(function(){ var s=document.createElement("style"); s.textContent=""
 +"#karBox .ktb .kdorb{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;line-height:1.15;border-color:#ffb36b;color:#ffb36b}#karBox .ktb .kdorb img{width:24px;height:24px;flex:0 0 auto}"
 +"#karBox .kdhero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:6px 0 2px}#karBox .kdhi{width:132px;height:132px;filter:drop-shadow(0 6px 18px rgba(255,79,216,.35))}#karBox .kdhero b{font-size:22px;font-weight:900;color:#ffe066}#karBox .kdhero p{margin:0;color:#e9dcff;font-weight:700;line-height:1.5}"
 +"#karBox .kdnote{margin:0;padding:10px 12px 10px 28px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.05);color:#e9dcff;font-size:13.5px;line-height:1.7}"
 +"#karBox .kdmy{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #7CFFB2;border-radius:12px;background:rgba(124,255,178,.08)}#karBox .kdmy span{flex:1;min-width:0;display:flex;flex-direction:column;font-size:12px;color:#bfffd9}#karBox .kdmy b{font-size:15px;color:#fff;overflow-wrap:anywhere}#karBox .kdmy .kgo{flex:0 0 auto;width:auto;padding:9px 18px}"
 +"#karBox .kdorh .kgo{border:0;border-radius:12px;padding:12px;background:#ffe066;color:#1a1300;font-size:16px;font-weight:900;cursor:pointer}#karBox .kdorh .kgo:disabled{opacity:.5}#karBox .kdmk{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px!important;font-size:17px!important;background:linear-gradient(90deg,#ff4fd8,#7a5cff)!important;color:#fff!important}#karBox .kdbi{width:30px;height:30px}#karBox .kdorh .kni{width:100%;box-sizing:border-box}"
 +"#karBox>.kpm.kptq,#karBox>.kpm.kwal{z-index:45}"   // 결제 확인·지갑 = 도란도란 등 화면(kpg) 위에
 +"#karBox .kdor{display:flex;flex-direction:column}#karBox .kdor .kpgt h3{margin:0;font-size:16px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
 +"#karBox .kdtm{flex:0 0 auto;font-size:12.5px;font-weight:900;color:#bfffd9;border:1px solid rgba(124,255,178,.5);border-radius:999px;padding:4px 9px;cursor:pointer;font-variant-numeric:tabular-nums}#karBox .kdtm.kdlow{color:#ffe066;border-color:#ffe066;animation:kdbl 1.2s ease-in-out infinite}@keyframes kdbl{50%{opacity:.55}}"
 +"#karBox .kdbar{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:8px 10px}#karBox .kdbar .kdn{font-weight:900;color:#ffe066;min-width:34px}#karBox .kdbar button{display:flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 12px;font-weight:800;font-size:13px;cursor:pointer}#karBox .kdbar .kic{width:18px;height:18px}#karBox .kdbar .kdmn{margin-left:auto;padding:6px 12px;font-size:16px;line-height:1}"
 +"#karBox .kdwrap{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:0 6px;overflow:hidden}"
 +"#karBox .kdstage{position:relative;flex:0 0 auto;max-width:100%}"
 +"#karBox .kdgrid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:4px}"
 +"#karBox .kdt{position:relative;overflow:hidden;background:#1d1830;border:1px solid rgba(255,255,255,.14);border-radius:10px;min-width:0;min-height:0;user-select:none;-webkit-user-select:none;touch-action:manipulation}"
 +"#karBox .kdt video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#0d0a18}#karBox .kdt video.kdmir{transform:scaleX(-1)}"
 +"#karBox .kdt .kdav{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:42%;aspect-ratio:1;border-radius:50%;display:none;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff4fd8,#7a5cff);color:#fff;font-size:clamp(14px,6vw,34px);font-weight:900}"
 +"#karBox .kdt.kdnc video{display:none}#karBox .kdt.kdnc .kdav{display:flex}"
 +"#karBox .kdt .kdnm2{position:absolute;left:5px;bottom:5px;max-width:calc(100% - 34px);display:flex;align-items:center;gap:3px;background:rgba(5,3,10,.62);color:#fff;font-size:11px;font-weight:800;border-radius:6px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kdt .kdnm2 em{font-style:normal;color:#ffe066}"
 +"#karBox .kdt .kdmu{position:absolute;right:5px;top:5px;width:18px;height:18px;border-radius:50%;background:#ff5577 linear-gradient(45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%)}"
 +"#karBox .kdt .kdtm2{position:absolute;right:4px;bottom:4px;border:0;background:rgba(5,3,10,.62);color:#fff;border-radius:6px;font-size:14px;line-height:1;padding:3px 6px;cursor:pointer}"
 +"#karBox .kdt.kdme{border-color:rgba(124,255,178,.6)}"
 +"#karBox .kde{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-style:dashed;background:rgba(255,255,255,.03);cursor:pointer}#karBox .kde .kdsi{width:46%;height:auto;opacity:.6}#karBox .kde small{font-size:11px;color:#bdb2db;font-weight:700}"
 +"#karBox .kdsp .kdt{position:absolute;inset:0;border-radius:14px}"
 +"#karBox .kdring .kdt{position:absolute;width:26%;height:26%;border-radius:50%}#karBox .kdring .kdt.kdc0{width:31%;height:31%;left:34.5%;top:34.5%;border:2px solid #ffe066}"
 +"#karBox .kdring .kdt .kdnm2{left:50%;transform:translateX(-50%);bottom:8%;max-width:80%;font-size:10px}#karBox .kdring .kdt .kdtm2{right:auto;left:50%;transform:translateX(-50%);top:6%;bottom:auto;font-size:11px;padding:2px 5px}#karBox .kdring .kdt .kdmu{right:14%;top:12%}#karBox .kdring .kde small{font-size:9.5px}"
 + [0,1,2,3,4,5,6,7].map(function(i){ var a=(-90+i*45)*Math.PI/180, x=50+37*Math.cos(a)-13, y=50+37*Math.sin(a)-13; return "#karBox .kdring .kdr"+i+"{left:"+x.toFixed(2)+"%;top:"+y.toFixed(2)+"%}"; }).join("")
 +"#karBox .kdsong{flex:0 0 auto;padding:6px 10px 0}#karBox .kdyt{position:relative;z-index:2;width:100%;max-width:520px;margin:0 auto;aspect-ratio:16/9;max-height:28vh;background:#000;isolation:isolate;transform:translateZ(0)}#karBox .kdyt iframe,#karBox .kdyt>div{position:absolute;inset:0;width:100%;height:100%}"
 +"#karBox .kdsb{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px 0 0}#karBox .kdsb>b{flex:1 1 160px;min-width:0;display:flex;align-items:center;gap:6px;font-size:13px;color:#ffe066}#karBox .kdsb>b span{display:flex;flex-direction:column;min-width:0}#karBox .kdsb small{color:#cfc6e8;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kdsbi{width:30px;height:30px;flex:0 0 auto}"
 +"#karBox .kdsb button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 11px;font-weight:800;font-size:12.5px;cursor:pointer}#karBox .kdsb .kdduck.on{border-color:#7CFFB2;color:#7CFFB2}#karBox .kdsb .kdstop{border-color:#ff7a9a;color:#ff9ab3}"
 +"#karBox .kdctl{flex:0 0 auto;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:8px 8px max(10px,env(safe-area-inset-bottom))}"
 +"#karBox .kdctl button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:58px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;font-size:11.5px;font-weight:800;cursor:pointer;padding:4px 2px;line-height:1.15}#karBox .kdctl button:disabled{opacity:.4}"
 +"#karBox .kdctl .kdic{width:28px;height:28px}#karBox .kdctl .kdx{border-color:#ff7a9a;color:#ff9ab3;background:rgba(255,85,119,.12)}"
 +"#karBox .kdg{position:relative;display:block;width:24px;height:24px}"
 +"#karBox .kdgm::before{content:'';position:absolute;left:8px;top:2px;width:8px;height:13px;border-radius:5px;background:#fff}#karBox .kdgm::after{content:'';position:absolute;left:5px;top:9px;width:12px;height:8px;border:2px solid #fff;border-top:0;border-radius:0 0 8px 8px}"
 +"#karBox .kdgc::before{content:'';position:absolute;left:1px;top:6px;width:15px;height:12px;border-radius:3px;background:#fff}#karBox .kdgc::after{content:'';position:absolute;left:16px;top:8px;border-left:7px solid #fff;border-top:4px solid transparent;border-bottom:4px solid transparent}"
 +"#karBox .kdgf::before{content:'';position:absolute;inset:3px;border:3px solid #fff;border-radius:50%;border-right-color:transparent}#karBox .kdgf::after{content:'';position:absolute;right:2px;top:3px;border-left:6px solid #fff;border-top:4px solid transparent;border-bottom:4px solid transparent;transform:rotate(60deg)}"
 +"#karBox .kdgx::before,#karBox .kdgx::after{content:'';position:absolute;left:2px;top:10px;width:20px;height:4px;border-radius:2px;background:#ff9ab3;transform:rotate(45deg)}#karBox .kdx span{white-space:pre-line;line-height:1.15;text-align:center}#karBox .kdgx::after{transform:rotate(-45deg)}"
 +"#karBox .kdctl button.off{background:rgba(255,85,119,.16);border-color:#ff7a9a;color:#ffb3c4}#karBox .kdctl button.off .kdg::after,#karBox .kdctl button.off .kdg{opacity:.85}#karBox .kdctl button.off .kdgm,#karBox .kdctl button.off .kdgc{background:linear-gradient(45deg,transparent 46%,#ff5577 46%,#ff5577 56%,transparent 56%)}"
 +"#karBox .kdwarn{position:absolute;left:10px;right:10px;top:96px;z-index:7;background:rgba(29,24,48,.97);border:1px solid #ffe066;border-radius:14px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.5)}#karBox .kdwarn p{flex:1 1 100%;margin:0;font-weight:800;color:#ffe066;line-height:1.5}#karBox .kdwarn .kgo,#karBox .kdwarn .kc{flex:1;border:0;border-radius:10px;padding:10px;font-weight:900;font-size:14px;cursor:pointer}#karBox .kdwarn .kgo{background:#ffe066;color:#1a1300}#karBox .kdwarn .kc{background:rgba(255,255,255,.1);color:#fff}"
 +"#karBox .kdrm{min-height:64px;resize:vertical}"
 // 우리끼리 노래 — 두 줄 이름 (사장님 10-31 밤)
 +"#karBox .kseg button{white-space:pre-line;line-height:1.12;min-height:38px;text-align:center}#karBox .kseg button span{white-space:pre-line;text-overflow:clip}"
 +"#karBox .kchips button span,#karBox .kbch span{white-space:pre-line;text-align:center;line-height:1.15}#karBox .kpgt h3.k2l{white-space:pre-line;line-height:1.15;text-align:center;font-size:15px}"
 +"#karBox .krmh .kdrb{display:flex;align-items:center;gap:4px;border:1px solid #ffb36b;background:rgba(255,179,107,.1);color:#ffb36b;border-radius:999px;padding:5px 10px;font-weight:800;font-size:12.5px;cursor:pointer}#karBox .krmh .kdrb img{width:20px;height:20px}"
 // 충전 안내창 — 크게·즐겁게
 +"#karBox .kpromo{z-index:40;background:rgba(10,4,20,.82);backdrop-filter:blur(3px)}"
 +"#karBox .kpromo>.kprb{width:min(440px,100%);padding:0 0 16px;gap:10px;overflow:hidden;background:linear-gradient(180deg,#2a1146 0%,#1d1830 55%);border:2px solid #ff4fd8;box-shadow:0 0 0 4px rgba(255,79,216,.18),0 18px 50px rgba(0,0,0,.6);border-radius:22px;animation:kprIn .45s cubic-bezier(.2,1.4,.4,1)}@keyframes kprIn{from{transform:scale(.8);opacity:0}to{transform:none;opacity:1}}"
 +"#karBox .kprhero{position:relative;aspect-ratio:4/3;max-height:42vh;overflow:hidden}#karBox .kprimg{width:100%;height:100%;object-fit:cover;display:block}"
 +"#karBox .kprhero .kem{position:absolute;width:21%;height:auto;filter:drop-shadow(0 4px 8px rgba(0,0,0,.45));animation:kprBob 2.2s ease-in-out infinite}"
 +"#karBox .kprhero .kb1{left:3%;top:4%;transform:rotate(-12deg)}#karBox .kprhero .kb2{right:4%;top:3%;width:17%;animation-delay:.4s}#karBox .kprhero .kb3{left:4%;bottom:6%;width:17%;animation-delay:.9s}#karBox .kprhero .kb4{right:3%;bottom:4%;width:22%;animation-delay:1.3s}#karBox .kprhero .kb5{left:42%;bottom:2%;width:16%;animation-delay:.6s}"
 +"@keyframes kprBob{0%,100%{translate:0 0;rotate:-6deg}50%{translate:0 -9px;rotate:6deg}}"
 +"#karBox .kcf{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;opacity:.9;animation:kprCf 3.2s linear infinite}#karBox .kcf.c1{left:10%;background:#ffe066}#karBox .kcf.c2{left:22%;background:#7CFFB2;animation-delay:.5s}#karBox .kcf.c3{left:35%;background:#ff4fd8;animation-delay:1.1s}#karBox .kcf.c4{left:48%;background:#6fd3ff;animation-delay:1.7s}#karBox .kcf.c5{left:61%;background:#ffe066;animation-delay:.3s}#karBox .kcf.c6{left:73%;background:#ff4fd8;animation-delay:2.2s}#karBox .kcf.c7{left:85%;background:#7CFFB2;animation-delay:1.4s}#karBox .kcf.c8{left:93%;background:#ffb36b;animation-delay:2.6s}"
 +"@keyframes kprCf{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(46vh) rotate(540deg);opacity:.2}}"
 +"#karBox .kprh{margin:2px 16px 0!important;font-size:24px!important;line-height:1.3;font-weight:900;text-align:center;color:#ffe066;text-shadow:0 2px 0 rgba(0,0,0,.35)}#karBox .kprh .kemh{width:1.9em;height:1.9em;vertical-align:-.55em;margin-right:4px;animation:kprBob 1.8s ease-in-out infinite;display:inline-block}"
 +"#karBox .kprp{margin:0 16px;text-align:center;font-size:17px;font-weight:800;line-height:1.5;color:#fff}#karBox .kprp .kem{width:1.6em;height:1.6em;vertical-align:-.45em;margin-left:4px}#karBox .kprs{margin:0 16px;text-align:center;font-size:12.5px;color:#cfc6e8}"
 +"#karBox .kprpk{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 14px 0}#karBox .kprpk button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 6px;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;border-radius:14px;cursor:pointer}#karBox .kprpk button b{font-size:20px;font-weight:900}#karBox .kprpk button span{font-size:13.5px;color:#cfc6e8;font-weight:700}#karBox .kprpk button.on{border-color:#ff4fd8;background:rgba(255,79,216,.22);box-shadow:0 0 14px rgba(255,79,216,.45)}#karBox .kprpk button.on span{color:#fff}"
 +"#karBox .kpromo .kprgo{margin:4px 14px 0;font-size:19px;padding:14px 0;border-radius:14px}#karBox .kpromo .kc{margin:0 14px}"
 +"@media (prefers-reduced-motion:reduce){#karBox .kprhero .kem,#karBox .kcf,#karBox .kprh .kemh{animation:none}}";
 document.head.appendChild(s); })();
// ── 도란도란 — 영상 사랑방 (사장님 10-31 밤) ─────────────────────────────────────────────
//   방장이 포인트로 만든다(2시간) · 초대 링크(?dor=)로만 입장 · 최대 9명 · 3×3 바둑판(고정 칸) / 둥글게(방장 가운데 + 8자리) 두 배치
//   두 번 누르면 그 사람 크게 · 노래하기·춤추기 = 그 사람이 모두에게 크게 + 같은 유튜브 영상을 각자 틀고 칸 시계로 맞춘다
//   영상·소리 = 허브 /dor/rtc 가 Cloudflare Realtime SFU 를 중개 (녹화·저장 없음) · 방 소식 = 허브 /dor/ws (WebSocket)
//   연장 = 방 사람 누구나(누른 사람 결제, 같은 끝 시각에 한 번만) · 10분 전 모두에게 알림
Object.assign(TX,{
 dorB:{ko:"도란도란",en:"Doran-doran",ja:"ドランドラン",zhs:"Doran-doran",zht:"Doran-doran",es:"Doran-doran"},
 dorS:{ko:"영상으로 모여 이야기하고 함께 노래하는 사랑방",en:"A cozy video room to chat and sing together",ja:"ビデオで集まっておしゃべりし、一緒に歌う談話室",zhs:"用视频聚在一起聊天、一起唱歌的客厅",zht:"用視訊聚在一起聊天、一起唱歌的客廳",es:"Una sala acogedora para charlar y cantar juntos en video"},
 dorN1:{ko:"방장이 {c}로 2시간 사용 · 참여자는 무료",en:"The host pays {c} for 2 hours · guests join free",ja:"ホストが{c}で2時間使用・参加者は無料",zhs:"房主支付 {c} 使用2小时 · 参与者免费",zht:"房主支付 {c} 使用2小時 · 參與者免費",es:"El anfitrión paga {c} por 2 horas · los invitados entran gratis"},
 dorN2:{ko:"초대 링크로만 입장 · 최대 9명 · 공개 목록 없음",en:"Invitation link only · up to 9 people · not listed publicly",ja:"招待リンクでのみ入室・最大9人・公開リストなし",zhs:"仅凭邀请链接进入 · 最多9人 · 不公开列出",zht:"僅憑邀請連結進入 · 最多9人 · 不公開列出",es:"Solo con enlace de invitación · hasta 9 personas · sin lista pública"},
 dorN3:{ko:"영상과 소리는 녹화·저장하지 않습니다",en:"Video and audio are never recorded or stored",ja:"映像と音声は録画・保存しません",zhs:"不录制、不保存视频和声音",zht:"不錄製、不保存影像和聲音",es:"El video y el audio no se graban ni se guardan"},
 dorMk:{ko:"방 만들기",en:"Create a room",ja:"ルームを作る",zhs:"创建房间",zht:"建立房間",es:"Crear sala"},
 dorAsk:{ko:"도란도란 · 2시간",en:"Doran-doran · 2 hours",ja:"ドランドラン・2時間",zhs:"Doran-doran · 2小时",zht:"Doran-doran · 2小時",es:"Doran-doran · 2 horas"},
 dorMine:{ko:"사용 중인 내 방",en:"Your active room",ja:"使用中のルーム",zhs:"正在使用的房间",zht:"使用中的房間",es:"Tu sala activa"},
 dorIn:{ko:"입장",en:"Enter",ja:"入室",zhs:"进入",zht:"進入",es:"Entrar"},
 dorIng:{ko:"도란도란 방에 입장하는 중…",en:"Entering the video room…",ja:"ドランドランに入室中…",zhs:"正在进入视频聊天室…",zht:"正在進入視訊聊天室…",es:"Entrando en la sala de video…"},
 dorRtE:{ko:"연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",en:"We couldn't connect. Please try again in a moment.",ja:"接続できませんでした。しばらくしてからもう一度お試しください。",zhs:"无法连接，请稍后再试。",zht:"無法連線，請稍後再試。",es:"No pudimos conectar. Inténtalo de nuevo en un momento."},
 dorRf:{ko:"사용한 포인트는 되돌려 드렸습니다.",en:"Your points have been returned.",ja:"使用したポイントはお返ししました。",zhs:"已退还所用积分。",zht:"已退還所用點數。",es:"Te devolvimos los puntos."},
 dorFull:{ko:"방 인원이 가득 찼어요 (최대 9명).",en:"This room is full (up to 9 people).",ja:"ルームが満員です（最大9人）。",zhs:"房间已满（最多9人）。",zht:"房間已滿（最多9人）。",es:"La sala está llena (máximo 9 personas)."},
 dorKick:{ko:"방장이 이 방에서 강퇴했어요.",en:"The host kicked you out of this room.",ja:"ホストによりこのルームから強制退室させられました。",zhs:"房主已将你踢出此房间。",zht:"房主已將你踢出此房間。",es:"El anfitrión te expulsó de esta sala."},
 dorEnd:{ko:"방이 종료되었어요.",en:"The room has ended.",ja:"ルームは終了しました。",zhs:"房间已结束。",zht:"房間已結束。",es:"La sala ha terminado."},
 dorEndT:{ko:"사용 시간이 끝나 방이 종료되었어요.",en:"Time is up, so the room has ended.",ja:"使用時間が終わり、ルームは終了しました。",zhs:"使用时间已到，房间已结束。",zht:"使用時間已到，房間已結束。",es:"Se acabó el tiempo y la sala terminó."},
 dorNo:{ko:"유효하지 않은 초대 링크예요. 방이 종료되었을 수 있어요.",en:"This invitation link isn't valid. The room may have ended.",ja:"無効な招待リンクです。ルームが終了した可能性があります。",zhs:"邀请链接无效，房间可能已结束。",zht:"邀請連結無效，房間可能已結束。",es:"Este enlace no es válido. Puede que la sala haya terminado."},
 dorJoinQ:{ko:"「{r}」 방에 입장할까요? (방장 {h}) 카메라와 마이크를 사용합니다.",en:"Enter “{r}”? (host {h}) Your camera and mic will be used.",ja:"「{r}」に入室しますか？（ホスト {h}）カメラとマイクを使用します。",zhs:"进入「{r}」吗？（房主 {h}）将使用摄像头和麦克风。",zht:"進入「{r}」嗎？（房主 {h}）將使用相機和麥克風。",es:"¿Entrar en «{r}»? (anfitrión {h}) Se usarán tu cámara y micrófono."},
 dorMic:{ko:"마이크",en:"Mic",ja:"マイク",zhs:"麦克风",zht:"麥克風",es:"Micro"},
 dorCam:{ko:"카메라",en:"Camera",ja:"カメラ",zhs:"摄像头",zht:"相機",es:"Cámara"},
 dorFlip:{ko:"전환",en:"Flip",ja:"切替",zhs:"切换",zht:"切換",es:"Girar"},
 dorOut:{ko:"나갔다\n오기",en:"Step\nout",ja:"ちょっと\n外へ",zhs:"暂时\n离开",zht:"暫時\n離開",es:"Salir\nun rato"},
 dorSing:{ko:"노래하기",en:"Sing",ja:"歌う",zhs:"唱歌",zht:"唱歌",es:"Cantar"},
 dorDance:{ko:"춤추기",en:"Dance",ja:"踊る",zhs:"跳舞",zht:"跳舞",es:"Bailar"},
 dorSingT:{ko:"노래할 곡 선택",en:"Choose a song to sing",ja:"歌う曲を選ぶ",zhs:"选择要唱的歌",zht:"選擇要唱的歌",es:"Elige una canción"},
 dorDanceT:{ko:"춤출 음악 선택",en:"Choose music to dance to",ja:"踊る音楽を選ぶ",zhs:"选择跳舞的音乐",zht:"選擇跳舞的音樂",es:"Elige música para bailar"},
 dorNoMu:{ko:"음악 없이 춤추기",en:"Dance without music",ja:"音楽なしで踊る",zhs:"不放音乐直接跳",zht:"不放音樂直接跳",es:"Bailar sin música"},
 dorSingBy:{ko:"{n}님 노래 중",en:"{n} is singing",ja:"{n}さんが歌っています",zhs:"{n} 正在唱歌",zht:"{n} 正在唱歌",es:"{n} está cantando"},
 dorDanceBy:{ko:"{n}님 춤추는 중",en:"{n} is dancing",ja:"{n}さんが踊っています",zhs:"{n} 正在跳舞",zht:"{n} 正在跳舞",es:"{n} está bailando"},
 dorStop:{ko:"멈춤",en:"Stop",ja:"停止",zhs:"停止",zht:"停止",es:"Parar"},
 dorReload:{ko:"화면 다시 불러오기",en:"Reload video",ja:"映像を再読み込み",zhs:"重新加载画面",zht:"重新載入畫面",es:"Recargar vídeo"},
 dorPause:{ko:"일시정지",en:"Pause",ja:"一時停止",zhs:"暂停",zht:"暫停",es:"Pausa"},
 dorPlay:{ko:"재생",en:"Play",ja:"再生",zhs:"播放",zht:"播放",es:"Reproducir"},
 dorDuck:{ko:"다른 마이크 줄이기",en:"Lower other mics",ja:"他のマイクを下げる",zhs:"调低其他麦克风",zht:"調低其他麥克風",es:"Bajar otros micros"},
 dorGrid:{ko:"바둑판",en:"Grid",ja:"グリッド",zhs:"九宫格",zht:"九宮格",es:"Cuadrícula"},
 dorRing:{ko:"둥글게",en:"Circle",ja:"円形",zhs:"围坐",zht:"圍坐",es:"Círculo"},
 dorLeft:{ko:"{m}분 남음",en:"{m} min left",ja:"残り{m}分",zhs:"剩余{m}分钟",zht:"剩餘{m}分鐘",es:"Quedan {m} min"},
 dorWarn:{ko:"10분 뒤 방이 종료됩니다. {c}로 2시간 연장할 수 있어요.",en:"The room ends in 10 minutes. You can extend it 2 hours for {c}.",ja:"10分後にルームが終了します。{c}で2時間延長できます。",zhs:"房间将在10分钟后结束。可用 {c} 延长2小时。",zht:"房間將在10分鐘後結束。可用 {c} 延長2小時。",es:"La sala termina en 10 minutos. Puedes ampliarla 2 horas por {c}."},
 dorExt:{ko:"2시간 연장",en:"Extend 2 hours",ja:"2時間延長",zhs:"延长2小时",zht:"延長2小時",es:"Ampliar 2 horas"},
 dorExtBy:{ko:"{n}님이 2시간 연장했어요",en:"{n} extended the room by 2 hours",ja:"{n}さんが2時間延長しました",zhs:"{n} 延长了2小时",zht:"{n} 延長了2小時",es:"{n} amplió la sala 2 horas"},
 dorExtDup:{ko:"이미 연장되었어요.",en:"It has already been extended.",ja:"すでに延長されています。",zhs:"已经延长过了。",zht:"已經延長過了。",es:"Ya se amplió."},
 dorExtEarly:{ko:"종료 30분 전부터 연장할 수 있어요.",en:"You can extend from 30 minutes before the end.",ja:"終了30分前から延長できます。",zhs:"结束前30分钟起可以延长。",zht:"結束前30分鐘起可以延長。",es:"Puedes ampliar desde 30 minutos antes del final."},
 dorKickB:{ko:"강퇴",en:"Kick out",ja:"強制退室",zhs:"踢出",zht:"踢出",es:"Expulsar"},
 dorKickQ:{ko:"{n}님을 강퇴할까요? 다시 입장할 수 없습니다.",en:"Kick {n} out of this room? They can't come back in.",ja:"{n}さんを強制退室させますか？再入室はできません。",zhs:"要将 {n} 踢出此房间吗？对方无法再进入。",zht:"要將 {n} 踢出此房間嗎？對方無法再進入。",es:"¿Expulsar a {n} de la sala? No podrá volver a entrar."},
 dorClose:{ko:"방 종료",en:"End room",ja:"ルームを終了",zhs:"结束房间",zht:"結束房間",es:"Cerrar sala"},
 dorCloseQ:{ko:"방을 종료할까요? 모두 퇴장합니다.",en:"End the room for everyone?",ja:"ルームを終了しますか？全員が退室します。",zhs:"要结束房间吗？所有人都会退出。",zht:"要結束房間嗎？所有人都會退出。",es:"¿Cerrar la sala para todos?"},
 dorRep:{ko:"신고",en:"Report",ja:"通報",zhs:"举报",zht:"檢舉",es:"Denunciar"},
 dorRepT:{ko:"{n}님 신고",en:"Report {n}",ja:"{n}さんを通報",zhs:"举报 {n}",zht:"檢舉 {n}",es:"Denunciar a {n}"},
 dorRepW:{ko:"욕설·괴롭힘|음란·성적 행위|폭력·위협|광고·도배|미성년자 보호|기타",en:"Abuse or harassment|Sexual content|Violence or threats|Spam|Child safety|Other",ja:"暴言・嫌がらせ|わいせつ・性的行為|暴力・脅迫|宣伝・連投|未成年者保護|その他",zhs:"辱骂·骚扰|色情·性行为|暴力·威胁|广告·刷屏|未成年人保护|其他",zht:"辱罵·騷擾|色情·性行為|暴力·威脅|廣告·洗版|未成年人保護|其他",es:"Insultos o acoso|Contenido sexual|Violencia o amenazas|Spam|Protección de menores|Otro"},
 dorRepM:{ko:"내용 (선택)",en:"Details (optional)",ja:"内容（任意）",zhs:"内容（选填）",zht:"內容（選填）",es:"Detalles (opcional)"},
 dorRepOk:{ko:"신고가 접수되었습니다. 운영자가 확인합니다.",en:"Report received. Our team will review it.",ja:"通報を受け付けました。運営者が確認します。",zhs:"已收到举报，运营人员会进行确认。",zht:"已收到檢舉，營運人員會進行確認。",es:"Denuncia recibida. Nuestro equipo la revisará."},
 dorPerm:{ko:"카메라·마이크를 사용할 수 없어 화면만 보며 참여합니다.",en:"Camera and mic aren't available, so you're joining to watch and listen.",ja:"カメラ・マイクが使えないため、視聴のみで参加します。",zhs:"无法使用摄像头和麦克风，将仅观看参与。",zht:"無法使用相機和麥克風，將僅觀看參與。",es:"No hay cámara ni micrófono; participas solo viendo y escuchando."},
 dorSeat:{ko:"초대해요",en:"Invite",ja:"招待しよう",zhs:"邀请",zht:"邀請",es:"Invita"},
 dorSpot:{ko:"두 번 누르면 크게 보기",en:"Double-tap to enlarge",ja:"ダブルタップで拡大",zhs:"双击放大",zht:"雙擊放大",es:"Toca dos veces para ampliar"},
 dorInv:{ko:"초대",en:"Invite",ja:"招待",zhs:"邀请",zht:"邀請",es:"Invitar"},
 dorInvT:{ko:"{n}님이 도란도란 방 「{r}」에 초대했어요",en:"{n} invited you to the Doran-doran room “{r}”",ja:"{n}さんがドランドラン「{r}」に招待しました",zhs:"{n} 邀请你加入 Doran-doran 房间「{r}」",zht:"{n} 邀請你加入 Doran-doran 房間「{r}」",es:"{n} te ha invitado a la sala Doran-doran «{r}»"},
 dorInvD:{ko:"StageSong 도란도란 — 영상으로 모여 이야기하고 함께 노래해요",en:"StageSong Doran-doran — chat and sing together on video",ja:"StageSong ドランドラン — ビデオで集まっておしゃべりし、一緒に歌おう",zhs:"StageSong Doran-doran — 用视频一起聊天唱歌",zht:"StageSong Doran-doran — 用視訊一起聊天唱歌",es:"StageSong Doran-doran — charla y canta en video"},
 dorInvH:{ko:"초대 링크 (방이 열려 있는 동안 유효)",en:"Invitation link (valid while the room is open)",ja:"招待リンク（ルームが開いている間有効）",zhs:"邀请链接（房间开放期间有效）",zht:"邀請連結（房間開放期間有效）",es:"Enlace de invitación (válido mientras la sala esté abierta)"},
 dorHost:{ko:"방장",en:"Host",ja:"ホスト",zhs:"房主",zht:"房主",es:"Anfitrión"},
 dorMe:{ko:"나",en:"Me",ja:"自分",zhs:"我",zht:"我",es:"Yo"},
 dorRmB:{ko:"도란도란으로 모이기",en:"Meet on video",ja:"ドランドランで集まる",zhs:"视频聚一聚",zht:"視訊聚一聚",es:"Reunirse en video"}
});
var DR={tok:"",ws:null,me:"",own:0,st:null,pc:null,stream:null,face:"user",cam:1,mic:1,off:0,rtt:1e9,rmap:{},pulled:{},el:{},au:{},spot:"",lay:"",duck:1,yt:null,ytId:"",ytOk:false,q:Promise.resolve(),o:null,alive:false,timer:0,warned:0,sil:null,pend:{}};
function dPost(path,o){ var q={sess:sess()}; for(var k in o) q[k]=o[k]; return fetch(HUB+"/dor/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)}).then(function(r){ return r.json().catch(function(){ return {ok:false,err:"http"}; }); }).catch(function(){ return {ok:false,err:"net"}; }); }
function dCost(k){ var d=KP.d&&KP.d.dor; return d&&d[k]!=null?+d[k]:1000; }
function dNow(){ return Date.now()+DR.off; }   // 칸 시계
function dMy(v){ try{ if(v===null){ localStorage.removeItem("kdor_my"); return null; } if(v){ localStorage.setItem("kdor_my",JSON.stringify(v)); if(v.name) localStorage.setItem("kdor_last",String(v.name)); return v; } var x=JSON.parse(localStorage.getItem("kdor_my")||"null"); return x&&/^[A-Za-z0-9]{16}$/.test(x.tok||"")&&x.exp>Date.now()?x:null; }catch(e){ return null; } }
function dIc(n,c){ return '<img class="'+(c||"kdic")+'" src="img/kara/'+n+'.png" alt="" aria-hidden="true">'; }
// 결제 확인 — 로그인·지갑부터 (1,000P 사용 → N P 남음)
function dPay(cost,title,run,onX){ if(!sess()){ kLogin(function(){ dPay(cost,title,run,onX); }); if(onX) onX(); return; }
  var go=function(){ kptAsk(cost,title,run,"",L(TX.kwOk),onX); };
  if(KP.d) go(); else kptLoad().then(function(){ if(KP.d) go(); else { soon(L(TX.efail)); if(onX) onX(); } }); }
// 첫 화면 (만들기·내 방)
function dorOpen(name0){ var b=box(); if(!b) return; if(!name0) try{ name0=localStorage.getItem("kdor_last")||""; }catch(e){}   /* 10-31 지난 방 이름을 미리 채움 */ var o=pgOpen("kdorh"); if(!o) return; var busy=false, msg="";
  var draw=function(){ var my=dMy();
    o.innerHTML=kHead('<h3>'+esc(L(TX.dorB))+'</h3>')+'<div class="kpgb"><div class="kdhero">'+dIc("dor_l","kdhi")+'<b>'+esc(L(TX.dorB))+'</b><p>'+esc(L(TX.dorS))+'</p></div>'
      +(my?'<div class="kdmy"><span>'+esc(L(TX.dorMine))+'<b>'+esc(my.name||L(TX.dorB))+'</b></span><button type="button" class="kgo" data-my="1">'+esc(L(TX.dorIn))+'</button></div>':'')
      +'<ul class="kdnote"><li>'+esc(tf(L(TX.dorN1),{c:ptS(dCost("dor"))}))+'</li><li>'+esc(L(TX.dorN2))+'</li><li>'+esc(L(TX.dorN3))+'</li></ul>'
      +'<b class="kh">'+esc(L(TX.rmName))+'</b><input type="text" class="kni kdnm" maxlength="20" value="'+esc(name0||"")+'">'
      +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo kdmk" data-mk="1"'+(busy?' disabled':'')+'>'+dIc("dor","kdbi")+esc(L(TX.dorMk))+'</button></div>';
    o.querySelector(".kpbk").onclick=pgBack;
    var m=o.querySelector("[data-my]"); if(m) m.onclick=function(){ dorEnter(dMy().tok); };
    o.querySelector("[data-mk]").onclick=function(){ if(busy) return; var nm=String(o.querySelector(".kdnm").value||"").trim(); name0=nm; busy=true; msg=""; draw(); var rid=kRid();
      dPay(dCost("dor"),L(TX.dorAsk),function(done){ dPost("create",{rid:rid,name:nm}).then(function(j){ busy=false;
          if(j&&j.ok){ done(); dMy({tok:j.tok,exp:j.exp,name:j.name||nm}); try{ ntap("kara_dor","create"); }catch(e){} kptLoad(); draw(); dorEnter(j.tok); return; }
          var e=j&&j.err, t=e==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):e==="rt"||e==="init"||e==="net"||e==="http"?L(TX.dorRtE)+(j&&j.refunded?" "+L(TX.dorRf):""):L(TX.efail);
          done(t); kptLoad(); msg=e==="short"?"":t; draw(); }); },function(){ busy=false; draw(); }); }; };
  draw(); try{ ntap("kara_dor","open"); }catch(e){} }
// 초대 링크로 입장 (site.js → karDorJoin)
function dHost(){ return PG.length?PG[PG.length-1]:box(); }   // 안내 창은 맨 위 화면에
function dorJoin(tok){ var b=dHost(); if(!b||!/^[A-Za-z0-9]{16}$/.test(String(tok||""))) return;
  if(!sess()){ kMsg(b,L(TX.lgReq),[[L(TX.lgin),function(){ kLogin(function(){ dorJoin(tok); }); }],[L(TX.cancel),null,"kc"]]); return; }
  soon(L(TX.dorIng));
  dPost("info",{tok:tok}).then(function(j){ var sk=b.querySelector(".ksoon"); if(sk) sk.remove();
    if(!(j&&j.ok)){ if(j&&(j.err==="none"||j.err==="tok")&&dMy()&&dMy().tok===tok) dMy(null); kMsg(b,j&&(j.err==="none"||j.err==="tok")?L(TX.dorNo):L(TX.dorRtE),[[L(TX.ok),null]]); return; }
    if(j.closed){ if(dMy()&&dMy().tok===tok) dMy(null); kMsg(b,L(j.closed==="exp"?TX.dorEndT:TX.dorEnd),[[L(TX.ok),null]]); return; }
    if(j.kick){ kMsg(b,L(TX.dorKick),[[L(TX.ok),null]]); return; }
    if(j.full){ kMsg(b,L(TX.dorFull),[[L(TX.ok),null]]); return; }
    if(j.own){ dMy({tok:tok,exp:j.exp,name:j.name}); dorEnter(tok); return; }
    kMsg(b,tf(L(TX.dorJoinQ),{r:j.name||L(TX.dorB),h:j.host||"guest"}),[[L(TX.dorIn),function(){ dorEnter(tok); }],[L(TX.cancel),null,"kc"]]); }); }
// 전용 앱(StageAudio, 10-31) — 방에 있는 동안 오디오를 통화 모드·스피커 한 가지로 고정, 노래 중엔 잠가 바뀌면 되돌린다 (유튜브 반주 「오디오 렌더기 오류」 막기) · 브라우저는 그대로
function dNA(){ try{ var C=window.Capacitor; return C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.StageAudio||null; }catch(e){ return null; } }
function dNAc(f,a){ var P=dNA(); if(!P||!P[f]) return Promise.resolve(); return Promise.race([Promise.resolve().then(function(){ return P[f](a||{}); }).catch(function(){}),new Promise(function(r){ setTimeout(r,800); })]); }
function dNLk(on){ on=!!on; if(!dNA()||DR.nlk===on) return; DR.nlk=on; dNAc("lock",{on:on}); }
// 사랑방 화면
function dorEnter(tok){ var b=box(); if(!b||!/^[A-Za-z0-9]{16}$/.test(String(tok||""))) return; if(DR.alive) dorBye(1);
  try{ if(REC.nat) kNatOff(); var P=kNat(); if(P&&P.close) P.close().catch(function(){}); }catch(e){}   // 앱 녹화 카메라(StageCam)는 끄고 들어간다 — 같은 카메라를 둘이 못 쓴다
  try{ if(K.pl&&K.pl.pauseVideo) K.pl.pauseVideo(); }catch(e){}
  var o=pgOpen("kdor"); if(!o) return;
  DR.tok=tok; DR.o=o; DR.alive=true; DR.st=null; DR.me=""; DR.own=0; DR.rmap={}; DR.pulled={}; DR.el={}; DR.au={}; DR.spot=""; DR.warned=0; DR.pend={}; DR.q=Promise.resolve();
  try{ DR.lay=sessionStorage.getItem("kdor_lay")||""; }catch(e){ DR.lay=""; }
  o.innerHTML=kHead('<h3 class="kdtt">'+esc(L(TX.dorB))+'</h3><span class="kdtm" data-tm="1"></span><button type="button" class="kddb" data-deco="1"><img src="img/deco/pr_balloons.webp" alt="">'+esc(L(TX.dcB))+'</button>')
    +'<div class="kdbar"><span class="kdn">0/9</span><button type="button" data-lay="1">'+esc(L(TX.dorGrid))+'</button><button type="button" data-inv="1">'+kIc("share",1)+esc(L(TX.dorInv))+'</button><button type="button" class="kdmn" data-mn="1" aria-label="menu">⋯</button></div>'
    +'<div class="kdwrap"><div class="kdstage"></div></div><div class="kddeco"></div><div class="kdsong" hidden></div>'
    +'<div class="kdctl"><button type="button" data-c="mic"><i class="kdg kdgm"></i><span>'+esc(L(TX.dorMic))+'</span></button><button type="button" data-c="cam"><i class="kdg kdgc"></i><span>'+esc(L(TX.dorCam))+'</span></button><button type="button" data-c="flip"><i class="kdg kdgf"></i><span>'+esc(L(TX.dorFlip))+'</span></button>'
    +'<button type="button" data-c="sing">'+dIc("dor_sing")+'<span>'+esc(L(TX.dorSing))+'</span></button><button type="button" data-c="dance">'+dIc("dor_dance")+'<span>'+esc(L(TX.dorDance))+'</span></button><button type="button" class="kdx" data-c="out"><i class="kdg kdgx"></i><span>'+esc(L(TX.dorOut))+'</span></button></div>';
  o._bye=function(){ dorBye(1); };
  o.querySelector(".kpbk").onclick=pgBack;
  o.querySelector("[data-lay]").onclick=function(){ DR.lay=dLay()==="grid"?"ring":"grid"; try{ sessionStorage.setItem("kdor_lay",DR.lay); }catch(e){} dDraw(); };
  o.querySelector("[data-inv]").onclick=dInv;
  o.querySelector("[data-mn]").onclick=dMenu;
  o.querySelector("[data-tm]").onclick=function(){ dExtAsk(); };
  o.querySelector("[data-deco]").onclick=function(){ dcOpen(dcDorCtx(),0); };   // 방 꾸미기 (10-31)
  [].forEach.call(o.querySelectorAll(".kdctl [data-c]"),function(x){ x.onclick=function(){ dCtl(x.dataset.c); }; });
  window.addEventListener("resize",dFit);
  dDraw(); dWs(); DR.nlk=false; dNAc("enter").then(function(){ if(DR.alive&&DR.tok===tok) dMedia(); }); DR.timer=setInterval(dTick,1000); try{ ntap("kara_dor","enter"); }catch(e){} }
function dLay(){ return DR.lay||(DR.st&&DR.st.room.lay)||"grid"; }
// WebSocket — 끊기면 3초 뒤 다시(방이 살아 있으면)
function dWs(){ if(!DR.alive) return; var u=HUB.replace(/^http/,"ws")+"/dor/ws?tok="+DR.tok+"&sess="+encodeURIComponent(sess()), ws;
  try{ ws=new WebSocket(u); }catch(e){ setTimeout(dWs,3000); return; } DR.ws=ws; var pg=0;
  ws.onopen=function(){ var n=0; pg=setInterval(function(){ if(ws.readyState===1) ws.send(JSON.stringify({t:"ping",c:Date.now()})); if(++n>4) { clearInterval(pg); pg=setInterval(function(){ if(ws.readyState===1) ws.send(JSON.stringify({t:"ping",c:Date.now()})); },20000); } },400); };
  ws.onmessage=function(e){ var m=null; try{ m=JSON.parse(e.data); }catch(z){ return; } dMsg(m); };
  ws.onclose=function(e){ clearInterval(pg); if(DR.ws===ws) DR.ws=null; if(!DR.alive) return; var c=e&&e.code;
    if(c===4001||c===4002||c===4004||c===4009) return;   // 내보냄·종료·입장 안 됨·다른 창 = 다시 안 붙음
    setTimeout(dWs,3000); }; }
function dSend(m){ if(DR.ws&&DR.ws.readyState===1) DR.ws.send(JSON.stringify(m)); }
function dMsg(m){ if(!DR.alive) return;
  if(m.t==="pong"){ var rt=Date.now()-m.c; if(rt<DR.rtt){ DR.rtt=rt; DR.off=m.s+rt/2-Date.now(); } return; }
  if(m.t==="hi"){ DR.me=m.me; DR.own=m.own; if(DR.rtt>5000) DR.off=m.now-Date.now(); dDraw(); dSync(); return; }
  if(m.t==="deco"){ dcDorMsg(m); return; }   // 방 꾸미기 소식 (10-31) — 놓음·치움·장소
  if(m.t==="st"){ DR.st=m; if(DR.rtt>5000) DR.off=m.now-Date.now(); dDraw(); dcDorPaint(); dSong(); dSync(); dVol(); var my=dMy(); if(DR.own||(my&&my.tok===DR.tok)) dMy({tok:DR.tok,exp:m.room.exp,name:m.room.name}); return; }
  if(m.t==="warn"){ dWarn(); return; }
  if(m.t==="ext"){ DR.warned=0; var w=DR.o&&DR.o.querySelector(".kdwarn"); if(w) w.remove(); soon(tf(L(TX.dorExtBy),{n:m.nick||"guest"})); return; }
  if(m.t==="kick"){ dEnd(L(TX.dorKick)); return; }
  if(m.t==="closed"){ if(DR.own||dMy()&&dMy().tok===DR.tok) dMy(null); dEnd(L(m.why==="exp"?TX.dorEndT:TX.dorEnd)); return; }
  if(m.t==="err"){ var e=m.err; dEnd(L(e==="full"?TX.dorFull:e==="kick"?TX.dorKick:e==="closed"?TX.dorEnd:e==="exp"?TX.dorEndT:TX.dorNo)); return; } }
function dEnd(msg){ dorBye(0); if(DR.o&&DR.o.isConnected){ var i=PG.indexOf(DR.o); if(i>=0) pgTo(i); } var b=dHost(); if(b) kMsg(b,msg,[[L(TX.ok),null]]); }
function dorBye(leave){ if(!DR.alive) return; DR.alive=false; clearInterval(DR.timer); window.removeEventListener("resize",dFit);
  try{ if(leave) dSend({t:"leave"}); if(DR.ws) DR.ws.close(1000); }catch(e){} DR.ws=null;
  try{ if(DR.pc) DR.pc.close(); }catch(e){} DR.pc=null;
  try{ if(DR.stream) DR.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} DR.stream=null;
  try{ if(DR.sil) DR.sil.close(); }catch(e){} DR.sil=null;
  try{ if(DR.yt&&DR.yt.destroy) DR.yt.destroy(); }catch(e){} DR.yt=null; DR.ytId=""; DR.ytOk=false;
  for(var k in DR.au){ try{ DR.au[k].srcObject=null; DR.au[k].remove(); }catch(e){} } DR.au={}; DR.el={};
  if(dNA()){ DR.nlk=false; dNAc("lock",{on:false}); dNAc("leave"); } }   // 앱: 원래 모드(MODE_NORMAL)·스피커 상태로
// 내 카메라·마이크 → SFU 올리기 (에코 제거 켬 — 각자 트는 반주가 두 번 들리지 않게)
function dMedia(){ var A={echoCancellation:true,noiseSuppression:true,autoGainControl:true}, V={facingMode:DR.face,width:{ideal:480},height:{ideal:480},frameRate:{ideal:20,max:24}};
  var md=navigator.mediaDevices, get=function(c){ return md&&md.getUserMedia?md.getUserMedia(c):Promise.reject(new Error("nomd")); };
  get({audio:A,video:V}).catch(function(){ return get({audio:A}); }).catch(function(){ return null; }).then(function(s){ if(!DR.alive){ if(s) s.getTracks().forEach(function(t){ t.stop(); }); return; }
    DR.stream=s; if(!s){ DR.cam=0; DR.mic=0; soon(L(TX.dorPerm)); } else { DR.cam=s.getVideoTracks().length?1:0; DR.mic=1; }
    dDraw(); dSend({t:"av",cam:DR.cam,mic:DR.mic}); dConnect(); }); }
function dSil(){ try{ var C=window.AudioContext||window.webkitAudioContext, c=new C(), d=c.createMediaStreamDestination(), g=c.createGain(); g.gain.value=0; var os=c.createOscillator(); os.connect(g); g.connect(d); os.start(); DR.sil=c; return d.stream.getAudioTracks()[0]; }catch(e){ return null; } }   // 마이크가 없어도 연결은 열어야 남의 영상을 받는다
function dQ(f){ DR.q=DR.q.then(function(){ if(DR.alive) return f(); }).catch(function(e){ try{ console.log("dor",e&&e.message||e); }catch(z){} }); return DR.q; }
function dRtc(op,o){ o=o||{}; o.op=op; o.tok=DR.tok; return dPost("rtc",o); }
function dConnect(){ dQ(function(){ return dRtc("new").then(function(j){ if(!DR.alive) return; if(!(j&&j.ok)){ if(j&&(j.err==="seat")) { setTimeout(function(){ if(DR.alive&&!DR.pc) dConnect(); },1500); return; } dEnd(L(TX.dorRtE)); return; }
    var pc=new RTCPeerConnection({iceServers:j.ice||[{urls:"stun:stun.cloudflare.com:3478"}],bundlePolicy:"max-bundle"}); DR.pc=pc;
    pc.ontrack=function(e){ var mid=e.transceiver&&e.transceiver.mid, x=DR.rmap[mid]; if(x) dAttach(x.m,x.k,e.track); else DR.pend[mid]=e.track; };
    pc.onconnectionstatechange=function(){ if(pc.connectionState==="failed"&&DR.alive&&DR.pc===pc){ try{ pc.close(); }catch(e){} DR.pc=null; DR.pulled={}; DR.rmap={}; setTimeout(dConnect,1500); } };
    var s=DR.stream, at=s&&s.getAudioTracks()[0]||dSil(), vt=s&&s.getVideoTracks()[0], ks=[];
    if(at){ var ta=pc.addTransceiver(at,{direction:"sendonly"}); ks.push({tx:ta,k:"mic"}); DR.txA=ta; }
    if(vt){ var tv=pc.addTransceiver(vt,{direction:"sendonly",sendEncodings:[{maxBitrate:350000}]}); ks.push({tx:tv,k:"cam"}); DR.txV=tv; }
    if(!ks.length) return;
    return pc.createOffer().then(function(of){ return pc.setLocalDescription(of); }).then(function(){
      return dRtc("push",{sdp:pc.localDescription.sdp,tracks:ks.map(function(x){ return {mid:x.tx.mid,k:x.k}; })}); }).then(function(r){ if(!(r&&r.ok)) throw new Error("push");
      return pc.setRemoteDescription({type:"answer",sdp:r.sdp}); }).then(function(){ if(!DR.mic&&DR.txA&&s) DR.txA.sender.track&&(DR.txA.sender.track.enabled=false); dSync(); }); }); }); }
// 남의 영상·소리 받기 — 방 소식(st)의 tr 목록과 맞춘다 · 나간 사람은 닫는다
function dSync(){ if(!DR.pc||!DR.st||!DR.me) return; dQ(function(){ var pc=DR.pc; if(!pc||pc.signalingState!=="stable"&&pc.signalingState!=="have-local-offer") { } var mem=DR.st.mem, want={}, need=[], gone=[];
    mem.forEach(function(p){ if(p.mid===DR.me) return; (p.tr||[]).forEach(function(k){ want[p.mid+"-"+k]=1; if(!DR.pulled[p.mid+"-"+k]) need.push({m:p.mid,k:k}); }); });
    Object.keys(DR.pulled).forEach(function(n){ if(!want[n]){ gone.push(DR.pulled[n]); delete DR.rmap[DR.pulled[n]]; delete DR.pulled[n]; var m=n.split("-")[0]; if(n.slice(-4)==="-cam"&&DR.el[m]){ var v=DR.el[m].querySelector("video"); if(v) v.srcObject=null; } } });
    var p0=gone.length?dRtc("close",{mids:gone}):Promise.resolve();
    if(!need.length) return p0;
    return p0.then(function(){ return dRtc("pull",{tracks:need}); }).then(function(r){ if(!(r&&r.ok)||!DR.alive||DR.pc!==pc) return;
      (r.tracks||[]).forEach(function(t){ if(t.err||!t.mid) return; var a=String(t.trackName||"").split("-"); DR.rmap[t.mid]={m:a[0],k:a[1]}; DR.pulled[t.trackName]=t.mid; if(DR.pend[t.mid]){ dAttach(a[0],a[1],DR.pend[t.mid]); delete DR.pend[t.mid]; } });
      if(!r.reneg) return;
      return pc.setRemoteDescription({type:"offer",sdp:r.sdp}).then(function(){ return pc.createAnswer(); }).then(function(an){ return pc.setLocalDescription(an); }).then(function(){ return dRtc("reneg",{sdp:pc.localDescription.sdp}); }); }); }); }
function dAttach(m,k,tr){ if(k==="mic"){ var a=DR.au[m]; if(!a){ a=document.createElement("audio"); a.autoplay=true; a.setAttribute("playsinline",""); a.style.display="none"; document.body.appendChild(a); DR.au[m]=a; } a.srcObject=new MediaStream([tr]); a.play().catch(function(){}); dVol(); return; }
  var e=DR.el[m]; DR.pend["v:"+m]=tr; if(e){ var v=e.querySelector("video"); if(v){ v.srcObject=new MediaStream([tr]); v.play().catch(function(){}); } } }
// 노래 중 다른 마이크 줄이기 (부르는 사람 소리는 그대로)
function dVol(){ var s=DR.st&&DR.st.room.song; for(var m in DR.au){ var a=DR.au[m]; try{ a.volume=s&&DR.duck&&s.mode==="sing"&&m!==s.by?0.25:1; }catch(e){} } }
// 화면 그리기 — 자리 순서: 들어온 순서(방장 먼저). 9명 가득이면 방장이 가운데(2행 2열) · 둥글게 = 방장 가운데 + 8자리
function dOrder(){ var mem=(DR.st&&DR.st.mem||[]).slice().sort(function(a,b){ return a.jt-b.jt; }); return mem; }
function dSpotMid(){ var s=DR.st&&DR.st.room.song; return s&&s.by?s.by:DR.spot; }
function dTile(p,cls){ var me=p&&p.mid===DR.me;
  if(!p) return '<div class="kdt kde'+(cls||"")+'" data-inv="1">'+dIc("dor_seat","kdsi")+'<small>'+esc(L(TX.dorSeat))+'</small></div>';
  return '<div class="kdt'+(cls||"")+(me?' kdme':'')+(p.cam?'':' kdnc')+'" data-m="'+esc(p.mid)+'"><video autoplay playsinline muted></video><b class="kdav">'+esc(Array.from(p.nick||"?")[0]||"?")+'</b>'
    +'<span class="kdnm2">'+(p.own?'<em>'+esc(L(TX.dorHost))+'</em>':'')+esc(me?(p.nick||L(TX.dorMe)):(p.nick||"guest"))+'</span>'+(p.mic?'':'<i class="kdmu" aria-hidden="true"></i>')
    +(me?'':'<button type="button" class="kdtm2" data-tm="'+esc(p.mid)+'" aria-label="menu">⋯</button>')+'</div>'; }
function dDraw(){ var o=DR.o; if(!o||!o.isConnected) return; var stg=o.querySelector(".kdstage"); if(!stg) return;
  var mem=dOrder(), n=mem.length, lay=dLay(), sp=dSpotMid(), spP=sp&&mem.filter(function(p){ return p.mid===sp; })[0], h="", rect={};
  [].forEach.call(stg.querySelectorAll(".kdt[data-m]"),function(t){ rect[t.dataset.m]=t.getBoundingClientRect(); });   // 자리 바뀜 부드럽게(FLIP)
  o.querySelector(".kdn").textContent=n+"/9"; var lb=o.querySelector("[data-lay]"); if(lb) lb.textContent=L(lay==="grid"?TX.dorRing:TX.dorGrid);
  var tt=o.querySelector(".kdtt"); if(tt&&DR.st) tt.textContent=DR.st.room.name||L(TX.dorB);
  stg.className="kdstage "+(spP?"kdsp":lay==="ring"?"kdring":"kdgrid");
  if(spP){ h=dTile(spP," kdbig"); }
  else if(lay==="ring"){ var ow=mem.filter(function(p){ return p.own; })[0], rest=mem.filter(function(p){ return !p.own; }), ring=[];
    for(var i=0;i<8;i++) ring.push(rest[i]||null);
    h=dTile(ow||null," kdc0")+ring.map(function(p,i){ return dTile(p," kdr"+i); }).join(""); }
  else { var seats=mem.slice(0,9); if(n>=9){ var oi=seats.findIndex(function(p){ return p.own; }); if(oi>=0){ var ow2=seats.splice(oi,1)[0]; seats.splice(4,0,ow2); } }
    for(var j=0;j<9;j++) h+=dTile(seats[j]||null,""); }
  stg.innerHTML=h;
  [].forEach.call(stg.querySelectorAll(".kdt[data-m]"),function(t){ var m=t.dataset.m, v=t.querySelector("video"); DR.el[m]=t;
    var src=m===DR.me?(DR.stream&&DR.stream.getVideoTracks().length?DR.stream:null):(DR.pend["v:"+m]?new MediaStream([DR.pend["v:"+m]]):null);
    if(v&&src){ v.srcObject=src; v.play().catch(function(){}); if(m===DR.me&&DR.face==="user") v.classList.add("kdmir"); }
    var r0=rect[m]; if(r0){ var r1=t.getBoundingClientRect(), dx=r0.left-r1.left, dy=r0.top-r1.top; if(dx||dy){ t.style.transition="none"; t.style.transform="translate("+dx+"px,"+dy+"px)"; requestAnimationFrame(function(){ t.style.transition="transform .35s ease"; t.style.transform=""; }); } }
    var lt=0; t.addEventListener("click",function(e){ if(e.target.closest("[data-tm]")) return; var now=Date.now(); if(now-lt<350){ lt=0; if(dSpotMid()&&DR.st&&DR.st.room.song) return; DR.spot=DR.spot===m?"":m; dDraw(); } else lt=now; });
    t.addEventListener("dblclick",function(e){ e.preventDefault(); }); });
  [].forEach.call(stg.querySelectorAll("[data-tm]"),function(x){ x.onclick=function(e){ e.stopPropagation(); dMemMenu(x.dataset.tm); }; });
  [].forEach.call(stg.querySelectorAll(".kde[data-inv]"),function(x){ x.onclick=dInv; });
  var cs=o.querySelectorAll(".kdctl [data-c]"); [].forEach.call(cs,function(x){ var c=x.dataset.c; x.classList.toggle("off",(c==="mic"&&!DR.mic)||(c==="cam"&&!DR.cam)); if(c==="flip") x.disabled=!(DR.stream&&DR.stream.getVideoTracks().length); });
  dFit(); dTick(); }
function dFit(){ var o=DR.o; if(!o||!o.isConnected) return; var w=o.querySelector(".kdwrap"), s=o.querySelector(".kdstage"); if(!w||!s) return; var side=Math.max(160,Math.min(w.clientWidth,w.clientHeight)); s.style.width=side+"px"; s.style.height=side+"px"; }
function dTick(){ var o=DR.o; if(!o||!DR.st) return; var e=o.querySelector("[data-tm]"); if(!e) return; var left=Math.max(0,DR.st.room.exp-dNow()), m=Math.ceil(left/60000);
  e.textContent=tf(L(TX.dorLeft),{m:m}); e.classList.toggle("kdlow",left<=10*60000); if(left<=10*60000&&left>0&&!DR.warned) dWarn(); }
function dWarn(){ var o=DR.o; if(!o||DR.warned) return; DR.warned=1; var w=document.createElement("div"); w.className="kdwarn";
  w.innerHTML='<p>'+esc(tf(L(TX.dorWarn),{c:ptS(dCost("dorx"))}))+'</p><button type="button" class="kgo" data-x="1">'+esc(L(TX.dorExt))+'</button><button type="button" class="kc" data-n="1">'+esc(L(TX.ok))+'</button>';
  o.appendChild(w); w.querySelector("[data-x]").onclick=function(){ dExtAsk(); }; w.querySelector("[data-n]").onclick=function(){ w.remove(); }; }
function dExtAsk(){ if(!DR.st) return; var exp=DR.st.room.exp, left=exp-dNow(); if(left>30*60000){ soon(L(TX.dorExtEarly)); return; } var rid=kRid();
  dPay(dCost("dorx"),L(TX.dorExt),function(done){ dPost("ext",{tok:DR.tok,rid:rid,win:exp}).then(function(j){ if(j&&j.ok){ done(); var w=DR.o&&DR.o.querySelector(".kdwarn"); if(w) w.remove(); kptLoad(); try{ ntap("kara_dor","ext"); }catch(e){} return; }
    var e=j&&j.err; if(e==="dup"){ done(); soon(L(TX.dorExtDup)); return; } done(e==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):e==="early"?L(TX.dorExtEarly):L(TX.efail)); kptLoad(); }); }); }
// 단추
function dCtl(c){ var s=DR.stream;
  if(c==="out"){ pgBack(); return; }
  if(c==="mic"){ if(!s||!s.getAudioTracks().length) return soon(L(TX.dorPerm)); DR.mic=DR.mic?0:1; s.getAudioTracks().forEach(function(t){ t.enabled=!!DR.mic; }); dSend({t:"av",cam:DR.cam,mic:DR.mic}); dDraw(); return; }
  if(c==="cam"){ if(!s||!s.getVideoTracks().length) return soon(L(TX.dorPerm)); DR.cam=DR.cam?0:1; var vt=s.getVideoTracks()[0]; vt.enabled=!!DR.cam; try{ if(DR.txV) DR.txV.sender.replaceTrack(DR.cam?vt:null); }catch(e){} dSend({t:"av",cam:DR.cam,mic:DR.mic}); dDraw(); return; }   // 끄면 보내지 않는다(받는 쪽 요금·데이터 절약)
  if(c==="flip"){ if(!s||!s.getVideoTracks().length) return; var nf=DR.face==="user"?"environment":"user";
    navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:nf},width:{ideal:480},height:{ideal:480},frameRate:{ideal:20,max:24}}}).catch(function(){ return navigator.mediaDevices.getUserMedia({video:{facingMode:nf}}); }).then(function(ns){ if(!DR.alive){ ns.getTracks().forEach(function(t){ t.stop(); }); return; }
      var old=s.getVideoTracks()[0], nt=ns.getVideoTracks()[0]; s.removeTrack(old); old.stop(); s.addTrack(nt); nt.enabled=!!DR.cam; DR.face=nf; try{ if(DR.txV&&DR.cam) DR.txV.sender.replaceTrack(nt); }catch(e){} dDraw(); }).catch(function(){ soon(L(TX.efail)); }); return; }
  if(c==="sing"){ kSongPick(DR.o,L(TX.dorSingT),function(x){ dSend({t:"song",op:"start",vid:x.id,title:x.t,mode:"sing"}); try{ ntap("kara_dor","sing"); }catch(e){} }); return; }
  if(c==="dance"){ var w=document.createElement("div"); w.className="kpm"; DR.o.appendChild(w);
    w.innerHTML='<div><h3>'+esc(L(TX.dorDance))+'</h3><button type="button" class="kgo" data-mu="1">'+esc(L(TX.dorDanceT))+'</button><button type="button" class="krf" data-no="1">'+esc(L(TX.dorNoMu))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    w.querySelector("[data-no]").onclick=function(){ w.remove(); dSend({t:"song",op:"start",vid:"",mode:"dance"}); try{ ntap("kara_dor","dance"); }catch(e){} };
    w.querySelector("[data-mu]").onclick=function(){ w.remove(); kSongPick(DR.o,L(TX.dorDanceT),function(x){ dSend({t:"song",op:"start",vid:x.id,title:x.t,mode:"dance"}); try{ ntap("kara_dor","dance_mu"); }catch(e){} }); }; } }
// 노래·춤 띠 + 유튜브 맞춤 (모두가 각자 같은 영상 · 칸 시계 t0 기준)
function dSong(){ var o=DR.o; if(!o) return; var bar=o.querySelector(".kdsong"), s=DR.st&&DR.st.room.song; o.classList.toggle("kdsongon",!!s);
  dNLk(!!s);   // 앱: 노래·춤 중엔 오디오 모드 잠금
  if(!s){ bar.hidden=true; bar.innerHTML=""; DR.songId=""; try{ if(DR.yt&&DR.yt.destroy) DR.yt.destroy(); }catch(e){} DR.yt=null; DR.ytId=""; DR.ytOk=false; dFit(); return; }
  var by=(DR.st.mem.filter(function(p){ return p.mid===s.by; })[0]||{}).nick||s.byNick||"guest";
  if(DR.songId!==s.id){ if(DR.ytRid!==s.id){ DR.ytRid=s.id; DR.ytRe=0; } DR.songId=s.id; bar.hidden=false;
    bar.innerHTML=(s.vid?'<div class="kdyt"><div id="dorYt"></div></div>':'')+'<div class="kdsb"><b>'+dIc(s.mode==="dance"?"dor_dance":"dor_sing","kdsbi")+'<span>'+esc(tf(L(s.mode==="dance"?TX.dorDanceBy:TX.dorSingBy),{n:by}))+(s.title?'<small>'+esc(s.title)+'</small>':'')+'</span></b>'
      +(s.vid?'<button type="button" data-pp="1"></button>':'')+(s.mode==="sing"?'<button type="button" class="kdduck'+(DR.duck?' on':'')+'" data-dk="1">'+esc(L(TX.dorDuck))+'</button>':'')+'<button type="button" class="kdstop" data-sp="1">'+esc(L(TX.dorStop))+'</button>'+(s.vid?'<button type="button" data-rl="1" title="'+esc(L(TX.dorReload))+'">'+esc(L(TX.dorReload))+'</button>':'')+'</div>';
    var rl=bar.querySelector("[data-rl]"); if(rl) rl.onclick=function(){ DR.songId=""; dSong(); };   // 반주 화면이 까맣게 남으면 다시 불러오기 (10-31)
    bar.querySelector("[data-sp]").onclick=function(){ dSend({t:"song",op:"stop",id:s.id}); };
    var dk=bar.querySelector("[data-dk]"); if(dk) dk.onclick=function(){ DR.duck=DR.duck?0:1; dk.classList.toggle("on",!!DR.duck); dVol(); };
    var pp=bar.querySelector("[data-pp]"); if(pp) pp.onclick=function(){ var c=DR.st&&DR.st.room.song; if(!c) return; if(c.st==="play"){ var pos=0; try{ pos=DR.yt.getCurrentTime(); }catch(e){} dSend({t:"song",op:"pause",id:c.id,pos:pos}); } else dSend({t:"song",op:"resume",id:c.id}); };
    try{ if(DR.yt&&DR.yt.destroy) DR.yt.destroy(); }catch(e){} DR.yt=null; DR.ytOk=false; DR.ytId=s.vid;
    if(s.vid) ytApi(function(){ if(!DR.alive||DR.songId!==s.id||!document.getElementById("dorYt")) return;
      DR.yt=new YT.Player("dorYt",{videoId:s.vid,playerVars:{autoplay:0,playsinline:1,rel:0,controls:0,disablekb:1},events:{
        onReady:function(){ DR.ytOk=true; try{ DR.yt.setPlaybackQuality("medium"); }catch(e){} dYtSync(true); },
        onError:function(){ if((DR.ytRe||0)<3){ DR.ytRe=(DR.ytRe||0)+1; setTimeout(function(){ DR.songId=""; dSong(); },800); } },
        onStateChange:function(ev){ if(ev&&ev.data===0){ var c=DR.st&&DR.st.room.song; if(c&&c.id===s.id&&c.by===DR.me) dSend({t:"song",op:"end",id:c.id}); } } }}); });
    dFit(); }
  var pb=bar.querySelector("[data-pp]"); if(pb) pb.textContent=L(s.st==="play"?TX.dorPause:TX.dorPlay);
  dYtSync(true); }
function dYtSync(hard){ var s=DR.st&&DR.st.room.song, p=DR.yt; if(!s||!p||!DR.ytOk||!s.vid) return; clearTimeout(DR.ytT);
  try{ if(s.st==="pause"){ p.pauseVideo(); if(Math.abs((p.getCurrentTime()||0)-s.pos)>0.5) p.seekTo(s.pos,true); return; }
    var want=(dNow()-s.t0)/1000;
    if(want<0){ p.seekTo(0,true); p.pauseVideo(); DR.ytT=setTimeout(function(){ dYtSync(true); },Math.min(-want*1000,5000)); return; }
    var cur=p.getCurrentTime()||0, stt=p.getPlayerState(); if(hard||Math.abs(cur-want)>0.8) p.seekTo(want,true); if(stt!==1) p.playVideo(); var L0=DR.ytL; if(!hard&&want>3&&L0&&L0.id===s.id&&Math.abs(cur-L0.c)<0.2){ L0.n=(L0.n||0)+1; if(L0.n>=2&&(DR.ytRe||0)<3){ DR.ytRe=(DR.ytRe||0)+1; DR.ytL=null; DR.songId=""; dSong(); return; } } else DR.ytL={id:s.id,c:cur,n:0}; }catch(e){}   // 10-31 「오디오 렌더기 오류」 등으로 멈추면(재생 시간이 안 늘면) 반주 화면을 새로 띄운다 — 최대 3번
  DR.ytT=setTimeout(function(){ dYtSync(false); },3000); }
// 사람 메뉴 — 신고 · (방장) 내보내기
function dMemMenu(mid){ var p=(DR.st&&DR.st.mem||[]).filter(function(x){ return x.mid===mid; })[0]; if(!p) return; var w=document.createElement("div"); w.className="kpm"; DR.o.appendChild(w);
  w.innerHTML='<div><h3>'+esc(p.nick||"guest")+'</h3><div class="kmn"><button type="button" data-sp="1">'+esc(L(TX.dorSpot))+'</button>'+(DR.own&&!p.own?'<button type="button" class="r" data-k="1">'+esc(L(TX.dorKickB))+'</button>':'')+'<button type="button" class="r" data-r="1">'+esc(L(TX.dorRep))+'</button></div><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
  w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
  w.querySelector("[data-sp]").onclick=function(){ w.remove(); if(!(DR.st&&DR.st.room.song)){ DR.spot=DR.spot===mid?"":mid; dDraw(); } };
  var k=w.querySelector("[data-k]"); if(k) k.onclick=function(){ w.remove(); kMsg(DR.o,tf(L(TX.dorKickQ),{n:p.nick||"guest"}),[[L(TX.dorKickB),function(){ dSend({t:"kick",mid:mid}); }],[L(TX.cancel),null,"kc"]]); };
  w.querySelector("[data-r]").onclick=function(){ w.remove(); dReport(p); }; }
function dReport(p){ var w=document.createElement("div"); w.className="kpm"; DR.o.appendChild(w); var why=-1, busy=false, ws=["abuse","sexual","violence","spam","minor","other"];
  var draw=function(msg){ w.innerHTML='<div><h3>'+esc(tf(L(TX.dorRepT),{n:p.nick||"guest"}))+'</h3><div class="kfls">'+ws.map(function(x,i){ return '<button type="button" data-i="'+i+'"'+(i===why?' class="on"':'')+'>'+esc(kTx(TX.dorRepW,i))+'</button>'; }).join("")+'</div>'
      +'<textarea class="kni kdrm" maxlength="300" placeholder="'+esc(L(TX.dorRepM))+'"></textarea>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo" data-go="1"'+(why<0||busy?' disabled':'')+'>'+esc(L(TX.dorRep))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-i]"),function(x){ x.onclick=function(){ why=+x.dataset.i; var mm=w.querySelector(".kdrm").value; draw(); w.querySelector(".kdrm").value=mm; }; });
    w.querySelector("[data-go]").onclick=function(){ if(busy||why<0) return; busy=true; var memo=w.querySelector(".kdrm").value; dPost("report",{tok:DR.tok,mid:p.mid,why:ws[why],memo:memo}).then(function(j){ busy=false; if(j&&j.ok){ w.remove(); soon(L(TX.dorRepOk)); try{ ntap("kara_dor","report"); }catch(e){} } else draw(L(TX.efail)); }); }; };
  draw(""); }
// ⋯ 메뉴 — 연장 · (방장) 방 종료
function dMenu(){ var w=document.createElement("div"); w.className="kpm"; DR.o.appendChild(w);
  w.innerHTML='<div><h3>'+esc((DR.st&&DR.st.room.name)||L(TX.dorB))+'</h3><div class="kmn"><button type="button" data-x="1">'+esc(L(TX.dorExt))+'</button><button type="button" data-i="1">'+kIc("share")+esc(L(TX.dorInv))+'</button><button type="button" data-nr="1">'+kIc("fol")+esc(L(NT.nrFind))+'</button>'+(DR.own?'<button type="button" class="r" data-c="1">'+esc(L(TX.dorClose))+'</button>':'')+'</div><p class="km">'+esc(L(TX.dorN3))+'</p><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
  w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
  w.querySelector("[data-x]").onclick=function(){ w.remove(); dExtAsk(); };
  w.querySelector("[data-i]").onclick=function(){ w.remove(); dInv(); };
  w.querySelector("[data-nr]").onclick=function(){ w.remove(); nrOpen({type:"dor",tok:DR.tok,name:(DR.st&&DR.st.room.name)||""}); };   // 근처 친구 찾기 (10-31) — 지금 방으로
  var c=w.querySelector("[data-c]"); if(c) c.onclick=function(){ w.remove(); kMsg(DR.o,L(TX.dorCloseQ),[[L(TX.dorClose),function(){ if(DR.own||dMy()&&dMy().tok===DR.tok) dMy(null); dSend({t:"close"}); }],[L(TX.cancel),null,"kc"]]); }; }
// 초대 — 공용 공유창(카카오톡·LINE·X·WeChat·Weibo·복사)
function dInv(){ if(!DR.tok) return; var u=RINV_U+"?dor="+DR.tok, iu=u+"&install=1", nm=(DR.st&&DR.st.room.name)||L(TX.dorB), me=(DR.st&&DR.st.mem||[]).filter(function(p){ return p.mid===DR.me; })[0], on=me&&me.nick||"";
  var ttl=on?tf(L(TX.dorInvT),{n:on,r:nm}):tf(L(TX.dorInvT),{n:"StageSong",r:nm});
  kShare({hd:L(TX.dorInv)+" · "+L(TX.dorInvH),url:u,iurl:iu,txt:ttl,kk:{title:ttl,desc:L(TX.dorInvD),img:RINV_U+"img/card/card_dor.png",w:1200,h:630,b1:L(TX.dorIn)}}); try{ ntap("kara_dor","inv"); }catch(e){} }
// ── 주변 노래 친구 (사장님 10-31 「일단 만들어」) ─────────────────────────────────────────────
//   허브 /near/* (near.js) · 19세 이상 성인 인증 계정만 · 「내 위치 보이기」 켠 사람끼리만 (24시간, 다시 켜면 연장)
//   위치 = 대략 위치(enableHighAccuracy:false) → 소수 둘째 자리(약 1km)로 줄여 보냄 · 목록엔 거리 구간만(1·3·10km 이내)
//   「같이 노래해요」 = 새 방(우리끼리 노래 방 / 도란도란 — 수락하면 초대한 사람 지갑에서 결제, 실패하면 되돌림)
//   방 안 「근처 친구 찾기」 = 지금 방으로 부르기(추가 요금 없음, 10분) · 받은 초대 = 수락 / 거절 / 차단 · 30초마다 받은 함 확인(배지)
var NT={
 nrB:{ko:"주변 노래 친구",en:"Singers nearby",ja:"近くの歌友",zhs:"附近歌友",zht:"附近歌友",es:"Cantantes cerca"},
 nrFind:{ko:"근처 친구 찾기",en:"Find nearby friends",ja:"近くの友だちを探す",zhs:"查找附近的朋友",zht:"尋找附近的朋友",es:"Buscar amigos cerca"},
 nrS:{ko:"위치를 켠 근처 친구와 같이 노래해요",en:"Sing together with nearby friends who share their location",ja:"位置情報をオンにした近くの友だちと一緒に歌おう",zhs:"和开启位置的附近朋友一起唱歌",zht:"和開啟位置的附近朋友一起唱歌",es:"Canta con amigos cercanos que comparten su ubicación"},
 vis:{ko:"내 위치 보이기",en:"Show my location",ja:"自分の位置を表示",zhs:"显示我的位置",zht:"顯示我的位置",es:"Mostrar mi ubicación"},
 visOn:{ko:"{t}까지 근처 친구에게 보입니다",en:"Visible to nearby friends until {t}",ja:"{t}まで近くの友だちに表示されます",zhs:"在{t}之前对附近朋友可见",zht:"在{t}之前對附近朋友可見",es:"Visible para amigos cercanos hasta {t}"},
 visOff:{ko:"켜면 근처 친구와 서로 보입니다 · 대략 위치(약 1km)만 사용",en:"Turn on to see each other · approximate location only (about 1 km)",ja:"オンにするとお互いに表示されます・おおよその位置(約1km)のみ使用",zhs:"开启后可互相看到 · 仅使用大致位置(约1公里)",zht:"開啟後可互相看到 · 僅使用大致位置(約1公里)",es:"Actívalo para veros mutuamente · solo ubicación aproximada (unos 1 km)"},
 renew:{ko:"24시간 연장",en:"Extend 24 h",ja:"24時間延長",zhs:"延长24小时",zht:"延長24小時",es:"Ampliar 24 h"},
 all:{ko:"전체",en:"All",ja:"すべて",zhs:"全部",zht:"全部",es:"Todos"},
 km:{ko:"{k}km 이내",en:"Within {k} km",ja:"{k}km以内",zhs:"{k}公里以内",zht:"{k}公里以內",es:"A menos de {k} km"},
 none:{ko:"근처에 위치를 켠 친구가 없습니다",en:"No nearby friends are sharing their location",ja:"近くに位置情報をオンにした友だちはいません",zhs:"附近没有开启位置的朋友",zht:"附近沒有開啟位置的朋友",es:"No hay amigos cerca compartiendo su ubicación"},
 offL:{ko:"「내 위치 보이기」를 켜면 근처 친구 목록이 보입니다",en:"Turn on “Show my location” to see nearby friends",ja:"「自分の位置を表示」をオンにすると近くの友だちが表示されます",zhs:"开启「显示我的位置」即可看到附近朋友",zht:"開啟「顯示我的位置」即可看到附近朋友",es:"Activa «Mostrar mi ubicación» para ver amigos cercanos"},
 song:{ko:"최근 노래",en:"Latest song",ja:"最近の歌",zhs:"最近演唱",zht:"最近演唱",es:"Última canción"},
 invB:{ko:"같이 노래해요",en:"Sing together",ja:"一緒に歌おう",zhs:"一起唱吧",zht:"一起唱吧",es:"Cantemos juntos"},
 invR:{ko:"초대",en:"Invite",ja:"招待",zhs:"邀请",zht:"邀請",es:"Invitar"},
 invd:{ko:"초대함",en:"Invited",ja:"招待済み",zhs:"已邀请",zht:"已邀請",es:"Invitado"},
 adT:{ko:"성인 인증이 필요합니다",en:"Adult verification required",ja:"成人認証が必要です",zhs:"需要成人认证",zht:"需要成人認證",es:"Se requiere verificación de edad"},
 adD:{ko:"주변 노래 친구는 19세 이상 성인 인증을 마친 계정만 이용할 수 있습니다. 본인인증은 한 번만 하면 되며, 태어난 해와 성인 여부만 저장합니다.",en:"Singers nearby is available only to accounts verified as 19 or older. You verify once; we keep only your birth year and adult status.",ja:"近くの歌友は19歳以上の成人認証を済ませたアカウントのみ利用できます。本人認証は一度だけで、生まれ年と成人かどうかのみ保存します。",zhs:"附近歌友仅限完成19岁以上成人认证的账号使用。只需认证一次，仅保存出生年份和是否成年。",zht:"附近歌友僅限完成19歲以上成人認證的帳號使用。只需認證一次，僅保存出生年份和是否成年。",es:"Cantantes cerca solo está disponible para cuentas verificadas como mayores de 19 años. Solo se verifica una vez; guardamos solo el año de nacimiento y si eres adulto."},
 idvB:{ko:"본인인증",en:"Verify identity",ja:"本人認証",zhs:"实名认证",zht:"實名認證",es:"Verificar identidad"},
 idvX:{ko:"본인인증을 진행할 수 없습니다. 고객센터로 문의해 주세요",en:"Identity verification cannot be completed. Please contact customer support.",ja:"本人認証を進められません。カスタマーセンターにお問い合わせください",zhs:"无法进行实名认证。请联系客服",zht:"無法進行實名認證。請聯絡客服",es:"No se puede completar la verificación de identidad. Contacta con atención al cliente."},
 idvOk:{ko:"본인인증이 완료되었습니다",en:"Identity verified",ja:"本人認証が完了しました",zhs:"实名认证已完成",zht:"實名認證已完成",es:"Identidad verificada"},
 csT:{ko:"위치정보 이용 동의",en:"Consent to use location information",ja:"位置情報の利用への同意",zhs:"位置信息使用同意",zht:"位置資訊使用同意",es:"Consentimiento para usar la ubicación"},
 csL:{ko:"이용 목적: 주변 노래 친구 찾기(거리 표시)와 같이 노래하기 초대|수집 항목: 기기의 대략 위치 — 약 1km 단위로 줄여 저장하며 정확한 좌표는 저장하지 않습니다|공개 범위: 위치를 켠 성인 이용자에게 거리 구간(1km·3km·10km 이내)만 보이며 좌표·주소는 보이지 않습니다|보유 기간: 켜 둔 동안만 보관하고, 끄거나 24시간이 지나면 바로 삭제합니다. 위치정보 이용·제공 사실 확인자료는 「위치정보의 보호 및 이용 등에 관한 법률」에 따라 6개월 보관 뒤 삭제합니다|끄는 방법: 「내 위치 보이기」를 끄면 바로 보이지 않으며, 「위치정보 동의 철회」로 언제든 동의를 철회할 수 있습니다|동의하지 않아도 다른 노래방 기능은 그대로 이용할 수 있습니다",
  en:"Purpose: finding singers nearby (distance display) and invitations to sing together|Collected: your device's approximate location — rounded to about 1 km before saving; exact coordinates are never stored|Who sees it: other verified adults who turned on their location see only a distance range (within 1, 3 or 10 km), never coordinates or addresses|Retention: kept only while turned on and deleted as soon as you turn it off or after 24 hours. Records of location use and provision are kept for 6 months as required by Korea's Act on the Protection, Use, etc. of Location Information, then deleted|How to stop: turn off “Show my location” to disappear at once, or withdraw consent any time with “Withdraw location consent”|You can keep using all other karaoke features without consenting",
  ja:"利用目的：近くの歌友探し(距離表示)と一緒に歌う招待|収集項目：端末のおおよその位置 — 約1km単位に丸めて保存し、正確な座標は保存しません|公開範囲：位置をオンにした成人利用者に距離の区分(1km・3km・10km以内)のみ表示され、座標・住所は表示されません|保有期間：オンの間のみ保管し、オフにするか24時間が過ぎるとすぐ削除します。位置情報の利用・提供事実の確認資料は韓国「位置情報の保護及び利用等に関する法律」により6か月保管後に削除します|オフにする方法：「自分の位置を表示」をオフにするとすぐ表示されなくなり、「位置情報の同意撤回」でいつでも同意を撤回できます|同意しなくても他のカラオケ機能はそのまま利用できます",
  zhs:"使用目的：查找附近歌友(显示距离)和邀请一起唱歌|收集项目：设备的大致位置 — 保存前约按1公里取整，不保存精确坐标|公开范围：仅向开启位置的成年用户显示距离区间(1公里·3公里·10公里以内)，不显示坐标和地址|保存期限：仅在开启期间保存，关闭或满24小时后立即删除。位置信息使用·提供事实确认资料依韩国《位置信息保护及利用法》保存6个月后删除|关闭方法：关闭「显示我的位置」即刻不再显示，也可随时通过「撤回位置信息同意」撤回同意|不同意也可以照常使用其他练歌房功能",
  zht:"使用目的：尋找附近歌友(顯示距離)和邀請一起唱歌|收集項目：裝置的大致位置 — 儲存前約按1公里取整，不儲存精確座標|公開範圍：僅向開啟位置的成年使用者顯示距離區間(1公里·3公里·10公里以內)，不顯示座標和地址|保存期限：僅在開啟期間保存，關閉或滿24小時後立即刪除。位置資訊使用·提供事實確認資料依韓國《位置資訊保護及利用法》保存6個月後刪除|關閉方法：關閉「顯示我的位置」即刻不再顯示，也可隨時透過「撤回位置資訊同意」撤回同意|不同意也可以照常使用其他練歌房功能",
  es:"Finalidad: buscar cantantes cerca (mostrar distancia) e invitaciones para cantar juntos|Datos: la ubicación aproximada del dispositivo, redondeada a unos 1 km antes de guardarla; nunca se guardan coordenadas exactas|Quién la ve: otros adultos verificados con la ubicación activada ven solo un rango de distancia (a menos de 1, 3 o 10 km), nunca coordenadas ni direcciones|Conservación: solo mientras esté activada; se borra al desactivarla o a las 24 horas. Los registros de uso y cesión de la ubicación se guardan 6 meses según la ley coreana de protección de la información de ubicación y luego se borran|Cómo desactivarla: desactiva «Mostrar mi ubicación» para dejar de aparecer al instante, o retira el consentimiento cuando quieras con «Retirar consentimiento de ubicación»|Puedes seguir usando las demás funciones del karaoke sin dar tu consentimiento"},
 csOp:{ko:"주식회사 부만 · 위치기반서비스사업 신고 제1866호 · 위치정보관리책임자 황의만",en:"Booman Inc. · Location-based service business report No. 1866 · Location information officer: Hwang Euiman",ja:"Booman Inc.(株式会社 부만) · 位置基盤サービス事業申告 第1866号 · 位置情報管理責任者 Hwang Euiman",zhs:"Booman Inc.(株式会社 부만) · 位置服务业务申报 第1866号 · 位置信息管理负责人 Hwang Euiman",zht:"Booman Inc.(株式会社 부만) · 位置服務業務申報 第1866號 · 位置資訊管理負責人 Hwang Euiman",es:"Booman Inc. · Registro de servicio basado en ubicación n.º 1866 · Responsable de información de ubicación: Hwang Euiman"},
 csOk:{ko:"동의하고 켜기",en:"Agree and turn on",ja:"同意してオンにする",zhs:"同意并开启",zht:"同意並開啟",es:"Aceptar y activar"},
 csTm:{ko:"이용약관 보기",en:"View terms",ja:"利用規約を見る",zhs:"查看使用条款",zht:"查看使用條款",es:"Ver términos"},
 geoX:{ko:"위치를 확인할 수 없습니다. 기기 설정에서 위치 권한을 허용해 주세요",en:"Couldn't get your location. Please allow location access in your device settings.",ja:"位置を確認できません。端末の設定で位置情報の権限を許可してください",zhs:"无法获取位置。请在设备设置中允许位置权限",zht:"無法取得位置。請在裝置設定中允許位置權限",es:"No se pudo obtener tu ubicación. Permite el acceso a la ubicación en los ajustes del dispositivo."},
 geoIng:{ko:"위치를 확인하는 중…",en:"Checking your location…",ja:"位置を確認中…",zhs:"正在获取位置…",zht:"正在取得位置…",es:"Obteniendo tu ubicación…"},
 nick:{ko:"스테이지에서 ID를 먼저 설정해 주세요",en:"Please set your ID in Stage first.",ja:"先にステージでIDを設定してください",zhs:"请先在舞台中设置ID",zht:"請先在舞台中設定ID",es:"Primero configura tu ID en Escenario."},
 locX:{ko:"오늘은 위치를 더 갱신할 수 없습니다. 내일 다시 이용해 주세요",en:"You can't update your location again today. Please try tomorrow.",ja:"本日はこれ以上位置を更新できません。明日またご利用ください",zhs:"今天无法再更新位置，请明天再试",zht:"今天無法再更新位置，請明天再試",es:"Hoy ya no puedes actualizar tu ubicación. Inténtalo mañana."},
 invT:{ko:"같이 노래해요 · {n}님",en:"Sing together · {n}",ja:"一緒に歌おう・{n}さん",zhs:"一起唱吧 · {n}",zht:"一起唱吧 · {n}",es:"Cantemos juntos · {n}"},
 tSong:{ko:"우리끼리 노래 방",en:"Just Us Karaoke room",ja:"仲間だけカラオケ部屋",zhs:"小圈子K歌房",zht:"小圈子K歌房",es:"Sala Solo nosotros Karaoke"},
 tSongD:{ko:"노래 영상을 올려 둘이 함께 보는 방",en:"A private room to post and watch your songs together",ja:"歌の動画を投稿して二人で見る部屋",zhs:"上传唱歌视频、两人一起观看的房间",zht:"上傳唱歌影片、兩人一起觀看的房間",es:"Una sala privada para subir y ver vuestras canciones"},
 invN:{ko:"{n}님이 수락하면 방이 만들어지고 {c}가 사용됩니다. 거절하거나 만료되면 사용되지 않습니다.",en:"When {n} accepts, the room is created and {c} is used. Nothing is used if they decline or the invitation expires.",ja:"{n}さんが承諾すると部屋が作られ、{c}が使われます。辞退・期限切れの場合は使われません。",zhs:"{n} 接受后将创建房间并使用 {c}。若拒绝或过期则不会扣除。",zht:"{n} 接受後將建立房間並使用 {c}。若拒絕或過期則不會扣除。",es:"Cuando {n} acepte, se creará la sala y se usarán {c}. Si lo rechaza o la invitación caduca, no se usa nada."},
 invS:{ko:"초대 보내기",en:"Send invitation",ja:"招待を送る",zhs:"发送邀请",zht:"發送邀請",es:"Enviar invitación"},
 invAsk:{ko:"{r} · 수락 시 사용",en:"{r} · charged on acceptance",ja:"{r}・承諾時に使用",zhs:"{r} · 接受时扣除",zht:"{r} · 接受時扣除",es:"{r} · se cobra al aceptar"},
 sent:{ko:"초대를 보냈습니다",en:"Invitation sent",ja:"招待を送りました",zhs:"邀请已发送",zht:"邀請已發送",es:"Invitación enviada"},
 e_day:{ko:"오늘 보낼 수 있는 초대를 모두 사용했습니다 (하루 20번)",en:"You've used all of today's invitations (20 per day)",ja:"本日の招待をすべて使いました(1日20回)",zhs:"今天的邀请次数已用完(每天20次)",zht:"今天的邀請次數已用完(每天20次)",es:"Ya usaste todas las invitaciones de hoy (20 al día)"},
 e_pend:{ko:"대기 중인 초대는 3개까지입니다",en:"You can have up to 3 pending invitations",ja:"保留中の招待は3件までです",zhs:"待回复的邀请最多3个",zht:"待回覆的邀請最多3個",es:"Puedes tener hasta 3 invitaciones pendientes"},
 e_dup:{ko:"이미 초대를 보냈습니다",en:"You've already invited this person",ja:"すでに招待を送っています",zhs:"已经发送过邀请",zht:"已經發送過邀請",es:"Ya enviaste una invitación"},
 e_none:{ko:"상대가 지금 보이지 않습니다",en:"This person is not visible right now",ja:"相手は今表示されていません",zhs:"对方当前不可见",zht:"對方目前不可見",es:"Esta persona no está visible ahora"},
 e_rcv:{ko:"상대가 받은 초대가 많습니다. 잠시 뒤 다시 해 주세요",en:"This person has many invitations. Please try again shortly.",ja:"相手に届いた招待が多いです。しばらくしてからもう一度お試しください",zhs:"对方收到的邀请较多，请稍后再试",zht:"對方收到的邀請較多，請稍後再試",es:"Esta persona tiene muchas invitaciones. Inténtalo en un momento."},
 e_full:{ko:"방이 가득 찼습니다",en:"The room is full",ja:"部屋が満員です",zhs:"房间已满",zht:"房間已滿",es:"La sala está llena"},
 e_gone:{ko:"방이 닫혔거나 끝난 초대입니다",en:"The room has closed or the invitation has ended",ja:"部屋が閉じられたか、終了した招待です",zhs:"房间已关闭或邀请已结束",zht:"房間已關閉或邀請已結束",es:"La sala se cerró o la invitación terminó"},
 e_own:{ko:"방장만 초대할 수 있습니다",en:"Only the host can invite",ja:"ホストのみ招待できます",zhs:"只有房主可以邀请",zht:"只有房主可以邀請",es:"Solo el anfitrión puede invitar"},
 e_already:{ko:"이미 방에 있는 친구입니다",en:"Already in this room",ja:"すでに部屋にいます",zhs:"已在房间中",zht:"已在房間中",es:"Ya está en la sala"},
 e_exp:{ko:"만료된 초대입니다",en:"This invitation has expired",ja:"期限切れの招待です",zhs:"邀请已过期",zht:"邀請已過期",es:"La invitación ha caducado"},
 e_short:{ko:"초대한 친구의 포인트가 모자라 방을 만들지 못했습니다",en:"The room couldn't be created because the inviter doesn't have enough points",ja:"招待した友だちのポイントが足りず、部屋を作れませんでした",zhs:"邀请人积分不足，无法创建房间",zht:"邀請人點數不足，無法建立房間",es:"No se pudo crear la sala porque quien invitó no tiene puntos suficientes"},
 e_room:{ko:"방을 만들지 못했습니다. 잠시 뒤 다시 해 주세요",en:"Couldn't create the room. Please try again shortly.",ja:"部屋を作れませんでした。しばらくしてからもう一度お試しください",zhs:"无法创建房间，请稍后再试",zht:"無法建立房間，請稍後再試",es:"No se pudo crear la sala. Inténtalo en un momento."},
 inT:{ko:"받은 초대",en:"Invitations received",ja:"届いた招待",zhs:"收到的邀请",zht:"收到的邀請",es:"Invitaciones recibidas"},
 inQ:{ko:"{n}님이 같이 노래하자고 초대했어요",en:"{n} invited you to sing together",ja:"{n}さんから一緒に歌おうと招待が届きました",zhs:"{n} 邀请你一起唱歌",zht:"{n} 邀請你一起唱歌",es:"{n} te invitó a cantar juntos"},
 kNS:{ko:"새 우리끼리 노래 방",en:"New Just Us Karaoke room",ja:"新しい仲間だけカラオケ部屋",zhs:"新的小圈子K歌房",zht:"新的小圈子K歌房",es:"Nueva sala Solo nosotros Karaoke"},
 kND:{ko:"새 도란도란 방",en:"New Doran-doran room",ja:"新しいドランドラン",zhs:"新的 Doran-doran 房间",zht:"新的 Doran-doran 房間",es:"Nueva sala Doran-doran"},
 kRS:{ko:"우리끼리 노래 방 「{r}」",en:"Just Us Karaoke room “{r}”",ja:"仲間だけカラオケ部屋「{r}」",zhs:"小圈子K歌房「{r}」",zht:"小圈子K歌房「{r}」",es:"Sala Solo nosotros Karaoke «{r}»"},
 kRD:{ko:"도란도란 「{r}」",en:"Doran-doran “{r}”",ja:"ドランドラン「{r}」",zhs:"Doran-doran「{r}」",zht:"Doran-doran「{r}」",es:"Doran-doran «{r}»"},
 left:{ko:"{m}분 남음",en:"{m} min left",ja:"残り{m}分",zhs:"剩余{m}分钟",zht:"剩餘{m}分鐘",es:"Quedan {m} min"},
 leftH:{ko:"{h}시간 남음",en:"{h} h left",ja:"残り{h}時間",zhs:"剩余{h}小时",zht:"剩餘{h}小時",es:"Quedan {h} h"},
 acc:{ko:"수락",en:"Accept",ja:"承諾",zhs:"接受",zht:"接受",es:"Aceptar"},
 dec:{ko:"거절",en:"Decline",ja:"辞退",zhs:"拒绝",zht:"拒絕",es:"Rechazar"},
 blk:{ko:"차단",en:"Block",ja:"ブロック",zhs:"屏蔽",zht:"封鎖",es:"Bloquear"},
 rep:{ko:"신고",en:"Report",ja:"通報",zhs:"举报",zht:"檢舉",es:"Denunciar"},
 sentT:{ko:"보낸 초대",en:"Invitations sent",ja:"送った招待",zhs:"已发送的邀请",zht:"已發送的邀請",es:"Invitaciones enviadas"},
 nAcc:{ko:"{n}님이 초대를 수락했어요",en:"{n} accepted your invitation",ja:"{n}さんが招待を承諾しました",zhs:"{n} 接受了你的邀请",zht:"{n} 接受了你的邀請",es:"{n} aceptó tu invitación"},
 nGo:{ko:"방으로 가기",en:"Go to the room",ja:"部屋へ行く",zhs:"进入房间",zht:"進入房間",es:"Ir a la sala"},
 nDec:{ko:"{n}님이 다음에 함께하기로 했어요",en:"{n} will join you another time",ja:"{n}さんは次の機会に一緒に歌うことにしました",zhs:"{n} 决定下次再一起唱",zht:"{n} 決定下次再一起唱",es:"{n} se unirá en otra ocasión"},
 nExp:{ko:"{n}님에게 보낸 초대가 만료되었어요",en:"Your invitation to {n} has expired",ja:"{n}さんへの招待は期限切れになりました",zhs:"发给 {n} 的邀请已过期",zht:"發給 {n} 的邀請已過期",es:"Tu invitación a {n} ha caducado"},
 nShort:{ko:"포인트가 모자라 {n}님과의 방을 만들지 못했어요",en:"Not enough points to create the room with {n}",ja:"ポイントが足りず、{n}さんとの部屋を作れませんでした",zhs:"积分不足，无法创建与 {n} 的房间",zht:"點數不足，無法建立與 {n} 的房間",es:"No tenías puntos suficientes para crear la sala con {n}"},
 nRoom:{ko:"{n}님과의 방을 만들지 못해 포인트를 되돌려 드렸어요",en:"The room with {n} couldn't be created, so your points were returned",ja:"{n}さんとの部屋を作れなかったため、ポイントをお戻ししました",zhs:"未能创建与 {n} 的房间，积分已退回",zht:"未能建立與 {n} 的房間，點數已退回",es:"No se pudo crear la sala con {n}; te devolvimos los puntos"},
 nFull:{ko:"방이 가득 차 {n}님이 들어오지 못했어요",en:"The room was full, so {n} couldn't join",ja:"部屋が満員のため、{n}さんは入れませんでした",zhs:"房间已满，{n} 无法加入",zht:"房間已滿，{n} 無法加入",es:"La sala estaba llena y {n} no pudo entrar"},
 nGone:{ko:"방이 닫혀 {n}님이 들어오지 못했어요",en:"The room had closed, so {n} couldn't join",ja:"部屋が閉じられたため、{n}さんは入れませんでした",zhs:"房间已关闭，{n} 无法加入",zht:"房間已關閉，{n} 無法加入",es:"La sala se había cerrado y {n} no pudo entrar"},
 arrive:{ko:"{n}님의 초대가 도착했어요",en:"Invitation from {n}",ja:"{n}さんから招待が届きました",zhs:"收到 {n} 的邀请",zht:"收到 {n} 的邀請",es:"Invitación de {n}"},
 see:{ko:"보기",en:"View",ja:"見る",zhs:"查看",zht:"查看",es:"Ver"},
 bkT:{ko:"차단 목록",en:"Blocked",ja:"ブロック一覧",zhs:"屏蔽列表",zht:"封鎖列表",es:"Bloqueados"},
 bkQ:{ko:"{n}님을 차단할까요? 서로 보이지 않고 초대도 오지 않습니다",en:"Block {n}? You won't see each other or receive invitations from each other.",ja:"{n}さんをブロックしますか？お互いに表示されず、招待も届きません",zhs:"要屏蔽 {n} 吗？彼此将看不到对方，也不会收到邀请",zht:"要封鎖 {n} 嗎？彼此將看不到對方，也不會收到邀請",es:"¿Bloquear a {n}? No os veréis ni recibiréis invitaciones mutuas."},
 bkOk:{ko:"차단했습니다",en:"Blocked",ja:"ブロックしました",zhs:"已屏蔽",zht:"已封鎖",es:"Bloqueado"},
 unbk:{ko:"해제",en:"Unblock",ja:"解除",zhs:"解除",zht:"解除",es:"Desbloquear"},
 bkE:{ko:"차단한 친구가 없습니다",en:"No blocked users",ja:"ブロックした友だちはいません",zhs:"没有屏蔽的用户",zht:"沒有封鎖的使用者",es:"No has bloqueado a nadie"},
 prof:{ko:"프로필",en:"Profile",ja:"プロフィール",zhs:"主页",zht:"主頁",es:"Perfil"},
 wd:{ko:"위치정보 동의 철회",en:"Withdraw location consent",ja:"位置情報の同意撤回",zhs:"撤回位置信息同意",zht:"撤回位置資訊同意",es:"Retirar consentimiento de ubicación"},
 wdQ:{ko:"동의를 철회하면 내 위치가 바로 삭제되고 목록에서 보이지 않습니다. 철회할까요?",en:"If you withdraw consent, your location is deleted at once and you disappear from the list. Withdraw?",ja:"同意を撤回すると位置はすぐ削除され、一覧に表示されなくなります。撤回しますか？",zhs:"撤回同意后，你的位置将立即删除，不再出现在列表中。确定撤回吗？",zht:"撤回同意後，你的位置將立即刪除，不再出現在列表中。確定撤回嗎？",es:"Si retiras el consentimiento, tu ubicación se borra al instante y dejas de aparecer. ¿Retirar?"},
 wdOk:{ko:"동의를 철회했습니다",en:"Consent withdrawn",ja:"同意を撤回しました",zhs:"已撤回同意",zht:"已撤回同意",es:"Consentimiento retirado"},
 ft:{ko:"위치기반서비스사업 신고 제1866호 · 주식회사 부만",en:"Location-based service business report No. 1866 · Booman Inc.",ja:"位置基盤サービス事業申告 第1866号 · Booman Inc.",zhs:"位置服务业务申报 第1866号 · Booman Inc.",zht:"位置服務業務申報 第1866號 · Booman Inc.",es:"Registro de servicio basado en ubicación n.º 1866 · Booman Inc."},
 ctxN:{ko:"지금 이 방으로 부릅니다 · 추가 요금 없음 · 10분 안에 수락하면 바로 들어옵니다",en:"Invite to this room · no extra charge · they join right away if they accept within 10 minutes",ja:"今この部屋に呼びます・追加料金なし・10分以内に承諾するとすぐ入れます",zhs:"邀请到当前房间 · 不另收费 · 10分钟内接受即可直接进入",zht:"邀請到目前房間 · 不另收費 · 10分鐘內接受即可直接進入",es:"Invitar a esta sala · sin coste extra · entran al momento si aceptan en 10 minutos"}
};
function NL(k){ return L(NT[k]); }
var NR={me:null,ib:null,seen:{},tm:0,f:0,pg:null};
function nrPost(path,o){ var q={sess:sess()}; for(var k in o) q[k]=o[k]; return fetch(HUB+"/near/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)}).then(function(r){ return r.json().catch(function(){ return {ok:false,err:"http"}; }); }).catch(function(){ return {ok:false,err:"net"}; }); }
function nrErr(j){ var e=j&&j.err; return NT["e_"+e]?NL("e_"+e):e==="net"?L(TX.upNet):e==="loc"?NL("locX"):e==="nick"?NL("nick"):L(TX.efail); }
function nrKind(x){ return x.mode==="room"?tf(NL(x.type==="dor"?"kRD":"kRS"),{r:x.name||(x.type==="dor"?L(TX.dorB):NL("tSong"))}):NL(x.type==="dor"?"kND":"kNS"); }
function nrLeft(x,now){ var ms=Math.max(0,x.exp-(now||Date.now())); return ms>=3600e3?tf(NL("leftH"),{h:Math.floor(ms/3600e3)}):tf(NL("left"),{m:Math.max(1,Math.ceil(ms/60e3))}); }
function nrPic(x){ return x.aip?'<img class="knrpm" src="'+esc(HUB+"/kst/ai/"+x.aip)+'" alt="">':x.th?kThumb(x.th,"knrpm"):'<span class="knrpe">'+kIc("id")+'</span>'; }
function nrTime(t){ try{ return new Date(t).toLocaleString(kLoc(),{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
// 받은 함 — 노래방을 연 뒤 30초마다 (로그인·동의한 계정만) · 새 초대 = 배지 + 알림창 한 번 · 결과 알림(수락·다음에·만료·실패)
function nrPoll(){ clearInterval(NR.tm); NR.tm=0; if(!sess()) return; var tick=function(){ if(!box()){ clearInterval(NR.tm); NR.tm=0; return; } if(document.hidden) return; nrInbox(); };
  nrPost("me",{}).then(function(j){ if(!(j&&j.ok)) return; NR.me=j; nrBadge(j.inN||0); if(j.adult&&j.consent){ tick(); NR.tm=setInterval(tick,30000); } }); }
function nrBadge(n){ var b=box(), x=b&&b.querySelector(".knrb"); if(!x) return; var d=x.querySelector(".knrbd"); if(n>0){ if(!d){ d=document.createElement("i"); d.className="knrbd"; x.appendChild(d); } d.textContent=n>9?"9+":String(n); } else if(d) d.remove(); }
function nrInbox(){ return nrPost("inbox",{}).then(function(j){ if(!(j&&j.ok)) return null; NR.ib=j; nrBadge(j.inv.length); var b=box();
    (j.notes||[]).forEach(function(n){ nrNote(n); });
    var fresh=j.inv.filter(function(x){ return !NR.seen[x.id]; }); fresh.forEach(function(x){ NR.seen[x.id]=1; });
    if(fresh.length&&b&&!b.classList.contains("krecm")&&!(NR.pg&&NR.pg.isConnected)){ var x=fresh[0]; kMsg(dHost(),tf(NL("arrive"),{n:x.nick||"guest"})+" · "+nrKind(x),[[NL("see"),function(){ nrOpen(); }],[L(TX.ok),null,"kc"]]); }
    if(NR.pg&&NR.pg.isConnected&&NR.pg._draw) NR.pg._draw(); return j; }); }
function nrNote(n){ var h=dHost(); if(!h) return; var nk=n.nick||"guest", r=n.res||{};
  if(n.k==="acc"){ kMsg(h,tf(NL("nAcc"),{n:nk}),[[NL("nGo"),function(){ if(r.kind==="dor"&&r.tok) dorJoin(r.tok); else if(r.rid) kRoom(r.rid); }],[L(TX.ok),null,"kc"]]); return; }
  var t=n.k==="dec"?NL("nDec"):n.k==="exp"?NL("nExp"):n.why==="short"?NL("nShort"):n.why==="full"?NL("nFull"):n.why==="gone"?NL("nGone"):NL("nRoom");
  kMsg(h,tf(t,{n:nk}),[[L(TX.ok),null]]); if(n.k==="fail") try{ kptLoad(); }catch(e){} }
// 본인인증 — 업체 화면(새 창, 앱은 같은 화면) → 돌아오면 다시 확인
function nrIdv(host,after){ nrPost("idv/start",{lang:window.LANG||"ko"}).then(function(j){ if(!(j&&j.ok&&j.url)){ kMsg(host,NL("idvX"),[[L(TX.ok),null]]); return; }
  var w=null; try{ w=window.open(j.url,"_blank"); }catch(e){} if(!w){ location.href=j.url; return; }
  var on=function(e){ if(!e||!e.data||e.data.t!=="knr-idv") return; window.removeEventListener("message",on); if(e.data.ok) soon(NL("idvOk")); if(after) after(); }; window.addEventListener("message",on); }); }
// 위치정보 이용 동의 (처음 켤 때 한 번) — 목적·항목·공개 범위·보유 기간·끄는 방법·신고번호
function nrConsent(host,go){ var w=document.createElement("div"); w.className="kpm knrcs"; host.appendChild(w); var busy=false;
  w.innerHTML='<div><h3>'+esc(NL("csT"))+'</h3><ul class="knrcl">'+NL("csL").split("|").map(function(s){ return '<li>'+esc(s)+'</li>'; }).join("")+'</ul><p class="km">'+esc(NL("csOp"))+'</p>'
    +'<a class="knrtm" href="terms.html?lang='+esc(window.LANG||"ko")+'" target="_blank" rel="noopener">'+esc(NL("csTm"))+'</a><button type="button" class="kgo" data-y="1">'+esc(NL("csOk"))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
  w.querySelector(".kc").onclick=function(){ w.remove(); };
  w.querySelector("[data-y]").onclick=function(){ if(busy) return; busy=true; this.disabled=true; nrPost("consent",{lang:window.LANG||"ko",v:1}).then(function(j){ w.remove(); if(j&&j.ok){ try{ ntap("kara_near","consent"); }catch(e){} go(); } else soon(nrErr(j)); }); }; }
function nrGeo(){ return new Promise(function(res,rej){ var g=navigator.geolocation; if(!g||!g.getCurrentPosition){ rej(); return; }
  g.getCurrentPosition(function(p){ res({la:Math.round(p.coords.latitude*100)/100,lo:Math.round(p.coords.longitude*100)/100}); },function(){ rej(); },{enableHighAccuracy:false,timeout:15000,maximumAge:600000}); }); }   // 대략 위치만 · 약 1km 로 줄여 보냄
// 화면 — ctx 없음 = 첫 화면 「주변 노래 친구」 · ctx {type:"song",room,name} / {type:"dor",tok,name} = 방 안 「근처 친구 찾기」(지금 방으로 부르기)
function nrOpen(ctx){ var b=box(); if(!b) return; if(!sess()){ kMsg(dHost(),L(TX.lgReq),[[L(TX.lgin),function(){ kLogin(function(){ nrOpen(ctx); }); }],[L(TX.cancel),null,"kc"]]); return; }
  var o=pgOpen("knear"); if(!o) return; NR.pg=o; var S={me:null,list:null,busy:false,done:{},err:""};
  var load=function(){ nrPost("me",{}).then(function(j){ if(!o.isConnected) return; if(!(j&&j.ok)){ S.err=nrErr(j); draw(); return; } S.me=j; NR.me=j; draw();
      if(j.adult&&j.consent) nrInbox(); if(j.adult&&j.vis.on) list(); }); };
  var list=function(){ nrPost("list",{}).then(function(j){ if(!o.isConnected) return; S.list=j&&j.ok?j.items:[]; if(j&&j.err==="off"&&S.me) S.me.vis={on:0,exp:0}; draw(); }); };
  var turnOn=function(){ var go=function(){ soon(NL("geoIng")); S.busy=true; draw();
      nrGeo().then(function(p){ return nrPost("on",p); },function(){ return {ok:false,err:"geo"}; }).then(function(j){ S.busy=false; var sk=box()&&box().querySelector(".ksoon"); if(sk) sk.remove();
        if(j&&j.ok){ S.me.vis={on:1,exp:j.exp}; S.me.consent=S.me.consent||{at:Date.now()}; try{ ntap("kara_near","on"); }catch(e){} draw(); list(); return; }
        if(j&&j.err==="geo"){ kMsg(o,NL("geoX"),[[L(TX.ok),null]]); draw(); return; }
        if(j&&j.err==="nick"){ kMsg(o,NL("nick"),[[L(TX.idSet),function(){ stageOpen("me"); }],[L(TX.cancel),null,"kc"]]); draw(); return; }
        draw(); soon(nrErr(j)); }); };
    if(S.me.consent) go(); else nrConsent(o,function(){ S.me.consent={at:Date.now()}; go(); }); };
  var turnOff=function(){ S.busy=true; draw(); nrPost("off",{}).then(function(){ S.busy=false; S.me.vis={on:0,exp:0}; S.list=null; draw(); }); };
  var invite=function(x){ if(ctx){ S.busy=true; draw(); nrPost("inv",{to:x.pubid,type:ctx.type,mode:"room",room:ctx.room||"",tok:ctx.tok||""}).then(function(j){ S.busy=false; if(j&&j.ok){ S.done[x.pubid]=1; soon(NL("sent")); try{ ntap("kara_near","inv_room"); }catch(e){} } else soon(nrErr(j)); draw(); }); return; }
    var w=document.createElement("div"); w.className="kpm knrin"; o.appendChild(w); var ty="song", nm=String((S.me&&S.me.nick||"")+" · "+(x.nick||"")).slice(0,20);
    var cost=function(){ return dCost(ty==="dor"?"dor":"room"); };
    var dr=function(){ w.innerHTML='<div><h3>'+esc(tf(NL("invT"),{n:x.nick||"guest"}))+'</h3><div class="knrty">'
        +'<button type="button" data-t="song"'+(ty==="song"?' class="on"':'')+'>'+kIc("!krm_song")+'<b>'+esc(NL("tSong"))+'</b><small>'+esc(NL("tSongD"))+'</small><em>'+esc(ptS(dCost("room")))+'</em></button>'
        +'<button type="button" data-t="dor"'+(ty==="dor"?' class="on"':'')+'><img class="kic" src="img/kara/dor.png" alt=""><b>'+esc(L(TX.dorB))+'</b><small>'+esc(L(TX.dorS))+'</small><em>'+esc(ptS(dCost("dor")))+'</em></button></div>'
        +'<b class="kh">'+esc(L(TX.rmName))+'</b><input type="text" class="kni knrnm" maxlength="20" value="'+esc(nm)+'"><p class="km">'+esc(tf(NL("invN"),{n:x.nick||"guest",c:ptS(cost())}))+'</p>'
        +'<button type="button" class="kgo" data-go="1">'+esc(NL("invS"))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
      w.querySelector(".kc").onclick=function(){ w.remove(); };
      [].forEach.call(w.querySelectorAll("[data-t]"),function(t){ t.onclick=function(){ nm=w.querySelector(".knrnm").value; ty=t.dataset.t; dr(); }; });
      w.querySelector("[data-go]").onclick=function(){ nm=String(w.querySelector(".knrnm").value||"").trim(); var rid=kRid(); w.remove();
        dPay(cost(),tf(NL("invAsk"),{r:ty==="dor"?L(TX.dorB):NL("tSong")}),function(done){ nrPost("inv",{to:x.pubid,type:ty,mode:"new",rid:rid,name:nm}).then(function(j){
          if(j&&j.ok){ done(); S.done[x.pubid]=1; soon(NL("sent")); try{ ntap("kara_near","inv_"+ty); }catch(e){} nrInbox(); draw(); return; } done(nrErr(j)); }); }); }; };
    dr(); if(!KP.d) kptLoad().then(function(){ if(w.isConnected) dr(); }); };
  var rowMenu=function(x){ var w=document.createElement("div"); w.className="kpm"; o.appendChild(w);
    w.innerHTML='<div><h3>'+esc(x.nick||"guest")+'</h3><div class="kmn"><button type="button" data-k="pf">'+kIc("id")+esc(NL("prof"))+'</button><button type="button" data-k="rp">'+esc(NL("rep"))+'</button><button type="button" class="r" data-k="bk">'+esc(NL("blk"))+'</button></div><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-k]"),function(c){ c.onclick=function(){ var k=c.dataset.k; w.remove(); if(k==="pf") kUser(x.pubid); else if(k==="rp") nrReport(o,x); else nrBlock(o,x,function(){ S.list=(S.list||[]).filter(function(y){ return y.pubid!==x.pubid; }); draw(); }); }; }); };
  var answer=function(x,a){ var run=function(){ S.busy=true; draw(); nrPost("ans",{id:x.id,a:a}).then(function(j){ S.busy=false; if(NR.ib) NR.ib.inv=NR.ib.inv.filter(function(y){ return y.id!==x.id; }); nrBadge(NR.ib?NR.ib.inv.length:0); draw();
      if(!(j&&j.ok)){ soon(nrErr(j)); return; } if(a!=="acc"){ if(a==="blk") soon(NL("bkOk")); return; }
      try{ ntap("kara_near","acc_"+j.kind); }catch(e){} if(j.kind==="dor"&&j.tok) dorJoin(j.tok); else if(j.rid) kRoom(j.rid); }); };
    if(a==="blk") kMsg(o,tf(NL("bkQ"),{n:x.nick||"guest"}),[[NL("blk"),run,"kgo r"],[L(TX.cancel),null,"kc"]]); else run(); };
  var draw=function(){ var m=S.me, body="", now=Date.now();
    if(S.err&&!m) body='<div class="kstge">'+esc(S.err)+'</div>';
    else if(!m) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(!m.adult) body='<div class="knrgate">'+kIc("fol")+'<b>'+esc(NL("adT"))+'</b><p>'+esc(NL("adD"))+'</p><button type="button" class="kgo" data-idv="1">'+esc(NL("idvB"))+'</button></div>';
    else { var on=m.vis&&m.vis.on, ib=NR.ib||{inv:[],sent:[]};
      if(ctx) body+='<div class="knrctx"><b>'+esc(ctx.name||(ctx.type==="dor"?L(TX.dorB):NL("tSong")))+'</b><small>'+esc(NL("ctxN"))+'</small></div>';
      body+='<div class="knrvis"><div><b>'+esc(NL("vis"))+'</b><small>'+esc(on?tf(NL("visOn"),{t:nrTime(m.vis.exp)}):NL("visOff"))+'</small></div>'+(on?'<button type="button" class="knrrn" data-rn="1"'+(S.busy?' disabled':'')+'>'+esc(NL("renew"))+'</button>':'')
        +'<button type="button" class="knrsw'+(on?' on':'')+'" role="switch" aria-checked="'+(on?"true":"false")+'" aria-label="'+esc(NL("vis"))+'" data-sw="1"'+(S.busy?' disabled':'')+'><i></i></button></div>';
      if(!ctx&&ib.inv.length) body+='<b class="kh">'+esc(NL("inT"))+'</b>'+ib.inv.map(function(x,i){ return '<div class="knriv"><div class="knrp">'+nrPic(x)+'</div><div class="knri"><b>'+esc(tf(NL("inQ"),{n:x.nick||"guest"}))+'</b><small>'+esc(nrKind(x))+' · '+esc(nrLeft(x,now))+'</small>'
        +'<div class="knrab"><button type="button" class="kgo" data-a="acc" data-i="'+i+'"'+(S.busy?' disabled':'')+'>'+esc(NL("acc"))+'</button><button type="button" data-a="dec" data-i="'+i+'"'+(S.busy?' disabled':'')+'>'+esc(NL("dec"))+'</button><button type="button" class="r" data-a="blk" data-i="'+i+'"'+(S.busy?' disabled':'')+'>'+esc(NL("blk"))+'</button></div></div></div>'; }).join("");
      if(!ctx&&ib.sent.length) body+='<b class="kh">'+esc(NL("sentT"))+'</b>'+ib.sent.map(function(x,i){ return '<div class="knrsn"><span><b>'+esc(x.nick||"guest")+'</b><small>'+esc(nrKind(x))+' · '+esc(nrLeft(x,now))+'</small></span><button type="button" data-cx="'+i+'">'+esc(L(TX.cancel))+'</button></div>'; }).join("");
      if(on){ body+='<div class="knrf">'+[0].concat(NEARKM).map(function(k){ return '<button type="button" data-f="'+k+'"'+(NR.f===k?' class="on"':'')+'>'+esc(k?tf(NL("km"),{k:k}):NL("all"))+'</button>'; }).join("")+'</div>';
        var it=(S.list||[]).filter(function(x){ return !NR.f||x.d<=NR.f; });
        body+=S.list===null?'<div class="kstge">'+esc(L(TX.lo))+'</div>':!it.length?'<div class="kstge">'+esc(NL("none"))+'</div>'
          :'<div class="knrls">'+it.map(function(x){ var i=S.list.indexOf(x), dn=!!S.done[x.pubid];
            return '<div class="knrw"><button type="button" class="knrp" data-pf="'+i+'" aria-label="'+esc(NL("prof"))+'">'+nrPic(x)+'</button><div class="knri"><b>'+esc(x.nick)+'</b><small>'+(x.song?esc(NL("song"))+' · '+esc(x.song):'&nbsp;')+'</small><span class="knrd">'+esc(tf(NL("km"),{k:x.d}))+'</span></div>'
              +'<button type="button" class="knrg'+(dn?' dn':'')+'" data-inv="'+i+'"'+(dn||S.busy?' disabled':'')+'>'+esc(dn?NL("invd"):ctx?NL("invR"):NL("invB"))+'</button><button type="button" class="knrm" data-mn="'+i+'" aria-label="menu">⋯</button></div>'; }).join("")+'</div>'; }
      else body+='<div class="kstge">'+esc(NL("offL"))+'</div>';
      body+='<div class="knrft">'+(m.consent?'<button type="button" data-wd="1">'+esc(NL("wd"))+'</button>':'')+'<small>'+esc(NL("ft"))+'</small></div>'; }
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<h3>'+esc(ctx?NL("nrFind"):NL("nrB"))+'</h3>'+(m&&m.adult?'<button type="button" class="knrbl" data-bl="1">'+esc(NL("bkT"))+'</button>':''))+'<div class="kpgb">'+(m&&m.adult?'':'<p class="knrs">'+esc(NL("nrS"))+'</p>')+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack;
    var q=function(s,f){ [].forEach.call(o.querySelectorAll(s),f); };
    q("[data-idv]",function(x){ x.onclick=function(){ nrIdv(o,load); }; });
    q("[data-sw]",function(x){ x.onclick=function(){ if(S.busy) return; if(m.vis&&m.vis.on) turnOff(); else turnOn(); }; });
    q("[data-rn]",function(x){ x.onclick=function(){ if(!S.busy) turnOn(); }; });
    q("[data-bl]",function(x){ x.onclick=function(){ nrBlocks(o,function(){ list(); }); }; });
    q("[data-wd]",function(x){ x.onclick=function(){ kMsg(o,NL("wdQ"),[[NL("wd"),function(){ nrPost("withdraw",{}).then(function(j){ if(j&&j.ok){ S.me.consent=null; S.me.vis={on:0,exp:0}; S.list=null; soon(NL("wdOk")); draw(); } else soon(nrErr(j)); }); },"kgo r"],[L(TX.cancel),null,"kc"]]); }; });
    q("[data-f]",function(x){ x.onclick=function(){ NR.f=+x.dataset.f; draw(); }; });
    q("[data-inv]",function(x){ x.onclick=function(){ var y=S.list&&S.list[+x.dataset.inv]; if(y&&!S.busy) invite(y); }; });
    q("[data-pf]",function(x){ x.onclick=function(){ var y=S.list&&S.list[+x.dataset.pf]; if(y) kUser(y.pubid); }; });
    q("[data-mn]",function(x){ x.onclick=function(){ var y=S.list&&S.list[+x.dataset.mn]; if(y) rowMenu(y); }; });
    q("[data-a]",function(x){ x.onclick=function(){ var y=NR.ib&&NR.ib.inv[+x.dataset.i]; if(y&&!S.busy) answer(y,x.dataset.a); }; });
    q("[data-cx]",function(x){ x.onclick=function(){ var y=NR.ib&&NR.ib.sent[+x.dataset.cx]; if(!y) return; nrPost("cancel",{id:y.id}).then(function(){ NR.ib.sent=NR.ib.sent.filter(function(z){ return z.id!==y.id; }); draw(); }); }; }); };
  o._draw=draw; o._bye=function(){ if(NR.pg===o) NR.pg=null; };
  draw(); load(); try{ ntap("kara_near",ctx?"open_"+ctx.type:"open"); }catch(e){} }
var NEARKM=[1,3,10];
function nrBlock(host,x,after){ kMsg(host,tf(NL("bkQ"),{n:x.nick||"guest"}),[[NL("blk"),function(){ nrPost("block",{pubid:x.pubid}).then(function(j){ if(j&&j.ok){ soon(NL("bkOk")); if(after) after(); } else soon(nrErr(j)); }); },"kgo r"],[L(TX.cancel),null,"kc"]]); }
function nrReport(host,x){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w); var why=-1, busy=false, ws=["abuse","sexual","violence","spam","minor","other"];
  var draw=function(msg){ w.innerHTML='<div><h3>'+esc(tf(L(TX.dorRepT),{n:x.nick||"guest"}))+'</h3><div class="kfls">'+ws.map(function(k,i){ return '<button type="button" data-i="'+i+'"'+(i===why?' class="on"':'')+'>'+esc(kTx(TX.dorRepW,i))+'</button>'; }).join("")+'</div>'
      +'<textarea class="kni kdrm" maxlength="300" placeholder="'+esc(L(TX.dorRepM))+'"></textarea>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<button type="button" class="kgo" data-go="1"'+(why<0||busy?' disabled':'')+'>'+esc(L(TX.dorRep))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); };
    [].forEach.call(w.querySelectorAll("[data-i]"),function(b){ b.onclick=function(){ why=+b.dataset.i; var mm=w.querySelector(".kdrm").value; draw(); w.querySelector(".kdrm").value=mm; }; });
    w.querySelector("[data-go]").onclick=function(){ if(busy||why<0) return; busy=true; var memo=w.querySelector(".kdrm").value; nrPost("report",{pubid:x.pubid,why:ws[why],memo:memo,ctx:"near"}).then(function(j){ busy=false; if(j&&j.ok){ w.remove(); soon(L(TX.dorRepOk)); } else draw(nrErr(j)); }); }; };
  draw(""); }
function nrBlocks(host,after){ var w=document.createElement("div"); w.className="kpm"; host.appendChild(w); var items=null, ch=false;
  var draw=function(){ w.innerHTML='<div><h3>'+esc(NL("bkT"))+'</h3>'+(items===null?'<p class="km">'+esc(L(TX.lo))+'</p>':!items.length?'<p class="km">'+esc(NL("bkE"))+'</p>'
      :'<div class="knrbk">'+items.map(function(x,i){ return '<div><b>'+esc(x.nick||"guest")+'</b><button type="button" data-u="'+i+'">'+esc(NL("unbk"))+'</button></div>'; }).join("")+'</div>')+'<button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); if(ch&&after) after(); };
    [].forEach.call(w.querySelectorAll("[data-u]"),function(b){ b.onclick=function(){ var x=items[+b.dataset.u]; nrPost("unblock",{pubid:x.pubid}).then(function(j){ if(j&&j.ok){ ch=true; items=items.filter(function(y){ return y!==x; }); draw(); } }); }; }); };
  draw(); nrPost("blocks",{}).then(function(j){ items=j&&j.ok?j.items:[]; if(w.isConnected) draw(); }); }
(function(){ var s=document.createElement("style"); s.textContent=""
 +"#karBox .ktb{flex-wrap:wrap}#karBox .ktb .knrb{flex:1 0 100%;position:relative;display:flex;align-items:center;justify-content:center;gap:6px;line-height:1.15;border-color:#8fd3ff;color:#8fd3ff;padding:7px 4px}#karBox .ktb .knrb .kic{width:22px;height:22px}"
 +"#karBox .knrbd{position:absolute;top:-6px;right:10px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ff3b6b;color:#fff;font-style:normal;font-size:11px;font-weight:900;line-height:18px;box-sizing:border-box;box-shadow:0 0 0 2px #160f28}"
 +"#karBox .knear .kpgt{display:flex;align-items:center;gap:8px}#karBox .knear .kpgt h3{flex:1;min-width:0}#karBox .kpgt .knrbl{flex:0 0 auto;width:auto;height:auto;min-width:0;border:1px solid rgba(255,255,255,.25);background:none;color:#ddd;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:800;cursor:pointer}"
 +"#karBox .knrgate .kgo,#karBox .knrab .kgo{display:block;width:100%;border:0;border-radius:12px;background:#ffe066;color:#1a1030;font-weight:900;font-size:16px;padding:12px;cursor:pointer}#karBox .knrab .kgo{font-size:13px;padding:7px 4px;border-radius:10px}"
 +"#karBox .knrs{margin:4px 2px 10px;color:#cfc6e8;font-size:13.5px}#karBox .knrgate{text-align:center;padding:22px 14px;border:1px solid rgba(143,211,255,.35);border-radius:16px;background:rgba(143,211,255,.07)}#karBox .knrgate .kic{width:44px;height:44px}#karBox .knrgate b{display:block;font-size:16.5px;margin:6px 0}#karBox .knrgate p{color:#cfc6e8;font-size:13.5px;line-height:1.55;margin:0 0 14px}"
 +"#karBox .knrctx{border:1px solid #ff8be6;background:rgba(255,79,216,.1);border-radius:14px;padding:10px 12px;margin:0 0 10px}#karBox .knrctx b{display:block;font-size:15px}#karBox .knrctx small{color:#ffc2f1;font-size:12.5px}"
 +"#karBox .knrvis{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);border-radius:14px;padding:11px 12px;margin:0 0 12px}#karBox .knrvis>div{flex:1;min-width:0}#karBox .knrvis b{display:block;font-size:15px}#karBox .knrvis small{display:block;color:#cfc6e8;font-size:12.5px;line-height:1.4}"
 +"#karBox .knrrn{flex:0 0 auto;border:1px solid #8fd3ff;background:none;color:#8fd3ff;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:800;cursor:pointer}"
 +"#karBox .knrsw{flex:0 0 auto;width:52px;height:30px;border-radius:999px;border:0;background:rgba(255,255,255,.22);position:relative;cursor:pointer;padding:0;transition:background .2s}#karBox .knrsw i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .2s}#karBox .knrsw.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff)}#karBox .knrsw.on i{left:25px}#karBox .knrsw:disabled{opacity:.55}"
 +"#karBox .knrf{display:flex;gap:6px;margin:4px 0 10px;overflow-x:auto}#karBox .knrf button{flex:0 0 auto;border:1px solid rgba(255,255,255,.22);background:none;color:#ddd;border-radius:999px;padding:5px 11px;font-size:12.5px;font-weight:800;cursor:pointer}#karBox .knrf button.on{background:#8fd3ff;border-color:#8fd3ff;color:#10203a}"
 +"#karBox .knrls{display:flex;flex-direction:column;gap:8px}#karBox .knrw,#karBox .knriv{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);border-radius:14px;padding:9px 10px}#karBox .knriv{align-items:flex-start;margin:0 0 8px;border-color:rgba(255,224,102,.45);background:rgba(255,224,102,.07)}"
 +"#karBox .knrp{flex:0 0 auto;width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,.25);background:#2a1146;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center}#karBox .knrpm{width:100%;height:100%;object-fit:cover;display:block}#karBox .knrpe .kic{width:28px;height:28px}"
 +"#karBox .knri{flex:1;min-width:0}#karBox .knri b{display:block;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .knriv .knri b{white-space:normal}#karBox .knri small{display:block;color:#cfc6e8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .knriv .knri small{white-space:normal}"
 +"#karBox .knrd{display:inline-block;margin-top:3px;font-size:11.5px;font-weight:900;color:#10203a;background:#8fd3ff;border-radius:999px;padding:1px 8px}"
 +"#karBox .knrg{flex:0 0 auto;border:0;background:linear-gradient(90deg,#ff4fd8,#7a5cff);color:#fff;border-radius:999px;padding:8px 11px;font-weight:900;font-size:12.5px;cursor:pointer;white-space:nowrap}#karBox .knrg.dn{background:rgba(255,255,255,.15);color:#ccc}#karBox .knrg:disabled{opacity:.7}"
 +"#karBox .knrm{flex:0 0 auto;border:0;background:none;color:#ccc;font-size:20px;padding:2px 4px;cursor:pointer}"
 +"#karBox .knrab{display:flex;gap:6px;margin-top:8px}#karBox .knrab button{flex:1;border:1px solid rgba(255,255,255,.25);background:none;color:#fff;border-radius:10px;padding:7px 4px;font-weight:900;font-size:13px;cursor:pointer}#karBox .knrab button.kgo{border:0;margin:0}#karBox .knrab button.r{color:#ff9fb5;border-color:rgba(255,120,150,.5)}"
 +"#karBox .knrsn{display:flex;align-items:center;gap:8px;border:1px dashed rgba(255,255,255,.2);border-radius:12px;padding:8px 10px;margin:0 0 6px}#karBox .knrsn span{flex:1;min-width:0}#karBox .knrsn b{display:block;font-size:14px}#karBox .knrsn small{color:#cfc6e8;font-size:12px}#karBox .knrsn button{border:1px solid rgba(255,255,255,.25);background:none;color:#ddd;border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}"
 +"#karBox .knrft{margin:18px 0 6px;text-align:center}#karBox .knrft button{border:0;background:none;color:#ffc2f1;text-decoration:underline;font-size:12.5px;cursor:pointer;display:block;margin:0 auto 6px}#karBox .knrft small{color:#9c93b8;font-size:11.5px}"
 +"#karBox .knrcl{margin:6px 0 8px;padding-left:18px;text-align:left;font-size:13px;line-height:1.55;color:#e6e0f5}#karBox .knrcl li{margin:4px 0}#karBox .knrcs>div{max-height:88vh;overflow-y:auto}#karBox .knrtm{display:block;text-align:center;color:#ffc2f1;font-size:12.5px;margin:2px 0 8px}"
 +"#karBox .knrty{display:flex;flex-direction:column;gap:8px;margin:6px 0 10px}#karBox .knrty button{display:grid;grid-template-columns:34px 1fr auto;grid-template-rows:auto auto;column-gap:8px;align-items:center;text-align:left;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.04);color:#fff;border-radius:14px;padding:9px 10px;cursor:pointer}#karBox .knrty button.on{border-color:#ff8be6;background:rgba(255,79,216,.14)}"
 +"#karBox .knrty .kic{grid-row:1/3;width:32px;height:32px}#karBox .knrty b{font-size:14px}#karBox .knrty small{grid-column:2;color:#cfc6e8;font-size:11.5px;line-height:1.35}#karBox .knrty em{grid-column:3;grid-row:1/3;font-style:normal;font-weight:900;color:#ffe066;font-size:13px}"
 +"#karBox .knrbk{display:flex;flex-direction:column;gap:6px;margin:6px 0 10px}#karBox .knrbk>div{display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:7px 10px}#karBox .knrbk b{flex:1}#karBox .knrbk button{border:1px solid rgba(255,255,255,.3);background:none;color:#ddd;border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer}";
 document.head.appendChild(s); })();
// 방 꾸미기 모양 (10-31) — 상점·보관함(게임 상점식) · 방 배경 · 아래 띠 8칸 · 알림
(function(){ var s=document.createElement("style"); s.textContent=""
 +"#karBox .kpg.kdhasbg{background-size:cover;background-position:center;background-repeat:no-repeat}"
 +"#karBox .kdor .kpgt .kddb,#karBox .krmh .kdcb{flex:0 0 auto;display:flex;align-items:center;gap:3px;border:1px solid #ff8be6;background:rgba(255,79,216,.14);color:#ffc2f1;border-radius:999px;padding:3px 10px 3px 4px;font-weight:900;font-size:12.5px;cursor:pointer}#karBox .kddb img,#karBox .krmh .kdcb img{width:22px;height:22px}"
 +"#karBox .kddeco{flex:0 0 auto;display:grid;grid-template-columns:repeat(8,1fr);gap:3px;padding:2px 8px 0;height:clamp(44px,12vw,64px);box-sizing:border-box}#karBox .kddeco.kdk{padding:0;height:clamp(46px,12vw,64px)}"
 +"#karBox .kdsl{border:1px dashed rgba(255,255,255,.12);background:none;padding:0;min-width:0;height:100%;border-radius:10px;cursor:pointer}#karBox .kdsl.on{border:0;animation:kprIn .45s cubic-bezier(.2,1.4,.4,1)}#karBox .kdsl img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}"
 +"#karBox .kpm.kdeco{z-index:30;padding:0;align-items:stretch;background:rgba(5,3,10,.6)}#karBox .kpm.kdeco>.kdsh{margin:0 auto;width:100%;max-width:560px;height:100%;padding:0;gap:0;border-radius:0;border:0;background:linear-gradient(180deg,#2a1146,#160f28 42%);display:flex;flex-direction:column;position:relative;overflow:hidden}"
 +"#karBox .kdmain{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}"
 +"#karBox .kdhd{display:flex;align-items:center;gap:8px;padding:12px 12px 8px}#karBox .kdhd>b{flex:1;min-width:0;font-size:19px;font-weight:900;color:#ffe066}#karBox .kdbal{border:1px solid #7CFFB2;background:rgba(124,255,178,.1);color:#bfffd9;border-radius:999px;padding:5px 11px;font-weight:900;font-size:13px;cursor:pointer}#karBox .kdx0{border:0;background:rgba(255,255,255,.12);color:#fff;width:34px;height:34px;border-radius:50%;font-size:15px;cursor:pointer}"
 +"#karBox .kdtabs{flex:0 0 auto;display:flex;gap:6px;overflow-x:auto;padding:2px 12px 10px;scrollbar-width:none}#karBox .kdtabs::-webkit-scrollbar{display:none}#karBox .kdtabs button{flex:0 0 auto;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#e9dcff;border-radius:999px;padding:7px 13px;font-weight:800;font-size:13.5px;white-space:nowrap;cursor:pointer}#karBox .kdtabs button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent;color:#fff}"
 +"#karBox .kdbody{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 12px max(16px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px}"
 +"#karBox .kdgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#karBox .kdcd{display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:6px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);border-radius:14px;color:#fff;cursor:pointer;text-align:center;min-width:0}#karBox .kdcd.kdown{border-color:rgba(124,255,178,.55);background:rgba(124,255,178,.06)}"
 +"#karBox .kdim{display:block;aspect-ratio:1;border-radius:10px;background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.16),rgba(255,255,255,.02) 70%);overflow:hidden}#karBox .kdim img{width:100%;height:100%;object-fit:contain;display:block}#karBox .kdcpl .kdim{aspect-ratio:3/4}#karBox .kdcpl .kdim img{object-fit:cover}"
 +"#karBox .kdcd b{font-size:12.5px;font-weight:800;line-height:1.25;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all;overflow-wrap:anywhere}#karBox .kdpr{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;font-size:12px;font-weight:900;color:#ffe066}"
 +"#karBox .kdok{font-style:normal;color:#7CFFB2;font-weight:900}#karBox .kdnow{font-style:normal;color:#1a1300;background:#ffe066;border-radius:999px;padding:0 7px}"
 +"#karBox .kdban{position:relative;display:block;border:0;padding:0;border-radius:16px;overflow:hidden;cursor:pointer;flex:0 0 auto;background:#000}#karBox .kdban img{width:100%;display:block;aspect-ratio:1376/768;object-fit:cover}#karBox .kdban2 img{aspect-ratio:16/5}#karBox .kdban b{position:absolute;left:0;right:0;bottom:0;padding:18px 12px 9px;background:linear-gradient(transparent,rgba(10,4,20,.88));color:#ffe066;font-size:15px;font-weight:900;text-align:left}"
 +"#karBox .kdsts{display:flex;flex-direction:column;gap:8px}#karBox .kdst{display:flex;gap:10px;align-items:center;padding:8px;border:1px solid rgba(255,179,107,.55);background:rgba(255,179,107,.08);border-radius:14px;color:#fff;cursor:pointer;text-align:left}"
 +"#karBox .kdsti{flex:0 0 92px;display:grid;grid-template-columns:1fr 1fr;gap:2px;width:92px;height:92px;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.06)}#karBox .kdsti img{width:100%;height:100%;object-fit:cover;min-width:0;min-height:0}"
 +"#karBox .kdstx{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}#karBox .kdstx>b{font-size:16px;font-weight:900}#karBox .kdstx small{color:#cfc6e8;font-size:12px}#karBox .kdstp{font-size:13px;color:#cfc6e8}#karBox .kdstp s{opacity:.7}#karBox .kdstp b{font-size:17px;color:#ffe066}"
 +"#karBox .kdemp{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}#karBox .kdemp img{width:min(200px,56%);border-radius:16px}#karBox .kdemp p{margin:0;color:#e9dcff;font-size:13.5px;line-height:1.5}"
 +"#karBox .kdit{position:absolute;inset:0;z-index:3;background:rgba(5,3,10,.72);display:flex;align-items:flex-end;justify-content:center}"
 +"#karBox .kdib{width:100%;max-width:520px;max-height:100%;box-sizing:border-box;overflow-y:auto;background:#1d1830;border:1px solid rgba(255,255,255,.18);border-bottom:0;border-radius:20px 20px 0 0;padding:14px 14px max(16px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:9px;animation:kdUp .25s ease-out}@keyframes kdUp{from{transform:translateY(30px);opacity:.4}to{transform:none;opacity:1}}"
 +"#karBox .kdiim{display:flex;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.16),rgba(255,255,255,0) 65%);border-radius:14px}#karBox .kdiim img{width:min(190px,52vw);height:auto;display:block}#karBox .kdiplc img{width:auto;max-width:100%;height:min(42vh,340px);border-radius:12px;object-fit:cover}"
 +"#karBox .kdin{font-size:18px;font-weight:900;text-align:center}#karBox .kdipr{text-align:center;font-size:22px;font-weight:900;color:#ffe066}#karBox .kdipr s{font-size:15px;color:#cfc6e8;opacity:.75;font-weight:700}"
 +"#karBox .kdit .kgo{border:0;border-radius:12px;padding:13px;background:#ffe066;color:#1a1300;font-size:16px;font-weight:900;cursor:pointer}#karBox .kdit .kgo:disabled{opacity:.5}#karBox .kdit .kdgo2{background:linear-gradient(90deg,#ff4fd8,#7a5cff);color:#fff}#karBox .kdit .kc{border:0;background:none;color:#cfc6e8;font-weight:700;cursor:pointer;padding:6px}"
 +"#karBox .kdit .krf{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:9px;font-size:14px;font-weight:800;cursor:pointer}#karBox .kdit .km{margin:0;font-size:12.5px;color:#cfc6e8;line-height:1.5;text-align:center}"
 +"#karBox .kdpv{position:relative;width:min(230px,60vw);aspect-ratio:9/14;margin:0 auto;box-sizing:border-box;border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 55%);background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:10px 8px;border:1px solid rgba(255,255,255,.2)}"
 +"#karBox .kdpvg{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;aspect-ratio:1}#karBox .kdpvg i{background:rgba(29,24,48,.85);border:1px solid rgba(255,255,255,.14);border-radius:6px}#karBox .kdpvs{display:grid;grid-template-columns:repeat(8,1fr);gap:1px;height:30px}#karBox .kdpvs span{min-width:0}#karBox .kdpvs img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}#karBox .kdpvn img{animation:kdPop .8s ease-in-out infinite alternate}@keyframes kdPop{from{transform:scale(1)}to{transform:scale(1.2)}}"
 +"#karBox .kdsli{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#karBox .kdsli span{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;border-radius:10px;background:rgba(255,255,255,.05);min-width:0}#karBox .kdsli img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px}#karBox .kdsli small{font-size:10.5px;line-height:1.2;text-align:center;color:#e9dcff;word-break:keep-all;overflow-wrap:anywhere}#karBox .kdsli em{position:absolute;right:4px;top:4px;font-style:normal;background:#7CFFB2;color:#063;border-radius:50%;width:18px;height:18px;font-size:12px;display:flex;align-items:center;justify-content:center;font-weight:900}#karBox .kdsli .kdhv img{opacity:.55}"
 +"#karBox .kdsm .kdsmi{display:flex;align-items:center;gap:10px}#karBox .kdsmi img{width:64px;height:64px;object-fit:contain}#karBox .kdsmi span{display:flex;flex-direction:column;gap:2px;min-width:0}#karBox .kdsmi small{color:#cfc6e8}"
 +"#karBox .kdtq{position:absolute;left:0;right:0;top:64px;z-index:58;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;padding:0 12px}"
 +"#karBox .kdtst{display:flex;align-items:center;gap:8px;max-width:100%;box-sizing:border-box;background:rgba(29,18,52,.96);border:1.5px solid #ff4fd8;border-radius:16px;padding:7px 14px 7px 7px;color:#fff;font-weight:800;font-size:14px;line-height:1.35;box-shadow:0 6px 20px rgba(0,0,0,.5);animation:kprIn .45s cubic-bezier(.2,1.4,.4,1);transition:opacity .4s,transform .4s}#karBox .kdtst img{width:40px;height:40px;object-fit:contain;flex:0 0 auto}#karBox .kdtst.out{opacity:0;transform:translateY(-10px)}"
 +"#karBox .kdbst{position:absolute;inset:0;z-index:57;pointer-events:none;overflow:hidden}"
 +"@media (prefers-reduced-motion:reduce){#karBox .kdsl.on,#karBox .kdtst,#karBox .kdpvn img,#karBox .kdib{animation:none}}";
 document.head.appendChild(s); })();
// ── 방 꾸미기 (사장님 10-31 「실행하고 배포해」) ─────────────────────────────────────────────
//   도란도란·우리끼리 노래 방 「꾸미기」 → 상점(장소·가구·장식·먹거리·노래방·야외·동물·세트) + 보관함 · 포인트로 구매(「N P 사용 → M P 남음」 → 구매)
//   장소 = 한 번 구매하면 영구 보관 · 방 배경은 방장만 · 소품 = 방 사람 누구나 구매해 놓음 (먹거리·폭죽·야광봉 = 놓으면 사용 / 나머지 = 영구, 치우면 보관함에 그대로) · 방 아래 띠 8칸(영상 칸을 가리지 않음)
//   허브: /shop/kpt/inv (보관함·가격) · /shop/kpt/deco (구매) · /dor/deco (도란도란 놓기·치우기·장소, 모두에게 실시간) · /kst/room op dput·drm·dpl (우리끼리 노래)
Object.assign(TX,{
 dcB:{ko:"꾸미기",en:"Decorate",ja:"デコる",zhs:"装扮",zht:"裝扮",es:"Decorar"},
 dcT:{ko:"방 꾸미기",en:"Room decor",ja:"ルームデコ",zhs:"房间装扮",zht:"房間裝扮",es:"Decorar la sala"},
 dcTabs:{ko:"장소|가구|장식|먹거리|노래방|야외·동물|세트|보관함",en:"Places|Furniture|Decor|Food|Karaoke|Outdoor·Pets|Sets|My items",ja:"場所|家具|インテリア|フード|カラオケ|アウトドア·動物|セット|アイテム箱",zhs:"场景|家具|装饰|美食|K歌|户外·宠物|套装|我的物品",zht:"場景|家具|裝飾|美食|K歌|戶外·寵物|套裝|我的物品",es:"Lugares|Muebles|Decoración|Comida|Karaoke|Aire libre·Mascotas|Packs|Mis artículos"},
 dcFree:{ko:"무료",en:"Free",ja:"無料",zhs:"免费",zht:"免費",es:"Gratis"},
 dcOwn:{ko:"보유",en:"Owned",ja:"所持",zhs:"已拥有",zht:"已擁有",es:"Tuyo"},
 dcCnt:{ko:"{n}개 보유",en:"{n} owned",ja:"{n}個所持",zhs:"拥有 {n} 个",zht:"擁有 {n} 個",es:"Tienes {n}"},
 dcNow:{ko:"사용 중",en:"In use",ja:"使用中",zhs:"使用中",zht:"使用中",es:"En uso"},
 dcPrev:{ko:"놓아 보기",en:"Preview",ja:"置いてみる",zhs:"预览",zht:"預覽",es:"Vista previa"},
 dcPrevX:{ko:"그림 보기",en:"Picture",ja:"画像を見る",zhs:"查看图片",zht:"查看圖片",es:"Ver imagen"},
 dcPut:{ko:"방에 놓기",en:"Place in room",ja:"ルームに置く",zhs:"放进房间",zht:"放進房間",es:"Poner en la sala"},
 dcUse:{ko:"이 장소로 바꾸기",en:"Use this place",ja:"この場所にする",zhs:"换成这个场景",zht:"換成這個場景",es:"Usar este lugar"},
 dcOff:{ko:"기본 배경으로",en:"Back to default",ja:"標準の背景に戻す",zhs:"恢复默认背景",zht:"恢復預設背景",es:"Fondo predeterminado"},
 dcHost:{ko:"장소는 방장만 바꿀 수 있습니다.",en:"Only the host can change the place.",ja:"場所はホストだけが変更できます。",zhs:"只有房主可以更换场景。",zht:"只有房主可以更換場景。",es:"Solo el anfitrión puede cambiar el lugar."},
 dcPlN:{ko:"한 번 구매하면 계속 사용합니다. 방장이 방 배경으로 고릅니다.",en:"Buy once and keep it. The host picks it as the room background.",ja:"一度購入すればずっと使えます。ホストがルームの背景に選びます。",zhs:"购买一次即可一直使用，由房主选作房间背景。",zht:"購買一次即可一直使用，由房主選作房間背景。",es:"Cómpralo una vez y es tuyo. El anfitrión lo elige como fondo."},
 dcKeepN:{ko:"한 번 구매하면 보관함에 계속 남고, 어느 방에든 놓을 수 있습니다.",en:"Buy once: it stays in My items and can go in any room.",ja:"一度購入するとアイテム箱に残り、どのルームにも置けます。",zhs:"购买一次即永久保存在我的物品中，可放进任何房间。",zht:"購買一次即永久保存在我的物品中，可放進任何房間。",es:"Cómpralo una vez: queda en Mis artículos y puedes ponerlo en cualquier sala."},
 dcConsN:{ko:"먹거리·폭죽·야광봉은 방에 놓으면 사용됩니다.",en:"Food, poppers and glow sticks are used up when placed.",ja:"フード・クラッカー・ペンライトはルームに置くと使用済みになります。",zhs:"美食、拉炮、荧光棒放进房间后即用掉。",zht:"美食、拉炮、螢光棒放進房間後即用掉。",es:"La comida, los lanzaconfeti y las barras luminosas se gastan al ponerlos."},
 dcFull:{ko:"자리가 모두 찼습니다. 놓인 소품을 치운 뒤 놓아 주세요.",en:"All spots are taken. Remove an item first.",ja:"置き場所がいっぱいです。置いた小物を片付けてから置いてください。",zhs:"位置已满，请先移除一件物品。",zht:"位置已滿，請先移除一件物品。",es:"No quedan sitios. Quita un artículo primero."},
 dcSame:{ko:"이미 이 방에 놓았습니다.",en:"Already placed in this room.",ja:"すでにこのルームに置いています。",zhs:"已经放在这个房间了。",zht:"已經放在這個房間了。",es:"Ya está en esta sala."},
 dcBusy:{ko:"그 자리에 방금 다른 소품이 놓였습니다. 다시 놓아 주세요.",en:"Someone just used that spot. Please try again.",ja:"その場所にちょうど別の小物が置かれました。もう一度置いてください。",zhs:"该位置刚被占用，请再试一次。",zht:"該位置剛被占用，請再試一次。",es:"Alguien acaba de usar ese sitio. Inténtalo de nuevo."},
 dcNoInv:{ko:"보관함에 없습니다. 먼저 구매해 주세요.",en:"Not in My items. Please buy it first.",ja:"アイテム箱にありません。先に購入してください。",zhs:"我的物品中没有，请先购买。",zht:"我的物品中沒有，請先購買。",es:"No está en Mis artículos. Cómpralo primero."},
 dcPrice:{ko:"가격이 바뀌었습니다. 다시 확인해 주세요.",en:"The price has changed. Please check again.",ja:"価格が変わりました。もう一度ご確認ください。",zhs:"价格已变动，请重新确认。",zht:"價格已變動，請重新確認。",es:"El precio ha cambiado. Revísalo de nuevo."},
 dcRm:{ko:"치우기",en:"Remove",ja:"片付ける",zhs:"移除",zht:"移除",es:"Quitar"},
 dcRmNo:{ko:"직접 놓은 소품만 치울 수 있습니다.",en:"You can only remove items you placed.",ja:"自分で置いた小物だけ片付けられます。",zhs:"只能移除自己放的物品。",zht:"只能移除自己放的物品。",es:"Solo puedes quitar lo que pusiste tú."},
 dcBack:{ko:"{i} 보관함으로 돌아갔습니다.",en:"{i} went back to My items.",ja:"「{i}」がアイテム箱に戻りました。",zhs:"「{i}」已回到我的物品。",zht:"「{i}」已回到我的物品。",es:"{i} volvió a Mis artículos."},
 dcBy:{ko:"{n}님이 놓음",en:"Placed by {n}",ja:"{n}さんが置きました",zhs:"{n} 放置",zht:"{n} 放置",es:"Puesto por {n}"},
 dcEmpty:{ko:"보관함이 비어 있습니다. 상점에서 장소와 소품을 구매해 보세요.",en:"My items is empty. Buy places and items in the shop.",ja:"アイテム箱は空です。ショップで場所や小物を購入してみましょう。",zhs:"我的物品是空的，去商店买场景和物品吧。",zht:"我的物品是空的，去商店買場景和物品吧。",es:"Mis artículos está vacío. Compra lugares y objetos en la tienda."},
 dcSetN:{ko:"구성 {n}개",en:"{n} items",ja:"{n}点セット",zhs:"共 {n} 件",zht:"共 {n} 件",es:"{n} artículos"},
 dcSetOwn:{ko:"이미 보유한 {n}개를 뺀 가격입니다.",en:"Price excludes the {n} you already own.",ja:"すでに所持している{n}点を除いた価格です。",zhs:"已扣除你已拥有的 {n} 件。",zht:"已扣除你已擁有的 {n} 件。",es:"Precio sin los {n} que ya tienes."},
 dcSetAll:{ko:"세트 구성품을 모두 보유하고 있습니다.",en:"You already own everything in this set.",ja:"セットの中身をすべて所持しています。",zhs:"你已拥有该套装的全部物品。",zht:"你已擁有該套裝的全部物品。",es:"Ya tienes todo lo de este pack."},
 dcBan:{ko:"세트로 구매하면 더 저렴합니다",en:"Sets cost less than buying one by one",ja:"セットで買うともっとお得",zhs:"买套装更划算",zht:"買套裝更划算",es:"Los packs salen más baratos"},
 dcBuyOk:{ko:"구매했습니다. 보관함에 넣었습니다.",en:"Purchased! Added to My items.",ja:"購入しました。アイテム箱に入れました。",zhs:"购买成功，已放入我的物品。",zht:"購買成功，已放入我的物品。",es:"¡Comprado! Añadido a Mis artículos."},
 dcPutT:{ko:"{n}님이 {i} 놓았어요 {e}",en:"{n} placed {i} {e}",ja:"{n}さんが{i}を置きました {e}",zhs:"{n} 放了{i} {e}",zht:"{n} 放了{i} {e}",es:"{n} puso {i} {e}"},
 dcTreatT:{ko:"{n}님이 {i} 쐈어요! 다 같이 먹어요 {e}",en:"{n} treated everyone to {i}! {e}",ja:"{n}さんが{i}をおごりました！みんなで食べよう {e}",zhs:"{n} 请大家吃{i}！{e}",zht:"{n} 請大家吃{i}！{e}",es:"¡{n} invita a todos a {i}! {e}"},
 dcPopT:{ko:"{n}님이 폭죽을 터뜨렸어요! 🎉",en:"{n} popped a party popper! 🎉",ja:"{n}さんがクラッカーを鳴らしました！🎉",zhs:"{n} 拉响了派对拉炮！🎉",zht:"{n} 拉響了派對拉炮！🎉",es:"¡{n} lanzó confeti! 🎉"},
 dcGlowT:{ko:"{n}님이 야광봉을 흔들어요! ✨",en:"{n} is waving glow sticks! ✨",ja:"{n}さんがペンライトを振っています！✨",zhs:"{n} 挥起了荧光棒！✨",zht:"{n} 揮起了螢光棒！✨",es:"¡{n} agita barras luminosas! ✨"},
 dcPlT:{ko:"장소가 바뀌었어요 · {i}",en:"The place is now {i}",ja:"場所が「{i}」に変わりました",zhs:"场景换成了「{i}」",zht:"場景換成了「{i}」",es:"El lugar ahora es {i}"},
 dcSet1:{ko:"세트",en:"set",ja:"セット",zhs:"套装",zht:"套裝",es:"(pack)"},
 dcPl0:{ko:"기본 배경으로 바뀌었어요",en:"Back to the default background",ja:"標準の背景に戻りました",zhs:"已恢复默认背景",zht:"已恢復預設背景",es:"Fondo predeterminado"}
});
// 아이템 표 — [키, 분류, 소모품, ko, en, ja, zhs, zht, es, 기본 가격(허브 값이 오면 그것), 이모지]
var DCI=[
 ["pl_living","place",0,"우리 집 거실","Cozy Living Room","うちのリビング","温馨客厅","溫馨客廳","Salón acogedor",3000],
 ["pl_noraebang","place",0,"노래방 룸","Karaoke Room","カラオケルーム","KTV包厢","KTV包廂","Sala de karaoke",0],
 ["pl_pyeongsang","place",0,"동네 평상(여름밤)","Summer Night Pyeongsang","夏の夜の縁台","夏夜乘凉木榻","夏夜乘涼木榻","Tarima de noche de verano",3000],
 ["pl_rooftop","place",0,"옥상 테라스","Rooftop Terrace","屋上テラス","屋顶露台","屋頂露台","Terraza en la azotea",3000],
 ["pl_campfire","place",0,"캠핑장 모닥불","Campfire","キャンプファイヤー","露营篝火","露營營火","Fogata de campamento",3000],
 ["pl_hangang","place",0,"한강 둔치 돗자리","Han River Picnic","漢江ピクニック","汉江野餐","漢江野餐","Pícnic junto al río Han",3000],
 ["pl_classroom","place",0,"학교 교실","Classroom","学校の教室","学校教室","學校教室","Aula escolar",3000],
 ["pl_pocha","place",0,"포장마차","Street Food Tent","屋台","路边大排档","路邊大排檔","Puesto callejero",3000],
 ["pl_beach","place",0,"해수욕장(파라솔)","Beach Parasols","海水浴場","海水浴场","海水浴場","Playa con sombrillas",4000],
 ["pl_valley","place",0,"계곡 평상","Valley Platform","渓谷の縁台","溪谷木榻","溪谷木榻","Tarima junto al arroyo",4000],
 ["pl_grandma","place",0,"시골 할머니 댁 마루","Grandma's Country House","田舎のおばあちゃん家","乡下外婆家","鄉下外婆家","Casa de la abuela en el campo",4000],
 ["pl_dabang","place",0,"70·80 다방","Retro Coffee House","70·80年代の喫茶店","七八十年代茶馆","七八十年代茶館","Cafetería retro",4000],
 ["pl_roller","place",0,"롤라장","Roller Rink","ローラースケート場","旱冰场","溜冰場","Pista de patinaje",4000],
 ["pl_gogo","place",0,"고고장","Go-Go Dance Hall","ゴーゴーダンスホール","复古迪斯科舞厅","復古迪斯可舞廳","Salón de baile a gogó",4000],
 ["pl_tripbus","place",0,"수학여행 버스 안","School Trip Bus","修学旅行のバス","修学旅行大巴","修學旅行巴士","Autobús de excursión escolar",4000],
 ["pl_jejucafe","place",0,"제주 바닷가 카페","Jeju Seaside Cafe","済州の海辺カフェ","济州海边咖啡馆","濟州海邊咖啡館","Café junto al mar en Jeju",6000],
 ["pl_seorak","place",0,"설악산 정상","Seoraksan Summit","雪岳山の頂上","雪岳山山顶","雪嶽山山頂","Cima del Seoraksan",6000],
 ["pl_cruise","place",0,"크루즈 갑판","Cruise Deck","クルーズ船のデッキ","邮轮甲板","郵輪甲板","Cubierta de crucero",6000],
 ["pl_stage","place",0,"콘서트 무대","Concert Stage","コンサートステージ","演唱会舞台","演唱會舞台","Escenario de concierto",6000],
 ["pl_hanok","place",0,"한옥 사랑방","Hanok Sarangbang","韓屋の客間","韩屋厢房","韓屋廂房","Salón de hanok",6000],
 ["pl_snowcabin","place",0,"눈 오는 산장","Snowy Cabin","雪の山小屋","雪中山庄","雪中山莊","Cabaña nevada",6000],
 ["pl_xmas","place",0,"크리스마스 거실","Christmas Living Room","クリスマスのリビング","圣诞客厅","聖誕客廳","Salón navideño",4000],
 ["pl_seollal","place",0,"설날 안방","Seollal Room","お正月の部屋","春节里屋","春節裡屋","Habitación de Año Nuevo coreano",4000],
 ["pl_chuseok","place",0,"추석 마당","Chuseok Courtyard","秋夕の中庭","中秋庭院","中秋庭院","Patio de Chuseok",4000],
 ["pl_cherry","place",0,"벚꽃 공원","Cherry Blossom Park","桜の公園","樱花公园","櫻花公園","Parque de cerezos en flor",4000],
 ["pl_halloween","place",0,"할로윈 파티","Halloween Party","ハロウィンパーティー","万圣节派对","萬聖節派對","Fiesta de Halloween",4000],
 ["pr_sofa","furniture",0,"3인 소파","3-Seat Sofa","3人掛けソファ","三人沙发","三人沙發","Sofá de 3 plazas",2500,"🛋️"],
 ["pr_armchair","furniture",0,"1인 안락의자","Armchair","1人掛けアームチェア","单人扶手椅","單人扶手椅","Sillón",2000,"🪑"],
 ["pr_cushions","furniture",0,"방석","Floor Cushions","座布団","坐垫","坐墊","Cojines de suelo",1500,"🟫"],
 ["pr_pyeongsang","furniture",0,"나무 평상","Wooden Pyeongsang","木の縁台","木榻","木榻","Tarima de madera",2500,"🪵"],
 ["pr_table","furniture",0,"나무 탁자","Wooden Table","木のテーブル","木桌","木桌","Mesa de madera",1800,"🪵"],
 ["pr_beanbag","furniture",0,"빈백","Bean Bag","ビーズクッション","懒人沙发","懶骨頭沙發","Puf",2000,"🫘"],
 ["pr_hammock","furniture",0,"해먹","Hammock","ハンモック","吊床","吊床","Hamaca",2200,"🌴"],
 ["pr_rug","furniture",0,"러그","Rug","ラグ","地毯","地毯","Alfombra",1500,"🧶"],
 ["pr_floorlamp","furniture",0,"장스탠드","Floor Lamp","フロアランプ","落地灯","落地燈","Lámpara de pie",1800,"💡"],
 ["pr_monstera","decor",0,"몬스테라 화분","Monstera Plant","モンステラの鉢","龟背竹盆栽","龜背芋盆栽","Planta monstera",1500,"🪴"],
 ["pr_vase","decor",0,"꽃병","Flower Vase","花瓶","花瓶","花瓶","Florero",1400,"💐"],
 ["pr_stringlights","decor",0,"전구 줄조명","String Lights","ストリングライト","串灯","串燈","Guirnalda de luces",1500,"✨"],
 ["pr_mirrorball","decor",0,"미러볼","Mirror Ball","ミラーボール","迪斯科球","迪斯可球","Bola de espejos",1800,"🪩"],
 ["pr_frame","decor",0,"액자","Picture Frame","額縁","相框","相框","Marco de fotos",1300,"🖼️"],
 ["pr_speaker","decor",0,"스탠드 스피커","Standing Speaker","スタンドスピーカー","落地音箱","落地音響","Altavoz de pie",1600,"🔊"],
 ["pr_stagelight","decor",0,"무대 조명","Stage Light","舞台照明","舞台灯","舞台燈","Foco de escenario",1700,"🔦"],
 ["pr_neon","decor",0,"하트 네온","Heart Neon","ハートのネオン","爱心霓虹灯","愛心霓虹燈","Neón de corazón",1600,"💖"],
 ["pr_candles","decor",0,"캔들 세트","Candle Set","キャンドルセット","蜡烛套装","蠟燭組","Juego de velas",1400,"🕯️"],
 ["pr_chicken","food",1,"치킨과 맥주","Chicken & Beer","チキンとビール","炸鸡和啤酒","炸雞和啤酒","Pollo frito y cerveza",1500,"🍗"],
 ["pr_watermelon","food",1,"수박","Watermelon","スイカ","西瓜","西瓜","Sandía",1300,"🍉"],
 ["pr_ramen","food",1,"라면 냄비","Ramen Pot","ラーメン鍋","一锅拉面","一鍋泡麵","Olla de ramen",1300,"🍜"],
 ["pr_pajeon","food",1,"파전과 막걸리","Pajeon & Makgeolli","チヂミとマッコリ","葱饼配米酒","蔥餅配米酒","Pajeon y makgeolli",1500,"🥞"],
 ["pr_coffee","food",1,"커피 두 잔","Coffee for Two","コーヒー2杯","两杯咖啡","兩杯咖啡","Café para dos",1300,"☕"],
 ["pr_cake","food",1,"생일 케이크","Birthday Cake","バースデーケーキ","生日蛋糕","生日蛋糕","Pastel de cumpleaños",1500,"🎂"],
 ["pr_snacks","food",1,"과자 한 접시","Snack Plate","お菓子ひと皿","一盘零食","一盤零食","Plato de aperitivos",1300,"🍪"],
 ["pr_icecream","food",1,"아이스크림","Ice Cream","アイスクリーム","冰淇淋","冰淇淋","Helado",1300,"🍦"],
 ["pr_fruit","food",1,"과일 바구니","Fruit Basket","フルーツバスケット","水果篮","水果籃","Cesta de frutas",1400,"🍇"],
 ["pr_tambourine","party",0,"탬버린","Tambourine","タンバリン","铃鼓","鈴鼓","Pandereta",1300,"🪘"],
 ["pr_maracas","party",0,"마라카스","Maracas","マラカス","沙锤","沙鈴","Maracas",1300,"🪇"],
 ["pr_glowsticks","party",1,"야광봉","Glow Sticks","ペンライト","荧光棒","螢光棒","Barras luminosas",1300,"✨"],
 ["pr_popper","party",1,"폭죽(파티 크래커)","Party Popper","クラッカー","派对拉炮","派對拉炮","Lanzaconfeti",1300,"🎉"],
 ["pr_micstand","party",0,"마이크 스탠드","Mic Stand","マイクスタンド","麦克风架","麥克風架","Pie de micrófono",1800,"🎤"],
 ["pr_partyhat","party",0,"고깔모자","Party Hat","とんがり帽子","派对帽","派對帽","Gorro de fiesta",1300,"🥳"],
 ["pr_balloons","party",0,"풍선 다발","Balloon Bunch","風船の束","一束气球","一束氣球","Ramo de globos",1500,"🎈"],
 ["pr_trophy","party",0,"트로피","Trophy","トロフィー","奖杯","獎盃","Trofeo",2000,"🏆"],
 ["pr_crown","party",0,"왕관","Crown","王冠","王冠","王冠","Corona",2000,"👑"],
 ["pr_parasol","outdoor",0,"파라솔","Beach Parasol","ビーチパラソル","沙滩遮阳伞","沙灘遮陽傘","Sombrilla de playa",1700,"⛱️"],
 ["pr_swimring","outdoor",0,"튜브","Swim Ring","浮き輪","游泳圈","游泳圈","Flotador",1500,"🛟"],
 ["pr_sandcastle","outdoor",0,"모래성","Sandcastle","砂のお城","沙堡","沙堡","Castillo de arena",1500,"🏰"],
 ["pr_campchair","outdoor",0,"캠핑 의자","Camping Chair","キャンプチェア","露营椅","露營椅","Silla de camping",1700,"🏕️"],
 ["pr_tent","outdoor",0,"텐트","Tent","テント","帐篷","帳篷","Tienda de campaña",2000,"⛺"],
 ["pr_bbq","outdoor",0,"바비큐 그릴","BBQ Grill","バーベキューグリル","烧烤架","烤肉架","Parrilla de barbacoa",2000,"🍖"],
 ["pr_puppy","pet",0,"강아지","Puppy","子犬","小狗","小狗","Cachorro",3000,"🐶"],
 ["pr_cat","pet",0,"고양이","Cat","猫","猫咪","貓咪","Gato",3000,"🐱"],
 ["pr_parrot","pet",0,"앵무새","Parrot","インコ","鹦鹉","鸚鵡","Loro",2500,"🦜"]];
var DCS=[   // 세트 — [키, 기본 가격, 이름 6개, 구성] (허브 DECO_S 와 같은 구성)
 ["set_home",10000,["신혼집 거실","Newlywed Living Room","新婚の家のリビング","新婚小家客厅","新婚小家客廳","Salón de recién casados"],["pl_living","pr_sofa","pr_rug","pr_monstera","pr_floorlamp","pr_vase","pr_coffee"]],
 ["set_summer",8000,["여름밤 평상","Summer Night Pyeongsang","夏の夜の縁台","夏夜乘凉","夏夜乘涼","Noche de verano en la tarima"],["pl_pyeongsang","pr_pyeongsang","pr_cushions","pr_watermelon","pr_pajeon","pr_icecream"]],
 ["set_beach",9000,["해수욕장","Beach Day","海水浴","海边度假","海邊度假","Día de playa"],["pl_beach","pr_parasol","pr_swimring","pr_sandcastle","pr_campchair","pr_fruit"]],
 ["set_party",9000,["노래방 파티","Karaoke Party","カラオケパーティー","KTV派对","KTV派對","Fiesta de karaoke"],["pr_mirrorball","pr_stagelight","pr_speaker","pr_micstand","pr_tambourine","pr_maracas","pr_glowsticks","pr_chicken"]],
 ["set_xmas",9000,["크리스마스","Christmas","クリスマス","圣诞节","聖誕節","Navidad"],["pl_xmas","pr_stringlights","pr_candles","pr_balloons","pr_partyhat","pr_cake","pr_popper"]]];
var DK={}, DKS={}, DLG=["ko","en","ja","zhs","zht","es"], DTAB=[["place"],["furniture"],["decor"],["food"],["party"],["outdoor","pet"],"set","inv"], DSLOT=[0,7,1,6,2,5,3,4];   // 자리 채우는 차례 = 양 끝부터
DCI.forEach(function(x){ var n={}; DLG.forEach(function(l,i){ n[l]=x[3+i]; }); DK[x[0]]={k:x[0],c:x[1],cons:x[2],n:n,p:x[9],e:x[10]||""}; });
DCS.forEach(function(x){ var n={}; DLG.forEach(function(l,i){ n[l]=x[2][i]; }); DKS[x[0]]={k:x[0],p:x[1],n:n,it:x[3]}; });
var DC={inv:null,p:{},s:{},sc:{},ld:null};
function dcN(k){ var x=DK[k]||DKS[k]; return x?L(x.n):k; }
function dcHN(k){ return DKS[k]?L(DKS[k].n)+" "+L(TX.dcSet1):dcN(k); }   // 사용 내역·결제 확인 — 세트는 「○○ 세트」
function dcIsPl(k){ return String(k).indexOf("pl_")===0; }
function dcImg(k,th){ return dcIsPl(k)?"img/deco/"+(th?"t/":"")+k+".jpg":"img/deco/"+k+".webp"; }
function dcP(k){ return DC.p[k]!=null?+DC.p[k]:DK[k]?DK[k].p:0; }
function dcSP(k){ var c=DC.sc[k]; return c?c.cost:DC.s[k]!=null?+DC.s[k]:DKS[k].p; }
function dcSum(k){ return DKS[k].it.reduce(function(a,x){ return a+dcP(x); },0); }
function dcHas(k){ return k==="pl_noraebang"||!!(DC.inv&&DC.inv.own&&DC.inv.own[k]); }
function dcCnt(k){ return DC.inv&&DC.inv.cnt&&DC.inv.cnt[k]||0; }
function dcJo(w,a,b){ var s=String(w).replace(/\s*\([^)]*\)\s*$/,""), c=s.charCodeAt(s.length-1); return s+(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28?a:b); }   // 받침 → 을/이 · 없으면 를/가
function dcLoad(){ if(!sess()) return Promise.resolve(null); if(DC.ld) return DC.ld; DC.ld=kptPost("inv",{}).then(function(j){ DC.ld=null; if(j&&j.ok){ DC.inv=j.inv; DC.p=j.p||{}; DC.s=j.s||{}; DC.sc=j.sc||{}; } return j; }).catch(function(){ DC.ld=null; return null; }); return DC.ld; }
// 방 배경 — 어둡게 덮어 영상 칸·글자가 잘 보이게
function dcBg(el,pl){ if(!el) return; el.classList.toggle("kdhasbg",!!pl); el.style.backgroundImage=pl&&DK[pl]?"linear-gradient(180deg,rgba(10,6,22,.66),rgba(10,6,22,.78) 55%,rgba(8,5,18,.88)),url("+dcImg(pl)+")":""; }
// 아래 띠 8칸 — 놓인 소품 · 빈칸은 희미하게(누르면 상점)
function dcStrip(el,ctx){ if(!el) return; var d=ctx.deco(), by={}; (d.pr||[]).forEach(function(x){ by[x.s]=x; }); var h="";
  for(var i=0;i<8;i++){ var x=by[i]; h+=x?'<button type="button" class="kdsl on'+(x.c?' kdcs':'')+'" data-s="'+i+'" title="'+esc(dcN(x.k))+'"><img src="'+dcImg(x.k)+'" alt="'+esc(dcN(x.k))+'"></button>':'<button type="button" class="kdsl" data-s="'+i+'" aria-label="'+esc(L(TX.dcT))+'"></button>'; }
  el.innerHTML=h; [].forEach.call(el.querySelectorAll(".kdsl"),function(b){ b.onclick=function(){ var s=+b.dataset.s; if(by[s]) dcSlot(ctx,by[s]); else dcOpen(ctx,0); }; }); }
// 즐거운 알림 (모두에게) — 그림 + 글 · 폭죽·야광봉은 반짝이
function dcToast(msg,k,burst){ var b=box(); if(!b||!msg) return; var q=b.querySelector(".kdtq"); if(!q){ q=document.createElement("div"); q.className="kdtq"; b.appendChild(q); }
  var t=document.createElement("div"); t.className="kdtst"; t.innerHTML=(k&&DK[k]?'<img src="'+dcImg(k,1)+'" alt="">':'')+'<span>'+esc(msg)+'</span>'; q.appendChild(t); while(q.children.length>3) q.firstChild.remove();
  if(burst){ var f=document.createElement("div"); f.className="kdbst"; for(var i=1;i<=8;i++) f.innerHTML+='<i class="kcf c'+i+'"></i>'; b.appendChild(f); setTimeout(function(){ f.remove(); },3300); }
  setTimeout(function(){ t.classList.add("out"); setTimeout(function(){ t.remove(); },400); },3600); }
function dcNk(n){ n=String(n||"guest"); return window.LANG==="ko"&&n.length>1&&/님$/.test(n)?n.slice(0,-1):n; }   // 「○○님님」 막기
function dcEvTx(a,k,n){ n=dcNk(n);
  if(a==="pl") return k?tf(L(TX.dcPlT),{i:dcN(k)}):L(TX.dcPl0);
  if(k==="pr_popper") return tf(L(TX.dcPopT),{n:n}); if(k==="pr_glowsticks") return tf(L(TX.dcGlowT),{n:n});
  var x=DK[k]||{}, food=x.c==="food", nm=dcN(k), i=window.LANG==="ko"?dcJo(nm,"을","를"):nm;
  return tf(L(food?TX.dcTreatT:TX.dcPutT),{n:n,i:i,e:x.e||""}); }
function dcBackTx(k){ var nm=dcN(k); return tf(L(TX.dcBack),{i:window.LANG==="ko"?dcJo(nm,"이","가"):nm}); }
function dcEv(a,k,n){ dcToast(dcEvTx(a,k,n),a==="pl"?"":k,k==="pr_popper"||k==="pr_glowsticks"); }
// 빈자리 (양 끝부터)
function dcFreeS(d){ var u={}; (d.pr||[]).forEach(function(x){ u[x.s]=1; }); for(var i=0;i<DSLOT.length;i++) if(!u[DSLOT[i]]) return DSLOT[i]; return -1; }
function dcErr(j,f){ var e=j&&j.err; return L(e==="slot"?TX.dcBusy:e==="same"?TX.dcSame:e==="noinv"?TX.dcNoInv:e==="own"?(f==="rm"?TX.dcRmNo:TX.dcHost):e==="price"?TX.dcPrice:TX.efail); }
// 놓인 소품 누름 — 이름·놓은 사람 · 치우기(방장 = 아무것 · 놓은 사람 = 자기 것)
function dcSlot(ctx,x){ var h=ctx.host(); if(!h) return; var w=document.createElement("div"); w.className="kpm kdsm"; h.appendChild(w); var can=ctx.own()||x.me;
  w.innerHTML='<div><div class="kdsmi"><img src="'+dcImg(x.k)+'" alt=""><span><b>'+esc(dcN(x.k))+'</b><small>'+esc(tf(L(TX.dcBy),{n:dcNk(x.n)}))+'</small></span></div>'+(can?'<button type="button" class="krf" data-rm="1">'+esc(L(TX.dcRm))+'</button>':'')+'<button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
  w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
  var r=w.querySelector("[data-rm]"); if(r) r.onclick=function(){ r.disabled=true; ctx.rm(x.s,function(j){ w.remove(); if(!(j&&j.ok)){ soon(dcErr(j,"rm")); return; } if(j.back&&x.me) dcToast(dcBackTx(x.k),x.k); dcLoad(); }); }; }
// 상점 + 보관함
function dcOpen(ctx,tab){ if(!sess()){ kLogin(function(){ dcOpen(ctx,tab); }); return; } var h=ctx.host(); if(!h) return; var old=h.querySelector(".kdeco"); if(old) old.remove();
  var o=document.createElement("div"); o.className="kpm kdeco"; h.appendChild(o); var t=tab||0, ld=!DC.inv;
  var card=function(k){ var pl=dcIsPl(k), x=DK[k], own=!x.cons&&dcHas(k), cn=x.cons?dcCnt(k):0, d=ctx.deco(), now=pl&&d.pl===k, p=dcP(k);
    var lab=now?'<em class="kdnow">'+esc(L(TX.dcNow))+'</em>':own?'<em class="kdok">✓ '+esc(L(TX.dcOwn))+'</em>':pl&&!p?'<em class="kdok">'+esc(L(TX.dcFree))+'</em>':'<span>'+ptS(p)+'</span>'+(cn?'<em class="kdok">'+esc(tf(L(TX.dcCnt),{n:cn}))+'</em>':'');
    return '<button type="button" class="kdcd'+(pl?' kdcpl':'')+(own||cn?' kdown':'')+'" data-k="'+k+'"><span class="kdim"><img src="'+dcImg(k,1)+'" alt="" loading="lazy"></span><b>'+esc(dcN(k))+'</b><small class="kdpr">'+lab+'</small></button>'; };
  var setCard=function(k){ var s=DKS[k], c=DC.sc[k], cost=dcSP(k), sum=c&&c.sum||dcSum(k);
    return '<button type="button" class="kdst" data-set="'+k+'"><span class="kdsti">'+s.it.slice(0,4).map(function(x){ return '<img src="'+dcImg(x,1)+'" alt="" loading="lazy">'; }).join("")+'</span><span class="kdstx"><b>'+esc(L(s.n))+'</b><small>'+esc(tf(L(TX.dcSetN),{n:s.it.length}))+'</small>'
      +'<span class="kdstp">'+(cost>0?'<s>'+ptS(sum)+'</s> <b>'+ptS(cost)+'</b>':'<em class="kdok">✓ '+esc(L(TX.dcOwn))+'</em>')+'</span></span></button>'; };
  var draw=function(){ var tb=DTAB[t], body="", bal=KP.d?KP.d.bal.total:0;
    if(ld) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(tb==="set") body='<button type="button" class="kdban" data-ban="1"><img src="img/deco/ui_banner.jpg" alt=""><b>'+esc(L(TX.dcBan))+'</b></button><div class="kdsts">'+DCS.map(function(s){ return setCard(s[0]); }).join("")+'</div>';
    else if(tb==="inv"){ var ks=DCI.filter(function(x){ return x[2]?dcCnt(x[0])>0:dcHas(x[0]); }).map(function(x){ return x[0]; }), mine=ks.filter(function(k){ return k!=="pl_noraebang"; });
      body=(mine.length?'':'<div class="kdemp"><img src="img/deco/ui_empty.jpg" alt=""><p>'+esc(L(TX.dcEmpty))+'</p></div>')+'<div class="kdgrid">'+ks.map(card).join("")+'</div>'; }
    else { body=(t===0?'<button type="button" class="kdban kdban2" data-ban="1"><img src="img/deco/ui_banner.jpg" alt=""><b>'+esc(L(TX.dcBan))+' ›</b></button>':'')+'<div class="kdgrid">'+DCI.filter(function(x){ return tb.indexOf(x[1])>=0; }).map(function(x){ return card(x[0]); }).join("")+'</div>'; }
    var sc=o.querySelector(".kdbody"), top=sc&&o._t===t?sc.scrollTop:0; o._t=t; if(!o.firstChild) o.innerHTML='<div class="kdsh"><div class="kdmain"></div></div>';
    o.querySelector(".kdmain").innerHTML='<div class="kdhd"><b>'+esc(L(TX.dcT))+'</b><button type="button" class="kdbal" data-w="1">'+ptS(bal)+'</button><button type="button" class="kdx0" aria-label="'+esc(L(TX.back))+'">✕</button></div>'
      +'<div class="kdtabs">'+DTAB.map(function(_,i){ return '<button type="button" data-t="'+i+'"'+(i===t?' class="on"':'')+'>'+esc(kTx(TX.dcTabs,i))+'</button>'; }).join("")+'</div><div class="kdbody">'+body+'</div>';
    sc=o.querySelector(".kdbody"); if(sc&&top) sc.scrollTop=top; var on=o.querySelector(".kdtabs .on"), tr=o.querySelector(".kdtabs"); if(on&&tr) tr.scrollLeft=Math.max(0,on.offsetLeft-tr.clientWidth/2+on.offsetWidth/2);
    o.querySelector(".kdx0").onclick=function(){ o.remove(); }; o.querySelector("[data-w]").onclick=function(){ kwOpen(""); };
    var mn=o.querySelector(".kdmain"); [].forEach.call(mn.querySelectorAll("[data-t]"),function(b){ b.onclick=function(){ t=+b.dataset.t; draw(); }; });
    [].forEach.call(mn.querySelectorAll("[data-ban]"),function(b){ b.onclick=function(){ t=6; draw(); }; });
    [].forEach.call(mn.querySelectorAll("[data-k]"),function(b){ b.onclick=function(){ dcItem(ctx,b.dataset.k,o,draw); }; });
    [].forEach.call(mn.querySelectorAll("[data-set]"),function(b){ b.onclick=function(){ dcSet(ctx,b.dataset.set,o,draw,function(){ t=7; draw(); }); }; }); };
  o._draw=draw; draw(); var go=function(){ ld=false; if(o.isConnected) draw(); };
  Promise.all([dcLoad(),KP.d?null:kptLoad()]).then(go,go); try{ ntap("kara_deco","open_"+ctx.kind); }catch(e){} }
// 미리 보기 — 작은 방(배경 + 3×3 칸 + 아래 띠)
function dcPv(ctx,k){ var d=ctx.deco(), pl=dcIsPl(k)?k:d.pl, pr=(d.pr||[]).slice(), s=dcFreeS(d), tiles="";
  if(!dcIsPl(k)) pr.push({s:s<0?0:s,k:k,n:""});
  for(var i=0;i<9;i++) tiles+='<i></i>'; var by={}; pr.forEach(function(x){ by[x.s]=x; }); var st="";
  for(var j=0;j<8;j++) st+=by[j]?'<span'+(by[j].k===k?' class="kdpvn"':'')+'><img src="'+dcImg(by[j].k)+'" alt=""></span>':'<span></span>';
  return '<div class="kdpv'+(pl?' kdhasbg':'')+'"'+(pl?' style="background-image:linear-gradient(180deg,rgba(10,6,22,.5),rgba(10,6,22,.7)),url('+dcImg(pl)+')"':'')+'><div class="kdpvg">'+tiles+'</div><div class="kdpvs">'+st+'</div></div>'; }
// 아이템 한 개 — 그림 · 이름 · 가격 · 구매 / 방에 놓기 / 이 장소로 바꾸기 · 놓아 보기
function dcItem(ctx,k,o,redraw){ var x=DK[k]; if(!x) return; var w=document.createElement("div"); w.className="kdit"; (o.querySelector(".kdsh")||o).appendChild(w); var pv=false, busy=false, msg="";
  var draw=function(){ var pl=dcIsPl(k), p=dcP(k), own=!x.cons&&dcHas(k), cn=x.cons?dcCnt(k):0, d=ctx.deco(), now=pl&&d.pl===k, placed=!pl&&!x.cons&&(d.pr||[]).some(function(y){ return y.k===k&&y.me; }), buy=!own&&p>0, bt="";
    if(buy) bt+='<div class="kdipr">'+ptS(p)+'</div><button type="button" class="kgo" data-buy="1"'+(busy?' disabled':'')+'>'+esc(L(TX.kwBuyB))+'</button>';
    if(pl&&(own||!p)){ if(ctx.own()) bt+='<button type="button" class="kgo kdgo2" data-pl="1"'+(busy?' disabled':'')+'>'+esc(L(now?TX.dcOff:TX.dcUse))+'</button>'; else bt+='<p class="km">'+esc(L(TX.dcHost))+'</p>'; }
    if(!pl&&(own||cn>0)){ if(placed) bt+='<p class="km">'+esc(L(TX.dcSame))+'</p>'; else bt+='<button type="button" class="kgo kdgo2" data-put="1"'+(busy?' disabled':'')+'>'+esc(L(TX.dcPut))+(cn?' · '+esc(tf(L(TX.dcCnt),{n:cn})):'')+'</button>'; }
    w.innerHTML='<div class="kdib">'+(pv?dcPv(ctx,k):'<div class="kdiim'+(pl?' kdiplc':'')+'"><img src="'+dcImg(k)+'" alt=""></div>')
      +'<b class="kdin">'+esc(dcN(k))+(own?' <em class="kdok">✓ '+esc(L(TX.dcOwn))+'</em>':'')+'</b><p class="km">'+esc(L(pl?TX.dcPlN:x.cons?TX.dcConsN:TX.dcKeepN))+'</p>'
      +'<button type="button" class="krf kdpvb" data-pv="1">'+esc(L(pv?TX.dcPrevX:TX.dcPrev))+'</button>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+bt+'<button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    w.querySelector("[data-pv]").onclick=function(){ pv=!pv; draw(); };
    var bb=w.querySelector("[data-buy]"); if(bb) bb.onclick=function(){ var rid=kRid(); dcPay(p,dcN(k),function(done){ kptPost("deco",{rid:rid,key:k,cost:p}).then(function(j){
        if(j&&j.ok){ done(); DC.inv=j.inv||DC.inv; dcLoad().then(function(){ if(w.isConnected) draw(); redraw(); }); kptLoad(); soon(L(TX.dcBuyOk)); try{ ntap("kara_deco","buy_"+k); }catch(e){} return; }
        if(j&&j.err==="price"){ dcLoad().then(function(){ if(w.isConnected) draw(); redraw(); }); }
        done(j&&j.err==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):dcErr(j)); kptLoad(); }).catch(function(){ done(L(TX.efail)); }); }); };
    var pb=w.querySelector("[data-pl]"); if(pb) pb.onclick=function(){ if(busy) return; busy=true; msg=""; draw(); ctx.pl(now?"":k,function(j){ busy=false; if(j&&j.ok){ w.remove(); o.remove(); return; } msg=dcErr(j,"pl"); draw(); }); };
    var ub=w.querySelector("[data-put]"); if(ub) ub.onclick=function(){ if(busy) return; var s=dcFreeS(ctx.deco()); if(s<0){ msg=L(TX.dcFull); draw(); return; } busy=true; msg=""; draw();
      ctx.put(k,s,function(j){ busy=false; if(j&&j.ok){ dcLoad(); w.remove(); o.remove(); try{ ntap("kara_deco","put_"+k); }catch(e){} return; } if(j&&j.err==="noinv") dcLoad().then(function(){ redraw(); }); msg=dcErr(j,"put"); if(w.isConnected) draw(); }); }; };
  draw(); }
function dcPay(cost,title,run){ var go=function(){ kptAsk(cost,title,run,"",L(TX.kwBuyB)); }; if(KP.d) go(); else kptLoad().then(function(){ if(KP.d) go(); else soon(L(TX.efail)); }); }
// 세트 — 구성 · 낱개 합(취소선) · 세트 가격(이미 가진 것은 빼고) · 구매
function dcSet(ctx,sk,o,redraw,toInv){ var s=DKS[sk]; if(!s) return; var w=document.createElement("div"); w.className="kdit"; (o.querySelector(".kdsh")||o).appendChild(w);
  var draw=function(){ var c=DC.sc[sk]||{}, cost=dcSP(sk), sum=c.sum||dcSum(sk);
    w.innerHTML='<div class="kdib"><b class="kdin">'+esc(L(s.n))+'</b><div class="kdsli">'+s.it.map(function(k){ var hv=!DK[k].cons&&dcHas(k); return '<span'+(hv?' class="kdhv"':'')+'><img src="'+dcImg(k,1)+'" alt=""><small>'+esc(dcN(k))+'</small>'+(hv?'<em>✓</em>':'')+'</span>'; }).join("")+'</div>'
      +(cost>0?(c.owned?'<p class="km">'+esc(tf(L(TX.dcSetOwn),{n:c.owned}))+'</p>':'')+'<div class="kdipr"><s>'+ptS(sum)+'</s> '+ptS(cost)+'</div><button type="button" class="kgo" data-buy="1">'+esc(L(TX.kwBuyB))+'</button>':'<p class="km">'+esc(L(TX.dcSetAll))+'</p>')
      +'<p class="km">'+esc(L(TX.dcKeepN))+' '+esc(L(TX.dcConsN))+'</p><button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
    w.querySelector(".kc").onclick=function(){ w.remove(); }; w.onclick=function(e){ if(e.target===w) w.remove(); };
    var bb=w.querySelector("[data-buy]"); if(bb) bb.onclick=function(){ var rid=kRid(); dcPay(cost,dcHN(sk),function(done){ kptPost("deco",{rid:rid,set:sk,cost:cost}).then(function(j){
        if(j&&j.ok){ done(); dcLoad().then(function(){ w.remove(); if(toInv) toInv(); else redraw(); }); kptLoad(); soon(L(TX.dcBuyOk)); try{ ntap("kara_deco","buy_"+sk); }catch(e){} return; }
        if(j&&(j.err==="price"||j.err==="owned")) dcLoad().then(function(){ if(w.isConnected) draw(); redraw(); });
        done(j&&j.err==="short"?tf(L(TX.kwShort),{h:ptS(j.have||0)}):dcErr(j)); kptLoad(); }).catch(function(){ done(L(TX.efail)); }); }); }; };
  draw(); }
// 방마다 연결 — 도란도란(실시간 소식) · 우리끼리 노래(방 칸)
function dcDorCtx(){ return {kind:"dor",host:function(){ return DR.o; },own:function(){ return !!DR.own; },
  deco:function(){ var d=DR.st&&DR.st.room.deco||{pl:"",pr:[]}; return {pl:d.pl||"",pr:(d.pr||[]).map(function(x){ return {s:x.s,k:x.k,n:x.n,c:x.c,me:x.m===DR.me?1:0}; })}; },
  put:function(k,s,cb){ dPost("deco",{tok:DR.tok,op:"put",key:k,slot:s,rid:kRid()}).then(cb); },
  rm:function(s,cb){ dPost("deco",{tok:DR.tok,op:"rm",slot:s}).then(cb); },
  pl:function(k,cb){ dPost("deco",{tok:DR.tok,op:"pl",key:k}).then(cb); }}; }
function dcDorPaint(){ var o=DR.o; if(!o||!o.isConnected) return; var c=dcDorCtx(); dcBg(o,c.deco().pl); dcStrip(o.querySelector(".kddeco"),c); }
function dcDorMsg(m){ if(m.a==="rm"){ if(m.back&&m.om===DR.me&&m.m!==DR.me){ dcToast(dcBackTx(m.k),m.k); dcLoad(); } return; } dcEv(m.a,m.k,m.n); }
function dcKstCtx(R,rid){ var set=function(j){ if(j&&j.ok&&j.deco&&R.info){ R.info.deco=j.deco; dcSeen(rid,j.deco); R.draw(); } };
  return {kind:"kst",host:function(){ return R.o; },own:function(){ return !!(R.info&&R.info.owner); },deco:function(){ return R.info&&R.info.deco||{pl:"",pr:[],ev:[]}; },
  put:function(k,s,cb){ kPost("/kst/room",{op:"dput",rid:rid,key:k,slot:s,rq:kRid()}).then(function(j){ set(j); if(j&&j.ok){ var e=(j.deco.ev||[]).slice(-1)[0]; dcEv("put",k,e&&e.n); } cb(j); }).catch(function(){ cb(null); }); },
  rm:function(s,cb){ kPost("/kst/room",{op:"drm",rid:rid,slot:s}).then(function(j){ set(j); cb(j); }).catch(function(){ cb(null); }); },
  pl:function(k,cb){ kPost("/kst/room",{op:"dpl",rid:rid,key:k}).then(function(j){ set(j); if(j&&j.ok) dcEv("pl",k,""); cb(j); }).catch(function(){ cb(null); }); }}; }
function dcSeen(rid,d){ var ev=d&&d.ev||[], t=ev.length?ev[ev.length-1].at:0; try{ if(t) localStorage.setItem("kdeco_ev_"+rid,String(t)); }catch(e){} }
function dcKstNews(rid,d){ var ev=d&&d.ev||[]; if(!ev.length) return; var seen=0; try{ seen=+localStorage.getItem("kdeco_ev_"+rid)||0; }catch(e){} var lim=seen||Date.now()-6*3600e3;   // 처음 보는 방 = 6시간 안 소식만
  ev.filter(function(x){ return x.at>lim&&!x.me; }).slice(-2).forEach(function(x,i){ setTimeout(function(){ dcEv(x.a,x.k,x.n); },300+i*900); }); dcSeen(rid,d); }
window.karDorJoin=dorJoin; window.karDorOpen=function(){ if(box()) dorOpen(""); };
// ── 충전 안내창 (사장님 10-31 밤 「첫 안내창을 재미있게」) — 로그인 직후 한 번 · 앱을 켤 때마다 한 번까지 · 「결제」 = 바로 충전 창의 결제
Object.assign(TX,{
 prH:{ko:"입장해서 놀다 보면 시간 가는 줄 몰라요~",en:"Once you're in, time just flies~",ja:"入ったら時間を忘れちゃうかも〜",zhs:"一进来就玩得忘了时间～",zht:"一進來就玩到忘了時間～",es:"¡Una vez dentro, el tiempo vuela~!"},
 prP:{ko:"미리미리 충전해서 분위기 끌어올려 보아요 우리!",en:"Top up ahead and let's turn the party up together!",ja:"前もってチャージして、一緒に盛り上がろう！",zhs:"提前充值，咱们一起把气氛嗨起来！",zht:"提前儲值，我們一起把氣氛炒熱吧！",es:"¡Recarga antes y subamos juntos el ambiente!"},
 prS:{ko:"노래·도란도란·우리끼리 노래 방까지 포인트 하나로",en:"Songs, video rooms and Just Us Karaoke rooms, all with one wallet",ja:"歌もドランドランも仲間だけカラオケも、ポイントひとつで",zhs:"唱歌、视频聊天室、小圈子K歌房，一个积分全搞定",zht:"唱歌、視訊聊天室、小圈子K歌房，一個點數全搞定",es:"Canciones, salas de video y salas Solo nosotros Karaoke con un solo saldo"},
 prPay:{ko:"결제",en:"Pay",ja:"決済",zhs:"付款",zht:"付款",es:"Pagar"},
 prLater:{ko:"건너뛰기",en:"Skip",ja:"スキップ",zhs:"跳过",zht:"略過",es:"Omitir"}
});
function kPromo(){ var b=box(); if(!b||!KP.d||b.querySelector(".kpromo")) return; try{ if(sessionStorage.getItem("kpt_promo1")) return; sessionStorage.setItem("kpt_promo1","1"); }catch(e){}
  var d=KP.d, P=d.packs, app=kApp(), wonA=app?P.app:P.web, k=KP.k||0, o=document.createElement("div"); o.className="kpm kpromo"; b.appendChild(o);
  var draw=function(){ o.innerHTML='<div class="kprb"><div class="kprhero"><img class="kprimg" src="img/kara/kpt_promo.jpg" alt="">'
      +'<img class="kem kb1" src="img/kara/em_party.png" alt=""><img class="kem kb2" src="img/kara/em_star.png" alt=""><img class="kem kb3" src="img/kara/em_note.png" alt=""><img class="kem kb4" src="img/kara/em_dance.png" alt=""><img class="kem kb5" src="img/kara/em_coin.png" alt="">'
      +'<i class="kcf c1"></i><i class="kcf c2"></i><i class="kcf c3"></i><i class="kcf c4"></i><i class="kcf c5"></i><i class="kcf c6"></i><i class="kcf c7"></i><i class="kcf c8"></i></div>'
      +'<h3 class="kprh"><img class="kem kemh" src="img/kara/em_mic.png" alt="">'+esc(L(TX.prH))+'</h3><p class="kprp">'+esc(L(TX.prP))+'<img class="kem" src="img/kara/em_party.png" alt=""></p><p class="kprs">'+esc(L(TX.prS))+'</p>'
      +'<div class="kprpk">'+P.pt.map(function(pt,i){ var bo=(d.bonus||[])[i]||0; return '<button type="button" data-k="'+i+'"'+(i===k?' class="on"':'')+'><b>'+ptS(pt)+'</b>'+(bo?'<em class="ksv">'+esc(tf(L(TX.kwBon),{b:ptS(bo)}))+'</em>':'')+'<span>'+won(wonA[i])+'</span></button>'; }).join("")+'</div>'
      +'<button type="button" class="kgo kprgo" data-go="1">'+esc(L(TX.prPay))+'</button><button type="button" class="kc" data-x="1">'+esc(L(TX.prLater))+'</button></div>';
    [].forEach.call(o.querySelectorAll("[data-k]"),function(x){ x.onclick=function(){ k=+x.dataset.k; draw(); }; });
    o.querySelector("[data-x]").onclick=function(){ o.remove(); try{ ntap("kara_pt","promo_x"); }catch(e){} };
    o.querySelector("[data-go]").onclick=function(){ o.remove(); KP.k=k; try{ ntap("kara_pt","promo_go_"+k); }catch(e){} kwOpen("chg"); setTimeout(function(){ var w=box()&&box().querySelector(".kwal"), g=w&&w.querySelector("[data-pg],[data-gp]"); if(g) g.click(); },60); }; };
  o.onclick=function(e){ if(e.target===o) o.remove(); };
  draw(); try{ ntap("kara_pt","promo"); }catch(e){} }
function kPromoWait(n){ setTimeout(function(){ var b=box(); if(!b||!KP.d) return; if(b.querySelector(".kpm")||b.querySelector(".kdor")||document.getElementById("pgBox")&&!document.getElementById("pgBox").hidden){ if(n<20) kPromoWait(n+1); return; } kPromo(); },n?3000:700); }   // 다른 창이 떠 있으면 닫힌 뒤에
window.karOpen=open; window.karClose=close; window.karState=K;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__kara_([a-z]+)$/.exec(k||""); if(m){ open(m[1]); return; } return _hc.apply(this,arguments); };
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 노래방 나가기
})();
