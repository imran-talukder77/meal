// ============================================================================
// 🍚 MESS MANAGER — PREMIUM PROFESSIONAL APP.JS
// Firebase Authentication + Firestore
// ============================================================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentUser = null;
let currentUserRole = null;

let allUsers = [];
let allMeals = [];
let allBazar = [];
let allDeposits = [];


// ============================================================================
// DOM HELPERS
// ============================================================================

const $ = id => document.getElementById(id);

const authContainer = $("authContainer");
const dashboard = $("dashboard");

const loginBox = $("loginBox");
const registerBox = $("registerBox");

const loginForm = $("loginForm");
const registerForm = $("registerForm");

const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");

const registerName = $("registerName");
const registerEmail = $("registerEmail");
const registerPassword = $("registerPassword");

const showRegister = $("showRegister");
const showLogin = $("showLogin");

const logoutBtn = $("logoutBtn");

const welcomeText = $("welcomeText");
const roleBadge = $("roleBadge");

const totalMembers = $("totalMembers");
const totalMeals = $("totalMeals");
const totalBazar = $("totalBazar");
const mealRate = $("mealRate");

const managerSection = $("managerSection");
const membersList = $("membersList");

const mealDate = $("mealDate");
const dailyMealList = $("dailyMealList");

const accountingMonth = $("accountingMonth");

const monthTotalMeals = $("monthTotalMeals");
const monthTotalBazar = $("monthTotalBazar");
const monthMealRate = $("monthMealRate");
const monthTotalDeposit = $("monthTotalDeposit");

const bazarFormBox = $("bazarFormBox");
const bazarDate = $("bazarDate");
const bazarAmount = $("bazarAmount");
const bazarDescription = $("bazarDescription");
const addBazarBtn = $("addBazarBtn");
const bazarList = $("bazarList");

const depositFormBox = $("depositFormBox");
const depositUser = $("depositUser");
const depositDate = $("depositDate");
const depositAmount = $("depositAmount");
const addDepositBtn = $("addDepositBtn");
const depositList = $("depositList");

const balanceList = $("balanceList");


// ============================================================================
// PREMIUM DYNAMIC STYLE
// ============================================================================

const dynamicStyle = document.createElement("style");

dynamicStyle.textContent = `
/* =========================================================
   PREMIUM DYNAMIC CONTENT
========================================================= */

.member-card,
.meal-row,
.account-row,
.balance-row {
    width: 100%;
    box-sizing: border-box;
}

/* MEMBER CARD */

.member-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 17px 18px;
    margin-bottom: 10px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    transition: all .25s ease;
}

.member-card:hover {
    transform: translateY(-2px);
    border-color: #c7d2fe;
    box-shadow: 0 10px 28px rgba(15,23,42,.07);
}

.member-info,
.meal-user,
.balance-user {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
}

.member-avatar,
.meal-avatar,
.balance-avatar {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    color: #4f46e5;
    font-size: 17px;
    font-weight: 800;
}

.member-info h4 {
    margin: 0 0 4px;
    color: #0f172a;
    font-size: 14px;
    font-weight: 750;
}

.member-info p {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.manager-btn {
    border: 0;
    background: #eef2ff;
    color: #4f46e5;
    padding: 9px 13px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    transition: .2s ease;
}

.manager-btn:hover {
    background: #4f46e5;
    color: #fff;
    transform: translateY(-1px);
}

.manager-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.role-badge.manager {
    background: #eef2ff;
    color: #4f46e5;
}


/* DAILY MEAL */

.meal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 18px;
    margin-bottom: 9px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    transition: .22s ease;
}

.meal-row:hover {
    border-color: #c7d2fe;
    box-shadow: 0 8px 22px rgba(15,23,42,.055);
}

.meal-user {
    min-width: 0;
}

.meal-user > div:last-child {
    min-width: 0;
}

.meal-user strong {
    display: block;
    color: #0f172a;
    font-size: 14px;
    font-weight: 750;
    margin-bottom: 3px;
}

.meal-user small {
    display: block;
    color: #94a3b8;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 260px;
}

.meal-control {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
}

.meal-count {
    width: 42px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
}

.meal-plus,
.meal-minus {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    font-size: 20px;
    font-weight: 700;
    transition: .18s ease;
}

.meal-plus {
    background: #ecfdf5;
    color: #16a34a;
}

.meal-minus {
    background: #fff1f2;
    color: #e11d48;
}

.meal-plus:hover,
.meal-minus:hover {
    transform: scale(1.07);
}

.meal-plus:disabled,
.meal-minus:disabled {
    opacity: .5;
    cursor: not-allowed;
}


/* ACCOUNT ROW */

.account-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 16px 18px;
    margin-bottom: 9px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    transition: .22s ease;
}

.account-row:hover {
    border-color: #c7d2fe;
    box-shadow: 0 8px 22px rgba(15,23,42,.05);
}

.account-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.account-main strong {
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
}

.account-main span {
    color: #475569;
    font-size: 13px;
}

.account-main small {
    color: #94a3b8;
    font-size: 11px;
}

.delete-btn {
    border: 0;
    padding: 8px 12px;
    border-radius: 9px;
    background: #fff1f2;
    color: #e11d48;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
    transition: .2s ease;
    flex-shrink: 0;
}

.delete-btn:hover {
    background: #e11d48;
    color: #fff;
}

.delete-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
}


/* BALANCE */

.balance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 17px 18px;
    margin-bottom: 10px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    transition: .22s ease;
}

.balance-row:hover {
    border-color: #c7d2fe;
    box-shadow: 0 8px 24px rgba(15,23,42,.055);
}

.balance-user {
    flex: 1;
    min-width: 180px;
}

.balance-user strong {
    display: block;
    color: #0f172a;
    font-size: 14px;
    margin-bottom: 4px;
}

.balance-user small {
    color: #94a3b8;
    font-size: 11px;
}

.balance-details {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    flex-wrap: wrap;
}

.balance-details > span:not(.balance-value):not(.balance-status) {
    color: #64748b;
    font-size: 11px;
}

.balance-details strong {
    color: #334155;
}

.balance-value {
    font-size: 14px !important;
    font-weight: 850;
}

.balance-value.advance {
    color: #16a34a;
}

.balance-value.due {
    color: #dc2626;
}

.balance-value.clear {
    color: #64748b;
}

.balance-status {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 10px !important;
    font-weight: 800;
}

.balance-status.advance {
    background: #dcfce7;
    color: #15803d;
}

.balance-status.due {
    background: #fee2e2;
    color: #dc2626;
}

.balance-status.clear {
    background: #f1f5f9;
    color: #64748b;
}


/* EMPTY / ERROR */

.empty-state {
    text-align: center;
    padding: 40px 20px;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    background: #f8fafc;
}

.empty-icon {
    width: 50px;
    height: 50px;
    margin: 0 auto 12px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eef2ff;
    font-size: 22px;
}

.empty-state h3 {
    margin: 0 0 5px;
    color: #334155;
    font-size: 14px;
}

.empty-state p {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
}

.error-state {
    border-color: #fecaca;
    background: #fffafa;
}

.error-state .empty-icon {
    background: #fee2e2;
}


/* LOADING */

.loading-state {
    min-height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #64748b;
    font-size: 12px;
}

.loader,
.loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: messSpin .75s linear infinite;
}

@keyframes messSpin {
    to {
        transform: rotate(360deg);
    }
}


/* TOAST */

#toastContainer {
    position: fixed;
    top: 22px;
    right: 22px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: min(370px, calc(100vw - 30px));
}

.mess-toast {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 15px;
    background: rgba(255,255,255,.97);
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    box-shadow: 0 18px 45px rgba(15,23,42,.14);
    animation: toastIn .3s ease forwards;
}

.mess-toast.hide {
    animation: toastOut .3s ease forwards;
}

.mess-toast-icon {
    width: 31px;
    height: 31px;
    min-width: 31px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
}

.mess-toast-message {
    color: #334155;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
}

@keyframes toastIn {
    from {
        opacity: 0;
        transform: translateX(35px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes toastOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(35px);
    }
}


/* MOBILE */

@media (max-width: 600px) {

    .member-card,
    .meal-row,
    .account-row,
    .balance-row {
        padding: 13px;
    }

    .member-card {
        align-items: flex-start;
    }

    .member-actions {
        margin-top: 3px;
    }

    .manager-btn {
        padding: 8px 9px;
        font-size: 10px;
    }

    .meal-row {
        gap: 10px;
    }

    .meal-user {
        min-width: 0;
    }

    .meal-user small {
        max-width: 130px;
    }

    .meal-control {
        gap: 5px;
    }

    .meal-count {
        width: 35px;
        height: 35px;
    }

    .meal-plus,
    .meal-minus {
        width: 30px;
        height: 30px;
        font-size: 17px;
    }

    .balance-row {
        align-items: flex-start;
        flex-direction: column;
    }

    .balance-details {
        width: 100%;
        justify-content: flex-start;
        gap: 9px;
    }

    .account-row {
        align-items: flex-start;
    }

    #toastContainer {
        top: 12px;
        right: 12px;
    }
}
`;

