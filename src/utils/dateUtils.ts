export const parseUTCDate = (apiDate: string): Date => {
    // Handle null/undefined values
    if (!apiDate || typeof apiDate !== 'string') {
        throw new Error(`parseUTCDate: Invalid date input: ${apiDate}`);
    }
    
    // API date format: "20250113T152944" (UTC)
    // Convert to ISO format and parse as UTC
    const utcDate = apiDate.split('')
    utcDate.splice(4, 0, '-')
    utcDate.splice(7, 0, '-')
    utcDate.splice(13, 0, ':')
    utcDate.splice(16, 0, ':')
    // Append 'Z' to indicate UTC timezone
    const isoString = utcDate.join('') + 'Z'
    return new Date(isoString)
}

export const getFullMinutes = (date: Date): string => {
    if (date.getMinutes() < 10){
        return `0${date.getMinutes()}`
    } else{
        return String(date.getMinutes())
    }
}


// Format time from Date object
// separator: 'h' (default) or ':' for different formats
export const formatTime = (date: Date | null | undefined, separator: string = 'h'): string => {
    if (!date) return '-';
    if (separator === ':') {
        return `${date.getHours()}:${getFullMinutes(date)}`;
    }
    return `${date.getHours()}h${getFullMinutes(date)}`;
}

// Format date from Date object
// format: 'full' (default) for full format, 'short' for abbreviated format
export const formatDate = (date: Date | null | undefined, format: 'full' | 'short' = 'full'): string => {
    if (!date) return '-';
    
    if (format === 'short') {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    }
    
    // Full format (default)
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a date string from YYYYMMDD to DD/MM/YYYY
 */
export const formatDateString = (dateString: string | undefined): string => {
    if (!dateString || dateString.length !== 8) return dateString || '';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
};

/**
 * Format a datetime string from YYYYMMDDTHHmmss to readable format (DD/MM/YYYY HH:mm:ss)
 */
export const formatDateTimeString = (dateTimeString: string | undefined): string => {
    if (!dateTimeString) return 'N/A';
    try {
        const date = dateTimeString.substring(0, 8);
        const time = dateTimeString.substring(9);
        const formattedDate = formatDateString(date);
        const hours = time.substring(0, 2);
        const minutes = time.substring(2, 4);
        const seconds = time.substring(4, 6);
        return `${formattedDate} ${hours}:${minutes}:${seconds}`;
    } catch (err) {
        return dateTimeString;
    }
};


