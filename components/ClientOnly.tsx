'use client';

import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;
    // if(process.env.NEXT_PUBLIC_APP_ENV != 'production')
    //     console.log("Running in ",process.env.NEXT_PUBLIC_APP_ENV);

    return <>{children}</>;
};

export default ClientOnly;
