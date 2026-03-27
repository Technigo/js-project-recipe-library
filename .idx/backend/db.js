import mongoose from 'mongoose';
const { Schema } = mongoose;
const blogSchema = new Schema({
  title: String, // String is shorthand for {type: String}
  author: String,
  body: String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number
  }
});
// getting-started.js
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const kittySchema = new mongoose.Schema({
    name: String
  });
  const Kitten = mongoose.model('Kitten', kittySchema);
  const silence = new Kitten({ name: 'Silence' });
console.log(silence.name); // 'Silence'
// NOTE: methods must be added to the schema before compiling it with mongoose.model()
kittySchema.methods.speak = function speak() {
    const greeting = this.name
      ? 'Meow name is ' + this.name
      : 'I don\'t have a name';
    console.log(greeting);
  };
  
  const Kitten = mongoose.model('Kitten', kittySchema);
  const fluffy = new Kitten({ name: 'fluffy' });
fluffy.speak(); // "Meow name is fluffy"
await fluffy.save();
fluffy.speak();
const kittens = await Kitten.find();
console.log(kittens);
await Kitten.find({ name: /^fluff/ });

const Blog = mongoose.model('Blog', blogSchema);
// ready to go!
const schema = new Schema();

schema.path('_id'); // ObjectId { ... }
const Model = mongoose.model('Test', schema);

const doc = new Model();
doc._id instanceof mongoose.Types.ObjectId; // true
const schema = new Schema({
    _id: Number // <-- overwrite Mongoose's default `_id`
  });
  const Model = mongoose.model('Test', schema);
  
  const doc = new Model();
  await doc.save(); // Throws "document must have an _id before saving"
  
  doc._id = 1;
  await doc.save(); // works
  const nestedSchema = new Schema(
    { name: String },
    { _id: false } // <-- disable `_id`
  );
  const schema = new Schema({
    subdoc: nestedSchema,
    docArray: [nestedSchema]
  });
  const Test = mongoose.model('Test', schema);
  
  // Neither `subdoc` nor `docArray.0` will have an `_id`
  await Test.create({
    subdoc: { name: 'test 1' },
    docArray: [{ name: 'test 2' }]
  });
  // define a schema
const animalSchema = new Schema({ name: String, type: String },
    {
    // Assign a function to the "methods" object of our animalSchema through schema options.
    // By following this approach, there is no need to create a separate TS type to define the type of the instance functions.
      methods: {
        findSimilarTypes(cb) {
          return mongoose.model('Animal').find({ type: this.type }, cb);
        }
      }
    });
    const Animal = mongoose.model('Animal', animalSchema);
const dog = new Animal({ type: 'dog' });

dog.findSimilarTypes((err, dogs) => {
  console.log(dogs); // woof
});
// define a schema
const animalSchema = new Schema({ name: String, type: String },
    {
    // Assign a function to the "statics" object of our animalSchema through schema options.
    // By following this approach, there is no need to create a separate TS type to define the type of the statics functions.
      statics: {
        findByName(name) {
          return this.find({ name: new RegExp(name, 'i') });
        }
      }
    });
  
  // Or, Assign a function to the "statics" object of our animalSchema
  animalSchema.statics.findByName = function(name) {
    return this.find({ name: new RegExp(name, 'i') });
  };
  // Or, equivalently, you can call `animalSchema.static()`.
  animalSchema.static('findByBreed', function(breed) { return this.find({ breed }); });
  
  const Animal = mongoose.model('Animal', animalSchema);
  let animals = await Animal.findByName('fido');
  animals = animals.concat(await Animal.findByBreed('Poodle'));
  // define a schema
const animalSchema = new Schema({ name: String, type: String },
    {
    // Assign a function to the "query" object of our animalSchema through schema options.
    // By following this approach, there is no need to create a separate TS type to define the type of the query functions.
      query: {
        byName(name) {
          return this.where({ name: new RegExp(name, 'i') });
        }
      }
    });
  
  // Or, Assign a function to the "query" object of our animalSchema
  animalSchema.query.byName = function(name) {
    return this.where({ name: new RegExp(name, 'i') });
  };
  
  const Animal = mongoose.model('Animal', animalSchema);
  
  Animal.find().byName('fido').exec((err, animals) => {
    console.log(animals);
  });
  
  Animal.findOne().byName('fido').exec((err, animal) => {
    console.log(animal);
  });
  Indexes
  const animalSchema = new Schema({
    name: String,
    type: String,
    tags: { type: [String], index: true } // path level
  });
  
  animalSchema.index({ name: 1, type: -1 }); // schema level
  mongoose.connect('mongodb://user:pass@127.0.0.1:port/database', { autoIndex: false });
// or
mongoose.createConnection('mongodb://user:pass@127.0.0.1:port/database', { autoIndex: false });
// or
mongoose.set('autoIndex', false);
// or
animalSchema.set('autoIndex', false);
// or
new Schema({ /* ... */ }, { autoIndex: false });
// Will cause an error because mongodb has an _id index by default that
// is not sparse
animalSchema.index({ _id: 1 }, { sparse: true });
const Animal = mongoose.model('Animal', animalSchema);

Animal.on('index', error => {
  // "_id index cannot be sparse"
  console.log(error.message);
});
// define a schema
const personSchema = new Schema({
    name: {
      first: String,
      last: String
    }
  });
  
  // compile our model
  const Person = mongoose.model('Person', personSchema);
  
  // create a document
  const axl = new Person({
    name: { first: 'Axl', last: 'Rose' }
  });
  console.log(axl.name.first + ' ' + axl.name.last); // Axl Rose
  // That can be done either by adding it to schema options:
const personSchema = new Schema({
    name: {
      first: String,
      last: String
    }
  }, {
    virtuals: {
      fullName: {
        get() {
          return this.name.first + ' ' + this.name.last;
        }
      }
    }
  });
  
  // Or by using the virtual method as following:
  personSchema.virtual('fullName').get(function() {
    return this.name.first + ' ' + this.name.last;
  });
  console.log(axl.fullName); // Axl Rose
  // Convert `doc` to a POJO, with virtuals attached
doc.toObject({ virtuals: true });

// Equivalent:
doc.toJSON({ virtuals: true });
// Explicitly add virtuals to `JSON.stringify()` output
JSON.stringify(doc.toObject({ virtuals: true }));

// Or, to automatically attach virtuals to `JSON.stringify()` output:
const personSchema = new Schema({
  name: {
    first: String,
    last: String
  }
}, {
  toJSON: { virtuals: true } // <-- include virtuals in `JSON.stringify()`
});
// Again that can be done either by adding it to schema options:
const personSchema = new Schema({
    name: {
      first: String,
      last: String
    }
  }, {
    virtuals: {
      fullName: {
        get() {
          return this.name.first + ' ' + this.name.last;
        },
        set(v) {
          this.name.first = v.substr(0, v.indexOf(' '));
          this.name.last = v.substr(v.indexOf(' ') + 1);
        }
      }
    }
  });
  
  // Or by using the virtual method as following:
  personSchema.virtual('fullName').
    get(function() {
      return this.name.first + ' ' + this.name.last;
    }).
    set(function(v) {
      this.name.first = v.substr(0, v.indexOf(' '));
      this.name.last = v.substr(v.indexOf(' ') + 1);
    });
  
  axl.fullName = 'William Rose'; // Now `axl.name.first` is "William"
  const personSchema = new Schema({
    n: {
      type: String,
      // Now accessing `name` will get you the value of `n`, and setting `name` will set the value of `n`
      alias: 'name'
    }
  });
  
  // Setting `name` will propagate to `n`
  const person = new Person({ name: 'Val' });
  console.log(person); // { n: 'Val' }
  console.log(person.toObject({ virtuals: true })); // { n: 'Val', name: 'Val' }
  console.log(person.name); // "Val"
  
  person.name = 'Not Val';
  console.log(person); // { n: 'Not Val' }
  const childSchema = new Schema({
    n: {
      type: String,
      alias: 'name'
    }
  }, { _id: false });
  
  const parentSchema = new Schema({
    // If in a child schema, alias doesn't need to include the full nested path
    c: childSchema,
    name: {
      f: {
        type: String,
        // Alias needs to include the full nested path if declared inline
        alias: 'name.first'
      }
    }
  });
  new Schema({ /* ... */ }, options);

// or

const schema = new Schema({ /* ... */ });
schema.set(option, value);
const schema = new Schema({ /* ... */ }, { autoIndex: false });
const Clock = mongoose.model('Clock', schema);
Clock.ensureIndexes(callback);
const schema = new Schema({ name: String }, {
    autoCreate: false,
    capped: { size: 1024 }
  });
  const Test = mongoose.model('Test', schema);
  
  // No-op if collection already exists, even if the collection is not capped.
  // This means that `capped` won't be applied if the 'tests' collection already exists.
  await Test.createCollection();
  const schema = new Schema({ /* ... */ }, { bufferCommands: false });
  mongoose.set('bufferCommands', true);
// Schema option below overrides the above, if the schema option is set.
const schema = new Schema({ /* ... */ }, { bufferCommands: false });
// If an operation is buffered for more than 1 second, throw an error.
const schema = new Schema({ /* ... */ }, { bufferTimeoutMS: 1000 });
new Schema({ /* ... */ }, { capped: 1024 });
new Schema({ /* ... */ }, { capped: { size: 1024, max: 1000, autoIndexId: true } });
const dataSchema = new Schema({ /* ... */ }, { collection: 'data' });
const baseSchema = new Schema({}, { discriminatorKey: 'type' });
const BaseModel = mongoose.model('Test', baseSchema);

const personSchema = new Schema({ name: String });
const PersonModel = BaseModel.discriminator('Person', personSchema);

const doc = new PersonModel({ name: 'James T. Kirk' });
// Without `discriminatorKey`, Mongoose would store the discriminator
// key in `__t` instead of `type`
doc.type; // 'Person'
const childSchema1 = Schema({
    name: { type: String, index: true }
  });
  
  const childSchema2 = Schema({
    name: { type: String, index: true }
  }, { excludeIndexes: true });
  
  // Mongoose will create an index on `child1.name`, but **not** `child2.name`, because `excludeIndexes`
  // is true on `childSchema2`
  const User = new Schema({
    name: { type: String, index: true },
    child1: childSchema1,
    child2: childSchema2
  });
  // default behavior
const schema = new Schema({ name: String });
const Page = mongoose.model('Page', schema);
const p = new Page({ name: 'mongodb.org' });
console.log(p.id); // '50341373e894ad16347efe01'

// disabled id
const schema = new Schema({ name: String }, { id: false });
const Page = mongoose.model('Page', schema);
const p = new Page({ name: 'mongodb.org' });
console.log(p.id); // undefined
// default behavior
const schema = new Schema({ name: String });
const Page = mongoose.model('Page', schema);
const p = new Page({ name: 'mongodb.org' });
console.log(p); // { _id: '50341373e894ad16347efe01', name: 'mongodb.org' }

// disabled _id
const childSchema = new Schema({ name: String }, { _id: false });
const parentSchema = new Schema({ children: [childSchema] });

const Model = mongoose.model('Model', parentSchema);

Model.create({ children: [{ name: 'Luke' }] }, (error, doc) => {
  // doc.children[0]._id will be undefined
});
const schema = new Schema({ name: String, inventory: {} });
const Character = mongoose.model('Character', schema);

// will store `inventory` field if it is not empty
const frodo = new Character({ name: 'Frodo', inventory: { ringOfPower: 1 } });
await frodo.save();
let doc = await Character.findOne({ name: 'Frodo' }).lean();
doc.inventory; // { ringOfPower: 1 }

// will not store `inventory` field if it is empty
const sam = new Character({ name: 'Sam', inventory: {} });
await sam.save();
doc = await Character.findOne({ name: 'Sam' }).lean();
doc.inventory; // undefined
const schema = new Schema({ name: String, inventory: {} }, { minimize: false });
const Character = mongoose.model('Character', schema);

// will store `inventory` if empty
const sam = new Character({ name: 'Sam', inventory: {} });
await sam.save();
doc = await Character.findOne({ name: 'Sam' }).lean();
doc.inventory; // {}
const sam = new Character({ name: 'Sam', inventory: {} });
sam.$isEmpty('inventory'); // true

sam.inventory.barrowBlade = 1;
sam.$isEmpty('inventory'); // false
const schema = new Schema({ /* ... */ }, { read: 'primary' });            // also aliased as 'p'
const schema = new Schema({ /* ... */ }, { read: 'primaryPreferred' });   // aliased as 'pp'
const schema = new Schema({ /* ... */ }, { read: 'secondary' });          // aliased as 's'
const schema = new Schema({ /* ... */ }, { read: 'secondaryPreferred' }); // aliased as 'sp'
const schema = new Schema({ /* ... */ }, { read: 'nearest' });            // aliased as 'n'
// pings the replset members periodically to track network latency
const options = { replset: { strategy: 'ping' } };
mongoose.connect(uri, options);

const schema = new Schema({ /* ... */ }, { read: ['nearest', { disk: 'ssd' }] });
mongoose.model('JellyBean', schema);
const schema = new Schema({ name: String }, {
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 1000
    }
  });
  new Schema({ /* ... */ }, { shardKey: { tag: 1, name: 1 } });
  const thingSchema = new Schema({ /* ... */ })
