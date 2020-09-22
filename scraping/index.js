import puppeteer from 'puppeteer'
import randomUseragent from 'random-useragent'
import * as fs from 'fs'

import {DB} from './DB.js'
let db = new DB();

const PUPPETEER_UI_FLAG = false

const propertyInputValues = ["HOUSE,APARTMENT", "HOUSE_GROUP", "APARTMENT_GROUP", "GARAGE", "OFFICE", "COMMERCIAL", "INDUSTRY", "LAND", "TENEMENT_BUILDING", "OTHER"]
const propertyDropdown = '[aria-labelledby="inputPropertyTypeLabel inputPropertyTypes"]'
const propertyListSelector = '.card__title.card--result__title > a'
const propertyCountSelector = '#searchResults > div:nth-child(3) > div > div > div.grid__item.medium--6.desktop--7.medium--pull--1.result-section--list > div > div > div > div > nav > ul > li:nth-child(4) > a > span.button__label'
const multiSelectInput = '.multiselect__input'

const main = async () => {

    //setting up the browser
    const browser = await puppeteer.launch({
        headless: PUPPETEER_UI_FLAG,
    })
    const context = await browser.createIncognitoBrowserContext()
    let page = await context.newPage()

    let userAgent = randomUseragent.getRandom((ua) => parseFloat(ua.browserVersion) >= 74)
    //await page.setRequestInterception(true)
    await page.setBypassCSP(true);
    await page.setCacheEnabled(false)
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1366, height: 768})

    const dataString = fs.readFileSync('zipcodes.json')
    let data = JSON.parse(dataString)
    let zipcodes = data.map((val)=>val.zip)

    
    // await db.start()
    //await db.end()

    for(let properyTypeIterator = 0; properyTypeIterator < propertyInputValues.length; properyTypeIterator++) {
        console.log('Setting property to-', propertyInputValues[properyTypeIterator])

        //set the type of house
        await page.goto('https://www.immoweb.be/en/search/house/for-sale?countries=BE', {waitUntil: "networkidle2"})
        await page.waitForSelector(propertyDropdown)
        await page.evaluate((dropdown, val)=> document.querySelector(dropdown).value = val,propertyDropdown,propertyInputValues[properyTypeIterator])

        for(let zipCodesIterator = 0; zipCodesIterator < zipcodes.length; zipCodesIterator++) {
            //await page.waitForSelector(propertyListSelector)
            let zipCodeInput = await page.$(multiSelectInput)
            await zipCodeInput.type(zipcodes[zipCodesIterator])

            await page.waitForTimeout(5000)
            
            // let domPos = await page.evaluate(()=> {
            //     let click = document.querySelector('#buttonViewResultList').getC
            //     return click
            // })
            let domPos = {
                x:94,
                y:145
            }
            await console.log(domPos)
            await page.mouse.click(domPos.x,domPos.y)

            //logic
            await page.waitForTimeout(5000)

            let properyCountElement = await page.$$(propertyCountSelector)
            

            if(properyCountElement.length) {
                let properyCount = await page.$eval(propertyCountSelector, el=> el.innerText)
                await propertyLinksURL(properyCount, page)
            } else {
                await propertyLinksURL(1, page)
            }
            await page.click('.tag--close')
        }
    }

}

const propertyLinksURL = async (properyCount, page) => {
    for(let i = 1; i <= parseInt(properyCount); i ++) {
        console.log('Navigating- ', i)
        let url = `${page.url()}&page=${i}`
        await page.goto(url, {waitUntil: "networkidle2"})
        
        let values = await page.$$eval(propertyListSelector, options => options.map(val => val.href))

        let records = [];

        await values.forEach(val=> {
            records.push({href: val})
        })
        console.log(records)
        //await csvWriter.writeRecords(records)

        // let cookies = await page.cookies()
        // await page.deleteCookie(...cookies)
    }
}

main()