import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ size = 'sm', className = '', variant = 'outline-secondary' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀ Light mode' : '🌙 Dark mode'}
    </Button>
  );
};

export default ThemeToggle;
