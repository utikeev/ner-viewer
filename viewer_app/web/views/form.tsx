import * as React from "react";
import {ChangeEvent, FormEvent, useState} from "react";
import {fetchArticleFx} from "../store/store";

import "../styles/form.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDice} from '@fortawesome/free-solid-svg-icons';

export const PmidForm: React.FC = () => {
    const [pmid, setPmid] = useState<string>('');

    const onChangePmid = (e: ChangeEvent<HTMLInputElement>) => {
        setPmid(e.target.value);
    };
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pmid.trim() != '') {
            fetchArticleFx({pmid: pmid}).then();
        }
    };
    const fetchRandom = (e: React.MouseEvent) => {
        e.preventDefault();
        fetchArticleFx({pmid: undefined}).then(value => {
            setPmid(value.pmid.toString());
        });
    };

    return <form className="pmid-form" onSubmit={onSubmit}>
        <label className="pmid-label" htmlFor="pmid">PMID</label>
        <input className="pmid-input" id="pmid" type='text' value={pmid} onChange={onChangePmid}/>
        <div className="pmid-buttons btn-group">
            <button type="submit" className="btn btn-lg btn-primary" disabled={pmid.trim() == ''}>Submit</button>
            <button type="button" className="btn btn-lg btn-success" onClick={fetchRandom}>
                <FontAwesomeIcon icon={faDice}/>
            </button>
        </div>
    </form>
};
