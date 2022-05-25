require("dotenv").config();
const express = require("express");
const { VoucherifyServerSide } = require("@voucherify/sdk");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const client = VoucherifyServerSide({
    applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
    secretKey    : `${process.env.VOUCHERIFY_SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [ "*" ]);
    res.append("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${process.env.PORT}`);
});

const customer = {
    "id": "test_customer_id_1"
};

const promotionTier = {
    "object": "promotion_tier",
    "id"    : "promo_0ONBGj3HnpivcjhrwZZt4zTG"
};

app.post("/remove-promo", (req, res) => {
    const emptyArray = req.body.emptyArray;
    promotionStackable.redeemables = emptyArray;
});

app.post("/validate-tier", (req, res) => {
    const orderAmount = req.body.orderAmount * 100;
    promotionStackable.order.amount = orderAmount;

    const filtered = promotionStackable.redeemables.filter(item => {
        return item.id !== promotionTier.id;
    });
    promotionStackable.redeemables = filtered;

    promotionStackable.redeemables.unshift(promotionTier);

    client.validations.validateStackable(promotionStackable).then(response => {
        if (response.valid) {
            return res.status(200).send({
                redeemables: response.redeemables,
                order      : response.order
            });
        } else {
            return res.status(400).send({
                status: response.redeemables[0].status
            });
        }
    }).catch(() => {
        return res.status(404).send({
            status : "error",
            message: "Validate is not possible"
        });
    });
});

app.post("/validate-stackable", (req, res) => {
    const voucherCode = req.body.voucherCode;
    const orderAmount = req.body.orderAmount * 100;
    promotionStackable.order.amount = orderAmount;

    if (!voucherCode) {
        return res.send({
            message: "Voucher code is required"
        });
    }

    const filtered = promotionStackable.redeemables.filter(item => {
        return item.id !== promotionTier.id && item.id !== voucherCode;
    });
    promotionStackable.redeemables = filtered;

    if (orderAmount > 4000) {
        promotionStackable.redeemables.unshift(promotionTier);
    }

    const validateStackable = () => {
        client.validations.validateStackable(promotionStackable).then(response => {
            if (response.valid) {
                return res.status(200).send({
                    redeemables: response.redeemables,
                    order      : response.order
                });
            } else {
                res.status(400).send({
                    status : "error",
                    message: "Validate is not possible"
                });
            }
        }).catch(() => {
            return res.status(404).send({
                status : "error",
                message: "Validate is not possible or you have used 5 possible promotions"
            });
        });
    };

    client.validations.validate(voucherCode, { "customer": customer, "order": { amount: orderAmount } }).then(response => {
        if (response.valid) {
            promotionStackable.redeemables.push({
                "object": "voucher",
                "id"    : voucherCode
            });
            validateStackable();
        } else {
            return res.status(404).send({
                status : "error",
                message: "Voucher not found"
            });
        }
    }).catch(() => {
        return res.status(400).send({
            status : "error",
            message: "Voucher incorrect"
        });
    });
});

app.post("/redeem-stackable", (req, res) => {
    const promoItemsArray = req.body.promoItemsArray;
    const subtotalAmount = req.body.subtotalAmount;
    promotionStackable.order.amount = subtotalAmount * 100;
    promotionStackable.redeemables = promoItemsArray;

    client.redemptions.redeemStackable(promotionStackable).then(response => {
        if (response.parent_redemption.result === "SUCCESS") {
            return res.status(200).send({
                status: "SUCCESS"
            });
        } else {
            return res.status(404).send({
                status : "error",
                message: "Redeem is not possible"
            });
        }
    }).catch(() => {
        res.status(400).send({
            status : "error",
            message: "Valid redemption"
        });
    });
});

const promotionStackable = {
    order: {
        amount: ""
    },
    "customer"   : customer,
    "redeemables": []
};