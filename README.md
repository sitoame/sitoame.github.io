# Portafolio de Amed Murillo Estrada

Portafolio web estático pensado como CV digital y vitrina de proyectos BMS/HVAC. Todo el contenido vive en `data.json` para facilitar la actualización sin tocar el HTML.

## Cómo correr localmente

```bash
python3 -m http.server 8080
```

Luego visita `http://localhost:8080` en tu navegador.

## Cómo editar el contenido

Todos los datos del sitio están centralizados en `data.json`:

- `profile`: nombre, rol, bio y datos de contacto.
- `skills`: categorías y habilidades (pueden ser strings o `{name, level}`).
- `experience`: experiencia laboral para el timeline.
- `certifications`: listado de certificaciones.
- `projects`: proyectos escalables con descripción, retos, solución, impacto, stack y links.
- `gallery`: tarjetas de casos de estudio.
- `contact` y `footerLinks`: canales de contacto y enlaces del pie de página.

### Agregar un proyecto

1. Abre `data.json`.
2. Agrega un objeto al arreglo `projects` con los campos:

```json
{
  "id": "nuevo-proyecto",
  "title": "Nombre del proyecto",
  "description": "Resumen corto",
  "longDescription": "Descripción extendida",
  "challenges": "Retos principales",
  "solution": "Solución aplicada",
  "impact": "Resultados/impacto",
  "stack": ["BACnet", "Niagara"],
  "categories": ["BMS", "Automatización"],
  "links": [
    { "label": "Ficha técnica", "url": "https://example.com" }
  ]
}
```

3. Guarda el archivo y recarga el navegador. Los filtros y tarjetas se actualizan automáticamente.

## Despliegue en GitHub Pages o Netlify

1. Sube el repositorio a GitHub.
2. GitHub Pages: configura `Settings > Pages` y selecciona la rama principal.
3. Netlify: arrastra la carpeta del proyecto o conecta el repo. No se requiere build.

## Nota sobre 3D

La escena 3D está optimizada para escritorio y puede desactivarse con el interruptor `3D: ON/OFF` en el Hero para mejorar el rendimiento en dispositivos móviles.