const Thing = mongoose.model('Thing', thingSchema);
const thing = new Thing({ iAmNotInTheSchema: true });
thing.save(); // iAmNotInTheSchema is not saved to the db

// set to false..
const thingSchema = new Schema({ /* ... */ }, { strict: false });
const thing = new Thing({ iAmNotInTheSchema: true });
thing.save(); // iAmNotInTheSchema is now saved to the db!!
const thingSchema = new Schema({ /* ... */ });
const Thing = mongoose.model('Thing', thingSchema);
const thing = new Thing;
thing.set('iAmNotInTheSchema', true);
thing.save(); // iAmNotInTheSchema is not saved to the db
const Thing = mongoose.model('Thing');
const thing = new Thing(doc, true);  // enables strict mode
const thing = new Thing(doc, false); // disables strict mode
const thingSchema = new Schema({ /* ... */ });
const Thing = mongoose.model('Thing', thingSchema);
const thing = new Thing;
thing.iAmNotInTheSchema = true;
thing.save(); // iAmNotInTheSchema is never saved to the db
const mySchema = new Schema({ field: Number }, { strict: true });
const MyModel = mongoose.model('Test', mySchema);
// Mongoose will filter out `notInSchema: 1` because `strict: true`, meaning this query will return
// _all_ documents in the 'tests' collection
MyModel.find({ notInSchema: 1 });
// Mongoose will strip out `notInSchema` from the update if `strict` is
// not `false`
MyModel.updateMany({}, { $set: { notInSchema: 1 } });
const mySchema = new Schema({ field: Number }, {
    strict: true,
    strictQuery: false // Turn off strict mode for query filters
  });
  const MyModel = mongoose.model('Test', mySchema);
  // Mongoose will not strip out `notInSchema: 1` because `strictQuery` is false
  MyModel.find({ notInSchema: 1 });
  // Do this instead:
const docs = await MyModel.find({ name: req.query.name, age: req.query.age }).setOptions({ sanitizeFilter: true });
// Set `strictQuery` to `true` to omit unknown fields in queries.
mongoose.set('strictQuery', true);
const schema = new Schema({ name: String });
schema.path('name').get(function(v) {
  return v + ' is my name';
});
schema.set('toJSON', { getters: true, virtuals: false });
const M = mongoose.model('Person', schema);
const m = new M({ name: 'Max Headroom' });
console.log(m.toObject()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom' }
console.log(m.toJSON()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom is my name' }
// since we know toJSON is called whenever a js object is stringified:
console.log(JSON.stringify(m)); // { "_id": "504e0cd7dd992d9be2f20b6f", "name": "Max Headroom is my name" }
const schema = new Schema({ name: String });
schema.path('name').get(function(v) {
  return v + ' is my name';
});
schema.set('toObject', { getters: true });
const M = mongoose.model('Person', schema);
const m = new M({ name: 'Max Headroom' });
console.log(m); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom is my name' }
// Mongoose interprets this as 'loc is a String'
const schema = new Schema({ loc: { type: String, coordinates: [Number] } });
const schema = new Schema({
    // Mongoose interprets this as 'loc is an object with 2 keys, type and coordinates'
    loc: { type: String, coordinates: [Number] },
    // Mongoose interprets this as 'name is a String'
    name: { $type: String }
  }, { typeKey: '$type' }); // A '$type' key means this object is a type declaration
  const schema = new Schema({ name: String });
schema.set('validateBeforeSave', false);
schema.path('name').validate(function(value) {
  return value != null;
});
const M = mongoose.model('Person', schema);
const m = new M({ name: null });
m.validate(function(err) {
  console.log(err); // Will tell you that null is not allowed.
});
m.save(); // Succeeds despite being invalid
const schema = new Schema({ name: 'string' });
const Thing = mongoose.model('Thing', schema);
const thing = new Thing({ name: 'mongoose v3' });
await thing.save(); // { __v: 0, name: 'mongoose v3' }

// customized versionKey
new Schema({ /* ... */ }, { versionKey: '_somethingElse' })
const Thing = mongoose.model('Thing', schema);
const thing = new Thing({ name: 'mongoose v3' });
thing.save(); // { _somethingElse: 0, name: 'mongoose v3' }
// 2 copies of the same document
const doc1 = await Model.findOne({ _id });
const doc2 = await Model.findOne({ _id });

// Delete first 3 comments from `doc1`
doc1.comments.splice(0, 3);
await doc1.save();

// The below `save()` will throw a VersionError, because you're trying to
// modify the comment at index 1, and the above `splice()` removed that
// comment.
doc2.set('comments.1.body', 'new comment');
await doc2.save();
new Schema({ /* ... */ }, { versionKey: false });
const Thing = mongoose.model('Thing', schema);
const thing = new Thing({ name: 'no versioning please' });
thing.save(); // { name: 'no versioning please' }
schema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.__v != null) {
      delete update.__v;
    }
    const keys = ['$set', '$setOnInsert'];
    for (const key of keys) {
      if (update[key] != null && update[key].__v != null) {
        delete update[key].__v;
        if (Object.keys(update[key]).length === 0) {
          delete update[key];
        }
      }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
  });
  async function markApproved(id) {
    const house = await House.findOne({ _id });
    if (house.photos.length < 2) {
      throw new Error('House must have at least two photos!');
    }
  
    house.status = 'APPROVED';
    await house.save();
  }
  const house = await House.findOne({ _id });
if (house.photos.length < 2) {
  throw new Error('House must have at least two photos!');
}

const house2 = await House.findOne({ _id });
house2.photos = [];
await house2.save();

// Marks the house as 'APPROVED' even though it has 0 photos!
house.status = 'APPROVED';
await house.save();
const House = mongoose.model('House', Schema({
    status: String,
    photos: [String]
  }, { optimisticConcurrency: true }));
  
  const house = await House.findOne({ _id });
  if (house.photos.length < 2) {
    throw new Error('House must have at least two photos!');
  }
  
  const house2 = await House.findOne({ _id });
  house2.photos = [];
  await house2.save();
  
  // Throws 'VersionError: No matching document found for id "..." version 0'
  house.status = 'APPROVED';
  await house.save();
  const schema = new Schema({
    name: String
  }, { collation: { locale: 'en_US', strength: 1 } });
  
  const MyModel = db.model('MyModel', schema);
  
  MyModel.create([{ name: 'val' }, { name: 'Val' }]).
    then(() => {
      return MyModel.find({ name: 'val' });
    }).
    then((docs) => {
      // `docs` will contain both docs, because `strength: 1` means
      // MongoDB will ignore case when matching.
    });
    const schema = Schema({ name: String, timestamp: Date, metadata: Object }, {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'hours'
        },
        autoCreate: false,
        expireAfterSeconds: 86400
      });
      
      // `Test` collection will be a timeseries collection
      const Test = db.model('Test', schema);
      new Schema({ /* ... */ }, { skipVersioning: { dontVersionMe: true } });
thing.dontVersionMe.push('hey');
thing.save(); // version is not incremented
const thingSchema = new Schema({ /* ... */ }, { timestamps: { createdAt: 'created_at' } });
const Thing = mongoose.model('Thing', thingSchema);
const thing = new Thing();
await thing.save(); // `created_at` & `updatedAt` will be included

// With updates, Mongoose will add `updatedAt` to `$set`
await Thing.updateOne({}, { $set: { name: 'Test' } });

// If you set upsert: true, Mongoose will add `created_at` to `$setOnInsert` as well
await Thing.findOneAndUpdate({}, { $set: { name: 'Test2' } });

// Mongoose also adds timestamps to bulkWrite() operations
// See https://mongoosejs.com/docs/api/model.html#model_Model-bulkWrite
await Thing.bulkWrite([
  {
    insertOne: {
      document: {
        name: 'Jean-Luc Picard',
        ship: 'USS Stargazer'
      // Mongoose will add `created_at` and `updatedAt`
      }
    }
  },
  {
    updateOne: {
      filter: { name: 'Jean-Luc Picard' },
      update: {
        $set: {
          ship: 'USS Enterprise'
        // Mongoose will add `updatedAt`
        }
      }
    }
  }
]);
const schema = Schema({
    createdAt: Number,
    updatedAt: Number,
    name: String
  }, {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
  });
  // Add a `meta` property to all schemas
mongoose.plugin(function myPlugin(schema) {
    schema.add({ meta: {} });
  });
  const schema1 = new Schema({
    name: String
  }, { pluginTags: ['useMetaPlugin'] });
  
  const schema2 = new Schema({
    name: String
  });
  / Add a `meta` property to all schemas
mongoose.plugin(function myPlugin(schema) {
  schema.add({ meta: {} });
}, { tags: ['useMetaPlugin'] });
const bookSchema = new Schema({
    title: 'String',
    author: { type: 'ObjectId', ref: 'Person' }
  });
  const Book = mongoose.model('Book', bookSchema);
  
  // By default, Mongoose will add `author` to the below `select()`.
  await Book.find().select('title').populate('author');
  
  // In other words, the below query is equivalent to the above
  await Book.find().select('title author').populate('author');
  const bookSchema = new Schema({
    title: 'String',
    author: { type: 'ObjectId', ref: 'Person' }
  }, { selectPopulatedPaths: false });
  const Book = mongoose.model('Book', bookSchema);
  
  // Because `selectPopulatedPaths` is false, the below doc will **not**
  // contain an `author` property.
  const doc = await Book.findOne().select('title').populate('author');
  const childSchema = new Schema({ name: { type: String, required: true } });
const parentSchema = new Schema({ child: childSchema });

const Parent = mongoose.model('Parent', parentSchema);

// Will contain an error for both 'child.name' _and_ 'child'
new Parent({ child: {} }).validateSync().errors;
const childSchema = new Schema({
    name: { type: String, required: true }
  }, { storeSubdocValidationError: false }); // <-- set on the child schema
  const parentSchema = new Schema({ child: childSchema });
  
  const Parent = mongoose.model('Parent', parentSchema);
  
  // Will only contain an error for 'child.name'
  new Parent({ child: {} }).validateSync().errors;
  const schema = new Schema({ name: String }, {
    autoCreate: false,
    collectionOptions: {
      capped: true,
      max: 1000
    }
  });
  const Test = mongoose.model('Test', schema);
  
  // Equivalent to `createCollection({ capped: true, max: 1000 })`
  await Test.createCollection();
  const schema = new Schema({ name: String }, { autoSearchIndex: true });
schema.searchIndex({
  name: 'my-index',
  definition: { mappings: { dynamic: true } }
});
// Will automatically attempt to create the `my-index` search index.
const Test = mongoose.model('Test', schema);
const eventSchema = new mongoose.Schema(
    { name: String },
    {
      readConcern: { level: 'available' } // <-- set default readConcern for all queries
    }
  );
  class MyClass {
    myMethod() { return 42; }
    static myStatic() { return 42; }
    get myVirtual() { return 42; }
  }
  
  const schema = new mongoose.Schema();
  schema.loadClass(MyClass);
  
  console.log(schema.methods); // { myMethod: [Function: myMethod] }
  console.log(schema.statics); // { myStatic: [Function: myStatic] }
  console.log(schema.virtuals); // { myVirtual: VirtualType { ... } }
  const schema = new Schema({ name: String });
schema.path('name') instanceof mongoose.SchemaType; // true
schema.path('name') instanceof mongoose.Schema.Types.String; // true
schema.path('name').instance; // 'String'
const schema = new Schema({
    name: String,
    binary: Buffer,
    living: Boolean,
    updated: { type: Date, default: Date.now },
    age: { type: Number, min: 18, max: 65 },
    mixed: Schema.Types.Mixed,
    _someId: Schema.Types.ObjectId,
    decimal: Schema.Types.Decimal128,
    double: Schema.Types.Double,
    int32bit: Schema.Types.Int32,
    array: [],
    ofString: [String],
    ofNumber: [Number],
    ofDates: [Date],
    ofBuffer: [Buffer],
    ofBoolean: [Boolean],
    ofMixed: [Schema.Types.Mixed],
    ofObjectId: [Schema.Types.ObjectId],
    ofArrays: [[]],
    ofArrayOfNumbers: [[Number]],
    nested: {
      stuff: { type: String, lowercase: true, trim: true }
    },
    map: Map,
    mapOfString: {
      type: Map,
      of: String
    }
  });
  
  // example use
  
  const Thing = mongoose.model('Thing', schema);
  
  const m = new Thing;
  m.name = 'Statue of Liberty';
  m.age = 125;
  m.updated = new Date;
  m.binary = Buffer.alloc(0);
  m.living = false;
  m.mixed = { any: { thing: 'i want' } };
  m.markModified('mixed');
  m._someId = new mongoose.Types.ObjectId;
  m.array.push(1);
  m.ofString.push('strings!');
  m.ofNumber.unshift(1, 2, 3, 4);
  m.ofDates.addToSet(new Date);
  m.ofBuffer.pop();
  m.ofMixed = [1, [], 'three', { four: 5 }];
  m.nested.stuff = 'good';
  m.map = new Map([['key', 'value']]);
  m.save(callback);
  // 3 string SchemaTypes: 'name', 'nested.firstName', 'nested.lastName'
