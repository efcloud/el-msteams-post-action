import * as core from '@actions/core';
import { join } from 'path';

export const defaultJsonPath = join(__dirname, '..', 'resources', 'notification.json');
export const workflow = process.env.GITHUB_WORKFLOW;
export const repository = process.env.GITHUB_REPOSITORY;
export const branch = process.env.GITHUB_REF;
export const githubEventPayloadFile = process.env.GITHUB_EVENT_PATH || defaultJsonPath;
export const triggerEventName = process.env.GITHUB_EVENT_NAME;
export const eventName: string = core.getInput('event_id') || triggerEventName || 'event';
export const status = core.getInput('job_status');

export const jobStatus = {
    success: { status: 'success', themeColor: '5D985E' },
    failure: { status: 'failure', themeColor: 'AD362F' },
    always: { status: 'always', themeColor: '1853DB' },
    cancelled: { status: 'cancelled', themeColor: 'FB9A5B' }
};
