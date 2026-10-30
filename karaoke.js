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
 s:{ko:"금영 노래방 공식 유튜브 채널의 노래방 영상 — 무료",en:"Karaoke videos from the official KY (Kumyoung) YouTube channel — free",ja:"KY（クミョン）公式YouTubeチャンネルのカラオケ動画 — 無料",zhs:"来自金永（KY）官方YouTube频道的卡拉OK视频 — 免费",zht:"來自金永（KY）官方YouTube頻道的卡拉OK影片 — 免費",es:"Vídeos de karaoke de los canal oficial de KY (Kumyoung) en YouTube — gratis"},
 q:{ko:"노래 제목·가수 찾기",en:"Search song or artist",ja:"曲名・歌手で検索",zhs:"搜索歌名或歌手",zht:"搜尋歌名或歌手",es:"Buscar canción o artista"},
 go:{ko:"찾기",en:"Search",ja:"検索",zhs:"搜索",zht:"搜尋",es:"Buscar"},
 ld:{ko:"노래를 불러오는 중…",en:"Loading songs…",ja:"曲を読み込み中…",zhs:"正在加载歌曲…",zht:"正在載入歌曲…",es:"Cargando canciones…"},
 no:{ko:"노래를 찾지 못했어요.",en:"No songs found.",ja:"曲が見つかりませんでした。",zhs:"没有找到歌曲。",zht:"沒有找到歌曲。",es:"No se encontraron canciones."},
 pick:{ko:"아래에서 노래를 고르세요",en:"Pick a song below",ja:"下から曲を選んでください",zhs:"请在下面选歌",zht:"請在下面選歌",es:"Elige una canción abajo"},
 yt:{ko:"이 곡은 유튜브에서만 재생돼요",en:"This song plays only on YouTube",ja:"この曲はYouTubeでのみ再生できます",zhs:"这首歌只能在YouTube上播放",zht:"這首歌只能在YouTube上播放",es:"Esta canción solo se reproduce en YouTube"},
 ytb:{ko:"유튜브에서 열기",en:"Open on YouTube",ja:"YouTubeで開く",zhs:"在YouTube打开",zht:"在YouTube開啟",es:"Abrir en YouTube"},
 ytt:{ko:"유튜브에서",en:"on YouTube",ja:"YouTubeで",zhs:"在YouTube",zht:"在YouTube",es:"en YouTube"},
 lo:{ko:"불러오는 중…",en:"Loading…",ja:"読み込み中…",zhs:"加载中…",zht:"載入中…",es:"Cargando…"},
 x:{ko:"나가기",en:"Leave",ja:"出る",zhs:"离开",zht:"離開",es:"Salir"},
 // 노래방 곡 이용권 판매 (사장님 10-27 「1,000원당 1곡, 기계의 돈 넣는 곳에 PAYMENT」 → 10-30 「카드사 심사에 보여 줄 판매 화면」 · 묶음 1 / 3+1 / 5+2 / 10+5)
 //  지금 무료 금영 유튜브 영상은 그대로 무료 — 곡 이용권은 정식 반주 곡(준비 중)에 쓰이고 지금은 차감 없음 · 결제는 시험(UNDER TESTING, 토스 시험 키)
 kb:{ko:"곡 이용권",en:"Song pass",ja:"曲チケット",zhs:"点歌券",zht:"點歌券",es:"Bono de canciones"},
 kbs:{ko:"1곡 1,000원 · 묶음은 서비스 곡 증정",en:"₩1,000 per song · bonus songs in bundles",ja:"1曲1,000ウォン・まとめ買いでサービス曲",zhs:"每首 ₩1,000 · 套餐赠送歌曲",zht:"每首 ₩1,000 · 套餐贈送歌曲",es:"₩1,000 por canción · canciones extra en packs"},
 kbuy:{ko:"곡 이용권 사기",en:"Buy song pass",ja:"曲チケットを買う",zhs:"购买点歌券",zht:"購買點歌券",es:"Comprar bono"},
 slot:{ko:"돈 넣는 곳",en:"Insert here",ja:"投入口",zhs:"投币口",zht:"投幣口",es:"Introduce aquí"},
 left:{ko:"남은 곡",en:"Songs left",ja:"残り曲数",zhs:"剩余歌曲",zht:"剩餘歌曲",es:"Canciones"},
 lgin:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Entrar"},
 polS:{ko:"곡 이용권은 정식 반주 곡 오픈 시 사용 · 지금 유튜브 노래방은 무료(차감 없음)",en:"Song pass is for licensed accompaniment songs (in preparation) · YouTube karaoke stays free",ja:"曲チケットは正式な伴奏曲の開始後に使用・YouTubeカラオケは無料（消費なし）",zhs:"点歌券用于正式伴奏歌曲（筹备中）· YouTube卡拉OK免费（不扣券）",zht:"點歌券用於正式伴奏歌曲（籌備中）· YouTube卡拉OK免費（不扣券）",es:"El bono es para canciones con acompañamiento con licencia (en preparación) · el karaoke de YouTube sigue gratis"},
 pol:{ko:"금영 노래방 공식 유튜브 노래방 영상은 지금처럼 무료이며 곡 이용권을 쓰지 않습니다. 곡 이용권은 정식 반주 곡(준비 중)이 열리면 그때부터 1곡에 1곡씩 사용됩니다.",en:"Karaoke videos from the official KY (Kumyoung) YouTube channel stay free and never use your song pass. The song pass will be used, one per song, for licensed accompaniment songs once they open (in preparation).",ja:"KY（クミョン）公式YouTubeチャンネルのカラオケ動画はこれまでどおり無料で、曲チケットは使いません。曲チケットは正式な伴奏曲（準備中）が始まってから、1曲ごとに1曲分使います。",zhs:"金永（KY）官方YouTube频道的卡拉OK视频照旧免费，不会扣点歌券。点歌券将在正式伴奏歌曲（筹备中）开放后使用，每唱一首扣一首。",zht:"金永（KY）官方YouTube頻道的卡拉OK影片照舊免費，不會扣點歌券。點歌券將在正式伴奏歌曲（籌備中）開放後使用，每唱一首扣一首。",es:"Los vídeos de karaoke de los canal oficial de KY (Kumyoung) en YouTube siguen siendo gratis y no usan tu bono. El bono se usará, una canción por cada una, en las canciones con acompañamiento con licencia cuando se abran (en preparación)."},
 keep:{ko:"남은 곡은 1년 보관, 안 부른 곡은 환불 요청 가능",en:"Unused songs kept for 1 year · refund on request",ja:"残った曲は1年保管・歌っていない曲は返金申請可",zhs:"剩余歌曲保留1年 · 未唱歌曲可申请退款",zht:"剩餘歌曲保留1年 · 未唱歌曲可申請退款",es:"Las canciones sin usar se guardan 1 año · reembolso a petición"},
 svc:{ko:"서비스 {b}곡",en:"+{b} bonus",ja:"サービス{b}曲",zhs:"赠送{b}首",zht:"贈送{b}首",es:"+{b} de regalo"},
 per:{ko:"곡당 {w}",en:"{w} per song",ja:"1曲あたり{w}",zhs:"每首{w}",zht:"每首{w}",es:"{w} por canción"},
 sN:{ko:"{n}곡",en:"{n} songs",ja:"{n}曲",zhs:"{n}首",zht:"{n}首",es:"{n} canciones"},
 sN1:{ko:"{n}곡",en:"{n} song",ja:"{n}曲",zhs:"{n}首",zht:"{n}首",es:"{n} canción"},
 tot:{ko:"결제 금액",en:"Amount",ja:"お支払い金額",zhs:"支付金额",zht:"付款金額",es:"Importe"},
 pay:{ko:"결제하기",en:"Pay",ja:"支払う",zhs:"付款",zht:"付款",es:"Pagar"},
 nxt:{ko:"다음",en:"Next",ja:"次へ",zhs:"下一步",zht:"下一步",es:"Siguiente"},
 cancel:{ko:"취소",en:"Cancel",ja:"キャンセル",zhs:"取消",zht:"取消",es:"Cancelar"},
 back:{ko:"돌아가기",en:"Back",ja:"戻る",zhs:"返回",zht:"返回",es:"Volver"},
 sel:{ko:"고른 묶음",en:"Selected pack",ja:"選んだパック",zhs:"所选套餐",zht:"所選套餐",es:"Pack elegido"},
 rcv:{ko:"받는 곡",en:"Songs you get",ja:"受け取る曲数",zhs:"获得歌曲",zht:"獲得歌曲",es:"Canciones que recibes"},
 sgn:{ko:"곡 이용권은 로그인한 계정에 쌓이므로, 사려면 로그인이 필요해요.",en:"Song passes are saved to your account, so please sign in to buy.",ja:"曲チケットはアカウントに保存されるため、購入にはログインが必要です。",zhs:"点歌券保存在您的账户中，购买前请先登录。",zht:"點歌券保存在您的帳戶中，購買前請先登入。",es:"El bono se guarda en tu cuenta, así que inicia sesión para comprar."},
 cu:{ko:"구매자 정보",en:"Your details",ja:"ご購入者情報",zhs:"购买人信息",zht:"購買人資訊",es:"Tus datos"},
 cn:{ko:"이름 (필수)",en:"Name (required)",ja:"お名前（必須）",zhs:"姓名（必填）",zht:"姓名（必填）",es:"Nombre (obligatorio)"},
 cp:{ko:"휴대폰 (필수)",en:"Mobile phone (required)",ja:"携帯電話（必須）",zhs:"手机（必填）",zht:"手機（必填）",es:"Móvil (obligatorio)"},
 ce:{ko:"이메일 (필수)",en:"Email (required)",ja:"メール（必須）",zhs:"邮箱（必填）",zht:"電子郵件（必填）",es:"Correo electrónico (obligatorio)"},
 cpn:{ko:"입력한 이름·휴대폰·이메일은 결제 안내와 환불 처리에만 씁니다.",en:"Your name, phone and email are used only for payment notices and refunds.",ja:"入力したお名前・携帯電話・メールは決済のご案内と返金処理にのみ使います。",zhs:"您填写的姓名、手机、邮箱仅用于付款通知和退款处理。",zht:"您填寫的姓名、手機、電子郵件僅用於付款通知和退款處理。",es:"Tu nombre, móvil y correo solo se usan para avisos de pago y reembolsos."},
 pm:{ko:"결제 수단",en:"Payment method",ja:"お支払い方法",zhs:"付款方式",zht:"付款方式",es:"Método de pago"},
 card:{ko:"신용·체크카드 (해외 카드 포함)",en:"Credit/debit card (incl. overseas cards)",ja:"クレジット・デビットカード（海外カード可）",zhs:"信用卡/借记卡（含境外卡）",zht:"信用卡/簽帳卡（含境外卡）",es:"Tarjeta de crédito/débito (incl. extranjeras)"},
 agr:{ko:"주문 내용·이용약관·환불 규정을 확인했으며 결제에 동의합니다",en:"I have checked the order, Terms and Refund Policy and agree to pay",ja:"注文内容・利用規約・返金規定を確認し、支払いに同意します",zhs:"我已确认订单、使用条款和退款规定并同意付款",zht:"我已確認訂單、使用條款和退款規定並同意付款",es:"He revisado el pedido, los Términos y la Política de reembolso y acepto pagar"},
 tL:{ko:"이용약관",en:"Terms",ja:"利用規約",zhs:"使用条款",zht:"使用條款",es:"Términos"},
 rL:{ko:"환불 규정",en:"Refund policy",ja:"返金規定",zhs:"退款规定",zht:"退款規定",es:"Reembolsos"},
 pL:{ko:"개인정보처리방침",en:"Privacy policy",ja:"プライバシーポリシー",zhs:"隐私政策",zht:"隱私政策",es:"Privacidad"},
 test:{ko:"UNDER TESTING — 시험 운영 중이라 실제로 결제되지 않습니다.",en:"UNDER TESTING — test mode; no real payment is made.",ja:"UNDER TESTING — テスト運用中のため、実際の決済は行われません。",zhs:"UNDER TESTING — 测试运营中，不会实际扣款。",zht:"UNDER TESTING — 測試營運中，不會實際扣款。",es:"UNDER TESTING — modo de prueba; no se realiza ningún cobro real."},
 pdT:{ko:"결제 완료",en:"Payment complete",ja:"お支払い完了",zhs:"付款完成",zht:"付款完成",es:"Pago completado"},
 tdone:{ko:"시험 결제(테스트 키)라 실제로 청구되지 않았고, 곡 수도 쌓이지 않았어요.",en:"Test payment (test key) — nothing was charged and no songs were added.",ja:"テスト決済（テストキー）のため、実際の請求はなく、曲数も追加されていません。",zhs:"测试付款（测试密钥），未实际扣款，也未增加歌曲。",zht:"測試付款（測試金鑰），未實際扣款，也未增加歌曲。",es:"Pago de prueba (clave de prueba): no se cobró nada ni se añadieron canciones."},
 pfT:{ko:"결제가 취소되었거나 완료되지 않았어요.",en:"The payment was cancelled or not completed.",ja:"お支払いがキャンセルされたか、完了しませんでした。",zhs:"付款已取消或未完成。",zht:"付款已取消或未完成。",es:"El pago se canceló o no se completó."},
 oid:{ko:"주문번호",en:"Order no.",ja:"注文番号",zhs:"订单号",zht:"訂單號",es:"N.º de pedido"},
 sav:{ko:"저장 중…",en:"Saving…",ja:"保存中…",zhs:"保存中…",zht:"儲存中…",es:"Guardando…"},
 opn:{ko:"결제창 여는 중…",en:"Opening payment…",ja:"決済画面を開いています…",zhs:"正在打开付款页面…",zht:"正在開啟付款頁面…",es:"Abriendo el pago…"},
 enm:{ko:"이름을 넣어 주세요.",en:"Please enter your name.",ja:"お名前を入力してください。",zhs:"请填写姓名。",zht:"請填寫姓名。",es:"Escribe tu nombre."},
 eem:{ko:"이메일 주소를 확인해 주세요.",en:"Please check your email address.",ja:"メールアドレスをご確認ください。",zhs:"请检查邮箱地址。",zht:"請檢查電子郵件地址。",es:"Revisa tu correo electrónico."},
 eph:{ko:"휴대폰 번호를 확인해 주세요.",en:"Please check your phone number.",ja:"携帯電話番号をご確認ください。",zhs:"请检查手机号码。",zht:"請檢查手機號碼。",es:"Revisa tu número de móvil."},
 efail:{ko:"저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.",en:"Could not save. Please try again shortly.",ja:"保存できませんでした。しばらくしてからもう一度お試しください。",zhs:"保存失败，请稍后再试。",zht:"儲存失敗，請稍後再試。",es:"No se pudo guardar. Inténtalo de nuevo en un momento."},
 esess:{ko:"로그인이 풀렸어요. 다시 로그인해 주세요.",en:"Your sign-in expired. Please sign in again.",ja:"ログインが切れました。もう一度ログインしてください。",zhs:"登录已失效，请重新登录。",zht:"登入已失效，請重新登入。",es:"Tu sesión caducó. Vuelve a iniciar sesión."},
 // 공지사항 — 첫 줄(가격)과 예시는 가격표(허브)로 그때그때 만든다
 rec:{"ko": "● 녹화", "en": "● Record", "ja": "● 録画", "zhs": "● 录像", "zht": "● 錄影", "es": "● Grabar"},
 recX:{"ko": "■ 녹화 끝", "en": "■ Stop", "ja": "■ 停止", "zhs": "■ 停止", "zht": "■ 停止", "es": "■ Parar"},
 recNo:{"ko": "카메라·마이크를 쓸 수 없어요. 브라우저에서 카메라·마이크를 허락해 주세요.", "en": "Can't use the camera or microphone. Please allow them in your browser.", "ja": "カメラ・マイクを使えません。ブラウザで許可してください。", "zhs": "无法使用相机或麦克风，请在浏览器中允许。", "zht": "無法使用相機或麥克風，請在瀏覽器中允許。", "es": "No se puede usar la cámara o el micrófono. Permítelos en tu navegador."},
 retk:{"ko": "다시 찍기", "en": "Record again", "ja": "撮り直す", "zhs": "重拍", "zht": "重拍", "es": "Grabar de nuevo"},
 pvT:{"ko": "내 녹화", "en": "My recording", "ja": "自分の録画", "zhs": "我的录像", "zht": "我的錄影", "es": "Mi grabación"},
 pvN:{"ko": "녹화한 영상은 이 기기에만 있고 어디에도 보내지 않습니다. 닫으면 지워집니다.", "en": "Your recording stays on this device and is not sent anywhere. It is deleted when you close.", "ja": "録画はこの端末にのみあり、どこにも送信しません。閉じると削除されます。", "zhs": "录像只保存在本设备上，不会发送到任何地方。关闭后即删除。", "zht": "錄影只存在本裝置上，不會傳送到任何地方。關閉後即刪除。", "es": "Tu grabación se queda en este dispositivo y no se envía a ningún sitio. Se borra al cerrar."},
 up:{"ko": "내 노래 올리기", "en": "Post my song", "ja": "自分の歌を投稿", "zhs": "发布我的歌", "zht": "發布我的歌", "es": "Publicar mi canción"},
 upQ:{"ko": "노래 끝! 내 노래를 가요무대에 올려 보세요", "en": "Song finished! Post your song to the Public Stage", "ja": "歌い終わり！自分の歌をステージに投稿しよう", "zhs": "唱完了！把你的歌发布到舞台", "zht": "唱完了！把你的歌發布到舞台", "es": "¡Canción terminada! Publica tu canción en el Escenario"},
 stgB:{"ko": "스테이지", "en": "Stage", "ja": "ステージ", "zhs": "舞台", "zht": "舞台", "es": "Escenario"},
 stg:{"ko": "가요무대", "en": "Public Stage", "ja": "ステージ", "zhs": "舞台", "zht": "舞台", "es": "Escenario"},
 mstg:{"ko": "내 가요무대", "en": "My Stage", "ja": "マイステージ", "zhs": "我的舞台", "zht": "我的舞台", "es": "Mi escenario"},
 soon:{"ko": "준비 중인 기능이에요. 곧 열립니다.", "en": "This feature is coming soon.", "ja": "準備中の機能です。近日公開します。", "zhs": "此功能正在准备中，即将开放。", "zht": "此功能正在準備中，即將開放。", "es": "Esta función estará disponible pronto."},
 soon2:{"ko": "곧 열립니다.", "en": "Coming soon.", "ja": "近日公開。", "zhs": "即将开放。", "zht": "即將開放。", "es": "Próximamente."},
 stgE:{"ko": "다른 사람 노래 영상", "en": "Other people's singing videos", "ja": "ほかの人の歌の動画", "zhs": "其他人的唱歌视频", "zht": "其他人的唱歌影片", "es": "Vídeos de otras personas cantando"},
 mstgE:{"ko": "내 노래 영상", "en": "My singing videos", "ja": "自分の歌の動画", "zhs": "我的唱歌视频", "zht": "我的唱歌影片", "es": "Mis vídeos cantando"},
 // 내 노래 올리기·가요무대 목록 (10-30 사장님 기기 시험판)
 pvN2:{ko:"올리기 전에는 이 기기에만 있습니다. 올리지 않고 닫으면 지워집니다.",en:"Until you post it, the recording stays only on this device. If you close without posting, it is deleted.",ja:"投稿するまでは、この端末にのみ保存されます。投稿せずに閉じると削除されます。",zhs:"发布前录像只保存在本设备上。不发布就关闭，录像会被删除。",zht:"發布前錄影只存在本裝置上。不發布就關閉，錄影會被刪除。",es:"Hasta que la publiques, la grabación solo está en este dispositivo. Si cierras sin publicar, se borra."},
 vis:{ko:"공개 범위",en:"Who can see it",ja:"公開範囲",zhs:"公开范围",zht:"公開範圍",es:"Quién puede verla"},
 vPub:{ko:"전체 공개",en:"Everyone",ja:"全体に公開",zhs:"所有人可见",zht:"所有人可見",es:"Todos"},
 vMe:{ko:"나만 보기",en:"Only me",ja:"自分だけ",zhs:"仅自己可见",zht:"僅自己可見",es:"Solo yo"},
 vPubN:{ko:"가요무대에 올라가 누구나 볼 수 있어요.",en:"It goes on the Public Stage where anyone can watch it.",ja:"ステージに載り、誰でも見られます。",zhs:"会发布到舞台，所有人都能观看。",zht:"會發布到舞台，所有人都能觀看。",es:"Se publica en el Escenario y cualquiera puede verla."},
 vMeN:{ko:"내 가요무대에만 있고 나만 볼 수 있어요.",en:"It stays on My Stage and only you can see it.",ja:"マイステージにだけあり、自分だけが見られます。",zhs:"只在我的舞台上，仅自己可以观看。",zht:"只在我的舞台上，僅自己可以觀看。",es:"Se queda en Mi escenario y solo tú puedes verla."},
 by:{ko:"태어난 해 (4자리)",en:"Year of birth (4 digits)",ja:"生まれた年（4桁）",zhs:"出生年份（4位数）",zht:"出生年份（4位數）",es:"Año de nacimiento (4 cifras)"},
 byN:{ko:"처음 올릴 때 한 번만 물어요. 만 14세 미만은 노래를 올릴 수 없어요.",en:"We ask only once, the first time you post. Users under 14 cannot post songs.",ja:"初めて投稿するときに一度だけ確認します。14歳未満は歌を投稿できません。",zhs:"仅在首次发布时询问一次。未满14周岁不能发布歌曲。",zht:"僅在首次發布時詢問一次。未滿14歲不能發布歌曲。",es:"Solo lo preguntamos la primera vez. Los menores de 14 años no pueden publicar canciones."},
 byE:{ko:"태어난 해를 4자리 숫자로 넣어 주세요.",en:"Please enter your year of birth as 4 digits.",ja:"生まれた年を4桁の数字で入力してください。",zhs:"请用4位数字填写出生年份。",zht:"請用4位數字填寫出生年份。",es:"Escribe tu año de nacimiento con 4 cifras."},
 by14:{ko:"만 14세 미만은 노래를 올릴 수 없어요.",en:"Users under 14 cannot post songs.",ja:"14歳未満は歌を投稿できません。",zhs:"未满14周岁不能发布歌曲。",zht:"未滿14歲不能發布歌曲。",es:"Los menores de 14 años no pueden publicar canciones."},
 upGo:{ko:"올리기",en:"Post",ja:"投稿する",zhs:"发布",zht:"發布",es:"Publicar"},
 upIng:{ko:"올리는 중… {p}%",en:"Posting… {p}%",ja:"投稿中… {p}%",zhs:"发布中… {p}%",zht:"發布中… {p}%",es:"Publicando… {p}%"},
 upOk:{ko:"올렸어요.",en:"Posted.",ja:"投稿しました。",zhs:"已发布。",zht:"已發布。",es:"Publicada."},
 upF:{ko:"올리지 못했어요. 잠시 뒤 다시 해 주세요.",en:"Could not post. Please try again shortly.",ja:"投稿できませんでした。しばらくしてからもう一度お試しください。",zhs:"发布失败，请稍后再试。",zht:"發布失敗，請稍後再試。",es:"No se pudo publicar. Inténtalo de nuevo en un momento."},
 upBig:{ko:"영상이 너무 커요(60MB까지). 조금 짧게 다시 찍어 주세요.",en:"The video is too large (60 MB max). Please record a shorter one.",ja:"動画が大きすぎます（60MBまで）。少し短く撮り直してください。",zhs:"视频太大（最多60MB），请录短一点再试。",zht:"影片太大（最多60MB），請錄短一點再試。",es:"El vídeo es demasiado grande (máx. 60 MB). Graba uno más corto."},
 upTy:{ko:"이 기기의 녹화 형식은 올릴 수 없어요.",en:"This device's recording format cannot be posted.",ja:"この端末の録画形式は投稿できません。",zhs:"无法发布此设备的录像格式。",zht:"無法發布此裝置的錄影格式。",es:"No se puede publicar el formato de grabación de este dispositivo."},
 upNet:{ko:"인터넷 연결을 확인하고 다시 해 주세요.",en:"Please check your internet connection and try again.",ja:"インターネット接続を確認して、もう一度お試しください。",zhs:"请检查网络连接后再试。",zht:"請檢查網路連線後再試。",es:"Revisa tu conexión a internet e inténtalo de nuevo."},
 needRec:{ko:"먼저 ● 녹화로 노래를 찍어 주세요.",en:"First record your song with ● Record.",ja:"まず ● 録画で歌を撮ってください。",zhs:"请先用 ● 录像录下你的歌。",zht:"請先用 ● 錄影錄下你的歌。",es:"Primero graba tu canción con ● Grabar."},
 del:{ko:"지우기",en:"Delete",ja:"削除",zhs:"删除",zht:"刪除",es:"Borrar"},
 delQ:{ko:"이 노래 영상을 지울까요? 지우면 되돌릴 수 없어요.",en:"Delete this video? This cannot be undone.",ja:"この動画を削除しますか？元に戻せません。",zhs:"要删除这个视频吗？删除后无法恢复。",zht:"要刪除這個影片嗎？刪除後無法復原。",es:"¿Borrar este vídeo? No se puede deshacer."},
 delF:{ko:"지우지 못했어요. 잠시 뒤 다시 해 주세요.",en:"Could not delete. Please try again shortly.",ja:"削除できませんでした。しばらくしてからもう一度お試しください。",zhs:"删除失败，请稍后再试。",zht:"刪除失敗，請稍後再試。",es:"No se pudo borrar. Inténtalo de nuevo en un momento."},
 stF:{ko:"목록을 불러오지 못했어요.",en:"Could not load the list.",ja:"一覧を読み込めませんでした。",zhs:"无法加载列表。",zht:"無法載入列表。",es:"No se pudo cargar la lista."},
 // 가요무대 화면 전환·프로필·설명·댓글 (10-30 사장님 기기 시험판)
 idSet:{ko:"ID 정하기",en:"Set your ID",ja:"IDを決める",zhs:"设置ID",zht:"設定ID",es:"Elegir tu ID"},
 idCh:{ko:"ID 바꾸기",en:"Change ID",ja:"IDを変更",zhs:"更改ID",zht:"更改ID",es:"Cambiar ID"},
 idN:{ko:"2~20자 · 글자·숫자·_ . - 만 (띄어쓰기 없이)",en:"2–20 characters · letters, numbers, _ . - only (no spaces)",ja:"2〜20文字・文字・数字・_ . - のみ（スペースなし）",zhs:"2~20个字符 · 仅限文字、数字、_ . -（不含空格）",zht:"2~20個字元 · 僅限文字、數字、_ . -（不含空格）",es:"2–20 caracteres · solo letras, números, _ . - (sin espacios)"},
 idTk:{ko:"이미 다른 사람이 쓰는 ID예요.",en:"That ID is already taken.",ja:"そのIDはすでに使われています。",zhs:"该ID已被使用。",zht:"該ID已被使用。",es:"Ese ID ya está en uso."},
 save:{ko:"저장",en:"Save",ja:"保存",zhs:"保存",zht:"儲存",es:"Guardar"},
 fol:{ko:"팔로워",en:"Followers",ja:"フォロワー",zhs:"粉丝",zht:"粉絲",es:"Seguidores"},
 vw:{ko:"조회수",en:"Views",ja:"再生回数",zhs:"播放量",zht:"觀看次數",es:"Vistas"},
 vids:{ko:"올린 영상",en:"Videos",ja:"投稿動画",zhs:"发布的视频",zht:"發布的影片",es:"Vídeos"},
 lks:{ko:"받은 좋아요",en:"Likes received",ja:"もらったいいね",zhs:"收到的赞",zht:"收到的讚",es:"Me gusta recibidos"},
 sNew:{ko:"최신순",en:"Newest first",ja:"新しい順",zhs:"最新优先",zht:"最新優先",es:"Más recientes"},
 sOld:{ko:"오래된순",en:"Oldest first",ja:"古い順",zhs:"最早优先",zht:"最早優先",es:"Más antiguos"},
 sScore:{ko:"점수순",en:"Top score",ja:"点数順",zhs:"按分数",zht:"按分數",es:"Mejor puntuación"},
 scPt:{ko:"점",en:"pts",ja:"点",zhs:"分",zht:"分",es:"pts"},
 scT:{ko:"노래 점수",en:"Singing score",ja:"歌唱得点",zhs:"演唱得分",zht:"演唱得分",es:"Puntuación"},
 dsc:{ko:"설명",en:"Description",ja:"説明",zhs:"简介",zht:"簡介",es:"Descripción"},
 dscE:{ko:"설명 고치기",en:"Edit description",ja:"説明を編集",zhs:"编辑简介",zht:"編輯簡介",es:"Editar descripción"},
 dscP:{ko:"이 노래 영상에 대한 설명 (200자까지)",en:"Describe this video (up to 200 characters)",ja:"この動画の説明（200文字まで）",zhs:"这个视频的简介（最多200字）",zht:"這個影片的簡介（最多200字）",es:"Describe este vídeo (hasta 200 caracteres)"},
 dscN:{ko:"설명이 없어요.",en:"No description.",ja:"説明はありません。",zhs:"暂无简介。",zht:"暫無簡介。",es:"Sin descripción."},
 cmT:{ko:"댓글",en:"Comments",ja:"コメント",zhs:"评论",zht:"留言",es:"Comentarios"},
 cmP:{ko:"댓글 쓰기 (200자까지)",en:"Write a comment (up to 200 characters)",ja:"コメントを書く（200文字まで）",zhs:"写评论（最多200字）",zht:"寫留言（最多200字）",es:"Escribe un comentario (hasta 200 caracteres)"},
 cmGo:{ko:"쓰기",en:"Post",ja:"送信",zhs:"发表",zht:"發表",es:"Publicar"},
 cmE:{ko:"첫 댓글을 남겨 보세요.",en:"Be the first to comment.",ja:"最初のコメントを書いてみましょう。",zhs:"来发表第一条评论吧。",zht:"來發表第一則留言吧。",es:"Sé el primero en comentar."},
 cmDQ:{ko:"이 댓글을 지울까요?",en:"Delete this comment?",ja:"このコメントを削除しますか？",zhs:"要删除这条评论吗？",zht:"要刪除這則留言嗎？",es:"¿Borrar este comentario?"},
 pfT:{ko:"프로필 영상 고르기",en:"Choose profile video",ja:"プロフィール動画を選ぶ",zhs:"选择头像视频",zht:"選擇頭像影片",es:"Elegir vídeo de perfil"},
 pfN:{ko:"프로필로 쓸 내 영상을 누르세요. 첫 장면이 프로필이 됩니다.",en:"Tap one of your videos to use as your profile. Its first frame becomes your profile.",ja:"プロフィールに使う自分の動画をタップしてください。最初の場面がプロフィールになります。",zhs:"点击要用作头像的视频，第一个画面会成为头像。",zht:"點選要用作頭像的影片，第一個畫面會成為頭像。",es:"Toca uno de tus vídeos para usarlo como perfil. Su primer fotograma será tu perfil."},
 pfE:{ko:"아직 올린 영상이 없어요. 노래를 녹화해 올리면 첫 장면이 프로필이 됩니다.",en:"No videos yet. Record and post a song — its first frame becomes your profile.",ja:"まだ動画がありません。歌を録画して投稿すると、最初の場面がプロフィールになります。",zhs:"还没有视频。录制并发布歌曲后，第一个画面就会成为头像。",zht:"還沒有影片。錄製並發布歌曲後，第一個畫面就會成為頭像。",es:"Aún no hay vídeos. Graba y publica una canción: su primer fotograma será tu perfil."},
 chg:{ko:"바꾸기",en:"Change",ja:"変更",zhs:"更换",zht:"更換",es:"Cambiar"},
 fail:{ko:"잠시 뒤 다시 해 주세요.",en:"Please try again shortly.",ja:"しばらくしてからもう一度お試しください。",zhs:"请稍后再试。",zht:"請稍後再試。",es:"Inténtalo de nuevo en un momento."},
 upB:{ko:"좋아요",en:"Like",ja:"いいね",zhs:"赞",zht:"讚",es:"Me gusta"},
 // 팔로우·그 사람 무대 (10-30)
 vFol:{ko:"팔로워만",en:"Followers only",ja:"フォロワーのみ",zhs:"仅粉丝可见",zht:"僅粉絲可見",es:"Solo seguidores"},
 vFolN:{ko:"나를 팔로우한 사람만 볼 수 있어요.",en:"Only people who follow you can watch it.",ja:"あなたをフォローしている人だけが見られます。",zhs:"只有关注你的人可以观看。",zht:"只有追蹤你的人可以觀看。",es:"Solo las personas que te siguen pueden verla."},
 flw:{ko:"+ 팔로우",en:"+ Follow",ja:"+ フォロー",zhs:"+ 关注",zht:"+ 追蹤",es:"+ Seguir"},
 flg:{ko:"팔로잉",en:"Following",ja:"フォロー中",zhs:"已关注",zht:"追蹤中",es:"Siguiendo"},
 fing:{ko:"팔로잉",en:"Following",ja:"フォロー中",zhs:"关注",zht:"追蹤中",es:"Siguiendo"},
 flE:{ko:"아직 아무도 없어요.",en:"No one yet.",ja:"まだ誰もいません。",zhs:"还没有人。",zht:"還沒有人。",es:"Aún no hay nadie."},
 ustE:{ko:"볼 수 있는 영상이 없어요.",en:"No videos to show.",ja:"表示できる動画がありません。",zhs:"没有可观看的视频。",zht:"沒有可觀看的影片。",es:"No hay vídeos para mostrar."},
 dnB:{ko:"싫어요",en:"Dislike",ja:"よくないね",zhs:"踩",zht:"倒讚",es:"No me gusta"},
 ntc:{ko:"공지사항",en:"Notice",ja:"お知らせ",zhs:"公告",zht:"公告",es:"Aviso"},
 ntcP0:{ko:"곡 이용권: {list}",en:"Song pass: {list}",ja:"曲チケット：{list}",zhs:"点歌券：{list}",zht:"點歌券：{list}",es:"Bono de canciones: {list}"},
 ntcL:{
  ko:["산 곡은 내 계정(구글·애플 로그인)에 구매일부터 1년간 보관됩니다.","환불: 구매일로부터 7일 이내에는 결제 금액에서 사용한 곡을 1곡 1,000원으로 계산해 뺀 금액을, 7일이 지난 뒤(보관 기간 1년 안)에는 그 금액에서 환불 수수료 10%를 뺀 금액을 환불합니다. 서비스로 받은 곡은 환불 대상이 아니며, 계산 결과가 0원 이하면 환불 금액은 없습니다(10원 미만 버림).","환불은 결제한 수단으로 영업일 3~7일 안에 처리됩니다. 문의: 앱의 문의 메뉴 또는 admin@moneypuzzle.co.kr","지금은 시험 운영 중(UNDER TESTING)이라 결제해도 실제로 청구되지 않고 곡 수도 쌓이지 않습니다."],
  en:["Songs you buy stay in your account (Google or Apple sign-in) for 1 year from purchase.","Refunds: within 7 days of purchase, we refund the amount paid minus the songs used at ₩1,000 per song; after 7 days (within the 1-year storage period), that amount minus a 10% refund fee. Bonus songs are not refundable, and if the result is ₩0 or less there is no refund (rounded down to ₩10).","Refunds go to your original payment method within 3–7 business days. Contact: the app's inquiry menu or admin@moneypuzzle.co.kr","We are in test mode (UNDER TESTING): payments are not actually charged and no songs are added."],
  ja:["購入した曲はご自身のアカウント（Google・Appleログイン）に購入日から1年間保管されます。","返金：購入日から7日以内は支払額から使った曲を1曲1,000ウォンとして差し引いた金額を、7日を過ぎた後（保管期間1年以内）はその金額から返金手数料10%を差し引いた金額を返金します。サービス曲は返金対象外で、計算結果が0ウォン以下の場合は返金額はありません（10ウォン未満切り捨て）。","返金はお支払い方法へ3〜7営業日以内に行います。お問い合わせ：アプリのお問い合わせメニューまたは admin@moneypuzzle.co.kr","現在はテスト運用中（UNDER TESTING）のため、決済しても実際には請求されず、曲数も追加されません。"],
  zhs:["购买的歌曲保存在您的账户（Google·Apple 登录）中，自购买日起保留1年。","退款：购买后7天内退还支付金额减去已用歌曲（每首₩1,000）后的金额；超过7天后（1年保存期内）再扣除10%退款手续费后退还。赠送歌曲不在退款范围内，计算结果为₩0或以下时不予退款（不足₩10舍去）。","退款将在3–7个工作日内退回原支付方式。咨询：应用内的咨询菜单或 admin@moneypuzzle.co.kr","目前为测试运营（UNDER TESTING），付款不会实际扣款，也不会增加歌曲。"],
  zht:["購買的歌曲保存在您的帳戶（Google·Apple 登入）中，自購買日起保留1年。","退款：購買後7天內退還付款金額減去已用歌曲（每首₩1,000）後的金額；超過7天後（1年保存期內）再扣除10%退款手續費後退還。贈送歌曲不在退款範圍內，計算結果為₩0或以下時不予退款（不足₩10捨去）。","退款將在3–7個工作天內退回原付款方式。諮詢：App 內的諮詢選單或 admin@moneypuzzle.co.kr","目前為測試營運（UNDER TESTING），付款不會實際扣款，也不會增加歌曲。"],
  es:["Las canciones que compras se guardan en tu cuenta (inicio de sesión con Google o Apple) durante 1 año desde la compra.","Reembolsos: en los 7 días siguientes a la compra, el importe pagado menos las canciones usadas a ₩1,000 cada una; pasados 7 días (dentro del año de conservación), ese importe menos una comisión de reembolso del 10%. Las canciones de regalo no son reembolsables y, si el resultado es ₩0 o menos, no hay reembolso (redondeo a la baja a ₩10).","El reembolso se hace al método de pago original en 3–7 días hábiles. Contacto: menú de consultas de la app o admin@moneypuzzle.co.kr","Estamos en modo de prueba (UNDER TESTING): los pagos no se cobran realmente y no se añaden canciones."]},
 ntcEx:{ko:"예: {pk} 묶음({w}·{s}곡)을 사고 {u}곡을 쓴 경우 — 7일 이내: {w} − {c} = {r} 환불 / 8일째: {r}에서 수수료 10% 뺀 {r2} 환불",en:"Example: buy the {pk} pack ({w}, {s} songs) and use {u} songs — within 7 days: {w} − {c} = {r} refunded / on day 8: {r} minus the 10% fee = {r2} refunded.",ja:"例：{pk}パック（{w}・{s}曲）を購入し{u}曲使った場合 — 7日以内：{w} − {c} = {r} を返金／8日目：{r} から手数料10%を引いた {r2} を返金。",zhs:"例：购买{pk}套餐（{w}·{s}首）并用了{u}首 — 7天内：{w} − {c} = {r} 退款 / 第8天：{r} 扣除10%手续费后退款 {r2}。",zht:"例：購買{pk}套餐（{w}·{s}首）並用了{u}首 — 7天內：{w} − {c} = {r} 退款 / 第8天：{r} 扣除10%手續費後退款 {r2}。",es:"Ejemplo: compras el pack {pk} ({w}, {s} canciones) y usas {u} — en 7 días: {w} − {c} = {r} de reembolso / el día 8: {r} menos la comisión del 10% = {r2} de reembolso."},   // 환불 새 규칙 10-30: 7일 이내 = 결제 금액 − 쓴 곡×1,000원 · 7일 뒤 = 거기서 수수료 10% 더 뺌
 ntcR:{ko:"환불 규정 전체 보기",en:"View full refund policy",ja:"返金規定の全文を見る",zhs:"查看完整退款规定",zht:"查看完整退款規定",es:"Ver la política de reembolso completa"},
 ntcP:{ko:"남은 곡은 1년간 보관 · 안 부른 곡은 환불 가능 — 공지사항",en:"Unused songs kept 1 year · refundable — Notice",ja:"残り曲は1年保管・未使用分は返金可能 — お知らせ",zhs:"剩余歌曲保留1年 · 未唱可退款 — 公告",zht:"剩餘歌曲保留1年 · 未唱可退款 — 公告",es:"Canciones sin usar: 1 año guardadas · reembolsables — Aviso"},
 ok:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 lftN:{ko:"남은 곡: {n}곡",en:"Songs left: {n}",ja:"残り曲数: {n}曲",zhs:"剩余歌曲：{n}首",zht:"剩餘歌曲：{n}首",es:"Canciones restantes: {n}"},
 sgi:{ko:"로그인하면 남은 곡이 1년간 보관됩니다",en:"Sign in to keep unused songs for 1 year",ja:"ログインすると残り曲が1年間保管されます",zhs:"登录后剩余歌曲可保留1年",zht:"登入後剩餘歌曲可保留1年",es:"Inicia sesión para guardar tus canciones 1 año"},
 sgb:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Iniciar sesión"},
 rfb:{ko:"남은 곡 환불 요청 ({n}곡)",en:"Request refund for unused songs ({n})",ja:"残り曲の返金を申請（{n}曲）",zhs:"申请退还剩余歌曲（{n}首）",zht:"申請退還剩餘歌曲（{n}首）",es:"Solicitar reembolso de canciones ({n})"},
 rfh:{ko:"환불 요청",en:"Refund request",ja:"返金申請",zhs:"退款申请",zht:"退款申請",es:"Solicitud de reembolso"},
 rfq:{ko:"남은 곡 {n}곡의 환불을 요청할까요? 금액은 환불 규정(7일 이내는 결제 금액에서 쓴 곡을 1곡 1,000원으로 뺀 금액, 7일이 지나면 거기서 수수료 10%를 더 뺀 금액)으로 계산해 결제한 수단으로 영업일 3~7일 안에 환불됩니다.",en:"Request a refund for {n} unused songs? The amount follows our refund policy (within 7 days: amount paid minus songs used at ₩1,000 each; after 7 days: that amount minus a 10% fee) and goes to your original payment method within 3–7 business days.",ja:"残り{n}曲の返金を申請しますか？金額は返金規定（7日以内は支払額から使った曲を1曲1,000ウォンとして差し引いた金額、7日を過ぎるとそこから手数料10%をさらに差し引いた金額）で計算し、お支払い方法へ3〜7営業日以内に返金します。",zhs:"要申请退还剩余的{n}首歌吗？金额按退款规定计算（7天内为支付金额减去已用歌曲每首₩1,000后的金额，超过7天再扣除10%手续费），将在3–7个工作日内退回原支付方式。",zht:"要申請退還剩餘的{n}首歌嗎？金額依退款規定計算（7天內為付款金額減去已用歌曲每首₩1,000後的金額，超過7天再扣除10%手續費），將在3–7個工作天內退回原付款方式。",es:"¿Solicitar el reembolso de {n} canciones sin usar? El importe sigue nuestra política (en 7 días: importe pagado menos las canciones usadas a ₩1,000 cada una; después: ese importe menos una comisión del 10%) y se devuelve a tu método de pago en 3–7 días hábiles."},
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
var st=document.createElement("style");
st.textContent="#karBox{word-break:keep-all;overflow-wrap:break-word;position:fixed;inset:0;z-index:2147483004;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden}"
 +"#karBox::before{content:'';position:absolute;inset:-20%;pointer-events:none;background:conic-gradient(from 0deg,rgba(255,80,200,.10),rgba(80,160,255,.10),rgba(120,255,180,.08),rgba(255,200,80,.10),rgba(255,80,200,.10));animation:karSpin 14s linear infinite;mix-blend-mode:screen}@keyframes karSpin{to{transform:rotate(360deg)}}"
 +"#karBox .kin{position:relative;max-width:720px;width:100%;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:10px 12px 0}"
 +"#karBox .khd{display:flex;align-items:center;gap:8px}#karBox .khd b{font-size:19px;text-shadow:0 0 8px #ff4fd8,0 0 16px #7a5cff}#karBox .khd small{display:block;font-size:12px;opacity:.75;font-weight:600}#karBox .kx{margin-left:auto;white-space:nowrap;flex-shrink:0;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:7px 14px;font-weight:800;cursor:pointer}"
 +"#karBox .kch{display:flex;gap:8px;margin:8px 0}#karBox .kch a{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 8px;color:#fff;text-decoration:none;font-weight:800;font-size:13px}#karBox .kch img{width:34px;height:34px;border-radius:50%;flex:0 0 auto}"
 +"#karBox .kpl{position:relative;width:100%;height:max(200px,calc(100dvh - 485px));background:#000;border-radius:12px;overflow:hidden;box-shadow:0 0 18px rgba(170,90,255,.45);flex:0 0 auto}#karBox .kpl .kmsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-weight:800;opacity:.8}#karBox .kpl iframe{width:100%;height:100%;border:0}"
 +"#karBox .ktb{display:flex;gap:6px;margin:10px 0 6px}#karBox .ktb button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .ktb .kstg{flex:1.15;line-height:1.15;white-space:normal;border-color:#ffe066;color:#ffe066}#karBox.krecm .kin>*:not(.kpl){display:none!important}#karBox.krecm .kin{padding:8px}#karBox.krecm .kpl{height:auto!important;flex:1 1 auto;border:3px solid #ff3b3b;box-shadow:0 0 0 2px rgba(255,59,59,.35),0 0 28px rgba(255,59,59,.55)}#karBox .kvf{position:absolute;inset:0;pointer-events:none;z-index:3}#karBox .kvf i{position:absolute;width:36px;height:36px;border:3px solid rgba(255,255,255,.92)}#karBox .kvf .a{top:16px;left:16px;border-right:0;border-bottom:0}#karBox .kvf .b{top:16px;right:16px;border-left:0;border-bottom:0}#karBox .kvf .c{bottom:16px;left:16px;border-right:0;border-top:0}#karBox .kvf .d{bottom:16px;right:16px;border-left:0;border-top:0}#karBox .kvf b{position:absolute;top:18px;left:50%;transform:translateX(-50%);font:800 14px/1 ui-monospace,Consolas,monospace;color:#fff;background:rgba(0,0,0,.45);padding:6px 10px;border-radius:6px;letter-spacing:.06em}#karBox .kvf em{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff2b2b;vertical-align:0;animation:kbl 1s steps(1) infinite}@keyframes kbl{50%{opacity:0}}#karBox .kvf s{position:absolute;left:33.3%;right:33.3%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.12);border-right:1px solid rgba(255,255,255,.12)}#karBox .kflash{position:absolute;inset:0;z-index:6;background:#fff;pointer-events:none;animation:kfl .45s ease-out forwards}@keyframes kfl{from{opacity:.95}to{opacity:0}}#karBox .kcam{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);z-index:1;background:#000}#karBox.krecm .kpl iframe{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);width:min(calc(100% - 24px),560px);height:auto;aspect-ratio:16/9;z-index:4;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.6)}@media (orientation:landscape){#karBox.krecm .kpl iframe{left:auto;right:12px;transform:none;width:min(38%,calc((100dvh - 40px)*0.45*16/9))}}#karBox.krecm .kmsg{display:none}#karBox .kpv video{width:100%;max-height:50vh;background:#000;border-radius:10px}#karBox.krecm .krec::first-letter{color:#fff}#karBox.krecm .krec{top:14px;left:14px;z-index:5;background:#ff2b2b;font-size:14px;padding:9px 18px;box-shadow:0 0 0 4px rgba(255,255,255,.85)}#karBox .krec{position:absolute;top:10px;left:10px;z-index:4;border:0;border-radius:999px;background:rgba(0,0,0,.6);color:#fff;font-weight:900;font-size:12.5px;padding:6px 11px;cursor:pointer}#karBox .krec::first-letter{color:#ff3b3b}#karBox .kupb{border:0;border-radius:999px;background:#ffe066;color:#1a1300;font-weight:900;font-size:15px;padding:11px 20px;cursor:pointer}#karBox .ksoon{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:9;background:rgba(20,14,36,.95);border:1px solid #ffe066;color:#ffe066;font-weight:800;font-size:14px;padding:10px 16px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.5);white-space:nowrap;pointer-events:none}#karBox .kstgt{display:flex;gap:6px}#karBox .kstgt button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .kstgt button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}#karBox .kstge{min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;color:#cfc6e8;line-height:1.6;padding:12px;border:1px dashed rgba(255,255,255,.25);border-radius:12px}#karBox .ktb button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}"
 +"#karBox .ksr{display:flex;gap:6px}#karBox .ksr input{flex:1;min-width:0;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;padding:9px 10px;font-size:15px}#karBox .ksr button{border:0;border-radius:10px;background:#ff4fd8;color:#fff;font-weight:900;padding:0 14px;cursor:pointer}"
 +"#karBox .kls{flex:1;overflow:auto;margin-top:8px;padding-bottom:16px;-webkit-overflow-scrolling:touch}#karBox .kit{display:flex;align-items:center;gap:8px;padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}#karBox .kit.on{background:rgba(255,79,216,.16);border-radius:10px}#karBox .kit img{width:24px;height:24px;border-radius:50%;flex:0 0 auto}#karBox .kit span{flex:1;font-size:14.5px;font-weight:700;line-height:1.3}#karBox .kit i{font-style:normal;font-size:12px;opacity:.6}"
 +"#karBox .kit b.kyt{font-weight:800;color:#ff8080;margin-right:4px}#karBox .kov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:rgba(0,0,0,.82);font-weight:800;z-index:2}#karBox .kov a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:900}#karBox .kst{font-size:13px;opacity:.75;padding:10px 4px}";
