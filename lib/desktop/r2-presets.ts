import { decryptValue, encryptValue } from '@/lib/utils/cryptoUtils';

const R2_PRESETS_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-r2-presets-v1';
const R2_PRESETS_VERSION = 1;
export const MAX_R2_PRESETS = 20;

export type R2Preset = {
  id: string;
  name: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
  createdAt: number;
  updatedAt: number;
};

type R2PresetEnvelope = {
  version: typeof R2_PRESETS_VERSION;
  presets: R2Preset[];
};

export type R2PresetInput = Pick<
  R2Preset,
  'name' | 'accountId' | 'accessKeyId' | 'secretAccessKey' | 'bucketName' | 'publicDomain'
>;

export type R2PresetConfig = Omit<R2PresetInput, 'name'>;

export function initialR2Preset(presets: R2Preset[], config: Partial<R2PresetConfig>): R2Preset | undefined {
  const fields: (keyof R2PresetConfig)[] = [
    'accountId',
    'accessKeyId',
    'secretAccessKey',
    'bucketName',
    'publicDomain',
  ];
  const complete = fields.every((field) => typeof config[field] === 'string' && config[field]!.trim());
  if (!complete) return presets[0];
  return presets.find((preset) => fields.every((field) => preset[field] === config[field]!.trim()));
}

function cleanPreset(value: unknown): R2Preset | null {
  if (!value || typeof value !== 'object') return null;
  const preset = value as Partial<R2Preset>;
  const fields = [
    preset.id,
    preset.name,
    preset.accountId,
    preset.accessKeyId,
    preset.secretAccessKey,
    preset.bucketName,
    preset.publicDomain,
  ];
  if (!fields.every((field) => typeof field === 'string' && field.trim())) return null;
  if (!Number.isFinite(preset.createdAt) || !Number.isFinite(preset.updatedAt)) return null;
  return {
    id: preset.id!.trim(),
    name: preset.name!.trim().slice(0, 40),
    accountId: preset.accountId!.trim(),
    accessKeyId: preset.accessKeyId!.trim(),
    secretAccessKey: preset.secretAccessKey!.trim(),
    bucketName: preset.bucketName!.trim(),
    publicDomain: preset.publicDomain!.trim(),
    createdAt: preset.createdAt!,
    updatedAt: preset.updatedAt!,
  };
}

export async function loadR2Presets(): Promise<R2Preset[]> {
  if (typeof localStorage === 'undefined') return [];
  const encrypted = localStorage.getItem(R2_PRESETS_STORAGE_KEY);
  if (!encrypted) return [];
  const parsed = JSON.parse(await decryptValue(encrypted)) as Partial<R2PresetEnvelope>;
  if (parsed.version !== R2_PRESETS_VERSION || !Array.isArray(parsed.presets)) {
    throw new Error('Unsupported R2 preset data.');
  }
  return parsed.presets.flatMap((preset) => {
    const cleaned = cleanPreset(preset);
    return cleaned ? [cleaned] : [];
  });
}

export async function saveR2Presets(presets: R2Preset[]): Promise<void> {
  if (presets.length > MAX_R2_PRESETS) throw new Error(`You can save up to ${MAX_R2_PRESETS} R2 presets.`);
  const cleaned = presets.flatMap((preset) => {
    const value = cleanPreset(preset);
    return value ? [value] : [];
  });
  if (cleaned.length !== presets.length) throw new Error('An R2 preset is incomplete.');
  const envelope: R2PresetEnvelope = { version: R2_PRESETS_VERSION, presets: cleaned };
  localStorage.setItem(R2_PRESETS_STORAGE_KEY, await encryptValue(JSON.stringify(envelope)));
}

export function upsertR2Preset(presets: R2Preset[], input: R2PresetInput, selectedId?: string): R2Preset[] {
  const now = Date.now();
  const name = input.name.trim().slice(0, 40);
  if (!name) throw new Error('Preset name is required.');
  const selected = presets.find((preset) => preset.id === selectedId);
  const duplicate = presets.find(
    (preset) => preset.id !== selectedId && preset.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
  );
  if (duplicate) throw new Error('A preset with this name already exists.');
  if (!selected && presets.length >= MAX_R2_PRESETS) {
    throw new Error(`You can save up to ${MAX_R2_PRESETS} R2 presets.`);
  }
  const next: R2Preset = {
    id: selected?.id || crypto.randomUUID(),
    name,
    accountId: input.accountId.trim(),
    accessKeyId: input.accessKeyId.trim(),
    secretAccessKey: input.secretAccessKey.trim(),
    bucketName: input.bucketName.trim(),
    publicDomain: input.publicDomain.trim(),
    createdAt: selected?.createdAt || now,
    updatedAt: now,
  };
  return selected ? presets.map((preset) => (preset.id === selected.id ? next : preset)) : [...presets, next];
}

export function removeR2Preset(presets: R2Preset[], id: string): R2Preset[] {
  return presets.filter((preset) => preset.id !== id);
}
