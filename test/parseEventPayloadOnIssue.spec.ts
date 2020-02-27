import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onIssue.json';
import {schemaOnIssue} from '../src/eventPayloadSchemaBuilder';
// import {notificationMessage} from "../src/main";
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on issue', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnIssue', () => {
        return schemaOnIssue.validate(event_payload_data_text).then(function(value) {
            expect(value.issue.html_url).to.not.be.null;
            expect(value.issue.title).to.not.be.null;
            expect(value.issue.state).to.not.be.null;
            expect(value.issue.assignee.login).to.not.be.null;
            expect(value.sender.login).to.not.be.null;
        });
    });
});

describe('Casting of event payload on pull request', () => {
    const parsedSchema = schemaOnIssue.cast(event_payload_data_text);

    it('should set all nested attributes with the expected values', () => {
        const parsedSchema = schemaOnIssue.cast(event_payload_data_text);
        expect(parsedSchema.issue.html_url).to.eql("https://github.com/Codertocat/Hello-World/issues/1");
        expect(parsedSchema.issue.title).to.eql("Spelling error in the README file");
        expect(parsedSchema.issue.state).to.eql("open");
        expect(parsedSchema.issue.assignee.login).to.eql("Codertocat");
        expect(parsedSchema.sender.login).to.eql("Codertocat");
    });
});

// describe('Notification message to be send', () => {
//     const notificationText = notificationMessage(event_payload_data_text);
//
//     it('should set all nested attributes with the expected values', () => {
//         const parsedSchema = schemaOnIssue.cast(event_payload_data_text);
//         expect(notificationText.getDetails()).to.eql("https://github.com/Codertocat/Hello-World/issues/1");
//         expect(notificationText.getUrl()).to.eql("Spelling error in the README file");
//         expect(notificationText.getMessage()).to.eql("open");
//     });
// });
