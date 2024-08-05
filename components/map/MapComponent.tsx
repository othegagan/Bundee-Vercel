'use client';
import useVehicleSearch, { getAllURLParameters } from '@/hooks/useVehicleSearch';
import { toTitleCase } from '@/lib/utils';
import { getCenter } from 'geolib';
import { useQueryState } from 'next-usequerystate';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Map, { FullscreenControl, type MapRef, Marker, Popup, ScaleControl } from 'react-map-gl';
import { Button } from '../ui/button';

export default function MapComponent({ filteredCars, searchQuery }: { filteredCars: any[]; searchQuery: string }) {
    const { loading, searchVehicles, viewChanged, setViewChanged } = useVehicleSearch();

    const [carPopInfo, setCarPopInfo] = useState<any>(null);
    const [carsPopInfo, setCarsPopInfo] = useState<any>(null);
    const [pins, setPins] = useState<any>([]);

    const [city, setCity] = useQueryState('city', { defaultValue: '' });
    const [isMapSearch, setIsMapSearch] = useQueryState('isMapSearch', { defaultValue: 'false', history: 'replace' });
    const [zoomLevel, setzoomLevel] = useQueryState('zoomLevel', { defaultValue: '12', history: 'replace' });
    const [southWestlat, setSouthWestlat] = useQueryState('southWestlat', { defaultValue: '', history: 'replace' });
    const [southWestlong, setSouthWestlong] = useQueryState('southWestlong', { defaultValue: '', history: 'replace' });
    const [northEastlat, setNorthEastlat] = useQueryState('northEastlat', { defaultValue: '', history: 'replace' });
    const [northEastlong, setNorthEastlong] = useQueryState('northEastlong', { defaultValue: '', history: 'replace' });

    const mapRef = useRef<MapRef>();

    const searchParams: any = getAllURLParameters();

    const [viewState, setViewState] = useState<any>({
        width: '100%',
        height: '100%',
        latitude: searchParams.longitude || 0,
        longitude: searchParams.latitude || 0,
        zoom: Number(zoomLevel)
    });

    useEffect(() => {
        const filteredCoordinates = filteredCars.filter(isValidCoordinate);
        const center: any = filteredCoordinates.length > 0 ? getCenter(filteredCoordinates) : {};

        const defaultLatitude = searchParams.longitude;
        const defaultLongitude = searchParams.latitude;

        setViewState((prevState: any) => {
            if (searchParams?.isMapSearch && filteredCoordinates.length === 0) {
                return {
                    ...prevState,
                    latitude: center.latitude || defaultLatitude,
                    longitude: center.longitude || defaultLongitude
                };
            }
            if (searchParams?.isMapSearch && filteredCoordinates.length === 0) {
                return {
                    ...prevState
                };
            }
        });

        // Group points by same latitude and longitude
        const groupedPoints = groupBySameLatLng(filteredCoordinates);

        // Loop through groupedPoints and render markers
        const groupedMarkers = Object.values(groupedPoints).map((group: any, index) => {
            const markerIcon =
                group.length === 1 ? (
                    <svg width='436' height='624' viewBox='0 0 436 624' fill='none' xmlns='http://www.w3.org/2000/svg' className='size-7 cursor-pointer '>
                        <path
                            d='M218 0C97.4771 0 0 97.656 0 218.4C0 382.2 218 624 218 624C218 624 436 382.2 436 218.4C436 97.656 338.523 0 218 0Z'
                            fill='currentColor'
                        />
                        <circle cx='218' cy='222' r='100' fill='white' />
                    </svg>
                ) : (
                    <div className='relative flex flex-col items-center justify-center'>
                        <div className='grouped-marker-count text-md absolute top-1 font-semibold'>{group.length}</div>
                        <svg width='436' height='624' viewBox='0 0 436 624' fill='none' xmlns='http://www.w3.org/2000/svg' className='size-10 cursor-pointer'>
                            <path
                                d='M218 0C97.4771 0 0 97.656 0 218.4C0 382.2 218 624 218 624C218 624 436 382.2 436 218.4C436 97.656 338.523 0 218 0Z'
                                fill='currentColor'
                            />
                            <circle cx='218' cy='222' r='160' fill='white' />
                        </svg>

                        {/* <Pin className='size-7 cursor-pointer text-blue-500' /> */}
                    </div>
                );

            return (
                <Marker
                    key={`grouped-marker-${index}`}
                    latitude={Number(group[0].latitude)}
                    longitude={Number(group[0].longitude)}
                    // anchor='top'
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setCarPopInfo(null);
                        setCarsPopInfo(null);
                        if (group.length > 1) {
                            setCarsPopInfo(group);
                        } else {
                            setCarPopInfo(group[0]);
                        }
                    }}>
                    {markerIcon}
                </Marker>
            );
        });

        setPins(groupedMarkers);
    }, [filteredCars]);

    const isValidCoordinate = (car: { latitude: any; longitude: any }) => {
        const { latitude, longitude } = car;
        return (
            latitude !== undefined &&
            latitude !== null &&
            latitude !== '' &&
            longitude !== undefined &&
            longitude !== null &&
            longitude !== '' &&
            latitude !== 'undefined' &&
            longitude !== 'undefined'
        );
    };

    const onMove = (evt: any) => {
        setzoomLevel(evt.viewState.zoom);
        setViewState(evt.viewState);
        setTimeout(() => {
            setViewChanged(true);
        }, 500);
    };

    const searchThisArea = () => {
        const bounds = mapRef.current?.getBounds();
        setSouthWestlat(String(bounds._sw.lat));
        setSouthWestlong(String(bounds._sw.lng));
        setNorthEastlong(String(bounds._ne.lng));
        setNorthEastlat(String(bounds._ne.lat));
        setIsMapSearch('true');
        setCity('Map Search');
        searchVehicles();
    };

    return (
        <div className='relative h-full w-full'>
            {viewChanged && (
                <Button variant='black' disabled={loading} size='sm' className='absolute left-[40%] top-2  z-40' onClick={searchThisArea}>
                    {loading ? <div className='loader' /> : 'Search this area'}
                </Button>
            )}

            <Map
                {...viewState}
                mapStyle='mapbox://styles/mapbox/streets-v9'
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                onMove={onMove}
                ref={mapRef}>
                <FullscreenControl position='top-left' />
                {/* <NavigationControl position='top-left' /> */}
                <ScaleControl />

                {pins}

                {carPopInfo && (
                    <Popup
                        longitude={Number(carPopInfo.longitude)}
                        latitude={Number(carPopInfo.latitude)}
                        onClose={() => {
                            setCarPopInfo(null);
                            setCarsPopInfo(null);
                        }}
                        className=' rounded-lg'>
                        <Link href={`/vehicles/${carPopInfo?.id}?${searchQuery}`} className='flex flex-col  border-0 outline-none focus:border-0'>
                            <img width='100%' src={carPopInfo?.imageresponse[0]?.imagename} className='rounded-md ' alt={`${carPopInfo?.make}`} />
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

                {carsPopInfo && (
                    <Popup
                        longitude={Number(carsPopInfo[0].longitude)}
                        latitude={Number(carsPopInfo[0].latitude)}
                        // anchor='bottom'
                        onClose={() => {
                            setCarPopInfo(null);
                            setCarsPopInfo(null);
                        }}
                        style={{ maxWidth: '350px' }}
                        className=' w-[400px] rounded-lg'>
                        <p>{carsPopInfo.length} cars are available here.</p>
                        <div className='border-1 flex max-h-60 w-full select-none flex-col overflow-y-auto   rounded-lg'>
                            {carsPopInfo.map((car: any, index) => (
                                <Link
                                    key={index}
                                    href={`/vehicles/${car?.id}?${searchQuery}`}
                                    className='my-1 grid grid-cols-3 gap-2 rounded-md border  hover:bg-neutral-200/70'>
                                    <div className='aspect-video h-16 w-full border'>
                                        {car?.imageresponse[0]?.imagename ? (
                                            <img
                                                src={car?.imageresponse[0]?.imagename}
                                                alt={car.make}
                                                className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-105 lg:h-full lg:w-full'
                                            />
                                        ) : (
                                            <img
                                                src='./images/image_not_available.png'
                                                alt='image_not_found'
                                                className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
                                            />
                                        )}
                                    </div>

                                    <div className='col-span-2 flex flex-col'>
                                        <div className='mt-1 text-sm font-semibold'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</div>

                                        <div className='-mb-1 flex justify-between gap-2 pr-2'>
                                            <div className='inline-flex  items-center rounded-lg'>
                                                <FaStar className='mr-2 size-3 text-yellow-400' />
                                                <span className=' text-neutral-700'>
                                                    {car?.rating} • ({car?.tripcount} {car?.tripcount === 1 ? 'Trip' : 'Trips'})
                                                </span>
                                            </div>
                                            <p>
                                                <span className='text-md font-bold text-primary'>${car?.price_per_hr}</span>
                                                <span className='text-md text-neutral-600 '>/Day</span>
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

function groupBySameLatLng(data) {
    const groupedPoints = {};
    data.forEach((point) => {
        const key = `${point.latitude}_${point.longitude}`;
        if (!groupedPoints[key]) {
            groupedPoints[key] = [point];
        } else {
            groupedPoints[key].push(point);
        }
    });
    return groupedPoints;
}

// const visibleMarkers = pins.filter(marker => isMarkerInViewport(marker.props));
// const markerNumbers = visibleMarkers.map(marker => parseInt(marker.key.replace('marker-', '')));
// const filteredCars = useCarFilter.filteredCars.filter(car => markerNumbers.includes(car.id));
// console.log(
//     'Filtered car IDs:',
//     filteredCars.map(car => car.id),
// );
// useCarFilter.setFilteredCars(filteredCars);

// const checkIfPositionInViewport = (lat: number, lng: number) => {
//     const bounds = mapRef.current?.getBounds();
//     if (bounds) {
//         // console.log('Bounds', bounds);
//         return bounds.contains([lng, lat]);
//     }
//     return false; // Or any default value if bounds not yet available
// };

// const isMarkerInViewport = marker => {
//     const { latitude, longitude } = marker;
//     return checkIfPositionInViewport(latitude, longitude);
// };

// //@ts-ignore
// useEffect(() => {
//     mapRef.current?.on('move', onMove);

//     return () => mapRef.current?.off('move', onMove);
// }, [pins, checkIfPositionInViewport]);

//////////////////// draggable pin /////////////////

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
