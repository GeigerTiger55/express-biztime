"use strict";

/** Routes for invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET /
 * - Returns a list of invoices:
 *    {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query("SELECT id, comp_code FROM invoices");
  const invoices = results.rows;

  return res.json({ invoices });
});



/** GET  /[id]
 * - Accepts id in url parameter
 * - Returns object of a single invoice:
 *    {invoice: {id, amt, paid, add_date, paid_date,
 *     company: {code, name, description}}}
 */

router.get("/:id", async function (req, res) {
  const id = req.params.id;
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id = $1`,
    [id]);
  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError(`No invoice matching id: ${id}`);

  const cResults = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code= $1`,
    [invoice.comp_code]);
  const company = cResults.rows[0];

  delete invoice.comp_code;
  invoice.company = company;

  return res.json({ invoice });
});


/** POST /
 * - Accepts JSON:
 *    {str:comp_code, number:amt}
 *
 * - Returns object of new invoice:
 *    {invoice: {id , comp_code, amt, paid, add_date, paid_date}}
 */

 router.post("/", async function (req, res) {

  const {comp_code, amt} = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);
  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
});


/** PUT /[id] - update all fields in invoice;
 * Accepts JSON {amt}
 * - Returns updated invoice:
 *  {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

 router.put("/:id", async function (req, res) {
  
  if (Object.keys(req.body).length > 1 || !("amt" in req.body)){
   throw new BadRequestError("Not allowed");
  }

  const id = req.params.id;

  const { amt } = req.body;

  const results = await db.query(
    `UPDATE invoices
         SET amt=$1
         WHERE id = $2
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ invoice });
});


/** DELETE /[id] - deletes invoice
 * - Returns json if invoice id found:
 *  {status: "deleted"}
 * - Returns 404 error if invoice id not found
*/
router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  const results = await db.query(
    "DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ status: "deleted" });
});


module.exports = router;
