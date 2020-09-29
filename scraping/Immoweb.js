import * as fs from 'fs'


import DB from './DB.js'
let db = new DB();

class PostDetails {
    constructor(page) {
        this.page = page
        this.checkLoggedInSelector = '[href*="logout"]'
    }

    async getLoggedIn() {
        const loginSelector = '.login__button'
        const emailSelector = '#emailInput'
        const passSelector = '#passwordInput'
        const loginButtonSelector = '.field--login > button'
        const email = 'neel99khalade@gmail.com'
        const pass = 'venkatest'

        await this.page.goto('https://www.immoweb.be/en',{waitUntil: "networkidle2"})

        //getting logged in
        await this.page.waitForSelector(loginSelector)
        await this.page.click(loginSelector)
        await this.page.waitForSelector(emailSelector)
        await this.page.type(emailSelector, email)
        await this.page.type(passSelector, pass)
        await this.page.click(loginButtonSelector)
        await this.page.waitForSelector(this.checkLoggedInSelector)
    }

    async getDetails() {
        const propertySelector = {
            price : '.classified__price .sr-only',
            address : '.classified__information--address-clickable',
        }

        // const propertySelectorRegex = {
        //     propertyType = /(?<=classified\/).*(?=\/for-sale)/
        // }


        await db.start()

        let sourceUrl = 'https://www.immoweb.be/en/classified/building-land/for-sale/mouscron/7700/8566383'
        await this.getLoggedIn()
        await this.page.goto(sourceUrl,{waitUntil: "networkidle2"})

        await this.page.waitForTimeout(500)

        let propertyDetails = {
            price: null,
            address: null,
            category: null,
            livingSurface: null,
            outdoorSurface: null,
            noOfBedrooms: null,
            noOfBathrooms: null,
            noOfToilets: null,
            energyClass: null,
            yearBuilt: null,
            buildingConditions: null,
            
            agencyLogo:null,
            agencyName: null,
            agencyAddress:null,
            agencyContact:null,
            agencyWebsite:null,

            postedOn:null,
            views:null,
            saves:null
        }

        let regexPatterns = {
            category : new RegExp('(?<=classified\/).*(?=\/for-sale)',''),
            outdoorSurface : new RegExp('(?<=Surface of the plot).*\d+', 'gm'),

        }


        if(await this.page.$(propertySelector.price)) {
            propertyDetails.price = await this.page.$eval(propertySelector.price, e=> e.innerText)
        }

        if(await this.page.$(propertySelector.address)) {
            propertyDetails.address = await this.page.$eval(propertySelector.address, e=> e.innerText)
        }

        propertyDetails.category = await this.page.url().match(regexPatterns.category)[0]

        let textualData = await this.page.evaluate(()=>{
            let dataInText = ''
            let data = document.querySelectorAll('.classified-table__row')

            for(let i=0; i<data.length; i++) {
                dataInText += data[i].innerText + '\n'
            }
            return dataInText
        })

        console.log(await textualData)
        //exterior surface
        //if(textualData.match(regexPatterns.outdoorSurface)) propertyDetails.outdoorSurface = await textualData.match(regexPatterns.outdoorSurface)[0]

        console.log(regexPatterns.outdoorSurface,'outdoor=',await textualData.match(/Surface/))

        console.log(await propertyDetails)
    }

}

export { PostDetails }