#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");

const options = yargs
  .usage("Usage: -s <stage> -d ")
  .option("s", {
    alias: "stage",
    describe: "Stage",
    type: "string",
    demandOption: true
  })
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
const urlGitlab = `Repository URL, ${options.urlGitlab}`

console.log(nameRepository);
console.log(numberMergueRequest);
console.log(urlGitlab);


const projectRepository = async (options) => {
  const url_repository = `https://${options.urlGitlab}/api/v4/projects?search=${options.nameRepository}`;
  console.log("URL busqueda en repositorio "+url_repository);

  return await axios.get(url_repository, {
    headers: {
      // 'Content-Type': 'application/json',
      'PRIVATE-TOKEN': `${options.tokenGitlab}`
    }
  }, {});
}


const commentRepository = async (options) => {
  const url_repository_comment = `https://${options.urlGitlab}/api/v4/projects/${options.idProject}/merge_requests/${options.numberMergueRequest}/notes`;
  console.log(url_repository_comment)
  return await axios.post(url_repository_comment, {}, {
    params:{
      body:`${options.stage}`
    },
    headers: {
      'PRIVATE-TOKEN': `${options.tokenGitlab}`
    }
  });
}

if (options.nameRepository && options.numberMergueRequest && options.tokenGitlab && options.urlGitlab && options.stage) {

  projectRepository(options).then((x) => {
   //  options.idProject = x.data[0].id;
    const data = x.data;
    
    for(let i = 0; i< data.length ; i++){
       if(data[i].namespace.id != 101  && data[i].namespace.id != 105 ){
         options.idProject = data[i].id;
	 break;
       }
    }
   
    console.log("ID Project "+options.idProject);
    commentRepository(options).then((y) => {
      console.log("comment merge requests ...s")
    })
  });
}  
