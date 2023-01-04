//
//  AppDelegate.swift
//  dinoaccess
//
//  Created by Christopher Mühl on 14.01.2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  
  var window: UIWindow?
  var bridge: RCTBridge!
  
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let jsCodeLocation: URL
    
    if _isDebugAssertConfiguration() {
      jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
    } else {
      jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    }
    
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "dinoaccess", initialProperties: nil, launchOptions: launchOptions)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    
    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window?.rootViewController = rootViewController
    self.window?.makeKeyAndVisible()
    
    return true
  }
  
}
