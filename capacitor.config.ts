import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tilio.learn',
  appName: 'Tilio',
  webDir: 'android-web/out',
  server: {
    androidScheme: 'https',
  },
}

export default config
