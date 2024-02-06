'use client';

interface ContatinerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContatinerProps> = ({ children }) => {
    return <div className='mx-auto max-w-7xl px-4   py-2 sm:px-6 lg:px-8 w-full'>{children}</div>;
};

export default Container;
