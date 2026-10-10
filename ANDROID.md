# Tilio Android Phase 1

This project uses Capacitor 8 with a bundled learner frontend and the existing hosted Tilio backend.

## Architecture

- `npm run build:web` builds the normal hosted Next.js application, including its route handlers.
- `npm run build:android:web` builds the static project in `android-web/`. Its only page imports the existing learner application, so there is no duplicate learner source tree.
- The Android export contains no Next.js API routes. Client API calls use `NEXT_PUBLIC_TILIO_BACKEND_ORIGIN`; browser and Telegram builds retain same-origin `/api/...` behavior.
- `npm run android:sync` rebuilds the static frontend and copies it into the native project.
- `npm run android:build:debug` syncs and runs Gradle `assembleDebug`.

The Android build defaults its public backend origin to `https://www.tilio.online`. Override `NEXT_PUBLIC_TILIO_BACKEND_ORIGIN` at build time when testing another HTTPS deployment. Never place server credentials in this variable or any other `NEXT_PUBLIC_*` value.

## Native configuration

- Application ID: `com.tilio.learn`
- App name: `Tilio`
- Minimum SDK: 26
- Compile/target SDK: 36
- Version code/name: `1` / `1.0` for the debug foundation

The existing Tilio logo and mascot are reused as temporary debug launcher and splash resources. They must be replaced with final density-aware adaptive, round, monochrome, splash, and Play Store assets before production.

## Phase 1 limitations

- Google sign-in is hidden on Android pending a system-browser/native OAuth flow.
- Telegram authentication and Telegram-only purchasing are hidden on standalone Android.
- Telegram Stars, Click, Payme, and manual tester entitlement are not available in Android.
- Email authentication remains available when Supabase public configuration is present; guest mode remains the default safe path.
- Speaking exercises still depend on WebView speech-recognition availability. Native microphone/speech integration is Phase 2.
- Back handling closes supported overlays, sends secondary screens to Home, and exits at Home/auth/onboarding. It does not implement a predictive-back history stack.
- Local Zustand persistence remains WebView `localStorage`; native migration/secure credential storage is Phase 2.

## Debug build prerequisites

Install Android Studio/SDK Platform 36 and its bundled JDK, then set the standard Android SDK environment for command-line builds. No production signing material is required or included.
