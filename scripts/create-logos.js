const fs = require('fs');
const path = require('path');

const teams = [
  { id: 'besiktas', name: 'BJK', primary: '#000000', secondary: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'trabzonspor', name: 'TS', primary: '#6B4226', secondary: '#00A3E0', accent: '#FFFFFF' },
  { id: 'basaksehir', name: 'IBFK', primary: '#FF6600', secondary: '#003366', accent: '#FFFFFF' },
  { id: 'konyaspor', name: 'KON', primary: '#006633', secondary: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'kayserispor', name: 'KAY', primary: '#D40000', secondary: '#FFFF00', accent: '#000000' },
  { id: 'sivasspor', name: 'SIV', primary: '#D40000', secondary: '#FFFFFF', accent: '#000000' },
  { id: 'gaziantep', name: 'GFK', primary: '#D40000', secondary: '#000000', accent: '#FFFFFF' },
  { id: 'antalyaspor', name: 'ANT', primary: '#D40000', secondary: '#FFFFFF', accent: '#000000' },
  { id: 'alanyaspor', name: 'ALA', primary: '#FF6600', secondary: '#000000', accent: '#FFFFFF' },
  { id: 'hatayspor', name: 'HAT', primary: '#D40000', secondary: '#FFFFFF', accent: '#000000' },
  { id: 'kasimpasa', name: 'KAS', primary: '#003366', secondary: '#FFD700', accent: '#FFFFFF' },
  { id: 'adana', name: 'ADS', primary: '#003366', secondary: '#FFFFFF', accent: '#FFFF00' },
  { id: 'pendikspor', name: 'PEN', primary: '#006633', secondary: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'samsunspor', name: 'SAM', primary: '#D40000', secondary: '#FFFFFF', accent: '#000000' },
  { id: 'istanbulspor', name: 'IST', primary: '#000000', secondary: '#FFD700', accent: '#FFFFFF' },
  { id: 'ankaragucu', name: 'AGU', primary: '#003366', secondary: '#FFFF00', accent: '#000000' },
  { id: 'rize', name: 'RIZ', primary: '#006633', secondary: '#FFFFFF', accent: '#FFFFFF' },
];

const logosDir = path.join(__dirname, '../public/logos');

teams.forEach(team => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="95" fill="${team.primary}" />
  <circle cx="100" cy="100" r="85" fill="none" stroke="${team.secondary}" stroke-width="3" />
  <text x="100" y="115" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${team.accent}" text-anchor="middle">${team.name}</text>
</svg>`;
  
  fs.writeFileSync(path.join(logosDir, `${team.id}.svg`), svg);
  console.log(`Created ${team.id}.svg`);
});

console.log('All logos created!');