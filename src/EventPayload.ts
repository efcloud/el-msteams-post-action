// Stores the currently-being-typechecked object for error messages.
let obj: any = null;
export class EventPayload {
    public readonly ref: string;
    public readonly before: string;
    public readonly after: string;
    public readonly created: boolean;
    public readonly deleted: boolean;
    public readonly forced: boolean;
    public readonly base_ref: null;
    public readonly compare: string;
    public readonly commits: null[] | null;
    public readonly head_commit: null;
    public readonly repository: Repository;
    public readonly pusher: Pusher;
    public readonly sender: Sender;
    public static Parse(d: string): EventPayload {
        return EventPayload.Create(JSON.parse(d));
    }
    public static Create(d: any, field: string = 'root'): EventPayload {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        } else if (typeof(d) !== 'object') {
            throwNotObject(field, d, false);
        } else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.ref, false, field + ".ref");
        checkString(d.before, false, field + ".before");
        checkString(d.after, false, field + ".after");
        checkBoolean(d.created, false, field + ".created");
        checkBoolean(d.deleted, false, field + ".deleted");
        checkBoolean(d.forced, false, field + ".forced");
        checkNotNull(d.base_ref, field + ".base_ref");
        if (d.base_ref === undefined) {
            d.base_ref = null;
        }
        checkString(d.compare, false, field + ".compare");
        checkArray(d.commits, field + ".commits");
        if (d.commits) {
            for (let i = 0; i < d.commits.length; i++) {
                checkNotNull(d.commits[i], field + ".commits" + "[" + i + "]");
                if (d.commits[i] === undefined) {
                    d.commits[i] = null;
                }
            }
        }
        if (d.commits === undefined) {
            d.commits = null;
        }
        checkNotNull(d.head_commit, field + ".head_commit");
        if (d.head_commit === undefined) {
            d.head_commit = null;
        }
        d.repository = Repository.Create(d.repository, field + ".repository");
        d.pusher = Pusher.Create(d.pusher, field + ".pusher");
        d.sender = Sender.Create(d.sender, field + ".sender");
        return new EventPayload(d);
    }
    private constructor(d: any) {
        this.ref = d.ref;
        this.before = d.before;
        this.after = d.after;
        this.created = d.created;
        this.deleted = d.deleted;
        this.forced = d.forced;
        this.base_ref = d.base_ref;
        this.compare = d.compare;
        this.commits = d.commits;
        this.head_commit = d.head_commit;
        this.repository = d.repository;
        this.pusher = d.pusher;
        this.sender = d.sender;
    }
}

