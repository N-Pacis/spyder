import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function NetworkVisualization({ data, onNodeClick, centerNodeId }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      return; // Don't render if data is not available or empty
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const colorScale = d3.scaleOrdinal()
      .domain(['center', 'related'])
      .range(['#3a86ff', '#ff6b35']);

    const width = 1200;
    const height = 800;
    svg.attr('width', width).attr('height', height);

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(90));

    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(zoom);

    const g = svg.append('g');

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 23)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 13)
      .attr('markerHeight', 13)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', d => d.id === centerNodeId ? 20 : 15)
      .attr('fill', d => d.id === centerNodeId ? colorScale('center') : colorScale('related'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('transition', 'transform 0.2s ease')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => onNodeClick(d.id))

    const label = g.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text(d => (d.title || '').substring(0, 20))
      .style('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('dx', 20)
      .attr('dy', 4);

    node.append('title')
      .text(d => `${d.title || 'Untitled'}\nAuthors: ${(d.authors || []).join(', ') || 'Unknown'}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [data, onNodeClick, centerNodeId]);

  if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
    return <div className='text-black'>No data available to visualize</div>;
  }

  return <svg ref={svgRef}></svg>;
}

export default NetworkVisualization;
