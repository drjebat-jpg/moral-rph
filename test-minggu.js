const generateMingguOptions = () => {
  const options = [];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  
  // Kumpulan B (Johor, Melaka, Negeri Sembilan, Pahang, Perak, Perlis, Pulau Pinang, Sabah, Sarawak, Selangor, WPKL, WP Labuan, WP Putrajaya)
  // Starts 12 Jan 2026
  
  let currentDate = new Date(2026, 0, 12); // 12 Jan 2026
  let weekNumber = 1;
  
  const addWeek = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    end.setDate(end.getDate() + 4); // Friday
    
    const startStr = `${start.getDate()} ${months[start.getMonth()]}`;
    const endStr = `${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
    
    options.push({
      id: `Minggu ${weekNumber}`,
      label: `Minggu ${weekNumber} (${startStr} - ${endStr})`
    });
    
    weekNumber++;
    currentDate.setDate(currentDate.getDate() + 7);
  };

  // Penggal 1: 10 weeks (12 Jan - 20 Mar)
  for (let i = 0; i < 10; i++) addWeek();
  
  // Cuti Penggal 1: 1 week (21 Mar - 29 Mar)
  currentDate.setDate(currentDate.getDate() + 7);
  
  // Penggal 2: 8 weeks (30 Mar - 22 May)
  for (let i = 0; i < 8; i++) addWeek();
  
  // Cuti Pertengahan Tahun: 2 weeks (23 May - 7 Jun)
  currentDate.setDate(currentDate.getDate() + 14);
  
  // Penggal 3: 12 weeks (8 Jun - 28 Aug)
  for (let i = 0; i < 12; i++) addWeek();
  
  // Cuti Penggal 2: 1 week (29 Aug - 6 Sep)
  currentDate.setDate(currentDate.getDate() + 7);
  
  // Penggal 4: 13 weeks (7 Sep - 4 Dec)
  for (let i = 0; i < 13; i++) addWeek();

  return options;
};

console.log(generateMingguOptions());
