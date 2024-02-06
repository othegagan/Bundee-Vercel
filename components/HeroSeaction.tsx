'use client';

import Container from './Container';
import LocationSearchComponent from './LocationSearchComponent';

const HeroSeaction = () => {
    return (
        <>
            <section className="bg-[url('https://images.unsplash.com/photo-1496055401924-5e7fdc885742?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat      py-16 bg-gray-900 sm:py-16 lg:py-24 h-[70vh] bg-blend-lighten opacity-90">
                <Container>
                    <LocationSearchComponent />
                </Container>
            </section>
        </>
    );
};

export default HeroSeaction;
