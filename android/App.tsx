import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { serialService } from './src/services';
import { useDashboardStore } from './src/store';

export default function App() {
  const setConnectionStatus = useDashboardStore((s) => s.setConnectionStatus);

  useEffect(() => {
    serialService.onConnectionChange((connected) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    });

    setConnectionStatus('connecting');
    serialService
      .connect(115200)
      .then(() => {
        serialService.send('PING');
        serialService.send('CLIM?');
      })
      .catch(() => setConnectionStatus('disconnected'));

    return () => serialService.disconnect();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <DashboardScreen />
    </SafeAreaProvider>
  );
}
