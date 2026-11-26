// TỰ SINH bởi tools/build-en.mjs — đừng sửa tay.
/* Aurora-LAB — USACodex: thư viện mô phỏng khái niệm có sẵn.
 * Mỗi bài dạy đúng một khái niệm nền tảng, có một điều khiển, phần "Ghi nhớ"
 * và lối sang thí nghiệm chính tương ứng. */
(function () {
  'use strict';
  const AL = window.AL, D = AL.DATA, h = AL.h, { fmt, clamp, lerp, ease } = AL;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  const BODY = '"Be Vietnam Pro", system-ui, sans-serif';
  const DISP = '"Chakra Petch", system-ui, sans-serif';
  const ORANGE = [255, 138, 43];
  const TAU = Math.PI * 2;

  // ---------- Tiện ích vẽ ----------
  const glow = (c, x, y, r, rgb, a = 1) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.3, AL.rgba(rgb, a * 0.9)); g.addColorStop(1, AL.rgba(rgb, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const txt = (c, s, x, y, o = {}) => {
    c.font = o.font || `500 12px ${BODY}`; c.fillStyle = o.color || 'rgba(220,228,240,.85)';
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle'; c.fillText(s, x, y);
  };
  const arrow = (c, x0, y0, x1, y1, col, lw = 2) => {
    const a = Math.atan2(y1 - y0, x1 - x0);
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * 7, y1 - Math.sin(a) * 7); c.stroke();
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * 9, y1 - Math.sin(a - 0.45) * 9); c.lineTo(x1 - Math.cos(a + 0.45) * 9, y1 - Math.sin(a + 0.45) * 9); c.fill();
  };
  const nmCol = (nm) => (nm < 380 ? [176, 140, 255] : nm > 780 ? [210, 70, 60] : AL.nmRGB(nm));
  // Thanh phổ có vùng UV / khả kiến / IR; trả về hàm đổi nm → x
  const strip = (c, x, y, w, hh, lo, hi, log, opt = {}) => {
    const L = (v) => (log ? Math.log(v) : v), span = L(hi) - L(lo);
    const X = (nm) => x + ((L(nm) - L(lo)) / span) * w;
    for (let i = 0; i < w; i += 2) {
      const nm = log ? Math.exp(L(lo) + (span * i) / w) : lo + (span * i) / w;
      if (opt.dark) c.fillStyle = '#020306';
      else if (nm < 380) c.fillStyle = 'rgba(120,90,220,.16)';
      else if (nm > 780) c.fillStyle = 'rgba(200,60,50,.14)';
      else { const [r, g, b] = AL.nmRGB(nm); c.fillStyle = `rgba(${r},${g},${b},${(opt.bright || 0.32) * AL.nmVis(nm)})`; }
      c.fillRect(x + i, y, 2, hh);
    }
    c.strokeStyle = 'rgba(255,255,255,.15)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, hh - 1);
    c.font = `500 10px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = 'rgba(190,200,215,.6)';
    for (const t of opt.ticks || []) { const tx = X(t); c.fillRect(tx - 0.5, y + hh, 1, 4); c.fillText(t, tx, y + hh + 5); }
    if (lo < 380) txt(c, 'UV', (X(Math.max(lo, lo)) + X(Math.min(380, hi))) / 2, y + hh / 2, { align: 'center', font: `700 10px ${DISP}`, color: 'rgba(190,160,255,.75)' });
    if (hi > 780) txt(c, 'IR', (X(Math.max(780, lo)) + X(hi)) / 2, y + hh / 2, { align: 'center', font: `700 10px ${DISP}`, color: 'rgba(255,130,110,.7)' });
    return X;
  };
  const markLine = (c, x, y, hh, nm, a = 1, w = 2) => {
    const rgb = nmCol(nm);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(x - 10, 0, x + 10, 0);
    g.addColorStop(0, AL.rgba(rgb, 0)); g.addColorStop(0.5, AL.rgba(rgb, 0.6 * a)); g.addColorStop(1, AL.rgba(rgb, 0));
    c.fillStyle = g; c.fillRect(x - 10, y, 20, hh);
    c.fillStyle = AL.rgba(AL.mixRGB(rgb, [255, 255, 255], 0.4), a); c.fillRect(x - w / 2, y, w, hh);
    c.restore();
  };
  const bg = (c, w, hh) => { c.fillStyle = '#03050a'; c.fillRect(0, 0, w, hh); };

  // ---------- Thành phần điều khiển ----------
  const slider = (label, min, max, step, value, fmtv, onInput) => {
    const out = h('output', { class: 'sl-v' }, fmtv(value));
    const input = h('input', { type: 'range', class: 'range', min, max, step, value, 'aria-label': label });
    const paint = () => input.style.setProperty('--p', ((input.value - min) / (max - min)) * 100 + '%');
    input.addEventListener('input', () => { paint(); out.textContent = fmtv(+input.value); onInput(+input.value); });
    paint();
    const el = h('div', { class: 'slider cx-slider' }, h('div', { class: 'sl-h' }, h('span', null, label), out), input);
    el.set = (v) => { input.value = v; paint(); out.textContent = fmtv(v); };
    return el;
  };
  const chips = (items, onPick) => h('div', { class: 'cx-chips' }, items.map(([label, v]) => h('button', { type: 'button', class: 'cx-chip', onclick: () => onPick(v) }, label)));
  const seg = (opts, value, onChange) => AL.ui.seg(opts, value, onChange);

  // ======================================================================
  // CÁC BÀI MÔ PHỎNG
  // ======================================================================
  const concepts = [];

  // 1 — Bước sóng, màu sắc và năng lượng photon
  concepts.push({
    id: 'wave', group: 'Light and atoms', title: 'Wavelength, colour and photon energy',
    q: 'Why does violet light carry more energy than red light?',
    lab: ['Try it in the Atom experiment', () => AL.app.goLab('atom', { el: 'O' })],
    init(ctl) {
      const s = (this.s = { lam: 557.7 });
      const toPos = (nm) => (Math.log(nm / 100) / Math.log(15)) * 100, toNm = (p) => 100 * Math.pow(15, p / 100);
      const read = h('div', { class: 'cx-read' });
      const upd = () => { const nm = s.lam, reg = AL.region(nm); if (this.w3) this.w3.set(nm); read.innerHTML = `λ = <b style="color:${AL.rgba(nmCol(nm), 1)}">${AL.fmtNm(nm)}</b> · f = ${AL.sci(AL.freq(nm))} Hz · E = <b>${fmt(AL.eV(nm), 2)} eV</b> · ${reg === 'VIS' ? AL.colorName(nm) : reg === 'UV' ? 'ultraviolet' : 'infrared'}`; };
      const sl = slider('Wavelength λ', 0, 100, 0.1, toPos(s.lam), (p) => AL.fmtNm(toNm(p)), (p) => { s.lam = toNm(p); upd(); });
      // Tùy chọn: xem sóng điện từ 3D (E ⟂ B ⟂ phương truyền), tải three.js khi cần
      const view = seg([['2d', 'Wavelength graph (2D)'], ['3d', '3D electromagnetic wave']], this.w3on ? '3d' : '2d', async (v) => {
        this.w3on = v === '3d';
        if (this.w3on && !this.w3) {
          try {
            const mod = await import(new URL('js/wave3d.js', document.baseURI).href);
            if (CX.cur !== this || !this.w3on) return;
            this.w3 = mod.create(document.getElementById('cx-stage'));
          } catch (e) { this.w3on = false; return; }
        }
        if (this.w3) { this.w3.set(s.lam); this.w3.show(this.w3on); }
      });
      ctl.append(view);
      if (this.w3on) view.querySelector('[aria-checked="true"]').click();
      ctl.append(sl, chips([['Hα 656,3', 656.3], ['Na 589,0', 589], ['O 557,7', 557.7], ['Hβ 486,1', 486.1], ['N₂⁺ 427,8', 427.8], ['UV 250', 250], ['IR 1000', 1000]], (v) => { s.lam = v; sl.set(toPos(v)); upd(); }), read);
      upd();
    },
    draw(c, w, hh, t) {
      bg(c, w, hh);
      const nm = this.s.lam, rgb = nmCol(nm), lamPx = nm / 7, y0 = hh * 0.38, amp = hh * 0.16;
      // sóng truyền sang phải
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const [lw, a] of [[8, 0.12], [3, 0.9]]) {
        c.strokeStyle = AL.rgba(rgb, a); c.lineWidth = lw; c.beginPath();
        for (let x = 20; x <= w - 20; x += 2) { const y = y0 - Math.sin(((x - t * 90) / lamPx) * TAU) * amp; x === 20 ? c.moveTo(x, y) : c.lineTo(x, y); }
        c.stroke();
      }
      c.restore();
      // thước đo một bước sóng
      const ph = (t * 90) % lamPx, xa = 20 + ((lamPx / 4 + ph) % lamPx) + lamPx, xb = xa + lamPx;
      if (xb < w - 20) {
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; c.setLineDash([3, 3]);
        c.beginPath(); c.moveTo(xa, y0 - amp - 4); c.lineTo(xa, y0 - amp - 22); c.moveTo(xb, y0 - amp - 4); c.lineTo(xb, y0 - amp - 22); c.stroke(); c.setLineDash([]);
        arrow(c, (xa + xb) / 2, y0 - amp - 16, xb, y0 - amp - 16, 'rgba(255,255,255,.7)', 1); arrow(c, (xa + xb) / 2, y0 - amp - 16, xa, y0 - amp - 16, 'rgba(255,255,255,.7)', 1);
        txt(c, 'λ', (xa + xb) / 2, y0 - amp - 30, { align: 'center', font: `700 13px ${MONO}`, color: '#fff' });
      }
      // thanh năng lượng photon
      const E = AL.eV(nm), bx = w - 46, bh = hh * 0.5, by = hh * 0.12, f = clamp(E / 6, 0, 1);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(bx, by, 14, bh);
      c.fillStyle = AL.rgba(ORANGE, 0.9); c.fillRect(bx, by + bh * (1 - f), 14, bh * f);
      txt(c, 'E', bx + 7, by - 10, { align: 'center', font: `700 11px ${MONO}`, color: '#ffb066' });
      txt(c, `${fmt(E, 2)} eV`, bx + 7, by + bh + 12, { align: 'center', font: `600 10.5px ${MONO}` });
      // thanh phổ log 100–1500 nm
      const sy = hh * 0.74, X = strip(c, 30, sy, w - 60, 26, 100, 1500, true, { ticks: [200, 400, 700, 1000], bright: 0.75 });
      const mx = X(nm);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(mx - 6, sy - 9); c.lineTo(mx + 6, sy - 9); c.lineTo(mx, sy - 1); c.fill();
      txt(c, 'visible to the human eye: 380–780 nm', (X(380) + X(780)) / 2, sy - 18, { align: 'center', font: `500 11px ${BODY}`, color: 'rgba(210,220,235,.7)' });
    },
    text: [
      'Light has two “faces”. As it travels it behaves like a wave; when it exchanges energy with matter it comes in small packets called <b>photons</b>.',
      'The distance between two crests is the <b>wavelength λ</b>. It sets both the colour and the energy of each photon through $E = \\dfrac{hc}{\\lambda}$: the more tightly packed the wave (short λ), the stronger the photon.',
      'Human eyes only sense wavelengths of about 380–780 nm. Shorter is ultraviolet (UV), longer is infrared (IR); both are real, we just cannot see them.',
      'Turn on <b>3D electromagnetic wave</b> to see the “wave” of light: an electric field $\vec E$ and a magnetic field $\vec B$ oscillating in phase, perpendicular to each other and to the direction of travel. The two fields keep creating each other, so the wave travels through vacuum at $c \approx 3 \times 10^{8}\ \mathrm{m/s}$ with no medium at all.',
    ],
    key: 'The shorter λ, the more energy per photon. Violet light (≈ 400 nm) carries about 3.1 eV, nearly twice that of red light (≈ 700 nm, about 1.8 eV).',
    refs: ['upv3', 'codata', 'cie', 'griffiths'],
  });

  // 2 — Năng lượng lượng tử hóa: chỉ hấp thụ đúng ΔE
  const H_LV = [[2, 10.204], [3, 12.094], [4, 12.755], [5, 13.061], [6, 13.228]];
  concepts.push({
    id: 'absorb', group: 'Light and atoms', title: 'Energy is quantised',
    q: 'Does an atom absorb every photon that hits it?',
    lab: ['Try it in the Atom experiment (H)', () => AL.app.goLab('atom', { el: 'H' })],
    init(ctl) {
      const s = (this.s = { lam: 600, ps: [], cur: 0, hold: 0, fire: 0, dark: {}, msg: '' });
      const sl = slider('Wavelength of incoming photons', 380, 700, 0.1, s.lam, (v) => fmt(v, 1) + ' nm', (v) => (s.lam = v));
      ctl.append(sl, chips([['656.3 nm', 656.3], ['600.0 nm', 600], ['486.1 nm', 486.1], ['434.0 nm', 434.0], ['410.2 nm', 410.2]], (v) => { s.lam = v; sl.set(v); }));
    },
    draw(c, w, hh, t, dt) {
      bg(c, w, hh);
      const s = this.s, ax = w < 560 ? w * 0.6 : w * 0.66, top = hh * 0.12, bot = hh * 0.62;
      const yE = (E) => bot - ((E - 10.0) / 3.45) * (bot - top);
      // các mức
      H_LV.forEach(([n, E], i) => {
        const y = yE(E), on = i === s.cur;
        c.strokeStyle = on ? '#ff6f91' : 'rgba(235,240,250,.4)'; c.lineWidth = on ? 2.4 : 1.4;
        c.beginPath(); c.moveTo(ax - 70, y); c.lineTo(ax + 120, y); c.stroke();
        txt(c, `n = ${n}`, ax - 78, y, { align: 'right', font: `600 11.5px ${MONO}`, color: on ? '#ff6f91' : 'rgba(205,213,226,.75)' });
        if (i && w >= 560) txt(c, `ΔE = ${fmt(E - H_LV[0][1], 2)} eV`, ax + 128, y, { font: `500 10.5px ${MONO}`, color: 'rgba(170,180,195,.7)' });
      });
      txt(c, 'hydrogen atom (electron at n = 2)', ax + 25, bot + 22, { align: 'center', font: `500 11px ${BODY}`, color: 'rgba(170,180,195,.7)' });
      // bắn photon liên tục
      s.fire -= dt;
      if (s.fire <= 0 && s.cur === 0) { s.fire = 0.55; s.ps.push({ x: 20, lam: s.lam, y: yE(H_LV[0][1]) - 26 }); }
      for (const p of s.ps) {
        p.x += dt * 560;
        if (!p.done && p.x >= ax - 10) {
          p.done = true;
          const hit = H_LV.findIndex(([, e], i) => i > 0 && Math.abs(AL.HC / (e - H_LV[0][1]) - p.lam) < 1.6);
          if (hit > 0 && s.cur === 0) { p.dead = true; s.cur = hit; s.hold = 1.1; s.msg = `Absorbed! ${fmt(p.lam, 1)} nm matches the transition n = 2 → n = ${H_LV[hit][0]}`; s.dark[Math.round(p.lam * 10)] = Math.min(1, (s.dark[Math.round(p.lam * 10)] || 0) + 0.35); }
          else s.msg = `${fmt(p.lam, 1)} nm matches no gap between levels → the photon passes through`;
        }
        const rgb = nmCol(p.lam), yy = p.y + Math.sin(p.x / (p.lam / 22)) * 4;
        if (!p.dead) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, p.x, yy, 11, rgb, p.done ? 0.55 : 1); c.restore(); }
      }
      s.ps = s.ps.filter((p) => !p.dead && p.x < w + 20);
      if (s.cur > 0) { s.hold -= dt; if (s.hold <= 0) s.cur = 0; }
      // electron
      const ey = yE(H_LV[s.cur][1]);
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, ax + 10, ey, 12, [255, 111, 145]); c.restore();
      if (s.msg) txt(c, s.msg, 20, hh * 0.04 + 8, { font: `600 12px ${BODY}`, color: s.cur ? '#7dffa0' : 'rgba(220,228,240,.8)' });
      // phổ hấp thụ tích lũy
      const sy = hh * 0.78, X = strip(c, 30, sy, w - 60, 26, 380, 700, false, { ticks: [400, 450, 500, 550, 600, 650, 700], bright: 0.85 });
      for (const k in s.dark) { const x = X(k / 10); c.fillStyle = `rgba(2,3,6,${0.95 * s.dark[k]})`; c.fillRect(x - 1.5, sy + 1, 3, 24); }
      c.fillStyle = '#fff'; const mx = X(s.lam); c.beginPath(); c.moveTo(mx - 5, sy - 8); c.lineTo(mx + 5, sy - 8); c.lineTo(mx, sy - 1); c.fill();
      txt(c, 'spectrum after passing through hydrogen gas (dark lines = absorbed)', 30, sy - 14, { font: `500 10.5px ${BODY}`, color: 'rgba(190,200,215,.6)' });
    },
    text: [
      'Picture the electron in an atom as a person on a staircase: they can only stand on a step, never float between two. Each step is an <b>energy level</b>. We say energy is <b>quantised</b>.',
      'So atoms are very “picky”. They only absorb a photon whose energy <b>exactly fits</b> the gap ΔE between their step and a higher one; a photon a little short or over goes straight through.',
      'In the simulation, hydrogen’s electron is at n = 2. Drag the slider to find the wavelengths it will “accept”.',
    ],
    key: 'An atom only accepts exactly ΔE as a whole, never part of it. The absorbed wavelengths show up as dark lines in the spectrum.',
    refs: ['upv3', 'chem2e', 'bohr'],
  });

  // 3 — Phát xạ photon: ΔE quyết định màu
  concepts.push({
    id: 'emit', group: 'Light and atoms', title: 'Photon emission when electrons change level',
    q: 'What decides the colour of the light an atom emits?',
    lab: ['Try it in the Atom experiment', () => AL.app.goLab('atom', { el: 'Na' })],
    init(ctl) {
      const s = (this.s = { dE: 2.104, ph: 0, ps: [], hist: [] });
      ctl.append(slider('Energy gap ΔE', 1.6, 3.3, 0.005, s.dE, (v) => `${fmt(v, 2)} eV → λ ≈ ${fmt(AL.HC / v, 0)} nm`, (v) => (s.dE = v)),
        chips([['Na 2.10 eV', 2.104], ['O 2.22 eV', 2.223], ['O 1.97 eV', 1.968], ['N₂⁺ 2.90 eV', 2.898]], (v) => { s.dE = v; ctl.querySelector('.cx-slider').set(v); }));
    },
    draw(c, w, hh, t, dt) {
      bg(c, w, hh);
      const s = this.s, lam = AL.HC / s.dE, rgb = nmCol(lam);
      const ax = w * 0.24, low = hh * 0.62, gap = (s.dE / 3.3) * hh * 0.48, up = low - gap;
      // vòng lặp: lên → dừng → rơi + phát photon
      s.ph += dt / 1.6; if (s.ph >= 1) { s.ph = 0; }
      const k = s.ph;
      let ey = low;
      if (k < 0.25) ey = lerp(low, up, ease.inOut(k / 0.25));
      else if (k < 0.55) ey = up;
      else if (k < 0.7) ey = lerp(up, low, ease.in((k - 0.55) / 0.15));
      if (k >= 0.7 && !s.emitted) { s.emitted = true; s.ps.push({ x: ax + 60, y: low - gap / 2, lam }); }
      if (k < 0.7) s.emitted = false;
      for (const [y, lb] of [[up, 'excited level'], [low, 'lower level']]) {
        c.strokeStyle = 'rgba(235,240,250,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax - 70, y); c.lineTo(ax + 70, y); c.stroke();
        txt(c, lb, ax - 78, y, { align: 'right', font: `500 11px ${BODY}`, color: 'rgba(190,200,215,.7)' });
      }
      arrow(c, ax + 40, up, ax + 40, low, AL.rgba(rgb, 0.85), 2.4);
      txt(c, `ΔE = ${fmt(s.dE, 2)} eV`, ax + 50, (up + low) / 2, { font: `700 12px ${MONO}`, color: '#fff' });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, ax - 10, ey, 12, [140, 200, 255]); c.restore();
      // photon bay sang thanh phổ
      const sy = hh * 0.8, X = strip(c, 30, sy, w - 60, 26, 380, 780, false, { dark: true, ticks: [400, 500, 600, 700] });
      for (const p of s.ps) {
        p.t = (p.t || 0) + dt / 1.1; const T = ease.inOut(Math.min(1, p.t));
        const tx = X(p.lam), x = lerp(p.x, tx, T), y = lerp(p.y, sy, T) - Math.sin(T * Math.PI) * 40;
        c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 12, nmCol(p.lam)); c.restore();
        if (p.t >= 1 && !p.hit) { p.hit = true; s.hist.push({ lam: p.lam, a: 1 }); }
      }
      s.ps = s.ps.filter((p) => !p.hit);
      for (const m of s.hist) { m.a -= dt * 0.12; if (m.a > 0) markLine(c, X(m.lam), sy, 26, m.lam, m.a); }
      s.hist = s.hist.filter((m) => m.a > 0);
      txt(c, `λ = 1240 / ${fmt(s.dE, 2)} ≈ ${fmt(lam, 1)} nm · ${AL.colorName(lam)}`, w < 560 ? 16 : w * 0.55, w < 560 ? 18 : hh * 0.32, { font: `700 ${w < 560 ? 13 : 15}px ${MONO}`, color: AL.rgba(rgb, 1) });
    },
    text: [
      'An electron just “pushed” up a step is like a ball on the edge of a table: sooner or later it falls. This is the <b>excited state</b>, which usually lasts only about a hundred-millionth of a second.',
      'When the electron returns to a lower step, the surplus energy ΔE is packed into <b>one photon</b> that flies away. The bigger the drop, the more energetic the photon, the shorter the wavelength and the more blue or violet the colour.',
    ],
    key: '$\\lambda\\,(\\mathrm{nm}) \\approx \\dfrac{1240}{\\Delta E\\,(\\mathrm{eV})}$. Each element has its own “staircase”, so it emits its own set of colours.',
    refs: ['upv3', 'chem2e', 'nist'],
  });

  // 4 — Các dãy phổ của hydrogen
  concepts.push({
    id: 'series', group: 'Light and atoms', title: 'The hydrogen series',
    q: 'Why does hydrogen have ultraviolet, visible and infrared lines?',
    lab: ['Try it in the Atom experiment (H)', () => AL.app.goLab('atom', { el: 'H', ghost: true })],
    init(ctl) {
      this.s = { n: 2 };
      ctl.append(seg([[1, 'Lyman (to n = 1)'], [2, 'Balmer (to n = 2)'], [3, 'Paschen (to n = 3)']], 2, (v) => (this.s.n = v)));
    },
    draw(c, w, hh, t) {
      bg(c, w, hh);
      const nl = this.s.n, E = (n) => 13.606 * (1 - 1 / (n * n));
      const top = hh * 0.08, bot = hh * 0.58, x0 = 90, x1 = w - 30;
      const yE = (e) => (e < 5 ? bot : top + (1 - (e - 9.9) / 3.75) * (bot - top - 20));
      for (let n = 1; n <= 6; n++) {
        const y = yE(E(n));
        c.strokeStyle = n === nl ? '#ff6f91' : 'rgba(235,240,250,.4)'; c.lineWidth = n === nl ? 2.2 : 1.3;
        c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
        txt(c, `n = ${n}`, n === 6 ? x0 - 54 : x0 - 10, n === 6 ? y - 6 : y, { align: 'right', font: `600 11px ${MONO}`, color: n === nl ? '#ff6f91' : 'rgba(205,213,226,.75)' });
      }
      txt(c, '≈', 40, (bot + yE(E(2))) / 2, { font: `700 14px ${MONO}`, color: 'rgba(255,255,255,.4)' });
      const lines = [];
      for (let u = nl + 1; u <= 6; u++) {
        const vac = 1e7 / (109678 * (1 / (nl * nl) - 1 / (u * u))), lam = vac > 200 ? vac / 1.000277 : vac; // bước sóng trong không khí
        const x = x0 + 60 + (u - nl - 1) * ((x1 - x0 - 120) / 4);
        const pulse = 0.55 + 0.45 * Math.sin(t * 3 - u);
        arrow(c, x, yE(E(u)), x, yE(E(nl)), AL.rgba(nmCol(lam), pulse), 2.2);
        txt(c, AL.fmtNm(lam), x + 6, (yE(E(u)) + yE(E(nl))) / 2, { font: `600 10.5px ${MONO}`, color: AL.rgba(nmCol(lam), 1) });
        lines.push(lam);
      }
      const sy = hh * 0.74, X = strip(c, 30, sy, w - 60, 28, 80, 2000, true, { ticks: [100, 200, 400, 700, 1000, 2000], bright: 0.7 });
      for (const lam of lines) markLine(c, X(lam), sy, 28, lam, 1, 2);
      const name = { 1: 'Lyman series: entirely in the ultraviolet', 2: 'Balmer series: four lines in the visible range', 3: 'Paschen series: entirely in the infrared' }[nl];
      txt(c, name, 30, sy - 14, { font: `600 11.5px ${BODY}`, color: 'rgba(220,228,240,.85)' });
    },
    text: [
      'Hydrogen has just one electron, so its levels follow a very neat formula: $E_n = -\\dfrac{13.6\\ \\mathrm{eV}}{n^2}$. The lines are grouped into <b>series</b> by the step the electron falls to.',
      'Falling to <b>n = 1</b>: a huge drop, ultraviolet photons (Lyman series). Falling to <b>n = 2</b>: ΔE puts the photon in the visible range (Balmer series). Falling to <b>n = 3</b>: small ΔE, infrared photons (Paschen series).',
    ],
    key: 'Only the Balmer series is visible: 656.3 · 486.1 · 434.0 · 410.2 nm. The red Hα 656.3 nm line gives nebulae such as Orion (M42) their pink-red glow.',
    refs: ['upv3', 'bohr', 'nist'],
  });

  // 5 — Quang phổ liên tục, phát xạ và hấp thụ
  const SPEC_EL = { H: [656.3, 486.1, 434.0, 410.2], Na: [589.0, 589.6, 568.8, 616.1] };
  concepts.push({
    id: 'spectra', group: 'Spectroscopy', title: 'Continuous, emission and absorption spectra',
    q: 'How do astronomers know which elements a star contains?',
    lab: ['Try it in the Flame experiment', () => AL.app.goLab('flame', { el: 'Na', scope: true })],
    init(ctl) {
      this.s = { mode: 'abs', el: 'H', ps: [] };
      ctl.append(seg([['cont', 'Glowing solid'], ['emis', 'Hot gas'], ['abs', 'Cool gas in front of a source']], 'abs', (v) => (this.s.mode = v)),
        seg([['H', 'Hydrogen'], ['Na', 'Sodium']], 'H', (v) => (this.s.el = v)));
    },
    draw(c, w, hh, t, dt) {
      bg(c, w, hh);
      const s = this.s, cy = hh * 0.42, srcX = w * 0.1, prX = w * 0.42, lines = SPEC_EL[s.el];
      const gasCol = s.el === 'H' ? [255, 111, 160] : [255, 180, 60];
      // nguồn sáng
      if (s.mode !== 'emis') { glow(c, srcX, cy, 46, [255, 230, 180], 1); txt(c, 'hot glowing source', srcX, cy + 58, { align: 'center', font: `500 11px ${BODY}` }); }
      if (s.mode === 'emis') {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 5; i++) glow(c, srcX - 10 + i * 6, cy, 28, gasCol, 0.4);
        c.restore();
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.strokeRect(srcX - 30, cy - 16, 72, 32);
        txt(c, `hot ${s.el === 'H' ? 'hydrogen' : 'sodium'} gas tube`, srcX + 6, cy + 58, { align: 'center', font: `500 11px ${BODY}` });
      }
      if (s.mode === 'abs') {
        const gx = w * 0.25;
        c.fillStyle = AL.rgba(gasCol, 0.08); c.beginPath(); c.ellipse(gx, cy, 34, 56, 0, 0, TAU); c.fill();
        c.strokeStyle = AL.rgba(gasCol, 0.35); c.setLineDash([3, 4]); c.stroke(); c.setLineDash([]);
        for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 10 + ((i * 37) % 24); c.fillStyle = AL.rgba(gasCol, 0.6); c.beginPath(); c.arc(gx + Math.cos(a + t * 0.3) * r * 0.7, cy + Math.sin(a + t * 0.3) * r * 1.6, 2, 0, TAU); c.fill(); }
        txt(c, 'cool gas cloud', gx, cy + 70, { align: 'center', font: `500 11px ${BODY}`, color: AL.rgba(gasCol, 0.9) });
      }
      // chùm sáng → lăng kính
      c.strokeStyle = s.mode === 'emis' ? AL.rgba(gasCol, 0.5) : 'rgba(255,240,220,.45)'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(srcX + 40, cy); c.lineTo(prX - 18, cy); c.stroke();
      const ps = 46, hp = ps * 0.87;
      c.beginPath(); c.moveTo(prX, cy - hp * 0.62); c.lineTo(prX + ps / 2, cy + hp * 0.38); c.lineTo(prX - ps / 2, cy + hp * 0.38); c.closePath();
      c.fillStyle = 'rgba(200,230,255,.15)'; c.fill(); c.strokeStyle = 'rgba(225,238,255,.7)'; c.lineWidth = 1.4; c.stroke();
      // màn hứng phổ
      const sx0 = w * 0.55, sw = w * 0.41, sy = hh * 0.2, sh = hh * 0.36;
      const X = (nm) => sx0 + ((nm - 380) / 400) * sw;
      if (s.mode === 'emis') { c.fillStyle = '#010103'; c.fillRect(sx0, sy, sw, sh); }
      else for (let i = 0; i < sw; i += 2) { const nm = 380 + (i / sw) * 400, [r, g, b] = AL.nmRGB(nm); c.fillStyle = `rgba(${r},${g},${b},${0.85 * AL.nmVis(nm)})`; c.fillRect(sx0 + i, sy, 2, sh); }
      // tia tán sắc
      c.save(); c.globalCompositeOperation = 'lighter';
      const rays = s.mode === 'emis' ? lines : [400, 450, 500, 550, 600, 650, 700, 750];
      for (const nm of rays) { c.strokeStyle = AL.rgba(nmCol(nm), 0.35); c.lineWidth = 1.2; c.beginPath(); c.moveTo(prX + 10, cy - 4); c.lineTo(X(nm), sy + sh); c.stroke(); }
      c.restore();
      if (s.mode === 'emis') for (const nm of lines) markLine(c, X(nm), sy, sh, nm, nm === 589.6 ? 0.6 : 1, 3);
      if (s.mode === 'abs') for (const nm of lines) { c.fillStyle = 'rgba(2,3,6,.95)'; c.fillRect(X(nm) - 1.5, sy, 3, sh); }
      c.strokeStyle = 'rgba(255,255,255,.2)'; c.strokeRect(sx0 + 0.5, sy + 0.5, sw - 1, sh - 1);
      c.font = `500 10px ${MONO}`; c.textAlign = 'center'; c.fillStyle = 'rgba(190,200,215,.6)'; c.textBaseline = 'top';
      for (let nm = 400; nm <= 750; nm += 50) c.fillText(nm, X(nm), sy + sh + 5);
      const label = { cont: 'Continuous spectrum: every colour, no lines', emis: 'Emission line spectrum: bright lines on a dark background', abs: 'Absorption line spectrum: dark lines on a continuum' }[s.mode];
      txt(c, label, sx0, sy - 14, { font: `600 12px ${BODY}`, color: '#e8edf5' });
      txt(c, 'the dark lines sit exactly where the same element’s bright lines are', sx0, hh * 0.9, { font: `500 11px ${BODY}`, color: s.mode === 'abs' ? 'rgba(255,190,130,.9)' : 'rgba(0,0,0,0)' });
    },
    text: [
      'In 1860 Kirchhoff and Bunsen summed up three laws that still underpin spectroscopy today:',
      '<ul><li>A glowing solid, liquid or very dense gas gives a <b>continuous spectrum</b> of every colour.</li><li>A heated thin gas emits only certain colours: an <b>emission line spectrum</b>.</li><li>Continuous light passing through a cooler gas has exactly those colours “carved out”: an <b>absorption line spectrum</b>.</li></ul>',
    ],
    key: 'An element’s bright and dark lines are at the same wavelengths. So just by analysing light, astronomers know what the Sun and distant stars are made of.',
    refs: ['kirchhoff', 'astro2e', 'nist'],
  });

  // 6 — Vạch nguyên tử và dải phân tử
  concepts.push({
    id: 'bands', group: 'Spectroscopy', title: 'Atomic lines and molecular bands',
    q: 'Why do calcium and strontium flames give whole bands of colour?',
    lab: ['Try it in the Flame experiment (Sr)', () => AL.app.goLab('flame', { el: 'Sr', scope: true })],
    init(ctl) {
      this.s = { v: 0 };
      ctl.append(slider('Vibrational levels of the molecule', 0, 6, 1, 0, (v) => (v ? `${v} levels (molecule)` : 'none (atom)'), (v) => (this.s.v = v)));
    },
    draw(c, w, hh, t) {
      bg(c, w, hh);
      const nv = this.s.v, base = 2.05, au = 0.045, al = 0.055;
      const x0 = 70, x1 = w * 0.42, yU = hh * 0.14, yL = hh * 0.56, gap = 9;
      for (const [y, a, lb] of [[yU, au, 'excited state'], [yL, al, 'lower state']]) {
        c.strokeStyle = 'rgba(235,240,250,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
        for (let v = 1; v <= nv; v++) { c.strokeStyle = 'rgba(235,240,250,.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y - v * gap); c.lineTo(x1, y - v * gap); c.stroke(); }
        txt(c, lb, x0, y + 13, { font: `500 10.5px ${BODY}`, color: 'rgba(190,200,215,.7)' });
        void a;
      }
      const lines = [];
      for (let vu = 0; vu <= nv; vu++) for (let vl = 0; vl <= nv; vl++) {
        const wgt = Math.exp(-((vu - vl) ** 2) / 1.2) * Math.exp(-vu * 0.25);
        if (wgt < 0.08) continue;
        lines.push({ lam: AL.HC / (base + vu * au - vl * al), wgt, vu, vl });
      }
      lines.slice(0, 24).forEach((L, i) => {
        const x = x0 + 20 + (i % 24) * ((x1 - x0 - 30) / Math.max(1, Math.min(24, lines.length)));
        c.globalAlpha = 0.35 + 0.65 * L.wgt;
        arrow(c, x, yU - L.vu * gap, x, yL - L.vl * gap, AL.rgba(nmCol(L.lam), 0.9), 1.4);
        c.globalAlpha = 1;
      });
      // phổ phóng to
      const sx = w * 0.5, sw = w * 0.46, sy = hh * 0.18, sh = hh * 0.4;
      c.fillStyle = '#010103'; c.fillRect(sx, sy, sw, sh);
      const X = (nm) => sx + ((nm - 560) / 100) * sw;
      for (const L of lines) if (L.lam > 560 && L.lam < 660) markLine(c, X(L.lam), sy, sh, L.lam, L.wgt, 1.6);
      c.strokeStyle = 'rgba(255,255,255,.2)'; c.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
      c.font = `500 10px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = 'rgba(190,200,215,.6)';
      for (let nm = 570; nm <= 650; nm += 20) c.fillText(nm, X(nm), sy + sh + 5);
      txt(c, nv ? `${lines.length} closely spaced lines → one band` : 'a single line', sx, sy - 14, { font: `600 12px ${BODY}`, color: '#e8edf5' });
      // nhìn qua kính có độ phân giải hữu hạn
      const by = hh * 0.8;
      txt(c, 'through an ordinary spectroscope:', sx, by - 12, { font: `500 10.5px ${BODY}`, color: 'rgba(190,200,215,.65)' });
      c.fillStyle = '#010103'; c.fillRect(sx, by, sw, 24);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const L of lines) if (L.lam > 560 && L.lam < 660) { const x = X(L.lam), g = c.createLinearGradient(x - 14, 0, x + 14, 0), rgb = nmCol(L.lam); g.addColorStop(0, AL.rgba(rgb, 0)); g.addColorStop(0.5, AL.rgba(rgb, 0.5 * L.wgt)); g.addColorStop(1, AL.rgba(rgb, 0)); c.fillStyle = g; c.fillRect(x - 14, by, 28, 24); }
      c.restore();
    },
    text: [
      'A lone atom only has the electron’s energy steps, so each transition gives one thin line.',
      'A molecule is different: besides its electrons, the whole molecule also <b>vibrates</b> and <b>rotates</b>. Each main step carries many closely spaced sub-steps. Hundreds of transitions between them give hundreds of crowded lines, which look like a broad <b>band</b> through a spectroscope.',
      'In a flame, calcium and strontium combine with OH radicals to form CaOH and SrOH molecules, and these emit most of the light we see.',
    ],
    key: 'Atoms give narrow lines, molecules give broad bands. The brick red of calcium and crimson of strontium flames come mainly from molecular bands, not atomic lines.',
    refs: ['gaydon', 'chem2e'],
  });

  // 7 — Trạng thái giả bền và dập tắt do va chạm
  concepts.push({
    id: 'quench', group: 'Aurora', title: 'Metastable states and collisional quenching',
    q: 'Why does oxygen’s red line only appear high up?',
    lab: ['Try it in the Aurora experiment', () => AL.app.goLab('aurora', { s: 12 })],
    init(ctl) {
      const s = (this.s = { d: 0.15, gas: [], O: [], fx: [], tick: 0 });
      const rng = AL.rng(3);
      for (let i = 0; i < 260; i++) s.gas.push({ x: rng(), y: rng(), vx: (rng() - 0.5) * 0.2, vy: (rng() - 0.5) * 0.2 });
      for (let i = 0; i < 16; i++) s.O.push({ x: rng(), y: rng(), vx: (rng() - 0.5) * 0.1, vy: (rng() - 0.5) * 0.1, st: 0, age: 0 });
      ctl.append(slider('Gas density (altitude)', 0, 1, 0.01, s.d, (v) => `≈ ${Math.round(300 - 200 * v)} km`, (v) => (s.d = v)));
    },
    draw(c, w, hh, t, dt) {
      bg(c, w, hh);
      const s = this.s, narrow = w < 560, bw = narrow ? w - 32 : w * 0.62, bx = 16, by = 16, bH = narrow ? hh * 0.58 : hh - 32;
      const rate = 6 * Math.pow(s.d, 1.5); // tần suất va chạm (1/s)
      const TAU_G = 0.8, TAU_R = 4; // thời gian sống theo tỉ lệ
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.strokeRect(bx + 0.5, by + 0.5, bw, bH);
      const nGas = Math.round(10 + 250 * s.d);
      c.fillStyle = 'rgba(150,170,200,.45)';
      for (let i = 0; i < nGas; i++) {
        const p = s.gas[i]; p.x = (p.x + p.vx * dt + 1) % 1; p.y = (p.y + p.vy * dt + 1) % 1;
        c.fillRect(bx + p.x * bw, by + p.y * bH, 2, 2);
      }
      s.tick -= dt;
      if (s.tick <= 0) { s.tick = 0.28; const g = s.O.filter((o) => !o.st); if (g.length) { const o = g[Math.floor(Math.random() * g.length)]; o.st = Math.random() < 0.5 ? 1 : 2; o.age = 0; } }
      for (const o of s.O) {
        o.x = (o.x + o.vx * dt + 1) % 1; o.y = (o.y + o.vy * dt + 1) % 1;
        const x = bx + o.x * bw, y = by + o.y * bH;
        if (o.st) {
          const tau = o.st === 1 ? TAU_G : TAU_R, col = o.st === 1 ? [110, 255, 125] : [255, 70, 70];
          if (Math.random() < dt / tau) { s.fx.push({ x, y, col, t: 0, emit: true }); o.st = 0; }
          else if (Math.random() < dt * rate) { s.fx.push({ x, y, col: [150, 160, 175], t: 0 }); o.st = 0; }
          else { c.strokeStyle = AL.rgba(col, 0.75); c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 7 + Math.sin(t * 8) * 1.2, 0, TAU); c.stroke(); }
        }
        c.fillStyle = '#ff9a4d'; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill();
      }
      for (const f of s.fx) {
        f.t += dt; const a = 1 - f.t / 0.7; if (a <= 0) continue;
        if (f.emit) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, f.x, f.y, 10 + f.t * 40, f.col, a); c.restore(); }
        else { c.fillStyle = `rgba(150,160,175,${a * 0.5})`; c.beginPath(); c.arc(f.x, f.y, 4 + f.t * 14, 0, TAU); c.fill(); }
      }
      s.fx = s.fx.filter((f) => f.t < 0.7);
      // tỉ lệ phát sáng (lý thuyết): (1/τ) / (1/τ + tần suất va chạm)
      const effG = 1 / TAU_G / (1 / TAU_G + rate), effR = 1 / TAU_R / (1 / TAU_R + rate);
      const px = narrow ? bx : bx + bw + 30, pw = narrow ? w - 32 : w - px - 20, py = narrow ? by + bH + 14 : by;
      txt(c, 'Fraction of atoms that manage to shine', px, py + 8, { font: `600 12px ${BODY}`, color: '#e8edf5' });
      [[effG, [110, 255, 125], 'green 557.7 nm · τ ≈ 0.74 s'], [effR, [255, 70, 70], 'red 630.0 nm · τ ≈ 110 s']].forEach(([e, col, lb], i) => {
        const y = py + (narrow ? 40 + i * 44 : 44 + i * 70);
        txt(c, lb, px, y - 12, { font: `500 11px ${BODY}`, color: AL.rgba(col, 0.95) });
        c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(px, y, pw, 16);
        c.fillStyle = AL.rgba(col, 0.85); c.fillRect(px, y, pw * e, 16);
        txt(c, `${Math.round(e * 100)}%`, px + pw - 4, y + 8, { align: 'right', font: `700 11px ${MONO}`, color: '#fff' });
      });
      if (!narrow) txt(c, '● O atom   ○ excited   · gas molecules', px, by + 200, { font: `500 10.5px ${BODY}`, color: 'rgba(190,200,215,.6)' });
      txt(c, `≈ ${Math.round(300 - 200 * s.d)} km`, bx + 10, by + 14, { font: `700 12px ${MONO}`, color: '#ffb066' });
    },
    text: [
      'When auroral electrons hit it, an oxygen atom can reach the ¹S or ¹D state. Unlike ordinary excited states, these are <b>metastable</b>: the atom must “wait” a long time before shining, about <b>0.7 seconds</b> for ¹S and about <b>110 seconds</b> for ¹D. The lines they emit are called forbidden lines.',
      'While waiting, if the atom bumps into another molecule (mainly N₂ and O₂), its energy is taken away without producing light. This is <b>collisional quenching</b>. The denser the air, the more frequent the collisions, and the longer a state has to wait, the easier it is to quench.',
    ],
    key: 'High up (about 200–300 km) the air is so thin that atoms can wait 110 seconds: the red 630 nm line shines. At about 100–150 km only the short-lived ¹S state still manages to shine: the green 557.7 nm line. That is why the aurora is usually red on top and green below.',
    refs: ['slanger', 'solomon', 'nist', 'rees'],
  });

  // 8 — Hạt mang điện trong từ trường Trái Đất
  concepts.push({
    id: 'field', group: 'Aurora', title: 'Charged particles in Earth’s magnetic field',
    q: 'Why does the aurora mostly appear near the two poles?',
    lab: ['Try it in the Aurora experiment', () => AL.app.goLab('aurora', { s: 60 })],
    init(ctl) {
      this.s = { on: true, ps: [], hits: [], spawn: 0 };
      ctl.append(seg([[true, 'With magnetic field'], [false, 'Without magnetic field']], true, (v) => { this.s.on = v; this.s.ps = []; }));
    },
    draw(c, w, hh, t, dt) {
      bg(c, w, hh);
      const s = this.s, ex = w * 0.62, ey = hh * 0.5, re = Math.min(w, hh) * 0.13;
      // đường sức lưỡng cực
      if (s.on) {
        c.strokeStyle = 'rgba(140,190,255,.25)'; c.lineWidth = 1;
        for (const L of [1.6, 2.2, 3, 4]) for (const side of [-1, 1]) {
          c.beginPath();
          for (let th = 0.12; th <= Math.PI - 0.12; th += 0.03) { const r = L * re * Math.sin(th) ** 2, x = ex + side * r * Math.sin(th), y = ey - r * Math.cos(th); th === 0.12 ? c.moveTo(x, y) : c.lineTo(x, y); }
          c.stroke();
        }
      }
      // Trái Đất
      AL.drawEarth(c, ex, ey, re, t);
      txt(c, 'Earth', ex, ey + re + 14, { align: 'center', font: `500 11px ${BODY}` });
      // vành đai cực quang quanh hai cực, sáng dần khi hạt đổ về
      s.aur = Math.max(0, (s.aur || 0) - dt * 0.15);
      if (s.on && s.aur > 0.01) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const side of [-1, 1]) {
          c.strokeStyle = `rgba(110,255,140,${0.75 * s.aur})`; c.lineWidth = 4; c.shadowColor = '#6eff8c'; c.shadowBlur = 14;
          c.beginPath(); c.ellipse(ex, ey + side * re * 0.9, re * 0.42, re * 0.12, 0, 0, TAU); c.stroke();
        }
        c.restore();
        txt(c, 'auroral oval', ex + re * 0.6, ey - re * 1.15, { font: `600 11px ${BODY}`, color: `rgba(140,255,160,${Math.min(1, s.aur * 2)})` });
      }
      txt(c, 'solar wind →', 20, 20, { font: `600 11.5px ${BODY}`, color: '#ffd59a' });
      // sinh hạt
      s.spawn -= dt;
      if (s.spawn <= 0) { s.spawn = 0.09; s.ps.push({ x: 10, y: ey + (Math.random() - 0.5) * re * 6, st: 'fly', t: 0 }); }
      const Lcap = 3.4;
      for (const p of s.ps) {
        if (p.st === 'fly') {
          p.x += dt * 180;
          const dx = p.x - ex, dy = p.y - ey, r = Math.hypot(dx, dy);
          if (!s.on && r < re) { p.dead = true; s.hits.push({ x: p.x, y: p.y, t: 0, col: [255, 200, 120] }); }
          if (s.on && r < Lcap * re * 1.05 && dx < 0) {
            // θ: góc tính từ cực Bắc; đường sức lưỡng cực r = L·sin²θ đi qua vị trí hiện tại
            const th0 = Math.atan2(-dx, -dy), L = clamp(r / re / Math.sin(th0) ** 2, 1.3, 9), foot = Math.asin(Math.sqrt(1 / L));
            Object.assign(p, { st: 'guide', t: 0, L, th0, thEnd: dy < 0 ? foot : Math.PI - foot });
          }
        } else {
          // chạy dọc đường sức về chân đường sức gần cực, xoắn quanh nó
          p.t += dt / 1.3; const T = Math.min(1, p.t);
          const th = lerp(p.th0, p.thEnd, ease.inOut(T)), r = p.L * re * Math.sin(th) ** 2;
          const bx = ex - r * Math.sin(th), by = ey - r * Math.cos(th);
          const wob = Math.sin(p.t * 60) * 5 * (1 - T);
          p.x = bx + wob * Math.cos(th); p.y = by - wob * Math.sin(th);
          if (T >= 1) { p.dead = true; s.hits.push({ x: bx, y: by, t: 0, col: [110, 255, 125] }); s.aur = Math.min(1, (s.aur || 0) + 0.12); }
        }
        if (p.x > w + 10) p.dead = true;
        c.fillStyle = p.st === 'guide' ? 'rgba(170,255,190,.95)' : 'rgba(255,214,150,.9)';
        c.beginPath(); c.arc(p.x, p.y, 2.2, 0, TAU); c.fill();
      }
      s.ps = s.ps.filter((p) => !p.dead);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const hh2 of s.hits) { hh2.t += dt; const a = 1 - hh2.t / 1.2; if (a > 0) glow(c, hh2.x, hh2.y, 10 + hh2.t * 16, hh2.col, a); }
      c.restore();
      s.hits = s.hits.filter((x) => x.t < 1.2);
      txt(c, s.on ? 'particles guided along field lines into both polar regions' : 'no magnetic field: particles hit the day side head-on, at every latitude', 20, hh - 18, { font: `600 11.5px ${BODY}`, color: s.on ? '#9dffb0' : '#ffd59a' });
    },
    text: [
      'A charged particle cannot cross field lines. The Lorentz force makes it <b>spiral along a field line</b>, like a bead on a string. Earth’s field is roughly that of a bar magnet: the lines bunch together and plunge into the atmosphere around the two poles.',
      'The solar wind is a stream of plasma flowing from the Sun, but Earth’s field blocks most of it, forming a protective “bubble” called the <b>magnetosphere</b>. When the field carried by the solar wind “links up” with Earth’s field, energy is fed into the magnetosphere and accelerates electrons <b>already in the magnetosphere</b> to a few thousand eV. These electrons slide down the field lines into the upper atmosphere and make it glow.',
    ],
    key: 'Auroral electrons come mainly from the magnetosphere, “energised” by the solar wind, rather than flying straight from the Sun. They pour down into two oval rings around the magnetic poles.',
    refs: ['baumjohann', 'paschmann', 'swpcAurora'],
  });

  // ======================================================================
  // ĐIỀU KHIỂN USACODEX
  // ======================================================================
  // ---------- Trích dẫn tài liệu ----------
  // Định dạng gần APA 7: Tác giả (năm). Tiêu đề. Nguồn. DOI/URL
  // Trích dẫn gọn: Tác giả (năm). Tên tài liệu. Nguồn.
  AL.citeEl = function (r) {
    if (!r) return document.createTextNode('');
    const href = r.doi ? 'https://doi.org/' + r.doi : r.url;
    const title = href ? h('a', { href, target: '_blank', rel: 'noopener' }, r.t) : h('i', null, r.t);
    return h('li', { class: 'ref' }, `${r.au} (${r.y}). `, title, `. ${r.src}.`);
  };
  AL.renderRefs = function (el) {
    if (!el) return;
    const list = D.REF_ORDER.map((id) => D.refs[id]).sort((a, b) => a.au.localeCompare(b.au));
    el.replaceChildren(h('ol', { class: 'refs refs-full' }, list.map((r) => AL.citeEl(r))));
  };

  const CX = (AL.Codex = {
    concepts, cur: null, running: false, W: 0, H: 0,
    mount() {
      this.dlg = document.getElementById('codex');
      this.cv = document.getElementById('cx-canvas'); this.ctx = this.cv.getContext('2d');
      const list = document.getElementById('cx-list');
      let group = '';
      concepts.forEach((cp, i) => {
        if (cp.group !== group) { group = cp.group; list.append(h('div', { class: 'cx-group' }, group)); }
        cp.btn = h('button', { type: 'button', class: 'cx-item', onclick: () => this.show(cp.id) }, h('span', { class: 'cx-i' }, String(i + 1)), h('span', null, cp.title));
        list.append(cp.btn);
      });
      this.dlg.querySelectorAll('.cx-tabs [data-pane]').forEach((b) => b.addEventListener('click', () => this.pane(b.dataset.pane)));
      document.getElementById('cx-prev').onclick = () => this.step(-1);
      document.getElementById('cx-next').onclick = () => this.step(1);
      document.getElementById('cx-lab').onclick = () => { const cp = this.cur; this.dlg.close(); cp.lab[1](); };
      AL.renderRefs(document.getElementById('ref-list'));
      document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-goref]'); if (!b) return;
        const d = b.closest('dialog.modal'); if (d) d.close();
        this.open('ref');
        requestAnimationFrame(() => document.getElementById('refs-h').scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });
      new ResizeObserver(() => this.fit()).observe(document.getElementById('cx-stage'));
      this.dlg.addEventListener('close', () => { this.running = false; for (const c of concepts) if (c.w3) { c.w3.destroy(); c.w3 = null; } });
    },
    fit() {
      const r = this.cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      this.W = r.width; this.H = r.height; this.dpr = dpr;
      this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.height * dpr);
    },
    pane(p) {
      this.dlg.querySelectorAll('.cx-tabs [data-pane]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.pane === p)));
      this.dlg.querySelectorAll('.cx-pane').forEach((el) => (el.hidden = el.dataset.pane !== p));
      if (p === 'sims') { this.fit(); this.start(); }
    },
    show(id) {
      const i = Math.max(0, concepts.findIndex((c) => c.id === id)), cp = concepts[i];
      for (const c of concepts) if (c.w3) { c.w3.destroy(); c.w3 = null; }
      this.cur = cp;
      concepts.forEach((c) => c.btn.setAttribute('aria-current', String(c === cp)));
      document.getElementById('cx-num').textContent = `Lesson ${i + 1}/${concepts.length} · ${cp.group}`;
      document.getElementById('cx-title').textContent = cp.title;
      document.getElementById('cx-q').textContent = cp.q;
      document.getElementById('cx-text').innerHTML = [].concat(cp.text).map((p) => (p.startsWith('<ul') ? p : `<p>${p}</p>`)).join('');
      document.getElementById('cx-key').textContent = cp.key;
      this.renderExtra(cp);
      const rf = document.getElementById('cx-refs');
      if (rf) rf.replaceChildren(...(cp.refs || []).map((k) => AL.citeEl(D.refs[k], true)));
      document.getElementById('cx-lab').textContent = cp.lab[0] + ' →';
      document.getElementById('cx-prev').disabled = i === 0;
      document.getElementById('cx-next').disabled = i === concepts.length - 1;
      this.cv.setAttribute('aria-label', 'Simulation: ' + cp.title);
      const ctl = document.getElementById('cx-controls'); ctl.replaceChildren();
      cp.init(ctl);
      cp.btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      document.getElementById('cx-view').scrollTop = 0;
      this.pane('sims');
    },
    // “Thử ngay”, “Hiểu lầm thường gặp” và “Tìm hiểu chuyên sâu” (nội dung trong codex-deep.js)
    renderExtra(cp) {
      const X = (AL.CODEX_DEEP || {})[cp.id] || {};
      const short = (keys) => (keys || []).map((k) => D.refs[k]).filter(Boolean).map((r) => `${r.au.split(',')[0].replace(/\s*\(.*/, '')}${/&|,.*,/.test(r.au) ? ' et al.' : ''} (${r.y})`).join('; ');
      const tryBox = document.getElementById('cx-try');
      tryBox.hidden = !X.try;
      document.getElementById('cx-try-list').innerHTML = (X.try || []).map((t) => `<li>${t}</li>`).join('');
      const myth = document.getElementById('cx-myth');
      myth.hidden = !X.myth;
      myth.innerHTML = X.myth ? `<div class="cm-col cm-no"><span class="cm-tag">✗ Misconception</span><p>${X.myth.wrong}</p></div>`
        + `<div class="cm-col cm-yes"><span class="cm-tag">✓ Actually</span><p>${X.myth.right}</p>${X.myth.refs ? `<p class="src">Sources: ${short(X.myth.refs)}</p>` : ''}</div>` : '';
      const deep = document.getElementById('cx-deep'), body = document.getElementById('cx-deep-body'), toc = document.getElementById('cx-deep-toc');
      const secs = X.deep || [];
      deep.hidden = !secs.length; deep.open = false;
      document.getElementById('cx-deep-sub').textContent = secs.length ? `${secs.length} topics · about ${Math.max(2, Math.round(secs.reduce((n, s) => n + s.p.join(' ').split(/\s+/).length, 0) / 200))} min read` : '';
      toc.innerHTML = secs.map((s, i) => `<a href="#cxd-${cp.id}-${i}">${i + 1}. ${s.h}</a>`).join('');
      body.innerHTML = secs.map((s, i) => `<section class="cxd-sec" id="cxd-${cp.id}-${i}"><h5><span>${i + 1}</span>${s.h}</h5>${s.p.map((p) => `<p>${p}</p>`).join('')}<p class="src">Sources: ${short(s.refs)}</p></section>`).join('');
      toc.onclick = (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); document.getElementById(a.getAttribute('href').slice(1)).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      // gộp nguồn của phần mở rộng vào danh sách nguồn của bài
      const all = [...new Set([...(cp.refs || []), ...(X.myth ? X.myth.refs || [] : []), ...secs.flatMap((s) => s.refs || [])])];
      const rf = document.getElementById('cx-refs'); if (rf) rf.replaceChildren(...all.map((k) => AL.citeEl(D.refs[k])));
    },
    step(d) { const i = concepts.indexOf(this.cur) + d; if (concepts[i]) this.show(concepts[i].id); },
    start() {
      if (this.running) return;
      this.running = true;
      let last = performance.now(), T = 0;
      const frame = (now) => {
        if (!this.running || !this.dlg.open) { this.running = false; return; }
        const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
        if (this.cur && this.W) {
          const c = this.ctx; c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
          this.cur.draw(c, this.W, this.H, T, dt);
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    open(target) {
      if (!this.dlg.open) this.dlg.showModal();
      if (['data', 'ex', 'ref'].includes(target)) this.pane(target);
      else this.show(target || (this.cur && this.cur.id) || concepts[0].id);
    },
  });
})();
