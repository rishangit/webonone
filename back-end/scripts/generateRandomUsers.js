const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

// Sample data for generating random users
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Jason', 'Rebecca', 'Edward', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Frank', 'Christine', 'Gregory', 'Debra',
  'Raymond', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Julie',
  'Jose', 'Joyce', 'Adam', 'Victoria', 'Nathan', 'Kelly', 'Zachary', 'Christina',
  'Douglas', 'Joan', 'Kyle', 'Evelyn', 'Noah', 'Judith', 'Ethan', 'Megan',
  'Jeremy', 'Cheryl', 'Walter', 'Andrea', 'Christian', 'Hannah', 'Keith', 'Jacqueline',
  'Roger', 'Martha', 'Terry', 'Gloria', 'Gerald', 'Teresa', 'Harold', 'Sara',
  'Sean', 'Janice', 'Austin', 'Marie', 'Carl', 'Julia', 'Arthur', 'Grace',
  'Lawrence', 'Judy', 'Dylan', 'Theresa', 'Jesse', 'Madison', 'Jordan', 'Beverly',
  'Bryan', 'Denise', 'Billy', 'Marilyn', 'Joe', 'Amber', 'Bruce', 'Danielle',
  'Gabriel', 'Rose', 'Logan', 'Brittany', 'Alan', 'Diana', 'Juan', 'Abigail',
  'Wayne', 'Jane', 'Roy', 'Lori', 'Ralph', 'Olivia', 'Randy', 'Jean',
  'Eugene', 'Frances', 'Vincent', 'Kathryn', 'Russell', 'Alice', 'Louis', 'Jasmine',
  'Philip', 'Gloria', 'Bobby', 'Tiffany', 'Johnny', 'Mia', 'Willie', 'Lauren'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
  'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards',
  'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers',
  'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
  'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
  'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
  'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell',
  'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons',
  'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
  'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson',
  'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro',
  'Marshall', 'Owens', 'Harrison', 'Fernandez', 'Mcdonald', 'Woods', 'Washington', 'Kennedy',
  'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker', 'Guzman',
  'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
  'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt', 'Hicks',
  'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson', 'Boyd', 'Rose', 'Stone',
  'Salazar', 'Fox', 'Warren', 'Mills', 'Meyer', 'Rice', 'Schmidt', 'Garza',
  'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Weaver', 'Ryan', 'Gardner',
  'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins', 'Arnold', 'Pierce',
  'Vazquez', 'Burns', 'Valdez', 'Barker', 'Cummings', 'Hines', 'Malone', 'Clarke',
  'Velasquez', 'Daniel', 'Burgess', 'Santos', 'Neal', 'Cain', 'Horton', 'Terry',
  'Wolfe', 'Hale', 'Marsh', 'Johns', 'Haynes', 'Miles', 'Lyons', 'Park',
  'Warner', 'Padilla', 'Bush', 'Thornton', 'Mccarthy', 'Mann', 'Zimmerman', 'Erickson',
  'Fletcher', 'Mckinney', 'Page', 'Dawson', 'Joseph', 'Marquez', 'Reeves', 'Klein',
  'Espinoza', 'Baldwin', 'Moran', 'Love', 'Robbins', 'Higgins', 'Ball', 'Cortez',
  'Le', 'Griffith', 'Bowen', 'Sharp', 'Cummings', 'Ramsey', 'Hardy', 'Swanson',
  'Barber', 'Acosta', 'Luna', 'Chandler', 'Daniel', 'Blair', 'Cross', 'Simon',
  'Dennis', 'Oconnor', 'Quinn', 'Gross', 'Navarro', 'Moss', 'Fitzgerald', 'Doyle',
  'Mclaughlin', 'Rojas', 'Rodgers', 'Stevenson', 'Singh', 'Yang', 'Figueroa', 'Harmon',
  'Newton', 'Paul', 'Manning', 'Garner', 'Mcgee', 'Reid', 'Esparza', 'Mccormick',
  'Hogan', 'Rubio', 'Kane', 'Barton', 'Harvey', 'Little', 'Lucas', 'Hubbard',
  'Wade', 'Schneider', 'Mullins', 'Benson', 'Sharp', 'Bowen', 'Daniel', 'Barber',
  'Cummings', 'Hines', 'Parks', 'Mccarthy', 'Luna', 'Chandler', 'Blair', 'Cross'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami',
  'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa', 'Arlington',
  'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Tampa', 'Aurora', 'Honolulu',
  'Anaheim', 'Santa Ana', 'St. Louis', 'Riverside', 'Corpus Christi', 'Lexington', 'Pittsburgh',
  'Anchorage', 'Stockton', 'Cincinnati', 'St. Paul', 'Toledo', 'Greensboro', 'Newark',
  'Plano', 'Henderson', 'Lincoln', 'Buffalo', 'Jersey City', 'Chula Vista', 'Fort Wayne',
  'Orlando', 'St. Petersburg', 'Chandler', 'Laredo', 'Norfolk', 'Durham', 'Madison',
  'Lubbock', 'Irvine', 'Winston-Salem', 'Glendale', 'Garland', 'Hialeah', 'Reno',
  'Chesapeake', 'Gilbert', 'Baton Rouge', 'Irving', 'Scottsdale', 'North Las Vegas', 'Fremont',
  'Boise', 'Richmond', 'San Bernardino', 'Birmingham', 'Spokane', 'Rochester', 'Des Moines',
  'Modesto', 'Fayetteville', 'Tacoma', 'Oxnard', 'Fontana', 'Columbus', 'Montgomery',
  'Moreno Valley', 'Shreveport', 'Aurora', 'Yonkers', 'Akron', 'Huntington Beach', 'Little Rock',
  'Augusta', 'Amarillo', 'Glendale', 'Mobile', 'Grand Rapids', 'Salt Lake City', 'Tallahassee',
  'Huntsville', 'Grand Prairie', 'Knoxville', 'Worcester', 'Newport News', 'Brownsville',
  'Overland Park', 'Santa Clarita', 'Providence', 'Garden Grove', 'Chattanooga', 'Oceanside',
  'Jackson', 'Fort Lauderdale', 'Santa Rosa', 'Rancho Cucamonga', 'Port St. Lucie', 'Tempe',
  'Ontario', 'Vancouver', 'Sioux Falls', 'Peoria', 'Frisco', 'Salem', 'Cape Coral',
  'Pembroke Pines', 'Eugene', 'McKinney', 'Fort Collins', 'Lancaster', 'Carrollton', 'Cary',
  'Palmdale', 'Hayward', 'Salinas', 'Frisco', 'Springfield', 'Pasadena', 'Macon', 'Alexandria',
  'Pomona', 'Lakewood', 'Sunnyvale', 'Escondido', 'Kansas City', 'Hollywood', 'Clarksville',
  'Torrance', 'Rockford', 'Joliet', 'Paterson', 'Bridgeport', 'Naperville', 'Savannah',
  'Mesquite', 'Syracuse', 'Pasadena', 'Orange', 'Fullerton', 'Killeen', 'Dayton',
  'McAllen', 'Bellevue', 'Miramar', 'Hampton', 'West Valley City', 'Warren', 'Olathe',
  'Columbia', 'Thornton', 'Carrollton', 'Midland', 'Charleston', 'Waco', 'Sterling Heights',
  'Cedar Rapids', 'Corona', 'Elgin', 'Palmdale', 'Salem', 'Topeka', 'Concord',
  'Evansville', 'Downey', 'Westminster', 'Fairfield', 'Arvada', 'Richmond', 'Cambridge',
  'Billings', 'Murfietta', 'Antioch', 'High Point', 'Round Rock', 'Abilene', 'Gainesville',
  'Wilmington', 'Rochester', 'Odessa', 'Manchester', 'El Monte', 'West Jordan', 'Clearwater',
  'Provo', 'Carlsbad', 'Westminster', 'Waterbury', 'Gresham', 'Fargo', 'Arvada', 'Santa Clara',
  'Everett', 'Pueblo', 'Lakeland', 'Peoria', 'Coral Springs', 'South Bend', 'Boulder',
  'Compton', 'Broken Arrow', 'Elkhart', 'Albany', 'Norman', 'Vista', 'Stamford', 'Valley Stream',
  'Fayetteville', 'Layton', 'Lewisville', 'Athens', 'Thousand Oaks', 'Topeka', 'Simi Valley',
  'Orem', 'Fargo', 'Kenosha', 'Elgin', 'Wichita Falls', 'Green Bay', 'Daly City', 'Burbank',
  'Richardson', 'Palm Bay', 'Las Cruces', 'Renton', 'Vacaville', 'San Mateo', 'Edinburg',
  'Carmel', 'Spokane Valley', 'San Angelo', 'Largo', 'Merced', 'Hemet', 'Longview', 'Tyler',
  'Yuma', 'Bellingham', 'Racine', 'Westminster', 'Kennewick', 'Sandy Springs', 'Federal Way',
  'Sparks', 'Brockton', 'Boca Raton', 'South Gate', 'Missoula', 'Chico', 'Duluth', 'Temecula',
  'Santa Barbara', 'Chino', 'Hammond', 'Flint', 'Fayetteville', 'Terre Haute', 'Lafayette',
  'Kenosha', 'Oshkosh', 'Appleton', 'Eau Claire', 'Janesville', 'Wausau', 'La Crosse',
  'Sheboygan', 'Fond du Lac', 'Beloit', 'Stevens Point', 'Waukesha', 'New Berlin', 'Brookfield',
  'Greenfield', 'Oak Creek', 'Menomonee Falls', 'West Allis', 'Cudahy', 'South Milwaukee',
  'St. Francis', 'Whitefish Bay', 'Shorewood', 'Fox Point', 'River Hills', 'Bayside', 'Glendale',
  'Brown Deer', 'Mequon', 'Cedarburg', 'Grafton', 'Port Washington', 'Saukville', 'Fredonia',
  'Belgium', 'Random Lake', 'Cascade', 'Adell', 'Plymouth', 'Elkhart Lake', 'Glenbeulah',
  'Greenbush', 'Kiel', 'New Holstein', 'St. Cloud', 'Mount Calvary', 'St. Anna', 'St. Peter',
  'Marytown', 'Mount Calvary', 'St. Cloud', 'St. Anna', 'St. Peter', 'Marytown', 'Mount Calvary'
];

