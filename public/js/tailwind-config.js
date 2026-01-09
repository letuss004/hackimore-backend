/**
 * Tailwind CSS Configuration
 * Custom theme configuration for POD website
 */

tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#19272B',
          light: '#23343A',
          lighter: '#2E4249',
          accent: '#38bdf8', // Light Cyan/Blue for pop
          accentGlow: 'rgba(56, 189, 248, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
};

