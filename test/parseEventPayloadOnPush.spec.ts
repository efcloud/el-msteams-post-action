import { expect } from 'chai';
import 'mocha';
import data from '../src/resources/event_payload_onPush.json';
import {schemaOnpush} from '../src/eventPayloadSchemaBuilder';
const event_payload_data_text =  JSON.stringify(data);

describe('Event payload on push', () => {
    const parsed_schema = schemaOnpush.validateSync(event_payload_data_text);

    it('should not be an empty string', () => {
        expect(event_payload_data_text.length).to.be.greaterThan(0);
    });

    it('should include a null base_ref', () => {
        expect(parsed_schema.base_ref).to.be.null;
    });

    it('should include the expected compare value', () => {
        expect(parsed_schema.compare).to.eql("https://github.com/efcloud/el-msteams-post-action/compare/b2b8870e14e2...9717ce415d88");
    });

    it('should include the expected pusher.email value', () => {
        expect(parsed_schema.pusher.email).to.eql("54802933+eleni-salamani@users.noreply.github.com");
    });

    it('should include the expected pusher.name value', () => {
        expect(parsed_schema.pusher.name).to.eql("eleni-salamani");
    });

    it('should include the expected head_commit.message value', () => {
        expect(parsed_schema.head_commit.message).to.eql("Try to return the event payload as separate artifact in job");
    });

    it('should include the expected head_commit.url value', () => {
        expect(parsed_schema.head_commit.url).to.eql("https://github.com/efcloud/el-msteams-post-action/commit/9717ce415d885594b699d3ab63ffb26a4ae48043");
    });

    it('should include the expected head_commit.author.email value', () => {
        expect(parsed_schema.head_commit.author.email).to.eql("eleni.salamani@ef.com");
    });

    it('should include the expected head_commit.id value', () => {
        expect(parsed_schema.head_commit.id).to.eql("9717ce415d885594b699d3ab63ffb26a4ae48043");
    });

    it('should include the expected head_commit.committer.name value', () => {
        expect(parsed_schema.head_commit.committer.name).to.eql("Eleni Salamani");
    });
});
