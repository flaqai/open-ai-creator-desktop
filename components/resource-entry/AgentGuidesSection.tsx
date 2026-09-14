import { Bot } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getFlaqResourceUrl } from '@/lib/constants/resource-entry';
import { cn } from '@/lib/utils';
import SubHeading from '@/components/internal-page/sub-heading';

type AgentGuideItem = {
  key: string;
  href: string;
  image: string;
  wide?: boolean;
};

const AGENT_GUIDES: AgentGuideItem[] = [
  {
    key: 'claude-code',
    href: '/claude-code-guide',
    image: '/images/resource-entry/agent-guides/claude-code.webp',
  },
  {
    key: 'openai-codex',
    href: '/openai-codex-guide',
    image: '/images/resource-entry/agent-guides/openai-codex.webp',
  },
  {
    key: 'hermes',
    href: '/hermes-agent-guide',
    image: '/images/resource-entry/agent-guides/hermes.webp',
  },
  {
    key: 'zcode',
    href: '/zcode-guide',
    image: '/images/resource-entry/agent-guides/zcode.webp',
  },
  {
    key: 'deepseek',
    href: '/deepseek-harness-guide',
    image: '/images/resource-entry/agent-guides/deepseek.webp',
    wide: true,
  },
  {
    key: 'mcp',
    href: '/mcp',
    image: '/images/resource-entry/agent-guides/flaq-mcp.webp',
    wide: true,
  },
];

export default async function AgentGuidesSection() {
  const t = await getTranslations('ResourceEntrySections.agentGuides');

  return (
    <section className='container-centered py-[60px]'>
      <div className='mb-8'>
        <SubHeading
          icon={<Bot className='hidden size-10 lg:block' strokeWidth={1.8} />}
          title={t('title')}
          description={t('description')}
          className='text-center lg:text-left'
        />
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {AGENT_GUIDES.map((guide) => (
          <a
            key={guide.key}
            href={getFlaqResourceUrl(guide.href)}
            target='_blank'
            rel='noopener noreferrer'
            className={cn('group block h-full', guide.wide && 'lg:col-span-2')}
          >
            <article
              className={cn(
                'border-color-b1 bg-color-1 hover:border-foreground/20 hover:bg-card flex h-full flex-col overflow-hidden rounded-lg border p-2.5 transition-colors duration-200',
                guide.wide && 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-3',
              )}
            >
              <div className='bg-foreground/5 aspect-video min-w-0 overflow-hidden rounded-md'>
                <img
                  src={guide.image}
                  alt={t(`items.${guide.key}.title`)}
                  className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.025]'
                  loading='lazy'
                  decoding='async'
                />
              </div>
              <div className='flex min-w-0 items-start gap-2.5 pt-3 lg:self-start'>
                <span className='bg-foreground/[0.07] flex size-[42px] shrink-0 items-center justify-center rounded-md'>
                  <Bot className='text-foreground/80 size-[22px]' />
                </span>
                <div className='min-w-0 flex-1'>
                  <h3 className='text-color-t1 group-hover:text-color-main line-clamp-1 text-sm leading-5 font-medium transition-colors'>
                    {t(`items.${guide.key}.title`)}
                  </h3>
                  <p
                    className={cn(
                      'text-color-t3 mt-1 text-xs leading-[18px]',
                      guide.wide ? 'line-clamp-3' : 'line-clamp-2',
                    )}
                  >
                    {t(`items.${guide.key}.description`)}
                  </p>
                </div>
              </div>
            </article>
          </a>
        ))}
      </div>
    </section>
  );
}
