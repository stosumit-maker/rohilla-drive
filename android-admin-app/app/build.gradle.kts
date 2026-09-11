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
        versionCode = 1
        versionName = "0.1.0-preview"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.3")
}
