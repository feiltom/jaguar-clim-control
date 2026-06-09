import { MockSerialService } from './MockSerialService';
import type { SerialService } from './SerialService';

// Passer à false quand le service USB natif est prêt
const USE_MOCK = false;

// require() conditionnel : le module natif USB n'est jamais chargé en mode mock
// (compatible Expo Go)
export const serialService: SerialService = USE_MOCK
  ? new MockSerialService()
  : (() => { const { UsbSerialService } = require('./UsbSerialService'); return new UsbSerialService(); })();

export type { SerialService };
