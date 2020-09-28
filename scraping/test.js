import DB from './DB.js'
let db = new DB();

const main = async () => {
    await db.start()
    let trueCount=0
    let flag = true

    flag? trueCount++ : falseCount++
    console.log(trueCount)
}
main().then(console.log(''))
