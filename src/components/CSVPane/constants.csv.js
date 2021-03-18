import TerminusClient from '@terminusdb/terminusdb-client'

export const PREVIEW='Preview'
export const REMOVE='Remove'
export const SHOW='Show Contents'
export const DOWNLOAD='Download'
export const DELETE='Delete File'
export const UPLOAD='Upload File'
export const UPDATE='Update'
export const UPDATE_CSV='Update File'
export const COPY_CSV_ID="Copy File ID"
export const CREATE_NEW='Create New Document'

export const CSV_ROWS="csv-rows"

export const CONTROLS_TEXT="db-info csv-item-title csv-control-spacing"
export const CONTROLS_SPAN_CSS="db-card-credit csv-act"
export const DUPLICATE_SPAN_CSS="db-card-credit csv-duplicate"
export const CONTROLS_ICONS="db_info_icon_spacing csv_icon_spacing"
export const CSV_MAIN_ACTION_CSS="tdb__button__base tdb__button__base--bgreen upload-csv-btn"

export const CREATE_DB_VIEW="create"
export const DOCUMENT_VIEW="document"
export const DOCUMENT_VIEW_FRAGMENT="Document Fragment"

export const DEFAULT_COMMIT_MSG="Adding/ Updating a csv to database"

export const DOCTYPE_CSV="terminusdb:///schema#CSV"

export const DOWNLOAD_ENTIRE_FILE="Download entire file"
export const DOWNLOAD_SNIPPET="Download snippet of the file"

export const ACCEPT_CSV_TYPE=".csv"
export const ACCEPT_JSON_JSONLD_TYPE=".json, .jsonld"
export const ACCEPT_MULTI_FILE_TYPES=".csv, .json, .jsonld"

export const CSV_FILE_TYPE="csv"
export const JSON_FILE_TYPE="json"
export const JSON_LD_FILE_TYPE="jsonld"

export const SELECT_CUSTOM_STYLES = {
  control: base => ({
	...base,
	height: "30px"
  }),
  valueContainer: (base) => ({
	...base,
	height: "30px"
  })
};
