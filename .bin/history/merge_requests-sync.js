#!/usr/bin/env node

const yargs = require("yargs");
const axios = require("axios");
const https = require('https');
const qs = require('qs');

const agent = new https.Agent({
    rejectUnauthorized: false
});

const options = yargs
    .usage("Usage: -s <stage>")
    .option("s", {
        alias: "stage",
        describe: "Stage",
        type: "string",
        demandOption: true
    }).argv;

const namespaceRepository = `Repository Namespace, ${process.env.DRONE_REPO_NAMESPACE}`;
const nameRepository = `Repository Name, ${process.env.DRONE_REPO_NAME}`;
const numberMergueRequest = `Number merge request, ${process.env.DRONE_PULL_REQUEST}`;

console.log(options)
const projectRepository = async () => {
    const url_repository = `https://digital.gyt.com.gt/gitlab/api/v4/projects?search=${process.env.DRONE_REPO_NAME}`;
    return await axios.get(url_repository, {
        httpsAgent: agent,
        headers: {
            'PRIVATE-TOKEN': `${process.env.TOKEN_GITLAB}`
        }
    }, {});
}

const obtaintMergueRequest = async () => {
    const url_repository_comment = `https://digital.gyt.com.gt/gitlab/api/v4/projects/${options.idProject}/merge_requests/${process.env.DRONE_PULL_REQUEST}`;
    return await axios.get(url_repository_comment, {
        httpsAgent: agent,
        headers: {
            'PRIVATE-TOKEN': `${process.env.TOKEN_GITLAB}`
        }
    });
}

const acceptedMergueRequest = async () => {
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

function validateMergueRequest(mergueRequest) {
    var target = {
        valid: true,
        branch: null
    };
    if (options.stage == mergueRequest.target_branch && mergueRequest.target_branch == 'master') {
        if (mergueRequest.source_branch.indexOf('release/') > -1 || mergueRequest.source_branch.indexOf('hotfix/') == -1) {
            target.valid = false;
            target.branch = mergueRequest.source_branch;
        }
    } else if (options.stage == mergueRequest.target_branch && mergueRequest.target_branch == 'develop') {
        if (mergueRequest.source_branch.indexOf('feature/') == -1) {
            target.valid = false;
            target.branch = mergueRequest.source_branch;
        }
    }

    return target;

}

const obtaintToken = async () => {

    if (process.env.CLIENT_ID != null && process.env.CLIENT_SECRET != null && process.env.USERNAME != null && process.env.PASSWORD != null) {
        var data = qs.stringify({
            'grant_type': 'password',
            'username': `${process.env.USERNAME}`,
            'password': `${process.env.PASSWORD}`,
            'client_id': `${process.env.CLIENT_ID}`,
            'client_secret': `${process.env.CLIENT_SECRET}`
        });
        var config = {
            method: 'post',
            url: `https://segurosgyt.com.gt/api/iam/auth/realms/operation/protocol/openid-connect/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        return await axios(config);
    }
}

const authorizeSync = async (token, mergeRequest) => {
    return await axios.post(`https://digital.gyt.com.gt/private/api/deploy-sync/pipeline/authorize`, {
        "environment": process.env,
        "mergeRequest": mergeRequest
    }, {
        httpsAgent: agent,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}

function pushWebhook(target, mergeRequest) {
    obtaintToken().then((t) => {
        console.log(t.data.access_token)
        authorizeSync(t.data.access_token, mergeRequest).then((a) => {
            console.log(a.data)
        })
    });
}

if (process.env.TOKEN_GITLAB) {

    projectRepository().then((x) => {
        options.idProject = 0;
        for (let i = 0; i < x.data.length; i++) {
            if (`${process.env.DRONE_REPO_NAMESPACE}/${process.env.DRONE_REPO_NAME}` === x.data[i].path_with_namespace) {
                options.idProject = x.data[i].id;
                break
            }
        }
        obtaintMergueRequest().then((y) => {
            var target = validateMergueRequest(y.data);
            if (target.valid) {
                pushWebhook(target, y.data);
            }
        });
    });
}