import mongoose from 'mongoose'

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


//Content Schema

const contentSchema= new mongoose.Schema({

        admin: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User'
        },

        title: {
            type : String,
            required: true
        },

        contentFile:{
            type : String,
            required: true
        },

        description:{
            type: String,
            required: true,
        },
     
        views:{
            type: Number,
            default: 0,
            required: true,
        },

        published:{
            type:Boolean,
            default: true,
           
        },
        
        contentType:{
            type: String,
            enum: ['Video', 'Audio'],
            required: true
        }

},{timestamps: true})

contentSchema.plugin(mongooseAggregatePaginate)    // for using mongooseAggregatePaginate queries in videoschema

export const Content= mongoose.model('Content',contentSchema) // in database "contents"