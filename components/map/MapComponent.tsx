'use client';
import { getCenter } from 'geolib';
import Link from 'next/link';
import { useState, useEffect, useRef, use } from 'react';
import { FaStar } from 'react-icons/fa';
import Map, { FullscreenControl, MapRef, Marker, NavigationControl, Popup, ScaleControl } from 'react-map-gl';
import { ImLocation } from 'react-icons/im';
import { toTitleCase } from '@/lib/utils';
import useCarFilterModal from '@/hooks/useCarFilterModal';
import { Button } from '../ui/button';

export default function MapComponent({ filteredCars, searchQuery }: { filteredCars: any[]; searchQuery: string }) {
    const useCarFilter = useCarFilterModal();

    const [viewChanged, setViewChanged] = useState(false);

    const [viewState, setViewState] = useState<any>({
        width: '100%',
        height: '100%',
        latitude: 0,
        longitude: 0,
        zoom: 12,
    });

    const [carPopInfo, setCarPopInfo] = useState<any>(null);

    const mapRef = useRef<MapRef>();

    // Calculate center of map whenever filteredCars change
    useEffect(() => {
        const coordinates = filteredCars
            .filter(
                result =>
                    result.latitude !== undefined &&
                    result.latitude !== null &&
                    result.latitude !== '' &&
                    result.longitude !== undefined &&
                    result.longitude !== null &&
                    result.longitude !== '' &&
                    result.latitude !== 'undefined' &&
                    result.longitude !== 'undefined',
            )
            .map(result => ({
                latitude: result.latitude,
                longitude: result.longitude,
            }));
        const center: any = getCenter(coordinates);
        setViewState((prevState: any) => ({
            ...prevState,
            latitude: center.latitude,
            longitude: center.longitude,
        }));
    }, [filteredCars]);

    const pins = filteredCars
        .filter(
            car =>
                car.latitude !== undefined &&
                car.latitude !== null &&
                car.latitude !== '' &&
                car.longitude !== undefined &&
                car.longitude !== null &&
                car.longitude !== '' &&
                car.latitude !== 'undefined' &&
                car.longitude !== 'undefined',
        )
        .map((car, index) => (
            <Marker
                key={`marker-${car.id}`}
                latitude={Number(car.latitude)}
                longitude={Number(car.longitude)}
                anchor='bottom'
                onClick={e => {
                    e.originalEvent.stopPropagation();
                    setCarPopInfo(car);
                }}>
                <ImLocation className='size-7 cursor-pointer' />
            </Marker>
        ));

    const checkIfPositionInViewport = (lat: number, lng: number) => {
        const bounds = mapRef.current?.getBounds();
        if (bounds) {
            // console.log('Bounds', bounds);
            return bounds.contains([lng, lat]);
        }
        return false; // Or any default value if bounds not yet available
    };

    const isMarkerInViewport = marker => {
        const { latitude, longitude } = marker;
        return checkIfPositionInViewport(latitude, longitude);
    };

    //@ts-ignore
    useEffect(() => {
        mapRef.current?.on('move', onMove);

        return () => mapRef.current?.off('move', onMove);
    }, [pins, checkIfPositionInViewport]);

    const onMove = (evt: any) => {
        const coordinates = filteredCars
            .filter(
                result =>
                    result.latitude !== undefined &&
                    result.latitude !== null &&
                    result.latitude !== '' &&
                    result.longitude !== undefined &&
                    result.longitude !== null &&
                    result.longitude !== '' &&
                    result.latitude !== 'undefined' &&
                    result.longitude !== 'undefined',
            )
            .map(result => ({
                latitude: result.latitude,
                longitude: result.longitude,
            }));

        const center: any = getCenter(coordinates);

        setViewState((prevState: any) => ({
            ...prevState,
            latitude: center.latitude,
            longitude: center.longitude,
        }));

        setViewState(evt.viewState);

        setTimeout(() => {
            setViewChanged(true);
        }, 500);
    };

    const filterOutCars = () => {
        const visibleMarkers = pins.filter(marker => isMarkerInViewport(marker.props));
        const markerNumbers = visibleMarkers.map(marker => parseInt(marker.key.replace('marker-', '')));
        const filteredCars = useCarFilter.filteredCars.filter(car => markerNumbers.includes(car.id));
        // console.log(
        //     'Filtered car IDs:',
        //     filteredCars.map(car => car.id),
        // );
        // useCarFilter.setFilteredCars(filteredCars);
    };

    return (
        <div className='relative h-full w-full'>
            {/* {viewChanged && (
                <Button variant='black' size='sm' className='absolute left-[20%] z-40  transform' onClick={filterOutCars}>
                    Search this area
                </Button>
            )} */}

            <Map
                {...viewState}
                mapStyle='mapbox://styles/mapbox/streets-v9'
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                onMove={onMove}
                ref={mapRef}>
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
                        <Link href={`/vehicles/${carPopInfo?.id}?${searchQuery}`} className='flex flex-col  border-0 outline-none focus:border-0'>
                            <img width='100%' src={carPopInfo?.imageresponse[0]?.imagename} className='rounded-md ' />
                            <div className='mt-1 text-sm font-semibold'>{`${toTitleCase(carPopInfo?.make)} ${carPopInfo?.model.toLocaleUpperCase()} ${carPopInfo?.year}`}</div>
                            <div className='-mb-1 flex justify-between gap-2'>
                                <div className='inline-flex  items-center rounded-lg bg-white'>
                                    <FaStar className='mr-2 size-3 text-yellow-400' />
                                    <span className=' text-neutral-700'>
                                        {carPopInfo?.rating} • ({carPopInfo?.tripcount} {carPopInfo?.tripcount === 1 ? 'Trip' : 'Trips'})
                                    </span>
                                </div>
                                <p>
                                    <span className='text-lg font-bold text-primary'>${carPopInfo?.price_per_hr}</span>
                                    <span className='text-md text-neutral-600'>/Day</span>
                                </p>
                            </div>
                        </Link>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

// draggable pin

// const initialViewState = {
//     latitude: 30.271129,
//     longitude: -97.7437,
//     zoom: 12,
// }

// const [marker, setMarker] = useState({
//     latitude: 30.271129,
//     longitude: -97.7437,
// });
// const [events, logEvents] = useState<Record<string, LngLat>>({});

// const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
//     logEvents(_events => ({ ..._events, onDragStart: event.lngLat }));
// }, []);

// const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
//     logEvents(_events => ({ ..._events, onDrag: event.lngLat }));

//     setMarker({
//         longitude: event.lngLat.lng,
//         latitude: event.lngLat.lat,
//     });

//     console.log("lat", event.lngLat.lat, "lng", event.lngLat.lng, )
// }, []);

// const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
//     logEvents(_events => ({ ..._events, onDragEnd: event.lngLat }));
// }, []);

// return (
//     <>
//         <Map
//             initialViewState={initialViewState}
//             mapStyle='mapbox://styles/mapbox/streets-v9'
//             mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}>
//             <Marker
//                 longitude={marker.longitude}
//                 latitude={marker.latitude}
//                 anchor='bottom'
//                 draggable
//                 onDragStart={onMarkerDragStart}
//                 onDrag={onMarkerDrag}
//                 onDragEnd={onMarkerDragEnd}>
//                 <ImLocation className='size-7 cursor-pointer' />
//             </Marker>
//             <FullscreenControl position='top-left' />
//             <NavigationControl position='top-left' />
//             <ScaleControl />
//         </Map>
//     </>
// );
