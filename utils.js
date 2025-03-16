// import { parseISO } from 'date-fns';

function parseExcelDate(rawDate) {
    let parsedDate = null;


    if (typeof rawDate === 'number') {
        const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel date starts from Jan 1, 1900 in UTC
        const parsedDate = new Date(excelEpoch.getTime() + (rawDate - 2) * 86400000); // Convert to real date
        return parsedDate;
    }

    // Try parsing "Mmm-yy" (e.g., "Feb-24")
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/.test(rawDate)) {
        const month = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
        const [monthStr, yearStr] = rawDate.split('-');
        const year = parseInt(`20${yearStr}`, 10); // e.g., 2025
        const monthNum = month[monthStr] - 1; // 0-based for JavaScript (April = 3)
        parsedDate = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));
    }
    // Try parsing "Mmm" (e.g., "Feb") and assume current year
    else if (/^[A-Za-z]{3}$/.test(rawDate)) {
        const monthMap = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };

        const monthNum = monthMap[rawDate];
        if (!monthNum) {
            throw new Error('Invalid month abbreviation');
        }

        const currentYear = new Date().getFullYear();
        parsedDate = new Date(Date.UTC(currentYear, monthNum - 1, 1, 0, 0, 0, 0));
    }
    else if (/^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(rawDate.toLowerCase())) {
        const monthMap = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
            'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        const normalizedMonth = rawDate.charAt(0).toUpperCase() + rawDate.slice(1).toLowerCase(); // Normalize case
        const monthNum = monthMap[normalizedMonth];
        if (!monthNum) {
            throw new Error('Invalid month name');
        }
        const currentYear = new Date().getFullYear();
        parsedDate = new Date(Date.UTC(currentYear, monthNum - 1, 1, 0, 0, 0, 0));
    }
    // Ensure parsing was successful
    if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
    }

    return parsedDate;
}


export { parseExcelDate };