// 서울 약도 — 북한산 인수봉 옆 빈자리에 오목한 대형 광고판(산타 영상) (사장님 10-20)
//   #mz(약도 판) 안에 약도 비율(%)로 얹는다 → 약도와 같이 움직이고 같이 커진다.
//   서울 약도(seoulall)가 보일 때만 재생, 다른 약도·자세한 지도·앱 숨김이면 멈춤. 누르기는 지도로 그대로 간다(pointer-events 없음).
(function(){
  var MAPID="seoulall", INSU=[37.661,126.993], BW=0.25;   // BW = 광고판 폭(약도 폭 비율)
  var el=null, vid=null, posKey="";
  function curve(k){ var t, i, n=20, p=[];   // 오목 화면: 위·아래 끝이 가운데보다 크게 보인다
    for(i=0;i<=n;i++){ t=i/n; p.push((t*100).toFixed(2)+"% "+(k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); }
    for(i=n;i>=0;i--){ t=i/n; p.push((t*100).toFixed(2)+"% "+(100-k*(1-Math.pow(2*t-1,2))).toFixed(2)+"%"); }
    return "polygon("+p.join(",")+")"; }
  function make(){ var z=document.getElementById("mz"); if(!z) return null;
    if(el&&el.parentNode===z) return el;
    if(!el){
      var st=document.createElement("style");
      st.textContent="#xbb{position:absolute;z-index:3;pointer-events:none;aspect-ratio:16/12.6;filter:drop-shadow(0 .35vw .5vw rgba(0,0,0,.45));display:none}"
        +"#xbb *{pointer-events:none}"
        +"#xbb .xf{position:absolute;left:0;top:0;width:100%;height:73%;clip-path:"+curve(9)+";background:linear-gradient(90deg,#3a3f48 0%,#15181d 18%,#0b0d10 50%,#15181d 82%,#3a3f48 100%)}"
        +"#xbb .xs{position:absolute;left:3.2%;top:5.5%;width:93.6%;height:89%;clip-path:"+curve(8)+";background:#000;overflow:hidden}"
        +"#xbb video{width:100%;height:100%;object-fit:cover;display:block}"
        +"#xbb .xg{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 22%,rgba(0,0,0,.18) 50%,rgba(255,255,255,0) 78%,rgba(255,255,255,.16) 100%)}"
        +"#xbb .xp{position:absolute;top:66%;width:5.5%;height:34%;background:linear-gradient(90deg,#2a2e35,#5a606b 45%,#1c1f24);border-radius:2px 2px 0 0}"
        +"#xbb .xb{position:absolute;top:97%;width:13%;height:3%;background:#2a2e35;border-radius:3px}";
      document.head.appendChild(st);
      el=document.createElement("div"); el.id="xbb"; el.setAttribute("aria-hidden","true");
      el.innerHTML='<i class="xp" style="left:24%"></i><i class="xp" style="left:70.5%"></i><i class="xb" style="left:20.2%"></i><i class="xb" style="left:66.7%"></i>'
        +'<div class="xf"><div class="xs"></div></div>';
      vid=document.createElement("video");
      vid.muted=true; vid.defaultMuted=true; vid.loop=true; vid.autoplay=true; vid.playsInline=true; vid.preload="auto";
      ["muted","autoplay","loop","playsinline","webkit-playsinline","disablepictureinpicture"].forEach(function(a){ vid.setAttribute(a,""); });
      vid.setAttribute("preload","auto"); vid.poster="img/xmas/poster.jpg?v=1020bb"; vid.src="img/xmas/santa.mp4?v=1020bb";
      var xs=el.querySelector(".xs"); xs.appendChild(vid); var g=document.createElement("div"); g.className="xg"; xs.appendChild(g);
    }
    z.appendChild(el); return el; }
  // 인수봉 자리 — 약도 자료의 그림 네모(spots.insubong)가 있으면 그것, 없으면 위경도 → 약도 비율(meGeoFrac, 앱과 같은 셈)
  function insu(){ try{ var c=CITY[MAPID], b=c&&c.spots&&c.spots.insubong; if(b) return [b[0],b[1],b[2],b[3]]; }catch(e){}
    try{ var f=meGeoFrac(MAPID,INSU[0],INSU[1]); if(f) return [f[0]-0.05,f[1]-0.035,f[0]+0.05,f[1]+0.035]; }catch(e){} return [0.4604,0.1514,0.563,0.2261]; }
  function place(){ var b=insu(), k=b.join(","); if(k===posKey) return; posKey=k;
    var right=b[0]-0.012, cy=(b[1]+b[3])/2, h=BW*12.6/16;   // 인수봉 왼쪽 빈자리(길만 있는 곳), 화면 가운데를 인수봉 높이에
    var left=Math.max(0.01,right-BW), top=Math.max(0.01,cy-h*0.42);
    el.style.left=(left*100)+"%"; el.style.top=(top*100)+"%"; el.style.width=(BW*100)+"%"; }
  function on(){ try{ return typeof VIEW==="string"&&VIEW===MAPID&&!DET&&!document.hidden; }catch(e){ return false; } }
  function tick(){ var o=on();
    if(o){ if(!make()) return; place(); if(el.style.display!=="block") el.style.display="block";
      if(vid.paused){ var p=vid.play(); if(p&&p.catch) p.catch(function(){}); } }
    else if(el){ if(el.style.display!=="none") el.style.display="none"; if(!vid.paused) try{ vid.pause(); }catch(e){} } }
  setInterval(tick,400); document.addEventListener("visibilitychange",tick);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",tick); else tick();
})();
