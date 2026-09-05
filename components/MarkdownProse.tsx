/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-target-blank */
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

export default function MarkdownProse({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <article className={cn('prose prose-invert max-w-none!', className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        // components={{
        //   a: ({ children, href }) => (
        //     <a href={href} target='_blank' rel='nofollow'>
        //       {children}
        //     </a>
        //   ),
        // }}
      >
        {markdown}
      </Markdown>
    </article>
  );
}
