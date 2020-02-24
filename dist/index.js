module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(29);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 29:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventPayload_1 = __webpack_require__(565);
const NotificationMessage_1 = __webpack_require__(217);
const core = __webpack_require__(357);
const path = __webpack_require__(622);
const https = __webpack_require__(211);
const jsonPath = __webpack_require__.ab + "notification.json";
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const github_event_payload = process.env.GITHUB_EVENT_PATH || __webpack_require__.ab + "notification.json";
const trigger_event_name = process.env.GITHUB_EVENT_NAME;
let msteams_webhook_url;
let job_status;
let event_id;
let details;
let account;
let message;
let url;
const parsedEventPayload = function parse_event_payload(event_payload) {
    return EventPayload_1.EventPayload.Parse(JSON.stringify(event_payload));
};
const notificationMessage = function set_notification_body(eventPayload) {
    let notificationMessage;
    try {
        // do not proceed if jobs was cancelled
        job_status = core.getInput('job_status');
        if (job_status.toUpperCase() === "CANCELLED") {
            console.log("Job was cancelled, no notification will be sent");
            process.exit(0);
        }
        msteams_webhook_url = core.getInput('webhook_url');
        event_id = core.getInput('event_id');
        let event_name = trigger_event_name || "event";
        const event_payload_data_text = JSON.stringify(require(github_event_payload));
        const event_payload_data = JSON.parse(event_payload_data_text);
        if (event_id) {
            event_name = event_id;
        }
        switch (event_name) {
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
                }
                else {
                    message = "A GitHub Actions event has occurred";
                }
                url = `https://github.com/${repository}/actions`;
        }
        if (!details) {
            details = core.getInput('details');
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
    notificationMessage = new NotificationMessage_1.NotificationMessage(account, message, url, details);
    return notificationMessage;
};
function notifyTeams(notificationMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const matches = msteams_webhook_url.match(/^https?\:\/\/([^\/?#]+)(.*)/i);
        const hostname_match = matches && matches[1];
        const path_match = matches && matches[2];
        let req_data = JSON.stringify(__webpack_require__(935));
        req_data = req_data.replace(/GITHUB_WORKFLOW/g, `${workflow}`)
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
            }
            else {
                console.log(`statusCode: ${res.statusCode}`);
            }
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });
        req.on('error', (error) => {
            console.error(error);
            core.setFailed(`Action failed with error ${error}`);
        });
        req.write(req_data);
        req.end();
    });
}
// set_notification_body();
notifyTeams(notificationMessage(parsedEventPayload(github_event_payload)));


/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 92:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 211:
/***/ (function(module) {

module.exports = require("https");

/***/ }),

/***/ 217:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Stores the currently-being-typechecked object for error messages.
let obj = null;
class NotificationMessage {
    // account = event_payload_data['pusher']['name'];
    // message = `**Commit to GitHub** by ${account}`;
    // url = event_payload_data['compare'];
    // details = `Comment: ${event_payload_data['head_commit']['message']}`;
    constructor(account, message, url, details) {
        this.account = account;
        this.message = message;
        this.url = url;
        this.details = details;
    }
}
exports.NotificationMessage = NotificationMessage;
// function throwNull2NonNull(field: string, d: any): never {
//     return errorHelper(field, d, "non-nullable object", false);
// }
// function throwNotObject(field: string, d: any, nullable: boolean): never {
//     return errorHelper(field, d, "object", nullable);
// }
// function throwIsArray(field: string, d: any, nullable: boolean): never {
//     return errorHelper(field, d, "object", nullable);
// }
// function checkArray(d: any, field: string): void {
//     if (!Array.isArray(d) && d !== null && d !== undefined) {
//         errorHelper(field, d, "array", true);
//     }
// }
// function checkNumber(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "number", nullable);
//     }
// }
// function checkBoolean(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "boolean", nullable);
//     }
// }
// function checkString(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "string", nullable);
//     }
// }
// function checkNull(d: any, field: string): void {
//     if (d !== null && d !== undefined) {
//         errorHelper(field, d, "null or undefined", false);
//     }
// }
// function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
//     if (nullable) {
//         type += ", null, or undefined";
//     }
//     throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
// }


