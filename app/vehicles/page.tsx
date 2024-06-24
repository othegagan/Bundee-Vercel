import BoxContainer from '@/components/BoxContainer';
import Vehicles from './vehicles';
import LocationSearchComponent from '@/components/search_box/LocationSearchComponent';

const Page = ({ searchParams }: any) => {
    return (
        <>
            <BoxContainer className='h-full  w-full overflow-hidden py-6 pt-0 '>
                <LocationSearchComponent searchCity={searchParams.city || 'Austin, Texas, United States'} />
                <Vehicles searchParams={searchParams} />
            </BoxContainer>
        </>
    );
};

export default Page;
