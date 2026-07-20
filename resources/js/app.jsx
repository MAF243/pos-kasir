import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

/**
 * Inertia.js React Application Entry Point
 *
 * - resolvePageComponent auto-imports pages from resources/js/Pages/
 * - App name is pulled from the Laravel APP_NAME env variable via Vite
 */
createInertiaApp({
    title: (title) => title ? `${title} — ${import.meta.env.VITE_APP_NAME}` : import.meta.env.VITE_APP_NAME,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },

    progress: {
        color: '#10b981',   // primary-500 (emerald) brand color for the progress bar
        showSpinner: true,
    },
});
