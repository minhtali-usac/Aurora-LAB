// TỰ SINH bởi tools/build-en.mjs — đừng sửa tay.
/* Aurora-LAB — USACodex: phần học thêm cho từng bài.
 *  try  : “Thử ngay” — hoạt động có hướng dẫn với chính mô phỏng của bài.
 *  myth : “Hiểu lầm thường gặp” — điều hay nghĩ sai và giải thích đúng.
 *  deep : “Tìm hiểu chuyên sâu” — kiến thức chi tiết, chia mục, mỗi mục ghi nguồn (khóa trong AL.DATA.refs).
 * Chỉ ghi những điều đã được kiểm chứng trong tài liệu đã dẫn. Công thức viết bằng LaTeX ($...$),
 * dùng String.raw để giữ nguyên dấu \ . */
(function () {
  'use strict';
  const R = String.raw;
  window.AL = window.AL || {};
  window.AL.CODEX_DEEP = {

    // 1 — Bước sóng, màu sắc và năng lượng photon
    wave: {
      try: [
        'Press “Hβ 486.1” then “Hα 656.3”: which wave is more tightly packed, and for which is the energy bar $E$ on the right taller?',
        'Press “UV 250” and “IR 1000”: both are outside the visible range, but how do their photon energies differ?',
        'Turn on “3D electromagnetic wave” and drag to rotate: are the electric field $\\vec E$ and magnetic field $\\vec B$ perpendicular?',
      ],
      myth: {
        wrong: 'Red is a “hot” colour, so red light carries more energy than blue light.',
        right: 'The opposite: each red photon carries less energy than a blue or violet one. In astronomy, hotter stars look blue-white and cooler stars orange-red. “Red means hot” is only a convention of art and daily life.',
        refs: ['astro2e'],
      },
      deep: [
        { h: 'Light is an electromagnetic wave', refs: ['griffiths', 'upv3'],
          p: [
            R`In 1865 James Clerk Maxwell showed that changing electric and magnetic fields can “feed” each other and travel as a wave. The calculated speed matched the measured speed of light, so he concluded that light is an electromagnetic wave. Around 1887–1888 Heinrich Hertz produced and detected electromagnetic waves in the laboratory, confirming the prediction.`,
            R`In a vacuum, every electromagnetic wave travels at the same speed $c = 299\,792\,458\ \mathrm{m/s}$ (an exact number, because the metre is defined from it). Wavelength $\lambda$ and frequency $f$ are related by $c = \lambda f$: the shorter the wavelength, the higher the frequency.`,
          ] },
        { h: 'The photon: a “packet” of light energy', refs: ['upv3', 'codata'],
          p: [
            R`In 1900 Max Planck had to assume that light energy is exchanged in small portions $E = hf$ to explain the radiation of hot bodies. In 1905 Albert Einstein went further: light really consists of particles of energy, now called photons, and he used the idea to explain the photoelectric effect.`,
            R`Combining the two relations: $E = hf = \dfrac{hc}{\lambda}$. With $hc \approx 1239.84\ \mathrm{eV\cdot nm}$ we get the quick rule $E\,(\mathrm{eV}) \approx \dfrac{1240}{\lambda\,(\mathrm{nm})}$. For example, the aurora’s green 557.7 nm photon carries $E \approx \dfrac{1240}{557.7} \approx 2.22\ \mathrm{eV}$.`,
          ] },
        { h: 'How does the human eye “read” colour?', refs: ['cie'],
          p: [
            'The retina has three kinds of cone cells, each most sensitive to one range of wavelengths (short, medium, long). The brain compares their signals to create the sensation of colour. So colour is the brain’s interpretation of wavelength; a wavelength itself has no “colour”.',
            'In daylight the eye is most sensitive near 555 nm (yellowish green); in the dark, when rod cells do most of the work, the peak shifts to about 507 nm. The 380–780 nm range is a common convention; at both ends the eye’s sensitivity drops very sharply.',
          ] },
        { h: 'Beyond the visible range', refs: ['astro2e'],
          p: [
            'Visible light is only a very narrow slice of the electromagnetic spectrum. Towards longer wavelengths lie infrared, microwaves and radio waves; towards shorter ones, ultraviolet, X-rays and gamma rays.',
            'The atmosphere blocks most gamma rays, X-rays and ultraviolet (the ozone layer strongly absorbs ultraviolet below about 300 nm). To observe the universe in these ranges, astronomers must put telescopes in space.',
          ] },
      ],
    },

    // 2 — Năng lượng bị lượng tử hóa
    absorb: {
      try: [
        'Press “600.0 nm”: is the photon absorbed? Why?',
        'Press 656.3 · 486.1 · 434.0 · 410.2 nm in turn and note which levels the electron jumps to.',
        'Drag the slider slowly around 656 nm: what happens when you are just slightly off 656.3 nm?',
      ],
      myth: {
        wrong: 'An atom takes a photon with more energy than ΔE, uses what it needs and “keeps” the rest.',
        right: 'For a transition between two energy levels, an atom only takes a photon whose energy is exactly ΔE (within a very narrow range). The only other case is a photon strong enough to pull the electron out of the atom entirely (ionisation): then the surplus becomes the kinetic energy of the escaping electron.',
        refs: ['upv3'],
      },
      deep: [
        { h: 'The Bohr model and the hydrogen formula', refs: ['bohr', 'upv3'],
          p: [
            R`In 1913 Niels Bohr proposed that the electron in hydrogen can only be at certain energy levels: $E_n = -\dfrac{13.6\ \mathrm{eV}}{n^2}$ with $n = 1, 2, 3, \dots$ The minus sign means the electron is “held” by the nucleus; pulling it infinitely far away costs energy.`,
            'The Bohr model explains hydrogen’s spectrum precisely but fails for atoms with many electrons. Quantum mechanics, developed later (from 1925–1926), describes every atom correctly and still gives the same energy formula for hydrogen.',
          ] },
        { h: 'The Rydberg formula: every hydrogen line', refs: ['upv3', 'codata'],
          p: [
            R`From the energy formula, the wavelength of the photon when an electron moves between levels $n_2$ and $n_1$ ($n_2 > n_1$) is: $$\frac{1}{\lambda} = R_\infty\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right),\qquad R_\infty \approx 1.097 \times 10^{7}\ \mathrm{m^{-1}}$$`,
            R`For example with $n_1 = 2$, $n_2 = 3$: $\dfrac{1}{\lambda} = R_\infty\left(\dfrac14 - \dfrac19\right)$, giving $\lambda \approx 656\ \mathrm{nm}$, the red Hα line. (More precise measurements differ slightly because the nucleus is not perfectly still and wavelengths in air are a little shorter than in vacuum.)`,
          ] },
        { h: 'When a photon is strong enough to free the electron', refs: ['upv3', 'nist'],
          p: [
            R`The ionisation energy of ground-state hydrogen is about 13.6 eV, matching $\lambda \approx \dfrac{1240}{13.6} \approx 91.2\ \mathrm{nm}$ (the Lyman limit). Any shorter wavelength can ionise the atom, so below 91.2 nm hydrogen absorbs continuously, not just at separate lines.`,
          ] },
        { h: 'Why are spectral lines not infinitely thin?', refs: ['astro2e'],
          p: [
            'Every line has a small width. Two common causes: atoms move randomly with heat, so their light is slightly Doppler-shifted (hotter gas, broader line); and collisions between atoms disturb the energy levels (denser gas, broader line). By measuring line widths astronomers estimate the temperature and pressure in stellar atmospheres.',
          ] },
      ],
    },

    // 3 — Phát xạ photon khi electron chuyển mức
    emit: {
      try: [
        'Drag the “Energy gap ΔE” slider from small to large: which way does the photon colour change?',
        'Press “Na 2.10 eV” then “N₂⁺ 2.90 eV”: work out $\\lambda \\approx 1240/\\Delta E$ and compare with the number on screen.',
        'Press the two O buttons (2.22 eV and 1.97 eV): these are the aurora’s green and red colours.',
      ],
      myth: {
        wrong: 'Electrons circle the nucleus in round orbits like planets around the Sun.',
        right: 'That is the picture of the Bohr model, very handy for visualising energy levels but not how things really are. In quantum mechanics an electron has no definite orbit; we only know the probability of finding it in each region around the nucleus (called an orbital). What remains true is that the electron’s energy can only take certain values.',
        refs: ['chem2e'],
      },
      deep: [
        { h: 'How long does an electron stay excited?', refs: ['nist', 'upv3'],
          p: [
            'For most “allowed” transitions, the excited state lasts only a few to tens of nanoseconds (1 ns = a billionth of a second) before emitting a photon. For example, sodium’s 3p level, the source of the yellow 589 nm line, lives about 16 ns.',
            'The NIST database gives each line a transition probability (in s⁻¹) that tells how fast the transition happens. The larger the value, the sooner the state shines.',
          ] },
        { h: 'Selection rules and “forbidden” lines', refs: ['chem2e', 'slanger'],
          p: [
            'Not every pair of levels connects easily. Conservation laws (especially of angular momentum, since a photon carries some) set selection rules. Transitions that break the usual rules can still happen, but millions of times more slowly or more; their lines are called forbidden lines.',
            'The aurora’s two main colours (oxygen’s 557.7 nm and 630.0 nm) are both forbidden lines: the states that emit them live about 0.7 s and 110 s. They are hard to see in laboratories on Earth because collisions take the energy before the light can come out.',
          ] },
        { h: 'Spontaneous and stimulated emission', refs: ['upv3'],
          p: [
            'When an electron drops by itself and emits a photon in a random direction, that is spontaneous emission, as in a flame or the aurora. In 1917 Einstein pointed out another route: a passing photon can “trigger” an excited atom to emit an identical photon (same wavelength, direction and phase). This stimulated emission is the principle of the laser.',
          ] },
      ],
    },

    // 4 — Các dãy phổ của hydrogen
    series: {
      try: [
        'Choose “Balmer”: count how many lines fall in the visible part of the spectrum.',
        'Switch to “Lyman” and then “Paschen”: where do the lines move relative to the visible range?',
        'In the Balmer series the lines crowd closer towards violet. Where do you think they stop?',
      ],
      myth: {
        wrong: 'Hydrogen has only 4 spectral lines: red, blue, indigo and violet.',
        right: 'Those four are only the easiest-to-see Balmer lines. In theory each series has infinitely many, ever closer, converging on a “series limit”. For Balmer it is near 365 nm, in the near ultraviolet. There are also the Lyman (ultraviolet), Paschen, Brackett… (infrared) series.',
        refs: ['upv3'],
      },
      deep: [
        { h: 'From a “guessed” formula to a theory', refs: ['upv3', 'bohr'],
          p: [
            'In 1885 Johann Balmer, a mathematics teacher, found a formula fitting hydrogen’s four visible lines without knowing why it worked. Johannes Rydberg generalised it a few years later. Theodore Lyman (ultraviolet) and Friedrich Paschen (infrared) then found new series, just as the formula predicted. Only in 1913 did the Bohr model explain where the formulas come from.',
          ] },
        { h: 'Hα: the pink-red of nebulae', refs: ['astro2e'],
          p: [
            'Around very hot young stars, ultraviolet light ionises hydrogen gas. When electrons recombine with protons they “climb down the ladder”, emitting many lines, with Hα 656.3 nm very strong. That is why images of emission nebulae such as the Orion Nebula (M42) often look pink-red.',
            'Hα filters are also used to observe the Sun’s chromosphere and prominences, structures that are almost invisible in white light.',
          ] },
        { h: 'Lyman α: the most important line, visible only from space', refs: ['astro2e', 'nist'],
          p: [
            'Lyman α (121.6 nm) is hydrogen’s strongest line, but Earth’s atmosphere absorbs it, so only space telescopes can see it. For very distant galaxies the line is redshifted by the expansion of the universe, sometimes right into the visible range, helping astronomers measure their distance.',
          ] },
      ],
    },

    // 5 — Quang phổ liên tục, phát xạ và hấp thụ
    spectra: {
      try: [
        'Choose “Glowing solid”: is any colour missing?',
        'Choose “Hot gas” and then “Cool gas in front of a source” for the same element: where are the bright and dark lines relative to each other?',
        'Switch between Hydrogen and Sodium: is the set of lines the same?',
      ],
      myth: {
        wrong: 'Dark lines in the solar spectrum are places with no light at all.',
        right: 'A dark line is only darker than its surroundings. The outer gas absorbs photons of exactly that wavelength and re-emits them in all directions, so much less of that light travels straight to us, but not zero.',
        refs: ['astro2e'],
      },
      deep: [
        { h: 'Fraunhofer lines: a mystery in sunlight', refs: ['astro2e', 'kirchhoff'],
          p: [
            'In 1814 Joseph von Fraunhofer, using a spectroscope of his own making, recorded the positions of more than 500 dark lines in the solar spectrum. He labelled the strongest with letters, such as the D line in the yellow. Nearly half a century later Kirchhoff and Bunsen showed that D coincides exactly with sodium’s emission line, meaning the Sun’s atmosphere contains sodium.',
          ] },
        { h: 'Kirchhoff’s three laws, explained by atoms', refs: ['astro2e'],
          p: [
            'In solids or very dense gases, atoms interact strongly and energy levels merge into continuous bands, so a hot object emits every wavelength. In a thin gas each atom stands almost alone, keeping its own set of levels, so it only emits or absorbs at specific wavelengths. An element’s emission and absorption lines coincide because both come from the same pairs of levels.',
          ] },
        { h: 'The colour and temperature of stars', refs: ['astro2e', 'codata'],
          p: [
            R`The continuous part of a star’s spectrum resembles the radiation of an ideal hot body (a blackbody). The brightest wavelength follows Wien’s law: $$\lambda_{\max} = \frac{b}{T},\qquad b \approx 2.898 \times 10^{-3}\ \mathrm{m\cdot K}$$`,
            R`For the Sun, the effective surface temperature is about $T \approx 5772\ \mathrm{K}$, giving $\lambda_{\max} \approx 500\ \mathrm{nm}$. Hotter stars peak at shorter wavelengths and look blue-white; cooler stars look orange-red.`,
          ] },
        { h: 'What are stars made of?', refs: ['astro2e'],
          p: [
            'In 1925 Cecilia Payne analysed stellar spectra and showed that stars are made mostly of hydrogen and helium, contrary to the view of the time. Today this is basic knowledge: most ordinary matter in stars is hydrogen and helium, with other elements only a small fraction.',
          ] },
      ],
    },

    // 6 — Vạch nguyên tử và dải phân tử
    bands: {
      try: [
        'Set the slider to 0 (an atom): how many lines are there?',
        'Increase the number of vibrational levels: how do the lines change, and when do they start to look like a “band”?',
        'Open the Flame experiment, choose Sr then Li, and look through the spectroscope to compare real bands and lines.',
      ],
      myth: {
        wrong: 'The colour of a metal salt flame comes entirely from metal atoms.',
        right: 'For sodium, lithium and potassium it is indeed mostly atoms. But for calcium, strontium, barium and copper, most of the light we see comes from small molecules formed in the flame, such as CaOH, SrOH, BaCl and CuCl. That is why their spectra show broad bands, not only thin lines.',
        refs: ['gaydon'],
      },
      deep: [
        { h: 'Three “layers” of molecular energy', refs: ['gaydon', 'chem2e'],
          p: [
            'A molecule’s energy has three parts of very different sizes: electronic energy (a few eV, as in atoms), vibration of the atoms within the molecule (typically about a tenth of an eV) and rotation of the whole molecule (smaller still, about a thousandth of an eV).',
            'Every electronic transition therefore comes with changes in vibration and rotation. Instead of one line we get very many lines packed together. A simple spectroscope cannot separate them, so we see a band of light, often with one sharp edge called the band head.',
          ] },
        { h: 'The Swan bands of C₂: from candles to comets', refs: ['gaydon'],
          p: [
            'The blue at the base of a gas burner, stove or candle flame comes mainly from CH radicals and C₂ molecules. The C₂ bands are called the Swan bands, after the physicist William Swan, who described them in the mid-19th century. The same bands appear in the spectra of many comet heads and give them their green colour.',
          ] },
        { h: 'Why do molecular bands matter?', refs: ['gaydon', 'astro2e'],
          p: [
            'In flames, planetary atmospheres and cool stars, molecules can survive without breaking apart. Recognising their bands tells scientists which molecules are there and at what temperature, because the intensity pattern within a band depends on temperature.',
          ] },
      ],
    },

    // 7 — Trạng thái giả bền và dập tắt do va chạm
    quench: {
      try: [
        'Drag the “Gas density” slider towards thin gas (≈ 300 km): do both lines shine?',
        'Drag towards dense gas: which line fades first? Does it have a long or a short lifetime?',
        'Open the Aurora experiment and lower the electron energy to test your prediction.',
      ],
      myth: {
        wrong: 'The aurora is red on top and green below because of temperature differences with altitude.',
        right: 'Temperature does not decide the colour. It depends on which gas is excited, to which state, and whether that state can shine before a collision. High up, thin gas lets oxygen’s long-lived ¹D state glow red; lower down, only the shorter-lived ¹S state still manages to emit green.',
        refs: ['slanger', 'rees'],
      },
      deep: [
        { h: 'Two deciding numbers: lifetime and collision rate', refs: ['slanger', 'nist'],
          p: [
            R`Every excited state has a characteristic lifetime $\tau$. For atomic oxygen, the $^{1}\mathrm{S}$ state (emitting 557.7 nm) has $\tau$ of about 0.7–0.8 s, while the $^{1}\mathrm{D}$ state (630.0 and 636.4 nm) has $\tau$ of about 110 s.`,
            R`Let $\nu$ be the number of collisions an atom has per second. If $\nu\tau$ is much less than 1, the atom usually manages to shine; if $\nu\tau$ is much greater than 1, it is almost certainly quenched first. The denser the gas, the larger $\nu$.`,
          ] },
        { h: 'How quickly does the atmosphere thin out?', refs: ['rees'],
          p: [
            'Air density falls very fast with height: at about 100 km it is only around a millionth of that at the ground, and by about 300 km it is thinner again by thousands to tens of thousands of times. So an atom’s collision rate drops from roughly thousands per second near 100 km to less than about one per second a few hundred kilometres up. That is why a state that “waits 110 seconds” only survives very high up.',
          ] },
        { h: 'Who “steals” the energy?', refs: ['slanger', 'solomon'],
          p: [
            R`Oxygen’s $^{1}\mathrm{D}$ state is quenched mainly by collisions with N₂, also with O₂ and O atoms. The $^{1}\mathrm{S}$ state is strongly quenched by O₂ and atomic O, so the green line also weakens below about 100 km. Models built on these processes match the measured auroral red line intensity well.`,
          ] },
        { h: 'The same lines, even without an aurora', refs: ['slanger'],
          p: [
            'The night sky is never completely dark. Chemical reactions in the upper atmosphere also produce excited oxygen, which emits very faint 557.7 nm and 630.0 nm lines all over the globe. This is airglow; photos from the International Space Station often show it as a thin green rim around Earth.',
          ] },
      ],
    },

    // 8 — Hạt mang điện trong từ trường Trái Đất
    field: {
      try: [
        'Choose “No magnetic field”: where do the particles go?',
        'Choose “With magnetic field” again: where on Earth do particles come down?',
        'Open the Aurora experiment, raise “Solar activity” and watch the Kp index change.',
      ],
      myth: {
        wrong: 'The aurora is sunlight reflected off polar ice and snow.',
        right: 'The aurora is light emitted by the gas of the upper atmosphere itself when energetic electrons hit it, at about 90–300 km or higher. It has nothing to do with ice, and its spectrum consists of specific oxygen and nitrogen lines, quite unlike reflected sunlight.',
        refs: ['swpcAurora', 'rees'],
      },
      deep: [
        { h: 'The Lorentz force and spiral motion', refs: ['baumjohann'],
          p: [
            R`A particle of charge $q$ moving with velocity $\vec v$ in a magnetic field $\vec B$ feels the Lorentz force $\vec F = q\,\vec v \times \vec B$. The force is always perpendicular to the velocity, so it neither speeds up nor slows the particle, only bends its path. The result: the particle circles a field line while sliding along it, tracing a spiral.`,
            R`The gyroradius is $r = \dfrac{m v_\perp}{|q|B}$. For a 1 keV electron in a field of about $5 \times 10^{-5}\ \mathrm{T}$ (roughly the field near the ground at the poles), it is only a few metres. So the electron is almost “tied” to the field line.`,
          ] },
        { h: 'Magnetic mirrors and radiation belts', refs: ['baumjohann'],
          p: [
            'As a particle approaches the poles, the field lines converge and the field strengthens. A strengthening field can turn the particle back like a mirror, so many particles are “trapped”, bouncing between hemispheres. This is how the Van Allen radiation belts, discovered by the Explorer 1 satellite in 1958, hold their particles. Only particles moving nearly along the field line reach air dense enough to make an aurora.',
          ] },
        { h: 'The auroral oval', refs: ['paschmann', 'swpcAurora'],
          p: [
            'The aurora does not appear right at the pole but concentrates on an oval ring around each magnetic pole, the auroral oval. In normal conditions it lies at high geomagnetic latitudes (about 65–70°), over places such as northern Norway, Iceland, Alaska and northern Canada. The electrons behind bright discrete arcs are usually accelerated to a few thousand eV a few thousand kilometres up, before plunging into the atmosphere.',
          ] },
        { h: 'Geomagnetic storms and the Kp index', refs: ['swpcKp', 'swpcAurora'],
          p: [
            'When the Sun hurls large clouds of plasma (coronal mass ejections) towards Earth, the magnetosphere is compressed and receives a great deal of energy, causing a geomagnetic storm. The auroral oval then brightens and spreads towards the equator, so the aurora can be seen at much lower latitudes than usual.',
            'The Kp index (0 to 9), measured by ground magnetometers, shows how disturbed Earth’s magnetic field is in each 3-hour period. NOAA uses it in its G1–G5 storm scale and in aurora forecasts.',
          ] },
      ],
    },
  };
})();
