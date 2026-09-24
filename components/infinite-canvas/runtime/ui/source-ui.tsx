'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { Button as ShadcnButton } from '@/components/ui/button';
import { Card as ShadcnCard } from '@/components/ui/card';
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider as ShadcnSlider } from '@/components/ui/slider';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { Tabs as ShadcnTabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInfiniteCanvasI18n } from '../i18n/infinite-canvas-context';
import { useInfiniteCanvasIntegrations } from '../integrations/infinite-canvas-integrations-context';

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

interface SourceButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  readonly type?: 'default' | 'primary' | 'text' | 'link' | 'dashed';
  readonly size?: 'small' | 'middle' | 'large';
  readonly danger?: boolean;
  readonly icon?: ReactNode;
  readonly loading?: boolean;
  readonly block?: boolean;
}

export function Button({
  type = 'default',
  size = 'middle',
  danger,
  icon,
  loading,
  block,
  className,
  children,
  disabled,
  ...props
}: SourceButtonProps) {
  const variant = danger
    ? 'destructive'
    : type === 'primary'
      ? 'default'
      : type === 'link'
        ? 'link'
        : type === 'text'
          ? 'ghost'
          : 'outline';
  return (
    <ShadcnButton
      type='button'
      variant={variant}
      size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'default'}
      className={cx(
        type === 'primary' && '!bg-canvas-accent !text-canvas-accent-foreground hover:!bg-canvas-muted-accent',
        type === 'default' && '!border-canvas-border !bg-canvas-panel !text-canvas-text hover:!bg-canvas-surface',
        type === 'text' && '!text-canvas-text hover:!bg-canvas-muted-accent/10 hover:!text-canvas-accent',
        type === 'link' && '!text-canvas-accent',
        danger && '!bg-destructive-color !text-on-media-color',
        block && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className='size-4 animate-spin rounded-full border-2 border-current border-r-transparent' />
      ) : (
        icon
      )}
      {children}
    </ShadcnButton>
  );
}

interface ModalProps {
  readonly open?: boolean;
  readonly title?: ReactNode;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly onCancel?: () => void;
  readonly onOk?: () => void;
  readonly okText?: ReactNode;
  readonly cancelText?: ReactNode;
  readonly width?: number | string;
  readonly className?: string;
  readonly styles?: { readonly body?: CSSProperties; readonly header?: CSSProperties };
  readonly centered?: boolean;
  readonly [key: string]: unknown;
}

export function Modal({
  open,
  title,
  children,
  footer,
  onCancel,
  onOk,
  okText,
  cancelText,
  width = 640,
  className,
  styles,
}: ModalProps) {
  const i18n = useInfiniteCanvasI18n();
  return (
    <Dialog open={Boolean(open)} onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}>
      <DialogContent
        data-canvas-overlay

        className={cx(
          'max-h-[92vh] gap-0 overflow-hidden border-canvas-border bg-canvas-panel p-0 text-canvas-text',
          className,
        )}
        style={{ maxWidth: width }}
      >
        <DialogHeader
          className={cx('border-b border-canvas-border px-5 py-4', title === null && 'sr-only')}
          style={styles?.header}
        >
          <DialogTitle>{title ?? i18n.common.confirm}</DialogTitle>
        </DialogHeader>
        <div className='max-h-[76vh] overflow-auto p-5' style={styles?.body}>
          {children}
        </div>
        {footer === null
          ? null
          : (footer ?? (
              <DialogFooter className='border-t border-canvas-border px-5 py-4'>
                <Button onClick={onCancel}>{cancelText ?? i18n.common.cancel}</Button>
                <Button type='primary' onClick={onOk}>
                  {okText ?? i18n.common.confirm}
                </Button>
              </DialogFooter>
            ))}
      </DialogContent>
    </Dialog>
  );
}

