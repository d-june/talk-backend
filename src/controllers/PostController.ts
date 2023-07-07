import express from "express";
import PostModel from "../models/Post";

class PostController {
  async index(req: any, res: express.Response) {
    const userId = req.params.id;

    PostModel.find({ user: userId })
      .populate("user")
      .then((posts) => {
        if (!posts) {
          return res.status(404).json({
            status: "error",
            message: "Message not found",
          });
        }
        return res.json(posts);
      });
  }
  create = (req: any, res: express.Response) => {
    const userId = req.user._id;

    const postData = {
      text: req.body.text,
      user: userId,
    };

    const post = new PostModel(postData);

    post
      .save()
      .then((obj: any) => {
        obj.populate("user").then((post: any) => {
          if (!post) {
            return res.status(500).json({
              status: "error",
              message: "error",
            });
          }
          return res.json(post);
        });
      })

      .catch((reason) => {
        res.json(reason);
      });
  };

  async updateLikesCount(req: any, res: any) {
    const filter = { _id: req.query.id };
    const update = { likes: req.body.likes, liked: req.body.liked };

    await PostModel.findOneAndUpdate(filter, update, {
      upsert: true,
    })
      .then((post) => {
        if (post) {
          res.json({
            message: `Likes count updated`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: "Post not found",
        });
      });
  }

  delete = (req: any, res: express.Response) => {
    const id: string = req.query.id;
    PostModel.findOneAndRemove({ _id: id })
      .then((post) => {
        if (post) {
          res.json({
            message: `Post deleted`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: "Post not found",
        });
      });
  };
}

export default PostController;
