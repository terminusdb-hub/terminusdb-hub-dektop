import React from "react";
import { Router, Route, Switch, useRouteMatch } from "react-router-dom";
import { Container } from "reactstrap";
import { localSettings } from "./localSettings"
import {Row,Grid} from "react-bootstrap"
import TerminusClient from '@terminusdb/terminus-client';
import * as consoleLib from '@terminusdb/terminusdb-console';

const App = (props) => {
  const { loadingServer, clientError, woqlClient} = consoleLib.WOQLClientObj();

  if (clientError) return <consoleLib.ErrorPage/>;
  if (loadingServer) return <consoleLib.Loading/>;

  return (

        <Router history={consoleLib.history}>
            <Switch>
                <Route path = "/" exact component = {consoleLib.ServerHome} />
                <Route path = {consoleLib.NEW_DB_PAGE.page} component = {consoleLib.CreateDatabase} />
                <Route path = {consoleLib.SERVER_HOME_PAGE.page} component = {consoleLib.ServerHome} />
                <Route path = {consoleLib.NEW_DB_PAGE.page} component = {consoleLib.CreateDatabase} />
                <Route path = {consoleLib.PROFILE_PAGE.page} component = {consoleLib.Profile} />
                <Route component={DBPages} path={consoleLib.DB_HOME_PAGE.page} />
            </Switch>
        </Router>

  );
};

//paths = /db/account/dbid/$PAGE
const DBPages = () => {
    const {setDatabase, setAccount} = consoleLib.WOQLClientObj();

    let match = useRouteMatch();
    let direction = match.params[0]
    let parts = direction.split("/")
    let page = ""
    let account = ""
    let dbid = ""

    if(parts[0] == "terminus"){
        dbid = parts[0]
        page = parts[1] || ""
    }
    else {
        account = parts[0]
        dbid = parts[1]
        page = parts[2] || ""
    }

    setDatabase(dbid)
    setAccount(account)

    if(page == consoleLib.SCHEMA_PAGE) return (
        <consoleLib.Schema />
    )
    else if(page == consoleLib.DOCUMENT_PAGE) return (
        <consoleLib.DocumentView />
    )
    else if(page == consoleLib.QUERY_PAGE) return (
        <consoleLib.Query />
    )
    return (
        <consoleLib.DatabaseHome/>
    )
}

export default App;
