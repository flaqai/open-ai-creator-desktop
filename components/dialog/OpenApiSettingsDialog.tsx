'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_OPEN_API_BASE_URL,
  normalizeBaseUrl,
  OPEN_API_BASE_URL_STORAGE_KEY,
  OPEN_API_CLIENT_KEY_STORAGE_KEY,
  OPEN_API_CONFIG_CHANGED_EVENT,
} from '@/network/clientFetch';
import { setApiConnectionAuthorized } from '@/network/connection-status';
import { testApiConnection } from '@/network/connection-test';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  KeyRound,
  PlugZap,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  initialR2Preset,
  loadR2Presets,
  removeR2Preset,
  saveR2Presets,
  upsertR2Preset,
  type R2Preset,
} from '@/lib/desktop/r2-presets';
import { isDesktopRuntime } from '@/lib/desktop/runtime';
import {
  CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
  CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
  CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
  CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
  CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  getUploadProvider,
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  setUploadProvider,
  type UploadProvider,
} from '@/lib/desktop/storage';
import { clearAllSecureStorage, getSecureItem, isRememberMeEnabled, setSecureItem } from '@/lib/utils/secureStorage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FLAQ_REGISTER_URL = 'https://flaq.ai/';

type OpenApiSettingsDialogProps = {
  embedded?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OpenApiSettingsDialog({ open, onOpenChange, embedded = false }: OpenApiSettingsDialogProps) {
  const t = useTranslations('components.open-api-settings');
  const tHosting = useTranslations('components.image-hosting');
  const tCommon = useTranslations('Common');
  const tDesktop = useTranslations('Desktop');
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OPEN_API_BASE_URL);
  const [clientKey, setClientKey] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [hostingExpanded, setHostingExpanded] = useState(false);
  const [uploadProvider, setUploadProviderDraft] = useState<UploadProvider>('builtin');
  const [r2PublicDomain, setR2PublicDomain] = useState('');
  const [r2AccountId, setR2AccountId] = useState('');
  const [r2AccessKeyId, setR2AccessKeyId] = useState('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState('');
  const [r2BucketName, setR2BucketName] = useState('');
  const [isTestingR2, setIsTestingR2] = useState(false);
  const [r2Presets, setR2Presets] = useState<R2Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [presetName, setPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const loadSettings = async () => {
      const [savedBaseUrl, savedClientKey, savedPresets] = await Promise.all([
        getSecureItem(OPEN_API_BASE_URL_STORAGE_KEY),
        getSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY),
        loadR2Presets().catch((error) => {
          toast.error(error instanceof Error ? error.message : String(error));
          return [];
        }),
      ]);
      const [customDomain, customAccountId, customAccessKeyId, customSecretAccessKey, customBucketName] =
        await Promise.all([
          getSecureItem(CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY),
          getSecureItem(CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY),
          getSecureItem(CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY),
          getSecureItem(CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY),
          getSecureItem(CUSTOM_R2_BUCKET_NAME_STORAGE_KEY),
        ]);
      const hasCustomR2 = [
        customDomain,
        customAccountId,
        customAccessKeyId,
        customSecretAccessKey,
        customBucketName,
      ].every(Boolean);
      const [defaultDomain, defaultAccountId, defaultAccessKeyId, defaultSecretAccessKey, defaultBucketName] =
        hasCustomR2
          ? [null, null, null, null, null]
          : await Promise.all([
              getSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY),
              getSecureItem(R2_ACCOUNT_ID_STORAGE_KEY),
              getSecureItem(R2_ACCESS_KEY_ID_STORAGE_KEY),
              getSecureItem(R2_SECRET_ACCESS_KEY_STORAGE_KEY),
              getSecureItem(R2_BUCKET_NAME_STORAGE_KEY),
            ]);
      setBaseUrl(savedBaseUrl || DEFAULT_OPEN_API_BASE_URL);
      setClientKey(savedClientKey || '');
      setUploadProviderDraft(getUploadProvider());
      const currentR2 = {
        publicDomain: customDomain || defaultDomain || '',
        accountId: customAccountId || defaultAccountId || '',
        accessKeyId: customAccessKeyId || defaultAccessKeyId || '',
        secretAccessKey: customSecretAccessKey || defaultSecretAccessKey || '',
        bucketName: customBucketName || defaultBucketName || '',
      };
      const initialPreset = initialR2Preset(savedPresets, currentR2);
      setR2PublicDomain(initialPreset?.publicDomain || currentR2.publicDomain);
      setR2AccountId(initialPreset?.accountId || currentR2.accountId);
      setR2AccessKeyId(initialPreset?.accessKeyId || currentR2.accessKeyId);
      setR2SecretAccessKey(initialPreset?.secretAccessKey || currentR2.secretAccessKey);
      setR2BucketName(initialPreset?.bucketName || currentR2.bucketName);
      setRememberMe(isRememberMeEnabled());
      setDesktop(isDesktopRuntime());
      setR2Presets(savedPresets);
      setSelectedPresetId(initialPreset?.id || '');
      setPresetName(initialPreset?.name || '');
    };

    void loadSettings().catch((error: unknown) => toast.error(error instanceof Error ? error.message : String(error)));
  }, [open]);

  const handleReset = () => {
    setBaseUrl(DEFAULT_OPEN_API_BASE_URL);
    setClientKey('');
    setRememberMe(false);
    setUploadProviderDraft('builtin');
  };

  const handleClearAll = () => {
    if (window.confirm(t('clear-data-confirm'))) {
      clearAllSecureStorage();
      setApiConnectionAuthorized(false, false);
      window.dispatchEvent(new Event(OPEN_API_CONFIG_CHANGED_EVENT));
      handleReset();
      toast.success(t('data-cleared'));
    }
  };

  const handleSave = async () => {
    const normalizedBaseUrl = baseUrl.trim() || DEFAULT_OPEN_API_BASE_URL;
    const normalizedClientKey = clientKey.trim();

    if (!normalizedClientKey) {
      toast.error(t('required'));
      return;
    }

    try {
      normalizeBaseUrl(normalizedBaseUrl);
      let normalizedR2Config:
        | {
            accountId: string;
            accessKeyId: string;
            secretAccessKey: string;
            bucketName: string;
            publicDomain: string;
          }
        | undefined;
      if (uploadProvider === 'custom-r2') {
        if (!desktop) throw new Error(tHosting('custom-desktop-only'));
        const { validateR2Config } = await import('@/network/upload/desktop-r2');
        normalizedR2Config = validateR2Config({
          accountId: r2AccountId,
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
          bucketName: r2BucketName,
          publicDomain: r2PublicDomain,
        });
      }
      setIsTesting(true);
      setApiConnectionAuthorized(false, rememberMe);
      await setSecureItem(OPEN_API_BASE_URL_STORAGE_KEY, normalizedBaseUrl, rememberMe);
      await setSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY, normalizedClientKey, rememberMe);
      setUploadProvider(uploadProvider);
      if (normalizedR2Config) {
        await Promise.all([
          setSecureItem(CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY, normalizedR2Config.accountId, rememberMe),
          setSecureItem(CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY, normalizedR2Config.accessKeyId, rememberMe),
          setSecureItem(CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY, normalizedR2Config.secretAccessKey, rememberMe),
          setSecureItem(CUSTOM_R2_BUCKET_NAME_STORAGE_KEY, normalizedR2Config.bucketName, rememberMe),
          setSecureItem(CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY, normalizedR2Config.publicDomain, rememberMe),
        ]);
      }
    } catch (error) {
      window.dispatchEvent(new Event(OPEN_API_CONFIG_CHANGED_EVENT));
      toast.error(error instanceof Error ? error.message : String(error));
      setIsTesting(false);
      return;
    }

    try {
      await testApiConnection({ baseUrl: normalizedBaseUrl, clientKey: normalizedClientKey });
      setApiConnectionAuthorized(true, rememberMe);
      window.dispatchEvent(new Event(OPEN_API_CONFIG_CHANGED_EVENT));
      onOpenChange(false);
      toast.success(t('authorization-passed-saved'));
    } catch (error) {
      setApiConnectionAuthorized(false, rememberMe);
      window.dispatchEvent(new Event(OPEN_API_CONFIG_CHANGED_EVENT));
      toast.error(t('authorization-failed-saved'), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestR2 = async () => {
    setIsTestingR2(true);
    try {
      const { testDesktopR2Connection } = await import('@/network/upload/desktop-r2');
      await testDesktopR2Connection({
        accountId: r2AccountId,
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
        bucketName: r2BucketName,
        publicDomain: r2PublicDomain,
      });
      toast.success(tHosting('test-success'));
    } catch (error) {
      const message = error instanceof Error ? error.message : tHosting('test-failed');
      toast.error(`${tHosting('test-failed')} ${message}`);
    } finally {
      setIsTestingR2(false);
    }
  };

  const applyR2Preset = (id: string) => {
    const preset = r2Presets.find((item) => item.id === id);
    if (!preset) return;
    setSelectedPresetId(id);
    setPresetName(preset.name);
    setR2AccountId(preset.accountId);
    setR2AccessKeyId(preset.accessKeyId);
    setR2SecretAccessKey(preset.secretAccessKey);
    setR2BucketName(preset.bucketName);
    setR2PublicDomain(preset.publicDomain);
  };

  const startNewR2Preset = () => {
    setSelectedPresetId('');
    setPresetName('');
  };

  const handleSaveR2Preset = async () => {
    setIsSavingPreset(true);
    try {
      const { validateR2Config } = await import('@/network/upload/desktop-r2');
      const config = validateR2Config({
        accountId: r2AccountId,
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
        bucketName: r2BucketName,
        publicDomain: r2PublicDomain,
      });
      const next = upsertR2Preset(r2Presets, { name: presetName, ...config }, selectedPresetId || undefined);
      await saveR2Presets(next);
      const saved = selectedPresetId ? next.find((preset) => preset.id === selectedPresetId) : next[next.length - 1];
      setR2Presets(next);
      setSelectedPresetId(saved?.id || '');
      setPresetName(saved?.name || presetName.trim());
      toast.success(zh ? '自定义图床预设已加密保存。' : 'Custom storage preset saved securely.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleDeleteR2Preset = async () => {
    const preset = r2Presets.find((item) => item.id === selectedPresetId);
    if (!preset) return;
    if (!window.confirm(zh ? `删除预设“${preset.name}”？` : `Delete preset “${preset.name}”?`)) return;
    try {
      const next = removeR2Preset(r2Presets, preset.id);
      await saveR2Presets(next);
      setR2Presets(next);
      setSelectedPresetId('');
      setPresetName('');
      toast.success(zh ? '预设已删除。' : 'Preset deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleTestConnection = async () => {
    const normalizedBaseUrl = baseUrl.trim() || DEFAULT_OPEN_API_BASE_URL;
    const normalizedClientKey = clientKey.trim();

    if (!normalizedClientKey) {
      toast.error(t('required'));
      return;
    }

    setIsTesting(true);

    try {
      const result = await testApiConnection({ baseUrl: normalizedBaseUrl, clientKey: normalizedClientKey });
      toast.success(t(result === 'verified' ? 'test-success' : 'test-success-validation'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('test-failed');
      toast.error(`${t('test-failed')} ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const content = (
    <>
      <DialogHeader className='space-y-2 text-left'>
        {embedded ? (
          <h2 className='text-xl font-semibold'>{t('title')}</h2>
        ) : (
          <DialogTitle className='text-foreground text-xl font-semibold'>{t('title')}</DialogTitle>
        )}
        {embedded ? (
          <p className='text-muted-foreground text-sm'>
            {desktop ? tDesktop('firstRunDescription') : t('description')}
          </p>
        ) : (
          <DialogDescription className='text-foreground/60 text-sm'>
            {desktop ? tDesktop('firstRunDescription') : t('description')}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className='space-y-4'>
        <div className='border-foreground/8 bg-foreground/[0.035] rounded-xl border p-4'>
          <div className='grid gap-3 sm:grid-cols-3'>
            {[
              { icon: UserRound, text: tDesktop('stepAccount') },
              { icon: KeyRound, text: tDesktop('stepKey') },
              { icon: PlugZap, text: tDesktop('stepCreate') },
            ].map(({ icon: Icon, text }, index) => (
              <div key={text} className='text-foreground/55 flex gap-2.5 text-xs leading-5'>
                <span className='bg-foreground/8 text-foreground/70 flex size-6 shrink-0 items-center justify-center rounded-md'>
                  <Icon className='size-3.5' />
                </span>
                <span>
                  <b className='text-foreground/35 me-1'>{index + 1}.</b>
                  {text}
                </span>
              </div>
            ))}
          </div>
          <a
            href={FLAQ_REGISTER_URL}
            target='_blank'
            rel='noreferrer'
            className='bg-foreground text-background hover:bg-foreground/90 mt-4 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition'
          >
            {t('register')}
            <ExternalLink className='size-3.5' />
          </a>
        </div>

        <div className='space-y-2'>
          <label htmlFor='open-api-base-url' className='text-foreground/80 text-sm font-medium'>
            {t('base-url')}
          </label>
          <Input
            id='open-api-base-url'
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder={DEFAULT_OPEN_API_BASE_URL}
            className='border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 h-11'
          />
          <p className='text-foreground/45 text-xs'>{t('base-url-hint')}</p>
        </div>

        <div className='space-y-2'>
          <label htmlFor='open-api-client-key' className='text-foreground/80 text-sm font-medium'>
            {t('client-key')}
          </label>
          <Input
            id='open-api-client-key'
            type='password'
            value={clientKey}
            onChange={(event) => setClientKey(event.target.value)}
            className='border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 h-11'
          />

          <div className='flex items-center space-x-2 pt-2'>
            <Checkbox
              id='remember-me'
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label htmlFor='remember-me' className='text-foreground/70 cursor-pointer text-sm'>
              {t('remember-me')}
            </label>
          </div>
          {!desktop && <p className='text-foreground/45 text-xs'>{t('remember-me-hint')}</p>}

          <div className='mt-3 rounded-md border border-[#fcd34d] bg-[#fffbeb] p-3 dark:border-[#735c28] dark:bg-[#292211]'>
            <p className='text-xs leading-5 text-[#78350f] dark:text-[#fde68a]'>⚠️ {t('security-warning')}</p>
            <button
              type='button'
              onClick={handleClearAll}
              className='mt-2 text-xs text-red-800 underline underline-offset-2 hover:text-red-950 dark:text-red-300 dark:hover:text-red-200'
            >
              {t('clear-data')}
            </button>
          </div>
        </div>

        <div className='border-foreground/10 rounded-xl border'>
          <button
            type='button'
            onClick={() => setHostingExpanded((previous) => !previous)}
            className='text-foreground/75 hover:text-foreground flex w-full items-center justify-between px-4 py-3 text-sm font-medium'
          >
            <span>{tHosting('title')}</span>
            {hostingExpanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
          </button>

          {hostingExpanded ? (
            <div className='border-foreground/10 space-y-4 border-t p-4'>
              <RadioGroup
                value={uploadProvider}
                onValueChange={(value) => setUploadProviderDraft(value as UploadProvider)}
                className='grid gap-3 sm:grid-cols-2'
              >
                <label
                  htmlFor='upload-provider-builtin'
                  className='border-foreground/10 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer gap-3 rounded-lg border p-3'
                >
                  <RadioGroupItem id='upload-provider-builtin' value='builtin' className='mt-0.5' />
                  <span>
                    <span className='text-foreground block text-sm font-medium'>{tHosting('builtin')}</span>
                    <span className='text-foreground/50 mt-1 block text-xs leading-5'>
                      {tHosting('builtin-description')}
                    </span>
                  </span>
                </label>
                <label
                  htmlFor='upload-provider-custom'
                  className='border-foreground/10 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer gap-3 rounded-lg border p-3'
                >
                  <RadioGroupItem
                    id='upload-provider-custom'
                    value='custom-r2'
                    disabled={!desktop}
                    className='mt-0.5'
                  />
                  <span>
                    <span className='text-foreground block text-sm font-medium'>{tHosting('custom')}</span>
                    <span className='text-foreground/50 mt-1 block text-xs leading-5'>
                      {desktop ? tHosting('custom-description') : tHosting('custom-desktop-only')}
                    </span>
                  </span>
                </label>
              </RadioGroup>

              {uploadProvider === 'builtin' ? (
                <p className='bg-foreground/[0.035] text-foreground/55 rounded-lg px-3 py-2.5 text-xs leading-5'>
                  {tHosting('builtin-hint')}
                </p>
              ) : (
                <div className='space-y-3'>
                  <div className='border-foreground/10 bg-foreground/[0.025] space-y-3 rounded-lg border p-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <p className='text-foreground/80 text-sm font-medium'>
                          {zh ? '自定义图床预设' : 'Custom storage presets'}
                        </p>
                        <p className='text-foreground/45 mt-0.5 text-xs'>
                          {zh ? '参数和密钥会加密保存在此设备。' : 'Parameters and keys are encrypted on this device.'}
                        </p>
                      </div>
                      <Button type='button' variant='ghost' size='sm' onClick={startNewR2Preset}>
                        <Plus aria-hidden='true' className='size-4' />
                        {zh ? '新建' : 'New'}
                      </Button>
                    </div>
                    <Select value={selectedPresetId || undefined} onValueChange={applyR2Preset}>
                      <SelectTrigger className='border-foreground/10 bg-foreground/5 w-full'>
                        <SelectValue placeholder={zh ? '选择已保存的预设' : 'Choose a saved preset'} />
                      </SelectTrigger>
                      <SelectContent>
                        {r2Presets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={presetName}
                      onChange={(event) => setPresetName(event.target.value)}
                      maxLength={40}
                      placeholder={zh ? '预设名称，例如：生产环境' : 'Preset name, e.g. Production'}
                      aria-label={zh ? '预设名称' : 'Preset name'}
                      className='border-foreground/10 bg-foreground/5 h-10'
                    />
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => void handleSaveR2Preset()}
                        disabled={isSavingPreset}
                      >
                        <Save aria-hidden='true' className='size-4' />
                        {selectedPresetId
                          ? zh
                            ? '更新当前预设'
                            : 'Update preset'
                          : zh
                            ? '保存为新预设'
                            : 'Save as new preset'}
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        onClick={() => void handleDeleteR2Preset()}
                        disabled={!selectedPresetId || isSavingPreset}
                        className='text-destructive hover:text-destructive'
                      >
                        <Trash2 aria-hidden='true' className='size-4' />
                        {zh ? '删除预设' : 'Delete preset'}
                      </Button>
                    </div>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-account-id' className='text-foreground/70 text-xs font-medium'>
                        {tDesktop('r2AccountId')}
                      </label>
                      <Input
                        id='r2-account-id'
                        value={r2AccountId}
                        onChange={(event) => setR2AccountId(event.target.value)}
                        className='border-foreground/10 bg-foreground/5 text-foreground h-10'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-bucket-name' className='text-foreground/70 text-xs font-medium'>
                        {tDesktop('r2BucketName')}
                      </label>
                      <Input
                        id='r2-bucket-name'
                        value={r2BucketName}
                        onChange={(event) => setR2BucketName(event.target.value)}
                        className='border-foreground/10 bg-foreground/5 text-foreground h-10'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-access-key' className='text-foreground/70 text-xs font-medium'>
                        {tDesktop('r2AccessKeyId')}
                      </label>
                      <Input
                        id='r2-access-key'
                        value={r2AccessKeyId}
                        onChange={(event) => setR2AccessKeyId(event.target.value)}
                        className='border-foreground/10 bg-foreground/5 text-foreground h-10'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-secret-key' className='text-foreground/70 text-xs font-medium'>
                        {tDesktop('r2SecretAccessKey')}
                      </label>
                      <Input
                        id='r2-secret-key'
                        type='password'
                        value={r2SecretAccessKey}
                        onChange={(event) => setR2SecretAccessKey(event.target.value)}
                        className='border-foreground/10 bg-foreground/5 text-foreground h-10'
                      />
                    </div>
                  </div>
                  <div className='space-y-1.5'>
                    <label htmlFor='r2-public-domain' className='text-foreground/70 text-xs font-medium'>
                      {tHosting('public-domain')}
                    </label>
                    <Input
                      id='r2-public-domain'
                      value={r2PublicDomain}
                      onChange={(event) => setR2PublicDomain(event.target.value)}
                      placeholder={tHosting('public-domain-placeholder')}
                      className='border-foreground/10 bg-foreground/5 text-foreground h-10'
                    />
                    <p className='text-foreground/45 text-xs'>{tHosting('public-domain-hint')}</p>
                  </div>
                  <div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleTestR2}
                      disabled={isTestingR2}
                      className='border-foreground/10 bg-transparent'
                    >
                      {isTestingR2 ? tHosting('testing') : tHosting('test')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={handleReset}
          className='border-foreground/10 text-foreground hover:bg-foreground/8 hover:text-foreground bg-transparent'
        >
          {tCommon('reset')}
        </Button>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleTestConnection}
            disabled={isTesting}
            className='border-foreground/10 text-foreground hover:bg-foreground/8 hover:text-foreground bg-transparent'
          >
            {isTesting ? t('testing') : t('test')}
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={() => onOpenChange(false)}
            className='text-foreground/70 hover:bg-foreground/8 hover:text-foreground'
          >
            {t('cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={isTesting}
            className='bg-primary text-primary-foreground hover:bg-primary/90'
          >
            {isTesting ? t('saving-and-testing') : t('save-and-test')}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
  if (embedded) return <div className='space-y-5'>{content}</div>;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-border bg-background text-foreground max-h-[90vh] overflow-y-auto sm:max-w-[640px]'>
        {content}
      </DialogContent>
    </Dialog>
  );
}