export class Repository {
    public readonly id: number;
    public readonly node_id: string;
    public readonly name: string;
    public readonly full_name: string;
    public readonly private: boolean;
    public readonly owner: Owner;
    public readonly html_url: string;
    public readonly description: null;
    public readonly fork: boolean;
    public readonly url: string;
    public readonly forks_url: string;
    public readonly keys_url: string;
    public readonly collaborators_url: string;
    public readonly teams_url: string;
    public readonly hooks_url: string;
    public readonly issue_events_url: string;
    public readonly events_url: string;
    public readonly assignees_url: string;
    public readonly branches_url: string;
    public readonly tags_url: string;
    public readonly blobs_url: string;
    public readonly git_tags_url: string;
    public readonly git_refs_url: string;
    public readonly trees_url: string;
    public readonly statuses_url: string;
    public readonly languages_url: string;
    public readonly stargazers_url: string;
    public readonly contributors_url: string;
    public readonly subscribers_url: string;
    public readonly subscription_url: string;
    public readonly commits_url: string;
    public readonly git_commits_url: string;
    public readonly comments_url: string;
    public readonly issue_comment_url: string;
    public readonly contents_url: string;
    public readonly compare_url: string;
    public readonly merges_url: string;
    public readonly archive_url: string;
    public readonly downloads_url: string;
    public readonly issues_url: string;
    public readonly pulls_url: string;
    public readonly milestones_url: string;
    public readonly notifications_url: string;
    public readonly labels_url: string;
    public readonly releases_url: string;
    public readonly deployments_url: string;
    public readonly created_at: number;
    public readonly updated_at: string;
    public readonly pushed_at: number;
    public readonly git_url: string;
    public readonly ssh_url: string;
    public readonly clone_url: string;
    public readonly svn_url: string;
    public readonly homepage: null;
    public readonly size: number;
    public readonly stargazers_count: number;
    public readonly watchers_count: number;
    public readonly language: string;
    public readonly has_issues: boolean;
    public readonly has_projects: boolean;
    public readonly has_downloads: boolean;
    public readonly has_wiki: boolean;
    public readonly has_pages: boolean;
    public readonly forks_count: number;
    public readonly mirror_url: null;
    public readonly archived: boolean;
    public readonly disabled: boolean;
    public readonly open_issues_count: number;
    public readonly license: null;
    public readonly forks: number;
    public readonly open_issues: number;
    public readonly watchers: number;
    public readonly default_branch: string;
    public readonly stargazers: number;
    public readonly master_branch: string;
    public static Parse(d: string): Repository {
        return Repository.Create(JSON.parse(d));
    }
    public static Create(d: any, field: string = 'root'): Repository {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        } else if (typeof(d) !== 'object') {
            throwNotObject(field, d, false);
        } else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.name, false, field + ".name");
        checkString(d.full_name, false, field + ".full_name");
        checkBoolean(d.private, false, field + ".private");
        d.owner = Owner.Create(d.owner, field + ".owner");
        checkString(d.html_url, false, field + ".html_url");
        checkNotNull(d.description, field + ".description");
        if (d.description === undefined) {
            d.description = null;
        }
        checkBoolean(d.fork, false, field + ".fork");
        checkString(d.url, false, field + ".url");
        checkString(d.forks_url, false, field + ".forks_url");
        checkString(d.keys_url, false, field + ".keys_url");
        checkString(d.collaborators_url, false, field + ".collaborators_url");
        checkString(d.teams_url, false, field + ".teams_url");
        checkString(d.hooks_url, false, field + ".hooks_url");
        checkString(d.issue_events_url, false, field + ".issue_events_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.assignees_url, false, field + ".assignees_url");
        checkString(d.branches_url, false, field + ".branches_url");
        checkString(d.tags_url, false, field + ".tags_url");
        checkString(d.blobs_url, false, field + ".blobs_url");
        checkString(d.git_tags_url, false, field + ".git_tags_url");
        checkString(d.git_refs_url, false, field + ".git_refs_url");
        checkString(d.trees_url, false, field + ".trees_url");
        checkString(d.statuses_url, false, field + ".statuses_url");
        checkString(d.languages_url, false, field + ".languages_url");
        checkString(d.stargazers_url, false, field + ".stargazers_url");
        checkString(d.contributors_url, false, field + ".contributors_url");
        checkString(d.subscribers_url, false, field + ".subscribers_url");
        checkString(d.subscription_url, false, field + ".subscription_url");
        checkString(d.commits_url, false, field + ".commits_url");
        checkString(d.git_commits_url, false, field + ".git_commits_url");
        checkString(d.comments_url, false, field + ".comments_url");
        checkString(d.issue_comment_url, false, field + ".issue_comment_url");
        checkString(d.contents_url, false, field + ".contents_url");
        checkString(d.compare_url, false, field + ".compare_url");
        checkString(d.merges_url, false, field + ".merges_url");
        checkString(d.archive_url, false, field + ".archive_url");
        checkString(d.downloads_url, false, field + ".downloads_url");
        checkString(d.issues_url, false, field + ".issues_url");
        checkString(d.pulls_url, false, field + ".pulls_url");
        checkString(d.milestones_url, false, field + ".milestones_url");
        checkString(d.notifications_url, false, field + ".notifications_url");
        checkString(d.labels_url, false, field + ".labels_url");
        checkString(d.releases_url, false, field + ".releases_url");
        checkString(d.deployments_url, false, field + ".deployments_url");
        checkNumber(d.created_at, false, field + ".created_at");
        checkString(d.updated_at, false, field + ".updated_at");
        checkNumber(d.pushed_at, false, field + ".pushed_at");
        checkString(d.git_url, false, field + ".git_url");
        checkString(d.ssh_url, false, field + ".ssh_url");
        checkString(d.clone_url, false, field + ".clone_url");
        checkString(d.svn_url, false, field + ".svn_url");
        checkNotNull(d.homepage, field + ".homepage");
        if (d.homepage === undefined) {
            d.homepage = null;
        }
        checkNumber(d.size, false, field + ".size");
        checkNumber(d.stargazers_count, false, field + ".stargazers_count");
        checkNumber(d.watchers_count, false, field + ".watchers_count");
        checkString(d.language, false, field + ".language");
        checkBoolean(d.has_issues, false, field + ".has_issues");
        checkBoolean(d.has_projects, false, field + ".has_projects");
        checkBoolean(d.has_downloads, false, field + ".has_downloads");
        checkBoolean(d.has_wiki, false, field + ".has_wiki");
        checkBoolean(d.has_pages, false, field + ".has_pages");
        checkNumber(d.forks_count, false, field + ".forks_count");
        checkNotNull(d.mirror_url, field + ".mirror_url");
        if (d.mirror_url === undefined) {
            d.mirror_url = null;
        }
        checkBoolean(d.archived, false, field + ".archived");
        checkBoolean(d.disabled, false, field + ".disabled");
        checkNumber(d.open_issues_count, false, field + ".open_issues_count");
        checkNotNull(d.license, field + ".license");
        if (d.license === undefined) {
            d.license = null;
        }
        checkNumber(d.forks, false, field + ".forks");
        checkNumber(d.open_issues, false, field + ".open_issues");
        checkNumber(d.watchers, false, field + ".watchers");
        checkString(d.default_branch, false, field + ".default_branch");
        checkNumber(d.stargazers, false, field + ".stargazers");
        checkString(d.master_branch, false, field + ".master_branch");
        return new Repository(d);
    }
    private constructor(d: any) {
        this.id = d.id;
        this.node_id = d.node_id;
        this.name = d.name;
        this.full_name = d.full_name;
        this.private = d.private;
        this.owner = d.owner;
        this.html_url = d.html_url;
        this.description = d.description;
        this.fork = d.fork;
        this.url = d.url;
        this.forks_url = d.forks_url;
        this.keys_url = d.keys_url;
        this.collaborators_url = d.collaborators_url;
        this.teams_url = d.teams_url;
        this.hooks_url = d.hooks_url;
        this.issue_events_url = d.issue_events_url;
        this.events_url = d.events_url;
        this.assignees_url = d.assignees_url;
        this.branches_url = d.branches_url;
        this.tags_url = d.tags_url;
        this.blobs_url = d.blobs_url;
        this.git_tags_url = d.git_tags_url;
        this.git_refs_url = d.git_refs_url;
        this.trees_url = d.trees_url;
        this.statuses_url = d.statuses_url;
        this.languages_url = d.languages_url;
        this.stargazers_url = d.stargazers_url;
        this.contributors_url = d.contributors_url;
        this.subscribers_url = d.subscribers_url;
        this.subscription_url = d.subscription_url;
        this.commits_url = d.commits_url;
        this.git_commits_url = d.git_commits_url;
        this.comments_url = d.comments_url;
        this.issue_comment_url = d.issue_comment_url;
        this.contents_url = d.contents_url;
        this.compare_url = d.compare_url;
        this.merges_url = d.merges_url;
        this.archive_url = d.archive_url;
        this.downloads_url = d.downloads_url;
        this.issues_url = d.issues_url;
        this.pulls_url = d.pulls_url;
        this.milestones_url = d.milestones_url;
        this.notifications_url = d.notifications_url;
        this.labels_url = d.labels_url;
        this.releases_url = d.releases_url;
        this.deployments_url = d.deployments_url;
        this.created_at = d.created_at;
        this.updated_at = d.updated_at;
        this.pushed_at = d.pushed_at;
        this.git_url = d.git_url;
        this.ssh_url = d.ssh_url;
        this.clone_url = d.clone_url;
        this.svn_url = d.svn_url;
        this.homepage = d.homepage;
        this.size = d.size;
        this.stargazers_count = d.stargazers_count;
        this.watchers_count = d.watchers_count;
        this.language = d.language;
        this.has_issues = d.has_issues;
        this.has_projects = d.has_projects;
        this.has_downloads = d.has_downloads;
        this.has_wiki = d.has_wiki;
        this.has_pages = d.has_pages;
        this.forks_count = d.forks_count;
        this.mirror_url = d.mirror_url;
        this.archived = d.archived;
        this.disabled = d.disabled;
        this.open_issues_count = d.open_issues_count;
        this.license = d.license;
        this.forks = d.forks;
        this.open_issues = d.open_issues;
        this.watchers = d.watchers;
        this.default_branch = d.default_branch;
        this.stargazers = d.stargazers;
        this.master_branch = d.master_branch;
    }
}