document.head.appendChild(dynamicStyle);


// ============================================================================
// 🍽️ PREMIUM MEAL SLOT STYLE
// ============================================================================

const mealSlotStyle = document.createElement("style");

mealSlotStyle.textContent = `

.meal-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.meal-slots {
    display: flex;
    align-items: center;
    gap: 8px;
}

.meal-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 7px;
    min-width: 72px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
}

.meal-slot-label {
    font-size: 10px;
    font-weight: 800;
    color: #64748b;
    white-space: nowrap;
}

.meal-slot-controls {
    display: flex;
    align-items: center;
    gap: 4px;
}

.meal-slot-count {
    min-width: 34px;
    text-align: center;
    font-size: 13px;
    font-weight: 850;
    color: #0f172a;
}

.meal-slot-btn {
    width: 25px;
    height: 25px;
    border: 0;
    border-radius: 7px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 800;
    transition: .18s ease;
}

.meal-slot-btn.plus {
    background: #dcfce7;
    color: #16a34a;
}

.meal-slot-btn.minus {
    background: #fee2e2;
    color: #dc2626;
}

.meal-slot-btn:hover {
    transform: scale(1.08);
}

.meal-slot-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
}

.meal-total-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 65px;
    padding: 8px 10px;
    border-radius: 12px;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
}

.meal-total-label {
    font-size: 9px;
    font-weight: 800;
    color: #6366f1;
    margin-bottom: 3px;
}

.meal-total-value {
    font-size: 16px;
    font-weight: 900;
    color: #4338ca;
}

@media (max-width: 850px) {

    .meal-row {
        align-items: flex-start;
        flex-direction: column;
    }

    .meal-control {
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
    }

}

@media (max-width: 600px) {

    .meal-slots {
        width: 100%;
        justify-content: space-between;
        gap: 5px;
    }

    .meal-slot {
        min-width: 0;
        flex: 1;
        padding: 6px 4px;
    }

    .meal-slot-label {
        font-size: 9px;
    }

    .meal-total-box {
        min-width: 58px;
    }

    .meal-slot-btn {
        width: 24px;
        height: 24px;
        font-size: 14px;
    }

}

`;

document.head.appendChild(mealSlotStyle);


// ============================================================================
// CUSTOM CONFIRM MODAL
// ============================================================================

const customModal = $("customModal");
const modalIcon = $("modalIcon");
const modalTitle = $("modalTitle");
const modalMessage = $("modalMessage");
const modalCancel = $("modalCancel");
const modalConfirm = $("modalConfirm");

let modalResolve = null;


function showConfirmModal(title, message, options = {}) {

    const {
        icon = "⚠️",
        confirmText = "Confirm",
        cancelText = "Cancel"
    } = options;

    if (!customModal) {
        return Promise.resolve(false);
    }

    if (modalIcon) modalIcon.textContent = icon;
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    if (modalConfirm) modalConfirm.textContent = confirmText;
    if (modalCancel) modalCancel.textContent = cancelText;

    customModal.classList.add("show");

    return new Promise(resolve => {
        modalResolve = resolve;
    });
}


function closeModal(result) {

    customModal?.classList.remove("show");

    if (modalResolve) {
        modalResolve(result);
        modalResolve = null;
    }
}


modalConfirm?.addEventListener("click", () => {
    closeModal(true);
});

modalCancel?.addEventListener("click", () => {
    closeModal(false);
});

customModal?.addEventListener("click", event => {

    if (event.target === customModal) {
        closeModal(false);
    }

});

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        customModal?.classList.contains("show")
    ) {
        closeModal(false);
    }

});


// ============================================================================
// TOAST SYSTEM
// ============================================================================

function showToast(message, type = "success") {

    let container = $("toastContainer");

    if (!container) {

        container = document.createElement("div");
        container.id = "toastContainer";

        document.body.appendChild(container);
    }

    const config = {

        success: {
            icon: "✓",
            background: "#dcfce7",
            color: "#16a34a"
        },

        error: {
            icon: "✕",
            background: "#fee2e2",
            color: "#dc2626"
        },

        warning: {
            icon: "!",
            background: "#fef3c7",
            color: "#d97706"
        },

        info: {
            icon: "i",
            background: "#dbeafe",
            color: "#2563eb"
        }

    };

    const selected =
        config[type] || config.info;

    const toast =
        document.createElement("div");

    toast.className = "mess-toast";

    const icon =
        document.createElement("span");

    icon.className = "mess-toast-icon";

    icon.style.background =
        selected.background;

    icon.style.color =
        selected.color;

    icon.textContent =
        selected.icon;

    const text =
        document.createElement("span");

    text.className =
        "mess-toast-message";

    text.textContent =
        message;

    toast.appendChild(icon);
    toast.appendChild(text);

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3500);
}


