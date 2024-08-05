import { cn } from "@/lib/utils";

export const shimmer =
    'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent';

function VehicleCardSkeleton() {
    return (
        <div className='col-span-4 space-y-4 lg:col-span-1'>
            <div className={`relative h-[167px] rounded-xl bg-neutral-200 ${shimmer}`} />

            <div className='h-4 w-full rounded-lg bg-neutral-200' />
            <div className='h-6 w-1/3 rounded-lg bg-neutral-200' />
        </div>
    );
}

interface VehicleCardSkeletonProps {
    className?: string;
    columns?: string;
}

export function VehiclesCardsSkeleton({ className, columns }: VehicleCardSkeletonProps) {
    return (
        <div className={`mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-${columns || 3}   xl:gap-x-8 ${className}`}>
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
        </div>
    );
}

export function VehiclesDetailsSkeleton() {
    return (
        <div className='container min-h-[65dvh]'>
            <div className='mt-3 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3  xl:gap-x-8'>
                <div className='col-span-4 space-y-4 lg:col-span-2'>
                    <div className={`relative h-[300px] rounded-xl bg-neutral-200 ${shimmer}`} />

                    <div className='h-8 w-full rounded-lg bg-neutral-200' />
                    <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                    <div className='h-4 w-1/3 rounded-lg bg-neutral-200' />
                </div>

                <div className='col-span-1 flex flex-col gap-3'>
                    <div className={`relative h-[200px] rounded-xl bg-neutral-200 ${shimmer}`} />
                    <br />
                    <div className='flex gap-3'>
                        <div className='h-10 w-2/3 rounded-lg bg-neutral-200' />
                        <div className='h-10 w-1/3 rounded-lg bg-neutral-200' />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DateSelectSkeleton() {
    return (
        <div className='space-y-2'>
            <div className={`h-8 w-full rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function CalendarSelectSkeleton() {
    return (
        <div className='space-y-2'>
            <div className={`h-64 w-64 rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function DrivingLicenceDetailsSkeleton() {
    return (
        <div className='mt-4 space-y-4'>
            <div className={`h-10 w-full rounded-md bg-neutral-200 md:w-[400px] ${shimmer}`} />
            <div className={`h-6 w-64 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-72 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-72 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-64 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-72 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-64 rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function CarCountSkeleton() {
    return (
        <div className='space-y-2'>
            <div className={`h-8 w-24 rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function TripsCard({ className }: { className?: string }) {
    return (
        <div className={cn('flex flex-col md:flex-row gap-2 pb-3 border-b', className)}>
            <div className='flex gap-4 w-full'>
                <div className={`relative h-20 w-36 md:h-28  rounded-md bg-neutral-200 ${shimmer}`} />

                <div className='flex flex-col gap-2 w-full h-full '>
                    <div className='flex gap-2 md:flex-row md:justify-between md:items-center w-full'>
                        <div className='flex gap-2 flex-col w-full'>
                            <div className={`h-6 w-full md:h-8 md:w-[50%] rounded-sm bg-neutral-200 ${shimmer}`} />
                            <div className='h-4 w-[50%] md:w-[25%] rounded-sm bg-neutral-200' />
                        </div>
                        <div className={`h-8 hidden md:block w-[20%] rounded-sm bg-neutral-200 ${shimmer}`} />
                    </div>
                    <div className='h-4 w-[40%] rounded-sm bg-neutral-200 hidden md:block' />
                    <div className='justify-end gap-4 md:flex hidden w-full'>
                        <div className={`h-8  w-[20%] rounded-sm bg-neutral-200 ${shimmer}`} />
                        <div className={`h-8  w-[20%] rounded-sm bg-neutral-200 ${shimmer}`} />
                    </div>
                </div>
            </div>
            <div className='justify-between md:justify-end gap-4 flex md:hidden '>
                <div className={`h-8  w-[50%] rounded-sm bg-neutral-200 ${shimmer}`} />
                <div className={`h-8  w-[50%] rounded-sm bg-neutral-200 ${shimmer}`} />
            </div>
        </div>
    );
}

export function TripsCardsSkeleton() {
    return (
        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-6 max-w-4xl mx-auto  xl:gap-x-8'>
            <TripsCard />
            <TripsCard />
            <TripsCard />
            <TripsCard />
        </div>
    );
}

export function CheckoutCardSkeleton() {
    return (
        <div className='flex flex-col gap-2 pt-2 lg:w-[400px]'>
            <div className='col-span-4 space-y-4 lg:col-span-1'>
                <div className={`relative h-10  rounded-lg bg-neutral-200 ${shimmer}`} />
                <div className=' flex gap-9'>
                    <div className={`relative h-10 w-[60%] rounded-lg bg-neutral-200 ${shimmer}`} />
                    <div className={`relative h-10 w-[40%] rounded-lg bg-neutral-200 ${shimmer}`} />
                </div>
                <div className={`relative h-10 rounded-lg bg-neutral-200 ${shimmer}`} />
                <div className={`relative h-4 rounded-md bg-neutral-200 ${shimmer}`} />
                <div className={`relative h-3 w-[50%] rounded-md bg-neutral-200 ${shimmer}`} />
            </div>
            <hr className='my-4' />
            <div className={`relative h-10 rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function CheckoutDetailsSkeleton() {
    return (
        <div className='mt-4 min-w-[300px] space-y-4'>
            <div className={`relative h-36 rounded-lg  bg-neutral-200 lg:w-[400px] ${shimmer}`} />
            <div className={`relative h-10 w-[80%]  rounded-md bg-neutral-200 ${shimmer}`} />

            <div className={`relative h-7   rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`relative h-7   rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`relative h-7   rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function PriceCalculatedListSkeleton() {
    return (
        <div className='space-y-2'>
            <div className={`h-64 w-full rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`ml-auto h-9 w-full rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className='flex w-full flex-col gap-4 '>
            <div className='flex-grow-1 flex-row items-start gap-4 '>
                <div className={`${shimmer} h-[200px] w-[75%] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='flex-grow-1 flex items-start gap-4 '>
                <div className={`${shimmer} h-12 w-[200px] rounded-lg rounded-tl-none bg-neutral-200 `} />
            </div>

            <div className='flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-10 w-[50%] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-12 w-[200px] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='flex-grow-1 hidden lg:flex items-start gap-4 '>
                <div className={`${shimmer} h-10 w-[200px] rounded-lg rounded-tl-none bg-neutral-200 `} />
            </div>

            <div className='hidden lg:flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-8 w-[50%] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>
        </div>
    );
}

export function TripsDetailsSkeleton() {
    return (
        <div className='container min-h-[65dvh]'>
            <div className='lg:hidden'>
                <TripsCard />
            </div>
            <div className='mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 pb-20 lg:gap-y-6 lg:gap-x-10'>
                <div className='col-span-4 space-y-4 lg:col-span-3'>
                    <div className={`relative h-[300px] rounded-xl bg-neutral-200 ${shimmer}`} />

                    <div className='h-8 w-full rounded-lg bg-neutral-200' />
                    <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                    <div className='h-4 w-1/3 rounded-lg bg-neutral-200' />
                </div>

                <div className='col-span-2 border p-2 rounded-md lg:p-4 lg:flex flex-col gap-3 hidden'>
                    <ChatSkeleton />
                </div>
            </div>
        </div>
    );
}
