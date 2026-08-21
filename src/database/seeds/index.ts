import runCountrySeed from "./coutry.seed"
import runMassageSeed from "./massage.seed"
import runPlaceSeed from "./place.seed"
import runTherapistSeed from "./therapist.seed"

async function runAllSeeds() {
    await Promise.all([
        runMassageSeed(),
        runCountrySeed(),
        runTherapistSeed(),
        runPlaceSeed(),
    ])
}

runAllSeeds()
