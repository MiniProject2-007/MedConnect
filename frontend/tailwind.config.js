/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {},
            backgroundColor: {
                main: "#006769",
                "light-bg": "#eff4f6",
                "dark-bg": "#191c24",
                "light-bg-sec": "#ffffff",
                "dark-bg-sec": "#22252f",
                "dark-text": "#1f2937",
                "light-text": "#d1d5db",
            },
        },
    },
    plugins: [],
};