export function Tooltip({
  title,
  children,
}: {
  readonly title?: ReactNode;
  readonly children: ReactElement;
  readonly [key: string]: unknown;
}) {
  if (title === undefined || title === null || title === '') return children;
  return (
    <TooltipProvider delayDuration={150}>
      <ShadcnTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent data-canvas-overlay className='border-canvas-border bg-canvas-panel text-canvas-text'>
          {title}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
}

interface SegmentedOption<T extends string | number> {
  readonly label?: ReactNode;
  readonly value: T;
  readonly disabled?: boolean;
}
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
}: {
  readonly value?: T;
  readonly options: ReadonlyArray<T | SegmentedOption<T>>;
  readonly onChange?: (value: T) => void;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  return (
    <div className={cx('inline-flex rounded-lg bg-canvas-surface p-1', className)}>
      {options.map((entry) => {
        const option = typeof entry === 'object' ? entry : { label: entry, value: entry };
        return (
          <ShadcnButton
            type='button'
            variant='ghost'
            size='sm'
            key={String(option.value)}
            aria-pressed={option.value === value}
            disabled={option.disabled}
            onClick={() => onChange?.(option.value)}
            className={cx(
              'h-7 px-2 text-xs text-canvas-text',
              option.value === value && 'bg-canvas-muted-accent/15 text-canvas-accent',
            )}
          >
            {option.label ?? option.value}
          </ShadcnButton>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  className,
  disabled,
  'aria-label': ariaLabel,
}: {
  readonly checked?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly 'aria-label'?: string;
  readonly [key: string]: unknown;
}) {
  return (
    <ShadcnSwitch
      checked={checked}
      onCheckedChange={onChange}
      className={cx('data-[state=checked]:bg-canvas-accent data-[state=unchecked]:bg-canvas-border', className)}
      style={{ '--ui-switch-thumb-color': 'var(--ui-canvas-accent-foreground)' } as CSSProperties}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
}

interface SourceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  readonly prefix?: ReactNode;
  readonly allowClear?: boolean;
  readonly size?: 'small' | 'middle' | 'large';
  readonly onPressEnter?: () => void;
}
function SourceInput({
  prefix,
  allowClear,
  onPressEnter,
  className,
  value,
  onChange,
  size: _size,
  ...props
}: SourceInputProps) {
  return (
    <label
      className={cx(
        'flex h-9 items-center gap-2 rounded-md border border-canvas-border bg-canvas-panel px-3',
        className,
      )}
    >
      {prefix}
      <ShadcnInput
        className='h-8 min-w-0 flex-1 border-0 bg-transparent px-0'
        value={value}
        onChange={onChange}
        onKeyDown={(event) => event.key === 'Enter' && onPressEnter?.()}
        {...props}
      />
      {allowClear && value ? (
        <button
          type='button'
          aria-label='clear'
          onClick={() => onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)}
        >
          ×
        </button>
      ) : null}
    </label>
  );
}
function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <ShadcnTextarea {...props} className={cx('min-h-24 border-canvas-border bg-canvas-panel', props.className)} />;
}
export const Input = Object.assign(SourceInput, { TextArea });

export function InputNumber({
  value,
  onChange,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  readonly value?: number | null;
  readonly onChange?: (value: number | null) => void;
}) {
  return (
    <ShadcnInput
      type='number'
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value === '' ? null : Number(event.target.value))}
      className={cx('h-9 border-canvas-border bg-canvas-panel', className)}
      {...props}
    />
  );
}

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
}: {
  readonly value?: number;
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly onChange?: (value: number) => void;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  return (
    <ShadcnSlider
      value={value === undefined ? undefined : [value]}
      defaultValue={defaultValue === undefined ? undefined : [defaultValue]}
      min={min}
      max={max}
      step={step}
      onValueChange={(values) => onChange?.(values[0] ?? min)}
      className={className}
      rangeClassName='bg-canvas-accent'
      thumbClassName='border-canvas-accent'
    />
  );
}

function SourceEmpty({
  description,
  className,
}: {
  readonly description?: ReactNode;
  readonly className?: string;
  readonly image?: unknown;
}) {
  return <div className={cx('grid place-items-center text-sm text-canvas-muted', className)}>{description}</div>;
}
export const Empty = Object.assign(SourceEmpty, { PRESENTED_IMAGE_SIMPLE: 'simple' });

export function Pagination({
  current = 1,
  pageSize = 10,
  total,
  onChange,
  className,
}: {
  readonly current?: number;
  readonly pageSize?: number;
  readonly total: number;
  readonly onChange?: (page: number, pageSize: number) => void;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className={cx('flex items-center gap-2', className)}>
      <Button size='small' disabled={current <= 1} onClick={() => onChange?.(current - 1, pageSize)}>
        ‹
      </Button>
      <span className='text-xs'>
        {current} / {pages}
      </span>
      <Button size='small' disabled={current >= pages} onClick={() => onChange?.(current + 1, pageSize)}>
        ›
      </Button>
    </nav>
  );
}

function SourceTag({
  children,
  className,
  color,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly color?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex rounded border border-canvas-border px-1.5 py-0.5 text-xs text-canvas-text',
        color === 'green' && 'border-green-color/40 text-green-color',
        color === 'red' && 'border-destructive-color/40 text-destructive-color',
        color === 'blue' && 'border-blue-color/40 text-blue-color',
        color === 'purple' && 'border-canvas-muted-accent/40 text-canvas-accent',
        className,
      )}
    >
      {children}
    </span>
  );
}
function CheckableTag({
  checked,
  onChange,
  children,
  className,
}: {
  readonly checked?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly children?: ReactNode;
  readonly className?: string;
}) {
  return (
    <ShadcnButton
      type='button'
      variant='outline'
      size='sm'
      aria-pressed={checked}
      onClick={() => onChange?.(!checked)}
      className={cx(
        'h-7 rounded-full border-canvas-border px-2 text-xs',
        checked && 'border-canvas-accent bg-canvas-muted-accent/10 text-canvas-accent',
        className,
      )}
    >
      {children}
    </ShadcnButton>
  );
}
export const Tag = Object.assign(SourceTag, { CheckableTag });

