export enum TagType {
    GENE = 'GENE',
    DISEASE = 'DISEASE',
    CHEMICAL = 'CHEMICAL',
    TAXON = 'TAXON'
}

export interface Tag {
    types: TagType[],
    text: string,
    start: number,
    end: number,
    ids: {[tag: string]: string|null}
}

export interface KnownEntityGroup {
    id: string,
    type: TagType,
    aliases: string[]
}

export interface UnknownEntity {
    type: TagType,
    alias: string
}

export interface TextEntities {
    known: KnownEntityGroup[],
    unknown: UnknownEntity[]
}

export interface Article {
    pmid: string,
    title: string,
    abstract: string
    tags: Tag[],
    entities: TextEntities
}