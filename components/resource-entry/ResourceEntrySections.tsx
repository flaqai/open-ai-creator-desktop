import AffiliatePromotionSection from './AffiliatePromotionSection';
import AgentGuidesSection from './AgentGuidesSection';
import ModelMarketPromotionSection from './ModelMarketPromotionSection';
import PromptCollectionsSection from './PromptCollectionsSection';

export default function ResourceEntrySections({ includeAgentGuides = false }: { includeAgentGuides?: boolean }) {
  return (
    <>
      <PromptCollectionsSection />
      {includeAgentGuides ? <AgentGuidesSection /> : null}
      <ModelMarketPromotionSection />
      <AffiliatePromotionSection />
    </>
  );
}
