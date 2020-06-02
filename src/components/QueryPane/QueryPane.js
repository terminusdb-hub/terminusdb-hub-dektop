import React, {useState,useMemo } from "react";
import { QueryEditor } from "./QueryEditor"
import { QueryLibrary } from "./QueryLibrary"
import { ReportWrapper } from "./ReportWrapper"
import {WOQLQueryContainerHook} from "../Query/WOQLQueryContainerHook";
import { WOQLClientObj } from "../../init/woql-client-instance";
import { Tabs, Tab } from 'react-bootstrap-tabs';
import {ResultQueryPane} from './ResultQueryPane';
import TerminusClient from '@terminusdb/terminusdb-client';
import {QUERY_PANEL_TITLE} from "./constants.querypane"
import {HistoryNavigatorObj} from "../../init/history-navigator-instance";

/*
* this is only the queryEditor you don't need to process result;
*/
export const QueryPane = ({query,className,resultView, startLanguage, queryText}) => {
    /*
    * maybe a copy of this
    */

    const {woqlClient} = WOQLClientObj();
    let refHeadId,branchHead
    /*
    * not do the query if the value don't change
    */
    try{
        /*
        * this dosen't exist for terminus db to be review
        */
        const {refId,branch} =HistoryNavigatorObj();
        refHeadId=refId;
        branchHead=branch;

        console.log("__REF___",refHeadId,"__BRANCH___",branchHead)
    }catch(err){
        console.log("terminus-db")
    }
    //TerminusClient.WOQL.setContextFromClient(woqlClient)//sets constants in WOQL to use for forming resource strings (COMMITS, DB, META, REF, BRANCH, HEAD)
    const [updateQuery, report, bindings, woql] = WOQLQueryContainerHook(woqlClient,query,refHeadId,branchHead);
    const [baseLanguage, setBaseLanguage] = useState(startLanguage || "js");
    const [content, setContent] = useState(initcontent); 

    const [showLanguage, setShowLanguage] = useState(false);   
    const [showContent, setShowContent] = useState("");
    const [selectedTab, changeTab] = useState(0);
    /*
    *onChange will be update
    */
    let initcontent = queryText || ""

    const [disabled]  = useMemo(() => {
        if(bindings){
            changeTab(1)
            return [{}]
        }else return [{disabled:true}]
    }, [bindings])

    const onSelect=(k)=>{
        changeTab(k)
    }
    //const disabled = bindings ? {} : {disabled:true};

    return(
        <>
            <ReportWrapper currentReport={report} />          
            <Tabs selected={selectedTab}  onSelect={onSelect} id="query_tabs">
                <Tab label={QUERY_PANEL_TITLE}>
                    <QueryEditor 
                        baseLanguage={baseLanguage}
                        setBaseLanguage={setBaseLanguage}
                        content={content}
                        saveContent={setContent}
                        showLanguage={showLanguage}
                        setShowLanguage={setShowLanguage}
                        showContent={showContent}
                        setShowContent={setShowContent}
                        editable={true} 
                        query={woql} 
                        updateQuery={updateQuery} 
                        languages={["js", "json", "python"]}>
                        <QueryLibrary library="editor"/>
                    </QueryEditor>
                </Tab>
                <Tab label="Result Viewer" {...disabled}>
                    <ResultQueryPane 
                        resultView={resultView} 
                        bindings={bindings || []} 
                        query={woql} 
                        updateQuery={updateQuery}/>
                    </Tab>
            </Tabs>
        </>
    )
}
                   