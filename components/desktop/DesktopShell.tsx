'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Link, usePathname } from '@/i18n/navigation';
import { OPEN_API_CONFIG_CHANGED_EVENT } from '@/network/clientFetch';
import { isApiConnectionAuthorized } from '@/network/connection-status';
import packageInfo from '@/package.json';
import {
  BookOpenText,
  ExternalLink,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Image,
  Info,
  LibraryBig,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Video,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { openDesktopLogDirectory, writeDesktopLog } from '@/lib/desktop/logging';
import { mediaDirectoryPreferences, type MediaStorageSettings } from '@/lib/desktop/media-storage';
import { DEFAULT_PREFERENCES, parsePreferences, PREFERENCES_KEY, type AppPreferences } from '@/lib/desktop/preferences';
import { isNativeDesktop, OPEN_DESKTOP_SETTINGS_EVENT } from '@/lib/desktop/runtime';
import { FEATURE_MODULES } from '@/lib/features/catalog';
import { openExternalUrl } from '@/lib/platform/navigation';
import { useDesktopRuntime } from '@/hooks/use-desktop-runtime';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import DesktopTitleBar, { useWindowsDesktopFrame } from '@/components/desktop/DesktopTitleBar';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const ConnectionSettings = dynamic(() => import('@/components/dialog/OpenApiSettingsDialog'));
const MediaLibrary = dynamic(() => import('@/components/media-library/MediaLibrary'));
type Section = 'general' | 'appearance' | 'connection' | 'library' | 'about';
const sectionIcons = {
  general: SlidersHorizontal,
  appearance: Palette,
  connection: Plug,
  library: LibraryBig,
  about: Info,
};

function SidebarLabel({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return (
    <span
      aria-hidden={collapsed}
      className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        collapsed ? 'max-w-0 -translate-x-1.5 opacity-0' : 'max-w-40 translate-x-0 opacity-100'
      }`}
    >
      {children}
    </span>
  );
}

export default function DesktopShell({ children }: { children: ReactNode }) {
  const desktop = useDesktopRuntime();
  const windowsFrame = useWindowsDesktopFrame();
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<MediaStorageSettings | null>(null);
  const [mediaSettingsBusy, setMediaSettingsBusy] = useState(false);
  const [section, setSection] = useState<Section>('general');
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const labels = zh
    ? { general: '通用', appearance: '外观', connection: '连接', library: '历史记录', about: '关于' }
    : {
        general: 'General',
        appearance: 'Appearance',
        connection: 'Connections',
        library: 'History',
        about: 'About',
      };
  const showSettings = (next: Section = 'general') => {
    setSection(next);
    setOpen(true);
  };

  useEffect(() => {
    if (!desktop) return;
    try {
      setPreferences(parsePreferences(localStorage.getItem(PREFERENCES_KEY)));
    } catch {
      toast.error(zh ? '无法读取本地偏好设置' : 'Cannot read local preferences');
    }
    setLoaded(true);
    const refreshConnection = () => {
      void isApiConnectionAuthorized()
        .then(setConnected)
        .catch(() => setConnected(false));
    };
    refreshConnection();
    if (isNativeDesktop()) {
      void mediaDirectoryPreferences
        .load()
        .then(setMediaSettings)
        .catch((error) => toast.error(error instanceof Error ? error.message : String(error)));
    }
    const connection = () => showSettings('connection');
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        showSettings();
      }
    };
    window.addEventListener(OPEN_DESKTOP_SETTINGS_EVENT, connection);
    window.addEventListener(OPEN_API_CONFIG_CHANGED_EVENT, refreshConnection);
    window.addEventListener('keydown', key);
    const reportWindowError = (event: ErrorEvent) => {
      void writeDesktopLog(
        'error',
        'webview',
        `${event.message || 'Unhandled window error'} (${event.filename || 'unknown'}:${event.lineno || 0})`,
      );
    };
    const reportUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Unknown rejection');
      void writeDesktopLog('error', 'webview', `Unhandled promise rejection: ${reason}`);
    };
    window.addEventListener('error', reportWindowError);
    window.addEventListener('unhandledrejection', reportUnhandledRejection);
    let disposed = false;
    let unlisten: (() => void) | undefined;
    if (isNativeDesktop())
      void import('@tauri-apps/api/event')
        .then(async ({ listen }) => {
          const stop = await listen<string>('desktop-menu', ({ payload }) =>
            showSettings(payload === 'about' ? 'about' : 'general'),
          );
          if (disposed) stop();
          else unlisten = stop;
        })
        .catch(() => toast.error('Native menu connection failed'));
    return () => {
      disposed = true;
      unlisten?.();
      window.removeEventListener(OPEN_DESKTOP_SETTINGS_EVENT, connection);
      window.removeEventListener(OPEN_API_CONFIG_CHANGED_EVENT, refreshConnection);
      window.removeEventListener('keydown', key);
      window.removeEventListener('error', reportWindowError);
      window.removeEventListener('unhandledrejection', reportUnhandledRejection);
    };
  }, [desktop, zh]);

  useEffect(() => {
    if (!desktop || !loaded) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = preferences.theme === 'system' ? (media.matches ? 'dark' : 'light') : preferences.theme;
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.style.colorScheme = theme;
      if (isNativeDesktop())
        void import('@tauri-apps/api/window')
          .then(({ getCurrentWindow }) => getCurrentWindow().setTheme(preferences.theme === 'system' ? null : theme))
          .catch(() => toast.error(zh ? '原生窗口主题切换失败' : 'Could not change native window theme'));
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [desktop, loaded, preferences.theme, zh]);

  const update = (patch: Partial<AppPreferences>) => {
    const next = { ...preferences, ...patch };
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      setPreferences(next);
    } catch {
      toast.error(zh ? '设置保存失败，请检查本地存储' : 'Could not save preferences');
    }
  };
  const chooseMediaDirectory = async () => {
    setMediaSettingsBusy(true);
    try {
      const settings = await mediaDirectoryPreferences.choose();
      if (settings) setMediaSettings(settings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setMediaSettingsBusy(false);
    }
  };
  const resetMediaDirectory = async () => {
    setMediaSettingsBusy(true);
    try {
      setMediaSettings(await mediaDirectoryPreferences.reset());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setMediaSettingsBusy(false);
    }
  };
  const openMediaDirectory = async () => {
    try {
      await mediaDirectoryPreferences.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };
  const openLogDirectory = async () => {
    try {
      await openDesktopLogDirectory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };
  if (!desktop) return children;
  const collapsed = preferences.collapsed;
  const sidebarWidth = collapsed ? 76 : 224;
  const linkClass =
    `flex min-h-11 items-center rounded-xl text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring ` +
    `transition-[gap,padding,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${collapsed ? 'gap-0 px-4' : 'gap-3 px-3'}`;
  return (
    <div
      className='desktop-shell min-h-screen'
      style={{
        paddingInlineStart: sidebarWidth,
        paddingBlockStart: windowsFrame ? 44 : 0,
        minHeight: windowsFrame ? 'calc(100vh - 44px)' : '100vh',
      }}
    >
      <DesktopTitleBar sidebarWidth={sidebarWidth} zh={zh} />
      <aside
        aria-label={zh ? '主导航' : 'Main navigation'}
        className='desktop-sidebar border-border bg-card fixed inset-y-0 start-0 z-40 flex flex-col overflow-x-hidden border-e p-3'
        style={{ width: sidebarWidth, top: windowsFrame ? 44 : 0 }}
      >
        {!windowsFrame && (
          <div
            className={`mb-6 flex h-12 items-center transition-[gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${collapsed ? 'gap-0 px-2' : 'gap-2 px-1'}`}
          >
            <img src='/images/logo.png' alt='Flaq Creator' className='size-9 shrink-0' />
            <SidebarLabel collapsed={collapsed}>
              <strong className='text-sm'>Flaq Creator</strong>
            </SidebarLabel>
          </div>
        )}
        <nav className='flex-1 space-y-1 overflow-y-auto'>
          <Link
            href='/'
            title={zh ? '工作台' : 'Workspace'}
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`${linkClass} ${pathname === '/' ? 'bg-accent font-semibold' : ''}`}
          >
            <Home className='size-5 shrink-0' />
            <SidebarLabel collapsed={collapsed}>{zh ? '工作台' : 'Workspace'}</SidebarLabel>
          </Link>
          <Link
            href='/recommended-prompts'
            title={zh ? '素材库' : 'Media library'}
            aria-current={pathname.replace(/\/$/, '') === '/recommended-prompts' ? 'page' : undefined}
            className={`${linkClass} ${pathname.replace(/\/$/, '') === '/recommended-prompts' ? 'bg-accent text-primary font-semibold' : ''}`}
          >
            <BookOpenText className='size-5 shrink-0' />
            <SidebarLabel collapsed={collapsed}>{zh ? '素材库' : 'Media library'}</SidebarLabel>
          </Link>
          {(['workspace', 'image', 'video'] as const).map((group) => (
            <div key={group} className='space-y-1'>
              {group !== 'workspace' && (
                <p
                  aria-hidden={collapsed}
                  className={`text-muted-foreground overflow-hidden px-3 text-xs whitespace-nowrap transition-[max-height,padding,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    collapsed
                      ? 'max-h-0 -translate-x-1.5 py-0 opacity-0'
                      : 'max-h-10 translate-x-0 pt-5 pb-1 opacity-100'
                  }`}
                >
                  {group === 'image' ? (zh ? '图片工具' : 'Image tools') : zh ? '视频工具' : 'Video tools'}
                </p>
              )}
              {FEATURE_MODULES.filter((item) => item.group === group).map((item) => {
                const Icon = group === 'workspace' ? Sparkles : group === 'image' ? Image : Video;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={t(item.code)}
                    aria-current={pathname.replace(/\/$/, '') === item.href ? 'page' : undefined}
                    className={`${linkClass} ${pathname.replace(/\/$/, '') === item.href ? 'bg-accent text-primary font-semibold' : ''}`}
                  >
                    <Icon className='size-5 shrink-0' />
                    <SidebarLabel collapsed={collapsed}>{t(item.code)}</SidebarLabel>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className='border-border mt-3 space-y-1 border-t pt-3'>
          <button
            className={`${linkClass} w-full`}
            title={zh ? '设置 (⌘,)' : 'Settings (⌘,)'}
            onClick={() => showSettings()}
          >
            <Settings className='size-5 shrink-0' />
            <SidebarLabel collapsed={collapsed}>{zh ? '设置' : 'Settings'}</SidebarLabel>
          </button>
          <button
            className={`${linkClass} w-full`}
            title={zh ? '连接 Flaq' : 'Connect Flaq'}
            onClick={() => showSettings('connection')}
          >
            <span className='relative shrink-0'>
              <Plug className='size-5' />
              {connected ? (
                <span
                  aria-label={zh ? '已连接' : 'Connected'}
                  className='ring-card absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2'
                />
              ) : null}
            </span>
            <SidebarLabel collapsed={collapsed}>{zh ? '连接 Flaq' : 'Connect Flaq'}</SidebarLabel>
          </button>
          <button
            className={`${linkClass} w-full`}
            aria-expanded={!collapsed}
            title={zh ? '折叠或展开侧栏' : 'Toggle sidebar'}
            onClick={() => update({ collapsed: !collapsed })}
          >
            <span className='relative size-5 shrink-0'>
              <PanelLeftOpen
                className={`absolute inset-0 size-5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${collapsed ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
              />
              <PanelLeftClose
                className={`absolute inset-0 size-5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${collapsed ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
              />
            </span>
            <SidebarLabel collapsed={collapsed}>{zh ? '折叠侧栏' : 'Collapse'}</SidebarLabel>
          </button>
        </div>
      </aside>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='desktop-settings-panel bg-background text-foreground flex h-[85vh] max-h-[85vh] flex-col overflow-hidden sm:max-w-[800px]'>
          <DialogTitle className='shrink-0'>{zh ? '设置' : 'Settings'}</DialogTitle>
          <DialogDescription className='shrink-0'>
            {zh ? '管理此设备上的应用偏好与连接。' : 'Manage preferences and connections on this device.'}
          </DialogDescription>
          <div className='flex min-h-0 flex-1 gap-3'>
            <nav aria-label={zh ? '设置分类' : 'Settings sections'} className='w-32 shrink-0 space-y-1'>
              {(Object.keys(labels) as Section[]).map((id) => {
                const Icon = sectionIcons[id];
                return (
                  <button
                    key={id}
                    aria-current={section === id ? 'page' : undefined}
                    onClick={() => setSection(id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-start text-sm ${section === id ? 'bg-accent font-semibold' : 'hover:bg-muted'}`}
                  >
                    <Icon aria-hidden='true' className='size-4 shrink-0' strokeWidth={1.75} />
                    {labels[id]}
                  </button>
                );
              })}
            </nav>
            <section
              className='no-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto px-3 pb-3'
              aria-label={labels[section]}
            >
              {section === 'general' && (
                <div className='space-y-7'>
                  <div className='space-y-4'>
                    <h2 className='font-semibold'>{zh ? '界面语言' : 'Language'}</h2>
                    <LocaleSwitcher />
                    <p className='text-muted-foreground text-sm'>
                      {zh ? '更改会自动保存到此设备。' : 'Changes are saved on this device.'}
                    </p>
                  </div>
                  {isNativeDesktop() ? (
                    <div className='border-border space-y-6 border-t pt-6'>
                      <div className='space-y-4'>
                        <div>
                          <h2 className='font-semibold'>{zh ? '作品存储位置' : 'Media storage location'}</h2>
                          <p className='text-muted-foreground mt-1 text-sm'>
                            {zh
                              ? '生成的图片和视频会自动按年、月、日归档。'
                              : 'Generated images and videos are automatically organized by year, month, and day.'}
                          </p>
                        </div>
                        <Input
                          value={mediaSettings?.directory || (zh ? '正在读取…' : 'Loading…')}
                          readOnly
                          aria-label={zh ? '当前作品存储位置' : 'Current media storage location'}
                          className='bg-muted/40 font-mono text-xs'
                        />
                        <div className='flex flex-wrap gap-2'>
                          <Button
                            type='button'
                            onClick={() => void chooseMediaDirectory()}
                            disabled={mediaSettingsBusy}
                          >
                            {zh ? '选择文件夹' : 'Choose folder'}
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => void openMediaDirectory()}
                            disabled={!mediaSettings || mediaSettingsBusy}
                          >
                            <FolderOpen aria-hidden='true' className='size-4' />
                            {zh ? '打开文件夹' : 'Open folder'}
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => void resetMediaDirectory()}
                            disabled={!mediaSettings || mediaSettings.isDefault || mediaSettingsBusy}
                          >
                            {zh ? '恢复默认' : 'Restore default'}
                          </Button>
                        </div>
                      </div>
                      <div className='border-border space-y-3 border-t pt-5'>
                        <div>
                          <h2 className='font-semibold'>{zh ? '诊断与日志' : 'Diagnostics and logs'}</h2>
                          <p className='text-muted-foreground mt-1 text-sm'>
                            {zh
                              ? '日志只记录请求阶段、状态码和错误信息，不记录 Client Key 或请求内容。'
                              : 'Logs record request stages, status codes and errors, never the Client Key or request bodies.'}
                          </p>
                        </div>
                        <Button type='button' variant='outline' onClick={() => void openLogDirectory()}>
                          <FileText aria-hidden='true' className='size-4' />
                          {zh ? '打开日志文件目录' : 'Open log folder'}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              {section === 'appearance' && (
                <div className='space-y-4'>
                  <h2 className='font-semibold'>{zh ? '主题' : 'Theme'}</h2>
                  <div className='grid gap-3'>
                    {(['system', 'light', 'dark'] as const).map((theme, i) => (
                      <label
                        key={theme}
                        className='border-border flex cursor-pointer items-center gap-3 rounded-xl border p-4'
                      >
                        <input
                          type='radio'
                          name='theme'
                          checked={preferences.theme === theme}
                          onChange={() => update({ theme })}
                        />
                        {(zh ? ['跟随系统', '浅色', '深色'] : ['System', 'Light', 'Dark'])[i]}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {section === 'connection' && <ConnectionSettings embedded open={open} onOpenChange={setOpen} />}
              {section === 'library' && <MediaLibrary embedded />}
              {section === 'about' && (
                <div className='space-y-4'>
                  <div className='border-primary/20 relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_14%,var(--background)),var(--background)_54%,color-mix(in_oklab,var(--primary)_7%,var(--background)))] p-6'>
                    <div
                      aria-hidden='true'
                      className='bg-primary/15 absolute -top-16 -right-12 size-48 rounded-full blur-3xl'
                    />
                    <div
                      aria-hidden='true'
                      className='border-primary/15 absolute top-7 right-9 size-24 rotate-12 rounded-[28px] border'
                    />
                    <div className='relative'>
                      <div className='flex items-start justify-between gap-5'>
                        <div className='flex min-w-0 items-center gap-4'>
                          <div className='border-primary/20 bg-background/75 shadow-primary/10 flex size-16 shrink-0 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-sm'>
                            <img src='/images/logo.png' alt='' className='size-11' />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-primary mb-1 text-[11px] font-semibold tracking-[0.18em] uppercase'>
                              Flaq Creative Desktop
                            </p>
                            <h2 className='text-2xl font-semibold tracking-tight'>Flaq Creator</h2>
                            <p className='text-muted-foreground mt-1 max-w-sm text-sm leading-6'>
                              {zh
                                ? '把图像与视频工作流集中在一处，专注完成每一次创作。'
                                : 'Bring image and video workflows together in one focused creative space.'}
                            </p>
                          </div>
                        </div>
                        <span className='border-primary/20 bg-background/65 text-primary shrink-0 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm'>
                          v{packageInfo.version}
                        </span>
                      </div>

                      <div className='border-primary/15 bg-background/55 mt-6 grid grid-cols-3 divide-x overflow-hidden rounded-xl border backdrop-blur-sm'>
                        {[
                          {
                            icon: Image,
                            title: zh ? '图像创作' : 'Image',
                            detail: zh ? '多种生成工作流' : 'Multiple workflows',
                          },
                          {
                            icon: Video,
                            title: zh ? '视频创作' : 'Video',
                            detail: zh ? '从灵感到动态画面' : 'Ideas in motion',
                          },
                          {
                            icon: ShieldCheck,
                            title: zh ? '本地草稿' : 'Local drafts',
                            detail: zh ? '创作进度留在设备' : 'Progress on device',
                          },
                        ].map(({ icon: Icon, title, detail }) => (
                          <div key={title} className='px-4 py-3.5'>
                            <Icon aria-hidden='true' className='text-primary mb-2 size-4' strokeWidth={1.8} />
                            <p className='text-sm font-semibold'>{title}</p>
                            <p className='text-muted-foreground mt-0.5 text-xs leading-5'>{detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    {[
                      {
                        icon: HelpCircle,
                        title: zh ? '帮助中心' : 'Help center',
                        detail: zh ? '查看使用指南与常见问题。' : 'Browse guides and common questions.',
                        action: zh ? '查看帮助' : 'Open help',
                        url: 'https://flaq.ai/docs',
                      },
                      {
                        icon: ExternalLink,
                        title: zh ? '开源项目' : 'Open-source project',
                        detail: zh
                          ? '查看源代码、提交问题或参与改进。'
                          : 'Explore the source, report issues, or contribute.',
                        action: zh ? '访问 GitHub' : 'Open GitHub',
                        url: 'https://github.com/flaqai/open-ai-creator-desktop',
                      },
                    ].map(({ icon: Icon, title, detail, action, url }) => (
                      <div key={title} className='border-border bg-card flex flex-col rounded-2xl border p-5'>
                        <div className='bg-primary/10 text-primary mb-4 flex size-9 items-center justify-center rounded-xl'>
                          <Icon aria-hidden='true' className='size-4' />
                        </div>
                        <p className='text-sm font-semibold'>{title}</p>
                        <p className='text-muted-foreground mt-1 flex-1 text-xs leading-5'>{detail}</p>
                        <button
                          type='button'
                          className='border-border bg-background hover:bg-accent focus-visible:ring-ring mt-4 flex w-fit items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none'
                          onClick={() => void openExternalUrl(url).catch((error) => toast.error(String(error)))}
                        >
                          {action}
                          <ExternalLink aria-hidden='true' className='size-3.5' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
