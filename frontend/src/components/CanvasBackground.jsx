import React, { useEffect, useRef } from "react";

const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let nodes = [];
    let wanderer = null;
    let frameCount = 0;
    let animationFrameId;

    const settings = {
      gridResolution: 3,
      maxNodes: 600,
      backgroundOpacity: 0.2,
      dropFrequency: 5,
      numDrops: 4,
      maxDropDistance: 40,
      maxNodeConnectionDistance: 50,
      maxNodeConnections: 6,
      nodeConnectionOpacity: 0.05,
      minNodeSize: 1,
      maxNodeSize: 3,
      wanderRadius: 15,
      wanderDistance: 400,
      wanderChange: 0.8,
      showWanderer: false,
    };

    const createWanderer = () => ({
      location: [canvas.width / 2, canvas.height / 2],
      velocity: [0, -3],
      acceleration: [0, 0],
      mass: 1,
      size: 5,
      color: "rgba(255, 0, 100, 0.5)",
      wander(radius, distance, change) {
        let wanderPoint = normalize([Math.random() - 0.5, Math.random() - 0.5]);
        wanderPoint = multiply(wanderPoint, radius);
        let target = add(wanderPoint, [distance, 0]);
        target = rotate(target, Math.atan2(this.velocity[1], this.velocity[0]));
        target = add(target, this.location);
        let force = subtract(target, this.location);
        force = normalize(force);
        force = multiply(force, change);
        this.applyForce(force);
      },
      applyForce(force) {
        this.acceleration = add(this.acceleration, force);
      },
      update() {
        this.velocity = add(this.velocity, this.acceleration);
        this.velocity = multiply(normalize(this.velocity), 3);
        this.location = add(this.location, this.velocity);
        this.acceleration = [0, 0];
        this.checkEdges();
      },
      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.location[0], this.location[1], this.size, 0, Math.PI * 2);
        ctx.fill();
      },
      checkEdges() {
        if (this.location[0] > canvas.width) this.location[0] = 0;
        else if (this.location[0] < 0) this.location[0] = canvas.width;
        if (this.location[1] > canvas.height) this.location[1] = 0;
        else if (this.location[1] < 0) this.location[1] = canvas.height;
      },
    });

    const createNode = (x, y, size) => ({
      location: [x, y],
      velocity: [
        Math.random() * 0.2 * (Math.random() < 0.5 ? 1 : -1),
        Math.random() * 0.2 * (Math.random() < 0.5 ? 1 : -1),
      ],
      size: size,
      color: `rgba(43, 118, 237, ${Math.random() * 0.5 + 0.1})`,
      update() {
        this.location = add(this.location, this.velocity);
      },
      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.location[0], this.location[1], this.size, 0, Math.PI * 2);
        ctx.fill();
      },
    });

    const drop = () => {
      const dropLocation = [...wanderer.location];
      for (let i = 0; i < settings.numDrops; i++) {
        const randPosition = [Math.random() * canvas.width, Math.random() * canvas.height];
        const direction = normalize(subtract(randPosition, dropLocation));
        const nodeLocation = add(dropLocation, multiply(direction, Math.random() * settings.maxDropDistance));
        const size = Math.random() * (settings.maxNodeSize - settings.minNodeSize) + settings.minNodeSize;
        nodes.push(createNode(nodeLocation[0], nodeLocation[1], size));
        while (nodes.length > settings.maxNodes) {
          nodes.shift();
        }
      }
    };

    const drawBackground = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${settings.backgroundOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAndDrawNodes = () => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${settings.nodeConnectionOpacity})`;
      nodes.forEach((node) => {
        node.update();
        node.draw(ctx);
        const closestNodes = nodes
          .filter((otherNode) => otherNode !== node && distance(node.location, otherNode.location) < settings.maxNodeConnectionDistance)
          .sort((a, b) => distance(node.location, a.location) - distance(node.location, b.location))
          .slice(0, settings.maxNodeConnections);

        closestNodes.forEach((otherNode) => {
          ctx.beginPath();
          ctx.moveTo(node.location[0], node.location[1]);
          ctx.lineTo(otherNode.location[0], otherNode.location[1]);
          ctx.stroke();
        });
      });
    };

    const animate = () => {
      drawBackground();
      wanderer.wander(settings.wanderRadius, settings.wanderDistance, settings.wanderChange);
      wanderer.update();
      if (settings.showWanderer) {
        wanderer.draw(ctx);
      }
      updateAndDrawNodes();
      if (frameCount % settings.dropFrequency === 0) drop();
      frameCount++;
      
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      wanderer.location = [canvas.width / 2, canvas.height / 2];
    };

    const initializeAnimation = () => {
      wanderer = createWanderer();
      resizeCanvas();
      animate();
    };

    initializeAnimation();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

const add = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
const subtract = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]];
const multiply = (v, s) => [v[0] * s, v[1] * s];
const normalize = (v) => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return len > 0 ? [v[0] / len, v[1] / len] : [0, 0];
};
const rotate = (v, angle) => [
  v[0] * Math.cos(angle) - v[1] * Math.sin(angle),
  v[0] * Math.sin(angle) + v[1] * Math.cos(angle),
];
const distance = (v1, v2) =>
  Math.sqrt(Math.pow(v2[0] - v1[0], 2) + Math.pow(v2[1] - v1[1], 2));

export default CanvasBackground;