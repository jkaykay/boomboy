// ---------------------------------------------------------------------------------

// REGULAR EXPRESSION letIABLES
let nums = /\d/; //all numbers 0-9
let alphanumeric = /[^A-Za-z0-9]/; //Everything not in character list included
let allowdots = /(?![.])[^A-Za-z0-9]/; //Negative lookahead. "." is allowed.
let allowspace = /(?![\s])[^A-Za-z0-9]/; //Negative lookahead. " " is allowed
let dots = /\.{2,}/; //Matches two or more "."

// Focus commands turned into functions so I can type less often.
function goToEmail() {
	document.getElementById("email").focus(); //Focus on HTML element
}

function goToName() {
	document.getElementById("userFirstName").focus(); //Focus on HTML element
}

function goToSurName() {
	document.getElementById("userSurname").focus(); //Focus on HTML element
}

function goToUsername() {
	document.getElementById("username").focus();
}

function goToPassword() {
	document.getElementById("password").focus();
}

function goToPasswordRetype() {
	document.getElementById("passwordcheck").focus();
}

//Main Function called by HTML
function regCheck() {
	let userList = JSON.parse(localStorage.getItem("users") || "[]");

	let checkName = userList.find(({ username }) => username === document.getElementById("username").value);
	let copy = document.getElementById("email").value; // Copy of Email
	let copy2 = document.getElementById("email").value; //Second Copy of Email
	let beforeAt = []; //Array for characters before @
	let afterAt = []; //Array for characters after @
	let place = 0; //Tracker for place of @ in email
	let atCounter = 0; //Tracker for count of @ in email

	//This for loop checks each character for a match to @
	// atCounter increments by 1 everytime a match is found.
	for (let x = 0; x < copy.length; x++) {
		if (copy[x] == "@") {
			atCounter++;
		}
	}

	//This for loop checks each character until it reaches @
	//place letiable then takes value of the index of that @
	for (let i = 0; i < copy.length; i++) {
		if (copy[i] == "@") {
			place = i;
			break; //The loop stops once an @ is reached.
		}
		else {
			continue;
		}
	}

	//This for loop iterates through all characters before @ symbol
	//All of these characters are pushed into array beforeAt
	for (let j = 0; j <= place - 1; j++) {
		beforeAt.push(copy[j]);
	}

	//This for loop iterates through all characters after @ symbol
	//All of these characters are pushed into array afterAt
	for (let t = 0; t <= copy2.length - place; t++) {
		afterAt.push(copy2[t + place + 1]);
	}

	let beforeAtAt = beforeAt.join(""); //Join all elements of array into a string
	let afterAtAt = afterAt.join(""); //Join all elements of array into string

	//Username Checks
	if (document.getElementById("username").value == "") {
		document.getElementById("reg-error-msg").innerHTML = "Username: No text identified.";
		goToUsername(); //call function goToName()
	} else if (document.getElementById("username").value.length < 2) {
		document.getElementById("reg-error-msg").innerHTML = "Username: Name must be 2 or more characters";
		goToUsername();
	}
	/// Check if username already exists
	else if (!(typeof checkName === "undefined")) {
		document.getElementById("reg-error-msg").innerHTML = "Username: The entered username already exists";
		goToUsername();
	}
	//Using REGEX test method, test for match of REGEX in value (Should be false for a pass) 
	else if (alphanumeric.test(document.getElementById("username").value)) {
		document.getElementById("reg-error-msg").innerHTML = "Username: Symbols found present in username";
		goToUsername();
	} else if (document.getElementById("username").value.length > 20) { //Length check for max amount of characters
		document.getElementById("reg-error-msg").innerHTML = "Username: Max length passed (Max 20 characters)";
		goToUserame();
	}

	//First Name Checks
	else if (document.getElementById("userFirstName").value == "") {
		document.getElementById("reg-error-msg").innerHTML = "First Name: No text identified";
		goToName(); //call function goToName()
	} else if (document.getElementById("userFirstName").value.length < 2) {
		document.getElementById("reg-error-msg").innerHTML = "First Name: Name must be 2 or more characters";
		goToName();
	}
	//Using REGEX test method, test for match of REGEX in value (Should be false for a pass) 
	else if (nums.test(document.getElementById("userFirstName").value)) {
		document.getElementById("reg-error-msg").innerHTML = "First Name: Numbers found present in text";
		goToName();
	} else if (alphanumeric.test(document.getElementById("userFirstName").value)) {
		document.getElementById("reg-error-msg").innerHTML = "First Name: Symbols found present in text";
		goToName();
	} else if (document.getElementById("userFirstName").value.length > 20) { //Length check for max amount of characters
		document.getElementById("reg-error-msg").innerHTML = "First Name: Max length passed (Max 20 characters)";
		goToName();
	}

	//Surname Checks
	else if (document.getElementById("userSurname").value == "") {
		document.getElementById("reg-error-msg").innerHTML = "Surname: No text identified"
		goToSurName();
	} else if (document.getElementById("userSurname").value.length < 2) {
		document.getElementById("reg-error-msg").innerHTML = "Surname: Max length passed (Max 20 characters)";
		goToSurName();
	} else if (nums.test(document.getElementById("userSurname").value)) {
		document.getElementById("reg-error-msg").innerHTML = "Surname: Numbers found present in text";
		goToSurName();
	} else if (allowspace.test(document.getElementById("userSurname").value)) {
		document.getElementById("reg-error-msg").innerHTML = "Surname: Symbols found present in text";
		goToSurName();
	} else if (document.getElementById("userSurname").value.length > 20) {
		document.getElementById("reg-error-msg").innerHTML = "Surname: Max length passed (Max 20 characters)";
		goToSurName();
	}

	//Email Checks
	else if (document.getElementById("email").value == "") {
		document.getElementById("reg-error-msg").innerHTML = "Email: Not Indicated";
		goToEmail();
	} else if (beforeAtAt == "") {
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid";
		goToEmail();
	} else if (afterAtAt == "") {
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid";
		goToEmail();
	} else if (document.getElementById("email").value.includes("@") == false) { //Checks if there is an @ at all in the email
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid";
		goToEmail();
	} else if (atCounter > 1) {
		document.getElementById("reg-error-msg").innerHTML = "Email: Encountered more than one @ symbol"; //Checks our atCounter for how many @s were counted, should only be 1.
		goToEmail();
	} else if (!afterAtAt.includes(".")) { //Checks if there is a period at all in the characters after @ 
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid Email URL"
		goToEmail();
	} else if (allowdots.test(afterAtAt)) { //Checks for matches of any characters not A-Za-z0-9 or "."
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid symbols found in email";
		goToEmail();
	} else if (allowdots.test(beforeAtAt) == true) {
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid symbols found in email";
		goToEmail();
	} else if (dots.test(afterAtAt)) { //Checks for matches of any consecutive periods
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid consecutive periods";
		goToEmail();
	} else if (dots.test(beforeAtAt)) {
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid consecutive periods";
		goToEmail();
	} else if (beforeAtAt[beforeAtAt.length - 1] == ".") { //Checks for periods directly before @ symbol
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid period before @ symbol";
		goToEmail();
	} else if (afterAtAt[0] == ".") { //Checks for periods directly after @ symbol
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid period after @ symbol";
		goToEmail();
	} else if (afterAtAt[afterAtAt.length - 1] == ".") { //Checks for periods directly at end
		document.getElementById("reg-error-msg").innerHTML = "Email: Invalid domain.";
		goToEmail();
	}

	else if (document.getElementById("password").value.length < 8) {
		document.getElementById("reg-error-msg").innerHTML = "Password: Invalid length.";
		goToPassword();
	} else if (!nums.test(document.getElementById("password").value)) {
		document.getElementById("reg-error-msg").innerHTML = "Password: At least 1 number needed.";
		goToPassword();
	}

	else if (document.getElementById("passwordcheck").value != document.getElementById("password").value) {
		document.getElementById("reg-error-msg").innerHTML = "Password: Passwords do not match.";
		goToPasswordRetype();
	}

	else { //All checks passed, Submit Granted
		document.getElementById("reg-error-msg").innerHTML = "";
		console.log("Passed");

		let regDetails = {
			username: document.getElementById("username").value,
			name: document.getElementById("userFirstName").value,
			surname: document.getElementById("userSurname").value,
			email: document.getElementById("email").value,
			password: document.getElementById("password").value,
			score: 0
		}

		userList.push(regDetails);
		localStorage.setItem("users", JSON.stringify(userList));
		document.getElementById("username").value = "";
		document.getElementById("userFirstName").value = "";
		document.getElementById("userSurname").value = "";
		document.getElementById("email").value = "";
		document.getElementById("password").value = "";
		document.getElementById("passwordcheck").value = "";
		document.getElementById("reg-error-msg").innerHTML = "Registration Completed";
		
	}
}


