/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-template */
import queryString from 'query-string';

import { removeEmptyProperties } from './objectUtils';

export function objToQueryStr(path: string, obj: Record<keyof any, any>): string {
  const qStr = queryString.stringify(removeEmptyProperties(obj));
  return `${path}${qStr && '?'}${qStr}`;
}

export function generateBearerToken(token: string) {
  return `Bearer ${token}`;
}

export const clientSideGetCookie = (name: string): string => {
  if (!document) return '';

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return '';
};
