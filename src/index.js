import React, { useRef, useState, useEffect } from "react";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { curveBasis } from "d3-shape";
import { extent } from "d3-array";

const tableau20 = [
  "#4c78a8",
  "#9ecae9",
  "#f58518",
  "#ffbf79",
  "#54a24b",
  "#88d27a",
  "#b79a20",
  "#f2cf5b",
  "#439894",
  "#83bcb6",
  "#e45756",
  "#ff9d98",
  "#79706e",
  "#bab0ac",
  "#d67195",
  "#fcbfd2",
  "#b279a2",
  "#d6a5c9",
  "#9e765f",
  "#d8b5a5"
];

function Doodleplot({
  data = [],
  width = 500,
  height = 500,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  r = 2
}) {
  const [mouseDown, setMouseDown] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currStroke, setCurrStroke] = useState([]);
  const canvasRef = useRef(null);

  const xScale = scaleLinear()
    .range([margin.left, width - margin.right])
    .domain(extent(data, d => d.x));

  const yScale = scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(extent(data, d => d.y).reverse());

  const colorScale = scaleOrdinal(tableau20).domain(
    new Set(data.map(d => d.cluster))
  );

  function handleMouseDown(e) {
    setMouseDown(true);
    setCurrStroke([]);
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left; //x position within the element.
    let y = e.clientY - rect.top; //y position within the element.
    setCurrStroke([...currStroke, [x, y]]);
    render();
  }
  function handleMouseUp(e) {
    setMouseDown(false);
    setStrokes([...strokes, currStroke]);
  }

  function handleMouseMove(e) {
    if (mouseDown) {
      let rect = e.target.getBoundingClientRect();
      let x = e.clientX - rect.left; //x position within the element.
      let y = e.clientY - rect.top; //y position within the element.
      setCurrStroke([...currStroke, [x, y]]);
      render();
    }
  }

  function drawPoint(ctx, x, y, r, color) {
    ctx.fillStyle = colorScale(color);
    ctx.beginPath();
    ctx.arc(xScale(x), yScale(y), r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    for (const { x, y, cluster } of data) {
      drawPoint(ctx, x, y, r, cluster);
    }
    const curve = curveBasis(ctx);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const stroke of [...strokes, currStroke]) {
      ctx.beginPath();
      curve.lineStart();
      for (const point of stroke) {
        curve.point(...point);
      }
      if (stroke.length === 1) curve.point(...stroke[0]);
      curve.lineEnd();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    }
  }

  useEffect(() => {
    const dpi = window.devicePixelRatio;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    console.log(dpi);
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    ctx.scale(dpi, dpi);
    render();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ width: width + "px", height: height + "px" }}
    />
  );
}
export default Doodleplot;
