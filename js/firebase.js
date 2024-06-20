// Importación de los módulos necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCp91vr2H9bR9k3Fs5s8582O2hSqFbjamU",
  authDomain: "centroemmapw.firebaseapp.com",
  projectId: "centroemmapw",
  storageBucket: "centroemmapw.appspot.com",
  messagingSenderId: "590417149871",
  appId: "1:590417149871:web:0e3a7145803786fc64b95a",
  measurementId: "G-MK1LFX0E15",
};

// Inicialización de la aplicación Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase();
const storage = getStorage();
const analytics = getAnalytics(app);

// Clase FirebaseManage para gestionar las operaciones con Firebase
export class FirebaseManage {
  // Método asíncrono para autenticar un usuario con correo electrónico y contraseña
  async authenticate(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          // Devuelve el objeto de usuario después de la autenticación
          return userCredential.user;
        }
      );
    } catch (error) {
      console.error(error.message);
      // En caso de error, muestra una alerta con el mensaje de error
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: error.message,
      });
      return false;
    }
  }

  // Método asíncrono para cerrar sesión de un usuario autenticado
  async signOut() {
    try {
      // Realiza el cierre de sesión y elimina la información del usuario de la sesión
      await signOut(auth).then(() => sessionStorage.removeItem("MY_USER"));
    } catch (error) {
      console.error(error.message);
    }
  }

  // Método asíncrono para enviar correo electrónico de restablecimiento de contraseña
  async resetPassword(email) {
    try {
      // Envía un correo electrónico de restablecimiento de contraseña al usuario con el correo proporcionado
      await sendPasswordResetEmail(auth, email);
      // Muestra una notificación de éxito al usuario
      Swal.fire({
        icon: "success",
        title: "Correo electrónico enviado",
        text: "Se ha enviado un correo electrónico de restablecimiento de contraseña a la dirección proporcionada.",
      });
    } catch (error) {
      console.error(
        "Error al enviar el correo electrónico de restablecimiento de contraseña:",
        error
      );
      // En caso de error, lanza una excepción
      throw new Error(
        "Error al enviar el correo electrónico de restablecimiento de contraseña."
      );
    }
  }

  // Método asíncrono para guardar una imagen en el almacenamiento de Firebase
  async saveImageOnStorage(image) {
    try {
      // Referencia al almacenamiento donde se guardará la imagen
      const imageDataRef = storageRef(storage, "images/" + image.name);
      // Carga de la imagen al almacenamiento de Firebase
      const uploadTask = uploadBytesResumable(imageDataRef, image);
      await uploadTask;
      // Obtiene la URL de descarga de la imagen cargada
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL; // Devuelve la URL de descarga de la imagen
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      // En caso de error, lanza una excepción
      throw new Error("Error al subir la imagen.");
    }
  }

  // Método asíncrono para enviar datos de contacto al servidor de Firebase
  async sendContactUsData(data) {
    // Agrega la fecha actual al objeto de datos
    data.date = getCurrentDate();
    try {
      // Referencia al nodo "contactUs" en la base de datos
      const formDataRef = ref(database, "contactUs");
      // Agrega los datos proporcionados al nodo "contactUs" en la base de datos
      await push(formDataRef, data);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Método asíncrono para enviar datos de noticias al servidor de Firebase
  async sendNewsData(data) {
    try {
      // Referencia al nodo "news" en la base de datos
      const formDataRef = ref(database, "news");
      // Agrega los datos proporcionados al nodo "news" en la base de datos
      await push(formDataRef, data);
    } catch (error) {
      console.error("Error al crear la noticia:", error);
      // En caso de error, lanza una excepción
      throw new Error("Error al crear la noticia.");
    }
  }

  // Método asíncrono para obtener datos de contacto desde la base de datos de Firebase
  async showContactUsData() {
    try {
      // Referencia al nodo "contactUs" en la base de datos
      const dataRef = ref(database, "contactUs");
      // Obtiene los datos del nodo "contactUs" en la base de datos
      return get(dataRef).then((snapshot) => {
        const contactUsList = [];
        if (snapshot.exists()) {
          // Itera sobre los datos obtenidos y los formatea
          snapshot.forEach((child) => {
            const contactUsKey = child.key; // Clave única de cada dato
            const contactUsData = child.val(); // Datos de contacto

            const contactUsObject = {
              id: contactUsKey,
              email: contactUsData.email,
              fullName: contactUsData.fullName,
              phone: contactUsData.phone,
              message: contactUsData.message,
              date: contactUsData.date,
            };

            contactUsList.unshift(contactUsObject); // Agrega los datos formateados a la lista
          });
        }
        return contactUsList; // Devuelve la lista de datos de contacto formateados
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  // Método asíncrono para obtener datos de noticias desde la base de datos de Firebase
  async showNewsData() {
    try {
      // Referencia al nodo "news" en la base de datos
      const dataRef = ref(database, "news");
      // Obtiene los datos del nodo "news" en la base de datos
      return get(dataRef).then((snapshot) => {
        const newsList = [];
        if (snapshot.exists()) {
          // Itera sobre los datos obtenidos y los formatea
          snapshot.forEach((child) => {
            const newsKey = child.key; // Clave única de cada noticia
            const newsData = child.val(); // Datos de la noticia

            const newsObject = {
              id: newsKey,
              author: newsData.author,
              content: newsData.content,
              date: newsData.date,
              frontImage: newsData.frontImage,
              hour: newsData.hour,
              title: newsData.title,
            };

            newsList.unshift(newsObject); // Agrega los datos formateados a la lista
          });
        }
        return newsList; // Devuelve la lista de datos de noticias formateados
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  // Método para obtener datos de una noticia específica por su ID desde la base de datos de Firebase
  showNewsDataById(id) {
    try {
      // Referencia al nodo de la noticia específica utilizando su ID
      const dataRef = ref(database, `news/${id}`);
      let newsObject = {};
      // Obtiene los datos de la noticia específica
      return get(dataRef).then((snapshot) => {
        if (snapshot.exists()) {
          const newsData = snapshot.val(); // Datos de la noticia
          // Formatea los datos de la noticia específica
          newsObject = {
            id: id,
            author: newsData.author,
            content: newsData.content,
            date: newsData.date,
            frontImage: newsData.frontImage,
            hour: newsData.hour,
            title: newsData.title,
          };
        }
        return newsObject; // Devuelve los datos de la noticia formateados
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  // Método para eliminar una noticia de la base de datos de Firebase
  async deleteNewsData(id) {
    try {
      // Referencia al nodo de la noticia específica utilizando su ID
      const newsRef = ref(database, `news/${id}`);
      // Elimina la noticia del nodo correspondiente en la base de datos
      await remove(newsRef);
    } catch (error) {
      console.error(error.message);
    }
  }
}

/**
 * Función para obtener la fecha y hora actuales formateadas en el formato "dd/mm/yyyy (hh:mm AM/PM)".
 * @returns {string} La fecha y hora actuales formateadas.
 */
const getCurrentDate = () => {
  // Opciones para el formato de fecha y hora
  const options = {
    day: "2-digit", // Día con dos dígitos
    month: "2-digit", // Mes con dos dígitos
    year: "numeric", // Año con cuatro dígitos
    hour: "2-digit", // Hora en formato de 12 horas con dos dígitos
    minute: "2-digit", // Minutos con dos dígitos
  };
  // Obtiene la fecha y hora actuales y las convierte en una cadena en formato local
  const date = new Date().toLocaleString("es-ES", options);
  // Extrae la parte de la hora de la cadena de fecha y hora
  const hour12 = date.split(", ")[1];
  // Divide la hora en horas y minutos
  const [hour, minutes] = hour12.split(":");
  // Determina si es AM o PM
  const ampm = hour < 12 ? "AM" : "PM";
  // Formatea la hora en formato de 12 horas
  const hourFormat12 = hour % 12 || 12;
  // Convierte la hora formateada en una cadena de dos dígitos
  const formattedHour = hourFormat12.toString().padStart(2, "0");
  // Concatena la fecha y la hora formateadas en un formato legible
  const formattedDate =
    date.split(", ")[0] + ` (${formattedHour}:${minutes}${ampm})`;

  return formattedDate; // Devuelve la fecha y hora formateadas
};
