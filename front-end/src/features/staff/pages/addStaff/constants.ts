// Generate time options in 15-minute intervals from 00:00 to 24:00
export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  // Add 24:00 (midnight next day)
  times.push("24:00");
  return times;
};

export const timeOptions = generateTimeOptions();

export const daysOfWeek = [
  { id: 'sunday', label: 'Su', fullName: 'Sunday' },
  { id: 'monday', label: 'Mo', fullName: 'Monday' },
  { id: 'tuesday', label: 'Tu', fullName: 'Tuesday' },
  { id: 'wednesday', label: 'We', fullName: 'Wednesday' },
  { id: 'thursday', label: 'Th', fullName: 'Thursday' },
  { id: 'friday', label: 'Fr', fullName: 'Friday' },
  { id: 'saturday', label: 'Sa', fullName: 'Saturday' }
];

export const defaultPermissions = [
  { id: "appointments:read", label: "View Appointments" },
  { id: "appointments:write", label: "Manage Appointments" },
  { id: "users:read", label: "View Users" },
  { id: "users:write", label: "Manage Users" },
  { id: "reports:read", label: "View Reports" }
];
