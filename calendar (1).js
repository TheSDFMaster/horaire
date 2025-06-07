const calendarContainer = document.querySelector('.container');
const monthLabel = document.getElementById('months');

let currentColorTool = null;
let coloringMode = null;
let selectedEmployee = null;
let isMouseDown = false;

let calendarColors = JSON.parse(localStorage.getItem('calendarColors')) || {};

const colorTools = JSON.parse(localStorage.getItem('colorTools')) || [
    { color: '#ff0000', label: 'Vacances' },
    { color: '#00ff00', label: 'Télétravail' },
    { color: '#0000ff', label: 'Maladie' }
];

const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const weekdayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let employees = loadEmployees();

function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function renderCalendar(month, year) {
    const daysInMonth = getDaysInMonth(month, year);
    const key = `${year}-${month}`;

    calendarContainer.innerHTML = '';
    calendarContainer.style.gridTemplateColumns = `150px repeat(${daysInMonth}, 1fr)`;

    const emploHeader = document.createElement('div');
    emploHeader.className = 'emplo';
    emploHeader.textContent = 'Employés --- Jours >';
    calendarContainer.appendChild(emploHeader);

    for (let i = 0; i < daysInMonth; i++) {
        const dayNum = i + 1;
        const dayOfWeek = new Date(year, month, dayNum).getDay();
        const cell = document.createElement('div');
        cell.innerHTML = `${String(dayNum).padStart(2, '0')}<br><span class="weekday">${weekdayNames[dayOfWeek]}</span>`;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            cell.style.backgroundColor = 'black';
            cell.style.color = 'red';
        }

        calendarContainer.appendChild(cell);
    }

    employees.forEach((emp, eIndex) => {
        const empWrapper = document.createElement('div');
        empWrapper.className = 'employ';
        if (selectedEmployee === emp) {
            empWrapper.classList.add('selected');
        }
        empWrapper.onclick = () => {
            selectedEmployee = emp;
            renderCalendar(currentMonth, currentYear);
        };

        const empName = document.createElement('span');
        empName.textContent = emp;
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'M';
        editBtn.className = 'edit-btn';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            const edited = window.prompt("Modification du nom:", emp);
            if (edited && edited.trim() !== "") {
                employees[eIndex] = edited.trim();
                if (calendarColors[emp]) {
                    calendarColors[edited.trim()] = calendarColors[emp];
                    delete calendarColors[emp];
                }
                saveEmployees();
                saveCalendarColors();
                renderCalendar(currentMonth, currentYear);
            } else {
                alert("Aucune donnée valide n'a été entrée.");
            }
        };


        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.className = 'delete-employee';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer ${emp} ?`)) {
                employees.splice(eIndex, 1);
                delete calendarColors[emp];
                saveEmployees();
                saveCalendarColors();
                renderCalendar(currentMonth, currentYear);
            }
        };

        empWrapper.appendChild(empName);
        empWrapper.appendChild(editBtn);
        empWrapper.appendChild(delBtn);
        calendarContainer.appendChild(empWrapper);

        for (let d = 1; d <= daysInMonth; d++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = d.toString().padStart(2, '0');

            const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayCell.style.backgroundColor = 'black';
                dayCell.style.color = 'red';
                dayCell.style.pointerEvents = 'none';
            } else {
                const keyMonth = `${currentYear}-${currentMonth}`;
                const dayStr = d.toString().padStart(2, '0');
                const savedColor = calendarColors?.[emp]?.[keyMonth]?.[dayStr];
                if (savedColor) {
                    dayCell.style.backgroundColor = savedColor;

                    const tool = colorTools.find(t => t.color.toLowerCase() === savedColor.toLowerCase());
                    if (tool) {
                        const labelLetter = tool.label.trim().charAt(0).toUpperCase();
                        dayCell.textContent = labelLetter;
                        dayCell.style.color = 'white';
                        dayCell.style.textAlign = 'center';
                        dayCell.style.fontWeight = 'bold';
                        dayCell.style.fontSize = '14px';
                    }
                }

                dayCell.addEventListener('mousedown', () => {
                    handleCellColoring(emp, dayStr, dayCell, d);
                });
                dayCell.addEventListener('mouseover', () => {
                    if (isMouseDown) {
                        handleCellColoring(emp, dayStr, dayCell, d);
                    }
                });

            }

            calendarContainer.appendChild(dayCell);
        }
    });

    monthLabel.textContent = `${monthNames[month]} ${year}`;
}

function addNavigationButtons() {
    const nav = document.createElement('div');
    nav.id = 'navigation';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<<';
    prevBtn.className = 'btn_standard';
    prevBtn.style.cursor = "pointer"
    prevBtn.onclick = () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    };

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>>';
    nextBtn.className = 'btn_standard';
    nextBtn.style.cursor = "pointer"
    nextBtn.onclick = () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    };

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    document.body.appendChild(nav);
}

function handleCellColoring(employeeName, dayStr, dayCell, d) {
    if (!selectedEmployee || selectedEmployee !== employeeName) return;

    const keyMonth = `${currentYear}-${currentMonth}`;
    if (!calendarColors[employeeName]) calendarColors[employeeName] = {};
    if (!calendarColors[employeeName][keyMonth]) calendarColors[employeeName][keyMonth] = {};

    if (coloringMode === 'erase') {
        delete calendarColors[employeeName][keyMonth][dayStr];
        dayCell.style.backgroundColor = '';
        dayCell.textContent = d.toString().padStart(2, '0');
        dayCell.style.color = '';
        dayCell.style.textAlign = '';
        dayCell.style.fontWeight = '';
        dayCell.style.fontSize = '';
    } else if (coloringMode) {
        calendarColors[employeeName][keyMonth][dayStr] = coloringMode;
        dayCell.style.backgroundColor = coloringMode;

        const tool = colorTools.find(t => t.color.toLowerCase() === coloringMode.toLowerCase());
        if (tool) {
            const labelLetter = tool.label.trim().charAt(0).toUpperCase();
            dayCell.textContent = labelLetter;
            dayCell.style.color = 'white';
            dayCell.style.textAlign = 'center';
            dayCell.style.fontWeight = 'bold';
            dayCell.style.fontSize = '14px';
        }
    }

    saveCalendarColors();
}

function addEmployeeForm() {
    const form = document.createElement('div');
    form.id = 'employee-form';
    form.innerHTML = `
        <input maxlenght='16' type="text" id="employee-name" placeholder="Nom de l'employé">
        <button id="add-employee">Ajouter</button>
    `;

    document.body.insertBefore(form, document.querySelector('.container'));

    document.getElementById('add-employee').onclick = () => {
        const input = document.getElementById('employee-name');
        const name = input.value.trim();
        if (name && !employees.includes(name)) {
            employees.push(name);
            saveEmployees();
            renderCalendar(currentMonth, currentYear);
            input.value = '';
        }
    };
}

function renderTools() {
    const toolsContainer = document.getElementById('tools');
    toolsContainer.innerHTML = '';

    colorTools.forEach((tool, index) => {
        if (!tool.id) {
            tool.id = `tool-${Date.now()}-${index}`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'tool-button';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = tool.color;
        colorInput.oninput = (e) => {
            colorTools[index].color = e.target.value;
            saveColorTools();
            renderCalendar(currentMonth, currentYear);
        };

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = tool.label;
        labelInput.style.width = '90px';
        labelInput.onchange = (e) => {
            colorTools[index].label = e.target.value;
            saveColorTools();
        };

        const activateBtn = document.createElement('button');
        activateBtn.textContent = '';
        activateBtn.style.cursor = 'pointer';
        activateBtn.style.borderRadius = '20px'
        activateBtn.style.padding = '10px'
        activateBtn.id = tool.id;

        if (currentColorTool === tool.id) {
            activateBtn.classList.add('selected');
        }

        activateBtn.onclick = () => {
            coloringMode = tool.color;
            currentColorTool = tool.id;
            renderTools();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.id = 'del';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = () => {
            colorTools.splice(index, 1);
            saveColorTools();
            renderTools();
        };

        wrapper.appendChild(activateBtn);
        wrapper.appendChild(colorInput);
        wrapper.appendChild(labelInput);
        wrapper.appendChild(deleteBtn);

        toolsContainer.appendChild(wrapper);
    });

    const addToolBtn = document.createElement('button');
    addToolBtn.textContent = '+Ajouter';
    addToolBtn.className = 'btn_standard';
    addToolBtn.onclick = () => {
        const uniqueId = `tool-${Date.now()}`;
        colorTools.push({ id: uniqueId, color: '#cccccc', label: 'Nouveau' });
        saveColorTools();
        renderTools();
    };
    toolsContainer.appendChild(addToolBtn);

    const eraseBtn = document.createElement('button');
    eraseBtn.textContent = 'Effacer';
    eraseBtn.className = 'btn_standard';
    if (coloringMode === 'erase') eraseBtn.classList.add('selected');
    eraseBtn.onclick = () => {
        coloringMode = 'erase';
        currentColorTool = null;
        renderTools();
    };
    toolsContainer.appendChild(eraseBtn);
}

document.getElementById('exportDataBtn').addEventListener('click', () => {
    const exportData = {
        calendar_employees: JSON.parse(localStorage.getItem('calendar_employees') || '[]'),
        calendarColors: JSON.parse(localStorage.getItem('calendarColors') || '{}'),
        colorTools: JSON.parse(localStorage.getItem('colorTools') || '[]')
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'horaire.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.calendar_employees && data.calendarColors && data.colorTools) {
                localStorage.setItem('calendar_employees', JSON.stringify(data.calendar_employees));
                localStorage.setItem('calendarColors', JSON.stringify(data.calendarColors));
                localStorage.setItem('colorTools', JSON.stringify(data.colorTools));

                alert("Données importées avec succès");
                location.reload(); 
            } else {
                alert("Données invalides");
            }
        } catch (err) {
            alert("Erreur de lecture du fichier");
        }
    };
    reader.readAsText(file);
});

document.addEventListener('mousedown', () => isMouseDown = true);
document.addEventListener('mouseup', () => isMouseDown = false);



function saveEmployees() {
    localStorage.setItem('calendar_employees', JSON.stringify(employees));
}

function saveColorTools() {
    localStorage.setItem('colorTools', JSON.stringify(colorTools));
}

function saveCalendarColors() {
    localStorage.setItem('calendarColors', JSON.stringify(calendarColors));
}

function loadEmployees() {
    return JSON.parse(localStorage.getItem('calendar_employees') || '[]');
}


addEmployeeForm();
addNavigationButtons();
renderCalendar(currentMonth, currentYear);
renderTools();
