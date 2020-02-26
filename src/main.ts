import {NotificationMessage} from './NotificationMessage';
import {EventType} from "./enums";
import {schemaOnIssue, schemaOnIssueComment, schemaOnPullRequest, schemaOnPush} from "./eventPayloadSchemaBuilder";

const core = require ('@actions/core');
const path = require('path');
const https = require('https');
const { buildYup } = require('schema-to-yup');

const jsonPath = path.join(__dirname, 'resources', 'notification.json');
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const github_event_payload =  process.env.GITHUB_EVENT_PATH || jsonPath;
const trigger_event_name = process.env.GITHUB_EVENT_NAME;

let msteams_webhook_url;
let job_status;
let event_id;
let details;
let account;
let message;
let url;

const notificationMessage = function parse_event_to_message(event_payload_text: string) : NotificationMessage {
    let notificationMessage: NotificationMessage;
    try {
        // do not proceed if job was cancelled
        job_status = core.getInput('job_status');
        if (job_status.toUpperCase() === "CANCELLED") {
            console.log("Job was cancelled, no notification will be sent")
            process.exit(0);
        }

        msteams_webhook_url = core.getInput('webhook_url');
        event_id = core.getInput('event_id');
        let event_name : string = trigger_event_name || "event";

        if (event_id) {
            event_name = event_id;
        }

        switch(event_name){
            case EventType.PUSH:
                schemaOnPush.validate(event_payload_text).then(function(value) {
                    account = value.pusher.name;
                    message = `**Commit to GitHub** by ${account}`;
                    url = value.compare;
                    details = `Comment: ${value.head_commit.message}`;
                });
                break;
            case EventType.PR:
                schemaOnPullRequest.validate(event_payload_text).then(function(value) {
                    message =  `**PR submitted to Github**: ${value.pull_request.title}`;
                    url = value.pull_request.html_url;
                    details = `Pr for merging ref ${value.pull_request.head.ref} to base branch ${value.base.ref}`;
                });
                break;
            case EventType.ISSUE:
                schemaOnIssue.validate(event_payload_text).then(function(value) {
                    message = `**New/updated GitHub issue**: ${value.issue.title}`;
                    url = value.issue.html_url;
                    details = `Issue state: ${value.issue.state}  - assignee: ${value.issue.assignee}`;
                });
                break;
            case EventType.ISSUE_COMMENT:
                schemaOnIssueComment.validate(event_payload_text).then(function(value) {
                    message = `**A Github issue comment was posted**: ${value.comment.body}`;
                    url = value.issue.html_url;
                    details = `Issue state: ${value.issue.state}  - assignee: ${value.issue.assignee}`;
                });
                break;
            default:
                if (trigger_event_name) {
                    message = trigger_event_name.replace(/_/g, ".");
                } else {
                    message = "A GitHub Actions event has occurred"
                }
                url = `https://github.com/${repository}/actions`;
        }

        if (!details) {
            details = core.getInput('details');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
    notificationMessage = new NotificationMessage(account, message, url, details);
    return notificationMessage;
}


async function notifyTeams(notificationMessage: NotificationMessage) {
    const matches = msteams_webhook_url.match(/^https?\:\/\/([^\/?#]+)(.*)/i);
    const hostname_match = matches && matches[1];
    const path_match = matches && matches[2];

    let req_data = JSON.stringify(require(jsonPath));
    req_data  = req_data.replace(/GITHUB_WORKFLOW/g, `${workflow}`)
                        .replace(/GITHUB_REPOSITORY/g, `${repository}`)
                        .replace(/GITHUB_REF/g, `${branch}`)
                        .replace(/GITHUB_TRIGGER_EVENT_DETAILS/g, `${details}`)
                        .replace(/GITHUB_TRIGGER_EVENT/g, `${message}`)
                        .replace(/GITHUB_EVENT_URL/g, `${url}`)
                        .replace(/GITHUB_STATUS/g, `${job_status}`);

    const options = {
        hostname: `${hostname_match}`,
        port: 443,
        path: `${path_match}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': req_data.length
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode >= 400) {
            core.setFailed(`Action failed with status code  ${res.statusCode}`);
        } else {
            console.log(`statusCode: ${res.statusCode}`);
        }

        res.on('data', (d) => {
            process.stdout.write(d)
        })
    });

    req.on('error', (error) => {
        console.error(error);
        core.setFailed(`Action failed with error ${error}`);
    });

    req.write(req_data);
    req.end();
}

// set_notification_body();
notifyTeams(notificationMessage(JSON.stringify(require(github_event_payload))));
