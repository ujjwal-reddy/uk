/* =========================================================================
   CE² — Carbon · Earth · Environment
   script.js

   The scene is one vertical world the camera physically travels through:

        y ≈   0   orbit          — the planet, smog, restoration
        y ≈ -40   ground level   — Anantapur terrain, the pyrolysis unit,
                                   the product line
        y ≈ -45   below ground   — the soil profile where the carbon ends up

   Scrolling dives the camera down through those layers and back out to
   orbit for the closing act.
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

  var IS_TOUCH = window.matchMedia('(hover: none)').matches;
  var IS_SMALL = window.matchMedia('(max-width: 780px)').matches;
  var REDUCED  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = typeof window.gsap !== 'undefined';

  /* World layer heights — every group and camera station is anchored to these. */
  var GROUND = -40;
  var UNDER  = -44.6;

  /* =======================================================================
     1. CONTENT
     ===================================================================== */

  /** The six stages of the CE² Integrated Biomass Pyrolysis Unit. */
  var PROCESS = [
    {
      id: 'feedstock', tag: 'Stage 01 · Inbound',
      title: 'Feedstock Collection', sub: 'Reciprocal Sourcing',
      short: 'Invasive Juliflora, bamboo, groundnut shells and cotton stems are collected free of cost from surrounding villages — paid for not in cash, but in cheap smokeless briquettes returned to the same households.',
      lede: 'CE² does not buy biomass. It trades for it. Rural households hand over residue that today is burned in the open, and receive back a clean, low-cost cooking fuel made from it. The feedstock cost line goes to zero and the village gains a smokeless kitchen.',
      metrics: [ { v: '~378 t', l: 'Feedstock / month' }, { v: '₹0', l: 'Raw material cost' }, { v: '4', l: 'Primary streams' } ],
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
      id: 'pyrolysis', tag: 'Stage 02 · Conversion',
      title: 'Closed-Loop Pyrolysis', sub: '6 Kilns × 3 Tonne',
      short: 'Six three-tonne kilns process roughly 378 t/month of feedstock in an oxygen-starved, closed-loop configuration — syngas is captured and burned back as process heat, with zero-liquid discharge on the condensate line.',
      lede: 'The thermal core of the plant. Biomass is heated in the near-absence of oxygen so it cannot combust; instead it fractures into a solid carbon skeleton, a combustible gas and a condensable vapour. CE² keeps all three inside the boundary.',
      metrics: [ { v: '6 × 3 t', l: 'Kiln configuration' }, { v: '~378 t', l: 'Throughput / month' }, { v: 'ZLD', l: 'Liquid discharge' } ],
      blocks: [
        { h: 'Closed-loop design', items: [
          '<b>Syngas capture</b> — non-condensable gases are routed back to the kiln burners, so the reaction sustains its own process heat after start-up.',
          '<b>Zero-liquid discharge</b> — condensate is recovered as saleable co-products instead of released; nothing enters the local water table.',
          '<b>Emission control</b> — closed kilns replace open burning, converting an uncontrolled release into a captured, measurable stream.',
          '<b>Batch traceability</b> — each kiln batch is logged for feedstock type, residence time and yield, feeding the MRV chain downstream.'
        ]},
        { h: 'Output split per cycle', items: [
          'Solid fraction → <b>biochar</b> for crop-specific inoculation and durable carbon storage.',
          'Solid fines → <b>charcoal briquettes</b>.',
          'Condensable vapour → <b>wood vinegar</b> and <b>wood tar oil</b>.',
          'Non-condensable gas → <b>process heat</b>, displacing external fuel.'
        ]}
      ]
    },
    {
      id: 'biochar', tag: 'Stage 03 · Soil',
      title: 'Crop-Specific Biochar', sub: 'Inoculation & Enrichment',
      short: '30 t/month of biochar charged with manure, wood ash (K), bone meal (P) and a micronutrient pack (Fe, Zn, B, Mg), then formulated per crop — Mosambi, Banana, Pomegranate and Groundnut.',
      lede: 'Raw biochar is a porous carbon skeleton — enormous surface area, but nutritionally empty. CE² inoculates it before it reaches a field, so the char arrives pre-charged rather than stripping nutrients from the soil in its first season.',
      metrics: [ { v: '30 t', l: 'Biochar / month' }, { v: '4', l: 'Crop formulations' }, { v: '4+', l: 'Micronutrients' } ],
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
      id: 'briquettes', tag: 'Stage 04 · Fuel',
      title: 'Smokeless Charcoal Briquettes', sub: 'Pillow · Hexagon · Honeycomb',
      short: '50 t/month of charcoal fines densified into three profiles — 20 t at a domestic price of ₹4/kg to feedstock-supplying villages, and 30 t into the commercial market at ₹35/kg.',
      lede: 'The briquette line is what makes the reciprocal model work. It converts the fine fraction of the char into a product the supplying village actually wants, while a commercial grade carries the revenue.',
      metrics: [ { v: '50 t', l: 'Briquettes / month' }, { v: '₹4 / kg', l: 'Domestic — 20 t' }, { v: '₹35 / kg', l: 'Commercial — 30 t' } ],
      blocks: [
        { h: 'Product profiles', items: [
          '<b>Pillow</b> — general-purpose domestic and barbecue format, high packing density for transport.',
          '<b>Hexagon</b> — extruded commercial bar with a long, even burn for hospitality and industrial heat.',
          '<b>Honeycomb</b> — perforated block for controlled airflow in traditional stoves and continuous burners.'
        ]},
        { h: 'Market split', items: [
          '<b>20 t/month domestic @ ₹4/kg</b> — priced at cost for the villages supplying feedstock; the return leg of the reciprocal exchange.',
          '<b>30 t/month commercial @ ₹35/kg</b> — hotels, restaurants, barbecue retail and industrial users; carries the margin.',
          'Smokeless combustion removes the indoor air-quality burden of raw wood and dung cake.',
          'Displaces both fuelwood harvesting and open residue burning in the same transaction.'
        ]}
      ]
    },
    {
      id: 'coproducts', tag: 'Stage 05 · Recovery',
      title: 'Co-Products Recovery', sub: 'Wood Vinegar & Tar Oil',
      short: 'Condensate recovery yields ~13,608 L/month of wood vinegar as an organic bio-stimulant and ~2,520 kg/month of wood tar oil — the fractions that open burning simply loses to the sky.',
      lede: 'The vapour stream is where most pyrolysis operations lose value and create a discharge problem. CE² condenses and separates it into two saleable products, closing the liquid loop.',
      metrics: [ { v: '~13,608 L', l: 'Wood vinegar / month' }, { v: '~2,520 kg', l: 'Wood tar oil / month' }, { v: '0 L', l: 'Effluent discharged' } ],
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
      id: 'mrv', tag: 'Stage 06 · Carbon',
      title: 'Digital MRV & Carbon Credits', sub: 'Isometric Registry',
      short: 'Registry-verified durable carbon dioxide removal issued on soil-applied biochar only — approximately 140 tCO₂e per month, measured, reported and verified through a digital chain of custody.',
      lede: 'Carbon revenue is claimed on the fraction that is genuinely permanent: char that goes into the ground and stays there. Fuel products are excluded from the removal claim, which is what makes the credit defensible.',
      metrics: [ { v: '~140 tCO₂e', l: 'Removal / month' }, { v: 'Isometric', l: 'Registry' }, { v: 'Soil-applied', l: 'Eligible basis' } ],
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

  /** The product line CE² goes to market with. */
  var PRODUCTS = [
    {
      id: 'p-biochar', tag: 'Product 01', title: 'Crop-Specific Biochar', sub: 'Inoculated soil amendment',
      rate: { v: '30 t', l: 'per month' },
      forms: ['Mosambi', 'Banana', 'Pomegranate', 'Groundnut'],
      swatch: 'linear-gradient(135deg,#2b2b28,#0e0e0c)', glow: 'rgba(47,191,119,.22)',
      short: 'Porous carbon pre-charged with manure, wood ash, bone meal and micronutrients, then blended to a formulation for the crop it is going under.',
      lede: 'The flagship line and the only product that carries the carbon claim. Raw char is inoculated before it leaves the plant so it arrives at the field already loaded with nutrients and microbial life, rather than scavenging them from the soil in its first season.',
      metrics: [ { v: '30 t', l: 'Output / month' }, { v: '4', l: 'Crop formulations' }, { v: 'Fe Zn B Mg', l: 'Micronutrient pack' } ],
      blocks: [
        { h: 'What goes into the charge', items: [
          '<b>Farmyard manure</b> — live microbial consortia seeded into the pore network.',
          '<b>Wood ash</b> — potassium plus a liming effect against fertilizer acidification.',
          '<b>Bone meal</b> — slow-release phosphorus held against fixation and runoff.',
          '<b>Micronutrients</b> — Fe, Zn, B and Mg, the limiting deficiencies on these soils.'
        ]},
        { h: 'Formulations at launch', items: [
          '<b>Mosambi</b> — Zn and Fe weighted, pH-buffered for citrus on carbonate-rich irrigation water.',
          '<b>Banana</b> — K-dominant, high moisture-retention loading.',
          '<b>Pomegranate</b> — B and Ca emphasis for fruit set and crack resistance.',
          '<b>Groundnut</b> — Ca and P weighted for pod fill, with structure improvement for pegging.'
        ]}
      ]
    },
    {
      id: 'p-briquette', tag: 'Product 02', title: 'Smokeless Briquettes', sub: 'Pillow · Hexagon · Honeycomb',
      rate: { v: '50 t', l: 'per month' },
      forms: ['Pillow', 'Hexagon', 'Honeycomb'],
      swatch: 'linear-gradient(135deg,#4a4038,#17130f)', glow: 'rgba(240,145,58,.20)',
      short: 'Charcoal fines densified into three burn profiles. 20 t goes back to feedstock villages at ₹4/kg; 30 t carries the commercial market at ₹35/kg.',
      lede: 'The product that closes the reciprocal loop. Households that supply residue buy back a clean fuel made from it at cost, which is why CE² pays nothing for feedstock and why the open burning stops.',
      metrics: [ { v: '20 t', l: 'Domestic @ ₹4/kg' }, { v: '30 t', l: 'Commercial @ ₹35/kg' }, { v: '3', l: 'Profiles' } ],
      blocks: [
        { h: 'The three profiles', items: [
          '<b>Pillow</b> — general-purpose domestic and barbecue format; packs densely for transport.',
          '<b>Hexagon</b> — extruded commercial bar with a long, even burn for hospitality and industrial heat.',
          '<b>Honeycomb</b> — perforated block for controlled airflow in traditional stoves and continuous burners.'
        ]},
        { h: 'Why smokeless matters', items: [
          'Removes the indoor air-quality burden of raw fuelwood and dung cake.',
          'Displaces fuelwood harvesting, taking pressure off the remaining canopy.',
          'Replaces the open field fire that would otherwise release the same carbon in hours.',
          'Priced at cost domestically — this line is the payment, not the profit.'
        ]}
      ]
    },
    {
      id: 'p-vinegar', tag: 'Product 03', title: 'Wood Vinegar', sub: 'Organic bio-stimulant',
      rate: { v: '~13,608 L', l: 'per month' },
      forms: ['Foliar tonic', 'Root drench', 'Pest deterrent'],
      swatch: 'linear-gradient(135deg,#8a5a22,#3a2410)', glow: 'rgba(217,179,130,.22)',
      short: 'Pyroligneous acid condensed out of the pyrolysis vapour, applied dilute as an organic bio-stimulant and natural pest deterrent.',
      lede: 'The condensate most operations treat as an effluent problem. CE² recovers it as a second agricultural product that sells into the same farms already buying biochar.',
      metrics: [ { v: '~13,608 L', l: 'Recovery / month' }, { v: 'Organic', l: 'Input class' }, { v: '0 L', l: 'Discharged' } ],
      blocks: [
        { h: 'Field use', items: [
          'Applied dilute as a <b>foliar tonic</b> — germination, rooting and general vigour.',
          'Natural <b>pest and fungal deterrent</b>, reducing synthetic pesticide load.',
          'Sold as a package with CE² biochar: one soil programme, one foliar programme.',
          'Recovery is what makes <b>zero-liquid discharge</b> achievable rather than aspirational.'
        ]}
      ]
    },
    {
      id: 'p-tar', tag: 'Product 04', title: 'Wood Tar Oil', sub: 'Industrial heavy fraction',
      rate: { v: '~2,520 kg', l: 'per month' },
      forms: ['Timber preservative', 'Anti-corrosive', 'Binder feedstock'],
      swatch: 'linear-gradient(135deg,#3a2c1f,#100b07)', glow: 'rgba(194,112,61,.22)',
      short: 'The heavy fraction separated from the same condenser train — timber preservation, anti-corrosive coating and binder feedstock.',
      lede: 'Separating the tar fraction is not optional book-keeping; it is the step that lets the liquid loop close. Once removed it becomes an industrial product rather than a disposal cost.',
      metrics: [ { v: '~2,520 kg', l: 'Recovery / month' }, { v: '3', l: 'Application classes' }, { v: 'ZLD', l: 'Enables' } ],
      blocks: [
        { h: 'Applications', items: [
          '<b>Timber preservation</b> — traditional and industrial wood treatment.',
          '<b>Anti-corrosive coatings</b> for exposed metal work.',
          '<b>Binder feedstock</b> for downstream densification and composites.',
          'Optional internal use as supplementary kiln fuel during cold start-up.'
        ]}
      ]
    },
    {
      id: 'p-credit', tag: 'Product 05', title: 'Durable Carbon Credits', sub: 'Isometric registry',
      rate: { v: '~140 tCO₂e', l: 'per month' },
      forms: ['Soil-applied only', 'Digital MRV', 'Century-scale'],
      swatch: 'linear-gradient(135deg,#17A05C,#0b3f28)', glow: 'rgba(47,191,119,.3)',
      short: 'Registry-verified durable carbon dioxide removal, issued only on biochar that is proven to have gone into soil.',
      lede: 'The fifth product is the carbon itself. It is claimed on the soil-applied fraction alone — fuel products are excluded — which is precisely what makes the credit defensible to a buyer.',
      metrics: [ { v: '~140 tCO₂e', l: 'Removal / month' }, { v: 'Isometric', l: 'Registry' }, { v: 'Soil-applied', l: 'Eligible basis' } ],
      blocks: [
        { h: 'The chain of custody', items: [
          '<b>Intake</b> — species, mass and origin village logged at collection.',
          '<b>Conversion</b> — kiln, temperature regime and residence time per batch.',
          '<b>Characterisation</b> — carbon fraction and stability testing on the output.',
          '<b>Application</b> — geotagged field evidence; only this fraction is credited.'
        ]},
        { h: 'Why a buyer can rely on it', items: [
          'Pyrolysed carbon resists microbial breakdown on a century-to-millennium timescale.',
          'Storage is not reversible by fire, tillage or a change of land use in the way standing biomass is.',
          'The farmer gains yield from the same tonne, so the practice sustains itself without subsidy.',
          'Documentation is registry-grade under the <b>Isometric</b> protocol.'
        ]}
      ]
    }
  ];

  /** How a tonne of carbon actually gets restored — the descent. */
  var RESTORATION = [
    { depth: 'Atmosphere · +2 m', title: 'Carbon is pulled out of the air',
      body: 'Juliflora, bamboo, groundnut and cotton do the capture for us. Photosynthesis moves atmospheric CO₂ into stems, shells and stalks over a growing season — the cheapest direct air capture that exists.',
      meter: 8,  note: 'Biogenic carbon, freshly fixed and entirely unstable.' },
    { depth: 'Surface · 0 m', title: 'It is collected instead of burned',
      body: 'Left alone, that residue is burned in the open and the carbon is back in the atmosphere within hours. Collected under the reciprocal exchange, the same material arrives at the kiln with its carbon still intact.',
      meter: 24, note: 'The single decision that makes everything downstream possible.' },
    { depth: 'Kiln · 400–600 °C', title: 'Pyrolysis locks the structure',
      body: 'Heated without oxygen, the biomass cannot burn. It fractures instead, and the carbon rearranges into fused aromatic rings — a form soil microbes have no efficient way to break apart.',
      meter: 52, note: 'Unstable plant carbon becomes recalcitrant carbon.' },
    { depth: 'Root zone · −0.3 m', title: 'It goes into the ground',
      body: 'Inoculated biochar is worked into the root zone. The porosity that makes it permanent also raises water-holding capacity, cation exchange and pH — so the field improves in the same act that stores the carbon.',
      meter: 78, note: 'Only this fraction is ever claimed as removal.' },
    { depth: 'Held · centuries', title: 'And it stays there',
      body: 'Residence time is measured in centuries to millennia, not seasons. Every soil-applied tonne is documented through digital MRV and issued as durable removal on the Isometric registry — roughly 140 tCO₂e each month.',
      meter: 100, note: '~140 tCO₂e / month · Isometric · soil-applied basis.' }
  ];

  /** The three CE² Future Horizons restoration pathways. */
  var HORIZONS = [
    {
      id: 'agroforestry', icon: '🌳', tag: 'Horizon 01',
      title: 'Agroforestry & Tree Care', sub: 'Multi-tier afforestation',
      short: 'Multi-tier afforestation on degraded agricultural land — native species selection, establishment support and long-term canopy health management rather than one-off planting drives.',
      lede: 'A planted sapling is not a carbon sink; a surviving canopy is. CE² treats afforestation as a maintenance commitment, pairing native multi-tier planting with the biochar and bio-stimulant programme that keeps the trees alive through the dry years.',
      kpis: ['Native species', 'Multi-tier canopy', 'Long-term care'],
      metrics: [ { v: 'Multi-tier', l: 'Planting structure' }, { v: 'Native', l: 'Species policy' }, { v: 'Ongoing', l: 'Canopy maintenance' } ],
      blocks: [
        { h: 'How it is executed', items: [
          '<b>Site diagnosis</b> — degraded, saline or abandoned parcels mapped and soil-tested first.',
          '<b>Multi-tier design</b> — canopy, sub-canopy, shrub and ground layers holding soil and moisture together.',
          '<b>Native species</b> — drought-adapted local species over exotics that fail in a 522 mm rainfall regime.',
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
      id: 'erw', icon: '⛰️', tag: 'Horizon 02',
      title: 'Enhanced Rock Weathering', sub: 'Crushed basalt on cropland',
      short: 'Spreading finely crushed basalt and silicate rock across cropland, permanently trapping atmospheric CO₂ through accelerated chemical weathering while raising soil pH and base saturation.',
      lede: 'ERW takes a reaction the planet already runs over geological time and compresses it into an agricultural season. Crushed silicate on a field dissolves in rainwater and soil acids, converting dissolved CO₂ into stable bicarbonate — a removal measured in millennia.',
      kpis: ['Basalt / silicate', 'Permanent storage', 'Yield co-benefit'],
      metrics: [ { v: 'Geological', l: 'Storage durability' }, { v: 'Cropland', l: 'Application surface' }, { v: 'pH ↑', l: 'Agronomic co-benefit' } ],
      blocks: [
        { h: 'The mechanism', items: [
          'Rainwater and soil CO₂ form a weak acid that dissolves crushed <b>basalt and silicate</b> minerals.',
          'The reaction converts dissolved CO₂ into <b>stable bicarbonate</b>, carried to groundwater and ultimately the ocean.',
          'Storage is geological in duration — not subject to fire, tillage or land-use reversal.',
          'Fine grinding raises reactive surface area so weathering completes on an agricultural timescale.'
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
      id: 'coastal', icon: '🪸', tag: 'Horizon 03',
      title: 'Coastal & Coral Restoration', sub: 'Blue carbon systems',
      short: 'Mangrove ecosystem protection, ocean alkalinity enhancement and coral reef restoration along the coastline — the highest-density carbon sinks available and the frontline of coastal protection.',
      lede: 'Blue carbon systems store carbon per hectare at multiples of terrestrial forest, and protect the coastline while doing it. CE² extends the restoration programme from the dry interior to the shore.',
      kpis: ['Mangroves', 'Ocean alkalinity', 'Coral reefs'],
      metrics: [ { v: 'Mangrove', l: 'Blue carbon core' }, { v: 'Alkalinity', l: 'Ocean CDR pathway' }, { v: 'Reef', l: 'Biodiversity anchor' } ],
      blocks: [
        { h: 'Three coastal pathways', items: [
          '<b>Mangrove protection &amp; replanting</b> — dense below-ground carbon storage plus storm-surge and erosion defence.',
          '<b>Ocean alkalinity enhancement</b> — raising seawater alkalinity so the ocean absorbs and durably retains more CO₂.',
          '<b>Coral reef restoration</b> — substrate stabilisation and coral propagation to rebuild reef structure and fisheries.'
        ]},
        { h: 'Community and monitoring', items: [
          'Coastal communities are engaged as custodians on the same reciprocal logic used inland.',
          'Sites are monitored for survival, cover and carbon accumulation over time.',
          'Reef and mangrove recovery restores local fisheries — an immediate livelihood return.',
          'Extends CE² from a single-district facility to a landscape-and-seascape carbon programme.'
        ]}
      ]
    }
  ];

  var SETS = { process: PROCESS, product: PRODUCTS, horizon: HORIZONS };

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
    var chips = p.metrics.map(function (m) { return '<span class="chip"><b>' + m.v + '</b> ' + m.l + '</span>'; }).join('');
    var sec = document.createElement('div');
    sec.className = 'step';
    sec.dataset.step = String(i);
    sec.innerHTML =
      '<article class="step__card" data-open="process" data-index="' + i + '" tabindex="0" role="button">' +
        '<div class="step__top">' +
          '<span class="step__num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="step__tag">' + p.tag + '</span>' +
        '</div>' +
        '<h3>' + p.title + '</h3><p>' + p.short + '</p>' +
        '<div class="step__chips">' + chips + '</div>' +
        '<span class="step__more">Open technical data</span>' +
      '</article>';
    stepsHost.appendChild(sec);
  });

  /* --- product cards ----------------------------------------------------- */
  var productHost = $('#productGrid');
  PRODUCTS.forEach(function (p, i) {
    var forms = p.forms.map(function (f) { return '<span class="chip">' + f + '</span>'; }).join('');
    var card = document.createElement('article');
    card.className = 'product reveal';
    card.setAttribute('data-open', 'product');
    card.setAttribute('data-index', String(i));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.innerHTML =
      '<div class="product__glow" style="background:radial-gradient(circle,' + p.glow + ',transparent 68%)"></div>' +
      '<div class="product__swatch" style="background:' + p.swatch + '"></div>' +
      '<span class="product__tag">' + p.tag + '</span>' +
      '<h3>' + p.title + '</h3>' +
      '<p>' + p.short + '</p>' +
      '<div class="product__rate"><b>' + p.rate.v + '</b><span>' + p.rate.l + '</span></div>' +
      '<div class="product__forms">' + forms + '</div>' +
      '<span class="step__more">Open product sheet</span>';
    productHost.appendChild(card);
  });

  /* --- carbon restoration flow ------------------------------------------- */
  var flowHost = $('#carbonFlow');
  RESTORATION.forEach(function (r, i) {
    var sec = document.createElement('div');
    sec.className = 'flow__step';
    sec.dataset.flow = String(i);
    sec.innerHTML =
      '<article class="flow__card">' +
        '<span class="flow__depth">' + r.depth + '</span>' +
        '<h3>' + r.title + '</h3><p>' + r.body + '</p>' +
        '<div class="flow__meter"><i style="width:' + r.meter + '%"></i></div>' +
        '<p class="flow__note">' + r.note + '</p>' +
      '</article>';
    flowHost.appendChild(sec);
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
      '<div class="horizon__glow"></div><div class="horizon__icon">' + h.icon + '</div>' +
      '<p class="eyebrow eyebrow--good">' + h.tag + '</p>' +
      '<h3>' + h.title + '</h3><p>' + h.short + '</p>' +
      '<div class="horizon__kpis">' + kpis + '</div>' +
      '<span class="step__more">Open detail</span>';
    horizonHost.appendChild(card);
  });

  /* --- projected 3D hotspot markers -------------------------------------- */
  var markers = [];
  function buildMarker(label, badge, kind, dataIndex, variant) {
    var b = document.createElement('button');
    b.className = 'hs' + (variant ? ' hs--' + variant : '');
    b.type = 'button';
    b.setAttribute('data-open', kind);
    b.setAttribute('data-index', String(dataIndex));
    b.innerHTML = '<span class="hs__ring">' + badge + '</span><span class="hs__label">' + label + '</span>';
    hotspotEl.appendChild(b);
    return b;
  }
  PROCESS.forEach(function (p, i) {
    markers.push({ el: buildMarker(p.title, String(i + 1).padStart(2, '0'), 'process', i, null), group: 'plant', i: i });
  });
  PRODUCTS.forEach(function (p, i) {
    markers.push({ el: buildMarker(p.title, 'P' + (i + 1), 'product', i, 'sand'), group: 'product', i: i });
  });
  HORIZONS.forEach(function (h, i) {
    markers.push({ el: buildMarker(h.title, 'H' + (i + 1), 'horizon', i, null), group: 'horizon', i: i });
  });

  /* =======================================================================
     3. MODAL
     ===================================================================== */
  var modal    = $('#modal');
  var mIdx     = $('#modalIdx');
  var mKicker  = $('#modalKicker');
  var mTitle   = $('#modalTitle');
  var mLede    = $('#modalLede');
  var mMetrics = $('#modalMetrics');
  var mBody    = $('#modalBody');
  var mPrev    = $('#modalPrev');
  var mNext    = $('#modalNext');
  var modalState = { set: 'process', index: 0, open: false };
  var lastFocus = null;

  var BADGE = { process: function (i) { return String(i + 1).padStart(2, '0'); },
                product: function (i) { return 'P' + (i + 1); },
                horizon: function (i) { return 'H' + (i + 1); } };
  var MARKER_GROUP = { process: 'plant', product: 'product', horizon: 'horizon' };

  function renderModal(setName, index) {
    var data = SETS[setName] || PROCESS;
    index = clamp(index, 0, data.length - 1);
    var d = data[index];

    modalState.set = setName;
    modalState.index = index;

    mIdx.textContent    = BADGE[setName](index);
    mKicker.textContent = d.tag + ' · ' + d.sub;
    mTitle.textContent  = d.title;
    mLede.textContent   = d.lede;

    mMetrics.innerHTML = d.metrics.map(function (m) {
      return '<div class="metric"><b>' + m.v + '</b><span>' + m.l + '</span></div>';
    }).join('');
    mBody.innerHTML = d.blocks.map(function (b) {
      return '<h4>' + b.h + '</h4><ul>' + b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul>';
    }).join('');

    mPrev.disabled = index === 0;
    mNext.disabled = index === data.length - 1;

    setActiveHotspot(MARKER_GROUP[setName], index);
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
    var data = SETS[modalState.set];
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
     4. NAV, REVEALS, COUNTERS, SECTION TRACKING
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

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(function (el) { revealObs.observe(el); });

  function runCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var t0 = performance.now(), dur = 1500;
      (function tick(now) {
        var p = clamp((now - t0) / dur, 0, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* which process step / flow step the reader is on */
  var activeStep = -1;
  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-live');
        activeStep = parseInt(en.target.dataset.step, 10);
        setActiveHotspot('plant', activeStep);
      } else { en.target.classList.remove('is-live'); }
    });
  }, { threshold: 0.5 });
  $$('.step').forEach(function (el) { stepObs.observe(el); });

  var activeFlow = -1;
  var flowObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-live');
        activeFlow = parseInt(en.target.dataset.flow, 10);
      } else { en.target.classList.remove('is-live'); }
    });
  }, { threshold: 0.5 });
  $$('.flow__step').forEach(function (el) { flowObs.observe(el); });

  function setActiveHotspot(group, i) {
    markers.forEach(function (m) { m.el.classList.toggle('is-active', m.group === group && m.i === i); });
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
  var starField, earthGroup, terrainGroup, plantGroup, productGroup, soilGroup, horizonGroup;
  var globePoints, smogPoints, healPoints, atmosphere, earthCore, earthWire, regionPin;
  var kilns = [], plantRing, plantSpin, plantCore;
  var processNodes = [], productNodes = [], horizonNodes = [];
  var dustPoints, carbonFall, charSpecks, lockGlow, scrub = [];
  var raycaster, pointer, projected, tmpV;
  var running = false;

  var PY = GROUND + 1.35;              /* the pyrolysis unit's origin height */
  var bgColor, fogColor;               /* THREE.Color, allocated in initThree */

  function freshState() {
    return {
      pollution: 0.5, restoration: 0.02,
      plant: 0, terrain: 0, products: 0, prodLift: 0, soil: 0,
      earthFade: 1, earthScale: 0.95,
      earthPos:  new V3(3.3, -0.9, -1.5),
      camPos:    new V3(0, 0.7, 13.2),
      camTarget: new V3(0.5, 0.1, 0),
      bg:        new V3(0x05 / 255, 0x0a / 255, 0x07 / 255)
    };
  }
  var state  = freshState();
  var target = freshState();
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  /* --- helpers ----------------------------------------------------------- */
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
      pts[i * 3] = Math.cos(th) * r * radius;
      pts[i * 3 + 1] = y * radius;
      pts[i * 3 + 2] = Math.sin(th) * r * radius;
    }
    return pts;
  }
  function latLonToVec3(lat, lon, radius) {
    var p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-radius * Math.sin(p) * Math.cos(t), radius * Math.cos(p), radius * Math.sin(p) * Math.sin(t));
  }
  function glowMat(hex, opacity) {
    return new THREE.MeshBasicMaterial({
      color: hex, transparent: true, opacity: opacity === undefined ? 1 : opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
  }
  function solidMat(hex, rough, metal, flat) {
    return new THREE.MeshStandardMaterial({
      color: hex, roughness: rough === undefined ? 0.85 : rough,
      metalness: metal === undefined ? 0.1 : metal, flatShading: !!flat
    });
  }

  /* --- shaders ----------------------------------------------------------- */
  var GLOBE_VS = [
    'attribute float aRand;', 'uniform float uSize;', 'uniform float uScale;', 'varying float vR;',
    'void main(){',
    '  vR = aRand;',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = uSize * (0.65 + aRand * 0.75) * (uScale / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var GLOBE_FS = [
    'uniform vec3 uHot;', 'uniform vec3 uCold;', 'uniform float uMix;', 'uniform float uOpacity;',
    'varying float vR;',
    'void main(){',
    '  vec2 c = gl_PointCoord - vec2(0.5);',
    '  float d = length(c);',
    '  if (d > 0.5) discard;',
    '  float a = smoothstep(0.5, 0.06, d);',
    '  float m = clamp(uMix + (vR - 0.5) * 0.45, 0.0, 1.0);',
    '  gl_FragColor = vec4(mix(uHot, uCold, m), a * uOpacity);',
    '}'
  ].join('\n');

  var DRIFT_VS = [
    'attribute float aRand;', 'uniform float uTime;', 'uniform float uSize;',
    'uniform float uScale;', 'uniform float uSpread;', 'varying float vR;',
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

  /* vertical rain, used for dust on the land and carbon sinking into soil */
  var FALL_VS = [
    'attribute float aRand;', 'uniform float uTime;', 'uniform float uSize;',
    'uniform float uScale;', 'uniform float uSpan;', 'uniform float uSpeed;', 'varying float vR;',
    'void main(){',
    '  vR = aRand;',
    '  vec3 p = position;',
    '  p.y = mod(p.y - uTime * uSpeed * (0.5 + aRand), uSpan) - uSpan * 0.5;',
    '  p.x += sin(uTime * 0.4 + aRand * 6.283) * 0.25;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_PointSize = uSize * (0.5 + aRand) * (uScale / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var DRIFT_FS = [
    'uniform vec3 uA;', 'uniform vec3 uB;', 'uniform float uOpacity;', 'varying float vR;',
    'void main(){',
    '  vec2 c = gl_PointCoord - vec2(0.5);',
    '  float d = length(c);',
    '  if (d > 0.5) discard;',
    '  gl_FragColor = vec4(mix(uA, uB, vR), smoothstep(0.5, 0.0, d) * uOpacity);',
    '}'
  ].join('\n');

  var ATMO_VS = [
    'varying vec3 vN;',
    'void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n');

  var ATMO_FS = [
    'uniform vec3 uColorA;', 'uniform vec3 uColorB;', 'uniform float uMix;', 'uniform float uPower;',
    'varying vec3 vN;',
    'void main(){',
    // BackSide sphere: dot runs -1 dead centre to 0 at the limb, so key the
    // glow off the limb to get a rim rather than a blob behind the planet.
    '  float f = 1.0 - abs(dot(vN, vec3(0.0, 0.0, 1.0)));',
    '  float i = pow(clamp(f, 0.0, 1.0), 3.0);',
    '  gl_FragColor = vec4(mix(uColorA, uColorB, uMix), 1.0) * i * uPower;',
    '}'
  ].join('\n');

  /* --- particle field builders ------------------------------------------- */
  function makeDriftField(count, rMin, rMax, colA, colB, size) {
    var pos = new Float32Array(count * 3), rnd = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
      var r = rMin + Math.pow(Math.random(), 0.7) * (rMax - rMin);
      var s = Math.sqrt(Math.max(0, 1 - u * u));
      pos[i * 3] = Math.cos(th) * s * r;
      pos[i * 3 + 1] = u * r * 0.82;
      pos[i * 3 + 2] = Math.sin(th) * s * r;
      rnd[i] = Math.random();
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    var m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uSize: { value: size || (IS_SMALL ? 0.05 : 0.062) },
        uScale: { value: viewScale() }, uSpread: { value: 0 }, uOpacity: { value: 0 },
        uA: { value: new THREE.Color(colA) }, uB: { value: new THREE.Color(colB) }
      },
      vertexShader: DRIFT_VS, fragmentShader: DRIFT_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    registerPoints(m);
    return new THREE.Points(g, m);
  }

  function makeFallField(count, w, span, d, colA, colB, size, speed) {
    var pos = new Float32Array(count * 3), rnd = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * w;
      pos[i * 3 + 1] = (Math.random() - 0.5) * span;
      pos[i * 3 + 2] = (Math.random() - 0.5) * d;
      rnd[i] = Math.random();
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    var m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uSize: { value: size }, uScale: { value: viewScale() },
        uSpan: { value: span }, uSpeed: { value: speed }, uOpacity: { value: 0 },
        uA: { value: new THREE.Color(colA) }, uB: { value: new THREE.Color(colB) }
      },
      vertexShader: FALL_VS, fragmentShader: DRIFT_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    registerPoints(m);
    return new THREE.Points(g, m);
  }

  /* --- the planet -------------------------------------------------------- */
  function buildEarth() {
    earthGroup = new THREE.Group();

    earthCore = new THREE.Mesh(new THREE.SphereGeometry(1.97, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x08160f, roughness: 0.95, metalness: 0.1,
        emissive: new THREE.Color(0x0a3a2c), emissiveIntensity: 0.5 }));
    earthGroup.add(earthCore);

    var N = IS_SMALL ? 3200 : 7000;
    var rnd = new Float32Array(N);
    for (var i = 0; i < N; i++) rnd[i] = Math.random();
    var gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.BufferAttribute(fibonacciSphere(N, 2.02), 3));
    gg.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    globePoints = new THREE.Points(gg, registerPoints(new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: IS_SMALL ? 0.045 : 0.055 }, uScale: { value: viewScale() },
        uHot: { value: new THREE.Color(0xE2542F) }, uCold: { value: new THREE.Color(0x2FBF77) },
        uMix: { value: 0 }, uOpacity: { value: 0.95 }
      },
      vertexShader: GLOBE_VS, fragmentShader: GLOBE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    })));
    earthGroup.add(globePoints);

    earthWire = new THREE.Mesh(new THREE.SphereGeometry(2.05, 26, 18),
      new THREE.MeshBasicMaterial({ color: 0x2FBF77, wireframe: true, transparent: true, opacity: 0.055 }));
    earthGroup.add(earthWire);

    atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.42, 48, 48), new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(0xE2542F) }, uColorB: { value: new THREE.Color(0x5FC9B0) },
        uMix: { value: 0 }, uPower: { value: 1.0 }
      },
      vertexShader: ATMO_VS, fragmentShader: ATMO_FS,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    earthGroup.add(atmosphere);

    /* Anantapur / Sri Sathya Sai — 14.68° N, 77.60° E */
    regionPin = new THREE.Group();
    var pinPos = latLonToVec3(14.68, 77.60, 2.06);
    var pinDot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), new THREE.MeshBasicMaterial({ color: 0xD9B382 }));
    pinDot.position.copy(pinPos);
    var pinRing = new THREE.Mesh(new THREE.RingGeometry(0.10, 0.135, 32),
      new THREE.MeshBasicMaterial({ color: 0xD9B382, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    pinRing.position.copy(pinPos);
    pinRing.lookAt(pinPos.clone().multiplyScalar(3));
    regionPin.add(pinDot, pinRing);
    regionPin.userData.ring = pinRing;
    earthGroup.add(regionPin);

    smogPoints = makeDriftField(IS_SMALL ? 1400 : 3200, 2.15, 3.9, 0xE2542F, 0x7d6a5f);
    earthGroup.add(smogPoints);
    healPoints = makeDriftField(IS_SMALL ? 1200 : 2800, 2.1, 4.4, 0x7BD16A, 0x5FC9B0);
    earthGroup.add(healPoints);

    scene.add(earthGroup);
  }

  /* --- the land: Anantapur at ground level ------------------------------- */
  function buildTerrain() {
    terrainGroup = new THREE.Group();
    terrainGroup.position.set(0, GROUND, 0);
    terrainGroup.visible = false;

    var seg = IS_SMALL ? 40 : 70;
    var geo = new THREE.PlaneGeometry(90, 90, seg, seg);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i);
      var h = Math.sin(x * 0.14) * Math.cos(y * 0.11) * 0.9
            + Math.sin(x * 0.37 + 1.4) * Math.cos(y * 0.31) * 0.85
            + Math.sin((x + y) * 0.06) * 1.4;
      var edge = Math.min(1, Math.hypot(x, y) / 42);
      pos.setZ(i, h - edge * edge * 5.0);   /* falls away at the horizon */
    }
    geo.computeVertexNormals();
    var ground = new THREE.Mesh(geo, solidMat(0x4a3a22, 1.0, 0.0, true));
    ground.rotation.x = -Math.PI / 2;
    terrainGroup.add(ground);

    /* invasive juliflora scrub, thinning toward the plant side */
    var scrubMat = solidMat(0x3a4728, 0.95, 0.0, true);
    var trunkMat = solidMat(0x33281a, 1.0, 0.0, true);
    for (var s = 0; s < (IS_SMALL ? 34 : 72); s++) {
      var a = Math.random() * Math.PI * 2;
      var r = 4 + Math.pow(Math.random(), 0.55) * 24;   /* clustered near the camera */
      var g2 = new THREE.Group();
      var sz = 0.6 + Math.random() * 1.25;
      var bush = new THREE.Mesh(new THREE.IcosahedronGeometry(sz, 0), scrubMat);
      bush.position.y = sz * 0.9;
      bush.scale.set(1, 0.72, 1);
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, sz * 0.9, 5), trunkMat);
      trunk.position.y = sz * 0.45;
      g2.add(trunk, bush);
      g2.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      g2.rotation.y = Math.random() * 3.14;
      terrainGroup.add(g2);
      scrub.push(g2);
    }

    /* dry dust hanging over the land */
    dustPoints = makeFallField(IS_SMALL ? 500 : 1200, 60, 14, 40, 0xD9B382, 0x8a7355, 0.055, 0.35);
    dustPoints.position.y = 5;
    terrainGroup.add(dustPoints);

    scene.add(terrainGroup);
  }

  /* --- the pyrolysis unit ------------------------------------------------ */
  function buildPlant() {
    plantGroup = new THREE.Group();
    plantGroup.position.set(3.9, PY, 0);
    plantGroup.visible = false;

    var base = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.28, 64), solidMat(0x131f18, 0.72, 0.35));
    base.position.y = -1.5;
    plantGroup.add(base);

    var baseRim = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.026, 8, 96), glowMat(0x2FBF77, 0.8));
    baseRim.rotation.x = Math.PI / 2; baseRim.position.y = -1.35;
    plantGroup.add(baseRim);

    plantCore = new THREE.Group();
    var column = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 2.9, 32),
      new THREE.MeshStandardMaterial({ color: 0x182822, roughness: 0.4, metalness: 0.8,
        emissive: new THREE.Color(0x0d5f4a), emissiveIntensity: 0.55 }));
    column.position.y = 0.05;
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2), solidMat(0x1f352c, 0.3, 0.9));
    cap.position.y = 1.5;
    var stack = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.5, 20), solidMat(0x24382f, 0.5, 0.7));
    stack.position.set(0.95, 1.0, -0.35);
    var coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.30, 24, 24), glowMat(0x2FBF77, 0.28));
    coreGlow.position.y = 0.35;
    plantCore.add(column, cap, stack, coreGlow);
    plantGroup.add(plantCore);

    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      var k = new THREE.Group();
      var body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.15, 26),
        new THREE.MeshStandardMaterial({ color: 0x16241d, roughness: 0.55, metalness: 0.65,
          emissive: new THREE.Color(0x1a4a3a), emissiveIntensity: 0.35 }));
      var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.09, 26),
        new THREE.MeshStandardMaterial({ color: 0x2FBF77, roughness: 0.3, metalness: 0.6,
          emissive: new THREE.Color(0x2FBF77), emissiveIntensity: 0.35 }));
      lid.position.y = 0.62;
      var flame = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 18), glowMat(0xF0913A, 0.28));
      flame.position.y = 0.78;
      var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.55, 10), solidMat(0x2c4038, 0.5, 0.8));
      pipe.rotation.z = Math.PI / 2; pipe.position.set(-0.85, 0.45, 0);
      k.add(body, lid, flame, pipe);
      k.position.set(Math.cos(a) * 2.35, -0.78, Math.sin(a) * 2.35);
      k.rotation.y = -a;
      k.userData = { flame: flame, lid: lid, phase: i * 0.9 };
      plantGroup.add(k);
      kilns.push(k);
    }

    plantRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.012, 8, 140), glowMat(0x5FC9B0, 0.55));
    plantRing.rotation.x = Math.PI / 2; plantRing.position.y = 0.35;
    plantGroup.add(plantRing);
    plantSpin = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.008, 8, 120), glowMat(0x2FBF77, 0.45));
    plantSpin.rotation.x = Math.PI / 2.35; plantSpin.position.y = 0.9;
    plantGroup.add(plantSpin);

    var dust = makeDriftField(IS_SMALL ? 260 : 620, 2.6, 3.4, 0x2FBF77, 0x5FC9B0, 0.056);
    plantGroup.add(dust);
    plantGroup.userData.dust = dust;

    var NODE_POS = [
      [-3.05,  0.95,  1.25], [ 0.00, 2.35,  0.00], [ 2.55, 0.20,  1.85],
      [ 3.15,  0.75, -1.35], [-1.70, 1.55, -2.55], [-2.30, -0.55, -2.05]
    ];
    PROCESS.forEach(function (p, i) {
      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.125, 1), glowMat(0x2FBF77, 0.7));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 18), glowMat(0x2FBF77, 0.13));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.008, 8, 40), glowMat(0x5FC9B0, 0.75));
      ring.rotation.x = Math.PI / 2;
      n.add(core, halo, ring);
      n.position.fromArray(NODE_POS[i]);
      n.userData = { kind: 'process', index: i, core: core, halo: halo, ring: ring, phase: i * 1.1 };
      core.userData.hot = n; halo.userData.hot = n;
      plantGroup.add(n);
      processNodes.push(n);
    });

    scene.add(plantGroup);
  }

  /* --- the product line on a display platter ----------------------------- */
  function buildProducts() {
    productGroup = new THREE.Group();
    productGroup.position.set(0, GROUND + 0.35, 0);
    productGroup.visible = false;

    var platter = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.7, 0.26, 72), solidMat(0x141f19, 0.8, 0.25));
    productGroup.add(platter);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.02, 8, 110), glowMat(0x2FBF77, 0.6));
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.14;
    productGroup.add(rim);

    var charMat  = solidMat(0x14140f, 0.98, 0.02, true);
    var briqMat  = solidMat(0x2a231c, 0.9, 0.05);
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x9a6520, roughness: 0.25, metalness: 0.25,
      transparent: true, opacity: 0.85, emissive: new THREE.Color(0x5c3a0e), emissiveIntensity: 0.35 });
    var tarMat   = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.2, metalness: 0.5 });

    /** each builder returns a group sitting on the platter */
    var BUILD = [
      function () {                                   /* 01 biochar granules */
        var g = new THREE.Group();
        for (var i = 0; i < 14; i++) {
          var r = 0.10 + Math.random() * 0.09;
          var m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), charMat);
          var a = Math.random() * Math.PI * 2, d = Math.random() * 0.42;
          m.position.set(Math.cos(a) * d, r * 0.85 + Math.random() * 0.12, Math.sin(a) * d);
          m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
          g.add(m);
        }
        return g;
      },
      function () {                                   /* 02 the three briquettes */
        var g = new THREE.Group();
        var pillow = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), briqMat);
        pillow.scale.set(1, 0.62, 0.78); pillow.position.set(-0.46, 0.17, 0.06);
        var hexa = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.5, 6), briqMat);
        hexa.position.set(0.06, 0.25, -0.1);
        var honey = new THREE.Group();
        honey.add(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.34, 22), briqMat));
        for (var h = 0; h < 6; h++) {
          var ha = (h / 6) * Math.PI * 2;
          var hole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 8), solidMat(0x050806, 1, 0));
          hole.position.set(Math.cos(ha) * 0.14, 0, Math.sin(ha) * 0.14);
          honey.add(hole);
        }
        honey.add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 8), solidMat(0x050806, 1, 0)));
        honey.position.set(0.55, 0.19, 0.12);
        g.add(pillow, hexa, honey);
        return g;
      },
      function () {                                   /* 03 wood vinegar */
        var g = new THREE.Group();
        var jar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.66, 22), glassMat);
        jar.position.y = 0.35;
        var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.2, 16), glassMat);
        neck.position.y = 0.76;
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 16), solidMat(0x3d5c46, 0.6, 0.3));
        cap.position.y = 0.9;
        g.add(jar, neck, cap);
        return g;
      },
      function () {                                   /* 04 wood tar oil */
        var g = new THREE.Group();
        var drum = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.62, 22), tarMat);
        drum.position.y = 0.33;
        for (var b = 0; b < 2; b++) {
          var band = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.018, 8, 26), solidMat(0x4a3a2a, 0.6, 0.4));
          band.rotation.x = Math.PI / 2; band.position.y = 0.2 + b * 0.26;
          g.add(band);
        }
        g.add(drum);
        return g;
      },
      function () {                                   /* 05 durable carbon credit */
        var g = new THREE.Group();
        var token = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 32),
          new THREE.MeshStandardMaterial({ color: 0x17A05C, roughness: 0.3, metalness: 0.7,
            emissive: new THREE.Color(0x2FBF77), emissiveIntensity: 0.5 }));
        token.rotation.x = 1.15; token.position.y = 0.46;
        var halo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.012, 8, 44), glowMat(0x7BD16A, 0.7));
        halo.rotation.x = Math.PI / 2 + 1.15; halo.position.y = 0.46;
        g.add(token, halo);
        g.userData.spin = token;
        return g;
      }
    ];

    PRODUCTS.forEach(function (p, i) {
      var a = (i / PRODUCTS.length) * Math.PI * 2 - Math.PI / 2;
      var slot = new THREE.Group();
      slot.position.set(Math.cos(a) * 2.25, 0.13, Math.sin(a) * 2.25);

      var plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.80, 0.16, 26), solidMat(0x1b2a22, 0.85, 0.2));
      slot.add(plinth);
      var item = BUILD[i]();
      item.position.y = 0.08;
      item.scale.setScalar(1.7);   /* readable at the act's camera distance */
      slot.add(item);

      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.115, 1), glowMat(0xD9B382, 0.75));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 18), glowMat(0xD9B382, 0.13));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.008, 8, 40), glowMat(0x7BD16A, 0.7));
      ring.rotation.x = Math.PI / 2;
      n.add(core, halo, ring);
      n.position.set(0, 2.05, 0);
      n.userData = { kind: 'product', index: i, core: core, halo: halo, ring: ring, phase: i * 1.3 };
      core.userData.hot = n; halo.userData.hot = n;
      slot.add(n);

      slot.userData = { item: item, node: n, phase: i * 0.8 };
      productGroup.add(slot);
      productNodes.push(n);
      productGroup.userData['slot' + i] = slot;
    });

    productGroup.userData.slots = PRODUCTS.map(function (_, i) { return productGroup.userData['slot' + i]; });
    scene.add(productGroup);
  }

  /* --- the soil profile: where the carbon ends up ------------------------ */
  function buildSoil() {
    soilGroup = new THREE.Group();
    soilGroup.position.set(0, UNDER, 0);
    soilGroup.visible = false;

    var W = 13, D = 5.0;
    var FACE = D * 0.5;   /* the exposed cross-section plane */
    [ { h: 1.5, y: 1.85, c: 0x3a2a1a },   /* topsoil — where the char goes */
      { h: 1.9, y: 0.15, c: 0x574024 },   /* subsoil */
      { h: 2.2, y: -1.9, c: 0x36332c }    /* weathering parent material */
    ].forEach(function (L) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(W, L.h, D), solidMat(L.c, 1.0, 0.0, true));
      m.position.y = L.y;
      soilGroup.add(m);
    });

    /* surface crust and a thin line of standing crop */
    var crust = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), solidMat(0x7a6240, 1.0, 0.0, true));
    crust.position.y = 2.66;
    soilGroup.add(crust);
    for (var c = 0; c < 16; c++) {
      var stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.55 + Math.random() * 0.3, 5),
        solidMat(0x4e7c3a, 0.9, 0, true));
      stalk.position.set((Math.random() - 0.5) * (W - 1), 2.98, (Math.random() - 0.5) * (D - 1.2));
      stalk.rotation.z = (Math.random() - 0.5) * 0.3;
      soilGroup.add(stalk);
    }

    /* biochar embedded in the root zone — dark, so it reads against the soil */
    var SP = IS_SMALL ? 260 : 620;
    var sp = new Float32Array(SP * 3);
    for (var i = 0; i < SP; i++) {
      sp[i * 3]     = (Math.random() - 0.5) * (W - 0.6);
      sp[i * 3 + 1] = 1.15 + Math.random() * 1.4;
      /* held just proud of the cut face — inside the block they would be
         hidden by the soil itself and the whole point would be invisible */
      sp[i * 3 + 2] = FACE + 0.02 + Math.random() * 0.05;
    }
    var sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    charSpecks = new THREE.Points(sg, new THREE.PointsMaterial({
      color: 0x090908, size: 0.13, sizeAttenuation: true, transparent: true, opacity: 1
    }));
    soilGroup.add(charSpecks);

    /* a root reaching down through the char layer */
    var rootMat = solidMat(0x9a875c, 0.95, 0, true);
    function root(x, z, len, r0) {
      var tap = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.35, r0, len, 6), rootMat);
      tap.position.set(x, 2.6 - len / 2, z);
      soilGroup.add(tap);
      /* hang each branch from the taproot tip: for a rotation of a about z the
         cylinder's top end sits at centre + (-sin a, cos a) * lb/2 */
      var yTip = 2.6 - len, lb = len * 0.55;
      [-0.62, 0.62].forEach(function (a) {
        var br = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.18, r0 * 0.45, lb, 5), rootMat);
        br.position.set(x + Math.sin(a) * lb / 2, yTip - Math.cos(a) * lb / 2, z);
        br.rotation.z = a;
        soilGroup.add(br);
      });
    }
    root(-4.0, FACE + 0.05, 2.1, 0.085);
    root(0.4, FACE + 0.05, 2.6, 0.095);
    root(4.4, FACE + 0.05, 1.9, 0.08);

    /* the band where carbon is held — a soft glow at char depth */
    lockGlow = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 1.3, 0.1), glowMat(0x2FBF77, 0.0));
    lockGlow.position.set(0, 1.85, FACE + 0.12);
    soilGroup.add(lockGlow);

    /* carbon sinking in from the surface */
    carbonFall = makeFallField(IS_SMALL ? 400 : 900, W - 1, 7, 0.5, 0x7BD16A, 0x2b2b24, 0.06, 0.9);
    carbonFall.position.set(0, 3.4, FACE + 0.25);
    soilGroup.add(carbonFall);

    scene.add(soilGroup);
  }

  /* --- restoration nodes in orbit ---------------------------------------- */
  function buildHorizons() {
    horizonGroup = new THREE.Group();
    horizonGroup.visible = false;

    var COLORS = [0x7BD16A, 0xC2703D, 0x5FC9B0];
    var ANGLES = [0.35, 2.44, 4.53];
    var HEIGHT = [1.25, -0.15, -1.40];

    HORIZONS.forEach(function (h, i) {
      var n = new THREE.Group(), col = COLORS[i];
      var core  = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), glowMat(col, 0.55));
      var halo  = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), glowMat(col, 0.12));
      var ring  = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.01, 8, 56), glowMat(col, 0.8));
      var ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.006, 8, 64), glowMat(col, 0.4));
      ring.rotation.x = Math.PI / 2.6; ring2.rotation.x = Math.PI / 1.7;
      n.add(core, halo, ring, ring2);
      n.position.set(Math.cos(ANGLES[i]) * 3.3, HEIGHT[i], Math.sin(ANGLES[i]) * 3.3);
      n.userData = { kind: 'horizon', index: i, core: core, halo: halo, ring: ring, ring2: ring2, phase: i * 2.1 };
      core.userData.hot = n; halo.userData.hot = n;
      horizonGroup.add(n);
      horizonNodes.push(n);
    });
    scene.add(horizonGroup);
  }

  function buildStars() {
    var n = IS_SMALL ? 900 : 2200;
    var pos = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var r = 55 + Math.random() * 90, u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
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
        uSize: { value: 0.30 }, uScale: { value: viewScale() },
        uHot: { value: new THREE.Color(0xdfe9e2) }, uCold: { value: new THREE.Color(0xa9e0cd) },
        uMix: { value: 0.5 }, uOpacity: { value: 0.85 }
      },
      vertexShader: GLOBE_VS, fragmentShader: GLOBE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    })));
    scene.add(starField);
  }

  function initThree() {
    scene = new THREE.Scene();
    bgColor  = new THREE.Color(0x050a07);
    fogColor = new THREE.Color(0x050a07);
    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.014);

    camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(state.camPos.x, state.camPos.y, state.camPos.z);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !IS_SMALL, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_SMALL ? 1.6 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(bgColor, 1);
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

    /* standard lighting rig */
    var ambient = new THREE.AmbientLight(0x4a6a58, 0.55);
    scene.add(ambient);
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 4, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x5FC9B0, 0.5);
    rim.position.set(-7, -2, -5);
    scene.add(rim);
    var emberLight = new THREE.PointLight(0xE2542F, 2.2, 26, 2);
    emberLight.position.set(-3.6, 1.4, 3.2);
    scene.add(emberLight);
    var lifeLight = new THREE.PointLight(0x2FBF77, 0.0, 30, 2);
    lifeLight.position.set(3.4, 2.0, 3.4);
    scene.add(lifeLight);
    /* a warm low sun that travels with the camera through the ground acts */
    var sunLight = new THREE.DirectionalLight(0xffd9a0, 0.0);
    sunLight.position.set(-14, GROUND + 9, 12);
    scene.add(sunLight);

    scene.userData = { emberLight: emberLight, lifeLight: lifeLight, sunLight: sunLight, key: key, ambient: ambient };

    buildStars();
    buildEarth();
    buildTerrain();
    buildPlant();
    buildProducts();
    buildSoil();
    buildHorizons();

    running = true;
  }

  /* Structural (non-additive) materials fade with their group so a layer can
     dissolve rather than pop. Additive glows are driven per frame instead. */
  function collectSolids(root) {
    var out = [], seen = [];
    root.traverse(function (o) {
      var m = o.material;
      if (!m || Array.isArray(m) || m.blending === THREE.AdditiveBlending) return;
      if (seen.indexOf(m) >= 0) return;
      seen.push(m);
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      out.push(m);
    });
    return out;
  }
  function setSolids(mats, k) {
    var t = k < 0.995;
    for (var i = 0; i < mats.length; i++) {
      mats[i].transparent = t;
      mats[i].opacity = mats[i].userData.baseOpacity * k;
    }
  }
  var terrainMats, productMats, soilMats;

  /* =======================================================================
     6. THE JOURNEY — camera stations anchored to DOM elements
     ===================================================================== */
  var STATIONS = [
    { sel: '#hero', dot: 0,
      cam: [0, 0.7, 13.2], tgt: [0.5, 0.1, 0], bg: 0x050a07,
      poll: 0.50, rest: 0.02, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [3.3, -0.9, -1.5], earthScale: 0.95 },

    { sel: '#problem', dot: 1,
      cam: [2.2, 1.0, 10.5], tgt: [0.3, 0.05, 0], bg: 0x140b06,
      poll: 1.00, rest: 0.00, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [4.5, 0.2, -1.0], earthScale: 1.05 },

    { sel: '#problem .panel', dot: 1, anchor: 'bottom',
      cam: [2.6, 0.6, 9.4], tgt: [0.3, 0.0, 0], bg: 0x160c06,
      poll: 1.00, rest: 0.00, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [4.5, 0.2, -1.0], earthScale: 1.05 },

    /* falling out of orbit toward the district */
    { sel: '.dive-lead', dot: 2,
      cam: [1.4, -14, 9.5], tgt: [0.7, -20, 0], bg: 0x1a1108,
      poll: 0.70, rest: 0.05, earthFade: 0.30, terrain: 0.35, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [1.0, 0, -1.0], earthScale: 1.0 },

    /* on the ground in Anantapur */
    { sel: '.panel--land', dot: 2,
      cam: [0, GROUND + 2.6, 12.5], tgt: [0.8, GROUND + 0.8, 0], bg: 0x241606,
      poll: 0.45, rest: 0.12, earthFade: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.panel--land', dot: 2, anchor: 'bottom',
      cam: [0.6, GROUND + 2.2, 11.0], tgt: [0.8, GROUND + 0.7, 0], bg: 0x241606,
      poll: 0.40, rest: 0.15, earthFade: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* the pyrolysis unit, standing on that ground */
    { sel: '#solution', dot: 3,
      cam: [0.4, PY + 1.3, 11.8], tgt: [0.2, PY - 0.30, 0], bg: 0x0d1a10,
      poll: 0.30, rest: 0.30, earthFade: 0, terrain: 1, plant: 1, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.step:last-child', dot: 3, anchor: 'bottom',
      cam: [-0.4, PY + 1.0, 11.2], tgt: [0.2, PY - 0.30, 0], bg: 0x0d1a10,
      poll: 0.22, rest: 0.40, earthFade: 0, terrain: 1, plant: 1, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* the product line */
    { sel: '#products', dot: 4,
      cam: [0, GROUND + 4.4, 9.6], tgt: [0, GROUND - 0.1, 0], bg: 0x0e1a12,
      poll: 0.12, rest: 0.55, earthFade: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.product-reveal', dot: 4,
      cam: [0, GROUND + 4.0, 8.4], tgt: [0, GROUND - 0.35, 0], bg: 0x0e1a12,
      poll: 0.11, rest: 0.57, earthFade: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#productGrid', dot: 4,
      cam: [0, GROUND + 5.6, 10.8], tgt: [0, GROUND + 2.1, 0], bg: 0x0e1a12,
      poll: 0.10, rest: 0.60, earthFade: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 1, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#productsEnd', dot: 4, anchor: 'bottom',
      cam: [0.9, GROUND + 5.4, 10.4], tgt: [0, GROUND + 2.0, 0], bg: 0x0e1a12,
      poll: 0.10, rest: 0.62, earthFade: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 1, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* below the surface */
    { sel: '#restoration', dot: 5,
      cam: [0, UNDER + 3.2, 16.4], tgt: [0.4, UNDER + 0.3, 0], bg: 0x120b06,
      poll: 0.04, rest: 0.75, earthFade: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 1,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#restorationEnd', dot: 5, anchor: 'bottom',
      cam: [0, UNDER + 2.4, 15.0], tgt: [0.4, UNDER - 0.1, 0], bg: 0x120b06,
      poll: 0.02, rest: 0.85, earthFade: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 1,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* back out to orbit, restored */
    { sel: '#horizons', dot: 6,
      cam: [0.2, 0.9, 11.6], tgt: [0, 0, 0], bg: 0x04120b,
      poll: 0.03, rest: 1.00, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#horizonGrid', dot: 6,
      cam: [0, 0.6, 12.0], tgt: [0, 0.2, 0], bg: 0x04120b,
      poll: 0.02, rest: 1.00, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 2.6, -2.0], earthScale: 0.62 },

    { sel: '#contact', dot: 7,
      cam: [0, 3.0, 15.5], tgt: [0, -0.7, 0], bg: 0x050d08,
      poll: 0.00, rest: 1.00, earthFade: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, -1.1, 0], earthScale: 0.92 }
  ];

  /* pre-split the packed bg colours so the journey can interpolate them */
  STATIONS.forEach(function (s) {
    s.bgv = [((s.bg >> 16) & 255) / 255, ((s.bg >> 8) & 255) / 255, (s.bg & 255) / 255];
  });

  var actEls  = STATIONS.map(function (s) { return $(s.sel); });
  var anchors = [];
  var journey = { index: 0, local: 0, global: 0 };

  /** Document-space top (or bottom) of an element. offsetTop is unreliable
      here because .act is position:relative, so nested cards measure locally. */
  function docTop(el, fromBottom) {
    if (!el) return 0;
    var r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY + (fromBottom ? r.height : 0));
  }
  function measure() {
    anchors = actEls.map(function (el, i) { return docTop(el, STATIONS[i].anchor === 'bottom'); });
    for (var i = 1; i < anchors.length; i++) {
      if (anchors[i] <= anchors[i - 1]) anchors[i] = anchors[i - 1] + 1;
    }
  }

  var NUM = ['poll', 'rest', 'earthFade', 'terrain', 'plant', 'prod', 'prodLift', 'soil', 'earthScale'];
  var KEY = { poll: 'pollution', rest: 'restoration', earthFade: 'earthFade',
              terrain: 'terrain', plant: 'plant', prod: 'products', prodLift: 'prodLift',
              soil: 'soil', earthScale: 'earthScale' };

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
    journey.global = clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - vh), 0, 1);

    var a = STATIONS[i], b = STATIONS[i + 1] || STATIONS[i];
    var t = smooth(local);

    for (var k = 0; k < NUM.length; k++) {
      var key = NUM[k];
      target[KEY[key]] = lerp(a[key], b[key], t);
    }
    target.camPos.set(lerp(a.cam[0], b.cam[0], t), lerp(a.cam[1], b.cam[1], t), lerp(a.cam[2], b.cam[2], t));
    target.camTarget.set(lerp(a.tgt[0], b.tgt[0], t), lerp(a.tgt[1], b.tgt[1], t), lerp(a.tgt[2], b.tgt[2], t));
    target.earthPos.set(lerp(a.earthPos[0], b.earthPos[0], t), lerp(a.earthPos[1], b.earthPos[1], t), lerp(a.earthPos[2], b.earthPos[2], t));
    target.bg.set(lerp(a.bgv[0], b.bgv[0], t), lerp(a.bgv[1], b.bgv[1], t), lerp(a.bgv[2], b.bgv[2], t));

    refreshOccluders();
    updateChrome();
  }

  /* --- nav / rail chrome ------------------------------------------------- */
  var railFill   = $('#railFill');
  var railDots   = $$('.rail__dots li');
  var navAnchors = $$('.nav__links a[data-jump]');
  var DOT_ACTS   = ['hero', 'problem', 'anantapur', 'solution', 'products', 'restoration', 'horizons', 'contact'];

  function updateChrome() {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
    railFill.style.height = (journey.global * 100).toFixed(2) + '%';

    var si = clamp(journey.local > 0.55 ? journey.index + 1 : journey.index, 0, STATIONS.length - 1);
    var dot = STATIONS[si].dot;
    railDots.forEach(function (li, i) { li.classList.toggle('is-on', i === dot); });
    var actName = DOT_ACTS[dot];
    navAnchors.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('data-jump') === actName); });
  }

  /* =======================================================================
     7. HOTSPOT PROJECTION
     ===================================================================== */
  var occluders = [];
  function refreshOccluders() {
    if (window.innerWidth <= 780) { occluders = []; return; }
    occluders = $$('.step__card, .panel, .horizon, .product, .flow__card').reduce(function (acc, el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > -40 && r.top < window.innerHeight + 40 && r.width > 0) {
        acc.push({ l: r.left - 10, r: r.right + 10, t: r.top - 10, b: r.bottom + 10 });
      }
      return acc;
    }, []);
  }
  function isOccluded(x, y) {
    for (var i = 0; i < occluders.length; i++) {
      var o = occluders[i];
      if (x > o.l && x < o.r && y > o.t && y < o.b) return true;
    }
    return false;
  }

  function groupLive(g) {
    if (g === 'plant')   return state.plant > 0.55;
    if (g === 'product') return state.products > 0.55;
    return state.restoration > 0.62 && state.plant < 0.25 && state.products < 0.25 && state.soil < 0.25;
  }
  function nodesFor(g) { return g === 'plant' ? processNodes : (g === 'product' ? productNodes : horizonNodes); }

  function updateMarkers() {
    if (!running || window.innerWidth <= 780) return;
    var w = window.innerWidth, h = window.innerHeight;
    markers.forEach(function (m) {
      var node = nodesFor(m.group)[m.i];
      if (!node || !groupLive(m.group)) { m.el.classList.remove('is-on'); return; }
      node.getWorldPosition(projected);
      projected.project(camera);
      if (projected.z > 1) { m.el.classList.remove('is-on'); return; }
      var x = (projected.x * 0.5 + 0.5) * w, y = (-projected.y * 0.5 + 0.5) * h;
      if (x < -80 || x > w + 80 || y < -60 || y > h + 60) { m.el.classList.remove('is-on'); return; }
      if (isOccluded(x, y)) { m.el.classList.remove('is-on'); return; }
      m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      m.el.classList.add('is-on');
    });
  }

  /* =======================================================================
     8. RAYCAST INTERACTION
     ===================================================================== */
  var hovered = null;
  var UI_SELECTOR = '.panel, .step__card, .horizon, .product, .flow__card, .nav, .modal__card, .hs, .rail, ' +
                    '.foot__cards, .foot__lead, .outcome, .scroll-hint, .dive-lead, .horizon-reveal, a, button, [data-open]';

  function pickNode(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var pool = [];
    ['plant', 'product', 'horizon'].forEach(function (g) {
      if (groupLive(g)) nodesFor(g).forEach(function (n) { pool.push(n.userData.core, n.userData.halo); });
    });
    if (!pool.length) return null;
    var hits = raycaster.intersectObjects(pool, false);
    return hits.length ? hits[0].object.userData.hot : null;
  }

  if (!IS_TOUCH) {
    window.addEventListener('pointermove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!running || modalState.open) return;
      if (e.target && e.target.closest && e.target.closest(UI_SELECTOR)) {
        if (hovered) { hovered = null; document.body.style.cursor = ''; }
        return;
      }
      var n = pickNode(e.clientX, e.clientY);
      if (n !== hovered) {
        hovered = n;
        document.body.style.cursor = n ? 'pointer' : '';
        if (n) setActiveHotspot(MARKER_GROUP[n.userData.kind], n.userData.index);
      }
    }, { passive: true });
  }

  /* #scroll-root sits above the canvas, so scene clicks are caught at the
     window and ignored whenever the pointer is over real interface. */
  window.addEventListener('click', function (e) {
    if (!running || modalState.open) return;
    if (e.target && e.target.closest && e.target.closest(UI_SELECTOR)) return;
    var n = pickNode(e.clientX, e.clientY);
    if (n) openModal(n.userData.kind, n.userData.index, null);
  });

  /* =======================================================================
     9. RENDER LOOP
     ===================================================================== */
  function frame() {
    requestAnimationFrame(frame);
    if (!running) return;

    var dt = Math.min(clock.getDelta(), 0.1);
    var t  = clock.elapsedTime;

    /* damped state */
    ['pollution', 'restoration', 'plant', 'terrain', 'products', 'prodLift', 'soil', 'earthFade', 'earthScale']
      .forEach(function (k) { state[k] = damp(state[k], target[k], 3.4, dt); });
    ['x', 'y', 'z'].forEach(function (ax) {
      state.earthPos[ax] = damp(state.earthPos[ax], target.earthPos[ax], 3.4, dt);
      state.bg[ax]       = damp(state.bg[ax], target.bg[ax], 2.6, dt);
    });

    mouse.x = damp(mouse.x, mouse.tx, 2.4, dt);
    mouse.y = damp(mouse.y, mouse.ty, 2.4, dt);

    /* camera */
    tmpV.set(target.camPos.x + mouse.x * 0.8, target.camPos.y - mouse.y * 0.5, target.camPos.z);
    state.camPos.x = damp(state.camPos.x, tmpV.x, 2.6, dt);
    state.camPos.y = damp(state.camPos.y, tmpV.y, 2.6, dt);
    state.camPos.z = damp(state.camPos.z, tmpV.z, 2.6, dt);
    state.camTarget.x = damp(state.camTarget.x, target.camTarget.x, 3.0, dt);
    state.camTarget.y = damp(state.camTarget.y, target.camTarget.y, 3.0, dt);
    state.camTarget.z = damp(state.camTarget.z, target.camTarget.z, 3.0, dt);
    camera.position.set(state.camPos.x, state.camPos.y, state.camPos.z);
    camera.lookAt(state.camTarget.x, state.camTarget.y, state.camTarget.z);

    /* background and fog travel with the journey */
    bgColor.setRGB(state.bg.x, state.bg.y, state.bg.z);
    renderer.setClearColor(bgColor, 1);
    scene.fog.color.copy(bgColor);
    scene.fog.density = 0.014 + state.terrain * 0.030 + state.soil * 0.004;

    /* ---------------- planet ---------------- */
    var ef = state.earthFade;
    earthGroup.visible = ef > 0.012;
    if (earthGroup.visible) {
      earthGroup.position.set(state.earthPos.x, state.earthPos.y, state.earthPos.z);
      earthGroup.scale.setScalar(state.earthScale);
      earthGroup.rotation.y += dt * 0.048;
      earthWire.rotation.y -= dt * 0.02;
      earthWire.material.opacity = 0.055 * ef;

      globePoints.material.uniforms.uMix.value = state.restoration;
      globePoints.material.uniforms.uOpacity.value = (0.55 + state.restoration * 0.45) * ef;
      atmosphere.material.uniforms.uMix.value = state.restoration;
      atmosphere.material.uniforms.uPower.value = (0.55 + state.pollution * 0.45 + state.restoration * 0.40) * ef;

      earthCore.material.emissive.setHex(state.restoration > 0.5 ? 0x0a3a2c : 0x2a1208);
      earthCore.material.emissiveIntensity = (0.35 + state.pollution * 0.3) * ef;
      earthCore.material.transparent = ef < 0.995;
      earthCore.material.opacity = ef;

      var pinP = (0.35 + state.pollution * 0.65) * ef;
      regionPin.userData.ring.scale.setScalar(1 + Math.sin(t * 2.1) * 0.22);
      regionPin.userData.ring.material.opacity = pinP * (0.55 + Math.sin(t * 2.1) * 0.3);

      smogPoints.material.uniforms.uTime.value = t;
      smogPoints.material.uniforms.uOpacity.value = state.pollution * 0.55 * ef;
      smogPoints.material.uniforms.uSpread.value = state.pollution * 0.9;
      healPoints.material.uniforms.uTime.value = t * 0.8;
      healPoints.material.uniforms.uOpacity.value = state.restoration * 0.55 * ef;
      healPoints.material.uniforms.uSpread.value = 0.25 + state.restoration * 0.7;
    }
    scene.userData.emberLight.intensity = 0.4 + state.pollution * 2.2 * Math.max(ef, state.terrain);
    scene.userData.lifeLight.intensity  = state.restoration * 2.4;
    scene.userData.sunLight.intensity   = Math.max(state.terrain, state.products) * 0.8;
    /* below ground it should read as a lit cut face, not a sunlit wall */
    scene.userData.key.intensity     = 1.1 - state.soil * 0.88;
    scene.userData.ambient.intensity = 0.55 - state.soil * 0.30;

    /* ---------------- the land ---------------- */
    terrainGroup.visible = state.terrain > 0.012;
    if (terrainGroup.visible) {
      setSolids(terrainMats, state.terrain);
      dustPoints.material.uniforms.uTime.value = t;
      dustPoints.material.uniforms.uOpacity.value = state.terrain * (0.20 + state.pollution * 0.4);
      for (var si = 0; si < scrub.length; si++) {
        scrub[si].rotation.z = Math.sin(t * 0.7 + si) * 0.022;
      }
    }

    /* ---------------- the pyrolysis unit ---------------- */
    plantGroup.visible = state.plant > 0.012;
    if (plantGroup.visible) {
      plantGroup.scale.setScalar((0.42 + state.plant * 0.43) * state.plant);
      plantGroup.rotation.y += dt * 0.085;
      plantGroup.position.y = PY + Math.sin(t * 0.5) * 0.07;
      plantRing.rotation.z += dt * 0.35;
      plantSpin.rotation.z -= dt * 0.55;
      plantCore.rotation.y -= dt * 0.12;
      plantGroup.userData.dust.material.uniforms.uTime.value = t * 1.6;
      plantGroup.userData.dust.material.uniforms.uOpacity.value = state.plant * 0.5;

      kilns.forEach(function (k, i) {
        var burn = 0.4 + Math.abs(Math.sin(t * 1.4 + k.userData.phase)) * 0.6;
        k.userData.flame.scale.setScalar(0.7 + burn * 0.6);
        k.userData.flame.material.opacity = (0.12 + burn * 0.22) * state.plant;
        k.userData.lid.material.emissiveIntensity = 0.22 + burn * 0.30;
        k.position.y = -0.78 + Math.sin(t * 0.9 + i) * 0.03;
      });
      processNodes.forEach(function (n, i) {
        var live = (i === activeStep) || (hovered === n);
        var pulse = 0.85 + Math.sin(t * 2.2 + n.userData.phase) * 0.15;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.7 : 1.0) * pulse, 6, dt));
        n.userData.core.rotation.y += dt * 0.9;
        n.userData.core.rotation.x += dt * 0.5;
        n.userData.ring.rotation.z += dt * (live ? 1.6 : 0.7);
        n.userData.core.material.opacity = 0.7 * state.plant;
        n.userData.halo.material.opacity = (live ? 0.30 : 0.12) * state.plant;
        n.userData.ring.material.opacity = (live ? 0.95 : 0.6) * state.plant;
      });
    }

    /* ---------------- the product line ---------------- */
    productGroup.visible = state.products > 0.012;
    if (productGroup.visible) {
      setSolids(productMats, state.products);
      productGroup.scale.setScalar((0.55 + state.products * 0.45) * (1 - state.prodLift * 0.34));
      productGroup.rotation.y += dt * 0.13;
      /* lifts clear of the card grid once the reader reaches it */
      productGroup.position.y = GROUND + 0.35 + state.prodLift * 3.3 + Math.sin(t * 0.45) * 0.05;
      productGroup.userData.slots.forEach(function (slot, i) {
        if (!slot) return;
        slot.rotation.y -= dt * 0.13;                       /* items face out */
        slot.userData.item.position.y = 0.08 + Math.sin(t * 0.9 + slot.userData.phase) * 0.045;
        if (slot.userData.item.userData.spin) slot.userData.item.userData.spin.rotation.y += dt * 0.8;
        var n = slot.userData.node, live = hovered === n;
        var pulse = 0.85 + Math.sin(t * 2.0 + n.userData.phase) * 0.15;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.6 : 1.0) * pulse, 6, dt));
        n.userData.core.rotation.y += dt * 0.8;
        n.userData.ring.rotation.z += dt * (live ? 1.4 : 0.6);
        n.userData.core.material.opacity = 0.75 * state.products;
        n.userData.halo.material.opacity = (live ? 0.28 : 0.13) * state.products;
        n.userData.ring.material.opacity = (live ? 0.9 : 0.6) * state.products;
      });
    }

    /* ---------------- the soil profile ---------------- */
    soilGroup.visible = state.soil > 0.012;
    if (soilGroup.visible) {
      setSolids(soilMats, state.soil);
      soilGroup.rotation.y = Math.sin(t * 0.16) * 0.05;
      carbonFall.material.uniforms.uTime.value = t;
      carbonFall.material.uniforms.uOpacity.value = state.soil * 0.65;
      /* the held band brightens as the reader descends through the flow */
      var held = clamp((activeFlow + 1) / RESTORATION.length, 0, 1);
      lockGlow.material.opacity = state.soil * (0.04 + held * 0.16);
      lockGlow.scale.y = 0.7 + held * 0.5;
    }

    /* ---------------- restoration nodes ---------------- */
    var hVis = clamp((state.restoration - 0.45) / 0.5, 0, 1) *
               (1 - clamp(Math.max(state.plant, state.products, state.soil) / 0.4, 0, 1)) * state.earthFade;
    horizonGroup.visible = hVis > 0.012;
    if (horizonGroup.visible) {
      horizonGroup.position.set(state.earthPos.x, state.earthPos.y, state.earthPos.z);
      horizonGroup.scale.setScalar(state.earthScale);
      horizonGroup.rotation.y += dt * 0.09;
      horizonNodes.forEach(function (n, i) {
        var live = hovered === n;
        var pulse = 0.9 + Math.sin(t * 1.5 + n.userData.phase) * 0.12;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.45 : 1) * pulse * hVis, 6, dt));
        n.userData.core.rotation.y += dt * 0.6;
        n.userData.ring.rotation.z += dt * 0.5;
        n.userData.ring2.rotation.z -= dt * 0.32;
        n.userData.core.material.opacity  = 0.55 * hVis;
        n.userData.halo.material.opacity  = (live ? 0.26 : 0.12) * hVis;
        n.userData.ring.material.opacity  = 0.8 * hVis;
        n.userData.ring2.material.opacity = 0.4 * hVis;
      });
    }

    /* ---------------- stars ---------------- */
    starField.rotation.y += dt * 0.006;
    starField.material.uniforms.uMix.value = 0.35 + state.restoration * 0.4;
    starField.material.uniforms.uOpacity.value = 0.85 * clamp(1 - Math.max(state.terrain, state.soil) * 1.3, 0, 1);

    updateMarkers();
    renderer.render(scene, camera);
  }

  /* =======================================================================
     10. RESIZE / VISIBILITY / SCROLL
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
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 120); });
  window.addEventListener('orientationchange', function () { setTimeout(onResize, 260); });
  document.addEventListener('visibilitychange', function () {
    if (!clock) return;
    if (document.hidden) clock.stop(); else clock.start();
  });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { readScroll(); ticking = false; });
  }, { passive: true });

  /* --- optional GSAP polish (used only if the CDN resolved) -------------- */
  function wireGsap() {
    if (!HAS_GSAP || REDUCED) return;
    gsap.fromTo('.hero__brand',  { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out' });
    gsap.fromTo('.hero__title',  { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: .15 });
    gsap.fromTo('.hero__lede',   { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', delay: .30 });
    gsap.fromTo('.hero__stats .stat',  { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', delay: .45 });
    gsap.fromTo('.hero__actions .btn', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08, ease: 'power3.out', delay: .65 });

    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(window.ScrollTrigger);
    /* transform-only parallax — never opacity, which would defeat the
       .is-live focus states on the step and flow cards */
    gsap.utils.toArray('.panel').forEach(function (el) {
      gsap.fromTo(el, { y: 40 }, { y: -40, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    gsap.utils.toArray('.horizon, .product').forEach(function (el, i) {
      gsap.fromTo(el, { y: 26 + (i % 3) * 14 }, { y: -26 - (i % 3) * 14, ease: 'none',
        scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
    ScrollTrigger.addEventListener('refresh', measure);
  }

  /* =======================================================================
     11. BOOT
     ===================================================================== */
  var LOAD_MSGS = [
    'Warming the soil', 'Seeding the atmosphere', 'Charging six pyrolysis kilns',
    'Pressing the first briquettes', 'Opening the carbon registry'
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
      try {
        initThree();
        terrainMats = collectSolids(terrainGroup);
        productMats = collectSolids(productGroup);
        soilMats    = collectSolids(soilGroup);
        setSolids(terrainMats, 0); setSolids(productMats, 0); setSolids(soilMats, 0);
      } catch (err) {
        console.error('[CE2] WebGL init failed:', err);
        ok = false; running = false;
      }
    }
    if (!ok) { $('#fallback').hidden = false; canvas.style.display = 'none'; }

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

  window.addEventListener('load', function () { setTimeout(onResize, 400); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(onResize, 120); });

  window.CE2 = {
    PROCESS: PROCESS, PRODUCTS: PRODUCTS, RESTORATION: RESTORATION, HORIZONS: HORIZONS,
    state: state, target: target, journey: journey, stations: STATIONS,
    openModal: openModal, closeModal: closeModal
  };
})();
