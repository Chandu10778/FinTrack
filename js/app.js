// =========================================
// FINTRACK - COMMON APPLICATION LOGIC
// =========================================

const TRANSACTIONS_KEY = "fintrack_transactions";
const BUDGETS_KEY = "fintrack_budgets";


// =========================================
// LOCAL STORAGE
// =========================================

function initializeStorage() {

    if (!localStorage.getItem(TRANSACTIONS_KEY)) {
        localStorage.setItem(
            TRANSACTIONS_KEY,
            JSON.stringify(DEFAULT_TRANSACTIONS)
        );
    }

    if (!localStorage.getItem(BUDGETS_KEY)) {
        localStorage.setItem(
            BUDGETS_KEY,
            JSON.stringify(DEFAULT_BUDGETS)
        );
    }
}


// Get transactions
function getTransactions() {

    return JSON.parse(
        localStorage.getItem(TRANSACTIONS_KEY)
    ) || [];
}


// Save transactions
function saveTransactions(transactions) {

    localStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(transactions)
    );
}


// Get budgets
function getBudgets() {

    return JSON.parse(
        localStorage.getItem(BUDGETS_KEY)
    ) || {};
}


// Save budgets
function saveBudgets(budgets) {

    localStorage.setItem(
        BUDGETS_KEY,
        JSON.stringify(budgets)
    );
}


// =========================================
// FORMATTERS
// =========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}


function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getMonthName(monthString) {

    const date = new Date(monthString + "-01T00:00:00");

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}


// =========================================
// CALCULATIONS
// =========================================

function calculateTotals(transactions) {

    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce(
            (total, transaction) =>
                total + Number(transaction.amount),
            0
        );

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce(
            (total, transaction) =>
                total + Number(transaction.amount),
            0
        );

    const balance = income - expenses;

    const savingsRate =
        income > 0
            ? ((income - expenses) / income) * 100
            : 0;

    return {
        income,
        expenses,
        balance,
        savingsRate
    };
}


// =========================================
// ID GENERATOR
// =========================================

function generateTransactionId() {

    return Date.now();
}


// =========================================
// MOBILE SIDEBAR
// =========================================

function setupMobileMenu() {

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });
}


// =========================================
// INITIALIZE
// =========================================

initializeStorage();

document.addEventListener("DOMContentLoaded", () => {

    setupMobileMenu();

});