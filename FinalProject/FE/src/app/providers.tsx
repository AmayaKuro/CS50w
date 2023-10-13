"use client";
import * as React from 'react';

import type { Session } from "next-auth/core/types";
import { SessionProvider, SessionProviderProps } from "next-auth/react";

import { createTheme, ThemeProvider } from '@mui/material/styles';

type Props = {
  children?: React.ReactNode;
};


export const NextAuthProvider = ({ children, session }: { children: React.ReactNode, session?: Session }) => {
  return <SessionProvider
    session={session}
    refetchInterval={parseInt(process.env.BACKEND_ACCESS_TOKEN_LIFETIME ?? "")}
  >
    {children}
  </SessionProvider>;
};


export const Theme = ({ children }: Props) => {
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#f7f8f9',
      },
      secondary: {
        main: '#d0d0d5',
      },
      error: {
        main: '#f05858',
      },
    },
  }), [])

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
