const showPasswordButton = document.getElementById("showPasswordButton");
const password = document.getElementById("password");
const showConfirmPasswordButton = document.getElementById("showConfirmPasswordButton");
const confirmPassword = document.getElementById("confirmPassword");

showPasswordButton.addEventListener("click", (evt) => {
	if (password.type === "text") {
		password.type = "password";
		showPasswordButton.firstElementChild.classList.remove("bi-eye-slash-fill");
		showPasswordButton.firstElementChild.classList.add("bi-eye-fill");
	}
	else {
		password.type = "text";
		showPasswordButton.firstElementChild.classList.add("bi-eye-slash-fill");
		showPasswordButton.firstElementChild.classList.remove("bi-eye-fill");
	}
});

password.addEventListener("input", (evt) => {
	if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}/.test(evt.target.value)) {
		confirmPassword.disabled = false;
		evt.target.setCustomValidity("");
	}
	else {
		confirmPassword.disabled = true;
		evt.target.setCustomValidity("Make sure your password contains at least 8 characters, including 1 lowercase letter, 1 uppercase letter, 1 digit and 1 special character.");
	}

	confirmPassword.value = "";
	evt.target.reportValidity();

	for (const button of submitButtons) {
		button.disabled = true;
	}
});

showConfirmPasswordButton.addEventListener("click", (evt) => {
	if (confirmPassword.type === "text") {
		confirmPassword.type = "password";
		showConfirmPasswordButton.firstElementChild.classList.remove("bi-eye-slash-fill");
		showConfirmPasswordButton.firstElementChild.classList.add("bi-eye-fill");
	}
	else {
		confirmPassword.type = "text";
		showConfirmPasswordButton.firstElementChild.classList.add("bi-eye-slash-fill");
		showConfirmPasswordButton.firstElementChild.classList.remove("bi-eye-fill");
	}
});

confirmPassword.addEventListener("input", (evt) => {
	if (evt.target.value === password.value) {
		evt.target.setCustomValidity("");
	}
	else {
		evt.target.setCustomValidity("Please check that the confirmed password is the same as the password.");
	}

	evt.target.reportValidity();

	for (const button of submitButtons) {
		button.disabled = true;
	}
});

const submitButtons = [...document.getElementsByTagName("button")].filter(value => value.type === "submit");

confirmPassword.addEventListener("change", async (evt) => {
	if (evt.target.value === password.value) {
		const hash = SHA1(evt.target.value);

		try {
			const response = await fetch('https://api.pwnedpasswords.com/range/' + hash.slice(0, 5));
			const text = await response.text();
			const rows = text.split(/\r\n|\n|\r/);
			for (let pass of rows) {
				if (pass.split(':')[0].toLowerCase() === hash.slice(5).toLowerCase()) {
					alert("Your password has been found in " + pass.split(':')[1] + " data breaches. Please choose another password!");
					evt.target.value = "";
					password.value = "";
				}
			}
		}
		catch (e) {
			console.error(e);
		}
		finally {
			for (const button of submitButtons) {
				button.disabled = false;
			}
		}
	}
});

function SHA1(msg) {
	function rotate_left(n,s) {
		return ( n<<s ) | (n>>>(32-s));
	}

	function cvt_hex(val) {
		let str='';
		for(let i=7; i>=0; i-- ) {
			const v = (val>>>(i*4))&0x0f;
			str += v.toString(16);
		}
		return str;
	}

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,'\n');
		let utftext = '';
		for (let n = 0; n < string.length; n++) {
			const c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	}

	let blockstart;
	let i, j;
	let W = new Array(80);
	let H0 = 0x67452301;
	let H1 = 0xEFCDAB89;
	let H2 = 0x98BADCFE;
	let H3 = 0x10325476;
	let H4 = 0xC3D2E1F0;
	let A, B, C, D, E;
	let temp;
	msg = Utf8Encode(msg);
	let msg_len = msg.length;
	let word_array = new Array();
	for( i=0; i<msg_len-3; i+=4 ) {
		j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
		word_array.push( j );
	}
	switch( msg_len % 4 ) {
		case 0:
			i = 0x080000000;
			break;
		case 1:
			i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
			break;
		case 2:
			i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
			break;
		case 3:
			i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8 | 0x80;
			break;
	}
	word_array.push( i );
	while( (word_array.length % 16) != 14 ) word_array.push( 0 );
	word_array.push( msg_len>>>29 );
	word_array.push( (msg_len<<3)&0x0ffffffff );
	for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
		for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
		for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for( i= 0; i<=19; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=20; i<=39; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=40; i<=59; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=60; i<=79; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}

	temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	return temp.toLowerCase();
}
