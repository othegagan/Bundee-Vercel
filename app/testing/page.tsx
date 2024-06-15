import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import React from 'react';

export default function page() {
    const IMAGES = [
        {
            id: 1,
            name: 'img1',
            imagename: `https://fiat.b-cdn.net/H4185736.jpeg`,
        },
        { id: 2, name: 'img2', imagename: `https://picsum.photos/600/350?v=${2}` },
        { id: 3, name: 'img3', imagename: `https://picsum.photos/600/350?v=${3}` },
        { id: 4, name: 'img4', imagename: `https://picsum.photos/600/350?v=${3}` },
        { id: 5, name: 'img5', imagename: `https://picsum.photos/600/350?v=${3}` },
    ];

    return (
        <div>
            <EmblaCarousel slides={IMAGES} />
        </div>
    );
}
