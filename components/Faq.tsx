import { cn } from '@/lib/utils';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export default function Faq({
  title,
  faqList,
  className,
}: {
  title: string;
  faqList: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <section className={cn('max-w-pc mx-auto w-full space-y-8', className)}>
      <h2 className='text-center text-2xl font-bold lg:pb-3 lg:text-3xl'>{title}</h2>
      <Accordion type='single' collapsible className='w-full px-3 lg:px-0'>
        {faqList.map((item, index) => (
          <AccordionItem
            key={index}
            value={item.question}
            className='border-main-gray w-full border-b-1 last:border-b-1'
          >
            <AccordionTrigger className='hover:text-color-main py-3 text-left text-base font-semibold hover:cursor-pointer hover:no-underline lg:text-lg [&>svg]:h-6 [&>svg]:w-6'>
              {item.question}
            </AccordionTrigger>
            <AccordionContent className='pb-5 text-base whitespace-pre-line text-white/70'>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
