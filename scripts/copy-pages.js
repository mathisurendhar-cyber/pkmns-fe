const fs = require('fs');
const path = require('path');

const SRC = 'D:/Test/newone/ambalnagar-main';
const DEST = 'D:/Test/pkmns/pkmns-fe/public/pages';

const pages = [
  'index.html',
  'about.html',
  'members.html',
  'events.html',
  'contact.html',
  'login.html',
  'dashboard.html',
  'membership.html',
  'membership-applications.html',
  'service.html',
  'servicework.html',
  'news.html',
  'newslist.html',
  'newsview.html',
  'next-event.html',
  'add-member.html',
  'manage-member.html',
  'edit-member.html',
  'admin-users.html',
  'office-bearers.html',
  'profile.html',
  'payment.html',
  'receipt.html',
];

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const inject = `
<script>
window.API_BASE = window.API_BASE || (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:3001';
(function() {
  var origFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = window.API_BASE + input;
    } else if (typeof input === 'string' && input.startsWith('/uploads/')) {
      input = window.API_BASE + input;
    }
    return origFetch.call(this, input, init);
  };
})();
</script>
`;

for (const page of pages) {
  let html = fs.readFileSync(path.join(SRC, page), 'utf8');

  // Fix relative img paths to absolute public paths
  html = html.replace(/(src|href)=["']img\//g, '$1="/img/');
  html = html.replace(/(src|href)=["']\.\/img\//g, '$1="/img/');

  // Fix navigation links that point to .html or bare routes to Next routes
  const linkMap = {
    'index.html': '/',
    './index.html': '/',
    'about.html': '/about',
    'members.html': '/members',
    'events.html': '/events',
    'contact.html': '/contact',
    'login.html': '/login',
    'dashboard.html': '/dashboard',
    'membership.html': '/membership',
    'membership-applications.html': '/membership-applications',
    'service.html': '/service',
    'servicework.html': '/servicework',
    'news.html': '/news',
    'newslist.html': '/newslist',
    'newsview.html': '/newsview',
    'next-event.html': '/next-event',
    'add-member.html': '/add-member',
    'manage-member.html': '/manage-member',
    'edit-member.html': '/edit-member',
    'admin-users.html': '/admin-users',
    'office-bearers.html': '/office-bearers',
    'profile.html': '/profile',
    'payment.html': '/payment',
    'receipt.html': '/receipt',
  };

  // Rewrite href="..." navigation
  html = html.replace(/href=["']([^"']+)["']/g, (match, href) => {
    if (linkMap[href]) return `href="${linkMap[href]}"`;
    // bare paths like /about already fine
    if (href.endsWith('.html') && linkMap[href.replace(/^\.\//, '')]) {
      return `href="${linkMap[href.replace(/^\.\//, '')]}"`;
    }
    return match;
  });

  // window.location redirects
  html = html.replace(/window\.location\.href\s*=\s*["']([^"']+)["']/g, (m, loc) => {
    const key = loc.replace(/^\.\//, '');
    if (linkMap[key]) return `window.location.href="${linkMap[key]}"`;
    if (linkMap[loc]) return `window.location.href="${linkMap[loc]}"`;
    return m;
  });
  html = html.replace(/location\.href\s*=\s*["']([^"']+)["']/g, (m, loc) => {
    const key = loc.replace(/^\.\//, '');
    if (linkMap[key]) return `location.href="${linkMap[key]}"`;
    if (linkMap[loc]) return `location.href="${linkMap[loc]}"`;
    return m;
  });

  // Inject API base before </head> or at start of body
  if (html.includes('</head>')) {
    html = html.replace('</head>', inject + '\n</head>');
  } else {
    html = inject + html;
  }

  // Rewrite photo_url / image_url that point to backend uploads when displayed
  // (handled by fetch wrapper for /uploads)

  fs.writeFileSync(path.join(DEST, page), html);
  console.log('Wrote', page);
}

console.log('Done');
