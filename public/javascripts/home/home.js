// home.js
// =======================================
// Import necessary API and UI handler functions

import { fetchItems, saveItem, updateItem, deleteItem } from "./api.js";

import {
  openAddItemModal,
  openEditItemModal,
  closeAddItemModal,
  closeDeleteConfirmModal,
  addItemToTable,
  updateRowToReceived,
  undoReceivedItem,
} from "./uiHandler.js";

// References to important DOM elements used throughout the script
const tableBody = document.getElementById("item-table-body");
const characterDropdown = document.getElementById("characterSelect");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

// Global Variables
let isEditing = false;
let editingItemId = null;
let deleteItemId = null;

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("characterSelect")) {
    await fetchCharacters();
  }
});

if (characterDropdown) {
  characterDropdown.addEventListener("change", async () => {
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  });
}

// Functions to handle Modals and Items
window.openAddItemModal = () => {
  isEditing = false;
  openAddItemModal();
};

window.openEditItemModal = async (id) => {
  isEditing = true;
  editingItemId = id;

  const items = await fetchItems(editingItemId);
  const item = items.length ? items[0] : null;

  if (item) {
    openEditItemModal(item);
  }
};

window.editItem = async (id) => {
  isEditing = true;
  editingItemId = id;

  try {
    // Fetch the item by ID to populate the modal with existing data
    const response = await fetch(`/items/${id}`);
    if (!response.ok) {
      console.error("Failed to fetch item for editing");
      return;
    }
    const item = await response.json();

    // Call the openEditItemModal function to populate the modal
    if (item) {
      openEditItemModal(item);
    }
  } catch (error) {
    console.error("Error fetching item:", error);
  }
};

window.closeAddItemModal = closeAddItemModal;

window.deleteItem = (id) => {
  deleteItemId = id;
  document.getElementById("deleteConfirmModal").style.display = "block";
};

window.closeDeleteConfirmModal = closeDeleteConfirmModal;

window.confirmDeleteItem = async () => {
  const isSuccess = await deleteItem(deleteItemId);
  if (isSuccess) {
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  }
  closeDeleteConfirmModal();
};

// Function to render items in the table
function renderItems(items) {
  tableBody.innerHTML = "";
  items.sort((a, b) => (a.status === "received" ? 1 : -1));
  items.forEach((item) => {
    addItemToTable(item, tableBody);
    const row = document.querySelector(`tr[data-item-id="${item.id}"]`);
    if (item.status === "received" && row) {
      updateRowToReceived(row, tableBody);
    }
  });
  updateProgressBar(items);
}

// Function to update the progress bar based on collected items
function updateProgressBar(items) {
  const receivedItems = items.filter(
    (item) => item.status === "received"
  ).length;
  const totalItems = items.length;
  const progressPercentage =
    totalItems > 0 ? (receivedItems / totalItems) * 100 : 0;
  progressFill.style.width = `${progressPercentage}%`;
  progressText.textContent = `${receivedItems} of ${totalItems} items collected (${Math.round(
    progressPercentage
  )}%)`;
}

// Save Item function
window.saveItem = async () => {
  const item = {
    name: document.getElementById("itemName").value,
    description: document.getElementById("itemDescription").value,
    slot: document.getElementById("itemSlot").value,
    boss: document.getElementById("itemBoss").value,
    character_id: characterDropdown.value,
    icon:
      document
        .getElementById("selectedItemIcon")
        .getAttribute("data-icon-id") || null,
  };

  const savedItem = await saveItem(item);
  if (savedItem) {
    closeAddItemModal();
    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);
    renderItems(items);
    updateProgressBar(items);
  }
};

// Update Item function
window.updateItem = async () => {
  const item = {
    name: document.getElementById("itemName").value,
    description: document.getElementById("itemDescription").value,
    slot: document.getElementById("itemSlot").value,
    boss: document.getElementById("itemBoss").value,
    character_id: characterDropdown.value,
    icon:
      document
        .getElementById("selectedItemIcon")
        .getAttribute("data-icon-id") || null,
  };

  try {
    const isSuccess = await updateItem(editingItemId, item);
    if (isSuccess) {
      closeAddItemModal();

      const characterId = characterDropdown.value;
      const items = await fetchItems(characterId);
      renderItems(items);
      updateProgressBar(items);

      Swal.fire({
        icon: "success",
        title: "Item updated successfully!",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to update item",
        text: "An error occurred while updating the item. Please try again.",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Error updating item:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred",
      text: "An error occurred while updating the item. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }
};

// Fetch Characters for the dropdown
async function fetchCharacters() {
  try {
    const response = await fetch("/characters");
    if (!response.ok) {
      throw new Error("Not Found");
    }
    const characters = await response.json();

    characterDropdown.innerHTML =
      "<option value=''>-- Choose a character --</option>";
    characters.forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = character.name;
      option.setAttribute("data-icon-url", character.classIconUrl);
      characterDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}

// Mark an item as received
window.receivedItem = async (id) => {
  try {
    const response = await fetch(`/items/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "received" }),
    });

    if (!response.ok) {
      console.error("Error updating item status");
      Swal.fire({
        icon: "error",
        title: "Failed to mark item as received",
        text: "Please try again.",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    const row = document.querySelector(`tr[data-item-id="${id}"]`);
    if (row) {
      row.classList.add("glow-effect");

      requestAnimationFrame(() => {
        setTimeout(() => {
          row.classList.remove("glow-effect");
          const characterId = characterDropdown.value;
          fetchItems(characterId).then((items) => {
            renderItems(items);
          });
        }, 500);
      });

      // SweetAlert2 for success feedback when an item is marked as received
      Swal.fire({
        icon: "success",
        title: "Item marked as received!",
        background: "#333333",
        color: "#ffda79",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Error marking item as received:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred",
      text: "An error occurred while updating item status. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }
};

// Use the imported function from uiHandler.js for undoReceivedItem
window.undoReceivedItem = async (id) => {
  try {
    await undoReceivedItem(id, tableBody);

    const characterId = characterDropdown.value;
    const items = await fetchItems(characterId);

    updateProgressBar(items);

    Swal.fire({
      icon: "success",
      title: "Item status has been undone!",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error undoing item status:", error);
    Swal.fire({
      icon: "error",
      title: "An error occurred",
      text: "An error occurred while undoing the item status. Please try again.",
      background: "#333333",
      color: "#ffda79",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }
};
