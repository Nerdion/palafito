const puppeteer = require('puppeteer')
const randomUseragent = require('random-useragent');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
PUPPETEER_UI_FLAG = true;

const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        {id: 'href', title: 'LINK'},
    ]
});


const main = async () => {
    let userAgent = randomUseragent.getRandom(function (ua) {
        return parseFloat(ua.browserVersion) >= 74;
    });

    const browser = await puppeteer.launch({
        headless: PUPPETEER_UI_FLAG,
    })

    const context = await browser.createIncognitoBrowserContext();
    let page = await context.newPage();
    
    await page.setRequestInterception(true);
    await page.setBypassCSP(true);
    await page.setCacheEnabled(false);
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1366, height: 768});

    page.on('request', (request) => {
        if (['font'].indexOf(request.resourceType()) !== -1) {
            request.abort();}
        else {
            request.continue();
        }
    });

    await page.goto('https://www.immoweb.be/en/search/for-sale?countries=BE&page=1&orderBy=relevance', {waitUntil: "networkidle2"})

    const PageCountSelector = '#searchResults > div:nth-child(3) > div > div > div.grid__item.medium--6.desktop--7.medium--pull--1.result-section--list > div > div > div > div > nav > ul > li:nth-child(4) > a > span.button__label'

    let countValue = await page.$eval(PageCountSelector, el => el.innerText);

    console.log('Found-',countValue, ' values')

    for(let i = 1; i <= parseInt(countValue); i ++) {
        console.log('Navigating- ', i)
        let url = `https://www.immoweb.be/en/search/for-sale?countries=BE&page=${i}&orderBy=relevance`
        await page.goto(url, {waitUntil: "networkidle2"})
        
        let values = await page.$$eval('.card__title.card--result__title > a', options => options.map(val => val.href))

        let records = [];

        await values.forEach(val=> {
            records.push({href: val})
        })

        await csvWriter.writeRecords(records)

        let cookies = await page.cookies()
        await page.deleteCookie(...cookies)
    }
}

main()