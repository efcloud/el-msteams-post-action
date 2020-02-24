// Stores the currently-being-typechecked object for error messages.
let obj: any = null;
export class NotificationMessage {
    public account: string;
    public message: string;
    public url: string;
    public details: string;

    // account = event_payload_data['pusher']['name'];
    // message = `**Commit to GitHub** by ${account}`;
    // url = event_payload_data['compare'];
    // details = `Comment: ${event_payload_data['head_commit']['message']}`;

    public constructor(account: string, message: string, url: string, details: string) {
        this.account = account;
        this.message = message;
        this.url = url;
        this.details = details;
    }
}


// function throwNull2NonNull(field: string, d: any): never {
//     return errorHelper(field, d, "non-nullable object", false);
// }
// function throwNotObject(field: string, d: any, nullable: boolean): never {
//     return errorHelper(field, d, "object", nullable);
// }
// function throwIsArray(field: string, d: any, nullable: boolean): never {
//     return errorHelper(field, d, "object", nullable);
// }
// function checkArray(d: any, field: string): void {
//     if (!Array.isArray(d) && d !== null && d !== undefined) {
//         errorHelper(field, d, "array", true);
//     }
// }
// function checkNumber(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "number", nullable);
//     }
// }
// function checkBoolean(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "boolean", nullable);
//     }
// }
// function checkString(d: any, nullable: boolean, field: string): void {
//     if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
//         errorHelper(field, d, "string", nullable);
//     }
// }
// function checkNull(d: any, field: string): void {
//     if (d !== null && d !== undefined) {
//         errorHelper(field, d, "null or undefined", false);
//     }
// }
// function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
//     if (nullable) {
//         type += ", null, or undefined";
//     }
//     throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
// }
