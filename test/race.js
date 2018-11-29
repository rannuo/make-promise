const P = require('../index');

var p1 = new P(function(resolve, reject) { 
  setTimeout(resolve, 500, "one"); 
});
var p2 = new P(function(resolve, reject) { 
  setTimeout(resolve, 100, "two"); 
});

P.race([p1, p2]).then(function(value) {
console.log(value); // "two"
// 两个都完成，但 p2 更快
});

var p3 = new P(function(resolve, reject) { 
  setTimeout(resolve, 100, "three");
});
var p4 = new P(function(resolve, reject) { 
  setTimeout(reject, 500, "four"); 
});

P.race([p3, p4]).then(function(value) {
console.log(value); // "three"
// p3 更快，所以它完成了              
}, function(reason) {
// 未被调用
});

var p5 = new P(function(resolve, reject) { 
  setTimeout(resolve, 500, "five"); 
});
var p6 = new P(function(resolve, reject) { 
  setTimeout(reject, 100, "six");
});

P.race([p5, p6]).then(function(value) {
// 未被调用             
}, function(reason) {
console.log(reason); // "six"
// p6 更快，所以它失败了
});