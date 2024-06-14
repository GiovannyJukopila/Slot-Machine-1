# Slot Machine Application

This repository contains a React component `SlotMachine` that implements a simple slot machine game using PixiJS, a powerful rendering engine for 2D web graphics. This README provides an overview of the project structure, setup instructions, and key features.

## Tools and Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **PixiJS**: A 2D WebGL rendering engine that supports Canvas fallback, used here for rendering slot machine graphics and animations.
- **JavaScript (ES6+)**: Modern JavaScript syntax and features for application logic.
- **HTML/CSS**: Basic structure and styling for the web interface.

## Project Structure

The main component `SlotMachine` is responsible for setting up the PixiJS application, loading assets, creating reels and symbols, handling game mechanics, and rendering animations. Key components and features include:

- **PixiJS Application Setup**: Initializes a PixiJS Application with a defined width and height.
- **Asset Loading**: Uses PixiJS Loader to preload slot symbols (cherry, banana, melon) from image assets.

- **Game Mechanics**: Implements spinning reels with randomized symbols and animation effects using PixiJS filters and tweens.

- **Responsive Design**: Ensures the game scales properly with the window size, adapting dimensions and positioning dynamically.

- **Animation and Interaction**: Utilizes PixiJS Ticker for continuous animation updates and Text objects for interactive UI elements.

---
