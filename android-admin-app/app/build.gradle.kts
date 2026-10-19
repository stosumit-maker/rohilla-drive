plugins {
    id("com.android.application")
}

android {
    namespace = "com.rohilladrive.admin"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.rohilladrive.admin"
        minSdk = 23
        targetSdk = 35
        versionCode = 3
        versionName = "0.2.0-preview"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
}
