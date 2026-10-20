const url = 'https://dummyjson.com/products?limit=8';

const catalogo = document.querySelector("#catalogo");
const lineas = document.querySelector("#lineas");
const unidadesSpan = document.querySelector("#unidades");
const totalStrong = document.querySelector("#total");
const carritoVacio = document.querySelector("#carrito-vacio");
const btnVaciar = document.querySelector("#vaciar");

async function cargarProductos() {
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  mostrarCatalogo(datos.products);
}
function mostrarCatalogo(listaProductos) {
  listaProductos.forEach((prod) => {
    const articulo = document.createElement("article");
    articulo.classList.add("producto");

    articulo.dataset.id = prod.id;
    articulo.dataset.titulo = prod.title;
    articulo.dataset.precio = prod.price;
    articulo.dataset.stock = prod.stock;

    const img = document.createElement("img");
    img.src = prod.thumbnail;
    img.alt = prod.title;

    const h3 = document.createElement("h3");
    h3.textContent = prod.title;

    const pPrecio = document.createElement("p");
    pPrecio.classList.add("precio");
    pPrecio.textContent = `${prod.price} €`;

    const pStock = document.createElement("p");
    pStock.classList.add("stock");
    pStock.textContent = `Stock: ${prod.stock}`;

    const btnAnadir = document.createElement("button");
    btnAnadir.textContent = "Añadir";
    btnAnadir.disabled = prod.stock <= 0;
    
    
    

    articulo.appendChild(img);
    articulo.appendChild(h3);
    articulo.appendChild(pPrecio);
    articulo.appendChild(pStock);
    articulo.appendChild(btnAnadir);

    catalogo.appendChild(articulo);
  });
}

function crearLineaCarrito(id, titulo, precio, stock) {
  const li = document.createElement("li");
  li.classList.add("linea");
  li.dataset.id = id;
  li.dataset.precio = precio;
  li.dataset.stock = stock;

  const spanTitulo = document.createElement("span");
  spanTitulo.classList.add("titulo");
  spanTitulo.textContent = titulo;

  const btnQuitar = document.createElement("button");
  btnQuitar.dataset.accion = "quitar";
  btnQuitar.textContent = "Quitar";

  const spanUnitario = document.createElement("span");
  spanUnitario.classList.add("unitario");
  spanUnitario.textContent = `${precio} €`;

  const btnRestar = document.createElement("button");
  btnRestar.dataset.accion = "restar";
  btnRestar.textContent = "-";
  btnRestar.disabled = true;

  const spanCantidad = document.createElement("span");
  spanCantidad.classList.add("cantidad");
  spanCantidad.textContent = 1;

  const btnSumar = document.createElement("button");
  btnSumar.dataset.accion = "sumar";
  btnSumar.textContent = "+";
  btnSumar.disabled = stock <= 1;

  const spanSubtotal = document.createElement("span");
  spanSubtotal.classList.add("subtotal");
  spanSubtotal.textContent = `${precio} €`;

  li.appendChild(spanTitulo);
  li.appendChild(btnQuitar);
  li.appendChild(spanUnitario);
  li.appendChild(btnRestar);
  li.appendChild(spanCantidad);
  li.appendChild(btnSumar);
  li.appendChild(spanSubtotal);

  return li;
}

function actualizarLinea(linea, nuevaCantidad) {
  const precio = Number(linea.dataset.precio);
  const stock = Number(linea.dataset.stock);
  const id = linea.dataset.id;

  const spanCantidad = linea.querySelector(".cantidad");
  const spanSubtotal = linea.querySelector(".subtotal");
  const btnRestar = linea.querySelector('[data-accion="restar"]');
  const btnSumar = linea.querySelector('[data-accion="sumar"]');

  spanCantidad.textContent = nuevaCantidad;
  spanSubtotal.textContent = `${(precio * nuevaCantidad).toFixed(2)} €`;

  btnRestar.disabled = nuevaCantidad <= 1;
  btnSumar.disabled = nuevaCantidad >= stock;

  const tarjetaProducto = catalogo.querySelector(`.producto[data-id="${id}"]`);
  if (tarjetaProducto) {
    const btnAnadir = tarjetaProducto.querySelector("button");
    btnAnadir.disabled = true;
  }
}

function actualizarResumenCarrito() {
  const todasLasLineas = lineas.querySelectorAll(".linea");

  let totalUnidades = 0;
  let precioTotal = 0;

  todasLasLineas.forEach((linea) => {
    const cantidad = Number(linea.querySelector(".cantidad").textContent);
    const precio = Number(linea.dataset.precio);

    totalUnidades += cantidad;
    precioTotal += cantidad * precio;
  });

  unidadesSpan.textContent = totalUnidades;
  totalStrong.textContent = `${precioTotal.toFixed(2)} €`;

  const hayProductos = todasLasLineas.length > 0;
  carritoVacio.hidden = hayProductos;
  btnVaciar.disabled = !hayProductos;
}

catalogo.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;

  const tarjeta = boton.closest(".producto");
  const id = tarjeta.dataset.id;
  const titulo = tarjeta.dataset.titulo;
  const precio = Number(tarjeta.dataset.precio);
  const stock = Number(tarjeta.dataset.stock);

  const lineaExistente = lineas.querySelector(`.linea[data-id="${id}"]`);

  if (lineaExistente) {
    const cantidadActual = Number(lineaExistente.querySelector(".cantidad").textContent);
    if (cantidadActual < stock) {
      actualizarLinea(lineaExistente, cantidadActual + 1);
    }
  } else {
    const nuevaLinea = crearLineaCarrito(id, titulo, precio, stock);
    lineas.appendChild(nuevaLinea);
    actualizarLinea(nuevaLinea, 1);
    btnAnadir.disabled = true;
  }

  actualizarResumenCarrito();
});

lineas.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const linea = boton.closest(".linea");
  const accion = boton.dataset.accion;
  const cantidadActual = Number(linea.querySelector(".cantidad").textContent);
  const id = linea.dataset.id;

  if (accion === "sumar") {
    actualizarLinea(linea, cantidadActual + 1);
  } else if (accion === "restar") {
    if (cantidadActual > 1) {
      actualizarLinea(linea, cantidadActual - 1);
    }
  } else if (accion === "quitar") {
    const tarjetaProducto = catalogo.querySelector(`.producto[data-id="${id}"]`);
    if (tarjetaProducto) {
      tarjetaProducto.querySelector("button").disabled = false;
    }
    linea.remove();
  }

  actualizarResumenCarrito();
});

btnVaciar.addEventListener("click", () => {
  lineas.replaceChildren();

  const botonesCatalogo = catalogo.querySelectorAll(".producto button");
  botonesCatalogo.forEach((boton) => {
    const tarjeta = boton.closest(".producto");
    boton.disabled = Number(tarjeta.dataset.stock) === 0;
  });

  actualizarResumenCarrito();
});

cargarProductos();
actualizarResumenCarrito();