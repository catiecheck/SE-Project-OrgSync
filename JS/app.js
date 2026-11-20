
const API_URL = "http://localhost:5000/api/events";
const REGISTRATION_URL = "http://localhost:5000/api/registrations";
const DEMO_STUDENT_ID = "demo-student-001";

// Retrieve upcoming events from the OrgSync backend
async function getEvents(organizationName = "") {
    try {
        const url = new URL(API_URL);

        if (organizationName) {
            url.searchParams.set("organization", organizationName);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();
        console.log("Events retrieved successfully:", events);

        return events;
    } catch (error) {
        console.error("Error retrieving events:", error);
        return [];
    }
}

// Retrieve registrations for the demo student
async function getStudentRegistrations() {
    const response = await fetch(
        `${REGISTRATION_URL}/student/${encodeURIComponent(DEMO_STUDENT_ID)}`
    );

    if (!response.ok) {
        throw new Error("Failed to retrieve registrations");
    }

    return await response.json();
}

// Display the details of a selected event
function displayEventDetails(event) {
    const detailsSection = document.getElementById("event-details");

    detailsSection.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    const organization = document.createElement("p");
    organization.textContent = `Organization: ${event.organization}`;

    const location = document.createElement("p");
    location.textContent = `Location: ${event.location}`;

    const date = document.createElement("p");
    date.textContent = `Date: ${new Date(event.date).toLocaleString()}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${event.status}`;

    detailsSection.append(
        title,
        description,
        organization,
        location,
        date,
        status
    );

    // Register for the selected event
    const registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.textContent = "Register for Event";

    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");

    // Check whether the demo student is already registered
    getStudentRegistrations()
        .then(registrations => {
            const alreadyRegistered = registrations.some(
                registration =>
                    registration.event &&
                    registration.event._id === event._id &&
                    registration.status === "registered"
            );

            if (alreadyRegistered) {
                registerButton.textContent = "Registered";
                registerButton.disabled = true;
                feedback.textContent = "You are already registered for this event.";
            }
        })
        .catch(error => {
            console.error("Unable to check registration status:", error);
        });

    registerButton.addEventListener("click", async () => {
        registerButton.disabled = true;
        feedback.textContent = "Registering...";

        try {
            const response = await fetch(REGISTRATION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId: event._id,
                    studentId: DEMO_STUDENT_ID
                })
            });

            const result = await response.json();

            if (response.status === 409) {
                feedback.textContent =
                    "You are already registered for this event.";
                registerButton.textContent = "Registered";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration failed"
                );
            }

            feedback.textContent = "Registration successful!";
            registerButton.textContent = "Registered";

        } catch (error) {
            feedback.textContent = error.message;
        } finally {
            if (registerButton.textContent !== "Registered") {
                registerButton.disabled = false;
            }
        }
    });

    detailsSection.append(registerButton, feedback);
}

// Display events that the demo student has registered for
async function displaySavedEvents() {
    const detailsSection = document.getElementById("event-details");

    detailsSection.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "My Registered Events";

    detailsSection.appendChild(heading);

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading registered events...";
    detailsSection.appendChild(loadingMessage);

    try {
        const registrations = await getStudentRegistrations();

        loadingMessage.remove();

        const activeRegistrations = registrations.filter(
            registration =>
                registration.status === "registered" &&
                registration.event
        );

        if (activeRegistrations.length === 0) {
            const message = document.createElement("p");
            message.textContent =
                "You haven't registered for any events yet.";

            detailsSection.appendChild(message);
            return;
        }

        activeRegistrations.forEach(registration => {
            const event = registration.event;

            const eventButton = document.createElement("button");
            eventButton.type = "button";

            eventButton.textContent =
                `${event.title} — ${new Date(event.date).toLocaleString()}`;

            eventButton.addEventListener("click", () => {
                displayEventDetails(event);
            });

            detailsSection.appendChild(eventButton);
        });

    } catch (error) {
        console.error("Error loading registered events:", error);

        loadingMessage.remove();

        const message = document.createElement("p");
        message.textContent = "Unable to load registered events.";

        detailsSection.appendChild(message);
    }
}



let displayedMonth = new Date(2026, 11, 1);
let calendarEvents = [];

