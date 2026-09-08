// ========================================
// FIREBASE
// ========================================

import {
    auth,
    db
} from "./firebase.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
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


// ========================================
// ELEMENTS
// ========================================

const authContainer =
    document.getElementById("authContainer");

const loginBox =
    document.getElementById("loginBox");

const registerBox =
    document.getElementById("registerBox");

const dashboard =
    document.getElementById("dashboard");

const managerSection =
    document.getElementById("managerSection");

const membersList =
    document.getElementById("membersList");

const welcomeText =
    document.getElementById("welcomeText");

const roleBadge =
    document.getElementById("roleBadge");

const totalMembers =
    document.getElementById("totalMembers");

const logoutBtn =
    document.getElementById("logoutBtn");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");


// ========================================
// MEAL ELEMENTS
// ========================================

const mealDate =
    document.getElementById("mealDate");

const dailyMealList =
    document.getElementById("dailyMealList");


// ========================================
// CURRENT USER ROLE
// ========================================

let currentUserRole = "member";

// ========================================
// ACCOUNTING ELEMENTS
// ========================================

const accountingMonth =
    document.getElementById("accountingMonth");

const bazarFormBox =
    document.getElementById("bazarFormBox");

const bazarDate =
    document.getElementById("bazarDate");

const bazarAmount =
    document.getElementById("bazarAmount");

const bazarDescription =
    document.getElementById("bazarDescription");

const addBazarBtn =
    document.getElementById("addBazarBtn");

const bazarList =
    document.getElementById("bazarList");


const depositFormBox =
    document.getElementById("depositFormBox");

const depositUser =
    document.getElementById("depositUser");

const depositDate =
    document.getElementById("depositDate");

const depositAmount =
    document.getElementById("depositAmount");

const addDepositBtn =
    document.getElementById("addDepositBtn");

const depositList =
    document.getElementById("depositList");


const balanceList =
    document.getElementById("balanceList");


const monthTotalMeals =
    document.getElementById("monthTotalMeals");

const monthTotalBazar =
    document.getElementById("monthTotalBazar");

const monthMealRate =
    document.getElementById("monthMealRate");

const monthTotalDeposit =
    document.getElementById("monthTotalDeposit");



// ========================================
// DEFAULT ACCOUNTING DATE
// ========================================

function getCurrentMonth() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;

}


function getToday() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


accountingMonth.value =
    getCurrentMonth();


bazarDate.value =
    getToday();


depositDate.value =
    getToday();


// ========================================
// MODAL ELEMENTS
// ========================================

const customModal =
    document.getElementById("customModal");

const modalIcon =
    document.getElementById("modalIcon");

const modalTitle =
    document.getElementById("modalTitle");

const modalMessage =
    document.getElementById("modalMessage");

const modalCancel =
    document.getElementById("modalCancel");

const modalConfirm =
    document.getElementById("modalConfirm");


// ========================================
// CUSTOM CONFIRM MODAL
// ========================================

function showConfirmModal(
    title,
    message
) {

    return new Promise(
        function (resolve) {

            modalTitle.textContent =
                title;

            modalMessage.textContent =
                message;

            modalIcon.textContent =
                "👑";

            customModal.classList.remove(
                "hidden"
            );


            function closeModal(
                result
            ) {

                customModal.classList.add(
                    "hidden"
                );

                modalCancel.removeEventListener(
                    "click",
                    cancelHandler
                );

                modalConfirm.removeEventListener(
                    "click",
                    confirmHandler
                );

                resolve(result);

            }


            function cancelHandler() {

                closeModal(false);

            }


            function confirmHandler() {

                closeModal(true);

            }


            modalCancel.addEventListener(
                "click",
                cancelHandler
            );


            modalConfirm.addEventListener(
                "click",
                confirmHandler
            );

        }
    );

}


// ========================================
// SHOW REGISTER
// ========================================

showRegister.addEventListener(
    "click",
    function () {

        loginBox.classList.add(
            "hidden"
        );

        registerBox.classList.remove(
            "hidden"
        );

    }
);


// ========================================
// SHOW LOGIN
// ========================================

