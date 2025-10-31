import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component's only job is to scroll the window to the top (0, 0)
 * every time the user navigates to a new page (i.e., when the 'pathname' changes).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls to the top of the page
    document.documentElement.scrollTo(0, 0);
  }, [pathname]); // This effect runs every time the pathname changes

  return null; // This component does not render any visible HTML
}

