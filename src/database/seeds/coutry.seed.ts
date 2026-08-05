import api from "../../utils/api"
import { countries, CountryType } from "../database.schema"
import db from "../drizzle"

const ApiUrl = "https://www.apicountries.com/countries"

type Country = {
    name: string,
    flags:{
        svg: string,
    }
    callingCodes: string[]
}

export default async function runCountrySeed() {
    const res = (await api.fetchJson(ApiUrl,{method:'GET'})) as Country[]

    await Promise.all(res.map(async (item) => {
        const value : CountryType = {callingCodes:item.callingCodes[0],name:item.name,flags:item.flags.svg} 
        await db.insert(countries).values(value).onConflictDoUpdate({target:countries.callingCodes,set:value})
    }))
        console.log(`Country seeded successfully!`);
}
