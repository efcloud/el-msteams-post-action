export class NotificationMessage {
    public message: string;

    public url: string;

    public details: string;

    public constructor(message: string, url: string, details: string) {
        this.message = message;
        this.url = url;
        this.details = details;
    }

    public getMessage() {
        return this.message;
    }

    public getUrl() {
        return this.url;
    }

    public getDetails() {
        return this.details;
    }
}
