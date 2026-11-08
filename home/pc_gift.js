/* MosaicTrip.com 홈페이지 — 선물 고르기 (11-08 4a단계 · 배치도 tour_site\wireframes\6_선물고르기_배치도 · 6b_선물고르기_명품_배치도, 사장님 11-08 통과)
 *  · #/gift      — 맨 윗줄 · 왼쪽 310 ① 누구에게 ② 예산 ③ 어디서 살까요? ④ 명품 고르기 › · 알아 두세요
 *                  · 가운데 선물 종류 카드(누구·예산에 맞춘 순서, 이 지역 특산물 맨 위) · 오른쪽 390 따라오는 살 곳(대표 매장·근처 가게 거리순/별점순·광고)
 *  · #/gift/lux  — 가운데 명품 브랜드 로고(바탕 투명, 칸·찾기) · 오른쪽 그 브랜드의 가까운 백화점·면세점 매장 + 그림 지도 · 맨 아래 로고 출처
 *  · 로직은 앱 gift.js 그대로 (window.GIFTPC — PC_HOME 일 때만): gifts.json 순서(ranked)·이 지역 특산물·근처 가게(/gshop — 카드를 누를 때만, 앱 「근처 가게 보기」와 같음)·광고(/npartner)
 *    · 명품 = data/lux.json · img/lux 로고 · 매장 = 허브 /kplace(카카오) 가운데 백화점·면세점 안 매장만(앱 거르기 그대로)
 *  · 가게·매장을 누르면 앱 장소 카드를 화면 가운데 창에 (PCSTAY.pin — 숙소 화면과 같은 부품) · 그림 지도도 PCSTAY.map
 *  · 새 글은 6개 언어(ko·en·ja·zhs·zht·es) — 투어앱 규칙서 3장 · 앱에 이미 있는 글은 앱 것
 */
