import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function deleteOrganization(orgName, user) {
  const orgRef = doc(db, orgName, "meta");
  const orgMetaDoc = await getDoc(orgRef);
  
  if (!orgMetaDoc.exists()) {
    console.error("Organization meta document does not exist.");
    return;
  }

  const orgData = orgMetaDoc.data();
  const members = orgData.members || [];

  // Step 1: Update each member's "organizationsJoined" field
  const memberPromises = members.map(async (member) => {
    const userRef = doc(db, "users", member.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        organizationsJoined: arrayRemove(orgName),
      });
    }
  });

  // Step 2: If the current user is an admin, remove organization from "organizationsCreated"
  if (orgData.admin.uid === user.uid) {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      organizationsCreated: arrayRemove(orgName),
    });
  }

  // Step 3: Fetch the uniqueCode from the "existingCollectionsArray" and remove the organization entry
  const existingCollectionsRef = doc(db, "existingCollections", "existingCollectionsDoc");
  const existingCollectionsDoc = await getDoc(existingCollectionsRef);
  
  const existingCollectionsArray = existingCollectionsDoc.data()?.existingCollectionsArray || [];
  const orgEntry = existingCollectionsArray.find((entry) => entry.orgName === orgName);

  if (orgEntry) {
    const { uniqueCode } = orgEntry;  // Extract the uniqueCode

    await updateDoc(existingCollectionsRef, {
      existingCollectionsArray: arrayRemove({
        orgName: orgName,
        uniqueCode: uniqueCode,
      }),
    });
  } else {
    console.warn(`Organization ${orgName} not found in existingCollectionsArray.`);
  }

  // Step 4: Delete the organization collection
  await deleteDoc(orgRef);  // Deleting the meta document
  const orgCollectionRef = collection(db, orgName);
  const orgDocsSnapshot = await getDocs(orgCollectionRef);

  const deletePromises = orgDocsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Wait for all member updates to complete
  await Promise.all(memberPromises);

  console.log(`Organization ${orgName} and all associated data have been deleted.`);
}
