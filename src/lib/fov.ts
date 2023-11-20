import Point from "./Point";

// multipliers for transforming coordinates into other octants.
const MATRIX = [
  [1,  0,  0, -1, -1,  0,  0,  1],
  [0,  1, -1,  0,  0, -1,  1,  0],
  [0,  1,  1,  0,  0, -1, -1,  0],
  [1,  0,  0,  1, -1,  0,  0, -1]
];

// Calculate FOV with shadow-casting
export default class FOV {
  position: Point;
  radius: number;
  width: number;
  height: number;
  blocked: (pos: Point) => boolean;
  lit: Point[] = [];

  constructor(position: Point, radius: number, width: number, height: number, blocked: (pos: Point) => boolean) {
    this.position = position;
    this.radius = radius;
    this.width = width;
    this.height = height;
    this.blocked = blocked;
  }

	calculate() {
		for(let i = 0; i < 8; i++) {
			this.calculateOctant(1, 1.0, 0.0, this.radius, 
				MATRIX[0][i], MATRIX[1][i], MATRIX[2][i], MATRIX[3][i]);
		}
	}

	calculateOctant(
    row: number, start: number, end: number, radius: number,
    xx: number, xy: number, yx: number, yy: number) {
    
    // mark position as lit but unseen
		
		let new_start: number = 0;	
		
		if(start < end) return;
		
		var radius_squared = radius * radius;		

		for(let i = row; i < radius+1; i++) {
			let dx = -i-1;
			let dy = -i;
			
			let blocked = false;
			
			while(dx <= 0) {

				dx += 1;
				
				const curr = new Point(
          this.position.x + dx * xx + dy * xy,
          this.position.y + dx * yx + dy * yy,
        );
				
				if (curr.x < 0 || curr.y >= this.width || curr.x < 0 || curr.y >= this.height) continue;
				
        const l_slope = (dx-0.5)/(dy+0.5);
        const r_slope = (dx+0.5)/(dy-0.5);
        
        if (start < r_slope) {
          continue;
        } else if (end > l_slope) {
          break;
        } else {
          if (dx*dx + dy*dy < radius_squared) {
            this.lit.push(curr);
          } 

          if (blocked) {
            if (this.blocked(curr)) {
              new_start = r_slope;
              continue;
            } else {
              blocked = false;
              start = new_start;
            }
          } else {
            if (this.blocked(curr) && i < radius) {
              blocked = true;
              this.calculateOctant(i+1, start, l_slope, radius, xx, xy, yx, yy);
              new_start = r_slope;
            }
          }
        }
      }
			
			if (blocked) break;
		}
	}	
}
