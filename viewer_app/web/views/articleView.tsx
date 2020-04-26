import {Article, Entity, Tag, TagType} from "../models/Article";
import * as React from "react";
import "../styles/article.scss";
import "../styles/entities.scss";

export interface ArticleProps {
    article: Article
}

interface TaggedViewProps {
    text: string,
    tags: Tag[],
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
        console.log({tag, unformatted, formatted});
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
    items: Entity[]
}

interface LegendItemViewProps {
    item: Entity
}

const LegendItem: React.FC<LegendItemViewProps> = (props: LegendItemViewProps) => {
    return <span className={`entity-${props.item.type.toLowerCase()}`}>{replaceMissingSymbols(props.item.text)}</span>
};

const LegendView: React.FC<LegendViewProps> = (props: LegendViewProps) => {
    return <ul>
        {props.items.map((item, i) => <li key={i}><LegendItem item={item}/></li>)}
    </ul>
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
