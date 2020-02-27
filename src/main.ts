import { NotificationMessage } from './NotificationMessage';
import { EventType } from './enums';
import {
    schemaOnIssue,
    schemaOnIssueComment,
    schemaOnPullRequest,
    schemaOnpush
} from './eventPayloadSchemaBuilder';
import notificationTemplate from './resources/notification.json';

const core = require('@actions/core');
const path = require('path');
const https = require('https');

const defaultJsonPath = path.join(__dirname, '..', 'resources', 'notification.json');
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const githubEventPayloadFile = process.env.GITHUB_EVENT_PATH || defaultJsonPath;
const githubEventPayload = require(githubEventPayloadFile);
const triggerEventName = process.env.GITHUB_EVENT_NAME;

const msteamsWebhookUrl = core.getInput('webhook_url');
const jobStatus = core.getInput('job_status');
const eventId = core.getInput('event_id');

export const parsedNotificationMessage = async function parseEventToMessage(eventPayloadText: string): Promise<NotificationMessage> {
    let details;
    let account;
    let message;
    let url;
    let parsedSchema;
    try {
        if (jobStatus.toUpperCase() === 'CANCELLED') {
            core.warn('Job was cancelled, no notification will be sent');
            process.exit(0);
        }

        let eventName: string = triggerEventName || 'event';
        if (eventId) {
            eventName = eventId;
        }

        switch (eventName) {
            case EventType.PUSH:
                await schemaOnpush.validate(eventPayloadText);
                parsedSchema = schemaOnpush.cast(eventPayloadText);
                account = parsedSchema.pusher.name;
                message = `**Commit to GitHub** by ${account}`;
                url = parsedSchema.compare;
                details = `Comment: ${parsedSchema.head_commit.message}`;
                break;
            case EventType.PULL_REQUEST:
                await schemaOnPullRequest.validate(eventPayloadText);
                parsedSchema = schemaOnPullRequest.cast(eventPayloadText);
                account = parsedSchema.pull_request.user.login;
                message = `**PR submitted to Github** by ${account} with title: ${parsedSchema.pull_request.title}`;
                url = parsedSchema.pull_request.html_url;
                details = `Pr for merging ref ${parsedSchema.pull_request.head.ref} to base branch ${parsedSchema.pull_request.base.ref}`;
                break;
            case EventType.ISSUE:
                await schemaOnIssue.validate(eventPayloadText);
                parsedSchema = schemaOnIssue.cast(eventPayloadText);
                account = parsedSchema.sender.login;
                message = `**New/updated GitHub issue**: ${parsedSchema.issue.title}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                break;
            case EventType.ISSUE_COMMENT:
                await schemaOnIssueComment.validate(eventPayloadText);
                parsedSchema = schemaOnIssueComment.cast(eventPayloadText);
                account = parsedSchema.sender.login;
                message = `**A Github issue comment was posted** by ${account} with content ${parsedSchema.comment.body}`;
                url = parsedSchema.issue.html_url;
                details = `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`;
                break;
            default:
                if (eventName) {
                    message = eventName.replace(/_/g, '.');
                } else {
                    message = 'A GitHub Actions event has occurred';
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
};


async function notifyTeams(notificationMessage: NotificationMessage) {
    const matches = msteamsWebhookUrl.match(/^https?:\/\/([^/?#]+)(.*)/i);
    const hostnameMatch = matches && matches[1];
    const pathMatch = matches && matches[2];

    let requestBodyData = JSON.stringify(notificationTemplate);
    requestBodyData = requestBodyData
        .replace(/GITHUB_WORKFLOW/g, `${workflow}`)
        .replace(/GITHUB_REPOSITORY/g, `${repository}`)
        .replace(/GITHUB_REF/g, `${branch}`)
        .replace(/GITHUB_TRIGGER_EVENT_DETAILS/g, `${notificationMessage.getDetails()}`)
        .replace(/GITHUB_TRIGGER_EVENT/g, `${notificationMessage.getMessage()}`)
        .replace(/GITHUB_EVENT_URL/g, `${notificationMessage.getUrl()}`)
        .replace(/GITHUB_STATUS/g, `${jobStatus}`);

    const options = {
        hostname: `${hostnameMatch}`,
        port: 443,
        path: `${pathMatch}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestBodyData.length
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode >= 400) {
            core.setFailed(`Action failed with status code  ${res.statusCode}`);
        } else {
            core.info(`statusCode: ${res.statusCode}`);
        }

        res.on('data', (d) => {
            core.info(d);
        });
    });

    req.on('error', (error) => {
        core.error(error);
        core.setFailed(`Action failed with error ${error}`);
    });

    req.write(requestBodyData);
    req.end();
}

parsedNotificationMessage(JSON.stringify(githubEventPayload)).then((parsedMessage: NotificationMessage) => {
    notifyTeams(parsedMessage);
});
