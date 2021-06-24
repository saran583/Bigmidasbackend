import Active from "../../models/active/shopactive.model";

export default {
  async createactive(req, res) {
    const active = new Active({
      vendorid: req.body.vendorid,
      active: req.body.active,
      shopid: req.body.shopid,
    });

    Active.find(
      { shopid: req.body.shopid, vendorid: req.body.vendorid },
      function (err, user) {
        if (user.length != 0) {
          console.log("shopid already exists");
          return res.json({ message: "shopid already exists " });
        } else {
          Active.create(active)
            .then((Users) => res.json(Users))
            .catch((err) => res.status(500).json(err));
        }
      }
    );
  },
  async getactive(req, res) {
    let { id } = req.params;
    let splitted = id.split("&&");
    let vend = splitted[0];
    let stat = splitted[1];
    if (stat == "1") {
      Active.aggregate([
        {
          $addFields: {
            conver: { $toString: vend },
          },
        },
        { $match: { vendorid: { $eq: vend } } },
        { $match: { active: { $eq: 1 } } },
        //  {
        //       $match: {
        //         $expr: {
        //           $and: [{ $eq: [stat, vend] }],
        //         },
        //       },
        //     },
        {
          $project: {
            vendorid: "$vendorid",
            active: "$active",
            shopid: "$shopid",
            createdAt: "$createdAt",
          },
        },
      ])
        .then((result) => res.json(result))
        .catch((err) => res.status(500).json(err));
    } else {
      Active.aggregate([
        {
          $addFields: {
            conver: { $toString: vend },
          },
        },
        { $match: { vendorid: { $eq: vend } } },
        { $match: { active: { $eq: 0 } } },
        //  {
        //     $match: {
        //       $expr: {
        //         $and: [{ $eq: [stat, vend] }],
        //       },
        //     },
        //   },

        {
          $project: {
            vendorid: "$vendorid",
            active: "$active",
            shopid: "$shopid",
            createdAt: "$createdAt",
          },
        },
      ])
        .then((result) => res.json(result))
        .catch((err) => res.status(500).json(err));
    }
  },
  async editactive(req, res) {
    let { id } = req.params;
    Active.findByIdAndUpdate(
      { _id: id },
      {
        vendorid: req.body.vendorid,
        active: req.body.active,
        shopid: req.body.shopid,
      },
      { new: true }
    )
      .then((result) => {
        res.send({ msg: result });
      })
      .catch((err) => {
        res.send({ msg: err });
      });
  },
  async getallactive(req, res) {
    let { id } = req.params;
    Active.aggregate([
      { $match: { vendorid: { $eq: id } } },
      {
        $project: {
          vendorid: "$vendorid",
          active: "$active",
          shopid: "$shopid",
          createdAt: "$createdAt",
        },
      },
    ])
      .then((result) => res.json(result))
      .catch((err) => res.status(500).json(err));
  },
  async Delete(req, res) {
    let { id } = req.params;
    Active.findByIdAndRemove(id)
      .then((client) => {
        if (!client) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ err: "Could not delete any Invoice " });
        }
        return res.json(client);
      })
      .catch((err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
  },
};
