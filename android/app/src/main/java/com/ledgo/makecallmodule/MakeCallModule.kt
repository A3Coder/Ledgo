package com.ledgo.makecallmodule

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.Promise

@ReactModule(name = "MakeCallModule")  // Add this annotation
class MakeCallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var promise: Promise? = null

    override fun getName(): String {
        return "MakeCallModule"
    }

    @ReactMethod
    fun makeCall(phoneNumber: String, promise: Promise) {
        this.promise = promise
        val uri = Uri.parse("tel:$phoneNumber")
        val callIntent = Intent(Intent.ACTION_CALL).apply {
            data = uri
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        // Check if the CALL_PHONE permission is granted
        if (ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            // Permission is granted, start the call
            if (callIntent.resolveActivity(reactApplicationContext.packageManager) != null) {
                reactApplicationContext.startActivity(callIntent)
                promise.resolve("Call Started Successfully")
            } else {
                promise.reject("No Call App Found")
            }
        } else {
            // Request the permission
            val activity = reactApplicationContext.currentActivity
            if (activity != null) {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.CALL_PHONE),
                    REQUEST_CODE_CALL_PHONE // Using the defined constant
                )
            } else {
                promise.reject("Activity Not Found", "No activity found to request permission.")
            }    
        }
    }

    @ReactMethod
    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (requestCode == REQUEST_CODE_CALL_PHONE) {
            if (grantResults.isNotEmpty()) {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // Permission granted, resolve the promise
                    promise?.resolve("Call permission granted")
                } else {
                    // Permission denied, reject the promise
                    promise?.reject("Permission Denied", "CALL_PHONE permission is required to make calls.")
                }
            } else {
                // No results, reject the promise
                promise?.reject("Permission Request Failed", "No results returned for permission request.")
            }
        }
    }

    companion object {
        private const val REQUEST_CODE_CALL_PHONE = 1
    }
}