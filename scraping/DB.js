import MongoClient from 'mongodb'

export class DB {
    constructor(uri = 'mongodb://localhost:27017/') {
        this.uri = uri;
    }

    start = async () => {
        this.client = await new MongoClient(this.uri, {useNewUrlParser: true, useUnifiedTopology: true});
        await this.client.connect();
    }

    end = async () => {
        try {
            await this.client.close()
        } catch(e) {
            console.log('Can not terminate',e)
        }
    }
}