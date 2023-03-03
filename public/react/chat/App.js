const {useState, useEffect} = React;
const e = React.createElement;

import Messages from "./messages/Messages.js";
// import logo from "./OGimageFB-e1610124937181.png";

function App() {
	const [token, setToken] = useState(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const {token} = await fetchToken();
				if (isMounted) {
					setToken(token);
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

	async function fetchToken() {
		const response = await fetch(window.origin + '/rest-api/v1/auth');
		return response.json();
	}

	return e(Messages, {token});
}

export default App;
