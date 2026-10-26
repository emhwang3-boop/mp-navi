/* 머니퍼즐 내비 — 조회창 「추천받기 / Get ideas」 AI 명소 추천 (사장님 2026-10-16)
 *  · 검색 단추 옆 「추천받기」: 손님 문장 → 허브 POST /nreco → ① 우리 지도 명소(목록 안 key 만, 서버가 대조) 0~5곳 + 한 줄 이유
 *    ② 목록에 맞는 곳이 적거나 바다·스키처럼 흔한 종류면 AI 가 준 카카오 검색어(kw) → 기존 /kplace(near=1)로 실제 장소를 가까운 순
 *       (기준: 폰에 「나」 위치가 있으면 그 위치 — 기존 검색처럼 ux/uy 만, 없으면 서울시청) ③ 계절 안내(note)
 *    ②' kw 는 먼저 허브 /gplace(구글 장소) — 별점 4.0↑·리뷰 30↑ 만, 유명도(별점×log 리뷰 수) 순. 거리는 순서에 안 쓰고 「나에게서 N km」 표시만(위치는 안 보냄)
 *       카드에 ★별점 (리뷰 수)·「Google」 표기. 구글 결과는 지도에 핀을 찍지 않는다(카드·구글 지도 링크만). 키 없음·실패·0곳이면 ②의 카카오 그대로 (10-20)
 *  · 지도: 고른 명소에 반짝이는 동그라미(번호) — 약도를 옮겨 다녀도 다시 그린다. ✕·새 검색이면 지운다
 *  · 「다시 짜줘 / Try again」: 이미 보여준 명소 key·검색어·카카오 장소는 빼고 새로. 횟수 제한 없음(허브 남용 막기만)
 *  · 이용권: hasPass() 로 막는 자리 — 지금은 trip.js 의 hasPass()=true 라 누구나. 결제 붙일 때 그 한 곳만 바꾸면 유료
 *  · 손님 문장은 이 기기에도 서버에도 남기지 않는다 · 위치는 서버로 안 보냄(카카오 결과 거리 계산은 화면에서) — 단 10-20부터 구글 /gplace 엔 위치(소수 2자리)를 보낸다(데모, 사장님)
 *  index.html 은 <script src="reco.js"> 한 줄뿐 — 전역(PLACES·CITY·VIEW·DET·_nm·ME·HUB·T·esc·LANG·viewSet·placeShow·spinGo·meBest·meGeoFrac·
 *  mapLoad·kmLL·kmTxt·telLine·linksTo·go·resClear·TRIP·hasPass·openPricing)을 부른다
 */