// ============================================================================
// UTILITY
// ============================================================================

function getToday() {

    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


function getCurrentMonth() {

    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0")
    ].join("-");
}


function money(amount) {

    return `৳${Number(amount || 0).toFixed(2)}`;
}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


function isInSelectedMonth(dateString) {

    if (!accountingMonth?.value) {
        return true;
    }

    return String(dateString || "")
        .startsWith(accountingMonth.value);
}


function getUserById(uid) {

    return allUsers.find(
        user => user.uid === uid
    );
}


function getUserName(uid) {

    const user =
        getUserById(uid);

    return (
        user?.name ||
        user?.email ||
        "Unknown Member"
    );
}


function setButtonLoading(
    button,
    loading,
    loadingText = "Processing..."
) {

    if (!button) return;

    if (loading) {

        if (!button.dataset.originalText) {
            button.dataset.originalText =
                button.textContent;
        }

        button.disabled = true;
        button.textContent = loadingText;

    } else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.textContent =
                button.dataset.originalText;

            delete button.dataset.originalText;
        }
    }
}


// ============================================================================
// DEFAULT DATES
// ============================================================================

if (mealDate) {
    mealDate.value = getToday();
}

if (bazarDate) {
    bazarDate.value = getToday();
}

if (depositDate) {
    depositDate.value = getToday();
}

if (accountingMonth) {
    accountingMonth.value = getCurrentMonth();
}


// ============================================================================
// MOBILE SIDEBAR
// ============================================================================

const sidebar =
    document.querySelector(".sidebar");

const mobileMenuBtn =
    document.querySelector(".mobile-menu-btn");


function closeMobileSidebar() {

    sidebar?.classList.remove(
        "sidebar-open"
    );
}


mobileMenuBtn?.addEventListener(
    "click",
    () => {

        sidebar?.classList.toggle(
            "sidebar-open"
        );

    }
);


document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".nav-item")
                    .forEach(nav =>
                        nav.classList.remove("active")
                    );

                item.classList.add("active");

                closeMobileSidebar();

            }
        );

    });


// ============================================================================
// AUTH SWITCH
// ============================================================================

showRegister?.addEventListener(
    "click",
    () => {

        loginBox?.classList.remove("active");
        registerBox?.classList.add("active");

    }
);


showLogin?.addEventListener(
    "click",
    () => {

        registerBox?.classList.remove("active");
        loginBox?.classList.add("active");

    }
);


// ============================================================================
// REGISTER
// ============================================================================

registerForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            registerName?.value.trim();

        const email =
            registerEmail?.value.trim();

        const password =
            registerPassword?.value || "";

        if (!name || !email || !password) {

            showToast(
                "সবগুলো তথ্য পূরণ করুন।",
                "warning"
            );

            return;
        }

        if (password.length < 6) {

            showToast(
                "Password কমপক্ষে ৬ characters হতে হবে।",
                "warning"
            );

            return;
        }

        const button =
            registerForm.querySelector(
                "button[type='submit']"
            );

        try {

            setButtonLoading(
                button,
                true,
                "Creating..."
            );

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                credential.user;

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name,
                    email,
                    role: "member",
                    createdAt: serverTimestamp()
                }
            );

            await signOut(auth);

            registerForm.reset();

            registerBox?.classList.remove(
                "active"
            );

            loginBox?.classList.add(
                "active"
            );

            showToast(
                "Account সফলভাবে তৈরি হয়েছে। এখন Login করুন।",
                "success"
            );

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            let message =
                "Registration failed.";

            switch (error.code) {

                case "auth/email-already-in-use":
                    message =
                        "এই Email দিয়ে আগে থেকেই account আছে।";
                    break;

                case "auth/invalid-email":
                    message =
                        "Email address সঠিক নয়।";
                    break;

                case "auth/weak-password":
                    message =
                        "Password আরও শক্তিশালী দিন।";
                    break;

                default:
                    message =
                        "Account তৈরি করা যায়নি। আবার চেষ্টা করুন।";
            }

            showToast(
                message,
                "error"
            );

        } finally {

            setButtonLoading(
                button,
                false
            );

        }

    }
);


// ============================================================================
// LOGIN
// ============================================================================

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            loginEmail?.value.trim();

        const password =
            loginPassword?.value || "";

        if (!email || !password) {

            showToast(
                "Email এবং Password দিন।",
                "warning"
            );

            return;
        }

        const button =
            loginForm.querySelector(
                "button[type='submit']"
            );

        try {

            setButtonLoading(
                button,
                true,
                "Signing in..."
            );

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            loginForm.reset();

            showToast(
                "Login successful! 👋",
                "success"
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            let message =
                "Email অথবা Password ভুল।";

            switch (error.code) {

                case "auth/user-not-found":
                    message =
                        "এই Email দিয়ে কোনো account পাওয়া যায়নি।";
                    break;

                case "auth/wrong-password":
                    message =
                        "Password ভুল হয়েছে।";
                    break;

                case "auth/invalid-credential":
                    message =
                        "Email অথবা Password সঠিক নয়।";
                    break;

                case "auth/too-many-requests":
                    message =
                        "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
                    break;
            }

            showToast(
                message,
                "error"
            );

        } finally {

            setButtonLoading(
                button,
                false
            );

        }

    }
);


// ============================================================================
// LOAD MEMBERS
// ============================================================================

async function loadMembers() {

    if (!membersList) return;

    try {

        membersList.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <span>Loading members...</span>
            </div>
        `;

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        allUsers =
            snapshot.docs.map(
                snap => ({
                    id: snap.id,
                    ...snap.data()
                })
            );

        if (totalMembers) {
            totalMembers.textContent =
                allUsers.length;
        }

        membersList.innerHTML = "";

        if (!allUsers.length) {

            membersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No members found</h3>
                    <p>এখনও কোনো member যোগ হয়নি।</p>
                </div>
            `;

            return;
        }

        const sortedUsers =
            [...allUsers].sort(
                (a, b) => {

                    if (
                        a.role === "manager" &&
                        b.role !== "manager"
                    ) return -1;

                    if (
                        b.role === "manager" &&
                        a.role !== "manager"
                    ) return 1;

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(b.name || "")
                    );
                }
            );

        sortedUsers.forEach(user => {

            const card =
                document.createElement("div");

            card.className =
                "member-card";

            const isManager =
                user.role === "manager";

            const initial =
                (
                    user.name ||
                    user.email ||
                    "U"
                )
                    .charAt(0)
                    .toUpperCase();

            card.innerHTML = `

                <div class="member-info">

                    <div class="member-avatar">
                        ${escapeHTML(initial)}
                    </div>

                    <div>
                        <h4>
                            ${escapeHTML(
                user.name ||
                "Unknown Member"
            )}
                        </h4>

                        <p>
                            ${escapeHTML(
                user.email || ""
            )}
                        </p>
                    </div>

                </div>

                <div class="member-actions">

                    ${isManager
                    ? `
                                <span class="role-badge manager">
                                    👑 Manager
                                </span>
                            `
                    : currentUserRole === "manager"
                        ? `
                                <button
                                    type="button"
                                    class="manager-btn"
                                    data-user-id="${escapeHTML(
                            user.uid
                        )}"
                                >
                                    Make Manager
                                </button>
                            `
                        : `
                                <span class="role-badge">
                                    Member
                                </span>
                            `
                }

                </div>
            `;

            membersList.appendChild(card);
        });

        membersList
            .querySelectorAll(".manager-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const uid =
                            button.dataset.userId;

                        button.disabled = true;

                        await transferManager(uid);

                        button.disabled = false;

                    }
                );

            });

    } catch (error) {

        console.error(
            "Load members error:",
            error
        );

        membersList.innerHTML = `
            <div class="empty-state error-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load members</h3>
                <p>Members load করা যায়নি। আবার চেষ্টা করুন।</p>
            </div>
        `;

        showToast(
            "Members load করতে সমস্যা হয়েছে।",
            "error"
        );
    }
}


