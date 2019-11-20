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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const path = require('path');
const https = require('https');
const jsonPath = path.join(__dirname, '..', 'resources', 'notification.json');
const workflow = process.env.GITHUB_WORKFLOW;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF;
const event_payload = process.env.GITHUB_EVENT_PATH || jsonPath;
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
            const event_payload_data = JSON.stringify(require(event_payload));
            const event_payload_data_text = JSON.parse(event_payload_data);
            if (event_id) {
                event_name = event_id;
            }
            switch (event_name) {
                case 'push':
                    account = event_payload_data_text['pusher']['name'];
                    message = '**Commit to GitHub** by ' + account;
                    url = event_payload_data_text['compare'];
                    details = 'Comment: ' + event_payload_data_text['head_commit']['message'];
                    break;
                case 'pull_request':
                    message = '**PR submitted to Github**: ' + event_payload_data_text['pull_request']['title'];
                    url = event_payload_data_text['pull_request']['html_url'];
                    details = 'Pr for merging ref ' + event_payload_data_text['pull_request']['head']['ref'] + ' to base branch ' + event_payload_data_text['base']['ref'];
                    break;
                case 'issue':
                    message = '**New/updated GitHub issue**: ' + event_payload_data_text['issue']['title'];
                    url = event_payload_data_text['issue']['html_url'];
                    details = 'Issue state: ' + event_payload_data_text['issue']['state'] + ' - assignee: ' + event_payload_data_text['issue']['assignee'];
                    break;
                case 'issue_comment':
                    message = '**A Github issue comment was posted**: ' + event_payload_data_text['comment']['body'];
                    url = event_payload_data_text['issue']['html_url'];
                    details = 'Issue state: ' + event_payload_data_text['issue']['state'] + ' - assignee: ' + event_payload_data_text['issue']['assignee'];
                    break;
                default:
                    if (event_name) {
                        message = event_name.replace(/_/g, ".");
                    }
                    else {
                        message = "A GitHub Actions event has occurred";
                    }
                    url = 'https://github.com/' + repository + '/actions';
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
        let req_data = JSON.stringify(require(jsonPath));
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