(function(){
"use strict";
var SEOUL=[37.5665,126.978];
var R={q:"",ex:[],exk:[],exn:[],kseen:{},kpos:[],picks:[],kits:[],note:"",on:false,busy:false,back:false};
function $(id){ return document.getElementById(id); }
function css(){ if($("rcCss")) return; var s=document.createElement("style"); s.id="rcCss";
  s.textContent=".sbox #recob{order:0;background:var(--blue)}"
  +".sbox{flex-direction:row;flex-wrap:wrap;justify-content:center}.sbox .qw,.sbox .desc{flex:0 0 100%}"   /* 폰 세로: 검색·추천받기 한 줄에 반씩 */
  +".sbox #gob,.sbox #recob{width:calc(min(260px,70%) / 2 - 5px)!important;box-sizing:border-box;text-align:center;margin:0!important;white-space:nowrap;padding-left:6px!important;padding-right:6px!important}"
  +".sbox #gfchips>button{flex:0 0 auto}"
  +"@media (orientation:landscape) and (max-height:560px),(min-width:900px) and (min-height:561px){.sbox{flex-wrap:nowrap}.sbox .qw{flex:1 1 200px}.sbox .desc{flex:none}"
  +".sbox #gob,.sbox #recob{width:auto!important;font-size:14px!important;padding:7px 14px!important;line-height:1.2}}"
  +".rchd{display:flex;align-items:baseline;gap:8px;margin:2px 44px 4px 4px;font-weight:800;font-size:15px}.rchd .d{font-weight:400;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
  +".rcnote{background:#fff9db;border:1px solid #ffe066;color:#5c4400;border-radius:12px;padding:8px 12px;font-size:13.5px;margin:6px 0}"
  +":root[data-theme=dark] .rcnote{background:#3b3212;border-color:#8a6d00;color:#ffe8a3}"
  +".rcit{cursor:pointer;position:relative;padding-left:46px!important}.rcno{position:absolute;left:12px;top:12px;width:24px;height:24px;border-radius:50%;background:#f08c00;color:#fff;font-weight:900;font-size:13px;line-height:24px;text-align:center}"
  +".rcwhy{color:var(--ink);font-size:14px;margin:3px 0 6px}.rcsec{font-size:13px;font-weight:800;color:var(--sub);margin:12px 4px 2px}.rcord{display:flex;gap:6px;margin:4px 4px 6px}.rcord button{flex:1;border:1px solid #c5d3e8;background:#fff;color:#1c5fb8;border-radius:999px;padding:6px 0;font-weight:800;font-size:13px}.rcord button.on{background:#1c5fb8;color:#fff;border-color:#1c5fb8}"
  +".rcbar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0 2px}.rcbar button{border:1.5px solid var(--blue);background:var(--card);color:var(--blue);font-weight:800;font-size:14px;border-radius:999px;padding:8px 16px;cursor:pointer}"
  +".rcbar button.pri{background:var(--blue);color:#fff}.rcmsg{text-align:center;color:var(--sub);font-size:14px;margin:10px 4px}"
  +".rcring{position:absolute;z-index:4;pointer-events:none;transform:translate(-50%,-50%);border-radius:50%;border:3px solid #f08c00;box-shadow:0 0 0 3px rgba(255,255,255,.85),0 0 14px 4px rgba(240,140,0,.75);animation:rcPulse 1.3s ease-in-out infinite}"
  +".rcring b{position:absolute;right:-6px;top:-6px;min-width:18px;height:18px;border-radius:9px;background:#f08c00;color:#fff;font-size:11px;line-height:18px;text-align:center;font-weight:900;padding:0 3px;box-shadow:0 0 0 2px #fff}"
  +"@keyframes rcPulse{0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%{opacity:.55;transform:translate(-50%,-50%) scale(1.18)}}"
  +"@media (prefers-reduced-motion:reduce){.rcring{animation:none}}"
  +".rchd .rcclr{float:right;border:1px solid var(--line);background:var(--card);color:var(--sub);border-radius:999px;font-size:12px;font-weight:800;padding:3px 10px;cursor:pointer;margin-left:8px}.rcbar .rcclr{background:var(--card);color:var(--sub)}"
  +".rcback{border:0;background:none;color:var(--blue);font-weight:800;font-size:14px;cursor:pointer;padding:4px 2px;margin:0 0 2px}";
  document.head.appendChild(s); }
function L(){ return LANG!=="ko"; }   // 외국어 화면 (10-18)
function RM(f){ f(); window._RR={f:f}; }   // #res 안내 — 언어를 바꾸면 lang.js 가 그 자리에서 다시 (10-18)
function pass(){ try{ return (window.TRIP&&TRIP.hasPass)?TRIP.hasPass():(typeof window.hasPass==="function"?window.hasPass():true); }catch(e){ return true; } }
function btn(){ css(); var b=$("recob"); if(!b){ var g=$("gob"); if(!g) return; g.insertAdjacentHTML("afterend",'<button type="button" id="recob"></button>'); b=$("recob"); b.onclick=function(){ recoGo(); }; }
  b.textContent=T("추천받기","Get ideas"); fit(b); }
// 글자가 단추보다 길면 글씨를 줄인다 (일본어 「おすすめを見る」 잘림, 사장님 10-18)
function fit(b){ b.style.removeProperty("font-size"); requestAnimationFrame(function(){ var fs=parseFloat(getComputedStyle(b).fontSize)||14, n=0; while(b.scrollWidth>b.clientWidth+1&&fs>9&&n++<14){ fs-=1; b.style.setProperty("font-size",fs+"px","important"); } }); }
function allMaps(){ return Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })); }
function origin(){ return (ME&&ME.pos)?ME.pos:SEOUL; }

