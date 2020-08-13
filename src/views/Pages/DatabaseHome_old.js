import React ,{useState}from "react";
import { DETAILS_TAB, SYNCHRONISE_TAB, MANAGE_TAB } from "./constants.pages"
import { DB_SYNCHRONISE, DB_MANAGE } from "../../constants/routes"
import { MonitorDB } from '../DBHome/MonitorDB'
import { Synchronise } from '../DBCollaborate/Synchronise'
import { ManageDB}  from '../DBManage/ManageDB'
import { TabbedPageView } from '../Templates/TabbedPageView'
import {WOQLClientObj} from '../../init/woql-client-instance'
import {DBNavbar} from '../../components/Navbar/DBNavbar'
import {SimplePageView} from '../Templates/SimplePageView'


const DatabaseHome = (props) => {
    const { woqlClient, contextEnriched } = WOQLClientObj()
    if(!woqlClient) return null
    let db = woqlClient.get_database()
    var sections = []
    var tabs = []
    if(props.page == DB_SYNCHRONISE && db.remote_url){
        sections = [ 
            {id: DB_SYNCHRONISE, label: SYNCHRONISE_TAB },
            {id: "/" , label: DETAILS_TAB}, 
            {id: DB_MANAGE, label: MANAGE_TAB}, 
        ]
        tabs.push(<Synchronise key="synchronise" label={SYNCHRONISE_TAB} />)
        tabs.push(<MonitorDB key="monitor" label={DETAILS_TAB} />)
        tabs.push(<ManageDB key="manage" label={MANAGE_TAB}/>)
    }
    else if(props.page == DB_MANAGE){
        sections = [ 
            {id: DB_MANAGE, label: MANAGE_TAB}, 
            {id: "/" , label: DETAILS_TAB}, 
        ]
        tabs.push(<ManageDB key="manage" label={MANAGE_TAB}/>)
        tabs.push(<MonitorDB key="monitor" label={DETAILS_TAB} />)
        if(db && db.remote_url){
            sections.push({id: DB_SYNCHRONISE, label: SYNCHRONISE_TAB }) 
            tabs.push(<Synchronise key="synchronise" label={SYNCHRONISE_TAB} />)
        }
    }
    else {
        sections = [ 
            {id: "/" , label: DETAILS_TAB}, 
            {id: DB_MANAGE, label: MANAGE_TAB}, 
        ]
        tabs.push(<MonitorDB key="monitor" label={DETAILS_TAB} />)
        tabs.push(<ManageDB key="manage" label={MANAGE_TAB}/>)
        if(db && db.remote_url){
            sections.push({id: DB_SYNCHRONISE, label: SYNCHRONISE_TAB }) 
            tabs.push(<Synchronise key="synchronise" label={SYNCHRONISE_TAB} />)
        }
    }


    const [isTopOpen, setIsOpen] = useState(false)

    const topmenu =
        isTopOpen === true
            ? 'nav__main__center  nav__main__center--show'
            : 'nav__main__center nav__main__center--hide'

    return (  
        <SimplePageView sections={sections} active={props.page} report={props.report}>          
           <MonitorDB key="monitor" label={DETAILS_TAB} />
        </SimplePageView>        
	)
}
export default DatabaseHome;