/* eslint-disable no-unused-vars */
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

export const parsedNotificationMessage = function parseEventToMessage(eventPayloadText: string): NotificationMessage {
    let account;
    let parsedSchema;
    try {
        let eventName: string = triggerEventName || 'event';
        if (core.getInput('event_id')) {
            eventName = core.getInput('event_id');
        }

        switch (eventName) {
            case EventType.PUSH:
                parsedSchema = schemaOnpush.validateSync(eventPayloadText);
                account = parsedSchema.pusher.name;
                return {
                    message: `**Commit to GitHub** by ${account}`,
                    url: parsedSchema.compare,
                    details: `Comment: ${parsedSchema.head_commit.message}`
                };
            case EventType.PULL_REQUEST:
                parsedSchema = schemaOnPullRequest.validateSync(eventPayloadText);
                account = parsedSchema.pull_request.user.login;
                return {
                    message: `**PR submitted to Github** by ${account} with title: ${parsedSchema.pull_request.title}`,
                    url: parsedSchema.pull_request.html_url,
                    details: `Pr for merging ref ${parsedSchema.pull_request.head.ref} to base branch ${parsedSchema.pull_request.base.ref}`
                };
            case EventType.ISSUE:
                parsedSchema = schemaOnIssue.validateSync(eventPayloadText);
                account = parsedSchema.sender.login;
                return {
                    message: `**New/updated GitHub issue**: ${parsedSchema.issue.title}`,
                    url: parsedSchema.issue.html_url,
                    details: `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`
                };
            case EventType.ISSUE_COMMENT:
                parsedSchema = schemaOnIssueComment.validateSync(eventPayloadText);
                return {
                    message: `**A Github issue comment was posted** by ${account} with content ${parsedSchema.comment.body}`,
                    url: parsedSchema.issue.html_url,
                    details: `Issue state: ${parsedSchema.issue.state}  - assignee: ${parsedSchema.issue.assignee}`
                };
            default:
                return {
                    message: eventName ? eventName.replace(/_/g, '.') : 'A GitHub Actions event has occurred',
                    url: `https://github.com/${repository}/actions`,
                    details: core.getInput('details')
                };
        }
    } catch (error) {
        core.setFailed(error.message);
        return process.exit(1);
    }
};


async function notifyTeams(notificationMessage: NotificationMessage) {
    if (!(core.getInput('webhook_url'))) {
        core.setFailed('Error : Webhook URL configuration is missing. Aborting');
        process.exit(1);
    }
    const matches = core.getInput('webhook_url').match(/^https?:\/\/([^/?#]+)(.*)/i);
    const hostnameMatch = matches && matches[1];
    const pathMatch = matches && matches[2];

    let requestBodyData = JSON.stringify(notificationTemplate);
    requestBodyData = requestBodyData
        .replace(/GITHUB_WORKFLOW/g, `${workflow}`)
        .replace(/GITHUB_REPOSITORY/g, `${repository}`)
        .replace(/GITHUB_REF/g, `${branch}`)
        .replace(/GITHUB_TRIGGER_EVENT_DETAILS/g, `${notificationMessage.details}`)
        .replace(/GITHUB_TRIGGER_EVENT/g, `${notificationMessage.message}`)
        .replace(/GITHUB_EVENT_URL/g, `${notificationMessage.url}`)
        .replace(/GITHUB_STATUS/g, `${core.getInput('job_status')}`);

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

if (core.getInput('job_status').toUpperCase() !== 'CANCELLED') {
    notifyTeams(parsedNotificationMessage(JSON.stringify(githubEventPayload)));
} else {
    core.warn('Job was cancelled, no notification will be sent');
    process.exit(0);
}