showLogin.addEventListener(
    "click",
    function () {

        registerBox.classList.add(
            "hidden"
        );

        loginBox.classList.remove(
            "hidden"
        );

    }
);


// ========================================
// REGISTER
// ========================================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "registerName"
            ).value.trim();


        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "registerPassword"
            ).value;


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            // ========================================
            // CREATE MEMBER PROFILE
            // ========================================

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    uid: user.uid,

                    name: name,

                    email: email,

                    role: "member",

                    createdAt:
                        serverTimestamp()

                }
            );


            alert(
                "Account created successfully!"
            );


            await signOut(auth);


            registerForm.reset();


            registerBox.classList.add(
                "hidden"
            );

            loginBox.classList.remove(
                "hidden"
            );

        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ========================================
// LOAD MEMBERS
// ========================================

async function loadMembers() {

    membersList.innerHTML =
        `
        <p>
            Loading members...
        </p>
        `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        let memberCount = 0;


        membersList.innerHTML =
            "";


        snapshot.forEach(
            function (userDoc) {

                const user =
                    userDoc.data();


                memberCount++;


                // ========================================
                // MEMBER CARD
                // ========================================

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "member-card";


                const isManager =
                    user.role === "manager";


                card.innerHTML = `

                    <div class="member-info">

                        <div class="member-avatar">
                            ${isManager ? "👑" : "👤"}
                        </div>


                        <div>

                            <div class="member-name">
                                ${user.name || "Unknown"}
                            </div>

                            <div class="member-email">
                                ${user.email || ""}
                            </div>

                            <div class="member-role ${isManager
                        ? "manager-label"
                        : ""
                    }">

                                ${isManager
                        ? "Manager 👑"
                        : "Member"
                    }

                            </div>

                        </div>

                    </div>


                    ${isManager
                        ? `
                                <span class="manager-label">
                                    Current Manager
                                </span>
                              `
                        : `
                                <button
                                    class="make-manager-btn"
                                    data-user-id="${user.uid}"
                                >
                                    👑 Make Manager
                                </button>
                              `
                    }

                `;


                membersList.appendChild(
                    card
                );

            }
        );


        totalMembers.textContent =
            memberCount;


        // ========================================
        // BUTTON EVENTS
        // ========================================

        const buttons =
            document.querySelectorAll(
                ".make-manager-btn"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const targetId =
                            button.dataset.userId;


                        await transferManager(
                            targetId
                        );

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Member loading error:",
            error
        );


        membersList.innerHTML =
            `
            <p>
                Unable to load members.
            </p>
            `;

    }

}


// ========================================
// MANAGER TRANSFER
// ========================================

async function transferManager(
    newManagerId
) {

    const confirmed =
        await showConfirmModal(
            "Transfer Manager?",
            "This member will become the new Manager and you will become a Member."
        );


    if (!confirmed) {

        return;

    }


    try {

        const currentUser =
            auth.currentUser;


        if (!currentUser) {

            throw new Error(
                "You are not logged in."
            );

        }


        const currentManagerRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const newManagerRef =
            doc(
                db,
                "users",
                newManagerId
            );


        // ========================================
        // ATOMIC TRANSACTION
        // ========================================

        await runTransaction(
            db,
            async function (transaction) {

                const currentManagerSnapshot =
                    await transaction.get(
                        currentManagerRef
                    );


                const newManagerSnapshot =
                    await transaction.get(
                        newManagerRef
                    );


                if (
                    !currentManagerSnapshot.exists()
                ) {

                    throw new Error(
                        "Current Manager profile not found."
                    );

                }


                if (
                    !newManagerSnapshot.exists()
                ) {

                    throw new Error(
                        "Selected member not found."
                    );

                }


                const currentManager =
                    currentManagerSnapshot.data();


                const newManager =
                    newManagerSnapshot.data();


                // ========================================
                // VERIFY CURRENT MANAGER
                // ========================================

                if (
                    currentManager.role !==
                    "manager"
                ) {

                    throw new Error(
                        "Only the current Manager can transfer the role."
                    );

                }


                // ========================================
                // VERIFY TARGET MEMBER
                // ========================================

                if (
                    newManager.role !==
                    "member"
                ) {

                    throw new Error(
                        "Selected user is not a Member."
                    );

                }


                // ========================================
                // OLD MANAGER → MEMBER
                // ========================================

                transaction.update(
                    currentManagerRef,
                    {
                        role: "member"
                    }
                );


                // ========================================
                // NEW MANAGER → MANAGER
                // ========================================

                transaction.update(
                    newManagerRef,
                    {
                        role: "manager"
                    }
                );

            }
        );


        // ========================================
        // SUCCESS
        // ========================================

        alert(
            "Manager transferred successfully! 👑"
        );


        // Logout old manager
        await signOut(auth);


        location.reload();

    }

    catch (error) {

        console.error(
            "Manager transfer error:",
            error
        );


        alert(
            error.message
        );

    }

}




