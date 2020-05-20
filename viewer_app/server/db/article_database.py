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
        tags = [NormalizedEntity(tag[0], ' '.join(tag[1:-3]), _parse_id(tag[-1])) for tag in tags]
        return set(tags)

    @property
    def compound_tags(self) -> List[TaggedEntity]:
        tags = self.tags.split('\n')
        tags = [tag.split(' ') for tag in tags]
        new_tags = []
        for tag in tags:
            ids = set()
            maybe_id = _parse_id(tag[-1])
            if maybe_id:
                ids.add(maybe_id)
            new_tags.append(TaggedEntity([tag[0]], int(tag[-3]), int(tag[-2]), ' '.join(tag[1:-3]), ids))
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
