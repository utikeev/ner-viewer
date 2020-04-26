import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {PmidForm} from "./views/form";
import {useStore} from "effector-react";
import {$articleStore, fetchArticleFx} from "./store/store";
import {ArticleView} from "./views/articleView";

import "./styles/common.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {BrowserRouter, Switch, Route, useParams, RouteComponentProps} from "react-router-dom";
import {useEffect} from "react";

const Loading = () => {
    return <div className="loading text-primary">
        <FontAwesomeIcon icon={faSpinner} spin size="3x"/>
    </div>
};

interface AppProps extends RouteComponentProps {
}


const App: React.FC<AppProps> = ({history}) => {
    const articleStore = useStore($articleStore);
    const {id} = useParams();

    useEffect(() => {
        if (id) {
            fetchArticleFx({pmid: id});
        }
    }, [id]);


    let articleComponent = <></>;
    if (articleStore.pending) {
        articleComponent = <Loading/>;
    } else if (articleStore.article) {
        articleComponent = <ArticleView article={articleStore.article}/>
    }

    return <div>
        <PmidForm history={history}/>
        {articleComponent}
    </div>
};

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route path='/:id?' component={App}/>
            </Switch>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);