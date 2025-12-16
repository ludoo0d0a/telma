export const parseUTCDate = (apiDate) => {
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

export const getFullMinutes = (date) => {
    if (date.getMinutes() < 10){
        return `0${date.getMinutes()}`
    } else{
        return date.getMinutes()
    }
}

export const calculateDelay = (baseDepartureTime, realDepartureTime) => {
    if (baseDepartureTime.getTime() !== realDepartureTime.getTime()){
        const minutesDelay = (realDepartureTime.getTime() - baseDepartureTime.getTime()) / (1000 * 60)
        if (minutesDelay >= 60) {
            return `retard ${Math.floor(minutesDelay / 60)}h${minutesDelay % 60}`
        }
        return `retard ${minutesDelay}min`
    }
    return 'à l\'heure'
}

// Clean location names by removing redundant parenthetical information
// Example: "Thionville (Thionville)" -> "Thionville"
// But keep: "Paris (Gare du Nord)" -> "Paris (Gare du Nord)"
export const cleanLocationName = (name) => {
    if (!name) return name;
    
    // Match pattern like "Name (Name)" or "Name (name)" or "Name (NAME)"
    const redundantPattern = /^(.+?)\s*\((.+?)\)\s*$/;
    const match = name.match(redundantPattern);
    
    if (match) {
        const mainName = match[1].trim();
        const parentheticalName = match[2].trim();
        
        // Normalize both names for comparison (case-insensitive, trim whitespace)
        const normalizedMain = mainName.toLowerCase().trim();
        const normalizedParenthetical = parentheticalName.toLowerCase().trim();
        
        // If they're the same, return just the main name
        if (normalizedMain === normalizedParenthetical) {
            return mainName;
        }
    }
    
    // Return original name if no redundant pattern found
    return name;
}