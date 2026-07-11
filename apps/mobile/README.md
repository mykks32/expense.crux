# expense.crux mobile

Mobile app for expense.crux, built with [Expo](https://expo.dev) ([`create-expo-app`](https://www.npmjs.com/package/create-expo-app) SDK 54 template).

## Get started

From the repo root:

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Point the app at the backend

   ```bash
   cp apps/mobile/.env.example apps/mobile/.env   # then edit EXPO_PUBLIC_API_URL — see comments in the file
   ```

3. Start the app

   ```bash
   pnpm --filter @expense.crux/mobile start
   ```

## Auth architecture

- `src/lib/api.ts` — the shared axios instance. Attaches `Authorization: Bearer <token>` to every request except `/auth/{login,register,refresh}`; on a `401` it transparently calls `/auth/refresh` once (concurrent 401s share a single in-flight refresh) and retries the original request. If the refresh itself fails, it clears the session and notifies the auth store via `setSessionExpiredHandler` — a setter rather than a direct import, since the store depends on `features/auth/api.ts`, which depends on this client (a cycle otherwise).
- `src/lib/token-storage.ts` — wraps `expo-secure-store` (Keychain/Keystore-backed). Also caches the last-known user profile alongside the tokens, purely so `initialize()` can fall back to it on a transient network error instead of forcing a logout.
- `src/features/auth/api.ts` — pure network calls (`register`, `login`, `refreshToken`, `logout`), no side effects.
- `src/features/auth/store.ts` — Zustand store holding `user`/`loading`/`initialized`. `onAuthSuccess` is the single place that persists a session (tokens + cached user); `login`/`register` screens call the API directly via a React Query mutation and pass the result to `onAuthSuccess` on success. `initialize()` restores a session from a stored refresh token on app start — this backend has no `/auth/me`, so refreshing is the only way to get fresh user data on cold start.
- `src/app/_layout.tsx` — gates routing on session state via Expo Router's `Stack.Protected`: `(app)` renders when `user` is set, `(auth)` otherwise. No manual redirects needed — flipping `user` in the store (login, logout, or a failed background refresh) swaps the whole stack automatically.

## Styling

NativeWind (Tailwind for React Native) for layout/spacing on plain RN elements (`View`, `Text`, etc. via `className`), and [React Native Paper](https://callstack.github.io/react-native-paper/) for form/input components (`TextInput`, `Button`, `Card`) — Paper components style themselves via its own theme/`style` prop, since third-party components aren't automatically NativeWind-`className`-aware unless explicitly registered.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside `src/app`. This project uses [file-based routing](https://docs.expo.dev/router/introduction) — routes live under `src/app` rather than the template's default top-level `app/`, since Expo Router auto-detects a `src` directory.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
