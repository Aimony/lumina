/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx,md}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        code: {
                            backgroundColor: 'var(--tw-prose-pre-bg)',
                            padding: '0.25rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontWeight: '400',
                        },
                        'code::before': { content: 'none' },
                        'code::after': { content: 'none' },
                    },
                },
            },
        },
    },
    plugins: [],
}
