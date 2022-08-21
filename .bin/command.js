#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");

(() => {

    yargs.scriptName("webhook")
        .usage("$0 <cmd> <args>")
        .command('request', 'Arguments type AxiosRequestConfig', (yargs) => {

            yargs.positional('config', {
                default: 'AxiosRequestConfig',
                describe: 'Arguments type AxiosRequestConfig'
            })
        }, function (argv) {
            axios(argv.config)
                .then(function (response) {
                    console.log(JSON.stringify(
                        {
                            data: response.data,
                            status: response.status,
                            headers: response.headers
                        }))
                })
                .catch(function (error) {
                    if (error.response) {
                        console.log(JSON.stringify(
                            {
                                data: error.response.data,
                                status: error.response.status,
                                headers: error.response.headers
                            }))

                    }
                });
        })
        .help()
        .argv
    /*  
    .option("config", {
        alias: "stage",
        describe: "Stage",
        type: "string",
        demandOption: true
    })
    .option("m", {
        alias: "message",
        describe: "Message",
        type: "string",
        demandOption: false
    })
    .option("h", {
        alias: "host",
        describe: "Host Gitlab",
        type: "string",
        demandOption: true
    }).argv;


var command = {
    'gitlab-comment': gitlabComment,
    'gitlab-accepted': gitlabAccepted
}
if (options.stage && command[options.stage]) {
    command[options.stage](options)
} else {
    console.log("no command : " + options.stage)
}*/
})()