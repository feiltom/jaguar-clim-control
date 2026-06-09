import { NativeModules } from 'react-native';

const { LaunchModule } = NativeModules;

export function launchApp(packageName: string) {
  LaunchModule?.launchApp(packageName);
}
