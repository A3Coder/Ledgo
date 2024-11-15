package com.ledgo.alertdialogmodule

import android.app.AlertDialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback

class AlertDialogModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlertDialogModule"
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    fun showDialog(title: String, message: String, positiveButton: String, negativeButton: String, positiveCallback: Callback, negativeCallback: Callback) {
        val currentActivity = currentActivity ?: return

        val builder = AlertDialog.Builder(currentActivity)
        builder.setTitle(title)
        builder.setMessage(message)

        // Positive button action
        builder.setPositiveButton(positiveButton) { dialog, _ ->
             positiveCallback.invoke("positive") // Call JavaScript callback for success
            dialog.dismiss()
        }

        // Negative button action
        builder.setNegativeButton(negativeButton) { dialog, _ ->
            negativeCallback.invoke("negative") // Call JavaScript callback for cancel
            dialog.dismiss()
        }

        // Customization - You can customize the dialog here
        val dialog = builder.create()
        dialog.setOnShowListener {
            // dialog.getButton(DialogInterface.BUTTON_POSITIVE).setTextColor(Color.GREEN)
            dialog.getButton(DialogInterface.BUTTON_POSITIVE).setTextColor(Color.parseColor("#07D589"))
            // dialog.getButton(DialogInterface.BUTTON_NEGATIVE).setTextColor(Color.RED)
            dialog.getButton(DialogInterface.BUTTON_NEGATIVE).setTextColor(Color.parseColor("#FAB1C4"))
        }

        dialog.show()
    }
}