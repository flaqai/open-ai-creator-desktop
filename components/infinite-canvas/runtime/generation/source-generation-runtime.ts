import { templateGenerationTransport } from './template-generation-transport';
import { translateInfiniteCanvasMessage as t } from '../i18n/infinite-canvas-translation';
import { nanoid } from 'nanoid';

import { type CanvasMusicTaskResult, type CanvasProjectGenerationTask, type CanvasProjectTaskType } from '@/components/infinite-canvas/types/project';

import type {
  InfiniteCanvasGenerationAccessInput,
  InfiniteCanvasGenerationTransport,
  InfiniteCanvasIntegrations,
} from '../../infinite-canvas.types';
import type { UploadedFile } from '../../services/file-storage';
import type { AiConfig } from '../../stores/use-config-store';
import type { ReferenceImage } from '../../types/image';
import type { ReferenceAudio, ReferenceVideo } from '../../types/media';
import {
  classifyCanvasObservationFailure,
  type CanvasGenerationBinding,
  toCanvasGenerationBinding,
} from './generation-bindings';
import {
  convertSourceImageRequest,
  convertSourceTextRequest,
  convertSourceVideoRequest,
  resolveSourceImageGenerationAccess,
  resolveSourceVideoGenerationAccess,
} from './source-network-converter';

export type SourceTextMessage = {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content:
    | string
    | readonly (
        | { readonly type: 'text'; readonly text: string }
        | {
            readonly type: 'image_url';
            readonly image_url: { readonly url: string };
          }
      )[];
};

export interface SourceGenerationBindingTarget {
  readonly projectId: string;
  readonly resultNodeId: string;
  readonly resultSlotId?: string;
}

type RequestOptions = {
  readonly binding?: SourceGenerationBindingTarget;
  readonly onBindingAccepted?: (binding: CanvasGenerationBinding) => void;
  readonly onBindingCompleted?: (taskId: string, resultUrl: string) => void;
  readonly onBindingFailed?: (taskId: string) => void;
  readonly signal?: AbortSignal;
};

type VideoRequestOptions = RequestOptions & {
  readonly videoToVideo?: boolean;
};

export type SourceRecoveredGeneration =
  | {
      readonly binding: CanvasGenerationBinding;
      readonly kind: 'music';
      readonly results: readonly CanvasMusicTaskResult[];
    }
  | {
      readonly binding: CanvasGenerationBinding;
      readonly kind: 'image';
      readonly url: string;
    }
  | {
      readonly binding: CanvasGenerationBinding;
      readonly kind: 'video';
      readonly url: string;
    }
  | {
      readonly binding: CanvasGenerationBinding;
      readonly kind: 'audio';
      readonly url: string;
    }
  | {
      readonly binding: CanvasGenerationBinding;
      readonly kind: '3d';
      readonly url: string;
    }
  | {
      readonly binding: CanvasGenerationBinding;
      readonly error: unknown;
      readonly kind: 'failed';
    };

export interface SourceGenerationRuntime {
  readonly requestMusicGeneration: (
    config: AiConfig,
    prompt: string,
    images: readonly ReferenceImage[],
    audios: readonly ReferenceAudio[],
    options?: RequestOptions,
  ) => Promise<{ readonly taskId: string; readonly results: readonly CanvasMusicTaskResult[] }>;
  readonly requestLyricsGeneration: (config: AiConfig, prompt: string, options?: RequestOptions) => Promise<string>;
  readonly requestThreeDGeneration: (
    config: AiConfig,
    prompt: string,
    references: readonly ReferenceImage[],
    options?: RequestOptions,
  ) => Promise<string>;
  readonly recoverProjectBindings: (
    projectId: string,
    tasks: readonly CanvasProjectGenerationTask[],
    options?: Pick<RequestOptions, 'onBindingCompleted' | 'onBindingFailed' | 'signal'>,
  ) => Promise<readonly SourceRecoveredGeneration[]>;
  readonly requestGeneration: (
    config: AiConfig,
    prompt: string,
    options?: RequestOptions,
  ) => Promise<readonly { readonly id: string; readonly dataUrl: string }[]>;
  readonly requestEdit: (
    config: AiConfig,
    prompt: string,
    references: readonly ReferenceImage[],
    mask?: ReferenceImage,
    options?: RequestOptions,
  ) => Promise<readonly { readonly id: string; readonly dataUrl: string }[]>;
  readonly requestVideoGeneration: (
    config: AiConfig,
    prompt: string,
    references?: readonly ReferenceImage[],
    videoReferences?: readonly ReferenceVideo[],
    audioReferences?: readonly ReferenceAudio[],
    options?: VideoRequestOptions,
  ) => Promise<UploadedFile>;
  readonly requestAudioGeneration: (
    config: AiConfig,
    prompt: string,
    options?: RequestOptions,
  ) => Promise<UploadedFile>;
  readonly requestImageQuestion: (
    config: AiConfig,
    messages: readonly SourceTextMessage[],
    onDelta: (text: string) => void,
    options?: RequestOptions,
  ) => Promise<string>;
}

