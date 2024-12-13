package com.ledgo.pdffileviewermodule

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

import android.Manifest
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class FileViewerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext

    override fun getName(): String {
        return "FileViewer"
    }

    @ReactMethod
    fun openFile(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FileNotFound", "The file does not exist at the given path.")
                return
            }

            val uri: Uri = FileProvider.getUriForFile(
                context,
                context.packageName + ".fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/pdf")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(intent, "Open PDF").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(chooser)
            promise.resolve("File opened successfully")
        } catch (e: ActivityNotFoundException) {
            promise.reject("NoViewerFound", "No application found to open this file.")
        } catch (e: Exception) {
            Log.e("FileViewerModule", "Error opening file: ${e.message}")
            promise.reject("Error", "An error occurred while opening the file: ${e.message}")
        }
    }

    @ReactMethod
    fun openFileFromStorage(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FileNotFound", "The file does not exist at the given path.")
                return
            }

            // Request permissions if necessary
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    currentActivity!!,
                    arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE),
                    1
                )
                promise.reject("PermissionDenied", "Permission to read storage is denied.")
                return
            }

            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, getMimeType(filePath))
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(intent, "Open file").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(chooser)
            promise.resolve("File opened successfully.")
        } catch (e: ActivityNotFoundException) {
            promise.reject("NoViewerFound", "No application found to open this file.")
        } catch (e: Exception) {
            Log.e("FileViewerModule", "Error opening file: ${e.message}")
            promise.reject("Error", "An error occurred while opening the file: ${e.message}")
        }
    }

    private fun getMimeType(filePath: String): String {
        return when {
            filePath.endsWith(".pdf") -> "application/pdf"
//            filePath.endsWith(".jpg") || filePath.endsWith(".jpeg") -> "image/jpeg"
//            filePath.endsWith(".png") -> "image/png"
            else -> "*/*" // Default for unknown file types
        }
    }
}
