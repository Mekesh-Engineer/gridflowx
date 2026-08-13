import { useTheme } from 'next-themes';

/**
 * Thin wrapper around next-themes so components can import theme toggle helper
 * without touching ThemeProvider directly.
 */
export function useThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';
    const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');
    return { isDarkMode, toggleTheme };
}

// Backwards compatibility alias
export const useThemeStore = useThemeToggle;
