interface ContatinerProps {
    children: React.ReactNode;
    className?: string;
}

const BoxContainer: React.FC<ContatinerProps> = ({ children, className }) => {
    return <div className={`max-container  ${className}`}>{children}</div>;
};

export default BoxContainer;
