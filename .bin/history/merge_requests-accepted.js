#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");
const https = require('https');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

const options = yargs
  .usage("Usage: -s <stage> -d ")
  .option("d", {
    alias: "urlGitlab",
    describe: "URL gitlab",
    type: "string",
    demandOption: true
  })
  .option("t", {
    alias: "tokenGitlab",
    describe: "Token gitlab",
    type: "string",
    demandOption: true
  })
  .option("r", {
    alias: "nameRepository",
    describe: "Name Repository",
    type: "string",
    demandOption: true
  })
  .option("mr", {
    alias: "numberMergueRequest",
    describe: "Number Mergue Request",
    type: "string",
    demandOption: true
  })
  .argv;


const nameRepository = `Repository Name, ${options.nameRepository}`;
const numberMergueRequest = `Number merge request, ${options.numberMergueRequest}`;

console.log(nameRepository);
console.log(numberMergueRequest);

const projectRepository = async (options) => {
  const url_repository = `https://${options.urlGitlab}/api/v4/projects?search=${options.nameRepository}`;
  return await axios.get(url_repository, {
    httpsAgent: agent,
    headers: {
      'PRIVATE-TOKEN': `${options.tokenGitlab}`
    }
  }, {});
}

const obtaintMergueRequest = async (options) => {
  const url_repository_comment = `https://${options.urlGitlab}/api/v4/projects/${options.idProject}/merge_requests/${options.numberMergueRequest}`;
  console.log(url_repository_comment);
  return await axios.get(url_repository_comment, {
    httpsAgent: agent,
    headers: {
      'PRIVATE-TOKEN': `${options.tokenGitlab}`
    }
  });
}

const acceptedMergueRequest = async (options) => {
  const url_repository_comment = `https://${options.urlGitlab}/api/v4/projects/${options.idProject}/merge_requests/${options.numberMergueRequest}/merge`;
  return await axios.put(url_repository_comment, {
    "id": options.idProject,
    "merge_request_iid": parseInt(options.numberMergueRequest),
    "should_remove_source_branch": true,
    "merge_when_pipeline_succeeds": true
  }, {
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': `${options.tokenGitlab}`
    }
  });
}

if (options.nameRepository && options.numberMergueRequest && options.tokenGitlab && options.urlGitlab ) {

  projectRepository(options).then((x) => {
    options.idProject = 1//; 
    //x.data[0].id;
     const data = x.data;
    //console.log(data);
    for(let i = 0; i< data.length ; i++){
       if(data[i].namespace.id != 101  && data[i].namespace.id != 105){
         options.idProject = data[i].id;
         break;
       }
    }

    obtaintMergueRequest(options).then((y) => {

      //console.log("===========================================");
      //console.log(y);
      //if (y.data.state === 'opened') {
        acceptedMergueRequest(options).then((z) => {})
     // }
    })
  });
}
