import argparse
import logging
import os
from pathlib import Path
from typing import Optional, Awaitable, Any, Dict, Set

import tornado.ioloop
import tornado.web
from tornado import httputil

from viewer_app.server.db.article_database import ArticleDatabase, Article
from viewer_app.server.models.tags import NormalizedEntity

LOG = logging.getLogger('ner.viewer.main')


class MainHandler(tornado.web.RequestHandler):
    def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
        raise NotImplementedError()

    def get(self):
        self.render('index.html')


class ArticleHandler(tornado.web.RequestHandler):
    def __init__(self, application: tornado.web.Application,
                 request: httputil.HTTPServerRequest,
                 db: ArticleDatabase, **kwargs):
        super().__init__(application, request, **kwargs)
        self.db = db

    def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
        raise NotImplementedError()

    @staticmethod
    def article_to_json(article: Article) -> Any:
        if article is None:
            return None
        content_parts = article.content.split('|')
        tags = article.compound_tags
        entities = article.entities
        return {
            'pmid': article.id,
            'title': content_parts[0],
            'abstract': content_parts[1],
            'tags': [
                {
                    'types': tag.tags,
                    'text': tag.text,
                    'start': tag.start,
                    'end': tag.end,
                    'ids': tag.ids,
                } for tag in tags
            ],
            'entities': ArticleHandler._group_entities(entities)
        }

    @staticmethod
    def _group_entities(entities: Set[NormalizedEntity]) -> Dict[str, Any]:
        res: Dict[str, Any] = {'unknown': [], 'known': {}}
        for entity in entities:
            if entity.id:
                if entity.id not in res['known']:
                    res['known'][entity.id] = {'type': entity.tag, 'aliases': []}
                res['known'][entity.id]['aliases'].append(entity.text)
            else:
                res['unknown'].append({'type': entity.tag, 'alias': entity.text})
        res['known'] = [{'id': k, **v} for k, v in res['known'].items()]
        for item in res['known']:
            item['aliases'] = list({value.lower(): value for value in item['aliases']}.values())
        return res

    @staticmethod
    def get_by_pmid(db: ArticleDatabase, pmid: int) -> Any:
        return ArticleHandler.article_to_json(db[pmid])


    @staticmethod
    def get_random(db: ArticleDatabase) -> Any:
        return ArticleHandler.article_to_json(db.get_random())

    def get(self):
        pmid = self.get_argument('pmid', None)
        if pmid is None:
            self.write(self.get_random(self.db))
        else:
            json = self.get_by_pmid(self.db, int(pmid))
            if json is None:
                self.set_status(404)
                self.write({
                    'reason': 'Article not found'
                })
            else:
                self.write(json)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--log_directory', type=lambda x: Path(x), default=Path(os.environ['BUILD_WORKSPACE_DIRECTORY']) / 'logs')
    parser.add_argument('--database', type=lambda x: Path(x), required=True)
    args = parser.parse_args()

    logging.basicConfig(filename=f'{args.log_directory}/ner-viewer.log', level=logging.INFO)

    static_path = Path('viewer_app/server/static')
    database = ArticleDatabase(args.database)

    LOG.info('Starting web-server...')

    app = tornado.web.Application([
        ('/article', ArticleHandler, dict(db=database)),
        (r'/.*', MainHandler),
    ], static_path=static_path)
    app.listen(9090)

    LOG.info('Started web-server on port 9090')

    tornado.ioloop.IOLoop.current().start()