st.textContent+="#karBox .kpay{display:flex;align-items:center;gap:10px;margin:10px 0 2px;background:linear-gradient(180deg,#2a2440,#16121f);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}"
 +"#karBox .kpay .kr{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:8px;row-gap:2px;line-height:1.25}#karBox .kpay .kr b{font-size:15px;color:#ffe066;text-shadow:0 0 6px rgba(255,200,60,.6)}#karBox .kpay .kr small{font-size:11.5px;opacity:.75}"
 +"#karBox .kpay .kl{cursor:pointer;font:800 13px/1.2 ui-monospace,Consolas,monospace;color:#7CFFB2;background:#05140c;border:1px solid #1d6b43;border-radius:6px;padding:5px 8px;text-shadow:0 0 6px #2bd97d}"
 +"#karBox .kslot{margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:linear-gradient(180deg,#5a5f6b,#2c2f36);border-radius:10px;padding:6px 14px 7px;cursor:pointer;box-shadow:0 2px 0 #111,inset 0 1px 0 rgba(255,255,255,.25)}"
 +"#karBox .kslot i{display:block;width:44px;height:7px;border-radius:4px;background:#000;box-shadow:inset 0 2px 3px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.2)}#karBox .kslot span{font:900 12px/1 system-ui,sans-serif;letter-spacing:.12em;color:#fff}#karBox .kslot small{font-size:10px;color:#cfd3dc;font-weight:600}"
 +"#karBox .kpm{position:absolute;inset:0;z-index:5;background:rgba(5,3,10,.78);display:flex;align-items:center;justify-content:center;padding:16px}#karBox .kpm>div{width:min(360px,100%);background:#1d1830;border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}"
 +"#karBox .kpm h3{margin:0;font-size:17px}#karBox .kpm .ksel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#karBox .kpm .ksel button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:9px 0;font-weight:900;cursor:pointer}#karBox .kpm .ksel button.on{background:#ff4fd8;border-color:#ff4fd8}"
 +"#karBox .kpm .kt{display:flex;justify-content:space-between;font-size:18px;font-weight:900}#karBox .kpm .kgo{border:0;border-radius:12px;padding:12px;background:#ffe066;color:#1a1300;font-size:16px;font-weight:900;cursor:pointer}#karBox .kpm .kc{border:0;background:none;color:#cfc6e8;font-weight:700;cursor:pointer}#karBox .kpm .km{font-size:12.5px;color:#cfc6e8;line-height:1.5;margin:0}"
 +"#karBox .kntl{display:block;flex:0 0 auto;white-space:nowrap;margin:0 0 0 auto;border:0;background:none;color:#cfc6e8;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:2px 4px}"
 +"#karBox .kpm.kntc{z-index:6}#karBox .kpm.kntc>div{max-height:100%;overflow:auto}#karBox .kpm ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;font-size:13.5px;line-height:1.5;color:#efe6ff}#karBox .kpm .kra{color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline}#karBox .kpm .kpp{border:0;background:none;padding:0;text-align:left;font-size:12.5px;color:#ffe066;text-decoration:underline;cursor:pointer;line-height:1.4}";
