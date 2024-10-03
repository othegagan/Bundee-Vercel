'use client';

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const url = 'https://bundee-auxillary-services-f6f2fbbfbrc2e3g9.centralus-01.azurewebsites.net/api/v1/insurance/datarequests/new';

export default function MeasureOneComponent({ searchParams }: { searchParams: { callbackUrl?: string; token?: string } }) {
    const widgetRef = useRef(null);
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [config, setConfig] = useState<any>(null); // State to store widget configuration

    // Function to call the API and get data request info
    async function generateTokens(userId: number) {
        setLoading(true); // Set loading to true while waiting for the response
        try {
            const response = await axios.post(
                url,
                { userId },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setLoading(false); // Stop loading after response
            return response.data.data;
        } catch (error) {
            setLoading(false); // Stop loading on error
            console.error('Error fetching data request:', error);
        }
    }

    useEffect(() => {
        // Simulate userId being passed, modify based on actual logic
        const userId = 1416;

        // Call the API to get tokens
        generateTokens(userId).then((data) => {
            if (data) {
                const { dataRequestId, publicAccessToken } = data;

                // Create widget configuration with response data
                const widgetConfig = {
                    access_key: publicAccessToken,
                    host_name: 'api-stg.measureone.com',
                    datarequest_id: dataRequestId,
                    branding: {
                        styles: {
                            primary_dark: '#f97216',
                            primary_light: '#f97216',
                            secondary_color: '#ffffff',
                            min_height: '700px'
                        }
                    },
                    options: {
                        display_profile: false
                    }
                };

                setConfig(widgetConfig); // Save config to state

                // Dynamically load the external script
                const script = document.createElement('script');
                script.src = 'https://api-stg.measureone.com/v3/js/m1-link-2021042000.js';
                script.async = true;
                document.body.appendChild(script);

                script.onload = () => {
                    if (widgetRef.current) {
                        // Add config to widget after script loads
                        widgetRef.current.setAttribute('config', JSON.stringify(widgetConfig));

                        // Add event listener for datasourceConnected
                        widgetRef.current.addEventListener('datasourceConnected', (event: Event) => {
                            console.log('Datasource connected:', event);
                            // Hide or destroy the widget once connected, if needed
                        });
                    }
                };

                // Clean up script when component unmounts
                return () => {
                    document.body.removeChild(script);
                };
            }
        });
    }, []);

    return (
        <div className=''>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <main>
                    {/* @ts-ignore */}
                    <m1-link ref={widgetRef} />
                </main>
            )}
        </div>
    );
}
