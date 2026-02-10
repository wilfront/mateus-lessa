import { db } from "./firebaseConfig"; // já deve existir
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

// Nome da coleção no Firestore
const AGENDA_COLLECTION = "agenda";

// Buscar todos os shows
export const getAgenda = async () => {
  const snapshot = await getDocs(collection(db, AGENDA_COLLECTION));
  const shows = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return shows;
};

// Adicionar um show
export const addShow = async ({ local, data, descricao }) => {
  await addDoc(collection(db, AGENDA_COLLECTION), {
    local,
    data,
    descricao
  });
};

// Deletar um show pelo id
export const deleteShow = async (id) => {
  await deleteDoc(doc(db, AGENDA_COLLECTION, id));
};
