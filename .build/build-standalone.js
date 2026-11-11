const fs = require('fs');
const path = require('path');

const root = __dirname.replace(/\.build$/, '') || path.join(__dirname, '..');
const base = path.join(__dirname, '..');
const src = path.join(base, 'index.html');
const out = path.join(base, 'rickshaw-tracker-demo-standalone.html');

let html = fs.readFileSync(src, 'utf8');

// 1. Replace external script tags with inline library code (function replacers
//    are REQUIRED: String.replace treats $', $`, $& in replacement as special).
const tw = fs.readFileSync(path.join(__dirname, 'tailwind.js'), 'utf8');
const qr = fs.readFileSync(path.join(__dirname, 'qrcode.min.js'), 'utf8');
const tess = fs.readFileSync(path.join(__dirname, 'tesseract.min.js'), 'utf8');
const jsqr = fs.readFileSync(path.join(__dirname, 'jsQR.js'), 'utf8');

html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, () => '<script>' + tw + '</scr' + 'ipt>');
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs\/1\.0\.0\/qrcode\.min\.js"><\/script>/, () => '<script>' + qr + '</scr' + 'ipt>');
html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js@5\/dist\/tesseract\.min\.js"><\/script>/, () => '<script>' + tess + '</scr' + 'ipt>');
html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/jsqr@1\.4\.0\/dist\/jsQR\.js"><\/script>/, () => '<script>' + jsqr + '</scr' + 'ipt>');

// 2. Strip Google Fonts links (offline build uses system fonts).
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\r?\n?/, '');
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet">\r?\n?/, '');

// 3. Inline every ASSETS entry once, keeping the SAME keys the app uses (AS('cartoon') etc).
const ASSETS_RE = /const ASSETS = \{([\s\S]*?)\};/;
const assetsMatch = html.match(ASSETS_RE);
if (!assetsMatch) { console.error('ASSETS declaration not found'); process.exit(1); }
const declared = {};
for (const m of assetsMatch[1].matchAll(/(\w+)\s*:\s*'([^']+)'/g)) declared[m[1]] = m[2];
const dataUris = {};
for (const [key, rel] of Object.entries(declared)) {
  const file = path.join(base, rel);
  if (!fs.existsSync(file)) { console.error('missing asset: ' + rel); process.exit(1); }
  const mime = /\.jpe?g$/i.test(rel) ? 'image/jpeg' : 'image/png';
  dataUris[key] = 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64');
}
const assetsDecl = 'const ASSETS = ' + JSON.stringify(dataUris) + ';';
html = html.replace(ASSETS_RE, () => assetsDecl);

// 4. Verify.
const doctypeCount = (html.match(/<!DOCTYPE html>/gi) || []).length;
const assetRefs = html.match(/assets\/[\w.-]+\.(?:png|jpe?g)/g) || [];
const leftover = assetRefs.length;
const extScripts = html.match(/<script src=/g) || [];
const extLinks = html.match(/<link[^>]*href="http/g) || [];

fs.writeFileSync(out, html);
const mb = (fs.statSync(out).size / 1048576).toFixed(1);
console.log(JSON.stringify({
  out, mb, doctypeCount,
  assetKeys: Object.keys(dataUris).length,
  leftoverAssetRefs: leftover,
  externalScripts: extScripts.length,
  externalLinks: extLinks.length,
}));
if (doctypeCount !== 1 || leftover !== 0 || extScripts.length || extLinks.length) {
  console.error('VERIFICATION FAILED');
  process.exit(1);
}
console.log('OK');
