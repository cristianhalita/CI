const e = React.createElement;

function MessageListItem ({message, setSelectedInvoiceId, typing = false}) {
	let className;
	let style = {
		backgroundColor: "lightblue",
		width: 'max-content'
	};

	if (message.fromAccountant) {
		className = "text-left";
		style.backgroundColor = "lightgrey";
	}
	else {
		className = "ml-auto text-right"
	}

	return e('div', {className, style: {width: 'max-content'}}, [
		!typing && e('b', {key: 1, style: {display: "block"}}, 'Concerning your invoice number: ' + message.invoiceId),
		e('span', {key: 2, style: {color: "darkgrey"}}, message.stamp),
		e('div', {key:3, className: className + " border  rounded mb-1 p-1", style},  [
			message.body,
			(Boolean(message.fromAccountant) && !typing) && e('button', {key: 3, className: "btn btn-sm btn-secondary ml-2", onClick: (evt) => {
				setSelectedInvoiceId(message.invoiceId);
			}}, 'Reply')
		])
	]);
}

export default MessageListItem;