// ----------------------- Logins -----------------------

// Function to store login state and user information (editing original data later)
function logIn(user) {
	// Store user data in sessionStorage
	sessionStorage.setItem("currentUser", JSON.stringify(user));
	sessionStorage.setItem("isLoggedIn", "true");

	// Redirect to game page after updating nav
	updateNavigation();
	window.location.href = "playgame.html";
}

export function isUserLoggedIn() { // Check login status
	return sessionStorage.getItem("isLoggedIn") === "true";
}

export function getCurrentUser() { //return user data
	const userData = sessionStorage.getItem("currentUser");
	return JSON.parse(userData);
}

export function getAllUsers() { //return all user data
	const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
	return allUsers;
}

function logOut() {
	// Clear session data
	sessionStorage.removeItem("currentUser");
	sessionStorage.setItem("isLoggedIn", "false");

	// Redirect to login page after updating nav
	updateNavigation();
	window.location.href = "reglog.html";
}


// Check user-entered info against data to authorize login
function logCheck() {
	let userList = JSON.parse(localStorage.getItem("users") || "[]");

	let userName = document.getElementById("username-login").value;
	let passWord = document.getElementById("password-login").value;

	if (userList.length < 1) {
		//Fallback if first ever visit to site(no data has ever been created)
		document.getElementById("log-error-msg").innerHTML = "!: No users exist.";
	}
	// Check if things are empty
	else if(document.getElementById("username-login").value == ""){
		document.getElementById("log-error-msg").innerHTML = "!: Username text not detected.";
	}
	else if(document.getElementById("password-login").value == ""){
		document.getElementById("log-error-msg").innerHTML = "!: Password text not detected."
	}
	else {
		let result = userList.find(({ username }) => username === userName); // Grab object where username matches

		// If grab is undefined, it doesn't exist in the system
		if (typeof result === "undefined") {
			document.getElementById("log-error-msg").innerHTML = "!: User does not exist.";
		}
		// If user exists, just check if the passwords match
		else if (passWord === result.password) {
			logIn(result);
		}
		else {
			document.getElementById("log-error-msg").innerHTML = "!: Incorrect password.";
		}

	}
}

