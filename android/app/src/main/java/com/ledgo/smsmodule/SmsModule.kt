package com.ledgo.smsmodule

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback

class SmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SmsModule"
    }

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, callback: Callback) {
        try {
            val uriText = "smsto:$phoneNumber" // This will directly open SMS app without a chooser
            val uri = Uri.parse(uriText)

            val sendIntent = Intent(Intent.ACTION_SENDTO).apply {
                data = uri
                putExtra("sms_body", message)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            // Check if there is an app that can handle the intent
            reactApplicationContext.startActivity(sendIntent)
            callback.invoke(null, "SMS Intent Launched Successfully")

        } catch (e: Exception) {
            callback.invoke(e.localizedMessage)
        }
    }
}
