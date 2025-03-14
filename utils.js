// import { parseISO } from 'date-fns';

function parseExcelDate(rawDate) {
    let parsedDate = null;


    if (typeof rawDate === 'number') {
        const excelEpoch = new Date(1900, 0, 1); // Excel date starts from Jan 1, 1900
        const parsedDate = new Date(excelEpoch.getTime() + (rawDate - 1) * 86400000); // Convert to real date
        parsedDate.setHours(0, 0, 0, 0); // Reset time to midnight
        return parsedDate;
    }

    // Try parsing "Mmm-yy" (e.g., "Feb-24")
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/.test(rawDate)) {

        const month = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
        const [monthStr, yearStr] = rawDate.split('-');
        const isoString = `20${yearStr}-${month[monthStr].toString().padStart(2, '0')}-01`;
        parsedDate = new Date(isoString);
        parsedDate.setHours(0, 0, 0, 0);
    }
    // Try parsing "Mmm" (e.g., "Feb") and assume current year
    else if (/^[A-Za-z]{3}$/.test(rawDate)) {

        // Map month abbreviations to their numeric values (1-12)
        const monthMap = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };

        // Get the numeric month value from the abbreviation
        const monthNum = monthMap[rawDate];
        if (!monthNum) {
            throw new Error('Invalid month abbreviation');
        }

        // Ensure that the current year is correctly retrieved
        const currentYear = new Date().getFullYear();

        // Create ISO format YYYY-MM-DD with the first day of the month
        const isoString = `${currentYear}-${monthNum.toString().padStart(2, '0')}-01`;

        // Parse the ISO string
        parsedDate = new Date(isoString);
        parsedDate.setHours(0, 0, 0, 0);
    }
    else if (/^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(rawDate.toLowerCase())) {
        const monthMap = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
            'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        const monthNum = monthMap[rawDate.charAt(0).toUpperCase() + rawDate.slice(1).toLowerCase()]; // Normalize case
        if (!monthNum) {
            throw new Error('Invalid month name');
        }
        const currentYear = new Date().getFullYear();
        const isoString = `${currentYear}-${monthNum.toString().padStart(2, '0')}-01`;
        parsedDate = new Date(isoString);
        parsedDate.setHours(0, 0, 0, 0);
    }

    // Ensure parsing was successful
    if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
    }

    return parsedDate;
}


export { parseExcelDate };