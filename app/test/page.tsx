'use client';
import React, { useEffect, useState } from 'react';
import { retrieveAndSendData } from './getData';



export default function page() {

    const [data, setData] = useState(null);
    useEffect(() => {
        const getData = async () => {
            const data = await retrieveAndSendData();
            console.log(data)
            setData(data);
        };
        getData();
    }, []);

    return (
        <div>
            page
            <br />
            <br />
            <br />
            {JSON.stringify(data)}
        </div>
    );
}
