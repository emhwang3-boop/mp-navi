/* 머니퍼즐 내비 — 「🎁 선물 고르기 / Gift finder」 (사장님 2026-10-16) · 무료 기능(유입용)
 *  누구에게 → 예산 → 종류 카드(누구·예산에 맞춰 순서·한 줄 설명) → 매장 2~4곳 → 누르면 검색 핀 카드(전화·길찾기·「＋ 내 여행에 담기」는 trip.js 가 붙임)
 *  · 자료는 data/gifts.json (원본 navi_build\src\gifts.json, build_navi.py 가 검사·배포). 매장은 카카오 로컬(허브 /kplace)로 확인한 곳만
 *  · 팁 줄은 공식 안내로 확인한 문장만 (출처는 gifts.json tips[].src)
 *  · 제휴 가게 광고: 허브 GET /npartner?x=&y=&r= (공개, 광고 기간 안의 것만) 에서 종류별 업종 코드(cosme.* / shop.*)만 골라 맨 위에 「광고 / Ad」
 *  · 누름 집계: ntap(키, "gift") — 키는 종류 코드·매장 키·제휴 id 뿐 (개인정보 없음)
 *  index.html 은 <script src="gift.js"> 한 줄뿐 — 전역 함수(spinShow·placeShow·spinGo·meBest·mapLoad·setLang·ntap·T·esc)를 부른다
 */
(function(){
"use strict";
var G=null, GP=null, S={who:"",bud:""}, ADS={};
function L(){ return window.LANG!=="ko"; }   // 외국어 화면 (10-18)
function t2(a){ return LP(a); }   // [한, 영, 일, 简, 繁]
function nm(o){ return LN(o); }
function load(){ return GP||(GP=fetch("data/gifts.json?v="+(window.NAVI_V||"")).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){ G=j; return j; },function(e){ GP=null; throw e; })); }

// ── 순서: 누구 점수 + 예산 점수 (어느 쪽이든 0 이면 뺀다) ──
function ranked(){ if(!G) return []; var w=S.who, b=S.bud;
  return G.kinds.map(function(k,i){ return {k:k,i:i,s:(k.w[w]||0)+(k.b[b]||0),z:!(k.w[w]>0&&k.b[b]>0)}; })
    .filter(function(x){ return !x.z; }).sort(function(a,b2){ return b2.s-a.s||a.i-b2.i; }).map(function(x){ return x.k; }); }

// ── 제휴 가게 (광고) — 허브 「npartner」 공개 조회. 없거나 실패하면 그냥 빈칸 ──
function adsFor(k){ if(ADS[k.c]) return ADS[k.c];
  var st=k.stores, x=st.reduce(function(s,a){ return s+a.lng; },0)/st.length, y=st.reduce(function(s,a){ return s+a.lat; },0)/st.length, pre=k.ad||[];
  return ADS[k.c]=fetch(HUB+"/npartner?x="+x.toFixed(5)+"&y="+y.toFixed(5)+"&r=2000").then(function(r){ return r.json(); }).then(function(j){
    return ((j&&j.ok&&j.items)||[]).filter(function(it){ var c=String(it.cat||""); return pre.some(function(p){ return c===p||c.indexOf(p+".")===0; }); }).slice(0,2); })
    .catch(function(){ return []; }); }
window.giftAds=adsFor;   // 자리 함수 (10-16): 제휴 가게 칸이 비어 있으면 [] — 광고가 들어오면 그대로 뜬다

