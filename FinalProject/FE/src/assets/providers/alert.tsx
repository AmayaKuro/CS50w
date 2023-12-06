"use client";
import { useState, useEffect, useMemo, useContext, createContext, Dispatch, SetStateAction } from "react";
import { useSession, signOut } from "next-auth/react";

import { type AlertColor } from '@mui/material/Alert';


type AlertContextProps = {
    state: {
        alertMessage: string;
        severity?: AlertColor;
    };
    dispatch: {
        setAlertMessage: Dispatch<SetStateAction<string>>;
        setSeverity: Dispatch<SetStateAction<AlertColor | undefined>>;
    };
}


export const AlertContext = createContext({} as AlertContextProps);

export const useAlert = () => useContext(AlertContext);


const AlertProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [alertMessage, setAlertMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor | undefined>();

    const { data: session } = useSession();


    // Pop-up alert message when session expired and signout
    useEffect(() => {
        if (session?.error) {
            setAlertMessage(session?.error);
            setSeverity("error");
            signOut();
        }
    }, [session?.error]);

    // Use memo to prevent unnecessary re-render for the Provider
    const value = useMemo(() => ({
        state: {
            alertMessage: alertMessage,
            severity: severity,
        },
        dispatch: { setAlertMessage, setSeverity },
    }), [alertMessage, severity]);

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};


export default AlertProvider;
