class CharacterData {

    constructor() {
        this.data = allCharacterInfo;
        // construct a psuedo random generator, allowing to populate 
        // the answers list with a determined list of characters
        const prng = splitmix32((124860560) >>> 0);
        let answersCompileList = [];
        for (let i = 0; i < allCharacterInfo.length; i++) {
            answersCompileList.push(allCharacterInfo[i][0]);
        }

        // shuffle this list and push to the answers list, this way, the characters can be easily 
        // inputted and selected randomly allowing psuedo rng
        shuffle(answersCompileList, prng());
        this.answers = answersCompileList;
    }

    // getter for all characters
    // loadCharacters() {
    //     return this.data.map(character => character[0]);
    // }

    // g
    loadCharacter(character) {
        return this.data.find(item => item[0].toLowerCase() === character.toLowerCase());
    }

    loadCharacterStats(character) {
        var getCharacter = this.loadCharacter(character);
        var keys = ['Character', 'Gender', 'Age', 'Species', 'Hair Colour', 'Stand Type', 'Occupation', 'Nationality', 'Parts In']

        var result = {};
        for (var i = 0; i < keys.length; i++) {
            result[keys[i]] = getCharacter[i].trim();
        }

        if (result['Stand Type'] == 'nan') {
            result['Stand Type'] = 'N/A';
        }

        return result;
    }

    characterGuess(answerName, guessName) {
        const answer = this.loadCharacter(answerName);
        const guess = this.loadCharacter(guessName);

        if (!answer || !guess) {
            throw new Error('One or both characters not found.');
        }

        const data = {};

        // Comparison functions
        const checkPartial = (a, b) => {
            // checks if the current guess has correct, close, or incorrect information
            const answer = new Set(a.split(' ').map(item => item.trim().toLowerCase()));
            const guess = new Set(b.split(' ').map(item => item.trim().toLowerCase()));

            if (answer.size === 0 && guess.size === 0) return 'incorrect';
            if ([...answer].every(item => guess.has(item)) && [...guess].every(item => answer.has(item))) return 'correct';
            if ([...answer].some(item => guess.has(item)) || [...guess].some(item => answer.has(item))) return 'partial';
            return 'incorrect';
        };

        const compareNumb = (a, b) => {
            // checks if the current guess is higher, lower, or correct information
            const numA = parseInt(a.replace(/\D/g, ''), 10);
            const numB = parseInt(b.replace(/\D/g, ''), 10);

            if (isNaN(numA) || isNaN(numB)) return 'undefined';
            if (numA === numB) return 'correct';
            return numA > numB ? 'higher' : 'lower';
        };

        // load all character data
        const answerData = this.loadCharacterStats(answerName);
        const guessData = this.loadCharacterStats(guessName);

        // compare data to display if correct, incorrect or close with comparison functions
        for (const key of ['Character', 'Gender', 'Age', 'Species', 'Hair Colour', 'Stand Type', 'Occupation', 'Nationality', 'Parts In']) {
            data[key] = answerData[key].toLowerCase() == guessData[key].toLowerCase() ? 'correct' : (key === 'Occupation' || key === 'Species' || key === 'Nationality' || key === 'Parts In' ? checkPartial(answerData[key], guessData[key]) : 'incorrect');
        }
        // compare age with number comparison
        data['AgeArrow'] = compareNumb(answerData['Age'], guessData['Age']);

        // create an array for parts in and compare them to characters who may have multiple parts.
        // if the characters first part = characters first part, == correct
        // if one of character's multi parts == character with part, == partial, this way, the player has information about which part
        // if one of character's multi parts == character with multi parts, == partial, this way, one of their parts match
        let garr = guessData['Parts In'].split(',');
        let aarr = answerData['Parts In'].split(',');

        // check parts arrow if higher lower or correct, display nothing if it is partial
        data['PartArrow'] = (checkPartial(aarr[0], guessData['Parts In']) === 'partial') ? 
        'nan' : (garr[0] === answerData['Parts In']) ? 'correct' : compareNumb(aarr[0], garr[0]);
        
        // check Parts In
        data['Parts In'] = checkPartial(answerData['Parts In'], guessData['Parts In']);
        if (data['Parts In'] !== 'correct') {
            for (let i = 0; i < aarr.length; i++) {
                if (garr.some(item => aarr[i] == (item)) == true) {
                    data['Parts In'] = 'partial';
                }
            }
            if (data['Parts In'] != 'partial') {
                data['Parts In'] == 'incorrect';
            }
        }
        // Parts Arrow
        /*
        if (data['Parts In'] !== 'partial' && data['Parts In'] !== 'correct') {
        data['PartArrow'] = (garr[0] === answerData['Parts In']) ? 'correct' : compareNumb(aarr[0], garr[0]) ? 'higher' : 'lower';
        }
        */
        //arr.length > 1 ? (((data['Parts In'] = garr.some(item => answerData['Parts In'] == (item))) == true) ? data['Parts In'] = 'partial' : data['Parts In'] = 'incorrect') : checkPartial(answerData['Parts In'], guessData['Parts In']);


        // check if the guess is correct
        if (answerName == guessName) {
            data['Guess'] = 'correct'
        } else {
            data['Guess'] = 'incorrect'
        }

        // return results
        return data;
    }

