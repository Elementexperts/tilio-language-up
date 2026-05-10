import type { Lesson, Word, Achievement, StoreItem } from '@/lib/types'

// Vocabulary words organized by category
export const vocabularyData: Word[] = [
  // Basics
  { id: 'w1', uzbek: 'Salom', english: 'Hello', category: 'basics', example: { uzbek: "Salom, qalaysiz?", english: "Hello, how are you?" } },
  { id: 'w2', uzbek: 'Qalaysiz?', english: 'How are you?', category: 'basics', example: { uzbek: "Assalomu alaykum, qalaysiz?", english: "Hello, how are you?" } },
  { id: 'w3', uzbek: 'Yaxshi', english: 'Good / Fine', category: 'basics', example: { uzbek: "Men yaxshiman", english: "I am fine" } },
  { id: 'w4', uzbek: 'Rahmat', english: 'Thank you', category: 'basics', example: { uzbek: "Yordam uchun rahmat", english: "Thank you for your help" } },
  { id: 'w5', uzbek: 'Xayr', english: 'Goodbye', category: 'basics', example: { uzbek: "Xayr, ertaga ko'rishamiz", english: "Goodbye, see you tomorrow" } },
  { id: 'w6', uzbek: 'Iltimos', english: 'Please', category: 'basics', example: { uzbek: "Iltimos, takrorlang", english: "Please repeat" } },
  { id: 'w7', uzbek: 'Kechirasiz', english: 'Excuse me / Sorry', category: 'basics', example: { uzbek: "Kechirasiz, men tushunmadim", english: "Sorry, I did not understand" } },
  { id: 'w8', uzbek: 'Tushundim', english: 'I understand', category: 'basics', example: { uzbek: "Ha, tushundim", english: "Yes, I understand" } },
  { id: 'w9', uzbek: 'Takrorlang', english: 'Repeat', category: 'basics', example: { uzbek: "Iltimos, takrorlang", english: "Please repeat" } },
  { id: 'w10', uzbek: 'Sekinroq', english: 'Slower', category: 'basics', example: { uzbek: "Sekinroq gapiring", english: "Speak slower" } },
  
  // Numbers
  { id: 'w11', uzbek: 'Nol', english: 'Zero', category: 'numbers', example: { uzbek: "Hisob nol bilan boshlanadi", english: "The count starts with zero" } },
  { id: 'w12', uzbek: 'Bir', english: 'One', category: 'numbers', example: { uzbek: "Menda bir daftar bor", english: "I have one notebook" } },
  { id: 'w13', uzbek: 'Ikki', english: 'Two', category: 'numbers', example: { uzbek: "Ikki do'st keldi", english: "Two friends came" } },
  { id: 'w14', uzbek: 'Uch', english: 'Three', category: 'numbers', example: { uzbek: "Uch marta takrorlang", english: "Repeat three times" } },
  { id: 'w15', uzbek: 'Besh', english: 'Five', category: 'numbers', example: { uzbek: "Besh daqiqa mashq qiling", english: "Practice for five minutes" } },
  { id: 'w16', uzbek: "O'n", english: 'Ten', category: 'numbers', example: { uzbek: "O'n ta so'z o'rganamiz", english: "We will learn ten words" } },
  { id: 'w17', uzbek: 'Nechta?', english: 'How many?', category: 'numbers', example: { uzbek: "Sizda nechta kitob bor?", english: "How many books do you have?" } },
  { id: 'w18', uzbek: 'Ko\'p', english: 'Many / A lot', category: 'numbers', example: { uzbek: "Ko'p yangi so'z bor", english: "There are many new words" } },
  { id: 'w19', uzbek: 'Kam', english: 'Few / Little', category: 'numbers', example: { uzbek: "Vaqt kam", english: "There is little time" } },
  { id: 'w20', uzbek: 'Narx', english: 'Price', category: 'numbers', example: { uzbek: "Narx qancha?", english: "What is the price?" } },
  
  // Family
  { id: 'w21', uzbek: 'Ona', english: 'Mother', category: 'family', example: { uzbek: "Mening onam shifokor", english: "My mother is a doctor" } },
  { id: 'w22', uzbek: 'Ota', english: 'Father', category: 'family' },
  { id: 'w23', uzbek: 'Aka', english: 'Brother (older)', category: 'family' },
  { id: 'w24', uzbek: 'Uka', english: 'Brother (younger)', category: 'family' },
  { id: 'w25', uzbek: 'Opa', english: 'Sister (older)', category: 'family' },
  { id: 'w26', uzbek: 'Singil', english: 'Sister (younger)', category: 'family' },
  { id: 'w27', uzbek: 'Buvi', english: 'Grandmother', category: 'family' },
  { id: 'w28', uzbek: 'Bobo', english: 'Grandfather', category: 'family' },
  { id: 'w29', uzbek: 'Oila', english: 'Family', category: 'family' },
  { id: 'w30', uzbek: 'Bola', english: 'Child', category: 'family' },
  
  // Food
  { id: 'w31', uzbek: 'Non', english: 'Bread', category: 'food', example: { uzbek: "Yangi non juda mazali", english: "Fresh bread is very delicious" } },
  { id: 'w32', uzbek: 'Suv', english: 'Water', category: 'food' },
  { id: 'w33', uzbek: 'Choy', english: 'Tea', category: 'food' },
  { id: 'w34', uzbek: "Go'sht", english: 'Meat', category: 'food' },
  { id: 'w35', uzbek: 'Guruch', english: 'Rice', category: 'food' },
  { id: 'w36', uzbek: 'Sabzi', english: 'Vegetables', category: 'food' },
  { id: 'w37', uzbek: 'Meva', english: 'Fruit', category: 'food' },
  { id: 'w38', uzbek: 'Olma', english: 'Apple', category: 'food' },
  { id: 'w39', uzbek: 'Palov', english: 'Pilaf (traditional rice dish)', category: 'food' },
  { id: 'w40', uzbek: 'Somsa', english: 'Samosa (meat pastry)', category: 'food' },
  
  // Places
  { id: 'w41', uzbek: 'Uy', english: 'House/Home', category: 'places', example: { uzbek: "Men uyda yashayman", english: "I live at home" } },
  { id: 'w42', uzbek: 'Maktab', english: 'School', category: 'places' },
  { id: 'w43', uzbek: 'Bozor', english: 'Market/Bazaar', category: 'places' },
  { id: 'w44', uzbek: "Do'kon", english: 'Shop/Store', category: 'places' },
  { id: 'w45', uzbek: 'Kasalxona', english: 'Hospital', category: 'places' },
  { id: 'w46', uzbek: 'Restoran', english: 'Restaurant', category: 'places' },
  { id: 'w47', uzbek: 'Masjid', english: 'Mosque', category: 'places' },
  { id: 'w48', uzbek: 'Park', english: 'Park', category: 'places' },
  { id: 'w49', uzbek: 'Shahar', english: 'City', category: 'places' },
  { id: 'w50', uzbek: 'Qishloq', english: 'Village', category: 'places' },
  
  // Colors
  { id: 'w51', uzbek: 'Qizil', english: 'Red', category: 'colors' },
  { id: 'w52', uzbek: "Ko'k", english: 'Blue', category: 'colors' },
  { id: 'w53', uzbek: 'Yashil', english: 'Green', category: 'colors' },
  { id: 'w54', uzbek: 'Sariq', english: 'Yellow', category: 'colors' },
  { id: 'w55', uzbek: 'Oq', english: 'White', category: 'colors' },
  { id: 'w56', uzbek: 'Qora', english: 'Black', category: 'colors' },
  { id: 'w57', uzbek: 'Pushti', english: 'Pink', category: 'colors' },
  { id: 'w58', uzbek: "To'q sariq", english: 'Orange', category: 'colors' },
  { id: 'w59', uzbek: 'Jigarrang', english: 'Brown', category: 'colors' },
  { id: 'w60', uzbek: 'Kulrang', english: 'Gray', category: 'colors' },
  
  // Time
  { id: 'w61', uzbek: 'Bugun', english: 'Today', category: 'time' },
  { id: 'w62', uzbek: 'Ertaga', english: 'Tomorrow', category: 'time' },
  { id: 'w63', uzbek: 'Kecha', english: 'Yesterday', category: 'time' },
  { id: 'w64', uzbek: 'Hafta', english: 'Week', category: 'time' },
  { id: 'w65', uzbek: 'Oy', english: 'Month', category: 'time' },
  { id: 'w66', uzbek: 'Yil', english: 'Year', category: 'time' },
  { id: 'w67', uzbek: 'Soat', english: 'Hour/Clock', category: 'time' },
  { id: 'w68', uzbek: 'Daqiqa', english: 'Minute', category: 'time' },
  { id: 'w69', uzbek: 'Ertalab', english: 'Morning', category: 'time' },
  { id: 'w70', uzbek: 'Kechqurun', english: 'Evening', category: 'time' },
  
  // Actions
  { id: 'w71', uzbek: 'Bormoq', english: 'To go', category: 'actions' },
  { id: 'w72', uzbek: 'Kelmoq', english: 'To come', category: 'actions' },
  { id: 'w73', uzbek: "Yemoq", english: 'To eat', category: 'actions' },
  { id: 'w74', uzbek: 'Ichmoq', english: 'To drink', category: 'actions' },
  { id: 'w75', uzbek: "O'qimoq", english: 'To read', category: 'actions' },
  { id: 'w76', uzbek: 'Yozmoq', english: 'To write', category: 'actions' },
  { id: 'w77', uzbek: 'Gapirmoq', english: 'To speak', category: 'actions' },
  { id: 'w78', uzbek: 'Eshitmoq', english: 'To hear/listen', category: 'actions' },
  { id: 'w79', uzbek: "Ko'rmoq", english: 'To see', category: 'actions' },
  { id: 'w80', uzbek: 'Ishlamoq', english: 'To work', category: 'actions' },
  
  // Daily phrases
  { id: 'w81', uzbek: 'Tanishganimdan xursandman', english: 'Nice to meet you', category: 'phrases' },
  { id: 'w82', uzbek: 'Sizchi?', english: 'And you?', category: 'phrases' },
  { id: 'w83', uzbek: 'Ismingiz nima?', english: 'What is your name?', category: 'phrases' },
  { id: 'w84', uzbek: 'Mening ismim...', english: 'My name is...', category: 'phrases' },
  { id: 'w85', uzbek: 'Qayerdan?', english: 'Where from?', category: 'phrases' },
  { id: 'w86', uzbek: 'Men tushunmadim', english: "I don't understand", category: 'phrases' },
  { id: 'w87', uzbek: 'Yana bir bor', english: 'One more time', category: 'phrases' },
  { id: 'w88', uzbek: 'Sekin gapiring', english: 'Speak slowly', category: 'phrases' },
  { id: 'w89', uzbek: 'Bu nima?', english: 'What is this?', category: 'phrases' },
  { id: 'w90', uzbek: 'Qancha?', english: 'How much?', category: 'phrases' },
  
  // Weather
  { id: 'w91', uzbek: 'Ob-havo', english: 'Weather', category: 'weather' },
  { id: 'w92', uzbek: 'Quyosh', english: 'Sun', category: 'weather' },
  { id: 'w93', uzbek: 'Yomg\'ir', english: 'Rain', category: 'weather' },
  { id: 'w94', uzbek: 'Qor', english: 'Snow', category: 'weather' },
  { id: 'w95', uzbek: 'Issiq', english: 'Hot', category: 'weather' },
  { id: 'w96', uzbek: 'Sovuq', english: 'Cold', category: 'weather' },
  { id: 'w97', uzbek: 'Shamol', english: 'Wind', category: 'weather' },
  { id: 'w98', uzbek: 'Bulut', english: 'Cloud', category: 'weather' },
  { id: 'w99', uzbek: 'Iliq', english: 'Warm', category: 'weather' },
  { id: 'w100', uzbek: 'Salqin', english: 'Cool', category: 'weather' },
]

