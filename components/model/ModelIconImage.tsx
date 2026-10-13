import { cn } from '@/lib/utils';
import type { ModelIconConfig } from '@/lib/utils/modelIcons';

type ModelIconImageProps = {
  icon: ModelIconConfig;
  alt?: string;
  className?: string;
};

export function ModelIconImage({ icon, alt = '', className }: ModelIconImageProps) {
  if (!icon.src) return null;
  const imageClassName = cn('size-full object-contain', className);
  if (!icon.lightSrc && !icon.invertOnLight) return <img src={icon.src} alt={alt} className={imageClassName} />;

  return (
    <>
      <img
        src={icon.lightSrc || icon.src}
        alt={alt}
        className={cn(imageClassName, 'dark:hidden', icon.invertOnLight && 'invert')}
      />
      <img src={icon.src} alt={alt} className={cn(imageClassName, 'hidden dark:block')} />
    </>
  );
}