const schema = new Schema({
    name: { type: String },
    nested: {
      firstName: { type: String },
      lastName: { type: String }
    }
  });
  const holdingSchema = new Schema({
    // You might expect `asset` to be an object that has 2 properties,
    // but unfortunately `type` is special in Mongoose so mongoose
    // interprets this schema to mean that `asset` is a string
    asset: {
      type: String,
      ticker: String
    }
  });
  const holdingSchema = new Schema({
    asset: {
      // Workaround to make sure Mongoose knows `asset` is an object
      // and `asset.type` is a string, rather than thinking `asset`
      // is a string.
      type: { type: String },
      ticker: String
    }
  });
  const schema1 = new Schema({
    test: String // `test` is a path of type String
  });
  
  const schema2 = new Schema({
    // The `test` object contains the "SchemaType options"
    test: { type: String } // `test` is a path of type string
  });
  const schema2 = new Schema({
    test: {
      type: String,
      lowercase: true // Always convert `test` to lowercase
    }
  });
  const numberSchema = new Schema({
    integerOnly: {
      type: Number,
      get: v => Math.round(v),
      set: v => Math.round(v),
      alias: 'i'
    }
  });
  
  const Number = mongoose.model('Number', numberSchema);
  
  const doc = new Number();
  doc.integerOnly = 2.001;
  doc.integerOnly; // 2
  doc.i; // 2
  doc.i = 3.001;
  doc.integerOnly; // 3
  doc.i; // 3
  const schema2 = new Schema({
    test: {
      type: String,
      index: true,
      unique: true // Unique index. If you specify `unique: true`
      // specifying `index: true` is optional if you do `unique: true`
    }
  });
  const schema1 = new Schema({ name: String }); // name will be cast to string
const schema2 = new Schema({ name: 'String' }); // Equivalent

const Person = mongoose.model('Person', schema2);
new Person({ name: 42 }).name; // "42" as a string
new Person({ name: { toString: () => 42 } }).name; // "42" as a string

// "undefined", will get a cast error if you `save()` this document
new Person({ name: { foo: 42 } }).name;
const schema1 = new Schema({ age: Number }); // age will be cast to a Number
const schema2 = new Schema({ age: 'Number' }); // Equivalent

const Car = mongoose.model('Car', schema2);
new Car({ age: '15' }).age; // 15 as a Number
new Car({ age: true }).age; // 1 as a Number
new Car({ age: false }).age; // 0 as a Number
new Car({ age: { valueOf: () => 83 } }).age; // 83 as a Number
const Assignment = mongoose.model('Assignment', { dueDate: Date });
const doc = await Assignment.findOne();
doc.dueDate.setMonth(3);
await doc.save(); // THIS DOES NOT SAVE YOUR CHANGE

doc.markModified('dueDate');
await doc.save(); // works
const schema1 = new Schema({ binData: Buffer }); // binData will be cast to a Buffer
const schema2 = new Schema({ binData: 'Buffer' }); // Equivalent

const Data = mongoose.model('Data', schema2);
const file1 = new Data({ binData: 'test'}); // {"type":"Buffer","data":[116,101,115,116]}
const file2 = new Data({ binData: 72987 }); // {"type":"Buffer","data":[27]}
const file4 = new Data({ binData: { type: 'Buffer', data: [1, 2, 3]}}); // {"type":"Buffer","data":[1,2,3]}
const Any = new Schema({ any: {} });
const Any = new Schema({ any: Object });
const Any = new Schema({ any: Schema.Types.Mixed });
const Any = new Schema({ any: mongoose.Mixed });
person.anything = { x: [3, 4, { y: 'changed' }] };
person.markModified('anything');
person.save(); // Mongoose will save changes to `anything`.
const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({ driver: mongoose.ObjectId });
const Car = mongoose.model('Car', carSchema);

const car = new Car();
car.driver = new mongoose.Types.ObjectId();

typeof car.driver; // 'object'
car.driver instanceof mongoose.Types.ObjectId; // true

car.driver.toString(); // Something like "5e1a0651741b255ddda996c4"
const M = mongoose.model('Test', new Schema({ b: Boolean }));
console.log(new M({ b: 'nay' }).b); // undefined

// Set { false, 'false', 0, '0', 'no' }
console.log(mongoose.Schema.Types.Boolean.convertToFalse);

mongoose.Schema.Types.Boolean.convertToFalse.add('nay');
console.log(new M({ b: 'nay' }).b); // false
const ToySchema = new Schema({ name: String });
const ToyBoxSchema = new Schema({
  toys: [ToySchema],
  buffers: [Buffer],
  strings: [String],
  numbers: [Number]
  // ... etc
});
const ToyBox = mongoose.model('ToyBox', ToyBoxSchema);
console.log((new ToyBox()).toys); // []
const ToyBoxSchema = new Schema({
    toys: {
      type: [ToySchema],
      default: undefined
    }
  });
  const Empty1 = new Schema({ any: [] });
const Empty2 = new Schema({ any: Array });
const Empty3 = new Schema({ any: [Schema.Types.Mixed] });
const Empty4 = new Schema({ any: [{}] });
const userSchema = new Schema({
    // `socialMediaHandles` is a map whose values are strings. A map's
    // keys are always strings. You specify the type of values using `of`.
    socialMediaHandles: {
      type: Map,
      of: String
    }
  });
  
  const User = mongoose.model('User', userSchema);
  // Map { 'github' => 'vkarpov15', 'twitter' => '@code_barbarian' }
  console.log(new User({
    socialMediaHandles: {
      github: 'vkarpov15',
      twitter: '@code_barbarian'
    }
  }).socialMediaHandles);
  const user = new User({
    socialMediaHandles: {}
  });
  
  // Good
  user.socialMediaHandles.set('github', 'vkarpov15');
  // Works too
  user.set('socialMediaHandles.twitter', '@code_barbarian');
  // Bad, the `myspace` property will **not** get saved
  user.socialMediaHandles.myspace = 'fail';
  
  // 'vkarpov15'
  console.log(user.socialMediaHandles.get('github'));
  // '@code_barbarian'
  console.log(user.get('socialMediaHandles.twitter'));
  // undefined
  user.socialMediaHandles.github;
  
  // Will only save the 'github' and 'twitter' properties
  user.save();
  const userSchema = new Schema({
    socialMediaHandles: {
      type: Map,
      of: new Schema({
        handle: String,
        oauth: {
          type: ObjectId,
          ref: 'OAuth'
        }
      })
    }
  });
  const User = mongoose.model('User', userSchema);
  const user = await User.findOne().populate('socialMediaHandles.$*.oauth');
  const authorSchema = new Schema({
    _id: Schema.Types.UUID, // Can also do `_id: 'UUID'`
    name: String
  });
  
  const Author = mongoose.model('Author', authorSchema);
  
  const bookSchema = new Schema({
    authorId: { type: Schema.Types.UUID, ref: 'Author' }
  });
  const Book = mongoose.model('Book', bookSchema);
  
  const author = new Author({ name: 'Martin Fowler' });
  console.log(typeof author._id); // 'string'
  console.log(author.toObject()._id instanceof mongoose.mongo.BSON.Binary); // true
  
  const book = new Book({ authorId: '09190f70-3d30-11e5-8814-0f4df9a59c41' });
  const { randomUUID } = require('crypto');

const schema = new mongoose.Schema({
  docId: {
    type: 'UUID',
    default: () => randomUUID()
  }
});
const questionSchema = new Schema({
    answer: BigInt
  });
  const Question = mongoose.model('Question', questionSchema);
  
  const question = new Question({ answer: 42n });
  typeof question.answer; // 'bigint'
  const temperatureSchema = new Schema({
    celsius: Double
  });
  const Temperature = mongoose.model('Temperature', temperatureSchema);
  
  const temperature = new Temperature({ celsius: 1339 });
  temperature.celsius instanceof bson.Double; // true
  new Temperature({ celsius: '1.2e12' }).celsius; // 15 as a Double
new Temperature({ celsius: true }).celsius; // 1 as a Double
new Temperature({ celsius: false }).celsius; // 0 as a Double
new Temperature({ celsius: { valueOf: () => 83.0033 } }).celsius; // 83 as a Double
new Temperature({ celsius: '' }).celsius; // null
const studentSchema = new Schema({
    id: Int32
  });
  const Student = mongoose.model('Student', studentSchema);
  
  const student = new Student({ id: 1339 });
  typeof student.id; // 'number'
  new Student({ id: '15' }).id; // 15 as a Int32
new Student({ id: true }).id; // 1 as a Int32
new Student({ id: false }).id; // 0 as a Int32
new Student({ id: { valueOf: () => 83 } }).id; // 83 as a Int32
new Student({ id: '' }).id; // null as a Int32
const root = 'https://s3.amazonaws.com/mybucket';

const userSchema = new Schema({
  name: String,
  picture: {
    type: String,
    get: v => `${root}${v}`
  }
});

const User = mongoose.model('User', userSchema);

const doc = new User({ name: 'Val', picture: '/123.png' });
doc.picture; // 'https://s3.amazonaws.com/mybucket/123.png'
doc.toObject({ getters: false }).picture; // '/123.png'
const schema = new Schema({
    arr: [{ url: String }]
  });
  
  const root = 'https://s3.amazonaws.com/mybucket';
  
  // Bad, don't do this!
  schema.path('arr').get(v => {
    return v.map(el => Object.assign(el, { url: root + el.url }));
  });
  
  // Later
  doc.arr.push({ key: String });
  doc.arr[0]; // 'undefined' because every `doc.arr` creates a new array!
  const schema = new Schema({
    arr: [{ url: String }]
  });
  
  const root = 'https://s3.amazonaws.com/mybucket';
  
  // Good, do this instead of declaring a getter on `arr`
  schema.path('arr.0.url').get(v => `${root}${v}`);
  const subSchema = new mongoose.Schema({
    // some schema definition here
  });
  
  const schema = new mongoose.Schema({
    data: {
      type: subSchema,
      default: {}
    }
  });
  const sampleSchema = new Schema({ name: { type: String, required: true } });
console.log(sampleSchema.path('name'));
// Output looks like:
/**
 * SchemaString {
 *   enumValues: [],
  *   regExp: null,
  *   path: 'name',
  *   instance: 'String',
  *   validators: ...
  */
mongoose.connect('mongodb://127.0.0.1:27017/myapp');
const MyModel = mongoose.model('Test', new Schema({ name: String }));
// Works
await MyModel.findOne();
const MyModel = mongoose.model('Test', new Schema({ name: String }));
const promise = MyModel.findOne();

setTimeout(function() {
  mongoose.connect('mongodb://127.0.0.1:27017/myapp');
}, 60000);

// Will just hang until mongoose successfully connects
await promise;
mongoose.set('bufferCommands', false);
const schema = new Schema({
    name: String
  }, {
    capped: { size: 1024 },
    bufferCommands: false,
    autoCreate: false // disable `autoCreate` since `bufferCommands` is false
  });
  
  const Model = mongoose.model('Test', schema);
  // Explicitly create the collection before using it
  // so the collection is capped.
  await Model.createCollection();
  mongoose.connect('mongodb://127.0.0.1:27017/test').
  catch(error => handleError(error));

// Or:
try {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
} catch (error) {
  handleError(error);
}
mongoose.connection.on('error', err => {
    logError(err);
  });
  mongoose.connect(uri, options);
  // Throws an error "getaddrinfo ENOTFOUND doesnt.exist" after 30 seconds
await mongoose.connect('mongodb://doesnt.exist:27017/test');
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

// Prints "Failed 0", "Failed 1", "Failed 2" and then throws an
// error. Exits after approximately 15 seconds.
for (let i = 0; i < 3; ++i) {
    try {
      await mongoose.connect('mongodb://doesnt.exist:27017/test', {
        serverSelectionTimeoutMS
      });
      break;
    } catch (err) {
      console.log('Failed', i);
      if (i >= 2) {
        throw err;
      }
    }
  }
  mongoose.connect(uri, options, function(error) {
    // Check error in initial connection. There is no 2nd param to the callback.
  });
  
  // Or using promises
  mongoose.connect(uri, options).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */ },
    err => { /** handle initial connection error */ }
  );
  mongoose.connect('mongodb://127.0.0.1:27017/test?socketTimeoutMS=1000&bufferCommands=false&authSource=otherdb');
// The above is equivalent to:
mongoose.connect('mongodb://127.0.0.1:27017/test', {
  socketTimeoutMS: 1000
  // Note that mongoose will **not** pull `bufferCommands` from the query string
});
mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('open', () => console.log('open'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('reconnected', () => console.log('reconnected'));
mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
mongoose.connection.on('close', () => console.log('close'));

mongoose.connect('mongodb://127.0.0.1:27017/mongoose_test');
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/mongoose_test');

conn.on('connected', () => console.log('connected'));
conn.on('open', () => console.log('open'));
conn.on('disconnected', () => console.log('disconnected'));
conn.on('reconnected', () => console.log('reconnected'));
conn.on('disconnecting', () => console.log('disconnecting'));
conn.on('close', () => console.log('close'));
mongoose.connect('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]' [, options]);
mongoose.connect('mongodb://user:pw@host1.com:27017,host2.com:27017,host3.com:27017/testdb');
mongoose.connect('mongodb://host1:port1/?replicaSet=rsName');
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
  });
  const mongoose = require('mongoose');

const uri = 'mongodb+srv://username:badpw@cluster0-OMITTED.mongodb.net/' +
  'test?retryWrites=true&w=majority';