st.textContent+="#karBox .kpm .klf{font:800 15px/1.3 system-ui,sans-serif;color:#7CFFB2}#karBox .kpm .ksg{font-size:13px;color:#efe6ff;line-height:1.5}#karBox .kpm .ksgb{border:0;background:none;padding:0 0 0 4px;color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer}"
 +"#karBox .kpm .krf{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px;font-size:14px;font-weight:800;cursor:pointer}#karBox .kpm .kq{margin:0;font-size:14.5px;line-height:1.55;color:#efe6ff}";
st.textContent+="#karBox .kpol2{display:flex;align-items:center;gap:8px;margin:2px 0 0}#karBox .kpol2 span{flex:1;font-size:11.5px;line-height:1.35;color:#cfc6e8}#karBox .kpay .kbuyb{margin-left:auto}#karBox .kpay .kbuyb+.kslot{margin-left:0}#karBox .kpay{display:grid!important;grid-template-columns:1fr auto;grid-template-areas:'kr kl' 'kr ks';column-gap:8px;row-gap:5px;align-items:center;padding-top:6px;padding-bottom:6px}#karBox .kpay .kr{grid-area:kr}#karBox .kpay .kl{grid-area:kl;justify-self:end;padding:3px 7px;font-size:12px}#karBox .kpay .kslot{grid-area:ks;justify-self:end;margin-left:0!important;padding:4px 10px 5px;gap:2px}#karBox .kpay .kslot i{width:34px;height:5px}#karBox .kpay .kslot span{font-size:11px}#karBox .kpay .kslot small{font-size:9px}#karBox .kbuyb{flex:0 0 auto;border:0;border-radius:999px;padding:8px 14px;background:#ffe066;color:#1a1300;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 0 10px rgba(255,224,102,.45)}"
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
st.textContent+="#karBox .kpg{position:absolute;inset:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;overflow:hidden}#karBox .kpgh{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:10px 12px 8px;padding-top:max(10px,env(safe-area-inset-top));border-bottom:1px solid rgba(255,255,255,.1)}#karBox .kpbk{flex:0 0 auto;width:38px;height:38px;border:0;border-radius:12px;background:rgba(255,255,255,.07);padding:5px;cursor:pointer;display:flex;align-items:center;justify-content:center}#karBox .kpbk img{width:26px;height:26px;display:block}#karBox .kpgt{flex:1;min-width:0;display:flex;gap:6px;align-items:center}#karBox .kpgt h3{margin:0;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpgt button{flex:1;min-width:0;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;font-size:13.5px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpgt button.on{background:#ff4fd8;border-color:#ff4fd8}#karBox .kpgb{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 12px max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px}#karBox .kpgb>*{flex:0 0 auto;width:100%;max-width:640px;align-self:center;box-sizing:border-box}#karBox .kic{width:20px;height:20px;flex:0 0 auto;vertical-align:middle}#karBox .kic.s{width:14px;height:14px}#karBox .kpf{display:flex;gap:12px;align-items:flex-start}#karBox .kpfv{position:relative;flex:0 0 auto;width:min(36vw,150px);aspect-ratio:3/4;border:2px solid #ffe066;border-radius:14px;overflow:hidden;background:#000;padding:0;cursor:pointer}#karBox .kpfv video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}#karBox .kpfe{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.45}#karBox .kpfe .kic{width:44px;height:44px}#karBox .kpfc{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.62);color:#fff;font:800 11.5px/1 system-ui,sans-serif;padding:6px 0;text-align:center}#karBox .kpfi{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;padding-top:2px}#karBox .kpr{display:flex;align-items:center;gap:7px;font-size:13px;min-width:0}#karBox .kpr span{flex:1;min-width:0;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kpr b{font-size:15px}#karBox .kpr.kpn b{flex:1;min-width:0;font-size:16px;color:#ffe066;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#karBox .kln{border:1px solid #ffe066;background:none;color:#ffe066;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap}#karBox .ksrt{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;font-weight:800}#karBox .ksrt button{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 12px;font-weight:800;font-size:12.5px;cursor:pointer;white-space:nowrap}#karBox .krows{display:flex;flex-direction:column;gap:8px}#karBox .krow{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px;cursor:pointer;min-width:0}#karBox .krd{flex:0 0 auto;width:62px;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}#karBox .krd b{font-size:13.5px}#karBox .krd small{font-size:10.5px;opacity:.65;line-height:1.3}#karBox .krs{flex:0 0 auto;width:46px;align-self:stretch;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-left:1px solid rgba(255,255,255,.14);border-right:1px solid rgba(255,255,255,.14);margin-left:-4px}#karBox .krs b{font-size:21px;font-weight:900;line-height:1;color:#ffe066;font-variant-numeric:tabular-nums}#karBox .krs b.kna{color:rgba(255,255,255,.45)}#karBox .krs small{font-size:10.5px;opacity:.7;line-height:1.2}#karBox .kvf u{position:absolute;top:54px;left:50%;transform:translateX(-50%);text-decoration:none;font:900 18px/1 system-ui,sans-serif;color:#ffe066;background:rgba(0,0,0,.45);padding:6px 12px;border-radius:999px;font-variant-numeric:tabular-nums;text-shadow:0 0 8px rgba(255,224,102,.6)}#karBox .kpvs{margin:-4px 0 8px;font-weight:900;color:#ffe066}#karBox .kpvs b{font-size:20px}#karBox .kscr{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(8,4,20,.86);cursor:pointer;animation:kscIn .25s ease-out}#karBox .kscr::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:0}#karBox .kscr.kdone::before{background:radial-gradient(circle at 50% 50%,rgba(255,224,102,.55),rgba(255,79,216,.25) 35%,transparent 65%);animation:kfl 1.2s ease-out forwards}#karBox .kscw{position:relative;text-align:center;color:#fff}#karBox .kscw small{display:block;font-weight:900;font-size:18px;letter-spacing:.08em;color:#ffb3ef;margin-bottom:6px}#karBox .kscw b{display:inline-block;font:900 128px/1 system-ui,sans-serif;color:#ffe066;font-variant-numeric:tabular-nums;text-shadow:0 0 18px rgba(255,224,102,.7),0 0 40px rgba(255,79,216,.55)}#karBox .kscw i{font-style:normal;font-weight:900;font-size:34px;color:#ffe066;margin-left:6px}#karBox .kscr.kdone b{animation:kscPop .6s cubic-bezier(.2,1.6,.4,1),kscGl .9s ease-in-out .6s infinite alternate}@keyframes kscIn{from{opacity:0}to{opacity:1}}@keyframes kscPop{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}@keyframes kscGl{from{text-shadow:0 0 18px rgba(255,224,102,.7),0 0 40px rgba(255,79,216,.55)}to{text-shadow:0 0 26px #fff,0 0 60px #ffe066,0 0 100px #ff4fd8}}#karBox .krm{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}#karBox .krm p{margin:0;font-size:13.5px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all;overflow-wrap:break-word}#karBox .krm small{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.5px;opacity:.85}#karBox .krm .kst2{display:inline-flex;align-items:center;gap:3px}#karBox .krm .knk{color:#ffe066;font-weight:800;max-width:9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#karBox .ktg{display:inline-block;border:1px solid rgba(255,255,255,.4);border-radius:6px;padding:1px 5px;font:800 10.5px/1.3 system-ui,sans-serif;color:#cfc6e8}#karBox .ktg.p{border-color:#7CFFB2;color:#7CFFB2}#karBox .krv{flex:0 0 auto;width:54px;aspect-ratio:3/4;object-fit:cover;background:#000;border-radius:8px;pointer-events:none}#karBox .kdv{width:100%;max-height:62vh;background:#000;border-radius:12px;display:block}#karBox .kdm{font-size:12.5px;color:#cfc6e8}#karBox .kdm b{color:#ffe066}#karBox .kdr{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#karBox .kdr button,#karBox .kdr .kvw{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:6px 14px;font-weight:900;font-size:14px;cursor:pointer}#karBox .kdr button.on{background:rgba(255,224,102,.22);border-color:#ffe066}#karBox .kdr .kvw{cursor:default;border-style:dashed}#karBox .kbx{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}#karBox .kbx h4{margin:0;font-size:14px;display:flex;align-items:center;gap:6px}#karBox .kbx p{margin:0;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word}#karBox .kbx .kdim{opacity:.6}#karBox .kbx textarea{width:100%;min-height:68px;resize:vertical;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.3);color:#fff;border-radius:10px;padding:8px;font:inherit;font-size:14px;box-sizing:border-box}#karBox .kbr{display:flex;gap:6px;justify-content:flex-end;align-items:center}#karBox .kbr small{margin-right:auto;opacity:.6;font-size:11.5px}#karBox .kbt{border:0;border-radius:10px;padding:7px 14px;font-weight:900;font-size:13.5px;cursor:pointer;background:#ffe066;color:#1a1300}#karBox .kbt.g{background:rgba(255,255,255,.1);color:#fff}#karBox .kbt.r{background:rgba(201,42,42,.2);color:#ffb0b0;border:1px solid rgba(255,120,120,.6);padding:10px}#karBox .kcm{display:flex;flex-direction:column;gap:3px;padding:7px 0;border-top:1px solid rgba(255,255,255,.08)}#karBox .kch{display:flex;gap:6px;align-items:center;font-size:12px}#karBox .kch b{color:#ffe066}#karBox .kch small{opacity:.6}#karBox .kch button{margin-left:auto;border:0;background:none;color:#ffb0b0;font-size:11.5px;cursor:pointer;text-decoration:underline}#karBox .kpkp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#karBox .kpkp button{position:relative;padding:0;border:2px solid transparent;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:3/4;cursor:pointer}#karBox .kpkp button.on{border-color:#ffe066}#karBox .kpkp video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}#karBox .kpkp small{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);color:#fff;font-size:10.5px;padding:3px 0}#karBox .kpg .kpm{z-index:30}#karBox .kni{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:10px;padding:10px;font-size:16px;font-weight:800}#karBox .ksoon{z-index:60}";
// 팔로우 단추·ID 누르기·팔로워 목록 (10-30)
st.textContent+="#karBox .ktg.f{border-color:#8fc7ff;color:#8fc7ff}#karBox .kfw{flex:0 0 auto;border:1px solid #ff4fd8;background:#ff4fd8;color:#fff;border-radius:999px;padding:4px 11px;font-weight:900;font-size:12px;cursor:pointer;white-space:nowrap}#karBox .kfw.on{background:none;color:#ffb3ef}#karBox .kfw:disabled{opacity:.6}"
 +"#karBox .kun{border:0;background:none;padding:0;margin:0;font:inherit;color:#ffe066;font-weight:800;cursor:pointer;text-decoration:underline;text-underline-offset:2px;max-width:12em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}#karBox .kdm{display:flex;flex-wrap:wrap;align-items:center;gap:6px}"
 +"#karBox .kpr.kfl2{cursor:pointer}#karBox .kpr.kfl2 b{text-decoration:underline;text-underline-offset:2px}#karBox .kpfv.kro{cursor:default}#karBox .kfls{display:flex;flex-direction:column;gap:6px}#karBox .kfls button{display:flex;align-items:center;gap:8px;text-align:left;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#ffe066;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px;cursor:pointer}";
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
  var m0=pl.querySelector(".kmsg"); if(m0) m0.remove();
  if(x.e===0){ blocked(x); return; }   // 퍼가기 막힌 곡 — 앱 안에서 안 틀고 유튜브로 (허브가 oEmbed 로 미리 확인)
  ov('<div>'+esc(L(TX.lo))+'</div>',"lo"); K.want=x.id;
  ytApi(function(){ if(!box()) return;
    if(K.pl){ if(K.ready) K.pl.loadVideoById(x.id); return; }   // 플레이어는 하나만 — 곡마다 새로 만들지 않는다
    var d=document.createElement("div"); d.id="karYt"; pl.insertBefore(d,pl.firstChild);
    K.pl=new YT.Player("karYt",{videoId:x.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:function(){ K.ready=true; if(K.want&&K.pl.getVideoData&&K.pl.getVideoData().video_id!==K.want) K.pl.loadVideoById(K.want); },
      onError:function(){ var c=K.items&&K.items[K.idx]; if(c){ c.e=0; paintList(); blocked(c); } },   // 미리 못 잡은 막힌 곡도 그 자리에서 안내 (다음 곡으로 안 넘김)
      onStateChange:function(ev){ if(ev&&ev.data===1){ ov("","lo"); ov("","up"); } if(ev&&ev.data===0) ov('<div>'+esc(L(TX.upQ))+'</div><button type="button" class="kupb" '+(isOwn()?'data-kup="1"':'data-ksoon="1"')+'>'+esc(L(TX.up))+'</button>',"up"); try{ klState(ev&&ev.data); }catch(e){} } }}); }); }
