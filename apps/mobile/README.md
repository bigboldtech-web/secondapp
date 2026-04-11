# Second App — Mobile (Flutter)

The Flutter companion app for `apps/web`. Buyers browse the catalog, open listings, and sign in with the same OTP flow the web uses.

## What's here

```
apps/mobile/
├── pubspec.yaml           package config (http, shared_preferences,
│                          cached_network_image, intl)
├── analysis_options.yaml  flutter_lints + a few extras
├── lib/
│   ├── main.dart          MaterialApp + AppScope inherited widget
│   ├── theme.dart         color tokens + ThemeData matching
│   │                      apps/web's #E8553D coral + monochrome system
│   ├── api/client.dart    thin wrapper around /api/public/* endpoints
│   │                      with JWT persisted in shared_preferences
│   ├── models/listing.dart ListingCard, ListingDetail, Category,
│   │                      AppUser DTOs
│   └── screens/
│       ├── home_screen.dart      catalog grid + category pills
│       ├── listing_detail_screen.dart  photo carousel, specs, vendor
│       ├── login_screen.dart     OTP send/verify flow
│       └── profile_screen.dart   signed-in user summary + sign out
```

**Not included** yet: chat/inbox, checkout, vendor fulfillment. Those all need richer cookie-less endpoints on `apps/web` before the mobile side makes sense. Add them in small passes as demand justifies it.

## First run

This folder holds only Dart source + `pubspec.yaml` — the platform folders (`ios/`, `android/`, `macos/`, `windows/`, `linux/`, `web/`) are not committed because `flutter create` regenerates them deterministically. To initialize them locally:

```bash
cd apps/mobile
flutter create . --org in.gosecond --project-name second_app --platforms=ios,android
flutter pub get
```

Then point at your running web API and launch:

```bash
# Web dev server
cd ../..
npm run dev

# Mobile
cd apps/mobile
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000     # Android emulator
flutter run --dart-define=API_BASE_URL=http://localhost:3000    # iOS simulator
```

Replace `API_BASE_URL` with your staging or prod URL for real devices.

## Auth

Mobile uses the same JWT as web, but delivered in the response body instead of a cookie:

- `POST /api/public/auth/otp/send { phone }` — triggers the MSG91 SMS (or logs to console in dev)
- `POST /api/public/auth/otp/verify { phone, otp }` — returns `{ token, user }`
- `GET /api/public/auth/me` with `Authorization: Bearer <token>` — rehydrates the session on app restart

The token is persisted via `shared_preferences` under the key `sa_token`. Sign out calls `ApiClient.clearToken()` which also wipes the stored value.

## Theme

`lib/theme.dart` mirrors the design tokens from `apps/web/app/globals.css` — same coral (`#E8553D`), same off-white background, same neutral border. All typography uses the platform system font.

## Deep links

Home → `/listing/{id}` pushes `ListingDetailScreen`. There's no router package; `onGenerateRoute` in `main.dart` parses the path. Add `go_router` when you need nested routes.

## Launching against staging

Set `API_BASE_URL` via `--dart-define` so the binary is environment-specific:

```bash
flutter build apk --dart-define=API_BASE_URL=https://gosecond.in
flutter build ipa --dart-define=API_BASE_URL=https://gosecond.in
```
