import * as React from "react";
import {ChangeEvent, FormEvent, useState} from "react";
import {fetchArticleFx} from "./store/store";

export const PmidForm: React.FC = () => {
    const [pmid, setPmid] = useState<string>('');

    const onChangePmid = (e: ChangeEvent<HTMLInputElement>) => {
        setPmid(e.target.value);
    };
    const onSubmit = (e: FormEvent<HTMLFormElement>) =>  {
        e.preventDefault();
        fetchArticleFx({pmid: pmid}).then();
    };

    return <form onSubmit={onSubmit}>
        <label>
            PMID:
            <input type='text' value={pmid} onChange={onChangePmid}/>
        </label>
    </form>
};
