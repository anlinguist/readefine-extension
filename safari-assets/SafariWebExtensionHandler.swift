//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Andrew Nelson on 3/15/22.
//

import SafariServices
import os.log

//let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    
    
    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as? NSExtensionItem
        let message = item?.userInfo?[SFExtensionMessageKey] as? [String: Any]
        guard let name = message?["message"] as? String else {return}
        let response = NSExtensionItem()
        var r_value: String
        if name == "get_device_id" {
            let userDefaults = UserDefaults(suiteName: "group.com.Readefine.Readefine")
            r_value = userDefaults?.string(forKey: "deviceToken") ?? "not_found"
//            obtain the device_token from stored settings
        }
        else {
            r_value = "not_found"
        }
        NSLog("\(r_value)")
        response.userInfo = [ "message": [ "device_token": r_value ] ]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
