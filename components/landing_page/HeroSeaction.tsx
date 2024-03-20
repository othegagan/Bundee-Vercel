'use client';

import Container from '../BoxContainer';
import LocationSearchComponent from '../search_box/LocationSearchComponent';

const HeroSeaction = () => {
    return (
        <>
            <section className="h-[70vh] bg-gray-900 bg-[url('https://images.unsplash.com/photo-1496055401924-5e7fdc885742?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]      bg-cover bg-no-repeat py-16 opacity-90 bg-blend-lighten sm:py-16 lg:py-24">
                <Container>
                    {/* <ClientOnly> */}
                    <LocationSearchComponent />
                    {/* </ClientOnly> */}
                </Container>
            </section>
        </>
    );
};

export default HeroSeaction;