// ── 화면 ──
function css(){ if(document.getElementById("gfCss")) return; var s=document.createElement("style"); s.id="gfCss";
  s.textContent="#gfchips{display:flex;justify-content:center;gap:6px;margin:10px 0 0;flex-wrap:wrap}"
  +"#gfchips .gfchip{display:inline-block;width:auto;margin:0;border:1.5px solid #f08c00;background:#fff9db;color:#c2410c;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:none}"
  +".gflock,.gflock body{overflow:hidden}#gfBox{position:fixed;inset:0;z-index:1036;background:rgba(0,0,0,.45);overflow:auto;-webkit-overflow-scrolling:touch}"
  +"#gfBox .gfin{background:var(--bg);color:var(--ink);max-width:720px;margin:0 auto;min-height:100%;padding:14px 16px 40px;box-sizing:border-box}"
  +".gftop{display:flex;align-items:center;justify-content:space-between;font-size:18px;margin-bottom:6px}.gfq{font-weight:900;margin:14px 2px 8px;font-size:15px}"
  +".gfopts{display:flex;flex-wrap:wrap;gap:8px}.gfopt{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:9px 13px;font-size:14.5px;font-weight:800;cursor:pointer}"
  +".gfopt.on{border-color:#e8590c;background:#fff4e6;color:#c2410c}"
  +".gfk{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0}.gfk .h{font-weight:900;font-size:16.5px}.gfk .d{color:var(--sub);font-size:13.5px;margin:3px 0 4px;line-height:1.5}"
  +".gfk .n{font-size:13px;color:#c2410c;font-weight:800;margin:2px 0 6px}.gfrank{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;background:#e8590c;color:#fff;font-size:12px;text-align:center;margin-right:6px;vertical-align:2px}"
  +".gfs{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);padding:9px 2px;font-size:14.5px;cursor:pointer}"
  +".gfs b{flex:1}.gfs i{font-style:normal;color:var(--sub);font-size:12.5px;white-space:nowrap}.gfs .go{color:#1a73e8;font-weight:800;font-size:13px;white-space:nowrap}"
  +".gfad{display:inline-block;border:1px solid #f59f00;color:#e67700;border-radius:6px;font-size:11px;font-weight:900;padding:0 5px;margin-right:4px}"
  +".gftips{margin-top:18px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 14px}.gftips .h{font-weight:900;margin:2px 0 4px}"
  +".gftip{font-size:13.5px;line-height:1.55;padding:6px 0;border-top:1px solid var(--line)}.gftip:first-of-type{border-top:0}.gftip a{color:var(--sub);font-size:11.5px;margin-left:4px}"
  +".gfdfs{margin:0 2px 4px}.gfrs{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:6px 13px;font-size:13.5px;font-weight:800;cursor:pointer;margin:2px 0 0}"
  +".gfdb{border:1px solid #1a73e8;background:#fff;color:#1a73e8;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}[data-theme=dark] .gfdb{background:transparent}"
  +".gfx{width:34px;height:34px;border:0;border-radius:50%;background:var(--card);color:var(--sub);font-size:20px;cursor:pointer}";
  document.head.appendChild(s); }
function open(){ css(); var mm=document.getElementById("mm"); if(mm) mm.hidden=true;
  var o=document.getElementById("gfBox"); if(!o){ o=document.createElement("div"); o.id="gfBox"; o.innerHTML='<div class="gfin"></div>'; o.onclick=function(e){ if(e.target===o) close(); }; document.body.appendChild(o); }
  document.documentElement.classList.add("gflock"); try{ ntap("_gift","gift"); }catch(e){}
  paint(); load().then(paint,function(){ var b=o.querySelector(".gfin"); if(b) b.insertAdjacentHTML("beforeend",'<div class="msg">'+T("잠시 뒤 다시 해 주세요.","Please try again shortly.")+'</div>'); }); }
