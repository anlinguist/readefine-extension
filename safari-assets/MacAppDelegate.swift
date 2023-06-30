//
//  AppDelegate.swift
//  macOS (App)
//
//  Created by Andrew Nelson on 3/21/22.
//

import Cocoa
import UserNotifications

@main
class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Override point for customization after application launch.
        registerForPushNotifications()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
        
        func application(_ application: NSApplication,
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
        
        func application(_ application: NSApplication,
                    didFailToRegisterForRemoteNotificationsWithError
                        error: Error) {
           // Try again later.
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
                    DispatchQueue.main.async {NSApplication.shared.registerForRemoteNotifications()}
                }
            }
        
        // called when notification is tapped
        func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {

            let userInfo = response.notification.request.content.userInfo
            if let aps = userInfo["aps"] as? NSDictionary {
                if let alert = aps["alert"] as? NSDictionary {
                    if let subtitle = alert["subtitle"] as? NSString {
                        NSLog(subtitle as String)
                                NSLog("CCCCC app is in BACKGROUND - userInfo: ", subtitle) // do something with dict when app is in the background and user taps the notification
                        
                           
                            if let url = URL(string: subtitle as String) {
                                NSWorkspace.shared.open([url],
                                                        withAppBundleIdentifier:"com.apple.Safari",
                                                        options: [],
                                                        additionalEventParamDescriptor: nil,
                                                        launchIdentifiers: nil)
                            }
                    }
                }
            }
            completionHandler()
        }

}
