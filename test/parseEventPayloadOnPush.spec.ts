import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/templates/event_payload_onPush.json';
import {schemaOnPush} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on push', () => {
    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should be a valid schemaOnPush', () => {
        return schemaOnPush.validate(event_payload_data_text).then(function(value) {
            expect(value.base_ref).to.be.null;
            expect(value.compare).to.not.be.null;
            expect(value.pusher).to.not.be.null;
            expect(value.url).to.not.be.null;
            expect(value.head_commit).to.not.be.null;
        });
    });
});

describe('Casting of event payload on push', () => {
    const parsedSchema = schemaOnPush.cast(event_payload_data_text);
    it('should set all attributes on first level with the expected values', () => {
        expect(parsedSchema.base_ref).to.be.null;
        expect(parsedSchema.compare).to.eql("https://github.com/efcloud/el-msteams-post-action/compare/b2b8870e14e2...9717ce415d88");
    });

    it('should set all nested attributes with the expected values', () => {
        const parsedSchema = schemaOnPush.cast(event_payload_data_text);
        expect(parsedSchema.base_ref).to.be.null;
        expect(parsedSchema.compare).to.eql("https://github.com/efcloud/el-msteams-post-action/compare/b2b8870e14e2...9717ce415d88");
        expect(parsedSchema.pusher.email).to.eql("54802933+eleni-salamani@users.noreply.github.com");
        expect(parsedSchema.pusher.name).to.eql("eleni-salamani");
        expect(parsedSchema.head_commit.message).to.eql("Try to return the event payload as separate artifact in job");
        expect(parsedSchema.head_commit.url).to.eql("https://github.com/efcloud/el-msteams-post-action/commit/9717ce415d885594b699d3ab63ffb26a4ae48043");
        expect(parsedSchema.head_commit.id).to.eql("9717ce415d885594b699d3ab63ffb26a4ae48043");
        expect(parsedSchema.head_commit.author.email).to.eql("eleni.salamani@ef.com");
        expect(parsedSchema.head_commit.committer.name).to.eql("Eleni Salamani");
    });
});