type ExtraLessonSeed = {
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  category: string
  skillFocus: NonNullable<Lesson['skillFocus']>
  words: Array<[string, string, string, string]>
}

const extraLessonSeeds: ExtraLessonSeed[] = [
  { title: 'Airport Basics', titleUz: 'Aeroport asoslari', description: 'Useful words for arrival and departure', descriptionUz: 'Kelish va ketish uchun kerakli so\'zlar', category: 'travel', skillFocus: 'listening', words: [['Chiptam bor', 'I have a ticket', 'Menda chiptam bor', 'I have a ticket'], ['Pasport', 'Passport', 'Pasportingizni ko\'rsating', 'Show your passport'], ['Parvoz', 'Flight', 'Parvoz kechikdi', 'The flight is delayed'], ['Yuk', 'Luggage', 'Yukim qayerda?', 'Where is my luggage?'], ['Darvoza', 'Gate', 'Darvoza raqami besh', 'The gate number is five']] },
  { title: 'On the Street', titleUz: 'Ko\'chada', description: 'Ask and understand street directions', descriptionUz: 'Yo\'nalish so\'rash va tushunish', category: 'travel', skillFocus: 'speaking', words: [['Chapga', 'To the left', 'Chapga buriling', 'Turn to the left'], ['O\'ngga', 'To the right', 'O\'ngga yuring', 'Go to the right'], ['To\'g\'ri', 'Straight', 'To\'g\'ri yuring', 'Go straight'], ['Yaqin', 'Near', 'Bekat yaqin', 'The stop is near'], ['Uzoq', 'Far', 'Mehmonxona uzoq', 'The hotel is far']] },
  { title: 'Hotel Check-in', titleUz: 'Mehmonxonaga kirish', description: 'Check in and ask for a room', descriptionUz: 'Xona so\'rash va ro\'yxatdan o\'tish', category: 'travel', skillFocus: 'speaking', words: [['Xona', 'Room', 'Menga xona kerak', 'I need a room'], ['Kalit', 'Key', 'Kalitni bering', 'Give me the key'], ['Band', 'Reserved', 'Xona band qilingan', 'The room is reserved'], ['Tun', 'Night', 'Bir tun qolaman', 'I will stay one night'], ['Qavat', 'Floor', 'Xona ikkinchi qavatda', 'The room is on the second floor']] },
  { title: 'Cafe Orders', titleUz: 'Kafeda buyurtma', description: 'Order food and drinks politely', descriptionUz: 'Ovqat va ichimlikni odob bilan buyurtma qiling', category: 'food', skillFocus: 'speaking', words: [['Buyurtma', 'Order', 'Buyurtma bermoqchiman', 'I want to order'], ['Menyu', 'Menu', 'Menyuni bering', 'Give me the menu'], ['Qahva', 'Coffee', 'Menga qahva kerak', 'I need coffee'], ['Shirin', 'Sweet', 'Choy juda shirin', 'The tea is very sweet'], ['Hisob', 'Bill', 'Hisobni olib keling', 'Bring the bill']] },
  { title: 'Market Talk', titleUz: 'Bozorda suhbat', description: 'Buy things and compare prices', descriptionUz: 'Narsa olish va narx solishtirish', category: 'shopping', skillFocus: 'listening', words: [['Arzon', 'Cheap', 'Bu juda arzon', 'This is very cheap'], ['Qimmat', 'Expensive', 'Bu qimmat emas', 'This is not expensive'], ['Olmoq', 'To buy', 'Men olma olaman', 'I buy apples'], ['Sotmoq', 'To sell', 'U non sotadi', 'He sells bread'], ['Chegirma', 'Discount', 'Chegirma bormi?', 'Is there a discount?']] },
  { title: 'Clothes', titleUz: 'Kiyimlar', description: 'Talk about clothes and sizes', descriptionUz: 'Kiyim va o\'lcham haqida gapiring', category: 'shopping', skillFocus: 'reading', words: [['Ko\'ylak', 'Dress / Shirt', 'Ko\'ylak oq', 'The shirt is white'], ['Shim', 'Pants', 'Shim menga mos', 'The pants fit me'], ['Poyabzal', 'Shoes', 'Poyabzal yangi', 'The shoes are new'], ['O\'lcham', 'Size', 'O\'lchamingiz qanday?', 'What is your size?'], ['Kiyib ko\'rmoq', 'To try on', 'Kiyib ko\'rsam bo\'ladimi?', 'May I try it on?']] },
  { title: 'Daily Routine', titleUz: 'Kundalik tartib', description: 'Describe a normal day', descriptionUz: 'Oddiy kuningizni tasvirlang', category: 'daily-life', skillFocus: 'reading', words: [['Uyg\'onmoq', 'To wake up', 'Men erta uyg\'onaman', 'I wake up early'], ['Yuvinmoq', 'To wash', 'Men ertalab yuvinaman', 'I wash in the morning'], ['Nonushta', 'Breakfast', 'Nonushta qilaman', 'I have breakfast'], ['Ketmoq', 'To leave', 'Men ishga ketaman', 'I leave for work'], ['Qaytmoq', 'To return', 'Men uyga qaytaman', 'I return home']] },
  { title: 'At Home', titleUz: 'Uyda', description: 'Name common home objects', descriptionUz: 'Uy buyumlarini nomlang', category: 'daily-life', skillFocus: 'reading', words: [['Eshik', 'Door', 'Eshik ochiq', 'The door is open'], ['Deraza', 'Window', 'Deraza yopiq', 'The window is closed'], ['Stol', 'Table', 'Stol ustida kitob bor', 'There is a book on the table'], ['Stul', 'Chair', 'Stul yangi', 'The chair is new'], ['Karavot', 'Bed', 'Karavot katta', 'The bed is big']] },
  { title: 'Health Basics', titleUz: 'Sog\'liq asoslari', description: 'Explain simple health problems', descriptionUz: 'Oddiy sog\'liq muammolarini ayting', category: 'health', skillFocus: 'speaking', words: [['Og\'riq', 'Pain', 'Boshim og\'riyapti', 'My head hurts'], ['Dori', 'Medicine', 'Menga dori kerak', 'I need medicine'], ['Shifokor', 'Doctor', 'Shifokor qayerda?', 'Where is the doctor?'], ['Charchagan', 'Tired', 'Men charchaganman', 'I am tired'], ['Yordam', 'Help', 'Yordam kerak', 'Help is needed']] },
  { title: 'Travel Review', titleUz: 'Sayohat takrori', description: 'Review travel, shopping, daily life, and health', descriptionUz: 'Sayohat, xarid, kundalik hayot va sog\'liqni takrorlang', category: 'review', skillFocus: 'mixed', words: [] },
  { title: 'People Around You', titleUz: 'Atrofdagi odamlar', description: 'Describe people in daily life', descriptionUz: 'Kundalik hayotdagi odamlarni tasvirlang', category: 'people', skillFocus: 'reading', words: [['Do\'st', 'Friend', 'Do\'stim shu yerda', 'My friend is here'], ['Qo\'shni', 'Neighbor', 'Qo\'shnim yaxshi', 'My neighbor is kind'], ['Hamkasb', 'Coworker', 'Hamkasbim yordam berdi', 'My coworker helped'], ['Mehmon', 'Guest', 'Mehmon keldi', 'A guest came'], ['O\'qituvchi', 'Teacher', 'O\'qituvchi gapiryapti', 'The teacher is speaking']] },
  { title: 'Feelings', titleUz: 'His-tuyg\'ular', description: 'Say how you feel', descriptionUz: 'O\'zingizni qanday his qilayotganingizni ayting', category: 'feelings', skillFocus: 'speaking', words: [['Xursand', 'Happy', 'Men xursandman', 'I am happy'], ['Xafa', 'Sad', 'U xafa', 'He is sad'], ['Hayajonlangan', 'Excited', 'Biz hayajonlanganmiz', 'We are excited'], ['Qo\'rqmoq', 'To be afraid', 'Men qo\'rqmayman', 'I am not afraid'], ['Tinch', 'Calm', 'U tinch', 'She is calm']] },
  { title: 'Opinions', titleUz: 'Fikrlar', description: 'Share simple opinions', descriptionUz: 'Oddiy fikr bildiring', category: 'communication', skillFocus: 'speaking', words: [['O\'ylamoq', 'To think', 'Men shunday o\'ylayman', 'I think so'], ['Bilmoq', 'To know', 'Men bilaman', 'I know'], ['Yoqmoq', 'To like', 'Menga yoqadi', 'I like it'], ['Yomon ko\'rmoq', 'To dislike', 'Men shovqinni yomon ko\'raman', 'I dislike noise'], ['Fikr', 'Opinion', 'Fikringiz qanday?', 'What is your opinion?']] },
  { title: 'Phone Words', titleUz: 'Telefon so\'zlari', description: 'Use phone and message vocabulary', descriptionUz: 'Telefon va xabar so\'zlarini ishlating', category: 'technology', skillFocus: 'reading', words: [['Telefon', 'Phone', 'Telefonim yangi', 'My phone is new'], ['Xabar', 'Message', 'Xabar yuboring', 'Send a message'], ['Qo\'ng\'iroq', 'Call', 'Qo\'ng\'iroq qiling', 'Make a call'], ['Rasm', 'Photo', 'Rasm yubordim', 'I sent a photo'], ['Ilova', 'App', 'Ilova ishlayapti', 'The app is working']] },
  { title: 'Internet Basics', titleUz: 'Internet asoslari', description: 'Talk about online actions', descriptionUz: 'Onlayn harakatlar haqida gapiring', category: 'technology', skillFocus: 'listening', words: [['Internet', 'Internet', 'Internet sekin', 'The internet is slow'], ['Parol', 'Password', 'Parolni yozing', 'Write the password'], ['Kirish', 'Log in', 'Hisobga kiring', 'Log in to the account'], ['Yuklamoq', 'To download', 'Faylni yuklang', 'Download the file'], ['Ulanmoq', 'To connect', 'Wi-Fi ga ulanaman', 'I connect to Wi-Fi']] },
  { title: 'Work Day', titleUz: 'Ish kuni', description: 'Describe work and tasks', descriptionUz: 'Ish va vazifalarni tasvirlang', category: 'work', skillFocus: 'reading', words: [['Ish', 'Work', 'Men ishga boraman', 'I go to work'], ['Vazifa', 'Task', 'Vazifa tayyor', 'The task is ready'], ['Uchrashuv', 'Meeting', 'Uchrashuv bugun', 'The meeting is today'], ['Rahbar', 'Manager', 'Rahbar keldi', 'The manager came'], ['Jamoa', 'Team', 'Jamoamiz kuchli', 'Our team is strong']] },
  { title: 'Study Skills', titleUz: 'O\'qish ko\'nikmalari', description: 'Talk about learning habits', descriptionUz: 'O\'rganish odatlari haqida gapiring', category: 'study', skillFocus: 'writing', words: [['Dars', 'Lesson', 'Dars boshlandi', 'The lesson started'], ['Mashq', 'Practice', 'Mashq qiling', 'Practice'], ['Eslamoq', 'To remember', 'So\'zni esladim', 'I remembered the word'], ['Yozib olmoq', 'To write down', 'Yozib oling', 'Write it down'], ['Tekshirmoq', 'To check', 'Javobni tekshiring', 'Check the answer']] },
  { title: 'Reading Signs', titleUz: 'Belgilarni o\'qish', description: 'Read simple signs and labels', descriptionUz: 'Oddiy belgilarni o\'qing', category: 'reading', skillFocus: 'reading', words: [['Kirish joyi', 'Entrance', 'Kirish joyi chapda', 'The entrance is on the left'], ['Chiqish', 'Exit', 'Chiqish qayerda?', 'Where is the exit?'], ['Ochiq', 'Open', 'Do\'kon ochiq', 'The shop is open'], ['Yopiq', 'Closed', 'Bank yopiq', 'The bank is closed'], ['Taqiqlangan', 'Forbidden', 'Bu yerda chekish taqiqlangan', 'Smoking is forbidden here']] },
  { title: 'Messages Review', titleUz: 'Xabarlar takrori', description: 'Review people, feelings, tech, work, and study', descriptionUz: 'Odamlar, hislar, texnologiya, ish va o\'qishni takrorlang', category: 'review', skillFocus: 'mixed', words: [] },
  { title: 'To Be: I Am', titleUz: 'To be: I am', description: 'Use am for yourself', descriptionUz: 'O\'zingiz haqida am bilan gapiring', category: 'grammar', skillFocus: 'grammar', words: [['Menman', 'I am', 'Men o\'quvchiman', 'I am a student'], ['Tayyorman', 'I am ready', 'Men tayyorman', 'I am ready'], ['Bandman', 'I am busy', 'Men hozir bandman', 'I am busy now'], ['Ochman', 'I am hungry', 'Men ochman', 'I am hungry'], ['Uyda', 'At home', 'Men uyda turibman', 'I am at home']] },
  { title: 'To Be: He Is', titleUz: 'To be: he is', description: 'Use is for one person or thing', descriptionUz: 'Bitta odam yoki narsa uchun is ishlating', category: 'grammar', skillFocus: 'grammar', words: [['U', 'He / She', 'U o\'qituvchi', 'He is a teacher'], ['Bu', 'This is', 'Bu kitob', 'This is a book'], ['Issiqmi?', 'Is it hot?', 'Bugun issiqmi?', 'Is it hot today?'], ['Tayyor', 'Ready', 'Ovqat tayyor', 'The food is ready'], ['Muhim', 'Important', 'Bu muhim', 'This is important']] },
  { title: 'To Be: We Are', titleUz: 'To be: we are', description: 'Use are for groups and you', descriptionUz: 'Guruhlar va siz uchun are ishlating', category: 'grammar', skillFocus: 'grammar', words: [['Biz', 'We are', 'Biz tayyormiz', 'We are ready'], ['Siz', 'You are', 'Siz yaxshisiz', 'You are good'], ['Ular', 'They are', 'Ular uyda', 'They are at home'], ['Birga', 'Together', 'Biz birgamiz', 'We are together'], ['Kechikkan', 'Late', 'Ular kechikkan', 'They are late']] },
  { title: 'Present Simple', titleUz: 'Present simple', description: 'Talk about habits and facts', descriptionUz: 'Odatlar va faktlar haqida gapiring', category: 'grammar', skillFocus: 'grammar', words: [['Har kuni', 'Every day', 'Men har kuni o\'qiyman', 'I study every day'], ['Odatda', 'Usually', 'Men odatda choy ichaman', 'I usually drink tea'], ['Yashayman', 'I live', 'Men Toshkentda yashayman', 'I live in Tashkent'], ['Ishlayman', 'I work', 'Men uyda ishlayman', 'I work at home'], ['O\'rganaman', 'I learn', 'Men inglizcha o\'rganaman', 'I learn English']] },
  { title: 'Present Questions', titleUz: 'Present savollari', description: 'Ask simple present questions', descriptionUz: 'Oddiy hozirgi zamon savollarini bering', category: 'grammar', skillFocus: 'speaking', words: [['Qayerda yashaysiz?', 'Where do you live?', 'Siz qayerda yashaysiz?', 'Where do you live?'], ['Nima qilasiz?', 'What do you do?', 'Siz nima qilasiz?', 'What do you do?'], ['Yoqadimi?', 'Do you like it?', 'Sizga yoqadimi?', 'Do you like it?'], ['Bilasanmi?', 'Do you know?', 'Javobni bilasanmi?', 'Do you know the answer?'], ['Kerakmi?', 'Do you need?', 'Sizga yordam kerakmi?', 'Do you need help?']] },
  { title: 'Past Simple', titleUz: 'Past simple', description: 'Talk about completed actions', descriptionUz: 'Tugagan harakatlar haqida gapiring', category: 'grammar', skillFocus: 'grammar', words: [['Kecha bordim', 'I went yesterday', 'Kecha bozorga bordim', 'I went to the market yesterday'], ['Ko\'rdim', 'I saw', 'Men film ko\'rdim', 'I saw a movie'], ['Oldim', 'I bought', 'Men non oldim', 'I bought bread'], ['Yozdim', 'I wrote', 'Men xabar yozdim', 'I wrote a message'], ['Tugatdim', 'I finished', 'Men darsni tugatdim', 'I finished the lesson']] },
  { title: 'Future Simple', titleUz: 'Future simple', description: 'Talk about plans with will', descriptionUz: 'Will bilan reja ayting', category: 'grammar', skillFocus: 'writing', words: [['Boraman', 'I will go', 'Ertaga boraman', 'I will go tomorrow'], ['Qilaman', 'I will do', 'Men mashq qilaman', 'I will practice'], ['Ko\'raman', 'I will see', 'Men sizni ko\'raman', 'I will see you'], ['O\'rganaman', 'I will learn', 'Men yangi so\'z o\'rganaman', 'I will learn a new word'], ['Yordam beraman', 'I will help', 'Men yordam beraman', 'I will help']] },
  { title: 'Time Connectors', titleUz: 'Vaqt bog\'lovchilari', description: 'Connect events in time', descriptionUz: 'Voqealarni vaqt bilan bog\'lang', category: 'grammar', skillFocus: 'reading', words: [['Oldin', 'Before', 'Darsdan oldin o\'qiyman', 'I study before class'], ['Keyin', 'After', 'Ishdan keyin kelaman', 'I come after work'], ['Hozir', 'Now', 'Men hozir shu yerdaman', 'I am here now'], ['Tez orada', 'Soon', 'Tez orada ko\'rishamiz', 'We will see each other soon'], ['Allaqachon', 'Already', 'Men allaqachon boshladim', 'I already started']] },
  { title: 'Grammar Review', titleUz: 'Grammatika takrori', description: 'Review to be, present, past, and future', descriptionUz: 'To be, present, past va future ni takrorlang', category: 'review', skillFocus: 'mixed', words: [] },
  { title: 'Listening for Details', titleUz: 'Tafsilotlarni eshitish', description: 'Catch key information by ear', descriptionUz: 'Muhim ma\'lumotni eshitib oling', category: 'listening', skillFocus: 'listening', words: [['Eshitdim', 'I heard', 'Men ovozni eshitdim', 'I heard the sound'], ['Aniq', 'Clear', 'Ovoz aniq', 'The sound is clear'], ['Shovqin', 'Noise', 'Bu yerda shovqin bor', 'There is noise here'], ['Baland', 'Loud', 'Ovoz baland', 'The sound is loud'], ['Past', 'Quiet / Low', 'Ovoz past', 'The sound is quiet']] },
  { title: 'Reading Short Notes', titleUz: 'Qisqa yozuvlar', description: 'Read short practical notes', descriptionUz: 'Qisqa foydali yozuvlarni o\'qing', category: 'reading', skillFocus: 'reading', words: [['E\'lon', 'Announcement', 'E\'lonni o\'qing', 'Read the announcement'], ['Ro\'yxat', 'List', 'Ro\'yxatda ismim bor', 'My name is on the list'], ['Manzil', 'Address', 'Manzilni yozing', 'Write the address'], ['Eslatma', 'Note', 'Eslatma qoldiring', 'Leave a note'], ['Sarlavha', 'Title', 'Sarlavha qisqa', 'The title is short']] },
  { title: 'Writing Sentences', titleUz: 'Gap yozish', description: 'Build simple English sentences', descriptionUz: 'Oddiy inglizcha gaplar tuzing', category: 'writing', skillFocus: 'writing', words: [['Gap', 'Sentence', 'Gap yozing', 'Write a sentence'], ['So\'z tartibi', 'Word order', 'So\'z tartibi muhim', 'Word order is important'], ['Bosh harf', 'Capital letter', 'Bosh harf bilan boshlang', 'Start with a capital letter'], ['Nuqta', 'Period', 'Oxirida nuqta qo\'ying', 'Put a period at the end'], ['Xato', 'Mistake', 'Xatoni tuzating', 'Correct the mistake']] },
  { title: 'Speaking Clearly', titleUz: 'Aniq gapirish', description: 'Practice clear pronunciation', descriptionUz: 'Aniq talaffuzni mashq qiling', category: 'speaking', skillFocus: 'speaking', words: [['Talaffuz', 'Pronunciation', 'Talaffuzni mashq qiling', 'Practice pronunciation'], ['Ovoz', 'Voice', 'Ovozingiz yaxshi', 'Your voice is good'], ['Qayta ayting', 'Say it again', 'Qayta ayting', 'Say it again'], ['Ravon', 'Fluent', 'Ravon gapiring', 'Speak fluently'], ['Ishonch', 'Confidence', 'Ishonch bilan gapiring', 'Speak with confidence']] },
  { title: 'Conversation Starters', titleUz: 'Suhbat boshlash', description: 'Start simple conversations', descriptionUz: 'Oddiy suhbatlarni boshlang', category: 'speaking', skillFocus: 'speaking', words: [['Nima gap?', 'What\'s up?', 'Nima gap?', 'What\'s up?'], ['Qanday o\'tdi?', 'How was it?', 'Kuningiz qanday o\'tdi?', 'How was your day?'], ['Yaxshi fikr', 'Good idea', 'Bu yaxshi fikr', 'This is a good idea'], ['Roziman', 'I agree', 'Men roziman', 'I agree'], ['Bilmadim', 'I don\'t know', 'Men bilmadim', 'I do not know']] },
  { title: 'Plans and Goals', titleUz: 'Reja va maqsadlar', description: 'Talk about goals and next steps', descriptionUz: 'Maqsad va keyingi qadamlar haqida gapiring', category: 'goals', skillFocus: 'writing', words: [['Maqsad', 'Goal', 'Maqsadim bor', 'I have a goal'], ['Reja', 'Plan', 'Reja tuzdim', 'I made a plan'], ['Bosqich', 'Step', 'Keyingi bosqich oson', 'The next step is easy'], ['Natija', 'Result', 'Natija yaxshi', 'The result is good'], ['Muvaffaqiyat', 'Success', 'Muvaffaqiyat tilayman', 'I wish you success']] },
  { title: 'Problems and Fixes', titleUz: 'Muammo va yechim', description: 'Explain problems and solutions', descriptionUz: 'Muammo va yechimni tushuntiring', category: 'communication', skillFocus: 'speaking', words: [['Muammo', 'Problem', 'Muammo bor', 'There is a problem'], ['Yechim', 'Solution', 'Yechim topdim', 'I found a solution'], ['Sabab', 'Reason', 'Sababini bilaman', 'I know the reason'], ['Tuzatmoq', 'To fix', 'Xatoni tuzating', 'Fix the mistake'], ['Urinmoq', 'To try', 'Yana urinib ko\'ring', 'Try again']] },
  { title: 'Compare Things', titleUz: 'Solishtirish', description: 'Compare simple things', descriptionUz: 'Oddiy narsalarni solishtiring', category: 'grammar', skillFocus: 'grammar', words: [['Kattaroq', 'Bigger', 'Bu uy kattaroq', 'This house is bigger'], ['Kichikroq', 'Smaller', 'Bu xona kichikroq', 'This room is smaller'], ['Yaxshiroq', 'Better', 'Bu javob yaxshiroq', 'This answer is better'], ['Tezroq', 'Faster', 'Tezroq yuring', 'Walk faster'], ['Osonroq', 'Easier', 'Bu mashq osonroq', 'This exercise is easier']] },
  { title: 'Skill Review', titleUz: 'Ko\'nikmalar takrori', description: 'Review listening, reading, writing, and speaking', descriptionUz: 'Listening, reading, writing va speaking ni takrorlang', category: 'review', skillFocus: 'mixed', words: [] },
  { title: 'Nature Walk', titleUz: 'Tabiat sayri', description: 'Talk about nature outside', descriptionUz: 'Tashqaridagi tabiat haqida gapiring', category: 'nature', skillFocus: 'reading', words: [['Daraxt', 'Tree', 'Daraxt baland', 'The tree is tall'], ['Gul', 'Flower', 'Gul chiroyli', 'The flower is beautiful'], ['Daryo', 'River', 'Daryo yaqin', 'The river is near'], ['Tog\'', 'Mountain', 'Tog\' uzoq', 'The mountain is far'], ['Osmon', 'Sky', 'Osmon ko\'k', 'The sky is blue']] },
  { title: 'City Life', titleUz: 'Shahar hayoti', description: 'Describe city movement', descriptionUz: 'Shahar harakatini tasvirlang', category: 'city', skillFocus: 'listening', words: [['Bekat', 'Stop', 'Bekat shu yerda', 'The stop is here'], ['Avtobus', 'Bus', 'Avtobus keldi', 'The bus arrived'], ['Mashina', 'Car', 'Mashina tez', 'The car is fast'], ['Yo\'l', 'Road', 'Yo\'l band', 'The road is busy'], ['Chorraha', 'Crossroads', 'Chorraha oldinda', 'The crossroads is ahead']] },
  { title: 'Money and Banking', titleUz: 'Pul va bank', description: 'Use basic money words', descriptionUz: 'Pulga oid oddiy so\'zlarni ishlating', category: 'money', skillFocus: 'reading', words: [['Pul', 'Money', 'Pulim bor', 'I have money'], ['Karta', 'Card', 'Karta bilan to\'layman', 'I pay by card'], ['Naqd', 'Cash', 'Naqd pul kerak', 'Cash is needed'], ['Bank', 'Bank', 'Bank yopiq', 'The bank is closed'], ['To\'lamoq', 'To pay', 'Men to\'layman', 'I will pay']] },
  { title: 'Emergencies', titleUz: 'Favqulodda holatlar', description: 'Ask for urgent help', descriptionUz: 'Shoshilinch yordam so\'rang', category: 'safety', skillFocus: 'speaking', words: [['Shoshiling', 'Hurry', 'Iltimos, shoshiling', 'Please hurry'], ['Xavfli', 'Dangerous', 'Bu xavfli', 'This is dangerous'], ['Yo\'qoldim', 'I am lost', 'Men yo\'qoldim', 'I am lost'], ['Politsiya', 'Police', 'Politsiyani chaqiring', 'Call the police'], ['Tez yordam', 'Ambulance', 'Tez yordam kerak', 'An ambulance is needed']] },
  { title: 'Small Talk', titleUz: 'Qisqa suhbat', description: 'Keep a light conversation going', descriptionUz: 'Yengil suhbatni davom ettiring', category: 'communication', skillFocus: 'speaking', words: [['Ajoyib', 'Great', 'Bu ajoyib', 'This is great'], ['Qiziq', 'Interesting', 'Bu juda qiziq', 'This is very interesting'], ['Albatta', 'Of course', 'Albatta kelaman', 'Of course I will come'], ['Balki', 'Maybe', 'Balki ertaga', 'Maybe tomorrow'], ['Mayli', 'Okay', 'Mayli, boshlaymiz', 'Okay, let us start']] },
  { title: 'Email Basics', titleUz: 'Email asoslari', description: 'Write simple emails', descriptionUz: 'Oddiy email yozing', category: 'writing', skillFocus: 'writing', words: [['Email', 'Email', 'Email yubordim', 'I sent an email'], ['Mavzu', 'Subject', 'Mavzuni yozing', 'Write the subject'], ['Hurmatli', 'Dear', 'Hurmatli ustoz', 'Dear teacher'], ['Javob', 'Reply', 'Javob kutyapman', 'I am waiting for a reply'], ['Imzo', 'Signature', 'Imzo qo\'ying', 'Add a signature']] },
  { title: 'Story Order', titleUz: 'Hikoya tartibi', description: 'Put events in order', descriptionUz: 'Voqealarni tartibga qo\'ying', category: 'reading', skillFocus: 'reading', words: [['Birinchidan', 'First', 'Birinchidan, tinglang', 'First, listen'], ['Ikkinchidan', 'Second', 'Ikkinchidan, yozing', 'Second, write'], ['Oxirida', 'Finally', 'Oxirida tekshiring', 'Finally, check'], ['Voqea', 'Event', 'Voqea kecha bo\'ldi', 'The event happened yesterday'], ['Hikoya', 'Story', 'Hikoya qiziq', 'The story is interesting']] },
  { title: 'Arts and Culture', titleUz: 'San\'at va madaniyat', description: 'Talk about music, art, and events', descriptionUz: 'Musiqa, san\'at va tadbirlar haqida gapiring', category: 'culture', skillFocus: 'listening', words: [['Musiqa', 'Music', 'Musiqa yoqimli', 'The music is pleasant'], ['Qo\'shiq', 'Song', 'Qo\'shiq eshitdim', 'I heard a song'], ['Raqs', 'Dance', 'Raqs chiroyli', 'The dance is beautiful'], ['Rasm chizmoq', 'To draw', 'Men rasm chizaman', 'I draw a picture'], ['Tadbir', 'Event', 'Tadbir bugun', 'The event is today']] },
  { title: 'Holidays', titleUz: 'Bayramlar', description: 'Share wishes and plans for holidays', descriptionUz: 'Bayram tilaklari va rejalarini ayting', category: 'culture', skillFocus: 'speaking', words: [['Bayram', 'Holiday', 'Bayram muborak', 'Happy holiday'], ['Sovg\'a', 'Gift', 'Sovg\'a oldim', 'I received a gift'], ['Tabrik', 'Congratulations', 'Tabrik yubordim', 'I sent congratulations'], ['Mehmon qilmoq', 'To host', 'Biz mehmon qilamiz', 'We host guests'], ['Nishonlamoq', 'To celebrate', 'Biz bayramni nishonlaymiz', 'We celebrate the holiday']] },
  { title: 'Environment', titleUz: 'Atrof-muhit', description: 'Talk about clean and green places', descriptionUz: 'Toza va yashil joylar haqida gapiring', category: 'nature', skillFocus: 'reading', words: [['Toza', 'Clean', 'Ko\'cha toza', 'The street is clean'], ['Iflos', 'Dirty', 'Suv iflos', 'The water is dirty'], ['Havo', 'Air', 'Havo toza', 'The air is clean'], ['Chiqindi', 'Trash', 'Chiqindini tashlamang', 'Do not throw trash'], ['Saqlamoq', 'To protect', 'Tabiatni saqlaymiz', 'We protect nature']] },
  { title: 'News and Media', titleUz: 'Yangilik va media', description: 'Understand simple news words', descriptionUz: 'Oddiy yangilik so\'zlarini tushuning', category: 'media', skillFocus: 'listening', words: [['Yangilik', 'News', 'Yangilikni eshitdim', 'I heard the news'], ['Maqola', 'Article', 'Maqolani o\'qidim', 'I read the article'], ['Video', 'Video', 'Video qisqa', 'The video is short'], ['Intervyu', 'Interview', 'Intervyu boshlandi', 'The interview started'], ['Xabar bermoq', 'To report', 'U xabar berdi', 'He reported']] },
  { title: 'Confidence Practice', titleUz: 'Ishonch mashqi', description: 'Use encouraging learning language', descriptionUz: 'Ruhlantiruvchi o\'rganish tilini ishlating', category: 'goals', skillFocus: 'speaking', words: [['Eplayman', 'I can do it', 'Men buni eplayman', 'I can do it'], ['Davom etmoq', 'To continue', 'Davom eting', 'Continue'], ['Yaxshilanmoq', 'To improve', 'Men yaxshilanyapman', 'I am improving'], ['Mashq qildim', 'I practiced', 'Bugun mashq qildim', 'I practiced today'], ['Tayyor bo\'lmoq', 'To be ready', 'Men tayyor bo\'laman', 'I will be ready']] },
  { title: 'Final Review', titleUz: 'Yakuniy takrorlash', description: 'Review the expanded course skills', descriptionUz: 'Kengaytirilgan kurs ko\'nikmalarini takrorlang', category: 'review', skillFocus: 'mixed', words: [] },
]

