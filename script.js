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

  /* =======================================================================
     1. CONTENT
     ===================================================================== */

  /** The five stages of the CE² Integrated Biomass Pyrolysis Unit. */
  var PROCESS = [
    {
      id: 'feedstock', tag: 'Stage 01 · Inbound',
      title: 'Feedstock Collection', sub: 'Reciprocal Sourcing',
      short: 'Invasive Juliflora, bamboo, groundnut shells and cotton stems are collected free of cost from surrounding villages — paid for not in cash, but in smokeless briquettes returned to the same households.',
      lede: 'CE² does not buy biomass. It trades for it. Rural households hand over residue that today is burned in the open, and receive back a clean, low-cost cooking fuel made from it. The feedstock cost line goes to zero and the village gains a smokeless kitchen.',
      metrics: [ { v: 'Free', l: 'Cost of feedstock' }, { v: '4', l: 'Residue streams' }, { v: 'Village-led', l: 'Collection' } ],
      blocks: [
        { h: 'Feedstock streams', items: [
          '<b>Prosopis juliflora</b> — invasive, groundwater-depleting scrub cleared from fallow and grazing land; removal is itself a restoration act.',
          '<b>Bamboo</b> — offcuts, culm waste and plantation thinnings with high fixed-carbon yield.',
          '<b>Groundnut shells</b> — the defining residue of the Anantapur belt, otherwise heaped and burned.',
          '<b>Cotton stems</b> — woody post-harvest stalks, a major open-burning source across the district.'
        ]},
        { h: 'The reciprocal exchange', items: [
          'Villages supply residue at no cost and take back smokeless briquettes at a domestic price of <b>₹4/kg</b>.',
          'Household smoke exposure falls; open-field burning stops at the source.',
          'Collection routes double as CE² extension contact for biochar demonstration plots.',
          'Every load diverted from open burning is carbon available for permanent storage.'
        ]}
      ]
    },
    {
      id: 'pyrolysis', tag: 'Stage 02 · Conversion',
      title: 'Closed-Loop Pyrolysis', sub: 'Slow, oxygen-starved, captured',
      short: 'A bank of retort kilns heats the biomass without oxygen, so it cannot burn. The gas it gives off is piped back to fire the kilns, and the vapour is condensed rather than vented.',
      lede: 'The thermal core of the plant. Biomass is heated in the near-absence of oxygen so it cannot combust; instead it fractures into a solid carbon skeleton, a combustible gas and a condensable vapour. CE² keeps all three inside the boundary.',
      metrics: [ { v: 'Oxygen-starved', l: 'Kiln regime' }, { v: 'Syngas', l: 'Recycled as heat' }, { v: 'Zero', l: 'Liquid discharge' } ],
      blocks: [
        { h: 'Closed-loop design', items: [
          '<b>Syngas capture</b> — non-condensable gases are routed back to the kiln burners, so the reaction sustains its own process heat after start-up.',
          '<b>Zero-liquid discharge</b> — condensate is recovered as saleable co-products instead of released; nothing enters the local water table.',
          '<b>Emission control</b> — closed kilns replace open burning, converting an uncontrolled release into a captured, measurable stream.',
          '<b>Batch traceability</b> — each kiln batch is logged for feedstock type, residence time and yield.'
        ]},
        { h: 'What each batch becomes', items: [
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
      short: 'Fresh char is charged with manure, wood ash (K), bone meal (P) and a micronutrient pack (Fe, Zn, B, Mg), then blended into a formulation for the crop it is going under — Mosambi, Banana, Pomegranate or Groundnut.',
      lede: 'Raw biochar is a porous carbon skeleton — enormous surface area, but nutritionally empty. CE² inoculates it before it reaches a field, so the char arrives pre-charged rather than stripping nutrients from the soil in its first season.',
      metrics: [ { v: '4', l: 'Crop formulations' }, { v: 'Fe Zn B Mg', l: 'Micronutrient pack' }, { v: 'Pre-charged', l: 'Before it reaches the field' } ],
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
      short: 'The fine fraction of the char is densified into three burn profiles. A domestic grade goes back to feedstock villages at cost; a commercial grade serves hospitality and industrial heat.',
      lede: 'The briquette line is what makes the reciprocal model work. It converts the fine fraction of the char into a product the supplying village actually wants, while a commercial grade carries the revenue.',
      metrics: [ { v: '3', l: 'Profiles' }, { v: '₹4 / kg', l: 'Domestic, at cost' }, { v: '₹35 / kg', l: 'Commercial' } ],
      blocks: [
        { h: 'Product profiles', items: [
          '<b>Pillow</b> — general-purpose domestic and barbecue format, high packing density for transport.',
          '<b>Hexagon</b> — extruded commercial bar with a long, even burn for hospitality and industrial heat.',
          '<b>Honeycomb</b> — perforated block for controlled airflow in traditional stoves and continuous burners.'
        ]},
        { h: 'Two grades, two jobs', items: [
          '<b>Domestic @ ₹4/kg</b> — priced at cost for the villages supplying feedstock; the return leg of the reciprocal exchange.',
          '<b>Commercial @ ₹35/kg</b> — hotels, restaurants, barbecue retail and industrial users; carries the margin.',
          'Smokeless combustion removes the indoor air-quality burden of raw wood and dung cake.',
          'Displaces both fuelwood harvesting and open residue burning in the same transaction.'
        ]}
      ]
    },
    {
      id: 'coproducts', tag: 'Stage 05 · Recovery',
      title: 'Co-Products Recovery', sub: 'Wood Vinegar & Tar Oil',
      short: 'The vapour leaving the kilns is condensed and separated into wood vinegar — an organic bio-stimulant — and wood tar oil, the fractions that open burning simply loses to the sky.',
      lede: 'The vapour stream is where most pyrolysis operations lose value and create a discharge problem. CE² condenses and separates it into two saleable products, closing the liquid loop.',
      metrics: [ { v: 'Wood vinegar', l: 'Organic bio-stimulant' }, { v: 'Tar oil', l: 'Industrial fraction' }, { v: 'Zero', l: 'Effluent discharged' } ],
      blocks: [
        { h: 'Wood vinegar (pyroligneous acid)', items: [
          'Applied dilute as an <b>organic bio-stimulant</b> and foliar tonic — germination, rooting and vigour.',
          'Acts as a natural pest and fungal deterrent, reducing synthetic pesticide load.',
          'Pairs with CE² biochar as a combined soil-and-foliar programme sold into the same farm.',
          'Recovering it turns a waste condensate into a second agricultural product.'
        ]},
        { h: 'Wood tar oil', items: [
          'The heavy fraction from the same condenser train.',
          'Industrial applications: timber preservation, anti-corrosive coating and binder feedstock.',
          'Removing it from the effluent path is what makes zero-liquid discharge achievable.',
          'Optional internal use as supplementary kiln fuel during cold start-up.'
        ]}
      ]
    }
  ];

  /** The product line CE² goes to market with. */
  var PRODUCTS = [
    {
      id: 'p-biochar', tag: 'Product 01', title: 'Crop-Specific Biochar', sub: 'Inoculated soil amendment',
      tone: 'char', swatchColor: '#2B2B28',
      rate: { v: 'Crop-specific', l: 'formulated per crop' },
      forms: ['Mosambi', 'Banana', 'Pomegranate', 'Groundnut'],
      short: 'Porous carbon pre-charged with manure, wood ash, bone meal and micronutrients, then blended to a formulation for the crop it is going under.',
      lede: 'The flagship line. Raw char is inoculated before it leaves the plant so it arrives at the field already loaded with nutrients and microbial life, rather than scavenging them from the soil in its first season.',
      metrics: [ { v: '4', l: 'Crop formulations' }, { v: 'Fe Zn B Mg', l: 'Micronutrient pack' }, { v: 'Centuries', l: 'Carbon residence in soil' } ],
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
      tone: 'briq', swatchColor: '#4A4038',
      rate: { v: 'Smokeless', l: 'three burn profiles' },
      forms: ['Pillow', 'Hexagon', 'Honeycomb'],
      short: 'Charcoal fines densified into three burn profiles. A domestic grade goes back to feedstock villages at ₹4/kg; a commercial grade serves the market at ₹35/kg.',
      lede: 'The product that closes the reciprocal loop. Households that supply residue buy back a clean fuel made from it at cost, which is why CE² pays nothing for feedstock and why the open burning stops.',
      metrics: [ { v: '₹4 / kg', l: 'Domestic, at cost' }, { v: '₹35 / kg', l: 'Commercial' }, { v: '3', l: 'Profiles' } ],
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
      tone: 'vin', swatchColor: '#C79A4B',
      rate: { v: 'Organic', l: 'bio-stimulant' },
      forms: ['Foliar tonic', 'Root drench', 'Pest deterrent'],
      short: 'Pyroligneous acid condensed out of the pyrolysis vapour, applied dilute as an organic bio-stimulant and natural pest deterrent.',
      lede: 'The condensate most operations treat as an effluent problem. CE² recovers it as a second agricultural product that sells into the same farms already buying biochar.',
      metrics: [ { v: 'Organic', l: 'Input class' }, { v: 'Foliar & root', l: 'Application' }, { v: 'Zero', l: 'Discharged' } ],
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
      tone: 'tar', swatchColor: '#3A2C1F',
      rate: { v: 'Industrial', l: 'heavy fraction' },
      forms: ['Timber preservative', 'Anti-corrosive', 'Binder feedstock'],
      short: 'The heavy fraction separated from the same condenser train — timber preservation, anti-corrosive coating and binder feedstock.',
      lede: 'Separating the tar fraction is not optional book-keeping; it is the step that lets the liquid loop close. Once removed it becomes an industrial product rather than a disposal cost.',
      metrics: [ { v: '3', l: 'Application classes' }, { v: 'ZLD', l: 'Enables' }, { v: 'Start-up fuel', l: 'Optional internal use' } ],
      blocks: [
        { h: 'Applications', items: [
          '<b>Timber preservation</b> — traditional and industrial wood treatment.',
          '<b>Anti-corrosive coatings</b> for exposed metal work.',
          '<b>Binder feedstock</b> for downstream densification and composites.',
          'Optional internal use as supplementary kiln fuel during cold start-up.'
        ]}
      ]
    }
  ];

  /** The carbon cycle CE² closes — six stations, round and round. */
  var CYCLE = [
    { id: 'c-air', tag: 'Stage 01', title: 'Air', sub: 'Carbon dioxide in the atmosphere',
      short: 'This is where every tonne starts — and where open burning sends it straight back. The whole point of the loop is to make this the shortest stop on the circuit.',
      lede: 'Atmospheric carbon dioxide is the raw material of the cycle and the thing the cycle is designed to keep out of. Every other station exists to move carbon away from here and hold it somewhere useful.',
      metrics: [ { v: 'CO₂', l: 'The form it arrives in' }, { v: 'Hours', l: 'How fast burning returns it' }, { v: 'Centuries', l: 'How long the loop holds it' } ],
      blocks: [ { h: 'What the loop changes', items: [
        'Open burning is a one-way trip: field to sky in an afternoon.',
        'CE² inserts four stations between the plant and the air, and the last of them is soil.',
        'Carbon that reaches the soil station is out of this station for a very long time.' ]} ] },
    { id: 'c-plants', tag: 'Stage 02', title: 'Plants', sub: 'Photosynthesis does the capture',
      short: 'Juliflora, bamboo, groundnut and cotton pull CO₂ out of the air over a growing season and fix it into stems, shells and stalks — the cheapest direct air capture there is.',
      lede: 'Nothing CE² builds captures carbon as efficiently as the crops and scrub already growing across the district. The plants are the collector; the job is to make sure what they collect is not simply burned.',
      metrics: [ { v: 'Juliflora', l: 'Invasive scrub' }, { v: 'Groundnut', l: 'Signature residue' }, { v: 'Cotton', l: 'Woody stalks' } ],
      blocks: [ { h: 'The feedstock species', items: [
        '<b>Prosopis juliflora</b> — invasive, water-hungry, and everywhere: clearing it is a restoration act in itself.',
        '<b>Groundnut shells and cotton stems</b> — the post-harvest residue of the district’s two main crops.',
        '<b>Bamboo</b> — offcuts and thinnings with a high fixed-carbon yield.' ]} ] },
    { id: 'c-collect', tag: 'Stage 03', title: 'Collection', sub: 'Gathered instead of burned',
      short: 'Left alone, that residue is burned in the open and the carbon is back in the air within hours. Collected under the reciprocal exchange, it arrives at the kiln with its carbon intact.',
      lede: 'The single decision that makes everything downstream possible. Residue is collected free of cost from the villages that produce it, and paid for in smokeless fuel — so the field is cleared without a match.',
      metrics: [ { v: 'Free', l: 'To the farmer' }, { v: 'Briquettes', l: 'What comes back' }, { v: 'No fire', l: 'The field is still cleared' } ],
      blocks: [ { h: 'Why it works', items: [
        'The farmer gets the field cleared, which is what the fire was for.',
        'The household gets a clean cooking fuel at cost.',
        'CE² gets its feedstock at no cost and the carbon stays in the loop.' ]} ] },
    { id: 'c-kiln', tag: 'Stage 04', title: 'Kiln', sub: 'Pyrolysis locks the structure',
      short: 'Heated without oxygen, the biomass cannot burn. It fractures instead, and the carbon rearranges into fused aromatic rings — a form soil microbes have no efficient way to break apart.',
      lede: 'This is where unstable plant carbon becomes recalcitrant carbon. The gas the kiln gives off is piped back to heat it; the vapour is condensed into wood vinegar and tar oil; nothing is vented and nothing is poured away.',
      metrics: [ { v: 'No oxygen', l: 'So it cannot burn' }, { v: 'Syngas', l: 'Heats the next batch' }, { v: 'Condensed', l: 'Vapour, not smoke' } ],
      blocks: [ { h: 'Inside the retort', items: [
        'Slow heating in a sealed drum drives off water, then volatiles, leaving a carbon skeleton.',
        'The aromatic ring structure that forms is what gives biochar its centuries-long residence time.',
        'Every batch is logged — feedstock, temperature regime and residence time.' ]} ] },
    { id: 'c-biochar', tag: 'Stage 05', title: 'Biochar', sub: 'Charged before it leaves',
      short: 'Fresh char is inoculated with manure, wood ash, bone meal and micronutrients, then blended for the crop it is going under. It arrives at the field already loaded.',
      lede: 'Raw char is a sponge with nothing in it. Charged with nutrients and microbial life before it leaves the plant, it feeds the crop from day one instead of stealing from the soil in its first season.',
      metrics: [ { v: 'Manure · ash · bone meal', l: 'The charge' }, { v: 'Fe Zn B Mg', l: 'Micronutrients' }, { v: '4 crops', l: 'Formulations' } ],
      blocks: [ { h: 'Why inoculate', items: [
        'Uncharged biochar can lock up nutrients for a season; charged biochar releases them.',
        'Wood ash brings alkalinity that counters fertilizer acidification directly.',
        'The porosity that holds nutrients is the same porosity that holds water.' ]} ] },
    { id: 'c-soil', tag: 'Stage 06', title: 'Soil', sub: 'Held for centuries — and the crop grows back',
      short: 'Worked into the root zone, the char stays put on a timescale of centuries. The field holds more water, buffers salt, leans back toward the right pH — and the next crop grows in it, closing the loop.',
      lede: 'The last station and the reason for all the others. Carbon in soil in this form does not go back to the air on any timescale that matters to us, and the same porosity that makes it permanent makes the field better. Then the plants grow again, and the cycle turns.',
      metrics: [ { v: 'Centuries', l: 'Residence time' }, { v: 'Water · pH · CEC', l: 'What improves' }, { v: 'Field by field', l: 'Every application logged' } ],
      blocks: [ { h: 'What the field gets', items: [
        'Higher water-holding capacity on sandy red soils, so a 522 mm rainfall budget stretches further.',
        'Salts from borewell irrigation buffered in the pore network.',
        'pH nudged back toward the crop optimum by the ash charge.',
        'Nutrients held in the root zone rather than leached away.' ]},
        { h: 'And then', items: [
        'The crop grows, fixes more carbon from the air, and its residue comes back to the kiln.',
        'Each turn of the loop leaves a little more carbon in the ground than the last.' ]} ] }
  ];

  /** Every smoke stream around Anantapur, paired with what CE² does about it. */
  var SOURCES = [
    {
      id: 's-industry', tag: 'Source 01', title: 'Industrial & Thermal Combustion',
      sub: 'Factory stacks, boilers, brick and charcoal kilns',
      emits: 'Continuous point-source CO₂, SO\u2093 and particulates from coal- and diesel-fired boilers, brick clamps and traditional charcoal pits running uncontrolled across the district.',
      fix: 'CE² commercial briquettes displace coal and fuelwood in exactly these burners, while the plant\u2019s own kilns capture syngas and burn it back as process heat instead of drawing external fuel.',
      lede: 'The most visible smoke in the district, and the easiest to mistake for someone else\u2019s problem. Industrial and thermal burners run on coal, diesel and raw fuelwood; traditional brick and charcoal kilns burn in the open with no capture at all.',
      metrics: [ { v: 'Briquettes', l: 'Commercial grade' }, { v: '₹35 / kg', l: 'Commercial price' }, { v: 'Syngas', l: 'Recaptured as heat' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          'Point-source <b>CO₂</b> from coal, lignite and diesel combustion, running continuously rather than seasonally.',
          '<b>SO\u2093 and particulates</b> from unwashed solid fuel, settling over cropland downwind.',
          '<b>Uncontrolled kiln emissions</b> — brick clamps and traditional charcoal pits vent everything, including the condensable fraction.',
          'None of it is measured, so none of it is managed.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Smokeless commercial briquettes</b> — a drop-in solid fuel for hospitality, retail and industrial heat, made from residue instead of mined coal.',
          '<b>Closed-loop kilns</b> — CE² pyrolysis runs oxygen-starved and captures the non-condensable gas, so the reaction feeds its own heat after start-up.',
          '<b>Zero-liquid discharge</b> — the condensable fraction a traditional kiln loses to the sky is recovered as wood vinegar and tar oil.',
          '<b>Batch-level records</b> on every cycle, which is what makes the reduction auditable rather than asserted.'
        ]}
      ]
    },
    {
      id: 's-residue', tag: 'Source 02', title: 'Open Agricultural Residue Burning',
      sub: 'Stubble, shells, stems and orchard prunings',
      emits: 'Groundnut shells, cotton stems and orchard prunings burned in the open at the end of every harvest — carbon that took a season to fix, released in a few hours.',
      fix: 'CE² collects that same residue free of cost under the reciprocal exchange and converts it in closed kilns, so the carbon is banked as biochar instead of vented.',
      lede: 'This is the stream CE² was built around. Residue burning is not carelessness; it is the cheapest way to clear a field before the next sowing. The only way to stop it is to make the residue worth more than the match.',
      metrics: [ { v: 'Closed kilns', l: 'Instead of open fire' }, { v: '₹0', l: 'Cost to the farmer' }, { v: '365 days', l: 'Burning season here' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          '<b>Biogenic CO₂</b> released in hours instead of being banked for centuries.',
          '<b>Black carbon and PM2.5</b> across the whole district during clearing windows.',
          '<b>Carbon monoxide and methane</b> from smouldering, oxygen-starved field fires.',
          'The soil loses the organic matter that heap would have become.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Free collection</b> of juliflora, bamboo, groundnut shells and cotton stems — the farmer pays nothing and clears the field anyway.',
          '<b>Reciprocal payment in fuel</b> — the village receives smokeless briquettes at ₹4/kg, so the exchange is worth making.',
          '<b>Closed-kiln conversion</b>, turning the fire into biochar, briquettes and recovered liquids.',
          'Removing the burn removes the emission at source rather than offsetting it elsewhere.'
        ]}
      ]
    },
    {
      id: 's-domestic', tag: 'Source 03', title: 'Domestic Cooking Smoke',
      sub: 'Fuelwood and dung cake in the household chulha',
      emits: 'Raw fuelwood and dung cake burned indoors on open stoves — a household-scale emission that is also the district\u2019s most direct health burden, borne mostly by women and children.',
      fix: 'The domestic briquette line is priced at cost — ₹4/kg — and goes back to the same villages that supplied the feedstock, replacing smoky fuel with a clean-burning one.',
      lede: 'The smallest stack and the one that matters most to the people standing next to it. CE² treats the domestic fuel line as payment rather than product, which is what makes the whole reciprocal model close.',
      metrics: [ { v: 'Domestic', l: 'Briquette grade' }, { v: '₹4 / kg', l: 'At cost, not at margin' }, { v: '3', l: 'Burn profiles' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          '<b>Indoor particulate matter</b> at concentrations far above outdoor exposure.',
          '<b>CO₂ and black carbon</b> from incomplete combustion of wet wood and dung.',
          '<b>Fuelwood demand</b> that drives the canopy loss feeding back into the same problem.',
          'The exposure is concentrated on whoever cooks.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Smokeless charcoal briquettes</b> in pillow, hexagon and honeycomb profiles for domestic stoves.',
          '<b>Priced at cost (₹4/kg)</b> for feedstock-supplying households — deliberately not a margin line.',
          '<b>Honeycomb profile</b> gives controlled airflow in traditional stoves, so no new appliance is needed.',
          'Displacing fuelwood also takes pressure off the standing biomass around the village.'
        ]}
      ]
    },
    {
      id: 's-fossil', tag: 'Source 04', title: 'Diesel Pumping & Transport',
      sub: 'Borewell pumpsets, gensets and haulage',
      emits: 'Falling water tables force deeper bores and longer pumping hours on diesel sets, and every input and output on the farm moves by road.',
      fix: 'Biochar raises water-holding capacity in sandy red soils, so the same crop needs fewer pumping hours; CE² also produces and distributes locally, keeping collection and delivery routes short.',
      lede: 'An emission that scales with water scarcity: the drier it gets, the deeper the bore, the longer the pump runs. Anything that helps a soil hold rainfall reduces this directly.',
      metrics: [ { v: '522 mm', l: 'Annual rainfall to stretch' }, { v: 'WHC ↑', l: 'Water-holding capacity' }, { v: 'Local', l: 'Production & distribution' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          '<b>Diesel CO₂</b> from borewell pumpsets running longer each season as the water table drops.',
          '<b>Genset emissions</b> filling in for unreliable supply.',
          '<b>Haulage CO₂</b> on inputs trucked in and produce trucked out.',
          'Deeper bores also raise the salt load in irrigation water, damaging the soil further.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Biochar porosity</b> raises water-holding capacity on sandy red soils, so a 522 mm rainfall budget goes further.',
          '<b>Salinity buffering</b> — char holds and dilutes the salts that borewell irrigation carries in.',
          '<b>Short routes</b> — feedstock is collected from surrounding villages and product is sold back into them.',
          '<b>Juliflora clearance</b> removes a scrub that is itself drawing down the water table.'
        ]}
      ]
    },
    {
      id: 's-fertilizer', tag: 'Source 05', title: 'Chemical Fertilizer',
      sub: 'Urea manufacture, and N₂O from the field',
      emits: 'Synthetic nitrogen is energy-intensive to manufacture, and urea-heavy regimes vent nitrous oxide from the root zone — roughly 273× the warming potential of CO₂ — while acidifying the soil.',
      fix: 'CE² biochar arrives pre-charged with manure, wood ash, bone meal and micronutrients, and wood vinegar substitutes for part of the chemical programme, cutting synthetic input rather than supplementing it.',
      lede: 'Not smoke you can see, but the highest-leverage stream on the list. The manufacturing emission sits upstream; the N₂O emission comes straight out of the field, and the acidification it causes is what CE² biochar is formulated to reverse.',
      metrics: [ { v: '~273×', l: 'N₂O vs CO₂ warming' }, { v: 'Inoculated', l: 'Biochar, pre-charged' }, { v: '4', l: 'Crop formulations' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          '<b>Manufacturing CO₂</b> — synthetic nitrogen is among the most energy-intensive farm inputs there is.',
          '<b>Nitrous oxide</b> vented from over-fertilised root zones at roughly <b>273×</b> the warming potential of CO₂.',
          '<b>Acidification</b> that collapses microbial life and locks up nutrients, prompting still heavier application.',
          'The result is a field that needs more input each year to hold the same yield.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Wood ash alkalinity</b> in the biochar charge directly counters fertilizer-driven acidification.',
          '<b>Pre-charged porosity</b> — manure, bone meal and micronutrients loaded before the char reaches the field, so it does not scavenge.',
          '<b>Raised cation exchange capacity</b> keeps applied nutrients in the root zone instead of leaching them away.',
          '<b>Wood vinegar</b> as an organic bio-stimulant and pest deterrent, reducing synthetic pesticide load alongside it.'
        ]}
      ]
    },
    {
      id: 's-deforestation', tag: 'Source 06', title: 'Canopy Loss & Invasive Scrub',
      sub: 'Deforestation, fuelwood harvesting, Prosopis juliflora',
      emits: 'Removing standing biomass deletes the fastest natural sink and exposes topsoil to wind and heat erosion — while invasive juliflora colonises the cleared ground and draws down what groundwater is left.',
      fix: 'Juliflora is a primary CE² feedstock, so clearing it pays for itself; briquettes displace fuelwood harvesting; and the agroforestry programme replants multi-tier native canopy with biochar at the planting pit.',
      lede: 'Two problems that look opposite and are actually the same one. Useful canopy is being cut for fuel while an invasive scrub takes over the land it left behind. CE² monetises the removal of one and funds the return of the other.',
      metrics: [ { v: 'Feedstock', l: 'Juliflora becomes input' }, { v: 'Multi-tier', l: 'Replanting structure' }, { v: 'Native', l: 'Species policy' } ],
      blocks: [
        { h: 'What it puts into the air', items: [
          '<b>Stored carbon released</b> when standing biomass is cut and burned.',
          '<b>Sink capacity deleted</b> — the fastest natural drawdown available at landscape scale.',
          '<b>Topsoil erosion</b> once shade and litter fall are gone, releasing soil carbon too.',
          '<b>Invasive spread</b> — <i>Prosopis juliflora</i> occupies the cleared ground and depletes groundwater.'
        ]},
        { h: 'What CE² does about it', items: [
          '<b>Juliflora as feedstock</b> — clearing the invasive is paid for by what it becomes, so the removal actually happens.',
          '<b>Briquettes displace fuelwood</b>, removing the reason to cut standing trees for the kitchen.',
          '<b>Multi-tier agroforestry</b> with drought-adapted native species on degraded parcels.',
          '<b>Long-term canopy care</b> — survival tracked over years, with biochar at the pit and wood vinegar through establishment.'
        ]}
      ]
    }
  ];

  /** The three CE² Future Horizons restoration pathways. */
  var HORIZONS = [
    {
      id: 'agroforestry', img: 'assets/horizon-agroforestry.svg',
      imgAlt: 'Multi-tier agroforestry: canopy trees, sub-canopy, shrub layer and ground cover on restored farmland', tag: 'Horizon 01',
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
      id: 'erw', img: 'assets/horizon-erw.svg',
      imgAlt: 'Crushed basalt spread over cropland, drawing carbon dioxide down and locking it as stable bicarbonate', tag: 'Horizon 02',
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
      id: 'coastal', img: 'assets/horizon-coastal.svg',
      imgAlt: 'Mangrove forest above the waterline and coral reef below, with ocean alkalinity enhancement', tag: 'Horizon 03',
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

  var SETS = { source: SOURCES, process: PROCESS, product: PRODUCTS, cycle: CYCLE, horizon: HORIZONS };

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

  /* --- emission source cards --------------------------------------------- */
  var sourceHost = $('#sourceGrid');
  SOURCES.forEach(function (src, i) {
    var card = document.createElement('article');
    card.className = 'source reveal';
    card.setAttribute('data-open', 'source');
    card.setAttribute('data-index', String(i));
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.innerHTML =
      '<span class="source__no">' + String(i + 1).padStart(2, '0') + ' &middot; Source</span>' +
      '<h3>' + src.title + '</h3>' +
      '<p class="source__emits">' + src.emits + '</p>' +
      '<div class="source__arrow">The CE² response</div>' +
      '<p class="source__fix">' + src.fix + '</p>' +
      '<span class="source__more">Open the detail</span>';
    sourceHost.appendChild(card);
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
    card.setAttribute('data-tone', p.tone);
    card.innerHTML =
      '<div class="product__swatch" style="background:' + p.swatchColor + '"></div>' +
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
  CYCLE.forEach(function (c, i) {
    var sec = document.createElement('div');
    sec.className = 'flow__step';
    sec.dataset.flow = String(i);
    sec.innerHTML =
      '<article class="flow__card" data-open="cycle" data-index="' + i + '" tabindex="0" role="button">' +
        '<span class="flow__depth">' + c.tag + ' &middot; ' + c.sub + '</span>' +
        '<h3>' + c.title + '</h3><p>' + c.short + '</p>' +
        '<div class="flow__meter"><i style="width:' + Math.round((i + 1) / CYCLE.length * 100) + '%"></i></div>' +
        '<p class="flow__note">' + (i === CYCLE.length - 1 ? 'Round to the start — the loop turns again.' : 'Next: ' + CYCLE[i + 1].title) + '</p>' +
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
      '<figure class="horizon__figure"><img src="' + h.img + '" alt="' + h.imgAlt + '" width="1200" height="800" loading="lazy" /></figure>' +
      '<div class="horizon__body">' +
        '<p class="eyebrow eyebrow--brand">' + h.tag + '</p>' +
        '<h3>' + h.title + '</h3><p>' + h.short + '</p>' +
        '<div class="horizon__kpis">' + kpis + '</div>' +
        '<span class="step__more">Open detail</span>' +
      '</div>';
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
  SOURCES.forEach(function (src, i) {
    markers.push({ el: buildMarker(src.title, 'S' + (i + 1), 'source', i, 'smoke'), group: 'source', i: i });
  });
  PROCESS.forEach(function (p, i) {
    markers.push({ el: buildMarker(p.title, String(i + 1).padStart(2, '0'), 'process', i, null), group: 'plant', i: i });
  });
  PRODUCTS.forEach(function (p, i) {
    markers.push({ el: buildMarker(p.title, 'P' + (i + 1), 'product', i, 'sand'), group: 'product', i: i });
  });
  CYCLE.forEach(function (c, i) {
    markers.push({ el: buildMarker(c.title, 'C' + (i + 1), 'cycle', i, 'sky'), group: 'cycle', i: i });
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

  var BADGE = { source:  function (i) { return 'S' + (i + 1); },
                process: function (i) { return String(i + 1).padStart(2, '0'); },
                product: function (i) { return 'P' + (i + 1); },
                cycle:   function (i) { return 'C' + (i + 1); },
                horizon: function (i) { return 'H' + (i + 1); } };
  var MARKER_GROUP = { source: 'source', process: 'plant', product: 'product', cycle: 'cycle', horizon: 'horizon' };

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
      var top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: Math.max(0, top), behavior: REDUCED ? 'auto' : 'smooth' });
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
  var starField, earthGroup, stacksGroup, terrainGroup, plantGroup, productGroup, cycleGroup, horizonGroup;
  var globePoints, smogPoints, healPoints, atmosphere, earthCore, earthWire, regionPin;
  var kilns = [];
  var sourceNodes = [], processNodes = [], productNodes = [], cycleNodes = [], horizonNodes = [];
  var cycleStations = [], cycleArrows = [], ringFlow, cycleMats;
  var stackUnits = [], stackHaze, stackMats;
  var dustPoints, scrub = [];
  var raycaster, pointer, projected, tmpV;
  var running = false;

  var PY = GROUND + 1.35;              /* the pyrolysis unit's origin height */
  var bgColor, fogColor;               /* THREE.Color, allocated in initThree */

  function freshState() {
    return {
      pollution: 0.5, restoration: 0.02,
      stacks: 0, plant: 0, terrain: 0, products: 0, prodLift: 0, soil: 0,
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

  function makeFallField(count, w, span, d, colA, colB, size, speed, flare) {
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
        uSpan: { value: span }, uSpeed: { value: speed }, uFlare: { value: flare || 0 }, uOpacity: { value: 0 },
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


  /* --- the smoke: an industrial foreground in front of the hazed planet -- */
  function buildStacks() {
    stacksGroup = new THREE.Group();
    stacksGroup.position.set(0, -4.3, 0.8);
    stacksGroup.visible = false;

    /* unlit so they stay silhouettes against the haze however the act is lit */
    var shell   = new THREE.MeshBasicMaterial({ color: 0x0A0A08 });
    var shell2  = new THREE.MeshBasicMaterial({ color: 0x14130F });
    var bandMat = new THREE.MeshBasicMaterial({ color: 0x201D18 });

    /* x, z, chimney height, radius, plume scale — six distinct emitters */
    var LAYOUT = [
      [-5.70,  0.4, 2.60, 0.26, 1.15],
      [-3.55,  1.7, 1.95, 0.21, 0.85],
      [-1.45, -0.3, 3.15, 0.30, 1.35],
      [ 0.95,  1.4, 1.75, 0.20, 0.75],
      [ 3.25,  0.2, 2.45, 0.25, 1.05],
      [ 5.50,  1.5, 2.05, 0.22, 0.90]
    ];

    SOURCES.forEach(function (src, i) {
      var L = LAYOUT[i];
      var g = new THREE.Group();
      g.position.set(L[0], 0, L[1]);

      var h = L[2], r = L[3];
      /* plant house at the base */
      var house = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 0.9), shell);
      house.position.y = 0.31;
      g.add(house);
      /* chimney */
      var stack = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r, h, 14), shell2);
      stack.position.y = 0.5 + h / 2;
      g.add(stack);
      var band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.86, 0.022, 6, 20), bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.5 + h - 0.18;
      g.add(band);
      /* a hot mouth so the emitter reads as running */
      var mouth = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.72, 0.05, 14), glowMat(0xD97B4F, 0.5));
      mouth.position.y = 0.5 + h + 0.03;
      g.add(mouth);

      /* the plume itself */
      var plume = makeFallField(IS_SMALL ? 340 : 900, r * 1.7, 4.6, r * 1.7,
                                0xC8BCAA, 0x6A6157, 0.21, -0.5, 1.7 * L[4]);
      plume.position.y = 0.5 + h + 2.4;
      g.add(plume);

      /* interactive node beside the mouth */
      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.10, 1), glowMat(0xE8A07E, 0.75));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), glowMat(0xD97B4F, 0.14));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.007, 8, 34), glowMat(0xE8A07E, 0.7));
      ring.rotation.x = Math.PI / 2;
      n.add(core, halo, ring);
      n.position.set(0, 0.5 + h + 0.65, 0);
      n.userData = { kind: 'source', index: i, core: core, halo: halo, ring: ring, phase: i * 1.4 };
      core.userData.hot = n; halo.userData.hot = n;
      g.add(n);

      g.userData = { plume: plume, mouth: mouth, phase: i * 0.7 };
      stacksGroup.add(g);
      stackUnits.push(g);
      sourceNodes.push(n);
    });

    /* ground haze pooling around the bases */
    stackHaze = makeFallField(IS_SMALL ? 300 : 700, 17, 4.0, 4.5, 0x9a9184, 0x3b372f, 0.20, -0.12, 0.3);
    stackHaze.position.y = 1.1;
    stacksGroup.add(stackHaze);

    scene.add(stacksGroup);
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
      /* a graded flat where the compound, platter and cycle ring stand —
         plane-local (x, y) is world (x, -z), so the yard at world x≈3.9 sits
         inside a level roughly centred on x≈2 */
      var flat = clamp((Math.hypot(x - 2.0, y + 0.4) - 6.5) / 4.5, 0, 1);
      h = lerp(0.0, h, flat * flat * (3 - 2 * flat));
      pos.setZ(i, h - edge * edge * 5.0);   /* falls away at the horizon */
    }
    geo.computeVertexNormals();
    var ground = new THREE.Mesh(geo, solidMat(0x4a3a22, 1.0, 0.0, true));
    ground.rotation.x = -Math.PI / 2;
    terrainGroup.add(ground);

    /* invasive juliflora scrub, thinning toward the plant side */
    var scrubMat = solidMat(0x35411f, 0.95, 0.0, true);
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

    /* the odd standing tree among the scrub */
    var canopyMat = solidMat(0x3a5c33, 0.95, 0, true);
    for (var tr = 0; tr < (IS_SMALL ? 6 : 12); tr++) {
      var ta = Math.random() * Math.PI * 2, trr = 9 + Math.random() * 22, ts = 1.1 + Math.random() * 1.1;
      var tg = new THREE.Group();
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * ts, 0.11 * ts, 1.4 * ts, 6), trunkMat);
      trunk.position.y = 0.7 * ts; tg.add(trunk);
      var can = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95 * ts, 1), canopyMat);
      can.position.y = 1.8 * ts; can.scale.set(1, 0.8, 1); tg.add(can);
      tg.position.set(Math.cos(ta) * trr, 0, Math.sin(ta) * trr);
      terrainGroup.add(tg);
    }

    /* dry dust hanging over the land */
    dustPoints = makeFallField(IS_SMALL ? 500 : 1200, 60, 14, 40, 0xD9B382, 0x8a7355, 0.055, 0.35);
    dustPoints.position.y = 5;
    terrainGroup.add(dustPoints);

    scene.add(terrainGroup);
  }

  /* --- the pyrolysis yard ------------------------------------------------
     A working compound rather than a machine: feedstock in on the left, a
     row of retort kilns in the middle, the condenser tanks behind them, the
     biochar charging bay in front and the briquette shed on the right. The
     five process markers sit on the thing they describe. */
  function buildPlant() {
    plantGroup = new THREE.Group();
    plantGroup.position.set(3.9, PY, 0);
    plantGroup.rotation.y = 0.32;
    plantGroup.visible = false;

    var Y0 = -1.36;                                   /* yard surface, local */
    var earthMat = solidMat(0x5a4a34, 1.0, 0.0, true);
    var woodMat  = solidMat(0x6b4f33, 0.95, 0.0, true);
    var brushMat = solidMat(0x4e5a33, 0.95, 0.0, true);
    var ironMat  = solidMat(0x3a3532, 0.65, 0.35, true);
    var ironDark = solidMat(0x2a2624, 0.7, 0.3, true);
    var brickMat = solidMat(0x7a4a34, 0.95, 0.0, true);
    var pipeMat  = solidMat(0x4d4844, 0.55, 0.5);
    var wallMat  = solidMat(0x8b7d66, 0.95, 0.0, true);
    var roofMat  = solidMat(0x6e5a48, 0.85, 0.15, true);
    var charMat  = solidMat(0x151512, 0.98, 0.02, true);
    var juteMat  = solidMat(0xB09A78, 0.95, 0.0, true);
    var tankMat  = solidMat(0x8a7a5a, 0.5, 0.45);
    var tarMat   = solidMat(0x3b332c, 0.35, 0.5);
    var leafMat  = solidMat(0x3f6b3a, 0.95, 0.0, true);
    var trunkMat = solidMat(0x4a3a26, 1.0, 0.0, true);

    function box(w, h, d, mat, x, y, z) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m;
    }
    function cyl(rt, rb, h, seg, mat, x, y, z) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); return m;
    }

    /* compacted yard and its kerb */
    plantGroup.add(box(10.6, 0.14, 7.2, earthMat, 0, Y0 - 0.07, 0));
    plantGroup.add(box(10.8, 0.06, 0.12, brickMat, 0, Y0 + 0.03, -3.6));
    for (var f = 0; f < 9; f++) plantGroup.add(cyl(0.035, 0.04, 0.6, 5, woodMat, -4.8 + f * 1.2, Y0 + 0.3, -3.62));

    /* ---- 01 feedstock: a log pile and a heap of cut scrub ---- */
    var rows = [[5, 0], [4, 0.2], [3, 0.4], [2, 0.6], [1, 0.8]];
    rows.forEach(function (r, ri) {
      for (var i = 0; i < r[0]; i++) {
        var log = cyl(0.11, 0.11, 1.5, 8, woodMat, -3.7, Y0 + 0.11 + ri * 0.19, -0.8 + r[1] + i * 0.4);
        log.rotation.z = Math.PI / 2;
        log.rotation.y = (Math.random() - 0.5) * 0.08;
        plantGroup.add(log);
      }
    });
    for (var bsh = 0; bsh < 7; bsh++) {
      var b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 + Math.random() * 0.22, 0), brushMat);
      b.position.set(-3.5 + (Math.random() - 0.5) * 1.3, Y0 + 0.2 + Math.random() * 0.18, 1.7 + (Math.random() - 0.5) * 0.9);
      b.scale.set(1, 0.6, 1); b.rotation.y = Math.random() * 3;
      plantGroup.add(b);
    }

    /* ---- 02 the kiln row ---- */
    var kilnTop = Y0 + 0.18 + 0.85;
    for (var k = 0; k < 5; k++) {
      var kz = -2.0 + k * 1.0, kx = 0.2;
      var g = new THREE.Group();
      g.add(cyl(0.5, 0.52, 0.18, 18, brickMat, kx, Y0 + 0.09, kz));
      g.add(cyl(0.42, 0.44, 0.85, 18, ironMat, kx, Y0 + 0.18 + 0.425, kz));
      var lid = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), ironDark);
      lid.position.set(kx, kilnTop, kz); g.add(lid);
      var door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.05), glowMat(0xD97B4F, 0.35));
      door.position.set(kx + 0.43, Y0 + 0.36, kz); door.rotation.y = Math.PI / 2; g.add(door);
      g.add(cyl(0.045, 0.05, 0.7, 8, pipeMat, kx + 0.28, kilnTop + 0.42, kz));
      var smoke = makeFallField(IS_SMALL ? 40 : 70, 0.12, 1.5, 0.12, 0xD9D2C6, 0x8a8177, 0.085, -0.32, 1.3);
      smoke.position.set(kx + 0.28, kilnTop + 1.55, kz);
      g.add(smoke);
      g.userData = { smoke: smoke, door: door, phase: k * 0.9 };
      plantGroup.add(g);
      kilns.push(g);
    }
    /* syngas / vapour manifold running along the row */
    var manifold = cyl(0.05, 0.05, 4.6, 8, pipeMat, -0.18, kilnTop + 0.15, 0);
    manifold.rotation.x = Math.PI / 2;
    plantGroup.add(manifold);
    for (var kk = 0; kk < 5; kk++) {
      var tap = cyl(0.035, 0.035, 0.4, 6, pipeMat, 0.0, kilnTop + 0.15, -2.0 + kk);
      tap.rotation.z = Math.PI / 2; plantGroup.add(tap);
    }
    var run = cyl(0.05, 0.05, 2.1, 8, pipeMat, 0.87, kilnTop + 0.15, 2.3);
    run.rotation.z = Math.PI / 2; plantGroup.add(run);
    plantGroup.add(cyl(0.05, 0.05, 0.9, 8, pipeMat, 1.9, kilnTop - 0.3, 2.3));

    /* ---- 05 condenser: vinegar tank and tar drum ---- */
    plantGroup.add(cyl(0.45, 0.47, 0.95, 20, tankMat, 1.9, Y0 + 0.475, 2.7));
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), tankMat);
    dome.position.set(1.9, Y0 + 0.95, 2.7); plantGroup.add(dome);
    plantGroup.add(cyl(0.32, 0.32, 0.7, 18, tarMat, 2.95, Y0 + 0.35, 2.95));
    var tarPipe = cyl(0.03, 0.03, 0.9, 6, pipeMat, 2.42, Y0 + 0.5, 2.85);
    tarPipe.rotation.z = Math.PI / 2;
    plantGroup.add(tarPipe);

    /* ---- 03 biochar charging bay ---- */
    plantGroup.add(box(1.9, 0.6, 0.12, brickMat, -1.6, Y0 + 0.3, 1.65));
    plantGroup.add(box(0.12, 0.6, 1.3, brickMat, -2.55, Y0 + 0.3, 2.3));
    plantGroup.add(box(0.12, 0.6, 1.3, brickMat, -0.65, Y0 + 0.3, 2.3));
    for (var c = 0; c < 18; c++) {
      var ch = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 + Math.random() * 0.1, 0), charMat);
      var ca = Math.random() * 6.28, cd = Math.random() * 0.55;
      ch.position.set(-1.6 + Math.cos(ca) * cd, Y0 + 0.1 + Math.random() * 0.22 + (0.55 - cd) * 0.35, 2.3 + Math.sin(ca) * cd * 0.7);
      ch.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      plantGroup.add(ch);
    }
    /* the amendments waiting to be blended in */
    [[0x5b3f2a, -2.75, 3.15], [0x8a8a84, -2.3, 3.3], [0xc9bfa5, -1.85, 3.32], [0x9a6b3a, -1.4, 3.2]].forEach(function (am) {
      var heap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.26, 10), solidMat(am[0], 1, 0, true));
      heap.position.set(am[1], Y0 + 0.13, am[2]);
      plantGroup.add(heap);
    });

    /* ---- 04 briquette shed with press and drying racks ---- */
    plantGroup.add(box(2.3, 0.08, 1.9, wallMat, 2.7, Y0 + 0.04, -0.7));
    plantGroup.add(box(2.3, 1.15, 0.1, wallMat, 2.7, Y0 + 0.6, -1.6));
    plantGroup.add(box(0.1, 1.15, 1.9, wallMat, 1.6, Y0 + 0.6, -0.7));
    plantGroup.add(box(0.1, 1.15, 1.9, wallMat, 3.8, Y0 + 0.6, -0.7));
    var roofL = box(1.3, 0.06, 2.1, roofMat, 2.12, Y0 + 1.45, -0.7); roofL.rotation.z = 0.42;
    var roofR = box(1.3, 0.06, 2.1, roofMat, 3.28, Y0 + 1.45, -0.7); roofR.rotation.z = -0.42;
    plantGroup.add(roofL, roofR);
    plantGroup.add(box(0.5, 0.72, 0.5, ironMat, 2.2, Y0 + 0.44, -0.9));
    var wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20), ironDark);
    wheel.position.set(2.2, Y0 + 0.9, -0.9); plantGroup.add(wheel);
    for (var sh = 0; sh < 3; sh++) {
      var shelfY = Y0 + 0.3 + sh * 0.3;
      plantGroup.add(box(1.0, 0.04, 0.6, woodMat, 3.25, shelfY, -0.6));
      for (var bq = 0; bq < 6; bq++) {
        plantGroup.add(cyl(0.06, 0.06, 0.08, 6, charMat, 2.85 + bq * 0.16, shelfY + 0.06, -0.6 + ((bq % 2) ? 0.14 : -0.12)));
      }
    }

    /* trees around the compound */
    [[-4.9, -2.6, 1.0], [4.9, -2.9, 1.15], [-4.6, 3.4, 0.9], [5.1, 3.1, 1.05], [0.2, -3.9, 0.95]].forEach(function (tr) {
      var tg = new THREE.Group();
      tg.add(cyl(0.07, 0.09, 0.95 * tr[2], 6, trunkMat, 0, Y0 + 0.47 * tr[2], 0));
      var can = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 * tr[2], 1), leafMat);
      can.position.y = Y0 + 1.25 * tr[2]; can.scale.set(1, 0.85, 1); tg.add(can);
      var can2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45 * tr[2], 0), leafMat);
      can2.position.set(0.35 * tr[2], Y0 + 1.55 * tr[2], 0.2); tg.add(can2);
      tg.position.set(tr[0], 0, tr[1]);
      plantGroup.add(tg);
    });

    /* the five process markers, on the thing they describe */
    var NODE_POS = [
      [-3.6, Y0 + 1.75, 0.4],    /* feedstock pile */
      [ 0.2, Y0 + 2.15, 0.0],    /* kiln row */
      [-1.6, Y0 + 1.45, 2.3],    /* charging bay */
      [ 2.7, Y0 + 2.05, -0.7],   /* briquette shed */
      [ 2.3, Y0 + 1.85, 2.8]     /* condenser tanks */
    ];
    PROCESS.forEach(function (p, i) {
      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), glowMat(0x7FD6A5, 0.7));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 18), glowMat(0x3FA06B, 0.13));
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.007, 8, 40), glowMat(0x9FD9D0, 0.75));
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

  /* --- the carbon cycle: six stations on a tilted ring ------------------
     Air → plants → collection → kiln → biochar → soil, and round again.
     Stations stay upright on a ring that leans away from the viewer; the
     flow of carbon runs around it as a stream of particles. */
  var RING_VS = [
    'attribute float aRand;', 'uniform float uTime;', 'uniform float uSize;', 'uniform float uScale;',
    'uniform float uR;', 'uniform float uTilt;', 'uniform float uSpeed;', 'varying float vR;',
    'void main(){',
    '  vR = aRand;',
    '  float a = aRand * 6.2831853 + uTime * uSpeed;',
    '  float r = uR + position.x * 0.16;',
    '  vec3 p = vec3(r * cos(a), -r * sin(a) * sin(uTilt) + position.y * 0.10, r * sin(a) * cos(uTilt));',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_PointSize = uSize * (0.5 + aRand) * (uScale / max(-mv.z, 0.001));',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var CY = GROUND + 3.3;
  function ringPoint(a, R, tilt) {
    return new THREE.Vector3(R * Math.cos(a), -R * Math.sin(a) * Math.sin(tilt), R * Math.sin(a) * Math.cos(tilt));
  }

  function buildCycle() {
    cycleGroup = new THREE.Group();
    cycleGroup.position.set(3.4, CY, -1.2);
    cycleGroup.visible = false;

    var R = 3.0, TILT = 0.58;
    var plinthMat = solidMat(0x1d3a2a, 0.9, 0.05, true);
    var soilMat   = solidMat(0x4a3626, 1.0, 0.0, true);
    var woodMat   = solidMat(0x6b4f33, 0.95, 0.0, true);
    var ironMat   = solidMat(0x3a3532, 0.65, 0.35, true);
    var ironDark  = solidMat(0x2a2624, 0.7, 0.3, true);
    var brickMat  = solidMat(0x7a4a34, 0.95, 0.0, true);
    var charMat   = solidMat(0x151512, 0.98, 0.02, true);
    var juteMat   = solidMat(0xB09A78, 0.95, 0.0, true);
    var leafMat   = solidMat(0x3f6b3a, 0.95, 0.0, true);
    var grassMat  = solidMat(0x6a9a58, 0.95, 0.0, true);
    var trunkMat  = solidMat(0x4a3a26, 1.0, 0.0, true);
    var cloudMat  = new THREE.MeshStandardMaterial({ color: 0xE3EBE6, roughness: 1, metalness: 0, transparent: true, opacity: 0.92 });

    /* the ring and its outer echo */
    var ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.026, 8, 160), glowMat(0x7FBF8A, 0.55));
    ring.rotation.x = Math.PI / 2 + TILT;
    cycleGroup.add(ring);
    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(R + 0.09, 0.011, 8, 160), glowMat(0x9FD9D0, 0.22));
    ring2.rotation.x = Math.PI / 2 + TILT;
    cycleGroup.add(ring2);

    /* the stream of carbon running round it */
    var N = IS_SMALL ? 500 : 1100;
    var pos = new Float32Array(N * 3), rnd = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2; pos[i * 3 + 1] = (Math.random() - 0.5) * 2; pos[i * 3 + 2] = 0;
      rnd[i] = Math.random();
    }
    var fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    fg.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    ringFlow = new THREE.Points(fg, registerPoints(new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 0.11 }, uScale: { value: viewScale() },
                  uR: { value: R }, uTilt: { value: TILT }, uSpeed: { value: 0.22 }, uOpacity: { value: 0 },
                  uA: { value: new THREE.Color(0x9FD9D0) }, uB: { value: new THREE.Color(0x3FA06B) } },
      vertexShader: RING_VS, fragmentShader: DRIFT_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    })));
    cycleGroup.add(ringFlow);

    /* direction arrows at the midpoints */
    for (var m = 0; m < 6; m++) {
      var a0 = (270 + m * 60 + 30) * Math.PI / 180;
      var here = ringPoint(a0, R, TILT), next = ringPoint(a0 + 0.08, R, TILT);
      var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 8), glowMat(0x9FD9D0, 0.8));
      arrow.position.copy(here);
      arrow.lookAt(next);
      arrow.rotateX(Math.PI / 2);
      cycleGroup.add(arrow);
      cycleArrows.push(arrow);
    }

    function cyl(rt, rb, h, seg, mat, x, y, z) {
      var mm = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); mm.position.set(x, y, z); return mm;
    }

    /* station models, each upright on a small plinth */
    var BUILD = [
      function () {                                  /* air */
        var g = new THREE.Group();
        [[0, 0.62, 0, 0.30], [-0.32, 0.55, 0.05, 0.22], [0.34, 0.56, -0.02, 0.24], [0.1, 0.78, 0.08, 0.2], [-0.12, 0.42, -0.14, 0.18]].forEach(function (c) {
          var p = new THREE.Mesh(new THREE.SphereGeometry(c[3], 14, 12), cloudMat); p.position.set(c[0], c[1], c[2]); g.add(p);
        });
        g.userData.cloud = true;
        return g;
      },
      function () {                                  /* plants */
        var g = new THREE.Group();
        [[-0.22, 1.0], [0.26, 0.78]].forEach(function (t) {
          g.add(cyl(0.05, 0.07, 0.5 * t[1], 6, trunkMat, t[0], 0.25 * t[1], 0));
          var can = new THREE.Mesh(new THREE.ConeGeometry(0.34 * t[1], 0.9 * t[1], 8), leafMat);
          can.position.set(t[0], 0.85 * t[1], 0); g.add(can);
        });
        for (var q = 0; q < 6; q++) {
          var tuft = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.26, 4), grassMat);
          tuft.position.set(-0.45 + q * 0.18, 0.13, 0.3 - (q % 2) * 0.15); tuft.rotation.z = (Math.random() - 0.5) * 0.4; g.add(tuft);
        }
        return g;
      },
      function () {                                  /* collection */
        var g = new THREE.Group();
        for (var b = 0; b < 7; b++) {
          var ang = (b / 6) * Math.PI * 2, rr = b === 6 ? 0 : 0.11;
          var st = cyl(0.05, 0.05, 0.9, 6, woodMat, 0, 0.16 + Math.sin(ang) * rr, Math.cos(ang) * rr);
          st.rotation.z = Math.PI / 2; g.add(st);
        }
        var rope = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 6, 16), juteMat);
        rope.rotation.y = Math.PI / 2; rope.position.y = 0.16; g.add(rope);
        var sack = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), juteMat);
        sack.scale.set(1, 1.25, 0.85); sack.position.set(0.05, 0.27, -0.45); g.add(sack);
        return g;
      },
      function () {                                  /* kiln */
        var g = new THREE.Group();
        g.add(cyl(0.42, 0.44, 0.14, 16, brickMat, 0, 0.07, 0));
        g.add(cyl(0.34, 0.36, 0.7, 16, ironMat, 0, 0.49, 0));
        var lid = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), ironDark);
        lid.position.y = 0.84; g.add(lid);
        g.add(cyl(0.04, 0.045, 0.5, 8, solidMat(0x4d4844, 0.55, 0.5), 0.22, 1.05, 0));
        var smoke = makeFallField(50, 0.1, 1.1, 0.1, 0xD9D2C6, 0x8a8177, 0.08, -0.3, 1.2);
        smoke.position.set(0.22, 1.85, 0); g.add(smoke);
        g.userData.smoke = smoke;
        return g;
      },
      function () {                                  /* biochar */
        var g = new THREE.Group();
        var sheet = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.03, 0.95), juteMat);
        sheet.position.y = 0.015;
        g.add(sheet);
        for (var c = 0; c < 14; c++) {
          var ch = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.09, 0), charMat);
          var ca = Math.random() * 6.28, cd = Math.random() * 0.34;
          ch.position.set(Math.cos(ca) * cd, 0.08 + Math.random() * 0.16 + (0.34 - cd) * 0.5, Math.sin(ca) * cd);
          ch.rotation.set(Math.random() * 3, Math.random() * 3, 0); g.add(ch);
        }
        return g;
      },
      function () {                                  /* soil */
        var g = new THREE.Group();
        g.add(cyl(0.52, 0.5, 0.24, 18, soilMat, 0, 0.12, 0));
        for (var sp = 0; sp < 5; sp++) {
          var shoot = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.34, 5), grassMat);
          var sa = sp * 1.26, sd = 0.12 + (sp % 2) * 0.16;
          shoot.position.set(Math.cos(sa) * sd, 0.4, Math.sin(sa) * sd); shoot.rotation.z = (Math.random() - 0.5) * 0.3; g.add(shoot);
        }
        for (var sk = 0; sk < 26; sk++) {
          var fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), charMat);
          var fa = Math.random() * 6.28, fd = Math.random() * 0.44;
          fl.position.set(Math.cos(fa) * fd, 0.245, Math.sin(fa) * fd); g.add(fl);
        }
        [[-0.2, 0.0], [0.15, 0.12], [0.02, -0.18]].forEach(function (rt) {
          g.add(cyl(0.012, 0.03, 0.55, 5, juteMat, rt[0], -0.27, rt[1]));
        });
        return g;
      }
    ];

    CYCLE.forEach(function (c, i) {
      var a = (270 + i * 60) * Math.PI / 180;
      var st = new THREE.Group();
      st.position.copy(ringPoint(a, R, TILT));
      st.add(cyl(0.6, 0.66, 0.08, 24, plinthMat, 0, -0.04, 0));
      var item = BUILD[i]();
      st.add(item);

      var n = new THREE.Group();
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), glowMat(0x9FD9D0, 0.75));
      var halo = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), glowMat(0x6FA8A1, 0.13));
      var rg   = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.007, 8, 36), glowMat(0x9FD9D0, 0.7));
      rg.rotation.x = Math.PI / 2;
      n.add(core, halo, rg);
      n.position.set(0, 1.55, 0);
      n.userData = { kind: 'cycle', index: i, core: core, halo: halo, ring: rg, phase: i * 1.2 };
      core.userData.hot = n; halo.userData.hot = n;
      st.add(n);

      st.userData = { item: item, node: n, baseY: st.position.y, phase: i * 0.9 };
      cycleGroup.add(st);
      cycleStations.push(st);
      cycleNodes.push(n);
    });

    scene.add(cycleGroup);
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
    buildStacks();
    buildTerrain();
    buildPlant();
    buildProducts();
    buildCycle();
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
  var terrainMats, productMats;

  /* =======================================================================
     6. THE JOURNEY — camera stations anchored to DOM elements
     ===================================================================== */
  /* Each station is a camera + scene pose anchored to a DOM element.
     `light: true` marks a cream editorial band — the section there is opaque,
     so the canvas is hidden and the pose only needs to be a sane continuation. */
  var CREAM = 0xF7F5EF;
  var STATIONS = [
    { sel: '#hero', dot: 0,
      cam: [0, 0.7, 13.2], tgt: [0.5, 0.1, 0], bg: 0x0B2318,
      poll: 0.45, rest: 0.02, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [3.3, -0.9, -1.5], earthScale: 0.95 },

    { sel: '.hero__actions', dot: 0, anchor: 'bottom',
      cam: [0.6, 0.5, 12.4], tgt: [0.5, 0.05, 0], bg: 0x0B2318,
      poll: 0.55, rest: 0.02, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [3.6, -0.7, -1.5], earthScale: 0.98 },

    /* Act I — the smoke: an industrial foreground under a hazed planet */
    { sel: '#problem', dot: 1,
      cam: [2.2, 1.0, 10.5], tgt: [0.3, 0.05, 0], bg: 0x1A1208,
      poll: 1.00, rest: 0.00, earthFade: 1, stacks: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [4.5, 0.2, -1.0], earthScale: 1.05 },

    { sel: '#problem .panel', dot: 1, anchor: 'bottom',
      cam: [1.4, 0.5, 9.8], tgt: [0.3, -0.55, 0], bg: 0x1A1208,
      poll: 1.00, rest: 0.00, earthFade: 1, stacks: 1, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [4.5, 0.2, -1.0], earthScale: 1.05 },

    { sel: '#sources', dot: 1, light: true,
      cam: [1.4, 0.6, 10.0], tgt: [0.4, 0.0, 0], bg: CREAM,
      poll: 0.80, rest: 0.05, earthFade: 1, stacks: 0.6, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [4.0, 0.2, -1.0], earthScale: 1.0 },

    /* the dive */
    { sel: '.dive-lead', dot: 2,
      cam: [1.4, -2.0, 11.0], tgt: [0.6, -6.0, 0], bg: 0x241606,
      poll: 0.60, rest: 0.08, earthFade: 0.6, stacks: 0, terrain: 0.25, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [1.0, 0, -1.0], earthScale: 1.0 },

    { sel: '.land-reveal', dot: 2,
      cam: [0.6, GROUND + 2.4, 11.5], tgt: [0.8, GROUND + 0.7, 0], bg: 0x2A1B08,
      poll: 0.42, rest: 0.14, earthFade: 0, stacks: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#land', dot: 2, light: true,
      cam: [0.2, GROUND + 2.2, 11.0], tgt: [0.6, GROUND + 0.7, 0], bg: CREAM,
      poll: 0.36, rest: 0.20, earthFade: 0, stacks: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* Act II — the unit standing on that ground */
    { sel: '#solution', dot: 3,
      cam: [0.5, PY + 1.7, 10.2], tgt: [0.9, PY - 0.05, 0], bg: 0x0B2318,
      poll: 0.28, rest: 0.32, earthFade: 0, stacks: 0, terrain: 1, plant: 1, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.step:last-child', dot: 3, anchor: 'bottom',
      cam: [-0.2, PY + 1.4, 9.8], tgt: [0.9, PY - 0.05, 0], bg: 0x0B2318,
      poll: 0.20, rest: 0.42, earthFade: 0, stacks: 0, terrain: 1, plant: 1, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* Act III — the product line */
    { sel: '#products', dot: 4,
      cam: [0, GROUND + 4.4, 9.6], tgt: [0, GROUND - 0.1, 0], bg: 0x0E2A1C,
      poll: 0.12, rest: 0.55, earthFade: 0, stacks: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.product-reveal', dot: 4,
      cam: [0, GROUND + 4.0, 8.4], tgt: [0, GROUND - 0.35, 0], bg: 0x0E2A1C,
      poll: 0.11, rest: 0.57, earthFade: 0, stacks: 0, terrain: 0.85, plant: 0, prod: 1, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#productLines', dot: 4, light: true,
      cam: [0, GROUND + 5.4, 10.6], tgt: [0, GROUND + 2.0, 0], bg: CREAM,
      poll: 0.09, rest: 0.62, earthFade: 0, stacks: 0, terrain: 0.7, plant: 0, prod: 1, prodLift: 1, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* Act IV — below the surface */
    { sel: '#restoration', dot: 5,
      cam: [0.2, GROUND + 5.3, 10.8], tgt: [0.6, GROUND + 3.0, -1.2], bg: 0x0E2416,
      poll: 0.04, rest: 0.75, earthFade: 0, stacks: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 1,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '#restorationEnd', dot: 5, anchor: 'bottom',
      cam: [-0.3, GROUND + 5.0, 10.2], tgt: [0.6, GROUND + 2.9, -1.2], bg: 0x0E2416,
      poll: 0.02, rest: 0.85, earthFade: 0, stacks: 0, terrain: 1, plant: 0, prod: 0, prodLift: 0, soil: 1,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    /* Act V — back out to orbit, restored */
    { sel: '#horizons', dot: 6,
      cam: [0.2, 0.9, 11.6], tgt: [0, 0, 0], bg: 0x0B2318,
      poll: 0.03, rest: 1.00, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 0, 0], earthScale: 1.0 },

    { sel: '.horizon-reveal', dot: 6,
      cam: [0, 0.6, 12.0], tgt: [0, 0.2, 0], bg: 0x0B2318,
      poll: 0.02, rest: 1.00, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 1.4, -1.4], earthScale: 0.78 },

    { sel: '#horizonCards', dot: 6, light: true,
      cam: [0, 0.6, 12.6], tgt: [0, 0.4, 0], bg: CREAM,
      poll: 0.01, rest: 1.00, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
      earthPos: [0, 2.8, -2.2], earthScale: 0.6 },

    { sel: '#contact', dot: 7, light: true,
      cam: [0, 3.0, 15.5], tgt: [0, -0.7, 0], bg: CREAM,
      poll: 0.00, rest: 1.00, earthFade: 1, stacks: 0, terrain: 0, plant: 0, prod: 0, prodLift: 0, soil: 0,
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

  var NUM = ['poll', 'rest', 'earthFade', 'stacks', 'terrain', 'plant', 'prod', 'prodLift', 'soil', 'earthScale'];
  var KEY = { poll: 'pollution', rest: 'restoration', earthFade: 'earthFade', stacks: 'stacks',
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
  var DOT_ACTS   = ['hero', 'sources', 'land', 'solution', 'productLines', 'restoration', 'horizonCards', 'contact'];

  function updateChrome() {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
    railFill.style.height = (journey.global * 100).toFixed(2) + '%';

    var si = clamp(journey.local > 0.55 ? journey.index + 1 : journey.index, 0, STATIONS.length - 1);
    var dot = STATIONS[si].dot;
    /* the rail sits over whichever band it is currently in */
    document.body.classList.toggle('on-dark', !STATIONS[si].light);
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
    occluders = $$('.step__card, .panel, .horizon, .product, .source, .flow__card, .band-head, .caption').reduce(function (acc, el) {
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
    if (g === 'source')  return state.stacks > 0.55;
    if (g === 'plant')   return state.plant > 0.55;
    if (g === 'product') return state.products > 0.55;
    if (g === 'cycle')   return state.soil > 0.55;
    return state.restoration > 0.62 && state.stacks < 0.2 &&
           state.plant < 0.25 && state.products < 0.25 && state.soil < 0.25;
  }
  function nodesFor(g) {
    if (g === 'source')  return sourceNodes;
    if (g === 'plant')   return processNodes;
    if (g === 'product') return productNodes;
    if (g === 'cycle')   return cycleNodes;
    return horizonNodes;
  }

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
  var UI_SELECTOR = '.panel, .step__card, .horizon, .product, .source, .flow__card, .site-header, .modal__card, ' +
                    '.hs, .rail, .act--light, .foot__cards, .foot__lead, .outcome, .scroll-hint, ' +
                    '.dive-lead, .land-reveal, .product-reveal, .horizon-reveal, .caption, a, button, [data-open]';

  function pickNode(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var pool = [];
    ['source', 'plant', 'product', 'cycle', 'horizon'].forEach(function (g) {
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
    ['pollution', 'restoration', 'stacks', 'plant', 'terrain', 'products', 'prodLift', 'soil', 'earthFade', 'earthScale']
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
    scene.fog.density = 0.014 + state.stacks * 0.010 + state.terrain * 0.030 + state.soil * 0.004;

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
    scene.userData.emberLight.intensity = 0.4 + state.pollution * 2.2 * Math.max(ef, Math.max(state.terrain, state.stacks));
    scene.userData.lifeLight.intensity  = state.restoration * 2.4;
    scene.userData.sunLight.intensity   = Math.max(state.terrain, state.products) * 0.8;
    /* below ground it should read as a lit cut face, not a sunlit wall */
    scene.userData.key.intensity     = 1.1 - state.soil * 0.2;
    scene.userData.ambient.intensity = 0.55 - state.soil * 0.08;

    /* ---------------- the smoke ---------------- */
    /* held back until well into the transition so they never haunt the hero */
    var stackIn = clamp((state.stacks - 0.30) / 0.55, 0, 1);
    stacksGroup.visible = stackIn > 0.012;
    if (stacksGroup.visible) {
      setSolids(stackMats, stackIn);
      stackHaze.material.uniforms.uTime.value = t;
      stackHaze.material.uniforms.uOpacity.value = stackIn * 0.26;
      stackUnits.forEach(function (u, i) {
        var pulse = 0.6 + Math.abs(Math.sin(t * 0.7 + u.userData.phase)) * 0.4;
        u.userData.plume.material.uniforms.uTime.value = t;
        u.userData.plume.material.uniforms.uOpacity.value = stackIn * (0.34 + pulse * 0.26);
        u.userData.mouth.material.opacity = stackIn * (0.22 + pulse * 0.30);
        var n = sourceNodes[i], live = hovered === n;
        var np = 0.85 + Math.sin(t * 2.1 + n.userData.phase) * 0.15;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.7 : 1.0) * np, 6, dt));
        n.userData.core.rotation.y += dt * 0.9;
        n.userData.ring.rotation.z += dt * (live ? 1.5 : 0.6);
        n.userData.core.material.opacity = 0.75 * stackIn;
        n.userData.halo.material.opacity = (live ? 0.30 : 0.14) * stackIn;
        n.userData.ring.material.opacity = (live ? 0.9 : 0.6) * stackIn;
      });
    }

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

    /* ---------------- the pyrolysis yard ---------------- */
    plantGroup.visible = state.plant > 0.012;
    if (plantGroup.visible) {
      plantGroup.scale.setScalar((0.42 + state.plant * 0.43) * state.plant);
      plantGroup.rotation.y += dt * 0.022;              /* a slow turntable, not a spin */
      kilns.forEach(function (k, i) {
        var burn = 0.5 + Math.abs(Math.sin(t * 0.9 + k.userData.phase)) * 0.5;
        k.userData.door.material.opacity = (0.18 + burn * 0.3) * state.plant;
        k.userData.smoke.material.uniforms.uTime.value = t + i * 3.1;
        k.userData.smoke.material.uniforms.uOpacity.value = state.plant * (0.22 + burn * 0.12);
      });
      processNodes.forEach(function (n, i) {
        var live = (i === activeStep) || (hovered === n);
        var pulse = 0.85 + Math.sin(t * 2.2 + n.userData.phase) * 0.15;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.7 : 1.0) * pulse, 6, dt));
        n.userData.core.rotation.y += dt * 0.9;
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

    /* ---------------- the carbon cycle ---------------- */
    cycleGroup.visible = state.soil > 0.012;
    if (cycleGroup.visible) {
      setSolids(cycleMats, state.soil);
      cycleGroup.scale.setScalar(0.6 + state.soil * 0.4);
      ringFlow.material.uniforms.uTime.value = t;
      ringFlow.material.uniforms.uOpacity.value = state.soil * 0.9;
      cycleArrows.forEach(function (ar, i) { ar.material.opacity = state.soil * (0.45 + Math.sin(t * 2.4 - i * 1.05) * 0.35); });
      cycleStations.forEach(function (st, i) {
        var n = st.userData.node, live = (i === activeFlow) || (hovered === n);
        st.position.y = st.userData.baseY + Math.sin(t * 0.8 + st.userData.phase) * 0.04;
        st.scale.setScalar(damp(st.scale.x, live ? 1.18 : 1.0, 5, dt));
        if (st.userData.item.userData.cloud) st.userData.item.rotation.y += dt * 0.15;
        if (st.userData.item.userData.smoke) {
          st.userData.item.userData.smoke.material.uniforms.uTime.value = t;
          st.userData.item.userData.smoke.material.uniforms.uOpacity.value = state.soil * 0.3;
        }
        var pulse = 0.85 + Math.sin(t * 2.0 + n.userData.phase) * 0.15;
        n.scale.setScalar(damp(n.scale.x, (live ? 1.6 : 1.0) * pulse, 6, dt));
        n.userData.core.rotation.y += dt * 0.8;
        n.userData.ring.rotation.z += dt * (live ? 1.4 : 0.6);
        n.userData.core.material.opacity = 0.75 * state.soil;
        n.userData.halo.material.opacity = (live ? 0.28 : 0.13) * state.soil;
        n.userData.ring.material.opacity = (live ? 0.9 : 0.6) * state.soil;
      });
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
    starField.material.uniforms.uOpacity.value = 0.85 * clamp(1 - Math.max(state.stacks * 0.8, Math.max(state.terrain, state.soil)) * 1.3, 0, 1);

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

    /* ScrollTrigger is intentionally not used for parallax: copy that drifts
       against the scroll reads as floating text over a moving 3D scene. */
  }

  /* =======================================================================
     11. BOOT
     ===================================================================== */
  var LOAD_MSGS = [
    'Warming the soil', 'Counting the smoke', 'Charging six pyrolysis kilns',
    'Pressing the first briquettes', 'Closing the loop'
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
        stackMats   = collectSolids(stacksGroup);
        terrainMats = collectSolids(terrainGroup);
        productMats = collectSolids(productGroup);
        cycleMats   = collectSolids(cycleGroup);
        setSolids(stackMats, 0); setSolids(terrainMats, 0); setSolids(productMats, 0); setSolids(cycleMats, 0);
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
    SOURCES: SOURCES, PROCESS: PROCESS, PRODUCTS: PRODUCTS, CYCLE: CYCLE, HORIZONS: HORIZONS,
    state: state, target: target, journey: journey, stations: STATIONS,
    openModal: openModal, closeModal: closeModal
  };
})();