// ========================================
// DAILY MEAL SYSTEM
// ========================================


// ========================================
// GET TODAY DATE
// ========================================

function getTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// ========================================
// SET DEFAULT DATE
// ========================================

mealDate.value =
    getTodayDate();


// ========================================
// MEAL DOCUMENT ID
// ========================================

function getMealDocId(
    date,
    userId
) {

    return `${date}_${userId}`;

}


// ========================================
// LOAD DAILY MEALS
// ========================================

async function loadDailyMeals() {

    const selectedDate =
        mealDate.value;


    if (!selectedDate) {

        return;

    }


    dailyMealList.innerHTML = `
    
        <p class="meal-loading">
            Loading meals...
        </p>
    
    `;


    try {

        // ========================================
        // GET ALL USERS
        // ========================================

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        dailyMealList.innerHTML =
            "";


        let totalDailyMeals = 0;


        // ========================================
        // LOOP USERS
        // ========================================

        for (
            const userDoc
            of usersSnapshot.docs
        ) {

            const user =
                userDoc.data();


            const userId =
                user.uid;


            // ========================================
            // MEAL DOCUMENT
            // ========================================

            const mealRef =
                doc(
                    db,
                    "meals",
                    getMealDocId(
                        selectedDate,
                        userId
                    )
                );


            const mealSnapshot =
                await getDoc(
                    mealRef
                );


            let mealCount = 0;


            if (
                mealSnapshot.exists()
            ) {

                const mealData =
                    mealSnapshot.data();


                mealCount =
                    Number(
                        mealData.meal || 0
                    );

            }


            totalDailyMeals +=
                mealCount;


            // ========================================
            // CREATE CARD
            // ========================================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "daily-meal-card";


            const avatar =
                user.role === "manager"
                    ? "👑"
                    : "👤";


            // ========================================
            // MANAGER CONTROLS
            // ========================================

            let controls = "";


            if (
                currentUserRole ===
                "manager"
            ) {

                controls = `

                    <div class="meal-controls">

                        <button
                            class="meal-minus"
                            data-user-id="${userId}"
                        >
                            −
                        </button>


                        <strong
                            class="meal-count"
                            id="meal-${userId}"
                        >
                            ${mealCount}
                        </strong>


                        <button
                            class="meal-plus"
                            data-user-id="${userId}"
                        >
                            +
                        </button>

                    </div>

                `;

            }

            else {

                controls = `

                    <div class="member-meal-count">

                        🍚
                        
                        <strong>
                            ${mealCount}
                        </strong>

                        <span>
                            meals
                        </span>

                    </div>

                `;

            }


            card.innerHTML = `

                <div class="daily-meal-info">

                    <div class="daily-meal-avatar">
                        ${avatar}
                    </div>


                    <div>

                        <div class="daily-meal-name">
                            ${user.name || "Unknown"}
                        </div>

                        <div class="daily-meal-email">
                            ${user.email || ""}
                        </div>

                    </div>

                </div>


                ${controls}

            `;


            dailyMealList.appendChild(
                card
            );

        }


        // ========================================
        // UPDATE TOTAL MEALS
        // ========================================

        totalMeals.textContent =
            totalDailyMeals;


        // ========================================
        // BUTTON EVENTS
        // ========================================

        if (
            currentUserRole ===
            "manager"
        ) {

            const plusButtons =
                document.querySelectorAll(
                    ".meal-plus"
                );


            const minusButtons =
                document.querySelectorAll(
                    ".meal-minus"
                );


            plusButtons.forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            const userId =
                                button.dataset.userId;


                            await changeMeal(
                                userId,
                                1
                            );

                        }
                    );

                }
            );


            minusButtons.forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            const userId =
                                button.dataset.userId;


                            await changeMeal(
                                userId,
                                -1
                            );

                        }
                    );

                }
            );

        }

    }

    catch (error) {

        console.error(
            "Daily meal loading error:",
            error
        );


        dailyMealList.innerHTML = `

            <p class="meal-error">
                Unable to load meals.
            </p>

        `;

    }

}


