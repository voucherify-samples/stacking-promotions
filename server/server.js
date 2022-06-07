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

app.post("/validate-promotion", (req, res) => {
    const stackableObject = req.body.promotionStackable;

    client.promotions.validate({ customer: stackableObject.customer, order: { amount: stackableObject.order.amount } }).then(response => {
        if (response) {
            res.status(200).send(response.promotions);
        }
    }).catch(() => {
        res.status(404).send({
            status : "error",
            message: "Validate promotion is not possible"
        });
    });
});

app.post("/validate-stackable", (req, res) => {
    const stackableObject = req.body.promotionStackable;

    client.validations.validateStackable(stackableObject).then(response => {
        if (response.valid) {
            return res.status(200).send({
                redeemables: response.redeemables,
                order      : response.order
            });
        }
        if (!response.valid) {
            return res.status(400).send({
                status : "error",
                message: "Validate is not possible or voucher is not incorrect"
            });
        }
    }).catch(() => {
        return res.status(404).send({
            status : "error",
            message: "Validate is not possible or you have used 5 possible promotions"
        });
    });
});

app.post("/redeem-stackable", (req, res) => {
    const stackableObject = req.body.promotionStackable;

    client.redemptions.redeemStackable(stackableObject).then(response => {
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