function makeGeneratedLessons() {
  const generated: Lesson[] = []
  const generatedWordById = new Map<string, Word>()
  const contentSeeds = extraLessonSeeds.filter((seed) => seed.category !== 'review')
  const reviewSeeds = extraLessonSeeds.filter((seed) => seed.category === 'review')
  let nextWordNumber = 101
  let nextContentIndex = 0

  for (let blockIndex = 0; blockIndex < 5; blockIndex += 1) {
    for (let lessonInBlock = 0; lessonInBlock < 9; lessonInBlock += 1) {
      const seed = contentSeeds[nextContentIndex++]
      const lessonNumber = 21 + generated.length
      const previousLessonId = lessonNumber === 21 ? 'l20' : `l${lessonNumber - 1}`
      const words = seed.words.map(([uzbek, english, exampleUz, exampleEn]) => {
        const id = `w${nextWordNumber++}`
        const word: Word = {
          id,
          uzbek,
          english,
          category: seed.category,
          example: {
            uzbek: exampleUz,
            english: exampleEn,
          },
        }
        generatedWordById.set(id, word)
        return word
      })

      generated.push({
        id: `l${lessonNumber}`,
        title: seed.title,
        titleUz: seed.titleUz,
        description: seed.description,
        descriptionUz: seed.descriptionUz,
        category: seed.category,
        level: lessonNumber < 45 ? 'beginner' : 'intermediate',
        words,
        xpReward: 20,
        featherReward: 7,
        order: lessonNumber,
        isLocked: true,
        requiredLessonId: previousLessonId,
        skillFocus: seed.skillFocus,
      })
    }

    const reviewSeed = reviewSeeds[blockIndex] ?? reviewSeeds[reviewSeeds.length - 1]
    const lessonNumber = 21 + generated.length
    const recentWords = generated
      .slice(Math.max(0, generated.length - 9))
      .flatMap((lesson) => lesson.words)
      .slice(-20)

    generated.push({
      id: `l${lessonNumber}`,
      title: reviewSeed.title,
      titleUz: reviewSeed.titleUz,
      description: reviewSeed.description,
      descriptionUz: reviewSeed.descriptionUz,
      category: 'review',
      level: lessonNumber < 45 ? 'beginner' : 'intermediate',
      words: recentWords,
      xpReward: 30,
      featherReward: 12,
      order: lessonNumber,
      isLocked: true,
      requiredLessonId: `l${lessonNumber - 1}`,
      isReview: true,
      skillFocus: 'mixed',
    })
  }

  return {
    lessons: generated,
    words: [...generatedWordById.values()],
  }
}

