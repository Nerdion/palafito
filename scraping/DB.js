import MongoClient from 'mongodb'

export class DB {
    constructor(url = 'mongodb://localhost:27017/', dbName = 'Palafito', collection = 'immowebLinks') {
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
        let data = await this.db.collection(this.collection).findOne({links: newLink})

        if(data == null) {
            await this.db.collection(this.collection).insertOne({links: newLink})
            console.log('inserted')
        } else console.log('Link repeated')
    }

    insUpdated = async(data) => {
        await this.db.collection('immoweb').insertMany(data)
    }

    end = async () => {
        try {
            await this.connection.close()
        } catch(e) {
            console.log('Can not terminate',e)
        }
    }

    findAll = async () => {
        let data = await this.db.collection(this.collection).find({}).toArray()
        return data
    }
}