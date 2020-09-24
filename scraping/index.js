import puppeteer from 'puppeteer'
import randomUseragent from 'random-useragent'
import * as fs from 'fs'

import {DB} from './DB.js'
let db = new DB();

const PUPPETEER_UI_FLAG = false

const propertyDropdown = '[aria-labelledby="inputPropertyTypeLabel inputPropertyTypes"]'
const propertyListSelector = '.card__title.card--result__title > a'
const multiSelectInput = '.multiselect__input'

const main = async () => {

    //setting up the browser
    const browser = await puppeteer.launch({
        headless: PUPPETEER_UI_FLAG,
    })
    const context = await browser.createIncognitoBrowserContext()
    let page = await context.newPage()

    //let userAgent = randomUseragent.getRandom((ua) => parseFloat(ua.browserVersion) >= 74)
    //await page.setRequestInterception(true)
    // await page.setBypassCSP(true);
    // await page.setCacheEnabled(true);
    //await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1366, height: 768})

    
    const dataString = fs.readFileSync('codes.csv','utf-8')
    const zipcodes = dataString.split('\n')

    await db.start()

    for(let properyTypeIterator = 2; properyTypeIterator <= 11; properyTypeIterator++) {

        //set the type of house
        await page.goto('https://www.immoweb.be/en/search/house/for-sale?countries=BE', {waitUntil: "networkidle2"})
        await page.waitForSelector(propertyDropdown)
        await page.evaluate((val)=> {
            document.getElementById('inputPropertyTypes').click()
            document.querySelector(`#inputPropertyTypes-item-${val}`).click()
        },properyTypeIterator)

        await page.waitForTimeout(5000)

        for(let zipCodesIterator = 0; zipCodesIterator < zipcodes.length; zipCodesIterator++) {
            if(zipcodes[zipCodesIterator] < 2627) continue;
            //await page.waitForSelector(propertyListSelector)
            let zipCodeInput = await page.$(multiSelectInput)
            await zipCodeInput.type(zipcodes[zipCodesIterator])

            await page.waitForTimeout(5000)
            
            // let domPos = await page.$eval('#buttonViewResultList', el=> {
            //     let tapEl = el.getBoundingClientRect()
            //     return {
            //         x: tapEl.x,
            //         y: tapEl.y
            //     }
            // })

            let domPos = {x:94, y:145}

            await page.mouse.click(domPos.x,domPos.y)
            await page.waitForTimeout(5000)

            let flagPagination = await page.$('.pagination__item')

            if(flagPagination) {
                let properyCount = await page.evaluate(()=>{
                    let count = document.querySelectorAll('.pagination__item').length
                    let nth = (count/2) - 1
                    return document.querySelector(`.pagination__item:nth-child(${nth}) .button__label`).innerText
                })
                await console.log(properyCount)
                await propertyLinksURL(properyCount, page)

            } else {
                await propertyLinksURL(1, page)
            }
            
            await page.click('.tag--close')
            await console.log(`Done searching for ${zipcodes[zipCodesIterator]}`)
        }
    }
    
    await db.end()

}

const propertyLinksURL = async (properyCount, page) => {
    for(let i = 1; i <= parseInt(properyCount); i ++) {
        console.log('Navigating page- ', i)

        try {
            let url = `${page.url()}&page=${i}`
            await page.goto(url, {waitUntil: "networkidle2"})

            await page.waitForSelector(propertyListSelector)
    
            let values = await page.$$eval(propertyListSelector, options => options.map(val => val.href))
    
            await values.map(val=>{
                let splitVal = val.split('?searchId')
                db.ins(splitVal[0].trim())
            })

        } catch(e) {
            console.log(e)
        }

        // //await csvWriter.writeRecords(records)
        // let cookies = await page.cookies()
        // await page.deleteCookie(...cookies)

    }
}

main()