export enum GameStatus {
    Scheduled = 'Scheduled',
    Ongoing = 'Ongoing',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}

export enum SkillLevel {
    Beginner = 'Beginner',
    Intermediate = 'Intermediate',
    Advanced = 'Advanced',
    Expert = 'Expert'
}

export class Games {
    id: number
    name: string
    description: string
    sportId: number
    createrId: number
    startTime: Date
    endTime: Date
    locationId: string
    maxPlayers: number
    status: GameStatus
    skillLevel: SkillLevel
    isPublic: boolean
    rules: string | null

    constructor(
        id: number,
        name: string,
        description: string,
        sportId: number,
        createrId: number,
        startTime: Date,
        endTime: Date,
        locationId: string,
        maxPlayers: number,
        status: GameStatus,
        skillLevel: SkillLevel,
        isPublic: boolean,
        rules: string | null = null
    ) {
        this.id = id
        this.name = name
        this.description = description
        this.sportId = sportId
        this.createrId = createrId
        this.startTime = startTime
        this.endTime = endTime
        this.locationId = locationId
        this.maxPlayers = maxPlayers
        this.status = status
        this.skillLevel = skillLevel
        this.isPublic = isPublic
        this.rules = rules
    }
}
