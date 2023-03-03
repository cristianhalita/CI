function getProgress() {
	return null;
}

function getUrl(NODE_ENV) {
	if (NODE_ENV == "eu") {
		return "https://ucq.datamundi.eu/login";
	}
	else if (NODE_ENV == "production") {
		return "https://ucq.datamundi.space/login";
	}
	else {
		return "http://localhost:4511/login";
	}
}

exports.getUrl = getUrl;
exports.getProgress = getProgress;