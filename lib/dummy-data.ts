export interface Option {
    id: string;
    name: string;
    nameHindi?: string;
    imageSrc?: string;
}

export interface Question {
    id: string;
    text: string;
    textHindi?: string;
    options: Option[];
}

export const DEFAULT_QUESTIONS: Question[] = [
    {
        id: "q1",
        text: "What is my favorite color?",
        textHindi: "मेरा पसंदीदा रंग क्या है?",
        options: [
            { id: "o1", name: "Royal Blue", nameHindi: "रॉयल ब्लू (शाही नीला)", imageSrc: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop" },
            { id: "o2", name: "Emerald Green", nameHindi: "पन्ना हरा", imageSrc: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop" },
            { id: "o3", name: "Sunset Orange", nameHindi: "सूर्यास्त नारंगी", imageSrc: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=400&fit=crop" },
            { id: "o4", name: "Deep Purple", nameHindi: "गहरा बैंगनी", imageSrc: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q2",
        text: "Which season do I love the most?",
        textHindi: "मुझे कौन सा मौसम सबसे ज्यादा पसंद है?",
        options: [
            { id: "o5", name: "Spring", nameHindi: "वसंत", imageSrc: "https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=400&h=400&fit=crop" },
            { id: "o6", name: "Summer", nameHindi: "गर्मी", imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop" },
            { id: "o7", name: "Autumn", nameHindi: "पतझड़", imageSrc: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop" },
            { id: "o8", name: "Winter", nameHindi: "सर्दी", imageSrc: "https://images.unsplash.com/photo-1477601263430-5952200dc050?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q3",
        text: "What's my go-to comfort food?",
        textHindi: "मेरा पसंदीदा कम्फर्ट फूड (आरामदायक भोजन) क्या है?",
        options: [
            { id: "o9", name: "Pizza", nameHindi: "पिज्जा", imageSrc: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop" },
            { id: "o10", name: "Burger", nameHindi: "बर्गर", imageSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop" },
            { id: "o11", name: "Sushi", nameHindi: "सुशी", imageSrc: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop" },
            { id: "o12", name: "Pasta", nameHindi: "पास्ता", imageSrc: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q4",
        text: "What's my dream travel destination?",
        textHindi: "मेरी सपनों की यात्रा मंजिल क्या है?",
        options: [
            { id: "o13", name: "Japan", nameHindi: "जापान", imageSrc: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop" },
            { id: "o14", name: "Switzerland", nameHindi: "स्विट्जरलैंड", imageSrc: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&h=400&fit=crop" },
            { id: "o15", name: "Maldives", nameHindi: "मालदीव", imageSrc: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=400&fit=crop" },
            { id: "o16", name: "Paris", nameHindi: "पेरिस", imageSrc: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q5",
        text: "What kind of music do I listen to most?",
        textHindi: "मैं किस तरह का संगीत सबसे ज्यादा सुनता हूँ?",
        options: [
            { id: "o17", name: "Pop", nameHindi: "पॉप", imageSrc: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=400&h=400&fit=crop" },
            { id: "o18", name: "Rock", nameHindi: "रॉक", imageSrc: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop" },
            { id: "o19", name: "Lo-fi / Chill", nameHindi: "लो-फाई / चिल", imageSrc: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop" },
            { id: "o20", name: "Classical", nameHindi: "शास्त्रीय", imageSrc: "https://images.unsplash.com/photo-1507838596397-89998d0af8c6?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q6",
        text: "What do I like doing in my free time?",
        textHindi: "मुझे अपने खाली समय में क्या करना पसंद है?",
        options: [
            { id: "o21", name: "Reading", nameHindi: "किताबें पढ़ना", imageSrc: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop" },
            { id: "o22", name: "Gaming", nameHindi: "गेम खेलना", imageSrc: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop" },
            { id: "o23", name: "Traveling", nameHindi: "यात्रा करना", imageSrc: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=400&fit=crop" },
            { id: "o24", name: "Watching Movies", nameHindi: "फिल्में देखना", imageSrc: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q7",
        text: "What is my preferred morning drink?",
        textHindi: "मेरा पसंदीदा सुबह का पेय क्या है?",
        options: [
            { id: "o25", name: "Coffee", nameHindi: "कॉफ़ी", imageSrc: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop" },
            { id: "o26", name: "Tea / Chai", nameHindi: "चाय", imageSrc: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop" },
            { id: "o27", name: "Fresh Juice", nameHindi: "ताज़ा जूस", imageSrc: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&h=400&fit=crop" },
            { id: "o28", name: "Water", nameHindi: "पानी", imageSrc: "https://images.unsplash.com/photo-1523362628408-3c7eda8fa83a?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q8",
        text: "Which movie genre is my favorite?",
        textHindi: "फिल्मों की कौन सी शैली मेरी पसंदीदा है?",
        options: [
            { id: "o29", name: "Action", nameHindi: "एक्शन", imageSrc: "https://images.unsplash.com/photo-1552083858-58476028b250?w=400&h=400&fit=crop" },
            { id: "o30", name: "Comedy", nameHindi: "कॉमेडी", imageSrc: "https://images.unsplash.com/photo-1505968409348-bd000797c92e?w=400&h=400&fit=crop" },
            { id: "o31", name: "Horror", nameHindi: "डरावनी (हॉरर)", imageSrc: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&h=400&fit=crop" },
            { id: "o32", name: "Sci-Fi", nameHindi: "साइंस फिक्शन", imageSrc: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q9",
        text: "If I could own any pet, what would it be?",
        textHindi: "अगर मैं कोई पालतू जानवर रख सकूँ, तो वह क्या होगा?",
        options: [
            { id: "o33", name: "Dog", nameHindi: "कुत्ता", imageSrc: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop" },
            { id: "o34", name: "Cat", nameHindi: "बिल्ली", imageSrc: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop" },
            { id: "o35", name: "Rabbit", nameHindi: "खरगोश", imageSrc: "https://images.unsplash.com/photo-1585110396067-c1d6d27b0f7d?w=400&h=400&fit=crop" },
            { id: "o36", name: "Parrot", nameHindi: "तोता", imageSrc: "https://images.unsplash.com/photo-1552728089-57bdde30ebd8?w=400&h=400&fit=crop" },
        ],
    },
    {
        id: "q10",
        text: "What superpower would I choose?",
        textHindi: "मैं कौन सी सुपरपावर (महाशक्ति) चुनूंगा?",
        options: [
            { id: "o37", name: "Flying", nameHindi: "उड़ना", imageSrc: "https://images.unsplash.com/photo-1502422776317-023a9a3b906f?w=400&h=400&fit=crop" },
            { id: "o38", name: "Invisibility", nameHindi: "अदृश्य होना", imageSrc: "https://images.unsplash.com/photo-1476990521627-037a95190456?w=400&h=400&fit=crop" },
            { id: "o39", name: "Super Strength", nameHindi: "महाशक्ति", imageSrc: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=400&fit=crop" },
            { id: "o40", name: "Time Travel", nameHindi: "समय यात्रा", imageSrc: "https://images.unsplash.com/photo-1501139083538-0139583c61dd?w=400&h=400&fit=crop" },
        ],
    },
];
