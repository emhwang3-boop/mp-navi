/* 관리자 — 「제휴 가게」 (맞춤형 투어 식당 추천 맨 위 「광고」, 사장님 2026-10-16)
   허브 GET/POST /npartner/admin (관리 비밀번호). 업종 코드는 입점 문의 코드표(/ninq/cats, iqCats) 그대로.
   광고 기간(시작~끝, 한국 날짜) 안의 것만 손님 화면에 나간다. 태그: 채식·할랄·매운 음식·해산물·돼지고기 */
var PT=null, PTE=null, PTAG=[["veg","채식 가능"],["halal","할랄"],["spicy","매운 음식"],["seafood","해산물"],["pork","돼지고기"]];
function ptnLoad(){ var P=$("pane"); P.innerHTML='<div class="card"><div class="row"><b style="flex:1">제휴 가게</b><button onclick="ptnEdit(null)">＋ 추가</button></div><div class="msg">맞춤형 투어의 점심·저녁 「근처 식당 추천」 맨 위에 「광고」 표시로 나갑니다 (일정 장소에서 700m 안 · 광고 기간 안만). 손님 음식 선호는 태그로 거릅니다.</div><div id="ptE"></div><div id="ptl"><div class="msg">불러오는 중…</div></div></div>';
  Promise.all([iqCats(),api("/npartner/admin")]).then(function(a){ PT=a[1].items||[]; ptnDraw(); }).catch(function(){ $("ptl").innerHTML='<div class="msg err">불러오지 못했습니다</div>'; }); }
function ptnOn(x){ var t=kday(0); return (!x.from||x.from<=t)&&(!x.to||t<=x.to); }
function ptnDraw(){ if(!PT) return; if(!PT.length){ $("ptl").innerHTML='<div class="msg">아직 제휴 가게가 없습니다.</div>'; return; }
  $("ptl").innerHTML=PT.map(function(x,i){ var cn=iqCatNm(x.cat); return '<div class="inv" style="'+(ptnOn(x)?'border-left:4px solid var(--acc)':'opacity:.6')+'"><div><b>'+esc(x.ko)+'</b>'+(x.en?' · '+esc(x.en):'')+' · '+esc(cn[0])+(cn[1]?' &gt; '+esc(cn[1]):'')+'</div>'
    +'<div class="sub">'+(ptnOn(x)?'광고 중':'기간 밖')+' · '+esc(x.from||"처음부터")+' ~ '+esc(x.to||"끝없음")+(x.tel?' · '+esc(x.tel):'')+' · '+(+x.lat).toFixed(5)+', '+(+x.lng).toFixed(5)+(x.tags&&x.tags.length?' · '+x.tags.map(function(t){ var f=PTAG.filter(function(q){ return q[0]===t; })[0]; return f?f[1]:t; }).join("·"):'')+'</div>'
    +(x.dko?'<div class="sub">'+esc(x.dko)+'</div>':'')+'<div class="row" style="margin-top:6px"><button class="g" onclick="ptnEdit('+i+')">고치기</button><button class="g" onclick="ptnDel('+i+')">지우기</button></div></div>'; }).join(""); }
