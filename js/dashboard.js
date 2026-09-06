// =========================================
// FINTRACK - DASHBOARD
// =========================================

let currentMonth = "2026-09";


// =========================================
// DOM ELEMENTS
// =========================================

const balanceValue =
    document.getElementById("balanceValue");

const incomeValue =
    document.getElementById("incomeValue");

const expenseValue =
    document.getElementById("expenseValue");

const savingsValue =
    document.getElementById("savingsValue");

const transactionTableBody =
    document.getElementById("transactionTableBody");

const emptyTransactionState =
    document.getElementById("emptyTransactionState");


// =========================================
// INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    currentMonth =
        document.getElementById("monthSelector")?.value ||
        "2026-09";

    renderDashboard();

    setupDashboardEvents();

    setupTransactionModal();

    setDefaultTransactionDate();

});


// =========================================
// DASHBOARD EVENTS
// =========================================

function setupDashboardEvents() {

    const monthSelector =
        document.getElementById("monthSelector");

    const searchInput =
        document.getElementById("transactionSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const sortFilter =
        document.getElementById("sortFilter");


    monthSelector?.addEventListener("change", () => {

        currentMonth = monthSelector.value;

        renderDashboard();

    });


    searchInput?.addEventListener(
        "input",
        renderTransactions
    );


    categoryFilter?.addEventListener(
        "change",
        renderTransactions
    );


    typeFilter?.addEventListener(
        "change",
        renderTransactions
    );


    sortFilter?.addEventListener(
        "change",
        renderTransactions
    );

}


// =========================================
// RENDER DASHBOARD
// =========================================

function renderDashboard() {

    const allTransactions = getTransactions();

    const monthTransactions =
        allTransactions.filter(transaction =>
            transaction.date.startsWith(currentMonth)
        );


    renderSummaryCards(monthTransactions);

    renderTransactions();

    renderIncomeExpenseChart(allTransactions);

    renderCategoryChart(monthTransactions);

}


// =========================================
// SUMMARY CARDS
// =========================================

function renderSummaryCards(transactions) {

    const totals =
        calculateTotals(transactions);


    balanceValue.textContent =
        formatCurrency(totals.balance);

    incomeValue.textContent =
        formatCurrency(totals.income);

    expenseValue.textContent =
        formatCurrency(totals.expenses);

    savingsValue.textContent =
        `${Math.max(0, totals.savingsRate).toFixed(1)}%`;


    const balanceChange =
        document.getElementById("balanceChange");

    if (balanceChange) {

        if (totals.balance >= 0) {

            balanceChange.textContent =
                "Positive monthly balance";

            balanceChange.className =
                "card-change positive";

        } else {

            balanceChange.textContent =
                "Expenses exceed income";

            balanceChange.className =
                "card-change negative";
        }
    }

}


// =========================================
// TRANSACTION FILTERING
// =========================================

function getFilteredTransactions() {

    const transactions = getTransactions();

    const search =
        document
            .getElementById("transactionSearch")
            ?.value
            .toLowerCase()
            .trim() || "";


    const category =
        document
            .getElementById("categoryFilter")
            ?.value || "all";


    const type =
        document
            .getElementById("typeFilter")
            ?.value || "all";


    const sort =
        document
            .getElementById("sortFilter")
            ?.value || "newest";


    let filtered = transactions.filter(transaction => {

        const matchesMonth =
            transaction.date.startsWith(currentMonth);


        const matchesSearch =
            transaction.merchant
                .toLowerCase()
                .includes(search);


        const matchesCategory =
            category === "all" ||
            transaction.category === category;


        const matchesType =
            type === "all" ||
            transaction.type === type;


        return (
            matchesMonth &&
            matchesSearch &&
            matchesCategory &&
            matchesType
        );

    });


    // Sorting
    filtered.sort((a, b) => {

        if (sort === "newest") {

            return new Date(b.date) -
                new Date(a.date);

        }

        if (sort === "oldest") {

            return new Date(a.date) -
                new Date(b.date);

        }

        if (sort === "highest") {

            return b.amount - a.amount;

        }

        if (sort === "lowest") {

            return a.amount - b.amount;

        }

        return 0;

    });


    return filtered;
}


// =========================================
// RENDER TRANSACTIONS
// =========================================

function renderTransactions() {

    if (!transactionTableBody) {
        return;
    }


    const transactions =
        getFilteredTransactions();


    transactionTableBody.innerHTML = "";


    if (transactions.length === 0) {

        emptyTransactionState
            ?.classList
            .remove("hidden");

        return;

    }


    emptyTransactionState
        ?.classList
        .add("hidden");


    transactions.slice(0, 10).forEach(transaction => {

        const row =
            document.createElement("tr");


        const amountClass =
            transaction.type === "income"
                ? "amount-income"
                : "amount-expense";


        const amountPrefix =
            transaction.type === "income"
                ? "+"
                : "-";


        const statusClass =
            transaction.status === "Completed"
                ? "status-completed"
                : "status-pending";


        row.innerHTML = `

            <td data-label="Date">
                ${formatDate(transaction.date)}
            </td>

            <td data-label="Merchant">
                <strong>
                    ${escapeHTML(transaction.merchant)}
                </strong>
            </td>

            <td data-label="Category">
                <span class="category-badge">
                    ${escapeHTML(transaction.category)}
                </span>
            </td>

            <td data-label="Amount"
                class="${amountClass}">

                ${amountPrefix}
                ${formatCurrency(transaction.amount)}

            </td>

            <td data-label="Type">

                ${
                    transaction.type === "income"
                        ? "Income"
                        : "Expense"
                }

            </td>

            <td data-label="Status">

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(transaction.status)}
                </span>

            </td>

            <td data-label="Action">

                <button
                    class="table-action-btn"
                    onclick="deleteTransactionFromDashboard(${transaction.id})"
                    title="Delete transaction">

                    Delete

                </button>

            </td>

        `;


        transactionTableBody.appendChild(row);

    });

}


// =========================================
// DELETE TRANSACTION
// =========================================

function deleteTransactionFromDashboard(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    const transactions =
        getTransactions();


    const updatedTransactions =
        transactions.filter(
            transaction => transaction.id !== id
        );


    saveTransactions(updatedTransactions);

    renderDashboard();

}


// =========================================
// INCOME VS EXPENSE CHART
// =========================================

function renderIncomeExpenseChart(transactions) {

    const container =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (!container) {
        return;
    }


    const months = getLastSixMonths();


    const data = months.map(month => {

        const monthTransactions =
            transactions.filter(transaction =>
                transaction.date.startsWith(month.key)
            );


        const totals =
            calculateTotals(monthTransactions);


        return {
            label: month.label,
            income: totals.income,
            expenses: totals.expenses
        };

    });


    const maxValue =
        Math.max(
            ...data.flatMap(item => [
                item.income,
                item.expenses
            ]),
            1
        );


    const chartHeight = 220;

    const chartWidth = 650;


    const barWidth = 22;

    const groupWidth = 90;


    let svg = `

        <svg
            viewBox="0 0 ${chartWidth} ${chartHeight + 50}"
            role="img"
            aria-label="Monthly income and expenses chart">

            <line
                x1="40"
                y1="220"
                x2="630"
                y2="220"
                stroke="#cbd5e1"
            />

    `;


    data.forEach((item, index) => {

        const x =
            65 + index * groupWidth;


        const incomeHeight =
            (item.income / maxValue) *
            chartHeight;


        const expenseHeight =
            (item.expenses / maxValue) *
            chartHeight;


        const incomeY =
            220 - incomeHeight;


        const expenseY =
            220 - expenseHeight;


        svg += `

            <rect
                x="${x}"
                y="${incomeY}"
                width="${barWidth}"
                height="${incomeHeight}"
                rx="4"
                fill="#4f46e5">

                <title>
                    ${item.label} income:
                    ${formatCurrency(item.income)}
                </title>

            </rect>


            <rect
                x="${x + 30}"
                y="${expenseY}"
                width="${barWidth}"
                height="${expenseHeight}"
                rx="4"
                fill="#f87171">

                <title>
                    ${item.label} expenses:
                    ${formatCurrency(item.expenses)}
                </title>

            </rect>


            <text
                x="${x + 25}"
                y="240"
                text-anchor="middle"
                font-size="11"
                fill="#64748b">

                ${item.label}

            </text>

        `;

    });


    svg += `

        </svg>


        <div class="chart-summary">

            <span>
                <i class="chart-dot income-dot"></i>
                Income
            </span>

            <span>
                <i class="chart-dot expense-dot"></i>
                Expenses
            </span>

        </div>

    `;


    container.innerHTML = svg;

}


// =========================================
// LAST 6 MONTHS
// =========================================

function getLastSixMonths() {

    const result = [];

    const current =
        new Date(currentMonth + "-01T00:00:00");


    for (let i = 5; i >= 0; i--) {

        const date =
            new Date(
                current.getFullYear(),
                current.getMonth() - i,
                1
            );


        const year =
            date.getFullYear();


        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");


        const key =
            `${year}-${month}`;


        const label =
            date.toLocaleDateString(
                "en-IN",
                { month: "short" }
            );


        result.push({
            key,
            label
        });

    }


    return result;
}


// =========================================
// CATEGORY SPENDING CHART
// =========================================

function renderCategoryChart(transactions) {

    const container =
        document.getElementById(
            "categoryChart"
        );


    const legend =
        document.getElementById(
            "categoryLegend"
        );


    if (!container) {
        return;
    }


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const categoryTotals = {};


    expenses.forEach(transaction => {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }

        categoryTotals[transaction.category] +=
            Number(transaction.amount);

    });


    const sortedCategories =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    const total =
        expenses.reduce(
            (sum, transaction) =>
                sum + Number(transaction.amount),
            0
        );


    if (sortedCategories.length === 0) {

        container.innerHTML = `
            <div class="chart-empty">
                No expense data available.
            </div>
        `;

        if (legend) {
            legend.innerHTML = "";
        }

        return;

    }


    const colors = [
        "#4f46e5",
        "#16a34a",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#ec4899"
    ];


    let html = "";


    sortedCategories
        .slice(0, 6)
        .forEach(([category, amount], index) => {

            const percentage =
                total > 0
                    ? (amount / total) * 100
                    : 0;


            html += `

                <div class="category-chart-row">

                    <div class="category-chart-top">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        <strong>
                            ${formatCurrency(amount)}
                        </strong>

                    </div>

                    <div
                        class="category-bar">

                        <div
                            class="category-bar-fill"
                            style="
                                width: ${percentage}%;
                                background: ${colors[index]};
                            ">
                        </div>

                    </div>

                    <small>
                        ${percentage.toFixed(1)}% of expenses
                    </small>

                </div>

            `;

        });


    container.innerHTML = html;


    if (legend) {

        legend.innerHTML = `
            <div class="chart-total">
                Total expenses:
                <strong>
                    ${formatCurrency(total)}
                </strong>
            </div>
        `;

    }

}


