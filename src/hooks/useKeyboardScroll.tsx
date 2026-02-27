import { useEffect } from "react";

/**
 * Automatically scrolls the focused input into view when the virtual keyboard opens.
 * Works on iOS (Capacitor/Safari) and Android (Chrome).
 */
export function useKeyboardScroll() {
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        // Small delay to let keyboard fully open before scrolling
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };

    // On iOS, window resize fires when keyboard opens/closes
    const handleResize = () => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable)
      ) {
        setTimeout(() => {
          active.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    window.addEventListener("resize", handleResize);

    // Also handle visualViewport resize (better for iOS Safari/Capacitor)
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("resize", handleResize);
      if (vv) {
        vv.removeEventListener("resize", handleResize);
      }
    };
  }, []);
}
