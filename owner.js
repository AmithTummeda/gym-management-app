import { auth, db, attachLogout } from "./app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//attach logout handler
window.addEventListener("DOMContentLoaded", attachLogout);

//redirect non-logged-in users
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  loadReceipts();
  loadAnnouncements();
});

const addReceiptForm = document.getElementById("addReceiptForm");
if (addReceiptForm) {
  addReceiptForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const memberName = document.getElementById("memberName").value.trim();
    const memberId = document.getElementById("memberId").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const month = document.getElementById("month").value.trim();
    const status = document.getElementById("status").value;

    if (!memberName || !memberId || !amount || !month) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "receipts"), {
        memberName,
        memberId,      // should be the member's UID
        amount,
        month,
        status,
        timestamp: serverTimestamp()
      });
      alert("Receipt added successfully!");
      addReceiptForm.reset();
    } catch (err) {
      console.error(err);
      alert("Error adding receipt: " + err.message);
    }
  });
}

function loadReceipts() {
  const list = document.getElementById("receiptsList");
  const q = query(collection(db, "receipts"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((doc) => {
      const r = doc.data();
      const li = document.createElement("li");
      li.textContent = `${r.memberName} — ${r.month} — ₹${r.amount} — ${r.status}`;
      list.appendChild(li);
    });
    if (list.innerHTML === "") list.innerHTML = "<li>No receipts found</li>";
  });
}

const addAnnouncementForm = document.getElementById("addAnnouncementForm");
if (addAnnouncementForm) {
  addAnnouncementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("announcementTitle").value.trim();
    const text = document.getElementById("announcementText").value.trim();

    if (!title || !text) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        title,
        text,
        timestamp: serverTimestamp()
      });
      alert("Announcement added!");
      addAnnouncementForm.reset();
    } catch (err) {
      console.error(err); 
      alert("Error adding announcement: " + err.message);
    }
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