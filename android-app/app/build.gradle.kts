import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val liveSiteUrl = providers.gradleProperty("siteUrl").getOrElse("")
// The emulator reaches the computer at 10.0.2.2. A real phone needs the computer's Wi-Fi IP.
val testSiteUrl = providers.gradleProperty("debugSiteUrl").getOrElse("http://10.0.2.2:3000")
val keystoreFile = rootProject.file("keystore.properties")
val building = gradle.startParameter.taskNames.joinToString(" ")

// A release pointing nowhere would ship a broken app, so stop the build instead.
if (building.contains("Release", ignoreCase = true) && !liveSiteUrl.startsWith("https://")) {
    throw GradleException("Set siteUrl=https://your-site in android-app/gradle.properties before a release build")
}

android {
    namespace = "com.mahatonetcafe.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.mahatonetcafe.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        if (keystoreFile.exists()) {
            val keys = Properties().apply { keystoreFile.inputStream().use { load(it) } }
            create("release") {
                storeFile = rootProject.file(keys.getProperty("storeFile"))
                storePassword = keys.getProperty("storePassword")
                keyAlias = keys.getProperty("keyAlias")
                keyPassword = keys.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            buildConfigField("String", "SITE_URL", "\"$testSiteUrl\"")
            applicationIdSuffix = ".debug"
        }
        release {
            buildConfigField("String", "SITE_URL", "\"$liveSiteUrl\"")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
            signingConfigs.findByName("release")?.let { signingConfig = it }
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.11.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
}
