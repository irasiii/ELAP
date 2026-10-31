import { I18nManager } from 'react-native';

export const colors = {
  bg: '#0D1210',
  surface: '#151C19',
  surface2: '#1C2521',
  line: '#222B26',
  border: '#2B3630',
  text: '#EEF2EE',
  muted: '#A9B4AE',
  accent: '#C8F04B',
  accentInk: '#0D1210',
  notice: '#2A2A12',
  noticeText: '#F2F0B8',
};

/**
 * ELAP's screens read right-to-left (Arabic). If the phone is already in RTL mode, React Native
 * flips rows for us; otherwise we reverse them ourselves.
 */
export const row = (I18nManager.isRTL ? 'row' : 'row-reverse') as 'row' | 'row-reverse';
export const textStart = (I18nManager.isRTL ? 'left' : 'right') as 'left' | 'right';
