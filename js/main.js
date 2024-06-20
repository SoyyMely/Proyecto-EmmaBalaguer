/*!
 * Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
 */

/**
 * Script principal para la página web.
 * Contiene funciones para manipular la interfaz de usuario, interactuar con Firebase y gestionar eventos.
 */

import { FirebaseManage } from "./firebase.js"; // Importa la clase FirebaseManage desde el archivo firebase.js

// Función principal que se ejecuta cuando el contenido del DOM ha sido completamente cargado
window.addEventListener("DOMContentLoaded", (event) => {
  // Función para reducir el tamaño de la barra de navegación al hacer scroll
  var navbarShrink = function () {
    // Obtiene referencias a elementos del DOM relevantes
    const navbarCollapsible = document.body.querySelector("#mainNav");
    const logo = document.body.querySelector("#logo");

    // Verifica si existe la barra de navegación y si no hay scroll vertical o si la ventana es ancha
    if (!navbarCollapsible) {
      return;
    }
    if (window.scrollY === 0 && window.innerWidth > 992) {
      // Si no hay scroll o la ventana es ancha, restaura la barra de navegación a su tamaño original
      navbarCollapsible.classList.remove("navbar-shrink");
      logo.setAttribute("src", "../assets/white-logo.png");
    } else {
      // Si hay scroll o la ventana es estrecha, reduce la barra de navegación
      navbarCollapsible.classList.add("navbar-shrink");
      logo.setAttribute("src", "../assets/black-logo.png");
    }
  };

  // Inicia la función de reducción de la barra de navegación
  navbarShrink();

  // Escucha el evento de scroll para ajustar la barra de navegación
  document.addEventListener("scroll", navbarShrink);

  // Activa el scrollspy de Bootstrap en el elemento de navegación principal
  const mainNav = document.body.querySelector("#mainNav");
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: "#mainNav",
      rootMargin: "0px 0px -40%", // Establece el margen de raíz para el scrollspy
    });
  }

  // Valida si el usuario está autenticado y muestra/oculta elementos del DOM según corresponda
  if (isAuthenticated()) {
    hideAndShowElements();
  } else {
    // Si el usuario no está autenticado y trata de acceder a ciertas rutas, redirige al index
    const restrictedPaths = [
      "/pages/notifications.html",
      "/pages/admin-news.html",
      "/pages/profile.html",
    ];
    if (restrictedPaths.includes(window.location.pathname)) {
      window.location.href = "../index.html"; // Redirige al index
      return;
    }
  }

  // Muestra noticias en la página principal
  if (
    window.location.pathname === "/index.html" ||
    window.location.pathname === "/"
  ) {
    showLatestNews();
  }

  // Muestra notificaciones de ContactUs en la página de notificaciones
  if (window.location.pathname === "/pages/notifications.html") {
    showNotifications();
  }

  // Muestra noticias en la página de noticias
  if (window.location.pathname === "/pages/news.html") {
    showNews();
  }

  // Muestra el detalle de una noticia en la página de noticias completa
  if (window.location.pathname === "/pages/full-news.html") {
    showNewsDetail();
  }

  // Agrega un EventListener al formulario de noticias de administrador
  if (window.location.pathname === "/pages/admin-news.html") {
    const adminNewsForm = document
      .querySelector("#news-form")
      .addEventListener("submit", (event) => saveNewsData(event));
  }

  // Agrega EventListeners a la página de perfil
  if (window.location.pathname === "/pages/profile.html") {
    const changePasswordBtn = document
      .querySelector("#changePassword")
      .addEventListener("click", () => changePassword());
    const loggedUser = document.querySelector("#loggedUser");
    loggedUser.textContent = JSON.parse(user).email;
  }
});

// Escucha el evento de redimensionamiento de la ventana para ajustar el logotipo
window.addEventListener("resize", () => {
  const logo = document.querySelector("#logo");
  if (window.scrollY === 0 && window.innerWidth > 992) {
    logo.setAttribute("src", "../assets/white-logo.png");
  } else {
    logo.setAttribute("src", "../assets/black-logo.png");
  }
});

/**
 * Función para mostrar un modal de inicio de sesión.
 * Permite al usuario iniciar sesión y autenticarse.
 * @async
 * @function loginModal
 * @returns {Promise<void>} No devuelve ningún valor explícito.
 */
