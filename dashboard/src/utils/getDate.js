function getDate(){
    const date = new Date()
    date.setUTCHours(0, 0, 0, 0);
    const Month = date.getUTCMonth()+1
    const Year = date.getUTCFullYear()

    var xlabels = []
    let months = ['01','02','03','04','05','06','07','08','09','10','11','12']

    if (Month-1<6){
        let i = 0;
        let j = 11;
        let len = 11;
        while(i != Month-1){
            xlabels.push(`${Year}-${months[i]}`);
            i++
        }
        xlabels = xlabels.reverse()
        remELement = (len+1) - xlabels.length

        while(j != len-remELement){
            xlabels.push(`${Year-1}-${months[j]}`)
            j--
        }
        xlabels = xlabels.reverse()
    } 

    if(Month-1>=6){
        let i = Month - 7;
        while(i != Month-1){
            xlabels.push(`${Year}-${months[i]}`);
            i++
        }
    }
    return xlabels
}

module.exports = getDate;