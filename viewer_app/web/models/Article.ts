export enum TagType {
    GENE = 'GENE',
    DISEASE = 'DISEASE',
    CHEMICAL = 'CHEMICAL'
}

export interface Tag {
    types: TagType[],
    text: string,
    start: number,
    end: number
}

export interface Entity {
    type: TagType,
    text: string
}

export interface Article {
    pmid: number,
    title: string,
    abstract: string
    tags: Tag[],
    entities: Entity[]
}