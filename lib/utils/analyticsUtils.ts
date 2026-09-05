import { sendGAEvent } from '@next/third-parties/google';

export const sendGAEventBtnClicked = (value: string) => {
  sendGAEvent('event', value);
};
