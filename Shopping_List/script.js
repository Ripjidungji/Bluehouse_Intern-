// Get elements from HTML
const itemInput = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const shoppingList = document.getElementById("shoppingList");
const clearBtn = document.getElementById("clearBtn");


// Add item when button is clicked
addBtn.addEventListener("click", function() {

    const itemText = itemInput.value;

    // Check if input is empty
    if (itemText === "") {
        alert("Please enter an item");
        return;
    }

    // Create a new list item
    const li = document.createElement("li");

    // Create item text
    const span = document.createElement("span");
    span.textContent = itemText;
    span.classList.add("item-text");

    // Create Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");

    // Create Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");


    // Add item text to list
    li.appendChild(span);

    // Create button area
    const buttonArea = document.createElement("div");

    buttonArea.appendChild(editBtn);
    buttonArea.appendChild(deleteBtn);

    li.appendChild(buttonArea);

    // Add list item to shopping list
    shoppingList.appendChild(li);


    // Clear input box
    itemInput.value = "";


    // Mark item as completed
    span.addEventListener("click", function() {
        span.classList.toggle("completed");
    });


    // Edit item
    editBtn.addEventListener("click", function() {

        const newItem = prompt("Change this item:", span.textContent);

        if (newItem !== null && newItem !== "") {
            span.textContent = newItem;
        }

    });


    // Delete item
    deleteBtn.addEventListener("click", function() {
        li.remove();
    });

});


// Clear all items
clearBtn.addEventListener("click", function() {
    shoppingList.innerHTML = "";
});