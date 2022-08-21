#!/usr/bin/env node

const yargs = require("yargs");
const { Gitlab } = require("@gitbeaker/node");

const options = yargs
    .usage("Usage: -s <stage>")
    .option("s", {
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



function connectGitlab(options) {
    return new Gitlab({ host: options.host, token: process.env.TOKEN_GIT })
}

function gitlabComment(options) {
    var gitlab = connectGitlab(options);
    gitlab.Namespaces.all({ search: process.env.DRONE_REPO_NAMESPACE }).then(function (n) {
        var namespace = n.filter((x) => x.full_path == process.env.DRONE_REPO_NAMESPACE)[0]
        console.log(namespace)
        if (namespace) {
            gitlab.Projects.all({ search: process.env.DRONE_REPO_NAME }).then(function (p) {
                var project = p.filter((y) => y.namespace.id == namespace.id)[0]
                console.log(project)
                if (project) {
                    gitlab.MergeRequestNotes.create(project.id, process.env.DRONE_PULL_REQUEST, options.message).then(function (mr) {
                        console.log(mr)
                    })
                }

            })
        }
    })
}

function gitlabAccepted(options) {
    var gitlab = connectGitlab(options);
    gitlab.Namespaces.all({ search: process.env.DRONE_REPO_NAMESPACE }).then(function (n) {
        var namespace = n.filter((x) => x.full_path == process.env.DRONE_REPO_NAMESPACE)[0]
        console.log(namespace)
        if (namespace) {
            gitlab.Projects.all({ search: process.env.DRONE_REPO_NAME }).then(function (p) {
                var project = p.filter((y) => y.namespace.id == namespace.id && y.name == process.env.DRONE_REPO_NAME)[0]
                console.log(project)
                if (project) {
                    gitlab.MergeRequests.accept(project.id, process.env.DRONE_PULL_REQUEST).then(function (mr) {
                        console.log(mr)
                    })
                }

            })
        }
    })
}

var command = {
    'gitlab-comment': gitlabComment,
    'gitlab-accepted': gitlabAccepted
}
if (options.stage && command[options.stage]) {
    command[options.stage](options)
} else {
    console.log("no command : " + options.stage)
}