const streets = [
  'Main St', 'Park Ave', 'Oak St', 'Elm St', 'Maple Ave', 'Cedar Ln', 'Pine St', 'First St',
  'Second St', 'Third St', 'Fourth St', 'Fifth Ave', 'Washington St', 'Lincoln Ave', 'Jefferson St',
  'Madison Ave', 'Adams St', 'Jackson St', 'Monroe St', 'Harrison St', 'Van Buren St', 'Tyler St',
  'Polk St', 'Taylor St', 'Fillmore St', 'Pierce St', 'Buchanan St', 'Johnson St', 'Grant Ave',
  'Hayes St', 'Garfield Ave', 'Arthur St', 'Cleveland Ave', 'McKinley St', 'Roosevelt Ave',
  'Taft St', 'Wilson Ave', 'Harding St', 'Coolidge Ave', 'Hoover St', 'Truman Ave', 'Eisenhower St',
  'Kennedy Ave', 'Johnson St', 'Nixon Ave', 'Ford St', 'Carter Ave', 'Reagan St', 'Bush Ave',
  'Clinton St', 'Obama Ave', 'Broadway', 'Market St', 'Church St', 'State St', 'Union St',
  'Liberty St', 'Freedom Ave', 'Independence St', 'Constitution Ave', 'Declaration St', 'Victory Ave',
  'Peace St', 'Harmony Ave', 'Unity St', 'Hope Ave', 'Faith St', 'Charity Ave', 'Love St',
  'Joy Ave', 'Peace St', 'Grace Ave', 'Mercy St', 'Compassion Ave', 'Kindness St', 'Patience Ave',
  'Gentleness St', 'Goodness Ave', 'Self-Control St', 'Wisdom Ave', 'Understanding St', 'Knowledge Ave',
  'Truth St', 'Justice Ave', 'Righteousness St', 'Holiness Ave', 'Purity St', 'Innocence Ave',
  'Virtue St', 'Honor Ave', 'Integrity St', 'Honesty Ave', 'Loyalty St', 'Fidelity Ave',
  'Devotion St', 'Dedication Ave', 'Commitment St', 'Perseverance Ave', 'Endurance St', 'Fortitude Ave',
  'Courage St', 'Bravery Ave', 'Valor St', 'Heroism Ave', 'Gallantry St', 'Nobility Ave',
  'Dignity St', 'Pride Ave', 'Self-Respect St', 'Self-Esteem Ave', 'Confidence St', 'Assurance Ave',
  'Certainty St', 'Conviction Ave', 'Belief St', 'Trust Ave', 'Faith St', 'Reliance Ave',
  'Dependence St', 'Independence Ave', 'Autonomy St', 'Freedom Ave', 'Liberty St', 'Sovereignty Ave'
];

