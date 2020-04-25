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

export interface Article {
    pmid: number,
    title: string,
    abstract: string
    tags: Tag[]
}