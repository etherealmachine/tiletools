// https://doc.mapeditor.org/en/stable/reference/json-map-format

interface TiledMap {
  name: string;
  backgroundcolor?: string // Hex-formatted color (#RRGGBB or #AARRGGBB)
  class?: string // The class of the map (since 1.9, optional)
  compressionlevel?: number // The compression level to use for tile layer data (defaults to -1, which means to use the algorithm default)
  height: number // Number of tile rows
  hexsidelength?: number // Length of the side of a hex tile in pixels (hexagonal maps only)
  infinite: boolean // Whether the map has infinite dimensions
  layers: Layer[] // Array of Layers
  nextlayerid: number // Auto-increments for each layer
  nextobjectid: number // Auto-increments for each placed object
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal'
  parallaxoriginx?: number // X coordinate of the parallax origin in pixels (since 1.8, default: 0)
  parallaxoriginy?: number // Y coordinate of the parallax origin in pixels (since 1.8, default: 0)
  properties: Property[] // Array of Properties
  renderorder?: string // right-down (the default), right-up, left-down or left-up (currently only supported for orthogonal maps)
  staggeraxis?: string // x or y (staggered / hexagonal maps only)
  staggerindex?: string // odd or even (staggered / hexagonal maps only)
  tiledversion: '1.10' // The Tiled version used to save the file
  tileheight: number // Map grid height
  tilesets: Tileset[] // Array of Tilesets
  tilewidth: number // Map grid width
  type: 'map' // map (since 1.0)
  version: '1.10' // The JSON format version (previously a number, saved as string since 1.6)
  width: number // Number of tile columns
}

interface Layer {
  chunks?: Chunk[] // Array of chunks (optional). tilelayer only.
  class?: string // The class of the layer (since 1.9, optional)
  compression?: string // zlib, gzip, zstd (since Tiled 1.3) or empty (default). tilelayer only.
  data?: number[] | string // Array of unsigned int (GIDs) or base64-encoded data. tilelayer only.
  draworder?: string // topdown (default) or index. objectgroup only.
  encoding?: 'csv' | 'base64' // csv (default) or base64. tilelayer only.
  height?: number // Row count. Same as map height for fixed-size maps. tilelayer only.
  id: number // Incremental ID - unique across all layers
  image?: string // Image used by this layer. imagelayer only.
  layers?: Layer[] // Array of layers. group only.
  locked?: boolean // Whether layer is locked in the editor (default: false). (since Tiled 1.8.2)
  name: string // Name assigned to this layer
  object?: TiledObject[] // Array of objects. objectgroup only.
  offsetx?: number // Horizontal layer offset in pixels (default: 0)
  offsety?: number // Vertical layer offset in pixels (default: 0)
  opacity: number // Value between 0 and 1
  parallaxx?: number // Horizontal parallax factor for this layer (default: 1). (since Tiled 1.5)
  parallaxy?: number // Vertical parallax factor for this layer (default: 1). (since Tiled 1.5)
  properties: Property[] // Array of Properties
  repeatx?: boolean // Whether the image drawn by this layer is repeated along the X axis. imagelayer only. (since Tiled 1.8)
  repeaty?: boolean // Whether the image drawn by this layer is repeated along the Y axis. imagelayer only. (since Tiled 1.8)
  startx?: number // X coordinate where layer content starts (for infinite maps)
  starty?: number // Y coordinate where layer content starts (for infinite maps)
  tintcolor?: string // Hex-formatted tint color (#RRGGBB or #AARRGGBB) that is multiplied with any graphics drawn by this layer or any child layers (optional).
  transparentcolor?: string // Hex-formatted color (#RRGGBB) (optional). imagelayer only.
  type: 'tilelayer' | 'objectgroup' | 'imagelayer' | 'group'
  visible: boolean // Whether layer is shown or hidden in editor
  width?: number // Column count. Same as map width for fixed-size maps. tilelayer only.
}

interface Property {
  name: string // Name of the property
  type?: 'string' | 'int' | 'float' | 'bool' | 'color' | 'file' | 'object' | 'class' // Type of the property (string (default), int, float, bool, color, file, object or class (since 0.16, with color and file added in 0.17, object added in 1.4 and class added in 1.8))
  propertytype?: string // Name of the custom property type, when applicable (since 1.8)
  value: any // Value of the property
}