// Generate random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const generateRandomEmail = (firstName, lastName, index) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com'];
  const randomNum = Math.floor(Math.random() * 10000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${getRandomElement(domains)}`;
};

const generateRandomPhone = () => {
  const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
  const exchange = Math.floor(Math.random() * 800) + 200; // 200-999
  const number = Math.floor(Math.random() * 10000); // 0000-9999
  return `+1 (${areaCode}) ${exchange}-${number.toString().padStart(4, '0')}`;
};

const generateRandomAddress = () => {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const street = getRandomElement(streets);
  const city = getRandomElement(cities);
  const state = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'IA', 'AR', 'NV', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH', 'ME', 'RI', 'MT', 'DE', 'SD', 'ND', 'AK', 'DC', 'VT', 'WY'][Math.floor(Math.random() * 51)];
  const zipCode = Math.floor(Math.random() * 90000) + 10000;
  return `${streetNumber} ${street}, ${city}, ${state} ${zipCode}`;
};

const generateRandomDateOfBirth = () => {
  const start = new Date(1950, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const generateRandomAvatar = () => {
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=13',
    'https://i.pravatar.cc/150?img=14',
    'https://i.pravatar.cc/150?img=15',
    'https://i.pravatar.cc/150?img=16',
    'https://i.pravatar.cc/150?img=17',
    'https://i.pravatar.cc/150?img=18',
    'https://i.pravatar.cc/150?img=19',
    'https://i.pravatar.cc/150?img=20',
    'https://i.pravatar.cc/150?img=21',
    'https://i.pravatar.cc/150?img=22',
    'https://i.pravatar.cc/150?img=23',
    'https://i.pravatar.cc/150?img=24',
    'https://i.pravatar.cc/150?img=25',
    'https://i.pravatar.cc/150?img=26',
    'https://i.pravatar.cc/150?img=27',
    'https://i.pravatar.cc/150?img=28',
    'https://i.pravatar.cc/150?img=29',
    'https://i.pravatar.cc/150?img=30',
    'https://i.pravatar.cc/150?img=31',
    'https://i.pravatar.cc/150?img=32',
    'https://i.pravatar.cc/150?img=33',
    'https://i.pravatar.cc/150?img=34',
    'https://i.pravatar.cc/150?img=35',
    'https://i.pravatar.cc/150?img=36',
    'https://i.pravatar.cc/150?img=37',
    'https://i.pravatar.cc/150?img=38',
    'https://i.pravatar.cc/150?img=39',
    'https://i.pravatar.cc/150?img=40',
    'https://i.pravatar.cc/150?img=41',
    'https://i.pravatar.cc/150?img=42',
    'https://i.pravatar.cc/150?img=43',
    'https://i.pravatar.cc/150?img=44',
    'https://i.pravatar.cc/150?img=45',
    'https://i.pravatar.cc/150?img=46',
    'https://i.pravatar.cc/150?img=47',
    'https://i.pravatar.cc/150?img=48',
    'https://i.pravatar.cc/150?img=49',
    'https://i.pravatar.cc/150?img=50',
    'https://i.pravatar.cc/150?img=51',
    'https://i.pravatar.cc/150?img=52',
    'https://i.pravatar.cc/150?img=53',
    'https://i.pravatar.cc/150?img=54',
    'https://i.pravatar.cc/150?img=55',
    'https://i.pravatar.cc/150?img=56',
    'https://i.pravatar.cc/150?img=57',
    'https://i.pravatar.cc/150?img=58',
    'https://i.pravatar.cc/150?img=59',
    'https://i.pravatar.cc/150?img=60',
    'https://i.pravatar.cc/150?img=61',
    'https://i.pravatar.cc/150?img=62',
    'https://i.pravatar.cc/150?img=63',
    'https://i.pravatar.cc/150?img=64',
    'https://i.pravatar.cc/150?img=65',
    'https://i.pravatar.cc/150?img=66',
    'https://i.pravatar.cc/150?img=67',
    'https://i.pravatar.cc/150?img=68',
    'https://i.pravatar.cc/150?img=69',
    'https://i.pravatar.cc/150?img=70'
  ];
  return getRandomElement(avatars);
};

const generateRandomPreferences = () => {
  const preferences = {
    theme: getRandomElement(['light', 'dark', 'auto']),
    language: getRandomElement(['en', 'es', 'fr', 'de', 'it', 'pt']),
    notifications: {
      email: Math.random() > 0.5,
      sms: Math.random() > 0.5,
      push: Math.random() > 0.5
    },
    timezone: getRandomElement(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu']),
    currency: getRandomElement(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
    dateFormat: getRandomElement(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
    timeFormat: getRandomElement(['12h', '24h'])
  };
  return preferences;
};

const generateRandomLastLogin = () => {
  // 30% chance of having a lastLogin date
  if (Math.random() > 0.3) {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  return null;
};

const generateRandomCreatedAt = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().slice(0, 19).replace('T', ' ');
};

const generateRandomUsers = async (count = 300) => {
  try {
    console.log(`🚀 Starting to generate ${count} random users...`);
    
    // Hash the password once for all users
    const password = 'Abc123!@#';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if role column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'role'
    `);
    const hasRoleColumn = columns.length > 0;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const email = generateRandomEmail(firstName, lastName, i);
        const phone = generateRandomPhone();
        const address = generateRandomAddress();
        const dateOfBirth = generateRandomDateOfBirth();
        const avatar = generateRandomAvatar();
        const preferences = generateRandomPreferences();
        const isActive = Math.random() > 0.1; // 90% active
        const isVerified = Math.random() > 0.2; // 80% verified
        const createdAt = generateRandomCreatedAt();
        const updatedAt = createdAt; // Set updatedAt same as createdAt initially
        const lastLogin = generateRandomLastLogin();
        const id = nanoid(10);
        
        let query, values;
        
        if (hasRoleColumn) {
          query = `
            INSERT INTO users (
              id, email, password, firstName, lastName, role, avatar,
              phone, address, dateOfBirth, preferences,
              isActive, isVerified, createdAt, updatedAt, lastLogin
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          values = [
            id,
            email,
            hashedPassword,
            firstName,
            lastName,
            3, // Default USER role
            avatar,
            phone,
            address,
            dateOfBirth,
            JSON.stringify(preferences),
            isActive,
            isVerified,
            createdAt,
            updatedAt,
            lastLogin
          ];
        } else {
          query = `
            INSERT INTO users (
              id, email, password, firstName, lastName, avatar,
              phone, address, dateOfBirth, preferences,
              isActive, isVerified, createdAt, updatedAt, lastLogin
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          values = [
            id,
            email,
            hashedPassword,
            firstName,
            lastName,
            avatar,
            phone,
            address,
            dateOfBirth,
            JSON.stringify(preferences),
            isActive,
            isVerified,
            createdAt,
            updatedAt,
            lastLogin
          ];
        }
        
        await pool.execute(query, values);
        successCount++;
        
        if ((i + 1) % 50 === 0) {
          console.log(`✅ Generated ${i + 1}/${count} users...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creating user ${i + 1}:`, error.message);
        // Continue with next user
      }
    }
    
    console.log(`\n🎉 Successfully generated ${successCount} users!`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} users failed to create.`);
    }
    console.log(`\n📝 All users have password: Abc123!@#`);
    
  } catch (error) {
    console.error('❌ Error generating users:', error);
    throw error;
  }
};

// Run if executed directly
if (require.main === module) {
  generateRandomUsers(300)
    .then(() => {
      console.log('✅ User generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 User generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateRandomUsers };

