/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base retro palette
        void: '#07060d',
        carbon: '#0d0b1a',
        panel: '#13112a',
        edge: '#272045',
        // Neon accents
        neon: {
          pink: '#ff2e88',
          cyan: '#22e7ff',
          lime: '#9bff3d',
          amber: '#ffb627',
          purple: '#a855f7',
        },
        // Per-game signature colors
        halo: '#3da9fc',
        spire: '#f4a259',
        doom: '#c1121f',
        aoe: '#d4af37',
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'monospace'],
        pixel: ['"VT323"', 'monospace'],
        body: ['"Rajdhani"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 8px rgba(34,231,255,0.6), 0 0 24px rgba(34,231,255,0.25)',
        'neon-pink': '0 0 8px rgba(255,46,136,0.6), 0 0 24px rgba(255,46,136,0.25)',
        'inset-edge': 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.7' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.85' },
          '97%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-160px)', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        flicker: 'flicker 6s infinite',
        scan: 'scan 7s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
