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
/******/ 		return __webpack_require__(147);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 147:
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
const enums_1 = __webpack_require__(710);
const core = __webpack_require__(670);
const path = __webpack_require__(622);
const https = __webpack_require__(211);
const jsonPath = __webpack_require__.ab + "notification.json";
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const event_payload = process.env.GITHUB_EVENT_PATH || __webpack_require__.ab + "notification.json";
let event_name = process.env.GITHUB_EVENT_NAME;
let msteams_webhook_url;
let job_status;
let event_id;
let details;
let account;
let message;
let url;
function parse_inputs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // do not proceed if jobs was cancelled
            job_status = core.getInput('job_status');
            if (job_status.toUpperCase() === "CANCELLED") {
                console.log("Job was cancelled, no notification will be sent");
                process.exit(0);
            }
            msteams_webhook_url = core.getInput('webhook_url');
            event_id = core.getInput('event_id');
            const event_payload_data_text = JSON.stringify(require(event_payload));
            const event_payload_data = JSON.parse(event_payload_data_text);
            if (event_id) {
                event_name = event_id;
            }
            switch (event_name) {
                case enums_1.EventType.PUSH:
                    account = event_payload_data['pusher']['name'];
                    message = `**Commit to GitHub** by ${account}`;
                    url = event_payload_data['compare'];
                    details = `Comment: ${event_payload_data['head_commit']['message']}`;
                    break;
                case enums_1.EventType.PULL_REQUEST:
                    message = `**PR submitted to Github**: ${event_payload_data['pull_request']['title']}`;
                    url = event_payload_data['pull_request']['html_url'];
                    details = `Pr for merging ref ${event_payload_data['pull_request']['head']['ref']} to base branch ${event_payload_data['base']['ref']}`;
                    break;
                case enums_1.EventType.ISSUE:
                    message = `**New/updated GitHub issue**: ${event_payload_data['issue']['title']}`;
                    url = event_payload_data['issue']['html_url'];
                    details = `Issue state: ${event_payload_data['issue']['state']}  - assignee: ${event_payload_data['issue']['assignee']}`;
                    break;
                case enums_1.EventType.ISSUE_COMMENT:
                    message = `**A Github issue comment was posted**: ${event_payload_data['comment']['body']}`;
                    url = event_payload_data['issue']['html_url'];
                    details = `Issue state: ${event_payload_data['issue']['state']} - assignee: ${event_payload_data['issue']['assignee']}`;
                    break;
                default:
                    if (event_name) {
                        message = event_name.replace(/_/g, ".");
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
    });
}
function notifyTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        const matches = msteams_webhook_url.match(/^https?\:\/\/([^\/?#]+)(.*)/i);
        const hostname_match = matches && matches[1];
        const path_match = matches && matches[2];
        let req_data = JSON.stringify(__webpack_require__(847));
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
parse_inputs();
notifyTeams();


/***/ }),

/***/ 211:
/***/ (function(module) {

module.exports = require("https");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 670:
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
const command_1 = __webpack_require__(703);
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

/***/ 703:
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

/***/ 710:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EventType;
(function (EventType) {
    EventType["PUSH"] = "push";
    EventType["PULL_REQUEST"] = "pull_request";
    EventType["ISSUE"] = "issue";
    EventType["ISSUE_COMMENT"] = "issue_comment";
})(EventType = exports.EventType || (exports.EventType = {}));


/***/ }),

/***/ 847:
/***/ (function(module) {

module.exports = {"@type":"MessageCard","@context":"http://schema.org/extensions","themeColor":"1853DB","summary":"Notification from Github actions","sections":[{"activityTitle":"Notification triggered for workflow \"GITHUB_WORKFLOW\"","facts":[{"name":"Repository","value":"GITHUB_REPOSITORY"},{"name":"Branch","value":"GITHUB_REF"},{"name":"Action","value":"GITHUB_TRIGGER_EVENT"},{"name":"Details","value":"GITHUB_TRIGGER_EVENT_DETAILS"},{"name":"Url","value":"[Drilldown](GITHUB_EVENT_URL)"},{"name":"Job Status","value":"GITHUB_STATUS"}],"markdown":true}]};

/***/ })

/******/ });