// Prints "MongoServerError: bad auth Authentication failed."
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err.reason));
// Can get this error even if your connection string doesn't include
// `localhost` if `rs.conf()` reports that one replica set member has
// `localhost` as its host name.
MongooseServerSelectionError: connect ECONNREFUSED localhost:27017
if (err.name === 'MongooseServerSelectionError') {
    // Contains a Map describing the state of your replica set. For example:
    // Map(1) {
    //   'localhost:27017' => ServerDescription {
    //     address: 'localhost:27017',
    //     type: 'Unknown',
    //     ...
    //   }
    // }
    console.log(err.r
        // Connect to 2 mongos servers
mongoose.connect('mongodb://mongosA:27501,mongosB:27501', cb);
const conn = mongoose.createConnection('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]', options);
const UserModel = conn.model('User', userSchema);
// `asPromise()` returns a promise that resolves to the connection
// once the connection succeeds, or rejects if connection failed.
const conn = await mongoose.createConnection(connectionString).asPromise();
const userSchema = new Schema({ name: String, email: String });

// The alternative to the export model pattern is the export schema pattern.
module.exports = userSchema;

// Because if you export a model as shown below, the model will be scoped
// to Mongoose's default connection.
// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

module.exports = function connectionFactory() {
  const conn = mongoose.createConnection(process.env.MONGODB_URI);

  conn.model('User', require('../schemas/user'));
  conn.model('PageView', require('../schemas/pageView'));

  return conn;
};
// connections/index.js
const mongoose = require('mongoose');

const conn = mongoose.createConnection(process.env.MONGODB_URI);
conn.model('User', require('../schemas/user'));

module.exports = conn;
// With object options
mongoose.createConnection(uri, { maxPoolSize: 10 });

// With connection string options
const uri = 'mongodb://127.0.0.1:27017/test?maxPoolSize=10';
mongoose.createConnection(uri);
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/main');
mongoose.set('debug', true);

mongoose.model('User', mongoose.Schema({ name: String }));

const app = express();

app.get('/users/:tenantId', function(req, res) {
  const db = mongoose.connection.useDb(`tenant_${req.params.tenantId}`, {
    // `useCache` tells Mongoose to cache connections by database name, so
    // `mongoose.connection.useDb('foo', { useCache: true })` returns the
    // same reference each time.
    useCache: true
  });
  // Need to register models every time a new connection is created
  if (!db.models['User']) {
    db.model('User', mongoose.Schema({ name: String }));
  }
  console.log('Find users from', db.name);
  db.model('User').find().
    then(users => res.json({ users })).
    catch(err => res.status(500).json({ message: err.message }));
});

app.listen(3000);
const express = require('express');
const mongoose = require('mongoose');

const tenantIdToConnection = {};

const app = express();

app.get('/users/:tenantId', function(req, res) {
  let initialConnection = Promise.resolve();
  const { tenantId } = req.params;
  if (!tenantIdToConnection[tenantId]) {
    tenantIdToConnection[tenantId] = mongoose.createConnection(`mongodb://127.0.0.1:27017/tenant_${tenantId}`);
    tenantIdToConnection[tenantId].model('User', mongoose.Schema({ name: String }));
    initialConnection = tenantIdToConnection[tenantId].asPromise();
  }
  const db = tenantIdToConnection[tenantId];
  initialConnection.
    then(() => db.model('User').find()).
    then(users => res.json({ users })).
    catch(err => res.status(500).json({ message: err.message }));
});

app.listen(3000);
const schema = new mongoose.Schema({ name: String, size: String });
const Tank = mongoose.model('Tank', schema);
const Tank = mongoose.model('Tank', yourSchema);

const small = new Tank({ size: 'small' });
await small.save();

// or

await Tank.create({ size: 'small' });

// or, for inserting large batches of documents
await Tank.insertMany([{ size: 'small' }]);
await mongoose.connect('mongodb://127.0.0.1/gettingstarted');
const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
const Tank = connection.model('Tank', yourSchema);
await Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec();
await Tank.deleteOne({ size: 'large' });
// Updated at most one doc, `res.nModified` contains the number
// of docs that MongoDB updated
await Tank.updateOne({ size: 'large' }, { name: 'T-90' });
async function run() {
    // Create a new mongoose model
    const personSchema = new mongoose.Schema({
      name: String
    });
    const Person = mongoose.model('Person', personSchema);
  
    // Create a change stream. The 'change' event gets emitted when there's a
    // change in the database
    Person.watch().
      on('change', data => console.log(new Date(), data));
  
    // Insert a doc, will trigger the change stream handler above
    console.log(new Date(), 'Inserting doc');
    await Person.create({ name: 'Axl Rose' });
  }
  // Make sure to disable `autoCreate` and `autoIndex` for Views,
// because you want to create the collection manually.
const userSchema = new Schema({
    name: String,
    email: String,
    roles: [String]
  }, { autoCreate: false, autoIndex: false });
  const User = mongoose.model('User', userSchema);
  
  const RedactedUser = mongoose.model('RedactedUser', userSchema);
  
  // First, create the User model's underlying collection...
  await User.createCollection();
  // Then create the `RedactedUser` model's underlying collection
  // as a View.
  await RedactedUser.createCollection({
    viewOn: 'users', // Set `viewOn` to the collection name, **not** model name.
    pipeline: [
      {
        $set: {
          name: { $concat: [{ $substr: ['$name', 0, 3] }, '...'] },
          email: { $concat: [{ $substr: ['$email', 0, 3] }, '...'] }
        }
      }
    ]
  });
  
  await User.create([
    { name: 'John Smith', email: 'john.smith@gmail.com', roles: ['user'] },
    { name: 'Bill James', email: 'bill@acme.co', roles: ['user', 'admin'] }
  ]);
  
  // [{ _id: ..., name: 'Bil...', email: 'bil...', roles: ['user', 'admin'] }]
  console.log(await RedactedUser.find({ roles: 'admin' }));
  const MyModel = mongoose.model('Test', new Schema({ name: String }));
const doc = new MyModel();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
const doc = await MyModel.findOne();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
doc.name = 'foo';

// Mongoose sends an `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })`
// to MongoDB.
await doc.save();
doc.save().then(savedDoc => {
    savedDoc === doc; // true
  });
  const doc = await MyModel.findOne();

// Delete the document so Mongoose won't be able to save changes
await MyModel.deleteOne({ _id: doc._id });

doc.name = 'foo';
await doc.save(); // Throws DocumentNotFoundError
const schema = new Schema({
    nested: {
      subdoc: new Schema({
        name: String
      })
    }
  });
  const TestModel = mongoose.model('Test', schema);
  
  const doc = new TestModel();
  doc.set('nested.subdoc.name', 'John Smith');
  doc.nested.subdoc.name; // 'John Smith'
  const doc2 = new TestModel();

doc2.get('nested.subdoc.name'); // undefined
doc2.nested?.subdoc?.name; // undefined

doc2.set('nested.subdoc.name', 'Will Smith');
doc2.get('nested.subdoc.name'); // 'Will Smith'
// The following works fine
const doc3 = new TestModel();
doc3.nested.subdoc ??= {};
doc3.nested.subdoc.name = 'John Smythe';

// The following does **NOT** work.
// Do not use the following pattern with Mongoose documents.
const doc4 = new TestModel();
(doc4.nested.subdoc ??= {}).name = 'Charlie Smith';
doc.nested.subdoc; // Empty object
doc.nested.subdoc.name; // undefined.
// Update all documents in the `mymodels` collection
await MyModel.updateMany({}, { $set: { name: 'foo' } });
const schema = new Schema({ name: String, age: { type: Number, min: 0 } });
const Person = mongoose.model('Person', schema);

const p = new Person({ name: 'foo', age: 'bar' });
// Cast to Number failed for value "bar" at path "age"
await p.validate();

const p2 = new Person({ name: 'foo', age: -1 });
// Path `age` (-1) is less than minimum allowed value (0).
await p2.validate();
// Cast to number failed for value "bar" at path "age"
await Person.updateOne({}, { age: 'bar' });

// Path `age` (-1) is less than minimum allowed value (0).
await Person.updateOne({}, { age: -1 }, { runValidators: true });
const doc = await Person.findOne({ _id });

// Sets `name` and unsets all other properties
doc.overwrite({ name: 'Jean-Luc Picard' });
await doc.save();
// Sets `name` and unsets all other properties
await Person.replaceOne({ _id }, { name: 'Jean-Luc Picard' });
const childSchema = new Schema({ name: 'string' });

const parentSchema = new Schema({
  // Array of subdocuments
  children: [childSchema],
  // Single nested subdocuments
  child: childSchema
});
const childSchema = new Schema({ name: 'string' });
const Child = mongoose.model('Child', childSchema);

const parentSchema = new Schema({
  child: {
    type: mongoose.ObjectId,
    ref: 'Child'
  }
});
const Parent = mongoose.model('Parent', parentSchema);

const doc = await Parent.findOne().populate('child');
// NOT a subdocument. `doc.child` is a separate top-level document.
doc.child;
const Parent = mongoose.model('Parent', parentSchema);
const parent = new Parent({ children: [{ name: 'Matt' }, { name: 'Sarah' }] });
parent.children[0].name = 'Matthew';

// `parent.children[0].save()` is a no-op, it triggers middleware but
// does **not** actually save the subdocument. You need to save the parent
// doc.
await parent.save();
childSchema.pre('save', function(next) {
    if ('invalid' == this.name) {
      return next(new Error('#sadpanda'));
    }
    next();
  });
  
  const parent = new Parent({ children: [{ name: 'invalid' }] });
  try {
    await parent.save();
  } catch (err) {
    err.message; // '#sadpanda'
  }
  // Below code will print out 1-4 in order
const childSchema = new mongoose.Schema({ name: 'string' });

childSchema.pre('validate', function(next) {
  console.log('2');
  next();
});

childSchema.pre('save', function(next) {
  console.log('3');
  next();
});

const parentSchema = new mongoose.Schema({
  child: childSchema
});

parentSchema.pre('validate', function(next) {
  console.log('1');
  next();
});

parentSchema.pre('save', function(next) {
  console.log('4');
  next();
});
// Subdocument
const subdocumentSchema = new mongoose.Schema({
    child: new mongoose.Schema({ name: String, age: Number })
  });
  const Subdoc = mongoose.model('Subdoc', subdocumentSchema);
  
  // Nested path
  const nestedSchema = new mongoose.Schema({
    child: { name: String, age: Number }
  });
  const Nested = mongoose.model('Nested', nestedSchema);
  const doc1 = new Subdoc({});
doc1.child === undefined; // true
doc1.child.name = 'test'; // Throws TypeError: cannot read property...

const doc2 = new Nested({});
doc2.child === undefined; // false
console.log(doc2.child); // Prints 'MongooseDocument { undefined }'
doc2.child.name = 'test'; // Works
const subdocumentSchema = new mongoose.Schema({
    child: new mongoose.Schema({
      name: String,
      age: {
        type: Number,
        default: 0
      }
    })
  });
  const Subdoc = mongoose.model('Subdoc', subdocumentSchema);
  
  // Note that the `age` default has no effect, because `child`
  // is `undefined`.
  const doc = new Subdoc();
  doc.child; // undefined
  doc.child = {};
// Mongoose applies the `age` default:
doc.child.age; // 0
const childSchema = new mongoose.Schema({
    name: String,
    age: {
      type: Number,
      default: 0
    }
  });
  const subdocumentSchema = new mongoose.Schema({
    child: {
      type: childSchema,
      default: () => ({})
    }
  });
  const Subdoc = mongoose.model('Subdoc', subdocumentSchema);
  
  // Note that Mongoose sets `age` to its default value 0, because
  // `child` defaults to an empty object and Mongoose applies
  // defaults to that empty object.
  const doc = new Subdoc();
  doc.child; // { age: 0 }
  const doc = parent.children.id(_id);
  const Parent = mongoose.model('Parent');
const parent = new Parent();

// create a comment
parent.children.push({ name: 'Liesl' });
const subdoc = parent.children[0];
console.log(subdoc); // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
subdoc.isNew; // true

await parent.save();
console.log('Success!');
const newdoc = parent.children.create({ name: 'Aaron' });
// Equivalent to `parent.children.pull(_id)`
parent.children.id(_id).deleteOne();
// Equivalent to `parent.child = null`
parent.child.deleteOne();

await parent.save();
console.log('the subdocs were removed');
const schema = new Schema({
    docArr: [{ name: String }],
    singleNested: new Schema({ name: String })
  });
  const Model = mongoose.model('Test', schema);
  
  const doc = new Model({
    docArr: [{ name: 'foo' }],
    singleNested: { name: 'bar' }
  });
  
  doc.singleNested.parent() === doc; // true
  doc.docArr[0].parent() === doc; // true
  const schema = new Schema({
    level1: new Schema({
      level2: new Schema({
        test: String
      })
    })
  });
  const Model = mongoose.model('Test', schema);
  
  const doc = new Model({ level1: { level2: 'test' } });
  
  doc.level1.level2.parent() === doc; // false
  doc.level1.level2.parent() === doc.level1; // true
  doc.level1.level2.ownerDocument() === doc; // true
  const parentSchema = new Schema({
    children: [{ name: 'string' }]
  });
  // Equivalent
  const parentSchema = new Schema({
    children: [new Schema({ name: 'string' })]
  });

  const Person = mongoose.model('Person', yourSchema);

// find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
const person = await Person.findOne({ 'name.last': 'Ghost' }, 'name occupation');
// Prints "Space Ghost is a talk show host".
console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation);
// find each person with a last name matching 'Ghost'
const query = Person.findOne({ 'name.last': 'Ghost' });

// selecting the `name` and `occupation` fields
query.select('name occupation');

// execute the query at a later time
const person = await query.exec();
// Prints "Space Ghost is a talk show host."
console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation);
// With a JSON doc
await Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec();

