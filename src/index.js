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
  margin = { top: 20, right: 20, bottom: 25, left: 25 },
  r = 2,
  lineWidth = 4,
  strokeStyle = "#000000",
  onDrawingFinish = null
}) {
  const [mouseDown, setMouseDown] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currStroke, setCurrStroke] = useState([]);
  const canvasRef = useRef(null);

  const xScale = scaleLinear()
    .range([margin.left, width - margin.right])
    .domain(extent(data, d => d.x))
    .nice();

  const yScale = scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(extent(data, d => d.y).reverse())
    .nice();

  const colorScale = scaleOrdinal(tableau20).domain(
    new Set(data.map(d => d.cluster))
  );

  function handleMouseDown() {
    setMouseDown(true);
    setCurrStroke([]);
  }

  function handleMouseUp() {
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

  function handleClick() {
    onDrawingFinish(
      strokes.flat().map(([x, y]) => [xScale.invert(x), yScale.invert(y)])
    );
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
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }
  useEffect(() => {
    const dpi = window.devicePixelRatio;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpi, dpi);
    render();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: width,
        height: height,
        fontSize: 10
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", zIndex: -1, top: 0, left: 0 }}
      />
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          zIndex: 2,
          top: 0,
          left: 0,
          pointerEvents: "none"
        }}
      >
        <g>
          {/* Y axis */}
          <g
            transform={`translate(${margin.left},0)`}
            style={{
              textAnchor: "end",
              fontSize: 10
            }}
          >
            <line
              y1={yScale.range()[0]}
              y2={yScale.range()[1]}
              style={{
                stroke: "currentColor",
                lineHeight: 1.5
              }}
            />
            {yScale.ticks().map((d, i) => (
              <g transform={`translate(0,${yScale(d)})`} key={i}>
                <line
                  x2={-6}
                  style={{
                    stroke: "currentColor",
                    lineHeight: 1.5
                  }}
                />
                <text dy={"0.32em"} x={-9}>
                  {d}
                </text>
              </g>
            ))}
          </g>

          {/* X axis */}
          <g
            transform={`translate(0,${yScale.range()[0]})`}
            style={{
              textAnchor: "middle",
              fontSize: 10
            }}
          >
            <line
              x1={xScale.range()[0]}
              x2={xScale.range()[1]}
              style={{
                stroke: "currentColor",
                lineHeight: 1.5
              }}
            />
            {xScale.ticks().map((d, i) => (
              <g transform={`translate(${xScale(d)},0)`} key={i}>
                <line
                  y2={6}
                  style={{
                    stroke: "currentColor",
                    lineHeight: 1.5
                  }}
                />
                <text y={9} dy={"0.71em"}>
                  {d}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
      <button
        style={{ position: "absolute", zIndex: 50 }}
        onClick={handleClick}
      >
        Submit
      </button>
    </div>
  );
}
export default Doodleplot;