function open(code){ try{ if(PG.length) pgTo(0); }catch(e){} var D=window.GU&&GU.d, o=D&&D.kara&&D.kara[code]; K.code=code; K.q=""; K.idx=-1; K.pl=null; K.ready=false; K.want=""; var old=box(); if(old) old.remove();
  var gn=o&&window.LP?LP(o.n):(o?o.g:""), b=document.createElement("div"); b.id="karBox";
  b.innerHTML='<div class="kin"><div class="khd"><div><b>'+esc(L(TX.t))+(gn?' · '+esc(gn):'')+'</b><small>'+esc(L(TX.s))+'</small></div><button type="button" class="kx">✕ '+esc(L(TX.x))+'</button></div>'
    // 채널 단추 줄은 뺐다 (사장님 10-30 「삭제」)
    +'<div class="kpl"><button type="button" class="krec">'+esc(L(TX.rec))+'</button><div class="kmsg">🎤 '+esc(L(TX.pick))+'</div></div>'
    +'<div class="kpay"><div class="kr"><b>'+esc(L(TX.kb))+'</b><small>'+esc(L(TX.kbs))+'</small></div><button type="button" class="kl" id="karLeft">'+esc(L(TX.lgin))+'</button><button type="button" class="kslot" data-kpay="1" aria-label="PAYMENT"><i></i><span>PAYMENT</span><small>'+esc(L(TX.slot))+'</small></button></div>'
    +'<div class="kpol2"><button type="button" class="kntl" data-kntc="1">'+esc(L(TX.ntc))+'</button></div>'   // 「곡 이용권 사기」 단추는 뺐다 — PAYMENT 와 같은 창 (사장님 10-30 「삭제」)
    +'<div class="ktb">'+TABS.map(function(t){ return '<button type="button" data-t="'+t[0]+'"'+(t[0]===K.tab?' class="on"':'')+'>'+t[1]+'</button>'; }).join("")+'<button type="button" class="kstg">'+esc(L(TX.stgB))+'</button></div>'
    +'<form class="ksr"><input type="search" placeholder="'+esc(L(TX.q))+'"><button type="submit">'+esc(L(TX.go))+'</button></form>'
    +'<div class="kls"></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".kx").onclick=close;
  [].forEach.call(b.querySelectorAll("[data-kpay]"),function(x){ x.onclick=function(){ payOpen(""); }; });
  b.querySelector("[data-kntc]").onclick=ntcOpen;
  b.querySelector(".kstg").onclick=function(){ stageOpen("all"); };
  b.querySelector(".krec").onclick=function(){ var own=false; try{ own=!!localStorage.getItem("mp_owner"); }catch(e){}   // 실제 녹화는 사장님 기기에서만 시험 (10-30) — 손님은 화면 효과 + 「준비 중」
    if(b.classList.contains("krecm")){ if(own) recStop(); else recExit(); return; } b.classList.add("krecm"); this.textContent=L(TX.recX); if(own) recStart(); else { recFx(true); soon(); } };   // 녹화 = 노래방 영상 화면만 테두리째 화면 가득 (사장님 10-30) · 실제 녹화는 준비 중
  b.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-ksoon]")){ e.preventDefault(); e.stopPropagation(); soon(); } });   // 녹화·올리기 = 아직 준비 중 (10-30)
  b.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-kup]")){ e.preventDefault(); e.stopPropagation(); upStart(); } });   // 내 노래 올리기 — 사장님 기기 시험판 (10-30)
  b.querySelector("#karLeft").onclick=signIn;   // 초록 칸 = 로그인 전엔 로그인 창, 로그인 뒤엔 계정 창(로그아웃) (사장님 10-30)
  [].forEach.call(b.querySelectorAll("[data-kch]"),function(a){ a.addEventListener("click",function(){ mpPaid.out(); }); });
  [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(t){ t.onclick=function(){ K.tab=t.dataset.t; K.q=""; b.querySelector(".ksr input").value=""; [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(x){ x.classList.toggle("on",x===t); }); load(); }; });
  b.querySelector(".ksr").onsubmit=function(e){ e.preventDefault(); K.q=String(b.querySelector(".ksr input").value||"").trim(); [].forEach.call(b.querySelectorAll(".ktb button[data-t]"),function(x){ x.classList.toggle("on",!K.q&&x.dataset.t===K.tab); }); load(); };
  mpPaid.start("kara_"+code); load(); barPaint(); karcLoad(); }
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
function karcLoad(){ var s=sess(), u=HUB+"/shop/karc", o=s?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sess:s})}:{};
  return fetch(u,o).then(function(r){ return r.json(); }).then(function(j){ if(!(j&&j.ok)) return;
    if(Array.isArray(j.packs)&&j.packs.length) KB.packs=j.packs; KB.sess=s?(j.sess?1:0):-1; KB.left=+j.left||0; barPaint(); if(KB.redraw) KB.redraw(); }).catch(function(){}); }
