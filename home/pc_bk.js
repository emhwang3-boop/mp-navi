/* MosaicTrip.com 홈페이지 — 「내 예약」 (11-08 사장님 「로그인·내 예약」 통과 · 배치도 tour_site\wireframes\12_내예약_배치도)
 *  · 주소 #/bookings — 머리줄 「내 예약」 단추(home/pc.js) · 로그인 안 했으면 로그인 창(pg.js mpPG)부터
 *  · 맨 윗줄: 「내 예약」 + 한 줄 설명 + 「○○ 계정으로 로그인 · 로그아웃」
 *  · 왼쪽 240: 보기(다가오는 예약 · 지난 예약) · 종류(전체 · 가이드 인솔 · 패키지 · 일정 검토) — 같은 크기 단추
 *  · 가운데: 예약 카드(가이드 인솔 · 패키지 · 일정 검토) — 카드 단추는 같은 크기 오른쪽 맞춤 [💬 대화방] [예약 내용] · 패키지 [★ 별점·후기] · 일정 검토 [내 일정 보기]
 *  · 오른쪽 420: 고른 예약의 대화방 = 앱 대화방 그대로(chat.js CHAT.embed — 같은 방·같은 그리기·「투어 완료」·후기)
 *  · 자료 = 앱 near.js NEARBK.mine(이 기기 예약 + 로그인 계정에 묶인 예약, 허브 /guide/mybk) · NEARBK.srv(다시 받기) — 로그아웃하면 이 화면은 로그인 안내만
 *  · 「지난 예약」 = 취소·환불 · 후기까지 끝난 예약 · 끝난 지 7일 지난 예약(대화방이 읽기 전용이 되는 때) · 일정 검토는 검토를 받고 여행이 끝난 것
 *  · 폰(좁은 화면)은 한 줄로 쌓고, 대화방은 앱처럼 화면 가운데 창(CHAT.room)
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document;
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function F6(o,m){ var s=L6(o); for(var k in m) s=s.split("{"+k+"}").join(m[k]); return s; }
function BK(){ return window.NEARBK||null; }
function NI(){ return window.NEARIG||null; }
function sess(){ try{ return localStorage.getItem("mpv_pg_sess")||""; }catch(e){ return ""; } }
function wide(){ return !(window.matchMedia&&matchMedia("(max-width:1000px)").matches); }   // 넓으면 오른쪽 칸에 대화방, 좁으면 앱처럼 가운데 창

// ── 글 (6개 언어) ──
var TX={
 t:T6("내 예약","My bookings","予約確認","我的预约","我的預約","Mis reservas"),   // 머리줄 단추와 같은 말 (pc.js TX.bk)
 sub:T6("예약한 가이드 인솔·패키지·일정 검토를 한곳에서","Your guided trips, group tours and plan reviews in one place","予約したガイド同行・パッケージ・日程チェックをまとめて","在这里查看您预约的向导陪同、跟团游和行程检查","在這裡查看您預約的嚮導陪同、跟團遊和行程檢查","Tus viajes con guía, tours en grupo y revisiones del plan en un solo lugar"),
 who:T6("{e} 계정으로 로그인","Signed in as {e}","{e} でログイン中","已登录：{e}","已登入：{e}","Sesión iniciada como {e}"),
 out:T6("로그아웃","Sign out","ログアウト","退出登录","登出","Cerrar sesión"),
 view:T6("보기","Show","表示","查看","查看","Mostrar"),
 up:T6("다가오는 예약","Upcoming","これからの予約","即将到来","即將到來","Próximas"),
 past:T6("지난 예약","Past","過去の予約","已结束","已結束","Pasadas"),
 kind:T6("종류","Type","種類","类型","類型","Tipo"),
 all:T6("전체","All","すべて","全部","全部","Todas"),
 gbk:T6("가이드 인솔","Travel with Guide","ガイド同行","向导陪同","嚮導陪同","Viaje con guía"),
 pkg:T6("패키지","Group Tour","パッケージ","跟团游","跟團遊","Tour en grupo"),
 grv:T6("일정 검토","Plan review","日程チェック","行程检查","行程檢查","Revisión del plan"),
 // 왼쪽 종류 단추(2×2, 같은 크기 한 줄) — 영어·스페인어는 칸이 좁아 짧게 · 카드 이름표는 위 이름 그대로
 cGbk:T6("가이드 인솔","With guide","ガイド同行","向导陪同","嚮導陪同","Con guía"),
 cPkg:T6("패키지","Group tour","パッケージ","跟团游","跟團遊","En grupo"),
 cGrv:T6("일정 검토","Plan review","日程チェック","行程检查","行程檢查","Revisión"),
 note:T6("취소·환불된 예약, 후기까지 끝난 예약, 끝난 지 7일이 지난 예약은 「지난 예약」에 있어요.","Cancelled or refunded bookings, bookings you've finished reviewing, and bookings that ended over 7 days ago are under “Past”.","キャンセル・返金された予約、レビューまで終わった予約、終了から7日たった予約は「過去の予約」にあります。","已取消·退款的预约、已写完评价的预约，以及结束超过7天的预约都在「已结束」中。","已取消·退款的預約、已寫完評價的預約，以及結束超過7天的預約都在「已結束」中。","Las reservas canceladas o reembolsadas, las que ya reseñaste y las que terminaron hace más de 7 días están en «Pasadas»."),
 foot:T6("패키지는 투어 날부터 「별점·후기」 단추가 생겨요. 가이드 인솔은 대화방에서 「투어 완료」를 누른 뒤 후기를 남겨요.","For group tours, the “Rate & review” button appears from the tour day. For trips with a guide, tap “Tour done” in the chat, then leave a review.","パッケージはツアー当日から「評価・レビュー」ボタンが表示されます。ガイド同行はチャットで「ツアー完了」を押してからレビューを書きます。","跟团游从导览当天起会出现「评分·评价」按钮。向导陪同请在聊天室点击「导览完成」后再写评价。","跟團遊從導覽當天起會出現「評分·評價」按鈕。嚮導陪同請在聊天室點擊「導覽完成」後再寫評價。","En los tours en grupo, el botón «Valorar y reseñar» aparece desde el día del tour. En los viajes con guía, pulsa «Tour completado» en el chat y luego deja tu reseña."),
 load:T6("불러오는 중…","Loading…","読み込み中…","加载中…","載入中…","Cargando…"),
 err:T6("예약을 불러오지 못했어요. 잠시 뒤 다시 해 주세요.","We couldn't load your bookings. Please try again shortly.","予約を読み込めませんでした。しばらくしてからもう一度お試しください。","无法加载预约，请稍后再试。","無法載入預約，請稍後再試。","No pudimos cargar tus reservas. Inténtalo de nuevo en un momento."),
 retry:T6("다시 불러오기","Try again","再読み込み","重新加载","重新載入","Reintentar"),
 noUp:T6("다가오는 예약이 없어요.","No upcoming bookings.","これからの予約はありません。","没有即将到来的预约。","沒有即將到來的預約。","No tienes próximas reservas."),
 noPast:T6("지난 예약이 없어요.","No past bookings.","過去の予約はありません。","没有已结束的预约。","沒有已結束的預約。","No tienes reservas pasadas."),
 none:T6("아직 예약이 없어요. 가이드 인솔·패키지·가이드 일정 검토를 예약하면 여기에 모여요.","No bookings yet. Trips with a guide, group tours and plan reviews you book will show up here.","まだ予約はありません。ガイド同行・パッケージ・ガイドによる日程チェックを予約すると、ここにまとまります。","还没有预约。预约向导陪同、跟团游或向导行程检查后，会显示在这里。","還沒有預約。預約嚮導陪同、跟團遊或嚮導行程檢查後，會顯示在這裡。","Aún no tienes reservas. Aquí aparecerán los viajes con guía, los tours en grupo y las revisiones del plan que reserves."),
 goG:T6("가이드 고르기 ›","Choose a guide ›","ガイドを選ぶ ›","选择向导 ›","選擇嚮導 ›","Elige un guía ›"),   // 첫 화면 세 가지 여행 방법 단추와 같은 말
 goP:T6("상품 보기 ›","See tours ›","商品を見る ›","查看产品 ›","查看商品 ›","Ver tours ›"),
 goA:T6("일정 짜기 ›","Plan a trip ›","日程を作る ›","制定行程 ›","制定行程 ›","Planear viaje ›"),
 lgT:T6("로그인하면 PC·폰 어디서든 같은 예약을 볼 수 있어요.","Sign in to see the same bookings on any PC or phone.","ログインすると、PCでもスマホでも同じ予約を見られます。","登录后，在电脑和手机上都能看到同样的预约。","登入後，在電腦和手機上都能看到同樣的預約。","Inicia sesión para ver las mismas reservas en cualquier PC o móvil."),
 lgB:T6("로그인","Sign in","ログイン","登录","登入","Iniciar sesión"),
 sConf:T6("가이드 확정","Guide confirmed","ガイド確定","向导已确认","嚮導已確認","Guía confirmado"),
 sWait:T6("가이드 확정 대기","Waiting for a guide","ガイド確定待ち","等待向导确认","等待嚮導確認","Esperando un guía"),
 sDone:T6("투어 완료","Tour done","ツアー完了","导览已完成","導覽已完成","Tour completado"),
 sCx:T6("취소됨","Cancelled","キャンセル済み","已取消","已取消","Cancelada"),
 sRf:T6("환불됨","Refunded","返金済み","已退款","已退款","Reembolsada"),
 sDrv:T6("기사 확정","Driver confirmed","ドライバー確定","司机已确认","司機已確認","Conductor confirmado"),   // 차량 대절 (11-11)
 sDrvW:T6("기사 배정 대기","Waiting for a driver","ドライバー手配待ち","等待安排司机","等待安排司機","Esperando conductor"),
 sRvw:T6("검토 중","Under review","チェック中","检查中","檢查中","En revisión"),
 sRvd:T6("검토 끝 · 메일 보냄","Reviewed · emailed","チェック完了・メール送信済み","检查完成 · 已发邮件","檢查完成 · 已寄郵件","Revisada · enviada por correo"),
 paid:T6("결제 {a}","Paid {a}","お支払い {a}","已付 {a}","已付 {a}","Pagado {a}"),
 paidOn:T6("{d} 결제 · {a}","Paid on {d} · {a}","{d} お支払い・{a}","{d} 付款 · {a}","{d} 付款 · {a}","Pagado el {d} · {a}"),
 days:T6("{n}일","{n} days","{n}日間","{n}天","{n}天","{n} días"),
 ppl:T6("{n}명","{n} people","{n}名","{n}人","{n}人","{n} personas"),
 ppl1:T6("1명","1 person","1名","1人","1人","1 persona"),
 day1:T6("1일","1 day","1日間","1天","1天","1 día"),
 chat:T6("대화방","Chat","チャット","聊天","聊天","Chat"),
 det:T6("예약 내용","Details","予約内容","预约详情","預約詳情","Detalles"),
 rv:T6("별점·후기","Rate & review","評価・レビュー","评分·评价","評分·評價","Valorar y reseñar"),
 rvd:T6("후기 남김","Reviewed","レビュー済み","已评价","已評價","Reseñada"),
 cT:T6("가이드와 대화","Chat with your guide","ガイドとチャット","与向导聊天","與嚮導聊天","Chatea con tu guía"),   // 앱 「내 예약」 단추와 같은 말
 cS:T6("앱과 같은 대화방이에요.","The same chat room as in the app.","アプリと同じチャットです。","与应用里的聊天室相同。","與應用程式裡的聊天室相同。","Es la misma sala de chat que en la app."),
 cPick:T6("예약 카드의 「대화방」을 누르면 여기에서 바로 대화할 수 있어요.","Click “Chat” on a booking card to talk here.","予約カードの「チャット」を押すと、ここですぐ話せます。","点击预约卡片上的「聊天」，即可在这里直接聊天。","點擊預約卡片上的「聊天」，即可在這裡直接聊天。","Pulsa «Chat» en una reserva para hablar aquí."),
 cNoGrv:T6("일정 검토는 대화방이 없어요. 가이드가 검토한 결과를 메일로 보내 드려요.","Plan reviews have no chat room. The guide's review is sent to you by email.","日程チェックにはチャットがありません。ガイドのチェック結果はメールでお送りします。","行程检查没有聊天室，向导的检查结果会通过邮件发送给您。","行程檢查沒有聊天室，嚮導的檢查結果會以電子郵件寄給您。","Las revisiones del plan no tienen chat. Te enviamos por correo la revisión del guía."),
 cNo:T6("이 예약은 대화방이 없어요.","This booking has no chat room.","この予約にはチャットがありません。","此预约没有聊天室。","此預約沒有聊天室。","Esta reserva no tiene chat."),
 close:T6("닫기","Close","閉じる","关闭","關閉","Cerrar"),
 rKind:T6("종류","Type","種類","类型","類型","Tipo"),
 rProd:T6("상품","Product","商品","商品","商品","Producto"),
 rGuide:T6("가이드","Guide","ガイド","向导","嚮導","Guía"),
 rBy:T6("예약자","Booked by","予約者","预订人","預訂人","Reservado por"),
 rWhen:T6("날짜·시간","Date & time","日時","日期·时间","日期·時間","Fecha y hora"),
 rEnd:T6("끝나는 시간","Ends at","終了時刻","结束时间","結束時間","Termina a las"),
 rTrip:T6("여행","Trip","旅行","旅行","旅行","Viaje"),
 rN:T6("인원","People","人数","人数","人數","Personas"),
 rAmt:T6("결제 금액","Amount paid","決済金額","付款金额","付款金額","Importe pagado"),
 rOid:T6("주문번호","Order no.","注文番号","订单号","訂單號","N.º de pedido"),
 rSt:T6("상태","Status","状態","状态","狀態","Estado"),
 rDue:T6("검토 마감","Review due","チェック期限","检查截止","檢查截止","Plazo de revisión")
};
var WD={ko:["일","월","화","수","목","금","토"],ja:["日","月","火","水","木","金","土"],zhs:["周日","周一","周二","周三","周四","周五","周六"],zht:["週日","週一","週二","週三","週四","週五","週六"],en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],es:["dom","lun","mar","mié","jue","vie","sáb"]};
var MON_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], MON_ES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fDate(s,wd){ var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(String(s||"")); if(!m) return String(s||""); var y=+m[1], mo=+m[2], d=+m[3], w=new Date(Date.UTC(y,mo-1,d)).getUTCDay(), l=window.LANG||"en", W=(WD[l]||WD.en)[w];
  if(l==="ko") return mo+"월 "+d+"일"+(wd?" ("+W+")":""); if(l==="ja") return mo+"月"+d+"日"+(wd?"("+W+")":"");
  if(l==="zhs"||l==="zht") return mo+"月"+d+"日"+(wd?" ("+W+")":""); if(l==="es") return (wd?W+" ":"")+d+" "+MON_ES[mo-1]; return (wd?W+", ":"")+MON_EN[mo-1]+" "+d; }
function won(n){ var a=Number(n||0).toLocaleString("ko-KR"); return window.LANG==="ko"?a+"원":"₩"+a; }
function gName(g){ if(!g) return ""; var l=window.LANG||"en", nm=g.name||""; if(l==="ko") return nm; var f=l==="ja"?(g.name_ja||g.name_en):(l==="zhs"||l==="zht")?(g.name_zh||g.name_en):g.name_en; return f||nm; }
function lgName(l){ try{ return NI()&&NI().langName?NI().langName(l):l; }catch(e){ return l||""; } }
function modeTx(k){ try{ return NI()&&k&&k.mode?NI().modeTxt({mode:k.mode,h:k.h,d:k.d}):""; }catch(e){ return ""; } }
function pplTx(n){ n=+n||1; return F6(n===1?TX.ppl1:TX.ppl,{n:n}); }
function kstHm(ms){ return new Date((+ms||0)+9*36e5).toISOString().slice(11,16); }

// ── 상태 ──
var V={f:"up",k:"all",sel:"",auto:true,err:false,loaded:false,tm:null,email:"",emS:""};
function items(){ try{ return BK()?BK().mine():[]; }catch(e){ return []; } }
function cx(x){ return x.status==="cancelled"||x.status==="refunded"; }
function startMs(x){ var t=Date.parse(String(x.date||"")+"T"+(/^\d\d:\d\d$/.test(x.time||"")?x.time:"00:00")+":00+09:00"); return isFinite(t)?t:0; }
function isPast(x){ var now=Date.now();
  if(cx(x)) return true;
  if(x.kind==="grv"){ var g=x.grv||{}; return !!(g.end||(g.sent&&(x.end||0)<now)); }
  if(x.rvd&&(x.done||x.kind==="pkg")) return true;
  return (x.end||0)>0&&(x.end||0)<now-7*864e5; }
function shown(){ var a=items().filter(function(x){ return (V.f==="past")===isPast(x)&&(V.k==="all"||x.kind===V.k); });
  a.sort(function(p,q){ return V.f==="past"?startMs(q)-startMs(p):startMs(p)-startMs(q); }); return a; }
function canChat(x){ return !!(x.tk&&x.room&&!cx(x)); }

// ── 카드 ──
function stTx(x){ if(x.status==="refunded") return [TX.sRf,"x"]; if(x.status==="cancelled") return [TX.sCx,"x"];
  if(x.kind==="grv") return x.grv&&x.grv.sent?[TX.sRvd,"ok"]:[TX.sRvw,"w"];
  if(x.chr) return x.chr.drv?[TX.sDrv,"ok"]:[TX.sDrvW,"w"];   // 차량 대절 — 사장님이 기사를 넣으면 확정 (11-11)
  if(x.done) return [TX.sDone,"ok"]; if(x.kind==="pkg"&&!x.g) return [TX.sWait,"w"]; return [TX.sConf,"ok"]; }
function card(x){ var B=BK(), st=stTx(x), ttl="", meta="", btn=[], badge=x.chr&&window.CHR?CHR.tx("t"):L6(TX[x.kind]||TX.pkg);   // 차량 대절 이름표 (11-11)
  if(x.kind==="gbk"){ ttl=[modeTx(x.k),gName(x.g),x.glang?lgName(x.glang):""].filter(Boolean).join(" · ");
    meta=fDate(x.date,1)+" "+(x.time||"")+" (KST) · "+pplTx(x.n)+" · "+F6(TX.paid,{a:won(x.amount)}); }
  else if(x.kind==="grv"){ var g=x.grv||{}, n=g.days||1; ttl=L6(B.TX.grvT)+" · "+(n===1?L6(TX.day1):F6(TX.days,{n:n}));
    meta=(x.paid?F6(TX.paidOn,{d:fDate(String(x.paid).slice(0,10)),a:won(x.amount)}):F6(TX.paid,{a:won(x.amount)}))+(g.sent||cx(x)?"":" · "+F6(B.TX.grvWait,{t:B.when(g.due||0)})); }
  else { ttl=x.pname||""; meta=fDate(x.date,1)+" "+(x.time||"")+" (KST) · "+pplTx(x.n)+" · "+F6(TX.paid,{a:won(x.amount)})+(x.g?" · "+L6(TX.rGuide)+" "+gName(x.g):""); }
  if(canChat(x)){ var u=x.room&&x.room.unread>0?' <span class="bk-u">'+x.room.unread+'</span>':''; btn.push('<button type="button" class="bk-b pri" data-bk="chat" data-o="'+E(x.oid)+'">💬 '+E(L6(TX.chat))+u+'</button>'); }
  if(x.kind==="pkg"&&x.g&&!cx(x)){ if(x.rvd) btn.push('<button type="button" class="bk-b" disabled>✓ '+E(L6(TX.rvd))+'</button>');
    else if(x.rv){ var early=x.rvFrom&&new Date(Date.now()+9*36e5).toISOString().slice(0,10)<x.rvFrom; btn.push('<button type="button" class="bk-b" data-bk="rv" data-o="'+E(x.oid)+'"'+(early?' disabled title="'+E(F6(B.TX.rvAt,{d:x.rvFrom}))+'"':'')+'>★ '+E(L6(TX.rv))+'</button>'); } }
  if(x.kind==="grv"&&!cx(x)){ btn.push('<button type="button" class="bk-b" data-bk="plan" data-o="'+E(x.oid)+'">'+E(L6(B.TX.plan))+'</button>'); if(x.grv&&x.grv.sent) btn.push('<button type="button" class="bk-b" data-bk="plan" data-rev="1" data-o="'+E(x.oid)+'">'+E(L6(B.TX.planRev))+'</button>'); }
  btn.push('<button type="button" class="bk-b" data-bk="det" data-o="'+E(x.oid)+'">'+E(L6(TX.det))+'</button>');
  return '<article class="bk-c'+(V.sel===x.oid?" on":"")+(cx(x)?" cx":"")+'" data-o="'+E(x.oid)+'"><div class="bk-ct"><span class="bk-k k-'+E(x.kind)+'">'+E(badge)+'</span><span class="bk-s s-'+st[1]+'">'+E(L6(st[0]))+'</span></div>'
    +'<h3>'+E(ttl)+'</h3><div class="bk-m">'+E(meta)+'</div>'+(x.chr&&window.CHR?CHR.vchHtml(x):'')+(x.kind==="pkg"&&window.SMN?SMN.vchHtml(x):'')+'<div class="bk-bs">'+btn.join("")+'</div></article>'; }   // 모바일 바우처 (11-10, smenu.js)

// ── 그리기 ──
var ROOT=null;
function frame(box){ ROOT=box;
  box.innerHTML='<div class="bk3"><header class="pn-hd bk-hd"><h1></h1><p class="bk-sub"></p><div class="bk-who"></div></header>'
   +'<div class="bk-g"><aside class="bk-side"></aside><main class="bk-main"></main><aside class="bk-r"><div class="bk-rh"><h2></h2><p></p></div><div class="bk-room" id="bkRoom"></div></aside></div></div>';
  box.addEventListener("click",onClick); }
function q(s){ return ROOT?ROOT.querySelector(s):null; }
function paint(){ if(!ROOT||!D.body.contains(ROOT)) return; var on=!!sess();
  q(".bk-hd h1").textContent=L6(TX.t); q(".bk-sub").textContent=L6(TX.sub);
  q(".bk-who").innerHTML=on&&V.email?'<span>'+E(F6(TX.who,{e:V.email}))+'</span> · <button type="button" class="bk-lnk" data-bk="out">'+E(L6(TX.out))+'</button>':(on?'<button type="button" class="bk-lnk" data-bk="out">'+E(L6(TX.out))+'</button>':'');
  q(".bk-rh h2").textContent="💬 "+L6(TX.cT); q(".bk-rh p").textContent=L6(TX.cS);
  ROOT.querySelector(".bk3").classList.toggle("lo",!on);
  if(!on){ q(".bk-side").innerHTML=""; q(".bk-main").innerHTML='<div class="bk-empty"><p>'+E(L6(TX.lgT))+'</p><div class="bk-bs c"><button type="button" class="bk-b pri" data-bk="login">'+E(L6(TX.lgB))+'</button></div></div>'; roomPaint(null); return; }
  var ch=function(k,v,lab){ return '<button type="button" data-bk="'+k+'" data-v="'+v+'" class="'+(V[k==="f"?"f":"k"]===v?"on":"")+'">'+E(L6(lab))+'</button>'; };
  q(".bk-side").innerHTML='<h3>'+E(L6(TX.view))+'</h3><div class="bk-ch c2">'+ch("f","up",TX.up)+ch("f","past",TX.past)+'</div>'
    +'<h3>'+E(L6(TX.kind))+'</h3><div class="bk-ch c2">'+ch("k","all",TX.all)+ch("k","gbk",TX.cGbk)+ch("k","pkg",TX.cPkg)+ch("k","grv",TX.cGrv)+'</div><p class="bk-nt">'+E(L6(TX.note))+'</p>';
  var all=items(), a=shown(), m=q(".bk-main");
  if(!V.loaded&&!all.length){ m.innerHTML='<div class="bk-empty"><p>'+E(L6(TX.load))+'</p></div>'; roomPaint(null); return; }
  if(V.err&&!all.length){ m.innerHTML='<div class="bk-empty"><p>'+E(L6(TX.err))+'</p><div class="bk-bs c"><button type="button" class="bk-b" data-bk="retry">'+E(L6(TX.retry))+'</button></div></div>'; roomPaint(null); return; }
  if(!all.length){ m.innerHTML='<div class="bk-empty"><p>'+E(L6(TX.none))+'</p><div class="bk-bs c"><button type="button" class="bk-b" data-bk="go" data-v="guide">'+E(L6(TX.goG))+'</button><button type="button" class="bk-b" data-bk="go" data-v="package">'+E(L6(TX.goP))+'</button><button type="button" class="bk-b" data-bk="go" data-v="ai">'+E(L6(TX.goA))+'</button></div></div>'; roomPaint(null); eqBtns(); return; }
  if(V.sel&&!a.some(function(x){ return x.oid===V.sel; })) V.sel="";
  if((!V.sel||V.auto)&&wide()){ var f=a.filter(canChat)[0]||a[0]; V.sel=f?f.oid:""; V.auto=true; }   // 배치도 — 첫 예약(대화방 있는 것 먼저)을 골라 오른쪽에 그 방 · 손님이 고르기 전까지는 목록이 바뀌면 다시 고른다
  m.innerHTML=(a.length?a.map(card).join(""):'<div class="bk-empty"><p>'+E(L6(V.f==="past"?TX.noPast:TX.noUp))+'</p></div>')+'<p class="bk-foot">'+E(L6(TX.foot))+'</p>';
  roomPaint(V.loaded?(a.filter(function(x){ return x.oid===V.sel; })[0]||null):null); eqBtns(); }   // 계정 목록을 받기 전엔 방을 열지 않는다(고른 예약이 바뀔 수 있어서)
// 카드 단추 같은 크기 (사장님 11-08 「카드 오른쪽 단추들은 같은 크기로 오른쪽 맞춤」) — 이 화면의 카드 단추 중 가장 넓은 것에 맞춤
function eqBtns(){ if(!ROOT) return; [".bk-main .bk-c .bk-b",".bk-empty .bk-b"].forEach(function(s){ var bs=[].slice.call(ROOT.querySelectorAll(s)); bs.forEach(function(b){ b.style.minWidth=""; }); var w=0; bs.forEach(function(b){ w=Math.max(w,b.offsetWidth); }); if(w) bs.forEach(function(b){ b.style.minWidth=Math.ceil(w)+"px"; }); }); }
// 오른쪽 대화방 — 앱 대화방(chat.js)을 이 칸에 그대로
var ROOMTK="";
function roomPaint(x){ var r=D.getElementById("bkRoom"); if(!r) return; var C=window.CHAT;
  if(!wide()){ if(ROOMTK&&C&&C.unembed) C.unembed(); ROOMTK=""; r.innerHTML=""; return; }
  if(x&&canChat(x)&&C&&C.embed){ if(ROOMTK===x.tk&&C.embTk&&C.embTk()===x.tk&&r.querySelector(".chemb")) return; ROOMTK=x.tk; C.embed(r,x.tk); return; }
  if(ROOMTK&&C&&C.unembed) C.unembed(); ROOMTK="";
  r.innerHTML='<div class="bk-rp">'+E(L6(!V.loaded?TX.load:!x?TX.cPick:x.kind==="grv"?TX.cNoGrv:TX.cNo))+'</div>'; }

// ── 예약 내용 (화면 가운데 창) ──
function detOpen(x){ var B=BK(), rows=[], r=function(a,b){ rows.push('<div class="bk-dr"><span>'+E(L6(a))+'</span><b>'+E(b)+'</b></div>'); }, st=stTx(x);
  r(TX.rKind,x.chr&&window.CHR?CHR.tx("t"):L6(TX[x.kind]||TX.pkg));
  if(x.chr&&x.chr.drv&&window.CHR){ r(CHR.T.drv,x.chr.drv.nm||""); r(CHR.T.tel,x.chr.drv.tel||""); r(CHR.T.car,x.chr.drv.car||""); }   // 차량 대절 기사 (11-11)
  if(x.kind==="gbk"){ r(TX.rGuide,[gName(x.g),modeTx(x.k)].filter(Boolean).join(" · ")); }
  else if(x.kind==="grv"){ r(TX.rProd,L6(B.TX.grvT)); r(TX.rTrip,F6(B.TX.grvD,{d:fDate(x.date),n:(x.grv&&x.grv.days)||1})); if(x.grv&&x.grv.due&&!x.grv.sent&&!cx(x)) r(TX.rDue,B.when(x.grv.due)+" (KST)"); }
  else { r(TX.rProd,x.pname||""); if(x.g) r(TX.rGuide,gName(x.g)); }
  if(x.cust) r(TX.rBy,x.cust);
  if(x.kind!=="grv"){ r(TX.rWhen,fDate(x.date,1)+" "+(x.time||"")+" (KST)"); if(x.kind==="gbk"&&x.end) r(TX.rEnd,B.when(x.end)+" (KST)"); r(TX.rN,pplTx(x.n)); }
  r(TX.rAmt,won(x.amount)); r(TX.rOid,x.oid); r(TX.rSt,L6(st[0]));
  var o=D.getElementById("bkDet"); if(o) o.remove(); o=D.createElement("div"); o.id="bkDet"; o.className="bk-ov";
  o.innerHTML='<div class="bk-pop" role="dialog" aria-modal="true"><div class="bk-ph"><h3>'+E(L6(TX.det))+'</h3><button type="button" class="bk-x" data-bkd="x" aria-label="'+E(L6(TX.close))+'">✕</button></div>'+rows.join("")
    +'<div class="bk-bs">'+(canChat(x)?'<button type="button" class="bk-b pri" data-bkd="chat">💬 '+E(L6(TX.chat))+'</button>':'')+'<button type="button" class="bk-b" data-bkd="x">'+E(L6(TX.close))+'</button></div></div>';
  o.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-bkd]"); if(e.target===o||(t&&t.dataset.bkd==="x")){ o.remove(); return; } if(t&&t.dataset.bkd==="chat"){ o.remove(); openChat(x); } });
  D.body.appendChild(o);
  var bs=[].slice.call(o.querySelectorAll(".bk-bs .bk-b")), w=0; bs.forEach(function(b){ w=Math.max(w,b.offsetWidth); }); if(w) bs.forEach(function(b){ b.style.minWidth=Math.ceil(w)+"px"; }); }
function openChat(x){ if(!canChat(x)) return; if(wide()){ V.sel=x.oid; V.auto=false; paint(); try{ var r=D.getElementById("bkRoom"); if(r&&r.getBoundingClientRect().top<0) r.scrollIntoView({block:"start",behavior:"smooth"}); }catch(e){} return; } try{ if(window.CHAT) CHAT.room(x.tk); }catch(e){} }

// ── 단추 ──
function byOid(o){ return items().filter(function(x){ return x.oid===o; })[0]||null; }
function onClick(e){ var b=e.target.closest&&e.target.closest("[data-bk]"); if(!b||b.disabled){ var c=e.target.closest&&e.target.closest(".bk-c"); if(c&&!b&&wide()){ var x0=byOid(c.dataset.o); if(x0&&V.sel!==x0.oid){ V.sel=x0.oid; V.auto=false; paint(); } } return; }
  var k=b.dataset.bk, x=b.dataset.o?byOid(b.dataset.o):null;
  if(k==="f"||k==="k"){ V[k]=b.dataset.v; V.sel=""; V.auto=true; paint(); return; }
  if(k==="chat"&&x){ openChat(x); return; }
  if(k==="det"&&x){ detOpen(x); return; }
  if(k==="rv"&&x&&x.rv){ try{ if(window.NEAR&&NEAR.review) NEAR.review(x.rv); }catch(z){} return; }
  if(k==="plan"&&x){ try{ BK().plan(x.oid,b.dataset.rev==="1",b); }catch(z){} return; }
  if(k==="login"){ try{ if(window.mpPG) mpPG.open(); }catch(z){} return; }
  if(k==="out"){ try{ if(window.mpPG&&mpPG.logout) mpPG.logout(); else localStorage.removeItem("mpv_pg_sess"); }catch(z){} V.email=""; V.emS=""; paint(); return; }
  if(k==="retry"){ load(true); return; }
  if(k==="go"){ if(window.PCGO) PCGO(b.dataset.v); return; } }

// ── 받기 — 이 기기 예약을 계정에 묶고 계정 목록(NEARBK.srv) · 로그인 이메일(/npg/me) ──
function load(force){ var B=BK(), s=sess(); if(!s){ V.loaded=true; paint(); return; }
  if(!B||!B.srv){ V.loaded=true; V.err=true; paint(); return; }
  B.srv(!!force).then(function(r){ V.loaded=true; V.err=!r&&!!sess(); paint(); });
  if(V.emS!==s){ V.emS=s; fetch((window.HUB||"https://brief-live-hub.emhwang3.workers.dev")+"/npg/me",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({sess:s})}).then(function(r){ return r.json(); })
    .then(function(j){ if(sess()!==s) return; if(j&&j.ok&&j.me){ V.email=j.me.email||j.me.name||""; paint(); } }).catch(function(){}); } }
function here(){ return /^#\/?bookings(\/|$)/.test(location.hash||""); }
function btnOn(){ var b=D.getElementById("phBk"); if(b) b.classList.toggle("on",here()); }

PCREG("bookings",function(box){ V.sel=""; V.auto=true; V.err=false; V.loaded=false; frame(box); paint(); btnOn();
  if(!sess()){ setTimeout(function(){ if(here()&&!sess()) try{ if(window.mpPG) mpPG.open(); }catch(e){} },150); }   // 로그인 안 했으면 로그인 창부터 (배치도)
  load(true);
  if(V.tm) clearInterval(V.tm); V.tm=setInterval(function(){ if(!here()){ clearInterval(V.tm); V.tm=null; return; } if(!D.hidden&&sess()) load(true); },60000); });   // 1분마다 — 가이드 확정·안 읽은 수
D.addEventListener("mpbk",function(){ if(here()){ V.loaded=true; paint(); } });   // near.js 가 계정 목록을 다 받았을 때
D.addEventListener("mppg",function(){ if(!here()) return; V.sel=""; V.auto=true; V.email=""; V.emS=""; if(sess()){ V.loaded=false; paint(); load(true); } else { if(window.CHAT&&CHAT.unembed) CHAT.unembed(); ROOMTK=""; paint(); } });   // 로그인·로그아웃
window.addEventListener("hashchange",function(){ btnOn(); if(!here()){ if(ROOMTK&&window.CHAT&&CHAT.unembed) CHAT.unembed(); ROOMTK=""; var o=D.getElementById("bkDet"); if(o) o.remove(); } });
window.addEventListener("resize",function(){ if(!here()) return; clearTimeout(V.rz); V.rz=setTimeout(function(){ paint(); },200); });
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(here()){ ROOMTK=""; paint(); } }catch(e){} return r; };   // 언어 바꾸면 다시 (대화방도 그 언어로)
btnOn();
})();
