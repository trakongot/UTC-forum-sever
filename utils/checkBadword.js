

const badWords = [
    'buồi', 'buoi', 'dau buoi', 'daubuoi', 'caidaubuoi', 'nhucaidaubuoi',
    'dau boi', 'bòi', 'dauboi', 'caidauboi', 'đầu bòy', 'đầu bùi',
    'dau boy', 'dauboy', 'caidauboy', 'b`',
    'cặc', 'cak', 'kak', 'kac', 'cac', 'concak', 'nungcak', 'bucak',
    'caiconcac', 'caiconcak', 'cu', 'cặk', 'cak', 'dái', 'giái', 'zái',
    'kiu', 'cứt', 'cuccut', 'cutcut', 'cứk', 'cuk', 'cười ỉa', 'cười ẻ',
    'đéo', 'đếch', 'đếk', 'dek', 'đết', 'đệt', 'đách', 'dech', 'đ\'', 'deo',
    'd\'', 'đel', 'đél', 'del', 'dell ngửi', 'dell ngui', 'dell chịu', 'dell chiu',
    'dell hiểu', 'dell hieu', 'dellhieukieugi', 'dell nói', 'dell noi',
    'dellnoinhieu', 'dell biết', 'dell biet', 'dell nghe', 'dell ăn', 'dell an',
    'dell được', 'dell duoc', 'dell làm', 'dell lam', 'dell đi', 'dell di',
    'dell chạy', 'dell chay', 'deohieukieugi', 'địt', 'đm', 'dm', 'đmm', 'dmm',
    'đmmm', 'dmmm', 'đmmmm', 'dmmmm', 'đmmmmm', 'dmmmmm', 'đcm', 'dcm', 'đcmm',
    'dcmm', 'đcmmm', 'dcmmm', 'đcmmmm', 'dcmmmm', 'đệch', 'đệt', 'dit', 'dis',
    'diz', 'đjt', 'djt', 'địt mẹ', 'địt mịe', 'địt má', 'địt mía', 'địt ba',
    'địt bà', 'địt cha', 'địt con', 'địt bố', 'địt cụ', 'dis me', 'disme', 'dismje',
    'dismia', 'dis mia', 'dis mie', 'đis mịa', 'đis mịe', 'ditmemayconcho', 'ditmemay',
    'ditmethangoccho', 'ditmeconcho', 'dmconcho', 'dmcs', 'ditmecondi', 'ditmecondicho',
    'đụ', 'đụ mẹ', 'đụ mịa', 'đụ mịe', 'đụ má', 'đụ cha', 'đụ bà', 'đú cha', 'đú con mẹ',
    'đú má', 'đú mẹ', 'đù cha', 'đù má', 'đù mẹ', 'đù mịe', 'đù mịa', 'đủ cha', 'đủ má',
    'đủ mẹ', 'đủ mé', 'đủ mía', 'đủ mịa', 'đủ mịe', 'đủ mie', 'đủ mia', 'đìu', 'đờ mờ',
    'đê mờ', 'đờ ma ma', 'đờ mama', 'đê mama', 'đề mama', 'đê ma ma', 'đề ma ma', 'dou',
    'doma', 'duoma', 'dou má', 'duo má', 'dou ma', 'đou má', 'đìu má', 'á đù', 'á đìu',
    'đậu mẹ', 'đậu má', 'đĩ', 'di~', 'đuỹ', 'điếm', 'cđĩ', 'cdi~', 'đilol', 'điloz', 'đilon',
    'diloz', 'dilol', 'dilon', 'condi', 'condi~', 'dime', 'di me', 'dimemay', 'condime', 'condimay',
    'condimemay', 'con di cho', 'con di cho', 'condicho', 'bitch', 'biz', 'bít chi', 'con bích',
    'con bic', 'con bíc', 'con bít', 'phò', '4`', 'lồn', 'l`', 'loz', 'lìn', 'nulo', 'ml', 'matlon',
    'cailon', 'matlol', 'matloz', 'thml', 'thangmatlon', 'thangml', 'đỗn lì', 'tml', 'thml', 'diml',
    'dml', 'hãm', 'xàm lol', 'xam lol', 'xạo lol', 'xao lol', 'con lol', 'ăn lol', 'an lol', 'mát lol',
    'mat lol', 'cái lol', 'cai lol', 'lòi lol', 'loi lol', 'ham lol', 'củ lol', 'cu lol', 'ngu lol',
    'tuổi lol', 'tuoi lol', 'mõm lol', 'mồm lol', 'mom lol', 'như lol', 'nhu lol', 'nứng lol', 'nung lol',
    'nug lol', 'nuglol', 'rảnh lol', 'ranh lol', 'đách lol', 'dach lol', 'mu lol', 'banh lol', 'tét lol',
    'tet lol', 'vạch lol', 'vach lol', 'cào lol', 'cao lol', 'tung lol', 'mặt lol', 'mát lol', 'mat lol',
    'xàm lon', 'xam lon', 'xạo lon', 'xao lon', 'con lon', 'ăn lon', 'an lon', 'địt', 'cặc', 'đụ',
    'xúc vật', 'xúcc vật', 'xúc vât', 'xúc vật', 'xúc vạtt',
    'xuc vat', 'xúcvật', 'xúc vật', 'xuccvat', 'xúc vật',
    'xúc vật', 'xucvat', 'xucc vật', 'xuc vat', 'xucvat',
    'xúcc vật', 'xuccvát', 'xuc vât', 'xúcc vật', 'xúc vạtt',
    'giết',
    'asshole', 'bastard', 'bitch', 'bloody', 'bullshit', 'cock', 'cocksucker',
    'cunt', 'damn', 'dick', 'douchebag', 'fag', 'faggot', 'fuck', 'motherfucker',
    'nigger', 'piss', 'prick', 'shit', 'slut', 'son of a bitch', 'twat', 'wanker',
    'whore', 'bimbo', 'chink', 'dyke', 'homo', 'kike', 'midget', 'retard', 'skank',
    'tits', 'titty', 'bastards', 'cocks', 'ass', 'dildo', 'fisting', 'fucked', 'fuckface',
    'ghetto', 'jackass', 'jizz', 'pussy', 'pussyhole', 'rape', 'semen', 'sex', 'sexy',
    'shemale', 'shithead', 'slutty', 'suck', 'sucker', 'turd', 'vagina', 'vulgar', 'whorehouse',
    'cum', 'clit', 'cocktail', 'shag', 'fucker', 'boner', 'penis', 'asswipe', 'dirty',
    'horny', 'pecker', 'pisshole', 'spunk', 'swallow', 'sperminator',
];