function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    const monthHeading = document.getElementById("calendar-month");

    if (!calendarGrid || !monthHeading) return;

    calendarGrid.replaceChildren();

    monthHeading.textContent = displayedMonth.toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Weekday headings
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
        const heading = document.createElement("div");
        heading.className = "calendar-weekday";
        heading.textContent = day;
        calendarGrid.appendChild(heading);
    });

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-empty";
        calendarGrid.appendChild(emptyCell);
    }

    // Generate calendar dates
    for (let day = 1; day <= daysInMonth; day++) {
        const dateButton = document.createElement("button");
        dateButton.type = "button";
        dateButton.className = "calendar-day";

        const dateLabel = document.createElement("span");
        dateLabel.textContent = day;
        dateButton.appendChild(dateLabel);

        const matchingEvents = calendarEvents.filter(event => {
            const eventDate = new Date(event.date);

            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day
            );
        });

        matchingEvents.forEach(event => {
            const eventLabel = document.createElement("span");
            eventLabel.className = "calendar-event";
            eventLabel.textContent = event.title;
            dateButton.appendChild(eventLabel);
        });

        dateButton.addEventListener("click", () => {
            if (matchingEvents.length === 0) {
                const detailsSection = document.getElementById("event-details");
                detailsSection.replaceChildren();

                const message = document.createElement("p");
                message.textContent = "No upcoming events on this date.";
                detailsSection.appendChild(message);
            } else {
                displayEventDetails(matchingEvents[0]);
            }
        });

        calendarGrid.appendChild(dateButton);
    }
}



// Initialize the frontend
document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.querySelector(
        '.search-section input[type="search"]'
    );

    const detailsSection = document.getElementById("event-details");

    const savedTab = document.querySelector(
        ".app-tabs a:nth-child(3)"
    );

    const calendarTab = document.querySelector(
        ".app-tabs a:nth-child(1)"
    );

    // Prevent older searches from overwriting newer results
    let latestSearch = 0;

    async function loadEvents(organizationName = "") {
        const searchNumber = ++latestSearch;
        const events = await getEvents(organizationName);
        calendarEvents = events;
        renderCalendar();

        if (searchNumber !== latestSearch) {
            return;
        }

        if (events.length > 0) {
            displayEventDetails(events[0]);
        } else {
            detailsSection.replaceChildren();

            const message = document.createElement("p");
            message.textContent = "No upcoming events found.";

            detailsSection.appendChild(message);
        }
    }

    // Load upcoming events when the page opens
    await loadEvents();

    const previousMonthButton = document.getElementById("previous-month");
    const nextMonthButton = document.getElementById("next-month");

    if (previousMonthButton) {
        previousMonthButton.addEventListener("click", () => {
            displayedMonth.setMonth(displayedMonth.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener("click", () => {
            displayedMonth.setMonth(displayedMonth.getMonth() + 1);
            renderCalendar();
        });
    }


    // Search by organization name
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            loadEvents(searchInput.value.trim());
        });
    }

    // Display registered events when Saved is clicked
    if (savedTab) {
        savedTab.addEventListener("click", async (event) => {
            event.preventDefault();

            // Invalidate pending searches
            latestSearch++;

            await displaySavedEvents();
        });
    }

    // Return to upcoming events when calendar is clicked
    if (calendarTab) {
        calendarTab.addEventListener("click", (event) => {
            event.preventDefault();

            loadEvents(searchInput ? searchInput.value.trim() : "");
        });
    }
});
class User {
  // UML visibility mapping
  // - userId: int
  // - displayName: String
  // - email: String
  // - passwordHash: String
  // - dateJoined: Date
  // + login(email: String, password: String): boolean
  // + updateProfile(name: String): void
  #userId;
  #displayName;
  #email;
  #passwordHash;
  #dateJoined;

  constructor(userId, displayName, email, passwordHash, dateJoined) {
    this.#userId = userId;
    this.#displayName = displayName;
    this.#email = email;
    this.#passwordHash = passwordHash;
    this.#dateJoined = dateJoined;
  }

  login(email, password) {
    return this.#email === email && this.#passwordHash === password;
  }

  updateProfile(name) {
    this.#displayName = name;
  }
}

class Student extends User {
  // Student: Actor
  // Student 1..1 -> EventsPage 1..1
  #studentId;
  #major;
  #eventsPage;

  constructor(userId, displayName, email, passwordHash, dateJoined, studentId, major, eventsPage = null) {
    super(userId, displayName, email, passwordHash, dateJoined);
    this.#studentId = studentId;
    this.#major = major;
    this.#eventsPage = eventsPage;
  }

  setEventsPage(eventsPage) {
    this.#eventsPage = eventsPage;
  }

  viewUpcomingEvents() {
    if (!this.#eventsPage) {
      return [];
    }

    return this.#eventsPage.viewUpcomingEvents();
  }
}

class EventTag {
  #tagId;
  #tagName;
  #category;

  constructor(tagId, tagName, category) {
    this.#tagId = tagId;
    this.#tagName = tagName;
    this.#category = category;
  }

  get tagName() {
    return this.#tagName;
  }
}

class Event {
  #eventId;
  #title;
  #description;
  #dateTime;
  #location;
  #tags;

  constructor(eventId, title, description, dateTime, location, tags = []) {
    this.#eventId = eventId;
    this.#title = title;
    this.#description = description;
    this.#dateTime = dateTime;
    this.#location = location;
    this.#tags = tags;
  }

  get title() {
    return this.#title;
  }

  get description() {
    return this.#description;
  }

