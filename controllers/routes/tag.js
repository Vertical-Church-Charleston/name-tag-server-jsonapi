const mongoose = require('mongoose');
const Tag = require('../models/tag');

const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const TagSerializer = new JSONAPISerializer('tags', {
  attributes: ['firstName', 'lastName', 'template'],
  keyForAttribute: 'camelCase',
});
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const TagDeserializer = new JSONAPIDeserializer({
  keyForAttribute: 'camelCase'
});

function getTags(req,res) {
  const query = Tag.find({});
  query.exec((err,tags) => {
    if(err) res.send(err);

    res.json(TagSerializer.serialize(tags));
  });
}

function postTag(req,res) {
  TagDeserializer.deserialize(req.body,(err,tag)=>{
    if(err){
      res.send(err);
    } else {
      let newTag = new Tag(tag);
      newTag.save((err,tag) => {
        if(err){
          res.send(err);
        } else {
          res.json(TagSerializer.serialize(tag));
        }
      });
    }
  });
}

function getTag(req,res) {
  Tag.findById(req.params.id, (err, tag) => {
    if(err) res.send(err);

    res.json(TagSerializer.serialize(tag));
  });
}

function deleteTag(req,res) {
  Tag.remove({_id: req.params.id}, (err, result) => {
    res.json(TagSerializer.serialize(result));
  });
}

function updateTag(req,res) {
  TagDeserializer.deserialize(req.body,(err,deserializedTag)=>{
    if(err){
      res.send(err);
    } else {
      Tag.findById({_id: req.params.id}, (err,returnedTag) => {
        if(err) res.send(err);
        Object.assign(returnedTag, deserializedTag).save((err,updatedTag) => {
          if(err) res.send(err);
    
          res.json(TagSerializer.serialize(updatedTag));
        });
      });
    }
  })
}

module.exports = {getTags, postTag, getTag, deleteTag, updateTag};