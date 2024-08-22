'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { NextButton, PrevButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
import { SelectedSnapDisplay, useSelectedSnapDisplay } from './EmblaCarouselSelectedSnapDisplay';
import './embla.css';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { cn } from '@/lib/utils';

type PropType = {
    slides: any[];
    variant?: 'lg' | 'sm';
};

export default function EmblaCarousel({ slides, variant = 'lg' }: PropType) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [Autoplay({ playOnInit: true, delay: 5000 }), Fade()]);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

    const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

    return (
        <section className='embla relative w-full'>
            <div className='overflow-hidden md:rounded-md ' ref={emblaRef}>
                <div className='embla__container '>
                    {slides.map((s, index) => (
                        <div className={cn('embla__slide w-full max-h-56   overflow-hidden md:rounded-md', variant === 'lg' ? 'lg:max-h-80' : '')} key={index}>
                            <img key={index} src={s.imagename} className='h-full w-full  object-cover object-center  md:rounded-md' alt={`vehicle  ${index}`} />
                        </div>
                    ))}
                </div>
            </div>
            {slides.length > 1 && (
                <div className='gap-[1.2rem] relative z-10 bottom-10 flex items-center justify-between px-3 text-white '>
                    <SelectedSnapDisplay selectedSnap={selectedSnap} snapCount={snapCount} />

                    <div className='grid grid-cols-2 items-center gap-1'>
                        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                    </div>
                </div>
            )}
        </section>
    );
}
