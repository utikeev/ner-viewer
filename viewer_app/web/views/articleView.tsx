import {Article, KnownEntityGroup, Tag, TagType, TextEntities, UnknownEntity} from "../models/Article";
import * as React from "react";
import "../styles/article.scss";
import "../styles/entities.scss";

export interface ArticleProps {
    article: Article
}

interface TaggedViewProps {
    text: string
    tags: Tag[]
}

function replaceMissingSymbols(text: string): string {
    return text
        .replace('&gt;', '>')
        .replace('&lt;', '<');
}

const TaggedView: React.FC<TaggedViewProps> = (props: TaggedViewProps) => {
    const elements: Array<React.ReactElement> = [];
    let processed = 0;
    for (const tag of props.tags) {
        const types = tag.types.map(type => type.toLowerCase());
        const unformatted = replaceMissingSymbols(props.text.substring(processed, tag.start));
        const formatted = replaceMissingSymbols(tag.text);
        if (unformatted != '') {
            elements.push(<React.Fragment key={processed}>{unformatted}</React.Fragment>);
        }
        elements.push(<span key={tag.start} className={`entity-${types.join("-")}`}>{formatted}</span>);
        processed = tag.end;
    }
    const remainder = replaceMissingSymbols(props.text.substring(processed));
    if (remainder != '') {
        elements.push(<React.Fragment key={processed}>{remainder}</React.Fragment>);
    }
    return <>{elements}</>;
};

interface LegendViewProps {
    items: TextEntities
}

interface KnownLegendItemViewProps {
    item: KnownEntityGroup
}

interface UnknownLegendItemViewProps {
    item: UnknownEntity
}

const compare = (a: KnownEntityGroup, b: KnownEntityGroup) => {
    const typesCompare = a.type.localeCompare(b.type);
    if (typesCompare == 0) {
        return a.id.localeCompare(b.id)
    }
    return typesCompare;
};

const compareUnknown = (a: UnknownEntity, b: UnknownEntity) => {
    const typesCompare = a.type.localeCompare(b.type);
    if (typesCompare == 0) {
        return a.alias.localeCompare(b.alias)
    }
    return typesCompare;
};

const KnownLegendItem: React.FC<KnownLegendItemViewProps> = (props: KnownLegendItemViewProps) => {
    const prefix = props.item.type == TagType.GENE ? 'GENE:' : 'MeSH:';
    const link = props.item.type == TagType.GENE ? `https://www.ncbi.nlm.nih.gov/gene/${props.item.id}` :
        `https://meshb.nlm.nih.gov/record/ui?ui=${props.item.id}`;

    return <div>
        <span className={`entity-${props.item.type.toLowerCase()}`}>
            <a href={link}
               className="entity-link"
               rel="noopener noreferrer"
               target="_blank">
                {prefix + props.item.id}
            </a>
        </span>
        <ul>
            {props.item.aliases.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
};

const UnknownLegendItem: React.FC<UnknownLegendItemViewProps> = (props: UnknownLegendItemViewProps) => {
    return <span className={`entity-${props.item.type.toLowerCase()}`}>{replaceMissingSymbols(props.item.alias)}</span>
};

const LegendView: React.FC<LegendViewProps> = ({items: {known, unknown}}: LegendViewProps) => {
    const unknownItemsList = <>
        <span>Unknown items</span>
        <ul>
            {unknown.sort(compareUnknown).map((item, i) => <li key={i}><UnknownLegendItem item={item}/></li>)}
        </ul>
    </>;

    return <div>
        <ul>
            {known.sort(compare).map((item, i) => <li key={i}><KnownLegendItem item={item}/></li>)}
        </ul>
        {unknown.length > 0 ? unknownItemsList : <></>}
    </div>
};

export const ArticleView: React.FC<ArticleProps> = (props: ArticleProps) => {
    const titleLength = props.article.title.length;
    const titleTags = props.article.tags.filter(tag => tag.end <= titleLength);
    const abstractTags: Tag[] = props.article.tags
        .filter(tag => tag.start > titleLength)
        .map(tag => {
            return {...tag, start: tag.start - titleLength - 1, end: tag.end - titleLength - 1};
        });

    return <div className="article">
        <div className="article-block">
            <h3 className="article-title">
                <TaggedView text={props.article.title} tags={titleTags}/>
            </h3>
            <h5 className="article-pmid">
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${props.article.pmid}`}
                   rel="noopener noreferrer"
                   target="_blank">
                    PMID{props.article.pmid}
                </a>
                {' '}
                <a href={`https://www.ncbi.nlm.nih.gov/research/pubtator/?view=publication&pmid=${props.article.pmid}&query=`}
                   rel="noopener noreferrer"
                   target="_blank"
                   className='small'>
                    [Pubtator]
                </a>
            </h5>
            <div className="article-abstract">
                <TaggedView text={props.article.abstract} tags={abstractTags}/>
            </div>
        </div>
        <div className="article-legend">
            <LegendView items={props.article.entities}/>
        </div>

    </div>
};
