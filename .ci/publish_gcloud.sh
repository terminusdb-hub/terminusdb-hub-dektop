BRANCH=$1
gsutil cp -r console/dist/* "gs://cdn.terminusdb.com/js_libs/terminusdb_hub_console/${BRANCH}/"
