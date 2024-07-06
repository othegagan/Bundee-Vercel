'use client';

import type React from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import { NextButton, PrevButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
import { SelectedSnapDisplay, useSelectedSnapDisplay } from './EmblaCarouselSelectedSnapDisplay';
import './embla.css';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

type PropType = {
    slides: any[];
};

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [Autoplay({ playOnInit: true, delay: 10000 }), Fade()]);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

    const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

    return (
        <section className='embla'>
            <div className='overflow-hidden md:rounded-md ' ref={emblaRef}>
                <div className='embla__container '>
                    {slides.map((s, index) => (
                        <div className='embla__slide max-h-80 overflow-hidden md:rounded-md' key={index}>
                            <img key={index} src={s.imagename} className='h-full w-full min-w-full object-cover md:rounded-md' alt={`vehicle  ${index}`} />
                        </div>
                    ))}
                </div>
            </div>
            {slides.length > 1 && (
                <div className='gap-[1.2rem]relative z-10 -mt-[44px] mb-2 flex items-center justify-between px-3 text-white '>
                    <SelectedSnapDisplay selectedSnap={selectedSnap} snapCount={snapCount} />

                    <div className='grid grid-cols-2 items-center gap-1'>
                        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default EmblaCarousel;