function won(v){ return "₩"+Math.round(v).toLocaleString("ko-KR"); }
function tf(t,o){ return String(t).replace(/\{(\w+)\}/g,function(m,k){ return o[k]!=null?o[k]:m; }); }
function fmtN(t,n){ return tf(t,{n:n}); }
function songsTx(n){ return tf(L(n===1?TX.sN1:TX.sN),{n:n}); }
function pkName(x){ return x.b?x.n+"+"+x.b:songsTx(x.n); }   // 3+1 · 1곡
function perSong(x){ var v=x.p/(x.n+x.b); return (v%1?"≈":"")+won(v); }
function bizHtml(){ var z=TX.bz[window.LANG]||TX.bz.en, lg=TX.bz[window.LANG]?window.LANG:"en";
  return '<div class="kbz"><b>'+esc(z[0])+'</b><br><span class="nw">'+esc(z[1])+'</span> · <span class="nw">'+esc(z[2])+' '+esc(z[3])+'</span><br>'+esc(z[4])+' <span class="nw">297-81-03712</span><br>'+esc(z[5])+': '+esc(z[6])+'<br>'+esc(z[7])+': '+esc(z[8])+'<br>'+esc(z[9])+': admin@moneypuzzle.co.kr'+'<br>'+esc(L(TX.bzh))+': GitHub, Inc. · Cloudflare, Inc.<br>'+esc(L(TX.bzn))
    +'<div class="kbzl"><a href="terms.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+'</a> · <a href="refund.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+'</a> · <a href="privacy.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.pL))+'</a>'+(window.KAR_SITE?' · <a href="legal.html?lang='+lg+'" target="_blank" rel="noopener">'+esc(L(TX.gL))+'</a>':'')+'</div></div>'; }
