import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
    const location = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    // Log user activity when navigating to a page
    useEffect(() => {
        // Here you can add your custom analytics later
        // e.g. GA4, Plausible, Posthog, etc.
        // const pathname = location.pathname;
        // console.log(`Navigated to ${pathname}`);
    }, [location]);

    return null;
}
