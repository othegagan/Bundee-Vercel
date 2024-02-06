import Container from '@/components/Container';
import LocationSearchComponent from '@/components/LocationSearchComponent';
import Vehicles from './vehicles';

const Page = ({ searchParams }: any) => {

    return (
        <>
            <Container>
                <div className='z-50 md:sticky md:top-[3.5rem]'>
                    <LocationSearchComponent />
                </div>
                <Vehicles searchParams={searchParams} />
            </Container>
        </>
    );
};

export default Page;
