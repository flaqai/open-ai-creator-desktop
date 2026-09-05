'use client';

import { useEffect } from 'react';
import useUnifiedGeneratorStore from '@/store/unified-generator/useUnifiedGeneratorStore';

import UnifiedGeneratorForm from '@/components/unified-generator/UnifiedGeneratorForm';

export default function ReferenceToVideoForm() {
  const openReferenceDraft = useUnifiedGeneratorStore((state) => state.openReferenceDraft);

  useEffect(() => {
    openReferenceDraft();
  }, [openReferenceDraft]);

  return <UnifiedGeneratorForm submitMode='transfer' />;
}
