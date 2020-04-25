import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {PmidForm} from "./views/form";
import {useStore} from "effector-react";
import {articleStore} from "./store/store";
import {ArticleView} from "./views/articleView";

import "./styles/common.scss";

function App() {
    const article = useStore(articleStore);

    return <div>
        <PmidForm/>
        {article ? <ArticleView article={article}/> : <></>}
    </div>
}

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById("root")
);