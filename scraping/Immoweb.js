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
        db.start()

        await this.getLoggedIn()
        let count = 0;
        while(1) {
            let randomUrl = await db.selectRandomSample()
            let scrappedData = await this.getScrappedData(randomUrl)
            if(scrappedData) {
                scrappedData.status= 2
                await db.insertPropertyDetails(randomUrl, scrappedData)
                console.log(`${count++}. Insert data for ${randomUrl}`)
            } else {
                scrappedData = {status:-1}
                await db.insertPropertyDetails(randomUrl, scrappedData)
                console.log(`Issue with ${randomUrl}, no data found!`)
            }
        }

        //let sourceUrl = 'https://www.immoweb.be/en/classified/mixed-use-building/for-sale/hamoir/4180/8901695?searchId=5f75e692b4cdf'
        
    }

    async getScrappedData(sourceUrl) {
        console.log(`Took-${sourceUrl}`)
        
        await this.page.goto(sourceUrl,{waitUntil: "networkidle2"})

        const propertySelector = {
            price : '.classified__price .sr-only',
            address : '.classified__information--address-clickable',
            agencyName:'#customer-card > div.customer-card__body > div',
            agencyLogo:'#customer-card > div.customer-card__body > div img'
        }

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

        try {
            let sData = await this.page.evaluate(()=>{
                let statData = document.querySelector("#main-content > div:nth-child(2) > div > div > div.classified__section--statistic > p").innerText
                return statData
            })

            sData = sData.split('|')
            let statStr=''
            for(let i=0;i<sData.length;i++){
                statStr += sData[i]+'\n'
            }

            if(await this.page.$(propertySelector.price)) {
                propertyDetails.price = await this.page.$eval(propertySelector.price, e=> e.innerText)
            }

            if(await this.page.$(propertySelector.address)) {
                propertyDetails.address = await this.page.$eval(propertySelector.address, e=> e.innerText)
            }
            if(await this.page.$(propertySelector.agencyName)) {
                propertyDetails.agencyName = await this.page.$eval(propertySelector.agencyName, e=> e.innerText)
            }
            if(await this.page.$(propertySelector.agencyLogo)) {
                propertyDetails.agencyLogo = await this.page.$eval(propertySelector.agencyLogo, e=> e.src)
            }

            propertyDetails.category = await this.page.url().split('/')[5].replace(/-/g,' ')



            let textualData = await this.page.evaluate(()=>{
                let dataInText = ''
                let data = document.querySelectorAll('.classified-table__row')
    
                for(let i=0; i<data.length; i++) {
                    dataInText += JSON.stringify(data[i].innerText) + '\n'
                }
                return dataInText
            })

            let m
            if(m = textualData.match(/(?<=Surface of the plot\\t)\d+/gm)) {
                propertyDetails.outdoorSurface = m[0]
            }
            if(m = textualData.match(/(?<=Bedrooms\\t)\d+/gm)) {
                propertyDetails.noOfBedrooms = m[0]
            }
            if(m = textualData.match(/(?<=Bathrooms\\t)\d+/gm)) {
                propertyDetails.noOfBathrooms = m[0]
            }
            if(m = textualData.match(/(?<=Toilets\\t)\d+/gm)) {
                propertyDetails.noOfToilets = m[0]
            }
            if(m = textualData.match(/(?<=Living area\\t)\d+/gm)) {
                propertyDetails.livingSurface = m[0]
            }
            if(m = textualData.match(/(?<=Energy class\\t)\w+/gm)) {
                propertyDetails.energyClass = m[0]
            }
            if(m = textualData.match(/(?<=Construction year\\t)\d+/gm)) {
                propertyDetails.yearBuilt = m[0]
            }
            if(m = textualData.match(/(?<=Building condition\\t).+(?=")/gm)) {
                propertyDetails.buildingConditions = m[0]
            }
            if(m = textualData.match(/(?<=Website\\t).+(?=")/gm)) {
                propertyDetails.agencyWebsite = m[0]
            }
            if(m = textualData.match(/(?<=Address\\t).+(?=")/gm)) {
                propertyDetails.agencyAddress = m[0].replace(/\\n/,'  ')
            }
            if(m = statStr.match(/(?<=Posted the ).+/gm)) {
                propertyDetails.postedOn = m[0]
            }
            if(m = statStr.match(/(?<=Views: )\d+/gm)) {
                propertyDetails.views = m[0]
            }
            if(m = statStr.match(/(?<=Saves: )\d+/gm)) {
                propertyDetails.saves = m[0]
            }

            propertyDetails.agencyContact = await this.page.evaluate(async ()=>{
                await document.querySelectorAll('.customer-card__actions button')[1].click()
                let phno = await document.querySelector('.customer-detail__phone').innerText
                return phno
            })
            return Promise.resolve(propertyDetails)
        } catch (e){
            return null;
        }
    }
}

export { PostDetails }