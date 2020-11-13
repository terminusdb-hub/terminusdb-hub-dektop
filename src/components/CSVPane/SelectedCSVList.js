import React, {useState, useEffect} from 'react'
import * as action from "./constants.csv"
import {Row, Col} from "reactstrap"
import {WOQLClientObj} from '../../init/woql-client-instance'
import { TERMINUS_SUCCESS, TERMINUS_ERROR, TERMINUS_WARNING, TERMINUS_COMPONENT} from '../../constants/identifiers'
import {AiOutlineFolderView, AiFillBuild, AiOutlineEdit} from "react-icons/ai"
import {MdSlideshow} from "react-icons/md"
import {BiUpload} from "react-icons/bi"
import {TiDeleteOutline} from "react-icons/ti"
import {convertStringsToJson} from '../../utils/helperFunctions';
import {DOCUMENT_VIEW, DEFAULT_COMMIT_MSG} from "./constants.csv"
import {readLines, isObject} from "../../utils/helperFunctions"
import {TerminusDBSpeaks} from '../../components/Reports/TerminusDBSpeaks'
import {ManageDuplicateCsv} from "./ManageDuplicateCSV"
import {formatBytes} from "../../utils/format"
import {printts, DATETIME_DATE} from '../../constants/dates'

export const SelectedCSVList = ({csvs, page, setLoading, preview, setPreview, setCsvs, availableCsvs}) => {
	let currentFile={}, availableCsvList=[]
	const [actionFiles, setActionFiles]=useState([])
	const [commitMsg, setCommitMsg]=useState(DEFAULT_COMMIT_MSG)
	const [report, setReport]=useState(false)
	const {woqlClient}=WOQLClientObj()

	function constructActionForFiles(csvs){
		const fArr=[]
		csvs.map(item=>{
			fArr.push({name: item.name, action:action.CREATE_NEW})
		})
		return fArr
	}

	useEffect(() => {
		const fArr=constructActionForFiles(csvs)
		setActionFiles(fArr)
	}, [csvs])


	const viewPreview=(e)=>{
		let maxlines=6, buff=[] // read 6 lines
		const fileName = e.target.id
		currentFile.fileName=fileName
		const file = csvs.filter(item => item.name == fileName)
	    readLines(file[0], maxlines, function(line) {
			buff+=line
	    }, function onComplete() {
			convertToJson(buff)
	    });
	}

	const convertToJson = (content) => {
		let limitedData = []
		const jsonRes=convertStringsToJson(content)
		for(var item in jsonRes) {
			limitedData.push(jsonRes[item])
		}
		setLoading(false)
		setPreview({show: true, fileName: currentFile.fileName, data: limitedData});
	};


	const removeCsv=(e)=>{
		const fileName = e.target.id
		setCsvs(csvs.filter(item => item.name !== fileName));
		if(preview.fileName==fileName)
			setPreview({show: false, fileName:false, data:[]})
	}

	function process_error(err, update_start, message){
        setReport({
            error: err,
            status: TERMINUS_ERROR,
            message: message,
            time: Date.now() - update_start,
        })
        console.log(err)
    }

	const handleUpload=(e) => {
		let update_start = Date.now(), updateFiles=[], insertFiles=[]
        update_start = update_start || Date.now()
		let chonsenUpdates=actionFiles.filter(item => item.action === action.UPDATE)
		let chosenInserts=actionFiles.filter(item => item.action === action.CREATE_NEW)
		csvs.map(item=>{
			chonsenUpdates.map(el=>{
				if(item.name === el.name)
					updateFiles.push(item)
			})
		})
		csvs.map(item=>{
			chosenInserts.map(el=>{
				if(item.name === el.name)
					insertFiles.push(item)
			})
		})
		if(updateFiles.length>0){
			woqlClient.updateCSV(updateFiles , commitMsg, null, null).then((results) => {
				setReport({status: TERMINUS_SUCCESS, message: "Successfully updated files "})
				setCsvs([]);
			})
			.catch((err) => process_error(err, update_start, "Failed to update file"))
			.finally(() => setLoading(false))
		}
		if(insertFiles.length>0){
			woqlClient.insertCSV(insertFiles , commitMsg, null, null).then((results) => {
				setReport({status: TERMINUS_SUCCESS, message: "Successfully added files "})
				setCsvs([]);
			})
			.catch((err) => process_error(err, update_start, "Failed to add file"))
			.finally(() => setLoading(false))
		}
	}

	function handleAction(changeEvent){
		const [chosenFileName, chosenAction]=changeEvent.target.id.split('/')
		actionFiles.map(item=>{
			if(item.name==chosenFileName){
				item.action=chosenAction
			}
		})
	}

	const handleInsertChange = (e) => {
		let el=document.getElementById(e.target.id)
		el.checked=true
		handleAction(e)
	}

	const handleUpdateChange = (e) => {
		let el=document.getElementById(e.target.id)
		el.checked=true
		handleAction(e)
	}

	const List=()=>{
		return (csvs.map( item => <>
					<Row style={{width: "100%"}} className={action.CSV_ROWS}>
						<Col md={3}>
							<AiOutlineFolderView color={"#0055bb"} className="db_info_branch_icon"/>
							<span className="csv-item-title">{item.name}</span>
						</Col>
						<Col md={1}>
							<AiFillBuild color={"#0055bb"} className="db_info_branch_icon"/>
							<span className="csv-item-title">{formatBytes(item.size)}</span>
						</Col>
						<Col md={1}>
							<AiOutlineEdit color={"#0055bb"} className="db_info_branch_icon"/>
							<span className="csv-item-title">{printts(item.lastModified, DATETIME_DATE)}</span>
						</Col>
						{(page==DOCUMENT_VIEW) && <>
							<Col md={2}>
								<label className={action.CONTROLS_TEXT}>
									<input type="radio" value={action.CREATE_NEW}
										name={item.name}
										id={item.name + '/' + action.CREATE_NEW}
										onChange={handleInsertChange}/>
										{action.CREATE_NEW}
								</label>
							</Col>
							<Col md={1.5}>
								<label className={action.CONTROLS_TEXT}>
									<input type="radio" value={action.UPDATE}
										name={item.name}
										onChange={handleUpdateChange}
										id={item.name + '/' + action.UPDATE}/>
										{action.UPDATE}
								</label>
							</Col>
						</>}
						<Col md={2}>
							<span id={item.name} onClick={viewPreview} className="db-card-credit csv-act">
								<MdSlideshow id={item.name} color="#0055bb" className={action.CONTROLS_ICONS}/>
								<span className={action.CONTROLS_TEXT} id={item.name}>{action.PREVIEW}</span>
							</span>
						</Col>
						<Col md={2}>
							<span id={item.name} onClick={removeCsv} className={action.CONTROLS_SPAN_CSS}>
								<TiDeleteOutline id={item.name} color="#721c24" className={action.CONTROLS_ICONS}/>
								<span className={action.CONTROLS_TEXT} id={item.name}>{action.REMOVE}</span>
							</span>
						</Col>
					</Row>
					{(page==DOCUMENT_VIEW) && availableCsvs.map(acv => <>
						{acv==item.name && <ManageDuplicateCsv fileName={item.name} setLoading={setLoading} csvs={csvs} setCsvs={setCsvs}/>}
					</>)}
				</>))
	}

	return(<>
			<Row className="generic-message-holder">
				{report && <TerminusDBSpeaks report={report}/>}
			</Row>
			<List/>
			{(page==DOCUMENT_VIEW) && <Row className="upload-row">
				<Col md={6}>
				</Col>
				<Col md={4}>
					<input class="commit-log-input" type="text" placeholder="Enter message for commit log" width="40"
						onChange={(e) => setCommitMsg(e.target.value)}/>
				</Col>
				<Col md={2}>
					<button onClick={handleUpload} class={action.CSV_MAIN_ACTION_CSS}>
						{action.UPLOAD}
					</button>
				</Col>
			</Row>}
		</>
	)
}
