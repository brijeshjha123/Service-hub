import { createContext } from 'react';

/**
 * STARTUP-GRADE ARCHITECTURE:
 * We export ONLY the context instance from this file.
 * This ensures that the context object is stable and never triggers
 * "export incompatible" warnings in Vite/HMR.
 */
export const AuthContext = createContext();
