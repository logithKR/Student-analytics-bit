import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // 1. Check if user has explicitly manually chosen a theme
    const manualChoice = localStorage.getItem('bit_theme_manual_choice');
    if (manualChoice === 'true') {
      const saved = localStorage.getItem('bit_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    // 2. Default to white theme (light) across landing and all pages
    return 'light';
  });

  useEffect(() => {
    // Apply attribute and class to html root
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('bit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    localStorage.setItem('bit_theme_manual_choice', 'true');
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      localStorage.setItem('bit_theme_manual_choice', 'true');
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
