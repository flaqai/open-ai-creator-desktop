import { Copy, Eye, FolderOpen, ImagePlus, Pause, Play, Save, Trash2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

import { writeClipboardText } from '@/lib/platform/clipboard';
import { mediaFileName, saveMedia } from '@/lib/platform/media';

import { appMenuCommand, type ContextAction } from './context-actions';
import { isNativeDesktop } from './runtime';

export interface ContextMedia {
  url: string;
  kind: 'image' | 'video' | 'audio' | 'file';
  name?: string;
  prompt?: string;
  localPath?: string;
}

export const MEDIA_REUSE_EVENT = 'flaq:reuse-media';
let pendingReuse: { media: ContextMedia; route: string } | null = null;
export function requestMediaReuse(media: ContextMedia, route: string, zh: boolean) {
  pendingReuse = { media, route };
  const request = pendingReuse;
  window.setTimeout(() => {
    if (pendingReuse !== request) return;
    pendingReuse = null;
    toast.error(zh ? '目标工具没有可用的素材位置，或素材格式不受支持' : 'No compatible reference slot is available.');
  }, 30_000);
  appMenuCommand(`route:${route}`);
  window.dispatchEvent(new Event(MEDIA_REUSE_EVENT));
}
export function takeMediaReuse(kind: string) {
  if (
    !pendingReuse ||
    pendingReuse.media.kind !== kind ||
    !location.pathname.replace(/\/$/, '').endsWith(pendingReuse.route)
  )
    return null;
  const media = pendingReuse.media;
  pendingReuse = null;
  return media;
}

export function mediaContextActions(
  media: ContextMedia,
  zh: boolean,
  callbacks: { view?: () => void; remove?: () => void; reuse?: boolean } = {},
): ContextAction[] {
  const actions: ContextAction[] = [];
  if (callbacks.view)
    actions.push({ id: 'view', label: zh ? '查看详情' : 'View details', icon: Eye, run: callbacks.view });
  if (media.prompt)
    actions.push({
      id: 'copy-prompt',
      label: zh ? '复制提示词' : 'Copy prompt',
      icon: Copy,
      run: async () => {
        await writeClipboardText(media.prompt!);
        toast.success(zh ? '提示词已复制' : 'Prompt copied');
      },
    });
  if (media.url)
    actions.push({
      id: 'save',
      label: zh ? '另存为…' : 'Save as…',
      icon: Save,
      run: async () => {
        if (await saveMedia(media.url, mediaFileName(media.url, media.name || `flaq-${media.kind}`)))
          toast.success(zh ? '已保存' : 'Saved');
      },
    });
  if (media.localPath && isNativeDesktop())
    actions.push({
      id: 'reveal',
      label: /Mac/i.test(navigator.platform)
        ? zh
          ? '在 Finder 中显示'
          : 'Show in Finder'
        : zh
          ? '在文件资源管理器中显示'
          : 'Show in File Explorer',
      icon: FolderOpen,
      run: async () => {
        const { invoke } = await import('@tauri-apps/api/core');
        try {
          await invoke('reveal_media_file', { path: media.localPath });
        } catch {
          throw new Error(
            zh
              ? '无法定位本地文件，文件可能已被移动或删除'
              : 'Cannot locate the local file. It may have been moved or deleted.',
          );
        }
      },
    });
  if (callbacks.reuse !== false && media.url && ['image', 'video'].includes(media.kind)) {
    const targets =
      media.kind === 'image'
        ? [
            ['/image-to-image', zh ? '图像转图像' : 'Image to image'],
            ['/image-to-video', zh ? '图片转视频' : 'Image to video'],
            ['/reference-to-video', zh ? '参考素材转视频' : 'Reference to video'],
          ]
        : [['/reference-to-video', zh ? '参考素材转视频' : 'Reference to video']];
    actions.push({
      id: 'reuse',
      label: zh ? '作为素材使用' : 'Use as reference',
      icon: ImagePlus,
      children: targets.map(([route, label]) => ({ id: route, label, run: () => requestMediaReuse(media, route, zh) })),
    });
  }
  if (callbacks.remove)
    actions.push({
      id: 'remove',
      label: zh ? '移除记录' : 'Remove record',
      icon: Trash2,
      separator: true,
      destructive: true,
      run: callbacks.remove,
    });
  return actions;
}

export function videoPlaybackContextActions(player: HTMLVideoElement, zh: boolean): ContextAction[] {
  return [
    {
      id: 'playback',
      label: player.paused ? (zh ? '播放' : 'Play') : zh ? '暂停' : 'Pause',
      icon: player.paused ? Play : Pause,
      run: () => (player.paused ? player.play() : player.pause()),
    },
    {
      id: 'mute',
      label: player.muted ? (zh ? '取消静音' : 'Unmute') : zh ? '静音' : 'Mute',
      icon: player.muted ? Volume2 : VolumeX,
      run: () => {
        player.muted = !player.muted;
      },
    },
  ];
}
