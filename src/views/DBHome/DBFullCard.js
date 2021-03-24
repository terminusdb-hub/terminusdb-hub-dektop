/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, {useState, useEffect, Fragment} from "react"
import { GRAPHDB } from "../../constants/images"
import {Row, Col } from "react-bootstrap" //replaced
import {goDBPage, goDBHome, goHubPage} from "../../components/Router/ConsoleRouter"
import { TERMINUS_ERROR, TERMINUS_COMPONENT } from "../../constants/identifiers"
import Loading from "../../components/Reports/Loading"
import { TerminusDBSpeaks } from "../../components/Reports/TerminusDBSpeaks"
import { AiOutlineCloudSync, AiOutlineLink, AiFillBuild, AiOutlineInfoCircle,
    AiOutlineInbox, AiFillWarning, AiOutlineBook, AiFillDatabase} from 'react-icons/ai';
import { FcRefresh } from "react-icons/fc"
import { MdContentCopy } from 'react-icons/md';
import { validURL } from '../../utils/helperFunctions';
import { DeleteDB } from "./DeleteDB"
import { DBID, isOnHub, formatBytes } from "../Server/DBList"
import { AreSynched } from "../DBSynchronize/DBDifferences"
import { DBBranches, DBLastCommit, CloneRoleCredits, DBPrivacy, DBCreated, CloneProductionCredits } from "../Pages/ClonePage"
import {WOQLClientObj} from '../../init/woql-client-instance'

export const DBFullCard = ({meta, user, title_max, onAction, onClone}) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState()

    meta.action = (onAction ? _user_db_action(meta, user) : false)

    function noGo(report){
        setLoading(false)
        if(report) setReport(report)
    }

    function onGo(){
        if(onAction){
            setReport(false)
            if(!meta.action) return
            let uerr = onAction(meta, noGo)
            if(uerr){
                setReport({status: TERMINUS_ERROR, message: uerr, error: {}})
            }
            else {
               // setLoading(true)
            }
        }
    }

    return (
        <Row key='r7' className='database-summary-listing'>
            {loading &&
                <Loading type={TERMINUS_COMPONENT} />
            }
            { report &&
                <TerminusDBSpeaks report={report} />
            }
            {!loading && <>
                {/*<DBControls meta={meta} user={user} onClone={onClone}/>*/}
                <DBImagePanel meta={meta} user={user} onClone={onClone} />
                <Col className='database-full-summary-content'>
                    <Row key='r3'>
                        <DBTitle meta={meta} user={user} max={title_max}/>
                    </Row>
                    <span className="dbcredits-full-page">
                        <DBCredits meta={meta}  user={user} />
                    </span>
                    {meta.comment &&
                        <DBDescription meta={meta}  user={user} />
                    }
                    {meta.remote_url &&
                        <Row key='r6'>
                            <span className="database-remote-credits branch-info">
                                <RemoteCredits meta={meta}  user={user} />
                            </span>
                        </Row>
                    }
                </Col>
            </>
        }
        </Row>
    )
}

export const DBTitle = ({meta, user, onAction, max}) => {
    let maxtitle = max || 60, author = false
    let title_css = "database-listing-title-nolink"
    if(meta.label && meta.label.length > maxtitle){
        var str =  meta.label.substring(0, maxtitle -4) + " ..."
    }
    else str = meta.label || ""

    return (
        <span className='database-listing-title-row db-title-full-page'>
            <span key='a' className={title_css}>{str}</span>
        </span>
    )
}

export const DBCredits = ({meta, user}) => {
    let res = []
    res.push(<DBID key='dbti' meta={meta} />)
    res.push(<DBSize key='dbts' meta={meta} />)
    res.push(<DBBranches  key='abcb' meta={meta} type="full" />)
    //res.push(<DBSize key='ab' meta={meta} user={user} />)
    res.push(<DBCreated key='cre' ts={meta.created} type="full" />)
    res.push(<DBLastCommit key='dbv' meta={meta} user={user} />)
    return res
}

