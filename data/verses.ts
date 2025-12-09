
export interface VerseDetail {
  arabic: string;
  turkish: string;
  english?: string;
}

export const VERSE_SPLITTER = "|||";

export const versesList: string[] = [
  "Âl-i İmrân: 92",
  "Âl-i İmrân: 103",
  "Âl-i İmrân: 190-191",
  "Ankebût: 41",
  "Asr: 1-3",
  "Bakara: 138",
  "Bakara: 168",
  "Enfâl: 46",
  "Furkân: 63",
  "Hac: 46",
  "Hucurât: 10-11",
  "İbrâhîm: 24-25",
  "İsrâ: 23-24",
  "İsrâ: 82",
  "İnşirâh: 6-8",
  "Kasas: 72-73",
  "Lokman: 18",
  "Mâide: 2",
  "Nahl: 90",
  "Yâsîn: 82",
  "Yûnus: 57",
  "Zâriyât: 50",
  "Zâriyât: 55"
];

export const verseDetails: Record<string, VerseDetail> = {
  "Âl-i İmrân: 92": {
    arabic: "لَنْ تَنَالُوا الْبِرَّ حَتّٰى تُنْفِقُوا مِمَّا تُحِبُّونَؕ وَمَا تُنْفِقُوا مِنْ شَيْءٍ فَاِنَّ اللّٰهَ بِهٖ عَلٖيمٌ",
    turkish: "Allah yolunda sevdiğiniz şeylerden harcamadıkça iyiliğe asla eremezsiniz. Ne harcarsanız Allah onu hakkıyla bilir.",
    english: "Never will you attain the good (reward) until you spend (in the way of Allah) from that which you love. And whatever you spend – indeed, Allah is Knowing of it."
  },
  "Âl-i İmrân: 103": {
    arabic: "وَاعْتَصِمُوا بِحَبْلِ اللّٰهِ جَمٖيعًا وَلَا تَفَرَّقُواۖ وَاذْكُرُوا نِعْمَتَ اللّٰهِ عَلَيْكُمْ اِذْ كُنْتُمْ اَعْدَٓاءً فَاَلَّفَ بَيْنَ قُلُوبِكُمْ فَاَصْبَحْتُمْ بِنِعْمَتِهٖٓ اِخْوَانًاۚ وَكُنْتُمْ عَلٰى شَفَا حُفْرَةٍ مِنَ النَّارِ فَاَنْقَذَكُمْ مِنْهَاۜ كَذٰلِكَ يُبَيِّنُ اللّٰهُ لَكُمْ اٰيَاتِهٖ لَعَلَّكُمْ تَهْتَدُونَ",
    turkish: "Hep birlikte Allah’ın ipine sımsıkı yapışın; bölünüp parçalanmayın. Allah’ın size olan nimetini hatırlayın. Hani siz birbirinize düşman idiniz de Allah gönüllerinizi birleştirdi ve O’nun nimeti sayesinde kardeş oldunuz. Siz bir ateş çukurunun tam kenarında iken oradan da sizi Allah kurtarmıştı. İşte Allah size âyetlerini böyle açıklıyor ki doğru yolu bulasınız.",
    english: "And hold firmly together to the rope of Allah and do not be divided. Remember Allah’s favour upon you when you were enemies, then He united your hearts, so you—by His grace—became brothers. And you were at the brink of a fiery pit and He saved you from it. This is how Allah makes His revelations clear to you, so that you may be ˹rightly˺ guided."
  },
  "Âl-i İmrân: 190-191": {
    arabic: "اِنَّ فٖي خَلْقِ السَّمٰوَاتِ وَالْاَرْضِ وَاخْتِلَافِ الَّيْلِ وَالنَّهَارِ لَاٰيَاتٍ لِاُو۬لِي الْاَلْبَابِۚ " + VERSE_SPLITTER + " اَلَّذٖينَ يَذْكُرُونَ اللّٰهَ قِيَامًا وَقُعُودًا وَعَلٰى جُنُوبِهِمْ وَيَتَفَكَّرُونَ فٖى خَلْقِ السَّمٰوَاتِ وَالْاَرْضِۚ رَبَّنَا مَا خَلَقْتَ هٰذَا بَاطِلًاۚ سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ",
    turkish: "Göklerin ve yerin yaratılışında, gece ile gündüzün farklı oluşunda aklıselim sahipleri için elbette ibretler vardır."+ VERSE_SPLITTER+"Onlar ayakta dururken, otururken, yatarken hep Allah’ı anarlar; göklerin ve yerin yaratılışını düşünürler (ve şöyle derler:) “Rabbimiz! Sen bunu boş yere yaratmadın, seni tenzih ve takdis ederiz. Bizi cehennem azabından koru!",
    english: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding."+VERSE_SPLITTER+"˹They are˺ those who remember Allah while standing, sitting, and lying on their sides, and reflect on the creation of the heavens and the earth ˹and pray˺, “Our Lord! You have not created ˹all of˺ this without purpose. Glory be to You! Protect us from the torment of the Fire."
  },
  "Ankebût: 41": {
    arabic: "مَثَلُ الَّذٖينَ اتَّخَذُوا مِنْ دُونِ اللّٰهِ اَوْلِيَٓاءَ كَمَثَلِ الْعَنْكَبُوتِۚ اِتَّخَذَتْ بَيْتاًؕ وَاِنَّ اَوْهَنَ الْبُيُوتِ لَبَيْتُ الْعَنْكَبُوتِۘ لَوْ كَانُوا يَعْلَمُونَ",
    turkish: "Allah’tan başka varlıkların korumasına sığınanların durumu, örümceğin durumuna benzer: Örümcek, (ağını) kendine bir yuva edinir, ama yuvaların en çürüğü de örümceğin yuvasıdır. Keşke bilselerdi!",
    english: "The parable of those who take protectors other than Allah is that of a spider spinning a shelter. And the weakest of all homes is certainly that of a spider, if only they knew."
  },
  "Asr: 1-3": {
    arabic: "وَالْعَصْرِۙ" + VERSE_SPLITTER + "اِنَّ الْاِنْسَانَ لَفٖي خُسْرٍۙ" + VERSE_SPLITTER + "اِلَّا الَّذٖينَ اٰمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    turkish: "Asra yemin ederim ki,"+ VERSE_SPLITTER+"İnsan gerçekten ziyandadır."+VERSE_SPLITTER+"Ancak iman edip dünya ve âhiret için yararlı işler yapanlar, birbirlerine hakkı tavsiye edenler ve sabrı tavsiye edenler başkadır.",
    english: "By the ˹passage of˺ time!"+VERSE_SPLITTER+"Surely humanity is in ˹grave˺ loss,"+VERSE_SPLITTER+"except those who have faith, do good, and urge each other to the truth, and urge each other to perseverance."
  },
  "Bakara: 138": {
    arabic: "صِبْغَةَ اللّٰهِۚ وَمَنْ اَحْسَنُ مِنَ اللّٰهِ صِبْغَةًؗ وَنَحْنُ لَهُ عَابِدُونَ",
    turkish: "“Allah’ın boyasıyla boyandık. Boyaca O’ndan daha güzel olan kim vardır? Biz yalnız O’na kulluk ederiz” (deyin).",
    english: "Say, “Take Allah’s colour, and who can give a better colour than Allah? Therefore, we worship and submit to Him alone.”"
  },
  "Bakara: 168": {
    arabic: "يَٓا اَيُّهَا النَّاسُ كُلُوا مِمَّا فِى الْاَرْضِ حَلَالًا طَيِّبًاؗ وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِۜ اِنَّهُ لَكُمْ عَدُوٌّ مُبٖينٌ",
    turkish: "Ey insanlar! Yeryüzünde bulunan maddelerin helâl ve temiz olanlarından yiyin; şeytanın peşinden gitmeyin, çünkü o apaçık düşmanınızdır.",
    english: "O humanity! Eat from what is lawful and good on the earth and do not follow Satan’s footsteps. He is truly your sworn enemy."
  },
  "Enfâl: 46": {
    arabic: "وَاَطٖيعُوا اللّٰهَ وَرَسُولَهُ وَلَا تَنَازَعُوا فَتَفْشَلُوا وَتَذْهَبَ رٖيحُكُمْ وَاصْبِرُواؕ اِنَّ اللّٰهَ مَعَ الصَّابِرٖينَۚ",
    turkish: "Allah ve resulüne itaat edin, birbirinize düşmeyin, sonra zayıflarsınız ve zaferi elden kaçırırsınız. Sabredin, kuşkusuz Allah sabredenlerle beraberdir.",
    english: "Obey Allah and His Messenger and do not dispute with one another, or you would be discouraged and weakened. Persevere! Surely Allah is with those who persevere."
  },
  "Furkân: 63": {
    arabic: "وَعِبَادُ الرَّحْمٰنِ الَّذٖينَ يَمْشُونَ عَلَى الْاَرْضِ هَوْناً وَاِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَاماً",
    turkish: "Rahmân’ın has kulları yeryüzünde vakarla yürüyen, cahiller onlara laf attığı zaman, “selâm” deyip geçen kullardır.",
    english: "The ˹true˺ servants of the Most Compassionate are those who walk on the earth humbly, and when the foolish address them ˹improperly˺, they only respond with peace."
  },
  "Hac: 46": {
    arabic: "اَفَلَمْ يَسٖيرُوا فِي الْاَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَٓا اَوْ اٰذَانٌ يَسْمَعُونَ بِهَاۚ فَاِنَّهَا لَا تَعْمَى الْاَبْصَارُ وَلٰكِنْ تَعْمَى الْقُلُوبُ الَّتٖي فِي الصُّدُورِ",
    turkish: "Hiç yeryüzünde dolaşmadılar mı? Zira dolaşsalardı elbette düşünecek kalpleri ve işitecek kulakları olurdu. Ama gerçek şu ki, gözler kör olmaz; lâkin göğüsler içindeki kalpler kör olur.",
    english: "Have they not travelled throughout the land so their hearts may reason, and their ears may listen? Indeed, it is not the eyes that are blind, but it is the hearts in the chests that grow blind."
  },
  "Hucurât: 10-11": {
    arabic: "اِنَّمَا الْمُؤْمِنُونَ اِخْوَةٌ فَاَصْلِحُوا بَيْنَ اَخَوَيْكُمْ وَاتَّقُوا اللّٰهَ لَعَلَّكُمْ تُرْحَمُونَࣖ" + VERSE_SPLITTER + "يَٓا اَيُّهَا الَّذٖينَ اٰمَنُوا لَا يَسْخَرْ قَوْمٌ مِنْ قَوْمٍ عَسٰٓى اَنْ يَكُونُوا خَيْراً مِنْهُمْ وَلَا نِسَٓاءٌ مِنْ نِسَٓاءٍ عَسٰٓى اَنْ يَكُنَّ خَيْراً مِنْهُنَّۚ وَلَا تَلْمِزُٓوا اَنْفُسَكُمْ وَلَا تَنَابَزُوا بِالْاَلْقَابِؕ بِئْسَ الِاسْمُ الْفُسُوقُ بَعْدَ الْاٖيمَانِۚ وَمَنْ لَمْ يَتُبْ فَاُو۬لٰٓئِكَ هُمُ الظَّالِمُونَ",
    turkish: "Müminler ancak kardeştirler, öyleyse iki kardeşinizin arasını düzeltin, Allah’a itaatsizlikten sakının ki rahmetine mazhar olasınız." + VERSE_SPLITTER + "Ey iman edenler! Bir topluluk diğer bir toplulukla alay etmesin; zira onlar kendilerinden daha iyi olabilirler. Kadınlar da başka kadınlarla alay etmesinler; çünkü alay edilenler edenlerden daha iyi olabilirler. Biriniz diğerinizi aşağılamayın, birbirinize kötü ad takmayın. İman ettikten sonra fâsıklıkla anılmak ne kötüdür! Günahlarına tövbe etmeyenler yok mu, işte zalimler onlardır.",
    english: "The believers are but one brotherhood, so make peace between your brothers. And be mindful of Allah so you may be shown mercy." + VERSE_SPLITTER + "O believers! Do not let some ˹men˺ ridicule others, they may be better than them, nor let ˹some˺ women ridicule other women, they may be better than them. Do not defame one another, nor call each other by offensive nicknames. How evil it is to act rebelliously after having faith! And whoever does not repent, it is they who are the ˹true˺ wrongdoers."
  },
  "İbrâhîm: 24-25": {
    arabic: "اَلَمْ تَرَ كَيْفَ ضَرَبَ اللّٰهُ مَثَلاً كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ اَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَٓاءِۙ" + VERSE_SPLITTER + "تُؤْتٖٓي اُكُلَهَا كُلَّ حٖينٍ بِاِذْنِ رَبِّهَاؕ وَيَضْرِبُ اللّٰهُ الْاَمْثَالَ لِلنَّاسِ لَعَلَّهُمْ يَتَذَكَّرُونَ",
    turkish: "Görmedin mi Allah güzel bir sözü nasıl misal getirdi? (Güzel bir söz), kökü sağlam, dalları göğe yükselen bir ağaç gibidir." + VERSE_SPLITTER + "Bu ağaç Rabbinin izniyle her zaman meyvesini verir. Öğüt alsınlar diye Allah insanlara misaller getirir.",
    english: "Do you not see how Allah compares a good word to a good tree? Its root is firm and its branches reach the sky." + VERSE_SPLITTER + "always˺ yielding its fruit in every season by the Will of its Lord. This is how Allah sets forth parables for the people, so perhaps they will be mindful."
  },
  "İsrâ: 23-24": {
    arabic: "وَقَضٰى رَبُّكَ اَلَّا تَعْبُدُٓوا اِلَّٓا اِيَّاهُ وَبِالْوَالِدَيْنِ اِحْسَاناًؕ اِمَّا يَبْلُغَنَّ عِنْدَكَ الْكِبَرَ اَحَدُهُمَٓا اَوْ كِلَاهُمَا فَلَا تَقُلْ لَهُمَٓا اُفٍّ وَلَا تَنْهَرْهُمَا وَقُلْ لَهُمَا قَوْلاً كَرٖيماً" + VERSE_SPLITTER + " وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانٖي صَغٖيراًؕ",
    turkish: "Rabbin, kendisinden başkasına asla ibadet etmemenizi, anaya-babaya iyi davranmanızı kesin olarak emretti. Eğer onlardan biri, ya da her ikisi senin yanında ihtiyarlık çağına ulaşırsa, sakın onlara 'öf!' bile deme; onları azarlama; onlara tatlı ve güzel söz söyle." + VERSE_SPLITTER + "Onlara merhamet ederek tevazu kanadını indir ve de ki: 'Rabbim!, Tıpkı beni küçükken koruyup yetiştirdikleri gibi sen de onlara acı.'",
    english: "For your Lord has decreed that you worship none but Him. And honour your parents. If one or both of them reach old age in your care, never say to them ˹even˺ ‘ugh,’ nor yell at them. Rather, address them respectfully." + VERSE_SPLITTER + "And lower to them the wing of humility out of mercy and say ,”My Lord, have mercy upon them as they brought me up (when I was) small.”"
  },
  "İsrâ: 82": {
    arabic: "وَنُنَزِّلُ مِنَ الْقُرْاٰنِ مَا هُوَ شِفَٓاءٌ وَرَحْمَةٌ لِلْمُؤْمِنٖينَۙ وَلَا يَزٖيدُ الظَّالِمٖينَ اِلَّا خَسَاراً",
    turkish: "Biz Kur'an'dan, mü'minler için şifa ve rahmet olacak şeyler indiriyoruz. Zalimlerin ise Kur'an, ancak zararını artırır.",
    english: "We send down the Quran as a healing and mercy for the believers, but it only increases the wrongdoers in loss."
  },
  "İnşirâh: 6-8": {
    arabic: "اِنَّ مَعَ الْعُسْرِ يُسْرًاۜ"+ VERSE_SPLITTER +"فَاِذَا فَرَغْتَ فَانْصَبْۙ"+ VERSE_SPLITTER +"وَاِلٰى رَبِّكَ فَارْغَبْ", 
    turkish: "Gerçekten, güçlükle beraber bir kolaylık vardır."+ VERSE_SPLITTER +"Öyleyse, bir işi bitirince diğerine koyul. Ancak Rabbine yönel ve yalvar.",
    english: "Surely with ˹that˺ hardship comes ˹more˺ ease."+ VERSE_SPLITTER +"So once you have fulfilled ˹your duty˺, strive ˹in devotion˺, turning to your Lord ˹alone˺ with hope."
  },
  "Kasas: 72-73": { 
     arabic: "قُلْ اَرَاَيْتُمْ اِنْ جَعَلَ اللّٰهُ عَلَيْكُمُ النَّهَارَ سَرْمَداً اِلٰى يَوْمِ الْقِيٰمَةِ مَنْ اِلٰهٌ غَيْرُ اللّٰهِ يَأْتٖيكُمْ بِلَيْلٍ تَسْكُنُونَ فٖيهِؕ اَفَلَا تُبْصِرُونَ" + VERSE_SPLITTER + "وَمِنْ رَحْمَتِهٖ جَعَلَ لَكُمُ الَّيْلَ وَالنَّهَارَ لِتَسْكُنُوا فٖيهِ وَلِتَبْتَغُوا مِنْ فَضْلِهٖ وَلَعَلَّكُمْ تَشْكُرُونَ", 
     turkish: "De ki: \"Ne dersiniz? Allah, üzerinize gündüzü kıyamete kadar sürekli kılsaydı, Allah'tan başka hangi ilah size içinde dinleneceğiniz bir gece getirebilir? Hâlâ görmeyecek misiniz?\"" + VERSE_SPLITTER + "Allah, rahmetinden ötürü geceyi içinde dinlenesiniz; gündüzü de, lütfundan isteyesiniz ve şükredesiniz diye sizin için yarattı.",
     english: "Ask ˹them also˺, “Imagine if Allah were to make the day perpetual for you until the Day of Judgment, which god other than Allah could bring you night to rest in? Will you not then see?”" + VERSE_SPLITTER + "It ‘s out of His mercy that He has made for you the day and night so that you may rest ˹in the latter˺ and seek His bounty ˹in the former˺, and perhaps you will be grateful."
  }, 
  "Lokman: 18": {
    "arabic": "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْاَرْضِ مَرَحاًؕ اِنَّ اللّٰهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍۚ",
    "turkish": "Küçümseyerek surat asıp insanlardan yüz çevirme ve yeryüzünde böbürlenerek yürüme! Çünkü Allah hiçbir kibirleneni, övüngeni sevmez.",
    "english": "And do not turn your nose up to people, nor walk pridefully upon the earth. Surely Allah does not like whoever is arrogant, boastful."
  },

  "Mâide: 2": {
    "arabic": "يَٓا اَيُّهَا الَّذٖينَ اٰمَنُوا لَا تُحِلُّوا شَعَٓائِرَ اللّٰهِ وَلَا الشَّهْرَ الْحَرَامَ وَلَا الْهَدْىَ وَلَا الْقَلَٓائِدَ وَلَٓا آٰمّٖينَ الْبَيْتَ الْحَرَامَ يَبْتَغُونَ فَضْلًا مِنْ رَبِّهِمْ وَرِضْوَانًاۜ وَاِذَا حَلَلْتُمْ فَاصْطَادُواۜ وَلَا يَجْرِمَنَّكُمْ شَنَاٰنُ قَوْمٍ اَنْ صَدُّوكُمْ عَنِ الْمَسْجِدِ الْحَرَامِ اَنْ تَعْتَدُواۘ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالْتَّقْوٰىۖ وَلَا تَعَاوَنُوا عَلَى الْاِثْمِ وَالْعُدْوَانِۖ وَاتَّقُوا اللّٰهَۜ اِنَّ اللّٰهَ شَدٖيدُ الْعِقَابِ",
    "turkish": "…İyilik ve takva (Allah'a karşı gelmekten sakınma) üzere yardımlaşın. Ama günah ve düşmanlık üzere yardımlaşmayın. Allah'a karşı gelmekten sakının. Çünkü Allah'ın cezası çok şiddetlidir.",
    "english": "…Cooperate with one another in goodness and righteousness, and do not cooperate in sin and transgression. And be mindful of Allah. Surely Allah is severe in punishment."
  },

  "Nahl: 90": {
    "arabic": "اِنَّ اللّٰهَ يَأْمُرُ بِالْعَدْلِ وَالْاِحْسَانِ وَاٖيتَٓائِ۬ ذِي الْقُرْبٰى وَيَنْهٰى عَنِ الْفَحْشَٓاءِ وَالْمُنْكَرِ وَالْبَغْيِۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ",
    "turkish": "Şüphesiz Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder; hayâsızlığı, fenalık ve azgınlığı da yasaklar. O, düşünüp tutasınız diye size öğüt veriyor.",
    "english": "Indeed, Allah commands justice, grace, as well as generosity to close relatives. He forbids indecency, wickedness, and aggression. He instructs you so perhaps you will be mindful."
  },

  "Yâsîn: 82": {
    "arabic": "اِنَّـمَٓا اَمْرُهُٓ اِذَٓا اَرَادَ شَيْـٔاً اَنْ يَقُولَ لَهُ كُنْ فَيَكُونُ",
    "turkish": "Bir şeyi dilediği zaman onun emri o şeye ancak \"Ol!\" demektir. O da hemen oluverir.",
    "english": "All it takes, when He wills something ˹to be˺, is simply to say to it: “Be!” And it is!"
  },

  "Yûnus: 57": {
    "arabic": "يَٓا اَيُّهَا النَّاسُ قَدْ جَٓاءَتْكُمْ مَوْعِظَةٌ مِنْ رَبِّكُمْ وَشِفَٓاءٌ لِمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِلْمُؤْمِنٖينَ",
    "turkish": "Ey insanlar! İşte size Rabbinizden bir öğüt, kalplere bir şifâ ve inananlar için yol gösterici bir rehber ve rahmet (olan Kur'an) geldi.",
    "english": "O humanity! Indeed, there has come to you a warning from your Lord, a cure for what is in the hearts, a guide, and a mercy for the believers."
  },

  "Zâriyât: 50": {
    "arabic": "فَفِرُّٓوا اِلَى اللّٰهِؕ اِنّٖي لَكُمْ مِنْهُ نَذٖيرٌ مُبٖينٌۚ",
    "turkish": "O halde Allah'a koşun. Şüphesiz ben, size O'nun katından gönderilmiş açık bir uyarıcıyım.",
    "english": "So ˹proclaim, O Prophet˺: “Flee to Allah! I am truly sent by Him with a clear warning to you.”"
  },

  "Zâriyât: 55": {
    "arabic": "وَذَكِّرْ فَاِنَّ الذِّكْرٰى تَنْفَعُ الْمُؤْمِنٖينَ",
    "turkish": "Sen yine de öğüt ver. Çünkü öğüt mü'minlere fayda verir.",
    "english": "But ˹continue to˺ remind. For certainly reminders benefit the believers."
  }
};
