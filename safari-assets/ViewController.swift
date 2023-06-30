//
//  ViewController.swift
//  Shared (App)
//
//  Created by Andrew Nelson on 3/12/22.
//

import WebKit

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.getreadefine.readefine.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = false
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
#if os(iOS)
        webView.evaluateJavaScript("show('ios')")
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                webView.evaluateJavaScript("show('mac', \(state.isEnabled)")
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
#if os(iOS)
        if (message.body as! String == "open-safari") {
            guard let url = URL(string: "https://app.getreadefine.com/welcome?browser=safariios") else {
                 return
            }

            if UIApplication.shared.canOpenURL(url) {
                 UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
#endif
#if os(macOS)
        if (message.body as! String == "open-safari") {
            guard let url = URL(string: "https://app.getreadefine.com/welcome?browser=safarimacos") else {
                 return
            }
            
            NSWorkspace.shared.open([url], withAppBundleIdentifier:"com.apple.Safari",
                                    options: [],
                                    additionalEventParamDescriptor: nil,
                                    launchIdentifiers: nil)
        }
#endif
    }

}
