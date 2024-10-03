'use client';

import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
// import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import './embla.css';
import { NextButton, PrevButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
import { SelectedSnapDisplay, useSelectedSnapDisplay } from './EmblaCarouselSelectedSnapDisplay';

type EmblaCarousel = {
    slides: any[];
    thumbsVisible?: boolean;
};

export default function EmblaCarousel({ slides, thumbsVisible = true }: EmblaCarousel) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [Autoplay({ playOnInit: true, delay: 6000 })]);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

    const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true
    });

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaApi || !emblaThumbsApi) return;
            emblaApi.scrollTo(index);
            setSelectedIndex(index); // Update the selected index to highlight the clicked thumbnail
        },
        [emblaApi, emblaThumbsApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi || !emblaThumbsApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
    }, [emblaApi, emblaThumbsApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();

        emblaApi.on('select', onSelect).on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <section className={cn('embla relative w-full ', !thumbsVisible && 'md:max-h-80')}>
            <div className='overflow-hidden md:rounded-md' ref={emblaRef}>
                <div className='embla__container'>
                    {slides.map((s, index) => (
                        <div className={cn('embla__slide max-h-44 w-full overflow-hidden md:max-h-80 md:rounded-md')} key={index}>
                            <img key={index} src={s.imagename} className='h-full w-full object-cover object-center md:rounded-md' alt={`vehicle ${index}`} />
                        </div>
                    ))}
                </div>
            </div>

            {thumbsVisible && slides.length > 1 ? (
                <div className='embla-thumbs overflow-hidden ' ref={emblaThumbsRef}>
                    <div className='embla-thumbs__container'>
                        {slides.map((s, index) => (
                            <Thumb
                                key={index}
                                onClick={() => onThumbClick(index)}
                                selected={index === selectedIndex}
                                index={index}
                                imagename={s.imagename} //  image url to the thumb
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <SlideNumber
                    slides={slides}
                    selectedSnap={selectedSnap}
                    snapCount={snapCount}
                    onPrevButtonClick={onPrevButtonClick}
                    prevBtnDisabled={prevBtnDisabled}
                    onNextButtonClick={onNextButtonClick}
                    nextBtnDisabled={nextBtnDisabled}
                />
            )}
        </section>
    );
}

type ThumbProp = {
    selected: boolean;
    index: number;
    onClick: () => void;
    imagename: string; // image URL prop to display thumbnail
};

export function Thumb(props: ThumbProp) {
    const { selected, index, onClick, imagename } = props;

    return (
        <button
            onClick={onClick}
            type='button'
            className={'embla-thumbs__slide max-h-16 select-none overflow-hidden rounded-md'.concat(selected ? ' embla-thumbs__slide--selected' : '')}>
            <img src={imagename} className='h-full w-full rounded-md object-cover object-center' alt={`thumbnail ${index}`} />
        </button>
    );
}

export function SlideNumber({ slides, selectedSnap, snapCount, onPrevButtonClick, prevBtnDisabled, onNextButtonClick, nextBtnDisabled }) {
    return (
        <>
            {slides.length > 1 && (
                <div className='relative bottom-10 z-10 flex items-center justify-between gap-[1.2rem] px-3 text-white '>
                    <SelectedSnapDisplay selectedSnap={selectedSnap} snapCount={snapCount} />

                    <div className='grid grid-cols-2 items-center gap-1'>
                        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                    </div>
                </div>
            )}
        </>
    );
}
