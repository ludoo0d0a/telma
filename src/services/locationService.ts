/**
 * Clean location names by removing redundant parenthetical information
 * Example: "Thionville (Thionville)" -> "Thionville"
 * But keep: "Paris (Gare du Nord)" -> "Paris (Gare du Nord)"
 */
export const cleanLocationName = (name: string | null | undefined): string | null | undefined => {
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

