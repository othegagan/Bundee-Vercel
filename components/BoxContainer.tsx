interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

const BoxContainer: React.FC<ContainerProps> = ({ children, className }) => {
    return <div className={`container  ${className}`}>{children}</div>;
};

export default BoxContainer;
