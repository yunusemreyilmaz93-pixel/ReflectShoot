import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with the correct project ID
initializeApp({
  projectId: "reflectandshoot"
});

const db = getFirestore();

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
  console.log("Fetching applications from Firestore with Admin privileges...");
  const snap = await db.collection("applications").get();
  
  const allApps: any[] = [];
  snap.forEach(doc => {
    allApps.push({ id: doc.id, ...doc.data() });
  });

  const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, '');

  console.log(`Found ${allApps.length} total applications.`);
  console.log("=========================================");
  
  let matchCount = 0;
  for (const appDoc of allApps) {
    const isWinnerName = WINNERS.some(w => normalize(w) === normalize(appDoc.team?.name || ""));
    const markedAsWinner = appDoc.team?.isWinner === true;
    
    if (isWinnerName || markedAsWinner) {
      matchCount++;
      console.log(`Team: ${appDoc.team?.name} (${appDoc.team?.category || 'No Category'})`);
      console.log(`School: ${appDoc.school?.name || appDoc.school || 'Unknown'}`);
      console.log(`Teacher: ${appDoc.teacher?.fullName || 'Unknown'} (Email: ${appDoc.teacher?.email || 'N/A'}, Phone: ${appDoc.teacher?.phone || 'N/A'})`);
      console.log("Students:");
      if (appDoc.team?.students && Array.isArray(appDoc.team.students)) {
        appDoc.team.students.forEach((student: any, index: number) => {
          console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} (Phone: ${student.phone || 'N/A'}, Grade: ${student.grade || 'N/A'})`);
        });
      } else {
        console.log("  No student records found.");
      }
      console.log("=========================================\n");
    }
  }
  
  console.log(`Listed ${matchCount} winning/awarded teams.`);
}

listStudents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error executing admin query:", err);
    process.exit(1);
  });