const generatedCourse = makeGeneratedLessons()

export const expandedVocabularyData: Word[] = generatedCourse.words

// Lessons organized by category
export const lessonsData: Lesson[] = [
  // Unit 1: Basics
  {
    id: 'l1',
    title: 'Start Talking',
    titleUz: 'Gaplashishni boshlang',
    description: 'Say hello and answer naturally',
    descriptionUz: 'Salomlashing va tabiiy javob bering',
    category: 'basics',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w1', 'w2', 'w3', 'w4', 'w5'].includes(w.id)),
    xpReward: 10,
    order: 1,
    isLocked: false,
  },
  {
    id: 'l2',
    title: 'Classroom Survival',
    titleUz: 'Darsda kerakli so\'zlar',
    description: 'Ask for help, repetition, and slower speech',
    descriptionUz: 'Yordam, takrorlash va sekinroq gapirishni so\'rang',
    category: 'basics',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w6', 'w7', 'w8', 'w9', 'w10'].includes(w.id)),
    xpReward: 10,
    order: 2,
    isLocked: true,
    requiredLessonId: 'l1',
  },
  {
    id: 'l3',
    title: 'Count in Real Life',
    titleUz: 'Hayotda sanash',
    description: 'Use common numbers in simple phrases',
    descriptionUz: 'Oddiy gaplarda kerakli raqamlarni ishlating',
    category: 'numbers',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w11', 'w12', 'w13', 'w14', 'w15'].includes(w.id)),
    xpReward: 10,
    order: 3,
    isLocked: true,
    requiredLessonId: 'l2',
  },
  {
    id: 'l4',
    title: 'Amounts and Prices',
    titleUz: 'Miqdor va narxlar',
    description: 'Ask about quantity, amount, and price',
    descriptionUz: 'Miqdor, son va narx haqida so\'rang',
    category: 'numbers',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w16', 'w17', 'w18', 'w19', 'w20'].includes(w.id)),
    xpReward: 10,
    order: 4,
    isLocked: true,
    requiredLessonId: 'l3',
  },
  
  // Unit 2: Family
  {
    id: 'l5',
    title: 'Family Members',
    titleUz: 'Oila a\'zolari',
    description: 'Learn family vocabulary',
    descriptionUz: 'Oila so\'zlarini o\'rganing',
    category: 'family',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w21', 'w22', 'w23', 'w24', 'w25'].includes(w.id)),
    xpReward: 15,
    order: 5,
    isLocked: true,
    requiredLessonId: 'l4',
  },
  {
    id: 'l6',
    title: 'Extended Family',
    titleUz: 'Katta oila',
    description: 'More family members',
    descriptionUz: 'Boshqa oila a\'zolari',
    category: 'family',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w26', 'w27', 'w28', 'w29', 'w30'].includes(w.id)),
    xpReward: 15,
    order: 6,
    isLocked: true,
    requiredLessonId: 'l5',
  },
  
  // Unit 3: Food
  {
    id: 'l7',
    title: 'Basic Food',
    titleUz: 'Asosiy ovqatlar',
    description: 'Essential food words',
    descriptionUz: 'Asosiy ovqat so\'zlari',
    category: 'food',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w31', 'w32', 'w33', 'w34', 'w35'].includes(w.id)),
    xpReward: 15,
    order: 7,
    isLocked: true,
    requiredLessonId: 'l6',
  },
  {
    id: 'l8',
    title: 'Uzbek Cuisine',
    titleUz: 'O\'zbek taomlari',
    description: 'Traditional Uzbek dishes',
    descriptionUz: 'An\'anaviy o\'zbek taomlari',
    category: 'food',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w36', 'w37', 'w38', 'w39', 'w40'].includes(w.id)),
    xpReward: 15,
    order: 8,
    isLocked: true,
    requiredLessonId: 'l7',
  },
  
  // Unit 4: Places
  {
    id: 'l9',
    title: 'Around Town',
    titleUz: 'Shahar atrofi',
    description: 'Common places',
    descriptionUz: 'Umumiy joylar',
    category: 'places',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w41', 'w42', 'w43', 'w44', 'w45'].includes(w.id)),
    xpReward: 15,
    order: 9,
    isLocked: true,
    requiredLessonId: 'l8',
  },
  {
    id: 'l10',
    title: 'More Places',
    titleUz: 'Boshqa joylar',
    description: 'Additional locations',
    descriptionUz: 'Qo\'shimcha joylar',
    category: 'places',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w46', 'w47', 'w48', 'w49', 'w50'].includes(w.id)),
    xpReward: 15,
    order: 10,
    isLocked: true,
    requiredLessonId: 'l9',
  },
  
  // Unit 5: Colors
  {
    id: 'l11',
    title: 'Basic Colors',
    titleUz: 'Asosiy ranglar',
    description: 'Primary colors',
    descriptionUz: 'Asosiy ranglar',
    category: 'colors',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w51', 'w52', 'w53', 'w54', 'w55'].includes(w.id)),
    xpReward: 15,
    order: 11,
    isLocked: true,
    requiredLessonId: 'l10',
  },
  {
    id: 'l12',
    title: 'More Colors',
    titleUz: 'Boshqa ranglar',
    description: 'Additional colors',
    descriptionUz: 'Qo\'shimcha ranglar',
    category: 'colors',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w56', 'w57', 'w58', 'w59', 'w60'].includes(w.id)),
    xpReward: 15,
    order: 12,
    isLocked: true,
    requiredLessonId: 'l11',
  },
  
  // Unit 6: Time
  {
    id: 'l13',
    title: 'Time Basics',
    titleUz: 'Vaqt asoslari',
    description: 'Days and time',
    descriptionUz: 'Kunlar va vaqt',
    category: 'time',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w61', 'w62', 'w63', 'w64', 'w65'].includes(w.id)),
    xpReward: 20,
    order: 13,
    isLocked: true,
    requiredLessonId: 'l12',
  },
  {
    id: 'l14',
    title: 'Parts of Day',
    titleUz: 'Kun qismlari',
    description: 'Times of day',
    descriptionUz: 'Kunning qismlari',
    category: 'time',
    level: 'beginner',
    words: vocabularyData.filter(w => ['w66', 'w67', 'w68', 'w69', 'w70'].includes(w.id)),
    xpReward: 20,
    order: 14,
    isLocked: true,
    requiredLessonId: 'l13',
  },
  
  // Unit 7: Actions
  {
    id: 'l15',
    title: 'Common Verbs',
    titleUz: 'Umumiy fe\'llar',
    description: 'Basic action words',
    descriptionUz: 'Asosiy harakat so\'zlari',
    category: 'actions',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w71', 'w72', 'w73', 'w74', 'w75'].includes(w.id)),
    xpReward: 20,
    order: 15,
    isLocked: true,
    requiredLessonId: 'l14',
  },
  {
    id: 'l16',
    title: 'More Verbs',
    titleUz: 'Boshqa fe\'llar',
    description: 'Additional actions',
    descriptionUz: 'Qo\'shimcha harakatlar',
    category: 'actions',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w76', 'w77', 'w78', 'w79', 'w80'].includes(w.id)),
    xpReward: 20,
    order: 16,
    isLocked: true,
    requiredLessonId: 'l15',
  },
  
  // Unit 8: Daily Phrases
  {
    id: 'l17',
    title: 'Introductions',
    titleUz: 'Tanishuv',
    description: 'Introduce yourself',
    descriptionUz: 'O\'zingizni tanishtiring',
    category: 'phrases',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w81', 'w82', 'w83', 'w84', 'w85'].includes(w.id)),
    xpReward: 25,
    order: 17,
    isLocked: true,
    requiredLessonId: 'l16',
  },
  {
    id: 'l18',
    title: 'Useful Phrases',
    titleUz: 'Foydali iboralar',
    description: 'Everyday expressions',
    descriptionUz: 'Kundalik iboralar',
    category: 'phrases',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w86', 'w87', 'w88', 'w89', 'w90'].includes(w.id)),
    xpReward: 25,
    order: 18,
    isLocked: true,
    requiredLessonId: 'l17',
  },
  
  // Unit 9: Weather
  {
    id: 'l19',
    title: 'Weather Words',
    titleUz: 'Ob-havo so\'zlari',
    description: 'Talk about weather',
    descriptionUz: 'Ob-havo haqida gapiring',
    category: 'weather',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w91', 'w92', 'w93', 'w94', 'w95'].includes(w.id)),
    xpReward: 25,
    order: 19,
    isLocked: true,
    requiredLessonId: 'l18',
  },
  {
    id: 'l20',
    title: 'Weather Conditions',
    titleUz: 'Ob-havo sharoitlari',
    description: 'Describe the weather',
    descriptionUz: 'Ob-havoni tasvirlang',
    category: 'weather',
    level: 'intermediate',
    words: vocabularyData.filter(w => ['w96', 'w97', 'w98', 'w99', 'w100'].includes(w.id)),
    xpReward: 25,
    order: 20,
    isLocked: true,
    requiredLessonId: 'l19',
  },
  ...generatedCourse.lessons,
]

