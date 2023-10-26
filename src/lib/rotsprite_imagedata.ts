export default function rotsprite(sprite: ImageData, degree: number): ImageData {
  const scale = 8;
  let upscaled: ImageData = sprite;
  for (let i = 0; i < scale; i++) {
    upscaled = upscaleImageEPX(upscaled);
    console.log(i, upscaled.width, upscaled.height);
  }
  const rotated = _rotate(upscaled, degree);
  return downscaleNNTopLeft(rotated, scale, 2);
}

// TODO: Much slower than converting to a string array, very odd
function upscaleImageEPX(input: ImageData): ImageData {
  const output = new ImageData(input.width*2, input.height*2);
  const idx = (x: number, y: number) => {
    if (x < 0 || x >= input.width || y < 0 || y >= input.height) return -1;
    return (Math.round(y)*input.width+Math.round(x))*4;
  }
  for (let x = 0; x < input.width; x++) {
    for (let y = 0; y < input.height; y++) {
      const ip = idx(x, y);
      const ia = idx(x, y-1);
      const ib = idx(x+1, y);
      const ic = idx(x-1, y);
      const id = idx(x, y+1);
      // If at least three of the parents (A, B, C, D) are identical, P1 = P2 = P3 = P4 = P.
      // If any two parents are equal in color, make the child that color.
      // Otherwise, let the child be the color of 'P'.
      const p1 = ((y*2)*output.width+(x*2));
      const p2 = ((y*2)*output.width+(x*2+1));
      const p3 = ((y*2+1)*output.width+(x*2));
      const p4 = ((y*2+1)*output.width+(x*2+1));
      // p1 = a, c;
      // p2 = a, b;
      // p3 = c, d;
      // p4 = d, b;
    }
  }
  return output;
}

function _rotate(input: ImageData, deg: number): ImageData {
  const [rotW, rotH] = imageSizeAfterRotation([input.width, input.height], deg);

  const cos = Math.cos((deg * Math.PI) / 180),
    sin = Math.sin((deg * Math.PI) / 180);

  const rotated: ImageData = new ImageData(Math.round(rotW), Math.round(rotH));

  for (let s = 0; s < rotated.width; s++) {
    for (let t = 0; t < rotated.height; t++) {
      const x = Math.round(
        (s - rotW / 2) * cos + (t - rotH / 2) * sin + input.width / 2,
      )
      const y = Math.round(
        -(s - rotW / 2) * sin + (t - rotH / 2) * cos + input.height / 2,
      )
      if (x >= 0 && y >= 0 && x < input.width && y < input.height) {
        const ri = (t*rotated.width+s)*4;
        const ii = (y*input.width+x)*4;
        rotated.data[ri+0] = input.data[ii+0];
        rotated.data[ri+1] = input.data[ii+1];
        rotated.data[ri+2] = input.data[ii+2];
        rotated.data[ri+3] = input.data[ii+3];
      }
    }
  }
  return rotated
}

function downscaleNNTopLeft(
    input: ImageData,
    sourceScale: number,
    step = 2): ImageData {
  if (sourceScale === 1) return input;
  const downscaled = new ImageData(Math.ceil(input.width/step), Math.ceil(input.height/step));
  for (let i = 0; i < downscaled.width; i++) {
    for (let j = 0; j < downscaled.height; j++) {
      const di = (j*downscaled.width+i)*4;
      const ii = ((j*step)*input.width+(i*step))*4;
      downscaled.data[di+0] = input.data[ii+0];
      downscaled.data[di+1] = input.data[ii+1];
      downscaled.data[di+2] = input.data[ii+2];
      downscaled.data[di+3] = input.data[ii+3];
    }
  }
  return downscaled;
}

const imageSizeAfterRotation = (size: [number, number], degrees: number) => {
  degrees = degrees % 180
  if (degrees < 0) {
    degrees = 180 + degrees;
  }
  if (degrees >= 90) {
    size = [size[1], size[0]];
    degrees = degrees - 90;
  }
  if (degrees === 0) {
    return size;
  }
  const radians = (degrees * Math.PI) / 180;
  const width = size[0] * Math.cos(radians) + size[1] * Math.sin(radians);
  const height = size[0] * Math.sin(radians) + size[1] * Math.cos(radians);
  return [width, height];
}