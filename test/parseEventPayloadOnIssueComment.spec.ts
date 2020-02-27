import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onIssueComment.json';
import {schemaOnIssueComment} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on issue', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnIssue', () => {
        return schemaOnIssueComment.validate(event_payload_data_text).then(function(value) {
            expect(value.action).to.exist;
            expect(value.issue.html_url).to.not.be.null;
            expect(value.issue.title).to.not.be.null;
            expect(value.issue.state).to.not.be.null;
            expect(value.issue.assignee.login).to.not.be.null;
            expect(value.comment.body).to.not.be.null;
            expect(value.comment.user.login).to.not.be.null;
        });
    });
});

describe('Casting of event payload on pull request', () => {
    const parsedSchema = schemaOnIssueComment.cast(event_payload_data_text);

    it('should set all nested attributes with the expected values', () => {
        const parsedSchema = schemaOnIssueComment.cast(event_payload_data_text);
        expect(parsedSchema.action).to.eql("created");
        expect(parsedSchema.issue.html_url).to.eql("https://github.com/Codertocat/Hello-World/issues/1");
        expect(parsedSchema.issue.title).to.eql("Spelling error in the README file");
        expect(parsedSchema.issue.state).to.eql("open");
        expect(parsedSchema.issue.assignee.login).to.eql("Codertocat");
        expect(parsedSchema.comment.body).to.eql("You are totally right! I'll get this fixed right away.");
        expect(parsedSchema.comment.user.login).to.eql("Codertocat");
    });
});
