
import BoxContainer from '@/components/BoxContainer';
import Vehicles from './vehicles';
import LocationSearchComponent from '@/components/search_box/LocationSearchComponent';

const Page = ({ searchParams }: any) => {
    return (
        <>
            <BoxContainer className='py-6 pt-0'>
                <div className='z-[30] md:sticky md:top-[3.75rem] bg-white'>
                    <LocationSearchComponent searchCity={searchParams.city || 'Austin, Texas, United States'} />
                </div>
                <Vehicles searchParams={searchParams} />
            </BoxContainer>
        </>
    );
};

export default Page;
