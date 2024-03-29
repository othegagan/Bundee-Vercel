
import BoxContainer from '@/components/BoxContainer';
import Vehicles from './vehicles';
import LocationSearchComponent from '@/components/search_box/LocationSearchComponent';

const Page = ({ searchParams }: any) => {
    return (
        <>
            <BoxContainer className='py-6'>
                <div className='z-40 md:sticky md:top-[3.5rem]'>
                    <LocationSearchComponent searchCity={searchParams.city || 'Austin, Texas, United States'} />
                </div>
                <Vehicles searchParams={searchParams} />
            </BoxContainer>
        </>
    );
};

export default Page;
