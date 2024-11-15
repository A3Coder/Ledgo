package com.ledgo.directsmsmodule

import android.Manifest
import android.content.pm.PackageManager
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

@ReactModule(name = SendDirectSMSModule.MODULE_NAME)
class SendDirectSMSModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), PermissionListener {

    private var phoneNumber: String? = null
    private var message: String? = null
    private var smsPromise: Promise? = null

    companion object {
        const val MODULE_NAME = "SendDirectSmsModule"
        const val SMS_PERMISSION_REQUEST_CODE = 1
    }

    override fun getName(): String {
        return MODULE_NAME
    }

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, promise: Promise) {
        this.phoneNumber = phoneNumber
        this.message = message
        this.smsPromise = promise

        // Check if permission is granted
        if (ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.SEND_SMS)
            == PackageManager.PERMISSION_GRANTED) {
            sendSmsDirectly()
        } else {
            // Request permission
            val activity = currentActivity
            if (activity is PermissionAwareActivity) {
                activity.requestPermissions(arrayOf(Manifest.permission.SEND_SMS), SMS_PERMISSION_REQUEST_CODE, this)
            } else {
                promise.reject("ACTIVITY_ERROR", "Activity is not available.")
            }
        }
    }

    private fun sendSmsDirectly() {
        try {
            val smsManager = SmsManager.getDefault()
            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            smsPromise?.resolve("SMS sent successfully!")
        } catch (e: Exception) {
            smsPromise?.reject("SMS_FAILED", "Failed to send SMS: ${e.message}")
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ): Boolean {
        if (requestCode == SMS_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                sendSmsDirectly()
            } else {
                smsPromise?.reject("PERMISSION_DENIED", "SMS permission denied")
            }
            return true
        }
        return false
    }
}
