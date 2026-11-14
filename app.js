const views = {
  demographics: {
    caption: "Headcount by department", legend: "Current headcount",
    values: [["Academic staff", 286], ["Administrative staff", 140], ["Technical staff", 76], ["Support staff", 117], ["Management", 68], ["Medical staff", 158]], color: "lime"
  },
  hires: {
    caption: "New hires by department", legend: "Hires this month",
    values: [["Academic staff", 32], ["Administrative staff", 16], ["Technical staff", 9], ["Support staff", 13], ["Management", 8], ["Medical staff", 18]], color: "blue"
  },
  positions: {
    caption: "Open positions by department", legend: "Positions still open",
    values: [["Academic staff", 14], ["Administrative staff", 7], ["Technical staff", 4], ["Support staff", 5], ["Management", 4], ["Medical staff", 8]], color: "orange"
  },
  terminations: {
    caption: "Terminations by department", legend: "Departures this month",
    values: [["Academic staff", 6], ["Administrative staff", 3], ["Technical staff", 2], ["Support staff", 3], ["Management", 1], ["Medical staff", 3]], color: "pink"
  }
};

const chart = document.querySelector("#bar-chart");
const caption = document.querySelector("#chart-caption");
const legend = document.querySelector(".chart-legend");
const tabs = document.querySelectorAll(".tab");
const modal = document.querySelector("#detail-modal");
const toast = document.querySelector("#toast");
let toastTimer;

const dashboardSearch = document.querySelector("#dashboard-search");
const searchInput = document.querySelector("#dashboard-search-input");
const searchTargets = [...document.querySelectorAll("[data-nav], [data-card-view], [data-quick-view]")];
const profileToggle = document.querySelector("#profile-toggle");
const profileMenu = document.querySelector("#profile-menu");
const profilePictureInput = document.querySelector("#profile-picture-input");
const avatarElements = [document.querySelector("#admin-avatar"), document.querySelector("#admin-menu-avatar")];
const employeeRows = [...document.querySelectorAll("#employee-rows tr")];
const employeeSearch = document.querySelector("#employee-search");
const employeeDepartment = document.querySelector("#employee-department");
const employeeStatus = document.querySelector("#employee-status");
const employeeSort = document.querySelector("#employee-sort");
const employeePagination = document.querySelector(".employee-table-footer");
const employeePageSize = 5;
let employeeTotal = 845;
let employeePage = 1;

const payrollRecords = [
  { id: "PAY-001", name: "James Okello", department: "Finance", period: "June 2026", amount: 3250000, deductions: 420000, status: "Paid" },
  { id: "PAY-002", name: "Sarah Namutebi", department: "Human Resources", period: "June 2026", amount: 2890000, deductions: 365000, status: "Paid" },
  { id: "PAY-003", name: "David Mugisha", department: "ICT", period: "June 2026", amount: 3100000, deductions: 405000, status: "Paid" },
  { id: "PAY-004", name: "Mary Akello", department: "Administration", period: "June 2026", amount: 2750000, deductions: 340000, status: "Pending" },
  { id: "PAY-005", name: "Peter Kato", department: "Engineering", period: "June 2026", amount: 3200000, deductions: 398000, status: "Paid" },
  { id: "PAY-006", name: "James Okello", department: "Finance", period: "May 2026", amount: 3180000, deductions: 410000, status: "Paid" },
  { id: "PAY-007", name: "Sarah Namutebi", department: "Human Resources", period: "May 2026", amount: 2810000, deductions: 352000, status: "Paid" },
  { id: "PAY-008", name: "David Mugisha", department: "ICT", period: "May 2026", amount: 3020000, deductions: 391000, status: "Paid" },
  { id: "PAY-009", name: "Mary Akello", department: "Administration", period: "May 2026", amount: 2690000, deductions: 331000, status: "Paid" },
  { id: "PAY-010", name: "Peter Kato", department: "Engineering", period: "May 2026", amount: 3120000, deductions: 386000, status: "Paid" },
  { id: "PAY-011", name: "James Okello", department: "Finance", period: "April 2026", amount: 3050000, deductions: 398000, status: "Paid" },
  { id: "PAY-012", name: "Sarah Namutebi", department: "Human Resources", period: "April 2026", amount: 2740000, deductions: 344000, status: "Paid" },
  { id: "PAY-013", name: "David Mugisha", department: "ICT", period: "April 2026", amount: 2950000, deductions: 382000, status: "Pending" },
  { id: "PAY-014", name: "Mary Akello", department: "Administration", period: "April 2026", amount: 2610000, deductions: 322000, status: "Paid" },
  { id: "PAY-015", name: "Peter Kato", department: "Engineering", period: "April 2026", amount: 3040000, deductions: 375000, status: "Paid" }
];

function getFilteredPayrollRecords() {
  const month = document.querySelector("#payroll-month")?.value;
  const department = document.querySelector("#payroll-department")?.value;
  return payrollRecords.filter((record) => record.period === month && (department === "All departments" || record.department === department));
}

function formatPayrollAmount(amount) {
  return `UGX ${amount.toLocaleString("en-US")}`;
}

function renderPayrollTable(records = getFilteredPayrollRecords()) {
  const tbody = document.querySelector(".payroll-table-panel tbody");
  if (!tbody) return;
  tbody.innerHTML = records.length ? records.map((record) => `
    <tr data-payroll-id="${record.id}">
      <td>${record.id}</td><td>${record.name}</td><td>${record.department}</td>
      <td>${formatPayrollAmount(record.amount + record.deductions)}</td><td>${formatPayrollAmount(record.deductions)}</td>
      <td>${formatPayrollAmount(record.amount)}</td><td class="${record.status === "Paid" ? "paid" : "pending"}">${record.status}</td>
      <td><button class="row-action" data-payroll-action="view" data-payroll-name="${record.name}" type="button">View</button></td>
    </tr>`).join("") : '<tr><td colspan="8" class="payroll-empty">No payroll records match the selected filters.</td></tr>';
}

function updatePayrollMetrics(records = getFilteredPayrollRecords()) {
  const values = document.querySelectorAll(".payroll-kpis article strong");
  if (values.length < 6) return;
  const gross = records.reduce((sum, record) => sum + record.amount + record.deductions, 0);
  const deductions = records.reduce((sum, record) => sum + record.deductions, 0);
  const net = records.reduce((sum, record) => sum + record.amount, 0);
  const paid = records.filter((record) => record.status === "Paid").length;
  values[0].textContent = document.querySelector("#payroll-department").value === "All departments" ? "845" : String(records.length);
  values[1].textContent = formatPayrollAmount(gross);
  values[2].textContent = formatPayrollAmount(deductions);
  values[3].textContent = formatPayrollAmount(net);
  values[4].textContent = formatPayrollAmount(records.length ? Math.round(net / records.length) : 0);
  values[5].textContent = records.length ? `${Math.round((paid / records.length) * 100)}%` : "0%";
}

function refreshPayrollView() {
  const records = getFilteredPayrollRecords();
  renderPayrollTable(records);
  updatePayrollMetrics(records);
  showToast(`Payroll view updated for ${document.querySelector("#payroll-month").value} · ${document.querySelector("#payroll-department").value}`);
}

const attendanceRecords = [
  { id: "E001", name: "Rakesh Kumar", department: "Technical staff", location: "Head Office", status: "Present", present: 22, absent: 1, leave: 0, overtime: 12 },
  { id: "E002", name: "Priya Sharma", department: "Administrative staff", location: "Branch A", status: "Present", present: 21, absent: 2, leave: 1, overtime: 14 },
  { id: "E003", name: "Amit Verma", department: "Support staff", location: "Head Office", status: "Leave", present: 18, absent: 0, leave: 4, overtime: 10 },
  { id: "E004", name: "Neha Gupta", department: "Administrative staff", location: "Branch B", status: "Present", present: 22, absent: 1, leave: 1, overtime: 16 },
  { id: "E005", name: "Sandeep Yadav", department: "Management", location: "Head Office", status: "Absent", present: 20, absent: 3, leave: 2, overtime: 8 }
];

