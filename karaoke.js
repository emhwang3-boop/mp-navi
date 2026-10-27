/* 머니퍼즐 투어 — 무료 노래방 + 유료 콘텐츠 사용 통계 (사장님 2026-10-26)
 *  · 구 화면 노래방 그림(gu_build KARA → act "__kara_<code>")을 누르면 노래방 방처럼 어두운 화면
 *  · 노래 = TJ노래방 공식 유튜브채널(UCZUhx8ClCv6paFW7qi3qljg)·금영 노래방 공식 유튜브 채널(UCDqaUIUSJP5EVMEI178Zfag) 영상만 — 허브 /kara 가 고른다
 *    재생은 유튜브 퍼가기 플레이어(IFrame API) 그대로(광고·로고 안 가림), 퍼가기 막힌 영상(오류 101·150)은 다음 곡으로 · 무료
 *  · 단추의 채널 그림 = 두 회사 공식 채널 프로필 이미지 그대로(img/kara/tj.jpg·ky.jpg, 유튜브에서 받은 원본)
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

// ── 노래방 ──
var CH={tj:{n:{ko:"TJ노래방 공식 채널",en:"TJ Karaoke (official)",ja:"TJカラオケ 公式",zhs:"TJ 练歌房 官方",zht:"TJ 練歌房 官方",es:"TJ Karaoke (oficial)"},u:"https://www.youtube.com/channel/UCZUhx8ClCv6paFW7qi3qljg",i:"img/kara/tj.jpg"},
        ky:{n:{ko:"금영노래방 공식 채널",en:"KY Karaoke (official)",ja:"KYカラオケ 公式",zhs:"金永(KY) 练歌房 官方",zht:"金永(KY) 練歌房 官方",es:"KY Karaoke (oficial)"},u:"https://www.youtube.com/channel/UCDqaUIUSJP5EVMEI178Zfag",i:"img/kara/ky.jpg"}};
var TABS=[["kpop","K-POP"],["pop","Pop"],["jpop","J-POP"]];   // 중국 노래는 두 공식 채널에 없어서 탭을 안 둔다 (10-26 확인)
var TX={
 t:{ko:"노래방",en:"Karaoke",ja:"カラオケ",zhs:"KTV 练歌房",zht:"KTV 練歌房",es:"Karaoke"},
 s:{ko:"TJ·금영 공식 유튜브 채널의 노래방 영상 — 무료",en:"Karaoke videos from the official TJ and KY YouTube channels — free",ja:"TJ・KY公式YouTubeチャンネルのカラオケ動画 — 無料",zhs:"来自TJ、KY官方YouTube频道的卡拉OK视频 — 免费",zht:"來自TJ、KY官方YouTube頻道的卡拉OK影片 — 免費",es:"Vídeos de karaoke de los canales oficiales de TJ y KY en YouTube — gratis"},
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
 // 노래방 결제 (사장님 10-27 「제휴 성공 대비 — 1,000원당 1곡, 기계의 돈 넣는 곳에 PAYMENT, 노래방 안에서 결제」) — 지금은 결제 연결 전(시험)
 rate:{ko:"1,000원당 1곡",en:"₩1,000 per song",ja:"1,000ウォンで1曲",zhs:"每首歌 ₩1,000",zht:"每首歌 ₩1,000",es:"₩1,000 por canción"},
 slot:{ko:"돈 넣는 곳",en:"Insert here",ja:"投入口",zhs:"投币口",zht:"投幣口",es:"Introduce aquí"},
 left:{ko:"남은 곡",en:"Songs left",ja:"残り曲数",zhs:"剩余歌曲",zht:"剩餘歌曲",es:"Canciones"},
 pt:{ko:"노래 충전",en:"Buy songs",ja:"曲をチャージ",zhs:"充值歌曲",zht:"儲值歌曲",es:"Comprar canciones"},
 pn:{ko:"곡",en:"songs",ja:"曲",zhs:"首",zht:"首",es:"canciones"},
 pn1:{ko:"곡",en:"song",ja:"曲",zhs:"首",zht:"首",es:"canción"},   // 1곡 (영·스페인어 단수, 10-27)
 tot:{ko:"결제 금액",en:"Amount",ja:"お支払い金額",zhs:"支付金额",zht:"付款金額",es:"Importe"},
 pay:{ko:"결제하기",en:"Pay",ja:"支払う",zhs:"付款",zht:"付款",es:"Pagar"},
 cancel:{ko:"취소",en:"Cancel",ja:"キャンセル",zhs:"取消",zht:"取消",es:"Cancelar"},
 // 남은 곡·환불 공지 (사장님 10-27 — 계정에 1년 보관 · 안 부른 곡은 요청 시 전액 환불, refund.html 3. 디지털 서비스)
 ntc:{ko:"공지사항",en:"Notice",ja:"お知らせ",zhs:"公告",zht:"公告",es:"Aviso"},
 ntcL:{
  ko:["1,000원당 1곡입니다.","남은 곡은 내 계정(구글·애플 로그인)에 결제일부터 1년간 보관되어, 다음에 이어서 부를 수 있습니다.","안 부른 곡은 환불 가능합니다(요청 시 남은 곡 × 1,000원 전액). 이미 부른 곡은 환불되지 않습니다.","환불은 결제한 수단으로 영업일 3~7일 안에 처리됩니다. 문의: 앱의 문의 메뉴 또는 emhwang3@moneypuzzle.co.kr","예: 10,000원(10곡) 결제 후 5곡을 부르면 5곡이 남고, 원하면 5,000원을 환불받을 수 있습니다."],
  en:["₩1,000 per song.","Unused songs stay in your account (Google or Apple sign-in) for 1 year from purchase, so you can keep singing later.","Unused songs are fully refunded on request (songs left × ₩1,000). Songs already sung are not refunded.","Refunds go to your original payment method within 3–7 business days. Contact: the app's inquiry menu or emhwang3@moneypuzzle.co.kr","Example: pay ₩10,000 (10 songs) and sing 5 — 5 songs remain, or get ₩5,000 back on request."],
  ja:["1,000ウォンで1曲です。","残った曲はご自身のアカウント（Google・Appleログイン）に購入日から1年間保管され、後で続けて歌えます。","歌っていない曲はお申し出により全額返金します（残り曲数 × 1,000ウォン）。歌った曲は返金されません。","返金はお支払い方法へ3〜7営業日以内に行います。お問い合わせ：アプリのお問い合わせメニューまたは emhwang3@moneypuzzle.co.kr","例：10,000ウォン（10曲）を支払い5曲歌うと5曲が残り、ご希望なら5,000ウォンを返金します。"],
  zhs:["每首歌 ₩1,000。","剩余歌曲保存在您的账户（Google·Apple 登录）中，自购买日起保留1年，之后可继续唱。","未唱的歌曲可申请全额退款（剩余歌曲 × ₩1,000）。已唱的歌曲不予退款。","退款将在3–7个工作日内退回原支付方式。咨询：应用内的咨询菜单或 emhwang3@moneypuzzle.co.kr","例：支付 ₩10,000（10首）唱了5首，剩余5首；如需要可退款 ₩5,000。"],
  zht:["每首歌 ₩1,000。","剩餘歌曲保存在您的帳戶（Google·Apple 登入）中，自購買日起保留1年，之後可繼續唱。","未唱的歌曲可申請全額退款（剩餘歌曲 × ₩1,000）。已唱的歌曲不予退款。","退款將在3–7個工作天內退回原付款方式。諮詢：App 內的諮詢選單或 emhwang3@moneypuzzle.co.kr","例：支付 ₩10,000（10首）唱了5首，剩餘5首；如需要可退款 ₩5,000。"],
  es:["₩1,000 por canción.","Las canciones no usadas se guardan en tu cuenta (inicio de sesión con Google o Apple) durante 1 año desde la compra, para seguir cantando después.","Las canciones no usadas se reembolsan íntegramente si lo solicitas (canciones restantes × ₩1,000). Las ya cantadas no se reembolsan.","El reembolso se hace al método de pago original en 3–7 días hábiles. Contacto: menú de consultas de la app o emhwang3@moneypuzzle.co.kr","Ejemplo: pagas ₩10,000 (10 canciones) y cantas 5 — te quedan 5, o recibes ₩5,000 si lo pides."]},
 ntcR:{ko:"환불 규정 전체 보기",en:"View full refund policy",ja:"返金規定の全文を見る",zhs:"查看完整退款规定",zht:"查看完整退款規定",es:"Ver la política de reembolso completa"},
 ntcP:{ko:"남은 곡은 1년간 보관 · 안 부른 곡은 환불 가능 — 공지사항",en:"Unused songs kept 1 year · refundable — Notice",ja:"残り曲は1年保管・未使用分は返金可能 — お知らせ",zhs:"剩余歌曲保留1年 · 未唱可退款 — 公告",zht:"剩餘歌曲保留1年 · 未唱可退款 — 公告",es:"Canciones sin usar: 1 año guardadas · reembolsables — Aviso"},
 ok:{ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"},
 // 남은 곡·로그인·환불 요청 (사장님 10-27 화면 미리보기 — 결제 연결 전)
 lftN:{ko:"남은 곡: {n}곡",en:"Songs left: {n}",ja:"残り曲数: {n}曲",zhs:"剩余歌曲：{n}首",zht:"剩餘歌曲：{n}首",es:"Canciones restantes: {n}"},
 sgi:{ko:"로그인하면 남은 곡이 1년간 보관됩니다",en:"Sign in to keep unused songs for 1 year",ja:"ログインすると残り曲が1年間保管されます",zhs:"登录后剩余歌曲可保留1年",zht:"登入後剩餘歌曲可保留1年",es:"Inicia sesión para guardar tus canciones 1 año"},
 sgb:{ko:"로그인",en:"Sign in",ja:"ログイン",zhs:"登录",zht:"登入",es:"Iniciar sesión"},
 rfb:{ko:"남은 곡 환불 요청 ({n}곡 · {w})",en:"Request refund for unused songs ({n} · {w})",ja:"残り曲の返金を申請（{n}曲・{w}）",zhs:"申请退还剩余歌曲（{n}首 · {w}）",zht:"申請退還剩餘歌曲（{n}首 · {w}）",es:"Solicitar reembolso de canciones ({n} · {w})"},
 rfh:{ko:"환불 요청",en:"Refund request",ja:"返金申請",zhs:"退款申请",zht:"退款申請",es:"Solicitud de reembolso"},
 rfq:{ko:"남은 곡 {n}곡({w}) 환불을 요청할까요? 결제한 수단으로 영업일 3~7일 안에 환불됩니다.",en:"Request a refund for {n} unused songs ({w})? It will go to your original payment method within 3–7 business days.",ja:"残り{n}曲（{w}）の返金を申請しますか？お支払い方法へ3〜7営業日以内に返金されます。",zhs:"要申请退还剩余的{n}首歌（{w}）吗？款项将在3–7个工作日内退回原支付方式。",zht:"要申請退還剩餘的{n}首歌（{w}）嗎？款項將在3–7個工作天內退回原付款方式。",es:"¿Solicitar el reembolso de {n} canciones sin usar ({w})? Se devolverá a tu método de pago original en 3–7 días hábiles."},
 rfo:{ko:"요청",en:"Request",ja:"申請",zhs:"申请",zht:"申請",es:"Solicitar"},
 rfd:{ko:"환불 요청이 접수되었습니다.",en:"Your refund request has been received.",ja:"返金申請を受け付けました。",zhs:"退款申请已受理。",zht:"退款申請已受理。",es:"Hemos recibido tu solicitud de reembolso."},
 free:{ko:"노래방 제휴를 준비 중이라 지금은 무료로 부를 수 있어요. 결제는 되지 않습니다.",en:"Karaoke partnership in progress — singing is free for now. No payment is taken.",ja:"カラオケ提携の準備中のため、今は無料で歌えます。決済は行われません。",zhs:"练歌房合作筹备中，目前可免费唱歌，不会扣款。",zht:"練歌房合作籌備中，目前可免費唱歌，不會扣款。",es:"Alianza de karaoke en preparación: por ahora cantar es gratis. No se cobra nada."}
};
var st=document.createElement("style");
st.textContent="#karBox{position:fixed;inset:0;z-index:2147483004;background:radial-gradient(ellipse at 20% 0%,#3b0d5c 0%,#12081f 45%,#05030a 100%);color:#f5eaff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden}"
 +"#karBox::before{content:'';position:absolute;inset:-20%;pointer-events:none;background:conic-gradient(from 0deg,rgba(255,80,200,.10),rgba(80,160,255,.10),rgba(120,255,180,.08),rgba(255,200,80,.10),rgba(255,80,200,.10));animation:karSpin 14s linear infinite;mix-blend-mode:screen}@keyframes karSpin{to{transform:rotate(360deg)}}"
 +"#karBox .kin{position:relative;max-width:720px;width:100%;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:10px 12px 0}"
 +"#karBox .khd{display:flex;align-items:center;gap:8px}#karBox .khd b{font-size:19px;text-shadow:0 0 8px #ff4fd8,0 0 16px #7a5cff}#karBox .khd small{display:block;font-size:12px;opacity:.75;font-weight:600}#karBox .kx{margin-left:auto;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:7px 14px;font-weight:800;cursor:pointer}"
 +"#karBox .kch{display:flex;gap:8px;margin:8px 0}#karBox .kch a{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 8px;color:#fff;text-decoration:none;font-weight:800;font-size:13px}#karBox .kch img{width:34px;height:34px;border-radius:50%;flex:0 0 auto}"
 +"#karBox .kpl{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 0 18px rgba(170,90,255,.45);flex:0 0 auto}#karBox .kpl .kmsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-weight:800;opacity:.8}#karBox .kpl iframe{width:100%;height:100%;border:0}"
 +"#karBox .ktb{display:flex;gap:6px;margin:10px 0 6px}#karBox .ktb button{flex:1;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:8px 4px;font-weight:900;cursor:pointer}#karBox .ktb button.on{background:linear-gradient(90deg,#ff4fd8,#7a5cff);border-color:transparent}"
 +"#karBox .ksr{display:flex;gap:6px}#karBox .ksr input{flex:1;min-width:0;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;padding:9px 10px;font-size:15px}#karBox .ksr button{border:0;border-radius:10px;background:#ff4fd8;color:#fff;font-weight:900;padding:0 14px;cursor:pointer}"
 +"#karBox .kls{flex:1;overflow:auto;margin-top:8px;padding-bottom:16px;-webkit-overflow-scrolling:touch}#karBox .kit{display:flex;align-items:center;gap:8px;padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}#karBox .kit.on{background:rgba(255,79,216,.16);border-radius:10px}#karBox .kit img{width:24px;height:24px;border-radius:50%;flex:0 0 auto}#karBox .kit span{flex:1;font-size:14.5px;font-weight:700;line-height:1.3}#karBox .kit i{font-style:normal;font-size:12px;opacity:.6}"
 +"#karBox .kit b.kyt{font-weight:800;color:#ff8080;margin-right:4px}#karBox .kov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:rgba(0,0,0,.82);font-weight:800;z-index:2}#karBox .kov a{background:#ff0033;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:900}#karBox .kst{font-size:13px;opacity:.75;padding:10px 4px}";
st.textContent+="#karBox .kpay{display:flex;align-items:center;gap:10px;margin:10px 0 2px;background:linear-gradient(180deg,#2a2440,#16121f);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}"
 +"#karBox .kpay .kr{display:flex;flex-direction:column;line-height:1.25}#karBox .kpay .kr b{font-size:15px;color:#ffe066;text-shadow:0 0 6px rgba(255,200,60,.6)}#karBox .kpay .kr small{font-size:11.5px;opacity:.75}"
 +"#karBox .kpay .kl{font:800 13px/1.2 ui-monospace,Consolas,monospace;color:#7CFFB2;background:#05140c;border:1px solid #1d6b43;border-radius:6px;padding:5px 8px;text-shadow:0 0 6px #2bd97d}"
 +"#karBox .kslot{margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:linear-gradient(180deg,#5a5f6b,#2c2f36);border-radius:10px;padding:6px 14px 7px;cursor:pointer;box-shadow:0 2px 0 #111,inset 0 1px 0 rgba(255,255,255,.25)}"
 +"#karBox .kslot i{display:block;width:44px;height:7px;border-radius:4px;background:#000;box-shadow:inset 0 2px 3px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.2)}#karBox .kslot span{font:900 12px/1 system-ui,sans-serif;letter-spacing:.12em;color:#fff}#karBox .kslot small{font-size:10px;color:#cfd3dc;font-weight:600}"
 +"#karBox .kpm{position:absolute;inset:0;z-index:5;background:rgba(5,3,10,.78);display:flex;align-items:center;justify-content:center;padding:16px}#karBox .kpm>div{width:min(360px,100%);background:#1d1830;border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}"
 +"#karBox .kpm h3{margin:0;font-size:17px}#karBox .kpm .ksel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#karBox .kpm .ksel button{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:9px 0;font-weight:900;cursor:pointer}#karBox .kpm .ksel button.on{background:#ff4fd8;border-color:#ff4fd8}"
 +"#karBox .kpm .kt{display:flex;justify-content:space-between;font-size:18px;font-weight:900}#karBox .kpm .kgo{border:0;border-radius:12px;padding:12px;background:#ffe066;color:#1a1300;font-size:16px;font-weight:900;cursor:pointer}#karBox .kpm .kc{border:0;background:none;color:#cfc6e8;font-weight:700;cursor:pointer}#karBox .kpm .km{font-size:12.5px;color:#cfc6e8;line-height:1.5;margin:0}"
 +"#karBox .kntl{display:block;margin:4px 0 0 auto;border:0;background:none;color:#cfc6e8;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:2px 4px}"
 +"#karBox .kpm.kntc{z-index:6}#karBox .kpm.kntc>div{max-height:100%;overflow:auto}#karBox .kpm ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;font-size:13.5px;line-height:1.5;color:#efe6ff}#karBox .kpm .kra{color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline}#karBox .kpm .kpp{border:0;background:none;padding:0;text-align:left;font-size:12.5px;color:#ffe066;text-decoration:underline;cursor:pointer;line-height:1.4}";
st.textContent+="#karBox .kpm .klf{font:800 15px/1.3 system-ui,sans-serif;color:#7CFFB2}#karBox .kpm .ksg{font-size:13px;color:#efe6ff;line-height:1.5}#karBox .kpm .ksgb{border:0;background:none;padding:0 0 0 4px;color:#ffe066;font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer}"
 +"#karBox .kpm .krf{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px;font-size:14px;font-weight:800;cursor:pointer}#karBox .kpm .kq{margin:0;font-size:14.5px;line-height:1.55;color:#efe6ff}";
document.head.appendChild(st);
var K={code:"",tab:"kpop",items:[],idx:-1,pl:null,q:""};
function ytApi(cb){ if(window.YT&&YT.Player) return cb(); var prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=function(){ try{ prev&&prev(); }catch(e){} cb(); };
  if(!document.getElementById("ytApiJs")){ var s=document.createElement("script"); s.id="ytApiJs"; s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); } }
function box(){ return document.getElementById("karBox"); }
function paintList(){ var b=box(); if(!b) return; var el=b.querySelector(".kls");
  if(K.items===null){ el.innerHTML='<div class="kst">'+esc(L(TX.ld))+'</div>'; return; }
  if(!K.items.length){ el.innerHTML='<div class="kst">'+esc(L(TX.no))+'</div>'; return; }
  el.innerHTML=K.items.map(function(x,i){ return '<div class="kit'+(i===K.idx?' on':'')+'" data-i="'+i+'"><img src="'+CH[x.ch].i+'" alt=""><span>'+esc(x.t)+'</span><i>'+(x.e===0?'<b class="kyt">▶ '+esc(L(TX.ytt))+'</b> ':'')+esc(x.ln||"")+'</i></div>'; }).join("");
  [].forEach.call(el.querySelectorAll(".kit"),function(d){ d.onclick=function(){ play(+d.dataset.i); }; }); }
function load(){ K.items=null; paintList(); var u=HUB+"/kara?"+(K.q?"q="+encodeURIComponent(K.q):"tab="+K.tab);
  fetch(u).then(function(r){ return r.json(); }).then(function(j){ K.items=(j&&j.ok&&j.items)||[]; K.idx=-1; paintList(); }).catch(function(){ K.items=[]; paintList(); }); }
function ov(html,t){ var b=box(); if(!b) return; var pl=b.querySelector(".kpl"), o=pl.querySelector(".kov"); if(!html){ if(o&&(!t||o.dataset.t===t)) o.remove(); return; } if(!o){ o=document.createElement("div"); o.className="kov"; pl.appendChild(o); } o.dataset.t=t||""; o.innerHTML=html; }
function blocked(x){ try{ K.pl&&K.pl.pauseVideo&&K.pl.pauseVideo(); }catch(e){}
  ov('<div>'+esc(L(TX.yt))+'</div><a href="https://www.youtube.com/watch?v='+encodeURIComponent(x.id)+'" target="_blank" rel="noopener" data-kyt="1">▶ '+esc(L(TX.ytb))+'</a>');
  var a=box()&&box().querySelector("[data-kyt]"); if(a) a.addEventListener("click",function(){ mpPaid.out(); }); }
function play(i){ var x=K.items&&K.items[i]; if(!x) return; K.idx=i; paintList(); var b=box(); if(!b) return; var pl=b.querySelector(".kpl");
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
      onStateChange:function(ev){ if(ev&&ev.data===1) ov("","lo"); } }}); }); }
function open(code){ var D=window.GU&&GU.d, o=D&&D.kara&&D.kara[code]; K.code=code; K.q=""; K.idx=-1; K.pl=null; K.ready=false; K.want=""; var old=box(); if(old) old.remove();
  var gn=o&&window.LP?LP(o.n):(o?o.g:""), b=document.createElement("div"); b.id="karBox";
  b.innerHTML='<div class="kin"><div class="khd"><div><b>'+esc(L(TX.t))+(gn?' · '+esc(gn):'')+'</b><small>'+esc(L(TX.s))+'</small></div><button type="button" class="kx">✕ '+esc(L(TX.x))+'</button></div>'
    +'<div class="kch">'+["tj","ky"].map(function(c){ return '<a href="'+CH[c].u+'" target="_blank" rel="noopener" data-kch="'+c+'"><img src="'+CH[c].i+'" alt="">'+esc(L(CH[c].n))+' ›</a>'; }).join("")+'</div>'
    +'<div class="kpl"><div class="kmsg">🎤 '+esc(L(TX.pick))+'</div></div>'
    +'<div class="kpay"><div class="kr"><b>'+esc(L(TX.rate))+'</b><small>'+esc(L(TX.left))+'</small></div><div class="kl" id="karLeft">FREE</div><button type="button" class="kslot" data-kpay="1" aria-label="PAYMENT"><i></i><span>PAYMENT</span><small>'+esc(L(TX.slot))+'</small></button></div>'
    +'<button type="button" class="kntl" data-kntc="1">'+esc(L(TX.ntc))+'</button>'   // 남은 곡·환불 공지 (10-27) — 기계의 돈 넣는 곳 = 결제 단추 (10-27)
    +'<div class="ktb">'+TABS.map(function(t){ return '<button type="button" data-t="'+t[0]+'"'+(t[0]===K.tab?' class="on"':'')+'>'+t[1]+'</button>'; }).join("")+'</div>'
    +'<form class="ksr"><input type="search" placeholder="'+esc(L(TX.q))+'"><button type="submit">'+esc(L(TX.go))+'</button></form>'
    +'<div class="kls"></div></div>';
  document.body.appendChild(b); document.documentElement.style.overflow="hidden";
  b.querySelector(".kx").onclick=close;
  b.querySelector("[data-kpay]").onclick=payOpen;
  b.querySelector("[data-kntc]").onclick=ntcOpen;
  [].forEach.call(b.querySelectorAll("[data-kch]"),function(a){ a.addEventListener("click",function(){ mpPaid.out(); }); });
  [].forEach.call(b.querySelectorAll(".ktb button"),function(t){ t.onclick=function(){ K.tab=t.dataset.t; K.q=""; b.querySelector(".ksr input").value=""; [].forEach.call(b.querySelectorAll(".ktb button"),function(x){ x.classList.toggle("on",x===t); }); load(); }; });
  b.querySelector(".ksr").onsubmit=function(e){ e.preventDefault(); K.q=String(b.querySelector(".ksr input").value||"").trim(); [].forEach.call(b.querySelectorAll(".ktb button"),function(x){ x.classList.toggle("on",!K.q&&x.dataset.t===K.tab); }); load(); };
  mpPaid.start("kara_"+code); load(); }
// 노래방 안 결제 창 — 다른 화면으로 넘어가지 않고 이 안에서 (1,000원 × 곡 수). 제휴 전이라 실제 결제는 하지 않는다
var PAYN=[1,3,5,10];
// 로그인 여부 = pg.js 가 허브 세션을 두는 자리(mpv_pg_sess) — pg.js 는 안 건드리고 읽기만
function karSigned(){ try{ return !!localStorage.getItem("mpv_pg_sess"); }catch(e){ return false; } }
// 남은 곡 수 — 지금은 늘 0. 결제가 연결되면 진짜 값은 허브(계정별 남은 곡)에서 받아 온다
function karLeft(){
  // 사장님 미리보기 전용: 주소에 ?kartest=1 이거나 localStorage mpv_kartest=1 이면 5곡으로 보여 환불 단추를 볼 수 있게 한다
  try{ if(/[?&]kartest=1(&|$)/.test(location.search)||localStorage.getItem("mpv_kartest")==="1") return 5; }catch(e){}
  return 0; }
function won(n){ return "₩"+(n*1000).toLocaleString("ko-KR"); }
function fmtN(t,n){ return String(t).replace("{n}",n).replace("{w}",won(n)); }
// 로그인 창(pg.js)을 노래방 위에 띄운다 — 닫히면 원래 높이로 돌리고 결제 창을 다시 그린다(로그인하면 남은 곡 표시)
function signIn(){ if(!window.mpPG||!mpPG.open) return; mpPG.open(); var p=document.getElementById("pgBox"); if(!p) return; p.style.zIndex="2147483006";
  if(!p._karMo&&window.MutationObserver){ p._karMo=new MutationObserver(function(){ if(!p.hidden) return; p.style.zIndex=""; var b=box(); if(b&&b.querySelector(".kpm:not(.kntc)")) payOpen(); }); p._karMo.observe(p,{attributes:true,attributeFilter:["hidden"]}); } }
function payOpen(){ var b=box(); if(!b) return; var o=b.querySelector(".kpm"); if(o) o.remove(); var n=3, mode="";
  o=document.createElement("div"); o.className="kpm"; b.appendChild(o);
  var draw=function(msg){ var sg=karSigned(), left=karLeft();
    if(mode==="rq"){   // 환불 요청 확인 — 노래방 안에서
      o.innerHTML='<div><h3>'+esc(L(TX.rfh))+'</h3><p class="kq">'+esc(fmtN(L(TX.rfq),left))+'</p><button type="button" class="kgo" data-rfo="1">'+esc(L(TX.rfo))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
      o.querySelector("[data-rfo]").onclick=function(){ try{ ntap("kara_pay","refund_req"); }catch(e){}
        // TODO 결제 연결되면: 허브에 환불 요청 POST (세션 mpv_pg_sess · 남은 곡 수) 후 접수 결과로 바꾼다. 지금은 허브 호출 없음
        mode="done"; draw(); };
      o.querySelector(".kc").onclick=function(){ mode=""; draw(); }; return; }
    if(mode==="done"){
      o.innerHTML='<div><h3>'+esc(L(TX.rfh))+'</h3><p class="kq">'+esc(L(TX.rfd))+'</p><button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
      o.querySelector(".kc").onclick=function(){ mode=""; draw(); }; return; }
    o.innerHTML='<div><h3>'+esc(L(TX.pt))+' · '+esc(L(TX.rate))+'</h3>'
    +(sg?'<div class="klf">'+esc(fmtN(L(TX.lftN),left))+'</div>':'<div class="ksg">'+esc(L(TX.sgi))+'<button type="button" class="ksgb">'+esc(L(TX.sgb))+'</button></div>')
    +'<div class="ksel">'+PAYN.map(function(k){ return '<button type="button" data-pn="'+k+'" class="'+(k===n?"on":"")+'">'+k+' '+esc(L(k===1?TX.pn1:TX.pn))+'</button>'; }).join("")+'</div>'
    +'<div class="kt"><span>'+esc(L(TX.tot))+'</span><span>'+won(n)+'</span></div><button type="button" class="kgo">'+won(n)+' '+esc(L(TX.pay))+'</button>'
    +(msg?'<p class="km">'+esc(msg)+'</p>':'')
    +(sg&&left>=1?'<button type="button" class="krf">'+esc(fmtN(L(TX.rfb),left))+'</button>':'')
    +'<button type="button" class="kpp" data-kntc="1">'+esc(L(TX.ntcP))+'</button><button type="button" class="kc">'+esc(L(TX.cancel))+'</button></div>';
    [].forEach.call(o.querySelectorAll("[data-pn]"),function(x){ x.onclick=function(){ n=+x.dataset.pn; draw(); }; });
    o.querySelector(".kgo").onclick=function(){ try{ ntap("kara_pay","try_"+n); }catch(e){} draw(L(TX.free)); };
    var sb=o.querySelector(".ksgb"); if(sb) sb.onclick=signIn;
    var rb=o.querySelector(".krf"); if(rb) rb.onclick=function(){ mode="rq"; draw(); };
    o.querySelector(".kpp").onclick=ntcOpen;
    o.querySelector(".kc").onclick=function(){ o.remove(); }; };
  draw(); }
// 공지사항 창 — 남은 곡 보관·환불 규칙. 노래방 안에서 열리고, 결제 창 위에 겹쳐도 닫으면 결제 창으로 돌아간다
function ntcOpen(){ var b=box(); if(!b) return; var o=b.querySelector(".kntc"); if(o) o.remove();
  var lg=window.LANG||"en", li=TX.ntcL[lg]||TX.ntcL.en;
  o=document.createElement("div"); o.className="kpm kntc"; b.appendChild(o);
  o.innerHTML='<div><h3>'+esc(L(TX.ntc))+'</h3><ul>'+li.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul>'
    +'<a class="kra" href="refund.html?lang='+encodeURIComponent(TX.ntcL[lg]?lg:"en")+'" target="_blank" rel="noopener">'+esc(L(TX.ntcR))+' ›</a>'
    +'<button type="button" class="kc">'+esc(L(TX.ok))+'</button></div>';
  o.querySelector(".kc").onclick=function(){ o.remove(); };
  o.onclick=function(e){ if(e.target===o) o.remove(); }; }
function close(){ var b=box(); if(b){ try{ K.pl&&K.pl.destroy&&K.pl.destroy(); }catch(e){} b.remove(); } K.pl=null; K.ready=false; document.documentElement.style.overflow=""; mpPaid.end(); }
window.karOpen=open; window.karClose=close; window.karState=K;
var _hc=window.hitClick; window.hitClick=function(k){ var m=/^__kara_([a-z]+)$/.exec(k||""); if(m){ open(m[1]); return; } return _hc.apply(this,arguments); };
var _gb=window.guBack; window.guBack=function(){ if(box()){ close(); return true; } return _gb?_gb.apply(this,arguments):false; };   // 뒤로가기 = 노래방 나가기
})();
