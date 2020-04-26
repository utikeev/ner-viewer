import {createDomain} from "effector";
import {Article} from "../models/Article";

interface FetchArticleRequest {
    pmid: string | null
}

interface ArticleState {
    pending: boolean
    article: Article | null
    error: string | null
}

export const ArticleDomain = createDomain();
export const fetchArticleFx = ArticleDomain.effect<FetchArticleRequest, Article, Error>();
export const $articleStore = ArticleDomain.createStore<ArticleState>({
    pending: false,
    article: null,
    error: null
})
    .on(fetchArticleFx, (state) => ({
        ...state,
        article: null,
        error: null
    }))
    .on(fetchArticleFx.pending, (state, pending: boolean) => ({
        ...state,
        pending: pending,
    }))
    .on(fetchArticleFx.doneData, (state, article: Article) => ({
        ...state,
        article: article
    }))
    .on(fetchArticleFx.failData, (state, error) => ({
        ...state,
        error: error.message
    }));

export class ArticleApi {
    public static fetchArticle = async (request: FetchArticleRequest) => {
        // TODO: pass host as an ENV variable
        const baseUrl = 'http://localhost:9090/article';
        const url = request.pmid ? `${baseUrl}?pmid=${request.pmid}` : baseUrl;
        const response: Response = await fetch(url);
        const json = await response.json();
        if (!response.ok) {
            return Promise.reject(new Error(json.reason));
        }
        return json;
    }
}

fetchArticleFx.use(ArticleApi.fetchArticle);
