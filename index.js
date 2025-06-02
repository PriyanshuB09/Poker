import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.messagingSenderId,
  measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

/**
 * 
 * A chainable emitter that asynchronously updates and adds data, built on top of Firestore API.
 */

class CachedEmitter {
  constructor() {
      this.collection = null;
      this.updateData = null;
      this.addData = null;
      this.referencedDocs = [];
      this.queryFilters = [];
      this.fieldsToDelete = [];
      this.deleteData = false;
      this.batch = db.batch();
  }

  /**
   * Opens the collection provided.
   * @param {string} collectionName 
   * @returns An updated Cached Emitter
   */
  open(collectionName) {
      this.collection = collectionName;
      return this;
  }

  /**
   * Adds doc IDs to the list of documents that will be applied.
   * @param  {...string} docsList 
   * @returns An updated Cached Emitter
   */
  applyTo(...docsList) {
      this.referencedDocs = this.referencedDocs.concat(docsList);
      return this;
  }

  /**
   * Adds data to the list of documents that will be applied, cannot be used in the same line as update().
   * @param {object} dataObject 
   * @returns An updated Cached Emitter
   */
  add(dataObject) {
      this.addData = {
          ...dataObject,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      return this;
  }

  /**
   * Updates data to the list of documents that will be applied, cannot be used in same line as add().
   * @param {object} dataObject 
   * @returns An updated Cached Emitter
   */
  update(dataObject) {
      this.updateData = dataObject;
      return this;
  }

  /**
   *  Deletes documents specified in the document list.
   * @returns An updated Cached Emitter
   */
  delete() {
      this.deleteData = true;
      return this;
  }
  /**
   * Deletes a certain field from all documents specified in the document list.
   * @param {string} field
   * @returns An updated Cached Emitter
   */
  deleteField(field) {
      this.fieldsToDelete.push(field);
      return this;
  }

  /**
   * Adds a filter to only update or delete certain queries.
   * @param {string} attribute 
   * @param {string} condition 
   * @param {*} value 
   * @returns An updated Cached Emitter
   */
  find(attribute, condition, value) {
      this.queryFilters.push({attribute, condition, value, m_returnAll: false});
      return this;
  }

  /**
   * 
   * The final method, commits all the data to the database, asynchronously.
   */
  async commit() {
      // There are three scenarios, adding, deleting, updating
      console.log('w')

      if (this.referencedDocs.length == 0 && !this.deleteData) this.batch.set(db.collection(this.collection).doc(), this.addData);

      if (this.referencedDocs.length == 1) this.addData['uniquifier'] = this.referencedDocs[0];

      if (this.queryFilters.length > 0) {
          console.log('found');
          let object = db.collection(this.collection);

          this.queryFilters.forEach(filter => {
              object = object.where(filter.attribute, filter.condition, filter.value);
          });

          let querySnapshot = await object.get();

          querySnapshot.forEach(doc => {
              this.referencedDocs.push(doc.id);
          });
      }

      if (this.fieldsToDelete.length > 0) {
          let deletingObject = {}
          for (let field of this.fieldsToDelete) {
              deletingObject[field] = firebase.firestore.FieldValue.delete();
          }
          for (let doc of this.referencedDocs) {
              this.batch.update(db.collection(this.collection).doc(doc), deletingObject);
          }
      }
      if (!this.deleteData) {

          //If both are false or both are true, won't work
          if ((this.addData !== null) != (this.updateData !== null)) {
              if (this.addData !== null) {
                  for (let doc of this.referencedDocs) {
                      this.batch.set(db.collection(this.collection).doc(doc), this.addData);
                  }
              } else {
                  for (let doc of this.referencedDocs) {
                      this.batch.update(db.collection(this.collection).doc(doc), this.updateData);
                  }
              }
          } else {
              console.log('Have both add or update method or have no add or update method.')
          }
      } else {
          // Delete Data
          console.log('deleting');
          for (let doc of this.referencedDocs) {
              this.batch.delete(db.collection(this.collection).doc(doc));
          }
      }
      

      await this.batch.commit();
  }
}


/**
* 
* An chainable listener that asynchronously reads and queries data, built on top of Firestore API.
*/

class CachedListener {
  constructor() {
      this.collection = null;
      this.referencedDocs = [];
      this.queryFilters = [];
      this.limits = null;
      this.orders = [];
      this.givenID = [];
  }

  /**
   * Opens the collection provided.
   * @param {string} collectionName 
   * @returns An updated Cached Listener
   */
  open(collectionName) {
      this.collection = collectionName;
      console.log('open')
      return this;
  }
  /**
   * Adds a document ID to the referenced queries.
   * @param  {...string} docList 
   * @returns An updated Cached Listener
   */
  addDocID(...docList) {
      this.givenID = this.givenID.concat(docList);
      return this;
  }