/*
  Each tileset has a firstgid (first global ID) property which tells you the
  global ID of its first tile (the one with local tile ID 0). This allows you
  to map the global IDs back to the right tileset, and then calculate the local
  tile ID by subtracting the firstgid from the global tile ID. The first
  tileset always has a firstgid value of 1.
*/
interface Tileset {
  backgroundcolor?: string // Hex-formatted color (#RRGGBB or #AARRGGBB) (optional)
  class?: string // The class of the tileset (since 1.9, optional)
  columns: number // The number of tile columns in the tileset
  fillmode?: string // The fill mode to use when rendering tiles from this tileset (stretch (default) or preserve-aspect-fit) (since 1.9)
  firstgid: number // GID corresponding to the first tile in the set
  grid?: Grid // (optional)
  image: string // Image used for tiles in this set
  imageheight: number // Height of source image in pixels
  imagewidth: number // Width of source image in pixels
  margin: number // Buffer between image edge and first tile (pixels)
  name: string // Name given to this tileset
  objectalignment?: 'unspecified' | 'topleft' | 'top' | 'topright' | 'left' | 'center' | 'right' | 'bottomleft' | 'bottom' | 'bottomright' // Alignment to use for tile objects (unspecified (default), topleft, top, topright, left, center, right, bottomleft, bottom or bottomright) (since 1.4)
  properties: Property[] // Array of Properties
  source?: string // The external file that contains this tilesets data
  spacing: number // Spacing between adjacent tiles in image (pixels)
  terrains?: Terrain[] // Array of Terrains (optional)
  tilecount: number // The number of tiles in this tileset
  tiledversion: '1.10' // The Tiled version used to save the file
  tileheight: number // Maximum height of tiles in this set
  tileoffset?: TileOffset // (optional)
  tilerendersize?: string // The size to use when rendering tiles from this tileset on a tile layer (tile (default) or grid) (since 1.9)
  tiles?: Tile[] // Array of Tiles (optional)
  tilewidth: number // Maximum width of tiles in this set
  transformations?: Transformations // Allowed transformations (optional)
  transparentcolor?: string // Hex-formatted color (#RRGGBB) (optional)
  type: 'tileset' // tileset (for tileset files, since 1.0)
  version: '1.10' // The JSON format version (previously a number, saved as string since 1.6)
  wangsets?: WangSet[] // Array of Wang sets (since 1.1.5)
}

interface Grid {
  height: number // Cell height of tile grid
  orientation: 'orthogonal' | 'isometric'
  width: number // Cell width of tile grid
}

interface Terrain {
  name: string // Name of terrain
  properties: Property[] // Array of Properties
  tile: number // Local ID of tile representing terrain
}

interface TileOffset {
  x: number // Horizontal offset in pixels
  y: number // Vertical offset in pixels (positive is down)
}

interface Tile {
  animation?: Frame[] // Array of Frames
  id: number // Local ID of the tile
  image?: string // Image representing this tile (optional, used for image collection tilesets)
  imageheight?: number // Height of the tile image in pixels
  imagewidth?: number // Width of the tile image in pixels
  x?: number // The X position of the sub-rectangle representing this tile (default: 0)
  y?: number // The Y position of the sub-rectangle representing this tile (default: 0)
  width?: number // The width of the sub-rectangle representing this tile (defaults to the image width)
  height?: number // The height of the sub-rectangle representing this tile (defaults to the image height)
  objectgroup?: Layer // Layer with type objectgroup, when collision shapes are specified (optional)
  probability?: number // Percentage chance this tile is chosen when competing with others in the editor (optional)
  properties: Property[] // Array of Properties
  type?: string // The class of the tile (was saved as class in 1.9, optional)
}

interface Frame {
  duration: number // Frame duration in milliseconds
  tileid: number // Local tile ID representing this frame
}

interface Transformations {
  hflip: boolean // Tiles can be flipped horizontally
  vflip: boolean // Tiles can be flipped vertically
  rotate: boolean // Tiles can be rotated in 90-degree increments
  preferuntransformed: boolean // Whether untransformed tiles remain preferred, otherwise transformed tiles are used to produce more variations
}

interface WangSet {
  class?: string // The class of the Wang set (since 1.9, optional)
  colors: WangColor[] // Array of Wang colors (since 1.5)
  name: string // Name of the Wang set
  properties: Property[] // Array of Properties
  tile: number // Local ID of tile representing the Wang set
  type: 'corner' | 'edge' | 'mixed'
  wangtiles: WangTile[] // Array of Wang tiles
}

interface WangColor {
  class?: string // The class of the Wang color (since 1.9, optional)
  color: string // Hex-formatted color (#RRGGBB or #AARRGGBB)
  name: string // Name of the Wang color
  probability: number // Probability used when randomizing
  properties: Property[] // Array of Properties (since 1.5)
  tile: number // Local ID of tile representing the Wang color
}

interface WangTile {
  tileid: number // Local ID of tile
  wangid: number[] // Array of Wang color indexes (uchar[8])
}

interface Chunk {
  data: number[] | string // Array of unsigned int (GIDs) or base64-encoded data
  height: number // Height in tiles
  width: number // Width in tiles
  x: number // X coordinate in tiles
  y: number // Y coordinate in tiles
}

interface TiledObject {
  ellipse: boolean // Used to mark an object as an ellipse
  gid?: number // Global tile ID, only if object represents a tile
  height: number // Height in pixels.
  id: number // Incremental ID, unique across all objects
  name: string // String assigned to name field in editor
  point: boolean // Used to mark an object as a point
  polygon: Point[] // Array of Points, in case the object is a polygon
  polyline: Point[] // Array of Points, in case the object is a polyline
  properties: Property[] // Array of Properties
  rotation: number // Angle in degrees clockwise
  template: string // Reference to a template file, in case object is a template instance
  text?: Text // Only used for text objects
  type?: string // The class of the object (was saved as class in 1.9, optional)
  visible: boolean // Whether object is shown in editor.
  width: number // Width in pixels.
  x: number // X coordinate in pixels
  y: number // Y coordinate in pixels
}

interface Point {
  x: number // X coordinate in pixels
  y: number // Y coordinate in pixels
}