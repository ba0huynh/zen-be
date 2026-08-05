import runCountrySeed from "./coutry.seed"
import runMassageSeed from "./massage.seed"

async function runAllSeeds() {
    await Promise.all([
        runMassageSeed(),
        runCountrySeed(),
    ])
}

runAllSeeds()