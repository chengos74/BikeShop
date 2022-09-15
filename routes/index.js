// Index.js = Inventaire des Routes

// On charge express
const { name } = require("ejs");
const express = require("express");
// router = instance de Router() à travers express
const router = express.Router();

const dataBikeVar = [
    { name: "BIK045", url: "/images/bike-1.jpg", price: 679 },
    { name: "ZOOK07", url: "/images/bike-2.jpg", price: 999 },
    { name: "TITANS", url: "/images/bike-3.jpg", price: 799 },
    { name: "CEWO", url: "/images/bike-4.jpg", price: 1300 },
    { name: "AMIG39", url: "/images/bike-5.jpg", price: 479 },
    { name: "LIK099", url: "/images/bike-6.jpg", price: 869 },
];

// Home page - Methode GET (methode = function)
router.get("/", (req, res) => {
    if (req.session.dataCardBike == undefined) {
        req.session.dataCardBike = [];
    }
    res.render("index", { title: "BikeShop - Home", dataBikeEJS: dataBikeVar });
});

router.get("/shop", (req, res) => {
    var boulet = false;
    // mise à jour du panier
    for (var i = 0; i < req.session.dataCardBike.length; i++) {
        if (req.session.dataCardBike[i].name === req.query.bikename) {
            req.session.dataCardBike[i].quantity += 1;
            boulet = true;
        }
    }

    if (boulet === false) {
        // envoie des variables dans le panier
        req.session.dataCardBike.push({
            nom: req.query.bikename,
            url: req.query.bikeimage,
            prix: req.query.bikeprice,
            quantity: 1,
        });
    }

    res.render("shop", { dataCardBikeEJS: req.session.dataCardBike });
});

router.get("/delete-shop", (req, res) => {
    // on efface avec le bouton poubelle
    req.session.dataCardBike.splice(req.query.id, 1);

    res.render("shop", { dataCardBikeEJS: req.session.dataCardBike });
});

router.post("/update-shop", (req, res) => {
    // on met à jour le panier en mettant les nombres
    // console.log(req.body.position);
    const { position } = req.body;
    const nouvelleQuantity = req.body.quantity;

    req.session.dataCardBike[position].quantity = nouvelleQuantity;

    res.render("shop", { dataCardBikeEJS: req.session.dataCardBike });
});

//stripe

// This is your test secret API key.
const stripe = require("stripe")(
    "sk_test_51LBPY7IX5XUDYS0pkRpL9ZptPWMooSSJoYiyQJ5zUIzeByJZgIXq2ma78HvVEYPby7zDSJjc5uJXuHRE9mNjwt2s00zNiovzbX"
);

const YOUR_DOMAIN = "http://localhost:3000";

router.post("/create-checkout-session", async (req, res) => {
    var itemCardBike = [];
    for (let i = 0; i < req.session.dataCardBike.length; i++) {
        itemCardBike.push({
            price_data: {
                currency: "eur",
                product_data: {
                    name: req.session.dataCardBike[i].nom,
                },
                unit_amount: req.session.dataCardBike[i].prix * 100,
            },
            quantity: req.session.dataCardBike[i].quantity,
        });
    }

    const session = await stripe.checkout.sessions.create({
        line_items: itemCardBike,
        mode: "payment",
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`,
    });

    res.redirect(303, session.url);
});

router.get("/success", (req, res) => {
    res.render("success", {
        title: "BikeShop - Home",
        dataBikeEJS: dataBikeVar,
    });
});

router.get("/cancel", (req, res) => {
    res.render("cancel", {
        title: "BikeShop - Home",
        dataBikeEJS: dataBikeVar,
    });
});

module.exports = router;
//
