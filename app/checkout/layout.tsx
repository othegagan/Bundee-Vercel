'use client';

import ClientOnly from '@/components/ClientOnly';
import { CheckIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useMemo } from 'react';

export default function CheckoutLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientOnly>
            <Stepper />
            <div className='container mx-auto max-w-4xl pb-10'>{children}</div>
        </ClientOnly>
    );
}

const checkoutSteps = [
    { link: 'driving-licence', title: "Driver's License" },
    { link: 'insurance', title: 'Insurance' },
    { link: 'summary', title: 'Summary' },
    { link: 'payment', title: 'Payment' }
];

function Stepper() {
    const pathname = usePathname();
    if (pathname.includes('complete')) return null;

    const currentStepIndex = useMemo(() => {
        return checkoutSteps.findIndex((step) => pathname.includes(step.link));
    }, [pathname]);

    return (
        <div className='mx-auto w-11/12 px-4 py-6 lg:max-w-3xl'>
            <div className='relative flex items-center justify-between'>
                {/* Background line */}
                <div className='absolute top-3 right-0 left-0 mx-10 h-0.5 bg-neutral-200 ' />

                {/* Colored progress line */}
                <div
                    className='absolute top-3 left-[36px] h-0.5 bg-primary transition-all duration-300 ease-in-out'
                    style={{
                        width: `calc(${(currentStepIndex / (checkoutSteps.length - 1)) * 95}% `
                    }}
                />

                {checkoutSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                        <div key={step.link} className='relative flex flex-col items-center'>
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full ${isCompleted || isActive ? 'bg-primary' : 'border-2 border-neutral-300 bg-white'}`}>
                                {isCompleted ? (
                                    <CheckIcon className='h-4 w-4 text-white' />
                                ) : (
                                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-neutral-300'}`} />
                                )}
                            </div>

                            <p className={`mt-2 font-semibold text-xs ${isCompleted || isActive ? 'text-primary' : 'text-neutral-500'}`}>{step.title}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
