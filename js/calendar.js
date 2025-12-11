// ===========================
// CALENDARIO INTERACTIVO
// ===========================

class InteractiveCalendar {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableDates = options.availableDates || [];
    this.timeSlots = options.timeSlots || [];
    this.onDateSelect = options.onDateSelect || (() => {});
    this.onTimeSelect = options.onTimeSelect || (() => {});
    
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    let html = `
      <div class="calendar-container">
        <div class="calendar-header">
          <h3>${monthNames[month]} ${year}</h3>
          <div class="calendar-nav">
            <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
            <button class="next-month"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        
        <div class="calendar-weekdays">
          ${weekDays.map(day => `<div>${day}</div>`).join('')}
        </div>
        
        <div class="calendar-days">
    `;
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += `<div class="calendar-day disabled"></div>`;
    }
    
    // Days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const isToday = date.toDateString() === today.toDateString();
      const isAvailable = this.availableDates.includes(dateStr);
      const isSelected = this.selectedDate === dateStr;
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      let classes = 'calendar-day';
      if (isToday) classes += ' today';
      if (isAvailable) classes += ' available';
      if (isSelected) classes += ' selected';
      if (isPast) classes += ' disabled';
      
      html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }
    
    html += `
        </div>
        
        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-dot today"></div>
            <span>Hoy</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot available"></div>
            <span>Disponible</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot selected"></div>
            <span>Seleccionado</span>
          </div>
        </div>
        
        ${this.selectedDate ? this.renderTimeSlots() : ''}
      </div>
    `;
    
    this.container.innerHTML = html;
  }

  renderTimeSlots() {
    return `
      <div class="time-slots">
        ${this.timeSlots.map(time => {
          const isSelected = this.selectedTime === time;
          return `
            <div class="time-slot ${isSelected ? 'selected' : ''}" data-time="${time}">
              <i class="fas fa-clock"></i> ${time}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      // Navigate months
      if (e.target.closest('.prev-month')) {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.attachEvents();
      }
      
      if (e.target.closest('.next-month')) {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.attachEvents();
      }
      
      // Select date
      const dayCell = e.target.closest('.calendar-day');
      if (dayCell && !dayCell.classList.contains('disabled')) {
        const date = dayCell.dataset.date;
        if (this.availableDates.includes(date)) {
          this.selectedDate = date;
          this.selectedTime = null;
          this.render();
          this.attachEvents();
          this.onDateSelect(date);
        }
      }
      
      // Select time
      const timeSlot = e.target.closest('.time-slot');
      if (timeSlot && !timeSlot.classList.contains('disabled')) {
        this.selectedTime = timeSlot.dataset.time;
        this.render();
        this.attachEvents();
        this.onTimeSelect(this.selectedDate, this.selectedTime);
      }
    });
  }

  setAvailableDates(dates) {
    this.availableDates = dates;
    this.render();
    this.attachEvents();
  }

  setTimeSlots(slots) {
    this.timeSlots = slots;
    if (this.selectedDate) {
      this.render();
      this.attachEvents();
    }
  }

  getSelection() {
    return {
      date: this.selectedDate,
      time: this.selectedTime
    };
  }
}

// Export for use
window.InteractiveCalendar = InteractiveCalendar;