// Using query builder
await Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec();
  const q = MyModel.updateMany({}, { isDeleted: true });

await q.then(() => console.log('Update 2'));
// Throws "Query was already executed: Test.updateMany({}, { isDeleted: true })"
await q.then(() => console.log('Update 3'));
const cursor = Person.find({ occupation: /host/ }).cursor();

for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  console.log(doc); // Prints documents one at a time
  for await (const doc of Person.find()) {
    console.log(doc); // Prints documents one at a time
  }
  // MongoDB won't automatically close this cursor after 10 minutes.
const cursor = Person.find().cursor().addCursorFlag('noCursorTimeout', true);
const docs = await Person.aggregate([{ $match: { 'name.last': 'Ghost' } }]);
const docs = await Person.aggregate([{ $match: { 'name.last': 'Ghost' } }]);

docs[0] instanceof mongoose.Document; // false
const doc = await Person.findOne();

const idString = doc._id.toString();

// Finds the `Person`, because Mongoose casts `idString` to an ObjectId
const queryRes = await Person.findOne({ _id: idString });

// Does **not** find the `Person`, because Mongoose doesn't cast aggregation
// pipelines.
const aggRes = await Person.aggregate([{ $match: { _id: idString } }]);
const personSchema = new mongoose.Schema({
  age: Number
});

const Person = mongoose.model('Person', personSchema);
for (let i = 0; i < 10; i++) {
  await Person.create({ age: i });
}

await Person.find().sort({ age: -1 }); // returns age starting from 10 as the first entry
await Person.find().sort({ age: 1 }); // returns age starting from 0 as the first entry
const personSchema = new mongoose.Schema({
  age: Number,
  name: String,
  weight: Number
});

const Person = mongoose.model('Person', personSchema);
const iterations = 5;
for (let i = 0; i < iterations; i++) {
  await Person.create({
    age: Math.abs(2 - i),
    name: 'Test' + i,
    weight: Math.floor(Math.random() * 100) + 1
  });
}

await Person.find().sort({ age: 1, weight: -1 }); // returns age starting from 0, but while keeping that order will then sort by weight.
[
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb37'),
    age: 0,
    name: 'Test2',
    weight: 67,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb35'),
    age: 1,
    name: 'Test1',
    weight: 99,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb39'),
    age: 1,
    name: 'Test3',
    weight: 73,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb33'),
    age: 2,
    name: 'Test0',
    weight: 65,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb3b'),
    age: 2,
    name: 'Test4',
    weight: 62,
    __v: 0
  }
];
const schema = new Schema({
  name: {
    type: String,
    required: true
  }
});
const Cat = db.model('Cat', schema);

// This cat has no name :(
const cat = new Cat();

let error;
try {
  await cat.save();
} catch (err) {
  error = err;
}

assert.equal(error.errors['name'].message,
  'Path `name` is required.');

error = cat.validateSync();
assert.equal(error.errors['name'].message,
  'Path `name` is required.');
  const breakfastSchema = new Schema({
    eggs: {
      type: Number,
      min: [6, 'Too few eggs'],
      max: 12
    },
    bacon: {
      type: Number,
      required: [true, 'Why no bacon?']
    },
    drink: {
      type: String,
      enum: ['Coffee', 'Tea'],
      required: function() {
        return this.bacon > 3;
      }
    }
  });
  const Breakfast = db.model('Breakfast', breakfastSchema);
  
  const badBreakfast = new Breakfast({
    eggs: 2,
    bacon: 0,
    drink: 'Milk'
  });
  let error = badBreakfast.validateSync();
  assert.equal(error.errors['eggs'].message,
    'Too few eggs');
  assert.ok(!error.errors['bacon']);
  assert.equal(error.errors['drink'].message,
    '`Milk` is not a valid enum value for path `drink`.');
  
  badBreakfast.bacon = 5;
  badBreakfast.drink = null;
  
  error = badBreakfast.validateSync();
  assert.equal(error.errors['drink'].message, 'Path `drink` is required.');
  
  badBreakfast.bacon = null;
  error = badBreakfast.validateSync();
  assert.equal(error.errors['bacon'].message, 'Why no bacon?');
  const breakfastSchema = new Schema({
    eggs: {
      type: Number,
      min: [6, 'Must be at least 6, got {VALUE}'],
      max: 12
    },
    drink: {
      type: String,
      enum: {
        values: ['Coffee', 'Tea'],
        message: '{VALUE} is not supported'
      }
    }
  });
  const Breakfast = db.model('Breakfast', breakfastSchema);
  
  const badBreakfast = new Breakfast({
    eggs: 2,
    drink: 'Milk'
  });
  const error = badBreakfast.validateSync();
  assert.equal(error.errors['eggs'].message,
    'Must be at least 6, got 2');
  assert.equal(error.errors['drink'].message, 'Milk is not supported');
  const uniqueUsernameSchema = new Schema({
    username: {
      type: String,
      unique: true
    }
  });
  const U1 = db.model('U1', uniqueUsernameSchema);
  const U2 = db.model('U2', uniqueUsernameSchema);
  
  const dup = [{ username: 'Val' }, { username: 'Val' }];
  // Race condition! This may save successfully, depending on whether
  // MongoDB built the index before writing the 2 docs.
  U1.create(dup).
    then(() => {
    }).
    catch(err => {
    });
  
  // You need to wait for Mongoose to finish building the `unique`
  // index before writing. You only need to build indexes once for
  // a given collection, so you normally don't need to do this
  // in production. But, if you drop the database between tests,
  // you will need to use `init()` to wait for the index build to finish.
  U2.init().
    then(() => U2.create(dup)).
    catch(error => {
      // `U2.create()` will error, but will *not* be a mongoose validation error, it will be
      // a duplicate key error.
      // See: https://masteringjs.io/tutorials/mongoose/e11000-duplicate-key
      assert.ok(error);
      assert.ok(!error.errors);
      assert.ok(error.message.indexOf('duplicate key error') !== -1);
    });
    const userSchema = new Schema({
      phone: {
        type: String,
        validate: {
          validator: function(v) {
            return /\d{3}-\d{3}-\d{4}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
      }
    });
    
    const User = db.model('user', userSchema);
    const user = new User();
    let error;
    
    user.phone = '555.0123';
    error = user.validateSync();
    assert.equal(error.errors['phone'].message,
      '555.0123 is not a valid phone number!');
    
    user.phone = '';
    error = user.validateSync();
    assert.equal(error.errors['phone'].message,
      'User phone number required');
    
    user.phone = '201-555-0123';
    // Validation succeeds! Phone number is defined
    // and fits `DDD-DDD-DDDD`
    error = user.validateSync();
    assert.equal(error, null);
    const userSchema = new Schema({
      name: {
        type: String,
        // You can also make a validator async by returning a promise.
        validate: () => Promise.reject(new Error('Oops!'))
      },
      email: {
        type: String,
        // There are two ways for an promise-based async validator to fail:
        // 1) If the promise rejects, Mongoose assumes the validator failed with the given error.
        // 2) If the promise resolves to `false`, Mongoose assumes the validator failed and creates an error with the given `message`.
        validate: {
          validator: () => Promise.resolve(false),
          message: 'Email validation failed'
        }
      }
    });
    
    const User = db.model('User', userSchema);
    const user = new User();
    
    user.email = 'test@test.co';
    user.name = 'test';
    
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error);
    assert.equal(error.errors['name'].message, 'Oops!');
    assert.equal(error.errors['email'].message, 'Email validation failed');
    const toySchema = new Schema({
      color: String,
      name: String
    });
    
    const validator = function(value) {
      return /red|white|gold/i.test(value);
    };
    toySchema.path('color').validate(validator,
      'Color `{VALUE}` not valid', 'Invalid color');
    toySchema.path('name').validate(function(v) {
      if (v !== 'Turbo Man') {
        throw new Error('Need to get a Turbo Man for Christmas');
      }
      return true;
    }, 'Name `{VALUE}` is not valid');
    
    const Toy = db.model('Toy', toySchema);
    
    const toy = new Toy({ color: 'Green', name: 'Power Ranger' });
    
    let error;
    try {
      await toy.save();
    } catch (err) {
      error = err;
    }
    
    // `error` is a ValidationError object
    // `error.errors.color` is a ValidatorError object
    assert.equal(error.errors.color.message, 'Color `Green` not valid');
    assert.equal(error.errors.color.kind, 'Invalid color');
    assert.equal(error.errors.color.path, 'color');
    assert.equal(error.errors.color.value, 'Green');
    
    // If your validator throws an exception, mongoose will use the error
    // message. If your validator returns `false`,
    // mongoose will use the 'Name `Power Ranger` is not valid' message.
    assert.equal(error.errors.name.message,
      'Need to get a Turbo Man for Christmas');
    assert.equal(error.errors.name.value, 'Power Ranger');
    // If your validator threw an error, the `reason` property will contain
    // the original error thrown, including the original stack trace.
    assert.equal(error.errors.name.reason.message,
      'Need to get a Turbo Man for Christmas');
    
    assert.equal(error.name, 'ValidationError');
    const vehicleSchema = new mongoose.Schema({
      numWheels: { type: Number, max: 18 }
    });
    const Vehicle = db.model('Vehicle', vehicleSchema);
    
    const doc = new Vehicle({ numWheels: 'not a number' });
    const err = doc.validateSync();
    
    err.errors['numWheels'].name; // 'CastError'
    // 'Cast to Number failed for value "not a number" at path "numWheels"'
    err.errors['numWheels'].message;
    const vehicleSchema = new mongoose.Schema({
      numWheels: { type: Number, max: 18 }
    });
    const Vehicle = db.model('Vehicle', vehicleSchema);
    
    const doc = new Vehicle({ numWheels: 'not a number' });
    const err = doc.validateSync();
    
    err.errors['numWheels'].name; // 'CastError'
    // 'Cast to Number failed for value "not a number" at path "numWheels"'
    err.errors['numWheels'].message;
    const vehicleSchema = new mongoose.Schema({
      numWheels: {
        type: Number,
        cast: [null, (value, path, model, kind) => `"${value}" is not a number`]
      }
    });
    const Vehicle = db.model('Vehicle', vehicleSchema);
    
    const doc = new Vehicle({ numWheels: 'pie' });
    const err = doc.validateSync();
    
    err.errors['numWheels'].name; // 'CastError'
    // "pie" is not a number
    err.errors['numWheels'].message;
    // Add a custom validator to all strings
mongoose.Schema.Types.String.set('validate', v => v == null || v > 0);

const userSchema = new Schema({
  name: String,
  email: String
});
const User = db.model('User', userSchema);

const user = new User({ name: '', email: '' });

const err = await user.validate().then(() => null, err => err);
err.errors['name']; // ValidatorError
err.errors['email']; // ValidatorError
let personSchema = new Schema({
  name: {
    first: String,
    last: String
  }
});

assert.throws(function() {
  // This throws an error, because 'name' isn't a full fledged path
  personSchema.path('name').required(true);
}, /Cannot.*'required'/);

// To make a nested object required, use a single nested schema
const nameSchema = new Schema({
  first: String,
  last: String
});

personSchema = new Schema({
  name: {
    type: nameSchema,
    required: true
  }
});

const Person = db.model('Person', personSchema);

const person = new Person();
const error = person.validateSync();
assert.ok(error.errors['name']);
const toySchema = new Schema({
  color: String,
  name: String
});

const Toy = db.model('Toys', toySchema);

Toy.schema.path('color').validate(function(value) {
  return /red|green|blue/i.test(value);
}, 'Invalid color');

const opts = { runValidators: true };

let error;
try {
  await Toy.updateOne({}, { color: 'not a color' }, opts);
} catch (err) {
  error = err;
}

assert.equal(error.errors.color.message, 'Invalid color');
const toySchema = new Schema({
  color: String,
  name: String
});

toySchema.path('color').validate(function(value) {
  // When running in `validate()` or `validateSync()`, the
  // validator can access the document using `this`.
  // When running with update validators, `this` is the Query,
  // **not** the document being updated!
  // Queries have a `get()` method that lets you get the
  // updated value.
  if (this.get('name') && this.get('name').toLowerCase().indexOf('red') !== -1) {
    return value === 'red';
  }
  return true;
});

const Toy = db.model('ActionFigure', toySchema);

const toy = new Toy({ color: 'green', name: 'Red Power Ranger' });
// Validation failed: color: Validator failed for path `color` with value `green`
let error = toy.validateSync();
assert.ok(error.errors['color']);

const update = { color: 'green', name: 'Red Power Ranger' };
const opts = { runValidators: true };

error = null;
try {
  await Toy.updateOne({}, update, opts);
} catch (err) {
  error = err;
}
// Validation failed: color: Validator failed for path `color` with value `green`
assert.ok(error);
const kittenSchema = new Schema({
  name: { type: String, required: true },
  age: Number
});

const Kitten = db.model('Kitten', kittenSchema);

const update = { color: 'blue' };
const opts = { runValidators: true };
// Operation succeeds despite the fact that 'name' is not specified
await Kitten.updateOne({}, update, opts);

const unset = { $unset: { name: 1 } };
// Operation fails because 'name' is required
const err = await Kitten.updateOne({}, unset, opts).then(() => null, err => err);
assert.ok(err);
assert.ok(err.errors['name']);
const testSchema = new Schema({
  number: { type: Number, max: 0 },
  arr: [{ message: { type: String, maxlength: 10 } }]
});

// Update validators won't check this, so you can still `$push` 2 elements
// onto the array, so long as they don't have a `message` that's too long.
testSchema.path('arr').validate(function(v) {
  return v.length < 2;
});

const Test = db.model('Test', testSchema);

let update = { $inc: { number: 1 } };
const opts = { runValidators: true };

// There will never be a validation error here
await Test.updateOne({}, update, opts);

// This will never error either even though the array will have at
// least 2 elements.
update = { $push: [{ message: 'hello' }, { message: 'world' }] };
await Test.updateOne({}, update, opts);
const childSchema = new mongoose.Schema({
  name: String
});

const mainSchema = new mongoose.Schema({
  child: [childSchema]
});

mainSchema.pre('findOneAndUpdate', function() {
  console.log('Middleware on parent document'); // Will be executed
});

childSchema.pre('findOneAndUpdate', function() {
  console.log('Middleware on subdocument'); // Will not be executed
});
const childSchema = new mongoose.Schema({
  name: String
});

const mainSchema = new mongoose.Schema({
  child: [childSchema]
});

mainSchema.pre('findOneAndUpdate', function() {
  console.log('Middleware on parent document'); // Will be executed
});

childSchema.pre('findOneAndUpdate', function() {
  console.log('Middleware on subdocument'); // Will not be executed
});
schema.pre('save', function() {
  return doStuff().
    then(() => doMoreStuff());
});

// Or, using async functions
schema.pre('save', async function() {
  await doStuff();
  await doMoreStuff();
});
const schema = new Schema({ /* ... */ });
schema.pre('save', function(next) {
  if (foo()) {
    console.log('calling next!');
    // `return next();` will make sure the rest of this function doesn't run
    /* return */ next();
  }
  // Unless you comment out the `return` above, 'after next' will print
  console.log('after next');
});
schema.pre('save', function(next) {
  const err = new Error('something went wrong');
  // If you call `next()` with an argument, that argument is assumed to be
  // an error.
  next(err);
});

schema.pre('save', function() {
  // You can also return a promise that rejects
  return new Promise((resolve, reject) => {
    reject(new Error('something went wrong'));
  });
});

schema.pre('save', function() {
  // You can also throw a synchronous error
  throw new Error('something went wrong');
});

schema.pre('save', async function() {
  await Promise.resolve();
  // You can also throw an error in an `async` function
  throw new Error('something went wrong');
});

// later...

// Changes will not be persisted to MongoDB because a pre hook errored out
myDoc.save(function(err) {
  console.log(err.message); // something went wrong
});
schema.post('init', function(doc) {
  console.log('%s has been initialized from the db', doc._id);
});
schema.post('validate', function(doc) {
  console.log('%s has been validated (but not saved yet)', doc._id);
});
schema.post('save', function(doc) {
  console.log('%s has been saved', doc._id);
});
schema.post('deleteOne', function(doc) {
  console.log('%s has been deleted', doc._id);
});
// Takes 2 parameters: this is an asynchronous post hook
schema.post('save', function(doc, next) {
  setTimeout(function() {
    console.log('post1');
    // Kick off the second post hook
    next();
  }, 10);
});

// Will not execute until the first middleware calls `next()`
schema.post('save', function(doc, next) {
  console.log('post2');
  next();
});
schema.post('save', async function(doc) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('post1');
  // If less than 2 parameters, no need to call `next()`
});

