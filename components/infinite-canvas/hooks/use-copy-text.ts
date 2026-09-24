// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import copy from '../runtime/files/source-copy';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { App } from '../runtime/ui/source-ui';

export function useCopyText() {
  const { message } = App.useApp();
  const { t } = useInfiniteCanvasTranslation();

  return (value: string, successText = t('common.copied')) => {
    copy(value);
    message.success(successText);
  };
}
