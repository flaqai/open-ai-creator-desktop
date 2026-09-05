export type ModelIconBackground = 'dark' | 'light';

export type ModelIconConfig = {
  src: string;
  background: ModelIconBackground;
};

export const getModelIconConfig = (modelValue: string): ModelIconConfig => {
  const lowerValue = modelValue.toLowerCase();

  if (lowerValue.startsWith('wan') || lowerValue.startsWith('qwen') || lowerValue.startsWith('z-image')) {
    return { src: '/images/model-provider/wan.svg', background: 'dark' };
  }
  if (lowerValue.startsWith('kling')) {
    return { src: '/images/model-provider/kling.svg', background: 'dark' };
  }
  if (lowerValue.startsWith('veo')) {
    return { src: '/images/model-icon/veo.svg', background: 'dark' };
  }
  if (lowerValue.startsWith('vidu')) {
    return { src: '/images/model-icon/vidu.svg', background: 'dark' };
  }

  if (lowerValue.startsWith('seedance') || lowerValue.startsWith('seedream') || lowerValue.startsWith('bytedance')) {
    return { src: '/images/model-provider/bytedance.svg', background: 'dark' };
  }

  if (lowerValue.startsWith('flux') || lowerValue.startsWith('black-forest-labs')) {
    return { src: '/images/model-provider/flux.svg', background: 'light' };
  }

  if (lowerValue.startsWith('minimax')) {
    return { src: '/images/model-provider/minimax.svg', background: 'dark' };
  }

  if (lowerValue.startsWith('happyhorse') || lowerValue.startsWith('happy-horse')) {
    return { src: '/images/model-provider/happy_horse.svg', background: 'dark' };
  }

  if (lowerValue.startsWith('gemini') || lowerValue.startsWith('nano-banana')) {
    return { src: '/images/model-icon/veo.svg', background: 'dark' };
  }

  if (lowerValue.startsWith('gpt')) {
    return { src: '/images/model-icon/openai.svg', background: 'dark' };
  }

  return { src: '', background: 'dark' };
};

export const getModelIcon = (modelValue: string): string => getModelIconConfig(modelValue).src;
