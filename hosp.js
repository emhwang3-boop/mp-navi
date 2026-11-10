/* 건강검진 패키지 「병원 고르기」 (사장님 2026-11-10 「국제진료센터가 있는 병원과 전화번호를 선택하게 하자」 — 규칙서 「건강검진 패키지」 줄)
 *  · 목록 = data/hosp.json (한국어 가나다순 그대로 · 공식 홈페이지 확인분만). 병원을 더하면 허브 worker.js HOSP_IDS 에도 id 를 더한다
 *  · 손님이 병원에 직접 예약·결제 — 앱은 고른 병원을 주문에 싣고(허브가 목록과 대조) 바우처에 이름·장소·전화·예약 페이지를 보여 줄 뿐
 *  · shop.js(앱 결제 칸)·home/pc_pkg.js(홈페이지 결제 칸)·near.js(내 예약 바우처)가 window.HSP 로 부른다(없으면 지금 그대로) · 고르면 document 에 「hspchg」 */
(function(){
"use strict";
function T6(ko,en,ja,zhs,zht,es){ return {ko:ko,en:en,ja:ja,zhs:zhs,zht:zht,es:es}; }
function lg(){ return window.LANG||"en"; }
function L(o){ return o?(o[lg()]||o.en||o.ko||""):""; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
var TX={
 h:T6("병원 고르기 (필수)","Choose a hospital (required)","病院を選ぶ（必須）","选择医院（必选）","選擇醫院（必選）","Elige un hospital (obligatorio)"),
 d:T6("검진 예약은 고른 병원에 직접 전화나 예약 페이지로 해 주세요. 건강검진비는 병원에 직접 냅니다.","Book your check-up directly with the hospital you choose, by phone or on its booking page. You pay the check-up fee to the hospital directly.","健診のご予約は、選んだ病院に電話か予約ページで直接お申し込みください。健康診断の費用は病院に直接お支払いください。","请通过电话或预约页面直接向所选医院预约体检。体检费用请直接支付给医院。","請透過電話或預約頁面直接向所選醫院預約體檢。體檢費用請直接支付給醫院。","Reserva el chequeo directamente con el hospital que elijas, por teléfono o en su página de reservas. El chequeo lo pagas directamente al hospital."),
 need:T6("병원을 골라야 예약·결제할 수 있어요.","Choose a hospital to book and pay.","病院を選ぶと予約・決済できます。","请先选择医院，才能预约·付款。","請先選擇醫院，才能預約·付款。","Elige un hospital para reservar y pagar."),
 vt:T6("검진 병원","Check-up hospital","健診の病院","体检医院","體檢醫院","Hospital del chequeo"),
 lk:T6("예약 안내 페이지","Booking info page","予約案内ページ","预约说明页面","預約說明頁面","Página de reservas"),
 wd:T6("평일","Mon–Fri","平日","工作日","平日","lun–vie"),
 sat:T6("토","Sat","土","周六","週六","sáb"),
 off:T6("토·일·공휴일 휴무","closed weekends & holidays","土日祝は休み","周末及节假日休息","週末及國定假日休息","cerrado fines de semana y festivos")
};
var D=null, PIDS=["hchk"], SEL={};
function load(){ return fetch("data/hosp.json?v="+(window.NAVI_V||"1110"),{cache:"no-store"}).then(function(r){ return r.json(); }).then(function(j){ if(j&&Array.isArray(j.items)){ D=j.items; if(Array.isArray(j.pids)) PIDS=j.pids; try{ document.dispatchEvent(new Event("hspchg")); }catch(e){} } }).catch(function(){}); }
function need(p){ return !!(p&&PIDS.indexOf(p.id)>=0); }
function byId(id){ return (D||[]).filter(function(x){ return x.id===id; })[0]||null; }
function sel(pid){ return SEL[pid]&&byId(SEL[pid])?SEL[pid]:""; }
function set(pid,id){ if(pid) SEL[pid]=id||""; }
function ok(p){ return !need(p)||!!sel(p.id); }
function body(p){ return need(p)?(sel(p.id)||undefined):undefined; }
function nmHtml(h){ var a=L(h.n), e=h.n.en||""; return '<b>'+esc(a)+'</b>'+(/^(ja|zhs|zht)$/.test(lg())&&e&&e!==a?' <small>'+esc(e)+'</small>':''); }
function hrTx(r){ if(!r) return ""; return L(TX.wd)+" "+r.wd+(r.sat?" · "+L(TX.sat)+" "+r.sat:"")+(r.off?" · "+L(TX.off):""); }
function telA(t){ var n=String(t.n||""); return '<a href="tel:'+esc(n.replace(/[^\d+]/g,""))+'">'+esc(n)+'</a>'+(t.l?' <small>('+esc(L(t.l))+')</small>':''); }
function linesHtml(h){ return (h.ln||[]).map(function(x){ var p=x.p||{};
  return '<div class="hspl"><div class="hspt">'+esc(L(x.t))+'</div><div>📍 '+esc(lg()==="ko"?(p.ko||p.en):(p.en||p.ko))+'</div>'
   +((x.tel&&x.tel.length)?'<div>📞 '+x.tel.map(telA).join(" · ")+'</div>':'')+(x.em?'<div>✉ <a href="mailto:'+esc(x.em)+'">'+esc(x.em)+'</a></div>':'')+(x.hr?'<div>🕘 '+esc(hrTx(x.hr))+'</div>':'')+'</div>'; }).join("")
  +(h.url?'<a class="hspu" href="'+esc(h.url)+'" target="_blank" rel="noopener">'+esc(L(TX.lk))+' ↗</a>':''); }
// 결제 칸 — 상품 상세(앱 sideHtml)·홈페이지(pc_pkg boxHtml)
function pickHtml(p){ if(!need(p)) return ""; if(!D){ load(); return '<div class="hsp"><div class="hsph">'+esc(L(TX.h))+'</div><p class="hspd">…</p></div>'; }
  var s=sel(p.id);
  return '<div class="hsp" role="radiogroup"><div class="hsph">'+esc(L(TX.h))+'</div><p class="hspd">'+esc(L(TX.d))+'</p>'
   +D.map(function(h){ var on=h.id===s; return '<div class="hspc'+(on?' on':'')+'" role="radio" tabindex="0" aria-checked="'+on+'" data-hsp="'+esc(h.id)+'" data-hspp="'+esc(p.id)+'"><div class="hspn"><i></i><span>'+nmHtml(h)+'</span></div>'+linesHtml(h)+'</div>'; }).join("")
   +(s?'':'<p class="hspw">'+esc(L(TX.need))+'</p>')+'</div>'; }
// 결제창 주문 내용 한 줄
function payRow(p){ var h=need(p)&&byId(sel(p.id)); return h?'<div class="sl"><span>'+esc(L(TX.vt))+'</span><span>'+esc(L(h.n))+'</span></div>':''; }
// 바우처 (내 예약) — x.hosp = 주문에 저장된 병원 id
function vchHtml(x){ var h=x&&x.hosp&&byId(x.hosp); if(x&&x.hosp&&!D){ load(); return ""; } if(!h) return "";
  return '<div class="hspv"><div class="hsph">🏥 '+esc(L(TX.vt))+'</div><div class="hspn">'+nmHtml(h)+'</div>'+linesHtml(h)+'<p class="hspd" style="margin:6px 0 0">'+esc(L(TX.d))+'</p></div>'; }
function pick(el){ var pid=el.getAttribute("data-hspp"), id=el.getAttribute("data-hsp"); if(!pid||!id) return; set(pid,id); try{ document.dispatchEvent(new Event("hspchg")); }catch(e){} }
document.addEventListener("click",function(e){ var t=e.target; if(!t||!t.closest||t.closest("a")) return; var c=t.closest("[data-hsp]"); if(c) pick(c); });   // 전화·메일·예약 페이지 링크는 그대로
document.addEventListener("keydown",function(e){ if(e.key!=="Enter"&&e.key!==" ") return; var c=e.target&&e.target.closest&&e.target.closest("[data-hsp]"); if(c&&e.target===c){ e.preventDefault(); pick(c); } });
var st=document.createElement("style");
st.textContent=".hsp{margin:12px 0;text-align:left}.hsph{font-weight:900;font-size:15px;margin:0 0 4px}.hspd{font-size:12.5px;color:#5b6474;line-height:1.55;margin:0 0 8px}"
 +".hspc{position:relative;border:1.5px solid #e4e0d6;border-radius:12px;padding:9px 10px;margin:0 0 7px;background:#fff;cursor:pointer;font-size:12.5px;line-height:1.55;color:#1d2433}"
 +".hspc.on{border-color:#2f9e44;background:#f0f9f2;box-shadow:0 0 0 1px #2f9e44 inset}.hspc:focus-visible{outline:2px solid #2f9e44;outline-offset:2px}"
 +".hspn{display:flex;gap:8px;align-items:flex-start;font-size:14px;margin:0 0 3px}.hspn b{font-weight:900}.hspn small{color:#6b7280;font-size:12px;font-weight:600}"
 +".hspc .hspn i{flex:0 0 auto;width:16px;height:16px;border-radius:50%;border:2px solid #b7b2a6;box-sizing:border-box;margin-top:2px;background:#fff}.hspc.on .hspn i{border:5px solid #2f9e44}"
 +".hspl{margin:4px 0 0;padding:4px 0 0;border-top:1px dashed #e4e0d6}.hspt{font-weight:800;color:#374151}.hspl a{color:#1f5fa8;font-weight:800;text-decoration:none}.hspl small{color:#6b7280}"
 +".hspu{display:inline-block;margin-top:6px;color:#1f5fa8;font-weight:800;text-decoration:none;font-size:13px}"
 +".hspw{margin:2px 0 0;font-size:13px;font-weight:800;color:#c2410c}"
 +".hspv{margin:10px 0;padding:10px 12px;border:1.5px solid #2f9e44;border-radius:12px;background:#f7fcf8;font-size:12.5px;line-height:1.55;text-align:left;color:#1d2433}"
 +"#pcPk .pg-pay:disabled{opacity:.45;cursor:not-allowed}";
(document.head||document.documentElement).appendChild(st);
load();
window.HSP={load:load,need:need,ok:ok,sel:sel,set:set,body:body,pickHtml:pickHtml,payRow:payRow,vchHtml:vchHtml,tx:function(k){ return TX[k]?L(TX[k]):""; }};
})();
