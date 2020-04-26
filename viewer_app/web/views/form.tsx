import * as React from "react";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {$articleStore, fetchArticleFx} from "../store/store";

import "../styles/form.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDice} from '@fortawesome/free-solid-svg-icons';
import {useStore} from "effector-react";
import {Error} from "./error";
import {History} from "history";

interface PmidFormProps {
    history: History
}

export const PmidForm: React.FC<PmidFormProps> = (props: PmidFormProps) => {
    const articleStore = useStore($articleStore);
    const articlePmid: string|undefined = articleStore.article?.pmid;
    const [pmid, setPmid] = useState<string>("");
    const pmidChanged = pmid.trim() != '' && pmid.trim() != articlePmid;

    useEffect(() => {
        if (articlePmid) {
            setPmid(articlePmid);
        }
    }, [articlePmid]);

    const onChangePmid = (e: ChangeEvent<HTMLInputElement>) => {
        setPmid(e.target.value);
    };
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pmidChanged) {
            props.history.push(`/${pmid}`);
            fetchArticleFx({pmid: pmid});
        }
    };
    const fetchRandom = (e: React.MouseEvent) => {
        e.preventDefault();
        fetchArticleFx({pmid: null}).then(value => {
            props.history.push(`/${value.pmid}`);
            setPmid(value.pmid.toString());
        });
    };

    return <form className="pmid-form" onSubmit={onSubmit}>
        <label className="pmid-label" htmlFor="pmid">PMID</label>
        <input className="pmid-input" id="pmid" type='text' value={pmid} onChange={onChangePmid}/>
        <div className="pmid-buttons btn-group">
            <button type="submit" className="btn btn-lg btn-primary"
                    disabled={!pmidChanged || articleStore.pending}>Submit
            </button>
            <button type="button" className="btn btn-lg btn-success" disabled={articleStore.pending}
                    onClick={fetchRandom}>
                <FontAwesomeIcon icon={faDice}/>
            </button>
        </div>
        {articleStore.error ? <Error className="pmid-error" text={articleStore.error}/> : <></>}
    </form>
};