  /**
   * Adds a document reference to the referenced queries.
   * @param  {...string} docList 
   * @returns An updated Cached Listener
   */
  addReference(...docList) {
      this.referencedDocs = this.referencedDocs.concat(docList);
      return this;
  }
  /**
   * Orders results based on attribute and order direction.
   * @param {string} attribute 
   * @param {string} orderDir 
   * @returns An updated Cached Listener
   */
  order(attribute, orderDir) {
      this.orders.push({attribute, orderDir});
      return this;
  }
  /**
   * Filters results based on attribute and condition.
   * @param {string} attribute 
   * @param {string} condition 
   * @param {string} value 
   * @returns An updated Cached Listener
   */
  find(attribute, condition, value) {
      this.queryFilters.push({attribute, condition, value});
      console.log('find')
      return this;
  }

  /**
   * Limits results to a certain number.
   * @param {integer} number 
   * @returns An updated Cached Listener
   */
  // limit(number) {
  //     this.limit = number;
  //     return this;
  // }

  /**
   * Returns all document references, asynchronously.
   * @returns All document references that have been queried.
   */
  async getAllReferences() {
      let object = db.collection(this.collection);

      this.queryFilters.forEach(filter => {
          object = object.where(filter.attribute, filter.condition, filter.value);
      });

      this.orders.forEach(order => {
          object = object.orderBy(order.attribute, order.orderDir);
      });

      let querySnapshot = await object.get();

      querySnapshot.forEach(doc => {
          console.log(doc.id);
          this.referencedDocs.push(doc);
      });

      this.givenID.forEach(doc => {
          this.referencedDocs.push(db.collection(this.collection).doc(doc));
      });

      return this.referencedDocs;
  }

  /**
   * Returns all document IDs, asynchronously.
   * @returns All document IDs that have been queried.
   */
  async getAllIDs() {
      let object = db.collection(this.collection);

      this.queryFilters.forEach(filter => {
          object = object.where(filter.attribute, filter.condition, filter.value);
      });

      this.orders.forEach(order => {
          object = object.orderBy(order.attribute, order.orderDir);
      });

      let querySnapshot = await object.get();

      querySnapshot.forEach(doc => {
          this.givenID.push(doc.id);
      });

      this.referencedDocs.forEach(doc => {
          this.givenID.push(doc.id);
      });

      return this.givenID;
  }

  /**
   * Returns data from referenced queries, and can be further focused on specific attributes.
   * @param  {string} attributesList 
   * @returns Returns data from all referenced queries.
   */
  async return(...attributesList) {
      let array = [];
      let object = db.collection(this.collection);

      this.queryFilters.forEach(filter => {
          object = object.where(filter.attribute, filter.condition, filter.value);
          console.log('queryFilter')
          console.log(filter);
      });

      this.orders.forEach(order => {
          object = object.orderBy(order.attribute, order.orderDir);
      });

      // if (this.limit !== null) object = object.limit(this.limit);

      console.log(object);
      console.log(await object.get());
      let querySnapshot = await object.get();
      console.log(querySnapshot.empty);

      querySnapshot.forEach(doc => {
          array.push(doc.data());
          console.log('array push');
      });

      this.referencedDocs.forEach(doc => {
          array.push(doc.data());
      });

      this.givenID.forEach(async doc => {
          let docRef = await db.collection(this.collection).doc(doc).get();
          array.push(docRef.data());
      });

      if (attributesList.length == 0) {
          console.log('working');
          return array;
      } else {
          let revisedArray = [];
          array.forEach(doc => {
              let revisedDoc = {};
              attributesList.forEach(attr => {
                  revisedDoc[attr] = doc[attr];
              });
              revisedArray.push(revisedDoc);
          });
          return revisedArray;
      }
  }
}

// js time :3

/**
* Starting method to initialize a new CachedEmitter.
* @returns A Cached Emitter for writing, updating, and deleting queries.
*/
function addEmitter() {
  return new CachedEmitter();
}
/**
* Starting method to initialize a new CachedListener.
* @returns A Cached Listener for reading and filtering queries.
*/
function addListener() {
  return new CachedListener();
}


const app_ = express();
const server = http.createServer(app_);
const io = new Server(server);

// Serve static files from /public
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app_.use(express.static(path.join(__dirname, 'public')));

// Socket.IO logic
io.on('connection', socket => {
  console.log('Client connected');


  socket.on('message', msg => {
    console.log('Received:', msg);
    socket.broadcast.emit('message', msg);
  });

  addEmitter().open('users').add({use: false}).applyTo('test').commit().then(() => console.log('sent data'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});