const loginModal = async () => {
  // Muestra un modal personalizado con sweetalert para iniciar sesión
  Swal.fire({
    iconHtml: '<i class="bi bi-person-fill"></i>',
    iconColor: "#0d48a1",
    title: "Iniciar Sesión",
    html:
      '<button class="custom-close-button" onclick="Swal.close()"><i class="bi bi-x"></i></button>' +
      '<form id="loginForm" class="needs-validation" novalidate>' +
      '<div class="mb-3">' +
      '<label for="email" class="form-label">Correo Electrónico</label>' +
      '<input type="email" class="form-control" id="email" name="email" required>' +
      '<div class="invalid-feedback">Por favor, ingrese un correo electrónico válido.</div>' +
      "</div>" +
      '<div class="mb-3">' +
      '<label for="password" class="form-label">Contraseña</label>' +
      '<input type="password" class="form-control" id="password" name="password" required>' +
      '<div class="invalid-feedback">Por favor, ingrese una contraseña.</div>' +
      "</div>" +
      "</form>",
    showCancelButton: true,
    confirmButtonText: "Ingresar",
    confirmButtonColor: "#0d47a1",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    /**
     * Ejecuta una serie de acciones antes de confirmar el modal.
     * @async
     * @function preConfirm
     * @returns {Promise<boolean>} Retorna true si la validación es exitosa, false de lo contrario.
     */
    preConfirm: async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let emailInput = Swal.getPopup().querySelector("#email");
      let password = Swal.getPopup().querySelector("#password").value;
      let email = emailInput.value.trim();

      // Validar el formato del correo electrónico
      if (!emailRegex.test(email)) {
        emailInput.classList.add("is-invalid");
        Swal.showValidationMessage("Correo Electrónico Inválido.");
        return false;
      }

      // Validar que la contraseña no esté vacía
      if (!password) {
        Swal.showValidationMessage("Ingrese una Contraseña.");
        return false;
      }

      try {
        // Autenticar al usuario utilizando FirebaseManage
        const account = new FirebaseManage();
        account
          .authenticate(email, password)
          .then((usr) => {
            if (usr) {
              sessionStorage.setItem("MY_USER", JSON.stringify(usr));
              hideAndShowElements();
              location.reload();
            }
          })
          .catch((error) => {
            // Mostrar un mensaje de error si la autenticación falla
            Swal.fire({
              title: "Ha ocurrido un error!",
              text: error.message,
              icon: "error",
            });
          });
        return true;
      } catch (error) {
        // Manejar errores de autenticación
        Swal.showValidationMessage(
          "Credenciales inválidas. Verifique su correo y contraseña."
        );
        return false;
      }
    },
    customClass: {
      closeButton: "custom-close-button",
    },
  });
};

/**
 * Función para cerrar sesión del usuario.
 * Llama a la función de FirebaseManage para cerrar sesión y oculta/muestra elementos del DOM.
 * @function logout
 * @returns {boolean} Retorna true si el proceso de cierre de sesión es exitoso, false si hay algún error.
 */
const logout = () => {
  try {
    try {
      // Muestra un modal de confirmación antes de cerrar sesión
      Swal.fire({
        title: "¿Seguro que desea salir?",
        text: "Si cierra sesión no podrá seguir administrando el portal.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "¡Si, salir!",
      }).then(async (result) => {
        // Si el usuario confirma la salida, procede a cerrar sesión
        if (result.isConfirmed) {
          // Crea una instancia de FirebaseManage para gestionar la autenticación
          const account = new FirebaseManage();
          // Llama a la función signOut de FirebaseManage para cerrar sesión
          account.signOut().then(() => hideAndShowElements());
          // Redirecciona al usuario a la página de inicio después de cerrar sesión
          window.location.href = "/";
        }
      });
    } catch (error) {
      // Maneja errores si ocurren al mostrar el modal o cerrar sesión
      console.error(error.message);
    }

    // Retorna true después de ejecutar correctamente el proceso de cierre de sesión
    return true;
  } catch (error) {
    // Maneja errores generales si ocurren durante el proceso de cierre de sesión
    console.error("Ha ocurrido un error: ", error);
    // Retorna false si hay algún error durante el proceso de cierre de sesión
    return false;
  }
};

