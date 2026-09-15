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
        versionCode = 2
        versionName = "0.1.1-preview"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
}
