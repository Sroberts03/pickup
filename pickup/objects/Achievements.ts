export default class Achievements {
    id: number;
    name: string;
    description: string;
    iconUrl: string;
    
    constructor(
        id: number,
        name: string,
        description: string,
        iconUrl: string
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
    }
}