// Liệt kê các chuỗi CHƯA có bản dịch: node tools/i18n-extract.mjs [tệp-ra]
import { readFileSync, writeFileSync } from 'node:fs';
import { JS_FILES, jsUnits, htmlUnits, loadDict } from './i18n-lib.mjs';

const dict = loadDict('tools/en.json');
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const seen = new Set(), todo = [];
const add = (file, s) => { if (dict[s] === undefined && !seen.has(s)) { seen.add(s); todo.push({ file, s }); } };
htmlUnits(read('index.html')).forEach((s) => add('index.html', s));
for (const f of JS_FILES) {
  const src = read('assets/js/' + f);
  jsUnits(src).forEach((l) => add(f, src.slice(l.start, l.end)));
}
console.log(`${todo.length} chuỗi chưa dịch, ${todo.reduce((n, t) => n + t.s.length, 0)} ký tự`);
for (const t of todo.slice(0, 20)) console.log(' ', t.file, t.s.slice(0, 100));
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(todo, null, 1));
