// ── 가게 · 가게 메뉴 · 가게 정산 · 센터 수수료 (사장님 2026-11-10 「만들어」) — 관리자 메뉴판 「가게·메뉴」「가게 정산」「센터 수수료」 ──
//   허브: GET /shop/admin/smn · POST /shop/admin/smn/shop · /shop/admin/smn/shop/del · /shop/admin/smn/menu
//         GET /shop/admin/smn/settle?from=&to= · POST /shop/admin/smn/settle/pay · GET /shop/admin/smn/cfee?ym= · POST /shop/admin/smn/cfee/set · /shop/admin/smn/cfee/got
//   · 가게 = 이름 · 전화(문자 받는 휴대폰) · 계좌 · 수수료율(%) — 전화·계좌는 허브가 봉인해 저장 · 입력 상한 없음
//   · 상품마다 가게 메뉴 — 개수 정하지 않음 · 한국어만 넣으면 나머지 5개 언어는 상품 관리와 같은 AI 번역 · 「하나만」/「여러 개·수량」 · 받는 곳 「앱에서 받기」/「가게(센터)에서 직접」
//   · 가게 정산 = 손님이 「투어 완료」를 누른 예약만 · 보낼 돈 = 앱에서 받은 메뉴 금액 − 수수료 · 사장님이 은행 앱으로 보낸 뒤 「송금함」 (자동 송금 없음)
//   · 센터 수수료 = 「가게(센터)에서 직접」 메뉴가 있는 상품의 예약 · 금액은 센터가 알려 준 수수료를 넣는다 · 센터·달마다 「받음」
//   index.html 의 api()·esc()·won()·tile()·kday()·pdUpload()·$() 를 그대로 쓴다
(function(){
"use strict";
var SA={d:null,ed:null,shopEd:null,per:"w",pi:0,cm:0};
function W(n){ return typeof won==="function"?won(n):Number(n||0).toLocaleString("ko-KR")+"원"; }
function P(){ return $("pane"); }
function err(m){ return '<div class="msg err">'+esc(m)+'</div>'; }
var ERR={name:"이름을 넣어 주세요",price:"가격은 0 이상 숫자로 넣어 주세요",rate:"수수료율은 0 이상 숫자로 넣어 주세요",linked:"이 가게에 연결된 상품이 있습니다 — 먼저 상품의 가게 연결을 빼 주세요",shop:"가게를 다시 골라 주세요",prod:"상품을 찾을 수 없습니다",none:"보낼 예약이 없습니다(이미 보냄)",empty:"보낼 예약이 없습니다",amt:"금액을 숫자로 넣어 주세요"};
function eTx(j){ return ERR[(j&&j.err)||""]||("저장하지 못했습니다 ("+((j&&j.err)||"")+")"); }
var css=document.createElement("style"); css.textContent=".sa-it{border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0;background:var(--bg)}.sa-it .row input[type=text]{flex:1;min-width:160px}.sa-it .row input.pr{width:120px;flex:0 0 auto}"
 +".sa-im{width:56px;height:56px;border-radius:10px;object-fit:cover;background:var(--card);border:1px solid var(--line)}.sa-tr{font-size:12px;color:var(--sub);margin-top:4px;line-height:1.5}.sa-k{display:inline-block;font-size:12px;font-weight:700;border-radius:6px;padding:1px 7px}.sa-k.a{background:#e8f6ee;color:#1f7a5a}.sa-k.s{background:#fff4d6;color:#8a5a00}"
 +".sa-pd{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid var(--line);padding:9px 0}.sa-pd:first-of-type{border-top:0}.sa-ok{color:var(--ok);font-weight:700}.sa-no{color:var(--bad);font-weight:700}.sa-acct{background:var(--bg);border-radius:10px;padding:8px 10px;margin:8px 0;font-size:14px}"
 +".sa-fee{width:110px;text-align:right}";
document.head.appendChild(css);
function load(then){ P().innerHTML='<div class="card"><b>가게·메뉴</b><div class="msg">불러오는 중…</div></div>';
  api("/shop/admin/smn").then(function(j){ if(!j.ok) throw new Error(j.err||"x"); SA.d=j; then(); }).catch(function(e){ P().innerHTML='<div class="card"><b>가게·메뉴</b>'+err("불러오지 못했습니다 ("+e.message+")")+'</div>'; }); }
function shopName(id){ var s=(SA.d.shops||[]).filter(function(x){ return x.id===id; })[0]; return s?s.name:""; }
function prodName(id){ var p=(SA.d.prods||[]).filter(function(x){ return x.id===id; })[0]; return p?p.ko:id; }

// ════ 가게·메뉴 ════
function store(){ var d=SA.d, h='';
  h+='<div class="card"><div class="row" style="justify-content:space-between"><b>가게 ('+d.shops.length+')</b><button onclick="SMA.shopEd()">+ 새 가게</button></div>'
   +'<div class="msg">가게 사장님 휴대폰으로 예약·바우처 변경·취소 문자가 갑니다(알리고). 전화·계좌는 암호화해 저장합니다. 수수료율은 가게 정산에서 「앱에서 받은 메뉴 금액」에서 뗍니다.</div><div id="saShopEd"></div>';
  h+=d.shops.length?'<div class="tw"><table><tr><th class="l">이름</th><th class="l">전화</th><th class="l">계좌</th><th>수수료율</th><th class="l">연결 상품</th><th></th></tr>'+d.shops.map(function(s){ var ps=Object.keys(d.menus).filter(function(k){ return d.menus[k]&&d.menus[k].shop===s.id; }).map(prodName);
      return '<tr><td class="l"><b>'+esc(s.name)+'</b></td><td class="l">'+esc(s.phone||"-")+'</td><td class="l">'+esc(s.acct||"-")+'</td><td>'+esc(String(s.rate))+'%</td><td class="l">'+(ps.length?esc(ps.join(", ")):'<span class="sub">없음</span>')+'</td>'
        +'<td><button class="g" onclick="SMA.shopEd(\''+esc(s.id)+'\')">고치기</button> <button class="g" onclick="SMA.shopDel(\''+esc(s.id)+'\')">✕</button></td></tr>'; }).join("")+'</table></div>':'<div class="msg">아직 가게가 없습니다.</div>';
  h+='</div>';
  h+='<div class="card"><b>상품별 가게 메뉴</b><div class="msg">메뉴 개수는 정하지 않습니다 — 몇 개든 넣고·빼고·고칩니다. 한국어 이름만 넣으면 나머지 5개 언어는 상품 관리처럼 AI가 옮깁니다. 메뉴가 없는 상품은 지금과 똑같이 보입니다. 결제한 예약은 결제할 때 이름·가격 그대로입니다.</div><div id="saMenuEd"></div>'
   +d.prods.map(function(p){ var m=d.menus[p.id], n=m&&m.items?m.items.length:0;
      return '<div class="sa-pd"><div><b>'+esc(p.ko)+'</b> <span class="sub">'+esc(p.id)+(p.st==="sale"?"":p.st==="stop"?" · 판매 중지":" · 준비 중")+'</span><div class="sub">'+(n?(m.mode==="multi"?"여러 개·수량":"하나만")+" · 메뉴 "+n+"개 ("+m.items.filter(function(x){ return x.at==="shop"; }).length+"개 가게에서 직접)":"메뉴 없음")+' · 가게 '+(m&&m.shop?esc(shopName(m.shop)||"(지워짐)"):'연결 없음')+(m&&m.trw?' · <span class="sa-no">번역 확인 필요</span>':'')+'</div></div>'
        +'<button class="g" onclick="SMA.menuEd(\''+esc(p.id)+'\')">메뉴 고치기</button></div>'; }).join("")
   +'</div>';
  P().innerHTML=h; }
function shopEd(id){ var s=id?(SA.d.shops||[]).filter(function(x){ return x.id===id; })[0]:{id:"",name:"",phone:"",acct:"",rate:""}; if(!s) return; SA.shopEd=s;
  $("saShopEd").innerHTML='<div class="sa-it"><b>'+(id?"가게 고치기":"새 가게")+'</b><div style="display:grid;gap:8px;margin-top:8px;max-width:560px">'
    +'<label>이름 <input type="text" id="saSN" value="'+esc(s.name)+'" style="width:100%" placeholder="예: 인사동 ○○도장"></label>'
    +'<label>전화 (문자 받는 휴대폰) <input type="text" id="saSP" value="'+esc(s.phone||"")+'" style="width:100%" placeholder="010-0000-0000"></label>'
    +'<label>계좌 (은행·번호·예금주) <input type="text" id="saSA" value="'+esc(s.acct||"")+'" style="width:100%" placeholder="예: 국민 000-00-0000 홍길동"></label>'
    +'<label>수수료율 (%) <input type="text" id="saSR" value="'+esc(String(s.rate==null?"":s.rate))+'" style="width:120px" inputmode="decimal"></label>'
    +'<div class="row"><button onclick="SMA.shopSave()">저장</button><button class="g" onclick="$(\'saShopEd\').innerHTML=\'\'">취소</button><span class="msg" id="saSM"></span></div></div></div>';
  $("saShopEd").scrollIntoView({block:"center"}); }
function shopSave(){ var s=SA.shopEd; if(!s) return; $("saSM").textContent="저장하는 중…";
  api("/shop/admin/smn/shop",{method:"POST",body:JSON.stringify({id:s.id,name:$("saSN").value,phone:$("saSP").value,acct:$("saSA").value,rate:$("saSR").value})}).then(function(j){ if(!j.ok){ $("saSM").innerHTML='<span class="err">'+esc(eTx(j))+'</span>'; return; } load(store); }).catch(function(){ $("saSM").innerHTML='<span class="err">저장하지 못했습니다</span>'; }); }
function shopDel(id){ if(!confirm("「"+shopName(id)+"」 가게를 지울까요?")) return; api("/shop/admin/smn/shop/del",{method:"POST",body:JSON.stringify({id:id})}).then(function(j){ if(!j.ok){ alert(eTx(j)); return; } load(store); }).catch(function(){ alert("지우지 못했습니다"); }); }
// 메뉴 고치기 — 줄마다 사진·이름(한국어)·가격·받는 곳 · 순서 바꾸기 · 빼기
function menuEd(pid){ var m=SA.d.menus[pid]||{mode:"one",shop:"",items:[]}; SA.ed={pid:pid,mode:m.mode||"one",shop:m.shop||"",items:(m.items||[]).map(function(x){ return {id:x.id,ko:x.t&&x.t.ko||"",t:x.t||{},price:x.price,img:x.img||"",at:x.at||"app"}; })}; edPaint(); var e=$("saMenuEd"); if(e) e.scrollIntoView({block:"start"}); }
function edPaint(){ var e=SA.ed, box=$("saMenuEd"); if(!e||!box) return;
  var h='<div class="sa-it" style="border:2px solid var(--acc)"><div class="row" style="justify-content:space-between"><b>'+esc(prodName(e.pid))+' · 가게 메뉴</b><span class="sub">'+esc(e.pid)+'</span></div>'
   +'<div class="row" style="margin-top:8px"><label>연결 가게 <select id="saES" onchange="SMA.ed.shop=this.value">'+'<option value="">(연결 없음 — 문자·정산 없음)</option>'+SA.d.shops.map(function(s){ return '<option value="'+esc(s.id)+'"'+(s.id===e.shop?' selected':'')+'>'+esc(s.name)+' ('+esc(String(s.rate))+'%)</option>'; }).join("")+'</select></label></div>'
   +'<div class="row" style="margin-top:8px"><span>고르는 방식</span><label><input type="radio" name="saEM" value="one"'+(e.mode!=="multi"?' checked':'')+' onchange="SMA.ed.mode=\'one\'"> 하나만 (도장 등)</label><label><input type="radio" name="saEM" value="multi"'+(e.mode==="multi"?' checked':'')+' onchange="SMA.ed.mode=\'multi\'"> 여러 개·수량 (식당 등)</label></div>';
  h+=e.items.map(function(x,i){ var tr=["en","ja","zhs","zht","es"].map(function(l){ return x.t&&x.t[l]&&x.t.ko===x.ko?l+": "+x.t[l]:""; }).filter(Boolean).join(" · ");
    return '<div class="sa-it" style="background:var(--card)"><div class="row">'+(x.img?'<img class="sa-im" src="'+esc(HUB+"/shop/img/"+x.img)+'" alt="">':'<span class="sa-im" style="display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:var(--sub)">사진 없음</span>')
      +'<label class="g" style="display:inline-block;border:1px solid var(--line);border-radius:10px;padding:7px 10px;cursor:pointer">사진<input type="file" accept="image/*" style="display:none" onchange="SMA.img('+i+',this)"></label>'+(x.img?'<button class="g" onclick="SMA.ed.items['+i+'].img=\'\';SMA.edPaint()">사진 빼기</button>':'')
      +'<span class="sub" id="saImM'+i+'"></span></div>'
      +'<div class="row" style="margin-top:6px"><input type="text" placeholder="메뉴 이름 (한국어)" value="'+esc(x.ko)+'" oninput="SMA.ed.items['+i+'].ko=this.value"><input type="text" class="pr" inputmode="numeric" placeholder="가격(원)" value="'+esc(x.price==null?"":String(x.price))+'" oninput="SMA.ed.items['+i+'].price=this.value"><span>원</span>'
      +'<select onchange="SMA.ed.items['+i+'].at=this.value"><option value="app"'+(x.at!=="shop"?' selected':'')+'>앱에서 받기</option><option value="shop"'+(x.at==="shop"?' selected':'')+'>가게(센터)에서 직접</option></select></div>'
      +'<div class="row" style="margin-top:6px"><button class="g" onclick="SMA.mv('+i+',-1)"'+(i?'':' disabled')+'>↑</button><button class="g" onclick="SMA.mv('+i+',1)"'+(i<e.items.length-1?'':' disabled')+'>↓</button><button class="g" onclick="SMA.ed.items.splice('+i+',1);SMA.edPaint()">빼기</button></div>'
      +(tr?'<div class="sa-tr">'+esc(tr)+'</div>':'')+'</div>'; }).join("");
  h+='<div class="row" style="margin-top:8px"><button class="g" onclick="SMA.ed.items.push({id:\'\',ko:\'\',t:{},price:\'\',img:\'\',at:\'app\'});SMA.edPaint()">+ 메뉴 더하기</button></div>'
   +'<div class="row" style="margin-top:12px"><button id="saESv" onclick="SMA.menuSave()">저장</button><button class="g" onclick="SMA.ed=null;$(\'saMenuEd\').innerHTML=\'\'">취소</button><span class="msg" id="saEM"></span></div>'
   +'<div class="msg">「앱에서 받기」 = 손님이 패키지 여행비와 함께 앱에서 결제 → 가게 정산(수수료 뗀 나머지를 가게로). 「가게(센터)에서 직접」 = 앱은 값 안내·미리 고르기만, 손님이 가게·센터에 직접 냄 → 센터 수수료 장부. 메뉴를 모두 빼고 가게 연결도 비우면 지금처럼 메뉴 없는 상품으로 돌아갑니다.</div></div>';
  box.innerHTML=h; }
function mv(i,d){ var a=SA.ed.items, j=i+d; if(j<0||j>=a.length) return; var t=a[i]; a[i]=a[j]; a[j]=t; edPaint(); }
function img(i,inp){ var f=inp.files&&inp.files[0]; if(!f) return; var m=$("saImM"+i); if(m) m.textContent="올리는 중…";
  pdUpload({file:f}).then(function(id){ SA.ed.items[i].img=id; edPaint(); }).catch(function(e){ if(m) m.innerHTML='<span class="err">'+esc(e.message)+'</span>'; }); }
function menuSave(){ var e=SA.ed; if(!e) return; var b=$("saESv"); b.disabled=true; $("saEM").textContent="저장하는 중… (새 이름은 AI 번역)";
  var items=e.items.map(function(x){ return {id:x.id,ko:String(x.ko||"").trim(),price:String(x.price==null?"":x.price).replace(/[^0-9]/g,""),img:x.img||"",at:x.at}; });
  api("/shop/admin/smn/menu",{method:"POST",body:JSON.stringify({pid:e.pid,mode:e.mode,shop:e.shop,items:items})}).then(function(j){ b.disabled=false;
    if(!j.ok){ $("saEM").innerHTML='<span class="err">'+esc(eTx(j)+(j.ko?" — "+j.ko:""))+'</span>'; return; }
    if(String(j.ai||"").indexOf("fail")===0) alert("저장했습니다. AI 번역은 실패해 한국어로 두었습니다 ("+j.ai+"). 다시 저장하면 다시 옮깁니다.");
    SA.ed=null; load(store); }).catch(function(){ b.disabled=false; $("saEM").innerHTML='<span class="err">저장하지 못했습니다</span>'; }); }

// ════ 가게 정산 ════
function kd(ms){ return new Date(ms+9*36e5).toISOString().slice(0,10); }
function periods(unit){ var out=[], now=Date.now()+9*36e5, d=new Date(now);
  if(unit==="m"){ for(var i=0;i<12;i++){ var y=d.getUTCFullYear(), mo=d.getUTCMonth()-i; var a=new Date(Date.UTC(y,mo,1)), b=new Date(Date.UTC(y,mo+1,0)); out.push({lb:a.toISOString().slice(0,7)+(i===0?" (이번 달)":i===1?" (지난달)":""),from:a.toISOString().slice(0,10),to:b.toISOString().slice(0,10)}); } return out; }
  var wd=(d.getUTCDay()+6)%7, mon=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-wd);
  for(var k=0;k<13;k++){ var f=new Date(mon-k*7*864e5), t=new Date(mon-k*7*864e5+6*864e5); out.push({lb:f.toISOString().slice(5,10).replace("-","/")+" ~ "+t.toISOString().slice(5,10).replace("-","/")+(k===0?" (이번 주)":k===1?" (지난주)":""),from:f.toISOString().slice(0,10),to:t.toISOString().slice(0,10)}); }
  return out; }
function settle(){ var ps=periods(SA.per), pr=ps[Math.min(SA.pi,ps.length-1)];
  P().innerHTML='<div class="card"><b>가게 정산</b><div class="msg">손님이 「투어 완료」를 누른 예약만 모읍니다(기간 = 투어 날짜). 보낼 돈 = 앱에서 받은 메뉴 금액 − 수수료. 은행 앱으로 보낸 뒤 「송금함」을 누르면 날짜와 함께 기록합니다(자동 송금 없음). 패키지 여행비(가이드비)는 여기 들어가지 않습니다.</div>'
    +'<div class="row" style="margin-top:10px"><select id="saPU" onchange="SMA.per=this.value;SMA.pi=0;SMA.settle()"><option value="w"'+(SA.per==="w"?' selected':'')+'>주</option><option value="m"'+(SA.per==="m"?' selected':'')+'>월</option></select>'
    +'<select id="saPI" onchange="SMA.pi=+this.value;SMA.settle()">'+ps.map(function(p,i){ return '<option value="'+i+'"'+(i===SA.pi?' selected':'')+'>'+esc(p.lb)+'</option>'; }).join("")+'</select><span class="sub">'+esc(pr.from+" ~ "+pr.to)+'</span></div></div><div id="saSet"><div class="card"><div class="msg">불러오는 중…</div></div></div>';
  api("/shop/admin/smn/settle?from="+pr.from+"&to="+pr.to).then(function(j){ if(!j.ok) throw new Error(j.err||"x"); SA.st=j; setPaint(pr); }).catch(function(e){ $("saSet").innerHTML='<div class="card">'+err("불러오지 못했습니다 ("+e.message+")")+'</div>'; }); }
function setPaint(pr){ var j=SA.st, by={}, h='';
  j.rows.forEach(function(r){ (by[r.sid]=by[r.sid]||[]).push(r); });
  var sids=Object.keys(by); if(!sids.length) h+='<div class="card"><div class="msg">이 기간에 투어 완료된 가게 메뉴 예약이 없습니다.</div></div>';
  sids.forEach(function(sid){ var rs=by[sid], s=j.shops.filter(function(x){ return x.id===sid; })[0]||{name:rs[0].sname,rate:0}, un=rs.filter(function(r){ return !r.paid; });
    var sum=function(a,k){ return a.reduce(function(t,r){ return t+(r[k]||0); },0); };
    h+='<div class="card"><div class="row" style="justify-content:space-between"><b>'+esc(s.name)+'</b><span class="sub">수수료 '+esc(String(s.rate))+'%</span></div>'
      +'<div class="sa-acct">계좌: <b>'+esc(s.acct||"(계좌 없음 — 가게·메뉴에서 넣기)")+'</b>'+(s.acct?' <button class="g" onclick="try{navigator.clipboard.writeText('+esc(JSON.stringify(s.acct))+');this.textContent=\'복사됨\'}catch(e){}">복사</button>':'')+'</div>'
      +'<div class="tiles">'+tile(rs.length+"건","투어 완료")+tile(W(sum(rs,"app")),"앱에서 받은 메뉴")+tile(W(sum(rs,"fee")),"수수료")+tile(W(sum(un,"net")),"아직 안 보낸 돈 ("+un.length+"건)")+'</div>'
      +'<div class="tw"><table><tr><th class="l">투어 날짜</th><th class="l">주문번호</th><th class="l">상품·메뉴</th><th>메뉴 금액</th><th>수수료</th><th>보낼 돈</th><th class="l">송금</th></tr>'
      +rs.map(function(r){ return '<tr><td class="l">'+esc(r.date+" "+(r.time||""))+'</td><td class="l">'+esc(r.oid)+(r.v>1?' <span class="sub">바우처 '+r.v+'번째</span>':'')+'</td><td class="l">'+esc(r.pname)+'<br><span class="sub">'+esc(r.items.map(function(x){ return x.ko+" × "+x.q; }).join(", "))+'</span></td>'
        +'<td>'+W(r.app)+'</td><td>'+W(r.fee)+'<br><span class="sub">'+esc(String(r.rate))+'%</span></td><td><b>'+W(r.net)+'</b></td><td class="l">'+(r.paid?'<span class="sa-ok">보냄 '+esc(r.paid.at)+'</span>':'<span class="sa-no">안 보냄</span>')+'</td></tr>'; }).join("")
      +'</table></div>'+(un.length?'<div class="row" style="margin-top:10px"><button onclick="SMA.pay(\''+esc(sid)+'\')">송금함 — '+esc(W(sum(un,"net")))+' ('+un.length+'건)</button><span class="sub">은행 앱으로 보낸 뒤 누르세요</span></div>':'<div class="msg sa-ok">이 기간은 모두 보냈습니다.</div>')+'</div>'; });
  if(j.wait.length) h+='<div class="card"><b>투어 완료를 기다리는 예약 ('+j.wait.length+')</b><div class="msg">손님이 아직 「투어 완료」를 누르지 않아 정산에 넣지 않았습니다.</div><div class="tw"><table><tr><th class="l">투어 날짜</th><th class="l">가게</th><th class="l">주문번호</th><th class="l">상품·메뉴</th><th>메뉴 금액</th></tr>'
    +j.wait.map(function(r){ return '<tr><td class="l">'+esc(r.date+" "+(r.time||""))+'</td><td class="l">'+esc(r.sname)+'</td><td class="l">'+esc(r.oid)+'</td><td class="l">'+esc(r.pname)+'<br><span class="sub">'+esc(r.items.map(function(x){ return x.ko+" × "+x.q; }).join(", "))+'</span></td><td>'+W(r.app)+'</td></tr>'; }).join("")+'</table></div></div>';
  if(j.payouts.length) h+='<div class="card"><b>송금 기록</b><div class="tw"><table><tr><th class="l">누른 시각</th><th class="l">가게</th><th class="l">투어 기간</th><th>건수</th><th>메뉴 금액</th><th>수수료</th><th>보낸 돈</th></tr>'
    +j.payouts.map(function(x){ return '<tr><td class="l">'+esc(x.at)+'</td><td class="l">'+esc(x.name)+'</td><td class="l">'+esc((x.from||"")+" ~ "+(x.to||""))+'</td><td>'+x.n+'</td><td>'+W(x.app)+'</td><td>'+W(x.fee)+'</td><td><b>'+W(x.net)+'</b></td></tr>'; }).join("")+'</table></div></div>';
  $("saSet").innerHTML=h; SA.pr=pr; }
function pay(sid){ var j=SA.st, un=j.rows.filter(function(r){ return r.sid===sid&&!r.paid; }), net=un.reduce(function(t,r){ return t+r.net; },0), s=j.shops.filter(function(x){ return x.id===sid; })[0]||{};
  if(!un.length||!confirm("「"+(s.name||"")+"」에 "+W(net)+"을 은행 앱으로 보냈나요?\n"+un.length+"건을 「보냄」으로 기록합니다.")) return;
  api("/shop/admin/smn/settle/pay",{method:"POST",body:JSON.stringify({sid:sid,oids:un.map(function(r){ return r.oid; }),from:SA.pr.from,to:SA.pr.to})}).then(function(r){ if(!r.ok){ alert(eTx(r)); } settle(); }).catch(function(){ alert("기록하지 못했습니다"); }); }

// ════ 센터 수수료 ════
function months(){ var out=[], d=new Date(Date.now()+9*36e5); for(var i=0;i<12;i++){ var a=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-i,1)); out.push(a.toISOString().slice(0,7)); } return out; }
function cfee(){ var ms=months(), M=ms[Math.min(SA.cm,ms.length-1)];
  P().innerHTML='<div class="card"><b>센터에서 받을 수수료</b><div class="msg">「가게(센터)에서 직접」 메뉴가 있는 상품(건강검진 등)의 예약입니다. 손님은 진료비를 센터에 직접 내고, 센터가 정해진 날 우리에게 수수료를 보냅니다. 우리는 진료비를 모르니 센터가 알려 준 수수료를 예약마다 넣고, 받으면 「받음」을 누르세요.</div>'
    +'<div class="row" style="margin-top:10px"><select onchange="SMA.cm=+this.value;SMA.cfee()">'+ms.map(function(m,i){ return '<option value="'+i+'"'+(i===SA.cm?' selected':'')+'>'+m+(i===0?" (이번 달)":"")+'</option>'; }).join("")+'</select><span class="sub">투어 날짜 기준</span></div></div><div id="saCf"><div class="card"><div class="msg">불러오는 중…</div></div></div>';
  api("/shop/admin/smn/cfee?ym="+M).then(function(j){ if(!j.ok) throw new Error(j.err||"x"); SA.cf=j; cfPaint(); }).catch(function(e){ $("saCf").innerHTML='<div class="card">'+err("불러오지 못했습니다 ("+e.message+")")+'</div>'; }); }
