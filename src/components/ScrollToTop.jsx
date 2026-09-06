import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top of the page on every route change, so navigating to a
// new page never leaves you mid-scroll from the previous one.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window.scrollTo ? "instant" : "auto" });
  }, [pathname]);

  return null;
}
