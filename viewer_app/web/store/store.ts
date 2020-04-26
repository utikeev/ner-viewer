import {createDomain} from "effector";
import {Article} from "../models/Article";
import {ArticleApi} from "../api/api";

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

fetchArticleFx.use(ArticleApi.fetchArticle);
