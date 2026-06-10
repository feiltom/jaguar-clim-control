import { create } from 'zustand';
import { serialService } from '@/services';

function parseSerialMessage(line: string) {
  const store = useDashboardStore.getState();
  store.addSerialLog({ direction: 'RX', message: line, ts: Date.now() });

  if (!line.startsWith('VAL:')) return;
  const [, key, val] = line.split(':');
  const on = val === '1';

  switch (key) {
    case 'AUTO':    store.setAutoFromSerial(on);    break;
    case 'REAR_H':  store.setRearFromSerial(on);    break;
    case 'RECIRC':  store.setRecircFromSerial(on);  break;
    case 'DEFROST': store.setMaxACFromSerial(on);   break;
  }
}

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export type SerialLogEntry = {
  direction: 'TX' | 'RX';
  message: string;
  ts: number;
};

const MAX_LOGS = 100;

interface DashboardState {
  // Climatisation
  tempDriver: number;
  tempPassenger: number;
  fanLevel: number;
  isAuto: boolean;
  isMaxAC: boolean;
  isRear: boolean;
  isRecirculation: boolean;
  acOn: boolean;

  // Radio
  radioOn: boolean;
  volume: number;
  source: string;
  trackTitle: string;
  isPlaying: boolean;

  // Système
  connectionStatus: ConnectionStatus;
  serialLogs: SerialLogEntry[];

  // Actions
  setTempDriver: (temp: number) => void;
  setTempPassenger: (temp: number) => void;
  setFanLevel: (level: number) => void;
  setAuto: (val: boolean) => void;
  setMaxAC: (val: boolean) => void;
  setRear: (val: boolean) => void;
  setRecirculation: (val: boolean) => void;
  setAcOn: (val: boolean) => void;
  setRadioOn: (val: boolean) => void;
  setVolume: (vol: number) => void;
  setSource: (src: string) => void;
  setTrackTitle: (title: string) => void;
  setPlaying: (val: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addSerialLog: (entry: SerialLogEntry) => void;
  setAutoFromSerial: (val: boolean) => void;
  setRearFromSerial: (val: boolean) => void;
  setRecircFromSerial: (val: boolean) => void;
  setMaxACFromSerial: (val: boolean) => void;
}

const send = (cmd: string) => {
  serialService.send(cmd);
  useDashboardStore.getState().addSerialLog({ direction: 'TX', message: cmd, ts: Date.now() });
};

export const useDashboardStore = create<DashboardState>((set) => ({
  tempDriver: 20,
  tempPassenger: 20,
  fanLevel: 2,
  isAuto: false,
  isMaxAC: false,
  isRear: false,
  isRecirculation: false,
  acOn: false,

  radioOn: false,
  volume: 15,
  source: 'FM',
  trackTitle: '',
  isPlaying: false,

  connectionStatus: 'disconnected',
  serialLogs: [],

  setTempDriver: (temp) => {
    const prev = useDashboardStore.getState().tempDriver;
    set({ tempDriver: temp });
    send(temp > prev ? 'TEMP:D:UP' : 'TEMP:D:DOWN');
  },
  setTempPassenger: (temp) => {
    const prev = useDashboardStore.getState().tempPassenger;
    set({ tempPassenger: temp });
    send(temp > prev ? 'TEMP:P:UP' : 'TEMP:P:DOWN');
  },
  setFanLevel: (level) => {
    const prev = useDashboardStore.getState().fanLevel;
    set({ fanLevel: level });
    if (level === 0) send('FAN:ON');
    else send(level > prev ? 'FAN:UP' : 'FAN:DOWN');
  },
  setAuto: (_val) => { send('AUTO:1'); },
  setMaxAC: (_val) => { send('DEFROST'); },
  setRear: (_val) => { send('REAR:1'); },
  setRecirculation: (_val) => { send('RECIRC:1'); },
  setAcOn: (val) => { set({ acOn: val }); send(`AC:${val ? 1 : 0}`); },
  setRadioOn: (val) => { set({ radioOn: val }); if (val) send('RADIO:1'); },
  setVolume: (vol) => {
    const prev = useDashboardStore.getState().volume;
    set({ volume: vol });
    send(vol > prev ? 'VOL:UP' : 'VOL:DOWN');
  },
  setSource: (src) => { set({ source: src }); send(`SRC:${src}`); },
  setTrackTitle: (title) => set({ trackTitle: title }),
  setPlaying: (val) => set({ isPlaying: val }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  addSerialLog: (entry) =>
    set((s) => ({
      serialLogs: s.serialLogs.length >= MAX_LOGS
        ? [...s.serialLogs.slice(1), entry]
        : [...s.serialLogs, entry],
    })),
  setAutoFromSerial:   (val) => set({ isAuto: val }),
  setRearFromSerial:   (val) => set({ isRear: val }),
  setRecircFromSerial: (val) => set({ isRecirculation: val }),
  setMaxACFromSerial:  (val) => set({ isMaxAC: val }),
}));

serialService.onReceive(parseSerialMessage);
