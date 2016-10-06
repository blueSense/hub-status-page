const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

global.should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

beforeEach(function () {
  this.proxyquire = proxyquire;
  this.sandbox = sinon.sandbox.create();
  this.sinon = sinon;
});

afterEach(function () {
  this.sandbox.restore();
});
