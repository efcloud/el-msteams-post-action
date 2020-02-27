import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onPR.json';
import {schema_on_pull_request} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on pull request', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnPullRequest', () => {
        return schema_on_pull_request.validate(event_payload_data_text).then(function(value) {
            expect(value.action).to.not.be.null;
            expect(value.pull_request.html_url).to.not.be.null;
            expect(value.pull_request.title).to.not.be.null;
            expect(value.pull_request.user.login).to.not.be.null;
            expect(value.pull_request.base.ref).to.not.be.null;
            expect(value.pull_request.base.label).to.not.be.null;
            expect(value.pull_request.head.ref).to.not.be.null;
            expect(value.pull_request.head.label).to.not.be.null;
        });
    });
});

describe('Casting of event payload on pull request', () => {
    const parsed_schema = schema_on_pull_request.cast(event_payload_data_text);

    it('should set all nested attributes with the expected values', () => {
        expect(parsed_schema.pull_request.html_url).to.eql("https://github.com/efcloud/el-msteams-post-action/pull/3");
        expect(parsed_schema.pull_request.title).to.eql("Feature/add first version of action tests for pr");
        expect(parsed_schema.pull_request.user.login).to.eql("eleni-salamani");
        expect(parsed_schema.pull_request.base.ref).to.eql("master");
        expect(parsed_schema.pull_request.base.label).to.eql("efcloud:master");
        expect(parsed_schema.pull_request.head.ref).to.eql("feature/add-first-version-of-action-tests-for-pr");
        expect(parsed_schema.pull_request.head.label).to.eql("efcloud:feature/add-first-version-of-action-tests-for-pr");
    });
});