function close(){ var o=document.getElementById("gfBox"); if(o) o.remove(); document.documentElement.classList.remove("gflock"); }
function opt(kind,c,label,on){ return '<button type="button" class="gfopt'+(on?' on':'')+'" data-gf="'+kind+'" data-c="'+esc(c)+'">'+label+'</button>'; }
function paint(){ var b=document.querySelector("#gfBox .gfin"); if(!b) return;
  var h='<div class="gftop"><b>'+T("🎁 선물 고르기","🎁 Gift finder")+'</b><button type="button" class="gfx" data-gf="x" aria-label="close">✕</button></div>';
  if(!G){ b.innerHTML=h+'<div class="msg">'+T("불러오는 중…","Loading…")+'</div>'; return; }
  if(S.who) h+='<button type="button" class="gfrs" data-gf="rs">'+T("↺ 처음부터 다시","↺ Start over")+'</button>';
  h+='<div class="gfq">1. '+T("누구에게 주나요?","Who is it for?")+'</div><div class="gfopts">'+G.who.map(function(x){ return opt("w",x.c,(x.i?x.i+" ":"")+esc(nm(x)),S.who===x.c); }).join("")+'</div>';
  if(S.who) h+='<div class="gfq">2. '+T("예산은요? (1개 기준)","Budget? (per gift)")+'</div><div class="gfopts">'+G.budget.map(function(x){ return opt("b",x.c,esc(nm(x)),S.bud===x.c); }).join("")+'</div>';
  if(S.who&&S.bud){ var R=ranked();
    h+='<div class="gfq">3. '+T("이런 선물을 추천해요","Our picks for you")+'</div>'+dfsHtml();
    h+=R.map(function(k,i){ var n=[k.note&&k.note[S.who],k.note&&k.note[S.bud]].filter(Boolean).map(function(a){ return '<div class="n">👉 '+esc(t2(a))+'</div>'; }).join("");
      return '<div class="gfk" data-kc="'+esc(k.c)+'"><div class="h"><span class="gfrank">'+(i+1)+'</span>'+k.i+' '+esc(nm(k))+'</div><div class="d">'+esc(LD(k))+'</div>'+n
        +'<div class="gfads"></div>'+k.stores.map(function(s,j){ return '<button type="button" class="gfs" data-gf="s" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b>📍 '+esc(nm(s))+'</b><i>'+esc(s.area?t2(s.area):"")+'</i><span class="go">'+T("지도","Map")+' ›</span></button>'; }).join("")+'</div>'; }).join("");
    h+=tips(); }
  b.innerHTML=h;
  if(S.who&&S.bud) ranked().forEach(function(k){ adsFor(k).then(function(ads){ var box=b.querySelector('.gfk[data-kc="'+k.c+'"] .gfads'); if(!box||!ads.length) return;
    box.innerHTML=ads.map(function(a,j){ return '<button type="button" class="gfs" data-gf="a" data-kc="'+esc(k.c)+'" data-j="'+j+'"><b><span class="gfad">'+T("광고","Ad")+'</span>'+esc(L()?(a.en||a.ko):a.ko)+'</b><i>'+(a.dist!=null?(a.dist<1000?a.dist+" m":(a.dist/1000).toFixed(1)+" km"):"")+'</i><span class="go">'+T("지도","Map")+' ›</span></button>'; }).join(""); box._ads=ads; }); }); }
// 면세점은 목록 대신 검색으로 (사장님 10-16) — 기존 검색 흐름(go) 그대로, 결과를 누르면 검색 핀
function dfsHtml(){ return '<div class="gfdfs"><button type="button" class="gfdb" data-gf="dfs">'+T("🔎 면세점","🔎 Duty-free shops")+'</button></div>'; }
function dfsGo(){ close(); var q=document.getElementById("q"); if(q){ q.value=T("면세점","duty free"); try{ qxSync(); }catch(e){} } try{ ntap("_dfs","gift"); }catch(e){}
  go("면세점"); var r=document.getElementById("res"); if(r) setTimeout(function(){ window.scrollTo({top:r.getBoundingClientRect().top+scrollY-80,behavior:"smooth"}); },100); }
