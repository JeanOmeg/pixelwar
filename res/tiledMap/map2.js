(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }
 if(typeof module === 'object' && module && module.exports) {
  module.exports = data;
 }})("map2",
{ "compressionlevel":-1,
 "height":17,
 "infinite":false,
 "layers":[
        {
         "data":[88, 89, 89, 89, 90, 88, 89, 89, 89, 89, 89, 89, 90, 41, 41, 88, 89, 89, 89, 89, 89, 89, 90, 88, 89, 89, 89, 90,
            98, 8, 19, 113, 100, 98, 28, 19, 19, 19, 19, 28, 100, 41, 41, 98, 28, 19, 19, 19, 19, 28, 100, 98, 111, 19, 8, 100,
            98, 8, 21, 123, 168, 170, 38, 31, 31, 31, 31, 38, 168, 169, 169, 170, 38, 31, 31, 31, 31, 38, 168, 170, 121, 21, 8, 100,
            98, 8, 21, 123, 100, 98, 8, 31, 31, 31, 31, 8, 100, 41, 41, 98, 8, 31, 31, 31, 31, 8, 100, 98, 121, 21, 8, 100,
            98, 19, 132, 133, 100, 98, 19, 39, 19, 19, 39, 19, 100, 41, 41, 98, 19, 39, 19, 19, 39, 19, 100, 98, 131, 132, 19, 100,
            190, 148, 49, 148, 179, 190, 148, 49, 148, 148, 49, 148, 179, 41, 41, 190, 148, 49, 148, 148, 49, 148, 179, 190, 148, 49, 148, 179,
            98, 111, 112, 8, 100, 98, 111, 112, 112, 112, 112, 113, 100, 41, 41, 98, 111, 112, 112, 112, 112, 113, 100, 98, 8, 112, 113, 100,
            98, 121, 21, 19, 100, 98, 121, 51, 52, 52, 53, 123, 100, 41, 41, 98, 121, 51, 52, 52, 53, 123, 100, 98, 19, 21, 123, 100,
            98, 121, 21, 21, 168, 170, 121, 61, 62, 62, 63, 123, 168, 169, 169, 170, 121, 61, 62, 62, 63, 123, 168, 170, 21, 21, 123, 100,
            98, 121, 21, 8, 100, 98, 121, 71, 72, 72, 73, 123, 100, 41, 41, 98, 121, 71, 72, 72, 73, 123, 100, 98, 8, 21, 123, 100,
            98, 131, 132, 19, 100, 98, 131, 132, 132, 132, 132, 133, 100, 41, 41, 98, 131, 132, 132, 132, 132, 133, 100, 98, 19, 132, 133, 100,
            190, 148, 49, 148, 179, 190, 148, 49, 148, 148, 49, 148, 179, 41, 41, 190, 148, 49, 148, 148, 49, 148, 179, 190, 148, 49, 148, 179,
            98, 8, 112, 113, 100, 98, 8, 39, 19, 19, 39, 8, 100, 41, 41, 98, 8, 39, 29, 30, 39, 8, 100, 98, 111, 112, 8, 100,
            98, 8, 21, 123, 100, 98, 28, 31, 31, 31, 31, 28, 100, 41, 41, 98, 28, 31, 31, 31, 31, 28, 100, 98, 121, 21, 8, 100,
            98, 8, 21, 123, 168, 170, 38, 31, 31, 31, 31, 38, 168, 169, 169, 170, 38, 31, 31, 31, 31, 38, 168, 170, 121, 21, 8, 100,
            98, 19, 19, 133, 100, 98, 19, 19, 19, 19, 19, 19, 100, 41, 41, 98, 19, 19, 19, 19, 19, 19, 100, 98, 131, 19, 19, 100,
            108, 109, 109, 109, 110, 108, 109, 109, 109, 109, 109, 109, 110, 41, 41, 108, 109, 109, 109, 109, 109, 109, 110, 108, 109, 109, 109, 110],
         "height":17,
         "id":1,
         "name":"Camada de Blocos 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":28,
         "x":0,
         "y":0
        }],
 "nextlayerid":2,
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"right-down",
 "tiledversion":"1.11.0",
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "source":"NewFullTile.tsx"
        }],
 "tilewidth":32,
 "type":"map",
 "version":"1.10",
 "width":28
});