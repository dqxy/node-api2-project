const express = require('express');
const Posts = require("./db.js");
const router = express.Router();

router.get('/', (req, res) => {
    Posts.find()
    .then( resp => {res.status(200).json(resp);})
    .catch( err => {res.status(500).json({ error: "The posts information could not be retrieved."});
    })
})

router.get('/:id', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if (post) {res.status(200).json(post);} else {res.status(404).json({ message: `Post ${req.params.id} does not exist.`});}
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({message: "The posts information could not be retrieved."})
    });
})


router.get('/:id/comments', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if (!post) { res.status(404).json({ message: "Post not found." });
        } else {
            Posts.findPostComments(req.params.id)
            .then( comments => {
                if (!comments) {res.status(404).json({ message: "No comments for this post." });
                } else {
                    res.status(200).json(comments);
                }
            })
            .catch( err => {res.status(500).json({ error: `The comments information could not be retrieved -  ${err}`});
            })
        }
    })
    .catch(err => {
        res.status(500).json({ error: `Error retrieving post: ${err}`});
    })
})


router.post('/', (req, res) => {
    if (!req.body.title || !req.body.contents) { res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        Posts.insert(req.body)
        .then(postId => {
            Posts.findById(postId.id)
            .then( resp => {
                if (resp){
                    res.status(201).json(resp);
                } else { res.status(500).json({ error: "Error retrieving post."});
                }
            })
            .catch( err => { res.status(500).json({ error: "Error requesting post."});
            })
        })
        .catch(err => { res.status(500).json({ error: "There was an error while saving the post to the database." });
        })
    }
})


router.post('/:id/comments', (req, res) => {
    if (!req.body.text) { res.status(400).json({ errorMessage: "Please provide text for the comment." });
    } else {
        console.log(`Post ID: ${req.body.post_id}`);
        Posts.findById(req.body.post_id)
        .then(post => {
            if (!post) {res.status(404).json({ errorMessage: "Post not found." });
            } else {
                Posts.insertComment(req.body)
                .then(resp => {
                    Posts.findCommentById(resp.id)
                    .then(newComm => { res.status(201).json(newComm);
                    })
                    .catch(err => {res.status(500).json({ error: "Error retrieving comment." });
                    })
                })
                .catch(err => { res.status(500).json({ error: "There was an error while saving the comment to the database." });
                })
            }
        })
        .catch(err => {res.status(500).json({ error: "Error retrieving post." });
        })
    }
})

router.delete('/:id', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if(!post){
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        } else {
            Posts.remove(req.params.id)
            .then(resp => {
                if (resp > 0) {
                    res.status(200).json(post);
                } else {
                    res.status(401).json({ error: "The post could not be removed." });
                }
            })
            .catch(er => {
                res.status(500).json({ error: er.message });
            })
        }
    })
    .catch(err => {
        res.status(500).json({ error: "Error retrieving post." });
    })
})

router.put('/:id', (req, res) => {
    Posts.findById(req.params.id)
    .then(post => {
        if(!post){res.status(404).json({ message: "Post not found." });
        } else {
            if(!req.body.title || !req.body.contents){
                res.status(400).json({ message: "Please provide title and contents for the post." });
            } else {
                Posts.update(req.params.id, { title: req.body.title, contents: req.body.contents })
                .then(count => {
                    if(count > 0){
                        Posts.findById(req.params.id)
                        .then(nowPost => {
                            res.status(200).json(nowPost);
                        })
                        .catch(e => {
                            res.status(500).json({ error: "Unable to retrieve updated post." });
                        })
                    } else { res.status(500).json({ error: "The post information could not be modified." });
                    }
                })
                .catch(er => { res.status(500).json({ error: "The post information could not be modified." });
                })
            }
        }
    })
    .catch(err => { res.status(500).json({ error: "Post not found" });
    })
})

module.exports = router;