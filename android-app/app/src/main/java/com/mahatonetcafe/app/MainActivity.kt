package com.mahatonetcafe.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

/**
 * Hosts the Mahato Net Cafe website, so rates and services changed in the admin panel
 * reach the app at once. Adds what a browser tab cannot do well: camera capture for
 * documents, saving receipts to Downloads, and handing UPI, call and WhatsApp links to
 * the right app.
 */
class MainActivity : ComponentActivity() {

    private lateinit var web: WebView
    private lateinit var progress: ProgressBar
    private lateinit var offline: View

    private val siteHost: String = Uri.parse(BuildConfig.SITE_URL).host.orEmpty()

    private var pendingFiles: ValueCallback<Array<Uri>>? = null
    private var cameraFile: File? = null

    private val filePicker = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val callback = pendingFiles ?: return@registerForActivityResult
        pendingFiles = null
        if (result.resultCode != RESULT_OK) {
            callback.onReceiveValue(null)
            return@registerForActivityResult
        }
        val picked = result.data?.data
        val photo = cameraFile?.takeIf { it.length() > 0 }
        when {
            picked != null -> callback.onReceiveValue(arrayOf(picked))
            photo != null -> Thread {
                // Phone cameras often exceed the site's 5 MB limit, so shrink before attaching.
                PhotoShrinker.shrink(photo)
                val uri = FileProvider.getUriForFile(this, "$packageName.files", photo)
                runOnUiThread { callback.onReceiveValue(arrayOf(uri)) }
            }.start()
            else -> callback.onReceiveValue(null)
        }
    }

    private val storagePermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) toast(R.string.storage_needed)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val root = findViewById<View>(R.id.root)
        web = findViewById(R.id.web)
        progress = findViewById(R.id.progress)
        offline = findViewById(R.id.offline)

        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        WindowCompat.getInsetsController(window, root).isAppearanceLightStatusBars = true

        configureWebView()

        findViewById<Button>(R.id.retry).setOnClickListener {
            offline.visibility = View.GONE
            web.reload()
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) {
                    web.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl(BuildConfig.SITE_URL)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            // Lets the website hide its "download our app" section inside the app.
            userAgentString = "$userAgentString MahatoNetCafeApp/${BuildConfig.VERSION_NAME}"
        }
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(web, true) // Razorpay checkout needs this
        }
        web.webViewClient = SiteClient()
        web.webChromeClient = ChromeClient()
        web.setDownloadListener { url, userAgent, disposition, mime, _ ->
            download(url, userAgent, disposition, mime)
        }
    }

    private inner class SiteClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val uri = request.url
            val isWeb = uri.scheme == "http" || uri.scheme == "https"
            if (isWeb && (!request.isForMainFrame || staysInApp(uri))) return false
            openOutside(uri)
            return true
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
            progress.visibility = View.VISIBLE
        }

        override fun onPageFinished(view: WebView, url: String?) {
            progress.visibility = View.GONE
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (request.isForMainFrame) offline.visibility = View.VISIBLE
        }
    }

    private inner class ChromeClient : WebChromeClient() {
        override fun onProgressChanged(view: WebView, newProgress: Int) {
            progress.progress = newProgress
        }

        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams,
        ): Boolean {
            pendingFiles?.onReceiveValue(null)
            pendingFiles = filePathCallback
            filePicker.launch(buildChooser())
            return true
        }
    }

    private fun buildChooser(): Intent {
        val documents = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/pdf", "image/jpeg", "image/png"))
        }
        val chooser = Intent.createChooser(documents, getString(R.string.choose_file))
        cameraIntent()?.let { chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(it)) }
        return chooser
    }

    private fun cameraIntent(): Intent? {
        val dir = File(cacheDir, "camera").apply { mkdirs() }
        dir.listFiles()?.forEach { it.delete() } // Never keep an earlier customer document around
        val file = File(dir, "document-${System.currentTimeMillis()}.jpg")
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        if (intent.resolveActivity(packageManager) == null) return null
        cameraFile = file
        val uri = FileProvider.getUriForFile(this, "$packageName.files", file)
        return intent.putExtra(MediaStore.EXTRA_OUTPUT, uri)
            .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
    }

    /** Only the shop's own pages and Razorpay's payment pages open inside the app. */
    private fun staysInApp(uri: Uri): Boolean {
        val host = uri.host ?: return false
        return host == siteHost || host == "razorpay.com" || host.endsWith(".razorpay.com")
    }

    private fun openOutside(uri: Uri) {
        try {
            val intent = if (uri.scheme == "intent") {
                // Pages can craft intent links, so strip anything that could target private components.
                Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME).apply {
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    component = null
                    selector = null
                }
            } else {
                Intent(Intent.ACTION_VIEW, uri)
            }
            startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            toast(R.string.no_app)
        } catch (_: java.net.URISyntaxException) {
            toast(R.string.no_app)
        }
    }

    private fun download(url: String, userAgent: String, disposition: String?, mime: String?) {
        val needsPermission = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) !=
            PackageManager.PERMISSION_GRANTED
        if (needsPermission) {
            storagePermission.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            return
        }
        try {
            val name = URLUtil.guessFileName(url, disposition, mime)
            val request = DownloadManager.Request(Uri.parse(url))
                .setMimeType(mime)
                // Receipts are private, so the download must carry the login session.
                .addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url).orEmpty())
                .addRequestHeader("User-Agent", userAgent)
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name)
            getSystemService(DownloadManager::class.java).enqueue(request)
            toast(R.string.download_started)
        } catch (_: IllegalArgumentException) {
            toast(R.string.download_failed)
        } catch (_: SecurityException) {
            toast(R.string.download_failed)
        }
    }

    private fun toast(message: Int) = Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush() // Keep the customer signed in after the app closes
    }
}
