import {EventPayload} from './EventPayload';
import {NotificationMessage} from './NotificationMessage';

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


const parsedEventPayload = function parse_event_payload(event_payload: string) : EventPayload {
    return EventPayload.Parse(JSON.stringify(require(event_payload)));
}

const notificationMessage = function set_notification_body(eventPayload: EventPayload) : NotificationMessage {
    let notificationMessage: NotificationMessage;
    try {
        // do not proceed if jobs was cancelled
        job_status = core.getInput('job_status');
        if (job_status.toUpperCase() === "CANCELLED") {
            console.log("Job was cancelled, no notification will be sent")
            process.exit(0);
        }

        msteams_webhook_url = core.getInput('webhook_url');
        event_id = core.getInput('event_id');
        let event_name : string = trigger_event_name || "event";

        const event_payload_data_text =  JSON.stringify(require(github_event_payload));
        const event_payload_data = JSON.parse(event_payload_data_text);

        if (event_id) {
            event_name = event_id;
        }

        switch(event_name){
            case 'push':
                account = event_payload_data['pusher']['name'];
                message = `**Commit to GitHub** by ${account}`;
                url = event_payload_data['compare'];
                details = `Comment: ${event_payload_data['head_commit']['message']}`;
                break;
            case 'pull_request':
                message = `**PR submitted to Github**: ${event_payload_data['pull_request']['title']}`;
                url = event_payload_data['pull_request']['html_url'];
                details = `Pr for merging ref ${event_payload_data['pull_request']['head']['ref']} to base branch ${event_payload_data['base']['ref']}`;
                break;
            case 'issue':
                message = `**New/updated GitHub issue**: ${event_payload_data['issue']['title']}`;
                url = event_payload_data['issue']['html_url'];
                details = `Issue state: ${event_payload_data['issue']['state']}  - assignee: ${event_payload_data['issue']['assignee']}`;
                break;
            case 'issue_comment':
                message = `**A Github issue comment was posted**: ${event_payload_data['comment']['body']}`;
                url = event_payload_data['issue']['html_url'];
                details = `Issue state: ${event_payload_data['issue']['state']} - assignee: ${event_payload_data['issue']['assignee']}`;
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
notifyTeams(notificationMessage(parsedEventPayload(github_event_payload)));
