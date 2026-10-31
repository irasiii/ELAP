import { createElapClient } from '@elap/core';

/**
 * ELAP backend address. Set EXPO_PUBLIC_API_URL in apps/mobile/.env, e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:3000   (your computer's LAN IP while developing)
 *   EXPO_PUBLIC_API_URL=https://elap.app            (production)
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = createElapClient(API_URL);