/***/ }),

/***/ 357:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(92);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 565:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Stores the currently-being-typechecked object for error messages.
let obj = null;
class EventPayload {
    constructor(d) {
        this.ref = d.ref;
        this.before = d.before;
        this.after = d.after;
        this.created = d.created;
        this.deleted = d.deleted;
        this.forced = d.forced;
        this.base_ref = d.base_ref;
        this.compare = d.compare;
        this.commits = d.commits;
        this.head_commit = d.head_commit;
        this.repository = d.repository;
        this.pusher = d.pusher;
        this.sender = d.sender;
    }
    static Parse(d) {
        return EventPayload.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.ref, false, field + ".ref");
        checkString(d.before, false, field + ".before");
        checkString(d.after, false, field + ".after");
        checkBoolean(d.created, false, field + ".created");
        checkBoolean(d.deleted, false, field + ".deleted");
        checkBoolean(d.forced, false, field + ".forced");
        checkNull(d.base_ref, field + ".base_ref");
        if (d.base_ref === undefined) {
            d.base_ref = null;
        }
        checkString(d.compare, false, field + ".compare");
        checkArray(d.commits, field + ".commits");
        if (d.commits) {
            for (let i = 0; i < d.commits.length; i++) {
                checkNull(d.commits[i], field + ".commits" + "[" + i + "]");
                if (d.commits[i] === undefined) {
                    d.commits[i] = null;
                }
            }
        }
        if (d.commits === undefined) {
            d.commits = null;
        }
        checkNull(d.head_commit, field + ".head_commit");
        if (d.head_commit === undefined) {
            d.head_commit = null;
        }
        d.repository = Repository.Create(d.repository, field + ".repository");
        d.pusher = Pusher.Create(d.pusher, field + ".pusher");
        d.sender = Sender.Create(d.sender, field + ".sender");
        return new EventPayload(d);
    }
}
exports.EventPayload = EventPayload;
class Repository {
    constructor(d) {
        this.id = d.id;
        this.node_id = d.node_id;
        this.name = d.name;
        this.full_name = d.full_name;
        this.private = d.private;
        this.owner = d.owner;
        this.html_url = d.html_url;
        this.description = d.description;
        this.fork = d.fork;
        this.url = d.url;
        this.forks_url = d.forks_url;
        this.keys_url = d.keys_url;
        this.collaborators_url = d.collaborators_url;
        this.teams_url = d.teams_url;
        this.hooks_url = d.hooks_url;
        this.issue_events_url = d.issue_events_url;
        this.events_url = d.events_url;
        this.assignees_url = d.assignees_url;
        this.branches_url = d.branches_url;
        this.tags_url = d.tags_url;
        this.blobs_url = d.blobs_url;
        this.git_tags_url = d.git_tags_url;
        this.git_refs_url = d.git_refs_url;
        this.trees_url = d.trees_url;
        this.statuses_url = d.statuses_url;
        this.languages_url = d.languages_url;
        this.stargazers_url = d.stargazers_url;
        this.contributors_url = d.contributors_url;
        this.subscribers_url = d.subscribers_url;
        this.subscription_url = d.subscription_url;
        this.commits_url = d.commits_url;
        this.git_commits_url = d.git_commits_url;
        this.comments_url = d.comments_url;
        this.issue_comment_url = d.issue_comment_url;
        this.contents_url = d.contents_url;
        this.compare_url = d.compare_url;
        this.merges_url = d.merges_url;
        this.archive_url = d.archive_url;
        this.downloads_url = d.downloads_url;
        this.issues_url = d.issues_url;
        this.pulls_url = d.pulls_url;
        this.milestones_url = d.milestones_url;
        this.notifications_url = d.notifications_url;
        this.labels_url = d.labels_url;
        this.releases_url = d.releases_url;
        this.deployments_url = d.deployments_url;
        this.created_at = d.created_at;
        this.updated_at = d.updated_at;
        this.pushed_at = d.pushed_at;
        this.git_url = d.git_url;
        this.ssh_url = d.ssh_url;
        this.clone_url = d.clone_url;
        this.svn_url = d.svn_url;
        this.homepage = d.homepage;
        this.size = d.size;
        this.stargazers_count = d.stargazers_count;
        this.watchers_count = d.watchers_count;
        this.language = d.language;
        this.has_issues = d.has_issues;
        this.has_projects = d.has_projects;
        this.has_downloads = d.has_downloads;
        this.has_wiki = d.has_wiki;
        this.has_pages = d.has_pages;
        this.forks_count = d.forks_count;
        this.mirror_url = d.mirror_url;
        this.archived = d.archived;
        this.disabled = d.disabled;
        this.open_issues_count = d.open_issues_count;
        this.license = d.license;
        this.forks = d.forks;
        this.open_issues = d.open_issues;
        this.watchers = d.watchers;
        this.default_branch = d.default_branch;
        this.stargazers = d.stargazers;
        this.master_branch = d.master_branch;
    }
    static Parse(d) {
        return Repository.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.name, false, field + ".name");
        checkString(d.full_name, false, field + ".full_name");
        checkBoolean(d.private, false, field + ".private");
        d.owner = Owner.Create(d.owner, field + ".owner");
        checkString(d.html_url, false, field + ".html_url");
        checkNull(d.description, field + ".description");
        if (d.description === undefined) {
            d.description = null;
        }
        checkBoolean(d.fork, false, field + ".fork");
        checkString(d.url, false, field + ".url");
        checkString(d.forks_url, false, field + ".forks_url");
        checkString(d.keys_url, false, field + ".keys_url");
        checkString(d.collaborators_url, false, field + ".collaborators_url");
        checkString(d.teams_url, false, field + ".teams_url");
        checkString(d.hooks_url, false, field + ".hooks_url");
        checkString(d.issue_events_url, false, field + ".issue_events_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.assignees_url, false, field + ".assignees_url");
        checkString(d.branches_url, false, field + ".branches_url");
        checkString(d.tags_url, false, field + ".tags_url");
        checkString(d.blobs_url, false, field + ".blobs_url");
        checkString(d.git_tags_url, false, field + ".git_tags_url");
        checkString(d.git_refs_url, false, field + ".git_refs_url");
        checkString(d.trees_url, false, field + ".trees_url");
        checkString(d.statuses_url, false, field + ".statuses_url");
        checkString(d.languages_url, false, field + ".languages_url");
        checkString(d.stargazers_url, false, field + ".stargazers_url");
        checkString(d.contributors_url, false, field + ".contributors_url");
        checkString(d.subscribers_url, false, field + ".subscribers_url");
        checkString(d.subscription_url, false, field + ".subscription_url");
        checkString(d.commits_url, false, field + ".commits_url");
        checkString(d.git_commits_url, false, field + ".git_commits_url");
        checkString(d.comments_url, false, field + ".comments_url");
        checkString(d.issue_comment_url, false, field + ".issue_comment_url");
        checkString(d.contents_url, false, field + ".contents_url");
        checkString(d.compare_url, false, field + ".compare_url");
        checkString(d.merges_url, false, field + ".merges_url");
        checkString(d.archive_url, false, field + ".archive_url");
        checkString(d.downloads_url, false, field + ".downloads_url");
        checkString(d.issues_url, false, field + ".issues_url");
        checkString(d.pulls_url, false, field + ".pulls_url");
        checkString(d.milestones_url, false, field + ".milestones_url");
        checkString(d.notifications_url, false, field + ".notifications_url");
        checkString(d.labels_url, false, field + ".labels_url");
        checkString(d.releases_url, false, field + ".releases_url");
        checkString(d.deployments_url, false, field + ".deployments_url");
        checkNumber(d.created_at, false, field + ".created_at");
        checkString(d.updated_at, false, field + ".updated_at");
        checkNumber(d.pushed_at, false, field + ".pushed_at");
        checkString(d.git_url, false, field + ".git_url");
        checkString(d.ssh_url, false, field + ".ssh_url");
        checkString(d.clone_url, false, field + ".clone_url");
        checkString(d.svn_url, false, field + ".svn_url");
        checkNull(d.homepage, field + ".homepage");
        if (d.homepage === undefined) {
            d.homepage = null;
        }
        checkNumber(d.size, false, field + ".size");
        checkNumber(d.stargazers_count, false, field + ".stargazers_count");
        checkNumber(d.watchers_count, false, field + ".watchers_count");
        checkString(d.language, false, field + ".language");
        checkBoolean(d.has_issues, false, field + ".has_issues");
        checkBoolean(d.has_projects, false, field + ".has_projects");
        checkBoolean(d.has_downloads, false, field + ".has_downloads");
        checkBoolean(d.has_wiki, false, field + ".has_wiki");
        checkBoolean(d.has_pages, false, field + ".has_pages");
        checkNumber(d.forks_count, false, field + ".forks_count");
        checkNull(d.mirror_url, field + ".mirror_url");
        if (d.mirror_url === undefined) {
            d.mirror_url = null;
        }
        checkBoolean(d.archived, false, field + ".archived");
        checkBoolean(d.disabled, false, field + ".disabled");
        checkNumber(d.open_issues_count, false, field + ".open_issues_count");
        checkNull(d.license, field + ".license");
        if (d.license === undefined) {
            d.license = null;
        }
        checkNumber(d.forks, false, field + ".forks");
        checkNumber(d.open_issues, false, field + ".open_issues");
        checkNumber(d.watchers, false, field + ".watchers");
        checkString(d.default_branch, false, field + ".default_branch");
        checkNumber(d.stargazers, false, field + ".stargazers");
        checkString(d.master_branch, false, field + ".master_branch");
        return new Repository(d);
    }
}
exports.Repository = Repository;
class Owner {
    constructor(d) {
        this.name = d.name;
        this.email = d.email;
        this.login = d.login;
        this.id = d.id;
        this.node_id = d.node_id;
        this.avatar_url = d.avatar_url;
        this.gravatar_id = d.gravatar_id;
        this.url = d.url;
        this.html_url = d.html_url;
        this.followers_url = d.followers_url;
        this.following_url = d.following_url;
        this.gists_url = d.gists_url;
        this.starred_url = d.starred_url;
        this.subscriptions_url = d.subscriptions_url;
        this.organizations_url = d.organizations_url;
        this.repos_url = d.repos_url;
        this.events_url = d.events_url;
        this.received_events_url = d.received_events_url;
        this.type = d.type;
        this.site_admin = d.site_admin;
    }
    static Parse(d) {
        return Owner.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.name, false, field + ".name");
        checkString(d.email, false, field + ".email");
        checkString(d.login, false, field + ".login");
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.avatar_url, false, field + ".avatar_url");
        checkString(d.gravatar_id, false, field + ".gravatar_id");
        checkString(d.url, false, field + ".url");
        checkString(d.html_url, false, field + ".html_url");
        checkString(d.followers_url, false, field + ".followers_url");
        checkString(d.following_url, false, field + ".following_url");
        checkString(d.gists_url, false, field + ".gists_url");
        checkString(d.starred_url, false, field + ".starred_url");
        checkString(d.subscriptions_url, false, field + ".subscriptions_url");
        checkString(d.organizations_url, false, field + ".organizations_url");
        checkString(d.repos_url, false, field + ".repos_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.received_events_url, false, field + ".received_events_url");
        checkString(d.type, false, field + ".type");
        checkBoolean(d.site_admin, false, field + ".site_admin");
        return new Owner(d);
    }
}
exports.Owner = Owner;
class Pusher {
    constructor(d) {
        this.name = d.name;
        this.email = d.email;
    }
    static Parse(d) {
        return Pusher.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.name, false, field + ".name");
        checkString(d.email, false, field + ".email");
        return new Pusher(d);
    }
}
exports.Pusher = Pusher;
class Sender {
    constructor(d) {
        this.login = d.login;
        this.id = d.id;
        this.node_id = d.node_id;
        this.avatar_url = d.avatar_url;
        this.gravatar_id = d.gravatar_id;
        this.url = d.url;
        this.html_url = d.html_url;
        this.followers_url = d.followers_url;
        this.following_url = d.following_url;
        this.gists_url = d.gists_url;
        this.starred_url = d.starred_url;
        this.subscriptions_url = d.subscriptions_url;
        this.organizations_url = d.organizations_url;
        this.repos_url = d.repos_url;
        this.events_url = d.events_url;
        this.received_events_url = d.received_events_url;
        this.type = d.type;
        this.site_admin = d.site_admin;
    }
    static Parse(d) {
        return Sender.Create(JSON.parse(d));
    }
    static Create(d, field = 'root') {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        }
        else if (typeof (d) !== 'object') {
            throwNotObject(field, d, false);
        }
        else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.login, false, field + ".login");
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.avatar_url, false, field + ".avatar_url");
        checkString(d.gravatar_id, false, field + ".gravatar_id");
        checkString(d.url, false, field + ".url");
        checkString(d.html_url, false, field + ".html_url");
        checkString(d.followers_url, false, field + ".followers_url");
        checkString(d.following_url, false, field + ".following_url");
        checkString(d.gists_url, false, field + ".gists_url");
        checkString(d.starred_url, false, field + ".starred_url");
        checkString(d.subscriptions_url, false, field + ".subscriptions_url");
        checkString(d.organizations_url, false, field + ".organizations_url");
        checkString(d.repos_url, false, field + ".repos_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.received_events_url, false, field + ".received_events_url");
        checkString(d.type, false, field + ".type");
        checkBoolean(d.site_admin, false, field + ".site_admin");
        return new Sender(d);
    }
}
exports.Sender = Sender;
function throwNull2NonNull(field, d) {
    return errorHelper(field, d, "non-nullable object", false);
}
function throwNotObject(field, d, nullable) {
    return errorHelper(field, d, "object", nullable);
}
function throwIsArray(field, d, nullable) {
    return errorHelper(field, d, "object", nullable);
}
function checkArray(d, field) {
    if (!Array.isArray(d) && d !== null && d !== undefined) {
        errorHelper(field, d, "array", true);
    }
}
function checkNumber(d, nullable, field) {
    if (typeof (d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "number", nullable);
    }
}
function checkBoolean(d, nullable, field) {
    if (typeof (d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "boolean", nullable);
    }
}
function checkString(d, nullable, field) {
    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "string", nullable);
    }
}
function checkNull(d, field) {
    if (d !== null && d !== undefined) {
        errorHelper(field, d, "null or undefined", false);
    }
}
function errorHelper(field, d, type, nullable) {
    if (nullable) {
        type += ", null, or undefined";
    }
    throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 935:
/***/ (function(module) {

module.exports = {"@type":"MessageCard","@context":"http://schema.org/extensions","themeColor":"1853DB","summary":"Notification from Github actions","sections":[{"activityTitle":"Notification triggered for workflow \"GITHUB_WORKFLOW\"","facts":[{"name":"Repository","value":"GITHUB_REPOSITORY"},{"name":"Branch","value":"GITHUB_REF"},{"name":"Action","value":"GITHUB_TRIGGER_EVENT"},{"name":"Details","value":"GITHUB_TRIGGER_EVENT_DETAILS"},{"name":"Url","value":"[Drilldown](GITHUB_EVENT_URL)"},{"name":"Job Status","value":"GITHUB_STATUS"}],"markdown":true}]};

/***/ })

/******/ });