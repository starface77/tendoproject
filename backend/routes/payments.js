const express = require("express"); const { createPayment } = require("../controllers/payments_simple"); const router = express.Router(); router.post("/", createPayment); module.exports = router;
