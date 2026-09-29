// /admin 페이지 보호용 미들웨어.
// 아이디/비밀번호는 코드에 넣지 않고 Vercel 환경변수 ADMIN_USER, ADMIN_PASS 에서 읽는다.
// 환경변수가 없으면 누구도 들어올 수 없게 막는다(fail closed).

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

export default function middleware(request) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) return unauthorized();

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return unauthorized();

  let decoded = '';
  try {
    decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)),
    );
  } catch {
    return unauthorized();
  }
  const i = decoded.indexOf(':');
  if (i < 0) return unauthorized();

  const ok = safeEqual(decoded.slice(0, i), user) & safeEqual(decoded.slice(i + 1), pass);
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
<title>Admin | LEE JAEHOON</title>
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
