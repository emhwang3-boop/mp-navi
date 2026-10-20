/* 서울시티투어버스 (사장님 2026-10-20) — 시티투어버스 그림(장소 키 citytour)을 누르면 서울 전체 약도(묶음 화면 바탕)로 바꾸고
   매표소(광화문)와 정류장 15곳을 표시. 누르면 카드: 노선별 시간표(첫차·막차·간격)·요금·운행 안 하는 날·전화·기준일·출처. 5개 언어
   자료 data/citytour.json (공식 누리집 seoulcitybus.com 에서 옮긴 값만). 돌아가기 = ← · 「✕」 · 뒤로가기 → 누르기 전 화면 */
(function(){
  var V=""; try{ V=((document.currentScript&&document.currentScript.src||"").match(/[?&]v=([0-9a-z]+)/)||[])[1]||""; }catch(e){}
  var C=window.CTOUR={on:false,d:null,p:null,prev:null,key:null,card:null,lang:null};
  var st=document.createElement("style");
  st.textContent="#map.ctmode #gul,#map.ctmode #lod,#map.ctmode .mlb,#map.ctmode #guX{display:none!important}"+
    "#ctl{position:absolute;inset:0;pointer-events:none;z-index:4}#ctl[hidden]{display:none}#ctl svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}"+
    "#ctl .cto,#ctl .cts{position:absolute;pointer-events:auto;cursor:pointer;transform-origin:50% 50%}"+
    "#ctl .cts{width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#fff;border:2.5px solid #e8590c;box-sizing:border-box;color:#c2410c;font:900 9px/11px system-ui,sans-serif;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.35)}"+
    "#ctl .cts.sm{width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-width:2px;font-size:0}"+
    "#ctl .cto{display:flex;align-items:center;gap:4px;white-space:nowrap;transform-origin:17px 100%;margin:-40px 0 0 -17px}"+
    "#ctl .cto b{display:flex;align-items:center;justify-content:center;width:34px;height:40px;font-size:19px;background:#e8590c;color:#fff;border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4);box-sizing:border-box}"+
    "#ctl .cto b i{transform:rotate(45deg);font-style:normal}#ctl .cto span{background:rgba(20,24,32,.9);color:#fff;font:800 13px/1.2 system-ui,sans-serif;padding:4px 9px;border-radius:999px;box-shadow:0 1px 4px rgba(0,0,0,.35);margin-bottom:12px}"+
    "#ctX{position:absolute;top:10px;left:50%;transform:translateX(-50%);white-space:nowrap;z-index:30;border:0;border-radius:999px;background:rgba(232,89,12,.95);color:#fff;font-weight:900;font-size:15px;padding:7px 14px;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer}#ctX[hidden]{display:none}"+
    ".ctc h4{margin:10px 0 4px;font-size:14.5px;color:var(--ink)}.ctc .d b{color:var(--ink)}.ctc table{border-collapse:collapse;font-size:12.5px;margin:4px 0;width:100%}.ctc td{padding:2px 4px;border-bottom:1px solid var(--line);vertical-align:top}.ctc td.r{text-align:right;white-space:nowrap}"+
    ".ctc s{opacity:.6}.ctc .src{font-size:11.5px;margin-top:8px;color:var(--mut,#6b7280)}.ctc .src a{color:inherit}.ctc .tt{font-size:12px;line-height:1.6;word-spacing:3px}";
  document.head.appendChild(st);
  function L(a){ return LP(a); }
  function W(ko,en,ja,zhs,zht){ return L([ko,en,ja,zhs,zht]); }
  function load(){ if(C.p) return C.p; return C.p=fetch("data/citytour.json?v="+V).then(function(r){ if(!r.ok) throw new Error("ct "+r.status); return r.json(); }).then(function(d){ C.d=d; return d; },function(e){ C.p=null; throw e; }); }
  function fr(lat,lng){ var f=null; try{ f=meGeoFrac("seoulall",lat,lng); }catch(e){} if(f) return f;
    return [.5+(lng-126.975)*0.7926622119789455/(2*0.172), .5+(37.565-lat)/(2*0.172)]; }   // 서울 약도(seoulall) 투영 — regions.json geo 와 같은 값
  function won(n){ return LANG==="ko"?n.toLocaleString()+"원":"₩"+n.toLocaleString(); }
  function fare(p){ return '<s>'+won(p[0])+'</s> '+won(p[1]); }
  function chip(){ var b=document.getElementById("ctX"); if(!b){ b=document.createElement("button"); b.type="button"; b.id="ctX"; b.hidden=true; document.getElementById("map").appendChild(b);
      b.addEventListener("click",function(e){ e.stopPropagation(); e.preventDefault(); exit(); }); } return b; }
  function layer(){ var l=document.getElementById("ctl"); if(!l){ l=document.createElement("div"); l.id="ctl"; document.getElementById("mz").appendChild(l); } return l; }
  function title(){ var tt=document.getElementById("vttl"); if(tt) tt.textContent=W("서울 · 시티투어버스","Seoul · City Tour Bus","ソウル · シティツアーバス","首尔 · 城市观光巴士","首爾 · 城市觀光巴士");
    var b=chip(); b.hidden=false; b.textContent="🚌 "+W("서울시티투어버스","Seoul City Tour Bus","ソウルシティツアーバス","首尔城市观光巴士","首爾城市觀光巴士")+"  ✕"; }
  // 그리기 — 지도(#mz) 안에 두고 글자·핀은 1/배율로 줄여 화면 크기를 고정
  function draw(){ var m=document.getElementById("map"); if(!m) return; var l=document.getElementById("ctl");
    if(!C.on||!C.d||window.DET||VIEW!=="seoulall"){ if(l) l.hidden=true; var b0=document.getElementById("ctX"); if(b0) b0.hidden=true; return; }
    l=layer(); l.hidden=false; title(); var d=C.d, key=LANG;
    if(C.key!==key){ C.key=key; l.innerHTML=""; var NS="http://www.w3.org/2000/svg", sv=document.createElementNS(NS,"svg"); sv.setAttribute("viewBox","0 0 1 1"); sv.setAttribute("preserveAspectRatio","none");
      var pts=d.stops.map(function(s){ var f=fr(s.lat,s.lng); return f[0]+" "+f[1]; }), pa=document.createElementNS(NS,"path"); pa.setAttribute("d","M"+pts.join("L")+"Z"); pa.setAttribute("fill","none"); pa.setAttribute("stroke","#e8590c"); pa.setAttribute("class","ctr"); pa.setAttribute("vector-effect","non-scaling-stroke"); pa.setAttribute("stroke-linejoin","round"); sv.appendChild(pa); l.appendChild(sv);
      d.stops.forEach(function(s,i){ if(!i) return; var f=fr(s.lat,s.lng), e=document.createElement("div"); e.className="cts"; e.dataset.ct="s"+i; e.textContent=i+1; e.title=L(s.n); e.style.left=(f[0]*100)+"%"; e.style.top=(f[1]*100)+"%"; l.appendChild(e); });
      var o=d.office, f0=fr(o.lat,o.lng), p=document.createElement("div"); p.className="cto"; p.dataset.ct="o"; p.style.left=(f0[0]*100)+"%"; p.style.top=(f0[1]*100)+"%";
      p.innerHTML='<b><i>🚌</i></b><span></span>'; p.lastChild.textContent=L(o.short); p.title=L(o.n); l.appendChild(p); }
    var w=m.clientWidth, sc=1/ZM.s, mind=9; for(var i=2;i<d.stops.length;i++){ var a=fr(d.stops[i-1].lat,d.stops[i-1].lng), b=fr(d.stops[i].lat,d.stops[i].lng); mind=Math.min(mind,Math.hypot(a[0]-b[0],a[1]-b[1])); }
    var big=mind*w*ZM.s>=17;   // 정류장 사이가 화면 17px 넘게 벌어지면 번호 동그라미, 아니면 작은 점
    [].forEach.call(l.querySelectorAll(".cts"),function(e){ e.classList.toggle("sm",!big); e.style.transform="scale("+sc+")"; });
    var oe=l.querySelector(".cto"); if(oe) oe.style.transform="scale("+sc+")";
    var pr=l.querySelector("path.ctr"); if(pr){ pr.setAttribute("stroke-width",String(3*sc)); pr.setAttribute("stroke-dasharray",(7*sc)+" "+(5*sc)); }   /* 선 굵기도 화면 3px 로 고정 (gu.js 경계선과 같은 방식) */
    }
  // 카드
  function head(t){ return '<h4>'+t+'</h4>'; }
  function common(){ var d=C.d;
    return head("📅 "+W("운행 안 하는 날","Days not operating","運休日","停运日","停駛日"))+'<div class="d">'+W("매주 월요일 (월요일이 공휴일이면 정상 운행하고 화요일 휴무)","Closed Mondays; open on holiday Mondays (closed Tuesday instead).","毎週月曜日運休（月曜日が祝日の場合は通常運行し、火曜日が運休）","每周一停运（若周一为公共假日则照常运营，周二停运）","每週一停駛（若週一為國定假日則照常營運，週二停駛）")+'</div>'
      +head("📞 "+W("문의","Contact","お問い合わせ","咨询","諮詢"))+telLine(d.tel)
      +'<div class="src">'+esc(d.asof)+' '+W("기준","as of","時点","为准","為準")+' · '+W("출처","Source","出典","来源","來源")+': '+W("서울시티투어버스 공식 누리집","Seoul City Tour Bus official website","ソウルシティツアーバス公式サイト","首尔城市观光巴士官方网站","首爾城市觀光巴士官方網站")+'<br>'
      +d.src.map(function(s){ var lp={en:"/en/",ja:"/ja/",zhs:"/zh/",zht:"/zh/"}[LANG]; if(lp) s=[s[0].replace("/ko/",lp),s[1].replace("/ko/",lp)]; return '<a href="'+esc(s[0])+'" target="_blank" rel="noopener">'+esc(s[1])+'</a>'; }).join(" · ")+'</div>'; }
  function fareRows(fa,child){ return '<table><tr><td>'+W("어른","Adult","大人","成人","成人")+'</td><td class="r">'+fare(fa.a)+'</td></tr><tr><td>'+W("소인","Child","小人","儿童","兒童")+'<br><span class="d">'+child+'</span></td><td class="r">'+fare(fa.c)+'</td></tr></table>'; }
  function childTxt(){ return W("48개월~18세 · 48개월 미만 무료(보호자 1명당 1명, 좌석 없음)","48 months to 18 years · under 48 months free (one per adult, no seat)","48ヶ月～18歳 · 48ヶ月未満は無料（保護者1名につき1名、座席なし）","48个月至18岁 · 未满48个月免费（每名家长限1名，不提供座位）","48個月至18歲 · 未滿48個月免費（每名家長限1名，不提供座位）"); }
  function dayBlock(){ var d=C.d, y=d.day;
    return head("🚌 "+esc(L(y.n))+' <span class="d">('+esc(y.id)+')</span>')
      +'<div class="d">'+W("첫차","First bus","始発","首班","首班")+' <b>'+y.first+'</b> · '+W("막차","Last bus","最終","末班","末班")+' <b>'+y.last+'</b> ('+W("광화문 출발","from Gwanghwamun","光化門発","光化门出发","光化門出發")+') · '
      +W(y.gap+"분 간격",y.gap+" min intervals",y.gap+"分間隔","间隔"+y.gap+"分钟","間隔"+y.gap+"分鐘")+' · '+W("한 바퀴 약 "+y.loop+"시간","about "+y.loop+" h a loop","1周 約"+y.loop+"時間","一圈约"+y.loop+"小时","一圈約"+y.loop+"小時")+' · '
      +W("15개 정류장 자유 승하차","Hop on/off at 15 stops","15停留所 乗り降り自由","15个站点随上随下","15個站點隨上隨下")+'</div>'
      +'<div class="d">'+W("당일 표는 매표소에서 구매 · 온라인 예매는 하루 전까지","Same-day tickets at the ticket booth · online booking until the day before","当日券はチケット売り場で · オンライン予約は前日まで","当日票请在售票处购买 · 在线预订截至前一天","當日票請在售票處購買 · 線上預訂截至前一天")+'</div>'
      +fareRows(y.fare,childTxt()); }
  function nightBlock(){ var n=C.d.night;
    return head("🌙 "+esc(L(n.n))+' <span class="d">('+esc(n.id)+')</span>')
      +'<div class="d">'+W("출발","Departure","出発","出发","出發")+' '+n.dep.map(function(t){ return '<b>'+t[1]+'</b> ('+t[0]+')'; }).join(" · ")+'</div>'
      +'<div class="d">'+W("하루 1회 · 광화문 매표소 앞 출발 · 무정차 약 90분 · N서울타워 25분 정차","Once a day · departs in front of the Gwanghwamun ticket booth · non-stop about 90 min · 25 min photo stop at N Seoul Tower","1日1回 · 光化門チケット売り場前発 · ノンストップ約90分 · Nソウルタワーで25分停車","每天1班 · 光化门售票处前出发 · 直达约90分钟 · N首尔塔停留25分钟","每天1班 · 光化門售票處前出發 · 直達約90分鐘 · N首爾塔停留25分鐘")+'</div>'
      +'<div class="d">'+W("예약 10명 미만이면 운행 안 함","Does not run with fewer than 10 bookings","予約が10名未満の場合は運行なし","预订不足10人时不运行","預訂不足10人時不運行")+'</div>'
      +'<div class="d">'+n.stops.map(function(s){ return esc(L(s)); }).join(" → ")+'</div>'
      +fareRows(n.fare,W("48개월~18세","48 months to 18 years","48ヶ月～18歳","48个月至18岁","48個月至18歲")); }
  function stopTable(){ var d=C.d; return head("🕘 "+W("정류장별 첫차 · 막차","First · last bus at each stop","停留所別 始発 · 最終","各站首班 · 末班","各站首班 · 末班")+' <span class="d">('+esc(L(d.day.n))+')</span>')
      +'<table>'+d.stops.map(function(s,i){ return '<tr data-ct="s'+i+'" style="cursor:pointer"><td>'+(i+1)+'. '+esc(L(s.n))+'</td><td class="r">'+s.t[0]+' ~ '+s.t[s.t.length-1]+'</td></tr>'; }).join("")
      +'<tr><td>↩ '+W("광화문역 도착","Arrive Gwanghwamun Stn.","光化門駅 到着","到达光化门站","抵達光化門站")+'</td><td class="r">'+d.arr[0]+' ~ '+d.arr[d.arr.length-1]+'</td></tr></table>'; }
  function show(w){ var d=C.d; if(!d) return; C.card=w; window._cardK="__ct"; var o=d.office, h;
    if(w==="o"){ h='<div class="item ctc"><div class="t">🚌 '+esc(L(o.n))+'</div><div class="d">'+esc(L(o.addr))+'</div><div class="d">'+esc(L(o.dir))+'</div>'
        +dayBlock()+nightBlock()+stopTable()+common()+(typeof linksTo==="function"?linksTo(o.n[0],o.lat,o.lng,null,o.addr[0]):"")+'</div>'; }
    else { var i=+w.slice(1), s=d.stops[i]; if(!s) return;
      h='<div class="item ctc"><div class="t">🚏 '+(i+1)+'. '+esc(L(s.n))+'</div><div class="d">'+esc(L(d.day.n))+' ('+esc(d.day.id)+')</div>'
        +'<div class="d">'+W("첫차","First bus","始発","首班","首班")+' <b>'+s.t[0]+'</b> · '+W("막차","Last bus","最終","末班","末班")+' <b>'+s.t[s.t.length-1]+'</b> · '+W(d.day.gap+"분 간격",d.day.gap+" min intervals",d.day.gap+"分間隔","间隔"+d.day.gap+"分钟","間隔"+d.day.gap+"分鐘")+'</div>'
        +'<div class="d tt">'+s.t.join(" ")+'</div>'
        +'<div class="d">'+W("표 사는 곳","Tickets","チケット購入","购票","購票")+': <a href="#" data-ct="o">'+esc(L(o.n))+'</a></div>'
        +fareRows(d.day.fare,childTxt())+common()+'</div>'; }
    var r=document.getElementById("res"); r.innerHTML=h; window._RR={f:function(){ show(w); }}; try{ ntap("citytour","tap"); }catch(e){}   // 언어를 바꾸면 lang.js 가 _RR.f 로 다시 그린다
    clearTimeout(window._scT); window._scT=setTimeout(function(){ window.scrollTo({top:0,behavior:"smooth"}); },300); }
  // 들어가기·나오기
  var inner=false;
  function enter(){ try{ inBlur(); }catch(e){} try{ resClear(); }catch(e){} try{ rtClear(); }catch(e){}
    var G=window.GU; C.prev={v:VIEW,g:(G&&G.g)||null,zm:{s:ZM.s,tx:ZM.tx,ty:ZM.ty}};
    if(window.DET){ try{ detSet(false); }catch(e){} }
    inner=true; try{ if(VIEW!=="seoulall") viewSet("seoulall"); else if(G&&G.g&&window.guBack) _gb(); }finally{ inner=false; }
    C.on=true; C.key=null; C.card=null; document.getElementById("map").classList.add("ctmode");
    load().then(function(){ if(!C.on) return; draw(); }).catch(function(){}); draw(); }
  function exit(){ if(!C.on) return false; C.on=false; C.key=null; var m=document.getElementById("map"); m.classList.remove("ctmode");
    var l=document.getElementById("ctl"); if(l) l.remove(); var b=document.getElementById("ctX"); if(b) b.hidden=true;
    if(window._cardK==="__ct"){ try{ resClear(); }catch(e){} } C.card=null;
    var p=C.prev; C.prev=null; if(!p) return true;
    inner=true; try{ if(p.v!==VIEW) viewSet(p.v); if(p.g&&window.guEnter) guEnter(p.g); }finally{ inner=false; }
    ZM={s:p.zm.s,tx:p.zm.tx,ty:p.zm.ty}; zApply(); try{ LOD.s0=ZM.s; }catch(e){} return true; }
  window.ctEnter=enter; window.ctExit=exit;
  // 구 화면의 「시티투어버스 출발점」(gu.js 가 __ctoff 로 넘김) → 광화문 매표소 카드 그대로 (10-20)
  window.ctOffice=function(){ load().then(function(){ show("o"); }).catch(function(){}); };
  var _hc=window.hitClick; window.hitClick=function(k){ if(k==="__ctoff"){ window.ctOffice(); return; } return _hc.apply(this,arguments); };
  var _ps=window.placeShow; window.placeShow=function(k){ if(k==="citytour"&&!(window.ME&&ME.sel)){ enter(); return; } return _ps.apply(this,arguments); };
  var _vs=window.viewSet; window.viewSet=function(){ if(C.on&&!inner){ C.on=false; C.key=null; C.prev=null; document.getElementById("map").classList.remove("ctmode"); var l=document.getElementById("ctl"); if(l) l.remove(); var b=document.getElementById("ctX"); if(b) b.hidden=true; } return _vs.apply(this,arguments); };
  var _gb=window.guBack||function(){ return false; }; window.guBack=function(){ if(C.on) return exit(); return _gb.apply(this,arguments); };   // 뒤로가기: 카드 → 이 화면 → 원래 화면
  var _ld=window.lodDraw; window.lodDraw=function(){ var r=_ld.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  var _ds=window.detSet; window.detSet=function(){ var r=_ds.apply(this,arguments); try{ draw(); }catch(e){} return r; };
  // 누르기 — 핀·정류장·카드 안 정류장 줄. 이 화면에선 다른 그림(가려 둔 것)은 안 눌린다
  var dn=null; document.addEventListener("pointerdown",function(e){ dn={x:e.clientX,y:e.clientY}; },true);
  document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-ct]");
    if(t&&t.closest("#res")&&C.d){ e.preventDefault(); e.stopImmediatePropagation(); show(t.dataset.ct); return; }
    if(!C.on||window.DET) return;
    if(e.target.closest&&e.target.closest("#vback")){ e.stopImmediatePropagation(); e.preventDefault(); exit(); return; }
    if(!(e.target.closest&&e.target.closest("#map"))||e.target.closest(".zb,#zme,#vdet,#osm,#ctX,#nmapw")) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if(dn&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>8) return;
    if(!(t&&t.closest("#ctl"))){ t=null; var bd=24; [].forEach.call(document.querySelectorAll("#ctl [data-ct]"),function(q){ var r=q.getBoundingClientRect(), dd=Math.hypot(Math.max(r.left-e.clientX,0,e.clientX-r.right),Math.max(r.top-e.clientY,0,e.clientY-r.bottom)); if(dd<bd||(dd===bd&&q.dataset.ct==="o")){ bd=dd; t=q; } }); }   /* 손가락 한 마디(24px) 안의 가장 가까운 핀 */
    if(t) show(t.dataset.ct); },true);
})();
