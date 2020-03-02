import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onPR.json';
import {schemaOnPullRequest, schemaOnpush} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on pull request', () => {
    const parsed_schema = schemaOnPullRequest.validateSync(event_payload_data_text);

    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should not include a null action', () => {
            expect(parsed_schema.action).to.not.be.null;
    });

    it('should include the expected pull_request.html_url value', () => {
        expect(parsed_schema.pull_request.html_url).to.eql("https://github.com/efcloud/el-msteams-post-action/pull/3");
    });

    it('should include the expected pull_request.title value', () => {
        expect(parsed_schema.pull_request.title).to.eql("Feature/add first version of action tests for pr");
    });

    it('should include the expected pull_request.user.login value', () => {
        expect(parsed_schema.pull_request.user.login).to.eql("eleni-salamani");
    });

    it('should include the expected pull_request.base.ref value', () => {
        expect(parsed_schema.pull_request.base.ref).to.eql("master");
    });

    it('should include the expected pull_request.base.label value', () => {
        expect(parsed_schema.pull_request.base.label).to.eql("efcloud:master");
    });

    it('should include the expected pull_request.head.ref value', () => {
        expect(parsed_schema.pull_request.head.ref).to.eql("feature/add-first-version-of-action-tests-for-pr");
    });

    it('should include the expected pull_request.head.label value', () => {
        expect(parsed_schema.pull_request.head.label).to.eql("efcloud:feature/add-first-version-of-action-tests-for-pr");
    });
});
