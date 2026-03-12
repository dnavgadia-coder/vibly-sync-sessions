# Fix: "Unable to discover swiftc" / Error 35 "Resource temporarily unavailable"

This happens when Xcode (or the build system) can't get info from the `swiftc` compiler—often due to resource limits or a stuck state. Try these in order.

---

## 1. Quit everything and free resources

- **Quit Xcode** completely (Cmd+Q).
- Close **Simulator** if it’s open.
- Optionally close other heavy apps (Chrome with many tabs, other IDEs, Docker, etc.).
- Wait 10–15 seconds, then **reopen Xcode** and open `ios/App/App.xcworkspace`. Build again (Cmd+B).

---

## 2. Clean build and derived data

1. In Xcode: **Product → Clean Build Folder** (Shift+Cmd+K).
2. Quit Xcode.
3. Delete DerivedData for this project (safe; Xcode will recreate it):
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
   Or only for your app:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*Vibly*
   rm -rf ~/Library/Developer/Xcode/DerivedData/*vibly*
   ```
4. Reopen Xcode, open `ios/App/App.xcworkspace`, and build again.

---

## 3. Check file descriptor limit (macOS)

Error 35 can mean "too many open files." In Terminal:

```bash
ulimit -n
```

If the number is low (e.g. 256), raise it for the current session:

```bash
ulimit -n 10240
```

Then **launch Xcode from this same Terminal** so it inherits the limit:

```bash
open /Applications/Xcode.app
```

Open your project and build again. If that fixes it, you can add `ulimit -n 10240` to your shell profile (e.g. `~/.zshrc`) so it’s set by default.

---

## 4. Use the correct Swift / Xcode path

Xcode’s `swiftc` should be used, not a separate Swift install. In Terminal:

```bash
xcode-select -p
```

You should see:

```
/Applications/Xcode.app/Contents/Developer
```

If not, point it at Xcode:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Then try building again.

---

## 5. Restart your Mac

If the error persists after 1–4, restart the Mac. This clears stuck processes and file descriptor usage that can trigger error 35.

---

## 6. Reinstall or repair Xcode (last resort)

- **Reinstall Xcode:** Delete Xcode from Applications, then install again from the App Store.
- Or run **Xcode → Settings → Locations** and ensure the Command Line Tools dropdown is set to your Xcode version (e.g. "Xcode 15.x").

---

## Summary

| Step | Action |
|------|--------|
| 1 | Quit Xcode + Simulator, free resources, reopen and build |
| 2 | Clean Build Folder, delete DerivedData, reopen and build |
| 3 | Raise `ulimit -n` and start Xcode from that Terminal |
| 4 | Run `xcode-select -p` and fix with `xcode-select -s` if needed |
| 5 | Restart the Mac |
| 6 | Reinstall/repair Xcode or Command Line Tools |

Often **steps 1 and 2** are enough. The message can still appear in the log even when the build succeeds; if the app builds and runs, you can ignore it.
