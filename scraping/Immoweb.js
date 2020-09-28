import * as fs from 'fs'

const loginSelector = '.login__button'
const emailSelector = '#emailInput'
const passSelector = '#passwordInput'
const loginButtonSelector = '.field--login > button'
const checkLoggedInSelector = '[href*="logout"]'
const email = 'neel99khalade@gmail.com'
const pass = 'venkatest'

class PostDetails {
    constructor(page) {
        this.this.page = page
    }

    async getLoggedIn() {
        
        await this.page.goto('https://www.immoweb.be/en',{waitUntil: "networkidle2"})

        //getting logged in
        await this.page.waitForSelector(loginSelector)
        await this.page.click(loginSelector)
        await this.page.waitForSelector(emailSelector)
        await this.page.type(emailSelector, email)
        await this.page.type(passSelector, pass)
        await this.page.click(loginButtonSelector)
        await this.page.waitForSelector(checkLoggedInSelector)

        const cookies = await this.page.cookies()
        fs.writeFile('cookies.json', JSON.stringify(cookies, null, 4),e=>console.log(e))
        return cookies
    }

    async getDetails() {
        let cookies = fs.readFileSync('cookies.json', 'utf8',e=>console.log(e))
        if(cookies = '') cookies = await this.getLoggedIn()
        
        cookies = await JSON.parse(JSON.stringify(cookies))
        await this.page.setCookie(...cookies)
        
    }

}

export { PostDetails }