schema.post('save', async function(doc, next) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('post1');
  // If there's a `next` parameter, you need to call `next()`.
  next();
});
const schema = new mongoose.Schema({ name: String });

// Compile a model from the schema
const User = mongoose.model('User', schema);

// Mongoose will **not** call the middleware function, because
// this middleware was defined after the model was compiled
schema.pre('save', () => console.log('Hello from pre save'));

const user = new User({ name: 'test' });
user.save();
const schema = new mongoose.Schema({ name: String });
// Mongoose will call this middleware function, because this script adds
// the middleware to the schema before compiling the model.
schema.pre('save', () => console.log('Hello from pre save'));

// Compile a model from the schema
const User = mongoose.model('User', schema);

const user = new User({ name: 'test' });
user.save();
const schema = new mongoose.Schema({ name: String });

// Once you `require()` this file, you can no longer add any middleware
// to this schema.
module.exports = mongoose.model('User', schema);
schema.pre('validate', function() {
  console.log('this gets printed first');
});
schema.post('validate', function() {
  console.log('this gets printed second');
});
schema.pre('save', function() {
  console.log('this gets printed third');
});
schema.post('save', function() {
  console.log('this gets printed fourth');
});
const userSchema = new Schema({ name: String, age: Number });
userSchema.pre('findOneAndUpdate', function() {
  console.log(this.getFilter()); // { name: 'John' }
  console.log(this.getUpdate()); // { age: 30 }
});
const User = mongoose.model('User', userSchema);

await User.findOneAndUpdate({ name: 'John' }, { $set: { age: 30 } });
const userSchema = new Schema({ name: String, age: Number });
userSchema.pre('save', function(next, options) {
  options.validateModifiedOnly; // true

  // Remember to call `next()` unless you're using an async function or returning a promise
  next();
});
const User = mongoose.model('User', userSchema);

const doc = new User({ name: 'John', age: 30 });
await doc.save({ validateModifiedOnly: true });
schema.pre('deleteOne', function() { console.log('Removing!'); });

// Does **not** print "Removing!". Document middleware for `deleteOne` is not executed by default
await doc.deleteOne();

// Prints "Removing!"
await Model.deleteOne();
// Only document middleware
schema.pre('deleteOne', { document: true, query: false }, function() {
  console.log('Deleting doc!');
});

// Only query middleware. This will get called when you do `Model.deleteOne()`
// but not `doc.deleteOne()`.
schema.pre('deleteOne', { query: true, document: false }, function() {
  console.log('Deleting!');
  const schema = new mongoose.Schema({ name: String });
schema.pre('validate', function() {
  console.log('Document validate');
});
schema.pre('validate', { query: true, document: false }, function() {
  console.log('Query validate');
});
const Test = mongoose.model('Test', schema);

const doc = new Test({ name: 'foo' });

// Prints "Document validate"
await doc.validate();

// Prints "Query validate"
await Test.find().validate();
schema.pre('find', function() {
  console.log(this instanceof mongoose.Query); // true
  this.start = Date.now();
});

schema.post('find', function(result) {
  console.log(this instanceof mongoose.Query); // true
  // prints returned documents
  console.log('find() returned ' + JSON.stringify(result));
  // prints number of milliseconds the query took
  console.log('find() took ' + (Date.now() - this.start) + ' milliseconds');
});
schema.pre('updateOne', function() {
  this.set({ updatedAt: new Date() });
});
schema.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  console.log(docToUpdate); // The document that `findOneAndUpdate()` will modify
});
schema.pre('updateOne', { document: true, query: false }, function() {
  console.log('Updating');
});
const Model = mongoose.model('Test', schema);

const doc = new Model();
await doc.updateOne({ $set: { name: 'test' } }); // Prints "Updating"

// Doesn't print "Updating", because `Query#updateOne()` doesn't fire
// document middleware.
await Model.updateOne({}, { $set: { name: 'test' } });
const schema = new Schema({
  name: {
    type: String,
    // Will trigger a MongoServerError with code 11000 when
    // you save a duplicate
    unique: true
  }
});

// Handler **must** take 3 parameters: the error that occurred, the document
// in question, and the `next()` function
schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

// Will trigger the `post('save')` error handler
Person.create([{ name: 'Axl Rose' }, { name: 'Axl Rose' }]);
// The same E11000 error can occur when you call `updateOne()`
// This function **must** take 4 parameters.

schema.post('updateOne', function(passRawResult, error, res, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next(); // The `updateOne()` call will still error out.
  }
});

const people = [{ name: 'Axl Rose' }, { name: 'Slash' }];
await Person.create(people);

// Throws "There was a duplicate key error"
await Person.updateOne({ name: 'Slash' }, { $set: { name: 'Axl Rose' } });
customerSchema.pre('aggregate', function() {
  // Add a $match state to the beginning of each pipeline.
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});
[require:post init hooks.*success]
[require:post init hooks.*error]
const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

const storySchema = Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: String,
  fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);
const author = new Person({
  _id: new mongoose.Types.ObjectId(),
  name: 'Ian Fleming',
  age: 50
});

await author.save();

const story1 = new Story({
  title: 'Casino Royale',
  author: author._id // assign the _id from the person
});

await story1.save();
// that's it!
const story = await Story.
  findOne({ title: 'Casino Royale' }).
  populate('author').
  exec();
// prints "The author is Ian Fleming"
console.log('The author is %s', story.author.name);
const story = await Story.findOne({ title: 'Casino Royale' });
story.author = author;
console.log(story.author.name); // prints "Ian Fleming"
const fan1 = await Person.create({ name: 'Sean' });
await Story.updateOne({ title: 'Casino Royale' }, { $push: { fans: { $each: [fan1._id] } } });

const story = await Story.findOne({ title: 'Casino Royale' }).populate('fans');
story.fans[0].name; // 'Sean'

const fan2 = await Person.create({ name: 'George' });
story.fans.push(fan2);
story.fans[1].name; // 'George'

story.fans.push({ name: 'Roger' });
story.fans[2].name; // 'Roger'
const fan4 = await Person.create({ name: 'Timothy' });
story.fans.push(fan4._id); // Push the `_id`, not the full document

story.fans[0].name; // undefined, `fans[0]` is now an ObjectId
story.fans[0].toString() === fan1._id.toString(); // true
story.populated('author'); // truthy

story.depopulate('author'); // Make `author` not populated anymore
story.populated('author'); // undefined
story.populated('author'); // truthy
story.author._id; // ObjectId

story.depopulate('author'); // Make `author` not populated anymore
story.populated('author'); // undefined

story.author instanceof ObjectId; // true
story.author._id; // ObjectId, because Mongoose adds a special getter
await Person.deleteMany({ name: 'Ian Fleming' });

const story = await Story.findOne({ title: 'Casino Royale' }).populate('author');
story.author; // `null'
const storySchema = Schema({
  authors: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
  title: String
});

// Later

const story = await Story.findOne({ title: 'Casino Royale' }).populate('authors');
story.authors; // `[]`
const story = await Story.
  findOne({ title: /casino royale/i }).
  populate('author', 'name').
  exec(); // only return the Persons name
// prints "The author is Ian Fleming"
console.log('The author is %s', story.author.name);
// prints "The authors age is null"
console.log('The authors age is %s', story.author.age);
await Story.
  find({ /* ... */ }).
  populate('fans').
  populate('author').
  exec();
  // The 2nd `populate()` call below overwrites the first because they
// both populate 'fans'.
await Story.
find().
populate({ path: 'fans', select: 'name' }).
populate({ path: 'fans', select: 'email' });
// The above is equivalent to:
await Story.find().populate({ path: 'fans', select: 'email' });
await Story.
  find().
  populate({
    path: 'fans',
    match: { age: { $gte: 21 } },
    // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    select: 'name -_id'
  }).
  exec();
  const story = await Story.
  findOne({ title: 'Casino Royale' }).
  populate({ path: 'author', match: { name: { $ne: 'Ian Fleming' } } }).
  exec();
story.author; // `null`
const story = await Story.
  findOne({ 'author.name': 'Ian Fleming' }).
  populate('author').
  exec();
story; // null
const story = await Story.
  findOne({ 'author.name': 'Ian Fleming' }).
  populate('author').
  exec();
story; // null
const stories = await Story.find().populate({
  path: 'fans',
  options: { limit: 2 }
});

stories[0].name; // 'Casino Royale'
stories[0].fans.length; // 2

// 2nd story has 0 fans!
stories[1].name; // 'Live and Let Die'
stories[1].fans.length; // 0
const stories = await Story.find().populate({
  path: 'fans',
  // Special option that tells Mongoose to execute a separate query
  // for each `story` to make sure we get 2 fans for each story.
  perDocumentLimit: 2
});

stories[0].name; // 'Casino Royale'
stories[0].fans.length; // 2

stories[1].name; // 'Live and Let Die'
stories[1].fans.length; // 2
await story1.save();

author.stories.push(story1);
await author.save();
const person = await Person.
  findOne({ name: 'Ian Fleming' }).
  populate('stories').
  exec(); // only works if we pushed refs to children
console.log(person);
const stories = await Story.
  find({ author: author._id }).
  exec();
console.log('The stories are an array: ', stories);
const person = await Person.findOne({ name: 'Ian Fleming' });

person.populated('stories'); // null

