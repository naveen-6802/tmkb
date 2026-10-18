# Chessroom: complete GitHub-ready website

## Deploy
Replace ALL files from the previous ZIP with this folder's files. Keep index.html at the published root. For GitHub Pages, select the branch/folder containing index.html in Settings > Pages. Keep .nojekyll too. No npm, API keys, or build step is required.

If you enabled a custom domain, configure that in GitHub Pages. This ZIP contains no CNAME file and no redirect to the previous host. Internal navigation uses relative paths, so GitHub project subfolders work too.

## iOS fixes
- Removed Array.at dependencies from game initialization and move history.
- Play Now setup opens independently of game startup and does not depend on focus options.
- Added legacy Safari media-query listeners and dialog fallbacks.
- Versioned CSS/JavaScript links avoid using earlier cached copies.

## Domain and SEO
The old host's absolute URLs have been removed. Canonical/social URLs follow the current page at runtime. For static SEO metadata and a valid sitemap, run this optional command BEFORE uploading (replace with your actual website URL):

    python configure-domain.py https://your-domain.example/

For a GitHub Pages project site, include its project path:

    python configure-domain.py https://username.github.io/repository/

The script generates sitemap.xml and updates robots.txt plus page metadata. No guessed domain is included in this ZIP.

## Run locally
    python -m http.server 8000
Open http://localhost:8000.

## Notes
All game files, pages, fonts, backgrounds, popup guide, and sounds are included. Contact Us still needs your public support email. Saved games remain in browser storage and are not included in this ZIP.

Checks cover JavaScript startup without Array.at, legacy media-query support, setup open/close, link paths and ZIP integrity. An actual iPhone/Safari visual test was not available.
