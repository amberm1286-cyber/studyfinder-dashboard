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

const commandNextSession = document.getElementById("command-next-session");
const commandNextSessionDetail = document.getElementById("command-next-session-detail");
const commandUrgentTask = document.getElementById("command-urgent-task");
const commandUrgentTaskDetail = document.getElementById("command-urgent-task-detail");
const commandFocusRecommendation = document.getElementById("command-focus-recommendation");
const commandFocusDetail = document.getElementById("command-focus-detail");
const commandFocusToday = document.getElementById("command-focus-today");
const commandFocusStreak = document.getElementById("command-focus-streak");
const commandUpcomingExam = document.getElementById("command-upcoming-exam");
const commandUpcomingExamDetail = document.getElementById("command-upcoming-exam-detail");
const commandBalanceScore = document.getElementById("command-balance-score");
const commandBalanceDetail = document.getElementById("command-balance-detail");

const todayCount = document.getElementById("today-count");
const smartOverdueCount = document.getElementById("smart-overdue-count");
const highPriorityCount = document.getElementById("high-priority-count");
const completionRate = document.getElementById("completion-rate");
const smartSuggestionTitle = document.getElementById("smart-suggestion-title");
const smartSuggestionText = document.getElementById("smart-suggestion-text");
const smartCoachChips = document.getElementById("smart-coach-chips");
const priorityQueueList = document.getElementById("priority-queue-list");

const sessionSubjectInput = document.getElementById("session-subject");
const sessionDateInput = document.getElementById("session-date");
const sessionStartInput = document.getElementById("session-start");
const sessionEndInput = document.getElementById("session-end");
const addSessionBtn = document.getElementById("add-session-btn");
const sessionMessage = document.getElementById("session-message");
const sessionLoading = document.getElementById("session-loading");
const sessionList = document.getElementById("session-list");

const examNameInput = document.getElementById("exam-name-input");
const examSubjectInput = document.getElementById("exam-subject-input");
const examDateInput = document.getElementById("exam-date-input");
const addExamBtn = document.getElementById("add-exam-btn");
const examMessage = document.getElementById("exam-message");
const examList = document.getElementById("exam-list");

const vaultTitleInput = document.getElementById("vault-title-input");
const vaultSubjectInput = document.getElementById("vault-subject-input");
const vaultUrlInput = document.getElementById("vault-url-input");
const addVaultResourceBtn = document.getElementById("add-vault-resource-btn");
const vaultMessage = document.getElementById("vault-message");
const vaultList = document.getElementById("vault-list");

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

const focusTotalSessions = document.getElementById("focus-total-sessions");
const focusTotalMinutes = document.getElementById("focus-total-minutes");
const focusToday = document.getElementById("focus-today");
const focusStreak = document.getElementById("focus-streak");
const focusLast7Minutes = document.getElementById("focus-last-7-minutes");
const focusBestDay = document.getElementById("focus-best-day");
const focusAverageActiveDay = document.getElementById("focus-average-active-day");
const focusScore = document.getElementById("focus-score");

const filterButtons = document.querySelectorAll(".filter-btn");
const toast = document.getElementById("toast");

let unsubscribeTasks = null;
let unsubscribeNotes = null;
let unsubscribeSessions = null;

let currentFilter = "all";
let currentPriorityFilter = "all";

let latestTasks = [];
let latestSessions = [];
let latestExams = [];
let latestVaultResources = [];

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

let focusSessionsCompleted = 0;
let focusMinutesCompleted = 0;
let focusTodayCompleted = 0;
let focusStreakCount = 0;

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

emailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loginBtn.click();
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loginBtn.click();
  }
});

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
  if (!element) return;

  element.textContent = message;

  if (type === "success") {
    element.style.color = "#22c55e";
  } else if (type === "warning") {
    element.style.color = "#facc15";
  } else {
    element.style.color = "#f87171";
  }
}

