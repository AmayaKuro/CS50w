import React, { ReactNode } from 'react';

import styles from '@/css/navbar/navbar.module.css';

interface P {
    children: ReactNode;
}

const Navbar: React.FC<P> = ({ children }) => {
    return (
        <nav id={styles.navbar}>
            <div id={styles.navHeader}>
                <img src="/favicon.ico" alt="logo" />
            </div>
            {children}
            <div id={styles.navFooter}>signout</div>
        </nav>
    );
};

export default Navbar;