function cfPaint(){ var j=SA.cf, by={}, h=''; j.rows.forEach(function(r){ (by[r.sid]=by[r.sid]||[]).push(r); });
  var sids=Object.keys(by); if(!sids.length) h='<div class="card"><div class="msg">'+esc(j.ym)+' 에 해당 예약이 없습니다.</div></div>';
  sids.forEach(function(sid){ var rs=by[sid], s=j.shops.filter(function(x){ return x.id===sid; })[0]||{name:rs[0].sname}, tot=rs.reduce(function(t,r){ return t+(r.fee||0); },0), miss=rs.filter(function(r){ return r.fee==null; }).length, g=j.got[sid];
    h+='<div class="card"><div class="row" style="justify-content:space-between"><b>'+esc(s.name)+' · '+esc(j.ym)+'</b>'+(g?'<span class="sa-ok">받음 '+esc(g.got)+' · '+W(g.amt)+'</span>':'<span class="sa-no">아직 안 받음</span>')+'</div>'
      +'<div class="tiles">'+tile(rs.length+"건","예약")+tile(W(tot),"받을 수수료 합계")+tile(miss+"건","수수료 아직 안 넣음")+'</div>'
      +'<div class="tw"><table><tr><th class="l">투어 날짜</th><th class="l">주문번호</th><th class="l">손님</th><th class="l">고른 추가 검사 (안내 금액)</th><th class="l">투어</th><th>수수료 (원)</th></tr>'
      +rs.map(function(r){ return '<tr><td class="l">'+esc(r.date+" "+(r.time||""))+'</td><td class="l">'+esc(r.oid)+'</td><td class="l">'+esc(r.cust)+' · '+r.n+'명</td><td class="l">'+(r.items.length?esc(r.items.map(function(x){ return x.ko+" × "+x.q+" ("+W(x.price*x.q)+")"; }).join(", ")):'<span class="sub">기본만 (추가 없음)</span>')+'</td>'
        +'<td class="l">'+(r.done?'<span class="sa-ok">완료</span>':'<span class="sub">완료 전</span>')+'</td><td><input type="text" class="sa-fee" inputmode="numeric" value="'+(r.fee==null?"":r.fee)+'" placeholder="센터가 알려 준 금액" onchange="SMA.feeSet(\''+esc(r.oid)+'\',this)"></td></tr>'; }).join("")
      +'</table></div><div class="row" style="margin-top:10px">'+(g?'<button class="g" onclick="SMA.got(\''+esc(sid)+'\',0)">「받음」 지우기</button>':'<button onclick="SMA.got(\''+esc(sid)+'\',1)">받음 — '+esc(W(tot))+'</button>')+'</div></div>'; });
  $("saCf").innerHTML=h; }