// Achievements
export const achievementsData: Achievement[] = [
  {
    id: 'early-bird',
    title: 'Early Bird',
    titleUz: 'Erta qush',
    description: 'Maintain a 3-day streak',
    descriptionUz: '3 kunlik seriyani saqlang',
    icon: 'star',
    requirement: { type: 'streak', value: 3 },
    xpReward: 20,
    featherReward: 15,
  },
  {
    id: 'word-collector',
    title: 'Word Collector',
    titleUz: 'So\'z to\'plovchi',
    description: 'Complete 10 lessons',
    descriptionUz: '10 ta darsni yakunlang',
    icon: 'book',
    requirement: { type: 'lessons', value: 10 },
    xpReward: 50,
    featherReward: 25,
  },
  {
    id: '7-day-hero',
    title: '7-Day Hero',
    titleUz: '7 kunlik qahramon',
    description: 'Maintain a 7-day streak',
    descriptionUz: '7 kunlik seriyani saqlang',
    icon: 'flame',
    requirement: { type: 'streak', value: 7 },
    xpReward: 75,
    featherReward: 40,
  },
  {
    id: 'speaking-master',
    title: 'Speaking Master',
    titleUz: 'Gaplashish ustasi',
    description: 'Reach level 5',
    descriptionUz: '5-darajaga chiqing',
    icon: 'graduation-cap',
    requirement: { type: 'level', value: 5 },
    xpReward: 90,
    featherReward: 45,
  },
  {
    id: 'referral-champion',
    title: 'Referral Champion',
    titleUz: 'Taklif chempioni',
    description: 'Invite 5 friends',
    descriptionUz: '5 do\'stingizni taklif qiling',
    icon: 'users',
    requirement: { type: 'referrals', value: 5 },
    xpReward: 120,
    featherReward: 80,
  },
  {
    id: 'streak-legend',
    title: '30-Day Legend',
    titleUz: '30 kunlik afsona',
    description: 'Maintain a 30-day streak',
    descriptionUz: '30 kunlik seriyani saqlang',
    icon: 'flame',
    requirement: { type: 'streak', value: 30 },
    xpReward: 180,
    featherReward: 120,
  },
  {
    id: 'xp-champion',
    title: 'XP Champion',
    titleUz: 'XP chempioni',
    description: 'Earn 500 XP',
    descriptionUz: '500 XP yig\'ing',
    icon: 'medal',
    requirement: { type: 'xp', value: 500 },
    xpReward: 100,
    featherReward: 40,
  },
  {
    id: 'feather-keeper',
    title: 'Feather Keeper',
    titleUz: 'Pat saqlovchi',
    description: 'Collect 300 Feathers',
    descriptionUz: '300 ta pat to\'plang',
    icon: 'crown',
    requirement: { type: 'feathers', value: 300 },
    xpReward: 80,
    featherReward: 60,
  },
  {
    id: 'course-complete',
    title: 'Course Complete',
    titleUz: 'Kurs yakunlandi',
    description: 'Complete all 70 lessons',
    descriptionUz: 'Barcha 70 darsni yakunlang',
    icon: 'graduation-cap',
    requirement: { type: 'lessons', value: 70 },
    xpReward: 200,
    featherReward: 150,
  },
]

