const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const livereload = require('gulp-livereload');
const Cucumber = require('cucumber');
const fs = require('fs');
const execSync = require('child_process').execSync;

gulp.task('develop', function() {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js jade coffee',
    stdout: false
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('acceptance-test', function(done) {
  var argv = ['node', 'cucumber-js', '--require', 'features'];

  if (process.env['teamcity.version']) {
    argv = argv.concat(['--format', 'summary']);
  }

  Cucumber.Cli(argv).run(succeeded => done(succeeded ? undefined : new Error('Cucumber tests failed!')));
});

gulp.task('tag', () => {
  var version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

  execSync(`git tag -a -m "Publish version: ${version}" v${version}`);
  execSync(`git push --follow-tags`);
});

gulp.task('default', [
  'develop'
]);
