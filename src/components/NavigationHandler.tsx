import { useEffect } from "react";

export default function NavigationHandler() {
  useEffect(() => {
    // 1. Initialize history with home as the base
    const currentHash = window.location.hash;
    let lastSection = currentHash ? currentHash.slice(1) : "home";

    if (!currentHash || currentHash === "#home") {
      window.history.replaceState({ section: "home" }, "", "#home");
      lastSection = "home";
    } else {
      // If landing on a sub-section, push home first then the section
      window.history.replaceState({ section: "home" }, "", "#home");
      window.history.pushState({ section: lastSection }, "", currentHash);
    }

    // 2. Intersection Observer to update hash on scroll
    const sections = ["home", "vehicles", "services", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && id !== lastSection) {
            if (id === "home") {
              // If we are at home, we just replace to stay at the base of history
              window.history.replaceState({ section: "home" }, "", "#home");
            } else {
              // If we move to a new section from home, we push
              // If we move from one section to another (not home), we replace
              // so that back button always goes to home
              if (lastSection === "home") {
                window.history.pushState({ section: id }, "", `#${id}`);
              } else {
                window.history.replaceState({ section: id }, "", `#${id}`);
              }
            }
            lastSection = id;
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // 3. Handle back button specifically for "exit" prevention
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash;
      if (!hash || hash === "#home") {
        lastSection = "home";
      } else {
        lastSection = hash.slice(1);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
