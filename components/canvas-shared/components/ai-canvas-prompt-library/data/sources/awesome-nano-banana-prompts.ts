import type { PromptLibraryItem } from '../../ai-canvas-prompt-library.types';

// Recipes are versioned from flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d under MIT.
// The remaining generated examples are pinned to flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3.
// The runtime list contains all 100 recipes, with ten curated generated examples featured first.
const DEFAULT_COVER_URL = new URL('./canvas-prompt-library.webp', import.meta.url).href;

const prompts: readonly PromptLibraryItem[] = [
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d/assets/examples/luma-tea-poster.png',
    createdAt: '2026-08-28',
    description: 'Best for: beverage, beauty, food, or consumer-goods launches',
    id: 'awesome-nano-banana-prompts:01-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a premium 4:5 launch poster for the fictional product {{product_name}}.\nHero subject: {{product_description}}, occupying 60% of the frame on {{pedestal_or_surface}}.\nArt direction: {{brand_mood}}, {{palette}}, realistic materials, controlled studio highlights,\nand one distinctive visual motif: {{motif}}. Keep a clear top safe zone and mobile readability.\n\nTEXT — RENDER VERBATIM\n"{{brand_name}}"\n"{{english_tagline}}"\n"{{localized_tagline}}"\n\nUse a clear visual hierarchy and optically balance both languages. Do not invent ingredients,\nawards, certifications, prices, logos, or fine print. Preserve supplied package geometry and\nlabel proportions. Verify every character and show one product only.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/01-brand-and-advertising.md#1-multilingual-product-launch-key-visual',
    tags: [
      'Brand and Advertising',
      'beverage, beauty, food, or consumer-goods launches',
      '4:5, 2K or 4K',
      'Intermediate',
    ],
    title: 'Multilingual product launch key visual',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d/assets/examples/heat-pump-infographic.png',
    createdAt: '2026-08-28',
    description: 'Best for: classroom explainers',
    id: 'awesome-nano-banana-prompts:04-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a scientifically accurate 3:2 cross-section of {{subject}} for {{education_level}}.\nShow only these structures: {{verified_structures}}. Use clean color separation, thin leader lines,\na scale cue when appropriate, and large labels. Title: "{{title}}".\n\nUse authoritative terminology supplied here; if grounding is enabled, verify against {{primary_source}}.\nDo not invent anatomy, imply false scale, or add decorative organs/components. If uncertain, omit the\ndetail and report the omission in accompanying text. Verify every leader line endpoint.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/04-infographics-and-education.md#2-scientific-cross-section',
    tags: ['Infographics and Education', 'classroom explainers', '3:2', 'Advanced'],
    title: 'Scientific cross-section',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d/assets/examples/stillroom-mobile-ui.png',
    createdAt: '2026-08-28',
    description: 'Best for: product discovery and stakeholder review',
    id: 'awesome-nano-banana-prompts:05-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create one production-minded 9:16 mobile home screen for {{app_type}} used by {{primary_user}}.\nPrimary job: {{user_job}}. Include a compact top bar, one status summary, one primary action,\n{{count}} content cards, and a five-item bottom navigation. Use an 8-point spacing rhythm,\naccessible contrast, realistic data, and {{visual_system}}. Exact screen title: "{{title}}".\n\nNo impossible controls, decorative charts, glassmorphism over text, fake device frame, brand logo,\nor lorem ipsum. Keep touch targets plausible and information hierarchy clear. This is a UI concept,\nnot an image of a phone.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/05-ui-app-and-web.md#1-mobile-app-home-screen',
    tags: ['UI, App, and Web Design', 'product discovery and stakeholder review', '9:16', 'Intermediate'],
    title: 'Mobile app home screen',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d/assets/examples/nori-character-sheet.png',
    createdAt: '2026-08-28',
    description: 'Best for: building a consistent series',
    id: 'awesome-nano-banana-prompts:06-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original character anchor sheet for {{character_role}} named {{name}}. Show front, three-quarter,\nprofile, back, full-body neutral pose, four expressions, hand detail, signature prop, outfit construction,\nand six color swatches. Traits: {{physical_traits}}. Personality visible through design: {{traits}}.\nMedium: {{medium}} on a clean neutral sheet.\n\nKeep facial geometry, proportions, costume seams, and palette identical across every view. No existing IP,\ncelebrity likeness, named living-artist imitation, text except supplied labels, or alternate costumes.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/06-characters-and-storytelling.md#1-original-character-anchor-sheet',
    tags: ['Characters, Comics, and Storyboards', 'building a consistent series', '3:2', 'Advanced'],
    title: 'Original character anchor sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@40bbf2be4b604bbfeafe6db544540e1a25c5a42d/assets/examples/pine-and-bowl-special.png',
    createdAt: '2026-08-28',
    description: 'Best for: cafes and restaurants',
    id: 'awesome-nano-banana-prompts:10-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 weekly-special poster for {{restaurant_type}}. Hero image: an honest, appetizing photograph of\n{{actual_dish}} using only {{verified_ingredients}}. Mood: {{mood}}; surface: {{surface}}; light: natural side light.\nRender exactly: "{{special_name}}" "{{availability}}" "{{price_and_currency}}" "{{short_CTA}}".\n\nDo not invent toppings, discounts, delivery partners, awards, dietary claims, or contact details. Keep price prominent,\nfood realistic, and all copy readable on a phone. Verify currency and availability.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/10-local-business-campaigns.md#1-restaurant-weekly-special-poster',
    tags: ['Local Business Campaign', 'cafes and restaurants', '4:5', 'Intermediate'],
    title: 'Restaurant weekly-special poster',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/outdoor-billboard-nightlink.webp',
    createdAt: '2026-08-28',
    description: 'Best for: awareness campaigns',
    id: 'awesome-nano-banana-prompts:01-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a 21:9 roadside billboard for {{brand_or_campaign}}. Communicate one idea in under three\nseconds: {{single_message}}. Use one large subject, a bold silhouette, strong day/night contrast,\nand generous negative space. Preview the design as a flat front-facing billboard artwork, not a\nstreet mockup.\n\nRender exactly: "{{headline_under_six_words}}" and "{{short_CTA}}".\nNo other text. Keep all copy inside a 12% safe margin and large enough to read from a distance.\nNo QR code unless supplied. No invented logo; use Image 1 artwork exactly if provided.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/01-brand-and-advertising.md#2-outdoor-billboard-with-instant-readability',
    tags: ['Brand and Advertising', 'awareness campaigns', '21:9', 'Beginner'],
    title: 'Outdoor billboard with instant readability',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/marketplace-portable-speaker.webp',
    createdAt: '2026-08-28',
    description: 'Best for: product listing main image',
    id: 'awesome-nano-banana-prompts:02-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1–3: rights-cleared product references from front, side, and three-quarter views.\nCreate a clean square marketplace hero image of the exact product on a pure {{background_color}}\nbackground. Preserve silhouette, dimensions, color, materials, seams, ports, closures, label art,\nand all visible components. Center the product, fill 78–85% of the canvas, use a natural soft\nground shadow, accurate perspective, and crisp edges.\n\nOne product only. No props, hands, badges, text overlays, added accessories, reflections that hide\ndetails, or redesigned labels. Compare geometry with all three references before finalizing.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/02-ecommerce-and-product.md#1-marketplace-hero-packshot',
    tags: ['E-commerce and Product', 'product listing main image', '1:1', 'Beginner'],
    title: 'Marketplace hero packshot',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/car-free-city-youtube-thumbnail.webp',
    createdAt: '2026-08-28',
    description: 'Best for: explainers and creator videos',
    id: 'awesome-nano-banana-prompts:03-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a high-clarity 16:9 YouTube thumbnail about {{video_topic}} for {{audience}}.\nUse one expressive focal subject, one supporting visual clue, and a simple background with strong\nseparation at phone size. Composition: {{subject_placement}}; emotion: {{emotion}}; palette:\n{{high_contrast_palette}}. Render exactly one short headline: "{{two_to_five_word_hook}}".\n\nNo extra labels, fake platform UI, red arrows, circles, reaction clutter, logos, or misleading\nvisual claims unless explicitly requested. Keep face and text inside the central safe area.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/03-social-and-creator.md#1-youtube-thumbnail-with-one-idea',
    tags: ['Social and Creator Content', 'explainers and creator videos', '16:9', 'Beginner'],
    title: 'YouTube thumbnail with one idea',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/sourdough-process-infographic.webp',
    createdAt: '2026-08-28',
    description: 'Best for: tutorials and onboarding',
    id: 'awesome-nano-banana-prompts:04-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 infographic explaining {{process}} to {{audience}}. Use exactly {{step_count}} numbered\nstages in a left-to-right flow, one simple illustration per stage, consistent arrows, large labels,\nand a final outcome panel. Title: "{{title}}". Step labels exactly: {{approved_step_labels}}.\n\nDo not merge, reorder, rename, or invent steps. Avoid paragraphs and tiny text. Use {{palette}} with\naccessible contrast. Verify numbering, arrows, and the connection between each label and illustration.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/04-infographics-and-education.md#1-process-infographic',
    tags: ['Infographics and Education', 'tutorials and onboarding', '16:9', 'Intermediate'],
    title: 'Process infographic',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/subscription-revenue-dashboard.webp',
    createdAt: '2026-08-28',
    description: 'Best for: B2B concepts',
    id: 'awesome-nano-banana-prompts:05-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a desktop 16:9 dashboard for {{business_function}}. Layout: left navigation, top date filter,\nfour KPI cards, one primary trend chart, one breakdown chart, and one action table. Use only this\napproved sample data: {{data}}. Highlight the decision {{decision_user_should_make}}.\n\nRender labels and values exactly; use honest axes and consistent units. No random percentages,\nmeaningless charts, cropped navigation, lorem ipsum, or decorative 3D objects. High information\ndensity with calm whitespace and accessible color semantics.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/05-ui-app-and-web.md#2-saas-analytics-dashboard',
    tags: ['UI, App, and Web Design', 'B2B concepts', '16:9', 'Advanced'],
    title: 'SaaS analytics dashboard',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/milo-rainwater-silent-comic.webp',
    createdAt: '2026-08-28',
    description: 'Best for: short social stories',
    id: 'awesome-nano-banana-prompts:06-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      "Image 1: approved character anchor. Create a vertical four-panel silent comic about {{story_premise}}.\nPanel beats: 1 {{setup}}, 2 {{complication}}, 3 {{turn}}, 4 {{payoff}}. Use clear changes in shot size and\neye line while preserving the character's face, proportions, outfit, and palette. Style: {{style_properties}}.\n\nExactly four equal panels, no speech bubbles, captions, symbols, logos, or extra characters. Each panel must\nshow one readable action and the sequence must work without text.",
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/06-characters-and-storytelling.md#2-four-panel-silent-comic',
    tags: ['Characters, Comics, and Storyboards', 'short social stories', '4:5', 'Intermediate'],
    title: 'Four-panel silent comic',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/ceramicist-editorial-portrait.webp',
    createdAt: '2026-08-28',
    description: 'Best for: profiles and features',
    id: 'awesome-nano-banana-prompts:07-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a photorealistic 4:5 editorial portrait of {{subject_description}} in {{environment}}, engaged in\n{{natural_action}}. Camera: {{lens_behavior}}, eye-level, realistic working distance. Light: {{motivated_light}}.\nPreserve real skin texture, fabric wear, flyaway hair, and subtle asymmetry. Color grade: {{grade}}.\n\nNo beauty-filter skin, impossible bokeh, fashion retouching, duplicated jewelry, distorted hands, text, logos,\nor stereotyped props. The moment should feel observed rather than staged.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/07-photography-and-editorial.md#1-natural-editorial-portrait',
    tags: ['Photography and Editorial', 'profiles and features', '4:5', 'Intermediate'],
    title: 'Natural editorial portrait',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/amber-pendant-object-replacement.webp',
    createdAt: '2026-08-28',
    description: 'Best for: interiors and product cleanup',
    id: 'awesome-nano-banana-prompts:08-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: edit target. Image 2: replacement-object reference.\nReplace only {{target_object}} in Image 1 with the object from Image 2. Preserve the base camera, crop, room geometry,\nall other objects, people, surface textures, and light direction. Match scale, perspective, occlusion, depth of field,\ncontact shadow, reflection, and color bounce.\n\nDo not move, recolor, remove, sharpen, or restyle anything else. Do not duplicate the replacement. Compare the entire\nframe with Image 1 and confirm that pixels outside the necessary blend area are conceptually unchanged.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/08-editing-and-localization.md#1-precise-object-replacement',
    tags: ['Editing, Localization, and Compositing', 'interiors and product cleanup', 'match input', 'Intermediate'],
    title: 'Precise object replacement',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/cliffside-observatory-pixel-art.webp',
    createdAt: '2026-08-28',
    description: 'Best for: game concept and retro campaigns',
    id: 'awesome-nano-banana-prompts:11-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original 16:9 pixel-art environment of {{location}} at {{time}}. Use a deliberate {{approx_palette_size}}-color\npalette, crisp nearest-neighbor pixels, coherent tile scale, readable depth planes, and one gameplay focal area.\nInclude {{required_objects}} with consistent sprite scale.\n\nNo mixed pixel densities, anti-aliased edges, painted gradients, existing game IP, logos, text, or impossible perspective.\nKeep silhouettes readable at 50% size and preserve a tileable logic where surfaces repeat.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/11-style-lab.md#5-pixel-art-game-environment',
    tags: ['Style Lab', 'game concept and retro campaigns', '16:9', 'Advanced'],
    title: 'Pixel-art game environment',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@7365f042a9072343e0b0c76c464c9c53512e6d19/assets/examples/specified-living-room-interior.webp',
    createdAt: '2026-08-28',
    description: 'Best for: early spatial visualization',
    id: 'awesome-nano-banana-prompts:12-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved floor plan with dimensions. Image 2: material palette reference only.\nCreate a photorealistic eye-level interior view from {{camera_position}} looking toward {{direction}}.\nPreserve the room footprint, ceiling height, wall openings, door swings, window locations, circulation,\nand built-in elements from Image 1. Apply only the materials named in {{approved_material_schedule}}.\nLighting: physically plausible {{time_of_day}} daylight plus the specified practical fixtures.\n\nDo not enlarge the room, move walls, add windows, hide doors, invent furniture, or copy objects from\nImage 2. Keep verticals straight, scale credible, and every material consistent across reflections.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/12-architecture-interiors-and-real-estate.md#1-floor-plan-to-photoreal-interior',
    tags: ['Architecture, Interiors, and Real Estate', 'early spatial visualization', '16:9', 'Advanced'],
    title: 'Floor plan to photoreal interior',
  },

  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/01-3-brand-world-moodboard.webp',
    createdAt: '2026-08-28',
    description: 'Best for: early creative direction',
    id: 'awesome-nano-banana-prompts:01-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a cohesive 16:9 brand-world moodboard for {{brand_concept}} aimed at {{audience}}.\nUse a disciplined 3×3 grid containing: hero material, environment, product-use moment, palette,\ntypography mood, texture macro, packaging silhouette, human gesture, and lighting reference.\nVisual personality: {{three_adjectives}}. Palette: {{colors}}. Materials: {{materials}}.\n\nThis is an original direction board, not a collage of recognizable campaigns. Do not include\nthird-party logos, celebrity faces, copied packaging, or named living-artist imitation. Use only\nthe text "{{brand_name}} — VISUAL DIRECTION". Make all nine cells feel like one system.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/01-brand-and-advertising.md#3-brand-world-moodboard',
    tags: ['Brand and Advertising', 'early creative direction', '16:9', 'Intermediate'],
    title: 'Brand world moodboard',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/01-4-seasonal-retail-campaign-system.webp',
    createdAt: '2026-08-28',
    description: 'Best for: creating a master visual that crops well',
    id: 'awesome-nano-banana-prompts:01-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a square master campaign visual for {{season_or_event}} featuring {{product_or_service}}.\nThe central composition must survive crops to 4:5, 9:16, and 16:9. Keep the hero subject inside\nthe central 60%, with flexible atmosphere around it. Visual metaphor: {{original_metaphor}};\nlighting: {{lighting}}; palette: {{palette}}; mood: {{mood}}.\n\nRender exactly once: "{{campaign_line}}". No other copy. Avoid generic holiday clip art and\nunlicensed cultural symbols. Preserve product identity and leave clean extension zones on every\nedge. Before finalizing, mentally test all four crops for subject and copy safety.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/01-brand-and-advertising.md#4-seasonal-retail-campaign-system',
    tags: ['Brand and Advertising', 'creating a master visual that crops well', '1:1 master', 'Advanced'],
    title: 'Seasonal retail campaign system',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/01-5-brand-manifesto-poster.webp',
    createdAt: '2026-08-28',
    description: 'Best for: internal launch, event wall, social statement',
    id: 'awesome-nano-banana-prompts:01-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design an original 2:3 typographic manifesto poster for {{organization}}. Build a strong reading\nsequence from one headline, three short principles, and one closing line. Combine expressive type\nscale with {{abstract_material_or_scene}}, while keeping every word legible.\n\nTEXT — RENDER VERBATIM\n"{{headline}}"\n"01 — {{principle_one}}"\n"02 — {{principle_two}}"\n"03 — {{principle_three}}"\n"{{closing_line}}"\n\nDo not paraphrase, repeat, hyphenate, or add filler copy. No third-party marks. Check numbering,\npunctuation, and line order character by character.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/01-brand-and-advertising.md#5-brand-manifesto-poster',
    tags: ['Brand and Advertising', 'internal launch, event wall, social statement', '2:3', 'Intermediate'],
    title: 'Brand manifesto poster',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/02-2-feature-comparison-board.webp',
    createdAt: '2026-08-28',
    description: 'Best for: listing image two or three',
    id: 'awesome-nano-banana-prompts:02-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 feature board for {{product}}. Show one accurate hero render plus three circular\ndetail crops connected with thin callout lines. Features and exact labels:\n1. "{{feature_one}}" 2. "{{feature_two}}" 3. "{{feature_three}}".\nStyle: clean editorial commerce design, {{palette}}, large readable type, restrained iconography.\n\nUse only claims supplied above. Do not invent test results, percentages, certifications, or\ncompetitor comparisons. Keep callouts attached to the correct physical area. Preserve product\ngeometry and label. Verify each label and its leader line.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/02-ecommerce-and-product.md#2-feature-comparison-board',
    tags: ['E-commerce and Product', 'listing image two or three', '4:5', 'Intermediate'],
    title: 'Feature comparison board',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/02-3-exploded-view-product-story.webp',
    createdAt: '2026-08-28',
    description: 'Best for: technical marketing and crowdfunding',
    id: 'awesome-nano-banana-prompts:02-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: exterior product reference. Image 2: verified component diagram.\nCreate a refined 3:4 exploded-view visualization of {{product}} with exactly {{component_count}}\nlayers arranged along one clean axis. Use Image 2 only for verified component order and Image 1\nfor exterior identity. Render the shell slightly translucent where needed; use realistic materials,\nconsistent scale, soft studio light, and precise leader lines.\n\nTEXT — RENDER VERBATIM\n{{approved_component_labels}}\n\nDo not invent internal parts or engineering specifications. Keep labels large and unambiguous.\nIf an internal relationship is not provided, omit it. Verify layer count and label mapping.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/02-ecommerce-and-product.md#3-exploded-view-product-story',
    tags: ['E-commerce and Product', 'technical marketing and crowdfunding', '3:4', 'Advanced'],
    title: 'Exploded-view product story',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/02-4-lifestyle-product-fidelity.webp',
    createdAt: '2026-08-28',
    description: 'Best for: product page storytelling',
    id: 'awesome-nano-banana-prompts:02-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1–3: product identity references. Create a photorealistic 3:2 lifestyle image showing\n{{target_user}} naturally using the exact product while {{action}} in {{environment}}. The product\nmust remain recognizable and unobstructed; match reference materials, color, scale, interface,\nand label placement. Camera: {{camera_direction}}. Light: {{lighting}}. Mood: {{mood}}.\n\nNo staged pointing, floating product, impossible grip, extra fingers, altered branding, duplicate\nproduct, or unrelated props. Keep skin and fabric texture natural. No text overlays.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/02-ecommerce-and-product.md#4-lifestyle-scene-with-product-fidelity',
    tags: ['E-commerce and Product', 'product page storytelling', '3:2', 'Intermediate'],
    title: 'Lifestyle scene with product fidelity',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/02-5-variant-family-lineup.webp',
    createdAt: '2026-08-28',
    description: 'Best for: colorways, flavors, or sizes',
    id: 'awesome-nano-banana-prompts:02-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      "Images 1–{{variant_count}}: one approved reference for each product variant.\nCreate a 16:9 family lineup with exactly {{variant_count}} products in the supplied order.\nMaintain identical scale, camera angle, baseline, label proportions, and lighting while preserving\neach variant's correct color and name. Arrange a gentle rhythm, with the hero variant slightly\nforward but not larger. Background: {{background}}; lighting: clean shared studio setup.\n\nDo not merge labels, exchange colors, duplicate variants, invent flavors, or alter packaging.\nRender no text outside the real package artwork. Count and compare every variant before finalizing.",
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/02-ecommerce-and-product.md#5-variant-family-lineup',
    tags: ['E-commerce and Product', 'colorways, flavors, or sizes', '16:9', 'Advanced'],
    title: 'Variant family lineup',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/03-2-educational-carousel-cover.webp',
    createdAt: '2026-08-28',
    description: 'Best for: Instagram or LinkedIn carousel',
    id: 'awesome-nano-banana-prompts:03-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create slide 1 of a coherent 7-slide 4:5 carousel about {{topic}}. Establish a reusable system:\nbold headline zone, one original visual metaphor, page number position, {{palette}}, and accessible\nhigh-contrast typography. Cover text exactly: "{{headline}}" and "{{supporting_line}}" and "1/7".\n\nKeep 15% safe margins and design for phone viewing. No body paragraphs, invented statistics,\nthird-party logos, or decorative microtext. The visual system must support later slides without\nrequiring a new composition style.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/03-social-and-creator.md#2-educational-carousel-cover-and-system',
    tags: ['Social and Creator Content', 'Instagram or LinkedIn carousel', '4:5', 'Intermediate'],
    title: 'Educational carousel cover and system',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/03-3-podcast-episode-cover.webp',
    createdAt: '2026-08-28',
    description: 'Best for: episode artwork',
    id: 'awesome-nano-banana-prompts:03-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved host portrait. Create a square episode cover for {{podcast_name}}.\nPreserve the host\'s identity, age, skin tone, hair, and expression. Integrate a visual metaphor for\n{{episode_theme}} using {{medium_or_style}}, with a strong small-thumbnail silhouette.\n\nTEXT — RENDER VERBATIM\n"{{podcast_name}}"\n"{{episode_title}}"\n"EP. {{episode_number}}"\n\nDo not invent a guest, sponsor, platform badge, or episode quote. Keep text away from the face and\nverify spelling and number. No imitated celebrity likeness.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/03-social-and-creator.md#3-podcast-episode-cover',
    tags: ['Social and Creator Content', 'episode artwork', '1:1', 'Intermediate'],
    title: 'Podcast episode cover',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/03-4-event-announcement-post.webp',
    createdAt: '2026-08-28',
    description: 'Best for: workshops, meetups, openings',
    id: 'awesome-nano-banana-prompts:03-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a 4:5 event announcement for {{event_type}} using {{visual_concept}}. Make date and title the\nfirst read, then venue and time. Render exactly:\n"{{event_title}}"\n"{{date}} · {{time}}"\n"{{venue}}"\n"{{CTA}}"\n\nUse {{palette}} and {{typography_mood}}. Do not add sponsors, ticket prices, addresses, URLs, or QR\ncodes unless supplied. Check time-zone wording and every numeral. Keep copy inside mobile safe zones.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/03-social-and-creator.md#4-event-announcement-post',
    tags: ['Social and Creator Content', 'workshops, meetups, openings', '4:5', 'Beginner'],
    title: 'Event announcement post',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/03-5-editorial-quote-card.webp',
    createdAt: '2026-08-28',
    description: 'Best for: founder or editorial social content',
    id: 'awesome-nano-banana-prompts:03-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a square editorial quote card with {{background_visual}} and a calm, readable hierarchy.\nRender the quote exactly: "{{verified_quote}}". Attribution exactly: "— {{speaker_and_role}}".\nUse opening and closing quotation marks once, preserve punctuation, and allow generous line spacing.\n\nDo not alter the quote, fabricate credentials, add a portrait unless supplied, or add decorative\nsentences. If attribution is uncertain, replace it with "SOURCE TO VERIFY" rather than guessing.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/03-social-and-creator.md#5-quote-card-without-fake-attribution',
    tags: ['Social and Creator Content', 'founder or editorial social content', '1:1', 'Beginner'],
    title: 'Quote card without fake attribution',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/04-3-historical-timeline.webp',
    createdAt: '2026-08-28',
    description: 'Best for: museums, schools, editorial explainers',
    id: 'awesome-nano-banana-prompts:04-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 21:9 horizontal timeline of {{topic}} from {{start_date}} to {{end_date}} with exactly\n{{event_count}} verified events. Use era-appropriate visual motifs without copying archival art.\nFor each event, render only: date, short title, and one-sentence caption from this approved data:\n{{timeline_data}}.\n\nMaintain chronological spacing and distinguish exact dates from approximate periods. Do not invent\nquotes, portraits, flags, borders, or causal claims. Verify all dates with supplied primary sources.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/04-infographics-and-education.md#3-historical-timeline',
    tags: ['Infographics and Education', 'museums, schools, editorial explainers', '21:9', 'Advanced'],
    title: 'Historical timeline',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/04-4-illustrated-city-guide-map.webp',
    createdAt: '2026-08-28',
    description: 'Best for: tourism and neighborhood guides',
    id: 'awesome-nano-banana-prompts:04-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an illustrated 4:5 orientation map of {{district_or_city}} for {{audience}}. Use a simplified,\nnot-to-navigation street network based on the supplied map reference. Show exactly {{landmarks}}\nwith numbered markers, a legend, north arrow, river/park distinctions, and title "{{map_title}}".\nArt direction: {{original_style_properties}}.\n\nDo not claim routing accuracy, invent businesses, alter landmark names, or use copyrighted mascots.\nLabel the map "ILLUSTRATED GUIDE — NOT FOR NAVIGATION". Verify marker-to-legend mapping.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/04-infographics-and-education.md#4-illustrated-city-guide-map',
    tags: ['Infographics and Education', 'tourism and neighborhood guides', '4:5', 'Advanced'],
    title: 'Illustrated city guide map',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/04-5-recipe-learning-card.webp',
    createdAt: '2026-08-28',
    description: 'Best for: culinary education and localized content',
    id: 'awesome-nano-banana-prompts:04-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 visual recipe card for {{dish}} aimed at {{skill_level}}. Use one ingredient grid and\nexactly {{step_count}} illustrated cooking steps. Render only the approved title, quantities, timing,\ntemperature, allergen note, and steps: {{verified_recipe_data}}. Style: bright natural food\nillustration with realistic ingredient colors and clear utensil shapes.\n\nDo not modify quantities, cooking temperature, allergen information, or food-safety instructions.\nDo not add health claims. Verify units, fractions, step order, and doneness cue.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/04-infographics-and-education.md#5-recipe-learning-card',
    tags: ['Infographics and Education', 'culinary education and localized content', '4:5', 'Intermediate'],
    title: 'Recipe learning card',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/05-3-landing-page-hero-concept.webp',
    createdAt: '2026-08-28',
    description: 'Best for: web design direction',
    id: 'awesome-nano-banana-prompts:05-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a polished 1440-pixel-wide landing-page hero concept for {{product}}. Include navigation,\nheadline, supporting sentence, primary and secondary CTA, one product proof element, and an original\nhero visual. Copy exactly: "{{headline}}", "{{supporting_copy}}", "{{primary_CTA}}", "{{secondary_CTA}}".\nArt direction: {{direction}}. The first viewport must communicate {{single_value}}.\n\nNo fake customer logos, invented metrics, testimonials, pricing, or floating buzzword chips. Use a\nclear responsive structure and leave all text legible. Do not render a browser frame.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/05-ui-app-and-web.md#3-landing-page-hero-concept',
    tags: ['UI, App, and Web Design', 'web design direction', '16:9', 'Intermediate'],
    title: 'Landing-page hero concept',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/05-4-user-flow-wireframe.webp',
    createdAt: '2026-08-28',
    description: 'Best for: planning before visual design',
    id: 'awesome-nano-banana-prompts:05-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a grayscale low-fidelity wireframe showing the {{flow_name}} flow across exactly {{screen_count}}\nmobile screens. Label each screen and connect screens with directional arrows. Use standard blocks,\ninput fields, buttons, error states, and success state. Required steps: {{steps}}.\n\nNo color, photos, polished illustration, logos, shadows, or decorative UI. Do not skip error and empty\nstates. Keep labels short and arrows unambiguous. This is a product-planning diagram, not concept art.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/05-ui-app-and-web.md#4-low-fidelity-user-flow-wireframe',
    tags: ['UI, App, and Web Design', 'planning before visual design', '16:9', 'Beginner'],
    title: 'Low-fidelity user-flow wireframe',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/05-5-design-system-specimen.webp',
    createdAt: '2026-08-28',
    description: 'Best for: visual language alignment',
    id: 'awesome-nano-banana-prompts:05-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 3:2 design-system specimen for {{digital_product}}. Show color tokens, typography scale,\nspacing examples, buttons in four states, form controls, tags, alert banners, one data card, and one\ncompact navigation component. Style attributes: {{attributes}}. Use token names and exact labels from\n{{approved_tokens}}.\n\nNo invented accessibility rating, random component variants, gradients unless specified, or unreadable\nmicrotext. Maintain consistent radii, spacing, type scale, and state semantics across all components.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/05-ui-app-and-web.md#5-mini-design-system-specimen',
    tags: ['UI, App, and Web Design', 'visual language alignment', '3:2', 'Advanced'],
    title: 'Mini design-system specimen',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/06-3-film-storyboard-contact-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: previsualization',
    id: 'awesome-nano-banana-prompts:06-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a black-and-white storyboard contact sheet for {{scene}} with exactly six numbered frames:\n1 establishing wide, 2 medium action, 3 insert detail, 4 reaction close-up, 5 moving point-of-view,\n6 final reveal. Add simple arrows only for camera or subject movement. Under each frame render shot number,\nshot size, and {{short_action_note}}.\n\nMaintain screen direction, character wardrobe, prop continuity, time of day, and location geometry. No polished\ncolor art, extra frames, dialogue, or impossible camera placement.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/06-characters-and-storytelling.md#3-film-storyboard-contact-sheet',
    tags: ['Characters, Comics, and Storyboards', 'previsualization', '16:9', 'Advanced'],
    title: 'Film storyboard contact sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/06-4-childrens-book-spread.webp',
    createdAt: '2026-08-28',
    description: 'Best for: picture-book development',
    id: 'awesome-nano-banana-prompts:06-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–2: approved character and environment anchors. Create a 2:1 double-page spread where {{character}}\n{{action}} in {{setting}}. Preserve anchor identity and visual language. Compose a clear left-to-right story\npath with the gutter kept free of faces, hands, and essential objects. Leave a calm text area of {{location}}\nfor later typesetting. Mood: {{mood}}; medium: {{medium_properties}}.\n\nNo text, page numbers, existing storybook characters, or extra plot events. Keep the action age-appropriate\nand the character design unchanged.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/06-characters-and-storytelling.md#4-childrens-book-double-page-spread',
    tags: ['Characters, Comics, and Storyboards', 'picture-book development', '2:1', 'Advanced'],
    title: "Children's-book double-page spread",
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/06-5-character-scene-continuation.webp',
    createdAt: '2026-08-28',
    description: 'Best for: episodic illustration',
    id: 'awesome-nano-banana-prompts:06-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved character anchor. Image 2: most recent approved scene for continuity.\nContinue the story in a new 3:2 scene: {{new_action_and_location}}. Preserve facial structure, apparent age,\nhair, proportions, outfit construction, signature prop, palette, and medium. Carry forward only these continuity\ndetails from Image 2: {{continuity_details}}. Change camera to {{new_camera}} and mood to {{new_mood}}.\n\nDo not redesign the character, repeat the previous composition, add text, or introduce unrequested characters.\nVerify identity against Image 1, not against any imperfect intermediate frame.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/06-characters-and-storytelling.md#5-character-consistent-scene-continuation',
    tags: ['Characters, Comics, and Storyboards', 'episodic illustration', '3:2', 'Advanced'],
    title: 'Character-consistent scene continuation',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/07-2-food-editorial-hero.webp',
    createdAt: '2026-08-28',
    description: 'Best for: restaurant and recipe stories',
    id: 'awesome-nano-banana-prompts:07-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 3:2 editorial food photograph of {{dish}} just after {{freshness_moment}}. Show authentic portion size,\ningredient texture, steam or condensation only where physically plausible, and tableware appropriate to\n{{setting}}. Camera: {{angle}}; light: soft directional window light; palette: {{palette}}.\n\nNo plastic-looking food, excessive garnish, floating ingredients, fake steam, brand marks, hands unless requested,\nor unrelated table clutter. Maintain natural edible color and credible shadows.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/07-photography-and-editorial.md#2-food-editorial-hero',
    tags: ['Photography and Editorial', 'restaurant and recipe stories', '3:2', 'Intermediate'],
    title: 'Food editorial hero',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/07-3-architecture-feature-image.webp',
    createdAt: '2026-08-28',
    description: 'Best for: design publication',
    id: 'awesome-nano-banana-prompts:07-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a photorealistic 16:9 architectural image of {{building_or_room}} emphasizing {{design_intent}}.\nViewpoint: {{viewpoint}} with straight verticals and credible wide-angle perspective. Time: {{time}}.\nMaterials must show accurate roughness, reflection, joinery, and scale. Include {{human_presence}} only as a scale cue.\n\nNo warped walls, impossible cantilevers, repeated furniture, mixed light directions, oversized rooms, fake signage,\nor decorative additions not in the brief. Keep circulation and structure plausible.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/07-photography-and-editorial.md#3-architecture-feature-image',
    tags: ['Photography and Editorial', 'design publication', '16:9', 'Advanced'],
    title: 'Architecture feature image',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/07-4-travel-sense-of-place.webp',
    createdAt: '2026-08-28',
    description: 'Best for: destination editorial',
    id: 'awesome-nano-banana-prompts:07-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a candid 3:2 travel photograph in {{specific_place}} during {{time_or_weather}}. Focus on {{everyday_subject}}\nrather than a postcard landmark. Show locally plausible architecture, clothing, transport, vegetation, and street\ndetails. Camera: {{camera}}; color: natural; mood: {{mood}}.\n\nIf grounding is available, verify distinctive place details. Avoid exoticizing people, staged costumes, invented\nsignage, mixed geographic clichés, tourist-brand logos, or text overlays.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/07-photography-and-editorial.md#4-travel-sense-of-place-photograph',
    tags: ['Photography and Editorial', 'destination editorial', '3:2', 'Intermediate'],
    title: 'Travel sense-of-place photograph',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/07-5-magazine-opener-spread.webp',
    createdAt: '2026-08-28',
    description: 'Best for: editorial concepting',
    id: 'awesome-nano-banana-prompts:07-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 2:1 magazine opening spread for an article about {{topic}}. Use one strong rights-safe hero image across\n{{page_behavior}}, with the gutter protected. Add a restrained title block and deck on {{text_page_or_area}}.\n\nTEXT — RENDER VERBATIM\n"{{headline}}"\n"{{deck}}"\n"BY {{author_name}}"\n\nNo body copy, issue number, barcode, fake publication logo, invented photo credit, or decorative filler text.\nKeep all faces and critical details away from the gutter; verify exact copy.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/07-photography-and-editorial.md#5-magazine-opener-spread',
    tags: ['Photography and Editorial', 'editorial concepting', '2:1', 'Advanced'],
    title: 'Magazine opener spread',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/08-2-localized-menu.webp',
    createdAt: '2026-08-28',
    description: 'Best for: international campaigns',
    id: 'awesome-nano-banana-prompts:08-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved source menu. Create a {{target_locale}} edition. Replace only text in the approved mapping:\n{{source_to_target_copy}}. Preserve brand name, item order, prices, currency, numbers, dietary icons, logo placement,\ngrid, illustrations, colors, hierarchy, margins, and paper texture. Use natural locale-appropriate line breaks and\nadjust font size minimally only to prevent overflow.\n\nDo not invent dishes, translations, prices, claims, or extra labels. Compare every protected string and price against\nImage 1, then proofread every target-language character.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/08-editing-and-localization.md#2-localized-menu-without-layout-drift',
    tags: ['Editing, Localization, and Compositing', 'international campaigns', 'match input', 'Advanced'],
    title: 'Localized menu without layout drift',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/08-3-day-to-night-relighting.webp',
    createdAt: '2026-08-28',
    description: 'Best for: architecture, travel, and campaign variations',
    id: 'awesome-nano-banana-prompts:08-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: daytime base image. Transform only time of day and physically dependent illumination to {{night_condition}}.\nPreserve camera, geometry, people, faces, pose, clothing, signage, object count, weather, and composition. Replace sun\nlight with motivated moon, street, window, and practical light. Recalculate shadows, reflections, sky exposure, and\ncolor temperature coherently.\n\nDo not add neon signs, stars, fog, rain, vehicles, or lit windows unless physically implied or requested. Keep all\nexisting text unchanged and legible.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/08-editing-and-localization.md#3-day-to-night-relighting',
    tags: [
      'Editing, Localization, and Compositing',
      'architecture, travel, and campaign variations',
      'match input',
      'Advanced',
    ],
    title: 'Day-to-night relighting',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/08-4-clean-background-extraction.webp',
    createdAt: '2026-08-28',
    description: 'Best for: catalogs and design systems',
    id: 'awesome-nano-banana-prompts:08-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: extraction target. Isolate {{subject}} onto a genuinely transparent background. Preserve exact shape, product\nlabel, colors, material highlights, semi-transparent areas, hair/fur fibers, and fine edges. Remove all background,\nfloor, props, cast shadow, and reflected environment unless {{shadow_requirement}}.\n\nNo white matte, checkerboard pattern, halo, clipped edge, extra outline, color spill, retouching, relighting, or label\nredesign. Return a clean alpha channel and verify difficult edges at high zoom.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/08-editing-and-localization.md#4-clean-background-extraction',
    tags: ['Editing, Localization, and Compositing', 'catalogs and design systems', 'match input', 'Intermediate'],
    title: 'Clean background extraction',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/08-5-multi-reference-campaign-composite.webp',
    createdAt: '2026-08-28',
    description: 'Best for: complex ads and group scenes',
    id: 'awesome-nano-banana-prompts:08-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: base location and camera. Images 2–{{n}}: people/product identity references. Image {{style_index}}: lighting\nreference only. Create one cohesive 16:9 campaign scene where {{placement_and_action}}. Preserve each identity or\nproduct independently; do not merge features. Match scale, perspective, eye line, focus, color temperature, grain,\ncontact shadow, reflection, and environmental bounce.\n\nKeep base architecture and framing unchanged. Do not duplicate subjects, exchange clothing or labels, add props,\nor transfer objects from the lighting reference. Count every subject and compare each one with its source.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/08-editing-and-localization.md#5-multi-reference-campaign-composite',
    tags: ['Editing, Localization, and Compositing', 'complex ads and group scenes', '16:9', 'Advanced'],
    title: 'Multi-reference campaign composite',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/09-1-investor-pitch-slide.webp',
    createdAt: '2026-08-28',
    description: 'Best for: narrative prototyping',
    id: 'awesome-nano-banana-prompts:09-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create one 16:9 investor slide titled "{{slide_title}}". The single takeaway is {{takeaway}}.\nUse one primary chart and no more than three supporting callouts. Render only this verified data:\n{{data_with_units_dates_and_sources}}. Style: quiet, confident, boardroom-ready, large labels, strong hierarchy.\n\nDo not invent market size, growth rates, sources, logos, customers, or forecasts. Use honest axes and distinguish\nactuals from estimates. Include source text exactly: "{{source_line}}". Verify every value and unit.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/09-business-and-productivity.md#1-investor-pitch-slide',
    tags: ['Business and Productivity', 'narrative prototyping', '16:9', 'Advanced'],
    title: 'Investor pitch slide',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/09-2-executive-visual-summary.webp',
    createdAt: '2026-08-28',
    description: 'Best for: reports and decision memos',
    id: 'awesome-nano-banana-prompts:09-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a 3:4 executive summary titled "{{title}}" with four sections: CURRENT STATE, SIGNALS, DECISION, NEXT 30 DAYS.\nUse the approved content only: {{content}}. Combine short text, one mini-chart, and a four-item action list. Create a\nclear top-to-bottom reading path and accessible color coding.\n\nNo invented metrics, decorative stock imagery, fake citations, jargon, or body text below readable size. Preserve\nqualifiers such as "estimated" and "pending". Check dates, owners, and numbers.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/09-business-and-productivity.md#2-executive-one-page-visual-summary',
    tags: ['Business and Productivity', 'reports and decision memos', '3:4', 'Intermediate'],
    title: 'Executive one-page visual summary',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/09-3-operational-workflow-diagram.webp',
    createdAt: '2026-08-28',
    description: 'Best for: process alignment',
    id: 'awesome-nano-banana-prompts:09-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 swimlane diagram for {{workflow}} with lanes {{lane_names}}. Show exactly these stages and decision\npoints: {{verified_steps}}. Use standard process shapes, one direction of flow, clear handoffs, and exception paths.\nTitle: "{{title}}". Color by ownership, not decoration.\n\nDo not change step names, owners, or sequence. Do not hide loops or errors. Keep connectors from crossing labels and\nverify that every decision has labelled outcomes.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/09-business-and-productivity.md#3-operational-workflow-diagram',
    tags: ['Business and Productivity', 'process alignment', '16:9', 'Intermediate'],
    title: 'Operational workflow diagram',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/09-4-product-roadmap.webp',
    createdAt: '2026-08-28',
    description: 'Best for: planning communication',
    id: 'awesome-nano-banana-prompts:09-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 outcome-based roadmap for {{product}} covering {{time_horizon}}. Use rows for {{workstreams}} and columns\nfor {{periods}}. Place only these approved initiatives: {{initiatives_with_status}}. Visually distinguish COMMITTED,\nPLANNED, and EXPLORING and include a compact legend.\n\nDo not invent dates, dependencies, owners, or delivery promises. Preserve uncertainty wording. Avoid Gantt-like false\nprecision unless exact dates are supplied. Verify every initiative appears once.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/09-business-and-productivity.md#4-product-roadmap',
    tags: ['Business and Productivity', 'planning communication', '16:9', 'Intermediate'],
    title: 'Product roadmap',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/09-5-report-cover-system.webp',
    createdAt: '2026-08-28',
    description: 'Best for: whitepapers and research',
    id: 'awesome-nano-banana-prompts:09-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a restrained report cover for {{organization}}. Topic: {{topic}}. Use an original abstract visual metaphor\nbased on {{data_material_or_process}}, with {{palette}} and generous whitespace. Render exactly:\n"{{report_title}}" "{{subtitle}}" "{{month_year}}" "{{organization_name}}".\n\nNo fake seal, barcode, issue number, data visualization, partner logo, or extra author unless supplied. Keep copy clear\nat thumbnail size and leave safe margins for print trimming.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/09-business-and-productivity.md#5-report-cover-system',
    tags: ['Business and Productivity', 'whitepapers and research', 'A4 portrait / 3:4 concept', 'Beginner'],
    title: 'Report cover system',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/10-2-fitness-studio-class-campaign.webp',
    createdAt: '2026-08-28',
    description: 'Best for: gyms and independent trainers',
    id: 'awesome-nano-banana-prompts:10-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 9:16 story poster for {{class_name}} at {{studio_name}}. Show a diverse, rights-safe small group performing\n{{realistic_movement}} with correct form in {{studio_environment}}. Natural athletic bodies, real sweat and fabric,\nenergetic but credible light. Render exactly: "{{class_name}}" "{{day_time}}" "{{level}}" "{{booking_CTA}}".\n\nNo body transformation claims, calories, medical benefits, fake urgency, logos, or impossible poses. Keep text clear of\nfaces and story UI zones. Verify schedule and level.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/10-local-business-campaigns.md#2-fitness-studio-class-campaign',
    tags: ['Local Business Campaign', 'gyms and independent trainers', '9:16', 'Intermediate'],
    title: 'Fitness studio class campaign',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/10-3-real-estate-listing-hero.webp',
    createdAt: '2026-08-28',
    description: 'Best for: property marketing',
    id: 'awesome-nano-banana-prompts:10-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1–{{n}}: current property references. Create a photorealistic 3:2 listing hero from the best supplied viewpoint.\nPreserve architecture, room dimensions, window positions, finishes, view, and permanent fixtures. Improve only exposure,\nwhite balance, straight verticals, and removable clutter as explicitly listed: {{approved_removals}}.\n\nDo not enlarge rooms, replace materials, alter the view, add furniture, remove structural elements, create sunlight that\nwas not present, or add text. The result must remain a truthful representation of the property.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/10-local-business-campaigns.md#3-real-estate-listing-hero',
    tags: ['Local Business Campaign', 'property marketing', '3:2', 'Advanced'],
    title: 'Real-estate listing hero',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/10-4-neighborhood-retail-opening.webp',
    createdAt: '2026-08-28',
    description: 'Best for: shops, salons, studios',
    id: 'awesome-nano-banana-prompts:10-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a welcoming 4:5 grand-opening post for {{business_name}}, a {{business_type}} in {{neighborhood}}. Combine one\nauthentic storefront/detail image with an original graphic motif derived from {{local_non_protected_detail}}.\nRender exactly: "NOW OPEN" "{{business_name}}" "{{opening_hours}}" "{{street_or_area}}".\n\nNo fake reviews, discounts, maps, logos, QR codes, phone numbers, or landmarks unless supplied. Avoid cultural clichés.\nVerify address wording and hours character by character.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/10-local-business-campaigns.md#4-neighborhood-retail-opening',
    tags: ['Local Business Campaign', 'shops, salons, studios', '4:5', 'Beginner'],
    title: 'Neighborhood retail opening',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/10-5-regional-tourism-mini-guide.webp',
    createdAt: '2026-08-28',
    description: 'Best for: visitor bureaus and hosts',
    id: 'awesome-nano-banana-prompts:10-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 illustrated mini-guide titled "{{region}} IN ONE DAY" for {{audience}}. Show a morning, afternoon, and\nevening sequence using only these verified places and activities: {{itinerary}}. Use geographically and seasonally\nplausible architecture, landscape, transport, clothing, and food. Add times only when verified.\n\nIf grounding is enabled, check official opening information current to {{date}}. Do not promise availability, invent\nbusinesses, compress impossible travel times, or add copyrighted mascots. Include "CHECK HOURS BEFORE VISITING".',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/10-local-business-campaigns.md#5-regional-tourism-mini-guide',
    tags: ['Local Business Campaign', 'visitor bureaus and hosts', '4:5', 'Advanced'],
    title: 'Regional tourism mini-guide',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/11-1-isometric-city-vignette.webp',
    createdAt: '2026-08-28',
    description: 'Best for: explainers and destination concepts',
    id: 'awesome-nano-banana-prompts:11-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a clean 45-degree isometric vignette of {{place_or_system}} showing {{key_elements}}. Use believable scale,\nconsistent orthographic-like projection, soft PBR materials, gentle ambient occlusion, and one clear focal point.\nBackground: {{simple_background}}; palette: {{palette}}; atmosphere: {{weather_or_time}}.\n\nNo miniature tilt-shift blur, mixed vanishing points, floating buildings, copied landmarks beyond factual depiction,\ntext, logos, or unnecessary border. Keep all shadows consistent with one light source.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/11-style-lab.md#1-isometric-city-vignette',
    tags: ['Style Lab', 'explainers and destination concepts', '1:1', 'Intermediate'],
    title: 'Isometric city vignette',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/11-2-tactile-clay-illustration.webp',
    createdAt: '2026-08-28',
    description: 'Best for: friendly education and onboarding',
    id: 'awesome-nano-banana-prompts:11-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a tactile clay illustration of {{subject_and_action}}. Forms are hand-shaped with subtle fingerprints, rounded\nedges, matte clay roughness, simple expressive faces, and a physical tabletop set. Use {{palette}} and soft large-source\nstudio light. Composition: {{composition}}.\n\nNo glossy plastic, floating parts, hyper-detailed skin, text, logos, or extra characters. Preserve simple readable\nsilhouettes and physically plausible contact between every object.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/11-style-lab.md#2-tactile-clay-illustration',
    tags: ['Style Lab', 'friendly education and onboarding', '4:5', 'Beginner'],
    title: 'Tactile clay illustration',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/11-3-watercolor-field-note.webp',
    createdAt: '2026-08-28',
    description: 'Best for: nature, food, and travel illustration',
    id: 'awesome-nano-banana-prompts:11-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original watercolor-and-ink field-note illustration of {{subject}} on warm cotton paper. Use transparent\nlayered washes, restrained ink contours, pigment blooms, dry-brush texture, and incomplete edges. Arrange one main\nstudy with {{detail_count}} smaller detail studies and the supplied factual labels: {{labels}}.\n\nNo imitation of a named artist, copied plate layout, false scientific detail, decorative cursive text, or watermark.\nKeep labels legible and leader lines accurate.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/11-style-lab.md#3-contemporary-watercolor-field-note',
    tags: ['Style Lab', 'nature, food, and travel illustration', '3:2', 'Intermediate'],
    title: 'Contemporary watercolor field note',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/11-4-layered-paper-cut-scene.webp',
    createdAt: '2026-08-28',
    description: "Best for: campaigns and children's visuals",
    id: 'awesome-nano-banana-prompts:11-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a handcrafted layered paper-cut scene of {{scene}} using 7–9 visible paper depth planes. Show fibrous cut edges,\nsubtle bends, real cast shadows between layers, restrained {{palette}}, and a clear foreground-to-background rhythm.\nLight from {{direction}}. Leave {{negative_space_location}} open for later layout.\n\nNo text, logos, plastic surfaces, impossible thin unsupported pieces, or flat vector appearance. Keep every element\nconstructible from cut paper.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/11-style-lab.md#4-layered-paper-cut-scene',
    tags: ['Style Lab', "campaigns and children's visuals", '16:9', 'Intermediate'],
    title: 'Layered paper-cut scene',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/12-2-controlled-interior-renovation.webp',
    createdAt: '2026-08-28',
    description: 'Best for: before-and-after concepts',
    id: 'awesome-nano-banana-prompts:12-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: existing room photo. Renovate only {{approved_scope}} using {{materials_and_colors}}.\nPreserve camera position, room geometry, windows, doors, ceiling, floor area, permanent structure,\nand every object listed in {{protected_elements}}. Replace {{elements_to_replace}} and remove only\n{{approved_removals}}. Match perspective, daylight direction, contact shadows, and color bounce.\n\nDo not change the view outside, make the room larger, raise the ceiling, add structural openings,\nor conceal defects that remain in scope. Return a truthful design visualization, not a listing photo.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/12-architecture-interiors-and-real-estate.md#2-controlled-interior-renovation',
    tags: ['Architecture, Interiors, and Real Estate', 'before-and-after concepts', 'match input', 'Advanced'],
    title: 'Controlled interior renovation',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/12-3-retail-spatial-concept.webp',
    createdAt: '2026-08-28',
    description: 'Best for: pop-ups and small shops',
    id: 'awesome-nano-banana-prompts:12-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 3:2 spatial concept for a {{store_type}} occupying {{approximate_area}}. Customer journey:\n{{entry_to_checkout_sequence}}. Include entrance threshold, hero display, browsing zone, accessible\ncirculation, checkout, storage access, and one memorable brand installation based on {{concept}}.\nMaterials: {{materials}}; lighting: layered ambient, accent, and task lighting; viewpoint: wide eye-level.\n\nNo impossible aisle widths, blocked exits, floating shelves, fake customer logos, unreadable signage,\nor excessive decorative stock. Keep fixture construction and product scale plausible.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/12-architecture-interiors-and-real-estate.md#3-retail-spatial-concept',
    tags: ['Architecture, Interiors, and Real Estate', 'pop-ups and small shops', '3:2', 'Intermediate'],
    title: 'Retail spatial concept',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/12-4-architectural-axonometric-explainer.webp',
    createdAt: '2026-08-28',
    description: 'Best for: design presentations',
    id: 'awesome-nano-banana-prompts:12-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: verified architectural model or drawings. Create a clean 4:5 exploded axonometric explaining\n{{building_system}}. Separate exactly {{layer_count}} layers along one vertical axis and label only:\n{{approved_labels}}. Use consistent projection, restrained material colors, thin leader lines, a scale\nfigure, and a compact legend. Show relationships without implying construction details not provided.\n\nDo not invent structure, services, dimensions, codes, or assembly order. Verify layer count, alignment,\nand every label endpoint against Image 1.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/12-architecture-interiors-and-real-estate.md#4-architectural-axonometric-explainer',
    tags: ['Architecture, Interiors, and Real Estate', 'design presentations', '4:5', 'Advanced'],
    title: 'Architectural axonometric explainer',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/12-5-facade-material-lighting-study.webp',
    createdAt: '2026-08-28',
    description: 'Best for: architecture and hospitality concepts',
    id: 'awesome-nano-banana-prompts:12-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved facade geometry. Create a 16:9 dusk material-and-lighting study. Preserve massing,\nopenings, signage zones, roofline, neighboring context, camera, and landscape. Apply {{facade_materials}}\nwith realistic joints, weathering, roughness, and reflections. Illuminate only the specified fixtures:\n{{fixture_plan}}. Maintain dark-sky-conscious, physically motivated light distribution.\n\nDo not add floors, windows, signs, vehicles, crowds, dramatic fog, or impossible uplighting. Keep all\nexisting legal and accessibility elements visible.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/12-architecture-interiors-and-real-estate.md#5-facade-material-and-lighting-study',
    tags: ['Architecture, Interiors, and Real Estate', 'architecture and hospitality concepts', '16:9', 'Advanced'],
    title: 'Facade material and lighting study',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/13-1-fashion-lookbook-contact-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: collection presentation',
    id: 'awesome-nano-banana-prompts:13-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      "Images 1–{{look_count}}: approved garments. Image {{model_index}}: consenting model identity reference.\nCreate a clean 3:2 lookbook contact sheet with exactly {{look_count}} full-body looks. Preserve the model's\nidentity, body proportions, skin tone, hair, and apparent age. Preserve each garment's cut, length, closure,\nprint placement, fabric drape, and color. Use one neutral studio, camera height, lens behavior, and lighting.\n\nDo not exchange garments, alter body shape, add accessories, duplicate looks, crop feet, or invent labels.\nNumber looks exactly {{approved_numbers}} and compare every outfit with its reference.",
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/13-fashion-beauty-and-lookbooks.md#1-consistent-fashion-lookbook-contact-sheet',
    tags: ['Fashion, Beauty, and Lookbook', 'collection presentation', '3:2', 'Advanced'],
    title: 'Consistent fashion lookbook contact sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/13-2-beauty-texture-macro-campaign.webp',
    createdAt: '2026-08-28',
    description: 'Best for: skincare and cosmetics art direction',
    id: 'awesome-nano-banana-prompts:13-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a photorealistic 4:5 beauty macro featuring {{subject_description}} and {{product_or_texture}}.\nFocus on real skin texture, pores, fine hair, natural lip and eye detail, and physically plausible product\nsheen. Camera: close macro with a narrow but intentional focus plane. Light: {{soft_or_directional_setup}}.\nPalette: {{palette}}. Leave {{copy_safe_area}} clear for later layout.\n\nNo skin smoothing, face reshaping, exaggerated wetness, floating droplets, impossible lashes, third-party\nlogos, medical claims, text, or identity imitation. Keep retouching editorial and human.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/13-fashion-beauty-and-lookbooks.md#2-beauty-texture-macro-campaign',
    tags: ['Fashion, Beauty, and Lookbook', 'skincare and cosmetics art direction', '4:5', 'Intermediate'],
    title: 'Beauty texture macro campaign',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/13-3-identity-preserving-virtual-try-on.webp',
    createdAt: '2026-08-28',
    description: 'Best for: wardrobe previews',
    id: 'awesome-nano-banana-prompts:13-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: consenting person and base pose. Images 2–{{n}}: garment references.\nReplace only the clothing in Image 1 with the supplied garments. Preserve face, body shape, skin tone,\nhair, expression, hands, pose, camera, background, and lighting. Reconstruct believable fabric tension,\nfolds, seams, closures, overlap, and contact shadows for the existing pose. Keep garment color and pattern exact.\n\nDo not change weight, age, body proportions, hairstyle, makeup, or accessories. Do not combine garment\ndetails or expose areas not shown in the original. Verify identity and construction against all inputs.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/13-fashion-beauty-and-lookbooks.md#3-identity-preserving-virtual-try-on',
    tags: ['Fashion, Beauty, and Lookbook', 'wardrobe previews', 'match person reference', 'Advanced'],
    title: 'Identity-preserving virtual try-on',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/13-4-colorway-fabric-line-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: merchandising and design review',
    id: 'awesome-nano-banana-prompts:13-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a front-facing 16:9 line sheet for {{garment_or_accessory}} with exactly {{variant_count}} approved\ncolorways. Show one consistent product view per variant, aligned to the same baseline and scale. Add a fabric\nmacro swatch and render only the approved variant name and code: {{variant_data}}. Background: neutral white;\nlighting: even catalog light; layout: clean grid with generous margins.\n\nDo not invent colors, prices, sizes, fibers, care symbols, sustainability claims, or decorative copy.\nVerify each name, code, swatch, and product color mapping.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/13-fashion-beauty-and-lookbooks.md#4-colorway-and-fabric-line-sheet',
    tags: ['Fashion, Beauty, and Lookbook', 'merchandising and design review', '16:9', 'Advanced'],
    title: 'Colorway and fabric line sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/13-5-multi-person-runway-editorial.webp',
    createdAt: '2026-08-28',
    description: 'Best for: campaign concepts with several identities',
    id: 'awesome-nano-banana-prompts:13-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      "Images 1–{{person_count}}: consenting identity and outfit references. Create a cinematic 16:9 runway editorial\nin {{original_environment}}. Preserve each person's independent identity, age, skin tone, hair, body proportions,\nand exact outfit construction. Place subjects at varied depths with natural gait and sight lines. Match scale,\nperspective, motion blur, color temperature, contact shadows, and grain across the entire scene.\n\nDo not merge faces, exchange clothing, duplicate people, add accessories, change body shape, or imitate a named\nfashion campaign. Count every person and verify each against the corresponding input.",
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/13-fashion-beauty-and-lookbooks.md#5-multi-person-runway-editorial',
    tags: ['Fashion, Beauty, and Lookbook', 'campaign concepts with several identities', '16:9', 'Advanced'],
    title: 'Multi-person runway editorial',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/14-1-weather-specific-landscape-editorial.webp',
    createdAt: '2026-08-28',
    description: 'Best for: destination and environmental stories',
    id: 'awesome-nano-banana-prompts:14-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a photorealistic 3:2 landscape of {{specific_location_or_biome}} during {{season_and_weather}}.\nForeground: {{foreground_anchor}}; middle distance: {{human_scale_or_path}}; background: {{landform}}.\nUse meteorologically plausible clouds, visibility, vegetation condition, water behavior, and light.\nCamera: {{viewpoint}} with natural dynamic range and restrained color grade.\n\nIf a real place is named, verify distinctive geography when grounding is available. Do not combine unrelated\nlandmarks, exaggerate scale, add fantasy light, introduce people or buildings, or over-saturate the scene.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/14-travel-landscapes-and-vehicles.md#1-weather-specific-landscape-editorial',
    tags: ['Travel, Landscapes, and Vehicle', 'destination and environmental stories', '3:2', 'Intermediate'],
    title: 'Weather-specific landscape editorial',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/14-2-responsible-road-trip-campaign.webp',
    createdAt: '2026-08-28',
    description: 'Best for: tourism and mobility marketing',
    id: 'awesome-nano-banana-prompts:14-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 road-trip campaign image showing {{vehicle_type}} safely traveling through {{landscape}}.\nShow correct lane position, road markings, guardrails, weather response, tire contact, and scale. Composition:\nwide environmental view with the vehicle occupying less than 20% of the frame and open copy space at {{side}}.\nMood: {{mood}}; time: {{time}}; camera: realistic roadside tracking perspective.\n\nNo identifiable third-party badge, dangerous driving, road obstruction, impossible dust, fake location signs,\ntext, or environmental damage. Keep occupants unidentifiable unless rights-cleared references are supplied.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/14-travel-landscapes-and-vehicles.md#2-responsible-road-trip-campaign',
    tags: ['Travel, Landscapes, and Vehicle', 'tourism and mobility marketing', '16:9', 'Intermediate'],
    title: 'Responsible road-trip campaign',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/14-3-vehicle-orthographic-concept-board.webp',
    createdAt: '2026-08-28',
    description: 'Best for: original mobility concepts',
    id: 'awesome-nano-banana-prompts:14-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original 16:9 design board for {{vehicle_concept}} showing consistent front, rear, side, and three-quarter\nviews plus one interior detail. Design intent: {{intent}}. Package constraints: {{wheelbase_seating_cargo_or_use}}.\nMaterials and finish: {{materials}}. Use neutral studio lighting, aligned baselines, and identical design language\nacross every view. Render only these labels: {{approved_labels}}.\n\nNo existing manufacturer design, badge, impossible wheel steering, inconsistent doors, changing light signatures,\nor invented performance specifications. Verify geometry continuity across all views.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/14-travel-landscapes-and-vehicles.md#3-vehicle-orthographic-concept-board',
    tags: ['Travel, Landscapes, and Vehicle', 'original mobility concepts', '16:9', 'Advanced'],
    title: 'Vehicle orthographic concept board',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/14-4-aerial-geographic-explainer.webp',
    createdAt: '2026-08-28',
    description: 'Best for: visitor orientation and environmental education',
    id: 'awesome-nano-banana-prompts:14-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an oblique aerial explainer of {{area}} using the supplied verified map and terrain references. Show only\n{{landmarks_or_zones}}, with numbered markers and a legend. Preserve relative orientation, shoreline, major routes,\nelevation logic, and north direction. Style: realistic terrain with simplified readable overlays.\n\nRender "ILLUSTRATED OVERVIEW — NOT FOR NAVIGATION". Do not invent roads, trails, boundaries, businesses, travel\ntimes, or emergency routes. Verify every marker and label against the supplied data.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/14-travel-landscapes-and-vehicles.md#4-aerial-geographic-explainer',
    tags: ['Travel, Landscapes, and Vehicle', 'visitor orientation and environmental education', '16:9', 'Advanced'],
    title: 'Aerial geographic explainer',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/14-5-public-transit-destination-poster.webp',
    createdAt: '2026-08-28',
    description: 'Best for: city campaigns and events',
    id: 'awesome-nano-banana-prompts:14-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design an original 2:3 destination poster encouraging travel to {{destination}} by {{transit_mode}}. Use a bold,\nrights-safe graphic composition based on {{local_visual_motif}}, with a clearly recognizable but factually accurate\nvehicle silhouette. Render exactly: "{{headline}}" "{{route_or_station}}" "{{date_or_service_note}}".\n\nNo operator logo unless supplied, no fake timetable, fare, route claim, landmark mash-up, vintage-poster copy,\nor extra text. Verify destination spelling, route notation, and vehicle details.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/14-travel-landscapes-and-vehicles.md#5-public-transit-destination-poster',
    tags: ['Travel, Landscapes, and Vehicle', 'city campaigns and events', '2:3', 'Intermediate'],
    title: 'Public-transit destination poster',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/15-1-wildlife-field-guide-plate.webp',
    createdAt: '2026-08-28',
    description: 'Best for: education and conservation',
    id: 'awesome-nano-banana-prompts:15-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a scientifically responsible 3:2 field-guide plate for {{species_common_and_scientific_name}}.\nShow one adult in a natural resting pose, a smaller habitat vignette, a scale silhouette, and exactly\n{{detail_count}} labelled anatomical or identification details: {{verified_details}}. Medium: precise\nnatural-history illustration on warm neutral paper with restrained color and clear leader lines.\n\nIf grounding is available, verify markings and range with authoritative conservation sources. Do not invent\nsexual dimorphism, range, behavior, or anatomy. No decorative script, logo, watermark, or unrelated species.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/15-animals-creatures-and-botanicals.md#1-wildlife-field-guide-plate',
    tags: ['Animals, Creatures, and Botanical', 'education and conservation', '3:2', 'Advanced'],
    title: 'Wildlife field-guide plate',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/15-2-identity-preserving-pet-portrait.webp',
    createdAt: '2026-08-28',
    description: 'Best for: personal commissions',
    id: 'awesome-nano-banana-prompts:15-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–3: the same pet from different views, supplied with owner permission. Create a photorealistic 4:5\nportrait in {{simple_environment}}. Preserve species, breed traits, face shape, eye color, ear position,\nmuzzle markings, coat pattern, scars, age cues, body proportions, and collar exactly. Pose: {{natural_pose}};\ncamera: eye level with the animal; light: soft {{lighting}}.\n\nDo not humanize expression, change markings, enlarge eyes, add costume, remove age signs, duplicate limbs,\nor add text. Compare the final face and coat map against all references.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/15-animals-creatures-and-botanicals.md#2-identity-preserving-pet-portrait',
    tags: ['Animals, Creatures, and Botanical', 'personal commissions', '4:5', 'Intermediate'],
    title: 'Identity-preserving pet portrait',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/15-3-original-creature-anatomy-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: games and worldbuilding',
    id: 'awesome-nano-banana-prompts:15-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original biological concept sheet for {{creature_role_and_habitat}}. Show a full-body neutral view,\nskeletal logic silhouette, locomotion sequence, feeding apparatus detail, footprint, scale beside a human,\nand three adaptations tied to {{environmental_pressures}}. Design must obey a consistent number of limbs,\njoints, mass distribution, breathing strategy, and surface material.\n\nNo existing franchise creature, random spikes, decorative anatomy, inconsistent limb count, or impossible center\nof mass. Render only these labels: {{approved_labels}} and verify them across every view.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/15-animals-creatures-and-botanicals.md#3-original-creature-anatomy-sheet',
    tags: ['Animals, Creatures, and Botanical', 'games and worldbuilding', '16:9', 'Advanced'],
    title: 'Original creature anatomy sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/15-4-botanical-identification-plate.webp',
    createdAt: '2026-08-28',
    description: 'Best for: horticulture and education',
    id: 'awesome-nano-banana-prompts:15-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 botanical plate for {{plant_common_and_scientific_name}}. Show whole growth habit, leaf front and back,\nflower, fruit or seed when applicable, stem cross-section, and a scale bar. Use only verified morphology:\n{{verified_features}}. Medium: layered watercolor with precise ink details and large readable labels.\n\nDo not combine traits from related species, show simultaneous life stages without labelling them, invent medicinal\nclaims, or use decorative pseudo-Latin. Verify venation, arrangement, flower parts, labels, and scale.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/15-animals-creatures-and-botanicals.md#4-botanical-identification-plate',
    tags: ['Animals, Creatures, and Botanical', 'horticulture and education', '4:5', 'Advanced'],
    title: 'Botanical identification plate',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/15-5-ecosystem-relationship-scene.webp',
    createdAt: '2026-08-28',
    description: 'Best for: classroom explainers',
    id: 'awesome-nano-banana-prompts:15-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 ecosystem explainer for {{ecosystem}} showing exactly these verified organisms and relationships:\n{{organisms_and_relationships}}. Arrange the habitat as one coherent scene, then overlay restrained arrows and a\nlegend for producer, consumer, decomposer, pollinator, and habitat dependency where applicable.\n\nDo not invent predation, place species outside their range, imply every relationship happens simultaneously, or\nadd unverified population claims. Use only approved labels and make every arrow direction scientifically meaningful.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/15-animals-creatures-and-botanicals.md#5-ecosystem-relationship-scene',
    tags: ['Animals, Creatures, and Botanical', 'classroom explainers', '16:9', 'Advanced'],
    title: 'Ecosystem relationship scene',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/16-1-multiscript-type-specimen-poster.webp',
    createdAt: '2026-08-28',
    description: 'Best for: multilingual identity testing',
    id: 'awesome-nano-banana-prompts:16-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 2:3 type specimen poster testing {{brand_voice}} across {{scripts_or_locales}}. Use one headline scale,\none subheading scale, one short body sample per script, numerals, punctuation, and a compact color key. Approved\ncopy only: {{verbatim_copy_by_locale}}. Establish optical rather than mechanical size matching between scripts.\n\nDo not translate, add filler text, mix glyph variants, distort letterforms, or force identical line breaks.\nVerify diacritics, shaping, punctuation, numerals, reading direction, and every character before finalizing.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/16-typography-logos-and-editorial.md#1-multiscript-type-specimen-poster',
    tags: ['Typography, Logos, and Editorial', 'multilingual identity testing', '2:3', 'Advanced'],
    title: 'Multiscript type specimen poster',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/16-2-original-logo-exploration-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: early identity development',
    id: 'awesome-nano-banana-prompts:16-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original 3:2 logo exploration sheet for the fictional brand "{{brand_name}}", which provides\n{{service_or_product}} to {{audience}}. Explore exactly six distinct concepts derived from {{brand_idea}}, each\nwith a strong monochrome silhouette and short concept label. Include one wordmark direction and one symbol-only\ndirection. Keep geometry simple enough for small-size use.\n\nNo existing trademarks, letterform copies, app-icon mockups, gradients, 3D effects, slogans, or random symbols.\nRender the brand name exactly and ensure all six concepts are materially different.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/16-typography-logos-and-editorial.md#2-original-logo-exploration-sheet',
    tags: ['Typography, Logos, and Editorial', 'early identity development', '3:2', 'Intermediate'],
    title: 'Original logo exploration sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/16-3-editorial-cover-grid-system.webp',
    createdAt: '2026-08-28',
    description: 'Best for: magazines and reports',
    id: 'awesome-nano-banana-prompts:16-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a 3:4 cover for the fictional publication "{{publication_name}}" using a disciplined modular grid.\nHero topic: {{topic}}; hero visual: {{original_visual_direction}}. Render exactly: masthead, "{{issue_line}}",\n"{{main_cover_line}}", and {{supporting_cover_lines}}. Preserve a clear first, second, and third read.\n\nNo barcode, price, celebrity, fake contributor, copied publication style, decorative microtext, or extra cover line.\nKeep the masthead legible and verify all copy, punctuation, and alignment.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/16-typography-logos-and-editorial.md#3-editorial-cover-grid-system',
    tags: ['Typography, Logos, and Editorial', 'magazines and reports', '3:4', 'Advanced'],
    title: 'Editorial cover grid system',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/16-4-physical-material-lettering.webp',
    createdAt: '2026-08-28',
    description: 'Best for: campaign headlines and playful branding',
    id: 'awesome-nano-banana-prompts:16-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create the exact phrase "{{short_phrase}}" physically constructed from {{material}} inside {{environment}}.\nEvery letter must remain readable while obeying the material\'s weight, joints, texture, gravity, shadows, and wear.\nComposition: {{composition}}; camera: {{camera}}; lighting: {{lighting}}. Use no additional written language.\n\nDo not replace letters with unrelated objects, misspell or repeat words, create impossible unsupported forms,\nor add a logo or watermark. Verify the phrase character by character and keep material scale consistent.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/16-typography-logos-and-editorial.md#4-physical-material-lettering',
    tags: ['Typography, Logos, and Editorial', 'campaign headlines and playful branding', '16:9', 'Intermediate'],
    title: 'Physical material lettering',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/16-5-wayfinding-signage-family.webp',
    createdAt: '2026-08-28',
    description: 'Best for: campuses, venues, and public spaces',
    id: 'awesome-nano-banana-prompts:16-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 wayfinding family for {{venue_type}} showing one directory, one directional blade sign, one room\nidentifier, and one accessible amenity sign. Use the approved destinations, arrows, icons, numbering, and bilingual\ncopy: {{wayfinding_data}}. Maintain a consistent grid, icon weight, arrow system, contrast, and mounting logic.\n\nDo not invent destinations, accessibility claims, emergency routes, regulatory symbols, or translations. Verify\narrow direction, room number, language pairing, legibility distance, and color contrast.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/16-typography-logos-and-editorial.md#5-wayfinding-signage-family',
    tags: ['Typography, Logos, and Editorial', 'campuses, venues, and public spaces', '16:9', 'Advanced'],
    title: 'Wayfinding signage family',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/17-1-animation-ready-2d-sprite-sheet.webp',
    createdAt: '2026-08-28',
    description: 'Best for: game prototyping',
    id: 'awesome-nano-banana-prompts:17-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Image 1: approved original character anchor. Create a transparent-background sprite sheet using a fixed\n{{cell_width}}×{{cell_height}} cell grid. Include exactly {{animation_list_and_frame_counts}}. Preserve character\nproportions, palette, costume, equipment, outline weight, pixel density, ground line, and facing direction.\nKeep each frame centered with consistent margins and no overlap.\n\nNo existing game IP, mixed scales, anti-aliased pixels when pixel art is requested, duplicated frames, cropped\nequipment, text, shadows outside cells, or background. Verify frame count and animation continuity.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/17-game-assets-3d-and-industrial.md#1-animation-ready-2d-sprite-sheet',
    tags: ['Game Assets, 3D, and Industrial Concept', 'game prototyping', 'grid', 'Advanced'],
    title: 'Animation-ready 2D sprite sheet',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/17-2-isometric-modular-environment-kit.webp',
    createdAt: '2026-08-28',
    description: 'Best for: level-building concepts',
    id: 'awesome-nano-banana-prompts:17-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an isometric modular kit for {{environment_theme}} on a clean neutral sheet. Include exactly {{tile_list}},\nwith one shared grid unit, identical camera angle, matching edge heights, repeatable materials, and consistent light.\nShow a small assembled example using only the supplied modules. Palette: {{palette}}; rendering: {{style}}.\n\nNo mismatched perspective, unique edges that cannot connect, hidden backs, changing scale, baked text, logo,\nor extra module. Verify that every path, wall, corner, stair, and doorway joins correctly.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/17-game-assets-3d-and-industrial.md#2-isometric-modular-environment-kit',
    tags: ['Game Assets, 3D, and Industrial Concept', 'level-building concepts', '16:9 sheet', 'Advanced'],
    title: 'Isometric modular environment kit',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/17-3-inventory-item-family.webp',
    createdAt: '2026-08-28',
    description: 'Best for: RPG and strategy UI',
    id: 'awesome-nano-banana-prompts:17-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a square inventory atlas with exactly {{item_count}} original items: {{item_list}}. Each item sits in an\nequal transparent cell, uses the same three-quarter camera, scale logic, outline behavior, light direction, and\nrender finish. Rarity is communicated only through {{approved_rarity_system}}, not item size.\n\nNo existing franchise shapes, duplicated item, inconsistent padding, labels, numbers, background scene, or glow\nthat obscures silhouettes. Count items and verify each remains recognizable at 64 pixels.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/17-game-assets-3d-and-industrial.md#3-inventory-item-family',
    tags: ['Game Assets, 3D, and Industrial Concept', 'RPG and strategy UI', '1:1 atlas', 'Intermediate'],
    title: 'Inventory item family',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/17-4-industrial-machine-cutaway.webp',
    createdAt: '2026-08-28',
    description: 'Best for: concept communication',
    id: 'awesome-nano-banana-prompts:17-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–2: verified exterior and internal references for {{machine}}. Create a 3:2 technical cutaway showing\nonly {{approved_subsystems}}. Preserve exterior geometry, access panels, safety guards, scale, and subsystem position.\nUse clear color coding and leader lines with labels {{approved_labels}}. Rendering: precise industrial 3D with\nneutral studio light and restrained section surfaces.\n\nDo not invent engineering details, remove guards in the operational view, imply certification, show unsafe operation,\nor add specifications not provided. Verify subsystem mapping and label endpoints.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/17-game-assets-3d-and-industrial.md#4-industrial-machine-cutaway',
    tags: ['Game Assets, 3D, and Industrial Concept', 'concept communication', '3:2', 'Advanced'],
    title: 'Industrial machine cutaway',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/17-5-gameplay-hud-original-scene.webp',
    createdAt: '2026-08-28',
    description: 'Best for: game UI exploration',
    id: 'awesome-nano-banana-prompts:17-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 16:9 gameplay mockup for an original {{genre}} game set in {{world}}. Overlay a practical HUD containing\n{{required_HUD_elements}} while keeping the action readable. Establish clear hierarchy, safe margins, consistent icon\nlanguage, controller-friendly scale, and accessible state colors. Use only this sample data: {{approved_data}}.\n\nNo existing game interface, fake platform logo, random quest text, unreadable microtype, excessive vignette, or HUD\nelement without a gameplay purpose. Verify every value and keep critical action unobstructed.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/17-game-assets-3d-and-industrial.md#5-gameplay-hud-over-an-original-scene',
    tags: ['Game Assets, 3D, and Industrial Concept', 'game UI exploration', '16:9', 'Advanced'],
    title: 'Gameplay HUD over an original scene',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/18-1-period-accurate-street-scene.webp',
    createdAt: '2026-08-28',
    description: 'Best for: museums, education, and documentary concepts',
    id: 'awesome-nano-banana-prompts:18-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a historically responsible 3:2 street scene set in {{place}} during {{specific_year_or_period}}.\nShow {{verified_everyday_activity}} with architecture, paving, transport, tools, signage, clothing layers,\nhairstyles, lighting sources, and social behavior supported by {{approved_sources}}. Camera: human eye level;\nstyle: naturalistic documentary reconstruction, not heroic spectacle.\n\nDo not combine eras, modernize cleanliness, invent uniforms or text, add famous people, or turn cultural details\ninto fantasy decoration. If a detail is uncertain, choose a visually neutral omission and report it separately.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/18-history-culture-and-heritage.md#1-period-accurate-street-scene',
    tags: ['History, Culture, and Heritage', 'museums, education, and documentary concepts', '3:2', 'Advanced'],
    title: 'Period-accurate street scene',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/18-2-museum-exhibit-interpretation-panel.webp',
    createdAt: '2026-08-28',
    description: 'Best for: public-history design',
    id: 'awesome-nano-banana-prompts:18-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a 16:9 museum interpretation panel about {{artifact_or_topic}} for {{audience}}. Include one rights-cleared\nhero image, one detail crop, a short timeline, and exactly {{label_count}} callouts. Render only the approved title,\nintro, labels, date, provenance, and credit: {{approved_copy}}. Use accessible contrast and a calm reading order.\n\nDo not invent provenance, ownership, date, quotation, restoration claim, cultural meaning, or donor credit.\nKeep captions adjacent to the correct image and verify every proper noun and date.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/18-history-culture-and-heritage.md#2-museum-exhibit-interpretation-panel',
    tags: ['History, Culture, and Heritage', 'public-history design', '16:9', 'Advanced'],
    title: 'Museum exhibit interpretation panel',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/18-3-classical-scroll-style-narrative.webp',
    createdAt: '2026-08-28',
    description: 'Best for: original heritage-inspired storytelling',
    id: 'awesome-nano-banana-prompts:18-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create an original 21:9 continuous-scroll narrative about {{verified_historical_or_fictional_event}} divided into\n{{scene_count}} connected episodes. Use {{period_and_region}} material cues: paper or silk tone, perspective convention,\narchitecture, clothing, landscape rhythm, and restrained mineral-color palette. Repeat the main character only where\nthe continuous-narrative convention requires it, with consistent identity and costume.\n\nDo not copy an existing scroll, imitate a named living artist, mix dynasties, invent calligraphy, or add seals.\nIf text is required, render only {{approved_inscription}} and verify script and historical appropriateness.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/18-history-culture-and-heritage.md#3-classical-scroll-style-narrative',
    tags: ['History, Culture, and Heritage', 'original heritage-inspired storytelling', '21:9', 'Advanced'],
    title: 'Classical scroll-style narrative',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/18-4-artifact-reconstruction-board.webp',
    createdAt: '2026-08-28',
    description: 'Best for: archaeology and conservation communication',
    id: 'awesome-nano-banana-prompts:18-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–{{n}}: documented views of {{artifact}}. Create a reconstruction board with current condition, measured\nfragment arrangement, a conservative reconstructed silhouette, material cross-section, and a clear visual distinction\nbetween observed evidence and inferred completion. Use labels "OBSERVED", "INFERRED", and "UNKNOWN" exactly.\n\nDo not hide damage, invent decoration, color, text, function, dimensions, or missing parts. Keep uncertainty visible,\ncite the supplied evidence in accompanying text, and ensure inferred areas cannot be mistaken for original material.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/18-history-culture-and-heritage.md#4-artifact-reconstruction-board',
    tags: ['History, Culture, and Heritage', 'archaeology and conservation communication', '3:2', 'Advanced'],
    title: 'Artifact reconstruction board',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/18-5-heritage-craft-process.webp',
    createdAt: '2026-08-28',
    description: 'Best for: education and cultural documentation',
    id: 'awesome-nano-banana-prompts:18-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 4:5 process poster documenting {{craft}} in {{region_or_tradition}}. Show exactly {{step_count}} verified\nstages, correct tools, materials, hand positions, workshop context, and maker safety practices based on {{sources}}.\nUse respectful documentary illustration and render only the approved step names: {{step_labels}}.\n\nDo not merge distinct traditions, romanticize unsafe practices, invent sacred meaning, costume the maker, or claim\nauthenticity without evidence. Verify tool-to-step mapping and request community review before publication.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/18-history-culture-and-heritage.md#5-heritage-craft-process',
    tags: ['History, Culture, and Heritage', 'education and cultural documentation', '4:5', 'Advanced'],
    title: 'Heritage craft process',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/19-1-white-paper-cover-opening-spread.webp',
    createdAt: '2026-08-28',
    description: 'Best for: research and B2B publishing',
    id: 'awesome-nano-banana-prompts:19-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a coordinated white-paper cover and opening spread for {{organization}}. Cover: one original visual metaphor,\ntitle, subtitle, organization, and date. Opening spread: section title, 80–120 words of approved introduction,\none verified pull quote, and one supporting diagram. Copy: {{approved_copy}}. Use a disciplined grid, print-safe\nmargins, accessible typography, and a visual system derived from {{brand_rules}}.\n\nNo fake ISBN, barcode, author, citation, statistic, partner logo, or filler text. Protect the gutter and verify every\nline, footnote, date, and page relationship.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/19-documents-and-publishing.md#1-white-paper-cover-and-opening-spread',
    tags: ['Documents and Publishing', 'research and B2B publishing', 'A4 portrait plus 2-page spread', 'Advanced'],
    title: 'White-paper cover and opening spread',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/19-2-illustrated-user-manual-page.webp',
    createdAt: '2026-08-28',
    description: 'Best for: product onboarding',
    id: 'awesome-nano-banana-prompts:19-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create one A4 user-manual page explaining {{verified_task}} for {{product}}. Show exactly {{step_count}} numbered\nsteps with consistent product diagrams, hand positions, arrows, warnings, and required tools. Render only the approved\nstep text and safety language: {{approved_copy}}. Use large labels, high contrast, and a clear top-to-bottom sequence.\n\nDo not invent operations, omit a safety guard, change product geometry, add a certification symbol, or paraphrase\nwarning text. Verify every hand interaction, arrow, part name, number, and warning hierarchy.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/19-documents-and-publishing.md#2-illustrated-user-manual-page',
    tags: ['Documents and Publishing', 'product onboarding', 'A4 portrait', 'Advanced'],
    title: 'Illustrated user-manual page',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/19-3-encyclopedic-reference-plate.webp',
    createdAt: '2026-08-28',
    description: 'Best for: educational publishing',
    id: 'awesome-nano-banana-prompts:19-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a 3:2 encyclopedic plate about {{subject}} for {{reader_level}}. Combine one hero illustration, {{detail_count}}\ndetail studies, a scale comparison, a compact taxonomy or parts list, and one contextual vignette. Use only the\nverified labels and facts supplied in {{approved_data}}. Style: precise, calm, information-dense but readable.\n\nDo not invent taxonomy, dimensions, dates, function, behavior, or citations. Keep labels connected to the correct\nfeature and distinguish illustrative scale from measured scale.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/19-documents-and-publishing.md#3-encyclopedic-reference-plate',
    tags: ['Documents and Publishing', 'educational publishing', '3:2', 'Advanced'],
    title: 'Encyclopedic reference plate',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/19-4-annual-report-data-spread.webp',
    createdAt: '2026-08-28',
    description: 'Best for: organizational reporting',
    id: 'awesome-nano-banana-prompts:19-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Design a two-page annual-report spread titled "{{section_title}}" using only {{verified_data}}. Include one primary\nchart, two supporting metrics, one short approved narrative, and source/period notes. Use honest axes, consistent units,\naccessible colors, clear page hierarchy, and a protected gutter. Distinguish actual, target, and estimate explicitly.\n\nDo not invent performance, round values, hide a baseline, truncate an axis deceptively, add a testimonial, or create\ndecorative data. Verify every number, unit, date range, legend, and source line.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/19-documents-and-publishing.md#4-annual-report-data-spread',
    tags: ['Documents and Publishing', 'organizational reporting', '2:1 spread', 'Advanced'],
    title: 'Annual-report data spread',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/19-5-workshop-workbook-page.webp',
    createdAt: '2026-08-28',
    description: 'Best for: courses and facilitated sessions',
    id: 'awesome-nano-banana-prompts:19-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a printable workbook page for {{workshop_topic}}. Include a short objective, one worked example, one reflection\nprompt, a three-column exercise table, and a next-action box. Render exactly the approved instructional copy:\n{{approved_copy}}. Use generous writing space, grayscale-friendly contrast, clear numbering, and accessible type.\n\nNo inspirational filler, fake citation, stock illustration, answer key, tiny text, or decorative background that uses\nprinter ink unnecessarily. Verify that all fields are writable and instructions fit on one page.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/19-documents-and-publishing.md#5-workshop-workbook-page',
    tags: ['Documents and Publishing', 'courses and facilitated sessions', 'A4 or US Letter', 'Intermediate'],
    title: 'Workshop workbook page',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/20-1-consistent-professional-headshot.webp',
    createdAt: '2026-08-28',
    description: 'Best for: profiles and speaker pages',
    id: 'awesome-nano-banana-prompts:20-1',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–3: consenting subject identity references. Create a professional 4:5 head-and-shoulders portrait for\n{{professional_context}}. Preserve face shape, apparent age, skin tone, hairline, hairstyle, eye color, distinguishing\nfeatures, and natural asymmetry. Wardrobe: {{approved_wardrobe}}; background: {{simple_background}}; light: soft,\ncredible studio setup; expression: {{expression}}.\n\nDo not beautify, de-age, change body shape, whiten teeth or skin, add jewelry, imitate another person, or invent a logo.\nKeep real skin texture and compare identity against all references.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/20-profiles-teams-and-lifestyle.md#1-consistent-professional-headshot',
    tags: ['Profiles, Teams, and Lifestyle', 'profiles and speaker pages', '4:5', 'Intermediate'],
    title: 'Consistent professional headshot',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/20-2-multi-person-team-portrait.webp',
    createdAt: '2026-08-28',
    description: 'Best for: company and community pages',
    id: 'awesome-nano-banana-prompts:20-2',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      "Images 1–{{person_count}}: consenting identity references. Create a natural 16:9 team portrait in {{work_environment}}.\nPreserve each person's identity, age, skin tone, hair, body proportions, accessibility devices, and approved clothing.\nArrange varied heights and depths with natural posture and unobstructed faces. Use one camera, coherent focal plane,\nshared color temperature, contact shadows, and environmental reflections.\n\nDo not merge faces, duplicate people, exchange clothing, remove mobility aids, change body size, add staff, or place\nsomeone in a tokenizing position. Count and verify every person independently.",
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/20-profiles-teams-and-lifestyle.md#2-multi-person-team-portrait',
    tags: ['Profiles, Teams, and Lifestyle', 'company and community pages', '16:9', 'Advanced'],
    title: 'Multi-person team portrait',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/20-3-lifestyle-persona-scenario-pack.webp',
    createdAt: '2026-08-28',
    description: 'Best for: service design and research communication',
    id: 'awesome-nano-banana-prompts:20-3',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a three-scene contact sheet illustrating the fictional persona {{persona_description}} during {{workflow}}:\n1 {{before_context}}, 2 {{core_action}}, 3 {{after_or_failure_state}}. Preserve the same original person, clothing,\ndevice, environment logic, and time progression across all scenes. Use candid documentary photography and show the\nreal constraints {{constraints}} without turning them into visual stereotypes.\n\nNo real-person identity, brand logo, motivational caption, demographic cliché, perfect staged behavior, or UI text\nthat was not supplied. Exactly three scenes, each with one observable research insight.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/20-profiles-teams-and-lifestyle.md#3-lifestyle-persona-scenario-pack',
    tags: [
      'Profiles, Teams, and Lifestyle',
      'service design and research communication',
      '3:2 contact sheet',
      'Advanced',
    ],
    title: 'Lifestyle persona scenario pack',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/20-4-original-avatar-system.webp',
    createdAt: '2026-08-28',
    description: 'Best for: communities and app prototypes',
    id: 'awesome-nano-banana-prompts:20-4',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Create a system of exactly {{avatar_count}} original avatars for {{community_or_app}}. Maintain one consistent crop,\nbackground shape, line weight, rendering style, and lighting while varying face shapes, skin tones, ages, hair textures,\nhead coverings, glasses, and expressions respectfully. Every avatar must remain readable at 48 pixels.\n\nNo celebrity or real-person likeness, cultural costume shorthand, random disability symbolism, duplicated face,\ntext, logo, or hierarchy of detail. Keep representation varied without making identity the joke.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/20-profiles-teams-and-lifestyle.md#4-original-avatar-system',
    tags: ['Profiles, Teams, and Lifestyle', 'communities and app prototypes', 'square grid', 'Intermediate'],
    title: 'Original avatar system',
  },
  {
    author: 'Flaq.ai',
    coverUrl:
      'https://cdn.jsdelivr.net/gh/flaqai/awesome-nano-banana-prompts@58f7077c77772b8c77c4bb03a0d29812c6e593e3/assets/examples/20-5-remote-team-editorial-mosaic.webp',
    createdAt: '2026-08-28',
    description: 'Best for: distributed-team storytelling',
    id: 'awesome-nano-banana-prompts:20-5',
    imageMode: 'generate',
    imageModel: 'gemini-3-pro-image',
    prompt:
      'Images 1–{{person_count}}: consenting participant references and approved environments. Create a 16:9 editorial mosaic\nwith one equal-weight panel per participant, showing each person engaged in {{shared_activity}} from their real context.\nPreserve identity, workspace details approved for publication, local light, and assistive equipment. Unify the mosaic\nthrough crop rhythm, border system, and restrained color treatment rather than fabricating one shared room.\n\nDo not merge locations, invent employer branding, alter screens, expose private data, add participants, or rank panels.\nVerify consent scope, count, name spelling if captions are supplied, and removal of sensitive background information.',
    referenceImageUrls: [],
    sourceId: 'awesome-nano-banana-prompts',
    sourceUrl:
      'https://github.com/flaqai/awesome-nano-banana-prompts/blob/40bbf2be4b604bbfeafe6db544540e1a25c5a42d/prompts/20-profiles-teams-and-lifestyle.md#5-remote-team-editorial-mosaic',
    tags: ['Profiles, Teams, and Lifestyle', 'distributed-team storytelling', '16:9', 'Advanced'],
    title: 'Remote-team editorial mosaic',
  },
];

const promptsWithFeaturedFirst: readonly PromptLibraryItem[] = [...prompts.slice(5), ...prompts.slice(0, 5)].map(
  (prompt) => Object.assign({}, prompt, { coverUrl: prompt.coverUrl || DEFAULT_COVER_URL }),
);

export default promptsWithFeaturedFirst;