// ============================================================================
// TRANSFER MANAGER
// ============================================================================

async function transferManager(
    newManagerId
) {

    if (
        currentUserRole !==
        "manager"
    ) {

        showToast(
            "শুধু Manager এই action করতে পারবেন।",
            "error"
        );

        return;
    }

    const target =
        getUserById(newManagerId);

    if (!target) {

        showToast(
            "Target member পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    const confirmed =
        await showConfirmModal(
            "Make Manager?",
            `${target.name || "এই member"}-কে নতুন Manager করতে চান?`,
            {
                icon: "👑",
                confirmText: "Make Manager"
            }
        );

    if (!confirmed) return;

    try {

        await runTransaction(
            db,
            async transaction => {

                const currentRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );

                const targetRef =
                    doc(
                        db,
                        "users",
                        newManagerId
                    );

                const currentSnap =
                    await transaction.get(
                        currentRef
                    );

                const targetSnap =
                    await transaction.get(
                        targetRef
                    );

                if (
                    !currentSnap.exists()
                ) {
                    throw new Error(
                        "Current manager not found."
                    );
                }

                if (
                    !targetSnap.exists()
                ) {
                    throw new Error(
                        "Target user not found."
                    );
                }

                const currentData =
                    currentSnap.data();

                const targetData =
                    targetSnap.data();

                if (
                    currentData.role !==
                    "manager"
                ) {
                    throw new Error(
                        "You are no longer manager."
                    );
                }

                if (
                    targetData.role ===
                    "manager"
                ) {
                    throw new Error(
                        "This user is already manager."
                    );
                }

                transaction.update(
                    currentRef,
                    {
                        role: "member"
                    }
                );

                transaction.update(
                    targetRef,
                    {
                        role: "manager"
                    }
                );
            }
        );

        showToast(
            "Manager successfully transferred.",
            "success"
        );

        setTimeout(
            () => signOut(auth),
            700
        );

    } catch (error) {

        console.error(
            "Manager transfer error:",
            error
        );

        showToast(
            error.message ||
            "Manager transfer failed.",
            "error"
        );
    }
}





// ============================================================================
// 🍽️ MEAL HELPERS
// ============================================================================

function getMealDocId(date, userId) {
    return `${date}_${userId}`;
}


function getTodayDate() {
    return (
        mealDate?.value ||
        getToday()
    );
}


// ============================================================================
// GET MEAL DATA
// ============================================================================

function getMealParts(data = {}) {

    /*
        NEW SYSTEM

        Breakfast = 0.5 step
        Lunch     = 1 step
        Dinner    = 1 step

        Old data compatibility:
        যদি পুরোনো document-এ শুধু "meal" থাকে,
        তাহলে সেটাকে lunch হিসেবে ধরা হবে।
    */

    const hasNewMealSystem =
        data.breakfast !== undefined ||
        data.lunch !== undefined ||
        data.dinner !== undefined;

    if (hasNewMealSystem) {

        return {
            breakfast: Math.max(
                0,
                Number(data.breakfast || 0)
            ),

            lunch: Math.max(
                0,
                Number(data.lunch || 0)
            ),

            dinner: Math.max(
                0,
                Number(data.dinner || 0)
            )
        };
    }

    // পুরোনো meal data থাকলে
    return {
        breakfast: 0,
        lunch: Math.max(
            0,
            Number(data.meal || 0)
        ),
        dinner: 0
    };
}


function getMealTotal(data = {}) {

    const parts =
        getMealParts(data);

    return (
        parts.breakfast +
        parts.lunch +
        parts.dinner
    );
}


// ============================================================================
// LOAD DAILY MEALS
// ============================================================================

async function loadDailyMeals() {

    if (!dailyMealList) return;

    const date =
        getTodayDate();

    try {

        dailyMealList.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <span>Loading meals...</span>
            </div>
        `;

        if (!allUsers.length) {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "users"
                    )
                );

            allUsers =
                snapshot.docs.map(
                    snap => ({
                        id: snap.id,
                        ...snap.data()
                    })
                );
        }


        // ================================================================
        // LOAD EVERY MEMBER'S MEAL
        // ================================================================

        const meals =
            await Promise.all(

                allUsers.map(
                    async user => {

                        const mealRef =
                            doc(
                                db,
                                "meals",
                                getMealDocId(
                                    date,
                                    user.uid
                                )
                            );

                        const snap =
                            await getDoc(
                                mealRef
                            );

                        const data =
                            snap.exists()
                                ? snap.data()
                                : {};

                        const parts =
                            getMealParts(data);

                        const total =
                            parts.breakfast +
                            parts.lunch +
                            parts.dinner;

                        return {

                            userId:
                                user.uid,

                            name:
                                user.name,

                            email:
                                user.email,

                            breakfast:
                                parts.breakfast,

                            lunch:
                                parts.lunch,

                            dinner:
                                parts.dinner,

                            meal:
                                total
                        };
                    }
                )
            );


        allMeals = meals;


        // ================================================================
        // TOTAL DAILY MEAL
        // ================================================================

        const total =
            meals.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.meal || 0
                    ),
                0
            );


        if (totalMeals) {

            totalMeals.textContent =
                Number(total.toFixed(2));
        }


        // ================================================================
        // SUMMARY STRIP
        // ================================================================

        const summaryStrip =
            document.querySelector(
                ".meal-summary-strip"
            );

        if (summaryStrip) {

            const strong =
                summaryStrip.querySelector(
                    "strong"
                );

            const note =
                summaryStrip.querySelector(
                    ".summary-strip-note"
                );

            if (strong) {

                strong.textContent =
                    `${Number(
                        total.toFixed(2)
                    )} Meals`;
            }

            if (note) {

                note.textContent =
                    `Selected date: ${date}`;
            }
        }


        dailyMealList.innerHTML = "";


        if (!meals.length) {

            dailyMealList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🍽️
                    </div>

                    <h3>
                        No members
                    </h3>

                    <p>
                        Meal দেখানোর মতো member নেই।
                    </p>

                </div>
            `;

            return;
        }


        // ================================================================
        // RENDER MEMBERS
        // ================================================================

        meals.forEach(item => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "meal-row";


            const initial =
                (
                    item.name ||
                    item.email ||
                    "U"
                )
                    .charAt(0)
                    .toUpperCase();


            row.innerHTML = `

                <div class="meal-user">

                    <div class="meal-avatar">
                        ${escapeHTML(initial)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                item.name ||
                "Unknown Member"
            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                item.email || ""
            )}
                        </small>

                    </div>

                </div>


                <div class="meal-control">

                    <div class="meal-slots">


                        <!-- =================================================
                             BREAKFAST
                        ================================================== -->

                        <div class="meal-slot">

                            <div class="meal-slot-label">
                                🌅 সকাল
                            </div>

                            <div class="meal-slot-controls">

                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn minus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="breakfast"
                                            >
                                                −
                                            </button>
                                        `
                    : ""
                }


                                <span class="meal-slot-count">
                                    ${Number(
                    item.breakfast.toFixed(2)
                )}
                                </span>


                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn plus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="breakfast"
                                            >
                                                +
                                            </button>
                                        `
                    : ""
                }

                            </div>

                        </div>


                        <!-- =================================================
                             LUNCH
                        ================================================== -->

                        <div class="meal-slot">

                            <div class="meal-slot-label">
                                ☀️ দুপুর
                            </div>

                            <div class="meal-slot-controls">

                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn minus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="lunch"
                                            >
                                                −
                                            </button>
                                        `
                    : ""
                }


                                <span class="meal-slot-count">
                                    ${Number(
                    item.lunch.toFixed(2)
                )}
                                </span>


                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn plus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="lunch"
                                            >
                                                +
                                            </button>
                                        `
                    : ""
                }

                            </div>

                        </div>


                        <!-- =================================================
                             DINNER
                        ================================================== -->

                        <div class="meal-slot">

                            <div class="meal-slot-label">
                                🌙 রাত
                            </div>

                            <div class="meal-slot-controls">

                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn minus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="dinner"
                                            >
                                                −
                                            </button>
                                        `
                    : ""
                }


                                <span class="meal-slot-count">
                                    ${Number(
                    item.dinner.toFixed(2)
                )}
                                </span>


                                ${currentUserRole === "manager"
                    ? `
                                            <button
                                                type="button"
                                                class="meal-slot-btn plus"
                                                data-user-id="${escapeHTML(
                        item.userId
                    )}"
                                                data-meal-type="dinner"
                                            >
                                                +
                                            </button>
                                        `
                    : ""
                }

                            </div>

                        </div>

                    </div>


                    <!-- =====================================================
                         TOTAL
                    ====================================================== -->

                    <div class="meal-total-box">

                        <div class="meal-total-label">
                            TOTAL
                        </div>

                        <div class="meal-total-value">
                            ${Number(
                    item.meal.toFixed(2)
                )}
                        </div>

                    </div>

                </div>
            `;


            dailyMealList.appendChild(
                row
            );

        });


        // ================================================================
        // PLUS BUTTON
        // ================================================================

        dailyMealList
            .querySelectorAll(
                ".meal-slot-btn.plus"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeMeal(
                            button.dataset.userId,
                            button.dataset.mealType,
                            1
                        );

                    }
                );

            });


        // ================================================================
        // MINUS BUTTON
        // ================================================================

        dailyMealList
            .querySelectorAll(
                ".meal-slot-btn.minus"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeMeal(
                            button.dataset.userId,
                            button.dataset.mealType,
                            -1
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Daily meals error:",
            error
        );

        dailyMealList.innerHTML = `
            <div class="empty-state error-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load meals
                </h3>

                <p>
                    Daily meal load করা যায়নি।
                </p>

            </div>
        `;

        showToast(
            "Daily meal load করতে সমস্যা হয়েছে।",
            "error"
        );
    }
}


// ============================================================================
// CHANGE MEAL
// ============================================================================

async function changeMeal(
    userId,
    mealType,
    direction
) {

    if (
        currentUserRole !==
        "manager"
    ) {

        showToast(
            "শুধু Manager meal পরিবর্তন করতে পারবেন।",
            "error"
        );

        return;
    }


    // ================================================================
    // VALID MEAL TYPE
    // ================================================================

    const validTypes = [
        "breakfast",
        "lunch",
        "dinner"
    ];

    if (
        !validTypes.includes(
            mealType
        )
    ) {

        showToast(
            "Invalid meal type.",
            "error"
        );

        return;
    }


    const date =
        getTodayDate();


    // ================================================================
    // STEP
    //
    // Breakfast = 0.5
    // Lunch     = 1
    // Dinner    = 1
    // ================================================================

    const step =
        mealType === "breakfast"
            ? 0.5
            : 1;


    // ================================================================
    // BUTTON DISABLE
    // ================================================================

    const row =
        document
            .querySelector(
                `.meal-row [data-user-id="${CSS.escape(
                    userId
                )}"][data-meal-type="${CSS.escape(
                    mealType
                )}"]`
            )
            ?.closest(
                ".meal-row"
            );


    const buttons =
        row?.querySelectorAll(
            ".meal-slot-btn"
        );


    buttons?.forEach(
        button => {
            button.disabled = true;
        }
    );


    try {

        const mealRef =
            doc(
                db,
                "meals",
                getMealDocId(
                    date,
                    userId
                )
            );


        await runTransaction(
            db,
            async transaction => {

                const snap =
                    await transaction.get(
                        mealRef
                    );


                const data =
                    snap.exists()
                        ? snap.data()
                        : {};


                const parts =
                    getMealParts(data);


                const currentValue =
                    Number(
                        parts[mealType] || 0
                    );


                let newValue =
                    currentValue +
                    (
                        direction *
                        step
                    );


                // কখনো negative হবে না
                newValue =
                    Math.max(
                        0,
                        newValue
                    );


                // Floating point problem fix
                newValue =
                    Number(
                        newValue.toFixed(2)
                    );


                transaction.set(
                    mealRef,
                    {

                        userId,

                        date,

                        breakfast:
                            mealType === "breakfast"
                                ? newValue
                                : parts.breakfast,

                        lunch:
                            mealType === "lunch"
                                ? newValue
                                : parts.lunch,

                        dinner:
                            mealType === "dinner"
                                ? newValue
                                : parts.dinner,

                        // Total meal-ও save থাকবে
                        meal:
                            Number(
                                (
                                    (
                                        mealType === "breakfast"
                                            ? newValue
                                            : parts.breakfast
                                    ) +

                                    (
                                        mealType === "lunch"
                                            ? newValue
                                            : parts.lunch
                                    ) +

                                    (
                                        mealType === "dinner"
                                            ? newValue
                                            : parts.dinner
                                    )
                                ).toFixed(2)
                            ),

                        updatedAt:
                            serverTimestamp()
                    },

                    {
                        merge: true
                    }
                );

            }
        );


        // ================================================================
        // REFRESH
        // ================================================================

        await loadDailyMeals();


        if (
            isInSelectedMonth(date)
        ) {

            await loadAccounting();

        }


    } catch (error) {

        console.error(
            "Change meal error:",
            error
        );

        showToast(
            "Meal update করা যায়নি।",
            "error"
        );

    } finally {

        buttons?.forEach(
            button => {
                button.disabled = false;
            }
        );

    }
}




