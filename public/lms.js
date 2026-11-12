(() => {
  const navButtons = document.querySelectorAll("[data-page]");
  const pages = document.querySelectorAll(".page-section");
  const breadcrumb = document.getElementById("breadcrumbCurrent");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const toast = document.getElementById("toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  };

  const activatePage = (pageName) => {
    const target = document.getElementById(`page-${pageName}`);
    if (!target) return;
    pages.forEach((page) => page.classList.toggle("is-active", page === target));
    document.querySelectorAll(".side-nav [data-page]").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === pageName);
    });
    if (breadcrumb) {
      const activeNav = document.querySelector(`.side-nav [data-page="${pageName}"] span`);
      breadcrumb.textContent = activeNav ? activeNav.textContent : "Overview";
    }
    sidebar?.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", () => activatePage(button.dataset.page));
  });

  menuToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));
  document.addEventListener("click", (event) => {
    if (!sidebar || !menuToggle || window.innerWidth > 850) return;
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("open");
    }
  });

  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });

  const downloadCsv = (filename, rows) => {
    const content = rows.map((row) => row.map((value) => {
      const text = String(value ?? "");
      return `"${text.replaceAll('"', '""')}"`;
    }).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const learnerRows = [
    ["Learner", "Email", "Department", "Courses completed", "Total courses", "Points", "Last active", "Status"],
    ["Amara Cole", "amara.cole@vanguard.co", "People & Culture", 8, 10, 2840, "Today", "On track"],
    ["Jonah Mitchell", "jonah.mitchell@vanguard.co", "Operations", 5, 10, 1620, "Yesterday", "Needs nudge"],
    ["Sofia Kim", "sofia.kim@vanguard.co", "Technology", 10, 10, 4280, "Today", "Completed"],
    ["Ethan Brooks", "ethan.brooks@vanguard.co", "Finance", 3, 10, 940, "Oct 29, 2026", "Overdue"],
    ["Priya Raman", "priya.raman@vanguard.co", "Customer Experience", 7, 10, 2310, "Nov 3, 2026", "On track"]
  ];

  const complianceRows = [
    ["Required course", "Assigned", "Completed", "Overdue", "Compliance"],
    ["Workplace Safety Essentials", 2486, 2401, 85, "96.6%"],
    ["Data Privacy & Protection", 2486, 2342, 144, "94.2%"],
    ["Code of Conduct", 2486, 2463, 23, "99.1%"]
  ];

  const transactionRows = [
    ["Transaction", "Learner", "Course", "Date", "Amount (PHP)", "Status"],
    ["VG-2026-0386", "Sofia Kim", "Leadership Foundations", "Nov 04, 2026", 1499, "Paid"],
    ["VG-2026-0385", "Amara Cole", "Data Privacy Professional", "Nov 03, 2026", 2250, "Paid"],
    ["VG-2026-0384", "Jonah Mitchell", "Leadership Foundations", "Nov 02, 2026", 1499, "Pending"]
  ];

  document.getElementById("learnersExport")?.addEventListener("click", () => {
    downloadCsv("vanguard-learner-progress.csv", learnerRows);
    showToast("Learner progress exported as CSV.");
  });

  document.getElementById("complianceExport")?.addEventListener("click", () => {
    downloadCsv("vanguard-compliance-report.csv", complianceRows);
    showToast("Compliance report exported as CSV.");
  });

  document.getElementById("analyticsExport")?.addEventListener("click", () => {
    downloadCsv("vanguard-analytics-report.csv", [
      ["Metric", "Value"],
      ["Overall course completion", "78.4%"],
      ["Average assessment score", "84%"],
      ["At-risk learners", "126"],
      ["Compliance completion", "94.2%"],
      ...complianceRows.slice(1)
    ]);
    showToast("Analytics report exported as CSV.");
  });

  document.getElementById("overviewExport")?.addEventListener("click", () => {
    downloadCsv("vanguard-learning-overview.csv", [
      ["Metric", "Value"],
      ["Active learners", 2486],
      ["Course completion", "78.4%"],
      ["Learning hours", 8942],
      ["Compliance rate", "94.2%"],
      ...complianceRows.slice(1)
    ]);
    showToast("Overview report exported as CSV.");
  });

  document.getElementById("transactionsExport")?.addEventListener("click", () => {
    downloadCsv("vanguard-transactions-demo.csv", transactionRows);
    showToast("Transaction preview exported as CSV.");
  });

  document.querySelectorAll(".report-download").forEach((button) => {
    button.addEventListener("click", () => {
      const course = button.dataset.report;
      const rows = [complianceRows[0], ...complianceRows.slice(1).filter((row) => row[0] === course)];
      const filename = `${course.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-compliance.csv`;
      downloadCsv(filename, rows);
      showToast(`${course} compliance report exported.`);
    });
  });

  const filterLearners = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = document.querySelectorAll("#learnerTable tbody tr");
    rows.forEach((row) => {
      row.hidden = !row.textContent.toLowerCase().includes(normalizedQuery);
    });
  };

  document.getElementById("learnerSearch")?.addEventListener("input", (event) => {
    filterLearners(event.target.value);
  });

  document.getElementById("globalSearch")?.addEventListener("input", (event) => {
    const query = event.target.value;
    if (query.trim()) activatePage("learners");
    filterLearners(query);
  });

  document.getElementById("courseSearch")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll(".catalog-card").forEach((card) => {
      card.hidden = !card.textContent.toLowerCase().includes(query);
    });
  });

  document.getElementById("courseFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    document.querySelectorAll("#courseFilters .filter-pill").forEach((pill) => {
      pill.classList.toggle("selected", pill === button);
    });
    document.querySelectorAll(".catalog-card").forEach((card) => {
      const matchesCategory = button.dataset.category === "all" || card.dataset.category === button.dataset.category;
      const query = document.getElementById("courseSearch")?.value.trim().toLowerCase() || "";
      card.hidden = !matchesCategory || !card.textContent.toLowerCase().includes(query);
    });
  });

  document.getElementById("reportFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    document.querySelectorAll("#reportFilters .filter-pill").forEach((pill) => {
      pill.classList.toggle("selected", pill === button);
    });
    const label = button.dataset.filter === "365" ? "year-to-date" : `${button.dataset.filter}-day`;
    document.querySelectorAll(".subtle-tag").forEach((tag) => {
      tag.textContent = `${label} view`;
    });
    showToast(`Analytics period changed to ${label}.`);
  });

  document.getElementById("activityPeriod")?.addEventListener("change", (event) => {
    const totals = { "7": "1,248", "30": "4,862", "90": "13,704" };
    const total = document.getElementById("hoursTotal");
    if (total) total.innerHTML = `${totals[event.target.value]} <small>hrs</small>`;
    showToast(`Showing learning activity for the last ${event.target.value} days.`);
  });

  document.querySelectorAll(".class-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.classTab;
      document.querySelectorAll(".class-tab").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".class-tab-content").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === `class-${tabName}`);
      });
    });
  });

  document.querySelectorAll(".quick-link[data-class-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`.class-tab[data-class-tab="${button.dataset.classTab}"]`)?.click();
    });
  });

  document.querySelectorAll(".enroll-button").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(`"${button.dataset.course}" selected. Connect your learner directory to assign it.`);
    });
  });

  document.querySelectorAll(".purchase-button").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(`"${button.dataset.course}" preview opened. Checkout is not connected in this demo.`);
    });
  });

  document.querySelectorAll(".reply-button").forEach((button) => {
    button.addEventListener("click", () => showToast("Reply composer opened for this discussion."));
  });

  const receiptModal = document.getElementById("receiptModal");
  const closeReceipt = () => {
    receiptModal?.classList.remove("open");
    receiptModal?.setAttribute("aria-hidden", "true");
  };
  document.querySelectorAll(".receipt-button").forEach((button) => {
    button.addEventListener("click", () => {
      const receiptNumber = document.getElementById("receiptNumber");
      if (receiptNumber) receiptNumber.textContent = button.dataset.receipt;
      receiptModal?.classList.add("open");
      receiptModal?.setAttribute("aria-hidden", "false");
      document.getElementById("closeReceipt")?.focus();
    });
  });
  document.getElementById("closeReceipt")?.addEventListener("click", closeReceipt);
  receiptModal?.addEventListener("click", (event) => {
    if (event.target === receiptModal) closeReceipt();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeReceipt();
  });

  document.getElementById("printCertificate")?.addEventListener("click", () => window.print());
  document.getElementById("printReceipt")?.addEventListener("click", () => {
    document.body.classList.add("printing-receipt");
    window.print();
  });
  window.addEventListener("afterprint", () => document.body.classList.remove("printing-receipt"));
})();
