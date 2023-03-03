const e = React.createElement;

function SendMessage({message, setMessage, sendMessage, selectedInvoiceId, ws}) {
	return e('div', {className: selectedInvoiceId ? "mb-5": "d-none"},
		e('form', {onSubmit: sendMessage, key:1}, [
			e('b', {key: 1}, 'Concerning your invoice number: ' + selectedInvoiceId),
			e('textarea', {className: "form-control", placeholder: "I need more info about ...", required: true, value: message, onChange:(evt) => {
				setMessage(evt.target.value);
				try {
					ws.send(JSON.stringify({
						method: "TYPING",
						invoiceId: selectedInvoiceId
					}));
				}
				catch (e) {
					console.error(e);
				}

			}, key: 2}),
			e('div', {className: "text-center", key: 3}, [
				e('button', {type: "submit", className: "btn btn-success text-center mt-2", key:1}, 'Send message')
			])
		])
	);
}

export default SendMessage;