// 노래방 화면의 곡 이용권 칸 (남은 곡 표시)
function barPaint(){ var b=box(), el=b&&b.querySelector("#karLeft"); if(!el) return; el.textContent=karSigned()?fmtN(L(TX.lftN),karLeft()):L(TX.lgin); }
// 로그인 창(pg.js)을 노래방 위에 띄운다 — 닫히면 원래 높이로 돌리고 결제 창을 다시 그린다(로그인하면 남은 곡 표시)
function signIn(){ if(!window.mpPG||!mpPG.open) return; mpPG.open(); var p=document.getElementById("pgBox"); if(!p) return; p.style.zIndex="2147483006";
  if(!p._karMo&&window.MutationObserver){ p._karMo=new MutationObserver(function(){ if(!p.hidden) return; p.style.zIndex=""; KB.sess=-1; karcLoad(); var b=box(); if(b&&b.querySelector(".kpm:not(.kntc)")) payOpen(KB.k_go?"co":""); }); p._karMo.observe(p,{attributes:true,attributeFilter:["hidden"]}); } }
function tsdk(){ return new Promise(function(ok,no){ if(window.TossPayments) return ok(); var s=document.createElement("script"); s.src=TSDK; s.onload=function(){ ok(); }; s.onerror=no; document.head.appendChild(s); }); }
function ss(k,v){ try{ if(v===undefined) return JSON.parse(sessionStorage.getItem(k)||"null"); if(v===null) sessionStorage.removeItem(k); else sessionStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
// mode: "" 묶음 고르기 · "co" 확인·결제 · "paid" 결제 완료(res) · "rq" 환불 요청 확인 · "done" 환불 요청 접수
function payOpen(mode0,res){ var b=box(); if(!b) return; var o=b.querySelector(".kpm:not(.kntc)"); if(o) o.remove(); var mode=typeof mode0==="string"?mode0:"", agd=false;
  o=document.createElement("div"); o.className="kpm kbuy"; b.appendChild(o);
  if(!mode){ try{ ntap("kara_pay","open"); }catch(e){} }
  var ut='<span class="kut">UNDER TESTING</span>';
  var cur={msg:"",busy:0};
  var draw=function(msg,busy){ cur={msg:msg||"",busy:busy||0}; var sg=karSigned(), left=karLeft(), P=KB.packs, x=P[KB.k]||P[0];
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
      o.innerHTML='<div><div class="kstamp" aria-hidden="true">UNDER TESTING</div><h3>'+esc(L(TX.pdT))+ut+'</h3>'
        +'<div class="krow"><span>'+esc(L(TX.sel))+'</span><b>'+esc(L(TX.kb))+' '+esc(pkName(px))+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.rcv))+'</span><b>'+esc(songsTx(px.n+px.b))+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.oid))+'</span><b>'+esc(res.oid)+'</b></div>'
        +'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(res.amount)+'</span></div>'
        +'<div class="kdone">'+esc(L(TX.tdone))+'</div><p class="km">'+esc(L(TX.polS))+'</p>'
        +'<button type="button" class="kgo kcl">'+esc(L(TX.ok))+'</button>'+bizHtml()+'</div>';
      o.querySelector(".kcl").onclick=function(){ o.remove(); KB.redraw=null; }; return; }
    if(mode==="co"){   // 확인·구매자 정보·결제 수단·동의 → 결제하기
      if(!sg){ mode=""; draw(L(TX.sgn)); return; }
      o.innerHTML='<div><div class="kstamp" aria-hidden="true">UNDER TESTING</div><h3>'+esc(L(TX.kb))+' · '+esc(L(TX.pay))+ut+'</h3>'
        +'<div class="krow"><span>'+esc(L(TX.sel))+'</span><b>'+esc(pkName(x))+(x.b?' <em class="ksv">'+esc(tf(L(TX.svc),{b:x.b}))+'</em>':'')+'</b></div>'
        +'<div class="krow"><span>'+esc(L(TX.rcv))+'</span><b>'+esc(songsTx(x.n+x.b))+' · '+esc(tf(L(TX.per),{w:perSong(x)}))+'</b></div>'
        +'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(x.p)+'</span></div>'
        +'<p class="km">'+esc(L(TX.polS))+'<br>'+esc(L(TX.keep))+'</p>'
        +'<b class="kh">'+esc(L(TX.cu))+'</b>'
        +'<label class="kfl">'+esc(L(TX.cn))+'<input type="text" id="kbN" maxlength="40" autocomplete="name" value="'+esc(KB.cn)+'"></label>'
        +'<label class="kfl">'+esc(L(TX.cp))+'<input type="tel" id="kbP" maxlength="30" autocomplete="tel" value="'+esc(KB.cp)+'"></label>'
        +'<label class="kfl">'+esc(L(TX.ce))+'<input type="email" id="kbE" maxlength="100" autocomplete="email" value="'+esc(KB.ce)+'"></label>'
        +'<p class="km">'+esc(L(TX.cpn))+'</p>'
        +'<b class="kh">'+esc(L(TX.pm))+'</b><label class="kfr"><input type="radio" checked> '+esc(L(TX.card))+'</label>'
        +'<label class="kfr"><input type="checkbox" id="kbAg"> '+esc(L(TX.agr))+'</label>'
        +'<div class="klk"><a href="terms.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.tL))+' ›</a> <a href="refund.html?lang='+esc(window.LANG||"en")+'" target="_blank" rel="noopener">'+esc(L(TX.rL))+' ›</a></div>'
        +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
        +'<p class="ktst">'+esc(L(TX.test))+'</p>'
        +'<button type="button" class="kgo" id="kbGo" disabled>'+(busy?esc(L(busy===2?TX.opn:TX.sav)):won(x.p)+' '+esc(L(TX.pay)))+'</button>'
        +'<button type="button" class="kc" id="kbX">'+esc(L(TX.back))+'</button>'+bizHtml()+'</div>';
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
    // 묶음 고르기 (누구나 볼 수 있음 · 사려면 로그인)
    o.innerHTML='<div><h3>'+esc(L(TX.kb))+ut+'</h3>'
    +'<p class="km kpol">'+esc(L(TX.pol))+'</p>'
    +(sg?'<div class="klf">'+esc(fmtN(L(TX.lftN),left))+'</div>':'<div class="ksg">'+esc(L(TX.sgi))+'<button type="button" class="ksgb">'+esc(L(TX.sgb))+'</button></div>')
    +'<div class="kpks">'+P.map(function(q,i){ return '<button type="button" data-pk="'+i+'" class="kpk'+(i===KB.k?" on":"")+'"><b>'+esc(pkName(q))+'</b>'
      +(q.b?'<em class="ksv">'+esc(tf(L(TX.svc),{b:q.b}))+'</em>':'<em class="ksv ksv0">&nbsp;</em>')
      +'<span class="kpp1">'+won(q.p)+'</span><small>'+esc(songsTx(q.n+q.b))+' · '+esc(tf(L(TX.per),{w:perSong(q)}))+'</small></button>'; }).join("")+'</div>'
    +'<p class="km">'+esc(L(TX.keep))+'</p>'
    +'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(x.p)+'</span></div>'
    +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
    +'<button type="button" class="kgo" id="kbNx">'+esc(L(TX.nxt))+' — '+esc(pkName(x))+' · '+won(x.p)+'</button>'
    +(sg&&left>=1?'<button type="button" class="krf">'+esc(fmtN(L(TX.rfb),left))+'</button>':'')
    +'<button type="button" class="kpp" data-kntc="1">'+esc(L(TX.ntcP))+'</button><p class="ktst">'+esc(L(TX.test))+'</p><button type="button" class="kc">'+esc(L(TX.cancel))+'</button>'+bizHtml()+'</div>';
    [].forEach.call(o.querySelectorAll("[data-pk]"),function(y){ y.onclick=function(){ KB.k=+y.dataset.pk; draw(); }; });
    o.querySelector("#kbNx").onclick=function(){ if(!karSigned()){ draw(L(TX.sgn)); signIn(); return; } mode="co"; agd=false; try{ ntap("kara_pay","pick_"+(x.n+x.b)); }catch(e){} draw(); };
    var sb=o.querySelector(".ksgb"); if(sb) sb.onclick=signIn;
    var rb=o.querySelector(".krf"); if(rb) rb.onclick=function(){ mode="rq"; draw(); };
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
// 공지사항 창 — 곡 이용권 가격·보관·환불 규칙. 노래방 안에서 열리고, 결제 창 위에 겹쳐도 닫으면 결제 창으로 돌아간다
// 녹화 화면 효과 — 카메라 뷰파인더(네 귀퉁이)·깜박이는 ● REC 시간·찰칵 플래시 (사장님 10-30 「카메라로 찍는 효과」) · 실제 녹화는 아직
var RECT=0;
function recFx(on){ var b=box(); if(!b) return; var pl=b.querySelector(".kpl"); if(!pl) return; var v=pl.querySelector(".kvf"); if(v) v.remove(); clearInterval(RECT); if(!on) return;
  v=document.createElement("div"); v.className="kvf"; v.innerHTML='<i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><b><em></em> REC <span>00:00</span></b>'+(KSC?'<u>♪ 0</u>':''); pl.appendChild(v);
  var t0=Date.now(), sp=v.querySelector("span"), su=v.querySelector("u"); RECT=setInterval(function(){ if(!v.parentNode){ clearInterval(RECT); return; } var x=Math.floor((Date.now()-t0)/1000); sp.textContent=("0"+Math.floor(x/60)).slice(-2)+":"+("0"+x%60).slice(-2); if(su&&KSC) su.textContent="♪ "+kScCalc(KSC,(Date.now()-KSC.t0)/1000); },1000);   // ♪ 지금까지 점수 1초마다 (사장님 10-30)
  var f=document.createElement("div"); f.className="kflash"; pl.appendChild(f); setTimeout(function(){ f.remove(); },450); }
// 「준비 중」 잠깐 안내 (10-30)
function soon(msg){ var b=box(); if(!b) return; var o=b.querySelector(".ksoon"); if(o) o.remove(); o=document.createElement("div"); o.className="ksoon"; o.textContent=typeof msg==="string"?msg:L(TX.soon); b.appendChild(o); setTimeout(function(){ if(o.parentNode) o.remove(); },typeof msg==="string"?4000:2200); }
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
      var db=20*Math.log(Math.sqrt(sq/N)+1e-9)/Math.LN10; k.n++;
      if(db>-42){ k.v++; k.cur++; k.q+=db<-32?0.3+0.7*(db+42)/10:db<=-6?1:Math.max(0.3,1-(db+6)/10); if(pk>0.985) k.c++; }   // 소리 냄 = -42dB 위 · 알맞은 크기 -32~-6dB
      else if(k.cur){ k.rn++; k.cur=0; } },100);
  }catch(e){ kScStop(); } }
function kScCalc(k,dur){ if(!k||k.n<5) return 0;
  var vr=k.v/k.n, lq=k.v?k.q/k.v:0, clip=k.v?k.c/k.v:0, runs=k.rn+(k.cur?1:0), cont=Math.min(1,(k.v*0.1/Math.max(1,runs))/2.5);   // 이어 부르기 = 소리 덩어리 평균 2.5초면 만점
  var raw=0.4*Math.min(1,vr/0.65)+0.35*lq+0.25*cont-Math.min(0.3,clip*1.5); raw=Math.max(0,Math.min(1,raw));
  var s=55+42*Math.pow(raw,0.8);   // 노래방 기계처럼 기분 좋은 점수대
  if(vr<0.15) s=25+(s-25)*vr/0.15;   // 거의 안 불렀으면 낮게
  if(dur<15) s=Math.min(s,30+dur*2);   // 15초 미만 = 낮게
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
function camOff(){ kScStop(); try{ if(REC.st) REC.st.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} REC.st=null; var b=box(), v=b&&b.querySelector(".kcam"); if(v) v.remove(); }
function recExit(){ camOff(); recFx(false); var b=box(); if(!b) return; b.classList.remove("krecm"); var k=b.querySelector(".krec"); if(k) k.textContent=L(TX.rec); }
function recStart(){ var b=box(), pl=b&&b.querySelector(".kpl"); if(!pl) return;
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)){ soon(L(TX.recNo)); recExit(); return; }
  kAC(); REC.sc=null;   // 아이폰은 누른 순간에 소리판을 깨워야 점수 재기·팡파레가 된다
  navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(st){
    if(!b.classList.contains("krecm")||!box()){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
    REC.st=st; var v=document.createElement("video"); v.className="kcam"; v.muted=true; v.autoplay=true; v.playsInline=true; v.setAttribute("playsinline",""); v.srcObject=st; pl.insertBefore(v,pl.firstChild); try{ v.play(); }catch(e){}
    var mt=["video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].filter(function(x){ try{ return MediaRecorder.isTypeSupported(x); }catch(e){ return false; } })[0]||"";
    REC.ch=[]; REC.mt=mt; try{ REC.mr=mt?new MediaRecorder(st,{mimeType:mt}):new MediaRecorder(st); }catch(e){ soon(L(TX.recNo)); recExit(); return; }
    REC.mr.ondataavailable=function(e){ if(e.data&&e.data.size) REC.ch.push(e.data); }; REC.mr.onstop=recDone; REC.mr.start(1000); REC.t0=Date.now();
    kScStart(st); recFx(true); try{ ntap("kara_rec","tap"); }catch(e){}
  }).catch(function(){ soon(L(TX.recNo)); recExit(); }); }
