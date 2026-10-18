"""Optional: python configure-domain.py https://your-domain.example/ (or GitHub Pages project URL)."""
from pathlib import Path
from urllib.parse import urlsplit
import sys,re,json,html
if len(sys.argv)!=2:raise SystemExit(__doc__)
base=sys.argv[1].rstrip('/')+'/'
parts=urlsplit(base)
if parts.scheme not in ('https','http') or not parts.netloc or parts.query or parts.fragment:raise SystemExit('Supply a full website URL, including the project folder if needed.')
root=Path(__file__).resolve().parent
pages=sorted(root.glob('*.html'))
for p in pages:
 url=base if p.name=='index.html' else base+p.name
 s=p.read_text();s=re.sub(r'<link rel="canonical"[^>]*>',lambda _: '<link rel="canonical" href="'+html.escape(url,quote=True)+'">',s)
 s=re.sub(r'<meta property="og:url"[^>]*>','',s)
 s=s.replace('</head>','<meta property="og:url" content="'+html.escape(url,quote=True)+'"></head>')
 def structured(m):
  data=json.loads(m.group(1));data['url']=url
  return '<script type="application/ld+json">'+json.dumps(data)+'</script>'
 s=re.sub(r'<script type="application/ld\+json">(.*?)</script>',structured,s)
 p.write_text(s)
urls=[base if p.name=='index.html' else base+p.name for p in pages]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+html.escape(u)+'</loc></url>' for u in urls)+'</urlset>')
(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'sitemap.xml\n')
print('Domain metadata, sitemap.xml and robots.txt updated for '+base)
