package com.abhi.homeremote

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.DialogInterface
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private val TAG = javaClass.simpleName
    private val PERMISSION_REQUEST_CODE = 123

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
        setContentView(R.layout.activity_main)
        try {
            actionBar?.hide()
        } catch (e: Exception) {
            Log.e(TAG, "onCreate: Failed to Hide ActionBar")
        }
        val url = getUrl()
        webView = findViewById(R.id.remoteWebView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true //needed to send commands
        webSettings.domStorageEnabled = true // To store configurations
        webSettings.allowContentAccess = false //revoking unnecessary vulnerable permission
        webSettings.allowFileAccess = false //revoking unnecessary vulnerable permission
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
            }
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            setupWebChromeClient()
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), PERMISSION_REQUEST_CODE)
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        webView.loadUrl(url)
        swipeRefreshLayout.setOnRefreshListener {
            webView.clearCache(false)
            webView.clearHistory()
            webView.reload()
        }
    }
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                setupWebChromeClient()
            } else {
                Toast.makeText(this, "Voice control won't work", Toast.LENGTH_SHORT).show()            }
        }
    }
    private fun setupWebChromeClient() {
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }
    }
    private fun saveUrlToPreference(url: String) {
        val sharedPreferences = getSharedPreferences("AppPreferences", MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString("savedUrl", url)
        editor.apply()
        Toast.makeText(this, "Loading...", Toast.LENGTH_SHORT).show()
        recreate()
    }

    private fun isValidUrl(url: String): Boolean {
        val pattern = "^http://\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/remote$"
        return url.matches(Regex(pattern))
    }

    private fun askUrlInput() {
        val inputEditText = EditText(this)
        inputEditText.inputType = InputType.TYPE_TEXT_VARIATION_URI
        inputEditText.hint = "http://192.168.xxx.xxx/remote"
        inputEditText.typeface = Typeface.MONOSPACE

        AlertDialog.Builder(this)
            .setTitle("Enter URL")
            .setMessage("\nExactly as shown in the browser.\nClear app data to reset.")
            .setIcon(R.mipmap.ic_launcher_round)
            .setView(inputEditText)
            .setPositiveButton(android.R.string.ok) { dialog: DialogInterface, _: Int ->
                val url = inputEditText.text.toString()
                if (isValidUrl(url)) {
                    saveUrlToPreference(url)
                } else {
                    askUrlInput() // Ask again if the URL is invalid
                }
                dialog.dismiss()
            }
            .setNegativeButton(android.R.string.cancel) { dialog: DialogInterface, _: Int ->
                dialog.cancel()
                finish()
            }
            .create()
            .show()
    }

    private fun getUrlFromPreference(): String? {
        val sharedPreferences = getSharedPreferences("AppPreferences", MODE_PRIVATE)
        return sharedPreferences.getString("savedUrl", null)
    }

    private fun getUrl(): String {
        val savedUrl = getUrlFromPreference()
        return if (savedUrl != null) {
            savedUrl // Return the saved URL if present
        } else {
            askUrlInput() // Prompt the user for URL input and handle the restart internally
            ""
        }
    }
}