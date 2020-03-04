/* eslint-disable no-unused-vars */
import * as core from '@actions/core';
import { join } from 'path';
import * as fetch from 'node-fetch';
import { readFileSync } from 'jsonfile';
import { ValidationError } from 'yup';
import { String } from 'typescript-string-operations';
import { NotificationMessage } from './NotificationMessage';
import { EventType } from './enums';
import {
    schemaOnIssue,
    schemaOnIssueComment,
    schemaOnPullRequest,
    schemaOnpush
} from './eventPayloadSchemaBuilder';
import notificationTemplate from './resources/notification.json';

const defaultJsonPath = join(__dirname, '..', 'resources', 'notification.json');
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const githubEventPayloadFile = process.env.GITHUB_EVENT_PATH || defaultJsonPath;
const triggerEventName = process.env.GITHUB_EVENT_NAME;
const eventName: string = core.getInput('event_id') || triggerEventName || 'event';

function checkBasicInputsSet() {
    if (!(core.getInput('webhook_url')) || !(core.getInput('job_status'))) {
        core.setFailed('Error: Required input for action is missing. Aborting');
        process.exit(1);
    }
}

function readEventPayloadFile(filePath: string) : string {
    return readFileSync(filePath);
}

function parseEventToMessage(eventPayloadText: string): NotificationMessage | void {
    let account;
    let parsedSchema;
    try {
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
        let errorDetails;
        if (error instanceof ValidationError) {
            errorDetails = error.errors;
        } else {
            errorDetails = error.message;
        }
        return core.setFailed(`ERROR : ${errorDetails}`);
    }
}

function formatRequestBodyData(notificationMessage: NotificationMessage) {
    const configuration = {
        GITHUB_WORKFLOW: workflow,
        GITHUB_REPOSITORY: repository,
        GITHUB_REF: branch,
        GITHUB_TRIGGER_EVENT_DETAILS: notificationMessage.details,
        GITHUB_TRIGGER_EVENT: notificationMessage.message,
        GITHUB_EVENT_URL: notificationMessage.url,
        GITHUB_STATUS: core.getInput('job_status')
    };

    return String.Format(JSON.stringify(notificationTemplate), configuration);
}

async function notifyTeams(notificationMessage: NotificationMessage) {
    const requestBodyData = formatRequestBodyData(notificationMessage);

    fetch(core.getInput('webhook_url'), {
        method: 'POST',
        body: requestBodyData,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestBodyData.length
        }
    }).then((res) => {
        if (!res) {
            core.setFailed('No response from action');
        } else if (res.status && res.status >= 400) {
            core.setFailed(`Action failed with status code  ${res.status}`);
        } else {
            core.info(`statusCode: ${res.status}`);
        }
    }).catch((err) => {
        core.error(err.message);
        core.setFailed(`Action failed with error ${err.message}`);
    });
}

checkBasicInputsSet();
if (core.getInput('job_status').toUpperCase() !== 'CANCELLED') {
    const eventNotification = parseEventToMessage(readEventPayloadFile(githubEventPayloadFile));
    if (eventNotification) {
        notifyTeams(eventNotification);
    } else {
        core.setFailed('ERROR: Notification message not built correctly - Aborting');
    }
} else {
    core.warning('Job was cancelled, no notification will be sent');
    process.exit(0);
}
