function getProgress() {
    return null;
}

function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://plr.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://plr.datamundi.space/login";
    }
    else {
        return "http://localhost:5994/login";
    }
}

exports.getProgress = getProgress;
exports.getUrl = getUrl;