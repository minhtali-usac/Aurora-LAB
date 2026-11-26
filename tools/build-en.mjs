// Sinh bản tiếng Anh trong en/ từ mã tiếng Việt (nguồn duy nhất) và từ điển tools/en.json.
//   node tools/build-en.mjs
// Sửa nội dung tiếng Việt xong: chạy tools/i18n-extract.mjs để xem chuỗi mới, thêm bản dịch vào tools/en.json, rồi chạy lại.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { JS_FILES, literals, needs, htmlUnits, loadDict } from './i18n-lib.mjs';

const dict = loadDict('tools/en.json');
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
let missing = 0;
const tr = (s) => { if (dict[s] !== undefined) return dict[s]; missing++; console.warn('THIẾU:', s.slice(0, 80)); return s; };

// Sửa riêng cho bản tiếng Anh: số dùng dấu chấm, đường dẫn tính từ thư mục en/
const patch = (f, s) => {
  s = s.replace(/'assets\//g, "'../assets/").replace(/`assets\//g, '`../assets/');
  s = s.replace(/new URL\('\.\.\/assets\/js\//g, "new URL('js/");
  s = s.replace(/\{,\}/g, '.');
  if (f === 'core.js') s = s.replace("x.toFixed(d).replace('.', ',')", 'x.toFixed(d)').replace(".replace(',', '{.}')", '');
  return s;
};

mkdirSync('en/js', { recursive: true });
for (const f of JS_FILES) {
  const src = read('assets/js/' + f);
  let out = '', at = 0;
  for (const l of literals(src)) {
    const s = src.slice(l.start, l.end);
    if (!needs(s)) continue;
    out += src.slice(at, l.start) + tr(s);
    at = l.end;
  }
  out += src.slice(at);
  writeFileSync('en/js/' + f, '// TỰ SINH bởi tools/build-en.mjs — đừng sửa tay.\n' + patch(f, out));
}
// các tệp không có chữ vẫn nằm trong JS_FILES nên đã được chép

let html = read('index.html');
const units = new Set(htmlUnits(html));
html = html.split('\n').map((line) => {
  const t = line.trim();
  return units.has(t) ? line.replace(t, () => tr(t)) : line;
}).join('\n');
html = html
  .replace('<html lang="vi">', '<html lang="en">')
  .replace(/(href|src)="assets\//g, '$1="../assets/')
  .replace(/src="\.\.\/assets\/js\//g, 'src="js/')
  .replace('src="docs/', 'src="../docs/')
  .replace(/<a class="hbtn lang-btn"[^>]*>EN<\/a>/, '<a class="hbtn lang-btn" id="lang-btn" href="../" lang="vi" hreflang="vi" title="Chuyển sang tiếng Việt" aria-label="Tiếng Việt">VI</a>')
  .replace(/\{,\}/g, '.');
writeFileSync('en/index.html', html);
console.log(missing ? `XONG nhưng còn thiếu ${missing} bản dịch` : 'XONG: en/ đã đầy đủ');
