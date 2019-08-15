import React, { Component } from "react";

var hg = require("react-hexgrid");

enum Direction {
    E, NE, NW, W, SW, SE
}

const allDirections: Direction[] = [Direction.E, Direction.NE, Direction.NW, Direction.W, Direction.SW, Direction.SE];

type HexProp = "q" | "r" | "s";

type HexCoords = {
    q: number, r: number, s:number
};

const zero: HexCoords = {q: 0 ,r: 0 ,s: 0};

const CircleCoords: Map<Direction, any[]> = new Map([
    [Direction.E, [Direction.E, Direction.E, Direction.SE]],
    [Direction.NE, [Direction.NE, Direction.NE, Direction.E]],
    [Direction.NW, [Direction.NW, Direction.NW, Direction.NE]],
    [Direction.W, [Direction.W, Direction.W, Direction.NW]],
    [Direction.SW, [Direction.SW, Direction.SW, Direction.W]],
    [Direction.SE, [Direction.SE, Direction.SE, Direction.SW]],
  ]);

class MyComp extends Component<{}> {

    circle(coords: HexCoords): any[] {
        const hexes: any[] = hg.GridGenerator.ring({q: coords.q, r: coords.r, s: coords.s}, 1);
        return hexes.concat(new hg.Hex(coords.q, coords.r, coords.s));
    }

    next(coords: HexCoords, direction: Direction): HexCoords {
        //switch (direction) {
            //case Direction.NE: return this.directionToCoords([Direction.NE, Direction.NE]);
        //}
        //return this.directionToCoords([direction, direction]);
        const circleDirection = CircleCoords.get(direction);
        if (circleDirection) {
            const hex: HexCoords = this.directionsToCoords(circleDirection);
            return hg.HexUtils.add(coords, hex);
        }
        throw new Error('dupa');
    }

    directionsToCoords(directions: Direction[]): HexCoords {
        var hex: HexCoords = new hg.Hex(0, 0, 0);
        for(let direction of directions) {
            hex = hg.HexUtils.neighbour(hex, direction);
        }
        return hex;
    }

    isCenter(hex: HexCoords): boolean {
        return !!this.centerDirections(hex).length;
    }

    centerDirections(hex: HexCoords): Direction[] {
        //const directions: HexCoords[] = hg.HexUtils.DIRECTIONS;
        const directions: HexCoords[] = allDirections.map(x => this.next(zero, x));
        const ret: Direction[] = directions
        .map((x, i) => { return {hex: x, i: i} })
        .filter((d) => this.isSame(hex, zero) || this.isSame(d.hex, hex) || this.isSame(hex, hg.HexUtils.multiply(d.hex, this.firstNotZeroMultiplier(hex, d.hex))))
        .map((d) => Direction[d.i] as any as Direction)
        return ret;
    }

    firstNotZeroMultiplier(hex: HexCoords, norm: HexCoords): number {
        var x = [hex.q / norm.q, hex.r / norm.r, hex.s / norm.s]
        .find(x => !Number.isNaN(x) && x !== 0);
        if (x) {
            return x;
        }
        throw new Error(`firstNotZeroMultiplier not found, l:${this.str(hex)} r:${this.str(norm)}`);
    }

    str(hex: HexCoords): string {
        return `(${hex.q}, ${hex.r}, ${hex.s})`;
    }

    isSame(l: HexCoords, r: HexCoords) {
        return l.q === r.q && l.r === r.r && l.s === r.s;
    }

    distanceToCenter(hex: HexCoords): Map<Direction, number> {
        const dirs: Map<Direction, any[]> = new Map([
            [Direction.NE, ["q", "s"]],
            [Direction.SE, ["r", "s"]],
            [Direction.W, ["q", "r"]]
        ])
        const res = new Map<Direction, number>();
        var tmp: HexCoords = hex;
        for(const [dir, props] of dirs.entries()) {
            const base: HexCoords = hg.HexUtils.direction(dir);
            const p:number = this.max(tmp, base, props);
            const shift: HexCoords = hg.HexUtils.multiply(base, p);
            tmp = hg.HexUtils.subtract(tmp, shift);
            res.set(dir as any as Direction, p);
        }
        return res;
    }

    distanceToCenterString(hex: HexCoords): string {
        var res: string = "";
        for (let [k, v] of this.distanceToCenter(hex)) {
            res += ` ${Direction[k]}(${v})`;
        }
        return res;
    }

    max(hex: HexCoords, base: HexCoords, props: HexProp[]) {
        const vals:number[] = props.map(p => hex[p] / base[p])
        .filter(x => Number.isFinite(x))
        if (!vals.length) {
            throw new Error("nie dziala");
        }
        return Math.max(...vals);
    }

    render() {
        const c: any[] = this.circle(zero);
        //TODO flatMap???!?!!?!
        const c1:any[] = allDirections.map(d => this.circle(this.next(zero, d))).reduce((a, b) => a.concat(b), []);
        const se1: HexCoords = this.next(zero, Direction.SE);
        const c2: any[] = [Direction.E, Direction.SE, Direction.SW].map(x => this.next(se1, x))
        .map(x => this.circle(x))
        .reduce((a, b) => a.concat(b), []);
        const hexes = c.concat(c1).concat(c2);
        return (
            <div>
                <hg.HexGrid width={1200} height={1200} viewBox="-70, -70, 250, 150" >
                <hg.Layout flat={false} spacing={1.0} origin={{ x: 0, y: 0 }}>
                {
                    hexes.map((hex: any, i: number) => 
                    <hg.Hexagon key={i} q={hex.q} r={hex.r} s={hex.s}
                    className={this.isCenter(hex) ? 'hexCenter' : null}>
                        {/* <hg.Text>{hex.q}, {hex.r}, {hex.s}</hg.Text> */}
                        <hg.Text>{this.distanceToCenterString(hex)}</hg.Text>
                    </hg.Hexagon>)
                }
                </hg.Layout>        
            </hg.HexGrid> 
            </div>
        );
    }
}

export default MyComp;