(function(){
"use strict";
if(!window.PC_HOME||!window.PCREG) return;
var D=document;
function $(id){ return D.getElementById(id); }
function L6(o){ return o?(o[window.LANG]||o.en||o.ko||""):""; }
function E(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function F(o,v){ var s=typeof o==="string"?o:L6(o); for(var k in v) s=s.split("{"+k+"}").join(v[k]); return s; }
function TT(ko,en){ try{ return window.T?window.T(ko,en):(window.LANG==="ko"?ko:en); }catch(e){ return window.LANG==="ko"?ko:en; } }
function FL(){ return window.LANG!=="ko"; }
function G(){ return window.GIFTPC||null; }
function P(){ return window.PCSTAY||null; }
function LPs(a){ try{ return LP(a); }catch(e){ return a&&a[0]||""; } }
function noEmo(s){ try{ return MPICO("",s); }catch(e){ return E(s); } }   // 앞 이모지 떼고(앱 규칙) 글자만
function ico(n){ return '<img class="pgf-ic" src="img/menu/'+n+'.png" alt="">'; }

var TX={
 sub:T6("누구에게, 얼마쯤 — 고르면 알맞은 한국 선물과 살 곳을 알려 드려요","Who it's for and your budget — we'll suggest Korean gifts and where to buy them","誰に、いくらくらい — 選ぶとぴったりの韓国ギフトと買える場所をご案内します","送给谁、预算多少——选好后为您推荐合适的韩国礼物和购买地点","送給誰、預算多少——選好後為您推薦合適的韓國禮物和購買地點","Para quién y cuánto quieres gastar: te sugerimos regalos coreanos y dónde comprarlos"),
 who:T6("① 누구에게","① Who is it for?","① 誰に","① 送给谁","① 送給誰","① ¿Para quién?"),
 bud:T6("② 예산","② Budget","② 予算","② 预算","② 預算","② Presupuesto"),
 per:T6("1개 기준","per gift","1個あたり","每件","每件","por regalo"),
 where:T6("③ 어디서 살까요?","③ Where will you shop?","③ どこで買う？","③ 在哪里买？","③ 在哪裡買？","③ ¿Dónde vas a comprar?"),
 qph:T6("동네·역 이름 (예: 명동역)","Area or station (e.g. Myeongdong)","地域・駅の名前（例：明洞駅）","街区·车站名称（例：明洞站）","街區·車站名稱（例：明洞站）","Barrio o estación (ej.: Myeongdong)"),
 tips:T6("알아 두세요","Good to know","知っておきたいこと","须知","須知","Bueno saber"),
 src:T6("출처","source","出典","来源","來源","fuente"),
 ttl:T6("{w} · {b}에 알맞은 선물","Gifts for {w} · {b}","{w}・{b}にぴったりのギフト","适合{w} · {b}的礼物","適合{w} · {b}的禮物","Regalos para {w} · {b}"),
 hint:T6("카드를 누르면 살 곳을 보여 드려요","Select a card to see where to buy it","カードを押すと買える場所を表示します","点击卡片即可查看购买地点","點擊卡片即可查看購買地點","Elige una tarjeta para ver dónde comprarlo"),
 pick:T6("누구에게 줄지, 예산은 얼마인지 고르면 알맞은 선물을 보여 드려요","Choose who it's for and your budget, and we'll show gifts that fit","誰に贈るか、予算はいくらかを選ぶと、ぴったりのギフトを表示します","选择送给谁和预算，即可显示合适的礼物","選擇送給誰和預算，即可顯示合適的禮物","Elige para quién es y tu presupuesto, y te mostraremos regalos adecuados"),
 rHint:T6("선물 종류 카드를 누르면 여기에 살 곳(대표 매장·근처 가게)을 보여 드려요","Select a gift card to see where to buy it here (flagship stores and nearby shops)","ギフトのカードを押すと、ここに買える場所（代表店・近くのお店）を表示します","点击礼物卡片，这里会显示购买地点（代表门店·附近店铺）","點擊禮物卡片，這裡會顯示購買地點（代表門市·附近店家）","Elige una tarjeta de regalo para ver aquí dónde comprarlo (tiendas principales y cercanas)"),
 buy:T6("{k} — 살 곳","{k} — Where to buy","{k} — 買える場所","{k} — 购买地点","{k} — 購買地點","{k} — Dónde comprar"),
 near:T6("근처 가게 · {p}에서","Shops near {p}","{p}周辺のお店","{p}附近的店铺","{p}附近的店家","Tiendas cerca de {p}"),
 lHint:T6("로고를 누르면 가까운 백화점·면세점 매장을 보여 드려요","Select a logo to see the nearest boutiques in department stores and duty-free shops","ロゴを押すと、近くの百貨店・免税店の店舗を表示します","点击标志，即可查看附近百货店·免税店的门店","點選標誌，即可查看附近百貨公司·免稅店的門市","Elige un logotipo para ver las tiendas más cercanas en grandes almacenes y duty free"),
 lSub:T6("{p}에서 가까운 순 · 60km 안","Nearest to {p} · within 60 km","{p}から近い順・60km以内","离{p}最近 · 60公里以内","離{p}最近 · 60公里以內","Más cercanas a {p} · a menos de 60 km"),
 lCap:T6("목록과 같은 번호예요","Numbers match the list","番号はリストと同じです","编号与列表一致","編號與列表一致","Los números coinciden con la lista")
};

// ── 상태 — 누구·예산은 배치도처럼 「가족 · 1~5만 원」에서 시작(돈 드는 호출 없음) · 종류 카드는 손님이 눌러야 근처 가게를 찾는다(앱 「근처 가게 보기」와 같이) ──
var GS={who:"family",bud:"mid",kc:"",lc:"all",lq:"",lb:"",box:null,view:"gift"};
var GW=null;
function W(){ if(!GW&&P()) GW=P().Where({id:"pgW",title:TX.where,ph:TX.qph,onSet:function(){ baseSync(); drawLeft(); drawCenter(); drawRight(); },redraw:function(){ drawLeft(); }}); return GW; }
function mine(){ return /^#\/gift(\/|$)/.test(location.hash||""); }
// 앱 gift.js 상태에 이 화면 고른 값을 넣는다 (순서·특산물·근처 가게·명품 매장이 이 값을 본다)
function baseSync(){ var g=G(), w=W(); if(!g||!w) return; var S=g.S; S.who=GS.who; S.bud=GS.bud; var b=w.base; if(!S.base||S.base[0]!==b.lat||S.base[1]!==b.lng){ S.base=[b.lat,b.lng]; } S.src="pc"; S.bst="ok"; }
function baseNm(){ var w=W(); return w&&P()?P().baseName(w.base):""; }

// ── 그리기 ──
function draw(box,tr){ GS.box=box; var g=G(); if(!g||!P()){ box.innerHTML=""; if((tr|0)<40) setTimeout(function(){ if(mine()&&GS.box===box&&D.body.contains(box)) draw(box,(tr|0)+1); },50); return; } g.css(); baseSync();   // 숙소 파일(pc_stay.js, 같이 쓰는 부품)이 이름 순으로 뒤에 읽히므로 그때까지 기다린다
  box.innerHTML='<div id="pcGf" class="pcs pgf'+(GS.view==="lux"?" pgf-lux":"")+'">'
   +'<div class="pcs-barw"><div class="pcs-bar"><h1 class="pcs-h1"><img class="pcs-hic" src="img/menu/mi_gift.png" alt=""><span>'+E(TT("선물 고르기","Gift finder"))+'</span></h1><span class="pcs-sub">'+E(L6(TX.sub))+'</span></div></div>'
   +'<div class="pcs-cols"><aside class="pcs-l"><div class="pcs-pn" id="pgL"></div></aside><section class="pcs-c" id="pgC"></section><aside class="pcs-r"><div class="pcs-pn pgf-rp" id="pgR"></div></aside></div><div class="pgf-tm" id="pgTm"></div></div>';
  drawLeft(); drawCenter(); drawRight();
  if(!g.G()) g.load().then(function(){ if(mine()){ drawLeft(); drawCenter(); drawRight(); } },function(){ var c=$("pgC"); if(c) c.innerHTML='<div class="pcs-msg">'+E(TT("잠시 뒤 다시 해 주세요.","Please try again shortly."))+'</div>'; });
  if(GS.view==="lux"&&!g.lux.X()) g.lux.load().then(function(){ if(mine()){ drawCenter(); drawRight(); } },function(){}); }
function chipRow(name,list,cur,lab,cls){ return '<div class="pcs-chips'+(cls?" "+cls:"")+'" style="grid-template-columns:repeat('+list.length+',minmax(0,1fr))">'+list.map(function(x){ return '<button type="button" data-pg="'+name+'" data-c="'+E(x.c)+'" class="'+(x.c===cur?"on":"")+'">'+lab(x)+'</button>'; }).join("")+'</div>'; }
function drawLeft(){ var el=$("pgL"), g=G(); if(!el||!g) return; var d=g.G(), lux=g.lux.T;
  var h='';
  if(d){ h+='<div class="pcs-sec"><h3>'+E(L6(TX.who))+'</h3>'+chipRow("w",d.who,GS.who,function(x){ return g.GI(x).replace(/style="[^"]*"/,"")+'<span>'+E(LN(x))+'</span>'; },"pgf-who")+'</div>';
    h+='<div class="pcs-sec"><h3>'+E(L6(TX.bud))+' <small>('+E(L6(TX.per))+')</small></h3>'+chipRow("b",d.budget,GS.bud,function(x){ return E(LN(x)); })+'</div>'; }
  else h+='<div class="pcs-sec"><div class="pcs-qm">'+E(TT("불러오는 중…","Loading…"))+'</div></div>';
  h+=W().html();
  h+='<div class="pcs-sec"><button type="button" class="pgf-luxb'+(GS.view==="lux"?" on":"")+'" data-pg="lux">④ '+E(LPs(lux.t))+' ›</button></div>';
  var tp=tipsHtml(d); h+=tp?'<div class="pcs-sec pgf-tips pgf-tipsL">'+tp+'</div>':'';
  el.innerHTML=h; var m=$("pgTm"); if(m) m.innerHTML=tp?'<div class="pcs-pn pgf-tips">'+tp+'</div>':''; }   // 폰에선 「알아 두세요」를 맨 아래로(추천 카드가 먼저 보이게)
function tipsHtml(d){ if(!d||!d.tips||!d.tips.length) return ""; return '<h3>'+ico("mi_tip")+E(L6(TX.tips))+'</h3>'+d.tips.map(function(x){ var u=String(x.src||"").split(" · ")[0];
    return '<div class="pgf-tip">'+E(LN(x))+(/^https:\/\//.test(u)?' <a href="'+E(u)+'" target="_blank" rel="noopener">'+E(L6(TX.src))+'</a>':'')+'</div>'; }).join(""); }

// ── 가운데: 선물 종류 카드 ──
function kindsAll(){ var g=G(); if(!g||!g.G()) return {L:[],R:[]}; baseSync(); return {L:g.local(),R:g.ranked()}; }
function drawCenter(){ var c=$("pgC"), g=G(); if(!c||!g) return; if(GS.view==="lux") return luxCenter(c);
  var d=g.G(); if(!d){ c.innerHTML='<div class="pcs-msg">'+E(TT("불러오는 중…","Loading…"))+'</div>'; return; }
  var wo=d.who.filter(function(x){ return x.c===GS.who; })[0], bo=d.budget.filter(function(x){ return x.c===GS.bud; })[0];
  if(!wo||!bo){ c.innerHTML='<div class="pcs-msg">'+E(L6(TX.pick))+'</div>'; return; }
  var K=kindsAll(), all=K.L.map(function(k){ return {k:k,l:1}; }).concat(K.R.map(function(k){ return {k:k,l:0}; }));
  if(GS.kc&&!all.some(function(o){ return o.k.c===GS.kc; })) GS.kc="";
  c.innerHTML='<div class="pgf-ch"><h2>'+E(F(TX.ttl,{w:LN(wo),b:LN(bo)}))+'</h2><div class="pcs-src">'+E(L6(TX.hint))+'</div></div>'
   +'<div class="pgf-kinds">'+all.map(function(o){ var k=o.k, n=[k.note&&k.note[GS.who],k.note&&k.note[GS.bud]].filter(Boolean).map(function(a){ return '<div class="pgf-kn">'+E(LPs(a))+'</div>'; }).join("");
     return '<button type="button" class="pgf-k'+(k.c===GS.kc?" on":"")+(o.l?" pgf-kl":"")+'" data-pg="k" data-c="'+E(k.c)+'">'+(o.l?'<span class="pgf-loc">'+noEmo(g.W("local"))+'</span>':'')
       +'<span class="pgf-kic">'+g.GI(k).replace(/style="[^"]*"/,"")+'</span><b>'+E(LN(k))+'</b><span class="pgf-kd">'+E(LD(k))+'</span>'+n+'</button>'; }).join("")+'</div>'; }

// ── 오른쪽: 살 곳 ──
function curKind(){ var g=G(); return GS.kc&&g?g.findK(GS.kc):null; }
function row(cls,attrs,no,name,meta,btn){ return '<button type="button" class="pgf-row '+cls+'" '+attrs+'>'+(no?'<span class="pgf-no">'+no+'</span>':'')+'<span class="pgf-rn"><b>'+name+'</b>'+(meta?'<small>'+meta+'</small>':'')+'</span>'+(btn?'<span class="pgf-rb">'+btn+'</span>':'')+'</button>'; }
function drawRight(){ var r=$("pgR"), g=G(); if(!r||!g) return; if(GS.view==="lux") return luxRight(r);
  var k=curKind(); if(!k){ r.innerHTML='<div class="pgf-hint">'+ico("mi_pin")+'<span>'+E(L6(TX.rHint))+'</span></div>'; return; }
  baseSync(); var h='<h2 class="pgf-rh">'+E(F(TX.buy,{k:LN(k)}))+'</h2>';
  if(k.stores&&k.stores.length) h+='<div class="pgf-rs">'+E(g.W("seoul"))+'</div>'+k.stores.map(function(s,j){ return row("pgf-st",'data-pg="s" data-j="'+j+'"',"",E(LN(s)),E(s.area?LPs(s.area):""),E(g.W("map"))); }).join("");
  h+='<div class="pgf-rs">'+E(F(TX.near,{p:baseNm()}))+'</div>';
  var key=g.nbKey(k), dd=g.NB()[key]; if(!dd){ g.nbLoad(k); dd=g.NB()[key]||{st:"ld"}; }
  var rr=g.S.ord==="r";
  h+='<div class="pcs-chips pgf-ord" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-pg="ord" data-o="d" class="'+(rr?"":"on")+'">'+E(g.W("dist"))+'</button><button type="button" data-pg="ord" data-o="r" class="'+(rr?"on":"")+'">'+E(g.W("rate"))+'</button></div>';
  h+='<div id="pgAds"></div>';
  if(dd.st==="ld") h+='<div class="pcs-qm">'+E(g.W("srch"))+'</div>';
  else if(dd.st==="err") h+='<div class="pcs-qm">'+E(g.W("err"))+'</div>';
  else { var it=g.nbList(k);
    if(!it.length) h+='<div class="pcs-qm">'+E(g.W("none"))+'</div>';
    else { if(dd.r>10000) h+='<div class="pcs-qm">'+E(g.W("far"))+'</div>';
      h+=it.map(function(x,i){ var fl=FL()&&x.name_l, n=fl?x.name_l:x.name, m=g.kmT(x.dist)+(x.rating?' · <span class="pgf-rt">★ '+(+x.rating).toFixed(1)+'</span> ('+(+x.n||0)+')':'');
        return row("pgf-nb",'data-pg="n" data-j="'+i+'"',i+1,E(n),m,""); }).join(""); } }
  r.innerHTML=h;
  try{ g.ads(k).then(function(ads){ var box=$("pgAds"); if(!box||curKind()!==k||!ads.length) return; box._ads=ads;
    box.innerHTML=ads.map(function(a,j){ return row("pgf-ad",'data-pg="a" data-j="'+j+'"','<span class="pgf-adb">'+E(TT("광고","Ad"))+'</span>',E(FL()?(a.en||a.ko):a.ko),a.dist!=null?(a.dist<1000?a.dist+" m":(a.dist/1000).toFixed(1)+" km"):"",""); }).join(""); }); }catch(e){} }

// ── 명품 고르기 (가운데 로고 · 오른쪽 매장+지도) ──
function luxCats(){ var X=G().lux.X(); return ["all","fashion","watch","jewelry"].concat(((X&&X.brands)||[]).some(function(x){ return x.cat==="beauty"||x.cat2==="beauty"; })?["beauty"]:[]); }
function luxList(){ var lx=G().lux, X=lx.X(), q=lx.norm(GS.lq||""), c0=GS.lc||"all";
  return ((X&&X.brands)||[]).filter(function(x){ return q?lx.hit(x,q):(c0==="all"||x.cat===c0||x.cat2===c0); }).slice().sort(function(a,c){ return String(a.en).toUpperCase().localeCompare(String(c.en).toUpperCase()); }); }
function luxGrid(){ var lx=G().lux, B=luxList(); if(!B.length) return '<div class="pcs-msg">'+E(LPs(lx.T.nf))+'</div>';
  return '<div class="pgf-lg">'+B.map(function(x){ return '<button type="button" class="pgf-lb'+(x.id===GS.lb?" on":"")+'" data-pg="lx" data-id="'+E(x.id)+'">'+lx.logo(x)+'<span>'+E(lx.name(x)).replace(/&amp;/g,"&amp;<wbr>")+'</span></button>'; }).join("")+'</div>'; }   // DOLCE&GABBANA 처럼 긴 이름은 & 뒤에서만 줄바꿈
function luxCenter(c){ var lx=G().lux, T=lx.T;
  if(!lx.X()){ c.innerHTML='<div class="pcs-msg">'+E(TT("불러오는 중…","Loading…"))+'</div>'; return; }
  var q=lx.norm(GS.lq||""), c0=GS.lc||"all", cats=luxCats();
  c.innerHTML='<div class="pgf-lh"><button type="button" class="pgf-back" data-pg="back">'+E(LPs(T.back))+'</button><h2 class="pgf-lt">'+E(LPs(T.t))+'</h2><div class="pcs-src">'+E(LPs(T.d))+'</div></div>'
   +'<div class="pgf-lq"><input id="pgLq" type="search" class="pcs-in" enterkeyhint="search" autocomplete="off" placeholder="'+E(LPs(T.q))+'" aria-label="'+E(LPs(T.q))+'" value="'+E(GS.lq||"")+'"></div>'
   +'<div class="pgf-lc'+(q?" off":"")+'" style="grid-template-columns:repeat('+cats.length+',minmax(0,1fr))">'+cats.map(function(k){ return '<button type="button" data-pg="lc" data-c="'+k+'" class="'+(c0===k?"on":"")+'">'+E(LPs(T["c_"+k]))+'</button>'; }).join("")+'</div>'
   +'<div id="pgLg">'+luxGrid()+'</div>'+lx.credits(); }
function luxRight(r){ var g=G(), lx=g.lux, x=GS.lb&&lx.X()?lx.brand(GS.lb):null;
  if(!x){ r.innerHTML='<div class="pgf-hint pgf-hl">'+ico("mi_pin")+'<span>'+E(L6(TX.lHint))+'</span></div>'; return; }
  baseSync(); var key=lx.key(x), d=lx.S[key]; if(!d){ lx.get(x); d=lx.S[key]||{st:"ld"}; }
  var h='<div class="pgf-lbig">'+lx.logo(x)+'<b>'+E(lx.name(x))+'</b>'+(x.lic&&/CC BY/i.test(x.lic)?'<div class="gflcr">'+lx.cr1(x)+'</div>':'')+'</div>'
   +'<h2 class="pgf-rh">'+E(lx.name(x))+' — '+E(LPs(lx.T.near))+'</h2><div class="pcs-src">'+E(F(TX.lSub,{p:baseNm()}))+'</div>';
  if(d.st==="ld") h+='<div class="pcs-qm">'+E(g.W("srch"))+'</div>';
  else if(d.st==="err") h+='<div class="pcs-qm">'+E(g.W("err"))+'</div>';
  else if(!d.items.length) h+='<div class="pcs-qm">'+E(LPs(lx.T.none))+'</div>';
  else { if(d.far) h+='<div class="pcs-qm">'+E(LPs(lx.T.far))+'</div>';
    h+='<div class="pgf-lsw">'+d.items.map(function(it,i){ var fl=FL()&&it.name_en&&it.name_en!==it.name; return row("pgf-nb pgf-ls",'data-pg="ls" data-j="'+i+'"',i+1,E(fl?it.name_en:it.name),g.kmT(it.dist),""); }).join("")+'</div>'
     +'<div class="pgf-map" id="pgM"></div><div class="pcs-cap">'+E(L6(TX.lCap))+'</div>'; }
  r.innerHTML=h;
  if(d.st==="ok"&&d.items.length) P().map($("pgM"),d.items.map(function(it,i){ return {lat:+it.y,lng:+it.x,n:i+1}; }),{asp:P().phone()?1.2:2}); }

// ── 가게·매장 누르기 → 가운데 장소 카드 (앱 nbPick·showStore·광고·명품 매장과 같은 내용) ──
function openStore(s,k){ var g=G(); try{ ntap(k.c,"gift"); ntap(s.k,"gift"); }catch(e){}
  if(s.place&&window.PLACES&&PLACES[s.place]) return P().place(s.place);
  P().pin({name:s.ko,name_en:(LANG!=="en"&&s[LANG])||s.en,addr:s.addr,addr_en:s.addr_en||s.addr,y:s.lat,x:s.lng,tel:s.tel||"",cat:s.cat||"",cat_en:(LANG!=="en"&&s["cat_"+LANG])||s.cat_en||"",_l:LANG,LL:g.gLL(s)}); }
D.addEventListener("click",function(e){ var t=e.target; if(!t.closest||!t.closest("#pcGf")) return; var g=G(); if(!g) return;
  var p=t.closest(".pcm-p"); if(p&&p.closest("#pgM")){ e.preventDefault(); var n=+p.getAttribute("data-n"), rw=D.querySelector('#pgR .pgf-ls[data-j="'+(n-1)+'"]'); P().pinOn($("pgM"),n); if(rw){ rw.classList.remove("pgf-fl"); void rw.offsetWidth; rw.classList.add("pgf-fl"); } return; }
  var c=t.closest("[data-pg]"); if(!c) return; var a=c.getAttribute("data-pg"), k;
  if(a==="w"||a==="b"){ if(a==="w") GS.who=c.getAttribute("data-c"); else GS.bud=c.getAttribute("data-c"); baseSync(); if(GS.view!=="gift"){ PCGO("gift"); return; } drawLeft(); drawCenter(); drawRight(); return; }
  if(a==="lux"){ try{ ntap("_lux","gift"); }catch(z){} if(GS.view!=="lux") PCGO("gift/lux"); return; }
  if(a==="back"){ PCGO("gift"); return; }
  if(a==="k"){ var kc=c.getAttribute("data-c"); if(kc===GS.kc) return; GS.kc=kc; try{ ntap(kc,"gift"); }catch(z){}
    [].forEach.call(D.querySelectorAll("#pgC .pgf-k"),function(b){ b.classList.toggle("on",b.getAttribute("data-c")===kc); }); drawRight();
    if(P().phone()){ var r=$("pgR"); if(r) try{ r.scrollIntoView({behavior:"smooth",block:"start"}); }catch(z){} } return; }
  if(a==="ord"){ g.S.ord=c.getAttribute("data-o")==="r"?"r":"d"; drawRight(); return; }
  k=curKind();
  if(a==="s"&&k){ var s=k.stores&&k.stores[+c.getAttribute("data-j")]; if(s) openStore(s,k); return; }
  if(a==="n"&&k){ var x=g.nbList(k)[+c.getAttribute("data-j")]; if(!x) return; try{ ntap(k.c,"gift"); }catch(z){} var fl=x.name_l&&FL();
    P().pin({name:x.name,name_en:fl?x.name_l:x.name,addr:x.addr||"",addr_en:fl?(x.addr_l||x.addr||""):(x.addr||""),y:x.y,x:x.x,tel:x.tel||"",cat:x.cat||"",cat_en:fl?(x.cat_l||""):"",_l:fl?LANG:"ko",oh:x.oh,gt:x.gt}); return; }
  if(a==="a"&&k){ var bx=$("pgAds"), ad=bx&&bx._ads&&bx._ads[+c.getAttribute("data-j")]; if(!ad) return; try{ ntap(k.c,"gift"); ntap(ad.id,"gift"); }catch(z){}
    P().pin({name:ad.ko,name_en:(LANG!=="en"&&ad[LANG])||ad.en||ad.ko,addr:ad.addr||"",addr_en:ad.addr||"",y:ad.lat,x:ad.lng,tel:ad.tel||"",cat:"쇼핑",cat_en:TT("쇼핑 (광고)","Shop (Ad)"),_l:LANG,LL:g.gLL(ad,1)}); return; }
  if(a==="lc"){ GS.lc=c.getAttribute("data-c"); GS.lq=""; drawCenter(); return; }
  if(a==="lx"){ var id=c.getAttribute("data-id"); if(id===GS.lb) return; GS.lb=id; try{ ntap("lux_"+id,"gift"); }catch(z){}
    [].forEach.call(D.querySelectorAll("#pgLg .pgf-lb"),function(b){ b.classList.toggle("on",b.getAttribute("data-id")===id); }); drawRight();
    if(P().phone()){ var rr=$("pgR"); if(rr) try{ rr.scrollIntoView({behavior:"smooth",block:"start"}); }catch(z){} } return; }
  if(a==="ls"){ var xb=GS.lb&&g.lux.brand(GS.lb), dd=xb&&g.lux.S[g.lux.key(xb)], it=dd&&dd.items&&dd.items[+c.getAttribute("data-j")]; if(!it) return; var fl2=FL()&&it.name_en&&it.name_en!==it.name;
    P().pinOn($("pgM"),+c.getAttribute("data-j")+1);
    P().pin({name:it.name,name_en:fl2?it.name_en:it.name,addr:it.addr||"",addr_en:fl2?(it.addr_en||it.addr||""):(it.addr||""),y:it.y,x:it.x,tel:it.tel||"",cat:it.cat||"",cat_en:it.cat_en||"",_l:fl2?LANG:"ko"}); return; }
});
// 명품 찾기 칸 — 칠 때마다 로고 바둑판만 (입력 칸은 그대로, 앱과 같음)
D.addEventListener("input",function(e){ var t=e.target; if(!t||t.id!=="pgLq") return; GS.lq=t.value; var g=$("pgLg"); if(g) g.innerHTML=luxGrid(); var c=D.querySelector("#pcGf .pgf-lc"); if(c) c.classList.toggle("off",!!G().lux.norm(GS.lq)); });
// 매장 줄에 마우스 → 지도 번호가 커진다
D.addEventListener("mouseover",function(e){ var t=e.target; if(!t.closest||!t.closest("#pgR")) return; var rw=t.closest(".pgf-ls"); P().pinOn($("pgM"),rw?(+rw.getAttribute("data-j")+1):""); });

// 근처 가게·명품 매장을 받으면(앱 gift.js paint) 오른쪽만 다시 — 한 번에 모아서
var _hq=0; function onData(){ if(_hq) return; _hq=requestAnimationFrame(function(){ _hq=0; if(mine()&&GS.box&&D.body.contains(GS.box)) drawRight(); }); }
try{ if(window.GIFTPC) GIFTPC.hook(onData); }catch(e){}

PCREG("gift",function(box,args){ GS.view=args[0]==="lux"?"lux":"gift"; draw(box); });
// 언어를 바꾸면 이 화면도 그 자리에서 다시 (가게 이름은 그 언어로 다시 받는다 — 앱과 같은 길)
var _sl=window.setLang; if(typeof _sl==="function") window.setLang=function(){ var r=_sl.apply(this,arguments); try{ if(mine()&&GS.box&&D.body.contains(GS.box)){ var y=window.scrollY; draw(GS.box); if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y); } }catch(e){} return r; };
var _rt=0; window.addEventListener("resize",function(){ clearTimeout(_rt); _rt=setTimeout(function(){ if(mine()&&GS.view==="lux"&&$("pgM")) drawRight(); },250); });
})();
