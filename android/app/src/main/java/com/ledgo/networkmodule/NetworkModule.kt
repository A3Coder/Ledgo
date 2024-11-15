package com.ledgo.networkmodule

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NetworkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NetworkModule"
    }

    @ReactMethod
    fun isConnected(promise: Promise) {
        val connectivityManager = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val activeNetwork = connectivityManager.getNetworkCapabilities(network)
            val isConnected = activeNetwork != null &&
                    (activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))
            promise.resolve(isConnected)
        } else {
            val networkInfo = connectivityManager.activeNetworkInfo
            promise.resolve(networkInfo?.isConnectedOrConnecting == true)
        }
    }
}
