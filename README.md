# Tu Perfume CR

Catálogo demostrativo de fragancias con enfoque en Costa Rica. Sitio estático hecho con HTML, CSS y JavaScript; no usa framework ni dependencias de ejecución.

## Catálogo y precios

El catálogo inicial reúne 15 fragancias. Los precios son referencias observadas en fuentes costarricenses y llevan su fuente y fecha. No representan una oferta de venta de Tu Perfume CR. La demo no confirma existencias, autenticidad de inventario, entregas, pagos ni pedidos.

Las fotos son imágenes de producto procedentes del catálogo público de Fragancias506.com. Revisá `FUENTES_DE_IMAGENES.md` y obtené autorización de reutilización antes de convertir el catálogo en una tienda comercial.

## Blog

La portada enlaza tres artículos informativos:

- articulos/perfumes-para-el-calor.html: perfiles frescos para clima cálido.
- articulos/perfumes-para-la-noche.html: opciones cálidas y especiadas para salidas nocturnas.
- articulos/perfume-segun-la-ocasion.html: cómo elegir para el día, una salida o un regalo.

Las fotos de los artículos provienen de Wikimedia Commons con créditos y licencias visibles. Sus fuentes están documentadas en FUENTES_DE_IMAGENES.md. Las 15 fotos del catálogo tienen una situación distinta: hay que obtener autorización de Fragancias506 o reemplazarlas por imágenes autorizadas antes de usarlas comercialmente.

## Archivos

- `index.html`: catálogo y carrito de muestra.
- `guia.html`: guía informativa para elegir perfume.
- `productos.json`: productos, precio de referencia, fuentes e imágenes.
- `imagenes/perfumes/`: 15 fotos locales para el catálogo.
- `ESTUDIO_DE_MERCADO.md`: criterios, señales de demanda y precios observados.
- `FUENTES_DE_IMAGENES.md`: origen de cada foto.
- `CNAME`, `robots.txt`, `sitemap.xml`: dominio y SEO técnico.
- `.github/workflows/static.yml`: despliegue en GitHub Pages al publicar cambios en `main`.

## Editar productos

Actualizá `productos.json`. Para cada producto incluí el identificador, nombre, marca, tamaño, concentración, categoría, precio de referencia, enlace y fecha de la fuente, imagen y enlace de la foto. Si el precio deja de ser verificable, actualizarlo o quitarlo; no publicarlo como precio actual sin fecha.

## Publicación

El sitio está publicado con GitHub Pages en `http://tuperfumecr.labweb.top/`; el workflow despliega desde la rama `main`. El CNAME `tuperfumecr` está configurado en Spaceship para `contruyotuproyecto.github.io` y los resolvers públicos lo devuelven correctamente. A fecha 19 de octubre de 2026, GitHub Pages sigue mostrando `InvalidDNSError` y un error al emitir el certificado, por lo que HTTPS aún no está disponible ni debe activarse manualmente.

El sitemap `https://tuperfumecr.labweb.top/sitemap.xml` fue enviado a la propiedad de dominio `labweb.top` en Google Search Console y figura como aceptado, con cinco páginas descubiertas. Esto confirma la recepción del sitemap, no que Google ya haya indexado cada página. Revisar la emisión del certificado en la configuración de Pages y solicitar inspección de URL cuando HTTPS quede listo.

## Marca y operación

Se eligió el nombre inicial **Tu Perfume CR** porque el dominio propuesto lo admite. No se agregó teléfono, WhatsApp, stock, pasarela de pago ni política de entrega: esos datos no fueron proporcionados.
