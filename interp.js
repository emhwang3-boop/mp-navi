/* 머니퍼즐 투어 — 🗣 통역 (사장님 2026-10-19 「가」 방식)
 *  · 오른쪽 🌐 언어 단추 바로 아래 🗣 단추. 누르면 「한국 사람에게 보여 줄 말」 판 — 큰 한국어 글씨 + 내 말 뜻
 *    (지금 열어 둔 장소 카드가 있으면 「○○에 어떻게 가요?」·「○○로 가 주세요」를 그 장소 한국어 이름으로)
 *  · 「구글 번역으로 대화」 = 폰의 구글 번역 앱(없으면 translate.google.com)을 손님 언어 ↔ 한국어로 연다
 *    지금 화면은 그대로 두고 새 창·다른 앱으로 연다 — 돌아오면(뒤로가기·아이폰 왼쪽 위 ◀) 보던 지도·카드·거리선 그대로
 *  · index.html 맨 끝 <script src="interp.js"> 한 줄. 전역 LANG · PLACES · _ntK 만 읽는다
 */
(function(){
  var GL={ko:"ko",en:"en",ja:"ja",zhs:"zh-CN",zht:"zh-TW",es:"es"};
  function L5(o){ return o[window.LANG]||o.en; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  var st=document.createElement("style");
  st.textContent="#itP{position:fixed;right:0;z-index:2147482999;background:#0b9b6e;color:#fff;border:0;border-radius:999px 0 0 999px;padding:9px 14px 9px 12px;font:700 15px/1 system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.3);opacity:.94;cursor:pointer}"
    +"#itB{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}"
    +"#itB .in{background:#fff;color:#111827;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px 14px 22px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans KR','Hiragino Sans','PingFang SC','Microsoft YaHei',sans-serif}"
    +"#itB .hd{display:flex;align-items:center;font-weight:800;font-size:17px;margin-bottom:10px}#itB .hd button{margin-left:auto;border:0;background:none;font-size:22px;color:#667;cursor:pointer}"
    +"#itB .ph{border:1px solid #e3e7ee;border-radius:14px;padding:12px 14px;margin:8px 0;cursor:pointer;background:#f7f9fc}"
    +"#itB .ph .k{font-size:22px;font-weight:800;line-height:1.35}#itB .ph .m{font-size:13.5px;color:#5b6474;margin-top:3px}"
    +"#itB .big{position:fixed;inset:0;background:#fff;z-index:2147483002;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}"
    +"#itB .big .k{font-size:clamp(34px,10vw,64px);font-weight:900;line-height:1.3;color:#111827}#itB .big .m{font-size:16px;color:#5b6474;margin-top:16px}#itB .big .x{margin-top:28px;font-size:15px;border:1px solid #cfd6e2;background:#fff;border-radius:999px;padding:10px 22px}"
    +"#itB .gt{display:block;text-align:center;margin:14px 0 6px;background:#1a73e8;color:#fff;text-decoration:none;font-weight:800;border-radius:12px;padding:13px 10px;font-size:16px}"
    +"#itB .nt{font-size:12.5px;color:#6b7280;text-align:center;line-height:1.5}";
  document.head.appendChild(st);
  var hb=document.getElementById("hit"), b=document.createElement("button"); b.id="itP"; b.type="button"; if(!hb) document.body.appendChild(b);   /* 머리줄 말풍선 아이콘(#hit)이 있으면 떠 있는 알약은 안 붙인다 (사장님 2026-10-25) */
  function paintBtn(){ var _il=L5({ko:"통역",en:"Interpreter",ja:"通訳",zhs:"翻译",zht:"翻譯",es:"Intérprete"}); b.innerHTML=MPIMG("mi_interpreter",MIS)+esc(_il); b.setAttribute("aria-label",_il);
    var g=document.getElementById("lgP"), y=g?g.getBoundingClientRect().bottom+8:Math.round(innerHeight*0.58)+52; b.style.top=Math.min(y,innerHeight-60)+"px"; }
  paintBtn(); setInterval(paintBtn,600);   /* 🌐 단추를 끌어 옮기면 따라간다 · 언어가 바뀌면 글자도 */
  /* 지금 장소 = _ntK 의 명소 자료, 없으면 일정에서 고른 곳(_itPick — 카카오 등 명소 목록 밖, trip.js 가 넣음 10-20) */
  /* 카드가 없어도 지도에 검색 핀(이름표)이 떠 있으면 그 곳 — 「기사님, 채효당으로 가 주세요」 (사장님 10-23) */
  function curP(){ try{ var k=window._ntK, p=k&&window.PLACES&&window.PLACES[k]; if(p&&p.ko) return p; var q=window._itPick; if(q&&q.k===k&&q.ko) return q;
    var pn=window.PLACES&&window.PLACES.__pin; return pn&&pn.ko?pn:null; }catch(e){ return null; } }
  function placeKo(){ var p=curP(); return p&&p.ko?String(p.ko):""; }
  /* 아래 작은 줄(손님 말)에는 장소 이름도 손님 말로 — 장소 자료의 ja·zhs·zht·en 이름 (사장님 10-19 「한글 아래는 다 외국어」) */
  function placeLoc(){ var p=curP(); if(!p) return ""; if(window.LANG!=="ko"&&window.PLACES&&p===window.PLACES.__pin){ var e=document.getElementById("spin"), t=e&&String(e.innerText||"").trim(); if(t) return t; }   /* 핀은 지도 이름표 글자 그대로 */
    return String(p[window.LANG]||p.en||p.ko||""); }
  function phrases(){ var pk=placeKo(), pf=placeLoc()||pk, out=[];
    if(pk){ out.push([pk+"에 어떻게 가요?",{ko:pk+"에 어떻게 가요?",en:"How do I get to "+pf+"?",ja:pf+"へはどう行けばいいですか？",zhs:"请问"+pf+"怎么走？",zht:"請問"+pf+"怎麼走？",es:"¿Cómo llego a "+pf+"?"}]);
      /* 택시 — 「기사님, ○○(으)로 가 주세요」 (사장님 10-19) · 받침 있으면(ㄹ 빼고) 「으로」 */
      var lc=pk.charCodeAt(pk.length-1)-0xAC00, ro=(lc>=0&&lc<11172&&lc%28&&lc%28!==8)?"으로":"로";
      out.push(["기사님, "+pk+ro+" 가 주세요.",{ko:"기사님, "+pk+ro+" 가 주세요.",en:"Driver, please take me to "+pf+".",ja:"運転手さん、"+pf+"までお願いします。",zhs:"司机您好，请送我到"+pf+"。",zht:"司機您好，請載我到"+pf+"。",es:"Conductor, lléveme a "+pf+", por favor."}]); }
    out.push(["화장실이 어디예요?",{ko:"화장실이 어디예요?",en:"Where is the restroom?",ja:"トイレはどこですか？",zhs:"洗手间在哪里？",zht:"洗手間在哪裡？",es:"¿Dónde está el baño?"}]);
    out.push(["이거 얼마예요?",{ko:"이거 얼마예요?",en:"How much is this?",ja:"これはいくらですか？",zhs:"这个多少钱？",zht:"這個多少錢？",es:"¿Cuánto cuesta esto?"}]);
    out.push(["카드로 계산할 수 있어요?",{ko:"카드로 계산할 수 있어요?",en:"Can I pay by card?",ja:"カードで払えますか？",zhs:"可以刷卡吗？",zht:"可以刷卡嗎？",es:"¿Puedo pagar con tarjeta?"}]);
    /* 메뉴판은 손님 말로 — 일본어면 일본어 메뉴판, 중국어면 중국어 메뉴판 (사장님 10-19) */
    var mk={ja:"일본어",zhs:"중국어",zht:"중국어"}[window.LANG]||"영어";
    out.push([mk+" 메뉴판 있어요?",{ko:mk+" 메뉴판 있어요?",en:"Do you have an English menu?",ja:"日本語のメニューはありますか？",zhs:"有中文菜单吗？",zht:"有中文菜單嗎？",es:"¿Tienen menú en inglés?"}]);
    out.push(["도와주세요.",{ko:"도와주세요.",en:"Please help me.",ja:"助けてください。",zhs:"请帮帮我。",zht:"請幫幫我。",es:"Ayúdeme, por favor."}]);
    return out; }
  /* 고른 문장(손님 말)을 구글 번역 입력 칸에 넣어 연다 (사장님 10-19 「일본어 칸에 고른 글이 안 보인다」)
     안드로이드 앱: 「보내기(SEND)」로 글을 넘김 · 글이 없으면 앱 첫 화면(MAIN·LAUNCHER — 이것 없으면 스토어로 감) · 그 밖: 웹 ?text= */
  function gtUrl(text){ var sl=GL[window.LANG]||"en"; if(sl==="ko") sl="auto";
    var web="https://translate.google.com/?sl="+sl+"&tl=ko&op=translate"+(text?"&text="+encodeURIComponent(text):"");
    if(/Android/i.test(navigator.userAgent)){ var fb=";S.browser_fallback_url="+encodeURIComponent(web)+";end";
      return text?"intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT="+encodeURIComponent(text)+";package=com.google.android.apps.translate"+fb
        :"intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.android.apps.translate"+fb; }
    return web; }
  var LAST="";
  function open(){
    var o=document.getElementById("itB"); if(o) o.remove();
    o=document.createElement("div"); o.id="itB"; o.onclick=function(e){ if(e.target===o) o.remove(); };
    var h='<div class="in"><div class="hd">'+MPIMG("mi_interpreter",MIS)+esc(L5({ko:"한국 사람에게 보여 주세요",en:"Show this to a Korean",ja:"韓国の人に見せてください",zhs:"给韩国人看",zht:"給韓國人看",es:"Muéstraselo a un coreano"}))+'<button type="button" aria-label="close">✕</button></div>';
    phrases().forEach(function(p,i){ h+='<div class="ph" data-i="'+i+'"><div class="k">'+esc(p[0])+'</div>'+(window.LANG==="ko"?'':'<div class="m">'+esc(L5(p[1]))+'</div>')+'</div>'; });
    h+='<a class="gt" href="'+esc(gtUrl(""))+'" target="_blank" rel="noopener">'+esc(L5({ko:"구글 번역으로 대화하기",en:"Talk with Google Translate",ja:"Google翻訳で会話する",zhs:"用Google翻译对话",zht:"用Google翻譯對話",es:"Hablar con Google Traductor"}))+'</a>'
      +'<div class="nt">'+esc(L5({ko:"구글 번역 앱(없으면 웹)이 열립니다. 다 쓰면 뒤로가기(아이폰은 왼쪽 위 ◀)로 돌아오세요 — 보던 화면은 그대로입니다.",
        en:"Opens the Google Translate app (or website). When done, go back (iPhone: ◀ at top left) — this screen stays as it was.",
        ja:"Google翻訳アプリ（なければWeb）が開きます。終わったら戻る（iPhoneは左上の◀）でこの画面に戻れます。",
        zhs:"会打开Google翻译应用（没有则打开网页）。用完按返回键（iPhone点左上角◀）回来，这个画面保持不变。",
        zht:"會開啟Google翻譯應用程式（沒有則開啟網頁）。用完按返回鍵（iPhone點左上角◀）回來，這個畫面保持不變。",es:"Se abre la app de Google Traductor (o la web). Al terminar, vuelve atrás (iPhone: ◀ arriba a la izquierda) — esta pantalla seguirá igual."}))+'</div></div>';
    o.innerHTML=h; document.body.appendChild(o);
    o.querySelector(".hd button").onclick=function(){ o.remove(); };
    var P=phrases();
    [].forEach.call(o.querySelectorAll(".ph"),function(el){ el.onclick=function(){ var p=P[+el.getAttribute("data-i")];   /* 누르면 큰 글씨로 — 폰을 그대로 보여 준다 */
      LAST=window.LANG==="ko"?p[0]:L5(p[1]); var gt0=o.querySelector(".in .gt"); if(gt0) gt0.setAttribute("href",gtUrl(LAST));   /* 판의 구글 단추도 고른 문장으로 */
      var bg=document.createElement("div"); bg.className="big";
      bg.innerHTML='<div class="k">'+esc(p[0])+'</div>'+(window.LANG==="ko"?'':'<div class="m">'+esc(L5(p[1]))+'</div>')+'<a class="gt" style="margin:22px 0 0;padding:12px 22px" href="'+esc(gtUrl(LAST))+'" target="_blank" rel="noopener">'+MPIMG("mi_speaker",MIS)+esc(L5({ko:"구글 번역으로 열기",en:"Open in Google Translate",ja:"Google翻訳で開く",zhs:"在Google翻译中打开",zht:"在Google翻譯中開啟",es:"Abrir en Google Traductor"}))+'</a>'
        +'<button class="x" type="button">✕ '+esc(L5({ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}))+'</button>';
      bg.querySelector(".x").onclick=function(e){ e.stopPropagation(); bg.remove(); }; o.appendChild(bg); }; });
  }
  b.onclick=open; if(hb){ hb.onclick=function(e){ e.preventDefault(); e.stopPropagation(); var q=document.getElementById("q"), t=q?String(q.value||"").trim():""; if(t) qSay(t); else open(); }; setInterval(function(){ var t=L5({ko:"통역",en:"Interpreter",ja:"通訳",zhs:"翻译",zht:"翻譯",es:"Intérprete"}); if(hb.title!==t){ hb.title=t; hb.setAttribute("aria-label",t); } },600); }
  /* 판이 열려 있으면 지금 장소로 다시 그린다 — 일정에서 장소를 고를 때 trip.js 가 부른다 (10-20) */
  /* 검색창 문장 → 말풍선 (사장님 2026-10-25): 손님 언어 → 한국어(한국어 화면이면 영어)로 크게 + 그 언어 음성. 허브 /ntr */
  function speak(t,to){ try{ var ss=window.speechSynthesis; if(!ss) return; ss.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=to==="ko"?"ko-KR":"en-US"; u.rate=0.95;
    var vs=ss.getVoices()||[], v=vs.filter(function(x){ return String(x.lang||"").toLowerCase().indexOf(to==="ko"?"ko":"en")===0; })[0]; if(v) u.voice=v; ss.speak(u); }catch(e){} }
  function qSay(t){ var to=window.LANG==="ko"?"en":"ko", o=document.getElementById("itB"); if(o) o.remove();
    try{ var u0=new SpeechSynthesisUtterance(" "); u0.volume=0; speechSynthesis.speak(u0); }catch(e){}   /* 누른 순간 음성 잠금 풀기 (아이폰은 손으로 누른 때만 소리) */
    o=document.createElement("div"); o.id="itB"; o.onclick=function(e){ if(e.target===o) o.remove(); }; document.body.appendChild(o);
    var bg=document.createElement("div"); bg.className="big"; o.appendChild(bg);
    var X='<button class="x" type="button">✕ '+esc(L5({ko:"닫기",en:"Close",ja:"閉じる",zhs:"关闭",zht:"關閉",es:"Cerrar"}))+'</button>';
    bg.innerHTML='<div class="m">'+esc(t)+'</div><div class="k" style="margin-top:14px;font-size:28px;color:#6b7280">'+esc(L5({ko:"번역하는 중…",en:"Translating…",ja:"翻訳中…",zhs:"正在翻译…",zht:"正在翻譯…",es:"Traduciendo…"}))+'</div>'+X;
    var wx=function(){ var x=bg.querySelector(".x"); if(x) x.onclick=function(e){ e.stopPropagation(); try{ speechSynthesis.cancel(); }catch(er){} o.remove(); }; }; wx();
    try{ ntap("_interp","q_say"); }catch(e){}
    fetch(HUB+"/ntr",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({t:t,to:to})}).then(function(r){ return r.json(); }).then(function(j){
      if(!o.isConnected) return; if(!j||!j.ok||!j.v) throw new Error("tr");
      bg.innerHTML='<div class="k">'+esc(j.v)+'</div><div class="m">'+esc(t)+'</div>'
        +'<button type="button" class="gt sp" style="margin:22px 0 0;padding:12px 22px;border:0;cursor:pointer">'+MPIMG("mi_speaker",MIS)+esc(L5({ko:"다시 듣기",en:"Play again",ja:"もう一度聞く",zhs:"再听一遍",zht:"再聽一遍",es:"Escuchar otra vez"}))+'</button>'
        +'<a class="gt" style="margin:10px 0 0;padding:10px 18px;background:#fff;color:#1a73e8;border:1px solid #1a73e8;font-size:14px" href="'+esc(gtUrl(t))+'" target="_blank" rel="noopener">'+esc(L5({ko:"구글 번역으로 열기",en:"Open in Google Translate",ja:"Google翻訳で開く",zhs:"在Google翻译中打开",zht:"在Google翻譯中開啟",es:"Abrir en Google Traductor"}))+'</a>'+X;
      bg.querySelector(".sp").onclick=function(e){ e.stopPropagation(); speak(j.v,to); }; wx(); speak(j.v,to);
    }).catch(function(){ if(!o.isConnected) return; bg.innerHTML='<div class="m">'+esc(t)+'</div><div class="m" style="color:#d0021b">'+esc(L5({ko:"번역하지 못했어요. 구글 번역으로 열어 보세요.",en:"Could not translate. Try Google Translate.",ja:"翻訳できませんでした。Google翻訳をお試しください。",zhs:"无法翻译，请试试Google翻译。",zht:"無法翻譯，請試試Google翻譯。",es:"No se pudo traducir. Prueba Google Traductor."}))+'</div>'
      +'<a class="gt" style="margin:16px 0 0;padding:12px 22px" href="'+esc(gtUrl(t))+'" target="_blank" rel="noopener">Google Translate</a>'+X; wx(); }); }
  window.ITP={say:qSay,open:open,refresh:function(){ if(document.getElementById("itB")) open(); }};
})();