// ============================================================================
// LOAD USER DASHBOARD
// ============================================================================

async function loadUserDashboard(
    user
) {

    try {

        const profileRef =
            doc(
                db,
                "users",
                user.uid
            );

        const profileSnap =
            await getDoc(
                profileRef
            );

        if (!profileSnap.exists()) {

            showToast(
                "User profile পাওয়া যায়নি।",
                "error"
            );

            await signOut(auth);

            return;
        }

        const profile =
            profileSnap.data();

        currentUser = {
            uid: user.uid,
            ...profile
        };

        currentUserRole =
            profile.role ||
            "member";

        authContainer?.classList.add(
            "hidden"
        );

        dashboard?.classList.remove(
            "hidden"
        );

        if (welcomeText) {

            welcomeText.textContent =
                `Welcome, ${profile.name ||
                "User"
                } 👋`;
        }

        if (roleBadge) {

            roleBadge.textContent =
                currentUserRole === "manager"
                    ? "Manager"
                    : "Member";

            roleBadge.classList.toggle(
                "manager",
                currentUserRole === "manager"
            );
        }

        const profileInfo =
            document.querySelector(
                ".profile-info"
            );

        if (profileInfo) {

            const strong =
                profileInfo.querySelector(
                    "strong"
                );

            const span =
                profileInfo.querySelector(
                    "span"
                );

            if (strong) {
                strong.textContent =
                    profile.name ||
                    "Account";
            }

            if (span) {
                span.textContent =
                    currentUserRole === "manager"
                        ? "Manager Account"
                        : "Member Account";
            }
        }

        const isManager = currentUserRole === "manager";

        if (managerSection) {
            managerSection.classList.toggle("hidden", !isManager);
        }

        if (bazarFormBox) {
            bazarFormBox.classList.toggle("hidden", !isManager);
        }

        if (depositFormBox) {
            depositFormBox.classList.toggle("hidden", !isManager);
        }

        await loadMembers();
        await loadDailyMeals();
        await loadDepositUsers();
        await loadAccounting();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showToast(
            "Dashboard load করতে সমস্যা হয়েছে।",
            "error"
        );
    }
}


