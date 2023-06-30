//
//  AppDelegate.swift
//  iOS (App)
//
//  Created by Andrew Nelson on 3/13/22.
//

import UIKit
import os.log
@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        registerForPushNotifications()
        return true
    }
    
    func application(_ application: UIApplication,
                didRegisterForRemoteNotificationsWithDeviceToken
                    deviceToken: Data) {
        let tokenParts = deviceToken.map { data -> String in
            return String(format: "%02.2hhx", data)
        }
        let token = tokenParts.joined()
        NSLog("Device Token: \(token)")
        
        if let userDefaults = UserDefaults(suiteName: "group.com.Readefine.Readefine") {
            userDefaults.set("\(token)", forKey: "deviceToken")
        }
//       self.sendDeviceTokenToServer(data: deviceToken)
    }
    
    func application(_ application: UIApplication,
                didFailToRegisterForRemoteNotificationsWithError
                    error: Error) {
       // Try again later.
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
    
    
    func registerForPushNotifications() {
        
        UNUserNotificationCenter.current().delegate = self
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
          UNUserNotificationCenter.current().requestAuthorization(
              options: authOptions,
              completionHandler: { _, _ in }
          )
          getNotificationSettings()
        }

        func getNotificationSettings() {
            UNUserNotificationCenter.current().getNotificationSettings { (settings) in
                NSLog("Notification settings: \(settings)")
                guard settings.authorizationStatus == .authorized else { return }
                DispatchQueue.main.async {UIApplication.shared.registerForRemoteNotifications()}
            }
        }
    
    // called when notification is tapped
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {

        let userInfo = response.notification.request.content.userInfo
        if let aps = userInfo["aps"] as? NSDictionary {
            if let alert = aps["alert"] as? NSDictionary {
                if let subtitle = alert["subtitle"] as? NSString {
                    NSLog(subtitle as String)
                    let state = UIApplication.shared.applicationState
                    if state == .inactive || state == .background {
                            
                            NSLog("CCCCC app is in BACKGROUND - userInfo: ", subtitle) // do something with dict when app is in the background and user taps the notification
                        if let url = URL(string: subtitle as String) {
                            UIApplication.shared.open(url)
                        }
                            
                    } else {
                            NSLog("CCCCC app is in FOREGROUND - userInfo: ", subtitle) // do something with dict when app is in the foreground and user taps the notification
                    }
                   //Do stuff
                }
            }
        }
        completionHandler()
    }
}