function recStop(){ try{ K.pl&&K.pl.pauseVideo&&K.pl.pauseVideo(); }catch(e){}   // 녹화 끝 = 노래도 멈춤 (사장님 10-30)
 if(REC.mr&&REC.mr.state!=="inactive") REC.mr.stop(); else recExit(); }
function recDone(){ var blob=new Blob(REC.ch,{type:(REC.mt||"video/webm").split(";")[0]}); REC.blob=blob; REC.dur=REC.t0?Math.round((Date.now()-REC.t0)/1000):0; REC.sc=KSC?kScCalc(KSC,REC.dur):null; REC.t0=0; REC.mr=null; REC.ch=[]; camOff(); recFx(false); var b=box(); if(!b) return;
  if(REC.url) try{ URL.revokeObjectURL(REC.url); }catch(e){} REC.url=URL.createObjectURL(blob);
  var o=document.createElement("div"); o.className="kpm kpv"; b.appendChild(o);
  o.innerHTML='<div><h3>'+esc(L(TX.pvT))+'</h3>'+(REC.sc!=null?'<div class="kpvs">♪ '+esc(L(TX.scT))+' <b>'+REC.sc+'</b>'+esc(L(TX.scPt))+'</div>':'')+'<video controls playsinline src="'+REC.url+'"></video><p class="km">'+esc(L(isOwn()?TX.pvN2:TX.pvN))+'</p><button type="button" class="kupb" '+(isOwn()?'data-kup="1"':'data-ksoon="1"')+'>'+esc(L(TX.up))+'</button><button type="button" class="krf" data-rt="1">'+esc(L(TX.retk))+'</button><button type="button" class="kc">'+esc(L(TX.back))+'</button></div>';
  var bye=function(){ o.remove(); try{ URL.revokeObjectURL(REC.url); }catch(e){} REC.url=""; REC.blob=null; REC.sc=null; var u=b.querySelector(".kupm"); if(u) u.remove(); };
  o.querySelector(".kc").onclick=function(){ bye(); recExit(); };
  o.querySelector("[data-rt]").onclick=function(){ bye(); b.classList.add("krecm"); recStart(); };
  if(REC.sc!=null) kScShow(b,REC.sc); }
