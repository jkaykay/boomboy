import { getCurrentUser, getAllUsers, isUserLoggedIn } from "./validate.js";


// Grabs scores of all users, sorts them, then displays them accordingly on leaderbaord page. 
window.onload = function () {
    let thisuser;
    if (isUserLoggedIn()) {
        thisuser = getCurrentUser();
    }
    // Get the table body element
    const tableBody = document.getElementById("tableBody");

    // Retrieve the users from localStorage.
    let users = getAllUsers();

    // Sort users based on scores in descending order (highest score first)
    users.sort((a, b) => b.score - a.score);

    // Clear the existing table rows
    tableBody.innerHTML = "";

    //If no users have been created, only 1 row created with basic values. 
    if(users.length == 0){
        const row = document.createElement("tr");
        // Create the rank cell
        const rankCell = document.createElement("td");
        rankCell.classList.add("column1");
        rankCell.textContent = "0" // Rank number
        row.appendChild(rankCell);
        // Create the username cell
        const usernameCell = document.createElement("td");
        usernameCell.classList.add("othertwo");
        usernameCell.textContent = "No Users";
        row.appendChild(usernameCell);
        // Create the score cell
        const scoreCell = document.createElement("td");
        scoreCell.classList.add("othertwo");
        scoreCell.textContent = "No Users";
        row.appendChild(scoreCell);
        // Add the row to the table body
        tableBody.appendChild(row);[1]
    }

    else{
        // Iterate through the sorted scores and add them to the table
        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            // Create a new table row (Happens per iteration)
            const row = document.createElement("tr");

            // Create the rank cell
            const rankCell = document.createElement("td");
            rankCell.classList.add("column1");
            rankCell.textContent = i + 1; // Rank number

            // Check if there is a user logged in, If yes, then highlight this cell
            if(!(typeof thisuser === "undefined")){
                if(thisuser.username == user.username){
                    rankCell.style.setProperty("background-color", "#FFC482");
                }
            }

            row.appendChild(rankCell);

            // Create the username cell
            const usernameCell = document.createElement("td");
            usernameCell.classList.add("othertwo");
            usernameCell.textContent = user.username;

            // Check if there is a user logged in, If yes, then highlight this cell
            if(!(typeof thisuser === "undefined")){
                if(thisuser.username == user.username){
                    usernameCell.style.setProperty("background-color", "#FFC482");
                }
            }

            row.appendChild(usernameCell);

            // Create the score cell
            const scoreCell = document.createElement("td");
            scoreCell.classList.add("othertwo");
            scoreCell.textContent = user.score;

            // Check if there is a user logged in, If yes, then highlight this cell
            if(!(typeof thisuser === "undefined")){
                if(thisuser.username == user.username){
                    scoreCell.style.setProperty("background-color", "#FFC482");
                }
            }
            
            row.appendChild(scoreCell);

            // Add the row to the table body after finished creating the cells
            tableBody.appendChild(row);[1] 
        }
    } 
}