import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onIssue.json';
import {schemaOnIssue, schemaOnIssueComment} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on issue', () => {
    const parsed_schema = schemaOnIssue.validateSync(event_payload_data_text);

    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should include the expected issue.html_url value', () => {
        expect(parsed_schema.issue.html_url).to.eql("https://github.com/Codertocat/Hello-World/issues/1");
    });

    it('should include the expected issue.title value', () => {
        expect(parsed_schema.issue.title).to.eql("Spelling error in the README file2");
    });

    it('should include the expected issue.state value', () => {
        expect(parsed_schema.issue.state).to.eql("open");
    });

    it('should include the expected issue.assignee.login value', () => {
        expect(parsed_schema.issue.assignee.login).to.eql("Codertocat");
    });

    it('should include the expected sender.login value', () => {
        expect(parsed_schema.sender.login).to.eql("Codertocat");
    });
});