function feeSet(oid,inp){ var v=String(inp.value||"").replace(/[^0-9]/g,""); inp.disabled=true;
  api("/shop/admin/smn/cfee/set",{method:"POST",body:JSON.stringify({oid:oid,amt:v})}).then(function(j){ inp.disabled=false; if(!j.ok){ alert(eTx(j)); return; } var r=SA.cf.rows.filter(function(x){ return x.oid===oid; })[0]; if(r) r.fee=j.amt; cfPaint(); }).catch(function(){ inp.disabled=false; alert("저장하지 못했습니다"); }); }
function got(sid,on){ var j=SA.cf, rs=j.rows.filter(function(r){ return r.sid===sid; }), tot=rs.reduce(function(t,r){ return t+(r.fee||0); },0);
  if(on&&!confirm(j.ym+" 수수료 "+W(tot)+"을 받았나요?")) return; if(!on&&!confirm("「받음」 기록을 지울까요?")) return;
  api("/shop/admin/smn/cfee/got",{method:"POST",body:JSON.stringify({sid:sid,ym:j.ym,on:!!on,amt:tot,n:rs.length})}).then(function(r){ if(!r.ok){ alert(eTx(r)); return; } cfee(); }).catch(function(){ alert("기록하지 못했습니다"); }); }

window.SMA={show:function(id){ if(id==="store") load(store); else if(id==="sset") settle(); else if(id==="scfee") cfee(); },
  shopEd:shopEd,shopSave:shopSave,shopDel:shopDel,menuEd:menuEd,edPaint:edPaint,menuSave:menuSave,mv:mv,img:img,settle:settle,pay:pay,cfee:cfee,feeSet:feeSet,got:got,
  get ed(){ return SA.ed; }, set ed(v){ SA.ed=v; }, get per(){ return SA.per; }, set per(v){ SA.per=v; }, get pi(){ return SA.pi; }, set pi(v){ SA.pi=v; }, get cm(){ return SA.cm; }, set cm(v){ SA.cm=v; }};
})();
