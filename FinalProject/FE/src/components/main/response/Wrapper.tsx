import styles from "@/css/main/response/Wrapper.module.css";


const Wrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
    return (
        <div className={styles.wrapper} {...props}>
            {children}
        </div>
    );
}

export default Wrapper;