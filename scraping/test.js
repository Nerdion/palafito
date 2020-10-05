import DB from './DB.js'
let db = new DB();

const main = async () => {
    await db.start()

    let random = await db.selectRandomSample()
    console.log(await random)

    let chunk = {
        price: '295000€',
        address: 'Rue de Fairon 65  4180 — Hamoir',
        category: 'mixed use building',
        livingSurface: '242',
        outdoorSurface: '1403',
        noOfBedrooms: '3',
        noOfBathrooms: '1',
        noOfToilets: '2',
        energyClass: 'D',
        yearBuilt: '1925',
        buildingConditions: 'Good',
        agencyLogo: 'https://static.immoweb.be/logos/652522.gif?cache=201715070806Z',
        agencyName: 'Groupe Cadimmo Trooz-Liège-Sprimont',
        agencyAddress: 'Grand rue 191  4870 - Trooz',
        agencyContact: '+32 4 275 55 51',
        agencyWebsite: 'http://www.groupecadimmo.be',
        postedOn: 'August 27th 2020 ',
        views: '1565',
        saves: '55'
      }
      chunk.status = 2
    await db.insertPropertyDetails(random[0].source, chunk)

}
main().then(console.log(''))
