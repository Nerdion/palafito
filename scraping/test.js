import DB from './DB.js'
let db = new DB();

const main = async () => {
    await db.start()
    await db.selectRandomSample()
}
main().then(console.log(''))
