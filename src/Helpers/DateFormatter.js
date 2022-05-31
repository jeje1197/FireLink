// Helper Class to format dates to 'hhmm_ampm'

export function HHMM_AMPM(date) {
    if (date == null) return "";
    
    const localDate = date.toDate();
  
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();

    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const AM_PM = hours >= 12 ? 'pm' : 'am';

    const formattedTime = formattedHours + ':' + formattedMinutes + ' ' + AM_PM;
    
    return formattedTime;
}