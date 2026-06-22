import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM72RAVXZvb3cTOQf1DjwTAcAbpcrV2dE",
  authDomain: "reflectandshoot.firebaseapp.com",
  projectId: "reflectandshoot",
  storageBucket: "reflectandshoot.firebasestorage.app",
  messagingSenderId: "619798868982",
  appId: "1:619798868982:web:a53e1fabdcf0c42f824dd7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const WINNERS = [
  "Diriliş Perileri",
  "sinemektep",
  "MSR Justice Without Doubt",
  "Sosyal Kızlar42",
  "Homines Longinqui",
  "Mitra",
  "Technokasyon",
  "THREEE",
  "PURE INSIGHT",
  "Clear Vision",
  "Open Ideas"
];

async function listStudents() {
  console.log("Querying finalist applications...");
  try {
    const q = query(collection(db, "applications"), where("team.isFinalist", "==", true));
    const snap = await getDocs(q);
    const allApps = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');

    console.log(`\nFound ${allApps.length} finalist applications.`);
    console.log("=========================================");
    for (const appDoc of allApps) {
      const isWinner = WINNERS.some(w => normalize(w) === normalize(appDoc.team?.name || ""));
      const markedAsWinner = appDoc.team?.isWinner;
      
      if (isWinner || markedAsWinner) {
        console.log(`Team: ${appDoc.team?.name} (${appDoc.team?.category || 'No Category'})`);
        console.log(`School: ${appDoc.school?.name || appDoc.school || 'Unknown'}`);
        console.log(`Teacher: ${appDoc.teacher?.fullName || 'Unknown'}`);
        console.log("Students:");
        if (appDoc.team?.students && Array.isArray(appDoc.team.students)) {
          appDoc.team.students.forEach((student: any) => {
            console.log(`  - ${student.firstName} ${student.lastName} (Phone: ${student.phone || 'N/A'}, Grade: ${student.grade || 'N/A'})`);
          });
        } else {
          console.log("  No student records found.");
        }
        console.log("--------------------------------\n");
      }
    }
  } catch (error) {
    console.error("Query failed:", error);
  }
}

listStudents().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
