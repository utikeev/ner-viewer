import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {PmidForm} from "./views/form";
import {useStore} from "effector-react";
import {$articleStore} from "./store/store";
import {ArticleView} from "./views/articleView";

import "./styles/common.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

const Loading = () => {
    return <div className="loading text-primary">
        <FontAwesomeIcon icon={faSpinner} spin size="3x"/>
    </div>
};


function App() {
    const articleStore = useStore($articleStore);
    let articleComponent = <></>;
    if (articleStore.pending) {
        articleComponent = <Loading/>;
    } else if (articleStore.article) {
        articleComponent = <ArticleView article={articleStore.article}/>
    }

    return <div>
        <PmidForm/>
        {articleComponent}
    </div>
}

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById("root")
);