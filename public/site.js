const body = document.body;

const visitorRoleLabels = {
  student: "Viewing as: Student",
  educator: "Viewing as: Educator / Elder",
  partner: "Viewing as: Government / Partner Organisation",
  community: "Viewing as: Community Member"
};

const questionRoleValues = {
  student: "Student",
  educator: "Educator",
  partner: "Government or service partner",
  community: "Community member"
};

const visitorRoleKey = "culturalConnectionVisitorRole";

function readVisitorRole() {
  try {
    return window.localStorage.getItem(visitorRoleKey);
  } catch {
    return "";
  }
}

function saveVisitorRole(role) {
  try {
    window.localStorage.setItem(visitorRoleKey, role);
  } catch {
    return;
  }
}

function syncQuestionRole(role) {
  const select = document.querySelector("#role");
  if (!select || !questionRoleValues[role]) return;
  select.value = questionRoleValues[role];
}

function updateVisitorPill(role) {
  const pill = document.querySelector("[data-visitor-pill]");
  const label = document.querySelector("[data-visitor-role]");
  if (!pill || !label) return;
  label.textContent = visitorRoleLabels[role] || "";
  pill.hidden = !visitorRoleLabels[role];
  syncQuestionRole(role);
}

function showEntryGate() {
  const gate = document.querySelector("[data-entry-gate]");
  if (!gate) return;
  gate.classList.remove("hidden");
  body.classList.add("gate-open");
}

function hideEntryGate() {
  const gate = document.querySelector("[data-entry-gate]");
  if (!gate) return;
  gate.classList.add("hidden");
  body.classList.remove("gate-open");
}

const entryGate = document.querySelector("[data-entry-gate]");
if (entryGate) {
  const storedRole = readVisitorRole();
  if (visitorRoleLabels[storedRole]) {
    updateVisitorPill(storedRole);
    hideEntryGate();
  } else {
    showEntryGate();
  }

  entryGate.querySelectorAll("[data-role-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const role = button.dataset.roleChoice;
      if (!visitorRoleLabels[role]) return;
      saveVisitorRole(role);
      updateVisitorPill(role);
      hideEntryGate();
    });
  });
}

const changeRoleButton = document.querySelector("[data-change-role]");
if (changeRoleButton) {
  changeRoleButton.addEventListener("click", showEntryGate);
}

const programPlans = {
  year7: {
    year: "Year 7 — Program Entry",
    heading: "Foundations: Country and Community",
    items: [
      "Introduction to local Country — place names, geography, seasonal knowledge",
      "Meeting local Elders and establishing ongoing relationships",
      "First session: family histories and kinship structures",
      "Digital platform onboarding — students set up their profile and explore resources",
      "Second session: totems and Dreaming stories connected to local Country",
      "Access to the question box — first questions to Elders collected"
    ]
  },
  year8: {
    year: "Years 8–9 — Deepening Connection",
    heading: "Language, Ceremony and Cultural Practice",
    items: [
      "Introduction to local language — greetings, place names, everyday terms",
      "Cultural practices: traditional crafts, food preparation, seasonal ceremonies",
      "Expanded family history project — connection to broader community",
      "Digital platform: resource library updated with local cultural materials",
      "Local Indigenous success stories — community leaders, artists, educators, athletes",
      "Student-led question submissions reviewed and responded to by Elders"
    ]
  },
  year10: {
    year: "Year 10 — Identity and Pathways",
    heading: "Connecting Culture to Future",
    items: [
      "Reflection sessions: how cultural learning has shaped students' sense of identity",
      "Connecting cultural strengths to career and education pathways",
      "Community storytelling — students record and share their own cultural narratives",
      "Digital platform: testimonies section updated with student contributions",
      "Peer mentorship — older students in the program connect with incoming Year 7 cohort",
      "Check-in with educator network on access and engagement barriers"
    ]
  },
  year11: {
    year: "Years 11–12 — Legacy and Transition",
    heading: "Leadership and Post-School Readiness",
    items: [
      "Students take active roles in facilitating elements of sessions with Elders",
      "Post-school transition support — scholarships, community programs, employment pathways",
      "Contribution to the digital resource library for future cohorts",
      "Graduation ceremony with Elders and community — celebrating cultural journey",
      "Program evaluation — student, educator, Elder and community partner feedback",
      "Planning for program continuation and potential expansion to additional schools"
    ]
  }
};

