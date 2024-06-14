import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const SlotMachine = () => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({ width: 480, height: 480 });
    appRef.current = app;

    if (pixiContainer.current) {
      pixiContainer.current.appendChild(app.view);
    } else {
      console.error("pixiContainer.current is not available.");
      return;
    }

    const loader = new PIXI.Loader();
    loader
      .add("cherry", "assets/cherry.png")
      .add("banana", "assets/banana.png")
      .add("melon", "assets/melon.png");

    loader.onError.add((error) => {
      console.error("Error loading assets:", error);
    });

    loader.load((loader, resources) => {
      if (!resources.cherry || !resources.banana || !resources.melon) {
        console.error("Error: One or more textures failed to load.");
        return;
      }

      const SYMBOL_SIZE = 180;
      const slotTextures = [
        resources.cherry.texture,
        resources.banana.texture,
        resources.melon.texture,
      ];

      const reels = [];
      const reelContainer = new PIXI.Container();

      const middleRowBackground = new PIXI.Graphics();
      middleRowBackground.beginFill(0xff0000, 0.2);
      middleRowBackground.drawRect(
        0,
        SYMBOL_SIZE - 180,
        SYMBOL_SIZE * 3,
        SYMBOL_SIZE
      );
      middleRowBackground.endFill();
      reelContainer.addChild(middleRowBackground);

      for (let i = 0; i < 3; i++) {
        const rc = new PIXI.Container();
        rc.x = i * SYMBOL_SIZE;
        reelContainer.addChild(rc);

        const reel = {
          container: rc,
          symbols: [],
          position: 0,
          previousPosition: 0,
          blur: new PIXI.filters.BlurFilter(),
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        for (let j = 0; j < 3; j++) {
          const symbol = new PIXI.Sprite(
            slotTextures[Math.floor(Math.random() * slotTextures.length)]
          );
          symbol.y = j * (SYMBOL_SIZE - 110);
          symbol.scale.set(SYMBOL_SIZE / symbol.width);
          symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
          reel.symbols.push(symbol);
          rc.addChild(symbol);
        }

        reels.push(reel);
      }

      app.stage.addChild(reelContainer);

      const updateDimensions = () => {
        const { innerWidth, innerHeight } = window;
        let size = Math.min(innerWidth, innerHeight) * 0.8;

        if (innerWidth < 600) {
          size = Math.min(innerWidth, innerHeight) * 0.6;
        }
        app.renderer.resize(size, size);

        reelContainer.x = (app.screen.width - reelContainer.width) / 2;
        reelContainer.y = (app.screen.height - reelContainer.height) / 2;
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      const style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 44,
        fontWeight: "bold",
        fill: ["#ffffff", "#ffd700"],
        stroke: "#4a1850",
        strokeThickness: 3,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 4,
      });

      const playText = new PIXI.Text("Spin!", style);
      playText.x = Math.round((app.screen.width - playText.width) / 2);
      playText.y = app.screen.height - 60;
      app.stage.addChild(playText);

      playText.interactive = true;
      playText.buttonMode = true;
      playText.addListener("pointerdown", () => {
        startPlay();
      });

      let running = false;

      function startPlay() {
        if (running) return;
        running = true;

        reels.forEach((r) => {
          r.position = 0;
          r.previousPosition = 0;
          r.blur.blurX = 5;
          r.blur.blurY = 10;

          r.symbols.forEach((s) => {
            s.texture =
              slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.set(SYMBOL_SIZE / s.texture.width);
            s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
          });
        });

        for (let i = 0; i < reels.length; i++) {
          const r = reels[i];
          const extra = Math.floor(Math.random() * 3);
          const target = r.position + 20 + i * 10 + extra;
          const time = 1500 + i * 300 + extra * 500;
          const blurDelta = 0.5;

          tweenTo(
            r,
            "position",
            target,
            time,
            backout(0.5),
            () => {
              const blurAmount = (r.position - r.previousPosition) * blurDelta;
              r.blur.blurY = Math.max(blurAmount, 0);
              r.previousPosition = r.position;
            },
            i === reels.length - 1 ? reelsComplete : null
          );
        }
      }

      function reelsComplete() {
        reels.forEach((r) => {
          r.blur.blurX = 0;
          r.blur.blurY = 0;
        });

        running = false;
      }

      app.ticker.add(() => {
        for (let i = 0; i < reels.length; i++) {
          const r = reels[i];
          r.blur.blurY = (r.position - r.previousPosition) * 8;
          r.previousPosition = r.position;

          for (let j = 0; j < r.symbols.length; j++) {
            const s = r.symbols[j];
            const prevy = s.y;
            s.y =
              ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
            if (s.y < 0 && prevy > SYMBOL_SIZE) {
              s.texture =
                slotTextures[Math.floor(Math.random() * slotTextures.length)];
              s.scale.set(SYMBOL_SIZE / s.texture.width);
              s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
            }
          }
        }
      });

      function tweenTo(
        object,
        property,
        target,
        time,
        easing,
        onchange,
        oncomplete
      ) {
        const tween = {
          object,
          property,
          propertyBeginValue: object[property],
          target,
          easing,
          time,
          change: onchange,
          complete: oncomplete,
          start: Date.now(),
        };

        app.ticker.add((delta) => {
          const now = Date.now();
          const elapsed = now - tween.start;
          const progress = Math.min(elapsed / time, 1);

          object[property] = lerp(
            tween.propertyBeginValue,
            tween.target,
            easing(progress)
          );

          if (progress === 1) {
            if (tween.complete) tween.complete();
          }

          if (tween.change) tween.change(object[property]);
        });

        return tween;
      }

      function lerp(a1, a2, t) {
        return a1 * (1 - t) + a2 * t;
      }

      function backout(amount) {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
      }
    });

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  return (
    <div
      ref={pixiContainer}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
};

export default SlotMachine;
