const currentMonthYear = document.getElementById('currentMonthYear');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const addEventButton = document.getElementById('addEventButton');
const eventTitleInput = document.getElementById('eventTitle');
const eventDateInput = document.getElementById('eventDate');
const eventTimeInput = document.getElementById('eventTime');
const eventDescriptionInput = document.getElementById('eventDescription');
const eventsList = document.getElementById('eventsList');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];

function renderCalendar() {
    calendarDays.innerHTML = '';
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    currentMonthYear.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell');
        calendarDays.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell', 'current-month');
        dayCell.textContent = day;
        dayCell.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check for events on this day
        const dayHasEvent = events.some(event => event.date === dayCell.dataset.date);
        if (dayHasEvent) {
            dayCell.classList.add('has-event');
        }

        calendarDays.appendChild(dayCell);
    }
    renderEventsList();
}

function addEvent() {
    const title = eventTitleInput.value;
    const date = eventDateInput.value;
    const time = eventTimeInput.value;
    const description = eventDescriptionInput.value;

    if (title && date) {
        const newEvent = { id: Date.now(), title, date, time, description };
        events.push(newEvent);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        renderCalendar();
        // Clear form
        eventTitleInput.value = '';
        eventDateInput.value = '';
        eventTimeInput.value = '';
        eventDescriptionInput.value = '';
    } else {
        alert('Please enter event title and date.');
    }
}

function renderEventsList() {
    eventsList.innerHTML = '';
    events.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${event.title}</strong> on ${event.date} at ${event.time || 'N/A'}<br>${event.description}`;
        eventsList.appendChild(listItem);
    });
}

prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

addEventButton.addEventListener('click', addEvent);

renderCalendar();