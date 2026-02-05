export default class Group {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    location: number;
    isGameCoordination: number|null;

    constructor(
        id: number,
        name: string,
        description: string,
        createdAt: Date,
        location: number,
        isGameCoordination: number|null = null
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.location = location;
        this.isGameCoordination = isGameCoordination;
    }
}