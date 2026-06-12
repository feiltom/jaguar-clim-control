import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { serialService } from './src/services';
import { useDashboardStore } from './src/store';

export default function App() {
  const setConnectionStatus = useDashboardStore((s) => s.setConnectionStatus);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const tryConnect = () => {
    setConnectionStatus('connecting');
    serialService
      .connect(115200)
      .then(() => {
        serialService.send('PING');
        serialService.send('CLIM?');
      })
      .catch(() => setConnectionStatus('disconnected'));
  };

  useEffect(() => {
    serialService.onConnectionChange((connected) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    });

    tryConnect();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = nextState;
      if (wasBackground && nextState === 'active' && !serialService.isConnected()) {
        serialService.disconnect();
        tryConnect();
      }
    });

    return () => {
      subscription.remove();
      serialService.disconnect();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <DashboardScreen />
    </SafeAreaProvider>
  );
}