  get dateTime() {
    return this.#dateTime;
  }

  get location() {
    return this.#location;
  }

  get tags() {
    return this.#tags;
  }
}

class EventsPage {
  // EventsPage: Interface
  // EventsPage 1..1 -> EventService 1..1
  #eventService;
  #sequenceLogger;

  constructor(eventService, sequenceLogger = () => {}) {
    this.#eventService = eventService;
    this.#sequenceLogger = sequenceLogger;
  }

  viewUpcomingEvents() {
    this.#sequenceLogger('1. Student -> EventsPage | Message: viewUpcomingEvents()');
    this.#sequenceLogger('2. EventsPage -> EventService | Message: getUpcomingEvents()');

    const events = this.#eventService.getUpcomingEvents();

    if (events.length === 0) {
      return this.displayEmptyState();
    }

    this.#sequenceLogger('6. EventsPage -> EventsPage | Message: displayEvents(events)');
    return this.displayEvents(events);
  }

  displayEvents(events) {
    const list = document.querySelector('#event-list');
    list.innerHTML = '';

    events.forEach((event) => {
      const item = document.createElement('li');
      item.className = 'event-item';
      item.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.dateTime.toLocaleString()}</p>
        <p>${event.location}</p>
        <p>${event.description}</p>
      `;
      list.appendChild(item);
    });

    return events;
  }

  displayEmptyState() {
    this.#sequenceLogger('EventsPage -> EventsPage | Message: displayEmptyState()');
    const list = document.querySelector('#event-list');
    list.innerHTML = '';

    const item = document.createElement('li');
    item.className = 'empty-state';
    item.textContent = 'No upcoming events available right now.';
    list.appendChild(item);

    return [];
  }
}

class EventService {
  // EventService: Logic
  // EventService 1..1 -> EventRepo 1..1
  #eventRepo;
  #sequenceLogger;

  constructor(eventRepo, sequenceLogger = () => {}) {
    this.#eventRepo = eventRepo;
    this.#sequenceLogger = sequenceLogger;
  }

  getUpcomingEvents() {
    this.#sequenceLogger('3. EventService -> EventRepo | Message: findUpcomingEvents()');
    const events = this.#eventRepo.findUpcomingEvents();
    this.#sequenceLogger('5. EventService -> EventsPage | Message: events: Event[]');
    return events;
  }
}

class EventRepo {
  // EventRepo: Storage
  #events;
  #sequenceLogger;

  constructor(initialEvents = [], sequenceLogger = () => {}) {
    this.#events = [...initialEvents];
    this.#sequenceLogger = sequenceLogger;
  }

  findUpcomingEvents() {
    const now = new Date();
    const upcoming = this.#events.filter((event) => new Date(event.dateTime) >= now);
    this.#sequenceLogger('4. EventRepo -> EventService | Message: events: Event[]');
    return upcoming;
  }
}

class EventRepository extends EventRepo {}

function renderSequence(messages) {
  const list = document.querySelector('#sequence-log');
  list.innerHTML = '';

  messages.forEach((message) => {
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  });
}

function buildSampleEvents() {
  const techTag = new EventTag(1, 'Technology', 'Academic');
  const leadershipTag = new EventTag(2, 'Leadership', 'Campus');

  return [
    new Event(
      1,
      'AI & Data Meetup',
      'Networking and research discussion for students interested in AI.',
      new Date('2026-11-20T18:00:00'),
      'Innovation Hall 204',
      [techTag]
    ),
    new Event(
      2,
      'Leadership Roundtable',
      'Student leaders share ideas about community organizing and club growth.',
      new Date('2026-11-24T17:30:00'),
      'Student Union 110',
      [leadershipTag]
    )
  ];
}

function initializeApp() {
  const sequenceMessages = [];
  const logStep = (message) => {
    sequenceMessages.push(message);
    renderSequence(sequenceMessages);
  };

  const eventRepo = new EventRepo(buildSampleEvents(), logStep);
  const eventService = new EventService(eventRepo, logStep);
  const eventsPage = new EventsPage(eventService, logStep);
  const student = new Student(1, 'Ava Martinez', 'ava@orgsync.edu', 'hash', new Date('2025-08-15'), 'S-1001', 'Computer Science', eventsPage);

  const showUpcoming = () => {
    sequenceMessages.length = 0;
    student.viewUpcomingEvents();
  };

  const showEmpty = () => {
    sequenceMessages.length = 0;
    const emptyRepo = new EventRepo([], logStep);
    const emptyService = new EventService(emptyRepo, logStep);
    const page = new EventsPage(emptyService, logStep);
    page.viewUpcomingEvents();
  };

  document.querySelector('#view-events-button').addEventListener('click', showUpcoming);
  document.querySelector('#empty-events-button').addEventListener('click', showEmpty);

  showUpcoming();
}

document.addEventListener('DOMContentLoaded', initializeApp);
