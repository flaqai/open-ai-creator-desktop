import type { TemplateModelConfig } from '../types';

export const GPT_IMAGE_MODELS: TemplateModelConfig[] = [
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-edit',
    label: 'GPT Image 2 Edit',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-client',
    label: 'GPT Image 2 Client',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-edit-client',
    label: 'GPT Image 2 Edit Client',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-edit-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'chatgpt-images-2.5',
    label: 'ChatGPT Images 2.5',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'chatgpt-images-2.5',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k'],
    },
  },
  {
    id: 'chatgpt-images-2.5-edit',
    label: 'ChatGPT Images 2.5 Edit',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'chatgpt-images-2.5-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k'],
    },
  },
  {
    id: 'chatgpt-images-2.5-client',
    label: 'ChatGPT Images 2.5 Client',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'chatgpt-images-2.5-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k'],
    },
  },
  {
    id: 'chatgpt-images-2.5-edit-client',
    label: 'ChatGPT Images 2.5 Edit Client',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'chatgpt-images-2.5-edit-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k'],
    },
  },
  {
    id: 'gpt-image-2.5-flare',
    label: 'ChatGPT Images 2.5 Flare',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2.5-flare',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k', '4k'],
      quality: ['medium', 'low', 'high', 'xhigh', 'max'],
    },
  },
  {
    id: 'gpt-image-2.5-flare-edit',
    label: 'ChatGPT Images 2.5 Flare Edit',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2.5-flare-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k', '4k'],
      quality: ['medium', 'low', 'high', 'xhigh', 'max'],
    },
  },
  {
    id: 'gpt-image-2.5-sunburst',
    label: 'ChatGPT Images 2.5 Sunburst',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2.5-sunburst',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k', '4k'],
      quality: ['medium', 'low', 'high', 'xhigh', 'max'],
    },
  },
  {
    id: 'gpt-image-2.5-sunburst-edit',
    label: 'ChatGPT Images 2.5 Sunburst Edit',
    mediaType: 'image',
    provider: 'openai',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2.5-sunburst-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k', '4k'],
      quality: ['medium', 'low', 'high', 'xhigh', 'max'],
    },
  },
];
