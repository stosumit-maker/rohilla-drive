package com.rohilladrive.admin;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import android.graphics.drawable.GradientDrawable;

public class MainActivity extends Activity {
    private static final String BASE_URL = "https://www.rohilladrive.com";
    private static final int FILE_CHOOSER_REQUEST = 1001;

    private FrameLayout root;
    private View homeView;
    private LinearLayout workspaceView;
    private WebView webView;
    private TextView workspaceTitle;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(7, 16, 29));
        getWindow().setNavigationBarColor(Color.rgb(7, 16, 29));

        root = new FrameLayout(this);
        setContentView(root);

        homeView = buildHome();
        workspaceView = buildWorkspace();
        root.addView(homeView, matchParent());
        root.addView(workspaceView, matchParent());

        configureWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        }
        showHome();
    }

    private View buildHome() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(245, 247, 251));

        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(18), dp(18), dp(18), dp(28));
        scroll.addView(content, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        LinearLayout hero = new LinearLayout(this);
        hero.setOrientation(LinearLayout.VERTICAL);
        hero.setPadding(dp(20), dp(22), dp(20), dp(22));
        hero.setBackground(rounded(Color.rgb(7, 16, 29), 22));

        TextView brand = text("ROHILLA DRIVE", 23, Color.WHITE, Typeface.BOLD);
        hero.addView(brand);

        TextView sub = text("ADMINISTRATION APP", 12, Color.rgb(215, 181, 109), Typeface.BOLD);
        LinearLayout.LayoutParams subLp = wrap();
        subLp.topMargin = dp(4);
        hero.addView(sub, subLp);

        TextView intro = text("Mobile control centre for inventory, leads, RC, revenue and business operations.", 15, Color.rgb(222, 228, 238), Typeface.NORMAL);
        intro.setLineSpacing(0f, 1.2f);
        LinearLayout.LayoutParams introLp = matchWrap();
        introLp.topMargin = dp(14);
        hero.addView(intro, introLp);

        Button primary = actionButton("+ Add Vehicle", true);
        primary.setOnClickListener(v -> openWorkspace("/admin/add-vehicle", "Add Vehicle"));
        LinearLayout.LayoutParams primaryLp = matchWrap();
        primaryLp.topMargin = dp(18);
        hero.addView(primary, primaryLp);
        content.addView(hero, matchWrap());

        TextView secure = text("Secure administration • Existing ROHILLA DRIVE login + MFA", 13, Color.rgb(71, 84, 103), Typeface.BOLD);
        LinearLayout.LayoutParams secureLp = matchWrap();
        secureLp.topMargin = dp(16);
        secureLp.bottomMargin = dp(10);
        content.addView(secure, secureLp);

        addSectionTitle(content, "Daily Operations");
        addRow(content,
                tile("Dashboard & Leads", "/admin", "Dashboard"),
                tile("Inventory", "/admin/add-vehicle", "Inventory"));
        addRow(content,
                tile("Photo-First Listing", "/admin/photo-listing", "Photo Listing"),
                tile("Draft Review", "/admin/draft-review", "Draft Review"));
        addRow(content,
                tile("New Vehicle Leads", "/admin/new-vehicles", "New Vehicle Leads"),
                tile("Deal Management", "/admin/deal-rooms", "Deal Management"));

        addSectionTitle(content, "Money, RC & Verification");
        addRow(content,
                tile("Transactions & RC", "/admin/finance", "Transactions & RC"),
                tile("Revenue & Collections", "/admin/revenue", "Revenue & Collections"));
        addRow(content,
                tile("Verification", "/admin/verification", "Verification"),
                tile("Listing Intake", "/admin/poster-scan", "Listing Intake"));

        addSectionTitle(content, "Growth & Intelligence");
        addRow(content,
                tile("Marketing Studio", "/admin/growth", "Marketing Studio"),
                tile("Vehicle Intelligence", "/admin/vehicle-ai", "Vehicle Intelligence"));
        addRow(content,
                tile("Language Operations", "/admin/language", "Language Operations"),
                tile("Integrations", "/admin/connections", "Integrations"));

        addSectionTitle(content, "Network");
        Button businessHub = actionButton("Business Hub", false);
        businessHub.setOnClickListener(v -> openWorkspace("/business-hub", "Business Hub"));
        content.addView(businessHub, matchWrap());

        TextView foot = text("Preview app • Production data is never changed by opening a section.", 12, Color.rgb(102, 112, 133), Typeface.NORMAL);
        LinearLayout.LayoutParams footLp = matchWrap();
        footLp.topMargin = dp(18);
        content.addView(foot, footLp);

        return scroll;
    }

    private LinearLayout buildWorkspace() {
        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.setBackgroundColor(Color.WHITE);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(10), dp(8), dp(10), dp(8));
        bar.setBackgroundColor(Color.rgb(7, 16, 29));

        Button home = compactButton("Home");
        home.setOnClickListener(v -> showHome());
        bar.addView(home, new LinearLayout.LayoutParams(dp(74), dp(42)));

        workspaceTitle = text("Admin", 16, Color.WHITE, Typeface.BOLD);
        workspaceTitle.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams titleLp = new LinearLayout.LayoutParams(0, dp(42), 1f);
        titleLp.leftMargin = dp(12);
        bar.addView(workspaceTitle, titleLp);

        Button refresh = compactButton("Refresh");
        refresh.setOnClickListener(v -> {
            if (webView != null) webView.reload();
        });
        bar.addView(refresh, new LinearLayout.LayoutParams(dp(86), dp(42)));
        shell.addView(bar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        webView = new WebView(this);
        shell.addView(webView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        return shell;
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePath,
                    FileChooserParams fileChooserParams) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = filePath;

                try {
                    Intent chooserIntent = fileChooserParams.createIntent();
                    chooserIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    return false;
                }
            }
        });
    }

    private Button tile(String label, String path, String title) {
        Button button = actionButton(label, false);
        button.setGravity(Gravity.CENTER);
        button.setMinHeight(dp(86));
        button.setOnClickListener(v -> openWorkspace(path, title));
        return button;
    }

    private void addRow(LinearLayout parent, Button left, Button right) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setWeightSum(2f);

        LinearLayout.LayoutParams leftLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        leftLp.rightMargin = dp(6);
        row.addView(left, leftLp);

        LinearLayout.LayoutParams rightLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        rightLp.leftMargin = dp(6);
        row.addView(right, rightLp);

        LinearLayout.LayoutParams rowLp = matchWrap();
        rowLp.bottomMargin = dp(12);
        parent.addView(row, rowLp);
    }

    private void addSectionTitle(LinearLayout parent, String value) {
        TextView title = text(value, 16, Color.rgb(16, 24, 40), Typeface.BOLD);
        LinearLayout.LayoutParams lp = matchWrap();
        lp.topMargin = dp(14);
        lp.bottomMargin = dp(10);
        parent.addView(title, lp);
    }

    private Button actionButton(String label, boolean primary) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(label);
        button.setTextSize(14);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(primary ? Color.rgb(7, 16, 29) : Color.rgb(16, 24, 40));
        button.setGravity(Gravity.CENTER);
        button.setPadding(dp(12), dp(10), dp(12), dp(10));
        button.setBackground(rounded(primary ? Color.rgb(215, 181, 109) : Color.WHITE, 16,
                primary ? Color.rgb(215, 181, 109) : Color.rgb(218, 223, 232)));
        return button;
    }

    private Button compactButton(String label) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(label);
        button.setTextSize(12);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(Color.WHITE);
        button.setPadding(dp(4), 0, dp(4), 0);
        button.setBackground(rounded(Color.rgb(18, 32, 52), 12, Color.rgb(71, 84, 103)));
        return button;
    }

    private TextView text(String value, int sizeSp, int color, int style) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(sizeSp);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, style);
        return view;
    }

    private GradientDrawable rounded(int fill, int radiusDp) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(dp(radiusDp));
        return drawable;
    }

    private GradientDrawable rounded(int fill, int radiusDp, int stroke) {
        GradientDrawable drawable = rounded(fill, radiusDp);
        drawable.setStroke(dp(1), stroke);
        return drawable;
    }

    private FrameLayout.LayoutParams matchParent() {
        return new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT);
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private LinearLayout.LayoutParams wrap() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void showHome() {
        homeView.setVisibility(View.VISIBLE);
        workspaceView.setVisibility(View.GONE);
    }

    private void openWorkspace(String path, String title) {
        workspaceTitle.setText(title);
        homeView.setVisibility(View.GONE);
        workspaceView.setVisibility(View.VISIBLE);
        webView.loadUrl(BASE_URL + path);
    }

    private boolean handleNavigation(Uri uri) {
        String scheme = uri.getScheme();
        String host = uri.getHost();

        if ("https".equalsIgnoreCase(scheme)
                && host != null
                && (host.equalsIgnoreCase("rohilladrive.com")
                || host.equalsIgnoreCase("www.rohilladrive.com")
                || host.toLowerCase().endsWith(".rohilladrive.com"))) {
            return false;
        }

        try {
            Intent externalIntent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(externalIntent);
        } catch (ActivityNotFoundException ignored) {
            // Keep the app stable even if no external handler is installed.
        }
        return true;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (workspaceView.getVisibility() == View.VISIBLE) {
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
            } else {
                showHome();
            }
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
