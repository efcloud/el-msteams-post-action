import {NotificationMessage} from './NotificationMessage';
import {EventType} from "./enums";
import {schema_on_issue, schema_on_issue_comment, schema_on_pull_request, schema_on_push} from "./eventPayloadSchemaBuilder";

const core = require ('@actions/core');
const path = require('path');
const https = require('https');

const default_json_path = path.join(__dirname, '..', 'resources', 'notification.json');
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const github_event_payload =  process.env.GITHUB_EVENT_PATH || default_json_path;
const trigger_event_name = process.env.GITHUB_EVENT_NAME;

const msteams_webhook_url = core.getInput('webhook_url');
const job_status = core.getInput('job_status');
const event_id = core.getInput('event_id');

export const parsed_notification_message = async function parse_event_to_message(event_payload_text: string): Promise<NotificationMessage> {
    let details;
    let account;
    let message;
    let url;
    let parsedSchema;
    try {
        if (job_status.toUpperCase() === "CANCELLED") {
            console.log("Job was cancelled, no notification will be sent")
            process.exit(0);
        }

        let event_name : string = trigger_event_name || "event";
        if (event_id) {
            event_name = event_id;
        }

        switch(event_name){
            case EventType.PUSH:
                await schema_on_push.validate(event_payload_text);
                parsedSchema = schema_on_push.cast(event_payload_text);
                account = parsedSchema.pusher.name;
                message = `**Commit to GitHub** by ${account}`;
                url = parsedSchema.compare;
                details = `Comment: ${parsedSchema.head_commit.message}`;
                break;
            case EventType.PULL_REQUEST:
                await schema_on_pull_request.validate(event_payload_text);
                parsedSchema = schema_on_pull_request.cast(event_payload_text);
                account = parsedSchema.pull_request.user.login;
                message =  `**PR submitted to Github** by ${account} with title: ${parsedSchema.pull_request.title}`;
                url = parsedSchema.pull_request.html_url;
                details = `Pr for merging ref ${parsedSchema.pull_request.head.ref} to base branch ${parsedSchema.pull_request.base.ref}`;
                break;
            case EventType.ISSUE:
                await schema_on_issue.validate(event_payload_text);
                parsedSchema = schema_on_issue.cast(event_payload_text);
                account = parsedSchema.sender.login;
                message = `**New/updated GitHub issue**: ${parsedSchema.issue.title}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                break;
            case EventType.ISSUE_COMMENT:
                await schema_on_issue_comment.validate(event_payload_text);
                parsedSchema = schema_on_issue_comment.cast(event_payload_text);
                account = parsedSchema.sender.login;
                message = `**A Github issue comment was posted** by ${account} with content ${parsedSchema.comment.body}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                break;
            default:
                if (event_name) {
                    message = event_name.replace(/_/g, ".");
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
    return new NotificationMessage(message, url, details);
}


async function notify_teams(notificationMessage: NotificationMessage) {
    const matches = msteams_webhook_url.match(/^https?\:\/\/([^\/?#]+)(.*)/i);
    const hostname_match = matches && matches[1];
    const path_match = matches && matches[2];

    let req_data = JSON.stringify(require(default_json_path));
    req_data  = req_data.replace(/GITHUB_WORKFLOW/g, `${workflow}`)
                        .replace(/GITHUB_REPOSITORY/g, `${repository}`)
                        .replace(/GITHUB_REF/g, `${branch}`)
                        .replace(/GITHUB_TRIGGER_EVENT_DETAILS/g, `${notificationMessage.getDetails()}`)
                        .replace(/GITHUB_TRIGGER_EVENT/g, `${notificationMessage.getMessage()}`)
                        .replace(/GITHUB_EVENT_URL/g, `${notificationMessage.getUrl()}`)
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

parsed_notification_message(JSON.stringify(require(github_event_payload))).then((parsedMessage: NotificationMessage) => {
    notify_teams(parsedMessage);
});
