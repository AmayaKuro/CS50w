import React, { ReactNode } from 'react';

interface P {
    children: ReactNode;
}

const Navbar: React.FC<P> = ({ children }) => {
    return (
        <nav>
            <div>Header?</div>
            {children}
            <div>signout</div>
        </nav>
    );
};

export default Navbar;
