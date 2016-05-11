module.exports = function() {
  var client = './src/';
  var bower = {
    json: require('./bower.json'),
    directory: './bower_components/',
    ignorePath: '../..'
  };
  var nodesModules = 'nodes_modules';
  var config = {
    alljs: [
      client + 'scripts/**/*.js'
    ],
    bower: bower,
    build: './dist/',
    client: client,
    css: [
      client + 'content/styles/**/*.css'
    ],
    js: [
      client + 'scripts/**/*.module.js',
      client + 'scripts/**/*.constant.js',
      client + 'scripts/**/*.js'
    ],
    jsOrder: [
      'scripts/**/*.module.js',
      'scripts/**/*.constant.js',
      'scripts/**/*.js',
    ]
  };

  return config;
};
