import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/templates/event_payload_onPR.json';
import {schemaOnPullRequest} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on pull request', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnPullRequest', () => {
        return schemaOnPullRequest.validate(event_payload_data_text).then(function(value) {
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
    const parsedSchema = schemaOnPullRequest.cast(event_payload_data_text);

    it('should set all nested attributes with the expected values', () => {
        const parsedSchema = schemaOnPullRequest.cast(event_payload_data_text);
        expect(parsedSchema.pull_request.html_url).to.eql("https://github.com/efcloud/el-msteams-post-action/pull/3");
        expect(parsedSchema.pull_request.title).to.eql("Feature/add first version of action tests for pr");
        expect(parsedSchema.pull_request.user.login).to.eql("eleni-salamani");
        expect(parsedSchema.pull_request.base.ref).to.eql("master");
        expect(parsedSchema.pull_request.base.label).to.eql("efcloud:master");
        expect(parsedSchema.pull_request.head.ref).to.eql("feature/add-first-version-of-action-tests-for-pr");
        expect(parsedSchema.pull_request.head.label).to.eql("efcloud:feature/add-first-version-of-action-tests-for-pr");
    });
});