function setAuthButtonsLoading(isLoading) {
  signupBtn.disabled = isLoading;
  loginBtn.disabled = isLoading;
  googleLoginBtn.disabled = isLoading;

  signupBtn.textContent = isLoading ? "Please wait..." : "Sign Up";
  loginBtn.textContent = isLoading ? "Please wait..." : "Login";
  googleLoginBtn.textContent = isLoading ? "Please wait..." : "Continue with Google";
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

function isPreviousDate(previousDateString, currentDateString) {
  if (!previousDateString || !currentDateString) return false;

  const previousDate = new Date(previousDateString + "T00:00:00");
  const currentDate = new Date(currentDateString + "T00:00:00");

  const differenceInDays = Math.round(
    (currentDate - previousDate) / (1000 * 60 * 60 * 24)
  );

  return differenceInDays === 1;
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

function loadFocusHistory() {
  const savedHistory = localStorage.getItem("studyfinder-focus-history");

  if (!savedHistory) return [];

  try {
    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch (error) {
    localStorage.removeItem("studyfinder-focus-history");
    return [];
  }
}

function saveFocusHistory(history) {
  localStorage.setItem("studyfinder-focus-history", JSON.stringify(history));
}

function recordFocusHistorySession() {
  const history = loadFocusHistory();
  const todayKey = getTodayDateString();

  const todayEntry = history.find((entry) => entry.date === todayKey);

  if (todayEntry) {
    todayEntry.sessions += 1;
    todayEntry.minutes += 25;
  } else {
    history.push({
      date: todayKey,
      sessions: 1,
      minutes: 25
    });
  }

  const cleanedHistory = history
    .filter((entry) => entry.date && typeof entry.minutes === "number")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-60);

  saveFocusHistory(cleanedHistory);
}

function getLast7FocusDates() {
  const dates = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

function updateFocusUpgradeAnalytics() {
  if (!focusLast7Minutes) return;

  const history = loadFocusHistory();
  const last7Dates = getLast7FocusDates();

  const last7Entries = history.filter((entry) => {
    return last7Dates.includes(entry.date);
  });

  const last7Minutes = last7Entries.reduce((total, entry) => {
    return total + (entry.minutes || 0);
  }, 0);

  const activeDays = last7Entries.filter((entry) => {
    return (entry.minutes || 0) > 0;
  });

  const averageActiveDay =
    activeDays.length > 0 ? Math.round(last7Minutes / activeDays.length) : 0;

  const bestEntry = history.reduce((best, entry) => {
    if (!best || (entry.minutes || 0) > (best.minutes || 0)) {
      return entry;
    }

    return best;
  }, null);

  const focusScoreValue = Math.min(
    100,
    Math.round((last7Minutes / 350) * 70) + Math.min(30, focusStreakCount * 5)
  );

  focusLast7Minutes.textContent = last7Minutes;
  focusAverageActiveDay.textContent = averageActiveDay;
  focusScore.textContent = `${focusScoreValue}%`;

  if (bestEntry) {
    focusBestDay.textContent = `${formatSessionDate(bestEntry.date)} • ${bestEntry.minutes}m`;
  } else {
    focusBestDay.textContent = "-";
  }
}

function updateFocusAnalytics() {
  if (!focusTotalSessions) return;

  focusTotalSessions.textContent = focusSessionsCompleted;
  focusTotalMinutes.textContent = focusMinutesCompleted;
  focusToday.textContent = focusTodayCompleted;
  focusStreak.textContent = focusStreakCount;

  updateFocusUpgradeAnalytics();
  updateCommandCenter();
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
    const todayKeyForCompletedFocus = getTodayDateString();
    const lastFocusDate = localStorage.getItem("focusLastActiveDate");

    focusSessionsCompleted += 1;
    focusMinutesCompleted += 25;

    if (lastFocusDate === todayKeyForCompletedFocus) {
      focusTodayCompleted += 1;
    } else {
      focusTodayCompleted = 1;

      if (isPreviousDate(lastFocusDate, todayKeyForCompletedFocus)) {
        focusStreakCount += 1;
      } else {
        focusStreakCount = 1;
      }
    }

    localStorage.setItem("focusSessionsCompleted", focusSessionsCompleted);
    localStorage.setItem("focusMinutesCompleted", focusMinutesCompleted);
    localStorage.setItem("focusTodayCompleted", focusTodayCompleted);
    localStorage.setItem("focusStreakCount", focusStreakCount);
    localStorage.setItem("focusLastActiveDate", todayKeyForCompletedFocus);

    recordFocusHistorySession();
    updateFocusAnalytics();

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

function loadExamsFromStorage() {
  const savedExams = localStorage.getItem("studyfinder-exams");

  if (!savedExams) {
    latestExams = [];
    return;
  }

  try {
    const parsedExams = JSON.parse(savedExams);

    if (Array.isArray(parsedExams)) {
      latestExams = parsedExams;
    } else {
      latestExams = [];
    }
  } catch (error) {
    latestExams = [];
    localStorage.removeItem("studyfinder-exams");
  }
}

function saveExamsToStorage() {
  localStorage.setItem("studyfinder-exams", JSON.stringify(latestExams));
}

function getDaysUntilExam(examDate) {
  const today = new Date(getTodayDateString() + "T00:00:00");
  const exam = new Date(examDate + "T00:00:00");

  return Math.round((exam - today) / (1000 * 60 * 60 * 24));
}

function getExamUrgency(daysLeft) {
  if (daysLeft < 0) {
    return {
      label: "Past",
      className: "exam-past"
    };
  }

  if (daysLeft === 0) {
    return {
      label: "Today",
      className: "exam-today"
    };
  }

  if (daysLeft === 1) {
    return {
      label: "Tomorrow",
      className: "exam-tomorrow"
    };
  }

  if (daysLeft <= 7) {
    return {
      label: "This week",
      className: "exam-week"
    };
  }

  return {
    label: "Upcoming",
    className: "exam-upcoming"
  };
}

function getRevisionRecommendation(daysLeft) {
  if (daysLeft < 0) {
    return "Exam date has passed. Archive it or update the date if needed.";
  }

  if (daysLeft <= 3) {
    return "Revise high-priority topics, formulas, mistakes, and weak areas first.";
  }

  if (daysLeft <= 7) {
    return "Plan daily revision blocks and solve practice questions regularly.";
  }

  return "Schedule weekly preparation so the subject stays active before exam week.";
}

function formatDaysLeft(daysLeft) {
  if (daysLeft < 0) return `${Math.abs(daysLeft)} day(s) ago`;
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

function getUpcomingExams() {

  if (!Array.isArray(latestExams)) return [];

  return latestExams
    .filter((exam) => {
      return getDaysUntilExam(exam.date) >= 0;
    })
    .sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
}

function getNextSession() {

  if (!Array.isArray(latestSessions)) return null;

  const upcomingSessions = latestSessions
    .filter((session) => {
      return session.date && !isSessionInPast(session);
    })
    .sort((a, b) => {
      return (
        a.date.localeCompare(b.date) ||
        (a.startTime || "").localeCompare(b.startTime || "")
      );
    });

  return upcomingSessions[0] || null;
}

function getMostUrgentTask() {

  if (!Array.isArray(latestTasks)) return null;

  const pendingTasks = latestTasks.filter((task) => !task.completed);

  if (pendingTasks.length === 0) return null;

  return pendingTasks.sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate, a.completed) ? 1 : 0;
    const bOverdue = isOverdue(b.dueDate, b.completed) ? 1 : 0;

    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    const aToday = isDueToday(a.dueDate, a.completed) ? 1 : 0;
    const bToday = isDueToday(b.dueDate, b.completed) ? 1 : 0;

    if (aToday !== bToday) return bToday - aToday;

    const priorityDifference = getPriorityScore(b.priority) - getPriorityScore(a.priority);

    if (priorityDifference !== 0) return priorityDifference;

    return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
  })[0];
}

function calculateStudyBalanceScore() {

  if (!Array.isArray(latestTasks) || !Array.isArray(latestSessions)) {
    return 0;
  }

  const totalTasks = latestTasks.length;
  const completedTasks = latestTasks.filter((task) => task.completed).length;
  const pendingTasks = latestTasks.filter((task) => !task.completed).length;
  const overdueTasks = latestTasks.filter((task) => {
    return isOverdue(task.dueDate, task.completed);
  }).length;

  const upcomingSessions = latestSessions.filter((session) => {
    return session.date && !isSessionInPast(session);
  }).length;

  const upcomingExams = getUpcomingExams().length;

  let score = 0;

  if (totalTasks > 0) {
    score += Math.round((completedTasks / totalTasks) * 35);
  }

  if (upcomingSessions > 0) {
    score += 20;
  }

  if (focusTodayCompleted > 0) {
    score += 20;
  }

  if (upcomingExams > 0) {
    score += 15;
  }

  if (pendingTasks > 0 && overdueTasks === 0) {
    score += 10;
  }

  if (overdueTasks > 0) {
    score -= Math.min(25, overdueTasks * 8);
  }

  return Math.max(0, Math.min(100, score));
}

function updateCommandCenter() {
  if (
    !commandNextSession ||
    !Array.isArray(latestTasks) ||
    !Array.isArray(latestSessions) ||
    !Array.isArray(latestExams)
  ) return;

  const nextSession = getNextSession();
  const urgentTask = getMostUrgentTask();
  const upcomingExam = getUpcomingExams()[0] || null;
  const balanceScore = calculateStudyBalanceScore();

  if (nextSession) {
    commandNextSession.textContent = nextSession.subject || "Study session";
    commandNextSessionDetail.textContent = `${formatSessionDate(nextSession.date)} • ${formatSessionTime(
      nextSession.startTime,
      nextSession.endTime
    )}`;
  } else {
    commandNextSession.textContent = "No session planned";
    commandNextSessionDetail.textContent = "Add a study session to organize your day.";
  }

  if (urgentTask) {
    commandUrgentTask.textContent = urgentTask.title || "Untitled task";

    if (isOverdue(urgentTask.dueDate, urgentTask.completed)) {
      commandUrgentTaskDetail.textContent = "Overdue — handle this first.";
    } else if (isDueToday(urgentTask.dueDate, urgentTask.completed)) {
      commandUrgentTaskDetail.textContent = "Due today — complete before lower priority tasks.";
    } else if (urgentTask.dueDate) {
      commandUrgentTaskDetail.textContent = `Due ${formatSessionDate(urgentTask.dueDate)} • ${urgentTask.priority || "medium"} priority`;
    } else {
      commandUrgentTaskDetail.textContent = `${urgentTask.priority || "medium"} priority • No due date`;
    }
  } else {
    commandUrgentTask.textContent = "No urgent task";
    commandUrgentTaskDetail.textContent = "Your pending tasks are clear.";
  }

  if (focusTodayCompleted === 0) {
    commandFocusRecommendation.textContent = "Start one Pomodoro";
    commandFocusDetail.textContent = "Complete one focus cycle to build momentum today.";
  } else if (focusTodayCompleted < 3) {
    commandFocusRecommendation.textContent = "Keep momentum";
    commandFocusDetail.textContent = `You completed ${focusTodayCompleted} focus cycle(s) today. Try reaching 3.`;
  } else {
    commandFocusRecommendation.textContent = "Strong focus day";
    commandFocusDetail.textContent = "You already built solid focus momentum today.";
  }

  commandFocusToday.textContent = `${focusTodayCompleted} cycle(s)`;
  commandFocusStreak.textContent =
    focusStreakCount > 0 ? `${focusStreakCount}-day focus streak` : "No streak yet.";

  if (upcomingExam) {
    const daysLeft = getDaysUntilExam(upcomingExam.date);
    commandUpcomingExam.textContent = upcomingExam.name;
    commandUpcomingExamDetail.textContent = `${upcomingExam.subject} • ${formatDaysLeft(daysLeft)}`;
  } else {
    commandUpcomingExam.textContent = "No exam added";
    commandUpcomingExamDetail.textContent = "Add exams to activate revision mode.";
  }

  commandBalanceScore.textContent = `${balanceScore}%`;

  if (balanceScore >= 80) {
    commandBalanceDetail.textContent = "Excellent control. Keep your routine consistent.";
  } else if (balanceScore >= 55) {
    commandBalanceDetail.textContent = "Good progress. Improve consistency and focus time.";
  } else if (balanceScore >= 30) {
    commandBalanceDetail.textContent = "Needs structure. Add sessions and clear urgent tasks.";
  } else {
    commandBalanceDetail.textContent = "Low structure. Start with one task and one study session.";
  }
}

function renderExams() {
  if (!examList) return;

  examList.innerHTML = "";

  if (!Array.isArray(latestExams) || latestExams.length === 0) {
    examList.innerHTML = `<p class="empty-exams">No exams added yet.</p>`;
    updateCommandCenter();
    return;
  }

  const sortedExams = [...latestExams].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });

  sortedExams.forEach((exam) => {
    const daysLeft = getDaysUntilExam(exam.date);
    const urgency = getExamUrgency(daysLeft);
    const recommendation = getRevisionRecommendation(daysLeft);

    const examCard = document.createElement("div");
    examCard.className = "exam-card";

    examCard.innerHTML = `
      <div class="exam-card-main">
        <div>
          <h4>${exam.name}</h4>
          <p>${exam.subject}</p>
          <span>${formatSessionDate(exam.date)}</span>
        </div>

        <div class="exam-countdown-box">
          <strong>${formatDaysLeft(daysLeft)}</strong>
          <span class="${urgency.className}">${urgency.label}</span>
        </div>
      </div>

      <p class="revision-tip">${recommendation}</p>

      <button class="delete-exam-btn" data-id="${exam.id}">Delete Exam</button>
    `;

    examList.appendChild(examCard);
  });

  document.querySelectorAll(".delete-exam-btn").forEach((button) => {
    button.addEventListener("click", () => {
      deleteExam(button.dataset.id);
    });
  });

  updateCommandCenter();
}

