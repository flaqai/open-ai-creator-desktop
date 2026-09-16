import { getTranslations, setRequestLocale } from 'next-intl/server';

import { isDesktopServerRender } from '@/lib/desktop/server';
import { numberList } from '@/lib/utils/arrayUtils';
import DesktopHome from '@/components/desktop/DesktopHome';
import Faq from '@/components/Faq';
import CoreFeaturesCards from '@/components/home/CoreFeaturesCards';
import ExampleSection from '@/components/home/ExampleSection';
import HomeCarousel from '@/components/home/HomeCarousel';
import type { CarouselCard } from '@/components/home/HomeCarousel';
import HeroSection from '@/components/home/new-section/HeroSection';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

const exampleVideos = [
  {
    src: '/flaqai_saas_asserts/image_to_video/example/1.mp4',
    prompt:
      'Full live-action cinematic realism, high-contrast chiaroscuro lighting, deep oppressive shadows, photographic texture, real motion blur, subtle film grain. No anime, no cartoon.\n\nCold dominant real human male actor.\n\nDark cyberpunk interior, central table full of scattered standard poker cards with red and black suits. Strong side key light creates dramatic facial shadow split, dark background with faint volumetric beams.\n\n0-2s: Extreme low-angle upward shot, slow push-in. Man slowly sits sideways at table, light slices across face, mouth corner lifts. Deep icy voice with reverb: "Wanna play?"\n\n2-5s: Rapid push to close-up. He flicks one card spinning fast toward camera. Extreme slow motion: card nearly suspends, bright edge halo, hyper-sharp red-black pattern. Snaps back to full speed, card boomerangs into his hand.\n\n5-9s: Fast multi-angle montage with 360° orbiting ascending camera. Man explosively stands, arms wide. All cards spiral upward into massive swirling card storm around him. He stands at center, head tilted down with dominant gaze.\n\n9-15s: Violent slow-mo alternating with full speed. He swings both hands, dozens of cards shoot outward with luminous streaks. Three insert close-ups: card spins, suspends, edge electric arc flash, then accelerates away. Final rapid wide pull to epic freeze frame of man in flying card storm, deep bass impact.\n\nStrict: Pure photographic live-action, consistent poker cards only, no text, no symbols, no logos, no watermarks anywhere. Realistic card motion, no distortions, no style shifts.',
  },
  {
    src: '/flaqai_saas_asserts/image_to_video/example/2.mp4',
    prompt:
      'ultra-cinematic action sequence in bright clear daylight. Start instantly with a fast-moving ultra-wide aerial shot of a shattered skybridge between two supertall towers high above a massive city. One person is falling through open air while a rescue runner sprints across the collapsing bridge. Camera sweeps low and fast past breaking glass, bending steel, sparks, cables, and spinning debris, with sharp detail, strong sunlight, deep contrast, realistic physics, and epic scale. At 7 seconds enter dramatic slow motion as the runner launches from the final intact beam, dives through flying glass, and reaches toward the falling person with the city far below. At 10 seconds snap back to full speed as their hands connect, both swing into a hanging maintenance cable, crash through an open service hatch, slide safely inside the tower, and come to rest as the bridge collapses outside behind them. Clear ending, complete rescue, premium blockbuster visuals, strong composition, dynamic camera, polished action film aesthetic.',
  },
];

