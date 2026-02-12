import Location from "@/objects/Location";

export default interface LocationFacade {
    getLocationById(locationId: number): Promise<Location>;
}