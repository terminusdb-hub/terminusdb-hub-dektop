import React, {useEffect, useState} from 'react'
import {Row, Col} from "react-bootstrap" //replace
import TerminusClient from '@terminusdb/terminusdb-client'
import {DBFullCard} from './DBFullCard'
import {WOQLClientObj} from '../../init/woql-client-instance'
import {DBContextObj} from '../../components/Query/DBContext'
import {CommitLog} from "./CommitLog"
import {ScopedDetails} from "./ScopedDetails"
import {CloneLocal} from "../CreateDB/CloneDatabase"
import {goDBHome} from '../../components/Router/ConsoleRouter'
import {isOnHub} from '../Server/DBList'
import DocumentPage from '../Pages/DocumentPage'
import {Synchronize} from "../DBSynchronize/Synchronize"
import {DBHomeNavTab} from "./DBHomeNavTab"

export const MonitorDB = (props) => {
    const {woqlClient, refreshDBRecord, refreshRemoteURL} = WOQLClientObj()
    const {branches, updateBranches, repos} = DBContextObj()

    const [cloning, setCloning] = useState()
    const [dbAction, setDBAction] = useState({clone: cloning, sync: false, delete:false})

    const [bump, setBump] = useState(0)
    let dbmeta = woqlClient.databaseInfo() || {}
    const [assetRecord, setAssetRecord] = useState(dbmeta)

    let WOQL = TerminusClient.WOQL

    useEffect(() => {
        if(branches) load_assets()
    }, [branches])

    useEffect(() => {
        setDBAction({clone: cloning, sync: false, delete:false})
    }, [cloning])


    async function load_assets(){
        let nkstate = await refreshDBRecord()
        if(nkstate.remote_url){
            /*
            * call the remote server for add details at the database info
            */
            await refreshRemoteURL(nkstate.remote_url)
            /*
            * force refresh
            */
            setBump(bump+1)
            setAssetRecord(woqlClient.databaseInfo())
        }
        else {
            setAssetRecord(nkstate)
        }
    }

    function toggle(){
        setCloning(!cloning)
    }

    function onClone(id, org, doc){
        setCloning(false)
        let oldie = woqlClient.databaseInfo()
        let nu = {
            id: id,
            organization: org,
            label: doc.label,
            comment: doc.comment,
            type: "local_clone"
        }
        nu.remote_record = oldie;
        let dbs = woqlClient.databases()
        dbs.push(nu)
        let ostate = assetRecord
        var nkstate = {}
        for(var k in ostate){
            if(k == "label" || k == "id" || k == "comment") nkstate[k] = nu[k]
            else nkstate[k] = ostate[k]
        }
        refreshDBRecord(id, org).then(() => {
            goDBHome(id, org)
            updateBranches()
            woqlClient.db(id)
            //console.log("woqlClient.databaseInfo()", woqlClient.databaseInfo())
            setAssetRecord(woqlClient.databaseInfo())
        })
    }

    if(!branches) return null
    return (<>
        <DBHomeNavTab meta={assetRecord} user={woqlClient.user()} setDBAction={setDBAction} repos={repos}/>
        <main className="console__page__container console__page__container--width">
            <div>
                <Row key="rr">
                    <DBFullCard meta={assetRecord} bump={bump} onClone={toggle} user={woqlClient.user()}/>
                </Row>
                {dbAction.clone &&
                    <Row key="rc">
                        <CloneLocal onClone={onClone} meta={assetRecord} onCancel={toggle} woqlClient={woqlClient} setDBAction={setDBAction}/>
                    </Row>
                }
                {dbAction.sync && <Synchronize setDBAction={setDBAction}/>}
                {!cloning && <>
                    {/*<Row className="scoped-details-row">
                         <ScopedDetails />
                    </Row>*/}
                    <DocumentPage />
                    {/*<Row key="rd">
                        <CommitLog />
                    </Row>*/}
                </>}
            </div>
        </main>
       </>
    )
}

//<LatestUpdates />
