'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Link, usePathname } from '@/i18n/navigation';
import packageInfo from '@/package.json';
import {
  HelpCircle,
  Home,
  Image,
  Info,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Video,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { DEFAULT_PREFERENCES, parsePreferences, PREFERENCES_KEY, type AppPreferences } from '@/lib/desktop/preferences';
import { isNativeDesktop, OPEN_DESKTOP_SETTINGS_EVENT } from '@/lib/desktop/runtime';
import { FEATURE_MODULES } from '@/lib/features/catalog';
import { openExternalUrl } from '@/lib/platform/navigation';
import { useDesktopRuntime } from '@/hooks/use-desktop-runtime';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const ConnectionSettings = dynamic(() => import('@/components/dialog/OpenApiSettingsDialog'));
type Section = 'general' | 'appearance' | 'connection' | 'about';
const sectionIcons = { general: SlidersHorizontal, appearance: Palette, connection: Plug, about: Info };

export default function DesktopShell({ children }: { children: ReactNode }) {
  const desktop = useDesktopRuntime();
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState<Section>('general');
  const [open, setOpen] = useState(false);
  const labels = zh
    ? { general: '通用', appearance: '外观', connection: '连接', about: '关于' }
    : { general: 'General', appearance: 'Appearance', connection: 'Connections', about: 'About' };
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
    const connection = () => showSettings('connection');
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        showSettings();
      }
    };
    window.addEventListener(OPEN_DESKTOP_SETTINGS_EVENT, connection);
    window.addEventListener('keydown', key);
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
      window.removeEventListener('keydown', key);
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
  if (!desktop) return children;
  const collapsed = preferences.collapsed;
  const linkClass =
    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring';
  return (
    <div className='desktop-shell min-h-screen' style={{ paddingInlineStart: collapsed ? 76 : 224 }}>
      <aside
        aria-label={zh ? '主导航' : 'Main navigation'}
        className='border-border bg-card fixed inset-y-0 start-0 z-40 flex flex-col border-e p-3'
        style={{ width: collapsed ? 76 : 224 }}
      >
        <div className='mb-6 flex h-12 items-center gap-2 px-1'>
          <img src='/images/logo.png' alt='Flaq Creator' className='size-9' />
          {!collapsed && <strong className='text-sm'>Flaq Creator</strong>}
        </div>
        <nav className='flex-1 space-y-1 overflow-y-auto'>
          <Link
            href='/'
            title={zh ? '工作台' : 'Workspace'}
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`${linkClass} ${pathname === '/' ? 'bg-accent font-semibold' : ''}`}
          >
            <Home className='size-5 shrink-0' />
            {!collapsed && (zh ? '工作台' : 'Workspace')}
          </Link>
          {(['workspace', 'image', 'video'] as const).map((group) => (
            <div key={group} className='space-y-1'>
              {group !== 'workspace' && !collapsed && (
                <p className='text-muted-foreground px-3 pt-5 pb-1 text-xs'>
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
                    {!collapsed && t(item.code)}
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
            {!collapsed && (zh ? '设置' : 'Settings')}
          </button>
          <button
            className={`${linkClass} w-full`}
            title={zh ? '帮助' : 'Help'}
            onClick={() => void openExternalUrl('https://flaq.ai/docs').catch((error) => toast.error(String(error)))}
          >
            <HelpCircle className='size-5 shrink-0' />
            {!collapsed && (zh ? '帮助' : 'Help')}
          </button>
          <button
            className={`${linkClass} w-full`}
            aria-expanded={!collapsed}
            title={zh ? '折叠或展开侧栏' : 'Toggle sidebar'}
            onClick={() => update({ collapsed: !collapsed })}
          >
            {collapsed ? <PanelLeftOpen className='size-5' /> : <PanelLeftClose className='size-5' />}
            {!collapsed && (zh ? '折叠侧栏' : 'Collapse')}
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
                <div className='space-y-4'>
                  <h2 className='font-semibold'>{zh ? '界面语言' : 'Language'}</h2>
                  <LocaleSwitcher />
                  <p className='text-muted-foreground text-sm'>
                    {zh ? '更改会自动保存到此设备。' : 'Changes are saved on this device.'}
                  </p>
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
              {section === 'about' && (
                <div className='space-y-4'>
                  <img src='/images/logo.png' alt='' className='size-16' />
                  <h2 className='text-xl font-semibold'>Flaq Creator</h2>
                  <p>
                    {zh ? '版本' : 'Version'} {packageInfo.version}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    {zh ? '图片与视频创作的本地工作台。' : 'Your desktop workspace for images and videos.'}
                  </p>
                  <a
                    className='text-primary underline'
                    href='https://github.com/flaqai/open-ai-creator-desktop'
                    target='_blank'
                    rel='noreferrer'
                  >
                    {zh ? '项目主页' : 'Project website'}
                  </a>
                </div>
              )}
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
