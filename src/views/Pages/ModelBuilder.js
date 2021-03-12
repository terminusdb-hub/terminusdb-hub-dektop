import React,{useState, useEffect} from 'react';
import {SchemaBuilder,modelCallServerHook,GraphObjectProvider} from '@terminusdb/terminusdb-react-components';
import TerminusClient from '@terminusdb/terminusdb-client'
import { SimplePageView} from '../Templates/SimplePageView'
import {WOQLClientObj} from '../../init/woql-client-instance'
import { ConsoleNavbar } from "../../components/Navbar/ConsoleNavbar";
import {DBContextObj} from '../../components/Query/DBContext'
import {NoPageLayout} from '../../components/Router/PrivateRoute'
import Loading from '../../components/Reports/Loading'
import {TerminusDBSpeaks} from '../../components/Reports/TerminusDBSpeaks'
import {AiOutlineBuild, AiOutlineShareAlt} from 'react-icons/ai';
import {HiOutlineDotsCircleHorizontal} from "react-icons/hi"
import {BiNetworkChart} from "react-icons/bi"
import {PREFIXES_TAB, OWL_TAB, GRAPHS_TAB, SCHEMA_BUILDER_TAB, DEFAULT_SCHEMA_VIEW, CONSOLE_PAGE_OVERFLOW_CSS,
    CONSOLE_PAGE_OVERFLOW_HIDE_CSS} from '../../views/Pages/constants.pages'
import {PrefixManager} from '../Schema/PrefixManager'
import {OWL} from '../Schema/OWL'
import {Properties} from '../Schema/Properties'

export const ModelBuilder = (props) =>{
    const { woqlClient } = WOQLClientObj()
    const {graphs, setHead, branch, report, ref, prefixesLoaded} = DBContextObj()
    const [tools, setTools]=useState([])
    const [viewer, setViewer]=useState([])
    const [pageCss, setPageCss]=useState(CONSOLE_PAGE_OVERFLOW_HIDE_CSS)

    const [view, setView]=useState(DEFAULT_SCHEMA_VIEW)

    const [graphFilter, setGraphFilter] = useState()

    useEffect(() => {
        if (graphs) {
            if (graphFilter) {
                let fi = updateFilter()
                setGraphFilter(fi)
            } else {
                setGraphFilter()
            }
            //getDefaultSchemaFilter
        }
    }, [graphs])


    const dbName = woqlClient ? woqlClient.db() : ''
    const {mainGraphDataProvider,
          saveGraphChanges,
          reportMessage,
          callServerLoading,resetReport
          } = modelCallServerHook(woqlClient,branch,ref)

    const saveData=(query,commitMessage)=>{
      saveGraphChanges(query,commitMessage)
    }

    if(graphs && graphs['schema/main']===undefined){
      return  <NoPageLayout noLoginButton={true} text="There is no main schema graph." />
    }


    function getDefaultSchemaFilter() {
        let t = false
        let id = false
        for (var key in graphs) {
            if (graphs[key].type == 'schema') {
                if (t == 'schema') {
                    return {type: 'schema', id: '*'}
                } else {
                    t = 'schema'
                    id = graphs[key].id
                }
            } else if (graphs[key].type == 'inference') {
                if (t == 'inference') {
                    id = '*'
                } else if (t != 'schema') {
                    t = 'inference'
                    id = graphs[key].id
                }
            }
        }
        if (t && id) return {type: t, id: id}
        return undefined
    }

    function getDefaultInstanceFilter() {
    	let cand = false;
    	for (var key in graphs) {
    		if (graphs[key].type == 'schema'){
    			if(!cand || cand.type != 'schema' || graphs[key].id == "main"){
    				cand = graphs[key]
    			}
    		}
    		if (graphs[key].type == 'inference'){
    			if(!cand || cand.type == 'instance'){
    				cand = graphs[key]
    			}
    		}
    		if (graphs[key].type == 'instance'){
    			if(!cand){
    				cand = graphs[key]
    			}
    		}
    	}
    	if(cand) return cand
    	return {type: "instance", id: "main"}
    }

    function schemaUpdated() {
    	setHead(branch)
    }

    function prefixesUpdated() {
    	console.log('prefixes updated')
    }

    function graphFilterChanged(newFilter) {
    	setGraphFilter(newFilter)
    }


    const getOWL = () => {
    	let igraph = (graphFilter ? graphFilter : getDefaultInstanceFilter())
        setViewer(<OWL key="ow" graph={igraph} onChangeGraph={graphFilterChanged} onUpdate={schemaUpdated} />)
        setView(OWL_TAB)
        setPageCss(CONSOLE_PAGE_OVERFLOW_CSS)
    }

    const getPrefixes = () => {
        setViewer(<PrefixManager key="pr" onUpdate={prefixesUpdated} />)
        setView(PREFIXES_TAB)
        setPageCss(CONSOLE_PAGE_OVERFLOW_CSS)
    }

    const getModelBuilder = () => {
        setViewer()
        setView(DEFAULT_SCHEMA_VIEW)
        setPageCss(CONSOLE_PAGE_OVERFLOW_HIDE_CSS)
    }

    const getProperties = () => {
        //if (getDefaultSchemaFilter()) {
            let scgraph = (graphFilter && graphFilter.type !== "instance" ? graphFilter : getDefaultSchemaFilter())
            setViewer(<Properties key="pr" graph={scgraph} onChangeGraph={graphFilterChanged}/>)
            setView(GRAPHS_TAB)
            setPageCss(CONSOLE_PAGE_OVERFLOW_CSS)
        //}
    }

    useEffect (() => {
        setTools([<div className="tdb__model__hright">
            <div className="icon-header" >
               <BiNetworkChart title={SCHEMA_BUILDER_TAB} viewer={viewer} view={DEFAULT_SCHEMA_VIEW} onClick={getModelBuilder}/>
            </div>
            <div className="icon-header" >
               <AiOutlineBuild title={OWL_TAB} view={OWL_TAB} viewer={viewer} onClick={getOWL}/>
            </div>
            <div className="icon-header" >
                <HiOutlineDotsCircleHorizontal title={PREFIXES_TAB} view={PREFIXES_TAB} viewer={viewer} onClick={getPrefixes}/>
            </div>
            <div className="icon-header" >
                <AiOutlineShareAlt title={GRAPHS_TAB} view={GRAPHS_TAB} viewer={viewer} onClick={getProperties}/>
            </div>
       </div>])
    }, [branch])

    return (
       <div id={props.id} className={pageCss} id="terminus-console-page">
            <ConsoleNavbar onHeadChange={props.onHeadChange} />
            {reportMessage &&
              <div className="tdb__model__message">
                <TerminusDBSpeaks  report={reportMessage} onClose={resetReport}/>
              </div>}


              {graphs && graphs['schema/main']!==undefined &&
                <>
                    <GraphObjectProvider mainGraphDataProvider={mainGraphDataProvider} dbName={dbName}>
                        <SchemaBuilder saveGraph={saveData} dbName={dbName} extraTools={tools} view={view}/>
                    </GraphObjectProvider>
                    {view !== DEFAULT_SCHEMA_VIEW && <div>{viewer}</div>}
                </>
              }
              {callServerLoading && <Loading/>}

        </div>
      )
}
