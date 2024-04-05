'use client';

import {useState } from 'react';
import Map, { FullscreenControl, GeolocateControl, Marker, NavigationControl, ScaleControl } from 'react-map-gl';

export default function MapComponent() {
    const [viewState, setViewState] = useState<any>({
        width: '100%',
        height: '100%',
        latitude: 30.271129,
        longitude: -97.7437,
        zoom: 10,
    });

    return (
        <>
            <Map
                {...viewState}
                mapStyle='mapbox://styles/mapbox/standard'
                mapboxAccessToken={'pk.eyJ1IjoiYnVuZGVlIiwiYSI6ImNsb256NmkxajNldmUyanA5dXBvMzRsazIifQ.FSobiyLg240GumnLQeD0Dw'}
                onMove={evt => setViewState(evt.viewState)}>
                <GeolocateControl position='top-left' />
                <FullscreenControl position='bottom-right' />
                <NavigationControl position='top-left' />
                <ScaleControl />
                {/* <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor='bottom'>
                    <Pin size={20} />
                </Marker> */}
                <NavigationControl />
            </Map>
        </>
    );
}

