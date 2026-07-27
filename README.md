# GeneraPass

Generador de contraseñas y frases de paso, 100% en el navegador.

**Demo:** https://jbotialopez.github.io/generapassword/

## Características

- Contraseñas aleatorias o frases de paso estilo diceware (`correcto-caballo-batería-grapa`).
- Fortaleza calculada por entropía real (bits), no por una heurística aproximada.
- Garantiza que cada tipo de carácter seleccionado (mayúsculas, minúsculas, números, símbolos) aparezca al menos una vez.
- Opción para evitar caracteres visualmente ambiguos (`0`, `O`, `1`, `l`, `I`...).
- Modo claro/oscuro: respeta el sistema por defecto, o se puede forzar.
- El portapapeles se borra automáticamente a los 25 s tras copiar.
- Todo se genera en el navegador: nada se envía ni se guarda en ningún servidor.

## Uso local

Abre `index.html` en cualquier navegador. No requiere instalación, build ni dependencias.

## Stack

HTML, CSS y JavaScript sin frameworks ni librerías externas.
