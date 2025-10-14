# Booker Example

This example demonstrates how to embed the `open-class-scheduler` module within another React project. It showcases the integration workflow for consuming the scheduler as a pre-built package, loading its bundled JavaScript and CSS directly from the `dist/` output of the main project.

## Project Overview

- The app bootstraps with Vite and React, loading Tailwind CSS utilities configured in `tailwind.config.js`.
- `src/App.jsx` imports `OpenClassScheduler` from `../../dist/open-class-scheduler.es` and renders it inside a modal controlled by local component state.
- Styling is composed from the shared `open-class-scheduler.css` file alongside Tailwind classes and scoped component styles in `src/App.css`.
- The setup provides a minimal sandbox for verifying that the scheduler can be packaged, distributed, and embedded in third-party React codebases.