export const DBDescription = ({meta, user}) => {
    if(meta.comment && meta.comment.length > 400 && !meta.testing){
        var str =  meta.comment.substring(0, 396) + " ..."
    }
    else str = meta.comment || ""
    return (
        <Row key='z' className='database-listing-description-fullrow'>
            <span className="database-listing-description">{str}</span>
        </Row>
    )
}

export const RemoteCredits = ({meta, user}) => {
    const {woqlClient} = WOQLClientObj()
    function myLoad(dbmeta){
        if(woqlClient){
             woqlClient.db(false)
             woqlClient.organization(false)
        }
        goHubPage(dbmeta.organization, dbmeta.id)
    }

    let res = []
    res.push(<DBCloneStatus  key='cl' meta={meta} user={user} />)
    if(meta && meta.remote_record && meta.type != "local_clone"){
        res.push (
            <CloneProductionCredits  key='ac' onAction={myLoad} meta={meta.remote_record} user={user} />
        )
        res.push(
            <CloneRoleCredits key='asd' meta={meta.remote_record} user={user} />
        )
        res.push(
            <DBPrivacy key='adsd' meta={meta.remote_record} user={user} />
        )
        res.push(
            <DBLastCommit key='ad' meta={meta.remote_record} user={user} />
        )
    }
    return (<>
        <div className="remote-info-align">
            <AiOutlineInfoCircle className={"database-remote-icon"} color={"#ddd"}/>
            <span className="db_info_branch_text">Remote Info</span>
        </div>
        <div className="database-remote-info-row">
            {res}
        </div></>
    )
}

export const DBCloneStatus = ({meta, user}) => {
    if(meta.remote_url) {
        if(meta.type == "local_clone"){
           return <>
                <DBSynchStatus meta={meta} type="local"/>
                <DBLocalClone meta={meta} user={user} />
            </>
        }
        if(isOnHub(meta)) {
            return <>
                <DBSynchStatus meta={meta} type="hub" />
                <DBHubClone url={meta.remote_url} meta={meta.remote_record} user={user} />
            </>
        }
        return <DBRemoteCloned meta={meta.remote_url} user={user} />
    }
    return null
}

export const DBLocalClone = ({meta, user}) => {
    let ct = "Clone of local Database " + meta.remote_url.substring(meta.remote_url.lastIndexOf("/")+1)
    return (
        <span className="db-card-credit">
            <AiFillDatabase className="db_info_icon_spacing"/>
            <span className="db_info">{ct}</span>
        </span>
    )
}

export const DBRemoteCloned = ({meta, user}) => {
    let ct = "Clone of " + meta.remote_url
    return (
        <span className="db-card-credit">
            <AiOutlineLink className="db_info_icon_spacing"/>
            <span className="db_info"> {ct}</span>
        </span>
    )
}



export const DBHubClone = ({meta, url}) => {
    const {woqlClient} = WOQLClientObj()

    function goHub(){
        if(woqlClient){
            woqlClient.db(false)
            woqlClient.organization(false)
        }
        if(meta) goHubPage(meta.organization, meta.id)
        if(url) {
            let bits = url.split("/")
            goHubPage(bits[bits.length-2], bits[bits.length-1])
        }
    }
    if(!meta){
        return <span className="db-card-credit hub-organization-link" onClick={goHub}>
            <AiFillWarning className="db_info_icon_spacing"/>
            <span className="db_info">Unavailable Terminus Hub DB {url}</span>
        </span>
    }

    let ct = meta.label ? meta.label : meta.id
    return(
        <span className="db-card-credit hub-organization-link" onClick={goHub}>
            <MdContentCopy color="#0055bb" className='db_info_icon_spacing'/>
            <span className="db_info"> Cloned from <strong>{ct}</strong> on Terminus Hub</span>
        </span>
    )
}

