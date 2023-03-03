function getUrl(NODE_ENV) {
    if (NODE_ENV == "eu") {
        return "https://apb.datamundi.eu/login";
    }
    else if (NODE_ENV == "production") {
        return "https://apb.datamundi.space/login";
    }
    else {
        return "http://localhost:5698/login";
    }
}

exports.getUrl = getUrl;