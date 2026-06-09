package com.cardashboard;

import android.content.Intent;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class LaunchModule extends ReactContextBaseJavaModule {
    LaunchModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "LaunchModule";
    }

    @ReactMethod
    public void launchApp(String packageName) {
        PackageManager pm = getReactApplicationContext().getPackageManager();
        Intent intent = pm.getLaunchIntentForPackage(packageName);
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }
}
