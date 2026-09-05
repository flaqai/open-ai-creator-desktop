'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, ImageIcon, Layers3, Play, Shirt, Sparkles, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { openDesktopSettings } from '@/lib/desktop/runtime';
import { FEATURE_MODULES } from '@/lib/features/catalog';
import { useDesktopRuntime } from '@/hooks/use-desktop-runtime';
import { Button } from '@/components/ui/button';

const icons = { sparkles: Sparkles, image: ImageIcon, layers: Layers3, shirt: Shirt, video: Video, play: Play };

export default function DesktopHome({ children }: { children?: ReactNode }) {
  const t = useTranslations('Desktop');
  const tNav = useTranslations('Navigation');
  const desktop = useDesktopRuntime();

  if (!desktop) return children || null;

  return (
    <div className='relative w-full overflow-hidden px-5 py-8 lg:px-10 lg:py-12'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_5%,rgba(92,36,255,0.14),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(98,82,255,0.12),transparent_30%)]' />
      <div className='mx-auto max-w-[1180px]'>
        <div className='mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-white/60'>
              <Sparkles className='size-3.5 text-violet-300' />
              Flaq Creator
            </div>
            <h1 className='text-3xl font-semibold tracking-tight text-white lg:text-4xl'>{t('workspace')}</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-white/60'>{t('workspaceDescription')}</p>
          </div>
          <Button
            type='button'
            onClick={openDesktopSettings}
            variant='outline'
            className='border-white/10 bg-white/[0.04] text-white hover:bg-white/8 hover:text-white'
          >
            {t('configure')}
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {FEATURE_MODULES.map((tool) => {
            const { code, href } = tool;
            const Icon = icons[tool.icon];
            const featured = 'featured' in tool && tool.featured;
            const descriptionKey = `${code}-content` as Parameters<typeof tNav>[0];
            const hasDescription = code !== 'ai-create';

            return (
              <Link
                key={code}
                href={href}
                className={`group relative min-h-44 overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${featured ? 'border-violet-300/20 bg-[linear-gradient(145deg,rgba(92,36,255,.22),rgba(104,86,255,.12))] sm:col-span-2' : 'border-white/8 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.055]'}`}
              >
                {featured && (
                  <img
                    src='/flaqai_saas_asserts/text_to_image/feature/1_1.webp'
                    alt=''
                    loading='lazy'
                    className='pointer-events-none absolute inset-y-0 end-0 h-full w-1/2 [mask-image:linear-gradient(to_right,transparent,black)] object-cover opacity-25'
                  />
                )}
                <div className='relative flex h-full flex-col justify-between gap-8'>
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl ${featured ? 'bg-white/10 text-violet-200' : 'bg-white/[0.06] text-white/65'}`}
                  >
                    <Icon className='size-5' />
                  </div>
                  <div>
                    <div className='flex items-center justify-between gap-3'>
                      <h2 className='text-base font-semibold text-white/90'>{tNav(code)}</h2>
                      <ArrowUpRight className='size-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70' />
                    </div>
                    <p className='mt-1.5 line-clamp-2 text-xs leading-5 text-white/60'>
                      {hasDescription ? tNav(descriptionKey) : t('workspaceDescription')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
