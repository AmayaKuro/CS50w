import React, { ReactNode } from 'react';

import FooterComponent from './footer.component';

import styles from '@/css/navbar/navbar.module.css';

interface P {
    children: ReactNode;
}

const Navbar: React.FC<P> = ({ children }) => {
    return (
        <nav id={styles.navbar}>
            <div className={styles.navHeader}>
                <img src="/favicon.ico" alt="logo" />
            </div>

            <div className={styles.navBody}>
                {children}
            </div>

            <div className={styles.navFooter}>
                <FooterComponent />
            </div>
        </nav>
    );
};

export default Navbar;