function addExam() {
  const examName = examNameInput.value.trim();
  const examSubject = examSubjectInput.value.trim();
  const examDate = examDateInput.value;

  if (examName === "") {
    showMessage(examMessage, "Please enter the exam name.", "error");
    showToast("Please enter the exam name.", "error");
    return;
  }

  if (examSubject === "") {
    showMessage(examMessage, "Please enter the exam subject.", "error");
    showToast("Please enter the exam subject.", "error");
    return;
  }

  if (examDate === "") {
    showMessage(examMessage, "Please select the exam date.", "error");
    showToast("Please select the exam date.", "error");
    return;
  }

  const duplicateExam = latestExams.some((exam) => {
    return (
      exam.name.trim().toLowerCase() === examName.toLowerCase() &&
      exam.subject.trim().toLowerCase() === examSubject.toLowerCase() &&
      exam.date === examDate
    );
  });

  if (duplicateExam) {
    showMessage(examMessage, "This exam already exists.", "warning");
    showToast("This exam already exists.", "warning");
    return;
  }

  latestExams.push({
    id: crypto.randomUUID(),
    name: examName,
    subject: examSubject,
    date: examDate,
    createdAt: new Date().toISOString()
  });

  saveExamsToStorage();
  renderExams();

  examNameInput.value = "";
  examSubjectInput.value = "";
  examDateInput.value = "";

  showMessage(examMessage, "Exam added successfully.", "success");
  showToast("Exam added successfully.", "success");
}

