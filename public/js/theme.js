const themes = {
    brutal1: {
        '--bg-primary': '#0A0A0A',
        '--bg-secondary': '#1A1A1A',
        '--bg-card': '#FFFFFF',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#AAAAAA',
        '--accent': '#FFD500',
        '--accent-secondary': '#6B21A8',
        '--border': '#FFD500',
        '--shadow': '#6B21A8'
    },
    brutal2: {
        '--bg-primary': '#0A0A0A',
        '--bg-secondary': '#111111',
        '--bg-card': '#FFD500',
        '--text-primary': '#FFD500',
        '--text-secondary': '#CCCCCC',
        '--accent': '#FF0000',
        '--accent-secondary': '#00FF00',
        '--border': '#FF0000',
        '--shadow': '#00FF00'
    },
    brutal3: {
        '--bg-primary': '#0A0A0A',
        '--bg-secondary': '#0D0D0D',
        '--bg-card': '#6B21A8',
        '--text-primary': '#6B21A8',
        '--text-secondary': '#AAAAAA',
        '--accent': '#FFD500',
        '--accent-secondary': '#FF0000',
        '--border': '#6B21A8',
        '--shadow': '#FFD500'
    },
    dark: {
        '--bg-primary': '#0A0A0A',
        '--bg-secondary': '#1A1A1A',
        '--bg-card': '#1A1A1A',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#AAAAAA',
        '--accent': '#6B21A8',
        '--accent-secondary': '#FFD500',
        '--border': '#6B21A8',
        '--shadow': '#FFD500'
    },
    light: {
        '--bg-primary': '#FFFFFF',
        '--bg-secondary': '#F0F0F0',
        '--bg-card': '#FFFFFF',
        '--text-primary': '#0A0A0A',
        '--text-secondary': '#666666',
        '--accent': '#FFD500',
        '--accent-secondary': '#6B21A8',
        '--border': '#0A0A0A',
        '--shadow': '#6B21A8'
    }
};

let currentTheme = 'brutal1';

export function applyTheme(themeName) {
    if (!themes[themeName]) return;
    currentTheme = themeName;
    const theme = themes[themeName];
    Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem('theme', themeName);
}

export function toggleTheme() {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    applyTheme(themeNames[nextIndex]);
}

export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'brutal1';
    applyTheme(savedTheme);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}