// ── 부르기 ──
function recoGo(more){
  var q=more?R.q:$("q").value.trim(), out=$("res");
  if(!q){ $("q").focus(); RM(function(){ out.innerHTML='<div class="msg">'+esc(T("가고 싶은 여행을 문장으로 적고 「추천받기」를 눌러 주세요. 예: 한옥 구경하고 싶어","Type what you’d like to do, then tap “Get ideas”. e.g. I want to see traditional houses"))+'</div>'; }); return; }
  if(!pass()){ try{ openPricing(); }catch(e){} return; }   // 이용권 자리 — 지금은 hasPass()=true
  if(R.busy) return;
  if(!more){ R={q:q,ex:[],exk:[],exn:[],kseen:{},kpos:[],picks:[],kits:[],note:"",on:false,busy:false,back:false}; ringClear(); }
  var lg=LANG;   // 이 추천을 받은 언어 — 이유(why)·안내(note)는 이 언어 + 한국어(why_ko)
  R.busy=true; R.back=false;
  try{ spinClear(); }catch(e){}
  RM(function(){ out.innerHTML='<div class="msg">'+esc(T("AI가 고르는 중…","AI is picking places…"))+'</div>'; });
  try{ ntap("_reco","reco"); }catch(e){}
  var body=JSON.stringify({q:q,lang:LANG,ex:R.ex,exk:R.exk.concat(R.exn)});
  Promise.all([fetch(HUB+"/nreco",{method:"POST",headers:{"Content-Type":"application/json"},body:body}).then(function(r){ return r.json(); }),allMaps()]).then(function(a){
    var j=a[0]||{};
    if(!j.ok&&/^(pass|expired|dev)$/.test(j.err||"")){ R.busy=false;   // 이용권 스위치가 켜졌을 때만 오는 답 (pass.js)
      RM(function(){ out.innerHTML='<div class="msg">'+esc(j.err==="dev"?T("이 기기는 이용권 기기 목록에서 풀렸어요. 이용권 메일의 링크를 다시 열어 주세요.","This device was signed out of your pass. Open the link in your pass email again."):j.err==="expired"?T("이용권 기간이 끝났어요.","Your pass has expired."):T("「추천받기」는 이용권 기능이에요.","“Get ideas” is a pass feature."))+'</div><div class="rcbar"><button type="button" class="pri" data-rc="buy">'+esc(T("이용권 보기","See passes"))+'</button><button type="button" data-rc="resend">'+esc(T("이용권 다시 받기","Get my pass again"))+'</button></div>'; }); return; }
    if(!j.ok){ R.busy=false; RM(function(){ out.innerHTML='<div class="msg">'+esc(j.err==="rate"?T("잠시 뒤 다시 해 주세요 (요청이 많아요).","Too many requests — please try again shortly."):T("잠시 뒤 다시 해 주세요.","Please try again shortly."))+'</div>'+bar(false); }); return; }
    var picks=(j.picks||[]).filter(function(p){ return PLACES[p.k]&&R.ex.indexOf(p.k)<0; });
    picks.forEach(function(p){ R.ex.push(p.k); });
    var kws=(j.kw||[]).filter(function(k){ return k&&R.exk.indexOf(k)<0; }).slice(0,2);
    if(!kws.length&&(j.kw||[]).length) kws=(j.kw||[]).slice(0,1);   // 같은 검색어여도 다음 장소를 보여 준다
    kws.forEach(function(k){ if(R.exk.indexOf(k)<0) R.exk.push(k); });
    var nms=(j.nm||[]).filter(function(k){ return k&&R.exn.indexOf(k)<0; }).slice(0,4); nms.forEach(function(k){ R.exn.push(k); });
    return kGet(kws,nms,picks.length).then(function(kits){ R.busy=false; R.picks=picks; R.kits=kits; R.note=j.note||""; R.note_ko=j.note_ko||""; R.lg=lg; kits.forEach(function(x){ x._l=lg; }); R.on=true; paint(); });
  }).catch(function(){ R.busy=false; RM(function(){ out.innerHTML='<div class="msg">'+esc(T("잠시 뒤 다시 해 주세요.","Please try again shortly."))+'</div>'; }); });
}
// 카카오 실제 장소 — 기존 /kplace(near=1). 위치는 기존 검색처럼 ux/uy(있을 때만), 거리는 화면에서
var KHALL=/공간대여|웨딩|예식|돌잔치|연회/;   // AI 가 준 이름으로 찾을 때 예식장·공간대여는 빼기 (학인당 → 「학인당 영빈관 웨딩&돌잔치」, 사장님 10-23)
var KBAD=/편의점|주차장|부동산|주유소|은행|ATM|세탁|미용|학원|병원|약국/, KFOOD=/카페|커피|맛집|음식|식당|호텔|숙소|펜션|숙박/;
var KCAT=[[/스키|스노보드/,/^(스키장|슬로프)$/],[/해수욕장|해변|바다/,/해수욕장|해변/],[/온천/,/^온천/],[/아쿠아리움|수족관/,/아쿠아리움/],[/놀이공원|테마파크|놀이동산/,/^(테마파크|놀이공원)$/,null,3],[/사찰|산사|절$|템플/,/사찰/],
  [/캠핑|야영/,/캠핑|야영/],[/휴양림/,/휴양림/],[/계곡/,/계곡/],[/등산|산행/,/^(등산로|산)$/],[/동물원/,/동물원/],[/수목원|식물원/,/수목원|식물원/]];   // 검색어 종류 → 카카오 분류 끝칸
