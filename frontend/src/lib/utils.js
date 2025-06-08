export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getLanguageFlag = (language) => {
    const flags = {
        english: '🇬🇧',
        spanish: '🇪🇸',
        french: '🇫🇷',
        german: '🇩🇪',
        italian: '🇮🇹',
        portuguese: '🇵🇹',
        russian: '🇷🇺',
        chinese: '🇨🇳',
        japanese: '🇯🇵',
        korean: '🇰🇷',
        arabic: '🇸🇦',
        hindi: '🇮🇳',
        // Add more languages as needed
    };
    return flags[language.toLowerCase()] || '🌐';
};