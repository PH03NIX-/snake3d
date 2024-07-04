import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snake3d.app',
  appName: 'snake3d',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
