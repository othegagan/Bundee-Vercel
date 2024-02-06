import Link from 'next/link';

export default function CheckoutSuccess() {
    return (
        <>
            <main className='flex flex-col items-center bg-white px-6 sm:py-32 lg:px-8'>
                <img className='h-[200px]' src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce' alt='' />
                <div className='text-center'>
                    <p className='text-base font-semibold text-primary'>Thanks for Booking with Bundee</p>
                    <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl'>Reservation Request has been submitted</h1>
                    <p className='mt-6 text-base leading-7 text-gray-600 lg-w-[600px] w-full mx-auto'>You should hear back from your vehicle Host shortly. In addition, you can check your reservation details by clicking on the Trip Status button below.</p>
                    <div className='mt-10'>
                        <Link className='ounded-md bg-green-600 text-sm font-semibold rounded-full p-4 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' href='/trips'>
                            See Trip Status
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
