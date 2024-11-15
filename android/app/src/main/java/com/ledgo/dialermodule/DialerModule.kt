package com.ledgo.dialermodule

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback

class DialerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DialerModule"
    }

    @ReactMethod
    fun makeCall(phoneNumber: String, callback: Callback) {
        try {
            val uri = Uri.parse("tel:$phoneNumber")
            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                data = uri
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactApplicationContext.startActivity(callIntent)
            callback.invoke(null, "Dialer Intent Launched Successfully")
        } catch (e: Exception) {
            callback.invoke(e.localizedMessage)
        }
    }
}
