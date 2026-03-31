import { useEffect } from "react";

export default function NavigationHandler() {
  useEffect(() => {
    // 1. Ensure home is in history if landing on a sub-section
    const currentHash = window.location.hash;
    if (currentHash && currentHash !== "#home") {
      window.history.replaceState(null, "", "#home");
      window.history.pushState(null, "", currentHash);
    } else if (!currentHash) {
      window.history.replaceState(null, "", "#home");
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
          if (id && window.location.hash !== `#${id}`) {
            // Use replaceState to avoid cluttering history with every scroll
            // but we want back to go to home, so we only push if it's not home
            if (id === "home") {
              window.history.replaceState(null, "", "#home");
            } else {
              // If we are moving from home to a section, we might want to push
              // But for now, let's just keep it simple
              window.history.replaceState(null, "", `#${id}`);
            }
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
    const handlePopState = () => {
      // If the user went back and the hash is now empty (which shouldn't happen with our replaceState)
      // or if they are at home, we let the next back exit.
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
