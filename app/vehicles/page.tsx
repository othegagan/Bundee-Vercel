import Container from '@/components/Container';
import LocationSearchComponent from '@/components/LocationSearchComponent';
import Vehicles from './vehicles';

const Page = ({ searchParams }: any) => {
    return (
        <>
            <Container>
                <div className='z-40 md:sticky md:top-[3.5rem]'>
                    <LocationSearchComponent searchCity={searchParams.city || 'Austin, Texas, United States'} />
                </div>
                <Vehicles searchParams={searchParams} />
            </Container>
        </>
    );
};

export default Page;