function renderTimeline(key = "year7") {
  const holder = document.querySelector("[data-timeline]");
  if (!holder) return;
  const plan = programPlans[key] || programPlans.year7;
  holder.innerHTML = `
    <div class="timeline-item timeline-card">
      <strong>${plan.year}</strong>
      <p>${plan.heading}</p>
      <ul>
        ${plan.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

const timelineSelect = document.querySelector("[data-timeline-select]");
if (timelineSelect) {
  renderTimeline(timelineSelect.value);
  timelineSelect.addEventListener("change", () => renderTimeline(timelineSelect.value));
}

const roleSwitcher = document.querySelector("[data-role-switcher]");
if (roleSwitcher) {
  const tabs = [...roleSwitcher.querySelectorAll("[data-role-tab]")];
  const panels = [...roleSwitcher.querySelectorAll("[data-role-panel]")];

  function showRole(role) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.roleTab === role;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.rolePanel === role;
      panel.classList.toggle("active", selected);
      panel.hidden = !selected;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showRole(tab.dataset.roleTab));
  });
}

document.querySelectorAll("[data-background-tabs]").forEach((tabSet) => {
  const tabs = [...tabSet.querySelectorAll("[data-background-tab]")];
  const panels = [...tabSet.querySelectorAll("[data-background-panel]")];

  function showBackgroundPanel(key) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.backgroundTab === key;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.backgroundPanel === key;
      panel.classList.toggle("active", selected);
      panel.hidden = !selected;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showBackgroundPanel(tab.dataset.backgroundTab));
  });
});

function escapeText(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function renderComments(comments) {
  const holder = document.querySelector("[data-comments]");
  if (!holder) return;

  if (!comments.length) {
    holder.innerHTML = `
      <div class="empty-state">
        No questions submitted yet. Be the first to ask something.
      </div>
    `;
    return;
  }

  holder.innerHTML = comments
    .map(
      (comment) => `
        <article class="comment">
          <header>
            <div>
              <strong>${escapeText(comment.name)}</strong>
              <span class="meta">${escapeText(comment.role)} - ${escapeText(comment.topic)}</span>
            </div>
            <time datetime="${escapeText(comment.createdAt)}">${formatDate(comment.createdAt)}</time>
          </header>
          <p>${escapeText(comment.message)}</p>
        </article>
      `
    )
    .join("");
}

async function loadComments() {
  const holder = document.querySelector("[data-comments]");
  if (!holder) return;
  try {
    const response = await fetch("/api/comments");
    if (!response.ok) throw new Error("Unable to load comments.");
    const data = await response.json();
    renderComments(data.comments || []);
  } catch {
    holder.innerHTML = `
      <div class="empty-state">
        Comments load when the Question Box API and database connection are available.
      </div>
    `;
  }
}

const questionForm = document.querySelector("[data-question-form]");
if (questionForm) {
  loadComments();
  questionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("[data-form-status]");
    const submitButton = questionForm.querySelector("button[type='submit']");
    const formData = new FormData(questionForm);
    const payload = Object.fromEntries(formData.entries());

    status.textContent = "Sending...";
    status.classList.remove("error");
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send the comment.");
      questionForm.reset();
      status.textContent = "Thank you — your question has been saved and will be reviewed.";
      await loadComments();
    } catch (error) {
      status.textContent = error.message || "The comment could not be saved.";
      status.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