    // find the character for today.
    // this character should be selected by the date of today
    // so that it every day of the year a new character is chosen
    getDailyCharacter() {
        const index = this.getCurrentDay('2024-04-27');
        return this.answers[index];
    }

    // find the correct character from yesterday.
    // this function is used for displaying the 
    // answer to yesterdays game
    getYesterdaysCharacter() {
        const index = this.getCurrentDay('2024-04-28');
        return this.answers[index];
    }

    // Function to get the character today will use
    // assists with finding today and yesterdays character
    getCurrentDay(a) {
        const start = new Date(a);
        const today = new Date();
        const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)); // Difference in days
        return (diff + 1) % this.answers.length; // Wrap around the list length
    }

}

// splitmix32 to generate a prng for automatically randomizing answers on a set seed.
// allows for prng choosing of characters
function splitmix32(a) {
    return function () {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

// function to shuffle elements in the given array to allow for prng choosing of characters
function shuffle(array, seed) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(random(seed) * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
        ++seed;
    }
    return array;
}

// simpel random function
function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


// data for jojodle
var allCharacterInfo = [
    ['Jotaro Kujo', 'Male', '41', 'Human', 'Black', 'Range Irrelevant', 'Student, Marine Biologist', 'Japanese', '3, 4, 5, 6', 'Star Platinum'],
    ['Joseph Joestar', 'Male', '79', 'Human', 'White', 'Close Range', 'Real Estate', 'British, American', '2, 3, 4', 'Hermit Purple'],
    ['Muhammad Avdol', 'Male', '25+', 'Human', 'Brown', 'Close Range', 'Astrologer, Fortune Teller', 'Egyptian', '3', 'Magician\'s Red'],
    ['Noriaki Kakyoin', 'Male', '17', 'Human', 'Pink', 'Long Range', 'Student', 'Japanese', '3', 'Hierophant Green'],
    ['Jean Pierre Polnareff', 'Male', '36', 'Human', 'Silver', 'Close Range', 'Independent Investigator', 'French', '3, 5', 'Silver Chariot'],
    ['Iggy', 'Male', 'Unknown', 'Dog', 'Black', 'Close Range', 'Freeloader', 'American', '3', 'The Fool'],
    ['Dio Brando', 'Male', '121', 'Vampire', 'Blonde', 'Range Irrelevant', 'Unemployed', 'British', '1, 3, 6', 'The World'],
    ['Gray Fly', 'Male', 'Unknown', 'Human', 'Gray', 'Long Range', 'Mercenary', 'Unknown', '3', 'Tower of Gray'],
    ['Imposter Captain Tennille', 'Male', 'Unknown', 'Human', 'Blonde', 'Close Range', 'Mercenary', 'Unknown', '3', 'Dark Blue Moon'],
    ['Forever', 'Male', 'Unknown', 'Orangutan', 'Brown', 'Close Range', 'Mercenary', 'Unknown', '3', 'Strength'],
    ['Devo the Cursed', 'Male', 'Unknown', 'Human', 'Black', 'Long Range', 'Hitman', 'Native American', '3', 'Ebony Devil'],
    ['Rubber Soul', 'Male', 'Unknown', 'Human', 'Black', 'Close Range', 'Mercenary', 'Unknown', '3', 'Yellow Temperance'],
    ['J. Geil', 'Male', 'Unknown', 'Human', 'Bald', 'Long Range', 'Mercenary', 'Unknown', '3', 'Hanged Man'],
    ['Hol Horse', 'Male', 'Unknown', 'Human', 'Blonde', 'Close Range', 'Hitman, Detective', 'American', '3', 'Emperor'],
    ['Nena', 'Female', 'Unknown', 'Human', 'Brown', 'Long Range', 'Mercenary', 'Unknown', '3', 'Empress'],
    ['ZZ', 'Male', 'Unknown', 'Human', 'Black', 'Close Range', 'Mercenary', 'Unknown', '3', 'Wheel of Fortune'],
    ['Enya the Hag', 'Female', 'Unknown', 'Human', 'White', 'Long Range', 'Servant', 'Unknown', '3, 5', 'Justice'],
    ['Steely Dan', 'Male', 'Unknown', 'Human', 'Black', 'Long Range', 'Mercenary', 'Unknown', '3', 'Lovers'],
    ['Arabia Fats', 'Male', 'Unknown', 'Human', 'Black', 'Long Range', 'Mercenary', 'Unknown', '3', 'The Sun'],
    ['Mannish Boy', 'Male', '1', 'Human', 'Black', 'Close Range', 'Mercenary', 'Unknown', '3', 'Death 13'],
    ['Cameo', 'Male', 'Unknown', 'Human', 'Ginger', 'Close Range', 'Mercenary', 'Unknown', '3', 'Judgement'],
    ['Midler', 'Female', 'Unknown', 'Human', 'Purple', 'Long Range', 'Mercenary', 'Unknown', '3', 'High Priestess'],
    ['N\'Doul', 'Male', 'Unknown', 'Human', 'Black', 'Long Range', 'Hitman', 'Egyptian', '3', 'Geb'],
    ['Oingo', 'Male', 'Unknown', 'Human', 'Black', 'Integrated', 'Mercenary', 'Egyptian', '3', 'Khnum'],
    ['Boingo', 'Male', 'Unknown', 'Human', 'Black', 'Automatic', 'Mercenary', 'Egyptian', '3', 'Tohth'],
    ['Anubis', 'None', 'Unknown', 'Object', 'Bald', 'Automatic', 'Mercenary', 'Egyptian', '3', 'Stand'],
    ['Chaka', 'Male', 'Unknown', 'Human', 'Black', 'Automatic', 'Farmer', 'Egyptian', '3', 'Anubis'],
    ['Khan', 'Male', 'Unknown', 'Human', 'Brown', 'Automatic', 'Barber', 'Egyptian', '3', 'Anubis'],
    ['Mariah', 'Female', 'Unknown', 'Human', 'Blonde', 'Long Range', 'Mercenary', 'Unknown', '3', 'Bastet'],
    ['Alessi', 'Male', '38', 'Human', 'Red', 'Close Range', 'Mercenary', 'Unknown', '3', 'Sethan'],
    ['Daniel J. D\'Arby', 'Male', '31', 'Human', 'Red', 'Close Range', 'Gambler', 'American', '3', 'Osiris'],
    ['Pet Shop', 'Male', 'Unknown', 'Falcon', 'Brown', 'Close Range', 'Guard', 'Unknown', '3', 'Horus'],
    ['Telence T. D\'Arby', 'Male', '21', 'Human', 'Brown', 'Close Range', 'Butler', 'American', '3', 'Atum'],
    ['Vanilla Ice', 'Male', 'Unknown', 'Vampire', 'Blue', 'Close Range', 'Servant', 'Unknown', '3', 'Cream'],
    ['Holy Kujo', 'Female', '45', 'Human', 'Blonde', 'Close Range', 'Housewife', 'American, Japanese', '3', 'Seiko'],
    ['Kenny G.', 'Male', 'Unknown', 'Human', 'Unknown', 'Phenomenon', 'Servant', 'Unknown', '3', 'Tenore Sax'],
    ['Josuke Higashikata', 'Male', '23', 'Human', 'Black', 'Close Range', 'Student', 'Japanese', '4', 'Crazy Diamond'],
    ['Koichi Hirose', 'Male', '22', 'Human', 'Blonde', 'Close Range', 'Student', 'Japanese', '4, 5', 'Echos'],
    ['Okuyasu Nijimura', 'Male', '23', 'Human', 'Black', 'Close Range', 'Student', 'Japanese', '4', 'The Hand'],
    ['Rohan Kishibe', 'Male', '27', 'Human', 'Turquoise', 'Close Range', 'Manga Artist', 'Japanese', '4, 9', 'Heaven\'s Door'],
    ['Yoshikage Kira', 'Male', '33', 'Human', 'Blonde', 'Close Range', 'Office Worker, Mercenary', 'Japanese', '4', 'Kosaku Kawajiri, Killer Queen'],
    ['Anjuro Katagiri', 'Male', '34', 'Human', 'Red', 'Long Range', 'Criminal', 'Japanese', '4', 'Aqua Necklace'],
    ['Keicho Nijimura', 'Male', '18', 'Human', 'Blonde', 'Close Range', 'Student', 'Japanese', '4', 'Bad Company'],
    ['Tamami Kobayashi', 'Male', '20', 'Human', 'Black', 'Range Irrelevant', 'Loan Shark, Con Man', 'Japanese', '4', 'The Lock'],
    ['Toshikazu Hazamada', 'Male', '18', 'Human', 'Black', 'Automatic', 'Student', 'Japanese', '4', 'Surface'],
    ['Yukako Yamagishi', 'Female', '15', 'Human', 'Black', 'Range Irrelevant', 'Student', 'Japanese', '4', 'Love Deluxe'],
    ['Akira Otoishi', 'Male', '19', 'Human', 'Purple', 'Long Range', 'Musician, Mercenary', 'Japanese', '4', 'Red Hot Chili Pepper'],
    ['Bug-Eaten', 'Unknown', 'Unknown', 'Rat', 'Brown', 'Close Range', 'Rat', 'Unknown', '4', 'Ratt'],
    ['Not Bug-Eaten', 'Unknown', 'Unknown', 'Rat', 'Brown', 'Close Range', 'Rat', 'Unknown', '4', 'Ratt'],
    ['Shigekiyo Yangu', 'Male', '14', 'Human', 'Bald', 'Long Range', 'Student', 'Japanese', '4', 'Harvest'],
    ['Yoshihiro Kira', 'Male', 'Unknown', 'Ghost', 'White', 'Range Irrelevant', 'Unknown', 'Japanese', '4', 'Atom Heart Father'],
    ['Ken Oyanagi', 'Male', '11', 'Human', 'Brown', 'Close Range', 'Student', 'Japanese', '4', 'Boy II Man'],
    ['Yuya Fungami', 'Male', 'Unknown', 'Human', 'Black', 'Automatic', 'Student', 'Japanese', '4', 'Highway Go Go'],
    ['Toyohiro Kanedaichi', 'Male', 'Unknown', 'Human', 'Blue', 'Automatic', 'Unknown', 'Unknown', '4', 'Super Fly'],
    ['Terunosuke Miyamoto', 'Male', 'Unknown', 'Human', 'White', 'Close Range', 'Mercenary', 'Japanese', '4', 'Enigma'],
    ['Masazo Kinoto', 'Male', '29', 'Human', 'Ginger', 'Automatic', 'Architect', 'Japanese', '4', 'Cheap Trick'],
    ['Mansaku Nijimura', 'Male', 'Unknown', 'Mutated Human', 'Ginger', 'Unknown', 'Unknown', 'Japanese', '4', 'Man'],
    ['Tonio Trussardi', 'Male', '29', 'Human', 'Brown', 'Range Irrelevant', 'Chef', 'Italian', '4', 'Pearl Jam'],
    ['Shizuka Joestar', 'Female', '1', 'Human', 'Unknown', 'Integrated', 'Baby', 'Japanese', '4', 'Achtung Baby'],
    ['Aya Tsuji', 'Female', 'Unknown', 'Human', 'Brown', 'Close Range', 'Esthetician', 'Japanese', '4', 'Cinderella'],
    ['Mikitaka Hazekura', 'Male', '216', 'Alien', 'White', 'Integrated', 'Student, Pilot', 'Unknown', '4', 'Earth Wind and Fire'],
    ['Tama', 'Unknown', 'Unknown', 'Cat', 'Gray', 'Integrated', 'Cat', 'Unknown', '4', 'Stray Cat'],
    ['Giorno Giovanna', 'Male', '15', 'Human', 'Blonde', 'Close Range', 'Student, Passione, Mafia Boss', 'Japanese, Italian', '5', 'Golden Experience'],
    ['Bruno Bucciarati', 'Male', '20', 'Human', 'Black', 'Close Range', 'Passione, Capo', 'Italian', '5', 'Sticky Fingers'],
    ['Leone Abbacchio', 'Male', '21', 'Human', 'White', 'Close Range', 'Passione, Soldato', 'Italian', '5', 'Moody Jazz'],
    ['Guido Mista', 'Male', '18', 'Human', 'Black', 'Long Range', 'Passione, Gangster', 'Italian', '5', 'Sex Pistols'],
    ['Narancia Ghirga', 'Male', '17', 'Human', 'Black', 'Long Range', 'Passione, Soldato', 'Italian', '5', 'Aerosmith'],
    ['Pannacotta Fugo', 'Male', '16', 'Human', 'White', 'Close Range', 'Passione, Soldato', 'Italian', '5', 'Purple Haze'],
    ['Trish Una', 'Female', '15', 'Human', 'Pink', 'Close Range', 'Student, Pop Star', 'Italian', '5', 'Spice Girl'],
    ['Coco Jumbo', 'Unknown', 'Unknown', 'Turtle', 'Bald', 'Integrated', 'Passione', 'Unknown', '5', 'Mr\.President'],
    ['Diavolo', 'Male', '33', 'Human', 'Pink', 'Range Irrelevant', 'Mafia Boss', 'Italian', '5', 'Doppio, King Crimson'],
    ['Polpo', 'Male', 'Unknown', 'Human', 'Bald', 'Automatic', 'Passione, Capo', 'Italian', '5', 'Black Sabbath'],
    ['Mario Zucchero', 'Male', '24', 'Human', 'Gray', 'Close Range', 'Passione', 'Italian', '5', 'Soft Machine'],
    ['Sale', 'Male', 'Unknown', 'Human', 'Orange', 'Close Range', 'Passione', 'Unknown', '5', 'Kraft Work'],
    ['Risotto Nero', 'Male', '28', 'Human', 'Purple', 'Close Range', 'Passione, Hitman', 'Italian', '5', 'Metalica'],
    ['Formaggio', 'Male', 'Unknown', 'Human', 'Orange', 'Close Range', 'Passione, Hitman', 'Italian', '5', 'Little Feet'],
    ['Illuso', 'Male', 'Unknown', 'Human', 'Black', 'Close Range', 'Passione, Hitman', 'Unknown', '5', 'Man in the Mirror'],
    ['Prosciutto', 'Male', 'Unknown', 'Human', 'Blonde', 'Close Range', 'Passione, Hitman', 'Unknown', '5', 'The Grateful Dead'],
    ['Pesci', 'Male', 'Unknown', 'Human', 'Green', 'Close Range', 'Passione, Hitman', 'Italian', '5', 'Beach Boy'],
    ['Melone', 'Male', 'Unknown', 'Human', 'Blonde', 'Automatic', 'Passione, Hitman', 'Unknown', '5', 'Baby Face'],
    ['Ghiaccio', 'Male', 'Unknown', 'Human', 'Blue', 'Close Range', 'Passione, Hitman', 'Unknown', '5', 'White Album'],
    ['Squalo', 'Male', 'Unknown', 'Human', 'Orange', 'Long Range', 'Guard', 'Italian', '5', 'Clash'],
    ['Tizzano', 'Male', 'Unknown', 'Human', 'Silver', 'Long Range', 'Guard', 'Italian', '5', 'Talking Head'],
    ['Carne', 'Male', 'Unknown', 'Human', 'Green', 'Automatic', 'Guard', 'Italian', '5', 'Notorious B\.I\.G'],
    ['Cioccolata', 'Male', '34', 'Human', 'Green', 'Close Range', 'Passione', 'Unknown', '5', 'Green Day'],
    ['Secco', 'Male', 'Unknown', 'Human', 'Unknown', 'Close Range', 'Passione', 'Italian', '5', 'Oasis'],
    ['Scolippi', 'Male', 'Unknown', 'Human', 'Purple', 'Automatic', 'Sculptor', 'Italian', '5', 'Rolling Stones'],
    ['Jolyne Cujoh', 'Female', '19', 'Human', 'Black', 'Close Range', 'Prisoner', 'American', '6', 'Stone Free'],
    ['Ermes Costello', 'Female', '23', 'Human', 'Black', 'Close Range', 'Prisoner', 'Mexican, American', '6', 'Kiss'],
    ['Emporio Alnino', 'Male', '11', 'Human', 'Blonde', 'Range Irrelevant', 'Unemployed', 'American', '6', 'Burning Down the House'],
    ['F.F.', 'Female', '22', 'Plankton Colony', 'Green', 'Integrated', 'Prisoner', 'American', '6', 'Foo Fighters'],
    ['Weather Report', 'Male', '39', 'Human', 'White', 'Close Range', 'Prisoner', 'American', '6', 'Wes Bluemarine'],
    ['Narciso Anasui', 'Male', '25', 'Human', 'Pink', 'Close Range', 'Prisoner', 'Unknown', '6', 'Diver Down'],
    ['Enrico Pucci', 'Male', '39', 'Human', 'Silver', 'Long Range', 'Priest, Chaplain', 'American', '6', 'Whitesnake'],
    ['Gwess', 'Female', '22', 'Human', 'Black', 'Long Range', 'Prisoner', 'Unknown', '6', 'Goo Goo Dolls'],
    ['Johngalli A.', 'Male', '35', 'Human', 'Pink', 'Long Range', 'Prisoner, Hitman', 'Unknown', '6', 'Manhattan Transfer'],
    ['Thunder McQueen', 'Male', '27', 'Human', 'Blonde', 'Long Range', 'Prisoner', 'Unknown', '6', 'Highway To Hell'],
    ['Miraschon', 'Female', 'Unknown', 'Human', 'Black', 'Long Range', 'Prisoner', 'Unknown', '6', 'Marilyn Manson'],
    ['Lang Rangler', 'Male', 'Unknown', 'Human', 'Unknown', 'Close Range', 'Prisoner', 'Unknown', '6', 'Jumpin\' Jack Flash'],
    ['Sports Maxx', 'Male', 'Unknown', 'Human', 'Blonde', 'Range Irelevant', 'Gangster, Prisoner', 'Unknown', '6', 'Limp Bizkit'],
    ['Viviano Westwood', 'Male', '28', 'Human', 'Black', 'Close Range', 'Guard', 'American', '6', 'Planet Waves'],
    ['Kenzou', 'Male', '78', 'Human', 'Gray', 'Automatic', 'Prisoner', 'Unknown', '6', 'Dragon\'s Dream'],
    ['D an G', 'Male', '32', 'Human', 'Brown', 'Automatic', 'Prisoner', 'Unknown', '6', 'Yo-Yo Ma'],
    ['Guccio', 'Male', '31', 'Human', 'Black', 'Automatic', 'Prisoner', 'Unknown', '6', 'Survivor'],
    ['The Green Baby', 'Unknown', '1', 'Homunculus', 'Bald', 'Close Range', 'Unemployed', 'Unknown', '6', 'Green, Green Grass of Home'],
    ['Miuccia Miuller', 'Female', '25', 'Human', 'Blonde', 'Close Range', 'Guard', 'Unknown', '6', 'Jail House Lock'],
    ['Ungalo', 'Male', '24', 'Human', 'Green', 'Range Irrelevant', 'Criminal', 'Unknown', '6', 'Bohemian Rhapsody'],
    ['Rikiel', 'Male', '24', 'Human', 'Black', 'Close Range', 'Unknown', 'Unknown', '6', 'Sky High'],
    ['Donatello Versus', 'Male', '25', 'Human', 'Blonde', 'Close Range', 'Unemployed', 'Unknown', '6', 'Under World'],
    ['Johnny Joestar', 'Male', '29', 'Human', 'Blonde', 'Long Range', 'Jockey, Equestrian Coach, Fruit Importer', 'American, Japanese', '7, 8', 'Tusk'],
    ['Gyro Zeppeli', 'Male', '24', 'Human', 'Blonde', 'Long Range', 'Executioner', 'Neapolitan', '7', 'Ball Breaker'],
    ['Lucy Steel', 'Female', '65', 'Human', 'Blonde', 'Integrated', 'Botanist, Geomorphologist', 'American', '7, 8', 'Ticket To Ride'],
    ['Diego Brando', 'Male', '20', 'Human', 'Blonde', 'Range Irrelevant', 'Jockey', 'British', '7', 'Scary Monsters'],
    ['Hot Pants', 'Female', '23', 'Human', 'Pink', 'Range Irrelevant', 'Nun', 'American', '7', 'Cream Starter'],
    ['Funny Valentine', 'Male', '43', 'Human', 'Blonde', 'Close Range', 'President', 'American', '7', 'Dirty Deeds Done Dirt Cheap'],
    ['Sandman', 'Male', '18', 'Human', 'Green', 'Close Range', 'Unemployed', 'Native American', '7', 'In A Silent Way'],
    ['Benjamin Boomboom', 'Male', 'Unknown', 'Human', 'Blonde', 'Close Range', 'Unknown', 'American', '7', 'Tomb Of The Boom 1'],
    ['Andre Boomboom', 'Male', 'Unknown', 'Human', 'Black', 'Close Range', 'Unknown', 'American', '7', 'Tomb Of The Boom 2'],
    ['L.A. Boomboom', 'Male', 'Unknown', 'Human', 'Ginger', 'Close Range', 'Unknown', 'American', '7', 'Tomb Of The Boom 3'],
    ['Oyecomova', 'Male', 'Unknown', 'Human', 'Brown', 'Close Range', 'Terrorist', 'Neapolitan', '7', 'Boku no Rhythm wo Kiitekure'],
    ['Pork Pie Hat Kid', 'Male', 'Unknown', 'Human', 'Unknown', 'Close Range', 'Unknown', 'American', '7', 'Wired'],
    ['Dr. Ferdinand', 'Male', 'Unknown', 'Human', 'Blonde', 'Range Irrelevant', 'Paleontologist, Geologist', 'Unknown', '7', 'Scary Monsters'],
    ['Ringo Roadagain', 'Male', 'Unknown', 'Human', 'White', 'Range Irrelevant', 'Unknown', 'American', '7', 'Mandom'],
    ['Blackmore', 'Male', 'Unknown', 'Human', 'Blonde', 'Close Range', 'Unknown', 'American', '7', 'Catch The Rainbow'],
    ['Great Tree', 'Unknown', 'Unknown', 'Tree', 'Green', 'Integrated', 'Tree', 'American', '7', 'Sugar Mountain'],
    ['Eleven Men', 'Male', 'Unknown', 'Human', 'White', 'Integrated', 'Unknown', 'American', '7', 'TATOO YOU!'],
    ['Mike O.', 'Male', 'Unknown', 'Human', 'Black', 'Automatic', 'Guard', 'American', '7', 'Tubular Bells'],
    ['Magent Magent', 'Male', '31-', 'Human', 'Black', 'Close Range', 'Assassin', 'Unknown', '7', '20th Century BOY'],
    ['Axl RO', 'Male', 'Unknown', 'Human', 'Purple', 'Long Range', 'Assassin', 'Unknown', '7', 'Civil War'],
    ['D-I-S-C-O', 'Male', 'Unknown', 'Human', 'Brown', 'Close Range', 'Assassin', 'American', '7', 'Chocolate Disco'],
    ['Diego Brando (Parallel)', 'Male', '20', 'Human', 'Blonde', 'Range Irrelevant', 'Jockey', 'British', '7', 'THE WORLD'],
    ['Mountain Tim', 'Male', '31', 'Human', 'Blonde', 'Integrated', 'Cowboy, Bounty Hunter', 'American', '7', 'Oh! Lonesome Me'],
    ['Pocoloco', 'Male', '21', 'Human', 'Black', 'Close Range', 'Farmer', 'American', '7', 'Hey Ya!'],
    ['Josuke Higashikata (Part 8)', 'Male', '19', 'Human', 'Black', 'Close Range', 'Student', 'Japanese', '8', 'Soft & Wet'],
    ['Yoshikage Kira (Part 8)', 'Male', '29', 'Human', 'Black', 'Close Range', 'Marine surgeon', 'Japanese', '8', 'Killer Queen'],
    ['Josefumi Kujo', 'Male', '19', 'Human', 'Purple', 'Close Range', 'Student', 'Japanese', '8', 'Soft & Wet'],
    ['Toru', 'Male', '87+', 'Rock Human', 'Black', 'Automatic', 'Nurse, CEO', 'Japanese', '8', 'Wonder Of U'],
    ['A. Phex Brothers', 'Male', '40+', 'Rock Human', 'Brown', 'Close Range', 'Hitman', 'Japanese', '8', 'Schott Key No.1 , Schott Key No.2'],
    ['Aisho Dainenjiyama', 'Male', '29', 'Rock Human', 'Brown', 'Automatic', 'Security Guard', 'Japanese', '8', 'Doobie Wah\!'],
    ['Mitsuba Higashikata', 'Female', '31', 'Human', 'Red', 'Close Range', 'Unemployed', 'Japanese', '8', 'Awaken III Leaves'],
    ['Daiya Higashikata', 'Female', '16', 'Human', 'Black', 'Close Range', 'Unemployed', 'Japanese', '8', 'Calafornia Bed King'],
    ['Dolomite', 'Male', '39', 'Rock Human', 'Gray', 'Automatic', 'Hermit', 'Japanese', '8', 'Blue Hawaii'],
    ['Norisuke Higashikata IV', 'Male', '59', 'Human', 'Blonde', 'Long Range', 'CEO', 'Japanese', '8', 'King Nothing'],
    ['Ojiro Sasame', 'Male', '23', 'Human', 'Blonde', 'Close Range', 'Surfer', 'Japanese', '8', 'Fun Fun Fun'],
    ['Hato Higashikata', 'Female', '24', 'Human', 'Blonde', 'Close Range', 'Model', 'Japanese', '8', 'Walking Heart'],
    ['Holy Joestar-Kira (Part 8)', 'Female', '52', 'Human', 'Brown', 'Unknown', 'Ophthalmologist, Professor', 'Japanese', '8', 'Holy Kujo (8)'],
    ['Poor Tom', 'Male', '57', 'Rock Human', 'Gray', 'Long Range', 'Doctor', 'Japanese', '8', 'Ozone Baby'],
    ['Rai Mamezuku', 'Male', '31', 'Human', 'Black', 'Close Range', 'Plant Appraiser', 'Japanese', '8', 'Doggy Style'],
    ['Jobin Higashikata', 'Male', '32', 'Human', 'Green', 'Close Range', 'Launderer', 'Japanese', '8', 'Speed King'],
    ['Joshu Higashikata', 'Male', '19', 'Human', 'Black', 'Close Range', 'Student', 'Japanese', '8', 'Nut King Call'],
    ['Tamaki Damo', 'Male', '23', 'Rock Human', 'Blonde', 'Close Range', 'CEO', 'Japanese', '8', 'Vitamin C'],
    ['Tsurugi Higashikata', 'Male', '11', 'Human', 'Green', 'Long Range', 'Unemployed', 'Japanese', '8', 'Paper Moon King'],
    ['Kaato Higashikata', 'Female', '52', 'Human', 'Black', 'Close Range', 'Housewife', 'Japanese', '8', 'Space Trucking'],
    ['Urban Guerrilla', 'Male', '38+', 'Rock Human', 'Brown', 'Close Range', 'Doctor', 'Japanese', '8', 'Brain Storm'],
    ['Karera Sakunami', 'Female', '20', 'Human', 'Black', 'Close Range', 'Unemployed', 'Japanese', '8', 'Love Love Deluxe'],
    ['Kei Nijimura', 'Female', '20', 'Human', 'Black', 'Automatic', 'House Keeper', 'Japanese', '8', 'Born This Way'],
    ['Wu Tomoki', 'Male', '70', 'Rock Human', 'Black', 'Integrated', 'Orthopedic surgeon', 'Japanese', '8', 'Doctor Wu'],
    ['Yotsuyu Yagiyama', 'Male', '28', 'Rock Human', 'Black', 'Close Range', 'Architect', 'Japanese', '8', 'I am a Rock'],
    ['Yasuho Hirose', 'Female', '19', 'Human', 'Pink', 'Automatic', 'Student', 'Japanese', '8', 'Pasiley Park'],
    ['Akefu Satoru', 'Male', '79', 'Stand', 'Gray', 'Automatic', 'Researcher, SOGC Member', 'Japanese', '8', 'Wonder Of U'],
    ['Jodio Joestar', 'Male', '15', 'Human', 'Gray', 'Close Range', 'Student, Gofer', 'American', '9', 'November Rain'],
    ['Dragona Joestar', 'Male', '18', 'Human', 'Black', 'Close Range', 'Boutique Employee', 'American', '9', 'Smooth Operators'],
    ['Paco Laburantes', 'Male', '19', 'Human', 'Blue', 'Integrated', 'Student, Gofer', 'American', '9', 'The Hustle'],
    ['Usagi Alohaoe', 'Male', '17', 'Human', 'Red', 'Close Range', 'Student', 'American', '9', 'THE MATTEKUDASAI'],
    ['Charming Man', 'Male', '21', 'Human', 'Black', 'Integrated', 'Unknown', 'American', '9', 'Bigmouth Strikes Again'],
    ['Acca Howler', 'Male', '42', 'Human', 'Unknown', 'Unknown', 'CEO', 'American', '9', 'HOWLER CEO'],
    ['Lulu', 'Female', '11', 'Human', 'Blonde', 'Automatic', 'Unknown', 'Unknown', '9', 'Bags Groove'],
    ['Bobby Jean', 'Male', 'Unknown', 'Human', 'Gray', 'Integrated', 'Investigator', 'Unknown', '9', 'Glory Days'],
    ['Key West', 'Female', 'Unknown', 'Human', 'Unknown', 'Unknown', 'Lawyer', 'Unknown', '9', 'HOWLER Lawyer'],
    ['Laem Chabang', 'Female', 'Unknown', 'Human', 'Unknown', 'Integrated', 'Police Officer', 'Unknown', '9', 'HOWLER Police Officer'],
    ['Ningbo', 'Male', 'Unknown', 'Human', 'Unknown', 'Close Range', 'Firefighter', 'Unknown', '9', 'HOWLER Firefighter'],
    ['Wild Cat Size', 'Unknown', 'Unknown', 'Cat', 'White', 'Integrated', 'Cat', 'American', '9', 'Cat Size']
]
// empty array for data
answers = []