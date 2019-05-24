const express = require('express');  // 1. add express functionality
const db = require('./data/db'); // tells server where to find the database

const server = express(); // 2. create an express server call it server


server.use(express.json()); // teaches express how to parse json


// set up server to listen on localhost:4000
server.listen(4000, () => {
  console.log('=== Server running on local host 4000 ===');
})

// add home endpoint
 server.get('/', (req, res) => {
   res.send('I am the server');
 })

 // add /now endpoint
 server.get('/now', (req, res) => {
   const now = new Date().toISOString();
   res.send(now);
 })

 // add GET/ hubs endpoint:
 server.get('/hubs', (req, res) => {
   db.hubs
    .find()
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(err => {
      res.status(err.code).json({message: 'error No Hub found'})
    })
 })

//  .catch(( { code, message}) => {  ***optional way to do it***
//    res.status(code).json({
//      success: false,
//      message,
//    })
//  })

server.post('/hubs', (req, res) => {
  const hubInfo = req.body;

  db.hubs
  .add(hubInfo)
  .then(hub => {
    res.status(201).json({success: true, hub})
  })
  .catch(err => {
    res.status(err.code).json({success: false, message: err.message})
  })
})

server.delete('/hubs/:id', (req, res) => {
  const id = req.params.id; // pulls off id from req.params

  db.hubs
    .remove(id) // uses remove function in db.js
    .then(deleted => {
      res.status(204).end(); // successful delete passes back a status code and ends process
    })
    .catch(err => {
      res.status(err.code).json({ success: true, message: err.message })
    })
})

// endpoint for a get by id
server.get('/hubs/:id', (req, res) => {
  const id = req.params.id;

  db.hubs
    .findById(id) // uses findById helper function from db.js
    .then(hub => {
      if (hub) { // checks to see if hub passed in on the :id is a valid id (does it exist?)
        res.status(200).json({  // if it exists, get it and return a good status along with json msg.
          success: true,
          hub,
        });
      } else {  // send error message stating that id passed in is not found
        res.status(404).json({
          success: false,
          message: 'We cannot find the hub you are looking for',
        });
      }
    })
    .catch(err => {  // this is for an actual database error in retrieving the hub
      res.status(err.code).json({message: 'error retrieving hub' })
    });
});

// PUT endpoint - If a hub with the provided id exists, this endpoint will update it and return the updated hub. If there is no hub with the provided id, the endpoint will respond with at 404 status code and an object with an informative message.

server.put('/hubs/:id', (req, res) => {  // have to pass in the id of the hub you are updating
  const { id } = req.params;
  const changes = req.body;  // passed in as a object - use postman to build the new object

  db.hubs
    .update(id, changes) // uses the update helper function in db.js which requires two arguments: the id of the hub you want changed along with a replacement hub representing the new values
    .then(updated => {
      if (updated) { // if the hub was found AND successfully updated
        res.status(200).json({ success: true, updated }); // return good status code and message
      } else {
        res.status(404).json({ // return a 404 not found if hub is not found
          success: false,
          message: 'I cannot find the hub you are looking for',
        });
      }
    })
    .catch(({ code, message }) => { // if there was a server error updating the hub
      res.status(code).json({
        success: false,
        message,
      });
    });
});

