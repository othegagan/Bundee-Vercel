'use client';

import { toTitleCase } from '@/lib/utils';
import { getCenter } from 'geolib';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Map, { FullscreenControl, Marker, NavigationControl, Popup, ScaleControl } from 'react-map-gl';

export default function MapComponent({ filteredCars, searchQuery }: { filteredCars: any[]; searchQuery: string }) {
    const coordinates = filteredCars.map(result => ({
        latitude: result.latitude,
        longitude: result.longitude,
    }));

    const center: any = getCenter(coordinates);

    const [viewState, setViewState] = useState<any>({
        width: '100%',
        height: '100%',
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: 12,
    });

    const [carPopInfo, setCarPopInfo] = useState(null);

    const pins = filteredCars.map((car, index) => (
        <Marker
            key={`marker-${index}`}
            latitude={Number(car.latitude)}
            longitude={Number(car.longitude)}
            // latitude={30.271129}
            // longitude={-97.7437}
            anchor='bottom'
            onClick={e => {
                e.originalEvent.stopPropagation();
                setCarPopInfo(car);
            }}>
            <MapPin className='cursor-pointer' />
        </Marker>
    ));

    return (
        <Map
            {...viewState}
            mapStyle='mapbox://styles/mapbox/streets-v9'
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            onMove={evt => setViewState(evt.viewState)}>
            <FullscreenControl position='top-left' />
            <NavigationControl position='top-left' />
            <ScaleControl />

            {pins}

            {carPopInfo && (
                <Popup
                    anchor='bottom'
                    longitude={Number(carPopInfo.longitude)}
                    latitude={Number(carPopInfo.latitude)}
                    onClose={() => setCarPopInfo(null)}
                    className=' rounded-lg'>
                    <Link href={`/vehicles/${carPopInfo.id}?${searchQuery}`} className='flex flex-col  border-0 outline-none focus:border-0'>
                        <img width='100%' src={carPopInfo.imageresponse[0].imagename} className='rounded-md ' />
                        <div className='mt-1 text-sm font-semibold'>{`${toTitleCase(carPopInfo?.make)} ${carPopInfo?.model.toLocaleUpperCase()} ${carPopInfo?.year}`}</div>
                        <div className='-mb-1 flex justify-between gap-2'>
                            <div className='inline-flex  items-center rounded-lg bg-white'>
                                <FaStar className='mr-2 size-3 text-yellow-400' />
                                <span className=' text-neutral-700'>
                                    {carPopInfo.rating} • ({carPopInfo?.tripcount} {carPopInfo?.tripcount === 1 ? 'Trip' : 'Trips'})
                                </span>
                            </div>
                            <p>
                                <span className='text-lg font-bold text-primary'>${carPopInfo.price_per_hr}</span>
                                <span className='text-md text-neutral-600'>/Day</span>
                            </p>
                        </div>
                    </Link>
                </Popup>
            )}
        </Map>
    );
}