// ============================================================================
// LOGOUT
// ============================================================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        const confirmed =
            await showConfirmModal(
                "Logout?",
                "আপনি কি আপনার account থেকে logout করতে চান?",
                {
                    icon: "🚪",
                    confirmText: "Logout"
                }
            );

        if (!confirmed) return;

        try {

            await signOut(auth);

            showToast(
                "Successfully logged out.",
                "success"
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showToast(
                "Logout করা যায়নি।",
                "error"
            );
        }
    }
);


// ============================================================================
// ACCOUNTING
// ============================================================================

async function loadAccounting() {

    try {

        const selectedMonth =
            accountingMonth?.value ||
            getCurrentMonth();

        if (!allUsers.length) {

            const snapshot =
                await getDocs(
                    collection(db, "users")
                );

            allUsers =
                snapshot.docs.map(
                    snap => ({
                        id: snap.id,
                        ...snap.data()
                    })
                );
        }

        const [
            bazarSnapshot,
            depositsSnapshot,
            mealsSnapshot
        ] = await Promise.all([

            getDocs(
                collection(
                    db,
                    "bazar"
                )
            ),

            getDocs(
                collection(
                    db,
                    "deposits"
                )
            ),

            getDocs(
                collection(
                    db,
                    "meals"
                )
            )
        ]);

        allBazar =
            bazarSnapshot.docs.map(
                snap => ({
                    id: snap.id,
                    ...snap.data()
                })
            );

        allDeposits =
            depositsSnapshot.docs.map(
                snap => ({
                    id: snap.id,
                    ...snap.data()
                })
            );

        allMeals =
            mealsSnapshot.docs.map(
                snap => ({
                    id: snap.id,
                    ...snap.data()
                })
            );

        const monthBazar =
            allBazar.filter(
                item =>
                    String(
                        item.date || ""
                    ).startsWith(
                        selectedMonth
                    )
            );

        const monthDeposits =
            allDeposits.filter(
                item =>
                    String(
                        item.date || ""
                    ).startsWith(
                        selectedMonth
                    )
            );

        const monthMeals =
            allMeals.filter(
                item =>
                    String(
                        item.date || ""
                    ).startsWith(
                        selectedMonth
                    )
            );

        const totalBazarAmount =
            monthBazar.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        const totalDepositAmount =
            monthDeposits.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );

        const totalMealCount =
            monthMeals.reduce(
                (sum, item) =>
                    sum +
                    getMealTotal(item),
                0
            );

        const rate =
            totalMealCount > 0
                ? totalBazarAmount /
                totalMealCount
                : 0;

        if (monthTotalMeals) {
            monthTotalMeals.textContent =
                totalMealCount;
        }

        if (monthTotalBazar) {
            monthTotalBazar.textContent =
                money(
                    totalBazarAmount
                );
        }

        if (monthMealRate) {
            monthMealRate.textContent =
                money(rate);
        }

        if (monthTotalDeposit) {
            monthTotalDeposit.textContent =
                money(
                    totalDepositAmount
                );
        }

        if (totalBazar) {
            totalBazar.textContent =
                money(
                    totalBazarAmount
                );
        }

        if (mealRate) {
            mealRate.textContent =
                money(rate);
        }

        renderBazar(
            monthBazar
        );

        renderDeposits(
            monthDeposits
        );

        renderBalances(
            monthDeposits,
            monthMeals,
            rate
        );

    } catch (error) {

        console.error(
            "Accounting error:",
            error
        );

        showToast(
            "Accounting data load করতে সমস্যা হয়েছে।",
            "error"
        );
    }
}


// ============================================================================
// RENDER BAZAR
// ============================================================================