// ========================================
// CHANGE MEAL
// ========================================

async function changeMeal(
    userId,
    amount
) {

    // ========================================
    // MANAGER CHECK
    // ========================================

    if (
        currentUserRole !==
        "manager"
    ) {

        return;

    }


    const selectedDate =
        mealDate.value;


    if (!selectedDate) {

        return;

    }


    try {

        const mealRef =
            doc(
                db,
                "meals",
                getMealDocId(
                    selectedDate,
                    userId
                )
            );


        const mealSnapshot =
            await getDoc(
                mealRef
            );


        let currentMeal = 0;


        if (
            mealSnapshot.exists()
        ) {

            const data =
                mealSnapshot.data();


            currentMeal =
                Number(
                    data.meal || 0
                );

        }


        // ========================================
        // NEW MEAL COUNT
        // ========================================

        let newMeal =
            currentMeal + amount;


        // Never below 0

        if (
            newMeal < 0
        ) {

            newMeal = 0;

        }


        // ========================================
        // SAVE FIRESTORE
        // ========================================

        await setDoc(
            mealRef,
            {

                userId:
                    userId,

                date:
                    selectedDate,

                meal:
                    newMeal,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        // ========================================
        // RELOAD MEALS
        // ========================================

        await loadDailyMeals();

    }

    catch (error) {

        console.error(
            "Meal update error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ========================================
// DATE CHANGE
// ========================================

mealDate.addEventListener(
    "change",
    async function () {

        await loadDailyMeals();

    }
);


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            // ========================================
            // GET USER PROFILE
            // ========================================

            const userSnapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (
                !userSnapshot.exists()
            ) {

                await signOut(auth);

                throw new Error(
                    "User profile not found."
                );

            }


            const userData =
                userSnapshot.data();


            currentUserRole =
                userData.role || "member";


            // ========================================
            // SHOW DASHBOARD
            // ========================================

            authContainer.classList.add(
                "hidden"
            );

            dashboard.classList.remove(
                "hidden"
            );


            welcomeText.textContent =
                `Welcome, ${userData.name}`;


            // ========================================
            // ROLE
            // ========================================

            if (
                userData.role === "manager"
            ) {

                currentUserRole = "manager";

                roleBadge.textContent =
                    "👑 Manager";

                managerSection.classList.remove(
                    "hidden"
                );

                bazarFormBox.classList.remove(
                    "hidden"
                );

                depositFormBox.classList.remove(
                    "hidden"
                );

                await loadMembers();

            }

            else {

                currentUserRole = "member";

                roleBadge.textContent =
                    "👤 Member";

                managerSection.classList.add(
                    "hidden"
                );

                bazarFormBox.classList.add(
                    "hidden"
                );

                depositFormBox.classList.add(
                    "hidden"
                );

                await loadMembers();

            }
            await loadDailyMeals();
            await loadDepositUsers();
            await loadAccounting();
            

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);


            dashboard.classList.add(
                "hidden"
            );


            authContainer.classList.remove(
                "hidden"
            );


            loginForm.reset();

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// ========================================
// MONTHLY ACCOUNTING SYSTEM
// ========================================


// ========================================
// FORMAT MONEY
// ========================================

function money(amount) {

    return `৳${Number(amount || 0).toFixed(2)}`;

}


// ========================================
// CHECK MONTH
// ========================================

function isInSelectedMonth(date) {

    return date &&
        date.startsWith(
            accountingMonth.value
        );

}


// ========================================
// LOAD ACCOUNTING
// ========================================

async function loadAccounting() {

    if (!accountingMonth.value) {
        return;
    }


    bazarList.innerHTML = `
        <p class="account-loading">
            Loading bazar...
        </p>
    `;


    depositList.innerHTML = `
        <p class="account-loading">
            Loading deposits...
        </p>
    `;


    balanceList.innerHTML = `
        <p class="account-loading">
            Calculating...
        </p>
    `;


    try {

        // ========================================
        // USERS
        // ========================================

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        const users = [];


        usersSnapshot.forEach(
            function (userDoc) {

                users.push(
                    userDoc.data()
                );

            }
        );


        // ========================================
        // BAZAR
        // ========================================

        const bazarSnapshot =
            await getDocs(
                collection(
                    db,
                    "bazar"
                )
            );


        const bazars = [];


        bazarSnapshot.forEach(
            function (bazarDoc) {

                const data =
                    bazarDoc.data();


                if (
                    isInSelectedMonth(
                        data.date
                    )
                ) {

                    bazars.push({

                        id:
                            bazarDoc.id,

                        ...data

                    });

                }

            }
        );


        // ========================================
        // DEPOSITS
        // ========================================

        const depositSnapshot =
            await getDocs(
                collection(
                    db,
                    "deposits"
                )
            );


        const deposits = [];


        depositSnapshot.forEach(
            function (depositDoc) {

                const data =
                    depositDoc.data();


                if (
                    isInSelectedMonth(
                        data.date
                    )
                ) {

                    deposits.push({

                        id:
                            depositDoc.id,

                        ...data

                    });

                }

            }
        );


        // ========================================
        // MEALS
        // ========================================

        const mealSnapshot =
            await getDocs(
                collection(
                    db,
                    "meals"
                )
            );


        const meals = [];


        mealSnapshot.forEach(
            function (mealDoc) {

                const data =
                    mealDoc.data();


                if (
                    isInSelectedMonth(
                        data.date
                    )
                ) {

                    meals.push(
                        data
                    );

                }

            }
        );


        // ========================================
        // TOTAL MEALS
        // ========================================

        let totalMealsValue = 0;


        meals.forEach(
            function (meal) {

                totalMealsValue +=
                    Number(
                        meal.meal || 0
                    );

            }
        );


        // ========================================
        // TOTAL BAZAR
        // ========================================

        let totalBazarValue = 0;


        bazars.forEach(
            function (bazar) {

                totalBazarValue +=
                    Number(
                        bazar.amount || 0
                    );

            }
        );


        // ========================================
        // TOTAL DEPOSIT
        // ========================================

        let totalDepositValue = 0;


        deposits.forEach(
            function (deposit) {

                totalDepositValue +=
                    Number(
                        deposit.amount || 0
                    );

            }
        );


        // ========================================
        // MEAL RATE
        // ========================================

        let rate = 0;


        if (
            totalMealsValue > 0
        ) {

            rate =
                totalBazarValue /
                totalMealsValue;

        }


        // ========================================
        // UPDATE SUMMARY
        // ========================================

        monthTotalMeals.textContent =
            totalMealsValue;


        monthTotalBazar.textContent =
            money(
                totalBazarValue
            );


        monthMealRate.textContent =
            money(
                rate
            );


        monthTotalDeposit.textContent =
            money(
                totalDepositValue
            );


        // ========================================
        // RENDER BAZAR
        // ========================================

        renderBazar(
            bazars
        );


        // ========================================
        // RENDER DEPOSITS
        // ========================================

        renderDeposits(
            deposits,
            users
        );


        // ========================================
        // RENDER BALANCE
        // ========================================

        renderBalances(
            users,
            meals,
            deposits,
            rate
        );

    }

    catch (error) {

        console.error(
            "Accounting loading error:",
            error
        );


        bazarList.innerHTML = `
            <p class="account-error">
                Unable to load bazar.
            </p>
        `;


        depositList.innerHTML = `
            <p class="account-error">
                Unable to load deposits.
            </p>
        `;


        balanceList.innerHTML = `
            <p class="account-error">
                Unable to calculate balance.
            </p>
        `;

    }

}


// ========================================
// RENDER BAZAR
// ========================================

function renderBazar(
    bazars
) {

    bazarList.innerHTML =
        "";


    if (
        bazars.length === 0
    ) {

        bazarList.innerHTML = `
            <p class="empty-account">
                No bazar records this month.
            </p>
        `;

        return;

    }


    bazars.sort(
        function (a, b) {

            return b.date.localeCompare(
                a.date
            );

        }
    );


    bazars.forEach(
        function (bazar) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "account-record";


            card.innerHTML = `

                <div>

                    <strong>
                        ${bazar.description || "Bazar"}
                    </strong>

                    <small>
                        📅 ${bazar.date}
                    </small>

                </div>


                <div class="record-right">

                    <strong>
                        ${money(bazar.amount)}
                    </strong>

                    ${currentUserRole === "manager"
                    ? `
                                <button
                                    class="delete-record-btn"
                                    data-id="${bazar.id}"
                                    data-type="bazar"
                                >
                                    🗑️
                                </button>
                              `
                    : ""
                }

                </div>

            `;


            bazarList.appendChild(
                card
            );

        }
    );


    attachDeleteEvents();

}


// ========================================
// RENDER DEPOSITS
// ========================================

function renderDeposits(
    deposits,
    users
) {

    depositList.innerHTML =
        "";


    if (
        deposits.length === 0
    ) {

        depositList.innerHTML = `
            <p class="empty-account">
                No deposit records this month.
            </p>
        `;

        return;

    }


    deposits.sort(
        function (a, b) {

            return b.date.localeCompare(
                a.date
            );

        }
    );


    deposits.forEach(
        function (deposit) {

            const user =
                users.find(
                    function (item) {

                        return item.uid ===
                            deposit.userId;

                    }
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "account-record";


            card.innerHTML = `

                <div>

                    <strong>
                        ${user?.name || "Unknown"}
                    </strong>

                    <small>
                        📅 ${deposit.date}
                    </small>

                </div>


                <div class="record-right">

                    <strong>
                        ${money(deposit.amount)}
                    </strong>

                    ${currentUserRole === "manager"
                    ? `
                                <button
                                    class="delete-record-btn"
                                    data-id="${deposit.id}"
                                    data-type="deposit"
                                >
                                    🗑️
                                </button>
                              `
                    : ""
                }

                </div>

            `;


            depositList.appendChild(
                card
            );

        }
    );


    attachDeleteEvents();

}


// ========================================
// RENDER BALANCES
// ========================================

function renderBalances(
    users,
    meals,
    deposits,
    rate
) {

    balanceList.innerHTML =
        "";


    users.forEach(
        function (user) {

            // ========================================
            // USER MEALS
            // ========================================

            let userMeals = 0;


            meals.forEach(
                function (meal) {

                    if (
                        meal.userId ===
                        user.uid
                    ) {

                        userMeals +=
                            Number(
                                meal.meal || 0
                            );

                    }

                }
            );


            // ========================================
            // USER DEPOSIT
            // ========================================

            let userDeposit = 0;


            deposits.forEach(
                function (deposit) {

                    if (
                        deposit.userId ===
                        user.uid
                    ) {

                        userDeposit +=
                            Number(
                                deposit.amount || 0
                            );

                    }

                }
            );


            // ========================================
            // MEAL COST
            // ========================================

            const mealCost =
                userMeals * rate;


            // ========================================
            // BALANCE
            // ========================================

            const balance =
                userDeposit -
                mealCost;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "balance-card";


            let statusText = "";


            if (
                balance > 0
            ) {

                statusText =
                    "💚 Advance";

            }

            else if (
                balance < 0
            ) {

                statusText =
                    "🔴 Due";

            }

            else {

                statusText =
                    "⚪ Clear";

            }


            card.innerHTML = `

                <div class="balance-user">

                    <div class="balance-avatar">
                        ${user.role === "manager"
                    ? "👑"
                    : "👤"
                }
                    </div>

                    <div>

                        <strong>
                            ${user.name || "Unknown"}
                        </strong>

                        <small>
                            🍚 ${userMeals} meals
                        </small>

                    </div>

                </div>


                <div class="balance-details">

                    <div>
                        <small>Deposit</small>
                        <strong>
                            ${money(userDeposit)}
                        </strong>
                    </div>


                    <div>
                        <small>Meal Cost</small>
                        <strong>
                            ${money(mealCost)}
                        </strong>
                    </div>


                    <div class="balance-final">

                        <small>
                            ${statusText}
                        </small>

                        <strong>
                            ${money(Math.abs(balance))}
                        </strong>

                    </div>

                </div>

            `;


            balanceList.appendChild(
                card
            );

        }
    );

}


// ========================================
// ADD BAZAR
// ========================================

addBazarBtn.addEventListener(
    "click",
    async function () {

        if (
            currentUserRole !==
            "manager"
        ) {

            return;

        }


        const date =
            bazarDate.value;


        const amount =
            Number(
                bazarAmount.value
            );


        const description =
            bazarDescription.value.trim();


        if (
            !date ||
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please enter valid bazar information."
            );

            return;

        }


        try {

            await addDoc(
                collection(
                    db,
                    "bazar"
                ),
                {

                    date:
                        date,

                    amount:
                        amount,

                    description:
                        description,

                    addedBy:
                        auth.currentUser.uid,

                    createdAt:
                        serverTimestamp()

                }
            );


            bazarAmount.value =
                "";

            bazarDescription.value =
                "";


            await loadAccounting();

        }

        catch (error) {

            console.error(
                "Add bazar error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ========================================
// LOAD DEPOSIT MEMBERS
// ========================================

async function loadDepositUsers() {

    depositUser.innerHTML = `
        <option value="">
            Select Member
        </option>
    `;


    const snapshot =
        await getDocs(
            collection(
                db,
                "users"
            )
        );


    snapshot.forEach(
        function (userDoc) {

            const user =
                userDoc.data();


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                user.uid;


            option.textContent =
                `${user.name || "Unknown"} (${user.role})`;


            depositUser.appendChild(
                option
            );

        }
    );

}


// ========================================
// ADD DEPOSIT
// ========================================

addDepositBtn.addEventListener(
    "click",
    async function () {

        if (
            currentUserRole !==
            "manager"
        ) {

            return;

        }


        const userId =
            depositUser.value;


        const date =
            depositDate.value;


        const amount =
            Number(
                depositAmount.value
            );


        if (
            !userId ||
            !date ||
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please select member and enter valid amount."
            );

            return;

        }


        try {

            await addDoc(
                collection(
                    db,
                    "deposits"
                ),
                {

                    userId:
                        userId,

                    date:
                        date,

                    amount:
                        amount,

                    addedBy:
                        auth.currentUser.uid,

                    createdAt:
                        serverTimestamp()

                }
            );


            depositUser.value =
                "";

            depositAmount.value =
                "";


            await loadAccounting();

        }

        catch (error) {

            console.error(
                "Add deposit error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ========================================
// DELETE RECORD
// ========================================

function attachDeleteEvents() {

    const buttons =
        document.querySelectorAll(
            ".delete-record-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const confirmed =
                        await showConfirmModal(
                            "Delete Record?",
                            "This record will be permanently deleted."
                        );


                    if (
                        !confirmed
                    ) {

                        return;

                    }


                    try {

                        const type =
                            button.dataset.type;


                        const id =
                            button.dataset.id;


                        await deleteDoc(
                            doc(
                                db,
                                type === "bazar"
                                    ? "bazar"
                                    : "deposits",
                                id
                            )
                        );


                        await loadAccounting();

                    }

                    catch (error) {

                        console.error(
                            "Delete record error:",
                            error
                        );


                        alert(
                            error.message
                        );

                    }

                }
            );

        }
    );

}


// ========================================
// MONTH CHANGE
// ========================================

accountingMonth.addEventListener(
    "change",
    async function () {

        await loadAccounting();

    }
);