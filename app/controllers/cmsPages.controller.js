const db = require("../models");
const CMS = db.cmsPages;

exports.create = async (req, res) => {
    const cmsPage = new CMS(req.body);
    cmsPage.createdBy = req.user._id;
    cmsPage
        .save(cmsPage)
        .then((data) => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            })
        });
}

exports.findOne = async (req,res)=> {
    const { slug } = req.params;

    await  CMS.findOne({slug})
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500)
                .send({
                    message: `Cannot find the page with the slug ${slug}`
                })
        })
}