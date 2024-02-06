'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/Container';
import LocationSearchComponent from '@/components/LocationSearchComponent';
import { addDays, format } from 'date-fns';
import Vehicles from './vehicles';

const Page = ({ searchParams }) => {
    console.log(searchParams);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPayload, setSearchPayload] = useState({});
    const [paramas, setParamas] = useState(searchParams);

    useEffect(() => {
        setParamas(searchParams);
        console.log('searchParams updated:', searchParams);
        // This block will only run on the client side
        const userId = localStorage.getItem('userId') || '';

        const {
            city = 'Austin, Texas, United States',
            latitude = '-97.7437',
            longitude = '30.271129',
            startDate = format(new Date(), 'yyyy-MM-dd'),
            endDate = format(addDays(new Date(), 3), 'yyyy-MM-dd'),
            startTime = '11:00:00',
            endTime = '20:00:00',
            isAirport = false,
        } = searchParams;

        const searchPayload = {
            lat: longitude,
            lng: latitude,
            startTs: new Date(startDate + 'T' + startTime).toISOString(),
            endTS: new Date(endDate + 'T' + endTime).toISOString(),
            pickupTime: startTime,
            dropTime: endTime,
            isAirport,
            userId: userId || '',
        };

        setSearchPayload(searchPayload);

        const searchQuery = `city=${city}&latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}&isAirport=${isAirport}`;

        setSearchQuery(searchQuery);
        console.log(searchQuery);
    }, [searchParams]);

    return (
        <>
            <Container>
                <div className='z-50 md:sticky md:top-[3.5rem]'>
                    <LocationSearchComponent />
                </div>
                <Vehicles searchPayload={searchPayload} searchQuery={searchQuery} />
            </Container>
        </>
    );
};

export default Page;
