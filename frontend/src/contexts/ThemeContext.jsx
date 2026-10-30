import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'darkMode';

const readInitialTheme = () => {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', darkMode);
    root.dataset.theme = darkMode ? 'dark' : 'light';
    root.style.colorScheme = darkMode ? 'dark' : 'light';

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, String(darkMode));
    } catch {
      // La preferencia sigue funcionando durante la sesión si el storage está bloqueado.
    }
  }, [darkMode]);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      setDarkMode(event.newValue === 'true');
    };

    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  const value = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