window.addEventListener("pagehide",function(){ try{ if(REC.mr&&REC.mr.state!=="inactive") REC.mr.stop(); }catch(e){} camOff(); });
// 가요무대(모두의 노래 피드) · 내 가요무대(내가 올린 노래) (사장님 10-30 「노래방의 페이스북·유튜브」)
//   손님 기기 = 자리만(「곧 열립니다」) · 사장님 기기(mp_owner) = 시험판: 허브 /kst/list 목록·크게 재생·지우기(내 것)·내 노래 올리기
var KOWN="EM2410";   // 시험 기간 사장님 기기 열쇠 (허브 KST_KEY 와 같음)
function isOwn(){ try{ return !!localStorage.getItem("mp_owner"); }catch(e){ return false; } }
function kLoc(){ return {ko:"ko-KR",en:"en-US",ja:"ja-JP",zhs:"zh-CN",zht:"zh-TW",es:"es-ES"}[window.LANG]||"en-US"; }
function kDate(t){ try{ return new Date(t).toLocaleString(kLoc(),{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
// 「내 노래 올리기」 — 녹화 중이면 녹화를 끝내 미리 보기부터 · 방금 찍은 녹화가 있으면 올리기 창 · 없으면 안내
function upStart(){ if(REC.mr&&REC.mr.state!=="inactive"){ recStop(); return; } if(!REC.blob){ soon(L(TX.needRec)); return; } upOpen(); }
function upOpen(){ var b=box(); if(!b||!REC.blob) return; var o=b.querySelector(".kupm"); if(o) o.remove();
  o=document.createElement("div"); o.className="kpm kupm"; b.appendChild(o);
  var vis="pub", busy=false, xhr=null, by0=""; try{ by0=localStorage.getItem("mpv_kst_by")||""; }catch(e){} if(!/^\d{4}$/.test(by0)) by0="";
  var draw=function(msg,pct){ var s=pct!=null;
    o.innerHTML='<div><h3>'+esc(L(TX.up))+'</h3>'
      +'<b class="kh">'+esc(L(TX.vis))+'</b><div class="kupv"><button type="button" data-v="pub"'+(vis==="pub"?' class="on"':'')+'>'+esc(L(TX.vPub))+'</button><button type="button" data-v="fol"'+(vis==="fol"?' class="on"':'')+'>'+esc(L(TX.vFol))+'</button><button type="button" data-v="me"'+(vis==="me"?' class="on"':'')+'>'+esc(L(TX.vMe))+'</button></div>'
      +'<p class="km">'+esc(L(vis==="pub"?TX.vPubN:vis==="fol"?TX.vFolN:TX.vMeN))+'</p>'
      +(by0?'':'<label class="kfl">'+esc(L(TX.by))+'<input type="text" inputmode="numeric" maxlength="4" id="kupBy" autocomplete="bday-year"></label><p class="km">'+esc(L(TX.byN))+'</p>')
      +(msg?'<div class="kerr">'+esc(msg)+'</div>':'')
      +(s?'<div class="kupbar"><i style="width:'+pct+'%"></i></div><div class="kupp">'+esc(tf(L(TX.upIng),{p:pct}))+'</div>':'')
      +'<button type="button" class="kgo" id="kupGo"'+(s?' disabled':'')+'>'+esc(L(TX.upGo))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    [].forEach.call(o.querySelectorAll("[data-v]"),function(x){ x.onclick=function(){ if(busy) return; vis=x.dataset.v; var by=o.querySelector("#kupBy"), keep=by?by.value:""; draw(); var by2=o.querySelector("#kupBy"); if(by2) by2.value=keep; }; });
    o.querySelector(".kc").onclick=function(){ if(xhr){ try{ xhr.abort(); }catch(e){} } o.remove(); };
    o.querySelector("#kupGo").onclick=go; };
  var bar=function(p){ var i=o.querySelector(".kupbar i"), t=o.querySelector(".kupp"); if(!i){ draw("",p); return; } i.style.width=p+"%"; t.textContent=tf(L(TX.upIng),{p:p}); };
  var go=function(){ if(busy) return;
    if(!by0){ var v=String((o.querySelector("#kupBy")||{}).value||"").replace(/\D/g,""), y=new Date().getFullYear();
      if(!/^\d{4}$/.test(v)||+v<1900||+v>y){ draw(L(TX.byE)); return; }
      if(y-(+v)<15){ draw(L(TX.by14)); return; }   // 해만 알므로 생일 전일 수 있다 → 올해 만 14세가 될 사람까지 막는다 (약관 제8조 만 14세 미만)
      by0=v; try{ localStorage.setItem("mpv_kst_by",v); }catch(e){} }
    var bl=REC.blob; if(!bl){ o.remove(); soon(L(TX.needRec)); return; }
    var ty=String(bl.type||REC.mt||"video/webm").split(";")[0]; if(ty!=="video/mp4"&&ty!=="video/webm"){ draw(L(TX.upTy)); return; }
    if(bl.size>60*1024*1024){ draw(L(TX.upBig)); return; }
    var c=K.cur||{}, q="vis="+vis+"&sid="+encodeURIComponent(c.id||"")+"&t="+encodeURIComponent(String(c.t||"").slice(0,120))+"&dur="+(REC.dur||0)+(REC.sc!=null?"&sc="+REC.sc:"")+"&dev="+encodeURIComponent(klDev())+"&sess="+encodeURIComponent(sess());
    busy=true; draw("",0);
    xhr=new XMLHttpRequest(); xhr.open("POST",HUB+"/kst/up?"+q); xhr.setRequestHeader("x-kown",KOWN); xhr.setRequestHeader("Content-Type",ty);
    xhr.upload.onprogress=function(e){ if(e.lengthComputable) bar(Math.min(99,Math.floor(e.loaded*100/e.total))); };
    xhr.onload=function(){ busy=false; var j=null; try{ j=JSON.parse(xhr.responseText); }catch(e){} xhr=null;
      if(j&&j.ok){ try{ ntap("kara_stage","up_"+vis); }catch(e){} o.remove(); var pv=b.querySelector(".kpv"); if(pv) pv.remove(); try{ if(REC.url) URL.revokeObjectURL(REC.url); }catch(e){} REC.url=""; REC.blob=null; REC.sc=null; recExit(); stageOpen("me"); soon(L(TX.upOk)); return; }
      var er=j&&j.err; draw(er==="big"?L(TX.upBig):er==="type"?L(TX.upTy):L(TX.upF)); };
    xhr.onerror=function(){ busy=false; xhr=null; draw(L(TX.upNet)); };
    xhr.onabort=function(){ busy=false; xhr=null; };
    xhr.send(bl); };
  o.onclick=function(e){ if(e.target===o&&!busy) o.remove(); };
  draw(); }
// ── 가요무대·내 가요무대 = 노래방 화면 위를 덮는 전체 화면 페이지 (사장님 10-30 「창·카드 말고 화면 전환」)
//   돌아가기 = 폰 뒤로 버튼(history.pushState + popstate) 과 화면 위 왼쪽 작은 뒤로 화살표(kst_back.png, 나노바나나)
//   페이지가 겹치면(목록 → 영상 상세 → …) PG 에 쌓고, 뒤로 한 번에 한 장씩 닫는다. 투어앱 뒤로 지킴(nvg)과 엉키지 않게 state 에 nvg:1 도 같이 둔다
//   아이콘 = img/kara/kst_*.png (나노바나나로 뽑음 — 코드로 그리지 않는다)
var PG=[];
function pgOpen(cls){ var b=box(); if(!b) return null; var o=document.createElement("div"); o.className="kpg "+(cls||""); o.style.zIndex=String(10+PG.length); b.appendChild(o); PG.push(o);
  o._h=false; try{ history.pushState({nvg:1,kst:PG.length},""); o._h=true; }catch(e){} return o; }
function pgPop(n){ while(PG.length>n){ var o=PG.pop(); try{ [].forEach.call(o.querySelectorAll("video"),function(v){ try{ v.pause(); v.removeAttribute("src"); v.load(); }catch(e){} }); }catch(e){} if(o._bye) try{ o._bye(); }catch(e){} o.remove(); } }
function pgBack(){ if(!PG.length) return; var o=PG[PG.length-1]; if(o._h){ try{ history.back(); return; }catch(e){} } pgPop(PG.length-1); }
window.addEventListener("popstate",function(e){ var n=(e.state&&e.state.kst)||0; if(PG.length>n) pgPop(n); });
function pgTo(n){ var k=0; PG.slice(n).forEach(function(o){ if(o._h) k++; }); pgPop(n); if(k) try{ history.go(-k); }catch(e){} }   // 단추로 여러 장 한꺼번에 닫을 때 — 쌓인 history 칸도 같이 되돌린다
function kIc(n,s){ return '<img class="kic'+(s?" s":"")+'" src="img/kara/kst_'+n+'.png" alt="" aria-hidden="true">'; }
function kVid(id){ return HUB+"/kst/v/"+id; }
function kThumb(id,cls){ return '<video class="'+cls+'" preload="metadata" playsinline muted src="'+esc(kVid(id))+'#t=0.1"></video>'; }
function kHead(inner){ return '<div class="kpgh"><button type="button" class="kpbk" aria-label="'+esc(L(TX.back))+'"><img src="img/kara/kst_back.png" alt=""></button><div class="kpgt">'+inner+'</div></div>'; }
function kNum(n){ n=+n||0; try{ return n.toLocaleString(kLoc()); }catch(e){ return String(n); } }
function kQs(){ return "dev="+encodeURIComponent(klDev())+"&sess="+encodeURIComponent(sess()); }
function kGet(path){ return fetch(HUB+path+(path.indexOf("?")>=0?"&":"?")+kQs(),{headers:{"x-kown":KOWN}}).then(function(r){ return r.json(); }); }
function kPost(path,o){ var q={dev:klDev(),sess:sess()}; for(var k in o) q[k]=o[k]; return fetch(HUB+path,{method:"POST",headers:{"Content-Type":"application/json","x-kown":KOWN},body:JSON.stringify(q)}).then(function(r){ return r.json(); }); }
function kDay(t){ try{ var d=new Date(t); return [d.toLocaleDateString(kLoc(),{month:"short",day:"numeric"}),d.getFullYear()+" · "+d.toLocaleTimeString(kLoc(),{hour:"2-digit",minute:"2-digit"})]; }catch(e){ return ["",""]; } }
function kVisTag(x){ var f=x.vis==="fol"; return '<span class="ktg'+(x.vis==="pub"?" p":f?" f":"")+'">'+esc(L(x.vis==="pub"?TX.vPub:f?TX.vFol:TX.vMe))+'</span>'; }
// ── 팔로우 (사장님 10-30) — 사람은 pubid(허브가 만든 무작위 공개 id)로만 부른다 · 내 것엔 단추 없음
function kUn(x){ var n=esc(x.nick||"guest"); return x.pubid?'<button type="button" class="kun" data-u="'+esc(x.pubid)+'">'+n+'</button>':'<b>'+n+'</b>'; }   // 누르면 그 사람 무대
function kFwB(on){ return '<button type="button" class="kfw'+(on?' on':'')+'" data-fw="1">'+esc(L(on?TX.flg:TX.flw))+'</button>'; }
function kFollow(pub,on,btn){ if(btn) btn.disabled=true;
  return kPost("/kst/follow",{pubid:pub,on:!!on}).then(function(j){ if(btn) btn.disabled=false; if(!(j&&j.ok)){ soon(L(TX.fail)); return null; }
    try{ ntap("kara_stage",on?"follow":"unfollow"); }catch(e){}
    PG.forEach(function(o){ if(o._fw) try{ o._fw(pub,j); }catch(e){} });   // 열린 페이지들(그 사람 무대·상세·내 가요무대)에 알림
    return j; }).catch(function(){ if(btn) btn.disabled=false; soon(L(TX.upNet)); return null; }); }
function kUnBind(root){ [].forEach.call(root.querySelectorAll(".kun[data-u]"),function(u){ u.onclick=function(e){ e.stopPropagation(); kUser(u.dataset.u); }; u.onkeydown=function(e){ e.stopPropagation(); }; }); }
// 목록 점수 칸·정렬 (사장님 10-30) — 날짜 칸 옆 점수(없으면 –) · 정렬 단추 = 최신순 → 오래된순 → 점수순(높은 점수 먼저, 같으면 최신) → 최신순
function kScC(x){ var v=x&&typeof x.sc==="number"?x.sc:null; return '<div class="krs">'+(v==null?'<b class="kna">–</b>':'<b>'+v+'</b><small>'+esc(L(TX.scPt))+'</small>')+'</div>'; }
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
    var head='<div class="kpf"><div class="kpfv kro">'+(m&&m.pid?kThumb(m.pid,"kpfm"):'<span class="kpfe">'+kIc("vid")+'</span>')+'</div><div class="kpfi">'
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
    body=head+'<div class="ksrt"><span>'+esc(L(TX.vids))+(U.items&&U.items.length?' · '+U.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(U.sort))+'</button></div>'+list;
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
  var o=pgOpen("kstpg"); if(!o) return; var own=isOwn();
  var S=KS={o:o,tab:tab,items:null,err:0,me:null,sort:"new",tok:0};
  o._bye=function(){ S.tok++; if(KS===S) KS=null; };
  o._fw=function(){ if(S.tab==="me") S.loadMe(); else S.load(); };   // 팔로우가 바뀌면 — 내 가요무대 = 팔로잉 수 · 가요무대 = 팔로워만 영상이 들어오고 빠진다
  S.load=function(){ if(!own) return; var my=++S.tok; S.items=null; S.err=0;
    kGet("/kst/list?scope="+(S.tab==="all"?"pub":"me")).then(function(j){ if(my!==S.tok) return; if(j&&j.ok) S.items=j.items||[]; else { S.items=[]; S.err=1; } S.draw(); })
      .catch(function(){ if(my!==S.tok) return; S.items=[]; S.err=1; S.draw(); });
    if(S.tab==="me") S.loadMe(); };
  S.loadMe=function(){ var my=S.tok; kGet("/kst/me").then(function(j){ if(my!==S.tok||!(j&&j.ok)) return; S.me=j; S.draw(); }).catch(function(){}); };
  var prof=function(){ var m=S.me, pid=m&&m.pid, dash="…";
    return '<div class="kpf"><button type="button" class="kpfv" data-pf="1" aria-label="'+esc(L(TX.pfT))+'">'+(pid?kThumb(pid,"kpfm"):'<span class="kpfe">'+kIc("vid")+'</span>')+'<span class="kpfc">'+esc(L(TX.chg))+'</span></button>'
      +'<div class="kpfi">'
      +'<div class="kpr kpn">'+kIc("id")+(m&&m.nick?'<b>'+esc(m.nick)+'</b><button type="button" class="kln" data-nick="1">'+esc(L(TX.chg))+'</button>':'<button type="button" class="kln" data-nick="1">'+esc(L(TX.idSet))+'</button>')+'</div>'
      +'<div class="kpr'+(m&&m.pubid?' kfl2" role="button" tabindex="0" data-fl="followers':'')+'">'+kIc("fol")+'<span>'+esc(L(TX.fol))+'</span><b>'+(m?kNum(m.followers):dash)+'</b></div>'
      +'<div class="kpr'+(m&&m.pubid?' kfl2" role="button" tabindex="0" data-fl="following':'')+'">'+kIc("fol")+'<span>'+esc(L(TX.fing))+'</span><b>'+(m?kNum(m.following):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("view")+'<span>'+esc(L(TX.vw))+'</span><b>'+(m?kNum(m.views):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("vid")+'<span>'+esc(L(TX.vids))+'</span><b>'+(m?kNum(m.count):dash)+'</b></div>'
      +'<div class="kpr">'+kIc("up")+'<span>'+esc(L(TX.lks))+'</span><b>'+(m?kNum(m.likes):dash)+'</b></div>'
      +'</div></div>'; };
  var rows=function(){
    if(S.items===null) return '<div class="kstge">'+esc(L(TX.lo))+'</div>';
    if(S.err) return '<div class="kstge">'+esc(L(TX.stF))+'</div>';
    if(!S.items.length) return '<div class="kstge">'+esc(L(S.tab==="all"?TX.stgE:TX.mstgE))+'</div>';
    var a=kSortA(S.items,S.sort);
    return '<div class="krows">'+a.map(function(r){ var x=r[0], d=kDay(x.at);
      return '<div class="krow" role="button" tabindex="0" data-i="'+r[1]+'"><div class="krd"><b>'+esc(d[0])+'</b><small>'+esc(d[1])+'</small></div>'+kScC(x)
        +'<div class="krm"><p>'+esc(x.desc||x.t||"-")+'</p><small>'+(S.tab==="me"?kVisTag(x):(x.vis==="fol"?kVisTag(x):'')+(x.pubid?kUn(x).replace('class="kun"','class="kun knk"'):'<b class="knk">'+esc(x.nick||"guest")+'</b>'))
        +'<span class="kst2">'+kIc("up",1)+kNum(x.up)+'</span><span class="kst2">'+kIc("cm",1)+kNum(x.cm)+'</span><span class="kst2">'+kIc("view",1)+kNum(x.views)+'</span></small></div>'
        +kThumb(x.id,"krv")+'</div>'; }).join("")+'</div>'; };
  S.draw=function(){ var body;
    if(!own) body='<div class="kstge">'+esc(L(S.tab==="all"?TX.stgE:TX.mstgE))+'<br>'+esc(L(TX.soon2))+'</div>';
    else if(S.tab==="me") body=prof()+'<div class="ksrt"><span>'+esc(L(TX.mstgE))+(S.items&&S.items.length?' · '+S.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(S.sort))+'</button></div>'+rows();
    else body='<div class="ksrt"><span>'+esc(L(TX.stgE))+(S.items&&S.items.length?' · '+S.items.length:'')+'</span><button type="button" data-sort="1">⇅ '+esc(kSortL(S.sort))+'</button></div>'+rows();   // 가요무대 = 프로필 없이 같은 줄 목록 + 최신순/오래된순 (사장님 10-30) · 친구(팔로우) 영상은 팔로우 생기면 같이
    var sc=o.querySelector(".kpgb"), top=sc?sc.scrollTop:0;
    o.innerHTML=kHead('<button type="button" data-st="all"'+(S.tab==="all"?' class="on"':'')+'>'+esc(L(TX.stg))+'</button><button type="button" data-st="me"'+(S.tab==="me"?' class="on"':'')+'>'+esc(L(TX.mstg))+'</button>')+'<div class="kpgb">'+body+'</div>';
    sc=o.querySelector(".kpgb"); if(sc&&top) sc.scrollTop=top;
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll("[data-st]"),function(x){ x.onclick=function(){ if(S.tab===x.dataset.st) return; S.tab=x.dataset.st; S.items=null; S.err=0; S.draw(); S.load(); var g=o.querySelector(".kpgb"); if(g) g.scrollTop=0; }; });
    var so=o.querySelector("[data-sort]"); if(so) so.onclick=function(){ S.sort=kSortNx(S.sort); S.draw(); };
    var pf=o.querySelector("[data-pf]"); if(pf) pf.onclick=function(){ kPick(S); };
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
// 프로필 영상 고르기 — 내 영상 목록(첫 장면)에서 하나
function kPick(S){ var o=pgOpen("kpick"); if(!o) return; var mine=null, busy=false;
  var draw=function(msg){ var body;
    if(mine===null) body='<div class="kstge">'+esc(L(TX.lo))+'</div>';
    else if(!mine.length) body='<div class="kstge">'+esc(L(TX.pfE))+'</div>';
    else body='<p class="km">'+esc(L(TX.pfN))+'</p>'+(msg?'<div class="kerr">'+esc(msg)+'</div>':'')+'<div class="kpkp">'+mine.map(function(x,i){ var cur=S.me&&S.me.pid===x.id;
      return '<button type="button" data-i="'+i+'"'+(cur?' class="on"':'')+'>'+kThumb(x.id,"")+'<small>'+esc(kDay(x.at)[0])+'</small></button>'; }).join("")+'</div>';
    o.innerHTML=kHead('<h3>'+esc(L(TX.pfT))+'</h3>')+'<div class="kpgb">'+body+'</div>';
    o.querySelector(".kpbk").onclick=pgBack;
    [].forEach.call(o.querySelectorAll(".kpkp button"),function(c){ c.onclick=function(){ var x=mine[+c.dataset.i]; if(!x||busy) return; busy=true;
      kPost("/kst/me",{pid:x.id}).then(function(j){ busy=false; if(j&&j.ok){ S.me=j; S.draw(); pgBack(); return; } draw(L(TX.fail)); }).catch(function(){ busy=false; draw(L(TX.upNet)); }); }; }); };
  if(S.tab==="me"&&S.items&&!S.err){ mine=S.items.slice(); draw(); }
  else { draw(); kGet("/kst/list?scope=me").then(function(j){ mine=(j&&j.ok&&j.items)||[]; if(o.isConnected) draw(); }).catch(function(){ mine=[]; if(o.isConnected) draw(L(TX.stF)); }); } }
// 영상 상세 — 위 영상 크게 · 설명(주인은 고치기) · 좋아요/싫어요 · 조회수 · 댓글 (같은 기기 같은 영상 조회수는 하루 1번)
function kDet(x,S){ var o=pgOpen("kdet"); if(!o) return; var cms=null, edit=false, busy=false, d=kDay(x.at);
  var chg=function(){ if(S&&S.o&&S.o.isConnected){ S.draw(); if(S.tab==="me") S.loadMe(); } };
  o.innerHTML=kHead('<h3>'+esc(x.t||L(TX.stg))+'</h3>')+'<div class="kpgb"><video class="kdv" controls autoplay playsinline preload="metadata" src="'+esc(kVid(x.id))+'"></video>'
    +'<div class="kdm">'+kUn(x)+'<span class="kfwh"></span><span>'+esc(d[0]+" "+d[1])+'</span>'+(x.mine||x.vis==="fol"?kVisTag(x):'')+'</div><div class="kdr"></div><div class="kbx kdd"></div><div class="kbx kdc"></div>'
    +(x.mine?'<button type="button" class="kbt r kdel2">'+esc(L(TX.del))+'</button>':'')+'</div>';
  o.querySelector(".kpbk").onclick=pgBack; kUnBind(o);
  var fwOn=null, fwH=o.querySelector(".kfwh"), fwDraw=function(){ if(x.mine||!x.pubid||fwOn===null){ fwH.innerHTML=""; return; } fwH.innerHTML=kFwB(fwOn);
    var bt=fwH.querySelector("[data-fw]"); bt.onclick=function(){ kFollow(x.pubid,!fwOn,bt); }; };
  o._fw=function(p2,j){ if(p2===x.pubid){ fwOn=!!j.iFollow; fwDraw(); } };
  if(!x.mine&&x.pubid) kGet("/kst/user?pubid="+x.pubid).then(function(j){ if(!o.isConnected||!(j&&j.ok)) return; if(j.isMe){ x.mine=true; fwOn=null; } else fwOn=!!j.iFollow; fwDraw(); }).catch(function(){});
  var R=o.querySelector(".kdr"), D=o.querySelector(".kdd"), C=o.querySelector(".kdc");
  var rDraw=function(){ R.innerHTML='<button type="button" data-r="up" aria-label="'+esc(L(TX.upB))+'"'+(x.my==="up"?' class="on"':'')+'>'+kIc("up")+'<b>'+kNum(x.up)+'</b></button>'
      +'<button type="button" data-r="down" aria-label="'+esc(L(TX.dnB))+'"'+(x.my==="down"?' class="on"':'')+'>'+kIc("down")+'<b>'+kNum(x.down)+'</b></button>'
      +'<span class="kvw" title="'+esc(L(TX.vw))+'">'+kIc("view")+'<b>'+kNum(x.views)+'</b></span>';
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
function ntcOpen(){ var b=box(); if(!b) return; var o=b.querySelector(".kntc"); if(o) o.remove();
  var lg=window.LANG||"en", li=TX.ntcL[lg]||TX.ntcL.en, P=KB.packs, X=P[P.length-1], s=X.n+X.b, u=Math.min(3,s), r1=Math.max(0,Math.floor((X.p-u*1000)/10)*10), r2=Math.floor(r1*9/100)*10;
  var first=tf(L(TX.ntcP0),{list:P.map(function(q){ return (q.b?q.n+"+"+q.b+" ("+won(q.p)+" · "+songsTx(q.n+q.b)+")":songsTx(q.n)+" "+won(q.p)); }).join(" · ")});
  var ex=tf(L(TX.ntcEx),{pk:pkName(X),w:won(X.p),s:s,u:u,c:won(u*1000),r:won(r1),r2:won(r2)});
  var all=[first,L(TX.pol),li[0],li[1],ex,li[2],li[3]];
  o=document.createElement("div"); o.className="kpm kntc"; b.appendChild(o);
  o.innerHTML='<div><h3>'+esc(L(TX.ntc))+'</h3><ul>'+all.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul>'
    +'<a class="kra" href="refund.html?lang='+encodeURIComponent(TX.ntcL[lg]?lg:"en")+'" target="_blank" rel="noopener">'+esc(L(TX.ntcR))+' ›</a>'
    +'<button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
  o.querySelector(".kc").onclick=function(){ o.remove(); };
  o.onclick=function(e){ if(e.target===o) o.remove(); }; }
var _sl=window.setLang; if(_sl) window.setLang=function(){ var r=_sl.apply(this,arguments); try{ barPaint(); if(KB.redraw) KB.redraw(); }catch(e){} return r; };   // 언어 바꾸면 곡 이용권 창도 바로
function close(){ try{ pgTo(0); }catch(e){} try{ klEnd(); }catch(e){} try{ if(REC.mr&&REC.mr.state!=="inactive"){ REC.mr.onstop=null; REC.mr.stop(); } camOff(); }catch(e){} K.cur=null; var b=box(); if(b){ try{ K.pl&&K.pl.destroy&&K.pl.destroy(); }catch(e){} b.remove(); } K.pl=null; K.ready=false; document.documentElement.style.overflow=""; mpPaid.end(); }
window.karOpen=open; window.karClose=close; window.karState=K;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__kara_([a-z]+)$/.exec(k||""); if(m){ open(m[1]); return; } return _hc.apply(this,arguments); };
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 노래방 나가기
})();
