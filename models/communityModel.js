import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Threads",
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],
});

const Community =
    mongoose.models.Community || mongoose.model("Communitys", communitySchema);

export default Community;
