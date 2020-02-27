const yup = require('yup');

export let schema_on_push = yup.object().shape({
    base_ref: yup.string().nullable(),
    compare: yup.string().required(),
    pusher: yup.object().shape ({
        name: yup.string(),
        email: yup.string().email()
    }).required(),
    head_commit: yup.object().shape ({
        message: yup.string().required(),
        url: yup.string(),
        id: yup.string(),
        author: yup.object(),
        committer: yup.object()
    })
});

export let schema_on_pull_request = yup.object().shape({
    action: yup.string().nullable(),
    pull_request: yup.object().shape ({
        html_url: yup.string().required(),
        title: yup.string().required(),
        user: yup.object().shape ({
            login: yup.string().required()
            }),
        base: yup.object().shape ({
            ref: yup.string().required(),
            label: yup.string().required()
            }),
        head: yup.object().shape ({
            ref: yup.string().required(),
            label: yup.string().required()
        })
    })
});

export let schema_on_issue = yup.object().shape({
    action: yup.string().nullable(),
    sender: yup.object().shape ({
        login: yup.string().required()
    }),
    issue: yup.object().shape ({
        html_url: yup.string().required(),
        title: yup.string().required(),
        state: yup.string().required(),
        assignee: yup.object().shape ({
            login: yup.string().required()
        })
    })
});

export let schema_on_issue_comment = yup.object().shape({
    action: yup.string().nullable(),
    issue: yup.object().shape ({
        html_url: yup.string().required(),
        title: yup.string().required(),
        state: yup.string().required(),
        assignee: yup.object().shape ({
            login: yup.string().required()
        })
    }),
    comment: yup.object().shape ({
        body: yup.string().required(),
        user: yup.object().shape ({
            login: yup.string().required()
        })
    })
});

