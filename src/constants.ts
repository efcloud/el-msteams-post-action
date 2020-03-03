const path = require('path');

export const defaultJsonPath = path.join(__dirname, '..', 'resources', 'notification.json');
export const workflow = process.env.GITHUB_WORKFLOW;
export const repository = process.env.GITHUB_REPOSITORY;
export const branch = process.env.GITHUB_REF;
export const githubEventPayloadFile = process.env.GITHUB_EVENT_PATH || defaultJsonPath;
export const triggerEventName = process.env.GITHUB_EVENT_NAME;

export const jobStatus = {
    SUCCESS: { status: 'success', themeColor: '5D985E' },
    FAILURE: { status: 'failure', themeColor: 'AD362F' },
    ALWAYS: { status: 'always', themeColor: '1853DB' },
    CANCELLED: { status: 'cancelled', themeColor: 'FB9A5B' }
};
