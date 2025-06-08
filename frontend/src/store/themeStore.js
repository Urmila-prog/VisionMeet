import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Get system preference
const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

const useThemeStore = create(
    persist(
        (set) => ({
            theme: getSystemTheme(),
            setTheme: (theme) => {
                set({ theme });
                // Apply theme immediately
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', theme);
                }
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: false, // Enable hydration
            onRehydrateStorage: () => (state) => {
                // Apply theme after hydration
                if (state && typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', state.theme);
                }
            },
        }
    )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
    const theme = useThemeStore.getState().theme;
    document.documentElement.setAttribute('data-theme', theme);
}

export default useThemeStore; 