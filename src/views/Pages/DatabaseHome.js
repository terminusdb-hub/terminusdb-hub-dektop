import React from "react";
import { DETAILS_TAB } from "./constants.pages"
import { MonitorDB } from '../DBHome/MonitorDB'
import {PageView} from '../Templates/PageView'
import {DBHomeNavTab} from "../DBHome/DBHomeNavTab"
import {ConsoleNavbar} from "../../components/Navbar/ConsoleNavbar";

const DatabaseHome = (props) => {

    /*
    * to be review the template SimpleView
    * move the navbar
    */
    return <div className="console__page h-100 d-page-overflow" id="terminus-console-page">
        <ConsoleNavbar onHeadChange={props.onHeadChange}/>
        <MonitorDB key="monitor" label={DETAILS_TAB} />
    </div>

    /*return (
            <PageView report={props.report} dbPage={true}>
               <MonitorDB key="monitor" label={DETAILS_TAB} />
            </PageView>
	)*/
}
export default DatabaseHome;
