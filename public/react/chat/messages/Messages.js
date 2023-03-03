const e = React.createElement;
const {useState, useEffect, useRef} = React;

import MessageListItem from "./MessageListItem.js";
import MessageList from "./MessageList.js";
import SendMessage from "./SendMessage.js";

function Messages({token}) {
	const [typing, setTyping] = useState(false);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
	const [ws, setWs] = useState(null);
	const scrollContainer = useRef(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const {messages} = await fetchMessages();
				if (isMounted) {
					setMessages(messages);
				}
			}
			catch (e) {
				console.error(e);
			}
		})();
		return () => {
			isMounted = false;
		}
	}, []);
	useEffect(() => {
		let timeoutId = null;

		if (token) {
			try {
				let websocketUrl = "ws://localhost:1211";

				if (window.location.host.endsWith('.eu')) {
					websocketUrl = "wss://chat-service.datamundi.eu/freelancer";
				}
				else if (window.location.host.endsWith('.space')) {
					websocketUrl = "wss://chat-service.datamundi.space/freelancer";
				}

				const conn  = new WebSocket(websocketUrl + '?token=' + token);
				setWs(conn);

				conn.addEventListener("open", (evt) => {
					console.log("Successfully opened ws connection.");
				});
				conn.addEventListener("error", (err) => {
					console.error(err);
				});
				conn.addEventListener("message", (msg) => {
					try {
						const json = JSON.parse(msg.data);
						console.log(json);
						if (json.method === "RECEIVE_MESSAGE") {
							setMessages((prevState) => {
								return [...prevState, json.message];
							});
						}
						else if (json.method === "TYPING") {
							setTyping(true);
							if (timeoutId) {
								clearTimeout(timeoutId);
							}
							timeoutId = setTimeout(() => {
								setTyping(false);
							}, 500);
							requestAnimationFrame(() => {
								try {
									scrollContainer.current.scrollTo(0, scrollContainer.current.scrollHeight);
								}
								catch (e) {
									console.error(e);
								}
							});
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
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}
	}, [token]);

	useEffect(() => {
		requestAnimationFrame(() => {
			try {
				scrollContainer.current.scrollTo(0, scrollContainer.current.scrollHeight);
			}
			catch (e) {
				console.error(e);
			}
		});
	}, [JSON.stringify(messages)]);
	async function fetchMessages() {
		const response = await fetch(window.origin + '/rest-api/v1/messages', {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});
		return response.json();
	}

	function sendMessage(evt) {
		evt.preventDefault();

		ws.send(JSON.stringify({
			method: "SEND_MESSAGE",
			invoiceId: selectedInvoiceId,
			body: message
		}));
		setMessage('');
	}

	return e('div', {className: "mt-5"}, [
		e('div', {ref: scrollContainer, id: 'chat-scroll-container', key: 1, style: {maxHeight:'80vh', width: "max-content", overflowY: 'scroll', overflowX: 'hidden'}}, [
			e(MessageList, {messages, key:1, setSelectedInvoiceId}),
			typing && e(MessageListItem, {message: {body: 'Accountant is typing...', fromAccountant: true}, key:2, typing: true}),
		]),
		e(SendMessage, {key: 2, message, setMessage, sendMessage, selectedInvoiceId, ws})

	]);
}

export default Messages;