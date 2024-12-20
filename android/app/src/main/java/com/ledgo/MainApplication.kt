package com.ledgo

import com.ledgo.smsmodule.SmsPackage; // <-- Opens Default SMS App
import com.ledgo.dialermodule.DialerPackage; // <-- Opens Default Phone Dialer App
import com.ledgo.makecallmodule.MakeCallPackage; // <-- Makes Direct Call
import com.ledgo.opensettingsmodule.OpenSettingsPackage; // <-- Opens App Settings
import com.ledgo.alertdialogmodule.AlertDialogPackage; // <-- Shows Alert Dialog Box
import com.ledgo.directsmsmodule.SendDirectSMSPackage; // <-- Sends Direct SMS using Default SMS App
import com.ledgo.networkmodule.NetworkPackage; //<-- Checks Whether Device has Internet Connected or Not
import com.ledgo.pdffileviewermodule.FileViewerPackage //<-- Views a Particular File using Default Viewer
import com.ledgo.downloadmanagermodule.DownloadManagerPackage //<-- For Downloading File using Download Manager

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(SmsPackage())
              add(DialerPackage())
              add(MakeCallPackage())
              add(OpenSettingsPackage())
              add(AlertDialogPackage())
              add(SendDirectSMSPackage())
              add(NetworkPackage())
              add(FileViewerPackage())
              add(DownloadManagerPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
