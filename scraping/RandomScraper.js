export default class RandomScraper {
    constructor() {}

    generateRandomUniqueArray = (lowerBound, upperBound) => {
        let randomArray = [];

        while(1) {
            let randomValue = Math.floor(Math.random()*(upperBound-lowerBound+1)+lowerBound)
            if(randomArray.length > (upperBound-lowerBound)) break;
            if(randomArray.includes(randomValue)) continue;
            randomArray.push(randomValue)
        }
        return randomArray;
    }
}