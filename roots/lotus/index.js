import auth_route from './auth.js'
import group_route from './group.js'

export default async function (app, opts) {
    app.register(auth_route, { prefix: "/auth" })
    app.register(group_route, { prefix: "/group" })

}

async function hasPermission(user_id, permission, object_id) {
    if (!user_id) return false;

    // 💫 Request comes from server itself, open bar!
    if (user_id === process.env.SECRET) return true;

    let rep;
    try {
        const user = await user_model.findById(user_id).exec();
        const group = await group_model.findById(user.group_id).exec();
        rep = group.permissions.includes(permission);
    } catch (error) {
        rep = false;
    }

    // ⚡️ Shortcut for checking ownership
    rep = object_id ? rep || isOwner(user_id, object_id) : rep;
    return rep;
};
async function isOwner(user_id, object_id) {
    let rep;
    rep = await album_model.findOne({ user_id: user_id, _id: object_id }).exec();
    rep = rep ? rep : await review_model.findOne({ user_id: user_id, _id: object_id }).exec();

    if (!rep) {
        var track = await track_model.findOne({ _id: object_id }).exec();
        rep = track ? await album_model.findOne({ user_id: user_id, _id: track.album_id }).exec() : false;
    }

    rep = rep ? rep : user_id === object_id;

    return rep
};

export { hasPermission, isOwner }