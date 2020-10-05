import MongoClient from 'mongodb'

export default class DB {
    constructor(url = 'mongodb://localhost:27017/', dbName = 'Palafito', collection = 'immoweb') {
        this.url = url
        this.dbName = dbName
        this.collection = collection
    }

    start = async () => {
        //this.client = await new MongoClient(this.uri, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            this.connection = await MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true })
            this.db = this.connection.db(this.dbName)
            await console.log('Connected')
        } catch(e) {
            console.log('Errors with connection', e)
        }
    }

    ins = async (newLink) => {
        let data = await this.db.collection(this.collection).findOne({source: newLink})

        if(data == null) {
            await this.db.collection(this.collection).insertOne({source: newLink, status: 0})
            return true
        } else return false
    }

    end = async () => {
        try {
            await this.connection.close()
        } catch(e) {
            console.log('Can not terminate',e)
        }
    }

    lastIndex = async ()=> {
        let result = await this.db.collection(this.collection).find({},{_id:0,index:1}).sort({index:-1}).limit(1).toArray()
        return result[0].index
    }

    selectRandomSample = async () => {
        let randomValue = await this.db.collection(this.collection).aggregate([{$match:{status:0}},{$sample:{size:1}}]).toArray()
        let sourceUrl = randomValue[0].source
        await this.db.collection(this.collection).updateOne({source:sourceUrl}, {$set:{status:1}})
        return sourceUrl
    }

    insertPropertyDetails = async (sourceLink, propertyDetails) => {
        try {
            await this.db.collection(this.collection).findOneAndUpdate({source:sourceLink, status:1}, {$set:propertyDetails})
        } catch(e) {
            console.log('Unable to insert',e)
        }
    }
}