interface RuntimeOptions {
  readonly generationTransport?: InfiniteCanvasGenerationTransport;
  readonly integrations: InfiniteCanvasIntegrations;
  readonly pollIntervalMs?: number;
}

function abortError(): DOMException {
  return new DOMException('Observation stopped. The accepted backend task continues.', 'AbortError');
}

class TerminalGenerationError extends Error {}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  assertNotAborted(signal);
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function sourceName(source: string, fallback: string): string {
  if (source.startsWith('data:') || source.startsWith('blob:')) return fallback;
  try {
    return new URL(source).pathname.split('/').at(-1) || fallback;
  } catch {
    return fallback;
  }
}

async function uploadSource(
  source: string,
  mimeType: string,
  purpose: 'image-reference' | 'video-reference' | 'audio-reference',
  integrations: InfiniteCanvasIntegrations,
  signal?: AbortSignal,
): Promise<string> {
  if (/^https?:\/\//i.test(source)) return source;
  assertNotAborted(signal);
  const response = await fetch(source, { signal });
  if (!response.ok) throw new Error(`Unable to read Infinite Canvas reference (${response.status}).`);
  const blob = await response.blob();
  const file = new File([blob], sourceName(source, `canvas-reference.${mimeType.split('/')[1] || 'bin'}`), {
    type: blob.type || mimeType,
  });
  const result = await integrations.upload({ files: [file], purpose, signal });
  if (result.status === 'success') {
    if (result.files[0]?.url) return result.files[0].url;
    throw new Error('Infinite Canvas reference upload returned no durable URL.');
  }
  if (result.status === 'rejected') {
    throw abortError();
  }
  throw new Error(result.error.message, { cause: result.error.cause });
}

async function resolveImages(
  references: readonly ReferenceImage[],
  integrations: InfiniteCanvasIntegrations,
  signal?: AbortSignal,
): Promise<readonly string[]> {
  return Promise.all(
    references.map((reference) =>
      uploadSource(
        reference.url || reference.dataUrl,
        reference.type || 'image/png',
        'image-reference',
        integrations,
        signal,
      ),
    ),
  );
}

async function ensureAccess(
  integrations: InfiniteCanvasIntegrations,
  input: InfiniteCanvasGenerationAccessInput,
): Promise<void> {
  const access = await integrations.resolveGenerationAccess?.(input);
  if (access === undefined || access.allowed) return;
  integrations.onClientKeyRequired?.();
  throw new Error(`Infinite Canvas generation rejected: ${access.reason}`);
}

function referenceDurationSeconds(references: readonly { readonly durationMs?: number }[]): number | undefined {
  const durations = references
    .map((reference) => reference.durationMs)
    .filter(
      (duration): duration is number => typeof duration === 'number' && Number.isFinite(duration) && duration >= 0,
    );
  if (!durations.length) return undefined;
  return durations.reduce((total, duration) => total + duration, 0) / 1_000;
}

function createBinding(
  taskKind: CanvasProjectTaskType,
  taskId: string,
  target: SourceGenerationBindingTarget | undefined,
  onBindingAccepted: RequestOptions['onBindingAccepted'],
): CanvasGenerationBinding | undefined {
  if (target === undefined) return undefined;
  const binding: CanvasGenerationBinding = {
    ...target,
    createdAt: new Date().toISOString(),
    taskId,
    taskKind,
  };
  onBindingAccepted?.(binding);
  return binding;
}

export function createSourceGenerationRuntime({
  generationTransport,
  integrations,
  pollIntervalMs = 2_500,
}: RuntimeOptions): SourceGenerationRuntime {
  const mediaSubmission = generationTransport ?? templateGenerationTransport;

  const observeTask = async (
    taskKind: Exclude<CanvasProjectTaskType, 'music'>,
    taskId: string,
    signal?: AbortSignal,
    onBindingFailed?: (taskId: string) => void,
    onBindingCompleted?: (taskId: string, resultUrl: string) => void,
  ): Promise<string> => {
    for (;;) {
      assertNotAborted(signal);
      // eslint-disable-next-line no-await-in-loop
      const result = await (
        taskKind === 'image' && mediaSubmission.getImageTask
          ? mediaSubmission.getImageTask(taskId, { signal })
          : taskKind === 'video' && mediaSubmission.getVideoTask
            ? mediaSubmission.getVideoTask(taskId, { signal })
            : taskKind === '3d'
              ? generationTransport?.getThreeDTask
                ? generationTransport.getThreeDTask(taskId, { signal })
                : Promise.reject(new TerminalGenerationError('3D task observation is not configured.'))
              : Promise.reject(new TerminalGenerationError(t('modelAdapter.unavailable')))
      ).catch((error: unknown) => {
        if (!signal?.aborted && classifyCanvasObservationFailure(error) === 'client-key-required') {
          integrations.onClientKeyRequired?.();
        }
        throw error;
      });
      assertNotAborted(signal);
      if (result.status === 'completed' && result.resultUrl) {
        if (!/^https?:\/\//i.test(result.resultUrl))
          throw new Error('Canvas generation returned no durable result URL.');
        onBindingCompleted?.(taskId, result.resultUrl);
        return result.resultUrl;
      }
      if (result.status === 'fail') {
        onBindingFailed?.(taskId);
        throw new TerminalGenerationError(result.error || `${taskKind} generation failed.`);
      }
      // eslint-disable-next-line no-await-in-loop
      await wait(pollIntervalMs, signal);
    }
  };

  const observeImage = async (
    taskId: string,
    signal?: AbortSignal,
    onBindingFailed?: (taskId: string) => void,
    onBindingCompleted?: (taskId: string, resultUrl: string) => void,
  ): Promise<string[]> => [await observeTask('image', taskId, signal, onBindingFailed, onBindingCompleted)];

  const observeVideo = (
    taskId: string,
    signal?: AbortSignal,
    onBindingFailed?: (taskId: string) => void,
    onBindingCompleted?: (taskId: string, resultUrl: string) => void,
  ): Promise<string> => observeTask('video', taskId, signal, onBindingFailed, onBindingCompleted);

  const observeMusic = async (taskId: string, signal?: AbortSignal): Promise<readonly CanvasMusicTaskResult[]> => {
    for (;;) {
      assertNotAborted(signal);
      try {
        // eslint-disable-next-line no-await-in-loop
        if (!integrations.getMusicTask) throw new TerminalGenerationError(t('modelAdapter.unavailable'));
        const response = await integrations.getMusicTask(taskId, signal);
        assertNotAborted(signal);
        if (!Array.isArray(response)) throw new TerminalGenerationError('Invalid music task response.');
        if (
          response.length &&
          response.every((item) => item.status === 'completed' || item.status === 'fail')
        ) {
          if (
            response.some((item) => !item.id || (item.status === 'completed' && !/^https?:\/\//i.test(item.url)))
          )
            throw new TerminalGenerationError('Music generation returned an invalid result.');
          return response;
        }
      } catch (error) {
        if (error instanceof TerminalGenerationError || classifyCanvasObservationFailure(error) !== 'transient')
          throw error;
      }
      // eslint-disable-next-line no-await-in-loop
      await wait(pollIntervalMs, signal);
    }
  };

  const recoverBinding = async (
    binding: CanvasGenerationBinding,
    signal?: AbortSignal,
    onBindingFailed?: (taskId: string) => void,
    onBindingCompleted?: (taskId: string, resultUrl: string) => void,
  ): Promise<SourceRecoveredGeneration> => {
    try {
      assertNotAborted(signal);
      if (binding.taskKind === 'music')
        return { binding, kind: 'music', results: await observeMusic(binding.taskId, signal) };
      if (binding.resultUrl && /^https?:\/\//i.test(binding.resultUrl)) {
        return { binding, kind: binding.taskKind, url: binding.resultUrl };
      }
      for (;;) {
        try {
          if (binding.taskKind === 'image') {
            // eslint-disable-next-line no-await-in-loop
            const urls = await observeImage(binding.taskId, signal, onBindingFailed, onBindingCompleted);
            return { binding, kind: 'image', url: urls[0] ?? '' };
          }
          if (binding.taskKind === 'video') {
            // eslint-disable-next-line no-await-in-loop
            const url = await observeVideo(binding.taskId, signal, onBindingFailed, onBindingCompleted);
            return { binding, kind: 'video', url };
          }
          if (binding.taskKind === '3d') {
            // eslint-disable-next-line no-await-in-loop
            const url = await observeTask('3d', binding.taskId, signal, onBindingFailed, onBindingCompleted);
            return { binding, kind: '3d', url };
          }
          throw new TerminalGenerationError('Unsupported generation task.');
        } catch (error) {
          if (error instanceof TerminalGenerationError) throw error;
          if (classifyCanvasObservationFailure(error) !== 'transient') throw error;
          // Accepted paid tasks survive temporary observation failures.
          // eslint-disable-next-line no-await-in-loop
          await wait(pollIntervalMs, signal);
        }
      }
    } catch (error) {
      return { binding, error, kind: 'failed' };
    }
  };

  const generateImages = async (
    config: AiConfig,
    prompt: string,
    references: readonly ReferenceImage[],
    mask: ReferenceImage | undefined,
    options?: RequestOptions,
  ) => {
    assertNotAborted(options?.signal);
    await ensureAccess(integrations, {
      mode: 'image',
      ...resolveSourceImageGenerationAccess(config, references.length),
    });
    const referenceUrls = await resolveImages(references, integrations, options?.signal);
    const maskUrl = mask === undefined ? undefined : (await resolveImages([mask], integrations, options?.signal))[0];
    const response = await mediaSubmission.submitImage(
      convertSourceImageRequest({ config, maskUrl, prompt, referenceUrls }),
    );
    if (!response.taskId) throw new Error('Image generation returned no task id.');
    const binding = createBinding('image', response.taskId, options?.binding, options?.onBindingAccepted);
    assertNotAborted(options?.signal);
    const urls = await observeImage(
      response.taskId,
      options?.signal,
      binding === undefined ? undefined : options?.onBindingFailed,
      binding === undefined ? undefined : options?.onBindingCompleted,
    );
    return urls.map((dataUrl) => ({ dataUrl, id: nanoid() }));
  };

  return {
    async requestLyricsGeneration(config, prompt, options) {
      const music = config.modelAdapter?.music;
      if (!music?.lyrics || !integrations.generateLyrics || !prompt.trim())
        throw new Error('Lyrics generation is unavailable.');
      await ensureAccess(integrations, { mode: 'lyrics', model: '' });
      assertNotAborted(options?.signal);
      const content = await integrations.generateLyrics({
        prompt,
        language: String(config.music?.language || music.lyrics.defaultLanguage),
        signal: options?.signal,
      });
      assertNotAborted(options?.signal);
      if (!content) throw new Error('Lyrics generation returned no text.');
      return content;
    },
    async requestMusicGeneration(config, prompt, images, audios, options) {
      const music = config.modelAdapter?.music;
      if (!music) throw new Error('Music generation is unavailable.');
      const input = {
        prompt,
        connectedText: config.musicConnectedText,
        imageCount: images.length,
        audioCount: audios.length,
        videoCount: 0,
        audioDurationSeconds: referenceDurationSeconds(audios),
      };
      await ensureAccess(integrations, { mode: 'music', ...music.resolveAccess(config, input) });
      const imageUrls = await resolveImages(images, integrations, options?.signal);
      const audioUrls = await Promise.all(
        audios.map((audio) =>
          uploadSource(audio.url, audio.type || 'audio/mpeg', 'audio-reference', integrations, options?.signal),
        ),
      );
      assertNotAborted(options?.signal);
      if (!integrations.generateMusic) throw new Error(t('modelAdapter.unavailable'));
      const response = await integrations.generateMusic(music.convertRequest(config, { ...input, imageUrls, audioUrls }));
      if (!response.taskId) throw new Error('Music generation returned no task id.');
      createBinding('music', response.taskId, options?.binding, options?.onBindingAccepted);
      return { taskId: response.taskId, results: await observeMusic(response.taskId, options?.signal) };
    },
    async requestThreeDGeneration(config, prompt, references, options) {
      assertNotAborted(options?.signal);
      const capability = config.modelAdapter?.threeD;
      if (!capability || !generationTransport?.submitThreeD || !generationTransport.getThreeDTask)
        throw new Error('3D generation is not configured.');
      await ensureAccess(integrations, {
        mode: '3d',
        ...capability.resolveAccess(config, prompt, references.length),
      });
      const referenceUrls = await resolveImages(references, integrations, options?.signal);
      assertNotAborted(options?.signal);
      const response = await generationTransport.submitThreeD({ model: config.model, prompt, referenceUrls });
      if (!response.taskId) throw new Error('3D generation returned no task id.');
      // Persist the paid task before checking cancellation so reopening can resume observation.
      createBinding('3d', response.taskId, options?.binding, options?.onBindingAccepted);
      return observeTask('3d', response.taskId, options?.signal, options?.onBindingFailed, options?.onBindingCompleted);
    },
    async recoverProjectBindings(projectId, tasks, options) {
      return Promise.all(
        tasks.map((task) =>
          recoverBinding(
            toCanvasGenerationBinding(projectId, task),
            options?.signal,
            options?.onBindingFailed,
            options?.onBindingCompleted,
          ),
        ),
      );
    },
    requestGeneration(config, prompt, options) {
      return generateImages(config, prompt, [], undefined, options);
    },
    requestEdit(config, prompt, references, mask, options) {
      return generateImages(config, prompt, references, mask, options);
    },
    async requestVideoGeneration(config, prompt, references = [], videoReferences = [], audioReferences = [], options) {
      assertNotAborted(options?.signal);
      await ensureAccess(integrations, {
        mode: 'video',
        ...resolveSourceVideoGenerationAccess({
          audioCount: audioReferences.length,
          config,
          imageCount: references.length,
          referenceDurationSeconds: referenceDurationSeconds([...videoReferences, ...audioReferences]),
          referenceVideoDurationSeconds: referenceDurationSeconds(videoReferences),
          referenceAudioDurationSeconds: referenceDurationSeconds(audioReferences),
          videoCount: videoReferences.length,
          videoToVideo: options?.videoToVideo,
        }),
      });
      const [imageUrls, videoUrls, audioUrls] = await Promise.all([
        resolveImages(references, integrations, options?.signal),
        Promise.all(
          videoReferences.map((reference) =>
            uploadSource(
              reference.url,
              reference.type || 'video/mp4',
              'video-reference',
              integrations,
              options?.signal,
            ),
          ),
        ),
        Promise.all(
          audioReferences.map((reference) =>
            uploadSource(
              reference.url,
              reference.type || 'audio/mpeg',
              'audio-reference',
              integrations,
              options?.signal,
            ),
          ),
        ),
      ]);
      const response = await mediaSubmission.submitVideo(
        convertSourceVideoRequest({
          audioUrls,
          referenceAudioDurationSeconds: referenceDurationSeconds(audioReferences),
          config,
          imageUrls,
          prompt,
          videoToVideo: options?.videoToVideo,
          videoUrls,
        }),
      );
      if (!response.taskId) throw new Error('Video generation returned no task id.');
      const binding = createBinding('video', response.taskId, options?.binding, options?.onBindingAccepted);
      return {
        bytes: 0,
        mimeType: 'video/mp4',
        storageKey: '',
        url: await observeVideo(
          response.taskId,
          options?.signal,
          binding === undefined ? undefined : options?.onBindingFailed,
          binding === undefined ? undefined : options?.onBindingCompleted,
        ),
      };
    },
    async requestAudioGeneration(config, prompt, options) {
      assertNotAborted(options?.signal);
      if (!integrations.generateAudio) throw new Error(t('modelAdapter.unavailable'));
      return integrations.generateAudio(config, prompt, options?.signal);
    },
    async requestImageQuestion(config, _messages, _onDelta, options) {
      assertNotAborted(options?.signal);
      await ensureAccess(integrations, {
        mode: 'text',
        model: config.model || config.textModel,
      });
      return convertSourceTextRequest();
    },
  };
}