export class Owner {
    public readonly name: string;
    public readonly email: string;
    public readonly login: string;
    public readonly id: number;
    public readonly node_id: string;
    public readonly avatar_url: string;
    public readonly gravatar_id: string;
    public readonly url: string;
    public readonly html_url: string;
    public readonly followers_url: string;
    public readonly following_url: string;
    public readonly gists_url: string;
    public readonly starred_url: string;
    public readonly subscriptions_url: string;
    public readonly organizations_url: string;
    public readonly repos_url: string;
    public readonly events_url: string;
    public readonly received_events_url: string;
    public readonly type: string;
    public readonly site_admin: boolean;
    public static Parse(d: string): Owner {
        return Owner.Create(JSON.parse(d));
    }
    public static Create(d: any, field: string = 'root'): Owner {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        } else if (typeof(d) !== 'object') {
            throwNotObject(field, d, false);
        } else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.name, false, field + ".name");
        checkString(d.email, false, field + ".email");
        checkString(d.login, false, field + ".login");
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.avatar_url, false, field + ".avatar_url");
        checkString(d.gravatar_id, false, field + ".gravatar_id");
        checkString(d.url, false, field + ".url");
        checkString(d.html_url, false, field + ".html_url");
        checkString(d.followers_url, false, field + ".followers_url");
        checkString(d.following_url, false, field + ".following_url");
        checkString(d.gists_url, false, field + ".gists_url");
        checkString(d.starred_url, false, field + ".starred_url");
        checkString(d.subscriptions_url, false, field + ".subscriptions_url");
        checkString(d.organizations_url, false, field + ".organizations_url");
        checkString(d.repos_url, false, field + ".repos_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.received_events_url, false, field + ".received_events_url");
        checkString(d.type, false, field + ".type");
        checkBoolean(d.site_admin, false, field + ".site_admin");
        return new Owner(d);
    }
    private constructor(d: any) {
        this.name = d.name;
        this.email = d.email;
        this.login = d.login;
        this.id = d.id;
        this.node_id = d.node_id;
        this.avatar_url = d.avatar_url;
        this.gravatar_id = d.gravatar_id;
        this.url = d.url;
        this.html_url = d.html_url;
        this.followers_url = d.followers_url;
        this.following_url = d.following_url;
        this.gists_url = d.gists_url;
        this.starred_url = d.starred_url;
        this.subscriptions_url = d.subscriptions_url;
        this.organizations_url = d.organizations_url;
        this.repos_url = d.repos_url;
        this.events_url = d.events_url;
        this.received_events_url = d.received_events_url;
        this.type = d.type;
        this.site_admin = d.site_admin;
    }
}

