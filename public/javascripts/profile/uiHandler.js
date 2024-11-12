// uiHandler.js
// =======================================
// Functions to manage the UI for the profile page

// Function to open the "Add Character" modal
export function openAddCharacterModal() {
  closeAllModals(); // Close any open modals
  document.getElementById("addCharacterModal").style.display = "block";
}

// Function to close the "Add Character" modal
export function closeAddCharacterModal() {
  document.getElementById("addCharacterModal").style.display = "none";
}

// Function to close all modals on the page
export function closeAllModals() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.style.display = "none";
  });
}

// Function to set up the dropdown menu for selecting character classes
export function setupDropdown() {
  const dropdownSelected = document.getElementById("dropdownSelected");
  const dropdownOptions = document.getElementById("dropdownOptions");
  const characterClassValue = document.getElementById("characterClassValue");
  const classIconUrlInput = document.getElementById("classIconUrl");

  console.log("Initializing dropdown...");
  if (!dropdownSelected) {
    console.error("dropdownSelected element not found");
  }
  if (!dropdownOptions) {
    console.error("dropdownOptions element not found");
  }
  if (!characterClassValue) {
    console.error("characterClassValue element not found");
  }
  if (!classIconUrlInput) {
    console.error("classIconUrl element not found");
  }

  // Open/close the dropdown when clicking on the selected element
  dropdownSelected.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdownOptions.style.display =
      dropdownOptions.style.display === "block" ? "none" : "block";
  });

  // Select an option from the dropdown
  const options = dropdownOptions.querySelectorAll(".dropdown-option");
  options.forEach((option) => {
    option.addEventListener("click", function () {
      const value = this.getAttribute("data-value");
      const iconUrl = this.getAttribute("data-icon-url");

      // Update selected element with icon and text
      dropdownSelected.innerHTML = `
        <img src="${iconUrl}" alt="${value}" class="dropdown-icon" /> ${this.textContent.trim()}
      `;
      dropdownOptions.style.display = "none";

      // Set values in hidden form fields
      characterClassValue.value = value;
      classIconUrlInput.value = iconUrl;
    });
  });

  // Close dropdown if clicking outside
  document.addEventListener("click", function (e) {
    if (
      !dropdownSelected.contains(e.target) &&
      !dropdownOptions.contains(e.target)
    ) {
      dropdownOptions.style.display = "none";
    }
  });
}
