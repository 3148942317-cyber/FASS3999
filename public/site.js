const body = document.body;

const programPlans = {
  year7: [
    ["Term 1", "Begin with local Country, language and story sessions led by Elders and Aboriginal educators."],
    ["Term 2", "Map personal learning goals and introduce the digital resource library."],
    ["Term 3", "Explore totems, local histories and cultural practices through guided activities."],
    ["Term 4", "Submit reflections and questions for the next immersion session."]
  ],
  year8: [
    ["Session 1", "Deepen local knowledge through place-based learning and family history prompts."],
    ["Online", "Use the question box to keep conversations active between face-to-face sessions."],
    ["Session 2", "Connect cultural learning with school belonging and practical support pathways."]
  ],
  year9: [
    ["Workshop", "Hear local Indigenous success stories and discuss strengths, identity and community."],
    ["Resource check", "Review trusted services, school contacts and community support options."],
    ["Reflection", "Identify what support is needed to stay engaged with learning."]
  ],
  senior: [
    ["Planning", "Link cultural learning with future pathways, mentoring and locally relevant opportunities."],
    ["Contribution", "Senior students can help shape resources for younger cohorts."],
    ["Transition", "Document completed modules, remaining goals and support contacts before graduation."]
  ]
};

function renderTimeline(key = "year7") {
  const holder = document.querySelector("[data-timeline]");
  if (!holder) return;
  const steps = programPlans[key] || programPlans.year7;
  holder.innerHTML = steps
    .map(
      ([label, text]) => `
        <div class="timeline-item">
          <strong>${label}</strong>
          <p>${text}</p>
        </div>
      `
    )
    .join("");
}

const timelineSelect = document.querySelector("[data-timeline-select]");
if (timelineSelect) {
  renderTimeline(timelineSelect.value);
  timelineSelect.addEventListener("change", () => renderTimeline(timelineSelect.value));
}

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
        No questions have been submitted yet. The first saved comment will appear here.
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
      status.textContent = "Saved. Your question is now in the box.";
      await loadComments();
    } catch (error) {
      status.textContent = error.message || "The comment could not be saved.";
      status.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
