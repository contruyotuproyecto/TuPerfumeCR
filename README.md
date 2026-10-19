# 🎭 Therian Masks CR

Catálogo web de demostración para **Therian Masks CR**, con máscaras Therian artesanales. Las compras y los pedidos por WhatsApp no están habilitados en este momento.

🌐 **Sitio en vivo:** [contruyotuproyecto.github.io/therian-masks-cr](https://contruyotuproyecto.github.io/therian-masks-cr/)

---

## 📁 Estructura del proyecto

```
therian-masks-cr/
├── index.html              # Tienda principal
├── historia.html           # Artículo: ¿Qué es un Therian?
├── productos.json          # Catálogo de productos (editable)
├── logo.png                # Logo del negocio
├── therian_historia.jpg    # Imagen para la página de historia
└── imagenes/
    ├── lobo-lunar.jpg
    ├── zorro-otonal.jpg
    ├── dragon-mistico.jpg
    ├── gato-nocturno.jpg
    ├── ciervo-sagrado.jpg
    └── buho-sabio.jpg
```

---

## ✨ Funcionalidades

- 🛒 Carrito de demostración con cantidades y eliminación
- 📱 Diseño responsive (móvil y escritorio)
- 🔍 Filtros por categoría de máscara
- ❤️ Lista de favoritos (wishlist)
- 💬 Aviso al intentar contacto por **WhatsApp**, sin enviar pedidos
- 🔔 Notificación pop-out al agregar productos
- 📖 Página blog sobre el origen de los Therians
- 🗂️ Modal de detalle por producto

---

## 🛍️ Cómo funciona la demo

1. Explora las máscaras disponibles
2. Prueba el carrito de demostración
3. Las compras y los pedidos por WhatsApp no están habilitados en este momento

---

## 📦 Cómo agregar o editar productos

Editá el archivo `productos.json`. Cada producto tiene esta estructura:

```json
{
  "nombre": "Nombre del producto",
  "descripcion": "Descripción corta.",
  "precio": 25000,
  "stock": 10,
  "foto": "imagenes/nombre-archivo.jpg",
  "categoria": "Lobo",
  "destacado": true
}
```

| Campo | Descripción |
|-------|-------------|
| `nombre` | Nombre visible en la tienda |
| `descripcion` | Texto corto de la card |
| `precio` | En colones costarricenses (sin símbolos) |
| `stock` | Unidades disponibles. `0` = aparece como Agotado |
| `foto` | Ruta relativa a la imagen (dentro de `imagenes/`) |
| `categoria` | Lobo, Zorro, Dragón, Gato, Ciervo, Búho |
| `destacado` | `true` muestra badge "⭐ Destacado", `false` no |

---

## 🖼️ Cómo agregar imágenes nuevas

1. Guardá la imagen en la carpeta `imagenes/`
2. Usá nombres en **minúscula y sin espacios** (ej: `mascara-nueva.jpg`)
3. Agregá el producto en `productos.json` con `"foto": "imagenes/mascara-nueva.jpg"`
4. Subí los cambios a GitHub — el sitio se actualiza automáticamente

---

## 🚀 Tecnologías

- HTML5 + CSS3 vanilla
- JavaScript vanilla (sin frameworks)
- Google Fonts: Cinzel + Nunito
- Hospedado en **GitHub Pages** (gratis)

---

## 📞 Contacto

**Móvil:** X X X X X
**Nombre:** Propietario
**Estado:** sitio demo; compras no habilitadas
