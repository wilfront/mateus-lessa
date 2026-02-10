import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// Buscar fotos
export async function getFotos() {
  const querySnapshot = await getDocs(collection(db, "fotos"));
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Adicionar foto
export async function addFoto(url) {
  await addDoc(collection(db, "fotos"), {
    url,
    createdAt: serverTimestamp()
  });
}

// Deletar foto
export async function deleteFoto(id) {
  await deleteDoc(doc(db, "fotos", id));
}

// Buscar vídeos
export async function getVideos() {
  const querySnapshot = await getDocs(collection(db, "videos"));
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Adicionar vídeo
export async function addVideo(url) {
  await addDoc(collection(db, "videos"), {
    url,
    createdAt: serverTimestamp()
  });
}

// Deletar vídeo
export async function deleteVideo(id) {
  await deleteDoc(doc(db, "videos", id));
}
