import React, {useState, useEffect} from 'react'
import {Row, Col} from "react-bootstrap"
import {DBControls} from "../DBHome/DBFullCard"

export const DBHomeNavTab = ({meta, user, setDBAction, repos}) => {

	return (
		<div className="nav__main__wrap">
			<div className="tdb__model__header  db-home-page-doc-nav">
                <div className="tdb__model__hright"/>
				<div className="tdb__model__hright">
					<Row style={{width:"100%"}}>
                        <DBControls meta={meta} user={user} setDBAction={setDBAction} repos={repos}/>
					</Row>
				</div>
                <div className="tdb__model__hright"/>
                <div className="tdb__model__hright"/>
			</div>
		</div>
	)
}
