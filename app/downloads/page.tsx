import Link from 'next/link';

export default function DownloadsApp() {
    return (
        <>
            <div className='flex h-screen flex-col items-center gap-2 w-full mx-auto lg:w-7xl'>
                <h3 className='font-bold mt-8 text-3xl'>Scan the QR code to Download the APP</h3>
                <p>Use the Google lens & Ios camera to scan the Qr code</p>

                {/* Responsive layout changes here */}
                <div className='mt-6 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-20'>
                    <div className='flex flex-col justify-center items-center bg-white p-10 shadow-lg border border-primary rounded-lg'>
                        <img className='h-[300px] w-[300px]' src='./apple.png' alt='App store App' />
                        <h1 className='text-3xl font-bold mt-2'>IOS App</h1>
                        <Link href='https://apps.apple.com/in/app/mybundee/id6451430817' className='bg-primary text-white mt-10 p-3 px-6 rounded-full font-bold'>
                            Download Now
                        </Link>
                    </div>

                    <div className='flex flex-col justify-center items-center bg-white p-10 shadow-lg border border-primary rounded-lg'>
                        <img className='h-[300px] w-[300px]' src='./andriod.png' alt='Google Play App' />
                        <h1 className='text-3xl font-bold mt-2'>Android App</h1>
                        <Link href='https://play.google.com/store/apps/details?id=com.bundee_mobile_app' className='bg-primary text-white mt-10 p-3 px-6 rounded-full font-bold'>
                            Download Now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
