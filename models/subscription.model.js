import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        },
        isSubscribed: {
            type: Boolean,
            default: false,
            required: true
        },
        subscriptionType: {
            type: String,
            enum: ['Basic', 'Premium', 'VIP'] 
        }
    },
    { timestamps: true }
);

// Enable pagination support for aggregate queries
subscriptionSchema.plugin(mongooseAggregatePaginate);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