function getFilteredAttendanceRecords() {
  const department = document.querySelector("#attendance-department")?.value;
  const location = document.querySelector("#attendance-location")?.value;
  const status = document.querySelector("#attendance-status")?.value;
  return attendanceRecords.filter((record) =>
    (department === "All departments" || record.department === department) &&
    (location === "All locations" || record.location === location) &&
    (status === "All statuses" || record.status === status)
  );
}

function renderAttendanceTable(records = getFilteredAttendanceRecords()) {
  const tbody = document.querySelector(".attendance-data-panel tbody");
  if (!tbody) return;
  tbody.innerHTML = records.length ? records.map((record) => `
    <tr><td>${record.id}</td><td>${record.name}</td><td>${record.department}</td><td>${record.location}</td>
      <td class="status-${record.status.toLowerCase()}">${record.status}</td><td>${record.present}</td><td>${record.absent}</td><td>${record.leave}</td><td>${record.overtime}</td></tr>`).join("")
    : '<tr><td colspan="9" class="attendance-empty">No attendance records match the selected filters.</td></tr>';
}

function refreshAttendanceView() {
  const records = getFilteredAttendanceRecords();
  renderAttendanceTable(records);
  const filtered = document.querySelector("#attendance-department").value !== "All departments" ||
    document.querySelector("#attendance-location").value !== "All locations" ||
    document.querySelector("#attendance-status").value !== "All statuses";
  const total = filtered ? records.length : 248;
  const present = filtered ? records.filter((record) => record.status === "Present").length : 201;
  const absent = filtered ? records.filter((record) => record.status === "Absent").length : 14;
  const leave = filtered ? records.filter((record) => record.status === "Leave").length : 22;
  const overtime = filtered ? records.reduce((sum, record) => sum + record.overtime, 0) : 186;
  const kpis = document.querySelectorAll(".attendance-kpi strong");
  [total, present, absent, leave, overtime].forEach((value, index) => {
    if (kpis[index]) kpis[index].textContent = String(value);
  });
  showToast(`Attendance view updated for ${document.querySelector("#attendance-range").value}`);
}

