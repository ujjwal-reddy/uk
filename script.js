/* =========================================================================
   CE² — Carbon Earth Environment Private Limited
   script.js — Three.js scene, scroll-driven camera journey, particle
   systems, projected 3D hotspots and data-driven modals.
   ========================================================================= */
(function () {
  'use strict';

  /* =======================================================================
     0. UTILITIES
     ===================================================================== */
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var clamp  = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var lerp   = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var damp   = function (a, b, l, dt) { return lerp(a, b, 1 - Math.exp(-l * dt)); };

  var IS_TOUCH  = window.matchMedia('(hover: none)').matches;
  var IS_SMALL  = window.matchMedia('(max-width: 780px)').matches;
  var REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP  = typeof window.gsap !== 'undefined';

  /* =======================================================================
     1. CONTENT — DPR DATASETS
     ===================================================================== */

  /** The six stages of the CE² Integrated Biomass Pyrolysis Unit. */
  var PROCESS = [
    {
      id: 'feedstock',
      tag: 'Stage 01 · Inbound',
      title: 'Feedstock Collection',
      sub: 'Reciprocal Sourcing',
      short: 'Invasive Juliflora, bamboo, groundnut shells and cotton stems are collected free of cost from surrounding villages — paid for not in cash, but in cheap smokeless briquettes returned to the same households.',
      lede: 'CE² does not buy biomass. It trades for it. Rural households and farms hand over residue that today is burned in the open, and receive back a clean, low-cost cooking fuel made from it. The feedstock cost line goes to zero and the village gains a smokeless kitchen.',
      metrics: [
        { v: '~378 t', l: 'Feedstock / month' },
        { v: '₹0', l: 'Raw material cost' },
        { v: '4', l: 'Primary streams' }
      ],
      blocks: [
        { h: 'Feedstock streams', items: [
          '<b>Prosopis juliflora</b> — invasive, groundwater-depleting scrub cleared from fallow and grazing land; removal is itself a restoration act.',
          '<b>Bamboo</b> — offcuts, culm waste and plantation thinnings with high fixed-carbon yield.',
          '<b>Groundnut shells</b> — the defining residue of the Anantapur belt, otherwise heaped and burned.',
          '<b>Cotton stems</b> — woody post-harvest stalks, a major open-burning source across the district.'
        ]},
        { h: 'The reciprocal exchange', items: [
          'Villages supply residue at zero cost and take back smokeless briquettes at a domestic price of <b>₹4/kg</b>.',
          'Household smoke exposure falls; open-field burning stops at the source.',
          'Collection routes double as CE² extension contact for biochar demonstration plots.',
          'Every tonne diverted from open burning is a tonne available for permanent carbon storage.'
        ]}
      ]
    },
    {
      id: 'pyrolysis',
      tag: 'Stage 02 · Conversion',
      title: 'Closed-Loop Pyrolysis',
      sub: '6 Kilns × 3 Tonne',
      short: 'Six three-tonne kilns process roughly 378 t/month of feedstock in an oxygen-starved, closed-loop configuration — syngas is captured and burned back as process heat, with zero-liquid discharge recovery on the condensate line.',
      lede: 'The thermal core of the plant. Biomass is heated in the near-absence of oxygen so it cannot combust; instead it fractures into a solid carbon skeleton, a combustible gas and a condensable vapour. CE² keeps all three inside the boundary.',
      metrics: [
        { v: '6 × 3 t', l: 'Kiln configuration' },
        { v: '~378 t', l: 'Throughput / month' },
        { v: 'ZLD', l: 'Liquid discharge' }
      ],
      blocks: [
        { h: 'Closed-loop design', items: [
          '<b>Syngas capture</b> — non-condensable gases are routed back to the kiln burners, so the reaction sustains its own process heat after start-up.',
          '<b>Zero-liquid discharge</b> — condensate is recovered as saleable co-products instead of being released; nothing enters the local water table.',
          '<b>Emission control</b> — closed kilns replace open burning, converting an uncontrolled release into a captured, measurable stream.',
          '<b>Batch traceability</b> — each kiln batch is logged for feedstock type, residence time and yield, feeding the MRV chain downstream.'
        ]},
        { h: 'Output split per cycle', items: [
          'Solid fraction → <b>biochar</b> for crop-specific inoculation and durable carbon storage.',
          'Solid fraction → <b>charcoal fines</b> densified into briquettes.',
          'Condensable vapour → <b>wood vinegar</b> and <b>wood tar oil</b>.',
          'Non-condensable gas → <b>process heat</b>, displacing external fuel.'
        ]}
      ]
    },
    {
      id: 'biochar',
      tag: 'Stage 03 · Soil',
      title: 'Crop-Specific Biochar',
      sub: 'Inoculation & Enrichment',
      short: '30 t/month of biochar is charged with manure, wood ash (K), bone meal (P) and a micronutrient pack (Fe, Zn, B, Mg), then formulated per crop — Mosambi, Banana, Pomegranate and Groundnut.',
      lede: 'Raw biochar is a porous carbon skeleton — enormous surface area, but nutritionally empty. CE² inoculates it before it ever reaches a field, so the char arrives pre-charged rather than stripping nutrients from the soil in its first season.',
      metrics: [
        { v: '30 t', l: 'Biochar / month' },
        { v: '4', l: 'Crop formulations' },
        { v: '4+', l: 'Micronutrients' }
      ],
      blocks: [
        { h: 'Inoculation charge', items: [
          '<b>Farmyard manure</b> — seeds the pore network with live microbial consortia and labile organic carbon.',
          '<b>Wood ash (K)</b> — potassium plus a liming effect that directly counters fertilizer-driven acidification.',
          '<b>Bone meal (P)</b> — slow-release phosphorus held in the char matrix against fixation and runoff.',
          '<b>Micronutrients (Fe, Zn, B, Mg)</b> — the deficiencies that limit yield on degraded Anantapur soils.'
        ]},
        { h: 'Crop-specific formulations', items: [
          '<b>Mosambi (sweet lime)</b> — Zn and Fe weighted, pH-buffered for citrus in high-carbonate irrigation water.',
          '<b>Banana</b> — K-dominant with high moisture-retention loading for a heavy-feeding, water-hungry crop.',
          '<b>Pomegranate</b> — B and Ca emphasis to support fruit set and reduce cracking on stressed orchards.',
          '<b>Groundnut</b> — Ca and P weighted for pod fill, with structure improvement for pegging in hard-set soils.'
        ]},
        { h: 'Soil chemistry response', items: [
          'Salinity buffered — char porosity holds and dilutes salts carried in deep-borewell irrigation water.',
          'Acidification reversed — ash alkalinity raises pH toward the crop optimum.',
          'Water-holding capacity raised on sandy red soils, stretching a 522 mm rainfall budget further.',
          'Cation exchange capacity increased, so applied nutrients stay in the root zone instead of leaching.'
        ]}
      ]
    },
    {
      id: 'briquettes',
      tag: 'Stage 04 · Fuel',
      title: 'Smokeless Charcoal Briquettes',
      sub: 'Pillow · Hexagon · Honeycomb',
      short: '50 t/month of charcoal fines densified into three profiles — 20 t at a domestic price of ₹4/kg to feedstock-supplying villages, and 30 t into the commercial market at ₹35/kg.',
      lede: 'The briquette line is what makes the reciprocal model work. It converts the fine fraction of the char into a product the supplying village actually wants, while a commercial grade carries the revenue.',
      metrics: [
        { v: '50 t', l: 'Briquettes / month' },
        { v: '₹4 / kg', l: 'Domestic — 20 t' },
        { v: '₹35 / kg', l: 'Commercial — 30 t' }
      ],
      blocks: [
        { h: 'Product profiles', items: [
          '<b>Pillow</b> — general-purpose domestic and barbecue format, high packing density for transport.',
          '<b>Hexagon</b> — extruded commercial bar with a long, even burn for hospitality and industrial heat.',
          '<b>Honeycomb</b> — perforated block for controlled airflow in traditional stoves and continuous burners.'
        ]},
        { h: 'Market split', items: [
          '<b>20 t/month domestic @ ₹4/kg</b> — deliberately priced at cost for the villages supplying feedstock; the return leg of the reciprocal exchange.',
          '<b>30 t/month commercial @ ₹35/kg</b> — hotels, restaurants, barbecue retail and industrial users; carries the margin.',
          'Smokeless combustion removes the indoor air-quality burden of raw wood and dung cake.',
          'Displaces both fuelwood harvesting and open residue burning in the same transaction.'
        ]}
      ]
    },
    {
      id: 'coproducts',
      tag: 'Stage 05 · Recovery',
      title: 'Co-Products Recovery',
      sub: 'Wood Vinegar & Tar Oil',
      short: 'Condensate recovery yields ~13,608 L/month of wood vinegar as an organic bio-stimulant and ~2,520 kg/month of wood tar oil — the fractions that open burning simply loses to the sky.',
      lede: 'The vapour stream is where most pyrolysis operations lose value and create a discharge problem. CE² condenses and separates it into two saleable products, closing the liquid loop.',
      metrics: [
        { v: '~13,608 L', l: 'Wood vinegar / month' },
        { v: '~2,520 kg', l: 'Wood tar oil / month' },
        { v: '0 L', l: 'Effluent discharged' }
      ],
      blocks: [
        { h: 'Wood vinegar (pyroligneous acid)', items: [
          'Applied dilute as an <b>organic bio-stimulant</b> and foliar tonic — germination, rooting and vigour.',
          'Acts as a natural pest and fungal deterrent, reducing synthetic pesticide load.',
          'Pairs with CE² biochar as a combined soil-and-foliar programme sold into the same farm.',
          'Recovery of <b>~13,608 L/month</b> turns a waste condensate into a second agricultural revenue line.'
        ]},
        { h: 'Wood tar oil', items: [
          '<b>~2,520 kg/month</b> recovered as a heavy fraction from the same condenser train.',
          'Industrial applications: timber preservation, anti-corrosive coating and binder feedstock.',
          'Removing it from the effluent path is what makes zero-liquid discharge achievable.',
          'Optional internal use as supplementary kiln fuel during cold start-up.'
        ]}
      ]
    },
    {
      id: 'mrv',
      tag: 'Stage 06 · Carbon',
      title: 'Digital MRV & Carbon Credits',
      sub: 'Isometric Registry',
      short: 'Registry-verified durable carbon dioxide removal is issued on soil-applied biochar only — approximately 140 tCO₂e per month, measured, reported and verified through a digital chain of custody.',
      lede: 'Carbon revenue is claimed on the fraction that is genuinely permanent: char that goes into the ground and stays there. Fuel products are excluded from the removal claim, which is what makes the credit defensible.',
      metrics: [
        { v: '~140 tCO₂e', l: 'Removal / month' },
        { v: 'Isometric', l: 'Registry' },
        { v: 'Soil-applied', l: 'Eligible basis' }
      ],
      blocks: [
        { h: 'Measurement, reporting, verification', items: [
          '<b>Feedstock logging</b> — species, mass and origin village recorded at intake.',
          '<b>Batch records</b> — kiln, temperature regime and residence time per production cycle.',
          '<b>Product characterisation</b> — carbon fraction and stability testing on the biochar output.',
          '<b>Application evidence</b> — geotagged field records proving soil application, the only credited pathway.'
        ]},
        { h: 'Why it is durable', items: [
          'Pyrolysed carbon resists microbial decomposition on a century-to-millennium residence time.',
          'The same tonne delivers removal <i>and</i> agronomic benefit — the farmer is paid twice over.',
          'Registry-grade documentation supports credit issuance under the <b>Isometric</b> protocol.',
          'Approximately <b>140 tCO₂e per month</b> of durable removal at current single-unit capacity.'
        ]}
      ]
    }
  ];

  /** The three CE² Future Horizons restoration pathways. */
  var HORIZONS = [
    {
      id: 'agroforestry',
      icon: '🌳',
      tag: 'Horizon 01',
      title: 'Agroforestry & Tree Care',
      sub: 'Multi-tier afforestation',
      short: 'Multi-tier afforestation on degraded agricultural land — native species selection, establishment support and long-term canopy health management rather than one-off planting drives.',
      lede: 'A planted sapling is not a carbon sink; a surviving canopy is. CE² treats afforestation as a maintenance commitment, pairing native multi-tier planting with the biochar and bio-stimulant programme that keeps the trees alive through the dry years.',
      kpis: ['Native species', 'Multi-tier canopy', 'Long-term care'],
      metrics: [
        { v: 'Multi-tier', l: 'Planting structure' },
        { v: 'Native', l: 'Species policy' },
        { v: 'Ongoing', l: 'Canopy maintenance' }
      ],
      blocks: [
        { h: 'How it is executed', items: [
          '<b>Site diagnosis</b> — degraded, saline or abandoned agricultural parcels mapped and soil-tested first.',
          '<b>Multi-tier design</b> — canopy, sub-canopy, shrub and ground layers so the system holds soil and moisture together.',
          '<b>Native species</b> — drought-adapted local species over fast-growing exotics that fail in a 522 mm rainfall regime.',
          '<b>Establishment support</b> — CE² biochar at the planting pit and wood vinegar through the first seasons.'
        ]},
        { h: 'Why maintenance is the product', items: [
          'Survival and canopy health are tracked over years, not counted at planting.',
          'Standing biomass is the fastest natural sink available at landscape scale.',
          'Shade and litter fall rebuild topsoil on parcels written off as unfarmable.',
          'Juliflora clearance from the same landscapes frees the land and feeds the kilns.'
        ]}
      ]
    },
    {
      id: 'erw',
      icon: '⛰️',
      tag: 'Horizon 02',
      title: 'Enhanced Rock Weathering',
      sub: 'Crushed basalt on cropland',
      short: 'Spreading finely crushed basalt and silicate rock across cropland, permanently trapping atmospheric CO₂ through accelerated chemical weathering while raising soil pH and base saturation.',
      lede: 'ERW takes a reaction the planet already runs over geological time and compresses it into an agricultural season. Crushed silicate rock on a field dissolves in rainwater and soil acids, converting dissolved CO₂ into stable bicarbonate — a removal measured in millennia.',
      kpis: ['Basalt / silicate', 'Permanent storage', 'Yield co-benefit'],
      metrics: [
        { v: 'Geological', l: 'Storage durability' },
        { v: 'Cropland', l: 'Application surface' },
        { v: 'pH ↑', l: 'Agronomic co-benefit' }
      ],
      blocks: [
        { h: 'The mechanism', items: [
          'Rainwater and soil CO₂ form a weak acid that dissolves crushed <b>basalt and silicate</b> minerals.',
          'The reaction converts dissolved CO₂ into <b>stable bicarbonate</b>, carried to groundwater and ultimately the ocean.',
          'Storage is geological in duration — not subject to fire, tillage or land-use reversal.',
          'Fine grinding raises reactive surface area so the weathering completes on an agricultural timescale.'
        ]},
        { h: 'Why it fits Anantapur', items: [
          'Directly counteracts <b>acidification</b> from long-term chemical fertilizer use.',
          'Releases Ca, Mg, K and Si — exactly the base cations these degraded soils have lost.',
          'Applied with existing farm machinery on land already under cultivation; no land-use change.',
          'Stacks cleanly with biochar: char holds water and nutrients, rock supplies the mineral base.'
        ]}
      ]
    },
    {
      id: 'coastal',
      icon: '🪸',
      tag: 'Horizon 03',
      title: 'Coastal & Coral Restoration',
      sub: 'Blue carbon systems',
      short: 'Mangrove ecosystem protection, ocean alkalinity enhancement and coral reef restoration along the coastline — the highest-density carbon sinks available and the frontline of coastal protection.',
      lede: 'Blue carbon systems store carbon per hectare at multiples of terrestrial forest, and protect the coastline while doing it. CE² extends the restoration programme from the dry interior to the shore.',
      kpis: ['Mangroves', 'Ocean alkalinity', 'Coral reefs'],
      metrics: [
        { v: 'Mangrove', l: 'Blue carbon core' },
        { v: 'Alkalinity', l: 'Ocean CDR pathway' },
        { v: 'Reef', l: 'Biodiversity anchor' }
      ],
      blocks: [
        { h: 'Three coastal pathways', items: [
          '<b>Mangrove protection & replanting</b> — dense below-ground carbon storage plus storm-surge and erosion defence for coastal villages.',
          '<b>Ocean alkalinity enhancement</b> — raising seawater alkalinity so the ocean absorbs and durably retains additional atmospheric CO₂.',
          '<b>Coral reef restoration</b> — substrate stabilisation and coral propagation to rebuild reef structure and the fisheries that depend on it.'
        ]},
        { h: 'Community and monitoring', items: [
          'Coastal communities are engaged as custodians on the same reciprocal logic used inland.',
          'Restoration sites are monitored for survival, cover and carbon accumulation over time.',
          'Reef and mangrove recovery restores local fisheries — an immediate livelihood return.',
          'Extends CE² from a single-district facility to a landscape-and-seascape carbon programme.'
        ]}
      ]
    }
  ];

  /* =======================================================================
     2. DOM CONSTRUCTION
     ===================================================================== */
  var loaderEl  = $('#loader');
  var fillEl    = $('#loaderFill');
  var pctEl     = $('#loaderPct');
  var msgEl     = $('#loaderMsg');
  var hotspotEl = $('#hotspots');

  $('#year').textContent = new Date().getFullYear();

  /* --- process step cards ------------------------------------------------ */
  var stepsHost = $('#steps');
  PROCESS.forEach(function (p, i) {
    var chips = p.metrics.map(function (m) {
      return '<span class="chip"><b>' + m.v + '</b> ' + m.l + '</span>';
    }).join('');
    var sec = document.createElement('div');
    sec.className = 'step';
    sec.dataset.step = String(i);
    sec.innerHTML =
      '<article class="step__card" data-open="process" data-index="' + i + '" tabindex="0" role="button">' +
        '<div class="step__top">' +
          '<span class="step__num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="step__tag">' + p.tag + '</span>' +
        '</div>' +
        '<h3>' + p.title + '</h3>' +
        '<p>' + p.short + '</p>' +
        '<div class="step__chips">' + chips + '</div>' +
        '<span class="step__more">Open technical data</span>' +
      '</article>';
    stepsHost.appendChild(sec);
  });

  /* --- horizon cards ----------------------------------------------------- */
  var horizonHost = $('#horizonGrid');
  HORIZONS.forEach(function (h, i) {
    var kpis = h.kpis.map(function (k) { return '<span class="chip">' + k + '</span>'; }).join('');
    var card = document.createElement('article');
    card.className = 'horizon reveal';
    card.setAttribute('data-open', 'horizon');
    card.setAttribute('data-index', String(i));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.innerHTML =
      '<div class="horizon__glow"></div>' +
      '<div class="horizon__icon">' + h.icon + '</div>' +
      '<p class="eyebrow eyebrow--good">' + h.tag + '</p>' +
      '<h3>' + h.title + '</h3>' +
      '<p>' + h.short + '</p>' +
      '<div class="horizon__kpis">' + kpis + '</div>' +
      '<span class="step__more">Open detail</span>';
    horizonHost.appendChild(card);
  });

  /* --- projected 3D hotspot markers -------------------------------------- */
  var markers = [];
  function buildMarker(label, index, kind, dataIndex, cyan) {
    var b = document.createElement('button');
    b.className = 'hs' + (cyan ? ' hs--cyan' : '');
    b.type = 'button';
    b.setAttribute('data-open', kind);
    b.setAttribute('data-index', String(dataIndex));
    b.innerHTML =
      '<span class="hs__ring">' + index + '</span>' +
      '<span class="hs__label">' + label + '</span>';
    hotspotEl.appendChild(b);
    return b;
  }
  PROCESS.forEach(function (p, i) {
    markers.push({ el: buildMarker(p.title, String(i + 1).padStart(2, '0'), 'process', i, false), group: 'plant', i: i });
  });
  HORIZONS.forEach(function (h, i) {
    markers.push({ el: buildMarker(h.title, 'H' + (i + 1), 'horizon', i, true), group: 'horizon', i: i });
  });

  /* =======================================================================
     3. MODAL
     ===================================================================== */
  var modal      = $('#modal');
  var mIdx       = $('#modalIdx');
  var mKicker    = $('#modalKicker');
  var mTitle     = $('#modalTitle');
  var mLede      = $('#modalLede');
  var mMetrics   = $('#modalMetrics');
  var mBody      = $('#modalBody');
  var mPrev      = $('#modalPrev');
  var mNext      = $('#modalNext');
  var modalState = { set: null, index: 0, open: false };
  var lastFocus  = null;

  function renderModal(setName, index) {
    var data = setName === 'horizon' ? HORIZONS : PROCESS;
    index = clamp(index, 0, data.length - 1);
    var d = data[index];

    modalState.set = setName;
    modalState.index = index;

    mIdx.textContent    = setName === 'horizon' ? 'H' + (index + 1) : String(index + 1).padStart(2, '0');
    mKicker.textContent = d.tag + ' · ' + d.sub;
    mTitle.textContent  = d.title;
    mLede.textContent   = d.lede;

    mMetrics.innerHTML = d.metrics.map(function (m) {
      return '<div class="metric"><b>' + m.v + '</b><span>' + m.l + '</span></div>';
    }).join('');

    mBody.innerHTML = d.blocks.map(function (b) {
      return '<h4>' + b.h + '</h4><ul>' +
        b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul>';
    }).join('');

    mPrev.disabled = index === 0;
    mNext.disabled = index === data.length - 1;

    // keep the 3D scene in sync with whatever the reader is looking at
    if (setName === 'process') setActiveHotspot('plant', index);
    else setActiveHotspot('horizon', index);
  }

  function openModal(setName, index, trigger) {
    lastFocus = trigger || document.activeElement;
    renderModal(setName, index);
    modal.hidden = false;
    modalState.open = true;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    setTimeout(function () { $('.modal__x').focus(); }, 60);
  }

  function closeModal() {
    if (!modalState.open) return;
    modalState.open = false;
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { modal.hidden = true; }, 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function stepModal(dir) {
    var data = modalState.set === 'horizon' ? HORIZONS : PROCESS;
    var next = clamp(modalState.index + dir, 0, data.length - 1);
    if (next !== modalState.index) renderModal(modalState.set, next);
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest ? e.target.closest('[data-open]') : null;
    if (opener) {
      openModal(opener.getAttribute('data-open'), parseInt(opener.getAttribute('data-index'), 10) || 0, opener);
      return;
    }
    if (e.target.closest && e.target.closest('[data-close]')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeMenu(); }
    if (!modalState.open) return;
    if (e.key === 'ArrowRight') stepModal(1);
    if (e.key === 'ArrowLeft')  stepModal(-1);
  });

  // keyboard activation for the card "buttons"
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (t && t.hasAttribute && t.hasAttribute('data-open')) {
      e.preventDefault();
      openModal(t.getAttribute('data-open'), parseInt(t.getAttribute('data-index'), 10) || 0, t);
    }
  });

  mPrev.addEventListener('click', function () { stepModal(-1); });
  mNext.addEventListener('click', function () { stepModal(1); });

  /* =======================================================================
     4. NAV, MENU, REVEALS, COUNTERS
     ===================================================================== */
  var nav      = $('#nav');
  var burger   = $('#burger');
  var navLinks = $('.nav__links');

  function closeMenu() {
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu();
      var el = document.getElementById(a.getAttribute('data-jump'));
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  // reveal-on-enter
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(function (el) { revealObs.observe(el); });

  // hero counters
  function runCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var t0 = performance.now(), dur = 1500;
      (function tick(now) {
        var p = clamp((now - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* --- active step tracking --------------------------------------------- */
  var activeStep = -1;
  var stepEls = $$('.step');
  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-live');
        activeStep = parseInt(en.target.dataset.step, 10);
        setActiveHotspot('plant', activeStep);
      } else {
        en.target.classList.remove('is-live');
      }
    });
  }, { threshold: 0.5 });
  stepEls.forEach(function (el) { stepObs.observe(el); });

  function setActiveHotspot(group, i) {
    markers.forEach(function (m) {
      m.el.classList.toggle('is-active', m.group === group && m.i === i);
    });
  }

  /* =======================================================================
     5. THREE.JS SCENE
     ===================================================================== */
  /** Minimal x/y/z vector. Scene state must exist before — and survive
      without — Three.js, so nothing at module scope may touch THREE. */
  function V3(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
  V3.prototype.set  = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
  V3.prototype.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };

  var canvas = $('#webgl');
  var scene, camera, renderer, clock;
  var earthGroup, plantGroup, horizonGroup, starField;
  var globePoints, smogPoints, healPoints, atmosphere, earthCore, earthWire, regionPin;
  var kilns = [], plantRing, plantSpin, plantCore;
  var processNodes = [], horizonNodes = [];
  var raycaster, pointer, projected, tmpV;
  var running = false;

  // live scene state driven by scroll
  var state = {
    pollution: 0.55,
    restoration: 0.0,
    plant: 0.0,
    earthScale: 1.0,
    earthPos:  new V3(0, 0, 0),
    camPos:    new V3(0, 0.6, 13),
    camTarget: new V3(0, 0, 0)
  };
  var target = {
    pollution: 0.55, restoration: 0, plant: 0, earthScale: 1,
    earthPos:  new V3(0, 0, 0),
    camPos:    new V3(0, 0.6, 13),
    camTarget: new V3(0, 0, 0)
  };

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  /* --- helpers ----------------------------------------------------------- */
  /** Three.js convention: point size is in world units, scaled by half the
      viewport height. Keeping it a uniform holds particles visually constant
      across screen sizes instead of baking in one resolution. */
  var pointMaterials = [];
  function viewScale() { return Math.max(1, window.innerHeight * 0.5); }
  function registerPoints(mat) { pointMaterials.push(mat); return mat; }

  function fibonacciSphere(n, radius) {
    var pts = new Float32Array(n * 3);
    var phi = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = phi * i;
      pts[i * 3]     = Math.cos(th) * r * radius;
      pts[i * 3 + 1] = y * radius;
      pts[i * 3 + 2] = Math.sin(th) * r * radius;
    }
    return pts;
  }

  function latLonToVec3(lat, lon, radius) {
    var p = (90 - lat) * Math.PI / 180;
    var t = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(p) * Math.cos(t),
       radius * Math.cos(p),
       radius * Math.sin(p) * Math.sin(t)
    );
  }

  /* --- shaders ----------------------------------------------------------- */
  var GLOBE_VS = [
    'attribute float aRand;',
    'uniform float uSize;',
    'uniform float uScale;',
    'varying float vR;',
    'void main(){',
    '  vR = aRand;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = uSize * (0.65 + aRand * 0.75) * (uScale / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var GLOBE_FS = [
    'uniform vec3 uHot;',
    'uniform vec3 uCold;',
    'uniform float uMix;',
    'uniform float uOpacity;',
    'varying float vR;',
    'void main(){',
    '  vec2 c = gl_PointCoord - vec2(0.5);',
    '  float d = length(c);',
    '  if (d > 0.5) discard;',
    '  float a = smoothstep(0.5, 0.06, d);',
    '  float m = clamp(uMix + (vR - 0.5) * 0.45, 0.0, 1.0);',
    '  vec3 col = mix(uHot, uCold, m);',
    '  gl_FragColor = vec4(col, a * uOpacity);',
    '}'
  ].join('\n');

  var DRIFT_VS = [
    'attribute float aRand;',
    'uniform float uTime;',
    'uniform float uSize;',
    'uniform float uScale;',
    'uniform float uSpread;',
    'varying float vR;',
    'void main(){',
    '  vR = aRand;',
    '  float ang = uTime * (0.05 + aRand * 0.16);',
    '  float s = sin(ang), c = cos(ang);',
    '  vec3 p = position * (1.0 + uSpread * (0.10 + aRand * 0.35));',
    '  vec3 q = vec3(p.x * c - p.z * s, p.y + sin(uTime * 0.55 + aRand * 6.283) * 0.16, p.x * s + p.z * c);',
    '  vec4 mv = modelViewMatrix * vec4(q, 1.0);',
    '  gl_PointSize = uSize * (0.5 + aRand) * (uScale / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var DRIFT_FS = [
    'uniform vec3 uA;',
    'uniform vec3 uB;',
    'uniform float uOpacity;',
    'varying float vR;',
    'void main(){',
    '  vec2 c = gl_PointCoord - vec2(0.5);',
    '  float d = length(c);',
    '  if (d > 0.5) discard;',
    '  float a = smoothstep(0.5, 0.0, d);',
    '  vec3 col = mix(uA, uB, vR);',
    '  gl_FragColor = vec4(col, a * uOpacity);',
    '}'
  ].join('\n');

  var ATMO_VS = [
    'varying vec3 vN;',
    'void main(){',
    '  vN = normalize(normalMatrix * normal);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  // fresnel-weighted atmosphere (needs varying, assembled separately)
  var ATMO_FS_FULL = [
    'uniform vec3 uColorA;',
    'uniform vec3 uColorB;',
    'uniform float uMix;',
    'uniform float uPower;',
    'varying vec3 vN;',
    'void main(){',
    // BackSide sphere: dot runs -1 (dead centre, behind the planet) to 0 at
    // the limb, so key the glow off the limb to get a rim rather than a blob.
    '  float f = 1.0 - abs(dot(vN, vec3(0.0, 0.0, 1.0)));',
    '  float i = pow(clamp(f, 0.0, 1.0), 3.0);',
    '  vec3 col = mix(uColorA, uColorB, uMix);',
    '  gl_FragColor = vec4(col, 1.0) * i * uPower;',
    '}'
  ].join('\n');

  /* --- build ------------------------------------------------------------- */
  function makeDriftField(count, rMin, rMax, colA, colB) {
    var pos = new Float32Array(count * 3);
    var rnd = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      var u = Math.random() * 2 - 1;
      var th = Math.random() * Math.PI * 2;
      var r = rMin + Math.pow(Math.random(), 0.7) * (rMax - rMin);
      var s = Math.sqrt(Math.max(0, 1 - u * u));
      pos[i * 3]     = Math.cos(th) * s * r;
      pos[i * 3 + 1] = u * r * 0.82;
      pos[i * 3 + 2] = Math.sin(th) * s * r;
      rnd[i] = Math.random();
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    var m = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uSize:    { value: IS_SMALL ? 0.05 : 0.062 },
        uScale:   { value: viewScale() },
        uSpread:  { value: 0 },
        uOpacity: { value: 0 },
        uA:       { value: new THREE.Color(colA) },
        uB:       { value: new THREE.Color(colB) }
      },
      vertexShader: DRIFT_VS,
      fragmentShader: DRIFT_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    registerPoints(m);
    return new THREE.Points(g, m);
  }

  function buildEarth() {
    earthGroup = new THREE.Group();

    // dark solid core so the point shell reads as a planet
    earthCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.97, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x08141b, roughness: 0.95, metalness: 0.1,
        emissive: new THREE.Color(0x08343a), emissiveIntensity: 0.5
      })
    );
    earthGroup.add(earthCore);

    // point-cloud surface — colour lerps from carbon-orange to living green
    var N = IS_SMALL ? 3200 : 7000;
    var gp = fibonacciSphere(N, 2.02);
    var rnd = new Float32Array(N);
    for (var i = 0; i < N; i++) rnd[i] = Math.random();
    var gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.BufferAttribute(gp, 3));
    gg.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    globePoints = new THREE.Points(gg, registerPoints(new THREE.ShaderMaterial({
      uniforms: {
        uSize:    { value: IS_SMALL ? 0.045 : 0.055 },
        uScale:   { value: viewScale() },
        uHot:     { value: new THREE.Color(0xff6a2c) },
        uCold:    { value: new THREE.Color(0x2ef0a5) },
        uMix:     { value: 0 },
        uOpacity: { value: 0.95 }
      },
      vertexShader: GLOBE_VS,
      fragmentShader: GLOBE_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })));
    earthGroup.add(globePoints);

    // faint latitude/longitude cage
    earthWire = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 26, 18),
      new THREE.MeshBasicMaterial({ color: 0x2ef0a5, wireframe: true, transparent: true, opacity: 0.055 })
    );
    earthGroup.add(earthWire);

    // atmosphere / fresnel halo
    atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.42, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: {
          uColorA: { value: new THREE.Color(0xff5f3c) },
          uColorB: { value: new THREE.Color(0x35d6ff) },
          uMix:    { value: 0 },
          uPower:  { value: 1.0 }
        },
        vertexShader: ATMO_VS,
        fragmentShader: ATMO_FS_FULL,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    earthGroup.add(atmosphere);

    // Anantapur / Sri Sathya Sai region pin (14.68° N, 77.60° E)
    regionPin = new THREE.Group();
    var pinPos = latLonToVec3(14.68, 77.60, 2.06);
    var pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xffd15c })
    );
    pinDot.position.copy(pinPos);
    var pinRing = new THREE.Mesh(
      new THREE.RingGeometry(0.10, 0.135, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd15c, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    pinRing.position.copy(pinPos);
    pinRing.lookAt(pinPos.clone().multiplyScalar(3));
    regionPin.add(pinDot, pinRing);
    regionPin.userData.ring = pinRing;
    earthGroup.add(regionPin);

    // carbon smog shell (red / ember / ash)
    smogPoints = makeDriftField(IS_SMALL ? 1400 : 3200, 2.15, 3.9, 0xff4a24, 0x8d7a6f);
    earthGroup.add(smogPoints);

    // restoration shell (green / cyan)
    healPoints = makeDriftField(IS_SMALL ? 1200 : 2800, 2.1, 4.4, 0x2ef0a5, 0x35d6ff);
    earthGroup.add(healPoints);

    scene.add(earthGroup);
  }

  function glowMat(hex, opacity) {
    return new THREE.MeshBasicMaterial({
      color: hex, transparent: true, opacity: opacity === undefined ? 1 : opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
  }

  function buildPlant() {
    plantGroup = new THREE.Group();
    plantGroup.scale.setScalar(0.001);
    plantGroup.visible = false;

    // base platform
    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.8, 0.28, 64),
      new THREE.MeshStandardMaterial({ color: 0x111c22, roughness: 0.72, metalness: 0.35 })
    );
    base.position.y = -1.5;
    plantGroup.add(base);

    var baseRim = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.026, 8, 96), glowMat(0x2ef0a5, 0.8));
    baseRim.rotation.x = Math.PI / 2;
    baseRim.position.y = -1.35;
    plantGroup.add(baseRim);

    // central reactor / condenser column
    plantCore = new THREE.Group();
    var column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.82, 2.9, 32),
      new THREE.MeshStandardMaterial({
        color: 0x16242c, roughness: 0.4, metalness: 0.8,
        emissive: new THREE.Color(0x0d5f4a), emissiveIntensity: 0.55
      })
    );
    column.position.y = 0.05;
    var cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1c313a, roughness: 0.3, metalness: 0.9 })
    );
    cap.position.y = 1.5;
    var stack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 1.5, 20),
      new THREE.MeshStandardMaterial({ color: 0x22333c, roughness: 0.5, metalness: 0.7 })
    );
    stack.position.set(0.95, 1.0, -0.35);
    var coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), glowMat(0x2ef0a5, 0.5));
    coreGlow.position.y = 0.35;
    plantCore.add(column, cap, stack, coreGlow);
    plantGroup.add(plantCore);

    // six kilns × 3 tonne, arranged around the column
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      var k = new THREE.Group();
      var body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.46, 1.15, 26),
        new THREE.MeshStandardMaterial({
          color: 0x142129, roughness: 0.55, metalness: 0.65,
          emissive: new THREE.Color(0x1a4a3a), emissiveIntensity: 0.35
        })
      );
      var lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.47, 0.47, 0.09, 26),
        new THREE.MeshStandardMaterial({ color: 0x2ef0a5, roughness: 0.3, metalness: 0.6,
          emissive: new THREE.Color(0x2ef0a5), emissiveIntensity: 0.8 })
      );
      lid.position.y = 0.62;
      var flame = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 18), glowMat(0xff9d3d, 0.55));
      flame.position.y = 0.78;
      // syngas return pipe to the central column
      var pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.55, 10),
        new THREE.MeshStandardMaterial({ color: 0x2a3d47, roughness: 0.5, metalness: 0.8 })
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(-0.85, 0.45, 0);
      k.add(body, lid, flame, pipe);
      k.position.set(Math.cos(a) * 2.35, -0.78, Math.sin(a) * 2.35);
      k.rotation.y = -a;
      k.userData.flame = flame;
      k.userData.lid = lid;
      k.userData.phase = i * 0.9;
      plantGroup.add(k);
      kilns.push(k);
    }

    // feedstock circulation ring + counter-rotating MRV ring
    plantRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.012, 8, 140), glowMat(0x35d6ff, 0.55));
    plantRing.rotation.x = Math.PI / 2;
    plantRing.position.y = 0.35;
    plantGroup.add(plantRing);

    plantSpin = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.008, 8, 120), glowMat(0x2ef0a5, 0.45));
    plantSpin.rotation.x = Math.PI / 2.35;
    plantSpin.position.y = 0.9;
    plantGroup.add(plantSpin);

    // circulating feedstock particles on the ring
    var pc = IS_SMALL ? 260 : 620;
    var pos = new Float32Array(pc * 3), rnd = new Float32Array(pc);
    for (var j = 0; j < pc; j++) {
      var ang = Math.random() * Math.PI * 2;
      var rr = 2.6 + Math.random() * 0.8;
      pos[j * 3]     = Math.cos(ang) * rr;
      pos[j * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[j * 3 + 2] = Math.sin(ang) * rr;
      rnd[j] = Math.random();
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pg.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    var pm = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uSize: { value: 0.056 }, uScale: { value: viewScale() }, uSpread: { value: 0 }, uOpacity: { value: 0 },
        uA: { value: new THREE.Color(0x2ef0a5) }, uB: { value: new THREE.Color(0x35d6ff) }
      },
      vertexShader: DRIFT_VS, fragmentShader: DRIFT_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    registerPoints(pm);
    var plantDust = new THREE.Points(pg, pm);
    plantGroup.add(plantDust);
    plantGroup.userData.dust = plantDust;

    // six interactive process nodes
    var NODE_POS = [
      [-3.05,  0.95, 1.25],  // 01 feedstock — inbound side
      [ 0.00,  2.35, 0.00],  // 02 pyrolysis — above the reactor
      [ 2.55,  0.20, 1.85],  // 03 biochar
      [ 3.15,  0.75, -1.35], // 04 briquettes
      [-1.70,  1.55, -2.55], // 05 co-products
      [-2.30, -0.55, -2.05]  // 06 MRV
    ];
    PROCESS.forEach(function (p, i) {
      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.135, 1), glowMat(0x2ef0a5, 0.95));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 18), glowMat(0x2ef0a5, 0.13));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.008, 8, 40), glowMat(0x35d6ff, 0.75));
      ring.rotation.x = Math.PI / 2;
      n.add(core, halo, ring);
      n.position.fromArray(NODE_POS[i]);
      n.userData = { kind: 'process', index: i, core: core, halo: halo, ring: ring, phase: i * 1.1 };
      core.userData.hot = n;
      halo.userData.hot = n;
      plantGroup.add(n);
      processNodes.push(n);
    });

    scene.add(plantGroup);
  }

  function buildHorizons() {
    horizonGroup = new THREE.Group();
    horizonGroup.visible = false;

    var COLORS = [0x35f08a, 0xa8e06a, 0x35d6ff];
    var RADIUS = [3.3, 3.3, 3.3];
    var ANGLES = [-0.55, 0.35, 1.55];
    var HEIGHT = [1.15, -0.35, -1.35];

    HORIZONS.forEach(function (h, i) {
      var n = new THREE.Group();
      var col = COLORS[i];
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), glowMat(col, 0.95));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), glowMat(col, 0.12));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.01, 8, 56), glowMat(col, 0.8));
      ring.rotation.x = Math.PI / 2.6;
      var ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.006, 8, 64), glowMat(col, 0.4));
      ring2.rotation.x = Math.PI / 1.7;
      n.add(core, halo, ring, ring2);
      n.position.set(
        Math.cos(ANGLES[i]) * RADIUS[i],
        HEIGHT[i],
        Math.sin(ANGLES[i]) * RADIUS[i]
      );
      n.userData = { kind: 'horizon', index: i, core: core, halo: halo, ring: ring, ring2: ring2, phase: i * 2.1 };
      core.userData.hot = n;
      halo.userData.hot = n;
      horizonGroup.add(n);
      horizonNodes.push(n);
    });

    scene.add(horizonGroup);
  }

  function buildStars() {
    var n = IS_SMALL ? 900 : 2200;
    var pos = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var r = 55 + Math.random() * 90;
      var u = Math.random() * 2 - 1;
      var th = Math.random() * Math.PI * 2;
      var s = Math.sqrt(Math.max(0, 1 - u * u));
      pos[i * 3] = Math.cos(th) * s * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = Math.sin(th) * s * r;
      rnd[i] = Math.random();
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    starField = new THREE.Points(g, registerPoints(new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 0.30 },
        uScale: { value: viewScale() },
        uHot: { value: new THREE.Color(0xdfe9ff) },
        uCold: { value: new THREE.Color(0x9fd8ff) },
        uMix: { value: 0.5 },
        uOpacity: { value: 0.85 }
      },
      vertexShader: GLOBE_VS, fragmentShader: GLOBE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    })));
    scene.add(starField);
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.0125);

    camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.copy(state.camPos);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas, antialias: !IS_SMALL, alpha: false, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_SMALL ? 1.6 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x05070a, 1);
    if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
    }

    clock = new THREE.Clock();
    pointer = new THREE.Vector2(-2, -2);
    projected = new THREE.Vector3();
    tmpV = new THREE.Vector3();
    raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.2 };

    /* --- standard WebGL lighting rig --- */
    scene.add(new THREE.AmbientLight(0x486a7a, 0.55));

    var key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(5, 4, 6);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x35d6ff, 0.55);
    rim.position.set(-7, -2, -5);
    scene.add(rim);

    var emberLight = new THREE.PointLight(0xff5f3c, 2.2, 26, 2);
    emberLight.position.set(-3.6, 1.4, 3.2);
    scene.add(emberLight);

    var lifeLight = new THREE.PointLight(0x2ef0a5, 0.0, 30, 2);
    lifeLight.position.set(3.4, 2.0, 3.4);
    scene.add(lifeLight);

    scene.userData.emberLight = emberLight;
    scene.userData.lifeLight = lifeLight;

    buildStars();
    buildEarth();
    buildPlant();
    buildHorizons();

    running = true;
  }

  /* =======================================================================
     6. SCROLL JOURNEY — camera stations
     ===================================================================== */
  /* Each station is a camera + scene pose anchored to a DOM element.
     `solutionHold` repeats the solution pose so the pyrolysis unit stays
     fully on stage for the whole length of the six-step scroll instead of
     fading out gradually across it. */
  var STATIONS = [
    { // 0 · hero — the planet at rest, already hazed
      sel: '#hero', dot: 0,
      camPos: [0, 0.7, 13.2], camTarget: [0, 0, 0],
      pollution: 0.5, restoration: 0.02, plant: 0, earthScale: 1.0, earthPos: [0, 0, 0]
    },
    { // 1 · problem — pushed in, smog at maximum
      sel: '#problem', dot: 1,
      camPos: [3.1, 1.1, 6.9], camTarget: [0.35, 0.05, 0],
      pollution: 1.0, restoration: 0.0, plant: 0, earthScale: 1.05, earthPos: [0, 0, 0]
    },
    { // 2 · solution — earth recedes, the pyrolysis unit takes the stage
      sel: '#solution', dot: 2,
      camPos: [0.4, 1.6, 9.4], camTarget: [0, 0.15, 0],
      pollution: 0.42, restoration: 0.25, plant: 1, earthScale: 0.40, earthPos: [-8.6, 3.4, -13.5]
    },
    { // 3 · solution hold — anchored to the final process step
      sel: '.step:last-child', dot: 2, anchor: 'bottom',
      camPos: [-0.6, 1.2, 8.6], camTarget: [0, 0.1, 0],
      pollution: 0.30, restoration: 0.35, plant: 1, earthScale: 0.40, earthPos: [-8.6, 3.4, -13.5]
    },
    { // 4 · horizons — the planet returns, restored, with three nodes
      sel: '#horizons', dot: 3,
      camPos: [0.2, 0.9, 11.6], camTarget: [0, 0, 0],
      pollution: 0.05, restoration: 1.0, plant: 0, earthScale: 1.0, earthPos: [0, 0, 0]
    },
    { // 5 · contact — pull back, clean sky
      sel: '#contact', dot: 4,
      camPos: [0, 3.0, 15.5], camTarget: [0, -0.7, 0],
      pollution: 0.0, restoration: 1.0, plant: 0, earthScale: 0.92, earthPos: [0, -1.1, 0]
    }
  ];

  var actEls  = STATIONS.map(function (s) { return $(s.sel); });
  var anchors = [];
  var journey = { index: 0, local: 0, global: 0 };

  /** Document-space top of an element (offsetTop is unreliable here because
      .act is position:relative, so nested .step elements measure locally). */
  function docTop(el, fromBottom) {
    if (!el) return 0;
    var r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY + (fromBottom ? r.height : 0));
  }

  function measure() {
    anchors = actEls.map(function (el, i) {
      return docTop(el, STATIONS[i].anchor === 'bottom');
    });
    // guarantee a strictly increasing timeline even if a section collapses
    for (var i = 1; i < anchors.length; i++) {
      if (anchors[i] <= anchors[i - 1]) anchors[i] = anchors[i - 1] + 1;
    }
  }

  function readScroll() {
    var vh = window.innerHeight;
    var focus = window.scrollY + vh * 0.42;
    var last = anchors.length - 1;

    var i = 0;
    while (i < last && focus >= anchors[i + 1]) i++;

    var local;
    if (i >= last) { i = last - 1; local = 1; }
    else {
      var span = Math.max(1, anchors[i + 1] - anchors[i]);
      local = clamp((focus - anchors[i]) / span, 0, 1);
    }

    journey.index = i;
    journey.local = local;

    var doc = Math.max(1, document.documentElement.scrollHeight - vh);
    journey.global = clamp(window.scrollY / doc, 0, 1);

    var a = STATIONS[i], b = STATIONS[i + 1] || STATIONS[i];
    var t = smooth(local);

    target.pollution   = lerp(a.pollution, b.pollution, t);
    target.restoration = lerp(a.restoration, b.restoration, t);
    target.plant       = lerp(a.plant, b.plant, t);
    target.earthScale  = lerp(a.earthScale, b.earthScale, t);
    target.earthPos.set(
      lerp(a.earthPos[0], b.earthPos[0], t),
      lerp(a.earthPos[1], b.earthPos[1], t),
      lerp(a.earthPos[2], b.earthPos[2], t)
    );
    target.camPos.set(
      lerp(a.camPos[0], b.camPos[0], t),
      lerp(a.camPos[1], b.camPos[1], t),
      lerp(a.camPos[2], b.camPos[2], t)
    );
    target.camTarget.set(
      lerp(a.camTarget[0], b.camTarget[0], t),
      lerp(a.camTarget[1], b.camTarget[1], t),
      lerp(a.camTarget[2], b.camTarget[2], t)
    );

    updateChrome();
  }

  /* --- nav / rail chrome ------------------------------------------------- */
  var railFill   = $('#railFill');
  var railDots   = $$('.rail__dots li');
  var navAnchors = $$('.nav__links a[data-jump]');
  var DOT_ACTS   = ['hero', 'problem', 'solution', 'horizons', 'contact'];

  function updateChrome() {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
    railFill.style.height = (journey.global * 100).toFixed(2) + '%';

    var si = journey.local > 0.55 ? journey.index + 1 : journey.index;
    si = clamp(si, 0, STATIONS.length - 1);
    var dot = STATIONS[si].dot;

    railDots.forEach(function (li, i) { li.classList.toggle('is-on', i === dot); });

    var actName = DOT_ACTS[dot];
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('data-jump') === actName);
    });
  }

  /* =======================================================================
     7. HOTSPOT PROJECTION
     ===================================================================== */
  function updateMarkers() {
    if (!running || window.innerWidth <= 780) return;
    var w = window.innerWidth, h = window.innerHeight;
    var plantOn = state.plant > 0.55;
    var horizonOn = state.restoration > 0.62 && state.plant < 0.25;

    markers.forEach(function (m) {
      var node = m.group === 'plant' ? processNodes[m.i] : horizonNodes[m.i];
      var on = m.group === 'plant' ? plantOn : horizonOn;
      if (!node || !on) { m.el.classList.remove('is-on'); return; }

      node.getWorldPosition(projected);
      projected.project(camera);

      if (projected.z > 1) { m.el.classList.remove('is-on'); return; }

      var x = (projected.x * 0.5 + 0.5) * w;
      var y = (-projected.y * 0.5 + 0.5) * h;
      if (x < -80 || x > w + 80 || y < -60 || y > h + 60) { m.el.classList.remove('is-on'); return; }

      m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      m.el.classList.add('is-on');
    });
  }

  /* =======================================================================
     8. RAYCAST INTERACTION ON 3D NODES
     ===================================================================== */
  var hovered = null;
  var UI_SELECTOR = '.panel, .step__card, .horizon, .nav, .modal__card, .hs, .rail, .foot__cards, .foot__lead, .outcome, .scroll-hint, a, button, [data-open]';

  function pickNode(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    var pool = [];
    if (state.plant > 0.55) processNodes.forEach(function (n) { pool.push(n.userData.core, n.userData.halo); });
    if (state.restoration > 0.62 && state.plant < 0.25) horizonNodes.forEach(function (n) { pool.push(n.userData.core, n.userData.halo); });
    if (!pool.length) return null;

    var hits = raycaster.intersectObjects(pool, false);
    return hits.length ? hits[0].object.userData.hot : null;
  }

  if (!IS_TOUCH) {
    window.addEventListener('pointermove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;

      if (!running || modalState.open) return;
      // ignore the pointer while it is over real UI
      if (e.target && e.target.closest && e.target.closest(UI_SELECTOR)) {
        if (hovered) { hovered = null; document.body.style.cursor = ''; }
        return;
      }
      var n = pickNode(e.clientX, e.clientY);
      if (n !== hovered) {
        hovered = n;
        document.body.style.cursor = n ? 'pointer' : '';
        if (n) setActiveHotspot(n.userData.kind === 'process' ? 'plant' : 'horizon', n.userData.index);
      }
    }, { passive: true });
  }

  // #scroll-root sits above the canvas, so scene clicks are caught at the
  // window and ignored whenever the pointer is over real interface.
  window.addEventListener('click', function (e) {
    if (!running || modalState.open) return;
    if (e.target && e.target.closest && e.target.closest(UI_SELECTOR)) return;
    var n = pickNode(e.clientX, e.clientY);
    if (n) openModal(n.userData.kind === 'process' ? 'process' : 'horizon', n.userData.index, null);
  });

  /* =======================================================================
     9. RENDER LOOP
     ===================================================================== */
  function frame() {
    requestAnimationFrame(frame);
    if (!running) return;

    var dt = Math.min(clock.getDelta(), 0.1);
    var t  = clock.elapsedTime;

    // damped state
    state.pollution   = damp(state.pollution, target.pollution, 3.2, dt);
    state.restoration = damp(state.restoration, target.restoration, 3.2, dt);
    state.plant       = damp(state.plant, target.plant, 3.6, dt);
    state.earthScale  = damp(state.earthScale, target.earthScale, 3.4, dt);
    state.earthPos.x  = damp(state.earthPos.x, target.earthPos.x, 3.4, dt);
    state.earthPos.y  = damp(state.earthPos.y, target.earthPos.y, 3.4, dt);
    state.earthPos.z  = damp(state.earthPos.z, target.earthPos.z, 3.4, dt);

    // pointer parallax
    mouse.x = damp(mouse.x, mouse.tx, 2.4, dt);
    mouse.y = damp(mouse.y, mouse.ty, 2.4, dt);

    // camera
    tmpV.copy(target.camPos);
    tmpV.x += mouse.x * 0.85;
    tmpV.y += -mouse.y * 0.55;
    state.camPos.x = damp(state.camPos.x, tmpV.x, 2.6, dt);
    state.camPos.y = damp(state.camPos.y, tmpV.y, 2.6, dt);
    state.camPos.z = damp(state.camPos.z, tmpV.z, 2.6, dt);
    state.camTarget.x = damp(state.camTarget.x, target.camTarget.x, 3.0, dt);
    state.camTarget.y = damp(state.camTarget.y, target.camTarget.y, 3.0, dt);
    state.camTarget.z = damp(state.camTarget.z, target.camTarget.z, 3.0, dt);
    camera.position.copy(state.camPos);
    camera.lookAt(state.camTarget.x, state.camTarget.y, state.camTarget.z);

    /* ---------------- earth ---------------- */
    earthGroup.position.copy(state.earthPos);
    earthGroup.scale.setScalar(state.earthScale);
    earthGroup.rotation.y += dt * 0.048;
    earthWire.rotation.y -= dt * 0.02;

    globePoints.material.uniforms.uMix.value = state.restoration;
    globePoints.material.uniforms.uOpacity.value = 0.55 + state.restoration * 0.45;

    atmosphere.material.uniforms.uMix.value = state.restoration;
    atmosphere.material.uniforms.uPower.value = 0.55 + state.pollution * 0.45 + state.restoration * 0.40;

    earthCore.material.emissive.setHex(state.restoration > 0.5 ? 0x0a3a34 : 0x2a1208);
    earthCore.material.emissiveIntensity = 0.35 + state.pollution * 0.3;

    // region pin pulses hardest during the problem act
    var pinP = 0.35 + state.pollution * 0.65;
    regionPin.userData.ring.scale.setScalar(1 + Math.sin(t * 2.1) * 0.22 * pinP);
    regionPin.userData.ring.material.opacity = pinP * (0.55 + Math.sin(t * 2.1) * 0.3);

    // smog vs restoration fields
    smogPoints.material.uniforms.uTime.value = t;
    smogPoints.material.uniforms.uOpacity.value = state.pollution * 0.55;
    smogPoints.material.uniforms.uSpread.value = state.pollution * 0.9;

    healPoints.material.uniforms.uTime.value = t * 0.8;
    healPoints.material.uniforms.uOpacity.value = state.restoration * 0.55;
    healPoints.material.uniforms.uSpread.value = 0.25 + state.restoration * 0.7;

    scene.userData.emberLight.intensity = 0.4 + state.pollution * 2.4;
    scene.userData.lifeLight.intensity  = state.restoration * 2.6;

    /* ---------------- plant ---------------- */
    var pShown = state.plant > 0.01;
    plantGroup.visible = pShown;
    if (pShown) {
      var s = 0.55 + state.plant * 0.75;
      plantGroup.scale.setScalar(s * state.plant);
      plantGroup.rotation.y += dt * 0.085;
      plantGroup.position.y = -0.4 + Math.sin(t * 0.5) * 0.08;

      plantRing.rotation.z += dt * 0.35;
      plantSpin.rotation.z -= dt * 0.55;
      plantCore.rotation.y -= dt * 0.12;
      plantGroup.userData.dust.material.uniforms.uTime.value = t * 1.6;
      plantGroup.userData.dust.material.uniforms.uOpacity.value = state.plant * 0.5;

      kilns.forEach(function (k, i) {
        var burn = 0.4 + Math.abs(Math.sin(t * 1.4 + k.userData.phase)) * 0.6;
        k.userData.flame.scale.setScalar(0.7 + burn * 0.6);
        k.userData.flame.material.opacity = 0.25 + burn * 0.45;
        k.userData.lid.material.emissiveIntensity = 0.45 + burn * 0.7;
        k.position.y = -0.78 + Math.sin(t * 0.9 + i) * 0.03;
      });

      processNodes.forEach(function (n, i) {
        var live = (i === activeStep) || (hovered === n);
        var pulse = 0.85 + Math.sin(t * 2.2 + n.userData.phase) * 0.15;
        var want = live ? 1.7 : 1.0;
        n.scale.setScalar(damp(n.scale.x, want * pulse, 6, dt));
        n.userData.core.rotation.y += dt * 0.9;
        n.userData.core.rotation.x += dt * 0.5;
        n.userData.ring.rotation.z += dt * (live ? 1.6 : 0.7);
        n.userData.halo.material.opacity = (live ? 0.30 : 0.12) * state.plant;
        n.userData.core.material.opacity = state.plant;
        n.userData.ring.material.opacity = (live ? 0.95 : 0.6) * state.plant;
      });
    }

    /* ---------------- horizons ---------------- */
    var hShown = state.restoration > 0.25 && state.plant < 0.4;
    horizonGroup.visible = hShown;
    if (hShown) {
      var vis = clamp((state.restoration - 0.25) / 0.55, 0, 1) * (1 - clamp(state.plant / 0.4, 0, 1));
      horizonGroup.position.copy(state.earthPos);
      horizonGroup.scale.setScalar(state.earthScale);
      horizonGroup.rotation.y += dt * 0.09;

      horizonNodes.forEach(function (n, i) {
        var live = hovered === n;
        var pulse = 0.9 + Math.sin(t * 1.5 + n.userData.phase) * 0.12;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.45 : 1) * pulse * vis, 6, dt));
        n.userData.core.rotation.y += dt * 0.6;
        n.userData.ring.rotation.z += dt * 0.5;
        n.userData.ring2.rotation.z -= dt * 0.32;
        n.userData.core.material.opacity = vis;
        n.userData.halo.material.opacity = (live ? 0.26 : 0.12) * vis;
        n.userData.ring.material.opacity = 0.8 * vis;
        n.userData.ring2.material.opacity = 0.4 * vis;
        n.position.y += Math.sin(t * 0.8 + i * 2) * 0.0016;
      });
    }

    /* ---------------- stars ---------------- */
    starField.rotation.y += dt * 0.006;
    starField.material.uniforms.uMix.value = 0.35 + state.restoration * 0.4;

    updateMarkers();
    renderer.render(scene, camera);
  }

  /* =======================================================================
     10. RESIZE / VISIBILITY
     ===================================================================== */
  var resizeTimer;
  function onResize() {
    if (renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_SMALL ? 1.6 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      var sc = viewScale();
      pointMaterials.forEach(function (m) { if (m.uniforms.uScale) m.uniforms.uScale.value = sc; });
    }
    measure();
    readScroll();
  }
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 120);
  });
  window.addEventListener('orientationchange', function () { setTimeout(onResize, 260); });

  document.addEventListener('visibilitychange', function () {
    if (!clock) return;
    if (document.hidden) { clock.stop(); } else { clock.start(); }
  });

  /* --- scroll wiring (rAF-throttled) ------------------------------------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { readScroll(); ticking = false; });
  }, { passive: true });

  /* --- optional GSAP polish (used only if the CDN resolved) -------------- */
  function wireGsap() {
    if (!HAS_GSAP || REDUCED) return;

    gsap.fromTo('.hero__title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: .15 });
    gsap.fromTo('.hero__lede',  { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', delay: .30 });
    gsap.fromTo('.hero__stats .stat', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', delay: .45 });
    gsap.fromTo('.hero__actions .btn', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08, ease: 'power3.out', delay: .65 });

    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(window.ScrollTrigger);

    // Transform-only parallax. Deliberately never touches opacity, so the
    // CSS step-focus dimming (.step.is-live) keeps working.
    gsap.utils.toArray('.panel').forEach(function (el, i) {
      gsap.fromTo(el, { y: 40 }, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
    gsap.utils.toArray('.horizon').forEach(function (el, i) {
      gsap.fromTo(el, { y: 30 + i * 18 }, {
        y: -30 - i * 18, ease: 'none',
        scrollTrigger: { trigger: '#horizonGrid', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });

    // ScrollTrigger changes layout height as it settles; keep anchors honest.
    ScrollTrigger.addEventListener('refresh', measure);
  }

  /* =======================================================================
     11. BOOT
     ===================================================================== */
  var LOAD_MSGS = [
    'Initialising carbon engine',
    'Seeding atmospheric particles',
    'Charging six pyrolysis kilns',
    'Calibrating MRV registry',
    'Restoring the horizon'
  ];

  function boot() {
    var pct = 0, msgI = 0;
    var iv = setInterval(function () {
      pct = Math.min(96, pct + 6 + Math.random() * 11);
      fillEl.style.width = pct + '%';
      pctEl.textContent = Math.round(pct) + '%';
      var next = Math.min(LOAD_MSGS.length - 1, Math.floor(pct / 22));
      if (next !== msgI) { msgI = next; msgEl.textContent = LOAD_MSGS[msgI]; }
    }, 190);

    var ok = (typeof THREE !== 'undefined') && supportsWebGL();
    if (typeof THREE === 'undefined') console.warn('[CE2] Three.js did not load — running in 2D fallback mode.');
    if (ok) {
      try { initThree(); }
      catch (err) { console.error('[CE2] WebGL init failed:', err); ok = false; running = false; }
    }
    if (!ok) {
      $('#fallback').hidden = false;
      canvas.style.display = 'none';
    }

    measure();
    readScroll();
    if (running) frame();

    var finish = function () {
      clearInterval(iv);
      fillEl.style.width = '100%';
      pctEl.textContent = '100%';
      msgEl.textContent = 'Ready';
      setTimeout(function () {
        loaderEl.classList.add('is-done');
        document.body.classList.remove('is-locked');
        runCounters();
        wireGsap();
        measure();
        readScroll();
      }, 380);
    };

    if (document.readyState === 'complete') setTimeout(finish, 900);
    else window.addEventListener('load', function () { setTimeout(finish, 700); });
  }

  document.body.classList.add('is-locked');
  boot();

  // recalculate anchors once fonts/images have settled
  window.addEventListener('load', function () { setTimeout(onResize, 400); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(onResize, 120); });

  // expose a small handle for debugging / future extension
  window.CE2 = {
    PROCESS: PROCESS, HORIZONS: HORIZONS,
    state: state, target: target, journey: journey,
    openModal: openModal, closeModal: closeModal
  };
})();
