#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");
const https = require('https');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

const options = yargs
  .usage("Usage: -s <stage> ")
  .option("s", {
    alias: "stage",
    describe: "Stage",
    type: "string",
    demandOption: true
  })
  .argv;

const namespaceRepository = `Repository Namespace, ${process.env.DRONE_REPO_NAMESPACE}`;
const nameRepository = `Repository Name, ${process.env.DRONE_REPO_NAME}`;
const numberMergueRequest = `Number merge request, ${process.env.DRONE_PULL_REQUEST}`;



console.log(namespaceRepository);
console.log(nameRepository);
console.log(numberMergueRequest);

const projectRepository = async (options) => {
  const url_repository = `https://digital.gyt.com.gt/gitlab/api/v4/projects?search=${process.env.DRONE_REPO_NAME}`;
  return await axios.get(url_repository, {
    httpsAgent: agent,
    headers: {
        'PRIVATE-TOKEN': `${process.env.TOKEN_GITLAB}`
    }
  }, {});
}

const obtaintMergueRequest = async (options) => {
  const url_repository_comment = `https://digital.gyt.com.gt/gitlab/api/v4/projects/${options.idProject}/merge_requests/${process.env.DRONE_PULL_REQUEST}`;
  console.log(url_repository_comment);
  return await axios.get(url_repository_comment, {
    httpsAgent: agent,
    headers: {
        'PRIVATE-TOKEN': `${process.env.TOKEN_GITLAB}`
    }
  });
}

const acceptedMergueRequest = async (options) => {
  const url_repository_comment = `https://digital.gyt.com.gt/gitlab/api/v4/projects/${options.idProject}/merge_requests/${process.env.DRONE_PULL_REQUEST}/merge`;
  return await axios.put(url_repository_comment, {
    "id": options.idProject,
    "merge_request_iid": parseInt(process.env.DRONE_PULL_REQUEST),
    "should_remove_source_branch": true,
    "merge_when_pipeline_succeeds": true
  }, {
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/json',
        'PRIVATE-TOKEN': `${process.env.TOKEN_GITLAB}`
    }
  });
}

function validateMergueRequest(options, mergueRequest){
  console.log(mergueRequest)
  if(options.stage == mergueRequest.target_branch && mergueRequest.target_branch == 'master' ){
    if(mergueRequest.source_branch.indexOf('release/') > -1 || mergueRequest.source_branch.indexOf('hotfix/') > -1 ){
      throw "wrong definition of branch : " + mergueRequest.source_branch;
    }
  }else if(options.stage == mergueRequest.target_branch && mergueRequest.target_branch == 'develop'){
    if(mergueRequest.source_branch.indexOf('feature/') > -1  ){
      throw "wrong definition of branch : " + mergueRequest.source_branch;  
    }
  }else{
    throw "wrong definition of branch : " + mergueRequest.target_branch;
  }
}

if (process.env.DRONE_REPO_NAME && process.env.DRONE_PULL_REQUEST && options.tokenGitlab && options.urlGitlab ) {

  projectRepository(options).then((x) => {
      options.idProject = 0;
      for(let i = 0; i< x.data.length ; i++){
        if(process.env.DRONE_REPO_NAMESPACE + '/'+ process.env.DRONE_REPO_NAME === x.data[i].path_with_namespace){
          options.idProject = x.data[i].id;
          break
        }
      }  
      obtaintMergueRequest(options).then((y) => {
        validateMergueRequest(options, y.data)
      });
  });
}
