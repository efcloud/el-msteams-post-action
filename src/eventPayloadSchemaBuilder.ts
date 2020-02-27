const yup = require('yup');

export const schemaOnpush = yup.object().shape({
    base_ref: yup.string().nullable(),
    compare: yup.string().required(),
    pusher: yup.object().shape({
        name: yup.string(),
        email: yup.string().email()
    }).required(),
    head_commit: yup.object().shape({
        message: yup.string().required(),
        url: yup.string(),
        id: yup.string(),
        author: yup.object(),
        committer: yup.object()
    })
});

export const schemaOnPullRequest = yup.object().shape({
    action: yup.string().nullable(),
    pull_request: yup.object().shape({
        html_url: yup.string().required(),
        title: yup.string().required(),
        user: yup.object().shape({
            login: yup.string().required()
        }),
        base: yup.object().shape({
            ref: yup.string().required(),
            label: yup.string().required()
        }),
        head: yup.object().shape({
            ref: yup.string().required(),
            label: yup.string().required()
        })
    })
});

export const schemaOnIssue = yup.object().shape({
    action: yup.string().nullable(),
    sender: yup.object().shape({
        login: yup.string().required()
    }),
    issue: yup.object().shape({
        html_url: yup.string().required(),
        title: yup.string().required(),
        state: yup.string().required(),
        assignee: yup.object().shape({
            login: yup.string().required()
        })
    })
});

export const schemaOnIssueComment = yup.object().shape({
    action: yup.string().nullable(),
    issue: yup.object().shape({
        html_url: yup.string().required(),
        title: yup.string().required(),
        state: yup.string().required(),
        assignee: yup.object().shape({
            login: yup.string().required()
        })
    }),
    comment: yup.object().shape({
        body: yup.string().required(),
        user: yup.object().shape({
            login: yup.string().required()
        })
    })
});
