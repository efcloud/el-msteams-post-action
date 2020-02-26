import {NotificationMessage} from './NotificationMessage';
import {EventType} from "./enums";
import {schemaOnIssue, schemaOnIssueComment, schemaOnPullRequest, schemaOnPush} from "./eventPayloadSchemaBuilder";

const core = require ('@actions/core');
const path = require('path');
const https = require('https');

const jsonPath = path.join(__dirname, '..', 'resources', 'notification.json');
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

const parsedNotificationMessage = async function parse_event_to_message(event_payload_text: string): Promise<NotificationMessage> {
    let notificationMessage: NotificationMessage;
    // let details;
    // let account;
    // let message;
    // let url;
    let parsedSchema;
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

        console.log(`Triggering tests for ${event_name}`);

        switch(event_name){
            case EventType.PUSH:
                await schemaOnPush.validate(event_payload_text);
                parsedSchema = schemaOnPush.cast(event_payload_text);
                account = parsedSchema.pusher.name;
                console.log("parsed account")
                message = `**Commit to GitHub** by ${account}`;
                url = parsedSchema.compare;
                details = `Comment: ${parsedSchema.head_commit.message}`;
                break;
            case EventType.PR:
                await schemaOnPullRequest.validate(event_payload_text);
                parsedSchema = schemaOnPullRequest.cast(event_payload_text);
                message =  `**PR submitted to Github**: ${parsedSchema.pull_request.title}`;
                url = parsedSchema.pull_request.html_url;
                details = `Pr for merging ref ${parsedSchema.pull_request.head.ref} to base branch ${parsedSchema.pull_request.base.ref}`;
                break;
            case EventType.ISSUE:
                await schemaOnIssue.validate(event_payload_text);
                parsedSchema = schemaOnIssue.cast(event_payload_text);
                message = `**New/updated GitHub issue**: ${parsedSchema.issue.title}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                // schemaOnIssue.validate(event_payload_text).then(function(value) {
                //     message = `**New/updated GitHub issue**: ${value.issue.title}`;
                //     url = value.issue.html_url;
                //     details = `Issue state: ${value.issue.state}  - assignee: ${value.issue.assignee}`;
                // });
                break;
            case EventType.ISSUE_COMMENT:
                await schemaOnIssueComment.validate(event_payload_text);
                parsedSchema = schemaOnIssueComment.cast(event_payload_text);
                message = `**A Github issue comment was posted**: ${parsedSchema.comment.body}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                // schemaOnIssueComment.validate(event_payload_text).then(function(value) {
                //     message = `**A Github issue comment was posted**: ${value.comment.body}`;
                //     url = value.issue.html_url;
                //     details = `Issue state: ${value.issue.state}  - assignee: ${value.issue.assignee}`;
                // });
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
    console.log("Account is " + account);
    console.log("message is " + message);
    console.log("url is " + url);
    console.log("details is " + details);
    notificationMessage = new NotificationMessage(message, url, details);
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

parsedNotificationMessage(JSON.stringify(require(github_event_payload))).then(parsedMessage => {
    notifyTeams(parsedMessage);
});
parsedNotificationMessage(JSON.stringify(require(github_event_payload))).catch(error => {
    console.log('Oops', error);
});
// const notification = parse_event_to_message(JSON.stringify(require(github_event_payload)));
// noinspection ES6AwaitOutsideAsyncFunction
// @ts-ignore
// notifyTeams(await notification);
// notifyTeams(notificationMessage(JSON.stringify(require(github_event_payload))));
