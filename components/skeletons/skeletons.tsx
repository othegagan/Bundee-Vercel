import { cn } from '@/lib/utils';

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
        <div className={`lg:grid-cols- mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2${columns || 3} xl:gap-x-8 ${className}`}>
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
        <div className='container min-h-[65dvh] p-4'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Left column */}
                <div className='space-y-4 lg:col-span-2'>
                    <div className={`relative h-[300px] rounded-xl bg-neutral-200 ${shimmer}`} />

                    <div className='h-8 w-full rounded-lg bg-neutral-200' />
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <div className='h-4 w-full rounded-lg bg-neutral-200' />
                            <div className='h-4 w-full rounded-lg bg-neutral-200' />
                            <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                        </div>
                        <div className='space-y-2'>
                            <div className='h-4 w-full rounded-lg bg-neutral-200' />
                            <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                        </div>
                    </div>
                    <div className='h-20 w-full rounded-lg bg-neutral-200' />
                </div>

                {/* Right column */}
                <div className='space-y-4'>
                    <div className='h-8 w-full rounded-lg bg-neutral-200' />
                    <div className='h-10 w-full rounded-lg bg-neutral-200' />
                    <div className='space-y-2'>
                        <div className='h-4 w-full rounded-lg bg-neutral-200' />
                        <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                    </div>
                    <div className='h-10 w-full rounded-lg bg-neutral-200' />
                    <div className='space-y-2'>
                        <div className='h-4 w-full rounded-lg bg-neutral-200' />
                        <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                    </div>
                    <div className='h-20 w-full rounded-lg bg-neutral-200' />
                    <div className='h-10 w-full rounded-lg bg-neutral-200' />
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
        <div className={cn('flex flex-col gap-2 border-b pb-3 md:flex-row', className)}>
            <div className='flex w-full gap-4'>
                <div className={`relative h-20 w-36 rounded-md bg-neutral-200 md:h-28 ${shimmer}`} />

                <div className='flex h-full w-full flex-col gap-2 '>
                    <div className='flex w-full gap-2 md:flex-row md:items-center md:justify-between'>
                        <div className='flex w-full flex-col gap-2'>
                            <div className={`h-6 w-full rounded-sm bg-neutral-200 md:h-8 md:w-[50%] ${shimmer}`} />
                            <div className='h-4 w-[50%] rounded-sm bg-neutral-200 md:w-[25%]' />
                        </div>
                        <div className={`hidden h-8 w-[20%] rounded-sm bg-neutral-200 md:block ${shimmer}`} />
                    </div>
                    <div className='hidden h-4 w-[40%] rounded-sm bg-neutral-200 md:block' />
                    <div className='hidden w-full justify-end gap-4 md:flex'>
                        <div className={`h-8 w-[20%] rounded-sm bg-neutral-200 ${shimmer}`} />
                        <div className={`h-8 w-[20%] rounded-sm bg-neutral-200 ${shimmer}`} />
                    </div>
                </div>
            </div>
            <div className='flex justify-between gap-4 md:hidden md:justify-end '>
                <div className={`h-8 w-[50%] rounded-sm bg-neutral-200 ${shimmer}`} />
                <div className={`h-8 w-[50%] rounded-sm bg-neutral-200 ${shimmer}`} />
            </div>
        </div>
    );
}

export function TripsCardsSkeleton() {
    return (
        <div className='mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-x-6 gap-y-6 xl:gap-x-8'>
            <TripsCard />
            <TripsCard />
            <TripsCard />
            <TripsCard />
        </div>
    );
}

export function CheckoutCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex w-full flex-col gap-2 pt-2 ', className)}>
            <div className='col-span-4 space-y-4 lg:col-span-1'>
                <div className={`relative h-10 rounded-lg bg-neutral-200 ${shimmer}`} />
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
        <div className='mt-4 w-full min-w-[300px] space-y-4'>
            <div className={`relative h-36 rounded-lg bg-neutral-200 lg:w-[400px] ${shimmer}`} />
            <div className={`relative h-10 w-[80%] rounded-md bg-neutral-200 ${shimmer}`} />

            <div className={`relative h-7 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`relative h-7 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`relative h-7 rounded-md bg-neutral-200 ${shimmer}`} />
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

            <div className='flex flex-grow-1 items-start gap-4 '>
                <div className={`${shimmer} h-12 w-[200px] rounded-lg rounded-tl-none bg-neutral-200 `} />
            </div>

            <div className='flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-10 w-[50%] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-12 w-[200px] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='hidden flex-grow-1 items-start gap-4 lg:flex '>
                <div className={`${shimmer} h-10 w-[200px] rounded-lg rounded-tl-none bg-neutral-200 `} />
            </div>

            <div className='flex flex-row-reverse items-start gap-4 '>
                <div className={`${shimmer} h-12 w-[200px] rounded-lg rounded-br-none bg-neutral-200 `} />
            </div>

            <div className='hidden flex-row-reverse items-start gap-4 lg:flex '>
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
            <div className='mt-4 grid grid-cols-1 gap-4 px-4 pb-20 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-6'>
                <div className='col-span-4 space-y-4 lg:col-span-3'>
                    <div className={`relative h-[300px] rounded-xl bg-neutral-200 ${shimmer}`} />

                    <div className='h-8 w-full rounded-lg bg-neutral-200' />
                    <div className='h-4 w-2/3 rounded-lg bg-neutral-200' />
                    <div className='h-4 w-1/3 rounded-lg bg-neutral-200' />
                </div>

                <div className='col-span-2 hidden flex-col gap-3 rounded-md border p-2 lg:flex lg:p-4'>
                    <ChatSkeleton />
                </div>
            </div>
        </div>
    );
}

export function CheckoutDrivingLicenceSkeleton() {
    return (
        <div className='mt-4 flex w-full min-w-[300px] flex-col gap-4 md:gap-7'>
            <div className={`relative h-8 w-[60%] rounded-md bg-neutral-200 ${shimmer}`} />
            <div className='space-y-2'>
                <div className={`relative h-8 rounded-md bg-neutral-200 ${shimmer}`} />
                <div className={`relative h-8 w-[70%] rounded-md bg-neutral-200 ${shimmer}`} />
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6'>
                <div className={`relative h-12 rounded-md bg-neutral-200 ${shimmer}`} />
                <div className={`relative h-12 rounded-md bg-neutral-200 ${shimmer}`} />
                <div className={`relative h-12 rounded-md bg-neutral-200 ${shimmer}`} />
            </div>
            <div className={`relative h-10 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`relative h-10 rounded-md bg-neutral-200 ${shimmer}`} />
        </div>
    );
}