function deleteExam(examId) {
  const examToDelete = latestExams.find((exam) => exam.id === examId);

  if (!examToDelete) return;

  const confirmed = confirm(`Delete "${examToDelete.name}" from Exam Countdown?`);

  if (!confirmed) return;

  latestExams = latestExams.filter((exam) => exam.id !== examId);

  saveExamsToStorage();
  renderExams();

  showMessage(examMessage, "Exam deleted.", "success");
  showToast("Exam deleted.", "success");
}

function loadVaultFromStorage() {
  const savedResources = localStorage.getItem("studyfinder-vault");

  if (!savedResources) {
    latestVaultResources = [];
    return;
  }

  try {
    const parsedResources = JSON.parse(savedResources);

    if (Array.isArray(parsedResources)) {
      latestVaultResources = parsedResources;
    } else {
      latestVaultResources = [];
    }
  } catch (error) {
    latestVaultResources = [];
    localStorage.removeItem("studyfinder-vault");
  }
}

function saveVaultToStorage() {
  localStorage.setItem("studyfinder-vault", JSON.stringify(latestVaultResources));
}

function isValidResourceUrl(urlValue) {
  try {
    const url = new URL(urlValue);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function renderVaultResources() {
  if (!vaultList) return;

  vaultList.innerHTML = "";

  if (!Array.isArray(latestVaultResources) || latestVaultResources.length === 0) {
    vaultList.innerHTML = `<p class="empty-vault">No resources saved yet.</p>`;
    return;
  }

  const sortedResources = [...latestVaultResources].sort((a, b) => {
    return a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title);
  });

  sortedResources.forEach((resource) => {
    const resourceCard = document.createElement("div");
    resourceCard.className = "vault-card";

    resourceCard.innerHTML = `
      <div class="vault-card-content">
        <div>
          <h4>${resource.title}</h4>
          <p>${resource.subject}</p>
          <span>${resource.url}</span>
        </div>

        <div class="vault-actions">
          <a href="${resource.url}" target="_blank" rel="noopener noreferrer">Open</a>
          <button class="delete-vault-btn" data-id="${resource.id}">Delete</button>
        </div>
      </div>
    `;

    vaultList.appendChild(resourceCard);
  });

  document.querySelectorAll(".delete-vault-btn").forEach((button) => {
    button.addEventListener("click", () => {
      deleteVaultResource(button.dataset.id);
    });
  });
}

function addVaultResource() {
  const title = vaultTitleInput.value.trim();
  const subject = vaultSubjectInput.value.trim();
  const url = vaultUrlInput.value.trim();

  if (title === "") {
    showMessage(vaultMessage, "Please enter a resource title.", "error");
    showToast("Please enter a resource title.", "error");
    return;
  }

  if (subject === "") {
    showMessage(vaultMessage, "Please enter a subject.", "error");
    showToast("Please enter a subject.", "error");
    return;
  }

  if (url === "") {
    showMessage(vaultMessage, "Please enter a resource URL.", "error");
    showToast("Please enter a resource URL.", "error");
    return;
  }

  if (!isValidResourceUrl(url)) {
    showMessage(vaultMessage, "Please enter a valid URL starting with http:// or https://.", "error");
    showToast("Please enter a valid URL.", "error");
    return;
  }

  const duplicateResource = latestVaultResources.some((resource) => {
    return resource.url.trim().toLowerCase() === url.toLowerCase();
  });

  if (duplicateResource) {
    showMessage(vaultMessage, "This resource is already saved.", "warning");
    showToast("This resource is already saved.", "warning");
    return;
  }

  latestVaultResources.push({
    id: crypto.randomUUID(),
    title,
    subject,
    url,
    createdAt: new Date().toISOString()
  });

  saveVaultToStorage();
  renderVaultResources();

  vaultTitleInput.value = "";
  vaultSubjectInput.value = "";
  vaultUrlInput.value = "";

  showMessage(vaultMessage, "Resource saved successfully.", "success");
  showToast("Resource saved successfully.", "success");
}

function deleteVaultResource(resourceId) {
  const resourceToDelete = latestVaultResources.find((resource) => resource.id === resourceId);

  if (!resourceToDelete) return;

  const confirmed = confirm(`Delete "${resourceToDelete.title}" from Study Vault?`);

  if (!confirmed) return;

  latestVaultResources = latestVaultResources.filter((resource) => resource.id !== resourceId);

  saveVaultToStorage();
  renderVaultResources();

  showMessage(vaultMessage, "Resource deleted.", "success");
  showToast("Resource deleted.", "success");
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

const savedFocusSessions = localStorage.getItem("focusSessionsCompleted");
const savedFocusMinutes = localStorage.getItem("focusMinutesCompleted");
const savedFocusToday = localStorage.getItem("focusTodayCompleted");
const savedFocusStreak = localStorage.getItem("focusStreakCount");
const savedFocusLastDate = localStorage.getItem("focusLastActiveDate");

const todayKeyForFocus = getTodayDateString();

focusSessionsCompleted = savedFocusSessions ? parseInt(savedFocusSessions, 10) : 0;
focusMinutesCompleted = savedFocusMinutes ? parseInt(savedFocusMinutes, 10) : 0;

if (savedFocusLastDate === todayKeyForFocus) {
  focusTodayCompleted = savedFocusToday ? parseInt(savedFocusToday, 10) : 0;
  focusStreakCount = savedFocusStreak ? parseInt(savedFocusStreak, 10) : 0;
} else {
  focusTodayCompleted = 0;

  if (isPreviousDate(savedFocusLastDate, todayKeyForFocus)) {
    focusStreakCount = savedFocusStreak ? parseInt(savedFocusStreak, 10) : 0;
  } else {
    focusStreakCount = 0;
  }

  localStorage.setItem("focusTodayCompleted", focusTodayCompleted);
  localStorage.setItem("focusStreakCount", focusStreakCount);
}

updateFocusAnalytics();

loadExamsFromStorage();
renderExams();

loadVaultFromStorage();
renderVaultResources();

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

  if (!email || !password) {
    showMessage(authMessage, "Please enter both email and password.", "error");
    showToast("Please enter both email and password.", "error");
    return;
  }

  try {
    setAuthButtonsLoading(true);

    await createUserWithEmailAndPassword(auth, email, password);

    showMessage(authMessage, "Account created successfully.", "success");
    showToast("Account created successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  } finally {
    setAuthButtonsLoading(false);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage(authMessage, "Please enter both email and password.", "error");
    showToast("Please enter both email and password.", "error");
    return;
  }

  try {
    setAuthButtonsLoading(true);

    await signInWithEmailAndPassword(auth, email, password);

    showMessage(authMessage, "Logged in successfully.", "success");
    showToast("Logged in successfully.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  } finally {
    setAuthButtonsLoading(false);
  }
});

googleLoginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    setAuthButtonsLoading(true);

    await signInWithPopup(auth, provider);

    showToast("Google login successful.", "success");
  } catch (error) {
    const message = getFriendlyErrorMessage(error);
    showMessage(authMessage, message, "error");
    showToast(message, "error");
  } finally {
    setAuthButtonsLoading(false);
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

addExamBtn.addEventListener("click", () => {
  addExam();
});

examNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addExamBtn.click();
  }
});

examSubjectInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addExamBtn.click();
  }
});

addVaultResourceBtn.addEventListener("click", () => {
  addVaultResource();
});

vaultTitleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addVaultResourceBtn.click();
  }
});

vaultSubjectInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addVaultResourceBtn.click();
  }
});

vaultUrlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addVaultResourceBtn.click();
  }
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
  const todayKey = getTodayDateString();

  const dueTodayTasks = latestTasks.filter((task) => {
    return isDueToday(task.dueDate, task.completed);
  });

  const highPriorityPending = latestTasks.filter((task) => {
    return !task.completed && (task.priority || "medium") === "high";
  });

  const pendingTasks = latestTasks.filter((task) => !task.completed);

  const upcomingSessions = latestSessions.filter((session) => {
    return session.date && !isSessionInPast(session);
  });

  const todaySessions = latestSessions.filter((session) => {
    return session.date === todayKey;
  });

  const subjectCounts = {};

  latestSessions.forEach((session) => {
    const subject = (session.subject || "Unknown").trim();

    if (!subjectCounts[subject]) {
      subjectCounts[subject] = 0;
    }

    subjectCounts[subject] += 1;
  });

  const subjectEntries = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]);
  const strongestSubject = subjectEntries.length > 0 ? subjectEntries[0] : null;
  const totalPlannedSessions = latestSessions.length;

  const subjectConcentration =
    strongestSubject && totalPlannedSessions > 0
      ? Math.round((strongestSubject[1] / totalPlannedSessions) * 100)
      : 0;

  const last30Days = [];
  const sessionCountByDate = {};

  latestSessions.forEach((session) => {
    if (!session.date) return;

    if (!sessionCountByDate[session.date]) {
      sessionCountByDate[session.date] = 0;
    }

    sessionCountByDate[session.date] += 1;
  });

  for (let index = 29; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    last30Days.push(`${year}-${month}-${day}`);
  }

  const activeStudyDays = last30Days.filter((dateKey) => {
    return sessionCountByDate[dateKey] > 0;
  }).length;

  const consistencyScore = Math.round((activeStudyDays / 30) * 100);

  todayCount.textContent = dueTodayTasks.length;
  smartOverdueCount.textContent = overdue;
  highPriorityCount.textContent = highPriorityPending.length;
  completionRate.textContent = `${percentage}%`;

  let coachTitle = "Ready to focus?";
  let coachMessage = "Add your tasks and StudyFinder will suggest what to focus on first.";
  const coachChips = [];

  if (overdue > 0) {
    coachTitle = "Start with overdue tasks";
    coachMessage = `You have ${overdue} overdue task(s). Clear the most urgent overdue work before planning anything new.`;
    coachChips.push("Overdue work");
  } else if (highPriorityPending.length > 0 && todaySessions.length === 0) {
    coachTitle = "High priority work needs a focus block";
    coachMessage = `You have ${highPriorityPending.length} high priority pending task(s), but no study session planned for today. Schedule one focused block.`;
    coachChips.push("High priority");
    coachChips.push("No session today");
  } else if (dueTodayTasks.length > 0 && focusTodayCompleted === 0) {
    coachTitle = "Today needs a Pomodoro";
    coachMessage = `You have ${dueTodayTasks.length} task(s) due today and no completed focus cycle yet. Start one Pomodoro before doing lower-priority work.`;
    coachChips.push("Due today");
    coachChips.push("0 focus cycles");
  } else if (subjectConcentration >= 70 && subjectEntries.length > 1) {
    coachTitle = "Your study plan is concentrated";
    coachMessage = `${strongestSubject[0]} has most of your planned sessions. Add one session for a weaker subject to keep your schedule balanced.`;
    coachChips.push("Subject balance");
    coachChips.push(`${subjectConcentration}% one subject`);
  } else if (upcomingSessions.length === 0 && pending > 0) {
    coachTitle = "Plan your next study session";
    coachMessage = `You have ${pending} pending task(s), but no upcoming study sessions. Add one session to turn tasks into a real schedule.`;
    coachChips.push("No upcoming sessions");
  } else if (consistencyScore < 25 && totalPlannedSessions > 0) {
    coachTitle = "Build more consistency";
    coachMessage = `Your 30-day consistency is ${consistencyScore}%. Try planning shorter study blocks across more days instead of only a few heavy days.`;
    coachChips.push("Low consistency");
    coachChips.push(`${consistencyScore}% routine`);
  } else if (pendingTasks.length > 0) {
    coachTitle = "Choose one task and finish it";
    coachMessage = `You have ${pending} pending task(s). Pick the highest priority task with the nearest deadline and complete it first.`;
    coachChips.push("Next best task");
  } else if (total > 0 && completed === total) {
    coachTitle = "Good balance — keep going";
    coachMessage = "All tasks are complete. Review your notes, maintain your streak, or plan tomorrow’s study block.";
    coachChips.push("Tasks complete");
    coachChips.push("Review mode");
  }

  if (focusStreakCount > 0) {
    coachChips.push(`${focusStreakCount}-day focus streak`);
  }

  if (upcomingSessions.length > 0) {
    coachChips.push(`${upcomingSessions.length} upcoming session(s)`);
  }

  smartSuggestionTitle.textContent = coachTitle;
  smartSuggestionText.textContent = coachMessage;

  if (smartCoachChips) {
    smartCoachChips.innerHTML = "";

    const limitedChips = coachChips.slice(0, 3);

    if (limitedChips.length === 0) {
      smartCoachChips.innerHTML = "<span>No insights yet</span>";
    } else {
      limitedChips.forEach((chipText) => {
        const chip = document.createElement("span");
        chip.textContent = chipText;
        smartCoachChips.appendChild(chip);
      });
    }
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
  if (!Array.isArray(latestTasks) || latestTasks.length === 0) {
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

function getSessionDurationText(startTime, endTime) {
  if (!startTime || !endTime) return "Duration not set";

  const startParts = startTime.split(":").map(Number);
  const endParts = endTime.split(":").map(Number);

  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  const durationMinutes = endMinutes - startMinutes;

  if (durationMinutes <= 0) return "Invalid duration";

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function getSessionGroup(session) {
  if (!session.date) {
    return {
      key: "upcoming",
      title: "Upcoming",
      label: "No date"
    };
  }

  const todayKey = getTodayDateString();

  const tomorrow = new Date(todayKey + "T00:00:00");
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const tomorrowDay = String(tomorrow.getDate()).padStart(2, "0");
  const tomorrowKey = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;

  if (session.date === todayKey) {
    return {
      key: "today",
      title: "Today",
      label: "Today"
    };
  }

  if (session.date === tomorrowKey) {
    return {
      key: "tomorrow",
      title: "Tomorrow",
      label: "Tomorrow"
    };
  }

  if (session.date < todayKey) {
    return {
      key: "past",
      title: "Past",
      label: "Past"
    };
  }

  return {
    key: "upcoming",
    title: "Upcoming",
    label: "Upcoming"
  };
}

function createSessionCalendarCard(session) {
  const li = document.createElement("li");
  li.className = "calendar-session-item";

  if (isSessionInPast(session)) {
    li.classList.add("past-session");
  }

  const group = getSessionGroup(session);
  const durationText = getSessionDurationText(session.startTime, session.endTime);

  const sessionInfo = document.createElement("div");
  sessionInfo.className = "calendar-session-info";

  const title = document.createElement("strong");
  title.textContent = session.subject || "Untitled session";

  const meta = document.createElement("div");
  meta.className = "calendar-session-meta";

  const dateBadge = document.createElement("span");
  dateBadge.className = `session-date-chip ${group.key}-session-chip`;
  dateBadge.textContent = group.label;

  const dateText = document.createElement("span");
  dateText.textContent = formatSessionDate(session.date || "");

  const timeText = document.createElement("span");
  timeText.textContent = formatSessionTime(session.startTime, session.endTime);

  const durationBadge = document.createElement("span");
  durationBadge.className = "session-duration-chip";
  durationBadge.textContent = durationText;

  meta.appendChild(dateBadge);
  meta.appendChild(dateText);
  meta.appendChild(timeText);
  meta.appendChild(durationBadge);

  sessionInfo.appendChild(title);
  sessionInfo.appendChild(meta);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "session-delete-btn calendar-delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    deleteSession(session.id, session.subject || "Untitled session");
  });

  li.appendChild(sessionInfo);
  li.appendChild(deleteBtn);

  return li;
}

function renderSessions() {
  sessionList.innerHTML = "";

  if (!Array.isArray(latestSessions) || latestSessions.length === 0) {
    sessionList.innerHTML =
      '<li class="empty-session">No study sessions planned yet. Add your first session above.</li>';
    updateCommandCenter();
    return;
  }

  const sortedSessions = [...latestSessions].sort((a, b) => {
    const dateCompare = (a.date || "").localeCompare(b.date || "");
    if (dateCompare !== 0) return dateCompare;

    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  const groups = {
    today: [],
    tomorrow: [],
    upcoming: [],
    past: []
  };

  sortedSessions.forEach((session) => {
    const group = getSessionGroup(session);
    groups[group.key].push(session);
  });

  const groupOrder = [
    {
      key: "today",
      title: "Today"
    },
    {
      key: "tomorrow",
      title: "Tomorrow"
    },
    {
      key: "upcoming",
      title: "Upcoming"
    },
    {
      key: "past",
      title: "Past"
    }
  ];

  groupOrder.forEach((groupInfo) => {
    const groupSessions = groups[groupInfo.key];

    if (groupSessions.length === 0) return;

    const groupHeader = document.createElement("li");
    groupHeader.className = `calendar-session-group ${groupInfo.key}-session-group`;
    groupHeader.innerHTML = `
      <div>
        <span>${groupInfo.title}</span>
        <strong>${groupSessions.length} session(s)</strong>
      </div>
    `;

    sessionList.appendChild(groupHeader);

    groupSessions.forEach((session) => {
      sessionList.appendChild(createSessionCalendarCard(session));
    });
  });

  updateCommandCenter();
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

  updateCommandCenter();
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

    if (examMessage) {
      examMessage.textContent = "";
    }

    if (vaultMessage) {
      vaultMessage.textContent = "";
    }

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