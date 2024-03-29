export const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent`;

function VehicleCardSkeleton() {
    return (
        <div className='col-span-4 space-y-4 lg:col-span-1'>
            <div className={`relative h-[167px] rounded-xl bg-neutral-200 ${shimmer}`} />

            <div className='h-4 w-full rounded-lg bg-neutral-200' />
            <div className='h-6 w-1/3 rounded-lg bg-neutral-200' />
        </div>
    );
}

export function VehiclesCardsSkeleton() {
    return (
        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3  xl:gap-x-8'>
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
        <div className='min-h-screen py-4'>
            <div className='mx-auto max-w-7xl flex-col '>
                <div className='mx-auto max-w-2xl px-4  sm:px-6 lg:max-w-7xl lg:px-8 '>
                    <div className='my-3 space-y-3'>
                        <div className={`h-8 w-1/3 rounded-lg bg-neutral-200 ${shimmer}`} />
                    </div>

                    <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3  xl:gap-x-8'>
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

export function PersonaDetailsSkeleton() {
    return (
        <div className='space-y-4'>
            <div className={`h-6 w-56 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-64 rounded-md bg-neutral-200 ${shimmer}`} />
            <div className={`h-6 w-72 rounded-md bg-neutral-200 ${shimmer}`} />
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

export function TripsCardsSkeleton() {
    return (
        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-2  xl:gap-x-8'>
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
        </div>
    );
}

export function CheckoutCardSkeleton() {
    return (
        <div className='flex flex-col gap-2 pt-5'>
            <div className='col-span-4 space-y-4 lg:col-span-1'>
                <div className={`relative h-10  rounded-lg bg-neutral-300 ${shimmer}`} />
                <div className=' flex gap-9'>
                    <div className={`relative h-10 w-[60%] rounded-lg bg-neutral-300 ${shimmer}`} />
                    <div className={`relative h-10 w-[40%] rounded-lg bg-neutral-300 ${shimmer}`} />
                </div>
                <div className={`relative h-10 rounded-lg bg-neutral-300 ${shimmer}`} />
                <div className={`relative h-4 rounded-md bg-neutral-300 ${shimmer}`} />
                <div className={`relative h-4 w-[50%] rounded-md bg-neutral-300 ${shimmer}`} />
            </div>
            <hr className='my-4' />
            <div className={`relative h-12 rounded-md bg-neutral-300 ${shimmer}`} />
        </div>
    );
}