// Call the `populate()` method on a document to populate a path.
await person.populate('stories');

person.populated('stories'); // Array of ObjectIds
person.stories[0].name; // 'Casino Royale'
await person.populate(['stories', 'fans']);
person.populated('fans'); // Array of ObjectIds
const userSchema = new Schema({
  name: String,
  friends: [{ type: ObjectId, ref: 'User' }]
});
const userSchema = new Schema({
  name: String,
  friends: [{ type: ObjectId, ref: 'User' }]
});
const db1 = mongoose.createConnection('mongodb://127.0.0.1:27000/db1');
const db2 = mongoose.createConnection('mongodb://127.0.0.1:27001/db2');

const conversationSchema = new Schema({ numMessages: Number });
const Conversation = db2.model('Conversation', conversationSchema);

const eventSchema = new Schema({
  name: String,
  conversation: {
    type: ObjectId,
    ref: Conversation // `ref` is a **Model class**, not a string
  }
});
const Event = db1.model('Event', eventSchema);
// Works
const events = await Event.
  find().
  populate('conversation');
  const events = await Event.
  find().
  // The `model` option specifies the model to use for populating.
  populate({ path: 'conversation', model: Conversation });
  const commentSchema = new Schema({
    body: { type: String, required: true },
    doc: {
      type: Schema.Types.ObjectId,
      required: true,
      // Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
      // will look at the `docModel` property to find the right model.
      refPath: 'docModel'
    },
    docModel: {
      type: String,
      required: true,
      enum: ['BlogPost', 'Product']
    }
  });
  
  const Product = mongoose.model('Product', new Schema({ name: String }));
  const BlogPost = mongoose.model('BlogPost', new Schema({ title: String }));
  const Comment = mongoose.model('Comment', commentSchema);
  const book = await Product.create({ name: 'The Count of Monte Cristo' });
const post = await BlogPost.create({ title: 'Top 10 French Novels' });

const commentOnBook = await Comment.create({
  body: 'Great read',
  doc: book._id,
  docModel: 'Product'
});

const commentOnPost = await Comment.create({
  body: 'Very informative',
  doc: post._id,
  docModel: 'BlogPost'
});

// The below `populate()` works even though one comment references the
// 'Product' collection and the other references the 'BlogPost' collection.
const comments = await Comment.find().populate('doc').sort({ body: 1 });
comments[0].doc.name; // "The Count of Monte Cristo"
comments[1].doc.title; // "Top 10 French Novels"
const commentSchema = new Schema({
  body: { type: String, required: true },
  product: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'BlogPost'
  }
});

// ...

// The below `populate()` is equivalent to the `refPath` approach, you
// just need to make sure you `populate()` both `product` and `blogPost`.
const comments = await Comment.find().
  populate('product').
  populate('blogPost').
  sort({ body: 1 });
comments[0].product.name; // "The Count of Monte Cristo"
comments[1].blogPost.title; // "Top 10 French Novels"
const commentSchema = new Schema({
  body: { type: String, required: true },
  product: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'BlogPost'
  }
});

// ...

// The below `populate()` is equivalent to the `refPath` approach, you
// just need to make sure you `populate()` both `product` and `blogPost`.
const comments = await Comment.find().
  populate('product').
  populate('blogPost').
  sort({ body: 1 });
comments[0].product.name; // "The Count of Monte Cristo"
comments[1].blogPost.title; // "Top 10 French Novels"
const commentSchema = new Schema({
  body: { type: String, required: true },
  commentType: {
    type: String,
    enum: ['comment', 'review']
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: function () {
      return this.commentType === 'review' ? this.reviewEntityModel : this.commentEntityModel; // 'this' refers to the document being populated
    }
  },
  commentEntityModel: {
    type: String,
    required: true,
    enum: ['BlogPost', 'Review']
  },
  reviewEntityModel: {
    type: String,
    required: true,
    enum: ['Vendor', 'Product']
  }
});
const commentSchema = new Schema({
  body: { type: String, required: true },
  verifiedBuyer: Boolean
  doc: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: function() {
      return this.verifiedBuyer ? 'Product' : 'BlogPost'; // 'this' refers to the document being populated
    }
  },
});
const AuthorSchema = new Schema({
  name: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }]
});

const BlogPostSchema = new Schema({
  title: String,
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    content: String
  }]
});

const Author = mongoose.model('Author', AuthorSchema, 'Author');
const BlogPost = mongoose.model('BlogPost', BlogPostSchema, 'BlogPost');
const AuthorSchema = new Schema({
  name: String
});

const BlogPostSchema = new Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    content: String
  }]
});
// Specifying a virtual with a `ref` property is how you enable virtual
// population
AuthorSchema.virtual('posts', {
  ref: 'BlogPost',
  localField: '_id',
  foreignField: 'author'
});

const Author = mongoose.model('Author', AuthorSchema, 'Author');
const BlogPost = mongoose.model('BlogPost', BlogPostSchema, 'BlogPost');
You can then populate() the author's posts as shown below.

const author = await Author.findOne().populate('posts');

author.posts[0].title; // Title of the first blog post
const authorSchema = new Schema({ name: String }, {
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});
let authors = await Author.
  find({}).
  // Won't work because the foreign field `author` is not selected
  populate({ path: 'posts', select: 'title' }).
  exec();

authors = await Author.
  find({}).
  // Works, foreign field `author` is selected
  populate({ path: 'posts', select: 'title author' }).
  exec();
  const PersonSchema = new Schema({
    name: String,
    band: String
  });
  
  const BandSchema = new Schema({
    name: String
  });
  BandSchema.virtual('numMembers', {
    ref: 'Person', // The model to use
    localField: 'name', // Find people where `localField`
    foreignField: 'band', // is equal to `foreignField`
    count: true // And only get the number of docs
  });
  
  // Later
  const doc = await Band.findOne({ name: 'Motley Crue' }).
    populate('numMembers');
  doc.numMembers; // 2
  // Same example as 'Populate Virtuals' section
AuthorSchema.virtual('posts', {
  ref: 'BlogPost',
  localField: '_id',
  foreignField: 'author',
  match: { archived: false } // match option with basic query selector
});

const Author = mongoose.model('Author', AuthorSchema, 'Author');
const BlogPost = mongoose.model('BlogPost', BlogPostSchema, 'BlogPost');

// After population
const author = await Author.findOne().populate('posts');

author.posts; // Array of not `archived` posts
AuthorSchema.virtual('posts', {
  ref: 'BlogPost',
  localField: '_id',
  foreignField: 'author',
  // Add an additional filter `{ tags: author.favoriteTags }` to the populate query
  // Mongoose calls the `match` function with the document being populated as the
  // first argument.
  match: author => ({ tags: author.favoriteTags })
});
// Overwrite the `match` option specified in `AuthorSchema.virtual()` for this
// single `populate()` call.
await Author.findOne().populate({ path: posts, match: {} });
await Author.findOne().populate({
  path: posts,
  // Add `isDeleted: false` to the virtual's default `match`, so the `match`
  // option would be `{ tags: author.favoriteTags, isDeleted: false }`
  match: (author, virtual) => ({
    ...virtual.options.match(author),
    isDeleted: false
  })
});
const BandSchema = new Schema({
  name: String,
  members: {
    type: Map,
    of: {
      type: 'ObjectId',
      ref: 'Person'
    }
  }
});
const Band = mongoose.model('Band', bandSchema);
const person1 = new Person({ name: 'Vince Neil' });
const person2 = new Person({ name: 'Mick Mars' });

const band = new Band({
  name: 'Motley Crue',
  members: {
    singer: person1._id,
    guitarist: person2._id
  }
});
const band = await Band.findOne({ name: 'Motley Crue' }).populate('members.$*');

