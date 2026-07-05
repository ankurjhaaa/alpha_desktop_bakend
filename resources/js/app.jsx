import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Core/Providers/ThemeProvider';
import GlobalSplash from './Core/Widgets/GlobalSplash';
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
    
    // Shared Hosting Bypass: Send token in a custom header that Apache won't block
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['X-Authorization'] = `Bearer ${token}`;
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
 <GlobalSplash />
 <App {...props} />
 </ThemeProvider>
 );
 },
});
