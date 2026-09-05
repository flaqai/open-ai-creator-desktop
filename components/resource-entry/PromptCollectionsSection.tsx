import { ArrowUpRight, LibraryBig } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getFlaqResourceUrl } from '@/lib/constants/resource-entry';
import SubHeading from '@/components/internal-page/sub-heading';
import Github from '@/components/svg/footer/Github';

const PROMPT_COLLECTIONS = [
  {
    key: 'seedance-2-5',
    href: '/awesome-prompt/seedance-2-5-prompts',
    image: '/images/resource-entry/prompts/seedance-2-5.webp',
    repository: 'https://github.com/flaqai/awesome_seedance_2_5',
  },
  {
    key: 'minimax-h3',
    href: '/awesome-prompt/minimax-h3-prompts',
    image: '/images/resource-entry/prompts/minimax-h3.webp',
    repository: 'https://github.com/flaqai/awesome-minimax-h3-video-prompts',
  },
  {
    key: 'wan-3-0',
    href: '/awesome-prompt/wan-3-0-prompts',
    image: '/images/resource-entry/prompts/wan-3-0.webp',
    repository: 'https://github.com/flaqai/awesome_wan-3-0-prompts',
  },
  {
    key: 'qwen-image-3-0',
    href: '/awesome-prompt/qwen-image-3-0-prompts',
    image: '/images/resource-entry/prompts/qwen-image-3-0.webp',
    repository: 'https://github.com/flaqai/awesome-qwen-image-3',
  },
] as const;

export default async function PromptCollectionsSection() {
  const t = await getTranslations('ResourceEntrySections.promptLibrary');

  return (
    <section className='container-centered py-[60px]'>
      <div className='mb-8'>
        <SubHeading
          icon={<LibraryBig className='hidden size-10 lg:block' strokeWidth={1.8} />}
          title={t('title')}
          description={t('description')}
          className='text-center lg:text-left'
        />
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {PROMPT_COLLECTIONS.map((collection) => (
          <article
            key={collection.key}
            className='border-color-b1 bg-color-1 flex min-h-[280px] flex-col overflow-hidden rounded-lg border p-2.5 transition-colors duration-200 hover:border-white/20 hover:bg-[#212027]'
          >
            <a
              href={getFlaqResourceUrl(collection.href)}
              target='_blank'
              rel='noopener noreferrer'
              className='group relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-white/5'
            >
              <img
                src={collection.image}
                alt={t(`items.${collection.key}.title`)}
                className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.06]'
                loading='lazy'
                decoding='async'
              />
            </a>

            <div className='flex flex-1 flex-col px-0.5 pt-3'>
              <a
                href={getFlaqResourceUrl(collection.href)}
                target='_blank'
                rel='noopener noreferrer'
                className='text-color-t1 hover:text-color-main font-medium'
              >
                {t(`items.${collection.key}.title`)}
              </a>
              <p className='text-color-t3 mt-1 line-clamp-3 text-xs leading-[18px]'>
                {t(`items.${collection.key}.description`)}
              </p>

              <div className='mt-auto flex items-center gap-2 pt-3'>
                <a
                  href={getFlaqResourceUrl(collection.href)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='border-color-b1 bg-color-2 text-color-t1 hover:border-color-main/50 flex h-9 flex-1 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors hover:bg-white/10'
                >
                  {t('viewPrompts')}
                </a>
                <a
                  href={collection.repository}
                  target='_blank'
                  rel='nofollow noopener noreferrer'
                  className='border-color-b1 bg-color-2 text-color-t2 hover:border-color-main/50 hover:text-color-t1 flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-white/10'
                >
                  <Github className='size-4' />
                  {t('repository')}
                  <ArrowUpRight className='size-3.5' />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
