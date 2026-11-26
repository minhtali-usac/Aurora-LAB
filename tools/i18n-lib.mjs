// Trích và thay các chuỗi cần dịch trong mã tiếng Việt (dùng chung cho extract và build-en).
import { readFileSync, existsSync } from 'node:fs';

export const JS_FILES = ['data.js', 'core.js', 'spectrum.js', 'fx.js', 'sim-atom.js', 'sim-aurora.js', 'sim-flame.js', 'codex-deep.js', 'codex.js', 'app.js', 'buddy.js', 'mascot3d.js', 'wave3d.js', 'sunearth3d.js'];

const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
// chuỗi không dấu vẫn là tiếng Việt, và số viết kiểu Việt Nam (dấu phẩy thập phân)
const EXTRA = new Set(['cao', 'xanh lam', 'vàng', 'lam', 'tím']);
export const needs = (s) => VI.test(s.normalize('NFC')) || EXTRA.has(s) || /\d,\d+\s?(s|ms|µs|keV|eV|nm)\b/.test(s) || /Xem 3D|30 keV · cao/.test(s);

// Tách mã JS thành đoạn: mã thường và chuỗi (kể cả template literal nguyên khối)
export function literals(src) {
  const out = [];
  let i = 0, lastSig = '';
  const n = src.length;
  const skipString = (q) => { i++; while (i < n && src[i] !== q) { if (src[i] === '\\') i++; i++; } i++; };
  const skipTemplate = () => {
    i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; skipExpr(); continue; }
      i++;
    }
    i++;
  };
  const skipExpr = () => {
    let depth = 1;
    while (i < n && depth) {
      const c = src[i];
      if (c === "'" || c === '"') skipString(c);
      else if (c === '`') skipTemplate();
      else { if (c === '{') depth++; else if (c === '}') depth--; i++; }
    }
  };
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
    if (c === "'" || c === '"') { const a = i; skipString(c); out.push({ start: a + 1, end: i - 1, q: c }); lastSig = 'a'; continue; }
    if (c === '`') { const a = i; skipTemplate(); out.push({ start: a + 1, end: i - 1, q: c }); lastSig = 'a'; continue; }
    if (c === '/' && (!lastSig || '(,=:[!&|?{};+-*%<>~^'.includes(lastSig) || /(?:return|typeof)\s*$/.test(src.slice(Math.max(0, i - 8), i)))) {
      i++; let cls = false;
      while (i < n && (cls || src[i] !== '/')) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; }
      i++; lastSig = 'a'; continue;
    }
    if (!/\s/.test(c)) lastSig = /[\w$)\]]/.test(c) ? 'a' : c;
    i++;
  }
  return out;
}

export const jsUnits = (src) => literals(src).filter((l) => needs(src.slice(l.start, l.end)));
// HTML: mỗi dòng có tiếng Việt là một đơn vị
export const htmlUnits = (src) => src.split('\n').map((l) => l.trim()).filter((l) => needs(l) && !l.startsWith('<!--'));
export const loadDict = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {});
