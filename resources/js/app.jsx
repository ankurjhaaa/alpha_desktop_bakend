import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Core/Providers/ThemeProvider';
import axios from 'axios';

// Override PUT and DELETE methods to use POST for shared hosting compatibility
axios.interceptors.request.use(config => {
    if (config.method === 'put') {
        config.method = 'post';
        config.headers['X-HTTP-Method-Override'] = 'PUT';
    } else if (config.method === 'delete') {
        config.method = 'post';
        config.headers['X-HTTP-Method-Override'] = 'DELETE';
    }
    return config;
});

createInertiaApp({
 resolve: name => {
 const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
 return pages[`./Pages/${name}.jsx`]
 },
 setup({ el, App, props }) {
 createRoot(el).render(
 <ThemeProvider>
 <App {...props} />
 </ThemeProvider>
 );
 },
});
