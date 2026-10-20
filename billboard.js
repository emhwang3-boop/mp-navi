// 대형 광고판 — 오목한 전광판을 약도 위에 얹는다
//   ① 서울 약도 — 북한산 인수봉 옆 빈자리, 산타 영상 (사장님 10-20)
//   ② 전국 지도 — 서해 인천공항 밑 바다, 「Welcome to Korea」 입체 글자 (사장님 10-21) · 전국 지도 그림은 그대로, 위에 얹기만
//   #mz(약도 판) 안에 약도 비율(%)로 얹는다 → 약도와 같이 움직이고 같이 커진다.
//   그 약도가 보일 때만 보이고(영상은 재생), 다른 약도·자세한 지도·앱 숨김이면 멈춤. 누르기는 지도로 그대로 간다(pointer-events 없음).
(function(){
  function curve(k){ var t, i, n=20, p=[];   // 오목 화면: 위·아래 끝이 가운데보다 크게 보인다
    for(i=0;i<=n;i++){ t=i/n; p.push((t*100).toFixed(2)+"% "+(k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); }
    for(i=n;i>=0;i--){ t=i/n; p.push((t*100).toFixed(2)+"% "+(100-k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); }
    return "polygon("+p.join(",")+")"; }
  var st=document.createElement("style");
  st.textContent=".xbb{position:absolute;z-index:3;pointer-events:none;aspect-ratio:16/12.6;filter:drop-shadow(0 .35vw .5vw rgba(0,0,0,.45));display:none}"
    +".xbb *{pointer-events:none}"
    +".xbb .xf{position:absolute;left:0;top:0;width:100%;height:73%;clip-path:"+curve(9)+";background:linear-gradient(90deg,#3a3f48 0%,#15181d 18%,#0b0d10 50%,#15181d 82%,#3a3f48 100%)}"
    +".xbb .xs{position:absolute;left:3.2%;top:5.5%;width:93.6%;height:89%;clip-path:"+curve(8)+";background:#000;overflow:hidden}"
    +".xbb video{width:100%;height:100%;object-fit:cover;display:block}"
    +".xbb .xg{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 22%,rgba(0,0,0,.18) 50%,rgba(255,255,255,0) 78%,rgba(255,255,255,.16) 100%)}"
    +".xbb .xp{position:absolute;top:66%;width:5.5%;height:34%;background:linear-gradient(90deg,#2a2e35,#5a606b 45%,#1c1f24);border-radius:2px 2px 0 0}"
    +".xbb .xb{position:absolute;top:97%;width:13%;height:3%;background:#2a2e35;border-radius:3px}"
    // 입체 글자 화면 — 밤하늘 바탕 + 금빛 두꺼운 글자(아래로 겹친 그림자 = 두께) + 빛 한 줄이 지나간다
    +".xbb .xw{position:absolute;inset:0;container-type:size;background:radial-gradient(ellipse at 50% 35%,#2b5fb8 0%,#123a7a 45%,#071a3d 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;perspective:60cqw}"
    +".xbb .xw::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 18% 22%,rgba(255,255,255,.9) 0 .35cqw,transparent .5cqw),radial-gradient(circle at 76% 18%,rgba(255,255,255,.8) 0 .3cqw,transparent .45cqw),radial-gradient(circle at 88% 70%,rgba(255,255,255,.7) 0 .3cqw,transparent .45cqw),radial-gradient(circle at 9% 76%,rgba(255,255,255,.7) 0 .3cqw,transparent .45cqw),radial-gradient(circle at 60% 85%,rgba(255,255,255,.6) 0 .25cqw,transparent .4cqw)}"
    +".xbb .xt{position:relative;font-family:'Arial Black','Segoe UI',Impact,sans-serif;font-weight:900;line-height:1.02;text-align:center;white-space:nowrap;letter-spacing:.02em;transform:rotateX(14deg);animation:xwTilt 6s ease-in-out infinite;"
    +"background:linear-gradient(180deg,#fff8dc 0%,#ffd76a 45%,#f0a81e 70%,#ffe28a 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;"
    +"filter:drop-shadow(0 .03em 0 #c98010) drop-shadow(0 .03em 0 #a2620a) drop-shadow(0 .03em 0 #7a4606) drop-shadow(0 .12em .1em rgba(0,0,0,.6))}"
    +".xbb .xt1{font-size:14cqw}.xbb .xt2{font-size:23cqw;margin-top:1cqh}"
    +".xbb .xsh{position:absolute;top:-20%;bottom:-20%;width:18%;left:-30%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-18deg);animation:xwShine 4.5s ease-in-out infinite}"
    +"@keyframes xwTilt{0%,100%{transform:rotateX(14deg) rotateY(-10deg)}50%{transform:rotateX(14deg) rotateY(10deg)}}"
    +"@keyframes xwShine{0%,55%{left:-30%}100%{left:130%}}"
    +"@media (prefers-reduced-motion:reduce){.xbb .xt,.xbb .xsh{animation:none}}";
  document.head.appendChild(st);

  function board(cfg){   // cfg = {map, id, bw(폭, 약도 폭 비율), at() → [왼, 위] 약도 비율, fill(화면 칸) → 영상 또는 null}
    var el=null, vid=null, posKey="";
    function make(){ var z=document.getElementById("mz"); if(!z) return null;
      if(el&&el.parentNode===z) return el;
      if(!el){
        el=document.createElement("div"); el.id=cfg.id; el.className="xbb"; el.setAttribute("aria-hidden","true");
        el.innerHTML='<i class="xp" style="left:24%"></i><i class="xp" style="left:70.5%"></i><i class="xb" style="left:20.2%"></i><i class="xb" style="left:66.7%"></i>'
          +'<div class="xf"><div class="xs"></div></div>';
        var xs=el.querySelector(".xs"); vid=cfg.fill(xs); var g=document.createElement("div"); g.className="xg"; xs.appendChild(g);
      }
      z.appendChild(el); return el; }
    function place(){ var a=cfg.at(), k=a.join(","); if(k===posKey) return; posKey=k;
      el.style.left=(a[0]*100)+"%"; el.style.top=(a[1]*100)+"%"; el.style.width=(cfg.bw*100)+"%"; }
    function on(){ try{ return typeof VIEW==="string"&&VIEW===cfg.map&&!DET&&!document.hidden; }catch(e){ return false; } }
    return function(){ var o=on();
      if(o){ if(!make()) return; place(); if(el.style.display!=="block") el.style.display="block";
        if(vid&&vid.paused){ var p=vid.play(); if(p&&p.catch) p.catch(function(){}); } }
      else if(el){ if(el.style.display!=="none") el.style.display="none"; if(vid&&!vid.paused) try{ vid.pause(); }catch(e){} } };
  }

  // ① 서울 — 인수봉 자리: 약도 자료의 그림 네모(spots.insubong)가 있으면 그것, 없으면 위경도 → 약도 비율(meGeoFrac, 앱과 같은 셈)
  var SW=0.25, INSU=[37.661,126.993];
  var seoul=board({ map:"seoulall", id:"xbb", bw:SW,
    at:function(){ var b=null; try{ var c=CITY.seoulall; b=c&&c.spots&&c.spots.insubong; }catch(e){}
      if(!b) try{ var f=meGeoFrac("seoulall",INSU[0],INSU[1]); if(f) b=[f[0]-0.05,f[1]-0.035,f[0]+0.05,f[1]+0.035]; }catch(e){}
      if(!b) b=[0.4604,0.1514,0.563,0.2261];
      var right=b[0]-0.012, cy=(b[1]+b[3])/2, h=SW*12.6/16;   // 인수봉 왼쪽 빈자리(길만 있는 곳), 화면 가운데를 인수봉 높이에
      return [Math.max(0.01,right-SW), Math.max(0.01,cy-h*0.42)]; },
    fill:function(xs){ var v=document.createElement("video");
      v.muted=true; v.defaultMuted=true; v.loop=true; v.autoplay=true; v.playsInline=true; v.preload="auto";
      ["muted","autoplay","loop","playsinline","webkit-playsinline","disablepictureinpicture"].forEach(function(a){ v.setAttribute(a,""); });
      v.setAttribute("preload","auto"); v.poster="img/xmas/poster.jpg?v=1021bb"; v.src="img/xmas/santa.mp4?v=1021bb"; xs.appendChild(v); return v; } });

  // ② 전국 — 인천공항(37.4602,126.4407) 그림 바로 밑 서해 바다, 지도 왼쪽 끝에 붙여서 (공항 그림을 가리지 않게)
  var KW=0.18, ICN=[37.4602,126.4407];
  var kr=board({ map:"kr", id:"xbbkr", bw:KW,
    at:function(){ var f=null; try{ f=meGeoFrac("kr",ICN[0],ICN[1]); }catch(e){} if(!f) f=[0.12,0.27];
      return [0.042, f[1]+0.177]; },
    fill:function(xs){ var w=document.createElement("div"); w.className="xw"; w.innerHTML='<div class="xt xt1">Welcome to</div><div class="xt xt2">KOREA</div><i class="xsh"></i>'; xs.appendChild(w); return null; } });

  function tick(){ seoul(); kr(); }
  setInterval(tick,400); document.addEventListener("visibilitychange",tick);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",tick); else tick();
})();
