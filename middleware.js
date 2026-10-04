// /admin 페이지 보호용 미들웨어.
// 비밀번호 원문은 코드에 없고 SHA-256 해시만 저장한다.
// Vercel 환경변수 ADMIN_USER / ADMIN_PASS 를 넣으면 그 조합으로도 로그인할 수 있다.
const DEFAULT_USER = 'jhoon-admin';
const DEFAULT_PASS_SHA256 = 'f0aa92f1153b2395721e9e99f4068e1fd564299d5159ee27fd772faf1d190aaa';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin.html'],
};

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function unauthorized() {
  return new Response('로그인이 필요합니다.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="JHOON admin", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function middleware(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return unauthorized();

  let decoded = '';
  try {
    decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)),
    );
  } catch {
    return unauthorized();
  }
  const i = decoded.indexOf(':');
  if (i < 0) return unauthorized();
  const givenUser = decoded.slice(0, i).trim();
  const givenPass = decoded.slice(i + 1).trim();

  const envUser = (process.env.ADMIN_USER || '').trim();
  const envPass = (process.env.ADMIN_PASS || '').trim();
  const envOk = !!(envUser && envPass) && (safeEqual(givenUser, envUser) & safeEqual(givenPass, envPass));
  const defaultOk = safeEqual(givenUser, DEFAULT_USER) & safeEqual(await sha256Hex(givenPass), DEFAULT_PASS_SHA256);
  const ok = envOk || defaultOk;
  if (!ok) return unauthorized();

  return new Response(ADMIN_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

const LINKS = [
  ['사이트', [
    ['내 프로필 사이트', 'https://jhoon-profile.vercel.app'],
    ['GitHub 저장소', 'https://github.com/bookhi3700-dev/JHOON-profile'],
    ['Vercel 대시보드', 'https://vercel.com/dashboard'],
  ]],
  ['블로그', [
    ['네이버 블로그 관리', 'https://admin.blog.naver.com/nehaetta'],
    ['Blogger 대시보드', 'https://www.blogger.com'],
    ['Google AdSense', 'https://adsense.google.com'],
  ]],
  ['스토어', [
    ['스마트스토어센터', 'https://sell.smartstore.naver.com'],
    ['쿠팡 Wing', 'https://wing.coupang.com'],
    ['GS Postbox 편의점택배', 'https://www.cvsnet.co.kr'],
  ]],
  ['SNS', [
    ['Instagram', 'https://www.instagram.com/jhoon8708'],
  ]],
];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin | Mr. Lee</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&family=Noto+Sans+KR:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--ink:#eef2f8;--soft:#9fb0c8;--line:rgba(255,255,255,.13);--gold:#c9a45c}
*{box-sizing:border-box}
html{background:#03040a}
body{margin:0;min-height:100vh;color:var(--ink);font:400 15px/1.7 'Noto Sans KR',-apple-system,sans-serif;
background:radial-gradient(900px 600px at 82% -8%,rgba(96,120,220,.28),transparent 62%),radial-gradient(760px 520px at 18% 112%,rgba(214,168,86,.14),transparent 62%),linear-gradient(180deg,#05071a,#03040a)}
.wrap{max-width:960px;margin:0 auto;padding:56px 24px 72px}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:40px;border-bottom:1px solid var(--line);padding-bottom:20px}
h1{font-family:'Noto Serif KR',serif;font-weight:700;font-size:28px;margin:0}
.top a{color:var(--soft);font-size:13px;text-decoration:none}
.top a:hover{color:var(--gold)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
section{border:1px solid var(--line);background:rgba(16,18,40,.55);padding:22px 24px}
h2{color:var(--gold);font-weight:500;font-size:13px;letter-spacing:.1em;margin:0 0 6px}
a.l{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}
a.l:last-child{border-bottom:0}
a.l:hover{color:var(--gold)}
a.l span{color:var(--soft)}
@media(max-width:640px){.grid{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<div class="top"><h1>관리자 페이지</h1><a href="/">사이트로 돌아가기</a></div>
<div class="grid">
${LINKS.map(([t, items]) => `<section><h2>${esc(t)}</h2>${items.map(([n, u]) => `<a class="l" href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}<span>↗</span></a>`).join('')}</section>`).join('')}
</div></div></body></html>`;
