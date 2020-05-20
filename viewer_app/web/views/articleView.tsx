import {Article, KnownEntityGroup, Tag, TagType, TextEntities, UnknownEntity} from "../models/Article";
import * as React from "react";
import {Ref, SetStateAction, useEffect, useState} from "react";
import "../styles/article.scss";
import "../styles/entities.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight, faDna, faSearch, faTimesCircle, faVials, faVirus} from "@fortawesome/free-solid-svg-icons";

export interface ArticleProps {
    article: Article
}

interface TaggedViewProps {
    name: string
    text: string
    tags: Tag[]
    showUnknown: boolean
    currentPopupKey?: string
    setCurrentPopup: React.Dispatch<string | undefined>
    popupKeyRef: Ref<HTMLDivElement>
    highlightedEntityId?: string
}

function replaceMissingSymbols(text: string): string {
    return text
        .replace('&gt;', '>')
        .replace('&lt;', '<');
}

const getPrefix = (type: TagType) => {
    return type == TagType.GENE ? 'GENE:' : 'MeSH:';
};

const getLink = (id: string, type: TagType) => {
    return type == TagType.GENE ? `https://www.ncbi.nlm.nih.gov/gene/${id}` :
        `https://meshb.nlm.nih.gov/record/ui?ui=${id}`;
};

interface TagPopupProps {
    ref?: Ref<HTMLDivElement>
    tag: Tag
}

const TagWithPopup: React.FC<TagPopupProps> = React.forwardRef((props: TagPopupProps, ref?: Ref<HTMLDivElement>) => {
    return <div ref={ref} className={"article-tag-popup"}>
        {props.tag.types.map((type, i) => {
            const id = props.tag.ids[type];
            return <div className="article-tag-popup-group" key={i}>
                <span className={`entity-${type.toLowerCase()}-text`}>{type}</span>
                {
                    id ? <a href={getLink(id, type)}
                            className="entity-link"
                            rel="noopener noreferrer"
                            target="_blank">
                        {`${getPrefix(type)}${id}`}
                    </a> : <span>Unknown</span>
                }
            </div>
        })}
    </div>
});