const exampleImages = [
  {
    src: '/flaqai_saas_asserts/home/example/image/1.webp',
    prompt:
      'Create a clean 16:9 automotive design specification board on a light gray studio background. Feature a highly detailed 1980s Volvo 240 widebody show car, JUMDOO EDITION, in warm beige satin paint with satin black accents. The car should have a boxy Volvo 240 silhouette, very low air-suspension stance, extra-wide track width, riveted wide fender flares, deep black front splitter with near-ground clearance, black side skirts, black lower cladding, black deep-dish multi-spoke wheels, stretched low-profile tires, black grille with Volvo diagonal slash, one inner front headlight covered by an X-pattern insert for an asymmetric look, shaved clean body trim, dual center exhaust, and visible racing bucket seats. Add small JUMDOO branding on the front plate area, side skirt, and rear panel. Arrange six studio render views in a 3x2 grid: front 3/4, front, side profile, rear, rear close view, and rear 3/4. Use crisp realistic 3D product-render lighting, soft shadows, black sans-serif typography, thin gray divider lines, and minimal Swiss-style layout. Include a top-left title: VOLVO 240 WIDEBODY, subheadline: JUMDOO EDITION. Add small side panels for material swatches, colorway, branding locations, wheels and fitment, and notable details.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/2.webp',
    prompt: 'Design a poster of "Guyu" in Feng Zikai\'s painting style, with a 1:1 size.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/3.webp',
    prompt:
      'A candid documentary-style photo of a high school computer lab classroom with exactly 10 students. Viewed from the back-left corner at a slight wide angle. Early-2000s snapshot look: consumer digital camera, direct flash, soft grain, warm fluorescent lighting, timestamp "02 18 04" in bottom-right corner.\n\nForeground details:\n\n* Left: student in navy track jacket with white stripes pointing at CRT monitor\n\n* Center: student with short spiky hair in oversized gray sweatshirt, back to camera\n\n* Right: blonde girl with ponytail in light blue long-sleeve top with dark stripes, typing on keyboard\n\n* Far right: student with curly dark hair at workstation\n\nOther students sit in middle and back rows, all facing their screens.  Bulky off-white CRT computers show ChatGPT interface with "ChatGPT" heading and simple prompt text visible.  Room details: beige walls, drop ceiling, rolling office chairs, white keyboards and mice, backpack on floor. Back wall has 4 readable posters: "YOU CAN DO HARD THINGS", "BE KIND ONLINE", "THINK BEFORE YOU CLICK", and a large "KEYBOARD SHORTCUTS" poster. Also bulletin boards and a classroom door at the back.  Faces softly anonymized or partially obscured. Realistic classroom photo style, focus on students using ChatGPT in an old computer lab.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/4.webp',
    prompt:
      'Create a 16:9 editorial fashion moodboard for a fictional brand called VINCO. \n\nThis should be a clean standalone moodboard artwork, not a screenshot of an app or interface, with no UI, no buttons, no text panel, and no device framing.\n\nThe overall aesthetic blends Italian archival graphic design with late-1990s Southern California streetwear, mixing natural wine culture, skate utility, and sun-faded documentary fashion photography. Use gritty but precise art direction, midday outdoor light, slightly chaotic but disciplined typography, and real-person casting rather than polished fashion-model energy.\n\nArrange exactly 6 images in a collage or editorial grid composition. Keep the layout organic, slightly imperfect, and art-directed like a campaign deck or printed reference board.\n\nImage 1: a young man in an oversized faded olive T-shirt and dark pants standing in front of an off-white poster-like backdrop with bold VINCO branding, barcode graphics, and small editorial text.\n\nImage 2: a close-up still life of a dark wine bottle with a minimalist white label reading VINCO, photographed in warm sunlight with tactile paper texture and shadow.\n\nImage 3: a person from the back in a washed olive long-sleeve shirt with subtle branding, white shorts, and a yellow hanging tag or sticker element near the top right, posed against a pale wall with blue stripe detail and editorial layout text.\n\nImage 4: a skateboarder crouching or riding away, photographed from behind, wearing a white T-shirt with a large black graphic block on the back and dark shorts, in golden sun on pavement.\n\nImage 5: a printed wine ephemera flat lay with cream paper and a pale chartreuse-green wine label or booklet reading Vino Naturale, featuring grape illustration, small black text, and layered paper pieces.\n\nImage 6: a person facing camera in a white T-shirt with a race-bib style chest print reading 97, wearing a fluorescent yellow-green cap with small brand text, standing outdoors with palm trees and bright sky behind them.\n\nUse earthy tones throughout: olive, cream, charcoal, sun-bleached white, asphalt gray, muted brown, and one fluorescent yellow-green accent repeated in small details.\n\nThe final image should feel like a refined editorial collage board, not a software screenshot.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/5.webp',
    prompt:
      'Create a complete visual world-building model for a civilization with the style of reference image, including multiple images of buildings, characters, clothing, vehicles and maps, using a unified design language and featuring a cinematic-like realism with extremely rich details.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/6.webp',
    prompt:
      'Create a premium cinematic 3D illustration of a stylized X / Twitter-like profile screen set against a clean dark background.\n\nUse the provided reference character as the subject. Preserve her recognizable facial identity, facial proportions, and key features so she remains clearly the same person. Her expression should feel naturally warm and engaging, with a subtle genuine smile and bright, lively eyes.\n\nThe profile interface should feel authentic and polished, closely resembling a modern verified social media profile, with a believable layout, profile details, follower metrics, and post feed. The original avatar should remain unchanged within the interface.\n\nThe main visual moment is that the character is breaking out from the screen in a dynamic, immersive 3D effect, as if stepping into the real world from her profile page. The screen surface should feel disrupted by this motion, with visible ripple, tension, and distortion effects that enhance the sense of impact and movement.\n\nUse soft studio lighting, cinematic shadows, realistic depth of field, and ultra-clean rendering. The final image should feel highly detailed, sharp, and visually striking, blending realistic materials with refined stylized 3D character appeal.',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/7.webp',
    prompt:
      'Maintain the design concept of the picture (no need to keep the style consistent), and create a 16:9 poster based on the theme "LIFE".',
  },
  {
    src: '/flaqai_saas_asserts/home/example/image/8.webp',
    prompt:
      "Based on the reference image, create a professional English storyboard with 10 annotated frames, suitable for rehearsals, director's guidance, and action or scene planning, in a 16:9 ratio.",
  },
];

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });
  const tCarousel = await getTranslations({ locale, namespace: 'Home.carousel' });
  const tExampleSection = await getTranslations({ locale, namespace: 'Home.exampleSection' });

  const carouselData: CarouselCard[] = [
    {
      type: tCarousel('video.type'),
      media: {
        type: 'video',
        src: '/flaqai_saas_asserts/home/tools/ai_video_generator.mp4',
        poster: '/flaqai_saas_asserts/home/tools/ai_video_generator.webp',
      },
      href: '/image-to-video',
    },
    {
      type: tCarousel('image.type'),
      media: {
        type: 'image',
        src: '/flaqai_saas_asserts/home/tools/ai_image_generator.webp',
      },
      href: '/text-to-image',
    },
    {
      type: tCarousel('tryon.type'),
      media: {
        type: 'image',
        src: '/flaqai_saas_asserts/virtual_try_on/feature/1_1.webp',
      },
      href: '/virtual-try-on',
    },
  ];

  return isDesktopServerRender ? (
    <DesktopHome />
  ) : (
    <DesktopHome>
      <div className='relative w-full'>
        <div className='absolute -top-[70px] left-0 -z-10 flex hidden h-screen w-full items-center justify-center lg:block'>
          <img
            alt='bg'
            width={1920}
            height={1134}
            src='/images/home/background_web.webp'
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              objectPosition: 'center',
            }}
          />
        </div>
        <img
          className='absolute -top-[70px] left-0 -z-10 block h-[150vh] w-full lg:hidden'
          alt='bg-mobile'
          width={375}
          height={428}
          src='/images/home/background_phone.webp'
          style={{
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
        <HeroSection />
        <HomeCarousel
          data={carouselData}
          title={t('carousel.title')}
          description={t('carousel.description')}
          className='mb-12 lg:mb-20'
        />
        <CoreFeaturesCards
          title={t('unique-features.title')}
          description={t('unique-features.description')}
          buttonText={t('unique-features.button-text')}
          buttonHref='/image-to-video'
          features={numberList(4).map((num) => ({
            title: t(`unique-features.${num}.title`),
            description: t(`unique-features.${num}.description`),
          }))}
        />
        <ExampleSection
          autoPlay={false}
          title={tExampleSection('title')}
          description={tExampleSection('description')}
          imageExamplesTitle={tExampleSection('imageExamples.title')}
          imageExamplesDescription={tExampleSection('imageExamples.description')}
          videoExamplesTitle={tExampleSection('videoExamples.title')}
          videoExamplesDescription={tExampleSection('videoExamples.description')}
          promptLabel={tExampleSection('videoExamples.promptLabel')}
          images={exampleImages}
          videos={exampleVideos}
        />
        <CoreFeaturesCards
          title={t('use-cases.title')}
          description={t('use-cases.description')}
          buttonText={t('use-cases.button-text')}
          buttonHref='/image-to-video'
          features={numberList(4).map((num) => ({
            title: t(`use-cases.${num}.title`),
            description: t(`use-cases.${num}.description`),
          }))}
        />
        <ResourceEntrySections includeAgentGuides />
        <Faq
          title={t('faq.title')}
          faqList={numberList(8).map((num) => ({
            id: num,
            question: t(`faq.${num}.question`),
            answer: t(`faq.${num}.answer`),
          }))}
          className='py-[60px] lg:py-[120px]'
        />
      </div>
    </DesktopHome>
  );
}
