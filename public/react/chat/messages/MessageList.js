import MessageListItem from "./MessageListItem.js";

const e = React.createElement;

function MessageList({messages, setSelectedInvoiceId}) {
	return e('div', null, messages.map((value, key) => {
		return e(MessageListItem,  {message:value, key:key, setSelectedInvoiceId})
	}));
}

export default MessageList;