// Force user to reglog page if not logged in. 
function protectGameRoute() {
	// Check if we"re on the game page
	if (window.location.pathname.endsWith("playgame.html")) {
		// Check login status
		if (!isUserLoggedIn()) {
			// Redirect to login page
			window.location.href = "reglog.html";
			setMessageLogin();
		}
	}
}

function setMessageLogin() {
	document.getElementById("log-error-msg").innerHTML = "!: Please login to play the game.";
} 

// Function to update navigation bar so that the Reg/Login button is replaced to Logout once a user is logged in
// Also applies for the opposite process of logging out
function updateNavigation() {
	const loginButton = document.getElementById("dynamicButton");
	if (isUserLoggedIn()) {
		// Change Register/Login to Logout. Change button class to HoriNav2 for different styling. 
		loginButton.setAttribute("class", "menulinks2");
		loginButton.innerHTML = "<p class='menuText'>Logout</p>";
		loginButton.href = "#"; // Arbitrary value
		loginButton.onclick = function (event) {
			event.preventDefault(); // Stop button from looking for page link
			logOut();
		};
		loginButton.title = "Logout"; // Accessibility


		// Hide reglog.html access (just redirects to index so its impossible to access)
		if (window.location.pathname.endsWith("reglog.html")) {
			window.location.href = "index.html";
		}
	} else {
		// Stay or Go back to default 
		loginButton.setAttribute("class", "menulinks");
		loginButton.innerHTML = "<p class='menuText'>Register/Login</p>";
		loginButton.href = "reglog.html";
		loginButton.onclick = null;
		loginButton.title = "Register or Login";
	}
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
	updateNavigation();//Always run on a page load
	protectGameRoute();

	// Get the form submit buttons
	const registerButton = document.getElementById("regiSubmission");
	const loginButton = document.getElementById("loginSubmission");

	// Add event listeners
	if (registerButton) {
		registerButton.addEventListener("click", regCheck);
	}
	if (loginButton) {
		loginButton.addEventListener("click", logCheck);
	}
});
