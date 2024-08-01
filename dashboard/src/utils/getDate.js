function getDate() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    const currentMonth = date.getMonth()+1;
    const currentYear = date.getFullYear();

    let xlabels = [];
    let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    for (let i = 1; i <= 12; i++) {
        let monthIndex = currentMonth - i;
        let year = currentYear;
        
        if (monthIndex < 0) {
            monthIndex += 12;
            year -= 1;
        }
        
        xlabels.push(`${year}-${months[monthIndex]}`);
    }

    xlabels = xlabels.reverse();
    return xlabels;
}

console.log(getDate())

module.exports = getDate;