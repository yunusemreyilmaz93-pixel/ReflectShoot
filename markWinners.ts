import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDM72RAVXZvb3cTOQf1DjwTAcAbpcrV2dE",
  authDomain: "reflect-and-shoot-1a221.firebaseapp.com",
  projectId: "reflect-and-shoot-1a221",
  storageBucket: "reflect-and-shoot-1a221.firebasestorage.app",
  messagingSenderId: "56747209700",
  appId: "1:56747209700:web:118abbc8ec2b647f2597ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const WINNERS = [
  { name: "Diriliş Perileri", category: "Canlı Çekim" },
  { name: "sinemektep", category: "Canlı Çekim" },
  { name: "MSR Justice Without Doubt", category: "Canlı Çekim" },
  { name: "Sosyal Kızlar42", category: "Canlı Çekim" },
  { name: "Homines Longinqui", category: "Canlı Çekim" },
  { name: "Mitra", category: "Yapay Zeka Animasyon" },
  { name: "Technokasyon", category: "Yapay Zeka Animasyon" },
  { name: "THREEE", category: "Yapay Zeka Animasyon" },
  { name: "PURE INSIGHT", category: "Yapay Zeka Animasyon" },
  { name: "Clear Vision", category: "Yapay Zeka Animasyon" }
];

async function markWinners() {
  try {
    await signInWithEmailAndPassword(auth, "dummy12345@gmail.com", "password123");
  } catch (e) {
    console.error("Auth failed:", e);
    // Ignore, might work without if rules allow
  }

  const snap = await getDocs(collection(db, "applications"));
  
  const allApps = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  for (const appDoc of allApps) {
    const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');
    const isWinner = WINNERS.find(w => normalize(w.name) === normalize(appDoc.team.name));
    
    await updateDoc(doc(db, "applications", appDoc.id), {
      "team.isWinner": !!isWinner,
      "team.awardCategory": isWinner ? isWinner.category : null,
      "team.participationFormStatus": "not_started"
    });
    console.log(`Updated ${appDoc.team.name} - isWinner: ${!!isWinner}`);
  }
}

markWinners().then(() => {
  console.log("Done");
  process.exit(0);
});
