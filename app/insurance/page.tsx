'use client';

import { useEffect, useRef } from 'react';

const M1LinkWidget = () => {
    const widgetRef = useRef(null);

    useEffect(() => {
        // Dynamically load the external script
        const script = document.createElement('script');
        script.src = 'https://api-stg.measureone.com/v3/js/m1-link-2021042000.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (widgetRef.current) {
                const config = {
                    access_key: '2jwIGykvZxlCeAGgJRvz6cJye4F',
                    host_name: 'api-stg.measureone.com',
                    datarequest_id: 'dr_1faOM8Q4efEWIjzdE2SBM2kLq4O',
                    branding: {
                        styles: {
                            primary_dark: '#186793',
                            primary_light: '#2e9ccb',
                            secondary_color: '#ffffff',
                            min_height: '700px'
                        }
                    },
                    options: {
                        display_profile: false
                    }
                };

                // Add configuration to widget
                widgetRef.current.setAttribute('config', JSON.stringify(config));

                // Add event listeners
                widgetRef.current.addEventListener('datasourceConnected', (event) => {
                    console.log(event);
                    // Hide or destroy the widget once connected
                });
            }
        };

        // Clean up script when component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            {/* @ts-ignore */}
            <m1-link ref={widgetRef} />
        </div>
    );
};

export default M1LinkWidget;
