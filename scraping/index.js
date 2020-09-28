import puppeteer from 'puppeteer'
import * as fs from 'fs'

import DB from './DB.js'
let db = new DB();

import RandomScraper from './RandomScraper.js'
let randomScraper = new RandomScraper()

const PUPPETEER_UI_FLAG = true

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

    const properyTypesList = await randomScraper.generateRandomUniqueArray(1,11)

    for(let properyTypeIterator = 0; properyTypeIterator <= properyTypesList.length; properyTypeIterator++) {
        console.log(`Selected- ${properyTypesList[properyTypeIterator]} for property`)
        //set the type of house
        await page.goto('https://www.immoweb.be/en/search/house/for-sale?countries=BE', {waitUntil: "networkidle2"})
        await page.waitForSelector(propertyDropdown)
        await page.evaluate((val)=> {
            document.getElementById('inputPropertyTypes').click()
            document.querySelector(`#inputPropertyTypes-item-${val}`).click()
        },properyTypesList[properyTypeIterator])

        await page.waitForTimeout(5000)

        const randomZipcodesIndexes = await randomScraper.generateRandomUniqueArray(0,zipcodes.length)

        for(let zipCodesIterator = 0; zipCodesIterator < zipcodes.length; zipCodesIterator++) {
            let selectedIndex = randomZipcodesIndexes[zipCodesIterator]

            console.log(`Selected- ${zipcodes[selectedIndex]} for zipcode`)
            //await page.waitForSelector(propertyListSelector)
            let zipCodeInput = await page.$(multiSelectInput)
            await zipCodeInput.type(zipcodes[selectedIndex])

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

            await console.log(`Done searching for ${zipcodes[selectedIndex]}`)
        }
    }
    await db.end()
}

const propertyLinksURL = async (properyCount, page) => {
    let trueCount = 0
    let falseCount = 0
    for(let i = 1; i <= parseInt(properyCount); i ++) {
        console.log('Navigating page- ', i)
        let url = `${page.url()}&page=${i}`
        await page.goto(url, {waitUntil: "networkidle2"})

        await page.waitForTimeout(2000)

        let ifPropertiesExist = await page.$(propertyListSelector)

        if(ifPropertiesExist) {
            let values = await page.$$eval(propertyListSelector, options => options.map(val => val.href))

            values.map(async val=>{
                let splitVal = val.split('?searchId')
                let flag = await db.ins(splitVal[0].trim())
                flag? trueCount++ : falseCount++
            })
            await console.log(`\n Inserted ${trueCount}, Repeated ${falseCount} \n`)
        } else {
            console.log('_skip_')
        }
    }
}

main()