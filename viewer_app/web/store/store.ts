import {createDomain} from "effector";
import {Article} from "../models/Article";

interface FetchArticleRequest {
    pmid: string|undefined
}

export const ArticleDomain = createDomain();
export const fetchArticleFx = ArticleDomain.effect<FetchArticleRequest, Article, Error>();
export const articleStore = ArticleDomain.createStore<Article | null>(null)
    .on(fetchArticleFx.doneData, (_, article: Article) => article);

export class ArticleApi {
    public static fetchArticle = async (request: FetchArticleRequest) => {
        // TODO: pass host as an ENV variable
        const baseUrl = 'http://localhost:9090/article';
        const url = request.pmid ? `${baseUrl}?pmid=${request.pmid}` : baseUrl;
        const req: Response = await fetch(url);
        return req.json();
    }
}

fetchArticleFx.use(ArticleApi.fetchArticle);
