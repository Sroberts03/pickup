import Location from "@/objects/Location";
import LocationFacade from "../LocationFacade";
import { MockDataStore } from "./MockDataStore";

export default class TestLocationFacade implements LocationFacade {
    constructor(private dataStore: MockDataStore) {}

    async getLocationById(locationId: number): Promise<Location> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const location = this.dataStore.locations.get(locationId);
                if (location) {
                    resolve(location);
                } else {
                    reject(new Error("Location not found"));
                }
            }, 500);
        });
    }
}
