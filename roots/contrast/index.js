import user_route from './user.js'
import group_route from './group.js'
import recording_route from './recording.js'
import sample_route from './sample.js'
import review_route from './review.js'

export default async function (app, opts) {
    app.register(user_route, { prefix: "/user" });
    app.register(group_route, { prefix: "/group" });
    app.register(recording_route, { prefix: "/recording", ky: opts.ky, ky_local: opts.ky_local });
    app.register(sample_route, { prefix: "/sample", ky: opts.ky, ky_local: opts.ky_local });
    app.register(review_route, { prefix: "/review", ky: opts.ky, ky_local: opts.ky_local });
}

import user_model from './models/User.js';
import group_model from './models/Group.js';
import recording_model from './models/Recording.js';
import sample_model from './models/Sample.js';
import review_model from './models/Review.js';

async function hasPermission(user_id, permission) {
    if (!user_id) return false;

    // 💫 Request comes from server itself, open bar!
    if (user_id === process.env.SECRET) return true;

    // Check permission based on user group
    let rep;
    try {
        const user = await user_model.findById(user_id).exec();
        const group = await group_model.findById(user.group_id).exec();
        rep = group.permissions.includes(permission) || group.permissions.includes(permission.split('.')[0] + '.*');

    } catch (error) {
        rep = false;
    }

    return rep;
};
async function isOwner(user_id, object_id) {
    if (!user_id || !object_id) return false;
    if (user_id === object_id) return true;
    
    let rep;
    rep = await recording_model.findOne({ user_id: user_id, _id: object_id }).exec();
    rep = rep ? rep : await review_model.findOne({ user_id: user_id, _id: object_id }).exec();

    if (!rep) {
        var sample = await sample_model.findOne({ _id: object_id }).exec();
        rep = sample ? await recording_model.findOne({ user_id: user_id, _id: sample.recording_id }).exec() : false;
    }

    return rep
};

export { hasPermission, isOwner }