function exportAttendance() {
  const rows = [["Employee ID", "Name", "Department", "Location", "Status", "Present days", "Absent days", "Leave days", "Overtime hours"]];
  getFilteredAttendanceRecords().forEach((record) => rows.push([record.id, record.name, record.department, record.location, record.status, record.present, record.absent, record.leave, record.overtime]));
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `kiu-attendance-${document.querySelector("#attendance-range").value.replace(/\s+/g, "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Attendance data exported as CSV");
}

function setProfilePicture(source) {
  avatarElements.forEach((avatar) => {
    avatar.querySelector("img").src = source;
    avatar.classList.add("has-image");
  });

}

const savedProfilePicture = localStorage.getItem("kiu-admin-profile-picture");
if (savedProfilePicture) setProfilePicture(savedProfilePicture);

document.addEventListener("change", (event) => {
  if (event.target.matches('select[aria-label="Project overview period"]')) {
    showToast(`Project overview updated for ${event.target.value}`);
  }
  if (event.target.matches("#payroll-month, #payroll-department")) {
    refreshPayrollView();
  }
  if (event.target.matches("#attendance-range, #attendance-department, #attendance-location, #attendance-status")) {
    refreshAttendanceView();
  }
});

renderPayrollTable();
updatePayrollMetrics();
renderAttendanceTable();

profilePictureInput.addEventListener("change", () => {
  const [file] = profilePictureInput.files;
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    showToast("Choose an image smaller than 5 MB");
    profilePictureInput.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const source = reader.result;
    if (typeof source !== "string") return;
    setProfilePicture(source);
    localStorage.setItem("kiu-admin-profile-picture", source);
    showToast("Profile picture updated");
  });
  reader.readAsDataURL(file);
});

function findDashboardTarget(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;
  return searchTargets.find((target) => {
    const text = target.textContent.toLowerCase();
    return text.includes(normalizedQuery) || Object.values(target.dataset).some((value) => value.includes(normalizedQuery));
  });
}

dashboardSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const target = findDashboardTarget(query);
  if (target) {
    if (target.dataset.nav) target.click();
    else selectView(target.dataset.cardView || target.dataset.quickView);
    showToast(`Showing results for “${query}”`);
  } else {
    showToast(query ? `No dashboard results for “${query}”` : "Type a search term to continue");
  }
});

profileToggle.addEventListener("click", () => {
  const expanded = profileToggle.getAttribute("aria-expanded") === "true";
  profileToggle.setAttribute("aria-expanded", String(!expanded));
  profileMenu.hidden = expanded;
});

const ghostAlerts = [
  { id: "KIU-0014", name: "John Doe", status: "Ghost Worker", risk: "High", detected: "Nov 13, 2026 14:32", details: "No attendance activity, biometric match, or recent payroll confirmation was found." },
  { id: "KIU-0078", name: "Mary Atieno", status: "Inactive", risk: "Medium", detected: "Nov 13, 2026 14:20", details: "Attendance activity has been inactive for 30 days and requires manager confirmation." },
  { id: "KIU-0121", name: "Samuel Okello", status: "Ghost Worker", risk: "High", detected: "Nov 13, 2026 14:18", details: "Identity and payroll activity do not match the employee's recent attendance record." }
];

function updateGhostTrend(range) {
  const labels = range === "7D" ? ["Nov 7", "Nov 8", "Nov 9", "Nov 10", "Nov 11", "Nov 12", "Nov 13"] :
    range === "30D" ? ["Oct 15", "Oct 20", "Oct 25", "Oct 30", "Nov 4", "Nov 9", "Nov 13"] :
      ["Aug 15", "Aug 30", "Sep 15", "Sep 30", "Oct 15", "Oct 30", "Nov 13"];
  document.querySelectorAll(".ghost-days span").forEach((label, index) => {
    label.textContent = labels[index];
  });
  const chart = document.querySelector(".ghost-chart svg");
  if (chart) chart.setAttribute("aria-label", `Valid and ghost worker detection trend for ${range}`);
}

function renderGhostAlerts() {
  const tbody = document.querySelector(".ghost-table tbody");
  if (!tbody) return;
  tbody.innerHTML = ghostAlerts.map((alert, index) => `<tr><td>${index + 1}</td><td>${alert.id}</td><td>${alert.name}</td><td>${alert.status}</td><td><b class="risk-${alert.risk.toLowerCase()}">${alert.risk}</b></td><td>${alert.detected}</td><td><button data-ghost-action="view" data-ghost-name="${alert.name}">View</button></td></tr>`).join("");
}

renderGhostAlerts();

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-menu-wrap")) {
    profileToggle.setAttribute("aria-expanded", "false");
    profileMenu.hidden = true;
  }
});

profileMenu.addEventListener("click", (event) => {
  const action = event.target.closest("[data-profile-action]")?.dataset.profileAction;
  if (!action) return;
  profileToggle.setAttribute("aria-expanded", "false");
  profileMenu.hidden = true;
  if (action === "change-photo") {
    profilePictureInput.click();
    return;
  }
  if (action === "sign-out") {
    document.querySelector("#dashboard-shell").hidden = true;
    document.querySelector("#login-page").hidden = false;
    document.querySelector("#login-password").value = "";
    showToast("You have been signed out");
    return;
  }
  const details = {
    profile: ["My profile", "<p>Manage your administrator identity and contact information.</p><div class=\"modal-stat\"><b>Admin</b><span>role</span><b>Active</b><span>account status</span></div>"],
    settings: ["Account settings", "<p>Account security, password management, and login controls are available here.</p><button class=\"modal-secondary\" data-action=\"close-modal\">Close</button>"],
    preferences: ["Preferences", "<p>Choose dashboard display, notification, and reporting preferences.</p><button class=\"modal-secondary\" data-action=\"close-modal\">Close</button>"],
    help: ["Help & support", "<p>For assistance with payroll, employee records, or ghost-worker reviews, contact the HR systems administrator.</p><button class=\"modal-secondary\" data-action=\"close-modal\">Close</button>"]
  };
  openModal(details[action][0], details[action][1], "Administrator menu");
});

document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const message = document.querySelector("#login-message");
  const feedback = document.querySelector("#login-feedback");

  if (!email || !password) {
    message.textContent = "Enter your email and password to continue.";
    feedback.textContent = message.textContent;
    feedback.classList.add("visible");
    return;
  }

  if (email.toLowerCase() !== "admin@kiu" || password !== "hr") {
    message.textContent = "Use the administrator login details.";
    feedback.textContent = message.textContent;
    feedback.classList.add("visible");
    return;
  }

  feedback.classList.remove("visible");
  document.querySelector("#login-page").hidden = true;
  document.querySelector("#dashboard-shell").hidden = false;
});

document.querySelector("#forgot-login").addEventListener("click", () => {
  const emailInput = document.querySelector("#login-email");
  const message = document.querySelector("#login-message");
  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    message.textContent = "Enter your email address to recover your login.";
    emailInput.focus();
    return;
  }

  if (email !== "admin@kiu") {
    message.textContent = "If an account exists for this email, recovery instructions will be provided by the HR administrator.";
    return;
  }

  message.textContent = "Recovery request recorded. Contact the HR administrator to reset your password.";
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-attendance-action]")?.dataset.attendanceAction;
  if (!action) return;
  if (action === "export") {
    exportAttendance();
    return;
  }
  if (action === "view-all") {
    const records = getFilteredAttendanceRecords();
    const rows = records.map((record) => `<tr><td>${record.id}</td><td><strong>${record.name}</strong></td><td>${record.department}</td><td>${record.location}</td><td><span class="attendance-register-status ${record.status.toLowerCase()}">${record.status}</span></td><td>${record.present}</td><td>${record.absent}</td><td>${record.leave}</td></tr>`).join("");
    openModal("Attendance register", `<div class="attendance-register"><div class="modal-stat"><b>${records.length}</b><span>matching employees</span><b>${records.filter((record) => record.status === "Present").length}</b><span>present today</span></div><div class="attendance-register-table"><table><thead><tr><th>ID</th><th>Employee</th><th>Department</th><th>Location</th><th>Status</th><th>Present</th><th>Absent</th><th>Leave</th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="attendance-empty">No records match the selected filters.</td></tr>'}</tbody></table></div></div>`, "Attendance data");
  }
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-payroll-action]")?.dataset.payrollAction;
  if (!action) return;
  if (action === "export") {
    exportPayroll();
    return;
  }
  if (action === "view-all") {
    const records = getFilteredPayrollRecords();
    const paidCount = records.filter((record) => record.status === "Paid").length;
    const pendingCount = records.filter((record) => record.status === "Pending").length;
    const successRate = records.length ? Math.round((paidCount / records.length) * 1000) / 10 : 0;
    const rows = records.map((record) => `
      <tr>
        <td><strong>${record.name}</strong></td><td>${record.department}</td><td>${record.period}</td><td>${record.amount.toLocaleString("en-US")}</td>
        <td><span class="register-status ${record.status === "Paid" ? "paid" : "pending"}">${record.status === "Paid" ? "✓ Success" : "◷ Pending"}</span></td>
        <td><button class="register-view" type="button" data-payroll-action="view" data-payroll-name="${record.name}">View</button></td>
      </tr>`).join("");
    const month = document.querySelector("#payroll-month").value;
    openModal("Payroll Register", `<div class="payroll-register">
      <div class="register-heading"><div><p>Review payroll records for ${month} before approving the payment run.</p></div><span class="register-date">▣ &nbsp; Mon, 17 Nov 2026</span></div>
      <div class="register-kpis">
        <div class="register-kpi employees"><span>▣</span><div><b>Total Employees</b><strong>${document.querySelector("#payroll-department").value === "All departments" ? "845" : records.length}</strong><small>↑ +2% vs last month</small></div></div>
        <div class="register-kpi payroll"><span>▤</span><div><b>Total Payroll</b><strong>${formatPayrollAmount(records.reduce((sum, record) => sum + record.amount, 0))}</strong><small>↑ +5% vs last month</small></div></div>
        <div class="register-kpi success"><span>✓</span><div><b>Payment Success</b><strong>${successRate}%</strong><small>↑ +0.3% vs last month</small></div></div>
        <div class="register-kpi pending"><span>!</span><div><b>Pending Review</b><strong>${pendingCount}</strong><small>Review before approval</small></div></div>
      </div>
      <div class="register-body">
        <section class="register-summary"><h3>▤ &nbsp; Payroll Summary</h3><div class="register-donut"><strong>${successRate}%<small>Success Rate</small></strong></div><ul><li><i class="success-dot"></i>Successful <b>${paidCount}</b></li><li><i class="pending-dot"></i>Pending <b>${pendingCount}</b></li><li><i class="failed-dot"></i>Failed <b>0</b></li></ul></section>
        <section class="register-records"><div class="register-section-title"><h3>◷ &nbsp; Recent Payroll Records</h3><button type="button" data-payroll-action="export-register">Export All →</button></div><div class="register-table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Payroll Period</th><th>Amount (UGX)</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      </div>
      <div class="register-alert"><span>!</span><div><strong>Action Required</strong><p>${pendingCount} payroll record${pendingCount === 1 ? "" : "s"} ${pendingCount === 1 ? "is" : "are"} pending review. Please check for discrepancies before final approval.</p></div><button type="button" data-payroll-action="export-register">Export Register →</button></div>
    </div>`, "Payroll data");
    return;
  }
  if (action === "export-register") {
    exportPayroll();
    return;
  }
  if (action === "view") {
    const row = Array.from(document.querySelectorAll(".payroll-table-panel tbody tr, .register-records tbody tr")).find((item) => {
      const nameCell = item.closest(".register-records") ? item.cells[0] : item.cells[1];
      return nameCell?.textContent.trim() === event.target.dataset.payrollName;
    });
    if (!row) {
      showToast("Payroll record could not be found");
      return;
    }
    const registerRow = row.closest(".register-records");
    const department = row.cells[registerRow ? 1 : 2].textContent.trim();
    const period = registerRow ? row.cells[2].textContent.trim() : document.querySelector("#payroll-month").value;
    const amount = row.cells[registerRow ? 3 : 5].textContent.trim();
    const status = row.cells[registerRow ? 4 : 6].textContent.trim();
    openModal(event.target.dataset.payrollName, `<div class="payroll-record-card"><p>Payroll details for the selected employee and pay period.</p><div class="modal-stat"><b>${amount}</b><span>${registerRow ? "payroll amount" : "net pay"}</span><b>${status}</b><span>payment status</span></div><p><strong>Pay period:</strong> ${period}<br><strong>Department:</strong> ${department}</p><button class="modal-secondary" data-action="payroll-record-export">Export payslip summary</button></div>`, "Payroll record");
  }
});

