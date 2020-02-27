import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onIssue.json';
import {schema_on_issue} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on issue', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnIssue', () => {
        return schema_on_issue.validate(event_payload_data_text).then(function(value) {
            expect(value.issue.html_url).to.not.be.null;
            expect(value.issue.title).to.not.be.null;
            expect(value.issue.state).to.not.be.null;
            expect(value.issue.assignee.login).to.not.be.null;
            expect(value.sender.login).to.not.be.null;
        });
    });
});

describe('Casting of event payload on pull request', () => {
    const parsed_schema = schema_on_issue.cast(event_payload_data_text);

    it('should set all nested attributes with the expected values', () => {
        expect(parsed_schema.issue.html_url).to.eql("https://github.com/Codertocat/Hello-World/issues/1");
        expect(parsed_schema.issue.title).to.eql("Spelling error in the README file");
        expect(parsed_schema.issue.state).to.eql("open");
        expect(parsed_schema.issue.assignee.login).to.eql("Codertocat");
        expect(parsed_schema.sender.login).to.eql("Codertocat");
    });
});