/**
 * Función para cambiar la contraseña del usuario.
 * Muestra un modal de entrada de correo electrónico y llama a la función de resetPassword de FirebaseManage.
 * @async
 * @function changePassword
 */
const changePassword = async () => {
  // Muestra un modal personalizado para ingresar el correo electrónico
  const { value: email } = await Swal.fire({
    title: "Cambiar Contraseña",
    input: "email",
    inputLabel: "Ingresar correo electrónico",
    inputPlaceholder: "ejemplo@emma.edu",
    confirmButtonText: "Enviar",
    inputAttributes: {
      autocapitalize: "off",
      autocorrect: "off",
    },
  });
  // Si se proporciona un correo electrónico, llama a la función resetPassword de FirebaseManage para restablecer la contraseña
  if (email) {
    // Crea una instancia de FirebaseManage para gestionar la autenticación
    const account = new FirebaseManage();
    // Llama a la función resetPassword de FirebaseManage para restablecer la contraseña
    account.resetPassword(email);
  }
};

/**
 * Función para ocultar o mostrar elementos del DOM según el estado de inicio de sesión.
 * Utiliza sessionStorage para verificar si el usuario está autenticado.
 * @function hideAndShowElements
 */
const hideAndShowElements = () => {
  // Busca elementos en el DOM que representan el menú de perfil y el botón de inicio de sesión
  const profileMenu = document.querySelector("#profile");
  const loginBtn = document.querySelector("#login-btn");
  // Alterna la visibilidad de los elementos del DOM dependiendo del estado de inicio de sesión del usuario
  profileMenu.classList.toggle("d-none");
  loginBtn.classList.toggle("d-none");
};

/**
 * Función para mostrar notificaciones de ContactUs en la página de notificaciones.
 * Utiliza la función showContactUsData de FirebaseManage para obtener los datos de Firebase y renderizarlos en la interfaz.
 * @function showNotifications
 */