band.members.get('singer'); // { _id: ..., name: 'Vince Neil' }
const librarySchema = new Schema({
  name: String,
  books: {
    type: Map,
    of: new Schema({
      title: String,
      author: {
        type: 'ObjectId',
        ref: 'Person'
      }
    })
  }
});
const Library = mongoose.model('Library', librarySchema);
const libraries = await Library.find().populate('books.$*.author');
// Always attach `populate()` to `find()` calls
MySchema.pre('find', function() {
  this.populate('user');
});
// Always `populate()` after `find()` calls. Useful if you want to selectively populate
// based on the docs found.
MySchema.post('find', async function(docs) {
  for (const doc of docs) {
    if (doc.isPublic) {
      await doc.populate('user');
    }
  }
});
// `populate()` after saving. Useful for sending populated data back to the client in an
// update API endpoint
MySchema.post('save', function(doc, next) {
  doc.populate('user').then(function() {
    next();
  });
});
const userSchema = new Schema({
  email: String,
  password: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

userSchema.pre('find', function(next) {
  this.populate('followers following');
  next();
});

const User = mongoose.model('User', userSchema);
userSchema.pre('find', function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({ path: 'followers following', options: { _recursed: true } });
  next();
});
// With `transform`
doc = await Parent.findById(doc).populate([
  {
    path: 'child',
    // If `doc` is null, use the original id instead
    transform: (doc, id) => doc == null ? id : doc
  }
]);

doc.child; // 634d1a5744efe65ae09142f9
doc.children; // [ 634d1a67ac15090a0ca6c0ea, { _id: 634d1a4ddb804d17d95d1c7f, name: 'Luke', __v: 0 } ]
let doc = await Parent.create({ children: [{ name: 'Luke' }, { name: 'Leia' }] });

doc = await Parent.findById(doc).populate([{
  path: 'children',
  transform: doc => doc == null ? null : doc.name
}]);

doc.children; // ['Luke', 'Leia']
const internationalizedStringSchema = new Schema({
  en: String,
  es: String
});

const ingredientSchema = new Schema({
  // Instead of setting `name` to just a string, set `name` to a map
  // of language codes to strings.
  name: {
    type: internationalizedStringSchema,
    // When you access `name`, pull the document's locale
    get: function(value) {
      return value[this.$locals.language || 'en'];
    }
  }
});

const recipeSchema = new Schema({
  ingredients: [{ type: mongoose.ObjectId, ref: 'Ingredient' }]
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
// Create some sample data
const { _id } = await Ingredient.create({
  name: {
    en: 'Eggs',
    es: 'Huevos'
  }
});
await Recipe.create({ ingredients: [_id] });

// Populate with setting `$locals.language` for internationalization
const language = 'es';
const recipes = await Recipe.find().populate({
  path: 'ingredients',
  transform: function(doc) {
    doc.$locals.language = language;
    return doc;
  }
});

// Gets the ingredient's name in Spanish `name.es`
recipes[0].ingredients[0].name; // 'Huevos'
const options = { discriminatorKey: 'kind' };

const eventSchema = new mongoose.Schema({ time: Date }, options);
const Event = mongoose.model('Event', eventSchema);

// ClickedLinkEvent is a special type of Event that has
// a URL.
const ClickedLinkEvent = Event.discriminator('ClickedLink',
  new mongoose.Schema({ url: String }, options));

// When you create a generic event, it can't have a URL field...
const genericEvent = new Event({ time: Date.now(), url: 'google.com' });
assert.ok(!genericEvent.url);

// But a ClickedLinkEvent can
const clickedEvent = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
assert.ok(clickedEvent.url);
const event1 = new Event({ time: Date.now() });
const event2 = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
const event3 = new SignedUpEvent({ time: Date.now(), user: 'testuser' });


await Promise.all([event1.save(), event2.save(), event3.save()]);
const count = await Event.countDocuments();
assert.equal(count, 3);
const event1 = new Event({ time: Date.now() });
const event2 = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
const event3 = new SignedUpEvent({ time: Date.now(), user: 'testuser' });

assert.ok(!event1.__t);
assert.equal(event2.__t, 'ClickedLink');
assert.equal(event3.__t, 'SignedUp');
let event = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
await event.save();

event.__t = 'SignedUp';
// ValidationError: ClickedLink validation failed: __t: Cast to String failed for value "SignedUp" (type string) at path "__t"
  await event.save();

event = await ClickedLinkEvent.findByIdAndUpdate(event._id, { __t: 'SignedUp' }, { new: true });
event.__t; // 'ClickedLink', update was a no-op
let event = new ClickedLinkEvent({ time: Date.now(), url: 'google.com' });
await event.save();

event = await ClickedLinkEvent.findByIdAndUpdate(
  event._id,
  { __t: 'SignedUp' },
  { overwriteDiscriminatorKey: true, new: true }
);
event.__t; // 'SignedUp', updated discriminator key
const eventSchema = new Schema({ message: String },
  { discriminatorKey: 'kind', _id: false });

const batchSchema = new Schema({ events: [eventSchema] });

// `batchSchema.path('events')` gets the mongoose `DocumentArray`
// For TypeScript, use `schema.path<Schema.Types.DocumentArray>('events')`
const docArray = batchSchema.path('events');

// The `events` array can contain 2 different types of events, a
// 'clicked' event that requires an element id that was clicked...
const clickedSchema = new Schema({
  element: {
    type: String,
    required: true
  }
}, { _id: false });
// Make sure to attach any hooks to `eventSchema` and `clickedSchema`
// **before** calling `discriminator()`.
const Clicked = docArray.discriminator('Clicked', clickedSchema);

// ... and a 'purchased' event that requires the product that was purchased.
const Purchased = docArray.discriminator('Purchased', new Schema({
  product: {
    type: String,
    required: true
  }
}, { _id: false }));

const Batch = db.model('EventBatch', batchSchema);

// Create a new batch of events with different kinds
const doc = await Batch.create({
  events: [
    { kind: 'Clicked', element: '#hero', message: 'hello' },
    { kind: 'Purchased', product: 'action-figure-1', message: 'world' }
  ]
});

assert.equal(doc.events.length, 2);

assert.equal(doc.events[0].element, '#hero');
assert.equal(doc.events[0].message, 'hello');
assert.ok(doc.events[0] instanceof Clicked);

assert.equal(doc.events[1].product, 'action-figure-1');
assert.equal(doc.events[1].message, 'world');
assert.ok(doc.events[1] instanceof Purchased);

doc.events.push({ kind: 'Purchased', product: 'action-figure-2' });

await doc.save();

assert.equal(doc.events.length, 3);

assert.equal(doc.events[2].product, 'action-figure-2');
assert.ok(doc.events[2] instanceof Purchased);
const shapeSchema = Schema({ name: String }, { discriminatorKey: 'kind' });
const schema = Schema({ shape: shapeSchema });

// For TypeScript, use `schema.path<Schema.Types.Subdocument>('shape').discriminator(...)`
schema.path('shape').discriminator('Circle', Schema({ radius: String }));
schema.path('shape').discriminator('Square', Schema({ side: Number }));

const MyModel = mongoose.model('ShapeTest', schema);

// If `kind` is set to 'Circle', then `shape` will have a `radius` property
let doc = new MyModel({ shape: { kind: 'Circle', radius: 5 } });
doc.shape.radius; // 5

// If `kind` is set to 'Square', then `shape` will have a `side` property
doc = new MyModel({ shape: { kind: 'Square', side: 10 } });
doc.shape.side; // 10
// loadedAt.js
module.exports = function loadedAtPlugin(schema, options) {
  schema.virtual('loadedAt').
    get(function() { return this._loadedAt; }).
    set(function(v) { this._loadedAt = v; });

  schema.post(['find', 'findOne'], function(docs) {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    const now = new Date();
    for (const doc of docs) {
      doc.loadedAt = now;
    }
  });
};

// game-schema.js
const loadedAtPlugin = require('./loadedAt');
const gameSchema = new Schema({ /* ... */ });
gameSchema.plugin(loadedAtPlugin);

// player-schema.js
const loadedAtPlugin = require('./loadedAt');
const playerSchema = new Schema({ /* ... */ });
playerSchema.plugin(loadedAtPlugin);
const mongoose = require('mongoose');
mongoose.plugin(require('./loadedAt'));

const gameSchema = new Schema({ /* ... */ });
const playerSchema = new Schema({ /* ... */ });
// `loadedAtPlugin` gets attached to both schemas
const Game = mongoose.model('Game', gameSchema);
const Player = mongoose.model('Player', playerSchema);
// loadedAt.js
module.exports = function loadedAtPlugin(schema, options) {
  schema.virtual('loadedAt').
    get(function() { return this._loadedAt; }).
    set(function(v) { this._loadedAt = v; });

  schema.post(['find', 'findOne'], function(docs) {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    const now = new Date();
    for (const doc of docs) {
      doc.loadedAt = now;
    }
  });
};

// game-schema.js
const loadedAtPlugin = require('./loadedAt');
const gameSchema = new Schema({ /* ... */ });
const Game = mongoose.model('Game', gameSchema);

// `find()` and `findOne()` hooks from `loadedAtPlugin()` won't get applied
// because `mongoose.model()` was already called!
gameSchema.plugin(loadedAtPlugin);
const userSchema = new Schema({ name: String }, { timestamps: true });
const User = mongoose.model('User', userSchema);

let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.244Z

doc.name = 'test2';
await doc.save();
console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.307Z

doc = await User.findOneAndUpdate({ _id: doc._id }, { name: 'test3' }, { new: true });
console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.366Z
let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:13.930Z

doc.name = 'test2';
doc.createdAt = new Date(0);
doc.updatedAt = new Date(0);
await doc.save();

// Mongoose blocked changing `createdAt` and set its own `updatedAt`, ignoring
// the attempt to manually set them.
console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:13.991Z

// Mongoose also blocks changing `createdAt` and sets its own `updatedAt`
// on `findOneAndUpdate()`, `updateMany()`, and other query operations
// **except** `replaceOne()` and `findOneAndReplace()`.
doc = await User.findOneAndUpdate(
  { _id: doc._id },
  { name: 'test3', createdAt: new Date(0), updatedAt: new Date(0) },
  { new: true }
);
console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:14.008Z
// `findOneAndReplace()` and `replaceOne()` without timestamps specified in `replacement`
// sets `createdAt` and `updatedAt` to current time.
doc = await User.findOneAndReplace(
  { _id: doc._id },
  { name: 'test3' },
  { new: true }
);
console.log(doc.createdAt); // 2022-02-26T17:08:14.008Z
console.log(doc.updatedAt); // 2022-02-26T17:08:14.008Z

// `findOneAndReplace()` and `replaceOne()` with timestamps specified in `replacement`
// sets `createdAt` and `updatedAt` to the values in `replacement`.
doc = await User.findOneAndReplace(
  { _id: doc._id },
  {
    name: 'test3',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2022-06-01')
  },
  { new: true }
);
console.log(doc.createdAt); // 2022-06-01T00:00:00.000Z
console.log(doc.updatedAt); // 2022-06-01T00:00:00.000Z
const userSchema = new Schema({ name: String }, {
  timestamps: {
    createdAt: 'created_at', // Use `created_at` to store the created date
    updatedAt: 'updated_at' // and `updated_at` to store the last updated date
  }
});
let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T23:28:54.264Z
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

doc.name = 'test2';

// Setting `timestamps: false` tells Mongoose to skip updating `updatedAt` on this `save()`
await doc.save({ timestamps: false });
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

// Similarly, setting `timestamps: false` on a query tells Mongoose to skip updating
// `updatedAt`.
doc = await User.findOneAndUpdate({ _id: doc._id }, { name: 'test3' }, {
  new: true,
  timestamps: false
});
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

// Below is how you can disable timestamps on a `bulkWrite()`
await User.bulkWrite([{
  updateOne: {
    filter: { _id: doc._id },
    update: { name: 'test4' },
    timestamps: false
  }
}]);
doc = await User.findOne({ _id: doc._id });
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z
const doc = new User({ name: 'test' });

// Tell Mongoose to set `createdAt`, but skip `updatedAt`.
await doc.save({ timestamps: { createdAt: true, updatedAt: false } });
console.log(doc.createdAt); // 2022-02-26T23:32:12.478Z
console.log(doc.updatedAt); // undefined
let doc = await User.create({ name: 'test' });

// To update `updatedAt`, do a `findOneAndUpdate()` with `timestamps: false` and
// `updatedAt` set to the value you want
doc = await User.findOneAndUpdate({ _id: doc._id }, { updatedAt: new Date(0) }, {
  new: true,
  timestamps: false
});
console.log(doc.updatedAt); // 1970-01-01T00:00:00.000Z

// To update `createdAt`, you also need to set `strict: false` because `createdAt`
// is immutable
doc = await User.findOneAndUpdate({ _id: doc._id }, { createdAt: new Date(0) }, {
  new: true,
  timestamps: false,
  strict: false
});
console.log(doc.createdAt); // 1970-01-01T00:00:00.000Z
const roleSchema = new Schema({ value: String }, { timestamps: true });
const userSchema = new Schema({ name: String, roles: [roleSchema] });

const doc = await User.create({ name: 'test', roles: [{ value: 'admin' }] });
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.836Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.836Z

// Overwriting the subdocument also overwrites `createdAt` and `updatedAt`
doc.roles[0] = { value: 'root' };
await doc.save();
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.902Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.902Z

// But updating the subdocument preserves `createdAt` and updates `updatedAt`
doc.roles[0].value = 'admin';
await doc.save();
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.902Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.909Z
mongoose.set('debug', true);

const userSchema = new Schema({
  name: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

await User.findOneAndUpdate({}, { name: 'test' });
await User.findOneAndUpdate({}, { $setOnInsert: { updatedAt: new Date() } }, {
  timestamps: { createdAt: true, updatedAt: false }
});
const createdAt = new Date('2011-06-01');
// Update a document's `createdAt` to a custom value.
// Normally Mongoose would prevent doing this because `createdAt` is immutable.
await Model.updateOne({ _id: doc._id }, { createdAt }, { overwriteImmutable: true, timestamps: false });

doc = await Model.collection.findOne({ _id: doc._id });
doc.createdAt.valueOf() === createdAt.valueOf(); // true
// Using Mongoose's default connection
const session = await mongoose.startSession();

// Using custom connection
const db = await mongoose.createConnection(mongodbUri).asPromise();
const session = await db.startSession();
let session = null;
return Customer.createCollection().
  then(() => Customer.startSession()).
  // The `withTransaction()` function's first parameter is a function
  // that returns a promise.
  then(_session => {
    session = _session;
    return session.withTransaction(() => {
      return Customer.create([{ name: 'Test' }], { session: session });
    });
  }).
  then(() => Customer.countDocuments()).
  then(count => assert.strictEqual(count, 1)).
  then(() => session.endSession());
  const doc = new Person({ name: 'Will Riker' });

await db.transaction(async function setRank(session) {
  doc.name = 'Captain';
  await doc.save({ session });
  doc.isNew; // false

  // Throw an error to abort the transaction
  throw new Error('Oops!');
}, { readPreference: 'primary' }).catch(() => {});

// true, `transaction()` reset the document's state because the
// transaction was aborted.
doc.isNew;
const User = db.model('User', new Schema({ name: String }));

let session = null;
return User.createCollection().
  then(() => db.startSession()).
  then(_session => {
    session = _session;
    return User.create({ name: 'foo' });
  }).
  then(() => {
    session.startTransaction();
    return User.findOne({ name: 'foo' }).session(session);
  }).
  then(user => {
    // Getter/setter for the session associated with this document.
    assert.ok(user.$session());
    user.name = 'bar';
    // By default, `save()` uses the associated session
    return user.save();
  }).
  then(() => User.findOne({ name: 'bar' })).
  // Won't find the doc because `save()` is part of an uncommitted transaction
  then(doc => assert.ok(!doc)).
  then(() => session.commitTransaction()).
  then(() => session.endSession()).
  then(() => User.findOne({ name: 'bar' })).
  then(doc => assert.ok(doc));
  const Event = db.model('Event', new Schema({ createdAt: Date }), 'Event');

let session = null;
return Event.createCollection().
  then(() => db.startSession()).
  then(_session => {
    session = _session;
    session.startTransaction();
    return Event.insertMany([
      { createdAt: new Date('2018-06-01') },
      { createdAt: new Date('2018-06-02') },
      { createdAt: new Date('2017-06-01') },
      { createdAt: new Date('2017-05-31') }
    ], { session: session });
  }).
  then(() => Event.aggregate([
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1, '_id.year': -1, '_id.month': -1 } }
  ]).session(session)).
  then(res => assert.deepEqual(res, [
    { _id: { month: 6, year: 2018 }, count: 2 },
    { _id: { month: 6, year: 2017 }, count: 1 },
    { _id: { month: 5, year: 2017 }, count: 1 }
  ])).
  then(() => session.commitTransaction()).
  then(() => session.endSession());
  mongoose.set('transactionAsyncLocalStorage', true);

const Test = mongoose.model('Test', mongoose.Schema({ name: String }));

const doc = new Test({ name: 'test' });

// Save a new doc in a transaction that aborts
await connection.transaction(async() => {
  await doc.save(); // Notice no session here
  throw new Error('Oops');
}).catch(() => {});

// false, `save()` was rolled back
await Test.exists({ _id: doc._id });
const Customer = db.model('Customer', new Schema({ name: String }));

let session = null;
return Customer.createCollection().
  then(() => db.startSession()).
  then(_session => {
    session = _session;
    // Start a transaction
    session.startTransaction();
    // This `create()` is part of the transaction because of the `session`
    // option.
    return Customer.create([{ name: 'Test' }], { session: session });
  }).
  // Transactions execute in isolation, so unless you pass a `session`
  // to `findOne()` you won't see the document until the transaction
  // is committed.
  then(() => Customer.findOne({ name: 'Test' })).
  then(doc => assert.ok(!doc)).
  // This `findOne()` will return the doc, because passing the `session`
  // means this `findOne()` will run as part of the transaction.
  then(() => Customer.findOne({ name: 'Test' }).session(session)).
  then(doc => assert.ok(doc)).
  // Once the transaction is committed, the write operation becomes
  // visible outside of the transaction.
  then(() => session.commitTransaction()).
  then(() => Customer.findOne({ name: 'Test' })).
  then(doc => assert.ok(doc)).
  then(() => session.endSession());
  let session = null;
return Customer.createCollection().
  then(() => Customer.startSession()).
  then(_session => {
    session = _session;
    session.startTransaction();
    return Customer.create([{ name: 'Test' }], { session: session });
  }).
  then(() => Customer.create([{ name: 'Test2' }], { session: session })).
  then(() => session.abortTransaction()).
  then(() => Customer.countDocuments()).
  then(count => assert.strictEqual(count, 0)).
  then(() => session.endSession());