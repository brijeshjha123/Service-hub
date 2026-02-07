import { useContext } from 'react';
import { AuthContext } from '../context/InternalAuthContext';

/**
 * useAuth: Stable Hook.
 * Vite Fast Refresh works perfectly because this function is purely a hook.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
