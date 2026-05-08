// Generate 15-minute time slots from 7:00 AM to 7:00 PM
export const timeSlots = (() => {
  const slots = [];
  const startHour = 7; // 7 AM
  const endHour = 19; // 7 PM (19:00)
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) break; // Stop at exactly 7:00 PM
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
})();
