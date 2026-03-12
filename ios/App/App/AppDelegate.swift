import UIKit
import UserNotifications
import Capacitor
import FirebaseCore
import FirebaseMessaging

private let kUserDefaultsFcmToken = "vibly_last_fcm_token"

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    private var lastFcmToken: String? {
        didSet {
            if let t = lastFcmToken { UserDefaults.standard.set(t, forKey: kUserDefaultsFcmToken) }
        }
    }
    private var didRegisterFcmPlugin = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialise Firebase (reads GoogleService-Info.plist)
        FirebaseApp.configure()
        Messaging.messaging().delegate = self

        // Set this class as the UNUserNotificationCenter delegate so push
        // notifications are displayed even when the app is in the foreground.
        UNUserNotificationCenter.current().delegate = self

        // If Firebase already has an FCM token, try to forward it after the bridge is ready.
        // The token can arrive before the WebView/JS is fully booted.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.trySendLastFcmTokenToJS()
        }
        // Register ViblyFcm plugin so JS can call getLastFcmToken() when user enables notifications.
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.registerViblyFcmPluginIfNeeded()
        }

        return true
    }

    // ── Firebase Messaging ──────────────────────────────────────────────────────

    /// Called by Firebase when the FCM registration token is first available or rotates.
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        if let token = fcmToken?.trimmingCharacters(in: .whitespacesAndNewlines), !token.isEmpty {
            lastFcmToken = token
            print("[Vibly] FCM token (delegate): \(token)")
            sendFCMTokenToJS(token)
        } else {
            print("[Vibly] FCM token (delegate) received but token is nil — request permission and use a real device.")
        }
    }

    /// Send FCM token to the JavaScript layer and optionally print it.
    private func sendFCMTokenToJS(_ token: String) {
        registerViblyFcmPluginIfNeeded()
        let safeToken = token.replacingOccurrences(of: "\"", with: "\\\"")
        if let rootVC = window?.rootViewController as? CAPBridgeViewController,
           let bridge = rootVC.bridge {
            bridge.triggerWindowJSEvent(
                eventName: "CapacitorFCMTokenReceived",
                data: "{\"fcm_token\":\"\(safeToken)\"}"
            )
        } else {
            print("[Vibly] FCM token: \(token) (bridge not ready yet — will retry after APNs)")
            // Bridge isn't ready yet; keep token and retry shortly.
            lastFcmToken = token
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                self?.trySendLastFcmTokenToJS()
            }
        }
    }

    private func registerViblyFcmPluginIfNeeded() {
        guard !didRegisterFcmPlugin,
              let rootVC = window?.rootViewController as? CAPBridgeViewController,
              let bridge = rootVC.bridge else { return }
        bridge.registerPluginInstance(ViblyFcmPlugin())
        didRegisterFcmPlugin = true
    }

    private func trySendLastFcmTokenToJS() {
        registerViblyFcmPluginIfNeeded()
        guard let token = lastFcmToken else { return }
        if let rootVC = window?.rootViewController as? CAPBridgeViewController,
           let bridge = rootVC.bridge {
            let safeToken = token.replacingOccurrences(of: "\"", with: "\\\"")
            bridge.triggerWindowJSEvent(
                eventName: "CapacitorFCMTokenReceived",
                data: "{\"fcm_token\":\"\(safeToken)\"}"
            )
        } else {
            // Keep retrying a few times on cold start.
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                self?.trySendLastFcmTokenToJS()
            }
        }
    }

    // ── APNs token → Firebase ───────────────────────────────────────────────────

    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("[Vibly] APNs device token received, handing to Firebase.")
        Messaging.messaging().apnsToken = deviceToken
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)

        // Proactively fetch FCM token (delegate may fire before window/bridge is ready).
        Messaging.messaging().token { [weak self] token, error in
            if let err = error {
                print("[Vibly] FCM token error: \(err.localizedDescription)")
                return
            }
            guard let fcmToken = token else {
                print("[Vibly] FCM token is nil after APNs.")
                return
            }
            self?.lastFcmToken = fcmToken
            print("[Vibly] FCM token: \(fcmToken)")
            self?.sendFCMTokenToJS(fcmToken)
        }
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[Vibly] APNs registration failed: \(error.localizedDescription) — use a real device and allow notifications.")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    // ── Foreground notification display ─────────────────────────────────────────

    /// Show banner + sound + badge when a push arrives while the app is in the foreground.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }

    /// User tapped a notification — forward type to JS so we can navigate (e.g. to /home or /notification).
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        let type = (userInfo["type"] as? String) ?? "general"
        let safeType = type.replacingOccurrences(of: "\"", with: "\\\"")
        if let rootVC = window?.rootViewController as? CAPBridgeViewController,
           let bridge = rootVC.bridge {
            bridge.triggerWindowJSEvent(
                eventName: "CapacitorPushNotificationTapped",
                data: "{\"type\":\"\(safeType)\"}"
            )
        }
        completionHandler()
    }

    // ── App lifecycle ────────────────────────────────────────────────────────────

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Re-send FCM token when app becomes active so the JS registration flow can receive it
        // (e.g. user just tapped "Allow" and the WebView is ready).
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.trySendLastFcmTokenToJS()
        }
    }
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application,
                                                           continue: userActivity,
                                                           restorationHandler: restorationHandler)
    }
}
