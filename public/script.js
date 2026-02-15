document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("studentForm");
    const list = document.getElementById("studentList");
    const searchInput = document.getElementById("searchInput");
    const alertBox = document.getElementById("alertBox");

    let editId = null;
    let deleteId = null;
    let studentsData = [];

    function showAlert(message) {
        alertBox.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const student = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            age: document.getElementById("age").value.trim(),
            course: document.getElementById("course").value.trim()
        };

        if (editId) {
            await fetch(`/students/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            editId = null;
            showAlert("Student Updated Successfully!");
        } else {
            await fetch("/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
            showAlert("Student Added Successfully!");
        }

        form.reset();
        loadStudents();
    });

    async function loadStudents() {
        try {
            const res = await fetch("/students");
            studentsData = await res.json();
            displayStudents(studentsData);
            updateStats();
        } catch (err) {
            console.error("Load error:", err);
        }
    }

    function displayStudents(data) {
        list.innerHTML = "";

        data.forEach(s => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${s.name || ""}</td>
                <td>${s.email || ""}</td>
                <td>${s.age || ""}</td>
                <td>${s.course || ""}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2">Edit</button>
                    <button class="btn btn-danger btn-sm">Delete</button>
                </td>
            `;

            row.querySelector(".btn-warning").addEventListener("click", () => {
                document.getElementById("name").value = s.name || "";
                document.getElementById("email").value = s.email || "";
                document.getElementById("age").value = s.age || "";
                document.getElementById("course").value = s.course || "";
                editId = s._id;
            });

            row.querySelector(".btn-danger").addEventListener("click", () => {
                deleteId = s._id;
                const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
                modal.show();
            });

            list.appendChild(row);
        });
    }

    function updateStats() {
        document.getElementById("totalStudents").innerText = studentsData.length;

        const courses = [...new Set(studentsData.map(s => s.course))];
        document.getElementById("totalCourses").innerText = courses.length;
    }

    document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
        if (!deleteId) return;

        await fetch(`/students/${deleteId}`, { method: "DELETE" });
        deleteId = null;

        const modalEl = document.getElementById("deleteModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        showAlert("Student Deleted Successfully!");
        loadStudents();
    });

    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();
        const filtered = studentsData.filter(s =>
            s.name.toLowerCase().includes(value) ||
            s.email.toLowerCase().includes(value) ||
            s.course.toLowerCase().includes(value)
        );
        displayStudents(filtered);
    });

    loadStudents();
});
