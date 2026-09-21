'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, Check, Copy, Expand, Image as ImageIcon, Sparkles, Video } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { openExternalUrl } from '@/lib/platform/navigation';
import { PROMPT_COLLECTIONS, PROMPT_SNAPSHOT_DATE, type RecommendedPrompt } from '@/lib/recommended-prompts';
import { Button } from '@/components/ui/button';
import PromptDetailDialog, { PromptMedia } from '@/components/prompts/PromptDetailDialog';

export default function RecommendedPrompts() {
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const [selected, setSelected] = useState<RecommendedPrompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPrompt = async (prompt: RecommendedPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopiedId(prompt.id);
      window.setTimeout(() => setCopiedId((current) => (current === prompt.id ? null : current)), 1_800);
      toast.success(zh ? '完整提示词已复制。' : 'Full prompt copied.');
    } catch {
      toast.error(zh ? '无法访问剪贴板。' : 'Could not access the clipboard.');
    }
  };

  return (
    <main className='min-h-[calc(100vh-64px)] w-full px-5 py-6 md:px-8 lg:px-10'>
      <div className='mx-auto max-w-[1500px]'>
        <header className='border-border bg-card relative overflow-hidden rounded-[30px] border px-6 py-8 md:px-9 md:py-10'>
          <div className='from-primary pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r via-fuchsia-400 to-sky-400/70' />
          <div className='bg-primary/12 pointer-events-none absolute -top-28 -right-16 size-80 rounded-full blur-3xl' />
          <div className='relative grid gap-7 xl:grid-cols-[1fr_auto] xl:items-end'>
            <div className='max-w-3xl'>
              <div className='text-primary mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase'>
                <Sparkles className='size-4' />
                {zh ? 'Flaq 创作灵感' : 'Flaq creative inspiration'}
              </div>
              <h1 className='text-foreground text-3xl font-semibold tracking-tight md:text-4xl'>
                {zh ? '提示词素材库' : 'Prompt media library'}
              </h1>
              <p className='text-muted-foreground mt-3 max-w-2xl text-sm leading-6 md:text-base'>
                {zh
                  ? '按模型浏览完整示例，复制原始提示词，查看对应图片与视频。图片已随客户端保存，视频需要联网播放。'
                  : 'Browse complete examples by model, copy the original prompts, and view their matching images or videos. Images are stored in the app; videos stream online.'}
              </p>
            </div>
            <div className='border-border bg-background/70 text-muted-foreground rounded-2xl border px-4 py-3 text-xs leading-5 backdrop-blur-sm'>
              <p className='text-foreground font-semibold'>{zh ? '固定内容快照' : 'Fixed content snapshot'}</p>
              <p>{PROMPT_SNAPSHOT_DATE}</p>
            </div>
          </div>
          <nav
            aria-label={zh ? '模型分区' : 'Model collections'}
            className='relative mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-4'
          >
            {PROMPT_COLLECTIONS.map((collection) => (
              <a
                key={collection.id}
                href={`#${collection.id}`}
                className='border-border bg-background/75 hover:border-primary/40 hover:bg-accent focus-visible:ring-ring group flex items-center gap-3 rounded-2xl border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none'
              >
                <img src={collection.prompts[0].media.image} alt='' className='size-12 rounded-xl object-cover' />
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-semibold'>{collection.model}</span>
                  <span className='text-muted-foreground mt-0.5 flex items-center gap-1 text-xs'>
                    {collection.type === 'image' ? <ImageIcon className='size-3' /> : <Video className='size-3' />}
                    {zh ? `${collection.prompts.length} 个示例` : `${collection.prompts.length} examples`}
                  </span>
                </span>
              </a>
            ))}
          </nav>
        </header>

        <div className='mt-8 space-y-8'>
          {PROMPT_COLLECTIONS.map((collection, collectionIndex) => (
            <section
              key={collection.id}
              id={collection.id}
              aria-labelledby={`${collection.id}-title`}
              className='border-border bg-card scroll-mt-6 overflow-hidden rounded-[28px] border'
            >
              <div className='border-border flex flex-col gap-5 border-b p-5 md:flex-row md:items-center md:justify-between md:p-7'>
                <div className='flex min-w-0 items-center gap-4'>
                  <span className='bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-semibold'>
                    {String(collectionIndex + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className='text-muted-foreground mb-1 flex items-center gap-2 text-xs'>
                      {collection.type === 'image' ? (
                        <ImageIcon className='size-3.5' />
                      ) : (
                        <Video className='size-3.5' />
                      )}
                      {zh ? collection.description.zh : collection.description.en}
                    </div>
                    <h2 id={`${collection.id}-title`} className='text-2xl font-semibold tracking-tight'>
                      {collection.model}
                    </h2>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button asChild>
                    <Link href={collection.toolHref}>
                      {zh ? '打开创作工具' : 'Open creation tool'}
                      <ArrowUpRight className='size-4' />
                    </Link>
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      void openExternalUrl(collection.sourceUrl).catch((error) => toast.error(String(error)))
                    }
                  >
                    {zh ? '查看网页原合集' : 'View source collection'}
                    <ArrowUpRight className='size-4' />
                  </Button>
                </div>
              </div>

              <div className='grid gap-4 p-4 md:grid-cols-2 md:p-5 xl:grid-cols-3'>
                {collection.prompts.map((prompt, promptIndex) => (
                  <article
                    key={prompt.id}
                    className='border-border bg-background/65 flex min-h-[430px] flex-col overflow-hidden rounded-2xl border'
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '460px' }}
                  >
                    <div className='bg-muted relative aspect-video overflow-hidden'>
                      <PromptMedia prompt={prompt} zh={zh} compact />
                      <span className='absolute top-3 left-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-md'>
                        {String(promptIndex + 1).padStart(2, '0')}
                      </span>
                      {prompt.media.type === 'video' ? (
                        <span className='absolute top-3 right-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur-md'>
                          {zh ? '在线视频' : 'Online video'}
                        </span>
                      ) : null}
                    </div>
                    <div className='flex flex-1 flex-col p-4'>
                      <h3 className='text-sm leading-6 font-semibold'>{prompt.title}</h3>
                      <p className='text-muted-foreground mt-3 line-clamp-6 text-xs leading-5 whitespace-pre-line'>
                        {prompt.prompt}
                      </p>
                      <div className='mt-auto grid grid-cols-2 gap-2 pt-5'>
                        <Button type='button' variant='outline' onClick={() => setSelected(prompt)}>
                          <Expand className='size-4' />
                          {zh ? '查看完整内容' : 'View full'}
                        </Button>
                        <Button type='button' onClick={() => void copyPrompt(prompt)}>
                          {copiedId === prompt.id ? <Check className='size-4' /> : <Copy className='size-4' />}
                          {copiedId === prompt.id ? (zh ? '已复制' : 'Copied') : zh ? '复制提示词' : 'Copy prompt'}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <PromptDetailDialog
        prompt={selected}
        zh={zh}
        copied={selected ? copiedId === selected.id : false}
        onCopy={(prompt) => void copyPrompt(prompt)}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
