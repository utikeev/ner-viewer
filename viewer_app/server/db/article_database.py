from pathlib import Path
from typing import List, Set, Iterable, Optional

from sqlalchemy import Column, String, Integer, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from viewer_app.server.models.compound_tags import split_to_compound_tags
from viewer_app.server.models.tags import TaggedEntity, NormalizedEntity

Base = declarative_base()


def _parse_id(string: str) -> Optional[str]:
    if string == 'None' or string == 'CUI-less':
        return None
    return string.split('-')[0]


class Article(Base):
    __tablename__ = 'tagged'
    id = Column(Integer, primary_key=True)
    content = Column(String)
    tags = Column(String)

    def __init__(self, content: str, tags: str):
        self.content = content
        self.tags = tags

    @property
    def entities(self) -> Set[NormalizedEntity]:
        tags = self.tags.split('\n')
        tags = [tag.split(' ') for tag in tags]
        new_tags = []
        for tag in tags:
            normalized_offset = 1 if tag[-1].isdigit() else 0
            e_id = None
            if normalized_offset == 0:
                e_id = _parse_id(tag[-1])
            e_type = tag[0]
            text = ' '.join(tag[1: -3 + normalized_offset])
            new_tags.append(NormalizedEntity(e_type, text, e_id))
        return set(new_tags)

    @property
    def compound_tags(self) -> List[TaggedEntity]:
        tags = self.tags.split('\n')
        tags = [tag.split(' ') for tag in tags]
        new_tags = []
        for tag in tags:
            normalized_offset = 1 if tag[-1].isdigit() else 0
            ids = {tag[0]: None}
            if normalized_offset == 0:
                ids[tag[0]] = _parse_id(tag[-1])
            e_type = tag[0]
            start = int(tag[-3 + normalized_offset])
            end = int(tag[-2 + normalized_offset])
            text = ' '.join(tag[1: -3 + normalized_offset])
            new_tags.append(TaggedEntity([e_type], start, end, text, ids))
        return split_to_compound_tags(new_tags)


class ArticleDatabase:
    def __init__(self, path: Path):
        self.path = path
        self.engine = create_engine(f'sqlite:///{str(path)}')
        # noinspection PyTypeChecker
        self.session_maker = sessionmaker(bind=self.engine)

    def __getitem__(self, pmid: int) -> Article:
        session = self.session_maker()
        return session.query(Article).filter_by(id=pmid).first()

    def get_random(self) -> Article:
        session = self.session_maker()
        return session.query(Article).order_by(func.random()).first()
