from pathlib import Path
from typing import List

from sqlalchemy import Column, String, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from viewer_app.server.db.compound_tags import TaggedEntity, split_to_compound_tags

Base = declarative_base()


class Article(Base):
    __tablename__ = 'tagged'
    id = Column(Integer, primary_key=True)
    content = Column(String)
    tags = Column(String)

    def __init__(self, content: str, tags: str):
        self.content = content
        self.tags = tags

    @property
    def compound_tags(self) -> List[TaggedEntity]:
        tags = self.tags.split('\n')
        tags = [tag.split(' ') for tag in tags]
        tags = [TaggedEntity([tag[0]], int(tag[-2]), int(tag[-1]), ' '.join(tag[1:-2])) for tag in tags]
        return split_to_compound_tags(tags)


class ArticleDatabase:
    def __init__(self, path: Path):
        self.path = path
        self.engine = create_engine(f'sqlite:///{str(path)}')
        # noinspection PyTypeChecker
        self.session_maker = sessionmaker(bind=self.engine)

    def __getitem__(self, pmid: int) -> Article:
        session = self.session_maker()
        return session.query(Article).filter_by(id=pmid).first()
