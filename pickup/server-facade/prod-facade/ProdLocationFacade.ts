import Location from "@/objects/Location";
import LocationFacade from "../LocationFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdLocationFacade implements LocationFacade {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async getLocationById(locationId: number): Promise<Location> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/locations/${locationId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch location");
        const data = await response.json();
        return data.location as Location;
    }
}