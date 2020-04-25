import {Article, Tag} from "../models/Article";
import * as React from "react";

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
        const types = tag.types.map(type => `entity-${type.toLowerCase()}`);
        const unformatted = replaceMissingSymbols(props.text.substring(processed, tag.start));
        const formatted = replaceMissingSymbols(tag.text);
        elements.push(<>{unformatted}</>);
        elements.push(<span className={types.join(" ")}>{formatted}</span>);
        processed = tag.end;
    }
    return <>{elements}</>;
};

export const ArticleView: React.FC<ArticleProps> = (props: ArticleProps) => {
    const titleLength = props.article.title.length;
    const titleTags = props.article.tags.filter(tag => tag.end < titleLength);
    const abstractTags = props.article.tags
        .filter(tag => tag.start > titleLength)
        .map(tag => {
            return {...tag, start: tag.start - titleLength - 1, end: tag.end - titleLength - 1};
        });

    return <div className="article">
        <div className="article-pmid">
            {props.article.pmid}
        </div>
        <div className="article-title">
            <TaggedView text={props.article.title} tags={titleTags}/>
        </div>
        <div className="article-abstract">
           <TaggedView text={props.article.abstract} tags={abstractTags}/>
        </div>
    </div>
};