function ptnEdit(i){ var x=i==null?{}:PT[i]; PTE=x; var cats=[]; IQC.forEach(function(c){ if(c.sub) c.sub.forEach(function(s){ cats.push([c.c+"."+s.c,c.ko+" > "+s.ko]); }); else cats.push([c.c,c.ko]); });
  var inp=function(id,ph,v,t){ return '<input id="'+id+'" placeholder="'+ph+'" value="'+esc(v==null?"":v)+'"'+(t?' type="'+t+'"':'')+'>'; };
  $("ptE").innerHTML='<div class="inv" style="display:grid;gap:8px;max-width:520px;margin:10px 0"><b>'+(i==null?"새 제휴 가게":"고치기")+'</b>'
    +inp("pt_ko","상호 (한글) *",x.ko)+inp("pt_en","상호 (영어)",x.en)
    +'<select id="pt_cat"><option value="">업종 *</option>'+cats.map(function(c){ return '<option value="'+c[0]+'"'+(x.cat===c[0]?" selected":"")+'>'+esc(c[1])+'</option>'; }).join("")+'</select>'
    +'<div class="row">'+inp("pt_q","주소·상호로 좌표 찾기","")+'<button class="g" onclick="ptnFind()">찾기</button></div><div id="pt_qr"></div>'
    +'<div class="row">'+inp("pt_lat","위도 *",x.lat)+inp("pt_lng","경도 *",x.lng)+'</div>'+inp("pt_addr","주소",x.addr)+inp("pt_tel","전화",x.tel)
    +'<div class="row">광고 기간 '+inp("pt_from","",x.from,"date")+' ~ '+inp("pt_to","",x.to,"date")+'</div>'
    +'<textarea id="pt_dko" placeholder="소개 (한글, 200자)" maxlength="200">'+esc(x.dko||"")+'</textarea><textarea id="pt_den" placeholder="Intro (English, 260 chars)" maxlength="260">'+esc(x.den||"")+'</textarea>'
    +'<div class="row">'+PTAG.map(function(t){ return '<label><input type="checkbox" class="pt_tag" value="'+t[0]+'"'+((x.tags||[]).indexOf(t[0])>=0?" checked":"")+'> '+t[1]+'</label>'; }).join(" ")+'</div>'
    +'<div class="row"><button onclick="ptnSave()">저장</button><button class="g" onclick="$(\'ptE\').innerHTML=\'\'">닫기</button></div><div id="pt_m" class="msg"></div></div>'; }
function ptnFind(){ var q=$("pt_q").value.trim(); if(!q) return; $("pt_qr").innerHTML='<div class="msg">찾는 중…</div>';
  fetch(HUB+"/kplace?q="+encodeURIComponent(q)).then(function(r){ return r.json(); }).then(function(j){ var it=((j&&j.items)||[]).slice(0,5); window.__ptq=it;
    $("pt_qr").innerHTML=it.length?it.map(function(x,k){ return '<div class="inv" style="cursor:pointer" onclick="ptnUse('+k+')"><b>'+esc(x.name)+'</b> <span class="sub">'+esc(x.addr)+' · '+esc(String(x.cat||"").split(">").pop())+'</span></div>'; }).join(""):'<div class="msg">없음</div>'; }).catch(function(){ $("pt_qr").innerHTML='<div class="msg err">찾지 못했습니다</div>'; }); }
function ptnUse(k){ var x=window.__ptq[k]; $("pt_lat").value=(+x.y).toFixed(6); $("pt_lng").value=(+x.x).toFixed(6); $("pt_addr").value=x.addr||""; if(!$("pt_ko").value) $("pt_ko").value=x.name; if(!$("pt_tel").value&&x.tel) $("pt_tel").value=x.tel; $("pt_qr").innerHTML=""; }
function ptnSave(){ var v=function(id){ return $(id).value.trim(); }, it={id:PTE&&PTE.id,ko:v("pt_ko"),en:v("pt_en"),cat:v("pt_cat"),lat:+v("pt_lat"),lng:+v("pt_lng"),addr:v("pt_addr"),tel:v("pt_tel"),from:v("pt_from"),to:v("pt_to"),dko:v("pt_dko"),den:v("pt_den"),
    tags:[].filter.call(document.querySelectorAll(".pt_tag"),function(c){ return c.checked; }).map(function(c){ return c.value; })};
  $("pt_m").textContent="저장 중…";
  api("/npartner/admin",{method:"POST",body:JSON.stringify({op:"put",item:it})}).then(function(j){ if(!j.ok) throw new Error(j.err||"x"); ptnLoad(); }).catch(function(e){ $("pt_m").innerHTML='<span class="err">저장 못 함 — '+esc(e.message)+'</span>'; }); }
function ptnDel(i){ var x=PT[i]; if(!confirm("「"+x.ko+"」를 지울까요?")) return; api("/npartner/admin",{method:"POST",body:JSON.stringify({op:"del",id:x.id})}).then(ptnLoad); }
