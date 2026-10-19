# Tu Perfume CR

Catálogo y guías de perfumería para quienes buscan perfumes en Costa Rica. El sitio usa HTML, CSS y JavaScript nativos y se publica con GitHub Pages.

## Contenido

- `index.html`: portada, catálogo, búsqueda, filtros y favoritos.
- `productos.json`: las 15 fragancias visibles en el catálogo.
- `guia.html`: consejos para elegir una fragancia.
- `articulos/`: guías para clima cálido, salidas nocturnas y distintas ocasiones.
- `imagenes/`: imágenes locales del catálogo y del blog.
- `robots.txt`, `sitemap.xml`, `CNAME`: publicación y SEO técnico.

## Editar el catálogo

Actualizá `productos.json` con el nombre, marca, tamaño, concentración, categoría, imagen y descripción de cada fragancia.

## Publicación

El workflow de `.github/workflows/static.yml` publica los cambios en `main` en GitHub Pages. El dominio es `https://tuperfumecr.labweb.top/`.
