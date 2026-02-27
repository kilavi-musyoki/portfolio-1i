import React from 'react';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span>
                {isDark ? 'Dark' : 'Light'}
            </span>
        </button>
    );
};

export default ThemeToggle;
