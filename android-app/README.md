# Mahato Net Cafe Android App

Ye app aapki website ko Android app ke roop me chalata hai. Admin me rate ya service badalne par app me turant dikhta hai, app update nahi karna padta.

App ke apne kaam:

- Camera se document ki photo (5 MB se chhoti karke)
- Receiving Downloads folder me save
- UPI app, call aur WhatsApp seedhe khulna
- Internet na hone par alag screen, back button, splash screen

## Phone pe test karna

```bash
gradlew.bat assembleDebug -PdebugSiteUrl=https://mahatocafe.tech
```

APK yahan milega: `app/build/outputs/apk/debug/app-debug.apk`. Ise phone me copy karke install karein.

## Play Store ke liye build

1. Ek baar signing key banayein aur use surakshit jagah backup karein. Key kho gayi to app update nahi kar payenge.

   ```bash
   keytool -genkeypair -v -keystore mahato-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mahato
   ```

2. Isi folder me `keystore.properties` banayein:

   ```properties
   storeFile=mahato-release.jks
   storePassword=aapka-password
   keyAlias=mahato
   keyPassword=aapka-password
   ```

3. Build karein:

   ```bash
   gradlew.bat bundleRelease
   ```

   File yahan milegi: `app/build/outputs/bundle/release/app-release.aab`. Ise Play Console ke closed testing me upload karein.

`keystore.properties` aur `.jks` file kabhi GitHub pe na daalein. `.gitignore` inhe rok deta hai.

## Agla version

Har naye Play Store upload se pehle `app/build.gradle.kts` me `versionCode` ek badhayein.
