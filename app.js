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

                            <div class="member-role ${
                                isManager
                                    ? "manager-label"
                                    : ""
                            }">

                                ${
                                    isManager
                                        ? "Manager 👑"
                                        : "Member"
                                }

                            </div>

                        </div>

                    </div>


                    ${
                        isManager
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

                roleBadge.textContent =
                    "👑 Manager";

                managerSection.classList.remove(
                    "hidden"
                );


                await loadMembers();

            }

            else {

                roleBadge.textContent =
                    "👤 Member";

                managerSection.classList.add(
                    "hidden"
                );


                // Member can still see member count
                await loadMembers();

            }

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