// =========================================
// FINTRACK - TRANSACTIONS & BUDGETS PAGE
// =========================================


document.addEventListener("DOMContentLoaded", () => {

    renderAllTransactions();

    renderBudgets();

    setupTransactionPageEvents();

    setupAddTransactionModal();

    setupEditModal();

});


// =========================================
// PAGE EVENTS
// =========================================

function setupTransactionPageEvents() {

    document
        .getElementById("allTransactionSearch")
        ?.addEventListener(
            "input",
            renderAllTransactions
        );


    document
        .getElementById("allCategoryFilter")
        ?.addEventListener(
            "change",
            renderAllTransactions
        );


    document
        .getElementById("allTypeFilter")
        ?.addEventListener(
            "change",
            renderAllTransactions
        );


    document
        .getElementById("allSortFilter")
        ?.addEventListener(
            "change",
            renderAllTransactions
        );

}


// =========================================
// FILTER TRANSACTIONS
// =========================================

function getAllFilteredTransactions() {

    const transactions =
        getTransactions();


    const search =
        document
            .getElementById(
                "allTransactionSearch"
            )
            ?.value
            .toLowerCase()
            .trim() || "";


    const category =
        document
            .getElementById(
                "allCategoryFilter"
            )
            ?.value || "all";


    const type =
        document
            .getElementById(
                "allTypeFilter"
            )
            ?.value || "all";


    const sort =
        document
            .getElementById(
                "allSortFilter"
            )
            ?.value || "newest";


    let filtered =
        transactions.filter(transaction => {

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
                matchesSearch &&
                matchesCategory &&
                matchesType
            );

        });


    filtered.sort((a, b) => {

        switch (sort) {

            case "newest":
                return new Date(b.date) -
                    new Date(a.date);

            case "oldest":
                return new Date(a.date) -
                    new Date(b.date);

            case "highest":
                return b.amount - a.amount;

            case "lowest":
                return a.amount - b.amount;

            default:
                return 0;

        }

    });


    return filtered;
}


// =========================================
// RENDER ALL TRANSACTIONS
// =========================================

function renderAllTransactions() {

    const tbody =
        document.getElementById(
            "allTransactionsBody"
        );


    const emptyState =
        document.getElementById(
            "allEmptyState"
        );


    if (!tbody) {
        return;
    }


    const transactions =
        getAllFilteredTransactions();


    tbody.innerHTML = "";


    if (transactions.length === 0) {

        emptyState?.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState?.classList.add(
        "hidden"
    );


    transactions.forEach(transaction => {

        const row =
            document.createElement("tr");


        const amountClass =
            transaction.type === "income"
                ? "amount-income"
                : "amount-expense";


        const prefix =
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


            <td
                data-label="Amount"
                class="${amountClass}">

                ${prefix}
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

                <span
                    class="status-badge ${statusClass}">

                    ${escapeHTML(transaction.status)}

                </span>

            </td>


            <td data-label="Actions">

                <button
                    class="table-action-btn"
                    onclick="openEditTransaction(${transaction.id})">

                    View / Edit

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


// =========================================
// ADD TRANSACTION MODAL
// =========================================

function setupAddTransactionModal() {

    const openButton =
        document.getElementById(
            "pageAddTransactionBtn"
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


    openButton?.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "hidden"
            );

            setPageDefaultDate();

        }
    );


    closeButton?.addEventListener(
        "click",
        closePageTransactionModal
    );


    cancelButton?.addEventListener(
        "click",
        closePageTransactionModal
    );


    modal?.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                closePageTransactionModal();

            }

        }
    );


    form?.addEventListener(
        "submit",
        addPageTransaction
    );

}


function closePageTransactionModal() {

    document
        .getElementById("transactionModal")
        ?.classList.add("hidden");


    document
        .getElementById("transactionForm")
        ?.reset();

}


function setPageDefaultDate() {

    const date =
        document.getElementById(
            "transactionDate"
        );


    if (date) {

        date.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }

}


// =========================================
// ADD TRANSACTION
// =========================================

function addPageTransaction(event) {

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

        alert(
            "Please enter a merchant or description."
        );

        return;

    }


    if (!amount || amount <= 0) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    if (!category || !type || !date) {

        alert(
            "Please complete all required fields."
        );

        return;

    }


    const transactions =
        getTransactions();


    transactions.push({

        id: generateTransactionId(),

        merchant,

        amount,

        category,

        type,

        date,

        status

    });


    saveTransactions(
        transactions
    );


    closePageTransactionModal();


    renderAllTransactions();

    renderBudgets();


    alert(
        "Transaction added successfully."
    );

}


// =========================================
// EDIT TRANSACTION
// =========================================

function openEditTransaction(id) {

    const transactions =
        getTransactions();


    const transaction =
        transactions.find(
            item => item.id === id
        );


    if (!transaction) {
        return;
    }


    document
        .getElementById(
            "editTransactionId"
        )
        .value = transaction.id;


    document
        .getElementById(
            "editMerchant"
        )
        .value = transaction.merchant;


    document
        .getElementById(
            "editAmount"
        )
        .value = transaction.amount;


    document
        .getElementById(
            "editCategory"
        )
        .value = transaction.category;


    document
        .getElementById(
            "editType"
        )
        .value = transaction.type;


    document
        .getElementById(
            "editDate"
        )
        .value = transaction.date;


    document
        .getElementById(
            "editStatus"
        )
        .value = transaction.status;


    document
        .getElementById(
            "detailModal"
        )
        .classList.remove("hidden");

}


