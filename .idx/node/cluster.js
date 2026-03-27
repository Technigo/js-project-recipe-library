'use strict';

const {
  ObjectPrototypeHasOwnProperty: ObjectHasOwn,
} = primordials;

const childOrPrimary = ObjectHasOwn(process.env, 'NODE_UNIQUE_ID') ? 'child' : 'primary';
module.exports = require(`internal/cluster/${childOrPrimary}`);