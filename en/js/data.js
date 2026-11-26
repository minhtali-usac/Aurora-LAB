// TỰ SINH bởi tools/build-en.mjs — đừng sửa tay.
/* Aurora-LAB — CƠ SỞ DỮ LIỆU DUY NHẤT cho nguyên tố, mức năng lượng và vạch phổ.
 *
 * Quy ước
 *  - nm : bước sóng trong không khí (nm). Dưới 200 nm là bước sóng chân không.
 *  - E  : năng lượng của mức (eV), tính từ trạng thái cơ bản.
 *  - x  : khả năng được kích thích lên mức đó khi bấm "Cấp năng lượng" (tương đối).
 *  - p  : trọng số tương đối của các chuyển mức xuất phát từ cùng một mức
 *         (x và p là trọng số dùng cho hoạt cảnh, không phải hệ số Einstein).
 *  - nr : chuyển mức không bức xạ (mất năng lượng do va chạm).
 *  - src: 'NIST' = vạch nguyên tử theo NIST ASD; '≈' = dải phân tử (ghi vị trí cực đại).
 */
(function () {
  'use strict';
  const AL = (window.AL = window.AL || {});

  const species = {
    O: {
      sym: 'O', name: 'Oxygen', vi: 'oxi', color: '#7dff72', Z: 8, core: [2, 5], ion: 13.618,
      note: 'Oxygen (Z = 8, configuration 1s²2s²2p⁴). The 2p⁴ configuration gives three terms: ³P, ¹D and ¹S. The ¹S → ¹D (557.7 nm) and ¹D → ³P (630.0 nm) transitions are forbidden, so these two excited states live a long time; this is the origin of the aurora’s two signature colours.',
      levels: [
        { id: '3P', t: '³P', tl: '2p⁴ ³P (ground)', E: 0 },
        { id: '1D', t: '¹D', tl: '2p⁴ ¹D', E: 1.967, x: 0.4, meta: true, tau: '≈ 110 s' },
        { id: '1S', t: '¹S', tl: '2p⁴ ¹S', E: 4.19, x: 0.6, meta: true, tau: '≈ 0.74 s' },
      ],
      trans: [
        { u: '1S', l: '1D', nm: 557.7, p: 0.95, name: 'auroral green line', d: 'The most common auroral colour. It is a forbidden line: the ¹S state lives about 0.74 s before radiating.' },
        { u: '1S', l: '3P', nm: 297.2, p: 0.05, d: 'An ultraviolet line, very rare.' },
        { u: '1D', l: '3P', nm: 630.0, p: 0.76, name: 'auroral red line', d: 'The ¹D state lives about 110 s, so it can only radiate at great altitude (> 200 km), where the gas is thin enough that the excitation energy is not lost in collisions.' },
        { u: '1D', l: '3P', nm: 636.4, p: 0.24, d: 'A weaker red line, also from ¹D like the 630.0 nm line but ending on the ³P₁ sublevel.' },
      ],
    },

    H: {
      sym: 'H', name: 'Hydrogen', vi: 'hydrogen', color: '#ff6f91', Z: 1, core: [], ion: 13.606,
      axis: [[0, 0.7, 0.12], [9.75, 13.75, 0.88]],
      note: 'Hydrogen (Z = 1) is a one-electron system whose levels follow $E_n = -\\dfrac{13.6}{n^2}\\ \\mathrm{eV}$. Transitions down to n = 2 form the Balmer series in the visible range.',
      levels: [
        { id: 'n1', t: 'n = 1', tl: 'n = 1 (ground)', E: 0 },
        { id: 'n2', t: 'n = 2', E: 10.204, x: 0.1 },
        { id: 'n3', t: 'n = 3', E: 12.094, x: 0.34 },
        { id: 'n4', t: 'n = 4', E: 12.755, x: 0.26 },
        { id: 'n5', t: 'n = 5', E: 13.061, x: 0.18 },
        { id: 'n6', t: 'n = 6', E: 13.228, x: 0.12 },
      ],
      trans: [
        { u: 'n2', l: 'n1', nm: 121.6, p: 1, name: 'Lyman α', d: 'Hydrogen’s strongest line, in the far ultraviolet; the atmosphere absorbs it, so only space telescopes can see it.' },
        { u: 'n3', l: 'n1', nm: 102.6, p: 0.3, name: 'Lyman β' },
        { u: 'n4', l: 'n1', nm: 97.3, p: 0.3, name: 'Lyman γ' },
        { u: 'n5', l: 'n1', nm: 95.0, p: 0.3, name: 'Lyman δ' },
        { u: 'n6', l: 'n1', nm: 93.8, p: 0.3, name: 'Lyman ε' },
        { u: 'n3', l: 'n2', nm: 656.3, p: 0.7, name: 'Hα (Balmer)', d: 'Astronomy’s most famous red line: emission nebulae such as the Orion Nebula (M42) glow pink-red because of it.' },
        { u: 'n4', l: 'n2', nm: 486.1, p: 0.5, name: 'Hβ (Balmer)', d: 'The blue line of the Balmer series.' },
        { u: 'n5', l: 'n2', nm: 434.0, p: 0.5, name: 'Hγ (Balmer)', d: 'The violet-blue line of the Balmer series.' },
        { u: 'n6', l: 'n2', nm: 410.2, p: 0.5, name: 'Hδ (Balmer)', d: 'A violet line near the edge of what the eye can see.' },
        { u: 'n4', l: 'n3', nm: 1875.1, p: 0.2, name: 'Paschen α', d: 'The Paschen series (transitions down to n = 3) lies in the infrared.' },
        { u: 'n5', l: 'n3', nm: 1281.8, p: 0.2, name: 'Paschen β' },
        { u: 'n6', l: 'n3', nm: 1093.8, p: 0.2, name: 'Paschen γ' },
      ],
    },

    Na: {
      sym: 'Na', name: 'Sodium', vi: 'natri', color: '#ffb43b', Z: 11, core: [2, 8], ion: 5.139,
      note: 'Sodium (Z = 11, configuration [Ne]3s¹). The valence electron’s transitions all pass through 3p before returning to 3s, so the emission spectrum is dominated by the D doublet at 589.0 / 589.6 nm.',
      levels: [
        { id: '3s', t: '3s', tl: '3s ²S (ground)', E: 0 },
        { id: '3p', t: '3p', tl: '3p ²P', E: 2.104, x: 0.5 },
        { id: '4s', t: '4s', tl: '4s ²S', E: 3.191, x: 0.1 },
        { id: '3d', t: '3d', tl: '3d ²D', E: 3.617, x: 0.15 },
        { id: '5s', t: '5s', tl: '5s ²S', E: 4.116, x: 0.1 },
        { id: '4d', t: '4d', tl: '4d ²D', E: 4.284, x: 0.15 },
      ],
      trans: [
        { u: '3p', l: '3s', nm: 589.0, p: 1, name: 'D line', d: 'Sodium’s D line is really a doublet at 589.0 and 589.6 nm, split by the fine structure of 3p. It is the yellow-orange of sodium lamps and of NaCl in a flame.' },
        { u: '4s', l: '3p', nm: 1138.2, p: 1 },
        { u: '3d', l: '3p', nm: 818.3, p: 1 },
        { u: '5s', l: '3p', nm: 616.1, p: 1, d: 'A weak orange line (5s → 3p).' },
        { u: '4d', l: '3p', nm: 568.8, p: 1, d: 'A weak yellow-green line (4d → 3p).' },
      ],
    },

    Li: {
      sym: 'Li', name: 'Lithium', vi: 'liti', color: '#ff3d6e', Z: 3, core: [2], ion: 5.392,
      note: 'Lithium (Z = 3, configuration [He]2s¹). The 2p → 2s resonance transition gives the carmine 670.8 nm line that sets lithium’s characteristic flame colour.',
      levels: [
        { id: '2s', t: '2s', tl: '2s ²S (ground)', E: 0 },
        { id: '2p', t: '2p', tl: '2p ²P', E: 1.848, x: 0.55 },
        { id: '3s', t: '3s', tl: '3s ²S', E: 3.373, x: 0.15 },
        { id: '3d', t: '3d', tl: '3d ²D', E: 3.879, x: 0.2 },
        { id: '4d', t: '4d', tl: '4d ²D', E: 4.541, x: 0.1 },
      ],
      trans: [
        { u: '2p', l: '2s', nm: 670.8, p: 1, d: 'The carmine line behind lithium’s characteristic flame colour.' },
        { u: '3s', l: '2p', nm: 812.6, p: 1 },
        { u: '3d', l: '2p', nm: 610.4, p: 1, d: 'An orange line, much weaker than 670.8 nm.' },
        { u: '4d', l: '2p', nm: 460.3, p: 1, d: 'A very weak blue line.' },
      ],
    },

    K: {
      sym: 'K', name: 'Potassium', vi: 'kali', color: '#c79bff', Z: 19, core: [2, 8, 8], ion: 4.341,
      note: 'Potassium (Z = 19, configuration [Ar]4s¹). The 766.5 / 769.9 nm resonance lines sit at the edge of the infrared and, with the violet 404.4 nm line, give the flame its pale lilac colour.',
      levels: [
        { id: '4s', t: '4s', tl: '4s ²S (ground)', E: 0 },
        { id: '4p', t: '4p', tl: '4p ²P', E: 1.615, x: 0.55 },
        { id: '5s', t: '5s', tl: '5s ²S', E: 2.607, x: 0.15 },
        { id: '5p', t: '5p', tl: '5p ²P', E: 3.064, x: 0.2 },
        { id: '6s', t: '6s', tl: '6s ²S', E: 3.403, x: 0.1 },
      ],
      trans: [
        { u: '4p', l: '4s', nm: 766.5, p: 1, d: 'A deep red line (doublet with 769.9 nm) at the edge of the infrared, where the eye is insensitive.' },
        { u: '5s', l: '4p', nm: 1252.2, p: 1 },
        { u: '5p', l: '4s', nm: 404.4, p: 0.4, d: 'A violet line; together with the deep red it makes potassium’s lilac flame.' },
        { u: '5p', l: '5s', nm: 2712.6, p: 0.6 },
        { u: '6s', l: '4p', nm: 693.9, p: 0.6, d: 'A weak red line.' },
        { u: '6s', l: '5p', nm: 3650.0, p: 0.4 },
      ],
    },

    Ca: {
      sym: 'Ca', name: 'Calcium', vi: 'canxi', color: '#ff7a2f', Z: 20, core: [2, 8, 8, 1], ion: 6.113,
      note: 'Calcium (Z = 20, configuration [Ar]4s²). The atomic resonance line is 422.7 nm; the brick-red flame comes mainly from CaOH molecules formed in the flame.',
      levels: [
        { id: '1S', t: '¹S₀', tl: '4s² ¹S₀ (ground)', E: 0 },
        { id: '3P', t: '³P₁', tl: '4s4p ³P₁', E: 1.886, x: 0.2, meta: true, tau: '≈ 0.4 ms' },
        { id: '1P', t: '¹P₁', tl: '4s4p ¹P₁', E: 2.933, x: 0.55 },
        { id: '3S', t: '³S₁', tl: '4s5s ³S₁', E: 3.91, x: 0.25 },
      ],
      trans: [
        { u: '1P', l: '1S', nm: 422.7, p: 1, d: 'The strongest line of atomic calcium.' },
        { u: '3P', l: '1S', nm: 657.3, p: 1, d: 'An intercombination transition (the spin multiplicity changes), so it is very weak.' },
        { u: '3S', l: '3P', nm: 616.2, p: 0.55, d: 'An orange-red triplet at 610.3 / 612.2 / 616.2 nm (³S → ³P).' },
        { u: '3S', l: '3P', nm: 612.2, p: 0.3 },
        { u: '3S', l: '3P', nm: 610.3, p: 0.15 },
      ],
    },

    Sr: {
      sym: 'Sr', name: 'Strontium', vi: 'stronti', color: '#ff3048', Z: 38, core: [2, 8, 18, 8, 1], ion: 5.695,
      note: 'Strontium (Z = 38, configuration [Kr]5s²). The atomic resonance line is 460.7 nm; the crimson flame comes mainly from SrOH molecular bands.',
      levels: [
        { id: '1S', t: '¹S₀', tl: '5s² ¹S₀ (ground)', E: 0 },
        { id: '3P', t: '³P₁', tl: '5s5p ³P₁', E: 1.798, x: 0.25, meta: true, tau: '≈ 21 µs' },
        { id: '1P', t: '¹P₁', tl: '5s5p ¹P₁', E: 2.69, x: 0.5 },
        { id: '3S', t: '³S₁', tl: '5s6s ³S₁', E: 3.6, x: 0.25 },
      ],
      trans: [
        { u: '1P', l: '1S', nm: 460.7, p: 1, d: 'The strongest line of atomic strontium. Although the flame is red, the spectrum still shows this blue line.' },
        { u: '3P', l: '1S', nm: 689.3, p: 1, d: 'An intercombination transition; a very narrow line.' },
        { u: '3S', l: '3P', nm: 707.0, p: 0.55, d: 'A red triplet at 679.1 / 688.0 / 707.0 nm (³S → ³P).' },
        { u: '3S', l: '3P', nm: 688.0, p: 0.33 },
        { u: '3S', l: '3P', nm: 679.1, p: 0.12 },
      ],
    },

    Ba: {
      sym: 'Ba', name: 'Barium', vi: 'bari', color: '#b6ff5c', Z: 56, core: [2, 8, 18, 18, 8, 1], ion: 5.212,
      note: 'Barium (Z = 56, configuration [Xe]6s²). The 553.5 nm resonance line and the BaOH and BaCl bands give an apple-green flame.',
      levels: [
        { id: '1S', t: '¹S₀', tl: '6s² ¹S₀ (ground)', E: 0 },
        { id: '3P', t: '³P₁', tl: '6s6p ³P₁', E: 1.567, x: 0.3, meta: true, tau: '≈ 1.3 µs' },
        { id: '1P', t: '¹P₁', tl: '6s6p ¹P₁', E: 2.239, x: 0.7 },
      ],
      trans: [
        { u: '1P', l: '1S', nm: 553.5, p: 1, d: 'The strongest line of atomic barium.' },
        { u: '3P', l: '1S', nm: 791.1, p: 1, d: 'An intercombination line in the near infrared.' },
      ],
    },

    Cu: {
      sym: 'Cu', name: 'Copper', vi: 'copper', color: '#36e6c4', Z: 29, core: [2, 8, 18], ion: 7.726,
      note: 'Copper (Z = 29, configuration [Ar]3d¹⁰4s¹). The spectrum has a green group at 510.6 / 515.3 / 521.8 nm. The two ²D levels (3d⁹4s²) are metastable; in a flame they lose energy through collisions instead of radiating.',
      levels: [
        { id: '2S', t: '4s ²S', tl: '3d¹⁰4s ²S (ground)', E: 0 },
        { id: 'D52', t: '²D₅/₂', tl: '3d⁹4s² ²D₅/₂', E: 1.389, meta: true, tau: 'very long' },
        { id: 'D32', t: '²D₃/₂', tl: '3d⁹4s² ²D₃/₂', E: 1.642, meta: true, tau: 'very long' },
        { id: '4p', t: '4p ²P', tl: '3d¹⁰4p ²P', E: 3.8, x: 0.6 },
        { id: '4d', t: '4d ²D', tl: '3d¹⁰4d ²D', E: 6.19, x: 0.4 },
      ],
      trans: [
        { u: '4p', l: '2S', nm: 324.8, p: 0.6, d: 'An ultraviolet line, copper’s strongest.' },
        { u: '4p', l: 'D52', nm: 510.6, p: 0.25, d: 'The green 510.6 nm line.' },
        { u: '4p', l: 'D32', nm: 578.2, p: 0.15, d: 'The yellow 578.2 nm line.' },
        { u: '4d', l: '4p', nm: 521.8, p: 0.55, d: 'A green 521.8 nm line (4d → 4p).' },
        { u: '4d', l: '4p', nm: 515.3, p: 0.45, d: 'A green 515.3 nm line (4d → 4p).' },
        { u: 'D52', l: '2S', nr: true, p: 1 },
        { u: 'D32', l: '2S', nr: true, p: 1 },
      ],
    },

    N2p: {
      sym: 'N₂⁺', name: 'Molecular nitrogen ion', vi: 'molecular nitrogen ion', color: '#9a86ff', model: 'molecule', core: [], ion: null,
      note: 'In the aurora, energetic electrons ionise N₂ molecules, producing N₂⁺ in the excited B²Σu⁺ state. It radiates almost immediately (about 60 ns) in the first negative system at 391.4 and 427.8 nm.',
      levels: [
        { id: 'X0', t: 'X v=0', tl: 'X²Σg⁺, v = 0 (ground)', E: 0 },
        { id: 'X1', t: 'X v=1', tl: 'X²Σg⁺, v = 1 (vibration)', E: 0.27 },
        { id: 'X2', t: 'X v=2', tl: 'X²Σg⁺, v = 2 (vibration)', E: 0.535 },
        { id: 'B0', t: 'B v=0', tl: 'B²Σu⁺, v = 0', E: 3.168, x: 1 },
      ],
      trans: [
        { u: 'B0', l: 'X0', nm: 391.4, p: 0.65, name: 'first negative band (0–0)', d: 'A violet line close to the ultraviolet; faint to the eye but clear to cameras.' },
        { u: 'B0', l: 'X1', nm: 427.8, p: 0.28, name: 'first negative band (0–1)', d: 'The violet-blue along the lower edge of bright auroral bands.' },
        { u: 'B0', l: 'X2', nm: 470.9, p: 0.07, name: 'first negative band (0–2)', d: 'A weak blue line.' },
        { u: 'X1', l: 'X0', nr: true, p: 1 },
        { u: 'X2', l: 'X1', nr: true, p: 1 },
      ],
    },
  };

  // Thử nghiệm ngọn lửa: màu lửa nhìn thấy + vạch/dải phát xạ (I: cường độ tương đối, w: bề rộng dải, nm).
  const flame = {
    Na: { salt: 'NaCl', look: 'bright yellow-orange', glow: '#ffb02a', bright: 1.15,
      lines: [{ nm: 589.0, I: 1 }, { nm: 589.6, I: 0.55, d: 'The D₁ line, paired with 589.0 nm.' }],
      tip: 'The 589.0 / 589.6 nm D doublet is so strong that it swamps the colour of most other elements.' },
    Li: { salt: 'LiCl', look: 'carmine red', glow: '#ff2f61', bright: 1,
      lines: [{ nm: 670.8, I: 1 }, { nm: 610.4, I: 0.18 }, { nm: 460.3, I: 0.05 }],
      tip: 'One very strong red line at 670.8 nm, almost on its own.' },
    K: { salt: 'KCl', look: 'pale lilac', glow: '#c6a4ff', bright: 0.72,
      lines: [{ nm: 766.5, I: 1 }, { nm: 769.9, I: 0.6, d: 'Paired with 766.5 nm.' }, { nm: 404.4, I: 0.38 }, { nm: 404.7, I: 0.2, d: 'Paired with 404.4 nm.' }],
      tip: 'Both ends of the spectrum: a deep red line near 767 nm and a violet line near 404 nm. If sodium is mixed in, view through blue cobalt glass to block the yellow.' },
    Ca: { salt: 'CaCl₂', look: 'brick red – orange', glow: '#ff6a26', bright: 0.95,
      lines: [{ nm: 422.7, I: 0.35 }, { nm: 554, I: 0.6, w: 12, mol: 'CaOH' }, { nm: 622, I: 1, w: 18, mol: 'CaOH' }],
      tip: 'A broad orange-red band around 622 nm and a green band around 554 nm from CaOH.' },
    Sr: { salt: 'SrCl₂', look: 'crimson', glow: '#ff1f3a', bright: 1,
      lines: [{ nm: 460.7, I: 0.35 }, { nm: 606, I: 0.55, w: 10, mol: 'SrOH' }, { nm: 662, I: 1, w: 30, mol: 'SrOH / SrCl' }],
      tip: 'A broad red band at 640–690 nm, an orange band near 606 nm and a blue line at 460.7 nm. Quite unlike lithium’s single red line.' },
    Ba: { salt: 'BaCl₂', look: 'apple green', glow: '#b9ff66', bright: 0.9,
      lines: [{ nm: 553.5, I: 0.7 }, { nm: 487, I: 0.35, w: 6, mol: 'BaOH' }, { nm: 513, I: 0.8, w: 8, mol: 'BaOH' }, { nm: 524, I: 1, w: 6, mol: 'BaCl' }],
      tip: 'A cluster of green lines and bands at 510–555 nm.' },
    Cu: { salt: 'CuCl₂', look: 'blue-green', glow: '#2fe8c2', bright: 0.95,
      lines: [{ nm: 510.6, I: 0.55 }, { nm: 515.3, I: 0.45 }, { nm: 521.8, I: 0.6 }, { nm: 435, I: 0.6, w: 30, mol: 'CuCl' }, { nm: 535, I: 0.5, w: 24, mol: 'CuOH' }],
      tip: 'A green triplet at 510–522 nm plus a broad blue CuCl band.' },
  };
  const FLAME_ORDER = ['Na', 'Cu', 'Sr', 'Ba', 'K', 'Li', 'Ca'];

  // Lửa đèn khí chưa có muối: gốc CH và C₂ (dải Swan).
  const extra = {
    fuel: { sym: 'CH·C₂', name: 'Fuel gas', vi: 'gas burner flame', color: '#5b8cff',
      lines: [{ nm: 431.4, I: 0.5, w: 4, mol: 'CH', d: 'The CH radical band: the blue of a gas burner flame.' }, { nm: 516.5, I: 0.4, w: 5, mol: 'C₂ (Swan bands)', d: 'A Swan band of the C₂ molecule.' }, { nm: 473.7, I: 0.22, w: 5, mol: 'C₂ (Swan bands)', d: 'A Swan band of the C₂ molecule.' }] },
  };

  // Các vạch cực quang dùng trong mô phỏng độ cao (alt: độ cao phát xạ, giá trị gần đúng).
  const aurora = [
    { id: 'O-557.7', sp: 'O', group: 'green', alt: '≈ 100–150 km', eye: 1.0 },
    { id: 'O-630.0', sp: 'O', group: 'red', alt: '> 200 km', eye: 0.75 },
    { id: 'O-636.4', sp: 'O', group: 'red', alt: '> 200 km', eye: 0.75 },
    { id: 'N2p-427.8', sp: 'N2p', group: 'violet', alt: '≈ 90–110 km', eye: 0.55 },
    { id: 'N2p-391.4', sp: 'N2p', group: 'violet', alt: '≈ 90–110 km', eye: 0.15 },
  ];

  const terms = {
    photon: 'A particle of light: a “packet” of energy $E = \\dfrac{hc}{\\lambda}$. The wavelength λ sets the colour.',
    electron: 'A negatively charged particle in the atom’s outer shells; it can only be at certain energy levels.',
    level: 'The allowed energy values of an electron in an atom; energy is quantised, so the electron cannot have a value between two levels.',
    ground: 'The lowest energy level, the atom’s stable state.',
    excited: 'An electron above the ground level after receiving energy; this state is unstable.',
    eV: 'Electronvolt, a tiny unit of energy: $1\\ \\mathrm{eV} = 1.602 \\times 10^{-19}\\ \\mathrm{J}$.',
    keV: 'Kilo-electronvolt = 1000 eV, the energy scale of the electrons that rain into the atmosphere and make the aurora.',
    wavelength: 'The distance between two crests of a light wave. Human eyes see about 380–780 nm.',
    meta: 'An excited state with a long lifetime (milliseconds to hundreds of seconds) because selection rules hinder its decay; the lines it emits are called forbidden lines.',
    uv: 'Ultraviolet (UV): light with λ < 380 nm, invisible to the eye.',
    ir: 'Infrared (IR): light with λ > 780 nm, invisible to the eye.',
    solarwind: 'A stream of plasma (mainly protons and electrons) flowing continuously from the Sun, typically at 300–800 km/s. It does not plunge straight into the atmosphere but “charges up” the magnetosphere.',
    magnetosphere: 'The region around Earth ruled by its magnetic field. It deflects most of the solar wind and stores energy; the electrons that make the aurora mainly come from here.',
    fieldline: 'Magnetic field lines: charged particles are “guided” along them, and the lines converge at the two poles.',
    thermosphere: 'The very thin layer of the atmosphere from about 85–90 km upwards. Most auroras glow at about 90–300 km.',
    kp: 'The Kp index (0–9) shows how strongly Earth’s magnetic field is disturbed in each 3-hour period, from many ground magnetometer stations. The higher the Kp, the brighter the auroral oval and the further towards the equator it reaches.',
    quench: 'A collision that makes an excited atom lose its energy before it can shine (collisional quenching).',
    spectroscope: 'Spectroscope: an instrument using a prism or grating to spread light into lines by wavelength.',
    band: 'Molecules (such as CaOH, SrOH) have many vibrational levels, so they emit a broad band of colour instead of a thin line.',
    linespec: 'Line spectrum: a set of separate bright lines, each element’s own “fingerprint”.',
    nr: 'Non-radiative transition: the energy is carried away by a collision, with no photon.',
  };

  const quiz = {
    atom: [
      { q: 'When an electron moves from a high energy level to a lower one, the atom will…',
        a: ['absorb a photon', 'emit a photon', 'lose a proton', 'turn into another element'], c: 1,
        why: 'The energy difference ΔE is carried away by a photon with $\\lambda = \\dfrac{hc}{\\Delta E}$.' },
      { q: 'The larger the energy gap ΔE of a transition, the emitted photon has a wavelength that is…',
        a: ['shorter (towards violet, ultraviolet)', 'longer (towards red, infrared)', 'unchanged', 'zero'], c: 0,
        why: '$\\lambda = \\dfrac{hc}{\\Delta E}$: energy and wavelength are inversely proportional.' },
      { q: 'The yellow 589 nm sodium line corresponds to a ΔE of about…',
        a: ['1.0 eV', '2.1 eV', '3.5 eV', '13.6 eV'], c: 1,
        why: '$\\Delta E \\approx \\dfrac{1240}{589} \\approx 2.1\\ \\mathrm{eV}$, exactly the gap between the 3p and 3s levels.' },
    ],
    aurora: [
      { q: 'Which species emits the most common green colour of the aurora?',
        a: ['Atomic oxygen (557.7 nm)', 'Molecular nitrogen', 'Hydrogen', 'Sodium'], c: 0,
        why: 'An O atom goes from ¹S to ¹D and emits the 557.7 nm line, mainly at 100–150 km.' },
      { q: 'When the electrons entering the atmosphere have more energy, the auroral band…',
        a: ['moves lower', 'moves higher', 'stays at the same height', 'disappears'], c: 0,
        why: 'The more energetic an electron, the deeper it goes into denser gas before stopping, so the glow sits lower.' },
      { q: 'Why does the 630 nm red line only appear high up (> 200 km)?',
        a: ['Because it is hotter up there', 'Because the ¹D state must wait ~110 s; low down, collisions take its energy before it can shine', 'Because the Sun is red', 'Because there is no oxygen low down'], c: 1,
        why: 'Low down the air is dense, so atoms collide constantly: the red line is “quenched”. Only high up, where it is very thin, can it shine in time.' },
    ],
    flame: [
      { q: 'A bright yellow-orange flame usually indicates which element?',
        a: ['Sodium (Na)', 'Copper (Cu)', 'Potassium (K)', 'Barium (Ba)'], c: 0,
        why: 'Sodium’s 589.0 / 589.6 nm D doublet is very strong: a pinch of table salt is enough to turn a flame yellow.' },
      { q: 'Lithium and strontium both give red flames. How can you tell them apart for certain?',
        a: ['Look more carefully by eye', 'Burn for longer', 'Compare their spectral lines with a spectroscope', 'Use a different salt'], c: 2,
        why: 'Lithium has a single red 670.8 nm line; strontium has a broad red band at 640–690 nm plus a blue 460.7 nm line.' },
      { q: 'Why does each element have its own “fingerprint of light”?',
        a: ['Because flames have many colours', 'Because each element has its own set of energy levels', 'Because the spectroscope paints them', 'Because the salts taste different'], c: 1,
        why: 'The gaps ΔE between levels are unique to each element, so the set of wavelengths $\\lambda = \\dfrac{hc}{\\Delta E}$ is unique too.' },
    ],
  };

  const tips = {
    atom: [
      'Click a level on the diagram to excite the electron to exactly that level.',
      'Turn on “Auto” to keep recording the spectrum.',
      'In oxygen, the electron steps down twice in a row, emitting both a green and a red photon.',
      'Ultraviolet (UV) and infrared (IR) photons are counted in the boxes at both ends of the spectrum bar, outside the visible range.',
    ],
    aurora: [
      'Lower the particle energy: the particles stop high up, where oxygen emits the 630 nm red line.',
      'Click a glowing band to see its spectral line.',
      'Switch to “From the ground” to see the aurora as you would watch it.',
      'A stronger solar wind pushes the magnetosphere closer to Earth.',
    ],
    flame: [
      'Drag the prism into the light beam, or click “Through the spectroscope”.',
      'Lithium and strontium both give red flames but very different spectra. Compare them.',
      'Try the “Unknown sample” to practise reading spectra.',
    ],
  };

  // ---------- Tài liệu tham khảo (dùng chung cho USACodex, thẻ giải thích và mục Tài liệu) ----------
  // kind: 'data' cơ sở dữ liệu · 'book' sách, giáo trình · 'paper' bài báo khoa học · 'web' trang của cơ quan khoa học
  const refs = {
    nist:      { kind: 'data',  au: 'Kramida, A., Ralchenko, Yu., Reader, J., & NIST ASD Team', y: '2024', t: 'NIST Atomic Spectra Database (version 5.12)', src: 'National Institute of Standards and Technology, Gaithersburg, MD', doi: '10.18434/T4W30F', url: 'https://physics.nist.gov/asd', use: 'Line wavelengths, energy levels and atomic lifetimes.' },
    codata:    { kind: 'paper', au: 'Tiesinga, E., Mohr, P. J., Newell, D. B., & Taylor, B. N.', y: '2021', t: 'CODATA recommended values of the fundamental physical constants: 2018', src: 'Reviews of Modern Physics, 93(2), 025010', doi: '10.1103/RevModPhys.93.025010', use: 'Values of h, c, 1 eV and hc ≈ 1239.84 eV·nm.' },
    cie:       { kind: 'book',  au: 'Commission Internationale de l’Éclairage (CIE)', y: '2004', t: 'Colorimetry (CIE 15:2004, 3rd ed.)', src: 'CIE Central Bureau, Vienna', use: 'The 380–780 nm visible range and the eye’s sensitivity.' },
    upv3:      { kind: 'book',  au: 'Ling, S. J., Sanny, J., & Moebs, W.', y: '2016', t: 'University Physics, Volume 3. Chapter 6: Photons and Matter Waves', src: 'OpenStax, Rice University (free)', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-introduction', use: 'Photons, E = hc/λ, the Bohr model and the hydrogen series.' },
    chem2e:    { kind: 'book',  au: 'Flowers, P., Theopold, K., Langley, R., & Robinson, W. R.', y: '2019', t: 'Chemistry 2e. Chapter 6: Electronic Structure and Periodic Properties of Elements', src: 'OpenStax, Rice University (free)', url: 'https://openstax.org/books/chemistry-2e/pages/6-introduction', use: 'Quantised energy, line spectra, flame colours.' },
    astro2e:   { kind: 'book',  au: 'Fraknoi, A., Morrison, D., & Wolff, S. C.', y: '2022', t: 'Astronomy 2e. Chapter 5: Radiation and Spectra', src: 'OpenStax, Rice University (free)', url: 'https://openstax.org/books/astronomy-2e/pages/5-introduction', use: 'The three kinds of spectra, Kirchhoff’s laws, astronomical spectroscopy.' },
    griffiths: { kind: 'book',  au: 'Griffiths, D. J.', y: '2017', t: 'Introduction to Electrodynamics (4th ed.). Chapter 9: Electromagnetic Waves', src: 'Cambridge University Press', doi: '10.1017/9781108333511', use: 'Plane electromagnetic waves: E perpendicular to B, in phase, travelling at c.' },
    conkling:  { kind: 'book',  au: 'Conkling, J. A., & Mocella, C. J.', y: '2011', t: 'Chemistry of Pyrotechnics: Basic Principles and Theory (2nd ed.)', src: 'CRC Press, Boca Raton', doi: '10.1201/9781420018097' },
    steinhauser:{ kind: 'paper', au: 'Steinhauser, G., & Klapötke, T. M.', y: '2008', t: '“Green” pyrotechnics: A chemists’ challenge', src: 'Angewandte Chemie International Edition, 47(18), 3330–3347', doi: '10.1002/anie.200704510' },
    mayor:     { kind: 'paper', au: 'Mayor, M., & Queloz, D.', y: '1995', t: 'A Jupiter-mass companion to a solar-type star', src: 'Nature, 378, 355–359', doi: '10.1038/378355a0' },
    bohr:      { kind: 'paper', au: 'Bohr, N.', y: '1913', t: 'On the constitution of atoms and molecules', src: 'Philosophical Magazine, 26(151), 1–25', doi: '10.1080/14786441308634955', use: 'The original paper on the energy-level model of hydrogen.' },
    kirchhoff: { kind: 'paper', au: 'Kirchhoff, G., & Bunsen, R.', y: '1860', t: 'Chemische Analyse durch Spectralbeobachtungen', src: 'Annalen der Physik, 186(6), 161–189', doi: '10.1002/andp.18601860602', use: 'The work that founded elemental analysis by flame spectroscopy.' },
    gaydon:    { kind: 'book',  au: 'Gaydon, A. G.', y: '1974', t: 'The Spectroscopy of Flames (2nd ed.)', src: 'Chapman and Hall, London', doi: '10.1007/978-94-009-5720-6', use: 'Flame bands of CaOH, SrOH, BaOH, CuCl, CH and C₂ (Swan bands).' },
    lofthus:   { kind: 'paper', au: 'Lofthus, A., & Krupenie, P. H.', y: '1977', t: 'The spectrum of molecular nitrogen', src: 'Journal of Physical and Chemical Reference Data, 6(1), 113–307', doi: '10.1063/1.555546', use: 'The first negative system of N₂⁺ (391.4 and 427.8 nm) and the first positive system of N₂.' },
    slanger:   { kind: 'paper', au: 'Slanger, T. G., & Copeland, R. A.', y: '2003', t: 'Energetic oxygen in the upper atmosphere and the laboratory', src: 'Chemical Reviews, 103(12), 4731–4766', doi: '10.1021/cr0205311', use: 'The O(¹D) and O(¹S) states, the 557.7 / 630.0 nm lines and quenching.' },
    solomon:   { kind: 'paper', au: 'Solomon, S. C., Hays, P. B., & Abreu, V. J.', y: '1988', t: 'The auroral 6300 Å emission: Observations and modeling', src: 'Journal of Geophysical Research: Space Physics, 93(A9), 9867–9882', doi: '10.1029/JA093iA09p09867', use: 'Why the 630 nm red line only shines high up.' },
    fang:      { kind: 'paper', au: 'Fang, X., Randall, C. E., Lummerzheim, D., Wang, W., Lu, G., Solomon, S. C., & Frahm, R. A.', y: '2010', t: 'Parameterization of monoenergetic electron impact ionization', src: 'Geophysical Research Letters, 37(22), L22106', doi: '10.1029/2010GL045406', use: 'Electron stopping altitude versus energy (basis of the keV slider).' },
    rees:      { kind: 'book',  au: 'Rees, M. H.', y: '1989', t: 'Physics and Chemistry of the Upper Atmosphere', src: 'Cambridge University Press', doi: '10.1017/CBO9780511573118', use: 'Thermospheric structure, collisions and auroral emission.' },
    paschmann: { kind: 'book',  au: 'Paschmann, G., Haaland, S., & Treumann, R. (Eds.)', y: '2003', t: 'Auroral Plasma Physics', src: 'Springer (Space Sciences Series of ISSI, vol. 15)', doi: '10.1007/978-94-007-1086-3', use: 'Origin and acceleration of auroral electrons in the magnetosphere.' },
    baumjohann:{ kind: 'book',  au: 'Baumjohann, W., & Treumann, R. A.', y: '2012', t: 'Basic Space Plasma Physics (revised ed.)', src: 'Imperial College Press, London', doi: '10.1142/P850', use: 'The Lorentz force and gyration of particles around field lines.' },
    swpcAurora:{ kind: 'web',   au: 'NOAA Space Weather Prediction Center', y: 'accessed Nov. 2026', t: 'Aurora', src: 'swpc.noaa.gov', url: 'https://www.swpc.noaa.gov/phenomena/aurora', use: 'General knowledge about the aurora and aurora forecasting.' },
    swpcKp:    { kind: 'web',   au: 'NOAA Space Weather Prediction Center', y: 'accessed Nov. 2026', t: 'Planetary K-index', src: 'swpc.noaa.gov', url: 'https://www.swpc.noaa.gov/products/planetary-k-index', use: 'Definition and scale of the Kp index.' },
  };
  const REF_ORDER = Object.keys(refs);
  REF_ORDER.forEach((k, i) => { refs[k].id = k; refs[k].n = i + 1; });

  // ---------- Chỉ mục vạch phổ (dựng tự động) ----------
  const index = {};
  const put = (o) => { index[o.id] = Object.assign(index[o.id] || {}, o); };
  const lid = (sp, nm) => sp + '-' + nm.toFixed(1);

  for (const [sid, sp] of Object.entries(species)) {
    sp.id = sid;
    const L = {}; sp.levels.forEach((l) => (L[l.id] = l));
    for (const t of sp.trans) {
      if (t.nr) continue;
      t.id = lid(sid, t.nm);
      put({ id: t.id, sp: sid, nm: t.nm, w: 0, name: t.name, d: t.d, tr: L[t.u].t + ' → ' + L[t.l].t, src: 'NIST' });
    }
  }
  const addFlame = (sid, f) => {
    for (const ln of f.lines) {
      ln.id = lid(sid, ln.nm);
      const base = { id: ln.id, sp: sid, nm: ln.nm, w: ln.w || 0 };
      if (ln.mol) Object.assign(base, { mol: ln.mol, name: 'molecular band ' + ln.mol, d: ln.d || 'Emission band of the molecule ' + ln.mol + ' formed in the flame.', src: '≈' });
      else if (!index[ln.id]) Object.assign(base, { d: ln.d, src: 'NIST' });
      put(base);
    }
  };
  for (const [sid, f] of Object.entries(flame)) { f.id = sid; addFlame(sid, f); }
  addFlame('fuel', extra.fuel);
  for (const a of aurora) put({ id: a.id, alt: a.alt, aurora: true });

  AL.DATA = {
    species, flame, FLAME_ORDER, extra, aurora, terms, quiz, tips, index, refs, REF_ORDER,
    line: (id) => index[id],
    sp: (id) => species[id] || extra[id],
    lineId: lid,
  };
})();
