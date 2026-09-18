# ROHILLA DRIVE Admin Android app

This directory contains the Android packaging layer for the secure ROHILLA DRIVE Administration Console.

- Package: `com.rohilladrive.admin`
- Default launch URL: `https://www.rohilladrive.com/admin`
- Packaging model: Android Trusted Web Activity (TWA)
- Backend/auth/data: the same production Rohilla Drive web platform and Supabase security model
- No production database changes are required for the Android package

## Preview APK

The GitHub Actions workflow builds a debug-signed preview APK for installation testing. Debug signing is only for testing and is not the final Play Store identity.

## Final release requirements

Before a permanent production APK/AAB or Play Store release:

1. Create and securely retain the final Android signing key outside the repository.
2. Add the matching SHA-256 certificate fingerprint to `https://www.rohilladrive.com/.well-known/assetlinks.json` so Android/Chrome can verify the TWA domain.
3. Build a release AAB/APK with the permanent signing identity.
4. Test login, MFA, photo/file upload, back navigation and administrator web-push notifications on a real Android device.
5. Publish only after the signed release passes device acceptance testing.

Do not commit a private signing key or password to GitHub.
