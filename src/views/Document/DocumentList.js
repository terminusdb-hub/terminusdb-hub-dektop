import React, {useState, useEffect} from 'react'
import Loading from '../../components/Reports/Loading'
import TerminusClient from '@terminusdb/terminusdb-client'
import {WOQLClientObj} from '../../init/woql-client-instance'
import {DBContextObj} from '../../components/Query/DBContext'
import {ControlledTable} from '../Tables/ControlledTable'
import {Row, Col} from "reactstrap"
import {WOQLQueryContainerHook} from '../../components/Query/WOQLQueryContainerHook'
import {TerminusDBSpeaks} from '../../components/Reports/TerminusDBSpeaks'
import {TypeStats} from "./TypeStats"
import {DocumentTypeFilter, DocumentSubTypeFilter} from "./TypeFilter"
import {DEFAULT_PAGE_SIZE, DEFAULT_ORDER_BY} from "./constants.document"
import { TERMINUS_SUCCESS, TERMINUS_ERROR, TERMINUS_WARNING, TERMINUS_COMPONENT, TERMINUS_TABLE, TERMINUS_INFO} from '../../constants/identifiers'
import {CSVPreview} from '../../components/CSVPane/CSVPreview'
import {CSVViewContents} from "../../components/CSVPane/CSVViewContents"
import {DOCTYPE_CSV, DOWNLOAD, DELETE, DOCUMENT_VIEW} from '../../components/CSVPane/constants.csv'
import {MdFileDownload} from "react-icons/md"
import {RiDeleteBin5Line} from "react-icons/ri"