function filterEmployees() {
  const query = employeeSearch.value.trim().toLowerCase();
  const department = employeeDepartment.value;
  const status = employeeStatus.value;
  const matchingRows = employeeRows.filter((row) => {
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const matchesDepartment = department === "All departments" || row.dataset.department === department;
    const matchesStatus = status === "All statuses" || row.dataset.status === status;
    return matchesQuery && matchesDepartment && matchesStatus;
  });
  const sortBy = employeeSort.value;
  matchingRows.sort((a, b) => {
    if (sortBy === "department") return a.dataset.department.localeCompare(b.dataset.department);
    if (sortBy === "recent") return b.dataset.name.localeCompare(a.dataset.name);
    return a.dataset.name.localeCompare(b.dataset.name);
  }).forEach((row) => document.querySelector("#employee-rows").appendChild(row));

  const pageStart = (employeePage - 1) * employeePageSize;
  const pageRows = matchingRows.slice(pageStart, pageStart + employeePageSize);
  employeeRows.forEach((row) => {
    row.hidden = !pageRows.includes(row);
  });
  const firstShown = pageRows.length ? pageStart + 1 : 0;
  const lastShown = pageStart + pageRows.length;
  document.querySelector("#employee-count").textContent = pageRows.length
    ? `Showing ${firstShown}-${lastShown} of ${employeeTotal} employees`
    : "Showing 0 of 845 employees";
  document.querySelector("#employee-empty").hidden = pageRows.length !== 0;
  employeePagination.querySelectorAll(".pagination").forEach((button) => {
    const active = Number(button.dataset.page) === employeePage;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function resetEmployeePage() {
  employeePage = 1;
  filterEmployees();
}

function findEmployeeRow(name) {
  return employeeRows.find((row) => row.dataset.name === name);
}

function openEmployeeForm(mode, row) {
  const isEdit = mode === "edit";
  const name = row?.dataset.name || "";
  const email = row?.cells[2]?.textContent.trim() || "";
  const department = row?.dataset.department || "Academic staff";
  const designation = row?.cells[4]?.textContent.trim() || "Staff member";
  const status = row?.dataset.status || "Active";
  openModal(isEdit ? `Edit ${escapeHtml(name)}` : "Add employee", `<form class="modal-form employee-form" id="employee-form" data-mode="${mode}" data-original-name="${escapeHtml(name)}">
    <label>Full name<input name="name" required value="${escapeHtml(name)}" placeholder="Employee name"></label>
    <label>Work email<input name="email" type="email" required value="${escapeHtml(email)}" placeholder="name@kiu.ac.ug"></label>
    <label>Department<select name="department"><option ${department === "Academic staff" ? "selected" : ""}>Academic staff</option><option ${department === "Administrative staff" ? "selected" : ""}>Administrative staff</option><option ${department === "Technical staff" ? "selected" : ""}>Technical staff</option><option ${department === "Support staff" ? "selected" : ""}>Support staff</option><option ${department === "Management" ? "selected" : ""}>Management</option><option ${department === "Medical staff" ? "selected" : ""}>Medical staff</option></select></label>
    <label>Designation<input name="designation" required value="${escapeHtml(designation)}" placeholder="Job title"></label>
    <label>Status<select name="status"><option ${status === "Active" ? "selected" : ""}>Active</option><option ${status === "On leave" ? "selected" : ""}>On leave</option><option ${status === "Inactive" ? "selected" : ""}>Inactive</option></select></label>
    <button class="modal-secondary" type="submit">${isEdit ? "Save employee changes" : "Create employee"}</button>
  </form>`, "Employee directory");
}

function openEmployeeProfile(name) {
  const row = findEmployeeRow(name);
  if (!row) {
    showToast("Employee record could not be found");
    return;
  }
  const status = row.dataset.status;
  openModal(name, `<div class="employee-profile-card"><p>Review employment information, contact details, and record completeness for this employee.</p><div class="modal-stat"><b>${status}</b><span>employment status</span><b>${row.cells[4].textContent.trim()}</b><span>designation</span></div><p><strong>Email</strong><br>${row.cells[2].textContent.trim()}</p><div class="employee-profile-actions"><button class="modal-secondary" data-employee-action="edit" data-employee-name="${escapeHtml(name)}">Edit employee</button><button class="modal-primary" data-employee-action="delete" data-employee-name="${escapeHtml(name)}">Delete employee</button></div></div>`, "Employee profile");
}

function confirmEmployeeDelete(name) {
  openModal("Delete employee", `<div class="employee-delete-confirm"><p>This will remove <strong>${escapeHtml(name)}</strong> from the employee directory. This action cannot be undone.</p><div class="employee-profile-actions"><button class="modal-secondary" data-action="close-modal">Keep employee</button><button class="modal-primary" data-employee-action="confirm-delete" data-employee-name="${escapeHtml(name)}">Delete employee</button></div></div>`, "Employee directory");
}

function exportEmployees() {
  const rows = [["Employee ID", "Name", "Email", "Department", "Designation", "Status"]];
  employeeRows.forEach((row) => rows.push(Array.from(row.cells).slice(1, 6).map((cell) => cell.textContent.trim())));
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "kiu-employee-directory.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Employee directory exported as CSV");
}

employeeSearch.addEventListener("input", resetEmployeePage);
employeeSearch.addEventListener("search", resetEmployeePage);
employeeDepartment.addEventListener("change", resetEmployeePage);
employeeStatus.addEventListener("change", resetEmployeePage);
employeeSort.addEventListener("change", resetEmployeePage);

employeePagination.addEventListener("click", (event) => {
  const button = event.target.closest(".pagination");
  if (!button) return;
  const page = Number(button.dataset.page);
  if (!Number.isInteger(page) || page < 1 || page > Math.ceil(employeeTotal / employeePageSize)) return;
  employeePage = page;
  filterEmployees();
});

filterEmployees();

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-employee-tab]");
  if (tab) {
    const selected = tab.dataset.employeeTab;
    document.querySelectorAll("[data-employee-tab]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-employee-view]").forEach((view) => {
      view.hidden = view.dataset.employeeView !== selected;
    });
    return;
  }
  const actionTarget = event.target.closest("[data-employee-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.employeeAction;
  if (action === "add") {
    openEmployeeForm("add");
    return;
  }
  if (action === "profile") {
    openEmployeeProfile(actionTarget.dataset.employeeName || "Employee");
    return;
  }
  if (action === "edit") {
    openEmployeeForm("edit", findEmployeeRow(actionTarget.dataset.employeeName));
    return;
  }
  if (action === "delete") {
    confirmEmployeeDelete(actionTarget.dataset.employeeName);
    return;
  }
  if (action === "confirm-delete") {
    const row = findEmployeeRow(actionTarget.dataset.employeeName);
    if (row) {
      const index = employeeRows.indexOf(row);
      if (index >= 0) employeeRows.splice(index, 1);
      row.remove();
      employeeTotal = Math.max(0, employeeTotal - 1);
      incrementMetric(".employee-summary article:nth-child(1) strong", -1);
      incrementMetric(".employee-summary article:nth-child(2) strong", row.dataset.status === "Active" ? -1 : 0);
      document.querySelector(".metric-card .metric-value").textContent = String(employeeTotal);
      document.querySelector(".quick-stat strong").textContent = String(employeeTotal);
      filterEmployees();
    }
    closeModal();
    showToast(`${actionTarget.dataset.employeeName} removed from the directory`);
    return;
  }
  if (action === "approve") {
    openModal("Leave request review", "<p>Review the leave dates and supporting documents before approving this request.</p><button class=\"modal-secondary\" data-action=\"approve-leave\">Approve request</button>", "Leave management");
    return;
  }
  if (action === "export") exportEmployees();
  if (action === "leave-export") {
    const csv = "Employee,Leave type,Dates,Status\r\nClara Atwine,Annual leave,17–21 June 2026,Pending\r\nJohn Mwesigwa,Sick leave,15–16 June 2026,Pending\r\nRebecca Nambi,Maternity leave,01 Jun–30 Aug 2026,Approved";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "kiu-leave-requests.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Leave requests exported as CSV");
  }
  if (action === "approve-leave") {
    closeModal();
    showToast("Leave request approved");
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "payroll-review-form") {
    event.preventDefault();
    closeModal();
    showToast("Payroll review decision saved");
    return;
  }
  if (event.target.id === "profile-update-form") {
    event.preventDefault();
    closeModal();
    showToast("Missing document update saved");
    return;
  }
  if (event.target.id !== "employee-form") return;
  event.preventDefault();
  const form = event.target;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const department = form.elements.department.value;
  const designation = form.elements.designation.value.trim();
  const status = form.elements.status.value;
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const row = form.dataset.mode === "edit" ? findEmployeeRow(form.dataset.originalName) : document.createElement("tr");
  if (!row) return;
  const employeeId = row.cells[1]?.textContent.trim() || `KIU-${String(employeeTotal + 1).padStart(5, "0")}`;
  row.dataset.name = name;
  row.dataset.department = department;
  row.dataset.status = status;
  row.innerHTML = `<td><button class="employee-person" data-employee-action="profile" data-employee-name="${escapeHtml(name)}"><span class="employee-avatar avatar-green">${escapeHtml(initials)}</span><span><b>${escapeHtml(name)}</b><small>${form.dataset.mode === "edit" ? "Updated today" : "Joined today"}</small></span></button></td><td>${employeeId}</td><td>${escapeHtml(email)}</td><td>${escapeHtml(department)}</td><td>${escapeHtml(designation)}</td><td><span class="employee-status ${status === "Active" ? "active" : status === "On leave" ? "leave" : "inactive"}">${escapeHtml(status)}</span></td><td><button class="row-action" data-employee-action="profile" data-employee-name="${escapeHtml(name)}">View</button></td>`;
  if (form.dataset.mode !== "edit") {
    document.querySelector("#employee-rows").appendChild(row);
    employeeRows.push(row);
    employeeTotal += 1;
    incrementMetric(".employee-summary article:nth-child(1) strong");
    incrementMetric(".employee-summary article:nth-child(2) strong", status === "Active" ? 1 : 0);
    document.querySelector(".metric-card .metric-value").textContent = String(employeeTotal);
    document.querySelector(".quick-stat strong").textContent = String(employeeTotal);
  }
  resetEmployeePage();
  closeModal();
  showToast(form.dataset.mode === "edit" ? `${name} updated successfully` : `${name} added to the employee directory`);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function incrementMetric(selector, amount = 1) {
  const metric = document.querySelector(selector);
  if (!metric) return;
  metric.textContent = String(Number(metric.textContent.replace(/,/g, "")) + amount);
}

function openModal(title, content, kicker = "Dashboard detail") {
  document.querySelector("#modal-kicker").textContent = kicker;
  document.querySelector("#modal-title").textContent = title;
  document.querySelector("#modal-content").innerHTML = content;
  const modalPrimary = document.querySelector(".detail-modal > .modal-primary");
  modalPrimary.hidden = Boolean(document.querySelector("#modal-content .modal-form"));
  modal.hidden = false;
  document.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.hidden = true;
}

function openPayrollExceptions() {
  const exceptions = [
    ["James Okello", "KIU-00125", "Payment", "Salary variance detected", "payment"],
    ["Sarah Namutebi", "KIU-00138", "Tax", "PAYE not calculated", "tax"],
    ["David Mugisha", "KIU-00142", "Deduction", "NSSF deduction missing", "deduction"],
    ["Mary Akello", "KIU-00155", "Payment", "Overtime not included", "payment"],
    ["Peter Kato", "KIU-00162", "Tax", "Tax band mismatch", "tax"]
  ];
  const rows = exceptions.map(([name, id, type, details, className]) => `
    <div class="payroll-exception-row">
      <div class="payroll-exception-person"><span class="payroll-person-icon">♙</span><strong>${name}</strong></div>
      <span>${id}</span>
      <span class="payroll-exception-type ${className}">${type}</span>
      <span>${details}</span>
      <button type="button" class="payroll-review-button" data-payroll-exception="review" data-payroll-name="${name}">◉ &nbsp; Review</button>
    </div>`).join("");
  openModal("Payroll Exceptions", `<div class="payroll-exceptions">
    <div class="payroll-exception-heading"><div><p class="eyebrow">Action centre</p><p class="payroll-exception-subtitle">7 payroll records are awaiting review before the next approval run.</p></div><span class="payroll-currency">UGX</span></div>
    <div class="payroll-exception-summary"><div class="payment"><strong>3</strong><span>Payment Discrepancies</span></div><div class="tax"><strong>2</strong><span>Tax Issues</span></div><div class="deduction"><strong>2</strong><span>Pending Deductions</span></div></div>
    <div class="payroll-exception-table"><div class="payroll-exception-header"><span>Employee</span><span>Employee ID</span><span>Issue Type</span><span>Details</span><span>Action</span></div>${rows}</div>
    <div class="payroll-exception-footer"><span>ⓘ Resolve these exceptions to ensure smooth payroll processing.</span><button type="button" class="modal-primary" data-payroll-exception="view-all">◉ &nbsp; View All Exceptions →</button></div>
  </div>`, "Action centre");
  document.querySelector(".detail-modal > .modal-primary").hidden = true;
}

function openExpiringContracts() {
  const contracts = [
    ["James Okello", "Finance", "18 Nov 2026", "5 days left", "urgent"],
    ["Sarah Namutebi", "Human Resources", "25 Nov 2026", "12 days left", "soon"],
    ["David Mugisha", "ICT", "04 Dec 2026", "21 days left", "soon"]
  ];
  const rows = contracts.map(([name, department, date, remaining, className]) => `
    <div class="contract-expiry-row">
      <div class="contract-expiry-person"><span class="contract-person-icon">♙</span><strong>${name}</strong></div>
      <span>${department}</span>
      <span class="contract-expiry-date">▣ &nbsp;${date}</span>
      <span class="contract-expiry-badge ${className}">${remaining}</span>
    </div>`).join("");
  openModal("Expiring Contracts", `<div class="contract-expiries">
    <div class="contract-expiry-heading"><div><p class="eyebrow">Action centre</p><p class="contract-expiry-subtitle">12 contracts require renewal review within the next 30 days.</p></div><span class="contract-clock">◷</span></div>
    <div class="contract-expiry-summary"><div class="expiring"><span>▣</span><strong>12</strong><b>Expiring Soon</b></div><div class="within-seven"><span>▣!</span><strong>5</strong><b>Within 7 Days</b></div><div class="renewed"><span>✓</span><strong>7</strong><b>Renewed</b></div></div>
    <div class="contract-expiry-list-heading"><h3>Upcoming Contract Expiries</h3><button type="button" class="modal-primary" data-contract-expiry="view-all">View All →</button></div>
    <div class="contract-expiry-list">${rows}</div>
    <div class="contract-expiry-footer">ⓘ &nbsp; Stay updated to avoid contract lapses.</div>
  </div>`, "Action centre");
  document.querySelector(".detail-modal > .modal-primary").hidden = true;
}

function openIncompleteProfiles() {
  const profiles = [
    ["James Okello", "KIU-00125", "Finance", [["▣ ID Copy", "red"], ["▤ Degree", "red"]]],
    ["Sarah Namutebi", "KIU-00138", "Human Resources", [["▤ NSSF Card", "yellow"], ["▤ CV", "yellow"]]],
    ["David Mugisha", "KIU-00142", "ICT", [["▤ Medical Report", "blue"]]],
    ["Mary Akello", "KIU-00155", "Administration", [["▣ ID Copy", "red"], ["▤ Tax PIN", "blue"]]]
  ];
  const rows = profiles.map(([name, id, department, documents]) => `
    <div class="profile-incomplete-row">
      <div class="profile-incomplete-person"><span class="profile-person-icon">♙</span><strong>${name}</strong></div>
      <span>${id}</span>
      <span>${department}</span>
      <div class="missing-documents">${documents.map(([document, className]) => `<span class="document-badge ${className}">${document}</span>`).join("")}</div>
      <button type="button" class="profile-update-button" data-profile-action="update" data-profile-name="${name}">▣ &nbsp; Update</button>
    </div>`).join("");
  openModal("Incomplete Profiles", `<div class="incomplete-profiles">
    <div class="incomplete-profile-heading"><div><p class="eyebrow">Action centre</p><p class="incomplete-profile-subtitle">18 employee profiles are missing one or more required documents.</p></div><span class="incomplete-profile-icon">♙!</span></div>
    <div class="incomplete-profile-notice">⚠ &nbsp; Please update the missing documents to keep employee records complete.</div>
    <div class="incomplete-profile-table"><div class="incomplete-profile-header"><span>Employee</span><span>Employee ID</span><span>Department</span><span>Missing Documents</span><span>Action</span></div>${rows}</div>
    <div class="incomplete-profile-footer"><span>ⓘ &nbsp; Click update to upload the missing documents.</span><button type="button" class="modal-primary" data-profile-action="view-all">View All Profiles →</button></div>
  </div>`, "Action centre");
  document.querySelector(".detail-modal > .modal-primary").hidden = true;
}

function openPayrollReview(name) {
  openModal(`Review payroll exception`, `<form class="modal-form action-review-form" id="payroll-review-form">
    <p>Resolve the payroll exception assigned to <strong>${name}</strong> before the next approval run.</p>
    <label>Resolution<select name="resolution" required><option value="">Select a resolution</option><option>Correct payroll record</option><option>Request supporting documents</option><option>Escalate to Finance</option></select></label>
    <label>Review note<textarea name="note" rows="3" required placeholder="Add a clear review note"></textarea></label>
    <button class="modal-secondary" type="submit">Save review decision</button>
  </form>`, "Payroll review");
}

function openContractQueue() {
  openModal("Contract renewal queue", `<div class="action-queue">
    <p>All 12 contracts expiring within the next 30 days are included in this renewal queue.</p>
    <div class="modal-stat"><b>12</b><span>renewal reviews</span><b>5</b><span>due within 7 days</span></div>
    <ul class="modal-list"><li><b>Priority queue</b><small>James Okello · Finance · 18 Nov 2026</small></li><li><b>Upcoming reviews</b><small>Sarah Namutebi · Human Resources · 25 Nov 2026</small></li><li><b>Upcoming reviews</b><small>David Mugisha · ICT · 04 Dec 2026</small></li></ul>
    <button class="modal-secondary" data-action="contract-export">Export renewal queue</button>
  </div>`, "Contract management");
}

function openProfileUpdate(name) {
  openModal(`Update ${name}`, `<form class="modal-form action-review-form" id="profile-update-form">
    <p>Upload or record a missing document for <strong>${name}</strong>.</p>
    <label>Document type<select name="document" required><option value="">Select document</option><option>ID Copy</option><option>Degree</option><option>NSSF Card</option><option>CV</option><option>Medical Report</option><option>Tax PIN</option></select></label>
    <label>Document file<input name="file" type="file" required></label>
    <button class="modal-secondary" type="submit">Save document update</button>
  </form>`, "Profile completion");
}

function openProfileQueue() {
  openModal("Profile completion queue", `<div class="action-queue">
    <p>18 employee profiles require one or more documents before they can be marked complete.</p>
    <div class="modal-stat"><b>18</b><span>incomplete profiles</span><b>7</b><span>document types</span></div>
    <ul class="modal-list"><li><b>Highest priority</b><small>James Okello · ID Copy and Degree</small></li><li><b>Needs documents</b><small>Sarah Namutebi · NSSF Card and CV</small></li><li><b>Needs document</b><small>David Mugisha · Medical Report</small></li><li><b>Needs documents</b><small>Mary Akello · ID Copy and Tax PIN</small></li></ul>
    <button class="modal-secondary" data-action="profile-export">Export profile queue</button>
  </div>`, "Profile completion");
}

function renderView(name) {
  const view = views[name];
  const max = Math.max(...view.values.map(([, value]) => value));
  caption.textContent = view.caption;
  legend.innerHTML = `<i class="legend-${view.color}"></i> ${view.legend} <button aria-label="More chart options" data-action="chart-options">•••</button>`;
  chart.innerHTML = view.values.map(([label, value]) => `
    <div class="bar-row"><span>${label}</span>
      <div class="bar-track"><i class="bar-${view.color}" style="width:${(value / max) * 92}%"></i></div><b>${value}</b>
    </div>`).join("");
}

function selectView(name) {
  const tab = document.querySelector(`.tab[data-view="${name}"]`);
  if (!tab) return;
  tabs.forEach((item) => {
    item.classList.toggle("active", item === tab);
    item.setAttribute("aria-selected", item === tab ? "true" : "false");
  });
  renderView(name);
  document.querySelector(".main-panel").scrollIntoView({ behavior: "smooth", block: "center" });
}

function showNavDetail(name) {
  if (name === "ghost-workers") {
    document.querySelector("#dashboard-shell").classList.add("ghost-mode");
    document.querySelector("#dashboard-shell").classList.remove("attendance-mode", "employees-mode", "payroll-mode", "project-mode");
    document.querySelector("#dashboard").hidden = true;
    document.querySelector("#attendance-dashboard").hidden = true;
    document.querySelector("#payroll-dashboard").hidden = true;
    document.querySelector(".employees-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").hidden = true;
    document.querySelector("#ghost-dashboard").hidden = false;
    document.querySelector("#ghost-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (name === "projects") {
    document.querySelector("#dashboard-shell").classList.add("project-mode");
    document.querySelector("#dashboard-shell").classList.remove("attendance-mode", "employees-mode", "payroll-mode", "ghost-mode");
    document.querySelector("#dashboard").hidden = true;
    document.querySelector("#attendance-dashboard").hidden = true;
    document.querySelector("#payroll-dashboard").hidden = true;
    document.querySelector(".employees-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").hidden = false;
    document.querySelector("#ghost-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (name === "attendance") {
    document.querySelector("#dashboard-shell").classList.add("attendance-mode");
    document.querySelector("#dashboard-shell").classList.remove("employees-mode", "payroll-mode", "project-mode", "ghost-mode");
    document.querySelector("#dashboard").hidden = true;
    document.querySelector("#attendance-dashboard").hidden = false;
    document.querySelector("#payroll-dashboard").hidden = true;
    document.querySelector(".employees-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").hidden = true;
    document.querySelector("#ghost-dashboard").hidden = true;
    document.querySelector(".summary-grid").hidden = true;
    document.querySelector(".content-grid").hidden = true;
    document.querySelector(".quick-stats").hidden = true;
    document.querySelector(".attendance-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (name === "payroll" || name === "finance" || name === "payroll-finance") {
    document.querySelector("#dashboard-shell").classList.add("payroll-mode");
    document.querySelector("#dashboard-shell").classList.remove("employees-mode", "attendance-mode", "project-mode", "ghost-mode");
    document.querySelector("#dashboard").hidden = true;
    document.querySelector("#attendance-dashboard").hidden = true;
    document.querySelector("#payroll-dashboard").hidden = false;
    document.querySelector(".employees-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").hidden = true;
    document.querySelector("#ghost-dashboard").hidden = true;
    document.querySelector(".summary-grid").hidden = true;
    document.querySelector(".content-grid").hidden = true;
    document.querySelector(".quick-stats").hidden = true;
    document.querySelector("#payroll-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (name === "employees") {
    document.querySelector("#dashboard-shell").classList.add("employees-mode");
    document.querySelector("#dashboard-shell").classList.remove("attendance-mode", "payroll-mode", "project-mode", "ghost-mode");
    document.querySelector("#dashboard").hidden = true;
    document.querySelector("#attendance-dashboard").hidden = true;
    document.querySelector("#payroll-dashboard").hidden = true;
    document.querySelector("#projects-dashboard").hidden = true;
    document.querySelector(".employees-dashboard").hidden = false;
    document.querySelector(".employees-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  document.querySelector("#dashboard-shell").classList.remove("attendance-mode");
  document.querySelector("#dashboard-shell").classList.remove("payroll-mode");
  document.querySelector("#dashboard-shell").classList.remove("employees-mode");
  document.querySelector("#dashboard-shell").classList.remove("project-mode");
  document.querySelector("#dashboard-shell").classList.remove("ghost-mode");
  document.querySelector("#dashboard").hidden = false;
  document.querySelector("#attendance-dashboard").hidden = true;
  document.querySelector("#payroll-dashboard").hidden = true;
  document.querySelector(".employees-dashboard").hidden = true;
  document.querySelector("#projects-dashboard").hidden = true;
  document.querySelector("#ghost-dashboard").hidden = true;
  document.querySelector(".summary-grid").hidden = false;
  document.querySelector(".content-grid").hidden = false;
  document.querySelector(".quick-stats").hidden = false;
  const details = {
    projects: ["Projects workspace", "<p>Project tracking is ready for integration. Add project owners, milestones, budgets, and completion status here.</p><div class=\"modal-stat\"><b>12</b><span>active projects</span><b>84%</b><span>on schedule</span></div>"],
    employees: ["Employee directory", "<p>Browse employee profiles, employment contracts, departments, and document completeness from the employee workspace.</p><div class=\"modal-stat\"><b>845</b><span>active employees</span><b>18</b><span>incomplete profiles</span></div>"],
    payroll: ["Payroll & Finance overview", "<p>Review payroll runs, deductions, department costs, budgets, and finance approvals in one workspace.</p><div class=\"modal-stat\"><b>UGX 2.84B</b><span>monthly payroll</span><b>UGX 32.45M</b><span>deductions</span></div>"],
    finance: ["Payroll & Finance overview", "<p>Review payroll runs, deductions, department costs, budgets, and finance approvals in one workspace.</p><div class=\"modal-stat\"><b>UGX 2.84B</b><span>monthly payroll</span><b>UGX 32.45M</b><span>deductions</span></div>"],
    "payroll-finance": ["Payroll & Finance overview", "<p>Review payroll runs, deductions, department costs, budgets, and finance approvals in one workspace.</p><div class=\"modal-stat\"><b>UGX 2.84B</b><span>monthly payroll</span><b>UGX 32.45M</b><span>deductions</span></div>"],
    attendance: ["Attendance overview", "<p>Monitor present days, absences, leave, overtime, and attendance rates across the university.</p><div class=\"modal-stat\"><b>201</b><span>present employees</span><b>90.9%</b><span>attendance rate</span><b>14</b><span>absent employees</span><b>186</b><span>overtime hours</span></div>"],
    "ghost-workers": ["Ghost worker detection", "<p>Run a verification review across payroll, attendance, biometrics, bank accounts, and national IDs.</p><div class=\"modal-stat\"><b>0</b><span>unresolved matches</span><b>98.6%</b><span>verified records</span></div>"]
  };
  const detail = details[name];
  if (detail) openModal(detail[0], detail[1], "Workspace");
}

function exportReport() {
  const rows = [["Metric", "Value"], ["Actual headcount", "845"], ["New hires", "96"], ["Open positions", "42"], ["Terminations", "18"], ["Monthly payroll", "UGX 2.84B"]];
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "kiu-hr-dashboard-report.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Report exported as CSV");
}

function exportProjects() {
  const rows = [["Project", "Department", "Start Date", "End Date", "Status", "Progress"]];
  document.querySelectorAll(".project-table tbody tr").forEach((row) => {
    rows.push(Array.from(row.cells).slice(1, 7).map((cell, index) => index === 5 ? cell.textContent.trim() : cell.textContent.trim()));
  });
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "kiu-project-register.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Project register exported as CSV");
}

function exportPayroll() {
  const rows = [["Employee ID", "Employee", "Department", "Gross pay", "Deductions", "Net pay", "Status"]];
  getFilteredPayrollRecords().forEach((record) => {
    rows.push([
      record.id,
      record.name,
      record.department,
      formatPayrollAmount(record.amount + record.deductions),
      formatPayrollAmount(record.deductions),
      formatPayrollAmount(record.amount),
      record.status
    ]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const month = document.querySelector("#payroll-month")?.value.replace(/\s+/g, "-").toLowerCase() || "register";
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `kiu-payroll-${month}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Payroll register exported as CSV");
}

function getProjectRow(name) {
  return Array.from(document.querySelectorAll(".project-table tbody tr")).find((row) => row.cells[1]?.textContent.trim() === name);
}

function openProjectForm(mode, row) {
  const isEdit = mode === "edit";
  const name = row?.cells[1]?.textContent.trim() || "";
  const department = row?.cells[2]?.textContent.trim() || "Academic staff";
  const status = row?.cells[5]?.textContent.trim() || "Ongoing";
  const progress = row?.cells[6]?.querySelector("span")?.textContent.replace("%", "") || "0";
  const escapedName = escapeHtml(name);
  openModal(isEdit ? `Edit ${escapedName}` : "Add project", `<form class="modal-form" id="project-form" data-mode="${mode}" data-original-name="${escapedName}">
    <label>Project name<input name="name" required value="${escapedName}" placeholder="Project name"></label>
    <label>Department<select name="department"><option ${department === "Academic staff" ? "selected" : ""}>Academic staff</option><option ${department === "Administrative staff" ? "selected" : ""}>Administrative staff</option><option ${department === "Technical staff" ? "selected" : ""}>Technical staff</option><option ${department === "Support staff" ? "selected" : ""}>Support staff</option><option ${department === "Management" ? "selected" : ""}>Management</option><option ${department === "Medical staff" ? "selected" : ""}>Medical staff</option></select></label>
    <label>Start date<input name="start" type="date" ${isEdit ? "" : "required"}></label>
    <label>End date<input name="end" type="date"></label>
    <label>Status<select name="status"><option ${status === "Ongoing" ? "selected" : ""}>Ongoing</option><option ${status === "Planned" ? "selected" : ""}>Planned</option><option ${status === "Completed" ? "selected" : ""}>Completed</option></select></label>
    <label>Progress (%)<input name="progress" type="number" min="0" max="100" value="${progress}" required></label>
    <button class="modal-secondary" type="submit">${isEdit ? "Save project changes" : "Create project"}</button>
  </form>`, "Project management");
}

function showProjectDetails(name) {
  const row = getProjectRow(name);
  if (!row) {
    showToast("Project record could not be found");
    return;
  }
  const status = row.cells[5].textContent.trim();
  const progress = row.cells[6].querySelector("span").textContent;
  openModal(name, `<div class="project-detail-card"><p>Review delivery progress and project ownership for this record.</p><div class="modal-stat"><b>${progress}</b><span>current progress</span><b>${status}</b><span>delivery status</span></div><div class="project-detail-actions"><button class="modal-secondary" data-project-action="edit" data-project-name="${escapeHtml(name)}">Edit project</button><button class="modal-primary" data-project-action="delete" data-project-name="${escapeHtml(name)}">Delete project</button></div></div>`, "Project details");
}

function confirmProjectDelete(name) {
  openModal("Delete project", `<div class="project-delete-confirm"><p>This will remove <strong>${escapeHtml(name)}</strong> from the project register. This action cannot be undone.</p><div class="project-detail-actions"><button class="modal-secondary" data-action="close-modal">Keep project</button><button class="modal-primary" data-project-action="confirm-delete" data-project-name="${escapeHtml(name)}">Delete project</button></div></div>`, "Project management");
}

function updateProjectCounts() {
  const total = document.querySelectorAll(".project-table tbody tr").length;
  const ongoing = document.querySelectorAll(".project-table .project-status.ongoing").length;
  const completed = document.querySelectorAll(".project-table .project-status.completed").length;
  document.querySelector(".project-kpi:nth-child(1) strong").textContent = String(Math.max(0, 12 + total - 4));
  document.querySelector(".project-kpi:nth-child(2) strong").textContent = String(Math.max(0, 7 + ongoing - 2));
  document.querySelector(".project-kpi:nth-child(3) strong").textContent = String(Math.max(0, 4 + completed - 2));
  const projectTotal = document.querySelector(".project-kpi:nth-child(1) strong").textContent;
  const projectOverviewTotal = document.querySelector(".project-donut > span");
  if (projectOverviewTotal) projectOverviewTotal.innerHTML = `${projectTotal}<small>Projects</small>`;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-project-action]");
  if (!target) return;
  const action = target.dataset.projectAction;
  if (action === "add") {
    openProjectForm("add");
  } else if (action === "view-all") {
    openModal("Project register", `<div class="action-queue"><p>Review all projects currently tracked by KIU HR & Finance.</p><div class="modal-stat"><b>${document.querySelector(".project-kpi:nth-child(1) strong").textContent}</b><span>total projects</span><b>${document.querySelector(".project-kpi:nth-child(2) strong").textContent}</b><span>ongoing projects</span></div><button class="modal-secondary" data-action="project-export">Export project register</button></div>`, "Project management");
  } else if (action === "view") {
    showProjectDetails(target.dataset.projectName);
  } else if (action === "edit") {
    openProjectForm("edit", getProjectRow(target.dataset.projectName));
  } else if (action === "delete") {
    confirmProjectDelete(target.dataset.projectName);
  } else if (action === "confirm-delete") {
    const row = getProjectRow(target.dataset.projectName);
    if (row) row.remove();
    updateProjectCounts();
    closeModal();
    showToast(`${target.dataset.projectName} deleted from projects`);
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "project-form") return;
  event.preventDefault();
  const form = event.target;
  const name = form.elements.name.value.trim();
  const department = form.elements.department.value;
  const startDate = form.elements.start.value;
  const endDate = form.elements.end.value;
  const status = form.elements.status.value;
  const progress = Math.min(100, Math.max(0, Number(form.elements.progress.value)));
  const formattedStartDate = startDate
    ? new Date(`${startDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Not set";
  const formattedEndDate = endDate
    ? new Date(`${endDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const projectsTable = document.querySelector(".project-table tbody");
  const row = form.dataset.mode === "edit" ? getProjectRow(form.dataset.originalName) : document.createElement("tr");
  if (!row) return;
  const projectNumber = row.cells[0]?.textContent || projectsTable.rows.length + 1;
  row.innerHTML = `<td>${projectNumber}</td><td>${escapeHtml(name)}</td><td>${escapeHtml(department)}</td><td>${formattedStartDate}</td><td>${formattedEndDate}</td><td><span class="project-status ${status.toLowerCase()}">${status}</span></td><td><div class="project-progress"><span>${progress}%</span><i><b style="width:${progress}%"></b></i></div></td><td><button data-project-action="view" data-project-name="${escapeHtml(name)}" aria-label="View ${escapeHtml(name)}">◉</button><button data-project-action="edit" data-project-name="${escapeHtml(name)}" aria-label="Edit ${escapeHtml(name)}">↗</button><button data-project-action="delete" data-project-name="${escapeHtml(name)}" aria-label="Delete ${escapeHtml(name)}">▣</button></td>`;
  if (form.dataset.mode !== "edit") projectsTable.prepend(row);
  updateProjectCounts();
  closeModal();
  showToast(form.dataset.mode === "edit" ? `${name} updated successfully` : `${name} added to projects`);
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-ghost-action], [data-ghost-range]");
  if (!target) return;
  const action = target.dataset.ghostAction;
  if (target.dataset.ghostRange) {
    document.querySelectorAll("[data-ghost-range]").forEach((button) => button.classList.toggle("active", button === target));
    updateGhostTrend(target.dataset.ghostRange);
    showToast(`Detection trend updated to ${target.dataset.ghostRange}`);
    return;
  }
  if (action === "scan") {
    target.disabled = true;
    target.textContent = "Scanning employee records...";
    setTimeout(() => {
      target.disabled = false;
      target.textContent = "⌕  Scan Now";
      document.querySelector(".ghost-system-status").innerHTML = "<i></i> System Online <span>│</span> ◫ Just now <b>Admin⌄</b>";
      showToast("Scan complete: 234 valid workers and 14 records require review");
    }, 900);
  } else if (action === "alerts") {
    const rows = ghostAlerts.map((alert) => `<tr><td>${alert.id}</td><td><strong>${alert.name}</strong></td><td>${alert.status}</td><td><b class="risk-${alert.risk.toLowerCase()}">${alert.risk}</b></td><td><button class="register-view" data-ghost-action="view" data-ghost-name="${alert.name}">Review</button></td></tr>`).join("");
    openModal("Recent alerts", `<div class="ghost-alert-register"><div class="modal-stat"><b>${ghostAlerts.length}</b><span>open alerts</span><b>${ghostAlerts.filter((alert) => alert.risk === "High").length}</b><span>high risk</span></div><div class="ghost-modal-table"><table><thead><tr><th>Employee ID</th><th>Name</th><th>Status</th><th>Risk</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div></div>`, "Ghost worker detection");
  } else if (action === "view") {
    const alert = ghostAlerts.find((item) => item.name === target.dataset.ghostName);
    if (!alert) return;
    openModal(`Review ${alert.name}`, `<p>${alert.details}</p><div class="modal-stat"><b>${alert.id}</b><span>employee ID</span><b>${alert.risk}</b><span>risk level</span></div><button class="modal-secondary" data-action="close-modal">Close review</button>`, "Detection alert");
  }
});

tabs.forEach((tab) => tab.addEventListener("click", () => selectView(tab.dataset.view)));

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-nav], [data-card-view], [data-quick-view], [data-alert]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "close-modal") closeModal();
  if (action === "export") exportReport();
  if (action === "notifications") openModal("Notifications", "<ul class=\"modal-list\"><li><b>Payroll review</b><small>7 exceptions need attention before approval.</small></li><li><b>Contracts</b><small>12 contracts expire within the next 30 days.</small></li></ul>", "Notifications");
  if (action === "chart-options") openModal("Chart options", "<p>Use the tabs to switch metrics. Detailed department data can be exported from the report action below.</p>", "People analytics");
  if (action === "gender-options") openModal("Gender split", "<p>Female: 312 employees · Male: 511 employees · Other: 22 employees.</p>", "Workforce mix");
  if (action === "contract-export") {
    showToast("Contract renewal queue export is ready");
  }
  if (action === "payroll-export") {
    showToast("Payroll exception queue export is ready");
  }
  if (action === "payroll-record-export") {
    showToast("Payslip summary exported as CSV");
  }
  if (action === "profile-export") {
    showToast("Profile completion queue export is ready");
  }
  if (action === "project-export") {
    exportProjects();
  }
  if (action === "details") {
    event.preventDefault();
    openModal("People analytics report", "<p>This report includes department headcount, gender, employment type, nationality, and month-on-month movement.</p><div class=\"modal-stat\"><b>845</b><span>employees</span><b>5</b><span>departments</span></div>", "Detailed report");
  }
  if (target.dataset.alert) {
    if (target.dataset.alert === "contracts") {
      openExpiringContracts();
      return;
    }
    if (target.dataset.alert === "payroll") {
      openPayrollExceptions();
      return;
    }
    if (target.dataset.alert === "profiles") {
      openIncompleteProfiles();
      return;
    }
    const messages = {
      contracts: ["Expiring contracts", "12 contracts require renewal review within the next 30 days."],
      payroll: ["Payroll exceptions", "7 payroll records are awaiting review before the next approval run."],
      profiles: ["Incomplete profiles", "18 employee profiles are missing one or more required documents."]
    };
    openModal(messages[target.dataset.alert][0], `<p>${messages[target.dataset.alert][1]}</p><button class="modal-secondary" data-action="close-modal">Open review queue</button>`, "Action centre");
  }
  if (target.dataset.cardView || target.dataset.quickView) selectView(target.dataset.cardView || target.dataset.quickView);
  if (target.dataset.nav) {
    document.querySelectorAll(".primary-nav a").forEach((item) => item.classList.toggle("active", item === target));
    if (target.dataset.nav === "dashboard") {
      showNavDetail("dashboard");
      document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth" });
    }
    else showNavDetail(target.dataset.nav);
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-payroll-exception]");
  if (!target) return;
  if (target.dataset.payrollException === "review") {
    openPayrollReview(target.dataset.payrollName);
  }
  if (target.dataset.payrollException === "view-all") {
    openModal("Payroll review queue", `<div class="action-queue">
      <p>All 7 payroll exceptions are ready for review before payroll approval.</p>
      <div class="modal-stat"><b>7</b><span>open exceptions</span><b>3</b><span>payment discrepancies</span></div>
      <ul class="modal-list"><li><b>James Okello</b><small>Payment · Salary variance detected</small></li><li><b>Sarah Namutebi</b><small>Tax · PAYE not calculated</small></li><li><b>David Mugisha</b><small>Deduction · NSSF deduction missing</small></li><li><b>Mary Akello</b><small>Payment · Overtime not included</small></li><li><b>Peter Kato</b><small>Tax · Tax band mismatch</small></li></ul>
      <button class="modal-secondary" data-action="payroll-export">Export exception queue</button>
    </div>`, "Payroll review");
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-contract-expiry]");
  if (!target) return;
  if (target.dataset.contractExpiry === "view-all") {
    openContractQueue();
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-profile-action]");
  if (!target) return;
  if (target.dataset.profileAction === "update") {
    openProfileUpdate(target.dataset.profileName);
  }
  if (target.dataset.profileAction === "view-all") {
    openProfileQueue();
  }
});

document.querySelector("#period-select").addEventListener("change", (event) => {
  showToast(`Dashboard updated for ${event.target.value}`);
  document.querySelector("footer span:last-child").textContent = `Last refreshed: ${event.target.value}, 08:42 EAT`;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-card-view], [data-quick-view], [data-nav]")) {
    event.preventDefault();
    event.target.click();
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
