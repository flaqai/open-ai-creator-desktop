'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_OPEN_API_BASE_URL,
  normalizeBaseUrl,
  OPEN_API_BASE_URL_STORAGE_KEY,
  OPEN_API_CLIENT_KEY_STORAGE_KEY,
  OPEN_API_CONFIG_CHANGED_EVENT,
} from '@/network/clientFetch';
import { testApiConnection } from '@/network/connection-test';
import { ChevronDown, ChevronRight, ExternalLink, KeyRound, PlugZap, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { isDesktopRuntime } from '@/lib/desktop/runtime';
import {
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
} from '@/lib/desktop/storage';
import {
  clearAllSecureStorage,
  getSecureItem,
  isRememberMeEnabled,
  removeSecureItem,
  setSecureItem,
} from '@/lib/utils/secureStorage';
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

const FLAQ_REGISTER_URL = 'https://flaq.ai/';

type OpenApiSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OpenApiSettingsDialog({ open, onOpenChange }: OpenApiSettingsDialogProps) {
  const t = useTranslations('components.open-api-settings');
  const tHosting = useTranslations('components.image-hosting');
  const tCommon = useTranslations('Common');
  const tDesktop = useTranslations('Desktop');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OPEN_API_BASE_URL);
  const [clientKey, setClientKey] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hostingExpanded, setHostingExpanded] = useState(false);
  const [r2PublicDomain, setR2PublicDomain] = useState('');
  const [isTestingR2, setIsTestingR2] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [r2AccountId, setR2AccountId] = useState('');
  const [r2AccessKeyId, setR2AccessKeyId] = useState('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState('');
  const [r2BucketName, setR2BucketName] = useState('');

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const loadSettings = async () => {
      const savedBaseUrl = await getSecureItem(OPEN_API_BASE_URL_STORAGE_KEY);
      const savedClientKey = await getSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY);
      const [savedDomain, savedAccountId, savedAccessKeyId, savedSecretAccessKey, savedBucketName] = await Promise.all([
        getSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY),
        getSecureItem(R2_ACCOUNT_ID_STORAGE_KEY),
        getSecureItem(R2_ACCESS_KEY_ID_STORAGE_KEY),
        getSecureItem(R2_SECRET_ACCESS_KEY_STORAGE_KEY),
        getSecureItem(R2_BUCKET_NAME_STORAGE_KEY),
      ]);

      setBaseUrl(savedBaseUrl || DEFAULT_OPEN_API_BASE_URL);
      setClientKey(savedClientKey || '');
      setR2PublicDomain(savedDomain || '');
      setR2AccountId(savedAccountId || '');
      setR2AccessKeyId(savedAccessKeyId || '');
      setR2SecretAccessKey(savedSecretAccessKey || '');
      setR2BucketName(savedBucketName || '');
      setRememberMe(isRememberMeEnabled());
      setDesktop(isDesktopRuntime());
    };

    void loadSettings().catch((error: unknown) => toast.error(error instanceof Error ? error.message : String(error)));
  }, [open]);

  const handleReset = () => {
    setBaseUrl(DEFAULT_OPEN_API_BASE_URL);
    setClientKey('');
    setR2PublicDomain('');
    setR2AccountId('');
    setR2AccessKeyId('');
    setR2SecretAccessKey('');
    setR2BucketName('');
    setRememberMe(false);
  };

  const handleClearAll = () => {
    if (window.confirm(t('clear-data-confirm'))) {
      clearAllSecureStorage();
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
      if (desktop && [r2AccountId, r2AccessKeyId, r2SecretAccessKey, r2BucketName, r2PublicDomain].some(Boolean)) {
        const { validateR2Config } = await import('@/network/upload/desktop-r2');
        validateR2Config({
          accountId: r2AccountId,
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
          bucketName: r2BucketName,
          publicDomain: r2PublicDomain,
        });
      }
      await setSecureItem(OPEN_API_BASE_URL_STORAGE_KEY, normalizedBaseUrl, rememberMe);
      await setSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY, normalizedClientKey, rememberMe);

      const normalizedDomain = r2PublicDomain.trim();
      if (normalizedDomain) {
        await setSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY, normalizedDomain, rememberMe);
      } else {
        removeSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY);
      }

      const r2Entries = [
        [R2_ACCOUNT_ID_STORAGE_KEY, r2AccountId],
        [R2_ACCESS_KEY_ID_STORAGE_KEY, r2AccessKeyId],
        [R2_SECRET_ACCESS_KEY_STORAGE_KEY, r2SecretAccessKey],
        [R2_BUCKET_NAME_STORAGE_KEY, r2BucketName],
      ] as const;
      await Promise.all(
        r2Entries.map(async ([key, value]) => {
          if (value.trim()) await setSecureItem(key, value.trim(), rememberMe);
          else removeSecureItem(key);
        }),
      );

      toast.success(t('saved'));
      window.dispatchEvent(new Event(OPEN_API_CONFIG_CHANGED_EVENT));
      onOpenChange(false);
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

  const handleTestR2 = async () => {
    setIsTestingR2(true);

    try {
      if (desktop) {
        const values = [
          [R2_ACCOUNT_ID_STORAGE_KEY, r2AccountId],
          [R2_ACCESS_KEY_ID_STORAGE_KEY, r2AccessKeyId],
          [R2_SECRET_ACCESS_KEY_STORAGE_KEY, r2SecretAccessKey],
          [R2_BUCKET_NAME_STORAGE_KEY, r2BucketName],
          [R2_PUBLIC_DOMAIN_STORAGE_KEY, r2PublicDomain],
        ] as const;
        if (values.some(([, value]) => !value.trim())) throw new Error(tHosting('not-configured'));
        const { testDesktopR2Connection } = await import('@/network/upload/desktop-r2');
        await testDesktopR2Connection({
          accountId: r2AccountId,
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
          bucketName: r2BucketName,
          publicDomain: r2PublicDomain,
        });
        toast.success(tHosting('test-success'));
        return;
      }

      const response = await fetch('/api/upload/test-r2', { method: 'GET' });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (response.ok && result.ok) {
        toast.success(tHosting('test-success'));
      } else {
        toast.error(`${tHosting('test-failed')} ${result.error || ''}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : tHosting('test-failed');
      toast.error(`${tHosting('test-failed')} ${message}`);
    } finally {
      setIsTestingR2(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#111214] text-white sm:max-w-[640px]'>
        <DialogHeader className='space-y-2 text-left'>
          <DialogTitle className='text-xl font-semibold text-white'>{t('title')}</DialogTitle>
          <DialogDescription className='text-sm text-white/60'>
            {desktop ? tDesktop('firstRunDescription') : t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-xl border border-white/8 bg-white/[0.035] p-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                { icon: UserRound, text: tDesktop('stepAccount') },
                { icon: KeyRound, text: tDesktop('stepKey') },
                { icon: PlugZap, text: tDesktop('stepCreate') },
              ].map(({ icon: Icon, text }, index) => (
                <div key={text} className='flex gap-2.5 text-xs leading-5 text-white/55'>
                  <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-white/8 text-white/70'>
                    <Icon className='size-3.5' />
                  </span>
                  <span>
                    <b className='me-1 text-white/35'>{index + 1}.</b>
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={FLAQ_REGISTER_URL}
              target='_blank'
              rel='noreferrer'
              className='mt-4 flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90'
            >
              {t('register')}
              <ExternalLink className='size-3.5' />
            </a>
          </div>

          <div className='space-y-2'>
            <label htmlFor='open-api-base-url' className='text-sm font-medium text-white/80'>
              {t('base-url')}
            </label>
            <Input
              id='open-api-base-url'
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder={DEFAULT_OPEN_API_BASE_URL}
              className='h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
            <p className='text-xs text-white/45'>{t('base-url-hint')}</p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='open-api-client-key' className='text-sm font-medium text-white/80'>
              {t('client-key')}
            </label>
            <Input
              id='open-api-client-key'
              type='password'
              value={clientKey}
              onChange={(event) => setClientKey(event.target.value)}
              className='h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />

            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='remember-me'
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label htmlFor='remember-me' className='cursor-pointer text-sm text-white/70'>
                {t('remember-me')}
              </label>
            </div>
            {!desktop && <p className='text-xs text-white/45'>{t('remember-me-hint')}</p>}

            <div className='mt-3 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3'>
              <p className='text-xs text-yellow-200/80'>⚠️ {t('security-warning')}</p>
              <button
                type='button'
                onClick={handleClearAll}
                className='mt-2 text-xs text-red-400 underline hover:text-red-300'
              >
                {t('clear-data')}
              </button>
            </div>
          </div>

          <div className='rounded-md border border-white/10'>
            <button
              type='button'
              onClick={() => setHostingExpanded((prev) => !prev)}
              className='flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white/90'
            >
              <span>{tHosting('title')}</span>
              {hostingExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
            </button>

            {hostingExpanded && (
              <div className='space-y-2 border-t border-white/10 px-3 pt-3 pb-3'>
                {desktop && (
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-account-id' className='text-xs font-medium text-white/65'>
                        {tDesktop('r2AccountId')}
                      </label>
                      <Input
                        id='r2-account-id'
                        value={r2AccountId}
                        onChange={(event) => setR2AccountId(event.target.value)}
                        className='h-10 border-white/10 bg-white/5 text-white'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-bucket-name' className='text-xs font-medium text-white/65'>
                        {tDesktop('r2BucketName')}
                      </label>
                      <Input
                        id='r2-bucket-name'
                        value={r2BucketName}
                        onChange={(event) => setR2BucketName(event.target.value)}
                        className='h-10 border-white/10 bg-white/5 text-white'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-access-key' className='text-xs font-medium text-white/65'>
                        {tDesktop('r2AccessKeyId')}
                      </label>
                      <Input
                        id='r2-access-key'
                        value={r2AccessKeyId}
                        onChange={(event) => setR2AccessKeyId(event.target.value)}
                        className='h-10 border-white/10 bg-white/5 text-white'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor='r2-secret-key' className='text-xs font-medium text-white/65'>
                        {tDesktop('r2SecretAccessKey')}
                      </label>
                      <Input
                        id='r2-secret-key'
                        type='password'
                        value={r2SecretAccessKey}
                        onChange={(event) => setR2SecretAccessKey(event.target.value)}
                        className='h-10 border-white/10 bg-white/5 text-white'
                      />
                    </div>
                  </div>
                )}
                <label htmlFor='r2-public-domain' className='text-sm font-medium text-white/80'>
                  {tHosting('public-domain')}
                </label>
                <Input
                  id='r2-public-domain'
                  value={r2PublicDomain}
                  onChange={(event) => setR2PublicDomain(event.target.value)}
                  placeholder={tHosting('public-domain-placeholder')}
                  className='h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30'
                />
                <p className='text-xs text-white/45'>{tHosting('public-domain-hint')}</p>
                {!desktop && <p className='text-xs text-white/30'>{tHosting('not-configured')}</p>}
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleTestR2}
                  disabled={isTestingR2}
                  className='mt-1 h-9 w-full border-white/10 bg-transparent text-sm text-white hover:bg-white/8 hover:text-white'
                >
                  {isTestingR2 ? tHosting('testing') : tHosting('test')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={handleReset}
            className='border-white/10 bg-transparent text-white hover:bg-white/8 hover:text-white'
          >
            {tCommon('reset')}
          </Button>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleTestConnection}
              disabled={isTesting}
              className='border-white/10 bg-transparent text-white hover:bg-white/8 hover:text-white'
            >
              {isTesting ? t('testing') : t('test')}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='text-white/70 hover:bg-white/8 hover:text-white'
            >
              {t('cancel')}
            </Button>
            <Button type='button' onClick={handleSave} className='bg-white text-black hover:bg-white/90'>
              {t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