const TaggedView: React.FC<TaggedViewProps> = (props: TaggedViewProps) => {
    const elements: Array<React.ReactElement> = [];
    let processed = 0;
    for (const tag of props.tags) {
        const idMap = tag.ids;
        if (Object.values(idMap).filter(item => item != null).length == 0 && !props.showUnknown) continue;
        const selected = props.currentPopupKey == `${props.name}-${tag.start}`;
        const highlighted = props.highlightedEntityId != undefined && Object.values(idMap).includes(props.highlightedEntityId);
        const types = tag.types.filter(type => props.showUnknown || idMap[type] != null).map(type => type.toLowerCase());
        const unformatted = replaceMissingSymbols(props.text.substring(processed, tag.start));
        const formatted = replaceMissingSymbols(tag.text);
        if (unformatted != '') {
            elements.push(<React.Fragment key={processed}>{unformatted}</React.Fragment>);
        }
        elements.push(
            <span key={`${props.name}-${tag.start}`}
                  className={`entity-${types.join("-")} article-entity ${highlighted ? "article-entity-highlighted" : ""}`}
                  onClick={() => props.setCurrentPopup(`${props.name}-${tag.start}`)}>
                {formatted}
                {selected ? <TagWithPopup key={`${props.name}-popup`} ref={props.popupKeyRef} tag={tag}/> : <></>}
            </span>
        );
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
    highlightedEntityId?: string
    setHighlightedEntityId: React.Dispatch<string | undefined>
}

interface KnownLegendItemViewProps {
    item: KnownEntityGroup
    highlightedEntityId?: string
    setHighlightedEntityId: React.Dispatch<string | undefined>
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
    const highlighted = props.highlightedEntityId == props.item.id;
    const iconClass = highlighted ? "article-legend-item-icon-close" : "article-legend-item-icon-search";
    return <div>
        <span className={`entity-${props.item.type.toLowerCase()}`}>
            <a href={link}
               className="entity-link"
               rel="noopener noreferrer"
               target="_blank">
                {prefix + props.item.id}
            </a>
        </span>
        <FontAwesomeIcon className={`article-legend-item-icon ${iconClass}`}
                         icon={highlighted ? faTimesCircle : faSearch}
                         onClick={() => {
                             if (highlighted) {
                                 props.setHighlightedEntityId(undefined);
                             } else {
                                 props.setHighlightedEntityId(props.item.id);
                             }
                         }}/>
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
    type: TagType,
    knownItems: KnownEntityGroup[]
    unknownItems: UnknownEntity[]
    highlightedEntityId?: string
    setHighlightedEntityId: React.Dispatch<string | undefined>
}

const LegendGroup: React.FC<LegendGroupProps> = (props: LegendGroupProps) => {
    const [expanded, setExpanded] = useState(false);

    if (props.knownItems.length + props.unknownItems.length == 0) {
        return <></>
    }

    return <div>
        <h5
            className={`article-legend-group-label entity-${props.type.toLowerCase()}-text ${expanded ? 'article-legend-group-label-open' : ''}`}
            onClick={() => setExpanded(!expanded)}>
            <FontAwesomeIcon icon={props.icon}/> {props.name} <FontAwesomeIcon icon={faCaretRight}/>
        </h5>
        {
            expanded ? <ul>
                {props.knownItems.sort(compare).map((item, i) => <li key={i}>
                    <KnownLegendItem
                        item={item}
                        highlightedEntityId={props.highlightedEntityId}
                        setHighlightedEntityId={props.setHighlightedEntityId}/>
                </li>)}
                {props.unknownItems.length > 0 ? <h6>Unknown items</h6> : <></>}
                {props.unknownItems.sort(compareUnknown).map((item, i) => <li key={i}><UnknownLegendItem item={item}/>
                </li>)}
            </ul> : <></>
        }
    </div>
};

const LegendView: React.FC<LegendViewProps> = (props: LegendViewProps) => {
    const known = props.items.known;
    const unknown = props.items.unknown;
    return <div className="article-legend-list">
        <LegendGroup name="Genes" icon={faDna} type={TagType.GENE}
                     knownItems={known.filter((item) => item.type == TagType.GENE)}
                     unknownItems={props.showUnknown ? unknown.filter((item) => item.type == TagType.GENE) : []}
                     highlightedEntityId={props.highlightedEntityId}
                     setHighlightedEntityId={props.setHighlightedEntityId}
        />
        <LegendGroup name="Diseases" icon={faVirus} type={TagType.DISEASE}
                     knownItems={known.filter((item) => item.type == TagType.DISEASE)}
                     unknownItems={props.showUnknown ? unknown.filter((item) => item.type == TagType.DISEASE) : []}
                     highlightedEntityId={props.highlightedEntityId}
                     setHighlightedEntityId={props.setHighlightedEntityId}
        />
        <LegendGroup name="Chemicals" icon={faVials} type={TagType.CHEMICAL}
                     knownItems={known.filter((item) => item.type == TagType.CHEMICAL)}
                     unknownItems={props.showUnknown ? unknown.filter((item) => item.type == TagType.CHEMICAL) : []}
                     highlightedEntityId={props.highlightedEntityId}
                     setHighlightedEntityId={props.setHighlightedEntityId}
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

    const [currentPopupKey, setCurrentPopupKey] = useState<string | undefined>(undefined);
    const popupKeyRef = React.createRef<HTMLDivElement>();
    const setCurrentPopupKeyWrapper: (popupKey: string | undefined) => void = (popupKey) => setCurrentPopupKey(popupKey);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const currentRef = popupKeyRef.current;
            if (currentRef && !currentRef.contains((event.target as Element))) {
                setCurrentPopupKey(undefined);
            }
        };

        document.addEventListener("mouseup", handleClickOutside);
        return () => {
            document.removeEventListener("mouseup", handleClickOutside);
        };
    }, [popupKeyRef]);

    const [highlightedEntityId, setHighlightedEntityId] = useState<string | undefined>(undefined);

    return <div className="article">
        <div className="article-block">
            <h3 className="article-title">
                <TaggedView
                    name="title"
                    text={props.article.title}
                    tags={titleTags}
                    showUnknown={showUnknown}
                    currentPopupKey={currentPopupKey}
                    setCurrentPopup={setCurrentPopupKey}
                    popupKeyRef={popupKeyRef}
                    highlightedEntityId={highlightedEntityId}
                />
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
                <TaggedView
                    name="abstract"
                    text={props.article.abstract}
                    tags={abstractTags}
                    showUnknown={showUnknown}
                    currentPopupKey={currentPopupKey}
                    setCurrentPopup={setCurrentPopupKeyWrapper}
                    popupKeyRef={popupKeyRef}
                    highlightedEntityId={highlightedEntityId}
                />
            </div>
        </div>
        <div className="article-legend">
            <div className="article-legend-show-unknown">
                <button className="btn btn-outline-info" onClick={() => setShownUnknown(!showUnknown)}>
                    {showUnknown ? "Hide unknown entities" : "Show unknown entities"}
                </button>
            </div>
            <LegendView
                items={props.article.entities}
                showUnknown={showUnknown}
                highlightedEntityId={highlightedEntityId}
                setHighlightedEntityId={setHighlightedEntityId}
            />
        </div>
    </div>
};
