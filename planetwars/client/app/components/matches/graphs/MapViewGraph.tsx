import * as React from 'react';
import { Component } from 'react';
import * as d3 from 'd3';

import { Graph, Section, color, GraphProps } from './Shared';
import { PlanetList, Planet, GameState, StaticPlanet, Expedition } from './MatchLog';
import { data } from 'react-hyperscript-helpers';
import { path } from 'd3';

const styles = require('./GraphView.scss');

export class MapViewGraphSection extends Section<{}> {
  public render() {
    const log = this.props.log;
    const width = 800;
    const height = 400;

    const planets = log.gameStates[0].planets;
    const planetList: Planet[] = [];
    let minX: number = Number.MAX_SAFE_INTEGER;
    let maxX: number = Number.MIN_SAFE_INTEGER;
    let minY: number = Number.MAX_SAFE_INTEGER;
    let maxY: number = Number.MIN_SAFE_INTEGER;
    const xCoords: number[] = [];
    const yCoords: number[] = [];
    Object.keys(planets).forEach((name) => {
      planetList.push(planets[name]);
      const x = planets[name].x;
      const y = planets[name].y;
      if (x < minX) { minX = x; }
      if (x > maxX) { maxX = x; }
      if (y < minY) { minY = y; }
      if (y > maxY) { maxY = y; }
    });

    let expeditionList: Expedition[] = [];
    log.gameStates.forEach((state) => {
      const newList = expeditionList.concat(state.expeditions);
      expeditionList = newList;
    });

    const data: MapViewData = {
      planetMap: planets,
      planetList,
      expeditions: expeditionList,
      minX,
      maxX,
      minY,
      maxY,
    };

    return <MapViewGraph width={width} height={height} data={data} />;
  }
}

export interface MapViewData {
  planetMap: PlanetList;
  planetList: Planet[];
  expeditions: Expedition[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class MapViewGraph extends Graph<MapViewData> {
  protected createGraph(): void {
    const { width, height, data } = this.props;

    const radius = 10;

    const xScale = d3.scaleLinear()
                    .domain([data.minX, data.maxX])
                    .range([radius, width - radius]);
    const yScale = d3.scaleLinear()
                    .domain([data.minY, data.maxY])
                    .range([radius, height - radius]);

    const node = this.node;
    const svg = d3.select(node);
    svg.selectAll("*").remove();
    const g = svg.append("g");

    console.log("u dikke ma");
    console.log(data);

    data.expeditions.forEach((expedition) => {
      g.append("line")
        .attr("x1", xScale(expedition.origin.x))
        .attr("y1", yScale(expedition.origin.y))
        .attr("x2", xScale(expedition.destination.x))
        .attr("y2", yScale(expedition.destination.y))
        .attr("stroke-width", 2)
        .attr("stroke", "#FFF");
    });

    g.selectAll("circle")
        .data(data.planetList)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", radius)
        .attr("fill", (d) => color(d.name.toString()));
  }
}