function kOne(u){ return fetch(u).then(function(r){ return r.json(); }).then(function(j){ return (j&&j.ok&&j.items)||[]; }).catch(function(){ return []; }); }
function gOne(kw){ var o=origin(); return fetch(HUB+"/gplace?q="+encodeURIComponent(kw)+"&lang="+encodeURIComponent(LANG)+"&lat="+(+o[0]).toFixed(2)+"&lng="+(+o[1]).toFixed(2)).then(function(r){ return r.json(); }).then(function(j){ return (j&&j.ok&&j.items)||[]; }).catch(function(){ return []; }); }   // 구글 — 실패면 빈 목록 → 카카오로 (10-20)
function kNorm(s){ return String(s||"").replace(/[\s·()\-_.,'’]/g,"").toLowerCase(); }
// kws = 종류 검색어(가까운 순 전국) · nms = AI 가 아는 실제 이름(카카오에서 확인된 것만 — 첫 결과가 그 이름일 때)
function kGet(kws,nms,np){ if(!kws.length&&!nms.length) return Promise.resolve([]); var o=origin(), ps=ME&&ME.pos, lg=kpL(), pq=ps?"&ux="+ps[1].toFixed(5)+"&uy="+ps[0].toFixed(5):"", G=[];
  var pk0=R.picks.map(function(p){ var P=PLACES[p.k]; return [+P.lat,+P.lng,kNorm(String(P.ko).split(" (")[0])]; });
  var gOk=function(x){ var ll=[+x.lat,+x.lng], xn=kNorm(x.name); if(!x.id||R.kseen["g:"+x.id]||G.some(function(y){ return y.id===x.id; })) return false;
    return !pk0.some(function(q){ var d=kmLL(q,ll); return d<0.4||(d<50&&q[2].length>=2&&(xn.indexOf(q[2])>=0||q[2].indexOf(xn)>=0)); }); };   // 우리 명소로 이미 고른 곳은 빼기
  var A=kws.map(function(kw){ return gOne(kw).then(function(g){ g=g.filter(gOk);   // 구글 먼저 — 0곳이면 카카오 (10-20)
      if(g.length){ g.forEach(function(x){ x._src="g"; x.dist=ps?Math.round(kmLL(ps,[+x.lat,+x.lng])*1000):null; G.push(x); }); return []; }
      return kOne(HUB+"/kplace?q="+encodeURIComponent(kw)+"&near=1"+lg+pq); }).then(function(it){
      var keep=/약국|병원|은행|ATM|편의점/.test(kw), tk=kw.split(/\s+/).filter(function(t){ return t.length>=2; });   // 손님이 그걸 찾으면 남긴다
      it=it.filter(function(x){ var c=String(x.cat||""); return keep||!(KBAD.test(c)||(!KFOOD.test(kw)&&np>0&&/음식점|카페|숙박/.test(c))); });   // 명소를 하나도 못 고른 가게 이름 검색(스타벅스 등)은 카페도 남긴다
      var cm=KCAT.find(function(z){ return z[0].test(kw); });   // 종류가 검색어와 맞는 곳만 (스키장 ↔ 수상스키·렌탈샵 가르기)
      it=it.filter(function(x){ var c=String(x.cat||""), ls=c.split(">").pop().trim();
        if(cm) return cm[1].test(ls)||(cm[2]&&cm[2].test(c));
        return tk.some(function(t){ return ls.indexOf(t)>=0; })||(/관광|명소|여행/.test(c)&&tk.some(function(t){ return String(x.name).indexOf(t)>=0; })); });
      it.forEach(function(x){ x._src="k"; x._g=!!cm||np>0; }); return it; }); });
  var B=nms.map(function(nm){ return kOne(HUB+"/kplace?q="+encodeURIComponent(nm)+lg+pq).then(function(it){ var a=kNorm(nm);
      var x=it.slice(0,5).find(function(y){ var b=kNorm(y.name); return (b===a||b.indexOf(a)===0)&&!KBAD.test(String(y.cat||""))&&!/음식점|카페/.test(String(y.cat||""))&&!KHALL.test(String(y.cat||"")+" "+y.name); });
      if(x){ x._src="n"; x._g=true; } return x?[x]:[]; }); });
  return Promise.all(B.concat(A)).then(function(ls){ var all=[], pk=R.picks.map(function(p){ var P=PLACES[p.k]; return [+P.lat,+P.lng,kNorm(String(P.ko).split(" (")[0])]; });
    ls.forEach(function(l){ l.forEach(function(x){ var ll=[+x.y,+x.x]; x._k=x.name+"|"+(+x.x).toFixed(3)+"|"+(+x.y).toFixed(3); x.dist=Math.round(kmLL(o,ll)*1000); x._n=1;
      if(R.kseen[x._k]||R.kpos.some(function(q){ return kmLL(q,ll)<0.8; })) return;   // 이미 보여 준 곳·그 곁은 빼기 (다시 짜줘)
      var xn=kNorm(x.name); if(pk.some(function(q){ var d=kmLL(q,ll); return d<0.4||(d<50&&q[2].length>=2&&(xn.indexOf(q[2])>=0||q[2].indexOf(xn)>=0)); })) return;   // 우리 명소로 이미 고른 곳(같은 자리·같은 이름)
      if(!x._g){ all.push(x); return; }
      var m=all.find(function(y){ return y._g&&kmLL([+y.y,+y.x],ll)<2; });   // 한 곳 여러 칸(곤지암리조트 슬로프·렌탈샵…)은 하나로 — 이름이 가장 짧은 칸
      if(!m){ all.push(x); return; } m._n++; if(x._src==="n"&&m._src!=="n"||(x._src===m._src&&String(x.name).length<String(m.name).length)){ var n=m._n; all[all.indexOf(m)]=x; x._n=n; } }); });
    all=all.filter(function(x){ var cm=x._src==="k"&&KCAT.find(function(z){ return z[3]&&kws.some(function(k){ return z[0].test(k); }); }); return !cm||x._n>=cm[3]; });   // 놀이공원은 시설이 여럿 모인 곳만(방탈출 가게 빼기)
    if(all.filter(function(x){ return x._src==="n"; }).length>=2) all=all.filter(function(x){ return x._src==="n"; });   // AI 가 아는 이름(카카오 확인)이 둘 이상이면 그것만 — 근처 아무 절·방탈출 가게보다 낫다
    all.sort(function(a,b){ return a.dist-b.dist; });
    var n=Math.max(3,5-Math.min(np,2)); G.sort(function(a,b){ return b.s-a.s; }); var g=G.slice(0,n);
    all=all.filter(function(x){ var xn=kNorm(x.name), ll=[+x.y,+x.x]; return !g.some(function(y){ var yn=kNorm(y.name), d=kmLL(ll,[+y.lat,+y.lng]); return d<0.4||(d<3&&xn.length>=2&&yn.length>=2&&(xn.indexOf(yn)>=0||yn.indexOf(xn)>=0)); }); });   // 위 구글 칸에 이미 나온 곳은 아래 칸에서 빼기 (남산골·북촌 두 번, 사장님 10-23)
    var r=all.slice(0,g.length?Math.max(2,n-g.length):n);   // 구글은 유명도 순(거리 아님)
    g.forEach(function(x){ R.kseen["g:"+x.id]=1; }); r.forEach(function(x){ R.kseen[x._k]=1; R.kpos.push([+x.y,+x.x]); }); return g.concat(r); }); }

// ── 그리기 ──
function bar(retry){ return '<div class="rcbar">'+(retry?'<button type="button" class="pri" data-rc="again">'+esc(T("다시 짜줘","Try again"))+'</button>':'')+'<button type="button" data-rc="search">'+esc(T("일반 검색으로 찾기","Regular search"))+'</button><button type="button" class="rcclr" data-rc="clear">'+esc(T("✕ 추천 지우기","✕ Clear picks"))+'</button></div>'; }
function has(k){ try{ return TRIP.state().items.some(function(x){ return x.k===k; }); }catch(e){ return false; } }
function addBtn(k){ var on=has(k); return '<div class="trbw"><button type="button" class="tradd'+(on?' on':'')+'" data-k="'+esc(k)+'" data-src="'+esc(k)+'">'+(on?T("✓ 담김 · 빼기","✓ Added · Remove"):T("＋ 일정에 담기","＋ Add to my trip"))+'</button></div>'; }
// 이유·안내 글 — 받은 언어면 그것, 한국어 화면은 why_ko(허브가 주면) 아니면 장소 설명(dko), 다른 외국어는 그 언어 장소 설명 (AI 를 다시 부르지 않는다, 10-18)
function whyTx(p,P){ if(LANG===R.lg) return p.why||LD(P)||""; if(LANG==="ko") return p.why_ko||LD(P)||""; return p["why_"+LANG]||LD(P)||""; }
function noteTx(){ if(LANG===R.lg) return R.note||""; if(LANG==="ko") return R.note_ko||""; return ""; }
function paint(keep){ var out=$("res"), en=L(), h='', n=0;
  var GK=(R.kits||[]).filter(function(x){ return x._src==="g"; }), KK=(R.kits||[]).filter(function(x){ return x._src!=="g"; });
  if(KK.length&&window.KL) KL.ensure(KK,"item",null,function(){ if(window._RR&&window._RR.reco) paint(true); });
  h+='<div class="rcwrap"><div class="rchd">'+esc(T("AI 추천","AI picks"))+'<span class="d" data-user="1">“'+esc(R.q)+'”</span></div>';
  if(noteTx()) h+='<div class="rcnote">'+esc(noteTx())+'</div>';
  R.picks.forEach(function(p,i){ var P=PLACES[p.k], nm=LN(P), sub=en?P.ko:"";
    h+='<div class="item rcit" data-rk="'+esc(p.k)+'"><span class="rcno">'+(i+1)+'</span><div class="t">'+esc(nm)+'</div>'+(sub?'<div class="d" style="margin:1px 0 0">'+esc(sub)+'</div>':'')
      +'<div class="rcwhy">'+esc(whyTx(p,P))+'</div>'+addBtn(p.k)+'</div>'; n++; });
  if(GK.length){ var gd=R.gord==="d"; GK=GK.slice().sort(gd?function(a,b){ return (a.dist==null?1e12:a.dist)-(b.dist==null?1e12:b.dist); }:function(a,b){ return (+b.rating-+a.rating)||(+b.n-+a.n); });   // 거리순·별점순 (사장님 10-21) — 구글 칸만, 카카오 칸은 거리순 그대로
    h+='<div class="rcsec">'+esc(gd?T("유명한 곳 (구글 · 가까운 순)","Popular places (Google · nearest first)"):T("유명한 곳 (구글 별점 높은 순)","Popular places (Google · top rated)"))+'</div>'
      +'<div class="rcord"><button type="button" data-rc="gord" data-o="r" class="'+(gd?'':'on')+'">'+esc(T("별점순","Top rated"))+'</button><button type="button" data-rc="gord" data-o="d" class="'+(gd?'on':'')+'">'+esc(T("거리순","Nearest"))+'</button></div>';   // 구글 — 카드만, 지도 핀 없음 (10-20)
    GK.forEach(function(x){ h+='<div class="item rcg"><div class="t">'+MPICO("mi_star",x.name,MIS)+'</div>'+(x.addr?'<div class="d">'+esc(x.addr)+'</div>':'')
      +'<div class="d"><b style="color:#f08c00">★'+(+x.rating).toFixed(1)+'</b> ('+(+x.n).toLocaleString("en-US")+') · <span style="font-weight:700">Google</span>'+(x.dist!=null?' · '+esc(T("나에게서","From you"))+' <b>'+kmTxt(x.dist)+'</b>':'')+'</div>'
      +(x.uri&&/^https:\/\//.test(x.uri)?'<div class="d" style="margin-top:4px"><a href="'+esc(x.uri)+'" target="_blank" rel="noopener">'+esc(T("구글 지도에서 보기","View on Google Maps"))+'</a></div>':'')+'</div>'; n++; }); }
  if(KK.length){ var fs=!(ME&&ME.pos), ai=KK.every(function(x){ return x._src==="n"; })&&KK.some(function(x){ return x.dist>30000; });   // AI 가 이름으로 고른 먼 곳이면 「가까운 곳」이 아니다 (사장님 10-23)
    h+='<div class="rcsec">'+esc(ai?T("AI가 고른 다른 지역","Other regions picked by AI"):fs?T("가까운 곳 (서울에서 가까운 순)","More places nearby (closest to Seoul)"):T("가까운 곳 (나에게서 가까운 순)","More places nearby (closest to you)"))+'</div>';
    window._sres=KK;
    KK.forEach(function(x,i){ var e2=en&&x.name_en, ttl=KS(e2?x.name_en:x.name), ad=e2?(x.addr_en||x.addr):x.addr, ct=e2?(x.cat_en||""):String(x.cat||"").split(">").pop().trim();
      h+='<div class="item sres rck" data-i="'+i+'" style="cursor:pointer"><div class="t">'+MPICO("mi_pin",ttl,MIS)+'</div>'+(e2?'<div class="d" style="margin:1px 0 0">'+esc(x.name)+'</div>':'')+'<div class="d">'+esc(ad||"")+(ct?' · '+esc(ct):'')+(x.dist!=null?' · <b>'+kmTxt(x.dist)+'</b>':'')+'</div>'
        +telLine(x.tel)+linksTo(x.name,x.y,x.x,x.name,x.addr)+'</div>'; n++; }); }
  if(!n) h+='<div class="rcmsg">'+esc(R.ex.length||R.exk.length?T("더 알맞은 곳이 적어요. 일반 검색으로도 찾아 보세요.","Few more places match. Try a regular search too."):T("알맞은 곳이 적어요. 일반 검색으로 찾아 보세요.","Few places match this. Try a regular search."))+'</div>';
  else if(R.picks.length+R.kits.length<3) h+='<div class="rcmsg">'+esc(T("알맞은 곳이 적어요 — 일반 검색도 해 보세요.","Only a few places match — try a regular search too."))+'</div>';
  h+=bar(n>0)+'</div>';
  out.innerHTML=h; window._RR={f:function(){ paint(true); },reco:1}; if(keep) return; showMap();
  clearTimeout(window._scT); window._scT=setTimeout(function(){ window.scrollTo({top:out.getBoundingClientRect().top+scrollY-70,behavior:"smooth"}); },120); }

// ── 지도 강조 ── 고른 곳을 모두 담는 가장 자세한 약도로 옮기고 동그라미
function showMap(){ if(!R.picks.length){ ringClear(); return; } if(DET){ ringDraw(); return; }
  var ids=R.picks.map(function(p){ var P=PLACES[p.k]; var id=meBest(+P.lat,+P.lng); return (!id||id===NAVI_ROOT)?"kr":id; });
  var ch=function(id){ var a=[]; while(id&&id!=="kr"&&CITY[id]){ a.unshift(id); id=CITY[id].parent; } a.unshift("kr"); return a; };
  var c=ch(ids[0]); ids.slice(1).forEach(function(id){ var d=ch(id), i=0; while(i<c.length&&i<d.length&&c[i]===d[i]) i++; c=c.slice(0,i); });
  var v=c.length?c[c.length-1]:"kr"; if(v===NAVI_ROOT) v="kr";
  if(VIEW!==v) viewSet(v); else ringDraw(); }
function ringClear(){ [].forEach.call(document.querySelectorAll("#mz .rcring"),function(e){ e.remove(); }); }
function ringDraw(){ ringClear(); if(!R.on||!R.picks.length||DET) return; var z=$("mz"), w=$("map").clientWidth, sz=Math.max(26,w*(VIEW==="kr"?0.05:0.07));
  R.picks.forEach(function(p,i){ var P=PLACES[p.k]; if(!P) return; var f=meGeoFrac(VIEW,+P.lat,+P.lng); if(!f||f[0]<0||f[0]>1||f[1]<0||f[1]>1) return;
    var e=document.createElement("div"); e.className="rcring"; e.style.left=(f[0]*100)+"%"; e.style.top=(f[1]*100)+"%"; e.style.width=e.style.height=sz+"px"; e.innerHTML="<b>"+(i+1)+"</b>"; z.appendChild(e); }); }
function rcOff(){ R.on=false; R.back=false; ringClear(); }

// ── 누르기 ──
document.addEventListener("click",function(e){ var t=e.target;
  var b=t.closest&&t.closest("[data-rc]"); if(b){ e.preventDefault(); if(b.dataset.rc==="gord"){ R.gord=b.dataset.o==="d"?"d":"r"; paint(true); } else if(b.dataset.rc==="again") recoGo(true); else if(b.dataset.rc==="search"){ var q=R.q; rcOff(); $("q").value=q; try{ qxSync(); }catch(x){} go(q); } else if(b.dataset.rc==="back"){ paint(); } else if(b.dataset.rc==="clear"){ rcOff(); R.picks=[]; R.kits=[]; window._RR=null; $("res").innerHTML=""; }   /* ✕ 추천 지우기 — 주황 고리·목록 모두 (사장님 10-18) */ else if(b.dataset.rc==="buy"){ try{ openPricing(); }catch(x){} } else if(b.dataset.rc==="resend"){ try{ NPASS.resend(); }catch(x){} } return; }
  if(t.closest&&(t.closest("a")||t.closest(".tradd"))) return;
  var c=t.closest&&t.closest("#res .rcit"); if(c){ var k=c.dataset.rk, P=PLACES[k]; if(!P) return; R.back=true;
    var id0=meBest(+P.lat,+P.lng)||NAVI_ROOT; if(DET){ try{ _nm.setCenter(new naver.maps.LatLng(+P.lat,+P.lng)); }catch(x){} } else spinGo(id0===NAVI_ROOT?"kr":id0,+P.lat,+P.lng,null);
    placeShow(k); try{ pinMark(k); }catch(x){} return; }
  if(t.closest&&t.closest("#res .rck")) R.back=true;   // 카카오 장소 — 기존 검색 핀(spinShow)이 연다
},true);
// 장소 카드를 연 뒤 「← AI 추천으로」
new MutationObserver(function(){ var r=$("res"); if(!R.back||!R.on||r.querySelector(".rcwrap")||r.querySelector(".rcback")||!r.querySelector(".item")) return;
  var it=r.querySelector(".item"); it.insertAdjacentHTML("beforebegin",'<button type="button" class="rcback" data-rc="back">← '+esc(T("AI 추천으로 돌아가기","Back to AI picks"))+'</button>'); }).observe($("res"),{childList:true});

// 전역 감싸기 — 약도를 옮기면 동그라미 다시 · 새 검색·✕·처음으로면 끔
var vs0=window.viewSet; window.viewSet=function(){ var r=vs0.apply(this,arguments); try{ ringDraw(); }catch(e){} return r; };
var go0=window.go; window.go=function(){ rcOff(); return go0.apply(this,arguments); };
var rc0=window.resClear; window.resClear=function(){ rcOff(); return rc0.apply(this,arguments); };
var ra0=window.resetAll; if(typeof ra0==="function") window.resetAll=function(){ rcOff(); return ra0.apply(this,arguments); };
var sl0=window.setLang; window.setLang=function(){ var r=sl0.apply(this,arguments); try{ btn(); }catch(e){} return r; };
var zs=new ResizeObserver(function(){ if(R.on) try{ ringDraw(); }catch(e){} }); try{ zs.observe($("map")); }catch(e){}
btn();
window.RECO={go:recoGo,state:function(){ return R; }};
})();