export const DBSynchStatus = ({meta}) => {
    function goSynch(){
        goDBPage(meta.id, "admin", "synchronize")
    }

    if(!meta.remote_record){
        return null
    }

    let sync = (AreSynched(meta, meta.remote_record))

    if(sync){
        return <span className="db-sync-link" onClick={goSynch}>
            <AiOutlineCloudSync className="synch-page-action-icon" color={"#00C08B"} className="db_info_icon_spacing"/>
        </span>
    }
    else {
        return <span className="db-sync-link" onClick={goSynch}>
            <AiOutlineCloudSync className="unsynch-page-action-icon" color={"#da9d00"} title="Databases are out of synch"/>
        </span>
    }
}


export const UnsynchControl = ({meta}) => {
    return <span className="database-clone-action">
    </span>
}


export const DBHubCloneStatus = ({meta}) => {
    const {woqlClient} = WOQLClientObj()
    let ct = meta.label ? meta.label : meta.id
    function goHub(){
        if(woqlClient){
            woqlClient.db(false)
            woqlClient.organization(false)
        }
        goHubPage(meta.oganization, meta.id)
    }
    return(
        <span className="db-card-credit" onClick={goHub}>
            <AiOutlineBook className="db_info_icon_spacing"/>
            <span className="db_info">Cloned from <strong>{ct}</strong> on Terminus Hub</span>
        </span>
    )
}



export const DBSize = ({meta, user}) => {
    if(meta.size){
        let bytes = formatBytes(meta.size)
        let tit = meta.size + " bytes";
        return (
            <span title={tit}>
                <AiFillBuild className="db_info_icon_spacing"/>
                <span className="db_info">{bytes}</span>
            </span>
        )
    }
    else {
        return (
            <span title={"This is an empty database"}>
                <AiOutlineInbox className="db_info_icon_spacing"/>
                <span className="db_info">empty</span>
            </span>
        )
    }
}

export const DBImagePanel = ({meta, user, onClone}) => {
    let icon = (meta.remote_record && meta.remote_record.icon ? meta.remote_record.icon : GRAPHDB)
    let title = `Database ${meta.id}`
    let vi = validURL(icon)
    return (
        <span title={title} className='dbcard-control-panel-dbfull' >
            {/*<DBControls meta={meta} user={user} onClone={onClone}/>*/}
            {vi &&
                <img className='dbcard-image' src={icon}/>
            }
            {!vi &&
                <i className={'dbcard-icon ' + icon} />
            }
        </span>
    )
}

export const DBControls = ({meta, user, setDBAction, repos}) => {

    const [showSync, setShowSync]=useState(false)
    const [spacing, setSpacing]=useState(6)

    function handleSynchronize (){
        onSynchronize(true)
    }

    useEffect(() => {
        for(var rem in repos){
            if((rem != "local") && user.logged_in){
                setShowSync(true)
                setSpacing(4)
                break
            }
        }
    }, [repos])

    return (<span style={{marginLeft: "auto", display: "inline-flex"}}>
            <li className="nav__main__item nav__main__item--sub" onClick={(e) => setDBAction({clone: true, sync:false, delete:false})} >
                <CloneControl meta={meta} user={user}/>
            </li>
            {showSync && <li className="nav__main__item nav__main__item--sub" onClick={(e) => setDBAction({clone: false, sync:true, delete:false})}>
                <SyncControl meta={meta} user={user}/>
            </li>}
            <li className="nav__main__item nav__main__item--sub" onClick={(e) => setDBAction({clone: false, sync:false, delete:true})}>
                <DeleteDB meta={meta} user={user}/>
            </li>
        </span>
    )
}

export const SyncControl = ({meta, user}) => {
    return <span className="db-action" style={{color: "#0055bb"}} title="Clone">
        <FcRefresh color="#0055bb" className='db-control db-clone-control' />
        <span>sync</span>
    </span>
}

export const CloneControl = ({meta, user}) => {
    return <span className="db-action" style={{color: "#0055bb"}} title="Clone">
        <MdContentCopy color="#0055bb" className='db-control db-clone-control' />
        <span>clone</span>
    </span>
}