function renderBazar(
    items
) {

    if (!bazarList) return;

    bazarList.innerHTML = "";

    const sorted =
        [...items].sort(
            (a, b) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                )
        );

    if (!sorted.length) {

        bazarList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>No bazar record</h3>
                <p>এই মাসে কোনো bazar entry নেই।</p>
            </div>
        `;

        return;
    }

    sorted.forEach(item => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "account-row";

        row.innerHTML = `

            <div class="account-main">

                <strong>
                    ${money(item.amount)}
                </strong>

                <span>
                    ${escapeHTML(
            item.description ||
            "Bazar Purchase"
        )}
                </span>

                <small>
                    ${escapeHTML(
            item.date || ""
        )}
                </small>

            </div>

            ${currentUserRole === "manager"
                ? `
                        <button
                            type="button"
                            class="delete-btn"
                            data-type="bazar"
                            data-id="${escapeHTML(
                    item.id
                )}"
                        >
                            Delete
                        </button>
                    `
                : ""
            }

        `;

        bazarList.appendChild(
            row
        );
    });

    attachDeleteEvents();
}


// ============================================================================
// RENDER DEPOSITS
// ============================================================================

function renderDeposits(
    items
) {

    if (!depositList) return;

    depositList.innerHTML = "";

    const sorted =
        [...items].sort(
            (a, b) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                )
        );

    if (!sorted.length) {

        depositList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <h3>No deposit record</h3>
                <p>এই মাসে কোনো deposit entry নেই।</p>
            </div>
        `;

        return;
    }

    sorted.forEach(item => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "account-row";

        row.innerHTML = `

            <div class="account-main">

                <strong>
                    ${money(item.amount)}
                </strong>

                <span>
                    ${escapeHTML(
            getUserName(
                item.userId
            )
        )}
                </span>

                <small>
                    ${escapeHTML(
            item.date || ""
        )}
                </small>

            </div>

            ${currentUserRole === "manager"
                ? `
                        <button
                            type="button"
                            class="delete-btn"
                            data-type="deposit"
                            data-id="${escapeHTML(
                    item.id
                )}"
                        >
                            Delete
                        </button>
                    `
                : ""
            }

        `;

        depositList.appendChild(
            row
        );
    });

    attachDeleteEvents();
}


// ============================================================================
// RENDER BALANCES
// ============================================================================

