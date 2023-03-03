(async () => {
	if (window.location.pathname !== "/profile/datamundiStaffChat") {
		try {
			const {token} = await fetchToken();

			let websocketUrl = "ws://localhost:1211";

			if (window.location.host.endsWith('.eu')) {
				websocketUrl = "wss://chat-service.datamundi.eu/freelancer";
			}
			else if (window.location.host.endsWith('.space')) {
				websocketUrl = "wss://chat-service.datamundi.space/freelancer";
			}

			const conn  = new WebSocket(websocketUrl + '?token=' + token);

			conn.addEventListener("open", (evt) => {
				console.log("Successfully opened ws connection.");
			});
			conn.addEventListener("error", (err) => {
				console.error(err);
			});
			conn.addEventListener("message", (msg) => {
				try {
					const json = JSON.parse(msg.data);
					if (json.method === "RECEIVE_MESSAGE") {
						const notification = new Notification('New message received from accountant', {
							body: json.message.body,
							icon: '/react/chat/OGimageFB-e1610124937181.png'
						});
						notification.onclick = (evt) => {
							const invoiceId = json.message.invoiceId;
							window.location.replace(window.origin + "/profile/datamundiStaffChat");
							// history.push('/payments/paidInvoices?invoiceId=' + invoiceId);
						};
					}
				}
				catch (e) {
					console.error(e);
				}
			});
			conn.addEventListener("close", (evt) => {
				console.log("Connection closed");
			});
		}
		catch (e) {
			console.error(e);
		}
	}

})();

async function fetchToken() {
	const response = await fetch(window.origin + '/rest-api/v1/auth', {
		redirect: "error"
	});
	return response.json();
}