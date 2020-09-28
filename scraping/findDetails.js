import puppeteer from 'puppeteer'
import * as fs from 'fs'

const PUPPETEER_UI_FLAG = false

const loginSelector = '.login__button'

const email = 'neel99khalade@gmail.com'
const pass = 'venkatest'


const main = async () => {
    //setting up the browser
    const browser = await puppeteer.launch({
        headless: PUPPETEER_UI_FLAG,
    })
    const context = await browser.createIncognitoBrowserContext()
    let page = await context.newPage()
    
    await page.setViewport({ width: 1366, height: 768})

    await page.goto('https://www.immoweb.be/en',{waitUntil: "networkidle2"})

    await page.waitForSelector(loginSelector)
    await page.click(loginSelector)
    await page.waitForSelector()
    await page.type('#emailInput', email)
    await page.type('#passwordInput', pass)

}

main()