export class Pusher {
    public readonly name: string;
    public readonly email: string;
    public static Parse(d: string): Pusher {
        return Pusher.Create(JSON.parse(d));
    }
    public static Create(d: any, field: string = 'root'): Pusher {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        } else if (typeof(d) !== 'object') {
            throwNotObject(field, d, false);
        } else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.name, false, field + ".name");
        checkString(d.email, false, field + ".email");
        return new Pusher(d);
    }
    private constructor(d: any) {
        this.name = d.name;
        this.email = d.email;
    }
}

export class Sender {
    public readonly login: string;
    public readonly id: number;
    public readonly node_id: string;
    public readonly avatar_url: string;
    public readonly gravatar_id: string;
    public readonly url: string;
    public readonly html_url: string;
    public readonly followers_url: string;
    public readonly following_url: string;
    public readonly gists_url: string;
    public readonly starred_url: string;
    public readonly subscriptions_url: string;
    public readonly organizations_url: string;
    public readonly repos_url: string;
    public readonly events_url: string;
    public readonly received_events_url: string;
    public readonly type: string;
    public readonly site_admin: boolean;
    public static Parse(d: string): Sender {
        return Sender.Create(JSON.parse(d));
    }
    public static Create(d: any, field: string = 'root'): Sender {
        if (!field) {
            obj = d;
            field = "root";
        }
        if (d === null || d === undefined) {
            throwNull2NonNull(field, d);
        } else if (typeof(d) !== 'object') {
            throwNotObject(field, d, false);
        } else if (Array.isArray(d)) {
            throwIsArray(field, d, false);
        }
        checkString(d.login, false, field + ".login");
        checkNumber(d.id, false, field + ".id");
        checkString(d.node_id, false, field + ".node_id");
        checkString(d.avatar_url, false, field + ".avatar_url");
        checkString(d.gravatar_id, false, field + ".gravatar_id");
        checkString(d.url, false, field + ".url");
        checkString(d.html_url, false, field + ".html_url");
        checkString(d.followers_url, false, field + ".followers_url");
        checkString(d.following_url, false, field + ".following_url");
        checkString(d.gists_url, false, field + ".gists_url");
        checkString(d.starred_url, false, field + ".starred_url");
        checkString(d.subscriptions_url, false, field + ".subscriptions_url");
        checkString(d.organizations_url, false, field + ".organizations_url");
        checkString(d.repos_url, false, field + ".repos_url");
        checkString(d.events_url, false, field + ".events_url");
        checkString(d.received_events_url, false, field + ".received_events_url");
        checkString(d.type, false, field + ".type");
        checkBoolean(d.site_admin, false, field + ".site_admin");
        return new Sender(d);
    }
    private constructor(d: any) {
        this.login = d.login;
        this.id = d.id;
        this.node_id = d.node_id;
        this.avatar_url = d.avatar_url;
        this.gravatar_id = d.gravatar_id;
        this.url = d.url;
        this.html_url = d.html_url;
        this.followers_url = d.followers_url;
        this.following_url = d.following_url;
        this.gists_url = d.gists_url;
        this.starred_url = d.starred_url;
        this.subscriptions_url = d.subscriptions_url;
        this.organizations_url = d.organizations_url;
        this.repos_url = d.repos_url;
        this.events_url = d.events_url;
        this.received_events_url = d.received_events_url;
        this.type = d.type;
        this.site_admin = d.site_admin;
    }
}

function throwNull2NonNull(field: string, d: any): never {
    return errorHelper(field, d, "non-nullable object", false);
}
function throwNotObject(field: string, d: any, nullable: boolean): never {
    return errorHelper(field, d, "object", nullable);
}
function throwIsArray(field: string, d: any, nullable: boolean): never {
    return errorHelper(field, d, "object", nullable);
}
function checkArray(d: any, field: string): void {
    if (!Array.isArray(d) && d !== null && d !== undefined) {
        errorHelper(field, d, "array", true);
    }
}
function checkNumber(d: any, nullable: boolean, field: string): void {
    if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "number", nullable);
    }
}
function checkBoolean(d: any, nullable: boolean, field: string): void {
    if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "boolean", nullable);
    }
}
function checkString(d: any, nullable: boolean, field: string): void {
    if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
        errorHelper(field, d, "string", nullable);
    }
}
function checkNotNull(d: any, field: string): void {
    if (d === null || d === undefined) {
        errorHelper(field, d, "null or undefined", false);
    }
}
function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
    if (nullable) {
        type += ", null, or undefined";
    }
    throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