const showNotifications = () => {
  // Crea una instancia de FirebaseManage para interactuar con la base de datos
  const db = new FirebaseManage();
  // Obtiene los datos de ContactUs utilizando la función showContactUsData de FirebaseManage
  db.showContactUsData().then((data) => {
    // Busca el contenedor donde se mostrarán las notificaciones
    const container = document.querySelector("#notifications");
    // Itera sobre los datos de las notificaciones y crea un elemento HTML para cada una
    data.forEach((notification) => {
      // Crea un nuevo elemento HTML para la notificación
      const card = document.createElement("div");
      card.classList.add("col-lg-3", "col-md-6", "mb-4");
      card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">
            <i class="bi bi-person-fill"></i> ${notification.fullName}
          </h5>
          <h6 class="card-subtitle mb-2 text-muted">
            <i class="bi bi-envelope-fill"></i> <a href="mailto:${notification.email}">${notification.email}</a>
          </h6>
          <p class="card-text">
            <i class="bi bi-phone-fill"></i> ${notification.phone}
          </p>
          <p class="card-text">
            <i class="bi bi-chat-left-dots-fill"></i> "${notification.message}"
          </p>
          <p class="card-text">
            <i class="bi bi-clock-fill"></i> <small class="text-muted">${notification.date}</small>
          </p>
        </div>
      </div>
    `;
      // Agrega el elemento HTML al contenedor
      container.appendChild(card);
    });
  });
};

/**
 * Función para mostrar noticias en la página de noticias.
 * Utiliza la función showNewsData de FirebaseManage para obtener los datos de Firebase y renderizarlos en la interfaz.
 * @function showNews
 */
const showNews = () => {
  // Crea una instancia de FirebaseManage para interactuar con la base de datos
  const db = new FirebaseManage();
  // Obtiene los datos de noticias utilizando la función showNewsData de FirebaseManage
  db.showNewsData().then((data) => {
    // Busca el contenedor donde se mostrarán las noticias
    const cardContainer = document.querySelector("#news-container");
    // Busca el template de card para las noticias
    const cardTemplate = document.querySelector("#cardTemplate");
    // Itera sobre los datos de las noticias y crea un elemento HTML para cada una
    data.forEach((news) => {
      // Clona el template del card
      const cardClone = cardTemplate.content.cloneNode(true);
      // Obtiene referencias a los elementos del card
      const card = cardClone.querySelector(".news-card");
      const cardImage = cardClone.querySelector(".news-card-image");
      const cardTitle = cardClone.querySelector(".card-title");
      const cardContentPreview = cardClone.querySelector(".content-preview");
      const cardAuthor = cardClone.querySelector(".card-author");
      const cardDate = cardClone.querySelector(".card-date");
      const cardBtn = cardClone.querySelector(".show-more");
      const deleteBtn = cardClone.querySelector(".delete-news");
      // Establece los valores del card con los datos de la noticia actual
      card.style.Height = "210px";
      cardImage.src = news.frontImage;
      cardTitle.textContent = news.title;
      cardContentPreview.textContent = `${news.content.substring(0, 100)}...`;
      cardAuthor.textContent = news.author;
      cardDate.textContent = `${news.date} (${news.hour})`;
      cardBtn.setAttribute("href", `./full-news.html?id=${news.id}`);
      // Valida si el usuario ha iniciado sesión
      if (isAuthenticated()) {
        deleteBtn.classList.remove("d-none");
        // Agrega la función de eliminar a cada botón
        deleteBtn.addEventListener("click", (event) => {
          // Evita el comportamiento predeterminado del enlace
          event.preventDefault();
          // Llama a la función de eliminación pasando el ID de la noticia como argumento
          deleteNews(news.id);
        });
      }
      // Agrega el card al contenedor
      cardContainer.appendChild(cardClone);
    });
  });
};

/**
 * Función para mostrar noticias en la página principal.
 * Utiliza la función showNewsData de FirebaseManage para obtener los datos de Firebase y renderizarlos en la interfaz de Inicio.
 * @function showNews
 */
const showLatestNews = () => {
  // Crea una instancia de FirebaseManage para interactuar con la base de datos
  const db = new FirebaseManage();
  // Obtiene los datos de noticias utilizando la función showNewsData de FirebaseManage
  db.showNewsData().then((data) => {
    // Busca el contenedor donde se mostrarán las noticias
    const cardContainer = document.querySelector("#main-news-container");
    // Busca el template de card para las noticias
    const cardTemplate = document.querySelector("#cardTemplate");

    // Reduce la data a las últimas cuatro noticias
    const latestNews = data.slice(-4);

    // Itera sobre los datos de las noticias y crea un elemento HTML para cada una
    latestNews.forEach((news) => {
      // Clona el template del card
      const cardClone = cardTemplate.content.cloneNode(true);
      // Obtiene referencias a los elementos del card
      const card = cardClone.querySelector(".news-card");
      const cardImage = cardClone.querySelector(".news-card-image");
      const cardTitle = cardClone.querySelector(".card-title");
      const cardContentPreview = cardClone.querySelector(".content-preview");
      const cardAuthor = cardClone.querySelector(".card-author");
      const cardDate = cardClone.querySelector(".card-date");
      const cardBtn = cardClone.querySelector(".show-more");
      // Establece los valores del card con los datos de la noticia actual
      card.style.Height = "210px";
      cardImage.src = news.frontImage;
      cardTitle.textContent = news.title;
      cardContentPreview.textContent = `${news.content.substring(0, 100)}...`;
      cardAuthor.textContent = news.author;
      cardDate.textContent = `${news.date} (${news.hour})`;
      cardBtn.setAttribute("href", `./pages/full-news.html?id=${news.id}`);
      // Agrega el card al contenedor
      cardContainer.appendChild(cardClone);
    });
  });
};

/**
 * Función para mostrar el detalle de una noticia en la página de noticias completa.
 * Utiliza la función showNewsDataById de FirebaseManage para obtener los datos de Firebase y renderizarlos en la interfaz.
 * @function showNewsDetail
 */
const showNewsDetail = async () => {
  // Crea una instancia de FirebaseManage para interactuar con la base de datos
  const db = new FirebaseManage();
  // Obtiene el ID de la noticia de los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");
  // Obtiene los datos de la noticia utilizando la función showNewsDataById de FirebaseManage
  db.showNewsDataById(newsId).then((data) => {
    // Busca los elementos del DOM donde se mostrará el detalle de la noticia
    const newsHeader = document.querySelector("#news-header");
    const newsTitle = document.querySelector("#news-title");
    const newsDetail = document.querySelector("#news-detail");
    const newsContainer = document.querySelector("#news-container");
    // Establece los valores de los elementos del DOM con los datos de la noticia
    newsHeader.style.backgroundImage = `url("${data.frontImage}")`;
    newsTitle.textContent = data.title;
    newsDetail.innerHTML = `<p>${data.author}</p><p>${data.date} (${data.hour})</p>`;
    newsContainer.innerHTML = `<p>${data.content}</p>`;
  });
};

/**
 * Función para guardar los datos de una nueva noticia en Firebase.
 * Recolecta los datos del formulario, guarda la imagen en Firebase Storage, y luego guarda los datos en la base de datos de Firebase.
 * @async
 * @param {Event} event - El evento de envío del formulario.
 */
const saveNewsData = async (event) => {
  // Previene el comportamiento por defecto del formulario
  event.preventDefault();
  // Obtiene el formulario desde el evento
  const form = event.target;
  // Recolecta los valores del formulario
  const author = form.elements["author"].value;
  const title = form.elements["title"].value;
  const content = form.elements["content"].value;
  const frontImageFile = form.elements["frontImage"].files[0];
  // Obtiene la fecha y la hora actual
  const date = new Date().toLocaleDateString("es-ES");
  const hour = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  // Formatea la hora en un formato de 12 horas con ceros a la izquierda si es necesario
  const addZero = (num) => (num < 10 ? `0${num}` : num);
  const hourFormatted =
    addZero(new Date().getHours()) +
    ":" +
    addZero(new Date().getMinutes()) +
    (new Date().getHours() < 12 ? "AM" : "PM");
  // Crea una instancia de FirebaseManage para interactuar con Firebase
  const db = new FirebaseManage();
  // Guarda la imagen en Firebase Storage y obtiene su URL
  const frontImageUrl = await db.saveImageOnStorage(frontImageFile);
  // Guarda los datos de la noticia en la base de datos de Firebase
  await db.sendNewsData({
    author: author,
    title: title,
    content: content,
    frontImage: frontImageUrl,
    date: date,
    hour: hourFormatted,
  });
  // Reinicia el formulario después de enviar los datos
  form.reset();
  // Muestra un mensaje de éxito al usuario
  Swal.fire({
    title: "Excelente!",
    text: "Noticia Creada Correctamente",
    icon: "success",
  });
};

/**
 * Función para eliminar una noticia.
 * Muestra un mensaje de confirmación al usuario y, si confirma, elimina la noticia de Firebase.
 * @param {string} id - El ID de la noticia que se va a eliminar.
 */
const deleteNews = (id) => {
  // Muestra un mensaje de confirmación utilizando SweetAlert
  Swal.fire({
    title: "¿Desea eliminar la noticia?",
    text: "Si la elimina no podrá recuperarla nuevamente",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Eliminar",
  }).then(async (result) => {
    // Verifica si el usuario ha confirmado la eliminación
    if (result.isConfirmed) {
      try {
        // Crea una instancia de FirebaseManage para interactuar con la base de datos
        const db = new FirebaseManage();
        db.deleteNewsData(id);
        // Muestra un mensaje de éxito utilizando SweetAlert
        Swal.fire({
          icon: "success",
          title: "¡Eliminada!",
          text: "La noticia ha sido eliminada correctamente.",
        }).then((_) => location.reload());
      } catch (error) {
        // En caso de error, muestra un mensaje de error utilizando SweetAlert
        Swal.fire(
          "Error",
          "No se pudo eliminar la noticia. Por favor, inténtelo de nuevo.",
          "error"
        );
        console.error("Error al eliminar la noticia:", error);
      }
    }
  });
};

// EventListener para mostrar el modal de inicio de sesión al hacer clic en el botón de inicio de sesión
const loginModalBtn = document
  .querySelector("#login-btn")
  .addEventListener("click", () => loginModal());

// EventListener para cerrar sesión al hacer clic en el botón de cierre de sesión
const logoutBtn = document
  .querySelector("#logout")
  .addEventListener("click", () => logout());

const isAuthenticated = () => {
  return sessionStorage.getItem("MY_USER") !== null;
};
