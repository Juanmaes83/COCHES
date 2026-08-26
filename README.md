# COCHES — Premium Motion Lab

Laboratorio web para reconstruir y evolucionar una experiencia de carrusel automotriz premium inspirada en interfaces de producto de alta gama.

## Objetivo

Construir un motor reutilizable de presentación de producto con:

- drag horizontal real
- inercia y desaceleración
- snap preciso
- parallax 2.5D sutil
- sincronización por progreso entre vehículo, tipografía de fondo, copy y paginación
- cursor contextual de arrastre
- soporte desktop y touch
- laboratorio de ajuste de motion antes de cerrar el diseño final

## Estrategia de desarrollo

1. **Motion Lab local** — validar física y respuesta.
2. **Premium Feel** — refinar easing, jerarquía, parallax y transiciones.
3. **Production Polish** — responsive, accesibilidad, rendimiento y limpieza.
4. **Demo verificable** — publicar una versión navegable para revisión visual.

## Stack previsto

- React
- Vite
- TypeScript
- GSAP
- CSS moderno

## Fuente de verdad

La lógica de interacción debe responder a un único progreso continuo. No se construirá como una sucesión de animaciones aisladas ni como un carrusel genérico.

## Estado

Proyecto inicializado. La implementación se realizará en `feat/premium-motion-lab` una vez creado el primer commit base.
