// 일일브리핑 LIVE — WebSocket 허브 + 국내종목 요청 릴레이 (Cloudflare Durable Object)
// 대시보드: 집 PC가 /push → 폰들에 /ws broadcast, /data HTTP 폴백.
// 국내종목: 폰이 /kr/stock?code=.. 요청 → 허브가 큐에 담음 → 집 PC가 /kr/pending 폴링해 키움 조회 →
//           /kr/result 로 답 → 폰이 다시 /kr/stock 호출하면 캐시된 답을 받음.

export default {
  async fetch(request, env, ctx) {
    // 종목 관련 뉴스 — 네이버 API HUB 뉴스 검색 (사장님 2026-09-25). 허브(DO)와 따로 돈다
    if (new URL(request.url).pathname === "/news") return news(request, env, ctx);
    if (new URL(request.url).pathname === "/newstr") return newsTr(request, env, ctx);   // 뉴스 데모 영어 번역 (2026-10-13)
    if (new URL(request.url).pathname === "/newsart") return newsArt(request, env);
    if (new URL(request.url).pathname === "/newsq") return newsQ(request, env, ctx);
    if (new URL(request.url).pathname === "/stkq") return stkQ(request, env, ctx);   // 주식·HTS·미니 종목 검색 일·중 → 한국 종목명/미국 티커 (2026-10-19)
    if (new URL(request.url).pathname === "/renm") return reNames(request, env, ctx);
    if (new URL(request.url).pathname === "/xldict") return xlDict(request);   // 주식·HTS·미니 일·중 사전 (10-19)
    if (new URL(request.url).pathname === "/xl") return xlTr(request, env, ctx);   // 사전에 없는 화면 글 → AI 번역 저장 (10-19)
    if (new URL(request.url).pathname === "/regeo") return reGeo(request, env, ctx);   // 실거래 번지 → 좌표 (2026-10-19)   // 부동산 단지 이름 일·중 (2026-10-19)   // 뉴스 검색어(일·중·영) → 한국어 (2026-10-19)   // 뉴스 데모 기사 전문 즉석 번역 — 저장 안 함 (2026-10-13)
    if (new URL(request.url).pathname === "/re") return reDeals(request, env, ctx);   // 부동산 실거래 (국토부, 2026-10-12)
    if (new URL(request.url).pathname === "/kplace") return kPlace(request, env, ctx);
    if (new URL(request.url).pathname === "/gphoto" || new URL(request.url).pathname === "/gphoto/img") return gPhoto(request, env, ctx);   // 내비 안내 카드 사진 — 구글 장소 사진 (2026-10-23)
    if (new URL(request.url).pathname === "/gplace") return gPlace(request, env, ctx);   // 내비 추천 — 구글 별점·리뷰 많은 유명한 곳 (2026-10-20)
    if (new URL(request.url).pathname === "/gnear") return gNear(request, env, ctx);   // 내비 편의시설 「음식점」 — 가까운 구글 음식점 + 별점 (2026-10-21)
    if (new URL(request.url).pathname === "/gshop") return gShop(request, env, ctx);   // 내비 선물 고르기 — 근처 가게 카카오+구글 (2026-10-21)
    if (new URL(request.url).pathname === "/ntrip") return nTrip(request, env, ctx);
    { const pp2 = new URL(request.url).pathname; if (pp2.startsWith("/npass/")) return env.HUB.get(env.HUB.idFromName("npass")).fetch(request); if (pp2.startsWith("/__npass")) return new Response("not found", { status: 404 }); }   // 내비 이용권 (2026-10-16, 스위치 PASS_ENFORCE)
    if (new URL(request.url).pathname === "/nreco") return nReco(request, env, ctx);   // 내비 조회창 AI 명소 추천 (2026-10-16)
    if (new URL(request.url).pathname === "/neat") return nEat(request, env, ctx);   // 일정 식당 추천 (2026-10-16)
    { const pp = new URL(request.url).pathname; if (pp === "/npartner" || pp === "/npartner/admin") return env.HUB.get(env.HUB.idFromName("npartner")).fetch(request); if (pp.startsWith("/__np")) return new Response("not found", { status: 404 }); }   // 제휴 가게 (2026-10-16)   // 내비 맞춤형 투어 — AI 는 설명·팁만 (2026-10-15)
    if (new URL(request.url).pathname === "/train") return trainInfo(request, env, ctx);   // 내비 — 두 역 사이 오늘 열차 (국토부 TAGO 열차정보, 2026-10-15)
    if (new URL(request.url).pathname === "/apt") return aptInfo(request, env, ctx);   // 한국부동산원 공동주택 단지 식별정보 — 세대수·동수·준공·PNU·옛 이름 (2026-10-22)
    if (new URL(request.url).pathname === "/pnu") return pnuOf(request, env, ctx);   // 지번주소 -> 필지 PNU (지도 초록 필지, 2026-10-14)
    if (new URL(request.url).pathname === "/bldg") return bldg(request, env, ctx);
    if (new URL(request.url).pathname === "/bldgsup") return bldgSup(request, env, ctx);   // 단지 평형 전용→공급 — 단지마다 한 번 묻고 30일 보관 (2026-10-15)   // 건축물대장 — 매물 입력 면적·사용승인일·층수·주차 자동 (2026-10-14)   // 카카오 장소 검색 대리 (네이버 지도로 바꾸며, 2026-10-13)
    // 중개사무소 목록 (국토부 → 네이버 서버 → 여기, 2026-10-12) — 따로 된 칸("broker")
    { const kp = new URL(request.url).pathname; if (kp === "/broker" || kp === "/broker/put") return env.HUB.get(env.HUB.idFromName("broker")).fetch(request); }
    { const ip = new URL(request.url).pathname; if (ip === "/invmint" || ip === "/invchk") return invite(request, env); }   // 7일짜리 초대 링크 (사장님 2026-10-15)
    if (new URL(request.url).pathname === "/odsay") {   // ODsay 대중교통 — 키는 서버(mp-server 고정 IP)에만, 우리 앱 주소에서만 (사장님 2026-10-17)
      const o = request.headers.get("Origin") || "", okO = mpOrigin(o);
      const H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin" }; if (okO) H["Access-Control-Allow-Origin"] = o;
      if (!okO || !env.ODP_SECRET) return new Response(JSON.stringify({ ok: false, err: "origin" }), { status: 403, headers: H });
      const sp = new URL(request.url).searchParams, q = new URLSearchParams(), num = /^-?\d{1,3}(\.\d{1,8})?$/;
      for (const k of ["SX", "SY", "EX", "EY"]) { const v = sp.get(k) || ""; if (!num.test(v)) return new Response(JSON.stringify({ ok: false, err: "bad" }), { status: 400, headers: H }); q.set(k, v); }
      q.set("lang", /^[0-4]$/.test(sp.get("lang") || "") ? sp.get("lang") : "0");   // 0국 1영 2일 3간체 4번체 (10-18)
      // 🔴 ODsay 외국어판 역·정류장 이름이 틀린다(서울 교대 → 「釜山教育大学」, 마천 → 「馬山」, 10-19 사장님 발견)
      //    → 외국어로 물으면 한국어판도 같이 받아, 역·정류장 이름만 한국어 이름을 우리 AI 가 공식 표기로 바꾼 것으로 갈아 끼운다(노선 이름은 ODsay 것 그대로)
      try {
        const L = q.get("lang"); q.set("lang", "0");   // 🔴 ODsay 는 하루 28건 — 한 번만 부른다. 외국어는 우리가 바꾼다
        const r = await fetch("https://mp-relay.tail3b9b9e.ts.net:8443/odsay?" + q.toString(), { headers: { "X-Odp": env.ODP_SECRET } });
        const tk = await r.text(); if (L === "0") return new Response(tk, { status: r.status, headers: H });
        let jk; try { jk = JSON.parse(tk); } catch (e) { return new Response(tk, { status: r.status, headers: H }); }
        try { await odStations(env, ctx, jk, { "1": "en", "2": "ja", "3": "zhs", "4": "zht" }[L]); } catch (e) { jk._odErr = String(e && e.message || e).slice(0, 200); }
        return new Response(JSON.stringify(jk), { status: r.status, headers: H });
      }
      catch (e) { return new Response(JSON.stringify({ ok: false, err: "relay" }), { status: 502, headers: H }); }
    }
    if (new URL(request.url).pathname === "/enname") return enname(request, env, ctx);
    if (new URL(request.url).pathname === "/disc") return disc(request, env, ctx);
    if (new URL(request.url).pathname === "/corp") return corp(request, env, ctx);   // 기업 정보 (2026-09-27)
    if (new URL(request.url).pathname === "/coininfo") return coininfo(request, env, ctx);   // 코인 정보 (2026-09-27)
    // 홈페이지 「고객의 소리」 (사장님 2026-10-14) — 메일로 받는다. board 칸에 저장. 앱용 /voice 와 따로
    if (new URL(request.url).pathname === "/hvoice") return env.HUB.get(env.HUB.idFromName("board")).fetch(request);
    { const np = new URL(request.url).pathname; if (np === "/ntap" || np === "/ntapstats") return env.HUB.get(env.HUB.idFromName("ntap")).fetch(request);
      if (np === "/nledger") return env.HUB.get(env.HUB.idFromName("nledger")).fetch(request);   // 내비 장부 (2026-10-15)
      if (np === "/nvoice") return env.HUB.get(env.HUB.idFromName("board")).fetch(request);
      if (np === "/nadminpw") return env.HUB.get(env.HUB.idFromName("nadminpw")).fetch(request);
      if (np === "/ninq" || np.startsWith("/ninq/")) return env.HUB.get(env.HUB.idFromName("ninq")).fetch(request);   // 입점·광고 문의 (2026-10-15)   // 관리 비밀번호 바꾸기 (2026-10-15)
      if (np.startsWith("/__nadm")) return new Response("not found", { status: 404 }); }   // 칸 안쪽 길 — 밖에서 못 들어온다   // 내비 고객의 소리 읽기 — hvoice 와 같은 칸   // 내비 그림별 누름 수 (2026-10-15)
    // 고객 게시판 (2026-10-10) — 같은 Hub 클래스의 따로 된 칸("board")에 둔다. 앱용 global 칸과 저장소·부하가 안 섞인다
    { const bp = new URL(request.url).pathname;
      if (bp === "/board" || bp.startsWith("/board/")) return env.HUB.get(env.HUB.idFromName("board")).fetch(request); }
    // 부동산 손님 → 입점 중개사무소 연결 (2026-10-13) — 따로 된 칸("realty")
    { const rp = new URL(request.url).pathname;
      if (rp.startsWith("/realty/__")) return new Response("not found", { status: 404 });   // 칸 안쪽 길(매일 지우기) — 밖에서 못 들어온다 (2026-10-22)
      if (rp === "/realty" || rp.startsWith("/realty/")) return env.HUB.get(env.HUB.idFromName("realty")).fetch(request); }
    // 홈페이지 방문 수 (2026-10-10) — 따로 된 칸("home"), 앱 통계와 안 섞인다
    if (new URL(request.url).pathname === "/hstats") return env.HUB.get(env.HUB.idFromName("home")).fetch(request);
    if (new URL(request.url).pathname === "/hc") {
      const u = new URL(request.url), cf = request.cf || {};
      if (u.searchParams.get("n") === "1") {
        u.searchParams.set("g", [cf.country || "", cf.region || "", cf.city || ""].join("|").replace(/[<>&"']/g, "").slice(0, 80));
        console.log("home-visit", JSON.stringify({ country: cf.country || "", region: cf.region || "", city: cf.city || "", org: cf.asOrganization || "", ref: request.headers.get("referer") || "" }));   // 로그에서 「home-visit」 으로 찾기 (10-22)
        // 로봇·서버는 방문으로 안 센다 (2026-10-11) — 클라우드 회사 망(ASN)이거나 이름표에 bot 류
        const ua = request.headers.get("user-agent") || "", org = String(cf.asOrganization || "");
        const CLOUD = [16509, 14618, 15169, 396982, 8075, 8068, 14061, 16276, 24940, 13335, 31898, 63949, 45102, 132203, 20473, 36351, 19551, 54113, 209242, 212238];
        if (CLOUD.indexOf(+cf.asn || 0) >= 0 || /bot|crawl|spider|slurp|preview|headless|lighthouse|python|curl|wget|httpclient|monitor/i.test(ua)
            || /amazon|google|microsoft|digitalocean|ovh|hetzner|oracle|linode|akamai|alibaba|tencent|choopa|vultr|datacamp/i.test(org))
          u.searchParams.set("b", "1");
      }
      return env.HUB.get(env.HUB.idFromName("home")).fetch(new Request(u.toString(), request));
    }
    const id = env.HUB.idFromName("global");
    return env.HUB.get(id).fetch(request);
  },
  async scheduled(ev, env, ctx) {
    if (ev.cron === "*/30 * * * *") ctx.waitUntil(newsPrewarm(env, ctx));   // 뉴스 데모 미리 번역 (2026-10-13)
    // 부동산 손님 개인정보 — 1년 지난 요청 지우기·평문 암호화 옮기기 (2026-10-22). 칸이 하루 한 번만 실제로 돈다
    if (ev.cron === "*/30 * * * *") ctx.waitUntil(env.HUB.get(env.HUB.idFromName("realty")).fetch("https://hub/realty/__cron", { method: "POST" }).catch(function () {}));
  }
};

import { CORP, EXPLAIN } from "./dart_data.js";
import { XL_DICT } from "./xl_dict.js";   // 주식·HTS·미니 일·중 사전 (10-19)
import { encyc, dartFin, corpUS } from "./corp.js";
import { coinInfo } from "./coininfo.js";
import { nTrip, nTripAip } from "./ntrip.js";
import { nReco, nRecoAip } from "./nreco.js";
import { npassDO } from "./npass.js";
import { nEat, npartner } from "./neat.js";   // 맞춤형 투어 식당 추천·제휴 가게 (2026-10-16)   // 내비 맞춤형 투어 설명·팁 (2026-10-15)
import Anthropic from "@anthropic-ai/sdk";

// ── /disc?code=005930 — 최근 3개월 공시 8건 + 공시 종류 쉬운 말 · 10분 저장 (사장님 2026-09-25) ──
//    DART 오픈API(키는 비밀 DART_KEY). 풀이는 미리 만든 표(EXPLAIN) — 여기선 AI 를 부르지 않는다.
function dnorm(n) { return String(n || "").replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").replace(/\s+/g, ""); }
async function disc(request, env, ctx) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").replace(/[^0-9]/g, "").slice(0, 6);
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json; charset=utf-8" };
  const cc = CORP[code];
  if (!cc) return new Response(JSON.stringify({ code, items: [], err: "no corp" }), { headers: cors });
  const days = Math.max(3, Math.min(90, parseInt(url.searchParams.get("days") || "90", 10) || 90));
  const n = Math.max(1, Math.min(40, parseInt(url.searchParams.get("n") || "8", 10) || 8));
  const en = url.searchParams.get("en") === "1";   // 영어 화면 = 영문 DART (사장님 2026-09-29) · 제출인은 뺀다
  const key = new Request("https://disc.cache/" + (en ? "en/" : "") + code + (days !== 90 || n !== 8 ? "/" + days + "/" + n : ""));
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: Object.assign({}, cors, { "X-Cache": "hit" }) });
  const d = new Date(Date.now() - days * 86400000 + 9 * 3600000);
  const bgn = d.toISOString().slice(0, 10).replace(/-/g, "");
  let out;
  try {
    const r = await fetch((en ? "https://engopendart.fss.or.kr/engapi/list.json" : "https://opendart.fss.or.kr/api/list.json") + "?crtfc_key=" + (env.DART_KEY || "") + "&corp_code=" + cc + "&bgn_de=" + bgn + "&page_count=" + n,
      { redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; BriefLive/1.0)", "Accept": "application/json" } });
    if (r.status >= 300 && r.status < 400) throw new Error("dart redirect " + r.status + " " + (r.headers.get("location") || "").slice(0, 80));
    const j = await r.json();
    if (j.status !== "000" && j.status !== "013") throw new Error("dart " + j.status);
    out = { code, at: Date.now(), items: (j.list || []).slice(0, n).map(function (it) {
      if (en) return { dt: it.rcept_dt, title: String(it.report_nm || "").replace(/\s+/g, " ").trim(), filer: "", note: "",
               link: "https://englishdart.fss.or.kr/dsbh001/main.do?rcpNo=" + it.rcept_no };
      return { dt: it.rcept_dt, title: String(it.report_nm || "").replace(/\s+/g, " ").trim(), filer: it.flr_nm || "",
               note: EXPLAIN[dnorm(it.report_nm)] || "",
               link: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=" + it.rcept_no };
    }) };
  } catch (e) {
    return new Response(JSON.stringify({ code, items: [], err: String(e.message || e).slice(0, 60) }), { headers: cors });
  }
  const body = JSON.stringify(out);
  ctx.waitUntil(caches.default.put(key, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=600" } })));
  return new Response(body, { headers: cors });
}

// ── /news?q=삼성전자 — 최신 뉴스 10건 · 10분 저장 ─────────────────────────────
//    키는 비밀 설정(NAVER_ID · NAVER_KEY)에만 있다. 응답엔 제목·요약 한 줄·원문 링크·언론사·시각만.
function untag(s) {
  return String(s || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim();
}
// 뉴스 — 네이버 검색 + Claude Haiku 4.5 로 「이 종목 이야기인가」 거르기 (사장님 2026-09-25 "두 방식 다")
//   ① 검색어: 주식(kr·us)은 「이름 주가」로 좁힌다 — SPY 가 록그룹 기사를 끌고 왔다
//   ② AI: 제목·요약을 보고 그 금융상품(회사·ETF·코인) 이야기인 기사 번호만 남긴다. 실패하면 거르지 않은 채로 보낸다.
//   결과는 10분 저장 — 같은 종목은 10분에 한 번만 AI 를 부른다.
// ── 뉴스 데모 영어 번역 (사장님 2026-10-13) — 데모 화면에서 처음부터 영어로 보이게. 기사(제목+요약)마다 7일 캐시 ──
async function newsTr(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
  if (request.method !== "POST" || !okO) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  let b; try { b = await request.json(); } catch (e) { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H }); }
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 25).map(function (x) { return { t: String((x && x.t) || "").slice(0, 200), d: String((x && x.d) || "").slice(0, 300) }; });
  const lang = NL_LANG[b.lang] ? b.lang : "en";   // 일·중 (2026-10-19) — 영어는 옛 캐시 자리 그대로
  const keyOf = async function (x) { const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x.t + "|" + x.d)); return new Request("https://newstr.cache/v4/" + (lang === "en" ? "" : lang + "/") + [...new Uint8Array(h)].slice(0, 16).map(function (v) { return v.toString(16).padStart(2, "0"); }).join("")); };
  const keys = await Promise.all(items.map(keyOf));
  const out = new Array(items.length), miss = [];
  await Promise.all(keys.map(async function (k, i) { const hit = await caches.default.match(k); if (hit) out[i] = await hit.json(); else miss.push(i); }));
  if (miss.length && env.AIP) {
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const r = await stub.fetch("https://aip/tr", { method: "POST", body: JSON.stringify({ lang: lang, items: miss.map(function (i) { return items[i]; }) }) });
      const j = await r.json(); if (j.err) out.err = j.err;
      if (Array.isArray(j.items)) miss.forEach(function (i, n) { const v = j.items[n]; if (v && v.t && !isKo(v.t) && !isKo(v.d)) { out[i] = { t: String(v.t).slice(0, 300), d: String(v.d || "").slice(0, 500) };
        ctx.waitUntil(caches.default.put(keys[i], new Response(JSON.stringify(out[i]), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=604800" } }))); } });
    } catch (e) {}
  }
  return new Response(JSON.stringify({ ok: true, err: out.err || undefined, items: [...out].map(function (v) { return v || null; }) }), { headers: H });
}
// 뉴스 앱 CATS 와 같은 검색어·신문사 거르기 (news_pub/index_src.html 과 맞출 것)
const NP_Q = ["정치", "경제 금리 환율", "증시 코스피", "부동산 아파트", "반도체 AI 과학", "사건 사고", "생활 문화", "케이팝 드라마 연예", "스포츠", "북한 국제", "사설 칼럼", "속보"];
const NP_PAPERS = /(^|\.)(chosun\.com|joongang\.co\.kr|joins\.com|donga\.com|hani\.co\.kr|khan\.co\.kr|hankookilbo\.com|kmib\.co\.kr|munhwa\.com|yna\.co\.kr|hankyung\.com|mk\.co\.kr|sedaily\.com|mt\.co\.kr|edaily\.co\.kr|koreaherald\.com|koreatimes\.co\.kr|koreajoongangdaily\.joins\.com|en\.yna\.co\.kr)$/i;
async function newsPrewarm(env, ctx) {
  if (!env.AIP) return;
  const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
  for (const q of NP_Q) {
    try {
      const j = await news(new Request("https://hub/news?n=100&q=" + encodeURIComponent(q)), env, ctx).then(function (r) { return r.json(); });
      const it = (j.items || []).filter(function (x) { return (!x.t || Date.now() - x.t < 5 * 864e5) && NP_PAPERS.test(x.src || ""); }).slice(0, 20)
        .map(function (x) { return { t: String(x.title || "").slice(0, 200), d: String(x.desc || "").slice(0, 300) }; });
      if (it.length) await stub.fetch("https://aip/tr", { method: "POST", body: JSON.stringify({ items: it }) });
    } catch (e) {}
  }
  try { await stub.fetch("https://aip/trprune", { method: "POST", body: "{}" }); } catch (e) {}
}
// ── 뉴스 데모 기사 전문 영어 보기 (사장님 2026-10-13) — 누른 사람에게만 즉석 번역해 돌려준다. 원문·번역 어디에도 저장하지 않는다 ──
async function newsArt(request, env) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin", "Cache-Control": "no-store" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
  const E = function (err, st) { return new Response(JSON.stringify({ ok: false, err: err }), { status: st || 400, headers: H }); };
  if (request.method !== "POST" || !okO) return E("forbidden", 403);
  let b; try { b = await request.json(); } catch (e) { return E("body"); }
  let u; try { u = new URL(String(b.url || "")); } catch (e) { return E("url"); }
  if (!/^https?:$/.test(u.protocol) || !NP_PAPERS.test(u.hostname)) return E("site");
  let r; try { r = await fetch(u.toString(), { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9" }, redirect: "follow" }); } catch (e) { return E("fetch", 502); }
  if (!r.ok) return E("fetch", 502);
  try { if (!NP_PAPERS.test(new URL(r.url).hostname)) return E("site"); } catch (e) {}
  const buf = await r.arrayBuffer();
  let cs = ((r.headers.get("content-type") || "").match(/charset=([\w-]+)/i) || [])[1] || "";
  if (!cs) { const head = new TextDecoder("latin1").decode(buf.slice(0, 4000)); cs = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1] || "utf-8"; }
  let html; try { html = new TextDecoder(/euc-?kr|ks_c_5601|cp949/i.test(cs) ? "euc-kr" : cs).decode(buf); } catch (e) { html = new TextDecoder("utf-8").decode(buf); }
  const meta = function (p) { const m = html.match(new RegExp('<meta[^>]+property=["\']' + p + '["\'][^>]+content=["\']([^"\']*)', "i")) || html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+property=["\']' + p, "i")); return m ? m[1] : ""; };
  const title = meta("og:title");
  let body = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style|noscript|nav|header|footer|aside|form|button|svg|iframe|figcaption)\b[\s\S]*?<\/\1>/gi, " ");
  const art = body.match(/<article\b[\s\S]*?<\/article>/i);
  if (art && art[0].replace(/<[^>]+>/g, "").trim().length > 300) body = art[0];
  let text = body.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h\d|li|tr|section)>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); })
    .split("\n").map(function (s) { return s.replace(/\s+/g, " ").trim(); }).filter(function (s) { return s.length >= 2; }).join("\n");
  if (text.length > 9000) { const k = text.indexOf(title.slice(0, 12)); text = text.slice(Math.max(0, k > 0 ? k : 0), (k > 0 ? k : 0) + 9000); }
  if (text.length < 80) return E("empty", 422);
  if (!env.AIP) return E("ai", 503);
  const ip = request.headers.get("cf-connecting-ip") || "";
  const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
  let j; try { j = await (await stub.fetch("https://aip/art", { method: "POST", body: JSON.stringify({ ip: ip, title: title, text: text, lang: NL_LANG[b.lang] ? b.lang : "en" }) })).json(); } catch (e) { return E("ai", 502); }
  if (!j || !j.ok) return E(j && j.err || "ai", j && j.err === "rate" ? 429 : 502);
  return new Response(JSON.stringify({ ok: true, title: j.title, paras: j.paras, src: u.hostname.replace(/^www\./, "") }), { headers: H });
}
// 뉴스 번역 언어 (2026-10-19) — 영어 + 일본어·중국어 간체·번체
const NL_LANG = { en: "English", ja: "Japanese", zhs: "Simplified Chinese (mainland usage)", zht: "Traditional Chinese (Taiwan usage)" };
function nlUnits(lang) { return lang === "en" ? "Units: 조 = trillion won, 억 = 100 million won, 만 = 10,000. Use the usual English names for companies and people. "
  : "Write money in the natural way for that language (조 원 / 억 원 → 兆ウォン・億ウォン / 万亿韩元・亿韩元 / 兆韓元・億韓元). Use the names for Korean companies, people and places that " + NL_LANG[lang] + " news media normally use. "; }
// 뉴스 검색어 → 한국어 검색어 (2026-10-19) — 일·중·영 무엇으로 쳐도 네이버에서 찾게
async function newsQ(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  if (!okO) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  const q = String(new URL(request.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (!q) return new Response(JSON.stringify({ ok: false }), { headers: H });
  const ck = new Request("https://newsq.cache/v1/" + encodeURIComponent(q));
  const hit = await caches.default.match(ck); if (hit) return new Response(await hit.text(), { headers: H });
  let ko = "";
  try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
    const j = await (await stub.fetch("https://aip/nq2ko", { method: "POST", body: JSON.stringify({ q: q }) })).json(); ko = (j && j.ko) || ""; } catch (e) {}
  const out = JSON.stringify({ ok: !!ko, ko: ko });
  if (ko) ctx.waitUntil(caches.default.put(ck, new Response(out, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=604800" } })));
  return new Response(out, { headers: H });
}
// 종목 검색어(일·중) → 한국 상장사 종목명 / 미국 티커 (2026-10-19) — 검색어마다 180일 저장 (모름은 7일)
async function stkQ(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  if (!okO) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  const q = String(new URL(request.url).searchParams.get("q") || "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (!q) return new Response(JSON.stringify({ ok: false }), { headers: H });
  const ck = new Request("https://stkq.cache/v2/" + encodeURIComponent(q));
  const hit = await caches.default.match(ck); if (hit) return new Response(await hit.text(), { headers: H });
  let j = null;
  if (env.AIP) try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
    j = await (await stub.fetch("https://aip/stkq", { method: "POST", body: JSON.stringify({ q: q }) })).json(); } catch (e) {}
  if (!j || j.err || !j.done) return new Response(JSON.stringify({ ok: false }), { headers: H });   // AI 실패는 저장 안 함
  const out = JSON.stringify({ ok: !!(j.kr || j.us), kr: j.kr || "", us: j.us || "" });
  ctx.waitUntil(caches.default.put(ck, new Response(out, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + ((j.kr || j.us) ? 15552000 : 604800) } })));
  return new Response(out, { headers: H });
}
async function stkQueryAi(env, q) {
  if (!env.CLAUDE_KEY || !q) return {};
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 200, thinking: { type: "disabled" }, messages: [{ role: "user", content:
    "A foreign investor typed this into the stock search box of a Korean stock app. It is a company name (or brand / group name, maybe partial) written in Japanese or Chinese (simplified or traditional). " +
    "Find the listed company it means. If it is listed in Korea (KOSPI/KOSDAQ), give its Korean stock name exactly as listed on KRX " +
    "(e.g. サムスン電子 / 三星电子 / 三星電子 -> 삼성전자, SKハイニックス / SK海力士 -> SK하이닉스, 現代自動車 / 现代汽车 -> 현대차, ネイバー / 纳弗 -> NAVER, カカオ -> 카카오, LGエナジーソリューション -> LG에너지솔루션); " +
    "for a group or brand name only (e.g. サムスン, 三星), give the Korean brand word (삼성). " +
    "If it is listed in the USA (NYSE/NASDAQ), give its ticker (e.g. アップル / 苹果 / 蘋果 -> AAPL, エヌビディア / 英伟达 / 輝達 -> NVDA, テスラ / 特斯拉 -> TSLA, マイクロソフト / 微软 -> MSFT). " +
    "If you do not know, leave both empty. Answer with JSON only, nothing else: {\"kr\":\"<Korean KRX name or empty>\",\"us\":\"<US ticker or empty>\"}\n\nInput: " + q }] });
  const t = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("");
  let o = {}; try { o = JSON.parse((t.match(/\{[\s\S]*\}/) || ["{}"])[0]); } catch (e) { o = {}; }
  const kr = String(o.kr || "").replace(/[^가-힣0-9A-Za-z&\s]/g, "").trim().slice(0, 30);
  const us = String(o.us || "").toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 10);
  return { done: true, kr: /[가-힣A-Za-z]/.test(kr) ? kr : "", us: us };
}
// ── 길찾기 역·정류장 이름 바로잡기 (10-19) — 한국어 이름(ID로 짝) → 공식 외국어 표기, 이름마다 180일 저장 ──
const OD_UL = { en: "English (official romanized names as on Seoul Metro / Korail signs, e.g. Gyodae, Macheon, Cheonggu, Samgakji)", ja: "Japanese (official station names as on Seoul Metro signs, e.g. 교대 → 教大, 마천 → 馬川, 청구 → 青丘, 잠실 → 蚕室, 장지 → 長旨; Japanese uses 駅 not 驛)", zhs: "Simplified Chinese (official station names, e.g. 교대 → 教大, 마천 → 马川, 청구 → 青丘, 잠실 → 蚕室, 장지 → 长旨)", zht: "Traditional Chinese (official station names, e.g. 교대 → 教大, 마천 → 馬川, 청구 → 青丘, 잠실 → 蠶室, 장지 → 長旨)" };
async function odAi(env, lang, miss) {
  const out = new Array(miss.length).fill(null);
  if (!env.CLAUDE_KEY || !miss.length || !OD_UL[lang]) return out;
    const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
    const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 4000, thinking: { type: "disabled" }, messages: [{ role: "user", content:
      "These are names of subway/railway stations, subway lines and bus stops in Korea, almost all in the Seoul metropolitan area (NOT Busan or other cities with the same name). Write each in " + OD_UL[lang] + ". " +
      "Stations: the official name shown on station signs. Lines (e.g. 수도권 신분당선, 경의중앙선, 공항철도, 우이신설선): their official name in that language. Bus stops (often 'A.B' joining two landmarks, or apartment complex names): translate meaningful words, transliterate brand/complex names, keep the '.' separator. Never output Hangul. " +
      "Each input line is <id> ||| <Korean name>. Answer with exactly one line per input, nothing else:\n<id> ||| <name>\n\n" + miss.map(function (n, i) { return i + " ||| " + n; }).join("\n") }] });
    r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n").forEach(function (ln) {
      const q = ln.split("|||"); if (q.length < 2) return; const i = parseInt(q[0].replace(/\D/g, ""), 10), v = q.slice(1).join("|||").trim();
      if (i >= 0 && i < miss.length && v && !/[가-힣]/.test(v)) out[i] = v.slice(0, 80); });
  return out;
}
function odLine(nm, lang) {   // 「수도권 5호선」·「5호선」 → Line 5 · 5号線 · 5号线 · 5號線
  const m = /^(?:수도권\s*)?(\d+)호선$/.exec(String(nm || "").trim()); if (!m) return null;
  return { en: "Line " + m[1], ja: m[1] + "号線", zhs: m[1] + "号线", zht: m[1] + "號線" }[lang];
}
async function odStations(env, ctx, j, lang) {
  if (!lang || !OD_UL[lang]) return;
  const subs = []; ((j && j.result && j.result.path) || []).forEach(function (p) { (p.subPath || []).forEach(function (sp) { subs.push(sp); }); });
  const names = new Set();
  subs.forEach(function (sp) { ["startName", "endName"].forEach(function (k) { if (sp[k]) names.add(sp[k]); });
    ((sp.passStopList && sp.passStopList.stations) || []).forEach(function (st) { if (st.stationName) names.add(st.stationName); });
    if (sp.trafficType === 1) (sp.lane || []).forEach(function (ln) { if (ln.name && !odLine(ln.name, lang)) names.add(ln.name); }); });
  const list = [...names].filter(function (n) { return /[가-힣]/.test(n); }).slice(0, 150);
  const key = function (n) { return new Request("https://odst.cache/v2/" + lang + "/" + encodeURIComponent(n)); };
  const tr = {}, miss = [];
  await Promise.all(list.map(async function (n) { const h = await caches.default.match(key(n)); if (h) tr[n] = await h.text(); else miss.push(n); }));
  if (miss.length && env.AIP) {   // AI 는 미국 쪽 처리기에서 (허브가 막힌 지역에서 돌 때가 있다)
    try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const jj = await (await stub.fetch("https://aip/odst", { method: "POST", body: JSON.stringify({ lang: lang, names: miss }) })).json();
      (jj && jj.out || []).forEach(function (v, i) { if (v && !/[가-힣]/.test(v)) { tr[miss[i]] = v.slice(0, 80); ctx.waitUntil(caches.default.put(key(miss[i]), new Response(v.slice(0, 80), { headers: { "Cache-Control": "public, max-age=15552000" } }))); } });
    } catch (e) {}
  }
  subs.forEach(function (sp) { ["startName", "endName"].forEach(function (k) { if (tr[sp[k]]) sp[k] = tr[sp[k]]; });
    ((sp.passStopList && sp.passStopList.stations) || []).forEach(function (st) { if (tr[st.stationName]) st.stationName = tr[st.stationName]; });
    if (sp.trafficType === 1) (sp.lane || []).forEach(function (ln) { const L2 = odLine(ln.name, lang); if (L2) ln.name = L2; else if (tr[ln.name]) ln.name = tr[ln.name]; }); });
}
// ── 주식·HTS·미니 일본어·중국어 화면 (사장님 2026-10-19) — 앱은 영어로 그리고, 화면 글을 여기서 받은 말로 바꾼다 ──
//   /xldict?lang= : 에이전트가 번역한 사전(xl_dict.js) 통째로 · /xl : 사전에 없는 글 → 저장본 → 없으면 AI(⟦n⟧ 숫자 자리 지킴), 90일 저장
const XL_UL = { ja: "Japanese", zhs: "Simplified Chinese (mainland China usage)", zht: "Traditional Chinese (Taiwan usage)" };
function xlH(request) { const o = request.headers.get("Origin") || ""; return { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": mpOrigin(o) ? o : "https://emhwang3-boop.github.io", "Vary": "Origin" }; }
async function xlDict(request) {
  const H = xlH(request), lang = new URL(request.url).searchParams.get("lang") || "";
  if (!XL_UL[lang]) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H });
  return new Response(JSON.stringify({ ok: true, d: XL_DICT[lang] || {} }), { headers: Object.assign({ "Cache-Control": "public, max-age=1800" }, H) });
}
function xlPh(s) { return (String(s).match(/⟦\d+⟧/g) || []).sort().join(""); }
async function xlTr(request, env, ctx) {
  const H = xlH(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
  if (request.method !== "POST" || !mpOrigin(request.headers.get("Origin") || "")) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  let b; try { b = await request.json(); } catch (e) { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H }); }
  const lang = XL_UL[b.lang] ? b.lang : ""; if (!lang) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H });
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60).map(function (x) { return String(x || "").slice(0, 600); });
  const out = new Array(items.length).fill(null), miss = [], dict = XL_DICT[lang] || {};
  const key = async function (t) { const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return new Request("https://xl.cache/v1/" + lang + "/" + [...new Uint8Array(h)].slice(0, 16).map(function (v) { return v.toString(16).padStart(2, "0"); }).join("")); };
  const keys = await Promise.all(items.map(key));
  await Promise.all(items.map(async function (t, i) { if (!t) return; if (dict[t]) { out[i] = dict[t]; return; } const h = await caches.default.match(keys[i]); if (h) out[i] = await h.text(); else miss.push(i); }));
  if (miss.length && env.AIP) {
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const j = await (await stub.fetch("https://aip/xl", { method: "POST", body: JSON.stringify({ lang: lang, items: miss.map(function (i) { return items[i]; }) }) })).json();
      (j && j.out || []).forEach(function (v, n) { const i = miss[n]; if (v && xlPh(v) === xlPh(items[i])) { out[i] = v; ctx.waitUntil(caches.default.put(keys[i], new Response(v, { headers: { "Cache-Control": "public, max-age=7776000" } }))); } });
    } catch (e) {}
  }
  return new Response(JSON.stringify({ ok: true, items: out }), { headers: H });
}
async function xlAi(env, lang, items) {
  if (!env.CLAUDE_KEY || !items.length) return [];
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const list = items.map(function (t, i) { return i + " ||| " + String(t).replace(/\n/g, " ⏎ "); }).join("\n");
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 6000, thinking: { type: "disabled" }, messages: [{ role: "user", content:
    "These are text snippets from the screens of a stock and crypto investing app (quotes, charts, orders, holdings, news headlines, company descriptions). Translate each from English (some are in Korean) into " + XL_UL[lang] + ", as a brokerage app in that market would word it. " +
    "Keep every placeholder like ⟦0⟧ ⟦1⟧ exactly once (they stand for numbers). Keep tickers and codes (BTC, ETH, SPY, KOSPI, ETF, RSI…), brand names (Kiwoom, KIS, OKX, Money Puzzle…), emoji and symbols unchanged. Well-known company names may use their usual local name. Keep ⏎ where it is. " +
    "If a snippet is not natural language (a code, a name only, a symbol), return it unchanged. Answer with exactly one line per input, same ids, nothing else:\n<id> ||| <translation>\n\n" + list }] });
  const out = new Array(items.length).fill(null);
  r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n").forEach(function (ln) {
    const q = ln.split("|||"); if (q.length < 2) return; const i = parseInt(q[0].replace(/\D/g, ""), 10); const v = q.slice(1).join("|||").trim().replace(/ ?⏎ ?/g, "\n");
    if (i >= 0 && i < items.length && v) out[i] = v; });
  return out;
}
// ── 부동산 실거래 번지 주소 → 좌표 (사장님 2026-10-19, 「○○에서 버스로 10분」 거리 검색) — 카카오 주소 검색, 주소마다 180일 저장 ──
async function reGeo(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
  if (request.method !== "POST" || !okO) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  let b; try { b = await request.json(); } catch (e) { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H }); }
  const addrs = [...new Set((Array.isArray(b.a) ? b.a : []).map(function (x) { return String(x || "").replace(/\s+/g, " ").trim().slice(0, 80); }).filter(function (x) { return /[가-힣]/.test(x) && /\d/.test(x); }))].slice(0, 150);
  const key = function (a) { return new Request("https://regeo.cache/v1/" + encodeURIComponent(a)); };
  const map = {}, miss = [];
  await Promise.all(addrs.map(async function (a) { const h = await caches.default.match(key(a)); if (h) { const v = await h.json(); if (v) map[a] = v; } else miss.push(a); }));
  const one = async function (a) {
    let v = null;
    try { const r = await fetch("https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(a), { headers: { Authorization: "KakaoAK " + (env.KAKAO_REST || "") } });
      if (!r.ok) return;   /* 한도·오류는 저장하지 않는다 */
      const j = await r.json(); const d = j && j.documents && j.documents[0]; if (d) v = [Math.round(+d.y * 1e5) / 1e5, Math.round(+d.x * 1e5) / 1e5]; } catch (e) { return; }
    if (v) map[a] = v;
    ctx.waitUntil(caches.default.put(key(a), new Response(JSON.stringify(v), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15552000" } })));
  };
  for (let i = 0; i < miss.length; i += 10) await Promise.all(miss.slice(i, i + 10).map(one));
  return new Response(JSON.stringify({ ok: true, map: map }), { headers: H });
}
// ── 부동산 단지·건물 이름 → 일본어·중국어 (사장님 2026-10-19) — 이름마다 30일 저장 ──
const RN_UL = { en: "English", ja: "Japanese (katakana for brands and loanwords)", zhs: "Simplified Chinese", zht: "Traditional Chinese (Taiwan)" };
async function reNames(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
  if (request.method !== "POST" || !okO) return new Response(JSON.stringify({ ok: false }), { status: 403, headers: H });
  let b; try { b = await request.json(); } catch (e) { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H }); }
  const ul = RN_UL[b.ul] ? b.ul : "";
  if (!ul) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H });
  const names = [...new Set((Array.isArray(b.names) ? b.names : []).map(function (x) { return String(x || "").trim().slice(0, 40); }).filter(function (x) { return /[가-힣]/.test(x); }))].slice(0, 60);
  const key = function (n) { return new Request("https://renm.cache/v1/" + ul + "/" + encodeURIComponent(n)); };
  const map = {}, miss = [];
  await Promise.all(names.map(async function (n) { const h = await caches.default.match(key(n)); if (h) map[n] = await h.text(); else miss.push(n); }));
  if (miss.length && env.AIP) {
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const j = await (await stub.fetch("https://aip/renm", { method: "POST", body: JSON.stringify({ ul: ul, names: miss }) })).json();
      (j && j.out || []).forEach(function (v, i) { if (v && !/[가-힣]/.test(v)) { map[miss[i]] = v; ctx.waitUntil(caches.default.put(key(miss[i]), new Response(v, { headers: { "Cache-Control": "public, max-age=2592000" } }))); } });
    } catch (e) {}
  }
  return new Response(JSON.stringify({ ok: true, map: map }), { headers: H });
}
async function reNamesAi(env, ul, names) {
  if (!env.CLAUDE_KEY || !names.length) return [];
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const list = names.map(function (n, i) { return i + " ||| " + n; }).join("\n");
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 3000, thinking: { type: "disabled" }, messages: [{ role: "user", content: ul === "en" ?   // 영어 — 뜻을 살린 이름 (사장님 10-22, 서울문정초등학교 → Seoul Munjeong Elementary School)
    "These are names of Korean apartment complexes, officetels, buildings and places (schools, stations, parks, shopping centers, offices), shown to foreign home-seekers in Korea. " +
    "Write each name in natural English, the way it would appear on an English map or sign in Korea. Brands and loanwords use their usual English spelling " +
    "(헬리오시티 -> Helio City, 올림픽훼밀리타운 -> Olympic Family Town, 래미안 -> Raemian, 자이 -> Xi, 푸르지오 -> Prugio, 힐스테이트 -> Hillstate, 롯데캐슬 -> Lotte Castle, 아이파크 -> I-Park). " +
    "Korean place-name parts use Revised Romanization written as one word without hyphens (문정 -> Munjeong, 잠실 -> Jamsil, 서울 -> Seoul). " +
    "Generic words are translated (초등학교 -> Elementary School, 중학교 -> Middle School, 고등학교 -> High School, 대학교 -> University, 역 -> Station, 공원 -> Park, 시장 -> Market, 주민센터 -> Community Service Center, 아파트 -> Apartments, 1단지 -> Complex 1). " +
    "Examples: 서울문정초등학교 -> Seoul Munjeong Elementary School, 잠실역 -> Jamsil Station, 잠실주공5단지 -> Jamsil Jugong Complex 5, 문정래미안 -> Munjeong Raemian. " +
    "Never output Hangul. Each input line is <id> ||| <Korean name>. Answer with exactly one line per input, nothing else:\n<id> ||| <name>\n\n" + list :
    "These are names of Korean apartment complexes, officetels and residential buildings, shown to foreign home-seekers. Write each name in " + RN_UL[ul] + ". " +
    "Brands and loanwords are transliterated by sound (e.g. 올림픽훼밀리타운 -> " + (ul === "ja" ? "オリンピックファミリータウン, 헬리오시티 -> ヘリオシティ, 래미안 -> ラミアン" : ul === "zhs" ? "奥林匹克家庭城, 헬리오시티 -> 赫利奥城, 래미안 -> 来美安" : "奧林匹克家庭城, 헬리오시티 -> 赫利奧城, 來美安") + "); " +
    "Korean place names use their usual Chinese characters when they have them (잠실 -> 蚕室/蠶室, 위례 -> 慰礼/慰禮); generic words are translated (아파트, 단지, 주공 5단지 -> 住公5団地 / 住公5区). " +
    "Never output Hangul. Each input line is <id> ||| <Korean name>. Answer with exactly one line per input, nothing else:\n<id> ||| <name>\n\n" + list }] });
  const out = new Array(names.length).fill(null);
  r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n").forEach(function (ln) {
    const q = ln.split("|||"); if (q.length < 2) return; const i = parseInt(q[0].replace(/\D/g, ""), 10); const v = q.slice(1).join("|||").trim();
    if (i >= 0 && i < names.length && v && !/[가-힣]/.test(v)) out[i] = v.slice(0, 60); });
  return out;
}
async function newsQueryKo(env, q) {
  if (!env.CLAUDE_KEY || !q) return {};
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 200, thinking: { type: "disabled" }, messages: [{ role: "user", content:
    "A foreign reader typed this into the search box of a Korean news app. It may be Japanese, Chinese (simplified or traditional) or English. " +
    "Turn it into a short Korean search query for Korean news, using the names Korean newspapers use for companies, people, places and topics " +
    "(e.g. サムスン -> 삼성, 三星电子 -> 삼성전자, 物価 -> 물가, 房地产 -> 부동산, 尹錫悦 -> 윤석열, 半導體 -> 반도체). " +
    "Answer with exactly one line: the Korean query only (Hangul; digits or Latin brand names allowed), no explanation.\n\nInput: " + q }] });
  const t = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n").map(function (v) { return v.replace(/[^가-힣0-9A-Za-z &]/g, "").trim(); }).filter(Boolean)[0] || "";
  return /[가-힣]/.test(t) ? { ko: t.slice(0, 40) } : {};
}
async function newsArticle(env, title, text, model, lang) {
  lang = NL_LANG[lang] ? lang : "en";
  if (!env.CLAUDE_KEY) return null;
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const r = await client.messages.create({
    model: model || "claude-haiku-5-5", max_tokens: 6000, thinking: { type: "disabled" },
    messages: [{ role: "user", content:
      "Below is text taken from a Korean newspaper web page (it also contains menus, ads and links). A reader of a news app asked to read this article in " + NL_LANG[lang] + ". " +
      "Find the news article itself (its headline and body paragraphs, plus byline/date if present) and ignore everything else (menus, ads, related-article lists, comments, copyright boilerplate). " +
      "Translate the article faithfully into natural " + NL_LANG[lang] + ": keep every fact, number, quote, direction (up/down, rise/fall) and tone exactly as in the Korean; do not add, summarize or guess. " +
      nlUnits(lang) + "Do not use he/she unless the Korean text states it.\n" +
      "Answer in exactly this format and nothing else:\nTITLE: <" + NL_LANG[lang] + " headline>\n<paragraph 1>\n<paragraph 2>\n...\n\n" +
      "Page title: " + title + "\n\nPage text:\n" + text }],
  });
  const txt = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("");
  const lines = txt.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  if (!lines.length) return null;
  let t = ""; if (/^TITLE:/i.test(lines[0])) t = lines.shift().replace(/^TITLE:\s*/i, "");
  const paras = lines.filter(function (s) { return !/^TITLE:/i.test(s); });
  if (!paras.length || isKo(t) || isKo(paras.join(" "))) return null;
  return { title: t, paras: paras.slice(0, 80) };
}
// 글자 중 한글이 30% 넘으면 번역 안 된 것으로 본다 (2026-10-13)
function isKo(s) { s = String(s || ""); const h = (s.match(/[가-힣ㄱ-ㆎ]/g) || []).length, a = (s.match(/[A-Za-z]/g) || []).length; return h + a > 0 && h / (h + a) > 0.3; }
async function newsTranslate(env, items, model, lang) {
  lang = NL_LANG[lang] ? lang : "en";
  if (!env.CLAUDE_KEY || !items.length) return null;
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const list = items.map(function (it, i) { return i + "t ||| " + it.t + "\n" + i + "d ||| " + it.d; }).join("\n");
  const r = await client.messages.create({
    model: model || "claude-haiku-5-5", max_tokens: 4000, thinking: { type: "disabled" },
    messages: [{ role: "user", content:
      "These are real, already-published news headlines and summaries from Korean newspapers, translated for foreign readers of a news reader app. Translate every line faithfully, including titles of films, crimes, violence and political disputes or quotes; never omit or refuse a line. " +
      "Translate each Korean news headline (T) and summary (D) into " + NL_LANG[lang] + ". Translate faithfully: keep every fact, number, direction (up/down, rise/fall, beat/miss) and tone exactly as in the Korean; do not add, guess or change anything. " +
      nlUnits(lang) +
      "Do not use he/she unless the Korean text states it. Each input line is <id> ||| <Korean text>. Answer with exactly one output line per input line, same ids, in this format and nothing else:\n<id> ||| <" + NL_LANG[lang] + " translation>\n\n" + list }],
  });
  const txt = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("");
  const arr = new Array(items.length).fill(null);
  txt.split("\n").forEach(function (ln) { const q = ln.split("|||"); if (q.length < 2) return; const m = q[0].replace(/[*`#\-\s.:]/g, "").match(/(\d+)([td])$/i); if (!m) return;
    const i = +m[1]; if (i < 0 || i >= items.length) return; arr[i] = arr[i] || { t: "", d: "" }; arr[i][m[2].toLowerCase()] = q.slice(1).join("|||").trim(); });
  arr.forEach(function (v, i) { if (v && (!v.t || isKo(v.t) || isKo(v.d) || /^<[^>]*translation>$/i.test(v.t))) arr[i] = null; });   // 형식 자리표를 그대로 돌려준 줄도 버린다 (10-19)   // 한글 그대로 되돌려 준 줄은 번역 안 된 것 (2026-10-13)
  return arr.some(Boolean) ? arr : null;
}
async function newsFilter(env, ctxName, mk, items) {
  if (!env.CLAUDE_KEY || !items.length) return null;
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const kind = mk === "coin" ? "암호화폐" : (mk === "us" ? "미국 상장 주식 또는 ETF" : "한국 상장 주식 또는 ETF");
  const list = items.map(function (it, i) { return i + ". " + it.title + " — " + (it.desc || "").slice(0, 90); }).join("\n");
  const r = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{ role: "user", content:
      "투자 앱의 종목 뉴스 목록이다. 대상: 「" + ctxName + "」(" + kind + ").\n" +
      "아래 기사 중 이 금융상품 자체나 그 발행 회사·기초자산에 관한 기사 번호만 골라라. " +
      "이름만 같은 다른 대상(가수·밴드·사람·지명·다른 회사 등) 기사는 빼라.\n" +
      "답은 JSON 배열 하나만. 예: [0,2,5] · 해당 없음이면 []\n\n" + list }],
  });
  if (r.stop_reason === "refusal") return null;
  const txt = r.content.filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("");
  const m = txt.match(/\[[\d,\s]*\]/);
  if (!m) return null;
  const keep = JSON.parse(m[0]).filter(function (k) { return k >= 0 && k < items.length; });
  return items.filter(function (_, k) { return keep.indexOf(k) >= 0; });
}

async function news(request, env, ctx) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 40);
  const mk = (url.searchParams.get("mk") || "").trim().slice(0, 6);          // kr · us · coin (없으면 옛 앱)
  const cx = (url.searchParams.get("ctx") || q).trim().slice(0, 60);          // 화면에 보이는 종목 이름 전체
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json; charset=utf-8" };
  if (!q) return new Response(JSON.stringify({ items: [] }), { headers: cors });
  const en = url.searchParams.get("lang") === "en";                         // 영문 화면 — 구글 뉴스 영문 (사장님 2026-09-29, 비상업)
  let qq = en ? ((mk === "kr" || mk === "us") ? (q + " stock") : q) : ((mk === "kr" || mk === "us") ? (q + " 주가") : q);
  const nn = Math.max(10, Math.min(100, parseInt(url.searchParams.get("n") || "10", 10) || 10));   // 뉴스 앱은 100개 받아 신문사로 거른다 (2026-10-12)
  const key = new Request("https://news.cache/v4/" + encodeURIComponent((en ? q + "|en" : qq) + "|" + mk + "|" + cx + "|" + nn));
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: Object.assign({}, cors, { "X-Cache": "hit" }) });
  let out;
  try {
    if (en) {
      // 미국 짧은 티커(C·F·T…)는 회사 이름으로 찾는다 — 야후 검색
      // 국내 종목코드(005930)도 야후에서 영문 회사 이름을 찾는다 (.KS → .KQ)
      const trims = function (s) { let t = String(s || "").trim(); for (let k = 0; k < 3; k++) t = t.replace(/[,.]?\s+(Inc|Corp|Corporation|Co|Company|Ltd|plc|Group|Holdings)\.?$/i, "").trim(); return t; };
      const syms = (mk === "us" && /^[A-Z.\-]{1,5}$/.test(q)) ? [q] : ((/^[0-9][0-9A-Z]{5}$/.test(q)) ? [q + ".KS", q + ".KQ"] : []);
      for (const sy of syms) {
        try {
          const ys = await fetch("https://query1.finance.yahoo.com/v1/finance/search?quotesCount=1&newsCount=0&q=" + encodeURIComponent(sy), { headers: { "User-Agent": "Mozilla/5.0" } }).then(function (r) { return r.json(); });
          const qt = (ys.quotes || [])[0];
          const nm = qt && String(qt.symbol || "").toUpperCase() === sy ? trims(qt.longname || qt.shortname) : "";
          if (nm) { qq = nm + " stock"; break; }
        } catch (e) {}
      }
      // 구글이 허브(클라우드플레어) 요청을 가끔 503 으로 막는다 → 두 번 더 해 보고, 안 되면 빙 뉴스 RSS
      let x = "", via = "google";
      for (let k = 0; k < 3 && !x; k++) {
        const r = await fetch("https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=" + encodeURIComponent(qq), { headers: { "User-Agent": "Mozilla/5.0" } });
        if (r.ok) x = await r.text();
      }
      if (!x) {
        const r = await fetch("https://www.bing.com/news/search?format=rss&setlang=en-US&cc=US&q=" + encodeURIComponent(qq), { headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US" } });
        if (!r.ok) throw new Error("google·bing " + r.status);
        x = await r.text(); via = "bing";
      }
      const tag = function (it, t) {
        const m = it.match(new RegExp("<" + t + "[^>]*>([\\s\\S]*?)</" + t + ">"));
        return m ? untag(m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "")) : "";
      };
      const items = (x.match(/<item>[\s\S]*?<\/item>/g) || []).map(function (it) {
        let src = tag(it, "source") || tag(it, "News:Source"); let title = tag(it, "title");
        if (src && title.endsWith(" - " + src)) title = title.slice(0, -(src.length + 3));
        const link = tag(it, "link");
        if (!src) { try { src = new URL(link).hostname.replace(/^www\./, ""); } catch (e) {} }
        return { title: title, desc: via === "bing" ? tag(it, "description").slice(0, 140) : "", link: link, src: src, t: Date.parse(tag(it, "pubDate")) || 0 };
      }).sort(function (a, b) { return b.t - a.t; }).slice(0, 10);
      out = { q: qq, at: Date.now(), lang: "en", via: via, items: items };
    } else {
    const r = await fetch("https://naverapihub.apigw.ntruss.com/search/v1/news?display=" + nn + "&sort=date&query=" + encodeURIComponent(qq), {
      headers: { "X-NCP-APIGW-API-KEY-ID": env.NAVER_ID || "", "X-NCP-APIGW-API-KEY": env.NAVER_KEY || "" } });
    if (!r.ok) throw new Error("naver " + r.status);
    const j = await r.json();
    out = { q: qq, at: Date.now(), items: (j.items || []).map(function (it) {
      const link = it.originallink || it.link || "";
      let src = ""; try { src = new URL(link).hostname.replace(/^www\./, ""); } catch (e) {}
      return { title: untag(it.title), desc: untag(it.description).slice(0, 140), link, src,
               t: Date.parse(it.pubDate) || 0 };
    }) };
    }
  } catch (e) {
    return new Response(JSON.stringify({ q, items: [], err: String(e.message || e).slice(0, 60) }), { headers: cors });
  }
  if (mk && env.AIP) {
    // AI 는 미국 동부의 AiProxy 에서 부른다 — 이 요청이 홍콩에서 돌아도 된다
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const r = await stub.fetch("https://aip/filter", { method: "POST", body: JSON.stringify({ cx: cx, mk: mk, items: out.items }) });
      const j = await r.json();
      if (j.items) { out.ai = out.items.length - j.items.length; out.items = j.items; }
      else if (j.err) out.aiErr = j.err;
    } catch (e) { out.aiErr = String(e.message || e).slice(0, 60); }
  }
  const body = JSON.stringify(out);
  if (!out.aiErr)                             // AI 가 실패한 결과는 저장하지 않는다 — 다음 요청에서 다시 거른다
  ctx.waitUntil(caches.default.put(key, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=600" } })));
  return new Response(body, { headers: cors });
}

// ── /enname?c=kr:005930,us:INTC — 종목 영문 이름(야후) · 30일 저장 (사장님 2026-09-29 영어 화면에 한글 금지) ──
async function enname(request, env, ctx) {
  const url = new URL(request.url);
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json; charset=utf-8" };
  const list = (url.searchParams.get("c") || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 40);
  const trims = function (s) { let t = String(s || "").trim(); for (let k = 0; k < 3; k++) t = t.replace(/[,.]?\s+(Inc|Corp|Corporation|Co|Company|Ltd|plc|Holdings)\.?$/i, "").trim(); return t; };
  // 국내는 Infoway 영문명 먼저 (사장님 2026-09-29 "infoway 가 되니 그리로") — 없으면 야후
  const iw = {};
  const krs = list.map(function (x) { const q = x.match(/^kr:([0-9A-Z]{6})$/i); return q ? q[1].toUpperCase() : null; }).filter(Boolean);
  if (krs.length && env.INFOWAY_KEY) {
    try {
      const r = await fetch("https://data.infoway.io/common/basic/symbols/info?type=STOCK_KS&symbols=" + krs.map(function (c) { return c + ".KS"; }).join(","), { headers: { apiKey: env.INFOWAY_KEY } }).then(function (r) { return r.json(); });
      (r.data || []).forEach(function (d) { const c = String(d.symbol || "").replace(/\.KS$/i, "").toUpperCase(); const n = trims(d.name_en); if (c && n) iw[c] = n; });
    } catch (e) {}
  }
  const one = async function (it) {
    const m = it.match(/^(kr|us):([0-9A-Z.\-]{1,10})$/i); if (!m) return [it, null];
    const mk = m[1].toLowerCase(), code = m[2].toUpperCase();
    const key = new Request("https://enname.cache/v2/" + mk + "/" + code);
    if (mk === "kr" && iw[code]) { ctx.waitUntil(caches.default.put(key, new Response(iw[code], { headers: { "Cache-Control": "public, max-age=2592000" } }))); return [it, iw[code]]; }
    const hit = await caches.default.match(key);
    if (hit) { const t = await hit.text(); return [it, t || null]; }
    let nm = "";
    for (const sy of (mk === "kr" ? [code + ".KS", code + ".KQ"] : [code])) {
      try {
        const ys = await fetch("https://query1.finance.yahoo.com/v1/finance/search?quotesCount=1&newsCount=0&q=" + encodeURIComponent(sy), { headers: { "User-Agent": "Mozilla/5.0" } }).then(function (r) { return r.json(); });
        const qt = (ys.quotes || [])[0];
        if (qt && String(qt.symbol || "").toUpperCase() === sy) { nm = trims(qt.longname || qt.shortname); if (nm) break; }
      } catch (e) {}
    }
    if (nm) ctx.waitUntil(caches.default.put(key, new Response(nm, { headers: { "Cache-Control": "public, max-age=2592000" } })));
    return [it, nm || null];
  };
  const pairs = await Promise.all(list.map(one));
  const out = {}; pairs.forEach(function (p) { if (p[1]) out[p[0]] = p[1]; });
  return new Response(JSON.stringify(out), { headers: cors });
}

// ── /corp?mk=kr&code=005930&name=삼성전자 · /corp?mk=us&code=NVDA — 기업 정보 · 12시간 저장 (사장님 2026-09-27) ──
async function corp(request, env, ctx) {
  const url = new URL(request.url);
  const mk = url.searchParams.get("mk") === "us" ? "us" : "kr";
  const code = mk === "us" ? (url.searchParams.get("code") || "").toUpperCase().replace(/\.US$/, "").replace(/[^A-Z.\-]/g, "").slice(0, 10)
                           : (url.searchParams.get("code") || "").replace(/[^0-9]/g, "").slice(0, 6);
  const name = (url.searchParams.get("name") || "").replace(/\s*\(.*$/, "").trim().slice(0, 40);
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json; charset=utf-8" };
  if (!code) return new Response(JSON.stringify({ err: "no code" }), { headers: cors });
  const key = new Request("https://corp.cache/v10/" + mk + "/" + code);   // v9: 영업이익 대신 EBIT·세전이익 (2026-09-27)
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: Object.assign({}, cors, { "X-Cache": "hit" }) });
  let out;
  if (mk === "kr") {
    out = { mk, code, desc: null, fin: null, errs: [] };
    try { out.enc = await encyc(env, name); } catch (e) { out.errs.push(String(e.message || e).slice(0, 50)); }
    const cc = CORP[code];
    if (cc) { try { out.fin = await dartFin(env, cc); } catch (e) { out.errs.push(String(e.message || e).slice(0, 50)); } }
    else out.errs.push("no corp");                              // ETF 등 DART 회사가 아닌 것
    // 설명·PER·PBR — 백과가 없거나 막히면 야후(.KS → .KQ) 사업 설명을 한국어로 요약 (미국 동부 AiProxy)
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      for (const sx of [".KS", ".KQ"]) {
        const r = await stub.fetch("https://aip/corp", { method: "POST", body: JSON.stringify({ code: code + sx, descOnly: true }) });
        const y = await r.json();
        if (y && (y.desc || (y.ind && y.ind.per != null))) { if (!out.desc && y.desc) out.desc = y.desc; if (y.descEn) out.descEn = y.descEn; if (y.nameEn) out.nameEn = y.nameEn; out.ind = y.ind; break; }
      }
    } catch (e) { out.errs.push(String(e.message || e).slice(0, 50)); }
  } else {
    try {
      const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
      const r = await stub.fetch("https://aip/corp", { method: "POST", body: JSON.stringify({ code }) });
      out = await r.json();
    } catch (e) { out = { mk, code, errs: [String(e.message || e).slice(0, 50)] }; }
  }
  out.at = Date.now();
  const body = JSON.stringify(out);
  if (out.desc || out.fin || out.enc) ctx.waitUntil(caches.default.put(key, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=43200" } })));
  return new Response(body, { headers: cors });
}
// ── /coininfo?sym=ETH&ko=이더리움 — 코인 정보 · 12시간 저장 (사장님 2026-09-27) ──
async function coininfo(request, env, ctx) {
  const url = new URL(request.url);
  const sym = (url.searchParams.get("sym") || "").toUpperCase().replace(/USDT$/, "").replace(/-.*$/, "").replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const ko = (url.searchParams.get("ko") || "").trim().slice(0, 30);
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json; charset=utf-8" };
  if (!sym) return new Response(JSON.stringify({ err: "no sym" }), { headers: cors });
  const key = new Request("https://coininfo.cache/v4/" + sym);
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: Object.assign({}, cors, { "X-Cache": "hit" }) });
  let out;
  try {
    const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
    const r = await stub.fetch("https://aip/coininfo", { method: "POST", body: JSON.stringify({ sym }) });
    out = await r.json();
  } catch (e) { out = { sym, errs: [String(e.message || e).slice(0, 50)] }; }
  if (ko) { try { out.enc = await encyc(env, ko, "coin"); } catch (e) { (out.errs = out.errs || []).push(String(e.message || e).slice(0, 50)); } }
  out.at = Date.now();
  const body = JSON.stringify(out);
  if (out.desc || out.cmc || out.enc) ctx.waitUntil(caches.default.put(key, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=43200" } })));
  return new Response(body, { headers: cors });
}
// ── 고객 게시판 (사장님 2026-10-10) — moneypuzzle.co.kr/board.html 이 쓴다 ─────────────
//   GET  /board/list?page=N · GET /board/post?id= · POST /board/post · POST /board/comment · POST /board/delete
//   🔴 개인정보 없음: 쓴 사람이 적은 글·별명만. 비밀번호는 소금 친 SHA-256 만, IP 도 해시만(시간당 제한용).
// ── 우리 앱 origin (2026-10-14 하위 도메인 나누기) — 옛 주소(emhwang3-boop.github.io) + moneypuzzle.co.kr + www·hts·mini·stock·news·land
const MP_ORIGIN_RE = /^https:\/\/(emhwang3-boop\.github\.io|((www|hts|mini|mini2|stock|news|land|navi)\.)?moneypuzzle\.co\.kr)$/;
function mpOrigin(o) { return MP_ORIGIN_RE.test(o || ""); }
const B_ORIGINS = ["https://moneypuzzle.co.kr", "https://www.moneypuzzle.co.kr", "http://moneypuzzle.co.kr", "http://www.moneypuzzle.co.kr", "https://emhwang3-boop.github.io",
  "https://hts.moneypuzzle.co.kr", "https://mini.moneypuzzle.co.kr", "https://stock.moneypuzzle.co.kr", "https://news.moneypuzzle.co.kr", "https://land.moneypuzzle.co.kr", "https://navi.moneypuzzle.co.kr", "https://mini2.moneypuzzle.co.kr"];   // 앱마다 하위 도메인 (2026-10-14);
function bOrigin(o) {
  if (!o) return "";
  if (B_ORIGINS.indexOf(o) >= 0) return o;
  if (/^http:\/\/127\.0\.0\.1(:\d{1,5})?$/.test(o)) return o;
  return "";
}
function BJ(o, origin, status) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin" };
  if (origin) h["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(o), { status: status || 200, headers: h });
}
async function bSha(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
function bRand(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(function (b) { return b.toString(16).padStart(2, "0"); }).join(""); }
function bKst() { return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 16).replace("T", " "); }
function bClean(s, max, oneLine) {
  let t = String(s == null ? "" : s).replace(/[<>]/g, "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "");
  if (oneLine) t = t.replace(/\s+/g, " ");
  t = t.trim();
  return t.length > max ? null : t;
}
function bLinks(s) { return (String(s).match(/https?:\/\/|www\./gi) || []).length; }
// ── 입점 문의 도우미 (2026-10-15) ──
// 입점 업종 분류 — 코드표는 여기 한 곳. 앱·관리자 화면은 GET /ninq/cats 로 받아 쓴다 (광고 상품도 이 코드를 쓴다, 사장님 2026-10-15)
//   저장 코드 = "대분류" 또는 "대분류.소분류" · etc(기타)는 직접 입력 글(catx)을 같이 둔다
const NINQ_CATS = [
  { c: "food", ko: "식당", en: "Restaurants", sub: [
    { c: "korean", ko: "한식", en: "Korean" }, { c: "chinese", ko: "중식", en: "Chinese" }, { c: "japanese", ko: "일식", en: "Japanese" }, { c: "western", ko: "양식", en: "Western" },
    { c: "snack", ko: "분식", en: "Korean snacks (bunsik)" }, { c: "bbq", ko: "고기구이", en: "Korean BBQ" }, { c: "seafood", ko: "해산물·횟집", en: "Seafood & raw fish" },
    { c: "pub", ko: "치킨·호프·주점", en: "Chicken, beer & pubs" }, { c: "asian", ko: "아시안(베트남·태국 등)", en: "Asian (Vietnamese, Thai, etc.)" },
    { c: "veg", ko: "채식·할랄", en: "Vegetarian & halal" }, { c: "other", ko: "기타", en: "Other" }] },
  { c: "cafe", ko: "카페·디저트", en: "Cafes & desserts", sub: [{ c: "cafe", ko: "카페", en: "Cafe" }, { c: "bakery", ko: "베이커리", en: "Bakery" }, { c: "dessert", ko: "디저트", en: "Desserts" }] },
  { c: "cosme", ko: "화장품가게", en: "Cosmetics shops", sub: [{ c: "store", ko: "화장품 매장", en: "Cosmetics store" }, { c: "drug", ko: "드럭스토어(올리브영 등)", en: "Drugstore (Olive Young, etc.)" }] },
  { c: "beauty", ko: "뷰티", en: "Beauty", sub: [{ c: "hair", ko: "미용실", en: "Hair salon" }, { c: "nail", ko: "네일", en: "Nails" }, { c: "skin", ko: "피부관리·마사지", en: "Skin care & massage" }] },
  { c: "clinic", ko: "성형·피부과", en: "Plastic surgery & dermatology" },
  { c: "medical", ko: "병원·약국", en: "Hospitals & pharmacies" },
  { c: "stay", ko: "숙박", en: "Accommodation", sub: [{ c: "hotel", ko: "호텔", en: "Hotel" }, { c: "guest", ko: "게스트하우스", en: "Guesthouse" }, { c: "hanok", ko: "한옥스테이", en: "Hanok stay" }] },
  { c: "shop", ko: "쇼핑", en: "Shopping", sub: [{ c: "dept", ko: "백화점", en: "Department store" }, { c: "dutyfree", ko: "면세점", en: "Duty-free shop" }, { c: "market", ko: "시장", en: "Market" }, { c: "fashion", ko: "패션·로드숍", en: "Fashion & street shops" }] },
  { c: "tour", ko: "관광·체험·공연", en: "Sights, experiences & shows" },
  { c: "trans", ko: "투어·교통·렌터카", en: "Tours, transport & car rental" },
  { c: "money", ko: "환전·유심·통신", en: "Currency exchange, SIM & mobile" },
  { c: "etc", ko: "기타(직접 입력)", en: "Other (please specify)" }];
function ninqCatOk(code) {
  const m = /^([a-z]{2,12})(?:\.([a-z]{2,12}))?$/.exec(String(code || "")); if (!m) return false;
  const top = NINQ_CATS.find(function (x) { return x.c === m[1]; }); if (!top) return false;
  if (top.sub) return !!m[2] && top.sub.some(function (x) { return x.c === m[2]; });
  return !m[2];
}
function ninqCatName(code) {
  const [a, b] = String(code || "").split("."), top = NINQ_CATS.find(function (x) { return x.c === a; }); if (!top) return String(code || "");
  const sb = b && top.sub ? top.sub.find(function (x) { return x.c === b; }) : null; return top.ko + (sb ? " > " + sb.ko : "");
}
// 사업자등록번호 — 형식·체크섬 → 국세청 상태조회(공공데이터포털 「국세청_사업자등록정보 진위확인 및 상태조회 서비스」, 키 DATA_GO_KR)
//   st: active=계속사업자 · suspended=휴업 · closed=폐업 · none=미등록 · bad=형식/체크섬 틀림 · pending=키 대기(그 API 활용신청 전 — 형식·체크섬만 통과)
async function ninqBiz(env, v) {
  const bno = String(v || "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(bno)) return { pass: false, st: "bad", bno: bno };
  const d = bno.split("").map(Number), w = [1, 3, 7, 1, 3, 7, 1, 3, 5]; let s = 0;
  for (let i = 0; i < 9; i++) s += d[i] * w[i];
  s += Math.floor(d[8] * 5 / 10);
  if ((10 - s % 10) % 10 !== d[9]) return { pass: false, st: "bad", bno: bno };
  const nk = env.DATAGO_KEY || env.DATA_GO_KR;
  if (!nk) return { pass: true, st: "pending", bno: bno };
  try {
    const r = await fetch("https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + encodeURIComponent(nk), {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ b_no: [bno] }) });
    const j = await r.json(), x = j && j.data && j.data[0];
    if (!x) return { pass: true, st: "pending", bno: bno };   // 키 미신청(-4) 등 — 형식·체크섬만
    if (x.b_stt_cd === "01") return { pass: true, st: "active", bno: bno };
    if (x.b_stt_cd === "02") return { pass: false, st: "suspended", bno: bno };
    if (x.b_stt_cd === "03") return { pass: false, st: "closed", bno: bno };
    return { pass: false, st: "none", bno: bno };
  } catch (e) { return { pass: true, st: "pending", bno: bno }; }
}
// 확인 결과 검사 — 지금은 이메일 코드 세션(vt). 다른 확인 방식을 붙이면 이 함수만 바꾼다
async function ninqIdCheck(st, vt, now) {
  if (!/^[0-9a-f]{32}$/.test(vt)) return { ok: false };
  const v = await st.get("vt:" + vt); if (!v || v.exp < now) return { ok: false };
  return { ok: true, email: v.email, m: v.m || "email" };
}
async function nPbkdf(pw, saltHex, it) {   // 관리 비밀번호 해시 — PBKDF2-SHA256 (2026-10-15)
  const salt = new Uint8Array(saltHex.match(/../g).map(function (h) { return parseInt(h, 16); }));
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: it }, k, 256);
  return [...new Uint8Array(bits)].map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
function bEq(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
}
const KTTL = { search: 300000, stock: 3000, chart: 20000 };   // 폰 재요청 허용 전 캐시 유효(ms)


// 지역 줄 만들기 (2026-10-10) — "KR|Seoul|Gangnam-gu" → "한국 · Seoul · Gangnam-gu"
const GEO_CC = { KR: "한국", US: "미국", JP: "일본", CN: "중국", HK: "홍콩", TW: "대만", SG: "싱가포르", MY: "말레이시아", VN: "베트남", TH: "태국", PH: "필리핀", ID: "인도네시아", IN: "인도", AU: "호주", CA: "캐나다", GB: "영국", DE: "독일", FR: "프랑스" };
function geoRows(ga) {
  let r = "";
  for (const [k, v] of ga || []) {
    const p = String(k).split("|"), cc = GEO_CC[p[0]] || p[0] || "?";
    const city = p[2] || "", reg = p[1] || "";
    r += "<tr><td>" + cc + (reg ? " · " + reg : "") + (city && city !== reg ? " · " + city : "") + "</td><td style='text-align:right'>" + v + "</td></tr>";
  }
  return r || "<tr><td colspan=2 style='color:#6b7688'>아직 지역 자료 없음</td></tr>";
}
// ── 부동산 실거래 (국토교통부 공공데이터, 사장님 2026-10-12) ── 키는 허브 비밀값(DATA_GO_KR)에만 둔다
const RE_OK = ["AptTradeDev","AptRent","RHTrade","RHRent","SHTrade","SHRent","OffiTrade","OffiRent","NrgTrade","LandTrade"];
async function reDeals(request, env, ctx) {
  const u = new URL(request.url);
  const t = u.searchParams.get("t") || "", lawd = u.searchParams.get("lawd") || "", ym = u.searchParams.get("ym") || "";
  if (RE_OK.indexOf(t) < 0 || !/^\d{5}$/.test(lawd) || !/^\d{6}$/.test(ym)) return J({ ok: false, err: "bad" });
  const key = new Request("https://re.cache/v1/" + t + "/" + lawd + "/" + ym);
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "X-Cache": "hit" } });
  const items = [];
  try {
    for (let pg = 1; pg <= 5; pg++) {
      const r = await fetch("https://apis.data.go.kr/1613000/RTMSDataSvc" + t + "/getRTMSDataSvc" + t + "?serviceKey=" + encodeURIComponent(env.DATA_GO_KR || "")
        + "&LAWD_CD=" + lawd + "&DEAL_YMD=" + ym + "&numOfRows=1000&pageNo=" + pg);
      if (!r.ok) return J({ ok: false, err: "http " + r.status });
      const x = await r.text();
      const rc = (x.match(/<resultCode>([^<]*)</) || [])[1];
      if (rc && rc !== "000" && rc !== "00") return J({ ok: false, err: "rc " + rc });
      const blocks = x.match(/<item>[\s\S]*?<\/item>/g) || [];
      for (const b of blocks) { const o = {}; b.replace(/<(\w+)>([^<]*)<\/\1>/g, function (_, k, v) { v = v.trim(); if (v) o[k] = v; return ""; }); items.push(o); }
      const tot = +((x.match(/<totalCount>(\d+)/) || [])[1] || 0);
      if (items.length >= tot || !blocks.length) break;
    }
  } catch (e) { return J({ ok: false, err: "fetch" }); }
  const now = new Date(Date.now() + 9 * 3600e3), cur = String(now.getUTCFullYear()) + String(now.getUTCMonth() + 1).padStart(2, "0");
  const res = new Response(JSON.stringify({ ok: true, items: items }), { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=" + (ym >= cur ? 21600 : 604800) } });
  ctx.waitUntil(caches.default.put(key, res.clone()));
  return res;
}
// ── 카카오 장소 검색 대리 (2026-10-13) — 지도는 네이버로 바꾸고, 단지·건물 찾기는 카카오 로컬 REST 를 허브에서 부른다. 키는 비밀값(KAKAO_REST) ──
//   ?q=검색어  또는  ?x=경도&y=위도&kw=키워드&radius=150 (가까운 순)
// 내비 — 두 역 사이 열차 시간표·어른 운임 (국토교통부 TAGO 열차정보). 우리 앱 origin 만, 30분 캐시 (2026-10-15)
async function trainInfo(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = (o, st) => new Response(JSON.stringify(o), { status: st || 200, headers: H });
  if (!okO) return out({ ok: false, err: "origin" }, 403);
  const u = new URL(request.url), dep = u.searchParams.get("dep") || "", arr = u.searchParams.get("arr") || "", d = u.searchParams.get("date") || "";
  if (!/^NAT[0-9A-Z]{6}$/.test(dep) || !/^NAT[0-9A-Z]{6}$/.test(arr) || !/^\d{8}$/.test(d)) return out({ ok: false, err: "bad" }, 400);
  const key = new Request("https://train.cache/v1/?" + dep + "-" + arr + "-" + d);
  const hit = await caches.default.match(key);
  if (hit) return out(await hit.json());
  try {
    const r = await fetch("https://apis.data.go.kr/1613000/TrainInfo/GetStrtpntAlocFndTrainInfo?serviceKey=" + encodeURIComponent(env.DATA_GO_KR || "")
      + "&_type=json&numOfRows=200&depPlaceId=" + dep + "&arrPlaceId=" + arr + "&depPlandTime=" + d);
    if (!r.ok) return out({ ok: false, err: "http " + r.status });
    const j = await r.json();
    let it = (((j.response || {}).body || {}).items || {}).item || [];
    if (!Array.isArray(it)) it = [it];
    const items = it.map(x => ({ g: x.traingradename, no: x.trainno, dp: String(x.depplandtime).slice(8, 12), ar: String(x.arrplandtime).slice(8, 12), fare: +x.adultcharge || 0 }));
    const o = { ok: true, items };
    ctx.waitUntil(caches.default.put(key, new Response(JSON.stringify(o), { headers: { "Cache-Control": "public, max-age=1800" } })));
    return out(o);
  } catch (e) { return out({ ok: false, err: "fetch" }); }
}
// 일·중 화면 (10-18) — 앱이 &lang=en&ul=ja|zhs|zht 를 붙인다. 셋 말고는 버린다(=영어 그대로)
function kpUlDone(a) { return a.filter(function (it) { return it.name_en; }).length >= Math.ceil(a.length * 0.8); }   // 일·중은 8할 넘게 옮겨졌을 때만 하루 저장 (반쯤 한국어인 결과가 하루 내내 남지 않게, 10-18)
function kpUl(sp) { const u = sp.get("lang") === "en" ? String(sp.get("ul") || "") : ""; return /^(ja|zhs|zht|es)$/.test(u) ? u : ""; }   // es 스페인어 (10-22)
// 이름·종류는 그 언어로, 주소는 영어로. 결과는 영어와 같은 칸(name_en·addr_en·cat_en)에 넣어 앱은 그대로 쓴다. 캐시 키는 언어별로 따로
const PLACE_UL = {
  ja: "Japanese, as Japanese tourists see it on Japanese travel sites and Google Maps in Japanese. Famous places use their established Japanese names (경복궁 -> 景福宮, 명동 -> 明洞, 남대문시장 -> 南大門市場, 강남역 2호선 -> 江南駅（2号線）, 북촌한옥마을 -> 北村韓屋村). " +
    "Restaurants and shops: katakana reading of the Korean name, followed by the kanji meaning in parentheses when the name has an obvious Sino-Korean reading (명동교자 -> ミョンドンギョジャ(明洞餃子), 토속촌삼계탕 -> トソッチョン参鶏湯). Brands in their usual Japanese form (스타벅스 -> スターバックス, 올리브영 -> オリーブヤング, 롯데 -> ロッテ, CU -> CU, GS25 -> GS25). " +
    "Translate generic words: 약국 -> 薬局, 병원 -> 病院, 의원 -> クリニック, 치과 -> 歯科, 피부과 -> 皮膚科, 한의원 -> 韓医院, 마트 -> マート, 역 -> 駅, 점/지점 -> 店, 시장 -> 市場, 호텔 -> ホテル. Category in short Japanese (e.g. 地下鉄駅, カフェ, 薬局, 韓国料理).",
  zhs: "Simplified Chinese, as mainland Chinese tourists see it (Dianping / Ctrip style). Famous places use their established Chinese names (경복궁 -> 景福宫, 명동 -> 明洞, 동대문 -> 东大门, 남대문시장 -> 南大门市场, 강남역 2호선 -> 江南站（2号线）). " +
    "Restaurants and shops: use the Hanja meaning when the name is Sino-Korean (명동교자 -> 明洞饺子, 토속촌삼계탕 -> 土俗村参鸡汤), otherwise a common Chinese transliteration. Brands in their usual Chinese form (스타벅스 -> 星巴克, 롯데 -> 乐天, 신세계 -> 新世界, 올리브영 -> Olive Young, CU -> CU). " +
    "Translate generic words: 약국 -> 药店, 병원 -> 医院, 의원 -> 诊所, 치과 -> 牙科, 피부과 -> 皮肤科, 한의원 -> 韩医院, 마트 -> 超市, 역 -> 站, 점/지점 -> 店, 시장 -> 市场, 호텔 -> 酒店. Category in short Simplified Chinese (e.g. 地铁站, 咖啡厅, 药店, 韩餐).",
  zht: "Traditional Chinese as used in Taiwan, as Taiwanese tourists see it. Famous places use their established Chinese names (경복궁 -> 景福宮, 명동 -> 明洞, 동대문 -> 東大門, 남대문시장 -> 南大門市場, 강남역 2호선 -> 江南站（2號線）). " +
    "Restaurants and shops: use the Hanja meaning when the name is Sino-Korean (명동교자 -> 明洞餃子, 토속촌삼계탕 -> 土俗村蔘雞湯), otherwise a common Chinese transliteration. Brands in their usual Taiwanese form (스타벅스 -> 星巴克, 롯데 -> 樂天, 신세계 -> 新世界, 올리브영 -> Olive Young, CU -> CU). " +
    "Translate generic words with Taiwan usage: 약국 -> 藥局, 병원 -> 醫院, 의원 -> 診所, 치과 -> 牙科, 피부과 -> 皮膚科, 한의원 -> 韓醫院, 마트 -> 超市, 역 -> 站, 점/지점 -> 店, 시장 -> 市場, 호텔 -> 飯店. Category in short Traditional Chinese (e.g. 捷運站, 咖啡廳, 藥局, 韓式料理).",
  es: "neutral Spanish, as Spanish-speaking tourists see it on Google Maps in Spanish. Place names keep the official romanized (Revised Romanization) name, with generic words in Spanish (경복궁 -> Palacio Gyeongbokgung, 명동 -> Myeongdong, 남대문시장 -> Mercado de Namdaemun, 강남역 2호선 -> Estación Gangnam (línea 2), 북촌한옥마을 -> Aldea Hanok de Bukchon). " +
    "Restaurants and shops: Revised Romanization of the Korean name (명동교자 -> Myeongdong Kyoja, 토속촌삼계탕 -> Tosokchon Samgyetang). Brands in their usual Latin form (스타벅스 -> Starbucks, 올리브영 -> Olive Young, 롯데 -> Lotte, CU -> CU, GS25 -> GS25). " +
    "Translate generic words: 약국 -> Farmacia, 병원 -> Hospital, 의원 -> Clínica, 치과 -> Dentista, 피부과 -> Dermatología, 한의원 -> Medicina tradicional coreana, 마트 -> Supermercado, 역 -> Estación, 점/지점 -> Sucursal, 시장 -> Mercado, 호텔 -> Hotel. Category in short Spanish (e.g. Estación de metro, Cafetería, Farmacia, Comida coreana)."
};
// 한글 → 로마자 (국어의 로마자 표기법 기본꼴, 받침 이어 읽기 없이 글자 단위) — 일·중 화면의 마지막 안전망 (10-18)
function romanKo(s) {
  const I = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"], M = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"],
    F = ["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
  const o = String(s || "").replace(/[가-힣]+/g, function (w, at, all) { let r = ""; for (const ch of w) { const c = ch.charCodeAt(0) - 0xAC00; r += I[Math.floor(c / 588)] + M[Math.floor((c % 588) / 28)] + F[c % 28]; } return at === 0 || /[\s(（·]/.test(all.charAt(at - 1)) ? r.charAt(0).toUpperCase() + r.slice(1) : r; });
  return o.replace(/[ㄱ-ㆎ]/g, "").replace(/\s{2,}/g, " ").trim();
}
async function placeTranslateUl(env, items, ul) {
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const arr = new Array(items.length).fill(null);
  // 한글이 섞여 오면 버리지 말고 한글 괄호·글자만 걷어 낸다 — 식당 이름은 원문을 괄호로 붙여 오는 일이 잦아 한 목록이 통째로 한국어로 보였다 (10-18 시험)
  const noHg = function (s) { return String(s || "").replace(/[(（][^)）]*[가-힣][^)）]*[)）]/g, "").replace(/[가-힣]+/g, "").replace(/\s{2,}/g, " ").replace(/^[\s·\-–—,]+|[\s·\-–—,]+$/g, ""); };
  const ask = async function (idx) {
    const list = idx.map(function (k, i) { const it = items[k]; return i + " ||| " + it.name + " ||| " + it.addr + " ||| " + String(it.cat || "").split(">").pop().trim(); }).join("\n");
    const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 3000, thinking: { type: "disabled" }, /* 생각에 토큰을 다 써 빈 답이 왔다 (10-18) */ messages: [{ role: "user", content:
      "Korean map search results for foreign tourists. For each line give the place name and category in " + PLACE_UL[ul] + " " +
      "Never leave Hangul in the name or category, and do not add the Korean original in parentheses. The address stays in English like 'Yeoksam-dong 858, Gangnam-gu, Seoul'. " +
      "Also give the English name (official English name if it exists, loanwords back to English like 식스 -> Six, otherwise Revised Romanization). " +
      "The second field must be written in the target language's own script (" + (ul === "ja" ? "katakana/kanji, e.g. 고래 환전소 -> コレ両替所, 머니박스 -> マネーボックス" : ul === "es" ? "Latin script with Spanish generic words, e.g. 고래 환전소 -> Casa de cambio Gorae, 머니박스 -> Money Box" : "Chinese characters, e.g. 고래 환전소 -> 鲸鱼换钱所, 머니박스 -> Money Box") + ") — never copy the Korean input as it is. " +
      "Input: <id> ||| <name> ||| <address> ||| <category>. Answer one line per input, nothing else:\n<id> ||| <name> ||| <English name> ||| <English address> ||| <category>\n\n" + list }] });
    const txt = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("");
    txt.split("\n").forEach(function (ln) { const q = ln.replace(/^[\s\-*•]+/, "").split(/\s*(?:\|\|\||｜｜｜)\s*/).map(function (v) { return v.trim(); }); if (q.length < 4) return; const i = parseInt(q[0].replace(/[^0-9]/g, ""), 10);
      // 일·중 이름 옆에 영어 이름도 붙인다 — AI 가 가게 이름 소리를 잘못 옮기는 일이 있어서 (사장님 10-18 「가」)
      // 한글을 그대로 베껴 온 이름은 버리고 영어 이름만 쓴다 — 한글을 걷어 내면 「2」「K」 같은 조각만 남았다 (10-18 환전소)
      // AI 가 한글 원래 이름을 맨 앞에 되풀이해 칸이 하나씩 밀리는 일이 있다 (일본어, 10-18) — 다음 칸이 일·중 글자면 그 한글 칸을 뺀다
      let r = q.slice(1); if (r.length >= 4 && /[가-힣]/.test(r[0]) && /[^\x20-\x7e]/.test(r[1]) && !/[가-힣]/.test(r[1])) r = r.slice(1);
      const r4 = r.length >= 4, en0 = r4 ? noHg(r[1]) : "", en = /^[\x20-\x7e]+$/.test(en0) ? en0 : "", raw = String(r[0] || "").replace(/[(（][^)）]*[가-힣][^)）]*[)）]/g, "");
      const n0 = /[가-힣]/.test(raw) ? "" : noHg(raw).replace(/^(.+?)\s*[(（]\1[)）]$/, "$1"), n = n0 && en && ul !== "es" && en.toLowerCase() !== n0.toLowerCase() ? n0 + " · " + en : (n0 || en);
      if (i >= 0 && i < idx.length && n && !arr[idx[i]]) arr[idx[i]] = { n: n.slice(0, 160), a: noHg(r[r4 ? 2 : 1]).slice(0, 200), c: noHg(r[r4 ? 3 : 2]).slice(0, 40) }; });
  };
  await ask(items.map(function (x, i) { return i; }));
  const miss = arr.map(function (x, i) { return x ? -1 : i; }).filter(function (i) { return i >= 0; });
  if (miss.length) { try { await ask(miss); } catch (e) {} }   // 빠진 것만 한 번 더
  // 일·중 화면엔 어떤 경우든 한글 이름을 내보내지 않는다 — 그래도 빠진 것은 영어 번역, 그것도 안 되면 로마자 (사장님 10-18)
  const miss2 = arr.map(function (x, i) { return x ? -1 : i; }).filter(function (i) { return i >= 0; });
  if (miss2.length) { try { const t = await placeTranslate(env, miss2.map(function (i) { return items[i]; }), ""); if (t) miss2.forEach(function (k, j) { if (t[j]) arr[k] = { n: t[j].n, a: t[j].a, c: "" }; }); } catch (e) {} }
  items.forEach(function (it, k) { if (!arr[k]) arr[k] = { n: romanKo(it.name), a: romanKo(it.addr || ""), c: "" }; else if (/[가-힣]/.test(arr[k].n)) arr[k].n = romanKo(arr[k].n); });
  return arr;
}
// 장소 이름·주소·종류 영어로 — 외국인 손님용 (공식 영문 표기·로마자, 2026-10-15)
// 선물 고르기 가게 이름 → en·ja·zhs·zht (10-21 2차). 브랜드는 허브가 GS_BR 사전으로 미리 바꿔 넣는다(한글이 아닌 부분은 그대로 두게 한다)
async function gsNamesAi(env, lang, names) {
  const out = new Array(names.length).fill(null);
  if (!env.CLAUDE_KEY || !names.length) return out;
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const spec = lang === "en" ? "English. Translate generic words (점/지점 -> Branch, 본점 -> Main Store, 마트 -> Mart, 기념품 -> Souvenirs, 공예 -> Crafts, 한복 -> Hanbok, 전통차 -> Traditional Tea, 찻집 -> Teahouse, 문구 -> Stationery); loanwords written in Hangul go back to English (스토어 -> Store, 플래그십 -> Flagship); Korean proper names and place names in Revised Romanization (명동 -> Myeongdong)."
    : PLACE_UL[lang] + " Shop names that are just Korean words with no Hanja reading: write the sound in " + (lang === "ja" ? "katakana" : lang === "es" ? "Revised Romanization (generic words in Spanish)" : "Chinese characters only if a common transliteration exists, otherwise Revised Romanization") + ".";
  const parts = []; for (let i = 0; i < names.length; i += 20) parts.push(i);
  await Promise.all(parts.map(async function (st) {
    const sl = names.slice(st, st + 20);
    const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 2000, thinking: { type: "disabled" }, messages: [{ role: "user", content:
      "These are names of shops in Korea (cosmetics, souvenirs, tea, snacks, character goods, stationery) shown to foreign tourists. Write each shop name in " + spec + " " +
      "Keep any part that is already not Hangul (brand names like OLIVE YOUNG, オリーブヤング, 正官庄, ARTBOX) exactly as it is. Translate or transliterate only the Hangul parts. Never output Hangul and do not add the Korean original. " +
      "Each input line is <id> ||| <name>. Answer with exactly one line per input, nothing else:\n<id> ||| <name>\n\n" + sl.map(function (n, i) { return i + " ||| " + n; }).join("\n") }] });
    r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n").forEach(function (ln) {
      const q = ln.split(/\s*(?:\|\|\||｜｜｜)\s*/); if (q.length < 2) return; const i = parseInt(q[0].replace(/\D/g, ""), 10), v = q.slice(1).join(" ").trim();
      if (i >= 0 && i < sl.length && v && !/[가-힣]/.test(v)) out[st + i] = v.slice(0, 80); }); }));
  return out;
}
async function placeTranslate(env, items, ul) {
  if (!env.CLAUDE_KEY || !items.length) return null;
  if (ul && PLACE_UL[ul]) return placeTranslateUl(env, items, ul);   // 일·중 (10-18)
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const list = items.map(function (it, i) { return i + " ||| " + it.name + " ||| " + it.addr + " ||| " + String(it.cat || "").split(">").pop().trim(); }).join("\n");
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 3000, messages: [{ role: "user", content:
    "Korean map search results for foreign tourists. For each line give the English place name, English address and English category. " +
    "Use official English names when they exist (e.g. 강남역 2호선 -> Gangnam Station (Line 2), 경복궁 -> Gyeongbokgung Palace); brands in their usual English form (올리브영 -> Olive Young, 롯데슈퍼 -> Lotte Super); otherwise Revised Romanization. " +
    "Never romanize generic words inside a name — translate them: 약국 -> Pharmacy, 의원 -> Clinic, 병원 -> Hospital, 치과 -> Dental, 내과 -> Internal Medicine, 피부과 -> Dermatology, 안과 -> Eye, 이비인후과 -> ENT, 정형외과 -> Orthopedics, 소아청소년과/소아과 -> Pediatrics, 산부인과 -> OB/GYN, 성형외과 -> Plastic Surgery, 비뇨기과/비뇨의학과 -> Urology, 한의원 -> Korean Medicine Clinic, 응급의료센터 -> Emergency Center, 마트 -> Mart, 슈퍼 -> Supermarket, 점/지점 -> Branch, 역 -> Station. " +
    "Loanwords written in Hangul go back to English (굿 -> Good, 클래식 -> Classic, 덴티스타 -> Dentista). Examples: 굿약국 -> Good Pharmacy, 명동하나약국 -> Myeongdong Hana Pharmacy, 라임나무치과병원 -> Limenamu Dental Hospital, 아름다운나라피부과의원 -> Areumdaun Nara Dermatology Clinic, CU 명동본점 -> CU Myeongdong Main Branch. " +
    "Address like 'Yeoksam-dong 858, Gangnam-gu, Seoul'. Category one or two words (e.g. Subway station, Bank, Cafe). " +
    "Input: <id> ||| <name> ||| <address> ||| <category>. Answer one line per input, nothing else:\n<id> ||| <English name> ||| <English address> ||| <English category>\n\n" + list }] });
  const txt = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("");
  const arr = new Array(items.length).fill(null);
  txt.split("\n").forEach(function (ln) { const q = ln.split("|||").map(function (v) { return v.trim(); }); if (q.length < 4) return; const i = parseInt(q[0].replace(/[^0-9]/g, ""), 10);
    if (i >= 0 && i < items.length && q[1] && !isKo(q[1])) arr[i] = { n: q[1], a: q[2], c: q[3] }; });
  return arr.some(Boolean) ? arr : null;
}
// 외국인이 소리 나는 대로 친 영어 검색어 → 가장 그럴듯한 한국 장소 이름(한글) 하나 (2026-10-15)
async function queryToKo(env, q) {
  if (!env.CLAUDE_KEY || !q) return {};
  const client = new Anthropic({ apiKey: env.CLAUDE_KEY });
  const r = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 600, messages: [{ role: "user", content:
    "A foreign tourist in Korea typed this into a map search box. It may be a misspelled or non-standard romanization of a Korean place, food, station or brand name, plain English, or Japanese/Chinese (e.g. 景福宮 -> 경복궁, 明洞 -> 명동, 弘大 -> 홍대, 东大门 -> 동대문, 参鶏湯 -> 삼계탕). " +
    "Romanizations vary a lot (oo/u, k/g, p/b, ch/j, eo/u/o, ng/n, missing letters). Sound it out and give up to 3 likely Korean search queries in Hangul, most likely first, one per line, Hangul only (no romanization, no explanation). " +
    "Always answer with your best guesses even if unsure; never answer with anything but Hangul lines.\n" +
    "Examples: Bookchangdong -> 북창동 | Pukchangdong -> 북창동 | gyungbokgung -> 경복궁 | namdemun market -> 남대문시장 | myungdong kyoja -> 명동교자 | bibimbab -> 비빔밥\n\nInput: " + q }] });
  const ls = r.content.filter(function (x) { return x.type === "text"; }).map(function (x) { return x.text; }).join("").split("\n")
    .map(function (v) { return v.replace(/[^가-힣0-9 ]/g, "").trim(); }).filter(function (v) { return v.length >= 2; }).slice(0, 3);
  return ls.length ? { ko: ls[0], list: ls } : { err: "noko " + r.stop_reason + " " + JSON.stringify(r.content).slice(0, 120) };
}
// 외국인 쇼핑 검색어 사전 (10-16) — kpop 은 일반 단어로 카카오에 안 나와서 실제 굿즈 매장 이름들을 합친다(카카오 서울 결과 확인한 이름만)
const KP_BAD = /노래방|노래연습장|주점|술집|호프|클럽|나이트|단란|유흥|성인/;
const KP_SHOPQ = /goods|shop|store|merch|souvenir|cosmetic|album|duty|굿즈|상품|기념품|면세|화장품|쇼핑|앨범|음반/i;   // 쇼핑 계열 검색이면 노래방·주점 결과 뺀다
const KP_DICT = [
  { re: /^(k[ -]?pop|korean pop)( (goods|store|stores|shop|shops|merch|merchandise|album|albums|album shop|album store|idol goods))?$|^(album|k[ -]?pop album) (shop|store)s?$|^idol goods$/i, label: "케이팝 굿즈",
    ko: ["케이타운포유", "위드뮤", "케이팝프렌즈", "케이메카", "케이팝팔레트", "케이팝몰", "KSTORM", "케이팝스퀘어", "뮤직코리아", "케이팝"], near: 1, keep: /음반|레코드|디자인문구|취미용품/ },
  { re: /^duty[ -]?free( (shop|shops|store|stores))?$|^dutyfree$/i, label: "면세점", ko: ["면세점"] },
  { re: /^(korean |k-?)?(cosmetics?|beauty|skin ?care|make ?up)( (shop|shops|store|stores))?$|^sheet masks?$/i, label: "화장품", ko: ["화장품"], near: 1 },
  { re: /^(korean |red )?ginseng( (shop|shops|store|stores))?$/i, label: "인삼", ko: ["인삼", "홍삼"], near: 1 },
  { re: /^(korean )?souvenirs?( (shop|shops|store|stores))?$|^gift ?shops?$/i, label: "기념품", ko: ["기념품"], near: 1 }
];
// ── 내비 숙소 (사장님 10-16) — 카카오 숙박(AD5)을 호텔·모텔·게스트하우스·한옥으로 나누고,
//    한국관광공사 국문 관광정보(KorService2 locationBasedList2, 숙박 32)와 이름·100m 로 맞춰 kto=1 (관광공사 관광정보에 실린 숙소).
//    관광공사에만 있는 숙소도 넣는다. 종류마다 가까운 순 12곳까지. 좌표는 부른 쪽에서 이미 100m 로 깎은 값
function stayKind(c, n) { const s = (c || "") + " " + (n || "");
  if (/한옥/.test(s)) return "hanok";
  if (/게스트하우스|호스텔|민박|홈스테이|백팩커|guest ?house|hostel|backpacker/i.test(s)) return "gh";
  if (/모텔|여관|여인숙/.test(s)) return "motel";
  if (/호텔|리조트|콘도|레지던스|hotel|resort|residence/i.test(s)) return "hotel";
  return "etc"; }
const KTO_KIND = { B02010100: "hotel", B02010500: "hotel", B02011300: "hotel", B02010900: "motel", B02010600: "gh", B02011000: "gh", B02011100: "gh", B02011200: "gh", B02011600: "hanok" };
function stayNorm(s) { return String(s || "").replace(/\([^)]*\)/g, "").replace(/[\s·().,'’&\-_]/g, "").toLowerCase(); }
function llM(a, b, c, d) { const R = 6371000, r = Math.PI / 180, dl = (c - a) * r, dn = (d - b) * r, h = Math.sin(dl / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
async function stayMix(env, items, rx, ry, r2) {
  items.forEach(function (it) { it.kind = stayKind(it.cat, it.name); });
  let kto = [];
  try { const r = await fetch("https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=" + encodeURIComponent(env.DATA_GO_KR || "") + "&MobileOS=ETC&MobileApp=navi&_type=json&numOfRows=100&pageNo=1&contentTypeId=32&arrange=E&mapX=" + rx + "&mapY=" + ry + "&radius=" + Math.min(r2, 20000));
    if (r.ok) { const j = await r.json(); let a = ((((j || {}).response || {}).body || {}).items || {}).item || []; if (!Array.isArray(a)) a = [a]; kto = a; } } catch (e) {}
  kto.forEach(function (k) { const ky = +k.mapy, kx = +k.mapx; if (!ky || !kx) return; const kn = stayNorm(k.title), kn2 = stayNorm(String(k.title || "").replace(/^[^(]*\(|\)$/g, ""));
    let hit = null;
    items.forEach(function (it) { if (hit || it.kto) return; if (llM(ky, kx, +it.y, +it.x) > 100) return; const n = stayNorm(it.name);
      if (n && kn && (n.indexOf(kn) >= 0 || kn.indexOf(n) >= 0 || (n.length >= 3 && kn.slice(0, 3) === n.slice(0, 3)) || (kn2 && (n.indexOf(kn2) >= 0 || kn2.indexOf(n) >= 0)))) hit = it; });
    if (hit) { hit.kto = 1; if (hit.kind === "etc" && KTO_KIND[k.cat3]) hit.kind = KTO_KIND[k.cat3]; if (!hit.tel && k.tel) hit.tel = k.tel; return; }
    const kind = KTO_KIND[k.cat3] || stayKind("", k.title); if (kind === "etc") return;
    items.push({ name: String(k.title || "").trim(), x: String(kx), y: String(ky), addr: k.addr1 || "", cat: "여행 > 숙박 > " + ({ hotel: "호텔", motel: "모텔", gh: "게스트하우스", hanok: "한옥" })[kind], tel: (k.tel || "").split(/[,\/]/)[0].trim() || undefined, kind: kind, kto: 1 }); });
  items.forEach(function (it) { it._d = llM(+ry, +rx, +it.y, +it.x); });
  items.sort(function (a, b) { return a._d - b._d; });
  const cnt = {}; const out = items.filter(function (it) { if (it.kind === "etc") return false; cnt[it.kind] = (cnt[it.kind] || 0) + 1; return cnt[it.kind] <= 12; });
  out.forEach(function (it) { delete it._d; }); return out;
}
// ── 구글 장소 검색 (Places API (New) Text Search) — 내비 「추천받기」 유명한 곳 (사장님 2026-10-20) ──
//  · 별점 4.0 미만·리뷰 20개 미만은 거르고(10-20 30→20), 유명도 = 별점 × log10(리뷰 수) 순. 거리는 순서에 안 쓴다(위치는 받지 않음, 거리는 화면에서)
//  · 리뷰 본문은 안 받는다(비쌈) · 결과 캐시 7일(약관 30일 넘기지 말 것) · 하루 호출 상한 GP_DAY_CAP — 넘으면 err:"cap" → 앱이 카카오로
//  · 키 = 비밀값 GOOGLE_PLACES_KEY (없으면 err:"nokey" → 앱이 카카오로)
const GP_DAY_CAP = 500;
async function gPlace(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" });
  const sp = new URL(request.url).searchParams, q = (sp.get("q") || "").trim().slice(0, 60);
  const lc = { ko: "ko", en: "en", ja: "ja", zhs: "zh-CN", zht: "zh-TW", es: "es" }[sp.get("lang") || "ko"] || "ko";
  if (!q) return out({ ok: false, err: "bad" });
  if (!env.GOOGLE_PLACES_KEY) return out({ ok: false, err: "nokey" });
  // 손님 위치(10-20 사장님 「위치를 보내는 거로」 — 데모) · 0.1도(약 10km)로 뭉개 캐시를 같이 쓴다
  let la = Math.round(+sp.get("lat") * 10) / 10, lo = Math.round(+sp.get("lng") * 10) / 10;
  const hasLL = isFinite(la) && isFinite(lo) && la > 33 && la < 39 && lo > 124 && lo < 132;
  const all = sp.get("all") === "1";   // all=1 — 별점 거르기 없이(내비 검색 별점 붙이기용, 사장님 10-23)
  const ck = new Request("https://gplace.cache/v3/?q=" + encodeURIComponent(q) + "&l=" + lc + (hasLL ? "&ll=" + la + "," + lo : "") + (all ? "&all=1" : ""));
  const hit = await caches.default.match(ck);
  if (hit) return out(await hit.json(), "public, max-age=3600");
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  try { const c = await (await env.AIP.get(env.AIP.idFromName("gplace-cnt")).fetch("https://aip/gcnt", { method: "POST", body: JSON.stringify({ day: day, cap: GP_DAY_CAP }) })).json();
    if (!c || !c.ok) return out({ ok: false, err: "cap" }); } catch (e) { return out({ ok: false, err: "cap" }); }
  let j;
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri" },
      body: JSON.stringify({ textQuery: q, languageCode: lc, regionCode: "KR", pageSize: 20, ...(hasLL ? { locationBias: { circle: { center: { latitude: la, longitude: lo }, radius: 30000 } } } : { locationRestriction: { rectangle: { low: { latitude: 33.0, longitude: 124.5 }, high: { latitude: 38.7, longitude: 131.0 } } } }) }) });
    if (!r.ok) return out({ ok: false, err: "http " + r.status });
    j = await r.json();
  } catch (e) { return out({ ok: false, err: "fetch" }); }
  const items = (j.places || []).filter(function (p) { return p && p.location && (all || ((+p.rating || 0) >= 4.0 && (+p.userRatingCount || 0) >= 20)); })
    .map(function (p) { return { id: p.id, name: (p.displayName && p.displayName.text) || "", addr: p.formattedAddress || "", lat: p.location.latitude, lng: p.location.longitude, rating: +p.rating || 0, n: +p.userRatingCount || 0, uri: p.googleMapsUri || "", s: (+p.rating || 0) * Math.log10((+p.userRatingCount || 0) + 1) }; })
    .sort(function (a, b) { return b.s - a.s; });
  // 위치가 있으면 40km 안을 먼저(유명한 순). 40km 안이 3곳 이상이면 먼 곳은 뺀다 — 다른 도시 식당·호텔 안 나오게. 모자라면(템플스테이 등) 먼 곳을 뒤에 붙인다
  let fin = items;
  if (hasLL) { const dk = function (p) { const R = 6371, rd = Math.PI / 180, x = (p.lat - la) * rd, y = (p.lng - lo) * rd, h = Math.sin(x / 2) ** 2 + Math.cos(la * rd) * Math.cos(p.lat * rd) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const near = items.filter(function (p) { return dk(p) <= 40; }), far = items.filter(function (p) { return dk(p) > 40; });
    fin = near.length >= 3 ? near : near.concat(far); }
  const o = { ok: true, items: fin };
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=604800" } })));   // 7일
  return out(o, "public, max-age=3600");
}
// ── 구글 장소 사진 (Places API (New)) — 내비 안내 카드 빈자리에 그 장소 사진 한 장 (사장님 2026-10-23) ──
//  · /gphoto?q=이름&lat=&lng= → 그 자리 1.5km 안 구글 장소를 찾아 첫 사진 { ok, img:"/gphoto/img?n=…", attr:[찍은 사람], uri } · 못 찾으면 ok:false
//  · /gphoto/img?n=places/…/photos/… → 사진 그대로 넘김(키는 서버에만). 구글 약관: 사진은 오래 저장하지 않는다 — 브라우저 1시간만
//  · 찾기·사진 모두 하루 상한 GP_DAY_CAP(/gplace 와 같이 셈)
async function gPhoto(request, env, ctx) {
  const origin = request.headers.get("Origin") || "", u = new URL(request.url);
  const okO = mpOrigin(origin);
  const H = { "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!env.GOOGLE_PLACES_KEY) return out({ ok: false, err: "nokey" });
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const cap = async function () { try { const c = await (await env.AIP.get(env.AIP.idFromName("gplace-cnt")).fetch("https://aip/gcnt", { method: "POST", body: JSON.stringify({ day: day, cap: GP_DAY_CAP }) })).json(); return !!(c && c.ok); } catch (e) { return false; } };
  if (u.pathname === "/gphoto/img") {   // <img> 는 Origin 을 안 보낸다 — 이름 꼴만 확인
    const n = u.searchParams.get("n") || "";
    if (!/^places\/[A-Za-z0-9_-]{10,}\/photos\/[A-Za-z0-9_-]{10,}$/.test(n)) return new Response("bad", { status: 400 });
    if (!(await cap())) return new Response("cap", { status: 429 });
    const r = await fetch("https://places.googleapis.com/v1/" + n + "/media?maxWidthPx=800&key=" + encodeURIComponent(env.GOOGLE_PLACES_KEY));
    if (!r.ok) return new Response("http " + r.status, { status: 502 });
    return new Response(r.body, { headers: { "Content-Type": r.headers.get("Content-Type") || "image/jpeg", "Cache-Control": "private, max-age=3600", "Access-Control-Allow-Origin": "*" } });
  }
  if (!okO) return out({ ok: false, err: "origin" });
  const q = (u.searchParams.get("q") || "").trim().slice(0, 60), la = +u.searchParams.get("lat"), lo = +u.searchParams.get("lng");
  if (!q || !(la > 33 && la < 39 && lo > 124 && lo < 132)) return out({ ok: false, err: "bad" });
  const ck = new Request("https://gphoto.cache/v1/?q=" + encodeURIComponent(q) + "&ll=" + la.toFixed(4) + "," + lo.toFixed(4));
  const hit = await caches.default.match(ck);
  if (hit) return out(await hit.json(), "public, max-age=600");
  if (!(await cap())) return out({ ok: false, err: "cap" });
  let j;
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos,places.googleMapsUri" },
      body: JSON.stringify({ textQuery: q, languageCode: "ko", regionCode: "KR", pageSize: 5, locationBias: { circle: { center: { latitude: la, longitude: lo }, radius: 1500 } } }) });
    if (!r.ok) return out({ ok: false, err: "http " + r.status });
    j = await r.json();
  } catch (e) { return out({ ok: false, err: "fetch" }); }
  const dk = function (p) { const R = 6371, rd = Math.PI / 180, x = (p.latitude - la) * rd, y = (p.longitude - lo) * rd, h = Math.sin(x / 2) ** 2 + Math.cos(la * rd) * Math.cos(p.latitude * rd) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const p = (j.places || []).filter(function (x) { return x && x.location && x.photos && x.photos.length && dk(x.location) <= 1.5; })
    .sort(function (a, b) { return dk(a.location) - dk(b.location); })[0];   // 그 자리에서 가장 가까운 곳(1.5km 안) — 이름 같은 다른 동네 가게를 안 집는다
  let o = { ok: false, err: "none" };
  if (p) { const ph = p.photos[0];
    o = { ok: true, img: "/gphoto/img?n=" + ph.name, attr: (ph.authorAttributions || []).map(function (a) { return { n: a.displayName || "", u: a.uri || "" }; }).slice(0, 2), uri: p.googleMapsUri || "" }; }
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=21600" } })));   // 찾은 결과만 6시간(사진 이름은 오래 두지 않는다)
  return out(o, "public, max-age=600");
}
// ── 구글 근처 음식점 (Places API (New) Nearby Search) — 내비 편의시설 「음식점」 (사장님 2026-10-21) ──
//  · 손님 위치 둘레 1.5km 음식점 20곳, 가까운 순(구글 rankPreference DISTANCE) + 별점·리뷰 수. 차례(가까운 곳 먼저, 비슷한 거리는 별점순)는 화면이 정한다
//  · 위치는 0.003도(약 300m)로 깎아서만 쓰고(캐시 키 포함) 원값은 남기지 않는다 · 캐시 1일 · 하루 상한은 /gplace 와 같은 GP_DAY_CAP 을 함께 쓴다
//  · type= (10-22 「여행사」 추가) — 허용 목록 GN_TYPES 만. 없으면 restaurant(옛 앱 그대로, 캐시 키도 그대로)
//    travel_agency: 구글 travel_agency·tour_agency, 이름난 순(POPULARITY — 가까운 순은 별점 없는 해외여행 판매점만 나와서) 3km → 5곳 미만이면 10km → 30km.
//    대표 종류(primaryType)가 여행사·투어 회사인 곳만 (관광안내소·양조장 따위 뺌). 응답 r = 쓴 반경(m)
const GN_TYPES = {
  restaurant: { inc: ["restaurant"], rk: "DISTANCE", rs: [1500], min: 0 },
  travel_agency: { inc: ["travel_agency", "tour_agency"], rk: "POPULARITY", rs: [3000, 10000, 30000], min: 5, prim: /^(travel_agency|tour_agency)$/, kw: "day tour" }
};
//    + 10-22 「당일 투어」: 쓴 반경(r) 네모 안을 구글 Text Search 「day tour」로 한 번 더 → 같은 place_id 는 하나로, 키워드로 잡힌 곳은 dt:1 (외국인 당일 투어 회사).
//      한국인 해외여행 대리점만 나오던 것 보완. 하루 상한 GP_DAY_CAP 에 한 번 더 센다(상한이면 키워드만 건너뜀) · 캐시 키 v2(&dt) · 1일
async function gNear(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" });
  if (!env.GOOGLE_PLACES_KEY) return out({ ok: false, err: "nokey" });
  const sp = new URL(request.url).searchParams;
  const tp = sp.get("type") || "restaurant", G = Object.prototype.hasOwnProperty.call(GN_TYPES, tp) ? GN_TYPES[tp] : null;
  if (!G) return out({ ok: false, err: "bad" });
  const lc = { ko: "ko", en: "en", ja: "ja", zhs: "zh-CN", zht: "zh-TW", es: "es" }[sp.get("lang") || "ko"] || "ko";
  const la = Math.round(+sp.get("lat") / 0.003) * 0.003, lo = Math.round(+sp.get("lng") / 0.003) * 0.003;
  if (!(isFinite(la) && isFinite(lo) && la > 33 && la < 39 && lo > 124 && lo < 132)) return out({ ok: false, err: "bad" });
  const ck = new Request("https://gnear.cache/v1/?l=" + lc + "&ll=" + la.toFixed(3) + "," + lo.toFixed(3) + (tp === "restaurant" ? "" : "&t=" + tp) + (G.kw ? "&dt=2" : ""));
  const hit = await caches.default.match(ck);
  if (hit) return out(await hit.json(), "public, max-age=3600");
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const gFM = "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.nationalPhoneNumber,places.primaryTypeDisplayName";
  const gMap = function (p) { const nm = (p.displayName && p.displayName.text) || "";
      return { id: p.id, name: nm, name_en: lc === "ko" ? "" : nm, addr: p.formattedAddress || "", addr_en: lc === "ko" ? "" : (p.formattedAddress || ""), y: p.location.latitude, x: p.location.longitude,
        rating: +p.rating || 0, n: +p.userRatingCount || 0, tel: p.nationalPhoneNumber || "", cat: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || "", cat_en: lc === "ko" ? "" : ((p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || ""), uri: p.googleMapsUri || "" }; };
  let items = [], rUsed = G.rs[0];
  for (let ri = 0; ri < G.rs.length; ri++) {
    const rad = G.rs[ri];
    try { const c = await (await env.AIP.get(env.AIP.idFromName("gplace-cnt")).fetch("https://aip/gcnt", { method: "POST", body: JSON.stringify({ day: day, cap: GP_DAY_CAP }) })).json();
      if (!c || !c.ok) { if (ri) break; return out({ ok: false, err: "cap" }); } } catch (e) { if (ri) break; return out({ ok: false, err: "cap" }); }
    let j;
    try {
      const r = await fetch("https://places.googleapis.com/v1/places:searchNearby", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": gFM + (G.prim ? ",places.primaryType,places.businessStatus" : "") },
        body: JSON.stringify({ includedTypes: G.inc, maxResultCount: 20, rankPreference: G.rk, languageCode: lc, regionCode: "KR", locationRestriction: { circle: { center: { latitude: la, longitude: lo }, radius: rad } } }) });
      if (!r.ok) { if (ri) break; return out({ ok: false, err: "http " + r.status }); }
      j = await r.json();
    } catch (e) { if (ri) break; return out({ ok: false, err: "fetch" }); }
    items = (j.places || []).filter(function (p) { return p && p.location && (!G.prim || (G.prim.test(p.primaryType || "") && p.businessStatus !== "CLOSED_PERMANENTLY")); }).map(gMap);
    rUsed = rad;
    if (items.length >= G.min) break;
  }
  if (G.kw) {   // 「day tour」 키워드 한 번 더 (10-22) — 실패·상한이면 근처 결과만
    let okC = false;
    try { const c = await (await env.AIP.get(env.AIP.idFromName("gplace-cnt")).fetch("https://aip/gcnt", { method: "POST", body: JSON.stringify({ day: day, cap: GP_DAY_CAP }) })).json(); okC = !!(c && c.ok); } catch (e) {}
    if (okC) try {
      const dLa = rUsed / 111000, dLo = dLa / Math.cos(la * Math.PI / 180);
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": gFM + ",places.primaryType,places.types,places.businessStatus" },
        body: JSON.stringify({ textQuery: G.kw, languageCode: lc, regionCode: "KR", pageSize: 20, locationRestriction: { rectangle: { low: { latitude: la - dLa, longitude: lo - dLo }, high: { latitude: la + dLa, longitude: lo + dLo } } } }) });
      if (r.ok) { const j = await r.json(), byId = {};
        items.forEach(function (it) { byId[it.id] = it; });
        (j.places || []).forEach(function (p) {
          if (!p || !p.location || p.businessStatus === "CLOSED_PERMANENTLY") return;
          if (!G.prim.test(p.primaryType || "") && !(p.types || []).some(function (t) { return G.prim.test(t); })) return;   // 여행사·투어 회사 종류가 붙은 곳만
          if (llM(la, lo, p.location.latitude, p.location.longitude) > rUsed) return;   // 네모 귀퉁이는 뺀다 (원 안만)
          if (byId[p.id]) { byId[p.id].dt = 1; return; }
          const it = gMap(p); it.dt = 1; byId[p.id] = it; items.push(it); });
      }
    } catch (e) {}
  }
  const o = { ok: true, items: items, r: rUsed };
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } })));   // 1일
  return out(o, "public, max-age=3600");
}
// ── 내비 「선물 고르기」 근처 가게 (사장님 2026-10-21 「카카오와 구글 둘 다, 돈이 들어도 양질의 정보」) ──
//  GET /gshop?lat=&lng=&kq=검색어|검색어&kc=MT1&gq=구글검색어&gt=구글종류&lang=  (navi 만)
//  · 카카오 키워드(·카테고리) 가까운 순 + 구글 Text Search(같은 둘레 네모, 가까운 순) → 같은 가게(이름 비슷 + 150m 안)는 하나로: 이름·주소·전화 = 카카오, 별점·리뷰 수 = 구글. 한쪽에만 있는 가게도 넣는다
//  · 반경 3km → 합쳐 3곳 미만이면 10km → 그래도 모자라면 30km (카카오는 20km 한도라 가운데+둘레 6곳) · 별점·리뷰 수 거르기 없음(작은 가게도)
//  · 같은 가게 (10-21 2차): 그 가게만의 전화번호가 같고 1km 안 → 먼저 묶고, 아니면 이름 비슷 + 150m (이름은 GS_BR 브랜드 사전으로 한글·영문 같게)
//  · 외국어 이름이 없는 가게는 브랜드 사전 + AI(AiProxy /gsnm, 이름마다 180일 저장)로 옮겨 name_l
//  · 외국어 화면: 구글을 한국어 + 그 언어 두 번 불러 같은 장소 id 로 그 언어 이름·주소를 붙인다
//  · 위치는 0.003도(약 300m)로 깎아서만 쓰고(캐시 키 포함) 원값은 남기지 않는다 · 캐시 1일 · 구글 하루 상한은 /gplace·/gnear 와 같은 GP_DAY_CAP 을 함께 쓴다 (넘으면 카카오만)
// 브랜드 짝 사전 (10-21 2차) — 한글·영문 이름을 같게 보고(묶기), 외국어 화면 이름에 그대로 쓴다. 공식 표기를 아는 것만 — 모르는 언어는 공식 로마자 상표(OLIVE YOUNG 따위)
const GS_BR = [
  { id: "emart24", re: /이마트\s*24|e-?mart\s*24/i, l: { en: "emart24", ja: "emart24", zhs: "emart24", zht: "emart24", es: "emart24" } },
  { id: "oliveyoung", re: /올리브\s*영|olive\s*young/i, l: { en: "OLIVE YOUNG", ja: "オリーブヤング", zhs: "OLIVE YOUNG", zht: "OLIVE YOUNG", es: "OLIVE YOUNG" } },
  { id: "cheongkwanjang", re: /정관장|cheong\s*kwan\s*jang|kgc\s*인삼공사|kgc/i, l: { en: "CheongKwanJang", ja: "正官庄", zhs: "正官庄", zht: "正官庄", es: "CheongKwanJang" } },
  { id: "kakaofriends", re: /카카오\s*프렌즈|kakao\s*friends/i, l: { en: "KAKAO FRIENDS", ja: "カカオフレンズ", zhs: "KAKAO FRIENDS", zht: "KAKAO FRIENDS", es: "KAKAO FRIENDS" } },
  { id: "linefriends", re: /라인\s*프렌즈|line\s*friends/i, l: { en: "LINE FRIENDS", ja: "ラインフレンズ", zhs: "LINE FRIENDS", zht: "LINE FRIENDS", es: "LINE FRIENDS" } },
  { id: "artbox", re: /아트\s*박스|art\s*box/i, l: { en: "ARTBOX", ja: "ARTBOX", zhs: "ARTBOX", zht: "ARTBOX", es: "ARTBOX" } },
  { id: "osulloc", re: /오설록|osulloc/i, l: { en: "OSULLOC", ja: "オソルロク", zhs: "OSULLOC", zht: "OSULLOC", es: "OSULLOC" } },
  { id: "emart", re: /이마트|e-?mart/i, l: { en: "E-MART", ja: "E-MART", zhs: "易买得", zht: "易買得", es: "E-MART" } },
  { id: "lottemart", re: /롯데\s*마트|lotte\s*mart/i, l: { en: "LOTTE MART", ja: "ロッテマート", zhs: "乐天玛特", zht: "樂天瑪特", es: "LOTTE MART" } },
  { id: "homeplus", re: /홈\s*플러스|home\s*plus/i, l: { en: "Homeplus", ja: "Homeplus", zhs: "Homeplus", zht: "Homeplus", es: "Homeplus" } },
  { id: "ktown4u", re: /케이타운포유|ktown4u/i, l: { en: "Ktown4u", ja: "Ktown4u", zhs: "Ktown4u", zht: "Ktown4u", es: "Ktown4u" } }
];
function gsBrand(s) { s = String(s || ""); for (const b of GS_BR) { const m = b.re.exec(s); if (m) return { b: b, m: m }; } return null; }
function gsNorm(s) { s = String(s || ""); const br = gsBrand(s); if (br) s = s.replace(br.m[0], " #" + br.b.id + "# ");
  return s.toLowerCase().replace(/[(（\[].*?[)）\]]/g, "").replace(/[\s·.,\-_'"&/]+/g, "").replace(/(본점|직영점|지점|점|store|branch|shop)$/, ""); }
// 전화번호 — 숫자만, +82 → 0. 같은 번호 = 끝이 같고 앞 차이가 지역번호(3자리 이하)뿐일 때
function gsTel(s) { let d = String(s || "").replace(/\D/g, ""); if (d.indexOf("82") === 0 && d.length >= 10) d = "0" + d.slice(2); return d.length >= 7 ? d : ""; }
function gsTelEq(a, b) { if (!a || !b) return false; if (a === b) return true; const L = a.length > b.length ? a : b, S = a.length > b.length ? b : a; return L.length - S.length <= 3 && L.slice(-S.length) === S && /^0\d{1,2}$/.test(L.slice(0, L.length - S.length)); }
function gsSim(a, b) { const ba = gsBrand(a), bb = gsBrand(b); a = gsNorm(a); b = gsNorm(b); if (!a || !b) return 0; if (ba && bb && ba.b.id !== bb.b.id) return 0; /* 브랜드가 다르면 딴 가게 (이마트24 ≠ 이마트) */ if (a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return 1;
  // 같은 브랜드인데 나머지(지점 이름)가 한쪽은 한글·한쪽은 영문이면 견줄 수 없다 → 비슷함 0.6 (150m 안만 짝지으므로 가까운 쪽이 이긴다)
  if (ba && bb && ba.b.id === bb.b.id) { const ra = a.replace("#" + ba.b.id + "#", ""), rb = b.replace("#" + bb.b.id + "#", ""); if (!ra || !rb || /[가-힣]/.test(ra) !== /[가-힣]/.test(rb)) return 0.6; }
  const bg = function (s) { const o = {}; for (let i = 0; i < s.length - 1; i++) o[s.slice(i, i + 2)] = (o[s.slice(i, i + 2)] || 0) + 1; return o; };
  const A = bg(a), B = bg(b); let n = 0, na = 0, nb = 0; for (const k in A) { na += A[k]; if (B[k]) n += Math.min(A[k], B[k]); } for (const k in B) nb += B[k];
  return na + nb ? 2 * n / (na + nb) : 0; }
async function gsGoogle(env, ctx, gq, gt, la, lo, r, lc) {
  const ck = new Request("https://gshop.cache/g2/?q=" + encodeURIComponent(gq) + "&t=" + encodeURIComponent(gt) + "&l=" + lc + "&ll=" + la.toFixed(3) + "," + lo.toFixed(3) + "&r=" + r);
  const hit = await caches.default.match(ck); if (hit) return await hit.json();
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  try { const c = await (await env.AIP.get(env.AIP.idFromName("gplace-cnt")).fetch("https://aip/gcnt", { method: "POST", body: JSON.stringify({ day: day, cap: GP_DAY_CAP }) })).json();
    if (!c || !c.ok) return { err: "cap" }; } catch (e) { return { err: "cap" }; }
  const dla = r / 111320, dlo = r / (111320 * Math.cos(la * Math.PI / 180));
  let j;
  try {
    const r2 = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_PLACES_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.nationalPhoneNumber,places.primaryTypeDisplayName,places.businessStatus" },
      body: JSON.stringify(Object.assign({ textQuery: gq, languageCode: lc, regionCode: "KR", pageSize: 20, rankPreference: "DISTANCE",
        locationRestriction: { rectangle: { low: { latitude: la - dla, longitude: lo - dlo }, high: { latitude: la + dla, longitude: lo + dlo } } } }, gt ? { includedType: gt, strictTypeFiltering: true } : {})) });
    if (!r2.ok) return { err: "http " + r2.status };
    j = await r2.json();
  } catch (e) { return { err: "fetch" }; }
  const items = (j.places || []).filter(function (p) { return p && p.location && p.businessStatus !== "CLOSED_PERMANENTLY"; }).map(function (p) {
    return { id: p.id, name: (p.displayName && p.displayName.text) || "", addr: String(p.formattedAddress || "").replace(/^(대한민국|大韓民国|大韩民国|大韓民國|South Korea|韩国|韓國|韓国)\s*,?\s*/, ""), y: p.location.latitude, x: p.location.longitude,
      rating: +p.rating || 0, n: +p.userRatingCount || 0, tel: p.nationalPhoneNumber || "", cat: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || "", uri: p.googleMapsUri || "" }; })
    .filter(function (p) { return llM(la, lo, p.y, p.x) <= r * 1.05; });
  const o = { items: items };
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } })));   // 1일
  return o;
}
async function gsKakao(env, kq, kc, la, lo, r, kk, kx) {
  const seen = {}, docs = [], H = { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } };
  // 카카오 반경은 20km 까지 — 30km 는 가운데(20km) + 15km 떨어진 둘레 6곳(각 20km)으로 덮는다 (10-21 2차)
  const ctr = [[la, lo]]; if (r > 20000) for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; ctr.push([la + 15000 * Math.cos(t) / 111320, lo + 15000 * Math.sin(t) / (111320 * Math.cos(la * Math.PI / 180))]); }
  const add = function (d) { const k = d.place_name + "|" + d.x + "|" + d.y; const c = d.category_name || ""; if (seen[k] || KP_BAD.test(c) || (kk && !kk.test(c + " " + d.place_name)) || /주차장|교통,수송/.test(c) || (kx && kx.test(c + " " + d.place_name))) return; if (llM(la, lo, +d.y, +d.x) > r * 1.05) return; seen[k] = 1; docs.push(d); };
  const jobs = [];
  ctr.forEach(function (cc) { const xy = "&x=" + cc[1].toFixed(4) + "&y=" + cc[0].toFixed(4) + "&radius=" + Math.min(r, 20000) + "&sort=distance&size=15";
    kq.forEach(function (q) { jobs.push(fetch("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodeURIComponent(q) + xy, H).then(function (x) { return x.ok ? x.json() : {}; }).catch(function () { return {}; })); });
    if (kc) [1, 2].forEach(function (pg) { jobs.push(fetch("https://dapi.kakao.com/v2/local/search/category.json?category_group_code=" + kc + xy + "&page=" + pg, H).then(function (x) { return x.ok ? x.json() : {}; }).catch(function () { return {}; })); }); });
  (await Promise.all(jobs)).forEach(function (jj) { (jj.documents || []).forEach(add); });
  return docs.map(function (d) { return { name: d.place_name, addr: d.road_address_name || d.address_name || "", y: +d.y, x: +d.x, tel: d.phone || "", cat: d.category_name || "" }; });
}
async function gShop(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = origin === "https://navi.moneypuzzle.co.kr";
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" });
  const sp = new URL(request.url).searchParams;
  const lang = /^(ko|en|ja|zhs|zht|es)$/.test(sp.get("lang") || "") ? sp.get("lang") : "ko", lc = { ko: "ko", en: "en", ja: "ja", zhs: "zh-CN", zht: "zh-TW", es: "es" }[lang];
  const la = Math.round(+sp.get("lat") / 0.003) * 0.003, lo = Math.round(+sp.get("lng") / 0.003) * 0.003;
  if (!(isFinite(la) && isFinite(lo) && la > 33 && la < 39 && lo > 124 && lo < 132)) return out({ ok: false, err: "bad" });
  const kq = (sp.get("kq") || "").split("|").map(function (s) { return s.trim().slice(0, 30); }).filter(Boolean).slice(0, 4);
  const kc = /^(MT1|CS2)$/.test(sp.get("kc") || "") ? sp.get("kc") : "", gq = (sp.get("gq") || "").trim().slice(0, 60), gt = /^[a-z_]{3,40}$/.test(sp.get("gt") || "") ? sp.get("gt") : "";
  if (!kq.length && !kc && !gq) return out({ ok: false, err: "bad" });
  const wre = function (v) { const w = String(v || "").split("|").map(function (x) { return x.replace(/[^\p{L}\p{N} ,]/gu, "").trim().slice(0, 20); }).filter(Boolean).slice(0, 12); return w.length ? new RegExp(w.join("|")) : null; };   // 카카오 분류 남길 말(kk)·뺄 말(kx) — 낱말만 받는다(글자·숫자 말고는 지움)
  const kk = wre(sp.get("kk")), kx = wre(sp.get("kx"));
  const ck = new Request("https://gshop.cache/v7/?kk=" + encodeURIComponent(sp.get("kk") || "") + "&kx=" + encodeURIComponent(sp.get("kx") || "") + "&kq=" + encodeURIComponent(kq.join("|")) + "&kc=" + kc + "&gq=" + encodeURIComponent(gq) + "&gt=" + gt + "&l=" + lang + "&ll=" + la.toFixed(3) + "," + lo.toFixed(3));
  const hit = await caches.default.match(ck);
  if (hit) return out(await hit.json(), "public, max-age=3600");
  let o = null;
  for (const r of [3000, 10000, 30000]) {   // 3km → 10km → 30km (10-21 2차)
    const useG = !!(gq && env.GOOGLE_PLACES_KEY);
    const [K, G0, G1] = await Promise.all([gsKakao(env, kq, kc, la, lo, r, kk, kx), useG ? gsGoogle(env, ctx, gq, gt, la, lo, r, "ko") : null, useG && lc !== "ko" ? gsGoogle(env, ctx, gq, gt, la, lo, r, lc) : null]);
    const gl = {}; ((G1 && G1.items) || []).forEach(function (p) { if (!/[가-힣]/.test(p.name)) gl[p.id] = p; });   // 그 언어 이름이 한글이면(구글에 외국어 이름이 없음) 안 쓴다
    const g = (G0 && G0.items) || [], used = {};
    const res = K.map(function (k) { return Object.assign({ src: "k" }, k); });
    const nk = res.length;
    // 같은 가게 찾기 — ① 전화번호가 같고 1km 안이면 먼저(10-21 2차) ② 150m 안 + 이름 비슷(0.5 이상). 짝을 모두 모아, 점수 높은 짝부터 하나씩
    //  전화는 그 가게만의 번호일 때만: 전국 대표번호(15xx·16xx·18xx)와 한쪽 목록에 두 번 이상 나오는 번호(체인 공용 번호, 올리브영 1577-4887 따위)는 안 쓴다
    const tcnt = {}, tOf = function (s) { const t = gsTel(s); return t && !/^1[568]\d{6}$/.test(t) ? t : ""; };
    res.forEach(function (k) { const t = tOf(k.tel); if (t) tcnt["k" + t] = (tcnt["k" + t] || 0) + 1; });
    g.forEach(function (p) { const t = tOf(p.tel); if (t) tcnt["g" + t] = (tcnt["g" + t] || 0) + 1; });
    const kt = res.map(function (k) { const t = tOf(k.tel); return t && tcnt["k" + t] === 1 ? t : ""; });
    const pairs = [];
    g.forEach(function (p, gi) { const pt = tOf(p.tel), pu = pt && tcnt["g" + pt] === 1 ? pt : "";
      for (let i = 0; i < nk; i++) { const k = res[i], d = llM(p.y, p.x, k.y, k.x); if (d > 1000) continue;
        if (pu && gsTelEq(pu, kt[i])) { pairs.push([2 - d / 3000, gi, i, 1, d]); continue; }
        if (d > 150) continue; const sm = gsSim(p.name, k.name); if (sm >= 0.5) pairs.push([sm - d / 3000, gi, i, sm, d]); } });
    pairs.sort(function (a, b) { return b[0] - a[0]; });
    const gUsed = {}, link = function (k, p) { k.src = "kg"; k.rating = p.rating; k.n = p.n; k.gid = p.id; k.uri = p.uri; if (!k.tel && p.tel) k.tel = p.tel; const L = gl[p.id]; if (L) { k.name_l = L.name; k.addr_l = L.addr; k.cat_l = L.cat; } };
    pairs.forEach(function (q) { if (gUsed[q[1]] || used[q[2]]) return; gUsed[q[1]] = 1; used[q[2]] = 1; link(res[q[2]], g[q[1]]); });
    const words = kq.concat(gq.split(/\s+/)).filter(function (w) { return w.length >= 2; });
    g.forEach(function (p, gi) { if (gUsed[gi]) return;
      // 구글에 같은 가게가 두 번 있으면(이름 같고 150m 안) 리뷰가 많은 쪽 별점을 쓴다
      for (let i = 0; i < nk; i++) { const k = res[i]; if (k.src === "kg" && gsSim(p.name, k.name) === 1 && llM(p.y, p.x, k.y, k.x) <= 150) { if ((p.n || 0) > (k.n || 0)) link(k, p); return; } }
      if (kx && kx.test(p.name + " " + p.cat)) return;
      if (!(p.n > 0) && !words.some(function (w) { return p.name.indexOf(w) >= 0; })) return;   // 구글에만 있고 리뷰 0·이름에 찾는 말도 없는 곳은 뺀다 (관심 지점 따위)
      const q = { src: "g", gid: p.id, name: p.name, addr: p.addr, y: p.y, x: p.x, tel: p.tel, cat: p.cat, rating: p.rating, n: p.n, uri: p.uri }, L = gl[p.id];
      if (L) { q.name_l = L.name; q.addr_l = L.addr; q.cat_l = L.cat; } res.push(q); });
    res.forEach(function (it) { it._d = llM(la, lo, it.y, it.x); });
    res.sort(function (a, b) { return a._d - b._d; });
    const fin = res.filter(function (it) { return it._d <= r * 1.05; }).slice(0, 40); fin.forEach(function (it) { delete it._d; });
    o = { ok: true, r: r, items: fin, nk: K.length, ng: g.length, gerr: (G0 && G0.err) || (G1 && G1.err) || (useG ? undefined : "nokey") };
    if (fin.length >= 3) break;
  }
  // 외국어 화면 — 구글이 그 언어 이름을 안 준 가게는 이름을 옮긴다 (10-21 2차): 브랜드는 GS_BR 사전, 나머지는 AI(허브 AiProxy, 이름마다 저장해 두고 다시 안 부른다)
  let trOk = true;
  if (lang !== "ko" && o.items.length) {
    const need = o.items.filter(function (it) { return !it.name_l && /[가-힣]/.test(it.name); });
    const pre = need.map(function (it) { const br = gsBrand(it.name); return br ? it.name.replace(br.m[0], " " + br.b.l[lang] + " ").replace(/\s{2,}/g, " ").trim() : it.name; });
    const ask = []; pre.forEach(function (s, i) { if (/[가-힣]/.test(s)) ask.push(i); else need[i].name_l = s; });
    if (ask.length && env.AIP) {
      let tr = [];
      try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });
        tr = ((await (await stub.fetch("https://aip/gsnm", { method: "POST", body: JSON.stringify({ lang: lang, names: ask.map(function (i) { return pre[i]; }) }) })).json()) || {}).out || []; } catch (e) { tr = []; }
      let got = 0;
      ask.forEach(function (i, j) { const v = tr[j], br = gsBrand(need[i].name);
        if (v && !/[가-힣]/.test(v) && (!br || v.indexOf(br.b.l[lang]) >= 0)) { need[i].name_l = v; got++; } });
      trOk = got >= Math.ceil(ask.length * 0.8);   // 8할 넘게 옮겨졌을 때만 결과를 하루 저장 (이름 하나하나는 AiProxy 에 따로 저장돼 다시 불러도 싸다)
    }
  }
  if (!o.gerr && trOk) ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } })));   // 1일 (구글이 빠진 결과는 저장 안 함)
  return out(o, "public, max-age=3600");
}
async function kPlace(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, st, extra) { return new Response(JSON.stringify(o), { status: st || 200, headers: Object.assign({}, H, extra || { "Cache-Control": "no-store" }) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" }, 403);
  const u = new URL(request.url), sp = u.searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 100), kw = (sp.get("kw") || "").trim().slice(0, 40);
  const x = sp.get("x") || "", y = sp.get("y") || "", rad = Math.min(Math.max(parseInt(sp.get("radius") || "150", 10) || 150, 1), 20000);
  const num = /^-?\d{1,3}(\.\d{1,8})?$/;
  let qs;
  // 내비 「편의시설·긴급」 (사장님 10-16) — 카카오 카테고리 + 좌표 + 가까운 순. navi 만. 좌표는 0.001도(약 100m)로 깎아서만 쓰고(캐시 키 포함) 원값은 남기지 않는다. 캐시 10분
  const cat = (sp.get("cat") || "").toUpperCase();
  if (cat) {
    if (!/^(CS2|MT1|HP8|PM9|AD5|FX)$/.test(cat) || !num.test(x) || !num.test(y)) return out({ ok: false, err: "bad" }, 400);
    if (!(origin === "https://navi.moneypuzzle.co.kr")) return out({ ok: false, err: "origin" }, 403);
    const rx = (+x).toFixed(3), ry = (+y).toFixed(3), r2 = Math.min(Math.max(parseInt(sp.get("radius") || "2000", 10) || 2000, 100), 10000), en = sp.get("lang") === "en", ul = kpUl(sp);
    const ck = new Request("https://kplace.cache/cat5/?c=" + cat + "&x=" + rx + "&y=" + ry + "&r=" + r2 + (en ? "&lang=en" : "") + (ul ? "&ul=" + ul + "5" : ""));
    const h0 = await caches.default.match(ck);
    if (h0) return out(await h0.json(), 200, { "Cache-Control": "private, max-age=600", "X-Cache": "hit" });
    // 동물병원·동물약국 빼기 (사장님 10-16 — 위례 긴급 병원 1·2위가 동물병원이었다). 빼서 모자라면 다음 쪽(최대 3쪽)까지
    const PET = /동물병원|동물의료센터|동물약국|펫|애견|수의/;
    const jc = { documents: [] };
    // 환전소 FX (사장님 10-16) — 카카오에 환전 분류가 없어 키워드 검색. 사설 환전소만: 은행(BK9·이름/분류에 은행·Bank) 뺀다
    if (cat === "FX") {
      const seen = {}, BANK = /은행|bank/i;
      try { for (const kq of ["환전소", "환전", "money exchange"]) {
          const r = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodeURIComponent(kq) + "&x=" + rx + "&y=" + ry + "&radius=" + r2 + "&sort=distance&size=15", { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
          if (!r.ok) continue; const jj = await r.json();
          (jj.documents || []).forEach(function (d) { const k = d.place_name + "|" + d.x + "|" + d.y, c = d.category_name || "", n = d.place_name || "";
            if (seen[k] || d.category_group_code === "BK9" || BANK.test(n) || BANK.test(c)) return;
            if (!/환전|exchange|money/i.test(n + " " + c)) return;
            seen[k] = 1; jc.documents.push(d); }); }
      } catch (e) {}
      jc.documents.sort(function (a, b) { return (+a.distance || 0) - (+b.distance || 0); });
      jc.documents = jc.documents.slice(0, 15);
    }
    if (cat !== "FX") try { for (let pg = 1; pg <= 3; pg++) {
        const r = await fetch("https://dapi.kakao.com/v2/local/search/category.json?category_group_code=" + cat + "&x=" + rx + "&y=" + ry + "&radius=" + r2 + "&sort=distance&size=15&page=" + pg, { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
        if (!r.ok) { if (pg === 1) return out({ ok: false, err: "http " + r.status }); break; }
        const jj = await r.json();
        (jj.documents || []).forEach(function (d) { if ((cat === "HP8" || cat === "PM9") && (PET.test(d.category_name || "") || PET.test(d.place_name || ""))) return; jc.documents.push(d); });
        if ((jj.meta && jj.meta.is_end) || (cat !== "AD5" && jc.documents.length >= 10)) break; }
    } catch (e) { if (!jc.documents.length) return out({ ok: false, err: "fetch" }); }
    const oc = { ok: true, cat: cat, items: (jc.documents || []).map(function (d) { return { name: d.place_name, x: d.x, y: d.y, addr: d.road_address_name || d.address_name, cat: d.category_name, tel: d.phone || undefined }; }) };
    if (cat === "AD5") oc.items = await stayMix(env, oc.items, rx, ry, r2);   // 숙소: 종류 나누기 + 관광공사 숙박 목록 맞추기 (10-16)
    if (en && oc.items.length) try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });   // 15곳씩 나눠 한꺼번에 (숙소는 40곳 넘어 한 번엔 잘렸다, 10-16)
      const parts = []; for (let i = 0; i < oc.items.length; i += 15) parts.push(oc.items.slice(i, i + 15));
      await Promise.all(parts.map(async function (part) { try { const rr = await (await stub.fetch("https://aip/place", { method: "POST", body: JSON.stringify({ items: part, ul: ul }) })).json(); const tr = Array.isArray(rr.items) ? rr.items : null;
        if (tr) part.forEach(function (it, i) { const t = tr[i]; if (t) { it.name_en = t.n; it.addr_en = t.a; it.cat_en = t.c; } }); } catch (e) {} })); } catch (e) {}
    if (oc.items.length && (!en || (ul ? kpUlDone(oc.items) : oc.items.some(function (it) { return it.name_en; }))))
      ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(oc), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=600" } })));
    return out(oc, 200, { "Cache-Control": "private, max-age=600" });
  }
  if (q && sp.get("near") === "1") { const ux = sp.get("ux") || "", uy = sp.get("uy") || "", ok2 = num.test(ux) && num.test(uy);   // AI 추천 목록 밖 — 가까운 순 전국 (내비 10-16)
    qs = "query=" + encodeURIComponent(q) + "&x=" + (ok2 ? (+ux).toFixed(3) : "126.978") + "&y=" + (ok2 ? (+uy).toFixed(3) : "37.567") + "&sort=distance&size=15"; }
  else if (q) qs = "query=" + encodeURIComponent(q) + "&size=15";
  else if (kw && num.test(x) && num.test(y)) qs = "query=" + encodeURIComponent(kw) + "&x=" + x + "&y=" + y + "&radius=" + rad + "&sort=distance&size=15";
  else return out({ ok: false, err: "bad" }, 400);
  // 외국인 쇼핑 검색어 사전 (사장님 10-16) — 걸리면 AI 번역 대신 이 한국어로. near=손님 위치(없으면 명동) 가까운 순, keep=남길 종류
  const gd = q ? KP_DICT.find(function (d) { return d.re.test(q.replace(/\s+/g, " ").trim()); }) : null;
  const ul = kpUl(sp);   // 일·중 (10-18)
  const key = new Request("https://kplace.cache/v2/?" + qs + (q && sp.get("near") === "1" ? "&n3" : "") + (gd ? "&gd=1" : q && KP_SHOPQ.test(q) ? "&s=1" : "") + (new URL(request.url).searchParams.get("lang") === "en" ? "&lang=en6" : "") + (ul ? "&ul=" + ul + "5" : "") + (sp.get("ux") ? "&u=" + (+sp.get("ux")).toFixed(3) + "," + (+sp.get("uy")).toFixed(3) : ""));
  const hit = await caches.default.match(key);
  if (hit) return out(await hit.json(), 200, { "Cache-Control": "public, max-age=86400", "X-Cache": "hit" });
  let j;
  if (gd) try {
    const ux = sp.get("ux") || "", uy = sp.get("uy") || "", cx = num.test(ux) && num.test(uy) ? ux : "126.9850", cy = num.test(ux) && num.test(uy) ? uy : "37.5636", seen = {}, docs = [];
    for (const ko of gd.ko) {
      const r = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodeURIComponent(ko) + "&size=15" + (gd.near ? "&x=" + cx + "&y=" + cy + "&radius=20000&sort=distance" : ""), { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
      if (!r.ok) continue; const jj = await r.json();
      (jj.documents || []).forEach(function (d) { const c = d.category_name || "", k = d.place_name + "|" + d.x + "|" + d.y; if (seen[k] || KP_BAD.test(c) || (gd.keep && !gd.keep.test(c))) return; seen[k] = 1; docs.push(d); });
    }
    if (gd.near) docs.sort(function (a, b) { return (+a.distance || 0) - (+b.distance || 0); });
    j = { documents: docs.slice(0, 15), guess: q !== gd.ko[0] && /[A-Za-z\u3040-\u30ff\u3400-\u9fff]/.test(q) ? gd.label : undefined };
  } catch (e) { return out({ ok: false, err: "fetch" }); }
  else try {
    const r = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?" + qs, { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
    if (!r.ok) return out({ ok: false, err: "http " + r.status });
    j = await r.json();
    if (q && sp.get("near") === "1") for (let pg = 2; pg <= 3 && !(j.meta && j.meta.is_end); pg++) {   // AI 추천 목록 밖 — 3쪽(45곳)까지 받아 앱이 종류로 거른다 (10-16)
      const rp = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?" + qs + "&page=" + pg, { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
      if (!rp.ok) break; const jp = await rp.json(); j.documents = (j.documents || []).concat(jp.documents || []); j.meta = jp.meta; }
    // 영어로 친 이름이 안 나오면 — 발음이 비슷한 한글 이름으로 바꿔 다시 찾는다 (gyungbokgung → 경복궁, 사장님 10-15)
    if (q && (j.documents || []).length < 3 && /[A-Za-z\u3040-\u30ff\u3400-\u9fff]/.test(q) && !/[가-힣]/.test(q) && env.AIP) {   // 일·중 글자 검색어도 (10-18)
      try { const stub = env.AIP.get(env.AIP.idFromName("navi-ai-enam-2"), { locationHint: "enam" });
        const g = await (await stub.fetch("https://aip/q2ko", { method: "POST", body: JSON.stringify({ q: q }) })).json(); if (g && g.err) j.qerr = g.err; j.cands = (g && g.list) || [];
        const ux = sp.get("ux") || "", uy = sp.get("uy") || "", near = num.test(ux) && num.test(uy) ? "&x=" + ux + "&y=" + uy + "&radius=20000&sort=distance" : "";   // 문장으로 찾을 땐 손님 위치에서 가까운 순 (사장님 10-15)
        for (const ko of (g && g.list) || []) { const r2 = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodeURIComponent(ko) + "&size=15" + near, { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
          if (r2.ok) { const j2 = await r2.json(); if ((j2.documents || []).length > (j.documents || []).length) { j = j2; j.guess = ko; break; } } } } catch (e) {}
    }
  } catch (e) { return out({ ok: false, err: "fetch" }); }
  const o = { ok: true, qerr: j.qerr, cands: j.cands, guess: j.guess || undefined, items: (j.documents || []).filter(function (d) { return !(KP_SHOPQ.test(q) && KP_BAD.test(d.category_name || "")); }).map(function (d) { return { name: d.place_name, x: d.x, y: d.y, addr: d.address_name, cat: d.category_name, dist: d.distance ? +d.distance : undefined, tel: d.phone || undefined }; }) };   // tel: 내비 장소 카드 전화번호 모으기 (10-15)
  if (new URL(request.url).searchParams.get("lang") === "en" && o.items.length) {   // 영어 화면 — 이름·주소·종류를 영어로 (내비, 2026-10-15)
    try { const stub = env.AIP.get(env.AIP.idFromName("news-ai-enam"), { locationHint: "enam" });   // 여기서 바로 부르면 403 — 뉴스 번역처럼 허용 지역 거쳐서
      if (o.items.length > 15) { const parts = []; for (let i = 0; i < o.items.length; i += 15) parts.push(o.items.slice(i, i + 15));   // near=1 은 45곳 — 15곳씩 나눠 한꺼번에 (10-16)
        await Promise.all(parts.map(async function (part) { try { const rq = await (await stub.fetch("https://aip/place", { method: "POST", body: JSON.stringify({ items: part, ul: ul }) })).json(); const tq = Array.isArray(rq.items) ? rq.items : null;
          if (tq) part.forEach(function (it, i) { const t = tq[i]; if (t) { it.name_en = t.n; it.addr_en = t.a; it.cat_en = t.c; } }); } catch (e) {} })); }
      else {
      const rr = await (await stub.fetch("https://aip/place", { method: "POST", body: JSON.stringify({ items: o.items, ul: ul }) })).json(); const tr = Array.isArray(rr.items) ? rr.items : null;
      if (tr) o.items.forEach(function (it, i) { const t = tr[i]; if (t) { it.name_en = t.n; it.addr_en = t.a; it.cat_en = t.c; } }); } } catch (e) {}
  }
  const _en = new URL(request.url).searchParams.get("lang") === "en";
  if (o.items.length && (!_en || (ul ? kpUlDone(o.items) : o.items.some(function (it) { return it.name_en; }))))   // 빈 결과·번역 실패는 저장 안 함   // 영어 번역이 실패한 결과는 저장하지 않는다
    ctx.waitUntil(caches.default.put(key, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } })));
  return out(o, 200, { "Cache-Control": "public, max-age=86400" });
}
// ── 한국부동산원 「공동주택 단지 식별정보」 (odcloud AptIdInfoSvc, 키 DATA_GO_KR, 2026-10-22) ──
//   ?addr=지번주소 → 그 지번 단지 · ?pk=단지PK · ?old=옛 단지 이름(이력 검색) → items[]
async function aptInfo(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return new Response(JSON.stringify({ ok: false, err: "origin" }), { status: 403, headers: H });
  const sp = new URL(request.url).searchParams;
  const addr = (sp.get("addr") || "").trim().replace(/\s+/g, " ").slice(0, 100), pk = (sp.get("pk") || "").trim(), old = (sp.get("old") || "").trim().replace(/\s+/g, "").slice(0, 40);
  let mode, val;
  if (/^\d{8,20}$/.test(pk)) { mode = "pk"; val = pk; }
  else if (old.length >= 2) { mode = "old"; val = old; }
  else if (addr) { mode = "addr"; val = addr; }
  else return out({ ok: false, err: "bad" });
  const ck = new Request("https://apt.cache/v1/" + mode + "?v=" + encodeURIComponent(val));
  const hit = await caches.default.match(ck); if (hit) return out(await hit.json(), "public, max-age=86400");
  const B = "https://api.odcloud.kr/api/AptIdInfoSvc/v1/";
  const call = async function (op, cond, n) {
    const r = await fetch(B + op + "?page=1&perPage=" + (n || 10) + "&returnType=JSON&" + Object.keys(cond).map(function (k) { return encodeURIComponent("cond[" + k + "]") + "=" + encodeURIComponent(cond[k]); }).join("&") + "&serviceKey=" + encodeURIComponent(env.DATA_GO_KR || ""));
    if (!r.ok) throw new Error("http " + r.status);
    const j = await r.json(); return (j && j.data) || [];
  };
  const pack = async function (d) {
    let hist = [];
    try { hist = (await call("getHistInfo", { "COMPLEX_PK::EQ": d.COMPLEX_PK }, 20)).map(function (h) { return { old: h.COMPLEX_EX_NM || "", now: h.COMPLEX_PR_NM || "", yr: h.NM_CHAN_YEAR || "" }; }).filter(function (h) { return h.old; }); } catch (e) {}
    return { pk: d.COMPLEX_PK, name: d.COMPLEX_NM1 || d.COMPLEX_NM2 || d.COMPLEX_NM3 || "", addr: d.ADRES || "", road: d.ROAD_ADRES || "", dongs: +d.DONG_CNT || 0, units: +d.UNIT_CNT || 0, useDate: d.USEAPR_DT || "", pnu: d.PNU || "", gb: d.COMPLEX_GB_CD || "", hist: hist };
  };
  let o;
  try {
    if (mode === "pk") {
      const L = await call("getAptInfo", { "COMPLEX_PK::EQ": val }, 1);
      o = L.length ? Object.assign({ ok: true }, await pack(L[0])) : { ok: false, err: "none" };
    } else if (mode === "addr") {
      const tk = val.split(" "); let i = tk.length - 1;
      while (i > 0 && !/^(산)?\d+(-\d+)?$/.test(tk[i])) i--;
      if (i < 1) return out({ ok: false, err: "bad" });
      const dn = tk[i - 1];
      const sg = tk.slice(0, i - 1).filter(function (t) { return /(시|군|구)$/.test(t) && !/(특별시|광역시|자치시)$/.test(t); });
      let L = await call("getAptInfo", { "ADRES::LIKE": dn + " " + tk[i] }, 30);
      L = L.filter(function (d) { return (" " + (d.ADRES || "")).endsWith(" " + dn + " " + tk[i]); });
      if (sg.length) { const L2 = L.filter(function (d) { return sg.every(function (s) { return (" " + d.ADRES + " ").indexOf(" " + s + " ") >= 0; }); }); if (L2.length) L = L2; }
      L.sort(function (a, b) { return (a.COMPLEX_GB_CD === "1" ? 0 : 1) - (b.COMPLEX_GB_CD === "1" ? 0 : 1) || (+b.UNIT_CNT || 0) - (+a.UNIT_CNT || 0); });
      o = L.length ? Object.assign({ ok: true }, await pack(L[0])) : { ok: false, err: "none" };
    } else {
      const Hs = await call("getHistInfo", { "COMPLEX_EX_NM::LIKE": val }, 10);
      const pks = Array.from(new Set(Hs.map(function (h) { return h.COMPLEX_PK; }))).slice(0, 5);
      const items = [];
      for (const p of pks) { const L = await call("getAptInfo", { "COMPLEX_PK::EQ": p }, 1); if (L.length) items.push(await pack(L[0])); }
      o = items.length ? { ok: true, items: items } : { ok: false, err: "none" };
    }
  } catch (e) { return out({ ok: false, err: "api" }); }
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=" + (o.ok ? 2592000 : 86400) } })));   // 30일 (못 찾음은 1일)
  return out(o, "public, max-age=86400");
}
// ── 지번주소 -> 필지 PNU (법정동 10 + 산 1/2 + 본번 4 + 부번 4) — 지도에 단지 필지를 칠할 때 (2026-10-14) ──
async function pnuOf(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" });
  const addr = (new URL(request.url).searchParams.get("addr") || "").trim().slice(0, 100);
  if (addr.length < 4 || !/\d/.test(addr)) return out({ ok: false, err: "bad" });
  const ck = new Request("https://pnu.cache/v1/?a=" + encodeURIComponent(addr));
  const hit = await caches.default.match(ck); if (hit) return out(await hit.json(), "public, max-age=86400");
  let ad;
  try {
    const r = await fetch("https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(addr), { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
    const j = await r.json(); ad = j.documents && j.documents[0] && j.documents[0].address;
  } catch (e) { return out({ ok: false, err: "addr" }); }
  if (!ad || !/^\d{10}$/.test(ad.b_code || "") || !(parseInt(ad.main_address_no || "0", 10) > 0)) return out({ ok: false, err: "addr" });
  const p4 = function (v) { return ("0000" + (parseInt(v || "0", 10) || 0)).slice(-4); };
  const o = { ok: true, pnu: ad.b_code + (ad.mountain_yn === "Y" ? "2" : "1") + p4(ad.main_address_no) + p4(ad.sub_address_no) };
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } })));
  return out(o, "public, max-age=86400");
}
// ── 건축물대장 (국토부 건축HUB) — 매물 입력 자동 채움 (사장님 2026-10-14) ──
//   ?addr=지번주소            → 사용승인일·주차·세대수·동 목록(동별 지상층수)
//   ?addr=지번주소&dong=101   → 그 동의 층별 평형 (전용·공급≈전용+주거공용)
// 단지 평형 전용→공급 (부동산 사기 평형 단추) — 정부 건축물대장은 하루 한도가 있어 단지마다 한 번만 묻고 30일 보관 (사장님 10-15)
async function bldgSup(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o) { return new Response(JSON.stringify(o), { headers: H }); };
  if (!okO) return new Response(JSON.stringify({ ok: false, err: "origin" }), { status: 403, headers: H });
  const addr = (new URL(request.url).searchParams.get("addr") || "").trim().slice(0, 100);
  if (!addr) return out({ ok: false, err: "bad" });
  const stub = env.AIP.get(env.AIP.idFromName("bldg-sup-store"));
  const kv = async function (path, body) { try { return await (await stub.fetch("https://aip/" + path, { method: "POST", body: JSON.stringify(body) })).json(); } catch (e) { return null; } };
  // need = 찾아야 할 전용면적들(쉼표) — 보관본에 없는 평형이 있으면 아직 안 읽은 동을 더 읽어 채운다 (사장님 10-22 헬리오시티 59.96 빠짐)
  const need = (new URL(request.url).searchParams.get("need") || "").split(",").map(Number).filter(function (x) { return x > 0; }).slice(0, 40);
  const got = await kv("kvget", { k: "bs:" + addr });
  const old = got && got.v && got.v.ts > Date.now() - 30 * 864e5 ? got.v : null;
  const M = {}; (old ? old.items : []).forEach(function (t) { M[t.ex.toFixed(2)] = { ex: t.ex, sup: t.sup, n: 0 }; });
  const has = function (ex) { return Object.keys(M).some(function (k) { return Math.abs(M[k].ex - ex) < 1.01; }); };
  const miss = function () { return need.filter(function (ex) { return !has(ex); }); };
  if (old && (old.all || !miss().length)) return out({ ok: true, items: old.items, cached: true });
  const call = async function (dong) {
    const u = new URL(request.url); u.pathname = "/bldg"; u.search = "?addr=" + encodeURIComponent(addr) + (dong != null ? "&dong=" + encodeURIComponent(dong) : "");
    const r = await bldg(new Request(u.toString(), { headers: { "Origin": origin } }), env, ctx); return r.json();
  };
  const a = await call(null);
  if (!a || !a.ok) return out(old ? { ok: true, items: old.items, cached: true } : { ok: false, err: (a && a.err) || "fail" });
  const L = (a.dongs || []).map(function (d) { return d.nm || "_"; }); if (!L.length) L.push("_");
  const done = new Set(old && old.done || []);
  // 처음엔 고르게 8개 동, 그다음엔 안 읽은 동을 차례로 — 한 번에 최대 12개 동
  let order = [];
  if (!old) { const step = Math.max(1, Math.floor(L.length / 8)); for (let i = 0; i < L.length && order.length < 8; i += step) order.push(L[i]); }
  L.forEach(function (d) { if (order.indexOf(d) < 0) order.push(d); });
  order = order.filter(function (d) { return !done.has(d); });
  let bad = false, cnt = 0;
  for (const d of order) {
    if (cnt >= 12 || (old && !miss().length) || (!old && cnt >= 8 && !miss().length)) break;
    const j = await call(d).catch(function () { return null; }); cnt++;
    if (!j || !j.ok) { bad = true; if (j && /429/.test(String(j.err))) break; continue; }
    done.add(d);
    Object.keys(j.floors || {}).forEach(function (f) { (j.floors[f] || []).forEach(function (t) { if (t.sup > t.ex) { const k = t.ex.toFixed(2); if (!M[k] || M[k].n < t.n) M[k] = { ex: t.ex, sup: t.sup, n: t.n }; } }); });
  }
  const items = Object.keys(M).map(function (k) { return { ex: M[k].ex, sup: M[k].sup }; }).sort(function (x, y) { return x.ex - y.ex; });
  if (items.length) await kv("kvput", { k: "bs:" + addr, v: { ts: old ? old.ts : Date.now(), items: items, done: Array.from(done), all: L.every(function (d) { return done.has(d); }) } });
  return out({ ok: true, items: items, partial: bad || undefined, left: miss().length || undefined });
}
async function bldg(request, env, ctx) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": okO ? origin : "https://emhwang3-boop.github.io", "Vary": "Origin" };
  const out = function (o, cc) { return new Response(JSON.stringify(o), { headers: Object.assign({ "Cache-Control": cc || "no-store" }, H) }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!okO) return out({ ok: false, err: "origin" });
  const sp = new URL(request.url).searchParams, addr = (sp.get("addr") || "").trim().slice(0, 100), dong = (sp.get("dong") || "").trim().replace(/동$/, "").slice(0, 20);
  if (addr.length < 4) return out({ ok: false, err: "bad" });
  const ck = new Request("https://bldg.cache/v2/?a=" + encodeURIComponent(addr) + "&d=" + encodeURIComponent(dong));
  const hit = await caches.default.match(ck); if (hit) return out(await hit.json(), "public, max-age=86400");
  let ad;
  try {
    const r = await fetch("https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(addr), { headers: { "Authorization": "KakaoAK " + (env.KAKAO_REST || "") } });
    const j = await r.json(); ad = j.documents && j.documents[0] && j.documents[0].address;
  } catch (e) { return out({ ok: false, err: "addr" }); }
  if (!ad || !ad.b_code) return out({ ok: false, err: "addr" });
  const p4 = function (v) { return ("0000" + (parseInt(v || "0", 10) || 0)).slice(-4); };
  const base = "serviceKey=" + encodeURIComponent(env.DATA_GO_KR || "") + "&sigunguCd=" + ad.b_code.slice(0, 5) + "&bjdongCd=" + ad.b_code.slice(5) + "&platGbCd=" + (ad.mountain_yn === "Y" ? 1 : 0) + "&bun=" + p4(ad.main_address_no) + "&ji=" + p4(ad.sub_address_no) + "&_type=json";
  const call = async function (op, extra) {   // 여러 쪽을 다 모은다 (쪽당 100줄이 한도 — 첫 쪽 뒤 나머지는 6개씩 한꺼번에, 최대 40쪽)
    const one = async function (pg) {   // 정부 서버가 가끔 빈 답·503 — 3번까지 다시 (2026-10-15)
      let j = null, lastE = null;
      for (let t = 0; t < 3 && !j; t++) {
        if (t) await new Promise(function (ok) { setTimeout(ok, 400 * t); });
        try { const r = await fetch("https://apis.data.go.kr/1613000/BldRgstHubService/" + op + "?" + base + "&numOfRows=100&pageNo=" + pg + (extra || ""));
          if (!r.ok) throw new Error("http " + r.status); const tx = await r.text(); if (!tx) throw new Error("empty"); j = JSON.parse(tx); } catch (e) { lastE = e; }
      }
      if (!j) throw lastE || new Error("fail");
      const bd = j && j.response && j.response.body; if (!bd) throw new Error("body");
      const it = bd.items && bd.items.item; return { tc: +bd.totalCount || 0, it: it ? (Array.isArray(it) ? it : [it]) : [] };
    };
    const f = await one(1); let all = f.it; const last = Math.min(Math.ceil(f.tc / 100), 40);
    for (let pg = 2; pg <= last; pg += 6) {
      const ps = []; for (let q = pg; q < pg + 6 && q <= last; q++) ps.push(one(q));
      (await Promise.all(ps)).forEach(function (x) { all = all.concat(x.it); });
    }
    return all;
  };
  const n = function (v) { return +v || 0; }, d8 = function (v) { v = String(v || "").trim(); return /^\d{8}$/.test(v) ? v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6) : ""; };
  let o;
  try {
    if (!dong) {
      const [rc, ti] = await Promise.all([call("getBrRecapTitleInfo"), call("getBrTitleInfo")]);
      const pk = function (x) { return n(x.indrAutoUtcnt) + n(x.oudrAutoUtcnt) + n(x.indrMechUtcnt) + n(x.oudrMechUtcnt); };
      const main = ti.filter(function (x) { return x.mainAtchGbCd !== "1"; });
      const R0 = rc[0] || null;
      let park = R0 ? pk(R0) : main.reduce(function (a, x) { return a + pk(x); }, 0);
      let hh = R0 ? n(R0.hhldCnt) : main.reduce(function (a, x) { return a + n(x.hhldCnt); }, 0);
      const apr = d8(R0 && R0.useAprDay) || main.map(function (x) { return d8(x.useAprDay); }).filter(Boolean).sort()[0] || "";
      const dongs = main.filter(function (x) { return n(x.hhldCnt) || n(x.hoCnt) || main.length === 1; }).map(function (x) { return { nm: String(x.dongNm || "").trim().replace(/동$/, ""), fl: n(x.grndFlrCnt), apr: d8(x.useAprDay) }; })
        .sort(function (a, b) { return a.nm.localeCompare(b.nm, "ko", { numeric: true }); });
      o = { ok: true, apr: apr, park: park, hh: hh, dongs: dongs, bname: (R0 && R0.bldNm) || (main[0] && main[0].bldNm) || "" };
    } else {
      let rows = await call("getBrExposPubuseAreaInfo", dong === "_" ? "" : "&dongNm=" + encodeURIComponent(dong + "동"));   // "_" = 동 없는 건물 하나 · 대장엔 대개 "104동"
      if (!rows.length && dong !== "_") rows = await call("getBrExposPubuseAreaInfo", "&dongNm=" + encodeURIComponent(dong));
      const U = {};   // 호별: 층·전용·주거공용
      rows.forEach(function (x) {
        const ho = String(x.hoNm || "").trim(); if (!ho) return;
        const u = U[ho] || (U[ho] = { f: "", ex: 0, cm: 0 });
        if (String(x.exposPubuseGbCd) === "1") { u.ex += n(x.area); u.f = (String(x.flrGbCd) === "10" ? "B" : "") + n(x.flrNo); }
        else if (!/주차|관리|기계|전기|경비|노인|보육|어린이|주민|커뮤|복리|근린|부대|창고|펌프|발전/.test(String(x.etcPurps || "") + String(x.mainPurpsCdNm || ""))) u.cm += n(x.area);
      });
      const F = {};   // 층별 평형 (같은 전용은 한 줄)
      Object.keys(U).forEach(function (ho) { const u = U[ho]; if (!u.ex || !u.f) return;
        const k = u.ex.toFixed(2), a = F[u.f] || (F[u.f] = {}); const t = a[k] || (a[k] = { ex: +k, sup: Math.round((u.ex + u.cm) * 100) / 100, n: 0 }); t.n++; });
      const fl = {}; Object.keys(F).forEach(function (f) { fl[f] = Object.keys(F[f]).map(function (k) { return F[f][k]; }).sort(function (a, b) { return a.ex - b.ex; }); });
      o = { ok: true, dong: dong, floors: fl };
    }
  } catch (e) { return out({ ok: false, err: String(e && e.message || e).slice(0, 40) }); }
  ctx.waitUntil(caches.default.put(ck, new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=604800" } })));
  return out(o, "public, max-age=86400");
}
function J(o) {
  return new Response(JSON.stringify(o), {
    headers: { "Content-Type": "application/json; charset=utf-8",
               "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" }
  });
}

// AI 거르기 전용 Durable Object — 미국 동부(enam)에 만든다 (2026-09-25)
export class AiProxy {
  constructor(state, env) { this.env = env; this.state = state; }
  async fetch(request) {
    try {
      const b = await request.json();
      if (new URL(request.url).pathname === "/trprune") {   // 7일 지난 번역 지우기
        const old = Date.now() - 7 * 864e5, del = [];
        (await this.state.storage.list({ prefix: "tr:" })).forEach(function (v, k) { if (!v || v.ts < old) del.push(k); });
        for (let i = 0; i < del.length; i += 128) await this.state.storage.delete(del.slice(i, i + 128));
        return J({ ok: true, del: del.length });
      }
      if (new URL(request.url).pathname === "/art") {   // 기사 전문 즉석 번역 — IP당 10분 20건, 저장 안 함 (2026-10-13)
        const now = Date.now(), rl = this.rl || (this.rl = new Map()), q = (rl.get(b.ip) || []).filter(function (t) { return now - t < 600000; });
        if (q.length >= 20) return J({ ok: false, err: "rate" });
        q.push(now); rl.set(b.ip, q);
        let a = await newsArticle(this.env, b.title || "", b.text || "", undefined, b.lang).catch(function () { return null; });
        if (!a) a = await newsArticle(this.env, b.title || "", b.text || "", "claude-sonnet-5-5", b.lang).catch(function () { return null; });
        return J(a ? { ok: true, title: a.title, paras: a.paras } : { ok: false, err: "tr" });
      }
      if (new URL(request.url).pathname === "/corp") return J(await corpUS(this.env, b.code, { descOnly: !!b.descOnly }));
      if (new URL(request.url).pathname === "/coininfo") return J(await coinInfo(this.env, b.sym));
      if (new URL(request.url).pathname === "/nreco") return J(await nRecoAip(this, b));   // 내비 AI 명소 추천 (10-16)
      if (new URL(request.url).pathname === "/ntrip") return J(await nTripAip(this, b));   // 내비 일정 설명·팁 (10-15)
      if (new URL(request.url).pathname === "/gsnm") {   // 선물 고르기 가게 이름 (10-21 2차) — 이름마다 이 처리기 저장소에 180일 (같은 이름은 AI 를 다시 안 부른다)
        const lg = /^(en|ja|zhs|zht|es)$/.test(String(b.lang || "")) ? b.lang : "", st = this.state.storage, now = Date.now();
        const names = (b.names || []).map(function (s) { return String(s || "").slice(0, 80); }).slice(0, 40);
        if (!lg || !names.length) return J({ out: [] });
        const ks = names.map(function (n) { return "gsnm:" + lg + ":" + n; }), got = await st.get(ks), out = names.map(function (n, i) { const v = got.get(ks[i]); return v && v.v && now - (v.ts || 0) < 180 * 864e5 ? v.v : null; });
        const miss = []; out.forEach(function (v, i) { if (!v && miss.indexOf(names[i]) < 0) miss.push(names[i]); });
        if (miss.length) { const tr = await gsNamesAi(this.env, lg, miss).catch(function () { return []; }), put = {};
          miss.forEach(function (n, j) { const v = tr[j]; if (!v) return; put["gsnm:" + lg + ":" + n] = { v: v, ts: now }; names.forEach(function (m, i) { if (m === n) out[i] = v; }); });
          if (Object.keys(put).length) await st.put(put); }
        return J({ out: out });
      }
      if (new URL(request.url).pathname === "/odst") return J({ out: await odAi(this.env, b.lang, (b.names || []).slice(0, 150)).catch(function () { return []; }) });   // 길찾기 이름 (10-19)
      if (new URL(request.url).pathname === "/xl") return J({ out: await xlAi(this.env, b.lang, (b.items || []).slice(0, 60)).catch(function () { return []; }) });   // 주식앱 일·중 (10-19)
      if (new URL(request.url).pathname === "/renm") return J({ out: await reNamesAi(this.env, b.ul, (b.names || []).slice(0, 60)).catch(function () { return []; }) });   // 부동산 이름 일·중 (10-19)
      if (new URL(request.url).pathname === "/stkq") return J(await stkQueryAi(this.env, String(b.q || "").slice(0, 40)).catch(function (e) { return { err: String(e).slice(0, 200) }; }));   // 종목 검색어 일·중 (10-19)
      if (new URL(request.url).pathname === "/nq2ko") return J(await newsQueryKo(this.env, String(b.q || "").slice(0, 60)).catch(function (e) { return { err: String(e).slice(0, 200) }; }));   // 뉴스 검색어 → 한국어 (10-19)
      if (new URL(request.url).pathname === "/q2ko") return J(await queryToKo(this.env, String(b.q || "").slice(0, 100)).catch(function (e) { return { err: String(e).slice(0, 200) }; }));   // 영어 검색어 → 한글 장소 이름 (10-15)
      if (new URL(request.url).pathname === "/gcnt") { const k = "gcnt:" + String(b.day || ""), n = ((await this.state.storage.get(k)) || 0) + 1; if (n > (+b.cap || 500)) return J({ ok: false, n: n - 1 }); await this.state.storage.put(k, n); return J({ ok: true, n: n }); }   // 구글 장소 하루 호출 수 (10-20)
      if (new URL(request.url).pathname === "/kvget") return J({ ok: true, v: (await this.state.storage.get("kv:" + String(b.k || "").slice(0, 200))) || null });
      if (new URL(request.url).pathname === "/kvput") { await this.state.storage.put("kv:" + String(b.k || "").slice(0, 200), b.v); return J({ ok: true }); }
      if (new URL(request.url).pathname === "/place") return J({ ok: true, items: await placeTranslate(this.env, b.items || [], /^(ja|zhs|zht|es)$/.test(String(b.ul || "")) ? b.ul : "").catch(function (e) { return { err: String(e).slice(0, 120) }; }) });   // 내비 장소 영어 (10-15)
      if (new URL(request.url).pathname === "/tr") {   // 10개씩 나눠 동시에 — 한 번에 20개는 가끔 형식이 깨졌다 (2026-10-13)
        const items0 = b.items || [], st = this.state.storage, lg = NL_LANG[b.lang] ? b.lang : "en";   // 일·중은 tr:<lang>: 자리 (2026-10-19)
        const kOf = async function (x) { const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode((x.t || "") + "|" + (x.d || ""))); return "tr:" + (lg === "en" ? "" : lg + ":") + [...new Uint8Array(h)].slice(0, 16).map(function (v) { return v.toString(16).padStart(2, "0"); }).join(""); };
        const ks = await Promise.all(items0.map(kOf)), got = ks.length ? await st.get(ks) : new Map();
        const res = items0.map(function (_, i) { const v = got.get(ks[i]); return v && v.v ? v.v : null; });
        const mi = []; res.forEach(function (v, i) { if (!v && items0[i]) mi.push(i); });
        const all = mi.map(function (i) { return items0[i]; }), parts = [];
        for (let i = 0; i < all.length; i += 10) parts.push(all.slice(i, i + 10));
        const rs = await Promise.all(parts.map(function (pp) { return newsTranslate(this.env, pp, undefined, lg).catch(function () { return null; }); }, this));
        let t = []; rs.forEach(function (r, k) { t = t.concat(r || new Array(parts[k].length).fill(null)); });
        // 묶음에서 빠진 줄(정치·사건 제목 등)은 한 건씩 다시 — 동시 8개, 안 되면 Sonnet 으로 (2026-10-13)
        const env2 = this.env, left = []; t.forEach(function (v, i) { if (!v && all[i]) left.push(i); });
        const one = async function (i) { let r = await newsTranslate(env2, [all[i]], undefined, lg).catch(function () { return null; });
          if (!r || !r[0]) r = await newsTranslate(env2, [all[i]], "claude-sonnet-5-5", lg).catch(function () { return null; });
          if (r && r[0]) t[i] = r[0]; };
        for (let s = 0; s < left.length; s += 8) await Promise.all(left.slice(s, s + 8).map(one));
        const now = Date.now(), put = {};
        t.forEach(function (v, n) { if (v) { res[mi[n]] = v; put[ks[mi[n]]] = { v: v, ts: now }; } });
        const pk = Object.keys(put); for (let i = 0; i < pk.length; i += 128) { const o = {}; pk.slice(i, i + 128).forEach(function (k) { o[k] = put[k]; }); await st.put(o); }
        return J(res.some(Boolean) ? { items: res } : { err: "no-tr" });
      }
      const f = await newsFilter(this.env, b.cx, b.mk, b.items || []);
      return J(f ? { items: f } : { err: "no-filter" });
    } catch (e) { return J({ err: String(e.message || e).slice(0, 60) }); }
  }
}

// ── 부동산 손님 연결 도우미 (사장님 2026-10-13) ──
const R_PT = ["아파트", "연립", "다세대", "단독", "다가구", "오피스텔", "상가·사무실", "토지"];
const R_DEAL = ["매매", "전세", "월세"];
const R_ST = ["new", "contacted", "done"];
function rTxt(s, max) { const t = bClean(s, 100000, true); return t == null ? "" : t.slice(0, max); }
function rTxtML(s, max) { const t = bClean(s, 100000, false); return t == null ? "" : t.slice(0, max); }
function rReg(s) { return String(s || "").replace(/[^0-9A-Za-z가-힣\-]/g, "").slice(0, 30); }
function rId(s) { return String(s || "").replace(/[^a-z0-9]/g, "").slice(0, 40); }
function rNewId() { return String(Date.now()).padStart(14, "0") + bRand(2); }
function rAreas(a) {
  return (Array.isArray(a) ? a : []).slice(0, 30).map(function (x) { x = x || {}; return { c: String(x.c || "").replace(/\D/g, "").slice(0, 5), d: rTxt(x.d, 20), n: rTxt(x.n, 60) }; })
    .filter(function (x) { return [2, 4, 5].indexOf(x.c.length) >= 0; });
}
function rLangs(a) { return (Array.isArray(a) ? a : []).slice(0, 10).map(function (x) { return rTxt(x, 40); }).filter(Boolean); }
async function rHash(salt, pw) {   // PBKDF2-SHA256 10만 번
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(pw)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode("mpr:" + salt), iterations: 100000 }, k, 256);
  return [...new Uint8Array(bits)].map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
async function rHmac(secret, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(s)].map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
// 목록(색인)은 2,500개씩 나눠 둔다 — 값 하나 128KB 한도
async function rIdxGet(st, name) {
  const m = await st.get(name); if (!m) return [];
  if (Array.isArray(m)) return m;
  const ks = []; for (let i = 0; i < (m.n || 0); i++) ks.push(name + "#" + i);
  if (!ks.length) return [];
  const g = await st.get(ks); let a = [];
  ks.forEach(function (k) { a = a.concat(g.get(k) || []); });
  return a;
}
async function rIdxPut(st, name, arr) {
  const old = await st.get(name), on = old && !Array.isArray(old) ? (old.n || 0) : 0;
  const per = 2500, n = Math.max(1, Math.ceil(arr.length / per)), o = { [name]: { n: n } };
  for (let i = 0; i < n; i++) o[name + "#" + i] = arr.slice(i * per, (i + 1) * per);
  const ks = Object.keys(o);
  for (let i = 0; i < ks.length; i += 100) { const q = {}; ks.slice(i, i + 100).forEach(function (k) { q[k] = o[k]; }); await st.put(q); }
  const dels = []; for (let i = n; i < on; i++) dels.push(name + "#" + i);
  if (dels.length) await st.delete(dels);
}
async function rIdxDel(st, name) {
  const old = await st.get(name), on = old && !Array.isArray(old) ? (old.n || 0) : 0;
  const dels = [name]; for (let i = 0; i < on; i++) dels.push(name + "#" + i);
  await st.delete(dels);
}

// ── 매물 도우미 (사장님 2026-10-13) — 공인중개사법 제18조의2 · 표시·광고 명시사항 세부기준 ──
function rNum(x, min, max, dec) {
  const t = String(x == null ? "" : x).replace(/,/g, "").trim(); if (t === "") return null;
  const n = Number(t); if (!isFinite(n)) return null;
  const v = dec ? Math.round(n * 100) / 100 : Math.round(n);
  return v < min || v > max ? null : v;
}
function rDate(s) { s = String(s || ""); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ""; }
// 사진 — data:image/jpeg;base64 → JPEG 바이트 (120KB 아래만)
function rJpeg(d) {
  d = String(d || ""); const pre = "data:image/jpeg;base64,";
  if (d.indexOf(pre) !== 0 || d.length > 170000) return null;
  let bin; try { bin = Uint8Array.from(atob(d.slice(pre.length)), function (c) { return c.charCodeAt(0); }); } catch (e) { return null; }
  if (bin.length < 200 || bin.length > 122880 || bin[0] !== 0xFF || bin[1] !== 0xD8) return null;
  return bin;
}
const LS_INC = ["gen", "elec", "water", "gas", "heat", "net", "tv"];
const LS_DIR = ["E", "W", "S", "N", "SE", "SW", "NE", "NW"];
const LS_DIRB = ["living", "master", "door"];
// ── 사무소 잠금·임시 비밀번호 (사장님 2026-10-13) ──
function rEmail(s) { s = String(s || "").trim().slice(0, 100); return /^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(s) ? s : ""; }
const R_TMPA = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";   // 0·O·1·l·I 뺌
function rTempPw(n) {
  n = n || 10; let out = ""; const a = new Uint8Array(1);
  while (out.length < n) { crypto.getRandomValues(a); if (a[0] < 256 - (256 % R_TMPA.length)) out += R_TMPA[a[0] % R_TMPA.length]; }
  return out;
}
// 연락처 — 이메일(x@y.z) 또는 전화(숫자 9~15자리, - + 공백 허용) (사장님 2026-10-14)
function hvContactOk(c) {
  c = String(c || "").trim();
  if (/^[^\s@<>"']+@[^\s@<>"']+\.[A-Za-z]{2,}$/.test(c)) return true;
  if (/^[\d\s+-]+$/.test(c)) { const n = c.replace(/\D/g, "").length; return n >= 9 && n <= 15; }
  return false;
}
const PTN_KINDS = ["이삿짐센터", "입주청소", "정리수납", "인테리어", "수선·수리", "기타 업체"];
async function rMail(env, to, subject, text) {   // Resend — 키가 없으면 보내지 않는다
  if (!env.RESEND_KEY || !to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": "Bearer " + env.RESEND_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Money Puzzle <noreply@moneypuzzle.co.kr>", to: [to], subject: subject, text: text }) });
    return r.ok;
  } catch (e) { return false; }
}
// 첨부 메일 (장부, 2026-10-15) — 보낸 이 이름만 사무소명 · 답장은 사무소 이메일로 · {ok,status}
async function rMailAtt(env, o) {
  if (!env.RESEND_KEY || !o.to) return { ok: false, status: 0 };
  const nm = String(o.fromName || "").replace(/[\u0000-\u001f"'<>\\,;:@()\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  const body = { from: (nm ? nm + " (Money Puzzle)" : "Money Puzzle") + " <noreply@moneypuzzle.co.kr>", to: [o.to], subject: o.subject, text: o.text, attachments: o.attachments || [] };
  if (o.replyTo) body.reply_to = o.replyTo;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": "Bearer " + env.RESEND_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, status: r.status };
  } catch (e) { return { ok: false, status: 0 }; }
}
// 장부 암호화 (2026-10-15) — AES-GCM · 키 LEDGER_KEY(32바이트 base64) · AAD = 저장 키(사무소·줄 번호에 묶임)
async function lgKey(env) {
  if (!env.LEDGER_KEY) return null;
  try { const raw = Uint8Array.from(atob(String(env.LEDGER_KEY).trim()), function (c) { return c.charCodeAt(0); }); if (raw.length !== 32) return null;
    return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]); } catch (e) { return null; }
}
function lgB64(u8) { let s = ""; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); }
function lgUnB64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
async function lgEnc(key, aad, obj) {
  const iv = new Uint8Array(12); crypto.getRandomValues(iv);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv, additionalData: new TextEncoder().encode(aad) }, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { iv: lgB64(iv), ct: lgB64(new Uint8Array(ct)) };
}
async function lgDec(key, aad, v) {
  try { const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: lgUnB64(v.iv), additionalData: new TextEncoder().encode(aad) }, key, lgUnB64(v.ct));
    return JSON.parse(new TextDecoder().decode(pt)); } catch (e) { return null; }
}
// 손님 이름·연락처 암호화 (사장님 2026-10-22) — AES-GCM · 키 PII_KEY(32바이트 base64) · AAD = 저장 키(ld:<id>·pl:<id>·rpt:<id>)
//   기록에 pe = {iv,ct} 로 두고 평문 칸(name·phone·contact)은 지운다. 읽을 땐 pe 가 있으면 풀고, 없으면 옛 평문 그대로
let _piiK = null, _piiRaw = "";
async function piiKey(env) {
  const s = String(env.PII_KEY || "").trim(); if (!s) return null;
  if (_piiK && _piiRaw === s) return _piiK;
  try { const raw = Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); if (raw.length !== 32) return null;
    _piiK = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]); _piiRaw = s; return _piiK; } catch (e) { return null; }
}
const PII_F = { ld: ["name", "phone"], pl: ["name", "contact"], rpt: ["contact"] };
async function piiSeal(env, kind, aad, v) {   // v 를 고쳐서 돌려준다 — 키가 없으면 평문 그대로
  const key = await piiKey(env); if (!key || !v) return v;
  const o = {}; PII_F[kind].forEach(function (f) { o[f] = v[f] || ""; });
  v.pe = await lgEnc(key, aad, o); PII_F[kind].forEach(function (f) { delete v[f]; });
  return v;
}
async function piiOpen(env, kind, aad, v) {   // 사본에 평문 칸을 채워 돌려준다 (저장하지 말 것)
  if (!v) return v;
  const o = Object.assign({}, v); delete o.pe;
  if (v.pe) { const key = await piiKey(env), d = key ? await lgDec(key, aad, v.pe) : null; PII_F[kind].forEach(function (f) { o[f] = d ? (d[f] || "") : ""; }); }
  return o;
}
function rAtMs(at) { const t = Date.parse(String(at || "").replace(" ", "T") + ":00+09:00"); return isFinite(t) ? t : 0; }   // bKst() 글자 → ms
function lgRow(b) {   // 장부 한 줄 — 금액은 만원(거래)·원(수수료)
  const d = String(b.d || ""); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return { err: "d" };
  const deal = parseInt(b.deal, 10), pt = parseInt(b.pt, 10);
  if (!(deal >= 0 && deal < 3)) return { err: "deal" };
  if (!(pt >= 0 && pt < R_PT.length)) return { err: "pt" };
  const side = ["b", "s", "both"].indexOf(b.side) >= 0 ? b.side : "";
  if (!side) return { err: "side" };
  const n = function (x, max) { const v = Math.round((parseFloat(String(x == null ? "" : x).replace(/,/g, "")) || 0) * 100) / 100; return v > 0 && v <= max ? v : 0; };
  const r = { d: d, deal: deal, pt: pt, addr: rTxt(b.addr, 80), area: n(b.area, 1e6), price: n(b.price, 1e9), rent: deal === 2 ? n(b.rent, 1e7) : 0, side: side,
    feeB: side !== "s" ? n(b.feeB, 1e11) : 0, feeS: side !== "b" ? n(b.feeS, 1e11) : 0,
    bn: rTxt(b.bn, 30), bt: rTxt(b.bt, 30), sn: rTxt(b.sn, 30), stl: rTxt(b.stl, 30), memo: rTxtML(b.memo, 300) };
  return { v: r };
}
function rbKey(sg, dong, jibun, area) { return "rb:" + sg + ":" + dong + ":" + String(jibun || "").replace(/\s/g, "") + ":" + (Math.round((+area || 0) * 10) / 10); }
function rListing(b) {
  const pt = parseInt(b.pt, 10), deal = parseInt(b.deal, 10);
  if (!(pt >= 0 && pt < R_PT.length)) return { err: "pt" };
  if (!(deal >= 0 && deal < 3)) return { err: "deal" };
  const H = pt <= 2, O = pt === 5 || pt === 6, BLD = pt !== 7;
  const v = { pt: pt, deal: deal, unreg: !!b.unreg, viol: !!b.viol };
  v.sg = String(b.sg || "").replace(/\D/g, ""); v.dong = rTxt(b.dong, 20);
  if (v.sg.length !== 5 || !v.dong) return { err: "area" };
  v.jibun = rTxt(b.jibun, 30); if (!v.jibun) return { err: "jibun" };
  v.bname = rTxt(b.bname, 40);
  if (H) { v.bdong = rTxt(b.bdong, 10); v.fmode = b.fmode === "level" ? "level" : "exact"; }
  if (O) v.amode = b.amode === "dong" ? "dong" : "full";
  if (H && v.fmode === "level") { v.flevel = ["low", "mid", "high"].indexOf(b.flevel) >= 0 ? b.flevel : ""; if (!v.flevel) return { err: "floor" }; }
  else if (H || (O && v.amode === "full")) { v.floor = String(b.floor || "").toUpperCase().replace(/\s|층/g, "").slice(0, 5); if (!/^B?\d{1,3}$/.test(v.floor)) return { err: "floor" }; }
  if (deal === 0) { v.price = rNum(b.price, 1, 100000000); if (v.price == null) return { err: "price" }; }
  else {
    v.dep = rNum(b.dep, 0, 100000000); if (v.dep == null) return { err: "price" };
    if (deal === 2) { v.rent = rNum(b.rent, 1, 1000000); if (v.rent == null) return { err: "price" }; }
    else if (!v.dep) return { err: "price" };
  }
  v.area = rNum(b.area, 1, 10000000, 1); if (v.area == null) return { err: "aream" };
  if (pt === 0) { const s = rNum(b.supply, 1, 10000000, 1); if (s != null) v.supply = s; }
  if (BLD) {
    v.floors = rNum(b.floors, 1, 200); if (v.floors == null) return { err: "floors" };
    const mv = b.move || {};
    if (mv.t === "now") v.move = { t: "now" };
    else if (mv.t === "date" && rDate(mv.d)) v.move = { t: "date", d: rDate(mv.d) };
    else if (mv.t === "mon" && /^\d{4}-\d{2}$/.test(String(mv.m || "")) && [0, 1, 2].indexOf(+mv.p) >= 0) v.move = { t: "mon", m: String(mv.m), p: +mv.p };
    else return { err: "move" };
    const rooms = rNum(b.rooms, 0, 99); if (rooms == null && !O) return { err: "rooms" }; if (rooms != null) v.rooms = rooms;
    v.baths = rNum(b.baths, 0, 99); if (v.baths == null) return { err: "baths" };
    v.appr = rDate(b.appr); if (!v.appr) return { err: "appr" };
    const pk = b.park || {}, pn = rNum(pk.n, 0, 100000, 1); if (pn == null) return { err: "park" };
    v.park = { k: pk.k === "per" ? "per" : "total", n: pn };
    const mf = b.mfee || {}, amt = rNum(mf.amt, 0, 100000000);
    if (amt == null && pt !== 6) return { err: "mfee" };
    if (amt != null) v.mfee = { amt: amt, inc: (Array.isArray(mf.inc) ? mf.inc : []).filter(function (x) { return LS_INC.indexOf(x) >= 0; }) };
    v.dir = LS_DIR.indexOf(b.dir) >= 0 ? b.dir : ""; v.dirb = LS_DIRB.indexOf(b.dirb) >= 0 ? b.dirb : "";
    if (!v.dir || !v.dirb) return { err: "dir" };
  }
  v.desc = rTxtML(b.desc, 500);
  return { v: v };
}

export class Hub {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.snap = null;
    this.sockets = new Set();
    this.pending = {};     // key → {op, q, ts}
    this.results = {};     // key → {data, ts}
  }

  auth(request) {
    return request.headers.get("x-key") === this.env.PUSH_KEY;
  }

  // ── 중개사무소 목록 (사장님 2026-10-12) ──
  //    PUT /broker/put?lawd=XXXXX (x-key) — 본문: [[등록번호,사무소명,대표,상태,주소,등록일],…]  · 400줄씩 나눠 둔다(값 하나 128KB 한도)
  //    GET /broker?lawd=XXXXX&jurirno=…  → 그 번호 1건 · GET /broker?lawd=XXXXX&page=n → 100줄씩
  async broker(request, url, p) {
    const st = this.state.storage;
    const H = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
    const lawd = (url.searchParams.get("lawd") || "").replace(/\D/g, "");
    if (lawd.length !== 5) return new Response(JSON.stringify({ ok: false, err: "lawd" }), { headers: H });
    if (p === "/broker/put") {
      if (request.method !== "PUT" || !this.auth(request)) return new Response("no", { status: 403 });
      let rows; try { rows = JSON.parse(await request.text()); } catch (e) { return new Response("json", { status: 400 }); }
      if (!Array.isArray(rows)) return new Response("arr", { status: 400 });
      const old = (await st.get("bkm:" + lawd)) || { n: 0 };
      const puts = {}, n = Math.ceil(rows.length / 400);
      for (let i = 0; i < n; i++) puts["bk:" + lawd + ":" + i] = rows.slice(i * 400, i * 400 + 400);
      puts["bkm:" + lawd] = { n: n, total: rows.length, at: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16) };
      const keys = Object.keys(puts);
      for (let i = 0; i < keys.length; i += 100) { const o = {}; keys.slice(i, i + 100).forEach(function (k) { o[k] = puts[k]; }); await st.put(o); }
      const dels = []; for (let i = n; i < (old.n || 0); i++) dels.push("bk:" + lawd + ":" + i);
      if (dels.length) await st.delete(dels);
      return new Response(JSON.stringify({ ok: true, lawd: lawd, total: rows.length }), { headers: H });
    }
    const m = await st.get("bkm:" + lawd);
    if (!m) return new Response(JSON.stringify({ ok: true, total: 0, items: [], at: "" }), { headers: H });
    const ks = []; for (let i = 0; i < m.n; i++) ks.push("bk:" + lawd + ":" + i);
    const got = await st.get(ks); let all = [];
    ks.forEach(function (k) { all = all.concat(got.get(k) || []); });
    const mk = function (r) { return { jurirno: r[0], name: r[1], ceo: r[2], st: r[3], addr: r[4], reg: r[5] }; };
    const jur = (url.searchParams.get("jurirno") || "").trim();
    if (jur) return new Response(JSON.stringify({ ok: true, at: m.at, items: all.filter(function (r) { return r[0] === jur; }).map(mk) }), { headers: H });
    const live = all.filter(function (r) { return r[3] === "영업중"; });
    const pg = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    return new Response(JSON.stringify({ ok: true, at: m.at, total: live.length, page: pg, items: live.slice((pg - 1) * 100, pg * 100).map(mk) }), { headers: H });
  }

  // ── 홈페이지 「고객의 소리」 (사장님 2026-10-14) — POST /hvoice {text, contact, hp, page} → emhwang3@moneypuzzle.co.kr ──
  //   🔴 메일에 IP 없음. IP 는 해시만(시간당 5건 제한용). 메일이 실패해도 저장은 남는다("voice:"+시각)
  // ── 내비 관리자 공통 — 관리 토큰(x-admin = NAVI_ADMIN) 확인 + CORS (2026-10-15) ──
  async nAdm(request) {
    const o = request.headers.get("Origin") || "", okO = mpOrigin(o) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d{1,5})?$/.test(o);
    const H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin" };
    if (okO) H["Access-Control-Allow-Origin"] = o;
    const out = function (j, s) { return new Response(JSON.stringify(j), { status: s || 200, headers: H }); };
    if (request.method === "OPTIONS") return { res: new Response(null, { status: okO ? 204 : 403, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "x-admin, Content-Type", "Access-Control-Max-Age": "86400" }, H) }) };
    let xa = request.headers.get("x-admin") || ""; try { xa = decodeURIComponent(xa); } catch (e) {}   // 한글 비밀번호 — 화면이 encodeURIComponent 로 보낸다
    const r = await this.nAdmCall("check", { a: xa });
    if (!r.ok) return { res: out({ ok: false, err: r.locked ? "locked" : "admin" }, r.locked ? 429 : 403) };
    return { out: out };
  }
  // 관리 비밀번호는 "nadmin" 칸 하나가 지킨다 — 다른 칸은 여기에 물어본다 (밖에서 /__nadm/ 은 못 들어온다)
  async nAdmCall(op, body) {
    try { return await (await this.env.HUB.get(this.env.HUB.idFromName("nadmin")).fetch("https://hub/__nadm/" + op, { method: "POST", body: JSON.stringify(body || {}) })).json(); }
    catch (e) { return { ok: false }; }
  }
  // 「nadmin」 칸 안 — pw = {salt, h, it} (PBKDF2-SHA256) · lock = {n, until}
  async nadmInternal(request, p) {
    const st = this.state.storage, now = Date.now(), J2 = function (j) { return new Response(JSON.stringify(j), { headers: { "Content-Type": "application/json" } }); };
    let b = {}; try { b = JSON.parse(await request.text()) || {}; } catch (e) {}
    if (p === "/__nadm/reset") { await st.delete(["pw", "lock"]); return J2({ ok: true }); }   // 비상 복구 — env NAVI_ADMIN 으로 돌아간다
    const lock = (await st.get("lock")) || { n: 0, until: 0 };
    if (lock.until > now) return J2({ ok: false, locked: true, until: lock.until });
    const a = String(b.a == null ? "" : b.a), pw = await st.get("pw");
    let good = false;
    if (pw && pw.h) good = a.length >= 1 && a.length <= 300 && bEq(await nPbkdf(a, pw.salt, pw.it), pw.h);
    else { const k = this.env.NAVI_ADMIN || ""; good = k.length >= 16 && bEq(a, k); }
    if (!good) {
      lock.n = (lock.n || 0) + 1; if (lock.n >= 5) { lock.until = now + 15 * 60000; lock.n = 0; }
      await st.put("lock", lock); return J2({ ok: false, locked: lock.until > now });
    }
    if (lock.n || lock.until) await st.put("lock", { n: 0, until: 0 });
    if (p === "/__nadm/set") {
      const nw = String(b.nw == null ? "" : b.nw), len = [...nw].length;
      if (len < 10 || nw.length > 200 || /[\u0000-\u001f\u007f]/.test(nw)) return J2({ ok: true, changed: false, err: "weak" });
      const salt = bRand(16), it = 100000;   // Workers PBKDF2 상한이 10만회
      await st.put("pw", { salt: salt, h: await nPbkdf(nw, salt, it), it: it, at: bKst() });
      return J2({ ok: true, changed: true });
    }
    return J2({ ok: true, hashed: !!(pw && pw.h) });
  }
  // POST /nadminpw {cur, new} — 관리 비밀번호 바꾸기 · POST /nadminpw?reset=1 (x-reset = env NAVI_RESET, 평소엔 없음) — 비상 복구
  async nadminpw(request, url) {
    const o = request.headers.get("Origin") || "", okO = mpOrigin(o) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d{1,5})?$/.test(o);
    const H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin" };
    if (okO) H["Access-Control-Allow-Origin"] = o;
    const out = function (j, s) { return new Response(JSON.stringify(j), { status: s || 200, headers: H }); };
    if (request.method === "OPTIONS") return new Response(null, { status: okO ? 204 : 403, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, x-reset", "Access-Control-Max-Age": "86400" }, H) });
    if (request.method !== "POST") return out({ ok: false, err: "method" }, 405);
    if (url.searchParams.get("reset") === "1") {
      const rk = this.env.NAVI_RESET || "";
      if (!(rk.length >= 16 && bEq(request.headers.get("x-reset") || "", rk))) return out({ ok: false, err: "reset" }, 403);
      await this.nAdmCall("reset"); return out({ ok: true, reset: true });
    }
    let raw = ""; try { raw = await request.text(); } catch (e) {}
    if (raw.length > 2000) return out({ ok: false, err: "long" }, 400);
    let b = {}; try { b = JSON.parse(raw) || {}; } catch (e) { return out({ ok: false, err: "json" }, 400); }
    const r = await this.nAdmCall("set", { a: String(b.cur || ""), nw: String(b["new"] || "") });
    if (!r.ok) return out({ ok: false, err: r.locked ? "locked" : "admin" }, r.locked ? 429 : 403);
    if (!r.changed) return out({ ok: false, err: r.err || "weak" }, 400);
    return out({ ok: true });
  }

  // ── 내비 장부 (사장님 2026-10-15) — 따로 된 칸("nledger"). 결제(PG) 붙기 전이라 비어 있다 ──
  //   기록 "ord:YYYY-MM-DD:시각ms:난수" = {at, day, product:"7d"|"15d"|"30d", cur:"KRW"|"USD", amount, status:"paid"|"refund", pg, oid, test}
  //   🔴 손님 정보(이름·카드·이메일) 안 둔다 — 주문번호·상품·금액뿐
  //   GET /nledger?from=&to=[&test=1] (관리 토큰) → 날짜별·상품별·통화별 합계 + 기록
  //   POST /nledger {product,cur,amount,oid,test} (관리 토큰, 손 기록·시험용) · POST /nledger?clear=test → 시험 기록만 지움
  async nledger(request, url) {
    const g = await this.nAdm(request); if (g.res) return g.res; const out = g.out, st = this.state.storage;
    const day = function (ms) { return new Date(ms + 9 * 3600000).toISOString().slice(0, 10); };
    const PR = { "7d": 1, "15d": 1, "30d": 1 }, CU = { KRW: 1, USD: 1 };
    if (request.method === "POST") {
      if (url.searchParams.get("clear") === "test") {
        const all = await st.list({ prefix: "ord:" }), ks = [];
        for (const [k, v] of all) if (v && v.test) ks.push(k);
        for (let i = 0; i < ks.length; i += 128) await st.delete(ks.slice(i, i + 128));
        return out({ ok: true, deleted: ks.length });
      }
      let b = null; try { b = JSON.parse(await request.text()); } catch (e) {}
      if (!b || !PR[b.product] || !CU[b.cur] || !(+b.amount > 0) || +b.amount > 1e9) return out({ ok: false, err: "bad" }, 400);
      const now = Date.now(), d = day(now), k = "ord:" + d + ":" + now + ":" + bRand(2);
      const rec = { at: bKst(), day: d, product: b.product, cur: b.cur, amount: Math.round(+b.amount * 100) / 100, status: b.status === "refund" ? "refund" : "paid",
        pg: String(b.pg || "manual").replace(/[^a-z0-9_-]/gi, "").slice(0, 20), oid: String(b.oid || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64), test: b.test ? 1 : 0 };
      await st.put(k, rec);
      return out({ ok: true, id: k });
    }
    const D = /^\d{4}-\d{2}-\d{2}$/;
    let to = url.searchParams.get("to") || day(Date.now()), from = url.searchParams.get("from") || to.slice(0, 8) + "01";
    if (!D.test(from) || !D.test(to)) return out({ ok: false, err: "date" }, 400);
    if (from > to) { const t = from; from = to; to = t; }
    const tst = url.searchParams.get("test") === "1";
    const m = await st.list({ start: "ord:" + from, end: "ord:" + to + ";", limit: 5000 });
    const recs = [], days = {}, tot = { KRW: { n: 0, amt: 0 }, USD: { n: 0, amt: 0 } }, prod = {};
    for (const [k, v] of m) {
      if (!v || (!!v.test !== tst)) continue;
      const sg = v.status === "refund" ? -1 : 1, dd = days[v.day] || (days[v.day] = { d: v.day, KRW: { n: 0, amt: 0 }, USD: { n: 0, amt: 0 }, p: {} });
      dd[v.cur].n += sg; dd[v.cur].amt += sg * v.amount; tot[v.cur].n += sg; tot[v.cur].amt += sg * v.amount;
      dd.p[v.product] = (dd.p[v.product] || 0) + sg; prod[v.product] = (prod[v.product] || 0) + sg;
      recs.push(Object.assign({ id: k }, v));
    }
    return out({ ok: true, from: from, to: to, test: tst, pg: false, total: tot, products: prod, days: Object.values(days).sort(function (a, b) { return a.d < b.d ? -1 : 1; }), items: recs.reverse().slice(0, 500) });
  }

  // ── 내비 고객의 소리 읽기 (2026-10-15) — /hvoice 가 "voice:" 로 저장한 사본 중 내비 것만. 메일 발송은 그대로 ──
  //   GET /nvoice (관리 토큰) → 최근 100건 {id, at, text, lang, read, hasContact} — 연락처는 빼고 준다
  //   GET /nvoice?contact=<id> → 그 글 연락처 하나 · POST /nvoice?read=<id> → 읽음 · POST /nvoice?del=<id> → 지움(시험 글 정리)
  async nvoice(request, url) {
    const g = await this.nAdm(request); if (g.res) return g.res; const out = g.out, st = this.state.storage, sp = url.searchParams;
    const isNavi = function (v) { return v && (v.src === "navi" || /^https:\/\/navi\.moneypuzzle\.co\.kr\//.test(v.page || "")); };
    const idOk = function (id) { return /^voice:\d{10,16}:[0-9a-f]{4}$/.test(id || ""); };
    if (request.method === "POST") {
      const id = sp.get("read") || sp.get("del");
      if (!idOk(id)) return out({ ok: false, err: "id" }, 400);
      const v = await st.get(id); if (!isNavi(v)) return out({ ok: false, err: "none" }, 404);
      if (sp.get("del")) { await st.delete([id, "nvr:" + id]); return out({ ok: true, deleted: 1 }); }
      await st.put("nvr:" + id, 1); return out({ ok: true });
    }
    if (sp.get("contact")) {
      const id = sp.get("contact"); if (!idOk(id)) return out({ ok: false, err: "id" }, 400);
      const v = await st.get(id); if (!isNavi(v)) return out({ ok: false, err: "none" }, 404);
      return out({ ok: true, contact: v.contact || "" });
    }
    const m = await st.list({ prefix: "voice:", reverse: true, limit: 1000 }), items = [];
    for (const [k, v] of m) { if (!isNavi(v)) continue; items.push({ id: k, at: v.at, text: v.text, lang: v.lang || "", hasContact: !!v.contact }); if (items.length >= 100) break; }
    const rd = items.length ? await st.get(items.map(function (i) { return "nvr:" + i.id; })) : new Map();
    let unread = 0; items.forEach(function (i) { i.read = !!rd.get("nvr:" + i.id); if (!i.read) unread++; });
    return out({ ok: true, unread: unread, items: items });
  }

  // ── 내비 「입점·광고 문의」 (사장님 2026-10-15) — 따로 된 칸("ninq") ──
  //   확인 두 단계: ① 사업자등록번호 (국세청 상태조회 — 계속사업자만, 키 미신청이면 형식·체크섬만 하고 「키 대기」 표시)
  //                ② 이메일 6자리 코드 (10분 · 5번 틀리면 그 코드 잠금 · 같은 이메일 하루 5번 발송)
  //   POST /ninq/biz {bno} · POST /ninq/code {email,lang} · POST /ninq/verify {email,code} → {vt}
  //   POST /ninq {vt,bno,biz,cat,name,contact,loc,msg,agree,lang,hp} → 저장 + 사장님 메일 「[머니퍼즐 입점 문의]」 (같은 기기 망·같은 이메일 하루 3건)
  //   관리(관리 비밀번호): GET /ninq/admin[?full=1] · GET /ninq/admin?contact=<id> · POST /ninq/admin?read=<id>|del=<id>
  //   🔴 IP 는 해시로만, 그날 횟수 세기에만 쓰고 이틀 뒤 지운다. 문의 기록은 1년(400일) 지나면 지운다
  async ninq(request, url, p) {
    const st = this.state.storage, now = Date.now(), env = this.env;
    if (p === "/ninq/admin") return this.ninqAdmin(request, url);
    if (p === "/ninq/cats") return new Response(JSON.stringify({ ok: true, cats: NINQ_CATS }), { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=600" } });
    const o = request.headers.get("Origin") || "";
    const okO = o === "https://navi.moneypuzzle.co.kr" || /^http:\/\/(127\.0\.0\.1|localhost)(:\d{1,5})?$/.test(o);
    const H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin" };
    if (okO) H["Access-Control-Allow-Origin"] = o;
    const out = function (j, s) { return new Response(JSON.stringify(j), { status: s || 200, headers: H }); };
    if (request.method === "OPTIONS") return new Response(null, { status: okO ? 204 : 403, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, x-admin", "Access-Control-Max-Age": "86400" }, H) });
    if (!okO) return out({ ok: false, err: "origin" }, 403);
    if (request.method !== "POST") return out({ ok: false, err: "method" }, 405);
    let raw = ""; try { raw = await request.text(); } catch (e) {}
    if (raw.length > 6000) return out({ ok: false, err: "long" }, 400);
    let b = {}; try { b = JSON.parse(raw || "{}") || {}; } catch (e) { return out({ ok: false, err: "json" }, 400); }
    const day = new Date(now + 9 * 3600000).toISOString().slice(0, 10), dayOld = new Date(now + 9 * 3600000 - 2 * 86400000).toISOString().slice(0, 10);
    const ip = request.headers.get("CF-Connecting-IP") || "0", ih = (await bSha("ninq-ip:" + (env.BOARD_ADMIN || "") + ":" + ip)).slice(0, 24);
    const rl = async function (k, max) {   // 그날 횟수 — 넘으면 true
      const d = (await st.get("rl:" + day)) || {}; if ((d[k] || 0) >= max) return true;
      d[k] = (d[k] || 0) + 1; await st.put("rl:" + day, d); await st.delete("rl:" + dayOld); return false;
    };
    const email = String(b.email || "").trim().toLowerCase();
    const emOk = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,}$/.test(email);
    const eh = emOk ? (await bSha("ninq-em:" + email)).slice(0, 24) : "";
    if (p === "/ninq/biz") return out(Object.assign({ ok: true }, await ninqBiz(env, b.bno)));
    if (p === "/ninq/code") {
      if (!emOk) return out({ ok: false, err: "email" }, 400);
      if (await rl("ipc:" + ih, 20)) return out({ ok: false, err: "rate" }, 429);
      if (await rl("emc:" + eh, 5)) return out({ ok: false, err: "rate" }, 429);
      const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
      const salt = bRand(8);
      await st.put("evc:" + eh, { salt: salt, h: await bSha(salt + ":" + code), exp: now + 10 * 60000, n: 0 });
      // 시험 모드 — 관리 비밀번호를 같이 보내면 메일 대신 코드를 돌려준다 (사장님·시험용)
      if (request.headers.get("x-admin")) {
        let xa = request.headers.get("x-admin"); try { xa = decodeURIComponent(xa); } catch (e) {}
        const r = await this.nAdmCall("check", { a: xa }); if (r.ok) return out({ ok: true, test: true, code: code });
      }
      const en = b.lang === "en";
      const XL = en && { ja: ["[Money Puzzle] 認証コード ", "認証コードは " + code + " です。\n10分間有効です。\n\nお心当たりがない場合は、このメールを無視してください。"],
        zhs: ["[Money Puzzle] 验证码 ", "您的验证码是 " + code + "。\n10分钟内有效。\n\n如果这不是您本人的操作，请忽略此邮件。"],
        zht: ["[Money Puzzle] 驗證碼 ", "您的驗證碼是 " + code + "。\n10分鐘內有效。\n\n如果這不是您本人的操作，請忽略此郵件。"],
        es: ["[Money Puzzle] Código de verificación ", "Tu código de verificación es " + code + ".\nEs válido durante 10 minutos.\n\nSi no lo has solicitado tú, ignora este correo."] }[String(b.ul || "")];   // 일·중 (10-18) · 스페인어 (10-22)
      const sent = await rMail(env, email, XL ? XL[0] + code : en ? "[Money Puzzle] Verification code " + code : "[머니퍼즐] 인증 코드 " + code,
        (XL ? XL[1] : en ? "Your verification code is " + code + ".\nIt is valid for 10 minutes.\n\nIf you did not request this, please ignore this email."
            : "인증 코드는 " + code + " 입니다.\n10분 동안 쓸 수 있습니다.\n\n요청하지 않으셨다면 이 메일은 무시하세요.") + "\n\nMoney Puzzle Navi · navi.moneypuzzle.co.kr");
      return out(sent ? { ok: true } : { ok: false, err: "mail" }, sent ? 200 : 502);
    }
    if (p === "/ninq/verify") {
      if (!emOk) return out({ ok: false, err: "email" }, 400);
      const v = await st.get("evc:" + eh);
      if (!v || v.exp < now) return out({ ok: false, err: "expired" }, 400);
      if (v.n >= 5) return out({ ok: false, err: "locked" }, 429);
      if (!bEq(await bSha(v.salt + ":" + String(b.code || "").replace(/\D/g, "")), v.h)) {
        v.n++; await st.put("evc:" + eh, v); return out({ ok: false, err: v.n >= 5 ? "locked" : "code", left: Math.max(0, 5 - v.n) }, v.n >= 5 ? 429 : 400);
      }
      await st.delete("evc:" + eh);
      const vt = bRand(16); await st.put("vt:" + vt, { email: email, exp: now + 30 * 60000, m: "email" });
      return out({ ok: true, vt: vt });
    }
    if (p !== "/ninq") return out({ ok: false, err: "path" }, 404);
    if (String(b.hp || "") !== "") return out({ ok: true });   // 로봇 — 받은 척만
    // ① 확인 결과 검사 — 지금은 이메일 코드 세션(vt). 다른 확인 방식을 붙이면 여기 한 곳만 바꾼다
    const idr = await ninqIdCheck(st, String(b.vt || ""), now);
    if (!idr.ok) return out({ ok: false, err: "verify" }, 403);
    const bz = await ninqBiz(env, b.bno);
    if (!bz.pass) return out({ ok: false, err: "bno", st: bz.st }, 400);
    const cl = function (v, max, one) { return bClean(v, max, one); };
    if (!ninqCatOk(b.cat)) return out({ ok: false, err: "cat" }, 400);
    const cat = String(b.cat), catx = cat === "etc" ? cl(b.catx, 40, true) : "";
    if (catx == null || (cat === "etc" && !catx)) return out({ ok: false, err: "cat" }, 400);
    const biz = cl(b.biz, 60, true), name = cl(b.name, 40, true), contact = cl(b.contact, 100, true), loc = cl(b.loc, 100, true), msg = cl(b.msg, 1000, false);
    if (biz == null || name == null || contact == null || loc == null || msg == null) return out({ ok: false, err: "long" }, 400);
    if (!biz || !name || !msg) return out({ ok: false, err: "empty" }, 400);
    if (contact && !hvContactOk(contact)) return out({ ok: false, err: "contact" }, 400);
    if (b.agree !== true) return out({ ok: false, err: "agree" }, 400);
    if (await rl("ips:" + ih, 3)) return out({ ok: false, err: "rate" }, 429);
    if (await rl("ems:" + (await bSha("ninq-em:" + idr.email)).slice(0, 24), 3)) return out({ ok: false, err: "rate" }, 429);
    const at = bKst(), id = "iq:" + now + ":" + bRand(2), lang = b.lang === "en" ? "en" : "ko";
    const rec = { at: at, ts: now, bno: bz.bno, bizSt: bz.st, biz: biz, cat: cat, catx: catx, name: name, contact: contact, email: idr.email, idm: idr.m, loc: loc, msg: msg, lang: lang };
    await st.put(id, rec);
    const SL = { active: "계속사업자 (국세청 확인)", pending: "국세청 확인 대기 — 형식·체크섬만 확인" };
    const mailed = await rMail(env, "emhwang3@moneypuzzle.co.kr", "[머니퍼즐 입점 문의] " + biz.slice(0, 30),
      "상호/회사: " + biz + "\n업종: " + ninqCatName(cat) + (catx ? " (" + catx + ")" : "") + "\n담당자: " + name + "\n사업자등록번호: " + bz.bno.replace(/^(\d{3})(\d{2})(\d{5})$/, "$1-$2-$3") + " · " + (SL[bz.st] || bz.st)
      + "\n이메일(인증됨): " + idr.email + "\n연락처: " + (contact || "-") + "\n위치: " + (loc || "-") + "\n언어: " + lang + "\n\n" + msg + "\n\n────────\n시각: " + at + " (KST) · 관리자 메뉴판 「입점 문의」에서도 볼 수 있습니다.");
    if (!mailed) await st.put(id, Object.assign(rec, { mailFail: 1 }));
    return out({ ok: true });
  }
  async ninqAdmin(request, url) {
    const g = await this.nAdm(request); if (g.res) return g.res; const out = g.out, st = this.state.storage, sp = url.searchParams;
    const idOk = function (id) { return /^iq:\d{10,16}:[0-9a-f]{4}$/.test(id || ""); };
    if (request.method === "POST") {
      const id = sp.get("read") || sp.get("del"); if (!idOk(id)) return out({ ok: false, err: "id" }, 400);
      if (!(await st.get(id))) return out({ ok: false, err: "none" }, 404);
      if (sp.get("del")) { await st.delete([id, "iqr:" + id]); return out({ ok: true, deleted: 1 }); }
      await st.put("iqr:" + id, 1); return out({ ok: true });
    }
    if (sp.get("contact")) {
      const id = sp.get("contact"); if (!idOk(id)) return out({ ok: false, err: "id" }, 400);
      const v = await st.get(id); if (!v) return out({ ok: false, err: "none" }, 404);
      return out({ ok: true, contact: v.contact || "", email: v.email || "" });
    }
    const m = await st.list({ prefix: "iq:", reverse: true, limit: 1000 }), items = [], old = [], full = sp.get("full") === "1", cut = Date.now() - 400 * 86400000;
    for (const [k, v] of m) {
      if ((v.ts || 0) < cut) { old.push(k, "iqr:" + k); continue; }
      const it = { id: k, at: v.at, bno: v.bno, bizSt: v.bizSt, biz: v.biz, cat: v.cat, catx: v.catx || "", name: v.name, loc: v.loc, msg: v.msg, lang: v.lang, mailFail: !!v.mailFail, hasContact: !!(v.contact || v.email) };
      if (full) { it.contact = v.contact || ""; it.email = v.email || ""; }
      items.push(it);
    }
    if (old.length) for (let i = 0; i < old.length; i += 128) await st.delete(old.slice(i, i + 128));
    const rd = items.length ? await st.get(items.slice(0, 128).map(function (i) { return "iqr:" + i.id; })) : new Map();
    let unread = 0; items.forEach(function (i) { i.read = !!rd.get("iqr:" + i.id); if (!i.read) unread++; });
    return out({ ok: true, unread: unread, items: items });
  }

  // ── 내비 그림별 누름 수 (사장님 2026-10-15) — 광고 팔 때 근거. 따로 된 칸("ntap")
  //   🔴 개인정보 없음: IP·기기ID·위치·쿠키를 받지도 남기지도 않는다. 앱이 보내는 건 장소키·지도·언어·종류·「오늘 첫 번」 표시뿐
  //   POST /ntap {k,v,l,e,u,f,x} (navi 오리진만, 한 요청 1건) → 하루 문서 "nt:YYYY-MM-DD" = {키:{m,t,u,ko,en,r,s,a,au}, "~":{dev}}
  //     t=카드 열림 · u=그 중 기기당 하루 첫 번 · r=길찾기·교통편 · s=공유 · a/au=약도 들어가기 · dev=그날 누른 기기 수 · x=1 은 시험("ntx:")
  //   GET /ntapstats?from=&to=[&test=1] (x-admin = NAVI_ADMIN) · POST /ntapstats?clear=test → 시험 문서만 지움
  async ntap(request, url, p) {
    const st = this.state.storage, o = request.headers.get("Origin") || "";
    const day = function (ms) { return new Date(ms + 9 * 3600000).toISOString().slice(0, 10); };
    if (p === "/ntap") {
      if (o !== "https://navi.moneypuzzle.co.kr") return new Response(null, { status: 403 });
      const H = { "Access-Control-Allow-Origin": o, "Cache-Control": "no-store", "Vary": "Origin" };
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }, H) });
      if (request.method !== "POST") return new Response(null, { status: 405, headers: H });
      let raw = ""; try { raw = await request.text(); } catch (e) {}
      if (raw.length > 400) return new Response(null, { status: 400, headers: H });
      let b = null; try { b = JSON.parse(raw); } catch (e) {}
      const ID = /^[A-Za-z0-9_-]{1,64}$/, EV = { tap: 1, route: 1, share: 1, open_area: 1, visit: 1, call: 1, search_pin: 1, trip_add: 1, trip_plan: 1, trip_pdf: 1, trip_eat: 1, gift: 1 };
      if (!b || typeof b !== "object" || Array.isArray(b) || !ID.test(String(b.k)) || !EV[b.e] || (b.v != null && b.v !== "" && !ID.test(String(b.v))))
        return new Response(null, { status: 400, headers: H });
      const doc = (b.x === 1 ? "ntx:" : "nt:") + day(Date.now());
      const d = (await st.get(doc)) || {};
      if (b.e === "visit") {   // 앱 열림 — 그날 "~" 칸에 열림 수(vis)·기기 수(visU)만
        const m = d["~"] || (d["~"] = {}); m.vis = (m.vis || 0) + 1; if (b.u === 1) m.visU = (m.visU || 0) + 1; if (b.f === 1) m.dev = (m.dev || 0) + 1;
        await st.put(doc, d); return new Response(null, { status: 204, headers: H });
      }
      let r = d[b.k];
      if (!r) { if (Object.keys(d).length >= 3000) return new Response(null, { status: 429, headers: H }); r = d[b.k] = {}; }
      const inc = function (f) { r[f] = (r[f] || 0) + 1; }, u = b.u === 1;
      if (b.v) r.m = String(b.v);
      if (b.e === "tap") { inc("t"); if (u) inc("u"); inc(b.l === "en" ? "en" : "ko"); }
      else if (b.e === "route") inc("r");
      else if (b.e === "share") inc("s");
      else if (b.e === "call") inc("c");
      else if (b.e === "search_pin") inc("p");
      else if (b.e === "trip_add") inc("ta"); else if (b.e === "trip_plan") inc("tp"); else if (b.e === "trip_pdf") inc("tf"); else if (b.e === "trip_eat") inc("te"); else if (b.e === "gift") inc("g");   // 선물 고르기 — 키는 종류 코드·매장 키 (10-16)   // 맞춤형 투어 (10-15)   // 검색 핀 — 키는 종류(sp_food 등)뿐, 가게 이름 없음 (10-15)   // 장소 카드 📞 전화 누름 (10-15)
      else { inc("a"); if (u) inc("au"); }
      if (b.f === 1) { const m = d["~"] || (d["~"] = {}); m.dev = (m.dev || 0) + 1; }
      await st.put(doc, d);
      return new Response(null, { status: 204, headers: H });
    }
    // 조회 — 관리 비밀번호(x-admin) 없으면 아무것도 안 준다 (검사는 nAdm 하나로 · 2026-10-15)
    const g = await this.nAdm(request); if (g.res) return g.res; const out = g.out;
    if (request.method === "POST") {
      if (url.searchParams.get("clear") !== "test") return out({ ok: false, err: "clear" }, 400);
      const ks = [...(await st.list({ prefix: "ntx:" })).keys()];
      for (let i = 0; i < ks.length; i += 128) await st.delete(ks.slice(i, i + 128));
      return out({ ok: true, deleted: ks.length });
    }
    const D = /^\d{4}-\d{2}-\d{2}$/, today = day(Date.now());
    let to = url.searchParams.get("to") || today, from = url.searchParams.get("from") || day(Date.now() - 6 * 86400000);
    if (!D.test(from) || !D.test(to)) return out({ ok: false, err: "date" }, 400);
    if (from > to) { const t = from; from = to; to = t; }
    const pre = url.searchParams.get("test") === "1" ? "ntx:" : "nt:";
    const dates = []; for (let t = Date.parse(from + "T00:00:00Z"), e = Date.parse(to + "T00:00:00Z"); t <= e && dates.length < 400; t += 86400000) dates.push(new Date(t).toISOString().slice(0, 10));
    const got = new Map();
    for (let i = 0; i < dates.length; i += 128) { const m = await st.get(dates.slice(i, i + 128).map(function (x) { return pre + x; })); for (const [k, v] of m) got.set(k, v); }
    const F = ["t", "u", "ko", "en", "r", "s", "a", "au", "c", "p", "ta", "tp", "tf", "te"], items = {}, days = [], daily = {}, total = { dev: 0, vis: 0, visU: 0 };
    F.forEach(function (f) { total[f] = 0; });
    dates.forEach(function (dt) {
      const d = got.get(pre + dt) || {}, mt = d["~"] || {}, row = { d: dt, dev: mt.dev || 0, vis: mt.vis || 0, visU: mt.visU || 0 }, dk = {};
      F.forEach(function (f) { row[f] = 0; });
      for (const k in d) {
        if (k === "~") continue;
        const r = d[k], it = items[k] || (items[k] = { k: k, m: "" });
        if (r.m) it.m = r.m;
        F.forEach(function (f) { const n = r[f] || 0; it[f] = (it[f] || 0) + n; row[f] += n; total[f] += n; });
        dk[k] = [r.t || 0, r.u || 0, r.r || 0, r.s || 0, r.a || 0, r.au || 0, r.c || 0];
      }
      total.dev += row.dev; total.vis += row.vis; total.visU += row.visU; days.push(row); daily[dt] = dk;
    });
    const list = Object.values(items).sort(function (x, y) { return (y.t || 0) - (x.t || 0) || (y.a || 0) - (x.a || 0) || (x.k < y.k ? -1 : 1); });
    return out({ ok: true, from: from, to: to, test: pre === "ntx:", total: total, days: days, items: list, daily: daily, dailyCols: ["t", "u", "r", "s", "a", "au", "c"] });
  }

  async hvoice(request) {
    const o = request.headers.get("Origin") || "";
    const origin = bOrigin(o);   // B_ORIGINS + 로컬 (2026-10-14 하위 도메인)
    if (request.method === "OPTIONS") {
      const h = { "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
      if (origin) h["Access-Control-Allow-Origin"] = origin;
      return new Response(null, { status: origin ? 204 : 403, headers: h });
    }
    if (!origin) return BJ({ ok: false, err: "origin" }, "", 403);
    if (request.method !== "POST") return BJ({ ok: false, err: "method" }, origin, 405);
    let raw = "";
    try { raw = await request.text(); } catch (e) {}
    if (raw.length > 8000) return BJ({ ok: false, err: "long" }, origin, 400);
    let b = {};
    try { b = JSON.parse(raw || "{}") || {}; } catch (e) { return BJ({ ok: false, err: "json" }, origin, 400); }
    if (String(b.hp || "") !== "") return BJ({ ok: true }, origin);   // 로봇 — 받은 척만
    const text = String(b.text == null ? "" : b.text).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim();
    const contact = String(b.contact == null ? "" : b.contact).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return BJ({ ok: false, err: "empty" }, origin, 400);
    if (text.length > 500 || contact.length > 100) return BJ({ ok: false, err: "long" }, origin, 400);
    if (!hvContactOk(contact)) return BJ({ ok: false, err: "contact" }, origin, 400);   // 연락처 필수 (사장님 2026-10-14)
    const src = b.src === "realty" ? "realty" : b.src === "navi" ? "navi" : "home";   // navi 따로 (2026-10-15, 메일 제목은 그대로)
    const lang = b.lang === "en" ? "en" : b.lang === "ko" ? "ko" : "";
    const page = String(b.page || request.headers.get("Referer") || "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200);
    const st = this.state.storage;
    const ip = request.headers.get("CF-Connecting-IP") || "0";
    const ih = (await bSha("hvoice-ip:" + (this.env.BOARD_ADMIN || "") + ":" + ip)).slice(0, 24);
    const hr = Math.floor(Date.now() / 3600000);
    const rk = "hvrl:" + ih + ":" + hr;
    const n = (await st.get(rk)) || 0;
    if (n >= 5) return BJ({ ok: false, err: "rate" }, origin, 429);
    const at = bKst();
    const key = "voice:" + Date.now() + ":" + bRand(2);
    await st.put({ [rk]: n + 1, [key]: { text: text, contact: contact, page: page, at: at, src: src, lang: lang } });
    await st.delete("hvrl:" + ih + ":" + (hr - 2));
    const subj = (src === "realty" ? "[머니퍼즐 부동산 고객의 소리] " : "[머니퍼즐 고객의 소리] ") + text.replace(/\s+/g, " ").slice(0, 30);
    const body = text + "\n\n────────\n연락처: " + (contact || "(없음)") + "\n시각: " + at + " (KST)\n페이지: " + (page || "(알 수 없음)");
    const mailed = await rMail(this.env, "emhwang3@moneypuzzle.co.kr", subj, body);
    if (this.env.TG_TOKEN && this.env.TG_CHAT) {   // 텔레그램도 (사장님 2026-10-17) — 연락처는 메일에만
      const SN = { home: "홈페이지", navi: "투어 앱", realty: "부동산 앱" };
      try { await fetch("https://api.telegram.org/bot" + this.env.TG_TOKEN + "/sendMessage", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: this.env.TG_CHAT, text: "📮 고객의 소리 · " + (SN[src] || src) + " · " + at + "\n\n" + text + "\n\n(연락처는 메일로)", disable_web_page_preview: true }) }); } catch (e) {}
    }
    if (!mailed) { try { await st.put(key, { text: text, contact: contact, page: page, at: at, src: src, lang: lang, mailFail: 1 }); } catch (e) {} }
    return BJ({ ok: true, mail: mailed }, origin);
  }

  // ── 고객 게시판 (사장님 2026-10-10) ──
  async board(request, url, p) {
    const origin = bOrigin(request.headers.get("Origin") || "");
    if (request.method === "OPTIONS") {
      const h = { "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
      if (origin) h["Access-Control-Allow-Origin"] = origin;
      return new Response(null, { status: 204, headers: h });
    }
    const st = this.state.storage;
    const SITE = "https://moneypuzzle.co.kr/board.html";
    const tg = async (text) => {
      if (!this.env.TG_TOKEN || !this.env.TG_CHAT) return;
      try {
        await fetch("https://api.telegram.org/bot" + this.env.TG_TOKEN + "/sendMessage", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: this.env.TG_CHAT, text: text, disable_web_page_preview: true }) });
      } catch (e) {}
    };
    if (request.method === "GET") {
      if (p === "/board/list") {
        const idx = (await st.get("bidx")) || [];
        const per = 20, pages = Math.max(1, Math.ceil(idx.length / per));
        const page = Math.max(1, Math.min(pages, parseInt(url.searchParams.get("page") || "1", 10) || 1));
        const ids = idx.slice((page - 1) * per, page * per);
        const m = ids.length ? await st.get(ids.map(function (i) { return "bp:" + i; })) : new Map();
        const items = [];
        for (const i of ids) {
          const v = m.get("bp:" + i); if (!v) continue;
          items.push({ id: v.id, nick: v.nick, title: "", at: v.at, nc: v.nc || 0, pv: "", secret: true });   // 비밀글 — 제목·내용은 /board/view 로만
        }
        return BJ({ ok: true, page: page, pages: pages, total: idx.length, items: items }, origin);
      }
      if (p === "/board/post") {
        const id = (url.searchParams.get("id") || "").replace(/[^a-z0-9]/g, "").slice(0, 40);
        const v = id ? await st.get("bp:" + id) : null;
        if (!v) return BJ({ ok: false, err: "notfound" }, origin, 404);
        return BJ({ ok: false, err: "locked", post: { id: v.id, nick: v.nick, at: v.at } }, origin);   // 비밀글 — 비밀번호로 POST /board/view
      }
      return BJ({ ok: false, err: "path" }, origin, 404);
    }
    if (request.method !== "POST") return BJ({ ok: false, err: "method" }, origin, 405);
    if (!origin) return BJ({ ok: false, err: "origin" }, origin, 403);
    let b;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return BJ({ ok: false, err: "long" }, origin, 413);
      b = JSON.parse(raw) || {};
    } catch (e) { return BJ({ ok: false, err: "json" }, origin, 400); }

    const bOk = async (v, pw) => !!pw && ((this.env.BOARD_ADMIN && this.env.BOARD_ADMIN.length >= 16 && bEq(pw, this.env.BOARD_ADMIN)) || bEq(await bSha(v.salt + ":" + pw), v.h));
    if (p === "/board/view") {                         // 비밀글 열기 — 글쓴이 비밀번호 또는 관리자 비밀번호 (2026-10-11)
      const id = String(b.id || "").replace(/[^a-z0-9]/g, "").slice(0, 40);
      const v = id ? await st.get("bp:" + id) : null;
      if (!v) return BJ({ ok: false, err: "notfound" }, origin, 404);
      const ip0 = request.headers.get("CF-Connecting-IP") || "0";
      const fk = "bvf:" + (await bSha("bv:" + ip0)).slice(0, 20) + ":" + Math.floor(Date.now() / 600000);
      const fails = (await st.get(fk)) || 0;
      if (fails >= 10) return BJ({ ok: false, err: "rate" }, origin, 429);   // 10분에 10번 틀리면 잠깐 막는다
      if (!(await bOk(v, String(b.pw || "").slice(0, 100)))) { await st.put(fk, fails + 1); return BJ({ ok: false, err: "pw" }, origin, 403); }
      const cm = await st.list({ prefix: "bc:" + id + ":" });
      const comments = [];
      for (const [k, c] of cm) comments.push({ id: c.id, nick: c.nick, body: c.body, at: c.at });
      return BJ({ ok: true, post: { id: v.id, nick: v.nick, title: v.title, body: v.body, at: v.at, nc: comments.length }, comments: comments }, origin);
    }

    if (p === "/board/delete") {
      const kind = b.kind === "comment" ? "comment" : (b.kind === "post" ? "post" : "");
      const id = String(b.id || "").replace(/[^a-z0-9_]/g, "").slice(0, 80);
      const pw = String(b.pw || "").slice(0, 100);
      if (!kind || !id || !pw) return BJ({ ok: false, err: "empty" }, origin, 400);
      const key = kind === "post" ? "bp:" + id : (id.indexOf("_") > 0 ? "bc:" + id.split("_")[0] + ":" + id : "");
      const v = key ? await st.get(key) : null;
      if (!v) return BJ({ ok: false, err: "notfound" }, origin, 404);
      const admin = !!(this.env.BOARD_ADMIN && this.env.BOARD_ADMIN.length >= 16 && bEq(pw, this.env.BOARD_ADMIN));
      if (!admin && !bEq(await bSha(v.salt + ":" + pw), v.h)) return BJ({ ok: false, err: "pw" }, origin, 403);
      if (kind === "post") {
        const cm = await st.list({ prefix: "bc:" + id + ":" });
        const dels = ["bp:" + id].concat([...cm.keys()]);
        for (let i = 0; i < dels.length; i += 128) await st.delete(dels.slice(i, i + 128));
        const idx = (await st.get("bidx")) || [];
        await st.put("bidx", idx.filter(function (x) { return x !== id; }));
      } else {
        await st.delete(key);
        const pk = "bp:" + v.post, pv = await st.get(pk);
        if (pv) { pv.nc = Math.max(0, (pv.nc || 1) - 1); await st.put(pk, pv); }
      }
      return BJ({ ok: true, admin: admin }, origin);
    }

    if (p !== "/board/post" && p !== "/board/comment") return BJ({ ok: false, err: "path" }, origin, 404);
    const isPost = p === "/board/post";
    const nick = bClean(b.nickname, 20, true), body = bClean(b.body, isPost ? 2000 : 500, false);
    const title = isPost ? bClean(b.title, 80, true) : "";
    const pw = String(b.pw || "");
    if (nick === null || body === null || title === null) return BJ({ ok: false, err: "long" }, origin, 400);
    if (!nick || !body || (isPost && !title) || pw.length < 4) return BJ({ ok: false, err: "empty" }, origin, 400);
    if (pw.length > 64) return BJ({ ok: false, err: "long" }, origin, 400);
    if (bLinks(title + " " + body) > 3) return BJ({ ok: false, err: "links" }, origin, 400);
    let pid = "", pv = null;
    if (!isPost) {
      pid = String(b.post || "").replace(/[^a-z0-9]/g, "").slice(0, 40);
      pv = pid ? await st.get("bp:" + pid) : null;
      if (!pv) return BJ({ ok: false, err: "notfound" }, origin, 404);
      if (!(await bOk(pv, String(b.vpw || "").slice(0, 100)))) return BJ({ ok: false, err: "pw" }, origin, 403);   // 비밀글 — 연 사람만 댓글
    }
    // 시간당 제한 (글 5 · 댓글 20) — IP 는 해시만 둔다
    const ip = request.headers.get("CF-Connecting-IP") || "0";
    const ih = (await bSha("board-ip:" + (this.env.BOARD_ADMIN || "") + ":" + ip)).slice(0, 24);
    const hr = Math.floor(Date.now() / 3600000);
    const rk = "brl:" + ih + ":" + hr;
    const rl = (await st.get(rk)) || { p: 0, c: 0 };
    if (isPost ? rl.p >= 5 : rl.c >= 20) return BJ({ ok: false, err: "rate" }, origin, 429);
    if (isPost) rl.p++; else rl.c++;
    const salt = bRand(8), h = await bSha(salt + ":" + pw), at = bKst();
    const nid = String(Date.now()).padStart(14, "0") + bRand(2);
    const puts = { [rk]: rl };
    let newId, msg;
    if (isPost) {
      const idx = (await st.get("bidx")) || [];
      idx.unshift(nid);
      puts["bp:" + nid] = { id: nid, nick: nick, title: title, body: body, at: at, salt: salt, h: h, nc: 0 };
      puts["bidx"] = idx;
      newId = nid;
      msg = "📋 게시판 새 글 · " + at + "\n\n" + nick + " — " + title + "\n" + body.slice(0, 200) + "\n\n" + SITE + "?id=" + nid;
    } else {
      pv.nc = (pv.nc || 0) + 1;
      newId = pid + "_" + nid;
      puts["bp:" + pid] = pv;
      puts["bc:" + pid + ":" + newId] = { id: newId, post: pid, nick: nick, body: body, at: at, salt: salt, h: h };
      msg = "💬 게시판 새 댓글 · " + at + "\n\n「" + pv.title + "」에\n" + nick + ": " + body.slice(0, 200) + "\n\n" + SITE + "?id=" + pid;
    }
    await st.put(puts);
    await st.delete("brl:" + ih + ":" + (hr - 2));
    await tg(msg);
    return BJ({ ok: true, id: newId }, origin);
  }

  // ── 부동산 손님 → 입점 중개사무소 연결 (사장님 2026-10-13) — 따로 된 칸("realty") ──
  //   공개: GET /realty/agents?sg= · POST /realty/join · POST /realty/lead
  //   사무소: POST /realty/login · /realty/setpw · /realty/agent/pw · /realty/agent/leads · /realty/agent/status · /realty/agent/lead/del
  //   관리자(x-admin = BOARD_ADMIN): GET /realty/admin/all · POST /realty/admin/{approve,reject,upsert,setup,active,agentview,delete}
  //   🔴 비밀번호는 PBKDF2 해시만 · IP 는 해시만 · 텔레그램엔 손님 연락처를 안 보낸다
  async realty(request, url, p) {
    const origin = bOrigin(request.headers.get("Origin") || "");
    if (request.method === "OPTIONS") {
      const h = { "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, x-admin", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
      if (origin) h["Access-Control-Allow-Origin"] = origin;
      return new Response(null, { status: 204, headers: h });
    }
    const st = this.state.storage, env = this.env, now = Date.now();
    const R = (o, s) => BJ(o, origin, s);
    const tg = async (text) => {
      if (!env.TG_TOKEN || !env.TG_CHAT) return;
      try {
        await fetch("https://api.telegram.org/bot" + env.TG_TOKEN + "/sendMessage", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: env.TG_CHAT, text: text, disable_web_page_preview: true }) });
      } catch (e) {}
    };
    const ip = request.headers.get("CF-Connecting-IP") || "0";
    const ih = (await bSha("realty-ip:" + (env.REALTY_SECRET || "") + ":" + ip)).slice(0, 24);
    // 횟수 제한 — 창(win ms) 안에 max 번까지. count=false 면 세지 않고 넘었는지만 본다
    const over = async (kind, max, win, count) => {
      const b = Math.floor(now / win), k = "rl:" + kind + ":" + b, n = (await st.get(k)) || 0;
      if (n >= max) return true;
      if (count !== false) { await st.put(k, n + 1); await st.delete("rl:" + kind + ":" + (b - 2)); }
      return false;
    };
    const bump = async (kind, win) => { const b = Math.floor(now / win), k = "rl:" + kind + ":" + b; await st.put(k, ((await st.get(k)) || 0) + 1); await st.delete("rl:" + kind + ":" + (b - 2)); };
    const getMany = async (keys) => {
      const out = new Map();
      for (let i = 0; i < keys.length; i += 128) { const g = await st.get(keys.slice(i, i + 128)); g.forEach(function (v, k) { out.set(k, v); }); }
      return out;
    };
    const pub = (a) => ({ reg: a.reg, name: a.name, ceo: a.ceo, addr: a.addr, tel: a.tel || [], areas: a.areas || [], langs: a.langs || [], aph: a.aph || [], face: a.face || "", intro: a.intro || "" });
    const allAgencies = async () => { const regs = await rIdxGet(st, "agidx"); const m = await getMany(regs.map(function (r) { return "ag:" + r; })); return regs.map(function (r) { return m.get("ag:" + r); }).filter(Boolean); };
    const leadsFor = async (reg) => {
      const ids = (await rIdxGet(st, "agl:" + reg)).slice(0, 500);
      const m = await getMany(ids.map(function (i) { return "ld:" + i; }));
      const out = [], vals = await Promise.all(ids.map(function (i) { return m.get("ld:" + i); }).filter(Boolean).map(function (v) { return piiOpen(env, "ld", "ld:" + v.id, v); }));   // 암호 풀기 (2026-10-22)
      // 전담 없는 손님 매물 문의(pool) — 지금 그 매물을 누가 맡았는지 (2026-10-22)
      const lm = await getMany([...new Set(vals.filter(function (v) { return v.pool && v.lst && v.lst.id; }).map(function (v) { return "ls:" + v.lst.id; }))]);
      for (const v of vals) {
        const o = { id: v.id, door: v.door, pt: v.pt, deal: v.deal, region: v.region, details: v.details, name: v.name, phone: v.phone, lang: v.lang, at: v.at, st: (v.st || {})[reg] || "new", lst: v.lst || null, pub: v.pub || null };
        if (v.pool && v.lst) { const l = lm.get("ls:" + v.lst.id); o.pool = true; o.tk = !l ? "gone" : ((l.regs || [])[0] || "");
          if (o.tk !== reg) { o.name = ""; o.phone = ""; o.hid = true; } }   // 맡기 전·다른 사무소가 맡음 — 사는 사람 이름·연락처는 서버가 뺀다 (사장님 2026-10-22)
        out.push(o); }
      return out;
    };
    // ── 관리자에게 문의 (사장님 2026-10-14) — iq:<reg> 사무소별 대화 · iqp:<reg>:<pid> 사진 · iqidx 대화 목록 ──
    const tgOk = async (text) => {   // 보냈는지 돌려준다
      if (!env.TG_TOKEN || !env.TG_CHAT) return false;
      try { const r = await fetch("https://api.telegram.org/bot" + env.TG_TOKEN + "/sendMessage", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: env.TG_CHAT, text: text, disable_web_page_preview: true }) }); return r.ok; } catch (e) { return false; }
    };
    const iqGet = async (reg) => (await st.get("iq:" + reg)) || { reg: reg, msgs: [], unread: 0, aunread: 0, last: 0 };
    const iqPut = async (reg, t) => {   // 대화는 30개까지 — 넘치면 오래된 것(사진 포함)부터 지운다
      const drop = t.msgs.length > 30 ? t.msgs.splice(0, t.msgs.length - 30) : [];
      await st.put("iq:" + reg, t);
      const dp = drop.filter(function (m) { return m.ph; }).map(function (m) { return "iqp:" + reg + ":" + m.ph; }); if (dp.length) await st.delete(dp);
      const idx = await rIdxGet(st, "iqidx"); if (idx.indexOf(reg) < 0) { idx.push(reg); await rIdxPut(st, "iqidx", idx); }
    };
    const iqDel = async (reg) => {
      const t = await st.get("iq:" + reg); if (!t) return;
      const dp = (t.msgs || []).filter(function (m) { return m.ph; }).map(function (m) { return "iqp:" + reg + ":" + m.ph; }); if (dp.length) await st.delete(dp);
      await st.delete("iq:" + reg); await rIdxPut(st, "iqidx", (await rIdxGet(st, "iqidx")).filter(function (x) { return x !== reg; }));
    };
    // 잠금 — 임시 비밀번호(24시간)를 만들어 메일로. 메일을 못 보내면 잠그기만 한다. 하루 3통까지
    const lockMail = async (ag, put) => {
      ag.locked = true; ag.fail = 0; ag.pv = (ag.pv || 0) + 1; ag.tmp = null; ag.lockAt = bKst();
      const day = bKst().slice(0, 10), md = ag.mailday && ag.mailday.d === day ? ag.mailday : { d: day, n: 0 };
      let why = !ag.email ? "noemail" : !env.RESEND_KEY ? "nomail" : md.n >= 3 ? "limit" : "";
      if (!why) {
        const tp = rTempPw(10), salt = bRand(8), exp = now + 86400000;
        const expS = new Date(exp + 9 * 3600000).toISOString().slice(0, 16).replace("T", " ");
        const ok = await rMail(env, ag.email, "[Money Puzzle] 임시 비밀번호 / Temporary password",
          "머니퍼즐 부동산 — " + ag.name + "\n\n비밀번호를 5번 틀려 계정이 잠겼습니다. 아래 임시 비밀번호로 로그인한 뒤 새 비밀번호를 정해 주세요.\n"
          + "Your account was locked after 5 wrong passwords. Log in with this temporary password and set a new one.\n\n"
          + "임시 비밀번호 / Temporary password: " + tp + "\n유효 기간 / Valid until: " + expS + " (KST)\n\nhttps://moneypuzzle.co.kr/\n\n"
          + "본인이 아니면 이 메일을 무시하고 관리자에게 알려 주세요. / If this was not you, ignore this email and tell the administrator.");
        if (ok) { ag.tmp = { salt: salt, h: await rHash(salt, tp), exp: exp }; md.n++; ag.mailday = md; } else why = "send";
      }
      await (put ? put(ag) : st.put("ag:" + ag.reg, ag));
      return { mailed: !why, why: why };
    };
    const token = async (ag) => {
      const pl = b64u(JSON.stringify({ r: ag.reg, e: now + 30 * 86400000, v: ag.pv || 0 }));
      return pl + "." + (await rHmac(env.REALTY_SECRET || "", pl));
    };
    const fromToken = async (t) => {
      t = String(t || ""); const i = t.indexOf("."); if (i < 1 || !env.REALTY_SECRET) return null;
      const pl = t.slice(0, i), sig = t.slice(i + 1);
      if (!bEq(sig, await rHmac(env.REALTY_SECRET, pl))) return null;
      let o; try { o = JSON.parse(unb64u(pl)); } catch (e) { return null; }
      if (!o || !o.r || !(o.e > now)) return null;
      const ag = await st.get("ag:" + o.r);
      if (!ag || !ag.active || !ag.h || (ag.pv || 0) !== o.v) return null;
      return ag;
    };
    // ── 제휴 업체 계정 (사장님 2026-10-14) — 이삿짐·청소 등 여섯 업종 ──
    //   pa:<사업자번호 10자리> = {biz,pkey,salt,h,setup,pv,locked,fail,tmp,mustpw,active,at,mailday} — 로그인만
    //   업체 정보는 ptn:<키> 그대로 (intro·price·tel·email·areas·ph, pa=사업자번호) · 받은 요청 pl:<id> · 목록 pal:<pid>
    //   사진 ptp:<pid>:<q> · 문의 iq:pt-<pid> · pid = ptn: 뒤 글자 (손님에게 보이는 번호 — 사업자번호는 안 보인다)
    const PID_RE = /^\d{10,16}-[0-9a-f]{2,16}$/;
    const pidOf = (key) => String(key || "").slice(4);
    const bizOf = (x) => String(x || "").replace(/\D/g, "");
    const paPut = (pa) => { const c = Object.assign({}, pa); delete c.email; delete c.name; return st.put("pa:" + pa.biz, c); };
    const ptPub = (key, v) => ({ id: pidOf(key), kind: v.kind, name: v.name, intro: v.intro || "", price: v.price || "", tel: v.tel || "",
      areas: v.areas || [], area: v.areas && v.areas.length ? "" : (v.area || ""), ph: v.ph || [] });
    const paMake = async (key, rec) => {   // 계정 만들기(없으면) + 설정 코드 — rec.pa 를 채운다(저장은 부른 쪽)
      const biz = bizOf(rec.bizno); if (biz.length !== 10) return { err: "bizno" };
      let pa = await st.get("pa:" + biz);
      if (pa && pa.pkey !== key && (await st.get(pa.pkey))) return { err: "dupbiz" };
      if (!pa || pa.pkey !== key) pa = { biz: biz, pkey: key, salt: "", h: "", pv: 0, active: true, at: bKst() };
      const a32 = new Uint32Array(1); crypto.getRandomValues(a32);
      const code = String(a32[0] % 1000000).padStart(6, "0"), exp = now + 7 * 86400000;
      pa.setup = { code: code, exp: exp }; pa.salt = ""; pa.h = ""; pa.pv = (pa.pv || 0) + 1;
      pa.locked = false; pa.fail = 0; pa.tmp = null; pa.mustpw = false;
      await paPut(pa); rec.pa = biz;
      return { code: code, exp: exp, pa: pa };
    };
    const ptoken = async (pa) => {
      const pl = b64u(JSON.stringify({ p: pa.biz, e: now + 30 * 86400000, v: pa.pv || 0 }));
      return pl + "." + (await rHmac(env.REALTY_SECRET || "", pl));
    };
    const pFromToken = async (t) => {   // 사무소 토큰(r)과 섞이지 않게 p 만 받는다
      t = String(t || ""); const i = t.indexOf("."); if (i < 1 || !env.REALTY_SECRET) return null;
      const pl = t.slice(0, i), sig = t.slice(i + 1);
      if (!bEq(sig, await rHmac(env.REALTY_SECRET, pl))) return null;
      let o; try { o = JSON.parse(unb64u(pl)); } catch (e) { return null; }
      if (!o || !o.p || o.r || !(o.e > now)) return null;
      const pa = await st.get("pa:" + bizOf(o.p).slice(0, 10));
      if (!pa || !pa.active || !pa.h || (pa.pv || 0) !== o.v) return null;
      const rec = await st.get(pa.pkey); if (!rec || rec.pa !== pa.biz) return null;
      return { pa: pa, rec: rec };
    };
    const pleadsFor = async (pid) => {
      const ids = (await rIdxGet(st, "pal:" + pid)).slice(0, 500);
      const m = await getMany(ids.map(function (i) { return "pl:" + i; }));
      const vs = await Promise.all(ids.map(function (i) { const v = m.get("pl:" + i); return v ? piiOpen(env, "pl", "pl:" + v.id, v) : null; }));   // 암호 풀기 (2026-10-22)
      return vs.map(function (v) { return v ? { id: v.id, memo: v.memo, name: v.name, contact: v.contact, at: v.at, st: v.st || "new" } : null; }).filter(Boolean);
    };

    // ── 공개 GET ──
    if (request.method === "GET" && p === "/realty/agents") {
      const sg = (url.searchParams.get("sg") || "").split(",").map(function (s) { return s.replace(/\D/g, ""); }).filter(function (s) { return s.length === 5; }).slice(0, 40);
      if (!sg.length) return R({ ok: true, items: [] });
      const items = (await allAgencies()).filter(function (a) {
        return a.active && (a.areas || []).some(function (ar) { return ar.c && sg.some(function (c) { return c.indexOf(ar.c) === 0; }); }); }).map(pub);
      return R({ ok: true, items: items });
    }

    // ── 매물 (사장님 2026-10-13) ── ls:<id> 매물 · lsp:<id>:<pid> 사진 · agls:<reg> 사무소별 · lsa:<sg> 지역별 · lsidx 전체
    //   30일 동안 「다시 확인」이 없으면 손님에게 안 보인다 · 사무소 사진 agp:<reg>:<pid> (ag.aph)
    const LS_DAYS = 30 * 86400000;
    const lsDel = async (id) => {
      const v = await st.get("ls:" + id); if (!v) return false;
      const nms = ["lsa:" + v.sg, "lsidx"].concat(v.own === "c" ? (v.regs || []).map(function (r) { return "agcl:" + r; }) : ["agls:" + v.reg]);   // 손님 매물(own=c)은 전담 목록 agcl:<reg> (2026-10-22)
      for (const nm of nms) { const l = await rIdxGet(st, nm); if (l.indexOf(id) >= 0) await rIdxPut(st, nm, l.filter(function (x) { return x !== id; })); }
      await st.delete(["ls:" + id].concat((v.ph || []).map(function (q) { return "lsp:" + id + ":" + q; })));
      return true;
    };
    // 손님 매물(own="c", 팔기에서 공개 동의 · 2026-10-22) — 이름·연락처는 ls: 에 아예 없다(ld: 에만). 전담 사무소 = regs (없으면 [])
    const lsPub = (v, ag, full, am) => {
      const o = Object.assign({}, v);
      if (!full && o.amode === "dong") { delete o.jibun; delete o.floor; delete o.bname; }
      delete o.qat; delete o.ih;
      if (o.own === "c") {
        o.cust = true; o.ag = null;
        o.ags = (o.regs || []).map(function (r) { return am ? am.get("ag:" + r) : null; }).filter(function (a) { return a && a.active; }).map(pub);
        if (!full) { delete o.lead; delete o.regs; delete o.tk; }
      } else { o.ag = ag ? pub(ag) : null; o.ags = o.ag ? [o.ag] : []; }
      o.live = now - (v.cf || 0) <= LS_DAYS;
      return o;
    };
    // ── 손님 개인정보 매일 정리 (사장님 2026-10-22) — 접수 1년(365일) 지난 손님 요청(ld:)·제휴 업체 문의(pl:)·허위매물 신고(rpt:)와
    //    손님 공개 매물(ls: own=c) 지우기 + 남은 평문 이름·연락처 암호화. 사무소 계정·사무소 매물은 손대지 않는다
    const piiJob = async (force) => {
      const day = bKst().slice(0, 10), last = await st.get("pii:last");
      if (!force && last && last.day === day) return null;
      const cut = now - 365 * 86400000, del = { ld: 0, pl: 0, rpt: 0, ls: 0 }, enc = { ld: 0, pl: 0, rpt: 0 };
      const idxRm = {}; const rm = (nm, id) => { (idxRm[nm] = idxRm[nm] || new Set()).add(id); };
      const canEnc = !!(await piiKey(env));
      for (const [k, v] of await st.list({ prefix: "ld:" })) {
        if (!v) continue; const id = k.slice(3), t = rAtMs(v.at);
        if (t && t < cut) {
          (v.agencies || []).forEach(function (r) { rm("agl:" + r, id); }); rm("ldidx", id);
          if (v.pub) { const l = await st.get("ls:" + v.pub); if (l && l.own === "c" && await lsDel(v.pub)) del.ls++; }
          await st.delete(k); del.ld++;
        } else if (canEnc && !v.pe && (v.name != null || v.phone != null)) { await st.put(k, await piiSeal(env, "ld", k, v)); enc.ld++; }
      }
      for (const [k, v] of await st.list({ prefix: "pl:" })) {
        if (!v) continue; const id = k.slice(3), t = rAtMs(v.at);
        if (t && t < cut) { if (v.pid) rm("pal:" + v.pid, id); await st.delete(k); del.pl++; }
        else if (canEnc && !v.pe && (v.name != null || v.contact != null)) { await st.put(k, await piiSeal(env, "pl", k, v)); enc.pl++; }
      }
      for (const [k, v] of await st.list({ prefix: "rpt:" })) {
        if (!v) continue; const t = rAtMs(v.at);
        if (t && t < cut) { await st.delete(k); del.rpt++; }
        else if (canEnc && !v.pe && v.contact != null) { await st.put(k, await piiSeal(env, "rpt", k, v)); enc.rpt++; }
      }
      for (const id of await rIdxGet(st, "lsidx")) {   // 요청 기록 없이 남은 손님 매물 — 올린 지 1년 지나면
        const l = await st.get("ls:" + id); if (l && l.own === "c" && (l.at || 0) && l.at < cut && await lsDel(id)) del.ls++;
      }
      for (const nm in idxRm) { const l = await rIdxGet(st, nm), s2 = idxRm[nm], nl = l.filter(function (x) { return !s2.has(x); }); if (nl.length !== l.length) await rIdxPut(st, nm, nl); }
      // 내려받기 기록은 최근 1,000건만
      const dk = [...(await st.list({ prefix: "dl:", reverse: true })).keys()].slice(1000); for (let i = 0; i < dk.length; i += 128) await st.delete(dk.slice(i, i + 128));
      const res = { day: day, at: bKst(), del: del, enc: enc, key: canEnc };
      await st.put("pii:last", res);
      const lg = (await st.get("pii:log")) || []; lg.unshift(res); await st.put("pii:log", lg.slice(0, 60));
      console.log("realty pii job " + JSON.stringify(res));
      return res;
    };
    if (p === "/realty/__cron") { const r = await piiJob(false); return new Response(JSON.stringify({ ok: true, ran: !!r, res: r }), { headers: { "content-type": "application/json" } }); }
    const lsAgMap = async (vs) => { const s = new Set(); vs.forEach(function (v) { if (v.own === "c") (v.regs || []).forEach(function (r) { s.add("ag:" + r); }); else s.add("ag:" + v.reg); }); return getMany([...s]); };
    if (request.method === "GET" && p === "/realty/listings") {
      const sg = (url.searchParams.get("sg") || "").split(",").map(function (s) { return s.replace(/\D/g, ""); }).filter(function (s) { return s.length === 5; }).slice(0, 10);
      const dong = rTxt(url.searchParams.get("dong") || "", 20), all = url.searchParams.get("all") === "1";   // all=1 — 전체 매물 (2026-10-14)
      if (!sg.length && !all) return R({ ok: true, items: [] });
      let ids = []; if (all) ids = await rIdxGet(st, "lsidx"); else for (const c of sg) ids = ids.concat(await rIdxGet(st, "lsa:" + c));
      ids = ids.slice(0, 800);
      const m = await getMany(ids.map(function (i) { return "ls:" + i; }));
      const vs = ids.map(function (i) { return m.get("ls:" + i); }).filter(function (v) { return v && now - (v.cf || 0) <= LS_DAYS && (!dong || v.dong === dong); });
      const am = await lsAgMap(vs);
      const items = vs.filter(function (v) { if (v.own === "c") return true; const a = am.get("ag:" + v.reg); return a && a.active; }).map(function (v) { return lsPub(v, am.get("ag:" + v.reg), false, am); });
      if (all) { items.sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); return R({ ok: true, items: items.slice(0, 300) }); }
      items.sort(function (a, b) { return (b.up || 0) - (a.up || 0); });
      return R({ ok: true, items: items });
    }
    // 제휴업체 검색 (2026-10-14) — 「입점 중」 + 계정 활성인 곳만, 공개 칸만 (사업자번호·이메일·관리 칸 없음)
    if (request.method === "GET" && p === "/realty/partners") {
      const kind = String(url.searchParams.get("kind") || "");
      if (PTN_KINDS.indexOf(kind) < 0) return R({ ok: false, err: "kind" }, 400);
      const sg = (url.searchParams.get("sg") || "").split(",").map(function (x) { return x.replace(/\D/g, ""); }).filter(function (x) { return x.length === 5; }).slice(0, 60);
      const pm = await st.list({ prefix: "ptn:" }), live = [];
      for (const [k, v] of pm) if (v && v.kind === kind && v.st === "입점 중" && v.pa) live.push([k, v]);
      const am = await getMany(live.map(function (x) { return "pa:" + x[1].pa; }));
      const items = live.filter(function (x) { const a = am.get("pa:" + x[1].pa); return a && a.active && a.pkey === x[0]; })
        .filter(function (x) { return !sg.length || (x[1].areas || []).some(function (ar) { return ar.c && sg.some(function (c) { return c.indexOf(ar.c) === 0; }); }); })
        .map(function (x) { return ptPub(x[0], x[1]); });
      return R({ ok: true, items: items });
    }
    if (request.method === "GET" && p === "/realty/pphoto") {
      const id = String(url.searchParams.get("id") || ""), q = rId(url.searchParams.get("p"));
      const bin = PID_RE.test(id) && q ? await st.get("ptp:" + id + ":" + q) : null;
      if (!bin) return new Response("not found", { status: 404, headers: { "Cache-Control": "no-store" } });
      return new Response(bin, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=604800, immutable", "Access-Control-Allow-Origin": "*" } });
    }
    if (request.method === "GET" && (p === "/realty/photo" || p === "/realty/aphoto" || p === "/realty/iqphoto" || p === "/realty/face")) {
      const q = rId(url.searchParams.get("p"));
      const k = p === "/realty/photo" ? "lsp:" + rId(url.searchParams.get("id")) + ":" + q : (p === "/realty/iqphoto" ? "iqp:" : (p === "/realty/face" ? "agf:" : "agp:")) + rReg(url.searchParams.get("r")) + ":" + q;
      const bin = q ? await st.get(k) : null;
      if (!bin) return new Response("not found", { status: 404, headers: { "Cache-Control": "no-store" } });
      return new Response(bin, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=604800, immutable", "Access-Control-Allow-Origin": "*" } });
    }

    // ── 관리자 ──
    if (p.startsWith("/realty/admin/")) {
      const k = env.BOARD_ADMIN || "", a = request.headers.get("x-admin") || "";
      if (await over("adf:" + ih, 20, 600000, false)) return R({ ok: false, err: "rate" }, 429);
      // 관리자 비밀번호를 바꿨으면(admh) 그것만 받는다 — 안 바꿨으면 BOARD_ADMIN (2026-10-13). 다른 길의 BOARD_ADMIN 은 그대로
      const admh = await st.get("admh");
      const okA = admh && admh.h ? (a.length >= 6 && a.length <= 100 && bEq(await rHash(admh.salt, a), admh.h)) : (k.length >= 16 && bEq(a, k));
      if (!okA) { await bump("adf:" + ih, 600000); return R({ ok: false, err: "admin" }, 403); }
      if (p === "/realty/admin/all" && request.method === "GET") {
        const jids = (await rIdxGet(st, "jnidx")).slice(0, 300), lids = (await rIdxGet(st, "ldidx")).slice(0, 500);
        const jm = await getMany(jids.map(function (i) { return "jn:" + i; })), lm = await getMany(lids.map(function (i) { return "ld:" + i; }));
        const joins = jids.map(function (i) { const v = jm.get("jn:" + i); if (!v) return null; const o = Object.assign({}, v); delete o.salt; delete o.h; return o; }).filter(Boolean);
        const ags = (await allAgencies()).map(function (v) { const o = Object.assign({}, v); o.hasPw = !!v.h; o.tmpLive = !!(v.tmp && v.tmp.exp > now); delete o.salt; delete o.h; delete o.tmp; return o; });
        const leads = await Promise.all(lids.map(function (i) { return lm.get("ld:" + i); }).filter(Boolean).map(function (v) { return piiOpen(env, "ld", "ld:" + v.id, v); }));
        return R({ ok: true, joins: joins, agencies: ags, leads: leads, mailCfg: !!env.RESEND_KEY });
      }
      if (p === "/realty/admin/dlog" && request.method === "GET") {   // 내려받기 기록 최근 100건 + 개인정보 정리 기록 (2026-10-22)
        const m = await st.list({ prefix: "dl:", reverse: true, limit: 100 });
        return R({ ok: true, items: [...m].map(function (e) { return Object.assign({ k: e[0].slice(3) }, e[1]); }), pii: ((await st.get("pii:log")) || []).slice(0, 14) });
      }
      if (p === "/realty/admin/iq" && request.method === "GET") {   // 문의 대화 — 최근 것부터
        const ak = function (r) { return r.indexOf("pt-") === 0 ? "ptn:" + r.slice(3) : "ag:" + r; };
        const regs = await rIdxGet(st, "iqidx"), m = await getMany(regs.map(function (r) { return "iq:" + r; })), am = await getMany(regs.map(ak));
        const items = regs.map(function (r) { const t = m.get("iq:" + r); if (!t) return null; const a = am.get(ak(r)); return Object.assign({}, t, { name: a ? a.name : r, pt: r.indexOf("pt-") === 0 }); }).filter(Boolean);
        items.sort(function (a, b) { return (b.last || 0) - (a.last || 0); });
        return R({ ok: true, items: items });
      }
      if (p === "/realty/admin/listings" && request.method === "GET") {   // 매물 전체 (2026-10-13)
        const ids = (await rIdxGet(st, "lsidx")).slice(0, 3000), m = await getMany(ids.map(function (i) { return "ls:" + i; }));
        const vs = ids.map(function (i) { return m.get("ls:" + i); }).filter(Boolean);
        const am = await lsAgMap(vs);
        return R({ ok: true, items: vs.map(function (v) { return lsPub(v, am.get("ag:" + v.reg), true, am); }) });
      }
      // ── 제휴 업체 관리 (사장님 2026-10-14) — mg:<key> = {st,fee,memo,bizno} · pay:<key>:<id> = 결제 기록
      //    key 는 "ag:<등록번호>"(중개사무소) 또는 "ptn:<시각>-<임의>"(다른 업종). 사무소 본 기록은 「정지」 때 active 만 바꾼다(기존 활성/비활성과 같은 길)
      const MG_ST = ["문의", "승인", "입점 중", "정지"];
      const mgKey = (x) => { x = String(x || ""); return /^ag:[0-9A-Za-z가-힣\-]{1,30}$/.test(x) || /^ptn:\d{10,16}-[0-9a-f]{2,16}$/.test(x) ? x : ""; };
      if (p === "/realty/admin/partners" && request.method === "GET") {
        const ags = await allAgencies(), pm = await st.list({ prefix: "ptn:" }), pays = await st.list({ prefix: "pay:" });
        const keys = ags.map(function (a) { return "ag:" + a.reg; }).concat([...pm.keys()]);
        const mm = await getMany(keys.map(function (k) { return "mg:" + k; })), pb = {};
        const pam = await getMany([...pm.values()].filter(function (v) { return v && v.pa; }).map(function (v) { return "pa:" + v.pa; }));
        for (const [k, v] of pays) { const kk = k.slice(4, k.lastIndexOf(":")); (pb[kk] = pb[kk] || []).push(v); }
        const items = [];
        for (const a of ags) { const key = "ag:" + a.reg, m = mm.get("mg:" + key) || {};
          items.push({ key: key, type: "ag", kind: "부동산중개업소", name: a.name, ceo: a.ceo, tel: [].concat(a.tel || []).join(", "), email: a.email || "", reg: a.reg, bizno: m.bizno || "",
            areas: a.areas || [], area: "", addr: a.addr || "", intro: a.intro || "", at: a.at || "", active: !!a.active,
            st: !a.active ? "정지" : (m.st === "승인" ? "승인" : "입점 중"), fee: m.fee || 0, memo: m.memo || "", pays: pb[key] || [] }); }
        for (const [key, v] of pm) { const m = mm.get("mg:" + key) || {};
          const pa0 = v.pa ? pam.get("pa:" + v.pa) : null, ac = pa0 && pa0.pkey === key ? pa0 : null;
          items.push({ key: key, type: "ptn", kind: v.kind, name: v.name, ceo: v.ceo, tel: v.tel, email: v.email || "", reg: "", bizno: v.bizno || "",
            areas: v.areas || [], area: v.area || "", addr: "", intro: v.intro || "", at: v.at || "", pid: pidOf(key), price: v.price || "", ph: v.ph || [],
            acct: ac ? { hasPw: !!ac.h, active: !!ac.active, locked: !!ac.locked, fail: ac.fail || 0, tmpLive: !!(ac.tmp && ac.tmp.exp > now), setup: ac.setup && ac.setup.exp > now ? ac.setup : null } : null,
            st: MG_ST.indexOf(v.st) >= 0 ? v.st : "문의", fee: m.fee || 0, memo: m.memo || "", pays: pb[key] || [] }); }
        return R({ ok: true, items: items });
      }
      if (request.method !== "POST") return R({ ok: false, err: "method" }, 405);
      let b; try { const raw = await request.text(); if (raw.length > 20000) return R({ ok: false, err: "long" }, 413); b = JSON.parse(raw) || {}; } catch (e) { return R({ ok: false, err: "json" }, 400); }
      const reg = rReg(b.reg);
      if (p === "/realty/admin/dlog/del") { const k = String(b.k || "").replace(/[^0-9a-z-]/g, ""); if (!k || !(await st.get("dl:" + k))) return R({ ok: false, err: "notfound" }, 404); await st.delete("dl:" + k); return R({ ok: true }); }   // 시험 기록 지우기
      if (p === "/realty/admin/piijob") return R({ ok: true, res: await piiJob(true) });   // 지금 바로 정리·암호화 옮기기 (2026-10-22)
      if (p === "/realty/admin/approve" || p === "/realty/admin/reject") {
        const id = rId(b.id), v = id ? await st.get("jn:" + id) : null;
        if (!v) return R({ ok: false, err: "notfound" }, 404);
        if (p === "/realty/admin/reject") { v.status = "rejected"; v.done = bKst(); await st.put("jn:" + id, v); return R({ ok: true }); }
        const old = (await st.get("ag:" + v.reg)) || {};
        const ag = { reg: v.reg, name: v.name, ceo: v.ceo, addr: v.addr, tel: [v.tel], email: v.email || old.email || "", areas: v.areas, langs: v.langs, salt: v.salt, h: v.h, setup: null,
          active: true, pv: (old.pv || 0) + 1, at: old.at || bKst(), from: id, terms: v.terms || old.terms || null };
        v.status = "approved"; v.done = bKst();
        await st.put({ ["ag:" + v.reg]: ag, ["jn:" + id]: v });
        const idx = await rIdxGet(st, "agidx"); if (idx.indexOf(v.reg) < 0) { idx.push(v.reg); await rIdxPut(st, "agidx", idx); }
        return R({ ok: true, reg: v.reg });
      }
      if (p === "/realty/admin/upsert") {
        if (!reg) return R({ ok: false, err: "reg" }, 400);
        const old = (await st.get("ag:" + reg)) || { salt: "", h: "", setup: null, pv: 0, active: true, at: bKst() };
        const ag = Object.assign({}, old, { reg: reg });
        if (b.name != null) ag.name = rTxt(b.name, 40);
        if (b.ceo != null) ag.ceo = rTxt(b.ceo, 20);
        if (b.addr != null) ag.addr = rTxt(b.addr, 100);
        if (Array.isArray(b.tel)) ag.tel = b.tel.slice(0, 5).map(function (x) { return rTxt(x, 30); }).filter(Boolean);
        if (Array.isArray(b.areas)) ag.areas = rAreas(b.areas);
        if (Array.isArray(b.langs)) ag.langs = rLangs(b.langs);
        if (b.email != null) { const e = rEmail(b.email); if (String(b.email).trim() && !e) return R({ ok: false, err: "email" }, 400); ag.email = e; }
        if (b.active != null) ag.active = !!b.active;
        if (!ag.name) return R({ ok: false, err: "name" }, 400);
        await st.put("ag:" + reg, ag);
        const idx = await rIdxGet(st, "agidx"); if (idx.indexOf(reg) < 0) { idx.push(reg); await rIdxPut(st, "agidx", idx); }
        return R({ ok: true, reg: reg });
      }
      if (p === "/realty/admin/setup" || p === "/realty/admin/active" || p === "/realty/admin/agentview" || p === "/realty/admin/unlock" || p === "/realty/admin/temppw") {
        const ag = reg ? await st.get("ag:" + reg) : null;
        if (!ag) return R({ ok: false, err: "notfound" }, 404);
        if (p === "/realty/admin/unlock") { ag.locked = false; ag.fail = 0; ag.tmp = null; await st.put("ag:" + reg, ag); return R({ ok: true }); }
        if (p === "/realty/admin/temppw") {   // 비밀번호는 돌려주지 않는다 — 메일로만
          if (!ag.email) return R({ ok: false, err: "noemail" }, 400);
          if (!env.RESEND_KEY) return R({ ok: false, err: "nomail" }, 400);
          const m = await lockMail(ag); return R({ ok: m.mailed, err: m.mailed ? undefined : m.why });
        }
        if (p === "/realty/admin/agentview") return R({ ok: true, agency: { reg: ag.reg, name: ag.name }, items: await leadsFor(reg) });
        if (p === "/realty/admin/active") { ag.active = !!b.active; await st.put("ag:" + reg, ag); return R({ ok: true, active: ag.active }); }
        const a32 = new Uint32Array(1); crypto.getRandomValues(a32);
        const code = String(a32[0] % 1000000).padStart(6, "0"), exp = now + 7 * 86400000;
        ag.setup = { code: code, exp: exp }; ag.salt = ""; ag.h = ""; ag.pv = (ag.pv || 0) + 1;   // 비밀번호 지움 = 초기화
        ag.locked = false; ag.fail = 0; ag.tmp = null; ag.mustpw = false;
        await st.put("ag:" + reg, ag);
        return R({ ok: true, code: code, exp: exp });
      }
      if (p === "/realty/admin/pw") {   // 관리자 비밀번호 바꾸기 · clear = 처음 상태(BOARD_ADMIN)로
        if (b.clear === true) { await st.delete("admh"); return R({ ok: true, cleared: true }); }
        const np = String(b.new || "");
        if (np.length < 6 || np.length > 100) return R({ ok: false, err: "pwlen" }, 400);   // 6자부터 (사장님 2026-10-13)
        const salt = bRand(8); await st.put("admh", { salt: salt, h: await rHash(salt, np), at: bKst() });
        return R({ ok: true });
      }
      if (p === "/realty/admin/iq/reply" || p === "/realty/admin/iq/read") {
        if (!reg || !(await st.get("iq:" + reg))) return R({ ok: false, err: "notfound" }, 404);
        const t = await iqGet(reg);
        if (p === "/realty/admin/iq/reply") {
          const text = rTxtML(b.text, 1000); if (!text) return R({ ok: false, err: "empty" }, 400);
          t.msgs.push({ id: rNewId(), from: "adm", text: text, at: bKst() }); t.aunread = (t.aunread || 0) + 1;
        }
        t.unread = 0; await iqPut(reg, t); return R({ ok: true });
      }
      if (p === "/realty/admin/areareq") {   // 중개 지역 변경 요청 — 승인하면 바뀐다
        const ag = reg ? await st.get("ag:" + reg) : null;
        if (!ag || !ag.areaReq) return R({ ok: false, err: "notfound" }, 404);
        if (b.ok === true) ag.areas = ag.areaReq.areas;
        ag.areaReq = null; await st.put("ag:" + reg, ag); return R({ ok: true, areas: ag.areas });
      }
      if (p === "/realty/admin/listing/del") { const id = rId(b.id); if (!id || !(await lsDel(id))) return R({ ok: false, err: "notfound" }, 404); return R({ ok: true }); }
      if (p === "/realty/admin/aphoto/del") {
        const ag = reg ? await st.get("ag:" + reg) : null, q = rId(b.p);
        if (!ag || (ag.aph || []).indexOf(q) < 0) return R({ ok: false, err: "notfound" }, 404);
        ag.aph = ag.aph.filter(function (x) { return x !== q; }); await st.put("ag:" + reg, ag); await st.delete("agp:" + reg + ":" + q);
        return R({ ok: true });
      }
      if (p === "/realty/admin/partner/save") {
        const key = mgKey(b.key); if (!key) return R({ ok: false, err: "key" }, 400);
        const rec = await st.get(key); if (!rec) return R({ ok: false, err: "notfound" }, 404);
        const s2 = String(b.st || ""), fee = Number(b.fee), memo = rTxtML(b.memo, 500);
        if (MG_ST.indexOf(s2) < 0 || (key.startsWith("ag:") && s2 === "문의")) return R({ ok: false, err: "st" }, 400);
        if (!Number.isInteger(fee) || fee < 0 || fee > 100000000) return R({ ok: false, err: "fee" }, 400);
        const m = (await st.get("mg:" + key)) || {};
        m.fee = fee; m.memo = memo; m.at = bKst();
        let made = null;
        if (key.startsWith("ag:")) {
          if (b.bizno != null) { const bz = String(b.bizno).replace(/[\s-]/g, ""); if (bz && !/^\d{10}$/.test(bz)) return R({ ok: false, err: "bizno" }, 400); m.bizno = bz ? bz.slice(0, 3) + "-" + bz.slice(3, 5) + "-" + bz.slice(5) : ""; }
          if (s2 !== "정지") m.st = s2;
          const act = s2 !== "정지";   // 정지 = 기존 「비활성으로」와 같다 — 손님 화면에서 빠지고 로그인도 막힌다
          if (!!rec.active !== act) { rec.active = act; await st.put(key, rec); }
        } else {
          const pa = rec.pa ? await st.get("pa:" + rec.pa) : null, mine = pa && pa.pkey === key ? pa : null;
          if (s2 === "승인" || s2 === "입점 중") {
            if (!mine) { made = await paMake(key, rec); if (made.err) return R({ ok: false, err: made.err }, 400); }
            else if (!mine.active) { mine.active = true; await paPut(mine); }
          } else if (s2 === "정지" && mine && mine.active) { mine.active = false; await paPut(mine); }
          rec.st = s2; m.st = s2; await st.put(key, rec);
        }
        await st.put("mg:" + key, m);
        return R(made ? { ok: true, code: made.code, exp: made.exp } : { ok: true });
      }
      if (p === "/realty/admin/pacct" || p === "/realty/admin/pphoto/del") {   // 제휴 업체 계정 — setup(계정 만들기·설정 코드)·temppw·unlock·active
        const key = mgKey(b.key); if (!key || !key.startsWith("ptn:")) return R({ ok: false, err: "key" }, 400);
        const rec = await st.get(key); if (!rec) return R({ ok: false, err: "notfound" }, 404);
        if (p === "/realty/admin/pphoto/del") {
          const q = rId(b.p); if ((rec.ph || []).indexOf(q) < 0) return R({ ok: false, err: "notfound" }, 404);
          rec.ph = rec.ph.filter(function (x) { return x !== q; }); await st.put(key, rec); await st.delete("ptp:" + pidOf(key) + ":" + q);
          return R({ ok: true });
        }
        const op = String(b.op || "");
        if (op === "setup") { const r = await paMake(key, rec); if (r.err) return R({ ok: false, err: r.err }, 400); await st.put(key, rec); return R({ ok: true, code: r.code, exp: r.exp }); }
        const pa = rec.pa ? await st.get("pa:" + rec.pa) : null;
        if (!pa || pa.pkey !== key) return R({ ok: false, err: "noacct" }, 404);
        if (op === "unlock") { pa.locked = false; pa.fail = 0; pa.tmp = null; await paPut(pa); return R({ ok: true }); }
        if (op === "temppw") {
          if (!rec.email) return R({ ok: false, err: "noemail" }, 400);
          if (!env.RESEND_KEY) return R({ ok: false, err: "nomail" }, 400);
          pa.email = rec.email; pa.name = rec.name;
          const r = await lockMail(pa, paPut); return R({ ok: r.mailed, err: r.mailed ? undefined : r.why });
        }
        if (op === "active") {   // 비활성 = 「정지」와 같다 · 다시 활성이면 「입점 중」
          pa.active = !!b.active; await paPut(pa);
          const m = (await st.get("mg:" + key)) || {};
          if (!pa.active) { rec.st = "정지"; m.st = "정지"; } else if (rec.st === "정지") { rec.st = "입점 중"; m.st = "입점 중"; }
          await st.put(key, rec); await st.put("mg:" + key, m);
          return R({ ok: true, active: pa.active });
        }
        return R({ ok: false, err: "op" }, 400);
      }
      if (p === "/realty/admin/pay/add" || p === "/realty/admin/pay/update" || p === "/realty/admin/pay/del") {
        const key = mgKey(b.key); if (!key) return R({ ok: false, err: "key" }, 400);
        if (!(await st.get(key))) return R({ ok: false, err: "notfound" }, 404);
        const id = p === "/realty/admin/pay/add" ? rNewId() : rId(b.id), pk = "pay:" + key + ":" + id;
        const old = p === "/realty/admin/pay/add" ? null : (id ? await st.get(pk) : null);
        if (p !== "/realty/admin/pay/add" && !old) return R({ ok: false, err: "notfound" }, 404);
        if (p === "/realty/admin/pay/del") { await st.delete(pk); return R({ ok: true }); }
        const dOk = (x) => x === "" || (/^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)));
        const o = Object.assign({}, old || { id: id, at: bKst() });
        const ym = String(b.ym || ""), amt = Number(b.amt), pday = String(b.pday || ""), iday = String(b.iday || "");
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ym)) return R({ ok: false, err: "ym" }, 400);
        if (!Number.isInteger(amt) || amt < 0 || amt > 1000000000) return R({ ok: false, err: "amt" }, 400);
        if (!dOk(pday) || !dOk(iday)) return R({ ok: false, err: "date" }, 400);
        if (b.paid && !pday) return R({ ok: false, err: "pday" }, 400);
        const MT = ["계좌이체", "카드", "현금", "기타"], DT = ["세금계산서", "현금영수증", "없음"];
        o.ym = ym; o.amt = amt; o.paid = !!b.paid; o.pday = pday; o.method = MT.indexOf(b.method) >= 0 ? b.method : "계좌이체"; o.memo = rTxtML(b.memo, 300);
        o.doc = DT.indexOf(b.doc) >= 0 ? b.doc : "세금계산서"; o.iss = !!b.iss && o.doc !== "없음"; o.iday = o.iss ? iday : ""; o.ino = o.iss ? rTxt(b.ino, 40) : ""; o.up = bKst();
        if (p === "/realty/admin/pay/add" && (await st.list({ prefix: "pay:" + key + ":" })).size >= 600) return R({ ok: false, err: "many" }, 400);
        await st.put(pk, o);
        return R({ ok: true, id: id });
      }
      if (p === "/realty/admin/delete" && b.kind === "partner") {   // 제휴 업체 — 기록·관리·결제·계정·받은 요청·사진·문의 모두
        const key = mgKey(b.id); if (!key || !key.startsWith("ptn:")) return R({ ok: false, err: "id" }, 400);
        const rec = await st.get(key); if (!rec) return R({ ok: false, err: "notfound" }, 404);
        const pid = pidOf(key);
        const lids = await rIdxGet(st, "pal:" + pid); for (let i = 0; i < lids.length; i += 100) await st.delete(lids.slice(i, i + 100).map(function (x) { return "pl:" + x; }));
        await rIdxDel(st, "pal:" + pid);
        if (rec.pa) { const pa = await st.get("pa:" + rec.pa); if (pa && pa.pkey === key) await st.delete("pa:" + rec.pa); }
        const ks = [...(await st.list({ prefix: "pay:" + key + ":" })).keys()].concat((rec.ph || []).map(function (q) { return "ptp:" + pid + ":" + q; }));
        for (let i = 0; i < ks.length; i += 100) await st.delete(ks.slice(i, i + 100));
        await iqDel("pt-" + pid);
        await st.delete(["mg:" + key, key]);
        return R({ ok: true });
      }
      if (p === "/realty/admin/delete") {
        const kind = b.kind, id = kind === "agency" ? rReg(b.id) : rId(b.id);
        if (!id) return R({ ok: false, err: "id" }, 400);
        if (kind === "lead") {
          const v = await st.get("ld:" + id); if (!v) return R({ ok: false, err: "notfound" }, 404);
          for (const r of v.agencies || []) { const l = await rIdxGet(st, "agl:" + r); if (l.indexOf(id) >= 0) await rIdxPut(st, "agl:" + r, l.filter(function (x) { return x !== id; })); }
          await rIdxPut(st, "ldidx", (await rIdxGet(st, "ldidx")).filter(function (x) { return x !== id; }));
          await st.delete("ld:" + id); return R({ ok: true });
        }
        if (kind === "join") {
          if (!(await st.get("jn:" + id))) return R({ ok: false, err: "notfound" }, 404);
          await rIdxPut(st, "jnidx", (await rIdxGet(st, "jnidx")).filter(function (x) { return x !== id; }));
          await st.delete("jn:" + id); return R({ ok: true });
        }
        if (kind === "agency") {
          if (!(await st.get("ag:" + id))) return R({ ok: false, err: "notfound" }, 404);
          await rIdxPut(st, "agidx", (await rIdxGet(st, "agidx")).filter(function (x) { return x !== id; }));
          await rIdxDel(st, "agl:" + id);
          for (const lid of await rIdxGet(st, "agls:" + id)) await lsDel(lid);
          await rIdxDel(st, "agls:" + id);
          await rIdxDel(st, "agcl:" + id);   // 전담 손님 매물 목록 (매물 자체는 남는다 — 전담 없음으로 돌아감)
          await iqDel(id);
          const ago = await st.get("ag:" + id); if (ago && ago.aph && ago.aph.length) await st.delete(ago.aph.map(function (q) { return "agp:" + id + ":" + q; }));
          if (ago && ago.face) await st.delete("agf:" + id + ":" + ago.face);
          const lgk = [...(await st.list({ prefix: "lg:" + id + ":" })).keys()];   // 장부도 함께 (2026-10-15)
          for (let i = 0; i < lgk.length; i += 128) await st.delete(lgk.slice(i, i + 128));
          await st.delete("ag:" + id); return R({ ok: true });
        }
        return R({ ok: false, err: "kind" }, 400);
      }
      return R({ ok: false, err: "path" }, 404);
    }

    if (request.method !== "POST") return R({ ok: false, err: "method" }, 405);
    if (!origin) return R({ ok: false, err: "origin" }, 403);
    let b;
    try { const raw = await request.text(); if (raw.length > (p === "/realty/agent/ledger/mail" ? 2900000 : p === "/realty/agent/listing/save" || p === "/realty/agent/aphoto" || p === "/realty/agent/face" || p === "/realty/agent/iq/send" || p === "/realty/pt/photo" || p === "/realty/pt/iq/send" ? 900000 : 12000)) return R({ ok: false, err: "long" }, 413); b = JSON.parse(raw) || {}; }
    catch (e) { return R({ ok: false, err: "json" }, 400); }

    // ── 허위매물 신고 (사장님 2026-10-14) — rpt:<시각> 에 남기고 사장님 메일로 ──
    if (p === "/realty/report") {
      const id = rId(b.id), RS = ["없는 매물", "가격·조건이 다름", "이미 거래됨", "기타"], ri = parseInt(b.reason, 10);
      const v = id ? await st.get("ls:" + id) : null;
      if (!v) return R({ ok: false, err: "id" }, 400);
      if (!(ri >= 0 && ri < RS.length)) return R({ ok: false, err: "reason" }, 400);
      if (await over("rp:" + ih, 5, 3600000)) return R({ ok: false, err: "rate" }, 429);
      const memo = rTxtML(b.memo, 300), contact = rTxt(b.contact, 60), at = bKst(), ag = await st.get("ag:" + v.reg);
      const man = function (n) { n = +n || 0; if (!n) return "0원"; const e = Math.floor(n / 10000), m = n % 10000; return (e ? e + "억" : "") + (m ? (e ? " " : "") + m.toLocaleString() + "만" : "") + "원"; };
      const price = v.deal === 0 ? "매매 " + man(v.price) : v.deal === 1 ? "전세 " + man(v.dep) : "월세 " + man(v.dep) + " / " + man(v.rent);
      const where = [v.dong, v.jibun, v.bname, v.bdong ? v.bdong + "동" : "", v.floor ? v.floor + "층" : ""].filter(Boolean).join(" ");
      const rec = { at: at, id: id, reason: RS[ri], memo: memo, contact: contact, reg: v.reg, where: where, price: price, ih: ih };
      const key = "rpt:" + now + "-" + bRand(3);
      await piiSeal(env, "rpt", key, rec);   // 신고자 연락처 암호화 (2026-10-22) — 메일 본문은 위 contact 로 만든다
      await st.put(key, rec);
      const text = "허위매물 신고 · " + at + "\n\n매물번호: " + id + "\n" + R_PT[v.pt] + " · " + R_DEAL[v.deal] + " · " + price + "\n전용 " + v.area + "㎡\n소재지: " + where + " (지역코드 " + v.sg + ")"
        + "\n중개사무소: " + (ag ? ag.name : v.own === "c" ? "손님 매물" : "-") + " (" + (v.reg || (v.regs || []).join(",") || "전담 없음") + ")" + (ag && ag.tel ? " · " + [].concat(ag.tel).join(", ") : "")
        + "\n\n사유: " + RS[ri] + "\n메모: " + (memo || "-") + "\n신고자 연락처: " + (contact || "-");
      rec.mail = await rMail(env, "emhwang3@gmail.com", "[머니퍼즐 부동산] 허위매물 신고 — " + (v.bname || v.dong) + " " + price, text);
      await st.put(key, rec);
      return R({ ok: true });
    }

    // ── 제휴 문의 (사장님 2026-10-14) — 부동산 말고 다른 업종 입점. ptn:<시각>-<임의> 에 남기고 메일+텔레그램 ──
    if (p === "/realty/partner") {
      if (String(b.hp || "") !== "") return R({ ok: true });   // 로봇 — 받은 척만
      const kind = PTN_KINDS.indexOf(String(b.kind || "")) >= 0 ? String(b.kind) : "";
      const name = rTxt(b.name, 40), ceo = rTxt(b.ceo, 20), tel = rTxt(b.tel, 30), intro = rTxtML(b.intro, 200);
      // 활동 지역 — 입점 문의 「중개 지역」과 같은 목록 코드 {c,d,n} 1~20개 (2026-10-14). 옛 화면(글자 area)은 그대로 받는다
      const hasA = Array.isArray(b.areas), areas = hasA ? rAreas(b.areas) : null;
      if (hasA && (b.areas.length < 1 || b.areas.length > 20 || areas.length !== b.areas.length || !areas.every(function (x) { return x.n; }))) return R({ ok: false, err: "areas" }, 400);
      const area = hasA ? areas.map(function (x) { return x.n; }).join(", ") : rTxt(b.area, 60);
      const bizd = String(b.bizno || "").replace(/[\s-]/g, ""), email = String(b.email || "").trim();
      if (!kind) return R({ ok: false, err: "kind" }, 400);
      if (!name || !ceo || !tel || !area) return R({ ok: false, err: "empty" }, 400);
      if (b.terms !== true) return R({ ok: false, err: "terms" }, 400);   // [필수] 손님 개인정보 상담에만·파기 (2026-10-22)
      if (!/^\d{10}$/.test(bizd)) return R({ ok: false, err: "bizno" }, 400);
      const td = tel.replace(/\D/g, "").length;
      if (!/^[\d\s+-]+$/.test(tel) || td < 9 || td > 15) return R({ ok: false, err: "tel" }, 400);
      const em = email ? rEmail(email) : "";
      if (email && !em) return R({ ok: false, err: "email" }, 400);
      if (await over("pt:" + ih, 5, 3600000)) return R({ ok: false, err: "rate" }, 429);
      const bizno = bizd.slice(0, 3) + "-" + bizd.slice(3, 5) + "-" + bizd.slice(5), at = bKst();
      const key = "ptn:" + now + "-" + bRand(3);
      const rec = { kind: kind, name: name, ceo: ceo, bizno: bizno, tel: tel, email: em, area: area, intro: intro, at: at, ih: ih, st: "문의", terms: { ok: true, at: at } };
      if (hasA) rec.areas = areas;
      await st.put(key, rec);
      const text = "제휴 문의 · " + kind + " · " + at + "\n\n업체명: " + name + "\n대표자: " + ceo + "\n사업자등록번호: " + bizno + "\n연락처: " + tel
        + "\n이메일: " + (em || "-") + "\n활동 지역: " + area + "\n한 줄 소개: " + (intro || "-");
      rec.mail = await rMail(env, "emhwang3@moneypuzzle.co.kr", "[머니퍼즐 제휴 문의] " + kind + " · " + name, text);
      rec.tg = await tgOk("🤝 " + text);
      await st.put(key, rec);
      return R({ ok: true });
    }

    // ── 손님 → 제휴 업체 메모·연락처 (2026-10-14) — 업체 「받은 요청」으로. 사장님께는 알리지 않는다 ──
    if (p === "/realty/plead") {
      if (String(b.hp || "") !== "") return R({ ok: true });   // 로봇 — 받은 척만
      const pid = String(b.pkey || "");
      if (!PID_RE.test(pid)) return R({ ok: false, err: "partner" }, 400);
      if (String(b.memo || "").length > 500) return R({ ok: false, err: "memo" }, 400);
      const memo = rTxtML(b.memo, 500), name = rTxt(b.name, 30), contact = rTxt(b.contact, 100);
      if (!hvContactOk(contact)) return R({ ok: false, err: "contact" }, 400);
      if (!(b.consent && b.consent.collect === true && b.consent.third === true)) return R({ ok: false, err: "consent" }, 400);
      const key = "ptn:" + pid, rec = await st.get(key), pa = rec && rec.pa ? await st.get("pa:" + rec.pa) : null;
      if (!rec || rec.st !== "입점 중" || !pa || !pa.active || pa.pkey !== key) return R({ ok: false, err: "partner" }, 400);
      if (await over("pld:" + ih, 5, 3600000)) return R({ ok: false, err: "rate" }, 429);
      const id = rNewId(), at = bKst();
      await st.put("pl:" + id, await piiSeal(env, "pl", "pl:" + id, { id: id, pid: pid, memo: memo, name: name, contact: contact, at: at, st: "new", consent: { collect: true, third: true, at: at }, ih: ih }));   // 암호화 (2026-10-22)
      const l = await rIdxGet(st, "pal:" + pid); l.unshift(id);
      if (l.length > 500) { const old = l.splice(500); for (let i = 0; i < old.length; i += 100) await st.delete(old.slice(i, i + 100).map(function (x) { return "pl:" + x; })); }
      await rIdxPut(st, "pal:" + pid, l);
      if (rec.email && env.RESEND_KEY && !(await over("plm:" + pid, 20, 86400000))) {   // 업체에 짧은 알림 — 연락처는 메일에 안 쓴다
        await rMail(env, rec.email, "[Money Puzzle] 새 고객 요청 / New customer request",
          rec.name + "\n\n새 고객 요청이 왔습니다. 앱 ⋮ → 「제휴 업체 로그인」 → 「받은 요청」에서 확인하세요.\nYou have a new customer request. Open the app: ⋮ → Partner login → Requests.\n\nhttps://moneypuzzle.co.kr/");
      }
      return R({ ok: true });
    }

    // ── 제휴 업체 로그인 (2026-10-14) — 사업자등록번호 + 비밀번호 · 처음엔 설정 코드 ──
    if (p === "/realty/plogin" || p === "/realty/psetpw") {
      const biz = bizOf(b.biz); if (biz.length !== 10) return R({ ok: false, err: "biz" }, 400);
      const fk = "plf:" + (await bSha(ih + "|" + biz)).slice(0, 20);
      if (await over(fk, 10, 600000, false)) return R({ ok: false, err: "rate" }, 429);
      const pa = await st.get("pa:" + biz), rec = pa ? await st.get(pa.pkey) : null, ok = !!(pa && pa.active && rec && rec.pa === biz);
      const who = () => ({ biz: biz, name: rec.name, kind: rec.kind });
      if (p === "/realty/plogin") {
        const pw = String(b.pw || "").slice(0, 64);
        if (!ok) { await bump(fk, 600000); return R({ ok: false, err: "pw" }, 403); }
        if (pa.locked) {
          const tv = pa.tmp && pa.tmp.exp > now;
          if (tv && bEq(await rHash(pa.tmp.salt, pw), pa.tmp.h)) {
            pa.salt = pa.tmp.salt; pa.h = pa.tmp.h; pa.tmp = null; pa.locked = false; pa.fail = 0; pa.mustpw = true; pa.pv = (pa.pv || 0) + 1;
            await paPut(pa);
            return R({ ok: true, mustpw: true, token: await ptoken(pa), partner: who() });
          }
          await bump(fk, 600000);
          return R({ ok: false, err: "locked", mailed: !!tv }, 403);
        }
        if (!pa.h) return R({ ok: false, err: "nopw" }, 403);
        if (!bEq(await rHash(pa.salt, pw), pa.h)) {
          await bump(fk, 600000);
          pa.fail = (pa.fail || 0) + 1;
          if (pa.fail >= 5) { pa.email = rec.email || ""; pa.name = rec.name; const m = await lockMail(pa, paPut); return R({ ok: false, err: "locked", mailed: m.mailed }, 403); }
          await paPut(pa);
          return R({ ok: false, err: "pw", left: 5 - pa.fail }, 403);
        }
        if (pa.fail) { pa.fail = 0; await paPut(pa); }
        return R({ ok: true, mustpw: !!pa.mustpw, token: await ptoken(pa), partner: who() });
      }
      const code = String(b.code || "").replace(/\D/g, ""), pw = String(b.pw || "");
      if (pw.length < 6 || pw.length > 64) return R({ ok: false, err: "pwlen" }, 400);
      if (!ok || !pa.setup || !(pa.setup.exp > now) || !bEq(code, String(pa.setup.code))) { await bump(fk, 600000); return R({ ok: false, err: "code" }, 403); }
      pa.salt = bRand(8); pa.h = await rHash(pa.salt, pw); pa.setup = null; pa.pv = (pa.pv || 0) + 1;
      pa.locked = false; pa.fail = 0; pa.tmp = null; pa.mustpw = false;
      await paPut(pa);
      return R({ ok: true, token: await ptoken(pa), partner: who() });
    }
    if (p.startsWith("/realty/pt/")) {
      const tk = await pFromToken(b.token);
      if (!tk) return R({ ok: false, err: "token" }, 401);
      const pa = tk.pa, rec = tk.rec, key = pa.pkey, pid = pidOf(key), iqk = "pt-" + pid;
      if (pa.mustpw && p !== "/realty/pt/pw") return R({ ok: false, err: "mustpw" }, 403);
      const me = () => Object.assign(ptPub(key, rec), { biz: pa.biz, email: rec.email || "", st: rec.st || "" });
      if (p === "/realty/pt/me") {
        const iqt = await st.get("iq:" + iqk);
        return R({ ok: true, partner: Object.assign(me(), { iqUnread: iqt ? (iqt.aunread || 0) : 0 }), items: await pleadsFor(pid) });
      }
      if (p === "/realty/pt/dlog") {   // 제휴 업체 내려받기 기록 (2026-10-22)
        if (await over("dlg:pt-" + pid, 200, 86400000)) return R({ ok: false, err: "rate" }, 429);
        const n = Math.max(0, Math.min(100000, parseInt(b.n, 10) || 0));
        await st.put("dl:" + String(now).padStart(14, "0") + "-" + bRand(2), { who: "pt", reg: pa.biz, name: rec.name, kind: String(b.kind || "etc").replace(/[^a-z]/g, "").slice(0, 10) || "etc", n: n, at: bKst() });
        return R({ ok: true });
      }
      if (p === "/realty/pt/status") {
        const id = rId(b.id), s2 = String(b.st || "");
        if (R_ST.indexOf(s2) < 0) return R({ ok: false, err: "st" }, 400);
        const v = id ? await st.get("pl:" + id) : null;
        if (!v || v.pid !== pid) return R({ ok: false, err: "notfound" }, 404);
        v.st = s2; await st.put("pl:" + id, v); return R({ ok: true });
      }
      if (p === "/realty/pt/lead/del") {
        const id = rId(b.id), l = await rIdxGet(st, "pal:" + pid);
        if (!id || l.indexOf(id) < 0) return R({ ok: false, err: "notfound" }, 404);
        await rIdxPut(st, "pal:" + pid, l.filter(function (x) { return x !== id; }));
        await st.delete("pl:" + id); return R({ ok: true });
      }
      if (p === "/realty/pt/profile") {   // 업체명은 못 바꾼다 — 소개·가격 안내·연락처·이메일·활동 지역
        const tel = rTxt(b.tel, 30), td = tel.replace(/\D/g, "").length, email = String(b.email || "").trim(), em = email ? rEmail(email) : "";
        if (!/^[\d\s+-]+$/.test(tel) || td < 9 || td > 15) return R({ ok: false, err: "tel" }, 400);
        if (email && !em) return R({ ok: false, err: "email" }, 400);
        const areas = rAreas(b.areas);
        if (!Array.isArray(b.areas) || b.areas.length < 1 || b.areas.length > 20 || areas.length !== b.areas.length || !areas.every(function (x) { return x.n; })) return R({ ok: false, err: "areas" }, 400);
        if (String(b.intro || "").length > 200 || String(b.price || "").length > 300) return R({ ok: false, err: "long" }, 400);
        rec.intro = rTxtML(b.intro, 200); rec.price = rTxtML(b.price, 300); rec.tel = tel; rec.email = em; rec.areas = areas; rec.area = areas.map(function (x) { return x.n; }).join(", "); rec.up = bKst();
        await st.put(key, rec); return R({ ok: true, partner: me() });
      }
      if (p === "/realty/pt/photo") {   // 업체 사진 1~3장 — 통째로 바꾼다 ({keep}|{data})
        if (await over("ppw:" + pid, 60, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const inp = Array.isArray(b.photos) ? b.photos : [];
        if (inp.length > 3) return R({ ok: false, err: "photos" }, 400);
        const keep = rec.ph || [], ph = [], puts = {};
        for (const x of inp) {
          if (x && x.keep && keep.indexOf(x.keep) >= 0) { if (ph.indexOf(x.keep) < 0) ph.push(x.keep); continue; }
          const bin = rJpeg(x && x.data); if (!bin) return R({ ok: false, err: "photo" }, 400);
          const q = bRand(4); ph.push(q); puts["ptp:" + pid + ":" + q] = bin;
        }
        rec.ph = ph; puts[key] = rec; await st.put(puts);
        const gone = keep.filter(function (q) { return ph.indexOf(q) < 0; }).map(function (q) { return "ptp:" + pid + ":" + q; }); if (gone.length) await st.delete(gone);
        return R({ ok: true, partner: me() });
      }
      if (p === "/realty/pt/iq/list") {
        const t = await iqGet(iqk); if (t.aunread) { t.aunread = 0; await st.put("iq:" + iqk, t); }
        return R({ ok: true, msgs: t.msgs, reg: iqk });
      }
      if (p === "/realty/pt/iq/send") {
        const text = rTxtML(b.text, 1000); if (!text) return R({ ok: false, err: "empty" }, 400);
        let bin = null; if (b.photo) { bin = rJpeg(b.photo); if (!bin) return R({ ok: false, err: "photo" }, 400); }
        if (await over("iqs:" + iqk, 10, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const t = await iqGet(iqk), msg = { id: rNewId(), from: "ag", text: text, at: bKst() };
        if (bin) { msg.ph = bRand(8); await st.put("iqp:" + iqk + ":" + msg.ph, bin); }
        t.msgs.push(msg); t.unread = (t.unread || 0) + 1; t.last = now; await iqPut(iqk, t);
        const sent = await tgOk("🤝 [" + rec.name + " · " + rec.kind + "] 문의: " + text.slice(0, 300) + (bin ? "\n(사진 1장 첨부)" : "") + "\n\n답장은 앱 ⋮ → 🛠 관리자 → 문의");
        return R({ ok: true, tg: sent, msgs: t.msgs });
      }
      if (p === "/realty/pt/pw") {
        const np = String(b.new || "");
        if (np.length < 6 || np.length > 64) return R({ ok: false, err: "pwlen" }, 400);
        const fk = "plf:" + (await bSha(ih + "|" + pa.biz)).slice(0, 20);
        if (await over(fk, 10, 600000, false)) return R({ ok: false, err: "rate" }, 429);
        if (!bEq(await rHash(pa.salt, String(b.old || "").slice(0, 64)), pa.h)) { await bump(fk, 600000); return R({ ok: false, err: "pw" }, 403); }
        pa.salt = bRand(8); pa.h = await rHash(pa.salt, np); pa.pv = (pa.pv || 0) + 1; pa.mustpw = false;
        await paPut(pa);
        return R({ ok: true, token: await ptoken(pa) });
      }
      return R({ ok: false, err: "path" }, 404);
    }

    // ── 입점 문의 ──
    if (p === "/realty/join") {
      const reg = rReg(b.reg), name = rTxt(b.name, 40), ceo = rTxt(b.ceo, 20), tel = rTxt(b.tel, 30), addr = rTxt(b.addr, 100), msg = rTxtML(b.msg, 800), pw = String(b.pw || "");
      const areas = rAreas(b.areas), langs = rLangs(b.langs), email = rEmail(b.email);
      if (!reg || !name || !ceo || !tel || !areas.length) return R({ ok: false, err: "empty" }, 400);
      if (!email) return R({ ok: false, err: "email" }, 400);
      if (pw.length < 4 || pw.length > 64) return R({ ok: false, err: "pw" }, 400);
      if (b.terms !== true) return R({ ok: false, err: "terms" }, 400);   // [필수] 손님 개인정보는 그 상담에만·끝나면 파기 (2026-10-22) — 이미 있는 계정은 상관없음
      if (await over("jn:" + ih, 5, 3600000)) return R({ ok: false, err: "rate" }, 429);
      let gov = { ok: null, why: "old" };   // 국토부 확인은 서버가 다시 한다 (브라우저 값은 참고만)
      const m = reg.match(/^(\d{5})-/);
      if (m) {
        try {
          const j = await (await env.HUB.get(env.HUB.idFromName("broker")).fetch("https://hub/broker?lawd=" + m[1] + "&jurirno=" + encodeURIComponent(reg))).json();
          const x = j && j.ok && (j.items || [])[0];
          gov = x ? { ok: x.st === "영업중", name: x.name, ceo: x.ceo, st: x.st, addr: x.addr } : (j && j.ok && j.at ? { ok: false, why: "none" } : { ok: null, why: "nodata" });
        } catch (e) { gov = { ok: null, why: "err" }; }
      }
      const id = rNewId(), salt = bRand(8), h = await rHash(salt, pw), at = bKst();
      const v = { id: id, reg: reg, name: name, ceo: ceo, tel: tel, email: email, addr: addr, areas: areas, langs: langs, msg: msg, gov: gov,
        cgov: b.gov && typeof b.gov === "object" ? { ok: !!b.gov.ok, name: rTxt(b.gov.name, 40), ceo: rTxt(b.gov.ceo, 20) } : null,
        salt: salt, h: h, status: "new", at: at, terms: { ok: true, at: at } };
      await st.put("jn:" + id, v);
      const idx = await rIdxGet(st, "jnidx"); idx.unshift(id); await rIdxPut(st, "jnidx", idx);
      const gs = gov.ok === true ? "영업중 확인 (" + gov.name + " · 대표 " + gov.ceo + ")" : gov.ok === false ? (gov.st ? "✕ " + gov.st : "✕ 국토부에 없는 번호") : "확인 못 함";
      await tg("🏢 부동산 입점 문의 · " + at + "\n\n" + name + " (" + reg + ")\n대표 " + ceo + " · " + tel + "\n지역: " + areas.map(function (a) { return a.n; }).join(", ")
        + "\n외국어: " + (langs.join(", ") || "없음") + "\n국토부: " + gs + (msg ? "\n\n" + msg.slice(0, 200) : "") + "\n\n승인은 앱 ⋮ → 🛠 관리자");
      return R({ ok: true, id: id });
    }

    // ── 손님 요청 ──
    if (p === "/realty/lead") {
      // 매물 문의 (사장님 2026-10-22) — lsid 가 오면 서버가 받는 곳을 정한다 (손님이 사무소를 고르지 못한다)
      //   사무소 매물 → 올린 사무소 · 손님 매물 → 전담(regs) · 전담 없으면 그 동네 입점 사무소 전체(pool, 먼저 「맡기」 누른 곳이 전담) · 0곳이면 관리자
      const lsid = b.lsid ? rId(b.lsid) : "";
      const lsv = lsid ? await st.get("ls:" + lsid) : null;
      if (lsid && (!lsv || now - (lsv.cf || 0) > LS_DAYS)) return R({ ok: false, err: "listing" }, 400);
      const cust = !!(lsv && lsv.own === "c");
      const door = lsv ? "buy" : b.door === "sell" ? "sell" : b.door === "buy" ? "buy" : "";
      const pt = lsv ? lsv.pt : parseInt(b.pt, 10), deal = lsv ? lsv.deal : parseInt(b.deal, 10);
      const phone = rTxt(b.phone, 30), digits = String(phone || "").replace(/\D/g, ""), name = rTxt(b.name, 30), lang = rTxt(b.lang, 20);
      if (!door || !(pt >= 0 && pt < R_PT.length) || !(deal >= 0 && deal < 3)) return R({ ok: false, err: "bad" }, 400);
      if (digits.length < 9 || digits.length > 15) return R({ ok: false, err: "phone" }, 400);
      if (!name && door !== "buy") return R({ ok: false, err: "name" }, 400);   // 사기 요청은 이름 선택 (2026-10-14)
      if (!(b.consent && b.consent.collect === true && b.consent.third === true)) return R({ ok: false, err: "consent" }, 400);
      const pubOn = !lsv && door === "sell" && b.pub === true;   // 팔기 공개 동의 (2026-10-22) — 옛 앱(pub 없음)은 예전대로
      const rg = b.region || {};
      const region = lsv ? { sg: [String(lsv.sg)], dong: rTxt(lsv.dong, 20), label: rTxt(rg.label, 80) } : { sg: (Array.isArray(rg.sg) ? rg.sg : []).map(function (s) { return String(s).replace(/\D/g, ""); }).filter(function (s) { return s.length === 5; }).slice(0, 8),
        dong: rTxt(rg.dong, 20), label: rTxt(rg.label, 80) };
      const d0 = b.details || {}, details = {};
      ["addr", "want", "area", "floor", "price", "pmin", "pmax", "rent", "move"].forEach(function (k) { const t = rTxt(d0[k], k === "addr" || k === "want" ? 160 : 60); if (t) details[k] = t; });
      { const t = rTxtML(d0.memo, 800); if (t) details.memo = t; }
      let regs = [], route = "";
      if (lsv && !cust) { regs = [lsv.reg]; route = "ded"; }
      else if (cust) {
        const dm = await getMany((lsv.regs || []).map(function (r) { return "ag:" + r; }));
        regs = (lsv.regs || []).filter(function (r) { const a = dm.get("ag:" + r); return a && a.active; }); route = "ded";
        if (!regs.length) {
          regs = (await allAgencies()).filter(function (a) { return a.active && (a.areas || []).some(function (ar) { return ar.c && String(lsv.sg).indexOf(ar.c) === 0 && (!ar.d || !lsv.dong || ar.d === lsv.dong); }); })
            .map(function (a) { return a.reg; }).slice(0, 30);
          route = regs.length ? "pool" : "admin";
        }
      } else regs = [...new Set((Array.isArray(b.agencies) ? b.agencies : []).map(rReg).filter(Boolean))].slice(0, 10);
      const lst = lsv ? { id: lsv.id, pt: lsv.pt, deal: lsv.deal, sg: lsv.sg, dong: lsv.dong || "", jibun: lsv.jibun || "", bname: lsv.bname || "", bdong: lsv.bdong || "",
        area: lsv.area, supply: lsv.supply, price: lsv.price, dep: lsv.dep, rent: lsv.rent, floor: lsv.floor || "", flevel: lsv.flevel || "" } : null;
      if (lst && cust) lst.own = "c";
      if (!regs.length && !pubOn && route !== "admin") return R({ ok: false, err: "agency" }, 400);
      const am = await getMany(regs.map(function (r) { return "ag:" + r; }));
      const ags = regs.map(function (r) { return am.get("ag:" + r); });
      if (ags.some(function (a) { return !a || !a.active; })) return R({ ok: false, err: "agency" }, 400);
      // 공개 매물 값 검사 — 지번·호수·층·이름·연락처는 넣지 않는다
      let pubLs = null;
      if (pubOn) {
        const pd = b.pubd || {};
        const sg = String(pd.sg || region.sg[0] || "").replace(/\D/g, "");
        if (sg.length !== 5) return R({ ok: false, err: "area" }, 400);
        const pr = rNum(details.price, deal === 0 ? 1 : 0, 100000000);
        if (pr == null || (deal === 1 && !pr)) return R({ ok: false, err: "price" }, 400);
        const x = { own: "c", pt: pt, deal: deal, sg: sg, dong: rTxt(pd.dong || region.dong, 20), regs: regs.slice(), ph: [] };
        if (deal === 0) x.price = pr; else { x.dep = pr; if (deal === 2) { x.rent = rNum(details.rent, 1, 1000000); if (x.rent == null) return R({ ok: false, err: "price" }, 400); } }
        const ar = rNum(details.area, 1, 10000000, 1); if (ar != null) x.area = ar;
        if ([3, 4, 7].indexOf(pt) < 0) { const bn = rTxt(pd.bname, 40); if (bn) x.bname = bn;
          const y = +pd.y, xx = +pd.x; if (bn && y > 33 && y < 39 && xx > 124 && xx < 132) x.pos = { y: Math.round(y * 1e6) / 1e6, x: Math.round(xx * 1e6) / 1e6 }; }
        if (["즉시 입주", "1개월 안", "3개월 안", "6개월 안", "협의"].indexOf(details.move) >= 0) x.mvs = details.move;
        const ds = rTxt(pd.memo, 100); if (ds) x.desc = ds;
        pubLs = x;
        if (await over("cls:" + ih, 5, 86400000, false)) return R({ ok: false, err: "rate" }, 429);
      }
      if (await over("ld:" + ih, 10, 3600000)) return R({ ok: false, err: "rate" }, 429);
      const id = rNewId(), at = bKst(), sts = {};
      regs.forEach(function (r) { sts[r] = "new"; });
      const v = { id: id, door: door, pt: pt, ptn: R_PT[pt], deal: deal, dealn: R_DEAL[deal], region: region, details: details, name: name, phone: phone, lang: lang,
        agencies: regs, agn: ags.map(function (a) { return a.name; }), consent: { collect: true, third: true, at: at }, at: at, st: sts };
      if (lst) v.lst = lst;
      if (route === "pool") v.pool = true;
      if (route === "admin") v.adm = true;
      if (pubLs) {
        await bump("cls:" + ih, 86400000);
        const lid = rNewId(); pubLs = Object.assign(pubLs, { id: lid, lead: id, at: now, up: now, cf: now, nq: 0 });
        v.pub = lid; v.consent.pub = true;
        await st.put("ls:" + lid, pubLs);
        for (const nm of ["lsa:" + pubLs.sg, "lsidx"].concat(regs.map(function (r) { return "agcl:" + r; }))) { const l = await rIdxGet(st, nm); l.unshift(lid); await rIdxPut(st, nm, l); }
      }
      if (lsv) {   // 매물별 문의 수 (전담 매물 리포트) — 최근 50개 시각만
        lsv.nq = (lsv.nq || 0) + 1; lsv.qat = (lsv.qat || []).concat([now]).slice(-50); await st.put("ls:" + lsv.id, lsv);
      }
      await st.put("ld:" + id, await piiSeal(env, "ld", "ld:" + id, v));   // 이름·연락처 암호화 (2026-10-22)
      const idx = await rIdxGet(st, "ldidx"); idx.unshift(id); await rIdxPut(st, "ldidx", idx);
      for (const r of regs) { const l = await rIdxGet(st, "agl:" + r); l.unshift(id); await rIdxPut(st, "agl:" + r, l); }
      const to = route === "admin" ? "관리자 (이 동네 입점 사무소 없음 — 관리자 화면 요청 탭에서 연락처 확인)" : route === "pool" ? "이 동네 입점 사무소 " + regs.length + "곳 (전담 없음 · 먼저 맡는 곳이 전담)" : ags.length ? ags.map(function (a) { return a.name; }).join(", ") : "고른 사무소 없음";
      await tg("🏠 부동산 손님 요청 · " + at + "\n\n" + (lst ? (cust ? "손님 매물 문의 · " : "매물 문의 · ") : "") + (door === "sell" ? "팔기" : "사기") + " · " + R_PT[pt] + " · " + R_DEAL[deal] + "\n" + (region.label || "")
        + (pubLs ? "\n📢 매물 목록에 공개함" : "") + "\n→ " + to + (route === "admin" ? "" : "\n\n(연락처는 중개사무소 화면에서 봅니다)"));
      return R({ ok: true, id: id, to: route, n: regs.length, pub: pubLs ? pubLs.id : null });
    }

    // ── 중개사무소 ──
    if (p === "/realty/login" || p === "/realty/setpw") {
      const reg = rReg(b.reg); if (!reg) return R({ ok: false, err: "reg" }, 400);
      const fk = "lf:" + (await bSha(ih + "|" + reg)).slice(0, 20);
      if (await over(fk, 10, 600000, false)) return R({ ok: false, err: "rate" }, 429);
      const ag = await st.get("ag:" + reg);
      if (p === "/realty/login") {
        const pw = String(b.pw || "").slice(0, 64);
        if (!ag || !ag.active) { await bump(fk, 600000); return R({ ok: false, err: "pw" }, 403); }
        if (ag.locked) {   // 잠김 — 살아 있는 임시 비밀번호만 받는다
          const tv = ag.tmp && ag.tmp.exp > now;
          if (tv && bEq(await rHash(ag.tmp.salt, pw), ag.tmp.h)) {
            ag.salt = ag.tmp.salt; ag.h = ag.tmp.h; ag.tmp = null; ag.locked = false; ag.fail = 0; ag.mustpw = true; ag.pv = (ag.pv || 0) + 1;
            await st.put("ag:" + reg, ag);
            return R({ ok: true, mustpw: true, token: await token(ag), agency: { reg: ag.reg, name: ag.name } });
          }
          await bump(fk, 600000);
          return R({ ok: false, err: "locked", mailed: !!tv }, 403);
        }
        if (!ag.h) return R({ ok: false, err: "nopw" }, 403);
        if (!bEq(await rHash(ag.salt, pw), ag.h)) {
          await bump(fk, 600000);
          ag.fail = (ag.fail || 0) + 1;
          if (ag.fail >= 5) { const m = await lockMail(ag); return R({ ok: false, err: "locked", mailed: m.mailed }, 403); }
          await st.put("ag:" + reg, ag);
          return R({ ok: false, err: "pw", left: 5 - ag.fail }, 403);
        }
        if (ag.fail) { ag.fail = 0; await st.put("ag:" + reg, ag); }
        return R({ ok: true, mustpw: !!ag.mustpw, needEmail: !ag.email, token: await token(ag), agency: { reg: ag.reg, name: ag.name } });
      }
      const code = String(b.code || "").replace(/\D/g, ""), pw = String(b.pw || "");
      if (pw.length < 4 || pw.length > 64) return R({ ok: false, err: "pwlen" }, 400);
      if (!ag || !ag.active || !ag.setup || !(ag.setup.exp > now) || !bEq(code, String(ag.setup.code))) { await bump(fk, 600000); return R({ ok: false, err: "code" }, 403); }
      ag.salt = bRand(8); ag.h = await rHash(ag.salt, pw); ag.setup = null; ag.pv = (ag.pv || 0) + 1;
      ag.locked = false; ag.fail = 0; ag.tmp = null; ag.mustpw = false;
      await st.put("ag:" + reg, ag);
      return R({ ok: true, needEmail: !ag.email, token: await token(ag), agency: { reg: ag.reg, name: ag.name } });
    }
    if (p.startsWith("/realty/agent/")) {
      const ag = await fromToken(b.token);
      if (!ag) return R({ ok: false, err: "token" }, 401);
      if (ag.mustpw && p !== "/realty/agent/pw") return R({ ok: false, err: "mustpw" }, 403);
      if (p === "/realty/agent/email") {
        const e = rEmail(b.email); if (!e) return R({ ok: false, err: "email" }, 400);
        ag.email = e; await st.put("ag:" + ag.reg, ag); return R({ ok: true, email: e });
      }
      if (p === "/realty/agent/dlog") {   // 엑셀 내려받기 전 한 줄 기록 — 등록번호·시각·건수 (2026-10-22)
        if (await over("dlg:" + ag.reg, 200, 86400000)) return R({ ok: false, err: "rate" }, 429);
        const DK = ["ded", "ledger", "leads"], kind = DK.indexOf(b.kind) >= 0 ? b.kind : "etc", n = Math.max(0, Math.min(100000, parseInt(b.n, 10) || 0));
        await st.put("dl:" + String(now).padStart(14, "0") + "-" + bRand(2), { who: "ag", reg: ag.reg, name: ag.name, kind: kind, n: n, at: bKst() });
        return R({ ok: true });
      }
      if (p === "/realty/agent/leads") return R({ ok: true, agency: { reg: ag.reg, name: ag.name }, items: await leadsFor(ag.reg) });
      // 맡기 (2026-10-22) — 전담 없는 손님 매물 문의를 받은 사무소가 누르면 그 매물의 전담이 된다. 먼저 누른 곳만
      if (p === "/realty/agent/claim") {
        const id = rId(b.id), v = id ? await st.get("ld:" + id) : null;
        if (!v || (v.agencies || []).indexOf(ag.reg) < 0 || !v.pool || !v.lst) return R({ ok: false, err: "notfound" }, 404);
        const l = await st.get("ls:" + v.lst.id);
        if (!l || l.own !== "c") return R({ ok: false, err: "gone" }, 404);
        if ((l.regs || []).length) return (l.regs || []).indexOf(ag.reg) >= 0 ? R({ ok: true, already: true }) : R({ ok: false, err: "taken" }, 409);
        l.regs = [ag.reg]; l.tk = { reg: ag.reg, at: bKst(), lead: id }; await st.put("ls:" + l.id, l);
        { const x = await rIdxGet(st, "agcl:" + ag.reg); if (x.indexOf(l.id) < 0) { x.unshift(l.id); await rIdxPut(st, "agcl:" + ag.reg, x); } }
        // 판 사람 요청(팔기)을 맡은 사무소 [매도요청]에도 — 팔기 때 「부동산 선택 안 함」+ 제3자 제공 동의(맡게 되는 사무소)
        const sl = l.lead ? await st.get("ld:" + l.lead) : null;
        if (sl && (sl.agencies || []).indexOf(ag.reg) < 0) {
          sl.agencies = (sl.agencies || []).concat([ag.reg]); sl.agn = (sl.agn || []).concat([ag.name]); sl.st = sl.st || {}; sl.st[ag.reg] = "new"; sl.tk = ag.reg; await st.put("ld:" + sl.id, sl);
          const x = await rIdxGet(st, "agl:" + ag.reg); if (x.indexOf(sl.id) < 0) { x.unshift(sl.id); await rIdxPut(st, "agl:" + ag.reg, x); }
        }
        await tg("🤝 부동산 손님 매물 전담 정함 · " + bKst() + "\n\n" + R_PT[l.pt] + " · " + R_DEAL[l.deal] + " · " + (l.dong || "") + (l.bname ? " " + l.bname : "") + "\n→ " + ag.name);
        return R({ ok: true });
      }
      // 전담 매물 리포트 (2026-10-22) — ①직접 올린 매물 ②손님이 고른 매물 ③맡은 매물. 손님 매물의 판 사람 이름·연락처는 여기(인증된 전담 사무소)에서만
      if (p === "/realty/agent/ded") {
        const own = await rIdxGet(st, "agls:" + ag.reg), cl = await rIdxGet(st, "agcl:" + ag.reg);
        const m = await getMany(own.concat(cl).map(function (i) { return "ls:" + i; }));
        const items = [];
        for (const i of own) { const v = m.get("ls:" + i); if (v && v.reg === ag.reg) items.push(Object.assign(lsPub(v, null, true), { src: "own" })); }
        const cvs = cl.map(function (i) { return m.get("ls:" + i); }).filter(function (v) { return v && v.own === "c" && (v.regs || []).indexOf(ag.reg) >= 0; });
        const sm = await getMany(cvs.filter(function (v) { return v.lead; }).map(function (v) { return "ld:" + v.lead; }));
        for (const v of cvs) {
          const o = lsPub(v, null, true, null), sl = v.lead && sm.get("ld:" + v.lead) ? await piiOpen(env, "ld", "ld:" + v.lead, sm.get("ld:" + v.lead)) : null;
          o.src = v.tk && v.tk.reg === ag.reg ? "took" : "pick"; o.tkat = v.tk && v.tk.reg === ag.reg ? v.tk.at : "";
          if (sl) o.seller = { name: sl.name || "", phone: sl.phone || "", lang: sl.lang || "", addr: (sl.details || {}).addr || "", floor: (sl.details || {}).floor || "", memo: (sl.details || {}).memo || "", at: sl.at };
          delete o.lead; delete o.regs; delete o.tk; delete o.ags;
          items.push(o);
        }
        const wk = now - 7 * 86400000;
        items.forEach(function (o) { const v = m.get("ls:" + o.id) || {}; o.nq = v.nq || 0; o.nq7 = (v.qat || []).filter(function (t) { return t >= wk; }).length; o.left = Math.ceil((LS_DAYS - (now - (v.cf || 0))) / 86400000); });
        items.sort(function (a, b) { return (b.up || b.at || 0) - (a.up || a.at || 0); });
        return R({ ok: true, items: items });
      }
      if (p === "/realty/agent/status") {
        const id = rId(b.id), s = String(b.st || "");
        if (R_ST.indexOf(s) < 0) return R({ ok: false, err: "st" }, 400);
        const v = id ? await st.get("ld:" + id) : null;
        if (!v || (v.agencies || []).indexOf(ag.reg) < 0) return R({ ok: false, err: "notfound" }, 404);
        v.st = v.st || {}; v.st[ag.reg] = s; await st.put("ld:" + id, v);
        return R({ ok: true });
      }
      if (p === "/realty/agent/lead/del") {   // 이 사무소 목록에서만 지운다 — 다른 사무소도 받은 요청이면 기록은 남긴다 (사장님 2026-10-14)
        const id = rId(b.id), l = await rIdxGet(st, "agl:" + ag.reg);
        if (!id || l.indexOf(id) < 0) return R({ ok: false, err: "notfound" }, 404);
        await rIdxPut(st, "agl:" + ag.reg, l.filter(function (x) { return x !== id; }));
        const v = await st.get("ld:" + id);
        if (v) {
          let other = false;
          for (const r of (v.agencies || [])) { if (r === ag.reg) continue; if ((await rIdxGet(st, "agl:" + r)).indexOf(id) >= 0) { other = true; break; } }
          if (other) { v.gone = v.gone || {}; v.gone[ag.reg] = bKst(); await st.put("ld:" + id, v); }
          else { await st.delete("ld:" + id); await rIdxPut(st, "ldidx", (await rIdxGet(st, "ldidx")).filter(function (x) { return x !== id; })); }
        }
        return R({ ok: true });
      }
      // ── 매물·사무소 정보·사무소 사진 (2026-10-13) ──
      if (p === "/realty/agent/me") {
        const ids = await rIdxGet(st, "agls:" + ag.reg), m = await getMany(ids.map(function (i) { return "ls:" + i; }));
        const iqt = await st.get("iq:" + ag.reg);
        return R({ ok: true, agency: Object.assign(pub(ag), { email: ag.email || "", areaReq: ag.areaReq || null, iqUnread: iqt ? (iqt.aunread || 0) : 0 }), items: ids.map(function (i) { return m.get("ls:" + i); }).filter(Boolean).map(function (v) { return lsPub(v, null, true); }) });
      }
      if (p === "/realty/agent/info" || p === "/realty/agent/profile") {   // 전화·주소·외국어·한 줄 소개는 언제든 바로 바꾼다 (2026-10-14)
        const tel = rTxt(b.tel, 30), addr = rTxt(b.addr, 100);
        if (b.tel != null) { if (String(tel).replace(/\D/g, "").length < 8) return R({ ok: false, err: "tel" }, 400); ag.tel = [tel]; }
        if (b.addr != null) { if (!addr) return R({ ok: false, err: "addr" }, 400); ag.addr = addr; }
        if (Array.isArray(b.langs)) ag.langs = rLangs(b.langs);
        if (b.intro != null) ag.intro = rTxt(b.intro, 60);
        await st.put("ag:" + ag.reg, ag); return R({ ok: true, agency: Object.assign(pub(ag), { email: ag.email || "", areaReq: ag.areaReq || null }) });
      }
      if (p === "/realty/agent/areareq") {
        const areas = rAreas(b.areas); if (!areas.length) return R({ ok: false, err: "area" }, 400);
        if (await over("arq:" + ag.reg, 10, 86400000)) return R({ ok: false, err: "rate" }, 429);
        ag.areaReq = { areas: areas, at: bKst() }; await st.put("ag:" + ag.reg, ag);
        const sent = await tgOk("🏢 [" + ag.name + "] 중개 지역 변경 요청: " + areas.map(function (a) { return a.n; }).join(", ") + "\n\n승인은 앱 ⋮ → 🛠 관리자 → 제휴 업체");
        return R({ ok: true, tg: sent, areaReq: ag.areaReq });
      }
      if (p === "/realty/agent/iq/list") {
        const t = await iqGet(ag.reg); if (t.aunread) { t.aunread = 0; await st.put("iq:" + ag.reg, t); }
        return R({ ok: true, msgs: t.msgs });
      }
      if (p === "/realty/agent/iq/send") {
        const text = rTxtML(b.text, 1000); if (!text) return R({ ok: false, err: "empty" }, 400);
        let bin = null; if (b.photo) { bin = rJpeg(b.photo); if (!bin) return R({ ok: false, err: "photo" }, 400); }
        if (await over("iqs:" + ag.reg, 10, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const t = await iqGet(ag.reg), msg = { id: rNewId(), from: "ag", text: text, at: bKst() };
        if (bin) { msg.ph = bRand(8); await st.put("iqp:" + ag.reg + ":" + msg.ph, bin); }
        t.msgs.push(msg); t.unread = (t.unread || 0) + 1; t.last = now; await iqPut(ag.reg, t);
        const sent = await tgOk("🏢 [" + ag.name + "] 문의: " + text.slice(0, 300) + (bin ? "\n(사진 1장 첨부)" : "") + "\n\n답장은 앱 ⋮ → 🛠 관리자 → 문의");
        return R({ ok: true, tg: sent, msgs: t.msgs });
      }
      if (p === "/realty/agent/aphoto") {   // 사무소 사진 1~3장 — 통째로 바꾼다 ({keep}|{data})
        if (await over("apw:" + ag.reg, 60, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const inp = Array.isArray(b.photos) ? b.photos : [];
        if (inp.length > 3) return R({ ok: false, err: "photos" }, 400);
        const keep = ag.aph || [], ph = [], puts = {};
        for (const x of inp) {
          if (x && x.keep && keep.indexOf(x.keep) >= 0) { if (ph.indexOf(x.keep) < 0) ph.push(x.keep); continue; }
          const bin = rJpeg(x && x.data); if (!bin) return R({ ok: false, err: "photo" }, 400);
          const q = bRand(4); ph.push(q); puts["agp:" + ag.reg + ":" + q] = bin;
        }
        ag.aph = ph; puts["ag:" + ag.reg] = ag; await st.put(puts);
        const gone = keep.filter(function (q) { return ph.indexOf(q) < 0; }).map(function (q) { return "agp:" + ag.reg + ":" + q; }); if (gone.length) await st.delete(gone);
        return R({ ok: true, agency: Object.assign(pub(ag), { email: ag.email || "", areaReq: ag.areaReq || null }) });
      }
      if (p === "/realty/agent/face") {   // 대표 사진 1장 (증명사진) — {data} 바꾸기 · {del:true} 지우기 (2026-10-14)
        if (await over("afw:" + ag.reg, 30, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const old = ag.face || "";
        if (b.del) { ag.face = ""; await st.put("ag:" + ag.reg, ag); }
        else {
          const bin = rJpeg(b.data); if (!bin) return R({ ok: false, err: "photo" }, 400);
          const q = bRand(4); ag.face = q; const puts = {}; puts["agf:" + ag.reg + ":" + q] = bin; puts["ag:" + ag.reg] = ag; await st.put(puts);
        }
        if (old && old !== ag.face) await st.delete("agf:" + ag.reg + ":" + old);
        return R({ ok: true, agency: Object.assign(pub(ag), { email: ag.email || "", areaReq: ag.areaReq || null }) });
      }
      if (p === "/realty/agent/rb") {   // 같은 단지(지번)·전용면적에 앞서 넣은 방·욕실 수
        const x = await st.get(rbKey(rTxt(b.sg, 5), rTxt(b.dong, 20), rTxt(b.jibun, 30), +b.area || 0));
        return R({ ok: true, rb: x || null });
      }
      if (p === "/realty/agent/listing/save") {
        if (await over("lsw:" + ag.reg, 120, 3600000)) return R({ ok: false, err: "rate" }, 429);
        const r = rListing(b); if (r.err) return R({ ok: false, err: r.err }, 400);
        let id = b.id ? rId(b.id) : "", old = null;
        if (id) { old = await st.get("ls:" + id); if (!old || old.reg !== ag.reg) return R({ ok: false, err: "notfound" }, 404); }
        else { if ((await rIdxGet(st, "agls:" + ag.reg)).length >= 50) return R({ ok: false, err: "max" }, 400); id = rNewId(); }
        const inp = Array.isArray(b.photos) ? b.photos : [];
        if (inp.length > 5) return R({ ok: false, err: "photos" }, 400);
        const keep = old ? (old.ph || []) : [], ph = [], puts = {};
        for (const x of inp) {
          if (x && x.keep && keep.indexOf(x.keep) >= 0) { if (ph.indexOf(x.keep) < 0) ph.push(x.keep); continue; }
          const bin = rJpeg(x && x.data); if (!bin) return R({ ok: false, err: "photo" }, 400);
          const q = bRand(4); ph.push(q); puts["lsp:" + id + ":" + q] = bin;
        }
        const v = Object.assign(r.v, { id: id, reg: ag.reg, ph: ph, at: old ? old.at : now, up: now, cf: now });
        puts["ls:" + id] = v;
        if (v.baths != null) puts[rbKey(v.sg, v.dong, v.jibun, v.area)] = { r: v.rooms != null ? v.rooms : null, b: v.baths };   // 방·욕실 수 기억 — 같은 단지·평형 다음 입력 때 미리 채움 (2026-10-14)
        await st.put(puts);
        const gone = keep.filter(function (q) { return ph.indexOf(q) < 0; }).map(function (q) { return "lsp:" + id + ":" + q; }); if (gone.length) await st.delete(gone);
        if (!old) { for (const nm of ["agls:" + ag.reg, "lsa:" + v.sg, "lsidx"]) { const l = await rIdxGet(st, nm); l.unshift(id); await rIdxPut(st, nm, l); } }
        else if (old.sg !== v.sg) {
          const l1 = await rIdxGet(st, "lsa:" + old.sg); await rIdxPut(st, "lsa:" + old.sg, l1.filter(function (x) { return x !== id; }));
          const l2 = await rIdxGet(st, "lsa:" + v.sg); l2.unshift(id); await rIdxPut(st, "lsa:" + v.sg, l2);
        }
        return R({ ok: true, id: id });
      }
      if (p === "/realty/agent/listing/del" || p === "/realty/agent/listing/confirm") {
        const id = rId(b.id), v = id ? await st.get("ls:" + id) : null;
        if (!v || v.reg !== ag.reg) return R({ ok: false, err: "notfound" }, 404);
        if (p === "/realty/agent/listing/del") { await lsDel(id); return R({ ok: true }); }
        v.cf = now; await st.put("ls:" + id, v); return R({ ok: true });
      }
      // ── 장부 (사장님 2026-10-15) — lg:<reg>:<id> = {iv,ct} AES-GCM · 이 사무소 토큰만 · 관리자 화면엔 안 나온다 · 내용은 기록(log)하지 않는다
      if (p.startsWith("/realty/agent/ledger/")) {
        const key = await lgKey(env); if (!key) return R({ ok: false, err: "nokey" }, 503);
        const pre = "lg:" + ag.reg + ":";
        if (p === "/realty/agent/ledger/list") {
          const m = await st.list({ prefix: pre }), items = [];
          for (const [k, v] of m) { const r = await lgDec(key, k, v); if (r) { r.id = k.slice(pre.length); items.push(r); } }
          items.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : (a.id < b.id ? 1 : -1); });
          return R({ ok: true, items: items });
        }
        if (p === "/realty/agent/ledger/save") {
          const x = lgRow(b.row || {}); if (x.err) return R({ ok: false, err: x.err }, 400);
          let id = b.row && b.row.id ? rId(b.row.id) : "";
          if (id) { if (!(await st.get(pre + id))) return R({ ok: false, err: "notfound" }, 404); }
          else {
            if (await over("lgs:" + ag.reg, 500, 86400000)) return R({ ok: false, err: "rate" }, 429);
            if ((await st.list({ prefix: pre, limit: 3001 })).size >= 3000) return R({ ok: false, err: "many" }, 400);
            id = rNewId();
          }
          x.v.at = bKst(); await st.put(pre + id, await lgEnc(key, pre + id, x.v));
          x.v.id = id; return R({ ok: true, row: x.v });
        }
        if (p === "/realty/agent/ledger/del") {
          const id = rId(b.id); if (!id || !(await st.get(pre + id))) return R({ ok: false, err: "notfound" }, 404);
          await st.delete(pre + id); return R({ ok: true });
        }
        if (p === "/realty/agent/ledger/mail") {
          const to = rEmail(b.to); if (!to) return R({ ok: false, err: "email" }, 400);
          const data = String(b.data || "");
          if (!data || !/^[A-Za-z0-9+/]+=*$/.test(data)) return R({ ok: false, err: "file" }, 400);
          if (data.length > 2800000) return R({ ok: false, err: "big" }, 413);
          if (!env.RESEND_KEY) return R({ ok: false, err: "nomail" }, 503);
          if (await over("lgm:" + ag.reg, 10, 86400000)) return R({ ok: false, err: "rate" }, 429);
          const en = b.lang === "en", per = String(b.period || "").replace(/[^0-9~\-]/g, "").slice(0, 21) || bKst().slice(0, 7);
          const cnt = Math.max(0, parseInt(b.count, 10) || 0);
          const nm = String(ag.name || "").replace(/[\u0000-\u001f]/g, " ").trim();
          const subject = (en ? "Money Puzzle ledger " : "머니퍼즐 장부 ") + per + " — " + nm;
          const text = (en ? nm + " sent you this transaction ledger from the Money Puzzle app." : nm + "에서 머니퍼즐 앱으로 보낸 거래 장부입니다.") + "\n\n"
            + (en ? "Period: " : "기간: ") + per + "\n" + (en ? "Deals: " : "건수: ") + cnt + "\n\n"
            + (en ? "The Excel file is attached." : "엑셀 파일을 붙였습니다.") + "\n\nhttps://land.moneypuzzle.co.kr/";
          const r = await rMailAtt(env, { to: to, subject: subject, text: text, fromName: nm, replyTo: rEmail(ag.email) || "",
            attachments: [{ filename: (en ? "MoneyPuzzle_ledger_" : "머니퍼즐_장부_") + per.replace(/~/g, "_") + ".xlsx", content: data }] });
          if (r.ok) await st.put("dl:" + String(now).padStart(14, "0") + "-" + bRand(2), { who: "ag", reg: ag.reg, name: ag.name, kind: "ledmail", n: cnt, at: bKst() });   // 장부 메일도 내려받기 기록 (2026-10-22)
          return r.ok ? R({ ok: true }) : R({ ok: false, err: "send", status: r.status }, 502);
        }
        return R({ ok: false, err: "path" }, 404);
      }
      if (p === "/realty/agent/pw") {
        const np = String(b.new || "");
        if (np.length < 8 || np.length > 64) return R({ ok: false, err: "pwlen" }, 400);
        const fk = "lf:" + (await bSha(ih + "|" + ag.reg)).slice(0, 20);
        if (await over(fk, 10, 600000, false)) return R({ ok: false, err: "rate" }, 429);
        if (!bEq(await rHash(ag.salt, String(b.old || "").slice(0, 64)), ag.h)) { await bump(fk, 600000); return R({ ok: false, err: "pw" }, 403); }
        ag.salt = bRand(8); ag.h = await rHash(ag.salt, np); ag.pv = (ag.pv || 0) + 1; ag.mustpw = false;
        await st.put("ag:" + ag.reg, ag);
        return R({ ok: true, token: await token(ag) });
      }
    }
    return R({ ok: false, err: "path" }, 404);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const p = url.pathname;

    // 부동산 손님 연결 (2026-10-13) — 자기 길만 쓴다
    if (p === "/realty" || p.startsWith("/realty/")) return this.realty(request, url, p);

    if (p === "/hvoice") return this.hvoice(request);   // 홈페이지 고객의 소리 (2026-10-14)
    if (p === "/ntap" || p === "/ntapstats") return this.ntap(request, url, p);
    if (p === "/nledger") return this.nledger(request, url);
    if (p.startsWith("/npass/") || p.startsWith("/__npass/")) return npassDO(this, request, url, p);   // 내비 이용권 (2026-10-16)
    if (p === "/nvoice") return this.nvoice(request, url);
    if (p === "/nadminpw") return this.nadminpw(request, url);
    if (p === "/ninq" || p.startsWith("/ninq/")) return this.ninq(request, url, p);
    if (p.startsWith("/__nadm/")) return this.nadmInternal(request, p);
    if (p === "/npartner" || p === "/npartner/admin" || p.startsWith("/__np/")) return npartner(this, request, url, p, ninqCatOk);   // 제휴 가게 (2026-10-16)   // 내비 그림별 누름 수 (2026-10-15)

    // 고객 게시판 (2026-10-10) — 자기 길만 쓴다, 다른 길엔 영향 없음
    if (p === "/board" || p.startsWith("/board/")) return this.board(request, url, p);
    if (p === "/broker" || p === "/broker/put") return this.broker(request, url, p);

    // 홈페이지 방문 수 (2026-10-10) — vid = 브라우저 난수(개인정보 없음). 전체·순방문·오늘을 돌려준다
    if (p === "/hstats") {   // 홈페이지 방문 통계 화면 (2026-10-10)
      const st = this.state.storage, now = Date.now();
      const total = (await st.get("total")) || 0, uniq = (await st.get("uniq")) || 0;
      let rows = "";
      for (let i = 0; i < 14; i++) {
        const d = new Date(now + 9 * 3600000 - i * 86400000).toISOString().slice(0, 10);
        rows += "<tr><td>" + d + "</td><td style='text-align:right'>" + ((await st.get("d:" + d)) || 0) + "</td></tr>";
      }
      const html = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>홈페이지 방문</title>"
        + "<style>body{font:16px system-ui;background:#0f1420;color:#e8ecf2;margin:0;padding:24px}.b{display:flex;gap:12px;margin:14px 0}"
        + ".c{flex:1;background:#171d2b;border:1px solid #222a3a;border-radius:14px;padding:16px;text-align:center}.n{font-size:34px;font-weight:800}"
        + ".l{color:#9aa4b2;font-size:13px;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:10px}td{padding:8px 4px;border-bottom:1px solid #222a3a}</style>"
        + "<h2>moneypuzzle.co.kr · 홈페이지 방문</h2><div class=b><div class=c><div class=n>" + total + "</div><div class=l>누적 방문</div></div>"
        + "<div class=c><div class=n>" + uniq + "</div><div class=l>순 방문자</div></div></div>"
        + "<p style='color:#8a93a3;font-size:13px'>로봇·서버 접속 " + ((await st.get("bot")) || 0) + "회는 빼고 셈 · 사장님 기기도 안 셈 (2026-10-11 부터 다시 셈)</p>"
        + "<h3>지역별 방문 (IP 로 짐작 · 도시 단위)</h3><table>" + geoRows(await (async () => { const gm = await st.list({ prefix: "g:" }), ga = []; for (const [k, v] of gm) ga.push([k.slice(2), v]); ga.sort((a, b) => b[1] - a[1]); return ga.slice(0, 50); })()) + "</table>"
        + "<h3>최근 14일 방문</h3><table>" + rows + "</table><p style='color:#6b7688;font-size:12px'>2026-10-10 부터 · 같은 창에서 다시 열면 안 셈 · 30초마다 새로고침</p>"
        + "<script>setTimeout(function(){location.reload()},30000)</script>";
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    }
    if (p === "/hc") {
      const st = this.state.storage;
      const vid = (url.searchParams.get("vid") || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
      const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
      let total = (await st.get("total")) || 0, uniq = (await st.get("uniq")) || 0, dc = (await st.get("d:" + today)) || 0;
      if (request.method === "DELETE") {                 // 처음부터 다시 세기 — 관리자 열쇠
        if (!this.auth(request)) return new Response("no", { status: 403 });
        await st.deleteAll(); return J({ ok: true, reset: true });
      }
      if (url.searchParams.get("n") === "1" && url.searchParams.get("b") === "1") {
        await st.put("bot", ((await st.get("bot")) || 0) + 1);
      } else if (url.searchParams.get("n") === "1") {
        total++; dc++;
        const puts = { total: total, ["d:" + today]: dc };
        if (vid && !(await st.get("v:" + vid))) { uniq++; puts["v:" + vid] = 1; puts.uniq = uniq; }
        const g = (url.searchParams.get("g") || "").slice(0, 80);   // 지역별 방문 (2026-10-10) — 나라|시도|도시
        if (g && g !== "||") puts["g:" + g] = ((await st.get("g:" + g)) || 0) + 1;
        await st.put(puts);
      }
      if (url.searchParams.get("geo") === "1") {
        const gm = await st.list({ prefix: "g:" }), ga = [];
        for (const [k, v] of gm) ga.push([k.slice(2), v]);
        ga.sort((a, b) => b[1] - a[1]);
        return J({ total: total, uniq: uniq, today: dc, geo: ga.slice(0, 50), bot: (await st.get("bot")) || 0 });
      }
      return J({ total: total, uniq: uniq, today: dc });
    }

    // ── 추천 전체 목록 (2026-10-10) — 코드를 가진 사람만. 공개 reco.json 은 종목이 가려져 있다 ──
    //    PUT  /reco  (x-key)      서버가 전체 목록을 올린다
    //    GET  /reco?c=코드         맞으면 전체 목록 · 틀리면 403
    if (p === "/reco" && request.method === "PUT") {
      if (!this.auth(request)) return new Response("no", { status: 403 });
      const t = await request.text();
      if (t.length > 2000000) return new Response("big", { status: 413 });
      await this.state.storage.put("reco_full", t);
      return J({ ok: true });
    }
    if (p === "/reco") {
      const c = (url.searchParams.get("c") || "").trim().toUpperCase();
      const ok = c && String(this.env.RECO_CODES || "").split(",").map(function (x) { return x.trim().toUpperCase(); }).filter(Boolean).indexOf(c) >= 0;
      const H = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
      if (!ok) return new Response(JSON.stringify({ error: "code" }), { status: 403, headers: H });
      const t = await this.state.storage.get("reco_full");
      if (!t) return new Response(JSON.stringify({ error: "empty" }), { status: 404, headers: H });
      return new Response(t, { headers: H });
    }

    // 사전 요청 — 브라우저가 PUT/POST 전에 물어보는 것 (2026-09-23)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400" } });
    }

    // ── 대시보드 push (집 PC) ──
    if (p === "/push") {
      if (!this.auth(request)) return new Response("unauthorized", { status: 401 });
      this.snap = await request.text();
      for (const ws of [...this.sockets]) {
        try { ws.send(this.snap); } catch (e) { this.sockets.delete(ws); }
      }
      return new Response("ok");
    }

    // ── 대시보드 WebSocket (폰) ──
    if (p === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket")
        return new Response("expected websocket", { status: 426 });
      const pair = new WebSocketPair();
      const client = pair[0], server = pair[1];
      server.accept();
      this.sockets.add(server);
      if (this.snap) { try { server.send(this.snap); } catch (e) {} }
      const drop = () => this.sockets.delete(server);
      server.addEventListener("close", drop);
      server.addEventListener("error", drop);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (p === "/data") {
      return new Response(this.snap || '{"loading":true}', {
        headers: { "Content-Type": "application/json; charset=utf-8",
                   "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
    }

    // ── 국내종목: 집 PC가 대기열 가져가기 ──
    if (p === "/kr/pending") {
      if (!this.auth(request)) return new Response("unauthorized", { status: 401 });
      const now = Date.now();
      this.pcSeen = now;                                   // 집 PC 가 살아 있다 (미국 조회를 PC 로 보낼지 가름)
      for (const k in this.pending) if (now - this.pending[k].ts > 15000) delete this.pending[k];
      return J(Object.keys(this.pending).map(k => ({ key: k, op: this.pending[k].op, q: this.pending[k].q })));
    }

    // ── 국내종목: 집 PC가 결과 올리기 ──
    if (p === "/kr/result") {
      if (!this.auth(request)) return new Response("unauthorized", { status: 401 });
      const b = await request.json();
      this.results[b.key] = { data: b.data, ts: Date.now() };
      delete this.pending[b.key];
      return new Response("ok");
    }

    // ── 국내종목: 폰 요청 (/kr/stock?code=, /kr/search?q=, /kr/chart?code=&tf=) ──
    if (p.startsWith("/kr/")) {
      const op = p.slice(4);
      const key = op + url.search;
      const now = Date.now();
      const r = this.results[key];
      const ttl = KTTL[op] || 5000;
      if (r && now - r.ts < ttl) return J({ ok: true, data: r.data });
      this.pending[key] = { op, q: url.search, ts: now };
      return J({ pending: true });
    }

    // ── 방문 카운트 ──
    if (p === "/hit") {
      const vid = url.searchParams.get("vid") || "";
      const src = ((url.searchParams.get("src") || "direct").slice(0, 16).replace(/[^a-z0-9_-]/gi, "")) || "direct";
      const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10); // KST
      const st = this.state.storage;
      let total = (await st.get("total")) || 0;
      let uniq = (await st.get("uniq")) || 0;
      let dc = (await st.get("d:" + today)) || 0;
      total++; dc++;
      const puts = { total: total, ["d:" + today]: dc };
      // 앱별로 갈라 센다 (사장님 2026-09-24) — 이름표가 없으면 본앱
      const app = ((url.searchParams.get("app") || "main").slice(0, 12).replace(/[^a-z0-9_-]/gi, "")) || "main";
      puts["at:" + app] = ((await st.get("at:" + app)) || 0) + 1;
      if (vid) {
        if (!(await st.get("av:" + app + ":" + vid))) {
          puts["av:" + app + ":" + vid] = 1;
          puts["au:" + app] = ((await st.get("au:" + app)) || 0) + 1;
        }
        const adk = "ad:" + app + ":" + today + ":" + vid;
        if (!(await st.get(adk))) {
          puts[adk] = 1;
          puts["adau:" + app + ":" + today] = ((await st.get("adau:" + app + ":" + today)) || 0) + 1;
        }
      }
      if (vid) {
        const seen = await st.get("v:" + vid);
        // 일별 활성 순방문(DAU): 오늘 이 vid 첫 방문이면 카운트
        const duk = "du:" + today + ":" + vid;
        if (!(await st.get(duk))) {
          puts[duk] = 1;
          puts["dau:" + today] = ((await st.get("dau:" + today)) || 0) + 1;
        }
        // 설치 앱 실행(start_url 의 ?src=pwa) — 첫방문 여부와 무관하게 앱 사용자로 집계
        if (src === "pwa") {
          const ak = "app:" + vid;
          if (!(await st.get(ak))) { puts[ak] = 1; puts["appusers"] = ((await st.get("appusers")) || 0) + 1; }
          const apd = "apu:" + today + ":" + vid;
          if (!(await st.get(apd))) { puts[apd] = 1; puts["apuday:" + today] = ((await st.get("apuday:" + today)) || 0) + 1; }
        }
        if (!seen) {
          uniq++; puts["v:" + vid] = 1; puts["uniq"] = uniq;
          const sk = "src:" + src;                          // 순방문(신규)일 때만 경로 집계
          puts[sk] = ((await st.get(sk)) || 0) + 1;
          puts["vlast:" + vid] = today; puts["vdays:" + vid] = 1;   // 방문한 날 수 추적 시작
        } else {
          const vlast = await st.get("vlast:" + vid);
          if (!vlast) {                                     // 기존 사용자 백필
            puts["vlast:" + vid] = today; puts["vdays:" + vid] = 1;
          } else if (vlast !== today) {                     // 다른 날 재방문
            const vd = ((await st.get("vdays:" + vid)) || 1) + 1;
            puts["vdays:" + vid] = vd; puts["vlast:" + vid] = today;
            if (vd === 2) puts["returning"] = ((await st.get("returning")) || 0) + 1;  // 처음으로 2일째 = 재방문자
          }
        }
      }
      await st.put(puts);
      return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
    }

    // ── 증권사 요청 세기 (사장님 2026-09-19) — 목록에 없는 증권사를 앱에서 보내면 이름별로 센다 ──
    //    🔴 개인정보 없음: 이름과 기기 난수(vid)만. 같은 기기가 같은 이름을 여러 번 보내도 한 번.
    if (p === "/req") {
      const raw = (url.searchParams.get("b") || "").replace(/[<>"'&]/g, "").replace(/\s+/g, " ").trim().slice(0, 30);
      const vid = (url.searchParams.get("vid") || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
      if (!raw) return J({ ok: false });
      const key = raw.replace(/\s/g, "").toLowerCase();
      const st = this.state.storage;
      const once = "rqv:" + vid + ":" + key;
      if (!vid || !(await st.get(once))) {
        const cur = (await st.get("rq:" + key)) || { n: 0, name: raw };
        cur.n += 1; cur.last = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 16).replace("T", " ");
        const puts = { ["rq:" + key]: cur };
        if (vid) puts[once] = 1;
        await st.put(puts);
      }
      return J({ ok: true });
    }

    // ── 고객의 소리 (사장님 2026-09-19) — 자유 글 300자. 🔴 개인정보 없음(글 + 앱 구분 + 기기 난수) ──
    if (p === "/voice") {
      const t = (url.searchParams.get("t") || "").replace(/[<>]/g, "").trim().slice(0, 300);
      const app = (url.searchParams.get("app") || "live").replace(/[^a-z0-9]/g, "").slice(0, 8);   // demo2 숫자 살림 (2026-10-04)
      const vid = (url.searchParams.get("vid") || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
      if (!t) return J({ ok: false });
      const st = this.state.storage;
      const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
      const dup = "vcd:" + today + ":" + vid + ":" + t.length + ":" + t.slice(0, 20);
      if (!vid || !(await st.get(dup))) {
        const at = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 16).replace("T", " ");
        const puts = { ["vc:" + Date.now() + ":" + Math.random().toString(36).slice(2, 6)]: { t, app, at } };
        if (vid) puts[dup] = 1;
        await st.put(puts);
        // 텔레그램으로 바로 알림 (사장님 2026-10-04) — 실패해도 저장은 그대로
        if (this.env.TG_TOKEN && this.env.TG_CHAT) {
          const AN = { stock: "주식앱", coin: "코인앱", live: "본앱", demo: "실전앱(demo)", demo2: "실전앱(demo2)" };
          try {
            await fetch("https://api.telegram.org/bot" + this.env.TG_TOKEN + "/sendMessage", {
              method: "POST", headers: { "content-type": "application/json" },
              body: JSON.stringify({ chat_id: this.env.TG_CHAT, text: "📮 고객의 소리 · " + (AN[app] || app) + " · " + at + "\n\n" + t, disable_web_page_preview: true }),
            });
          } catch (e) {}
        }
        try {   // 메일도 (사장님 2026-10-17)
          const AN2 = { stock: "주식앱", coin: "코인앱", live: "본앱", demo: "실전앱(demo)", demo2: "실전앱(demo2)" };
          await rMail(this.env, "emhwang3@moneypuzzle.co.kr", "[머니퍼즐 고객의 소리 · " + (AN2[app] || app) + "] " + t.replace(/\s+/g, " ").slice(0, 30), t + "\n\n────────\n앱: " + app + "\n시각: " + at + " (KST)");
        } catch (e) {}
      }
      return J({ ok: true });
    }

    if (p === "/stats") {
      const st = this.state.storage;
      const total = (await st.get("total")) || 0;
      const uniq = (await st.get("uniq")) || 0;
      const returning = (await st.get("returning")) || 0;
      const now = Date.now();
      const todayStr = new Date(now + 9 * 3600000).toISOString().slice(0, 10);
      const dauToday = (await st.get("dau:" + todayStr)) || 0;
      const appusers = (await st.get("appusers")) || 0;
      const apuToday = (await st.get("apuday:" + todayStr)) || 0;
      const rrate = uniq ? Math.round(returning * 1000 / uniq) / 10 : 0;
      let rows = "";
      for (let i = 0; i < 7; i++) {
        const d = new Date(now + 9 * 3600000 - i * 86400000).toISOString().slice(0, 10);
        const c = (await st.get("d:" + d)) || 0;
        const du = (await st.get("dau:" + d)) || 0;
        rows += "<tr><td>" + d + "</td><td style='text-align:right'>" + c + "</td><td style='text-align:right'>" + du + "</td></tr>";
      }
      const SLAB = { yt: "유튜브", x: "X (트위터)", blog: "네이버 블로그", kt: "카카오톡", tg: "텔레그램", pwa: "앱(홈화면 설치)", direct: "직접 입력", ref: "기타 링크" };
      const smap = await st.list({ prefix: "src:" });
      const sarr = [];
      for (const [k, v] of smap) sarr.push([k.slice(4), v]);
      sarr.sort((a, b) => b[1] - a[1]);
      let srows = "";
      for (const [s, c] of sarr)
        srows += "<tr><td>" + (SLAB[s] || s) + "</td><td style='text-align:right'>" + c + "</td></tr>";
      if (!srows) srows = "<tr><td colspan=2 style='color:#6b7688'>아직 경로 데이터 없음</td></tr>";
      // 앱별 줄 (사장님 2026-09-24)
      const ALAB = { main: "본앱(일일브리핑)", stock: "주식앱", coin: "코인앱", demo: "데모앱" };
      const amap = await st.list({ prefix: "at:" });
      const aarr = [];
      for (const [k, v] of amap) {
        const nm = k.slice(3);
        aarr.push([nm, v, (await st.get("au:" + nm)) || 0, (await st.get("adau:" + nm + ":" + todayStr)) || 0]);
      }
      aarr.sort((a, b) => b[1] - a[1]);
      let arows = "";
      for (const a of aarr)
        arows += "<tr><td>" + (ALAB[a[0]] || a[0]) + "</td><td style='text-align:right'>" + a[1]
              + "</td><td style='text-align:right'>" + a[2] + "</td><td style='text-align:right'>" + a[3] + "</td></tr>";
      if (!arows) arows = "<tr><td colspan=4 style='color:#6b7688'>아직 앱별 자료 없음</td></tr>";
      // 홈페이지 방문 수 (2026-10-10) — "home" 칸에서 받아 온다
      let hrow = "";
      try {
        const hj = await (await this.env.HUB.get(this.env.HUB.idFromName("home")).fetch("https://hub/hc?n=0&geo=1")).json();
        hrow = "<h3>홈페이지 moneypuzzle.co.kr (2026-10-11 부터 · 로봇·사장님 기기 뺌)</h3><table><tr><td>누적 방문</td><td style='text-align:right'>" + hj.total
             + "</td></tr><tr><td>순 방문자</td><td style='text-align:right'>" + hj.uniq + "</td></tr><tr><td>오늘 방문</td><td style='text-align:right'>" + hj.today + "</td></tr><tr><td style='color:#8a93a3'>로봇·서버 (안 셈)</td><td style='text-align:right;color:#8a93a3'>" + (hj.bot || 0) + "</td></tr></table>"
             + "<h3>홈페이지 지역별 방문 (IP 로 짐작 · 도시 단위, 휴대폰은 통신사 위치로 잡힐 수 있음)</h3><table>" + geoRows(hj.geo) + "</table>";
      } catch (e) { hrow = "<p style='color:#8a93a3'>홈페이지 수 못 읽음: " + String(e && e.message || e).slice(0, 80) + "</p>"; }
      const rmap = await st.list({ prefix: "rq:" });
      const rarr = [];
      for (const [k, v] of rmap) rarr.push(v);
      rarr.sort((a, b) => b.n - a.n);
      let rrows = "";
      for (const r of rarr)
        rrows += "<tr><td>" + r.name + "</td><td style='text-align:right'>" + r.n + "</td><td style='text-align:right;color:#9aa4b2'>" + (r.last || "") + "</td></tr>";
      if (!rrows) rrows = "<tr><td colspan=3 style='color:#6b7688'>아직 요청 없음</td></tr>";
      const vmap = await st.list({ prefix: "vc:", reverse: true, limit: 50 });
      let vrows = "";
      for (const [k, v] of vmap) {
        const esc = String(v.t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
        vrows += "<tr><td style='white-space:nowrap;color:#9aa4b2;vertical-align:top'>" + v.at + "<br>" + ({ stock: "주식앱", coin: "코인앱", live: "본앱", demo: "실전앱(demo)", demo2: "실전앱(demo2)" }[v.app] || v.app || "본앱") + "</td><td>" + esc + "</td></tr>";
      }
      if (!vrows) vrows = "<tr><td colspan=2 style='color:#6b7688'>아직 글 없음</td></tr>";
      const html = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
        + "<title>방문 통계</title><style>body{font:16px system-ui;background:#0f1420;color:#e8ecf2;margin:0;padding:24px}"
        + ".b{display:flex;gap:12px;margin:14px 0}.c{flex:1;background:#171d2b;border:1px solid #222a3a;border-radius:14px;padding:16px;text-align:center}"
        + ".n{font-size:34px;font-weight:800}.l{color:#9aa4b2;font-size:13px;margin-top:4px}"
        + "table{width:100%;border-collapse:collapse;margin-top:10px}td{padding:8px 4px;border-bottom:1px solid #222a3a}</style>"
        + "<h2>일일브리핑 LIVE · 방문 통계</h2>"
        + "<div class=b><div class=c><div class=n>" + total + "</div><div class=l>누적 방문</div></div>"
        + "<div class=c><div class=n>" + uniq + "</div><div class=l>순 방문자</div></div></div>"
        + "<div class=b><div class=c><div class=n>" + dauToday + "</div><div class=l>오늘 활성(DAU)</div></div>"
        + "<div class=c><div class=n>" + returning + "</div><div class=l>재방문자</div></div>"
        + "<div class=c><div class=n>" + rrate + "%</div><div class=l>재방문율</div></div></div>"
        + "<div class=b><div class=c><div class=n>" + appusers + "</div><div class=l>앱 사용자(설치 실행)</div></div>"
        + "<div class=c><div class=n>" + apuToday + "</div><div class=l>오늘 앱 실행(순)</div></div></div>"
        + "<p style='color:#8a93a3;font-size:12px'>재방문자 = 서로 다른 날에 2번 이상 온 사람 · 재방문율 = 재방문자 ÷ 순방문자</p>"
        + "<h3>앱별 (2026-09-24 부터)</h3><table><tr><td>앱</td><td style='text-align:right'>누적 방문</td>"
        + "<td style='text-align:right'>순 방문자</td><td style='text-align:right'>오늘</td></tr>" + arows + "</table>" + hrow
        + "<h3>유입 경로(순방문 기준)</h3><table>" + srows + "</table>"
        + "<h3>고객의 소리 (최근 50개)</h3><table>" + vrows + "</table>"
        + "<h3>증권사 요청 (기기당 1번)</h3><table><tr><td>증권사</td><td style='text-align:right'>요청</td><td style='text-align:right'>마지막</td></tr>" + rrows + "</table>"
        + "<h3>최근 7일 (방문 · 활성순방문)</h3><table><tr><td>날짜</td><td style='text-align:right'>방문</td><td style='text-align:right'>순방문(DAU)</td></tr>" + rows + "</table>"
        + "<p style='color:#6b7688;font-size:12px'>30초마다 새로고침 · 경로는 링크의 ?src= 꼬리표로 집계</p><script>setTimeout(function(){location.reload()},30000)</script>";
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    }

    // ── 미국 목록 — 집 PC 가 키움 목록(한글명 포함)을 올린다 (2026-09-27) ──
    if (p === "/us/list") {
      if (!this.auth(request)) return new Response("unauthorized", { status: 401 });
      const b = await request.json();
      if (b && Array.isArray(b.L) && b.L.length > 1000) { this.usKw = b.L; this.usKwAt = Date.now(); return J({ ok: true, n: b.L.length }); }
      return J({ ok: false });
    }
    // ── 미국 시세 — 집 PC(키움)에 먼저 묻는다 (2026-09-27, Infoway 없이도 실시간). 2.5초 안에 답이 없으면 옛 길 ──
    if ((p === "/us/quote" || p === "/us/kline") && this.pcSeen && Date.now() - this.pcSeen < 5000) {
      const op = p === "/us/quote" ? "usquote" : "uskline";
      const key = op + url.search, now = Date.now();
      const tp = url.searchParams.get("type") || "8";
      const ttl = op === "usquote" ? 3000 : (tp === "8" ? 30000 : 20000);
      const r0 = this.results[key];
      if (r0 && r0.data && now - r0.ts < ttl) return J(r0.data);
      this.pending[key] = { op, q: url.search, ts: now };
      for (let i = 0; i < 25; i++) {
        await new Promise(res => setTimeout(res, 100));
        const r = this.results[key];
        if (r && r.ts >= now) { if (r.data && r.data.ret === 200) return J(r.data); break; }
      }
    }
    // ── 미국주식 (Infoway 직접 프록시; 키는 허브 secret) ──
    if (p === "/us/quote" || p === "/us/kline") {
      this.usC = this.usC || {};
      if (Object.keys(this.usC).length > 300) this.usC = {};   // 캐시 폭주 방지
      const now = Date.now();
      let ck, ttl, doFetch, valid;
      if (p === "/us/quote") {
        const codes = url.searchParams.get("codes") || "";
        if (!codes) return J({ error: "no codes" });
        ck = "q:" + codes; ttl = 5000;
        doFetch = () => fetch("https://data.infoway.io/stock/batch_trade/" + codes,
          { headers: { apikey: this.env.INFOWAY_KEY, "User-Agent": "brief" } });
        valid = d => d && d.ret === 200 && d.data;
      } else {
        const code = url.searchParams.get("code") || "";
        const type = parseInt(url.searchParams.get("type") || "8", 10);
        const num = Math.min(500, parseInt(url.searchParams.get("num") || "200", 10));
        if (!code) return J({ error: "no code" });
        ck = "k:" + code + ":" + type + ":" + num; ttl = 30000;
        // 🔴 미국 일봉은 야후에서 받는다 (사장님 2026-09-23 — Infoway 약정이 끝난다).
        //    분봉은 아직 Infoway. 야후는 무료·무제한이고 과거 일봉이 길게 나온다.
        if (type === 8 || type === 9) {
          const iv = (type === 9) ? "1wk" : "1d";
          const rng = num > 400 ? "5y" : (num > 250 ? "2y" : (num > 120 ? "1y" : "6mo"));
          const sym = String(code).replace(/\.US$/i, "");
          doFetch = () => fetch("https://query1.finance.yahoo.com/v8/finance/chart/"
              + encodeURIComponent(sym) + "?range=" + rng + "&interval=" + iv,
            { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
          valid = d => {
            try {
              const r = d && d.chart && d.chart.result && d.chart.result[0];
              const q = r && r.indicators && r.indicators.quote && r.indicators.quote[0];
              const cl = q && q.close, ts = r && r.timestamp;
              if (!cl || !ts || cl.length < 5) return false;
              const rows = [];
              for (let i = 0; i < ts.length; i++) {
                if (cl[i] == null) continue;
                rows.push({ c: cl[i], o: (q.open && q.open[i]) || cl[i], h: (q.high && q.high[i]) || cl[i],
                            l: (q.low && q.low[i]) || cl[i], v: (q.volume && q.volume[i]) || 0, t: ts[i] * 1000 });
              }
              if (rows.length < 5) return false;
              rows.reverse();                                   // 앱은 최신이 앞
              d._out = { ret: 200, data: [{ code: sym, respList: rows.slice(0, num) }] };
              return true;
            } catch (e) { return false; }
          };
        } else {
          doFetch = () => fetch("https://data.infoway.io/stock/v2/batch_kline",
            { method: "POST",
              headers: { apikey: this.env.INFOWAY_KEY, "Content-Type": "application/json", "User-Agent": "brief" },
              body: JSON.stringify({ codes: code, klineType: type, klineNum: num }) });
          valid = d => d && d.ret === 200 && d.data && d.data[0] && d.data[0].respList && d.data[0].respList.length;
        }
      }
      const hit = this.usC[ck];
      if (hit && now - hit.ts < ttl) return J(hit.d);          // 신선한 캐시
      for (let a = 0; a < 3; a++) {                            // 유량제한 재시도
        try {
          const d = await (await doFetch()).json();
          if (valid(d)) { const out = d._out || d; this.usC[ck] = { d: out, ts: now }; return J(out); }
        } catch (e) {}
        await new Promise(res => setTimeout(res, 450));
      }
      if (hit) return J(hit.d);                                // 새로 못 받으면 오래된 캐시라도
      return J({ error: "infoway busy", data: [] });
    }
    if (p === "/us/search") {
      const q = (url.searchParams.get("q") || "").trim().toUpperCase();
      if (!q) return J({ data: [] });
      if (this.usKw && this.usKw.length > 1000) {
        const ko = /[가-힣]/.test(q), qn = q.replace(/\s+/g, "");
        const AL = {"구글":["GOOGL","GOOG"],"GOOGLE":["GOOGL","GOOG"],"페이스북":["META"],"FACEBOOK":["META"],"존슨앤존슨":["JNJ"],
          "JP모건":["JPM"],"제이피모건":["JPM"],"JP모간":["JPM"],"마스터카드":["MA"],"TSMC":["TSM"],"대만반도체":["TSM"],"세일즈포스":["CRM"],
          "마소":["MSFT"],"쉐브론":["CVX"],"프록터앤갬블":["PG"],"피앤지":["PG"],"P&G":["PG"],"모건스탠리":["MS"],"마이크로스트래티지":["MSTR"],
          "나스닥100":["QQQ"],"S&P500":["SPY","VOO","IVV"],"에스앤피500":["SPY","VOO","IVV"],"슈드":["SCHD"],"티큐큐큐":["TQQQ"],"속슬":["SOXL"],
          "브이오오":["VOO"],"보글":["VOO"],"버라이즌":["VZ"]};
        const al = {}; if (qn.length >= 2) for (const k in AL) if (k.indexOf(qn) === 0) AL[k].forEach((t, i) => { al[t] = -10 + i; });
        const hits = [];
        for (const r of this.usKw) {
          const K = String(r[1] || "").replace(/\s+/g, ""), En = String(r[2] || "").toUpperCase().replace(/\s+/g, "");
          let sc = ko ? (K === qn ? 0 : (K.startsWith(qn) ? 1 : (K.includes(qn) ? 2 : 9)))
            : (r[0] === q ? 0 : (r[0].startsWith(q) ? 1 : (En.startsWith(qn) ? 2 : (En.includes(qn) ? 3 : 9))));
          if (al[r[0]] != null) sc = al[r[0]];
          if (sc < 9) hits.push([sc, r]);
        }
        hits.sort((a, b) => (a[0] - b[0]) || ((a[1][4] || 0) - (b[1][4] || 0)) || (a[1][0].length - b[1][0].length));
        const en = url.searchParams.get("en") === "1";
        return J({ src: "kiwoom", data: hits.slice(0, 20).map(h => ({ code: h[1][0] + ".US", name: (en ? (h[1][2] || h[1][1]) : (h[1][1] || h[1][2])) || h[1][0], tick: h[1][0] })) });
      }
      if (this.pcSeen && Date.now() - this.pcSeen < 5000) this.pending["uslist"] = { op: "uslist", q: "", ts: Date.now() };   // PC 에 목록 올려 달라
      try {
        if (!this.usSyms || (Date.now() - (this.usSymsAt || 0) > 86400000)) {
          const r = await fetch("https://data.infoway.io/common/basic/symbols?type=STOCK_US",
            { headers: { apikey: this.env.INFOWAY_KEY, "User-Agent": "brief" } });
          const d = await r.json();
          const L = (d.data || []).filter(x => !x.index).map(x => ({
            code: x.symbol, name: x.name_en || (x.symbol || "").replace(/\.US$/, ""),
            tick: (x.symbol || "").replace(/\.US$/, "").toUpperCase()
          }));
          if (L.length > 1000) { this.usSyms = L; this.usSymsAt = Date.now(); }   // 🔴 빈 목록은 저장하지 않는다 — 한 번 실패로 하루 내내 빈손이던 것 (2026-09-27)
          else this.usSyms = this.usSyms || [];
        }
        const hits = [];
        for (const s of this.usSyms) {
          if (s.tick.startsWith(q) || s.name.toUpperCase().includes(q)) hits.push(s);
          if (hits.length > 400) break;
        }
        hits.sort((a, b) => {
          const rk = s => {
            const nm = s.name.toUpperCase();
            if (s.tick === q) return 0;
            if (s.tick.startsWith(q)) return 1;
            if (nm.startsWith(q)) return 2;
            return 3;
          };
          return rk(a) - rk(b) || a.tick.length - b.tick.length;
        });
        return J({ data: hits.slice(0, 20) });
      } catch (e) { return J({ error: String(e), data: [] }); }
    }

    // ── 개인 보관함 (사장님 데모앱 전용, 2026-09-23) ─────────────────────────
    //   GET  /sync?k=<뒤섞은 암호>        → {ok, at, data}
    //   POST /sync?k=<뒤섞은 암호> (본문 JSON) → {ok, at}
    //   🔴 암호 자체는 오지 않는다. 그 값을 모르면 남의 칸을 열 수 없다.
    if (p === "/sync") {
      const k = (url.searchParams.get("k") || "").replace(/[^a-f0-9]/gi, "").slice(0, 64);
      if (k.length < 32) return J({ ok: false, err: "key" });
      const st = this.state.storage, slot = "sy:" + k;
      if (request.method === "POST" || request.method === "PUT") {
        const body = await request.text();
        if (body.length > 100000) return J({ ok: false, err: "too big" });
        let data = null;
        try { data = JSON.parse(body); } catch (e) { return J({ ok: false, err: "bad json" }); }
        const rec = { at: Date.now(), data: data };
        await st.put(slot, rec);
        return J({ ok: true, at: rec.at });
      }
      const rec = await st.get(slot);
      return J({ ok: true, at: rec ? rec.at : 0, data: rec ? rec.data : null });
    }

    return new Response("brief live hub", { status: 200 });
  }
}

// ── 7일짜리 초대 링크 (사장님 2026-10-15) — 고정 코드 대신 서명한 표 ─────────────────
//   GET /invmint?app=&me=EM2410 → {ok, inv:"yyyymmdd.서명10자"} (만료 = 오늘+7일, UTC)
//   GET /invchk?app=&inv=        → {ok:true} | {ok:false, err:"expired"|"bad"}
//   서명 = HMAC-SHA256(INV_SECRET, app+"|"+exp) 앞 10자(hex). 비밀은 wrangler secret 에만.
const INV_APPS = ["land", "news", "navi", "stock", "mini", "hts", "coin"];
function invDay(ms) { return new Date(ms).toISOString().slice(0, 10).replace(/-/g, ""); }
async function invSig(env, app, exp) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(env.INV_SECRET || "")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(app + "|" + exp));
  return [...new Uint8Array(s)].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("").slice(0, 10);
}
async function invite(request, env) {
  const origin = request.headers.get("Origin") || "";
  const okO = mpOrigin(origin);
  const H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": okO ? origin : "https://moneypuzzle.co.kr", "Vary": "Origin" };
  const out = function (o) { return new Response(JSON.stringify(o), { headers: H }); };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: Object.assign({ "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Max-Age": "86400" }, H) });
  if (!env.INV_SECRET) return out({ ok: false, err: "nosecret" });
  const u = new URL(request.url), sp = u.searchParams, app = (sp.get("app") || "").toLowerCase();
  if (INV_APPS.indexOf(app) < 0) return out({ ok: false, err: "app" });
  if (u.pathname === "/invmint") {
    if (!okO) return out({ ok: false, err: "origin" });   // 우리 앱 주소에서만 (사장님 10-17 퍼가기 막기)
    if (sp.get("me") !== "EM2410") return out({ ok: false, err: "me" });
    const exp = invDay(Date.now() + 7 * 86400000);
    return out({ ok: true, inv: exp + "." + await invSig(env, app, exp), exp: exp });
  }
  const m = /^(\d{8})\.([0-9a-f]{10})$/.exec(sp.get("inv") || "");
  if (!m) return out({ ok: false, err: "bad" });
  const want = await invSig(env, app, m[1]);
  let diff = 0; for (let i = 0; i < 10; i++) diff |= want.charCodeAt(i) ^ m[2].charCodeAt(i);
  if (diff) return out({ ok: false, err: "bad" });
  if (m[1] < invDay(Date.now())) return out({ ok: false, err: "expired" });
  return out({ ok: true, exp: m[1] });
}