export function Popconfirm({
  title,
  onConfirm,
  children,
}: {
  readonly title?: ReactNode;
  readonly onConfirm?: () => void;
  readonly children: ReactElement;
  readonly [key: string]: unknown;
}) {
  const i18n = useInfiniteCanvasI18n();
  const integrations = useInfiniteCanvasIntegrations();
  return cloneElement(children, {
    onClick: () => {
      void Promise.resolve(
        integrations.confirm({
          kind: 'delete-project',
          title: String(title ?? i18n.common.confirm),
          description: String(title ?? ''),
          confirmLabel: i18n.common.confirm,
        }),
      ).then((confirmed) => confirmed && onConfirm?.());
    },
  } as ButtonHTMLAttributes<HTMLButtonElement>);
}

export function Tabs({
  items,
  defaultActiveKey,
}: {
  readonly items: ReadonlyArray<{ readonly key: string; readonly label: ReactNode; readonly children: ReactNode }>;
  readonly defaultActiveKey?: string;
}) {
  return (
    <ShadcnTabs defaultValue={defaultActiveKey ?? items[0]?.key}>
      <TabsList className='bg-canvas-surface'>
        {items.map((item) => (
          <TabsTrigger
            key={item.key}
            value={item.key}
            className='data-[state=active]:bg-canvas-muted-accent/15 data-[state=active]:text-canvas-accent'
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.key} value={item.key}>
          {item.children}
        </TabsContent>
      ))}
    </ShadcnTabs>
  );
}

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  className,
  ...props
}: {
  readonly value?: T;
  readonly options?: ReadonlyArray<{ readonly value: T; readonly label?: ReactNode; readonly disabled?: boolean }>;
  readonly onChange?: (value: T) => void;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  const entries = options ?? [];
  const selected = entries.find((option) => String(option.value) === String(value));
  return (
    <ShadcnSelect
      value={value === undefined ? undefined : String(value)}
      onValueChange={(next) => {
        const match = entries.find((option) => String(option.value) === next);
        if (match) onChange?.(match.value);
      }}
    >
      <SelectTrigger
        className={cx('h-9 border-canvas-border bg-canvas-panel text-canvas-text', className)}
        aria-label={typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined}
      >
        <SelectValue>{selected?.label ?? (value === undefined ? '' : String(value))}</SelectValue>
      </SelectTrigger>
      <SelectContent data-canvas-overlay className='z-[140] border-canvas-border bg-canvas-panel text-canvas-text'>
        {entries.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label ?? String(option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );
}

export function Spin({ className }: { readonly className?: string; readonly [key: string]: unknown }) {
  return (
    <span
      className={cx(
        'inline-block size-5 animate-spin rounded-full border-2 border-canvas-accent border-r-transparent',
        className,
      )}
    />
  );
}

export function Image({
  src,
  alt,
  style,
  preview,
}: {
  readonly src?: string;
  readonly alt?: string;
  readonly style?: CSSProperties;
  readonly preview?: {
    readonly visible?: boolean;
    readonly src?: string;
    readonly onVisibleChange?: (visible: boolean) => void;
  };
}) {
  if (preview?.visible)
    return (
      <button
        type='button'
        aria-label='Close image preview'
        data-canvas-overlay
        className='fixed inset-0 z-[120] grid place-items-center bg-overlay-color/80 p-8'
        onClick={() => preview.onVisibleChange?.(false)}
      >
        <img src={preview.src ?? src} alt={alt ?? ''} className='max-h-full max-w-full object-contain' />
      </button>
    );
  return <img src={src} alt={alt ?? ''} style={style} />;
}

interface MenuItem {
  readonly key?: string;
  readonly type?: 'divider';
  readonly label?: ReactNode;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
  readonly danger?: boolean;
  readonly onClick?: () => void;
}
export function Dropdown({
  children,
  menu,
}: {
  readonly children: ReactElement;
  readonly menu: { readonly items: readonly MenuItem[] };
  readonly [key: string]: unknown;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent data-canvas-overlay align='start'>
        {menu.items.map((item, index) =>
          item.type === 'divider' ? (
            <DropdownMenuSeparator key={item.key ?? `divider-${index}`} />
          ) : (
            <DropdownMenuItem
              key={item.key}
              disabled={item.disabled}
              onSelect={item.onClick}
              className={item.danger ? 'text-destructive-color focus:text-destructive-color' : undefined}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Timeline({
  items,
}: {
  readonly items: ReadonlyArray<{
    readonly dot?: ReactNode;
    readonly children?: ReactNode;
    readonly content?: ReactNode;
  }>;
}) {
  return (
    <ol className='space-y-4 border-l border-canvas-border pl-5'>
      {Children.toArray(
        items.map((item) => (
          <li className='relative'>
            {item.dot ? <span className='absolute -left-[29px]'>{item.dot}</span> : null}
            {item.children ?? item.content}
          </li>
        )),
      )}
    </ol>
  );
}
export function Space({
  children,
  className,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  return <div className={cx('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}
export function Card({
  children,
  className,
  onClick,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly [key: string]: unknown;
}) {
  const card = (
    <ShadcnCard className={cx('border-canvas-border bg-canvas-panel text-canvas-text', className)}>
      {children}
    </ShadcnCard>
  );
  return onClick ? (
    <button type='button' className='text-left' onClick={onClick}>
      {card}
    </button>
  ) : (
    card
  );
}

function SourceForm({
  children,
  className,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly [key: string]: unknown;
}) {
  return <div className={className}>{children}</div>;
}
function FormItem({
  children,
  label,
  extra,
}: {
  readonly children?: ReactNode;
  readonly label?: ReactNode;
  readonly extra?: ReactNode;
  readonly [key: string]: unknown;
}) {
  return (
    <label className='grid gap-2'>
      <span className='text-sm font-medium'>{label}</span>
      {children}
      {extra ? <span className='text-xs text-canvas-muted'>{extra}</span> : null}
    </label>
  );
}
export const Form = Object.assign(SourceForm, { Item: FormItem });

function SourceCheckbox({
  checked,
  value,
  onChange,
  children,
  className,
}: {
  readonly checked?: boolean;
  readonly value?: string;
  readonly onChange?: (event: { readonly target: { readonly checked: boolean; readonly value?: string } }) => void;
  readonly children?: ReactNode;
  readonly className?: string;
}) {
  return (
    <label className={cx('flex items-center gap-2', className)}>
      <ShadcnCheckbox
        checked={checked}
        onCheckedChange={(next) => onChange?.({ target: { checked: next === true, value } })}
      />
      {children}
    </label>
  );
}
interface CheckboxChildProps {
  readonly value?: string;
  readonly checked?: boolean;
  readonly onChange?: (event: { readonly target: { readonly checked: boolean; readonly value?: string } }) => void;
}
function CheckboxGroup({
  value,
  onChange,
  children,
  className,
}: {
  readonly value?: readonly string[];
  readonly onChange?: (values: string[]) => void;
  readonly children?: ReactNode;
  readonly className?: string;
}) {
  const selectedValues = value ?? [];
  return (
    <div className={className}>
      {Children.map(children, (child) =>
        isValidElement<CheckboxChildProps>(child)
          ? cloneElement(child, {
              checked: selectedValues.includes(child.props.value ?? ''),
              onChange: (event) =>
                onChange?.(
                  event.target.checked
                    ? [...selectedValues, event.target.value ?? '']
                    : selectedValues.filter((entry) => entry !== event.target.value),
                ),
            })
          : child,
      )}
    </div>
  );
}
export const Checkbox = Object.assign(SourceCheckbox, { Group: CheckboxGroup });

const Text = ({
  children,
  className,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly [key: string]: unknown;
}) => <span className={cx('text-sm text-canvas-muted', className)}>{children}</span>;
const Paragraph = ({
  children,
  className,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly [key: string]: unknown;
}) => <p className={cx('text-sm text-canvas-muted', className)}>{children}</p>;
export const Typography = { Paragraph, Text };
export const App = {
  useApp() {
    const integrations = useInfiniteCanvasIntegrations();
    const i18n = useInfiniteCanvasI18n();
    const confirmLabel = i18n.common.confirm;

    return useMemo(() => {
      const notify = (kind: 'success' | 'error' | 'info', message: ReactNode) =>
        integrations.toast?.({ kind, message: String(message) });
      return {
        message: {
          success: (message: ReactNode) => notify('success', message),
          error: (message: ReactNode) => notify('error', message),
          warning: (message: ReactNode) => notify('info', message),
          loading: (message: ReactNode) => {
            notify('info', message);
            return () => undefined;
          },
        },
        modal: {
          confirm: (options: {
            readonly title?: ReactNode;
            readonly content?: ReactNode;
            readonly okText?: ReactNode;
            readonly onOk?: () => void;
          }) => {
            void Promise.resolve(
              integrations.confirm({
                kind: 'leave-unsaved',
                title: String(options.title ?? confirmLabel),
                description: String(options.content ?? ''),
                confirmLabel: String(options.okText ?? confirmLabel),
              }),
            ).then((confirmed) => confirmed && options.onOk?.());
          },
        },
      };
    }, [confirmLabel, integrations]);
  },
};
