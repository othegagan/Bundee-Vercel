import { format } from 'date-fns';
import Link from 'next/link';
import { extractTimeIn12HourFormat } from '@/lib/createDateTime';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';

const TripsList = ({ tripsData }) => {
    // Check if tripsData is an array and has elements
    if (!Array.isArray(tripsData) || tripsData.length === 0) {
        return <div className='h-[500px] flex justify-center items-center bg-primary/5 w-full text-lg rounded-lg text-red-700 mb-10'>No trips available.</div>;
    }

    function handleNavigateToDetails(tripId: any) {
        window.location.href = `/trips/${tripId}`;
    }

    return (
        <div>
            {tripsData ? (
                <div className='grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2 w-full'>
                    {tripsData.map(trip => (
                        <div
                            onClick={() => handleNavigateToDetails(trip.tripid)}
                            key={trip.tripid}
                            className='flex flex-col gap-4 md:flex-row group cursor-pointer p-3  rounded-md shadow'>
                            <div className=' w-full overflow-hidden rounded-md bg-neutral-200  group-hover:opacity-75 h-44 md:h-40 md:w-64'>
                                <img
                                    src={trip.vehicleImages[0]?.imagename}
                                    alt={`${trip.vehmake} ${trip.vehmodel}`}
                                    className='h-full w-full object-cover group-hover:scale-110 transition-all ease-in-out object-center lg:h-full lg:w-full'
                                />
                            </div>

                            <div className='flex flex-auto flex-col'>
                                <div>
                                    <h4 className='font-semibold text-gray-900'>{`${trip.vehmake} ${trip.vehmodel} (${trip.vehyear})`}</h4>
                                    <div className='mt-2 text-xs  text-gray-600 w-full flex'>
                                        <div className='w-1/3 space-y-2'>
                                            <p>Start Date</p>
                                            <p>End Date</p>
                                            <p>Pickup</p>
                                        </div>
                                        <div className='w-2/3 space-y-2 font-medium'>
                                            <p>
                                                {format(new Date(trip.starttime), 'LLL dd, y')} | {format(new Date(trip.starttime), 'h:mm a')}
                                            </p>
                                            <p>
                                                {format(new Date(trip.endtime), 'LLL dd, y')} | {format(new Date(trip.endtime), 'h:mm a')}
                                            </p>
                                            <p>
                                                <>
                                                    {trip?.vehaddress1}
                                                    {trip?.vehaddress2 ? ', ' + trip?.vechaddress2 : null}
                                                    {trip?.vehzipcode ? ', ' + trip?.vehzipcode : null}
                                                    {trip?.vehcityname ? ', ' + trip?.vehcityname : null}
                                                    {trip?.vehstate ? ', ' + trip.vehstate : null}
                                                </>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-6 flex flex-1 items-end'>
                                    <dl className='flex space-x-4  text-sm '>
                                        <div className='flex'>
                                            <div
                                                className={`text-sm font-medium me-2 px-2.5 py-1 rounded dark:text-red-300 ${
                                                    trip.status === 'Approved'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900'
                                                        : trip.status === 'Requested'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                                                        : trip.status === 'Started'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900'
                                                }`}>
                                                {trip.status}
                                            </div>
                                        </div>

                                        {trip.swapDetails && trip.swapDetails.length > 0 && (
                                            <div className='space-x-4  text-sm  flex '>
                                                <div className='h-8 border border-neutral-200'></div>

                                                <div className='flex'>
                                                    <div>
                                                        {trip.swapDetails[0].statuscode.toLowerCase() === 'swappr' && (
                                                            <span className=' inline-flex items-center rounded-md bg-yellow-50 p-2 whitespace-nowrap text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'>
                                                                {' '}
                                                                Swap Proposal Requested
                                                            </span>
                                                        )}

                                                        {trip.swapDetails[0].statuscode.toLowerCase() === 'swaprej' && (
                                                            <span className=' inline-flex items-center rounded-md bg-red-50 p-2 whitespace-nowrap text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20'>
                                                                {' '}
                                                                Swap Proposal Requested
                                                            </span>
                                                        )}

                                                        {trip.swapDetails[0].statuscode.toLowerCase() === 'swapacc' && (
                                                            <span className=' inline-flex items-center rounded-md bg-green-50 p-2 whitespace-nowrap text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20'>
                                                                {' '}
                                                                Swap Proposal Approved
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <VehiclesCardsSkeleton />
            )}
        </div>
    );
};

export default TripsList;
