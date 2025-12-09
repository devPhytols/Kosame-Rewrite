module.exports = (num) => {
    if (!num || isNaN(num)) return '0';
    if (typeof num === 'string') num = parseInt(num);

    const decPlaces = Math.pow(10, 1);
    const money = ['K', 'M', 'B', 'T'];

    for (var i = money.length - 1; i >= 0; i--) {
        const size = Math.pow(10, (i + 1) * 3);
        
        if (size <= num) {
            num = Math.round((num * decPlaces) / size) / decPlaces;
            if (num == 1000 && i < money.length - 1) {
                num = 1;
                i++;
            }
            num += money[i];
            break;
        }
    }
    return num;
};
