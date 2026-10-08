import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/** Focus only explicit keyboard link navigation, never history or background updates. */
export function NavigationFocus() {
  const router = useRouter();
  useEffect(() => {
    let destination: string | undefined;
    let frame = 0;
    let observer: MutationObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      destination = undefined;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      clearTimeout(timeout);
    };
    const capture = (event: MouseEvent) => {
      cancel();
      if (event.detail !== 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      const from = window.location.pathname;
      if (url.origin !== window.location.origin || url.pathname === from || url.hash) return;
      if (from !== "/dashboard" && url.pathname !== "/dashboard") return;
      destination = url.pathname;
    };
    const unsubscribe = router.subscribe("onResolved", () => {
      if (!destination || window.location.pathname !== destination) return;
      const expected = destination;
      destination = undefined;
      // Let route content and mobile drawer focus restoration finish first.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const focusHeading = () => {
            if (window.location.pathname !== expected) { cancel(); return; }
            const heading = document.querySelector<HTMLElement>("main h1");
            if (!heading || document.querySelector('[role="dialog"]')) return;
            observer?.disconnect();
            clearTimeout(timeout);
            heading.tabIndex = -1;
            heading.classList.add("navigation-heading");
            heading.focus({ preventScroll: true });
          };
          observer = new MutationObserver(focusHeading);
          observer.observe(document.body, { childList: true, subtree: true });
          timeout = setTimeout(cancel, 1000);
          focusHeading();
        });
      });
    });
    document.addEventListener("click", capture, true);
    window.addEventListener("popstate", cancel);
    document.addEventListener("pointerdown", cancel, true);
    return () => {
      cancel();
      unsubscribe();
      document.removeEventListener("click", capture, true);
      window.removeEventListener("popstate", cancel);
      document.removeEventListener("pointerdown", cancel, true);
    };
  }, [router]);
  return null;
}