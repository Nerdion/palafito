import puppeteer from 'puppeteer'
const PUPPETEER_UI_FLAG = true

import {PostDetails} from './Immoweb.js'

const main = async () => {
    const browser = await puppeteer.launch({
        headless: PUPPETEER_UI_FLAG,
    })
    const context = await browser.createIncognitoBrowserContext()
    let page = await context.newPage()

    await page.setViewport({ width: 1366, height: 768})
    
    const postDetails = await new PostDetails(page)
    await postDetails.getDetails()

    // await page.setViewport({ width: 1366, height: 768})
}


main()