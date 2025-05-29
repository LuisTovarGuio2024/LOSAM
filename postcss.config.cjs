// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // ←  único plugin Tailwind correcto
    autoprefixer: {},
  },
};
