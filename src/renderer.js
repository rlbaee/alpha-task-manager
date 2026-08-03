function formatDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayStr() {
  return formatDateStr(new Date());
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateStr(date);
}

function formatFullDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatWeekday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

let currentDate = null;

async function render(dateStr) {
  const { data } = await window.api.getData();
  currentDate = dateStr || getTodayStr();

  const { entry } = await window.api.getEntryForDate(currentDate);
  const isToday = currentDate === getTodayStr();

  document.getElementById('dateLabel').textContent = isToday ? 'Today' : formatWeekday(currentDate);
  document.getElementById('dateSub').textContent = isToday ? formatFullDate(currentDate) : currentDate;
  document.getElementById('nextBtn').disabled = isToday;

  const list = document.getElementById('list');
  list.innerHTML = '';

  data.categories.forEach(({ group, activities }) => {
    const groupLabel = document.createElement('div');
    groupLabel.className = 'group-label';
    groupLabel.textContent = group;
    list.appendChild(groupLabel);

    activities.forEach((activity) => {
      const count = (entry.counts[group] && entry.counts[group][activity]) || 0;

      const row = document.createElement('div');
      row.className = 'row' + (count > 0 ? ' active' : '');
      row.innerHTML = `
        <span class="label">${activity}</span>
        <div class="controls">
          <button class="stepper minus" data-action="minus" ${!isToday ? 'disabled' : ''}>−</button>
          <span class="count">${count}</span>
          <button class="stepper plus" data-action="plus" ${!isToday ? 'disabled' : ''}>+</button>
        </div>`;

      if (isToday) {
        row.querySelector('[data-action="minus"]').onclick = async () => {
          await window.api.updateCount(group, activity, -1);
          render(currentDate);
        };
        row.querySelector('[data-action="plus"]').onclick = async () => {
          await window.api.updateCount(group, activity, 1);
          render(currentDate);
        };
      }

      list.appendChild(row);
    });
  });
}

document.getElementById('prevBtn').onclick = () => render(shiftDate(currentDate, -1));
document.getElementById('nextBtn').onclick = () => render(shiftDate(currentDate, 1));

render();