import { auth, db, attachLogout } from "./app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//attach logout button listener
window.addEventListener("DOMContentLoaded", attachLogout);

//fetch data once user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  loadReceipts(user.uid);
  loadAnnouncements();
});

function loadReceipts(uid) {
  const q = query(collection(db, "receipts"), where("memberId", "==", uid));
  const list = document.getElementById("receiptList");
  const reminderList = document.getElementById("reminderList");

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";
    reminderList.innerHTML = "";

    snapshot.forEach((doc) => {
      const r = doc.data();
      const date = r.timestamp?.toDate().toLocaleDateString() || "";
      const li = document.createElement("li");
      li.textContent = `${r.month} — ₹${r.amount} — ${r.status} (${date})`;
      list.appendChild(li);

      if (r.status.toLowerCase() !== "paid") {
        const rem = document.createElement("li");
        rem.textContent = `Payment pending for ${r.month}`;
        reminderList.appendChild(rem);
      }
    });

    if (list.innerHTML === "") list.innerHTML = "<li>No receipts found</li>";
    if (reminderList.innerHTML === "") reminderList.innerHTML = "<li>No pending payments 🎉</li>";
  });
}

function loadAnnouncements() {
  const list = document.getElementById("announcementList");
  const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((doc) => {
      const a = doc.data();
      const li = document.createElement("li");
      li.textContent = `${a.title}: ${a.text}`;
      list.appendChild(li);
    });
    if (list.innerHTML === "") list.innerHTML = "<li>No announcements yet</li>";
  });
}