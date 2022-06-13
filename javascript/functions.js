export function extract(num, digit){
    const maxDigit = 5;
    if(maxDigit < digit){
        throw "不適切な値です。";
    }
    let result = Math.floor(num / (10 ** (digit - 1))) % 10;
    return result;
}