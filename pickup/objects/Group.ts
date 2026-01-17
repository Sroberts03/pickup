export default class Group {
    id: number;
    name: string;
    description: string;
    isPrivate: boolean;
    createdAt: Date;
    location: string;
    isGameCoordination: boolean;

    constructor(
        id: number,
        name: string,
        description: string,
        isPrivate: boolean,
        createdAt: Date,
        location: string,
        isGameCoordination: boolean
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isPrivate = isPrivate;
        this.createdAt = createdAt;
        this.location = location;
        this.isGameCoordination = isGameCoordination;
    }
}