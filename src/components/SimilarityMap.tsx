import React, { useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import * as d3 from 'd3';
import { Node, Link } from '../../types';

interface GraphProps {
  nodes: Node[];
  links: Link[];
}

export const SimilarityMap: React.FC<GraphProps> = ({ nodes, links }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  useEffect(() => {
    if (canvasRef.current) {
      // Инициализация Fabric.js Canvas
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
      });

      fabricCanvasRef.current = fabricCanvas;

      // Очистка перед отрисовкой
      fabricCanvas.clear();

      // Определение масштаба для радиуса на основе значения 'Spotify Streams'
      const streamValues = nodes.map((node) => node['Spotify Streams']);
      const radiusScale = d3
        .scaleSqrt()
        .domain([Math.min(...streamValues), Math.max(...streamValues)])
        .range([1, 40]);

      // Отрисовка связей (ребер)
      links.forEach((link) => {
        const source = link.source as Node;
        const target = link.target as Node;
        const value = link.value;
        if (source.x && source.y && target.x && target.y) {
          if (value > 0.96) {
            const line = new fabric.Line([source.x, source.y, target.x, target.y], {
              stroke: value > 0.99 ? 'yellow' : 'gray',
              selectable: false,
              evented: false,
              objectCaching: false,
              strokeWidth: 0.1,
              opacity: value > 0.99 ? 1 : 0.2,
            });
            fabricCanvas.add(line);
          }
        }
      });

      // Отрисовка узлов
      nodes.forEach((node) => {
        if (node.x && node.y) {
          const radius = radiusScale(node['Spotify Streams']);
          const circle = new fabric.Circle({
            left: node.x,
            top: node.y,
            radius: radius * 0.4,
            stroke: 'rgb(255,255,255,0.5)',
            strokeWidth: radius * 0.03,
            hasBorders: true,
            borderColor: 'white',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          fabricCanvas.add(circle);

          const text = new fabric.Textbox(node.Track, {
            left: node.x,
            top: node.y,
            fontSize: radius * 0.15,
            originX: 'center',
            originY: 'center',
            selectable: false,
            backgroundColor: 'rgb(0,0,0,0.5)',
            fill: 'white',
            evented: false,
            objectCaching: false,
          });
          fabricCanvas.add(text);
          fabricCanvas.sendObjectToBack(circle);
        }
      });

      // Перемещение canvas при зажатой кнопке мыши
      let isDragging = false;
      let startX: number;
      let startY: number;

      fabricCanvas.on('mouse:down', function (opt) {
        isDragging = true;
        const pointer = fabricCanvas.getViewportPoint(opt.e);
        startX = pointer.x;
        startY = pointer.y;
        fabricCanvas.selection = false;
      });

      fabricCanvas.on('mouse:move', function (opt) {
        if (isDragging) {
          const pointer = fabricCanvas.getViewportPoint(opt.e);
          const dx = pointer.x - startX;
          const dy = pointer.y - startY;
          const panPoint = new fabric.Point(dx, dy);
          fabricCanvas.relativePan(panPoint);
          startX = pointer.x;
          startY = pointer.y;
        }
      });

      fabricCanvas.on('mouse:up', function (opt) {
        isDragging = false;
        fabricCanvas.selection = true;
      });

      // Обработчик событий колесика мыши для масштабирования
      fabricCanvas.on('mouse:wheel', function (opt) {
        const delta = opt.e.deltaY;
        const zoom = fabricCanvas.getZoom();
        const zoomFactor = 0.999 ** delta;
        const pointer = fabricCanvas.getViewportPoint(opt.e);
        fabricCanvas.zoomToPoint(pointer, zoom * zoomFactor);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      fabricCanvas.set({ backgroundColor: 'black' });
      fabricCanvas.renderAll();
    }

    // Очистка при размонтировании компонента
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [nodes, links]);

  return <canvas ref={canvasRef} />;
};