export const DocumentListView = ({setIsAdding, isAdding, types, selectDocument, setCurrent, docType, setDocType, csvs, setCsvs, setPreview, preview}) => {
    const [loading, setLoading]=useState(false)
    const [report, setReport]=useState(false)
    const [emptyDB, setEmptyDV] = useState(false)

    const { woqlClient} = WOQLClientObj()
    const {ref, branch, prefixes, updateBranches} = DBContextObj()

    let WOQL = TerminusClient.WOQL

    const docQuery = () => {
        let q = WOQL.and(
            WOQL.lib().document_metadata()
        )
        if(docType){
            q.sub(docType, "v:Type ID")
        }
        return q
    }

    const [query, setQuery] = useState(docQuery())

    const adding = (isadd) => {
        if(isadd) setIsAdding(true)
        else setIsAdding(false)
    }

    const setEmpty = () => {
        let rep = {}
        if(types && types.length > 0){
            let meta = getTypeMetadata(types, docType)
            rep.status = TERMINUS_INFO
            rep.message = ((docType && meta) ? "There are no " + meta.label + " documents in the database" :  "There are no documents in the database")
        }
        else {
            rep.status = TERMINUS_WARNING
            rep.message = "No document types have been defined. Use the Schema Builder to create a document type or add CSV files directly"

        }
        return <TerminusDBSpeaks report={rep}/>
    }

    useEffect(() => {
        setQuery(docQuery())
        if(docType){
            setCurrent(getTypeMetadata(types, docType))
        }
    }, [docType])


    function process_error(err, update_start, message){
        setReport({
            error: err,
            status: TERMINUS_ERROR,
            message: message,
            time: Date.now() - update_start,
        })
        //console.log(err)
    }

    let csvRowClick = function csvRowClick(id, name){
        setReport(false)
        setPreview({show: true, fileName: name, data:[], selectedCSV: id, page:DOCUMENT_VIEW});
    }

    let onDocClick = function(cell){
        let row = cell.row
        setReport(false)
        if(selectDocument && row) {
            if(row.original["Type ID"]==DOCTYPE_CSV){
                //csvRowClick(row.original.Name["@value"])
                csvRowClick(row.original["Document ID"], row.original.Name["@value"])
            }
            else selectDocument(row.original["Document ID"], row.original["Type ID"])
        }
    }

    let onClassClick = function(cell){
        setReport(false)
        if(setDocType && cell && cell.row) {
            setDocType(cell.row.original["Type ID"])
        }
    }

    const downloadDocument = (cell) => {
        let row=cell.row
        let type = row.original["Type ID"]
        setLoading(true)
        let update_start = Date.now()

        function downloadSuccess(results, fname){
            const url=window.URL.createObjectURL(new Blob([results]));
            const link=document.createElement('a');
            link.href = url;
            link.setAttribute('download', fname);
            document.body.appendChild(link);
            link.click();
        }

        function downloadFailure(err, did, iscsv){
            let tname = iscsv ? "CSV" : TerminusClient.UTILS.shorten(type)
            return process_error(err, update_start, "Failed to download " + tname + " document " + did)
        }

        if(type==DOCTYPE_CSV) {
            let name=row.original.Name["@value"]
            woqlClient.getCSV(name)
                .then((results) => downloadSuccess(results, name))
                .catch((err) => downloadFailure(err, name, true))
                .finally(() => setLoading(false))
        }
        else {
            let docid = row.original["Document ID"]
            woqlClient.query(WOQL.read_object(docid, "v:Doc"))
                .then((results) => {
                    let did = TerminusClient.UTILS.lastURLBit(docid)
                    let cnts = results.bindings[0]["Doc"]
                    downloadSuccess(JSON.stringify(cnts, false, 2), did + ".json")
                })
                .catch((err) => downloadFailure(err, docid))
                .finally(() => setLoading(false))
        }
    }

    const deleteDocument = (cell) => {
        let row=cell.row
        let type = row.original["Type ID"]
        setLoading(true)
        let update_start = Date.now()

        function deleteSuccess(did, iscsv){
            updateBranches()
            let tname = iscsv ? "CSV" : TerminusClient.UTILS.shorten(type)
			setReport({status: TERMINUS_SUCCESS, message: "Successfully deleted " + tname + " document " + did})
        }

        function deleteFailure(err, did, iscsv){
            let tname = iscsv ? "CSV" : TerminusClient.UTILS.shorten(type)
            return process_error(err, update_start, "Failed to delete " + tname + " document " + did)
        }

        if(type==DOCTYPE_CSV) {
            let name=row.original.Name["@value"]
            let commitMsg="Deleted CSV File " + name + " from console document list"
            woqlClient.deleteCSV(name, commitMsg)
                .then(() => deleteSuccess(name, true))
                .catch((err) => deleteFailure(err, name, true))
                .finally(() => setLoading(false))
        }
        else {
            let docid = row.original["Document ID"]
            let t2name = TerminusClient.UTILS.shorten(type)
            let cmsg = "Deleted " + t2name + " document " + docid + " from console document list"
            woqlClient.query(WOQL.delete_object(docid), cmsg)
                .then(() => deleteSuccess(docid))
                .catch((err) => deleteFailure(err, docid))
                .finally(() => setLoading(false))
        }
    }


	const getDownloadButton=()=>{
		return <span className="csv-toolbar-holder" title={"Download Document"}>
            <MdFileDownload color="#0055bb" className='schema-toolbar-delete'/>
        </span>
	}

    const getDeleteButton=()=>{
		return <span className="schema-toolbar-delete-holder" title={"Delete Document"}>
            <RiDeleteBin5Line color="#721c24" className='schema-toolbar-delete'/>
        </span>
	}

    const tabConfig=TerminusClient.View.table();
    tabConfig.column_order("Document ID", "Name", "Type Name", "Description", "Download", "Delete")
    tabConfig.pagesize(10)
    tabConfig.pager("remote")
    tabConfig.column("Document ID", "Name", "Description").minWidth(100).click(onDocClick)
    tabConfig.column("Type Name").header("Type").minWidth(80).click(onDocClick)
    tabConfig.column("Download").unsortable(true).click(downloadDocument).minWidth(80).render(getDownloadButton)
    tabConfig.column("Delete").unsortable(true).click(deleteDocument).minWidth(80).render(getDeleteButton)

    if(typeof types != "object") return <main className="console__page__container console__page__container--width"></main>



    return (<>
        {!isAdding && preview.show && <CSVViewContents preview={preview} setPreview={setPreview}
            previewCss={"csv-preview-results csv-preview-results-border"}/>}
        {loading &&  <Loading type={TERMINUS_COMPONENT} />}
        <main className="console__page__container console__page__container--width">
            {report && <Row className="generic-message-holder">
                <TerminusDBSpeaks report={report}/>
            </Row>}
            {!isAdding && !preview.show && <ControlledTable
                query={query}
                onEmpty={setEmpty}
                freewidth={true}
                view={tabConfig}
                limit={tabConfig.pagesize()}/>}
        </main>
    </>)
}


export function getTypeMetadata(types, de){
    for(var i = 0; i<types.length; i++){
        if(types[i]['Class ID'] == de){
            let tm = {
                id: types[i]['Class ID'],
                label: types[i]['Class Name']['@value'],
                description: types[i]['Description']['@value']
            }
            if(types[i]['Abstract'] && types[i]['Abstract']['@value'] && types[i]['Abstract']['@value'] == "Yes")
                tm.abstract = true
            return tm
        }
    }
}