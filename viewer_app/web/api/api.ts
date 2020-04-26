export interface FetchArticleRequest {
    pmid: string | null
}

export class ArticleApi {
    private static baseUrl = process.env.NODE_ENV == 'production' ?
        `${window.location.protocol}//${window.location.host}` :
        `${window.location.protocol}//localhost:9090`;

    public static fetchArticle = async function (request: FetchArticleRequest) {
        let url = `${ArticleApi.baseUrl}/article`;
        url = request.pmid ? `${url}?pmid=${request.pmid}` : url;
        const response: Response = await fetch(url);
        const json = await response.json();
        if (!response.ok) {
            return Promise.reject(new Error(json.reason));
        }
        return json;
    }
}