function renderBalances(
    deposits,
    meals,
    rate
) {

    if (!balanceList) return;

    balanceList.innerHTML = "";

    if (!allUsers.length) {

        balanceList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No members</h3>
                <p>Balance হিসাব করার মতো member নেই।</p>
            </div>
        `;

        return;
    }

    const sortedUsers =
        [...allUsers].sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                )
        );

    sortedUsers.forEach(
        user => {

            const userDeposits =
                deposits
                    .filter(
                        item =>
                            item.userId ===
                            user.uid
                    )
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(
                                item.amount || 0
                            ),
                        0
                    );

            const userMeals =
                meals
                    .filter(
                        item =>
                            item.userId ===
                            user.uid
                    )
                    .reduce(
                        (sum, item) =>
                            sum +
                            getMealTotal(item),
                        0
                    );

            const mealCost =
                userMeals * rate;

            const balance =
                userDeposits -
                mealCost;

            let status = "Clear";
            let statusClass = "clear";

            if (balance > 0.009) {

                status = "Advance";
                statusClass =
                    "advance";

            } else if (
                balance < -0.009
            ) {

                status = "Due";
                statusClass =
                    "due";
            }

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "balance-row";

            const initial =
                (
                    user.name ||
                    user.email ||
                    "U"
                )
                    .charAt(0)
                    .toUpperCase();

            row.innerHTML = `

                <div class="balance-user">

                    <div class="balance-avatar">
                        ${escapeHTML(initial)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                user.name ||
                "Unknown"
            )}
                        </strong>

                        <small>
                            ${userMeals} meals
                        </small>

                    </div>

                </div>

                <div class="balance-details">

                    <span>
                        Deposit:
                        <strong>
                            ${money(
                userDeposits
            )}
                        </strong>
                    </span>

                    <span>
                        Meal Cost:
                        <strong>
                            ${money(
                mealCost
            )}
                        </strong>
                    </span>

                    <span
                        class="balance-value ${statusClass}"
                    >
                        ${balance >= 0
                    ? "+"
                    : ""
                }${money(balance)}
                    </span>

                    <span
                        class="balance-status ${statusClass}"
                    >
                        ${status}
                    </span>

                </div>
            `;

            balanceList.appendChild(
                row
            );
        }
    );
}


// ============================================================================
// LOAD DEPOSIT USERS
// ============================================================================

async function loadDepositUsers() {

    if (!depositUser) return;

    try {

        if (!allUsers.length) {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "users"
                    )
                );

            allUsers =
                snapshot.docs.map(
                    snap => ({
                        id: snap.id,
                        ...snap.data()
                    })
                );
        }

        depositUser.innerHTML = `
            <option value="">
                Select Member
            </option>
        `;

        allUsers
            .filter(
                user =>
                    user.role !==
                    "manager"
            )
            .forEach(
                user => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        user.uid;

                    option.textContent =
                        `${user.name || "Unknown"} — ${user.email || ""
                        }`;

                    depositUser.appendChild(
                        option
                    );
                }
            );

    } catch (error) {

        console.error(
            "Deposit users error:",
            error
        );

        showToast(
            "Members load করা যায়নি।",
            "error"
        );
    }
}



// ============================================================================
// 🛒 ADD BAZAR — FIXED
// ============================================================================

async function addBazar() {

    if (currentUserRole !== "manager") {

        showToast(
            "শুধু Manager bazar add করতে পারবেন।",
            "error"
        );

        return;
    }

    const date =
        bazarDate?.value?.trim();

    const amount =
        Number(
            bazarAmount?.value || 0
        );

    const description =
        bazarDescription?.value?.trim() || "";

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    if (!date) {

        showToast(
            "Bazar date দিন।",
            "warning"
        );

        bazarDate?.focus();

        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {

        showToast(
            "Valid bazar amount দিন।",
            "warning"
        );

        bazarAmount?.focus();

        return;
    }

    if (!currentUser?.uid) {

        showToast(
            "User session পাওয়া যায়নি। আবার login করুন।",
            "error"
        );

        return;
    }

    try {

        setButtonLoading(
            addBazarBtn,
            true,
            "Adding..."
        );

        // ------------------------------------------------------------
        // FIRESTORE
        // ------------------------------------------------------------

        const bazarData = {

            date: date,

            amount: amount,

            description: description,

            addedBy: currentUser.uid,

            createdAt: serverTimestamp()
        };

        const docRef =
            await addDoc(
                collection(db, "bazar"),
                bazarData
            );

        console.log(
            "Bazar added successfully:",
            docRef.id
        );

        // ------------------------------------------------------------
        // RESET FORM
        // ------------------------------------------------------------

        if (bazarAmount) {
            bazarAmount.value = "";
        }

        if (bazarDescription) {
            bazarDescription.value = "";
        }

        // Date reset হবে না
        // কারণ একই date-এ আবার bazar add করা লাগতে পারে

        showToast(
            `Bazar ${money(amount)} successfully added. 🛒`,
            "success"
        );

        // ------------------------------------------------------------
        // REFRESH ACCOUNTING
        // ------------------------------------------------------------

        await loadAccounting();

    } catch (error) {

        console.error(
            "❌ Add Bazar Error:",
            error
        );

        let message =
            "Bazar add করা যায়নি।";

        if (
            error?.code ===
            "permission-denied"
        ) {

            message =
                "Firestore permission denied। Firebase Rules check করুন।";

        } else if (
            error?.code ===
            "failed-precondition"
        ) {

            message =
                "Firestore configuration problem হয়েছে।";

        } else if (
            error?.message
        ) {

            console.error(
                "Firestore message:",
                error.message
            );
        }

        showToast(
            message,
            "error"
        );

    } finally {

        setButtonLoading(
            addBazarBtn,
            false
        );
    }
}


// ============================================================================
// BAZAR BUTTON CLICK
// ============================================================================

addBazarBtn?.addEventListener(
    "click",
    async event => {

        // যদি button form-এর ভিতরে থাকে
        event.preventDefault();

        await addBazar();
    }
);


// ============================================================================
// BAZAR FORM SUBMIT SUPPORT
// ============================================================================

const bazarForm =
    bazarFormBox?.closest("form");

bazarForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        await addBazar();
    }
);



// ============================================================================
// 💰 ADD DEPOSIT — FIXED
// ============================================================================

async function addDeposit() {

    if (currentUserRole !== "manager") {

        showToast(
            "শুধু Manager deposit add করতে পারবেন।",
            "error"
        );

        return;
    }

    const userId =
        depositUser?.value?.trim();

    const date =
        depositDate?.value?.trim();

    const amount =
        Number(
            depositAmount?.value || 0
        );

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    if (!userId) {

        showToast(
            "একজন member select করুন।",
            "warning"
        );

        depositUser?.focus();

        return;
    }

    if (!date) {

        showToast(
            "Deposit date দিন।",
            "warning"
        );

        depositDate?.focus();

        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {

        showToast(
            "Valid deposit amount দিন।",
            "warning"
        );

        depositAmount?.focus();

        return;
    }

    if (!currentUser?.uid) {

        showToast(
            "User session পাওয়া যায়নি। আবার login করুন।",
            "error"
        );

        return;
    }

    // ------------------------------------------------------------
    // CHECK MEMBER
    // ------------------------------------------------------------

    const selectedUser =
        allUsers.find(
            user =>
                user.uid === userId
        );

    if (!selectedUser) {

        showToast(
            "Selected member পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    try {

        setButtonLoading(
            addDepositBtn,
            true,
            "Adding..."
        );

        // ------------------------------------------------------------
        // FIRESTORE
        // ------------------------------------------------------------

        const depositData = {

            userId: userId,

            date: date,

            amount: amount,

            addedBy: currentUser.uid,

            createdAt: serverTimestamp()
        };

        const docRef =
            await addDoc(
                collection(db, "deposits"),
                depositData
            );

        console.log(
            "Deposit added successfully:",
            docRef.id
        );

        // ------------------------------------------------------------
        // RESET
        // ------------------------------------------------------------

        if (depositAmount) {
            depositAmount.value = "";
        }

        if (depositUser) {
            depositUser.value = "";
        }

        // Date reset হবে না

        showToast(
            `${money(amount)} deposit successfully added to ${selectedUser.name || "member"}. 💰`,
            "success"
        );

        // ------------------------------------------------------------
        // REFRESH ACCOUNTING
        // ------------------------------------------------------------

        await loadAccounting();

    } catch (error) {

        console.error(
            "❌ Add Deposit Error:",
            error
        );

        let message =
            "Deposit add করা যায়নি।";

        if (
            error?.code ===
            "permission-denied"
        ) {

            message =
                "Firestore permission denied। Firebase Rules check করুন।";

        } else if (
            error?.code ===
            "failed-precondition"
        ) {

            message =
                "Firestore configuration problem হয়েছে।";

        } else if (
            error?.message
        ) {

            console.error(
                "Firestore message:",
                error.message
            );
        }

        showToast(
            message,
            "error"
        );

    } finally {

        setButtonLoading(
            addDepositBtn,
            false
        );
    }
}


// ============================================================================
// DEPOSIT BUTTON CLICK
// ============================================================================

addDepositBtn?.addEventListener(
    "click",
    async event => {

        // যদি button form-এর ভিতরে থাকে
        event.preventDefault();

        await addDeposit();
    }
);


// ============================================================================
// DEPOSIT FORM SUBMIT SUPPORT
// ============================================================================

const depositForm =
    depositFormBox?.closest("form");

depositForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        await addDeposit();
    }
);


// ============================================================================
// DELETE BAZAR / DEPOSIT
// ============================================================================

function attachDeleteEvents() {

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            currentUserRole !==
                            "manager"
                        ) {
                            return;
                        }

                        const type =
                            button.dataset.type;

                        const id =
                            button.dataset.id;

                        const isBazar =
                            type === "bazar";

                        const confirmed =
                            await showConfirmModal(
                                isBazar
                                    ? "Delete Bazar?"
                                    : "Delete Deposit?",

                                isBazar
                                    ? "এই bazar record permanently delete হবে।"
                                    : "এই deposit record permanently delete হবে।",

                                {
                                    icon: "🗑️",
                                    confirmText:
                                        "Delete"
                                }
                            );

                        if (!confirmed) {
                            return;
                        }

                        try {

                            button.disabled =
                                true;

                            await deleteDoc(
                                doc(
                                    db,
                                    isBazar
                                        ? "bazar"
                                        : "deposits",
                                    id
                                )
                            );

                            showToast(
                                isBazar
                                    ? "Bazar deleted successfully."
                                    : "Deposit deleted successfully.",
                                "success"
                            );

                            await loadAccounting();

                        } catch (error) {

                            console.error(
                                "Delete error:",
                                error
                            );

                            button.disabled =
                                false;

                            showToast(
                                "Delete করা যায়নি।",
                                "error"
                            );
                        }
                    }
                );
            }
        );
}


// ============================================================================
// DATE CHANGE
// ============================================================================

mealDate?.addEventListener(
    "change",
    async () => {

        await loadDailyMeals();

    }
);


// ============================================================================
// MONTH CHANGE
// ============================================================================

accountingMonth?.addEventListener(
    "change",
    async () => {

        await loadAccounting();

    }
);


// ============================================================================
// AUTH STATE
// Refresh করলে session থাকবে
// ============================================================================

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            console.log(
                "Authenticated:",
                user.email
            );

            await loadUserDashboard(
                user
            );

        } else {

            currentUser = null;
            currentUserRole = null;

            allUsers = [];
            allMeals = [];
            allBazar = [];
            allDeposits = [];

            dashboard?.classList.add(
                "hidden"
            );

            authContainer?.classList.remove(
                "hidden"
            );

            loginBox?.classList.add(
                "active"
            );

            registerBox?.classList.remove(
                "active"
            );
        }
    }
);


// ============================================================================
// GLOBAL ERROR PROTECTION
// ============================================================================

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled Promise:",
            event.reason
        );

    }
);

window.addEventListener(
    "error",
    event => {

        console.error(
            "Global JavaScript Error:",
            event.error
        );

    }
);


// ============================================================================
// APP READY
// ============================================================================

console.log(
    "🍚 Mess Manager — Premium App initialized."
);