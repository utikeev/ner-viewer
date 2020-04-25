import {createDomain} from "effector";
import {Article} from "../models/Article";

interface FetchArticleRequest {
    pmid: string
}

export const ArticleDomain = createDomain();
export const fetchArticleFx = ArticleDomain.effect<FetchArticleRequest, Article, Error>();
export const articleStore = ArticleDomain.createStore<Article | null>(null)
    .on(fetchArticleFx.doneData, (_, article: Article) => article);
articleStore.watch(state => console.log(state));

export class ArticleApi {
    public static fetchArticle = async (request: FetchArticleRequest) => {
        const url = `http://localhost:9090/article?pmid=${request.pmid}`;
        const req: Response = await fetch(url);
        console.log(req.json);
        return req.json();
    }
}

fetchArticleFx.use(ArticleApi.fetchArticle);
