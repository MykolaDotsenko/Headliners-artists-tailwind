const plugin = require('tailwindcss/plugin');

const animationDelay = plugin(function({ addUtilities, theme }) {
  // Define the utility classes for animation delay
  addUtilities({
    // Generate utility classes for each defined delay
    ...Object.entries(theme('animationDelay')).reduce((acc, [key, value]) => {
      acc[`.animation-delay-${key}`] = { animationDelay: value };
      return acc;
    }, {}),
  });
}, {
  // Add the animationDelay theme configuration
  theme: {
    animationDelay: {
      100: '100ms',
      200: '200ms',
      300: '300ms',
      400: '400ms',
      500: '500ms',
      600: '600ms',
      700: '700ms',
      800: '800ms',
      900: '900ms',
      1000: '1000ms',
    },
  },
});

module.exports = animationDelay;
