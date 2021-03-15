import React, {useState, useEffect} from 'react'
import {Row, Col} from "react-bootstrap"
import {DBControls} from "../DBHome/DBFullCard"

export const DBHomeNavTab = ({meta, user, setDBAction, repos}) => {

	return (


        <DBControls meta={meta} user={user} setDBAction={setDBAction} repos={repos}/>

	)
}
