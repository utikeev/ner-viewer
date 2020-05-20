import {Article, KnownEntityGroup, Tag, TagType, TextEntities, UnknownEntity} from "../models/Article";
import * as React from "react";
import {useState} from "react";
import "../styles/article.scss";
import "../styles/entities.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight, faDna, faVials, faVirus} from "@fortawesome/free-solid-svg-icons";

export interface ArticleProps {
    article: Article
}

interface TaggedViewProps {
    text: string
    tags: Tag[]
    showUnknown: boolean
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
        const idMap = tag.ids;
        if (Object.values(idMap).filter(item => item != null).length == 0 && !props.showUnknown) continue;
        const types = tag.types.filter(type => props.showUnknown || idMap[type] != null).map(type => type.toLowerCase());
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
    showUnknown: boolean
}

interface KnownLegendItemViewProps {
    item: KnownEntityGroup
}

interface UnknownLegendItemViewProps {
    item: UnknownEntity
}

const compare = (a: KnownEntityGroup, b: KnownEntityGroup) => {
    return a.id.localeCompare(b.id);
};

const compareUnknown = (a: UnknownEntity, b: UnknownEntity) => {
    return a.alias.localeCompare(b.alias)
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

interface LegendGroupProps {
    name: string,
    icon: any,
    knownItems: KnownEntityGroup[]
    unknownItems: UnknownEntity[]
}

const LegendGroup: React.FC<LegendGroupProps> = (props: LegendGroupProps) => {
    const [expanded, setExpanded] = useState(false);

    if (props.knownItems.length + props.unknownItems.length == 0) {
        return <></>
    }

    return <div>
        <h5
            className={`article-legend-group-label article-legend-group-label-${props.name.toLowerCase()} ${expanded ? 'article-legend-group-label-open' : ''}`}
            onClick={() => setExpanded(!expanded)}>
            <FontAwesomeIcon icon={props.icon}/> {props.name} <FontAwesomeIcon icon={faCaretRight}/>
        </h5>
        {
            expanded ? <ul>
                {props.knownItems.sort(compare).map((item, i) => <li key={i}><KnownLegendItem item={item}/></li>)}
                {props.unknownItems.length > 0 ? <h6>Unknown items</h6> : <></>}
                {props.unknownItems.sort(compareUnknown).map((item, i) => <li key={i}><UnknownLegendItem item={item}/></li>)}
            </ul> : <></>
        }
    </div>
};

const LegendView: React.FC<LegendViewProps> = ({items: {known, unknown}, showUnknown}: LegendViewProps) => {

    return <div className="article-legend-list">
        <LegendGroup name="Genes" icon={faDna}
                     knownItems={known.filter((item) => item.type == TagType.GENE)}
                     unknownItems={showUnknown ? unknown.filter((item) => item.type == TagType.GENE) : []}
        />
        <LegendGroup name="Diseases" icon={faVirus}
                     knownItems={known.filter((item) => item.type == TagType.DISEASE)}
                     unknownItems={showUnknown ? unknown.filter((item) => item.type == TagType.DISEASE) : []}
        />
        <LegendGroup name="Chemicals" icon={faVials}
                     knownItems={known.filter((item) => item.type == TagType.CHEMICAL)}
                     unknownItems={showUnknown ? unknown.filter((item) => item.type == TagType.CHEMICAL) : []}
        />
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
    const [showUnknown, setShownUnknown] = useState(true);

    return <div className="article">
        <div className="article-block">
            <h3 className="article-title">
                <TaggedView text={props.article.title} tags={titleTags} showUnknown={showUnknown}/>
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
                <TaggedView text={props.article.abstract} tags={abstractTags} showUnknown={showUnknown}/>
            </div>
        </div>
        <div className="article-legend">
            <div className="article-legend-show-unknown">
                <button className="btn btn-outline-info" onClick={() => setShownUnknown(!showUnknown)}>
                    {showUnknown ? "Hide unknown entities" : "Show unknown entities"}
                </button>
            </div>
            <LegendView items={props.article.entities} showUnknown={showUnknown}/>
        </div>
    </div>
};
