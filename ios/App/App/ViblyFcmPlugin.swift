import Capacitor
import Foundation

/// Exposes the last FCM token to JavaScript so the app can request it when the user enables notifications
/// (avoids relying on the event being received in time).
@objc(ViblyFcmPlugin)
public class ViblyFcmPlugin: CAPPlugin, CAPBridgedPlugin {
    private let kUserDefaultsFcmToken = "vibly_last_fcm_token"

    public let identifier = "ViblyFcmPlugin"
    public let jsName = "ViblyFcm"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getLastFcmToken", returnType: CAPPluginReturnPromise)
    ]

    @objc func getLastFcmToken(_ call: CAPPluginCall) {
        let token = UserDefaults.standard.string(forKey: kUserDefaultsFcmToken)?.trimmingCharacters(in: .whitespacesAndNewlines)
        if let t = token, !t.isEmpty {
            call.resolve(["token": t])
        } else {
            call.resolve(["token": NSNull()])
        }
    }
}
