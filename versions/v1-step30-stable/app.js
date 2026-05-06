import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const landingSection = document.getElementById("landing-section");
const enterAppBtn = document.getElementById("enter-app-btn");
const visualStage = document.getElementById("visual-stage");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const googleLoginBtn = document.getElementById("google-login-btn");
const logoutBtn = document.getElementById("logout-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

const authMessage = document.getElementById("auth-message");
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const userEmailText = document.getElementById("user-email");

const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const dueDateInput = document.getElementById("due-date-input");
const addTaskBtn = document.getElementById("add-task-btn");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

const taskMessage = document.getElementById("task-message");
const taskList = document.getElementById("task-list");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const taskLoading = document.getElementById("task-loading");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const overdueCount = document.getElementById("overdue-count");
const missionText = document.getElementById("mission-text");

const todayCount = document.getElementById("today-count");
const smartOverdueCount = document.getElementById("smart-overdue-count");
const highPriorityCount = document.getElementById("high-priority-count");
const completionRate = document.getElementById("completion-rate");
const smartSuggestionTitle = document.getElementById("smart-suggestion-title");
const smartSuggestionText = document.getElementById("smart-suggestion-text");
const priorityQueueList = document.getElementById("priority-queue-list");

const sessionSubjectInput = document.getElementById("session-subject");
const sessionDateInput = document.getElementById("session-date");
const sessionStartInput = document.getElementById("session-start");
const sessionEndInput = document.getElementById("session-end");
const addSessionBtn = document.getElementById("add-session-btn");
const sessionMessage = document.getElementById("session-message");
const sessionLoading = document.getElementById("session-loading");
const sessionList = document.getElementById("session-list");

const notesInput = document.getElementById("notes-input");
const saveNotesBtn = document.getElementById("save-notes-btn");
const notesMessage = document.getElementById("notes-message");
const notesLoading = document.getElementById("notes-loading");

const pomodoroCard = document.querySelector(".pomodoro-card");
const timerDisplay = document.getElementById("timer-display");
const timerModeText = document.getElementById("timer-mode-text");
const timerStartBtn = document.getElementById("timer-start-btn");
const timerPauseBtn = document.getElementById("timer-pause-btn");
const timerResetBtn = document.getElementById("timer-reset-btn");
const timerMessage = document.getElementById("timer-message");

const filterButtons = document.querySelectorAll(".filter-btn");
const toast = document.getElementById("toast");

let unsubscribeTasks = null;
let unsubscribeNotes = null;
let unsubscribeSessions = null;

let currentFilter = "all";
let currentPriorityFilter = "all";

let latestTasks = [];
let latestSessions = [];

let currentSearch = "";
let isAddingTask = false;
let isAddingSession = false;
let editingTaskId = null;

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

let timerSecondsLeft = FOCUS_DURATION;
let timerMode = "focus";
let timerInterval = null;
let isTimerRunning = false;

const savedTheme = localStorage.getItem("student-dashboard-theme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  themeToggleBtn.textContent = "Dark Mode";
} else {
  themeToggleBtn.textContent = "Light Mode";
}

function showLandingScreen() {
  landingSection.style.display = "block";
  authSection.style.display = "none";
  dashboard.style.display = "none";
}

function showAuthScreen() {
  landingSection.style.display = "none";
  authSection.style.display = "grid";
  dashboard.style.display = "none";
}

function showDashboardScreen() {
  landingSection.style.display = "none";
  authSection.style.display = "none";
  dashboard.style.display = "block";
}

enterAppBtn.addEventListener("click", () => {
  showAuthScreen();
});

if (visualStage) {
  visualStage.addEventListener("mousemove", (event) => {
    const rect = visualStage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    visualStage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  visualStage.addEventListener("mouseleave", () => {
    visualStage.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2600);
}

function showMessage(element, message, type = "success") {
  element.textContent = message;

  if (type === "success") {
    element.style.color = "#22c55e";
  } else if (type === "warning") {
    element.style.color = "#facc15";
  } else {
    element.style.color = "#f87171";
  }
}

function getFriendlyErrorMessage(error) {
  const code = error.code || "";

  if (code === "auth/invalid-email") return "Please enter a valid email address.";
  if (code === "auth/missing-password") return "Please enter your password.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/email-already-in-use") return "This email is already registered. Try logging in instead.";
  if (code === "auth/popup-closed-by-user") return "Google login was closed before completion.";

  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential"
  ) {
    return "Incorrect email or password.";
  }

  if (code === "permission-denied") {
    return "Permission denied. Please check your Firestore security rules.";
  }

  return "Something went wrong. Please try again.";
}

function normalizeTaskTitle(title) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function taskAlreadyExists(taskText, ignoreTaskId = null) {
  const newTask = normalizeTaskTitle(taskText);

  return latestTasks.some((task) => {
    if (ignoreTaskId && task.id === ignoreTaskId) return false;
    return normalizeTaskTitle(task.title || "") === newTask;
  });
}

function setTaskLoading(isLoading) {
  taskLoading.style.display = isLoading ? "block" : "none";
}

function setNotesLoading(isLoading) {
  notesLoading.style.display = isLoading ? "block" : "none";
}

function setSessionLoading(isLoading) {
  sessionLoading.style.display = isLoading ? "block" : "none";
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate + "T00:00:00");

  return due < todayOnly;
}

function isDueToday(dueDate, completed) {
  if (!dueDate || completed) return false;
  return dueDate === getTodayDateString();
}

function getPriorityScore(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function formatSessionDate(dateValue) {
  if (!dateValue) return "No date";

  const date = new Date(dateValue + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatSessionTime(startTime, endTime) {
  if (!startTime && !endTime) return "No time selected";
  if (startTime && !endTime) return `Starts at ${startTime}`;
  if (!startTime && endTime) return `Ends at ${endTime}`;
  return `${startTime} - ${endTime}`;
}

function formatTimerTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimerTime(timerSecondsLeft);

  if (timerMode === "focus") {
    timerModeText.textContent = "Focus time";
    timerMessage.textContent = isTimerRunning
      ? "Stay focused. Avoid switching tabs or checking your phone."
      : "Start a focused 25-minute study session.";

    pomodoroCard.classList.remove("break-mode");
  } else {
    timerModeText.textContent = "Short break";
    timerMessage.textContent = isTimerRunning
      ? "Take a short break. Stretch, drink water, and reset."
      : "Break mode is ready.";

    pomodoroCard.classList.add("break-mode");
  }

  if (isTimerRunning) {
    pomodoroCard.classList.add("timer-active");
  } else {
    pomodoroCard.classList.remove("timer-active");
  }
}

function stopTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isTimerRunning = false;
}

function switchTimerMode() {
  stopTimerInterval();

  if (timerMode === "focus") {
    timerMode = "break";
    timerSecondsLeft = BREAK_DURATION;
    showToast("Focus session complete. Time for a 5-minute break.", "success");
  } else {
    timerMode = "focus";
    timerSecondsLeft = FOCUS_DURATION;
    showToast("Break complete. Ready for another focus session.", "success");
  }

  updateTimerDisplay();
}

function startTimer() {
  if (isTimerRunning) return;

  isTimerRunning = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSecondsLeft -= 1;

    if (timerSecondsLeft <= 0) {
      switchTimerMode();
      return;
    }

    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!isTimerRunning) return;

  stopTimerInterval();
  timerMessage.textContent = "Timer paused. Press Start when you are ready to continue.";
  updateTimerDisplay();
}

function resetTimer() {
  stopTimerInterval();

  timerMode = "focus";
  timerSecondsLeft = FOCUS_DURATION;

  updateTimerDisplay();
  showToast("Pomodoro timer reset.", "success");
}

function isSessionInPast(session) {
  if (!session.date) return false;

  const todayDate = getTodayDateString();

  if (session.date < todayDate) return true;
  if (session.date > todayDate) return false;

  if (!session.endTime) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return session.endTime < currentTime;
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  if (document.body.classList.contains("light-theme")) {
    localStorage.setItem("student-dashboard-theme", "light");
    themeToggleBtn.textContent = "Dark Mode";
  } else {
    localStorage.setItem("student-dashboard-theme", "dark");
    themeToggleBtn.textContent = "Light Mode";
  }
});

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage(authMessage, "Account created successfully.", "success");
    showToast("Account created successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(authMessage, "Logged in successfully.", "success");
    showToast("Logged in successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  }
});

googleLoginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
    showToast("Google login successful.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  showToast("Logged out successfully.", "success");
});

timerStartBtn.addEventListener("click", () => {
  startTimer();
});

timerPauseBtn.addEventListener("click", () => {
  pauseTimer();
});

timerResetBtn.addEventListener("click", () => {
  resetTimer();
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  renderTasks();
});

priorityFilter.addEventListener("change", () => {
  currentPriorityFilter = priorityFilter.value;
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
    button.classList.add("active-filter");

    renderTasks();
  });
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTaskBtn.click();
  }
});

addTaskBtn.addEventListener("click", async () => {
  const taskText = taskInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;
  const user = auth.currentUser;

  if (!user) return;
  if (isAddingTask) return;

  if (taskText === "") {
    showMessage(taskMessage, "Please enter a task.", "error");
    showToast("Please enter a task.", "error");
    return;
  }

  if (taskAlreadyExists(taskText)) {
    showMessage(taskMessage, "This task already exists.", "warning");
    showToast("This task already exists.", "warning");
    return;
  }

  try {
    isAddingTask = true;
    addTaskBtn.disabled = true;
    addTaskBtn.textContent = "Saving...";

    await addDoc(collection(db, "users", user.uid, "tasks"), {
      title: taskText,
      completed: false,
      priority,
      dueDate,
      createdAt: serverTimestamp()
    });

    taskInput.value = "";
    priorityInput.value = "medium";
    dueDateInput.value = "";

    showMessage(taskMessage, "Task saved successfully.", "success");
    showToast("Task saved successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(taskMessage, message, "error");
    showToast(message, "error");
  } finally {
    isAddingTask = false;
    addTaskBtn.disabled = false;
    addTaskBtn.textContent = "Add Task";
  }
});

clearCompletedBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const completedTasks = latestTasks.filter((task) => task.completed);

  if (completedTasks.length === 0) {
    showMessage(taskMessage, "No completed tasks to clear.", "warning");
    showToast("No completed tasks to clear.", "warning");
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete ${completedTasks.length} completed task(s)?`
  );

  if (!confirmed) return;

  try {
    clearCompletedBtn.disabled = true;
    clearCompletedBtn.textContent = "Clearing...";

    for (const task of completedTasks) {
      await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
    }

    showMessage(taskMessage, "Completed tasks cleared.", "success");
    showToast("Completed tasks cleared.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(taskMessage, message, "error");
    showToast(message, "error");
  } finally {
    clearCompletedBtn.disabled = false;
    clearCompletedBtn.textContent = "Clear Completed Tasks";
  }
});

addSessionBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const subject = sessionSubjectInput.value.trim();
  const date = sessionDateInput.value;
  const startTime = sessionStartInput.value;
  const endTime = sessionEndInput.value;

  if (isAddingSession) return;

  if (subject === "") {
    showMessage(sessionMessage, "Please enter a subject or topic.", "error");
    showToast("Please enter a subject or topic.", "error");
    return;
  }

  if (date === "") {
    showMessage(sessionMessage, "Please select a study date.", "error");
    showToast("Please select a study date.", "error");
    return;
  }

  if (startTime === "" || endTime === "") {
    showMessage(sessionMessage, "Please select start and end time.", "error");
    showToast("Please select start and end time.", "error");
    return;
  }

  if (endTime <= startTime) {
    showMessage(sessionMessage, "End time must be after start time.", "error");
    showToast("End time must be after start time.", "error");
    return;
  }

  try {
    isAddingSession = true;
    addSessionBtn.disabled = true;
    addSessionBtn.textContent = "Saving...";

    await addDoc(collection(db, "users", user.uid, "sessions"), {
      subject,
      date,
      startTime,
      endTime,
      createdAt: serverTimestamp()
    });

    sessionSubjectInput.value = "";
    sessionDateInput.value = "";
    sessionStartInput.value = "";
    sessionEndInput.value = "";

    showMessage(sessionMessage, "Study session added successfully.", "success");
    showToast("Study session added successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(sessionMessage, message, "error");
    showToast(message, "error");
  } finally {
    isAddingSession = false;
    addSessionBtn.disabled = false;
    addSessionBtn.textContent = "Add Study Session";
  }
});

saveNotesBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    saveNotesBtn.disabled = true;
    saveNotesBtn.textContent = "Saving...";

    await setDoc(doc(db, "users", user.uid, "notes", "main"), {
      content: notesInput.value,
      updatedAt: serverTimestamp()
    });

    showMessage(notesMessage, "Notes saved successfully.", "success");
    showToast("Notes saved successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(notesMessage, message, "error");
    showToast(message, "error");
  } finally {
    saveNotesBtn.disabled = false;
    saveNotesBtn.textContent = "Save Notes";
  }
});

async function toggleTaskComplete(taskId, currentStatus) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
      completed: !currentStatus
    });

    showToast(currentStatus ? "Task moved back to pending." : "Task completed.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(taskMessage, message, "error");
    showToast(message, "error");
  }
}

async function deleteSession(sessionId, subject) {
  const user = auth.currentUser;
  if (!user) return;

  const confirmed = confirm(`Delete this study session?\n\n${subject}`);

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "sessions", sessionId));
    showMessage(sessionMessage, "Study session deleted.", "success");
    showToast("Study session deleted.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(sessionMessage, message, "error");
    showToast(message, "error");
  }
}

async function deleteTask(taskId, taskTitle) {
  const user = auth.currentUser;
  if (!user) return;

  const confirmed = confirm(`Delete this task?\n\n${taskTitle}`);

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
    showMessage(taskMessage, "Task deleted.", "success");
    showToast("Task deleted.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(taskMessage, message, "error");
    showToast(message, "error");
  }
}

async function saveEditedTask(taskId) {
  const user = auth.currentUser;
  if (!user) return;

  const titleInput = document.getElementById(`edit-title-${taskId}`);
  const prioritySelect = document.getElementById(`edit-priority-${taskId}`);
  const dueDateEditInput = document.getElementById(`edit-due-${taskId}`);

  const newTitle = titleInput.value.trim();
  const newPriority = prioritySelect.value;
  const newDueDate = dueDateEditInput.value;

  if (newTitle === "") {
    showToast("Task title cannot be empty.", "error");
    return;
  }

  if (taskAlreadyExists(newTitle, taskId)) {
    showToast("Another task with this title already exists.", "warning");
    return;
  }

  try {
    await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
      title: newTitle,
      priority: newPriority,
      dueDate: newDueDate
    });

    editingTaskId = null;
    showToast("Task updated successfully.", "success");
  } catch (error) {
    showToast(getFriendlyErrorMessage(error), "error");
  }
}

function formatPriority(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function getDueStatus(dueDate) {
  if (!dueDate) return { text: "No due date", className: "" };

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate + "T00:00:00");

  const formattedDate = due.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  if (due < todayOnly) {
    return { text: `Overdue: ${formattedDate}`, className: "overdue" };
  }

  if (due.getTime() === todayOnly.getTime()) {
    return { text: `Due Today: ${formattedDate}`, className: "due-today" };
  }

  return { text: formattedDate, className: "" };
}

function getFilteredTasks() {
  let filteredTasks = latestTasks;

  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  }

  if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }

  if (currentPriorityFilter !== "all") {
    filteredTasks = filteredTasks.filter((task) => {
      return (task.priority || "medium") === currentPriorityFilter;
    });
  }

  if (currentSearch !== "") {
    filteredTasks = filteredTasks.filter((task) => {
      return (task.title || "").toLowerCase().includes(currentSearch);
    });
  }

  return filteredTasks;
}

function updateSmartWidgets(total, completed, pending, overdue, percentage) {
  const dueTodayTasks = latestTasks.filter((task) => {
    return isDueToday(task.dueDate, task.completed);
  });

  const highPriorityPending = latestTasks.filter((task) => {
    return !task.completed && (task.priority || "medium") === "high";
  });

  todayCount.textContent = dueTodayTasks.length;
  smartOverdueCount.textContent = overdue;
  highPriorityCount.textContent = highPriorityPending.length;
  completionRate.textContent = `${percentage}%`;

  if (overdue > 0) {
    smartSuggestionTitle.textContent = "Start with overdue tasks";
    smartSuggestionText.textContent =
      `You have ${overdue} overdue task(s). Finish the oldest or highest priority one first.`;
  } else if (highPriorityPending.length > 0) {
    smartSuggestionTitle.textContent = "Focus on high priority work";
    smartSuggestionText.textContent =
      `You have ${highPriorityPending.length} high priority pending task(s). Complete one before adding more tasks.`;
  } else if (dueTodayTasks.length > 0) {
    smartSuggestionTitle.textContent = "Today has active deadlines";
    smartSuggestionText.textContent =
      `You have ${dueTodayTasks.length} task(s) due today. Try to finish them before starting future tasks.`;
  } else if (pending > 0) {
    smartSuggestionTitle.textContent = "Choose one task and finish it";
    smartSuggestionText.textContent =
      `You have ${pending} pending task(s). Pick the smallest one and build momentum.`;
  } else if (total > 0 && completed === total) {
    smartSuggestionTitle.textContent = "Everything is complete";
    smartSuggestionText.textContent =
      "All tasks are completed. Review your notes or plan tomorrow’s work.";
  } else {
    smartSuggestionTitle.textContent = "Ready to focus?";
    smartSuggestionText.textContent =
      "Add your first study task and StudyFinder will suggest what to focus on first.";
  }

  renderPriorityQueue();
}

function renderPriorityQueue() {
  const priorityTasks = latestTasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const priorityDifference =
        getPriorityScore(b.priority || "medium") - getPriorityScore(a.priority || "medium");

      if (priorityDifference !== 0) return priorityDifference;

      const aDue = a.dueDate || "9999-12-31";
      const bDue = b.dueDate || "9999-12-31";

      return aDue.localeCompare(bDue);
    })
    .slice(0, 3);

  priorityQueueList.innerHTML = "";

  if (priorityTasks.length === 0) {
    priorityQueueList.innerHTML = "<li>No priority tasks yet.</li>";
    return;
  }

  priorityTasks.forEach((task) => {
    const li = document.createElement("li");
    const dueInfo = task.dueDate ? getDueStatus(task.dueDate).text : "No due date";

    li.innerHTML = `
      <strong>${escapeHtml(task.title || "Untitled task")}</strong>
      ${formatPriority(task.priority || "medium")} priority · ${dueInfo}
    `;

    priorityQueueList.appendChild(li);
  });
}

function updateStats() {
  const total = latestTasks.length;
  const completed = latestTasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const overdue = latestTasks.filter((task) => isOverdue(task.dueDate, task.completed)).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
  overdueCount.textContent = overdue;
  progressText.textContent = `Completed: ${completed} / ${total}`;

  progressFill.style.width = `${percentage}%`;

  if (overdue > 0) {
    missionText.textContent = `You have ${overdue} overdue task(s). Clear those first.`;
  } else if (pending > 0) {
    missionText.textContent = `You have ${pending} pending task(s). Pick the most important one.`;
  } else if (total > 0) {
    missionText.textContent = "All tasks completed. Great work.";
  } else {
    missionText.textContent = "Add your first study task to begin.";
  }

  updateSmartWidgets(total, completed, pending, overdue, percentage);
}

function getEmptyStateMessage() {
  if (latestTasks.length === 0) {
    return "No tasks yet. Add your first study task to start tracking your progress.";
  }

  if (currentSearch !== "") {
    return "No tasks match your search.";
  }

  if (currentFilter === "pending") {
    return "No pending tasks. Great job staying on top of your work.";
  }

  if (currentFilter === "completed") {
    return "No completed tasks yet. Finish a task and it will appear here.";
  }

  if (currentPriorityFilter !== "all") {
    return `No ${currentPriorityFilter} priority tasks found.`;
  }

  return "No matching tasks found.";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEditMode(task) {
  const priority = task.priority || "medium";

  return `
    <div class="edit-form">
      <input id="edit-title-${task.id}" type="text" value="${escapeHtml(task.title || "")}" />

      <select id="edit-priority-${task.id}">
        <option value="low" ${priority === "low" ? "selected" : ""}>Low Priority</option>
        <option value="medium" ${priority === "medium" ? "selected" : ""}>Medium Priority</option>
        <option value="high" ${priority === "high" ? "selected" : ""}>High Priority</option>
      </select>

      <input id="edit-due-${task.id}" type="date" value="${task.dueDate || ""}" />

      <div class="edit-actions">
        <button class="save-edit-btn" data-id="${task.id}">Save</button>
        <button class="cancel-edit-btn" data-id="${task.id}">Cancel</button>
      </div>
    </div>
  `;
}

function renderSubjectTracker() {
  const container = document.getElementById("subject-tracker-list");

  if (!container) return;

  if (latestSessions.length === 0) {
    container.innerHTML = '<p class="empty-subject">No sessions yet.</p>';
    return;
  }

  const subjectMap = {};

  latestSessions.forEach((session) => {
    const subject = session.subject || "Unknown";

    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        count: 0,
        minutes: 0
      };
    }

    subjectMap[subject].count += 1;

    if (session.startTime && session.endTime) {
      const [sh, sm] = session.startTime.split(":").map(Number);
      const [eh, em] = session.endTime.split(":").map(Number);

      const duration = (eh * 60 + em) - (sh * 60 + sm);
      if (duration > 0) {
        subjectMap[subject].minutes += duration;
      }
    }
  });

  container.innerHTML = "";

  Object.entries(subjectMap)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([subject, data]) => {
      const hours = (data.minutes / 60).toFixed(1);

      const warning =
        data.count <= 1
          ? `<span class="subject-warning">⚠ Needs attention</span>`
          : "";

      const div = document.createElement("div");
      div.className = "subject-card";

      div.innerHTML = `
        <strong>${subject}</strong>
        <div class="subject-meta">
          ${data.count} session(s) • ${hours}h planned ${warning}
        </div>
      `;

      container.appendChild(div);
    });
}

function renderWeeklyPlan() {
  const container = document.getElementById("weekly-plan-list");
  if (!container) return;

  if (latestSessions.length === 0) {
    container.innerHTML = '<p class="empty-subject">No sessions planned.</p>';
    return;
  }

  const sorted = [...latestSessions].sort((a, b) => {
    return (a.date || "").localeCompare(b.date || "");
  });

  container.innerHTML = "";

  sorted.slice(0, 6).forEach((session) => {
    const div = document.createElement("div");
    div.className = "plan-item";

    div.innerHTML = `
      <strong>${session.subject}</strong>
      <div class="plan-date">
        ${formatSessionDate(session.date)} • ${formatSessionTime(session.startTime, session.endTime)}
      </div>
    `;

    container.appendChild(div);
  });
}

function renderHeatmap() {
  const grid = document.getElementById("heatmap-grid");
  const activeDaysText = document.getElementById("heatmap-active-days");
  const totalSessionsText = document.getElementById("heatmap-total-sessions");
  const bestDayText = document.getElementById("heatmap-best-day");
  const consistencyScoreText = document.getElementById("heatmap-consistency-score");

  if (!grid) return;

  grid.innerHTML = "";

  const sessionCountByDate = {};

  latestSessions.forEach((session) => {
    if (!session.date) return;

    sessionCountByDate[session.date] = (sessionCountByDate[session.date] || 0) + 1;
  });

  const today = new Date();
  let activeDays = 0;
  let totalSessions = 0;
  let bestDay = "-";
  let bestDayCount = 0;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const sessionCount = sessionCountByDate[dateKey] || 0;

    if (sessionCount > 0) {
      activeDays += 1;
      totalSessions += sessionCount;
    }

    if (sessionCount > bestDayCount) {
      bestDayCount = sessionCount;
      bestDay = formatSessionDate(dateKey);
    }

    const cell = document.createElement("div");
    cell.className = "heatmap-cell";

    if (sessionCount >= 3) {
      cell.classList.add("heatmap-high");
    } else if (sessionCount === 2) {
      cell.classList.add("heatmap-medium");
    } else if (sessionCount === 1) {
      cell.classList.add("heatmap-low");
    }

    cell.title = `${formatSessionDate(dateKey)} • ${sessionCount} planned session(s)`;

    grid.appendChild(cell);
  }

  const consistencyScore = Math.round((activeDays / 30) * 100);

  if (activeDaysText) activeDaysText.textContent = activeDays;
  if (totalSessionsText) totalSessionsText.textContent = totalSessions;
  if (bestDayText) bestDayText.textContent = bestDay;
  if (consistencyScoreText) consistencyScoreText.textContent = `${consistencyScore}%`;
}

function renderSessions() {
  sessionList.innerHTML = "";

  if (latestSessions.length === 0) {
    sessionList.innerHTML =
      '<li class="empty-session">No study sessions planned yet. Add your first session above.</li>';
    return;
  }

  const sortedSessions = [...latestSessions].sort((a, b) => {
    const dateCompare = (a.date || "").localeCompare(b.date || "");
    if (dateCompare !== 0) return dateCompare;

    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  sortedSessions.forEach((session) => {
    const li = document.createElement("li");
    li.className = "session-item";

    if (isSessionInPast(session)) {
      li.classList.add("past-session");
    }

    const sessionInfo = document.createElement("div");
    sessionInfo.className = "session-info";

    const title = document.createElement("strong");
    title.textContent = session.subject || "Untitled session";

    const dateText = document.createElement("span");
    dateText.textContent = formatSessionDate(session.date || "");

    const timeText = document.createElement("span");
    timeText.textContent = formatSessionTime(session.startTime || "", session.endTime || "");

    sessionInfo.appendChild(title);
    sessionInfo.appendChild(dateText);
    sessionInfo.appendChild(timeText);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "session-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteSession(session.id, session.subject || "Untitled session");
    });

    li.appendChild(sessionInfo);
    li.appendChild(deleteBtn);

    sessionList.appendChild(li);
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  updateStats();

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-task">${getEmptyStateMessage()}</li>`;
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    if (editingTaskId === task.id) {
      li.innerHTML = renderEditMode(task);
      taskList.appendChild(li);
      return;
    }

    const priority = task.priority || "medium";
    const dueInfo = getDueStatus(task.dueDate || "");

    const taskContent = document.createElement("div");
    taskContent.className = "task-content";

    const taskTitle = document.createElement("span");
    taskTitle.textContent = task.title;
    taskTitle.className = "task-title";

    if (task.completed) {
      taskTitle.classList.add("completed");
    }

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${priority}`;
    priorityBadge.textContent = `${formatPriority(priority)} Priority`;

    const dueDateBadge = document.createElement("span");
    dueDateBadge.className = `due-date-badge ${dueInfo.className}`;
    dueDateBadge.textContent = dueInfo.text;

    taskMeta.appendChild(priorityBadge);
    taskMeta.appendChild(dueDateBadge);

    taskContent.appendChild(taskTitle);
    taskContent.appendChild(taskMeta);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = "complete-btn";
    completeBtn.textContent = task.completed ? "Undo" : "Done";
    completeBtn.addEventListener("click", () => {
      toggleTaskComplete(task.id, task.completed);
    });

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      editingTaskId = task.id;
      renderTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id, task.title);
    });

    actionsDiv.appendChild(completeBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(taskContent);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });

  document.querySelectorAll(".save-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      saveEditedTask(button.dataset.id);
    });
  });

  document.querySelectorAll(".cancel-edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      editingTaskId = null;
      renderTasks();
    });
  });
}

function loadTasks(user) {
  if (unsubscribeTasks) {
    unsubscribeTasks();
    unsubscribeTasks = null;
  }

  setTaskLoading(true);
  taskList.innerHTML = "";

  const tasksRef = collection(db, "users", user.uid, "tasks");
  const tasksQuery = query(tasksRef, orderBy("createdAt", "desc"));

  unsubscribeTasks = onSnapshot(
    tasksQuery,
    (snapshot) => {
      latestTasks = [];

      snapshot.forEach((docSnap) => {
        latestTasks.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setTaskLoading(false);
      renderTasks();
    },
    (error) => {
      setTaskLoading(false);
      showToast(getFriendlyErrorMessage(error), "error");
    }
  );
}

function loadSessions(user) {
  if (unsubscribeSessions) {
    unsubscribeSessions();
    unsubscribeSessions = null;
  }

  setSessionLoading(true);
  sessionList.innerHTML = "";

  const sessionsRef = collection(db, "users", user.uid, "sessions");
  const sessionsQuery = query(sessionsRef);

  unsubscribeSessions = onSnapshot(
    sessionsQuery,
    (snapshot) => {
      latestSessions = [];

      snapshot.forEach((docSnap) => {
        latestSessions.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setSessionLoading(false);
      renderSessions();
      renderSubjectTracker();
      renderWeeklyPlan();
      renderHeatmap();
    },
    (error) => {
      console.error("Session listener error:", error);
      setSessionLoading(false);
      showToast(getFriendlyErrorMessage(error), "error");
    }
  );
}

function loadNotes(user) {
  if (unsubscribeNotes) {
    unsubscribeNotes();
    unsubscribeNotes = null;
  }

  setNotesLoading(true);

  const noteRef = doc(db, "users", user.uid, "notes", "main");

  unsubscribeNotes = onSnapshot(
    noteRef,
    (snapshot) => {
      if (snapshot.exists()) {
        notesInput.value = snapshot.data().content || "";
      } else {
        notesInput.value = "";
      }

      setNotesLoading(false);
    },
    (error) => {
      console.error("Notes listener error:", error);
      setNotesLoading(false);
      showToast(getFriendlyErrorMessage(error), "error");
    }
  );
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboardScreen();

    userEmailText.textContent = `Logged in as: ${user.email}`;

    loadTasks(user);
    loadNotes(user);
    loadSessions(user);
  } else {
    showLandingScreen();

    latestTasks = [];
    latestSessions = [];

    taskList.innerHTML = "";
    sessionList.innerHTML = "";

    renderSubjectTracker();
    renderWeeklyPlan();
    renderHeatmap();

    notesInput.value = "";
    notesMessage.textContent = "";
    taskMessage.textContent = "";
    sessionMessage.textContent = "";

    userEmailText.textContent = "Logged in as: -";

    currentFilter = "all";
    currentPriorityFilter = "all";
    currentSearch = "";
    editingTaskId = null;

    
    searchInput.value = "";
    priorityFilter.value = "all";

    sessionSubjectInput.value = "";
    sessionDateInput.value = "";
    sessionStartInput.value = "";
    sessionEndInput.value = "";

    filterButtons.forEach((btn) => {
      btn.classList.remove("active-filter");
      if (btn.dataset.filter === "all") btn.classList.add("active-filter");
    });

    setTaskLoading(false);
    setNotesLoading(false);
    setSessionLoading(false);
    resetTimer();
    updateStats();

    if (unsubscribeTasks) {
      unsubscribeTasks();
      unsubscribeTasks = null;
    }

    if (unsubscribeNotes) {
      unsubscribeNotes();
      unsubscribeNotes = null;
    }
 
    if (unsubscribeSessions) {
      unsubscribeSessions();
      unsubscribeSessions = null;
    }
  }
});