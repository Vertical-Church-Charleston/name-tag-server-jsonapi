const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Handlebars = require('handlebars');
const fs = require('fs');
const conversion = require("phantom-html-to-pdf")({
  phantomPath: require("phantomjs-prebuilt").path
});
const fileUrl = require('file-url');

import each from 'async/each';

const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const TagSerializer = new JSONAPISerializer('tags', {
  attributes: ['firstName', 'lastName', 'template','__id__'],
  keyForAttribute: 'camelCase',
});
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const TagDeserializer = new JSONAPIDeserializer({
  keyForAttribute: 'camelCase'
});

export const getTags = (req,res)=>{
  const query = Tag.find({});
  query.exec((err,tags) => {
    if(err) res.send(err);

    res.json(TagSerializer.serialize(tags));
  });
}

export const postTag = (req,res)=>{
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

export const postTags = (req,res)=>{
  let tags = [];
  each(req.body.data.relationships['model-list'].data, ({attributes}, callback) => {
    let newTag = new Tag(attributes);
      newTag.save((err,tag) => {
        if(err){
          res.send(err);
          return;
        } else {
          tag.__id__ = attributes.__id__
          tags.push(tag);
          callback();
        }
      });
  }, (err) => {
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        res.send(err);
        return;
      } else {
        let serializedTags = TagSerializer.serialize(tags);
        each(serializedTags.data, ({attributes}, callback) => {
          attributes.__id__ = attributes.Id;
          delete attributes.Id;
          callback();
        }, (err) => {
          if(err){
            res.send(err);
            return;
          }else{
            res.json(serializedTags);
          }
        });
      }
  });
}

export const getTag = (req,res)=>{
  Tag.findById(req.params.id, (err, tag) => {
    if(err) res.send(err);

    res.json(TagSerializer.serialize(tag));
  });
}

export const deleteTag = (req,res,next)=>{
  Tag.remove({_id: req.params.id}, (err, result) => {
    res.sendStatus(204);
  });
}

export const updateTag = (req,res)=>{
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

export const printTags = (req,res)=>{
  const ids = req.query.ids;
  const query = Tag.find({
    _id: {
      $in: ids
    }
  });
  query.exec((err,tags) => {
    res.setHeader('Content-type', 'application/pdf');
    if(err) res.send(err);
    fs.readFile(`views/printtags.hbs`, (err, resp)=>{
      if(err){
        throw err;
      }
      const source = resp.toString();
      const template = Handlebars.compile(source);
      const result = template({tags: tags});
      conversion({ html: result, paperSize: {
        format: 'Letter',
        widt: '8.5in',
        height: '11in',
        orientation: 'portrait',
        margin: '0in'
      }}, function(err, pdf) {
        if(err) res.send(err);
        pdf.stream.pipe(res);
      });
    });
  });
}