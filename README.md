# el-msteams-post-action
This repo contains a re-usable GitHub Action that, when installed, will post to Microsoft Teams details about various GitHub events.

### Pre-requisites
To run this action you'll need:

1. A Microsoft Teams account.
2. Teams webhook "Incoming Webhook" added to the channel of your choice.

This will provide a URL that will be added to the GitHub workflow as a secret. 

https://docs.microsoft.com/en-us/outlook/actionable-messages/actionable-messages-via-connectors

Please note that additional permissions are needed for the webhook addition to be completed successfully.

3. The webhook URL set as a secret in the repository, e.g. TEAMS_WEBHOOK_URL

### Usage

The action can be configured with the following variables/parameters

| Name        | Category   | Description | 
| ------------|------------|------------ |
| **webhook_url** | obligatory | Set to the webhook URL saved as a secret, e.g. ${{ secrets.TEAMS_WEBHOOK_URL }} |
| **job_status**  | obligatory | Always set to ${{ job.status }} , to pass the job status to the action |
| **event_id**    | optional   | If set, it can override the value of the triggering event. Free text entry, by default it can be any of "push", "pull_request", "issue", "issue_comment" |
| **details**     | optional   | If set, it can override the details displayed for any of the default triggering events. |

### Examples

Example of using the action for a push event, without overriding the default values

```
name: "Send notifications to MS Teams channel on push"

on: [push]

jobs:
  notify:
    runs-on: macos-latest
    steps:
      - uses: efcloud/el-msteams-post-action@master
        if: always()
        with:
          job_status: ${{ job.status }}
          webhook_url: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

Example of using the action for a custom event, overriding the default values

```
name: "Send notifications to MS Teams channel when testing completes"

on: [push]

jobs:
  notify:
    runs-on: macos-latest
    steps:
      - uses: efcloud/el-msteams-post-action@master
        if: always()
        with:
          job_status: ${{ job.status }}
          event_id: "testing completed"
          details: "Tests run:2 Failed:0"
          webhook_url: ${{ secrets.TEAMS_WEBHOOK_URL }}
```