// Helper function to get lesson by ID
export function getLessonById(id: string): Lesson | undefined {
  return lessonsData.find(lesson => lesson.id === id)
}

// Helper function to check if lesson is unlocked
export function isLessonUnlocked(lessonId: string, completedLessons: string[]): boolean {
  const lesson = getLessonById(lessonId)
  if (!lesson) return false
  if (!lesson.isLocked) return true
  if (!lesson.requiredLessonId) return true
  return completedLessons.includes(lesson.requiredLessonId)
}

// Helper function to get next lesson
export function getNextLesson(completedLessons: string[]): Lesson | undefined {
  return lessonsData.find(lesson => !completedLessons.includes(lesson.id) && isLessonUnlocked(lesson.id, completedLessons))
}

export const storeItemsData: StoreItem[] = [
  { id: 'theme-forest', name: 'Forest Theme', description: 'A calm green profile theme.', type: 'theme', price: 90, icon: '🌿' },
  { id: 'theme-sunrise', name: 'Sunrise Theme', description: 'Warm and motivating palette.', type: 'theme', price: 120, icon: '🌅' },
  { id: 'frame-gold', name: 'Gold Frame', description: 'Shiny profile frame.', type: 'frame', price: 140, icon: '🟨' },
  { id: 'frame-emerald', name: 'Emerald Frame', description: 'Premium green frame.', type: 'frame', price: 160, icon: '💚' },
  { id: 'outfit-explorer', name: 'Explorer Outfit', description: 'Sparrow adventure style.', type: 'outfit', price: 180, icon: '🧢' },
  { id: 'color-mint', name: 'Mint App Style', description: 'Soft mint app accents.', type: 'color', price: 130, icon: '🪴' },
  { id: 'pack-bonus', name: 'Bonus Lesson Pack', description: 'Placeholder for bonus content.', type: 'lesson_pack', price: 220, icon: '📦' },
]
