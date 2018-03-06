const mongoose = require('mongoose');
const Tag = require('../models/tag');

import PDFDocument from 'pdfkit';

const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const TagSerializer = new JSONAPISerializer('tags', {
  attributes: ['firstName', 'lastName', 'template'],
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

export const makePage = (req,res)=>{
  res.render('printtags', { tags: [{"firstName":"Jordan","lastName":"Riser","template":1}, {"firstName":"Abby","lastName":"Worden","template":1}, {"firstName":"Alex","lastName":"Williams","template":1}, {"firstName":"Nathan","lastName":"Worden","template":1},{"firstName":"Jordan","lastName":"Riser","template":1}, {"firstName":"Abby","lastName":"Worden","template":1}, {"firstName":"Alex","lastName":"Williams","template":1}, {"firstName":"Nathan","lastName":"Worden","template":1},{"firstName":"Jordan","lastName":"Riser","template":1}, {"firstName":"Abby","lastName":"Worden","template":1}, {"firstName":"Alex","lastName":"Williams","template":1}, {"firstName":"Nathan","lastName":"Worden","template":1},{"firstName":"Jordan","lastName":"Riser","template":1}, {"firstName":"Abby","lastName":"Worden","template":1}, {"firstName":"Alex","lastName":"Williams","template":1}, {"firstName":"Nathan","lastName":"Worden","template":1}] })
}

export const printTags = (req,res)=>{
  const doc = new PDFDocument
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);
  doc.save()
    .moveTo(100, 150)
    .lineTo(100, 250)
    .lineTo(200, 250)
    .fill("#FF3300")
  doc.scale(0.6)
    .translate(470, -380)
    .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
    .fill('red', 'even-odd')
    .restore()
  doc.end()
  // console.log(req)
  // res.sendStatus(200)
}