const TrieNode = function () {
    this.children = {};
    this.failureLink = null;
    this.output = [];
};

function AhoCorasick(keywords) {
    this.root = new TrieNode();
    this.buildTrie(keywords);
    this.buildFailureLinks();
}

AhoCorasick.prototype.buildTrie = function (keywords) {
    for (const word of keywords) {
        let currentNode = this.root;
        for (const char of word) {
            if (!currentNode.children[char]) {
                currentNode.children[char] = new TrieNode();
            }
            currentNode = currentNode.children[char];
        }
        currentNode.output.push(word);
    }
};

AhoCorasick.prototype.buildFailureLinks = function () {
    const queue = [];
    for (const key in this.root.children) {
        const child = this.root.children[key];
        child.failureLink = this.root;
        queue.push(child);
    }

    while (queue.length > 0) {
        const currentNode = queue.shift();
        for (const key in currentNode.children) {
            const child = currentNode.children[key];
            queue.push(child);

            let failure = currentNode.failureLink;
            while (failure && !failure.children[key]) {
                failure = failure.failureLink;
            }

            child.failureLink = failure ? failure.children[key] : this.root;
            child.output = child.output.concat(child.failureLink.output);
        }
    }
};

AhoCorasick.prototype.search = function (text) {
    let currentNode = this.root;
    const matches = [];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        while (currentNode && !currentNode.children[char]) {
            currentNode = currentNode.failureLink;
        }

        if (currentNode) {
            currentNode = currentNode.children[char];
            if (currentNode.output.length > 0) {
                matches.push(...currentNode.output.map(word => ({ word, position: i - word.length + 1 })));
            }
        } else {
            currentNode = this.root;
        }
    }

    return matches;
};

const ac = new AhoCorasick(badWords);

export const checkBadWords = (text) => {
    const normalizedText = text.toLowerCase().replace(/\s+/g, '');
    return ac.search(normalizedText);
};
