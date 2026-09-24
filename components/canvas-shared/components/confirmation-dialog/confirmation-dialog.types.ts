export type ConfirmationDialogVariant = 'default' | 'destructive';

export interface ConfirmationDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly confirmVariant?: ConfirmationDialogVariant;
  readonly pending?: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}