// =========================================
// EDIT MODAL
// =========================================

function setupEditModal() {

    const modal =
        document.getElementById(
            "detailModal"
        );


    const closeButton =
        document.getElementById(
            "closeDetailModal"
        );


    const form =
        document.getElementById(
            "editTransactionForm"
        );


    const deleteButton =
        document.getElementById(
            "deleteDetailBtn"
        );


    closeButton?.addEventListener(
        "click",
        closeEditModal
    );


    modal?.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                closeEditModal();

            }

        }
    );


    form?.addEventListener(
        "submit",
        saveEditedTransaction
    );


    deleteButton?.addEventListener(
        "click",
        deleteCurrentTransaction
    );

}


function closeEditModal() {

    document
        .getElementById(
            "detailModal"
        )
        ?.classList.add("hidden");

}


// =========================================
// SAVE EDIT
// =========================================

function saveEditedTransaction(event) {

    event.preventDefault();


    const id =
        Number(
            document
                .getElementById(
                    "editTransactionId"
                )
                .value
        );


    const merchant =
        document
            .getElementById(
                "editMerchant"
            )
            .value
            .trim();


    const amount =
        Number(
            document
                .getElementById(
                    "editAmount"
                )
                .value
        );


    const category =
        document
            .getElementById(
                "editCategory"
            )
            .value;


    const type =
        document
            .getElementById(
                "editType"
            )
            .value;


    const date =
        document
            .getElementById(
                "editDate"
            )
            .value;


    const status =
        document
            .getElementById(
                "editStatus"
            )
            .value;


    if (!merchant || amount <= 0 || !date) {

        alert(
            "Please enter valid transaction details."
        );

        return;

    }


    const transactions =
        getTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                transaction.id === id
        );


    if (index === -1) {
        return;
    }


    transactions[index] = {

        ...transactions[index],

        merchant,

        amount,

        category,

        type,

        date,

        status

    };


    saveTransactions(
        transactions
    );


    closeEditModal();


    renderAllTransactions();

    renderBudgets();


    alert(
        "Transaction updated successfully."
    );

}


// =========================================
// DELETE TRANSACTION
// =========================================

function deleteCurrentTransaction() {

    const id =
        Number(
            document
                .getElementById(
                    "editTransactionId"
                )
                .value
        );


    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    const transactions =
        getTransactions();


    const updated =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions(updated);


    closeEditModal();


    renderAllTransactions();

    renderBudgets();


    alert(
        "Transaction deleted."
    );

}


// =========================================
// BUDGETS
// =========================================

function renderBudgets() {

    const container =
        document.getElementById(
            "budgetList"
        );


    if (!container) {
        return;
    }


    const budgets =
        getBudgets();


    const transactions =
        getTransactions();


    const categories =
        Object.keys(budgets);


    container.innerHTML = "";


    categories.forEach(category => {

        const budget =
            Number(budgets[category]);


        const spent =
            transactions
                .filter(
                    transaction =>
                        transaction.type === "expense" &&
                        transaction.category === category
                )
                .reduce(
                    (total, transaction) =>
                        total +
                        Number(transaction.amount),
                    0
                );


        const percentage =
            budget > 0
                ? (spent / budget) * 100
                : 0;


        const progress =
            Math.min(percentage, 100);


        let state = "normal";


        if (percentage >= 100) {

            state = "over";

        } else if (percentage >= 80) {

            state = "warning";

        }


        const remaining =
            budget - spent;


        const item =
            document.createElement("div");


        item.className =
            "budget-item";


        item.innerHTML = `

            <div class="budget-top">

                <span class="budget-category">
                    ${escapeHTML(category)}
                </span>


                <span class="budget-amount">

                    ${formatCurrency(spent)}
                    /
                    ${formatCurrency(budget)}

                </span>

            </div>


            <div class="budget-progress">

                <div
                    class="budget-progress-fill ${state}"
                    style="width: ${progress}%">

                </div>

            </div>


            <div class="budget-bottom">

                <span
                    class="${percentage >= 100 ? "over-budget" : ""}">

                    ${
                        percentage >= 100
                            ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                            : `${formatCurrency(remaining)} remaining`
                    }

                </span>


                <button
                    class="edit-budget-btn"
                    onclick="editBudget('${category}')">

                    Edit Budget

                </button>

            </div>

        `;


        container.appendChild(item);

    });

}


// =========================================
// EDIT BUDGET
// =========================================

function editBudget(category) {

    const budgets =
        getBudgets();


    const currentBudget =
        Number(budgets[category] || 0);


    const newBudget =
        prompt(
            `Enter new budget for ${category}:`,
            currentBudget
        );


    if (newBudget === null) {
        return;
    }


    const numericBudget =
        Number(newBudget);


    if (
        Number.isNaN(numericBudget) ||
        numericBudget <= 0
    ) {

        alert(
            "Please enter a valid positive budget."
        );

        return;

    }


    budgets[category] =
        numericBudget;


    saveBudgets(budgets);


    renderBudgets();


    alert(
        `${category} budget updated successfully.`
    );

}