// =========================================
// MODAL
// =========================================

function setupTransactionModal() {

    const openButton =
        document.getElementById(
            "addTransactionBtn"
        );


    const modal =
        document.getElementById(
            "transactionModal"
        );


    const closeButton =
        document.getElementById(
            "closeModalBtn"
        );


    const cancelButton =
        document.getElementById(
            "cancelModalBtn"
        );


    const form =
        document.getElementById(
            "transactionForm"
        );


    if (!openButton || !modal) {
        return;
    }


    openButton.addEventListener("click", () => {

        modal.classList.remove("hidden");

        document
            .getElementById("merchant")
            ?.focus();

    });


    closeButton?.addEventListener(
        "click",
        closeTransactionModal
    );


    cancelButton?.addEventListener(
        "click",
        closeTransactionModal
    );


    modal.addEventListener("click", event => {

        if (event.target === modal) {

            closeTransactionModal();

        }

    });


    form?.addEventListener(
        "submit",
        handleAddTransaction
    );

}


function closeTransactionModal() {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    modal?.classList.add("hidden");


    document
        .getElementById("transactionForm")
        ?.reset();


    setDefaultTransactionDate();

}


function setDefaultTransactionDate() {

    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    if (!dateInput) {
        return;
    }


    dateInput.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


// =========================================
// ADD TRANSACTION
// =========================================

function handleAddTransaction(event) {

    event.preventDefault();


    const merchant =
        document
            .getElementById("merchant")
            .value
            .trim();


    const amount =
        Number(
            document
                .getElementById("amount")
                .value
        );


    const category =
        document
            .getElementById(
                "transactionCategory"
            )
            .value;


    const type =
        document
            .getElementById(
                "transactionType"
            )
            .value;


    const date =
        document
            .getElementById(
                "transactionDate"
            )
            .value;


    const status =
        document
            .getElementById(
                "transactionStatus"
            )
            .value;


    if (!merchant) {

        alert("Please enter a merchant or description.");

        return;

    }


    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;

    }


    if (!category) {

        alert("Please select a category.");

        return;

    }


    if (!type) {

        alert("Please select a transaction type.");

        return;

    }


    if (!date) {

        alert("Please select a date.");

        return;

    }


    const transactions =
        getTransactions();


    const newTransaction = {

        id: generateTransactionId(),

        date,

        merchant,

        category,

        amount,

        type,

        status

    };


    transactions.push(newTransaction);


    saveTransactions(transactions);


    closeTransactionModal();


    // Switch dashboard to new transaction month
    currentMonth =
        date.substring(0, 7);


    const monthSelector =
        document.getElementById(
            "monthSelector"
        );


    if (monthSelector) {

        const optionExists =
            [...monthSelector.options]
                .some(option =>
                    option.value === currentMonth
                );


        if (!optionExists) {

            const option =
                document.createElement("option");

            option.value = currentMonth;

            option.textContent =
                getMonthName(currentMonth);

            monthSelector.appendChild(option);

        }


        monthSelector.value =
            currentMonth;

    }


    renderDashboard();


    alert("Transaction added successfully.");

}


// =========================================
// HELPERS
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}