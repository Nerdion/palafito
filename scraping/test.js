import {DB} from './DB.js'
let db = new DB();
import * as fs from 'fs'

const main = async () => {
    await db.start()
    let data = await db.findAll()
    let newData= []
    for (let i=0; i<data.length; i++) {
        newData.push(
            {
                source: data[i].links,
                index: i,
                status: 0
            }
        )
    }
    await db.insUpdated(newData)
}

main().then(console.log('aihsdoih'))