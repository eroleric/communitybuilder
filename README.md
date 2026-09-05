# Mutual Skills App

CommonHands is an interactive cross-platform skill-trading prototype built with Expo and TypeScript.

## What you can explore

The main navigation is Discover, Trades, and Messages. Open your profile from the avatar; voluntary Communities and the free shelf are secondary links.

- Neighbor cards emphasize personalities and interests. Add your own interests and working style; shared interests appear as conversation starters.
- After signup, optionally choose what help you are open to receiving. Discovery prioritizes reciprocal skill matches without scoring people's social compatibility.
- Start with a short swap invitation using selectable services. Simulate interest, a suggested adjustment, or a kind decline before filling in a detailed agreement.
- Invitations and agreement drafts autosave. Completed trades can be copied into a fresh invitation while their original agreements remain available.
- Reuse your tools/materials and scope-limit preferences for new invitations. These are suggested defaults, not commitments by another person.

- Search and filter sample members by skill, distance, availability, and remote service; bookmark profiles.
- Create an offer-first profile with your skills, experience, availability, and approximate area.
- Build a three-step trade proposal with both scopes, effort, materials, timing, and exclusions.
- Save drafts, revise proposals, and simulate acceptance and separate completion confirmations.
- Leave fairness feedback and view demo contribution stats (karma is not currency).
- Try local conversations, voluntary communities, optional gift interest, blocking, and local reports.
- Return after a reload: changes persist on this device through AsyncStorage.
- Choose Local, Remote, or Local & Remote service reach. Approximate location only supports physical-service distance and travel radius.
- Join multiple communities voluntarily, choose a Primary Community, leave without losing history, and browse or trade without joining any community.
- Explore community discovery, detail tabs, leadership, capability supply and demand, activity, transparent progression, creation, and normalized leaderboards.
- Search people across all community boundaries; shared membership is only a modest secondary relevance signal.

All members, reviews, distances, and pre-existing trust statistics are fictional examples. No backend, authentication, credential verification, live messaging, moderation, or cloud synchronization is connected. Simulation controls do not represent real acceptance by another person.

## Start developing

On Windows, double-click `Start App.cmd` to launch the browser preview without typing commands. Keep its server window open while using the app; close that window to stop it.

Open PowerShell in this folder and run:

```powershell
npm start
```

From the Expo terminal:

- Press `a` to open the Android emulator.
- Scan the QR code with Expo Go on a physical Android or iPhone.
- Press `w` to open the web preview.

You can also launch a platform directly:

```powershell
npm run android
npm run web
```

`App.tsx` loads the app. Edit `src/CommonHands.tsx` for screens and interactions, `src/NeighborDiscovery.tsx` for discovery and personal preferences, `src/ui.tsx` for shared components and styling, and `src/data.ts` for types and sample content. Changes reload automatically.

Community types, permissions, sample entities, progression, and leaderboard calculations are isolated in `src/communityTypes.ts`, `src/communityData.ts`, `src/communityProgression.ts`, and `src/CommunityHub.tsx`. Location remains separately handled by `src/locationHelpers.ts`.

## Validation

```powershell
npx tsc --noEmit
npx expo-doctor
```

Browser testing covered the proposal-to-completion journey, required-field validation, persistence after refresh, and mobile/desktop layouts. Android and iOS JavaScript bundle exports have been checked; this does not replace testing on physical devices.

## iPhone development from Windows

The shared React Native code supports iOS, but Apple's iOS Simulator only runs on macOS. Test on a physical iPhone with Expo Go during development, or use a Mac or remote-device service for iOS-specific testing.

## Android emulator

Android Studio and the Android SDK are installed. If the emulator does not launch from Expo, open Android Studio once, select **Device Manager**, and start `Pixel_Latest_Update`. Then run `npm run android` again.