function tips(){ if(!G.tips||!G.tips.length) return "";
  return '<div class="gftips"><div class="h">'+T("💡 사기 전에","💡 Before you buy")+'</div>'+G.tips.map(function(x){ var u=String(x.src||"").split(" · ")[0];
    return '<div class="gftip">'+esc(nm(x))+(/^https:\/\//.test(u)?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+T("출처","source")+'</a>':'')+'</div>'; }).join("")+'</div>'; }

// ── 매장 누르기 → 약도 핀 + 카드 ──
function showStore(s){ close();
  if(s.place){ Promise.all(Object.keys(CITY).map(function(id){ return mapLoad(id).catch(function(){}); })).then(function(){ var p=PLACES[s.place];
      if(!p) return spinShow({name:s.ko,name_en:s.en,addr:s.addr,addr_en:s.addr_en,y:s.lat,x:s.lng,tel:s.tel||"",cat:s.cat||"",cat_en:s.cat_en||""});
      var id0=meBest(+p.lat,+p.lng)||NAVI_ROOT; if(DET){ try{ _nm.setCenter(new naver.maps.LatLng(+p.lat,+p.lng)); }catch(e){} } else spinGo(id0===NAVI_ROOT?"kr":id0,+p.lat,+p.lng,null);
      placeShow(s.place); var m=document.getElementById("map"); if(m) window.scrollTo({top:m.getBoundingClientRect().top+scrollY-70,behavior:"smooth"}); }); return; }
  spinShow({name:s.ko,name_en:s.en,addr:s.addr,addr_en:s.addr_en||s.addr,y:s.lat,x:s.lng,tel:s.tel||"",cat:s.cat||"",cat_en:s.cat_en||""}); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-gf]"); if(!t||!t.closest("#gfBox,#gfchips,#mm")) return; e.preventDefault();
  var g=t.dataset.gf, k;
  if(g==="open") return open();
  if(g==="x") return close();
  if(g==="dfs") return dfsGo();
  if(g==="rs"){ S.who=""; S.bud=""; paint(); var bx=document.getElementById("gfBox"); if(bx) bx.scrollTop=0; return; }
  if(g==="w"){ S.who=t.dataset.c; S.bud=S.bud||""; paint(); return; }
  if(g==="b"){ S.bud=t.dataset.c; paint(); var q=document.querySelectorAll("#gfBox .gfq"); if(q[2]) q[2].scrollIntoView({behavior:"smooth",block:"start"}); return; }
  if(g==="s"||g==="a"){ k=G.kinds.filter(function(x){ return x.c===t.dataset.kc; })[0]; if(!k) return; try{ ntap(k.c,"gift"); }catch(z){}
    if(g==="s"){ var s=k.stores[+t.dataset.j]; if(!s) return; try{ ntap(s.k,"gift"); }catch(z){} showStore(s); return; }
    var box=t.closest(".gfads"), a=box&&box._ads&&box._ads[+t.dataset.j]; if(!a) return; try{ ntap(a.id,"gift"); }catch(z){}
    close(); spinShow({name:a.ko,name_en:a.en||a.ko,addr:a.addr||"",addr_en:a.addr||"",y:a.lat,x:a.lng,tel:a.tel||"",cat:"쇼핑",cat_en:"Shop (Ad)"}); } });

// ── 들어가는 곳: 검색창 아래 칩 · ⋮ 메뉴 ──
function entries(){ var h=document.getElementById("gob")||document.getElementById("hint");
  if(h&&!document.getElementById("gfchips")){ css(); h.insertAdjacentHTML("afterend",'<div id="gfchips"><button type="button" class="gfchip" data-gf="open"></button></div>'); }
  var c=document.querySelector("#gfchips .gfchip"); if(c) c.textContent=T("선물 고르기","Gift finder");   // 칩은 글자만 (사장님 10-16), ⋮ 메뉴는 아이콘 그대로
  var mm=document.getElementById("mm"); if(mm){ var a=document.getElementById("mgift"); if(!a){ a=document.createElement("a"); a.id="mgift"; a.href="#"; a.className="mi"; a.dataset.gf="open"; var r=document.getElementById("mref"); mm.insertBefore(a,r||null); } a.textContent=T("🎁 선물 고르기","🎁 Gift finder"); } }
var DFS_TEL=[[/신라아이파크|HDC\s*신라/,"1688-8800"],[/롯데면세점/,"1688-3000"],[/신라면세점/,"1688-1110"],[/신세계면세점/,"1661-8778"],[/현대(백화점)?면세점/,"1811-6688"],[/동화면세점/,"02-399-3000"]];
function dfsTel(ko){ for(var i=0;i<DFS_TEL.length;i++) if(DFS_TEL[i][0].test(ko||"")) return DFS_TEL[i][1]; return ""; }
var sc0=window.spinCard; if(typeof sc0==="function"&&!sc0._gf){ var sc1=function(){ try{ var p=PLACES.__pin; if(p&&!p.tel){ var t=dfsTel(p.ko); if(t) p.tel=t; } }catch(e){} return sc0.apply(this,arguments); }; sc1._gf=1; sc1._tr=sc0._tr; window.spinCard=sc1; }
var f=window.setLang; if(typeof f==="function"&&!f._gf){ var g=function(){ var r=f.apply(this,arguments); try{ entries(); paint(); }catch(e){} return r; }; g._gf=1; g._tr=f._tr; window.setLang=g; }
entries();
window.GIFT={open:open,close:close,state:function(){ return S; },data:function(){ return G; }};
if(/[?&]gift=1/.test(location.search)) setTimeout(open,300);
})();
