"use strict";

let API_KEY = '$2a$10$WZxzA3.tT2fb5pmbpx/Tme7SAS.RVqcZx/KOofNII.SFDtechLFUu';
let PRODUCTS_BIN_ID = '669b7b27ad19ca34f88a3ee7';
let RECIPIENTS_BIN_ID = '669b7bc4e41b4d34e4147fbf';

let products = [];
let recipients = [];

let fetchData = async (binId, type) => {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            headers: {
                'X-Master-Key': API_KEY,
                'Accept': 'application/json'
            }
        });
        let data = await response.json();
        if (type === 'products') {
            products = Array.isArray(data.record) ? data.record : Object.values(data.record);
        } else if (type === 'recipients') {
            recipients = Array.isArray(data.record) ? data.record : Object.values(data.record);
        }
        return data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

let saveData = async (binId, data) => {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

let initializeData = async () => {
    await fetchData(PRODUCTS_BIN_ID, 'products');
    await fetchData(RECIPIENTS_BIN_ID, 'recipients');
    allElements();
    updateHighestQuantityProducts();
    updateBarChart();
    updateRecipientTable();
};

let createElement = (tag, className, innerHTML = "") => {
    let element = document.createElement(tag);
        element.className = className;
        element.innerHTML = innerHTML;
    return element;
};

let allElements = () => {
    let navbar = createElement("div", "navbar", `
        <i class="fa-regular fa-clipboard"></i></i>
        <h3 class="heading">DCKAP Palli Inventory</h3>
    `);

    let container = createElement("div", "container");
    let dashboardSection = createElement("div", "dashboard-section");

    let dashboard = createElement("div", "dashboard", `
        <h2>DASHBOARD</h2>
        <div id="highest_quantity_products"></div>
    `);

    let buttonDivs = createElement("div", "buttondivs", `
        <button class="modal_toggle" data-target="add_product_modal" id="add_product_btn">Add Product</button>
        <button class="modal_toggle" data-target="update_inventory_modal" id="update_inventory_btn">Update Inventory</button>
    `);

    let barChart = createElement("div", "bar_chart");
    barChart.innerHTML = '<canvas id="inventoryChart"></canvas>';

    let recipientDetails = createElement("div", "recipient_details", `
        <table id="recipient_table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Name</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `);

    dashboardSection.append(dashboard, buttonDivs, barChart, recipientDetails);
    container.appendChild(dashboardSection);

    let addProductModal = createElement("div", "modal add_product_modal", `
        <div class="modal_content">
            <span class="modal_toggle close" data-target="add_product_modal">&times;</span>
            <h2>Add Product</h2>
            <form id="add_product_form" class="add_product_modal">
                <div class="side">
                    <label for="product_name">Name:</label>
                    <input type="text" id="product_name" name="name" required>
                </div>
                <div class="side">
                    <label for="product_quantity">Quantity:</label>
                    <input type="number" id="product_quantity" name="quantity" required>
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    `);

    let updateInventoryModal = createElement("div", "modal update_inventory_modal", `
        <div class="modal_content">
            <span class="modal_toggle close" data-target="update_inventory_modal">&times;</span>
            <h2>Update Inventory</h2>
            <form id="update_inventory_form">
                <div class="side">
                    <label for="recipient_product">Product:</label>
                    <input type="text" id="recipient_product" name="product" required>
                </div>
                <div class="side">
                    <label for="recipient_name">Name:</label>
                    <input type="text" id="recipient_name" name="name" required>
                </div>
                <div class="side">
                    <label for="recipient_quantity">Quantity:</label>
                    <input type="number" id="recipient_quantity" name="quantity" required>
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    `);

    document.body.append(navbar, container, addProductModal, updateInventoryModal);
};

let updateBarChart = () => {
    let ctx = document.getElementById("inventoryChart").getContext("2d");
    let fixedColors = ['#4169E1', '#DC143C', '#6B8E23', '#FFA500', '#6A5ACD'];
    let colors = fixedColors.slice(0, products[0].length);  

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: products[0].map(product => product.name),
            datasets: [{
                label: 'Quantity',
                data: products[0].map(product => product.quantity),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

let updateHighestQuantityProducts = () => {
    let highestQuantitySection = document.getElementById("highest_quantity_products");
    highestQuantitySection.innerHTML = "";

    let highestQuantityProducts = [...products[0]]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

    highestQuantityProducts.forEach(product => {
        let shop = createElement("div", "shop", `<i class="fa-solid fa-cart-plus"></i>`);
        let productDiv = createElement("div", "dashboarddiv", `<p>${product.name || 'No Product'}</p><p class="quantity_text">${product.quantity || 'No Quantity'}</p>`);
        productDiv.appendChild(shop);
        highestQuantitySection.appendChild(productDiv);
    });
};

let updateRecipientTable = () => {
    let tbody = document.getElementById("recipient_table").querySelector("tbody");
    tbody.innerHTML = "";
    recipients[0].forEach(recipient => {
        let row = createElement("tr", "", `
            <td>${recipient.product || 'No Product'}</td>
            <td>${recipient.name || 'No Name'}</td>
            <td>${recipient.quantity || 'No Quantity'}</td>
        `);
        tbody.appendChild(row);
    });
};

let handleModals = () => {
    document.querySelectorAll(".modal_toggle").forEach(button => {
        button.addEventListener("click", () => {
            let targetModal = document.querySelector(`.${button.dataset.target}`);
            let action = button.classList.contains("close") ? "none" : "flex";
    
            if (targetModal) {
                targetModal.style.display = action;
            }
        });
    });
};

let handleFormSubmit = () => {
    let addProductForm = document.getElementById("add_product_form");
    let updateInventoryForm = document.getElementById("update_inventory_form");

    if (addProductForm) {
        addProductForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            let name = event.target.name.value;
            let quantity = parseInt(event.target.quantity.value, 10);
            if (name && quantity) {
                products[0].push({ id: products[0].length + 1, name, quantity });
                await saveData(PRODUCTS_BIN_ID, products);
                updateHighestQuantityProducts();
                alert("Added successfully");
            } else {
                alert("Please provide valid product details.");
            }
            location.reload();
        });
    }

    if (updateInventoryForm) {
        updateInventoryForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            let product = event.target.product.value;
            let name = event.target.name.value;
            let quantity = parseInt(event.target.quantity.value, 10);
            if (product && name && quantity) {
                recipients[0].push({ id: recipients[0].length + 1, product, name, quantity });
                await saveData(RECIPIENTS_BIN_ID, recipients);
                updateRecipientTable();
                alert("Updated successfully");
            } else {
                alert("Please provide valid recipient details.");
            }
            location.reload();
        });
    }
    
};

document.addEventListener("DOMContentLoaded", () => {
    initializeData().then(() => {
        handleModals();
        handleFormSubmit();
    });
});
